// Offline-first sync. Progress and artwork are written to IndexedDB first (scoped to
// account + profile), then flushed to the server. Retries are safe:
//  - attempts carry client UUIDs (server INSERT OR IGNORE)
//  - lesson/activity state is last-writer-wins by timestamp
//  - artwork saves send baseVersion; on conflict the server keeps both copies
import { api, ApiError } from './api';
import { idb } from './idb';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';
type Listener = (s: SyncStatus, info?: { pending: number; message?: string }) => void;
const listeners = new Set<Listener>();
let status: SyncStatus = 'idle';
let pending = 0;
export const onSync = (l: Listener) => { listeners.add(l); l(status, { pending }); return () => { listeners.delete(l); }; };
const emit = (s: SyncStatus, message?: string) => { status = s; listeners.forEach((l) => l(s, { pending, message })); };

let scope: { accountId: string } | null = null;
export const setSyncScope = (accountId: string | null) => { scope = accountId ? { accountId } : null; if (scope) void flush(); };
const P = (pid: string) => `q:${scope!.accountId}:${pid}:`;

export interface QueuedAttempt {
  id: string; questionId: string; questionVersion: number; objectiveId: string;
  mode: 'learn' | 'practice' | 'test' | 'game' | 'diagnostic'; correct: boolean; response?: unknown; hintsUsed: number; durationMs?: number; at: number;
}
export async function queueAttempt(pid: string, a: QueuedAttempt) { await idb.set(`${P(pid)}attempt:${a.id}`, a); schedule(); }
export async function queueLessonState(pid: string, lessonId: string, state: unknown) { await idb.set(`${P(pid)}lesson:${lessonId}`, { state, updatedAt: Math.floor(Date.now() / 1000) }); schedule(); }
export async function queueActivityState(pid: string, activityId: string, state: unknown) { await idb.set(`${P(pid)}activity:${activityId}`, { state, updatedAt: Math.floor(Date.now() / 1000) }); schedule(); }
export async function queueReward(pid: string, rewardId: string) { await idb.set(`${P(pid)}reward:${rewardId}`, 1); schedule(); }

// ---------------- artwork drafts ----------------
export interface ArtDraft {
  id: string; title: string; data: unknown; thumb?: string;
  baseVersion: number; // last server version this draft is based on (0 = never saved)
  dirty: boolean; updatedAt: number; conflictOf?: string;
}
const artKey = (pid: string, id: string) => `art:${scope!.accountId}:${pid}:${id}`;
export async function saveArtDraft(pid: string, d: ArtDraft) { await idb.set(artKey(pid, d.id), { ...d, dirty: true, updatedAt: Date.now() }); schedule(0); }
export const getArtDraft = (pid: string, id: string) => idb.get<ArtDraft>(artKey(pid, id));
export async function listArtDrafts(pid: string) {
  const ks = await idb.keys(`art:${scope!.accountId}:${pid}:`);
  return (await Promise.all(ks.map((k) => idb.get<ArtDraft>(k)))).filter(Boolean) as ArtDraft[];
}
export const deleteArtDraft = (pid: string, id: string) => idb.del(artKey(pid, id));

// ---------------- snapshots for offline start ----------------
export const OFFLINE_DAYS = 14; // previously authorised devices may work offline this long
export const snapKey = (accountId: string, what: string) => `snap:${accountId}:${what}`;
export async function saveSnapshot(accountId: string, what: string, data: unknown) { await idb.set(snapKey(accountId, what), { data, at: Date.now() }); }
export async function loadSnapshot<T>(accountId: string, what: string, maxAgeDays = OFFLINE_DAYS): Promise<T | null> {
  const s = await idb.get<{ data: T; at: number }>(snapKey(accountId, what));
  if (!s || Date.now() - s.at > maxAgeDays * 86400_000) return null;
  return s.data;
}

// ---------------- flushing ----------------
let timer: ReturnType<typeof setTimeout> | null = null;
let backoff = 2000;
let running = false;
function schedule(delay = 800) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void flush(), delay);
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { backoff = 2000; void flush(); });
  window.addEventListener('offline', () => emit('offline'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flush(); });
}

export async function countPending(accountId: string) {
  const q = await idb.keys(`q:${accountId}:`);
  const arts = (await Promise.all((await idb.keys(`art:${accountId}:`)).map((k) => idb.get<ArtDraft>(k)))).filter((d) => d?.dirty);
  return q.length + arts.length;
}

export async function flush(): Promise<void> {
  if (!scope || running) return;
  const acct = scope.accountId;
  pending = await countPending(acct);
  if (!pending) { emit(status === 'saving' ? 'saved' : status === 'offline' && navigator.onLine ? 'saved' : status); return; }
  if (!navigator.onLine) { emit('offline'); return; }
  running = true;
  emit('saving');
  try {
    const keys = await idb.keys(`q:${acct}:`);
    const byProfile = new Map<string, string[]>();
    for (const k of keys) { const pid = k.split(':')[2]; byProfile.set(pid, [...(byProfile.get(pid) || []), k]); }
    for (const [pid, ks] of byProfile) {
      const att = ks.filter((k) => k.includes(':attempt:'));
      for (let i = 0; i < att.length; i += 100) {
        const chunk = att.slice(i, i + 100);
        const items = (await Promise.all(chunk.map((k) => idb.get<QueuedAttempt>(k)))).filter(Boolean);
        await api(`/p/${pid}/attempts`, { body: { attempts: items } });
        for (const k of chunk) await idb.del(k);
      }
      for (const k of ks.filter((k) => k.includes(':lesson:') || k.includes(':activity:'))) {
        const v = await idb.get<{ state: unknown; updatedAt: number }>(k);
        const [, , , kind, ...rest] = k.split(':');
        await api(`/p/${pid}/${kind === 'lesson' ? 'lessons' : 'activities'}/${encodeURIComponent(rest.join(':'))}`, { method: 'PUT', body: v });
        // only delete if not overwritten meanwhile
        const again = await idb.get<{ updatedAt: number }>(k);
        if (again && again.updatedAt === v?.updatedAt) await idb.del(k);
      }
      const rw = ks.filter((k) => k.includes(':reward:'));
      if (rw.length) { await api(`/p/${pid}/rewards`, { body: { rewardIds: rw.map((k) => k.split(':reward:')[1]) } }); for (const k of rw) await idb.del(k); }
    }
    // artwork
    for (const k of await idb.keys(`art:${acct}:`)) {
      const d = await idb.get<ArtDraft>(k);
      if (!d || !d.dirty) continue;
      const pid = k.split(':')[2];
      try {
        const r = await api<{ version: number }>(`/p/${pid}/artworks/${d.id}`, { method: 'PUT', body: { title: d.title, data: d.data, thumb: d.thumb, baseVersion: d.baseVersion } });
        const cur = await idb.get<ArtDraft>(k);
        if (cur && cur.updatedAt === d.updatedAt) await idb.set(k, { ...cur, dirty: false, baseVersion: r.version });
        else if (cur) await idb.set(k, { ...cur, baseVersion: r.version }); // newer local edits remain dirty
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && e.body.conflictCopyId) {
          // Server kept both. Our local copy now corresponds to the preserved copy.
          const copyId = String(e.body.conflictCopyId);
          await idb.del(k);
          await idb.set(`art:${acct}:${pid}:${copyId}`, { ...d, id: copyId, baseVersion: 1, dirty: false, conflictOf: d.id });
          window.dispatchEvent(new CustomEvent('wl-art-conflict', { detail: { pid, originalId: d.id, copyId } }));
        } else throw e;
      }
    }
    backoff = 2000;
    pending = await countPending(acct);
    emit(pending ? 'saving' : 'saved');
    if (pending) schedule(500);
  } catch (e) {
    const offline = e instanceof ApiError && e.status === 0;
    emit(offline ? 'offline' : 'error', offline ? undefined : (e as Error).message);
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) { /* signed out: keep queue for next sign-in */ }
    else { schedule(backoff); backoff = Math.min(backoff * 2, 60_000); }
  } finally {
    running = false;
  }
}
export const retrySync = () => { backoff = 2000; return flush(); };

/** Removes this account's private cached data. Returns false if unsynced work exists and force=false. */
export async function clearAccountData(accountId: string, force = false) {
  if (!force && (await countPending(accountId)) > 0) return false;
  await idb.clearPrefix(`q:${accountId}:`);
  await idb.clearPrefix(`art:${accountId}:`);
  await idb.clearPrefix(`snap:${accountId}:`);
  await idb.clearPrefix(`dl:${accountId}:`);
  return true;
}
export async function clearProfileData(accountId: string, pid: string) {
  await idb.clearPrefix(`q:${accountId}:${pid}:`);
  await idb.clearPrefix(`art:${accountId}:${pid}:`);
  await idb.clearPrefix(`snap:${accountId}:${pid}`);
  await idb.clearPrefix(`dl:${accountId}:${pid}:`);
}
