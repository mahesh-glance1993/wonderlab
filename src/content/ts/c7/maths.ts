// Telangana SCERT Class 7 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts7.m.ch<n>); objectives ts7.m.<topic>.<skill>.
// Every formula has a "what if?" explorer; every template uses only the Rng it is given.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, explore, L, num, frac, choose, matching, ordering, tapAll,
  gcd, simp, fr, rd, inr, range, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(7, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** signed number for display: −3 */
const n_ = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
/** number in brackets when negative: (−3) */
const pn = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
/** fraction in lowest terms with a proper minus sign */
const fx = (n: number, d: number) => fr(n, d).replace('-', '−');
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = (n: number) => String(n).split('').map((d) => (d === '-' ? '⁻' : SUP[+d])).join('');
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
/** a matching template that draws one pair-set from a list (each set has its own prompt; needs >= 5 sets or varied prompts) */
const matchT = (key: string, sets: { q: string; pairs: [string, string][]; h: string[] }[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const s = r.pick(sets);
  return { type: 'match', prompt: s.q, ...matching(r, s.pairs), hints: s.h, solution: s.pairs.map(([a, b]) => `${a} → ${b}`) };
}, d);
/** an ordering template */
const orderT = (key: string, prompt: string, inOrder: string[], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => (
  { type: 'order', prompt, ...ordering(r, inOrder), hints, solution: inOrder.map((s, i) => `${i + 1}. ${s}`) }
), d);
/** n-th step answer helper */
const st = (prompt: string, answer: AnswerSpec) => ({ prompt, answer });
/** non-zero integer in [a, b] */
/** fraction answer that must be typed in lowest terms (key is already reduced) */
const fl = (n: number, d: number) => { const [a, b] = simp(n, d); return frac(a, b, true); };
const nz = (r: Rng, a: number, b: number) => { let x = r.int(a, b); while (x === 0) x = r.int(a, b); return x; };

// ================================================================== CH 1 INTEGERS
const ch1: USpec = {
  id: 'ts7.m.ch1', subject: 'math', title: 'Integers', source: src(1),
  objectives: [
    {
      id: 'ts7.m.int.ops', title: 'Adding, subtracting, multiplying and dividing integers',
      intro: [
        h('Numbers below zero'),
        p('On a winter morning it may be 12 °C in Adilabad but −8 °C in Leh. Below sea level, under the ground, money you owe — all of these need numbers less than zero. Integers are the whole numbers together with their negatives: …, −3, −2, −1, 0, 1, 2, 3, …'),
        vis({ kind: 'number-line', from: -6, to: 6, step: 1, marks: [-4, 3], jumps: [[-4, -1], [-1, 3]] }, 'Number line from −6 to 6: starting at −4 and moving 7 steps right lands on 3, so −4 + 7 = 3'),
        def('Integer', 'Any of the numbers …, −3, −2, −1, 0, 1, 2, 3, … (no fractions or decimals).'),
        h('Adding and subtracting'),
        p('Think of the number line. Adding a positive number moves you RIGHT; adding a negative number moves you LEFT. So −4 + 7 = 3 and 5 + (−8) = −3.'),
        p('Subtracting means "add the opposite". To subtract b, add −b. So 3 − (−5) = 3 + 5 = 8: taking away a debt of ₹5 makes you ₹5 richer!'),
        f('a − b = a + (−b)', 'a minus b equals a plus negative b'),
        X({
          title: 'What if? Subtracting is adding the opposite', formula: 'd = a − b = a + (−b)',
          result: ['d', 'Difference', 'a - b'],
          vars: [['a', 'First integer', -10, 10, 1, 3], ['b', 'Integer taken away', -10, 10, 1, -5]],
          notes: [
            ['a', 'Starting further right on the number line moves the answer right by the same amount.', 'Starting further left moves the answer left by the same amount.'],
            ['b', 'Taking away a bigger number moves the answer LEFT.', 'Taking away a smaller (more negative) number moves the answer RIGHT — taking away a negative adds.'],
          ],
          mistakes: [
            ['3 − (−5) = −2', 'Two minus signs side by side become a plus: 3 − (−5) = 3 + 5 = 8.'],
            ['−6 − 4 = −2', 'Starting at −6 and moving 4 more to the LEFT gives −10.'],
          ],
          real: 'A freezer at −18 °C warms to 4 °C: the change is 4 − (−18) = 22 degrees.',
        }),
        h('Multiplying and dividing'),
        p('Multiply or divide the numbers as usual, then fix the sign: same signs give a POSITIVE answer, different signs give a NEGATIVE answer.'),
        keys('(+) × (+) = +  and  (−) × (−) = +', '(+) × (−) = −  and  (−) × (+) = −', 'Division follows the same sign rules.', 'Any integer × 0 = 0. Dividing by 0 is not defined.'),
        remember('A product of an EVEN number of negative integers is positive; an ODD number of negatives gives a negative product.'),
        tip('Why is (−) × (−) positive? Look at the pattern −3 × 2 = −6, −3 × 1 = −3, −3 × 0 = 0, −3 × (−1) = 3: each step adds 3.'),
      ],
      examples: [
        ex('Find (−15) + 9 − (−4).', ['(−15) + 9 = −6', '−6 − (−4) = −6 + 4', '= −2'], '−2'),
        ex('Find (−6) × (−4) ÷ (−3).', ['(−6) × (−4) = 24 (same signs → positive)', '24 ÷ (−3) = −8 (different signs → negative)'], '−8'),
        ex('Find the product (−1) × (−1) × (−1) × (−1) × (−1).', ['There are 5 negative factors — an odd number.', 'So the product is negative.'], '−1'),
      ],
      practice: [
        tp('add', (r) => {
          const a = nz(r, -40, 40), b = nz(r, -40, 40);
          return typed(`Find ${pn(a)} + ${pn(b)}.`, num(a + b),
            ['Different signs: subtract the sizes and keep the sign of the bigger size.', 'Same signs: add the sizes and keep the sign.'],
            [`${pn(a)} + ${pn(b)} = ${n_(a + b)}`], [[String(-(a + b)), 'Check the sign: which number has the bigger size?']]);
        }),
        tp('sub', (r) => {
          const a = nz(r, -30, 30), b = nz(r, -30, -1);
          return typed(`Find ${pn(a)} − ${pn(b)}.`, num(a - b),
            ['Subtracting is adding the opposite.', `${pn(a)} − ${pn(b)} = ${pn(a)} + ${-b}`],
            [`${pn(a)} − ${pn(b)} = ${pn(a)} + ${-b}`, `= ${n_(a - b)}`], [[String(a + b), 'Taking away a NEGATIVE number makes the answer bigger: change − (−b) into + b.']]);
        }),
        tp('mul', (r) => {
          const a = nz(r, -15, 15), b = nz(r, -12, 12);
          return typed(`Find ${pn(a)} × ${pn(b)}.`, num(a * b),
            ['Multiply the sizes first.', 'Same signs → positive; different signs → negative.'],
            [`${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}`, `Signs ${a < 0 === b < 0 ? 'are the same, so positive' : 'are different, so negative'}: ${n_(a * b)}`],
            [[String(-a * b), 'The size is right but the sign is wrong. Same signs give +, different signs give −.']]);
        }),
        tp('div', (r) => {
          const q = nz(r, -12, 12), b = nz(r, -9, 9);
          const a = q * b;
          return typed(`Find ${pn(a)} ÷ ${pn(b)}.`, num(q),
            ['Divide the sizes first.', 'Division uses the same sign rule as multiplication.'],
            [`${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}`, `Sign: ${a < 0 === b < 0 ? 'same signs → +' : 'different signs → −'}`, `Answer: ${n_(q)}`],
            [[String(-q), 'The size is right; check the sign rule.']]);
        }),
        tp('sign', (r) => {
          const k = r.int(2, 9);
          const neg = k % 2 === 1;
          const parts = Array.from({ length: k }, () => '(−1)').join(' × ');
          return mcq(r, `What is ${parts}?`, neg ? '−1' : '1', [neg ? '1' : '−1', `${-k}`.replace('-', '−'), '0'],
            ['Count the negative factors.', 'Even count → positive, odd count → negative.'],
            [`There are ${k} negative factors (${neg ? 'odd' : 'even'}).`, `Product = ${neg ? '−1' : '1'}`],
            [['wrong', 'Multiplying (−1) by itself only changes the sign each time; the size stays 1.']]);
        }),
      ],
    },
    {
      id: 'ts7.m.int.props', title: 'Properties of integers', prereqs: ['ts7.m.int.ops'],
      intro: [
        h('Rules that always work'),
        p('Some rules are true for every integer you try, and they make calculations faster. Others are true for addition but break for subtraction. Knowing which is which saves you from mistakes.'),
        def('Closure', 'Adding, subtracting or multiplying two integers always gives an integer. Dividing does NOT always: 5 ÷ 2 is not an integer.'),
        def('Commutative', 'Order does not matter: a + b = b + a and a × b = b × a. It FAILS for subtraction (5 − 3 ≠ 3 − 5) and division.'),
        def('Associative', 'Grouping does not matter: (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c).'),
        def('Distributive', 'a × (b + c) = a × b + a × c. Multiplication spreads over addition (and subtraction).'),
        f('a × (b + c) = a × b + a × c', 'a times b plus c equals a b plus a c'),
        X({
          title: 'What if? Distributing a multiplier', formula: 'a × (b + c) = a × b + a × c',
          result: ['P', 'Product', 'a * (b + c)'],
          vars: [['a', 'Multiplier', -10, 10, 1, -7], ['b', 'First number', -10, 100, 1, 100], ['c', 'Second number', -10, 10, 1, -2]],
          notes: [['a', 'Each part b and c is multiplied by the bigger a, so the product changes in step.', 'A smaller multiplier shrinks (or flips the sign of) both parts.']],
          mistakes: [
            ['a × (b + c) = a × b + c', 'The multiplier must reach EVERY term inside the bracket: −7 × (100 − 2) = −700 + 14.'],
            ['Dropping the sign of a negative multiplier', '(−7) × (−2) = +14, not −14.'],
          ],
          real: '(−7) × 98 is easy as (−7) × (100 − 2) = −700 + 14 = −686.',
        }),
        def('Identity', '0 is the additive identity (a + 0 = a); 1 is the multiplicative identity (a × 1 = a).'),
        def('Additive inverse', 'The opposite of a is −a, because a + (−a) = 0. The additive inverse of −9 is 9.'),
        keys('Closure: +, −, × yes; ÷ no.', 'Commutative and associative: + and × yes; − and ÷ no.', 'a × (b + c) = ab + ac', '0 for adding, 1 for multiplying are identities.'),
        remember('a × 0 = 0 for every integer, but a ÷ 0 is not defined.'),
        tip('Group numbers cleverly: (−25) × 37 × 4 = (−25 × 4) × 37 = −100 × 37 = −3700.'),
      ],
      examples: [
        ex('Use the distributive property to find (−12) × 102.', ['(−12) × 102 = (−12) × (100 + 2)', '= (−12) × 100 + (−12) × 2', '= −1200 + (−24) = −1224'], '−1224'),
        ex('Show with an example that subtraction of integers is not commutative.', ['Take a = 4, b = −3.', '4 − (−3) = 7', '(−3) − 4 = −7', '7 ≠ −7'], 'a − b ≠ b − a in general'),
        ex('Find 125 × (−39) × 8 quickly.', ['Use commutative and associative properties: (125 × 8) × (−39)', '= 1000 × (−39)'], '−39000'),
      ],
      practice: [
        tp('distrib', (r) => {
          const a = -r.int(3, 15), base = r.pick([10, 100]), c = nz(r, -4, 4);
          const b = base + c;
          return typed(`Use the distributive property to find ${pn(a)} × ${b}.`, num(a * b),
            [`Write ${b} = ${base} ${c < 0 ? '−' : '+'} ${Math.abs(c)}.`, `Multiply each part by ${pn(a)} and add.`],
            [`${pn(a)} × (${base} ${c < 0 ? '−' : '+'} ${Math.abs(c)})`, `= ${n_(a * base)} ${a * c < 0 ? '−' : '+'} ${Math.abs(a * c)}`, `= ${n_(a * b)}`],
            [[String(-a * b), 'A negative times a positive is negative.']], { steps: [st(`First find ${pn(a)} × ${base}.`, num(a * base)), st('Now the full product.', num(a * b))] });
        }, 2),
        tp('inverse', (r) => {
          const a = nz(r, -50, 50);
          const kind = r.int(0, 2);
          if (kind === 0) return typed(`What is the additive inverse of ${n_(a)}?`, num(-a), ['The additive inverse added to the number gives 0.'], [`${n_(a)} + ${pn(-a)} = 0`, `Inverse = ${n_(-a)}`], [[String(a), 'Adding the number to itself does not give 0. Change the sign.']]);
          if (kind === 1) return typed(`Fill in the blank: ${pn(a)} × ___ = ${n_(a)}`, num(1), ['Which number leaves every number unchanged when you multiply?'], ['1 is the multiplicative identity.', `${pn(a)} × 1 = ${n_(a)}`], [['0', 'Anything × 0 = 0, not the number itself.']]);
          return typed(`Fill in the blank: ${pn(a)} + ___ = ${n_(a)}`, num(0), ['Which number leaves every number unchanged when you add?'], ['0 is the additive identity.', `${pn(a)} + 0 = ${n_(a)}`], [['1', 'Adding 1 changes the number. Which number changes nothing when added?']]);
        }),
        tp('name', (r) => {
          const a = nz(r, -9, 9), b = nz(r, -9, 9), c = nz(r, -9, 9);
          const opts: [string, string][] = [
            [`${pn(a)} × ${pn(b)} = ${pn(b)} × ${pn(a)}`, 'Commutative property of multiplication'],
            [`[${pn(a)} + ${pn(b)}] + ${pn(c)} = ${pn(a)} + [${pn(b)} + ${pn(c)}]`, 'Associative property of addition'],
            [`${pn(a)} × [${pn(b)} + ${pn(c)}] = ${pn(a)} × ${pn(b)} + ${pn(a)} × ${pn(c)}`, 'Distributive property'],
            [`${pn(a)} + 0 = ${n_(a)}`, 'Additive identity'],
            [`${pn(a)} + ${pn(-a)} = 0`, 'Additive inverse'],
          ];
          const [stmt, ans] = r.pick(opts);
          return mcq(r, `Which property is shown? ${stmt}`, ans, opts.map((o) => o[1]).filter((x) => x !== ans),
            ['Order swapped → commutative; brackets moved → associative; multiplier spread out → distributive.'], [`${stmt} shows the ${ans.toLowerCase()}.`]);
        }),
        bank('true-false', [
          { q: 'Which operation is NOT closed for integers?', a: 'Division', w: ['Addition', 'Subtraction', 'Multiplication'], h: ['Try 7 ÷ 2.'], s: ['7 ÷ 2 = 3.5 is not an integer, so integers are not closed under division.'] },
          { q: 'For integers, which is always true?', a: 'a + b = b + a', w: ['a − b = b − a', 'a ÷ b = b ÷ a', '(a − b) − c = a − (b − c)'], h: ['Test each with a = 5, b = 2, c = 1.'], s: ['Only addition (and multiplication) is commutative.'] },
          { q: 'Is (−8) − [(−3) − 2] equal to [(−8) − (−3)] − 2?', a: 'No: the first is −3 and the second is −7', w: ['Yes, both are −3', 'Yes, both are −7', 'No: the first is 3 and the second is 7'], h: ['Work out each bracket first.'], s: ['(−3) − 2 = −5, so (−8) − (−5) = −3.', '(−8) − (−3) = −5, so −5 − 2 = −7.', 'Subtraction is not associative.'] },
          { q: 'What is the multiplicative identity for integers?', a: '1', w: ['0', '−1', '10'], h: ['a × ? = a'], s: ['a × 1 = a for every integer a.'] },
          { q: 'What is (−237) × 0?', a: '0', w: ['−237', '237', 'not defined'], h: ['Any number times zero.'], s: ['Any integer multiplied by 0 gives 0.'] },
          { q: 'Which of these is NOT defined?', a: '(−12) ÷ 0', w: ['0 ÷ (−12)', '(−12) × 0', '0 − (−12)'], h: ['You cannot share into zero groups.'], s: ['Division by zero is not defined; 0 ÷ (−12) = 0 is fine.'] },
        ]),
        tp('clever', (r) => {
          const pair = r.pick([[25, 4], [125, 8], [50, 2], [20, 5]] as const);
          const k = nz(r, -49, 49);
          const neg = r.next() < 0.5 ? -1 : 1;
          const a = neg * pair[0];
          return typed(`Find ${pn(a)} × ${pn(k)} × ${pair[1]} the easy way.`, num(a * k * pair[1]),
            [`Multiply ${pn(a)} × ${pair[1]} first (commutative and associative properties).`],
            [`${pn(a)} × ${pair[1]} = ${n_(a * pair[1])}`, `${n_(a * pair[1])} × ${pn(k)} = ${n_(a * k * pair[1])}`]);
        }),
      ],
    },
    {
      id: 'ts7.m.int.problems', title: 'Problems using negative integers', prereqs: ['ts7.m.int.ops'],
      intro: [
        h('Integers in real life'),
        p('Whenever there is a direction — up/down, gain/loss, above/below, deposit/withdraw — we can call one direction positive and the other negative. Then a word problem becomes an integer calculation.'),
        keys('Above sea level: +, below sea level: −', 'Profit/deposit: +, loss/withdrawal: −', 'Temperature above 0 °C: +, below: −', 'Floors above ground: +, basements: −'),
        p('The DIFFERENCE between two values is always (higher) − (lower). A hill 300 m high and a mine 120 m deep differ by 300 − (−120) = 420 m.'),
        f('change = final − initial', 'change equals final minus initial'),
        X({
          title: 'What if? Temperature change', formula: 'change = final − initial',
          result: ['c', 'Change', 'F - I', '°C'],
          vars: [['I', 'Initial temperature', -20, 40, 1, -5, '°C'], ['F', 'Final temperature', -20, 40, 1, 12, '°C']],
          notes: [['F', 'A warmer final reading means a bigger rise.', 'A colder final reading makes the change smaller, and negative if it is colder than the start.'], ['I', 'Starting warmer leaves less room to rise.', 'Starting colder makes the rise bigger.']],
          mistakes: [['Change from −5 °C to 12 °C is 7', '12 − (−5) = 12 + 5 = 17 degrees. You must subtract the negative, which adds.']],
          real: 'In Kashmir a night at −6 °C followed by a day at 9 °C is a rise of 15 degrees.',
        }),
        remember('A negative change means a decrease (fall, loss, going down).'),
        tip('Draw a quick vertical number line for heights, floors and temperatures.'),
      ],
      examples: [
        ex('In a quiz, +5 is given for a right answer and −2 for a wrong one. Teja gets 7 right and 9 wrong. What is his score?', ['Right: 7 × 5 = 35', 'Wrong: 9 × (−2) = −18', 'Total = 35 + (−18) = 17'], '17 marks'),
        ex('The temperature at midnight is 4 °C. It falls 2 °C every hour. What is the temperature after 7 hours?', ['Change = 7 × (−2) = −14', 'Final = 4 + (−14) = −10'], '−10 °C'),
        ex('A lift starts on floor 5, goes down 8 floors and then up 2 floors. Where does it stop?', ['5 + (−8) = −3', '−3 + 2 = −1'], 'Floor −1 (first basement)'),
      ],
      practice: [
        tp('temp', (r) => {
          const t = r.int(-5, 15), d = r.int(2, 5), hh = r.int(3, 8);
          const fin = t - d * hh;
          return typed(`At 6 p.m. the temperature in a hill town is ${n_(t)} °C. It falls by ${d} °C every hour. What is the temperature after ${hh} hours?`, num(fin, '°C'),
            [`Total fall = ${hh} × ${d}.`, `Temperature = ${n_(t)} − ${d * hh}.`],
            [`Fall = ${hh} × ${d} = ${d * hh} °C`, `${n_(t)} − ${d * hh} = ${n_(fin)} °C`], [[String(t + d * hh), 'The temperature FALLS, so subtract.']]);
        }),
        tp('quiz', (r) => {
          const pp = r.pick([2, 3, 4, 5]), q = r.pick([1, 2]), c = r.int(2, 10), w = r.int(2, 12);
          const s = c * pp - w * q;
          return typed(`In a quiz, ${pp} marks are given for each right answer and −${q} for each wrong answer. ${nm(r)} answers ${c} correctly and ${w} wrongly. What is the total score?`, num(s),
            [`Right answers give ${c} × ${pp}.`, `Wrong answers give ${w} × (−${q}).`],
            [`${c} × ${pp} = ${c * pp}`, `${w} × (−${q}) = −${w * q}`, `Total = ${c * pp} + (−${w * q}) = ${n_(s)}`], [[String(c * pp + w * q), 'Wrong answers take marks AWAY.']]);
        }, 2),
        tp('height', (r) => {
          const up = r.int(2, 30) * 50, down = r.int(2, 30) * 10;
          const thing = r.pick([['An aeroplane flies at', 'a submarine is at'], ['A bird flies at', 'a diver swims at'], ['A hill top is at', 'the bottom of a mine is at']]);
          return typed(`${thing[0]} ${up} m above sea level and ${thing[1]} ${down} m below sea level. What is the vertical distance between them?`, num(up + down, 'm'),
            ['Above sea level is +, below is −.', `Distance = ${up} − (−${down}).`],
            [`${up} − (−${down}) = ${up} + ${down} = ${up + down} m`], [[String(up - down), 'They are on opposite sides of sea level, so the distances add.']]);
        }),
        tp('lift', (r) => {
          const s = r.int(-2, 8), d = r.int(3, 9), u = r.int(1, 4);
          const fin = s - d + u;
          return typed(`A lift is on floor ${n_(s)} (negative floors are basements). It goes down ${d} floors and then up ${u} floors. On which floor is it now? (Type a negative number for a basement.)`, num(fin),
            [`Down is −, up is +.`, `${n_(s)} − ${d} + ${u}`],
            [`${n_(s)} − ${d} = ${n_(s - d)}`, `${n_(s - d)} + ${u} = ${n_(fin)}`]);
        }),
        tp('order', (r) => {
          const vals = r.shuffle([-15, -9, -4, -1, 0, 3, 7, 12, -7, 5]).slice(0, 5).sort((a, b) => a - b);
          return { type: 'order', prompt: 'Put these temperatures (°C) in order from coldest to warmest.', ...ordering(r, vals.map((v) => `${n_(v)} °C`)),
            hints: ['The further left on the number line, the colder.', 'Among negatives, the one with the bigger size is smaller.'], solution: [vals.map((v) => `${n_(v)} °C`).join(' < ')] };
        }),
        tp('bank-acct', (r) => {
          const b = r.int(5, 40) * 100, w = r.int(10, 60) * 100;
          return typed(`${nm(r)} has ${inr(b)} in a bank account and writes a cheque for ${inr(w)}. If the bank allows it, what is the new balance in rupees? (Use a negative number for money owed.)`, num(b - w),
            ['Withdrawal is negative.', `${b} − ${w}`], [`${b} − ${w} = ${n_(b - w)}`, b - w < 0 ? `A balance of ${n_(b - w)} means ${inr(w - b)} is owed.` : 'Money is still left in the account.']);
        }),
      ],
    },
  ],
};

// ================================================================== CH 2 FRACTIONS, DECIMALS AND RATIONAL NUMBERS
const ch2: USpec = {
  id: 'ts7.m.ch2', subject: 'math', title: 'Fractions, Decimals and Rational Numbers', source: src(2),
  objectives: [
    {
      id: 'ts7.m.frac.muldiv', title: 'Multiplying and dividing fractions',
      intro: [
        h('A fraction of a fraction'),
        p('Half a chapati is on your plate and you eat 1/3 of it. How much of the whole chapati did you eat? You took 1/3 OF 1/2. In maths, "of" means multiply: 1/3 × 1/2 = 1/6.'),
        vis({ kind: 'fraction-bar', parts: 6, shaded: 1, label: '1/3 of 1/2 = 1/6' }, 'A bar cut into 6 equal parts with one part shaded, showing one third of one half'),
        f('a/b × c/d = (a × c)/(b × d)', 'a over b times c over d equals a c over b d'),
        X({
          title: 'What if? Multiplying two fractions', formula: 'P = (a × c)/(b × d)',
          result: ['P', 'Product', '(a * c) / (b * d)', '', 3],
          vars: [['a', 'Numerator 1', 1, 9, 1, 1], ['b', 'Denominator 1', 1, 9, 1, 2], ['c', 'Numerator 2', 1, 9, 1, 1], ['d', 'Denominator 2', 1, 9, 1, 3]],
          notes: [['b', 'A bigger denominator means smaller pieces, so the product shrinks.', 'A smaller denominator means bigger pieces, so the product grows.']],
          mistakes: [['Making a common denominator before multiplying', 'That is only needed for adding and subtracting. For multiplying, just multiply tops and bottoms.'], ['Expecting the product to be bigger', 'Multiplying by a proper fraction (less than 1) makes a number SMALLER.']],
          real: 'A recipe for 4 needs 3/4 cup of rice; for 2 people you need 1/2 × 3/4 = 3/8 cup.',
        }),
        h('Dividing by a fraction'),
        def('Reciprocal', 'Two numbers are reciprocals if their product is 1. The reciprocal of 3/5 is 5/3; the reciprocal of 4 is 1/4.'),
        p('How many 1/4 m pieces can be cut from 3 m of ribbon? Each metre gives 4 pieces, so 3 ÷ 1/4 = 3 × 4 = 12. Dividing by a fraction is the same as multiplying by its reciprocal.'),
        f('a/b ÷ c/d = a/b × d/c', 'a over b divided by c over d equals a over b times d over c'),
        keys('"of" means ×.', 'Multiply tops, multiply bottoms, then simplify.', 'To divide, multiply by the reciprocal of the second fraction.', 'Change mixed numbers to improper fractions first.'),
        remember('Cancel common factors before multiplying — the numbers stay small.'),
        tip('Check: dividing by a number less than 1 makes the answer BIGGER.'),
      ],
      examples: [
        ex('Find 2/3 × 9/10.', ['Cancel: 3 and 9 share 3; 2 and 10 share 2.', '= (1 × 3)/(1 × 5)'], '3/5'),
        ex('Find 2 1/2 ÷ 3/4.', ['2 1/2 = 5/2', '5/2 ÷ 3/4 = 5/2 × 4/3', '= 20/6 = 10/3 = 3 1/3'], '10/3 = 3 1/3'),
        ex('What is 3/5 of 40 kg?', ['3/5 × 40 = (3 × 40)/5 = 120/5'], '24 kg'),
      ],
      practice: [
        tp('mul', (r) => {
          const a = r.int(1, 8), b = r.int(a + 1, 12), c = r.int(1, 8), d = r.int(c + 1, 12);
          return typed(`Find ${a}/${b} × ${c}/${d}. Give your answer in lowest terms.`, fl(a * c, b * d),
            ['Multiply the numerators and multiply the denominators.', 'Then simplify.'],
            [`(${a} × ${c})/(${b} × ${d}) = ${a * c}/${b * d}`, `= ${fr(a * c, b * d)}`],
            [[`${a + c}/${b + d}`, 'Do not add tops and bottoms. Multiply them.'], ['not-lowest', 'Correct value — now divide top and bottom by their HCF.']]);
        }),
        tp('of', (r) => {
          const d = r.pick([3, 4, 5, 6, 8, 10]), n = r.int(1, d - 1), k = r.int(2, 12);
          const whole = d * k;
          const unit = r.pick(['kg of rice', 'm of cloth', 'litres of milk', 'students']);
          return typed(`Find ${n}/${d} of ${whole} ${unit}.`, num(n * k),
            [`First find 1/${d} of ${whole}: divide by ${d}.`, `Then multiply by ${n}.`],
            [`1/${d} of ${whole} = ${k}`, `${n}/${d} of ${whole} = ${n} × ${k} = ${n * k}`], [[String(whole * d / n), 'Multiply by the fraction, do not divide.']]);
        }),
        tp('recip', (r) => {
          const a = r.int(1, 9), b = r.int(2, 11);
          const g = gcd(a, b);
          const [x, y] = [a / g, b / g];
          if (x === y) return mcq(r, 'What is the reciprocal of 7?', '1/7', ['7', '−7', '0.7'], ['Reciprocal × number = 1.'], ['7 × 1/7 = 1']);
          return mcq(r, `What is the reciprocal of ${x}/${y}?`, y === 1 ? '1/' + x : x === 1 ? `${y}` : `${y}/${x}`, [`${x}/${y}`, `−${x}/${y}`, `${x + y}/${y}`],
            ['Turn the fraction upside down.'], [`${x}/${y} × ${y}/${x} = 1, so the reciprocal is ${fr(y, x)}.`]);
        }),
        tp('div', (r) => {
          const a = r.int(1, 9), b = r.int(2, 10), c = r.int(1, 9), d = r.int(2, 10);
          return typed(`Find ${a}/${b} ÷ ${c}/${d}. Give your answer in lowest terms.`, fl(a * d, b * c),
            ['Keep the first fraction, flip the second, multiply.', `${a}/${b} × ${d}/${c}`],
            [`${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c}`, `= ${a * d}/${b * c} = ${fr(a * d, b * c)}`],
            [[fr(a * c, b * d), 'You multiplied without flipping the second fraction.'], ['not-lowest', 'Correct value — simplify it fully.']]);
        }, 2),
        tp('ribbon', (r) => {
          const d = r.pick([2, 3, 4, 5]), n = 1, L0 = r.int(2, 12);
          return typed(`A ribbon is ${L0} m long. How many pieces, each ${n}/${d} m long, can be cut from it?`, num(L0 * d),
            [`Find ${L0} ÷ ${n}/${d}.`, 'Dividing by 1/d means multiplying by d.'],
            [`${L0} ÷ 1/${d} = ${L0} × ${d} = ${L0 * d} pieces`], [[fr(L0, d), 'You found a fraction of the ribbon. The question asks HOW MANY pieces.']]);
        }),
      ],
    },
    {
      id: 'ts7.m.dec.muldiv', title: 'Multiplying and dividing decimals',
      intro: [
        h('Decimals are fractions with tens'),
        p('₹12.75 means 12 rupees and 75 paise — 75 hundredths of a rupee. Every decimal is really a fraction with denominator 10, 100, 1000 …, so we can multiply and divide decimals using what we know about whole numbers.'),
        h('Multiplying'),
        stepsB('Ignore the decimal points and multiply as whole numbers.', 'Count the total decimal places in both numbers.', 'Put that many decimal places in the answer.'),
        p('Example: 1.2 × 0.3 → 12 × 3 = 36; places = 1 + 1 = 2; answer 0.36.'),
        f('places in a × b = places in a + places in b', 'decimal places add when multiplying'),
        X({
          title: 'What if? Shifting the decimal point', formula: 'y = x × 10ⁿ',
          result: ['y', 'Result', 'x * 10^n', '', 4],
          vars: [['x', 'Decimal number', 0.01, 99.99, 0.01, 3.75], ['n', 'Power of ten (negative = divide)', -3, 3, 1, 2]],
          notes: [['n', 'Each step up multiplies by 10: the point moves one place to the RIGHT.', 'Each step down divides by 10: the point moves one place to the LEFT.']],
          mistakes: [['3.75 × 100 = 3.7500', 'Multiplying by 100 moves the point 2 places right: 375. Adding zeros at the end of a decimal changes nothing.'], ['0.4 × 0.2 = 0.8', '4 × 2 = 8 and there are 2 decimal places in total: 0.08.']],
          real: 'One pen costs ₹7.25, so 100 pens cost ₹725 — just move the point two places.',
        }),
        h('Dividing'),
        p('Dividing by 10, 100, 1000 moves the point 1, 2, 3 places LEFT. To divide by a decimal, multiply both numbers by the same power of 10 so the divisor becomes a whole number: 2.4 ÷ 0.06 = 240 ÷ 6 = 40.'),
        keys('× 10ⁿ → point moves n places right; ÷ 10ⁿ → n places left.', 'In a product, decimal places add.', 'Make the divisor a whole number before dividing.'),
        remember('Multiplying by a decimal less than 1 makes a number smaller; dividing by one makes it bigger.'),
        tip('Estimate first: 4.9 × 3.1 is about 5 × 3 = 15, so 15.19 is sensible and 1.519 is not.'),
      ],
      examples: [
        ex('Find 2.5 × 1.4.', ['25 × 14 = 350', 'Decimal places: 1 + 1 = 2', '3.50'], '3.5'),
        ex('Find 7.2 ÷ 0.08.', ['Multiply both by 100: 720 ÷ 8', '= 90'], '90'),
        ex('One notebook costs ₹18.50. Find the cost of 12 notebooks.', ['18.50 × 12 = 222.00'], '₹222'),
      ],
      practice: [
        tp('pow10', (r) => {
          const x = rd(r.int(101, 9999) / 100, 2);
          const n = r.pick([10, 100, 1000]);
          const mul = r.next() < 0.5;
          const ans = mul ? rd(x * n, 4) : rd(x / n, 6);
          const k = String(n).length - 1;
          return typed(`Find ${x} ${mul ? '×' : '÷'} ${n}.`, num(ans),
            [`${n} has ${k} zero${k > 1 ? 's' : ''}.`, `Move the decimal point ${k} place${k > 1 ? 's' : ''} to the ${mul ? 'right' : 'left'}.`],
            [`${x} ${mul ? '×' : '÷'} ${n} = ${ans}`], [[String(mul ? rd(x / n, 6) : rd(x * n, 4)), `You moved the point the wrong way. ${mul ? 'Multiplying makes it bigger.' : 'Dividing makes it smaller.'}`]]);
        }),
        tp('mul', (r) => {
          const a = r.int(2, 99), b = r.int(2, 49);
          const pa = r.int(1, 2), pb = r.int(1, 2);
          const x = a / 10 ** pa, y = b / 10 ** pb;
          const ans = rd(x * y, 6);
          return typed(`Find ${x} × ${y}.`, num(ans),
            [`Multiply ${a} × ${b} as whole numbers.`, `Total decimal places: ${pa} + ${pb} = ${pa + pb}.`],
            [`${a} × ${b} = ${a * b}`, `Place the point ${pa + pb} places from the right: ${ans}`],
            [[String(rd((a * b) / 10 ** Math.max(pa, pb), 6)), `Count the decimal places in BOTH numbers and add them: ${pa + pb}.`]]);
        }),
        tp('divwhole', (r) => {
          const d = r.int(2, 9), q = r.int(11, 99) / 10;
          const a = rd(d * q, 4);
          return typed(`Find ${a} ÷ ${d}.`, num(rd(q, 4)),
            ['Divide as usual and keep the decimal point in line.'], [`${a} ÷ ${d} = ${rd(q, 4)}`]);
        }),
        tp('divdec', (r) => {
          const d = r.pick([0.2, 0.4, 0.5, 0.05, 0.25, 0.3, 0.6, 0.08]);
          const q = r.int(2, 40);
          const a = rd(d * q, 4);
          return typed(`Find ${a} ÷ ${d}.`, num(q),
            ['Make the divisor a whole number by multiplying both numbers by 10 or 100.'],
            [`Multiply both by ${d < 0.1 || d === 0.25 ? 100 : 10}: ${rd(a * (d < 0.1 || d === 0.25 ? 100 : 10), 4)} ÷ ${rd(d * (d < 0.1 || d === 0.25 ? 100 : 10), 4)}`, `= ${q}`],
            [[String(rd(a * d, 6)), 'That is the product. You need to divide.']]);
        }, 2),
        tp('shop', (r) => {
          const price = rd(r.int(105, 990) / 10, 2), n = r.int(3, 15);
          const item = r.pick(['pen', 'notebook', 'packet of biscuits', 'bottle of water']);
          return typed(`One ${item} costs ₹${price.toFixed(2)}. Find the cost of ${n} of them (in rupees).`, num(rd(price * n, 2), '₹'),
            [`Multiply ${price} × ${n}.`], [`${price} × ${n} = ${rd(price * n, 2)}`, `Cost = ₹${rd(price * n, 2).toFixed(2)}`]);
        }),
      ],
    },
    {
      id: 'ts7.m.rat.intro', title: 'Introduction to rational numbers', prereqs: ['ts7.m.int.ops', 'ts7.m.frac.muldiv'],
      intro: [
        h('Fractions get a sign'),
        p('Integers gave us negative whole numbers. What about half a degree below zero, −1/2 °C? Numbers like −1/2, 3/4, −7/5 and even 5 = 5/1 belong to a bigger family: the rational numbers.'),
        def('Rational number', 'A number that can be written as p/q, where p and q are integers and q ≠ 0. Examples: 3/4, −2/7, 5, 0, 0.6 = 3/5.'),
        p('Every integer is rational (−4 = −4/1) and every fraction is rational. A rational number is positive if p and q have the same sign and negative if they have different signs: −3/5 = 3/(−5) = −(3/5).'),
        def('Standard form', 'A rational number p/q is in standard form when q is positive and p, q have no common factor except 1. For example −18/24 in standard form is −3/4.'),
        f('p/q = (p × k)/(q × k), k ≠ 0', 'p over q equals p k over q k'),
        X({
          title: 'What if? Equivalent rational numbers', formula: 'v = (p × k)/(q × k) = p/q',
          result: ['v', 'Value', '(p * k) / (q * k)', '', 3],
          vars: [['p', 'Numerator', -9, 9, 1, -3], ['q', 'Denominator', 1, 9, 1, 4], ['k', 'Multiplier', 1, 10, 1, 2]],
          notes: [['k', 'Top and bottom grow together, so the VALUE does not change at all.', 'Top and bottom shrink together; the value stays the same.']],
          mistakes: [['Multiplying only the numerator', 'Only multiplying BOTH parts by the same number keeps the value.'], ['Thinking −3/4 and 3/−4 are different', 'They are equal; standard form puts the minus sign on top: −3/4.']],
          real: 'A 2 °C drop over 4 hours is −2/4 = −1/2 °C per hour.',
        }),
        h('On the number line'),
        p('Positive rationals lie to the right of 0, negative ones to the left. −3/4 lies between −1 and 0, three quarters of the way to −1.'),
        vis({ kind: 'number-line', from: -2, to: 2, step: 0.25, marks: [-0.75, 1.5] }, 'Number line from −2 to 2 in quarters, with −3/4 and 3/2 marked'),
        keys('Rational = p/q, q ≠ 0.', 'Every integer and every fraction is rational.', 'Standard form: positive denominator, lowest terms.', 'To compare negatives: the one closer to 0 is greater.'),
        remember('0 is a rational number (0 = 0/5), but p/0 is not a number at all.'),
        tip('To compare −2/3 and −3/5, make equal denominators: −10/15 and −9/15, so −3/5 is greater.'),
      ],
      examples: [
        ex('Write −36/48 in standard form.', ['HCF of 36 and 48 is 12.', '−36 ÷ 12 = −3, 48 ÷ 12 = 4'], '−3/4'),
        ex('Write 5/(−7) in standard form.', ['Make the denominator positive: multiply top and bottom by −1.'], '−5/7'),
        ex('Which is greater: −2/3 or −4/5?', ['LCM of 3 and 5 is 15.', '−2/3 = −10/15, −4/5 = −12/15', '−10 > −12'], '−2/3 is greater'),
      ],
      practice: [
        tp('standard', (r) => {
          const pp = r.int(1, 9), q = r.int(2, 11), k = r.int(2, 9);
          if (gcd(pp, q) !== 1) return typed(`Write −${4 * k}/${6 * k} in standard form.`, frac(-2, 3, true), ['Divide top and bottom by the HCF.'], [`HCF = ${2 * k}`, '−2/3'], [['not-lowest', 'Divide by the HCF to reach lowest terms.']]);
          const negDen = r.next() < 0.5;
          const shown = negDen ? `${pp * k}/(−${q * k})` : `−${pp * k}/${q * k}`;
          return typed(`Write ${shown} in standard form.`, frac(-pp, q, true),
            ['Make the denominator positive.', `Divide top and bottom by the HCF, ${k}.`],
            [negDen ? `${shown} = −${pp * k}/${q * k}` : `${shown}`, `HCF = ${k}`, `Standard form = −${pp}/${q}`],
            [[`${pp}/${q}`, 'The number is negative: one of p, q is negative.'], ['not-lowest', 'Divide by the HCF to reach lowest terms.']]);
        }),
        tp('equiv', (r) => {
          const pp = -r.int(1, 8), q = r.int(pp > -2 ? 2 : 2, 9), k = r.int(2, 8);
          return typed(`Fill in the missing numerator: ${n_(pp)}/${q} = ?/${q * k}`, num(pp * k),
            [`${q} was multiplied by ${k}.`, 'Do the same to the numerator.'], [`${q} × ${k} = ${q * k}`, `${n_(pp)} × ${k} = ${n_(pp * k)}`], [[String(-pp * k), 'Keep the minus sign.']]);
        }),
        tp('compare', (r) => {
          let a = r.int(1, 8), b = r.int(2, 9), c = r.int(1, 8), d = r.int(2, 9);
          while (a * d === b * c) { c = r.int(1, 8); d = r.int(2, 9); }
          a = -a; c = -c;
          const big = a * d > c * b ? `${n_(a)}/${b}` : `${n_(c)}/${d}`;
          const small = big === `${n_(a)}/${b}` ? `${n_(c)}/${d}` : `${n_(a)}/${b}`;
          return mcq(r, `Which is greater: ${n_(a)}/${b} or ${n_(c)}/${d}?`, big, [small, 'They are equal'],
            ['Write both with the same denominator.', 'For negative numbers, the one closer to 0 is greater.'],
            [`${n_(a)}/${b} = ${n_(a * d)}/${b * d}`, `${n_(c)}/${d} = ${n_(c * b)}/${b * d}`, `${big} is greater (closer to 0).`],
            [['wrong', 'Among negative numbers the one with the SMALLER size is greater.']]);
        }, 2),
        bank('which', [
          { q: 'Which of these is NOT a rational number?', a: '5/0', w: ['0/5', '−5', '−5/7'], h: ['Look at the denominator.'], s: ['A denominator can never be 0, so 5/0 is not a number.'] },
          { q: 'Where does −7/4 lie on the number line?', a: 'Between −2 and −1', w: ['Between −1 and 0', 'Between 1 and 2', 'Between −3 and −2'], h: ['−7/4 = −1 3/4.'], s: ['−7/4 = −1.75, which is between −2 and −1.'] },
          { q: 'Which statement is true?', a: 'Every integer is a rational number', w: ['Every rational number is an integer', '0 is not rational', 'Rational numbers are always positive'], h: ['Can −6 be written as p/q?'], s: ['−6 = −6/1, so every integer is rational; but 1/2 is rational and not an integer.'] },
          { q: 'Which rational number is positive?', a: '−8/(−11)', w: ['−8/11', '8/(−11)', '−(8/11)'], h: ['Same signs → positive.'], s: ['−8/(−11) = 8/11 because the two negatives give a positive.'] },
          { q: 'Which is the standard form of 14/(−21)?', a: '−2/3', w: ['2/(−3)', '−14/21', '2/3'], h: ['Positive denominator, lowest terms.'], s: ['14/(−21) = −14/21 = −2/3.'] },
          { q: 'Which rational number is equal to −3/5?', a: '−12/20', w: ['12/20', '−3/10', '−5/3'], h: ['Multiply top and bottom by the same number.'], s: ['−3 × 4 = −12, 5 × 4 = 20.'] },
        ]),
        tp('order', (r) => {
          const sets = [['−3/2', '−1/2', '0', '1/3', '5/4'], ['−5/3', '−3/4', '−1/6', '2/5', '7/8'], ['−2', '−7/5', '−1/3', '1/4', '3/2'], ['−9/10', '−2/3', '−1/2', '1/5', '6/7'], ['−11/4', '−5/2', '−1', '3/7', '4/3']];
          const s = r.pick(sets);
          return { type: 'order', prompt: 'Arrange these rational numbers in ascending order (smallest first).', ...ordering(r, s),
            hints: ['Negatives come first; the most negative is smallest.', 'Turn each into a decimal if it helps.'], solution: [s.join(' < ')] };
        }),
      ],
    },
  ],
};

// ================================================================== CH 3 SIMPLE EQUATIONS
const ch3: USpec = {
  id: 'ts7.m.ch3', subject: 'math', title: 'Simple Equations', source: src(3),
  objectives: [
    {
      id: 'ts7.m.eq.balance', title: 'An equation is a weighing balance',
      intro: [
        h('Keep the scales level'),
        p('A shopkeeper\'s balance has a bag of x laddoos plus 3 single laddoos on one pan, and 10 single laddoos on the other. The pans are level. How many laddoos are in the bag? Take 3 laddoos off BOTH pans — it stays level — and you see x = 7.'),
        vis({ kind: 'emoji', text: '⚖️  [ x + 3 ]  =  [ 10 ]' }, 'A balance with x plus 3 on the left pan and 10 on the right pan'),
        def('Equation', 'A statement that two expressions are equal, containing a variable: x + 3 = 10.'),
        def('Solution', 'The value of the variable that makes both sides equal. Here x = 7, because 7 + 3 = 10.'),
        p('An equation stays true if you do the SAME thing to both sides: add the same number, subtract the same number, multiply by the same number, or divide by the same non-zero number.'),
        f('if a = b then a + c = b + c, a − c = b − c, a × c = b × c, a ÷ c = b ÷ c (c ≠ 0)', 'do the same thing to both sides'),
        X({
          title: 'What if? Balancing x + a = b', formula: 'x = b − a',
          result: ['x', 'Weight in the bag', 'b - a'],
          vars: [['a', 'Loose weights with the bag', 0, 20, 1, 3], ['b', 'Weights on the other pan', 0, 40, 1, 10]],
          notes: [['a', 'More loose weights beside the bag mean the bag must hold less.', 'Fewer loose weights mean the bag must hold more.'], ['b', 'More weight on the other pan means the bag must be heavier.', 'Less on the other pan means the bag is lighter.']],
          mistakes: [['Subtracting from only one side', 'The balance tips. Whatever you remove from one pan, remove from the other too.']],
          real: 'If a parcel plus a 2 kg box weighs 9 kg, the parcel weighs 9 − 2 = 7 kg.',
        }),
        keys('An equation has an = sign and a variable.', 'Same operation on both sides keeps it balanced.', 'Check a solution by substituting it back.'),
        remember('x + 5 > 9 is NOT an equation (no = sign); 5 + 4 = 9 is a true statement but has no variable.'),
        tip('Say the equation in words: "some number plus 3 is 10" — often you can see the answer.'),
      ],
      examples: [
        ex('Is x = 4 a solution of 3x − 2 = 10?', ['Substitute: 3 × 4 − 2 = 12 − 2 = 10', 'Left side = right side'], 'Yes, x = 4 is the solution'),
        ex('Write an equation: "Four times a number, decreased by 5, gives 19."', ['Let the number be n.', 'Four times: 4n; decreased by 5: 4n − 5'], '4n − 5 = 19'),
        ex('To solve x/3 = 6, what should you do to both sides?', ['x is divided by 3.', 'Undo it by multiplying both sides by 3: x = 18'], 'Multiply both sides by 3'),
      ],
      practice: [
        tp('check', (r) => {
          const a = r.int(2, 7), x = r.int(1, 9), b = r.int(1, 15);
          const c = a * x + b;
          const test = r.pick([x, x + 1, x - 1, x + 2]);
          const ok = test === x;
          return mcq(r, `Is x = ${test} a solution of ${a}x + ${b} = ${c}?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            [`Put x = ${test} into the left side.`, `${a} × ${test} + ${b} = ?`],
            [`${a} × ${test} + ${b} = ${a * test + b}`, ok ? `This equals ${c}, so yes.` : `This is not ${c}, so no.`]);
        }),
        tp('form', (r) => {
          const a = r.int(2, 9), b = r.int(1, 20), c = r.int(20, 80);
          const kind = r.int(0, 2);
          const word = ['added to', 'taken away from', 'more than'][kind];
          const correct = kind === 1 ? `${a}m − ${b} = ${c}` : `${a}m + ${b} = ${c}`;
          const phrase = kind === 0 ? `${b} ${word} ${a} times a number m gives ${c}` : kind === 1 ? `${b} ${word} ${a} times a number m gives ${c}` : `${b} ${word} ${a} times a number m is ${c}`;
          return mcq(r, `Which equation says: "${phrase}"?`, correct, [kind === 1 ? `${a}m + ${b} = ${c}` : `${a}m − ${b} = ${c}`, `${a}(m + ${b}) = ${c}`, `${b}m + ${a} = ${c}`],
            ['"Times a number" means multiply it.', '"Taken away from" means subtract.'], [`Equation: ${correct}`]);
        }),
        tp('step', (r) => {
          const opts: [string, string, string[]][] = [
            [`x + ${r.int(2, 20)} = ${r.int(25, 60)}`, 'Subtract the same number from both sides', ['Add the same number to both sides', 'Multiply both sides by the same number', 'Divide only the left side']],
            [`x − ${r.int(2, 20)} = ${r.int(3, 40)}`, 'Add the same number to both sides', ['Subtract the same number from both sides', 'Divide both sides by the same number', 'Multiply only the left side']],
            [`${r.int(2, 9)}x = ${r.int(2, 9) * 6}`, 'Divide both sides by the same number', ['Multiply both sides by the same number', 'Subtract the same number from both sides', 'Add the same number to both sides']],
            [`x/${r.int(2, 9)} = ${r.int(2, 12)}`, 'Multiply both sides by the same number', ['Divide both sides by the same number', 'Add the same number to both sides', 'Subtract the same number from both sides']],
          ];
          const [eq, ok, wrong] = r.pick(opts);
          return mcq(r, `What is the first step to solve ${eq}?`, ok, wrong, ['Look at what has been done to x, and undo it.', 'Whatever you do, do it to BOTH sides.'], [`In ${eq}, undo the operation on x: ${ok.toLowerCase()}.`]);
        }),
        tp('balance', (r) => {
          const a = r.int(1, 12), x = r.int(1, 20);
          return typed(`A balance has a bag of x marbles and ${a} loose marbles on one pan, and ${a + x} marbles on the other. The pans are level. How many marbles are in the bag?`, num(x),
            [`Write the equation x + ${a} = ${a + x}.`, `Take ${a} marbles off both pans.`], [`x + ${a} = ${a + x}`, `x = ${a + x} − ${a} = ${x}`], [[String(2 * a + x), 'Removing marbles makes the number smaller: subtract.']]);
        }),
        bank('what-is', [
          { q: 'Which of these is an equation?', a: '2y − 1 = 7', w: ['2y − 1 > 7', '2y − 1', '3 + 4 = 7'], h: ['It needs an = sign AND a variable.'], s: ['2y − 1 = 7 has both an equals sign and a variable.'] },
          { q: 'If 5 is added to both sides of p = 9, the new equation is:', a: 'p + 5 = 14', w: ['p + 5 = 9', 'p = 14', '5p = 45'], h: ['Do the same to both sides.'], s: ['p + 5 = 9 + 5 = 14.'] },
          { q: 'Both sides of an equation can be divided by any number EXCEPT:', a: '0', w: ['1', 'a negative number', 'a fraction'], h: ['What is 7 ÷ 0?'], s: ['Division by 0 is not defined.'] },
          { q: 'The solution of 4k = 0 is:', a: 'k = 0', w: ['k = 4', 'k = −4', 'no solution'], h: ['Divide both sides by 4.'], s: ['k = 0 ÷ 4 = 0.'] },
          { q: 'The left side of 3x + 2 = 11 equals the right side when x is:', a: '3', w: ['11', '13/3', '9'], h: ['Try x = 3.'], s: ['3 × 3 + 2 = 11.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.eq.solve', title: 'Solving simple equations', prereqs: ['ts7.m.eq.balance'],
      intro: [
        h('Undo in reverse order'),
        p('To build 3x + 4 from x, you first multiply by 3, then add 4. To get x back, undo these in REVERSE order: first subtract 4, then divide by 3. It is like taking off your shoes before your socks.'),
        stepsB('Undo + or − first (move the constant term).', 'Then undo × or ÷ (free the variable).', 'Check: put your answer back into the original equation.'),
        def('Transposing', 'Moving a term to the other side and changing its sign: x + 4 = 19 becomes x = 19 − 4. It is a shortcut for "subtract 4 from both sides".'),
        f('ax + b = c  ⇒  x = (c − b) ÷ a', 'x equals c minus b, divided by a'),
        X({
          title: 'What if? Solving ax + b = c', formula: 'x = (c − b) / a',
          result: ['x', 'Solution', '(c - b) / a', '', 2],
          vars: [['a', 'Coefficient of x', 1, 10, 1, 3], ['b', 'Constant on the left', -20, 20, 1, 4], ['c', 'Right-hand side', -20, 50, 1, 19]],
          notes: [['a', 'More copies of x share the same total, so each x is smaller.', 'Fewer copies of x must each be bigger.'], ['c', 'A bigger right side needs a bigger x.', 'A smaller right side needs a smaller x.']],
          mistakes: [['Dividing first: 3x + 4 = 19 → x + 4 = 19/3', 'Divide EVERY term, or better, remove the +4 first.'], ['Moving +4 across but keeping it +4', 'A term changes sign when it crosses the = sign: 3x = 19 − 4.']],
          real: 'Three equal pencils and a ₹4 eraser cost ₹19, so each pencil is (19 − 4) ÷ 3 = ₹5.',
        }),
        keys('Reverse the steps used to build the expression.', 'Transposing changes + to − and × to ÷.', 'Always check by substituting.'),
        remember('For 2(x + 3) = 16, either divide by 2 first (x + 3 = 8) or open the bracket (2x + 6 = 16). Both give x = 5.'),
        tip('A solution can be negative or a fraction: 2x + 9 = 3 gives x = −3.'),
      ],
      examples: [
        ex('Solve 5x − 7 = 18.', ['Add 7 to both sides: 5x = 25', 'Divide both sides by 5: x = 5', 'Check: 5 × 5 − 7 = 18 ✓'], 'x = 5'),
        ex('Solve y/4 + 3 = 8.', ['Subtract 3: y/4 = 5', 'Multiply by 4: y = 20'], 'y = 20'),
        ex('Solve 3(m − 2) = 15.', ['Divide by 3: m − 2 = 5', 'Add 2: m = 7'], 'm = 7'),
      ],
      practice: [
        tp('one', (r) => {
          const x = r.int(-12, 25), b = r.int(2, 30);
          const plus = r.next() < 0.5;
          const c = plus ? x + b : x - b;
          return typed(`Solve: x ${plus ? '+' : '−'} ${b} = ${n_(c)}`, num(x),
            [plus ? `Subtract ${b} from both sides.` : `Add ${b} to both sides.`],
            [`x = ${n_(c)} ${plus ? '−' : '+'} ${b} = ${n_(x)}`], [[String(plus ? c + b : c - b), 'Undo the operation: do the OPPOSITE to both sides.']]);
        }),
        tp('two', (r) => {
          const a = r.int(2, 9), x = r.int(-6, 12), b = nz(r, -20, 20);
          const c = a * x + b;
          return typed(`Solve: ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${n_(c)}`, num(x),
            [`First ${b < 0 ? 'add' : 'subtract'} ${Math.abs(b)} on both sides.`, `Then divide both sides by ${a}.`],
            [`${a}x = ${n_(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${n_(c - b)}`, `x = ${n_(c - b)} ÷ ${a} = ${n_(x)}`, `Check: ${a} × ${pn(x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${n_(c)} ✓`],
            [[fx(c + b, a), 'When a term crosses the = sign it changes sign.']], { steps: [st(`Find the value of ${a}x.`, num(c - b)), st('Now find x.', num(x))] });
        }, 2),
        tp('divide', (r) => {
          const a = r.int(2, 8), y = a * r.int(-5, 10), b = r.int(1, 12);
          const c = y / a + b;
          return typed(`Solve: y/${a} + ${b} = ${n_(c)}`, num(y),
            [`Subtract ${b} from both sides.`, `Then multiply both sides by ${a}.`],
            [`y/${a} = ${n_(c - b)}`, `y = ${n_(c - b)} × ${a} = ${n_(y)}`], [[String(rd((c - b) / a, 3)), `y is DIVIDED by ${a}, so undo it by multiplying.`]]);
        }),
        tp('bracket', (r) => {
          const a = r.int(2, 6), x = r.int(-5, 12), b = nz(r, -9, 9);
          const c = a * (x + b);
          return typed(`Solve: ${a}(m ${b < 0 ? '−' : '+'} ${Math.abs(b)}) = ${n_(c)}`, num(x),
            [`Divide both sides by ${a}.`, `Then ${b < 0 ? 'add' : 'subtract'} ${Math.abs(b)}.`],
            [`m ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${n_(c / a)}`, `m = ${n_(x)}`]);
        }, 2),
        tp('bothsides', (r) => {
          const x = r.int(-6, 10), a = r.int(4, 9), c = r.int(1, a - 1), b = r.int(-10, 10);
          const d = a * x + b - c * x;
          return typed(`Solve: ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c === 1 ? '' : c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`, num(x),
            [`Bring the x terms to one side: subtract ${c === 1 ? '' : c}x from both sides.`, 'Bring the numbers to the other side.'],
            [`${a - c}x = ${n_(d)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${n_(d - b)}`, `x = ${n_(d - b)} ÷ ${a - c} = ${n_(x)}`]);
        }, 3),
      ],
    },
    {
      id: 'ts7.m.eq.word', title: 'Word problems with simple equations', prereqs: ['ts7.m.eq.solve'],
      intro: [
        h('From story to equation'),
        p('Many puzzles become easy once you name the unknown. "I think of a number, double it and add 7, and I get 31." Call the number n: 2n + 7 = 31, so n = 12.'),
        stepsB('Read carefully and decide what the unknown is. Give it a letter.', 'Write the other quantities using that letter.', 'Form the equation from the sentence that says "is", "gives" or "equals".', 'Solve it and check the answer in the STORY.'),
        def('Consecutive numbers', 'Numbers that follow one another: n, n + 1, n + 2. Consecutive even (or odd) numbers: n, n + 2, n + 4.'),
        f('perimeter of rectangle = 2(l + b)', 'perimeter is two times length plus breadth'),
        X({
          title: 'What if? Finding a rectangle\'s length from its perimeter', formula: 'l = P/2 − b',
          result: ['l', 'Length', 'P / 2 - b', 'cm'],
          vars: [['P', 'Perimeter', 20, 100, 2, 46, 'cm'], ['b', 'Breadth', 1, 9, 1, 8, 'cm']],
          notes: [['P', 'A longer fence around means a longer length.', 'A shorter fence means a shorter length.'], ['b', 'If the breadth uses more of the fence, less is left for the length.', 'A narrower rectangle leaves more for the length.']],
          mistakes: [['l = P − b', 'The perimeter goes round TWO lengths and TWO breadths: halve it first.']],
          real: 'A 46 m fence around a garden 8 m wide makes it 46/2 − 8 = 15 m long.',
        }),
        keys('Let the unknown be a letter.', 'Translate each phrase: "more than" → +, "less than" → −, "times" → ×.', 'Check the answer makes sense (ages and lengths cannot be negative).'),
        remember('"5 less than x" is x − 5, not 5 − x.'),
        tip('Ages: if someone is a years old now, in 5 years they will be a + 5, and 3 years ago they were a − 3.'),
      ],
      examples: [
        ex('The sum of three consecutive numbers is 51. Find them.', ['Let them be n, n + 1, n + 2.', 'n + n + 1 + n + 2 = 51 → 3n + 3 = 51', '3n = 48 → n = 16'], '16, 17, 18'),
        ex('Kavya\'s mother is 3 times as old as Kavya. Their ages add to 48. How old is Kavya?', ['Let Kavya be k. Mother = 3k.', 'k + 3k = 48 → 4k = 48', 'k = 12'], 'Kavya is 12'),
        ex('A rectangle\'s perimeter is 46 cm and its breadth is 8 cm. Find its length.', ['2(l + 8) = 46', 'l + 8 = 23', 'l = 15'], '15 cm'),
      ],
      practice: [
        tp('think', (r) => {
          const n = r.int(2, 30), a = r.int(2, 6), b = r.int(1, 25);
          const c = a * n + b;
          return typed(`${nm(r)} thinks of a number, multiplies it by ${a} and adds ${b}. The result is ${c}. What was the number?`, num(n),
            [`Equation: ${a}n + ${b} = ${c}.`], [`${a}n + ${b} = ${c}`, `${a}n = ${c - b}`, `n = ${n}`], [[String(rd((c + b) / a, 2)), `Undo "+ ${b}" by subtracting.`]]);
        }),
        tp('consec', (r) => {
          const n = r.int(5, 60), k = r.pick([2, 3]);
          const s = k === 2 ? 2 * n + 1 : 3 * n + 3;
          return typed(`The sum of ${k} consecutive numbers is ${s}. What is the smallest of them?`, num(n),
            [k === 2 ? 'Call them n and n + 1.' : 'Call them n, n + 1 and n + 2.', 'Add them and set the sum equal.'],
            [k === 2 ? `n + (n + 1) = ${s} → 2n + 1 = ${s}` : `n + (n + 1) + (n + 2) = ${s} → 3n + 3 = ${s}`, `n = ${n}`, `Numbers: ${Array.from({ length: k }, (_, i) => n + i).join(', ')}`]);
        }, 2),
        tp('age', (r) => {
          const k = r.int(8, 15), m = r.int(3, 4);
          const who = nm(r);
          return typed(`${who}'s father is ${m} times as old as ${who}. The sum of their ages is ${k + m * k} years. How old is ${who}?`, num(k),
            [`Let ${who}'s age be a. Father = ${m}a.`, `a + ${m}a = ${k + m * k}`],
            [`${m + 1}a = ${k + m * k}`, `a = ${k}`, `${who} is ${k}, father is ${m * k}.`], [[String(m * k), 'That is the father\'s age.']]);
        }),
        tp('rect', (r) => {
          const b = r.int(3, 15), l = b + r.int(1, 12);
          const P = 2 * (l + b);
          return typed(`The perimeter of a rectangular field is ${P} m and its breadth is ${b} m. Find its length.`, num(l, 'm'),
            ['Perimeter = 2(l + b).', `2(l + ${b}) = ${P}`],
            [`l + ${b} = ${P / 2}`, `l = ${l} m`], [[String(P - b), 'Halve the perimeter first: a rectangle has two lengths.'], [String(P / 2), `That is l + b. Subtract the breadth ${b}.`]]);
        }),
        tp('money', (r) => {
          const pen = r.int(5, 25), n = r.int(2, 8), extra = r.int(10, 60);
          const tot = n * pen + extra;
          return typed(`${nm(r)} buys ${n} pens and one geometry box costing ₹${extra}, paying ₹${tot} in all. What does one pen cost (₹)?`, num(pen, '₹'),
            [`${n}p + ${extra} = ${tot}`], [`${n}p = ${tot - extra}`, `p = ₹${pen}`]);
        }),
        tp('angles', (r) => {
          const x = r.int(10, 40), a = r.int(2, 4);
          const third = 180 - x - a * x;
          if (third <= 0) return typed('Two angles of a triangle are x and 2x, and the third angle is 60°. Find x.', num(40, '°'), ['Angles of a triangle add to 180°.'], ['x + 2x + 60 = 180', '3x = 120', 'x = 40°']);
          return typed(`Two angles of a triangle are x and ${a}x, and the third angle is ${third}°. Find x (in degrees).`, num(x, '°'),
            ['Angles of a triangle add to 180°.', `x + ${a}x + ${third} = 180`],
            [`${a + 1}x = ${180 - third}`, `x = ${x}°`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 4 LINES AND ANGLES
const ch4: USpec = {
  id: 'ts7.m.ch4', subject: 'math', title: 'Lines and Angles', source: src(4),
  objectives: [
    {
      id: 'ts7.m.angle.pairs', title: 'Pairs of angles',
      intro: [
        h('Angles come in pairs'),
        p('Open a door a little: the angle the door makes with the wall and the angle it makes with the doorway together form a straight line. Angles that work together like this have special names.'),
        def('Complementary angles', 'Two angles whose sum is 90°. 30° and 60° are complements of each other.'),
        def('Supplementary angles', 'Two angles whose sum is 180°. 110° and 70° are supplements of each other.'),
        def('Adjacent angles', 'Two angles with a common vertex and a common arm, lying on opposite sides of that arm (they do not overlap).'),
        def('Linear pair', 'Adjacent angles whose outer arms form a straight line. They always add to 180°.'),
        def('Vertically opposite angles', 'When two lines cross, the angles opposite each other at the crossing point. They are always EQUAL.'),
        f('complement = 90° − x;  supplement = 180° − x', 'complement is 90 minus x, supplement is 180 minus x'),
        X({
          title: 'What if? The supplement of an angle', formula: 's = 180° − x',
          result: ['s', 'Supplement', '180 - x', '°'],
          vars: [['x', 'Angle', 1, 179, 1, 65, '°']],
          notes: [['x', 'A bigger angle leaves less of the straight line, so its supplement is smaller.', 'A smaller angle leaves more of the straight line, so its supplement is bigger.']],
          mistakes: [['Mixing up 90° and 180°', 'Complement → Corner (90°). Supplement → Straight line (180°).'], ['Saying 120° has a complement', 'A complement must be positive, so only angles less than 90° have complements.']],
          real: 'A ladder leaning at 70° to the ground makes 180° − 70° = 110° with the ground on the other side.',
        }),
        keys('Complementary: sum 90°. Supplementary: sum 180°.', 'Linear pair: adjacent and supplementary.', 'Vertically opposite angles are equal.', 'Angles round a point add to 360°.'),
        remember('Why are vertically opposite angles equal? Each one forms a linear pair with the SAME angle between them, so both equal 180° minus that angle.'),
        tip('Two equal complementary angles are 45° each; two equal supplementary angles are 90° each.'),
      ],
      examples: [
        ex('Find the complement of 37°.', ['Complement = 90° − 37°'], '53°'),
        ex('Two lines cross. One angle is 72°. Find the other three angles.', ['Its vertically opposite angle is 72°.', 'The neighbouring angles form linear pairs: 180° − 72° = 108°.'], '72°, 108°, 108°'),
        ex('Two supplementary angles are in the ratio 4 : 5. Find them.', ['Let them be 4k and 5k.', '4k + 5k = 180° → k = 20°'], '80° and 100°'),
      ],
      practice: [
        tp('comp', (r) => {
          const x = r.int(5, 85);
          return typed(`Find the complement of ${x}°.`, num(90 - x, '°'), ['Complementary angles add to 90°.'], [`90° − ${x}° = ${90 - x}°`], [[String(180 - x), 'That is the SUPPLEMENT (180°). Complements add to 90°.']]);
        }),
        tp('supp', (r) => {
          const x = r.int(5, 175);
          return typed(`Find the supplement of ${x}°.`, num(180 - x, '°'), ['Supplementary angles add to 180°.'], [`180° − ${x}° = ${180 - x}°`], [[String(90 - x), 'That is the complement. Supplements add to 180°.']]);
        }),
        tp('cross', (r) => {
          const x = r.int(20, 160);
          const ask = r.pick(['vo', 'lp'] as const);
          return typed(`Two straight lines cross at O. One of the angles at O is ${x}°. Find the angle ${ask === 'vo' ? 'vertically opposite to it' : 'that forms a linear pair with it'}.`, num(ask === 'vo' ? x : 180 - x, '°'),
            [ask === 'vo' ? 'Vertically opposite angles are equal.' : 'A linear pair adds to 180°.'], [ask === 'vo' ? `Vertically opposite angle = ${x}°` : `180° − ${x}° = ${180 - x}°`],
            [[String(ask === 'vo' ? 180 - x : x), ask === 'vo' ? 'That is the neighbouring angle. The OPPOSITE angle is equal.' : 'That is the opposite angle. The neighbouring angle is its supplement.']]);
        }),
        tp('ratio', (r) => {
          const tot = r.pick([90, 180]);
          const [a, b] = r.pick([[1, 2], [2, 3], [1, 5], [4, 5], [3, 7], [1, 3], [7, 11], [5, 13]] as const);
          const k = tot / (a + b);
          if (!Number.isInteger(k)) return typed('Two complementary angles are in the ratio 2 : 3. Find the larger angle.', num(54, '°'), ['2k + 3k = 90°'], ['k = 18°', 'Angles 36° and 54°']);
          return typed(`Two ${tot === 90 ? 'complementary' : 'supplementary'} angles are in the ratio ${a} : ${b}. Find the larger angle.`, num(b * k, '°'),
            [`Let the angles be ${a}k and ${b}k.`, `${a}k + ${b}k = ${tot}°`], [`${a + b}k = ${tot}° → k = ${k}°`, `Angles: ${a * k}° and ${b * k}°`], [[String(a * k), 'That is the smaller angle.']]);
        }, 2),
        matchT('names', [
          { q: 'Match each pair of angles with its description (set A).', pairs: [['35° and 55°', 'Complementary'], ['35° and 145°', 'Supplementary'], ['Opposite angles where two lines cross', 'Always equal'], ['Linear pair', 'Adjacent and add to 180°']], h: ['90° → complementary; 180° → supplementary.'] },
          { q: 'Match each pair of angles with its description (set B).', pairs: [['18° and 72°', 'Complementary'], ['100° and 80°', 'Supplementary'], ['Angles round a point', 'Add to 360°'], ['Two right angles', 'Supplementary and equal']], h: ['Add each pair.'] },
          { q: 'Match each angle with its complement.', pairs: [['20°', '70°'], ['45°', '45°'], ['62°', '28°'], ['89°', '1°']], h: ['Complement = 90° − angle.'] },
          { q: 'Match each angle with its supplement.', pairs: [['30°', '150°'], ['90°', '90°'], ['115°', '65°'], ['179°', '1°']], h: ['Supplement = 180° − angle.'] },
          { q: 'Match each word with its meaning.', pairs: [['Adjacent', 'Common vertex and common arm'], ['Vertically opposite', 'Formed opposite each other by crossing lines'], ['Complementary', 'Sum is 90°'], ['Supplementary', 'Sum is 180°']], h: ['Think of a corner (90°) and a straight line (180°).'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.angle.transversal', title: 'Transversals and parallel lines', prereqs: ['ts7.m.angle.pairs'],
      intro: [
        h('A line that crosses two lines'),
        p('Look at a railway track: two parallel rails, and a road crossing both at a slant. A line that cuts two or more lines at different points is called a transversal. It makes 8 angles — 4 at each crossing.'),
        def('Transversal', 'A line that intersects two (or more) lines at distinct points.'),
        def('Corresponding angles', 'Angles in the SAME position at each crossing (both above-left, both below-right, …). Think of an "F" shape.'),
        def('Alternate interior angles', 'Angles BETWEEN the two lines, on OPPOSITE sides of the transversal. Think of a "Z" shape.'),
        def('Co-interior angles', 'Angles between the two lines on the SAME side of the transversal (also called interior angles on the same side). Think of a "C" or "U" shape.'),
        h('When the two lines are parallel'),
        keys('Corresponding angles are equal.', 'Alternate interior angles are equal (and so are alternate exterior angles).', 'Co-interior angles add to 180°.'),
        f('co-interior: x + y = 180°', 'co-interior angles add to 180 degrees'),
        X({
          title: 'What if? Angles made by a transversal on parallel lines', formula: 'y = 180° − x',
          result: ['y', 'Co-interior angle', '180 - x', '°'],
          vars: [['x', 'Angle at the first line', 10, 170, 1, 70, '°']],
          notes: [['x', 'Tilt the transversal so x grows: the co-interior angle on the other line shrinks by the same amount, while corresponding and alternate angles stay equal to x.', 'As x shrinks, its co-interior partner grows.']],
          mistakes: [['Making co-interior angles equal', 'Co-interior angles are SUPPLEMENTARY (sum 180°). Corresponding and alternate angles are the equal ones.'], ['Using these rules when lines are not parallel', 'If the lines are not parallel, corresponding angles are not equal.']],
          real: 'Window grills and zebra crossings use parallel bars; every bar meets a slanting bar at the same angle.',
        }),
        remember('F → corresponding (equal), Z → alternate (equal), C → co-interior (sum 180°).'),
        tip('Once you know ONE of the 8 angles on parallel lines, you can find all the others: each is either x or 180° − x.'),
      ],
      examples: [
        ex('Lines l ∥ m are cut by a transversal. One angle is 65°. Find its corresponding angle and its co-interior angle.', ['Corresponding angles are equal: 65°', 'Co-interior angles add to 180°: 180° − 65° = 115°'], 'Corresponding 65°, co-interior 115°'),
        ex('How many angles does a transversal make with two lines?', ['4 angles at each crossing', '2 crossings'], '8 angles'),
        ex('Alternate interior angles on parallel lines are (2x + 10)° and 70°. Find x.', ['Alternate interior angles are equal.', '2x + 10 = 70', 'x = 30'], 'x = 30'),
      ],
      practice: [
        tp('find', (r) => {
          const x = r.int(25, 155);
          const kind = r.pick(['corresponding', 'alternate interior', 'co-interior', 'alternate exterior'] as const);
          const ans = kind === 'co-interior' ? 180 - x : x;
          return typed(`Lines l and m are parallel and cut by a transversal. One angle is ${x}°. Find its ${kind} angle.`, num(ans, '°'),
            [kind === 'co-interior' ? 'Co-interior angles add to 180°.' : `${kind[0].toUpperCase() + kind.slice(1)} angles are equal on parallel lines.`],
            [kind === 'co-interior' ? `180° − ${x}° = ${ans}°` : `${kind} angle = ${x}°`], x === 90 ? [] : [[String(kind === 'co-interior' ? x : 180 - x), kind === 'co-interior' ? 'Co-interior angles are supplementary, not equal.' : 'These angles are equal, not supplementary.']]);
        }),
        bank('shape', [
          { q: 'Which letter shape helps you spot corresponding angles?', a: 'F', w: ['Z', 'C', 'X'], h: ['Both angles are on the same side, in the same position.'], s: ['Corresponding angles sit in an F shape.'] },
          { q: 'Which letter shape helps you spot alternate interior angles?', a: 'Z', w: ['F', 'C', 'T'], h: ['Between the lines, on opposite sides of the transversal.'], s: ['Alternate angles sit inside a Z shape.'] },
          { q: 'Co-interior angles on parallel lines are:', a: 'supplementary', w: ['equal', 'complementary', 'always 90°'], h: ['They are inside a C shape.'], s: ['Co-interior angles add to 180°.'] },
          { q: 'How many angles are formed when a transversal cuts two lines?', a: '8', w: ['4', '6', '2'], h: ['Count the angles at each crossing.'], s: ['4 at each of the 2 crossings = 8.'] },
          { q: 'If two lines are NOT parallel, their corresponding angles are:', a: 'not equal', w: ['always equal', 'always 90°', 'always supplementary'], h: ['The equal-angle rule needs parallel lines.'], s: ['Only parallel lines give equal corresponding angles.'] },
          { q: 'A transversal is perpendicular to one of two parallel lines. The angle it makes with the other line is:', a: '90°', w: ['45°', '180°', 'it cannot be found'], h: ['Corresponding angles are equal.'], s: ['The corresponding angle is also 90°, so it is perpendicular to both.'] },
        ]),
        tp('algebra', (r) => {
          const x = r.int(5, 30), a = r.int(2, 5), b = r.int(-10, 20);
          const ang = a * x + b;
          if (ang <= 10 || ang >= 170 || b === 0) return typed('Corresponding angles on parallel lines are (3x + 5)° and 65°. Find x.', num(20), ['They are equal.'], ['3x + 5 = 65', 'x = 20']);
          const kind = r.pick(['corresponding', 'alternate interior']);
          return typed(`On parallel lines, a pair of ${kind} angles measure (${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)})° and ${ang}°. Find x.`, num(x),
            [`${kind[0].toUpperCase() + kind.slice(1)} angles are equal.`, `${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${ang}`], [`${a}x = ${ang - b}`, `x = ${x}`]);
        }, 2),
        tp('cointerior', (r) => {
          const x = r.int(10, 40), a = r.int(1, 3), c = r.int(1, 3);
          const rest = 180 - (a + c) * x;
          if (rest <= 0) return typed('Co-interior angles on parallel lines are (2x)° and (x + 30)°. Find x.', num(50), ['They add to 180°.'], ['3x + 30 = 180', 'x = 50']);
          return typed(`On parallel lines, a pair of co-interior angles measure ${a === 1 ? '' : a}x° and (${c === 1 ? '' : c}x + ${rest})°. Find x.`, num(x),
            ['Co-interior angles add to 180°.', `${a + c}x + ${rest} = 180`], [`${a + c}x = ${180 - rest}`, `x = ${x}`]);
        }, 2),
        matchT('match', [
          { q: 'l ∥ m and one angle is 50°. Match each angle with its size.', pairs: [['Corresponding angle', '50°'], ['Co-interior angle', '130°'], ['Alternate interior angle', '50° (Z shape)'], ['Linear pair with the 50° angle', '130° (straight line)']], h: ['Each angle is either 50° or 130°.'] },
          { q: 'l ∥ m and one angle is 75°. Match each angle with its size.', pairs: [['Corresponding angle', '75°'], ['Co-interior angle', '105°'], ['Vertically opposite angle', '75° (crossing lines)'], ['Linear pair with the 75° angle', '105° (straight line)']], h: ['Each angle is either 75° or 105°.'] },
          { q: 'Match each angle pair with its rule when the lines are parallel.', pairs: [['Corresponding', 'Equal (F shape)'], ['Alternate interior', 'Equal (Z shape)'], ['Co-interior', 'Add to 180° (C shape)'], ['Vertically opposite', 'Equal (X shape)']], h: ['Only co-interior angles are not equal.'] },
          { q: 'l ∥ m and one angle is 120°. Match each angle with its size.', pairs: [['Alternate interior angle', '120°'], ['Co-interior angle', '60°'], ['Corresponding angle', '120° (F shape)'], ['Linear pair with the 120° angle', '60° (straight line)']], h: ['Each angle is either 120° or 60°.'] },
          { q: 'Match each shape with the angle pair it shows.', pairs: [['F', 'Corresponding angles'], ['Z', 'Alternate angles'], ['C', 'Co-interior angles'], ['X', 'Vertically opposite angles']], h: ['Trace the letter over the transversal and lines.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.angle.parallel', title: 'Checking whether lines are parallel', prereqs: ['ts7.m.angle.transversal'],
      intro: [
        h('Working backwards'),
        p('A carpenter wants two shelves to be exactly parallel. Instead of measuring the gap everywhere, she measures the angle each shelf makes with a slanting support. If the angles match, the shelves are parallel. The rules for parallel lines also work in reverse.'),
        keys('If corresponding angles are equal, the lines are parallel.', 'If alternate interior angles are equal, the lines are parallel.', 'If co-interior angles add to 180°, the lines are parallel.'),
        p('So we can TEST for parallel lines by measuring just one pair of angles.'),
        f('lines parallel ⇔ x + y = 180° for co-interior angles x, y', 'co-interior angles add to 180 exactly when the lines are parallel'),
        X({
          title: 'What if? Testing co-interior angles', formula: 'gap = 180° − (x + y)  (0 means parallel)',
          result: ['g', 'How far from parallel', '180 - (x + y)', '°'],
          vars: [['x', 'First co-interior angle', 30, 150, 1, 100, '°'], ['y', 'Second co-interior angle', 30, 150, 1, 80, '°']],
          notes: [['y', 'If x + y grows past 180°, the lines open out (they would meet on the other side).', 'If x + y falls below 180°, the lines lean towards each other on this side.']],
          mistakes: [['Testing with co-interior angles being equal', 'Equal co-interior angles (like 70° and 70°) do NOT prove parallel lines; they must add to 180°.']],
          real: 'Rail tracks stay the same distance apart; every sleeper makes co-interior angles that add to 180° with them.',
        }),
        remember('Two lines perpendicular to the same line are parallel to each other (co-interior angles 90° + 90° = 180°).'),
        tip('In a figure, first find the transversal, then the angle pair, then use the rule.'),
      ],
      examples: [
        ex('A transversal makes co-interior angles of 75° and 105° with lines p and q. Are p and q parallel?', ['75° + 105° = 180°', 'Co-interior angles are supplementary.'], 'Yes, p ∥ q'),
        ex('Corresponding angles measure 62° and 64°. Are the lines parallel?', ['Corresponding angles must be equal for parallel lines.', '62° ≠ 64°'], 'No'),
        ex('∠1 = 3x° and ∠2 = 2x° are co-interior angles between parallel lines. Find both angles.', ['3x + 2x = 180', 'x = 36', '∠1 = 108°, ∠2 = 72°'], '108° and 72°'),
      ],
      practice: [
        tp('test-co', (r) => {
          const x = r.int(40, 140), ok = r.next() < 0.5;
          const y = ok ? 180 - x : 180 - x + r.pick([-6, -4, -2, 2, 4, 6]);
          return mcq(r, `A transversal makes co-interior angles of ${x}° and ${y}° with two lines. Are the lines parallel?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['Co-interior angles on parallel lines add to 180°.'], [`${x}° + ${y}° = ${x + y}°`, ok ? 'Sum is 180°, so the lines are parallel.' : 'Sum is not 180°, so the lines are not parallel.']);
        }),
        tp('test-corr', (r) => {
          const x = r.int(30, 150), ok = r.next() < 0.5;
          let y = ok ? x : x + r.pick([-3, -1, 1, 3, 180 - 2 * x]);
          if (!ok && y === x) y = x + 2;
          const kind = r.pick(['corresponding', 'alternate interior']);
          return mcq(r, `A transversal makes ${kind} angles of ${x}° and ${y}° with two lines. Are the lines parallel?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            [`${kind[0].toUpperCase() + kind.slice(1)} angles must be EQUAL for the lines to be parallel.`], [ok ? 'The angles are equal, so the lines are parallel.' : `${x}° ≠ ${y}°, so the lines are not parallel.`]);
        }),
        tp('ratio', (r) => {
          const [a, b] = r.pick([[1, 2], [2, 3], [1, 3], [4, 5], [1, 5], [7, 8], [5, 7], [1, 4]] as const);
          const k = 180 / (a + b);
          return typed(`Two co-interior angles between parallel lines are in the ratio ${a} : ${b}. Find the smaller angle.`, num(a * k, '°'),
            [`${a}k + ${b}k = 180°`], [`k = ${k}°`, `Angles ${a * k}° and ${b * k}°`], [[String(b * k), 'That is the larger angle.']]);
        }, 2),
        tp('needed', (r) => {
          const x = r.int(35, 145);
          const kind = r.pick(['corresponding', 'co-interior', 'alternate interior'] as const);
          const ans = kind === 'co-interior' ? 180 - x : x;
          return typed(`One angle made by a transversal with line p is ${x}°. What must its ${kind} angle with line q be so that p ∥ q?`, num(ans, '°'),
            [kind === 'co-interior' ? 'Co-interior angles must add to 180°.' : 'The angles must be equal.'], [`${kind} angle = ${ans}°`]);
        }),
        bank('reason', [
          { q: 'Two lines are both perpendicular to a third line. The two lines are:', a: 'parallel to each other', w: ['perpendicular to each other', 'always meeting', 'the same line'], h: ['Co-interior angles 90° + 90°.'], s: ['90° + 90° = 180°, so they are parallel.'] },
          { q: 'Alternate interior angles are 47° and 47°. The lines are:', a: 'parallel', w: ['not parallel', 'perpendicular', 'impossible to tell'], h: ['Equal alternate angles → parallel.'], s: ['Equal alternate interior angles prove the lines are parallel.'] },
          { q: 'Co-interior angles are 85° and 85°. The lines are:', a: 'not parallel', w: ['parallel', 'perpendicular', 'equal'], h: ['Co-interior angles must ADD to 180°.'], s: ['85° + 85° = 170° ≠ 180°, so the lines are not parallel.'] },
          { q: 'Which one pair of angles is enough to test whether two lines are parallel?', a: 'Any one pair of corresponding angles', w: ['Two vertically opposite angles', 'A linear pair', 'Two angles at the same crossing'], h: ['The pair must use both crossings.'], s: ['Vertically opposite angles and linear pairs are at one crossing; they say nothing about the other line.'] },
          { q: 'Corresponding angles are 70° and 110°. The lines are:', a: 'not parallel', w: ['parallel', 'perpendicular', 'the same line'], h: ['They must be equal.'], s: ['70° ≠ 110°, so not parallel.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 5 TRIANGLE AND ITS PROPERTIES
const ch5: USpec = {
  id: 'ts7.m.ch5', subject: 'math', title: 'Triangle and Its Properties', source: src(5),
  objectives: [
    {
      id: 'ts7.m.tri.classify', title: 'Kinds of triangles and the rule for sides',
      intro: [
        h('Three sticks, one triangle?'),
        p('Take sticks of 3 cm, 4 cm and 10 cm. Try to join them into a triangle — the two short sticks cannot reach each other! A triangle is possible only when its sides follow a simple rule.'),
        vis({ kind: 'triangle', a: 3, b: 4, c: 5, angleLabels: ['A', 'B', 'C'] }, 'Triangle ABC with sides 3, 4 and 5'),
        h('Naming triangles'),
        def('By sides', 'Scalene: all sides different. Isosceles: at least two sides equal. Equilateral: all three sides equal.'),
        def('By angles', 'Acute-angled: all angles less than 90°. Right-angled: one angle is 90°. Obtuse-angled: one angle more than 90°.'),
        h('The triangle rule for sides'),
        p('The sum of any two sides of a triangle is GREATER than the third side. Also, the difference of any two sides is LESS than the third side. So the third side must lie strictly between the difference and the sum of the other two.'),
        f('|a − b| < c < a + b', 'the third side is between the difference and the sum'),
        X({
          title: 'What if? The longest possible third side', formula: 'c must be less than a + b',
          result: ['c', 'Largest whole-number third side', 'a + b - 1', 'cm'],
          vars: [['a', 'First side', 1, 20, 1, 5, 'cm'], ['b', 'Second side', 1, 20, 1, 8, 'cm']],
          notes: [['a', 'A longer side lets the two sides stretch further, so the third side can be longer.', 'A shorter side limits how far the two sides reach.']],
          mistakes: [['Allowing c = a + b', 'If c = a + b the two short sides lie flat on the long one — no triangle. The sum must be strictly greater.'], ['Checking only one pair', 'Check that the two SHORTEST sides add to more than the longest; then all pairs work.']],
          real: 'A 5 m and an 8 m beam can be joined to a third beam shorter than 13 m and longer than 3 m.',
        }),
        keys('Scalene, isosceles, equilateral — by sides.', 'Acute, right, obtuse — by angles.', 'Two shorter sides must add to MORE than the longest side.', 'Third side lies between the difference and the sum.'),
        remember('A triangle can have at most ONE right angle or ONE obtuse angle.'),
        tip('Quick test: add the two smallest numbers and compare with the largest.'),
      ],
      examples: [
        ex('Can 4 cm, 5 cm and 10 cm be the sides of a triangle?', ['Two smallest: 4 + 5 = 9', '9 < 10'], 'No'),
        ex('Two sides of a triangle are 6 cm and 9 cm. Between which lengths must the third side lie?', ['Difference: 9 − 6 = 3', 'Sum: 9 + 6 = 15'], 'Between 3 cm and 15 cm'),
        ex('A triangle has angles 30°, 60° and 90°. Classify it by angles.', ['One angle is exactly 90°.'], 'Right-angled triangle'),
      ],
      practice: [
        tp('possible', (r) => {
          const a = r.int(2, 12), b = r.int(2, 12);
          const c = r.pick([a + b, a + b + r.int(1, 4), Math.abs(a - b) + 1, a + b - 1, Math.max(a, b)]);
          const ok = c < a + b && c > Math.abs(a - b);
          const [s1, s2, s3] = [a, b, c].sort((x, y) => x - y);
          return mcq(r, `Can ${a} cm, ${b} cm and ${c} cm be the sides of a triangle?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['Add the two shortest sides.', 'Compare with the longest side.'], [`${s1} + ${s2} = ${s1 + s2}`, `${s1 + s2} ${s1 + s2 > s3 ? '>' : s1 + s2 === s3 ? '=' : '<'} ${s3}`, ok ? 'The sum is greater, so a triangle is possible.' : 'The sum is not greater, so no triangle.'],
            [['wrong', 'The sum of the two shorter sides must be strictly GREATER than the longest side.']]);
        }),
        tp('range', (r) => {
          const a = r.int(3, 15), b = r.int(3, 15);
          const big = r.next() < 0.5;
          if (a === b) return typed(`Two sides of a triangle are ${a} cm each. What is the largest whole-number length (in cm) the third side can have?`, num(2 * a - 1, 'cm'), ['The third side must be less than the sum.'], [`Sum = ${2 * a}`, `Largest whole number less than ${2 * a} is ${2 * a - 1}`]);
          return typed(`Two sides of a triangle are ${a} cm and ${b} cm. What is the ${big ? 'largest' : 'smallest'} whole-number length (in cm) the third side can have?`, num(big ? a + b - 1 : Math.abs(a - b) + 1, 'cm'),
            ['The third side lies strictly between the difference and the sum.', `Difference = ${Math.abs(a - b)}, sum = ${a + b}`],
            [`${Math.abs(a - b)} < third side < ${a + b}`, `${big ? 'Largest' : 'Smallest'} whole number: ${big ? a + b - 1 : Math.abs(a - b) + 1} cm`],
            [[String(big ? a + b : Math.abs(a - b)), 'The third side cannot EQUAL the sum or difference — it must be strictly between them.']]);
        }, 2),
        tp('by-angle', (r) => {
          const kind = r.int(0, 2);
          let a: number, b: number;
          if (kind === 0) { a = r.int(50, 80); b = r.int(Math.max(15, 91 - a), 85); }
          else if (kind === 1) { a = r.int(15, 75); b = 90 - a; }
          else { a = r.int(95, 140); b = r.int(10, 170 - a); }
          const c = 180 - a - b;
          const ans = ['Acute-angled', 'Right-angled', 'Obtuse-angled'][kind];
          return mcq(r, `A triangle has angles ${a}°, ${b}° and ${c}°. What kind of triangle is it?`, ans, ['Acute-angled', 'Right-angled', 'Obtuse-angled', 'Equilateral'].filter((x) => x !== ans),
            ['Look at the largest angle.'], [`Largest angle = ${Math.max(a, b, c)}°`, `${ans} triangle`]);
        }),
        tp('by-side', (r) => {
          const kind = r.int(0, 2);
          const a = r.int(4, 12);
          const sides = kind === 0 ? [a, a, a] : kind === 1 ? r.shuffle([a, a, a + r.int(1, 3)]) : [a, a + 1, a + r.int(2, 4)];
          const ans = ['Equilateral', 'Isosceles', 'Scalene'][kind];
          return mcq(r, `A triangle has sides ${sides.join(' cm, ')} cm. What kind of triangle is it?`, ans, ['Equilateral', 'Isosceles', 'Scalene', 'Right-angled'].filter((x) => x !== ans),
            ['Count how many sides are equal.'], [`${kind === 0 ? 'All three' : kind === 1 ? 'Exactly two' : 'No'} sides are equal → ${ans}`]);
        }),
        bank('facts', [
          { q: 'Can a triangle have two right angles?', a: 'No — the angles would already add to 180° without the third', w: ['Yes, if it is isosceles', 'Yes, always', 'Only if it is equilateral'], h: ['90° + 90° = ?'], s: ['90° + 90° = 180°, leaving 0° for the third angle — impossible.'] },
          { q: 'Every equilateral triangle is also:', a: 'isosceles and acute-angled', w: ['scalene', 'right-angled', 'obtuse-angled'], h: ['Each angle is 60°.'], s: ['All sides equal means at least two equal (isosceles); 60° angles are acute.'] },
          { q: 'In a right-angled triangle, the longest side is:', a: 'opposite the right angle', w: ['next to the right angle', 'always the base', 'equal to the other two together'], h: ['The biggest angle faces the longest side.'], s: ['The hypotenuse is opposite the 90° angle and is the longest side.'] },
          { q: 'Which set of lengths CANNOT make a triangle?', a: '2 cm, 3 cm, 5 cm', w: ['3 cm, 4 cm, 5 cm', '5 cm, 5 cm, 5 cm', '4 cm, 6 cm, 9 cm'], h: ['Add the two shortest.'], s: ['2 + 3 = 5, which is not greater than 5.'] },
          { q: 'A triangle can have at most how many obtuse angles?', a: '1', w: ['2', '3', '0'], h: ['Two obtuse angles already add to more than 180°.'], s: ['Only one angle can be more than 90°.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.tri.lines', title: 'Medians and altitudes of a triangle', prereqs: ['ts7.m.tri.classify'],
      intro: [
        h('Special lines inside a triangle'),
        p('Balance a cardboard triangle on your fingertip. There is one perfect balancing point, and it lies on three special lines called medians. Another set of lines, the altitudes, tell you the "height" of the triangle.'),
        def('Median', 'The line segment joining a vertex to the MIDPOINT of the opposite side. A triangle has 3 medians, and they meet at one point inside the triangle (the centroid — the balancing point).'),
        def('Altitude', 'The perpendicular line segment from a vertex to the opposite side (or to that side extended). A triangle has 3 altitudes.'),
        stepsB('For a median from A: find the midpoint D of BC (BD = DC), then join AD.', 'For an altitude from A: draw AL so that AL ⊥ BC (it makes 90° with BC).'),
        p('In a right-angled triangle, the two sides that make the right angle are themselves altitudes. In an obtuse-angled triangle, two altitudes fall OUTSIDE the triangle, on the extended sides.'),
        f('median AD: BD = DC = BC ÷ 2', 'a median cuts the opposite side into two equal parts'),
        X({
          title: 'What if? Where the median lands', formula: 'BD = BC ÷ 2',
          result: ['BD', 'Distance from B to the median\'s foot', 'BC / 2', 'cm'],
          vars: [['BC', 'Length of side BC', 2, 30, 1, 14, 'cm']],
          notes: [['BC', 'A longer side moves the midpoint further from B — always exactly half way.', 'A shorter side moves the midpoint closer to B.']],
          mistakes: [['Thinking the median is perpendicular to the side', 'That is the altitude. A median goes to the MIDPOINT; it is perpendicular only in special triangles.']],
          real: 'Hang a cardboard triangle from one corner by a thread: the thread lines up with a median.',
        }),
        keys('Median: vertex → midpoint of opposite side.', 'Altitude: vertex → opposite side at 90°.', 'Every triangle has 3 medians and 3 altitudes.', 'In an equilateral triangle each median is also an altitude.'),
        remember('In an isosceles triangle, the median to the unequal side is also the altitude.'),
        tip('Medians are always inside the triangle; altitudes can be outside (obtuse triangles).'),
      ],
      examples: [
        ex('In △PQR, PM is a median and QR = 18 cm. Find QM.', ['M is the midpoint of QR.', 'QM = 18 ÷ 2'], '9 cm'),
        ex('In right △ABC with ∠B = 90°, name an altitude from A.', ['AB ⊥ BC because ∠B = 90°.'], 'AB'),
        ex('How many medians and altitudes does an equilateral triangle have, and how are they related?', ['3 medians and 3 altitudes', 'In an equilateral triangle each median is perpendicular to its side, so it is also an altitude.'], '3 lines that are both medians and altitudes'),
      ],
      practice: [
        tp('mid', (r) => {
          const L0 = r.int(3, 25) * 2;
          const [V, A, B] = r.pick([['A', 'B', 'C'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['L', 'M', 'N']]);
          return typed(`In △${V}${A}${B}, ${V}D is a median and ${A}${B} = ${L0} cm. Find ${A}D.`, num(L0 / 2, 'cm'),
            ['A median goes to the MIDPOINT of the opposite side.'], [`${A}D = ${L0} ÷ 2 = ${L0 / 2} cm`], [[String(L0), 'D is the midpoint, so take half of the side.']]);
        }),
        tp('whole', (r) => {
          const hlf = r.int(3, 20);
          return typed(`AD is a median of △ABC and BD = ${hlf} cm. Find BC.`, num(2 * hlf, 'cm'),
            ['D is the midpoint of BC, so BD = DC.'], [`BC = BD + DC = ${hlf} + ${hlf} = ${2 * hlf} cm`], [[String(hlf), 'That is only half of BC.']]);
        }),
        bank('which', [
          { q: 'A segment from a vertex that is perpendicular to the opposite side is called:', a: 'an altitude', w: ['a median', 'a side', 'a bisector of the side'], h: ['Perpendicular means 90°.'], s: ['The altitude meets the opposite side at 90°.'] },
          { q: 'A segment from a vertex to the midpoint of the opposite side is called:', a: 'a median', w: ['an altitude', 'a hypotenuse', 'an exterior angle'], h: ['Midpoint → median.'], s: ['That is the definition of a median.'] },
          { q: 'How many medians does a triangle have?', a: '3', w: ['1', '2', '6'], h: ['One from each vertex.'], s: ['One median from each of the 3 vertices.'] },
          { q: 'In which triangle do some altitudes lie outside the triangle?', a: 'Obtuse-angled', w: ['Acute-angled', 'Equilateral', 'Every triangle'], h: ['Try drawing the altitude from an acute vertex of an obtuse triangle.'], s: ['In an obtuse triangle the altitudes from the two acute vertices fall outside, on the extended sides.'] },
          { q: 'In right △ABC with ∠C = 90°, which side is an altitude?', a: 'AC (it is perpendicular to BC)', w: ['AB', 'the median from C', 'none of the sides'], h: ['Which sides make the right angle?'], s: ['AC ⊥ BC, so AC is the altitude from A to BC (and BC is the altitude from B).'] },
          { q: 'Where do the three medians of a triangle meet?', a: 'At one point inside the triangle', w: ['Outside the triangle', 'At a vertex', 'They never meet'], h: ['Think of the balancing point.'], s: ['The medians always meet at one point inside, called the centroid.'] },
        ]),
        tp('tap', (r) => {
          const all = [
            { label: 'A median joins a vertex to the midpoint of the opposite side.', ok: true },
            { label: 'Every triangle has exactly three altitudes.', ok: true },
            { label: 'In an equilateral triangle each median is also an altitude.', ok: true },
            { label: 'Medians always lie inside the triangle.', ok: true },
            { label: 'An altitude always passes through the midpoint of a side.', ok: false },
            { label: 'A triangle has only one median.', ok: false },
            { label: 'Altitudes always lie inside the triangle.', ok: false },
            { label: 'A median is always perpendicular to the side.', ok: false },
          ];
          const pick = [...r.shuffle(all.filter((x) => x.ok)).slice(0, 2), ...r.shuffle(all.filter((x) => !x.ok)).slice(0, 2)];
          return { type: 'tap', prompt: 'Tap every TRUE statement.', ...tapAll(r, pick), hints: ['Median → midpoint. Altitude → 90°.'], solution: pick.map((x) => `${x.ok ? 'True' : 'False'}: ${x.label}`) };
        }),
        matchT('match', [
          { q: 'Match each term with its meaning.', pairs: [['Median', 'Vertex to midpoint of opposite side'], ['Altitude', 'Vertex to opposite side at 90°'], ['Centroid', 'Point where the medians meet'], ['Midpoint', 'Point dividing a side into two equal parts']], h: ['Median ↔ midpoint.'] },
          { q: 'Match each triangle with a fact about its altitudes.', pairs: [['Acute-angled', 'All altitudes inside'], ['Right-angled', 'Two sides are altitudes'], ['Obtuse-angled', 'Two altitudes outside'], ['Equilateral', 'Altitudes are also medians']], h: ['Draw a quick sketch of each.'] },
          { q: 'In △ABC, AD is a median and BC = 12 cm. Match each length.', pairs: [['BC', '12 cm'], ['BD', '6 cm'], ['DC', '6 cm (equal to BD)'], ['BD + DC', '12 cm (the whole side)']], h: ['D is the midpoint.'] },
          { q: 'Count the special lines. Match each with the number.', pairs: [['Medians in a triangle', '3'], ['Right angles in a right triangle', '1'], ['Altitudes outside an obtuse triangle', '2'], ['Points where medians meet', 'Exactly one point']], h: ['One median per vertex.'] },
          { q: 'Match each symbol to its meaning.', pairs: [['⊥', 'Perpendicular to'], ['∥', 'Parallel to'], ['△', 'Triangle'], ['∠', 'Angle']], h: ['These symbols appear in geometry questions.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.tri.angles', title: 'Angle-sum and exterior angle properties', prereqs: ['ts7.m.tri.classify', 'ts7.m.angle.transversal'],
      intro: [
        h('Tear the corners off'),
        p('Draw any triangle on paper, tear off its three corners and place them side by side. They always make a straight line! That shows the three angles of every triangle add to 180°.'),
        p('Why? Draw a line through one vertex parallel to the opposite side. The two alternate angles copy the other two angles of the triangle, and the three angles sit on that straight line.'),
        f('∠A + ∠B + ∠C = 180°', 'the angles of a triangle add to 180 degrees'),
        X({
          title: 'What if? The third angle of a triangle', formula: '∠C = 180° − ∠A − ∠B',
          result: ['C', 'Third angle', '180 - A - B', '°'],
          vars: [['A', 'Angle A', 10, 120, 1, 60, '°'], ['B', 'Angle B', 10, 50, 1, 45, '°']],
          notes: [['A', 'If one angle opens wider, the third angle must close up to keep the total 180°.', 'If one angle closes, the third opens wider.']],
          mistakes: [['Adding to 360°', '360° is for a QUADRILATERAL. A triangle\'s angles add to 180°.']],
          real: 'A roof truss with one angle 90° and another 35° must have 55° at the third corner.',
        }),
        h('Exterior angles'),
        def('Exterior angle', 'Extend one side of a triangle; the angle between the extended side and the next side is an exterior angle.'),
        def('Interior opposite angles', 'The two angles of the triangle that are NOT next to the exterior angle.'),
        p('The exterior angle and its neighbouring interior angle form a linear pair (180°). The three interior angles also add to 180°. So the exterior angle equals the sum of the two interior opposite angles.'),
        f('exterior angle = sum of the two interior opposite angles', 'exterior angle equals the sum of the two opposite interior angles'),
        keys('Angles of a triangle add to 180°.', 'Exterior angle = sum of the two interior opposite angles.', 'An exterior angle is larger than each interior opposite angle.', 'Equal sides face equal angles (isosceles triangles).'),
        remember('Each angle of an equilateral triangle is 60°; the base angles of an isosceles triangle are equal.'),
        tip('In an isosceles triangle with apex angle a, each base angle is (180° − a) ÷ 2.'),
      ],
      examples: [
        ex('Two angles of a triangle are 48° and 67°. Find the third.', ['48 + 67 = 115', '180 − 115 = 65'], '65°'),
        ex('An exterior angle of a triangle is 120° and one interior opposite angle is 45°. Find the other interior opposite angle.', ['Exterior = sum of interior opposite angles', '120 = 45 + x', 'x = 75'], '75°'),
        ex('The angles of a triangle are in the ratio 2 : 3 : 4. Find them.', ['2k + 3k + 4k = 180', 'k = 20'], '40°, 60°, 80°'),
      ],
      practice: [
        tp('third', (r) => {
          const a = r.int(20, 100), b = r.int(15, 160 - a);
          return typed(`Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, num(180 - a - b, '°'),
            ['The three angles add to 180°.'], [`${a} + ${b} = ${a + b}`, `180 − ${a + b} = ${180 - a - b}°`], [[String(360 - a - b), 'A triangle\'s angles add to 180°, not 360°.']]);
        }),
        tp('ext', (r) => {
          const a = r.int(20, 80), b = r.int(20, 80);
          return typed(`In △PQR, side QR is extended to S. If ∠P = ${a}° and ∠Q = ${b}°, find the exterior angle ∠PRS.`, num(a + b, '°'),
            ['Exterior angle = sum of the two interior opposite angles.'], [`∠PRS = ${a}° + ${b}° = ${a + b}°`], a + b === 90 ? [] : [[String(180 - a - b), 'That is the interior angle ∠R. The exterior angle is its supplement.']]);
        }),
        tp('ext-back', (r) => {
          const a = r.int(20, 80), b = r.int(20, 80);
          return typed(`An exterior angle of a triangle is ${a + b}° and one of its interior opposite angles is ${a}°. Find the other interior opposite angle.`, num(b, '°'),
            ['Exterior angle = sum of the two interior opposite angles.'], [`${a + b} = ${a} + x`, `x = ${b}°`]);
        }),
        tp('ratio', (r) => {
          const tri = r.pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [2, 3, 5], [1, 2, 6], [4, 5, 9], [1, 3, 5]]);
          const s = tri[0] + tri[1] + tri[2];
          const k = 180 / s;
          return typed(`The angles of a triangle are in the ratio ${tri.join(' : ')}. Find the largest angle.`, num(tri[2] * k, '°'),
            [`${tri[0]}k + ${tri[1]}k + ${tri[2]}k = 180°`], [`${s}k = 180 → k = ${k}`, `Angles: ${tri.map((t) => t * k + '°').join(', ')}`], [], { steps: [st('Find k.', num(k)), st('Find the largest angle.', num(tri[2] * k, '°'))] });
        }, 2),
        tp('isos', (r) => {
          const apex = r.int(10, 80) * 2;
          const ask = r.next() < 0.5;
          if (ask) return typed(`In an isosceles triangle the angle between the two equal sides is ${apex}°. Find each base angle.`, num((180 - apex) / 2, '°'),
            ['The two base angles are equal.', `Together they make 180° − ${apex}°.`], [`180 − ${apex} = ${180 - apex}`, `Each base angle = ${(180 - apex) / 2}°`], [[String(180 - apex), 'Share this between the TWO base angles.']]);
          const base = (180 - apex) / 2;
          return typed(`Each base angle of an isosceles triangle is ${base}°. Find the third angle.`, num(apex, '°'), ['The base angles are equal.'], [`180 − 2 × ${base} = ${apex}°`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 6 RATIO - APPLICATIONS
const ch6: USpec = {
  id: 'ts7.m.ch6', subject: 'math', title: 'Ratio - Applications', source: src(6),
  objectives: [
    {
      id: 'ts7.m.ratio.prop', title: 'Ratio, proportion and the unitary method',
      intro: [
        h('Comparing by division'),
        p('A recipe for upma uses 2 cups of rava for every 5 cups of water. If you double the rava you must double the water, or the upma turns out wrong. The comparison "2 to 5" is a ratio, and keeping it the same is what proportion is about.'),
        def('Ratio', 'A comparison of two quantities of the same kind by division, written a : b (read "a is to b"). Both must be in the same unit.'),
        def('Simplest form', 'A ratio whose terms have no common factor except 1. 12 : 18 = 2 : 3 (divide both by 6).'),
        def('Proportion', 'Two equal ratios: a : b = c : d, written a : b :: c : d. Then a × d = b × c (product of extremes = product of means).'),
        f('a : b :: c : d  ⇔  a × d = b × c', 'a is to b as c is to d exactly when a d equals b c'),
        h('Unitary method and direct proportion'),
        p('If 6 pens cost ₹48, one pen costs 48 ÷ 6 = ₹8, so 10 pens cost 10 × 8 = ₹80. First find the value of ONE unit, then multiply. Two quantities are in direct proportion when doubling one doubles the other — their ratio stays the same.'),
        f('cost of m items = (cost of n items ÷ n) × m', 'cost of m items equals cost of n items divided by n, times m'),
        X({
          title: 'What if? The unitary method', formula: 'T = (C ÷ n) × m',
          result: ['T', 'Cost of m items', 'C / n * m', '₹', 2],
          vars: [['C', 'Cost of n items', 10, 500, 1, 48, '₹'], ['n', 'Number of items bought', 1, 20, 1, 6], ['m', 'Number of items wanted', 1, 30, 1, 10]],
          notes: [['m', 'Buying more items costs more in direct proportion: twice the items, twice the cost.', 'Fewer items cost proportionally less.'], ['n', 'If the same money bought more items, each item is cheaper.', 'If the same money bought fewer items, each item is dearer.']],
          mistakes: [['Multiplying before dividing by the wrong number', 'Always find the cost of ONE item first: C ÷ n.'], ['Comparing 50 paise to ₹2 as 50 : 2', 'Change to the same unit first: 50 paise : 200 paise = 1 : 4.']],
          real: 'If 3 litres of diesel take a tractor 36 km, one litre takes it 12 km, so 5 litres take it 60 km.',
        }),
        keys('Write a ratio in simplest form by dividing by the HCF.', 'Same units before comparing.', 'Proportion: product of extremes = product of means.', 'Unitary method: find one, then many.'),
        remember('To share an amount in the ratio a : b, the shares are a/(a + b) and b/(a + b) of the total.'),
        tip('A ratio has no unit: 30 cm : 1 m = 30 : 100 = 3 : 10.'),
      ],
      examples: [
        ex('Write 45 : 60 in simplest form.', ['HCF of 45 and 60 is 15.', '45 ÷ 15 = 3, 60 ÷ 15 = 4'], '3 : 4'),
        ex('Are 4, 6, 10, 15 in proportion?', ['Extremes: 4 × 15 = 60', 'Means: 6 × 10 = 60', 'Equal products'], 'Yes'),
        ex('Share ₹600 between Ravi and Meena in the ratio 2 : 3.', ['Total parts = 5', 'One part = 600 ÷ 5 = ₹120', 'Ravi: 2 × 120 = ₹240, Meena: 3 × 120 = ₹360'], '₹240 and ₹360'),
      ],
      practice: [
        tp('simplest', (r) => {
          let a = r.int(1, 9), b = r.int(2, 11);
          while (gcd(a, b) !== 1 || a === b) { a = r.int(1, 9); b = r.int(2, 11); }
          const k = r.int(2, 12);
          return mcq(r, `Write ${a * k} : ${b * k} in its simplest form.`, `${a} : ${b}`, [`${b} : ${a}`, `${a * 2} : ${b * 2}`, `${a + 1} : ${b + 1}`],
            ['Divide both terms by their HCF.', `${a * k} = ${pfs(a * k) || '1'}, ${b * k} = ${pfs(b * k)}`], [`HCF = ${k}`, `${a * k} ÷ ${k} = ${a}, ${b * k} ÷ ${k} = ${b}`, `${a} : ${b}`],
            [['wrong', 'Keep the order of the terms and divide both by the HCF.']]);
        }),
        tp('isprop', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9), k = r.int(2, 5), ok = r.next() < 0.5;
          const c = a * k, d = ok ? b * k : b * k + r.pick([1, 2, -1]);
          return mcq(r, `Are ${a}, ${b}, ${c} and ${d} in proportion (in this order)?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['Compare the product of the extremes with the product of the means.'], [`Extremes: ${a} × ${d} = ${a * d}`, `Means: ${b} × ${c} = ${b * c}`, ok ? 'Equal, so they are in proportion.' : 'Not equal, so they are not in proportion.']);
        }),
        tp('missing', (r) => {
          const a = r.int(2, 9), b = r.int(2, 12), k = r.int(2, 9);
          return typed(`Find x if ${a} : ${b} = ${a * k} : x.`, num(b * k),
            [`${a} was multiplied by ${k} to get ${a * k}.`, 'Multiply the other term by the same number.'], [`${a} × ${k} = ${a * k}`, `x = ${b} × ${k} = ${b * k}`], [[String(b + a * k - a), 'Ratios scale by MULTIPLYING, not by adding.']]);
        }),
        tp('share', (r) => {
          const a = r.int(1, 5), b = r.int(a + 1, 9), unit = r.int(5, 60) * 10;
          const tot = (a + b) * unit;
          return typed(`Divide ₹${tot} between two friends in the ratio ${a} : ${b}. How much does the friend with the LARGER share get (₹)?`, num(b * unit, '₹'),
            [`Total parts = ${a} + ${b} = ${a + b}.`, `One part = ${tot} ÷ ${a + b}.`], [`One part = ₹${unit}`, `Larger share = ${b} × ${unit} = ₹${b * unit}`],
            [[String(a * unit), 'That is the smaller share.'], [String(rd(tot / b, 2)), 'Divide by the TOTAL number of parts, not by one term.']], { steps: [st('Find the value of one part.', num(unit)), st('Find the larger share.', num(b * unit, '₹'))] });
        }, 2),
        tp('unitary', (r) => {
          const unit = r.int(3, 40), n = r.int(2, 12), m = r.int(2, 25);
          const thing = r.pick(['notebooks', 'pens', 'bananas', 'erasers', 'bus tickets']);
          return typed(`${n} ${thing} cost ₹${n * unit}. What do ${m} ${thing} cost (₹)?`, num(m * unit, '₹'),
            [`Cost of one = ${n * unit} ÷ ${n}.`, `Then multiply by ${m}.`], [`One costs ₹${unit}`, `${m} cost ${m} × ${unit} = ₹${m * unit}`]);
        }),
        tp('speed', (r) => {
          const v = r.int(30, 80), t1 = r.int(2, 5), t2 = r.int(2, 9);
          return typed(`A car travels ${v * t1} km in ${t1} hours. At the same speed, how far does it go in ${t2} hours?`, num(v * t2, 'km'),
            ['Distance and time are in direct proportion at a steady speed.', `Distance in 1 hour = ${v * t1} ÷ ${t1}.`], [`1 hour → ${v} km`, `${t2} hours → ${v * t2} km`]);
        }),
      ],
    },
    {
      id: 'ts7.m.ratio.percent', title: 'Percentages', prereqs: ['ts7.m.ratio.prop'],
      intro: [
        h('Out of a hundred'),
        p('"75% of students passed" is easier to compare than "51 out of 68 passed". Per cent means "per hundred": 75% = 75/100. Percentages let us compare different amounts on the same scale of 100.'),
        def('Percentage', 'A ratio with 100 as the second term. x% = x/100.'),
        stepsB('Fraction → %: multiply by 100. 3/5 × 100 = 60%.', '% → fraction: write over 100 and simplify. 35% = 35/100 = 7/20.', '% → decimal: divide by 100. 8% = 0.08.'),
        f('x% of N = (x ÷ 100) × N', 'x per cent of N equals x over 100 times N'),
        X({
          title: 'What if? Finding a percentage of a quantity', formula: 'P = x/100 × N',
          result: ['P', 'Part', 'x / 100 * N', '', 2],
          vars: [['x', 'Percentage', 0, 100, 1, 25, '%'], ['N', 'Whole amount', 0, 1000, 10, 480]],
          notes: [['x', 'A bigger percentage takes a bigger slice of the same whole.', 'A smaller percentage takes a smaller slice.'], ['N', 'The same percentage of a bigger whole is a bigger amount.', 'The same percentage of a smaller whole is smaller.']],
          mistakes: [['10% of 50 = 10 × 50', 'Divide by 100 too: 10/100 × 50 = 5.'], ['Thinking 50% of A equals 50% of B', 'Percentages depend on the whole: 50% of 10 is 5, 50% of 1000 is 500.']],
          real: 'A 20% off sale on a ₹750 bag saves you 20/100 × 750 = ₹150.',
        }),
        h('Increase and decrease'),
        p('Percentage change = (change ÷ original) × 100. If a price rises from ₹80 to ₹100, the increase is 20/80 × 100 = 25%.'),
        keys('x% = x/100.', 'To find x% of N: x/100 × N.', 'To express a as a % of b: a/b × 100.', 'Always compare a change with the ORIGINAL value.'),
        remember('100% is the whole. 50% is half, 25% is a quarter, 10% is one tenth.'),
        tip('10% is easy: move the decimal one place left. 5% is half of that.'),
      ],
      examples: [
        ex('Find 15% of 260.', ['15/100 × 260', '= 39'], '39'),
        ex('Out of 40 students, 14 like cricket most. What percentage is that?', ['14/40 × 100', '= 35'], '35%'),
        ex('A town\'s population rises from 2400 to 2700. Find the percentage increase.', ['Increase = 300', '300/2400 × 100 = 12.5'], '12.5%'),
      ],
      practice: [
        tp('frac-to-pc', (r) => {
          const d = r.pick([2, 4, 5, 10, 20, 25, 50]), n = r.int(1, d - 1);
          return typed(`Write ${n}/${d} as a percentage.`, num(n * 100 / d),
            ['Multiply the fraction by 100.'], [`${n}/${d} × 100 = ${n * 100 / d}%`], [[String(rd(n / d, 4)), 'That is the decimal. Multiply by 100 to get the percentage.']]);
        }),
        tp('pc-to-frac', (r) => {
          const x = r.pick([5, 8, 12, 15, 20, 24, 25, 30, 35, 40, 45, 60, 64, 75, 80, 85]);
          return typed(`Write ${x}% as a fraction in lowest terms.`, fl(x, 100),
            ['Write it over 100.', 'Simplify by the HCF.'], [`${x}% = ${x}/100 = ${fr(x, 100)}`], [['not-lowest', 'Right value — now simplify fully.']]);
        }),
        tp('of', (r) => {
          const x = r.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]), N = r.int(2, 40) * 20;
          return typed(`Find ${x}% of ${N}.`, num(rd(x * N / 100, 2)),
            [`${x}/100 × ${N}`], [`${x}/100 × ${N} = ${rd(x * N / 100, 2)}`], [[String(x * N), 'Remember to divide by 100.']]);
        }),
        tp('as-pc', (r) => {
          const total = r.pick([20, 25, 40, 50, 80, 200, 400]), part = r.int(1, total - 1);
          const ctx = r.pick([['students in a class', 'are girls'], ['marks in a test', 'were scored by Kiran'], ['saplings planted', 'survived']]);
          return typed(`Out of ${total} ${ctx[0]}, ${part} ${ctx[1]}. What percentage is that?`, num(rd(part * 100 / total, 2)),
            [`Write ${part}/${total} and multiply by 100.`], [`${part}/${total} × 100 = ${rd(part * 100 / total, 2)}%`]);
        }),
        tp('change', (r) => {
          const old = r.int(4, 40) * 25, pc = r.pick([4, 8, 10, 12, 20, 25, 40]), up = r.next() < 0.5;
          const nw = up ? old + old * pc / 100 : old - old * pc / 100;
          return typed(`The price of a school bag ${up ? 'rises' : 'falls'} from ₹${old} to ₹${nw}. Find the percentage ${up ? 'increase' : 'decrease'}.`, num(pc),
            [`Change = ${Math.abs(nw - old)}.`, 'Divide by the ORIGINAL price and multiply by 100.'], [`${Math.abs(nw - old)}/${old} × 100 = ${pc}%`],
            [[String(rd(Math.abs(nw - old) * 100 / nw, 2)), 'Divide by the ORIGINAL price, not the new one.']], { steps: [st('Find the change in price (₹).', num(Math.abs(nw - old))), st('Find the percentage change.', num(pc))] });
        }, 2),
        tp('new-value', (r) => {
          const old = r.int(2, 50) * 20, pc = r.pick([5, 10, 15, 20, 25, 50]), up = r.next() < 0.5;
          const nw = up ? old * (100 + pc) / 100 : old * (100 - pc) / 100;
          return typed(`A village had ${old} trees. The number ${up ? 'increased' : 'decreased'} by ${pc}%. How many trees are there now?`, num(nw),
            [`${pc}% of ${old} = ${old * pc / 100}.`, up ? 'Add it on.' : 'Take it away.'], [`${pc}% of ${old} = ${old * pc / 100}`, `${old} ${up ? '+' : '−'} ${old * pc / 100} = ${nw}`], [[String(old * pc / 100), 'That is only the change. Find the new total.']]);
        }),
      ],
    },
    {
      id: 'ts7.m.ratio.money', title: 'Profit and loss, discount and simple interest', prereqs: ['ts7.m.ratio.percent'],
      intro: [
        h('Money in the market'),
        p('A fruit seller buys a crate of mangoes for ₹800 and sells it for ₹920. She made a profit of ₹120. Shopkeepers, banks and buyers all use percentages to compare such gains and losses.'),
        def('Cost price (CP) and selling price (SP)', 'CP is what the seller paid; SP is what the buyer pays.'),
        def('Profit and loss', 'If SP > CP, profit = SP − CP. If SP < CP, loss = CP − SP. Profit % and loss % are always worked out ON THE COST PRICE.'),
        f('profit % = (profit ÷ CP) × 100', 'profit per cent equals profit over cost price times 100'),
        X({
          title: 'What if? Profit percentage', formula: 'profit% = (SP − CP)/CP × 100',
          result: ['P', 'Profit % (negative = loss %)', '(S - C) / C * 100', '%', 1],
          vars: [['C', 'Cost price', 100, 1000, 10, 800, '₹'], ['S', 'Selling price', 100, 1200, 10, 920, '₹']],
          notes: [['S', 'Selling for more increases the profit percentage.', 'Selling for less lowers it; below the cost price it becomes a loss.'], ['C', 'Paying more for the goods leaves a smaller profit.', 'Buying more cheaply increases the profit.']],
          mistakes: [['Dividing by the selling price', 'Profit % and loss % are always calculated on the COST price.']],
          real: 'Selling ₹800 of mangoes for ₹920 gives 120/800 × 100 = 15% profit.',
        }),
        h('Discount'),
        def('Marked price (MP) and discount', 'The price on the tag is the marked price. A discount is a reduction on the MP; SP = MP − discount. Discount % is calculated on the MARKED price.'),
        h('Simple interest'),
        p('When you borrow money (the principal P) the lender charges interest. Simple interest at R% per year for T years is the same amount every year.'),
        f('SI = (P × R × T) ÷ 100;  Amount = P + SI', 'simple interest equals P R T over 100'),
        X({
          title: 'What if? Simple interest', formula: 'SI = P × R × T / 100',
          result: ['SI', 'Simple interest', 'P * R * T / 100', '₹', 2],
          vars: [['P', 'Principal', 1000, 50000, 500, 5000, '₹'], ['R', 'Rate per year', 1, 15, 0.5, 8, '%'], ['T', 'Time', 1, 10, 1, 3, 'years']],
          notes: [['T', 'Each extra year adds the same interest again: SI grows in direct proportion to time.', 'Fewer years means less interest.'], ['R', 'A higher rate means more interest every year.', 'A lower rate means less interest.']],
          mistakes: [['Forgetting to divide by 100', 'R is a percentage: 8% means 8/100.'], ['Giving SI when the amount is asked', 'Amount = principal + interest.']],
          real: '₹5000 saved at 8% simple interest for 3 years earns ₹1200, giving ₹6200.',
        }),
        keys('Profit = SP − CP; loss = CP − SP.', 'Profit % and loss % on CP.', 'Discount % on MP; SP = MP − discount.', 'SI = PRT/100; Amount = P + SI.'),
        remember('Profit/loss % → divide by CP. Discount % → divide by MP.'),
        tip('To sell at x% profit: SP = CP × (100 + x)/100. At x% loss: SP = CP × (100 − x)/100.'),
      ],
      examples: [
        ex('A cycle bought for ₹2500 is sold for ₹2200. Find the loss %.', ['Loss = 2500 − 2200 = ₹300', 'Loss % = 300/2500 × 100 = 12%'], '12% loss'),
        ex('A shirt marked ₹640 is sold at a 15% discount. Find the selling price.', ['Discount = 15/100 × 640 = ₹96', 'SP = 640 − 96 = ₹544'], '₹544'),
        ex('Find the simple interest on ₹6000 at 7% per year for 2 years, and the amount.', ['SI = 6000 × 7 × 2 / 100 = ₹840', 'Amount = 6000 + 840 = ₹6840'], 'SI ₹840, amount ₹6840'),
      ],
      practice: [
        tp('pl', (r) => {
          const cp = r.int(10, 80) * 25, pc = r.pick([4, 5, 8, 10, 12, 15, 20, 25]), gain = r.next() < 0.5;
          const sp = gain ? cp + cp * pc / 100 : cp - cp * pc / 100;
          return typed(`An article bought for ₹${cp} is sold for ₹${sp}. Find the ${gain ? 'profit' : 'loss'} percentage.`, num(pc),
            [gain ? 'Profit = SP − CP.' : 'Loss = CP − SP.', 'Divide by the COST price and multiply by 100.'], [`${gain ? 'Profit' : 'Loss'} = ₹${Math.abs(sp - cp)}`, `${Math.abs(sp - cp)}/${cp} × 100 = ${pc}%`],
            [[String(rd(Math.abs(sp - cp) * 100 / sp, 2)), 'Divide by the cost price, not the selling price.']]);
        }),
        tp('sp', (r) => {
          const cp = r.int(4, 40) * 50, pc = r.pick([5, 10, 12, 16, 20, 25]), gain = r.next() < 0.5;
          const sp = gain ? cp * (100 + pc) / 100 : cp * (100 - pc) / 100;
          return typed(`A shopkeeper buys a radio for ₹${cp} and sells it at a ${gain ? 'profit' : 'loss'} of ${pc}%. Find the selling price (₹).`, num(sp, '₹'),
            [`${gain ? 'Profit' : 'Loss'} = ${pc}% of ${cp}.`, gain ? 'Add it to the CP.' : 'Subtract it from the CP.'], [`${pc}% of ${cp} = ₹${cp * pc / 100}`, `SP = ${cp} ${gain ? '+' : '−'} ${cp * pc / 100} = ₹${sp}`]);
        }),
        tp('discount', (r) => {
          const mp = r.int(4, 60) * 50, pc = r.pick([5, 10, 15, 20, 25, 30, 40, 50]);
          const d = mp * pc / 100;
          return typed(`A dress is marked ₹${mp}. During a Dasara sale it is sold at ${pc}% discount. What is the selling price (₹)?`, num(mp - d, '₹'),
            [`Discount = ${pc}% of ₹${mp}.`, 'SP = MP − discount.'], [`Discount = ₹${d}`, `SP = ${mp} − ${d} = ₹${mp - d}`], [[String(d), 'That is the discount. Subtract it from the marked price.']]);
        }),
        tp('si', (r) => {
          const P = r.int(2, 40) * 500, R = r.pick([4, 5, 6, 7, 8, 9, 10, 12]), T = r.int(1, 5);
          const si = P * R * T / 100;
          const amt = r.next() < 0.5;
          return typed(`Find the ${amt ? 'amount' : 'simple interest'} on ₹${P} at ${R}% per year for ${T} year${T > 1 ? 's' : ''} (₹).`, num(amt ? P + si : si, '₹'),
            ['SI = P × R × T ÷ 100.', amt ? 'Amount = principal + interest.' : 'Just the interest is asked.'], [`SI = ${P} × ${R} × ${T} ÷ 100 = ₹${si}`, ...(amt ? [`Amount = ${P} + ${si} = ₹${P + si}`] : [])],
            [[String(amt ? si : P + si), amt ? 'That is only the interest; add the principal.' : 'That is the amount; the interest alone is asked.']]);
        }),
        tp('si-rate', (r) => {
          const P = r.int(2, 20) * 1000, R = r.pick([4, 5, 6, 8, 10, 12]), T = r.int(2, 5);
          const si = P * R * T / 100;
          return typed(`₹${P} earns ₹${si} simple interest in ${T} years. Find the rate of interest per year (%).`, num(R),
            ['R = (SI × 100) ÷ (P × T).'], [`R = (${si} × 100) ÷ (${P} × ${T}) = ${R}%`]);
        }, 3),
        bank('words', [
          { q: 'Profit percentage is always calculated on:', a: 'the cost price', w: ['the selling price', 'the marked price', 'the profit'], h: ['Compare the gain with what you paid.'], s: ['Profit % = profit/CP × 100.'] },
          { q: 'Discount is always calculated on:', a: 'the marked price', w: ['the cost price', 'the selling price', 'the interest'], h: ['The discount is taken off the tag price.'], s: ['Discount % = discount/MP × 100.'] },
          { q: 'If SP is less than CP, there is:', a: 'a loss', w: ['a profit', 'a discount', 'no change'], h: ['The seller got back less than she paid.'], s: ['Loss = CP − SP.'] },
          { q: 'Amount at simple interest equals:', a: 'principal + interest', w: ['principal − interest', 'principal × rate', 'interest ÷ time'], h: ['It is the total paid back.'], s: ['A = P + SI.'] },
          { q: 'Doubling the time (same P and R) makes the simple interest:', a: 'double', w: ['half', 'four times', 'unchanged'], h: ['SI = PRT/100 is directly proportional to T.'], s: ['SI is directly proportional to T.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7 DATA HANDLING
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const ch7: USpec = {
  id: 'ts7.m.ch7', subject: 'math', title: 'Data Handling', source: src(7),
  objectives: [
    {
      id: 'ts7.m.data.mean', title: 'Organising data and the arithmetic mean',
      intro: [
        h('Making sense of many numbers'),
        p('Your class scored 23 different marks in a test. Looking at a jumble of numbers tells you little. Organising them in a table and finding one "typical" value — the average — makes the data speak.'),
        def('Frequency table', 'A table showing each value (or group) and how many times it occurs — its frequency. Tally marks (||||) help to count.'),
        def('Range', 'Highest value − lowest value. It shows how spread out the data is.'),
        def('Arithmetic mean (average)', 'The sum of all observations divided by the number of observations.'),
        f('mean = (sum of observations) ÷ (number of observations)', 'mean equals sum divided by number'),
        X({
          title: 'What if? The mean of three scores', formula: 'mean = (a + b + c) ÷ 3',
          result: ['M', 'Mean', '(a + b + c) / 3', '', 2],
          vars: [['a', 'Score 1', 0, 100, 1, 60], ['b', 'Score 2', 0, 100, 1, 75], ['c', 'Score 3', 0, 100, 1, 90]],
          notes: [['c', 'Raising one score by 3 raises the mean by 1 — the extra is shared among three.', 'Lowering one score pulls the mean down by a third of the drop.']],
          mistakes: [['Dividing by the wrong count', 'Count every observation, including zeros.'], ['Thinking the mean must be one of the values', 'The mean of 2, 3, 5 is 10/3 ≈ 3.33, not in the list.']],
          real: 'A batter scoring 20, 45 and 70 has a mean of 135 ÷ 3 = 45 runs per innings.',
        }),
        h('A property of the mean'),
        p('Find how far each value is above (+) or below (−) the mean. These differences always add up to ZERO: the mean is the balancing point of the data. Also, if every value increases by k, the mean increases by k.'),
        keys('Organise data in a frequency table.', 'Range = highest − lowest.', 'Mean = sum ÷ count.', 'Sum of (value − mean) is always 0.'),
        remember('Total = mean × number of observations. This helps find a missing value.'),
        tip('If every value is multiplied by 2, the mean is also multiplied by 2.'),
      ],
      examples: [
        ex('Find the mean of 12, 15, 18, 20, 25.', ['Sum = 90', 'Count = 5', '90 ÷ 5 = 18'], '18'),
        ex('The mean of 4 numbers is 15. Three of them are 10, 14 and 20. Find the fourth.', ['Total = 4 × 15 = 60', '10 + 14 + 20 = 44', 'Fourth = 60 − 44 = 16'], '16'),
        ex('Check the property for 2, 5, 8: mean 5.', ['Differences: −3, 0, +3', 'Sum = 0 ✓'], 'Differences add to 0'),
      ],
      practice: [
        tp('mean', (r) => {
          const n = r.int(4, 7), m = r.int(10, 60);
          const xs = Array.from({ length: n - 1 }, () => m + r.int(-9, 9));
          xs.push(n * m - xs.reduce((s, x) => s + x, 0));
          return typed(`Find the mean of: ${xs.join(', ')}.`, num(m),
            ['Add all the values.', `Divide by ${n}.`], [`Sum = ${n * m}`, `Mean = ${n * m} ÷ ${n} = ${m}`], [[String(n * m), `That is the sum. Divide by ${n}.`]]);
        }),
        tp('missing', (r) => {
          const n = r.int(4, 6), m = r.int(20, 50);
          const xs = Array.from({ length: n - 1 }, () => m + r.int(-12, 12));
          const last = n * m - xs.reduce((s, x) => s + x, 0);
          return typed(`The mean of ${n} numbers is ${m}. ${n - 1} of them are ${xs.join(', ')}. Find the remaining number.`, num(last),
            [`Total of all ${n} = ${n} × ${m}.`, 'Subtract the known numbers.'], [`Total = ${n * m}`, `Known sum = ${n * m - last}`, `Missing = ${last}`]);
        }, 2),
        tp('shift', (r) => {
          const m = r.int(10, 80), k = r.int(2, 15), kind = r.next() < 0.5;
          return typed(`The mean of a set of numbers is ${m}. If ${kind ? `${k} is added to each number` : 'each number is doubled'}, what is the new mean?`, num(kind ? m + k : 2 * m),
            [kind ? 'Each number goes up by the same amount, so the balance point moves by the same amount.' : 'Doubling every value doubles the sum but not the count.'], [kind ? `${m} + ${k} = ${m + k}` : `2 × ${m} = ${2 * m}`]);
        }),
        tp('range', (r) => {
          const xs = Array.from({ length: r.int(6, 9) }, () => r.int(10, 99));
          const rg = Math.max(...xs) - Math.min(...xs);
          return typed(`Find the range of these marks: ${xs.join(', ')}.`, num(rg),
            ['Range = highest − lowest.'], [`Highest = ${Math.max(...xs)}, lowest = ${Math.min(...xs)}`, `Range = ${rg}`]);
        }),
        tp('freq', (r) => {
          const vals = Array.from({ length: 15 }, () => r.int(1, 5));
          const t = r.int(1, 5);
          const c = vals.filter((v) => v === t).length;
          return typed(`Number of family members of 15 students: ${vals.join(', ')}. What is the frequency of ${t}?`, num(c),
            [`Count how many times ${t} appears.`, 'Use tally marks.'], [`${t} appears ${c} time${c === 1 ? '' : 's'}.`]);
        }),
        bank('prop', [
          { q: 'The differences of values from their mean always add up to:', a: '0', w: ['the mean', '1', 'the range'], h: ['The mean is the balancing point.'], s: ['Values above and below the mean balance out exactly.'] },
          { q: 'The mean of 3, 3, 3, 3 is:', a: '3', w: ['12', '4', '0'], h: ['All values are the same.'], s: ['12 ÷ 4 = 3.'] },
          { q: 'Which can change the mean the most?', a: 'One very large or very small value', w: ['Writing the values in another order', 'Using tally marks', 'Drawing a table'], h: ['The mean uses every value.'], s: ['An extreme value pulls the mean towards it.'] },
          { q: 'The mean of 5 numbers is 8. Their sum is:', a: '40', w: ['13', '8', '1.6'], h: ['Sum = mean × count.'], s: ['5 × 8 = 40.'] },
          { q: 'The mean of the first five natural numbers is:', a: '3', w: ['15', '2.5', '5'], h: ['1 + 2 + 3 + 4 + 5 = ?'], s: ['15 ÷ 5 = 3.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.data.modemedian', title: 'Mode and median', prereqs: ['ts7.m.data.mean'],
      intro: [
        h('Other kinds of "typical"'),
        p('A shoe shop wants to know which size to stock most. The average size, 6.37, is useless — no shoe has that size! The shop wants the MOST COMMON size. Different questions need different "averages".'),
        def('Mode', 'The value that occurs most often. Data can have more than one mode.'),
        def('Median', 'The middle value when the data is arranged in order. For an even number of values, it is the mean of the two middle values.'),
        stepsB('Arrange the data in ascending order.', 'If the count n is odd, the median is the ((n + 1) ÷ 2)th value.', 'If n is even, the median is the mean of the (n ÷ 2)th and (n ÷ 2 + 1)th values.'),
        f('median position = (n + 1) ÷ 2', 'the median is at position n plus 1 over 2'),
        X({
          title: 'What if? Where the median sits', formula: 'position = (n + 1) ÷ 2',
          result: ['k', 'Median position', '(n + 1) / 2', '', 1],
          vars: [['n', 'Number of observations', 1, 41, 1, 9]],
          notes: [['n', 'More data pushes the middle further along the list; an even count lands half-way between two values.', 'Less data brings the middle closer to the start.']],
          mistakes: [['Finding the middle without sorting', 'Always arrange the data in order first.'], ['Using n ÷ 2 for odd n', 'For 9 values the middle is the 5th, i.e. (9 + 1) ÷ 2.']],
          real: 'With 31 students lined up by height, the median height is the 16th student\'s.',
        }),
        keys('Mode: most frequent.', 'Median: middle after sorting.', 'Even count: mean of the two middle values.', 'Mean, median and mode can all be different.'),
        remember('The median is not affected much by one very large value; the mean is.'),
        tip('Use the mode for "most popular" questions, the median for "middle" questions, and the mean for "share equally" questions.'),
      ],
      examples: [
        ex('Find the mode of 3, 5, 7, 5, 2, 5, 3.', ['5 occurs 3 times — more than any other'], '5'),
        ex('Find the median of 14, 9, 22, 17, 11.', ['Order: 9, 11, 14, 17, 22', 'Middle (3rd) value'], '14'),
        ex('Find the median of 6, 2, 9, 4.', ['Order: 2, 4, 6, 9', 'Middle two: 4 and 6', '(4 + 6) ÷ 2 = 5'], '5'),
      ],
      practice: [
        tp('mode', (r) => {
          const m = r.int(1, 20);
          const others = r.shuffle(range(1, 20).filter((x) => x !== m)).slice(0, 5);
          const xs = r.shuffle([m, m, m, ...others.slice(0, 3), others[0], others[3]]);
          return typed(`Find the mode of: ${xs.join(', ')}.`, num(m),
            ['Count how often each value appears.'], [`${m} appears 3 times — more than any other value.`]);
        }),
        tp('median-odd', (r) => {
          const n = r.pick([5, 7, 9]);
          const xs = r.shuffle(r.shuffle(range(10, 70)).slice(0, n));
          const s = [...xs].sort((a, b) => a - b);
          const md = s[(n - 1) / 2];
          return typed(`Find the median of: ${xs.join(', ')}.`, num(md),
            ['Arrange the values in order first.', `The middle of ${n} values is position ${(n + 1) / 2}.`], [`Ordered: ${s.join(', ')}`, `Median = ${md}`], [[String(xs[(n - 1) / 2]), 'Sort the numbers before choosing the middle one.']]);
        }),
        tp('median-even', (r) => {
          const n = r.pick([4, 6, 8]);
          const xs = r.shuffle(range(5, 60)).slice(0, n);
          const s = [...xs].sort((a, b) => a - b);
          const md = (s[n / 2 - 1] + s[n / 2]) / 2;
          return typed(`Find the median of: ${xs.join(', ')}.`, num(md),
            ['Sort the values.', 'With an even count, take the mean of the two middle values.'], [`Ordered: ${s.join(', ')}`, `Middle values: ${s[n / 2 - 1]} and ${s[n / 2]}`, `Median = ${md}`]);
        }, 2),
        tp('mode-table', (r) => {
          const sizes = [4, 5, 6, 7, 8];
          const fq = r.shuffle([3, 5, 9, 12, 7]);
          const best = sizes[fq.indexOf(12)];
          return typed(`A shoe shop sold these sizes last week — ${sizes.map((s, i) => `size ${s}: ${fq[i]} pairs`).join(', ')}. What is the modal shoe size?`, num(best),
            ['The mode has the highest frequency.'], [`Size ${best} sold 12 pairs, the most.`], [['12', 'That is the frequency. The mode is the SIZE with that frequency.']]);
        }),
        bank('which', [
          { q: 'A shop wants to know the most popular T-shirt size. Which measure should it use?', a: 'Mode', w: ['Mean', 'Median', 'Range'], h: ['"Most popular" = most frequent.'], s: ['The mode is the most frequent value.'] },
          { q: 'The median of 1, 2, 3, 4, 100 is:', a: '3', w: ['22', '100', '2'], h: ['The middle value after sorting.'], s: ['The 3rd value is 3 — the 100 does not affect it.'] },
          { q: 'The data 2, 2, 3, 3, 5 has:', a: 'two modes: 2 and 3', w: ['one mode: 3', 'one mode: 2', 'no mode'], h: ['Count each value.'], s: ['2 and 3 both appear twice.'] },
          { q: 'To find the median you must first:', a: 'arrange the data in order', w: ['add all values', 'find the mode', 'draw a bar graph'], h: ['Median means middle.'], s: ['Only sorted data has a meaningful middle.'] },
          { q: 'For 10 observations in order, the median is:', a: 'the mean of the 5th and 6th values', w: ['the 5th value', 'the 6th value', 'the 10th value ÷ 2'], h: ['10 is even.'], s: ['Take the mean of the two middle values: 5th and 6th.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.data.graphs', title: 'Bar graphs, double bar graphs and pie charts', prereqs: ['ts7.m.data.mean'],
      intro: [
        h('Pictures of data'),
        p('A headmaster can see at a glance which class collected the most for the Haritha Haram plantation drive if the numbers are drawn as bars. Graphs turn tables into pictures.'),
        vis({ kind: 'bar-graph', labels: ['VI', 'VII', 'VIII', 'IX'], values: [45, 60, 35, 50], unit: 'saplings' }, 'Bar graph: saplings planted by classes VI to IX — 45, 60, 35 and 50'),
        def('Bar graph', 'Bars of equal width with heights proportional to the values, with equal gaps between bars and a chosen scale.'),
        def('Double bar graph', 'Two bars side by side for each category (e.g. boys and girls, or 2025 and 2026) to compare two sets of data.'),
        def('Pie chart', 'A circle divided into sectors. Each sector\'s angle is proportional to the value it shows; the whole circle (360°) is the total.'),
        f('sector angle = (value ÷ total) × 360°', 'angle equals value over total times 360'),
        X({
          title: 'What if? Pie chart sector angle', formula: 'θ = (v ÷ T) × 360°',
          result: ['θ', 'Sector angle', 'v / T * 360', '°', 1],
          vars: [['v', 'Value for this sector', 0, 100, 1, 15], ['T', 'Total of all values', 100, 400, 10, 120]],
          notes: [['v', 'A bigger share of the total gets a wider slice.', 'A smaller share gets a thinner slice.'], ['T', 'If the total grows while this value stays, its share — and its slice — shrinks.', 'A smaller total makes this value a bigger share.']],
          mistakes: [['Using 100 instead of 360', 'A pie chart is a full circle: 360°. (Use 100 only for percentages.)'], ['Sector angles that do not add to 360°', 'Check: all sector angles must add to exactly 360°.']],
          real: 'If 30 out of 120 students walk to school, their slice is 30/120 × 360° = 90° — a quarter of the circle.',
        }),
        keys('Choose a sensible scale for bar graphs.', 'Double bars compare two groups category by category.', 'Pie sectors add to 360°.', 'Sector angle = fraction of total × 360°.'),
        remember('In a pie chart, a 90° sector is a quarter (25%), 180° is a half (50%).'),
        tip('Read the scale of a graph before reading the bars.'),
      ],
      examples: [
        ex('In the bar graph, how many more saplings did Class VII plant than Class VIII?', ['VII: 60, VIII: 35', '60 − 35 = 25'], '25 saplings'),
        ex('Out of 360 students, 90 like kabaddi most. What sector angle shows kabaddi in a pie chart?', ['90/360 × 360° = 90°'], '90°'),
        ex('Boys and girls in classes VI–VIII are (20, 18), (22, 25), (19, 21). In which class do girls outnumber boys by the most?', ['VI: girls − boys = −2', 'VII: +3', 'VIII: +2'], 'Class VII'),
      ],
      practice: [
        tp('read', (r) => {
          const labels = r.pick([['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Mango', 'Guava', 'Banana', 'Apple', 'Grapes'], ['VI', 'VII', 'VIII', 'IX', 'X']]);
          const values = labels.map(() => r.int(2, 20) * 5);
          const i = r.int(0, 4);
          let j = r.int(0, 4);
          while (j === i || values[j] === values[i]) { j = (j + 1) % 5; if (values.every((v) => v === values[i])) break; }
          if (values[j] === values[i]) values[j] += 5;
          return typed(`Look at the bar graph. What is the difference between the values for ${labels[i]} and ${labels[j]}?`, num(Math.abs(values[i] - values[j])),
            ['Read each bar height using the scale.', 'Subtract the smaller from the larger.'], [`${labels[i]} = ${values[i]}, ${labels[j]} = ${values[j]}`, `Difference = ${Math.abs(values[i] - values[j])}`], [],
            { visual: { kind: 'bar-graph', labels, values } });
        }),
        tp('highest', (r) => {
          const labels = r.pick([['Cricket', 'Kabaddi', 'Kho-kho', 'Football', 'Chess'], ['Red', 'Blue', 'Green', 'Yellow', 'Pink'], ['Jan', 'Feb', 'Mar', 'Apr', 'May']]);
          const values = r.shuffle([10, 15, 20, 25, 35, 30, 40]).slice(0, 5);
          const hi = values.indexOf(Math.max(...values));
          const lowAsk = r.next() < 0.5;
          const k = lowAsk ? values.indexOf(Math.min(...values)) : hi;
          return mcq(r, `Which category has the ${lowAsk ? 'lowest' : 'highest'} value in the bar graph?`, labels[k], labels.filter((_, i) => i !== k),
            [`Find the ${lowAsk ? 'shortest' : 'tallest'} bar.`], [`${labels[k]}: ${values[k]}`], [], { visual: { kind: 'bar-graph', labels, values } });
        }),
        tp('pie-angle', (r) => {
          const T = r.pick([36, 60, 72, 90, 120, 180, 360]);
          const v = r.int(1, T - 1);
          const ang = (v / T) * 360;
          return typed(`In a survey of ${T} people, ${v} chose idli as their favourite breakfast. What angle should the idli sector have in a pie chart?`, num(ang, '°'),
            ['Sector angle = (value ÷ total) × 360°.'], [`${v}/${T} × 360° = ${ang}°`], [[String(rd(v / T * 100, 2)), 'That is the percentage. Multiply by 360°, not 100.']]);
        }),
        tp('pie-back', (r) => {
          const ang = r.pick([30, 45, 60, 72, 90, 120, 135, 144, 150, 180]), T = r.pick([120, 240, 360, 600, 720]);
          return typed(`In a pie chart showing how ${T} students travel to school, the "bus" sector has an angle of ${ang}°. How many students come by bus?`, num(ang / 360 * T),
            ['Fraction of the circle = angle ÷ 360°.', `Multiply that fraction by ${T}.`], [`${ang}/360 = ${fr(ang, 360)}`, `${fr(ang, 360)} × ${T} = ${ang / 360 * T}`]);
        }, 2),
        tp('double', (r) => {
          const cls = ['VI', 'VII', 'VIII', 'IX'];
          const b = cls.map(() => r.int(15, 35)), g = cls.map(() => r.int(15, 35));
          const i = r.int(0, 3);
          return typed(`A double bar graph shows boys and girls in each class: ${cls.map((c, k) => `Class ${c} — boys ${b[k]}, girls ${g[k]}`).join('; ')}. How many students are there in Class ${cls[i]} altogether?`, num(b[i] + g[i]),
            ['Add the two bars for that class.'], [`${b[i]} + ${g[i]} = ${b[i] + g[i]}`]);
        }),
        bank('which', [
          { q: 'The angles of all sectors of a pie chart add up to:', a: '360°', w: ['180°', '100°', '90°'], h: ['A full turn.'], s: ['A pie chart is a whole circle: 360°.'] },
          { q: 'To compare the marks of boys and girls in each subject, the best graph is:', a: 'a double bar graph', w: ['a single bar graph', 'a pictograph of one group', 'a tally table only'], h: ['Two groups side by side.'], s: ['A double bar graph shows two sets of data together.'] },
          { q: 'In a bar graph, the bars should have:', a: 'equal widths and equal gaps', w: ['widths that show the values', 'different colours only', 'no scale'], h: ['Only the HEIGHT shows the value.'], s: ['The heights carry the data; widths and gaps are kept equal.'] },
          { q: 'A pie-chart sector of 180° shows:', a: 'half of the total', w: ['a quarter of the total', '180 items', 'the whole total'], h: ['180 is half of 360.'], s: ['180/360 = 1/2.'] },
          { q: 'Which graph best shows how a family\'s monthly budget is split into parts of the whole?', a: 'a pie chart', w: ['a double bar graph', 'a line of tally marks', 'a number line'], h: ['Parts of a whole.'], s: ['Pie charts show parts of one whole.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 8 CONGRUENCY OF TRIANGLES
const TRI = [['A', 'B', 'C', 'P', 'Q', 'R'], ['D', 'E', 'F', 'L', 'M', 'N'], ['X', 'Y', 'Z', 'K', 'L', 'M'], ['P', 'Q', 'R', 'S', 'T', 'U']];
const ch8: USpec = {
  id: 'ts7.m.ch8', subject: 'math', title: 'Congruency of Triangles', source: src(8),
  objectives: [
    {
      id: 'ts7.m.cong.basics', title: 'Congruent figures and corresponding parts',
      intro: [
        h('Exact copies'),
        p('Two ₹10 coins, two stamps from the same sheet, the two blades of a pair of scissors — they fit exactly on top of each other. Figures with the same shape AND the same size are called congruent.'),
        def('Congruent figures', 'Figures that cover each other exactly when one is placed on the other (superposition). Symbol: ≅.'),
        def('Congruent line segments', 'Two segments are congruent if they have the same length.'),
        def('Congruent angles', 'Two angles are congruent if they have the same measure.'),
        h('Order matters'),
        p('△ABC ≅ △PQR means A ↔ P, B ↔ Q, C ↔ R. So AB = PQ, BC = QR, CA = RP, and ∠A = ∠P, ∠B = ∠Q, ∠C = ∠R. Six pairs of equal parts!'),
        vis({ kind: 'emoji', text: '△ABC ≅ △PQR :  A↔P,  B↔Q,  C↔R' }, 'Correspondence of vertices A to P, B to Q, C to R'),
        keys('Congruent = same shape and same size.', 'Segments: equal length. Angles: equal measure.', 'The order of letters gives the matching parts.', 'Congruent triangles have 3 pairs of equal sides and 3 pairs of equal angles.'),
        remember('Similar-looking is not enough: a photo and its enlargement have the same shape but are NOT congruent.'),
        tip('Write the two names one above the other to read off matching parts: ABC over PQR.'),
      ],
      examples: [
        ex('△LMN ≅ △XYZ. Which side equals MN?', ['M ↔ Y and N ↔ Z', 'So MN = YZ'], 'YZ'),
        ex('△ABC ≅ △DEF with ∠B = 65°. Find ∠E.', ['B ↔ E', '∠E = ∠B'], '65°'),
        ex('Are two circles of radius 3 cm congruent?', ['Same shape (circle) and same size (radius)'], 'Yes'),
      ],
      practice: [
        tp('side', (r) => {
          const [a, b, c, p, q, s] = r.pick(TRI);
          const pairs: [string, string][] = [[a + b, p + q], [b + c, q + s], [c + a, s + p]];
          const i = r.int(0, 2);
          const [ask, ans] = pairs[i];
          return mcq(r, `△${a}${b}${c} ≅ △${p}${q}${s}. Which side is equal to ${ask}?`, ans, [pairs[(i + 1) % 3][1], pairs[(i + 2) % 3][1], ans[1] + ans[0] === ans ? ask : `${ans[0]}${ask[0]}`],
            ['Match the letters in order: 1st ↔ 1st, 2nd ↔ 2nd, 3rd ↔ 3rd.'], [`${ask[0]} ↔ ${ans[0]} and ${ask[1]} ↔ ${ans[1]}`, `${ask} = ${ans}`]);
        }),
        tp('angle', (r) => {
          const [a, b, c, p, q, s] = r.pick(TRI);
          const i = r.int(0, 2), x = r.int(25, 110);
          const from = [a, b, c][i], to = [p, q, s][i];
          return typed(`△${a}${b}${c} ≅ △${p}${q}${s} and ∠${from} = ${x}°. Find ∠${to}.`, num(x, '°'),
            ['Corresponding angles of congruent triangles are equal.', `${from} ↔ ${to}`], [`∠${to} = ∠${from} = ${x}°`]);
        }),
        tp('length', (r) => {
          const [a, b, c, p, q, s] = r.pick(TRI);
          const L1 = r.int(3, 12), L2 = r.int(3, 12), L3 = Math.min(L1 + L2 - 1, r.int(Math.abs(L1 - L2) + 1, L1 + L2 - 1));
          const i = r.int(0, 2);
          const names = [[a + b, p + q], [b + c, q + s], [c + a, s + p]];
          const lens = [L1, L2, L3];
          return typed(`△${a}${b}${c} ≅ △${p}${q}${s}. ${a}${b} = ${L1} cm, ${b}${c} = ${L2} cm and ${c}${a} = ${L3} cm. Find ${names[i][1]}.`, num(lens[i], 'cm'),
            [`${names[i][1]} corresponds to ${names[i][0]}.`], [`${names[i][1]} = ${names[i][0]} = ${lens[i]} cm`]);
        }),
        bank('what', [
          { q: 'Two figures are congruent if they have:', a: 'the same shape and the same size', w: ['the same shape only', 'the same colour', 'the same area only'], h: ['Think of placing one on the other.'], s: ['Congruent figures match exactly.'] },
          { q: 'Two line segments are congruent when:', a: 'they have equal lengths', w: ['they are parallel', 'they meet at a point', 'they are perpendicular'], h: ['Measure them.'], s: ['Segments of the same length are congruent.'] },
          { q: 'Which pair is always congruent?', a: 'Two squares with side 5 cm', w: ['Two rectangles with area 12 cm²', 'Any two circles', 'Any two equilateral triangles'], h: ['Same shape AND same size.'], s: ['Equal sides make the two squares exactly equal.'] },
          { q: 'How many pairs of equal parts do two congruent triangles have?', a: '6 (3 sides and 3 angles)', w: ['3', '2', '4'], h: ['Sides and angles.'], s: ['Three pairs of sides and three pairs of angles.'] },
          { q: 'The symbol for "is congruent to" is:', a: '≅', w: ['=', '∥', '⊥'], h: ['An equals sign with a wavy line.'], s: ['≅ means congruent to.'] },
        ]),
        matchT('parts', [
          { q: '△ABC ≅ △PQR. Match each part with its partner.', pairs: [['AB', 'PQ'], ['BC', 'QR'], ['∠A', '∠P'], ['∠C', '∠R']], h: ['A↔P, B↔Q, C↔R.'] },
          { q: '△DEF ≅ △LMN. Match each part with its partner.', pairs: [['DE', 'LM'], ['FD', 'NL'], ['∠E', '∠M'], ['∠F', '∠N']], h: ['D↔L, E↔M, F↔N.'] },
          { q: '△XYZ ≅ △KLM. Match each part with its partner.', pairs: [['YZ', 'LM'], ['XZ', 'KM'], ['∠X', '∠K'], ['∠Y', '∠L']], h: ['X↔K, Y↔L, Z↔M.'] },
          { q: '△RST ≅ △UVW. Match each part with its partner.', pairs: [['RS', 'UV'], ['ST', 'VW'], ['∠T', '∠W'], ['∠R', '∠U']], h: ['R↔U, S↔V, T↔W.'] },
          { q: '△ABC ≅ △ZYX. Match each part with its partner.', pairs: [['AB', 'ZY'], ['BC', 'YX'], ['∠A', '∠Z'], ['∠C', '∠X']], h: ['A↔Z, B↔Y, C↔X — the order is reversed!'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.cong.criteria', title: 'Criteria for congruence: SSS, SAS, ASA, RHS', prereqs: ['ts7.m.cong.basics'],
      intro: [
        h('Do we need all six?'),
        p('To be sure two triangles are congruent we do NOT have to check all six pairs of parts. Three well-chosen pairs are enough — that is why a carpenter can copy a triangular frame by measuring just three things.'),
        def('SSS', 'Three sides of one triangle equal three sides of the other.'),
        def('SAS', 'Two sides and the angle BETWEEN them (the included angle) are equal.'),
        def('ASA', 'Two angles and the side BETWEEN them (the included side) are equal.'),
        def('RHS', 'In two right-angled triangles, the hypotenuse and one other side are equal.'),
        p('Watch out: AAA (three equal angles) is NOT enough — a small and a big equilateral triangle both have 60°, 60°, 60°. And SSA (two sides with a NON-included angle) is not enough in general.'),
        keys('SSS, SAS, ASA, RHS prove congruence.', 'In SAS the angle must be between the two sides.', 'In ASA the side must be between the two angles.', 'AAA and SSA do not prove congruence.'),
        remember('If two angles are equal, the third angles are equal too (angle sum 180°), so "AAS" can be changed to ASA.'),
        tip('Mark equal parts on a rough figure with ticks (sides) and arcs (angles) to see which rule fits.'),
      ],
      examples: [
        ex('In △ABC and △DEF, AB = DE, BC = EF and ∠B = ∠E. Which rule shows they are congruent?', ['∠B is between AB and BC; ∠E is between DE and EF.', 'Two sides and the included angle'], 'SAS'),
        ex('Two right triangles have hypotenuses 13 cm and one side 5 cm each. Are they congruent?', ['Right angle, hypotenuse and one side equal'], 'Yes, by RHS'),
        ex('Two triangles have angles 50°, 60°, 70° each. Must they be congruent?', ['Only angles are known (AAA).', 'They could be different sizes.'], 'No'),
      ],
      practice: [
        tp('which', (r) => {
          const [a, b, c, p, q, s] = r.pick(TRI);
          const k = r.int(0, 3);
          const facts = [
            `${a}${b} = ${p}${q}, ${b}${c} = ${q}${s} and ${c}${a} = ${s}${p}`,
            `${a}${b} = ${p}${q}, ∠${b} = ∠${q} and ${b}${c} = ${q}${s}`,
            `∠${a} = ∠${p}, ${a}${b} = ${p}${q} and ∠${b} = ∠${q}`,
            `∠${b} = ∠${q} = 90°, hypotenuse ${c}${a} = ${s}${p} and ${a}${b} = ${p}${q}`,
          ][k];
          const ans = ['SSS', 'SAS', 'ASA', 'RHS'][k];
          return mcq(r, `In △${a}${b}${c} and △${p}${q}${s}: ${facts}. Which congruence rule applies?`, ans, ['SSS', 'SAS', 'ASA', 'RHS'].filter((x) => x !== ans),
            ['Count the equal sides (S) and angles (A).', 'Check whether the angle lies between the sides, or the side between the angles.'], [`${facts} → ${ans}`]);
        }),
        bank('not', [
          { q: 'Which of these is NOT a rule for congruence of triangles?', a: 'AAA', w: ['SSS', 'SAS', 'RHS'], h: ['Think of a small and a large equilateral triangle.'], s: ['Equal angles fix the shape but not the size.'] },
          { q: 'In the SAS rule, the angle must be:', a: 'between the two given sides', w: ['opposite the longest side', 'a right angle', 'any angle'], h: ['"Included" angle.'], s: ['The included angle is formed by the two given sides.'] },
          { q: 'RHS congruence can be used only for:', a: 'right-angled triangles', w: ['equilateral triangles', 'obtuse triangles', 'any triangles'], h: ['R stands for right angle.'], s: ['RHS needs a right angle in both triangles.'] },
          { q: 'In the ASA rule, the side must be:', a: 'between the two given angles', w: ['opposite one given angle', 'the longest side', 'any side'], h: ['"Included" side.'], s: ['The included side joins the vertices of the two angles.'] },
          { q: 'In RHS, the letter H stands for:', a: 'hypotenuse', w: ['height', 'half', 'horizontal'], h: ['The side opposite the right angle.'], s: ['H = hypotenuse.'] },
          { q: 'Two equilateral triangles with sides 4 cm and 4 cm are congruent by:', a: 'SSS', w: ['RHS', 'AAA', 'they are not congruent'], h: ['All three sides are 4 cm in both.'], s: ['All three pairs of sides are equal, so SSS.'] },
        ]),
        tp('extra', (r) => {
          const [a, b, c, p, q, s] = r.pick(TRI);
          const k = r.int(0, 2);
          const given = [`${a}${b} = ${p}${q} and ${b}${c} = ${q}${s}`, `∠${a} = ∠${p} and ∠${b} = ∠${q}`, `${a}${b} = ${p}${q} and ${c}${a} = ${s}${p}`][k];
          const rule = ['SAS', 'ASA', 'SSS'][k];
          const ans = [`∠${b} = ∠${q}`, `${a}${b} = ${p}${q}`, `${b}${c} = ${q}${s}`][k];
          const wrong = [[`∠${a} = ∠${p}`, `∠${c} = ∠${s}`, `${c}${a} = ${s}${p}`], [`${b}${c} = ${q}${s}`, `${c}${a} = ${s}${p}`, `∠${c} = ∠${s}`], [`∠${a} = ∠${p}`, `∠${b} = ∠${q}`, `${a}${c} = ${q}${s}`]][k];
          return mcq(r, `In △${a}${b}${c} and △${p}${q}${s}, ${given}. What else is needed to prove congruence by ${rule}?`, ans, wrong,
            [rule === 'SAS' ? 'The angle must be between the two sides.' : rule === 'ASA' ? 'The side must be between the two angles.' : 'You need the third pair of sides.'], [`${ans} completes ${rule}.`]);
        }, 2),
        matchT('rules', [
          { q: 'Match each rule with what it needs.', pairs: [['SSS', 'Three pairs of sides'], ['SAS', 'Two sides and the included angle'], ['ASA', 'Two angles and the included side'], ['RHS', 'Right angle, hypotenuse and a side']], h: ['S = side, A = angle.'] },
          { q: 'Match each set of facts with its rule (set 1).', pairs: [['AB = PQ, BC = QR, CA = RP', 'SSS'], ['AB = PQ, ∠B = ∠Q, BC = QR', 'SAS'], ['∠A = ∠P, AB = PQ, ∠B = ∠Q', 'ASA'], ['∠C = ∠R = 90°, AB = PQ, BC = QR', 'RHS']], h: ['Look at what lies between what.'] },
          { q: 'Match each set of facts with its rule (set 2).', pairs: [['Three equal sides each', 'SSS'], ['Two equal sides with the angle between them', 'SAS'], ['Two equal angles with the side between them', 'ASA'], ['Equal hypotenuses and one equal leg in right triangles', 'RHS']], h: ['Included parts are "between".'] },
          { q: 'Match each condition with whether it proves congruence.', pairs: [['AAA', 'Does not prove it (sizes can differ)'], ['SSS', 'Proves it'], ['SSA (non-included angle)', 'Does not prove it in general'], ['RHS', 'Proves it (right triangles only)']], h: ['Angles alone do not fix size.'] },
          { q: 'Match each letter with its meaning in the congruence rules.', pairs: [['S', 'Side'], ['A', 'Angle'], ['R', 'Right angle'], ['H', 'Hypotenuse']], h: ['These letters name the parts.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.cong.apply', title: 'Using congruence to find unknown parts', prereqs: ['ts7.m.cong.criteria'],
      intro: [
        h('Once congruent, everything matches'),
        p('After proving two triangles congruent with just three facts, we get ALL the other parts for free: the remaining sides and angles must also be equal. Engineers use this to check that two halves of a bridge truss are identical.'),
        stepsB('Find the pairs of equal parts given (or seen in the figure — a common side counts!).', 'Choose the rule: SSS, SAS, ASA or RHS.', 'Write the congruence with vertices in matching order.', 'Read off the other equal parts.'),
        p('A side shared by two triangles is equal to itself — it is a free pair of equal sides. For example, in a kite ABCD with AB = AD and CB = CD, the diagonal AC is common, so △ABC ≅ △ADC by SSS, giving ∠B = ∠D.'),
        f('if △ABC ≅ △PQR then AB = PQ, BC = QR, CA = RP, ∠A = ∠P, ∠B = ∠Q, ∠C = ∠R', 'corresponding parts of congruent triangles are equal'),
        keys('Look for a common side or vertically opposite angles.', 'Write vertices in the correct order.', 'Corresponding parts of congruent triangles are equal.'),
        remember('This is often written CPCT: Corresponding Parts of Congruent Triangles (are equal).'),
        tip('Equal parts can be given as expressions: if AB = 2x + 1 and PQ = 9, then 2x + 1 = 9.'),
      ],
      examples: [
        ex('In kite ABCD, AB = AD = 5 cm, CB = CD = 8 cm and ∠ABC = 110°. Find ∠ADC.', ['AC is common.', '△ABC ≅ △ADC (SSS)', '∠ADC corresponds to ∠ABC'], '110°'),
        ex('△ABC ≅ △PQR with AB = (3x − 2) cm and PQ = 13 cm. Find x.', ['AB = PQ', '3x − 2 = 13', 'x = 5'], 'x = 5'),
        ex('Two lines AB and CD bisect each other at O. Why is △AOC ≅ △BOD?', ['AO = OB and CO = OD (bisect each other)', '∠AOC = ∠BOD (vertically opposite)', 'SAS'], 'By SAS'),
      ],
      practice: [
        tp('algebra', (r) => {
          const x = r.int(2, 12), a = r.int(2, 5), b = r.int(-5, 9);
          const L0 = a * x + b;
          if (L0 <= 0 || b === 0) return typed('△ABC ≅ △PQR, AB = (2x + 3) cm and PQ = 15 cm. Find x.', num(6), ['AB = PQ.'], ['2x + 3 = 15', 'x = 6']);
          const [A, B, , P, Q] = r.pick(TRI);
          return typed(`△${A}${B}… ≅ △${P}${Q}… (vertices in order). ${A}${B} = (${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}) cm and ${P}${Q} = ${L0} cm. Find x.`, num(x),
            [`${A}${B} and ${P}${Q} are corresponding sides, so they are equal.`], [`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${L0}`, `${a}x = ${L0 - b}`, `x = ${x}`]);
        }, 2),
        tp('kite', (r) => {
          const ang = r.int(70, 130);
          return typed(`In quadrilateral ABCD, AB = AD and CB = CD. If ∠ABC = ${ang}°, find ∠ADC.`, num(ang, '°'),
            ['AC is common to △ABC and △ADC.', 'Which rule makes them congruent?'], ['AB = AD, CB = CD, AC common → △ABC ≅ △ADC (SSS)', `∠ADC = ∠ABC = ${ang}°`]);
        }),
        tp('angle', (r) => {
          const a = r.int(30, 80), b = r.int(30, 80);
          const [A, B, C, P, Q, R] = r.pick(TRI);
          return typed(`△${A}${B}${C} ≅ △${P}${Q}${R}. ∠${A} = ${a}° and ∠${B} = ${b}°. Find ∠${R}.`, num(180 - a - b, '°'),
            [`∠${R} corresponds to ∠${C}.`, 'Use the angle sum of △' + A + B + C + '.'], [`∠${C} = 180° − ${a}° − ${b}° = ${180 - a - b}°`, `∠${R} = ∠${C} = ${180 - a - b}°`]);
        }, 2),
        tp('perim', (r) => {
          const s1 = r.int(4, 12), s2 = r.int(4, 12), s3 = r.int(Math.abs(s1 - s2) + 1, s1 + s2 - 1);
          return typed(`△ABC ≅ △DEF. AB = ${s1} cm, BC = ${s2} cm and CA = ${s3} cm. Find the perimeter of △DEF.`, num(s1 + s2 + s3, 'cm'),
            ['Congruent triangles have equal sides, so equal perimeters.'], [`DE + EF + FD = ${s1} + ${s2} + ${s3} = ${s1 + s2 + s3} cm`]);
        }),
        bank('reason', [
          { q: 'Lines AB and CD bisect each other at O. △AOC ≅ △BOD by:', a: 'SAS', w: ['SSS', 'ASA', 'RHS'], h: ['Two halves of each line, and the angle between them at O.'], s: ['AO = BO, CO = DO, ∠AOC = ∠BOD (vertically opposite) → SAS.'] },
          { q: 'In two triangles sharing side PQ, the shared side gives:', a: 'one pair of equal sides', w: ['one pair of equal angles', 'a right angle', 'nothing useful'], h: ['A side is equal to itself.'], s: ['PQ = PQ (common side).'] },
          { q: 'AD is the perpendicular from A to BC in isosceles △ABC (AB = AC). △ABD ≅ △ACD by:', a: 'RHS', w: ['ASA', 'AAA', 'SSA'], h: ['Right angles at D, hypotenuses AB = AC, common side AD.'], s: ['∠ADB = ∠ADC = 90°, AB = AC, AD common → RHS.'] },
          { q: 'After proving △PQR ≅ △XYZ, which is true?', a: 'QR = YZ', w: ['QR = XZ', 'PQ = YZ', '∠P = ∠Z'], h: ['Match letters in order.'], s: ['Q↔Y and R↔Z, so QR = YZ.'] },
          { q: 'CPCT stands for:', a: 'Corresponding Parts of Congruent Triangles', w: ['Common Parts of Corresponding Triangles', 'Congruent Pairs of Common Triangles', 'Corresponding Points of Circles and Triangles'], h: ['Once triangles are congruent…'], s: ['Corresponding parts of congruent triangles are equal.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9 CONSTRUCTION OF TRIANGLES
const ch9: USpec = {
  id: 'ts7.m.ch9', subject: 'math', title: 'Construction of Triangles', source: src(9),
  objectives: [
    {
      id: 'ts7.m.cons.sss', title: 'Constructing a triangle from three sides (SSS)',
      intro: [
        h('Three lengths, one triangle'),
        p('With a ruler and a compass you can copy any triangle if you know its three sides — the same reason the SSS rule works. A compass is perfect for marking a fixed distance from a point.'),
        stepsB(
          'Draw the base BC of the given length with a ruler.',
          'With centre B and radius equal to AB, draw an arc above BC.',
          'With centre C and radius equal to AC, draw another arc cutting the first arc at A.',
          'Join AB and AC. △ABC is the required triangle.',
        ),
        p('The arcs meet only if the triangle is possible: the two shorter sides must add to more than the longest side. If 2 cm + 3 cm < 6 cm, the arcs never meet!'),
        f('a + b > c (two shorter sides beat the longest)', 'a plus b is greater than c'),
        X({
          title: 'What if? Will the arcs meet?', formula: 'gap = (a + b) − c  (must be > 0)',
          result: ['g', 'Spare length', 'a + b - c', 'cm', 1],
          vars: [['a', 'Arc radius from B', 1, 10, 0.5, 4, 'cm'], ['b', 'Arc radius from C', 1, 10, 0.5, 5, 'cm'], ['c', 'Base BC', 1, 15, 0.5, 6, 'cm']],
          notes: [['c', 'A longer base pulls B and C apart; when the gap reaches 0 the arcs only touch on the base and no triangle forms.', 'A shorter base lets the arcs cross easily.']],
          mistakes: [['Using the wrong radius at each end', 'The arc from B uses AB; the arc from C uses AC.'], ['Changing the compass while drawing an arc', 'Keep the compass fixed for each arc.']],
          real: 'Surveyors fix a point on a map by measuring its distances from two known points — exactly this arc method.',
        }),
        keys('Draw the base first.', 'Two arcs from the ends of the base.', 'The arcs meet at the third vertex.', 'Check: two shorter sides > longest side.'),
        remember('Always draw a rough sketch and label the lengths before constructing.'),
        tip('Choose the longest side as the base — the arcs then meet above it neatly.'),
      ],
      examples: [
        ex('Can a triangle be constructed with sides 3 cm, 4 cm, 8 cm?', ['3 + 4 = 7', '7 < 8: the arcs will not meet'], 'No'),
        ex('Construct △PQR with PQ = 5 cm, QR = 6 cm, RP = 7 cm: which arc radius is used at Q if QR is the base?', ['Arc at Q gives the distance from Q to P', 'QP = 5 cm'], '5 cm'),
        ex('How many arcs do you need to construct an SSS triangle after drawing the base?', ['One from each end of the base'], '2 arcs'),
      ],
      practice: [
        orderT('order', 'Put the steps for constructing △ABC with AB = 5 cm, BC = 6 cm and AC = 4 cm in order.', ['Draw a rough sketch and label the sides.', 'Draw BC = 6 cm.', 'With centre B and radius 5 cm, draw an arc.', 'With centre C and radius 4 cm, draw an arc cutting the first at A.', 'Join AB and AC.'], ['Sketch first, then the base.', 'The arcs locate the third vertex.']),
        tp('possible', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9);
          const c = r.pick([a + b + 1, a + b, a + b - 1, Math.max(a, b) + 1, Math.abs(a - b) + 2]);
          const s = [a, b, c].sort((x, y) => x - y);
          const ok = s[0] + s[1] > s[2];
          return mcq(r, `Can a triangle be constructed with sides ${a} cm, ${b} cm and ${c} cm?`, ok ? 'Yes — the arcs will meet' : 'No — the arcs will not meet', [ok ? 'No — the arcs will not meet' : 'Yes — the arcs will meet'],
            ['Add the two shorter sides and compare with the longest.'], [`${s[0]} + ${s[1]} = ${s[0] + s[1]} ${s[0] + s[1] > s[2] ? '>' : '≤'} ${s[2]}`]);
        }),
        tp('radius', (r) => {
          const [A, B, C] = r.pick([['A', 'B', 'C'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['L', 'M', 'N']]);
          const ab = r.int(4, 8), bc = r.int(5, 9), ca = r.int(Math.abs(ab - bc) + 1, Math.min(9, ab + bc - 1));
          const atB = r.next() < 0.5;
          return typed(`To construct △${A}${B}${C} with ${A}${B} = ${ab} cm, ${B}${C} = ${bc} cm and ${C}${A} = ${ca} cm, you draw ${B}${C} first. What radius (cm) do you use for the arc centred at ${atB ? B : C}?`, num(atB ? ab : ca, 'cm'),
            [`The arc from ${atB ? B : C} must reach ${A}.`, `So use the length ${atB ? B + A : C + A}.`], [`Radius = ${atB ? `${A}${B} = ${ab}` : `${C}${A} = ${ca}`} cm`], [[String(bc), 'That is the base, which is already drawn.']]);
        }),
        bank('tools', [
          { q: 'Which instrument is used to draw arcs of a fixed radius?', a: 'Compass', w: ['Protractor', 'Set square', 'Divider only'], h: ['It holds a fixed opening.'], s: ['A compass draws arcs and circles of a given radius.'] },
          { q: 'In an SSS construction, the third vertex is found where:', a: 'the two arcs intersect', w: ['the base ends', 'the protractor reads 90°', 'the ruler reads 0'], h: ['Both distances must be correct at once.'], s: ['The intersection point is the right distance from both ends.'] },
          { q: 'To construct an equilateral triangle of side 5 cm, the compass radius for both arcs is:', a: '5 cm', w: ['2.5 cm', '10 cm', '15 cm'], h: ['All sides are equal.'], s: ['Every side is 5 cm, so both arcs use 5 cm.'] },
          { q: 'If the arcs from B and C do not meet, it means:', a: 'the triangle is not possible with those sides', w: ['you should draw a bigger base', 'the triangle is right-angled', 'you need a protractor'], h: ['Think of the triangle rule.'], s: ['The two shorter sides do not add up to more than the longest side.'] },
          { q: 'Before constructing a triangle, it helps to:', a: 'draw a rough labelled sketch', w: ['measure the angles first', 'draw all three arcs together', 'colour the triangle'], h: ['Plan first.'], s: ['A sketch shows which lengths go where.'] },
        ]),
        tp('perimeter', (r) => {
          const a = r.int(3, 9), b = r.int(3, 9), c = r.int(Math.abs(a - b) + 1, a + b - 1);
          return typed(`After constructing a triangle with sides ${a} cm, ${b} cm and ${c} cm, what is its perimeter?`, num(a + b + c, 'cm'), ['Add all three sides.'], [`${a} + ${b} + ${c} = ${a + b + c} cm`]);
        }),
      ],
    },
    {
      id: 'ts7.m.cons.sasrhs', title: 'Constructing triangles: SAS and RHS', prereqs: ['ts7.m.cons.sss'],
      intro: [
        h('Using an angle'),
        p('Sometimes you know two sides and the angle between them (SAS). Sometimes you have a right triangle with its hypotenuse and one side (RHS). Each set of data fixes the triangle exactly, so we can construct it.'),
        h('SAS: two sides and the included angle'),
        stepsB('Draw one side, say BC.', 'At B, draw the given angle with a protractor (or compass for 60°, 90°, …).', 'On this new ray, mark A at the given distance AB from B (use a compass).', 'Join AC.'),
        h('RHS: right angle, hypotenuse and one side'),
        stepsB('Draw the given side BC.', 'At C, construct a 90° angle and draw the ray CX.', 'With centre B and radius equal to the hypotenuse, draw an arc cutting CX at A.', 'Join AB.'),
        p('In RHS the hypotenuse must be LONGER than the given side; otherwise the arc cannot reach the perpendicular ray.'),
        f('third angle = 180° − (sum of the two known angles)', 'the third angle is 180 minus the other two'),
        X({
          title: 'What if? The angles after an SAS or ASA construction', formula: 'third angle = 180° − A − B',
          result: ['C', 'Third angle', '180 - A - B', '°'],
          vars: [['A', 'First angle', 10, 120, 5, 60, '°'], ['B', 'Second angle', 10, 50, 5, 45, '°']],
          notes: [['B', 'If the angles at the base open wider, the top angle gets sharper.', 'Narrower base angles leave a wider top angle.']],
          mistakes: [['Putting the angle at the wrong vertex', 'In SAS the angle is at the vertex SHARED by the two given sides.']],
          real: 'A ramp built at 90° to the floor with a 5 m slope and 3 m height is an RHS triangle — the slope is the hypotenuse.',
        }),
        keys('SAS: angle at the common vertex of the two sides.', 'RHS: right angle first, then the hypotenuse arc.', 'Hypotenuse > other side in RHS.'),
        remember('In ASA, the two given angles must add to less than 180°.'),
        tip('A 90° angle can be constructed with a compass by bisecting a straight angle.'),
      ],
      examples: [
        ex('Construct △PQR with PQ = 5 cm, ∠Q = 60°, QR = 6 cm. At which vertex is the angle drawn?', ['∠Q is between PQ and QR.'], 'At Q'),
        ex('Can a right triangle be constructed with hypotenuse 5 cm and one side 7 cm?', ['The hypotenuse must be the longest side.', '5 < 7'], 'No'),
        ex('In ASA data ∠B = 110° and ∠C = 80°. Is the triangle possible?', ['110 + 80 = 190 > 180'], 'No'),
      ],
      practice: [
        orderT('order-sas', 'Put the steps for constructing △ABC with BC = 6 cm, ∠B = 50° and AB = 4 cm in order.', ['Draw BC = 6 cm.', 'At B, draw a ray BX making 50° with BC.', 'With centre B and radius 4 cm, cut BX at A.', 'Join AC.'], ['Start with the base.', 'The angle is at B.']),
        orderT('order-rhs', 'Put the steps for constructing right △ABC with ∠C = 90°, BC = 4 cm and hypotenuse AB = 6 cm in order.', ['Draw BC = 4 cm.', 'At C, construct a ray CX perpendicular to BC.', 'With centre B and radius 6 cm, draw an arc cutting CX at A.', 'Join AB.'], ['The right angle is at C.', 'The arc of radius = hypotenuse comes from B.'], 2),
        tp('rhs-ok', (r) => {
          const hyp = r.int(4, 12), side = r.int(3, 13);
          const ok = hyp > side;
          return mcq(r, `Can a right-angled triangle be constructed with hypotenuse ${hyp} cm and one other side ${side} cm?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['The hypotenuse is always the longest side.'], [ok ? `${hyp} > ${side}, so yes.` : `${hyp} ≤ ${side}, so the arc cannot reach the perpendicular ray.`]);
        }),
        tp('asa-ok', (r) => {
          const a = r.int(20, 120), b = r.int(20, 120);
          const ok = a + b < 180;
          return mcq(r, `Can a triangle be constructed with ∠B = ${a}°, BC = 5 cm and ∠C = ${b}°?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['The two angles must add to less than 180°.'], [`${a}° + ${b}° = ${a + b}° ${ok ? '< 180°, so yes' : '≥ 180°, so the rays never meet'}`]);
        }),
        tp('third', (r) => {
          const a = r.pick([30, 40, 45, 50, 60, 70, 75, 80]), b = r.pick([30, 45, 60, 90]);
          return typed(`You construct △ABC with ∠B = ${a}° and ∠C = ${b}°. What will ∠A measure?`, num(180 - a - b, '°'),
            ['Angles of a triangle add to 180°.'], [`180° − ${a}° − ${b}° = ${180 - a - b}°`]);
        }),
        bank('sas', [
          { q: 'In the SAS construction of △PQR with PQ, QR and ∠Q given, the angle is drawn at:', a: 'Q', w: ['P', 'R', 'any vertex'], h: ['The included angle is at the shared vertex.'], s: ['PQ and QR meet at Q.'] },
          { q: 'Which instrument measures the given angle in an SAS construction?', a: 'Protractor', w: ['Compass alone', 'Ruler', 'Divider'], h: ['It is marked in degrees.'], s: ['A protractor measures angles in degrees.'] },
          { q: 'In RHS construction, the arc with radius equal to the hypotenuse is drawn from:', a: 'the end of the given side away from the right angle', w: ['the right-angle vertex', 'the midpoint of the side', 'anywhere'], h: ['The hypotenuse is opposite the right angle.'], s: ['The hypotenuse joins the far end of the side to the point on the perpendicular.'] },
          { q: 'Which data CANNOT give a triangle?', a: '∠A = 100°, ∠B = 90°, AB = 5 cm', w: ['AB = 5 cm, ∠A = 60°, AC = 4 cm', 'AB = 3 cm, BC = 4 cm, CA = 5 cm', '∠C = 90°, hypotenuse 10 cm, side 6 cm'], h: ['Add the angles.'], s: ['100° + 90° = 190° > 180°.'] },
          { q: 'Which angle is easiest to construct exactly with only a compass and ruler?', a: '60°', w: ['50°', '35°', '100°'], h: ['Think of an equilateral triangle.'], s: ['Arcs of equal radius give a 60° angle.'] },
        ]),
      ],
    },
    {
      id: 'ts7.m.cons.ssa', title: 'Two sides and a non-included angle', prereqs: ['ts7.m.cons.sasrhs'],
      intro: [
        h('When the angle is in the "wrong" place'),
        p('Suppose you know AB = 6 cm, AC = 4.5 cm and ∠B = 40°. The angle at B is NOT between the two given sides. Try it: draw ∠B, mark A 6 cm along the ray, then swing an arc of 4.5 cm from A to meet the base line. The arc may cut the base line twice, once, or not at all!'),
        stepsB('Draw a ray from B and construct the given angle at B.', 'Mark A on the slanting arm so that BA equals the given side.', 'With centre A and radius equal to the other side (AC), draw an arc to cut the base ray.', 'Each point where the arc cuts the base ray gives a possible C.'),
        def('Ambiguous case', 'With two sides and a non-included angle (SSA), there may be two different triangles, exactly one, or none. That is why SSA is not a congruence rule.'),
        p('If the side opposite the angle (AC) is too short to reach the base, there is no triangle. If AC is at least as long as AB, there is exactly one triangle. In between, the arc cuts twice and gives two triangles.'),
        f('AC too short → 0 triangles;  AC ≥ AB → 1 triangle;  in between → 2 triangles', 'compare A C with the shortest reach and with A B'),
        keys('SSA: the angle is not between the given sides.', 'It can give 0, 1 or 2 triangles.', 'If the opposite side is longer than or equal to the adjacent side, exactly one triangle.', 'SSA is not a congruence rule.'),
        remember('If the given angle is a right angle, SSA becomes RHS and gives exactly one triangle (when the hypotenuse is longer).'),
        tip('Always draw the arc fully across the base ray to see whether it cuts once or twice.'),
      ],
      examples: [
        ex('AB = 5 cm, ∠B = 50°, AC = 6 cm. How many triangles?', ['AC (opposite ∠B) is longer than AB.', 'The arc cuts the base ray only once on the correct side.'], 'Exactly one'),
        ex('AB = 6 cm, ∠B = 30°, AC = 2 cm. How many triangles?', ['The shortest distance from A to the base is half of AB (because ∠B = 30°), which is 3 cm.', '2 cm < 3 cm: the arc never reaches the base.'], 'None'),
        ex('Why is SSA not a congruence rule?', ['Two different triangles can share the same two sides and the same non-included angle.'], 'Because the data can give two different triangles'),
      ],
      practice: [
        orderT('order', 'Put the steps for constructing △ABC with AB = 6 cm, ∠B = 45° and AC = 5 cm in order.', ['Draw a base ray from B.', 'Construct ∠B = 45° at B.', 'Mark A on the slanting arm with BA = 6 cm.', 'With centre A and radius 5 cm, draw an arc cutting the base ray.', 'Join A to each point where the arc cuts the base ray.'], ['The angle is at B, not between the given sides.', 'The arc from A finds C.']),
        tp('count', (r) => {
          const k = r.int(0, 2);
          const ang = r.pick([30, 30, 30]);
          const ab = r.pick([6, 8, 10]);
          const hgt = ab / 2; // sin 30° = 1/2
          const ac = k === 0 ? hgt - 1 : k === 1 ? ab + r.int(0, 2) : hgt + 1;
          const ans = ['No triangle', 'Exactly one triangle', 'Two triangles'][k];
          return mcq(r, `AB = ${ab} cm, ∠B = ${ang}° and AC = ${ac} cm. The shortest distance from A to the base line is ${hgt} cm (half of AB, because ∠B = 30°). How many triangles fit this data?`, ans, ['No triangle', 'Exactly one triangle', 'Two triangles'].filter((x) => x !== ans),
            [`Compare AC = ${ac} with ${hgt} (the shortest reach) and with AB = ${ab}.`, 'Shorter than the reach → none; at least AB → one; in between → two.'],
            [k === 0 ? `${ac} < ${hgt}: the arc cannot reach the base.` : k === 1 ? `${ac} ≥ ${ab}: the arc cuts the base ray once on the correct side.` : `${hgt} < ${ac} < ${ab}: the arc cuts the base ray twice.`, ans]);
        }, 3),
        bank('ideas', [
          { q: 'In SSA data, the given angle is:', a: 'not between the two given sides', w: ['between the two given sides', 'always 90°', 'always the largest angle'], h: ['SAS has the angle between; SSA does not.'], s: ['That is what "non-included" means.'] },
          { q: 'How many triangles can SSA data give?', a: '0, 1 or 2', w: ['always exactly 1', 'always 2', 'always 0'], h: ['Think of the arc cutting the base ray.'], s: ['The arc can miss, cut once, or cut twice.'] },
          { q: 'SSA is not a congruence rule because:', a: 'the same data can give two different triangles', w: ['it uses too many sides', 'angles cannot be measured', 'it only works for right triangles'], h: ['Ambiguous case.'], s: ['Two different triangles can have the same SSA data.'] },
          { q: 'If the non-included angle is 90°, SSA becomes:', a: 'RHS', w: ['ASA', 'AAA', 'SSS'], h: ['Right angle, hypotenuse, side.'], s: ['With a right angle, SSA is the RHS case.'] },
          { q: 'In SSA, which tool finds the third vertex on the base ray?', a: 'An arc drawn with a compass', w: ['A protractor reading', 'A set square', 'A second angle'], h: ['The length AC is known.'], s: ['An arc of radius AC from A cuts the base ray at C.'] },
        ]),
        tp('reach', (r) => {
          const ab = r.pick([4, 6, 8, 10, 12, 14]);
          return typed(`AB = ${ab} cm and ∠B = 30°. The shortest distance from A to the base line through B is half of AB. What is the shortest length of AC (cm) that still touches the base line?`, num(ab / 2, 'cm'),
            ['With ∠B = 30°, the perpendicular from A to the base is half of AB.'], [`${ab} ÷ 2 = ${ab / 2} cm`]);
        }, 2),
        tp('which-case', (r) => {
          const [A, B, C] = r.pick([['A', 'B', 'C'], ['P', 'Q', 'R'], ['L', 'M', 'N'], ['X', 'Y', 'Z']]);
          const k = r.int(0, 3);
          const data = [
            [`${A}${B}, ${B}${C} and ${C}${A}`, 'SSS'],
            [`${A}${B}, ∠${B} and ${B}${C}`, 'SAS'],
            [`${A}${B}, ∠${B} and ${C}${A}`, 'SSA (non-included angle)'],
            [`∠${A}, ${A}${B} and ∠${B}`, 'ASA'],
          ][k];
          return mcq(r, `You are given ${data[0]} of △${A}${B}${C}. Which kind of construction is this?`, data[1], ['SSS', 'SAS', 'SSA (non-included angle)', 'ASA'].filter((x) => x !== data[1]),
            ['Check whether the angle sits between the two sides (SAS) or not (SSA).'], [`${data[0]} → ${data[1]}`]);
        }),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9];
