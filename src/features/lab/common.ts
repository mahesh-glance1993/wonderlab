// Pure helpers shared by the lab simulations (no React, unit-testable).

export interface Range { min: number; max: number; step: number }

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Rounds to 9 decimals to hide floating-point noise (0.1 + 0.2 -> 0.3). */
export const tidy = (v: number) => +v.toFixed(9);

/** Clamp to the range and snap to its step grid. */
export function snap(v: number, r: Range): number {
  const s = Math.round((clamp(v, r.min, r.max) - r.min) / r.step) * r.step + r.min;
  return tidy(clamp(s, r.min, r.max));
}

/** Reads a numeric URL/query value. Missing or non-numeric -> undefined; out of range -> clamped. */
export function readNum(q: URLSearchParams, key: string, r: Range): number | undefined {
  const raw = q.get(key);
  if (raw == null || raw.trim() === '') return undefined;
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return undefined;
  return snap(n, r);
}

/** Sanitises an unknown object (e.g. restored saved state) into valid params. */
export function sanitizeParams<P extends { [K in keyof P]: number }>(raw: unknown, defaults: P, ranges: { [K in keyof P]: Range }): P {
  const out = { ...defaults };
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(defaults) as (keyof P)[]) {
      const val = (raw as Record<string, unknown>)[k as string];
      if (typeof val === 'number' && Number.isFinite(val)) out[k] = snap(val, ranges[k]) as P[keyof P];
    }
  }
  return out;
}

/** Formats a number for display: fixed decimals, trailing zeros removed, no "-0". */
export function fmt(n: number, dp = 2): string {
  const r = +n.toFixed(dp);
  return String(Object.is(r, -0) || r === 0 ? 0 : r);
}

export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;

/** A "nice" axis maximum >= v (1, 2, 2.5, 5 x 10^n). */
export function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v - 1e-9) return tidy(m * p);
  return tidy(10 * p);
}
