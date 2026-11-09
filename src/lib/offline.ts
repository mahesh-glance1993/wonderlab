// Offline entitlement: a LOCAL, time-limited permission for this device to open an account's
// learner profiles without reaching the server. It is never a server credential:
//  - no session token, password or secret is stored (the session stays in an HttpOnly cookie);
//  - it only unlocks data already saved on this device (snapshots + unsynced work);
//  - it is bound to a random per-device id, one account and the profile ids a parent authorised;
//  - it expires `days` after the last successful online check (sliding window, default 14 days);
//  - a parent turns it on (after re-entering the password); it is off by default and the
//    first-run prompt is not shown on shared-device sessions.
// Uploading anything still requires a live server session (see sync.ts: revalidation first).
import { idb } from './idb';

export const OFFLINE_DEFAULT_DAYS = 14;
export const OFFLINE_DAY_CHOICES = [3, 7, 14, 30] as const;
export const OFFLINE_MIN_DAYS = 1;
export const OFFLINE_MAX_DAYS = 30;
const DAY = 86_400_000;

export interface OfflineEntitlement {
  v: 1;
  accountId: string;
  /** shown on the "sign in again" prompt so the parent picks the same account */
  username: string;
  deviceId: string;
  profileIds: string[];
  days: number;
  enabledAt: number;
  /** last time the server confirmed the session for this account (ms) */
  lastVerifiedAt: number;
  expiresAt: number;
  /** granted during a shared-device session (warned about, off by default) */
  sharedSession: boolean;
}

export type EntitlementState = 'none' | 'valid' | 'expired' | 'wrong-device' | 'wrong-account';

export const clampDays = (d: number) => Math.min(OFFLINE_MAX_DAYS, Math.max(OFFLINE_MIN_DAYS, Math.round(Number.isFinite(d) ? d : OFFLINE_DEFAULT_DAYS)));

export function createEntitlement(o: { accountId: string; username: string; deviceId: string; profileIds: string[]; days?: number; sharedSession: boolean; now?: number }): OfflineEntitlement {
  const now = o.now ?? Date.now();
  const days = clampDays(o.days ?? OFFLINE_DEFAULT_DAYS);
  return { v: 1, accountId: o.accountId, username: o.username, deviceId: o.deviceId, profileIds: [...new Set(o.profileIds)], days, enabledAt: now, lastVerifiedAt: now, expiresAt: now + days * DAY, sharedSession: o.sharedSession };
}

/** Called after every successful online check of the SAME account: slides the window forward. */
export function renewEntitlement(e: OfflineEntitlement, o: { profileIds?: string[]; days?: number; now?: number }): OfflineEntitlement {
  const now = o.now ?? Date.now();
  const days = clampDays(o.days ?? e.days);
  return { ...e, days, profileIds: o.profileIds ? [...new Set(o.profileIds)] : e.profileIds, lastVerifiedAt: now, expiresAt: now + days * DAY };
}

export function entitlementState(e: OfflineEntitlement | null | undefined, ctx: { deviceId: string; accountId?: string | null; now?: number }): EntitlementState {
  if (!e || e.v !== 1) return 'none';
  if (e.deviceId !== ctx.deviceId) return 'wrong-device';
  if (ctx.accountId && e.accountId !== ctx.accountId) return 'wrong-account';
  const now = ctx.now ?? Date.now();
  // a clock set backwards before the last verification must not extend access
  if (now >= e.expiresAt || now < e.lastVerifiedAt - DAY) return 'expired';
  return 'valid';
}

/** Only profiles a parent authorised for this device are offered offline. */
export function authorizedProfiles<P extends { id: string }>(e: OfflineEntitlement, profiles: P[]): P[] {
  const ok = new Set(e.profileIds);
  return profiles.filter((p) => ok.has(p.id));
}

export const daysLeft = (e: OfflineEntitlement, now = Date.now()) => Math.max(0, Math.ceil((e.expiresAt - now) / DAY));

// ---------------- upload gate (pure; used by sync.ts) ----------------
export interface UploadGate { scopeAccountId: string | null; verifiedAccountId: string | null; online: boolean }
export type UploadDecision = 'upload' | 'no-scope' | 'offline' | 'needs-signin';
/** Private changes are uploaded only after the server confirmed a session for the SAME account. */
export function uploadDecision(g: UploadGate): UploadDecision {
  if (!g.scopeAccountId) return 'no-scope';
  if (!g.online) return 'offline';
  if (g.verifiedAccountId !== g.scopeAccountId) return 'needs-signin';
  return 'upload';
}

// ---------------- private local-data keys (all scoped by account, most by profile) ----------------
/** Prefixes of private records for one account. Static packs and the TTS cache are not private. */
export const privatePrefixes = (accountId: string) => [`q:${accountId}:`, `art:${accountId}:`, `artr:${accountId}:`, `snap:${accountId}:`, `dl:${accountId}:`, `ent:${accountId}`];
export const ALL_PRIVATE_PREFIXES = ['q:', 'art:', 'artr:', 'snap:', 'dl:', 'ent:'];

/** Which account a stored key belongs to (null for device-level keys). */
export function keyAccount(key: string): string | null {
  const [kind, acct] = key.split(':');
  return ['q', 'art', 'artr', 'snap', 'dl', 'ent'].includes(kind) && acct ? acct : null;
}

// ---------------- device + entitlement storage ----------------
const DEVICE_KEY = 'meta:deviceId';
const LAST_KEY = 'meta:lastAccount';
const entKey = (accountId: string) => `ent:${accountId}`;

let deviceIdP: Promise<string> | null = null;
/** Random id created once per browser profile; not derived from any hardware or user data. */
export function getDeviceId(): Promise<string> {
  deviceIdP ??= (async () => {
    const cur = await idb.get<string>(DEVICE_KEY).catch(() => undefined);
    if (cur) return cur;
    const id = crypto.randomUUID();
    await idb.set(DEVICE_KEY, id).catch(() => undefined);
    return id;
  })();
  return deviceIdP;
}

export const loadEntitlement = (accountId: string) => idb.get<OfflineEntitlement>(entKey(accountId)).then((e) => e ?? null).catch(() => null);
export const saveEntitlement = (e: OfflineEntitlement) => idb.set(entKey(e.accountId), e);
export const removeEntitlement = (accountId: string) => idb.del(entKey(accountId));

/** Id of the account last used on this device (only an id — used to find its offline data). */
export async function getLastAccount(): Promise<string | null> {
  const v = await idb.get<string>(LAST_KEY).catch(() => undefined);
  if (v) return v;
  try { return localStorage.getItem('wl.lastAccount'); } catch { return null; } // pre-entitlement installs
}
export async function setLastAccount(accountId: string | null) {
  try { localStorage.removeItem('wl.lastAccount'); } catch { /* blocked storage */ }
  if (accountId) await idb.set(LAST_KEY, accountId).catch(() => undefined);
  else await idb.del(LAST_KEY).catch(() => undefined);
}
