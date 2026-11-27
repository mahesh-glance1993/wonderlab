// Child profiles and everything private to a profile. Every route checks that the profile
// belongs to the signed-in account (profile + account isolation enforced on the server).
import { Hono } from 'hono';
import { type Env, type Vars, type C, now, uid, err, isVerified, audit } from './lib';
import { AGE_BANDS, AVATARS, MAX_BULK, MAX_PROFILES, nicknameProblem, suggestAgeBand, type ClassLevel } from '../src/shared/levels';
import { CONSENT_VERSION } from '../src/shared/legal';
import { applyAttempt, emptyMastery, type MasteryState } from '../src/shared/mastery';

type H = Hono<{ Bindings: Env; Variables: Vars }>;
export const profiles: H = new Hono();
export const learner: H = new Hono();

const SAFE_PREF_KEYS = ['language', 'theme', 'textSize', 'reduceMotion', 'mute', 'volume', 'narration', 'pressureMode', 'manualIntensity', 'calibration', 'lastActivity', 'timers', 'keepFullscreen', 'artPalettes', 'readingSpeed', 'voiceEn', 'voiceTe', 'naturalVoice', 'naturalSpeaker'];
const PARENT_PREF_KEYS = ['breakMinutes', 'breakEnabled', 'board'];
const limitMessage = (left: number) => left <= 0
  ? `This account already has ${MAX_PROFILES} learner profiles, the most one account can hold. Remove a learner who has left to add another.`
  : `Only ${left} more learner profile${left === 1 ? '' : 's'} can be added (up to ${MAX_PROFILES} per account).`;
const MAX_PREFS_BYTES = 32 * 1024; // prefs are free-form values under allowed keys; keep rows small

function cleanPrefs(input: Record<string, unknown>, allowParent: boolean) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input || {})) {
    if (SAFE_PREF_KEYS.includes(k) || (allowParent && PARENT_PREF_KEYS.includes(k))) out[k] = v;
  }
  return out;
}
const rowToProfile = (p: Record<string, unknown>) => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, classLevel: p.class_level, ageBand: p.age_band, prefs: JSON.parse(String(p.prefs || '{}')) });

profiles.use('*', async (c, next) => {
  if (!c.get('account')) return err(c, 401, 'auth', 'Please sign in.');
  await next();
});
profiles.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM profiles WHERE account_id = ? ORDER BY created_at').bind(c.get('account')!.id).all();
  return c.json({ profiles: results.map(rowToProfile) });
});
profiles.post('/', async (c) => {
  const a = c.get('account')!;
  const count = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM profiles WHERE account_id = ?').bind(a.id).first<{ n: number }>();
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent needs to confirm their password first.');
  // no child data before a parent/guardian has agreed to the current Privacy Policy and Terms
  if (a.consent_version !== CONSENT_VERSION) return err(c, 403, 'consent', 'A parent or guardian needs to agree to the Privacy Policy and Terms first.');
  if ((count?.n ?? 0) >= MAX_PROFILES) return err(c, 422, 'limit', limitMessage(0));
  const b = await c.req.json<{ nickname: string; avatar: string; classLevel: number; ageBand: string; prefs?: Record<string, unknown> }>().catch(() => null);
  const fields: Record<string, string> = {};
  const nickname = (b?.nickname || '').trim();
  const nickProblem = nicknameProblem(nickname);
  if (nickProblem) fields.nickname = nickProblem;
  if (!AVATARS.includes(b?.avatar as never)) fields.avatar = 'Choose an avatar.';
  if (!(Number.isInteger(b?.classLevel) && b!.classLevel >= 0 && b!.classLevel <= 12)) fields.classLevel = 'Choose a class.';
  if (!AGE_BANDS.some((x) => x.id === b?.ageBand)) fields.ageBand = 'Choose an age band.';
  if (JSON.stringify(cleanPrefs(b?.prefs || {}, true)).length > MAX_PREFS_BYTES) fields.prefs = 'Settings are too large.';
  if (Object.keys(fields).length) return err(c, 422, 'invalid', 'Please check the highlighted fields.', { fields });
  const id = uid(), t = now();
  await c.env.DB.prepare('INSERT INTO profiles (id, account_id, nickname, avatar, class_level, age_band, prefs, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, a.id, nickname, b!.avatar, b!.classLevel, b!.ageBand, JSON.stringify(cleanPrefs(b!.prefs || {}, true)), t, t).run();
  await audit(c.env.DB, a.id, 'profile-created');
  const p = await c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(id).first();
  return c.json({ profile: rowToProfile(p!) });
});

/**
 * Teachers: add several learners at once (first names / nicknames only), all in one class. All or nothing:
 * any invalid name or going over the profile limit rejects the whole list, so nothing is half-added.
 */
profiles.post('/bulk', async (c) => {
  const a = c.get('account')!, db = c.env.DB;
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent or teacher needs to confirm their password first.');
  // no child data before a parent/guardian has agreed to the current Privacy Policy and Terms
  if (a.consent_version !== CONSENT_VERSION) return err(c, 403, 'consent', 'A parent or guardian needs to agree to the Privacy Policy and Terms first.');
  const b = await c.req.json<{ nicknames: string[]; classLevel: number; ageBand?: string; language?: string }>().catch(() => null);
  if (!b || !Array.isArray(b.nicknames)) return err(c, 400, 'bad', 'Invalid request.');
  if (!(Number.isInteger(b.classLevel) && b.classLevel >= 0 && b.classLevel <= 12)) return err(c, 422, 'invalid', 'Choose a class.', { fields: { classLevel: 'Choose a class.' } });
  const ageBand = b.ageBand ?? suggestAgeBand(b.classLevel as ClassLevel);
  if (!AGE_BANDS.some((x) => x.id === ageBand)) return err(c, 422, 'invalid', 'Choose an age band.', { fields: { ageBand: 'Choose an age band.' } });
  const names = b.nicknames.map((n) => String(n ?? '').trim().replace(/\s+/g, ' ')).filter(Boolean);
  if (!names.length) return err(c, 422, 'invalid', 'Type at least one first name.', { fields: { nicknames: 'Type at least one first name.' } });
  if (names.length > MAX_BULK) return err(c, 422, 'invalid', `Add up to ${MAX_BULK} learners at a time.`, { fields: { nicknames: `Add up to ${MAX_BULK} learners at a time.` } });
  const bad = names.map((n) => ({ n, p: nicknameProblem(n) })).filter((x) => x.p);
  if (bad.length) return err(c, 422, 'invalid', `Please fix: ${bad.slice(0, 5).map((x) => `“${x.n.slice(0, 30)}” — ${x.p}`).join(' ')}`, { fields: { nicknames: bad[0].p! } });
  const count = (await db.prepare('SELECT COUNT(*) AS n FROM profiles WHERE account_id = ?').bind(a.id).first<{ n: number }>())?.n ?? 0;
  if (count + names.length > MAX_PROFILES) return err(c, 422, 'limit', limitMessage(MAX_PROFILES - count));
  const prefs = JSON.stringify(b.classLevel <= 5 && b.language === 'te' ? { language: 'te' } : {});
  const t = now();
  const rows = names.map((n, i) => ({ id: uid(), nickname: n, avatar: AVATARS[(count + i) % AVATARS.length] }));
  await db.batch(rows.map((r, i) => db.prepare('INSERT INTO profiles (id, account_id, nickname, avatar, class_level, age_band, prefs, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(r.id, a.id, r.nickname, r.avatar, b.classLevel, ageBand, prefs, t + i * 0.001, t)));
  await audit(db, a.id, 'profiles-bulk-created', String(rows.length));
  const { results } = await db.prepare(`SELECT * FROM profiles WHERE account_id = ? AND id IN (${rows.map(() => '?').join(',')}) ORDER BY created_at`).bind(a.id, ...rows.map((r) => r.id)).all();
  return c.json({ profiles: results.map(rowToProfile) });
});

/**
 * Class overview (read-only): every learner in THIS account with their per-skill progress and when they were
 * last active. Only the signed-in account's own profiles; parent/teacher check required, because learners on a
 * shared class account must not see each other's progress. Names of skills/chapters come from the curriculum
 * on the device, so no answers, responses or timings leave the server.
 */
profiles.get('/overview', async (c) => {
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent or teacher needs to confirm their password first.');
  const aid = c.get('account')!.id, db = c.env.DB;
  const [p, m, last] = await Promise.all([
    db.prepare('SELECT id, nickname, avatar, class_level, prefs FROM profiles WHERE account_id = ? ORDER BY created_at').bind(aid).all(),
    db.prepare(`SELECT m.profile_id, m.objective_id, m.attempts, m.correct, json_array_length(m.distinct_correct) AS dc, m.mastered_at
      FROM mastery m JOIN profiles p ON p.id = m.profile_id WHERE p.account_id = ?`).bind(aid).all(),
    db.prepare(`SELECT pid, MAX(t) AS t FROM (
        SELECT m.profile_id AS pid, MAX(m.updated_at) AS t FROM mastery m JOIN profiles p ON p.id = m.profile_id WHERE p.account_id = ?1 GROUP BY m.profile_id
        UNION ALL SELECT l.profile_id, MAX(l.updated_at) FROM lesson_state l JOIN profiles p ON p.id = l.profile_id WHERE p.account_id = ?1 GROUP BY l.profile_id
        UNION ALL SELECT s.profile_id, MAX(s.updated_at) FROM activity_state s JOIN profiles p ON p.id = s.profile_id WHERE p.account_id = ?1 GROUP BY s.profile_id
      ) GROUP BY pid`).bind(aid).all(),
  ]);
  const byProfile = new Map<string, unknown[][]>();
  for (const r of m.results as Record<string, unknown>[]) {
    const list = byProfile.get(String(r.profile_id)) ?? [];
    list.push([r.objective_id, Number(r.attempts), Number(r.correct), Number(r.dc ?? 0), (r.mastered_at as number | null) ?? null]);
    byProfile.set(String(r.profile_id), list);
  }
  const lastActive = new Map((last.results as Record<string, unknown>[]).map((r) => [String(r.pid), Number(r.t) || null]));
  const board = (prefs: unknown) => { try { const b = (JSON.parse(String(prefs || '{}')) as { board?: unknown }).board; return typeof b === 'string' ? b : null; } catch { return null; } };
  return c.json({
    generatedAt: now(),
    profiles: (p.results as Record<string, unknown>[]).map((r) => ({
      id: r.id, nickname: r.nickname, avatar: r.avatar, classLevel: r.class_level, board: board(r.prefs),
      lastActive: lastActive.get(String(r.id)) ?? null, mastery: byProfile.get(String(r.id)) ?? [],
    })),
  });
});

// ---------- per-profile routes ----------
learner.use('/:pid/*', async (c, next) => {
  const a = c.get('account');
  if (!a) return err(c, 401, 'auth', 'Please sign in.');
  const pid = c.req.param('pid');
  const p = await c.env.DB.prepare('SELECT id FROM profiles WHERE id = ? AND account_id = ?').bind(pid, a.id).first();
  if (!p) return err(c, 404, 'notfound', 'Profile not found.'); // same answer for "not yours" and "missing"
  c.set('profileId', pid);
  await next();
});

learner.patch('/:pid/profile', async (c) => {
  const pid = c.get('profileId')!;
  const b = await c.req.json<{ nickname?: string; avatar?: string; classLevel?: number; ageBand?: string; prefs?: Record<string, unknown> }>().catch(() => ({}) as Record<string, never>);
  const cur = await c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(pid).first<Record<string, unknown>>();
  const verified = isVerified(c);
  const sets: string[] = [], vals: unknown[] = [];
  if (b.avatar !== undefined) {
    if (!AVATARS.includes(b.avatar as never)) return err(c, 422, 'invalid', 'Choose an avatar.');
    sets.push('avatar = ?'); vals.push(b.avatar);
  }
  if (b.nickname !== undefined || b.classLevel !== undefined || b.ageBand !== undefined) {
    if (!verified) return err(c, 403, 'verify', 'A parent needs to confirm their password to change this.');
    if (b.nickname !== undefined) { const n = String(b.nickname).trim(), problem = nicknameProblem(n); if (problem) return err(c, 422, 'invalid', problem); sets.push('nickname = ?'); vals.push(n); }
    if (b.classLevel !== undefined) { if (!(Number.isInteger(b.classLevel) && b.classLevel >= 0 && b.classLevel <= 12)) return err(c, 422, 'invalid', 'Choose a class.'); sets.push('class_level = ?'); vals.push(b.classLevel); }
    if (b.ageBand !== undefined) { if (!AGE_BANDS.some((x) => x.id === b.ageBand)) return err(c, 422, 'invalid', 'Choose an age band.'); sets.push('age_band = ?'); vals.push(b.ageBand); }
  }
  if (b.prefs) {
    const merged = { ...JSON.parse(String(cur!.prefs || '{}')), ...cleanPrefs(b.prefs, verified) };
    if (JSON.stringify(merged).length > MAX_PREFS_BYTES) return err(c, 422, 'too-big', 'Settings are too large.');
    sets.push('prefs = ?'); vals.push(JSON.stringify(merged));
  }
  if (sets.length) await c.env.DB.prepare(`UPDATE profiles SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`).bind(...vals, now(), pid).run();
  const p = await c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(pid).first();
  return c.json({ profile: rowToProfile(p!) });
});

learner.delete('/:pid/profile', async (c) => {
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent needs to confirm their password first.');
  const pid = c.get('profileId')!, db = c.env.DB;
  await db.batch([...['attempts', 'mastery', 'lesson_state', 'rewards', 'activity_state', 'artworks', 'downloads'].map((t) => db.prepare(`DELETE FROM ${t} WHERE profile_id = ?`).bind(pid)), db.prepare('DELETE FROM reports WHERE profile_id = ?').bind(pid), db.prepare('DELETE FROM profiles WHERE id = ?').bind(pid)]);
  await audit(db, c.get('account')!.id, 'profile-deleted');
  return c.json({ ok: true });
});

const rowToMastery = (r: Record<string, unknown>): MasteryState => ({
  objectiveId: String(r.objective_id), attempts: Number(r.attempts), correct: Number(r.correct), distinctCorrect: JSON.parse(String(r.distinct_correct)),
  streak: Number(r.streak), level: Number(r.level), masteredAt: (r.mastered_at as number) ?? null, nextReviewAt: (r.next_review_at as number) ?? null, updatedAt: Number(r.updated_at),
});

/** Everything the app needs to resume a learner (also cached for offline). */
learner.get('/:pid/state', async (c) => {
  const pid = c.get('profileId')!, db = c.env.DB;
  const [m, l, r, a, d, recent] = await Promise.all([
    db.prepare('SELECT * FROM mastery WHERE profile_id = ?').bind(pid).all(),
    db.prepare('SELECT lesson_id, state, updated_at FROM lesson_state WHERE profile_id = ?').bind(pid).all(),
    db.prepare('SELECT reward_id, earned_at FROM rewards WHERE profile_id = ?').bind(pid).all(),
    db.prepare('SELECT activity_id, state, updated_at FROM activity_state WHERE profile_id = ?').bind(pid).all(),
    db.prepare('SELECT pack_id, pack_version, downloaded_at FROM downloads WHERE profile_id = ?').bind(pid).all(),
    db.prepare('SELECT objective_id, correct, mode, created_at FROM attempts WHERE profile_id = ? ORDER BY created_at DESC LIMIT 200').bind(pid).all(),
  ]);
  return c.json({
    mastery: m.results.map(rowToMastery),
    lessons: l.results.map((x: Record<string, unknown>) => ({ lessonId: x.lesson_id, state: JSON.parse(String(x.state)), updatedAt: x.updated_at })),
    rewards: r.results.map((x: Record<string, unknown>) => ({ rewardId: x.reward_id, earnedAt: x.earned_at })),
    activities: a.results.map((x: Record<string, unknown>) => ({ activityId: x.activity_id, state: JSON.parse(String(x.state)), updatedAt: x.updated_at })),
    downloads: d.results.map((x: Record<string, unknown>) => ({ packId: x.pack_id, version: x.pack_version, downloadedAt: x.downloaded_at })),
    recentAttempts: recent.results,
  });
});

interface AttemptIn { id: string; questionId: string; questionVersion: number; objectiveId: string; mode: 'learn' | 'practice' | 'test' | 'game' | 'diagnostic'; correct: boolean; response?: unknown; hintsUsed?: number; durationMs?: number; at: number }
/** Idempotent batch upload: retries never double-count (attempt ids are client-generated UUIDs). */
learner.post('/:pid/attempts', async (c) => {
  const pid = c.get('profileId')!, db = c.env.DB;
  const b = await c.req.json<{ attempts: AttemptIn[] }>().catch(() => ({ attempts: [] }));
  const list = (b.attempts || []).slice(0, 200).filter((x) => x && /^[0-9a-f-]{36}$/i.test(x.id) && x.questionId && x.objectiveId).sort((x, y) => x.at - y.at);
  const touched = new Map<string, MasteryState>();
  let inserted = 0;
  for (const x of list) {
    const at = Math.min(now(), Math.max(0, Math.floor(x.at || now())));
    const res = await db.prepare('INSERT OR IGNORE INTO attempts (id, profile_id, question_id, question_version, objective_id, mode, correct, response, hints_used, duration_ms, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(x.id, pid, String(x.questionId).slice(0, 120), x.questionVersion | 0, String(x.objectiveId).slice(0, 80), x.mode, x.correct ? 1 : 0, JSON.stringify(x.response ?? null).slice(0, 2000), (x.hintsUsed ?? 0) | 0, (x.durationMs ?? 0) | 0, at).run();
    if (!res.meta.changes) continue; // already recorded — retry is a no-op
    inserted++;
    let m = touched.get(x.objectiveId);
    if (!m) {
      const row = await db.prepare('SELECT * FROM mastery WHERE profile_id = ? AND objective_id = ?').bind(pid, x.objectiveId).first();
      m = row ? rowToMastery(row) : emptyMastery(x.objectiveId, at);
    }
    touched.set(x.objectiveId, applyAttempt(m, { questionId: x.questionId, correct: !!x.correct, hintsUsed: (x.hintsUsed ?? 0) | 0, mode: x.mode, at }));
  }
  for (const m of touched.values()) {
    await db.prepare(`INSERT INTO mastery (profile_id, objective_id, attempts, correct, distinct_correct, streak, level, mastered_at, next_review_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(profile_id, objective_id) DO UPDATE SET attempts=excluded.attempts, correct=excluded.correct, distinct_correct=excluded.distinct_correct, streak=excluded.streak, level=excluded.level, mastered_at=excluded.mastered_at, next_review_at=excluded.next_review_at, updated_at=excluded.updated_at`)
      .bind(pid, m.objectiveId, m.attempts, m.correct, JSON.stringify(m.distinctCorrect), m.streak, m.level, m.masteredAt, m.nextReviewAt, m.updatedAt).run();
  }
  return c.json({ inserted, mastery: [...touched.values()] });
});

/** Last-writer-wins by client timestamp, so an older offline save never clobbers newer progress. */
async function putState(c: C, table: 'lesson_state' | 'activity_state', col: 'lesson_id' | 'activity_id', key: string) {
  const pid = c.get('profileId')!;
  const b = await c.req.json<{ state: unknown; updatedAt?: number }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  const s = JSON.stringify(b.state ?? null);
  if (s.length > 100_000) return err(c, 422, 'too-big', 'State too large.');
  const t = Math.min(now(), b.updatedAt || now());
  await c.env.DB.prepare(`INSERT INTO ${table} (profile_id, ${col}, state, updated_at) VALUES (?,?,?,?) ON CONFLICT(profile_id, ${col}) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at WHERE excluded.updated_at >= ${table}.updated_at`)
    .bind(pid, key.slice(0, 120), s, t).run();
  return c.json({ ok: true });
}
learner.put('/:pid/lessons/:lid', (c) => putState(c, 'lesson_state', 'lesson_id', c.req.param('lid')));
learner.put('/:pid/activities/:aid', (c) => putState(c, 'activity_state', 'activity_id', c.req.param('aid')));

learner.post('/:pid/rewards', async (c) => {
  const b = await c.req.json<{ rewardIds: string[] }>().catch(() => ({ rewardIds: [] }));
  for (const r of (b.rewardIds || []).slice(0, 50)) await c.env.DB.prepare('INSERT OR IGNORE INTO rewards (profile_id, reward_id, earned_at) VALUES (?,?,?)').bind(c.get('profileId')!, String(r).slice(0, 80), now()).run();
  return c.json({ ok: true });
});

// ---------- artwork (versioned; conflicts preserve both copies) ----------
learner.get('/:pid/artworks', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, title, thumb, version, conflict_of, created_at, updated_at FROM artworks WHERE profile_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC').bind(c.get('profileId')!).all();
  return c.json({ artworks: results.map((r: Record<string, unknown>) => ({ id: r.id, title: r.title, thumb: r.thumb, version: r.version, conflictOf: r.conflict_of, createdAt: r.created_at, updatedAt: r.updated_at })) });
});
learner.get('/:pid/artworks/:id', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM artworks WHERE id = ? AND profile_id = ? AND deleted_at IS NULL').bind(c.req.param('id'), c.get('profileId')!).first<Record<string, unknown>>();
  if (!r) return err(c, 404, 'notfound', 'Artwork not found.');
  return c.json({ artwork: { id: r.id, title: r.title, data: JSON.parse(String(r.data)), thumb: r.thumb, version: r.version, conflictOf: r.conflict_of, updatedAt: r.updated_at } });
});
const ART_MAX = 4_500_000; // bytes of JSON per project
learner.put('/:pid/artworks/:id', async (c) => {
  const pid = c.get('profileId')!, id = c.req.param('id'), db = c.env.DB;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return err(c, 400, 'bad', 'Invalid id.');
  const b = await c.req.json<{ title: string; data: unknown; thumb?: string; baseVersion: number }>().catch(() => null);
  if (!b) return err(c, 400, 'bad', 'Invalid request.');
  const data = JSON.stringify(b.data ?? {});
  if (data.length > ART_MAX) return err(c, 422, 'too-big', 'This artwork is too large to save. Try merging layers or using a smaller canvas.');
  const title = String(b.title || 'My artwork').slice(0, 60), thumb = (b.thumb || '').slice(0, 200_000), t = now();
  const cur = await db.prepare('SELECT version, profile_id, deleted_at FROM artworks WHERE id = ?').bind(id).first<{ version: number; profile_id: string; deleted_at: number | null }>();
  if (cur && cur.profile_id !== pid) return err(c, 404, 'notfound', 'Artwork not found.');
  if (!cur) {
    await db.prepare('INSERT INTO artworks (id, profile_id, title, data, thumb, version, created_at, updated_at) VALUES (?,?,?,?,?,1,?,?)').bind(id, pid, title, data, thumb, t, t).run();
    return c.json({ id, version: 1 });
  }
  if (cur.version !== b.baseVersion) {
    // Idempotent retry: an offline device re-sends a save whose first response was lost (the server
    // already applied it). Same content → report success instead of inventing a conflict copy.
    const same = await db.prepare('SELECT version FROM artworks WHERE id = ? AND profile_id = ? AND deleted_at IS NULL AND title = ? AND data = ?').bind(id, pid, title, data).first<{ version: number }>();
    if (same && cur.version > b.baseVersion) return c.json({ id, version: same.version });
    // A retried conflicting save: the preserved copy already exists → return it, don't add another.
    const prevCopy = await db.prepare('SELECT id FROM artworks WHERE profile_id = ? AND conflict_of = ? AND deleted_at IS NULL AND data = ? LIMIT 1').bind(pid, id, data).first<{ id: string }>();
    if (prevCopy) return c.json({ error: { code: 'conflict', message: 'This artwork was changed on another device. Both versions were kept.' }, conflictCopyId: prevCopy.id, serverVersion: cur.version }, 409);
    // Someone (another device) saved first. Keep theirs AND ours: ours becomes a separate copy.
    const copyId = uid();
    await db.prepare('INSERT INTO artworks (id, profile_id, title, data, thumb, version, conflict_of, created_at, updated_at) VALUES (?,?,?,?,?,1,?,?,?)').bind(copyId, pid, `${title} (other device)`, data, thumb, id, t, t).run();
    return c.json({ error: { code: 'conflict', message: 'This artwork was changed on another device. Both versions were kept.' }, conflictCopyId: copyId, serverVersion: cur.version }, 409);
  }
  const res = await db.prepare('UPDATE artworks SET title = ?, data = ?, thumb = ?, version = version + 1, updated_at = ?, deleted_at = NULL WHERE id = ? AND version = ?').bind(title, data, thumb, t, id, b.baseVersion).run();
  if (!res.meta.changes) return err(c, 409, 'conflict', 'Please retry.');
  return c.json({ id, version: cur.version + 1 });
});
/** Resolve a conflict: keep one version, discard the other. */
learner.post('/:pid/artworks/:id/resolve', async (c) => {
  const pid = c.get('profileId')!, id = c.req.param('id');
  const b = await c.req.json<{ keep: 'original' | 'copy' }>().catch(() => ({ keep: 'original' as const }));
  const copy = await c.env.DB.prepare('SELECT * FROM artworks WHERE id = ? AND profile_id = ? AND conflict_of IS NOT NULL').bind(id, pid).first<Record<string, unknown>>();
  if (!copy) return err(c, 404, 'notfound', 'Conflict copy not found.');
  const t = now();
  if (b.keep === 'copy') {
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE artworks SET data = ?, thumb = ?, title = replace(?, ' (other device)', ''), version = version + 1, updated_at = ? WHERE id = ? AND profile_id = ?").bind(copy.data, copy.thumb, copy.title, t, copy.conflict_of, pid),
      c.env.DB.prepare('UPDATE artworks SET deleted_at = ? WHERE id = ?').bind(t, id),
    ]);
  } else {
    await c.env.DB.prepare('UPDATE artworks SET deleted_at = ? WHERE id = ?').bind(t, id).run();
  }
  return c.json({ ok: true, keptId: copy.conflict_of });
});
learner.delete('/:pid/artworks/:id', async (c) => {
  await c.env.DB.prepare('UPDATE artworks SET deleted_at = ? WHERE id = ? AND profile_id = ?').bind(now(), c.req.param('id'), c.get('profileId')!).run();
  return c.json({ ok: true });
});

// ---------- downloads ----------
learner.put('/:pid/downloads/:pack', async (c) => {
  const b = await c.req.json<{ version: string }>().catch(() => ({ version: '1' }));
  await c.env.DB.prepare('INSERT INTO downloads (profile_id, pack_id, pack_version, downloaded_at) VALUES (?,?,?,?) ON CONFLICT(profile_id, pack_id) DO UPDATE SET pack_version = excluded.pack_version, downloaded_at = excluded.downloaded_at')
    .bind(c.get('profileId')!, c.req.param('pack').slice(0, 80), String(b.version || '1').slice(0, 20), now()).run();
  return c.json({ ok: true });
});
learner.delete('/:pid/downloads/:pack', async (c) => {
  await c.env.DB.prepare('DELETE FROM downloads WHERE profile_id = ? AND pack_id = ?').bind(c.get('profileId')!, c.req.param('pack')).run();
  return c.json({ ok: true });
});

// ---------- private problem reports ----------
learner.post('/:pid/reports', async (c) => {
  const b = await c.req.json<{ classLevel?: number; lessonId?: string; questionId?: string; contentVersion?: number; description?: string }>().catch(() => ({}) as Record<string, never>);
  await c.env.DB.prepare('INSERT INTO reports (id, account_id, profile_id, class_level, lesson_id, question_id, content_version, description, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(uid(), c.get('account')!.id, c.get('profileId')!, b.classLevel ?? null, (b.lessonId || '').slice(0, 120), (b.questionId || '').slice(0, 120), b.contentVersion ?? null, (b.description || '').slice(0, 1000), now()).run();
  return c.json({ ok: true, message: 'Thank you! Our team will look at it.' });
});
