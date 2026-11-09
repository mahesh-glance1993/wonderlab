// Small fetch wrapper. Cookies carry the session (HttpOnly; never visible to JS).

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  body: Record<string, unknown>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>, body: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.body = body;
  }
}
export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const method = opts.method || (opts.body !== undefined ? 'POST' : 'GET');
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-WonderLab': '1' },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch {
    throw new ApiError(0, 'offline', 'You seem to be offline.');
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const e = (data.error || {}) as { code?: string; message?: string; fields?: Record<string, string> };
    throw new ApiError(res.status, e.code || 'error', e.message || 'Something went wrong.', e.fields, data);
  }
  return data as T;
}
