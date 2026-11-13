// WonderLab service worker — offline app shell + downloaded packs. See docs/OFFLINE.md.
//
// Caches (all names start with "wl-"):
//   wl-build-<buildId>  app shell + downloaded packs + fonts of one build. Filled and VERIFIED by the
//                       page (src/features/downloads/manager.ts). A new build is staged in its own
//                       cache; the previous one is kept until the new one verified, so a failed or
//                       quota-limited update never breaks offline use.
//   wl-meta             /__wl/ready → { build } — the verified build used for offline navigations.
//   wl-runtime-v1       opportunistic copies of hashed assets/fonts + the last page seen online.
//   wl-public-api-v1    published content corrections (/api/content/overrides — public, not per account)
//                       so offline lessons show the same content version as online ones.
//   wl-tts-v1           generated narration (not private), bounded LRU.
//   wl-pictures-v1      realistic pictures (/pictures/*: 3D emoji + photos) seen online, so they show offline too;
//                       served from the cache and refreshed in the background (stale-while-revalidate).
// Private API responses are never cached (the app keeps its own account+profile scoped IndexedDB).
// Pending work lives in IndexedDB, which this worker never touches, so it survives SW/app updates.
const RUNTIME = 'wl-runtime-v1';
const PUBLIC_API = 'wl-public-api-v1';
const TTS = 'wl-tts-v1';
const TTS_MAX = 300;
const PICTURES = 'wl-pictures-v1';
const META = 'wl-meta';
const NAV_TIMEOUT_MS = 6000;

self.addEventListener('install', (e) => {
  // Best effort: put this build's shell in its own cache (not marked ready — the page verifies).
  e.waitUntil((async () => {
    try {
      const man = await fetch('/packs.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null));
      if (man && man.build && man.shell) {
        const c = await caches.open(`wl-build-${man.build}`);
        for (const f of man.shell.files) {
          if (await c.match(f)) continue;
          const r = await fetch(f, { cache: 'no-cache' }).catch(() => null);
          if (r && r.ok) await c.put(f, r);
        }
      }
    } catch { /* offline or quota: the page-driven download retries */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // legacy single shell cache from older workers (its files are re-fetched into wl-build-*)
    for (const k of await caches.keys()) if (k.startsWith('wl-shell-')) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function readyBuild() {
  try {
    const r = await (await caches.open(META)).match('/__wl/ready');
    return r ? (await r.json()).build : null;
  } catch { return null; }
}

const isFontUrl = (u) => u.startsWith('https://fonts.googleapis.com/') || u.startsWith('https://fonts.gstatic.com/');

async function fromAnyCache(req) {
  const ready = await readyBuild();
  const keys = (await caches.keys()).filter((k) => k.startsWith('wl-') && k !== META && k !== TTS);
  if (ready) keys.sort((a, b) => (a === `wl-build-${ready}` ? -1 : b === `wl-build-${ready}` ? 1 : 0));
  for (const k of keys) {
    const r = await (await caches.open(k)).match(req, { ignoreSearch: !isFontUrl(req.url), ignoreVary: true });
    // an opaque (no-cors) copy cannot answer a CORS request (e.g. the pack downloader's font fetch)
    if (r && !(r.type === 'opaque' && req.mode === 'cors')) return r;
  }
  return null;
}

/** The page for offline navigations: the verified build first, then the last page seen online. */
async function offlinePage() {
  const ready = await readyBuild();
  if (ready) {
    const r = await (await caches.open(`wl-build-${ready}`)).match('/__wl/index.html');
    if (r) return r;
  }
  const last = await (await caches.open(RUNTIME)).match('/__wl/last-index.html');
  if (last) return last;
  for (const k of await caches.keys()) {
    if (!k.startsWith('wl-build-')) continue;
    const r = await (await caches.open(k)).match('/__wl/index.html');
    if (r) return r;
  }
  return null;
}

function withTimeout(p, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (err) => { clearTimeout(t); reject(err); });
  });
}

async function trimTts(c) {
  const ks = await c.keys();
  for (let i = 0; i < ks.length - TTS_MAX; i++) await c.delete(ks[i]); // oldest first (insertion order)
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;

  // generated narration is not private: keep it (LRU) so sentences replay offline
  if (same && url.pathname === '/api/tts') {
    e.respondWith((async () => {
      const c = await caches.open(TTS);
      const hit = await c.match(req);
      if (hit) {
        // refresh recency: move to the end of the insertion order
        const copy = hit.clone();
        e.waitUntil(c.delete(req).then(() => c.put(req, copy)));
        return hit;
      }
      const res = await fetch(req);
      if (res.ok) e.waitUntil(c.put(req, res.clone()).then(() => trimTts(c)));
      return res;
    })());
    return;
  }
  // published content corrections: public; network first, cached copy offline
  if (same && url.pathname === '/api/content/overrides') {
    e.respondWith((async () => {
      const c = await caches.open(PUBLIC_API);
      try {
        const res = await withTimeout(fetch(req), NAV_TIMEOUT_MS);
        if (res.ok) e.waitUntil(c.put('/api/content/overrides', res.clone()));
        return res;
      } catch {
        return (await c.match('/api/content/overrides')) || Response.error();
      }
    })());
    return;
  }
  if (same && url.pathname.startsWith('/api/')) return; // private: network only, never cached

  if (req.mode === 'navigate') {
    // network first (fresh deploys reach every device); offline → verified build's page
    e.respondWith((async () => {
      try {
        const res = await withTimeout(fetch(req), NAV_TIMEOUT_MS);
        if (res.ok && (res.headers.get('Content-Type') || '').includes('text/html')) {
          const body = await res.clone().blob();
          e.waitUntil(caches.open(RUNTIME).then((c) => c.put('/__wl/last-index.html', new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))));
        }
        return res;
      } catch {
        return (await offlinePage()) || new Response('<!doctype html><meta charset="utf-8"><title>WonderLab</title><p style="font:18px system-ui;padding:24px">WonderLab is not downloaded on this device yet. Connect to the internet and open it once.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // manifests must always be fresh when online
  if (same && ['/packs.json', '/shell.json', '/version.json', '/sw.js'].includes(url.pathname)) {
    e.respondWith(fetch(req).catch(async () => (await fromAnyCache(req)) || Response.error()));
    return;
  }

  // realistic pictures: cache first, refresh in the background
  if (same && url.pathname.startsWith('/pictures/')) {
    e.respondWith((async () => {
      const c = await caches.open(PICTURES);
      const hit = await c.match(req, { ignoreSearch: true });
      const refresh = fetch(req).then((res) => { if (res.ok) return c.put(req, res.clone()).then(() => res); return res; });
      if (hit) { e.waitUntil(refresh.catch(() => undefined)); return hit; }
      return refresh;
    })());
    return;
  }

  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (same || isFont) {
    e.respondWith((async () => {
      const hit = await fromAnyCache(req);
      if (hit) return hit;
      const res = await fetch(req);
      // hashed build assets and fonts are immutable: keep them for offline use
      if ((res.ok || res.type === 'opaque') && ((same && url.pathname.startsWith('/assets/')) || isFont)) {
        const copy = res.clone();
        e.waitUntil(caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => undefined));
      }
      return res;
    })());
  }
});
