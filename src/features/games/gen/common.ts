// Shared helpers for the pure, seeded game generators (no React, no DOM).
import { rng, type Rng } from '../../../shared/grading';

export type { Rng };
export { rng };

/** Localised text. Telugu is provided for content used by Nursery–Class 3 learners. */
export interface L { en: string; te?: string }
export const L = (en: string, te?: string): L => ({ en, te });

export type Variant = 'guided' | 'regular' | 'challenge';
/** Every generator accepts difficulty levels 0..MAX_LEVEL. */
export const MAX_LEVEL = 4;
export const LEVELS = [0, 1, 2, 3, 4] as const;

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** FNV-1a 32-bit string hash → non-negative int seed. */
export function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0) % 2 ** 31;
}

/** n distinct values drawn by `make`, all different from `avoid` and each other (bounded attempts). */
export function distinct<T>(_r: Rng, count: number, make: () => T, avoid: T[] = [], key: (t: T) => string = (t) => JSON.stringify(t)): T[] {
  const seen = new Set(avoid.map(key));
  const out: T[] = [];
  for (let tries = 0; out.length < count && tries < 500; tries++) {
    const v = make();
    const k = key(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

/** Base difficulty for a class level within a game's class range, then variant and adaptive offsets. */
export function levelFor(classRange: [number, number], classLevel: number, variant: Variant, adjust = 0): number {
  const [lo, hi] = classRange;
  const t = hi === lo ? 0.5 : clamp((classLevel - lo) / (hi - lo), 0, 1);
  const base = Math.round(t * 3);
  const delta = variant === 'guided' ? -1 : variant === 'challenge' ? 1 : 0;
  return clamp(base + delta + clamp(adjust, -1, 1), 0, MAX_LEVEL);
}

/** Today's date as YYYY-MM-DD in local time. */
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function prevDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}
