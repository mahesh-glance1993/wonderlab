// Safe formula evaluator + "what changed and why" explainer for ExploreSpec blocks.
// The same algorithm is implemented in Kotlin (android/shared/.../feature/lesson/Formula.kt) — keep them in step.
import type { ExploreSpec, Localized } from './content';

type Tok = { k: 'num'; v: number } | { k: 'id'; v: string } | { k: 'op'; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      if (j < src.length && /[eE]/.test(src[j]) && /[-+0-9]/.test(src[j + 1] ?? '')) { j += 2; while (j < src.length && /[0-9]/.test(src[j])) j++; }
      out.push({ k: 'num', v: Number(src.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_Ͱ-Ͽ]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_Ͱ-Ͽ]/.test(src[j])) j++;
      out.push({ k: 'id', v: src.slice(i, j) });
      i = j; continue;
    }
    if ('+-*/^(),'.includes(c)) { out.push({ k: 'op', v: c }); i++; continue; }
    throw new Error(`Unexpected "${c}" in formula`);
  }
  return out;
}

const FN: Record<string, (...a: number[]) => number> = {
  sqrt: Math.sqrt, abs: Math.abs, min: Math.min, max: Math.max, log: Math.log10, ln: Math.log, exp: Math.exp,
  sin: (d) => Math.sin((d * Math.PI) / 180), cos: (d) => Math.cos((d * Math.PI) / 180), tan: (d) => Math.tan((d * Math.PI) / 180),
};

/** Evaluates `expr` with the given variables. Throws on syntax errors or unknown names. */
export function evaluate(expr: string, vars: Record<string, number>): number {
  const t = tokenize(expr);
  let p = 0;
  const peek = () => t[p];
  const eat = (v?: string) => { const x = t[p]; if (!x || (v && x.v !== v)) throw new Error(`Expected ${v ?? 'value'}`); p++; return x; };
  const primary = (): number => {
    const x = peek();
    if (!x) throw new Error('Unexpected end');
    if (x.k === 'num') { p++; return x.v; }
    if (x.k === 'op' && x.v === '(') { p++; const v = sum(); eat(')'); return v; }
    if (x.k === 'op' && x.v === '-') { p++; return -power(); }
    if (x.k === 'op' && x.v === '+') { p++; return power(); }
    if (x.k === 'id') {
      p++;
      if (peek()?.v === '(') {
        const f = FN[x.v]; if (!f) throw new Error(`Unknown function ${x.v}`);
        p++; const args = [sum()];
        while (peek()?.v === ',') { p++; args.push(sum()); }
        eat(')'); return f(...args);
      }
      if (x.v === 'pi') return Math.PI;
      if (!(x.v in vars)) throw new Error(`Unknown name ${x.v}`);
      return vars[x.v];
    }
    throw new Error(`Unexpected ${x.v}`);
  };
  const power = (): number => { const b = primary(); if (peek()?.v === '^') { p++; return Math.pow(b, power()); } return b; };
  const product = (): number => {
    let v = power();
    for (;;) {
      const o = peek();
      if (o?.v === '*') { p++; v *= power(); } else if (o?.v === '/') { p++; v /= power(); } else return v;
    }
  };
  const sum = (): number => {
    let v = product();
    for (;;) {
      const o = peek();
      if (o?.v === '+') { p++; v += product(); } else if (o?.v === '-') { p++; v -= product(); } else return v;
    }
  };
  const v = sum();
  if (p !== t.length) throw new Error('Extra input in formula');
  return v;
}

export type Relation = 'direct' | 'inverse' | 'square' | 'inverse-square' | 'sqrt' | 'increases' | 'decreases' | 'none';

/** How the result depends on one variable near the current values (numerical check of common laws). */
export function relation(spec: ExploreSpec, sym: string, values: Record<string, number>): Relation {
  const v0 = values[sym];
  const base = v0 !== 0 ? v0 : (spec.vars.find((v) => v.sym === sym)?.max ?? 1) / 2 || 1;
  const at = (x: number) => { try { return evaluate(spec.result.expr, { ...values, [sym]: x }); } catch { return NaN; } };
  const r1 = at(base), r2 = at(base * 2);
  if (!isFinite(r1) || !isFinite(r2)) return 'none';
  const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
  if (close(r1, r2)) return 'none';
  if (r1 !== 0) {
    const k = r2 / r1;
    if (close(k, 2)) return 'direct';
    if (close(k, 0.5)) return 'inverse';
    if (close(k, 4)) return 'square';
    if (close(k, 0.25)) return 'inverse-square';
    if (close(k, Math.SQRT2)) return 'sqrt';
  }
  return r2 > r1 ? 'increases' : 'decreases';
}

const fmt = (x: number, d = 2) => (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(2) : String(+x.toFixed(d)));

/** Plain-English sentence for a change of one input (shown under the explorer). */
export function explainChange(spec: ExploreSpec, sym: string, from: Record<string, number>, to: Record<string, number>, L: (l: Localized) => string): string {
  const v = spec.vars.find((x) => x.sym === sym);
  if (!v) return '';
  const r0 = evaluate(spec.result.expr, from), r1 = evaluate(spec.result.expr, to);
  const res = spec.result;
  const unit = (u?: string) => (u ? ` ${u}` : '');
  const up = to[sym] > from[sym];
  const moved = `${L(v.name)} (${v.sym}) ${up ? 'went up' : 'went down'} from ${fmt(from[sym])}${unit(v.unit)} to ${fmt(to[sym])}${unit(v.unit)}`;
  const resLine = `${L(res.name)} (${res.sym}) ${r1 > r0 ? 'rose' : r1 < r0 ? 'fell' : 'stayed'} ${r1 === r0 ? `at ${fmt(r0, res.decimals)}` : `from ${fmt(r0, res.decimals)} to ${fmt(r1, res.decimals)}`}${unit(res.unit)}`;
  const why: Record<Relation, string> = {
    direct: `${res.sym} is directly proportional to ${v.sym}: double ${v.sym} and ${res.sym} doubles.`,
    inverse: `${res.sym} is inversely proportional to ${v.sym}: double ${v.sym} and ${res.sym} halves.`,
    square: `${res.sym} depends on ${v.sym}²: double ${v.sym} and ${res.sym} becomes 4 times bigger.`,
    'inverse-square': `${res.sym} depends on 1/${v.sym}²: double ${v.sym} and ${res.sym} becomes a quarter.`,
    sqrt: `${res.sym} depends on √${v.sym}: ${v.sym} must become 4 times bigger to double ${res.sym}.`,
    increases: `When ${v.sym} increases, ${res.sym} increases too (but not in simple proportion).`,
    decreases: `When ${v.sym} increases, ${res.sym} decreases.`,
    none: `${res.sym} does not depend on ${v.sym} here.`,
  };
  const note = spec.notes?.find((n) => n.sym === sym);
  const extra = note ? ' ' + L(up ? note.up : note.down) : '';
  return `${moved}, so ${resLine}. ${why[relation(spec, sym, from)]}${extra}`;
}

/** Checks an ExploreSpec: the expression parses, uses only known names and gives finite values across the slider ranges. */
export function checkExplore(spec: ExploreSpec): string[] {
  const errs: string[] = [];
  const base = Object.fromEntries(spec.vars.map((v) => [v.sym, v.value]));
  for (const v of spec.vars) {
    if (!(v.min < v.max) || !(v.step > 0) || v.value < v.min || v.value > v.max) errs.push(`${spec.result.sym}: bad range for ${v.sym}`);
    for (const x of [v.min, v.value, v.max]) {
      try { const r = evaluate(spec.result.expr, { ...base, [v.sym]: x }); if (!isFinite(r)) errs.push(`${spec.result.sym}: not finite when ${v.sym}=${x}`); }
      catch (e) { errs.push(`${spec.result.sym}: ${(e as Error).message}`); break; }
    }
  }
  return errs;
}
