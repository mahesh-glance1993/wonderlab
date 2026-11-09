// Number-line hops. Positions are integer tick indices k; the value at k is k/den.
import { rng, clamp, gcd } from './common';

export type NLDisplay = 'int' | 'frac' | 'dec';
export interface NumberLineRound {
  game: 'numberline'; level: number;
  den: number; minK: number; maxK: number; labelEvery: number; display: NLDisplay;
  startK: number; op: '+' | '-'; amountK: number; // always positive; direction from op
  hops: number[]; // hop sizes (in ticks) offered as buttons
}

export const answerK = (r: NumberLineRound) => r.startK + (r.op === '+' ? r.amountK : -r.amountK);

export function formatK(k: number, den: number, display: NLDisplay): string {
  if (display === 'int' || den === 1) return k < 0 ? `−${-k}` : String(k);
  if (display === 'dec') {
    const v = k / den;
    const s = Math.abs(v).toFixed(den === 10 ? 1 : 2).replace(/0+$/, '').replace(/\.$/, '');
    return (v < 0 ? '−' : '') + s;
  }
  if (k === 0) return '0';
  const g = gcd(Math.abs(k), den);
  const n = Math.abs(k) / g, d = den / g;
  const sign = k < 0 ? '−' : '';
  if (d === 1) return `${sign}${n}`;
  return `${sign}${n}/${d}`;
}
export const expression = (r: NumberLineRound) => {
  const a = formatK(r.startK, r.den, r.display), b = formatK(r.amountK, r.den, r.display);
  return `${a} ${r.op === '+' ? '+' : '−'} ${b}`;
};

export function generateNumberLine(seed: number, level: number): NumberLineRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const base = { game: 'numberline' as const, level: lv };
  if (lv === 0) {
    const a = r.int(0, 7), b = r.int(1, 10 - a);
    return { ...base, den: 1, minK: 0, maxK: 10, labelEvery: 1, display: 'int', startK: a, op: '+', amountK: b, hops: [1] };
  }
  if (lv === 1) {
    const op = r.pick(['+', '-'] as const);
    const a = op === '+' ? r.int(0, 15) : r.int(5, 20);
    const b = op === '+' ? r.int(2, 20 - a) : r.int(2, a);
    return { ...base, den: 1, minK: 0, maxK: 20, labelEvery: 1, display: 'int', startK: a, op, amountK: b, hops: [1, 5] };
  }
  if (lv === 2) {
    // integers: the start or the answer is negative
    const op = r.pick(['+', '-'] as const);
    const a = op === '+' ? r.int(-8, -1) : r.int(-8, 8);
    const b = op === '+' ? r.int(2, 10 - a > 12 ? 12 : 10 - a) : r.int(Math.max(2, a + 1), Math.min(12, a + 10));
    return { ...base, den: 1, minK: -10, maxK: 10, labelEvery: 1, display: 'int', startK: a, op, amountK: b, hops: [1, 5] };
  }
  if (lv === 3) {
    // like fractions on 0..2
    const den = r.pick([2, 3, 4, 5, 6, 8]);
    const maxK = 2 * den;
    const op = r.pick(['+', '-'] as const);
    const a = op === '+' ? r.int(1, maxK - 1) : r.int(2, maxK);
    const b = op === '+' ? r.int(1, Math.min(den + 1, maxK - a)) : r.int(1, Math.min(den + 1, a));
    return { ...base, den, minK: 0, maxK, labelEvery: 1, display: 'frac', startK: a, op, amountK: b, hops: [1, den] };
  }
  // decimals on −2..2 in tenths
  const den = 10;
  const op = r.pick(['+', '-'] as const);
  const a = r.int(-15, 15);
  const b = op === '+' ? r.int(3, Math.min(25, 20 - a)) : r.int(3, Math.min(25, a + 20));
  return { ...base, den, minK: -20, maxK: 20, labelEvery: 5, display: 'dec', startK: a, op, amountK: b, hops: [1, 5, 10] };
}

export function validateNumberLine(round: NumberLineRound): string[] {
  const e: string[] = [];
  const a = answerK(round);
  if (round.startK < round.minK || round.startK > round.maxK) e.push('start out of range');
  if (a < round.minK || a > round.maxK) e.push('answer out of range');
  if (round.amountK <= 0) e.push('amount must be positive');
  if (a === round.startK) e.push('no hop needed');
  return e;
}
