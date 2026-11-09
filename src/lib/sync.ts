// Offline-first sync. Progress and artwork are written to IndexedDB first (scoped to
// account + profile), then flushed to the server. Retries are safe:
//  - attempts carry client UUIDs (server INSERT OR IGNORE) and the content version that was shown
//  - lesson/activity state is last-writer-wins by timestamp
//  - artwork saves send baseVersion; on conflict the server keeps both copies; a retried save whose
//    first response was lost is recognised by the server (same content) and not duplicated
// Nothing private is uploaded until the server has confirmed a live session for the SAME account
// (GET /api/auth/me via the registered revalidator). If the session has expired, sync pauses and
// the app asks the parent to sign in to that account; another account never sees or uploads it.
import { api, ApiError } from './api';
import { idb } from './idb';
import { privatePrefixes, ALL_PRIVATE_PREFIXES, uploadDecision } from './offline';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';
export interface SyncInfo { pending: number; message?: string; /** waiting for a parent to sign in again */ paused?: boolean }
type Listener = (s: SyncStatus, info?: SyncInfo) => void;
const listeners = new Set<Listener>();
let status: SyncStatus = 'idle';
let pending = 0;
let paused = false;
let lastMessage: string | undefined;
export const onSync = (l: Listener) => { listeners.add(l); l(status, { pending, paused, message: lastMessage }); return () => { listeners.delete(l); }; };
const emit = (s: SyncStatus, message?: string) => { status = s; lastMessage = message; listeners.forEach((l) => l(s, { pending, message, paused })); };

let scope: { accountId: string } | null = null;
/** account id the server last confirmed for this tab (null = not yet / expired) */
let verifiedAccount: string | null = null;
/**
 * Sets whose local queue this tab works with. `verified` = the server just confirmed a session for
 * this account (online /auth/me). Offline starts pass false: work is saved locally, not uploaded.
 */
export const setSyncScope = (accountId: string | null, opts: { verified?: boolean } = {}) => {
  scope = accountId ? { accountId } : null;
  verifiedAccount = accountId && opts.verified ? accountId : null;
  paused = false;
  if (scope) void flush(); else { pending = 0; emit('idle'); }
};
export const isSyncVerified = () => !!scope && verifiedAccount === scope.accountId;
/** Re-count unsynced items (e.g. after work was saved) and notify listeners. */
export async function refreshPending() { if (scope) { pending = await countPending(scope.accountId); emit(status, lastMessage); } }

/** The app registers GET /auth/me here; sync calls it before uploading after a reconnect/retry. */
let revalidator: (() => Promise<void>) | null = null;
export const setRevalidator = (fn: (() => Promise<void>) | null) => { revalidator = fn; };
let authLost: ((accountId: string) => void) | null = null;
/** Called when an upload is refused because the session ended (so the app can prompt sign-in). */
export const onAuthLost = (fn: ((accountId: string) => void) | null) => { authLost = fn; };

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
/** @deprecated the offline window now lives in the entitlement (lib/offline.ts); kept for callers */
export const OFFLINE_DAYS = 14;
export const snapKey = (accountId: string, what: string) => `snap:${accountId}:${what}`;
export async function saveSnapshot(accountId: string, what: string, data: unknown) { await idb.set(snapKey(accountId, what), { data, at: Date.now() }); }
/** Snapshots are only usable while the offline entitlement is valid (checked by the caller). */
export async function loadSnapshot<T>(accountId: string, what: string): Promise<T | null> {
  const s = await idb.get<{ data: T; at: number }>(snapKey(accountId, what)).catch(() => undefined);
  return s ? s.data : null;
}

// ---------------- flushing ----------------
let timer: ReturnType<typeof setTimeout> | null = null;
let backoff = 2000;
let running = false;
function schedule(delay = 800) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void flush(), delay);
}
let revalidating: Promise<void> | null = null;
/** Re-check the server session (same account) and then upload. Used on reconnect, reopen and Retry. */
export function revalidateAndFlush(): Promise<void> {
  if (!revalidator) return flush();
  revalidating ??= revalidator().catch(() => undefined).finally(() => { revalidating = null; });
  return revalidating.then(() => flush());
}
let lastForeground = 0;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('online', () => { backoff = 2000; verifiedAccount = null; void revalidateAndFlush(); });
  window.addEventListener('offline', () => emit('offline'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { void flush(); return; }
    // foreground sync when the app is brought back (at most every 20 s)
    if (navigator.onLine && Date.now() - lastForeground > 20_000) { lastForeground = Date.now(); void revalidateAndFlush(); }
  });
}

export async function countPending(accountId: string) {
  const q = await idb.keys(`q:${accountId}:`);
  const arts = (await Promise.all((await idb.keys(`art:${accountId}:`)).map((k) => idb.get<ArtDraft>(k)))).filter((d) => d?.dirty);
  return q.length + arts.length;
}

let again = false;
/** Uploads the queue. Only one flush runs at a time (the guard is taken before any await, so two
 *  triggers — e.g. reconnect + revalidation — can never send the same artwork twice). */
export async function flush(): Promise<void> {
  if (!scope) return;
  if (running) { again = true; return; }
  running = true;
  try { await flushOnce(); } finally {
    running = false;
    if (again) { again = false; schedule(50); }
  }
}

async function flushOnce(): Promise<void> {
  if (!scope) return;
  const acct = scope.accountId;
  pending = await countPending(acct);
  const decision = uploadDecision({ scopeAccountId: acct, verifiedAccountId: verifiedAccount, online: navigator.onLine });
  if (!pending) { paused = false; emit(status === 'saving' || status === 'error' || (status === 'offline' && navigator.onLine) ? 'saved' : status); return; }
  if (decision === 'offline') { emit('offline'); return; }
  if (decision === 'needs-signin') {
    // Do not upload private changes until the server confirms this account again.
    paused = true;
    emit('error', 'Saved on this device. Waiting for a parent to sign in again before uploading.');
    return;
  }
  paused = false;
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
      // Continued edits of a draft that already conflicted (e.g. the studio stayed open on it) belong
      // to the preserved copy: move them there instead of creating yet another conflict copy.
      const redir = await idb.get<{ copyId: string; staleBase: number }>(`artr:${acct}:${pid}:${d.id}`);
      if (redir && d.baseVersion <= redir.staleBase) {
        const copyKey = `art:${acct}:${pid}:${redir.copyId}`;
        const copy = await idb.get<ArtDraft>(copyKey);
        await idb.set(copyKey, { ...d, id: redir.copyId, title: copy?.title ?? d.title, baseVersion: copy?.baseVersion ?? 1, dirty: true, conflictOf: d.id });
        await idb.del(k);
        continue;
      }
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
          await idb.set(`artr:${acct}:${pid}:${d.id}`, { copyId, staleBase: d.baseVersion });
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
    if (e instanceof ApiError && e.status === 401) {
      // Session ended: keep everything, pause, ask a parent to sign in to this account again.
      verifiedAccount = null;
      paused = true;
      pending = await countPending(acct);
      emit('error', 'Saved on this device. Sign in again to upload.');
      authLost?.(acct);
    } else {
      emit(offline ? 'offline' : 'error', offline ? undefined : (e as Error).message);
      schedule(backoff); backoff = Math.min(backoff * 2, 60_000);
    }
  }
}
/** Explicit Retry: re-check the session first, then upload. */
export const retrySync = () => { backoff = 2000; return revalidateAndFlush(); };

/** Removes this account's private local data. Returns false if unsynced work exists and force=false. */
export async function clearAccountData(accountId: string, force = false) {
  if (!force && (await countPending(accountId)) > 0) return false;
  await idb.clearPrefixes(privatePrefixes(accountId));
  return true;
}
/** Unsynced items of every account on this device. */
export async function pendingOnDevice() {
  const ks = await idb.keys('');
  const accts = new Set(ks.filter((k) => k.startsWith('q:') || k.startsWith('art:')).map((k) => k.split(':')[1]));
  let n = 0;
  for (const a of accts) n += await countPending(a);
  return n;
}
/** "Remove this device's data": every account's private records (static packs/TTS handled elsewhere). */
export async function clearAllPrivateData(force = false) {
  if (!force && (await pendingOnDevice()) > 0) return false;
  await idb.clearPrefixes(ALL_PRIVATE_PREFIXES);
  return true;
}
export async function clearProfileData(accountId: string, pid: string) {
  await idb.clearPrefixes([`q:${accountId}:${pid}:`, `art:${accountId}:${pid}:`, `artr:${accountId}:${pid}:`, `snap:${accountId}:${pid}:`, `dl:${accountId}:${pid}:`]);
}
