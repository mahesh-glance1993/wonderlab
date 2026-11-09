// Seeded randomness + adaptive difficulty shared by all Play & Learn generators (pure TS).
// ---------- seeded randomness ----------
export interface Rng { next: () => number; int: (lo: number, hi: number) => number; pick: <T>(a: readonly T[]) => T }
export function rng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (arr) => arr[Math.floor(next() * arr.length)] };
}
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Up to n items from `pool` that are not in `avoid` (by key), unique, random order. */
export function sample<T>(r: Rng, pool: readonly T[], n: number, avoid: T[] = [], key: (t: T) => string = (t) => (typeof t === 'object' ? JSON.stringify(t) : String(t))): T[] {
  const seen = new Set(avoid.map(key));
  const out: T[] = [];
  for (const x of shuffle(r, pool)) {
    if (out.length >= n) break;
    const k = key(x);
    if (seen.has(k)) continue;
    seen.add(k); out.push(x);
  }
  return out;
}

// ---------- adaptive difficulty ----------
export const MIN_CHOICES = 2;
export const MAX_CHOICES = 4;
export interface Adapt { choices: number; streak: number; misses: number }
export const ADAPT0: Adapt = { choices: MIN_CHOICES, streak: 0, misses: 0 };
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const clampChoices = (n: number) => clamp(Math.round(n) || MIN_CHOICES, MIN_CHOICES, MAX_CHOICES);
/**
 * Grow after 3 first-try successes in a row; drop back after 2 mistakes.
 * `firstTry` = answered correctly without any earlier wrong tap this round.
 */
export function adapt(a: Adapt | undefined, correct: boolean, firstTry = correct, max = MAX_CHOICES): Adapt {
  const cur: Adapt = { ...ADAPT0, ...(a || {}) };
  cur.choices = clamp(Math.round(cur.choices) || MIN_CHOICES, MIN_CHOICES, max);
  if (correct && firstTry) {
    const streak = cur.streak + 1;
    if (streak >= 3) return { choices: clamp(cur.choices + 1, MIN_CHOICES, max), streak: 0, misses: 0 };
    return { ...cur, streak, misses: 0 };
  }
  if (correct) return { ...cur, streak: 0 };
  const misses = cur.misses + 1;
  if (misses >= 2) return { choices: clamp(cur.choices - 1, MIN_CHOICES, max), streak: 0, misses: 0 };
  return { ...cur, streak: 0, misses };
}

