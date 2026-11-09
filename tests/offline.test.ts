// Offline entitlement, expiry, data scoping, sync pause/revalidation and pack planning.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authorizedProfiles, clampDays, createEntitlement, daysLeft, entitlementState, keyAccount, privatePrefixes, renewEntitlement, uploadDecision,
  OFFLINE_DEFAULT_DAYS, OFFLINE_MAX_DAYS,
} from '../src/lib/offline';
import {
  bytesFor, downloadPrecheck, emptyInstalled, filesFor, fontUrls, INDEX_KEY, isManifest, needsUpdate, packState, packsForClass, packsForPath, readiness,
  type PackManifest,
} from '../src/features/downloads/plan';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 1);
const base = () => createEntitlement({ accountId: 'acctA', username: 'mum', deviceId: 'dev1', profileIds: ['p1', 'p2', 'p1'], sharedSession: false, now: T0 });

describe('offline entitlement', () => {
  it('defaults to a 14-day window bound to device + account + profiles, with no secrets', () => {
    const e = base();
    expect(e.days).toBe(OFFLINE_DEFAULT_DAYS);
    expect(e.expiresAt - T0).toBe(14 * DAY);
    expect(e.profileIds).toEqual(['p1', 'p2']);
    expect(Object.keys(e).sort()).toEqual(['accountId', 'days', 'deviceId', 'enabledAt', 'expiresAt', 'lastVerifiedAt', 'profileIds', 'sharedSession', 'username', 'v']);
    for (const bad of ['token', 'password', 'cookie', 'secret']) expect(JSON.stringify(e).toLowerCase()).not.toContain(bad);
  });
  it('is valid inside the window and expired after it', () => {
    const e = base();
    expect(entitlementState(e, { deviceId: 'dev1', accountId: 'acctA', now: T0 + 13 * DAY })).toBe('valid');
    expect(entitlementState(e, { deviceId: 'dev1', accountId: 'acctA', now: T0 + 14 * DAY })).toBe('expired');
    expect(entitlementState(e, { deviceId: 'dev1', accountId: 'acctA', now: T0 + 40 * DAY })).toBe('expired');
  });
  it('is configurable (clamped 1–30 days)', () => {
    expect(createEntitlement({ accountId: 'a', username: 'u', deviceId: 'd', profileIds: [], sharedSession: false, days: 3, now: T0 }).expiresAt).toBe(T0 + 3 * DAY);
    expect(clampDays(365)).toBe(OFFLINE_MAX_DAYS);
    expect(clampDays(0)).toBe(1);
    expect(clampDays(Number.NaN)).toBe(OFFLINE_DEFAULT_DAYS);
  });
  it('does not work on another device or for another account', () => {
    const e = base();
    expect(entitlementState(e, { deviceId: 'dev2', accountId: 'acctA', now: T0 })).toBe('wrong-device');
    expect(entitlementState(e, { deviceId: 'dev1', accountId: 'acctB', now: T0 })).toBe('wrong-account');
    expect(entitlementState(null, { deviceId: 'dev1', now: T0 })).toBe('none');
    expect(entitlementState({ ...e, v: 2 as 1 }, { deviceId: 'dev1', now: T0 })).toBe('none');
  });
  it('a clock moved far backwards does not extend access', () => {
    const e = renewEntitlement(base(), { now: T0 + 5 * DAY });
    expect(entitlementState(e, { deviceId: 'dev1', now: T0 + 2 * DAY })).toBe('expired');
  });
  it('slides forward on each online check and follows the account\'s profiles', () => {
    const e = renewEntitlement(base(), { now: T0 + 10 * DAY, profileIds: ['p1', 'p3'] });
    expect(e.expiresAt).toBe(T0 + 24 * DAY);
    expect(e.lastVerifiedAt).toBe(T0 + 10 * DAY);
    expect(e.profileIds).toEqual(['p1', 'p3']);
    expect(daysLeft(e, T0 + 20 * DAY)).toBe(4);
  });
  it('only authorised profiles are offered offline', () => {
    const e = base();
    expect(authorizedProfiles(e, [{ id: 'p1' }, { id: 'p9' }, { id: 'p2' }]).map((p) => p.id)).toEqual(['p1', 'p2']);
  });
});

describe('private data scoping', () => {
  it('every private prefix is scoped by account', () => {
    for (const p of privatePrefixes('acctA')) expect(p).toContain('acctA');
    expect(keyAccount('q:acctA:p1:attempt:x')).toBe('acctA');
    expect(keyAccount('art:acctB:p1:id')).toBe('acctB');
    expect(keyAccount('ent:acctA')).toBe('acctA');
    expect(keyAccount('meta:deviceId')).toBeNull();
    expect(keyAccount('pk:installed')).toBeNull();
  });
  it('clearing one account never touches another account\'s keys', () => {
    const keys = ['q:acctA:p1:attempt:1', 'q:acctB:p7:attempt:2', 'art:acctA:p1:x', 'art:acctB:p7:y', 'snap:acctA:me', 'ent:acctA', 'ent:acctB', 'meta:deviceId'];
    const pre = privatePrefixes('acctA');
    const removed = keys.filter((k) => pre.some((p) => k.startsWith(p)));
    expect(removed).toEqual(['q:acctA:p1:attempt:1', 'art:acctA:p1:x', 'snap:acctA:me', 'ent:acctA']);
  });
});

describe('upload gate', () => {
  it('uploads only after the server confirmed the SAME account', () => {
    expect(uploadDecision({ scopeAccountId: 'A', verifiedAccountId: 'A', online: true })).toBe('upload');
    expect(uploadDecision({ scopeAccountId: 'A', verifiedAccountId: null, online: true })).toBe('needs-signin');
    expect(uploadDecision({ scopeAccountId: 'A', verifiedAccountId: 'B', online: true })).toBe('needs-signin');
    expect(uploadDecision({ scopeAccountId: 'A', verifiedAccountId: 'A', online: false })).toBe('offline');
    expect(uploadDecision({ scopeAccountId: null, verifiedAccountId: 'A', online: true })).toBe('no-scope');
  });
});

// ---------------- sync queue: pause / revalidate / scoping (idb + api mocked) ----------------
const store = new Map<string, unknown>();
vi.mock('../src/lib/idb', () => ({
  idb: {
    get: async (k: string) => store.get(k),
    set: async (k: string, v: unknown) => { store.set(k, v); },
    del: async (k: string) => { store.delete(k); },
    keys: async (p: string) => [...store.keys()].filter((k) => k.startsWith(p)),
    clearPrefixes: async (ps: string[]) => { let n = 0; for (const k of [...store.keys()]) if (ps.some((p) => k.startsWith(p))) { store.delete(k); n++; } return n; },
    clearPrefix: async (p: string) => { for (const k of [...store.keys()]) if (k.startsWith(p)) store.delete(k); },
  },
}));
const calls: { path: string; body?: unknown }[] = [];
let apiMode: 'ok' | '401' = 'ok';
vi.mock('../src/lib/api', () => {
  class ApiError extends Error { status: number; code: string; body: Record<string, unknown>; constructor(s: number, c: string, m: string, _f?: unknown, b: Record<string, unknown> = {}) { super(m); this.status = s; this.code = c; this.body = b; } }
  return {
    ApiError,
    api: async (path: string, opts: { body?: unknown } = {}) => {
      if (apiMode === '401') throw new ApiError(401, 'auth', 'Please sign in.');
      calls.push({ path, body: opts.body });
      return path.includes('/artworks/') ? { version: 1 } : { ok: true };
    },
  };
});

describe('sync pause and scoping', () => {
  beforeEach(() => { store.clear(); calls.length = 0; apiMode = 'ok'; vi.stubGlobal('navigator', { onLine: true }); });
  afterEach(() => { vi.unstubAllGlobals(); });
  const attempt = (id: string) => ({ id, questionId: 'q1', questionVersion: 3, objectiveId: 'o1', mode: 'practice' as const, correct: true, hintsUsed: 0, at: 1 });

  it('keeps offline work queued (not uploaded) until the session is revalidated', async () => {
    const sync = await import('../src/lib/sync');
    sync.setSyncScope('acctA', { verified: false });
    await sync.queueAttempt('p1', attempt('00000000-0000-4000-8000-000000000001'));
    await sync.flush();
    expect(calls).toHaveLength(0);
    expect(await sync.countPending('acctA')).toBe(1);
    // revalidation (the app's GET /auth/me) confirms the same account → upload exactly once
    sync.setRevalidator(async () => { sync.setSyncScope('acctA', { verified: true }); });
    await sync.retrySync();
    await new Promise((r) => setTimeout(r, 20));
    const posts = calls.filter((c) => c.path === '/p/p1/attempts');
    expect(posts).toHaveLength(1);
    expect((posts[0].body as { attempts: { questionVersion: number }[] }).attempts[0].questionVersion).toBe(3); // original content version kept
    expect(await sync.countPending('acctA')).toBe(0);
    await sync.flush();
    expect(calls.filter((c) => c.path === '/p/p1/attempts')).toHaveLength(1);
    sync.setRevalidator(null);
  });

  it('pauses (keeps everything) when the server says the session ended', async () => {
    const sync = await import('../src/lib/sync');
    let lost = '';
    sync.onAuthLost((a) => { lost = a; });
    sync.setSyncScope('acctA', { verified: true });
    await new Promise((r) => setTimeout(r, 5));
    apiMode = '401';
    await sync.queueAttempt('p1', attempt('00000000-0000-4000-8000-000000000002'));
    await sync.flush();
    expect(lost).toBe('acctA');
    expect(await sync.countPending('acctA')).toBe(1);
    expect(sync.isSyncVerified()).toBe(false);
    sync.onAuthLost(null);
  });

  it('another account never uploads or counts a different account\'s pending work', async () => {
    const sync = await import('../src/lib/sync');
    sync.setSyncScope('acctA', { verified: false });
    await sync.queueAttempt('p1', attempt('00000000-0000-4000-8000-000000000003'));
    await sync.saveArtDraft('p1', { id: '00000000-0000-4000-8000-0000000000aa', title: 'Sun', data: {}, baseVersion: 0, dirty: true, updatedAt: 0 });
    sync.setSyncScope('acctB', { verified: true });
    await sync.flush();
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toHaveLength(0);
    expect(await sync.countPending('acctB')).toBe(0);
    expect(await sync.countPending('acctA')).toBe(2);
    expect(await sync.listArtDrafts('p1')).toEqual([]); // B cannot list A's drafts
  });

  it('concurrent flush triggers never upload the same artwork twice', async () => {
    const sync = await import('../src/lib/sync');
    sync.setSyncScope('acctA', { verified: true });
    await new Promise((r) => setTimeout(r, 20));
    calls.length = 0;
    const id = '00000000-0000-4000-8000-0000000000d1';
    store.set(`art:acctA:p1:${id}`, { id, title: 'Tree', data: {}, baseVersion: 0, dirty: true, updatedAt: 1 });
    await Promise.all([sync.flush(), sync.flush(), sync.retrySync()]);
    await new Promise((r) => setTimeout(r, 200));
    expect(calls.filter((c) => c.path === `/p/p1/artworks/${id}`)).toHaveLength(1);
  });

  it('edits continued on a conflicted artwork go to the preserved copy (no extra conflict copies)', async () => {
    const sync = await import('../src/lib/sync');
    sync.setSyncScope('acctA', { verified: true });
    await new Promise((r) => setTimeout(r, 5));
    const orig = '00000000-0000-4000-8000-0000000000b1', copy = '00000000-0000-4000-8000-0000000000c1';
    store.set(`artr:acctA:p1:${orig}`, { copyId: copy, staleBase: 1 });
    store.set(`art:acctA:p1:${copy}`, { id: copy, title: 'Sun (other device)', data: {}, baseVersion: 1, dirty: false, updatedAt: 0 });
    store.set(`art:acctA:p1:${orig}`, { id: orig, title: 'Sun', data: { v: 2 }, baseVersion: 1, dirty: true, updatedAt: 5 });
    await sync.flush();
    await new Promise((r) => setTimeout(r, 700));
    expect(calls.some((c) => c.path === `/p/p1/artworks/${orig}`)).toBe(false);
    expect(calls.filter((c) => c.path === `/p/p1/artworks/${copy}`)).toHaveLength(1);
    expect(store.has(`art:acctA:p1:${orig}`)).toBe(false);
  });

  it('sign-out purge removes only that account unless forced; device wipe removes all private data', async () => {
    const sync = await import('../src/lib/sync');
    store.set('q:acctA:p1:attempt:x', {}); store.set('ent:acctA', {}); store.set('snap:acctA:me', {});
    store.set('q:acctB:p2:attempt:y', {}); store.set('meta:deviceId', 'd'); store.set('pk:installed', {});
    expect(await sync.clearAccountData('acctA')).toBe(false); // pending work → warn first
    expect(await sync.clearAccountData('acctA', true)).toBe(true);
    expect([...store.keys()].sort()).toEqual(['meta:deviceId', 'pk:installed', 'q:acctB:p2:attempt:y']);
    expect(await sync.pendingOnDevice()).toBe(1);
    expect(await sync.clearAllPrivateData()).toBe(false);
    expect(await sync.clearAllPrivateData(true)).toBe(true);
    expect([...store.keys()].sort()).toEqual(['meta:deviceId', 'pk:installed']);
  });
});

// ---------------- pack planning ----------------
const MAN: PackManifest = {
  v: 2, build: 'b2', entry: '/assets/index-x.js',
  shell: { files: ['/assets/index-x.js', '/assets/home-1.js'], bytes: 1000 },
  fonts: ['https://fonts.googleapis.com/css2?family=X'],
  packs: [
    { id: 'lessons-c5', files: ['/assets/c5-1.js', '/assets/lesson-1.js'], bytes: 500, version: 'v1' },
    { id: 'games', files: ['/assets/games-1.js', '/assets/lesson-1.js'], bytes: 300, version: 'g1' },
  ],
};
describe('pack planning', () => {
  it('a class pack covers lessons, games, sims, art and narration for that class', () => {
    const c5 = packsForClass(7); // Class 5
    expect(c5).toEqual(expect.arrayContaining(['lessons-c5', 'games', 'physics-lab', 'art-studio', 'lang-telugu-english']));
    expect(c5.filter((id) => id.startsWith('lessons-'))).toEqual(['lessons-c5']);
    expect(packsForClass(0)).toEqual(expect.arrayContaining(['lessons-nursery', 'play-learn', 'tracing-sheets', 'narration-te']));
  });
  it('routes map to the packs they need ("Download required" otherwise)', () => {
    expect(packsForPath('/lesson/abc/practice', 7)).toEqual(['lessons-c5']);
    expect(packsForPath('/lab/circuit', 7)).toEqual(['physics-lab']);
    expect(packsForPath('/art/paint/123', 7)).toEqual(['art-studio']);
    expect(packsForPath('/games/counting', 7)).toEqual(['games']);
    expect(packsForPath('/', 7)).toBeNull();
    expect(packsForPath('/who', 7)).toBeNull();
  });
  it('file lists are unique and include the page', () => {
    const f = filesFor(MAN, ['lessons-c5', 'games']);
    expect(f).toContain(INDEX_KEY);
    expect(new Set(f).size).toBe(f.length);
    expect(filesFor(MAN, ['games'], false)).toEqual(['/assets/games-1.js', '/assets/lesson-1.js']);
    expect(bytesFor(MAN, ['games'], true)).toBe(1300);
  });
  it('pack state: ready / update / none; new build needs staging', () => {
    const inst = { ...emptyInstalled(), build: 'b2', shell: true, packs: { 'lessons-c5': { version: 'v1', verifiedAt: 1, bytes: 1 }, games: { version: 'old', verifiedAt: 1, bytes: 1 } } };
    expect(packState(MAN, inst, 'lessons-c5')).toBe('ready');
    expect(packState(MAN, inst, 'games')).toBe('update');
    expect(packState(MAN, inst, 'physics-lab')).toBe('none');
    expect(needsUpdate(MAN, inst)).toBe(false);
    expect(needsUpdate(MAN, { ...inst, build: 'b1' })).toBe(true);
    expect(needsUpdate(MAN, emptyInstalled())).toBe(false);
    expect(isManifest(MAN)).toBe(true);
    expect(isManifest({ packs: [] })).toBe(false);
  });
  it('asks first on metered connections or low storage', () => {
    expect(downloadPrecheck({ saveData: true }, { quota: 1e10, usage: 0 }, 5e6).metered).toBe(true);
    expect(downloadPrecheck({ type: 'cellular' }, undefined, 5e6).metered).toBe(true);
    expect(downloadPrecheck({ type: 'wifi' }, { quota: 1e10, usage: 0 }, 5e6)).toMatchObject({ metered: false, lowStorage: false });
    expect(downloadPrecheck(undefined, { quota: 30e6, usage: 20e6 }, 5e6).lowStorage).toBe(true);
  });
  it('"Ready offline" needs verified files, entitlement and saved data', () => {
    const inst = { ...emptyInstalled(), build: 'b2', shell: true, packs: { a: { version: '1', verifiedAt: 1, bytes: 1 } } };
    expect(readiness({ inst, required: ['a'], entitlement: true, data: true }).ready).toBe(true);
    expect(readiness({ inst, required: ['a', 'b'], entitlement: true, data: true })).toMatchObject({ ready: false, downloaded: false, missing: ['b'] });
    expect(readiness({ inst, required: ['a'], entitlement: false, data: true })).toMatchObject({ ready: false, downloaded: true });
    expect(readiness({ inst: { ...inst, shell: false }, required: ['a'], entitlement: true, data: true }).ready).toBe(false);
    expect(readiness({ inst, required: ['a'], entitlement: true, data: false }).ready).toBe(false);
  });
  it('picks only the used font subsets', () => {
    const css = '/* cyrillic */\n@font-face { src: url(https://fonts.gstatic.com/c.woff2) }\n/* latin */\n@font-face { src: url(https://fonts.gstatic.com/l.woff2) }\n/* telugu */\n@font-face { src: url(https://fonts.gstatic.com/t.woff2) }';
    expect(fontUrls(css)).toEqual(['https://fonts.gstatic.com/l.woff2', 'https://fonts.gstatic.com/t.woff2']);
  });
});
