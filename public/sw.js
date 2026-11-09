// WonderLab service worker — app shell + downloaded packs for offline use.
// Private API responses are never cached here (the app keeps its own scoped IndexedDB data).
const SHELL = 'wl-shell-v2';
const RUNTIME = 'wl-runtime-v1';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    const extra = await fetch('/shell.json').then((r) => (r.ok ? r.json() : [])).catch(() => []);
    await c.addAll(['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/packs.json', ...extra]);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if ((k.startsWith('wl-shell-') && k !== SHELL) || (k.startsWith('wl-runtime-') && k !== RUNTIME)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function fromAnyCache(req) {
  const keys = await caches.keys();
  for (const k of keys) {
    if (!k.startsWith('wl-')) continue;
    const r = await (await caches.open(k)).match(req, { ignoreSearch: true });
    if (r) return r;
  }
  return null;
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // generated narration is not private: keep it so sentences replay offline
  if (url.origin === location.origin && url.pathname === '/api/tts') {
    e.respondWith((async () => {
      const c = await caches.open('wl-tts-v1');
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    })());
    return;
  }
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return; // network only
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(async () => (await caches.match('/index.html')) || Response.error()));
    return;
  }
  const isFont = url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
  if (url.origin === location.origin || isFont) {
    e.respondWith((async () => {
      const hit = await fromAnyCache(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      // hashed build assets and fonts are immutable: keep them for offline use
      if (res.ok && (url.pathname.startsWith('/assets/') || isFont)) (await caches.open(RUNTIME)).put(e.request, res.clone());
      return res;
    })());
  }
});
