// Counting & number matching — seeded rounds with known answers.
import { rng, distinct, clamp, L } from './common';

export const COUNT_OBJECTS = ['apple', 'ball', 'fish', 'flower', 'star', 'leaf'] as const;
export type CountObject = (typeof COUNT_OBJECTS)[number];
export const OBJECT_NAMES: Record<CountObject, L> = {
  apple: L('apples', 'ఆపిల్ పండ్లు'), ball: L('balls', 'బంతులు'), fish: L('fish', 'చేపలు'),
  flower: L('flowers', 'పువ్వులు'), star: L('stars', 'నక్షత్రాలు'), leaf: L('leaves', 'ఆకులు'),
};

export type CountingRound =
  | { game: 'counting'; kind: 'count'; level: number; object: CountObject; n: number; options: number[]; groupSize: number }
  | { game: 'counting'; kind: 'match'; level: number; target: number; groups: { object: CountObject; n: number }[]; answer: number; groupSize: number };

const MIN = [1, 2, 4, 6, 10];
const MAX = [5, 10, 15, 20, 30];
const OPTS = [3, 3, 4, 4, 4];

export function countingLimits(level: number) { return { min: MIN[level], max: MAX[level] }; }

export function generateCounting(seed: number, level: number): CountingRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const min = MIN[lv], max = MAX[lv];
  const groupSize = lv >= 4 ? 10 : 5;
  const matchKind = lv >= 1 && r.next() < (lv === 1 ? 0.3 : 0.4);
  const near = (c: number) => () => clamp(c + r.int(-3, 3), 1, max);
  if (!matchKind) {
    const n = r.int(min, max);
    const object = r.pick(COUNT_OBJECTS);
    const others = distinct(r, OPTS[lv] - 1, near(n), [n]);
    // fallback: walk outward if the neighbourhood was too small
    for (let d = 1; others.length < OPTS[lv] - 1; d++) { for (const c of [n + d, n - d]) if (c >= 1 && c <= max && c !== n && !others.includes(c) && others.length < OPTS[lv] - 1) others.push(c); }
    return { game: 'counting', kind: 'count', level: lv, object, n, options: r.shuffle([n, ...others]), groupSize };
  }
  const target = r.int(min, Math.min(max, lv <= 1 ? 10 : max));
  const k = 3;
  const others = distinct(r, k - 1, near(target), [target]);
  for (let d = 1; others.length < k - 1; d++) { for (const c of [target + d, target - d]) if (c >= 1 && c !== target && !others.includes(c) && others.length < k - 1) others.push(c); }
  const counts = r.shuffle([target, ...others]);
  const objs = r.shuffle(COUNT_OBJECTS);
  const groups = counts.map((n, i) => ({ object: objs[i % objs.length], n }));
  return { game: 'counting', kind: 'match', level: lv, target, groups, answer: counts.indexOf(target), groupSize };
}

export function checkCounting(round: CountingRound, choice: number): boolean {
  return round.kind === 'count' ? choice === round.n : choice === round.answer;
}

/** Returns a list of rule violations (empty when the round is valid). */
export function validateCounting(round: CountingRound): string[] {
  const e: string[] = [];
  const { max } = countingLimits(round.level);
  if (round.kind === 'count') {
    if (round.n < 1 || round.n > max) e.push('n out of range');
    if (round.options.filter((o) => o === round.n).length !== 1) e.push('answer must appear once');
    if (new Set(round.options).size !== round.options.length) e.push('duplicate options');
    if (round.options.some((o) => o < 1)) e.push('option < 1');
  } else {
    const ns = round.groups.map((g) => g.n);
    if (new Set(ns).size !== ns.length) e.push('duplicate group sizes');
    if (round.groups[round.answer]?.n !== round.target) e.push('answer group wrong');
    if (ns.some((n) => n < 1)) e.push('empty group');
  }
  return e;
}
