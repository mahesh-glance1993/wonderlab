// Shared server helpers: crypto, sessions, rate limiting, responses.
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_ENV: string; // 'development' | 'production'
  APP_ORIGIN: string; // used in emails
  SESSION_IDLE_DAYS: string; // trusted device inactivity limit
  SESSION_MAX_DAYS: string; // trusted device absolute limit (renewed by rotation)
  SHARED_IDLE_MIN: string; // shared device inactivity limit
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string; // optional production email provider
  SEND_EMAIL?: { send: (m: unknown) => Promise<unknown> }; // optional Cloudflare Email binding
  TTS_ENABLED?: string; // 'false' turns off natural (Workers AI) narration
}
export interface Account { id: string; username: string; email: string | null; email_verified: number; role: 'parent' | 'educator' | 'admin'; sec_question: number; pass_hash: string; sec_answer_hash: string }
export interface SessionRow { id: string; account_id: string; persistent: number; created_at: number; last_seen: number; expires_at: number; idle_limit_sec: number; verified_until: number; rotated_to: string | null; rotated_at: number | null; revoked_at: number | null; device_label: string | null }
export type Vars = { account: Account | null; session: SessionRow | null; profileId?: string };
export type C = Context<{ Bindings: Env; Variables: Vars }>;

export const now = () => Math.floor(Date.now() / 1000);
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
export const b64u = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const randomToken = (n = 32) => b64u(crypto.getRandomValues(new Uint8Array(n)));
export const uid = () => crypto.randomUUID();
export const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function pbkdf2(secret: string, salt: string, iterations: number) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations, hash: 'SHA-256' }, key, 256));
}
const ITER = 100_000; // Workers runtime maximum for PBKDF2
export async function hashSecret(secret: string) {
  const salt = randomToken(16);
  return `pbkdf2$${ITER}$${salt}$${await pbkdf2(secret, salt, ITER)}`;
}
export async function verifySecret(secret: string, stored: string) {
  const [alg, it, salt, h] = stored.split('$');
  if (alg !== 'pbkdf2' || !salt || !h) return false;
  const h2 = await pbkdf2(secret, salt, +it);
  if (h2.length !== h.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ h2.charCodeAt(i);
  return diff === 0;
}
/** Security answers are compared case/space-insensitively. */
export const normAnswer = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

// ---------------- sessions ----------------
const cookieName = (c: C) => (new URL(c.req.url).protocol === 'https:' ? '__Host-wl_s' : 'wl_s');
const ROTATE_AFTER = 24 * 3600; // rotate trusted-device tokens daily
const ROTATE_GRACE = 60; // old token keeps working briefly for in-flight requests

export async function createSession(c: C, accountId: string, persistent: boolean, deviceLabel?: string) {
  const t = now();
  const idle = persistent ? +c.env.SESSION_IDLE_DAYS * 86400 : +c.env.SHARED_IDLE_MIN * 60;
  const max = persistent ? +c.env.SESSION_MAX_DAYS * 86400 : 12 * 3600;
  const token = randomToken();
  const id = await sha256(token);
  await c.env.DB.prepare(
    'INSERT INTO sessions (id, account_id, persistent, created_at, last_seen, expires_at, idle_limit_sec, device_label) VALUES (?,?,?,?,?,?,?,?)',
  ).bind(id, accountId, persistent ? 1 : 0, t, t, t + max, idle, (deviceLabel || '').slice(0, 80)).run();
  writeCookie(c, token, persistent ? max : undefined);
  return id;
}
function writeCookie(c: C, token: string, maxAge?: number) {
  const secure = new URL(c.req.url).protocol === 'https:';
  setCookie(c, cookieName(c), token, { httpOnly: true, secure, sameSite: 'Lax', path: '/', ...(maxAge ? { maxAge } : {}) });
}
export function clearCookie(c: C) {
  deleteCookie(c, cookieName(c), { path: '/', secure: new URL(c.req.url).protocol === 'https:' });
}

/** Loads (and if due, rotates) the session for this request. */
export async function loadSession(c: C) {
  c.set('account', null);
  c.set('session', null);
  const token = getCookie(c, cookieName(c));
  if (!token) return;
  const id = await sha256(token);
  const s = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(id).first<SessionRow>();
  const t = now();
  if (!s) return clearCookie(c);
  const graceOk = s.rotated_at && t - s.rotated_at <= ROTATE_GRACE;
  if ((s.revoked_at && !graceOk) || s.expires_at <= t || t - s.last_seen > s.idle_limit_sec) {
    if (!s.revoked_at) await c.env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE id = ?').bind(t, id).run();
    return clearCookie(c);
  }
  const acct = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(s.account_id).first<Account>();
  if (!acct) return clearCookie(c);
  let active = s;
  if (s.persistent && !s.rotated_to && t - s.created_at > ROTATE_AFTER) {
    // rotation: new token, same limits; old row revoked with a short grace period
    const nt = randomToken();
    const nid = await sha256(nt);
    const max = +c.env.SESSION_MAX_DAYS * 86400;
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO sessions (id, account_id, persistent, created_at, last_seen, expires_at, idle_limit_sec, verified_until, device_label) VALUES (?,?,?,?,?,?,?,?,?)')
        .bind(nid, s.account_id, 1, t, t, t + max, s.idle_limit_sec, s.verified_until, s.device_label),
      c.env.DB.prepare('UPDATE sessions SET rotated_to = ?, rotated_at = ?, revoked_at = ? WHERE id = ?').bind(nid, t, t, id),
    ]);
    writeCookie(c, nt, max);
    active = { ...s, id: nid, created_at: t, last_seen: t, expires_at: t + max, rotated_to: null, rotated_at: null, revoked_at: null };
  } else if (t - s.last_seen > 60) {
    await c.env.DB.prepare('UPDATE sessions SET last_seen = ? WHERE id = ?').bind(t, id).run();
  }
  c.set('account', acct);
  c.set('session', active);
}

export async function revokeAllSessions(db: D1Database, accountId: string, exceptId?: string) {
  const t = now();
  if (exceptId) await db.prepare('UPDATE sessions SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL AND id != ?').bind(t, accountId, exceptId).run();
  else await db.prepare('UPDATE sessions SET revoked_at = ? WHERE account_id = ? AND revoked_at IS NULL').bind(t, accountId).run();
}

// ---------------- rate limiting ----------------
export const clientIp = (c: C) => c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'local';
/** Fixed-window limiter stored in D1. Returns false when the limit is exceeded. */
export async function rateLimit(c: C, key: string, max: number, windowSec: number) {
  const t = now();
  const row = await c.env.DB.prepare('SELECT window_start, count FROM rate_limits WHERE key = ?').bind(key).first<{ window_start: number; count: number }>();
  if (!row || t - row.window_start >= windowSec) {
    await c.env.DB.prepare('INSERT INTO rate_limits (key, window_start, count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1').bind(key, t).run();
    return true;
  }
  if (row.count >= max) return false;
  await c.env.DB.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run();
  return true;
}

// ---------------- misc ----------------
export const err = (c: C, status: 400 | 401 | 403 | 404 | 409 | 422 | 429, code: string, message: string, extra: Record<string, unknown> = {}) =>
  c.json({ error: { code, message, ...extra } }, status);

export async function audit(db: D1Database, accountId: string | null, action: string, detail?: unknown) {
  await db.prepare('INSERT INTO audit_log (id, account_id, action, detail, created_at) VALUES (?,?,?,?,?)').bind(uid(), accountId, action, detail ? JSON.stringify(detail) : null, now()).run();
}

export async function sendEmail(env: Env, to: string, subject: string, body: string) {
  // Always keep a copy in the outbox in development so recovery can be tested locally.
  if (env.APP_ENV !== 'production') {
    await env.DB.prepare('INSERT INTO outbox (id, to_addr, subject, body, created_at) VALUES (?,?,?,?,?)').bind(uid(), to, subject, body, now()).run();
    return;
  }
  if (env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.EMAIL_FROM || 'WonderLab <no-reply@example.com>', to, subject, text: body }),
    });
    return;
  }
  // No provider configured: keep it in the outbox so an operator can see that delivery is not set up.
  await env.DB.prepare('INSERT INTO outbox (id, to_addr, subject, body, created_at) VALUES (?,?,?,?,?)').bind(uid(), to, subject, body, now()).run();
}

export function requireAuth(c: C) {
  const a = c.get('account');
  return a ?? null;
}
export function isVerified(c: C) {
  const s = c.get('session');
  return !!s && s.verified_until > now();
}
