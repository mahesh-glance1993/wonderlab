// Natural-sounding English narration via Workers AI (Deepgram Aura-2).
// Signed-in families only, length-capped, rate-limited, and cached at the edge so each
// sentence is synthesised once (cost: ~$0.03 per 1k characters on first generation).
import { Hono } from 'hono';
import { type Env, type Vars, err, rateLimit, sha256 } from './lib';

export const tts = new Hono<{ Bindings: Env & { AI?: Ai }; Variables: Vars }>();

export const TTS_SPEAKERS = ['luna', 'asteria', 'athena', 'hera', 'aurora', 'orion', 'apollo', 'arcas'] as const;
const MAX_CHARS = 400;

tts.get('/', async (c) => {
  const a = c.get('account');
  if (!a) return err(c, 401, 'auth', 'Please sign in.');
  if (!c.env.AI || c.env.TTS_ENABLED === 'false') return err(c, 404, 'off', 'Natural voice is not enabled.');
  const text = (c.req.query('text') || '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
  const speaker = (TTS_SPEAKERS as readonly string[]).includes(c.req.query('v') || '') ? c.req.query('v')! : 'luna';
  if (!text) return err(c, 400, 'bad', 'No text.');

  // Cache key is independent of the user, so every family shares already-generated sentences.
  const key = new Request(`https://tts.wonderlab.internal/${speaker}/${await sha256(text)}.mp3`);
  const cache = (caches as unknown as { default: Cache }).default;
  const hit = await cache.match(key);
  if (hit) return withHeaders(hit);

  if (!(await rateLimit(c, `tts:${a.id}`, 600, 3600))) return err(c, 429, 'rate', 'Too many voice requests. Please wait a little.');
  let audio: ReadableStream | ArrayBuffer;
  try {
    audio = (await c.env.AI.run('@cf/deepgram/aura-2-en' as keyof AiModels, { text, speaker, encoding: 'mp3' } as never)) as unknown as ReadableStream;
  } catch (e) {
    console.error('tts failed', e);
    return err(c, 404, 'tts', 'Voice is unavailable right now.');
  }
  const buf = audio instanceof ArrayBuffer ? audio : await new Response(audio).arrayBuffer();
  const res = new Response(buf, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=2592000, immutable' } });
  c.executionCtx.waitUntil(cache.put(key, res.clone()));
  return withHeaders(res);
});

function withHeaders(r: Response) {
  const h = new Headers(r.headers);
  h.set('Content-Type', 'audio/mpeg');
  h.set('Cache-Control', 'private, max-age=2592000'); // browser + service worker may keep it for offline replay
  h.set('X-Content-Type-Options', 'nosniff');
  return new Response(r.body, { status: 200, headers: h });
}
