// Telangana SCERT Class 8 — maths. Original explanations aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts8.m.ch<n>); objectives ts8.m.<topic>.<skill>.
// Every formula has a "what if?" explorer; every template uses only the Rng it is given.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, explore, photo, L, num, approx, frac, choose, matching, ordering, tapAll,
  gcd, lcm, simp, fr, rd, inr, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(8, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** signed number for display: −3 */
const n_ = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
/** number in brackets when negative: (−3) */
const pn = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
/** display a fraction n/d in lowest terms with a proper minus sign */
const fx = (n: number, d: number) => fr(n, d).replace('-', '−');
/** a fraction exactly as written (not simplified), bracketed when negative: (−3/4) */
const pf = (n: number, d: number) => (n < 0 ? `(−${-n}/${d})` : `${n}/${d}`);
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
/** superscript for any integer exponent: 3 → ³, −12 → ⁻¹² */
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');
/** a^n for display, base bracketed when negative */
const pw = (a: number | string, n: number) => `${typeof a === 'number' ? pn(a) : a}${sup(n)}`;
/** prime factorisation with powers: 360 → 2³ × 3² × 5 */
const pfs = (n: number) => {
  const parts: string[] = [];
  let x = n;
  for (let d = 2; x > 1; d++) {
    let k = 0;
    while (x % d === 0) { x /= d; k++; }
    if (k) parts.push(`${d}${k > 1 ? sup(k) : ''}`);
  }
  return parts.join(' × ');
};
/** prime factors listed one by one: 36 → 2 × 2 × 3 × 3 */
const pfl = (n: number) => {
  const parts: number[] = [];
  let x = n;
  for (let d = 2; x > 1; d++) while (x % d === 0) { x /= d; parts.push(d); }
  return parts.join(' × ');
};
/** linear expression ax + b for display */
const lin = (a: number, b: number, v = 'x') => {
  const head = a === 0 ? '' : `${a === 1 ? '' : a === -1 ? '−' : n_(a)}${v}`;
  if (!b) return head || '0';
  if (!head) return n_(b);
  return `${head} ${b < 0 ? '−' : '+'} ${Math.abs(b)}`;
};
/** signed term for display after another term: + 3x, − 5 */
const sg = (c: number, body = '') => `${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && body ? '' : Math.abs(c)}${body}`;
/** coefficient in front of a variable: 1 → '', −1 → '−', 3 → '3' */
const cf = (c: number) => (c === 1 ? '' : c === -1 ? '−' : n_(c));

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
/** typed numeric / fraction question */
const typed = (prompt: string, answer: AnswerSpec, hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'typed', keypad: answer.kind === 'fraction' ? 'fraction' : 'numeric', prompt, answer, hints, solution, ...mk(mistakes), ...extra,
});
/** multiple choice question */
const mcq = (r: Rng, prompt: string, correct: string, wrong: string[], hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...choose(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
interface MC { q: string; a: string; w: string[]; h: string[]; s: string[]; why?: string }
/** a template that draws one concept question from a bank (bank needs >= 5 entries) */
const bank = (key: string, list: MC[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const it = r.pick(list);
  return mcq(r, it.q, it.a, it.w, it.h, it.s, it.why ? [['wrong', it.why]] : []);
}, d);
/** matching template: picks `n` pairs and lists the left items in the prompt so every draw differs */
const matchT = (key: string, title: string, pairs: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pairs).slice(0, n);
  return { type: 'match', prompt: `${title}: ${pick.map(([a]) => a).join('; ')}.`, ...matching(r, pick), hints, solution: pick.map(([a, b]) => `${a} → ${b}`) };
}, d);
/** ordering template from a fixed sequence of steps */
const orderT = (key: string, prompt: string, steps: string[], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => (
  { type: 'order', prompt, ...ordering(r, steps), hints, solution: steps.map((s, i) => `${i + 1}. ${s}`) }
), d);
/** n-th step answer helper */
const st = (prompt: string, answer: AnswerSpec) => ({ prompt, answer });
const PI7 = 22 / 7;
/** ordinal: 1st, 2nd, 3rd, 11th, 21st */
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10]}`;

// ================================================================== CH 1 RATIONAL NUMBERS
const ch1: USpec = {
  id: 'ts8.m.ch1', subject: 'math', title: 'Rational Numbers', source: src(1),
  objectives: [
    {
      id: 'ts8.m.rat.ops', title: 'Adding, subtracting, multiplying and dividing rational numbers',
      intro: [
        h('Numbers that are fractions of whole numbers'),
        p('A cricket team wins 3/4 of its matches, the temperature in Shimla drops to −5/2 °C, a recipe needs 1½ cups of rice. All of these are rational numbers — numbers that can be written as one integer divided by another.'),
        def('Rational number', 'A number that can be written as p/q, where p and q are integers and q ≠ 0. Examples: 3/4, −5/2, 7 (= 7/1), 0 (= 0/5).'),
        p('Every integer is rational, because 7 = 7/1. A rational number is in standard form when q is positive and p and q have no common factor other than 1. So −6/−8 in standard form is 3/4.'),
        h('The four operations'),
        stepsB('Add or subtract: make the denominators equal (use the LCM), then add or subtract the numerators.', 'Multiply: numerator × numerator over denominator × denominator.', 'Divide: multiply by the reciprocal of the second number.', 'Always finish by writing the answer in standard form.'),
        f('a/b + c/d = (a × d + c × b) / (b × d)', 'a over b plus c over d equals a d plus c b, over b d'),
        X({
          title: 'What if? Add two rational numbers', formula: 'a/b + c/d = (ad + cb)/(bd)',
          result: ['S', 'Sum', '(a*d + c*b)/(b*d)', '', 3],
          vars: [['a', 'Numerator of first', -10, 10, 1, 3], ['b', 'Denominator of first', 1, 12, 1, 4], ['c', 'Numerator of second', -10, 10, 1, 5], ['d', 'Denominator of second', 1, 12, 1, 6]],
          notes: [
            ['a', 'A bigger first numerator means more parts, so the sum grows.', 'A smaller (or negative) first numerator pulls the sum down.'],
            ['b', 'Cutting into more pieces makes each piece smaller, so the first fraction shrinks and the sum falls (for positive a).', 'Fewer, bigger pieces make the first fraction larger.'],
          ],
          mistakes: [
            ['Adding tops and bottoms: 1/2 + 1/3 = 2/5', 'Denominators name the SIZE of the pieces. You can only add pieces of the same size, so make the denominators equal first: 3/6 + 2/6 = 5/6.'],
            ['Forgetting the sign of a negative numerator', 'Keep the minus with the numerator: −3/4 + 1/4 = −2/4 = −1/2.'],
          ],
          real: 'Half a litre of milk plus a third of a litre is 5/6 of a litre — not 2/5, which is less than either part!',
        }),
        f('(a/b) ÷ (c/d) = (a/b) × (d/c)', 'a over b divided by c over d equals a over b times d over c'),
        X({
          title: 'What if? Divide by a rational number', formula: '(a/b) ÷ (c/d) = (a × d)/(b × c)',
          result: ['Q', 'Quotient', '(a*d)/(b*c)', '', 3],
          vars: [['a', 'Numerator of first', 1, 10, 1, 3], ['b', 'Denominator of first', 1, 10, 1, 4], ['c', 'Numerator of divisor', 1, 10, 1, 1], ['d', 'Denominator of divisor', 1, 10, 1, 2]],
          notes: [['c', 'A bigger divisor means each share is bigger, so fewer shares fit — the quotient falls.', 'A smaller divisor means many more small shares fit — the quotient rises.']],
          mistakes: [['Flipping the first fraction instead of the second', 'Only the divisor (the number after ÷) is turned upside down.']],
          real: 'How many 1/4-litre glasses can 3 litres fill? 3 ÷ 1/4 = 3 × 4 = 12 glasses.',
        }),
        keys('p/q with q ≠ 0 is rational.', 'Add/subtract: common denominator first.', 'Multiply straight across.', 'Divide: multiply by the reciprocal.'),
        remember('A negative divided by a negative is positive; a negative times a positive is negative — the same sign rules as integers.'),
        tip('Cancel common factors BEFORE multiplying: 4/9 × 3/8 = (1/3) × (1/2) = 1/6. The numbers stay small.'),
      ],
      examples: [
        ex('Find −5/6 + 3/4.', ['LCM of 6 and 4 is 12.', '−5/6 = −10/12 and 3/4 = 9/12', '−10/12 + 9/12 = −1/12'], '−1/12'),
        ex('Find (−4/9) ÷ (2/3).', ['Reciprocal of 2/3 is 3/2.', '(−4/9) × (3/2) = −12/18', 'Simplify: −12/18 = −2/3'], '−2/3'),
        ex('Sravani had 2/3 of a cake. She gave 1/4 of the whole cake to her brother. What part of the cake is left?', ['2/3 − 1/4', 'LCM 12: 8/12 − 3/12 = 5/12'], '5/12 of the cake'),
      ],
      practice: [
        tp('add', (r) => {
          const b = r.pick([2, 3, 4, 5, 6, 8, 9]);
          let d = r.pick([3, 4, 5, 6, 7, 10, 12]);
          while (d === b) d = r.pick([3, 4, 5, 6, 7, 10, 12]);
          const a = r.pick([-7, -5, -3, -1, 1, 2, 3, 5, 7]);
          let c = r.int(1, 9);
          if (a * d + c * b === 0) c += 1;
          const n = a * d + c * b, dd = b * d;
          return typed(`Find ${pf(a, b)} + ${c}/${d}. Write the answer in standard form.`, frac(n, dd),
            [`Use the LCM of ${b} and ${d} as the common denominator.`, `${pf(a, b)} = ${pf(a * lcm(b, d) / b, lcm(b, d))} and ${c}/${d} = ${c * lcm(b, d) / d}/${lcm(b, d)}.`],
            [`LCM(${b}, ${d}) = ${lcm(b, d)}`, `${pf(a * lcm(b, d) / b, lcm(b, d))} + ${c * lcm(b, d) / d}/${lcm(b, d)} = ${n_(a * lcm(b, d) / b + c * lcm(b, d) / d)}/${lcm(b, d)}`, `= ${fx(n, dd)}`],
            [[`${a + c}/${b + d}`, 'You added the denominators. Make the denominators equal first, then add only the numerators.']]);
        }),
        tp('sub', (r) => {
          const b = r.pick([3, 4, 5, 6, 8]);
          let d = r.pick([2, 3, 4, 6, 9, 10]);
          while (d === b) d = r.pick([2, 3, 4, 6, 9, 10]);
          const a = r.int(1, 9), c = r.pick([-5, -3, -1, 1, 2, 5, 7]);
          const L2 = lcm(b, d), n = a * (L2 / b) - c * (L2 / d);
          return typed(`Subtract: ${a}/${b} − ${pf(c, d)}`, frac(n, L2),
            ['Write both with the common denominator ' + L2 + '.', c < 0 ? 'Subtracting a negative number is the same as adding its positive.' : 'Subtract the numerators.'],
            [`${a}/${b} = ${a * (L2 / b)}/${L2}, ${pf(c, d)} = ${pf(c * (L2 / d), L2)}`, `${a * (L2 / b)} − ${pn(c * (L2 / d))} = ${n_(n)}`, `Answer: ${fx(n, L2)}`],
            [[fr(a * (L2 / b) + c * (L2 / d), L2), 'Watch the sign: you added instead of subtracting.']]);
        }),
        tp('mul', (r) => {
          const a = r.pick([-8, -6, -4, -3, -2, 2, 3, 4, 5, 9]), b = r.pick([3, 5, 7, 9, 10]);
          const c = r.pick([2, 3, 5, 6, 7]), d = r.pick([4, 6, 8, 9, 15]);
          return typed(`Multiply: ${pf(a, b)} × ${c}/${d}`, frac(a * c, b * d),
            ['Multiply the numerators and multiply the denominators.', 'Cancel common factors to reach standard form.'],
            [`${pf(a, b)} × ${c}/${d} = ${n_(a * c)}/${b * d}`, `= ${fx(a * c, b * d)}`],
            [[fr(-a * c, b * d), 'Check the sign: one negative factor gives a negative product.']]);
        }),
        tp('div', (r) => {
          const a = r.pick([-9, -5, -4, -2, 1, 2, 3, 4, 7, 8]), b = r.pick([3, 5, 7, 9, 11]);
          const c = r.pick([2, 3, 4, 5, 6]), d = r.pick([3, 5, 7, 9]);
          return typed(`Divide: ${pf(a, b)} ÷ ${c}/${d}`, frac(a * d, b * c),
            [`Turn the divisor upside down: the reciprocal of ${c}/${d} is ${d}/${c}.`, `Now work out ${pf(a, b)} × ${d}/${c}.`],
            [`${pf(a, b)} ÷ ${c}/${d} = ${pf(a, b)} × ${d}/${c}`, `= ${n_(a * d)}/${b * c} = ${fx(a * d, b * c)}`],
            [[fr(a * c, b * d), 'You multiplied without flipping the divisor. Use its reciprocal.'], [fr(b * c, a * d), 'You flipped the wrong fraction — only the divisor is inverted.']], { steps: [st(`What is the reciprocal of ${c}/${d}?`, frac(d, c)), st('Now give the quotient.', frac(a * d, b * c))] });
        }, 2),
        tp('story', (r) => {
          const who = nm(r);
          const [a, b] = r.pick([[3, 4], [2, 3], [5, 6], [7, 8], [4, 5]] as [number, number][]);
          const [c, d] = r.pick([[1, 3], [1, 6], [1, 4], [2, 9], [3, 10]] as [number, number][]);
          if (a / b <= c / d) return typed(`${who} has ${a}/${b} kg of sugar and buys ${c}/${d} kg more. How many kg of sugar now?`, frac(a * d + c * b, b * d), ['Add the two amounts.', `LCM of ${b} and ${d}.`], [`${a}/${b} + ${c}/${d} = ${fx(a * d + c * b, b * d)} kg`]);
          return typed(`${who} has ${a}/${b} kg of sugar and uses ${c}/${d} kg for kheer. How many kg of sugar are left?`, frac(a * d - c * b, b * d),
            ['Left = what you had − what you used.', `Use the common denominator ${lcm(b, d)}.`],
            [`${a}/${b} − ${c}/${d} = ${fx(a * d - c * b, b * d)} kg`],
            [[fr(a * d + c * b, b * d), 'Using up sugar means SUBTRACT, not add.']]);
        }),
      ],
    },
    {
      id: 'ts8.m.rat.props', title: 'Properties of rational numbers', prereqs: ['ts8.m.rat.ops'],
      intro: [
        h('Rules that always work'),
        p('When you add 3/4 + 1/2 or 1/2 + 3/4 you get the same answer. Is that luck? No — it is a property: a rule that is true for EVERY rational number. Knowing the properties lets you rearrange sums cleverly and catch mistakes.'),
        def('Closure', 'A set is closed under an operation if doing the operation on any two members always gives a member of the same set. Rationals are closed under +, − and ×. They are NOT closed under ÷ because division by 0 is not defined.'),
        def('Commutative', 'Order does not matter: a + b = b + a and a × b = b × a. (Not true for − or ÷: 1/2 − 1/3 ≠ 1/3 − 1/2.)'),
        def('Associative', 'Grouping does not matter: (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c).'),
        def('Identity elements', '0 is the additive identity (a + 0 = a); 1 is the multiplicative identity (a × 1 = a).'),
        def('Inverses', 'The additive inverse of a/b is −a/b (they add to 0). The multiplicative inverse (reciprocal) of a/b is b/a, for a ≠ 0 (they multiply to 1). 0 has no reciprocal.'),
        f('a × (b + c) = a × b + a × c', 'a times b plus c equals a b plus a c'),
        X({
          title: 'What if? Distributivity', formula: 'a × (b + c) = a × b + a × c',
          result: ['P', 'Product', 'a*(b + c)', '', 2],
          vars: [['a', 'Multiplier a', -5, 5, 0.25, 0.5], ['b', 'b', -5, 5, 0.25, 2], ['c', 'c', -5, 5, 0.25, 1.5]],
          notes: [['a', 'Every part inside the bracket is multiplied by a, so the whole result scales with a.', 'A smaller a shrinks both parts equally.']],
          mistakes: [['a × (b + c) = a × b + c', 'Multiply EVERY term in the bracket, not just the first one.']],
          real: 'Six friends each buy a ₹15 samosa and a ₹10 chai: 6 × (15 + 10) = 6 × 15 + 6 × 10 = ₹150 either way.',
        }),
        keys('Closed under +, −, ×; not under ÷ (because of 0).', '+ and × are commutative and associative; − and ÷ are not.', 'Additive identity 0, multiplicative identity 1.', 'a/b + (−a/b) = 0; a/b × b/a = 1.'),
        remember('0 has no multiplicative inverse, and 1 and −1 are the only rational numbers equal to their own reciprocals.'),
        tip('Use the properties to group "friendly" numbers: −2/3 + 4/7 + 2/3 = (−2/3 + 2/3) + 4/7 = 4/7.'),
      ],
      examples: [
        ex('Find the additive and multiplicative inverses of −7/9.', ['Additive inverse: change the sign → 7/9 (−7/9 + 7/9 = 0).', 'Multiplicative inverse: flip it → −9/7 (−7/9 × −9/7 = 1).'], '7/9 and −9/7'),
        ex('Use distributivity: 2/5 × (−3/7) + 2/5 × (10/7).', ['Take out the common factor 2/5.', '2/5 × (−3/7 + 10/7) = 2/5 × 7/7 = 2/5 × 1', '= 2/5'], '2/5'),
        ex('Is 1/2 − 1/3 equal to 1/3 − 1/2? What does this show?', ['1/2 − 1/3 = 1/6', '1/3 − 1/2 = −1/6', 'They are different.'], 'Subtraction is not commutative'),
      ],
      practice: [
        tp('add-inv', (r) => {
          const a = r.pick([-11, -7, -5, -3, -2, 2, 3, 5, 8, 13]), b = r.pick([3, 4, 7, 9, 11, 13]);
          return typed(`What is the additive inverse of ${fx(a, b)}?`, frac(-a, b),
            ['The additive inverse is the number you add to get 0.', 'Just change the sign.'],
            [`${fx(a, b)} + ${pf(-a, b)} = 0`, `Additive inverse = ${fx(-a, b)}`],
            [[fr(b, a), 'That is the reciprocal (multiplicative inverse). The additive inverse makes the SUM zero.']]);
        }),
        tp('mul-inv', (r) => {
          const a = r.pick([-11, -7, -5, -3, -2, 2, 3, 5, 8, 13]), b = r.pick([3, 4, 7, 9, 11, 13]);
          return typed(`What is the multiplicative inverse (reciprocal) of ${fx(a, b)}?`, frac(a < 0 ? -b : b, Math.abs(a)),
            ['Two numbers are reciprocals when their product is 1.', 'Swap numerator and denominator; the sign stays the same.'],
            [`${fx(a, b)} × ${fx(b, a)} = 1`, `Reciprocal = ${fx(b, a)}`],
            [[fr(-b, a), 'The reciprocal keeps the same sign — a negative times a negative would not be needed to make 1 here.'], [fr(-a, b), 'That is the additive inverse.']]);
        }),
        tp('distrib', (r) => {
          const a = r.pick([2, 3, 4, 5, 7]), b = r.pick([3, 5, 9, 11]);
          const d = r.pick([4, 5, 7, 8]);
          const c1 = r.int(-6, -1), c2 = r.int(d + 1, d + 9);
          return typed(`Use distributivity to simplify: ${a}/${b} × ${pf(c1, d)} + ${a}/${b} × ${c2}/${d}`, frac(a * (c1 + c2), b * d),
            [`Both terms share the factor ${a}/${b}. Take it out.`, `${a}/${b} × (${pf(c1, d)} + ${c2}/${d})`],
            [`= ${a}/${b} × ${n_(c1 + c2)}/${d}`, `= ${fx(a * (c1 + c2), b * d)}`]);
        }, 2),
        matchT('names', 'Match each statement with the property it shows', [
          ['3/4 + 1/5 = 1/5 + 3/4', 'Commutative property of addition'],
          ['(2/3 × 1/2) × 5 = 2/3 × (1/2 × 5)', 'Associative property of multiplication'],
          ['−5/8 + 0 = −5/8', 'Additive identity'],
          ['7/9 × 1 = 7/9', 'Multiplicative identity'],
          ['4/11 + (−4/11) = 0', 'Additive inverse'],
          ['−3/5 × (−5/3) = 1', 'Multiplicative inverse'],
          ['1/2 × (4 + 6) = 1/2 × 4 + 1/2 × 6', 'Distributive property'],
        ], ['Identity: the number stays unchanged.', 'Inverse: the result is 0 (for +) or 1 (for ×).']),
        bank('facts', [
          { q: 'The rational numbers are NOT closed under:', a: 'division', w: ['addition', 'subtraction', 'multiplication'], h: ['Think about dividing by 0.'], s: ['5 ÷ 0 is not defined, so ÷ does not always give a rational number.'] },
          { q: 'Which number has no multiplicative inverse?', a: '0', w: ['1', '−1', '1/2'], h: ['What times 0 gives 1?'], s: ['0 × anything = 0, never 1.'] },
          { q: 'Which numbers are their own reciprocals?', a: '1 and −1', w: ['0 and 1', 'only 1', '0 only'], h: ['x × x = 1'], s: ['1 × 1 = 1 and (−1) × (−1) = 1.'] },
          { q: 'Which operation on rational numbers is commutative?', a: 'multiplication', w: ['subtraction', 'division', 'none of them'], h: ['Swap the numbers and test.'], s: ['a × b = b × a always; 2 − 1 ≠ 1 − 2.'] },
          { q: 'The additive identity for rational numbers is:', a: '0', w: ['1', '−1', 'the number itself'], h: ['a + ? = a'], s: ['a + 0 = a.'] },
          { q: 'The additive inverse of 0 is:', a: '0', w: ['1', 'not defined', '−1'], h: ['0 + ? = 0'], s: ['0 + 0 = 0, so 0 is its own additive inverse.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.rat.line', title: 'Rational numbers on the number line and between two rationals', prereqs: ['ts8.m.rat.ops'],
      intro: [
        h('Every rational number has its own address'),
        p('Imagine the road from your home (0) to school (1). If you stop at the bus stop one-third of the way, you are at 1/3. Every rational number has exactly one point on the number line.'),
        stepsB('To mark a/b, divide each unit (0 to 1, 1 to 2, …) into b equal parts.', 'Count a parts to the right of 0 if a/b is positive, to the left if negative.', 'For 7/4 = 1¾, go to 1 and then 3 more quarters.'),
        vis({ kind: 'number-line', from: -2, to: 2, step: 1, marks: [-1, 0, 1] }, 'Number line from −2 to 2; each unit can be cut into equal parts to mark fractions such as −3/4 or 5/4'),
        h('Squeezing numbers in between'),
        p('Between 1 and 2 there is no integer. But between any two different rationals there is ALWAYS another rational — in fact infinitely many! One easy way: take their average.'),
        f('Mean of a and b = (a + b) / 2 lies between a and b', 'a plus b over 2 lies between a and b'),
        X({
          title: 'What if? Find the halfway rational', formula: 'm = (a + b)/2',
          result: ['m', 'Number halfway between', '(a + b)/2', '', 3],
          vars: [['a', 'First number a', -3, 3, 0.25, 0.25], ['b', 'Second number b', -3, 3, 0.25, 0.5]],
          notes: [['a', 'Moving a to the right drags the midpoint right by HALF as much.', 'Moving a left drags the midpoint left by half as much.']],
          mistakes: [['Thinking there is no rational between 1/4 and 1/2 because the denominators are "next to each other"', 'Average them: 3/8 sits between. Then average again — you can never run out.']],
          real: 'Two friends at 1/4 km and 1/2 km along a road can meet exactly halfway at 3/8 km.',
        }),
        p('Another way: write both with a larger common denominator. 1/3 and 1/2 are 4/12 and 6/12, so 5/12 is between. Use 40/120 and 60/120 and you get 19 numbers in between!'),
        keys('Positive rationals lie right of 0, negative ones left.', 'There are infinitely many rationals between any two rationals.', '(a + b)/2 is always between a and b.'),
        remember('On the number line, the number further to the right is always the larger: −1/2 > −3/4.'),
      ],
      examples: [
        ex('Find a rational number halfway between 1/3 and 1/2.', ['(1/3 + 1/2) ÷ 2', '= (2/6 + 3/6) ÷ 2 = 5/6 ÷ 2 = 5/12'], '5/12'),
        ex('Write five rational numbers between −1 and 0.', ['Write −1 = −6/6 and 0 = 0/6.', 'Numbers between: −5/6, −4/6, −3/6, −2/6, −1/6'], '−5/6, −2/3, −1/2, −1/3, −1/6'),
      ],
      practice: [
        tp('mid', (r) => {
          const b = r.pick([2, 3, 4, 5, 6]), d = r.pick([3, 4, 5, 7, 8]);
          const a = r.int(-4, 3);
          let c = r.int(1, 6);
          if (a * d === c * b) c += 1;
          return typed(`Find the rational number exactly halfway between ${fx(a, b)} and ${fx(c, d)}.`, frac(a * d + c * b, 2 * b * d),
            ['Add the two numbers, then divide by 2.', `Common denominator ${b * d}.`],
            [`${fx(a, b)} + ${fx(c, d)} = ${fx(a * d + c * b, b * d)}`, `Halfway = ${fx(a * d + c * b, b * d)} ÷ 2 = ${fx(a * d + c * b, 2 * b * d)}`]);
        }),
        tp('point', (r) => {
          const d = r.pick([3, 4, 5, 6, 8]), k = r.int(1, 2 * d - 1), neg = r.int(0, 1) === 1;
          const val = neg ? -k : k;
          return typed(`On a number line each unit is divided into ${d} equal parts. Point P is ${k} parts to the ${neg ? 'LEFT' : 'RIGHT'} of 0. Which rational number is at P?`, frac(val, d),
            [`Each part is 1/${d}.`, neg ? 'Left of 0 means negative.' : 'Right of 0 means positive.'],
            [`P = ${n_(val)} × 1/${d} = ${fx(val, d)}`],
            [[fr(-val, d), 'Check the side: left of 0 is negative, right is positive.']]);
        }),
        tp('order', (r) => {
          const pool = r.shuffle([[-3, 4], [-1, 2], [-1, 3], [1, 5], [2, 3], [5, 6], [-5, 6], [3, 8], [7, 4], [-3, 2], [0, 1], [1, 2]] as [number, number][]).slice(0, 4);
          const sorted = [...pool].sort((x, y) => x[0] / x[1] - y[0] / y[1]);
          return { type: 'order', prompt: 'Arrange from smallest to largest.', ...ordering(r, sorted.map(([a, b]) => fx(a, b))), hints: ['Negative numbers are smaller than positive ones.', 'Change to a common denominator or to decimals to compare.'], solution: [sorted.map(([a, b]) => fx(a, b)).join(' < ')] };
        }),
        tp('count-between', (r) => {
          const d = r.pick([5, 6, 7, 8, 9, 10]);
          const a = r.int(1, 3), b = a + r.int(3, 6);
          return typed(`How many rational numbers with denominator ${d} (like k/${d}) lie strictly between ${a}/${d} and ${b}/${d}?`, num(b - a - 1),
            ['List the numerators strictly between.', `They are ${a + 1}, ${a + 2}, …, ${b - 1}.`],
            [`Numerators ${a + 1} to ${b - 1}: ${b - a - 1} numbers`, 'Note: with a bigger denominator there would be even more — infinitely many in total.'],
            [[String(b - a + 1), '"Strictly between" does not include the end points.'], [String(b - a), 'Do not count the end points.']]);
        }),
        bank('between', [
          { q: 'How many rational numbers are there between 1/5 and 1/4?', a: 'Infinitely many', w: ['None', 'One', 'Exactly ten'], h: ['Average them; then average again.'], s: ['Between any two rationals there are infinitely many rationals.'] },
          { q: 'Which number lies between −1/2 and −1/4?', a: '−3/8', w: ['−5/8', '−1/8', '1/3'], h: ['Average: (−1/2 − 1/4)/2.'], s: ['(−4/8 − 2/8)/2 = −3/8.'] },
          { q: 'Which is greater: −2/3 or −3/4?', a: '−2/3', w: ['−3/4', 'They are equal', 'Cannot compare'], h: ['−8/12 and −9/12.'], s: ['−8/12 is to the right of −9/12, so −2/3 is greater.'] },
          { q: 'Where is −7/4 on the number line?', a: 'Between −2 and −1', w: ['Between −1 and 0', 'Between 1 and 2', 'Between 0 and 1'], h: ['−7/4 = −1¾'], s: ['−1¾ is past −1 towards −2.'] },
          { q: 'How many integers lie strictly between −2 and 2?', a: '3', w: ['4', '5', 'Infinitely many'], h: ['List them.'], s: ['−1, 0, 1 — unlike rationals, there are only finitely many integers.'] },
          { q: 'Which number is halfway between 0 and 1/3?', a: '1/6', w: ['1/4', '1/5', '2/3'], h: ['(0 + 1/3) ÷ 2'], s: ['1/3 ÷ 2 = 1/6.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.rat.decimal', title: 'Decimal representation and converting decimals to p/q form', prereqs: ['ts8.m.rat.ops'],
      intro: [
        h('Decimals that stop and decimals that repeat'),
        p('Divide 3 by 8 and you get 0.375 — the division stops. Divide 1 by 3 and you get 0.3333… — it goes on forever, repeating 3. Every rational number gives one of these two kinds of decimal.'),
        def('Terminating decimal', 'A decimal that ends, like 0.375 or 2.45.'),
        def('Non-terminating recurring decimal', 'A decimal that goes on forever with a repeating block, like 0.333… or 0.272727… (we write the repeating block with a bar over it).'),
        h('Terminating decimal → p/q'),
        p('Read the decimal places: 0.375 is "375 thousandths" = 375/1000 = 3/8. Then simplify.'),
        h('Recurring decimal → p/q'),
        p('Let x = 0.777… Multiplying by 10 shifts the digits: 10x = 7.777… Subtract: 10x − x = 7, so 9x = 7 and x = 7/9. For a 2-digit repeating block, multiply by 100 instead: 0.454545… = 45/99 = 5/11.'),
        f('0.ddd… = d/9;  0.abab… = ab/99', 'zero point d recurring equals d over 9; two-digit block over 99'),
        X({
          title: 'What if? Repeating block over 99', formula: '0.(ab)(ab)… = ab/99',
          result: ['x', 'Value of the decimal', 'n/99', '', 6],
          vars: [['n', 'Two-digit repeating block ab', 1, 98, 1, 45]],
          notes: [['n', 'A bigger repeating block makes every copy bigger, so the value grows in proportion.', 'A smaller block gives a smaller decimal.']],
          mistakes: [['Writing 0.4545… as 45/100', '45/100 = 0.45 stops. The repeating version is a little bigger: 45/99.'], ['Using 9 for a two-digit block', 'Use as many 9s as there are digits in the block.']],
          real: 'Calculators show 5 ÷ 11 as 0.454545… — now you can turn it back into an exact fraction.',
        }),
        keys('Terminating: write over 10, 100, 1000 … and simplify.', 'Recurring with 1-digit block: block/9.', 'Recurring with 2-digit block: block/99.', 'Every terminating or recurring decimal is rational.'),
        remember('A fraction in lowest terms gives a terminating decimal only when its denominator has no prime factors other than 2 and 5.'),
        tip('0.999… = 9/9 = 1 exactly. Surprising but true!'),
      ],
      examples: [
        ex('Write 2.45 in p/q form.', ['2.45 = 245/100', 'Divide by 5: 49/20'], '49/20'),
        ex('Write 0.363636… in p/q form.', ['Let x = 0.3636…', '100x = 36.3636…', '100x − x = 36 → 99x = 36', 'x = 36/99 = 4/11'], '4/11'),
        ex('Write 1.222… in p/q form.', ['Let x = 1.222…; 10x = 12.222…', '9x = 11', 'x = 11/9'], '11/9'),
      ],
      practice: [
        tp('term', (r) => {
          const [n, d] = r.pick([[3, 8], [7, 20], [9, 25], [11, 40], [13, 50], [3, 16], [17, 20], [21, 8], [49, 20], [7, 125]] as [number, number][]);
          const dec = String(rd(n / d, 4));
          return typed(`Write ${dec} in the form p/q (lowest terms).`, frac(n, d, true),
            ['Count the decimal places to choose 10, 100, 1000 or 10000.', 'Then cancel common factors.'],
            [`${dec} = ${Math.round((n / d) * 10 ** (dec.split('.')[1].length))}/${10 ** dec.split('.')[1].length}`, `= ${n}/${d}`],
            [['not-lowest', 'Correct value, but simplify fully by cancelling common factors.']]);
        }),
        tp('rec1', (r) => {
          const w = r.int(0, 3), dgt = r.int(1, 8);
          const s = `${w}.${String(dgt).repeat(4)}…`;
          return typed(`Write ${s} (the ${dgt} repeats forever) in p/q form.`, frac(9 * w + dgt, 9),
            ['Let x equal the decimal and find 10x.', '10x − x removes the repeating tail.'],
            [`x = ${s}`, `10x = ${w * 10 + dgt}.${String(dgt).repeat(3)}…`, `9x = ${9 * w + dgt}`, `x = ${fx(9 * w + dgt, 9)}`],
            [[`${10 * w + dgt}/10`, 'That would be a decimal that STOPS. A repeating digit needs 9 in the denominator.']]);
        }),
        tp('rec2', (r) => {
          const blk = r.pick([12, 18, 27, 36, 45, 54, 63, 72, 81, 15, 24, 33, 42, 57]);
          const b = String(blk).padStart(2, '0');
          return typed(`Write 0.${b}${b}${b}… (the block "${b}" repeats) in p/q form, in lowest terms.`, frac(simp(blk, 99)[0], simp(blk, 99)[1], true),
            ['The repeating block has 2 digits, so multiply by 100.', '100x − x = 99x.'],
            [`100x = ${b}.${b}${b}…`, `99x = ${blk}`, `x = ${blk}/99 = ${fx(blk, 99)}`],
            [[`${blk}/100`, 'That is the terminating decimal 0.' + b + '. For a repeating block use 99.'], ['not-lowest', 'Correct value — now cancel the common factor.']]);
        }),
        tp('to-dec', (r) => {
          const [n, d] = r.pick([[1, 8], [5, 8], [3, 20], [7, 25], [9, 40], [1, 16], [13, 4], [11, 5], [27, 50], [3, 125]] as [number, number][]);
          return typed(`Write ${n}/${d} as a decimal.`, num(n / d),
            [`Divide ${n} by ${d}, or make the denominator a power of 10.`],
            [`${n}/${d} = ${n / d}`]);
        }),
        bank('kind', [
          { q: 'Which fraction gives a TERMINATING decimal?', a: '7/40', w: ['2/3', '5/6', '4/7'], h: ['Look at the prime factors of the denominator.'], s: ['40 = 2³ × 5, only 2s and 5s, so 7/40 = 0.175 terminates.'] },
          { q: 'Which fraction gives a RECURRING decimal?', a: '5/12', w: ['3/8', '9/20', '7/25'], h: ['12 = 2² × 3'], s: ['12 has the prime factor 3, so 5/12 = 0.41666… recurs.'] },
          { q: '0.999… (9 repeating) equals:', a: '1', w: ['0.9', '99/100', 'just less than 1'], h: ['x = 0.999…, 10x = 9.999…'], s: ['9x = 9 so x = 1.'] },
          { q: 'Which is NOT a rational number?', a: '0.101001000100001… (no repeating block)', w: ['0.121212…', '0.75', '−3/7'], h: ['Rational decimals stop or repeat.'], s: ['The pattern grows longer each time and never repeats a fixed block.'] },
          { q: '0.3 (terminating) and 0.333… (recurring) are:', a: 'different: 3/10 and 1/3', w: ['equal', 'both 1/3', 'both 3/10'], h: ['One stops, one does not.'], s: ['0.3 = 3/10 while 0.333… = 1/3.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 2 LINEAR EQUATIONS
const ch2: USpec = {
  id: 'ts8.m.ch2', subject: 'math', title: 'Linear Equations in One Variable', source: src(2),
  objectives: [
    {
      id: 'ts8.m.lin.one-side', title: 'Solving equations with the variable on one side',
      intro: [
        h('A balance that must stay level'),
        p('Think of an equation as a weighing balance in a kirana shop. Whatever you do to one pan, you must do to the other, or it tips over. Solving means unwrapping x until it stands alone on one side.'),
        def('Linear equation in one variable', 'An equation like 3x + 5 = 20 where the variable appears only to the power 1. It has exactly one solution.'),
        def('Solution', 'The value of the variable that makes both sides equal. For 3x + 5 = 20, x = 5 because 3 × 5 + 5 = 20.'),
        stepsB('Undo addition/subtraction first: subtract 5 from both sides → 3x = 15.', 'Undo multiplication/division: divide both sides by 3 → x = 5.', 'Check by putting x back into the original equation.'),
        p('"Transposing" is a shortcut for the same idea: a term moves to the other side and changes its operation — + becomes −, × becomes ÷.'),
        f('ax + b = c  ⇒  x = (c − b)/a', 'a x plus b equals c, so x equals c minus b, over a'),
        X({
          title: 'What if? Solve ax + b = c', formula: 'x = (c − b)/a',
          result: ['x', 'Solution', '(c - b)/a', '', 3],
          vars: [['a', 'Coefficient a', 1, 10, 1, 3], ['b', 'Constant b', -20, 20, 1, 5], ['c', 'Right side c', -30, 40, 1, 20]],
          notes: [
            ['a', 'x is shared out among more copies, so each x is smaller.', 'Fewer copies of x must make the same total, so x is bigger.'],
            ['c', 'A bigger right side needs a bigger x to balance.', 'A smaller right side needs a smaller x.'],
          ],
          mistakes: [['Moving b without changing its sign: x = (c + b)/a', 'Subtract b from BOTH sides: + b on the left becomes − b on the right.'], ['Dividing only c by a, not (c − b)', 'Undo the + b first, then divide everything left by a.']],
          real: 'Auto fare: ₹30 base plus ₹15 per km. A ₹120 fare means 15x + 30 = 120, so x = 6 km.',
        }),
        keys('Do the same thing to both sides.', 'Undo + and − first, then × and ÷.', 'Always check the answer.'),
        remember('A solution can be negative or a fraction: 4x = −6 gives x = −3/2.'),
      ],
      examples: [
        ex('Solve 5x − 7 = 18.', ['Add 7 to both sides: 5x = 25', 'Divide by 5: x = 5', 'Check: 5 × 5 − 7 = 18 ✓'], 'x = 5'),
        ex('Solve 3(y + 4) = 6.', ['Divide both sides by 3: y + 4 = 2', 'Subtract 4: y = −2', 'Check: 3(−2 + 4) = 6 ✓'], 'y = −2'),
        ex('Solve x/4 + 3 = 7.', ['Subtract 3: x/4 = 4', 'Multiply by 4: x = 16'], 'x = 16'),
      ],
      practice: [
        tp('axb', (r) => {
          const x = r.int(-8, 12), a = r.int(2, 9);
          let b = r.int(-15, 15); if (!b) b = 4;
          const c = a * x + b;
          const wrong = (c + b) / a;
          return typed(`Solve: ${lin(a, b)} = ${n_(c)}`, num(x),
            [`First ${b > 0 ? 'subtract' : 'add'} ${Math.abs(b)} on both sides.`, `Then divide both sides by ${a}.`],
            [`${a}x = ${n_(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${n_(a * x)}`, `x = ${n_(a * x)} ÷ ${a} = ${n_(x)}`, `Check: ${a} × ${pn(x)} ${sg(b)} = ${n_(c)} ✓`],
            Number.isInteger(wrong) && wrong !== x ? [[String(wrong), `When ${n_(b)} moves across it must change sign.`]] : []);
        }),
        tp('xa', (r) => {
          const a = r.pick([2, 3, 4, 5, 6]), k = r.int(-5, 8), x = a * k;
          const b = r.int(1, 12), c = k + b;
          return typed(`Solve: x/${a} + ${b} = ${n_(c)}`, num(x),
            [`Subtract ${b} from both sides.`, `Then multiply both sides by ${a}.`],
            [`x/${a} = ${n_(c)} − ${b} = ${n_(k)}`, `x = ${n_(k)} × ${a} = ${n_(x)}`],
            [[String(k), `That is x/${a}. Multiply by ${a} to get x.`]]);
        }),
        tp('bracket', (r) => {
          const a = r.int(2, 7), b = r.int(-6, 8) || 3, x = r.int(-6, 10);
          const c = a * (x + b);
          return typed(`Solve: ${a}(${lin(1, b)}) = ${n_(c)}`, num(x),
            [`Divide both sides by ${a} first (or expand the bracket).`, `Then ${b > 0 ? 'subtract' : 'add'} ${Math.abs(b)}.`],
            [`x ${sg(b)} = ${n_(c)} ÷ ${a} = ${n_(x + b)}`, `x = ${n_(x)}`]);
        }),
        tp('frac-sol', (r) => {
          const a = r.pick([2, 3, 4, 5, 6, 8]);
          let n = r.int(-9, 13); while (n % a === 0) n += 1;
          const b = r.int(-6, 9) || 2;
          return typed(`Solve: ${a}x ${sg(b)} = ${n_(n + b)}. (The answer may be a fraction.)`, frac(n, a),
            [`Get ${a}x alone first.`, `${a}x = ${n_(n)}, so divide by ${a}.`],
            [`${a}x = ${n_(n + b)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${n_(n)}`, `x = ${fx(n, a)}`]);
        }, 2),
        orderT('steps', 'Put the steps for solving 4x − 9 = 15 in order.', ['Write the equation: 4x − 9 = 15', 'Add 9 to both sides: 4x = 24', 'Divide both sides by 4: x = 6', 'Check: 4 × 6 − 9 = 15 ✓'], ['Undo the subtraction before the multiplication.', 'Checking comes last.']),
        bank('which-linear', [
          { q: 'Which is a linear equation in one variable?', a: '7x − 3 = 11', w: ['x² + 1 = 5', 'x + y = 4', '3/x = 2'], h: ['One variable, power 1 only.'], s: ['Only 7x − 3 = 11 has one variable to the first power.'] },
          { q: 'What is the solution of 2x = −9?', a: 'x = −9/2', w: ['x = −7', 'x = −18', 'x = 9/2'], h: ['Divide by 2.'], s: ['x = −9 ÷ 2 = −9/2.'] },
          { q: 'Transposing +6 from the left side to the right side makes it:', a: '−6', w: ['+6', '×6', '÷6'], h: ['Subtract 6 from both sides.'], s: ['+6 on one side becomes −6 on the other.'] },
          { q: 'Is x = 3 a solution of 4x − 5 = 7?', a: 'Yes, because 4 × 3 − 5 = 7', w: ['No, because 4 × 3 − 5 = 17', 'No, x must be 7', 'Yes, because 3 + 4 = 7'], h: ['Substitute and check.'], s: ['12 − 5 = 7 ✓'] },
          { q: 'A linear equation in one variable has:', a: 'exactly one solution', w: ['two solutions', 'no solution ever', 'infinitely many solutions'], h: ['Think of the balance.'], s: ['ax + b = c with a ≠ 0 has the single solution x = (c − b)/a.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.lin.both-sides', title: 'Solving equations with variables on both sides', prereqs: ['ts8.m.lin.one-side'],
      intro: [
        h('Collect the x\'s on one side'),
        p('In 5x + 3 = 2x + 15, x appears on both sides. The plan is simple: bring all the x-terms to one side and all the numbers to the other side, then solve as before.'),
        stepsB('Subtract 2x from both sides: 3x + 3 = 15.', 'Subtract 3 from both sides: 3x = 12.', 'Divide by 3: x = 4.', 'Check: 5(4) + 3 = 23 and 2(4) + 15 = 23 ✓'),
        f('ax + b = cx + d  ⇒  x = (d − b)/(a − c)', 'x equals d minus b over a minus c'),
        X({
          title: 'What if? x on both sides', formula: 'x = (d − b)/(a − c)',
          result: ['x', 'Solution', '(d - b)/(a - c)', '', 3],
          vars: [['a', 'x-coefficient on left a', 4, 10, 1, 5], ['b', 'Number on left b', -10, 10, 1, 3], ['c', 'x-coefficient on right c', 0, 3, 1, 2], ['d', 'Number on right d', -10, 30, 1, 15]],
          notes: [['a', 'The left side gains x faster, so the sides meet at a smaller x.', 'When a gets close to c the two sides grow at nearly the same rate and meet far away.']],
          mistakes: [['Adding 2x instead of subtracting it', 'To remove +2x from the right side, SUBTRACT 2x from both sides.'], ['If a = c the method breaks', 'Then the x\'s cancel: either no solution or every x works — not a normal linear equation in one variable.']],
          real: 'Plan A costs ₹200 + ₹5 per call; plan B costs ₹100 + ₹7 per call. They cost the same when 200 + 5x = 100 + 7x, i.e. x = 50 calls.',
        }),
        p('Equations with fractions: multiply both sides by the LCM of the denominators first. This "clears" the fractions and leaves a simple equation.'),
        keys('Variables to one side, numbers to the other.', 'Clear fractions with the LCM of denominators.', 'Expand brackets before collecting terms.'),
        remember('Check by substituting into BOTH sides of the ORIGINAL equation.'),
        tip('Move the x-term with the smaller coefficient — then you work with a positive coefficient and fewer minus signs.'),
      ],
      examples: [
        ex('Solve 7x − 4 = 3x + 12.', ['Subtract 3x: 4x − 4 = 12', 'Add 4: 4x = 16', 'x = 4'], 'x = 4'),
        ex('Solve x/2 + x/3 = 10.', ['LCM of 2 and 3 is 6. Multiply both sides by 6.', '3x + 2x = 60', '5x = 60, x = 12'], 'x = 12'),
        ex('Solve 2(x − 3) = 5(x + 3).', ['Expand: 2x − 6 = 5x + 15', 'Subtract 2x: −6 = 3x + 15', 'Subtract 15: −21 = 3x', 'x = −7'], 'x = −7'),
      ],
      practice: [
        tp('both', (r) => {
          const x = r.int(-6, 10), c = r.int(1, 5), a = c + r.int(1, 6);
          const b = r.int(-12, 12), d = (a - c) * x + b;
          return typed(`Solve: ${lin(a, b)} = ${lin(c, d)}`, num(x),
            [`Subtract ${c}x from both sides.`, 'Then move the numbers and divide.'],
            [`${lin(a - c, b)} = ${n_(d)}`, `${a - c === 1 ? '' : a - c}x = ${n_(d - b)}`, `x = ${n_(x)}`],
            [[String((d + b) / (a - c)), 'A number moved across the = sign must change sign.']]);
        }),
        tp('brackets', (r) => {
          const x = r.int(-5, 8), a = r.int(2, 5), b = r.int(-4, 4) || 1, c = r.int(a + 1, 8);
          const d = (a * (x + b) - c * x);
          // a(x + b) = c x + d
          return typed(`Solve: ${a}(${lin(1, b)}) = ${lin(c, d)}`, num(x),
            [`Expand the bracket: ${a}x ${sg(a * b)}.`, 'Collect x-terms on the side with the larger coefficient.'],
            [`${lin(a, a * b)} = ${lin(c, d)}`, `${n_(a * b - d)} = ${c - a}x`, `x = ${n_(x)}`]);
        }, 2),
        tp('fractions', (r) => {
          const [p1, q1] = r.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 6], [5, 10]] as [number, number][]);
          const k = r.int(1, 4) * (r.int(0, 1) ? 1 : -1), x = lcm(p1, q1) * k;
          const s = x / p1 + x / q1;
          return typed(`Solve: x/${p1} + x/${q1} = ${n_(s)}`, num(x),
            [`Multiply every term by the LCM of ${p1} and ${q1}, which is ${lcm(p1, q1)}.`],
            [`${lcm(p1, q1) / p1}x + ${lcm(p1, q1) / q1}x = ${n_(s * lcm(p1, q1))}`, `${lcm(p1, q1) / p1 + lcm(p1, q1) / q1}x = ${n_(s * lcm(p1, q1))}`, `x = ${n_(x)}`]);
        }, 2),
        tp('ratio-form', (r) => {
          const x = r.int(1, 9), a = r.int(1, 4), b = r.int(1, 6), c = r.int(1, 4);
          const num1 = a * x + b, den1 = c * x + b + r.int(1, 5);
          const g = gcd(num1, den1);
          const P = num1 / g, Q = den1 / g;
          if (P * c === Q * a) return typed(`Solve: ${lin(a, b)} = ${n_(num1)}`, num(x), ['Subtract, then divide.'], [`x = ${x}`]);
          return typed(`Solve: (${lin(a, b)}) / (${lin(c, den1 - c * x)}) = ${P}/${Q}`, num(x),
            ['Cross-multiply: Q × (top) = P × (bottom).', 'Then collect x-terms.'],
            [`${Q}(${lin(a, b)}) = ${P}(${lin(c, den1 - c * x)})`, `${lin(Q * a, Q * b)} = ${lin(P * c, P * (den1 - c * x))}`, `x = ${x}`]);
        }, 3),
        bank('both-facts', [
          { q: 'In 6x + 5 = 2x − 3, after subtracting 2x from both sides we get:', a: '4x + 5 = −3', w: ['8x + 5 = −3', '4x + 5 = 3', '6x = 2x − 8'], h: ['6x − 2x = 4x'], s: ['6x − 2x + 5 = −3 → 4x + 5 = −3.'] },
          { q: 'To clear the fractions in x/4 − x/6 = 1, multiply both sides by:', a: '12', w: ['24', '10', '2'], h: ['Use the LCM.'], s: ['LCM(4, 6) = 12.'] },
          { q: 'The solution of 3x + 7 = 3x + 9 is:', a: 'There is no solution', w: ['x = 2', 'x = 0', 'Every x works'], h: ['Subtract 3x.'], s: ['You get 7 = 9, which is never true.'] },
          { q: 'Solve 9 − 2x = x.', a: 'x = 3', w: ['x = 9', 'x = −3', 'x = 4.5'], h: ['Add 2x to both sides.'], s: ['9 = 3x → x = 3.'] },
          { q: 'Expanding −3(x − 4) gives:', a: '−3x + 12', w: ['−3x − 12', '−3x − 4', '3x + 12'], h: ['−3 × −4 = +12'], s: ['−3 × x = −3x and −3 × (−4) = +12.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.lin.word', title: 'Word problems with linear equations', prereqs: ['ts8.m.lin.both-sides'],
      intro: [
        h('From words to an equation'),
        p('Real problems arrive in sentences, not symbols. The secret skill is translation: choose a letter for the unknown, write every other quantity using it, and form one equation.'),
        stepsB('Read carefully and decide what the unknown is. Let it be x.', 'Write the other quantities in terms of x.', 'Use the condition in the question to form an equation.', 'Solve it and answer the question in words, with units.', 'Check the answer against the story.'),
        p('Useful translations: "5 more than x" → x + 5; "twice x" → 2x; "three consecutive integers" → x, x + 1, x + 2; "consecutive even numbers" → x, x + 2, x + 4; "a two-digit number with tens digit t and units digit u" → 10t + u.'),
        f('Sum of k consecutive integers starting at x = kx + (0 + 1 + … + (k − 1))', 'k x plus the sum zero to k minus 1'),
        X({
          title: 'What if? Three consecutive numbers', formula: 'x + (x + 1) + (x + 2) = 3x + 3',
          result: ['S', 'Sum of the three numbers', '3*x + 3'],
          vars: [['x', 'Smallest number x', -20, 50, 1, 10]],
          notes: [['x', 'Each of the three numbers goes up by 1, so the sum goes up by 3.', 'Each number goes down by 1, so the sum falls by 3.']],
          mistakes: [['Writing consecutive numbers as x, 2x, 3x', 'Consecutive means "one more each time": x, x + 1, x + 2.']],
          real: 'If three consecutive house numbers add to 63, then 3x + 3 = 63 and the houses are 20, 21 and 22.',
        }),
        keys('Let the unknown be x and say what x stands for.', 'Translate each phrase carefully.', 'Answer with units and check.'),
        remember('The sum of three consecutive integers is always a multiple of 3: 3x + 3 = 3(x + 1).'),
      ],
      examples: [
        ex('The sum of three consecutive integers is 72. Find them.', ['Let them be x, x + 1, x + 2.', '3x + 3 = 72 → 3x = 69 → x = 23'], '23, 24, 25'),
        ex('A rectangle\'s length is 4 cm more than its breadth. Its perimeter is 48 cm. Find the breadth.', ['Breadth = x, length = x + 4', '2(x + x + 4) = 48 → 4x + 8 = 48', 'x = 10'], 'Breadth 10 cm, length 14 cm'),
        ex('Ramu is 3 times as old as his son. In 12 years he will be twice as old as his son. Find the son\'s age.', ['Son = x, Ramu = 3x', '3x + 12 = 2(x + 12)', '3x + 12 = 2x + 24 → x = 12'], 'Son 12 years, Ramu 36 years'),
      ],
      practice: [
        tp('consec', (r) => {
          const k = r.pick([2, 3, 4]), even = r.int(0, 1) === 1;
          const step = even ? 2 : 1;
          let x = r.int(5, 60); if (even && x % 2) x += 1;
          const nums = Array.from({ length: k }, (_, i) => x + i * step);
          const s = nums.reduce((a, b) => a + b, 0);
          return typed(`The sum of ${k} consecutive ${even ? 'even numbers' : 'integers'} is ${s}. What is the smallest of them?`, num(x),
            [`Call them ${nums.map((_, i) => (i ? `x + ${i * step}` : 'x')).join(', ')}.`, `Add: ${k}x + ${s - k * x} = ${s}.`],
            [`${k}x + ${s - k * x} = ${s}`, `${k}x = ${k * x}`, `x = ${x}; the numbers are ${nums.join(', ')}`],
            [[String(nums[k - 1]), 'That is the LARGEST. The question asks for the smallest.']]);
        }),
        tp('rect', (r) => {
          const b = r.int(4, 25), d = r.int(2, 12), l = b + d, P = 2 * (l + b);
          return typed(`The length of a rectangular garden is ${d} m more than its breadth. Its perimeter is ${P} m. Find the breadth.`, num(b, 'm'),
            ['Breadth = x, length = x + ' + d + '.', 'Perimeter = 2(length + breadth).'],
            [`2(x + x + ${d}) = ${P}`, `4x + ${2 * d} = ${P}`, `x = ${b} m (length ${l} m)`],
            [[String(l), 'That is the length. Breadth is the shorter side.']]);
        }),
        tp('age', (r) => {
          const son = r.int(5, 15), m = r.pick([3, 4]), t = son * (m - 2);
          // father = m*son; after t years father = 2(son + t) -> m*son + t = 2son + 2t -> t = (m-2)son
          const who = nm(r);
          return typed(`${who}'s mother is ${m} times as old as ${who}. After ${t} years she will be twice as old as ${who}. How old is ${who} now?`, num(son),
            [`${who} = x, mother = ${m}x.`, `In ${t} years: ${m}x + ${t} = 2(x + ${t}).`],
            [`${m}x + ${t} = 2x + ${2 * t}`, `${m - 2}x = ${t}`, `x = ${son} years (mother ${m * son})`]);
        }, 2),
        tp('coins', (r) => {
          const f5 = r.int(3, 20), t2 = r.int(3, 20), n = f5 + t2, v = 5 * f5 + 2 * t2;
          return typed(`A piggy bank has ${n} coins, all ₹5 and ₹2 coins, worth ${inr(v)} in total. How many ₹5 coins are there?`, num(f5),
            ['Let the number of ₹5 coins be x. Then ₹2 coins = ' + n + ' − x.', `5x + 2(${n} − x) = ${v}`],
            [`5x + ${2 * n} − 2x = ${v}`, `3x = ${v - 2 * n}`, `x = ${f5} coins of ₹5 (and ${t2} coins of ₹2)`],
            [[String(t2), 'That is the number of ₹2 coins.']], { steps: [st(`If x coins are ₹5, the ₹2 coins are ${n} − x. What is 3x equal to?`, num(v - 2 * n)), st('How many ₹5 coins?', num(f5))] });
        }, 2),
        bank('translate', [
          { q: '"A number increased by 7 is 19" as an equation:', a: 'x + 7 = 19', w: ['7x = 19', 'x − 7 = 19', 'x = 19 + 7'], h: ['Increased by → add.'], s: ['x + 7 = 19.'] },
          { q: '"Twice a number minus 5 equals 13" as an equation:', a: '2x − 5 = 13', w: ['2(x − 5) = 13', 'x² − 5 = 13', '5 − 2x = 13'], h: ['Twice → 2x, then subtract 5.'], s: ['2x − 5 = 13.'] },
          { q: 'A two-digit number has tens digit t and units digit u. The number is:', a: '10t + u', w: ['t + u', 'tu', '10u + t'], h: ['47 = 4 × 10 + 7.'], s: ['Tens digit counts tens: 10t + u.'] },
          { q: 'Three consecutive odd numbers can be written as:', a: 'x, x + 2, x + 4 (x odd)', w: ['x, x + 1, x + 2', 'x, 3x, 5x', '2x, 2x + 1, 2x + 2'], h: ['Odd numbers are 2 apart.'], s: ['7, 9, 11 = x, x + 2, x + 4.'] },
          { q: '"One-third of a number is 4 more than one-fourth of it" as an equation:', a: 'x/3 = x/4 + 4', w: ['x/3 + 4 = x/4', '3x = 4x + 4', 'x/3 = 4x/4'], h: ['"is" means "="'], s: ['x/3 = x/4 + 4, giving x = 48.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 3 CONSTRUCTION OF QUADRILATERALS
const QPROPS: [string, string][] = [
  ['Parallelogram', 'Opposite sides equal and parallel; diagonals bisect each other'],
  ['Rectangle', 'All angles 90°; diagonals equal and bisect each other'],
  ['Rhombus', 'All sides equal; diagonals bisect each other at right angles'],
  ['Square', 'All sides equal, all angles 90°, diagonals equal and perpendicular'],
  ['Kite', 'Two pairs of equal adjacent sides; one diagonal bisects the other at 90°'],
  ['Trapezium', 'Exactly one pair of parallel sides'],
];
const ch3: USpec = {
  id: 'ts8.m.ch3', subject: 'math', title: 'Construction of Quadrilaterals', source: src(3),
  objectives: [
    {
      id: 'ts8.m.quad.props', title: 'Quadrilaterals and their properties',
      intro: [
        h('Four sides, four angles, one big family'),
        p('Look around: a door, a kite flying at Sankranti, a table top, the cross-section of a drain — all quadrilaterals. Each member of the family has its own special properties, and those properties are exactly what we use when we construct them.'),
        def('Quadrilateral', 'A closed figure with four sides, four angles, four vertices and two diagonals.'),
        p('Draw one diagonal and the quadrilateral splits into two triangles. Each triangle has angles adding to 180°, so the four angles of any quadrilateral add to 2 × 180° = 360°.'),
        f('∠A + ∠B + ∠C + ∠D = 360°', 'the four angles add up to 360 degrees'),
        X({
          title: 'What if? Find the fourth angle', formula: '∠D = 360° − (∠A + ∠B + ∠C)',
          result: ['D', 'Fourth angle', '360 - (A + B + C)', '°'],
          vars: [['A', '∠A', 40, 150, 5, 80, '°'], ['B', '∠B', 40, 150, 5, 100, '°'], ['C', '∠C', 40, 120, 5, 75, '°']],
          notes: [['A', 'The total is fixed at 360°, so if ∠A grows, ∠D must shrink by the same amount.', 'If ∠A shrinks, ∠D grows to keep the total 360°.']],
          mistakes: [['Using 180° for a quadrilateral', '180° is the triangle sum. A quadrilateral is two triangles: 360°.']],
          real: 'A carpenter checking a door frame: if three corners are 90°, the fourth must also be 90°.',
        }),
        h('The family tree'),
        p('A square is a special rectangle AND a special rhombus. Rectangles and rhombuses are special parallelograms. A parallelogram is a special trapezium-like shape with TWO pairs of parallel sides.'),
        keys(...QPROPS.map(([a, b]) => `${a}: ${b}.`)),
        remember('In a parallelogram, adjacent angles add to 180° and opposite angles are equal.'),
      ],
      examples: [
        ex('Three angles of a quadrilateral are 75°, 90° and 115°. Find the fourth.', ['Sum of three = 280°', '360° − 280° = 80°'], '80°'),
        ex('The angles of a quadrilateral are in the ratio 2 : 3 : 4 : 6. Find the largest angle.', ['2 + 3 + 4 + 6 = 15 parts', '360° ÷ 15 = 24° per part', 'Largest = 6 × 24° = 144°'], '144°'),
        ex('One angle of a parallelogram is 65°. Find the others.', ['Opposite angle = 65°', 'Adjacent angles = 180° − 65° = 115°'], '65°, 115°, 65°, 115°'),
      ],
      practice: [
        tp('fourth', (r) => {
          const A = r.int(12, 28) * 5, B = r.int(12, 28) * 5, C = r.int(10, 24) * 5;
          const D = 360 - A - B - C;
          if (D <= 20) return typed(`Three angles of a quadrilateral are 70°, 95° and 110°. Find the fourth angle.`, num(85, '°'), ['Angle sum is 360°.'], ['360 − 275 = 85°']);
          return typed(`Three angles of a quadrilateral are ${A}°, ${B}° and ${C}°. Find the fourth angle.`, num(D, '°'),
            ['The four angles add to 360°.', `Subtract ${A + B + C}° from 360°.`],
            [`${A} + ${B} + ${C} = ${A + B + C}`, `360 − ${A + B + C} = ${D}°`],
            [[String(180 - A - B - C), 'You used 180°. A quadrilateral\'s angles add to 360°.']]);
        }),
        tp('ratio', (r) => {
          const rt = r.pick([[1, 2, 3, 4], [2, 3, 3, 4], [3, 4, 5, 6], [1, 1, 2, 2], [2, 3, 4, 6], [4, 5, 6, 9], [1, 2, 2, 3], [3, 5, 7, 9]]);
          const s = rt.reduce((a, b) => a + b, 0), u = 360 / s;
          const which = r.pick(['largest', 'smallest']);
          const ans = (which === 'largest' ? Math.max(...rt) : Math.min(...rt)) * u;
          return typed(`The angles of a quadrilateral are in the ratio ${rt.join(' : ')}. Find the ${which} angle.`, num(ans, '°'),
            [`Total parts = ${s}.`, `One part = 360° ÷ ${s}.`],
            [`One part = ${u}°`, `${which} = ${which === 'largest' ? Math.max(...rt) : Math.min(...rt)} × ${u} = ${ans}°`]);
        }),
        tp('para', (r) => {
          const a = r.int(8, 34) * 5, kind = r.pick(['adjacent', 'opposite']);
          const ans = kind === 'adjacent' ? 180 - a : a;
          return typed(`One angle of a parallelogram is ${a}°. What is the angle ${kind} to it?`, num(ans, '°'),
            [kind === 'adjacent' ? 'Adjacent angles of a parallelogram add to 180°.' : 'Opposite angles of a parallelogram are equal.'],
            [kind === 'adjacent' ? `180 − ${a} = ${ans}°` : `Opposite angle = ${a}°`],
            [[String(kind === 'adjacent' ? a : 180 - a), kind === 'adjacent' ? 'Opposite angles are equal; ADJACENT angles add to 180°.' : 'That would be the adjacent angle.']]);
        }),
        matchT('match', 'Match each quadrilateral with its property', QPROPS, ['A square has every property of a rectangle and of a rhombus.']),
        tp('tap-rhombus', (r) => {
          const shape = r.pick(['rhombus', 'rectangle', 'square']);
          const all = [
            { label: 'All sides are equal', rh: true, re: false, sq: true },
            { label: 'All angles are 90°', rh: false, re: true, sq: true },
            { label: 'Diagonals bisect each other', rh: true, re: true, sq: true },
            { label: 'Diagonals are perpendicular', rh: true, re: false, sq: true },
            { label: 'Diagonals are equal', rh: false, re: true, sq: true },
            { label: 'Opposite sides are parallel', rh: true, re: true, sq: true },
            { label: 'Only one pair of parallel sides', rh: false, re: false, sq: false },
          ];
          const items = all.map((x) => ({ label: x.label, ok: shape === 'rhombus' ? x.rh : shape === 'rectangle' ? x.re : x.sq }));
          return { type: 'tap', prompt: `Tap every property that is ALWAYS true for a ${shape}.`, ...tapAll(r, items), hints: ['Think of a tilted (non-square) example of the shape.', 'A square has all the properties of a rectangle and a rhombus.'], solution: [`True for a ${shape}: ${items.filter((x) => x.ok).map((x) => x.label).join('; ')}`] };
        }, 2),
      ],
    },
    {
      id: 'ts8.m.quad.construct', title: 'Constructing a quadrilateral from five measurements', prereqs: ['ts8.m.quad.props'],
      intro: [
        h('Why five measurements?'),
        p('Give four bamboo sticks to a friend and ask for a quadrilateral. They can push it into many shapes — four sides alone do not fix it. Add ONE diagonal and the shape becomes rigid. In general, five independent measurements fix a unique quadrilateral.'),
        p('The textbook constructions use these five-measurement cases:'),
        keys('Case 1: four sides and one diagonal.', 'Case 2: three sides and two diagonals.', 'Case 3: two adjacent sides and three angles.', 'Case 4: three sides and two included angles.'),
        stepsB('Draw a rough sketch and label all given measurements.', 'Find a triangle you can draw completely (e.g. sides AB, BC and diagonal AC).', 'Draw that triangle with ruler and compasses.', 'Locate the fourth vertex using arcs or angles from the known points.', 'Join the vertices and write the steps of construction.'),
        p('Every triangle you build must obey the triangle inequality: the sum of any two sides must be greater than the third. If it fails, the construction is impossible.'),
        f('Construction possible only if a + b > c for every side c of each triangle', 'any two sides together longer than the third'),
        X({
          title: 'What if? Check the triangle inequality', formula: 'slack = (a + b) − c (must be > 0)',
          result: ['s', 'Slack (a + b − c)', 'a + b - c', 'cm', 1],
          vars: [['a', 'Side a', 1, 10, 0.5, 4, 'cm'], ['b', 'Side b', 1, 10, 0.5, 5, 'cm'], ['c', 'Diagonal c', 1, 18, 0.5, 6, 'cm']],
          notes: [['c', 'A longer diagonal eats up the slack — once it reaches a + b the two arcs no longer meet.', 'A shorter diagonal leaves more room for the triangle.']],
          mistakes: [['Thinking a + b = c is fine', 'Then the "triangle" is flat — a straight line. The sum must be strictly greater.']],
          real: 'You cannot build a triangular frame from sticks of 3 cm, 4 cm and 8 cm — the two short ones cannot reach.',
        }),
        remember('Four sides alone (or four angles alone) never fix a quadrilateral.'),
        tip('Always draw a rough figure first — it shows you which triangle to start with.'),
      ],
      examples: [
        ex('Can quadrilateral PQRS be drawn with PQ = 4 cm, QR = 5 cm, diagonal PR = 10 cm?', ['Check triangle PQR: 4 + 5 = 9', '9 is not greater than 10', 'Triangle PQR cannot exist.'], 'No'),
        ex('Construct ABCD with AB = 4.5, BC = 5.5, CD = 4, AD = 6, AC = 7 cm (outline).', ['Draw AC = 7 cm.', 'With centres A and C, radii 4.5 and 5.5, draw arcs meeting at B.', 'On the other side, radii 6 (from A) and 4 (from C) meet at D.', 'Join AB, BC, CD, DA.'], 'ABCD constructed (Case 1)'),
      ],
      practice: [
        tp('ineq', (r) => {
          const a = r.int(3, 8), b = r.int(3, 8), ok = r.int(0, 1) === 1;
          const c = ok ? r.int(Math.abs(a - b) + 1, a + b - 1) : a + b + r.int(0, 3);
          return mcq(r, `For quadrilateral ABCD you are given AB = ${a} cm, BC = ${b} cm and diagonal AC = ${c} cm. Can triangle ABC (and so ABCD) be constructed?`,
            ok ? `Yes, because ${a} + ${b} > ${c}` : `No, because ${a} + ${b} is not greater than ${c}`,
            ok ? [`No, because ${a} + ${b} is not greater than ${c}`, 'No, a diagonal can never be longer than a side'] : [`Yes, because ${a} + ${b} > ${c}`, 'Yes, any three lengths make a triangle'],
            ['Use the triangle inequality on triangle ABC.', `Compare ${a} + ${b} with ${c}.`], [`${a} + ${b} = ${a + b} ${a + b > c ? '>' : '≤'} ${c}`, ok ? 'The arcs from A and C will meet: construction possible.' : 'The arcs from A and C never meet: construction impossible.']);
        }),
        tp('case3', (r) => {
          const A = r.int(14, 26) * 5, B = r.int(14, 24) * 5, C = r.int(12, 22) * 5;
          const D = 360 - A - B - C;
          if (D < 40) return typed('To construct ABCD you are given ∠A = 75°, ∠B = 80°, ∠C = 120°. What will ∠D measure?', num(85, '°'), ['Angles add to 360°.'], ['360 − 275 = 85°']);
          return typed(`To construct ABCD (two adjacent sides and three angles) you are given ∠A = ${A}°, ∠B = ${B}°, ∠C = ${C}°. What will ∠D measure in the finished figure?`, num(D, '°'),
            ['The angle sum of a quadrilateral is 360°.'], [`∠D = 360 − (${A} + ${B} + ${C}) = ${D}°`]);
        }),
        orderT('order1', 'Order the steps to construct ABCD given AB, BC, CD, DA and diagonal AC.', [
          'Draw a rough sketch and mark the measurements',
          'Draw the diagonal AC',
          'From A and C draw arcs of radii AB and BC to locate B',
          'On the other side of AC, draw arcs of radii AD and CD to locate D',
          'Join AB, BC, CD and DA',
        ], ['Start with the line segment you know completely.', 'B and D lie on opposite sides of AC.']),
        orderT('order3', 'Order the steps to construct PQRS given PQ, QR and ∠P, ∠Q, ∠R.', [
          'Draw a rough sketch with all measurements',
          'Draw PQ of the given length',
          'Make ∠Q at Q and cut QR of the given length',
          'Make ∠P at P and ∠R at R; the two rays meet at S',
          'Label S and check that ∠S = 360° − (∠P + ∠Q + ∠R)',
        ], ['Begin with the side between two given angles.'], 2),
        bank('cases', [
          { q: 'How many independent measurements are needed to construct a unique quadrilateral?', a: '5', w: ['4', '3', '6'], h: ['Four sides alone are not enough.'], s: ['Five measurements fix the shape (for example four sides and one diagonal).'] },
          { q: 'Which set of data is NOT enough to construct a unique quadrilateral?', a: 'Four sides only', w: ['Four sides and a diagonal', 'Three sides and two diagonals', 'Two adjacent sides and three angles'], h: ['A frame of four sticks can be pushed around.'], s: ['Four sides give only 4 measurements; the shape can still flex.'] },
          { q: 'With three sides and two diagonals, which triangle is usually drawn first?', a: 'One formed by two sides and a diagonal', w: ['Any triangle formed by two diagonals only', 'No triangle is needed', 'A right triangle always'], h: ['You need three known lengths.'], s: ['E.g. AB, BC and AC form a triangle you can draw completely.'] },
          { q: 'Knowing all four angles of a quadrilateral fixes:', a: 'its shape type but not its size', w: ['its exact size and shape', 'nothing at all', 'only its perimeter'], h: ['Think of rectangles of different sizes.'], s: ['All rectangles have four 90° angles but different sizes.'] },
          { q: 'Three sides and two included angles means:', a: 'e.g. AB, BC, CD with ∠B and ∠C', w: ['e.g. AB, CD, DA with ∠A and ∠C', 'four sides and one angle', 'two diagonals and one angle'], h: ['"Included" angles lie between the given sides.'], s: ['∠B is between AB and BC; ∠C is between BC and CD.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.quad.special', title: 'Constructing special quadrilaterals', prereqs: ['ts8.m.quad.construct'],
      intro: [
        h('Special shapes need fewer measurements'),
        p('A general quadrilateral needs five measurements. But a rhombus already "knows" that all its sides are equal and its diagonals cross at right angles. Those built-in properties stand in for missing measurements, so special quadrilaterals need fewer.'),
        keys('Square: 1 measurement (a side, or a diagonal).', 'Rectangle: 2 (length and breadth).', 'Rhombus: 2 (both diagonals, or a side and a diagonal).', 'Parallelogram: 3 (two adjacent sides and the angle between them).'),
        h('Rhombus from its diagonals'),
        stepsB('Draw diagonal AC.', 'Draw its perpendicular bisector; it meets AC at O.', 'Mark B and D on the bisector at half the other diagonal from O.', 'Join A, B, C, D.'),
        p('The diagonals cut the rhombus into four right triangles with legs d₁/2 and d₂/2. By Pythagoras, each side is the hypotenuse.'),
        f('side of rhombus = √((d₁/2)² + (d₂/2)²)', 'side equals root of half d1 squared plus half d2 squared'),
        X({
          title: 'What if? Rhombus side from diagonals', formula: 's = √((d₁/2)² + (d₂/2)²)',
          result: ['s', 'Side', 'sqrt((p/2)^2 + (q/2)^2)', 'cm', 2],
          vars: [['p', 'Diagonal d₁', 2, 30, 1, 6, 'cm'], ['q', 'Diagonal d₂', 2, 30, 1, 8, 'cm']],
          notes: [['p', 'Stretching one diagonal pulls the vertices apart, so each side gets longer.', 'Shrinking a diagonal flattens the rhombus and the sides get shorter.']],
          mistakes: [['Using the full diagonals: √(d₁² + d₂²)', 'The diagonals BISECT each other — the right triangle has legs d₁/2 and d₂/2.']],
          real: 'A rhombus-shaped kolam tile with diagonals 6 cm and 8 cm has sides of exactly 5 cm.',
        }),
        remember('Diagonals of a rhombus are perpendicular bisectors of each other; diagonals of a rectangle are equal.'),
      ],
      examples: [
        ex('A rhombus has diagonals 10 cm and 24 cm. Find its side.', ['Half-diagonals: 5 and 12', 'Side = √(25 + 144) = √169 = 13'], '13 cm'),
        ex('What is the least information needed to construct a rectangle?', ['All angles are already 90°.', 'Opposite sides are equal.', 'So length and breadth are enough.'], '2 measurements: length and breadth'),
      ],
      practice: [
        tp('rh-side', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [4.5, 6, 7.5]] as [number, number, number][]);
          return typed(`The diagonals of a rhombus are ${2 * a} cm and ${2 * b} cm. Find the length of its side.`, num(c, 'cm'),
            ['The diagonals bisect each other at right angles.', `Use the half-diagonals ${a} and ${b} as legs of a right triangle.`],
            [`Side = √(${a}² + ${b}²) = √${a * a + b * b} = ${c} cm`],
            [[String(rd(Math.sqrt(4 * a * a + 4 * b * b), 2)), 'Use HALF of each diagonal, not the whole diagonal.']]);
        }),
        tp('rh-diag', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]] as [number, number, number][]);
          return typed(`A rhombus has side ${c} cm and one diagonal ${2 * a} cm. Find the other diagonal.`, num(2 * b, 'cm'),
            [`Half of the known diagonal is ${a}.`, `Half of the other diagonal = √(${c}² − ${a}²).`],
            [`√(${c * c} − ${a * a}) = ${b}`, `Other diagonal = 2 × ${b} = ${2 * b} cm`],
            [[String(b), 'That is HALF the diagonal. Double it.']]);
        }),
        tp('min-meas', (r) => {
          const pairs: [string, number][] = [['square', 1], ['rectangle', 2], ['rhombus', 2], ['parallelogram', 3], ['general quadrilateral', 5]];
          const [shape, n] = r.pick(pairs);
          return typed(`What is the least number of measurements needed to construct a unique ${shape}?`, num(n),
            ['Use the built-in properties of the shape.', 'Each property you already know replaces a measurement.'],
            [`${shape}: ${n} measurement${n > 1 ? 's' : ''}`]);
        }),
        orderT('rh-steps', 'Order the steps to construct a rhombus ABCD given diagonals AC and BD.', [
          'Draw diagonal AC',
          'Draw the perpendicular bisector of AC, meeting it at O',
          'Mark B and D on the bisector so that OB = OD = half of BD',
          'Join AB, BC, CD and DA',
        ], ['The second diagonal must cross the first at its midpoint at 90°.']),
        bank('special', [
          { q: 'Which measurements are enough to construct a square?', a: 'Only the length of one side', w: ['Two sides and an angle', 'Four sides', 'A side and a diagonal and an angle'], h: ['All sides equal, all angles 90°.'], s: ['One side fixes a square.'] },
          { q: 'The diagonals of a rectangle are:', a: 'equal and bisect each other', w: ['perpendicular always', 'unequal', 'parallel'], h: ['Only a square has perpendicular equal diagonals.'], s: ['Rectangle diagonals are equal and bisect each other.'] },
          { q: 'To construct a parallelogram you need:', a: 'two adjacent sides and the included angle', w: ['only one side', 'one diagonal only', 'four angles only'], h: ['Opposite sides are equal and parallel.'], s: ['Two adjacent sides and the angle between them fix it (3 measurements).'] },
          { q: 'A rhombus with equal diagonals is a:', a: 'square', w: ['rectangle that is not a square', 'kite that is not a rhombus', 'trapezium'], h: ['Equal sides + equal diagonals.'], s: ['Equal sides and equal diagonals → all angles 90° → square.'] },
          { q: 'In a rhombus with diagonals 16 cm and 12 cm, the side is:', a: '10 cm', w: ['14 cm', '20 cm', '28 cm'], h: ['Half-diagonals 8 and 6.'], s: ['√(64 + 36) = 10 cm.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 4 EXPONENTS AND POWERS
/** digits for a 2-significant-figure number written in full: (47, 6) → 47,00,000; (47, −3) → 0.0047 */
const sfFull = (d2: number, n: number) => {
  const ds = String(d2); // two digits, e.g. "47"
  if (n >= 1) return Number(ds + '0'.repeat(n - 1)).toLocaleString('en-IN');
  return '0.' + '0'.repeat(-n - 1) + ds;
};
const ch4: USpec = {
  id: 'ts8.m.ch4', subject: 'math', title: 'Exponents and Powers', source: src(4),
  objectives: [
    {
      id: 'ts8.m.exp.negative', title: 'Powers with negative exponents',
      intro: [
        h('What could 2⁻³ possibly mean?'),
        p('Look at this pattern: 2³ = 8, 2² = 4, 2¹ = 2, 2⁰ = 1. Each step to the right DIVIDES by 2. Keep going: 2⁻¹ = 1/2, 2⁻² = 1/4, 2⁻³ = 1/8. A negative exponent simply means "divide by the base that many times".'),
        def('Negative exponent', 'For any non-zero number a and positive integer n, a⁻ⁿ = 1/aⁿ. So a⁻ⁿ is the reciprocal of aⁿ.'),
        def('Zero exponent', 'a⁰ = 1 for any non-zero a.'),
        f('a⁻ⁿ = 1/aⁿ   and   (p/q)⁻ⁿ = (q/p)ⁿ', 'a to the minus n equals 1 over a to the n'),
        X({
          title: 'What if? Negative exponents', formula: 'a⁻ⁿ = 1/aⁿ',
          result: ['v', 'Value of a⁻ⁿ', '1/a^n', '', 5],
          vars: [['a', 'Base a', 1, 10, 1, 2], ['n', 'Exponent n (we compute a to the minus n)', 0, 6, 1, 3]],
          notes: [['n', 'Each extra step divides again by a, so the value gets smaller and smaller (for a > 1).', 'Fewer divisions leave a bigger value; at n = 0 the value is 1.']],
          mistakes: [['Thinking 2⁻³ = −8', 'A negative exponent does NOT make the number negative. 2⁻³ = 1/8, a small positive number.'], ['Thinking 2⁻³ = −6', 'Exponents are repeated multiplication, not multiplication by the exponent.']],
          real: 'A virus is about 10⁻⁷ m across: that means 1/10,000,000 of a metre.',
        }),
        keys('a⁻ⁿ = 1/aⁿ and 1/a⁻ⁿ = aⁿ.', 'a⁰ = 1 (a ≠ 0).', '(p/q)⁻ⁿ = (q/p)ⁿ: flip, then make the exponent positive.'),
        remember('A negative exponent changes position (numerator ↔ denominator), not sign.'),
      ],
      examples: [
        ex('Find the value of 5⁻².', ['5⁻² = 1/5²', '= 1/25'], '1/25'),
        ex('Find (2/3)⁻³.', ['Flip the fraction: (3/2)³', '= 27/8'], '27/8'),
        ex('Simplify 2⁻¹ + 3⁻¹.', ['= 1/2 + 1/3', '= 3/6 + 2/6 = 5/6'], '5/6'),
      ],
      practice: [
        tp('basic', (r) => {
          const a = r.int(2, 10), n = r.int(1, a <= 3 ? 5 : a <= 6 ? 3 : 2);
          return typed(`Find the value of ${pw(a, -n)}. Give your answer as a fraction.`, frac(1, a ** n),
            [`${pw(a, -n)} = 1/${pw(a, n)}.`, `Work out ${pw(a, n)}.`],
            [`${pw(a, -n)} = 1/${pw(a, n)} = 1/${a ** n}`],
            [[`-${a ** n}`, 'A negative exponent means a reciprocal, not a negative number.'], [`-${a * n}`, 'Exponents are not multiplication by the exponent.']]);
        }),
        tp('fraction', (r) => {
          const pp = r.int(1, 5); let q = r.int(2, 7); if (q === pp) q += 1;
          const n = r.int(1, 3);
          return typed(`Find the value of (${pp}/${q})${sup(-n)}.`, frac(q ** n, pp ** n),
            ['Flip the fraction and make the exponent positive.', `(${q}/${pp})${sup(n)}`],
            [`(${pp}/${q})${sup(-n)} = (${q}/${pp})${sup(n)} = ${q ** n}/${pp ** n}`],
            [[`${pp ** n}/${q ** n}`, 'You forgot to flip the fraction for the negative exponent.']]);
        }),
        tp('sum', (r) => {
          const a = r.int(2, 6); let b = r.int(2, 8); if (b === a) b += 1;
          const op = r.pick(['+', '−']);
          const n = op === '+' ? a + b : b - a;
          return typed(`Simplify ${a}⁻¹ ${op} ${b}⁻¹.`, frac(n, a * b),
            [`${a}⁻¹ = 1/${a} and ${b}⁻¹ = 1/${b}.`, 'Use a common denominator.'],
            [`1/${a} ${op} 1/${b} = ${b}/${a * b} ${op} ${a}/${a * b} = ${fx(n, a * b)}`],
            op === '+' ? [[`1/${a + b}`, `${a}⁻¹ + ${b}⁻¹ is not (${a} + ${b})⁻¹. Change each to a fraction first.`]] : []);
        }, 2),
        tp('zero', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 3);
          return typed(`Find the value of ${a}⁰ + ${b}⁰ − ${pw(c, 0)} × ${b}⁰ + ${pw(2, -1)} × 2.`, num(2),
            ['Any non-zero number to the power 0 is 1.', '2⁻¹ × 2 = 1/2 × 2.'],
            [`= 1 + 1 − 1 × 1 + 1/2 × 2`, '= 1 + 1 − 1 + 1 = 2'],
            [['0', 'a⁰ is 1, not 0.']]);
        }),
        bank('neg-facts', [
          { q: '10⁻³ equals:', a: '0.001', w: ['−1000', '−30', '0.0001'], h: ['1/10³'], s: ['1/1000 = 0.001.'] },
          { q: 'Which is equal to 1/49?', a: '7⁻²', w: ['−7²', '49⁻²', '7⁻⁷'], h: ['49 = 7²'], s: ['1/7² = 7⁻².'] },
          { q: '(−2)⁻³ equals:', a: '−1/8', w: ['1/8', '−8', '8'], h: ['1/(−2)³'], s: ['(−2)³ = −8, so the reciprocal is −1/8.'] },
          { q: '1/3⁻⁴ equals:', a: '81', w: ['1/81', '−81', '−12'], h: ['A negative exponent in the denominator moves up.'], s: ['1/3⁻⁴ = 3⁴ = 81.'] },
          { q: 'Which is the largest?', a: '2⁰', w: ['2⁻¹', '2⁻²', '2⁻³'], h: ['Values: 1, 1/2, 1/4, 1/8.'], s: ['2⁰ = 1 is the largest.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.exp.laws', title: 'Laws of exponents', prereqs: ['ts8.m.exp.negative'],
      intro: [
        h('Shortcuts that save hours'),
        p('3⁴ × 3⁵ means (3 × 3 × 3 × 3) × (3 × 3 × 3 × 3 × 3) — nine 3s multiplied, so 3⁹. Instead of writing it all out, just add the exponents. These laws work for negative exponents too.'),
        f('aᵐ × aⁿ = aᵐ⁺ⁿ', 'a to the m times a to the n equals a to the m plus n'),
        X({
          title: 'What if? Product law', formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
          result: ['P', 'aᵐ × aⁿ', 'a^(m + n)', '', 4],
          vars: [['a', 'Base a', 1, 5, 1, 2], ['m', 'Exponent m', -4, 5, 1, 3], ['n', 'Exponent n', -4, 5, 1, 2]],
          notes: [['n', 'One more factor of a multiplies the result by a.', 'One less factor divides the result by a.']],
          mistakes: [['Multiplying the exponents: 2³ × 2² = 2⁶', 'Count the factors: three 2s and two 2s make five 2s: 2⁵.'], ['Multiplying the bases: 2³ × 2² = 4⁵', 'The base stays the same; only the exponents add.']],
          real: 'A cell that doubles every hour: after 3 hours then 2 more hours it has grown 2³ × 2² = 2⁵ = 32 times.',
        }),
        keys('aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', '(aᵐ)ⁿ = aᵐⁿ', 'aᵐ × bᵐ = (ab)ᵐ', 'aᵐ ÷ bᵐ = (a/b)ᵐ', 'a⁰ = 1'),
        f('(aᵐ)ⁿ = aᵐⁿ', 'a to the m, all to the n, equals a to the m n'),
        X({
          title: 'What if? Power of a power', formula: '(aᵐ)ⁿ = aᵐⁿ',
          result: ['P', '(aᵐ)ⁿ', 'a^(m*n)', '', 4],
          vars: [['a', 'Base a', 1, 3, 1, 2], ['m', 'Inner exponent m', -3, 4, 1, 2], ['n', 'Outer exponent n', 0, 4, 1, 3]],
          notes: [['n', 'One more copy of aᵐ multiplies in m more factors of a.', 'One fewer copy removes m factors of a.']],
          mistakes: [['(2³)² = 2⁵', 'You have two lots of 2³, i.e. 2³ × 2³ = 2⁶: multiply the exponents.']],
          real: 'A square plot of side 10² m has area (10²)² = 10⁴ m².',
        }),
        remember('The laws need the SAME base (for × and ÷) or the SAME exponent (for (ab)ᵐ). 2³ × 3² has no shortcut.'),
        tip('To solve 2ˣ = 32, write 32 as a power of 2: 2⁵. Same base → exponents equal → x = 5.'),
      ],
      examples: [
        ex('Simplify 5⁻³ × 5⁷.', ['Same base: add exponents.', '−3 + 7 = 4', '5⁴ = 625'], '625'),
        ex('Simplify (3²)³ ÷ 3⁴.', ['(3²)³ = 3⁶', '3⁶ ÷ 3⁴ = 3²', '= 9'], '9'),
        ex('Find x if 2ˣ × 2³ = 2⁻².', ['x + 3 = −2', 'x = −5'], 'x = −5'),
      ],
      practice: [
        tp('product', (r) => {
          const a = r.int(2, 9), m = r.int(-6, 8), n = r.int(-6, 8);
          return typed(`Write ${pw(a, m)} × ${pw(a, n)} as a single power of ${a}. What is the exponent?`, num(m + n),
            ['Same base, multiplying → add the exponents.', `${n_(m)} + ${pn(n)}`],
            [`${pw(a, m)} × ${pw(a, n)} = ${pw(a, m + n)}`],
            m * n !== m + n ? [[String(m * n), 'Multiply exponents only for a power of a power. Here ADD them.']] : []);
        }),
        tp('quotient', (r) => {
          const a = r.int(2, 9), m = r.int(-5, 9), n = r.int(-5, 9);
          return typed(`Write ${pw(a, m)} ÷ ${pw(a, n)} as a single power of ${a}. What is the exponent?`, num(m - n),
            ['Same base, dividing → subtract the exponents.', `${n_(m)} − ${pn(n)}`],
            [`${pw(a, m)} ÷ ${pw(a, n)} = ${pw(a, m - n)}`],
            n !== 0 ? [[String(m + n), 'For division SUBTRACT the exponents.']] : []);
        }),
        tp('power', (r) => {
          const a = r.int(2, 9), m = r.int(-4, 6) || 2, n = r.int(3, 5);
          return typed(`Write (${pw(a, m)})${sup(n)} as a single power of ${a}. What is the exponent?`, num(m * n),
            ['A power of a power → multiply the exponents.'],
            [`(${pw(a, m)})${sup(n)} = ${pw(a, m * n)}`],
            [[String(m + n), 'Adding is for multiplying powers. A power of a power multiplies the exponents.']]);
        }),
        tp('evaluate', (r) => {
          const a = r.pick([2, 3, 5, 10]), k = r.int(0, a === 2 ? 6 : a === 10 ? 4 : 3);
          const m = r.int(-5, 7), n = k - m;
          return typed(`Evaluate ${pw(a, m)} × ${pw(a, n)}.`, num(a ** k),
            ['Add the exponents first.', `${pw(a, k)} = ?`],
            [`${pw(a, m)} × ${pw(a, n)} = ${pw(a, k)} = ${a ** k}`]);
        }),
        tp('solve-x', (r) => {
          const a = r.pick([2, 3, 5]), m = r.int(-4, 6), x = r.int(-6, 6) || 1, k = m + x;
          return typed(`Find x if ${pw(a, m)} × ${a}ˣ = ${pw(a, k)}.`, num(x),
            ['Same base: the exponents must add up.', `${n_(m)} + x = ${n_(k)}`],
            [`${n_(m)} + x = ${n_(k)}`, `x = ${n_(x)}`]);
        }, 2),
        matchT('laws', 'Match each expression with its simplified form', [
          ['2⁵ × 2³', '2⁸'], ['2⁵ ÷ 2³', '2²'], ['(2⁵)³', '2¹⁵'], ['2³ × 5³', '10³'], ['7⁰', '1'], ['(1/2)⁻²', '4'], ['3⁻² × 3³', '3'],
        ], ['× same base → add; ÷ → subtract; power of power → multiply.']),
      ],
    },
    {
      id: 'ts8.m.exp.standard', title: 'Expressing numbers in standard form', prereqs: ['ts8.m.exp.laws'],
      intro: [
        h('Huge and tiny numbers, written neatly'),
        p('The Sun is about 150,000,000,000 m from the Earth. A red blood cell is about 0.000007 m wide. Counting zeros is slow and error-prone, so scientists use standard form.'),
        def('Standard form (scientific notation)', 'A number written as k × 10ⁿ, where 1 ≤ k < 10 and n is an integer. 150,000,000,000 = 1.5 × 10¹¹; 0.000007 = 7 × 10⁻⁶.'),
        stepsB('Put the decimal point after the first non-zero digit to get k.', 'Count how many places the point moved.', 'Moved LEFT (big number) → n is positive. Moved RIGHT (small number) → n is negative.'),
        f('N = k × 10ⁿ, 1 ≤ k < 10', 'N equals k times 10 to the n'),
        X({
          title: 'What if? Standard form', formula: 'N = k × 10ⁿ',
          result: ['N', 'The number', 'k*10^n', '', 6],
          vars: [['k', 'k (between 1 and 10)', 1, 9.9, 0.1, 3.5], ['n', 'Power of ten n', -6, 9, 1, 4]],
          notes: [['n', 'Each step up in n moves the decimal point one place right — the number becomes 10 times bigger.', 'Each step down moves the point one place left — 10 times smaller.']],
          mistakes: [['Writing 45 × 10³ as standard form', 'k must be between 1 and 10: 45 × 10³ = 4.5 × 10⁴.'], ['Giving small numbers a positive exponent', 'Numbers less than 1 have negative n: 0.003 = 3 × 10⁻³.']],
          real: 'Mass of the Earth ≈ 5.97 × 10²⁴ kg — far easier to read than 25 digits.',
        }),
        keys('1 ≤ k < 10.', 'Big numbers: positive n. Numbers between 0 and 1: negative n.', 'To compare, look at n first, then k.'),
        remember('Multiplying numbers in standard form: multiply the k parts and add the powers of 10, then readjust k.'),
      ],
      examples: [
        ex('Write 3,84,000,000 m (distance to the Moon) in standard form.', ['Point after the first digit: 3.84', 'It moved 8 places left.', '3.84 × 10⁸'], '3.84 × 10⁸ m'),
        ex('Write 0.00056 in standard form.', ['5.6', 'The point moved 4 places right.', '5.6 × 10⁻⁴'], '5.6 × 10⁻⁴'),
        ex('Write 2.07 × 10⁵ in usual form.', ['Move the point 5 places right.', '207000'], '2,07,000'),
      ],
      practice: [
        tp('big', (r) => {
          const d2 = r.int(11, 99), n = r.int(3, 10);
          const full = sfFull(d2, n);
          return typed(`Write ${full} in standard form k × 10ⁿ. What is n?`, num(n),
            ['Place the decimal point after the first digit.', 'Count how many places it moves.'],
            [`${full} = ${d2 / 10} × 10${sup(n)}`, `n = ${n}`],
            [[String(n - 1), 'Count again — k must be between 1 and 10.'], [String(-n), 'A large number has a POSITIVE exponent.']]);
        }),
        tp('small', (r) => {
          const d2 = r.int(11, 99), n = -r.int(2, 8);
          const full = sfFull(d2, n);
          return typed(`Write ${full} in standard form k × 10ⁿ. What is n?`, num(n),
            ['Move the point to just after the first non-zero digit.', 'Moving right gives a negative exponent.'],
            [`${full} = ${d2 / 10} × 10${sup(n)}`, `n = ${n_(n)}`],
            [[String(-n), 'Numbers less than 1 have a NEGATIVE exponent.']]);
        }),
        tp('usual', (r) => {
          const k = r.int(101, 999) / 100, n = r.int(2, 6);
          const v = Math.round(k * 10 ** n);
          return typed(`Write ${k} × 10${sup(n)} in usual form.`, num(v),
            [`Move the decimal point ${n} places to the right.`, 'Fill empty places with zeros.'],
            [`${k} × 10${sup(n)} = ${v}`]);
        }),
        tp('pick', (r) => {
          const d2 = r.int(11, 99), n = r.pick([-6, -5, -4, -3, 4, 5, 6, 7, 8]);
          const k = d2 / 10;
          const full = sfFull(d2, n);
          return mcq(r, `Which is ${full} in standard form?`, `${k} × 10${sup(n)}`, [`${d2} × 10${sup(n - 1)}`, `${k} × 10${sup(-n)}`, `${k} × 10${sup(n + 1)}`],
            ['k must satisfy 1 ≤ k < 10.', n > 0 ? 'Large number → positive n.' : 'Small number → negative n.'],
            [`${full} = ${k} × 10${sup(n)}`]);
        }),
        bank('compare', [
          { q: 'Which is larger: 3.2 × 10⁵ or 9.8 × 10⁴?', a: '3.2 × 10⁵', w: ['9.8 × 10⁴', 'They are equal', 'Cannot tell'], h: ['Compare the powers of 10 first.'], s: ['10⁵ beats 10⁴: 320000 > 98000.'] },
          { q: '(2 × 10³) × (4 × 10⁵) equals:', a: '8 × 10⁸', w: ['8 × 10¹⁵', '6 × 10⁸', '8 × 10²'], h: ['Multiply k parts, add exponents.'], s: ['2 × 4 = 8, 10³ × 10⁵ = 10⁸.'] },
          { q: '(6 × 10⁷) ÷ (3 × 10²) equals:', a: '2 × 10⁵', w: ['2 × 10⁹', '3 × 10⁵', '2 × 10¹⁴'], h: ['Divide k parts, subtract exponents.'], s: ['6 ÷ 3 = 2, 10⁷⁻² = 10⁵.'] },
          { q: 'Which is NOT in standard form?', a: '12.5 × 10⁴', w: ['1.25 × 10⁵', '9 × 10⁻²', '1 × 10⁶'], h: ['1 ≤ k < 10'], s: ['12.5 is not less than 10.'] },
          { q: '1 micron = 10⁻⁶ m. How many microns in 1 mm (10⁻³ m)?', a: '1000', w: ['0.001', '100', '10⁻⁹'], h: ['10⁻³ ÷ 10⁻⁶'], s: ['10⁻³⁻⁽⁻⁶⁾ = 10³ = 1000.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 5 COMPARING QUANTITIES
const ch5: USpec = {
  id: 'ts8.m.ch5', subject: 'math', title: 'Comparing Quantities using Proportion', source: src(5),
  objectives: [
    {
      id: 'ts8.m.cq.discount', title: 'Ratios, percentages, discounts and estimation',
      intro: [
        h('"Flat 20% off!" — what does it really mean?'),
        p('A percentage is a ratio with 100 as the second term: 20% = 20/100 = 1/5. Shops at Dussehra announce discounts as percentages of the marked price, so you need percentages to know what you will actually pay.'),
        def('Marked price (MP)', 'The price printed on the tag.'),
        def('Discount', 'The reduction given on the marked price. Selling price = MP − discount.'),
        f('Discount = MP × d/100;  SP = MP × (100 − d)/100', 'discount equals marked price times d over 100'),
        X({
          title: 'What if? Price after discount', formula: 'SP = MP × (100 − d)/100',
          result: ['SP', 'Selling price', 'M*(100 - d)/100', '₹', 2],
          vars: [['M', 'Marked price', 100, 5000, 50, 1200, '₹'], ['d', 'Discount %', 0, 60, 5, 20, '%']],
          notes: [['d', 'A bigger discount takes away a larger share of the marked price, so you pay less.', 'A smaller discount leaves more to pay.']],
          mistakes: [['Subtracting the percentage number itself: ₹1200 − 20 = ₹1180', 'Find 20% OF ₹1200 (₹240) and subtract that.'], ['Two discounts of 10% = 20% off', '10% then 10% more is 19% off, because the second 10% is taken from a smaller price.']],
          real: 'A ₹1200 school bag at 20% off costs ₹960.',
        }),
        p('Discount percentage is always worked out on the MARKED price: d% = discount/MP × 100.'),
        h('Estimating percentages'),
        p('To estimate a 15% tip on ₹397: round to ₹400; 10% is ₹40, 5% is ₹20, so 15% ≈ ₹60. Estimation helps you check bills quickly.'),
        keys('x% of y = x × y/100.', 'Ratio a : b as a percentage of b: a/b × 100.', 'Discount % is on the marked price.'),
        remember('10% of a number: move the decimal point one place left. 5% is half of 10%; 1% is a tenth of 10%.'),
      ],
      examples: [
        ex('A cycle marked ₹3,500 is sold at 12% discount. Find the selling price.', ['Discount = 12% of 3500 = ₹420', 'SP = 3500 − 420 = ₹3,080'], '₹3,080'),
        ex('A saree marked ₹2,000 is sold for ₹1,700. Find the discount percentage.', ['Discount = ₹300', '300/2000 × 100 = 15%'], '15%'),
        ex('Out of 40 students, 18 are girls. What percentage are girls?', ['18/40 × 100', '= 45%'], '45%'),
      ],
      practice: [
        tp('disc-amt', (r) => {
          const M = r.int(5, 150) * 20, d = r.pick([5, 10, 15, 20, 25, 30, 40]);
          return typed(`An item marked ${inr(M)} is sold at a discount of ${d}%. How much is the discount (in ₹)?`, num(M * d / 100, '₹'),
            [`Discount = ${d}% of ${M}.`, `= ${M} × ${d}/100`],
            [`${M} × ${d}/100 = ${inr(M * d / 100)}`],
            [[String(M - M * d / 100), 'That is the selling price. The question asks for the discount.']]);
        }),
        tp('sp', (r) => {
          const M = r.int(5, 150) * 20, d = r.pick([5, 10, 15, 20, 25, 30, 35]);
          const it = r.pick(['pair of shoes', 'school bag', 'wrist watch', 'cricket bat', 'pressure cooker']);
          return typed(`A ${it} is marked ${inr(M)}. The shop gives ${d}% off. What is the selling price (in ₹)?`, num(M - M * d / 100, '₹'),
            [`Find ${d}% of ${M}, then subtract.`, `Or SP = ${M} × ${100 - d}/100.`],
            [`Discount = ${inr(M * d / 100)}`, `SP = ${M} − ${M * d / 100} = ${inr(M - M * d / 100)}`],
            [[String(M * d / 100), 'That is the discount; subtract it from the marked price.'], [String(M - d), 'Subtract d% OF the price, not d rupees.']]);
        }),
        tp('disc-pc', (r) => {
          const M = r.int(5, 100) * 20, d = r.pick([5, 10, 15, 20, 25, 30, 40, 50]);
          const S = M - M * d / 100;
          return typed(`An item marked ${inr(M)} is sold for ${inr(S)}. What is the discount percentage?`, num(d),
            ['Discount = MP − SP.', 'Divide by the MARKED price and multiply by 100.'],
            [`Discount = ${M} − ${S} = ${M - S}`, `${M - S}/${M} × 100 = ${d}%`],
            [[String(rd((M - S) / S * 100, 2)), 'Discount % is on the marked price, not the selling price.']]);
        }),
        tp('ratio-pc', (r) => {
          const b = r.pick([4, 5, 8, 20, 25, 40, 50]), a = r.int(1, b - 1);
          const what = r.pick(['students in a class passed a test', 'mango trees in an orchard are flowering', 'seats in a bus are occupied']);
          return typed(`${a} out of ${b} ${what}. What percentage is this?`, num(rd(a / b * 100, 2)),
            ['Percentage = part/whole × 100.'], [`${a}/${b} × 100 = ${rd(a / b * 100, 2)}%`]);
        }),
        bank('estimate', [
          { q: 'Estimate 15% of ₹398.', a: 'about ₹60', w: ['about ₹15', 'about ₹6', 'about ₹150'], h: ['Round to ₹400: 10% = 40, 5% = 20.'], s: ['15% of 400 = 60.'] },
          { q: 'A ₹1,000 item gets 10% off, then 10% off the new price. Final price?', a: '₹810', w: ['₹800', '₹900', '₹820'], h: ['1000 → 900 → ?'], s: ['10% of 900 = 90, so 900 − 90 = ₹810.'] },
          { q: 'Ratio 3 : 5 as a percentage (3 out of 5) is:', a: '60%', w: ['35%', '30%', '53%'], h: ['3/5 × 100'], s: ['3/5 = 0.6 = 60%.'] },
          { q: 'Estimate 49% of 802.', a: 'about 400', w: ['about 49', 'about 800', 'about 200'], h: ['49% ≈ half'], s: ['Half of 800 ≈ 400.'] },
          { q: 'Discount percentage is calculated on the:', a: 'marked price', w: ['selling price', 'cost price', 'profit'], h: ['The tag price.'], s: ['d% = discount/MP × 100.'] },
          { q: '25% of a number is 40. The number is:', a: '160', w: ['10', '100', '65'], h: ['25% = 1/4'], s: ['40 × 4 = 160.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.cq.profit', title: 'Profit and loss', prereqs: ['ts8.m.cq.discount'],
      intro: [
        h('Buying low, selling high'),
        p('A fruit seller in Kothapet buys mangoes from the market and sells them in her shop. If she sells for more than she paid, she makes a profit; if less, a loss.'),
        def('Cost price (CP)', 'The total amount paid to get the item, INCLUDING overhead expenses such as transport or repairs.'),
        def('Selling price (SP)', 'The amount for which the item is sold.'),
        keys('Profit = SP − CP (when SP > CP).', 'Loss = CP − SP (when CP > SP).', 'Profit % and loss % are always on the COST price.'),
        f('Profit % = (Profit / CP) × 100', 'profit percent equals profit over cost price times 100'),
        X({
          title: 'What if? Profit percentage', formula: 'Profit % = (SP − CP)/CP × 100',
          result: ['P', 'Profit %', '(S - C)/C*100', '%', 2],
          vars: [['C', 'Cost price', 100, 2000, 10, 500, '₹'], ['S', 'Selling price', 100, 3000, 10, 600, '₹']],
          notes: [
            ['S', 'Selling for more widens the gap, so the profit % rises.', 'Selling for less narrows the gap; below CP the "profit" becomes negative — a loss.'],
            ['C', 'Paying more for the same item squeezes the profit.', 'Buying cheaper raises the profit %.'],
          ],
          mistakes: [['Dividing by the selling price', 'Profit % compares the profit with what you SPENT, the cost price.'], ['Forgetting overhead expenses', 'Transport, repairs and packing are part of the cost price.']],
          real: 'Buy a phone cover for ₹500, sell for ₹600: profit ₹100, which is 20% of the cost.',
        }),
        f('SP = CP × (100 + profit %)/100;   SP = CP × (100 − loss %)/100', 'selling price from cost price'),
        X({
          title: 'What if? Selling price for a target profit', formula: 'SP = CP × (100 + p)/100',
          result: ['SP', 'Selling price', 'C*(100 + p)/100', '₹', 2],
          vars: [['C', 'Cost price', 100, 5000, 50, 800, '₹'], ['p', 'Profit % (negative = loss)', -50, 100, 5, 25, '%']],
          notes: [['p', 'A higher target profit adds a bigger slice of the cost.', 'A negative p means selling at a loss.']],
          mistakes: [['Adding p rupees instead of p percent', '25% profit on ₹800 is ₹200, not ₹25.']],
          real: 'A shopkeeper wanting 25% profit on an ₹800 fan must sell it for ₹1,000.',
        }),
        remember('Gain or loss % is never calculated on the selling price.'),
      ],
      examples: [
        ex('Bought for ₹640, sold for ₹720. Find the profit %.', ['Profit = ₹80', '80/640 × 100 = 12.5%'], '12.5%'),
        ex('Gopi buys an old scooter for ₹18,000 and spends ₹2,000 on repairs. He sells it for ₹19,000. Profit or loss %?', ['CP = 18000 + 2000 = ₹20,000', 'Loss = ₹1,000', '1000/20000 × 100 = 5%'], '5% loss'),
        ex('By selling at ₹1,150, a trader gains 15%. Find the CP.', ['SP = CP × 115/100', 'CP = 1150 × 100/115 = ₹1,000'], '₹1,000'),
      ],
      practice: [
        tp('profit-pc', (r) => {
          const C = r.int(2, 60) * 50, p0 = r.pick([4, 6, 8, 10, 12, 14, 16, 20, 24, 30]);
          const S = C + C * p0 / 100;
          return typed(`A shopkeeper buys a fan for ${inr(C)} and sells it for ${inr(S)}. Find the profit percentage.`, num(p0),
            ['Profit = SP − CP.', 'Profit % = profit/CP × 100.'],
            [`Profit = ${S} − ${C} = ${S - C}`, `${S - C}/${C} × 100 = ${p0}%`],
            [[String(rd((S - C) / S * 100, 2)), 'Divide by the COST price, not the selling price.']]);
        }),
        tp('loss-pc', (r) => {
          const C = r.int(2, 60) * 50, p0 = r.pick([4, 6, 8, 10, 12, 14, 16, 20, 24, 30]);
          const S = C - C * p0 / 100;
          return typed(`A bicycle bought for ${inr(C)} is sold for ${inr(S)}. Find the loss percentage.`, num(p0),
            ['Loss = CP − SP.', 'Loss % = loss/CP × 100.'],
            [`Loss = ${C} − ${S} = ${C - S}`, `${C - S}/${C} × 100 = ${p0}%`]);
        }),
        tp('find-sp', (r) => {
          const C = r.int(2, 60) * 50, p0 = r.pick([4, 6, 8, 10, 12, 14, 16, 20, 24, 30]), gain = r.int(0, 1) === 1;
          const S = gain ? C + C * p0 / 100 : C - C * p0 / 100;
          return typed(`An article costing ${inr(C)} is sold at a ${gain ? 'profit' : 'loss'} of ${p0}%. Find the selling price (in ₹).`, num(S, '₹'),
            [`${p0}% of ${C} = ${C * p0 / 100}.`, gain ? 'Add it to the CP.' : 'Subtract it from the CP.'],
            [`SP = ${C} ${gain ? '+' : '−'} ${C * p0 / 100} = ${inr(S)}`],
            [[String(gain ? C - C * p0 / 100 : C + C * p0 / 100), gain ? 'Profit means SP is MORE than CP.' : 'Loss means SP is LESS than CP.']]);
        }),
        tp('find-cp', (r) => {
          const C = r.int(2, 40) * 100, p0 = r.pick([5, 10, 15, 20, 25, 40]);
          const S = C + C * p0 / 100;
          return typed(`By selling a table for ${inr(S)}, a carpenter gains ${p0}%. Find the cost price (in ₹).`, num(C, '₹'),
            [`SP = CP × ${100 + p0}/100.`, `So CP = SP × 100/${100 + p0}.`],
            [`CP = ${S} × 100/${100 + p0} = ${inr(C)}`],
            [[String(S - S * p0 / 100), `The ${p0}% is on the CP, not the SP — you cannot simply subtract ${p0}% of the SP.`]], { steps: [st('Write SP as a percentage of CP. SP = ?% of CP', num(100 + p0)), st('Find the CP in ₹.', num(C, '₹'))] });
        }, 2),
        tp('overhead', (r) => {
          const price = r.int(10, 80) * 100, ov = r.int(2, 20) * 100;
          const C = price + ov, p0 = r.pick([5, 10, 20, -5, -10]);
          const S = C + C * p0 / 100;
          return typed(`${nm(r)} buys a used motorbike for ${inr(price)} and spends ${inr(ov)} on repairs, then sells it for ${inr(S)}. Find the ${p0 > 0 ? 'profit' : 'loss'} percentage.`, num(Math.abs(p0)),
            ['The repairs are part of the cost price.', `CP = ${price} + ${ov}.`],
            [`CP = ${inr(C)}`, `${p0 > 0 ? 'Profit' : 'Loss'} = ${Math.abs(S - C)}`, `${Math.abs(S - C)}/${C} × 100 = ${Math.abs(p0)}%`]);
        }, 2),
      ],
    },
    {
      id: 'ts8.m.cq.tax', title: 'Sales tax, VAT and GST', prereqs: ['ts8.m.cq.discount'],
      intro: [
        h('Why the bill is more than the price'),
        p('When you buy a ₹1,000 pair of shoes, the bill may say ₹1,120. The extra ₹120 is tax collected by the government to build roads, schools and hospitals.'),
        def('Sales tax / VAT', 'Older taxes charged on the sale of goods, as a percentage of the selling price. VAT (Value Added Tax) was charged on the value added at each stage.'),
        def('GST (Goods and Services Tax)', 'Since July 2017, one tax on goods and services across India. Common slabs have included 5%, 12%, 18% and 28% (rates are revised from time to time). Within a state it is split equally into CGST (central) and SGST (state).'),
        f('Bill amount = Price × (100 + r)/100', 'bill equals price times 100 plus r over 100'),
        X({
          title: 'What if? Adding GST', formula: 'Bill = P × (100 + r)/100',
          result: ['B', 'Bill amount', 'P*(100 + r)/100', '₹', 2],
          vars: [['P', 'Price before tax', 100, 10000, 100, 1000, '₹'], ['r', 'GST rate', 0, 28, 1, 12, '%']],
          notes: [['r', 'A higher tax slab adds a bigger percentage on top of the price.', 'A lower slab adds less.']],
          mistakes: [['Finding the price before tax by subtracting r% of the bill', 'The tax was r% of the PRICE, not of the bill. Divide by (100 + r)/100 instead.'], ['Charging CGST and SGST at the full rate each', 'They are HALF each: 18% GST = 9% CGST + 9% SGST.']],
          real: 'A ₹1,000 item in the 12% slab costs ₹1,120 at the counter.',
        }),
        keys('Tax = rate × price/100.', 'Bill = price + tax.', 'Price before tax = bill × 100/(100 + r).', 'GST = CGST + SGST (equal halves).'),
        remember('Discount is subtracted from the marked price first; tax is then added on the discounted price.'),
      ],
      examples: [
        ex('GST at 18% on a ₹2,500 mixer. Find the bill.', ['Tax = 18% of 2500 = ₹450', 'Bill = ₹2,950'], '₹2,950'),
        ex('A bill of ₹5,600 includes 12% GST. Find the price before tax.', ['Price × 112/100 = 5600', 'Price = 5600 × 100/112 = ₹5,000'], '₹5,000'),
      ],
      practice: [
        tp('gst-amt', (r) => {
          const P = r.int(2, 80) * 100, g = r.pick([5, 12, 18, 28]);
          return typed(`An item costs ${inr(P)} before tax. GST is ${g}%. How much is the GST (in ₹)?`, num(P * g / 100, '₹'),
            [`${g}% of ${P}`], [`${P} × ${g}/100 = ${inr(P * g / 100)}`],
            [[String(P + P * g / 100), 'That is the bill. The question asks for the tax only.']]);
        }),
        tp('bill', (r) => {
          const P = r.int(2, 80) * 100, g = r.pick([5, 12, 18, 28]);
          const it = r.pick(['mobile phone', 'television', 'ceiling fan', 'refrigerator', 'sewing machine']);
          return typed(`A ${it} is priced at ${inr(P)}. GST of ${g}% is added. Find the total bill (in ₹).`, num(P + P * g / 100, '₹'),
            [`Tax = ${g}% of ${P}.`, 'Add the tax to the price.'],
            [`Tax = ${P * g / 100}`, `Bill = ${P} + ${P * g / 100} = ${inr(P + P * g / 100)}`]);
        }),
        tp('before', (r) => {
          const P = r.int(2, 60) * 100, g = r.pick([5, 12, 18, 28]);
          const B = P + P * g / 100;
          return typed(`The bill for a purchase is ${inr(B)}, including ${g}% GST. What was the price before tax (in ₹)?`, num(P, '₹'),
            [`Bill = price × ${100 + g}/100.`, `Price = ${B} × 100/${100 + g}.`],
            [`${B} × 100/${100 + g} = ${inr(P)}`],
            [[String(rd(B - B * g / 100, 2)), `The ${g}% was charged on the price, not on the bill.`]], { steps: [st('The bill is what percentage of the price?', num(100 + g)), st('Price before tax?', num(P, '₹'))] });
        }, 2),
        tp('cgst', (r) => {
          const P = r.int(2, 60) * 100, g = r.pick([12, 18, 28]);
          return typed(`For an item priced ${inr(P)} in the ${g}% GST slab (sold within Telangana), how much is the SGST (in ₹)?`, num(P * g / 200, '₹'),
            [`SGST is half of the GST rate: ${g / 2}%.`], [`SGST = ${g / 2}% of ${P} = ${inr(P * g / 200)}`],
            [[String(P * g / 100), 'That is the full GST. SGST is only half of it.']]);
        }),
        tp('disc-tax', (r) => {
          const M = r.int(2, 30) * 100, d = r.pick([10, 20]), g = r.pick([5, 10]);
          const S = M - M * d / 100, B = rd(S + S * g / 100, 2);
          return typed(`A jacket is marked ${inr(M)}. It is sold at ${d}% discount and then ${g}% sales tax is added on the discounted price. Find the amount paid (in ₹).`, num(B, '₹'),
            ['First take the discount off the marked price.', 'Then add the tax on the discounted price.'],
            [`Discounted price = ${M} − ${M * d / 100} = ${S}`, `Tax = ${g}% of ${S} = ${rd(S * g / 100, 2)}`, `Amount = ₹${B}`]);
        }, 2),
      ],
    },
    {
      id: 'ts8.m.cq.ci', title: 'Compound interest (annual and half-yearly) and its applications', prereqs: ['ts8.m.cq.discount'],
      intro: [
        h('Interest on interest'),
        p('With simple interest you earn the same amount every year. With compound interest, the interest you earned is added to the principal, and next year YOU EARN INTEREST ON THAT INTEREST too. Banks, loans and even population growth work this way.'),
        def('Compound interest (CI)', 'Interest calculated on the principal plus the interest already added. CI = Amount − Principal.'),
        f('A = P(1 + R/100)ⁿ', 'Amount equals P times 1 plus R over 100, to the power n'),
        X({
          title: 'What if? Compound interest', formula: 'A = P(1 + R/100)ⁿ',
          result: ['A', 'Amount', 'P*(1 + R/100)^n', '₹', 2],
          vars: [['P', 'Principal', 1000, 50000, 1000, 10000, '₹'], ['R', 'Rate per year', 1, 20, 1, 10, '%'], ['n', 'Number of years', 0, 10, 1, 2]],
          notes: [['n', 'Each extra year multiplies the amount again by (1 + R/100) — growth speeds up.', 'Fewer years means fewer multiplications.'], ['R', 'A higher rate makes every year\'s multiplier bigger.', 'A lower rate makes the money grow more slowly.']],
          mistakes: [['Using R instead of R/100', 'Rate 10% means the multiplier is 1.10, not 11.'], ['Forgetting to subtract P to get CI', 'A is the total amount; CI = A − P.']],
          real: '₹10,000 at 10% compounded yearly becomes ₹12,100 in 2 years — ₹100 more than simple interest gives.',
        }),
        h('Half-yearly compounding'),
        p('If interest is added every six months, use HALF the rate and TWICE the number of periods: A = P(1 + R/200)²ⁿ.'),
        h('Growth and depreciation'),
        p('Population growing at R% a year: P(1 + R/100)ⁿ. A machine losing value at R% a year (depreciation): P(1 − R/100)ⁿ.'),
        keys('A = P(1 + R/100)ⁿ.', 'CI = A − P.', 'Half-yearly: rate R/2, periods 2n.', 'Depreciation: use (1 − R/100).'),
        remember('For 1 year with yearly compounding, CI = SI. The difference appears from the second year.'),
      ],
      examples: [
        ex('Find the CI on ₹8,000 for 2 years at 5% per annum compounded yearly.', ['A = 8000 × 1.05²', '= 8000 × 1.1025 = ₹8,820', 'CI = 8820 − 8000 = ₹820'], '₹820'),
        ex('Find the amount on ₹10,000 for 1 year at 10% per annum compounded half-yearly.', ['Rate per half-year = 5%, periods = 2', 'A = 10000 × 1.05² = ₹11,025'], '₹11,025'),
        ex('A town of 20,000 grows at 4% per year. Find the population after 2 years.', ['20000 × 1.04² = 20000 × 1.0816', '= 21,632'], '21,632'),
      ],
      practice: [
        tp('amount', (r) => {
          const P = r.int(1, 20) * 1000, R = r.pick([4, 5, 8, 10, 12, 15, 20]), n = r.int(2, 3);
          const A = rd(P * (1 + R / 100) ** n, 2);
          return typed(`Find the amount on ${inr(P)} for ${n} years at ${R}% per annum, compounded annually (in ₹).`, num(A, '₹', false, 0.05),
            [`A = P(1 + R/100)ⁿ = ${P} × ${1 + R / 100}${sup(n)}`, `${1 + R / 100}${sup(n)} = ${rd((1 + R / 100) ** n, 6)}`],
            [`A = ${P} × ${rd((1 + R / 100) ** n, 6)} = ₹${A}`],
            [[String(P + P * R * n / 100), 'That is the simple-interest amount. Compound interest multiplies year by year.']]);
        }),
        tp('ci', (r) => {
          const P = r.int(1, 20) * 1000, R = r.pick([5, 10, 20]);
          const A = rd(P * (1 + R / 100) ** 2, 2), CI = rd(A - P, 2);
          return typed(`Find the compound interest on ${inr(P)} for 2 years at ${R}% per annum, compounded annually (in ₹).`, num(CI, '₹', false, 0.05),
            ['First find the amount A.', 'CI = A − P.'],
            [`A = ${P} × ${1 + R / 100}² = ${A}`, `CI = ${A} − ${P} = ₹${CI}`],
            [[String(A), 'That is the amount. Subtract the principal to get the interest.'], [String(P * R * 2 / 100), 'That is simple interest; CI is a little more.']], { steps: [st('Amount after 2 years?', num(A, '₹', false, 0.05)), st('Compound interest?', num(CI, '₹', false, 0.05))] });
        }),
        tp('half', (r) => {
          const P = r.int(1, 20) * 1000, R = r.pick([8, 10, 12, 20]), n = r.int(1, 2);
          const A = rd(P * (1 + R / 200) ** (2 * n), 2);
          return typed(`Find the amount on ${inr(P)} for ${n} year${n > 1 ? 's' : ''} at ${R}% per annum, compounded HALF-YEARLY (in ₹).`, num(A, '₹', false, 0.05),
            [`Half-yearly: rate = ${R / 2}% per half-year.`, `Number of half-years = ${2 * n}.`],
            [`A = ${P} × ${1 + R / 200}${sup(2 * n)} = ₹${A}`],
            [[String(rd(P * (1 + R / 100) ** n, 2)), 'That is yearly compounding. Halve the rate and double the periods.']]);
        }, 2),
        tp('growth', (r) => {
          const P = r.int(10, 90) * 1000, R = r.pick([2, 4, 5, 10]), grow = r.int(0, 1) === 1;
          const A = rd(P * (1 + (grow ? R : -R) / 100) ** 2, 2);
          const prompt = grow ? `The population of a village is ${P.toLocaleString('en-IN')}. It grows by ${R}% every year. What will it be after 2 years?` : `A machine is worth ${inr(P)}. Its value depreciates by ${R}% every year. What will it be worth after 2 years (in ₹)?`;
          return typed(prompt, num(A, undefined, false, 0.5),
            [grow ? `Use P(1 + ${R}/100)².` : `Depreciation: use P(1 − ${R}/100)².`],
            [`${P} × ${rd(1 + (grow ? R : -R) / 100, 2)}² = ${A}`],
            [[String(rd(P * (1 + (grow ? -R : R) / 100) ** 2, 2)), grow ? 'Growth means the multiplier is MORE than 1.' : 'Depreciation means the value goes DOWN: use 1 − R/100.']]);
        }, 2),
        bank('ci-facts', [
          { q: 'For the first year (compounded annually), CI compared with SI is:', a: 'equal', w: ['more', 'less', 'double'], h: ['No interest has been added yet.'], s: ['In year 1 both use the original principal.'] },
          { q: 'Compounded half-yearly for 3 years at 10% p.a. means:', a: '6 periods at 5% each', w: ['3 periods at 10%', '6 periods at 10%', '3 periods at 5%'], h: ['Half the rate, double the periods.'], s: ['2 × 3 = 6 periods, 10 ÷ 2 = 5%.'] },
          { q: 'A machine depreciates at 10% per year. Its value after n years is:', a: 'P(1 − 10/100)ⁿ', w: ['P(1 + 10/100)ⁿ', 'P − 10n', 'P(10/100)ⁿ'], h: ['Value goes down each year.'], s: ['Multiply by 0.9 each year.'] },
          { q: 'Which grows faster over 5 years at the same rate?', a: 'Compound interest', w: ['Simple interest', 'They are always equal', 'Depends on the bank name'], h: ['Interest on interest.'], s: ['CI earns interest on past interest too.'] },
          { q: 'Quarterly compounding at 12% p.a. uses a rate per quarter of:', a: '3%', w: ['12%', '4%', '6%'], h: ['4 quarters in a year.'], s: ['12 ÷ 4 = 3%.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 6 SQUARE ROOTS AND CUBE ROOTS
const ch6: USpec = {
  id: 'ts8.m.ch6', subject: 'math', title: 'Square Roots and Cube Roots', source: src(6),
  objectives: [
    {
      id: 'ts8.m.sq.patterns', title: 'Properties and patterns of square numbers',
      intro: [
        h('Numbers that make squares'),
        p('Arrange 16 marbles in rows: 4 rows of 4 make a perfect square. 15 marbles never will. Numbers like 1, 4, 9, 16, 25, … are called square numbers or perfect squares.'),
        def('Perfect square', 'A natural number that is the square of a natural number: n = m².'),
        keys('A perfect square never ends in 2, 3, 7 or 8.', 'A number ending in an odd number of zeros is never a perfect square.', 'Squares of even numbers are even; squares of odd numbers are odd.', 'The unit digit of m² depends only on the unit digit of m (e.g. 4 → 6, 7 → 9).'),
        h('Beautiful patterns'),
        p('1 = 1, 1 + 3 = 4, 1 + 3 + 5 = 9, 1 + 3 + 5 + 7 = 16. The sum of the first n odd numbers is n². Also, between n² and (n + 1)² there are exactly 2n numbers that are NOT squares.'),
        f('(n + 1)² − n² = 2n + 1', 'n plus 1 squared minus n squared equals 2n plus 1'),
        X({
          title: 'What if? Gap between consecutive squares', formula: '(n + 1)² − n² = 2n + 1',
          result: ['g', 'Gap between the squares', '(n + 1)^2 - n^2'],
          vars: [['n', 'n', 1, 50, 1, 4]],
          notes: [['n', 'Squares spread out: each gap is 2 more than the one before.', 'Smaller squares sit closer together.']],
          mistakes: [['Thinking there are 2n + 1 non-squares between n² and (n + 1)²', 'The gap is 2n + 1, but the non-squares strictly between are one fewer: 2n.']],
          real: 'Between 25 and 36 the non-squares are 26 to 35: 2 × 5 = 10 numbers.',
        }),
        remember('1 + 3 + 5 + … + (2n − 1) = n².'),
      ],
      examples: [
        ex('How many non-square numbers lie between 12² and 13²?', ['2n with n = 12', '= 24'], '24'),
        ex('Find 1 + 3 + 5 + … + 19 without adding.', ['19 is the 10th odd number.', 'Sum = 10² = 100'], '100'),
        ex('Can 2,057 be a perfect square?', ['It ends in 7.', 'No square ends in 7.'], 'No'),
      ],
      practice: [
        tp('between', (r) => {
          const n = r.int(5, 60);
          return typed(`How many non-square numbers lie between ${n}² and ${n + 1}²?`, num(2 * n),
            ['Between n² and (n + 1)² there are 2n non-squares.'], [`2 × ${n} = ${2 * n}`],
            [[String(2 * n + 1), 'That is the difference between the squares. Count only the numbers strictly between: 2n.']]);
        }),
        tp('odd-sum', (r) => {
          const n = r.int(5, 30), last = 2 * n - 1;
          return typed(`Find the sum 1 + 3 + 5 + … + ${last} (all odd numbers up to ${last}).`, num(n * n),
            [`${last} is the ${ord(n)} odd number (since 2n − 1 = ${last}).`, 'Sum of the first n odd numbers = n².'],
            [`n = (${last} + 1)/2 = ${n}`, `Sum = ${n}² = ${n * n}`],
            [[String(last * last), `${last} is the LAST number, not n. n = (${last} + 1)/2.`]]);
        }),
        tp('unit', (r) => {
          const m = r.int(11, 999);
          return typed(`What is the unit (ones) digit of ${m}²?`, num((m % 10) ** 2 % 10),
            [`Only the unit digit ${m % 10} matters.`, `${m % 10}² = ${(m % 10) ** 2}`],
            [`${m % 10}² = ${(m % 10) ** 2}, so ${m}² ends in ${(m % 10) ** 2 % 10}`]);
        }),
        tp('gap', (r) => {
          const n = r.int(10, 99);
          return typed(`Without squaring both, find ${n + 1}² − ${n}².`, num(2 * n + 1),
            ['(n + 1)² − n² = 2n + 1, or = (n + 1) + n.'], [`${n + 1} + ${n} = ${2 * n + 1}`]);
        }),
        tp('tap-sq', (r) => {
          const sq = r.shuffle([144, 196, 289, 361, 441, 576, 625, 784, 900, 1024]).slice(0, 3);
          const non = r.shuffle([222, 343, 507, 1000, 288, 1058, 2057, 4000, 3133, 728]).slice(0, 3);
          return { type: 'tap', prompt: 'Tap every number that is a perfect square.', ...tapAll(r, [...sq.map((x) => ({ label: String(x), ok: true })), ...non.map((x) => ({ label: String(x), ok: false }))]),
            hints: ['Squares never end in 2, 3, 7 or 8.', 'A square ends in an even number of zeros.'], solution: [`Squares: ${sq.map((x) => `${x} = ${Math.sqrt(x)}²`).join(', ')}`, `Not squares: ${non.join(', ')}`] };
        }),
      ],
    },
    {
      id: 'ts8.m.sq.triplets', title: 'Pythagorean triplets', prereqs: ['ts8.m.sq.patterns'],
      intro: [
        h('Three numbers that fit a right angle'),
        p('Masons in villages still make a perfect right angle with a rope knotted into lengths 3, 4 and 5. Why? Because 3² + 4² = 5². Such sets of natural numbers are called Pythagorean triplets.'),
        def('Pythagorean triplet', 'Three natural numbers a, b, c with a² + b² = c². Examples: (3, 4, 5), (6, 8, 10), (5, 12, 13), (8, 15, 17).'),
        p('There is a recipe that makes one for any natural number m > 1: take 2m, m² − 1 and m² + 1.'),
        f('(2m)² + (m² − 1)² = (m² + 1)²', '2m squared plus m squared minus 1 squared equals m squared plus 1 squared'),
        X({
          title: 'What if? Build a triplet from m', formula: '2m, m² − 1, m² + 1',
          result: ['c', 'Largest number m² + 1', 'm^2 + 1'],
          vars: [['m', 'm', 2, 20, 1, 4]],
          notes: [['m', 'The two larger members grow like m² while the even member grows only like 2m.', 'Small m gives small triplets: m = 2 gives (4, 3, 5).']],
          mistakes: [['Using m = 1', 'Then m² − 1 = 0, which is not a natural number.'], ['Thinking this recipe gives every triplet', '(5, 12, 13) is a triplet, but 12 = 2m gives m = 6 and the triplet (12, 35, 37). The recipe gives many triplets, not all.']],
          real: 'With m = 4: (8, 15, 17). A ladder 17 m long, foot 8 m from a wall, reaches 15 m up.',
        }),
        keys('Check: is the square of the largest number equal to the sum of the squares of the other two?', 'Multiples of a triplet are triplets: (3, 4, 5) → (9, 12, 15).'),
        remember('In a triplet the LARGEST number is always the one squared alone: c² = a² + b².'),
      ],
      examples: [
        ex('Find a Pythagorean triplet whose smallest member is 8.', ['Take 2m = 8 → m = 4.', 'm² − 1 = 15, m² + 1 = 17', 'Check: 64 + 225 = 289 = 17² ✓'], '(8, 15, 17)'),
        ex('Is (7, 24, 25) a triplet?', ['7² + 24² = 49 + 576 = 625', '25² = 625 ✓'], 'Yes'),
      ],
      practice: [
        tp('largest', (r) => {
          const m = r.int(3, 15);
          return typed(`Using 2m, m² − 1, m² + 1, find the LARGEST member of the Pythagorean triplet whose even member 2m is ${2 * m}.`, num(m * m + 1),
            [`2m = ${2 * m}, so m = ${m}.`, 'Largest member = m² + 1.'],
            [`m = ${m}`, `m² + 1 = ${m * m + 1}`, `Triplet: (${2 * m}, ${m * m - 1}, ${m * m + 1})`],
            [[String(m * m - 1), 'That is the middle member m² − 1.']]);
        }),
        tp('middle', (r) => {
          const m = r.int(3, 15);
          return typed(`Find the member m² − 1 of the Pythagorean triplet whose even member 2m is ${2 * m}.`, num(m * m - 1),
            [`m = ${2 * m} ÷ 2 = ${m}.`], [`m² − 1 = ${m * m} − 1 = ${m * m - 1}`]);
        }),
        tp('missing', (r) => {
          const [a, b, c] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]]);
          const k = r.int(1, 3);
          return typed(`(${k * a}, ${k * b}, x) is a Pythagorean triplet. Find x.`, num(k * c),
            ['x² = a² + b².'], [`x² = ${(k * a) ** 2} + ${(k * b) ** 2} = ${(k * c) ** 2}`, `x = ${k * c}`]);
        }),
        tp('check', (r) => {
          const good: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20]];
          const bad: [number, number, number][] = [[4, 5, 6], [5, 7, 9], [6, 9, 12], [2, 3, 4], [8, 12, 15], [10, 11, 15], [7, 9, 12]];
          const pick = [...r.shuffle(good).slice(0, 3).map((t) => ({ label: `(${t.join(', ')})`, ok: true })), ...r.shuffle(bad).slice(0, 3).map((t) => ({ label: `(${t.join(', ')})`, ok: false }))];
          return { type: 'tap', prompt: 'Tap every Pythagorean triplet.', ...tapAll(r, pick), hints: ['Check a² + b² = c² with c the largest.'], solution: pick.filter((x) => x.ok).map((x) => `${x.label} ✓`) };
        }),
        bank('trip-facts', [
          { q: 'Which value of m gives the triplet (6, 8, 10) using 2m, m² − 1, m² + 1?', a: 'm = 3', w: ['m = 6', 'm = 4', 'm = 8'], h: ['2m = 6'], s: ['m = 3: 6, 8, 10.'] },
          { q: 'If (a, b, c) is a triplet, then so is:', a: '(2a, 2b, 2c)', w: ['(a + 1, b + 1, c + 1)', '(a², b², c²)', '(a, b, c + 1)'], h: ['Scale a right triangle.'], s: ['(2a)² + (2b)² = 4(a² + b²) = (2c)².'] },
          { q: 'Which is NOT a Pythagorean triplet?', a: '(4, 5, 6)', w: ['(3, 4, 5)', '(5, 12, 13)', '(8, 15, 17)'], h: ['16 + 25 = 41'], s: ['41 ≠ 36.'] },
          { q: 'A rope with knots at 3, 4 and 5 units is used to make:', a: 'a right angle', w: ['a circle', 'an equilateral triangle', 'a straight line'], h: ['3² + 4² = 5²'], s: ['The angle opposite the 5-unit side is 90°.'] },
          { q: 'The triplet with m = 5 is:', a: '(10, 24, 26)', w: ['(5, 12, 13)', '(10, 25, 26)', '(5, 24, 25)'], h: ['2m = 10, m² ± 1 = 24, 26'], s: ['(10, 24, 26).'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.sq.roots', title: 'Finding square roots (subtraction, prime factors, division method, decimals)', prereqs: ['ts8.m.sq.patterns'],
      intro: [
        h('Going backwards from a square'),
        p('A square garden has area 625 m². How long is each side? We need the number that, multiplied by itself, gives 625. That is the square root: √625 = 25.'),
        def('Square root', '√n is the positive number whose square is n. √81 = 9 because 9² = 81.'),
        h('Method 1: repeated subtraction'),
        p('Subtract the odd numbers 1, 3, 5, … in turn until you reach 0. The number of subtractions is the square root. 25 − 1 − 3 − 5 − 7 − 9 = 0: five steps, so √25 = 5.'),
        h('Method 2: prime factorisation'),
        p('Pair up equal prime factors and take one from each pair. 324 = (2 × 2) × (3 × 3) × (3 × 3), so √324 = 2 × 3 × 3 = 18. If a prime is left without a partner, the number is not a perfect square — multiply or divide by that prime to make it one.'),
        h('Method 3: long division'),
        stepsB('Group digits in pairs from the units place (and from the decimal point for decimals): 5|29 or 2|0.|25.', 'Find the largest square ≤ the first group; write its root as the first digit.', 'Subtract, bring down the next pair, double the root so far and find the next digit.', 'Repeat until all pairs are used.'),
        f('√(a × b) = √a × √b   and   √(a/b) = √a/√b', 'root of a b equals root a times root b'),
        X({
          title: 'What if? Square root grows slowly', formula: 'r = √N',
          result: ['r', 'Square root', 'sqrt(N)', '', 3],
          vars: [['N', 'Number N', 1, 10000, 1, 625]],
          notes: [['N', 'To double the root, N must become 4 times bigger.', 'Dividing N by 4 halves the root.']],
          mistakes: [['√(a + b) = √a + √b', '√(9 + 16) = √25 = 5, but √9 + √16 = 7. The rule works for × and ÷ only.'], ['√0.9 = 0.3', '0.3² = 0.09. Pair decimal places: √0.09 = 0.3, √0.9 ≈ 0.949.']],
          real: 'A square carpet covering 6.25 m² has sides √6.25 = 2.5 m.',
        }),
        keys('A perfect square with n digits has a root with n/2 digits (n even) or (n + 1)/2 digits (n odd).', 'Pair digits from the decimal point for decimals.'),
        remember('If a prime factor has no partner, the number is not a perfect square.'),
      ],
      examples: [
        ex('Find √1764 by prime factorisation.', ['1764 = 2 × 2 × 3 × 3 × 7 × 7', 'Take one from each pair: 2 × 3 × 7', '= 42'], '42'),
        ex('Find the smallest number by which 180 must be multiplied to get a perfect square.', ['180 = 2 × 2 × 3 × 3 × 5', '5 has no partner.', 'Multiply by 5: 900 = 30²'], '5'),
        ex('Find √12.25.', ['12.25 = 1225/100', '√1225 = 35, √100 = 10', '= 3.5'], '3.5'),
      ],
      practice: [
        tp('factor', (r) => {
          const k = r.pick([12, 14, 15, 18, 21, 24, 28, 30, 35, 36, 42, 45, 48, 56, 63, 66, 72, 84, 88, 96]);
          return typed(`Find √${k * k} using prime factorisation.`, num(k),
            ['Write the number as a product of primes.', 'Make pairs; take one prime from each pair.'],
            [`${k * k} = ${pfl(k * k)}`, `√${k * k} = ${pfl(k)} = ${k}`]);
        }),
        tp('subtract', (r) => {
          const k = r.int(3, 10);
          return typed(`By subtracting 1, 3, 5, 7, … from ${k * k} until you reach 0, how many subtractions do you make?`, num(k),
            ['The sum of the first n odd numbers is n².', 'The number of steps is the square root.'],
            [`${k * k} − ${Array.from({ length: k }, (_, i) => 2 * i + 1).join(' − ')} = 0`, `${k} steps, so √${k * k} = ${k}`]);
        }),
        tp('multiplier', (r) => {
          const s = r.int(2, 12), q = r.pick([2, 3, 5, 6, 7, 10, 11]);
          const n = s * s * q, mode = r.pick(['multiplied', 'divided']);
          return typed(`Find the smallest number by which ${n} must be ${mode} to get a perfect square.`, num(q),
            [`Factorise: ${n} = ${pfl(n)}.`, 'Find the primes that have no partner.'],
            [`${n} = ${pfs(n)}`, `Unpaired: ${pfl(q)}`, `${mode === 'multiplied' ? `${n} × ${q} = ${n * q} = ${s * q}²` : `${n} ÷ ${q} = ${s * s} = ${s}²`}`]);
        }, 2),
        tp('decimal', (r) => {
          const k0 = r.int(11, 99), k = k0 % 10 ? k0 : k0 + 1, d = r.pick([1, 2]);
          const root = k / 10 ** d, sq = rd(root * root, 2 * d);
          return typed(`Find √${sq}.`, num(root),
            ['Pair the decimal places from the decimal point.', `Think of √${k * k} first.`],
            [`√${k * k} = ${k}`, `${sq} has ${2 * d} decimal places, so the root has ${d}: ${root}`],
            [[String(k), 'Place the decimal point: the root has half as many decimal places.']]);
        }, 2),
        tp('digits', (r) => {
          const k = r.int(10, 999);
          const n = k * k, dn = String(n).length;
          return typed(`How many digits does the square root of ${n} have? (Use pairing of digits; don't compute the root.)`, num(Math.ceil(dn / 2)),
            ['Put bars on pairs of digits from the right.', 'Each bar gives one digit of the root.'],
            [`${n} has ${dn} digits → ${Math.ceil(dn / 2)} pairs/groups`, `So √${n} has ${Math.ceil(dn / 2)} digits (it is ${k}).`]);
        }),
      ],
    },
    {
      id: 'ts8.m.sq.cubes', title: 'Cube numbers and cube roots', prereqs: ['ts8.m.sq.roots'],
      intro: [
        h('From squares to cubes'),
        p('Build a big cube from small unit cubes: 2 × 2 × 2 = 8 cubes, 3 × 3 × 3 = 27 cubes. Numbers like 1, 8, 27, 64, 125 are perfect cubes. A Rubik\'s cube is 3³ = 27 little cubes.'),
        def('Perfect cube', 'A number of the form m³ = m × m × m.'),
        def('Cube root', '∛n is the number whose cube is n. ∛125 = 5 because 5³ = 125.'),
        h('Cube root by prime factorisation'),
        p('Group equal primes in THREES and take one from each group. 3375 = (3 × 3 × 3) × (5 × 5 × 5), so ∛3375 = 3 × 5 = 15.'),
        h('Estimating the cube root of a large perfect cube'),
        stepsB('Split the number into groups of three digits from the right: 110|592.', 'The last group fixes the unit digit: cubes ending in 2 come from numbers ending in 8 (8³ = 512).', 'The first group fixes the tens digit: 4³ = 64 ≤ 110 < 125 = 5³, so the tens digit is 4.', '∛110592 = 48.'),
        f('V = a³  ⇔  a = ∛V', 'volume a cubed, side is the cube root of volume'),
        X({
          title: 'What if? Cubes grow fast', formula: 'V = a³',
          result: ['V', 'Cube of a', 'a^3'],
          vars: [['a', 'Number a', 1, 30, 1, 5]],
          notes: [['a', 'Doubling a makes the cube 8 times bigger.', 'Halving a makes the cube 8 times smaller.']],
          mistakes: [['5³ = 15', 'Cubing is 5 × 5 × 5 = 125, not 5 × 3.'], ['Cubes never end in 2, 3, 7 or 8 (like squares)', 'Cubes CAN end in any digit: 8³ = 512, 3³ = 27, 7³ = 343, 2³ = 8.']],
          real: 'A water tank shaped like a cube holding 1 m³ = 1000 litres has sides of exactly 1 m.',
        }),
        keys('Unit digit of a cube: 1→1, 2→8, 3→7, 4→4, 5→5, 6→6, 7→3, 8→2, 9→9, 0→0.', 'Cube of an even number is even; of an odd number, odd.', 'Make a number a cube by completing every prime\'s group of three.'),
        remember('A negative number has a negative cube root: ∛(−27) = −3.'),
      ],
      examples: [
        ex('Find ∛2744.', ['2744 = 2 × 2 × 2 × 7 × 7 × 7', 'One from each triple: 2 × 7 = 14'], '14'),
        ex('Find the smallest number by which 392 must be multiplied to make it a perfect cube.', ['392 = 2³ × 7²', '7 needs one more 7.', '392 × 7 = 2744 = 14³'], '7'),
        ex('Estimate ∛13824.', ['Groups: 13 | 824', 'Unit digit: 824 ends in 4 → root ends in 4', 'Tens: 2³ = 8 ≤ 13 < 27 → 2', '∛13824 = 24'], '24'),
      ],
      practice: [
        tp('cube', (r) => {
          const a = r.int(4, 25);
          return typed(`Find ${a}³.`, num(a ** 3), [`${a} × ${a} × ${a}`, `${a} × ${a} = ${a * a}`], [`${a * a} × ${a} = ${a ** 3}`], [[String(3 * a), 'Cubing is multiplying the number by itself three times, not by 3.'], [String(a * a), 'That is the square. Multiply once more.']]);
        }),
        tp('croot', (r) => {
          const a = r.pick([6, 12, 14, 15, 18, 20, 21, 24, 28, 30, 35]);
          return typed(`Find ∛${a ** 3} by prime factorisation.`, num(a),
            ['Factorise into primes.', 'Make groups of three equal primes; take one from each group.'],
            [`${a ** 3} = ${pfs(a ** 3)}`, `∛${a ** 3} = ${pfl(a)} = ${a}`]);
        }),
        tp('make-cube', (r) => {
          const s = r.int(2, 6), q = r.pick([2, 3, 5]), two = r.int(0, 1) === 1;
          const n0 = s ** 3 * (two ? q * q : q);
          const need0 = two ? q : q * q;
          // make sure q is not already a factor of s (so the "missing" factor is exactly need0)
          const n = s % q === 0 ? 7 * 7 * 2 ** 3 : n0, need = s % q === 0 ? 7 : need0;
          return typed(`Find the smallest number by which ${n} must be multiplied to make it a perfect cube.`, num(need),
            [`Factorise: ${n} = ${pfs(n)}.`, 'Every prime must appear a multiple of 3 times.'],
            [`${n} = ${pfs(n)}`, `Multiply by ${pfs(need)} = ${need}`, `${n} × ${need} = ${n * need} = ${Math.round(Math.cbrt(n * need))}³`]);
        }, 2),
        tp('estimate', (r) => {
          const a = r.int(22, 99);
          const n = a ** 3, s = String(n);
          return typed(`${n} is a perfect cube. Find its cube root by estimation.`, num(a),
            [`Last three digits ${s.slice(-3)} end in ${s.slice(-1)} → the root ends in ${a % 10}.`, `First group ${s.slice(0, -3)} lies between ${Math.floor(a / 10)}³ = ${Math.floor(a / 10) ** 3} and ${Math.floor(a / 10) + 1}³ = ${(Math.floor(a / 10) + 1) ** 3}.`],
            [`Unit digit ${a % 10}, tens digit ${Math.floor(a / 10)}`, `∛${n} = ${a}`]);
        }, 2),
        bank('cube-facts', [
          { q: 'Which is a perfect cube?', a: '1331', w: ['100', '256', '500'], h: ['11³ = ?'], s: ['11³ = 1331.'] },
          { q: 'The cube of an odd number is:', a: 'odd', w: ['even', 'sometimes even', 'zero'], h: ['odd × odd × odd'], s: ['The product of odd numbers is odd.'] },
          { q: 'If a number ends in 7, its cube ends in:', a: '3', w: ['7', '9', '1'], h: ['7³ = 343'], s: ['343 ends in 3.'] },
          { q: '∛(−64) equals:', a: '−4', w: ['4', 'not defined', '−8'], h: ['(−4)³ = ?'], s: ['(−4) × (−4) × (−4) = −64.'] },
          { q: 'Is 500 a perfect cube?', a: 'No, 500 = 2² × 5³', w: ['Yes, 500 = 5³', 'Yes, it ends in 0', 'Yes, 500 = 10³ ÷ 2'], h: ['Group primes in threes.'], s: ['The 2s form only a pair, not a triple.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7 FREQUENCY DISTRIBUTION TABLES AND GRAPHS
interface GT { lo: number; w: number; f: number[] }
const gtRows = (g: GT) => g.f.map((x, i) => `${g.lo + i * g.w}–${g.lo + (i + 1) * g.w}: ${x}`).join(', ');
const gtVis = (g: GT) => ({ kind: 'bar-graph' as const, labels: g.f.map((_, i) => `${g.lo + i * g.w}–${g.lo + (i + 1) * g.w}`), values: g.f });
const mkGT = (r: Rng): GT => ({ lo: r.pick([0, 10, 20, 30, 40]), w: r.pick([5, 10]), f: Array.from({ length: 5 }, () => r.int(2, 15)) });
const ch7: USpec = {
  id: 'ts8.m.ch7', subject: 'math', title: 'Frequency Distribution Tables and Graphs', source: src(7),
  objectives: [
    {
      id: 'ts8.m.stat.central', title: 'Mean, median and mode (recap)',
      intro: [
        h('One number to describe many'),
        p('Your class scores in a test: 12, 15, 15, 18, 20. If someone asks "how did the class do?", you can answer with one representative number — an average. There are three common ones.'),
        def('Mean (arithmetic mean)', 'Sum of all observations ÷ number of observations.'),
        def('Median', 'The middle value when the data are arranged in order. For an even count, the mean of the two middle values.'),
        def('Mode', 'The value that occurs most often.'),
        f('Mean = (sum of observations)/(number of observations)', 'mean equals sum over count'),
        X({
          title: 'What if? Change the data, watch the mean', formula: 'x̄ = S/n',
          result: ['m', 'Mean', 'S/n', '', 2],
          vars: [['S', 'Sum of observations S', 10, 1000, 5, 400], ['n', 'Number of observations n', 1, 50, 1, 8]],
          notes: [['n', 'The same total shared among more observations gives a smaller mean.', 'Fewer observations sharing the total raises the mean.']],
          mistakes: [['Finding the median without sorting', 'Arrange the data in order first — the middle of an unsorted list means nothing.'], ['Thinking the mean must be one of the data values', 'The mean of 1, 2, 4 is 7/3 ≈ 2.33, which is not in the list.']],
          real: 'A cricketer\'s batting average is a mean: total runs ÷ number of times out.',
        }),
        keys('Mean uses every value; one very large value can pull it a lot.', 'Median is not affected by extreme values.', 'Mode can be used even for non-numbers (most popular colour).'),
        remember('If each observation is increased by k, the mean also increases by k.'),
      ],
      examples: [
        ex('Find the mean of 23, 27, 30, 32, 38.', ['Sum = 150', '150 ÷ 5 = 30'], '30'),
        ex('Find the median of 41, 36, 50, 29, 44, 38.', ['Order: 29, 36, 38, 41, 44, 50', 'Middle two: 38 and 41', 'Median = 39.5'], '39.5'),
        ex('The mean of 5 numbers is 18. Four of them are 15, 20, 12, 25. Find the fifth.', ['Total = 5 × 18 = 90', '90 − 72 = 18'], '18'),
      ],
      practice: [
        tp('mean', (r) => {
          const n = r.int(5, 8), m = r.int(20, 60);
          const xs = Array.from({ length: n - 1 }, () => m + r.int(-12, 12));
          xs.push(n * m - xs.reduce((a, b) => a + b, 0));
          return typed(`Find the mean of: ${xs.join(', ')}.`, num(m),
            ['Add all the observations.', `Divide by ${n}.`], [`Sum = ${n * m}`, `Mean = ${n * m} ÷ ${n} = ${m}`]);
        }),
        tp('median', (r) => {
          const n = r.pick([5, 7, 9]);
          const xs = r.shuffle(Array.from({ length: n }, (_, i) => 10 + i * r.int(2, 4) + r.int(0, 1)));
          const sorted = [...xs].sort((a, b) => a - b);
          const med = sorted[(n - 1) / 2];
          return typed(`Find the median of: ${xs.join(', ')}.`, num(med),
            ['Arrange in ascending order first.', `With ${n} values, the median is the ${ord((n + 1) / 2)} value.`],
            [`Ordered: ${sorted.join(', ')}`, `Median = ${med}`],
            xs[(n - 1) / 2] !== med ? [[String(xs[(n - 1) / 2]), 'You took the middle of the UNSORTED list. Sort first.']] : []);
        }),
        tp('mode', (r) => {
          const mo = r.int(10, 40);
          const others = r.shuffle([mo - 7, mo - 4, mo - 2, mo + 1, mo + 3, mo + 6, mo + 8]).slice(0, 4);
          const xs = r.shuffle([mo, mo, mo, others[0], others[0], others[1], others[2], others[3]]);
          return typed(`Find the mode of: ${xs.join(', ')}.`, num(mo), ['Count how often each value appears.'], [`${mo} appears 3 times — more than any other value.`]);
        }),
        tp('missing', (r) => {
          const n = r.int(4, 6), m = r.int(15, 50);
          const xs = Array.from({ length: n - 1 }, () => m + r.int(-10, 10));
          const last = n * m - xs.reduce((a, b) => a + b, 0);
          return typed(`The mean of ${n} numbers is ${m}. ${n - 1} of them are ${xs.join(', ')}. Find the remaining number.`, num(last),
            [`Total of all ${n} = ${n} × ${m}.`, 'Subtract the known numbers.'],
            [`Total = ${n * m}`, `Known sum = ${xs.reduce((a, b) => a + b, 0)}`, `Missing = ${last}`]);
        }, 2),
        bank('avg-facts', [
          { q: 'Which average is NOT affected by one very large value?', a: 'Median', w: ['Mean', 'Sum', 'Total'], h: ['Which one only looks at the middle?'], s: ['The median depends only on the middle position.'] },
          { q: 'The mean of 2, 4, 6, 8 is 5. If every number is increased by 3, the new mean is:', a: '8', w: ['5', '15', '20'], h: ['Every value moves up by 3.'], s: ['Mean also increases by 3: 8.'] },
          { q: 'The most popular shirt size in a shop is best described by the:', a: 'mode', w: ['mean', 'median', 'range'], h: ['Most frequent.'], s: ['Mode = most frequent value.'] },
          { q: 'The median of 3, 8, 5, 10 is:', a: '6.5', w: ['5', '8', '6'], h: ['Order: 3, 5, 8, 10'], s: ['(5 + 8)/2 = 6.5.'] },
          { q: 'The range of 12, 7, 25, 18 is:', a: '18', w: ['25', '7', '13'], h: ['Largest − smallest.'], s: ['25 − 7 = 18.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.stat.grouped', title: 'Organising grouped data and cumulative frequency', prereqs: ['ts8.m.stat.central'],
      intro: [
        h('Too many numbers? Put them in groups'),
        p('The heights of 60 students are hard to read as a list. Group them into classes like 130–135 cm, 135–140 cm, … and count how many fall in each. That table is a grouped frequency distribution.'),
        def('Class interval', 'A group such as 20–30. 20 is the lower limit and 30 the upper limit. In the "exclusive" method a value equal to 30 goes into the NEXT class, 30–40.'),
        def('Class size (width)', 'Upper limit − lower limit, e.g. 30 − 20 = 10.'),
        def('Class mark', 'The mid-point of a class: (lower + upper)/2.'),
        def('Cumulative frequency', 'The running total of frequencies: the number of observations up to (less than) the upper limit of a class.'),
        f('Class mark = (lower limit + upper limit)/2', 'class mark equals lower plus upper over 2'),
        X({
          title: 'What if? Class marks', formula: 'x = (l + u)/2',
          result: ['x', 'Class mark', '(l + u)/2', '', 2],
          vars: [['l', 'Lower limit l', 0, 100, 5, 20], ['u', 'Upper limit u', 5, 200, 5, 30]],
          notes: [['u', 'A higher upper limit pushes the middle up by half as much.', 'A lower upper limit pulls the middle down.']],
          mistakes: [['Using u − l as the class mark', 'u − l is the class SIZE. The class mark is the middle: (l + u)/2.']],
          real: 'In the class 140–150 cm, we use 145 cm to stand for every student in that group.',
        }),
        p('"Less than" cumulative frequency adds from the top; "more than" cumulative frequency adds from the bottom. The last "less than" cumulative frequency always equals the total number of observations.'),
        keys('Classes must not overlap in meaning: 10–20 holds 10 ≤ x < 20.', 'Class size = u − l.', 'Class mark = (l + u)/2.', 'cf of a class = sum of frequencies up to that class.'),
        remember('Tally marks are drawn in fives (||||) to make counting easier.'),
      ],
      examples: [
        ex('Find the class mark and class size of 35–45.', ['Class mark = (35 + 45)/2 = 40', 'Class size = 45 − 35 = 10'], '40 and 10'),
        ex('Frequencies of classes 0–10, 10–20, 20–30, 30–40 are 4, 7, 9, 5. Find the cumulative frequency of 20–30.', ['4 + 7 + 9 = 20'], '20'),
      ],
      practice: [
        tp('mark', (r) => {
          const w = r.pick([4, 5, 10, 20]), l = r.int(1, 15) * w;
          return typed(`Find the class mark of the class ${l}–${l + w}.`, num(l + w / 2),
            ['Class mark is the mid-point.', `(${l} + ${l + w}) ÷ 2`], [`(${l} + ${l + w})/2 = ${l + w / 2}`],
            [[String(w), 'That is the class size (width). The class mark is the middle value.']]);
        }),
        tp('size', (r) => {
          const w = r.pick([3, 4, 5, 8, 10, 15, 20]), l = r.int(1, 12) * w;
          const marks = [0, 1, 2].map((i) => l + w / 2 + i * w);
          return typed(`The class marks of a distribution are ${marks.join(', ')}, … What is the class size?`, num(w),
            ['The difference between consecutive class marks is the class size.'], [`${marks[1]} − ${marks[0]} = ${w}`]);
        }),
        tp('count', (r) => {
          const lo = r.pick([10, 20, 30, 40]);
          const xs = Array.from({ length: 14 }, () => r.int(lo - 10, lo + 19));
          const c = xs.filter((x) => x >= lo && x < lo + 10).length;
          return typed(`Marks of 14 students: ${xs.join(', ')}. How many lie in the class ${lo}–${lo + 10} (exclusive method: ${lo} ≤ x < ${lo + 10})?`, num(c),
            [`Include ${lo}; do NOT include ${lo + 10}.`, 'Tally each value.'],
            [`Values in ${lo}–${lo + 10}: ${xs.filter((x) => x >= lo && x < lo + 10).join(', ') || 'none'}`, `Frequency = ${c}`]);
        }, 2),
        tp('cf', (r) => {
          const g = mkGT(r), k = r.int(1, 4);
          const cf = g.f.slice(0, k + 1).reduce((a, b) => a + b, 0);
          const cls = `${g.lo + k * g.w}–${g.lo + (k + 1) * g.w}`;
          return typed(`Frequency table: ${gtRows(g)}. Find the (less than) cumulative frequency of the class ${cls}.`, num(cf),
            ['Add the frequencies of this class and every class before it.'],
            [`${g.f.slice(0, k + 1).join(' + ')} = ${cf}`],
            [[String(g.f[k]), 'That is the frequency of the class alone. Cumulative frequency is the running total.']], { visual: gtVis(g) });
        }),
        tp('more-than', (r) => {
          const g = mkGT(r), k = r.int(1, 4);
          const cf = g.f.slice(k).reduce((a, b) => a + b, 0);
          const low = g.lo + k * g.w;
          return typed(`Frequency table: ${gtRows(g)}. How many observations are ${low} or more?`, num(cf),
            [`Add the frequencies of all classes from ${low} upwards.`], [`${g.f.slice(k).join(' + ')} = ${cf}`], [], { visual: gtVis(g) });
        }, 2),
      ],
    },
    {
      id: 'ts8.m.stat.graphs', title: 'Histograms, frequency polygons and ogives', prereqs: ['ts8.m.stat.grouped'],
      intro: [
        h('Pictures of grouped data'),
        p('A table tells, a graph shows. Grouped data are drawn with special graphs that make patterns jump out.'),
        def('Histogram', 'Bars drawn side by side with NO gaps; the width of each bar is the class interval and the height is the frequency.'),
        def('Frequency polygon', 'Join the mid-points (class marks) of the tops of the histogram bars with straight lines; close it at the class marks of imaginary classes with frequency 0 at both ends.'),
        def('Ogive (cumulative frequency curve)', 'Plot (upper limit, less-than cumulative frequency) and join the points with a smooth curve.'),
        vis({ kind: 'bar-graph', labels: ['0–10', '10–20', '20–30', '30–40', '40–50'], values: [3, 8, 12, 7, 4] }, 'Histogram-style bar chart: frequencies 3, 8, 12, 7, 4 for classes 0–10 up to 40–50'),
        stepsB('For a frequency polygon, plot (class mark, frequency) for each class.', 'Add a class of frequency 0 before the first and after the last.', 'Join the points with straight line segments.'),
        keys('Histogram: no gaps between bars.', 'Polygon: plotted at class marks.', 'Less-than ogive: plotted at upper limits; it never goes down.'),
        remember('A bar graph has gaps and is for separate categories; a histogram has no gaps and is for continuous classes.'),
      ],
      examples: [
        ex('In a frequency polygon, where is the point for the class 20–30 with frequency 12 plotted?', ['Class mark = 25', 'Point (25, 12)'], '(25, 12)'),
        ex('Classes 0–10, 10–20, 20–30 have frequencies 3, 8, 12. What points are plotted on the less-than ogive?', ['Cumulative: 3, 11, 23', 'Upper limits: 10, 20, 30'], '(10, 3), (20, 11), (30, 23)'),
      ],
      practice: [
        tp('read', (r) => {
          const g = mkGT(r), k = r.int(0, 4);
          return typed(`The histogram shows a frequency distribution. What is the frequency of the class ${g.lo + k * g.w}–${g.lo + (k + 1) * g.w}?`, num(g.f[k]),
            ['Find the bar for that class.', 'Its height is the frequency.'], [`Frequency = ${g.f[k]}`], [], { visual: gtVis(g) });
        }),
        tp('tallest', (r) => {
          const g = mkGT(r);
          const mx = Math.max(...g.f), k = g.f.indexOf(mx);
          g.f = g.f.map((x, i) => (i !== k && x === mx ? x - 1 : x));
          const labels = g.f.map((_, i) => `${g.lo + i * g.w}–${g.lo + (i + 1) * g.w}`);
          return mcq(r, 'Which class has the highest frequency in this histogram?', labels[k], labels.filter((_, i) => i !== k),
            ['Look for the tallest bar.'], [`The tallest bar is ${labels[k]} with frequency ${mx}.`], [], { visual: gtVis(g) });
        }),
        tp('poly-x', (r) => {
          const w = r.pick([5, 10, 20]), l = r.int(1, 10) * w, fq = r.int(3, 30);
          return typed(`In a frequency polygon, the class ${l}–${l + w} has frequency ${fq}. What is the x-coordinate of its point?`, num(l + w / 2),
            ['Frequency polygons use class marks.'], [`Class mark = (${l} + ${l + w})/2 = ${l + w / 2}`, `Point: (${l + w / 2}, ${fq})`],
            [[String(l + w), 'That is the upper limit — used for an ogive, not a frequency polygon.'], [String(l), 'Use the mid-point of the class, not its lower limit.']]);
        }),
        tp('ogive-y', (r) => {
          const g = mkGT(r), k = r.int(1, 4);
          const cf = g.f.slice(0, k + 1).reduce((a, b) => a + b, 0), up = g.lo + (k + 1) * g.w;
          return typed(`Frequency table: ${gtRows(g)}. On the less-than ogive, what is the y-coordinate of the point plotted at x = ${up}?`, num(cf),
            [`Count all observations less than ${up}.`], [`${g.f.slice(0, k + 1).join(' + ')} = ${cf}`, `Point (${up}, ${cf})`], [], { visual: gtVis(g) });
        }, 2),
        matchT('graph-types', 'Match each graph with how it is drawn', [
          ['Histogram', 'Adjacent bars with no gaps'],
          ['Bar graph', 'Separate bars with equal gaps'],
          ['Frequency polygon', 'Points at class marks joined by line segments'],
          ['Less-than ogive', 'Cumulative frequencies at upper limits'],
          ['Pie chart', 'Sectors of a circle for parts of a whole'],
        ], ['Think about what is on the x-axis for each graph.']),
      ],
    },
  ],
};

// ================================================================== CH 8 EXPLORING GEOMETRICAL FIGURES
const ch8: USpec = {
  id: 'ts8.m.ch8', subject: 'math', title: 'Exploring Geometrical Figures', source: src(8),
  objectives: [
    {
      id: 'ts8.m.geo.congruent', title: 'Congruent figures',
      intro: [
        h('Exact copies'),
        p('Two ₹10 coins, two pages of the same notebook, two tiles from the same box — you can place one exactly on top of the other. Such figures are congruent.'),
        def('Congruent figures', 'Figures with the same shape AND the same size. We write △ABC ≅ △PQR.'),
        p('The order of letters matters: △ABC ≅ △PQR means A ↔ P, B ↔ Q, C ↔ R. So AB = PQ, ∠B = ∠Q, and so on.'),
        keys('SSS: three sides equal.', 'SAS: two sides and the angle BETWEEN them equal.', 'ASA: two angles and the side between them equal.', 'RHS: right angle, hypotenuse and one side equal.'),
        remember('AAA is NOT a congruence rule: triangles with the same angles can be different sizes (they are similar).'),
        tip('Mark equal parts on a sketch with the same number of ticks — matching is then easy.'),
      ],
      examples: [
        ex('△ABC ≅ △XYZ, ∠A = 50°, ∠B = 70°. Find ∠Z.', ['C ↔ Z', '∠C = 180 − 50 − 70 = 60°', '∠Z = 60°'], '60°'),
        ex('In △PQR and △LMN, PQ = LM, QR = MN, ∠Q = ∠M. Which rule shows congruence?', ['Two sides and the included angle.'], 'SAS'),
      ],
      practice: [
        tp('corr-angle', (r) => {
          const A = r.int(30, 80), B = r.int(30, 80), C = 180 - A - B;
          const names = r.pick([['ABC', 'PQR'], ['DEF', 'LMN'], ['XYZ', 'STU'], ['KLM', 'RST']]);
          const ask = r.int(0, 2);
          const vals = [A, B, C];
          const given = [0, 1, 2].filter((i) => i !== ask);
          return typed(`△${names[0]} ≅ △${names[1]}. ∠${names[0][given[0]]} = ${vals[given[0]]}° and ∠${names[0][given[1]]} = ${vals[given[1]]}°. Find ∠${names[1][ask]}.`, num(vals[ask], '°'),
            [`∠${names[1][ask]} corresponds to ∠${names[0][ask]}.`, 'Use the angle sum 180°.'],
            [`∠${names[0][ask]} = 180 − ${vals[given[0]]} − ${vals[given[1]]} = ${vals[ask]}°`, `So ∠${names[1][ask]} = ${vals[ask]}°`]);
        }),
        tp('corr-side', (r) => {
          const names = r.pick([['ABC', 'PQR'], ['DEF', 'LMN'], ['XYZ', 'STU']]);
          const s = [r.int(3, 9), r.int(4, 10), r.int(5, 11)];
          const pairs: [number, number][] = [[0, 1], [1, 2], [0, 2]];
          const k = r.int(0, 2), [i, j] = pairs[k];
          return typed(`△${names[0]} ≅ △${names[1]} with ${names[0][0]}${names[0][1]} = ${s[0]} cm, ${names[0][1]}${names[0][2]} = ${s[1]} cm, ${names[0][0]}${names[0][2]} = ${s[2]} cm. Find ${names[1][i]}${names[1][j]}.`, num(s[k], 'cm'),
            ['Match vertices in order.', `${names[1][i]}${names[1][j]} ↔ ${names[0][i]}${names[0][j]}`], [`${names[1][i]}${names[1][j]} = ${names[0][i]}${names[0][j]} = ${s[k]} cm`]);
        }),
        matchT('rules', 'Match the given information with the congruence rule', [
          ['AB = PQ, BC = QR, CA = RP', 'SSS'],
          ['AB = PQ, ∠B = ∠Q, BC = QR', 'SAS'],
          ['∠A = ∠P, AB = PQ, ∠B = ∠Q', 'ASA'],
          ['∠B = ∠Q = 90°, AC = PR, AB = PQ', 'RHS'],
        ], ['Look at whether the angle lies between the given sides.'], 3),
        bank('cong-facts', [
          { q: 'Which is NOT a valid congruence rule?', a: 'AAA', w: ['SSS', 'SAS', 'RHS'], h: ['Same angles, different sizes?'], s: ['AAA gives similar triangles, not necessarily congruent ones.'] },
          { q: 'Congruent figures have:', a: 'the same shape and the same size', w: ['the same shape only', 'the same area only', 'the same perimeter only'], h: ['One fits exactly on the other.'], s: ['Same shape and size.'] },
          { q: 'If △ABC ≅ △DEF, then BC equals:', a: 'EF', w: ['DE', 'DF', 'AB'], h: ['B ↔ E, C ↔ F'], s: ['BC ↔ EF.'] },
          { q: 'Two squares are congruent if:', a: 'their sides are equal', w: ['their angles are equal', 'they are both squares', 'their diagonals are perpendicular'], h: ['All squares have 90° angles.'], s: ['One side fixes a square.'] },
          { q: 'Two circles are congruent if they have equal:', a: 'radii', w: ['centres', 'colours', 'chords'], h: ['Size of a circle.'], s: ['Equal radii → same size.'] },
          { q: 'SAS needs the angle to be:', a: 'between the two given sides', w: ['opposite the longer side', 'a right angle', 'any angle'], h: ['"Included" angle.'], s: ['The angle must be formed by the two sides.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.geo.dilation', title: 'Dilations and similar figures', prereqs: ['ts8.m.geo.congruent'],
      intro: [
        h('Zoom in, zoom out'),
        p('When you zoom a photo on a phone, everything gets bigger but nothing changes shape. That is a dilation. The result is similar to the original: same shape, different size.'),
        def('Dilation', 'A transformation that enlarges or reduces a figure from a fixed point (the centre of dilation) by a scale factor k.'),
        def('Similar figures', 'Figures with the same shape: corresponding angles equal and corresponding sides in the same ratio.'),
        keys('k > 1: enlargement.', '0 < k < 1: reduction.', 'k = 1: congruent copy.', 'From the origin, (x, y) goes to (kx, ky).'),
        f('Image length = k × original length;  image area = k² × original area', 'image length equals k times original'),
        X({
          title: 'What if? Scale factor', formula: 'A′ = k² × A',
          result: ['A2', 'Area of image', 'k^2*A', 'cm²', 2],
          vars: [['k', 'Scale factor k', 0.25, 4, 0.25, 2], ['A', 'Original area A', 1, 100, 1, 12, 'cm²']],
          notes: [['k', 'Doubling k makes every length double, so the area becomes 4 times bigger.', 'Halving k makes the area a quarter.']],
          mistakes: [['Thinking area doubles when lengths double', 'Area grows with BOTH length and breadth: 2 × 2 = 4 times.'], ['Thinking k = 1/2 is an enlargement', 'k between 0 and 1 shrinks the figure.']],
          real: 'A 5 cm × 3 cm photo enlarged by k = 3 becomes 15 cm × 9 cm and covers 9 times the area.',
        }),
        remember('All congruent figures are similar, but not all similar figures are congruent.'),
      ],
      examples: [
        ex('A triangle with sides 3, 4, 5 cm is dilated by k = 2.5. Find the new sides.', ['3 × 2.5 = 7.5', '4 × 2.5 = 10', '5 × 2.5 = 12.5'], '7.5 cm, 10 cm, 12.5 cm'),
        ex('A point (4, −6) is dilated from the origin with k = 1/2. Find its image.', ['(4 × 1/2, −6 × 1/2)'], '(2, −3)'),
      ],
      practice: [
        tp('image-len', (r) => {
          const L0 = r.int(2, 15), k = r.pick([0.5, 1.5, 2, 2.5, 3, 4]);
          return typed(`A side of ${L0} cm is dilated with scale factor ${k}. What is the length of its image?`, num(L0 * k, 'cm'),
            ['Multiply by the scale factor.'], [`${L0} × ${k} = ${L0 * k} cm`], L0 + k !== L0 * k ? [[String(L0 + k), 'Dilation MULTIPLIES lengths by k; it does not add.']] : []);
        }),
        tp('factor', (r) => {
          const L0 = r.int(2, 12), k = r.pick([2, 3, 4, 5, 0.5]);
          return typed(`A line segment of ${L0} cm becomes ${L0 * k} cm after a dilation. What is the scale factor?`, num(k),
            ['k = image length ÷ original length.'], [`k = ${L0 * k} ÷ ${L0} = ${k}`, k > 1 ? 'k > 1: enlargement.' : 'k < 1: reduction.'],
            [[String(rd(1 / k, 4)), 'Divide the IMAGE length by the ORIGINAL length.']]);
        }),
        tp('area', (r) => {
          const A = r.int(3, 20), k = r.pick([2, 3, 4, 0.5]);
          return typed(`A figure of area ${A} cm² is dilated with scale factor ${k}. What is the area of the image?`, num(A * k * k, 'cm²'),
            ['Area scales by k², not k.'], [`${A} × ${k}² = ${A} × ${k * k} = ${A * k * k} cm²`],
            [[String(A * k), 'Lengths scale by k, so areas scale by k × k.']]);
        }, 2),
        tp('point', (r) => {
          const x = r.int(-6, 6) * 2, y = r.int(-6, 6) * 2, k = r.pick([0.5, 2, 3]);
          const which = r.pick(['x', 'y']);
          return typed(`The point (${n_(x)}, ${n_(y)}) is dilated from the origin with scale factor ${k}. What is the ${which}-coordinate of the image?`, num((which === 'x' ? x : y) * k),
            ['From the origin, multiply both coordinates by k.'], [`Image = (${n_(x * k)}, ${n_(y * k)})`]);
        }),
        bank('dil-facts', [
          { q: 'A dilation with scale factor 1/3 is a(n):', a: 'reduction', w: ['enlargement', 'reflection', 'congruent copy'], h: ['k < 1'], s: ['0 < k < 1 shrinks the figure.'] },
          { q: 'Under a dilation, angles:', a: 'stay the same', w: ['double', 'are multiplied by k', 'become right angles'], h: ['Shape is kept.'], s: ['Similar figures have equal corresponding angles.'] },
          { q: 'Which pair is always similar?', a: 'Any two circles', w: ['Any two rectangles', 'Any two triangles', 'Any two rhombuses'], h: ['Which shape has only one "shape"?'], s: ['Every circle is a scaled copy of every other.'] },
          { q: 'A map uses scale 1 : 50,000. This is a dilation with k equal to:', a: '1/50000', w: ['50000', '1/5000', '5000'], h: ['Map is a reduction.'], s: ['Lengths are multiplied by 1/50000.'] },
          { q: 'If lengths are tripled, volume of a solid becomes:', a: '27 times', w: ['3 times', '9 times', '6 times'], h: ['k³'], s: ['3 × 3 × 3 = 27.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.geo.symmetry', title: 'Line and rotational symmetry', prereqs: ['ts8.m.geo.congruent'],
      intro: [
        h('Patterns that repeat'),
        p('Fold a rangoli design along a line and the two halves match — that is line symmetry. Turn a ceiling fan by a third of a turn and it looks the same — that is rotational symmetry.'),
        def('Line of symmetry', 'A line that divides a figure into two mirror-image halves.'),
        def('Rotational symmetry', 'A figure has rotational symmetry if it looks the same after a turn of less than 360° about its centre. The number of times it fits onto itself in one full turn is its ORDER.'),
        p('A regular polygon with n sides has n lines of symmetry and rotational symmetry of order n. The smallest angle of rotation is 360° ÷ n.'),
        f('Angle of rotation = 360° ÷ order', 'angle equals 360 over order'),
        X({
          title: 'What if? Regular polygons', formula: 'θ = 360°/n',
          result: ['θ', 'Smallest angle of rotation', '360/n', '°', 2],
          vars: [['n', 'Number of sides (order) n', 2, 20, 1, 6]],
          notes: [['n', 'More sides means the figure matches itself more often, so each turn is smaller.', 'Fewer sides means bigger turns between matches.']],
          mistakes: [['Saying a rectangle has 4 lines of symmetry', 'Only 2: the diagonals of a non-square rectangle are NOT lines of symmetry.'], ['Counting order 0 for no rotational symmetry', 'Every figure fits itself after 360°, so the smallest order is 1.']],
          real: 'A three-blade ceiling fan has order 3: it looks the same every 120°.',
        }),
        keys('Regular n-gon: n lines, order n.', 'Circle: infinitely many lines of symmetry.', 'Order 1 means no real rotational symmetry.'),
        remember('Figures can have line symmetry without rotational symmetry (letter A) and rotational without line symmetry (letter S, letter Z).'),
      ],
      examples: [
        ex('How many lines of symmetry does a regular hexagon have?', ['Regular n-gon has n lines.'], '6'),
        ex('A figure looks the same after every 45° turn. What is its order of rotational symmetry?', ['360 ÷ 45 = 8'], '8'),
      ],
      practice: [
        tp('lines', (r) => {
          const [nm2, n] = r.pick([['equilateral triangle', 3], ['square', 4], ['regular pentagon', 5], ['regular hexagon', 6], ['regular octagon', 8], ['regular decagon', 10]] as [string, number][]);
          const what = r.pick(['lines of symmetry', 'order of rotational symmetry']);
          return typed(`What is the number of ${what} of a ${nm2}?`, num(n), ['For a regular polygon both equal the number of sides.'], [`A ${nm2} has ${n} sides → ${n}.`]);
        }),
        tp('angle', (r) => {
          const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
          return typed(`What is the smallest angle of rotational symmetry of a regular polygon with ${n} sides?`, num(360 / n, '°'),
            ['Angle = 360° ÷ order.'], [`360 ÷ ${n} = ${360 / n}°`]);
        }),
        tp('order', (r) => {
          const a = r.pick([30, 36, 40, 45, 60, 72, 90, 120, 180]);
          return typed(`A design looks the same after every turn of ${a}°. What is its order of rotational symmetry?`, num(360 / a),
            ['Order = 360° ÷ smallest angle.'], [`360 ÷ ${a} = ${360 / a}`]);
        }),
        tp('letters', (r) => {
          const yes = ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'], no = ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z', 'Q'];
          const pick = [...r.shuffle(yes).slice(0, 3).map((label) => ({ label, ok: true })), ...r.shuffle(no).slice(0, 3).map((label) => ({ label, ok: false }))];
          return { type: 'tap', prompt: 'Tap every capital letter that has a VERTICAL line of symmetry.', ...tapAll(r, pick), hints: ['Imagine a mirror standing up in the middle of the letter.'], solution: [`Vertical symmetry: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
        }),
        bank('sym-facts', [
          { q: 'How many lines of symmetry does a non-square rectangle have?', a: '2', w: ['4', '1', '0'], h: ['Diagonals do not work.'], s: ['Only the two lines through midpoints of opposite sides.'] },
          { q: 'The letter S has:', a: 'rotational symmetry of order 2 but no line symmetry', w: ['two lines of symmetry', 'one line of symmetry', 'no symmetry at all'], h: ['Turn it upside down.'], s: ['S looks the same after 180°, but no mirror line works.'] },
          { q: 'A circle has how many lines of symmetry?', a: 'Infinitely many', w: ['1', '2', '360'], h: ['Every diameter.'], s: ['Every diameter is a line of symmetry.'] },
          { q: 'A parallelogram (not a rectangle or rhombus) has rotational symmetry of order:', a: '2', w: ['4', '1', '0'], h: ['Turn by 180°.'], s: ['It fits after 180° and 360°.'] },
          { q: 'An isosceles (non-equilateral) triangle has how many lines of symmetry?', a: '1', w: ['2', '3', '0'], h: ['Only through the apex.'], s: ['The line from the apex to the midpoint of the base.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9 AREA OF PLANE FIGURES
const ch9: USpec = {
  id: 'ts8.m.ch9', subject: 'math', title: 'Area of Plane Figures', source: src(9),
  objectives: [
    {
      id: 'ts8.m.area.quad', title: 'Area of trapezium, quadrilateral, rhombus and polygon; surveying a field',
      intro: [
        h('Fields are rarely rectangles'),
        p('A farmer near Nalgonda owns a plot shaped like a trapezium. To know how much seed to buy, she needs its area. The trick for most shapes: cut them into triangles, rectangles and trapeziums whose areas we know.'),
        def('Trapezium', 'A quadrilateral with one pair of parallel sides. The distance between the parallel sides is its height.'),
        f('Area of trapezium = ½ × h × (a + b)', 'half times height times sum of parallel sides'),
        X({
          title: 'What if? Trapezium area', formula: 'A = ½ h (a + b)',
          result: ['A', 'Area', '0.5*h*(a + b)', 'm²', 2],
          vars: [['a', 'Parallel side a', 1, 50, 1, 12, 'm'], ['b', 'Parallel side b', 1, 50, 1, 8, 'm'], ['h', 'Height h', 1, 30, 1, 6, 'm']],
          notes: [['h', 'Doubling the height doubles the area.', 'A shorter height means a thinner strip of land.']],
          mistakes: [['Using a slanting side as the height', 'The height is the PERPENDICULAR distance between the parallel sides.'], ['Forgetting the ½', 'A trapezium is half of a parallelogram made from two copies.']],
          real: 'A trapezium-shaped field with parallel sides 12 m and 8 m, 6 m apart, has area 60 m².',
        }),
        f('Area of quadrilateral = ½ × d × (h₁ + h₂)', 'half times diagonal times sum of perpendiculars'),
        X({
          title: 'What if? Quadrilateral with a diagonal', formula: 'A = ½ d (h₁ + h₂)',
          result: ['A', 'Area', '0.5*d*(p + q)', 'cm²', 2],
          vars: [['d', 'Diagonal d', 1, 40, 1, 10, 'cm'], ['p', 'Perpendicular h₁', 1, 20, 0.5, 4, 'cm'], ['q', 'Perpendicular h₂', 1, 20, 0.5, 3, 'cm']],
          notes: [['d', 'Both triangles get a longer base, so the total area grows in proportion.', 'A shorter diagonal shrinks both triangles.']],
          mistakes: [['Multiplying h₁ × h₂', 'The two triangles share the base d: add their heights.']],
          real: 'Surveyors split an odd-shaped plot along its longest diagonal and measure offsets to the other corners.',
        }),
        f('Area of rhombus = ½ × d₁ × d₂', 'half the product of the diagonals'),
        X({
          title: 'What if? Rhombus area', formula: 'A = ½ d₁ d₂',
          result: ['A', 'Area', '0.5*p*q', 'cm²', 2],
          vars: [['p', 'Diagonal d₁', 1, 40, 1, 10, 'cm'], ['q', 'Diagonal d₂', 1, 40, 1, 8, 'cm']],
          notes: [['p', 'Area is directly proportional to each diagonal.', 'Halving a diagonal halves the area.']],
          mistakes: [['d₁ × d₂ without the ½', 'The rhombus fills exactly half of the rectangle with sides d₁ and d₂.']],
          real: 'A rhombus-shaped tile with diagonals 30 cm and 16 cm covers 240 cm².',
        }),
        h('Surveying a field'),
        p('A surveyor draws a base line (say AB) across the field and measures perpendicular offsets to each corner. The field splits into right triangles and trapeziums; add their areas.'),
        keys('Trapezium: ½h(a + b).', 'General quadrilateral: ½d(h₁ + h₂).', 'Rhombus: ½d₁d₂.', 'Polygon: split into triangles and trapeziums.'),
        remember('Always use perpendicular heights and the same units throughout.'),
      ],
      examples: [
        ex('A trapezium has parallel sides 15 cm and 9 cm and height 8 cm. Find its area.', ['½ × 8 × (15 + 9)', '= 4 × 24 = 96'], '96 cm²'),
        ex('A quadrilateral has diagonal 20 m and offsets 7 m and 5 m. Find its area.', ['½ × 20 × (7 + 5)', '= 10 × 12 = 120'], '120 m²'),
        ex('A field: base line 100 m. Offsets of 30 m at the 20 m mark and 40 m at the 70 m mark on one side form a right triangle (0–20), trapezium (20–70) and right triangle (70–100). Find the area on that side.', ['△: ½ × 20 × 30 = 300', 'Trapezium: ½ × 50 × (30 + 40) = 1750', '△: ½ × 30 × 40 = 600', 'Total = 2650'], '2650 m²'),
      ],
      practice: [
        tp('trap', (r) => {
          const a = r.int(5, 30), b = r.int(4, 25), hh = r.int(2, 12) * 2;
          return typed(`Find the area of a trapezium with parallel sides ${a} cm and ${b} cm and height ${hh} cm.`, num(hh * (a + b) / 2, 'cm²'),
            ['A = ½ × h × (a + b).', `Add the parallel sides first: ${a + b}.`], [`½ × ${hh} × ${a + b} = ${hh * (a + b) / 2} cm²`],
            [[String(hh * (a + b)), 'Remember the ½.']]);
        }),
        tp('trap-h', (r) => {
          const a = r.int(5, 30), b = r.int(4, 25), hh = r.int(2, 15);
          const A = hh * (a + b) / 2;
          return typed(`The area of a trapezium is ${A} m². Its parallel sides are ${a} m and ${b} m. Find its height.`, num(hh, 'm'),
            ['A = ½ h (a + b), so h = 2A ÷ (a + b).'], [`h = 2 × ${A} ÷ ${a + b} = ${hh} m`],
            [[String(rd(A / (a + b), 2)), 'Do not forget to double the area (undo the ½).']], { steps: [st('What is 2 × area?', num(2 * A)), st('Height?', num(hh, 'm'))] });
        }, 2),
        tp('quad', (r) => {
          const d = r.int(4, 30) * 2, p1 = r.int(2, 15), q1 = r.int(2, 15);
          return typed(`A quadrilateral has a diagonal of ${d} cm. The perpendiculars from the other two vertices to this diagonal are ${p1} cm and ${q1} cm. Find its area.`, num(d * (p1 + q1) / 2, 'cm²'),
            ['A = ½ × d × (h₁ + h₂).'], [`½ × ${d} × (${p1} + ${q1}) = ${d * (p1 + q1) / 2} cm²`],
            p1 * q1 !== p1 + q1 ? [[String(d * p1 * q1 / 2), 'Add the two perpendiculars; do not multiply them.']] : []);
        }),
        tp('rhombus', (r) => {
          const p1 = r.int(3, 20) * 2, q1 = r.int(3, 20);
          return typed(`Find the area of a rhombus whose diagonals are ${p1} cm and ${q1} cm.`, num(p1 * q1 / 2, 'cm²'),
            ['A = ½ × d₁ × d₂.'], [`½ × ${p1} × ${q1} = ${p1 * q1 / 2} cm²`], [[String(p1 * q1), 'Half of the product.']]);
        }),
        tp('survey', (r) => {
          const AB = r.pick([80, 100, 120]), x1 = r.int(2, 3) * 10, x2 = x1 + r.int(2, 4) * 10, o1 = r.int(2, 6) * 5, o2 = r.int(2, 6) * 5;
          const t1 = x1 * o1 / 2, tz = (x2 - x1) * (o1 + o2) / 2, t2 = (AB - x2) * o2 / 2;
          return typed(`Surveying a field along a ${AB} m base line from A: an offset of ${o1} m at ${x1} m and an offset of ${o2} m at ${x2} m, on the same side. The boundary goes A → first offset end → second offset end → B. Find the area of this part of the field.`, num(t1 + tz + t2, 'm²'),
            ['Split into a right triangle, a trapezium and another right triangle.', `Triangle 1: base ${x1}, height ${o1}. Trapezium: width ${x2 - x1}, sides ${o1} and ${o2}. Triangle 2: base ${AB - x2}, height ${o2}.`],
            [`Triangle 1 = ½ × ${x1} × ${o1} = ${t1}`, `Trapezium = ½ × ${x2 - x1} × (${o1} + ${o2}) = ${tz}`, `Triangle 2 = ½ × ${AB - x2} × ${o2} = ${t2}`, `Total = ${t1 + tz + t2} m²`]);
        }, 3),
      ],
    },
    {
      id: 'ts8.m.area.circle', title: 'Area of a circle and a circular path (ring)', prereqs: ['ts8.m.area.quad'],
      intro: [
        h('Round shapes'),
        p('Cut a pizza into many thin slices and lay them alternately point-up and point-down. They form a shape close to a rectangle: its length is half the circumference (πr) and its height is the radius r. So the area of a circle is πr × r = πr².'),
        f('Area of circle = πr²;  circumference = 2πr', 'pi r squared; two pi r'),
        X({
          title: 'What if? Circle area', formula: 'A = πr²',
          result: ['A', 'Area', 'pi*r^2', 'cm²', 2],
          vars: [['r', 'Radius r', 1, 50, 1, 7, 'cm']],
          notes: [['r', 'Double the radius and the area becomes 4 times bigger.', 'Half the radius gives a quarter of the area.']],
          mistakes: [['Using the diameter in πr²', 'Halve the diameter first to get r.'], ['Mixing up 2πr and πr²', '2πr is the distance around (cm); πr² is the space inside (cm²).']],
          real: 'A pizza of radius 14 cm has about 616 cm² — four times a 7 cm pizza, not twice!',
        }),
        h('Circular path (ring)'),
        p('A path around a circular pond is the big circle minus the small one. If the outer radius is R and inner radius r (R = r + width of path):'),
        f('Area of ring = π(R² − r²) = π(R + r)(R − r)', 'pi times R squared minus r squared'),
        X({
          title: 'What if? Ring area', formula: 'A = π(R² − r²)',
          result: ['A', 'Area of path', 'pi*(R^2 - r^2)', 'm²', 2],
          vars: [['R', 'Outer radius R', 15, 40, 1, 21, 'm'], ['r', 'Inner radius r', 1, 14, 1, 14, 'm']],
          notes: [['r', 'A bigger pond (with the same outer edge) leaves a thinner path.', 'A smaller pond leaves more path.']],
          mistakes: [['π(R − r)²', 'That is the area of a small circle with radius = path width. Use R² − r².']],
          real: 'A 7 m-wide walking track around a circular lake of radius 14 m covers π(21² − 14²) = 770 m².',
        }),
        keys('Use π = 22/7 when the radius is a multiple of 7.', 'Ring area = outer − inner.', 'R = r + width.'),
        remember('Area units are squared (cm², m²); length units are not.'),
      ],
      examples: [
        ex('Find the area of a circle of radius 21 cm (π = 22/7).', ['22/7 × 21 × 21', '= 22 × 3 × 21 = 1386'], '1386 cm²'),
        ex('A circular garden of radius 14 m has a 7 m wide path around it. Find the area of the path.', ['R = 21, r = 14', 'π(441 − 196) = 22/7 × 245 = 770'], '770 m²'),
      ],
      practice: [
        tp('area', (r) => {
          const rr = 7 * r.int(1, 6), dia = r.int(0, 1) === 1;
          return typed(`Find the area of a circle with ${dia ? `diameter ${2 * rr}` : `radius ${rr}`} cm. (Use π = 22/7.)`, num(22 * rr * rr / 7, 'cm²'),
            [dia ? `Radius = ${2 * rr} ÷ 2 = ${rr}.` : 'A = πr².', `22/7 × ${rr} × ${rr}`], [`A = 22/7 × ${rr}² = ${22 * rr * rr / 7} cm²`],
            rr === 2 ? [] : [[String(44 * rr / 7), 'That is the circumference 2πr. Area is πr².'], [String(22 * 4 * rr * rr / 7), 'You used the diameter as the radius.']]);
        }),
        tp('circ', (r) => {
          const rr = 7 * r.int(1, 8);
          return typed(`A circular park has radius ${rr} m. How long is a walk once around its edge? (π = 22/7)`, num(44 * rr / 7, 'm'),
            ['Circumference = 2πr.'], [`2 × 22/7 × ${rr} = ${44 * rr / 7} m`], [[String(22 * rr * rr / 7), 'That is the area. Distance around is 2πr.']]);
        }),
        tp('ring', (r) => {
          const rr = 7 * r.int(1, 4), w = 7 * r.int(1, 2), R = rr + w;
          return typed(`A circular pond of radius ${rr} m has a path ${w} m wide all around it. Find the area of the path. (π = 22/7)`, num(22 * (R * R - rr * rr) / 7, 'm²'),
            [`Outer radius R = ${rr} + ${w} = ${R}.`, 'Area = π(R² − r²).'],
            [`R² − r² = ${R * R} − ${rr * rr} = ${R * R - rr * rr}`, `Area = 22/7 × ${R * R - rr * rr} = ${22 * (R * R - rr * rr) / 7} m²`],
            [[String(22 * w * w / 7), 'π × width² is a small circle, not the path. Subtract the inner circle from the outer.']], { steps: [st('Outer radius R?', num(R, 'm')), st('Area of the path?', num(22 * (R * R - rr * rr) / 7, 'm²'))] });
        }, 2),
        tp('radius-from-c', (r) => {
          const rr = 7 * r.int(1, 10);
          return typed(`The circumference of a circular wheel is ${44 * rr / 7} cm. Find its radius. (π = 22/7)`, num(rr, 'cm'),
            ['C = 2πr, so r = C ÷ (2π).'], [`r = ${44 * rr / 7} × 7/44 = ${rr} cm`]);
        }, 2),
        bank('circle-facts', [
          { q: 'If the radius of a circle is doubled, its area becomes:', a: '4 times', w: ['2 times', '8 times', 'the same'], h: ['r²'], s: ['(2r)² = 4r².'] },
          { q: 'Area of a semicircle of radius r is:', a: 'πr²/2', w: ['2πr', 'πr', 'πr²'], h: ['Half a circle.'], s: ['Half of πr².'] },
          { q: 'A path of width w around a circle of radius r has outer radius:', a: 'r + w', w: ['r − w', 'w', '2r + w'], h: ['The path is outside.'], s: ['R = r + w.'] },
          { q: 'Which is the correct unit for area of a circle in cm?', a: 'cm²', w: ['cm', 'cm³', 'no unit'], h: ['Area covers a surface.'], s: ['Area is in square units.'] },
          { q: 'Area of a quarter circle of radius 14 cm is (π = 22/7):', a: '154 cm²', w: ['616 cm²', '44 cm²', '308 cm²'], h: ['πr²/4'], s: ['616 ÷ 4 = 154 cm².'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.area.sector', title: 'Length of an arc and area of a sector', prereqs: ['ts8.m.area.circle'],
      intro: [
        h('A slice of the circle'),
        p('Cut a cake from the centre with two straight cuts. The curved edge of the slice is an arc; the slice itself is a sector. If the angle at the centre is θ, the slice is θ/360 of the whole cake.'),
        def('Sector', 'The region between two radii and the arc joining their ends.'),
        f('Arc length l = (θ/360°) × 2πr', 'theta over 360 times 2 pi r'),
        X({
          title: 'What if? Arc length', formula: 'l = (θ/360) × 2πr',
          result: ['l', 'Arc length', 'theta/360*2*pi*r', 'cm', 2],
          vars: [['theta', 'Angle θ', 10, 360, 5, 60, '°'], ['r', 'Radius r', 1, 30, 1, 7, 'cm']],
          notes: [['theta', 'A wider angle takes a bigger share of the circumference.', 'A narrower angle takes a smaller share.']],
          mistakes: [['Using πr² for arc length', 'Arc length is part of the CIRCUMFERENCE, 2πr.']],
          real: 'The tip of a 14 cm clock hand moving through 90° travels 22 cm.',
        }),
        f('Area of sector A = (θ/360°) × πr²', 'theta over 360 times pi r squared'),
        X({
          title: 'What if? Sector area', formula: 'A = (θ/360) × πr²',
          result: ['A', 'Area of sector', 'theta/360*pi*r^2', 'cm²', 2],
          vars: [['theta', 'Angle θ', 10, 360, 5, 90, '°'], ['r', 'Radius r', 1, 30, 1, 14, 'cm']],
          notes: [['r', 'Doubling the radius makes the sector 4 times bigger.', 'Halving the radius gives a quarter of the area.']],
          mistakes: [['Dividing by 180 instead of 360', 'A full circle is 360°.']],
          real: 'A fan-shaped hand fan opening through 120° with 21 cm ribs has area 462 cm².',
        }),
        keys('Fraction of the circle = θ/360.', 'Arc = fraction × circumference.', 'Sector = fraction × area.'),
        remember('Perimeter of a sector = arc length + 2r.'),
      ],
      examples: [
        ex('Find the arc length of a sector with angle 60° and radius 21 cm (π = 22/7).', ['60/360 = 1/6', '1/6 × 2 × 22/7 × 21 = 22'], '22 cm'),
        ex('Find the area of a sector with angle 90° and radius 14 cm.', ['90/360 = 1/4', '1/4 × 22/7 × 196 = 154'], '154 cm²'),
      ],
      practice: [
        tp('arc', (r) => {
          const th = r.pick([30, 45, 60, 90, 120, 180, 270]), rr = 7 * r.int(1, 6);
          const v = rd(th / 360 * 2 * PI7 * rr, 2);
          return typed(`Find the length of the arc of a sector with angle ${th}° and radius ${rr} cm. (π = 22/7; round to 2 decimal places if needed.)`, approx(v, 0.002, 'cm'),
            [`Fraction of the circle = ${th}/360 = ${fx(th, 360)}.`, `Circumference = 2 × 22/7 × ${rr} = ${44 * rr / 7}.`],
            [`l = ${fx(th, 360)} × ${44 * rr / 7} = ${v} cm`],
            [[String(rd(th / 360 * PI7 * rr * rr, 2)), 'That is the sector AREA. Arc length uses 2πr.']]);
        }),
        tp('sector', (r) => {
          const th = r.pick([30, 45, 60, 90, 120, 180, 270]), rr = 7 * r.int(1, 6);
          const v = rd(th / 360 * PI7 * rr * rr, 2);
          return typed(`Find the area of a sector with angle ${th}° and radius ${rr} cm. (π = 22/7; round to 2 decimal places if needed.)`, approx(v, 0.002, 'cm²'),
            [`Fraction = ${fx(th, 360)}.`, `Circle area = 22/7 × ${rr}² = ${22 * rr * rr / 7}.`],
            [`A = ${fx(th, 360)} × ${22 * rr * rr / 7} = ${v} cm²`],
            [[String(rd(th / 360 * 2 * PI7 * rr, 2)), 'That is the arc length. Area uses πr².']]);
        }),
        tp('perim', (r) => {
          const th = r.pick([90, 180, 60]), rr = 7 * r.int(1, 4) * (th === 60 ? 3 : 1);
          const l = th / 360 * 2 * PI7 * rr;
          return typed(`Find the perimeter of a sector of angle ${th}° and radius ${rr} cm. (π = 22/7)`, approx(rd(l + 2 * rr, 2), 0.002, 'cm'),
            ['Perimeter = arc + two radii.', `Arc = ${fx(th, 360)} × 2πr.`], [`Arc = ${rd(l, 2)}`, `Perimeter = ${rd(l, 2)} + 2 × ${rr} = ${rd(l + 2 * rr, 2)} cm`],
            [[String(rd(l, 2)), 'Add the two straight edges (radii) as well.']]);
        }, 2),
        tp('angle', (r) => {
          const th = r.pick([30, 45, 60, 90, 120, 180]), rr = 7 * r.pick([1, 2, 3]);
          const A = th / 360 * PI7 * rr * rr;
          return typed(`A sector of a circle of radius ${rr} cm has area ${rd(A, 2)} cm². Find its angle θ. (π = 22/7)`, num(th, '°', false, 0.5),
            ['θ/360 = sector area ÷ circle area.'], [`Circle area = ${rd(PI7 * rr * rr, 2)}`, `θ = ${rd(A, 2)} ÷ ${rd(PI7 * rr * rr, 2)} × 360 = ${th}°`]);
        }, 3),
        bank('sector-facts', [
          { q: 'A sector with angle 180° is a:', a: 'semicircle', w: ['quadrant', 'full circle', 'segment'], h: ['Half of 360°.'], s: ['180° is half the circle.'] },
          { q: 'A quadrant has central angle:', a: '90°', w: ['45°', '180°', '60°'], h: ['Quarter circle.'], s: ['360 ÷ 4 = 90°.'] },
          { q: 'The minute hand of a clock moves through how many degrees in 15 minutes?', a: '90°', w: ['15°', '60°', '180°'], h: ['60 minutes = 360°.'], s: ['15/60 × 360 = 90°.'] },
          { q: 'If the angle of a sector is doubled (same radius), its area:', a: 'doubles', w: ['becomes 4 times', 'halves', 'stays the same'], h: ['A is proportional to θ.'], s: ['A = θ/360 × πr².'] },
          { q: 'Perimeter of a sector is:', a: 'arc length + 2r', w: ['arc length only', '2πr', 'arc length + r'], h: ['Walk around the slice.'], s: ['Curved edge plus two radii.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 10 DIRECT AND INVERSE PROPORTIONS
const ch10: USpec = {
  id: 'ts8.m.ch10', subject: 'math', title: 'Direct and Inverse Proportions', source: src(10),
  objectives: [
    {
      id: 'ts8.m.prop.direct', title: 'Direct proportion',
      intro: [
        h('More of one, more of the other — at the same rate'),
        p('If 1 kg of tomatoes costs ₹40, then 2 kg cost ₹80 and 5 kg cost ₹200. As the weight doubles, the cost doubles. The ratio cost ÷ weight stays fixed at 40. This is direct proportion.'),
        def('Direct proportion', 'x and y are in direct proportion if y/x = k (a constant) for every pair of values. Then x₁/y₁ = x₂/y₂.'),
        f('y = kx   (y/x = k)', 'y equals k x'),
        X({
          title: 'What if? Direct proportion', formula: 'y = k × x',
          result: ['y', 'y', 'k*x', '', 2],
          vars: [['k', 'Constant k (rate)', 1, 100, 1, 40], ['x', 'Quantity x', 0, 20, 0.5, 3]],
          notes: [['x', 'y rises in exactly the same proportion as x.', 'y falls in exactly the same proportion as x.']],
          mistakes: [['Thinking any increase-increase relation is direct proportion', 'Age and height both increase, but height ÷ age is not constant — not direct proportion.']],
          real: 'Petrol at ₹105 per litre: 10 litres cost ₹1,050, 20 litres cost ₹2,100.',
        }),
        keys('Check: is y ÷ x the same for every pair?', 'Unitary method: find the value for 1, then multiply.', 'Map scales, recipes, wages and distance at a fixed speed are direct.'),
        remember('In direct proportion x₁/y₁ = x₂/y₂ — cross-multiply to find the missing value.'),
      ],
      examples: [
        ex('12 notebooks cost ₹420. What do 20 cost?', ['1 notebook = 420 ÷ 12 = ₹35', '20 notebooks = 20 × 35 = ₹700'], '₹700'),
        ex('On a map, 1 cm represents 5 km. Two towns are 7.5 cm apart on the map. Find the real distance.', ['7.5 × 5', '= 37.5 km'], '37.5 km'),
      ],
      practice: [
        tp('unitary', (r) => {
          const u = r.int(5, 60), a = r.int(3, 15);
          let b = r.int(4, 25); if (b === a) b += 1;
          const it = r.pick(['pens', 'notebooks', 'bangles', 'mangoes', 'tiles']);
          return typed(`${a} ${it} cost ${inr(a * u)}. What is the cost of ${b} ${it} (in ₹)?`, num(b * u, '₹'),
            ['Find the cost of one first.', `1 costs ${a * u} ÷ ${a}.`], [`1 costs ₹${u}`, `${b} cost ${b} × ${u} = ${inr(b * u)}`],
            [[String(rd(a * u * a / b, 2)), 'More items cost MORE — this is direct proportion.']]);
        }),
        tp('table', (r) => {
          const k = r.int(2, 9), xs = r.shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 3);
          const miss = r.int(0, 2);
          const cells = xs.map((x, i) => (i === miss ? `(${x}, ?)` : `(${x}, ${k * x})`)).join(', ');
          return typed(`x and y are in direct proportion. Pairs (x, y): ${cells}. Find the missing y.`, num(k * xs[miss]),
            ['Find k = y ÷ x from a complete pair.'], [`k = ${k}`, `y = ${k} × ${xs[miss]} = ${k * xs[miss]}`]);
        }),
        tp('map', (r) => {
          const s = r.pick([2, 4, 5, 10, 20, 25]), d = r.int(2, 30) / 2;
          return typed(`On a map 1 cm represents ${s} km. Two places are ${d} cm apart on the map. What is the actual distance (km)?`, num(d * s, 'km'),
            ['Multiply map distance by the scale.'], [`${d} × ${s} = ${d * s} km`]);
        }),
        tp('recipe', (r) => {
          const p0 = r.pick([2, 4, 5]), p1 = r.pick([6, 8, 10, 12, 15, 20]), g0 = r.int(1, 6) * 50;
          return typed(`A recipe for ${p0} people needs ${g0} g of rice. How much rice is needed for ${p1} people (in g)?`, num(g0 * p1 / p0, 'g'),
            ['Per person = ' + g0 + ' ÷ ' + p0 + '.'], [`${g0} × ${p1}/${p0} = ${g0 * p1 / p0} g`]);
        }),
        bank('direct-or-not', [
          { q: 'Which pair is in direct proportion?', a: 'Number of tickets and total cost', w: ['Speed and time for a fixed distance', 'Workers and days for a fixed job', 'Age and height'], h: ['Ratio stays constant?'], s: ['Cost ÷ tickets = price of one ticket, a constant.'] },
          { q: 'If x and y are in direct proportion and x is halved, then y:', a: 'is halved', w: ['doubles', 'stays the same', 'becomes zero'], h: ['y = kx'], s: ['y changes in the same ratio.'] },
          { q: 'Table x: 2, 4, 6; y: 10, 20, 30. The constant k = y/x is:', a: '5', w: ['10', '2', '1/5'], h: ['10 ÷ 2'], s: ['k = 5.'] },
          { q: 'Is the table x: 1, 2, 3; y: 3, 5, 7 a direct proportion?', a: 'No, y/x is not constant', w: ['Yes, both increase', 'Yes, k = 2', 'Yes, k = 3'], h: ['3/1, 5/2, 7/3'], s: ['The ratios differ, so not direct.'] },
          { q: 'A car uses 5 litres for 60 km. For 180 km it uses:', a: '15 litres', w: ['12 litres', '20 litres', '3 litres'], h: ['180 is 3 × 60.'], s: ['3 × 5 = 15 litres.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.prop.inverse', title: 'Inverse proportion', prereqs: ['ts8.m.prop.direct'],
      intro: [
        h('More of one, LESS of the other'),
        p('Painting a school wall: 4 painters take 6 days. With 8 painters, it takes only 3 days. Doubling the workers halves the time. The product workers × days stays 24.'),
        def('Inverse proportion', 'x and y are in inverse proportion if x × y = k (constant) for every pair. Then x₁y₁ = x₂y₂.'),
        f('x × y = k   (y = k/x)', 'x times y equals k'),
        X({
          title: 'What if? Inverse proportion', formula: 'y = k / x',
          result: ['y', 'y', 'k/x', '', 2],
          vars: [['k', 'Constant k (total work)', 10, 200, 5, 24], ['x', 'Quantity x', 1, 20, 1, 4]],
          notes: [['x', 'y falls: doubling x halves y.', 'y rises: halving x doubles y.']],
          mistakes: [['Thinking any increase-decrease is inverse proportion', 'The PRODUCT must stay constant, not just "one up, one down".'], ['Using the unitary method the direct way', 'More workers → FEWER days: multiply then divide (x₁y₁ = x₂y₂).']],
          real: 'A 120 km trip at 40 km/h takes 3 hours; at 60 km/h it takes 2 hours. Speed × time = 120.',
        }),
        keys('Check: is x × y the same for every pair?', 'Workers–days, speed–time, pipes–time, number of people–days food lasts.'),
        remember('In inverse proportion, x₁ × y₁ = x₂ × y₂.'),
      ],
      examples: [
        ex('6 pipes fill a tank in 80 minutes. How long will 5 pipes take?', ['6 × 80 = 480', '480 ÷ 5 = 96'], '96 minutes'),
        ex('Food in a hostel lasts 30 days for 120 students. How long for 150 students?', ['120 × 30 = 3600', '3600 ÷ 150 = 24'], '24 days'),
      ],
      practice: [
        tp('workers', (r) => {
          const k = r.pick([24, 36, 48, 60, 72, 90, 120]);
          const ds = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15].filter((d) => k % d === 0);
          const w1 = r.pick(ds); let w2 = r.pick(ds); if (w2 === w1) w2 = ds[(ds.indexOf(w1) + 1) % ds.length];
          return typed(`${w1} workers can build a wall in ${k / w1} days. How many days will ${w2} workers take (same speed)?`, num(k / w2),
            ['More workers → fewer days. Total work = workers × days.', `${w1} × ${k / w1} = ${k}`], [`Days = ${k} ÷ ${w2} = ${k / w2}`],
            [[String(rd(k / w1 * w2 / w1, 2)), 'This is inverse proportion — more workers take LESS time.']]);
        }),
        tp('speed', (r) => {
          const D = r.pick([120, 180, 240, 300, 360]);
          const sp = [30, 40, 45, 60, 90, 120].filter((s) => D % s === 0);
          const s1 = r.pick(sp); let s2 = r.pick(sp); if (s2 === s1) s2 = sp[(sp.indexOf(s1) + 1) % sp.length];
          return typed(`A bus travelling at ${s1} km/h takes ${D / s1} hours for a journey. How long will it take at ${s2} km/h?`, num(D / s2, 'h'),
            ['Speed × time = distance (constant).'], [`Distance = ${s1} × ${D / s1} = ${D} km`, `Time = ${D} ÷ ${s2} = ${D / s2} h`]);
        }),
        tp('food', (r) => {
          const k = r.pick([1200, 1800, 2400, 3600]);
          const ns = [40, 50, 60, 80, 100, 120, 150, 200].filter((n) => k % n === 0);
          const n1 = r.pick(ns); let n2 = r.pick(ns); if (n2 === n1) n2 = ns[(ns.indexOf(n1) + 1) % ns.length];
          return typed(`Rice in a hostel lasts ${k / n1} days for ${n1} students. For how many days will it last for ${n2} students?`, num(k / n2),
            ['Students × days = constant.'], [`${n1} × ${k / n1} = ${k}`, `${k} ÷ ${n2} = ${k / n2} days`]);
        }),
        tp('table', (r) => {
          const k = r.pick([24, 36, 48, 60, 72]);
          const ds = [2, 3, 4, 6, 8, 12].filter((d) => k % d === 0);
          const xs = r.shuffle(ds).slice(0, 3), miss = r.int(0, 2);
          return typed(`x and y are in inverse proportion. Pairs (x, y): ${xs.map((x, i) => (i === miss ? `(${x}, ?)` : `(${x}, ${k / x})`)).join(', ')}. Find the missing y.`, num(k / xs[miss]),
            ['k = x × y from a complete pair.'], [`k = ${k}`, `y = ${k} ÷ ${xs[miss]} = ${k / xs[miss]}`]);
        }),
        bank('which', [
          { q: 'Which pair is in inverse proportion?', a: 'Number of pipes and time to fill a tank', w: ['Length of cloth and its cost', 'Distance and petrol used', 'Hours worked and wages'], h: ['More pipes, less time.'], s: ['Pipes × time = constant.'] },
          { q: 'If x and y are in inverse proportion and x is tripled, then y:', a: 'becomes one-third', w: ['triples', 'stays the same', 'increases by 3'], h: ['xy = k'], s: ['y = k/(3x).'] },
          { q: 'x: 2, 4, 8 and y: 16, 8, 4 are in:', a: 'inverse proportion (xy = 32)', w: ['direct proportion', 'no proportion', 'direct proportion with k = 8'], h: ['Multiply each pair.'], s: ['2 × 16 = 4 × 8 = 8 × 4 = 32.'] },
          { q: 'Number of sides of a regular polygon and the size of each exterior angle are in:', a: 'inverse proportion', w: ['direct proportion', 'no proportion', 'square proportion'], h: ['n × exterior angle = 360°'], s: ['Product is always 360°.'] },
          { q: 'Is x: 1, 2, 3 and y: 6, 4, 2 an inverse proportion?', a: 'No, x × y is not constant', w: ['Yes, y decreases', 'Yes, k = 6', 'Yes, k = 2'], h: ['6, 8, 6'], s: ['Products differ.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.prop.compound', title: 'Compound proportion', prereqs: ['ts8.m.prop.inverse'],
      intro: [
        h('When three or more things change together'),
        p('A road crew: 10 workers working 8 hours a day finish a road in 12 days. How many days for 15 workers working 6 hours a day? Now two quantities change at once. That is compound proportion.'),
        p('The total work is measured in "worker-hours": workers × hours per day × days. For the same job it stays constant. If the amount of work W changes too, divide by it.'),
        f('M₁D₁H₁/W₁ = M₂D₂H₂/W₂', 'M1 D1 H1 over W1 equals M2 D2 H2 over W2'),
        X({
          title: 'What if? Days needed for a job', formula: 'D₂ = M₁D₁H₁W₂/(M₂H₂W₁)',
          result: ['D2', 'Days needed now', 'M1*D1*H1*W2/(M2*H2*W1)', 'days', 2],
          vars: [['M1', 'Workers before', 1, 40, 1, 10], ['D1', 'Days before', 1, 60, 1, 12], ['H1', 'Hours/day before', 1, 12, 1, 8], ['W1', 'Work before (units)', 1, 10, 1, 1], ['M2', 'Workers now', 1, 40, 1, 15], ['H2', 'Hours/day now', 1, 12, 1, 6], ['W2', 'Work now (units)', 1, 10, 1, 1]],
          notes: [['M2', 'More workers share the job, so fewer days are needed (inverse).', 'Fewer workers need more days.'], ['W2', 'More work needs more days (direct).', 'Less work needs fewer days.']],
          mistakes: [['Treating every quantity as direct', 'Ask for each one: "if this goes up, do days go up or down?"']],
          real: '10 workers × 8 h × 12 days = 960 worker-hours. 15 workers × 6 h a day need 960 ÷ 90 ≈ 10.7 days.',
        }),
        keys('Decide direct or inverse for each quantity separately.', 'Worker-hours (or worker-days) measure the total effort.'),
        remember('Days are inversely proportional to workers and to hours per day, but directly proportional to the amount of work.'),
      ],
      examples: [
        ex('10 workers, 8 h/day, 12 days for a road. 16 workers at 6 h/day take how many days?', ['Effort = 10 × 8 × 12 = 960', 'Per day now = 16 × 6 = 96', '960 ÷ 96 = 10'], '10 days'),
        ex('6 machines make 1200 bags in 5 days. How many bags do 9 machines make in 4 days?', ['Bags per machine-day = 1200 ÷ 30 = 40', '9 × 4 × 40 = 1440'], '1440 bags'),
      ],
      practice: [
        tp('days', (r) => {
          const M1 = r.pick([6, 8, 10, 12, 15]), H1 = r.pick([6, 8, 9]), D2 = r.pick([4, 5, 6, 8, 10]);
          const M2 = r.pick([4, 6, 9, 12, 16, 20]), H2 = r.pick([5, 6, 8, 10]);
          const E = M2 * H2 * D2;
          if (E % (M1 * H1)) return typed('10 workers working 8 hours a day finish a job in 12 days. How many days will 16 workers working 6 hours a day take?', num(10), ['Worker-hours = 960.'], ['960 ÷ 96 = 10 days']);
          const D1 = E / (M1 * H1);
          return typed(`${M1} workers working ${H1} hours a day finish a job in ${D1} days. How many days will ${M2} workers working ${H2} hours a day take for the same job?`, num(D2),
            ['Total effort = workers × hours × days.', `${M1} × ${H1} × ${D1} = ${E}`],
            [`Effort = ${E} worker-hours`, `Per day now = ${M2} × ${H2} = ${M2 * H2}`, `Days = ${E} ÷ ${M2 * H2} = ${D2}`]);
        }, 2),
        tp('output', (r) => {
          const per = r.pick([20, 25, 30, 40, 50]), m1 = r.int(2, 8), d1 = r.int(2, 6), m2 = r.int(2, 10), d2 = r.int(2, 7);
          return typed(`${m1} machines make ${m1 * d1 * per} toys in ${d1} days. How many toys will ${m2} machines make in ${d2} days?`, num(m2 * d2 * per),
            ['Find toys per machine per day.', `${m1 * d1 * per} ÷ (${m1} × ${d1})`], [`Per machine-day = ${per}`, `${m2} × ${d2} × ${per} = ${m2 * d2 * per}`]);
        }, 2),
        tp('workers', (r) => {
          const D1 = r.pick([10, 12, 15, 20]), M1 = r.pick([6, 8, 9, 12]), W = r.pick([2, 3]), D2 = r.pick([5, 6, 8, 10, 12, 15]);
          const need = M1 * D1 * W;
          if (need % D2) return typed('8 workers build 1 wall in 15 days. How many workers are needed to build 2 such walls in 10 days?', num(24), ['Worker-days per wall = 120.'], ['2 walls need 240 worker-days; 240 ÷ 10 = 24 workers']);
          return typed(`${M1} workers build 1 wall in ${D1} days. How many workers are needed to build ${W} such walls in ${D2} days?`, num(need / D2),
            [`One wall needs ${M1} × ${D1} worker-days.`, `${W} walls need ${W} times as much.`], [`${W} × ${M1 * D1} = ${need} worker-days`, `${need} ÷ ${D2} = ${need / D2} workers`]);
        }, 3),
        bank('compound-facts', [
          { q: 'If the number of workers increases (same job, same hours), the number of days:', a: 'decreases', w: ['increases', 'stays the same', 'doubles always'], h: ['More hands.'], s: ['Inverse proportion.'] },
          { q: 'If the amount of work doubles (same workers, same hours), the days needed:', a: 'double', w: ['halve', 'stay the same', 'become four times'], h: ['Direct proportion.'], s: ['Twice the work takes twice the time.'] },
          { q: '5 workers × 8 hours × 6 days equals how many worker-hours?', a: '240', w: ['19', '48', '120'], h: ['Multiply all three.'], s: ['5 × 8 × 6 = 240.'] },
          { q: 'Hours per day and days needed (same workers, same job) are in:', a: 'inverse proportion', w: ['direct proportion', 'no proportion', 'compound interest'], h: ['Longer days, fewer of them.'], s: ['Hours × days is constant.'] },
          { q: 'Compound proportion involves:', a: 'three or more related quantities', w: ['exactly two quantities', 'only money', 'only percentages'], h: ['"Compound" = combined.'], s: ['Several proportions combined.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 11 ALGEBRAIC EXPRESSIONS
/** term c·body for display: (3, 'x²') → 3x², (1, 'x') → x, (−1, 'y') → −y, (5, '') → 5 */
const tm = (c: number, body: string) => (body ? `${cf(c)}${body}` : n_(c));
/** join signed terms: [[3,'x²'],[−2,'x'],[5,'']] → 3x² − 2x + 5 */
const ex_ = (ts: [number, string][]) => {
  const t = ts.filter(([c]) => c !== 0);
  if (!t.length) return '0';
  return t.map(([c, b], i) => (i === 0 ? tm(c, b) : ` ${c < 0 ? '−' : '+'} ${tm(Math.abs(c), b)}`)).join('');
};
/** quadratic x² + px + q */
const quad = (p0: number, q0: number, v = 'x') => ex_([[1, `${v}²`], [p0, v], [q0, '']]);
const ch11: USpec = {
  id: 'ts8.m.ch11', subject: 'math', title: 'Algebraic Expressions', source: src(11),
  objectives: [
    {
      id: 'ts8.m.alg.like', title: 'Like and unlike terms; adding and subtracting expressions',
      intro: [
        h('Apples with apples'),
        p('3 apples + 5 apples = 8 apples, but 3 apples + 5 bananas stays "3 apples + 5 bananas". Algebra works the same way: 3x + 5x = 8x, but 3x + 5y cannot be combined.'),
        def('Term', 'A part of an expression separated by + or −. In 4x² − 3xy + 7 the terms are 4x², −3xy and 7.'),
        def('Coefficient', 'The number multiplying the variables in a term: in −3xy the coefficient is −3.'),
        def('Like terms', 'Terms with exactly the same variables raised to the same powers: 5x²y and −2x²y are like; 5x²y and 5xy² are unlike.'),
        stepsB('Group the like terms together.', 'Add or subtract their coefficients.', 'Keep unlike terms separate.'),
        p('To subtract an expression, change the sign of EVERY term in it and then add: (5x + 3) − (2x − 4) = 5x + 3 − 2x + 4 = 3x + 7.'),
        keys('Only like terms can be combined.', 'Subtracting a bracket flips every sign inside it.', 'Monomial: 1 term; binomial: 2 terms; trinomial: 3 terms.'),
        remember('x and x² are UNLIKE terms — different powers.'),
      ],
      examples: [
        ex('Add 3a² − 4ab + 5 and −a² + 7ab − 9.', ['a²: 3 − 1 = 2', 'ab: −4 + 7 = 3', 'numbers: 5 − 9 = −4'], '2a² + 3ab − 4'),
        ex('Subtract 2x − 3y + 4 from 5x + y − 1.', ['(5x + y − 1) − (2x − 3y + 4)', '= 5x + y − 1 − 2x + 3y − 4', '= 3x + 4y − 5'], '3x + 4y − 5'),
      ],
      practice: [
        tp('coef', (r) => {
          const a = r.int(-9, 9) || 2, b = r.int(-9, 9) || 3, c = r.int(-9, 9) || -4, d = r.int(-9, 9) || 5;
          return typed(`Simplify ${ex_([[a, 'x'], [b, 'y'], [c, 'x'], [d, 'y']])}. What is the coefficient of x?`, num(a + c),
            ['Collect only the x-terms.', `${n_(a)} + ${pn(c)}`], [`x: ${n_(a)} + ${pn(c)} = ${n_(a + c)}`, `y: ${n_(b)} + ${pn(d)} = ${n_(b + d)}`, `Result: ${ex_([[a + c, 'x'], [b + d, 'y']])}`],
            [[String(a + b + c + d), 'x-terms and y-terms are unlike — do not add them together.']]);
        }),
        tp('add', (r) => {
          const a = [r.int(-6, 6) || 1, r.int(-6, 6) || 2, r.int(-9, 9) || 3], b = [r.int(-6, 6) || -1, r.int(-6, 6) || 4, r.int(-9, 9) || -2];
          const s = a.map((x, i) => x + b[i]);
          const show = (c: number[]) => ex_([[c[0], 'x²'], [c[1], 'x'], [c[2], '']]);
          return mcq(r, `Add: (${show(a)}) + (${show(b)})`, show(s), [show([s[0], s[1], a[2] - b[2]]), show([s[0] + s[1], 0, s[2]]), show([a[0] - b[0], s[1], s[2]]), show([s[0], a[1] - b[1], s[2]])],
            ['Add the x² terms, the x terms and the numbers separately.'], [`x²: ${a[0]} + ${pn(b[0])} = ${s[0]}`, `x: ${a[1]} + ${pn(b[1])} = ${s[1]}`, `numbers: ${a[2]} + ${pn(b[2])} = ${s[2]}`, `= ${show(s)}`]);
        }),
        tp('sub', (r) => {
          const a = [r.int(1, 9), r.int(-6, 6) || 2, r.int(-9, 9) || 5], b = [r.int(1, 9), r.int(-6, 6) || -3, r.int(-9, 9) || 4];
          const d = a.map((x, i) => x - b[i]);
          const show = (c: number[]) => ex_([[c[0], 'a'], [c[1], 'b'], [c[2], '']]);
          return mcq(r, `Subtract (${show(b)}) from (${show(a)}).`, show(d), [show([d[0], a[1] + b[1], d[2]]), show([d[0], d[1], a[2] + b[2]]), show(b.map((x, i) => x - a[i])), show([a[0] + b[0], d[1], d[2]])],
            ['"Subtract B from A" means A − B.', 'Change the sign of every term in B, then add.'], [`${show(a)} − (${show(b)})`, `= ${show(d)}`],
            [['wrong', 'Check every sign: subtracting a negative term makes it positive.']]);
        }),
        tp('tap-like', (r) => {
          const base = r.pick(['x²y', 'ab', 'xy²', 'p²']);
          const likes = [`3${base}`, `−7${base}`, `${base}`, `12${base}`, `−${base}`].slice(0, 3);
          const unl = r.pick([['3x²', '5xy', '2x²y²', '4y'], ['a²b', '6ab²', '9a', '2b'], ['x²y', '3xy', 'y²', '5x'], ['p', '2p³', 'pq', '7']]).filter((u) => u !== base && !likes.includes(u)).slice(0, 3);
          return { type: 'tap', prompt: `Tap every term that is LIKE ${base === 'p²' ? '5p²' : `5${base}`}.`, ...tapAll(r, [...likes.map((l) => ({ label: l, ok: true })), ...unl.map((l) => ({ label: l, ok: false }))]),
            hints: ['Like terms have the same variables with the same powers.', 'Coefficients do not matter.'], solution: [`Like terms: ${likes.join(', ')}`] };
        }),
        tp('evaluate', (r) => {
          const a = r.int(1, 5), b = r.int(-6, 6), c = r.int(-9, 9), x = r.int(-3, 4);
          return typed(`Find the value of ${ex_([[a, 'x²'], [b, 'x'], [c, '']])} when x = ${n_(x)}.`, num(a * x * x + b * x + c),
            [`Replace every x by ${pn(x)}.`, `x² = ${x * x}`], [`${a} × ${x * x} ${sg(b * x)} ${sg(c)} = ${a * x * x + b * x + c}`],
            [[String(-a * x * x + b * x + c), 'A negative number squared is positive.']]);
        }),
      ],
    },
    {
      id: 'ts8.m.alg.multiply', title: 'Multiplying monomials, binomials and trinomials', prereqs: ['ts8.m.alg.like'],
      intro: [
        h('Multiplying expressions'),
        p('A rectangle of length 3x and breadth 2y has area 3x × 2y = 6xy. Multiplying algebraic expressions is how we find areas, volumes and much more.'),
        stepsB('Monomial × monomial: multiply the coefficients, then multiply the variables (add powers of the same variable): 3x²y × 4xy³ = 12x³y⁴.', 'Monomial × polynomial: multiply the monomial with EVERY term (distributive law): 2x(3x − 5) = 6x² − 10x.', 'Binomial × binomial: each term of the first times each term of the second, then combine like terms.'),
        f('(a + b)(c + d) = ac + ad + bc + bd', 'a plus b times c plus d'),
        X({
          title: 'What if? Multiply two binomials', formula: '(a + b)(c + d) = ac + ad + bc + bd',
          result: ['P', 'Product', '(a + b)*(c + d)', '', 2],
          vars: [['a', 'a', -10, 10, 1, 3], ['b', 'b', -10, 10, 1, 2], ['c', 'c', -10, 10, 1, 4], ['d', 'd', -10, 10, 1, 1]],
          notes: [['b', 'b is multiplied by both c and d, so the product changes by (c + d) for each unit of b.', 'Lowering b removes b × (c + d).']],
          mistakes: [['(a + b)(c + d) = ac + bd', 'You need FOUR products: every term meets every term.'], ['Forgetting the signs of negative terms', '(x − 3)(x + 2): −3 × 2 = −6, so the constant is −6.']],
          real: 'A 23 × 14 room: (20 + 3)(10 + 4) = 200 + 80 + 30 + 12 = 322 square units — the same idea as long multiplication.',
        }),
        keys('xᵐ × xⁿ = xᵐ⁺ⁿ for the same variable.', 'Binomial × binomial: 4 products.', 'Binomial × trinomial: 6 products.'),
        remember('After multiplying, always combine like terms.'),
      ],
      examples: [
        ex('Multiply −3a²b by 5ab³.', ['Coefficients: −3 × 5 = −15', 'a² × a = a³, b × b³ = b⁴'], '−15a³b⁴'),
        ex('Expand (2x + 3)(x − 4).', ['2x × x = 2x²', '2x × (−4) = −8x', '3 × x = 3x', '3 × (−4) = −12', 'Combine: 2x² − 5x − 12'], '2x² − 5x − 12'),
        ex('Expand (x + 1)(x² − x + 1).', ['x³ − x² + x + x² − x + 1', '= x³ + 1'], 'x³ + 1'),
      ],
      practice: [
        tp('mono', (r) => {
          const a = r.int(-6, 7) || 2, b = r.int(2, 6), m = r.int(1, 4), n = r.int(1, 3), p0 = r.int(1, 3), q0 = r.int(1, 3);
          const right = `${tm(a * b, `x${m + n === 1 ? '' : sup(m + n)}y${p0 + q0 === 1 ? '' : sup(p0 + q0)}`)}`;
          const xs = (e: number) => (e === 1 ? '' : sup(e));
          return mcq(r, `Multiply: (${tm(a, `x${xs(m)}y${xs(p0)}`)}) × (${b}x${xs(n)}y${xs(q0)})`, right,
            [tm(a * b, `x${xs(m * n)}y${xs(p0 * q0)}`), tm(a + b, `x${xs(m + n)}y${xs(p0 + q0)}`), tm(-a * b, `x${xs(m + n)}y${xs(p0 + q0)}`)],
            ['Multiply the numbers.', 'Add the powers of x, and add the powers of y.'], [`${a} × ${b} = ${a * b}`, `x${xs(m)} × x${xs(n)} = x${xs(m + n)}, y${xs(p0)} × y${xs(q0)} = y${xs(p0 + q0)}`, `= ${right}`]);
        }),
        tp('dist', (r) => {
          const k = r.int(-5, 6) || 3, a = r.int(1, 6), b = r.int(-9, 9) || 4;
          const right = ex_([[k * a, 'x²'], [k * b, 'x']]);
          return mcq(r, `Expand ${tm(k, 'x')}(${ex_([[a, 'x'], [b, '']])}).`, right, [ex_([[k * a, 'x²'], [b, 'x']]), ex_([[k * a, 'x'], [k * b, '']]), ex_([[k * a, 'x²'], [-k * b, 'x']])],
            ['Multiply the outside term with EACH term inside.'], [`${tm(k, 'x')} × ${tm(a, 'x')} = ${tm(k * a, 'x²')}`, `${tm(k, 'x')} × ${pn(b)} = ${tm(k * b, 'x')}`, `= ${right}`]);
        }),
        tp('xa-xb', (r) => {
          const a = r.int(-9, 9) || 2, b = r.int(-9, 9) || 5, ask = r.pick(['coefficient of x', 'constant term']);
          return typed(`Expand (${ex_([[1, 'x'], [a, '']])})(${ex_([[1, 'x'], [b, '']])}). What is the ${ask}?`, num(ask === 'constant term' ? a * b : a + b),
            ['(x + a)(x + b) = x² + (a + b)x + ab.'], [`= ${quad(a + b, a * b)}`],
            [[String(ask === 'constant term' ? a + b : a * b), ask === 'constant term' ? 'The constant is a × b.' : 'The x-coefficient is a + b.']]);
        }),
        tp('ax-b', (r) => {
          const a = r.int(2, 5), b = r.int(-7, 7) || 1, c = r.int(1, 5), d = r.int(-7, 7) || -2;
          return typed(`Expand (${ex_([[a, 'x'], [b, '']])})(${ex_([[c, 'x'], [d, '']])}) and give the coefficient of x.`, num(a * d + b * c),
            ['Middle terms: outer product + inner product.', `${a}x × ${pn(d)} and ${pn(b)} × ${c}x`], [`${ex_([[a * c, 'x²'], [a * d + b * c, 'x'], [b * d, '']])}`],
            [[String(a * d), 'Add BOTH middle products.']]);
        }, 2),
        tp('tri', (r) => {
          const a = r.int(-4, 4) || 1, p0 = r.int(-5, 5), q0 = r.int(-6, 6), x = r.int(-2, 3);
          const v = (x + a) * (x * x + p0 * x + q0);
          return typed(`Find the value of (${ex_([[1, 'x'], [a, '']])})(${quad(p0, q0)}) when x = ${n_(x)}.`, num(v),
            ['Evaluate each bracket first, then multiply.'], [`${n_(x + a)} × ${n_(x * x + p0 * x + q0)} = ${n_(v)}`]);
        }),
      ],
    },
    {
      id: 'ts8.m.alg.identities', title: 'Algebraic identities and their geometric verification', prereqs: ['ts8.m.alg.multiply'],
      intro: [
        h('Equations that are ALWAYS true'),
        p('x + 3 = 5 is true only when x = 2. But (a + b)² = a² + 2ab + b² is true for every a and b. Such equalities are identities.'),
        def('Identity', 'An equality that holds for all values of its variables.'),
        keys('(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', '(a + b)(a − b) = a² − b²', '(x + a)(x + b) = x² + (a + b)x + ab'),
        h('Seeing it with squares'),
        p('Draw a square of side a + b. Split each side into a and b. You get one a × a square, one b × b square and TWO a × b rectangles. Area: a² + 2ab + b². That is the geometric proof of (a + b)².'),
        vis({ kind: 'grid-shape', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2], [3, 0], [3, 1], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]], cols: 4, rows: 4 }, 'A 4 by 4 square split as 3 + 1: a 3×3 square, a 1×1 square and two 3×1 strips — showing (3 + 1)² = 9 + 3 + 3 + 1'),
        p('For a² − b²: cut a b × b square from the corner of an a × a square. Rearrange the L-shape into a rectangle of length (a + b) and breadth (a − b).'),
        f('(a + b)² = a² + 2ab + b²', 'a plus b squared equals a squared plus 2 a b plus b squared'),
        X({
          title: 'What if? The missing 2ab', formula: '(a + b)² − (a² + b²) = 2ab',
          result: ['g', 'Gap between (a + b)² and a² + b²', '(a + b)^2 - (a^2 + b^2)'],
          vars: [['a', 'a', 0, 20, 1, 5], ['b', 'b', 0, 20, 1, 3]],
          notes: [['b', 'Each extra unit of b adds a strip of area 2a to the gap.', 'When b = 0 the gap vanishes.']],
          mistakes: [['(a + b)² = a² + b²', 'This forgets the two rectangles of area ab. (3 + 2)² = 25, but 9 + 4 = 13.']],
          real: 'A square plot of side (20 + 3) m: 400 + 120 + 9 = 529 m².',
        }),
        remember('(a − b)² and a² − b² are DIFFERENT: (5 − 3)² = 4 but 5² − 3² = 16.'),
      ],
      examples: [
        ex('Expand (3x + 4)².', ['a = 3x, b = 4', '9x² + 2 × 3x × 4 + 16'], '9x² + 24x + 16'),
        ex('Expand (2p − 5q)².', ['4p² − 2 × 2p × 5q + 25q²'], '4p² − 20pq + 25q²'),
        ex('Expand (y + 7)(y − 7).', ['(a + b)(a − b) = a² − b²'], 'y² − 49'),
      ],
      practice: [
        tp('sq-mid', (r) => {
          const a = r.int(1, 6), b = r.int(1, 9), s = r.pick([1, -1]);
          return typed(`Expand (${ex_([[a, 'x'], [s * b, '']])})². What is the coefficient of x?`, num(2 * a * s * b),
            [`Use (a ${s > 0 ? '+' : '−'} b)² = a² ${s > 0 ? '+' : '−'} 2ab + b².`, `2 × ${a}x × ${b}`], [`= ${ex_([[a * a, 'x²'], [2 * a * s * b, 'x'], [b * b, '']])}`],
            [['0', 'The square of a binomial has a middle term 2ab — it does not disappear.'], [String(a * s * b), 'The middle term is TWICE ab.']]);
        }),
        tp('pick', (r) => {
          const a = r.int(1, 5), b = r.int(1, 8), kind = r.pick(['+', '−', '±']);
          const A = tm(a, 'x'), B = String(b);
          const q = kind === '+' ? `(${A} + ${B})²` : kind === '−' ? `(${A} − ${B})²` : `(${A} + ${B})(${A} − ${B})`;
          const right = kind === '+' ? ex_([[a * a, 'x²'], [2 * a * b, 'x'], [b * b, '']]) : kind === '−' ? ex_([[a * a, 'x²'], [-2 * a * b, 'x'], [b * b, '']]) : ex_([[a * a, 'x²'], [-b * b, '']]);
          return mcq(r, `Which is the expansion of ${q}?`, right, [ex_([[a * a, 'x²'], [b * b, '']]), ex_([[a * a, 'x²'], [-b * b, '']]), ex_([[a * a, 'x²'], [2 * a * b, 'x'], [b * b, '']]), ex_([[a * a, 'x²'], [-2 * a * b, 'x'], [b * b, '']]), ex_([[a * a, 'x²'], [-2 * a * b, 'x'], [-b * b, '']])],
            ['Identify a and b, then use the matching identity.'], [`${q} = ${right}`]);
        }),
        matchT('match', 'Match each product with its identity form', [
          ['(a + b)²', 'a² + 2ab + b²'], ['(a − b)²', 'a² − 2ab + b²'], ['(a + b)(a − b)', 'a² − b²'], ['(x + a)(x + b)', 'x² + (a + b)x + ab'],
        ], ['Remember the middle term 2ab for squares.'], 4),
        tp('geo', (r) => {
          const a = r.int(3, 12), b = r.int(1, 6);
          return typed(`A square of side (${a} + ${b}) cm is split into a ${a} × ${a} square, a ${b} × ${b} square and two equal rectangles. What is the area of ONE rectangle (cm²)?`, num(a * b, 'cm²'),
            ['Each rectangle has sides a and b.'], [`${a} × ${b} = ${a * b} cm²`, `Check: ${a * a} + ${b * b} + 2 × ${a * b} = ${(a + b) ** 2} = (${a + b})² ✓`]);
        }),
        bank('id-facts', [
          { q: 'Which is an identity (true for all x)?', a: '(x + 2)² = x² + 4x + 4', w: ['x + 2 = 5', '(x + 2)² = x² + 4', '2x = x²'], h: ['Expand and compare.'], s: ['(x + 2)² = x² + 4x + 4 for every x.'] },
          { q: 'In the geometric proof of (a + b)², how many a × b rectangles are there?', a: '2', w: ['1', '4', '0'], h: ['That is where 2ab comes from.'], s: ['Two rectangles of area ab.'] },
          { q: '(a − b)² equals:', a: '(b − a)²', w: ['a² − b²', '−(a + b)²', 'a² + b²'], h: ['Squares remove the sign.'], s: ['(a − b)² = (−(b − a))² = (b − a)².'] },
          { q: 'a² − b² can be shown as a rectangle with sides:', a: '(a + b) and (a − b)', w: ['a and b', '(a − b) and (a − b)', 'a² and b²'], h: ['Rearrange the L-shape.'], s: ['Area (a + b)(a − b).'] },
          { q: '(x + 3)(x + 5) equals:', a: 'x² + 8x + 15', w: ['x² + 15x + 8', 'x² + 15', 'x² + 8x + 8'], h: ['(a + b)x + ab'], s: ['3 + 5 = 8, 3 × 5 = 15.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.alg.apply', title: 'Applying identities to calculate quickly', prereqs: ['ts8.m.alg.identities'],
      intro: [
        h('Mental maths superpowers'),
        p('What is 103²? Write it as (100 + 3)² = 10000 + 600 + 9 = 10609 — no long multiplication needed! Identities turn hard sums into easy ones.'),
        stepsB('Split the number around a round number: 98 = 100 − 2, 47 × 53 = (50 − 3)(50 + 3).', 'Pick the matching identity.', 'Calculate the easy pieces and combine.'),
        f('a² − b² = (a + b)(a − b)', 'a squared minus b squared equals a plus b times a minus b'),
        X({
          title: 'What if? Difference of squares', formula: 'a² − b² = (a + b)(a − b)',
          result: ['D', 'a² − b²', '(a + b)*(a - b)'],
          vars: [['a', 'a', 0, 100, 1, 57], ['b', 'b', 0, 100, 1, 43]],
          notes: [['b', 'As b approaches a, the factor (a − b) shrinks, so the difference falls fast.', 'Moving b away from a makes the difference grow.']],
          mistakes: [['57² − 43² = (57 − 43)² = 196', 'Use (a + b)(a − b) = 100 × 14 = 1400.']],
          real: '47 × 53 = 50² − 3² = 2500 − 9 = 2491 — done in your head.',
        }),
        keys('Near 100: (100 ± b)².', 'Pairs equally spaced around a number: (a + b)(a − b).', 'Given a + b and ab: a² + b² = (a + b)² − 2ab.'),
        remember('a² + b² = (a + b)² − 2ab = (a − b)² + 2ab.'),
      ],
      examples: [
        ex('Find 99² using an identity.', ['(100 − 1)² = 10000 − 200 + 1'], '9801'),
        ex('Find 102 × 98.', ['(100 + 2)(100 − 2) = 10000 − 4'], '9996'),
        ex('If a + b = 10 and ab = 21, find a² + b².', ['(a + b)² − 2ab = 100 − 42'], '58'),
      ],
      practice: [
        tp('near100', (r) => {
          const base = r.pick([100, 50, 200, 1000]), b = r.int(1, 9), s = r.pick([1, -1]);
          const n = base + s * b;
          return typed(`Use an identity to find ${n}².`, num(n * n),
            [`${n} = ${base} ${s > 0 ? '+' : '−'} ${b}.`, `(a ${s > 0 ? '+' : '−'} b)² = a² ${s > 0 ? '+' : '−'} 2ab + b²`],
            [`${base}² ${s > 0 ? '+' : '−'} 2 × ${base} × ${b} + ${b}²`, `= ${base * base} ${s > 0 ? '+' : '−'} ${2 * base * b} + ${b * b} = ${n * n}`],
            [[String(base * base + b * b), 'You missed the middle term 2ab.']]);
        }),
        tp('pair', (r) => {
          const a = r.pick([20, 30, 40, 50, 60, 70, 100]), b = r.int(1, 9);
          return typed(`Use an identity to find ${a + b} × ${a - b}.`, num(a * a - b * b),
            [`Both numbers are ${b} away from ${a}.`, '(a + b)(a − b) = a² − b²'], [`${a}² − ${b}² = ${a * a} − ${b * b} = ${a * a - b * b}`]);
        }),
        tp('diff', (r) => {
          const s = r.pick([100, 50, 80, 120, 200]), a = s / 2 + r.int(3, 20);
          const b = s - a;
          return typed(`Find ${a}² − ${b}² using an identity.`, num(a * a - b * b),
            ['a² − b² = (a + b)(a − b).'], [`(${a} + ${b})(${a} − ${b}) = ${s} × ${a - b} = ${a * a - b * b}`],
            [[String((a - b) ** 2), '(a − b)² is not the same as a² − b².']]);
        }),
        tp('sumsq', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9);
          return typed(`If a + b = ${a + b} and ab = ${a * b}, find a² + b².`, num(a * a + b * b),
            ['a² + b² = (a + b)² − 2ab.'], [`${(a + b) ** 2} − 2 × ${a * b} = ${a * a + b * b}`],
            [[String((a + b) ** 2), 'Subtract 2ab from (a + b)².']]);
        }, 2),
        tp('xab', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9);
          return typed(`Use (x + a)(x + b) = x² + (a + b)x + ab to find ${100 + a} × ${100 + b}.`, num((100 + a) * (100 + b)),
            ['Take x = 100.'], [`10000 + ${a + b} × 100 + ${a * b} = ${(100 + a) * (100 + b)}`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 12 FACTORISATION
const ch12: USpec = {
  id: 'ts8.m.ch12', subject: 'math', title: 'Factorisation', source: src(12),
  objectives: [
    {
      id: 'ts8.m.fac.common', title: 'Why factorise? Taking out common factors',
      intro: [
        h('Multiplication in reverse'),
        p('Expanding turns 3(x + 4) into 3x + 12. Factorisation goes back the other way: it writes 3x + 12 as a product 3(x + 4). Factorised forms make division, simplifying fractions and solving equations much easier.'),
        def('Factorisation', 'Writing an algebraic expression as a product of its factors.'),
        stepsB('Find the HCF of the coefficients.', 'Find the variables common to every term, each with its smallest power.', 'Write HCF × (each term ÷ HCF).', 'Check by expanding.'),
        p('Example: 12x²y + 18xy². HCF of 12 and 18 is 6; common variables x and y. So 12x²y + 18xy² = 6xy(2x + 3y).'),
        keys('The common factor can be a number, a variable, or a whole bracket: x(a + b) + y(a + b) = (a + b)(x + y).', 'Always check by multiplying back.'),
        remember('An irreducible factor (like x + 4) cannot be split further.'),
      ],
      examples: [
        ex('Factorise 15a³b − 25a²b².', ['HCF(15, 25) = 5', 'Common: a², b', '5a²b(3a − 5b)'], '5a²b(3a − 5b)'),
        ex('Factorise 2x(y − 3) − 7(y − 3).', ['Common bracket (y − 3)'], '(y − 3)(2x − 7)'),
      ],
      practice: [
        tp('hcf', (r) => {
          const g = r.pick([2, 3, 4, 5, 6, 7, 8]), a = r.int(2, 6), b = r.int(2, 7);
          const A = g * a, B = g * (gcd(a, b) === 1 ? b : b + 1);
          return typed(`What is the numerical coefficient of the HCF of ${A}x²y and ${B}xy³?`, num(gcd(A, B)),
            ['Find the HCF of the numbers.'], [`HCF(${A}, ${B}) = ${gcd(A, B)}`, `HCF of the terms = ${gcd(A, B)}xy`]);
        }),
        tp('take-out', (r) => {
          const g = r.int(2, 9), a = r.int(1, 7), b = r.int(1, 9), v = r.pick(['x', 'a', 'p']);
          let bb = b; if (gcd(a, bb) !== 1) bb = 1;
          const right = `${g}${v}(${a === 1 ? '' : a}${v} + ${bb})`;
          return mcq(r, `Factorise ${g * a}${v}² + ${g * bb}${v}.`, right, [`${g}(${a === 1 ? '' : a}${v}² + ${bb}${v})`, `${g}${v}(${a === 1 ? '' : a}${v} + ${g * bb})`, `${v}(${g * a}${v} + ${bb})`, `${g}${v}²(${a} + ${bb})`],
            ['Take out the HCF of the numbers AND the common variable.', `Both terms contain ${v}.`], [`HCF = ${g}${v}`, `= ${right}`]);
        }),
        tp('bracket', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9), c = r.int(1, 9);
          const right = `(y + ${c})(${a}x + ${b})`;
          return mcq(r, `Factorise ${a}x(y + ${c}) + ${b}(y + ${c}).`, right, [`(y + ${c})(${a}x)(${b})`, `${a}x(y + ${c} + ${b})`, `(y + ${c})(${a}x − ${b})`, `(${a}x + y)(${b} + ${c})`],
            [`The whole bracket (y + ${c}) is common.`], [`= (y + ${c})(${a}x + ${b})`]);
        }),
        tp('check', (r) => {
          const g = r.int(2, 8), a = r.int(1, 6), b = r.int(1, 9), x = r.int(1, 5);
          return typed(`${g}(${a}x + ${b}) is the factorised form of ${g * a}x + ${g * b}. Check by substituting x = ${x}: what is the value?`, num(g * (a * x + b)),
            ['Both forms must give the same value.'], [`${g * a} × ${x} + ${g * b} = ${g * a * x + g * b}`, `${g} × (${a * x} + ${b}) = ${g * (a * x + b)} ✓`]);
        }),
        bank('why', [
          { q: 'The HCF of 6x²y and 9xy² is:', a: '3xy', w: ['3x²y²', '18x²y²', '3'], h: ['Smallest powers of common variables.'], s: ['HCF(6, 9) = 3; x¹ and y¹.'] },
          { q: 'Factorisation is the reverse of:', a: 'expanding (multiplying out)', w: ['adding', 'dividing by zero', 'squaring'], h: ['3(x + 4) ↔ 3x + 12'], s: ['It writes a sum as a product.'] },
          { q: 'Which is fully factorised?', a: '4x(x + 2)', w: ['2(2x² + 4x)', '4x² + 8x', 'x(4x + 8)'], h: ['No common factor left inside.'], s: ['2x² + 4x and 4x + 8 still have common factors.'] },
          { q: 'ax + bx equals:', a: 'x(a + b)', w: ['ab(x)', 'x² (a + b)', '(a + x)(b + x)'], h: ['x is common.'], s: ['Take x out.'] },
          { q: 'Factorise 7a − 7:', a: '7(a − 1)', w: ['7a(1 − 1)', '7(a − 7)', 'a(7 − 7)'], h: ['7 is common.'], s: ['7 × a − 7 × 1.'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.fac.identities', title: 'Factorising by grouping and by using identities', prereqs: ['ts8.m.fac.common'],
      intro: [
        h('Two more tools'),
        p('Sometimes no single factor is common to all terms. Then we group terms in pairs that share a factor: xy + 3x + 2y + 6 = x(y + 3) + 2(y + 3) = (y + 3)(x + 2).'),
        p('Other times the expression matches an identity read backwards:'),
        keys('a² + 2ab + b² = (a + b)²', 'a² − 2ab + b² = (a − b)²', 'a² − b² = (a + b)(a − b)', 'x² + (a + b)x + ab = (x + a)(x + b)'),
        p('For x² + px + q, look for two numbers whose SUM is p and whose PRODUCT is q. For x² + 7x + 12: 3 + 4 = 7 and 3 × 4 = 12, so (x + 3)(x + 4).'),
        f('x² + px + q = (x + a)(x + b), where a + b = p and ab = q', 'two numbers with sum p and product q'),
        X({
          title: 'What if? Sum and product', formula: 'p = a + b, q = a × b',
          result: ['q', 'Constant term q', 'a*b'],
          vars: [['a', 'a', -10, 10, 1, 3], ['b', 'b', -10, 10, 1, 4]],
          notes: [['b', 'Changing b changes the product by a for each step.', 'If a and b have opposite signs, q becomes negative.']],
          mistakes: [['For x² − 5x + 6 choosing 2 and 3', 'Sum must be −5: use −2 and −3 (product +6).']],
          real: 'A rectangle of area x² + 7x + 12 can have sides (x + 3) and (x + 4).',
        }),
        remember('Always look for a common factor FIRST: 2x² − 18 = 2(x² − 9) = 2(x + 3)(x − 3).'),
      ],
      examples: [
        ex('Factorise x² + 10x + 25.', ['= x² + 2 × x × 5 + 5²'], '(x + 5)²'),
        ex('Factorise 49p² − 36.', ['= (7p)² − 6²'], '(7p + 6)(7p − 6)'),
        ex('Factorise x² − x − 20.', ['Need sum −1, product −20: −5 and 4'], '(x − 5)(x + 4)'),
      ],
      practice: [
        tp('quad', (r) => {
          const a = r.int(-9, 9) || 2; let b = r.int(-9, 9) || 3; if (b === a) b += 1;
          const f2 = (u: number, w: number) => `(${ex_([[1, 'x'], [u, '']])})(${ex_([[1, 'x'], [w, '']])})`;
          return mcq(r, `Factorise ${quad(a + b, a * b)}.`, f2(a, b), [f2(-a, -b), f2(a, -b), f2(-a, b), f2(a + b, 1)],
            [`Find two numbers with sum ${n_(a + b)} and product ${n_(a * b)}.`], [`${n_(a)} + ${pn(b)} = ${n_(a + b)}, ${n_(a)} × ${pn(b)} = ${n_(a * b)}`, `= ${f2(a, b)}`]);
        }),
        tp('dsq', (r) => {
          const a = r.int(15, 99), b = r.int(1, a - 5);
          return typed(`Use factorisation to evaluate ${a}² − ${b}².`, num(a * a - b * b),
            ['a² − b² = (a + b)(a − b).'], [`(${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = ${a * a - b * b}`]);
        }),
        tp('dsq-alg', (r) => {
          const a = r.int(1, 9), b = r.int(1, 12);
          const A = tm(a, 'x');
          return mcq(r, `Factorise ${tm(a * a, 'x²')} − ${b * b}.`, `(${A} + ${b})(${A} − ${b})`, [`(${A} − ${b})²`, `(${A} + ${b})²`, `(${tm(a * a, 'x')} + ${b})(x − ${b})`],
            ['It is a difference of two squares.', `${tm(a * a, 'x²')} = (${A})², ${b * b} = ${b}²`], [`= (${A} + ${b})(${A} − ${b})`]);
        }),
        tp('perfect', (r) => {
          const b = r.int(2, 12), s = r.pick([1, -1]);
          return typed(`x² ${s > 0 ? '+' : '−'} __x + ${b * b} is a perfect square (x ${s > 0 ? '+' : '−'} ${b})². What number goes in the blank?`, num(2 * b),
            ['(a ± b)² = a² ± 2ab + b².'], [`2 × x × ${b} = ${2 * b}x`], [[String(b), 'The middle term is 2ab, twice b.']]);
        }),
        tp('group', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9);
          const right = `(y + ${a})(x + ${b})`;
          return mcq(r, `Factorise by grouping: xy + ${a}x + ${b}y + ${a * b}.`, right, [`(x + ${a})(y + ${b})`, `(xy + ${a})(${b} + 1)`, `(y + ${a * b})(x + 1)`],
            ['Group: (xy + ' + a + 'x) + (' + b + 'y + ' + a * b + ').', `x(y + ${a}) + ${b}(y + ${a})`], [`= ${right}`]);
        }, 2),
      ],
    },
    {
      id: 'ts8.m.fac.divide', title: 'Dividing algebraic expressions', prereqs: ['ts8.m.fac.identities'],
      intro: [
        h('Sharing algebra'),
        p('A rectangle has area 6x² + 9x and breadth 3x. Its length is (6x² + 9x) ÷ 3x = 2x + 3. Division of expressions undoes multiplication.'),
        stepsB('Monomial ÷ monomial: divide the coefficients and subtract powers: 15x⁴y² ÷ 5x²y = 3x²y.', 'Polynomial ÷ monomial: divide EACH term by the monomial.', 'Polynomial ÷ polynomial: factorise the dividend and cancel the common factor.'),
        f('xᵐ ÷ xⁿ = xᵐ⁻ⁿ', 'x to the m divided by x to the n equals x to the m minus n'),
        X({
          title: 'What if? Dividing powers', formula: 'xᵐ ÷ xⁿ = xᵐ⁻ⁿ',
          result: ['Q', 'Value of xᵐ ÷ xⁿ', 'x^(m - n)', '', 3],
          vars: [['x', 'x', 1, 5, 1, 2], ['m', 'm', 0, 8, 1, 5], ['n', 'n', 0, 8, 1, 2]],
          notes: [['n', 'Dividing by one more x shrinks the result by a factor of x.', 'Dividing by fewer x\'s leaves a bigger result.']],
          mistakes: [['x⁶ ÷ x² = x³', 'Subtract the exponents (6 − 2 = 4), do not divide them.']],
          real: 'Area 6x² + 9x ÷ breadth 3x gives length 2x + 3.',
        }),
        remember('(x² + 7x + 12) ÷ (x + 3) = (x + 3)(x + 4) ÷ (x + 3) = x + 4.'),
      ],
      examples: [
        ex('Divide 24a³b² by −6ab.', ['24 ÷ (−6) = −4', 'a³ ÷ a = a², b² ÷ b = b'], '−4a²b'),
        ex('Divide 10y³ − 15y² + 5y by 5y.', ['10y³/5y − 15y²/5y + 5y/5y'], '2y² − 3y + 1'),
        ex('Divide x² − 9 by x + 3.', ['x² − 9 = (x + 3)(x − 3)', 'Cancel (x + 3).'], 'x − 3'),
      ],
      practice: [
        tp('mono', (r) => {
          const q = r.int(2, 9) * r.pick([1, -1]), d = r.int(2, 6), m = r.int(3, 6), n = r.int(1, m - 1);
          const xs = (e: number) => (e === 1 ? '' : sup(e));
          const right = tm(q, `x${xs(m - n)}`);
          return mcq(r, `Divide ${tm(q * d, `x${xs(m)}`)} by ${d}x${xs(n)}.`, right, [tm(q, `x${xs(Math.max(1, Math.round(m / n)))}`), tm(q * d - d, `x${xs(m - n)}`), tm(-q, `x${xs(m - n)}`), tm(q, `x${xs(m + n)}`)],
            ['Divide the numbers; subtract the powers of x.'], [`${n_(q * d)} ÷ ${d} = ${n_(q)}`, `x${xs(m)} ÷ x${xs(n)} = x${xs(m - n)}`, `= ${right}`]);
        }),
        tp('poly-mono', (r) => {
          const k = r.int(2, 6), a = r.int(1, 5), b = r.int(-6, 6) || 2, c = r.int(1, 7);
          const right = ex_([[a, 'x²'], [b, 'x'], [c, '']]);
          return mcq(r, `Divide ${ex_([[k * a, 'x³'], [k * b, 'x²'], [k * c, 'x']])} by ${k}x.`, right, [ex_([[a, 'x³'], [b, 'x²'], [c, 'x']]), ex_([[a, 'x²'], [b, 'x'], [k * c, '']]), ex_([[a, 'x²'], [b, 'x']])],
            ['Divide EVERY term by ' + k + 'x.'], [`= ${right}`]);
        }),
        tp('poly-poly', (r) => {
          const a = r.int(-9, 9) || 3; let b = r.int(-9, 9) || 4; if (b === a) b += 1;
          return typed(`(${quad(a + b, a * b)}) ÷ (${ex_([[1, 'x'], [a, '']])}) = x + k. Find k.`, num(b),
            ['Factorise the dividend first.', `Look for two numbers with sum ${n_(a + b)} and product ${n_(a * b)}.`], [`${quad(a + b, a * b)} = (${ex_([[1, 'x'], [a, '']])})(${ex_([[1, 'x'], [b, '']])})`, `Quotient = ${ex_([[1, 'x'], [b, '']])}, so k = ${n_(b)}`],
            [[String(a), 'That factor is the divisor itself, which cancels.']]);
        }, 2),
        tp('dsq-div', (r) => {
          const a = r.int(1, 6), b = r.int(1, 9);
          return typed(`Divide ${tm(a * a, 'y²')} − ${b * b} by ${tm(a, 'y')} − ${b}. The quotient is ${tm(a, 'y')} + c. Find c.`, num(b),
            ['Difference of squares: (ay + b)(ay − b).'], [`= (${tm(a, 'y')} + ${b})(${tm(a, 'y')} − ${b})`, `Quotient = ${tm(a, 'y')} + ${b}`]);
        }),
        tp('area', (r) => {
          const k = r.int(2, 6), a = r.int(1, 5), b = r.int(1, 9);
          return mcq(r, `A rectangle has area ${ex_([[k * a, 'x²'], [k * b, 'x']])} cm² and breadth ${k}x cm. What is its length?`, `${ex_([[a, 'x'], [b, '']])} cm`, [`${ex_([[a, 'x²'], [b, 'x']])} cm`, `${ex_([[k * a, 'x'], [k * b, '']])} cm`, `${ex_([[a, 'x'], [k * b, '']])} cm`],
            ['Length = area ÷ breadth.', 'Divide each term by ' + k + 'x.'], [`(${ex_([[k * a, 'x²'], [k * b, 'x']])}) ÷ ${k}x = ${ex_([[a, 'x'], [b, '']])}`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 13 VISUALISING 3-D IN 2-D
const SOLIDS: [string, number, number, number][] = [
  ['cube', 6, 8, 12], ['cuboid', 6, 8, 12], ['triangular prism', 5, 6, 9], ['square pyramid', 5, 5, 8], ['triangular pyramid (tetrahedron)', 4, 4, 6],
  ['pentagonal prism', 7, 10, 15], ['hexagonal prism', 8, 12, 18], ['octahedron', 8, 6, 12], ['pentagonal pyramid', 6, 6, 10],
];
const ch13: USpec = {
  id: 'ts8.m.ch13', subject: 'math', title: 'Visualising 3-D in 2-D', source: src(13),
  objectives: [
    {
      id: 'ts8.m.vis.represent', title: 'Representing 3-D figures in 2-D',
      intro: [
        h('Drawing solids on flat paper'),
        p('Your notebook is flat, but a matchbox is not. Architects, engineers and artists all need ways to draw solid objects on paper. There are a few standard tricks.'),
        def('Oblique sketch', 'A quick drawing: draw the front face true to shape, then draw slanted parallel lines for depth. Lengths are not exact.'),
        def('Isometric sketch', 'Drawn on dotted isometric paper so that edges along the three directions keep their true lengths.'),
        def('Views', 'A solid seen from the front, the side and the top looks different each time. These three views together describe the solid.'),
        stepsB('Front view: what you see looking straight at the front.', 'Side view: looking from the left or right.', 'Top view (plan): looking straight down.'),
        keys('A cylinder: front view a rectangle, top view a circle.', 'A cone: front view a triangle, top view a circle with its centre (the apex).', 'A sphere looks like a circle from every direction.'),
        remember('In an isometric sketch, measurements along the edges are true; in an oblique sketch they are not.'),
      ],
      examples: [
        ex('What is the top view of a cylindrical water drum standing upright?', ['Looking down you see the round lid.'], 'A circle'),
        ex('What is the front view of a cone standing on its base?', ['Looking from the side you see a sloping outline meeting at the top.'], 'A triangle'),
      ],
      practice: [
        bank('views', [
          { q: 'The top view of an upright cylinder is a:', a: 'circle', w: ['rectangle', 'triangle', 'square'], h: ['Look straight down.'], s: ['You see the circular top.'] },
          { q: 'The front view of an upright cylinder is a:', a: 'rectangle', w: ['circle', 'triangle', 'oval'], h: ['Look from the side.'], s: ['Height × diameter rectangle.'] },
          { q: 'The front view of an upright cone is a:', a: 'triangle', w: ['circle', 'rectangle', 'square'], h: ['Sloping sides meet at a point.'], s: ['An isosceles triangle.'] },
          { q: 'Which solid looks the same (a circle) from every direction?', a: 'sphere', w: ['cylinder', 'cone', 'cube'], h: ['A ball.'], s: ['A sphere.'] },
          { q: 'The top view of a square pyramid is:', a: 'a square with its diagonals', w: ['a triangle', 'a circle', 'a rectangle with no lines'], h: ['The slanting edges meet at the top.'], s: ['The edges appear as the diagonals of the square.'] },
          { q: 'The front view of a cube is a:', a: 'square', w: ['rectangle that is not a square', 'triangle', 'hexagon'], h: ['All faces are squares.'], s: ['A square.'] },
        ]),
        bank('sketch', [
          { q: 'In which sketch do edges keep their true lengths?', a: 'Isometric sketch', w: ['Oblique sketch', 'Neither', 'Freehand doodle'], h: ['Drawn on dotted triangular paper.'], s: ['Isometric sketches keep true measurements along the edges.'] },
          { q: 'An oblique sketch shows depth using:', a: 'slanted parallel lines', w: ['circles', 'only the top view', 'shading only'], h: ['Front face first.'], s: ['Depth edges are drawn slanting.'] },
          { q: 'Isometric dot paper has dots arranged in:', a: 'equilateral triangles', w: ['squares', 'circles', 'random places'], h: ['Three directions at 120°.'], s: ['The dots form equilateral triangles.'] },
          { q: 'How many views are usually given to describe a solid?', a: '3 (front, side, top)', w: ['1', '2', '6'], h: ['Front, side, top.'], s: ['Three views.'] },
          { q: 'A hexagon seen from the top could be a:', a: 'hexagonal prism standing upright', w: ['cone', 'sphere', 'cylinder'], h: ['Which solid has hexagonal faces?'], s: ['A hexagonal prism shows a hexagon from the top.'] },
        ]),
        tp('cubes-count', (r) => {
          const a = r.int(2, 4), b = r.int(2, 4), c = r.int(1, 3);
          return typed(`A solid is made by stacking unit cubes into a cuboid ${a} cubes long, ${b} cubes wide and ${c} layers high. How many unit cubes are used?`, num(a * b * c),
            ['Count one layer, then multiply by the number of layers.'], [`One layer = ${a} × ${b} = ${a * b}`, `${a * b} × ${c} = ${a * b * c}`]);
        }),
        tp('top-count', (r) => {
          const a = r.int(2, 5), b = r.int(2, 4), c = r.int(2, 4);
          return typed(`A cuboid built from unit cubes is ${a} cubes long, ${b} cubes wide and ${c} cubes high. How many unit squares do you see in its TOP view?`, num(a * b),
            ['The top view shows only length × width.'], [`${a} × ${b} = ${a * b}`], [[String(a * b * c), 'From the top you see one face only, not all the cubes.']]);
        }),
        matchT('view-match', 'Match each object with its top view', [
          ['Upright cylindrical tank', 'Circle'], ['Brick lying flat', 'Rectangle'], ['Dice', 'Square'], ['Tent shaped like a triangular prism (ridge on top)', 'Rectangle with a line along the ridge'], ['Ice-cream cone held upright (point down)', 'Circle'],
        ], ['Imagine looking straight down from above.'], 3),
      ],
    },
    {
      id: 'ts8.m.vis.euler', title: 'Faces, edges and vertices; Euler\'s formula', prereqs: ['ts8.m.vis.represent'],
      intro: [
        h('Counting the parts of a solid'),
        p('Pick up a matchbox. Its flat surfaces are faces (6), the line segments where faces meet are edges (12), and the corners are vertices (8).'),
        def('Polyhedron', 'A solid whose faces are all polygons, e.g. cube, prism, pyramid. A cylinder, cone or sphere is NOT a polyhedron (curved surfaces).'),
        p('The Swiss mathematician Euler noticed that for every polyhedron, F + V − E = 2. Check the cube: 6 + 8 − 12 = 2.'),
        f('F + V − E = 2', 'faces plus vertices minus edges equals 2'),
        X({
          title: 'What if? Euler\'s formula', formula: 'E = F + V − 2',
          result: ['E', 'Edges', 'F + V - 2'],
          vars: [['F', 'Faces F', 4, 20, 1, 6], ['V', 'Vertices V', 4, 20, 1, 8]],
          notes: [['F', 'An extra face needs an extra edge to keep F + V − E = 2.', 'One face fewer means one edge fewer.']],
          mistakes: [['F + E − V = 2', 'It is faces plus VERTICES minus EDGES.'], ['Applying it to a cylinder', 'Euler\'s formula is for polyhedrons with flat faces.']],
          real: 'A triangular prism (Toblerone box): 5 faces + 6 vertices − 9 edges = 2.',
        }),
        keys('Prism with n-sided base: F = n + 2, V = 2n, E = 3n.', 'Pyramid with n-sided base: F = n + 1, V = n + 1, E = 2n.'),
        remember('If F + V − E ≠ 2, the numbers cannot describe a polyhedron.'),
      ],
      examples: [
        ex('A polyhedron has 8 faces and 6 vertices. How many edges?', ['E = F + V − 2 = 8 + 6 − 2'], '12'),
        ex('Can a polyhedron have 10 faces, 20 edges and 15 vertices?', ['10 + 15 − 20 = 5 ≠ 2'], 'No'),
      ],
      practice: [
        tp('edges', (r) => {
          const [nm2, F, V, E] = r.pick(SOLIDS);
          return typed(`A ${nm2} has ${F} faces and ${V} vertices. Use Euler's formula to find its number of edges.`, num(E),
            ['F + V − E = 2, so E = F + V − 2.'], [`E = ${F} + ${V} − 2 = ${E}`], [[String(F + V + 2), 'E = F + V − 2, not + 2.']]);
        }),
        tp('faces', (r) => {
          const [nm2, F, V, E] = r.pick(SOLIDS);
          return typed(`A ${nm2} has ${V} vertices and ${E} edges. How many faces does it have?`, num(F),
            ['F = 2 + E − V.'], [`F = 2 + ${E} − ${V} = ${F}`]);
        }),
        tp('prism', (r) => {
          const n = r.int(3, 10), kind = r.pick(['prism', 'pyramid']), ask = r.pick(['faces', 'vertices', 'edges']);
          const vals = kind === 'prism' ? { faces: n + 2, vertices: 2 * n, edges: 3 * n } : { faces: n + 1, vertices: n + 1, edges: 2 * n };
          return typed(`How many ${ask} does a ${kind} with a ${n}-sided base have?`, num(vals[ask as keyof typeof vals]),
            [kind === 'prism' ? 'A prism has two bases and n side faces.' : 'A pyramid has one base, n triangular faces and an apex.'],
            [`F = ${vals.faces}, V = ${vals.vertices}, E = ${vals.edges}`, `Check: ${vals.faces} + ${vals.vertices} − ${vals.edges} = 2 ✓`]);
        }, 2),
        tp('possible', (r) => {
          const ok = r.int(0, 1) === 1, F = r.int(5, 12), V = r.int(5, 12), E = F + V - 2 + (ok ? 0 : r.pick([-2, -1, 1, 3]));
          return mcq(r, `Can a polyhedron have ${F} faces, ${V} vertices and ${E} edges?`, ok ? `Yes, F + V − E = 2` : `No, F + V − E = ${F + V - E}, not 2`,
            ok ? [`No, F + V − E = ${F + V - E + 1}`, 'No, polyhedrons need 12 edges'] : ['Yes, F + V − E = 2', 'Yes, any numbers work'],
            ['Work out F + V − E.'], [`${F} + ${V} − ${E} = ${F + V - E}`]);
        }),
        tp('tap-poly', (r) => {
          const yes = ['cube', 'triangular prism', 'square pyramid', 'tetrahedron', 'cuboid', 'octahedron'], no = ['cylinder', 'cone', 'sphere', 'hemisphere'];
          const pick = [...r.shuffle(yes).slice(0, 3).map((label) => ({ label, ok: true })), ...r.shuffle(no).slice(0, 2).map((label) => ({ label, ok: false }))];
          return { type: 'tap', prompt: 'Tap every polyhedron.', ...tapAll(r, pick), hints: ['A polyhedron has only flat polygon faces.'], solution: [`Polyhedrons: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`, 'Curved surfaces → not polyhedrons.'] };
        }),
      ],
    },
    {
      id: 'ts8.m.vis.nets', title: 'Regular polyhedrons and nets', prereqs: ['ts8.m.vis.euler'],
      intro: [
        h('The five perfect solids'),
        p('A regular polyhedron has all faces the same regular polygon and the same number of faces meeting at every vertex. Amazingly, there are only FIVE of them (the Platonic solids).'),
        keys('Tetrahedron: 4 equilateral triangles.', 'Cube (hexahedron): 6 squares.', 'Octahedron: 8 equilateral triangles.', 'Dodecahedron: 12 regular pentagons.', 'Icosahedron: 20 equilateral triangles.'),
        h('Nets'),
        def('Net', 'A flat pattern that can be folded to make a solid. A cube has 11 different nets.'),
        p('Cut open a sweet box along some edges and flatten it: that is a net. Nets help us make solids and find their surface area.'),
        stepsB('Count the faces needed and their shapes.', 'Check that faces which must be opposite do not overlap when folded.', 'Imagine folding along each line.'),
        remember('Six squares in a row of 6 cannot fold into a cube — two faces would overlap.'),
        photo('🎲', 'A dice is a cube: 6 square faces, 8 vertices, 12 edges.'),
      ],
      examples: [
        ex('Which regular polyhedron has 8 faces?', ['8 equilateral triangles'], 'Octahedron'),
        ex('A net has 1 square and 4 triangles. What solid does it make?', ['Square base, triangular sides meeting at a point'], 'Square pyramid'),
      ],
      practice: [
        bank('platonic', [
          { q: 'How many regular polyhedrons are there?', a: '5', w: ['4', '6', 'Infinitely many'], h: ['The Platonic solids.'], s: ['Tetrahedron, cube, octahedron, dodecahedron, icosahedron.'] },
          { q: 'The faces of a dodecahedron are:', a: 'regular pentagons', w: ['squares', 'equilateral triangles', 'hexagons'], h: ['12 faces.'], s: ['12 regular pentagons.'] },
          { q: 'A regular tetrahedron has how many faces?', a: '4', w: ['3', '6', '8'], h: ['"Tetra" = four.'], s: ['4 equilateral triangles.'] },
          { q: 'An icosahedron has how many faces?', a: '20', w: ['12', '8', '10'], h: ['"Icosa" = twenty.'], s: ['20 equilateral triangles.'] },
          { q: 'Which is NOT a regular polyhedron?', a: 'Cuboid with unequal edges', w: ['Cube', 'Octahedron', 'Tetrahedron'], h: ['Faces must be identical regular polygons.'], s: ['A general cuboid has rectangular faces of different sizes.'] },
        ]),
        matchT('net-match', 'Match each net with the solid it folds into', [
          ['6 equal squares in a cross shape', 'Cube'], ['2 triangles and 3 rectangles', 'Triangular prism'], ['1 square and 4 triangles', 'Square pyramid'], ['2 circles and 1 rectangle', 'Cylinder'], ['A circle and a sector', 'Cone'], ['4 equilateral triangles', 'Tetrahedron'],
        ], ['Count the faces and their shapes.']),
        tp('net-faces', (r) => {
          const [nm2, F] = r.pick([['cube', 6], ['triangular prism', 5], ['square pyramid', 5], ['tetrahedron', 4], ['hexagonal prism', 8], ['pentagonal pyramid', 6], ['octahedron', 8]] as [string, number][]);
          return typed(`How many polygons are there in a net of a ${nm2}?`, num(F), ['A net has one polygon for each face.'], [`A ${nm2} has ${F} faces → ${F} polygons.`]);
        }),
        bank('net-ok', [
          { q: 'Six squares in a single straight row can fold into a cube.', a: 'False — two faces overlap', w: ['True', 'True only for small squares', 'True if folded twice'], h: ['Try folding mentally.'], s: ['The row wraps around and the ends overlap; no top or bottom.'] },
          { q: 'How many different nets does a cube have?', a: '11', w: ['6', '1', '24'], h: ['A famous count.'], s: ['There are exactly 11 nets of a cube.'] },
          { q: 'In a cube net, faces that are opposite in the cube:', a: 'never share an edge in the net', w: ['always share an edge', 'are always next to each other', 'are the same face'], h: ['Opposite faces are parallel.'], s: ['They cannot be adjacent in the net.'] },
          { q: 'The net of a cylinder contains:', a: 'two circles and a rectangle', w: ['one circle and a triangle', 'three rectangles', 'two triangles and a rectangle'], h: ['Unroll the curved surface.'], s: ['Curved surface → rectangle; top and bottom → circles.'] },
          { q: 'The net of a cone contains:', a: 'a circle and a sector', w: ['two circles', 'a rectangle and a circle', 'four triangles'], h: ['Unroll the slanted surface.'], s: ['The curved surface flattens into a sector.'] },
        ]),
        tp('regular-vertices', (r) => {
          const [nm2, F, V, E] = r.pick([['tetrahedron', 4, 4, 6], ['cube', 6, 8, 12], ['octahedron', 8, 6, 12], ['dodecahedron', 12, 20, 30], ['icosahedron', 20, 12, 30]] as [string, number, number, number][]);
          return typed(`A regular ${nm2} has ${F} faces and ${E} edges. How many vertices does it have?`, num(V), ['V = 2 + E − F.'], [`V = 2 + ${E} − ${F} = ${V}`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 14 SURFACE AREAS AND VOLUME
const ch14: USpec = {
  id: 'ts8.m.ch14', subject: 'math', title: 'Surface Areas and Volume (Cube and Cuboid)', source: src(14),
  objectives: [
    {
      id: 'ts8.m.sav.surface', title: 'Surface area of cuboid and cube',
      intro: [
        h('How much paper to wrap a gift?'),
        p('To cover a box with gift paper you need the total area of all its faces — the surface area. A cuboid has 6 rectangular faces in 3 matching pairs: top & bottom (l × b), front & back (l × h), left & right (b × h).'),
        f('Total surface area of cuboid = 2(lb + bh + hl)', 'two times l b plus b h plus h l'),
        X({
          title: 'What if? Cuboid surface area', formula: 'TSA = 2(lb + bh + hl)',
          result: ['S', 'Total surface area', '2*(l*b + b*h + h*l)', 'cm²', 2],
          vars: [['l', 'Length l', 1, 30, 1, 10, 'cm'], ['b', 'Breadth b', 1, 30, 1, 6, 'cm'], ['h', 'Height h', 1, 30, 1, 4, 'cm']],
          notes: [['h', 'A taller box adds area to the four side faces only.', 'A shorter box has smaller side faces.']],
          mistakes: [['Forgetting the 2', 'Each face has a matching opposite face.'], ['lbh', 'That is volume (cm³). Surface area adds face areas (cm²).']],
          real: 'A 10 cm × 6 cm × 4 cm box needs 2(60 + 24 + 40) = 248 cm² of paper.',
        }),
        p('Lateral surface area (the four walls only, no top or bottom) = 2h(l + b). Painters use it for the walls of a room.'),
        f('Cube: TSA = 6a², lateral SA = 4a²', 'six a squared'),
        X({
          title: 'What if? Cube surface area', formula: 'TSA = 6a²',
          result: ['S', 'Total surface area', '6*a^2', 'cm²', 2],
          vars: [['a', 'Edge a', 1, 30, 1, 5, 'cm']],
          notes: [['a', 'Doubling the edge makes the surface area 4 times bigger.', 'Halving the edge gives a quarter of the area.']],
          mistakes: [['6a', 'Each face is a square of area a², not a.']],
          real: 'A 5 cm dice has 6 × 25 = 150 cm² of surface.',
        }),
        keys('TSA cuboid = 2(lb + bh + hl).', 'LSA cuboid = 2h(l + b).', 'TSA cube = 6a², LSA cube = 4a².'),
        remember('All lengths in the same unit before calculating.'),
      ],
      examples: [
        ex('Find the TSA of a cuboid 8 cm × 5 cm × 3 cm.', ['lb = 40, bh = 15, hl = 24', '2(79) = 158'], '158 cm²'),
        ex('A room is 6 m × 4 m × 3 m. Find the area of its four walls.', ['2h(l + b) = 2 × 3 × 10'], '60 m²'),
        ex('The TSA of a cube is 294 cm². Find its edge.', ['6a² = 294 → a² = 49'], '7 cm'),
      ],
      practice: [
        tp('cuboid', (r) => {
          const l = r.int(4, 20), b = r.int(2, 12), hh = r.int(2, 10);
          return typed(`Find the total surface area of a cuboid of length ${l} cm, breadth ${b} cm and height ${hh} cm.`, num(2 * (l * b + b * hh + hh * l), 'cm²'),
            ['TSA = 2(lb + bh + hl).', `lb = ${l * b}, bh = ${b * hh}, hl = ${hh * l}`], [`2(${l * b} + ${b * hh} + ${hh * l}) = ${2 * (l * b + b * hh + hh * l)} cm²`],
            [[String(l * b + b * hh + hh * l), 'Multiply by 2 — each face has an opposite twin.'], [String(l * b * hh), 'That is the volume.']]);
        }),
        tp('lsa', (r) => {
          const l = r.int(4, 12), b = r.int(3, 10), hh = r.int(3, 5);
          return typed(`A room is ${l} m long, ${b} m wide and ${hh} m high. Find the area of its four walls.`, num(2 * hh * (l + b), 'm²'),
            ['Four walls = lateral surface area = 2h(l + b).'], [`2 × ${hh} × (${l} + ${b}) = ${2 * hh * (l + b)} m²`],
            [[String(2 * (l * b + b * hh + hh * l)), 'That includes the floor and ceiling. Walls only: 2h(l + b).']]);
        }),
        tp('cube', (r) => {
          const a = r.int(2, 20);
          return typed(`Find the total surface area of a cube of edge ${a} cm.`, num(6 * a * a, 'cm²'), ['TSA = 6a².'], [`6 × ${a}² = ${6 * a * a} cm²`], [[String(6 * a), 'Each face has area a², not a.'], [String(a ** 3), 'That is the volume.']]);
        }),
        tp('edge', (r) => {
          const a = r.int(2, 15);
          return typed(`The total surface area of a cube is ${6 * a * a} cm². Find the length of its edge.`, num(a, 'cm'),
            ['6a² = TSA, so a² = TSA ÷ 6.'], [`a² = ${6 * a * a} ÷ 6 = ${a * a}`, `a = ${a} cm`], [[String(a * a), 'That is a². Take the square root.']], { steps: [st('What is a²?', num(a * a)), st('Edge a?', num(a, 'cm'))] });
        }, 2),
        tp('paint', (r) => {
          const l = r.int(4, 10), b = r.int(3, 8), hh = r.int(3, 4), rate = r.pick([10, 15, 20, 25]);
          const A = 2 * hh * (l + b) + l * b;
          return typed(`A room ${l} m × ${b} m × ${hh} m is to be painted on its four walls and ceiling (not the floor), at ₹${rate} per m². Find the cost (₹), ignoring doors and windows.`, num(A * rate, '₹'),
            ['Walls: 2h(l + b). Ceiling: l × b.', `Area = ${2 * hh * (l + b)} + ${l * b}`], [`Area = ${A} m²`, `Cost = ${A} × ${rate} = ${inr(A * rate)}`]);
        }, 3),
      ],
    },
    {
      id: 'ts8.m.sav.volume', title: 'Volume of cube and cuboid', prereqs: ['ts8.m.sav.surface'],
      intro: [
        h('How much does it hold?'),
        p('Surface area tells you how much paper wraps a box; volume tells you how much space is inside — how many unit cubes would fill it. A box 4 cubes long, 3 wide and 2 high holds 4 × 3 × 2 = 24 cubes.'),
        f('Volume of cuboid = l × b × h;  volume of cube = a³', 'l times b times h'),
        X({
          title: 'What if? Cuboid volume', formula: 'V = l × b × h',
          result: ['V', 'Volume', 'l*b*h', 'cm³', 2],
          vars: [['l', 'Length l', 1, 30, 1, 10, 'cm'], ['b', 'Breadth b', 1, 30, 1, 5, 'cm'], ['h', 'Height h', 1, 30, 1, 4, 'cm']],
          notes: [['l', 'Volume is directly proportional to each dimension.', 'Halving one dimension halves the volume.']],
          mistakes: [['Adding the dimensions', 'Volume multiplies them: l × b × h.'], ['Writing cm² for volume', 'Volume is in cubic units: cm³, m³.']],
          real: 'A 50 cm × 40 cm × 30 cm aquarium holds 60,000 cm³ = 60 litres of water.',
        }),
        keys('1 cm³ = 1 mL; 1000 cm³ = 1 L.', '1 m³ = 1000 L = 10,00,000 cm³.', 'Doubling every edge of a cube makes its volume 8 times.'),
        remember('Convert all lengths to the same unit before multiplying.'),
      ],
      examples: [
        ex('Find the volume of a cuboid 12 cm × 8 cm × 5 cm.', ['12 × 8 × 5'], '480 cm³'),
        ex('A tank 2 m × 1.5 m × 1 m holds how many litres?', ['V = 3 m³', '3 × 1000'], '3000 litres'),
        ex('A cuboid has volume 360 cm³, length 10 cm and breadth 6 cm. Find its height.', ['h = 360 ÷ 60'], '6 cm'),
      ],
      practice: [
        tp('cuboid', (r) => {
          const l = r.int(3, 25), b = r.int(2, 15), hh = r.int(2, 12);
          return typed(`Find the volume of a cuboid ${l} cm × ${b} cm × ${hh} cm.`, num(l * b * hh, 'cm³'), ['V = l × b × h.'], [`${l} × ${b} × ${hh} = ${l * b * hh} cm³`],
            [[String(2 * (l * b + b * hh + hh * l)), 'That is the surface area. Volume = l × b × h.']]);
        }),
        tp('cube', (r) => {
          const a = r.int(2, 20);
          return typed(`Find the volume of a cube of edge ${a} cm.`, num(a ** 3, 'cm³'), ['V = a³.'], [`${a}³ = ${a ** 3} cm³`], [[String(3 * a), 'a³ means a × a × a.']]);
        }),
        tp('height', (r) => {
          const l = r.int(4, 20), b = r.int(2, 12), hh = r.int(2, 15);
          return typed(`A cuboid has volume ${l * b * hh} cm³, length ${l} cm and breadth ${b} cm. Find its height.`, num(hh, 'cm'), ['h = V ÷ (l × b).'], [`h = ${l * b * hh} ÷ ${l * b} = ${hh} cm`]);
        }),
        tp('litres', (r) => {
          const l = r.int(1, 4) * 50, b = r.int(1, 4) * 20, hh = r.int(1, 5) * 10;
          return typed(`A water tank measures ${l} cm × ${b} cm × ${hh} cm. How many litres does it hold?`, num(l * b * hh / 1000, 'L'),
            ['Find the volume in cm³.', '1000 cm³ = 1 litre.'], [`V = ${l * b * hh} cm³`, `${l * b * hh} ÷ 1000 = ${l * b * hh / 1000} L`],
            [[String(l * b * hh), 'That is in cm³. Divide by 1000 for litres.']]);
        }, 2),
        tp('m3', (r) => {
          const l = r.int(2, 8), b = r.int(1, 5), hh = r.int(1, 3);
          return typed(`A sump is ${l} m long, ${b} m wide and ${hh} m deep. How many litres of water can it hold?`, num(l * b * hh * 1000, 'L'),
            ['1 m³ = 1000 litres.'], [`V = ${l * b * hh} m³ = ${l * b * hh * 1000} L`]);
        }, 2),
      ],
    },
    {
      id: 'ts8.m.sav.apply', title: 'Applications of surface area and volume', prereqs: ['ts8.m.sav.volume'],
      intro: [
        h('Bricks, boxes and tanks'),
        p('How many bricks build a wall? How many small boxes fit in a carton? These questions compare volumes: number = big volume ÷ small volume (when they fit exactly).'),
        f('Number of small blocks = (volume of big box)/(volume of one block)', 'big volume over small volume'),
        X({
          title: 'What if? How many fit?', formula: 'N = (L × B × H)/(l × b × h)',
          result: ['N', 'Number of blocks', '(L*B*H)/(l*b*h)', '', 2],
          vars: [['L', 'Carton length', 10, 100, 5, 60, 'cm'], ['B', 'Carton breadth', 10, 100, 5, 40, 'cm'], ['H', 'Carton height', 10, 100, 5, 30, 'cm'], ['l', 'Box length', 1, 20, 1, 10, 'cm'], ['b', 'Box breadth', 1, 20, 1, 5, 'cm'], ['h', 'Box height', 1, 20, 1, 3, 'cm']],
          notes: [['l', 'Bigger boxes mean fewer fit.', 'Smaller boxes mean more fit.']],
          mistakes: [['Ignoring whether the boxes fit exactly', 'If the edges do not divide evenly, some space is wasted and the answer is smaller.']],
          real: 'A 60 × 40 × 30 cm carton holds 480 boxes of 10 × 5 × 3 cm.',
        }),
        keys('Doubling each edge of a cube: surface area × 4, volume × 8.', 'Painting/wrapping → surface area; filling/storage → volume.'),
        remember('Check units: you cannot divide cm³ by m³ directly.'),
      ],
      examples: [
        ex('How many cubes of edge 2 cm fit in a box 10 cm × 8 cm × 6 cm?', ['(10/2) × (8/2) × (6/2) = 5 × 4 × 3'], '60 cubes'),
        ex('How many bricks 20 cm × 10 cm × 5 cm are needed for a wall 4 m × 0.2 m × 1 m?', ['Wall = 400 × 20 × 100 = 800000 cm³', 'Brick = 1000 cm³'], '800 bricks'),
      ],
      practice: [
        tp('fit', (r) => {
          const a = r.pick([1, 2, 3, 5]), x = r.int(2, 8), y = r.int(2, 6), z = r.int(2, 5);
          return typed(`How many cubes of edge ${a} cm can be packed into a box ${a * x} cm × ${a * y} cm × ${a * z} cm?`, num(x * y * z),
            ['Count along each edge, then multiply.'], [`${a * x}/${a} × ${a * y}/${a} × ${a * z}/${a} = ${x} × ${y} × ${z} = ${x * y * z}`]);
        }),
        tp('bricks', (r) => {
          const L = r.int(2, 8), Hm = r.int(1, 3);
          const wall = L * 100 * 20 * Hm * 100, brick = 20 * 10 * 5;
          return typed(`How many bricks of size 20 cm × 10 cm × 5 cm are needed for a wall ${L} m long, 20 cm thick and ${Hm} m high (ignore mortar)?`, num(wall / brick),
            ['Convert metres to centimetres.', 'Divide wall volume by brick volume.'], [`Wall = ${L * 100} × 20 × ${Hm * 100} = ${wall} cm³`, `Brick = ${brick} cm³`, `${wall} ÷ ${brick} = ${wall / brick}`]);
        }, 2),
        tp('scale', (r) => {
          const k = r.pick([2, 3, 4]), what = r.pick(['surface area', 'volume']);
          return typed(`Each edge of a cube is multiplied by ${k}. By what factor does its ${what} increase?`, num(what === 'volume' ? k ** 3 : k * k),
            [what === 'volume' ? 'Volume = a³.' : 'Surface area = 6a².'], [`(${k}a)${what === 'volume' ? '³' : '²'} = ${what === 'volume' ? k ** 3 : k * k} × a${what === 'volume' ? '³' : '²'}`],
            [[String(k), 'Areas scale by k², volumes by k³.']]);
        }),
        tp('cubes-join', (r) => {
          const a = r.int(2, 8), n = r.int(2, 4);
          const tsa = 2 * (n * a * a + a * a + n * a * a);
          return typed(`${n} cubes, each of edge ${a} cm, are joined end to end in a row. Find the total surface area of the cuboid formed.`, num(tsa, 'cm²'),
            [`The cuboid is ${n * a} × ${a} × ${a}.`, 'Use 2(lb + bh + hl).'], [`l = ${n * a}, b = ${a}, h = ${a}`, `TSA = 2(${n * a * a} + ${a * a} + ${n * a * a}) = ${tsa} cm²`],
            [[String(6 * a * a * n), 'Joined faces are hidden — they are not part of the surface.']]);
        }, 3),
        bank('which-measure', [
          { q: 'To find how much paint is needed for a box, you need its:', a: 'surface area', w: ['volume', 'perimeter', 'diagonal'], h: ['Paint covers the outside.'], s: ['Surface area.'] },
          { q: 'To find how much water a tank holds, you need its:', a: 'volume', w: ['surface area', 'perimeter', 'height only'], h: ['Space inside.'], s: ['Volume (capacity).'] },
          { q: 'How many cm³ are in 1 litre?', a: '1000', w: ['100', '10', '1,000,000'], h: ['1 L = 1000 mL'], s: ['1 mL = 1 cm³.'] },
          { q: 'Two cubes of edge 5 cm are joined. The volume of the new cuboid is:', a: '250 cm³', w: ['125 cm³', '300 cm³', '500 cm³'], h: ['Volumes add.'], s: ['2 × 125 = 250 cm³.'] },
          { q: 'A cube has volume 64 cm³. Its surface area is:', a: '96 cm²', w: ['64 cm²', '24 cm²', '384 cm²'], h: ['a = 4.'], s: ['6 × 16 = 96 cm².'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 15 PLAYING WITH NUMBERS
const DIV_RULES: [number, string][] = [
  [2, 'the last digit is even'], [3, 'the sum of the digits is divisible by 3'], [4, 'the number formed by the last two digits is divisible by 4'],
  [5, 'the last digit is 0 or 5'], [6, 'it is divisible by both 2 and 3'], [8, 'the number formed by the last three digits is divisible by 8'],
  [9, 'the sum of the digits is divisible by 9'], [10, 'the last digit is 0'], [11, 'the difference between the sums of alternate digits is 0 or a multiple of 11'],
];
const dsum = (n: number) => String(n).split('').reduce((s, d) => s + +d, 0);
const ch15: USpec = {
  id: 'ts8.m.ch15', subject: 'math', title: 'Playing with Numbers', source: src(15),
  objectives: [
    {
      id: 'ts8.m.play.divisibility', title: 'Divisibility rules from 2 to 11',
      intro: [
        h('Check without dividing'),
        p('Is 7,48,236 divisible by 9? You could do a long division — or just add its digits: 7 + 4 + 8 + 2 + 3 + 6 = 30, which is not a multiple of 9, so no. Divisibility rules are shortcuts based on how our place-value system works.'),
        keys(...DIV_RULES.map(([d, rule]) => `By ${d}: ${rule}.`)),
        p('Why does the rule for 9 work? 10 = 9 + 1, 100 = 99 + 1, 1000 = 999 + 1. So 4 7 2 = 4 × (99 + 1) + 7 × (9 + 1) + 2 = (multiple of 9) + (4 + 7 + 2). The leftover is the digit sum!'),
        f('abc = 99a + 9b + (a + b + c)', 'a 3-digit number is a multiple of 9 plus its digit sum'),
        X({
          title: 'What if? Digit sum and 9', formula: '100a + 10b + c − (a + b + c) = 99a + 9b',
          result: ['M', 'Number minus its digit sum', '99*a + 9*b'],
          vars: [['a', 'Hundreds digit a', 1, 9, 1, 4], ['b', 'Tens digit b', 0, 9, 1, 7], ['c', 'Units digit c', 0, 9, 1, 2]],
          notes: [['c', 'The units digit cancels out completely — the difference is always a multiple of 9.', 'Changing c never changes the difference.']],
          mistakes: [['Using the digit-sum rule for 4 or 8', 'Digit sums only work for 3 and 9. For 4 and 8 look at the last 2 or 3 digits.']],
          real: 'Shopkeepers once used "casting out nines" to check long bills quickly.',
        }),
        remember('Divisible by 6 needs BOTH 2 and 3; divisible by 12 needs 3 and 4.'),
      ],
      examples: [
        ex('Is 9,57,264 divisible by 8?', ['Last three digits: 264', '264 ÷ 8 = 33'], 'Yes'),
        ex('Is 61,809 divisible by 11?', ['Alternate sums: (9 + 8 + 6) − (0 + 1) = 23 − 1 = 22', '22 is a multiple of 11'], 'Yes'),
      ],
      practice: [
        tp('check', (r) => {
          const [d, rule] = r.pick(DIV_RULES);
          const yes = r.int(0, 1) === 1;
          let n = r.int(1000, 99999); if (yes) n -= n % d; else if (n % d === 0) n += 1;
          return mcq(r, `Is ${n} divisible by ${d}?`, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'], [`Rule for ${d}: ${rule}.`],
            [`${n} ÷ ${d} ${n % d === 0 ? `= ${n / d} exactly` : `leaves remainder ${n % d}`}`, `So the answer is ${n % d === 0 ? 'Yes' : 'No'}.`]);
        }),
        tp('missing9', (r) => {
          const d = r.pick([3, 9]);
          const digits = Array.from({ length: 4 }, () => r.int(1, 9));
          const s = digits.reduce((a, b) => a + b, 0);
          const x = (d - (s % d)) % d;
          const pos = r.int(1, 3);
          const shown = [...digits.slice(0, pos), '□', ...digits.slice(pos)].join('');
          return typed(`Find the smallest digit that can replace □ so that ${shown} is divisible by ${d}.`, num(x),
            [`The digit sum must be a multiple of ${d}.`, `Known digits add to ${s}.`], [`${s} + □ must be a multiple of ${d}`, `□ = ${x}`]);
        }),
        tp('eleven', (r) => {
          const n = r.int(10000, 999999);
          const ds = String(n).split('').reverse().map(Number);
          const odd = ds.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0), even = ds.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
          return typed(`For ${n}, find (sum of digits in odd places from the right) − (sum of digits in even places). Is it a multiple of 11? Type the difference.`, num(odd - even),
            ['Odd places: 1st, 3rd, 5th … from the right.'], [`Odd places sum = ${odd}, even places sum = ${even}`, `Difference = ${n_(odd - even)} → ${(odd - even) % 11 === 0 ? 'divisible by 11' : 'not divisible by 11'}`]);
        }, 2),
        tp('tap-div', (r) => {
          const n = r.pick([360, 840, 1260, 2310, 990, 7920, 4620, 5544]);
          const items = [2, 3, 4, 5, 6, 8, 9, 11].map((d) => ({ label: String(d), ok: n % d === 0 }));
          return { type: 'tap', prompt: `Tap every number that divides ${n} exactly.`, ...tapAll(r, items), hints: ['Use the divisibility rules one at a time.', `Digit sum of ${n} is ${dsum(n)}.`], solution: [`Divisors among these: ${items.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
        }),
        matchT('rules', 'Match each divisor with its test', DIV_RULES.map(([d, rule]) => [`Divisible by ${d}`, rule] as [string, string]), ['Digit-sum tests are for 3 and 9.'], 4),
      ],
    },
    {
      id: 'ts8.m.play.puzzles', title: 'Puzzles based on divisibility; fun with 2- and 3-digit numbers', prereqs: ['ts8.m.play.divisibility'],
      intro: [
        h('Magic with reversed digits'),
        p('Take any 2-digit number, say 47. Reverse it: 74. Add: 47 + 74 = 121 = 11 × 11. Try 38 + 83 = 121 again! Coincidence? No — algebra explains it.'),
        p('A 2-digit number with digits a and b is 10a + b. Reversed: 10b + a. Their sum is 11(a + b) — always a multiple of 11. Their difference is 9(a − b) — always a multiple of 9.'),
        f('(10a + b) + (10b + a) = 11(a + b);  (10a + b) − (10b + a) = 9(a − b)', 'sum is 11 times a plus b; difference is 9 times a minus b'),
        X({
          title: 'What if? Reverse and add', formula: '(10a + b) + (10b + a) = 11(a + b)',
          result: ['S', 'Sum of number and its reverse', '11*(a + b)'],
          vars: [['a', 'Tens digit a', 1, 9, 1, 4], ['b', 'Units digit b', 0, 9, 1, 7]],
          notes: [['a', 'Each extra unit in a adds 11 to the sum.', 'Each unit less removes 11.']],
          mistakes: [['Writing the number ab as a × b', 'The digits a and b make 10a + b, not a × b.']],
          real: '47 + 74 = 11 × 11 = 121.',
        }),
        p('For a 3-digit number abc = 100a + 10b + c, the difference with its reverse cba is 99(a − c) — a multiple of 99. And abc + bca + cab = 111(a + b + c) = 3 × 37 × (a + b + c).'),
        f('abc − cba = 99(a − c)', 'difference of a three digit number and its reverse is 99 times a minus c'),
        X({
          title: 'What if? 3-digit reversal', formula: 'abc − cba = 99(a − c)',
          result: ['D', 'Difference', '99*(a - c)'],
          vars: [['a', 'Hundreds digit a', 1, 9, 1, 7], ['c', 'Units digit c', 1, 9, 1, 2]],
          notes: [['c', 'The middle digit b cancels; only a − c matters.', 'If c > a the difference becomes negative.']],
          mistakes: [['Thinking the middle digit matters', '10b appears in both numbers and cancels.']],
          real: '742 − 247 = 495 = 99 × 5.',
        }),
        keys('ab + ba = 11(a + b).', 'ab − ba = 9(a − b).', 'abc − cba = 99(a − c).', 'abc + bca + cab = 111(a + b + c).'),
        remember('Write a number with digits as a place-value expression before doing algebra.'),
      ],
      examples: [
        ex('The sum of a 2-digit number and its reverse is 143. What is the sum of its digits?', ['11(a + b) = 143', 'a + b = 13'], '13'),
        ex('Find 852 − 258 without subtracting.', ['99 × (8 − 2) = 99 × 6'], '594'),
      ],
      practice: [
        tp('rev-sum', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9);
          return typed(`Add ${10 * a + b} and its reverse ${10 * b + a}. Use 11(a + b).`, num(11 * (a + b)), ['Sum = 11 × (sum of digits).'], [`11 × (${a} + ${b}) = ${11 * (a + b)}`]);
        }),
        tp('rev-diff', (r) => {
          const a = r.int(2, 9), b = r.int(1, a - 1);
          return typed(`Find ${10 * a + b} − ${10 * b + a} using 9(a − b).`, num(9 * (a - b)), ['Difference = 9 × (difference of digits).'], [`9 × (${a} − ${b}) = ${9 * (a - b)}`]);
        }),
        tp('rev3', (r) => {
          const a = r.int(2, 9), b = r.int(0, 9), c = r.int(1, a - 1);
          return typed(`Find ${100 * a + 10 * b + c} − ${100 * c + 10 * b + a} using 99(a − c).`, num(99 * (a - c)), ['The middle digit cancels.'], [`99 × (${a} − ${c}) = ${99 * (a - c)}`]);
        }),
        tp('cyclic', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9), c = r.int(1, 9);
          return typed(`Find ${100 * a + 10 * b + c} + ${100 * b + 10 * c + a} + ${100 * c + 10 * a + b}. (Hint: 111 × digit sum.)`, num(111 * (a + b + c)),
            ['Each digit appears once in every place.'], [`111 × (${a} + ${b} + ${c}) = ${111 * (a + b + c)}`]);
        }),
        tp('digit-sum', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9);
          return typed(`A 2-digit number plus its reverse equals ${11 * (a + b)}. What is the sum of its digits?`, num(a + b), ['11(a + b) = given sum.'], [`a + b = ${11 * (a + b)} ÷ 11 = ${a + b}`]);
        }, 2),
      ],
    },
    {
      id: 'ts8.m.play.missing', title: 'Missing-digit puzzles', prereqs: ['ts8.m.play.divisibility'],
      intro: [
        h('Detective work with digits'),
        p('In a puzzle like  3A + A5 = 82, each letter stands for ONE digit (0–9), and the same letter means the same digit. Use the columns, carries and divisibility to find the letters.'),
        stepsB('Start with the units column.', 'Decide whether there is a carry (it can only be 0 or 1 when adding two numbers).', 'Move left column by column.', 'Check the whole sum at the end.'),
        p('Example: 4A + A2 = 97. Units: A + 2 must end in 7, so A = 5 (no carry). Tens: 4 + 5 = 9 ✓. So 45 + 52 = 97. You can also check with algebra: 40 + A + 10A + 2 = 97 gives 11A = 55, A = 5.'),
        f('Two-digit number with digits A and B = 10A + B', 'ten A plus B'),
        X({
          title: 'What if? Place value of a 2-digit number', formula: 'N = 10A + B',
          result: ['N', 'Number', '10*A + B'],
          vars: [['A', 'Tens digit A', 0, 9, 1, 4], ['B', 'Units digit B', 0, 9, 1, 7]],
          notes: [['A', 'A tens digit is worth ten times its face value.', 'Lowering A by 1 lowers the number by 10.']],
          mistakes: [['Treating AB as A + B', 'AB means 10A + B.']],
          real: 'The puzzle 4A + A2 = 97 becomes 40 + A + 10A + 2 = 97, so 11A = 55 and A = 5.',
        }),
        remember('A carry from one column to the next is at most 1 when adding two numbers.'),
      ],
      examples: [
        ex('Find A: 2A + A4 = 76.', ['As an equation: 20 + A + 10A + 4 = 76', '11A = 52, but 52 is not a multiple of 11', 'So no digit A works — the puzzle has no solution.'], 'No digit works'),
        ex('Find A: A3 + 3A = 99.', ['10A + 3 + 30 + A = 99', '11A = 66', 'A = 6; check 63 + 36 = 99 ✓'], 'A = 6'),
      ],
      practice: [
        tp('add2', (r) => {
          const a = r.int(1, 9), t = r.int(1, 9), u = r.int(0, 9);
          const s = (10 * t + a) + (10 * a + u);
          return typed(`Find the digit A: ${t}A + A${u} = ${s}.`, num(a),
            ['Write as an equation: (10 × ' + t + ' + A) + (10A + ' + u + ').', `${10 * t + u} + 11A = ${s}`], [`11A = ${s} − ${10 * t + u} = ${11 * a}`, `A = ${a}`, `Check: ${10 * t + a} + ${10 * a + u} = ${s} ✓`]);
        }),
        tp('sub', (r) => {
          const a = r.int(2, 9), b = r.int(1, 9);
          const top = 10 * a + b, bot = r.int(10, top - 1);
          return typed(`Find the digit A: A${b} − ${bot} = ${top - bot}.`, num(a),
            [`A${b} = ${top - bot} + ${bot}.`], [`${top - bot} + ${bot} = ${top}`, `So A = ${a}`]);
        }),
        tp('mul', (r) => {
          const a = r.int(2, 9), k = r.int(2, 9);
          const n = 10 + a; // 1A
          return typed(`Find the digit A: 1A × ${k} = ${n * k}.`, num(a),
            [`1A = 10 + A. So (10 + A) × ${k} = ${n * k}.`], [`10 + A = ${n * k} ÷ ${k} = ${n}`, `A = ${a}`]);
        }),
        tp('aa', (r) => {
          const a = r.int(1, 9), b = r.int(1, 9);
          return typed(`AB and BA are 2-digit numbers with AB + BA = ${11 * (a + b)} and A − B = ${a - b}. Find A.`, num(a),
            ['AB + BA = 11(A + B).', 'Now you know A + B and A − B.'], [`A + B = ${a + b}`, `A − B = ${a - b}`, `2A = ${2 * a}, A = ${a}`]);
        }, 3),
        bank('puzzle-facts', [
          { q: 'In a column addition of two numbers, the carry to the next column can be at most:', a: '1', w: ['2', '9', '0'], h: ['9 + 9 = 18'], s: ['The biggest column sum is 9 + 9 + 1 = 19, so carry ≤ 1.'] },
          { q: 'If AB × 9 has digit sum 18, then AB × 9 is divisible by:', a: '9', w: ['only 3', 'only 2', '11'], h: ['Digit sum rule.'], s: ['Any multiple of 9 has digit sum a multiple of 9.'] },
          { q: 'AB means:', a: '10A + B', w: ['A × B', 'A + B', '10B + A'], h: ['Place value.'], s: ['Tens digit A, units digit B.'] },
          { q: 'In AA + AA = 88, A equals:', a: '4', w: ['8', '2', '44'], h: ['AA = 11A'], s: ['22A = 88 → A = 4.'] },
          { q: 'If A + A ends in 6 (units column, no carry in), A could be:', a: '3 or 8', w: ['only 3', 'only 6', '6 or 9'], h: ['2A = 6 or 16'], s: ['A = 3 (6) or A = 8 (16).'] },
        ]),
      ],
    },
    {
      id: 'ts8.m.play.consecutive', title: 'Sum of consecutive numbers', prereqs: ['ts8.m.play.puzzles'],
      intro: [
        h('Young Gauss\'s trick'),
        p('A teacher asked a class to add 1 + 2 + 3 + … + 100. Young Carl Gauss answered in seconds: pair the first and last (1 + 100), second and second-last (2 + 99), … Each pair makes 101, and there are 50 pairs: 5050.'),
        f('1 + 2 + 3 + … + n = n(n + 1)/2', 'n times n plus 1 over 2'),
        X({
          title: 'What if? Sum of the first n numbers', formula: 'S = n(n + 1)/2',
          result: ['S', 'Sum 1 + 2 + … + n', 'n*(n + 1)/2'],
          vars: [['n', 'n', 1, 200, 1, 100]],
          notes: [['n', 'Each new n adds itself to the sum, so the sum grows faster and faster.', 'Removing the last number takes away n.']],
          mistakes: [['n²/2', 'Pairs add to n + 1, not n: use n(n + 1)/2.']],
          real: 'Total sticks in a pyramid stack with rows 1, 2, …, 20: 20 × 21/2 = 210.',
        }),
        p('Sum of k consecutive numbers starting at a = k × (first + last)/2. Every odd number can be written as the sum of two consecutive numbers: 2m + 1 = m + (m + 1).'),
        keys('Sum of k consecutive numbers = k × average of first and last.', 'Sum of 3 consecutive numbers = 3 × middle number.', 'Odd number 2m + 1 = m + (m + 1).'),
        remember('Powers of 2 (like 8, 16, 32) can NEVER be written as a sum of two or more consecutive natural numbers.'),
      ],
      examples: [
        ex('Find 1 + 2 + … + 50.', ['50 × 51/2'], '1275'),
        ex('Find 21 + 22 + … + 30.', ['10 numbers, average (21 + 30)/2 = 25.5', '10 × 25.5 = 255'], '255'),
        ex('Write 45 as a sum of two consecutive numbers.', ['45 = 2 × 22 + 1'], '22 + 23'),
      ],
      practice: [
        tp('gauss', (r) => {
          const n = r.int(10, 150);
          return typed(`Find 1 + 2 + 3 + … + ${n}.`, num(n * (n + 1) / 2), ['Use n(n + 1)/2.'], [`${n} × ${n + 1}/2 = ${n * (n + 1) / 2}`], [[String(n * n / 2), 'Use n(n + 1), not n².']]);
        }),
        tp('range', (r) => {
          const a = r.int(5, 60), k = r.int(5, 20), b = a + k - 1;
          return typed(`Find ${a} + ${a + 1} + … + ${b}.`, num(k * (a + b) / 2),
            [`There are ${b} − ${a} + 1 = ${k} numbers.`, 'Sum = count × (first + last)/2.'], [`${k} × (${a} + ${b})/2 = ${k * (a + b) / 2}`],
            [[String((k - 1) * (a + b) / 2), `Count the terms carefully: ${b} − ${a} + 1 = ${k}.`]]);
        }, 2),
        tp('three', (r) => {
          const m = r.int(5, 99);
          return typed(`Three consecutive numbers add up to ${3 * m}. What is the middle number?`, num(m), ['Sum of 3 consecutive numbers = 3 × middle.'], [`${3 * m} ÷ 3 = ${m}`]);
        }),
        tp('odd-split', (r) => {
          const m = r.int(5, 200);
          return typed(`${2 * m + 1} is written as the sum of two consecutive numbers. What is the smaller one?`, num(m),
            ['2m + 1 = m + (m + 1).'], [`(${2 * m + 1} − 1)/2 = ${m}`, `${m} + ${m + 1} = ${2 * m + 1}`]);
        }),
        bank('cons-facts', [
          { q: 'Which number can NOT be written as a sum of consecutive natural numbers (2 or more)?', a: '16', w: ['15', '9', '21'], h: ['Powers of 2.'], s: ['16 = 2⁴ has no such representation; 15 = 7 + 8, 9 = 4 + 5, 21 = 10 + 11.'] },
          { q: 'The sum of 5 consecutive numbers is always divisible by:', a: '5', w: ['2', '10', '3'], h: ['5 × middle number.'], s: ['(m − 2) + … + (m + 2) = 5m.'] },
          { q: '1 + 2 + … + 10 equals:', a: '55', w: ['50', '100', '45'], h: ['10 × 11/2'], s: ['55.'] },
          { q: 'The sum of two consecutive numbers is always:', a: 'odd', w: ['even', 'a multiple of 3', 'a square'], h: ['m + (m + 1) = 2m + 1'], s: ['2m + 1 is odd.'] },
          { q: 'Gauss paired numbers so that each pair added to:', a: 'n + 1', w: ['n', '2n', '100'], h: ['First + last.'], s: ['1 + n, 2 + (n − 1), … each = n + 1.'] },
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15];
