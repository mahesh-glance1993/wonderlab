// Child profiles and everything private to a profile. Every route checks that the profile
// belongs to the signed-in account (profile + account isolation enforced on the server).
import { Hono } from 'hono';
import { type Env, type Vars, type C, now, uid, err, isVerified, audit } from './lib';
import { AGE_BANDS, AVATARS } from '../src/shared/levels';
import { applyAttempt, emptyMastery, type MasteryState } from '../src/shared/mastery';

type H = Hono<{ Bindings: Env; Variables: Vars }>;
export const profiles: H = new Hono();
export const learner: H = new Hono();

const SAFE_PREF_KEYS = ['language', 'theme', 'textSize', 'reduceMotion', 'mute', 'volume', 'narration', 'pressureMode', 'manualIntensity', 'calibration', 'lastActivity', 'timers', 'keepFullscreen', 'artPalettes', 'readingSpeed', 'voiceEn', 'voiceTe', 'naturalVoice', 'naturalSpeaker'];
const PARENT_PREF_KEYS = ['breakMinutes', 'breakEnabled'];
const MAX_PROFILES = 8;

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
  if ((count?.n ?? 0) >= MAX_PROFILES) return err(c, 422, 'limit', `Up to ${MAX_PROFILES} learner profiles per family.`);
  const b = await c.req.json<{ nickname: string; avatar: string; classLevel: number; ageBand: string; prefs?: Record<string, unknown> }>().catch(() => null);
  const fields: Record<string, string> = {};
  const nickname = (b?.nickname || '').trim();
  if (!nickname || nickname.length > 20) fields.nickname = 'Use a short nickname (1–20 letters).';
  if (/@|\d{6,}/.test(nickname)) fields.nickname = 'Please use a nickname, not an email or phone number.';
  if (!AVATARS.includes(b?.avatar as never)) fields.avatar = 'Choose an avatar.';
  if (!(Number.isInteger(b?.classLevel) && b!.classLevel >= 0 && b!.classLevel <= 12)) fields.classLevel = 'Choose a class.';
  if (!AGE_BANDS.some((x) => x.id === b?.ageBand)) fields.ageBand = 'Choose an age band.';
  if (Object.keys(fields).length) return err(c, 422, 'invalid', 'Please check the highlighted fields.', { fields });
  const id = uid(), t = now();
  await c.env.DB.prepare('INSERT INTO profiles (id, account_id, nickname, avatar, class_level, age_band, prefs, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, a.id, nickname, b!.avatar, b!.classLevel, b!.ageBand, JSON.stringify(cleanPrefs(b!.prefs || {}, true)), t, t).run();
  await audit(c.env.DB, a.id, 'profile-created');
  const p = await c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(id).first();
  return c.json({ profile: rowToProfile(p!) });
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
    if (b.nickname !== undefined) { const n = b.nickname.trim(); if (!n || n.length > 20) return err(c, 422, 'invalid', 'Use a short nickname.'); sets.push('nickname = ?'); vals.push(n); }
    if (b.classLevel !== undefined) { if (!(Number.isInteger(b.classLevel) && b.classLevel >= 0 && b.classLevel <= 12)) return err(c, 422, 'invalid', 'Choose a class.'); sets.push('class_level = ?'); vals.push(b.classLevel); }
    if (b.ageBand !== undefined) { if (!AGE_BANDS.some((x) => x.id === b.ageBand)) return err(c, 422, 'invalid', 'Choose an age band.'); sets.push('age_band = ?'); vals.push(b.ageBand); }
  }
  if (b.prefs) {
    const merged = { ...JSON.parse(String(cur!.prefs || '{}')), ...cleanPrefs(b.prefs, verified) };
    sets.push('prefs = ?'); vals.push(JSON.stringify(merged));
  }
  if (sets.length) await c.env.DB.prepare(`UPDATE profiles SET ${sets.join(', ')}, updated_at = ? WHERE id = ?`).bind(...vals, now(), pid).run();
  const p = await c.env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(pid).first();
  return c.json({ profile: rowToProfile(p!) });
});

learner.delete('/:pid/profile', async (c) => {
  if (!isVerified(c)) return err(c, 403, 'verify', 'A parent needs to confirm their password first.');
  const pid = c.get('profileId')!, db = c.env.DB;
  await db.batch([...['attempts', 'mastery', 'lesson_state', 'rewards', 'activity_state', 'artworks', 'downloads'].map((t) => db.prepare(`DELETE FROM ${t} WHERE profile_id = ?`).bind(pid)), db.prepare('DELETE FROM profiles WHERE id = ?').bind(pid)]);
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
