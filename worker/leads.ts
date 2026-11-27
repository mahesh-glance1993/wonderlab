// School / tuition-centre enquiries ("leads") from the public /schools page.
// POST /api/leads is public (rate-limited, honeypot, validated); reading and managing leads is
// admin-only, using the same signed-in role check as the content editor (worker/content.ts).
// Leads hold adult staff contact details only. Retention: 2 years (docs/OPERATIONS.md).
import { Hono } from 'hono';
import { type Env, type Vars, type C, now, uid, err, rateLimit, clientIp, sendEmail, audit } from './lib';
import { validateLead, isHoneypotFilled, classesLabel, LEAD_STATUSES, LEAD_RETENTION_DAYS, type LeadInput, type LeadStatus } from '../src/shared/leads';

export const leads = new Hono<{ Bindings: Env; Variables: Vars }>();

const MAX_BODY = 8 * 1024;
const PER_IP_PER_HOUR = 5;

function notifyBody(id: string, l: LeadInput, origin: string) {
  return [
    `New WonderLab enquiry (${l.kind})`,
    '',
    `Contact: ${l.contactName} (${l.role})`,
    `Organisation: ${l.orgName}`,
    `Town/district: ${l.town}`,
    `Email: ${l.email ?? '-'}`,
    `Phone: ${l.phone ?? '-'}`,
    `Approx. students: ${l.students ?? '-'}`,
    `Classes: ${l.classes.length ? classesLabel(l.classes) : '-'}`,
    '',
    'Message:',
    l.message || '-',
    '',
    `Lead id: ${id}`,
    `Review all leads (admin sign-in): ${origin}/api/leads`,
  ].join('\n');
}

leads.post('/', async (c) => {
  const len = Number(c.req.header('Content-Length') || 0);
  if (len > MAX_BODY) return c.json({ error: { code: 'too-big', message: 'Enquiry too large.' } }, 413);
  // The IP is only used as a limiter key; it is not stored with the lead.
  if (!(await rateLimit(c, `lead:${clientIp(c)}`, PER_IP_PER_HOUR, 3600))) return err(c, 429, 'rate', 'Too many enquiries from this network. Please try again in an hour.');
  const raw = await c.req.text().catch(() => '');
  if (raw.length > MAX_BODY) return c.json({ error: { code: 'too-big', message: 'Enquiry too large.' } }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return err(c, 400, 'bad', 'Invalid enquiry.'); }
  // Bots that fill the hidden field get a normal-looking success and nothing is stored.
  if (isHoneypotFilled(body)) return c.json({ ok: true }, 201);
  const v = validateLead(body);
  if (!v.ok) return err(c, 422, 'invalid', 'Please check the highlighted fields.', { fields: v.errors });
  const l = v.lead;
  const b = body as Record<string, unknown>;
  const lang = b.lang === 'te' ? 'te' : 'en';
  const id = uid();
  const t = now();
  await c.env.DB.prepare(
    'INSERT INTO leads (id, created_at, updated_at, kind, contact_name, contact_role, org_name, town, email, phone, students, classes, message, lang) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  ).bind(id, t, t, l.kind, l.contactName, l.role, l.orgName, l.town, l.email, l.phone, l.students, l.classes.join(','), l.message, lang).run();
  const to = (c.env.LEADS_NOTIFY_EMAIL || '').trim();
  if (to) {
    try {
      await sendEmail(c.env, to, `WonderLab enquiry: ${l.orgName} (${l.town})`.slice(0, 200), notifyBody(id, l, c.env.APP_ORIGIN));
    } catch (e) {
      console.error('leads: notification email failed', e); // the lead is already saved
    }
  }
  return c.json({ ok: true }, 201);
});

// ---------------- operator (admin) ----------------
function requireAdmin(c: C) {
  const a = c.get('account');
  if (!a) return err(c, 401, 'auth', 'Please sign in.');
  if (a.role !== 'admin') return err(c, 403, 'role', 'Only administrators can see enquiries.');
  return null;
}

/** GET /api/leads?status=new&limit=100 — newest first. */
leads.get('/', async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const status = c.req.query('status');
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 100, 1), 500);
  const filter = LEAD_STATUSES.includes(status as LeadStatus);
  const stmt = filter
    ? c.env.DB.prepare('SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ?').bind(status, limit)
    : c.env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT ?').bind(limit);
  const { results } = await stmt.all();
  return c.json({ leads: results });
});

/** PATCH /api/leads/:id { status } */
leads.patch('/:id', async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const b = await c.req.json<{ status?: string }>().catch(() => ({ status: undefined }));
  if (!LEAD_STATUSES.includes(b.status as LeadStatus)) return err(c, 422, 'bad', 'Invalid status.');
  const r = await c.env.DB.prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?').bind(b.status, now(), c.req.param('id')).run();
  if (!r.meta.changes) return err(c, 404, 'notfound', 'Enquiry not found.');
  return c.json({ ok: true });
});

/** POST /api/leads/purge — deletes leads older than the 2-year retention period. */
leads.post('/purge', async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const r = await c.env.DB.prepare('DELETE FROM leads WHERE created_at < ?').bind(now() - LEAD_RETENTION_DAYS * 86400).run();
  await audit(c.env.DB, c.get('account')!.id, 'leads-purge', { deleted: r.meta.changes });
  return c.json({ ok: true, deleted: r.meta.changes });
});
