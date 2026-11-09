// Offline pack download manager (one per tab). Static files only — nothing private is cached here.
//  - Files go into the cache of the build they belong to (wl-build-<build>); the service worker
//    serves them offline and uses /__wl/ready (wl-meta) to pick the page for offline navigations.
//  - A pack is "available offline" only after every one of its files was found in Cache Storage.
//  - Interrupted downloads resume: the job is kept in IndexedDB and files already cached are skipped.
//  - A new deploy is STAGED into a new build cache (unchanged files copied from the old cache); the
//    old cache stays in use until the new one fully verified. Quota errors keep the old one.
import { useSyncExternalStore } from 'react';
import { api } from '../../lib/api';
import { idb } from '../../lib/idb';
import {
  INDEX_KEY, bytesFor, downloadPrecheck, emptyInstalled, filesFor, fontUrls, isManifest, needsUpdate, packState,
  type Installed, type PackManifest, type StorageInfo,
} from './plan';

declare const __BUILD_ID__: string;
/** Build of the code running in this tab ('dev' under the Vite dev server / tests). */
export const RUNNING_BUILD = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'dev';

const META = 'wl-meta';
const buildCache = (b: string) => `wl-build-${b}`;
const INST_KEY = 'pk:installed';
const JOB_KEY = 'pk:job';

export interface Job { build: string; packIds: string[]; staging: boolean; startedAt: number; profileId?: string; /** one automatic retry pass already used */ retried?: boolean }
export interface Progress {
  phase: 'idle' | 'downloading' | 'paused' | 'done' | 'error';
  label?: string; done: number; total: number; bytesDone: number; bytesTotal: number; errors: string[]; message?: string;
}
export interface Prompt { kind: 'metered' | 'storage'; packIds: string[]; bytes: number; free: number; lessonsOnly: string[]; lessonsBytes: number; profileId?: string }
export interface MgrState {
  loaded: boolean; manifest: PackManifest | null; installed: Installed; progress: Progress; job: Job | null;
  persisted: boolean | null; storage: StorageInfo; prompt: Prompt | null; readyBuild: string | null;
}

const idle = (): Progress => ({ phase: 'idle', done: 0, total: 0, bytesDone: 0, bytesTotal: 0, errors: [] });
let state: MgrState = { loaded: false, manifest: null, installed: emptyInstalled(), progress: idle(), job: null, persisted: null, storage: {}, prompt: null, readyBuild: null };
const subs = new Set<() => void>();
const set = (p: Partial<MgrState>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
const setProgress = (p: Partial<Progress>) => set({ progress: { ...state.progress, ...p } });
export const getDownloads = () => state;
export const subscribeDownloads = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function useDownloads() { return useSyncExternalStore(subscribeDownloads, getDownloads, getDownloads); }

const hasCaches = () => typeof caches !== 'undefined';
const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

async function saveInstalled(inst: Installed) { await idb.set(INST_KEY, inst); set({ installed: inst }); }
async function setReady(build: string) {
  const c = await caches.open(META);
  await c.put('/__wl/ready', new Response(JSON.stringify({ build, at: Date.now() }), { headers: { 'Content-Type': 'application/json' } }));
  set({ readyBuild: build });
}
async function readReady(): Promise<string | null> {
  try { const r = await (await caches.open(META)).match('/__wl/ready'); return r ? ((await r.json()) as { build: string }).build : null; } catch { return null; }
}

export async function refreshStorage() {
  const storage: StorageInfo = navigator.storage?.estimate ? await navigator.storage.estimate().catch(() => ({})) : {};
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted().catch(() => null) : null;
  set({ storage, persisted });
}
/** Ask the browser not to evict downloaded packs and unsynced work under storage pressure. */
export async function requestPersistence() {
  if (!navigator.storage?.persist) return null;
  const ok = await navigator.storage.persist().catch(() => false);
  set({ persisted: ok });
  return ok;
}

async function loadManifest(): Promise<PackManifest | null> {
  if (online()) {
    try {
      const r = await fetch('/packs.json', { cache: 'no-store' });
      const j: unknown = r.ok ? await r.json() : null;
      if (isManifest(j)) {
        if (hasCaches()) await (await caches.open(META)).put(`/__wl/packs-${j.build}.json`, new Response(JSON.stringify(j))).catch(() => undefined);
        return j;
      }
    } catch { /* offline: fall back to the stored copy */ }
  }
  const b = state.installed.build || state.readyBuild;
  if (b && hasCaches()) {
    const r = await (await caches.open(META)).match(`/__wl/packs-${b}.json`).catch(() => undefined);
    if (r) { const j: unknown = await r.json(); if (isManifest(j)) return j; }
  }
  return null;
}

let initP: Promise<void> | null = null;
/** Loads what is installed, re-verifies it against Cache Storage (eviction) and fetches the manifest. */
export function initDownloads() {
  initP ??= (async () => {
    if (!hasCaches()) { set({ loaded: true }); return; }
    const inst = (await idb.get<Installed>(INST_KEY).catch(() => undefined)) || emptyInstalled();
    set({ installed: inst, readyBuild: await readReady(), job: (await idb.get<Job>(JOB_KEY).catch(() => undefined)) || null });
    const man = await loadManifest();
    set({ manifest: man });
    await verifyInstalled(man);
    await refreshStorage();
    set({ loaded: true });
  })();
  return initP;
}
export async function reloadManifest() { set({ manifest: await loadManifest() }); }

/** Drops packs whose files were evicted (browser storage pressure / cleared data). */
async function verifyInstalled(man: PackManifest | null) {
  const inst = state.installed;
  if (!inst.build) return;
  const builtMan = man && man.build === inst.build ? man : await (async () => {
    const r = await (await caches.open(META)).match(`/__wl/packs-${inst.build}.json`).catch(() => undefined);
    const j: unknown = r ? await r.json() : null;
    return isManifest(j) ? j : null;
  })();
  if (!builtMan) return;
  const c = await caches.open(buildCache(inst.build));
  const missing = async (files: string[]) => { for (const f of files) if (!(await c.match(f))) return true; return false; };
  const next: Installed = { ...inst, packs: { ...inst.packs } };
  let changed = false;
  if (inst.shell && (await missing(filesFor(builtMan, [], true)))) { next.shell = false; changed = true; }
  for (const id of Object.keys(inst.packs)) if (await missing(filesFor(builtMan, [id], false))) { delete next.packs[id]; changed = true; }
  if (changed) {
    await saveInstalled(next);
    setProgress({ phase: 'error', message: 'Some downloaded files were removed by the browser (storage was cleared or low). Download them again to use them offline.' });
  }
}

// ---------------- downloading ----------------
let abort = false;
let running: Promise<void> | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => { if (running) abort = true; });
  window.addEventListener('online', () => { void resumeDownloads(); });
}

/**
 * Download (or update) packs. Returns 'prompt' when the parent must confirm first (metered
 * connection or low storage), 'started', or 'nothing' when everything is already verified.
 */
export async function ensurePacks(packIds: string[], opts: { confirmed?: boolean; profileId?: string } = {}): Promise<'prompt' | 'started' | 'nothing' | 'offline'> {
  await initDownloads();
  if (!online()) return 'offline';
  if (!state.manifest || state.manifest.build !== RUNNING_BUILD) await reloadManifest();
  const man = state.manifest;
  if (!man) { setProgress({ phase: 'error', message: 'Download information is not available (development server). Build the app to use offline packs.' }); return 'nothing'; }
  const inst = state.installed;
  const staging = needsUpdate(man, inst);
  const wanted = [...new Set([...packIds.filter((id) => man.packs.some((p) => p.id === id)), ...(staging ? Object.keys(inst.packs).filter((id) => man.packs.some((p) => p.id === id)) : [])])];
  const todo = wanted.filter((id) => packState(man, inst, id) !== 'ready');
  const needShell = staging || !inst.shell || inst.build !== man.build;
  if (!todo.length && !needShell && inst.fonts) return 'nothing';
  if (!opts.confirmed) {
    await refreshStorage();
    const bytes = bytesFor(man, todo, needShell);
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; type?: string } }).connection;
    const pre = downloadPrecheck(net, state.storage, bytes);
    if (pre.metered || pre.lowStorage) {
      const lessonsOnly = todo.filter((id) => id.startsWith('lessons-'));
      set({ prompt: { kind: pre.lowStorage ? 'storage' : 'metered', packIds: todo, bytes, free: pre.free, lessonsOnly, lessonsBytes: bytesFor(man, lessonsOnly, needShell), profileId: opts.profileId } });
      return 'prompt';
    }
  }
  set({ prompt: null });
  const job: Job = { build: man.build, packIds: staging ? wanted : todo, staging, startedAt: Date.now(), profileId: opts.profileId };
  // merge with an unfinished job for the same build
  if (state.job && state.job.build === job.build) job.packIds = [...new Set([...state.job.packIds, ...job.packIds])];
  await idb.set(JOB_KEY, job);
  set({ job });
  void runJob();
  return 'started';
}
export const dismissPrompt = () => set({ prompt: null });

/** Continue an interrupted download (called on start, on reconnect and by Retry). */
export async function resumeDownloads() {
  await initDownloads();
  if (!online() || running || !state.job) return;
  if (!state.manifest || state.manifest.build !== state.job.build) await reloadManifest();
  if (state.manifest && state.manifest.build !== state.job.build) {
    // a newer deploy arrived: restart the job against it (staging keeps the old build usable)
    const { packIds: ids, profileId } = state.job;
    await idb.del(JOB_KEY); set({ job: null });
    await ensurePacks(ids, { confirmed: true, profileId });
    return;
  }
  void runJob();
}

function runJob() {
  running ??= doRun().finally(() => { running = null; });
  return running;
}

const isQuota = (e: unknown) => e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);

async function fetchInto(c: Cache, cacheName: string, url: string, man: PackManifest) {
  if (url === INDEX_KEY) {
    const r = await fetch('/', { cache: 'no-store', credentials: 'same-origin' });
    if (!r.ok) throw new Error(`page ${r.status}`);
    const html = await r.text();
    if (man.entry && !html.includes(man.entry)) throw new Error('build-changed');
    await c.put(INDEX_KEY, new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    return html.length;
  }
  // unchanged files from an older build cache (same hashed URL) are copied, not re-downloaded
  for (const k of await caches.keys()) {
    if (!k.startsWith('wl-build-') || k === cacheName) continue;
    const hit = await (await caches.open(k)).match(url);
    if (hit && hit.ok) { await c.put(url, hit); return 0; }
  }
  let last: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`${url} → ${r.status}`);
      const len = Number(r.headers.get('Content-Length') || 0);
      await c.put(url, r);
      return len;
    } catch (e) {
      if (isQuota(e) || abort || !online()) throw e;
      last = e;
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }
  throw last;
}

async function doRun() {
  const job = state.job;
  const man = state.manifest;
  if (!job || !man || man.build !== job.build) return;
  abort = false;
  void requestPersistence();
  const cacheName = buildCache(job.build);
  const c = await caches.open(cacheName);
  const units: { id: string; label: string; files: string[]; bytes: number }[] = [];
  const inst = state.installed;
  const needShell = job.staging || !inst.shell || inst.build !== man.build;
  if (needShell) units.push({ id: '__shell', label: 'App', files: filesFor(man, [], true), bytes: man.shell.bytes });
  for (const id of job.packIds) {
    const p = man.packs.find((x) => x.id === id);
    if (p) units.push({ id, label: id, files: filesFor(man, [id], false), bytes: p.bytes });
  }
  const total = units.reduce((s, u) => s + u.files.length, 0) + (inst.fonts && !job.staging ? 0 : man.fonts.length);
  const bytesTotal = units.reduce((s, u) => s + u.bytes, 0);
  set({ progress: { phase: 'downloading', done: 0, total, bytesDone: 0, bytesTotal, errors: [], label: units[0]?.label } });
  let done = 0, bytesDone = 0;
  const errors: string[] = [];
  const verified: Installed = job.staging ? { build: job.build, shell: false, fonts: false, packs: {} } : { ...state.installed, packs: { ...state.installed.packs } };
  if (!job.staging && verified.build !== job.build) { verified.build = job.build; verified.shell = false; verified.packs = {}; verified.fonts = false; }
  try {
    for (const u of units) {
      if (abort) break;
      setProgress({ label: u.label });
      let failed = false;
      const queue = [...u.files];
      const worker = async () => {
        while (queue.length && !abort) {
          const f = queue.shift()!;
          try {
            if (!(await c.match(f))) await fetchInto(c, cacheName, f, man);
          } catch (e) {
            if (isQuota(e)) throw e;
            if ((e as Error).message === 'build-changed') throw e;
            if (abort || !online()) { abort = true; return; }
            failed = true;
            errors.push(`${f}: ${(e as Error).message}`);
          }
          done++;
          setProgress({ done, errors: [...errors] });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (abort) break;
      // verify every file of this unit is really in Cache Storage before declaring it available
      let ok = !failed;
      for (const f of u.files) if (!(await c.match(f))) { ok = false; break; }
      bytesDone += u.bytes;
      setProgress({ bytesDone });
      if (!ok) continue;
      if (u.id === '__shell') verified.shell = true;
      else {
        verified.packs[u.id] = { version: man.packs.find((p) => p.id === u.id)!.version, verifiedAt: Date.now(), bytes: u.bytes };
        if (job.profileId) void api(`/p/${job.profileId}/downloads/${u.id}`, { method: 'PUT', body: { version: verified.packs[u.id].version } }).catch(() => undefined);
      }
      if (!job.staging) {
        await saveInstalled({ ...verified, packs: { ...verified.packs } }); // other packs become available as each one finishes
        if (u.id === '__shell') await setReady(job.build);
      }
    }
    if (!abort && (!inst.fonts || job.staging)) {
      verified.fonts = await cacheFonts(c, man, () => { done++; setProgress({ done }); }, errors);
      if (!job.staging) await saveInstalled({ ...verified, packs: { ...verified.packs } });
    }
  } catch (e) {
    if (isQuota(e)) {
      if (job.staging) await caches.delete(cacheName).catch(() => undefined); // free space; old build stays
      setProgress({ phase: 'error', errors, message: job.staging
        ? 'Not enough storage to download the update. The previous offline version is still available. Free some space and try again.'
        : 'This device is out of storage. Remove other packs or free some space, then try again.' });
      await refreshStorage();
      return;
    }
    if ((e as Error).message === 'build-changed') {
      // WonderLab was updated while downloading: restart against the new version
      await reloadManifest();
      await idb.del(JOB_KEY); set({ job: null });
      await ensurePacks(job.packIds, { confirmed: true, profileId: job.profileId });
      return;
    }
    errors.push((e as Error).message);
  }
  if (abort) {
    setProgress({ phase: 'paused', message: 'Download paused — it will continue when you are back online.' });
    return;
  }
  if (job.staging) {
    const allOk = verified.shell && job.packIds.every((id) => verified.packs[id]);
    if (allOk) {
      await saveInstalled(verified);
      await setReady(job.build);
      await cleanupOldBuilds([job.build, RUNNING_BUILD]);
    } else {
      setProgress({ phase: 'error', errors, message: 'The update could not be downloaded completely. The previous offline version is still in use. Try again later.' });
      await refreshStorage();
      return;
    }
  } else {
    await cleanupOldBuilds([job.build, RUNNING_BUILD]);
  }
  if (state.job && state.job !== job) {
    // more packs were requested while this run was in progress
    setTimeout(() => void runJob(), 0);
    return;
  }
  if (errors.length && !job.retried && online()) {
    // one automatic second pass (cached files are skipped) before asking the user to retry
    const again: Job = { ...job, retried: true };
    await idb.set(JOB_KEY, again);
    set({ job: again });
    setTimeout(() => void runJob(), 1500);
    return;
  }
  if (errors.length) {
    setProgress({ phase: 'error', errors, message: `${errors.length} item${errors.length === 1 ? '' : 's'} could not be downloaded. Try again.` });
  } else {
    await idb.del(JOB_KEY);
    set({ job: null });
    setProgress({ phase: 'done', message: undefined, errors: [] });
  }
  await refreshStorage();
}

async function cacheFonts(c: Cache, man: PackManifest, tick: () => void, errors: string[]) {
  let ok = true;
  for (const css of man.fonts) {
    try {
      let res = await c.match(css);
      if (!res) {
        const r = await fetch(css, { mode: 'cors', credentials: 'omit' });
        if (!r.ok) throw new Error(`fonts ${r.status}`);
        await c.put(css, r.clone());
        res = r;
      }
      const text = await res.text();
      for (const f of fontUrls(text)) {
        if (await c.match(f)) continue;
        const r = await fetch(f, { mode: 'cors', credentials: 'omit' });
        if (r.ok) await c.put(f, r); else ok = false;
      }
    } catch (e) {
      ok = false;
      errors.push(`Fonts: ${(e as Error).message} (the app uses the device's fonts offline)`);
    }
    tick();
  }
  return ok;
}

/** Deletes caches of builds that are neither the verified one nor the one running in this tab. */
async function cleanupOldBuilds(keep: string[]) {
  const ready = await readReady();
  const keepNames = new Set([...keep, ready].filter(Boolean).map((b) => buildCache(b!)));
  for (const k of await caches.keys()) {
    if ((k.startsWith('wl-build-') && !keepNames.has(k)) || k.startsWith('wl-packs-')) await caches.delete(k);
  }
}

/** Removes one pack's files (those not shared with the shell or another installed pack). */
export async function removePack(id: string, profileId?: string) {
  await initDownloads();
  const inst = state.installed;
  const man = state.manifest;
  const next: Installed = { ...inst, packs: { ...inst.packs } };
  delete next.packs[id];
  await saveInstalled(next);
  if (man && inst.build) {
    const keep = new Set(filesFor(man, Object.keys(next.packs), true));
    const c = await caches.open(buildCache(inst.build));
    await Promise.all(filesFor(man, [id], false).filter((f) => !keep.has(f)).map((f) => c.delete(f)));
  }
  if (profileId) await api(`/p/${profileId}/downloads/${id}`, { method: 'DELETE' }).catch(() => undefined);
  await refreshStorage();
}

/** Removes every downloaded pack and cached page (keeps generated narration — it is not private). */
export async function removeAllPacks() {
  abort = true;
  if (hasCaches()) for (const k of await caches.keys()) if (k.startsWith('wl-') && !k.startsWith('wl-tts-')) await caches.delete(k);
  await idb.clearPrefixes(['pk:']).catch(() => undefined);
  set({ installed: emptyInstalled(), job: null, readyBuild: null, progress: idle(), prompt: null });
  await refreshStorage();
}

// ---------------- test hooks (vitest) ----------------
export const __test = { setState: (p: Partial<MgrState>) => set(p) };
