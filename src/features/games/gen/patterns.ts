// Pattern completion — repeating units (AB, AAB, ABB, ABC, AABB) and growing number patterns.
import { rng, clamp, distinct } from './common';
import type { ShapeKind, ShapeColor } from './shapes';

export interface Token { shape: ShapeKind; color: ShapeColor }
export const tokenKey = (t: Token) => `${t.shape}-${t.color}`;

export type NumberRule =
  | { type: 'arith'; start: number; step: number }
  | { type: 'geom'; start: number; ratio: number }
  | { type: 'growing'; start: number; firstStep: number } // differences firstStep, firstStep+1, …
  | { type: 'squares'; offset: number }; // (i+offset)^2

export type PatternsRound =
  | { game: 'patterns'; kind: 'unit'; level: number; unitName: string; unit: Token[]; length: number; blank: number; options: Token[] }
  | { game: 'patterns'; kind: 'number'; level: number; rule: NumberRule; length: number; blank: number; options: number[] };

const UNITS: Record<string, number[]> = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2], AABB: [0, 0, 1, 1], ABBC: [0, 1, 1, 2] };

export function ruleTerm(rule: NumberRule, i: number): number {
  switch (rule.type) {
    case 'arith': return rule.start + rule.step * i;
    case 'geom': return rule.start * rule.ratio ** i;
    case 'growing': return rule.start + i * rule.firstStep + (i * (i - 1)) / 2;
    case 'squares': return (i + rule.offset) ** 2;
  }
}
export const unitSeq = (round: Extract<PatternsRound, { kind: 'unit' }>) => Array.from({ length: round.length }, (_, i) => round.unit[i % round.unit.length]);
export const numberSeq = (round: Extract<PatternsRound, { kind: 'number' }>) => Array.from({ length: round.length }, (_, i) => ruleTerm(round.rule, i));

export function patternAnswer(round: PatternsRound): Token | number {
  return round.kind === 'unit' ? unitSeq(round)[round.blank] : numberSeq(round)[round.blank];
}
export function checkPattern(round: PatternsRound, choice: Token | number): boolean {
  const a = patternAnswer(round);
  return typeof a === 'number' ? a === choice : typeof choice !== 'number' && tokenKey(a) === tokenKey(choice);
}

export function generatePatterns(seed: number, level: number): PatternsRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const numeric = lv >= 3 && (lv === 4 || r.next() < 0.7);
  if (!numeric) {
    const names = lv === 0 ? ['AB'] : lv === 1 ? ['AB', 'AAB', 'ABB'] : ['ABC', 'AABB', 'ABB', 'ABBC', 'AAB'];
    const unitName = r.pick(names);
    const pattern = UNITS[unitName];
    const kinds = new Set(pattern).size;
    // distinct tokens: vary shape (and colour) so the elements are easy to tell apart
    const shapes = r.shuffle<ShapeKind>(['circle', 'square', 'triangle', 'hexagon', 'rhombus']);
    const colors = r.shuffle<ShapeColor>(['red', 'blue', 'yellow', 'green']);
    const elems: Token[] = Array.from({ length: kinds }, (_, i) => ({ shape: shapes[i], color: colors[i] }));
    const unit = pattern.map((k) => elems[k]);
    const length = unit.length * 2 + (lv === 0 ? 2 : unit.length >= 4 ? 2 : 3);
    const blank = lv >= 2 && r.next() < 0.4 ? r.int(unit.length * 2, length - 1) : length - 1;
    const answer = unit[blank % unit.length];
    const extra: Token = { shape: shapes[kinds], color: colors[kinds % colors.length] };
    const pool = [...elems.filter((t) => tokenKey(t) !== tokenKey(answer)), extra];
    const nOpts = Math.min(lv === 0 ? 2 : 3, pool.length + 1);
    const options = r.shuffle([answer, ...r.shuffle(pool).slice(0, nOpts - 1)]);
    return { game: 'patterns', kind: 'unit', level: lv, unitName, unit, length, blank, options };
  }
  let rule: NumberRule;
  if (lv === 3) {
    rule = r.next() < 0.75 ? { type: 'arith', start: r.int(0, 20), step: r.pick([1, 2, 3, 4, 5, 10]) } : { type: 'arith', start: r.int(40, 60), step: -r.pick([2, 3, 5]) };
  } else {
    const t = r.int(0, 3);
    rule = t === 0 ? { type: 'arith', start: r.int(-10, 30), step: r.pick([-7, -4, 3, 6, 7, 9, 11, 25]) }
      : t === 1 ? { type: 'geom', start: r.int(1, 5), ratio: r.pick([2, 3]) }
      : t === 2 ? { type: 'growing', start: r.int(1, 10), firstStep: r.int(1, 3) }
      : { type: 'squares', offset: r.int(1, 3) };
  }
  const length = 5 + (lv === 4 ? 1 : 0);
  const blank = r.next() < 0.3 ? r.int(3, length - 1) : length - 1;
  const seq = Array.from({ length }, (_, i) => ruleTerm(rule, i));
  const answer = seq[blank];
  const d = blank > 0 ? seq[blank] - seq[blank - 1] : 1;
  // plausible mistakes: off by one, one step too far, "kept the first difference"
  const cands = r.shuffle([answer + 1, answer - 1, answer + Math.abs(d), answer - Math.abs(d) + 1, seq[blank - 1] + (seq[1] - seq[0]), answer + 2, answer + 10]);
  const wrong: number[] = [];
  for (const c of cands) if (c !== answer && !wrong.includes(c) && wrong.length < 3) wrong.push(c);
  wrong.push(...distinct(r, 3 - wrong.length, () => answer + r.int(-12, 12), [answer, ...wrong]));
  const options = r.shuffle([answer, ...wrong]);
  return { game: 'patterns', kind: 'number', level: lv, rule, length, blank, options };
}

/** Rule violations; also checks the visible part is unambiguous (no shorter repeat explains it). */
export function validatePatterns(round: PatternsRound): string[] {
  const e: string[] = [];
  if (round.blank < 0 || round.blank >= round.length) e.push('blank out of range');
  if (round.kind === 'unit') {
    const seq = unitSeq(round).map(tokenKey);
    const keys = round.options.map(tokenKey);
    const ans = tokenKey(patternAnswer(round) as Token);
    if (keys.filter((k) => k === ans).length !== 1) e.push('answer must appear once');
    if (new Set(keys).size !== keys.length) e.push('duplicate options');
    if (round.length < round.unit.length * 2 + 1) e.push('too short');
    // the visible items before the blank must contain two full units
    if (round.blank < round.unit.length * 2) e.push('blank too early');
    for (let p = 1; p < round.unit.length; p++) {
      let fits = true;
      for (let i = 0; i < seq.length && fits; i++) if (i !== round.blank && i - p >= 0 && i - p !== round.blank && seq[i] !== seq[i - p]) fits = false;
      if (fits) e.push(`ambiguous period ${p}`);
    }
  } else {
    const ans = patternAnswer(round) as number;
    if (round.options.filter((o) => o === ans).length !== 1) e.push('answer must appear once');
    if (new Set(round.options).size !== round.options.length) e.push('duplicate options');
    if (round.options.length < 3) e.push('too few options');
    const seq = numberSeq(round);
    if (seq.some((x) => !Number.isInteger(x))) e.push('non-integer term');
    if (round.blank < 3) e.push('blank too early');
  }
  return e;
}
