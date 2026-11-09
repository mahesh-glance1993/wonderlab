// WonderLab API (Cloudflare Worker). Static app assets are served by the assets binding;
// only /api/* reaches this code.
import { Hono } from 'hono';
import { type Env, type Vars, loadSession, err } from './lib';
import { auth, account } from './auth';
import { profiles, learner } from './learner';
import { content, admin } from './content';
import { PACKS } from '../src/shared/packs';
import { tts } from './tts';

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

// Security headers + no caching of private API responses
app.use('/api/*', async (c, next) => {
  await next();
  if (!c.req.path.startsWith('/api/tts')) c.header('Cache-Control', 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'same-origin');
});

// CSRF defence: state-changing requests must come from our own page (custom header + same origin).
app.use('/api/*', async (c, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    if (c.req.header('X-WonderLab') !== '1') return err(c, 403, 'csrf', 'Request blocked.');
    const origin = c.req.header('Origin');
    if (origin && new URL(origin).host !== new URL(c.req.url).host) return err(c, 403, 'csrf', 'Request blocked.');
  }
  await loadSession(c);
  await next();
});

app.get('/api/health', (c) => c.json({ ok: true, env: c.env.APP_ENV }));
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
