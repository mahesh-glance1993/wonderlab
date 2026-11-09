// Client error reporting → POST /api/client-error (logged by the Worker; visible in Workers
// observability / `wrangler tail`). Deliberately carries no personal data: no names, usernames,
// nicknames, emails, query strings or ids — only the error text, a scrubbed stack, the route
// pattern and the build version.

export const BUILD_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const MAX_PER_PAGE = 5;
let sent = 0;
const seen = new Set<string>();

/** Removes things that could identify a family: emails, UUIDs, long tokens, digit runs, query strings. */
export function scrub(s: string): string {
  return s
    .replace(/[^\s@/]+@[^\s@/]+\.[^\s@/]+/g, '<email>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<id>')
    .replace(/\?[^\s)]*/g, '') // query strings may hold reset/verify tokens
    .replace(/[A-Za-z0-9_-]{32,}/g, '<token>')
    .replace(/\d{6,}/g, '<n>');
}

export function reportClientError(error: unknown, kind: 'error' | 'unhandledrejection' | 'boundary', componentStack?: string) {
  try {
    if (sent >= MAX_PER_PAGE || typeof fetch === 'undefined') return;
    const e = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Non-error thrown');
    const message = scrub(`${e.name}: ${e.message}`).slice(0, 500);
    const stack = scrub([e.stack || '', componentStack || ''].join('\n')).slice(0, 4000);
    const key = `${kind}|${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    sent++;
    const body = JSON.stringify({ kind, message, stack, route: scrub(location.pathname).slice(0, 200), version: BUILD_VERSION });
    void fetch('/api/client-error', {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', 'X-WonderLab': '1' }, // same CSRF header as lib/api.ts
      body,
    }).catch(() => undefined);
  } catch {
    /* reporting must never throw */
  }
}

/** Global listeners for errors that escape React (event handlers, timers, promises). */
export function installErrorReporting() {
  window.addEventListener('error', (ev) => {
    // resource load errors (img/audio) bubble here without an Error object; skip those
    if (!ev.error && !ev.message) return;
    if (/ResizeObserver loop/.test(ev.message || '')) return; // benign browser notice
    reportClientError(ev.error ?? ev.message, 'error');
  });
  window.addEventListener('unhandledrejection', (ev) => {
    const r = ev.reason;
    // offline/API failures are expected and already shown to the user
    if (r && typeof r === 'object' && 'status' in r && 'code' in r) return;
    reportClientError(r, 'unhandledrejection');
  });
}
