// WonderLab API (Cloudflare Worker). Static app assets are served by the assets binding;
// only /api/* reaches this code.
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { type Env, type Vars, loadSession, err } from './lib';
import { auth, account } from './auth';
import { profiles, learner } from './learner';
import { content, admin } from './content';
import { PACKS } from '../src/shared/packs';
import { tts } from './tts';
import { ops } from './ops';

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

// Security headers + no caching of private API responses
app.use('/api/*', async (c, next) => {
  await next();
  if (!c.req.path.startsWith('/api/tts')) c.header('Cache-Control', 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'same-origin');
  c.header('X-Frame-Options', 'DENY');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
});

// Request size cap: the largest legitimate body is an artwork project (4.5 MB of JSON, see learner.ts).
app.use('/api/*', bodyLimit({ maxSize: 5 * 1024 * 1024, onError: (c) => c.json({ error: { code: 'too-big', message: 'That request is too large.' } }, 413) }));

// CSRF defence: state-changing requests must come from our own page (custom header + same origin).
app.use('/api/*', async (c, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    if (c.req.header('X-WonderLab') !== '1') return err(c, 403, 'csrf', 'Request blocked.');
    const origin = c.req.header('Origin');
    // URL.parse returns null for "null"/garbage origins (previously threw → 500); treat those as foreign
    if (origin && URL.parse(origin)?.host !== new URL(c.req.url).host) return err(c, 403, 'csrf', 'Request blocked.');
  }
  await loadSession(c);
  await next();
});

app.route('/api', ops); // /api/health, /api/client-error
app.route('/api/auth', auth);
app.route('/api/account', account);
app.route('/api/profiles', profiles);
app.route('/api/p', learner);
app.route('/api/content', content);
app.route('/api/admin', admin);
app.route('/api/tts', tts);
app.get('/api/packs', (c) => c.json({ packs: PACKS }));

// Local email sink so password recovery can be tested without a mail provider.
app.get('/api/dev/outbox', async (c) => {
  if (c.env.APP_ENV === 'production') return err(c, 404, 'notfound', 'Not found.');
  const { results } = await c.env.DB.prepare('SELECT to_addr, subject, body, created_at FROM outbox ORDER BY created_at DESC LIMIT 50').all();
  return c.json({ emails: results });
});

app.all('/api/*', (c) => err(c, 404, 'notfound', 'Not found.'));
app.onError((e, c) => {
  console.error(e);
  return c.json({ error: { code: 'server', message: 'Something went wrong. Please try again.' } }, 500);
});

export default app;
