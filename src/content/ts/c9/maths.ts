// Telangana SCERT Class 9 — maths. Original explanations aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts9.m.ch<n>); objectives ts9.m.<topic>.<skill>.
// Every formula has a "what if?" explorer; every template uses only the Rng it is given.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, explore, photo, L, num, frac, approx, choose, matching, ordering, tapAll,
  gcd, fr, rd, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(9, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** signed number for display: −3 */
const n_ = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
/** number in brackets when negative: (−3) */
const pn = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
const pt = (x: number, y: number) => `(${n_(x)}, ${n_(y)})`;
/** display a fraction n/d in lowest terms with a proper minus sign */
const fx = (n: number, d: number) => fr(n, d).replace('-', '−');
const SUP = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
/** one term a·xᵏ (sign handled by caller) */
const term = (a: number, deg: number, v = 'x') => (deg === 0 ? `${a}` : `${a === 1 ? '' : a}${v}${SUP[deg] ?? ''}`);
/** polynomial from coefficients, highest degree first: [1, -3, 2] → x² − 3x + 2 */
const poly = (cs: number[], v = 'x') => {
  const n = cs.length - 1;
  let s = '';
  cs.forEach((c, i) => {
    if (!c) return;
    const body = term(Math.abs(c), n - i, v);
    s += s ? ` ${c < 0 ? '−' : '+'} ${body}` : `${c < 0 ? '−' : ''}${body}`;
  });
  return s || '0';
};
/** linear factor (x − a) shown nicely: x − 3, x + 2, x */
const xm = (a: number) => (a === 0 ? 'x' : a > 0 ? `x − ${a}` : `x + ${-a}`);
const isSq = (n: number) => Number.isInteger(Math.sqrt(n));
/** [0, 1, …, n] */
const range0 = (n: number) => Array.from({ length: n + 1 }, (_, i) => i);
/** signed term for a running sum: ' + 5' / ' − 5' */
const sg = (x: number) => ` ${x < 0 ? '−' : '+'} ${Math.abs(x)}`;

type Var = [sym: string, name: string, min: number, max: number, step: number, value: number, unit?: string];
interface XS {
  title: string; formula: string;
  result: [sym: string, name: string, expr: string, unit?: string, decimals?: number];
  vars: Var[]; notes: [sym: string, up: string, down: string][]; mistakes: [wrong: string, why: string][]; real: string;
}
/** "What if?" explorer block from compact arrays. */
const X = (s: XS): Block => {
  const [rs, rn, re, ru, rdp] = s.result;
  const result: { sym: string; name: ReturnType<typeof L>; expr: string; unit?: string; decimals?: number } = { sym: rs, name: L(rn), expr: re };
  if (ru) result.unit = ru;
  if (rdp !== undefined) result.decimals = rdp;
  return explore({
    title: L(s.title), formula: s.formula, result,
    vars: s.vars.map(([sym, name, min, max, step, value, unit]) => (unit ? { sym, name: L(name), min, max, step, value, unit } : { sym, name: L(name), min, max, step, value })),
    notes: s.notes.map(([sym, up, down]) => ({ sym, up: L(up), down: L(down) })),
    mistakes: s.mistakes.map(([wrong, why]) => ({ wrong: L(wrong), why: L(why) })),
    realWorld: L(s.real),
  });
};

type Mk = [when: string, explain: string][];
const mk = (m: Mk) => (m.length ? { mistakes: m.map(([when, explain]) => ({ when, explain })) } : {});
/** display tidy-up for generated text: proper minus signs, no "1x", no "+ −5" */
const tidy = (s: string) => s
  .replace(/(^|[\s(=×÷/])-(\d)/g, '$1−$2')
  .replace(/\+ −(\d)/g, '− $1')
  .replace(/(^|[^\d.])1([xy])\b/g, '$1$2')
  .replace(/(^|[^\d.])−1([xy])\b/g, '$1−$2');
const tidyAll = (xs: string[]) => xs.map(tidy);
/** typed numeric / fraction question */
const typed = (prompt: string, answer: AnswerSpec, hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'typed', keypad: answer.kind === 'fraction' ? 'fraction' : 'numeric', prompt: tidy(prompt), answer, hints: tidyAll(hints), solution: tidyAll(solution), ...mk(mistakes), ...extra,
});
/** multiple choice question */
const mcq = (r: Rng, prompt: string, correct: string, wrong: string[], hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt: tidy(prompt), ...choose(r, tidy(correct), tidyAll(wrong)), hints: tidyAll(hints), solution: tidyAll(solution), ...mk(mistakes), ...extra,
});
interface MC { q: string; a: string; w: string[]; h: string[]; s: string[]; why?: string }
/** a template that draws one concept question from a bank (bank needs >= 5 entries) */
const bank = (key: string, list: MC[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const it = r.pick(list);
  return mcq(r, it.q, it.a, it.w, it.h, it.s, [['wrong', it.why ?? `The correct answer is: ${it.a}. ${it.s[it.s.length - 1]}`]]);
}, d);
/** ordering question; the shuffle makes each item different */
const orderT = (key: string, prompt: string, steps: string[], hints: string[], d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, steps), hints, solution: steps.map((s, i) => `${i + 1}. ${s}`),
  mistakes: [{ when: 'wrong', explain: 'Ask yourself what each step needs from the step before it.' }],
}), d);
/** matching question on k pairs drawn from a pool (pool >= 5, right labels distinct) */
const matchT = (key: string, stem: string, pool: [string, string][], hints: string[], k = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, k);
  return {
    type: 'match', prompt: `${stem}: ${pick.map(([a]) => a).join('; ')}.`, ...matching(r, pick), hints,
    solution: pick.map(([a, b]) => `${a} → ${b}`), mistakes: [{ when: 'wrong', explain: 'Check each pair against its definition one at a time.' }],
  };
}, d);
/** tap-all question: nOk correct and nBad wrong labels drawn from pools */
const tapT = (key: string, prompt: string, okPool: string[], badPool: string[], hints: string[], why: string, nOk = 3, nBad = 3, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = [...r.shuffle(okPool).slice(0, nOk).map((label) => ({ label, ok: true })), ...r.shuffle(badPool).slice(0, nBad).map((label) => ({ label, ok: false }))];
  return {
    type: 'tap', prompt, ...tapAll(r, pick), hints,
    solution: [`Yes: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`, `No: ${pick.filter((x) => !x.ok).map((x) => x.label).join(', ')}`],
    mistakes: [{ when: 'wrong', explain: why }],
  };
}, d);
/** n-th step answer helper */
const st = (prompt: string, answer: AnswerSpec) => ({ prompt, answer });
const PI7 = 22 / 7;
const YN = (b: boolean) => (b ? 'Yes' : 'No');

// ================================================================== CH 1 REAL NUMBERS
const ch1: USpec = {
  id: 'ts9.m.ch1', subject: 'math', title: 'Real Numbers', source: src(1),
  objectives: [
    {
      id: 'ts9.m.real.irrational', title: 'Irrational numbers on the number line',
      intro: [
        h('A length no fraction can name'),
        p('Draw a square of side 1 m on the floor of your school ground in Warangal. Stretch a rope along its diagonal. How long is the rope? Pythagoras says the diagonal d obeys d² = 1² + 1² = 2, so d = √2 m. Mathematicians proved more than 2000 years ago that no fraction p/q equals √2 exactly. Yet the rope is real, so √2 must be a real point on the number line.'),
        def('Rational number', 'A number that can be written as p/q where p and q are integers and q ≠ 0, e.g. 3, −5/4, 0.25.'),
        def('Irrational number', 'A number that is on the number line but cannot be written as p/q. Examples: √2, √3, √5, π.'),
        p('Together the rational and irrational numbers make the real numbers. Every real number is a point on the number line, and every point on the line is a real number.'),
        h('Locating √2, √3, √4 … with a square-root spiral'),
        stepsB(
          'Mark O at 0 and A at 1 on the number line.',
          'At A draw a perpendicular AB of length 1 unit. Then OB = √(1² + 1²) = √2.',
          'With centre O and radius OB, draw an arc to cut the number line. That point is √2.',
          'At B draw a perpendicular BC of 1 unit to OB. Then OC = √(2 + 1) = √3. Repeat to get √4, √5, …',
        ),
        f('OB = √(OA² + AB²)', 'O B equals the square root of O A squared plus A B squared'),
        X({
          title: 'What if? Change the sides of the right triangle', formula: 'hypotenuse c = √(a² + b²)',
          result: ['c', 'Length of the hypotenuse', 'sqrt(a^2 + b^2)', 'units', 3],
          vars: [['a', 'Base along the number line', 0.5, 5, 0.5, 1, 'units'], ['b', 'Perpendicular height', 0.5, 5, 0.5, 1, 'units']],
          notes: [
            ['a', 'A longer base pushes the arc further along the number line, so the point you mark is bigger.', 'A shorter base brings the arc closer to 0.'],
            ['b', 'A taller perpendicular also makes the slanting side longer.', 'A shorter perpendicular makes the slanting side closer to the base.'],
          ],
          mistakes: [
            ['Writing c = a + b', 'The slanting side is shorter than the two legs together: with a = b = 1, c = √2 ≈ 1.414, not 2.'],
            ['Thinking every square root is irrational', '√4 = 2 and √9 = 3 are rational. √n is irrational only when n is not a perfect square.'],
          ],
          real: 'Carpenters check a corner is square with a 3–4–5 triangle: legs 3 and 4 give a diagonal of exactly √25 = 5.',
        }),
        keys('Real numbers = rational numbers + irrational numbers.', '√n is irrational when n (a whole number) is not a perfect square.', 'Each real number has exactly one point on the number line.', 'Between any two real numbers there are infinitely many rational and irrational numbers.'),
        remember('π is irrational. 22/7 and 3.14 are only rational approximations of π.'),
        tip('To place √n between whole numbers, find the perfect squares around n: 25 < 29 < 36, so 5 < √29 < 6.'),
      ],
      examples: [
        ex('Show how to locate √5 on the number line.', ['Mark OA = 2 units on the number line from O (0).', 'At A draw AB ⟂ OA with AB = 1 unit.', 'OB = √(2² + 1²) = √5.', 'Draw an arc with centre O and radius OB to cut the number line at P.'], 'P represents √5'),
        ex('Between which two consecutive whole numbers does √40 lie?', ['Perfect squares near 40: 36 = 6² and 49 = 7².', '36 < 40 < 49, so 6 < √40 < 7.'], '6 and 7'),
        ex('Is √(49) rational or irrational?', ['49 = 7², so √49 = 7 = 7/1.'], 'Rational'),
      ],
      practice: [
        tp('spiral', (r) => {
          const n = r.int(2, 15);
          return mcq(r, `In the square-root spiral, OA = √${n} units and AB = 1 unit is drawn perpendicular to OA at A. What is the length OB?`, `√${n + 1}`, [`√${n - 1}`, `√${n} + 1`, `${n + 1}`],
            ['OAB is a right triangle with the right angle at A.', `OB² = OA² + AB² = ${n} + 1.`],
            [`OB² = (√${n})² + 1² = ${n} + 1 = ${n + 1}`, `OB = √${n + 1}`],
            [['wrong', 'Square the two legs and add: (√n)² = n, and 1² = 1. Then take the square root.']]);
        }),
        tp('locate', (r) => {
          let k = r.int(5, 140);
          while (isSq(k)) k = r.int(5, 140);
          const lo = Math.floor(Math.sqrt(k));
          return typed(`√${k} lies between two consecutive whole numbers. Enter the SMALLER one.`, num(lo),
            ['List perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.', `Find the two perfect squares on either side of ${k}.`],
            [`${lo}² = ${lo * lo} < ${k} < ${(lo + 1) ** 2} = ${lo + 1}²`, `So ${lo} < √${k} < ${lo + 1}`],
            [[String(lo + 1), `${lo + 1}² = ${(lo + 1) ** 2} is bigger than ${k}, so ${lo + 1} is the larger neighbour.`], [String(Math.floor(k / 2)), 'A square root is not half the number. Compare with perfect squares instead.']]);
        }),
        tp('between', (r) => {
          const n = r.int(2, 8);
          const m = r.int(n * n + 1, (n + 1) ** 2 - 1);
          return mcq(r, `Which of these is an irrational number lying strictly between ${n} and ${n + 1}?`, `√${m}`, [`√${n * n}`, `√${(n + 1) ** 2 + 1}`, `√${(n - 1) ** 2 + 1}`],
            [`Square the end points: ${n}² = ${n * n}, ${n + 1}² = ${(n + 1) ** 2}.`, 'The number under the root must be strictly between these squares.'],
            [`${n * n} < ${m} < ${(n + 1) ** 2}`, `So ${n} < √${m} < ${n + 1}, and ${m} is not a perfect square, so √${m} is irrational.`]);
        }),
        tapT('tap', 'Tap every IRRATIONAL number.', ['√2', '√3', 'π', '√7', '√10', '2 + √5', '−√11', '0.101001000100001…'], ['√16', '22/7', '0.333…', '√(9/4)', '−7', '3.14', '0.25', '√1'],
          ['Simplify roots first: √16 = 4.', 'A terminating or repeating decimal is rational.'], '22/7 and 3.14 are rational approximations of π, and √16 = 4 is a whole number.'),
        bank('facts', [
          { q: 'Which statement is true?', a: 'Every point on the number line is a real number.', w: ['Every point on the number line is rational.', 'Irrational numbers cannot be shown on the number line.', 'There are no numbers between 1 and 2 except 1.5.'], h: ['Think of √2 on the number line.'], s: ['Real numbers fill the whole number line; irrational numbers like √2 have points too.'] },
          { q: 'How many rational numbers lie between 1 and 2?', a: 'Infinitely many', w: ['None', 'Exactly one', 'Exactly 9'], h: ['Try 1.5, 1.25, 1.125, …'], s: ['You can always find another one halfway between any two, so there are infinitely many.'] },
          { q: 'Which number is rational?', a: '√(81)', w: ['√8', '√18', '√80'], h: ['Which number under the root is a perfect square?'], s: ['81 = 9², so √81 = 9 is rational.'] },
          { q: 'Who is generally credited with first finding that √2 is irrational?', a: 'The Pythagoreans of ancient Greece (around 400 BCE)', w: ['Euclid in 1800 CE', 'Isaac Newton', 'Srinivasa Ramanujan'], h: ['It happened in ancient Greece.'], s: ['The discovery is credited to the followers of Pythagoras, possibly Hippasus.'] },
          { q: 'A square has area 7 m². Its side is:', a: '√7 m, an irrational number', w: ['3.5 m', '7/2 m, a rational number', '49 m'], h: ['Side × side = area.'], s: ['side² = 7, so side = √7 m, which is irrational because 7 is not a perfect square.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.real.decimal', title: 'Real numbers and their decimal expansions', prereqs: ['ts9.m.real.irrational'],
      intro: [
        h('Three kinds of decimals'),
        p('Sharing ₹10 among 4 friends gives ₹2.50 each — the decimal stops. Sharing ₹10 among 3 friends gives ₹3.333… — it repeats for ever. The decimal of √2 = 1.41421356… neither stops nor repeats. The type of decimal tells you what kind of number you have.'),
        def('Terminating decimal', 'The division ends after a finite number of steps: 7/8 = 0.875.'),
        def('Non-terminating recurring decimal', 'A block of digits repeats for ever: 4/11 = 0.363636… written 0.‾36 (bar over the repeating block).'),
        def('Non-terminating non-recurring decimal', 'Goes on for ever with no repeating block. These are exactly the irrational numbers.'),
        p('Why must p/q terminate or repeat? When you divide by q, each remainder is one of 0, 1, …, q − 1. If a remainder becomes 0 the decimal stops. If not, within q steps some remainder must come back, and from then on the digits repeat.'),
        h('From a recurring decimal back to p/q'),
        stepsB('Let x = 0.363636…', 'Two digits repeat, so multiply by 100: 100x = 36.3636…', 'Subtract: 100x − x = 36, so 99x = 36.', 'x = 36/99 = 4/11.'),
        h('Finding a rational number between two numbers'),
        f('m = (a + b) / 2', 'the midpoint m equals a plus b over two'),
        X({
          title: 'What if? Move the two end numbers', formula: 'm = (a + b) / 2',
          result: ['m', 'Number halfway between', '(a + b) / 2', '', 3],
          vars: [['a', 'Smaller number', -5, 5, 0.25, 0.5], ['b', 'Larger number', -5, 10, 0.25, 1]],
          notes: [
            ['a', 'Raising a moves the midpoint up by half as much.', 'Lowering a pulls the midpoint down by half as much.'],
            ['b', 'Raising b moves the midpoint up by half as much.', 'Lowering b pulls the midpoint down by half as much.'],
          ],
          mistakes: [
            ['Adding the numerators and adding the denominators', '(1/4 + 1/2) is not 2/6. That trick gives a number between, but not the one halfway between.'],
            ['Forgetting to divide by 2', 'a + b is outside the interval when both are positive.'],
          ],
          real: 'If a bus fare is ₹12.50 and an auto fare is ₹18, the average ₹15.25 lies exactly between them.',
        }),
        keys('Rational ⇔ terminating or recurring decimal.', 'Irrational ⇔ non-terminating, non-recurring decimal.', '0.‾a = a/9, 0.‾ab = ab/99.', '(a + b)/2 lies between a and b; repeat to find more.'),
        remember('1/7 = 0.‾142857 has a repeating block of 6 digits — never more than 7 − 1 = 6.'),
        tip('A fraction in lowest terms terminates exactly when its denominator has no prime factor other than 2 and 5.'),
      ],
      examples: [
        ex('Write 0.‾7 as a fraction.', ['x = 0.777…', '10x = 7.777…', '9x = 7', 'x = 7/9'], '7/9'),
        ex('Find a rational number between 1/3 and 1/2.', ['(1/3 + 1/2)/2', '= (2/6 + 3/6)/2 = (5/6)/2', '= 5/12'], '5/12'),
        ex('Is 3/40 terminating?', ['40 = 2³ × 5 has only the primes 2 and 5.', '3/40 = 75/1000 = 0.075'], 'Yes, 0.075'),
      ],
      practice: [
        tp('classify', (r) => {
          const dens = [4, 8, 16, 20, 25, 40, 50, 3, 6, 7, 9, 11, 12, 13, 15, 21];
          const q = r.pick(dens);
          let a = r.int(1, 20);
          while (gcd(a, q) !== 1) a = r.int(1, 20);
          let x = q;
          while (x % 2 === 0) x /= 2;
          while (x % 5 === 0) x /= 5;
          const t = x === 1;
          return mcq(r, `What kind of decimal expansion does ${a}/${q} have?`, t ? 'Terminating' : 'Non-terminating recurring', [t ? 'Non-terminating recurring' : 'Terminating', 'Non-terminating non-recurring'],
            ['The fraction is in lowest terms.', `Look at the prime factors of ${q}.`, 'Only 2s and 5s means it terminates.'],
            [t ? `${q} has only 2s and 5s as prime factors, so ${a}/${q} = ${rd(a / q, 6)} terminates.` : `${q} has a prime factor other than 2 and 5, so the digits repeat for ever.`],
            [['wrong', 'A fraction is rational, so it can never be non-recurring. Check whether the denominator has only the primes 2 and 5.']]);
        }),
        tp('recurring', (r) => {
          const two = r.next() < 0.6;
          let ab = two ? r.int(10, 98) : r.int(1, 8);
          while (two && ab % 11 === 0) ab = r.int(10, 98);
          const den = two ? 99 : 9;
          const shown = two ? `0.${ab}${ab}${ab}…` : `0.${ab}${ab}${ab}${ab}…`;
          return typed(`Write ${shown} in the form p/q.`, frac(ab, den),
            ['Let x equal the decimal.', two ? 'Two digits repeat, so multiply by 100.' : 'One digit repeats, so multiply by 10.', `Subtract to get ${den}x = ${ab}.`],
            [`x = ${shown}`, `${den}x = ${ab}`, `x = ${ab}/${den}${fr(ab, den) !== `${ab}/${den}` ? ` = ${fr(ab, den)}` : ''}`],
            [[`${ab}/${two ? 100 : 10}`, `That equals ${ab / (two ? 100 : 10)}, which stops. A repeating block needs 9s in the denominator.`]]);
        }, 2),
        tp('midpoint', (r) => {
          const ds = [2, 3, 4, 5, 6, 8];
          let b = r.pick(ds), d = r.pick(ds), a = r.int(1, b - 1), c = r.int(1, d - 1);
          while (a * d === c * b) { d = r.pick(ds); c = r.int(1, d - 1); }
          if (a * d > c * b) { [a, b, c, d] = [c, d, a, b]; }
          return typed(`Find the rational number exactly halfway between ${a}/${b} and ${c}/${d}.`, frac(a * d + c * b, 2 * b * d),
            ['Halfway means (first + second) ÷ 2.', `Use the common denominator ${b * d}.`],
            [`${a}/${b} + ${c}/${d} = ${fx(a * d + c * b, b * d)}`, `Halfway = ${fx(a * d + c * b, b * d)} ÷ 2 = ${fx(a * d + c * b, 2 * b * d)}`],
            [[`${a + c}/${b + d}`, 'Adding tops and bottoms gives a number between them, but not the one exactly halfway.'], [fx(a * d + c * b, b * d), 'That is the sum. Halve it to get the middle.']]);
        }),
        tp('expand', (r) => {
          const opts: [number, number, string][] = [[1, 3, '0.333…'], [2, 3, '0.666…'], [1, 9, '0.111…'], [5, 11, '0.4545…'], [1, 7, '0.142857142857…'], [3, 8, '0.375'], [7, 16, '0.4375'], [1, 6, '0.1666…'], [5, 12, '0.41666…'], [9, 20, '0.45']];
          const [a, b, dec] = r.pick(opts);
          const wrong = opts.filter(([x, y]) => x !== a || y !== b).map(([, , s]) => s);
          return mcq(r, `What is the decimal expansion of ${a}/${b}?`, dec, r.shuffle(wrong).slice(0, 3),
            ['Do the long division, or check the denominator.', 'Multiply your answer by the denominator to check.'],
            [`${a} ÷ ${b} = ${dec}`]);
        }),
        bank('facts', [
          { q: 'The decimal expansion of an irrational number is:', a: 'non-terminating and non-recurring', w: ['terminating', 'non-terminating recurring', 'either terminating or recurring'], h: ['Terminating and recurring decimals are rational.'], s: ['Irrational numbers never end and never repeat.'] },
          { q: 'What is the most number of digits that can repeat in the decimal of 1/17?', a: '16', w: ['17', '8', '1'], h: ['Remainders on dividing by 17 can only be 1 to 16.'], s: ['With at most 16 non-zero remainders, the block can be at most 16 digits long.'] },
          { q: '0.‾9 (0.999…) is equal to:', a: '1', w: ['less than 1', '0.9', '9/10'], h: ['Let x = 0.999…, then 10x = 9.999….'], s: ['10x − x = 9, so 9x = 9 and x = 1.'] },
          { q: 'Which number is irrational?', a: '0.12112111211112…', w: ['0.121212…', '0.1212', '12/99'], h: ['Does any block repeat?'], s: ['The number of 1s keeps growing, so no block repeats; it is irrational.'] },
          { q: 'Which fraction has a terminating decimal?', a: '13/40', w: ['1/12', '2/15', '5/21'], h: ['Look for denominators made only of 2s and 5s.'], s: ['40 = 2³ × 5, so 13/40 = 0.325 terminates.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.real.ops', title: 'Operations on real numbers and laws of exponents', prereqs: ['ts9.m.real.irrational'],
      intro: [
        h('Working with surds'),
        p('A tailor in Siddipet cuts two square cloth pieces of area 2 m² and 8 m². Their sides are √2 m and √8 m. Is √8 the same as 2√2? Yes: √8 = √(4 × 2) = √4 × √2 = 2√2. Rules like this let us add, subtract, multiply and divide roots.'),
        def('Surd', 'A root such as √2 or ∛5 whose value is irrational.'),
        keys('√a × √b = √(ab)  (a, b > 0)', '√a ÷ √b = √(a/b)', 'p√c + q√c = (p + q)√c — only LIKE surds add, just as 3x + 4x = 7x.', '(√a + √b)(√a − √b) = a − b'),
        p('Rational + irrational is irrational (2 + √3). A non-zero rational times an irrational is irrational (5√2). But two irrationals can give a rational: √2 × √8 = √16 = 4.'),
        h('Laws of exponents for real numbers'),
        p('For a positive real number a and rational numbers m, n: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ, and a⁻ᵐ = 1/aᵐ. A fractional power is a root:'),
        f('a^(m/n) = (ⁿ√a)ᵐ', 'a to the power m over n equals the n-th root of a, raised to the power m'),
        X({
          title: 'What if? Change the base and the fractional power', formula: 'y = a^(m/n)',
          result: ['y', 'Value', 'a^(m/n)', '', 3],
          vars: [['a', 'Base', 1, 100, 1, 8], ['m', 'Power (top)', 1, 5, 1, 2], ['n', 'Root (bottom)', 1, 5, 1, 3]],
          notes: [
            ['a', 'A bigger base gives a bigger value (for a positive power).', 'A smaller base gives a smaller value.'],
            ['m', 'A bigger top number raises the root to a higher power.', 'A smaller top number means fewer copies multiplied.'],
            ['n', 'A bigger bottom number takes a higher root, which shrinks numbers bigger than 1.', 'A smaller bottom number takes a lower root, so the value grows.'],
          ],
          mistakes: [
            ['Reading 8^(2/3) as 8 × 2/3', 'The exponent means "cube root, then square": ∛8 = 2, 2² = 4.'],
            ['Adding surds with different roots: √2 + √3 = √5', 'Check: √2 + √3 ≈ 3.15 but √5 ≈ 2.24. Only like surds can be added.'],
          ],
          real: 'Bank interest for half a year uses a power of 1/2: money grows by (1.1)^(1/2) ≈ 1.049 in six months at 10% a year.',
        }),
        remember('Take the root first, then the power: 27^(2/3) = (∛27)² = 3² = 9. The numbers stay small.'),
        tip('To simplify √72, find the largest perfect square factor: 72 = 36 × 2, so √72 = 6√2.'),
      ],
      examples: [
        ex('Simplify 2√3 + 5√3 − √12.', ['√12 = √(4 × 3) = 2√3', '2√3 + 5√3 − 2√3', '= 5√3'], '5√3'),
        ex('Find 16^(3/4).', ['⁴√16 = 2', '2³ = 8'], '8'),
        ex('Simplify (3 + √2)(3 − √2).', ['Use (a + b)(a − b) = a² − b²', '= 9 − 2 = 7'], '7'),
      ],
      practice: [
        tp('power', (r) => {
          const T: [number, number, number, number][] = [[8, 2, 3, 4], [27, 2, 3, 9], [16, 3, 4, 8], [32, 2, 5, 4], [81, 3, 4, 27], [125, 2, 3, 25], [64, 5, 6, 32], [4, 5, 2, 32], [9, 3, 2, 27], [25, 3, 2, 125], [16, 1, 4, 2], [64, 2, 3, 16], [243, 2, 5, 9], [49, 3, 2, 343]];
          const [a, m, n, v] = r.pick(T);
          const neg = r.next() < 0.35;
          const root = Math.round(a ** (1 / n));
          return typed(`Find the value of ${a}^(${neg ? '−' : ''}${m}/${n}).`, neg ? frac(1, v) : num(v),
            [`The bottom number ${n} means the ${n === 2 ? 'square' : n === 3 ? 'cube' : `${n}th`} root: it is ${root}.`, `Then raise ${root} to the power ${m}.`, ...(neg ? ['A negative power means "one over".'] : [])],
            [`${n}-th root of ${a} = ${root}`, `${root}^${m} = ${v}`, ...(neg ? [`${a}^(−${m}/${n}) = 1/${v}`] : [])],
            [[String(rd(a * m / n, 4)), 'The exponent is not a multiplier. Take the root first, then the power.'], ...(neg ? [[String(v), 'The minus sign in the power means take the reciprocal: 1/' + v + '.'] as [string, string]] : [])]);
        }),
        tp('like', (r) => {
          const k = r.pick([2, 3, 5, 6, 7]);
          const a = r.int(2, 9), b = r.int(1, 7), s = r.int(2, 4);
          const c = a + b - s;
          return typed(`Simplify ${a}√${k} + ${b}√${k} − √${k * s * s} and write it as c√${k}. Enter c.`, num(c),
            [`First simplify √${k * s * s}: ${k * s * s} = ${s * s} × ${k}.`, `√${k * s * s} = ${s}√${k}.`, 'Now add and subtract the coefficients of the like surds.'],
            [`√${k * s * s} = ${s}√${k}`, `${a}√${k} + ${b}√${k} − ${s}√${k} = (${a} + ${b} − ${s})√${k} = ${c}√${k}`],
            [[String(a + b - 1), `√${k * s * s} is not 1 × √${k}; take out the perfect square ${s * s} first.`]]);
        }),
        tp('multiply', (r) => {
          const k = r.pick([2, 3, 5, 6, 7]);
          const s = r.int(1, 4), t = r.int(2, 5);
          return typed(`Find √${k * s * s} × √${k * t * t}.`, num(k * s * t),
            ['√a × √b = √(ab).', `Or simplify each first: √${k * s * s} = ${s === 1 ? '' : s}√${k}.`],
            [`√${k * s * s} × √${k * t * t} = ${s === 1 ? '' : s}√${k} × ${t}√${k}`, `= ${s * t} × ${k} = ${k * s * t}`],
            [[String(s * t), `√${k} × √${k} = ${k}, not 1.`]]);
        }),
        tp('simplify', (r) => {
          const k = r.pick([2, 3, 5, 6, 7, 10, 11]);
          const s = r.int(2, 9);
          return typed(`Write √${k * s * s} in the form a√${k}. Enter a.`, num(s),
            [`Find the largest perfect square that divides ${k * s * s}.`, `${k * s * s} = ${s * s} × ${k}`],
            [`√${k * s * s} = √${s * s} × √${k} = ${s}√${k}`],
            [[String(s * s), `√${s * s} = ${s}; the square root of the square factor comes out.`]]);
        }),
        bank('laws', [
          { q: 'Which is equal to 5^(1/2) × 5^(3/2)?', a: '25', w: ['5^(3/4)', '125', '5'], h: ['Add the powers when multiplying.'], s: ['5^(1/2 + 3/2) = 5² = 25'] },
          { q: '(2^(1/3))⁶ equals:', a: '4', w: ['2', '8', '64'], h: ['(aᵐ)ⁿ = aᵐⁿ.'], s: ['(1/3) × 6 = 2, so 2² = 4'] },
          { q: 'Which statement is FALSE?', a: '√2 + √3 = √5', w: ['√2 × √3 = √6', '√12 = 2√3', '√18 ÷ √2 = 3'], h: ['Check each with a calculator-style estimate.'], s: ['√2 + √3 ≈ 3.15 but √5 ≈ 2.24, so they are not equal.'] },
          { q: 'The product of 2√3 and 3√3 is:', a: '18', w: ['6√3', '5√3', '6√9'], h: ['Multiply the numbers outside and the surds separately.'], s: ['2 × 3 × √3 × √3 = 6 × 3 = 18'] },
          { q: '7^(−2) equals:', a: '1/49', w: ['−49', '−14', '49'], h: ['a^(−m) = 1/aᵐ.'], s: ['7^(−2) = 1/7² = 1/49'] },
          { q: 'The sum of a rational and an irrational number is always:', a: 'irrational', w: ['rational', 'an integer', 'zero'], h: ['If r + x were rational, x would be rational too.'], s: ['Rational + irrational is irrational.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.real.rationalise', title: 'Rationalising the denominator', prereqs: ['ts9.m.real.ops'],
      intro: [
        h('Why move the root to the top?'),
        p('Before calculators, students in Hyderabad found 1/√2 by hand. Dividing 1 by 1.41421… is painful. But 1/√2 = √2/2 = 1.41421…/2 = 0.70710… — dividing by 2 is easy! Moving the surd from the denominator to the numerator is called rationalising the denominator.'),
        def('Rationalising factor', 'The expression you multiply top and bottom by to make the denominator rational. For √a it is √a; for a + √b it is a − √b (its conjugate).'),
        stepsB('Find the rationalising factor of the denominator.', 'Multiply numerator AND denominator by it (this is multiplying by 1, so the value does not change).', 'Simplify the denominator using √a × √a = a or (x + y)(x − y) = x² − y².'),
        f('1/(a + √b) = (a − √b)/(a² − b)', 'one over a plus root b equals a minus root b over a squared minus b'),
        X({
          title: 'What if? Change a and b in 1/(a + √b)', formula: 'v = 1/(a + √b) = (a − √b)/(a² − b)',
          result: ['v', 'Value of the fraction', '1 / (a + sqrt(b))', '', 4],
          vars: [['a', 'Whole number part', 1, 10, 1, 3], ['b', 'Number under the root', 2, 30, 1, 2]],
          notes: [
            ['a', 'A bigger a makes the denominator bigger, so the fraction gets smaller.', 'A smaller a makes the denominator smaller, so the fraction grows.'],
            ['b', 'A bigger b makes √b bigger, so the denominator grows and the value falls.', 'A smaller b shrinks √b and raises the value.'],
          ],
          mistakes: [
            ['Multiplying only the denominator by the conjugate', 'That changes the value. You must multiply top and bottom by the same thing.'],
            ['Writing (a + √b)(a − √b) = a² + b', 'The cross terms cancel and (√b)² = b is SUBTRACTED: a² − b.'],
          ],
          real: 'Engineers simplify 1/√3 to √3/3 ≈ 0.577 when working with the slopes of roof trusses.',
        }),
        keys('For 1/√a multiply by √a/√a.', 'For 1/(a + √b) multiply by (a − √b)/(a − √b).', 'For 1/(√a + √b) multiply by (√a − √b)/(√a − √b): the denominator becomes a − b.'),
        remember('The value never changes when you rationalise — only its form changes.'),
        tip('Check with approximate values: 1/(2 + √3) ≈ 1/3.732 ≈ 0.268 and 2 − √3 ≈ 0.268 ✓.'),
      ],
      examples: [
        ex('Rationalise 6/√3.', ['Multiply by √3/√3: 6√3/3', '= 2√3'], '2√3'),
        ex('Rationalise 1/(2 + √3).', ['Multiply by (2 − √3)/(2 − √3).', 'Denominator: 2² − (√3)² = 4 − 3 = 1', 'Result: 2 − √3'], '2 − √3'),
        ex('Given √2 ≈ 1.414, find 1/√2 to three decimal places.', ['1/√2 = √2/2', '= 1.414/2 = 0.707'], '0.707'),
      ],
      practice: [
        tp('simple', (r) => {
          const a = r.pick([2, 3, 5, 6, 7, 10]);
          const m = r.int(1, 5);
          return typed(`Rationalise ${a * m}/√${a} and write it as c√${a}. Enter c.`, num(m),
            [`Multiply top and bottom by √${a}.`, `√${a} × √${a} = ${a}.`],
            [`${a * m}/√${a} × √${a}/√${a} = ${a * m}√${a}/${a}`, `= ${m === 1 ? '' : m}√${a}`],
            [[String(a * m), `Divide ${a * m} by ${a} after multiplying through.`]]);
        }),
        tp('denom', (r) => {
          const a = r.int(2, 9);
          let b = r.pick([2, 3, 5, 6, 7, 10, 11]);
          while (b === a * a) b = r.pick([2, 3, 5, 7]);
          const plus = r.next() < 0.5;
          return typed(`To rationalise 1/(${a} ${plus ? '+' : '−'} √${b}), you multiply top and bottom by its conjugate. What whole number is the new denominator?`, num(a * a - b),
            [`The conjugate is ${a} ${plus ? '−' : '+'} √${b}.`, '(x + y)(x − y) = x² − y².'],
            [`(${a} + √${b})(${a} − √${b}) = ${a}² − (√${b})² = ${a * a} − ${b} = ${a * a - b}`, `So 1/(${a} ${plus ? '+' : '−'} √${b}) = (${a} ${plus ? '−' : '+'} √${b})/${n_(a * a - b)}`],
            [[String(a * a + b), '(√b)² is subtracted, not added.'], [String(a - b), 'Square a first: a² − b.']], { steps: [st(`What is ${a}²?`, num(a * a)), st('Now subtract b.', num(a * a - b))] });
        }, 2),
        tp('approx', (r) => {
          const [n, s] = r.pick([[2, 1.414], [3, 1.732], [5, 2.236]] as [number, number][]);
          const k = r.pick([1, 2, 3, 4, 6, 10]);
          const v = rd((k * s) / n, 3);
          return typed(`Given √${n} ≈ ${s}, find ${k}/√${n} correct to 3 decimal places.`, approx(v, 0.002),
            [`Rationalise first: ${k}/√${n} = ${k}√${n}/${n}.`, `Now compute ${k} × ${s} ÷ ${n}.`],
            [`${k}/√${n} = ${k}√${n}/${n}`, `≈ ${rd(k * s, 3)}/${n} = ${v}`],
            [[String(rd(k * s, 3)), `Remember to divide by ${n}.`]]);
        }),
        tp('factor', (r) => {
          const a = r.int(2, 9), b = r.pick([2, 3, 5, 6, 7, 11]);
          const kind = r.int(0, 2);
          const [den, ok, w] = kind === 0 ? [`${a} + √${b}`, `${a} − √${b}`, [`${a} + √${b}`, `√${b}`, `${a}`]]
            : kind === 1 ? [`√${b} − ${a}`, `√${b} + ${a}`, [`√${b} − ${a}`, `${a}`, `−√${b}`]]
              : [`√${a + b} + √${b}`, `√${a + b} − √${b}`, [`√${a + b} + √${b}`, `√${a + b}`, `√${a + 2 * b}`]];
          return mcq(r, `What is the rationalising factor of the denominator in 1/(${den})?`, ok, w,
            ['Change the sign between the two terms.', 'Multiplying a + b by a − b removes the square roots.'],
            [`(${den})(${ok}) gives a rational number, so the factor is ${ok}.`]);
        }),
        bank('concept', [
          { q: 'Rationalising the denominator of a fraction:', a: 'changes its form but not its value', w: ['makes the fraction bigger', 'makes the fraction smaller', 'changes it into a whole number'], h: ['We multiply by something equal to 1.'], s: ['Multiplying by √a/√a = 1 keeps the value the same.'] },
          { q: '1/(√5 + √3) after rationalising equals:', a: '(√5 − √3)/2', w: ['(√5 + √3)/2', '(√5 − √3)/8', '√5 − √3'], h: ['Denominator: 5 − 3.'], s: ['Multiply by (√5 − √3): denominator becomes 5 − 3 = 2.'] },
          { q: '1/√7 equals:', a: '√7/7', w: ['7/√7', '√7', '1/7'], h: ['Multiply top and bottom by √7.'], s: ['1/√7 × √7/√7 = √7/7'] },
          { q: '(√7 + 2)(√7 − 2) equals:', a: '3', w: ['11', '5', '√3'], h: ['(x + y)(x − y) = x² − y².'], s: ['7 − 4 = 3'] },
          { q: 'Why is √2/2 easier to evaluate by hand than 1/√2?', a: 'Dividing 1.414… by 2 is easier than dividing 1 by 1.414…', w: ['√2/2 is a whole number', '1/√2 is not a real number', 'They have different values'], h: ['Both are equal. Think about the division.'], s: ['They are equal, but dividing by 2 is far simpler than dividing by an endless decimal.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 2 POLYNOMIALS
const ch2: USpec = {
  id: 'ts9.m.ch2', subject: 'math', title: 'Polynomials and Factorisation', source: src(2),
  objectives: [
    {
      id: 'ts9.m.poly.degree', title: 'Polynomials in one variable and their degree',
      intro: [
        h('Expressions that describe shapes and costs'),
        p('A Pochampally weaver sells a sari for ₹x. Five saris and a ₹200 delivery charge cost 5x + 200. A square courtyard of side y metres has area y². Expressions like these, built from a variable with whole-number powers, are called polynomials.'),
        def('Polynomial in one variable', 'An expression aₙxⁿ + … + a₂x² + a₁x + a₀ where the powers of x are whole numbers (0, 1, 2, …) and the coefficients a₀, a₁, … are real numbers.'),
        def('Degree', 'The highest power of the variable with a non-zero coefficient. 4x³ − x + 7 has degree 3.'),
        keys('By degree: constant (0), linear (1), quadratic (2), cubic (3).', 'By number of terms: monomial (1 term), binomial (2), trinomial (3).', 'NOT polynomials: 1/x = x⁻¹, √x = x^(1/2) — the powers are not whole numbers.', 'The zero polynomial 0 has no defined degree.'),
        f('p(x) = ax² + bx + c   (quadratic, a ≠ 0)', 'p of x equals a x squared plus b x plus c'),
        X({
          title: 'What if? Evaluate a quadratic polynomial', formula: 'p(x) = ax² + bx + c',
          result: ['p', 'Value p(x)', 'a * x^2 + b * x + c'],
          vars: [['x', 'Value of x', -5, 5, 1, 2], ['a', 'Coefficient of x²', -3, 3, 1, 1], ['b', 'Coefficient of x', -5, 5, 1, -3], ['c', 'Constant term', -10, 10, 1, 2]],
          notes: [
            ['x', 'Far from zero the x² term takes over, so p grows quickly (when a > 0).', 'Coming back towards zero, the constant term matters more.'],
            ['a', 'A bigger leading coefficient makes the x² term dominate more.', 'A negative leading coefficient flips the shape upside down.'],
            ['c', 'The constant shifts every value up by the same amount.', 'The constant shifts every value down by the same amount.'],
          ],
          mistakes: [
            ['Squaring before applying the minus: −2² = 4', 'For x = −2, x² = (−2)² = 4, but −x² = −4. Always put negative values in brackets.'],
            ['Calling 2x³ + 0x⁴ a degree-4 polynomial', 'A term with coefficient 0 is not there. The degree is 3.'],
          ],
          real: 'The height of a ball thrown upward at a cricket match follows a quadratic in time.',
        }),
        remember('Write a polynomial in standard form (highest power first) before reading its degree.'),
        tip('Coefficient of x² in 3 − x² + 5x is −1, not 1. Keep the sign with the term.'),
      ],
      examples: [
        ex('Find the degree of 7 − 2x + 5x⁴ − x².', ['Standard form: 5x⁴ − x² − 2x + 7', 'The highest power is 4.'], 'Degree 4 (it is a polynomial with 4 terms)'),
        ex('Is x² + 3/x a polynomial?', ['3/x = 3x⁻¹', 'The power −1 is not a whole number.'], 'No'),
        ex('Classify 9y³ − 4y.', ['Degree 3 → cubic', '2 terms → binomial'], 'Cubic binomial'),
      ],
      practice: [
        tp('degree', (r) => {
          const deg = r.int(1, 6);
          const degs = r.shuffle([deg, ...r.shuffle([0, 1, 2, 3, 4, 5].filter((d) => d < deg)).slice(0, r.int(1, 3))]);
          const terms = degs.map((d, i) => { const c = r.int(1, 9) * (r.next() < 0.4 ? -1 : 1); const body = term(Math.abs(c), d); return i === 0 ? `${c < 0 ? '−' : ''}${body}` : ` ${c < 0 ? '−' : '+'} ${body}`; });
          const s = terms.join('');
          return typed(`What is the degree of the polynomial ${s}?`, num(deg),
            ['The degree is the HIGHEST power of x.', 'Terms may not be written in order — check each one.'],
            [`Powers present: ${[...degs].sort((a, b) => b - a).join(', ')}`, `Highest = ${deg}`],
            [[String(degs.length), 'That is the number of terms, not the degree.']]);
        }),
        tp('classify', (r) => {
          const deg = r.int(0, 3), nt = r.int(1, 3);
          const ds = deg === 0 ? [0] : [deg, ...r.shuffle(range0(deg - 1)).slice(0, Math.min(nt - 1, deg))];
          const cs = ds.map(() => r.int(1, 9));
          const s = ds.map((d, i) => (i === 0 ? term(cs[i], d) : ` + ${term(cs[i], d)}`)).join('');
          const byDeg = ['constant', 'linear', 'quadratic', 'cubic'][deg];
          const byTerms = ['monomial', 'binomial', 'trinomial'][ds.length - 1];
          const ok = `${byDeg} ${byTerms}`;
          const other = ['constant', 'linear', 'quadratic', 'cubic'].filter((x) => x !== byDeg);
          return mcq(r, `Classify the polynomial ${s} by its degree and number of terms.`, ok, [`${other[0]} ${byTerms}`, `${byDeg} ${['monomial', 'binomial', 'trinomial'].filter((x) => x !== byTerms)[0]}`, `${other[1]} ${byTerms}`],
            ['Degree 0, 1, 2, 3 → constant, linear, quadratic, cubic.', '1, 2, 3 terms → monomial, binomial, trinomial.'],
            [`Degree ${deg} → ${byDeg}`, `${ds.length} term${ds.length > 1 ? 's' : ''} → ${byTerms}`]);
        }),
        tp('coef', (r) => {
          const cs = [r.int(1, 6) * (r.next() < 0.3 ? -1 : 1), r.int(-9, 9), r.int(-9, 9), r.int(-9, 9)];
          const k = r.int(0, 3);
          const want = cs[3 - k];
          return typed(`What is the coefficient of ${k === 0 ? 'the constant term' : `x${SUP[k] ?? ''}`} in ${poly(cs)}?`, num(want),
            ['Find the term with that power of x.', 'Include its sign. If the term is missing, the coefficient is 0.'],
            [`The term is ${want === 0 ? 'missing' : term(Math.abs(want), k)}${want < 0 ? ' (with a minus sign)' : ''}, so the coefficient is ${n_(want)}.`],
            want < 0 ? [[String(-want), 'Keep the minus sign with the coefficient.']] : []);
        }),
        tapT('ispoly', 'Tap every expression that IS a polynomial.', ['x² − 3x + 1', '√2 x + 5', '7', 'y³ − y', '(1/2)t² + t', 'x¹⁰⁰'], ['x + 1/x', '√x + 2', 'x⁻² + 4', '3/(y + 1)', 'x^(3/2) − x', '2ˣ'],
          ['Every power of the variable must be a whole number.', 'The coefficients can be any real numbers, like √2.'], 'A polynomial can have √2 as a coefficient, but not √x or 1/x, because those are powers ½ and −1.'),
        bank('facts', [
          { q: 'The degree of a non-zero constant polynomial like 5 is:', a: '0', w: ['1', '5', 'not defined'], h: ['5 = 5x⁰.'], s: ['5 = 5x⁰, so the degree is 0.'] },
          { q: 'The maximum number of terms in a polynomial of degree 2 in x is:', a: '3', w: ['2', '4', 'unlimited'], h: ['Powers can be 2, 1 and 0 only.'], s: ['ax² + bx + c has at most 3 terms.'] },
          { q: 'A binomial of degree 35 could be:', a: 'x³⁵ − 1', w: ['x³⁵', '35x', 'x³⁵ + x² + 1'], h: ['Binomial = 2 terms.'], s: ['x³⁵ − 1 has 2 terms and highest power 35.'] },
          { q: 'The degree of the zero polynomial is:', a: 'not defined', w: ['0', '1', 'infinite'], h: ['0 = 0x = 0x² = …'], s: ['0 can be written with any power, so no degree is defined.'] },
          { q: 'Which is a linear polynomial?', a: '4 − 3x', w: ['x² − 4', '4', 'x³'], h: ['Linear means degree 1.'], s: ['4 − 3x has highest power 1.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.poly.zeroes', title: 'Value and zeroes of a polynomial', prereqs: ['ts9.m.poly.degree'],
      intro: [
        h('When does a polynomial become zero?'),
        p('A shopkeeper\'s profit on x kites is P(x) = 5x − 60 rupees. At x = 12, P(12) = 60 − 60 = 0: no profit, no loss. The number 12 is called a zero of the polynomial.'),
        def('Value of p(x) at x = k', 'The number p(k) you get by putting k in place of x.'),
        def('Zero of a polynomial', 'A number k with p(k) = 0.'),
        p('A linear polynomial ax + b (a ≠ 0) has exactly one zero: solve ax + b = 0 to get x = −b/a. A quadratic can have at most 2 zeroes, a cubic at most 3. A non-zero constant has no zero, and every real number is a zero of the zero polynomial.'),
        f('zero of ax + b is x = −b/a', 'the zero of a x plus b is x equals minus b over a'),
        X({
          title: 'What if? Find the zero of ax + b', formula: 'x = −b / a',
          result: ['x', 'Zero of the polynomial', '-b / a', '', 3],
          vars: [['a', 'Coefficient of x', 1, 10, 1, 5], ['b', 'Constant term', -60, 60, 1, -60]],
          notes: [
            ['a', 'A bigger a means x needs to be smaller to cancel b, so the zero moves towards 0.', 'A smaller a means x must be larger to cancel b.'],
            ['b', 'A larger constant pushes the zero further negative.', 'A smaller (more negative) constant pushes the zero positive.'],
          ],
          mistakes: [
            ['Writing the zero of 2x + 6 as 3', 'Solve 2x + 6 = 0: x = −3. The sign changes when b moves across.'],
            ['Thinking 0 can never be a zero', 'p(x) = 4x has p(0) = 0, so 0 IS its zero.'],
          ],
          real: 'The zero of a profit polynomial is the break-even point: how many items you must sell before you start earning.',
        }),
        keys('p(k) = 0 ⇔ k is a zero of p.', 'Linear: exactly one zero, −b/a.', 'Degree n: at most n zeroes.'),
        remember('A zero of a polynomial is a value of x, not the value of p(x).'),
        tip('Put negative values in brackets: p(−2) = 3(−2)² − (−2) = 12 + 2 = 14.'),
      ],
      examples: [
        ex('Find p(−1) for p(x) = 2x² − 3x + 5.', ['p(−1) = 2(−1)² − 3(−1) + 5', '= 2 + 3 + 5'], '10'),
        ex('Find the zero of 3x − 7.', ['3x − 7 = 0', 'x = 7/3'], '7/3'),
        ex('Are 2 and 3 zeroes of x² − 5x + 6?', ['p(2) = 4 − 10 + 6 = 0 ✓', 'p(3) = 9 − 15 + 6 = 0 ✓'], 'Yes, both are zeroes'),
      ],
      practice: [
        tp('value', (r) => {
          const cs = [r.int(1, 4) * (r.next() < 0.3 ? -1 : 1), r.int(-6, 6), r.int(-9, 9)];
          const k = r.int(-3, 3);
          const v = cs[0] * k * k + cs[1] * k + cs[2];
          return typed(`If p(x) = ${poly(cs)}, find p(${n_(k)}).`, num(v),
            [`Replace every x by ${pn(k)}.`, `${pn(k)}² = ${k * k}.`],
            [`p(${n_(k)}) = ${cs[0]} × ${k * k} ${cs[1] < 0 ? '−' : '+'} ${Math.abs(cs[1])} × ${pn(k)} ${cs[2] < 0 ? '−' : '+'} ${Math.abs(cs[2])}`, `= ${v}`],
            [[String(-cs[0] * k * k + cs[1] * k + cs[2]), `${pn(k)}² is positive: ${k * k}.`]]);
        }),
        tp('linzero', (r) => {
          const a = r.int(1, 9) * (r.next() < 0.25 ? -1 : 1);
          let b = r.int(-12, 12);
          while (b === 0) b = r.int(-12, 12);
          return typed(`Find the zero of the polynomial ${poly([a, b])}.`, frac(-b, a),
            [`Set ${poly([a, b])} = 0.`, `Move the constant across, then divide by ${n_(a)}.`],
            [`${poly([a, b])} = 0`, `${n_(a)}x = ${n_(-b)}`, `x = ${fx(-b, a)}`],
            [[fx(b, a), 'Watch the sign: the constant changes sign when it moves to the other side.']]);
        }),
        tp('check', (r) => {
          const p1 = r.int(-5, 5), p2 = r.int(-5, 5);
          const cs = [1, -(p1 + p2), p1 * p2];
          const k = r.next() < 0.5 ? r.pick([p1, p2]) : r.int(-5, 5);
          const v = k * k + cs[1] * k + cs[2];
          return mcq(r, `Is x = ${n_(k)} a zero of p(x) = ${poly(cs)}?`, `${YN(v === 0)} — p(${n_(k)}) = ${v}`, [`${YN(v !== 0)} — p(${n_(k)}) = ${v}`, `${YN(v !== 0)} — p(${n_(k)}) = ${v + 2}`],
            ['Work out p(k).', 'k is a zero only if p(k) = 0.'],
            [`p(${n_(k)}) = ${k * k}${sg(cs[1] * k)}${sg(cs[2])}`, `= ${v}`, v === 0 ? 'So it IS a zero.' : 'Not 0, so it is not a zero.']);
        }),
        bank('facts', [
          { q: 'How many zeroes does a non-zero constant polynomial have?', a: 'None', w: ['One', 'Two', 'Infinitely many'], h: ['p(x) = 5 is never 0.'], s: ['A non-zero constant never equals 0.'] },
          { q: 'The maximum number of zeroes of a cubic polynomial is:', a: '3', w: ['2', '4', '1'], h: ['At most as many as the degree.'], s: ['A polynomial of degree n has at most n zeroes.'] },
          { q: 'The zero of p(x) = cx (c ≠ 0) is:', a: '0', w: ['c', '1/c', '−c'], h: ['cx = 0 when x = ?'], s: ['c × 0 = 0, so 0 is the zero.'] },
          { q: 'Which polynomial has 1 as a zero?', a: 'x² + 2x − 3', w: ['x² + 1', 'x + 1', '2x² − 1'], h: ['Put x = 1 in each.'], s: ['1 + 2 − 3 = 0'] },
          { q: 'Every real number is a zero of:', a: 'the zero polynomial', w: ['a linear polynomial', 'p(x) = 1', 'p(x) = x²'], h: ['Which polynomial is 0 for all x?'], s: ['p(x) = 0 is zero for every x.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.poly.remainder', title: 'Dividing polynomials and the Remainder Theorem', prereqs: ['ts9.m.poly.zeroes'],
      intro: [
        h('A shortcut for the remainder'),
        p('Divide 17 by 5: 17 = 5 × 3 + 2, so the remainder is 2. Polynomials divide the same way: p(x) = g(x) × q(x) + r(x), where the remainder r(x) has smaller degree than g(x). When we divide by a linear polynomial x − a, the remainder is just a number.'),
        def('Division algorithm', 'p(x) = g(x) · q(x) + r(x), with r(x) = 0 or degree of r < degree of g.'),
        def('Remainder Theorem', 'When p(x) is divided by x − a, the remainder is p(a).'),
        p('Why? Write p(x) = (x − a) q(x) + r. Put x = a: p(a) = 0 × q(a) + r = r. So you never need long division just to find the remainder!'),
        f('remainder of p(x) ÷ (x − a) = p(a)', 'the remainder when p of x is divided by x minus a is p of a'),
        X({
          title: 'What if? Remainder of x³ + kx + d divided by (x − a)', formula: 'R = p(a) = a³ + k·a + d',
          result: ['R', 'Remainder', 'a^3 + k * a + d'],
          vars: [['a', 'Value a in (x − a)', -4, 4, 1, 2], ['k', 'Coefficient k', -10, 10, 1, -3], ['d', 'Constant d', -10, 10, 1, 1]],
          notes: [
            ['a', 'The a³ term grows fast, so the remainder changes quickly as a grows.', 'For negative a, the a³ term becomes negative.'],
            ['d', 'The constant adds straight on to the remainder.', 'A smaller constant lowers the remainder by the same amount.'],
          ],
          mistakes: [
            ['Using p(−a) when dividing by x − a', 'x − a = 0 when x = +a. For x + 3, use p(−3).'],
            ['Thinking the remainder must be positive', 'Remainders of polynomial division can be any number, including negative ones.'],
          ],
          real: 'Checking divisibility quickly: a remainder of 0 tells a designer that a pattern of length p(x) fits exactly into tiles of length x − a.',
        }),
        keys('Divide by x − a → remainder p(a).', 'Divide by x + a → remainder p(−a).', 'Divide by ax − b → remainder p(b/a).'),
        remember('Remainder 0 means x − a is a factor (next lesson: Factor Theorem).'),
        tip('Long division of polynomials works like long division of numbers: divide the leading terms, multiply back, subtract, bring down.'),
      ],
      examples: [
        ex('Find the remainder when x³ + 3x² + 3x + 1 is divided by x + 1.', ['x + 1 = 0 → x = −1', 'p(−1) = −1 + 3 − 3 + 1'], '0'),
        ex('Find the remainder when x⁴ + x³ − 2x² + x + 1 is divided by x − 1.', ['p(1) = 1 + 1 − 2 + 1 + 1'], '2'),
        ex('Find the remainder when 4x² − 3x + 2 is divided by 2x − 1.', ['2x − 1 = 0 → x = 1/2', 'p(1/2) = 4(1/4) − 3/2 + 2 = 1 − 1.5 + 2'], '3/2'),
      ],
      practice: [
        tp('rem', (r) => {
          const cs = [1, r.int(-4, 4), r.int(-6, 6), r.int(-9, 9)];
          let a = r.int(-3, 3);
          while (a === 0) a = r.int(-3, 3);
          const pa = a ** 3 + cs[1] * a * a + cs[2] * a + cs[3];
          const pm = -(a ** 3) + cs[1] * a * a - cs[2] * a + cs[3];
          return typed(`Find the remainder when ${poly(cs)} is divided by ${xm(a)}.`, num(pa),
            ['Use the Remainder Theorem.', `${xm(a)} = 0 gives x = ${n_(a)}.`, `Work out p(${n_(a)}).`],
            [`Remainder = p(${n_(a)})`, `= ${pn(a)}³ ${cs[1] < 0 ? '−' : '+'} ${Math.abs(cs[1])} × ${pn(a)}² ${cs[2] < 0 ? '−' : '+'} ${Math.abs(cs[2])} × ${pn(a)} ${cs[3] < 0 ? '−' : '+'} ${Math.abs(cs[3])}`, `= ${pa}`],
            pm !== pa ? [[String(pm), `That is p(${n_(-a)}). For ${xm(a)}, put x = ${n_(a)}.`]] : []);
        }),
        tp('findk', (r) => {
          const a = r.pick([-3, -2, -1, 1, 2, 3]);
          const k = r.int(-6, 6), c = r.pick([-9, -7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8]);
          const R = a * a + k * a + c;
          return typed(`When x² + kx ${c < 0 ? '−' : '+'} ${Math.abs(c)} is divided by ${xm(a)}, the remainder is ${R}. Find k.`, num(k),
            [`By the Remainder Theorem, p(${n_(a)}) = ${R}.`, `${a * a} + ${n_(a)}k ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${R}`],
            [`p(${n_(a)}) = ${a * a} + (${n_(a)})k ${c < 0 ? '−' : '+'} ${Math.abs(c)}`, `${a * a + c} + (${n_(a)})k = ${R}`, `(${n_(a)})k = ${R - a * a - c}`, `k = ${k}`]);
        }, 2),
        tp('linear', (r) => {
          const b = r.pick([1, 3, 5]), a = 2;
          const cs = [r.pick([4, 8, 12]), r.int(-6, 6), r.int(-5, 5)];
          // p(b/2) = cs0*b²/4 + cs1*b/2 + cs2 → over 4
          const n4 = cs[0] * b * b + 2 * cs[1] * b + 4 * cs[2];
          return typed(`Find the remainder when ${poly(cs)} is divided by ${a}x − ${b}.`, frac(n4, 4),
            [`${a}x − ${b} = 0 gives x = ${b}/${a}.`, `Work out p(${b}/${a}).`],
            [`p(${b}/2) = ${cs[0]} × ${b * b}/4 ${cs[1] < 0 ? '−' : '+'} ${Math.abs(cs[1])} × ${b}/2 ${cs[2] < 0 ? '−' : '+'} ${Math.abs(cs[2])}`, `= ${fx(n4, 4)}`]);
        }, 3),
        bank('facts', [
          { q: 'When p(x) is divided by x + 5, the remainder is:', a: 'p(−5)', w: ['p(5)', 'p(0)', '5'], h: ['x + 5 = 0 when x = ?'], s: ['x = −5, so the remainder is p(−5).'] },
          { q: 'Dividing a cubic polynomial by x − 1, the quotient has degree:', a: '2', w: ['3', '1', '0'], h: ['Degrees subtract when you divide.'], s: ['3 − 1 = 2'] },
          { q: 'Dividing p(x) by a linear polynomial, the remainder is always:', a: 'a constant', w: ['linear', 'quadratic', 'zero'], h: ['Its degree must be less than 1.'], s: ['The remainder has degree less than 1, so it is a constant.'] },
          { q: 'If p(2) = 0, then dividing p(x) by x − 2 leaves remainder:', a: '0', w: ['2', '−2', 'p(0)'], h: ['Remainder = p(2).'], s: ['Remainder = p(2) = 0.'] },
          { q: 'In 17 = 5 × 3 + 2, the number 3 is the:', a: 'quotient', w: ['remainder', 'divisor', 'dividend'], h: ['Dividend = divisor × quotient + remainder.'], s: ['17 is the dividend, 5 the divisor, 3 the quotient and 2 the remainder.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.poly.factor', title: 'Factor Theorem and factorising polynomials', prereqs: ['ts9.m.poly.remainder'],
      intro: [
        h('Breaking a polynomial into building blocks'),
        p('A rectangular plot in Nalgonda has area x² + 7x + 12 square metres. Can we find its length and breadth? If x² + 7x + 12 = (x + 3)(x + 4), the sides are x + 3 and x + 4. Finding such factors is called factorisation.'),
        def('Factor Theorem', 'x − a is a factor of p(x) exactly when p(a) = 0.'),
        p('It follows straight from the Remainder Theorem: p(a) = 0 means the remainder is 0, so x − a divides p(x) exactly.'),
        h('Splitting the middle term'),
        stepsB('For ax² + bx + c, find two numbers whose product is ac and whose sum is b.', 'Split bx into those two terms.', 'Group in pairs and take out common factors.'),
        p('Example: 2x² + 7x + 3. ac = 6, b = 7: 6 + 1 works. 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3) = (x + 3)(2x + 1).'),
        f('x − a is a factor of p(x) ⇔ p(a) = 0', 'x minus a is a factor of p of x exactly when p of a is zero'),
        X({
          title: 'What if? Test (x − a) as a factor of x² + kx + c', formula: 'p(a) = a² + k·a + c (factor when 0)',
          result: ['p', 'Value p(a)', 'a^2 + k * a + c'],
          vars: [['a', 'Trial value a', -6, 6, 1, 3], ['k', 'Coefficient of x', -10, 10, 1, -7], ['c', 'Constant term', -20, 20, 1, 12]],
          notes: [
            ['a', 'Try another value: when p(a) hits 0, you have found a factor.', 'Try smaller values, including negatives.'],
            ['c', 'Changing the constant changes which values make p zero.', 'Changing the constant changes which values make p zero.'],
          ],
          mistakes: [
            ['Testing a value that does not divide the constant', 'For x² + kx + c with whole-number factors, try only divisors of c (here ±1, ±2, ±3, ±4, ±6, ±12).'],
            ['Concluding x + 3 is a factor because p(3) = 0', 'p(3) = 0 means x − 3 is a factor.'],
          ],
          real: 'Factorising area expressions tells a builder the possible side lengths of a plot.',
        }),
        keys('p(a) = 0 ⇒ (x − a) is a factor.', 'Try divisors of the constant term as values of a.', 'Split the middle term: product ac, sum b.'),
        remember('Always check by multiplying the factors back.'),
        tip('For a cubic, find one factor by trial, divide it out, then factorise the quadratic that is left.'),
      ],
      examples: [
        ex('Is x + 2 a factor of x³ + 3x² + 5x + 6?', ['p(−2) = −8 + 12 − 10 + 6 = 0'], 'Yes'),
        ex('Factorise 6x² + 17x + 5.', ['ac = 30, b = 17 → 15 and 2', '6x² + 15x + 2x + 5 = 3x(2x + 5) + 1(2x + 5)'], '(3x + 1)(2x + 5)'),
        ex('Factorise x³ − 6x² + 11x − 6.', ['p(1) = 1 − 6 + 11 − 6 = 0, so (x − 1) is a factor.', 'Divide: x³ − 6x² + 11x − 6 = (x − 1)(x² − 5x + 6)', 'x² − 5x + 6 = (x − 2)(x − 3)'], '(x − 1)(x − 2)(x − 3)'),
      ],
      practice: [
        tp('isfactor', (r) => {
          const r1 = r.int(-4, 4), r2 = r.int(-4, 4), r3 = r.int(-3, 3);
          const cs = [1, -(r1 + r2 + r3), r1 * r2 + r2 * r3 + r1 * r3, -r1 * r2 * r3];
          const a = r.next() < 0.5 ? r1 : r.int(-4, 4);
          const v = a ** 3 + cs[1] * a * a + cs[2] * a + cs[3];
          return mcq(r, `Is ${xm(a)} a factor of p(x) = ${poly(cs)}?`, `${YN(v === 0)}, because p(${n_(a)}) = ${v}`, [`${YN(v !== 0)}, because p(${n_(a)}) = ${v}`, `${YN(v === 0)}, because p(${n_(-a)}) = ${v}`],
            [`Find p(${n_(a)}).`, 'It is a factor exactly when the value is 0.'],
            [`p(${n_(a)}) = ${v}`, v === 0 ? `So ${xm(a)} is a factor.` : `Not 0, so ${xm(a)} is not a factor.`]);
        }),
        tp('findk', (r) => {
          const a = r.pick([-3, -2, -1, 1, 2, 3, 4]), m = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
          const k = -(a + m), c = a * m;
          return typed(`If ${xm(a)} is a factor of x² + kx ${c < 0 ? '−' : '+'} ${Math.abs(c)}, find k.`, num(k),
            ['By the Factor Theorem, p(a) = 0.', `${a * a} + ${pn(a)}k ${c < 0 ? '−' : '+'} ${Math.abs(c)} = 0`],
            [`p(${n_(a)}) = ${a * a} + (${n_(a)})k ${c < 0 ? '−' : '+'} ${Math.abs(c)} = 0`, `(${n_(a)})k = ${n_(-(a * a + c))}`, `k = ${k}`]);
        }, 2),
        tp('monic', (r) => {
          let m = r.int(-7, 7), n = r.int(-7, 7);
          while (m === 0 || n === 0 || m === -n) { m = r.int(-7, 7); n = r.int(-7, 7); }
          const f1 = (v: number) => `(x ${v < 0 ? '−' : '+'} ${Math.abs(v)})`;
          return mcq(r, `Factorise x² ${m + n < 0 ? '−' : '+'} ${Math.abs(m + n) === 1 ? '' : Math.abs(m + n)}x ${m * n < 0 ? '−' : '+'} ${Math.abs(m * n)}.`, `${f1(m)}${f1(n)}`, [`${f1(-m)}${f1(-n)}`, `${f1(m)}${f1(-n)}`, `${f1(-m)}${f1(n)}`],
            [`Find two numbers with product ${m * n} and sum ${m + n}.`],
            [`${n_(m)} × ${n_(n)} = ${m * n} and ${n_(m)} + ${n_(n)} = ${m + n}`, `So the factors are ${f1(m)}${f1(n)}.`]);
        }),
        tp('split', (r) => {
          const a = r.pick([2, 3, 5]), p1 = r.pick([1, 3, 5, 7]), q1 = r.int(1, 6);
          // (a x + p1)(x + q1) = a x² + (a q1 + p1) x + p1 q1
          const b = a * q1 + p1, c = p1 * q1;
          return mcq(r, `Factorise ${a}x² + ${b}x + ${c} by splitting the middle term.`, `(${a}x + ${p1})(x + ${q1})`, [`(${a}x + ${q1})(x + ${p1})`, `(${a}x − ${p1})(x − ${q1})`, `(x + ${p1})(x + ${q1 * a})`],
            [`Product ac = ${a * c}, sum b = ${b}.`, `The numbers are ${a * q1} and ${p1}.`],
            [`${a}x² + ${a * q1}x + ${p1}x + ${c}`, `= ${a}x(x + ${q1}) + ${p1}(x + ${q1})`, `= (${a}x + ${p1})(x + ${q1})`]);
        }, 2),
        bank('facts', [
          { q: 'If p(−3) = 0, which is a factor of p(x)?', a: 'x + 3', w: ['x − 3', '3x', 'x − 1/3'], h: ['x − a with a = −3.'], s: ['x − (−3) = x + 3'] },
          { q: 'Which value should you try first to find a factor of x³ − 2x² − x + 2?', a: 'A divisor of 2, such as 1', w: ['7', '1/3', '10'], h: ['Integer zeroes divide the constant term.'], s: ['p(1) = 1 − 2 − 1 + 2 = 0, so x − 1 is a factor.'] },
          { q: 'For x² + 7x + 12, the two numbers used to split 7x are:', a: '3 and 4', w: ['2 and 6', '1 and 12', '5 and 2'], h: ['Product 12, sum 7.'], s: ['3 × 4 = 12, 3 + 4 = 7'] },
          { q: 'x − 1 is a factor of every polynomial whose coefficients:', a: 'add up to 0', w: ['are all positive', 'are all even', 'are in ascending order'], h: ['p(1) is the sum of the coefficients.'], s: ['p(1) = sum of coefficients; if it is 0, x − 1 is a factor.'] },
          { q: 'Factorise 12x² − 7x + 1.', a: '(3x − 1)(4x − 1)', w: ['(3x + 1)(4x + 1)', '(6x − 1)(2x − 1)', '(12x − 1)(x − 1)'], h: ['ac = 12, sum −7: −3 and −4.'], s: ['12x² − 4x − 3x + 1 = 4x(3x − 1) − 1(3x − 1) = (3x − 1)(4x − 1)'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.poly.identities', title: 'Algebraic identities', prereqs: ['ts9.m.poly.factor'],
      intro: [
        h('Patterns that are always true'),
        p('Can you work out 103² in your head? Think (100 + 3)² = 100² + 2 × 100 × 3 + 3² = 10000 + 600 + 9 = 10609. Identities are equations that are true for EVERY value of the variables, and they make such tricks possible.'),
        def('Identity', 'An equation true for all values of its variables, e.g. (x + 1)² = x² + 2x + 1.'),
        keys(
          '(x + y)² = x² + 2xy + y²',
          '(x − y)² = x² − 2xy + y²',
          'x² − y² = (x + y)(x − y)',
          '(x + a)(x + b) = x² + (a + b)x + ab',
          '(x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx',
          '(x + y)³ = x³ + y³ + 3xy(x + y);  (x − y)³ = x³ − y³ − 3xy(x − y)',
          'x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx)',
        ),
        p('Special case of the last identity: if x + y + z = 0, then x³ + y³ + z³ = 3xyz.'),
        f('(a + b)² = a² + 2ab + b²', 'a plus b, all squared, equals a squared plus two a b plus b squared'),
        X({
          title: 'What if? Grow a square of side a + b', formula: '(a + b)² = a² + 2ab + b²',
          result: ['S', 'Area of the big square', '(a + b)^2', 'sq units'],
          vars: [['a', 'Length a', 1, 20, 1, 10, 'units'], ['b', 'Length b', 0, 10, 1, 3, 'units']],
          notes: [
            ['a', 'The a² square and both a × b rectangles grow together.', 'The a² square and the two a × b rectangles shrink.'],
            ['b', 'The b² corner square and the two rectangles grow.', 'With b = 0 the square is just a².'],
          ],
          mistakes: [
            ['(a + b)² = a² + b²', 'This misses the two rectangles of area ab. For a = 10, b = 3: 169, not 109.'],
            ['(a − b)² = a² − b²', 'With a = 5, b = 3: (5 − 3)² = 4 but 25 − 9 = 16.'],
          ],
          real: 'Tilers use this: a square floor of side 3.1 m needs (3 + 0.1)² = 9 + 0.6 + 0.01 = 9.61 m² of tiles.',
        }),
        remember('An identity holds for every value; an equation like x + 2 = 5 holds only for some values.'),
        tip('To factorise, read the identity from right to left: 4x² − 9 = (2x)² − 3² = (2x + 3)(2x − 3).'),
      ],
      examples: [
        ex('Evaluate 97 × 103 without multiplying directly.', ['= (100 − 3)(100 + 3)', '= 100² − 3² = 10000 − 9'], '9991'),
        ex('Expand (3x + 2y)².', ['= (3x)² + 2(3x)(2y) + (2y)²'], '9x² + 12xy + 4y²'),
        ex('Find (−12)³ + 7³ + 5³ without cubing.', ['−12 + 7 + 5 = 0', 'So the sum = 3 × (−12) × 7 × 5'], '−1260'),
      ],
      practice: [
        tp('square', (r) => {
          const base = r.pick([10, 20, 50, 100]), d = r.int(1, 9) * (r.next() < 0.5 ? -1 : 1);
          const n = base + d;
          return typed(`Use an identity to find ${n}².`, num(n * n),
            [`Write ${n} = ${base} ${d < 0 ? '−' : '+'} ${Math.abs(d)}.`, `Use (a ${d < 0 ? '−' : '+'} b)² = a² ${d < 0 ? '−' : '+'} 2ab + b².`],
            [`${n}² = ${base}² ${d < 0 ? '−' : '+'} 2 × ${base} × ${Math.abs(d)} + ${d * d}`, `= ${base * base} ${d < 0 ? '−' : '+'} ${2 * base * Math.abs(d)} + ${d * d} = ${n * n}`],
            [[String(base * base + d * d), 'You forgot the middle term 2ab.']]);
        }),
        tp('diffsq', (r) => {
          const base = r.pick([10, 20, 30, 50, 100]), d = r.int(1, 9);
          return typed(`Evaluate ${base - d} × ${base + d} using an identity.`, num(base * base - d * d),
            ['(a − b)(a + b) = a² − b²', `a = ${base}, b = ${d}`],
            [`= ${base}² − ${d}² = ${base * base} − ${d * d} = ${base * base - d * d}`],
            [[String(base * base + d * d), 'b² is subtracted, not added.']]);
        }),
        tp('cubesum', (r) => {
          const s = r.int(2, 9), pr = r.int(1, 12);
          const v = s ** 3 - 3 * pr * s;
          return typed(`If x + y = ${s} and xy = ${pr}, find x³ + y³.`, num(v),
            ['(x + y)³ = x³ + y³ + 3xy(x + y)', 'So x³ + y³ = (x + y)³ − 3xy(x + y).'],
            [`x³ + y³ = ${s}³ − 3 × ${pr} × ${s}`, `= ${s ** 3} − ${3 * pr * s} = ${v}`],
            [[String(s ** 3), 'Subtract 3xy(x + y).']], { steps: [st(`First find (x + y)³.`, num(s ** 3)), st('Now subtract 3xy(x + y).', num(v))] });
        }, 2),
        tp('abc', (r) => {
          let a = r.int(-15, 15), b = r.int(-15, 15);
          while (a === 0 || b === 0 || a + b === 0) { a = r.int(-15, 15); b = r.int(-15, 15); }
          const c = -(a + b);
          return typed(`Without finding the cubes, evaluate ${pn(a)}³ + ${pn(b)}³ + ${pn(c)}³.`, num(3 * a * b * c),
            ['Add the three numbers first.', 'If x + y + z = 0 then x³ + y³ + z³ = 3xyz.'],
            [`${n_(a)} + ${n_(b)} + ${n_(c)} = 0`, `So the sum = 3 × ${pn(a)} × ${pn(b)} × ${pn(c)} = ${3 * a * b * c}`],
            [[String(a * b * c), 'Multiply by 3: the identity is 3xyz.']]);
        }, 2),
        matchT('match', 'Match each expression with its expanded or factorised form', [
          ['(x + 3)²', 'x² + 6x + 9'], ['(x − 3)²', 'x² − 6x + 9'], ['x² − 9', '(x + 3)(x − 3)'], ['(x + 2)(x + 3)', 'x² + 5x + 6'],
          ['(x + 1)³', 'x³ + 3x² + 3x + 1'], ['(x − 1)³', 'x³ − 3x² + 3x − 1'], ['4x² − 1', '(2x + 1)(2x − 1)'], ['(x + y + 1)²', 'x² + y² + 1 + 2xy + 2y + 2x'],
        ], ['Expand each one carefully, watching signs.', 'a² − b² factorises into (a + b)(a − b).']),
      ],
    },
  ],
};

// ================================================================== CH 3 THE ELEMENTS OF GEOMETRY
const ch3: USpec = {
  id: 'ts9.m.ch3', subject: 'math', title: 'The Elements of Geometry', source: src(3),
  objectives: [
    {
      id: 'ts9.m.euclid.history', title: 'A short history of geometry',
      intro: [
        h('Measuring the earth'),
        p('The word geometry comes from Greek: "geo" (earth) and "metron" (measure). Every year the Nile flooded and washed away field boundaries in Egypt, so surveyors had to measure the land again. Long before that, the people of the Harappan civilisation built cities like Mohenjo-daro and Lothal with straight streets meeting at right angles and bricks in the fixed ratio 4 : 2 : 1.'),
        p('In India, the Sulbasutras (about 800–500 BCE) gave rules with ropes for building fire altars of exact shapes and areas — including a statement of the rule we now call the Pythagoras theorem. Later, Aryabhata (476 CE) gave a very accurate value of π, and Brahmagupta and Bhaskara II worked on areas of quadrilaterals and triangles.'),
        p('In Greece, Thales (about 600 BCE) is said to have given one of the first proofs. Pythagoras and his followers studied numbers and shapes. Around 300 BCE, Euclid of Alexandria collected the geometry known in his time into 13 books called the Elements, building every result step by step from a few simple starting assumptions.'),
        def('Euclid\'s Elements', 'A collection of 13 books (about 300 BCE) that organised geometry as a chain of definitions, axioms, postulates and proved theorems.'),
        keys('Egyptians and Harappans used practical geometry for land, buildings and bricks.', 'The Sulbasutras gave rope rules for altars.', 'Greek mathematicians began proving results by logic.', 'Euclid organised geometry into a deductive system.'),
        remember('Euclid did not invent all of geometry; his great work was to ORGANISE it so each result follows from earlier ones.'),
        tip('A Telangana link: the stepwells and temples of the Kakatiya period, like the Ramappa temple, show careful use of symmetry and right angles.'),
      ],
      examples: [
        ex('Why was geometry needed in ancient Egypt?', ['The Nile flooded every year.', 'Field boundaries were washed away and had to be measured again.'], 'To re-measure land after floods'),
        ex('What ratio did Harappan bricks follow?', ['Length : breadth : thickness was fixed for easy stacking.'], '4 : 2 : 1'),
      ],
      practice: [
        orderT('timeline', 'Put these in order from EARLIEST to LATEST.', ['Harappan cities with planned streets (about 2500 BCE)', 'Thales gives early proofs (about 600 BCE)', 'Euclid writes the Elements (about 300 BCE)', 'Aryabhata gives a value of π (about 500 CE)', 'Bhaskara II writes Lilavati (about 1150 CE)'], ['BCE dates count down towards year 1; CE dates count up.'], 1),
        matchT('people', 'Match each person or text with the contribution', [
          ['Euclid', 'Wrote the Elements in 13 books'], ['Sulbasutras', 'Rope rules for building altars'], ['Aryabhata', 'Value of π correct to four decimal places'],
          ['Thales', 'One of the first geometric proofs'], ['Bhaskara II', 'Wrote Lilavati'], ['Brahmagupta', 'Formula for the area of a cyclic quadrilateral'],
        ], ['Euclid → organising; Sulbasutras → altars; Aryabhata → π.'], 3),
        bank('facts', [
          { q: 'The word "geometry" means:', a: 'earth measurement', w: ['study of stars', 'number counting', 'drawing pictures'], h: ['geo = earth, metron = measure.'], s: ['geo + metron = earth measurement.'] },
          { q: 'How many books are there in Euclid\'s Elements?', a: '13', w: ['5', '7', '23'], h: ['It is a little more than a dozen.'], s: ['The Elements has 13 books.'] },
          { q: 'Where did Euclid teach?', a: 'Alexandria, Egypt', w: ['Athens, Greece', 'Ujjain, India', 'Rome, Italy'], h: ['A great library city in Egypt.'], s: ['Euclid worked in Alexandria.'] },
          { q: 'The Sulbasutras were written to help build:', a: 'fire altars of exact shapes and sizes', w: ['ships', 'roads', 'clocks'], h: ['Sulba means rope; they are religious manuals.'], s: ['They give rope constructions for altars (vedis).'] },
          { q: 'The main idea of Euclid\'s method is:', a: 'prove results logically from a few accepted assumptions', w: ['measure every figure carefully', 'learn shapes by heart', 'use only drawings'], h: ['Think of axioms and theorems.'], s: ['Euclid started with definitions, axioms and postulates and deduced everything else.'] },
          { q: 'Planned cities with streets at right angles existed in the Indus valley about:', a: '2500 BCE', w: ['300 BCE', '500 CE', '1500 CE'], h: ['Long before Euclid.'], s: ['The Harappan civilisation flourished around 2500 BCE.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.euclid.defs', title: 'Euclid\'s definitions: point, line and surface', prereqs: ['ts9.m.euclid.history'],
      intro: [
        h('Starting from the simplest ideas'),
        p('Look at a map of Hyderabad. A city is shown as a dot, a road as a thin line, and a lake as a flat region. Euclid tried to describe these ideas in words. Some of his 23 definitions are:'),
        keys('A point is that which has no part.', 'A line is breadthless length.', 'The ends of a line are points.', 'A straight line lies evenly with the points on itself.', 'A surface has length and breadth only.', 'The edges of a surface are lines.', 'A plane surface lies evenly with the straight lines on itself.'),
        p('Notice the problem: "part", "breadth" and "length" themselves need definitions, which would need more definitions, and so on for ever. So today we take point, line and plane as UNDEFINED terms. We understand them from examples and from the rules (axioms) they follow.'),
        def('Undefined terms', 'Point, line and plane — basic ideas we do not define but describe by their properties.'),
        def('Line segment', 'The part of a line between two end points A and B, written AB.'),
        def('Ray', 'A part of a line that starts at one point and goes on for ever in one direction.'),
        remember('A solid has 3 dimensions, a surface 2, a line 1 and a point none.'),
        tip('A brick shows all of them: the brick is a solid, each face is a surface, each edge is a line segment and each corner is a point.'),
      ],
      examples: [
        ex('Name the surfaces, edges and corners of a cuboid-shaped brick.', ['It has 6 rectangular faces (surfaces).', 'Faces meet in 12 edges (lines).', 'Edges meet in 8 corners (points).'], '6 faces, 12 edges, 8 vertices'),
        ex('Why are point, line and plane left undefined?', ['Any definition uses other words.', 'Those words also need defining, without end.', 'So we must start somewhere.'], 'To avoid an endless chain of definitions'),
      ],
      practice: [
        matchT('match', 'Match each object with what it best models in geometry', [
          ['a dot made by a sharp pencil', 'point'], ['a tightly stretched thread', 'line segment'], ['the top of a table', 'plane surface'],
          ['a torch beam starting at the torch', 'ray'], ['a cricket ball', 'solid'], ['the corner of a room', 'point where three surfaces meet'],
        ], ['Think about how many dimensions each has.']),
        tapT('undefined', 'Tap the terms that are taken as UNDEFINED in geometry today.', ['point', 'line', 'plane'], ['triangle', 'circle', 'line segment', 'angle', 'square', 'ray'],
          ['These are the most basic ideas; others are defined using them.'], 'Triangles, circles, segments, angles and rays are all defined using points, lines and planes.', 3, 3),
        bank('defs', [
          { q: 'According to Euclid, "that which has no part" is a:', a: 'point', w: ['line', 'surface', 'solid'], h: ['It has no length, breadth or thickness.'], s: ['Euclid\'s first definition: a point is that which has no part.'] },
          { q: '"Breadthless length" is Euclid\'s description of a:', a: 'line', w: ['point', 'surface', 'plane'], h: ['It has length only.'], s: ['A line has length but no breadth.'] },
          { q: 'The edges of a surface are:', a: 'lines', w: ['points', 'solids', 'planes'], h: ['Look at the edge of a sheet of paper.'], s: ['Euclid: the edges of a surface are lines.'] },
          { q: 'How many dimensions does a surface have?', a: '2', w: ['0', '1', '3'], h: ['Length and breadth only.'], s: ['A surface has length and breadth: 2 dimensions.'] },
          { q: 'How many edges does a cube have?', a: '12', w: ['6', '8', '24'], h: ['4 on top, 4 at the bottom, 4 upright.'], s: ['4 + 4 + 4 = 12 edges.'] },
          { q: 'A line segment AB has:', a: 'two end points', w: ['no end points', 'one end point', 'infinitely many end points'], h: ['It stops at A and at B.'], s: ['A segment is the part of a line between its two end points.'] },
        ]),
        tp('solid', (r) => {
          const S: [string, number, number, number][] = [['cube', 6, 12, 8], ['cuboid', 6, 12, 8], ['triangular prism', 5, 9, 6], ['square pyramid', 5, 8, 5], ['tetrahedron (triangular pyramid)', 4, 6, 4], ['pentagonal prism', 7, 15, 10]];
          const [nm2, F, E, V] = r.pick(S);
          const what = r.int(0, 2);
          const ans = [F, E, V][what];
          const word = ['faces (surfaces)', 'edges (lines)', 'vertices (points)'][what];
          return typed(`How many ${word} does a ${nm2} have?`, num(ans),
            ['Picture the solid or a model of it.', 'Euler\'s rule F + V − E = 2 helps you check.'],
            [`A ${nm2} has ${F} faces, ${E} edges and ${V} vertices.`, `Check: ${F} + ${V} − ${E} = 2 ✓`]);
        }),
      ],
    },
    {
      id: 'ts9.m.euclid.axioms', title: 'Euclid\'s axioms and postulates', prereqs: ['ts9.m.euclid.defs'],
      intro: [
        h('Rules everyone agrees on'),
        p('If Kavya and Arjun are both as tall as Teja, then Kavya and Arjun are equally tall. Nobody needs to prove this — it is obvious. Euclid called such common-sense truths axioms (common notions), used in all of mathematics. Truths that are special to geometry he called postulates.'),
        h('Some of Euclid\'s axioms'),
        keys('1. Things equal to the same thing are equal to one another.', '2. If equals are added to equals, the wholes are equal.', '3. If equals are subtracted from equals, the remainders are equal.', '4. Things which coincide with one another are equal.', '5. The whole is greater than the part.', '6. Things which are double of the same things are equal.', '7. Things which are halves of the same things are equal.'),
        h('Euclid\'s five postulates'),
        keys('1. A straight line may be drawn from any point to any other point.', '2. A terminated line (segment) can be produced indefinitely.', '3. A circle can be drawn with any centre and any radius.', '4. All right angles are equal to one another.', '5. If a straight line falling on two straight lines makes the interior angles on the same side together less than two right angles, the two lines, if produced, meet on that side.'),
        p('Postulate 5 is the famous parallel postulate. An equivalent version (Playfair\'s axiom): through a point not on a line, exactly one line can be drawn parallel to it.'),
        def('Theorem', 'A statement proved using definitions, axioms, postulates and earlier theorems.'),
        p('Using Axiom 5 and Axiom 4: if B lies on segment AC, then AB + BC coincides with AC, so they are equal, and AC is greater than each part.'),
        f('AC = AB + BC  (B between A and C)', 'A C equals A B plus B C'),
        X({
          title: 'What if? Slide the point B along AC', formula: 'AC = AB + BC',
          result: ['AC', 'Whole segment', 'AB + BC', 'cm'],
          vars: [['AB', 'Part AB', 0.5, 10, 0.5, 4, 'cm'], ['BC', 'Part BC', 0.5, 10, 0.5, 3, 'cm']],
          notes: [
            ['AB', 'Making one part longer makes the whole longer by the same amount (axiom 2).', 'Shortening a part shortens the whole by the same amount (axiom 3).'],
            ['BC', 'The whole is always greater than either part (axiom 5).', 'The whole stays greater than the remaining part.'],
          ],
          mistakes: [
            ['Using AC = AB + BC when B is not between A and C', 'If B is outside the segment, the parts overlap or leave a gap and the sum is wrong.'],
            ['Calling a postulate a theorem', 'Postulates are accepted without proof; theorems are proved.'],
          ],
          real: 'If Hyderabad to Jangaon is 85 km and Jangaon to Warangal is 63 km on one straight highway, Hyderabad to Warangal along it is 148 km.',
        }),
        remember('Two distinct lines cannot have more than one point in common — this is proved from the postulate that only one line passes through two points.'),
        tip('Name the axiom you are using at each step of a proof: "by Axiom 1 (things equal to the same thing …)".'),
      ],
      examples: [
        ex('AC = BD (A, B, C, D on a line in that order). Prove AB = CD.', ['AC = AB + BC and BD = BC + CD', 'So AB + BC = BC + CD', 'Subtract BC from both sides (Axiom 3)'], 'AB = CD'),
        ex('How many lines pass through two distinct points P and Q?', ['Euclid: a line can be drawn from any point to any other point, and it is unique.'], 'Exactly one'),
      ],
      practice: [
        tp('segment', (r) => {
          const ab = r.int(2, 15), bc = r.int(2, 15);
          const whole = r.next() < 0.5;
          return whole
            ? typed(`B lies between A and C on a straight line. AB = ${ab} cm and BC = ${bc} cm. Find AC.`, num(ab + bc, 'cm'), ['The whole equals the sum of its parts.'], [`AC = AB + BC = ${ab} + ${bc} = ${ab + bc} cm`], [[String(Math.abs(ab - bc)), 'B is BETWEEN A and C, so add the two parts.']])
            : typed(`B lies between A and C on a straight line. AC = ${ab + bc} cm and AB = ${ab} cm. Find BC.`, num(bc, 'cm'), ['AC = AB + BC.', 'Subtract the known part (Axiom 3).'], [`BC = AC − AB = ${ab + bc} − ${ab} = ${bc} cm`], [[String(2 * ab + bc), 'Subtract the known part from the whole.']]);
        }),
        tp('equals', (r) => {
          const a = nm(r); let b = nm(r); while (b === a) b = nm(r); let c = nm(r); while (c === a || c === b) c = nm(r);
          const m = r.int(40, 95), add = r.int(3, 12);
          return typed(`${a} and ${b} scored the same marks in a test. ${b} and ${c} also scored the same, and ${c} scored ${m}. Each of them then got ${add} bonus marks. What is ${a}'s new score?`, num(m + add),
            ['Axiom 1: things equal to the same thing are equal.', 'Axiom 2: equals added to equals give equals.'],
            [`${a} = ${b} = ${c} = ${m} (Axiom 1)`, `${a}'s new score = ${m} + ${add} = ${m + add} (Axiom 2)`]);
        }),
        tp('midhalf', (r) => {
          const L = 2 * r.int(3, 20);
          return typed(`C is the mid-point of AB and AB = ${L} cm. Find AC.`, num(L / 2, 'cm'),
            ['A mid-point splits the segment into two equal parts.', 'AC + CB = AB and AC = CB.'],
            ['AC + CB = AB and AC = CB', `So 2 AC = ${L}`, `AC = ${L / 2} cm (Axiom 7: halves of the same thing are equal)`],
            [[String(L), 'AC is only half of AB.']]);
        }),
        bank('which', [
          { q: '"Things equal to the same thing are equal to one another" is one of Euclid\'s:', a: 'axioms', w: ['postulates', 'definitions', 'theorems'], h: ['It is a common notion used in all of mathematics.'], s: ['It is Axiom 1.'] },
          { q: '"A circle can be drawn with any centre and any radius" is Euclid\'s:', a: 'postulate 3', w: ['axiom 3', 'postulate 5', 'definition 1'], h: ['It is special to geometry.'], s: ['It is Postulate 3.'] },
          { q: 'Playfair\'s axiom is equivalent to Euclid\'s:', a: 'fifth postulate', w: ['first postulate', 'first axiom', 'fourth postulate'], h: ['It is about parallel lines.'], s: ['Playfair\'s axiom is a restatement of the parallel postulate.'] },
          { q: 'Through a point not on a given line, how many lines can be drawn parallel to it?', a: 'Exactly one', w: ['None', 'Two', 'Infinitely many'], h: ['Playfair\'s axiom.'], s: ['Exactly one parallel line can be drawn.'] },
          { q: '"The whole is greater than the part" tells us that, for B between A and C:', a: 'AC > AB', w: ['AC < AB', 'AC = AB', 'AB > BC'], h: ['AC is the whole, AB a part.'], s: ['The whole segment AC is greater than its part AB.'] },
          { q: 'Two distinct lines can have at most how many points in common?', a: '1', w: ['0', '2', 'infinitely many'], h: ['If they shared two points, they would be the same line.'], s: ['Only one line passes through two points, so distinct lines share at most one point.'] },
          { q: 'A statement that is PROVED using axioms and postulates is a:', a: 'theorem', w: ['postulate', 'definition', 'axiom'], h: ['Axioms and postulates are assumed.'], s: ['Proved statements are theorems.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 4 LINES AND ANGLES
const ch4: USpec = {
  id: 'ts9.m.ch4', subject: 'math', title: 'Lines and Angles', source: src(4),
  objectives: [
    {
      id: 'ts9.m.lines.terms', title: 'Basic terms: segments, rays, collinear points and kinds of angles',
      intro: [
        h('Angles all around us'),
        p('The hands of the clock on the Sultan Bazaar clock tower, the spokes of a bicycle wheel, the roof of a hut — they all make angles. Before proving things about them, we need clear names.'),
        def('Collinear points', 'Three or more points that lie on the same line. Points not on one line are non-collinear.'),
        def('Angle', 'The figure formed by two rays with a common end point, called the vertex. The rays are the arms.'),
        keys('Acute angle: between 0° and 90°.', 'Right angle: exactly 90°.', 'Obtuse angle: between 90° and 180°.', 'Straight angle: exactly 180°.', 'Reflex angle: between 180° and 360°.', 'Complete angle: 360°.'),
        f('reflex angle = 360° − x', 'the reflex angle equals 360 degrees minus x'),
        X({
          title: 'What if? Open the arms of an angle', formula: 'reflex = 360° − x',
          result: ['R', 'Reflex angle on the other side', '360 - x', '°'],
          vars: [['x', 'Angle between the arms', 1, 179, 1, 50, '°']],
          notes: [['x', 'As the arms open wider, the reflex angle on the outside shrinks by the same amount.', 'As the arms close, the reflex angle grows.']],
          mistakes: [
            ['Reflex = 180° − x', '180° − x is the supplement. The two angles at a point add to 360°, not 180°.'],
            ['Calling 180° obtuse', 'An obtuse angle is less than 180°. Exactly 180° is a straight angle.'],
          ],
          real: 'At 4 o\'clock the hands of a clock make 120°; the other side of the dial is a reflex angle of 240°.',
        }),
        remember('Each hour mark on a clock face is 360° ÷ 12 = 30° from the next.'),
        tip('Measure angles with the protractor scale that starts from 0 on one arm.'),
      ],
      examples: [
        ex('Name the type of an angle of 205°.', ['It is more than 180° and less than 360°.'], 'Reflex angle'),
        ex('What angle do the hands of a clock make at 3 o\'clock?', ['3 hour-gaps × 30°'], '90°, a right angle'),
      ],
      practice: [
        tp('kind', (r) => {
          const x = r.pick([r.int(5, 89), 90, r.int(91, 179), 180, r.int(181, 359)]);
          const k = x < 90 ? 'Acute' : x === 90 ? 'Right' : x < 180 ? 'Obtuse' : x === 180 ? 'Straight' : 'Reflex';
          return mcq(r, `What kind of angle measures ${x}°?`, k, ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'].filter((y) => y !== k),
            ['Compare with 90°, 180° and 360°.'], [`${x}° is ${k.toLowerCase()}.`]);
        }),
        tp('reflex', (r) => {
          const x = r.int(10, 170);
          return typed(`An angle measures ${x}°. What is the reflex angle on the other side of its arms?`, num(360 - x, '°'),
            ['The two angles round the vertex add up to 360°.'], [`Reflex angle = 360° − ${x}° = ${360 - x}°`], [[String(180 - x), 'That is the supplement. Around a point the angles make 360°.']]);
        }),
        tp('clock', (r) => {
          const hr = r.int(1, 11);
          const ang = Math.min(hr * 30, 360 - hr * 30);
          return typed(`What is the smaller angle between the hands of a clock at exactly ${hr} o'clock?`, num(ang, '°'),
            ['The 12 hour-marks split 360° into 30° steps.', 'Count the gaps between the hands the short way round.'],
            [`${Math.min(hr, 12 - hr)} gaps × 30° = ${ang}°`]);
        }),
        bank('terms', [
          { q: 'Points that lie on the same line are called:', a: 'collinear', w: ['concurrent', 'parallel', 'congruent'], h: ['co-linear.'], s: ['Points on one line are collinear.'] },
          { q: 'A ray has:', a: 'one end point', w: ['two end points', 'no end points', 'a fixed length'], h: ['It starts at a point and goes on for ever.'], s: ['A ray has one end point.'] },
          { q: 'The common end point of the two arms of an angle is its:', a: 'vertex', w: ['centre', 'origin', 'arm'], h: ['The corner.'], s: ['It is the vertex.'] },
          { q: 'How many lines can pass through one given point?', a: 'Infinitely many', w: ['Only one', 'Two', 'None'], h: ['Turn a ruler around a pencil dot.'], s: ['Infinitely many lines pass through a point.'] },
          { q: 'An angle of exactly 360° is a:', a: 'complete angle', w: ['straight angle', 'reflex angle', 'right angle'], h: ['One full turn.'], s: ['A full turn is a complete angle.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lines.pairs', title: 'Pairs of angles', prereqs: ['ts9.m.lines.terms'],
      intro: [
        h('Angles that come in pairs'),
        p('When two roads cross at a junction in Karimnagar, four angles form at the crossing. Opposite angles look equal, and angles side by side seem to add to a straight line. Let\'s name these pairs and see why.'),
        def('Complementary angles', 'Two angles whose sum is 90°.'),
        def('Supplementary angles', 'Two angles whose sum is 180°.'),
        def('Adjacent angles', 'Two angles with a common vertex and a common arm, lying on opposite sides of that arm.'),
        def('Linear pair', 'Adjacent angles whose other arms form a straight line. They add to 180° (Linear Pair Axiom).'),
        def('Vertically opposite angles', 'The pairs of opposite angles formed when two lines cross. They are equal.'),
        p('Why are vertically opposite angles equal? If lines cross making angles a, b, c (a and c opposite), then a + b = 180° and b + c = 180° (linear pairs). So a + b = b + c, and a = c.'),
        f('supplement of x = 180° − x;  complement of x = 90° − x', 'the supplement of x is 180 minus x and the complement is 90 minus x'),
        X({
          title: 'What if? Turn one road at a crossing', formula: 'y = 180° − x (linear pair)',
          result: ['y', 'Adjacent angle', '180 - x', '°'],
          vars: [['x', 'One angle at the crossing', 1, 179, 1, 70, '°']],
          notes: [['x', 'As one angle opens, its neighbour on the straight line closes by the same amount. The opposite angle grows with it.', 'As one angle closes, its neighbour opens by the same amount.']],
          mistakes: [
            ['Mixing up complement and supplement', 'Complement → 90° (C comes before S, 90 before 180). Supplement → 180°.'],
            ['Thinking every pair of adjacent angles is a linear pair', 'Only when the outer arms make a straight line do they add to 180°.'],
          ],
          real: 'When scissors open, the angle between the blades and the angle between the handles are vertically opposite — always equal.',
        }),
        keys('Linear pair: sum 180°.', 'Vertically opposite angles are equal.', 'Angles round a point add to 360°.'),
        remember('If the sum of two adjacent angles is 180°, their outer arms form a straight line (converse of the linear pair axiom).'),
        tip('In word problems, write the equation first: "angle + supplement = 180°".'),
      ],
      examples: [
        ex('Two angles of a linear pair are in the ratio 2 : 3. Find them.', ['2k + 3k = 180°', 'k = 36°'], '72° and 108°'),
        ex('Two lines cross and one angle is 40°. Find the other three.', ['Adjacent: 180° − 40° = 140°', 'Opposite angles are equal.'], '140°, 40°, 140°'),
      ],
      practice: [
        tp('compsupp', (r) => {
          const sup = r.next() < 0.5;
          const x = sup ? r.int(10, 170) : r.int(5, 85);
          const ans = (sup ? 180 : 90) - x;
          return typed(`Find the ${sup ? 'supplement' : 'complement'} of ${x}°.`, num(ans, '°'),
            [sup ? 'Supplementary angles add to 180°.' : 'Complementary angles add to 90°.'],
            [`${sup ? 180 : 90}° − ${x}° = ${ans}°`],
            [[String((sup ? 90 : 180) - x), sup ? 'That is the complement (90°). Supplement means 180°.' : 'That is the supplement (180°). Complement means 90°.']]);
        }),
        tp('ratio', (r) => {
          const sup = r.next() < 0.6;
          const T = sup ? 180 : 90;
          const pairs = sup ? [[1, 2], [2, 3], [1, 5], [4, 5], [7, 11], [1, 3], [5, 7]] : [[1, 2], [2, 3], [1, 5], [4, 5], [7, 11], [1, 4], [2, 7]];
          const [a, b] = r.pick(pairs);
          const k = T / (a + b);
          return typed(`Two ${sup ? 'supplementary' : 'complementary'} angles are in the ratio ${a} : ${b}. Find the LARGER angle.`, num(b * k, '°'),
            [`Let the angles be ${a}k and ${b}k.`, `${a}k + ${b}k = ${T}°`],
            [`${a + b}k = ${T}°, so k = ${k}°`, `Larger angle = ${b} × ${k}° = ${b * k}°`],
            [[String(a * k), 'That is the smaller angle.']]);
        }, 2),
        tp('cross', (r) => {
          const x = r.int(20, 160);
          const which = r.int(0, 1);
          return typed(`Two straight lines AB and CD cross at O. ∠AOC = ${x}°. Find ${which ? '∠BOD' : '∠AOD'}.`, num(which ? x : 180 - x, '°'),
            ['∠AOC and ∠BOD are vertically opposite.', '∠AOC and ∠AOD form a linear pair.'],
            [which ? `∠BOD = ∠AOC = ${x}° (vertically opposite)` : `∠AOD = 180° − ${x}° = ${180 - x}° (linear pair)`],
            [[String(which ? 180 - x : x), which ? 'Vertically opposite angles are equal.' : 'Adjacent angles on a line add to 180°.']]);
        }),
        tp('algebra', (r) => {
          const a = r.int(1, 3), b = r.int(1, 3), xv = r.int(10, Math.floor(170 / (a + b)));
          const c = 180 - (a + b) * xv;
          return typed(`The angles (${a === 1 ? '' : a}x + ${c})° and ${b === 1 ? '' : b}x° form a linear pair. Find x.`, num(xv),
            ['A linear pair adds up to 180°.', `${a + b}x + ${c} = 180`],
            [`${a}x + ${c} + ${b}x = 180`, `${a + b}x = ${180 - c}`, `x = ${xv}`]);
        }, 2),
        bank('facts', [
          { q: 'Can two acute angles be supplementary?', a: 'No, their sum is less than 180°', w: ['Yes, always', 'Yes, if they are equal', 'Only if both are 89°'], h: ['Each is less than 90°.'], s: ['Two angles less than 90° add to less than 180°.'] },
          { q: 'The two angles of a linear pair are equal. Each is:', a: '90°', w: ['45°', '180°', '60°'], h: ['x + x = 180°.'], s: ['2x = 180°, x = 90°.'] },
          { q: 'Vertically opposite angles are:', a: 'always equal', w: ['always supplementary', 'always complementary', 'always 90°'], h: ['Both share a linear pair with the same angle.'], s: ['They are equal.'] },
          { q: 'The angles round a point add to:', a: '360°', w: ['180°', '90°', '270°'], h: ['One full turn.'], s: ['A complete turn is 360°.'] },
          { q: 'An angle equal to its complement measures:', a: '45°', w: ['90°', '30°', '60°'], h: ['x + x = 90°.'], s: ['2x = 90°, x = 45°.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lines.parallel', title: 'Parallel lines and a transversal', prereqs: ['ts9.m.lines.pairs'],
      intro: [
        h('Railway tracks and a crossing road'),
        p('Two railway lines near Kazipet run parallel. A road crossing them is a transversal. It makes eight angles — four at each track. When the lines are parallel, these angles are linked in neat ways.'),
        def('Transversal', 'A line that cuts two or more lines at distinct points.'),
        keys('Corresponding angles (same position at each crossing) are EQUAL.', 'Alternate interior angles (inside, opposite sides of the transversal) are EQUAL.', 'Alternate exterior angles are EQUAL.', 'Interior angles on the same side (co-interior) add to 180°.'),
        p('The converses are also true: if a pair of corresponding (or alternate) angles are equal, or a pair of co-interior angles add to 180°, then the lines ARE parallel. Lines parallel to the same line are parallel to each other.'),
        f('co-interior: x + y = 180°', 'co interior angles add to 180 degrees'),
        X({
          title: 'What if? Tilt the transversal', formula: 'y = 180° − x (co-interior), corresponding angle = x',
          result: ['y', 'Co-interior angle', '180 - x', '°'],
          vars: [['x', 'Angle at the first line', 10, 170, 1, 65, '°']],
          notes: [['x', 'As the transversal tilts and x grows, the co-interior angle at the other line shrinks by the same amount; the corresponding angle grows with x.', 'As x shrinks, the co-interior angle grows.']],
          mistakes: [
            ['Saying co-interior angles are equal', 'They are equal only when both are 90°. In general they ADD to 180°.'],
            ['Using these rules when the lines are not parallel', 'The equalities hold only for parallel lines.'],
          ],
          real: 'Carpenters check that two shelves are parallel by measuring the corresponding angles they make with an upright.',
        }),
        remember('Equal angles: corresponding, alternate. Adding to 180°: co-interior.'),
        tip('Draw a "Z" for alternate angles, an "F" for corresponding, and a "C" (or "U") for co-interior.'),
      ],
      examples: [
        ex('A transversal cuts parallel lines. One interior angle is 115°. Find the co-interior angle and the alternate angle.', ['Co-interior: 180° − 115° = 65°', 'Alternate interior angle = 115°'], '65° and 115°'),
        ex('A transversal makes co-interior angles 70° and 110° with two lines. Are the lines parallel?', ['70° + 110° = 180°', 'Converse of the co-interior property'], 'Yes'),
      ],
      practice: [
        tp('find', (r) => {
          const x = r.int(25, 155);
          const kinds: [string, number][] = [['corresponding angle', x], ['alternate interior angle', x], ['co-interior angle (interior, same side)', 180 - x], ['vertically opposite angle', x]];
          const [k, v] = r.pick(kinds);
          return typed(`Two parallel lines are cut by a transversal. One interior angle is ${x}°. Find its ${k}.`, num(v, '°'),
            ['Corresponding, alternate and vertically opposite angles are equal.', 'Co-interior angles add to 180°.'],
            [`${k}: ${v === x ? `equal, so ${x}°` : `180° − ${x}° = ${v}°`}`],
            [[String(v === x ? 180 - x : x), v === x ? 'This pair is EQUAL, not supplementary.' : 'Co-interior angles add to 180°.']]);
        }),
        tp('isparallel', (r) => {
          const a = r.int(40, 140);
          const ok = r.next() < 0.5;
          const b = ok ? 180 - a : 180 - a + r.pick([-10, -5, 5, 10]);
          return mcq(r, `A transversal makes interior angles ${a}° and ${b}° on the same side of it with lines l and m. Are l and m parallel?`, ok ? 'Yes, they add to 180°' : `No, they add to ${a + b}°`, [ok ? `No, they add to ${a + b + 10}°` : 'Yes, they add to 180°', 'Yes, because both are interior angles'],
            ['Co-interior angles of parallel lines add to 180°.'], [`${a}° + ${b}° = ${a + b}°`, ok ? 'So l ∥ m.' : 'Not 180°, so l and m are not parallel.']);
        }),
        tp('algebra', (r) => {
          const xv = r.int(15, 40), k = r.int(2, 3), c = r.int(1, (k - 1) * xv - 1);
          const corr = r.next() < 0.5;
          if (corr) {
            // corresponding: k x − c = x + d → d = (k−1)x − c
            const d = (k - 1) * xv - c;
            return typed(`Lines l ∥ m. A pair of corresponding angles are (${k}x − ${c})° and (x + ${d})°. Find x.`, num(xv),
              ['Corresponding angles are equal.', `${k}x − ${c} = x + ${d}`], [`${k - 1}x = ${d + c}`, `x = ${xv}`]);
          }
          const d = 180 - k * xv - xv;
          return typed(`Lines l ∥ m. A pair of co-interior angles are ${k}x° and (x + ${d})°. Find x.`, num(xv),
            ['Co-interior angles add to 180°.', `${k}x + x + ${d} = 180`], [`${k + 1}x = ${180 - d}`, `x = ${xv}`]);
        }, 2),
        bank('facts', [
          { q: 'If two lines are parallel to the same line, they are:', a: 'parallel to each other', w: ['perpendicular to each other', 'intersecting', 'the same line always'], h: ['Think of three rails.'], s: ['Lines parallel to the same line are parallel to each other.'] },
          { q: 'Alternate interior angles of parallel lines are:', a: 'equal', w: ['supplementary', 'complementary', 'always acute'], h: ['Look for the Z shape.'], s: ['They are equal.'] },
          { q: 'If a transversal is perpendicular to one of two parallel lines, then it is:', a: 'perpendicular to the other too', w: ['parallel to the other', 'at 45° to the other', 'not touching the other'], h: ['Corresponding angles are equal: 90° = ?'], s: ['The corresponding angle is also 90°.'] },
          { q: 'How many angles are formed when a transversal cuts two lines?', a: '8', w: ['4', '6', '12'], h: ['4 at each crossing.'], s: ['4 + 4 = 8'] },
          { q: 'The bisectors of a pair of co-interior angles meet at an angle of:', a: '90°', w: ['180°', '45°', '60°'], h: ['Half of 180°.'], s: ['(x + y)/2 = 90°, so the third angle of the triangle they form is 90°.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lines.trisum', title: 'Angle sum property of a triangle', prereqs: ['ts9.m.lines.parallel'],
      intro: [
        h('Why do a triangle\'s angles always make 180°?'),
        p('Tear the three corners off a paper triangle and put them side by side — they always form a straight line. Here is the reason using parallel lines.'),
        stepsB('Take triangle PQR. Through P draw a line XY parallel to QR.', '∠XPQ = ∠Q and ∠YPR = ∠R (alternate interior angles).', 'Angles on the straight line XY at P: ∠XPQ + ∠QPR + ∠YPR = 180°.', 'So ∠Q + ∠P + ∠R = 180°.'),
        def('Exterior angle', 'The angle formed between one side of a triangle and the extension of an adjacent side.'),
        p('An exterior angle and its adjacent interior angle make a linear pair, so the exterior angle equals the SUM of the two interior opposite angles.'),
        f('∠A + ∠B + ∠C = 180°;  exterior angle = sum of interior opposite angles', 'A plus B plus C equals 180'),
        X({
          title: 'What if? Change two angles of a triangle', formula: '∠C = 180° − ∠A − ∠B',
          result: ['C', 'Third angle', '180 - A - B', '°'],
          vars: [['A', 'Angle A', 10, 100, 1, 60, '°'], ['B', 'Angle B', 10, 70, 1, 50, '°']],
          notes: [
            ['A', 'If A grows, C must shrink by the same amount to keep the total 180°.', 'If A shrinks, C grows.'],
            ['B', 'If B grows, C shrinks. The exterior angle at C (= A + B) grows.', 'If B shrinks, C grows.'],
          ],
          mistakes: [
            ['Exterior angle = 180° − (sum of opposite angles)', 'The exterior angle EQUALS the sum of the two interior opposite angles.'],
            ['A triangle with two obtuse angles', 'Two angles above 90° already exceed 180°, so it is impossible.'],
          ],
          real: 'A roof truss with base angles 30° each has a 120° angle at the top: 180° − 30° − 30°.',
        }),
        keys('Angle sum = 180°.', 'Exterior angle = sum of the two interior opposite angles.', 'An exterior angle is greater than each interior opposite angle.', 'A triangle has at most one right or obtuse angle.'),
        remember('Equilateral triangle: each angle is 60°.'),
        tip('If the angles are in a ratio a : b : c, write them as ak, bk, ck and solve (a + b + c)k = 180°.'),
      ],
      examples: [
        ex('Two angles of a triangle are 48° and 77°. Find the third.', ['180° − 48° − 77°'], '55°'),
        ex('An exterior angle of a triangle is 110° and one interior opposite angle is 45°. Find the other.', ['110° = 45° + x'], '65°'),
        ex('The angles of a triangle are in the ratio 2 : 3 : 4. Find them.', ['9k = 180°, k = 20°'], '40°, 60°, 80°'),
      ],
      practice: [
        tp('third', (r) => {
          const a = r.int(20, 100), b = r.int(15, 160 - a);
          return typed(`Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, num(180 - a - b, '°'),
            ['The three angles add to 180°.'], [`180° − ${a}° − ${b}° = ${180 - a - b}°`], [[String(360 - a - b), 'The angle sum of a triangle is 180°, not 360°.']]);
        }),
        tp('exterior', (r) => {
          const a = r.int(25, 80), b = r.int(25, 80);
          const findExt = r.next() < 0.5;
          return findExt
            ? typed(`In triangle ABC, ∠A = ${a}° and ∠B = ${b}°. Side BC is extended to D. Find the exterior angle ∠ACD.`, num(a + b, '°'), ['Exterior angle = sum of the two interior opposite angles.'], [`∠ACD = ∠A + ∠B = ${a}° + ${b}° = ${a + b}°`], [[String(180 - a - b), 'That is ∠C itself. The exterior angle is its supplement.']])
            : typed(`An exterior angle of a triangle is ${a + b}°. One of the interior opposite angles is ${a}°. Find the other interior opposite angle.`, num(b, '°'), ['Exterior angle = sum of interior opposite angles.'], [`${a + b}° − ${a}° = ${b}°`]);
        }),
        tp('ratio', (r) => {
          const R = r.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [2, 3, 5], [1, 2, 6], [4, 5, 9], [5, 6, 7]]);
          const s = R[0] + R[1] + R[2], k = 180 / s;
          return typed(`The angles of a triangle are in the ratio ${R.join(' : ')}. Find the LARGEST angle.`, num(R[2] * k, '°'),
            [`Write the angles as ${R[0]}k, ${R[1]}k, ${R[2]}k.`, `${s}k = 180°`], [`k = ${k}°`, `Largest = ${R[2]} × ${k}° = ${R[2] * k}°`]);
        }, 2),
        bank('facts', [
          { q: 'Can a triangle have two right angles?', a: 'No — the third angle would be 0°', w: ['Yes, always', 'Yes, if it is isosceles', 'Only if it is equilateral'], h: ['90° + 90° = ?'], s: ['90° + 90° = 180° leaves nothing for the third angle.'] },
          { q: 'Each angle of an equilateral triangle is:', a: '60°', w: ['90°', '45°', '30°'], h: ['Three equal angles make 180°.'], s: ['180° ÷ 3 = 60°'] },
          { q: 'An exterior angle of a triangle is always:', a: 'greater than each interior opposite angle', w: ['less than each interior opposite angle', 'equal to the adjacent interior angle', '90°'], h: ['It equals their sum.'], s: ['A sum of two positive angles is greater than each of them.'] },
          { q: 'If one angle of a triangle equals the sum of the other two, the triangle is:', a: 'right-angled', w: ['obtuse-angled', 'equilateral', 'impossible'], h: ['x + x = 180°.'], s: ['The largest angle is 180° ÷ 2 = 90°.'] },
          { q: 'The sum of the three exterior angles of a triangle (one at each vertex) is:', a: '360°', w: ['180°', '270°', '540°'], h: ['Each exterior + interior = 180°; three of them make 540°.'], s: ['540° − 180° = 360°'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 5 CO-ORDINATE GEOMETRY
const ch5: USpec = {
  id: 'ts9.m.ch5', subject: 'math', title: 'Co-Ordinate Geometry', source: src(5),
  objectives: [
    {
      id: 'ts9.m.coord.system', title: 'The Cartesian system: axes, quadrants and origin',
      intro: [
        h('Giving every point an address'),
        photo('🗺️', 'A map grid gives every place an address of two numbers.'),
        p('To meet a friend in a crowded exhibition at Nampally, "Stall 7 in Row 3" is much better than "somewhere near the middle". Two numbers fix a position on a flat surface. The French thinker René Descartes turned this idea into the Cartesian system.'),
        def('Axes', 'Two perpendicular number lines: the horizontal x-axis and the vertical y-axis.'),
        def('Origin', 'The point O where the axes meet; its coordinates are (0, 0).'),
        def('Quadrants', 'The four regions the axes cut the plane into, numbered I to IV anticlockwise starting from the top right.'),
        keys('Quadrant I: (+, +)', 'Quadrant II: (−, +)', 'Quadrant III: (−, −)', 'Quadrant IV: (+, −)', 'Points on the axes belong to no quadrant.'),
        p('In the point (x, y), x tells how far to go right (+) or left (−) from the y-axis, and y how far up (+) or down (−) from the x-axis. So the distance of (x, y) from the y-axis is |x|, and from the x-axis is |y|.'),
        f('distance of (x, y) from the y-axis = |x|; from the x-axis = |y|', 'distance from the y axis is the size of x'),
        X({
          title: 'What if? Move a point left and right', formula: 'distance from the y-axis = |x|',
          result: ['d', 'Distance from the y-axis', 'abs(x)', 'units'],
          vars: [['x', 'x-coordinate', -8, 8, 1, 3]],
          notes: [['x', 'Moving right increases x. To the right of the y-axis the distance grows; to the left it shrinks until x = 0.', 'Moving left decreases x. Past the y-axis, the distance grows again.']],
          mistakes: [
            ['Saying the distance of (−5, 2) from the y-axis is −5', 'Distance is never negative: it is 5 units.'],
            ['Using |y| for the distance from the y-axis', 'Distance from the y-axis depends on how far LEFT or RIGHT you are — that is x.'],
          ],
          real: 'In a cinema hall, the seat number tells how far along the row you are, and the row letter how far back.',
        }),
        remember('Quadrants go anticlockwise: I top-right, II top-left, III bottom-left, IV bottom-right.'),
        tip('The signs of the two coordinates tell you the quadrant at once.'),
      ],
      examples: [
        ex('In which quadrant does (−3, 5) lie?', ['x negative → left', 'y positive → up'], 'Quadrant II'),
        ex('How far is (4, −7) from the x-axis?', ['Distance from x-axis = |y| = |−7|'], '7 units'),
      ],
      practice: [
        tp('quadrant', (r) => {
          let x = r.int(-9, 9), y = r.int(-9, 9);
          if (r.next() < 0.85) { while (x === 0) x = r.int(-9, 9); while (y === 0) y = r.int(-9, 9); }
          const ans = x === 0 && y === 0 ? 'At the origin' : x === 0 ? 'On the y-axis' : y === 0 ? 'On the x-axis' : x > 0 ? (y > 0 ? 'Quadrant I' : 'Quadrant IV') : (y > 0 ? 'Quadrant II' : 'Quadrant III');
          return mcq(r, `Where does the point ${pt(x, y)} lie?`, ans, ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV', 'On the x-axis', 'On the y-axis'].filter((s) => s !== ans),
            ['Look at the signs of x and y.', 'I (+, +), II (−, +), III (−, −), IV (+, −).'], [`x is ${x > 0 ? 'positive' : x < 0 ? 'negative' : 'zero'}, y is ${y > 0 ? 'positive' : y < 0 ? 'negative' : 'zero'} → ${ans}`]);
        }),
        tp('distance', (r) => {
          const x = r.int(-9, 9) || 4, y = r.int(-9, 9) || -3;
          const fromY = r.next() < 0.5;
          const ans = fromY ? Math.abs(x) : Math.abs(y);
          return typed(`How far is the point ${pt(x, y)} from the ${fromY ? 'y' : 'x'}-axis?`, num(ans),
            [fromY ? 'Distance from the y-axis is the size of the x-coordinate.' : 'Distance from the x-axis is the size of the y-coordinate.'],
            [`Distance = |${n_(fromY ? x : y)}| = ${ans}`],
            [[String(fromY ? Math.abs(y) : Math.abs(x)), fromY ? 'That is the distance from the x-axis.' : 'That is the distance from the y-axis.'], [n_(fromY ? x : y).replace('−', '-'), 'A distance cannot be negative.']]);
        }),
        tp('signs', (r) => {
          const q = r.int(1, 4);
          const s = ['(+, +)', '(−, +)', '(−, −)', '(+, −)'];
          return mcq(r, `What are the signs of the coordinates (x, y) of any point in Quadrant ${['I', 'II', 'III', 'IV'][q - 1]}?`, s[q - 1], s.filter((_, i) => i !== q - 1),
            ['Quadrants are numbered anticlockwise from the top right.'], [`Quadrant ${['I', 'II', 'III', 'IV'][q - 1]}: ${s[q - 1]}`]);
        }),
        bank('facts', [
          { q: 'The coordinates of the origin are:', a: '(0, 0)', w: ['(1, 1)', '(0, 1)', '(1, 0)'], h: ['It is where both axes meet.'], s: ['The origin is (0, 0).'] },
          { q: 'The x-axis and the y-axis meet at an angle of:', a: '90°', w: ['180°', '45°', '60°'], h: ['They are perpendicular.'], s: ['The axes are perpendicular.'] },
          { q: 'The Cartesian system is named after:', a: 'René Descartes', w: ['Euclid', 'Pythagoras', 'Aryabhata'], h: ['A French mathematician-philosopher.'], s: ['René Descartes (1596–1650).'] },
          { q: 'Into how many parts do the axes divide the plane?', a: '4', w: ['2', '3', '8'], h: ['Count the quadrants.'], s: ['Four quadrants.'] },
          { q: 'A point with negative x and negative y lies in:', a: 'Quadrant III', w: ['Quadrant I', 'Quadrant II', 'Quadrant IV'], h: ['Left and down.'], s: ['(−, −) is Quadrant III.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.coord.plot', title: 'Plotting points and reading coordinates', prereqs: ['ts9.m.coord.system'],
      intro: [
        h('Abscissa first, ordinate second'),
        p('In (x, y) the order matters: (2, 5) and (5, 2) are different places, just like Row 2 Seat 5 and Row 5 Seat 2. The x-coordinate is called the abscissa and the y-coordinate the ordinate.'),
        stepsB('Start at the origin.', 'Move x units along the x-axis: right if x > 0, left if x < 0.', 'From there move y units parallel to the y-axis: up if y > 0, down if y < 0.', 'Mark and label the point.'),
        keys('A point on the x-axis has the form (x, 0).', 'A point on the y-axis has the form (0, y).', '(x, y) ≠ (y, x) unless x = y.'),
        p('Shifting a point a units to the right and b units up adds a to x and b to y.'),
        f('(x, y) → (x + a, y + b)', 'x y goes to x plus a, y plus b'),
        X({
          title: 'What if? Shift a point', formula: 'new x = x + a',
          result: ['X', 'New x-coordinate', 'x + a'],
          vars: [['x', 'Starting x', -6, 6, 1, 2], ['a', 'Shift to the right (negative = left)', -6, 6, 1, 3]],
          notes: [
            ['a', 'A bigger shift to the right increases the abscissa; the ordinate does not change.', 'A shift to the left decreases the abscissa.'],
            ['x', 'Starting further right ends further right.', 'Starting further left ends further left.'],
          ],
          mistakes: [
            ['Moving up first for (x, y)', 'Always go along the x-axis first, then up or down.'],
            ['Plotting (0, 4) on the x-axis', '(0, 4) has x = 0, so it is ON THE y-AXIS, 4 units up.'],
          ],
          real: 'GPS locations work the same way: a latitude and a longitude pin down any place, such as Hyderabad at about (17.4° N, 78.5° E).',
        }),
        remember('Abscissa = x (horizontal), ordinate = y (vertical).'),
        tip('To find the area of a rectangle with vertices on grid points, subtract x-coordinates for the length and y-coordinates for the breadth.'),
      ],
      examples: [
        ex('Write the abscissa and ordinate of (−4, 7).', ['Abscissa = first coordinate', 'Ordinate = second coordinate'], 'Abscissa −4, ordinate 7'),
        ex('A point is on the y-axis, 3 units below the origin. Write its coordinates.', ['On the y-axis → x = 0', 'Below → y negative'], '(0, −3)'),
        ex('Find the area of the rectangle with vertices (1, 1), (6, 1), (6, 4), (1, 4).', ['Length = 6 − 1 = 5', 'Breadth = 4 − 1 = 3'], '15 square units'),
      ],
      practice: [
        tp('absord', (r) => {
          const x = r.int(-9, 9), y = r.int(-9, 9);
          const ab = r.next() < 0.5;
          return typed(`What is the ${ab ? 'abscissa' : 'ordinate'} of the point ${pt(x, y)}?`, num(ab ? x : y),
            ['Abscissa = x-coordinate (first).', 'Ordinate = y-coordinate (second).'], [`The ${ab ? 'abscissa' : 'ordinate'} is ${n_(ab ? x : y)}.`],
            x !== y ? [[String(ab ? y : x), ab ? 'That is the ordinate (second number).' : 'That is the abscissa (first number).']] : []);
        }),
        tp('describe', (r) => {
          const d = r.int(1, 9);
          const k = r.int(0, 3);
          const desc = ['on the x-axis, d units to the RIGHT of the origin', 'on the x-axis, d units to the LEFT of the origin', 'on the y-axis, d units ABOVE the origin', 'on the y-axis, d units BELOW the origin'][k].replace('d units', `${d} unit${d > 1 ? 's' : ''}`);
          const P = [pt(d, 0), pt(-d, 0), pt(0, d), pt(0, -d)];
          return mcq(r, `Which point lies ${desc}?`, P[k], P.filter((_, i) => i !== k),
            ['On the x-axis y = 0; on the y-axis x = 0.', 'Right/up is positive, left/down is negative.'], [`The point is ${P[k]}.`]);
        }),
        tp('shift', (r) => {
          const x = r.int(-5, 5), y = r.int(-5, 5), a = r.int(-4, 4) || 2, b = r.int(-4, 4) || -3;
          const X2 = x + a, Y2 = y + b;
          return mcq(r, `The point ${pt(x, y)} is moved ${Math.abs(a)} unit${Math.abs(a) > 1 ? 's' : ''} ${a > 0 ? 'right' : 'left'} and ${Math.abs(b)} unit${Math.abs(b) > 1 ? 's' : ''} ${b > 0 ? 'up' : 'down'}. Where does it land?`, pt(X2, Y2), [pt(x + b, y + a), pt(x - a, y - b), pt(X2, y - b)],
            ['Right/left changes x; up/down changes y.'], [`x: ${n_(x)} ${a > 0 ? '+' : '−'} ${Math.abs(a)} = ${n_(X2)}`, `y: ${n_(y)} ${b > 0 ? '+' : '−'} ${Math.abs(b)} = ${n_(Y2)}`]);
        }),
        tp('rect', (r) => {
          const x1 = r.int(-5, 2), y1 = r.int(-5, 2), L = r.int(2, 7), B = r.int(2, 6);
          return typed(`A rectangle has vertices ${pt(x1, y1)}, ${pt(x1 + L, y1)}, ${pt(x1 + L, y1 + B)} and ${pt(x1, y1 + B)}. Find its area in square units.`, num(L * B),
            ['Length = difference of the x-coordinates.', 'Breadth = difference of the y-coordinates.'],
            [`Length = ${n_(x1 + L)} − ${pn(x1)} = ${L}`, `Breadth = ${n_(y1 + B)} − ${pn(y1)} = ${B}`, `Area = ${L} × ${B} = ${L * B}`],
            [[String(2 * (L + B)), 'That is the perimeter. Area = length × breadth.']]);
        }, 2),
        bank('facts', [
          { q: 'Are (3, 5) and (5, 3) the same point?', a: 'No — the order of coordinates matters', w: ['Yes, they use the same numbers', 'Yes, both are in Quadrant I', 'Only on graph paper'], h: ['Plot both.'], s: ['(3, 5) is 3 right, 5 up; (5, 3) is 5 right, 3 up.'] },
          { q: 'The ordinate of every point on the x-axis is:', a: '0', w: ['1', 'equal to the abscissa', 'negative'], h: ['On the x-axis you do not go up or down.'], s: ['y = 0 on the x-axis.'] },
          { q: 'The abscissa of every point on the y-axis is:', a: '0', w: ['1', 'equal to the ordinate', 'positive'], h: ['On the y-axis you do not go left or right.'], s: ['x = 0 on the y-axis.'] },
          { q: 'Which point lies on BOTH axes?', a: '(0, 0)', w: ['(1, 1)', '(0, 5)', '(5, 0)'], h: ['Where do the axes meet?'], s: ['Only the origin lies on both.'] },
          { q: 'For which point is the abscissa equal to the ordinate?', a: '(−4, −4)', w: ['(4, −4)', '(−4, 4)', '(0, 4)'], h: ['Both coordinates the same.'], s: ['(−4, −4) has x = y = −4.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.coord.figures', title: 'Plotting points from a table and reading figures on the plane', prereqs: ['ts9.m.coord.plot'],
      intro: [
        h('From a table of points to a picture'),
        p('A Class 9 student in Nalgonda records points in a table: (1, 1), (5, 1), (5, 4), (1, 4). Plot them and join in order — a rectangle appears. Reading lengths straight from coordinates is a key skill of coordinate geometry.'),
        stepsB('Make a table of x and y values.', 'Plot each point (x along, then y up or down).', 'Join the points in the given order.', 'Read lengths of horizontal and vertical sides from the coordinates.'),
        keys('Points with the same y-coordinate lie on a horizontal line.', 'Points with the same x-coordinate lie on a vertical line.', 'Length of a horizontal segment = |x₂ − x₁|; vertical segment = |y₂ − y₁|.'),
        f('horizontal length = |x₂ − x₁|', 'horizontal length is the size of x2 minus x1'),
        X({
          title: 'What if? Move the end points of a horizontal segment', formula: 'length = |x₂ − x₁|',
          result: ['L', 'Length of the segment', 'abs(b - a)', 'units'],
          vars: [['a', 'x₁ (first end)', -8, 8, 1, -2], ['b', 'x₂ (second end)', -8, 8, 1, 5]],
          notes: [
            ['b', 'Moving the second end away from the first lengthens the segment.', 'Moving it towards the first shortens it; past it, the length grows again.'],
            ['a', 'Moving the first end towards the second shortens the segment.', 'Moving it away lengthens the segment.'],
          ],
          mistakes: [
            ['Adding the coordinates: |−2| + 5 = 7 but writing −2 + 5 = 3', 'Subtract: 5 − (−2) = 7. When the ends are on opposite sides of the y-axis, the distances add.'],
            ['Using the y-coordinates for a horizontal segment', 'Along a horizontal line only x changes.'],
          ],
          real: 'On a town map, two shops on the same east–west road at x = −2 km and x = 5 km are 7 km apart.',
        }),
        remember('Same y → horizontal; same x → vertical.'),
        tip('To find the fourth corner of a rectangle with sides parallel to the axes, reuse an x from one corner and a y from another.'),
      ],
      examples: [
        ex('Find the length of the segment joining (−3, 2) and (4, 2).', ['Same y, so horizontal', '|4 − (−3)| = 7'], '7 units'),
        ex('Three corners of a rectangle are (1, 1), (6, 1) and (6, 4). Find the fourth.', ['Use x from (1, 1) and y from (6, 4)'], '(1, 4)'),
      ],
      practice: [
        tp('hlen', (r) => {
          const y = r.int(-6, 6), a = r.int(-8, 3), b = a + r.int(2, 9);
          const vert = r.next() < 0.5;
          const [P, Q] = vert ? [pt(y, a), pt(y, b)] : [pt(a, y), pt(b, y)];
          return typed(`Find the length of the segment joining ${P} and ${Q}.`, num(b - a),
            [vert ? 'Same x-coordinate: the segment is vertical.' : 'Same y-coordinate: the segment is horizontal.', 'Subtract the coordinates that change.'],
            [`Length = |${n_(b)} − ${pn(a)}| = ${b - a}`], a < 0 && b > 0 ? [[String(b + a), 'Subtracting a negative number adds its size.']] : []);
        }),
        tp('fourth', (r) => {
          const x1 = r.int(-5, 2), y1 = r.int(-5, 2), x2 = x1 + r.int(2, 6), y2 = y1 + r.int(2, 5);
          const corners = [pt(x1, y1), pt(x2, y1), pt(x2, y2), pt(x1, y2)];
          const miss = r.int(0, 3);
          const given = corners.filter((_, i) => i !== miss);
          return mcq(r, `Three corners of a rectangle with sides parallel to the axes are ${given.join(', ')}. Which is the fourth corner?`, corners[miss], [pt(x1 - 1, y2), pt(x2, y2 + 1), pt(x2 + 1, y1 - 1)].filter((c) => !corners.includes(c)),
            ['Each x-value appears twice among the corners, and each y-value appears twice.'], [`The fourth corner is ${corners[miss]}.`]);
        }),
        tp('perim', (r) => {
          const x1 = r.int(-6, 1), y1 = r.int(-6, 1), s = r.int(2, 7);
          return typed(`A square has corners ${pt(x1, y1)}, ${pt(x1 + s, y1)}, ${pt(x1 + s, y1 + s)} and ${pt(x1, y1 + s)}. Find its perimeter.`, num(4 * s),
            ['Find one side from the coordinates.', 'Perimeter of a square = 4 × side.'], [`Side = ${s}`, `Perimeter = ${4 * s}`], [[String(s * s), 'That is the area.']]);
        }),
        tp('line', (r) => {
          const k = r.int(-6, 6);
          const xs = r.shuffle([-4, -2, 0, 1, 3, 5]).slice(0, 3);
          const horiz = r.next() < 0.5;
          const pts = xs.map((x) => (horiz ? pt(x, k) : pt(k, x)));
          return mcq(r, `The points ${pts.join(', ')} are plotted. They lie on a line that is:`, horiz ? 'parallel to the x-axis' : 'parallel to the y-axis', [horiz ? 'parallel to the y-axis' : 'parallel to the x-axis', 'through the origin at 45°'].concat(k === 0 ? [] : ['the x-axis itself']),
            ['Which coordinate stays the same?'], [horiz ? `All have y = ${n_(k)}, so the line is horizontal.` : `All have x = ${n_(k)}, so the line is vertical.`].concat(k === 0 ? [horiz ? 'Since y = 0, it is in fact the x-axis.' : 'Since x = 0, it is in fact the y-axis.'] : []));
        }),
        bank('facts', [
          { q: 'Points (2, 5), (−1, 5) and (7, 5) lie on a line:', a: 'parallel to the x-axis', w: ['parallel to the y-axis', 'through the origin', 'that is the y-axis'], h: ['The y-coordinate is the same.'], s: ['Same y → horizontal line.'] },
          { q: 'The length of the segment from (0, −3) to (0, 4) is:', a: '7', w: ['1', '−7', '4'], h: ['Vertical: subtract the y-values.'], s: ['4 − (−3) = 7'] },
          { q: 'Joining (0, 0), (4, 0) and (0, 3) gives a triangle with a right angle at:', a: 'the origin', w: ['(4, 0)', '(0, 3)', 'no vertex'], h: ['The axes are perpendicular.'], s: ['Two sides lie along the axes.'] },
          { q: 'The area of the triangle with vertices (0, 0), (6, 0) and (0, 4) is:', a: '12 square units', w: ['24 square units', '10 square units', '20 square units'], h: ['½ × base × height.'], s: ['½ × 6 × 4 = 12'] },
          { q: 'A point is 3 units from both axes and lies in Quadrant III. It is:', a: '(−3, −3)', w: ['(3, 3)', '(−3, 3)', '(3, −3)'], h: ['Quadrant III: both negative.'], s: ['(−3, −3)'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 6 LINEAR EQUATIONS IN TWO VARIABLES
/** ax + by + c with nice signs: 2x − 3y + 7 */
const lin = (a: number, b: number, c: number) => {
  let s = a === 0 ? '' : `${a < 0 ? '−' : ''}${Math.abs(a) === 1 ? '' : Math.abs(a)}x`;
  if (b) s += s ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y` : `${b < 0 ? '−' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
  if (c) s += ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}`;
  return s;
};
const ch6: USpec = {
  id: 'ts9.m.ch6', subject: 'math', title: 'Linear Equations in Two Variables', source: src(6),
  objectives: [
    {
      id: 'ts9.m.lin2.form', title: 'Writing linear equations in two variables',
      intro: [
        h('Two unknowns, one rule'),
        p('At a stationery shop in Khammam, a pen costs ₹x and a notebook ₹y. Lakshmi pays ₹100 for 2 pens and 3 notebooks. We can write this as 2x + 3y = 100. There are two unknowns but only one rule connecting them.'),
        def('Linear equation in two variables', 'An equation that can be written as ax + by + c = 0, where a, b, c are real numbers and a and b are not both zero.'),
        keys('Both variables appear only with power 1, and are never multiplied together.', 'Move every term to the left side to get the standard form ax + by + c = 0.', 'x = 3 can be read as 1·x + 0·y − 3 = 0, so it is also a linear equation in two variables.'),
        f('ax + by + c = 0', 'a x plus b y plus c equals zero'),
        X({
          title: 'What if? Change the coefficients', formula: 'ax + by + c = 0 → value of ax + by + c at the point (x, y)',
          result: ['L', 'Left side ax + by + c', 'a * x + b * y + c'],
          vars: [['a', 'Coefficient a', -5, 5, 1, 2], ['b', 'Coefficient b', -5, 5, 1, 3], ['c', 'Constant c', -100, 100, 1, -100], ['x', 'x', 0, 50, 1, 20], ['y', 'y', 0, 50, 1, 20]],
          notes: [
            ['x', 'When the left side reaches 0, the point (x, y) satisfies the equation.', 'Change x until the left side is 0.'],
            ['c', 'Changing c moves which points make the equation true.', 'Changing c moves which points make the equation true.'],
          ],
          mistakes: [
            ['Forgetting to change the sign when moving a term', '2x = 3y − 7 becomes 2x − 3y + 7 = 0, not 2x + 3y − 7 = 0.'],
            ['Calling xy = 6 linear', 'The variables are multiplied together, so it is not linear.'],
          ],
          real: 'With a = 2, b = 3, c = −100 and x = y = 20 (pens and notebooks at ₹20), the left side is 0: Lakshmi\'s bill is exactly ₹100.',
        }),
        remember('Standard form has 0 on the right side.'),
        tip('Read the words carefully: "the cost of 2 pens is ₹5 more than a notebook" means 2x = y + 5, i.e. 2x − y − 5 = 0.'),
      ],
      examples: [
        ex('Write 3x = 2y + 5 in the form ax + by + c = 0 and give a, b, c.', ['3x − 2y − 5 = 0'], 'a = 3, b = −2, c = −5'),
        ex('The cost of a notebook is twice the cost of a pen. Write a linear equation.', ['Let pen = ₹x, notebook = ₹y', 'y = 2x'], '2x − y = 0'),
      ],
      practice: [
        tp('coef', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9), c = r.int(1, 15);
          const kind = r.int(0, 2);
          const shown = kind === 0 ? `${a}x = ${b}y − ${c}` : kind === 1 ? `${a}x + ${c} = ${b}y` : `${a}x = ${c} − ${b}y`;
          // standard form with coefficient of x = a: kind0: ax − by + c; kind1: ax − by + c; kind2: ax + by − c
          const [B, C] = kind === 2 ? [b, -c] : [-b, c];
          const ask = r.next() < 0.5 ? 'b' : 'c';
          return typed(`Write ${shown} in the form ax + by + c = 0 with a = ${a}. What is ${ask}?`, num(ask === 'b' ? B : C),
            ['Move every term to the left side.', 'A term changes sign when it crosses the = sign.'],
            [`${lin(a, B, C)} = 0`, `So b = ${n_(B)} and c = ${n_(C)}.`],
            [[String(ask === 'b' ? -B : -C), 'Check the sign: the term changed sides.']]);
        }),
        tp('word', (r) => {
          const p1 = r.int(2, 6), q1 = r.int(2, 6), T = r.pick([50, 60, 80, 100, 120, 150]);
          const [it1, it2] = r.pick([['a pen', 'a pencil box'], ['a kg of rice', 'a kg of dal'], ['an adult ticket', 'a child ticket'], ['a mango', 'a guava']]);
          return mcq(r, `${nm(r)} buys ${p1} × ${it1} (₹x each) and ${q1} × ${it2} (₹y each) for ₹${T} in all. Which equation describes this?`, `${p1}x + ${q1}y = ${T}`, [`${q1}x + ${p1}y = ${T}`, `${p1}x − ${q1}y = ${T}`, `x + y = ${T}`],
            ['Cost = number × price for each item.', 'Add the two costs.'], [`${p1} × x + ${q1} × y = ${T}`]);
        }),
        tapT('islinear', 'Tap every equation that is LINEAR in two variables x and y.', ['2x + 3y = 7', 'x = 4y', 'y = 5', '√2 x − y = 0', 'x/3 + y/2 = 1', '3x − 7 = y'], ['x² + y = 4', 'xy = 6', '1/x + y = 2', 'x + √y = 3', 'y = x³'],
          ['Each variable must have power 1.', 'The variables must not be multiplied or divided by each other.'], 'xy, x², 1/x and √y are not linear terms.'),
        bank('facts', [
          { q: 'In the equation 5x − 2y = 9, written as ax + by + c = 0, c is:', a: '−9', w: ['9', '5', '−2'], h: ['5x − 2y − 9 = 0'], s: ['5x − 2y − 9 = 0, so c = −9.'] },
          { q: 'The equation y = 3 written in two variables is:', a: '0·x + 1·y − 3 = 0', w: ['3x + y = 0', 'x + y = 3', 'x = 3y'], h: ['x does not appear: its coefficient is 0.'], s: ['0·x + 1·y − 3 = 0'] },
          { q: 'The Celsius–Fahrenheit rule F = (9/5)C + 32 is:', a: 'a linear equation in two variables', w: ['not an equation', 'a quadratic equation', 'linear in one variable only'], h: ['Both F and C have power 1.'], s: ['It can be written as 9C − 5F + 160 = 0.'] },
          { q: 'In ax + by + c = 0, which condition must hold?', a: 'a and b are not both zero', w: ['c ≠ 0', 'a = b', 'a, b, c are all positive'], h: ['Otherwise there is no variable left.'], s: ['If a = b = 0 there is no equation in x and y.'] },
          { q: '"The sum of two numbers is 27" can be written as:', a: 'x + y = 27', w: ['xy = 27', 'x − y = 27', 'x = 27y'], h: ['Sum means add.'], s: ['x + y = 27'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lin2.solutions', title: 'Solutions of a linear equation', prereqs: ['ts9.m.lin2.form'],
      intro: [
        h('Many answers, not just one'),
        p('For 2x + 3y = 100 (pens and notebooks), x = 20, y = 20 works. So does x = 5, y = 30, and x = 50, y = 0. A linear equation in two variables has infinitely many solutions — choose any x and the equation tells you y.'),
        def('Solution', 'A pair of values (x, y) that makes both sides of the equation equal.'),
        stepsB('Choose a value of x.', 'Substitute it in the equation.', 'Solve the resulting one-variable equation for y.'),
        f('y = (c − ax) / b   for ax + by = c, b ≠ 0', 'y equals c minus a x, over b'),
        X({
          title: 'What if? Choose x and find y', formula: 'y = (c − ax)/b',
          result: ['y', 'Matching value of y', '(c - a * x) / b', '', 2],
          vars: [['x', 'Chosen x', -10, 10, 1, 2], ['a', 'Coefficient a', -6, 6, 1, 2], ['b', 'Coefficient b', 1, 6, 1, 3], ['c', 'Right-hand side c', -30, 30, 1, 12]],
          notes: [
            ['x', 'With a > 0, a bigger x leaves less for by, so y falls.', 'A smaller x leaves more, so y rises.'],
            ['c', 'A bigger total c raises y for the same x.', 'A smaller total lowers y.'],
          ],
          mistakes: [
            ['Thinking there is only one solution', 'Every value of x gives a matching y, so there are infinitely many.'],
            ['Swapping the order in a solution pair', '(2, 3) means x = 2, y = 3. Writing (3, 2) is a different point.'],
          ],
          real: 'With ₹100 to spend on pens and notebooks there are many possible shopping lists — each solution is one of them.',
        }),
        keys('A linear equation in two variables has infinitely many solutions.', 'Check a solution by substituting both values.', 'Points (0, y) and (x, 0) are the easiest to find.'),
        remember('Order matters in a solution pair: first x, then y.'),
        tip('Choose x values that make y a whole number — try multiples of b.'),
      ],
      examples: [
        ex('Find two solutions of x + 2y = 6.', ['x = 0 → 2y = 6 → y = 3', 'y = 0 → x = 6'], '(0, 3) and (6, 0)'),
        ex('Is (2, −1) a solution of 3x + 4y = 2?', ['3(2) + 4(−1) = 6 − 4 = 2 ✓'], 'Yes'),
        ex('If (1, 2) is a solution of 3x + ky = 11, find k.', ['3 + 2k = 11', '2k = 8'], 'k = 4'),
      ],
      practice: [
        tp('findy', (r) => {
          const a = r.int(-5, 6) || 2, b = r.int(1, 5), x = r.int(-5, 6), y = r.int(-6, 6);
          const c = a * x + b * y;
          return typed(`For the equation ${lin(a, b, 0)} = ${c}, find y when x = ${n_(x)}.`, num(y),
            [`Put x = ${n_(x)}.`, `${a * x} + ${b}y = ${c}`],
            [`${n_(a)} × ${pn(x)} + ${b}y = ${c}`, `${b}y = ${c} − ${pn(a * x)} = ${c - a * x}`, `y = ${y}`]);
        }),
        tp('check', (r) => {
          const a = r.int(1, 6), b = r.int(-5, 5) || 3, x = r.int(-4, 5), y = r.int(-4, 5);
          const c = a * x + b * y + (r.next() < 0.5 ? 0 : r.pick([-2, -1, 1, 2]));
          const lhs = a * x + b * y;
          const ok = lhs === c;
          return mcq(r, `Is ${pt(x, y)} a solution of ${lin(a, b, 0)} = ${c}?`, ok ? `Yes, the left side is ${lhs}` : `No, the left side is ${lhs}`, [ok ? `No, the left side is ${lhs + 1}` : `Yes, the left side is ${c}`, ok ? `No, the left side is ${lhs - 1}` : `Yes, the left side is ${lhs}`],
            ['Put x and y in the left side.', 'It is a solution only if the left side equals the right side.'],
            [`${n_(a)}(${n_(x)}) + ${pn(b)}(${n_(y)}) = ${lhs}`, ok ? `= ${c}, so it IS a solution.` : `≠ ${c}, so it is NOT a solution.`]);
        }),
        tp('findk', (r) => {
          const a = r.int(1, 7), k = r.int(-5, 6) || 3, x = r.int(-3, 4), y = r.pick([-3, -2, -1, 1, 2, 3]);
          const c = a * x + k * y;
          return typed(`If x = ${n_(x)}, y = ${n_(y)} is a solution of ${a === 1 ? '' : a}x + ky = ${c}, find k.`, num(k),
            ['Substitute both values.', 'Solve the equation for k.'],
            [`${a * x} + (${n_(y)})k = ${c}`, `(${n_(y)})k = ${c - a * x}`, `k = ${k}`]);
        }, 2),
        tp('xint', (r) => {
          const a = r.int(1, 6), b = r.int(1, 6), m = r.int(1, 6);
          const c = a * b * m;
          const ask = r.next() < 0.5 ? 'x' : 'y';
          return typed(`Find the solution of ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c} in which ${ask === 'x' ? 'y' : 'x'} = 0. What is ${ask}?`, num(ask === 'x' ? c / a : c / b),
            [`Put ${ask === 'x' ? 'y' : 'x'} = 0.`, `Divide ${c} by the remaining coefficient.`],
            [ask === 'x' ? `${a}x = ${c}, x = ${c / a}` : `${b}y = ${c}, y = ${c / b}`]);
        }),
        bank('facts', [
          { q: 'How many solutions does 2x + 5y = 7 have?', a: 'Infinitely many', w: ['Only one', 'Exactly two', 'None'], h: ['Pick any x and solve for y.'], s: ['Every x gives a y, so infinitely many.'] },
          { q: 'Which is a solution of x − 2y = 4?', a: '(4, 0)', w: ['(0, 2)', '(2, 0)', '(1, 1)'], h: ['Substitute each pair.'], s: ['4 − 0 = 4 ✓'] },
          { q: 'x = 2, y = 3 is written as:', a: '(2, 3)', w: ['(3, 2)', '(2 + 3)', '{3, 2}'], h: ['x first, then y.'], s: ['The pair is (x, y) = (2, 3).'] },
          { q: 'Which equation has (1, 1) as a solution?', a: 'x + y = 2', w: ['x + y = 1', '2x − y = 0', 'x − y = 2'], h: ['1 + 1 = ?'], s: ['1 + 1 = 2 ✓'] },
          { q: 'y = 3x has the solution:', a: '(2, 6)', w: ['(6, 2)', '(3, 1)', '(1, 4)'], h: ['y must be 3 times x.'], s: ['3 × 2 = 6 ✓'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lin2.graph', title: 'Graph of a linear equation', prereqs: ['ts9.m.lin2.solutions', 'ts9.m.coord.plot'],
      intro: [
        h('All the solutions on one straight line'),
        p('An auto in Hyderabad charges ₹25 for the first km and ₹15 for every km after. The fare for x km is y = 25 + 15(x − 1) = 15x + 10. Plot (1, 25), (2, 40), (3, 55) — they line up perfectly. Every solution of a linear equation lies on one straight line, and every point on that line is a solution.'),
        stepsB('Find at least two (better three) solutions and write them in a table.', 'Plot the points.', 'Join them with a ruler and extend the line both ways.'),
        def('Intercepts', 'The line ax + by = c meets the x-axis at (c/a, 0) and the y-axis at (0, c/b).'),
        f('x-intercept = c/a,  y-intercept = c/b  (for ax + by = c)', 'the x intercept is c over a'),
        X({
          title: 'What if? Change the line ax + by = c', formula: 'x-intercept = c / a',
          result: ['p', 'Where the line meets the x-axis', 'c / a', '', 2],
          vars: [['a', 'Coefficient a', 1, 10, 1, 2], ['c', 'Right-hand side c', -20, 20, 1, 6]],
          notes: [
            ['a', 'A bigger a makes the line meet the x-axis closer to the origin.', 'A smaller a pushes the crossing point further away.'],
            ['c', 'A bigger c moves the line away from the origin (parallel shift).', 'With c = 0 the line passes through the origin.'],
          ],
          mistakes: [
            ['Plotting (c/b, 0) as the x-intercept', 'On the x-axis y = 0, so ax = c and x = c/a.'],
            ['Joining only the plotted points with a segment', 'The graph is a whole line: extend it both ways.'],
          ],
          real: 'The fare line y = 15x + 10 lets a driver read the fare for any distance straight off the graph.',
        }),
        keys('The graph of a linear equation in two variables is a straight line.', 'Every point on it is a solution; every solution is on it.', 'y = mx passes through the origin.'),
        remember('Two points fix a line; a third point is a check for mistakes.'),
        tip('Use the intercept points (0, c/b) and (c/a, 0) — they are the quickest to plot.'),
      ],
      examples: [
        ex('Draw the graph of x + y = 4.', ['Solutions: (0, 4), (4, 0), (2, 2)', 'Plot and join them.'], 'A straight line through (0, 4) and (4, 0)', { kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[0, 4], [2, 2], [4, 0]] }),
        ex('Does the point (3, 5) lie on the graph of 2x − y = 1?', ['2(3) − 5 = 1 ✓'], 'Yes'),
      ],
      practice: [
        tp('fare', (r) => {
          const first = r.pick([20, 25, 30]), per = r.pick([10, 12, 15, 18]), x = r.int(2, 15);
          return typed(`An auto charges ₹${first} for the first km and ₹${per} for every km after that. The fare for x km is y = ${first} + ${per}(x − 1). What is the fare for ${x} km?`, num(first + per * (x - 1), '₹'),
            ['Put the value of x in the equation.', `Only ${x - 1} km are charged at ₹${per}.`],
            [`y = ${first} + ${per} × ${x - 1} = ${first + per * (x - 1)}`],
            [[String(first + per * x), `The first km is already in the ₹${first}; only ${x - 1} more km are charged at ₹${per}.`]]);
        }),
        tp('intercept', (r) => {
          const a = r.int(1, 6), b = r.int(1, 6), m = r.int(1, 5) * (r.next() < 0.3 ? -1 : 1);
          const c = a * b * m;
          const ax = r.next() < 0.5;
          return typed(`At what value does the line ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c} cross the ${ax ? 'x' : 'y'}-axis? Give the ${ax ? 'x' : 'y'}-coordinate.`, num(ax ? c / a : c / b),
            [ax ? 'On the x-axis, y = 0.' : 'On the y-axis, x = 0.'],
            [ax ? `${a}x = ${c} → x = ${c / a}` : `${b}y = ${c} → y = ${c / b}`],
            a !== b ? [[String(ax ? c / b : c / a), ax ? 'That is where it crosses the y-axis.' : 'That is where it crosses the x-axis.']] : []);
        }),
        tp('pointon', (r) => {
          const a = r.int(1, 5), b = r.int(-4, 4) || 1, x0 = r.int(-3, 4), y0 = r.int(-3, 4);
          const c = a * x0 + b * y0;
          return mcq(r, `Which point lies on the graph of ${lin(a, b, 0)} = ${c}?`, pt(x0, y0), [pt(y0, x0 + 1), pt(x0 + 1, y0), pt(x0, y0 - 1)],
            ['A point lies on the line exactly when it is a solution.', 'Substitute each point.'], [`${n_(a)}(${n_(x0)}) + ${pn(b)}(${n_(y0)}) = ${c} ✓`]);
        }),
        tp('origin', (r) => {
          const m = r.int(2, 6);
          const eq = [`y = ${m}x`, `x + y = 0`, `${m}x − y = 0`, `y = −${m}x`];
          const bad = [`y = ${m}x + 1`, `x + y = ${m}`, `${m}x − y = ${m}`, `y = x − ${m}`];
          return mcq(r, 'Which line passes through the origin?', r.pick(eq), r.shuffle(bad).slice(0, 3),
            ['Put x = 0, y = 0. Does it work?'], ['A line passes through (0, 0) when its constant term is 0.']);
        }),
        bank('facts', [
          { q: 'The graph of a linear equation in two variables is:', a: 'a straight line', w: ['a curve', 'a circle', 'a single point'], h: ['Plot a few solutions.'], s: ['All solutions lie on one straight line.'] },
          { q: 'How many lines can pass through the point (2, 3)?', a: 'Infinitely many', w: ['Only one', 'Two', 'None'], h: ['Turn a ruler about the point.'], s: ['Infinitely many lines pass through any point.'] },
          { q: 'The line y = x passes through:', a: '(5, 5)', w: ['(5, 0)', '(0, 5)', '(5, −5)'], h: ['y must equal x.'], s: ['(5, 5) has x = y.'] },
          { q: 'The minimum number of points needed to draw a line is:', a: '2', w: ['1', '3', '4'], h: ['Two points fix a line.'], s: ['Two points determine a unique line.'] },
          { q: 'If a point is not on the graph of an equation, then it is:', a: 'not a solution of the equation', w: ['a solution of the equation', 'the origin', 'an intercept'], h: ['The graph shows all solutions.'], s: ['Every solution lies on the line.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.lin2.axes', title: 'Lines parallel to the x-axis and y-axis', prereqs: ['ts9.m.lin2.graph'],
      intro: [
        h('Equations with only one letter'),
        p('Every seat in row 4 of a theatre has row number 4, whatever its seat number. On a graph, all points with y = 4 make a horizontal line. All points with x = −2 make a vertical line.'),
        keys('y = k is a line parallel to the x-axis, k units from it (above if k > 0).', 'x = k is a line parallel to the y-axis, k units from it (right if k > 0).', 'y = 0 is the x-axis itself; x = 0 is the y-axis.', 'In two variables, x = k means 1·x + 0·y = k.'),
        p('The lines x = a and y = b always meet at exactly one point, (a, b). Two vertical lines x = a and x = b are parallel and |b − a| units apart.'),
        f('distance between x = a and x = b is |b − a|', 'the distance between the vertical lines is the size of b minus a'),
        X({
          title: 'What if? Move two vertical lines', formula: 'gap = |b − a|',
          result: ['g', 'Distance between x = a and x = b', 'abs(b - a)', 'units'],
          vars: [['a', 'First line x = a', -8, 8, 1, -2], ['b', 'Second line x = b', -8, 8, 1, 3]],
          notes: [
            ['a', 'Moving the first line towards the second shrinks the gap; past it the gap grows again.', 'Moving it away to the left widens the gap.'],
            ['b', 'Moving the second line right widens the gap.', 'Moving it left narrows the gap.'],
          ],
          mistakes: [
            ['Drawing x = 3 as a horizontal line', 'x = 3 means every point has x = 3 — that is vertical, 3 units right of the y-axis.'],
            ['Thinking x = 3 has only one solution', 'In one variable it is one point on the number line; in two variables it is a whole line of points (3, y).'],
          ],
          real: 'On a city grid map, all houses on a north–south street share the same x-coordinate: the street is a line x = k.',
        }),
        remember('y = k: horizontal. x = k: vertical.'),
        tip('Say it aloud: "x is always 3" — then picture every point that is 3 units to the right.'),
      ],
      examples: [
        ex('Give the geometric representation of 2x + 9 = 0 in two variables.', ['x = −9/2 = −4.5', 'All points (−4.5, y)'], 'A line parallel to the y-axis, 4.5 units to the left of it'),
        ex('Where do x = 3 and y = −2 meet?', ['x = 3 and y = −2 together'], '(3, −2)'),
      ],
      practice: [
        tp('which', (r) => {
          const k = r.int(-9, 9) || 5;
          const xv = r.next() < 0.5;
          return mcq(r, `The line ${xv ? 'x' : 'y'} = ${n_(k)} is:`, xv ? 'parallel to the y-axis' : 'parallel to the x-axis', [xv ? 'parallel to the x-axis' : 'parallel to the y-axis', 'passing through the origin', 'at 45° to the axes'],
            [`Every point on it has ${xv ? 'x' : 'y'} = ${n_(k)}.`, xv ? 'Fixed x means you can only move up or down.' : 'Fixed y means you can only move left or right.'],
            [`${xv ? 'x' : 'y'} = ${n_(k)} is ${xv ? 'vertical (parallel to the y-axis)' : 'horizontal (parallel to the x-axis)'}.`]);
        }),
        tp('meet', (r) => {
          const a = r.pick([-7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
          let b = r.pick([-6, -4, -3, -2, -1, 1, 2, 3, 5, 7]);
          while (b === a) b = r.pick([-6, -2, 3, 7]);
          return mcq(r, `Where do the lines x = ${n_(a)} and y = ${n_(b)} intersect?`, pt(a, b), [pt(b, a), pt(a, 0), pt(0, b)],
            ['The point must satisfy both equations.'], [`x = ${n_(a)} and y = ${n_(b)} → ${pt(a, b)}`]);
        }),
        tp('gap', (r) => {
          const a = r.int(-8, 8), b = r.int(-8, 8);
          const v = r.next() < 0.5;
          if (a === b) return typed(`How far apart are the lines ${v ? 'x' : 'y'} = ${n_(a)} and ${v ? 'x' : 'y'} = ${n_(a + 3)}?`, num(3), ['Subtract the two constants.'], [`|${n_(a + 3)} − ${pn(a)}| = 3`]);
          return typed(`How far apart are the parallel lines ${v ? 'x' : 'y'} = ${n_(a)} and ${v ? 'x' : 'y'} = ${n_(b)}?`, num(Math.abs(b - a)),
            ['Subtract the two constants and ignore the sign.', 'Picture them on the number line.'],
            [`|${n_(b)} − ${pn(a)}| = ${Math.abs(b - a)}`],
            a * b < 0 ? [[String(Math.abs(Math.abs(b) - Math.abs(a))), 'The lines are on opposite sides of the axis, so the distances add.']] : []);
        }),
        tp('solve1', (r) => {
          const a = r.int(2, 6), k = r.int(-6, 6) || 2, c = a * k;
          return typed(`Solve ${a}x ${c < 0 ? '+' : '−'} ${Math.abs(c)} = 0. In two variables its graph is the line x = h. Find h.`, num(k),
            ['Solve for x.'], [`${a}x = ${c}`, `x = ${k}`, `The graph is the vertical line x = ${k}.`]);
        }),
        bank('facts', [
          { q: 'The equation of the x-axis is:', a: 'y = 0', w: ['x = 0', 'y = x', 'x + y = 0'], h: ['Every point on the x-axis has ordinate 0.'], s: ['y = 0'] },
          { q: 'The equation of the y-axis is:', a: 'x = 0', w: ['y = 0', 'y = x', 'x = 1'], h: ['Every point on the y-axis has abscissa 0.'], s: ['x = 0'] },
          { q: 'The line y = −3 lies:', a: '3 units below the x-axis', w: ['3 units above the x-axis', '3 units left of the y-axis', 'on the y-axis'], h: ['Negative y means below.'], s: ['All points have y = −3: 3 units below.'] },
          { q: 'How many solutions does y = 5 have in two variables?', a: 'Infinitely many', w: ['One', 'None', 'Two'], h: ['(0, 5), (1, 5), (2, 5), …'], s: ['Every point (x, 5) is a solution.'] },
          { q: 'The lines x = 4 and x = −1 are:', a: 'parallel', w: ['perpendicular', 'the same line', 'meeting at (4, −1)'], h: ['Both are vertical.'], s: ['Two vertical lines are parallel.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7 TRIANGLES
const ch7: USpec = {
  id: 'ts9.m.ch7', subject: 'math', title: 'Triangles', source: src(7),
  objectives: [
    {
      id: 'ts9.m.tri.congruence', title: 'Congruence of triangles: SAS and ASA', prereqs: ['ts9.m.lines.trisum'],
      intro: [
        h('Exact copies'),
        p('Two ₹10 coins, two keys cut from the same pattern, two triangular panels of the same roof truss — each pair fits exactly on top of each other. Such figures are congruent (≅).'),
        def('Congruent triangles', 'Triangles whose corresponding sides and corresponding angles are all equal. △ABC ≅ △PQR means A ↔ P, B ↔ Q, C ↔ R.'),
        p('The ORDER of the letters matters: in △ABC ≅ △PQR, AB = PQ, BC = QR, CA = RP and ∠A = ∠P, ∠B = ∠Q, ∠C = ∠R.'),
        keys('SAS: two sides and the INCLUDED angle equal → congruent (taken as an axiom).', 'ASA: two angles and the INCLUDED side equal → congruent (theorem).', 'AAS: two angles and any corresponding side equal → congruent (follows from ASA, since the third angles are then equal).', 'CPCT: corresponding parts of congruent triangles are equal.'),
        remember('SSA (two sides and a non-included angle) does NOT guarantee congruence, and neither does AAA (same shape, maybe different size).'),
        tip('Mark equal parts with matching ticks on a rough figure before choosing a rule.'),
      ],
      examples: [
        ex('In △ABC and △DEF, AB = DE, ∠B = ∠E and BC = EF. Are they congruent?', ['∠B lies between AB and BC; ∠E between DE and EF.', 'So the angle is included.'], 'Yes, by SAS: △ABC ≅ △DEF'),
        ex('△PQR ≅ △XYZ with PQ = 6 cm and ∠R = 40°. Find XY and ∠Z.', ['P ↔ X, Q ↔ Y, so XY = PQ.', 'R ↔ Z, so ∠Z = ∠R.'], 'XY = 6 cm, ∠Z = 40°'),
      ],
      practice: [
        tp('cpct', (r) => {
          const L1 = r.shuffle(['A', 'B', 'C']), L2 = r.shuffle(['P', 'Q', 'R']);
          const i = r.int(0, 2), j = (i + 1) % 3;
          const side = r.next() < 0.5;
          const ask = side ? `${L1[i]}${L1[j]}` : `∠${L1[i]}`;
          const ok = side ? `${L2[i]}${L2[j]}` : `∠${L2[i]}`;
          const wrong = side ? [`${L2[j]}${L2[(j + 1) % 3]}`, `${L2[i]}${L2[(i + 2) % 3]}`] : [`∠${L2[j]}`, `∠${L2[(i + 2) % 3]}`];
          return mcq(r, `△${L1.join('')} ≅ △${L2.join('')}. Which part is equal to ${ask}?`, ok, wrong,
            ['Match letters by position: 1st ↔ 1st, 2nd ↔ 2nd, 3rd ↔ 3rd.'],
            [`${L1[0]} ↔ ${L2[0]}, ${L1[1]} ↔ ${L2[1]}, ${L1[2]} ↔ ${L2[2]}`, `So ${ask} = ${ok} (CPCT).`],
            [['wrong', 'Use the order of letters in the congruence statement, not the alphabet.']]);
        }),
        tp('value', (r) => {
          const s = r.int(3, 12), a = r.int(30, 80), b = r.int(30, 140 - a);
          const k = r.int(0, 2);
          const q = [`EF`, `∠E`, `∠F`][k];
          const ans = [s, a, 180 - a - b][k];
          return typed(`△ABC ≅ △DEF. BC = ${s} cm, ∠B = ${a}° and ∠A = ${b}°. Find ${q}${k ? ' (in degrees)' : ' (in cm)'}.`, num(ans, k ? '°' : 'cm'),
            ['A ↔ D, B ↔ E, C ↔ F.', k === 2 ? 'Find ∠C first using the angle sum.' : 'Use CPCT.'],
            [k === 0 ? `EF = BC = ${s} cm` : k === 1 ? `∠E = ∠B = ${a}°` : `∠C = 180° − ${a}° − ${b}° = ${180 - a - b}°, so ∠F = ${180 - a - b}°`]);
        }),
        tp('criterion', (r) => {
          const S: [string, string][] = [
            ['AB = PQ, ∠B = ∠Q, BC = QR', 'SAS'], ['∠A = ∠P, AB = PQ, ∠B = ∠Q', 'ASA'], ['∠A = ∠P, ∠B = ∠Q, BC = QR', 'AAS'],
            ['AC = PR, ∠C = ∠R, BC = QR', 'SAS'], ['∠B = ∠Q, BC = QR, ∠C = ∠R', 'ASA'], ['∠B = ∠Q, ∠C = ∠R, AB = PQ', 'AAS'],
          ];
          const [g, ok] = r.pick(S);
          return mcq(r, `In △ABC and △PQR: ${g}. Which rule shows △ABC ≅ △PQR?`, ok, ['SAS', 'ASA', 'AAS', 'AAA'].filter((x) => x !== ok),
            ['Is the angle between the two sides (SAS)?', 'Is the side between the two angles (ASA) or not (AAS)?'],
            [`Given: ${g} → ${ok}`], [['wrong', 'Check whether the given side lies between the given angles, or the given angle between the given sides.']]);
        }, 2),
        bank('facts', [
          { q: 'Which is NOT a congruence rule?', a: 'AAA', w: ['SAS', 'ASA', 'SSS'], h: ['Think of a small and a large equilateral triangle.'], s: ['Equal angles give the same shape but not necessarily the same size.'] },
          { q: 'In SAS, the angle must be:', a: 'included between the two sides', w: ['opposite the longer side', 'a right angle', 'any angle of the triangle'], h: ['The angle formed BY the two sides.'], s: ['The angle has to be between the two given sides.'] },
          { q: 'CPCT stands for:', a: 'Corresponding parts of congruent triangles', w: ['Common parts of congruent triangles', 'Congruent parts can touch', 'Corresponding points of circle tangents'], h: ['It lets us use equal parts after proving congruence.'], s: ['Corresponding parts of congruent triangles are equal.'] },
          { q: 'Two triangles are congruent. Their areas are:', a: 'equal', w: ['in ratio 2 : 1', 'different', 'equal only if they are right triangles'], h: ['One fits exactly on the other.'], s: ['Congruent figures cover the same region, so the areas are equal.'] },
          { q: 'If △ABC ≅ △FED, then BC equals:', a: 'ED', w: ['FE', 'DF', 'EF only if isosceles'], h: ['B ↔ E, C ↔ D.'], s: ['BC ↔ ED'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.tri.isosceles', title: 'Properties of isosceles triangles', prereqs: ['ts9.m.tri.congruence'],
      intro: [
        h('Two equal sides, two equal angles'),
        p('The gable end of many village houses in Telangana is an isosceles triangle: the two sloping sides are the same length. The two roof angles at the bottom always come out equal. Here is why.'),
        stepsB('In △ABC let AB = AC. Draw the bisector AD of ∠A to meet BC at D.', 'In △BAD and △CAD: AB = AC, ∠BAD = ∠CAD, AD = AD.', 'So △BAD ≅ △CAD (SAS).', 'Therefore ∠B = ∠C (CPCT).'),
        keys('Angles opposite equal sides are equal.', 'Conversely, sides opposite equal angles are equal.', 'The bisector of the vertex angle is also the perpendicular bisector of the base.', 'In an equilateral triangle each angle is 60°.'),
        f('base angle = (180° − apex angle) / 2', 'each base angle equals 180 minus the apex angle, over 2'),
        X({
          title: 'What if? Open the top of an isosceles triangle', formula: 'b = (180° − A)/2',
          result: ['b', 'Each base angle', '(180 - A) / 2', '°', 1],
          vars: [['A', 'Apex angle (between the equal sides)', 10, 170, 1, 40, '°']],
          notes: [['A', 'A wider apex leaves less for the two base angles: each drops by half the increase.', 'A sharper apex leaves more: the base angles get closer to 90°.']],
          mistakes: [
            ['Base angle = 180° − apex', 'There are TWO equal base angles sharing what is left, so divide by 2.'],
            ['Assuming the given angle is the apex', 'Read carefully: if a base angle is given, the apex is 180° − 2 × base.'],
          ],
          real: 'A roof with a 120° apex has base angles of 30° each — a gentle slope; a 60° apex makes an equilateral, steep roof.',
        }),
        remember('The equal angles are opposite the equal SIDES, at the ends of the base.'),
        tip('If the base angle is b, the apex is 180° − 2b.'),
      ],
      examples: [
        ex('In △PQR, PQ = PR and ∠P = 50°. Find ∠Q and ∠R.', ['∠Q = ∠R', '2∠Q = 180° − 50° = 130°'], '65° each'),
        ex('In an isosceles triangle, a base angle is 70°. Find the apex angle.', ['180° − 2 × 70°'], '40°'),
      ],
      practice: [
        tp('base', (r) => {
          const A = 2 * r.int(5, 85);
          return typed(`In △ABC, AB = AC and ∠A = ${A}°. Find ∠B.`, num((180 - A) / 2, '°'),
            ['∠B = ∠C because AB = AC.', `∠B + ∠C = 180° − ${A}°`],
            [`∠B + ∠C = ${180 - A}°`, `∠B = ${(180 - A) / 2}°`],
            [[String(180 - A), 'That is the sum of the two base angles. Halve it.']]);
        }),
        tp('apex', (r) => {
          const b = r.int(20, 85);
          return typed(`An isosceles triangle has base angles of ${b}° each. Find the third angle.`, num(180 - 2 * b, '°'),
            ['The two base angles are equal.'], [`180° − 2 × ${b}° = ${180 - 2 * b}°`], [[String(180 - b), 'Subtract BOTH base angles.']]);
        }),
        tp('ext', (r) => {
          const b = r.int(25, 80);
          return typed(`In △PQR, PQ = PR. QR is extended to S. ∠PQR = ${b}°. Find the exterior angle ∠PRS.`, num(180 - b, '°'),
            ['∠PRQ = ∠PQR (equal sides).', '∠PRS and ∠PRQ form a linear pair.'],
            [`∠PRQ = ${b}°`, `∠PRS = 180° − ${b}° = ${180 - b}°`]);
        }),
        tp('algebra', (r) => {
          const x = r.int(8, 25), m = r.int(2, 4), c = r.int(1, (m - 1) * x - 1);
          const side = m * x - c;
          return typed(`In △ABC, ∠B = ∠C, AB = (${m}x − ${c}) cm and AC = (x + ${side - x}) cm. Find x.`, num(x),
            ['Sides opposite equal angles are equal.', 'AC is opposite ∠B and AB is opposite ∠C.'],
            [`${m}x − ${c} = x + ${side - x}`, `${m - 1}x = ${side - x + c}`, `x = ${x}`]);
        }, 2),
        bank('facts', [
          { q: 'Each angle of an equilateral triangle is:', a: '60°', w: ['45°', '90°', '30°'], h: ['All three angles are equal.'], s: ['180° ÷ 3 = 60°'] },
          { q: 'In a right isosceles triangle, the two acute angles are:', a: '45° each', w: ['30° and 60°', '60° each', '90° each'], h: ['They are equal and add to 90°.'], s: ['90° ÷ 2 = 45°'] },
          { q: 'If two angles of a triangle are equal, then:', a: 'the sides opposite them are equal', w: ['the triangle is right-angled', 'all sides are equal', 'the third angle is 90°'], h: ['Converse of the isosceles theorem.'], s: ['Sides opposite equal angles are equal.'] },
          { q: 'The angle bisector of the apex of an isosceles triangle meets the base:', a: 'at its mid-point, at right angles', w: ['at one end', 'at 45°', 'outside the triangle'], h: ['Use SAS on the two halves.'], s: ['By CPCT, BD = DC and ∠ADB = ∠ADC = 90°.'] },
          { q: 'Can an isosceles triangle have a base angle of 95°?', a: 'No — two such angles would exceed 180°', w: ['Yes', 'Only if equilateral', 'Only if the apex is 0°'], h: ['There are two equal base angles.'], s: ['2 × 95° = 190° > 180°'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.tri.criteria', title: 'More congruence criteria: SSS and RHS', prereqs: ['ts9.m.tri.congruence'],
      intro: [
        h('Three sticks make one triangle'),
        p('Give three friends identical sets of three sticks — 5 cm, 6 cm and 7 cm. Each makes a triangle, and all three triangles are exactly the same. Three sides fix a triangle. That is why bridges and electricity towers are built from triangles: a triangle cannot change shape.'),
        keys('SSS: three sides of one triangle equal to the three sides of another → congruent.', 'RHS: in two RIGHT triangles, if the hypotenuse and one side are equal → congruent.'),
        p('RHS is special to right triangles: the right angle is not between the two given sides, yet congruence still holds, because Pythagoras then fixes the third side as well.'),
        f('third side of a right triangle = √(hypotenuse² − side²)', 'the third side equals the square root of hypotenuse squared minus side squared'),
        X({
          title: 'What if? Fix the hypotenuse and one side', formula: 'c = √(h² − s²)',
          result: ['c', 'Remaining side', 'sqrt(h^2 - s^2)', 'cm', 2],
          vars: [['h', 'Hypotenuse', 10, 20, 1, 13, 'cm'], ['s', 'Known side', 1, 9, 1, 5, 'cm']],
          notes: [
            ['h', 'A longer hypotenuse with the same side makes the other side longer.', 'A shorter hypotenuse makes the other side shorter.'],
            ['s', 'A longer known side leaves less for the other side.', 'A shorter known side leaves more for the other side.'],
          ],
          mistakes: [
            ['Using RHS for triangles that are not right-angled', 'RHS needs a right angle in BOTH triangles.'],
            ['Calling any side the hypotenuse', 'The hypotenuse is the side opposite the right angle — the longest side.'],
          ],
          real: 'Because the remaining side is fixed, two ladders of the same length placed the same distance from a wall reach the same height.',
        }),
        remember('Rules that work: SAS, ASA, AAS, SSS, RHS. Rules that do not: AAA, SSA.'),
        tip('In a figure, a shared side counts as a pair of equal sides (common side).'),
      ],
      examples: [
        ex('In △ABC and △DBC (on the same base BC), AB = DB and AC = DC. Are they congruent?', ['AB = DB, AC = DC, BC = BC (common)'], 'Yes, by SSS'),
        ex('AD is the altitude of isosceles △ABC with AB = AC. Prove BD = CD.', ['△ABD and △ACD are right triangles.', 'Hypotenuse AB = AC, side AD common.', 'So △ABD ≅ △ACD (RHS).'], 'BD = CD by CPCT'),
      ],
      practice: [
        tp('criterion', (r) => {
          const S: [string, string][] = [
            ['AB = PQ, BC = QR, CA = RP', 'SSS'], ['∠B = ∠Q = 90°, hypotenuse AC = PR, AB = PQ', 'RHS'], ['AB = PQ, ∠A = ∠P, AC = PR', 'SAS'],
            ['∠A = ∠P, AB = PQ, ∠B = ∠Q', 'ASA'], ['∠C = ∠R = 90°, AB = PQ, BC = QR', 'RHS'], ['BC = QR, AC = PR, AB = PQ', 'SSS'], ['∠A = ∠P, ∠C = ∠R, AB = PQ', 'AAS'],
          ];
          const [g, ok] = r.pick(S);
          return mcq(r, `In △ABC and △PQR: ${g}. Which rule shows they are congruent?`, ok, ['SSS', 'SAS', 'ASA', 'RHS', 'AAS'].filter((x) => x !== ok).slice(0, 3),
            ['Count sides and angles given.', 'A right angle with hypotenuse and a side → RHS.'], [`${g} → ${ok}`]);
        }),
        tp('rhs', (r) => {
          const T = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
          const k = r.int(0, 1);
          return typed(`△ABC and △PQR are right-angled at B and Q. Hypotenuse AC = PR = ${T[2]} cm and AB = PQ = ${T[k]} cm. Find QR.`, num(T[1 - k], 'cm'),
            ['The triangles are congruent by RHS, so QR = BC.', 'Use Pythagoras: BC² = AC² − AB².'],
            [`BC² = ${T[2]}² − ${T[k]}² = ${T[2] ** 2 - T[k] ** 2}`, `BC = ${T[1 - k]} cm, so QR = ${T[1 - k]} cm (CPCT)`],
            [[String(T[2] - T[k]), 'Subtract the SQUARES, then take the square root.']]);
        }, 2),
        tp('possible', (r) => {
          const S: [string, boolean, string][] = [
            ['two triangles have all three angles equal (60°, 60°, 60°)', false, 'AAA fixes only the shape, not the size.'],
            ['two triangles have sides 4, 5, 6 cm each', true, 'SSS'],
            ['two triangles have AB = PQ, BC = QR and ∠C = ∠R', false, 'SSA (angle not included) is not a rule.'],
            ['two right triangles have equal hypotenuses and one equal side', true, 'RHS'],
            ['two triangles have two equal sides and the included angle equal', true, 'SAS'],
            ['two triangles have equal perimeters', false, 'Many different triangles have the same perimeter.'],
            ['two triangles have equal areas', false, 'A 3–4–5 triangle and a triangle with base 12, height 1 both have area 6.'],
          ];
          const [g, ok, why] = r.pick(S);
          return mcq(r, `Must the triangles be congruent if ${g}?`, ok ? `Yes — ${why}` : 'Not necessarily', ok ? ['Not necessarily'] : [`Yes — ${r.pick(['SSS', 'SAS', 'AAA'])}`],
            ['Valid rules: SSS, SAS, ASA, AAS, RHS.'], [ok ? `Yes, by ${why}.` : `No: ${why}`]);
        }),
        bank('facts', [
          { q: 'Why are triangles used in bridges and towers?', a: 'Three fixed sides fix the shape (SSS)', w: ['Triangles are the cheapest shape', 'Triangles have the largest area', 'Triangles have four corners'], h: ['A square frame can be squashed; a triangle cannot.'], s: ['By SSS, three given sides fix exactly one triangle shape.'] },
          { q: 'RHS congruence applies only to:', a: 'right-angled triangles', w: ['equilateral triangles', 'all triangles', 'obtuse triangles'], h: ['R stands for Right angle.'], s: ['RHS needs a right angle in each triangle.'] },
          { q: 'In RHS, H stands for:', a: 'hypotenuse', w: ['height', 'half', 'horizontal side'], h: ['The side opposite the right angle.'], s: ['Right angle, Hypotenuse, Side.'] },
          { q: 'Which pair of facts is NOT enough for congruence?', a: 'Two sides and a non-included angle', w: ['Three sides', 'Two angles and the included side', 'Two sides and the included angle'], h: ['SSA is the ambiguous case.'], s: ['SSA does not guarantee congruence.'] },
          { q: 'A side shared by two triangles in a figure is called the:', a: 'common side', w: ['hypotenuse', 'base angle', 'median'], h: ['It belongs to both.'], s: ['A shared side is equal to itself in both triangles.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.tri.inequal', title: 'Inequalities in a triangle', prereqs: ['ts9.m.tri.criteria'],
      intro: [
        h('The longest side faces the largest angle'),
        p('Walking from Charminar to Golconda directly is shorter than going via any third place off the straight road. In any triangle, going along two sides is longer than going straight along the third side.'),
        keys('In a triangle, the angle opposite the longer side is larger.', 'The side opposite the larger angle is longer.', 'Triangle inequality: the sum of any two sides is greater than the third side.', 'Hence the third side lies strictly between the difference and the sum of the other two sides.'),
        f('|a − b| < c < a + b', 'c lies between a minus b and a plus b'),
        X({
          title: 'What if? Two sides are fixed — how long can the third be?', formula: 'c_max (not reached) = a + b; c_min (not reached) = |a − b|',
          result: ['w', 'Width of the allowed range for c', '(a + b) - abs(a - b)', 'cm'],
          vars: [['a', 'Side a', 1, 15, 1, 7, 'cm'], ['b', 'Side b', 1, 15, 1, 4, 'cm']],
          notes: [
            ['a', 'While a < b, a longer a widens the range; once a ≥ b it no longer changes, because the range width is twice the shorter side.', 'Shortening the shorter side narrows the range.'],
            ['b', 'The range width is always 2 × (shorter side).', 'If one side becomes very short, the third side must be almost equal to the other side.'],
          ],
          mistakes: [
            ['Accepting c = a + b', 'Then the "triangle" is flat — the three points are on one line. The inequality is strict.'],
            ['Checking only one pair of sides', 'You must check the two SHORTER sides add to more than the longest.'],
          ],
          real: 'Sticks of 3 cm, 4 cm and 8 cm cannot make a triangle: 3 + 4 = 7 is less than 8.',
        }),
        remember('The hypotenuse is the longest side of a right triangle because it faces the largest angle (90°).'),
        tip('Quick test: add the two smaller sides. If the sum is bigger than the largest side, a triangle is possible.'),
      ],
      examples: [
        ex('Can 4 cm, 5 cm and 10 cm be the sides of a triangle?', ['4 + 5 = 9', '9 < 10'], 'No'),
        ex('In △ABC, ∠A = 50°, ∠B = 60°. Which side is longest?', ['∠C = 70° is the largest angle.', 'The side opposite ∠C is AB.'], 'AB'),
        ex('Two sides of a triangle are 6 cm and 9 cm. Between what values does the third side lie?', ['9 − 6 = 3, 9 + 6 = 15'], 'Between 3 cm and 15 cm'),
      ],
      practice: [
        tp('possible', (r) => {
          const a = r.int(2, 12), b = r.int(2, 12);
          const c = r.next() < 0.5 ? r.int(Math.abs(a - b) + 1, a + b - 1) : r.pick([a + b, a + b + r.int(1, 4)]);
          const [x, y, z] = [a, b, c].sort((p1, q1) => p1 - q1);
          const ok = x + y > z;
          return mcq(r, `Can ${a} cm, ${b} cm and ${c} cm be the sides of a triangle?`, ok ? `Yes, ${x} + ${y} = ${x + y} > ${z}` : `No, ${x} + ${y} = ${x + y} is not greater than ${z}`, [ok ? `No, ${x} + ${y} = ${x + y} is not greater than ${z}` : `Yes, ${x} + ${y} = ${x + y} > ${z}`, `Yes, any three lengths make a triangle`],
            ['Add the two smaller lengths.', 'The sum must be strictly greater than the largest.'], [`${x} + ${y} = ${x + y} ${ok ? '>' : '≤'} ${z}`, ok ? 'A triangle is possible.' : 'No triangle is possible.']);
        }),
        tp('range', (r) => {
          const a = r.int(3, 15), b = r.int(3, 15);
          const low = r.next() < 0.5;
          return typed(`Two sides of a triangle are ${a} cm and ${b} cm. The third side must be greater than ___ cm${low ? '' : ' and less than ___ cm. Enter the upper limit'}.${low ? ' Enter the lower limit.' : ''}`, num(low ? Math.abs(a - b) : a + b, 'cm'),
            ['The third side is between the difference and the sum of the other two.'], [`${Math.abs(a - b)} < third side < ${a + b}`],
            [[String(low ? a + b : Math.abs(a - b)), low ? 'That is the upper limit.' : 'That is the lower limit.']]);
        }),
        tp('longest', (r) => {
          let A = r.int(30, 90), B = r.int(20, 150 - A), C = 180 - A - B;
          while (A === B || B === C || A === C) { A = r.int(30, 90); B = r.int(20, 150 - A); C = 180 - A - B; }
          const big = Math.max(A, B, C);
          const ans = big === A ? 'QR' : big === B ? 'PR' : 'PQ';
          return mcq(r, `In △PQR, ∠P = ${A}°, ∠Q = ${B}°, ∠R = ${C}°. Which side is the longest?`, ans, ['QR', 'PR', 'PQ'].filter((s2) => s2 !== ans),
            ['The longest side is opposite the largest angle.', 'Side QR is opposite ∠P, PR is opposite ∠Q, PQ is opposite ∠R.'],
            [`Largest angle = ${big}°`, `The side opposite it is ${ans}.`]);
        }),
        bank('facts', [
          { q: 'In a right triangle, the longest side is:', a: 'the hypotenuse', w: ['the base', 'the perpendicular', 'any side'], h: ['It faces the 90° angle.'], s: ['The largest angle (90°) faces the longest side.'] },
          { q: 'In △ABC, AB = 5, BC = 7, CA = 6. The largest angle is:', a: '∠A', w: ['∠B', '∠C', 'all equal'], h: ['Largest angle faces longest side BC.'], s: ['BC = 7 is longest; it is opposite ∠A.'] },
          { q: 'The sum of any two sides of a triangle is:', a: 'greater than the third side', w: ['equal to the third side', 'less than the third side', 'equal to the perimeter'], h: ['Straight is shortest.'], s: ['Triangle inequality.'] },
          { q: 'In △PQR, ∠Q > ∠R. Then:', a: 'PR > PQ', w: ['PQ > PR', 'PQ = PR', 'QR is the shortest'], h: ['Larger angle faces longer side.'], s: ['PR faces ∠Q; PQ faces ∠R.'] },
          { q: 'Of all segments from a point to a line, the shortest is:', a: 'the perpendicular', w: ['the longest slanting one', 'the one at 45°', 'all are equal'], h: ['The perpendicular faces the 90° angle in each right triangle.'], s: ['The perpendicular is the shortest distance.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 8 QUADRILATERALS
const ch8: USpec = {
  id: 'ts9.m.ch8', subject: 'math', title: 'Quadrilaterals', source: src(8),
  objectives: [
    {
      id: 'ts9.m.quad.types', title: 'Properties and types of quadrilaterals', prereqs: ['ts9.m.lines.trisum'],
      intro: [
        h('Four sides, many shapes'),
        p('A school notebook, a kite at Sankranti, a slice of a Bathukamma flower stack seen from the side, a rhombus tile — all are quadrilaterals: closed figures with four sides and four angles.'),
        p('Draw a diagonal and the quadrilateral splits into two triangles. Each has angle sum 180°, so the four angles of any quadrilateral add to 2 × 180° = 360°.'),
        keys('Trapezium: one pair of opposite sides parallel.', 'Parallelogram: both pairs of opposite sides parallel.', 'Rectangle: parallelogram with each angle 90°.', 'Rhombus: parallelogram with all sides equal.', 'Square: rectangle with all sides equal (also a rhombus).', 'Kite: two pairs of equal ADJACENT sides.'),
        f('∠A + ∠B + ∠C + ∠D = 360°', 'the four angles of a quadrilateral add to 360 degrees'),
        X({
          title: 'What if? Change three angles of a quadrilateral', formula: '∠D = 360° − ∠A − ∠B − ∠C',
          result: ['D', 'Fourth angle', '360 - A - B - C', '°'],
          vars: [['A', 'Angle A', 30, 150, 1, 80, '°'], ['B', 'Angle B', 30, 150, 1, 100, '°'], ['C', 'Angle C', 30, 150, 1, 90, '°']],
          notes: [
            ['A', 'Opening ∠A must close ∠D by the same amount.', 'Closing ∠A opens ∠D.'],
            ['C', 'Opening ∠C must close ∠D by the same amount.', 'Closing ∠C opens ∠D.'],
          ],
          mistakes: [
            ['Using 180° as the angle sum', 'That is for a triangle. A quadrilateral is two triangles: 360°.'],
            ['Thinking a square is not a rectangle', 'A square has all the properties of a rectangle (and more), so every square IS a rectangle.'],
          ],
          real: 'A carpenter making a door frame checks all four corners: if three are 90°, the fourth must be 90° too.',
        }),
        remember('Square ⊂ rectangle ⊂ parallelogram ⊂ trapezium-family; square ⊂ rhombus ⊂ parallelogram.'),
        tip('If angles are given as a ratio, write them as ak, bk, ck, dk and use (a + b + c + d)k = 360°.'),
      ],
      examples: [
        ex('Three angles of a quadrilateral are 75°, 90° and 75°. Find the fourth.', ['360° − 240°'], '120°'),
        ex('The angles of a quadrilateral are in the ratio 3 : 5 : 9 : 13. Find them.', ['30k = 360°, k = 12°'], '36°, 60°, 108°, 156°'),
      ],
      practice: [
        tp('fourth', (r) => {
          const a = r.int(50, 130), b = r.int(50, 130), c = r.int(40, Math.min(150, 330 - a - b));
          return typed(`Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. Find the fourth angle.`, num(360 - a - b - c, '°'),
            ['The four angles add to 360°.'], [`360° − ${a}° − ${b}° − ${c}° = ${360 - a - b - c}°`], [[String(180 - a - b - c), 'Use 360°, not 180°.']]);
        }),
        tp('ratio', (r) => {
          const R = r.pick([[1, 2, 3, 4], [3, 5, 9, 13], [2, 3, 3, 4], [1, 1, 2, 2], [4, 5, 4, 5], [2, 3, 5, 8], [1, 3, 5, 9]]);
          const s = R.reduce((p1, q1) => p1 + q1, 0), k = 360 / s;
          return typed(`The angles of a quadrilateral are in the ratio ${R.join(' : ')}. Find the LARGEST angle.`, num(Math.max(...R) * k, '°'),
            [`The parts add to ${s}.`, `${s}k = 360°`], [`k = ${k}°`, `Largest = ${Math.max(...R)} × ${k}° = ${Math.max(...R) * k}°`]);
        }, 2),
        matchT('match', 'Match each quadrilateral with a property that describes it', [
          ['trapezium', 'exactly one pair of opposite sides parallel'], ['rectangle', 'parallelogram with a right angle'], ['rhombus', 'parallelogram with all sides equal'],
          ['square', 'rhombus with a right angle'], ['kite', 'two pairs of equal adjacent sides'], ['parallelogram', 'both pairs of opposite sides parallel'],
        ], ['Start with the most special one, the square.']),
        bank('facts', [
          { q: 'Which statement is TRUE?', a: 'Every square is a rhombus.', w: ['Every rhombus is a square.', 'Every rectangle is a square.', 'Every trapezium is a parallelogram.'], h: ['A square has all sides equal.'], s: ['A square is a rhombus with right angles.'] },
          { q: 'Can a quadrilateral have angles 90°, 90°, 90° and 100°?', a: 'No, they add to 370°', w: ['Yes', 'Yes, if it is a trapezium', 'Only if it is a kite'], h: ['Add them.'], s: ['The sum must be 360°.'] },
          { q: 'A quadrilateral with all four angles equal has each angle:', a: '90°', w: ['60°', '120°', '45°'], h: ['360° ÷ 4'], s: ['360° ÷ 4 = 90°'] },
          { q: 'A diagonal divides a quadrilateral into:', a: 'two triangles', w: ['two rectangles', 'four triangles', 'two quadrilaterals'], h: ['Join opposite corners.'], s: ['One diagonal makes two triangles.'] },
          { q: 'A rectangle that is also a rhombus is a:', a: 'square', w: ['kite', 'trapezium', 'parallelogram that is not a square'], h: ['Right angles and equal sides.'], s: ['It must be a square.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.quad.parallelogram', title: 'Parallelograms and their properties', prereqs: ['ts9.m.quad.types', 'ts9.m.lines.parallel'],
      intro: [
        h('Why opposite sides of a parallelogram are equal'),
        p('Lift a folding gate at a shop in Sircilla: every small cell stays a parallelogram as it squeezes, and opposite sides always stay equal.'),
        stepsB('Draw diagonal AC of parallelogram ABCD.', 'AB ∥ DC gives ∠BAC = ∠DCA (alternate angles); AD ∥ BC gives ∠BCA = ∠DAC.', 'AC is common, so △ABC ≅ △CDA (ASA).', 'By CPCT: AB = CD, BC = DA and ∠B = ∠D.'),
        keys('A diagonal divides a parallelogram into two congruent triangles.', 'Opposite sides are equal.', 'Opposite angles are equal.', 'Adjacent angles are supplementary (they are co-interior angles).', 'Conversely, a quadrilateral with both pairs of opposite sides equal, or one pair equal AND parallel, is a parallelogram.'),
        f('adjacent angle = 180° − x;  perimeter = 2(a + b)', 'adjacent angles add to 180; perimeter is twice a plus b'),
        X({
          title: 'What if? Push a parallelogram over', formula: 'adjacent angle y = 180° − x',
          result: ['y', 'Adjacent angle', '180 - x', '°'],
          vars: [['x', 'One angle of the parallelogram', 10, 170, 1, 60, '°']],
          notes: [['x', 'As one angle opens, the angles next to it close by the same amount; the opposite angle opens with it.', 'As one angle closes, its neighbours open.']],
          mistakes: [
            ['Making adjacent angles equal', 'Opposite angles are equal; ADJACENT angles add to 180°.'],
            ['Perimeter = a + b', 'There are two sides of each length: 2(a + b).'],
          ],
          real: 'With x = 90° the parallelogram becomes a rectangle — that is how a folding gate looks when fully opened.',
        }),
        remember('Opposite → equal. Adjacent → add to 180°.'),
        tip('If one angle of a parallelogram is known, all four are known: x, 180° − x, x, 180° − x.'),
      ],
      examples: [
        ex('One angle of a parallelogram is 70°. Find the other three.', ['Opposite angle: 70°', 'Adjacent angles: 180° − 70° = 110°'], '110°, 70°, 110°'),
        ex('Adjacent sides of a parallelogram are 8 cm and 5 cm. Find the perimeter.', ['2(8 + 5)'], '26 cm'),
      ],
      practice: [
        tp('angles', (r) => {
          const x = r.int(35, 145);
          const opp = r.next() < 0.5;
          return typed(`In parallelogram ABCD, ∠A = ${x}°. Find ${opp ? '∠C' : '∠B'}.`, num(opp ? x : 180 - x, '°'),
            ['∠A and ∠C are opposite; ∠A and ∠B are adjacent.', 'Opposite angles are equal; adjacent angles add to 180°.'],
            [opp ? `∠C = ∠A = ${x}°` : `∠B = 180° − ${x}° = ${180 - x}°`],
            [[String(opp ? 180 - x : x), opp ? 'Opposite angles are EQUAL.' : 'Adjacent angles are supplementary.']]);
        }),
        tp('ratio', (r) => {
          const [a, b] = r.pick([[1, 2], [2, 3], [1, 4], [3, 7], [4, 5], [1, 5], [7, 11]]);
          const k = 180 / (a + b);
          return typed(`Two adjacent angles of a parallelogram are in the ratio ${a} : ${b}. Find the SMALLER angle.`, num(a * k, '°'),
            ['Adjacent angles add to 180°.', `${a}k + ${b}k = 180°`], [`k = ${k}°`, `Smaller = ${a * k}°`]);
        }),
        tp('perimeter', (r) => {
          const a = r.int(3, 20), b = r.int(2, 15);
          const findP = r.next() < 0.5;
          return findP
            ? typed(`Two adjacent sides of a parallelogram are ${a} cm and ${b} cm. Find its perimeter.`, num(2 * (a + b), 'cm'), ['Opposite sides are equal.', 'Perimeter = 2(a + b).'], [`2(${a} + ${b}) = ${2 * (a + b)} cm`], [[String(a + b), 'Count all four sides.']])
            : typed(`The perimeter of a parallelogram is ${2 * (a + b)} cm and one side is ${a} cm. Find the adjacent side.`, num(b, 'cm'), ['Half the perimeter = a + b.'], [`a + b = ${a + b}`, `b = ${a + b} − ${a} = ${b} cm`], [[String(2 * (a + b) - a), 'First halve the perimeter.']]);
        }),
        tp('algebra', (r) => {
          const x = r.int(10, 30), m = r.int(2, 4), c = r.int(1, (m - 1) * x - 1);
          const d = m * x - c - x;
          return typed(`In parallelogram PQRS, ∠P = (${m}x − ${c})° and ∠R = (x + ${d})°. Find x.`, num(x),
            ['∠P and ∠R are opposite angles.', 'Opposite angles are equal.'], [`${m}x − ${c} = x + ${d}`, `${m - 1}x = ${d + c}`, `x = ${x}`]);
        }, 2),
        bank('facts', [
          { q: 'A diagonal of a parallelogram divides it into two:', a: 'congruent triangles', w: ['right triangles', 'equilateral triangles', 'parallelograms'], h: ['Use ASA.'], s: ['The two triangles are congruent by ASA.'] },
          { q: 'If one angle of a parallelogram is 90°, then it is a:', a: 'rectangle', w: ['rhombus that is not a square', 'kite', 'trapezium that is not a parallelogram'], h: ['All angles become 90°.'], s: ['Adjacent angles become 90° too, so all four are right angles.'] },
          { q: 'A quadrilateral with one pair of opposite sides equal and parallel is a:', a: 'parallelogram', w: ['kite', 'trapezium only', 'rhombus always'], h: ['Prove the other pair parallel with congruent triangles.'], s: ['It must be a parallelogram.'] },
          { q: 'Can a parallelogram have angles 70°, 110°, 80°, 100°?', a: 'No, opposite angles must be equal', w: ['Yes', 'Yes, they add to 360°', 'Only if it is a rhombus'], h: ['Opposite angles of a parallelogram are equal.'], s: ['The angles must be x, 180° − x, x, 180° − x.'] },
          { q: 'The bisectors of two adjacent angles of a parallelogram meet at:', a: '90°', w: ['180°', '45°', '60°'], h: ['Half of 180°, then the triangle angle sum.'], s: ['The two halves add to 90°, so the third angle is 90°.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.quad.diagonals', title: 'Diagonals of a parallelogram', prereqs: ['ts9.m.quad.parallelogram'],
      intro: [
        h('Where the diagonals cross'),
        p('Stretch two strings across a parallelogram-shaped garden bed corner to corner. They always cross exactly at each other\'s middle. This is a key property.'),
        def('Diagonals of a parallelogram', 'The diagonals bisect each other: if they meet at O, then OA = OC and OB = OD.'),
        p('Proof sketch: △AOB ≅ △COD by ASA (AB = CD, and the alternate angles at A, C and at B, D are equal). So OA = OC and OB = OD by CPCT. Conversely, if the diagonals of a quadrilateral bisect each other, it is a parallelogram.'),
        keys('Parallelogram: diagonals bisect each other.', 'Rectangle: diagonals are also EQUAL.', 'Rhombus: diagonals are also PERPENDICULAR.', 'Square: diagonals are equal AND perpendicular.'),
        p('Because a rhombus has perpendicular diagonals that bisect each other, each side is the hypotenuse of a right triangle whose legs are half the diagonals.'),
        f('rhombus side = √((d₁/2)² + (d₂/2)²)', 'the side equals the square root of half d1 squared plus half d2 squared'),
        X({
          title: 'What if? Change the diagonals of a rhombus', formula: 's = √((d₁/2)² + (d₂/2)²)',
          result: ['s', 'Side of the rhombus', 'sqrt((d1/2)^2 + (d2/2)^2)', 'cm', 2],
          vars: [['d1', 'Diagonal d₁', 2, 30, 2, 16, 'cm'], ['d2', 'Diagonal d₂', 2, 30, 2, 12, 'cm']],
          notes: [
            ['d1', 'A longer diagonal stretches the rhombus, so each side gets longer.', 'A shorter diagonal makes the sides shorter.'],
            ['d2', 'A longer second diagonal also lengthens every side.', 'If one diagonal is tiny, the side is about half the other diagonal.'],
          ],
          mistakes: [
            ['Using the full diagonals as the legs', 'The diagonals BISECT each other, so the legs are HALF of each diagonal.'],
            ['Assuming parallelogram diagonals are equal', 'Only rectangles (and squares) have equal diagonals.'],
          ],
          real: 'A rhombus-shaped kite with sticks of 16 cm and 12 cm has sides √(8² + 6²) = 10 cm.',
        }),
        remember('Diagonals bisect each other ⇔ parallelogram.'),
        tip('In a rectangle, the diagonal is √(l² + b²) and both diagonals are this length.'),
      ],
      examples: [
        ex('The diagonals of parallelogram ABCD meet at O. AC = 14 cm, BD = 10 cm. Find OA and OD.', ['OA = AC/2', 'OD = BD/2'], 'OA = 7 cm, OD = 5 cm'),
        ex('The diagonals of a rhombus are 24 cm and 10 cm. Find its side.', ['Half-diagonals: 12 and 5', '√(144 + 25) = √169'], '13 cm'),
      ],
      practice: [
        tp('half', (r) => {
          const d = 2 * r.int(3, 20);
          const [A, C, O] = r.pick([['A', 'C', 'OA'], ['B', 'D', 'OD'], ['A', 'C', 'OC'], ['B', 'D', 'OB']]);
          return typed(`The diagonals of parallelogram ABCD meet at O. If ${A}${C} = ${d} cm, find ${O}.`, num(d / 2, 'cm'),
            ['The diagonals bisect each other.'], [`${O} = ${A}${C} ÷ 2 = ${d / 2} cm`], [[String(d), 'O is the mid-point, so take half.']]);
        }),
        tp('rhombus', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]]);
          return typed(`The diagonals of a rhombus are ${2 * a} cm and ${2 * b} cm. Find the length of each side.`, num(c, 'cm'),
            ['The diagonals bisect each other at right angles.', `Half-diagonals: ${a} cm and ${b} cm.`],
            [`side = √(${a}² + ${b}²) = √${a * a + b * b} = ${c} cm`],
            [[String(rd(Math.sqrt(4 * a * a + 4 * b * b), 2)), 'Use HALF of each diagonal.']], { steps: [st('Half of the first diagonal?', num(a)), st('Side of the rhombus?', num(c))] });
        }, 2),
        tp('rect', (r) => {
          const [a, b, c] = r.pick([[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [3, 4, 5], [20, 21, 29]]);
          return typed(`A rectangle measures ${a} m by ${b} m. How long is each diagonal?`, num(c, 'm'),
            ['A diagonal splits the rectangle into two right triangles.', 'Diagonal² = length² + breadth².'],
            [`√(${a}² + ${b}²) = √${a * a + b * b} = ${c} m`], [[String(a + b), 'Use Pythagoras, not addition.']]);
        }),
        tp('algebra', (r) => {
          const x = r.int(2, 9), m = r.int(2, 4), c = r.int(1, 8);
          const d = m * x + c - x;
          return typed(`The diagonals of parallelogram ABCD meet at O. OA = (${m}x + ${c}) cm and OC = (x + ${d}) cm. Find x.`, num(x),
            ['The diagonals bisect each other, so OA = OC.'], [`${m}x + ${c} = x + ${d}`, `${m - 1}x = ${d - c}`, `x = ${x}`]);
        }, 2),
        bank('facts', [
          { q: 'The diagonals of a rectangle are:', a: 'equal and bisect each other', w: ['perpendicular always', 'unequal', 'not bisecting'], h: ['Use congruent triangles with the right angles.'], s: ['Rectangle diagonals are equal and bisect each other.'] },
          { q: 'The diagonals of a rhombus meet at:', a: '90°', w: ['60°', '45°', '120°'], h: ['All sides equal → use SSS on the four small triangles.'], s: ['They are perpendicular bisectors of each other.'] },
          { q: 'A quadrilateral whose diagonals bisect each other is a:', a: 'parallelogram', w: ['kite', 'trapezium only', 'square always'], h: ['Converse of the diagonal property.'], s: ['Diagonals bisecting each other ⇒ parallelogram.'] },
          { q: 'If the diagonals of a parallelogram are equal, it is a:', a: 'rectangle', w: ['rhombus', 'kite', 'trapezium'], h: ['Equal diagonals force right angles.'], s: ['A parallelogram with equal diagonals is a rectangle.'] },
          { q: 'The diagonals of a square are:', a: 'equal and perpendicular', w: ['equal but not perpendicular', 'perpendicular but unequal', 'neither'], h: ['A square is both a rectangle and a rhombus.'], s: ['It has both properties.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.quad.midpoint', title: 'The mid-point theorem', prereqs: ['ts9.m.quad.parallelogram'],
      intro: [
        h('Join two mid-points'),
        p('Take a triangular piece of paper. Mark the middle of two sides and join them. That segment is parallel to the third side and exactly half as long — every time.'),
        def('Mid-point theorem', 'The segment joining the mid-points of two sides of a triangle is parallel to the third side and half of it.'),
        def('Converse', 'A line through the mid-point of one side, parallel to another side, bisects the third side.'),
        p('Proof idea: in △ABC let E, F be mid-points of AB and AC. Extend EF to D with FD = EF. Then △AEF ≅ △CDF (SAS), which makes EBCD a parallelogram, so EF ∥ BC and ED = BC, i.e. EF = ½ BC.'),
        f('EF = ½ BC', 'E F equals half of B C'),
        X({
          title: 'What if? Change the third side', formula: 'EF = BC / 2',
          result: ['EF', 'Segment joining the mid-points', 'BC / 2', 'cm', 1],
          vars: [['BC', 'Third side BC', 2, 40, 1, 12, 'cm']],
          notes: [['BC', 'Double BC and the mid-point segment doubles too.', 'Halve BC and the mid-point segment halves.']],
          mistakes: [
            ['EF = BC', 'EF is only HALF of the third side.'],
            ['Using the theorem with points that are not mid-points', 'The halving works only when E and F are exact mid-points.'],
          ],
          real: 'A bridge truss maker can cut the middle brace of a triangle at half the base length, knowing it will be parallel to the base.',
        }),
        keys('Mid-point segment ∥ third side.', 'Mid-point segment = ½ third side.', 'Joining the three mid-points makes a triangle with half the perimeter and ¼ the area.', 'Joining mid-points of the sides of ANY quadrilateral gives a parallelogram.'),
        remember('The triangle formed by joining mid-points has each side half of the side it is parallel to.'),
        tip('When a problem mentions mid-points, look for a mid-point segment.'),
      ],
      examples: [
        ex('In △ABC, D and E are mid-points of AB and AC, and BC = 9 cm. Find DE.', ['DE = ½ BC'], '4.5 cm'),
        ex('The sides of a triangle are 6 cm, 8 cm and 10 cm. Find the perimeter of the triangle formed by joining the mid-points.', ['Sides: 3, 4, 5 cm'], '12 cm'),
      ],
      practice: [
        tp('half', (r) => {
          const bc = r.int(4, 30);
          const rev = r.next() < 0.4;
          return rev
            ? typed(`D and E are the mid-points of AB and AC of △ABC, and DE = ${bc} cm. Find BC.`, num(2 * bc, 'cm'), ['DE = ½ BC'], [`BC = 2 × ${bc} = ${2 * bc} cm`], [[String(bc / 2), 'DE is half of BC, so BC is double DE.']])
            : typed(`D and E are the mid-points of AB and AC of △ABC, and BC = ${bc} cm. Find DE.`, num(bc / 2, 'cm'), ['Mid-point theorem: DE = ½ BC.'], [`DE = ${bc} ÷ 2 = ${bc / 2} cm`], [[String(2 * bc), 'DE is HALF of BC.']]);
        }),
        tp('perimeter', (r) => {
          const a = r.int(4, 20), b = r.int(4, 20), c = r.int(Math.abs(a - b) + 1, a + b - 1);
          return typed(`The sides of a triangle are ${a} cm, ${b} cm and ${c} cm. Find the perimeter of the triangle formed by joining the mid-points of its sides.`, num((a + b + c) / 2, 'cm'),
            ['Each side of the new triangle is half a side of the old one.'], [`Perimeter = (${a} + ${b} + ${c}) ÷ 2 = ${(a + b + c) / 2} cm`], [[String(a + b + c), 'Halve the perimeter.']]);
        }),
        tp('area', (r) => {
          const A = 4 * r.int(3, 40);
          return typed(`A triangle has area ${A} cm². Joining the mid-points of its sides forms a smaller triangle. Find its area.`, num(A / 4, 'cm²'),
            ['The three mid-point segments cut the triangle into 4 congruent triangles.'], [`Area = ${A} ÷ 4 = ${A / 4} cm²`], [[String(A / 2), 'There are FOUR congruent small triangles, not two.']]);
        }, 2),
        bank('facts', [
          { q: 'The segment joining the mid-points of two sides of a triangle is:', a: 'parallel to the third side and half of it', w: ['perpendicular to the third side', 'equal to the third side', 'parallel to the third side and double it'], h: ['Mid-point theorem.'], s: ['It is parallel to the third side and half as long.'] },
          { q: 'A line through the mid-point of AB parallel to BC meets AC at:', a: 'the mid-point of AC', w: ['C', 'A point one-third along AC', 'nowhere'], h: ['Converse of the mid-point theorem.'], s: ['It bisects AC.'] },
          { q: 'Joining the mid-points of the sides of any quadrilateral, in order, gives a:', a: 'parallelogram', w: ['square always', 'trapezium only', 'kite'], h: ['Use the mid-point theorem on two triangles formed by a diagonal.'], s: ['Both pairs of opposite sides are parallel to a diagonal, so it is a parallelogram.'] },
          { q: 'Joining the mid-points of the sides of a rectangle gives a:', a: 'rhombus', w: ['rectangle', 'square always', 'kite that is not a rhombus'], h: ['The diagonals of a rectangle are equal.'], s: ['Each side is half a diagonal, and the diagonals are equal, so all sides are equal.'] },
          { q: 'Joining the mid-points of the sides of a rhombus gives a:', a: 'rectangle', w: ['rhombus', 'trapezium', 'kite'], h: ['The diagonals of a rhombus are perpendicular.'], s: ['The sides are parallel to perpendicular diagonals, so the angles are 90°.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9 STATISTICS
const ch9: USpec = {
  id: 'ts9.m.ch9', subject: 'math', title: 'Statistics', source: src(9),
  objectives: [
    {
      id: 'ts9.m.stat.data', title: 'Collecting and organising data',
      intro: [
        h('Facts that become information'),
        p('Your class teacher records the marks of 40 students; the Telangana weather office records daily rainfall in every mandal. Collected numbers or facts are called data. Statistics is the study of collecting, presenting and interpreting data.'),
        def('Primary data', 'Data you collect yourself for your purpose, e.g. you ask each classmate how they travel to school.'),
        def('Secondary data', 'Data collected by someone else that you use, e.g. census figures or a newspaper table.'),
        def('Range', 'Highest value − lowest value. It shows how spread out the data are.'),
        def('Frequency', 'The number of times a value (or values in a class) occurs.'),
        p('Large data are grouped into classes like 10–20, 20–30. The class size (width) is upper limit − lower limit. The value 20 belongs to 20–30, not 10–20 (exclusive method). The class mark is the middle of a class.'),
        f('class mark = (lower limit + upper limit) / 2', 'class mark equals lower plus upper limit over 2'),
        X({
          title: 'What if? Change a class interval', formula: 'class mark = (l + u)/2',
          result: ['m', 'Class mark', '(l + u) / 2', '', 1],
          vars: [['l', 'Lower limit', 0, 90, 5, 20], ['u', 'Upper limit', 10, 100, 5, 30]],
          notes: [
            ['l', 'Raising the lower limit moves the middle up by half as much.', 'Lowering it moves the middle down.'],
            ['u', 'Raising the upper limit moves the middle up by half as much.', 'Lowering it moves the middle down.'],
          ],
          mistakes: [
            ['Class mark = upper − lower', 'That is the class SIZE. The class mark is the average of the limits.'],
            ['Putting 20 in the class 10–20', 'In the exclusive method an upper limit belongs to the NEXT class.'],
          ],
          real: 'If Class 9 heights are grouped 140–150 cm, the class mark 145 cm stands for every student in that group.',
        }),
        keys('Primary data: collected by you. Secondary: from others.', 'Range = maximum − minimum.', 'Class size = upper limit − lower limit.', 'Use tally marks (𝍸 for five) to count frequencies.'),
        remember('The total of all frequencies equals the number of observations.'),
        tip('Sort raw data in ascending order before counting — it avoids missing values.'),
      ],
      examples: [
        ex('Find the range of 34, 21, 56, 45, 12, 38.', ['Max = 56, min = 12'], '44'),
        ex('Find the class size and class mark of 30–40.', ['Size = 40 − 30', 'Mark = (30 + 40)/2'], 'Size 10, mark 35'),
      ],
      practice: [
        tp('range', (r) => {
          const n = r.int(6, 9);
          const xs = Array.from({ length: n }, () => r.int(10, 99));
          const mx = Math.max(...xs), mn = Math.min(...xs);
          return typed(`Marks of ${n} students: ${xs.join(', ')}. Find the range.`, num(mx - mn),
            ['Range = highest − lowest.'], [`Highest = ${mx}, lowest = ${mn}`, `Range = ${mx - mn}`], [[String(mx), 'Subtract the lowest value.']]);
        }),
        tp('classmark', (r) => {
          const w = r.pick([5, 10, 20]), l = w * r.int(1, 10);
          const ask = r.next() < 0.5;
          return typed(`For the class interval ${l}–${l + w}, find the ${ask ? 'class mark' : 'class size'}.`, num(ask ? l + w / 2 : w),
            ['Class size = upper − lower.', 'Class mark = (lower + upper) ÷ 2.'],
            [ask ? `(${l} + ${l + w}) ÷ 2 = ${l + w / 2}` : `${l + w} − ${l} = ${w}`],
            [[String(ask ? w : l + w / 2), ask ? 'That is the class size.' : 'That is the class mark.']]);
        }),
        tp('count', (r) => {
          const xs = Array.from({ length: 15 }, () => r.int(1, 5));
          const v = r.int(1, 5);
          const f2 = xs.filter((x) => x === v).length;
          return typed(`Number of people in 15 households of a colony in Medak: ${xs.join(', ')}. What is the frequency of households with ${v} people?`, num(f2),
            ['Count how many times the value appears.', 'Use tally marks to keep track.'], [`The value ${v} appears ${f2} times.`]);
        }),
        tp('inclass', (r) => {
          const w = 10, l = 10 * r.int(1, 8);
          const v = r.next() < 0.5 ? l + w : r.int(l, l + w - 1);
          const ok = v === l + w ? `${l + w}–${l + 2 * w}` : `${l}–${l + w}`;
          return mcq(r, `Classes are ${l - w}–${l}, ${l}–${l + w}, ${l + w}–${l + 2 * w} (upper limit not included). In which class does the value ${v} go?`, ok, [`${l - w}–${l}`, `${l}–${l + w}`, `${l + w}–${l + 2 * w}`].filter((x) => x !== ok),
            ['Each class includes its lower limit but not its upper limit.'], [`${v} goes in ${ok}.`]);
        }),
        bank('facts', [
          { q: 'Data you collect by interviewing your classmates is:', a: 'primary data', w: ['secondary data', 'grouped data only', 'not data'], h: ['You collected it yourself.'], s: ['Data collected first-hand are primary.'] },
          { q: 'Population figures taken from a census report are:', a: 'secondary data', w: ['primary data', 'raw tallies', 'class marks'], h: ['Someone else collected them.'], s: ['They are secondary data.'] },
          { q: 'The sum of all frequencies in a table equals:', a: 'the total number of observations', w: ['the range', 'the class size', 'the highest value'], h: ['Each observation is counted once.'], s: ['Total frequency = number of observations.'] },
          { q: 'The difference between the upper and lower limits of a class is the:', a: 'class size', w: ['class mark', 'range', 'frequency'], h: ['It is the width.'], s: ['That is the class size.'] },
          { q: 'Tally marks 𝍸 ||| represent:', a: '8', w: ['5', '3', '7'], h: ['A bundle is 5.'], s: ['5 + 3 = 8'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.stat.present', title: 'Presenting data: bar graphs, histograms and frequency polygons', prereqs: ['ts9.m.stat.data'],
      intro: [
        h('A picture of the numbers'),
        p('A table of paddy production for each district is accurate, but a bar graph shows at a glance which district grew the most. Choosing the right picture makes data easy to read.'),
        def('Bar graph', 'Bars of equal width with gaps between them; the height shows the value. Used for separate categories.'),
        def('Histogram', 'Bars with NO gaps, drawn on class intervals of continuous data; the area (height when widths are equal) shows the frequency.'),
        def('Frequency polygon', 'Join the mid-points of the tops of the histogram bars (at the class marks). Join the ends to the class marks of an imagined empty class at each end.'),
        vis({ kind: 'bar-graph', labels: ['Bus', 'Cycle', 'Walk', 'Auto'], values: [14, 9, 11, 6], unit: 'students' }, 'Bar graph of how 40 students come to school: bus 14, cycle 9, walk 11, auto 6.'),
        keys('Bar graph: gaps between bars, categories.', 'Histogram: no gaps, continuous classes.', 'Frequency polygon: join class marks at the bar heights.', 'Always label axes and choose a scale.'),
        remember('If classes in a histogram have unequal widths, the bar height must be adjusted so that AREA is proportional to frequency.'),
        tip('Read a bar graph by moving your finger across from the top of the bar to the scale.'),
      ],
      examples: [
        ex('From the bar graph above, how many more students come by bus than by auto?', ['Bus 14, auto 6'], '8'),
        ex('Class marks of 0–10, 10–20, 20–30 are needed for a frequency polygon. What are they?', ['(0 + 10)/2, (10 + 20)/2, (20 + 30)/2'], '5, 15, 25'),
      ],
      practice: [
        tp('readbar', (r) => {
          const labels = r.pick([['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Adilabad', 'Nizamabad', 'Karimnagar', 'Warangal', 'Khammam'], ['Cricket', 'Kabaddi', 'Kho-kho', 'Football', 'Chess']]);
          const values = labels.map(() => r.int(2, 20) * 5);
          const i = r.int(0, 4);
          return typed(`The bar graph shows ${labels[0] === 'Mon' ? 'the number of library books borrowed each day' : labels[0] === 'Cricket' ? 'votes for favourite sport' : 'rainfall (in mm) in one week in five districts'}. What is the value for ${labels[i]}?`, num(values[i]),
            ['Find the bar labelled ' + labels[i] + '.', 'Read across from its top to the scale.'], [`${labels[i]}: ${values[i]}`],
            [], { visual: { kind: 'bar-graph', labels, values } });
        }),
        tp('diff', (r) => {
          const labels = ['2021', '2022', '2023', '2024', '2025'];
          const values = labels.map(() => r.int(20, 90));
          let i = r.int(0, 4), j = r.int(0, 4);
          while (j === i) j = r.int(0, 4);
          return typed(`The bar graph shows the number of trees planted by an eco-club in five years. How many more trees were planted in ${labels[values[i] >= values[j] ? i : j]} than in ${labels[values[i] >= values[j] ? j : i]}?`, num(Math.abs(values[i] - values[j])),
            ['Read both bar heights.', 'Subtract the smaller from the larger.'], [`${Math.max(values[i], values[j])} − ${Math.min(values[i], values[j])} = ${Math.abs(values[i] - values[j])}`],
            [[String(values[i] + values[j]), 'The question asks "how many MORE": subtract.']], { visual: { kind: 'bar-graph', labels, values } });
        }),
        tp('polygon', (r) => {
          const w = r.pick([5, 10, 20]), l = w * r.int(0, 6);
          const k = r.int(0, 3);
          const lo = l + k * w;
          return typed(`A histogram has classes ${l}–${l + w}, ${l + w}–${l + 2 * w}, ${l + 2 * w}–${l + 3 * w}, ${l + 3 * w}–${l + 4 * w}. For the frequency polygon, at what x-value do you plot the point for the class ${lo}–${lo + w}?`, num(lo + w / 2),
            ['Points of a frequency polygon are plotted at the class marks.'], [`Class mark = (${lo} + ${lo + w}) ÷ 2 = ${lo + w / 2}`],
            [[String(lo), 'Plot at the MIDDLE of the class, not its lower limit.']]);
        }),
        bank('facts', [
          { q: 'Which graph has NO gaps between its bars?', a: 'Histogram', w: ['Bar graph', 'Pictograph', 'Pie chart'], h: ['It shows continuous classes.'], s: ['A histogram\'s bars touch because the classes are continuous.'] },
          { q: 'A frequency polygon is drawn by joining:', a: 'the mid-points of the tops of histogram bars', w: ['the corners of the bars', 'the lower limits', 'the highest bars only'], h: ['Points at the class marks.'], s: ['Join the class marks at the bar heights.'] },
          { q: 'To show the number of students in each of 5 sections, the best graph is a:', a: 'bar graph', w: ['histogram', 'frequency polygon', 'line graph of time'], h: ['Sections are separate categories.'], s: ['Separate categories → bar graph.'] },
          { q: 'In a histogram with equal class widths, the height of each bar shows the:', a: 'frequency of that class', w: ['class mark', 'class size', 'range'], h: ['Taller bar = more observations.'], s: ['Height ∝ frequency when widths are equal.'] },
          { q: 'In a bar graph, the bars must have:', a: 'equal widths', w: ['equal heights', 'different colours', 'no labels'], h: ['Only the height carries the value.'], s: ['Equal widths so only height shows value.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.stat.central', title: 'Mean, median and mode', prereqs: ['ts9.m.stat.data'],
      intro: [
        h('One number to represent many'),
        p('After a cricket series, we say a batsman "averages 45 runs". One number summarises many innings. Such a number is a measure of central tendency. There are three common ones.'),
        def('Mean (average)', 'Sum of all observations ÷ number of observations. For a frequency table, x̄ = Σfx / Σf.'),
        def('Median', 'The middle value when the data are arranged in order. For n values: the ((n + 1)/2)th value if n is odd; the average of the (n/2)th and (n/2 + 1)th values if n is even.'),
        def('Mode', 'The value that occurs most often.'),
        f('x̄ = (x₁ + x₂ + … + xₙ) / n', 'mean equals the sum of the observations divided by n'),
        X({
          title: 'What if? Change the total and the count', formula: 'x̄ = Σx / n',
          result: ['m', 'Mean', 'S / n', '', 2],
          vars: [['S', 'Sum of observations Σx', 10, 1000, 10, 450], ['n', 'Number of observations', 1, 40, 1, 10]],
          notes: [
            ['S', 'A bigger total with the same count raises the mean in proportion.', 'A smaller total lowers it.'],
            ['n', 'Sharing the same total among more observations lowers the mean.', 'Fewer observations raise the mean.'],
          ],
          mistakes: [
            ['Finding the median without ordering the data', 'The median is the middle of the ORDERED list.'],
            ['Thinking one huge value does not affect the mean', 'A single very large value pulls the mean up a lot; the median hardly moves.'],
          ],
          real: 'A batsman with 450 runs in 10 innings averages 45. One innings of 0 more drops it to 450 ÷ 11 ≈ 40.9.',
        }),
        keys('Mean uses every value.', 'Median is the middle — not disturbed by extreme values.', 'Mode is the most frequent — useful for sizes (shoes, uniforms).', 'Total = mean × number of observations.'),
        remember('If a data set has two values occurring most often, it has two modes.'),
        tip('Missing value problems: total = mean × n, then subtract the known values.'),
      ],
      examples: [
        ex('Find the mean, median and mode of 4, 7, 2, 7, 5.', ['Mean = 25/5 = 5', 'Ordered: 2, 4, 5, 7, 7 → median 5', '7 occurs twice → mode 7'], 'Mean 5, median 5, mode 7'),
        ex('Find the median of 12, 15, 9, 20, 14, 11.', ['Ordered: 9, 11, 12, 14, 15, 20', 'Middle two: 12 and 14'], '13'),
        ex('Find the mean from the table: x = 1, 2, 3 with f = 4, 5, 1.', ['Σfx = 4 + 10 + 3 = 17', 'Σf = 10'], '1.7'),
      ],
      practice: [
        tp('mean', (r) => {
          const n = r.int(4, 7);
          const m = r.int(30, 60);
          const xs = Array.from({ length: n - 1 }, () => m + r.int(-4, 4));
          xs.push(m * n - xs.reduce((p1, q1) => p1 + q1, 0));
          return typed(`Find the mean of ${xs.join(', ')}.`, num(m),
            ['Add all the values.', `Divide by ${n}.`], [`Sum = ${m * n}`, `Mean = ${m * n} ÷ ${n} = ${m}`],
            [[String(m * n), `That is the total. Divide by the number of values, ${n}.`]]);
        }),
        tp('median', (r) => {
          const n = r.int(5, 8);
          const xs = Array.from({ length: n }, () => r.int(1, 50));
          const s = [...xs].sort((p1, q1) => p1 - q1);
          const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
          return typed(`Find the median of ${xs.join(', ')}.`, num(med),
            ['First arrange in ascending order.', n % 2 ? 'Odd count: take the middle value.' : 'Even count: average the two middle values.'],
            [`Ordered: ${s.join(', ')}`, `Median = ${med}`],
            xs[Math.floor(n / 2)] !== med ? [[String(xs[Math.floor(n / 2)]), 'Order the data before picking the middle.']] : []);
        }),
        tp('mode', (r) => {
          const md = r.int(1, 9);
          const others = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== md)).slice(0, 5);
          const xs = r.shuffle([md, md, md, ...others, others[0], others[1]]);
          return typed(`Shoe sizes sold at a shop in Nizamabad one morning: ${xs.join(', ')}. What is the mode?`, num(md),
            ['Count how often each size appears.'], [`${md} appears 3 times — more than any other size.`]);
        }),
        tp('missing', (r) => {
          const n = r.int(4, 6), m = r.int(30, 60);
          const known = Array.from({ length: n - 1 }, () => m + r.int(-5, 5));
          const x = m * n - known.reduce((p1, q1) => p1 + q1, 0);
          return typed(`The mean of ${n} numbers is ${m}. ${n - 1} of them are ${known.join(', ')}. Find the remaining number.`, num(x),
            ['Total = mean × number of values.', 'Subtract the known values.'],
            [`Total = ${m} × ${n} = ${m * n}`, `Known sum = ${known.reduce((p1, q1) => p1 + q1, 0)}`, `Missing = ${x}`], [], { steps: [st('First find the total of all the numbers.', num(m * n)), st('Now find the missing number.', num(x))] });
        }, 2),
        tp('table', (r) => {
          const xs = [1, 2, 3, 4], fs = xs.map(() => r.int(1, 6));
          const sf = fs.reduce((p1, q1) => p1 + q1, 0), sfx = xs.reduce((s, x, i) => s + x * fs[i], 0);
          return typed(`Number of siblings (x) and number of students (f): x = 1, 2, 3, 4; f = ${fs.join(', ')}. Find the mean number of siblings.`, frac(sfx, sf),
            ['Mean = Σfx ÷ Σf.', 'Multiply each x by its f and add.'],
            [`Σfx = ${xs.map((x, i) => `${x}×${fs[i]}`).join(' + ')} = ${sfx}`, `Σf = ${sf}`, `Mean = ${sfx}/${sf}${sf !== 1 ? ` = ${rd(sfx / sf, 3)}` : ''}`],
            [[String(rd(sfx / 4, 2)), 'Divide by the total frequency Σf, not by the number of rows.']], { keypad: 'fraction' });
        }, 2),
      ],
    },
    {
      id: 'ts9.m.stat.deviation', title: 'Deviations from the central value', prereqs: ['ts9.m.stat.central'],
      intro: [
        h('How far is each value from the mean?'),
        p('The daily maximum temperatures at Ramagundam for five days were 38, 41, 40, 43, 38 °C. The mean is 40 °C. The deviations from the mean are −2, +1, 0, +3, −2. Add them: 0! This always happens.'),
        def('Deviation', 'The difference (value − central value). It is positive above the mean and negative below.'),
        p('Why do deviations from the mean add to 0? Σ(x − x̄) = Σx − n·x̄ = Σx − Σx = 0. This gives the assumed mean method: guess a value A near the middle, find deviations d = x − A, and correct the guess.'),
        f('x̄ = A + (Σd)/n,  where d = x − A', 'mean equals the assumed mean plus the sum of deviations over n'),
        X({
          title: 'What if? Change the assumed mean', formula: 'x̄ = A + Σd / n',
          result: ['m', 'Mean', 'A + D / n', '', 2],
          vars: [['A', 'Assumed mean A', 20, 60, 1, 40], ['D', 'Sum of deviations Σd', -50, 50, 1, 0], ['n', 'Number of observations', 1, 20, 1, 5]],
          notes: [
            ['A', 'With the same data, a bigger guess A gives a smaller Σd, so the true mean does not change. Here Σd is held fixed, so the result moves.', 'A smaller guess makes Σd larger for real data.'],
            ['D', 'Positive Σd means the guess was too low, so the mean is above A.', 'Negative Σd means the guess was too high.'],
          ],
          mistakes: [
            ['Forgetting the signs of deviations', 'Values below A have NEGATIVE deviations; adding them as positive gives a wrong mean.'],
            ['Dividing Σd by the number of positive deviations only', 'Divide by n, the total number of observations.'],
          ],
          real: 'A cashier adding ₹498, ₹502, ₹505, ₹495 can think "about ₹500 each, deviations −2, +2, +5, −5 → mean exactly ₹500".',
        }),
        keys('Deviation = value − mean.', 'The deviations from the mean always add to 0.', 'Assumed mean: x̄ = A + Σd/n.'),
        remember('If the sum of deviations from a number is 0, that number IS the mean.'),
        tip('Choose A as a value in the middle of the data so the deviations are small.'),
      ],
      examples: [
        ex('Find the mean of 52, 55, 49, 58, 51 using A = 50.', ['d: 2, 5, −1, 8, 1', 'Σd = 15', 'x̄ = 50 + 15/5'], '53'),
        ex('The deviations of 4 values from their mean are 3, −5, 4 and x. Find x.', ['Deviations add to 0', '3 − 5 + 4 + x = 0'], 'x = −2'),
      ],
      practice: [
        tp('assumed', (r) => {
          const A = 10 * r.int(3, 9), n = 5;
          const ds = Array.from({ length: n }, () => r.int(-6, 9));
          const S = ds.reduce((p1, q1) => p1 + q1, 0);
          const xs = ds.map((d) => A + d);
          return typed(`Find the mean of ${xs.join(', ')} using the assumed mean A = ${A}.`, frac(n * A + S, n),
            ['Find d = x − A for each value.', 'x̄ = A + Σd/n'],
            [`d: ${ds.map(n_).join(', ')}`, `Σd = ${S}`, `x̄ = ${A} + ${fx(S, n)} = ${rd(A + S / n, 2)}`],
            [[String(A), 'Add the correction Σd/n to A.']], { keypad: 'fraction' });
        }),
        tp('lastdev', (r) => {
          const ds = Array.from({ length: 4 }, () => r.int(-8, 8));
          const last = -ds.reduce((p1, q1) => p1 + q1, 0);
          return typed(`The deviations of five observations from their mean are ${ds.map(n_).join(', ')} and x. Find x.`, num(last),
            ['Deviations from the mean always add up to 0.'], [`${ds.map(n_).join(' + ')} + x = 0`.replace(/\+ −/g, '− '), `x = ${n_(last)}`],
            [[String(-last), 'The sum must be ZERO, so x cancels the others.']]);
        }),
        tp('dev', (r) => {
          const xs = Array.from({ length: 5 }, () => r.int(20, 60));
          const sum = xs.reduce((p1, q1) => p1 + q1, 0);
          const adj = (5 - (sum % 5)) % 5;
          xs[4] += adj;
          const m = (sum + adj) / 5;
          const i = r.int(0, 4);
          return typed(`The data ${xs.join(', ')} have mean ${m}. What is the deviation of ${xs[i]} from the mean?`, num(xs[i] - m),
            ['Deviation = value − mean.', 'It is negative if the value is below the mean.'], [`${xs[i]} − ${m} = ${n_(xs[i] - m)}`],
            xs[i] !== m ? [[String(m - xs[i]), 'Subtract in the order value − mean.']] : []);
        }),
        bank('facts', [
          { q: 'The sum of deviations of all observations from their mean is:', a: '0', w: ['1', 'the mean', 'n'], h: ['Σx − n·x̄'], s: ['Σ(x − x̄) = Σx − Σx = 0'] },
          { q: 'A deviation is negative when the value is:', a: 'less than the central value', w: ['greater than the central value', 'equal to the mean', 'the mode'], h: ['value − mean < 0'], s: ['Below the mean → negative deviation.'] },
          { q: 'Using an assumed mean, if Σd is positive, the actual mean is:', a: 'greater than A', w: ['less than A', 'equal to A', 'zero'], h: ['x̄ = A + Σd/n'], s: ['Positive correction → mean above A.'] },
          { q: 'If the deviations of a set of numbers from 25 add to 0, then:', a: 'the mean is 25', w: ['the median is 25', 'the mode is 25', 'the range is 25'], h: ['Only the mean has this property.'], s: ['x̄ = 25 + 0/n = 25'] },
          { q: 'Why use an assumed mean?', a: 'To work with smaller numbers', w: ['To change the mean', 'Because the mean cannot be found otherwise', 'To find the mode'], h: ['Deviations are small numbers.'], s: ['It simplifies arithmetic; the answer is the same.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 10 SURFACE AREAS AND VOLUMES
const PI_NOTE = 'Use π = 22/7.';
const ch10: USpec = {
  id: 'ts9.m.ch10', subject: 'math', title: 'Surface areas and Volumes', source: src(10),
  objectives: [
    {
      id: 'ts9.m.sv.cuboid', title: 'Surface area and volume of a cuboid and a cube',
      intro: [
        h('Boxes, rooms and water tanks'),
        photo('📦', 'A carton is a cuboid: 6 rectangular faces.'),
        p('A sweet shop in Secunderabad packs laddoos in cardboard boxes. The cardboard needed is the SURFACE AREA; the space inside is the VOLUME. A cuboid has 6 rectangular faces in 3 matching pairs: l × b (top and bottom), b × h (two ends), h × l (front and back).'),
        keys('Total surface area of a cuboid = 2(lb + bh + hl).', 'Lateral (side) surface area = 2h(l + b) — the four walls of a room.', 'Volume of a cuboid = l × b × h.', 'Cube of edge a: TSA = 6a², LSA = 4a², V = a³.', '1 m³ = 1000 litres; 1000 cm³ = 1 litre.'),
        f('V = l × b × h;  TSA = 2(lb + bh + hl)', 'volume equals length times breadth times height'),
        X({
          title: 'What if? Resize a box', formula: 'V = l × b × h',
          result: ['V', 'Volume', 'l * b * h', 'cm³'],
          vars: [['l', 'Length', 1, 50, 1, 20, 'cm'], ['b', 'Breadth', 1, 40, 1, 10, 'cm'], ['h', 'Height', 1, 30, 1, 5, 'cm']],
          notes: [
            ['l', 'Doubling the length doubles the volume.', 'Halving the length halves the volume.'],
            ['h', 'Every extra centimetre of height adds another layer of l × b cubes.', 'Removing height removes whole layers.'],
          ],
          mistakes: [
            ['Adding instead of multiplying for volume', 'Volume counts unit cubes in layers: l × b in a layer, h layers.'],
            ['Using TSA for painting the walls of a room', 'Walls only (no floor or ceiling) use the LATERAL surface area 2h(l + b).'],
            ['Mixing units (m and cm)', 'Convert all lengths to the same unit before multiplying.'],
          ],
          real: 'A tank 2 m × 1.5 m × 1 m holds 3 m³ = 3000 litres of water.',
        }),
        remember('Doubling every edge of a cube makes its surface area 4 times and its volume 8 times.'),
        tip('Write the units: area in square units (cm²), volume in cubic units (cm³).'),
      ],
      examples: [
        ex('Find the TSA and volume of a box 10 cm × 8 cm × 5 cm.', ['TSA = 2(80 + 40 + 50) = 340 cm²', 'V = 10 × 8 × 5 = 400 cm³'], 'TSA 340 cm², V 400 cm³'),
        ex('A room is 5 m × 4 m × 3 m. Find the area of its four walls.', ['LSA = 2 × 3 × (5 + 4)'], '54 m²'),
        ex('A cube has edge 6 cm. Find its TSA and volume.', ['6 × 36 = 216 cm²', '6³ = 216 cm³'], '216 cm² and 216 cm³'),
      ],
      practice: [
        tp('tsa', (r) => {
          const l = r.int(4, 20), b = r.int(3, 15), hh = r.int(2, 12);
          const t = 2 * (l * b + b * hh + hh * l);
          return typed(`Find the total surface area of a cuboid ${l} cm × ${b} cm × ${hh} cm.`, num(t, 'cm²'),
            ['TSA = 2(lb + bh + hl).'], [`2(${l * b} + ${b * hh} + ${hh * l}) = 2 × ${t / 2} = ${t} cm²`],
            [[String(t / 2), 'There are TWO of each face: multiply by 2.'], [String(l * b * hh), 'That is the volume.']]);
        }),
        tp('vol', (r) => {
          const l = r.int(2, 12), b = r.int(2, 10), hh = r.int(1, 8);
          const lit = r.next() < 0.4;
          return lit
            ? typed(`A water tank is ${l} m long, ${b} m wide and ${hh} m deep. How many litres does it hold when full?`, num(l * b * hh * 1000, 'L'), ['Volume = l × b × h in m³.', '1 m³ = 1000 L.'], [`V = ${l * b * hh} m³`, `= ${l * b * hh * 1000} L`], [[String(l * b * hh), 'That is in m³. Multiply by 1000 for litres.']])
            : typed(`Find the volume of a cuboid ${l} cm × ${b} cm × ${hh} cm.`, num(l * b * hh, 'cm³'), ['V = l × b × h.'], [`${l} × ${b} × ${hh} = ${l * b * hh} cm³`]);
        }),
        tp('walls', (r) => {
          const l = r.int(4, 10), b = r.int(3, 8), hh = r.int(3, 5), rate = r.pick([10, 20, 25, 40]);
          const A = 2 * hh * (l + b);
          return typed(`A classroom is ${l} m long, ${b} m wide and ${hh} m high. Find the cost of painting its four walls at ₹${rate} per m².`, num(A * rate, '₹'),
            ['Four walls = lateral surface area 2h(l + b).', 'Multiply the area by the rate.'],
            [`LSA = 2 × ${hh} × (${l} + ${b}) = ${A} m²`, `Cost = ${A} × ${rate} = ₹${A * rate}`],
            [[String(2 * (l * b + b * hh + hh * l) * rate), 'Do not include the floor and ceiling.']], { steps: [st('Area of the four walls (m²)?', num(A)), st('Cost (₹)?', num(A * rate))] });
        }, 2),
        tp('cube', (r) => {
          const a = r.int(2, 15);
          const k = r.int(0, 2);
          const [w, v] = [['total surface area', 6 * a * a], ['lateral surface area', 4 * a * a], ['volume', a ** 3]][k] as [string, number];
          return typed(`A cube has edge ${a} cm. Find its ${w}.`, num(v, k === 2 ? 'cm³' : 'cm²'),
            ['TSA = 6a², LSA = 4a², V = a³.'], [`${w} = ${v}`]);
        }),
        bank('facts', [
          { q: 'If each edge of a cube is doubled, its volume becomes:', a: '8 times', w: ['2 times', '4 times', '6 times'], h: ['(2a)³ = ?'], s: ['(2a)³ = 8a³'] },
          { q: 'If each edge of a cube is doubled, its surface area becomes:', a: '4 times', w: ['2 times', '8 times', '6 times'], h: ['6(2a)² = ?'], s: ['6 × 4a² = 4 × 6a²'] },
          { q: '1 m³ equals:', a: '1000 litres', w: ['100 litres', '10 litres', '1 litre'], h: ['1 m = 100 cm, so 1 m³ = 10⁶ cm³.'], s: ['10⁶ cm³ ÷ 1000 = 1000 L'] },
          { q: 'The area of the four walls of a room is its:', a: 'lateral surface area', w: ['total surface area', 'volume', 'floor area'], h: ['No floor or ceiling.'], s: ['Four walls = LSA = 2h(l + b).'] },
          { q: 'How many 1 cm cubes fit in a box 4 cm × 3 cm × 2 cm?', a: '24', w: ['9', '18', '26'], h: ['Volume.'], s: ['4 × 3 × 2 = 24'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.sv.cylinder', title: 'Right circular cylinder', prereqs: ['ts9.m.sv.cuboid'],
      intro: [
        h('Pipes, drums and pillars'),
        photo('🥫', 'A tin can is a right circular cylinder.'),
        p('Open out the label of a tin can and you get a rectangle: its length is the circumference 2πr and its width is the height h. That is why the curved surface area is 2πrh. Add the two circular ends (πr² each) for the total surface area.'),
        keys('Curved surface area (CSA) = 2πrh.', 'Total surface area = 2πrh + 2πr² = 2πr(r + h).', 'Volume = area of base × height = πr²h.', 'Hollow cylinder (pipe) volume = π(R² − r²)h.'),
        f('V = πr²h;  CSA = 2πrh', 'volume equals pi r squared h'),
        X({
          title: 'What if? Make the drum wider or taller', formula: 'V = πr²h',
          result: ['V', 'Volume', 'pi * r^2 * h', 'cm³', 1],
          vars: [['r', 'Radius', 1, 30, 1, 7, 'cm'], ['h', 'Height', 1, 50, 1, 10, 'cm']],
          notes: [
            ['r', 'Doubling the radius makes the volume 4 times bigger, because the base area depends on r².', 'Halving the radius leaves only a quarter of the volume.'],
            ['h', 'Doubling the height doubles the volume.', 'Halving the height halves the volume.'],
          ],
          mistakes: [
            ['Using the diameter as r', 'If a drum is 14 cm across, r = 7 cm, not 14.'],
            ['Using CSA when the tin has a lid and base', 'Closed tin → total surface area 2πr(r + h).'],
          ],
          real: 'A Mission Bhagiratha water tank of radius 7 m and height 10 m holds 22/7 × 49 × 10 = 1540 m³ = 15,40,000 litres.',
        }),
        remember('Radius matters more than height: r is squared in the volume.'),
        tip('Choose r as a multiple of 7 when π = 22/7 to keep the numbers whole.'),
      ],
      examples: [
        ex('Find the CSA of a cylinder of radius 7 cm and height 10 cm.', ['2 × 22/7 × 7 × 10'], '440 cm²'),
        ex('Find the volume of a cylinder of radius 14 cm and height 5 cm.', ['22/7 × 14 × 14 × 5'], '3080 cm³'),
      ],
      practice: [
        tp('csa', (r) => {
          const rr = r.pick([7, 14, 21, 3.5]), hh = r.int(2, 20);
          const v = 2 * PI7 * rr * hh;
          return typed(`Find the curved surface area of a cylinder with radius ${rr} cm and height ${hh} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm²'),
            ['CSA = 2πrh.'], [`2 × 22/7 × ${rr} × ${hh} = ${rd(v, 2)} cm²`], [[String(rd(PI7 * rr * hh, 2)), 'Do not forget the factor 2 in 2πr.']]);
        }),
        tp('tsa', (r) => {
          const rr = r.pick([7, 14, 21]), hh = r.int(3, 20);
          const v = 2 * PI7 * rr * (rr + hh);
          return typed(`Find the total surface area of a closed cylindrical tin with radius ${rr} cm and height ${hh} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm²'),
            ['TSA = 2πr(r + h).'], [`2 × 22/7 × ${rr} × (${rr} + ${hh}) = ${rd(v, 2)} cm²`], [[String(rd(2 * PI7 * rr * hh, 2)), 'That is only the curved part. Add the two ends.']]);
        }),
        tp('vol', (r) => {
          const rr = r.pick([7, 14, 21, 3.5]), hh = r.int(2, 20);
          const v = PI7 * rr * rr * hh;
          const d = r.next() < 0.4;
          return typed(`Find the volume of a cylinder with ${d ? `diameter ${2 * rr}` : `radius ${rr}`} cm and height ${hh} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm³'),
            [d ? 'First halve the diameter to get r.' : 'V = πr²h.', 'V = πr²h.'], [`r = ${rr} cm`, `V = 22/7 × ${rr}² × ${hh} = ${rd(v, 2)} cm³`],
            d ? [[String(rd(PI7 * 4 * rr * rr * hh, 2)), 'You used the diameter as the radius.']] : []);
        }),
        tp('litres', (r) => {
          const rr = r.pick([7, 14, 21, 35]), hh = r.pick([10, 20, 50, 100]);
          const v = PI7 * rr * rr * hh;
          return typed(`A cylindrical vessel has radius ${rr} cm and height ${hh} cm. How many litres of milk can it hold? ${PI_NOTE}`, approx(rd(v / 1000, 3), 0.01, 'L'),
            ['Find the volume in cm³.', '1000 cm³ = 1 litre.'], [`V = ${rd(v, 2)} cm³`, `= ${rd(v / 1000, 3)} L`], [[String(rd(v, 2)), 'Divide by 1000 to convert cm³ to litres.']]);
        }, 2),
        bank('facts', [
          { q: 'If the radius of a cylinder is doubled (height same), its volume becomes:', a: '4 times', w: ['2 times', '8 times', 'unchanged'], h: ['V depends on r².'], s: ['(2r)² = 4r²'] },
          { q: 'If the height of a cylinder is doubled (radius same), its CSA becomes:', a: '2 times', w: ['4 times', 'half', 'unchanged'], h: ['CSA = 2πrh.'], s: ['CSA is directly proportional to h.'] },
          { q: 'The curved surface of a cylinder, opened out, is a:', a: 'rectangle', w: ['circle', 'triangle', 'sector'], h: ['Unroll the label of a tin.'], s: ['A rectangle 2πr by h.'] },
          { q: 'The volume of a pipe with outer radius R, inner radius r and length h is:', a: 'π(R² − r²)h', w: ['π(R − r)²h', '2π(R − r)h', 'πR²h'], h: ['Outer cylinder minus the hollow.'], s: ['πR²h − πr²h = π(R² − r²)h'] },
          { q: 'A cylinder of radius 7 cm has base area:', a: '154 cm²', w: ['44 cm²', '49 cm²', '22 cm²'], h: ['πr² = 22/7 × 49'], s: ['22/7 × 49 = 154 cm²'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.sv.cone', title: 'Right circular cone', prereqs: ['ts9.m.sv.cylinder'],
      intro: [
        h('Ice-cream cones, tents and heaps of grain'),
        p('A heap of paddy in a Kamareddy market, a birthday cap, a circus tent — all are cones. A cone has a circular base of radius r, a vertical height h and a slant height l. These three form a right triangle, so l² = r² + h².'),
        keys('Slant height l = √(r² + h²).', 'Curved surface area = πrl.', 'Total surface area = πrl + πr² = πr(l + r).', 'Volume = ⅓ πr²h — exactly one-third of a cylinder with the same base and height (three cone-fulls of sand fill the cylinder).'),
        f('V = ⅓πr²h;  CSA = πrl;  l = √(r² + h²)', 'volume equals one third pi r squared h'),
        X({
          title: 'What if? Change a cone\'s base and height', formula: 'V = ⅓πr²h',
          result: ['V', 'Volume', 'pi * r^2 * h / 3', 'cm³', 1],
          vars: [['r', 'Base radius', 1, 21, 1, 7, 'cm'], ['h', 'Vertical height', 1, 48, 1, 24, 'cm']],
          notes: [
            ['r', 'Doubling the base radius makes the cone hold 4 times as much.', 'Halving the radius leaves a quarter of the volume.'],
            ['h', 'Doubling the height doubles the volume.', 'Halving the height halves it.'],
          ],
          mistakes: [
            ['Using the slant height l in the volume formula', 'Volume uses the VERTICAL height h. The slant height belongs in the curved surface area.'],
            ['Forgetting the ⅓', 'A cone holds only a third of the matching cylinder.'],
          ],
          real: 'A heap of grain with base radius 7 m and height 3 m contains ⅓ × 22/7 × 49 × 3 = 154 m³.',
        }),
        remember('h (vertical) for volume; l (slant) for curved surface area.'),
        tip('Common triples for r, h, l: (3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17).'),
      ],
      examples: [
        ex('A cone has r = 7 cm and h = 24 cm. Find l, CSA and volume.', ['l = √(49 + 576) = 25 cm', 'CSA = 22/7 × 7 × 25 = 550 cm²', 'V = ⅓ × 22/7 × 49 × 24 = 1232 cm³'], 'l = 25 cm, CSA 550 cm², V 1232 cm³'),
        ex('How much canvas is needed for a conical tent of radius 7 m and slant height 10 m?', ['CSA = 22/7 × 7 × 10'], '220 m²'),
      ],
      practice: [
        tp('slant', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [7, 24, 25], [8, 15, 17], [6, 8, 10], [9, 12, 15], [20, 21, 29]]);
          const k = r.int(1, 2);
          return typed(`A cone has base radius ${a * k} cm and height ${b * k} cm. Find its slant height.`, num(c * k, 'cm'),
            ['l² = r² + h²'], [`l = √(${(a * k) ** 2} + ${(b * k) ** 2}) = √${(c * k) ** 2} = ${c * k} cm`], [[String((a + b) * k), 'Use Pythagoras, not addition.']]);
        }),
        tp('csa', (r) => {
          const rr = r.pick([7, 14, 21, 3.5]), l = r.int(5, 30);
          const v = PI7 * rr * l;
          return typed(`Find the curved surface area of a cone with radius ${rr} cm and slant height ${l} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm²'),
            ['CSA = πrl.'], [`22/7 × ${rr} × ${l} = ${rd(v, 2)} cm²`], [[String(rd(2 * v, 2)), 'A cone\'s CSA is πrl, not 2πrl.']]);
        }),
        tp('vol', (r) => {
          const rr = r.pick([7, 14, 21, 3.5]), hh = r.pick([3, 6, 9, 12, 15, 24]);
          const v = (PI7 * rr * rr * hh) / 3;
          return typed(`Find the volume of a cone with radius ${rr} cm and height ${hh} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm³'),
            ['V = ⅓πr²h.'], [`⅓ × 22/7 × ${rr}² × ${hh} = ${rd(v, 2)} cm³`], [[String(rd(3 * v, 2)), 'You forgot the ⅓.']]);
        }),
        tp('tsa', (r) => {
          const [a, , c] = r.pick([[7, 24, 25], [21, 20, 29], [14, 48, 50], [21, 28, 35], [35, 12, 37], [28, 45, 53]]);
          const v = PI7 * a * (c + a);
          return typed(`A solid cone has radius ${a} cm and slant height ${c} cm. Find its total surface area. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm²'),
            ['TSA = πr(l + r).'], [`22/7 × ${a} × (${c} + ${a}) = ${rd(v, 2)} cm²`], [[String(rd(PI7 * a * c, 2)), 'Add the base area πr².']]);
        }, 2),
        bank('facts', [
          { q: 'How many cones fill a cylinder of the same base and height?', a: '3', w: ['2', '4', '1'], h: ['V(cone) = ⅓ V(cylinder).'], s: ['Three cone-fulls fill the cylinder.'] },
          { q: 'The volume of a cone uses:', a: 'the vertical height h', w: ['the slant height l', 'the diameter only', 'l + h'], h: ['Height is measured straight up.'], s: ['V = ⅓πr²h with vertical height.'] },
          { q: 'r, h and l of a cone are related by:', a: 'l² = r² + h²', w: ['l = r + h', 'h² = r² + l²', 'r² = l² + h²'], h: ['l is the hypotenuse.'], s: ['The slant height is the hypotenuse.'] },
          { q: 'If the radius of a cone is doubled and the height kept the same, its volume becomes:', a: '4 times', w: ['2 times', '8 times', '3 times'], h: ['V ∝ r².'], s: ['(2r)² = 4r²'] },
          { q: 'The canvas for a conical tent (no floor) is its:', a: 'curved surface area', w: ['total surface area', 'volume', 'base area'], h: ['There is no base cloth.'], s: ['CSA = πrl.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.sv.sphere', title: 'Sphere and hemisphere', prereqs: ['ts9.m.sv.cone'],
      intro: [
        h('Balls, domes and bowls'),
        photo('⚽', 'A football is a sphere; cut it in half and you get two hemispheres.'),
        p('A football, a laddoo and a marble are spheres. The dome of a mosque in the old city and a steel bowl are hemispheres. A sphere has surface area 4πr² — exactly four times the area of its largest circle (you can check by winding string round a ball and then filling circles).'),
        keys('Sphere: SA = 4πr², V = 4/3 πr³.', 'Hemisphere: CSA = 2πr², TSA = 3πr² (curved part + flat circle), V = 2/3 πr³.'),
        f('V = (4/3)πr³;  SA = 4πr²', 'volume equals four thirds pi r cubed'),
        X({
          title: 'What if? Blow up a balloon', formula: 'V = (4/3)πr³',
          result: ['V', 'Volume', '4 * pi * r^3 / 3', 'cm³', 1],
          vars: [['r', 'Radius', 1, 21, 0.5, 7, 'cm']],
          notes: [['r', 'Doubling the radius makes the volume 8 times bigger (r³), while the skin area grows only 4 times.', 'Halving the radius leaves one-eighth of the volume.']],
          mistakes: [
            ['Using 2πr² for a solid hemisphere', 'A solid hemisphere also has a flat circular face: TSA = 2πr² + πr² = 3πr².'],
            ['Using the diameter in r³', 'A 14 cm ball has r = 7: the volume with 14 would be 8 times too big.'],
          ],
          real: 'A spherical balloon whose radius goes from 7 cm to 14 cm needs 8 times as much air.',
        }),
        remember('Volume grows with r³, surface with r².'),
        tip('With π = 22/7, choose r = 7, 3.5, 10.5, 14 or 21 for easy arithmetic.'),
      ],
      examples: [
        ex('Find the surface area of a sphere of radius 7 cm.', ['4 × 22/7 × 49'], '616 cm²'),
        ex('Find the volume of a hemispherical bowl of radius 21 cm.', ['2/3 × 22/7 × 21³ = 2/3 × 22/7 × 9261'], '19404 cm³'),
      ],
      practice: [
        tp('sa', (r) => {
          const rr = r.pick([7, 14, 21, 3.5, 10.5]);
          const v = 4 * PI7 * rr * rr;
          return typed(`Find the surface area of a sphere of radius ${rr} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm²'),
            ['SA = 4πr².'], [`4 × 22/7 × ${rr}² = ${rd(v, 2)} cm²`], [[String(rd(PI7 * rr * rr, 2)), 'That is one circle. A sphere\'s surface is 4 such circles.']]);
        }),
        tp('vol', (r) => {
          const rr = r.pick([7, 14, 21, 3.5, 10.5]);
          const v = (4 * PI7 * rr ** 3) / 3;
          return typed(`Find the volume of a sphere of radius ${rr} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, 'cm³'),
            ['V = 4/3 πr³.'], [`4/3 × 22/7 × ${rr}³ = ${rd(v, 2)} cm³`]);
        }),
        tp('hemi', (r) => {
          const rr = r.pick([7, 14, 21, 3.5]);
          const k = r.int(0, 2);
          const [w, v, u] = [['curved surface area', 2 * PI7 * rr * rr, 'cm²'], ['total surface area (solid hemisphere)', 3 * PI7 * rr * rr, 'cm²'], ['volume', (2 * PI7 * rr ** 3) / 3, 'cm³']][k] as [string, number, string];
          return typed(`Find the ${w} of a hemisphere of radius ${rr} cm. ${PI_NOTE}`, approx(rd(v, 2), 0.01, u),
            ['Hemisphere: CSA 2πr², TSA 3πr², V 2/3 πr³.'], [`${w} = ${rd(v, 2)} ${u}`],
            k === 1 ? [[String(rd(2 * PI7 * rr * rr, 2)), 'Add the flat circular face πr².']] : []);
        }),
        tp('ratio', (r) => {
          const k = r.int(2, 5);
          const vol = r.next() < 0.5;
          return typed(`The radius of a ball is made ${k} times as big. How many times as big does its ${vol ? 'volume' : 'surface area'} become?`, num(vol ? k ** 3 : k * k),
            [vol ? 'V depends on r³.' : 'SA depends on r².'], [`${k}${vol ? '³' : '²'} = ${vol ? k ** 3 : k * k}`], [[String(k), 'The radius is raised to a power in the formula.']]);
        }),
        bank('facts', [
          { q: 'The surface area of a sphere is how many times the area of its great circle?', a: '4', w: ['2', '3', '1'], h: ['4πr² vs πr².'], s: ['4πr² ÷ πr² = 4'] },
          { q: 'The total surface area of a solid hemisphere is:', a: '3πr²', w: ['2πr²', '4πr²', 'πr²'], h: ['Curved 2πr² + flat πr².'], s: ['2πr² + πr² = 3πr²'] },
          { q: 'The volume of a hemisphere is:', a: '2/3 πr³', w: ['4/3 πr³', '1/3 πr³', '2πr³'], h: ['Half of a sphere.'], s: ['½ × 4/3 πr³ = 2/3 πr³'] },
          { q: 'A sphere and a cylinder have the same radius r, and the cylinder\'s height is 2r. The sphere\'s volume is what fraction of the cylinder\'s?', a: '2/3', w: ['1/2', '1/3', '3/4'], h: ['4/3 πr³ ÷ 2πr³'], s: ['(4/3)/2 = 2/3 — Archimedes\' favourite result.'] },
          { q: 'Doubling the radius of a sphere multiplies its volume by:', a: '8', w: ['2', '4', '6'], h: ['2³'], s: ['(2r)³ = 8r³'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 11 AREAS
const ch11: USpec = {
  id: 'ts9.m.ch11', subject: 'math', title: 'Areas', source: src(11),
  objectives: [
    {
      id: 'ts9.m.area.planar', title: 'Area of planar regions',
      intro: [
        h('Measuring a flat region'),
        p('A farmer near Suryapet divides his field among his children. To be fair, each part must have the same AREA — the amount of surface inside the boundary — even if the shapes differ.'),
        def('Area', 'The measure of the planar region enclosed by a closed figure, in square units.'),
        keys('Congruent figures have equal areas (they cover each other exactly).', 'Figures with equal areas need NOT be congruent (a 4 × 4 square and a 2 × 8 rectangle).', 'If a region is split into non-overlapping parts, its area is the sum of their areas.'),
        p('Using these facts with the area of a rectangle, we get the area of a triangle: a triangle is half of a parallelogram (or rectangle) on the same base with the same height.'),
        f('area of a triangle = ½ × base × height', 'area of a triangle equals half base times height'),
        X({
          title: 'What if? Change the base and the height of a triangle', formula: 'A = ½ × b × h',
          result: ['A', 'Area', 'b * h / 2', 'cm²', 1],
          vars: [['b', 'Base', 1, 30, 1, 10, 'cm'], ['h', 'Height (perpendicular to the base)', 1, 30, 1, 6, 'cm']],
          notes: [
            ['b', 'Doubling the base doubles the area.', 'Halving the base halves the area.'],
            ['h', 'Doubling the height doubles the area.', 'Halving the height halves the area.'],
          ],
          mistakes: [
            ['Using a slanting side as the height', 'The height must be PERPENDICULAR to the base.'],
            ['Forgetting the ½', 'Base × height is the area of the whole parallelogram; a triangle is half of it.'],
          ],
          real: 'A triangular plot with a 30 m frontage and 20 m depth (perpendicular) has area 300 m².',
        }),
        remember('Equal area does not mean congruent; congruent always means equal area.'),
        tip('Break an awkward shape into rectangles and triangles, find each area, then add.'),
      ],
      examples: [
        ex('Find the area of a triangle with base 12 cm and height 7 cm.', ['½ × 12 × 7'], '42 cm²'),
        ex('An L-shaped room is made of a 6 m × 4 m part and a 3 m × 2 m part. Find its area.', ['24 + 6'], '30 m²'),
      ],
      practice: [
        tp('tri', (r) => {
          const b = r.int(3, 30), hh = r.int(2, 20);
          return typed(`Find the area of a triangle with base ${b} cm and height ${hh} cm.`, num(b * hh / 2, 'cm²'),
            ['A = ½ × b × h.'], [`½ × ${b} × ${hh} = ${b * hh / 2} cm²`], [[String(b * hh), 'Halve it: a triangle is half a parallelogram.']]);
        }),
        tp('compose', (r) => {
          const a = r.int(4, 12), b = r.int(3, 9), c = r.int(2, 6), d = r.int(2, 6);
          return typed(`A floor is made of two non-overlapping rectangles, ${a} m × ${b} m and ${c} m × ${d} m. Find its total area.`, num(a * b + c * d, 'm²'),
            ['Area of a whole = sum of the areas of its non-overlapping parts.'], [`${a * b} + ${c * d} = ${a * b + c * d} m²`]);
        }),
        tp('height', (r) => {
          const b = r.int(4, 20), hh = r.int(2, 15);
          const A = b * hh / 2;
          return typed(`A triangle has area ${A} cm² and base ${b} cm. Find its height.`, num(hh, 'cm'),
            ['A = ½ × b × h, so h = 2A ÷ b.'], [`h = 2 × ${A} ÷ ${b} = ${hh} cm`], [[String(rd(A / b, 2)), 'Double the area first: h = 2A/b.']]);
        }),
        bank('facts', [
          { q: 'Two congruent figures always have:', a: 'equal areas', w: ['different areas', 'areas in ratio 1 : 2', 'equal areas only if they are squares'], h: ['They cover each other exactly.'], s: ['Congruent figures have equal areas.'] },
          { q: 'Two figures have equal areas. Then they:', a: 'may or may not be congruent', w: ['must be congruent', 'cannot be congruent', 'must be squares'], h: ['Compare a 4 × 4 square and a 2 × 8 rectangle.'], s: ['Equal area does not force congruence.'] },
          { q: 'The area of a region split into two non-overlapping parts P and Q is:', a: 'area(P) + area(Q)', w: ['area(P) × area(Q)', 'area(P) − area(Q)', 'the larger of the two'], h: ['Area is additive.'], s: ['Add the parts.'] },
          { q: 'Area is measured in:', a: 'square units', w: ['cubic units', 'linear units', 'degrees'], h: ['cm², m²'], s: ['Area uses square units.'] },
          { q: 'The height of a triangle must be:', a: 'perpendicular to the chosen base', w: ['the longest side', 'parallel to the base', 'equal to the base'], h: ['Drop a perpendicular from the opposite vertex.'], s: ['Height ⟂ base.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.area.rect', title: 'Area of a rectangle', prereqs: ['ts9.m.area.planar'],
      intro: [
        h('Counting unit squares'),
        p('Lay 1 m × 1 m tiles on a verandah 6 m long and 4 m wide: 4 rows of 6 tiles = 24 tiles. That is why area of a rectangle = length × breadth. A square is a rectangle with l = b, so its area is a².'),
        keys('Rectangle: A = l × b, perimeter = 2(l + b).', 'Square: A = a², perimeter = 4a.', 'Path of width w OUTSIDE a rectangle l × b: area = (l + 2w)(b + 2w) − lb.', 'Path of width w INSIDE: area = lb − (l − 2w)(b − 2w).'),
        f('A = l × b', 'area equals length times breadth'),
        X({
          title: 'What if? Stretch a rectangle', formula: 'A = l × b',
          result: ['A', 'Area', 'l * b', 'm²'],
          vars: [['l', 'Length', 1, 40, 1, 12, 'm'], ['b', 'Breadth', 1, 30, 1, 8, 'm']],
          notes: [
            ['l', 'Each extra metre of length adds a strip of b square metres.', 'Each metre less removes a strip of b square metres.'],
            ['b', 'Each extra metre of breadth adds a strip of l square metres.', 'Each metre less removes a strip of l square metres.'],
          ],
          mistakes: [
            ['Mixing up area and perimeter', 'Area counts squares inside (m²); perimeter measures the boundary (m).'],
            ['Path area = 2w(l + b)', 'That misses the four corner squares. Use (l + 2w)(b + 2w) − lb.'],
          ],
          real: 'Tiling a 12 m × 8 m hall with 0.5 m × 0.5 m tiles needs 96 ÷ 0.25 = 384 tiles.',
        }),
        remember('Same perimeter does not mean same area: 5 × 5 and 9 × 1 both have perimeter 20 but areas 25 and 9.'),
        tip('To count tiles: area of floor ÷ area of one tile (same units!).'),
      ],
      examples: [
        ex('A garden is 20 m × 15 m with a 2 m wide path all round outside. Find the area of the path.', ['Outer: 24 × 19 = 456 m²', 'Garden: 300 m²'], '156 m²'),
        ex('A square has perimeter 36 cm. Find its area.', ['Side = 9 cm'], '81 cm²'),
      ],
      practice: [
        tp('area', (r) => {
          const l = r.int(3, 40), b = r.int(2, 30);
          return typed(`Find the area of a rectangular field ${l} m long and ${b} m wide.`, num(l * b, 'm²'),
            ['A = l × b.'], [`${l} × ${b} = ${l * b} m²`], [[String(2 * (l + b)), 'That is the perimeter.']]);
        }),
        tp('side', (r) => {
          const l = r.int(4, 30), b = r.int(2, 20);
          return typed(`A rectangle has area ${l * b} cm² and length ${l} cm. Find its breadth.`, num(b, 'cm'),
            ['b = A ÷ l.'], [`${l * b} ÷ ${l} = ${b} cm`]);
        }),
        tp('path', (r) => {
          const l = r.int(10, 30), b = r.int(6, 20), w = r.int(1, 3);
          const A = (l + 2 * w) * (b + 2 * w) - l * b;
          return typed(`A rectangular lawn is ${l} m × ${b} m. A path ${w} m wide runs all round it on the outside. Find the area of the path.`, num(A, 'm²'),
            ['Outer rectangle: (l + 2w) by (b + 2w).', 'Path = outer area − lawn area.'],
            [`Outer: ${l + 2 * w} × ${b + 2 * w} = ${(l + 2 * w) * (b + 2 * w)} m²`, `Lawn: ${l * b} m²`, `Path: ${A} m²`],
            [[String(2 * w * (l + b)), 'You missed the four corner squares.'], [String((l + w) * (b + w) - l * b), 'The path adds w on BOTH sides: use l + 2w.']], { steps: [st('Area of the outer rectangle?', num((l + 2 * w) * (b + 2 * w))), st('Area of the path?', num(A))] });
        }, 2),
        tp('tiles', (r) => {
          const l = r.int(3, 10), b = r.int(2, 8), t = r.pick([0.5, 0.25]);
          const n = (l * b) / (t * t);
          return typed(`How many square tiles of side ${t} m are needed to cover a floor ${l} m × ${b} m?`, num(n),
            ['Number of tiles = floor area ÷ tile area.'], [`Floor = ${l * b} m², tile = ${t * t} m²`, `${l * b} ÷ ${t * t} = ${n}`],
            [[String(l * b / t), 'Divide by the AREA of a tile, t².']]);
        }, 2),
        bank('facts', [
          { q: 'Rectangles with the same perimeter always have:', a: 'possibly different areas', w: ['the same area', 'the same length', 'area equal to perimeter'], h: ['Compare 5 × 5 and 9 × 1.'], s: ['Same perimeter 20, areas 25 and 9.'] },
          { q: 'If both the length and breadth of a rectangle are doubled, its area becomes:', a: '4 times', w: ['2 times', '8 times', 'unchanged'], h: ['2l × 2b'], s: ['4lb'] },
          { q: 'The area of a square of side 1.5 m is:', a: '2.25 m²', w: ['3 m²', '6 m²', '2.5 m²'], h: ['1.5 × 1.5'], s: ['2.25 m²'] },
          { q: 'A square and a rectangle 16 cm × 4 cm have the same area. The side of the square is:', a: '8 cm', w: ['10 cm', '4 cm', '16 cm'], h: ['a² = 64'], s: ['a = 8 cm'] },
          { q: 'Among all rectangles with perimeter 40 m, the largest area is:', a: '100 m² (the square 10 × 10)', w: ['75 m²', '99 m²', '400 m²'], h: ['Try 10 × 10, 11 × 9, 15 × 5.'], s: ['The square gives the largest area.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.area.para', title: 'Parallelograms on the same base and between the same parallels', prereqs: ['ts9.m.area.rect', 'ts9.m.quad.parallelogram'],
      intro: [
        h('Push it over — the area stays the same'),
        p('Stack a pile of notebooks into a neat cuboid, then push it so it leans. Seen from the side, the rectangle becomes a parallelogram — but the same notebooks are there, so the area is unchanged. This is the idea behind the theorem.'),
        def('Same base and between the same parallels', 'Two figures share a side (the base), and the vertices opposite the base lie on one line parallel to the base.'),
        def('Theorem', 'Parallelograms on the same base and between the same parallels are equal in area.'),
        p('Proof idea: for parallelograms ABCD and EFCD on base DC between parallels AF and DC, △ADE ≅ △BCF (ASA). Area ABCD = area of trapezium EBCD + △ADE = area of EBCD + △BCF = area EFCD.'),
        p('So every such parallelogram has the same area as the rectangle on that base with the same height:'),
        f('area of a parallelogram = base × height', 'area of a parallelogram equals base times height'),
        X({
          title: 'What if? Lean the parallelogram', formula: 'A = b × h (the slant does not matter)',
          result: ['A', 'Area', 'b * h', 'cm²'],
          vars: [['b', 'Base', 1, 30, 1, 10, 'cm'], ['h', 'Distance between the parallels', 1, 20, 1, 6, 'cm'], ['s', 'Slide of the top side', -10, 10, 1, 3, 'cm']],
          notes: [
            ['s', 'Sliding the top side along its parallel line changes the shape but NOT the area: the result does not depend on the slide.', 'Sliding back still gives the same area.'],
            ['h', 'Moving the parallels further apart increases the area in proportion.', 'Moving them closer reduces the area.'],
          ],
          mistakes: [
            ['Multiplying base × slant side', 'Use the perpendicular distance between the parallels, not the slanting side.'],
            ['Thinking a more slanted parallelogram has more area', 'Between the same parallels on the same base, all parallelograms have equal area.'],
          ],
          real: 'A leaning stack of 50 notebooks covers the same side area as an upright stack.',
        }),
        keys('Same base + same parallels ⇒ equal area.', 'A triangle and a parallelogram on the same base between the same parallels: triangle = ½ parallelogram.', 'Area of a parallelogram = base × corresponding height (any side can be the base).'),
        remember('Height = perpendicular distance between the two parallel lines.'),
        tip('In a parallelogram, b₁ × h₁ = b₂ × h₂ — use this to find a missing height.'),
      ],
      examples: [
        ex('ABCD is a parallelogram with AB = 16 cm. The altitude to AB is 8 cm and the altitude to AD is 10 cm. Find AD.', ['Area = 16 × 8 = 128 cm²', 'AD × 10 = 128'], 'AD = 12.8 cm'),
        ex('Parallelogram ABCD has area 60 cm². E is any point on CD. Find the area of △ABE.', ['△ABE and ABCD share base AB and lie between AB ∥ CD.'], '30 cm²'),
      ],
      practice: [
        tp('area', (r) => {
          const b = r.int(4, 25), hh = r.int(3, 15), s = r.int(hh + 1, hh + 6);
          return typed(`A parallelogram has base ${b} cm, slanting side ${s} cm and height ${hh} cm. Find its area.`, num(b * hh, 'cm²'),
            ['Area = base × height.', 'The slanting side is not the height.'], [`${b} × ${hh} = ${b * hh} cm²`], [[String(b * s), 'Use the perpendicular height, not the slanting side.']]);
        }),
        tp('height2', (r) => {
          const A = r.pick([48, 60, 72, 96, 120, 144]);
          const ds = [4, 6, 8, 12].filter((d) => A % d === 0);
          const b1 = r.pick(ds);
          let b2 = r.pick(ds);
          while (b2 === b1) b2 = r.pick(ds);
          return typed(`In parallelogram ABCD, AB = ${b1} cm and the height to AB is ${A / b1} cm. AD = ${b2} cm. Find the height to AD.`, num(A / b2, 'cm'),
            ['Find the area first.', 'Area = AD × (height to AD).'], [`Area = ${b1} × ${A / b1} = ${A} cm²`, `Height to AD = ${A} ÷ ${b2} = ${A / b2} cm`]);
        }, 2),
        tp('half', (r) => {
          const A = 2 * r.int(10, 80);
          const tri = r.next() < 0.5;
          return tri
            ? typed(`Parallelogram PQRS has area ${A} cm². X is a point on side RS. Find the area of △PQX.`, num(A / 2, 'cm²'), ['△PQX and PQRS have the same base PQ.', 'They lie between the same parallels PQ and SR.'], [`Area = ½ × ${A} = ${A / 2} cm²`], [[String(A), 'A triangle is HALF of the parallelogram.']])
            : typed(`A triangle and a parallelogram are on the same base and between the same parallels. The triangle has area ${A / 2} cm². Find the area of the parallelogram.`, num(A, 'cm²'), ['Triangle = ½ parallelogram.'], [`Parallelogram = 2 × ${A / 2} = ${A} cm²`]);
        }),
        bank('facts', [
          { q: 'Parallelograms on the same base and between the same parallels have:', a: 'equal areas', w: ['equal perimeters', 'equal angles', 'equal diagonals'], h: ['Think of the leaning notebooks.'], s: ['Their areas are equal.'] },
          { q: 'A rectangle and a parallelogram on the same base between the same parallels have:', a: 'equal areas', w: ['the rectangle bigger', 'the parallelogram bigger', 'equal perimeters'], h: ['A rectangle is a parallelogram.'], s: ['Equal areas.'] },
          { q: 'Between the same parallels, which has the larger perimeter: a rectangle or a slanting parallelogram on the same base?', a: 'The parallelogram', w: ['The rectangle', 'They are equal', 'It cannot be decided'], h: ['The slanting side is longer than the height.'], s: ['Equal areas, but the slanting sides are longer.'] },
          { q: 'The diagonal of a parallelogram divides it into two triangles of:', a: 'equal area', w: ['unequal area', 'area in ratio 1 : 2', 'equal perimeter always'], h: ['They are congruent.'], s: ['Congruent triangles → equal areas.'] },
          { q: 'Area of a parallelogram with base 9 cm and height 4 cm is:', a: '36 cm²', w: ['18 cm²', '26 cm²', '13 cm²'], h: ['b × h'], s: ['9 × 4 = 36'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.area.tri', title: 'Triangles on the same base and between the same parallels', prereqs: ['ts9.m.area.para'],
      intro: [
        h('Slide the top vertex'),
        p('Imagine a triangular flag on a string. Keep its base fixed on one rope and slide its top along a second rope parallel to the first. The shape changes, but the base and height stay the same — so the area stays the same.'),
        keys('Triangles on the same base (or equal bases) between the same parallels are equal in area.', 'Conversely, triangles on the same base with equal areas lie between the same parallels.', 'A median divides a triangle into two triangles of equal area (equal bases, same height).'),
        f('area of a triangle = ½ × base × height', 'half base times height'),
        X({
          title: 'What if? Slide the apex along the parallel line', formula: 'A = ½ × b × h',
          result: ['A', 'Area of the triangle', 'b * h / 2', 'cm²', 1],
          vars: [['b', 'Base', 1, 30, 1, 12, 'cm'], ['h', 'Distance between the parallels', 1, 20, 1, 8, 'cm'], ['s', 'How far the apex slides', -15, 15, 1, 0, 'cm']],
          notes: [
            ['s', 'Sliding the apex along the parallel line does not change the area at all.', 'Sliding it back does not change the area either.'],
            ['b', 'A longer base gives a larger area in proportion.', 'A shorter base gives a smaller area.'],
          ],
          mistakes: [
            ['Thinking a "taller-looking", more slanted triangle has more area', 'The height is the distance between the parallels; it does not change.'],
            ['Saying a median splits a triangle into congruent triangles', 'The two parts have equal AREA but usually are not congruent.'],
          ],
          real: 'A farmer can move a boundary peg along a line parallel to a canal and still keep the triangular plot\'s area the same.',
        }),
        remember('Median → two equal areas. Three medians → six equal areas.'),
        tip('To show two triangles have equal area, look for a common base and parallel lines.'),
      ],
      examples: [
        ex('AD is a median of △ABC with area 48 cm². Find the area of △ABD.', ['The median halves the area.'], '24 cm²'),
        ex('△ABC and △ABD are on base AB with C, D on a line parallel to AB. Area of △ABC = 35 cm². Find the area of △ABD.', ['Same base, same parallels'], '35 cm²'),
      ],
      practice: [
        tp('median', (r) => {
          const A = 2 * r.int(8, 90);
          return typed(`AD is a median of △ABC. If the area of △ABC is ${A} cm², find the area of △ADC.`, num(A / 2, 'cm²'),
            ['A median joins a vertex to the mid-point of the opposite side.', 'BD = DC and the height from A is common.'], [`Area = ${A} ÷ 2 = ${A / 2} cm²`], [[String(A), 'The median divides the area into two equal halves.']]);
        }),
        tp('same', (r) => {
          const b = r.int(4, 20), hh = r.int(3, 16);
          return typed(`△PQR and △PQS lie on base PQ = ${b} cm, with R and S on a line parallel to PQ at a distance of ${hh} cm. Find the area of △PQS.`, num(b * hh / 2, 'cm²'),
            ['Same base, between the same parallels → equal areas.', 'A = ½ × b × h.'], [`½ × ${b} × ${hh} = ${b * hh / 2} cm²`]);
        }),
        tp('medians6', (r) => {
          const A = 6 * r.int(3, 30);
          return typed(`The three medians of a triangle of area ${A} cm² divide it into six small triangles of equal area. Find the area of one of them.`, num(A / 6, 'cm²'),
            ['Divide the total area by 6.'], [`${A} ÷ 6 = ${A / 6} cm²`]);
        }),
        tp('ratio', (r) => {
          const b1 = r.int(2, 9), b2 = r.int(2, 9), hh = 2 * r.int(2, 10);
          return typed(`Two triangles lie between the same pair of parallel lines ${hh} cm apart. Their bases are ${b1} cm and ${b2} cm. Find the total of their areas.`, num((b1 + b2) * hh / 2, 'cm²'),
            ['Both triangles have height ' + hh + ' cm.', 'Add ½ × b × h for each.'], [`½ × ${hh} × (${b1} + ${b2}) = ${(b1 + b2) * hh / 2} cm²`]);
        }),
        bank('facts', [
          { q: 'Triangles on the same base and between the same parallels are:', a: 'equal in area', w: ['congruent', 'similar always', 'equal in perimeter'], h: ['Same base, same height.'], s: ['Equal in area (not necessarily congruent).'] },
          { q: 'A median of a triangle divides it into two triangles that are:', a: 'equal in area', w: ['always congruent', 'right-angled', 'unequal in area'], h: ['Equal bases, same height.'], s: ['Equal areas.'] },
          { q: 'If △ABC and △ABD have equal areas and C, D are on the same side of AB, then:', a: 'CD ∥ AB', w: ['CD ⟂ AB', 'C = D', 'AB = CD'], h: ['Converse of the theorem.'], s: ['Equal heights ⇒ C and D lie on a line parallel to AB.'] },
          { q: 'The diagonals of a parallelogram divide it into four triangles of:', a: 'equal area', w: ['two different areas', 'unequal areas', 'equal perimeters'], h: ['Each diagonal half is a median of a triangle.'], s: ['All four have equal area.'] },
          { q: 'Triangle ABC with base 10 cm between parallels 6 cm apart has area:', a: '30 cm²', w: ['60 cm²', '16 cm²', '15 cm²'], h: ['½ × 10 × 6'], s: ['30 cm²'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 12 CIRCLES
const ch12: USpec = {
  id: 'ts9.m.ch12', subject: 'math', title: 'Circles', source: src(12),
  objectives: [
    {
      id: 'ts9.m.circ.chord', title: 'Angle subtended by a chord at the centre',
      intro: [
        h('Chords and the angles they make'),
        p('A bangle, a bicycle wheel, the rim of a well — all are circles. A chord is a segment joining two points on a circle; the longest chord is a diameter. Join the ends of a chord to the centre O and you get an angle at the centre, ∠AOB.'),
        def('Chord', 'A line segment whose end points lie on the circle.'),
        def('Angle subtended at the centre', 'For chord AB, the angle ∠AOB formed at the centre.'),
        keys('Equal chords subtend equal angles at the centre (SSS on the two triangles).', 'Conversely, chords that subtend equal angles at the centre are equal.', 'Triangle OAB is isosceles (OA = OB = radius), so ∠OAB = ∠OBA = (180° − ∠AOB)/2.', 'A chord equal to the radius subtends 60° at the centre (equilateral triangle).'),
        f('∠OAB = (180° − ∠AOB) / 2', 'angle O A B equals 180 minus angle A O B, over 2'),
        X({
          title: 'What if? Lengthen the chord', formula: '∠OAB = (180° − θ)/2, θ = ∠AOB',
          result: ['b', 'Angle between chord and radius', '(180 - t) / 2', '°', 1],
          vars: [['t', 'Angle at the centre θ', 10, 179, 1, 100, '°']],
          notes: [['t', 'A longer chord subtends a bigger angle at the centre, so the angle between the chord and each radius gets smaller.', 'A shorter chord subtends a smaller central angle, so the chord meets each radius more steeply.']],
          mistakes: [
            ['Thinking a longer chord makes a smaller central angle', 'The diameter (longest chord) makes 180° — longer chords make bigger angles.'],
            ['Forgetting OA = OB', 'Both are radii, so △OAB is always isosceles.'],
          ],
          real: 'In a cycle wheel with 36 equally spaced spokes, neighbouring spokes make 10° at the hub.',
        }),
        remember('Equal chords ⇔ equal central angles (in the same or congruent circles).'),
        tip('Mark OA = OB immediately whenever you see a chord and the centre.'),
      ],
      examples: [
        ex('A chord AB subtends 110° at the centre O. Find ∠OAB.', ['△OAB is isosceles', '(180° − 110°)/2'], '35°'),
        ex('Chords AB and CD of a circle are equal and ∠AOB = 72°. Find ∠COD.', ['Equal chords → equal central angles'], '72°'),
      ],
      practice: [
        tp('base', (r) => {
          const t = 2 * r.int(10, 85);
          return typed(`Chord AB of a circle with centre O subtends ∠AOB = ${t}°. Find ∠OAB.`, num((180 - t) / 2, '°'),
            ['OA = OB (radii), so ∠OAB = ∠OBA.', 'Use the angle sum of △OAB.'], [`2∠OAB = 180° − ${t}° = ${180 - t}°`, `∠OAB = ${(180 - t) / 2}°`], [[String(180 - t), 'Halve it: there are two equal base angles.']]);
        }),
        tp('centre', (r) => {
          const b = r.int(15, 80);
          return typed(`In a circle with centre O, ∠OAB = ${b}° for chord AB. Find ∠AOB.`, num(180 - 2 * b, '°'),
            ['∠OBA = ∠OAB.'], [`∠AOB = 180° − 2 × ${b}° = ${180 - 2 * b}°`]);
        }),
        tp('equal', (r) => {
          const t = r.int(30, 150);
          return typed(`AB and CD are equal chords of a circle with centre O. If ∠AOB = ${t}°, find ∠COD.`, num(t, '°'),
            ['Equal chords subtend equal angles at the centre.'], [`∠COD = ∠AOB = ${t}°`], [[String(180 - t), 'The angles are EQUAL, not supplementary.']]);
        }),
        tp('spokes', (r) => {
          const n = r.pick([4, 5, 6, 8, 9, 10, 12, 18, 20, 24, 36]);
          return typed(`A circle is divided by ${n} equally spaced points. Each pair of neighbouring points forms a chord. What angle does each chord subtend at the centre?`, num(360 / n, '°'),
            ['The chords are equal, so the central angles are equal.', 'They add to 360°.'], [`360° ÷ ${n} = ${rd(360 / n, 2)}°`]);
        }),
        bank('facts', [
          { q: 'A chord equal to the radius subtends at the centre an angle of:', a: '60°', w: ['90°', '30°', '120°'], h: ['All three sides of △OAB are equal.'], s: ['Equilateral triangle → 60°.'] },
          { q: 'The longest chord of a circle is the:', a: 'diameter', w: ['radius', 'arc', 'tangent'], h: ['It passes through the centre.'], s: ['The diameter.'] },
          { q: 'If two chords subtend equal angles at the centre, they are:', a: 'equal', w: ['parallel', 'perpendicular', 'unequal'], h: ['Use SAS on the two triangles.'], s: ['They are equal.'] },
          { q: 'The angle subtended at the centre by a diameter is:', a: '180°', w: ['90°', '360°', '0°'], h: ['A, O, B are on one line.'], s: ['A straight angle, 180°.'] },
          { q: 'Triangle formed by a chord and two radii is always:', a: 'isosceles', w: ['right-angled', 'equilateral', 'scalene'], h: ['Two sides are radii.'], s: ['OA = OB.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.circ.perp', title: 'Perpendicular from the centre to a chord', prereqs: ['ts9.m.circ.chord'],
      intro: [
        h('The shortest path from the centre bisects the chord'),
        p('Fold a paper circle so that the two ends of a chord meet. The fold passes through the centre, cuts the chord in half and is perpendicular to it.'),
        keys('The perpendicular from the centre to a chord bisects the chord.', 'The line from the centre to the mid-point of a chord is perpendicular to it.', 'The perpendicular bisector of any chord passes through the centre.', 'Equal chords are equidistant from the centre, and chords equidistant from the centre are equal.', 'Exactly one circle passes through three non-collinear points.'),
        p('If the radius is r and the chord is at distance d from the centre, Pythagoras in the right triangle gives half the chord:'),
        f('chord length = 2√(r² − d²)', 'chord length equals 2 root r squared minus d squared'),
        X({
          title: 'What if? Move the chord away from the centre', formula: 'c = 2√(r² − d²)',
          result: ['c', 'Length of the chord', '2 * sqrt(r^2 - d^2)', 'cm', 2],
          vars: [['r', 'Radius', 5, 20, 1, 10, 'cm'], ['d', 'Distance of chord from centre', 0, 4.5, 0.5, 3, 'cm']],
          notes: [
            ['d', 'A chord further from the centre is shorter.', 'A chord closer to the centre is longer; at d = 0 it is a diameter, 2r.'],
            ['r', 'In a bigger circle, a chord at the same distance is longer.', 'In a smaller circle it is shorter.'],
          ],
          mistakes: [
            ['Forgetting to double', '√(r² − d²) is only HALF the chord.'],
            ['Using r² + d²', 'The radius is the hypotenuse: half-chord² = r² − d².'],
          ],
          real: 'To lay a plank across a circular well of radius 1.3 m, 0.5 m from the centre, it must be 2√(1.69 − 0.25) = 2.4 m long.',
        }),
        remember('Nearer to the centre ⇒ longer chord.'),
        tip('Draw the radius to one end of the chord: it is always the hypotenuse.'),
      ],
      examples: [
        ex('A chord 16 cm long is drawn in a circle of radius 10 cm. How far is it from the centre?', ['Half-chord = 8', 'd = √(100 − 64)'], '6 cm'),
        ex('A chord is 5 cm from the centre of a circle of radius 13 cm. Find its length.', ['Half = √(169 − 25) = 12'], '24 cm'),
      ],
      practice: [
        tp('chord', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
          const [d, half] = r.next() < 0.5 ? [a, b] : [b, a];
          return typed(`A chord is ${d} cm from the centre of a circle of radius ${c} cm. Find the length of the chord.`, num(2 * half, 'cm'),
            ['The perpendicular from the centre bisects the chord.', 'half-chord² = r² − d²'],
            [`half = √(${c * c} − ${d * d}) = ${half}`, `chord = ${2 * half} cm`], [[String(half), 'That is HALF the chord. Double it.']], { steps: [st('Half the chord?', num(half)), st('Whole chord?', num(2 * half))] });
        }),
        tp('dist', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
          const [d, half] = r.next() < 0.5 ? [a, b] : [b, a];
          return typed(`A chord of length ${2 * half} cm is drawn in a circle of radius ${c} cm. How far is it from the centre?`, num(d, 'cm'),
            ['Halve the chord first.', 'd² = r² − half²'], [`half = ${half}`, `d = √(${c * c} − ${half * half}) = ${d} cm`],
            [[String(rd(Math.sqrt(Math.max(0, c * c - 4 * half * half)), 2)), 'Use HALF the chord.']]);
        }),
        tp('radius', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [20, 21, 29]]);
          return typed(`A chord of length ${2 * b} cm is ${a} cm from the centre of a circle. Find the radius.`, num(c, 'cm'),
            ['The radius to an end of the chord is the hypotenuse.', 'r² = half² + d²'], [`r = √(${b * b} + ${a * a}) = ${c} cm`]);
        }),
        bank('facts', [
          { q: 'The perpendicular from the centre of a circle to a chord:', a: 'bisects the chord', w: ['is equal to the chord', 'passes outside the circle', 'trisects the chord'], h: ['Use RHS.'], s: ['It cuts the chord into two equal halves.'] },
          { q: 'Equal chords of a circle are:', a: 'equidistant from the centre', w: ['parallel', 'at different distances', 'always diameters'], h: ['Same half-length, same radius.'], s: ['They are the same distance from the centre.'] },
          { q: 'How many circles pass through three non-collinear points?', a: 'Exactly one', w: ['None', 'Two', 'Infinitely many'], h: ['The perpendicular bisectors meet at one point.'], s: ['Exactly one circle.'] },
          { q: 'Of two chords in a circle, the one nearer the centre is:', a: 'longer', w: ['shorter', 'equal', 'perpendicular to the other'], h: ['c = 2√(r² − d²)'], s: ['Smaller d → longer chord.'] },
          { q: 'The perpendicular bisector of a chord always passes through the:', a: 'centre', w: ['end of the chord', 'circumference only', 'mid-point of the radius'], h: ['Fold the circle.'], s: ['The centre.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.circ.arc', title: 'Angle subtended by an arc', prereqs: ['ts9.m.circ.chord'],
      intro: [
        h('Centre angle is double'),
        p('Stand at the centre of a circular ground and look at a goalpost on the edge; then walk to the edge and look again. From the centre the goalpost looks twice as wide (in angle) as from any point on the remaining part of the circle.'),
        def('Arc', 'A part of the circle between two points. The minor arc is the smaller one, the major arc the larger.'),
        keys('The angle subtended by an arc at the centre is DOUBLE the angle it subtends at any point on the remaining part of the circle.', 'Angles in the same segment are equal.', 'The angle in a semicircle is a right angle (half of 180°).', 'Congruent arcs (or equal chords) subtend equal angles at the centre.'),
        f('∠AOB = 2 ∠ACB', 'angle at the centre equals twice the angle at the circumference'),
        X({
          title: 'What if? Change the angle at the circumference', formula: '∠AOB = 2 × ∠ACB',
          result: ['c', 'Angle at the centre', '2 * x', '°'],
          vars: [['x', 'Angle at the circumference ∠ACB', 5, 90, 1, 35, '°']],
          notes: [['x', 'A bigger angle at the edge means a longer arc, and the central angle grows twice as fast.', 'At x = 90° the arc is a semicircle and the central angle is 180°.']],
          mistakes: [
            ['Halving instead of doubling', 'The angle at the CENTRE is the larger one.'],
            ['Using a point C on the same arc AB', 'C must be on the remaining part of the circle (the other arc).'],
          ],
          real: 'A photographer standing anywhere on a circular track sees a fixed banner (on the far arc) at the same angle — angles in the same segment are equal.',
        }),
        remember('Diameter → 90° at any point on the circle.'),
        tip('Look for the arc first, then find the centre angle and the edge angle that "stand on" it.'),
      ],
      examples: [
        ex('∠AOB = 140° at the centre. Find ∠ACB for C on the major arc.', ['½ × 140°'], '70°'),
        ex('AB is a diameter and C a point on the circle. ∠CAB = 35°. Find ∠CBA.', ['∠ACB = 90°', '180° − 90° − 35°'], '55°'),
      ],
      practice: [
        tp('centre', (r) => {
          const x = r.int(15, 85);
          const rev = r.next() < 0.5;
          return rev
            ? typed(`O is the centre of a circle. Arc AB subtends ∠AOB = ${2 * x}° at the centre. C is on the major arc. Find ∠ACB.`, num(x, '°'), ['The angle at the centre is double the angle at the circle.'], [`∠ACB = ${2 * x}° ÷ 2 = ${x}°`], [[String(4 * x), 'Halve, do not double: the centre angle is the larger one.']])
            : typed(`C is a point on a circle with centre O, on the major arc AB, and ∠ACB = ${x}°. Find ∠AOB.`, num(2 * x, '°'), ['Angle at the centre = 2 × angle at the circle.'], [`∠AOB = 2 × ${x}° = ${2 * x}°`], [[String(x / 2), 'The centre angle is DOUBLE, not half.']]);
        }),
        tp('semi', (r) => {
          const a = r.int(15, 75);
          return typed(`AB is a diameter of a circle and C is a point on it. ∠CAB = ${a}°. Find ∠CBA.`, num(90 - a, '°'),
            ['The angle in a semicircle is 90°.', 'Use the angle sum of △ABC.'], [`∠ACB = 90°`, `∠CBA = 180° − 90° − ${a}° = ${90 - a}°`], [[String(180 - a), 'Remember ∠ACB = 90°.']]);
        }),
        tp('same', (r) => {
          const x = r.int(20, 80);
          return typed(`Points C and D lie on the same arc of a circle on chord AB. ∠ACB = ${x}°. Find ∠ADB.`, num(x, '°'),
            ['Angles in the same segment are equal.'], [`∠ADB = ∠ACB = ${x}°`], [[String(180 - x), 'They are in the SAME segment: equal, not supplementary.']]);
        }),
        tp('iso', (r) => {
          const t = 2 * r.int(25, 80);
          return typed(`O is the centre and ∠AOB = ${t}°. C is on the major arc. Find ∠OAB + ∠ACB.`, num((180 - t) / 2 + t / 2, '°'),
            ['∠OAB = (180° − ∠AOB)/2.', '∠ACB = ∠AOB/2.'], [`∠OAB = ${(180 - t) / 2}°`, `∠ACB = ${t / 2}°`, `Sum = ${(180 - t) / 2 + t / 2}°`]);
        }, 3),
        bank('facts', [
          { q: 'The angle in a semicircle is:', a: '90°', w: ['180°', '45°', '60°'], h: ['Half of the 180° at the centre.'], s: ['90°'] },
          { q: 'Angles in the same segment of a circle are:', a: 'equal', w: ['supplementary', 'complementary', 'always 90°'], h: ['Each is half the same centre angle.'], s: ['They are equal.'] },
          { q: 'The angle at the centre is how many times the angle at the circumference on the same arc?', a: '2', w: ['½', '3', '1'], h: ['Centre angle is bigger.'], s: ['Twice.'] },
          { q: 'If ∠ACB = 90° for C on a circle, then AB is a:', a: 'diameter', w: ['radius', 'tangent', 'small chord'], h: ['Converse of the semicircle result.'], s: ['AB is a diameter.'] },
          { q: 'A minor arc subtends 100° at the centre. A point on the minor arc sees chord AB at:', a: '130°', w: ['50°', '100°', '200°'], h: ['The reflex angle at the centre is 260°.'], s: ['260° ÷ 2 = 130°'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.circ.cyclic', title: 'Cyclic quadrilaterals', prereqs: ['ts9.m.circ.arc'],
      intro: [
        h('Four corners on one circle'),
        p('Put four points on a circular rangoli border and join them in order. The quadrilateral is cyclic. Its opposite angles always add up to 180°.'),
        def('Cyclic quadrilateral', 'A quadrilateral whose four vertices all lie on one circle.'),
        p('Why? ∠A and ∠C stand on the two arcs BD. Their centre angles add to 360°, and each edge angle is half its centre angle, so ∠A + ∠C = 180°.'),
        keys('Opposite angles of a cyclic quadrilateral add to 180°.', 'Conversely, if a pair of opposite angles add to 180°, the quadrilateral is cyclic.', 'An exterior angle of a cyclic quadrilateral equals the interior opposite angle.', 'Every rectangle (and square) is cyclic; a parallelogram is cyclic only if it is a rectangle.'),
        f('∠A + ∠C = 180°,  ∠B + ∠D = 180°', 'opposite angles add to 180'),
        X({
          title: 'What if? Change one angle of a cyclic quadrilateral', formula: '∠C = 180° − ∠A',
          result: ['C', 'Opposite angle', '180 - A', '°'],
          vars: [['A', 'Angle A', 10, 170, 1, 70, '°']],
          notes: [['A', 'Moving A closer to the chord BD widens ∠A, so the opposite angle C must shrink to keep 180°.', 'A narrower ∠A means ∠C grows.']],
          mistakes: [
            ['Adding adjacent angles to 180°', 'It is OPPOSITE angles (A and C, B and D) that add to 180°.'],
            ['Assuming every quadrilateral is cyclic', 'Only those with opposite angles supplementary; a non-rectangular parallelogram is not.'],
          ],
          real: 'Engineers check that four wheel hubs lie on one circle using the 180° test on opposite angles.',
        }),
        remember('Exterior angle of a cyclic quadrilateral = interior opposite angle.'),
        tip('Name the vertices in order around the circle before pairing opposite angles.'),
      ],
      examples: [
        ex('ABCD is cyclic with ∠A = 75° and ∠B = 110°. Find ∠C and ∠D.', ['∠C = 180° − 75°', '∠D = 180° − 110°'], '∠C = 105°, ∠D = 70°'),
        ex('Side AB of cyclic quadrilateral ABCD is extended to E. ∠ADC = 95°. Find ∠CBE.', ['Exterior angle = interior opposite angle'], '95°'),
      ],
      practice: [
        tp('opp', (r) => {
          const a = r.int(40, 140);
          const [P, Q] = r.pick([['A', 'C'], ['B', 'D'], ['C', 'A'], ['D', 'B']]);
          return typed(`ABCD is a cyclic quadrilateral with ∠${P} = ${a}°. Find ∠${Q}.`, num(180 - a, '°'),
            ['Opposite angles of a cyclic quadrilateral add to 180°.'], [`∠${Q} = 180° − ${a}° = ${180 - a}°`], [[String(a), 'Opposite angles are supplementary, not equal.']]);
        }),
        tp('ext', (r) => {
          const a = r.int(60, 130);
          return typed(`ABCD is a cyclic quadrilateral. Side AB is extended to E, and ∠ADC = ${a}°. Find the exterior angle ∠CBE.`, num(a, '°'),
            ['∠ABC = 180° − ∠ADC.', '∠CBE = 180° − ∠ABC.'], [`∠ABC = ${180 - a}°`, `∠CBE = 180° − ${180 - a}° = ${a}°`], [[String(180 - a), 'That is ∠ABC; the exterior angle is its supplement.']]);
        }),
        tp('algebra', (r) => {
          const x = r.int(15, 40), m = r.int(2, 3), c = r.int(5, 30);
          const d = 180 - m * x - c - x;
          return typed(`In cyclic quadrilateral PQRS, ∠P = (${m}x + ${c})° and ∠R = (x ${d < 0 ? '−' : '+'} ${Math.abs(d)})°. Find x.`, num(x),
            ['∠P and ∠R are opposite.', 'They add to 180°.'], [`${m}x + ${c} + x ${d < 0 ? '−' : '+'} ${Math.abs(d)} = 180`, `${m + 1}x = ${180 - c - d}`, `x = ${x}`]);
        }, 2),
        tp('iscyclic', (r) => {
          const a = r.int(50, 130), b = r.int(50, 130);
          const ok = r.next() < 0.5;
          const c = ok ? 180 - a : 180 - a + r.pick([-12, -6, 6, 12]);
          const d = 360 - a - b - c;
          return mcq(r, `A quadrilateral ABCD has ∠A = ${a}°, ∠B = ${b}°, ∠C = ${c}°, ∠D = ${d}°. Is it cyclic?`, ok ? `Yes, ∠A + ∠C = 180°` : `No, ∠A + ∠C = ${a + c}°`, [ok ? `No, ∠A + ∠B = ${a + b}°` : `Yes, all angles add to 360°`, 'Yes, every quadrilateral is cyclic'],
            ['Check a pair of OPPOSITE angles.'], [`∠A + ∠C = ${a + c}°`, ok ? 'Supplementary, so it is cyclic.' : 'Not 180°, so it is not cyclic.']);
        }),
        bank('facts', [
          { q: 'The opposite angles of a cyclic quadrilateral are:', a: 'supplementary', w: ['equal', 'complementary', 'always 90°'], h: ['They add to 180°.'], s: ['Supplementary.'] },
          { q: 'Which parallelogram is always cyclic?', a: 'A rectangle', w: ['A rhombus with no right angle', 'Every parallelogram', 'None'], h: ['Opposite angles must add to 180° and be equal.'], s: ['Equal and supplementary ⇒ 90° each ⇒ rectangle.'] },
          { q: 'An exterior angle of a cyclic quadrilateral equals:', a: 'the interior opposite angle', w: ['the adjacent interior angle', '90°', '180°'], h: ['Both are supplements of the same angle.'], s: ['It equals the interior opposite angle.'] },
          { q: 'If ∠A + ∠C = 180° in quadrilateral ABCD, then ABCD is:', a: 'cyclic', w: ['a parallelogram', 'a kite', 'a trapezium'], h: ['Converse theorem.'], s: ['It is cyclic.'] },
          { q: 'Taken in order, the angles of a quadrilateral are 80°, 110°, 100°, 70°. Is it cyclic?', a: 'Yes — 80° + 100° = 180° and 110° + 70° = 180°', w: ['No, the angles are all different', 'No, adjacent angles do not add to 180°', 'Only if it is a square'], h: ['Add OPPOSITE angles: 1st + 3rd, 2nd + 4th.'], s: ['80° + 100° = 180°, so the quadrilateral is cyclic.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 13 GEOMETRICAL CONSTRUCTIONS
const ch13: USpec = {
  id: 'ts9.m.ch13', subject: 'math', title: 'Geometrical Constructions', source: src(13),
  objectives: [
    {
      id: 'ts9.m.cons.basic', title: 'Basic constructions: perpendicular bisector, angle bisector and 60°', prereqs: ['ts9.m.tri.criteria'],
      intro: [
        h('Only a ruler and a compass'),
        p('Euclid allowed just two tools: an unmarked straight edge to draw lines and a compass to draw circles. With them you can bisect segments and angles and draw exact angles of 60°, 30°, 90°, 45° and more — no protractor needed.'),
        h('Perpendicular bisector of AB'),
        stepsB('With A as centre and radius more than ½ AB, draw arcs above and below AB.', 'With B as centre and the SAME radius, draw arcs cutting the first ones at P and Q.', 'Join PQ. It bisects AB at right angles.'),
        p('Why it works: PA = PB and QA = QB, so △PAQ ≅ △PBQ (SSS), and then the two triangles at the mid-point are congruent (SAS).'),
        h('Bisector of ∠ABC'),
        stepsB('With B as centre, draw an arc cutting BA at D and BC at E.', 'With D and E as centres and equal radius (more than ½ DE), draw arcs meeting at F.', 'Join BF. It bisects ∠ABC (△BDF ≅ △BEF by SSS).'),
        h('An angle of 60°'),
        stepsB('Draw ray OA. With O as centre draw an arc cutting OA at P.', 'With P as centre and the SAME radius, cut the arc at Q.', 'Join OQ: ∠QOA = 60°, because △OPQ is equilateral.'),
        f('bisected angle = x / 2', 'each half of a bisected angle is x over 2'),
        X({
          title: 'What if? Bisect different angles', formula: 'each half = x / 2',
          result: ['y', 'Each half', 'x / 2', '°', 1],
          vars: [['x', 'Angle to bisect', 10, 180, 5, 60, '°']],
          notes: [['x', 'Bisecting a bigger angle gives bigger halves. Bisect 60° → 30°, bisect 90° → 45°, bisect 180° → 90° (a perpendicular!).', 'Smaller angles give smaller halves: bisect 30° → 15°.']],
          mistakes: [
            ['Changing the compass width between the two arcs', 'For bisectors, the arcs from both centres must use the SAME radius.'],
            ['Radius less than half of AB', 'The arcs would not meet. Open the compass more than half the length.'],
          ],
          real: 'Bisecting the 180° angle on a straight line gives a perfect right angle — that is how masons set out a square corner with a rope.',
        }),
        keys('Constructible from 60° by bisecting and adding: 30°, 15°, 90°, 45°, 22½°, 120°, 75°, 105°, 135°, 150°.', 'Always keep the construction arcs; they are the proof.'),
        remember('60° comes from an equilateral triangle; 90° comes from bisecting 180° (or 60° + 30°).'),
        tip('120° = 60° + 60°: cut the arc twice with the same radius.'),
      ],
      examples: [
        ex('How do you construct an angle of 45°?', ['Construct 90° (perpendicular).', 'Bisect it.'], '45° = ½ × 90°'),
        ex('How do you construct 75°?', ['Construct 60° and 90° on the same ray.', 'Bisect the 30° between them and add to 60°.'], '75° = 60° + 15°'),
      ],
      practice: [
        orderT('perp', 'Put the steps for constructing the perpendicular bisector of AB in order.', ['Open the compass to more than half of AB.', 'With A as centre, draw arcs above and below AB.', 'With B as centre and the same radius, draw arcs cutting the first two at P and Q.', 'Join P and Q.'], ['Set the radius first.', 'Joining the points is the last step.']),
        orderT('bis', 'Put the steps for bisecting ∠ABC in order.', ['With B as centre, draw an arc cutting BA at D and BC at E.', 'With D as centre, draw an arc inside the angle.', 'With E as centre and the same radius, cut that arc at F.', 'Join BF.'], ['Start at the vertex B.', 'BF is drawn last.']),
        tapT('possible', 'Tap every angle you can construct exactly with ruler and compass alone (starting from 60° and bisecting / adding).', ['30°', '45°', '75°', '105°', '120°', '135°', '15°', '22.5°', '150°'], ['35°', '40°', '50°', '70°', '25°', '100°', '80°'],
          ['From 60° you can bisect and add.', 'Check: is it a sum of 60°, 30°, 15°, 45°, 22.5°, 90°?'], 'Angles like 40° or 70° cannot be made from 60° and 90° by halving and adding.'),
        tp('half', (r) => {
          const x = 15 * r.int(1, 12);
          const twice = r.next() < 0.4;
          return twice
            ? typed(`An angle of ${x}° is bisected, and then one half is bisected again. What is the smallest angle formed?`, num(x / 4, '°'), ['Each bisection halves the angle.'], [`${x}° → ${x / 2}° → ${x / 4}°`], [[String(x / 2), 'You bisected twice: halve again.']])
            : typed(`An angle of ${x}° is bisected with ruler and compass. What is each part?`, num(x / 2, '°'), ['Bisect = divide into two equal parts.'], [`${x}° ÷ 2 = ${x / 2}°`]);
        }),
        bank('facts', [
          { q: 'Constructing 60° works because the triangle formed is:', a: 'equilateral', w: ['isosceles right-angled', 'scalene', 'obtuse'], h: ['All three sides are the compass radius.'], s: ['Equilateral triangles have 60° angles.'] },
          { q: 'Bisecting a straight angle gives:', a: '90°', w: ['45°', '60°', '120°'], h: ['180° ÷ 2'], s: ['90°'] },
          { q: 'Every point on the perpendicular bisector of AB is:', a: 'equidistant from A and B', w: ['closer to A', 'on AB', 'at distance AB from A'], h: ['Use SAS.'], s: ['PA = PB for every point P on it.'] },
          { q: 'The angle bisector construction is justified by the congruence rule:', a: 'SSS', w: ['AAA', 'SSA', 'RHS only'], h: ['BD = BE, DF = EF, BF common.'], s: ['SSS.'] },
          { q: 'In Euclid\'s constructions the ruler is used:', a: 'only to draw straight lines (no measuring)', w: ['to measure every length', 'to draw circles', 'to measure angles'], h: ['It is an unmarked straight edge.'], s: ['Only for drawing lines.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.cons.triangle', title: 'Constructing triangles in special cases', prereqs: ['ts9.m.cons.basic', 'ts9.m.tri.inequal'],
      intro: [
        h('When two sides are not given separately'),
        p('Sometimes we know only the base BC, one base angle and the SUM (or DIFFERENCE) of the other two sides; or the perimeter and both base angles. Clever constructions still give the triangle.'),
        h('Case 1: base BC, ∠B and AB + AC'),
        stepsB('Draw BC and the angle ∠XBC = ∠B at B.', 'Cut BD = AB + AC on ray BX.', 'Join DC and draw its perpendicular bisector; it meets BD at A.', 'Join AC. △ABC is the triangle (A is on the bisector, so AD = AC and AB + AC = BD).'),
        h('Case 2: base BC, ∠B and AB − AC (AB > AC)'),
        stepsB('Draw BC and ray BX making ∠B.', 'Cut BD = AB − AC on BX.', 'Join DC; its perpendicular bisector meets BX at A.', 'Join AC.'),
        h('Case 3: perimeter, ∠B and ∠C'),
        stepsB('Draw XY = AB + BC + CA.', 'At X make ∠LXY = ½∠B and at Y make ∠MYX = ½∠C; let the rays meet at A.', 'Perpendicular bisectors of AX and AY meet XY at B and C.', 'Join AB and AC.'),
        p('A triangle is possible only if the given numbers obey the triangle inequality: in Case 1, AB + AC must be GREATER than BC.'),
        f('AB + AC = perimeter − BC', 'the sum of the other two sides equals the perimeter minus the base'),
        X({
          title: 'What if? Change the perimeter and the base', formula: 'AB + AC = P − BC',
          result: ['s', 'Sum of the other two sides', 'P - a', 'cm', 1],
          vars: [['P', 'Perimeter', 10, 30, 0.5, 18, 'cm'], ['a', 'Base BC', 2, 9, 0.5, 6, 'cm']],
          notes: [
            ['P', 'A bigger perimeter leaves more for the two other sides, so the apex rises higher.', 'A smaller perimeter leaves less; if the sum is not more than BC, no triangle exists.'],
            ['a', 'A longer base leaves less for the other two sides.', 'A shorter base leaves more for them.'],
          ],
          mistakes: [
            ['Accepting AB + AC = BC', 'The two sides would lie flat along BC. The sum must be strictly greater.'],
            ['Using ∠B instead of ½∠B in Case 3', 'The perimeter construction uses HALF of each base angle at X and Y.'],
          ],
          real: 'A fence of 18 m around a triangular flower bed with a 6 m front edge leaves 12 m for the other two sides.',
        }),
        remember('Check the triangle inequality before you start drawing.'),
        tip('In Cases 1 and 2, the perpendicular bisector of DC is the key: every point on it is equally far from D and C.'),
      ],
      examples: [
        ex('Can △ABC be drawn with BC = 8 cm, ∠B = 45° and AB + AC = 7 cm?', ['AB + AC must exceed BC.', '7 < 8'], 'No'),
        ex('A triangle has perimeter 15 cm and base 5 cm. What is AB + AC?', ['15 − 5'], '10 cm'),
      ],
      practice: [
        tp('sum', (r) => {
          const P = r.int(10, 30), a = r.int(3, Math.floor(P / 2) - 1);
          return typed(`A triangle has perimeter ${P} cm and base BC = ${a} cm. Find AB + AC.`, num(P - a, 'cm'),
            ['Perimeter = AB + BC + CA.'], [`AB + AC = ${P} − ${a} = ${P - a} cm`]);
        }),
        tp('possible', (r) => {
          const a = r.int(4, 10);
          const s = r.next() < 0.5 ? a + r.int(1, 5) : a - r.int(0, 3);
          const ok = s > a;
          return mcq(r, `Can △ABC be constructed with BC = ${a} cm, ∠B = ${r.pick([30, 45, 60, 75])}° and AB + AC = ${s} cm?`, ok ? `Yes, because ${s} > ${a}` : `No, because ${s} is not greater than ${a}`, [ok ? `No, because ${s} is not greater than ${a}` : `Yes, because ${s} > 0`, 'Yes, any lengths work'],
            ['Triangle inequality: AB + AC > BC.'], [ok ? 'The sum is greater than the base, so it is possible.' : 'The sum is not greater than the base, so no triangle exists.']);
        }),
        tp('halfangle', (r) => {
          const B = 2 * r.int(15, 45);
          return typed(`To construct a triangle from its perimeter and base angles ∠B = ${B}° and ∠C, you draw XY = perimeter. What angle do you draw at X?`, num(B / 2, '°'),
            ['The perimeter construction uses half of each base angle.'], [`½ × ${B}° = ${B / 2}°`], [[String(B), 'Use HALF of ∠B.']]);
        }, 2),
        orderT('steps', 'Put the steps for constructing △ABC given BC, ∠B and AB + AC in order.', ['Draw the base BC.', 'Draw ray BX making the given angle ∠B.', 'Cut BD = AB + AC on ray BX.', 'Join DC and draw its perpendicular bisector to meet BD at A.', 'Join AC.'], ['Start with the base.', 'The perpendicular bisector finds A.']),
        bank('facts', [
          { q: 'In the AB + AC construction, why is A on the perpendicular bisector of DC?', a: 'So that AD = AC', w: ['So that AB = BC', 'So that ∠A = 90°', 'So that BD = BC'], h: ['Points on the perpendicular bisector are equidistant from D and C.'], s: ['AD = AC, so AB + AC = AB + AD = BD.'] },
          { q: 'A triangle with BC = 6 cm and AB + AC = 6 cm:', a: 'cannot be constructed', w: ['is equilateral', 'is right-angled', 'is isosceles'], h: ['Triangle inequality.'], s: ['The sum must be more than 6 cm.'] },
          { q: 'In the perimeter construction, the angles at X and Y are:', a: 'half of ∠B and ∠C', w: ['equal to ∠B and ∠C', 'double ∠B and ∠C', 'both 90°'], h: ['Isosceles triangles AXB and AYC.'], s: ['Half of each base angle.'] },
          { q: 'For the difference case AB − AC with AB > AC, the point D is cut on:', a: 'ray BX, at distance AB − AC from B', w: ['BC', 'the extension of BX below BC always', 'AC'], h: ['D lies on the ray making ∠B.'], s: ['BD = AB − AC on ray BX.'] },
          { q: 'Before constructing any triangle, you should check:', a: 'the triangle inequality', w: ['the area', 'the circumcircle', 'the colour of the pencil'], h: ['Can these lengths make a triangle?'], s: ['Check sums of sides exceed the remaining side.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.cons.segment', title: 'Constructing a circle segment on a chord containing a given angle', prereqs: ['ts9.m.cons.basic', 'ts9.m.circ.arc'],
      intro: [
        h('An arc from which a chord looks the same'),
        p('A cricket coach wants players to stand at all spots from which the two stumps of a practice net are seen at exactly 40°. All such spots lie on an arc of a circle through the stumps — a segment containing the angle 40°.'),
        stepsB('Draw the chord AB.', 'At A, draw ray AX making ∠BAX = θ (the given angle) below AB.', 'At A, draw AY perpendicular to AX.', 'Draw the perpendicular bisector of AB; it meets AY at O.', 'With centre O and radius OA, draw the circle. The segment on the side of AB opposite to AX contains the angle θ.'),
        p('Why it works: AX touches the circle at A (it is perpendicular to the radius OA). The angle between a tangent and a chord equals the angle in the alternate segment, so every point P on that arc sees AB at ∠APB = θ. Also ∠OAB = 90° − θ, and the angle at the centre is 2θ.'),
        f('∠OAB = 90° − θ;  ∠AOB = 2θ', 'angle O A B equals 90 minus theta'),
        X({
          title: 'What if? Change the angle the segment must contain', formula: '∠OAB = 90° − θ',
          result: ['g', 'Angle between radius OA and chord AB', '90 - t', '°'],
          vars: [['t', 'Given angle θ', 10, 89, 1, 40, '°']],
          notes: [['t', 'A larger θ moves the centre O closer to the chord; at θ = 90° O is ON the chord and the segment is a semicircle.', 'A smaller θ moves O further from the chord and the circle becomes larger.']],
          mistakes: [
            ['Drawing the arc on the same side as AX', 'The required segment is on the side of AB OPPOSITE to the ray AX.'],
            ['Making ∠BAX = 90° − θ', 'AX makes θ with AB; it is AY (the perpendicular) that makes 90° − θ.'],
          ],
          real: 'Stadium designers use such arcs so that every seat in a row sees the stage at the same angle.',
        }),
        remember('θ < 90° → the segment is a major segment; θ = 90° → semicircle; θ > 90° → minor segment.'),
        tip('Check your figure: pick any point P on the arc and measure ∠APB — it should be θ.'),
      ],
      examples: [
        ex('For a segment containing 60° on chord AB, what is ∠OAB?', ['90° − 60°'], '30°'),
        ex('What is the angle at the centre for a segment containing 35°?', ['2 × 35°'], '70°'),
      ],
      practice: [
        tp('oab', (r) => {
          const t = r.int(15, 85);
          return typed(`In the construction of a segment on chord AB containing an angle of ${t}°, find ∠OAB (O is the centre).`, num(90 - t, '°'),
            ['AY ⟂ AX and ∠BAX = θ.', '∠OAB = 90° − θ.'], [`90° − ${t}° = ${90 - t}°`], [[String(t), 'That is ∠BAX; OA is perpendicular to AX.']]);
        }),
        tp('centre', (r) => {
          const t = r.int(15, 85);
          return typed(`A segment of a circle on chord AB contains the angle ${t}°. What angle does AB subtend at the centre?`, num(2 * t, '°'),
            ['Angle at centre = 2 × angle in the segment.'], [`2 × ${t}° = ${2 * t}°`], [[String(t / 2), 'Double it, do not halve it.']]);
        }),
        orderT('steps', 'Put the steps for constructing a segment on chord AB containing angle θ in order.', ['Draw the chord AB.', 'At A draw ray AX with ∠BAX = θ.', 'Draw AY perpendicular to AX at A.', 'Draw the perpendicular bisector of AB to meet AY at O.', 'With centre O and radius OA draw the circle; use the arc on the side opposite AX.'], ['Chord first, circle last.']),
        tp('kind', (r) => {
          const t = r.pick([r.int(20, 80), 90, r.int(100, 160)]);
          const ok = t < 90 ? 'a major segment' : t === 90 ? 'a semicircle' : 'a minor segment';
          return mcq(r, `A segment of a circle on chord AB contains the angle ${t}°. Which kind of segment is it?`, ok, ['a major segment', 'a semicircle', 'a minor segment'].filter((x) => x !== ok),
            ['An angle in a semicircle is 90°.', 'Bigger segments contain smaller angles.'], [`${t}° ${t < 90 ? '< 90°' : t === 90 ? '= 90°' : '> 90°'} → ${ok}`]);
        }),
        bank('facts', [
          { q: 'In the construction, ray AX is a:', a: 'tangent to the circle at A', w: ['diameter', 'chord', 'radius'], h: ['AX ⟂ OA.'], s: ['A line perpendicular to a radius at its end is a tangent.'] },
          { q: 'The centre O lies on:', a: 'the perpendicular bisector of AB and on AY', w: ['AX', 'AB itself', 'the bisector of ∠BAX'], h: ['O is equidistant from A and B, and OA ⟂ AX.'], s: ['O is where those two lines meet.'] },
          { q: 'Every point P on the constructed arc satisfies:', a: '∠APB = θ', w: ['∠APB = 2θ', '∠APB = 90°', 'PA = PB'], h: ['Angles in the same segment are equal.'], s: ['All see AB at θ.'] },
          { q: 'For θ = 90°, the centre O lies:', a: 'at the mid-point of AB', w: ['outside the circle', 'at A', 'far from AB'], h: ['Angle in a semicircle.'], s: ['AB is a diameter.'] },
          { q: 'The angle between chord AB and tangent AX equals:', a: 'the angle in the alternate segment', w: ['90°', 'the angle at the centre', 'half the angle at the centre plus 90°'], h: ['Alternate segment theorem.'], s: ['That is why the arc contains θ.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 14 PROBABILITY
const ch14: USpec = {
  id: 'ts9.m.ch14', subject: 'math', title: 'Probability', source: src(14),
  objectives: [
    {
      id: 'ts9.m.prob.experimental', title: 'Probability from experiments',
      intro: [
        h('How likely is it?'),
        photo('🎲', 'Rolling a die many times shows how often each face turns up.'),
        p('"It will probably rain today." "Our team will most likely win." We use such words every day. Probability puts a NUMBER on how likely an event is. In the experimental approach, we repeat an experiment many times and count.'),
        def('Trial', 'One performance of an experiment, such as one toss of a coin.'),
        def('Event', 'An outcome or a group of outcomes we are interested in, such as "getting a head".'),
        def('Experimental probability', 'P(E) = (number of trials in which E happened) ÷ (total number of trials).'),
        f('P(E) = (number of times E occurred) / (total number of trials)', 'P of E equals times E happened over total trials'),
        X({
          title: 'What if? Run more trials', formula: 'P(E) = n(E) / N',
          result: ['P', 'Experimental probability', 'E / N', '', 3],
          vars: [['E', 'Times the event happened', 0, 50, 1, 27], ['N', 'Total trials', 50, 500, 10, 50]],
          notes: [
            ['E', 'More successes out of the same number of trials raise the probability.', 'Fewer successes lower it.'],
            ['N', 'With the same number of successes spread over more trials, the probability falls.', 'Fewer trials with the same successes raise it.'],
          ],
          mistakes: [
            ['Dividing by the number of times E did NOT happen', 'Divide by the TOTAL number of trials.'],
            ['Expecting exactly half heads in 10 tosses', 'Experimental results vary; they settle near ½ only over many trials.'],
          ],
          real: 'If a seed company finds 460 of 500 seeds germinate, the probability that a seed germinates is 460/500 = 0.92.',
        }),
        keys('0 ≤ P(E) ≤ 1.', 'P = 0: the event never happened; P = 1: it happened every time.', 'P(not E) = 1 − P(E).', 'More trials give a more reliable estimate.'),
        remember('The sum of the probabilities of all the different outcomes of an experiment is 1.'),
        tip('Write the probability as a fraction first, then simplify or convert to a decimal.'),
      ],
      examples: [
        ex('A coin is tossed 500 times and lands heads 285 times. Find P(head) and P(tail).', ['P(head) = 285/500 = 0.57', 'P(tail) = 1 − 0.57'], 'P(head) = 0.57, P(tail) = 0.43'),
        ex('A die is thrown 60 times and shows 6 eleven times. Find P(6).', ['11/60'], '11/60 ≈ 0.18'),
      ],
      practice: [
        tp('coin', (r) => {
          const N = r.pick([50, 100, 200, 250, 500, 1000]), H = r.int(Math.floor(N * 0.35), Math.floor(N * 0.65));
          const tails = r.next() < 0.5;
          return typed(`A coin is tossed ${N} times and shows heads ${H} times. Find the probability of getting ${tails ? 'a tail' : 'a head'}.`, frac(tails ? N - H : H, N),
            ['P = favourable trials ÷ total trials.', tails ? `Tails = ${N} − ${H}.` : `Heads = ${H}.`], [tails ? `Tails = ${N - H}` : `Heads = ${H}`, `P = ${tails ? N - H : H}/${N} = ${fx(tails ? N - H : H, N)}`],
            [[`${tails ? H : N - H}/${N}`, tails ? 'That is P(head). Count the tails.' : 'That is P(tail).']]);
        }),
        tp('die', (r) => {
          const fs = Array.from({ length: 6 }, () => r.int(5, 25));
          const N = fs.reduce((p1, q1) => p1 + q1, 0);
          const k = r.int(1, 6);
          return typed(`A die was thrown ${N} times. Outcomes 1–6 occurred ${fs.join(', ')} times. Find the experimental probability of getting ${k}.`, frac(fs[k - 1], N),
            ['Find how many times the face appeared.', 'Divide by the total number of throws.'], [`P(${k}) = ${fs[k - 1]}/${N}`],
            [['1/6', 'That is the theoretical value. Use the experiment\'s counts.']], { visual: { kind: 'bar-graph', labels: ['1', '2', '3', '4', '5', '6'], values: fs, unit: 'times' } });
        }),
        tp('complement', (r) => {
          const p100 = r.int(5, 95);
          return typed(`The probability that a bus to Warangal is late, found from records, is ${p100 / 100}. What is the probability that it is NOT late?`, approx(rd(1 - p100 / 100, 2), 0.001),
            ['P(not E) = 1 − P(E).'], [`1 − ${p100 / 100} = ${rd(1 - p100 / 100, 2)}`]);
        }),
        tp('table', (r) => {
          const N = r.pick([20, 25, 40, 50]);
          const a = r.int(2, N / 2), b = r.int(1, N - a - 1), c = N - a - b;
          const [nm1, nm2, nm3] = r.pick([['red', 'blue', 'green'], ['wins', 'draws', 'losses'], ['sunny', 'cloudy', 'rainy']]);
          return typed(`In ${N} trials the results were: ${nm1} ${a}, ${nm2} ${b}, ${nm3} ${c}. Find the probability of ${nm1} OR ${nm2}.`, frac(a + b, N),
            ['Add the favourable counts.', 'Or use 1 − P(the other outcome).'], [`(${a} + ${b})/${N} = ${fx(a + b, N)}`], [[`${c}/${N}`, `That is the probability of ${nm3}.`]]);
        }, 2),
        bank('facts', [
          { q: 'Which value can NOT be a probability?', a: '1.2', w: ['0', '0.5', '1'], h: ['0 ≤ P ≤ 1.'], s: ['Probabilities never exceed 1.'] },
          { q: 'If P(E) = 0.35, then P(not E) is:', a: '0.65', w: ['0.35', '0.5', '1.35'], h: ['They add to 1.'], s: ['1 − 0.35 = 0.65'] },
          { q: 'An event that happened in every trial has experimental probability:', a: '1', w: ['0', '0.5', '100'], h: ['n(E) = N.'], s: ['N/N = 1'] },
          { q: 'To make an experimental probability more reliable, you should:', a: 'increase the number of trials', w: ['stop after 2 trials', 'change the event', 'round to 0 or 1'], h: ['More data, better estimate.'], s: ['Many trials give a steadier value.'] },
          { q: 'The probabilities of all the different outcomes of an experiment add up to:', a: '1', w: ['0', '100', 'the number of outcomes'], h: ['Every trial has some outcome.'], s: ['The total is 1.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.prob.uses', title: 'Uses of probability in real life', prereqs: ['ts9.m.prob.experimental'],
      intro: [
        h('Planning with probability'),
        p('A Telangana weather report says "70% chance of rain" — out of many days with similar conditions, it rained on about 70 of every 100. Farmers decide when to sow, insurance companies decide premiums, factories check quality, and doctors judge how well a medicine works — all using probabilities estimated from past data.'),
        keys('Weather forecasts: past records of similar days.', 'Quality control: the fraction of faulty items in a sample predicts the fraction in a whole batch.', 'Insurance: data on how often events happen sets premiums.', 'Sports: a batter\'s past record predicts the chance of scoring.'),
        p('If the probability of an event is P and we repeat the situation N times, we EXPECT the event about P × N times (not exactly — it is an estimate).'),
        f('expected number = P(E) × N', 'expected number equals probability times number of trials'),
        X({
          title: 'What if? Predict how many', formula: 'expected = P × N',
          result: ['x', 'Expected number of times', 'p * N', '', 1],
          vars: [['p', 'Probability of the event', 0, 1, 0.01, 0.04], ['N', 'Number of items or trials', 10, 5000, 10, 1000]],
          notes: [
            ['p', 'A higher probability means the event is expected more often, in direct proportion.', 'A lower probability means fewer expected occurrences.'],
            ['N', 'Twice as many trials, twice as many expected occurrences.', 'Fewer trials, fewer expected occurrences.'],
          ],
          mistakes: [
            ['Treating the expected number as certain', 'It is the most reasonable estimate; the actual count will be near it, not exactly equal.'],
            ['Using the sample size instead of the batch size', 'Multiply P by the number of items you are predicting for.'],
          ],
          real: 'If 4% of bulbs tested are faulty, a shop ordering 1000 bulbs should expect about 40 faulty ones.',
        }),
        remember('Probability describes the long run, not a guarantee for the next trial.'),
        tip('Convert percentages to decimals before multiplying: 70% = 0.7.'),
      ],
      examples: [
        ex('In a sample of 200 phones, 6 were faulty. How many faulty phones are expected in 5000?', ['P = 6/200 = 0.03', '0.03 × 5000'], 'About 150'),
        ex('Records show rain on 18 of the last 30 days of July. Estimate P(rain on a July day).', ['18/30'], '3/5 = 0.6'),
      ],
      practice: [
        tp('expect', (r) => {
          const S = r.pick([50, 100, 200, 250, 400, 500]), f2 = r.int(2, Math.floor(S / 10)), N = r.pick([1000, 2000, 5000, 10000]);
          return typed(`In a sample of ${S} ${r.pick(['bulbs', 'eggs', 'pens', 'phones', 'bottles'])}, ${f2} were faulty. About how many faulty ones would you expect in a batch of ${N}?`, approx(rd((f2 / S) * N, 2), 0.01),
            ['Find P(faulty) from the sample.', 'Expected = P × batch size.'], [`P = ${f2}/${S}`, `Expected = ${f2}/${S} × ${N} = ${rd((f2 / S) * N, 2)}`],
            [[String(f2), 'That is for the sample only. Scale up to the batch.']], { steps: [st('Probability that one is faulty (as a fraction)?', frac(f2, S)), st('Expected number in the batch?', approx(rd((f2 / S) * N, 2), 0.01))] });
        }, 2),
        tp('weather', (r) => {
          const d = r.pick([30, 31]), rain = r.int(5, d - 3);
          return typed(`Weather records for a month of ${d} days in Adilabad show rain on ${rain} days. Estimate the probability that it rains on a given day of that month.`, frac(rain, d),
            ['P = days with rain ÷ total days.'], [`P = ${rain}/${d}`], [[`${d - rain}/${d}`, 'That is the probability of NO rain.']]);
        }),
        tp('percent', (r) => {
          const pc = r.pick([10, 20, 25, 30, 40, 60, 70, 75, 80, 90]), N = r.pick([20, 40, 60, 100, 200]);
          return typed(`A forecast says there is a ${pc}% chance of rain on days like today. Out of ${N} such days, on about how many would you expect rain?`, num((pc / 100) * N),
            [`${pc}% = ${pc / 100}`, 'Expected = P × N.'], [`${pc / 100} × ${N} = ${(pc / 100) * N}`]);
        }),
        tp('batter', (r) => {
          const inn = r.pick([20, 25, 40, 50]), fifty = r.int(2, Math.floor(inn / 2));
          return typed(`A batter scored 50 or more in ${fifty} of her last ${inn} innings. Estimate the probability that she scores 50 or more in her next innings.`, frac(fifty, inn),
            ['Use her past record as the experiment.'], [`P = ${fifty}/${inn} = ${fx(fifty, inn)}`]);
        }),
        bank('facts', [
          { q: 'A "70% chance of rain" means:', a: 'on about 70 of 100 days like this, it rains', w: ['it will rain for 70% of the day', 'it will rain in 70% of the area for sure', 'it will certainly rain'], h: ['Think long-run frequency.'], s: ['It is based on past days with similar weather.'] },
          { q: 'Insurance companies use probability mainly to:', a: 'decide premiums from how often events happen', w: ['decide the colour of the policy', 'guarantee no accidents', 'predict exact dates of events'], h: ['Past claims data.'], s: ['Premiums depend on estimated probabilities.'] },
          { q: 'A factory finds P(defect) = 0.02. In 500 items it expects about:', a: '10 defective', w: ['2 defective', '50 defective', '0 defective'], h: ['0.02 × 500'], s: ['10'] },
          { q: 'Why can probability not tell you the result of the NEXT toss?', a: 'It describes long-run frequency, not single outcomes', w: ['Because coins are unfair', 'Because probability is always 0.5', 'Because it only works for dice'], h: ['Each toss is uncertain.'], s: ['It predicts patterns over many trials.'] },
          { q: 'Which of these is a use of probability?', a: 'Estimating germination rate of seeds before sowing', w: ['Measuring the length of a field', 'Finding the area of a circle', 'Bisecting an angle'], h: ['Uncertain events from data.'], s: ['Germination tests give probabilities used by farmers.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.prob.outcomes', title: 'Outcomes, events and the total probability of 1', prereqs: ['ts9.m.prob.experimental'],
      intro: [
        h('All the possible results'),
        p('Toss a coin: head or tail. Throw a die: 1, 2, 3, 4, 5 or 6. These are the possible outcomes. An event can be a single outcome ("getting 6") or several ("getting an even number").'),
        keys('Every trial produces exactly one outcome, so the experimental probabilities of all outcomes add to 1.', 'An event that always happens has probability 1; one that never happens has 0.', 'P(E) + P(not E) = 1.', 'To find the probability of a group of outcomes, add their counts and divide by the total.'),
        f('P(E) + P(not E) = 1', 'P of E plus P of not E equals one'),
        X({
          title: 'What if? Change the chance of an event', formula: 'P(not E) = 1 − P(E)',
          result: ['q', 'Probability of NOT E', '1 - p', '', 2],
          vars: [['p', 'Probability of E', 0, 1, 0.01, 0.3]],
          notes: [['p', 'As E becomes more likely, "not E" becomes less likely by exactly the same amount.', 'As E becomes less likely, "not E" becomes more likely.']],
          mistakes: [
            ['Thinking P(E) and P(not E) can both be more than ½', 'They always add to exactly 1.'],
            ['Adding probabilities of overlapping events', '"Even" and "more than 3" share 4 and 6; count each outcome once.'],
          ],
          real: 'If the chance a train is on time is 0.85, the chance it is late is 0.15.',
        }),
        remember('Check your work: all the probabilities in a table must add to 1.'),
        tip('For "at least" or "not" questions, it is often easier to find the opposite and subtract from 1.'),
      ],
      examples: [
        ex('In 40 throws of a die, odd numbers appeared 22 times. Find P(even).', ['Even = 40 − 22 = 18', '18/40'], '9/20'),
        ex('Results of 50 spins: red 20, blue 18, yellow 12. Check that the probabilities add to 1.', ['20/50 + 18/50 + 12/50 = 50/50'], '1 ✓'),
      ],
      practice: [
        tp('missing', (r) => {
          const N = r.pick([20, 40, 50, 100]);
          const a = r.int(2, N / 2), b = r.int(1, N - a - 1);
          const c = N - a - b;
          return typed(`A spinner has red, green and blue parts. In ${N} spins, P(red) = ${fx(a, N)} and P(green) = ${fx(b, N)}. Find P(blue).`, frac(c, N),
            ['All the probabilities add to 1.'], [`P(blue) = 1 − ${fx(a, N)} − ${fx(b, N)} = ${fx(c, N)}`]);
        }),
        tp('group', (r) => {
          const fs = Array.from({ length: 6 }, () => r.int(3, 15));
          const N = fs.reduce((p1, q1) => p1 + q1, 0);
          const [nmE, ids] = r.pick([['an even number', [1, 3, 5]], ['an odd number', [0, 2, 4]], ['a number greater than 4', [4, 5]], ['a number less than 3', [0, 1]], ['a prime number', [1, 2, 4]]] as [string, number[]][]);
          const fE = ids.reduce((s, i) => s + fs[i], 0);
          return typed(`A die was thrown ${N} times. Faces 1–6 appeared ${fs.join(', ')} times. Find the experimental probability of getting ${nmE}.`, frac(fE, N),
            ['List the faces that make the event.', 'Add their counts.'], [`Faces: ${ids.map((i) => i + 1).join(', ')}`, `Count = ${fE}`, `P = ${fE}/${N}`]);
        }, 2),
        tp('not', (r) => {
          const N = r.pick([25, 40, 50, 80, 100]), e = r.int(1, N - 1);
          return typed(`In ${N} trials an event happened ${e} times. Find the probability that it did NOT happen.`, frac(N - e, N),
            ['P(not E) = 1 − P(E).'], [`1 − ${e}/${N} = ${N - e}/${N}`], [[`${e}/${N}`, 'That is P(E).']]);
        }),
        bank('facts', [
          { q: 'The possible outcomes when a coin is tossed are:', a: 'head, tail', w: ['1, 2, 3, 4, 5, 6', 'head only', 'win, lose, draw'], h: ['Two faces.'], s: ['Head or tail.'] },
          { q: 'If P(E) = P(not E), then P(E) is:', a: '0.5', w: ['0', '1', '0.25'], h: ['2P(E) = 1.'], s: ['P(E) = ½'] },
          { q: 'In 30 trials, P(A) = 0.4 and P(B) = 0.6 where every trial is A or B. How many trials gave B?', a: '18', w: ['12', '6', '24'], h: ['0.6 × 30'], s: ['18'] },
          { q: 'An impossible event has probability:', a: '0', w: ['1', '0.5', '−1'], h: ['It never happens.'], s: ['0'] },
          { q: 'Which list can be the probabilities of all outcomes of an experiment?', a: '0.2, 0.5, 0.3', w: ['0.2, 0.5, 0.4', '0.5, 0.6', '0.1, 0.1, 0.1'], h: ['They must add to 1.'], s: ['0.2 + 0.5 + 0.3 = 1'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 15 PROOFS IN MATHEMATICS
const ch15: USpec = {
  id: 'ts9.m.ch15', subject: 'math', title: 'Proofs in Mathematics', source: src(15),
  objectives: [
    {
      id: 'ts9.m.proof.statements', title: 'Mathematical statements and verifying them',
      intro: [
        h('True, false — or not a statement at all?'),
        p('"Hyderabad is the capital of Telangana" is true. "7 is an even number" is false. "Open the window!" is neither — it is an order. "Biryani is tasty" is an opinion. In mathematics, a statement is a sentence that is either true or false, but not both.'),
        def('Mathematical statement', 'A sentence that is definitely either true or false.'),
        def('Ambiguous sentence', 'A sentence whose truth cannot be decided because its meaning is unclear or it depends on opinion, e.g. "x is big".'),
        keys('Always true: "The sum of the angles of a triangle is 180°."', 'Always false: "A square has 5 sides."', 'Sometimes true: "x + 3 = 7" (only when x = 4) — not a statement until x is fixed.', 'To show a general statement is FALSE, one counter-example is enough.', 'To show it is TRUE, you need a proof — examples alone are not enough.'),
        f('n² − n + 41 (try n = 1, 2, 3, … 41)', 'n squared minus n plus 41'),
        X({
          title: 'What if? Test a famous pattern', formula: 'v = n² − n + 41 — prime for n = 1 to 40, but not for n = 41',
          result: ['v', 'Value', 'n^2 - n + 41'],
          vars: [['n', 'n', 1, 45, 1, 5]],
          notes: [['n', 'For n from 1 to 40 every value is prime. At n = 41 the value is 41² — not prime! Many examples did not make the statement true.', 'Small n give small primes: 41, 43, 47, 53, …']],
          mistakes: [
            ['"It worked for 40 cases, so it is always true"', 'n = 41 gives 41 × 41 = 1681, which is not prime. Checking examples is not a proof.'],
            ['Calling an opinion a statement', '"Maths is fun" cannot be proved true or false, so it is not a mathematical statement.'],
          ],
          real: 'Engineers test a design on many cases, but a bridge is certified only by calculations that cover every case — like a proof.',
        }),
        remember('One counter-example disproves; no number of examples proves.'),
        tip('To make a sometimes-true sentence always true, add a condition: "If x = 4, then x + 3 = 7."'),
      ],
      examples: [
        ex('Is "The product of two odd numbers is odd" always, sometimes or never true?', ['(2a + 1)(2b + 1) = 2(2ab + a + b) + 1, which is odd.'], 'Always true'),
        ex('Show that "every prime is odd" is false.', ['2 is prime and even.'], 'Counter-example: 2'),
      ],
      practice: [
        tp('kind', (r) => {
          const S: [string, string][] = [
            ['The sum of two even numbers is even.', 'Always true'], ['A triangle has four sides.', 'Always false'], ['x + 5 = 9', 'Sometimes true'],
            ['Every multiple of 4 is even.', 'Always true'], ['The square of a number is greater than the number.', 'Sometimes true'], ['A rectangle has three right angles and one obtuse angle.', 'Always false'],
            ['The product of two odd numbers is odd.', 'Always true'], ['A number divisible by 3 is divisible by 9.', 'Sometimes true'], ['7 is a factor of 50.', 'Always false'],
            ['The sum of two primes is even.', 'Sometimes true'],
          ];
          const [q, ok] = r.pick(S);
          return mcq(r, `"${q}" is:`, ok, ['Always true', 'Always false', 'Sometimes true'].filter((x) => x !== ok),
            ['Try a few cases, including tricky ones like 0, 1, 2 and fractions.', 'If it can go either way, it is "sometimes true".'], [`${ok}.`], [['wrong', 'Look for both a case where it works and a case where it fails.']]);
        }),
        tapT('isstatement', 'Tap every sentence that is a mathematical STATEMENT (definitely true or definitely false).', ['2 + 3 = 6', 'All squares are rectangles.', '15 is a multiple of 4.', 'The diagonals of a rhombus are perpendicular.', 'Zero is an even number.', '√9 = 3'], ['Close the door.', 'Mathematics is the most beautiful subject.', 'Is 7 prime?', 'x is a large number.', 'What a lovely circle!'],
          ['False statements are still statements.', 'Orders, questions and opinions are not.'], 'A false sentence like "2 + 3 = 6" is still a statement; questions and opinions are not.'),
        tp('counter', (r) => {
          const S: [string, string, string[]][] = [
            ['Every prime number is odd.', '2', ['3', '5', '7']], ['The square of every number is greater than the number.', '1/2', ['2', '3', '10']],
            ['n² + n + 1 is prime for every natural number n.', 'n = 4 (gives 21)', ['n = 1 (gives 3)', 'n = 2 (gives 7)', 'n = 3 (gives 13)']],
            ['Every number ending in 7 is prime.', '27', ['7', '17', '37']], ['The sum of two irrational numbers is irrational.', '√2 and −√2', ['√2 and √3', '√5 and √5', 'π and √2']],
            ['All quadrilaterals with equal sides are squares.', 'A rhombus with angles 60° and 120°', ['A square of side 2', 'A square of side 5', 'A rectangle with equal sides']],
          ];
          const [q, ok, w] = r.pick(S);
          return mcq(r, `Which is a counter-example to: "${q}"`, ok, w,
            ['A counter-example is a case where the statement is FALSE.'], [`${ok} makes the statement false, so the statement is not always true.`]);
        }, 2),
        tp('oddsq', (r) => {
          const n = r.int(1, 40);
          const v = n * n - n + 41;
          return typed(`Work out n² − n + 41 for n = ${n}.`, num(v),
            ['Square n, subtract n, add 41.'], [`${n}² − ${n} + 41 = ${n * n} − ${n} + 41 = ${v}`, 'It is prime for every n from 1 to 40 — but that still does not prove it is always prime (try n = 41).']);
        }),
        bank('facts', [
          { q: 'To show that a general statement is false, you need:', a: 'one counter-example', w: ['a proof using axioms', 'many examples where it is true', 'a calculator'], h: ['One failing case is enough.'], s: ['A single counter-example disproves it.'] },
          { q: 'To show that a general statement is true for all cases, you need:', a: 'a proof', w: ['ten examples', 'one example', 'a picture'], h: ['Examples cannot cover every case.'], s: ['Only a proof covers every case.'] },
          { q: '"x > 2" is:', a: 'not a statement until x is known', w: ['always true', 'always false', 'an axiom'], h: ['Its truth depends on x.'], s: ['It is sometimes true, so it is not yet a statement.'] },
          { q: '"Every month has 30 days" is:', a: 'false — February has 28 or 29', w: ['true', 'not a statement', 'an axiom'], h: ['Look for one month that breaks it.'], s: ['February is a counter-example.'] },
          { q: 'Which is NOT a mathematical statement?', a: 'Please solve this problem.', w: ['3 + 4 = 8', 'Every square is a rhombus.', '0 is a natural number.'], h: ['An instruction is not true or false.'], s: ['Orders are not statements.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.proof.reasoning', title: 'Reasoning in mathematics', prereqs: ['ts9.m.proof.statements'],
      intro: [
        h('From what we know to what must follow'),
        p('"All students of our school wear a uniform on Monday. Sita is a student of our school. So Sita wears a uniform on Monday." This is deductive reasoning: from true statements (premises), a conclusion follows with certainty.'),
        def('Deductive reasoning', 'Drawing a conclusion that MUST be true if the given statements are true.'),
        def('Inductive reasoning', 'Guessing a general rule from patterns in examples. Useful for discovering ideas, but the guess still needs a proof.'),
        keys('If "all P are Q" and "x is P", then "x is Q".', 'If "all P are Q" and "x is Q", we CANNOT conclude that x is P.', 'If "all P are Q" and "x is NOT Q", then x is NOT P.'),
        p('Example of inductive reasoning: 1 = 1², 1 + 3 = 2², 1 + 3 + 5 = 3², … We guess that the sum of the first n odd numbers is n². A picture of nested squares (each odd number adds an L-shaped border) PROVES it.'),
        f('1 + 3 + 5 + … + (2n − 1) = n²', 'the sum of the first n odd numbers is n squared'),
        X({
          title: 'What if? Add more odd numbers', formula: 'S = n²',
          result: ['S', 'Sum of the first n odd numbers', 'n^2'],
          vars: [['n', 'How many odd numbers', 1, 30, 1, 5]],
          notes: [['n', 'Each new odd number 2n − 1 adds an L-shaped border to the square, making it one size bigger.', 'Removing the last odd number removes the outer border.']],
          mistakes: [
            ['Taking the last odd number as n', 'For 1 + 3 + 5 + 7 + 9, n is 5 (five numbers), not 9.'],
            ['Thinking the pattern is proved by checking a few cases', 'Checking suggests it; the square-border argument proves it for all n.'],
          ],
          real: 'Stacking chairs in a square hall: adding an L-shaped row of 2n − 1 chairs turns an (n − 1) × (n − 1) block into an n × n block.',
        }),
        remember('Deduction gives certainty; induction gives good guesses.'),
        tip('Write reasoning as a chain: "Given … therefore … hence …".'),
      ],
      examples: [
        ex('All rhombuses are parallelograms. ABCD is a rhombus. What can you conclude?', ['Apply the general statement to this case.'], 'ABCD is a parallelogram'),
        ex('Find 1 + 3 + 5 + … + 19.', ['There are 10 odd numbers (19 = 2 × 10 − 1).', '10²'], '100'),
      ],
      practice: [
        tp('oddsum', (r) => {
          const n = r.int(3, 30);
          return typed(`Find 1 + 3 + 5 + … + ${2 * n - 1} (the sum of consecutive odd numbers starting from 1).`, num(n * n),
            ['Count how many odd numbers there are: last = 2n − 1.', 'The sum of the first n odd numbers is n².'], [`2n − 1 = ${2 * n - 1} → n = ${n}`, `Sum = ${n}² = ${n * n}`],
            [[String((2 * n - 1) ** 2), `n is the COUNT of numbers (${n}), not the last number.`]]);
        }),
        tp('deduce', (r) => {
          const S: [string, string, string, string[]][] = [
            ['All squares are rectangles.', 'PQRS is a square.', 'PQRS is a rectangle.', ['PQRS is not a rectangle.', 'Every rectangle is a square.', 'Nothing can be concluded.']],
            ['All multiples of 6 are even.', '72 is a multiple of 6.', '72 is even.', ['72 is odd.', 'All even numbers are multiples of 6.', 'Nothing can be concluded.']],
            ['All equilateral triangles are isosceles.', '△ABC is equilateral.', '△ABC is isosceles.', ['△ABC is scalene.', 'All isosceles triangles are equilateral.', 'Nothing can be concluded.']],
            ['All students of Class 9 B play kho-kho.', 'Teja does not play kho-kho.', 'Teja is not in Class 9 B.', ['Teja is in Class 9 B.', 'Teja plays cricket.', 'Nothing can be concluded.']],
          ];
          const [p1, p2, c, w] = r.pick(S);
          return mcq(r, `Given: (1) ${p1} (2) ${p2} What can you conclude?`, c, w,
            ['Apply the general statement (1) to the particular case (2).'], [`From (1) and (2): ${c}`]);
        }),
        tp('fallacy', (r) => {
          const S: [string, string][] = [
            ['All mangoes are fruits. This is a fruit.', 'It may or may not be a mango'],
            ['All squares are rhombuses. ABCD is a rhombus.', 'ABCD may or may not be a square'],
            ['All multiples of 10 are even. 34 is even.', '34 may or may not be a multiple of 10'],
            ['All Telangana districts have a collector. X has a collector.', 'X may or may not be a Telangana district'],
            ['All right angles are 90°. ∠A measures less than 180°.', '∠A may or may not be a right angle'],
          ];
          const [g, ok] = r.pick(S);
          const thing = ok.split(' may or may not be ')[1];
          return mcq(r, `${g} What follows?`, ok, [`It is definitely ${thing}`, `It is definitely not ${thing}`],
            ['"All P are Q" does NOT mean "all Q are P".'], [`${ok}: knowing it is in the bigger group does not place it in the smaller group.`]);
        }, 2),
        bank('facts', [
          { q: 'Guessing a rule from a few examples is called:', a: 'inductive reasoning', w: ['deductive reasoning', 'a proof', 'an axiom'], h: ['From examples to a guess.'], s: ['Inductive reasoning.'] },
          { q: 'A conclusion that must be true if the premises are true comes from:', a: 'deductive reasoning', w: ['inductive reasoning', 'guessing', 'measuring'], h: ['Certainty.'], s: ['Deductive reasoning.'] },
          { q: 'Given "all P are Q" and "x is not Q", we conclude:', a: 'x is not P', w: ['x is P', 'x is Q', 'nothing'], h: ['If x were P, it would be Q.'], s: ['x is not P.'] },
          { q: 'The sum of the first 7 odd numbers is:', a: '49', w: ['42', '64', '13'], h: ['n²'], s: ['7² = 49'] },
          { q: 'Why is inductive reasoning still useful?', a: 'It helps us discover rules that we can then prove', w: ['It always gives proofs', 'It never gives true rules', 'It replaces axioms'], h: ['Patterns lead to conjectures.'], s: ['It suggests conjectures to prove.'] },
        ]),
      ],
    },
    {
      id: 'ts9.m.proof.theorems', title: 'Theorems, conjectures, axioms and what a proof is', prereqs: ['ts9.m.proof.reasoning', 'ts9.m.euclid.axioms'],
      intro: [
        h('The building blocks of mathematics'),
        def('Axiom', 'A statement accepted as true without proof, e.g. "Through two points there is exactly one line".'),
        def('Theorem', 'A statement that has been PROVED using axioms, definitions and earlier theorems, e.g. "The angle sum of a triangle is 180°".'),
        def('Conjecture', 'A statement believed to be true from evidence but not yet proved, e.g. Goldbach\'s conjecture: every even number greater than 2 is the sum of two primes.'),
        h('What is a proof?'),
        p('A proof is a chain of logical steps. Each step is an axiom, a definition, a given fact, or follows from earlier steps by deduction. The last step is the statement we wanted.'),
        stepsB('Understand what is GIVEN and what is TO BE PROVED.', 'Draw a figure if it helps.', 'Plan the key idea (an extra line, a congruence, an identity…).', 'Write each step with a reason.', 'End with the statement to be proved.'),
        p('Example: prove the sum of two odd numbers is even. Let them be 2m + 1 and 2n + 1. Their sum is 2m + 2n + 2 = 2(m + n + 1), a multiple of 2. ∎'),
        f('(2m + 1) + (2n + 1) = 2(m + n + 1)', 'the sum of two odd numbers is twice a whole number'),
        X({
          title: 'What if? Pick any two odd numbers', formula: '(2m + 1) + (2n + 1) = 2(m + n + 1)',
          result: ['S', 'Sum of the two odd numbers', '(2*m + 1) + (2*n + 1)'],
          vars: [['m', 'm (first odd number is 2m + 1)', 0, 50, 1, 3], ['n', 'n (second odd number is 2n + 1)', 0, 50, 1, 7]],
          notes: [
            ['m', 'Whatever m is, the sum stays a multiple of 2 — the proof covers every case at once.', 'Smaller m still gives an even sum.'],
            ['n', 'Each step of 1 in n adds 2 to the sum, so it stays even.', 'Each step down subtracts 2; the sum is still even.'],
          ],
          mistakes: [
            ['Writing both odd numbers as 2n + 1', 'That only covers two EQUAL odd numbers. Use different letters m and n.'],
            ['Proving with examples: 3 + 5 = 8', 'Examples only check some cases; algebra covers all of them.'],
          ],
          real: 'If two friends each bring an odd number of laddoos, together they can always share them equally in pairs.',
        }),
        keys('Axioms: accepted. Theorems: proved. Conjectures: not yet proved.', 'Every step of a proof needs a reason.', 'A conjecture becomes a theorem once it is proved — or is dropped if a counter-example is found.'),
        remember('The Pythagoras theorem has hundreds of different proofs; one correct proof is enough.'),
        tip('In geometry proofs, write the reason in brackets after each step: (vertically opposite angles), (SAS), (CPCT).'),
      ],
      examples: [
        ex('Prove that the product of two even numbers is a multiple of 4.', ['Let them be 2m and 2n.', 'Product = 4mn, which is a multiple of 4.'], 'Proved'),
        ex('Classify "The sum of the angles of a quadrilateral is 360°".', ['It is proved by splitting into two triangles.'], 'A theorem'),
      ],
      practice: [
        tp('classify', (r) => {
          const S: [string, string][] = [
            ['Through two distinct points there is exactly one line.', 'Axiom'], ['Things equal to the same thing are equal to one another.', 'Axiom'], ['The whole is greater than the part.', 'Axiom'],
            ['The angle sum of a triangle is 180°.', 'Theorem'], ['Vertically opposite angles are equal.', 'Theorem'], ['In a right triangle, hypotenuse² = sum of squares of the other two sides.', 'Theorem'],
            ['Every even number greater than 2 is the sum of two primes (Goldbach).', 'Conjecture'], ['There are infinitely many pairs of primes that differ by 2 (twin primes).', 'Conjecture'],
            ['The sum of two odd numbers is even.', 'Theorem'],
          ];
          const [q, ok] = r.pick(S);
          return mcq(r, `"${q}" — is this an axiom, a theorem or a conjecture?`, ok, ['Axiom', 'Theorem', 'Conjecture'].filter((x) => x !== ok),
            ['Axiom: accepted without proof. Theorem: proved. Conjecture: believed but not proved.'], [`It is ${ok === 'Axiom' ? 'an axiom' : ok === 'Theorem' ? 'a theorem' : 'a conjecture'}.`]);
        }),
        orderT('proof', 'Put the steps of the proof "vertically opposite angles are equal" in order (lines AB and CD cross at O).', ['∠AOC + ∠AOD = 180° (linear pair).', '∠AOD + ∠BOD = 180° (linear pair).', 'So ∠AOC + ∠AOD = ∠AOD + ∠BOD (both equal 180°).', 'Subtract ∠AOD from both sides: ∠AOC = ∠BOD.'], ['Start from facts you know: linear pairs.', 'The conclusion comes last.']),
        orderT('odd', 'Put the steps of the proof "the sum of two odd numbers is even" in order.', ['Let the odd numbers be 2m + 1 and 2n + 1, where m and n are whole numbers.', 'Their sum is 2m + 2n + 2.', 'This equals 2(m + n + 1).', 'It is a multiple of 2, so the sum is even.'], ['Begin by naming the numbers with letters.']),
        tp('evensum', (r) => {
          const m = r.int(0, 50), n = r.int(0, 50);
          return typed(`Take m = ${m} and n = ${n}. The odd numbers are 2m + 1 and 2n + 1. Their sum is 2 × (m + n + 1). What is m + n + 1?`, num(m + n + 1),
            ['Add m, n and 1.'], [`m + n + 1 = ${m + n + 1}`, `Check: ${2 * m + 1} + ${2 * n + 1} = ${2 * m + 2 * n + 2} = 2 × ${m + n + 1} ✓`]);
        }),
        bank('facts', [
          { q: 'A statement believed true but not yet proved is a:', a: 'conjecture', w: ['theorem', 'axiom', 'definition'], h: ['Goldbach\'s statement is an example.'], s: ['A conjecture.'] },
          { q: 'Each step of a proof must be:', a: 'justified by an axiom, definition, given fact or earlier step', w: ['checked with a ruler', 'a guess', 'an example'], h: ['Logic, not measurement.'], s: ['Every step needs a valid reason.'] },
          { q: 'Once a conjecture is proved, it becomes a:', a: 'theorem', w: ['axiom', 'definition', 'counter-example'], h: ['Proved statements.'], s: ['A theorem.'] },
          { q: 'Why can\'t we prove axioms?', a: 'They are the starting points that proofs build on', w: ['Because they are false', 'Because nobody tried', 'Because they are opinions'], h: ['Every proof must start somewhere.'], s: ['Axioms are accepted as the foundations.'] },
          { q: 'Fermat\'s Last Theorem was a conjecture for over 350 years until it was proved in:', a: '1994–95, by Andrew Wiles', w: ['300 BCE, by Euclid', '1900, by Ramanujan', 'it is still unproved'], h: ['Late 20th century.'], s: ['Andrew Wiles proved it in 1994–95.'] },
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15];
