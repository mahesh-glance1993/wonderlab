// Equation balancing: a·x + b = c·x + d. Every operation is applied to BOTH sides.
import { rng, clamp } from './common';

export interface Eq { a: number; b: number; c: number; d: number }
export type OpKind = 'add' | 'sub' | 'mul' | 'div';
export interface BalanceOp { kind: OpKind; term: 'x' | 'k'; value: number }
export interface BalanceRound { game: 'balance'; level: number; start: Eq; x: number; optimal: number }

export const sideValue = (coef: number, k: number, x: number) => coef * x + k;
export const isBalanced = (e: Eq, x: number) => sideValue(e.a, e.b, x) === sideValue(e.c, e.d, x);
/** Solved when one side is exactly "x" and the other a number. */
export const isSolvedEq = (e: Eq) => (e.a === 1 && e.b === 0 && e.c === 0) || (e.c === 1 && e.d === 0 && e.a === 0);
export const solvedValue = (e: Eq) => (e.a === 1 ? e.d : e.b);

export function formatSide(coef: number, k: number, v = 'x'): string {
  const parts: string[] = [];
  if (coef !== 0) parts.push(coef === 1 ? v : coef === -1 ? `−${v}` : `${coef < 0 ? '−' : ''}${Math.abs(coef)}${v}`);
  if (k !== 0 || coef === 0) {
    if (parts.length) parts.push(k < 0 ? `− ${-k}` : `+ ${k}`);
    else parts.push(k < 0 ? `−${-k}` : String(k));
  }
  return parts.join(' ');
}
export const formatEq = (e: Eq) => `${formatSide(e.a, e.b)} = ${formatSide(e.c, e.d)}`;
export const formatOp = (op: BalanceOp) => {
  const val = op.term === 'x' ? (op.value === 1 ? 'x' : `${op.value}x`) : String(op.value);
  return op.kind === 'add' ? `add ${val}` : op.kind === 'sub' ? `subtract ${val}` : op.kind === 'mul' ? `multiply by ${op.value}` : `divide by ${op.value}`;
};

export type ApplyResult = { ok: true; eq: Eq } | { ok: false; reason: 'zero' | 'fraction' | 'x-mul' };
export function applyOp(e: Eq, op: BalanceOp): ApplyResult {
  const v = op.value;
  if ((op.kind === 'mul' || op.kind === 'div') && op.term === 'x') return { ok: false, reason: 'x-mul' };
  switch (op.kind) {
    case 'add': return { ok: true, eq: op.term === 'x' ? { ...e, a: e.a + v, c: e.c + v } : { ...e, b: e.b + v, d: e.d + v } };
    case 'sub': return { ok: true, eq: op.term === 'x' ? { ...e, a: e.a - v, c: e.c - v } : { ...e, b: e.b - v, d: e.d - v } };
    case 'mul': return v === 0 ? { ok: false, reason: 'zero' } : { ok: true, eq: { a: e.a * v, b: e.b * v, c: e.c * v, d: e.d * v } };
    case 'div':
      if (v === 0) return { ok: false, reason: 'zero' };
      if ([e.a, e.b, e.c, e.d].some((n) => n % v !== 0)) return { ok: false, reason: 'fraction' };
      return { ok: true, eq: { a: e.a / v || 0, b: e.b / v || 0, c: e.c / v || 0, d: e.d / v || 0 } };
  }
}

const sub = (term: 'x' | 'k', v: number): BalanceOp => (v >= 0 ? { kind: 'sub', term, value: v } : { kind: 'add', term, value: -v });

/** The next sensible step from any equation (used for hints and to compute the optimal path). */
export function nextStep(e: Eq): BalanceOp | null {
  if (isSolvedEq(e)) return null;
  if (e.a !== 0 && e.c !== 0) {
    // gather x on the side with the larger coefficient so it stays positive when possible
    return e.a >= e.c ? sub('x', e.c) : sub('x', e.a);
  }
  if (e.a !== 0) {
    if (e.b !== 0) return sub('k', e.b);
    if (e.a !== 1) return { kind: 'div', term: 'k', value: e.a };
  } else if (e.c !== 0) {
    if (e.d !== 0) return sub('k', e.d);
    if (e.c !== 1) return { kind: 'div', term: 'k', value: e.c };
  }
  return null;
}
export function solvePath(e: Eq): BalanceOp[] {
  const ops: BalanceOp[] = [];
  let cur = e;
  for (let i = 0; i < 10 && !isSolvedEq(cur); i++) {
    const op = nextStep(cur);
    if (!op) break;
    const res = applyOp(cur, op);
    if (!res.ok) break;
    ops.push(op); cur = res.eq;
  }
  return ops;
}

export function generateBalance(seed: number, level: number): BalanceRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  let e: Eq, x: number;
  if (lv === 0) {
    x = r.int(1, 10); const b = r.int(1, 10);
    e = r.next() < 0.5 ? { a: 1, b, c: 0, d: x + b } : { a: 0, b: x + b, c: 1, d: b };
  } else if (lv === 1) {
    x = r.int(2, 12);
    const t = r.int(0, 2);
    if (t === 0) { const a = r.int(2, 6); e = { a, b: 0, c: 0, d: a * x }; }
    else if (t === 1) { const b = r.int(1, x - 1); e = { a: 1, b: -b, c: 0, d: x - b }; }
    else { const b = r.int(2, 15); e = { a: 1, b, c: 0, d: x + b }; }
  } else if (lv === 2) {
    x = r.int(1, 12); const a = r.int(2, 6); const b = r.pick([-1, 1]) * r.int(1, 12);
    e = { a, b, c: 0, d: a * x + b };
    if (r.next() < 0.3) e = { a: 0, b: e.d, c: e.a, d: e.b };
  } else if (lv === 3) {
    x = r.int(1, 10); const c = r.int(1, 4); const a = c + r.int(2, 4); const b = r.int(1, 12);
    e = { a, b, c, d: a * x + b - c * x };
    if (r.next() < 0.4) e = { a: e.c, b: e.d, c: e.a, d: e.b };
  } else {
    x = r.int(-10, 10);
    let a = 0, c = 0;
    while (a === c || a === 0) { a = r.int(-5, 7); c = r.int(-4, 5); }
    const b = r.int(-15, 15);
    e = { a, b, c, d: a * x + b - c * x };
  }
  return { game: 'balance', level: lv, start: e, x, optimal: solvePath(e).length };
}

export function validateBalance(round: BalanceRound): string[] {
  const errs: string[] = [];
  const { start, x } = round;
  if (!isBalanced(start, x)) errs.push('start not balanced at x');
  if (start.a === start.c) errs.push('no unique solution');
  if (isSolvedEq(start)) errs.push('already solved');
  let cur = start;
  for (const op of solvePath(start)) {
    const res = applyOp(cur, op);
    if (!res.ok) { errs.push(`step failed ${formatOp(op)}`); break; }
    cur = res.eq;
    if (!isBalanced(cur, x)) errs.push(`unbalanced after ${formatOp(op)}`);
  }
  if (!isSolvedEq(cur) || solvedValue(cur) !== x) errs.push(`path ends at ${formatEq(cur)}`);
  if (round.optimal !== solvePath(start).length) errs.push('optimal mismatch');
  return errs;
}
