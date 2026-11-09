import { describe, expect, it } from 'vitest';
import { GENERATORS, dailyPuzzle } from '../src/features/games/gen';
import { GAMES, gamesForClass, BADGES } from '../src/features/games/catalog';
import { LEVELS, levelFor } from '../src/features/games/gen/common';
import { grade, parseRational } from '../src/shared/grading';
import { checkCounting, generateCounting } from '../src/features/games/gen/counting';
import { binFor, checkDrop, generateShapes } from '../src/features/games/gen/shapes';
import { checkPattern, generatePatterns, patternAnswer, numberSeq, ruleTerm } from '../src/features/games/gen/patterns';
import { answerK, generateNumberLine } from '../src/features/games/gen/numberline';
import { checkMatch, generateFractions, sameValue, decText } from '../src/features/games/gen/fractions';
import { countSudokuSolutions, generateLogic, generateMagic, generateSudoku, isMagic, isMagicSolved, isSudokuSolved, sudokuConflicts } from '../src/features/games/gen/logic';
import { applyOp, generateBalance, isBalanced, isSolvedEq, solvePath, solvedValue, formatEq } from '../src/features/games/gen/balance';
import {
  circuitGoalMet, forceAnswer, generateCircuits, mirrorAnswer, netForce, numericFromFormula, reflectDir, simulate, toSI,
  type CircuitsRound, type ForceRound, type NumericRound,
} from '../src/features/games/gen/circuits';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);
const FEW = SEEDS.slice(0, 40); // for the heavier generators (9×9 sudoku)

describe('catalog', () => {
  it('has the eight required games with valid class ranges', () => {
    expect(GAMES.map((g) => g.id).sort()).toEqual(['balance', 'circuits', 'counting', 'fractions', 'logic', 'numberline', 'patterns', 'shapes']);
    for (const g of GAMES) {
      expect(g.classRange[0]).toBeGreaterThanOrEqual(0);
      expect(g.classRange[1]).toBeLessThanOrEqual(12);
      expect(g.classRange[0]).toBeLessThanOrEqual(g.classRange[1]);
      expect(g.objectives.length).toBeGreaterThan(10);
      expect(g.variants).toContain('regular');
    }
  });
  it('puts games that fit the class first', () => {
    for (let c = 0; c <= 12; c++) {
      const list = gamesForClass(c);
      const firstNonFit = list.findIndex((x) => !x.fits);
      if (firstNonFit >= 0) expect(list.slice(firstNonFit).every((x) => !x.fits)).toBe(true);
      expect(list.some((x) => x.fits)).toBe(true);
    }
  });
  it('maps class + variant to levels 0..4, challenge ≥ regular ≥ guided', () => {
    for (const g of GAMES) for (let c = 0; c <= 12; c++) {
      const gd = levelFor(g.classRange, c, 'guided'), rg = levelFor(g.classRange, c, 'regular'), ch = levelFor(g.classRange, c, 'challenge');
      expect(gd).toBeLessThanOrEqual(rg); expect(rg).toBeLessThanOrEqual(ch);
      expect(gd).toBeGreaterThanOrEqual(0); expect(ch).toBeLessThanOrEqual(4);
    }
  });
  it('badge ids are unique and short enough for sync', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length <= 80)).toBe(true);
  });
  it('daily puzzle is stable for a date + profile and suits the class', () => {
    const a = dailyPuzzle('2026-11-09', 'p1', 4), b = dailyPuzzle('2026-11-09', 'p1', 4);
    expect(a).toEqual(b);
    const g = GAMES.find((x) => x.id === a.gameId)!;
    expect(4).toBeGreaterThanOrEqual(g.classRange[0]); expect(4).toBeLessThanOrEqual(g.classRange[1]);
    const days = new Set(Array.from({ length: 20 }, (_, i) => dailyPuzzle(`2026-12-${String(i + 1).padStart(2, '0')}`, 'p1', 8).seed));
    expect(days.size).toBe(20);
  });
});

describe('every generator: deterministic and valid at every level', () => {
  for (const id of Object.keys(GENERATORS) as (keyof typeof GENERATORS)[]) {
    it(id, () => {
      const gen = GENERATORS[id] as { generate: (s: number, l: number) => unknown; validate: (r: never) => string[] };
      for (const level of LEVELS) for (const seed of level === 4 && id === 'logic' ? FEW : SEEDS) {
        const a = gen.generate(seed, level), b = gen.generate(seed, level);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        const errs = gen.validate(a as never);
        if (errs.length) throw new Error(`${id} level ${level} seed ${seed}: ${errs.join('; ')}\n${JSON.stringify(a)}`);
      }
      // different seeds give variety
      const distinctRounds = new Set(SEEDS.slice(0, 30).map((s) => JSON.stringify(gen.generate(s, 2))));
      expect(distinctRounds.size).toBeGreaterThan(5);
    });
  }
});

describe('counting', () => {
  it('only the true count is accepted; distractors never correct', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generateCounting(seed, level);
      if (r.kind === 'count') {
        expect(r.options.filter((o) => checkCounting(r, o))).toEqual([r.n]);
      } else {
        const ok = r.groups.map((_, i) => i).filter((i) => checkCounting(r, i));
        expect(ok).toEqual([r.answer]);
        expect(r.groups[r.answer].n).toBe(r.target);
      }
    }
  });
});

describe('shapes', () => {
  it('each piece is accepted by exactly one bin', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generateShapes(seed, level);
      for (const p of r.pieces) {
        const ok = r.bins.filter((b) => checkDrop(r, p.id, b.id));
        expect(ok.length).toBe(1);
        expect(ok[0].id).toBe(binFor(r, p)!.id);
      }
    }
  });
});

describe('patterns', () => {
  it('answer follows the rule; distractors never correct', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generatePatterns(seed, level);
      const ans = patternAnswer(r);
      if (r.kind === 'number') {
        expect(ans).toBe(ruleTerm(r.rule, r.blank));
        expect(numberSeq(r)[r.blank]).toBe(ans);
        expect(r.options.filter((o) => checkPattern(r, o)).length).toBe(1);
      } else {
        expect(ans).toEqual(r.unit[r.blank % r.unit.length]);
        expect(r.options.filter((o) => checkPattern(r, o)).length).toBe(1);
      }
    }
  });
});

describe('number line', () => {
  it('start and target stay on the line and match the arithmetic', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generateNumberLine(seed, level);
      const t = answerK(r);
      expect(t).toBeGreaterThanOrEqual(r.minK); expect(t).toBeLessThanOrEqual(r.maxK);
      expect(r.startK).toBeGreaterThanOrEqual(r.minK); expect(r.startK).toBeLessThanOrEqual(r.maxK);
      const exact = r.startK / r.den + (r.op === '+' ? 1 : -1) * (r.amountK / r.den);
      expect(Math.abs(t / r.den - exact)).toBeLessThan(1e-9);
      expect(r.hops.every((h) => h > 0)).toBe(true);
    }
  });
});

describe('fractions', () => {
  it('pairs are truly equivalent (checked with parseRational) and no cross-pair is equivalent', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generateFractions(seed, level);
      for (const a of r.left) {
        const matches = r.right.filter((b) => checkMatch(r, a.id, b.id));
        expect(matches.length).toBe(1);
        const b = matches[0];
        for (const c of [a, b]) if (c.kind === 'frac' || c.kind === 'dec' || c.kind === 'pct') {
          const p = parseRational(c.text)!;
          expect(p.num * c.den).toBe(c.num * p.den);
        }
        expect(sameValue(a, b)).toBe(true);
      }
    }
  });
  it('decimal text is exact', () => {
    expect(decText(1, 8)).toBe('0.125');
    expect(decText(3, 4)).toBe('0.75');
    expect(decText(5, 4)).toBe('1.25');
    expect(decText(1, 25)).toBe('0.04');
    expect(grade({ kind: 'fraction', num: 3, den: 4 }, { kind: 'text', value: '75%' }).correct).toBe(true);
  });
});

describe('logic grids', () => {
  it('sudoku: unique, valid solution consistent with givens', () => {
    for (const level of [0, 1, 2, 3]) for (const seed of SEEDS.slice(0, 60)) {
      const r = generateSudoku(seed, level);
      expect(isSudokuSolved(r.solution, r)).toBe(true);
      expect(countSudokuSolutions(r.givens, r.n, r.br, r.bc, 3)).toBe(1);
      expect(sudokuConflicts(r.givens, r.n, r.br, r.bc)).toEqual([]);
      expect(r.givens.filter((v) => !v).length).toBeGreaterThan(0);
    }
    for (const seed of SEEDS.slice(0, 8)) {
      const r = generateSudoku(seed, 4);
      expect(r.n).toBe(9);
      expect(countSudokuSolutions(r.givens, 9, 3, 3, 3)).toBe(1);
    }
  });
  it('sudoku: a grid that breaks a rule is rejected', () => {
    const r = generateSudoku(42, 0);
    const bad = r.solution.slice();
    const i = r.givens.findIndex((v) => !v);
    bad[i] = (bad[i] % r.n) + 1;
    expect(isSudokuSolved(bad, r)).toBe(false);
  });
  it('magic squares: every line sums to the total, unique completion', () => {
    for (const level of LEVELS) for (const seed of SEEDS.slice(0, 60)) {
      const r = generateMagic(seed, level);
      expect(isMagic(r.solution, r.total)).toBe(true);
      expect(isMagicSolved(r.solution, r)).toBe(true);
      expect(r.total).toBe(r.numbers.reduce((s, x) => s + x, 0) / 3);
    }
  });
  it('mixes sudoku and magic squares at higher levels', () => {
    const kinds = new Set(SEEDS.slice(0, 40).map((s) => generateLogic(s, 2).kind));
    expect(kinds).toEqual(new Set(['sudoku', 'magic']));
  });
});

describe('balance', () => {
  it('every step keeps both sides equal and ends at x = solution', () => {
    for (const level of LEVELS) for (const seed of SEEDS) {
      const r = generateBalance(seed, level);
      let eq = r.start;
      expect(isBalanced(eq, r.x)).toBe(true);
      for (const op of solvePath(eq)) {
        const res = applyOp(eq, op);
        expect(res.ok).toBe(true);
        if (!res.ok) break;
        eq = res.eq;
        expect(isBalanced(eq, r.x)).toBe(true);
      }
      expect(isSolvedEq(eq)).toBe(true);
      expect(solvedValue(eq)).toBe(r.x);
      // the solution is unique: a ≠ c
      expect(r.start.a).not.toBe(r.start.c);
    }
  });
  it('any legal operation the learner applies keeps the balance', () => {
    for (const seed of SEEDS.slice(0, 40)) {
      const r = generateBalance(seed, 4);
      for (const op of [{ kind: 'add', term: 'k', value: 7 }, { kind: 'sub', term: 'x', value: 2 }, { kind: 'mul', term: 'k', value: -3 }] as const) {
        const res = applyOp(r.start, op);
        if (res.ok) expect(isBalanced(res.eq, r.x)).toBe(true);
      }
    }
  });
  it('seniors get two-step equations and variables on both sides', () => {
    const lv3 = SEEDS.slice(0, 30).map((s) => generateBalance(s, 3));
    expect(lv3.every((r) => r.start.a !== 0 && r.start.c !== 0)).toBe(true);
    expect(lv3.every((r) => r.optimal >= 2)).toBe(true);
    expect(formatEq({ a: 3, b: -2, c: 1, d: 4 })).toBe('3x − 2 = x + 4');
  });
});

describe('circuits & physics', () => {
  const all: CircuitsRound[] = [];
  for (const level of LEVELS) for (const seed of SEEDS) all.push(generateCircuits(seed, level));

  it('circuits: stored solution lights the targets, all-open does not', () => {
    for (const r of all) if (r.kind === 'circuit') {
      expect(circuitGoalMet(r, new Set(r.solution))).toBe(true);
      expect(circuitGoalMet(r, new Set())).toBe(false);
      expect(simulate(r, new Set(r.solution)).short).toBe(false);
    }
  });
  it('forces: answers match the net force; choice distractors are wrong', () => {
    for (const r of all) if (r.kind === 'force') {
      const f = r as ForceRound;
      const net = netForce(f.forces);
      const a = forceAnswer(f);
      if (f.ask === 'direction') expect(a.choice).toBe(net > 0 ? 'R' : net < 0 ? 'L' : 'none');
      if (f.options) expect(f.options.filter((o) => o === a.choice).length).toBe(1);
      if (f.ask === 'net') {
        expect(a.value).toBe(Math.abs(net));
        expect(grade({ kind: 'number', value: a.value!, unit: 'N', requireUnit: true }, { kind: 'text', value: `${a.value} N` }).correct).toBe(true);
        expect(grade({ kind: 'number', value: a.value!, unit: 'N', requireUnit: true }, { kind: 'text', value: `${a.value}` }).correct).toBe(false);
      }
      if (f.ask === 'accel') {
        const kg = f.mass!.unit === 'g' ? f.mass!.value / 1000 : f.mass!.value;
        expect(a.value).toBeCloseTo(Math.abs(net) / kg, 9);
        expect(grade({ kind: 'number', value: a.value!, unit: 'm/s^2', requireUnit: true, relTolerance: 0.01 }, { kind: 'text', value: `${a.value} m/s²` }).correct).toBe(true);
      }
    }
  });
  it('mirrors: exactly one option reflects the ray onto the target', () => {
    for (const r of all) if (r.kind === 'mirror' && r.ask === 'choice') {
      const hits = r.options.filter((m) => reflectDir(r.inDir, m) === r.target);
      expect(hits).toEqual([mirrorAnswer(r)]);
    }
  });
  it('numeric problems: value = formula (with unit conversion) and grading accepts equivalent units', () => {
    let n = 0;
    for (const r of all) if (r.kind === 'numeric') {
      n++;
      const q = r as NumericRound;
      expect(numericFromFormula(q)).toBeCloseTo(q.value, 6);
      // independent recomputation in SI
      const g = (k: string) => toSI(q.givens[k]);
      const si = { 'ohm-I': () => g('V') / g('R'), 'ohm-V': () => g('I') * g('R'), 'ohm-R': () => g('V') / g('I'), power: () => g('V') * g('I'), series: () => g('R1') + g('R2') + g('R3'), speed: () => g('d') / g('t'), fma: () => g('F') / g('m') }[q.template]();
      const factor = { A: 1, mA: 0.001, V: 1, 'Ω': 1, W: 1, 'm/s': 1, 'km/h': 1000 / 3600, 'm/s^2': 1 }[q.unit as 'A']!;
      expect(si / factor).toBeCloseTo(q.value, 6);
      const spec = { kind: 'number' as const, value: q.value, unit: q.unit, requireUnit: true, relTolerance: 0.01 };
      expect(grade(spec, { kind: 'text', value: `${q.value} ${q.unit}` }).correct).toBe(true);
      expect(grade(spec, { kind: 'text', value: `${q.value}` }).reason).toBe('missing-unit');
      expect(grade(spec, { kind: 'text', value: `${q.value * 2 + 1} ${q.unit}` }).correct).toBe(false);
      if (q.unit === 'A') expect(grade(spec, { kind: 'text', value: `${q.value * 1000} mA` }).correct).toBe(true);
      if (q.unit === 'mA') expect(grade(spec, { kind: 'text', value: `${q.value / 1000} A` }).correct).toBe(true);
      if (q.unit === 'km/h') expect(grade(spec, { kind: 'text', value: `${q.value / 3.6} m/s` }).correct).toBe(true);
    }
    expect(n).toBeGreaterThan(20);
  });
});
