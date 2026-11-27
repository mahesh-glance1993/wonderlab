import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { validateLead, isHoneypotFilled, normalisePhone, cleanText, LEAD_RETENTION_DAYS } from '../src/shared/leads';
import { leads } from '../worker/leads';
import type { Env, Vars, Account } from '../worker/lib';
import { upiLink } from '../src/lib/upi';
import { qrMatrix } from '../src/lib/qr';

const good = {
  kind: 'school', contactName: 'R. Lakshmi', role: 'Headmistress', orgName: 'ZPHS Example', town: 'Warangal',
  phone: '98765 43210', email: '', students: '120', classes: ['3', '1', '3'], message: 'We would like a pilot.\r\nThanks', confirmStaff: true,
};

describe('validateLead', () => {
  it('accepts a complete enquiry and normalises it', () => {
    const r = validateLead(good);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lead).toMatchObject({ kind: 'school', phone: '9876543210', email: null, students: 120, classes: ['1', '3'], message: 'We would like a pilot.\nThanks' });
  });
  it('requires phone or email', () => {
    const r = validateLead({ ...good, phone: '', email: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.contact).toBeTruthy();
  });
  it('accepts email only', () => {
    const r = validateLead({ ...good, phone: '', email: ' Office@School.EDU.in ' });
    expect(r.ok && r.lead.email).toBe('office@school.edu.in');
  });
  it.each(['not-an-email', 'a@b', 'a b@c.com', 'x@y.c', `${'a'.repeat(120)}@x.com`])('rejects email %s', (email) => {
    const r = validateLead({ ...good, email });
    expect(!r.ok && r.errors.email).toBeTruthy();
  });
  it.each(['12345', 'call me', '98765-4321x', '+12', '1'.repeat(14)])('rejects phone %s', (phone) => {
    const r = validateLead({ ...good, phone });
    expect(!r.ok && r.errors.phone).toBeTruthy();
  });
  it('normalises phone numbers', () => {
    expect(normalisePhone('+91 98765-43210')).toBe('+919876543210');
    expect(normalisePhone('(040) 2345 6789')).toBe('04023456789');
    expect(normalisePhone('98765')).toBeNull();
  });
  it('enforces lengths and required fields', () => {
    const r = validateLead({ ...good, contactName: 'A', role: '', orgName: 'x'.repeat(121), town: ' ', message: 'm'.repeat(1001) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['contactName', 'message', 'orgName', 'role', 'town']);
  });
  it('rejects bad kind, students, classes and missing staff confirmation', () => {
    const r = validateLead({ ...good, kind: 'parent', students: '0', classes: ['11'], confirmStaff: 'yes' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['classes', 'confirmStaff', 'kind', 'students']);
    expect(validateLead({ ...good, students: '12.5' }).ok).toBe(false);
    expect(validateLead({ ...good, students: 200001 }).ok).toBe(false);
    expect(validateLead({ ...good, classes: 'all' }).ok).toBe(false);
  });
  it('treats empty optional fields as absent', () => {
    const r = validateLead({ ...good, students: '', classes: undefined, message: '' });
    expect(r.ok && r.lead).toMatchObject({ students: null, classes: [], message: '' });
  });
  it('rejects non-objects', () => {
    expect(validateLead(null).ok).toBe(false);
    expect(validateLead('x').ok).toBe(false);
  });
  it('strips control characters and collapses whitespace', () => {
    expect(cleanText('  A\u0000B \n\t C ')).toBe('AB C');
    expect(cleanText(42)).toBe('');
  });
  it('detects the honeypot', () => {
    expect(isHoneypotFilled({ website: 'http://spam' })).toBe(true);
    expect(isHoneypotFilled({ website: '  ' })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
  });
  it('retention is two years', () => expect(LEAD_RETENTION_DAYS).toBe(730));
});

// ---------------- endpoint (in-memory D1 stand-in) ----------------
type Row = Record<string, unknown>;
function fakeDb() {
  const t = { leads: [] as Row[], outbox: [] as Row[], rate: new Map<string, { window_start: number; count: number }>(), audit: [] as Row[] };
  const stmt = (sql: string, args: unknown[] = []) => ({
    bind: (...a: unknown[]) => stmt(sql, a),
    async first() {
      if (sql.startsWith('SELECT window_start')) return t.rate.get(args[0] as string) ?? null;
      return null;
    },
    async run() {
      let changes = 1;
      if (sql.startsWith('INSERT INTO rate_limits')) t.rate.set(args[0] as string, { window_start: args[1] as number, count: 1 });
      else if (sql.startsWith('UPDATE rate_limits')) t.rate.get(args[0] as string)!.count++;
      else if (sql.startsWith('INSERT INTO leads')) {
        const [id, created_at, , kind, contact_name, contact_role, org_name, town, email, phone, students, classes, message, lang] = args;
        t.leads.push({ id, created_at, kind, contact_name, contact_role, org_name, town, email, phone, students, classes, message, lang, status: 'new' });
      } else if (sql.startsWith('INSERT INTO outbox')) t.outbox.push({ to: args[1], subject: args[2], body: args[3] });
      else if (sql.startsWith('UPDATE leads')) { const l = t.leads.find((x) => x.id === args[2]); if (l) l.status = args[0]; else changes = 0; }
      else if (sql.startsWith('DELETE FROM leads')) { const before = t.leads.length; t.leads = t.leads.filter((x) => (x.created_at as number) >= (args[0] as number)); changes = before - t.leads.length; }
      else if (sql.startsWith('INSERT INTO audit_log')) t.audit.push({ action: args[2] });
      return { meta: { changes } };
    },
    async all() { return { results: [...t.leads].reverse() }; },
  });
  return { t, db: { prepare: (sql: string) => stmt(sql) } as unknown as D1Database };
}
function setup(opts: { notify?: string; role?: Account['role'] | null } = {}) {
  const { t, db } = fakeDb();
  const env = { DB: db, APP_ENV: 'development', APP_ORIGIN: 'http://localhost', LEADS_NOTIFY_EMAIL: opts.notify } as unknown as Env;
  const app = new Hono<{ Bindings: Env; Variables: Vars }>();
  app.use('*', async (c, next) => { c.set('account', opts.role ? ({ id: 'acc1', role: opts.role } as Account) : null); await next(); });
  app.route('/api/leads', leads);
  const req = (path: string, init: RequestInit = {}, ip = '1.2.3.4') =>
    app.request(path, { ...init, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, ...(init.headers || {}) } }, env);
  const post = (body: unknown, ip?: string) => req('/api/leads', { method: 'POST', body: JSON.stringify(body) }, ip);
  return { t, req, post };
}

describe('POST /api/leads', () => {
  it('stores a valid lead and queues a notification when LEADS_NOTIFY_EMAIL is set', async () => {
    const { t, post } = setup({ notify: 'ops@example.org' });
    const r = await post({ ...good, lang: 'te' });
    expect(r.status).toBe(201);
    expect(t.leads).toHaveLength(1);
    expect(t.leads[0]).toMatchObject({ kind: 'school', phone: '9876543210', classes: '1,3', lang: 'te', status: 'new' });
    expect(t.outbox).toHaveLength(1);
    expect(t.outbox[0]).toMatchObject({ to: 'ops@example.org' });
    expect(String(t.outbox[0].body)).toContain('ZPHS Example');
  });
  it('skips the notification when LEADS_NOTIFY_EMAIL is unset', async () => {
    const { t, post } = setup();
    expect((await post(good)).status).toBe(201);
    expect(t.leads).toHaveLength(1);
    expect(t.outbox).toHaveLength(0);
  });
  it('returns field errors for invalid input', async () => {
    const { t, post } = setup();
    const r = await post({ ...good, email: 'bad', phone: '' });
    expect(r.status).toBe(422);
    const j = await r.json() as { error: { fields: Record<string, string> } };
    expect(j.error.fields.email).toBeTruthy();
    expect(t.leads).toHaveLength(0);
  });
  it('rejects malformed JSON and oversized bodies', async () => {
    const { req } = setup();
    expect((await req('/api/leads', { method: 'POST', body: '{nope' })).status).toBe(400);
    expect((await req('/api/leads', { method: 'POST', body: JSON.stringify({ ...good, message: 'x'.repeat(9000) }) })).status).toBe(413);
  });
  it('silently drops honeypot submissions', async () => {
    const { t, post } = setup({ notify: 'ops@example.org' });
    const r = await post({ ...good, website: 'http://spam.example' });
    expect(r.status).toBe(201);
    expect(t.leads).toHaveLength(0);
    expect(t.outbox).toHaveLength(0);
  });
  it('rate-limits per IP', async () => {
    const { t, post } = setup();
    for (let i = 0; i < 5; i++) expect((await post(good)).status).toBe(201);
    expect((await post(good)).status).toBe(429);
    expect((await post(good, '5.6.7.8')).status).toBe(201);
    expect(t.leads).toHaveLength(6);
  });
});

describe('operator access to leads', () => {
  it('requires an admin account', async () => {
    expect((await setup().req('/api/leads')).status).toBe(401);
    expect((await setup({ role: 'parent' }).req('/api/leads')).status).toBe(403);
    expect((await setup({ role: 'educator' }).req('/api/leads')).status).toBe(403);
    expect((await setup({ role: 'parent' }).req('/api/leads/purge', { method: 'POST' })).status).toBe(403);
  });
  it('lists, updates status and purges old leads', async () => {
    const { t, req, post } = setup({ role: 'admin' });
    await post(good);
    const list = await (await req('/api/leads')).json() as { leads: Row[] };
    expect(list.leads).toHaveLength(1);
    const id = String(list.leads[0].id);
    expect((await req(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'contacted' }) })).status).toBe(200);
    expect(t.leads[0].status).toBe('contacted');
    expect((await req(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'weird' }) })).status).toBe(422);
    expect((await req('/api/leads/missing', { method: 'PATCH', body: JSON.stringify({ status: 'closed' }) })).status).toBe(404);
    t.leads[0].created_at = Math.floor(Date.now() / 1000) - (LEAD_RETENTION_DAYS + 1) * 86400;
    const p = await (await req('/api/leads/purge', { method: 'POST' })).json() as { deleted: number };
    expect(p.deleted).toBe(1);
    expect(t.leads).toHaveLength(0);
  });
});

describe('support page helpers', () => {
  it('builds a UPI link only for a well-formed UPI ID', () => {
    expect(upiLink(undefined, undefined)).toBeNull();
    expect(upiLink('', 'X')).toBeNull();
    expect(upiLink('not a upi id', 'X')).toBeNull();
    expect(upiLink('evil@bank&am=99999', 'X')).toBeNull();
    expect(upiLink('wonderlab.support@okbank', 'Wonder Lab & Co')).toBe('upi://pay?pa=wonderlab.support@okbank&pn=Wonder%20Lab%20%26%20Co&cu=INR');
    expect(upiLink('a.b@ybl', '')).toBe('upi://pay?pa=a.b@ybl&pn=WonderLab&cu=INR');
  });
  it('QR encoder picks the smallest version and keeps finder patterns', () => {
    expect(qrMatrix('upi://pay').length).toBe(21); // version 1
    const m = qrMatrix(upiLink('wonderlab.support@okbank', 'WonderLab')!);
    expect((m.length - 17) % 4).toBe(0);
    for (const [x, y] of [[0, 0], [m.length - 7, 0], [0, m.length - 7]]) {
      expect(m[y][x] && m[y + 6][x + 6] && m[y + 3][x + 3] && !m[y + 1][x + 1]).toBe(true);
    }
    expect(() => qrMatrix('x'.repeat(300))).toThrow(RangeError);
  });
});
