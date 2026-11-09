// Published content overrides + restricted educator editor (draft → validate → preview → publish → rollback).
// The bundled curriculum is version 1 of every item; edits create new versions in D1 without a rebuild.
import { Hono } from 'hono';
import { type Env, type Vars, now, err, audit } from './lib';
import { validateQuestion, type ValidationIssue } from '../src/shared/validate';
import type { Question } from '../src/shared/content';

type H = Hono<{ Bindings: Env; Variables: Vars }>;
export const content: H = new Hono();
export const admin: H = new Hono();

/** Learners fetch published overrides (cached for offline). */
content.get('/overrides', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT i.id, i.kind, v.version, v.data FROM content_items i JOIN content_versions v ON v.item_id = i.id AND v.version = i.published_version WHERE i.published_version > 1',
  ).all();
  return c.json({ overrides: results.map((r: Record<string, unknown>) => ({ id: r.id, kind: r.kind, version: r.version, data: JSON.parse(String(r.data)) })) });
});
/** Any historical version (so reviews show the exact wording a learner saw). */
content.get('/items/:id/versions/:v', async (c) => {
  const a = c.get('account');
  if (!a) return err(c, 401, 'auth', 'Please sign in.');
  const r = await c.env.DB.prepare('SELECT version, data, status FROM content_versions WHERE item_id = ? AND version = ?').bind(c.req.param('id'), +c.req.param('v')).first<Record<string, unknown>>();
  // Families may only see versions that were live at some point; unpublished drafts stay with educators.
  const staff = a.role === 'educator' || a.role === 'admin';
  if (!r || (!staff && r.status !== 'published' && r.status !== 'archived')) return err(c, 404, 'notfound', 'Version not found.');
  return c.json({ id: c.req.param('id'), version: r.version, data: JSON.parse(String(r.data)) });
});

admin.use('*', async (c, next) => {
  const a = c.get('account');
  if (!a) return err(c, 401, 'auth', 'Please sign in.');
  if (a.role !== 'educator' && a.role !== 'admin') return err(c, 403, 'role', 'Only educators can use the content editor.');
  await next();
});

admin.get('/items', async (c) => {
  const q = `%${(c.req.query('q') || '').trim()}%`;
  const { results } = await c.env.DB.prepare('SELECT id, kind, published_version, latest_version FROM content_items WHERE id LIKE ? ORDER BY id LIMIT 200').bind(q).all();
  return c.json({ items: results });
});
admin.get('/items/:id', async (c) => {
  const id = c.req.param('id');
  const item = await c.env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(id).first();
  if (!item) return err(c, 404, 'notfound', 'Item not found.');
  const { results } = await c.env.DB.prepare(
    'SELECT v.version, v.status, v.data, v.validation, v.created_at, v.published_at, a1.username AS author, a2.username AS publisher FROM content_versions v LEFT JOIN accounts a1 ON a1.id = v.author_id LEFT JOIN accounts a2 ON a2.id = v.published_by WHERE v.item_id = ? ORDER BY v.version DESC',
  ).bind(id).all();
  return c.json({ item, versions: results.map((r: Record<string, unknown>) => ({ ...r, data: JSON.parse(String(r.data)), validation: r.validation ? JSON.parse(String(r.validation)) : null })) });
});

admin.post('/items/:id/drafts', async (c) => {
  const a = c.get('account')!, id = c.req.param('id');
  const item = await c.env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(id).first<{ latest_version: number; kind: string }>();
  if (!item) return err(c, 404, 'notfound', 'Item not found.');
  const b = await c.req.json<{ data: unknown }>().catch(() => null);
  if (!b || typeof b.data !== 'object') return err(c, 400, 'bad', 'Invalid draft.');
  const v = item.latest_version + 1;
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO content_versions (item_id, version, data, status, author_id, created_at) VALUES (?,?,?,?,?,?)').bind(id, v, JSON.stringify(b.data), 'draft', a.id, now()),
    c.env.DB.prepare('UPDATE content_items SET latest_version = ? WHERE id = ?').bind(v, id),
  ]);
  await audit(c.env.DB, a.id, 'content-draft', { id, v });
  return c.json({ version: v });
});

function validateData(kind: string, data: Record<string, unknown>): ValidationIssue[] {
  if (kind === 'question') return validateQuestion(data as unknown as Question);
  const issues: ValidationIssue[] = [];
  // Objective / translation edits: titles must exist in English; Telugu optional.
  const title = data.title as { en?: string } | undefined;
  if (kind === 'objective' && !title?.en?.trim()) issues.push({ level: 'error', path: 'title', message: 'English title required' });
  if (kind === 'objective' && Array.isArray(data.examples) && data.examples.length < 2) issues.push({ level: 'error', path: 'examples', message: 'at least 2 worked examples' });
  return issues;
}

admin.post('/items/:id/versions/:v/validate', async (c) => {
  const id = c.req.param('id'), v = +c.req.param('v');
  const row = await c.env.DB.prepare('SELECT i.kind, v.data, v.status FROM content_versions v JOIN content_items i ON i.id = v.item_id WHERE v.item_id = ? AND v.version = ?').bind(id, v).first<{ kind: string; data: string; status: string }>();
  if (!row) return err(c, 404, 'notfound', 'Version not found.');
  const issues = validateData(row.kind, JSON.parse(row.data));
  const ok = !issues.some((i) => i.level === 'error');
  await c.env.DB.prepare('UPDATE content_versions SET validation = ?, status = ? WHERE item_id = ? AND version = ?')
    .bind(JSON.stringify({ ok, issues, at: now() }), ok && row.status === 'draft' ? 'validated' : row.status, id, v).run();
  return c.json({ ok, issues });
});

admin.post('/items/:id/versions/:v/publish', async (c) => {
  const a = c.get('account')!, id = c.req.param('id'), v = +c.req.param('v');
  const row = await c.env.DB.prepare('SELECT status FROM content_versions WHERE item_id = ? AND version = ?').bind(id, v).first<{ status: string }>();
  if (!row) return err(c, 404, 'notfound', 'Version not found.');
  if (row.status === 'draft') return err(c, 422, 'validate', 'Validate this version before publishing.');
  const t = now();
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE content_versions SET status = 'archived' WHERE item_id = ? AND status = 'published'").bind(id),
    c.env.DB.prepare("UPDATE content_versions SET status = 'published', published_by = ?, published_at = ? WHERE item_id = ? AND version = ?").bind(a.id, t, id, v),
    c.env.DB.prepare('UPDATE content_items SET published_version = ? WHERE id = ?').bind(v, id),
  ]);
  await audit(c.env.DB, a.id, 'content-publish', { id, v });
  return c.json({ ok: true, publishedVersion: v });
});

/** Rollback = re-publish an earlier version; the history and who did it are kept. */
admin.post('/items/:id/rollback', async (c) => {
  const a = c.get('account')!, id = c.req.param('id');
  const b = await c.req.json<{ toVersion: number }>().catch(() => ({ toVersion: 0 }));
  const row = await c.env.DB.prepare('SELECT status FROM content_versions WHERE item_id = ? AND version = ?').bind(id, b.toVersion).first<{ status: string }>();
  if (!row || row.status === 'draft') return err(c, 422, 'bad', 'Choose a previously validated or published version.');
  const t = now();
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE content_versions SET status = 'archived' WHERE item_id = ? AND status = 'published'").bind(id),
    c.env.DB.prepare("UPDATE content_versions SET status = 'published', published_by = ?, published_at = ? WHERE item_id = ? AND version = ?").bind(a.id, t, id, b.toVersion),
    c.env.DB.prepare('UPDATE content_items SET published_version = ? WHERE id = ?').bind(b.toVersion, id),
  ]);
  await audit(c.env.DB, a.id, 'content-rollback', { id, to: b.toVersion });
  return c.json({ ok: true, publishedVersion: b.toVersion });
});

admin.get('/reports', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, class_level, lesson_id, question_id, content_version, description, status, created_at FROM reports ORDER BY created_at DESC LIMIT 200').all();
  return c.json({ reports: results });
});
admin.patch('/reports/:id', async (c) => {
  const b = await c.req.json<{ status: string }>().catch(() => ({ status: 'open' }));
  if (!['open', 'fixed', 'wontfix'].includes(b.status)) return err(c, 422, 'bad', 'Invalid status.');
  await c.env.DB.prepare('UPDATE reports SET status = ? WHERE id = ?').bind(b.status, c.req.param('id')).run();
  return c.json({ ok: true });
});
