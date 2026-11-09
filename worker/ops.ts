// Operational endpoints: health/readiness and client error intake.
import { Hono } from 'hono';
import { type Env, type Vars, type C, err, rateLimit, clientIp } from './lib';

export const ops = new Hono<{ Bindings: Env; Variables: Vars }>();

type Build = { version: string; commit: string; builtAt: string };
let buildCache: Build | null = null;
async function buildInfo(c: C): Promise<Build | null> {
  if (buildCache) return buildCache;
  try {
    const r = await c.env.ASSETS.fetch(new Request(new URL('/version.json', c.req.url)));
    if (r.ok && (r.headers.get('Content-Type') || '').includes('json')) buildCache = await r.json<Build>();
  } catch { /* assets not built (e.g. API-only dev) */ }
  return buildCache;
}

/** Liveness + readiness: 200 when D1 answers, 503 otherwise. Contains no private data. */
ops.get('/health', async (c) => {
  const started = Date.now();
  let db: 'ok' | 'error' = 'ok';
  try {
    await c.env.DB.prepare('SELECT 1 AS ok').first();
  } catch (e) {
    console.error('health: D1 check failed', e);
    db = 'error';
  }
  const build = await buildInfo(c);
  const body = {
    ok: db === 'ok',
    env: c.env.APP_ENV,
    checks: { db, dbLatencyMs: Date.now() - started },
    version: build?.version ?? 'unknown',
    commit: build?.commit ?? 'unknown',
    builtAt: build?.builtAt ?? null,
    deployment: c.env.CF_VERSION_METADATA?.id ?? null,
  };
  return c.json(body, db === 'ok' ? 200 : 503);
});

const MAX_BODY = 8 * 1024;
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '');

/**
 * Browser error reports. Rate-limited per client IP (the IP is only used as a limiter key and is
 * never logged), size-capped, and reduced to a fixed set of non-personal fields.
 */
ops.post('/client-error', async (c) => {
  const len = Number(c.req.header('Content-Length') || 0);
  if (len > MAX_BODY) return c.json({ error: { code: 'too-big', message: 'Report too large.' } }, 413);
  if (!(await rateLimit(c, `cerr:${clientIp(c)}`, 20, 600))) return err(c, 429, 'rate', 'Too many reports.');
  const raw = await c.req.text().catch(() => '');
  if (raw.length > MAX_BODY) return c.json({ error: { code: 'too-big', message: 'Report too large.' } }, 413);
  let b: Record<string, unknown>;
  try { b = JSON.parse(raw); } catch { return err(c, 400, 'bad', 'Invalid report.'); }
  if (!b || typeof b !== 'object') return err(c, 400, 'bad', 'Invalid report.');
  const kind = ['error', 'unhandledrejection', 'boundary'].includes(b.kind as string) ? (b.kind as string) : 'error';
  console.error(JSON.stringify({
    type: 'client-error',
    kind,
    message: str(b.message, 500),
    stack: str(b.stack, 4000),
    route: str(b.route, 200),
    version: str(b.version, 40),
  }));
  return c.body(null, 204);
});
