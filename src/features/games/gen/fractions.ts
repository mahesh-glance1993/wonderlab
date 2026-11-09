// Fraction matching — pairs of equivalent fractions / decimals / percentages / pictures.
// All pair values are distinct, so each card has exactly one partner.
import { rng, clamp, gcd } from './common';

export type CardKind = 'frac' | 'dec' | 'pct' | 'bar' | 'circle';
export interface FracCard { id: string; kind: CardKind; num: number; den: number; text: string }
export interface FractionsRound { game: 'fractions'; level: number; left: FracCard[]; right: FracCard[] }

/** Terminating decimal text for num/den (den has only factors 2 and 5). */
export function decText(num: number, den: number): string {
  for (let digits = 0; digits <= 6; digits++) {
    const v = (num * 10 ** digits) / den;
    if (Number.isInteger(v)) {
      if (digits === 0) return String(v);
      const s = String(Math.abs(v)).padStart(digits + 1, '0');
      return `${v < 0 ? '-' : ''}${s.slice(0, -digits)}.${s.slice(-digits)}`;
    }
  }
  return (num / den).toFixed(6);
}
export const pctText = (num: number, den: number) => `${decText(num * 100, den)}%`;
const terminating = (den: number) => { let d = den; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };

export function cardText(kind: CardKind, num: number, den: number): string {
  return kind === 'dec' ? decText(num, den) : kind === 'pct' ? pctText(num, den) : `${num}/${den}`;
}
const card = (id: string, kind: CardKind, num: number, den: number): FracCard => ({ id, kind, num, den, text: cardText(kind, num, den) });
export const sameValue = (a: FracCard, b: FracCard) => a.num * b.den === b.num * a.den;
export const checkMatch = (round: FractionsRound, leftId: string, rightId: string) => {
  const a = round.left.find((c) => c.id === leftId), b = round.right.find((c) => c.id === rightId);
  return !!a && !!b && sameValue(a, b);
};

const LEVELS = [
  { pairs: 3, dens: [2, 3, 4] },
  { pairs: 4, dens: [2, 3, 4, 5, 6] },
  { pairs: 4, dens: [2, 4, 5, 10] },
  { pairs: 5, dens: [2, 4, 5, 10, 20, 25] },
  { pairs: 6, dens: [2, 4, 5, 8, 10, 20, 25] },
];

export function generateFractions(seed: number, level: number): FractionsRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const cfg = LEVELS[lv];
  // pool of distinct reduced values
  const pool: [number, number][] = [];
  for (const d of cfg.dens) for (let n = 1; n <= (lv === 4 ? d + d / 2 : d); n++) {
    if (gcd(n, d) !== 1) continue;
    if (lv < 4 && n === d) continue;
    pool.push([n, d]);
  }
  const values = r.shuffle(pool).slice(0, cfg.pairs);
  const left: FracCard[] = [], right: FracCard[] = [];
  values.forEach(([n, d], i) => {
    let L: FracCard, R: FracCard;
    if (lv === 0) {
      L = card(`l${i}`, r.pick(['bar', 'circle'] as const), n, d); R = card(`r${i}`, 'frac', n, d);
    } else if (lv === 1) {
      const k = r.int(2, 3);
      L = card(`l${i}`, 'frac', n, d);
      R = card(`r${i}`, r.next() < 0.5 ? 'frac' : r.pick(['bar', 'circle'] as const), n * k, d * k);
    } else if (lv === 2) {
      L = card(`l${i}`, 'frac', n, d); R = card(`r${i}`, 'dec', n, d);
    } else if (lv === 3) {
      L = card(`l${i}`, d <= 10 && r.next() < 0.5 ? 'bar' : 'frac', n, d); R = card(`r${i}`, r.pick(['dec', 'pct'] as const), n, d);
    } else {
      const k = r.int(1, 4);
      const kinds = r.shuffle(['frac', 'dec', 'pct'] as const);
      L = card(`l${i}`, kinds[0], kinds[0] === 'frac' ? n * k : n, kinds[0] === 'frac' ? d * k : d);
      R = card(`r${i}`, kinds[1], kinds[1] === 'frac' ? n * k : n, kinds[1] === 'frac' ? d * k : d);
    }
    if (!terminating(d) && (L.kind === 'dec' || L.kind === 'pct' || R.kind === 'dec' || R.kind === 'pct')) throw new Error('non-terminating decimal');
    left.push(L); right.push(R);
  });
  return { game: 'fractions', level: lv, left: r.shuffle(left), right: r.shuffle(right) };
}

/** Rule violations: every left card has exactly one equivalent right card, and the stored pair (same index id) is it. */
export function validateFractions(round: FractionsRound, parse: (s: string) => { num: number; den: number } | null): string[] {
  const e: string[] = [];
  const val = (c: FracCard) => {
    if (c.kind === 'bar' || c.kind === 'circle') return { num: c.num, den: c.den };
    const p = parse(c.text);
    if (!p) e.push(`unparsable ${c.text}`);
    return p ?? { num: NaN, den: 1 };
  };
  for (const a of round.left) {
    const va = val(a);
    const partners = round.right.filter((b) => { const vb = val(b); return va.num * vb.den === vb.num * va.den; });
    if (partners.length !== 1) e.push(`${a.text} has ${partners.length} partners`);
    else if (partners[0].id.slice(1) !== a.id.slice(1)) e.push(`${a.text} matched to wrong pair`);
    // the text and stored num/den agree
    if (va.num * a.den !== a.num * va.den) e.push(`${a.text} text/value mismatch`);
  }
  for (const b of round.right) { const vb = val(b); if (vb.num * b.den !== b.num * vb.den) e.push(`${b.text} text/value mismatch`); }
  if (round.left.length !== round.right.length) e.push('unbalanced');
  return e;
}
