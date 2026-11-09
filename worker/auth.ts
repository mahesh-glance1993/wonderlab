// Parent accounts: registration, sign-in, sessions, parent verification, recovery.
import { Hono } from 'hono';
import {
  type Env, type Vars, type Account, type C, now, uid, sha256, randomToken, hashSecret, verifySecret, normAnswer,
  createSession, clearCookie, revokeAllSessions, rateLimit, clientIp, err, audit, sendEmail, isVerified,
} from './lib';
import { SECURITY_QUESTIONS } from '../src/shared/levels';

export const auth = new Hono<{ Bindings: Env; Variables: Vars }>();

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VERIFY_WINDOW = 10 * 60; // parent verification lasts 10 minutes
const RESET_TTL = 30 * 60;
const VERIFY_EMAIL_TTL = 48 * 3600;
const GENERIC_RECOVERY = 'If the details match an account, we have sent instructions.';

export function passwordProblem(p: string) {
  if (typeof p !== 'string' || p.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Use letters and at least one number.';
  if (p.length > 200) return 'That password is too long.';
  return null;
}
const publicAccount = (a: Account) => ({ id: a.id, username: a.username, email: a.email, emailVerified: !!a.email_verified, role: a.role, securityQuestion: SECURITY_QUESTIONS[a.sec_question] });

/** Generates 10 single-use recovery codes, stores hashes, returns the plain codes once. */
async function issueRecoveryCodes(db: D1Database, accountId: string) {
  const codes: string[] = [];
  const stmts = [db.prepare('DELETE FROM recovery_codes WHERE account_id = ?').bind(accountId)];
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 10; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    const raw = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
    const code = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    codes.push(code);
    stmts.push(db.prepare('INSERT INTO recovery_codes (id, account_id, code_hash, created_at) VALUES (?,?,?,?)').bind(uid(), accountId, await sha256(code.replace(/-/g, '')), now()));
  }
  await db.batch(stmts);
  return codes;
}
const normCode = (s: string) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function sendVerification(c: C, a: { id: string; email: string; username: string }) {
  const token = randomToken();
  await c.env.DB.prepare('INSERT INTO auth_tokens (id, account_id, kind, expires_at, created_at) VALUES (?,?,?,?,?)').bind(await sha256(token), a.id, 'verify-email', now() + VERIFY_EMAIL_TTL, now()).run();
  await sendEmail(c.env, a.email, 'Confirm your WonderLab email',
    `Hello ${a.username},\n\nPlease confirm this email so it can be used to recover your WonderLab account:\n${c.env.APP_ORIGIN}/verify-email?token=${token}\n\nThis link expires in 48 hours. If you did not create an account, ignore this email.`);
}

auth.post('/register', async (c) => {
  if (!(await rateLimit(c, `reg:${clientIp(c)}`, 10, 3600))) return err(c, 429, 'rate', 'Too many attempts. Please wait and try again.');
  const b = await c.req.json<{ username: string; password: string; email?: string; securityQuestion: number; securityAnswer: string; keepSignedIn?: boolean; deviceLabel?: string }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  const fields: Record<string, string> = {};
  const username = (b.username || '').trim();
  if (!USERNAME_RE.test(username)) fields.username = 'Use 3–32 letters, numbers, dots, dashes or underscores.';
  const pp = passwordProblem(b.password);
  if (pp) fields.password = pp;
  const email = (b.email || '').trim().toLowerCase() || null;
  if (email && !EMAIL_RE.test(email)) fields.email = 'Enter a valid email address.';
  if (!(b.securityQuestion >= 0 && b.securityQuestion < SECURITY_QUESTIONS.length)) fields.securityQuestion = 'Choose a question.';
  if (normAnswer(b.securityAnswer || '').length < 2) fields.securityAnswer = 'Type an answer.';
  if (Object.keys(fields).length) return err(c, 422, 'invalid', 'Please check the highlighted fields.', { fields });
  const taken = await c.env.DB.prepare('SELECT username, email FROM accounts WHERE username = ? OR (email IS NOT NULL AND email = ?)').bind(username, email).first<{ username: string; email: string }>();
  if (taken) {
    const f: Record<string, string> = {};
    if (taken.username.toLowerCase() === username.toLowerCase()) f.username = 'That username is taken.';
    else f.email = 'That email is already used by another account.';
    return err(c, 422, 'invalid', 'Please check the highlighted fields.', { fields: f });
  }
  const id = uid(), t = now();
  await c.env.DB.prepare('INSERT INTO accounts (id, username, email, email_verified, pass_hash, sec_question, sec_answer_hash, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, username, email, 0, await hashSecret(b.password), b.securityQuestion, await hashSecret(normAnswer(b.securityAnswer)), 'parent', t, t).run();
  const codes = await issueRecoveryCodes(c.env.DB, id);
  if (email) await sendVerification(c, { id, email, username });
  await createSession(c, id, b.keepSignedIn !== false, b.deviceLabel);
  // A brand-new account is verified for initial parent setup (creating profiles).
  await c.env.DB.prepare('UPDATE sessions SET verified_until = ? WHERE account_id = ?').bind(now() + VERIFY_WINDOW, id).run();
  await audit(c.env.DB, id, 'register');
  const acct = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>();
  return c.json({ account: publicAccount(acct!), recoveryCodes: codes });
});

auth.post('/login', async (c) => {
  const b = await c.req.json<{ username: string; password: string; keepSignedIn?: boolean; deviceLabel?: string }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  const u = (b.username || '').trim();
  if (!(await rateLimit(c, `login:${clientIp(c)}`, 30, 900)) || !(await rateLimit(c, `login-u:${u.toLowerCase()}`, 10, 900)))
    return err(c, 429, 'rate', 'Too many sign-in attempts. Please wait 15 minutes and try again.');
  const a = await c.env.DB.prepare('SELECT * FROM accounts WHERE username = ?').bind(u).first<Account>();
  const ok = a ? await verifySecret(b.password || '', a.pass_hash) : await verifySecret(b.password || '', 'pbkdf2$100000$x$00'); // equalise timing
  if (!a || !ok) return err(c, 401, 'credentials', 'That username and password do not match.');
  await createSession(c, a.id, !!b.keepSignedIn, b.deviceLabel);
  await audit(c.env.DB, a.id, 'login', { persistent: !!b.keepSignedIn });
  return c.json({ account: publicAccount(a) });
});

auth.post('/logout', async (c) => {
  const s = c.get('session');
  if (s) await c.env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE id = ?').bind(now(), s.id).run();
  clearCookie(c);
  return c.json({ ok: true });
});

auth.get('/me', async (c) => {
  const a = c.get('account'), s = c.get('session');
  if (!a || !s) return c.json({ account: null });
  const { results } = await c.env.DB.prepare('SELECT id, nickname, avatar, class_level, age_band, prefs FROM profiles WHERE account_id = ? ORDER BY created_at').bind(a.id).all();
  return c.json({
    account: publicAccount(a),
    session: { persistent: !!s.persistent, verifiedUntil: s.verified_until, idleLimitSec: s.idle_limit_sec, expiresAt: s.expires_at },
    profiles: results.map((p: Record<string, unknown>) => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, classLevel: p.class_level, ageBand: p.age_band, prefs: JSON.parse(String(p.prefs || '{}')) })),
  });
});

/** Parent re-enters their password to unlock sensitive actions for 10 minutes. */
auth.post('/verify-parent', async (c) => {
  const a = c.get('account'), s = c.get('session');
  if (!a || !s) return err(c, 401, 'auth', 'Please sign in.');
  if (!(await rateLimit(c, `verify:${a.id}`, 8, 900))) return err(c, 429, 'rate', 'Too many attempts. Please wait 15 minutes.');
  const b = await c.req.json<{ password: string }>().catch(() => ({ password: '' }));
  if (!(await verifySecret(b.password || '', a.pass_hash))) return err(c, 401, 'credentials', 'That password is not right.');
  const until = now() + VERIFY_WINDOW;
  await c.env.DB.prepare('UPDATE sessions SET verified_until = ? WHERE id = ?').bind(until, s.id).run();
  return c.json({ verifiedUntil: until });
});
auth.post('/end-parent-mode', async (c) => {
  const s = c.get('session');
  if (s) await c.env.DB.prepare('UPDATE sessions SET verified_until = 0 WHERE id = ?').bind(s.id).run();
  return c.json({ ok: true });
});

// ---------- recovery: email link (primary) + security answer (additional) ----------
auth.post('/forgot-password', async (c) => {
  const b = await c.req.json<{ identifier: string }>().catch(() => ({ identifier: '' }));
  const id = (b.identifier || '').trim();
  if (!(await rateLimit(c, `forgot:${clientIp(c)}`, 10, 3600))) return c.json({ message: GENERIC_RECOVERY }); // stay generic
  const a = await c.env.DB.prepare('SELECT * FROM accounts WHERE username = ? OR email = ?').bind(id, id.toLowerCase()).first<Account>();
  if (a && a.email && a.email_verified && (await rateLimit(c, `forgot-a:${a.id}`, 3, 3600))) {
    const token = randomToken();
    await c.env.DB.prepare('INSERT INTO auth_tokens (id, account_id, kind, expires_at, created_at) VALUES (?,?,?,?,?)').bind(await sha256(token), a.id, 'reset', now() + RESET_TTL, now()).run();
    await sendEmail(c.env, a.email, 'Reset your WonderLab password',
      `Hello ${a.username},\n\nUse this link to reset your password. It works once and expires in 30 minutes:\n${c.env.APP_ORIGIN}/reset?token=${token}\n\nYou will also be asked your security question. If you did not ask for this, you can ignore this email.`);
    await audit(c.env.DB, a.id, 'reset-requested');
  }
  return c.json({ message: GENERIC_RECOVERY });
});

auth.post('/reset-token-info', async (c) => {
  const b = await c.req.json<{ token: string }>().catch(() => ({ token: '' }));
  if (!(await rateLimit(c, `rti:${clientIp(c)}`, 30, 3600))) return err(c, 429, 'rate', 'Too many attempts.');
  const row = await c.env.DB.prepare("SELECT t.*, a.sec_question FROM auth_tokens t JOIN accounts a ON a.id = t.account_id WHERE t.id = ? AND t.kind = 'reset'").bind(await sha256(b.token || '')).first<{ used_at: number | null; expires_at: number; sec_question: number }>();
  if (!row || row.used_at || row.expires_at <= now()) return err(c, 400, 'token', 'This reset link is invalid or has expired. Please request a new one.');
  return c.json({ securityQuestion: SECURITY_QUESTIONS[row.sec_question] });
});

async function finishReset(c: C, a: Account, newPassword: string) {
  await c.env.DB.prepare('UPDATE accounts SET pass_hash = ?, updated_at = ? WHERE id = ?').bind(await hashSecret(newPassword), now(), a.id).run();
  await revokeAllSessions(c.env.DB, a.id); // every existing session must sign in again
  clearCookie(c);
  await audit(c.env.DB, a.id, 'password-reset');
}

auth.post('/reset-with-token', async (c) => {
  const b = await c.req.json<{ token: string; securityAnswer: string; newPassword: string }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  if (!(await rateLimit(c, `rwt:${clientIp(c)}`, 10, 900))) return err(c, 429, 'rate', 'Too many attempts. Please wait 15 minutes.');
  const tid = await sha256(b.token || '');
  const row = await c.env.DB.prepare("SELECT * FROM auth_tokens WHERE id = ? AND kind = 'reset'").bind(tid).first<{ account_id: string; used_at: number | null; expires_at: number }>();
  if (!row || row.used_at || row.expires_at <= now()) return err(c, 400, 'token', 'This reset link is invalid or has expired. Please request a new one.');
  const a = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(row.account_id).first<Account>();
  if (!a) return err(c, 400, 'token', 'This reset link is invalid or has expired.');
  if (!(await rateLimit(c, `rwt-a:${a.id}`, 5, 3600))) {
    await c.env.DB.prepare('UPDATE auth_tokens SET used_at = ? WHERE id = ?').bind(now(), tid).run(); // burn the link
    return err(c, 429, 'rate', 'Too many wrong answers. Please request a new reset link later.');
  }
  if (!(await verifySecret(normAnswer(b.securityAnswer || ''), a.sec_answer_hash))) return err(c, 401, 'answer', 'The security answer does not match.');
  const pp = passwordProblem(b.newPassword);
  if (pp) return err(c, 422, 'invalid', pp, { fields: { newPassword: pp } });
  await c.env.DB.prepare('UPDATE auth_tokens SET used_at = ? WHERE id = ?').bind(now(), tid).run(); // single use
  await finishReset(c, a, b.newPassword);
  return c.json({ ok: true });
});

// ---------- recovery: one-time recovery code (primary) + security answer ----------
async function findCode(c: C, username: string, code: string) {
  const a = await c.env.DB.prepare('SELECT * FROM accounts WHERE username = ?').bind((username || '').trim()).first<Account>();
  if (!a) return null;
  const h = await sha256(normCode(code));
  const rc = await c.env.DB.prepare('SELECT id FROM recovery_codes WHERE account_id = ? AND code_hash = ? AND used_at IS NULL').bind(a.id, h).first<{ id: string }>();
  return rc ? { a, codeId: rc.id } : null;
}
auth.post('/recovery-code/check', async (c) => {
  const b = await c.req.json<{ username: string; code: string }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  if (!(await rateLimit(c, `rcc:${clientIp(c)}`, 10, 900)) || !(await rateLimit(c, `rcc-u:${(b.username || '').toLowerCase()}`, 5, 900)))
    return err(c, 429, 'rate', 'Too many attempts. Please wait 15 minutes.');
  const f = await findCode(c, b.username, b.code);
  if (!f) return err(c, 401, 'nomatch', 'Those details do not match.');
  return c.json({ securityQuestion: SECURITY_QUESTIONS[f.a.sec_question] });
});
auth.post('/reset-with-code', async (c) => {
  const b = await c.req.json<{ username: string; code: string; securityAnswer: string; newPassword: string }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  if (!(await rateLimit(c, `rwc:${clientIp(c)}`, 10, 900)) || !(await rateLimit(c, `rwc-u:${(b.username || '').toLowerCase()}`, 5, 900)))
    return err(c, 429, 'rate', 'Too many attempts. Please wait 15 minutes.');
  const f = await findCode(c, b.username, b.code);
  if (!f) return err(c, 401, 'nomatch', 'Those details do not match.');
  if (!(await verifySecret(normAnswer(b.securityAnswer || ''), f.a.sec_answer_hash))) return err(c, 401, 'nomatch', 'Those details do not match.');
  const pp = passwordProblem(b.newPassword);
  if (pp) return err(c, 422, 'invalid', pp, { fields: { newPassword: pp } });
  await c.env.DB.prepare('UPDATE recovery_codes SET used_at = ? WHERE id = ?').bind(now(), f.codeId).run(); // single use
  await finishReset(c, f.a, b.newPassword);
  const left = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE account_id = ? AND used_at IS NULL').bind(f.a.id).first<{ n: number }>();
  return c.json({ ok: true, codesLeft: left?.n ?? 0 });
});

auth.post('/forgot-username', async (c) => {
  const b = await c.req.json<{ email: string }>().catch(() => ({ email: '' }));
  if (await rateLimit(c, `fu:${clientIp(c)}`, 5, 3600)) {
    const a = await c.env.DB.prepare('SELECT * FROM accounts WHERE email = ? AND email_verified = 1').bind((b.email || '').trim().toLowerCase()).first<Account>();
    if (a && a.email) await sendEmail(c.env, a.email, 'Your WonderLab username', `Hello,\n\nThe username for this email is: ${a.username}\n\nSign in at ${c.env.APP_ORIGIN}/signin`);
  }
  return c.json({ message: 'If that email belongs to a verified account, we have sent the username to it.' });
});

auth.post('/verify-email', async (c) => {
  const b = await c.req.json<{ token: string }>().catch(() => ({ token: '' }));
  const tid = await sha256(b.token || '');
  const row = await c.env.DB.prepare("SELECT * FROM auth_tokens WHERE id = ? AND kind = 'verify-email'").bind(tid).first<{ account_id: string; used_at: number | null; expires_at: number }>();
  if (!row || row.used_at || row.expires_at <= now()) return err(c, 400, 'token', 'This link is invalid or has expired.');
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE accounts SET email_verified = 1, updated_at = ? WHERE id = ?').bind(now(), row.account_id),
    c.env.DB.prepare('UPDATE auth_tokens SET used_at = ? WHERE id = ?').bind(now(), tid),
  ]);
  return c.json({ ok: true });
});

// ---------------- account management (parent verification required) ----------------
export const account = new Hono<{ Bindings: Env; Variables: Vars }>();
account.use('*', async (c, next) => {
  if (!c.get('account')) return err(c, 401, 'auth', 'Please sign in.');
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent needs to confirm their password first.');
  await next();
});

account.get('/sessions', async (c) => {
  const a = c.get('account')!, s = c.get('session')!;
  const { results } = await c.env.DB.prepare('SELECT id, persistent, created_at, last_seen, device_label FROM sessions WHERE account_id = ? AND revoked_at IS NULL AND expires_at > ? ORDER BY last_seen DESC').bind(a.id, now()).all();
  return c.json({ sessions: results.map((r: Record<string, unknown>) => ({ id: String(r.id).slice(0, 16), persistent: !!r.persistent, createdAt: r.created_at, lastSeen: r.last_seen, device: r.device_label, current: r.id === s.id })) });
});
account.delete('/sessions/:id', async (c) => {
  const a = c.get('account')!;
  const prefix = c.req.param('id');
  if (!/^[0-9a-f]{16}$/.test(prefix)) return err(c, 400, 'bad', 'Invalid session.');
  await c.env.DB.prepare('UPDATE sessions SET revoked_at = ? WHERE account_id = ? AND substr(id,1,16) = ?').bind(now(), a.id, prefix).run();
  await audit(c.env.DB, a.id, 'session-revoked');
  return c.json({ ok: true });
});
account.post('/sessions/revoke-others', async (c) => {
  const a = c.get('account')!, s = c.get('session')!;
  await revokeAllSessions(c.env.DB, a.id, s.id);
  await audit(c.env.DB, a.id, 'sessions-revoked-others');
  return c.json({ ok: true });
});
account.post('/recovery-codes', async (c) => {
  const a = c.get('account')!;
  const codes = await issueRecoveryCodes(c.env.DB, a.id);
  await audit(c.env.DB, a.id, 'recovery-codes-regenerated');
  return c.json({ recoveryCodes: codes });
});
account.get('/recovery-codes', async (c) => {
  const a = c.get('account')!;
  const r = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE account_id = ? AND used_at IS NULL').bind(a.id).first<{ n: number }>();
  return c.json({ remaining: r?.n ?? 0 });
});
account.patch('/', async (c) => {
  const a = c.get('account')!;
  const b = await c.req.json<{ email?: string | null; currentPassword?: string; newPassword?: string; securityQuestion?: number; securityAnswer?: string }>().catch(() => ({}) as Record<string, never>);
  if (b.newPassword !== undefined) {
    if (!(await verifySecret(b.currentPassword || '', a.pass_hash))) return err(c, 401, 'credentials', 'Current password is not right.', { fields: { currentPassword: 'Current password is not right.' } });
    const pp = passwordProblem(b.newPassword);
    if (pp) return err(c, 422, 'invalid', pp, { fields: { newPassword: pp } });
    await c.env.DB.prepare('UPDATE accounts SET pass_hash = ?, updated_at = ? WHERE id = ?').bind(await hashSecret(b.newPassword), now(), a.id).run();
    await revokeAllSessions(c.env.DB, a.id, c.get('session')!.id);
    await audit(c.env.DB, a.id, 'password-changed');
  }
  if (b.securityQuestion !== undefined) {
    if (!(b.securityQuestion >= 0 && b.securityQuestion < SECURITY_QUESTIONS.length) || normAnswer(b.securityAnswer || '').length < 2) return err(c, 422, 'invalid', 'Choose a question and type an answer.');
    await c.env.DB.prepare('UPDATE accounts SET sec_question = ?, sec_answer_hash = ?, updated_at = ? WHERE id = ?').bind(b.securityQuestion, await hashSecret(normAnswer(b.securityAnswer!)), now(), a.id).run();
    await audit(c.env.DB, a.id, 'security-question-changed');
  }
  if (b.email !== undefined) {
    const email = (b.email || '').trim().toLowerCase() || null;
    if (email && !EMAIL_RE.test(email)) return err(c, 422, 'invalid', 'Enter a valid email address.', { fields: { email: 'Enter a valid email address.' } });
    if (email) {
      const other = await c.env.DB.prepare('SELECT id FROM accounts WHERE email = ? AND id != ?').bind(email, a.id).first();
      if (other) return err(c, 422, 'invalid', 'That email is already used.', { fields: { email: 'That email is already used.' } });
    }
    await c.env.DB.prepare('UPDATE accounts SET email = ?, email_verified = 0, updated_at = ? WHERE id = ?').bind(email, now(), a.id).run();
    if (email) await sendVerification(c, { id: a.id, email, username: a.username });
    await audit(c.env.DB, a.id, 'email-changed');
  }
  const fresh = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(a.id).first<Account>();
  return c.json({ account: publicAccount(fresh!) });
});
account.post('/resend-verification', async (c) => {
  const a = c.get('account')!;
  if (!a.email || a.email_verified) return c.json({ ok: true });
  if (!(await rateLimit(c, `rv:${a.id}`, 3, 3600))) return err(c, 429, 'rate', 'Please wait before asking again.');
  await sendVerification(c, { id: a.id, email: a.email, username: a.username });
  return c.json({ ok: true });
});
account.get('/export', async (c) => {
  const a = c.get('account')!;
  const db = c.env.DB;
  const profiles = (await db.prepare('SELECT * FROM profiles WHERE account_id = ?').bind(a.id).all()).results;
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), account: { username: a.username, email: a.email, role: a.role }, profiles: [] };
  for (const p of profiles as Record<string, unknown>[]) {
    const pid = p.id;
    const q = async (sql: string) => (await db.prepare(sql).bind(pid).all()).results;
    (out.profiles as unknown[]).push({
      profile: { nickname: p.nickname, avatar: p.avatar, classLevel: p.class_level, ageBand: p.age_band, prefs: JSON.parse(String(p.prefs)) },
      attempts: await q('SELECT question_id, question_version, objective_id, mode, correct, response, hints_used, created_at FROM attempts WHERE profile_id = ?'),
      mastery: await q('SELECT * FROM mastery WHERE profile_id = ?'),
      lessons: await q('SELECT lesson_id, state, updated_at FROM lesson_state WHERE profile_id = ?'),
      rewards: await q('SELECT reward_id, earned_at FROM rewards WHERE profile_id = ?'),
      artworks: await q('SELECT id, title, data, version, created_at, updated_at FROM artworks WHERE profile_id = ? AND deleted_at IS NULL'),
    });
  }
  await audit(db, a.id, 'export');
  return c.json(out);
});
account.delete('/', async (c) => {
  const a = c.get('account')!;
  const b = await c.req.json<{ confirmUsername: string }>().catch(() => ({ confirmUsername: '' }));
  if ((b.confirmUsername || '').toLowerCase() !== a.username.toLowerCase()) return err(c, 422, 'confirm', 'Type your username to confirm.');
  const db = c.env.DB;
  const pids = (await db.prepare('SELECT id FROM profiles WHERE account_id = ?').bind(a.id).all<{ id: string }>()).results.map((r) => r.id);
  const stmts = [];
  for (const pid of pids) for (const t of ['attempts', 'mastery', 'lesson_state', 'rewards', 'activity_state', 'artworks', 'downloads']) stmts.push(db.prepare(`DELETE FROM ${t} WHERE profile_id = ?`).bind(pid));
  stmts.push(db.prepare('DELETE FROM profiles WHERE account_id = ?').bind(a.id));
  stmts.push(db.prepare('DELETE FROM sessions WHERE account_id = ?').bind(a.id));
  stmts.push(db.prepare('DELETE FROM recovery_codes WHERE account_id = ?').bind(a.id));
  stmts.push(db.prepare('DELETE FROM auth_tokens WHERE account_id = ?').bind(a.id));
  stmts.push(db.prepare('DELETE FROM reports WHERE account_id = ?').bind(a.id));
  stmts.push(db.prepare('DELETE FROM accounts WHERE id = ?').bind(a.id));
  await db.batch(stmts);
  await audit(db, null, 'account-deleted');
  clearCookie(c);
  return c.json({ ok: true });
});
