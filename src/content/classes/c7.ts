// Class 7 — NCERT Ganita Prakash Parts 1 & 2 (Mathematics) and physics chapters of NCERT Curiosity (Science).
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, stepsB, num, approx, frac, expr, choose, matching, ordering, tapAll,
  gcd, lcm, fr, rd, inr, sgn, NAMES, CITIES, type USpec,
} from '../lib/kit';
import { tsClass7 } from '../ts/c7';

const indian = (n: number) => n.toLocaleString('en-IN');
const term = (k: number, v: string) => (k === 1 ? v : k === -1 ? `−${v}` : `${k}${v}`);

// ------------------------------------------------------------------ MATHS (Part 1)
const large: USpec = {
  id: 'c7.u.large', subject: 'math', title: 'Large Numbers Around Us', source: src('gp7a', 1, 'Large Numbers Around Us'),
  objectives: [{
    id: 'c7.num.large', title: 'Lakhs, crores and the Indian place-value system', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('In the Indian system we group digits as thousands, lakhs and crores: 1 lakh = 1,00,000 and 1 crore = 1,00,00,000 = 100 lakh.'),
      p('The international system groups in threes: 1 million = 10 lakh; 1 billion = 100 crore.'),
      f('1 lakh = 100 thousand;  1 crore = 100 lakh = 10 million'),
      tip('Commas in the Indian system: first after 3 digits from the right, then after every 2 digits — 4,56,78,912.'),
    ],
    examples: [
      ex('Write 3,45,60,000 in words.', ['3 crore', '45 lakh', '60 thousand'], 'Three crore forty-five lakh sixty thousand'),
      ex('How many lakhs make 2.5 crore?', ['1 crore = 100 lakh', '2.5 × 100 = 250'], '250 lakh'),
    ],
    practice: [
      tp('place', (r) => {
        const n = r.int(10000000, 999999999);
        const places = [['ones', 1], ['tens', 10], ['hundreds', 100], ['thousands', 1000], ['ten-thousands', 10000], ['lakhs', 100000], ['ten-lakhs', 1000000], ['crores', 10000000]] as [string, number][];
        const [nm, v] = r.pick(places);
        const d = Math.floor(n / v) % 10;
        return {
          type: 'typed', keypad: 'numeric', prompt: `What is the digit in the ${nm} place of ${indian(n)}?`, answer: num(d),
          hints: ['Read the places from the right: ones, tens, hundreds, thousands, ten-thousands, lakhs, ten-lakhs, crores.'],
          solution: [`${indian(n)} → ${nm} digit is ${d}`],
        };
      }),
      tp('convert', (r) => {
        const kind = r.pick(['lakh-in-crore', 'thousand-in-lakh', 'million-to-lakh'] as const);
        const k = r.int(2, 40) / 2;
        const map = { 'lakh-in-crore': [`How many lakhs are there in ${k} crore?`, k * 100, 'lakh'], 'thousand-in-lakh': [`How many thousands are there in ${k} lakh?`, k * 100, 'thousand'], 'million-to-lakh': [`${k} million is how many lakh?`, k * 10, 'lakh'] } as const;
        const [q, a] = map[kind];
        return {
          type: 'typed', keypad: 'numeric', prompt: q, answer: num(a),
          hints: ['1 crore = 100 lakh; 1 lakh = 100 thousand; 1 million = 10 lakh.'],
          mistakes: [{ when: String(k * 10 === a ? k * 100 : k * 10), explain: 'Check the conversion factor: lakh↔crore and thousand↔lakh use 100; million↔lakh uses 10.' }],
          solution: [`${q.replace('?', '')} = ${a}`],
        };
      }),
      tp('estimate', (r) => {
        const a = r.int(12, 98) * 100000 + r.int(0, 99999), b = r.int(12, 98) * 100000 + r.int(0, 99999);
        const est = Math.round(a / 100000) + Math.round(b / 100000);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Round each to the nearest lakh and estimate the sum in lakhs: ${indian(a)} + ${indian(b)}`, answer: num(est),
          hints: ['Round each number to the nearest lakh first.', 'Then add the lakhs.'],
          solution: [`${indian(a)} ≈ ${Math.round(a / 100000)} lakh`, `${indian(b)} ≈ ${Math.round(b / 100000)} lakh`, `Sum ≈ ${est} lakh`],
        };
      }, 2),
    ],
  }],
};

const arith: USpec = {
  id: 'c7.u.arith', subject: 'math', title: 'Arithmetic Expressions', source: src('gp7a', 2, 'Arithmetic Expressions'),
  objectives: [{
    id: 'c7.expr.order', title: 'Evaluating expressions: brackets and order of operations', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('An arithmetic expression combines numbers with +, −, × and ÷. Its value must be the same for everyone, so we follow an order: brackets first, then × and ÷ (left to right), then + and − (left to right).'),
      p('Expressions can be split into terms joined by + and −. Swapping terms or grouping them differently does not change a sum.'),
      tip('30 − 5 × 4 = 30 − 20 = 10, not 25 × 4!'),
    ],
    examples: [
      ex('Evaluate 18 + 6 × 3 − 4.', ['Multiply first: 6 × 3 = 18', '18 + 18 − 4 = 32'], '32'),
      ex('Ravi buys 3 pens at ₹12 and 2 notebooks at ₹45. Write and evaluate.', ['3 × 12 + 2 × 45', '= 36 + 90 = 126'], '₹126'),
    ],
    practice: [
      tp('eval', (r) => {
        const a = r.int(5, 40), b = r.int(2, 9), c = r.int(2, 9), d = r.int(1, 15);
        const form = r.pick([0, 1, 2]);
        const [s, v, wrong] = form === 0 ? [`${a} + ${b} × ${c} − ${d}`, a + b * c - d, (a + b) * c - d]
          : form === 1 ? [`(${a} + ${b}) × ${c} − ${d}`, (a + b) * c - d, a + b * c - d]
          : [`${a * c} ÷ ${c} + ${b} × ${d}`, a + b * d, (a + b) * d];
        return {
          type: 'typed', keypad: 'numeric', prompt: `Evaluate: ${s}`, answer: num(v),
          hints: ['Brackets first.', 'Then × and ÷, then + and −.'],
          mistakes: [{ when: String(wrong), explain: 'You worked strictly left to right. Multiplication and division come before addition and subtraction (unless brackets say otherwise).' }],
          solution: [`${s} = ${v}`],
        };
      }),
      tp('shop', (r) => {
        const nm = r.pick(NAMES).en;
        const p1 = r.pick([8, 10, 12, 15, 20]), n1 = r.int(2, 6), p2 = r.pick([25, 30, 35, 40, 45]), n2 = r.int(1, 4), paid = 500;
        const cost = n1 * p1 + n2 * p2;
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `${nm} buys ${n1} samosas at ₹${p1} each and ${n2} juices at ₹${p2} each, and pays with a ₹${paid} note. How much change?`, answer: num(paid - cost, '₹'),
          steps: [{ prompt: 'Total cost (₹)', answer: num(cost, '₹') }, { prompt: 'Change (₹)', answer: num(paid - cost, '₹') }],
          hints: ['Write the expression: 500 − (n₁ × p₁ + n₂ × p₂).', 'Work out the brackets first.'],
          solution: [`Cost = ${n1} × ${p1} + ${n2} × ${p2} = ${inr(cost)}`, `Change = 500 − ${cost} = ${inr(paid - cost)}`],
        };
      }),
      tp('compare', (r) => {
        const a = r.int(10, 60), b = r.int(2, 9), c = r.int(2, 9);
        const e1 = `${a} − ${b} + ${c}`, e2 = `${a} − (${b} + ${c})`;
        const v1 = a - b + c, v2 = a - (b + c);
        return { type: 'mcq', prompt: `Which is true? A: ${e1}   B: ${e2}`, ...choose(r, 'A is greater than B', ['A equals B', 'B is greater than A']), hints: ['Evaluate each.', 'Subtracting a bracket subtracts every term inside.'], solution: [`A = ${v1}, B = ${v2}`, 'A > B'] };
      }),
    ],
  }],
};

const decimals: USpec = {
  id: 'c7.u.decimals', subject: 'math', title: 'A Peek Beyond the Point', source: src('gp7a', 3, 'A Peek Beyond the Point'),
  objectives: [{
    id: 'c7.dec.place', title: 'Decimal place value, comparing and units', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('Decimals extend place value beyond the ones: tenths (1/10), hundredths (1/100), thousandths (1/1000).'),
      p('Decimals are everywhere in measurement: 1.25 m = 1 m 25 cm; ₹12.50 = 12 rupees 50 paise; 2.5 kg = 2 kg 500 g.'),
      vis({ kind: 'number-line', from: 0, to: 1, step: 0.1, marks: [0.3, 0.7] }, 'Number line from 0 to 1 in tenths'),
      tip('Compare decimals digit by digit from the left: 0.5 > 0.45 because 5 tenths > 4 tenths.'),
    ],
    examples: [
      ex('Which is greater: 3.07 or 3.7?', ['Ones equal (3)', 'Tenths: 0 vs 7'], '3.7'),
      ex('Write 4 m 6 cm in metres.', ['6 cm = 6/100 m = 0.06 m'], '4.06 m'),
    ],
    practice: [
      tp('compare', (r) => {
        const a = rd(r.int(100, 999) / 100, 2), b = rd(r.int(10, 99) / 10, 1);
        const B = a === b ? rd(b + 0.1, 1) : b;
        const big = Math.max(a, B);
        return { type: 'mcq', prompt: `Which is greater: ${a} or ${B}?`, ...choose(r, String(big), [String(Math.min(a, B)), 'They are equal']), hints: ['Line up the decimal points.', 'Compare ones, then tenths, then hundredths.'], mistakes: [{ when: 'wrong', explain: 'More digits after the point does not mean bigger. Compare place by place.' }], solution: [`${big} is greater`] };
      }),
      tp('units', (r) => {
        const m = r.int(1, 9), cm = r.int(1, 99);
        const v = rd(m + cm / 100, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `Write ${m} m ${cm} cm in metres.`, answer: num(v, 'm'),
          hints: ['100 cm = 1 m, so 1 cm = 0.01 m.', `${cm} cm = ${cm / 100} m`],
          mistakes: [{ when: `${m}.${cm}`, explain: cm < 10 ? `${cm} cm is ${cm} hundredths of a metre — write 0.0${cm}.` : 'Check the place of the centimetres: they are hundredths.' }],
          solution: [`${m} + ${cm}/100 = ${v} m`],
        };
      }),
      tp('line', (r) => {
        const v = rd(r.int(1, 19) / 10, 1);
        return { type: 'number-line', prompt: `Mark ${v} on the number line.`, line: { from: 0, to: 2, step: 0.1 }, answer: num(v, undefined, false, 0.001), hints: ['Each small step is 0.1.', `Count ${Math.round(v * 10)} steps from 0.`], solution: [`${v} = ${Math.round(v * 10)} tenths`] };
      }),
    ],
  }],
};

const letters: USpec = {
  id: 'c7.u.algebra', subject: 'math', title: 'Expressions using Letter-Numbers', source: src('gp7a', 4, 'Expressions using Letter-Numbers'),
  objectives: [{
    id: 'c7.alg.expr', title: 'Writing and simplifying algebraic expressions', prereqs: ['c7.expr.order'],
    activities: ['game:balance'],
    intro: [
      p('A letter-number (variable) like n can stand for any number. "5 more than a number" is n + 5; "3 times a number" is 3n.'),
      p('Like terms have the same letter part: 3x and 5x are like; 3x and 5y are not. Combine like terms by adding their coefficients.'),
      f('3x + 5x − 2x = 6x'),
    ],
    examples: [
      ex('Each auto ride costs ₹30 plus ₹12 per km. Cost for k km?', ['Fixed part ₹30, variable part 12 × k'], '30 + 12k'),
      ex('Simplify 4a + 3b − a + 2b.', ['4a − a = 3a', '3b + 2b = 5b'], '3a + 5b'),
    ],
    practice: [
      tp('simplify', (r) => {
        const a = r.int(2, 9), b = r.int(1, 8), c = r.int(1, 9), d = r.int(1, 6);
        const x = a - b, y = c + d;
        const ans = `${term(x, 'x')} + ${term(y, 'y')}`;
        return {
          type: 'typed', keypad: 'algebra', prompt: `Simplify: ${a}x + ${c}y − ${b}x + ${d}y`,
          answer: expr(x === 0 ? `${y}y` : ans, x === 0 ? `${y}y` : `${term(y, 'y')}+${term(x, 'x')}`),
          hints: ['Group the x terms and the y terms.', `x: ${a} − ${b}; y: ${c} + ${d}`],
          mistakes: [{ when: `${a + b + c + d}xy`, explain: 'Only like terms can be added. x-terms and y-terms stay separate.' }],
          solution: [`(${a} − ${b})x + (${c} + ${d})y`, `= ${x === 0 ? `${y}y` : ans}`],
        };
      }, 2),
      tp('evaluate', (r) => {
        const a = r.int(2, 9), b = r.int(-9, 12), n = r.int(-4, 9);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the value of ${a}n ${sgn(b)} when n = ${n}.`, answer: num(a * n + b),
          hints: [`Replace n by ${n}.`, `${a} × ${n} first, then add ${b}.`],
          mistakes: [{ when: String(Number(`${a}${Math.abs(n)}`) + b), explain: `${a}n means ${a} × n, not the digits written side by side.` }],
          solution: [`${a} × ${n} ${sgn(b)} = ${a * n} ${sgn(b)} = ${a * n + b}`],
        };
      }),
      tp('write', (r) => {
        const k = r.int(2, 9), m = r.int(2, 9);
        const forms: [string, string, string[]][] = [
          [`${k} more than a number n`, `n + ${k}`, [`${k}n`, `n − ${k}`, `${k} − n`]],
          [`${k} less than ${m} times a number n`, `${m}n − ${k}`, [`${k} − ${m}n`, `${m}(n − ${k})`, `${m}n + ${k}`]],
          [`a number n divided by ${k}, then increased by ${m}`, `n/${k} + ${m}`, [`(n + ${m})/${k}`, `${k}n + ${m}`, `n/${k} − ${m}`]],
          [`${m} times the sum of n and ${k}`, `${m}(n + ${k})`, [`${m}n + ${k}`, `n + ${m * k}`, `${m} + n + ${k}`]],
        ];
        const [w, a, d] = r.pick(forms);
        return { type: 'mcq', prompt: `Which expression means "${w}"?`, ...choose(r, a, d), hints: ['Translate word by word.', '"times the sum" needs brackets.'], solution: [`"${w}" = ${a}`] };
      }),
    ],
  }],
};

const parallel: USpec = {
  id: 'c7.u.parallel', subject: 'math', title: 'Parallel and Intersecting Lines', source: src('gp7a', 5, 'Parallel and Intersecting Lines'),
  objectives: [{
    id: 'c7.geo.transversal', title: 'Angles made by a transversal', prereqs: [],
    activities: ['art:trace'],
    intro: [
      p('When two lines cross, vertically opposite angles are equal and adjacent angles add to 180° (linear pair).'),
      p('When a transversal cuts two parallel lines: corresponding angles are equal, alternate angles are equal, and interior angles on the same side add to 180°.'),
      tip('Railway tracks and ruled notebook lines are everyday parallel lines.'),
    ],
    examples: [
      ex('Two lines cross and one angle is 70°. Find the other three.', ['Vertically opposite: 70°', 'Linear pair: 180° − 70° = 110°'], '70°, 110°, 110°'),
      ex('Parallel lines cut by a transversal; one interior angle is 115°. Co-interior angle?', ['They add to 180°'], '65°'),
    ],
    practice: [
      tp('pair', (r) => {
        const a = r.int(20, 160);
        const rel = r.pick(['vertically opposite', 'corresponding', 'alternate interior', 'co-interior (same side interior)', 'linear pair'] as const);
        const ans = rel === 'co-interior (same side interior)' || rel === 'linear pair' ? 180 - a : a;
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: `${rel === 'vertically opposite' || rel === 'linear pair' ? 'Two lines intersect.' : 'Two parallel lines are cut by a transversal.'} One angle is ${a}°. Find the ${rel} angle to it.`, answer: num(ans, '°'),
          hints: ['Equal pairs: vertically opposite, corresponding, alternate.', 'Pairs adding to 180°: linear pair, co-interior.'],
          mistakes: [{ when: String(180 - ans), explain: ans === a ? `${rel} angles are equal.` : `${rel} angles add up to 180°.` }],
          solution: [ans === a ? `${rel} angles are equal → ${a}°` : `180° − ${a}° = ${ans}°`],
        };
      }),
      tp('identify', (r) => {
        const pairs: [string, string][] = [['Angles in an "F" shape', 'Corresponding'], ['Angles in a "Z" shape', 'Alternate'], ['Angles in a "C" (or "U") shape', 'Co-interior'], ['Angles opposite each other at a crossing', 'Vertically opposite']];
        const [d, a] = r.pick(pairs);
        const ctx = r.pick(['', ' on a railway track drawing', ' on a ladder picture', ' on ruled notebook lines']);
        return { type: 'mcq', prompt: `${d}${ctx} are called…`, ...choose(r, a, pairs.map((x) => x[1]).filter((x) => x !== a)), hints: ['F → corresponding, Z → alternate, C → co-interior.'], solution: [`${d}: ${a.toLowerCase()} angles`] };
      }),
    ],
  }],
};

const numPlay7: USpec = {
  id: 'c7.u.numplay', subject: 'math', title: 'Number Play', source: src('gp7a', 6, 'Number Play'),
  objectives: [{
    id: 'c7.num.parity', title: 'Parity, divisibility and number puzzles', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('Parity: even + even = even, odd + odd = even, even + odd = odd. odd × odd = odd; anything × even = even.'),
      p('Parity lets you decide things without calculating — the sum of 5 odd numbers must be odd.'),
      tip('Magic squares: every row, column and diagonal has the same sum. In a 3 × 3 magic square with 1–9, the magic sum is 15 and 5 is in the centre.'),
    ],
    examples: [
      ex('Is 237 + 518 + 991 odd or even?', ['odd + even + odd', 'Two odds make even; + even stays even'], 'Even'),
      ex('Can 6 odd numbers add up to 31?', ['Six odd numbers add up to an even number', '31 is odd'], 'No'),
    ],
    practice: [
      tp('parity', (r) => {
        const ns = [r.int(11, 999), r.int(11, 999), r.int(11, 999)];
        const op = r.pick(['+', '×'] as const);
        const v = op === '+' ? ns.reduce((a, b) => a + b, 0) : ns.reduce((a, b) => a * b, 1);
        const ans = v % 2 === 0 ? 'Even' : 'Odd';
        return { type: 'mcq', prompt: `Without calculating, is ${ns.join(` ${op} `)} odd or even?`, ...choose(r, ans, [ans === 'Even' ? 'Odd' : 'Even']), hints: [op === '+' ? 'Count the odd numbers: an even count of odds gives even.' : 'A product is even if any factor is even.'], solution: [`Parities: ${ns.map((n) => (n % 2 ? 'odd' : 'even')).join(', ')}`, `Result: ${ans.toLowerCase()}`] };
      }),
      tp('magic', (r) => {
        const base = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
        const add = r.int(0, 9);
        const g = base.map((row) => row.map((x) => x + add));
        const i = r.int(0, 2), j = r.int(0, 2);
        const hidden = g[i][j];
        const show = g.map((row, a) => row.map((x, b) => (a === i && b === j ? '?' : String(x))).join('  ')).join('  |  ');
        return {
          type: 'typed', keypad: 'numeric', prompt: `This is a magic square (rows shown left to right, separated by |). Find the missing number: ${show}`, answer: num(hidden),
          hints: ['Find a complete row, column or diagonal to get the magic sum.', 'Then use the row with the "?".'],
          solution: [`Magic sum = ${15 + 3 * add}`, `Missing number = ${hidden}`],
        };
      }, 2),
      tp('div', (r) => {
        const d = r.pick([3, 4, 9, 11]);
        const n = r.int(1000, 99999);
        const ok = n % d === 0;
        const rule: Record<number, string> = { 3: 'digit sum divisible by 3', 4: 'last two digits divisible by 4', 9: 'digit sum divisible by 9', 11: 'difference of alternate-digit sums divisible by 11' };
        return { type: 'mcq', prompt: `Is ${n} divisible by ${d}?`, ...choose(r, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes']), hints: [`Test: ${rule[d]}.`], solution: [`${n} ÷ ${d} ${ok ? `= ${n / d} exactly` : `leaves remainder ${n % d}`}`] };
      }),
    ],
  }],
};

const triangles: USpec = {
  id: 'c7.u.triangles', subject: 'math', title: 'A Tale of Three Intersecting Lines', source: src('gp7a', 7, 'A Tale of Three Intersecting Lines'),
  objectives: [{
    id: 'c7.geo.triangle', title: 'Angle sum and triangle inequality', prereqs: ['c7.geo.transversal'],
    activities: ['game:shapes'],
    intro: [
      p('Three lines that meet pairwise make a triangle. Its three angles always add up to 180°.'),
      p('Triangle inequality: any two sides together must be longer than the third side — otherwise the sides cannot close up.'),
      vis({ kind: 'triangle', a: 5, b: 6, c: 7, angleLabels: ['A', 'B', 'C'] }, 'Triangle ABC'),
    ],
    examples: [
      ex('Two angles of a triangle are 50° and 65°. The third?', ['180° − 50° − 65°'], '65°'),
      ex('Can 3 cm, 4 cm and 8 cm make a triangle?', ['3 + 4 = 7, which is less than 8'], 'No'),
    ],
    practice: [
      tp('angle', (r) => {
        const a = r.int(20, 100), b = r.int(15, 160 - a - 5);
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, answer: num(180 - a - b, '°'),
          hints: ['Angles of a triangle add up to 180°.'],
          mistakes: [{ when: String(360 - a - b), explain: '360° is for a full turn (or a quadrilateral). A triangle\'s angles add to 180°.' }],
          solution: [`180° − ${a}° − ${b}° = ${180 - a - b}°`],
        };
      }),
      tp('possible', (r) => {
        const a = r.int(2, 10), b = r.int(2, 10), c = r.int(2, 18);
        const ok = a + b > c && a + c > b && b + c > a;
        return { type: 'mcq', prompt: `Can sticks of ${a} cm, ${b} cm and ${c} cm form a triangle?`, ...choose(r, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes']), hints: ['Check: sum of the two shorter sides > the longest side.'], solution: [`Shorter two: ${[a, b, c].sort((x, y) => x - y).slice(0, 2).join(' + ')} = ${[a, b, c].sort((x, y) => x - y).slice(0, 2).reduce((x, y) => x + y)}`, ok ? 'That is more than the longest side → yes.' : 'That is not more than the longest side → no.'] };
      }),
      tp('exterior', (r) => {
        const a = r.int(25, 80), b = r.int(25, 80);
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: `In a triangle, two interior angles are ${a}° and ${b}°. Find the exterior angle at the third vertex.`, answer: num(a + b, '°'),
          hints: ['Exterior angle = sum of the two opposite interior angles.', 'Or: find the third angle, then subtract from 180°.'],
          solution: [`Third angle = ${180 - a - b}°`, `Exterior = 180° − ${180 - a - b}° = ${a + b}°`],
        };
      }, 2),
    ],
  }],
};

const workFrac: USpec = {
  id: 'c7.u.fractions', subject: 'math', title: 'Working with Fractions', source: src('gp7a', 8, 'Working with Fractions'),
  objectives: [{
    id: 'c7.frac.muldiv', title: 'Multiplying and dividing fractions', prereqs: [],
    activities: ['game:fractions'],
    intro: [
      p('To multiply fractions, multiply numerators and multiply denominators: 2/3 × 3/4 = 6/12 = 1/2. "of" means multiply: 1/3 of 12 = 4.'),
      p('To divide by a fraction, multiply by its reciprocal: a/b ÷ c/d = a/b × d/c.'),
      vis({ kind: 'fraction-bar', parts: 4, shaded: 3, label: '3/4' }, 'Three quarters'),
      tip('Multiplying by a fraction less than 1 makes the answer smaller.'),
    ],
    examples: [
      ex('3/5 × 10/9 = ?', ['= 30/45', '= 2/3'], '2/3'),
      ex('How many 3/4-litre bottles can be filled from 6 litres?', ['6 ÷ 3/4 = 6 × 4/3', '= 8'], '8 bottles'),
    ],
    practice: [
      tp('mul', (r) => {
        const a = r.int(1, 7), b = r.int(a + 1, 9), c = r.int(1, 7), d = r.int(c + 1, 10);
        return {
          type: 'typed', keypad: 'fraction', prompt: `Multiply: ${a}/${b} × ${c}/${d}`, answer: frac(a * c, b * d),
          hints: ['Multiply top × top and bottom × bottom.', 'Simplify if you can.'],
          mistakes: [{ when: `${a * d}/${b * c}`, explain: 'That is division. For multiplication, do NOT flip the second fraction.' }],
          solution: [`${a}×${c} / ${b}×${d} = ${a * c}/${b * d}`, `= ${fr(a * c, b * d)}`],
        };
      }),
      tp('div', (r) => {
        const a = r.int(1, 8), b = r.int(2, 9), c = r.int(1, 6), d = r.int(c + 1, 9);
        return {
          type: 'typed', keypad: 'fraction', prompt: `Divide: ${a}/${b} ÷ ${c}/${d}`, answer: frac(a * d, b * c),
          hints: [`Flip the second fraction: ${d}/${c}.`, 'Then multiply.'],
          mistakes: [{ when: `${a * c}/${b * d}`, explain: 'You multiplied straight across. To divide, multiply by the reciprocal.' }],
          solution: [`${a}/${b} × ${d}/${c} = ${a * d}/${b * c}`, `= ${fr(a * d, b * c)}`],
        };
      }),
      tp('of', (r) => {
        const d = r.pick([3, 4, 5, 6, 8]), n = r.int(1, d - 1), k = r.int(2, 12);
        const total = d * k;
        const nm = r.pick(NAMES).en;
        return {
          type: 'typed', keypad: 'numeric', prompt: `${nm} has ₹${total * 10}. She spends ${n}/${d} of it on books. How much is spent (in ₹)?`, answer: num(n * k * 10),
          hints: [`First find 1/${d} of ₹${total * 10}.`, `Then multiply by ${n}.`],
          solution: [`1/${d} of ${total * 10} = ${k * 10}`, `${n} × ${k * 10} = ₹${n * k * 10}`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ MATHS (Part 2)
const twins: USpec = {
  id: 'c7.u.congruence', subject: 'math', title: 'Geometric Twins', source: src('gp7b', 1, 'Geometric Twins'),
  objectives: [{
    id: 'c7.geo.congruent', title: 'Congruent triangles: SSS, SAS, ASA, RHS', prereqs: ['c7.geo.triangle'],
    activities: ['game:shapes'],
    intro: [
      p('Two figures are congruent if one fits exactly on the other — same shape AND same size.'),
      stepsB('SSS: all three sides equal', 'SAS: two sides and the included angle equal', 'ASA: two angles and the included side equal', 'RHS: right angle, hypotenuse and one side equal'),
      tip('AAA is NOT a test: equal angles give the same shape but possibly a different size.'),
    ],
    examples: [
      ex('△ABC: AB = 5, BC = 6, ∠B = 40°. △PQR: PQ = 5, QR = 6, ∠Q = 40°. Congruent?', ['Two sides and the included angle match'], 'Yes, by SAS'),
      ex('Two triangles have angles 50°, 60°, 70°. Must they be congruent?', ['Only angles are equal (AAA)'], 'No — they may differ in size'),
    ],
    practice: [
      tp('rule', (r) => {
        const cases: [string, string][] = [
          ['AB = PQ, BC = QR, CA = RP', 'SSS'], ['AB = PQ, ∠B = ∠Q, BC = QR', 'SAS'], ['∠A = ∠P, AB = PQ, ∠B = ∠Q', 'ASA'],
          ['∠B = ∠Q = 90°, AC = PR, AB = PQ', 'RHS'], ['∠A = ∠P, ∠B = ∠Q, ∠C = ∠R', 'Not enough information'], ['AB = PQ, ∠A = ∠P (only)', 'Not enough information'],
        ];
        const [g, a] = r.pick(cases);
        return { type: 'mcq', prompt: `In △ABC and △PQR: ${g}. Which rule shows they are congruent?`, ...choose(r, a, ['SSS', 'SAS', 'ASA', 'RHS', 'Not enough information'].filter((x) => x !== a)), hints: ['Is the angle between the two sides (included)?', 'Equal angles alone do not fix size.'], solution: [`${g} → ${a}`] };
      }),
      tp('corresp', (r) => {
        const s = r.int(3, 12), t = r.int(3, 12), u = r.int(3, 12);
        const ask = r.pick(['PQ', 'QR', 'RP'] as const);
        const v = { PQ: s, QR: t, RP: u }[ask];
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `△ABC ≅ △PQR. AB = ${s} cm, BC = ${t} cm, CA = ${u} cm. Find ${ask}.`, answer: num(v, 'cm'),
          hints: ['The order of letters tells you which parts match: A↔P, B↔Q, C↔R.'],
          solution: [`${ask} corresponds to ${{ PQ: 'AB', QR: 'BC', RP: 'CA' }[ask]} = ${v} cm`],
        };
      }),
    ],
  }],
};

const integers7: USpec = {
  id: 'c7.u.integers', subject: 'math', title: 'Operations with Integers', source: src('gp7b', 2, 'Operations with Integers'),
  objectives: [{
    id: 'c7.int.muldiv', title: 'Multiplying and dividing integers', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('Sign rules: (+) × (+) = +, (−) × (−) = +, (+) × (−) = −. The same rules apply to division.'),
      p('Think of a submarine descending 3 m per minute: after 4 minutes its change in depth is 4 × (−3) = −12 m.'),
      f('(−a) × (−b) = ab;  (−a) × b = −ab'),
    ],
    examples: [
      ex('(−6) × (−7) = ?', ['negative × negative = positive', '6 × 7 = 42'], '42'),
      ex('(−48) ÷ 6 = ?', ['negative ÷ positive = negative'], '−8'),
    ],
    practice: [
      tp('mul', (r) => {
        const a = r.int(-12, 12) || -3, b = r.int(-12, 12) || 5;
        const op = r.pick(['×', '÷'] as const);
        const [x, y, ans] = op === '×' ? [a, b, a * b] : [a * b, b, a];
        const w = (n: number) => (n < 0 ? `(${n})` : `${n}`);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${w(x)} ${op} ${w(y)} = ?`, answer: num(ans),
          hints: ['Work out the size first, then the sign.', 'Same signs → positive; different signs → negative.'],
          mistakes: [{ when: String(-ans), explain: 'Check the sign rule: same signs give positive, different signs give negative.' }],
          solution: [`|${x}| ${op} |${y}| = ${Math.abs(ans)}`, `Sign: ${ans >= 0 ? 'positive' : 'negative'} → ${ans}`],
        };
      }),
      tp('story', (r) => {
        const rate = r.int(2, 9), t = r.int(3, 12);
        const kind = r.pick(['diver', 'temp'] as const);
        return kind === 'diver' ? {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A diver near the Andamans goes down ${rate} m every minute from the surface (0 m). Where is she after ${t} minutes? (Use − for below the surface.)`, answer: num(-rate * t, 'm'),
          hints: ['Going down is negative.', `${t} × (−${rate})`], solution: [`${t} × (−${rate}) = ${-rate * t} m`],
        } : {
          type: 'typed', keypad: 'units', unitHint: '°C', prompt: `In a cold store the temperature falls ${rate} °C every hour from 0 °C. What is it after ${t} hours?`, answer: num(-rate * t, '°C'),
          hints: ['A fall is negative.'], solution: [`${t} × (−${rate}) = ${-rate * t} °C`],
        };
      }),
    ],
  }],
};

const common: USpec = {
  id: 'c7.u.hcf-lcm', subject: 'math', title: 'Finding Common Ground', source: src('gp7b', 3, 'Finding Common Ground'),
  objectives: [{
    id: 'c7.num.hcf-lcm', title: 'HCF and LCM in everyday problems', prereqs: ['c7.num.parity'],
    activities: ['game:logic'],
    intro: [
      p('The HCF (highest common factor) is the biggest number that divides both numbers — use it to cut or share into the largest equal pieces.'),
      p('The LCM (lowest common multiple) is the smallest number both divide into — use it when things repeat and you want them to line up again.'),
      tip('Bells ringing every 6 and 8 minutes ring together every LCM(6, 8) = 24 minutes.'),
    ],
    examples: [
      ex('Ribbons of 36 cm and 48 cm are cut into equal longest pieces. Piece length?', ['HCF(36, 48) = 12'], '12 cm'),
      ex('Buses leave every 15 and 20 minutes from 7:00. Next together?', ['LCM(15, 20) = 60 min'], '8:00'),
    ],
    practice: [
      tp('hcf', (r) => {
        const h = r.pick([2, 3, 4, 5, 6, 8, 9, 12]);
        const m = r.int(2, 9); let n = r.int(2, 9); while (gcd(m, n) !== 1 || m === n) n = r.int(2, 9);
        const a = h * m, b = h * n;
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `Two ribbons are ${a} cm and ${b} cm long. They are cut into pieces all of the same length, as long as possible, with nothing left over. How long is each piece?`, answer: num(h, 'cm'),
          hints: ['You need the biggest number that divides both lengths.', 'That is the HCF.'],
          mistakes: [{ when: String(lcm(a, b)), explain: 'That is the LCM — too long to be a piece of either ribbon! Use the HCF.' }],
          solution: [`HCF(${a}, ${b}) = ${h}`, `Each piece = ${h} cm`],
        };
      }),
      tp('lcm', (r) => {
        const a = r.pick([4, 5, 6, 8, 9, 10, 12, 15]), b = r.pick([6, 8, 10, 12, 14, 15, 18, 20]);
        const B = a === b ? b + 2 : b;
        const L = lcm(a, B);
        return {
          type: 'typed', keypad: 'units', unitHint: 'min', prompt: `In ${r.pick(CITIES)}, two traffic lights turn green every ${a} and ${B} minutes. They just turned green together. After how many minutes will they next turn green together?`, answer: num(L, 'min'),
          hints: ['You need the smallest number both divide into.', 'That is the LCM.'],
          mistakes: [{ when: String(gcd(a, B)), explain: 'That is the HCF. The lights line up again at a common MULTIPLE.' }],
          solution: [`LCM(${a}, ${B}) = ${L}`, `After ${L} minutes`],
        };
      }, 2),
    ],
  }],
};

const decOps: USpec = {
  id: 'c7.u.dec-ops', subject: 'math', title: 'Another Peek Beyond the Point', source: src('gp7b', 4, 'Another Peek Beyond the Point'),
  objectives: [{
    id: 'c7.dec.ops', title: 'Multiplying and dividing decimals', prereqs: ['c7.dec.place'],
    intro: [
      p('Multiplying by 10, 100, 1000 moves the decimal point 1, 2, 3 places right; dividing moves it left.'),
      p('To multiply decimals, multiply as whole numbers, then place the point so the answer has as many decimal places as both factors together.'),
      f('1.2 × 0.3 = 0.36 (1 + 1 = 2 decimal places)'),
    ],
    examples: [
      ex('2.5 × 1.4 = ?', ['25 × 14 = 350', '2 decimal places → 3.50'], '3.5'),
      ex('Petrol costs ₹104.50 per litre. Cost of 10 litres?', ['104.50 × 10 → move point 1 right'], '₹1,045'),
    ],
    practice: [
      tp('mul', (r) => {
        const a = r.int(11, 99) / 10, b = r.int(2, 9) / 10 + r.int(0, 3);
        const v = rd(a * b, 3);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Multiply: ${a} × ${rd(b, 1)}`, answer: num(v, undefined, false, 1e-6),
          hints: ['Multiply without the points.', 'Count the decimal places in both numbers.'],
          mistakes: [{ when: String(rd(v * 10, 3)), explain: 'Count the decimal places again — the answer should have 2.' }],
          solution: [`${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)}`, `2 decimal places → ${v}`],
        };
      }),
      tp('scale', (r) => {
        const a = rd(r.int(105, 9999) / 100, 2), k = r.pick([10, 100, 1000]), op = r.pick(['×', '÷'] as const);
        const v = op === '×' ? rd(a * k, 4) : rd(a / k, 6);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${a} ${op} ${k} = ?`, answer: num(v, undefined, false, 1e-7),
          hints: [`${k} has ${String(k).length - 1} zeros.`, op === '×' ? 'Move the point right.' : 'Move the point left.'],
          solution: [`Move the point ${String(k).length - 1} place(s) ${op === '×' ? 'right' : 'left'}: ${v}`],
        };
      }),
      tp('price', (r) => {
        const pr = rd(r.int(1050, 4999) / 100, 2), q = r.pick([2, 3, 4, 5, 1.5, 2.5]);
        const item = r.pick(['tomatoes', 'onions', 'rice', 'dal', 'sugar']);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `${item[0].toUpperCase() + item.slice(1)} cost ₹${pr.toFixed(2)} per kg. What do ${q} kg cost?`, answer: approx(rd(pr * q, 2), 0.001, '₹'),
          hints: ['Cost = rate × quantity.'], solution: [`${pr} × ${q} = ₹${rd(pr * q, 2)}`],
        };
      }),
    ],
  }],
};

const dots: USpec = {
  id: 'c7.u.data', subject: 'math', title: 'Connecting the Dots', source: src('gp7b', 5, 'Connecting the Dots'),
  objectives: [{
    id: 'c7.data.average', title: 'Mean, median and mode', prereqs: [],
    intro: [
      p('A single number can summarise data. Mean = sum ÷ count. Median = middle value when sorted. Mode = most frequent value.'),
      p('Line graphs connect data points over time, showing trends — rising or falling.'),
      vis({ kind: 'line-graph', xLabel: 'Day', yLabel: 'Max temp (°C)', points: [[1, 31], [2, 33], [3, 34], [4, 32], [5, 35]] }, 'Line graph of daily temperatures'),
    ],
    examples: [
      ex('Runs: 30, 45, 12, 45, 18. Mean, median, mode?', ['Sum = 150; mean = 150 ÷ 5 = 30', 'Sorted: 12, 18, 30, 45, 45 → median 30', 'Mode = 45'], 'Mean 30, median 30, mode 45'),
      ex('Median of 4, 9, 2, 7?', ['Sorted: 2, 4, 7, 9', 'Middle two: 4 and 7', '(4 + 7) ÷ 2 = 5.5'], '5.5'),
    ],
    practice: [
      tp('mean', (r) => {
        const n = r.int(4, 6);
        const m = r.int(20, 60);
        const xs = Array.from({ length: n - 1 }, () => m + r.int(-15, 15));
        xs.push(m * n - xs.reduce((a, b) => a + b, 0));
        const nm = r.pick(NAMES).en;
        return {
          type: 'typed', keypad: 'numeric', prompt: `${nm}'s cricket scores in ${n} matches: ${xs.join(', ')}. Find the mean score.`, answer: num(m),
          hints: ['Add all the scores.', `Divide by ${n}.`],
          solution: [`Sum = ${m * n}`, `Mean = ${m * n} ÷ ${n} = ${m}`],
        };
      }),
      tp('median', (r) => {
        const xs = Array.from({ length: r.pick([5, 7]) }, () => r.int(10, 60));
        const s = [...xs].sort((a, b) => a - b);
        const med = s[(s.length - 1) / 2];
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the median: ${xs.join(', ')}`, answer: num(med),
          hints: ['Sort the numbers first.', 'The median is the middle one.'],
          mistakes: [{ when: String(xs[(xs.length - 1) / 2]), explain: 'That is the middle of the unsorted list. Sort first!' }],
          solution: [`Sorted: ${s.join(', ')}`, `Median = ${med}`],
        };
      }),
      tp('graph', (r) => {
        const pts: [number, number][] = [1, 2, 3, 4, 5, 6].map((d) => [d, r.int(26, 40)]);
        const ask = r.pick(['max', 'rise'] as const);
        const i = r.int(1, 5);
        const maxDay = pts.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
        const ans = ask === 'max' ? maxDay : pts[i][1] - pts[i - 1][1];
        return {
          type: 'graph', keypad: 'numeric', prompt: ask === 'max' ? 'The line graph shows the maximum temperature in Nagpur over 6 days. On which day was it hottest? (If tied, the earliest day.)' : `The line graph shows the maximum temperature over 6 days. By how much did it change from day ${i} to day ${i + 1}? (Use − for a fall.)`,
          visual: { kind: 'line-graph', xLabel: 'Day', yLabel: 'Temperature (°C)', points: pts }, answer: num(ans),
          hints: ['Read the height of each point.', ask === 'max' ? 'Find the highest point.' : 'Later value − earlier value.'],
          solution: [pts.map(([d, t]) => `Day ${d}: ${t}`).join(', '), `Answer: ${ans}`],
        };
      }),
    ],
  }],
};

const tilings: USpec = {
  id: 'c7.u.tilings', subject: 'math', title: 'Constructions and Tilings', source: src('gp7b', 6, 'Constructions and Tilings'),
  objectives: [{
    id: 'c7.geo.tiling', title: 'Tiling with regular polygons', prereqs: ['c7.geo.triangle'],
    activities: ['game:shapes', 'art:color'],
    intro: [
      p('A tiling covers a floor with shapes, no gaps and no overlaps. At every corner, the angles meeting must add up to 360°.'),
      p('Interior angle of a regular polygon with n sides = 180° × (n − 2) ÷ n. Equilateral triangle 60°, square 90°, regular hexagon 120°.'),
      tip('Only triangles, squares and hexagons tile on their own: 6 × 60°, 4 × 90°, 3 × 120° all make 360°.'),
    ],
    examples: [
      ex('Can regular pentagons tile a floor?', ['Each angle = 108°', '360 ÷ 108 is not a whole number'], 'No'),
      ex('Interior angle of a regular octagon?', ['180° × 6 ÷ 8'], '135°'),
    ],
    practice: [
      tp('interior', (r) => {
        const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12]);
        const ang = (180 * (n - 2)) / n;
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: `Find each interior angle of a regular polygon with ${n} sides.`, answer: num(ang, '°'),
          hints: ['Sum of interior angles = 180° × (n − 2).', 'Divide by n.'],
          solution: [`Sum = 180° × ${n - 2} = ${180 * (n - 2)}°`, `Each = ${180 * (n - 2)}° ÷ ${n} = ${ang}°`],
        };
      }),
      tp('tiles', (r) => {
        const n = r.pick([3, 4, 5, 6, 8, 10]);
        const ang = (180 * (n - 2)) / n;
        const ok = 360 % ang === 0;
        const nm: Record<number, string> = { 3: 'equilateral triangles', 4: 'squares', 5: 'regular pentagons', 6: 'regular hexagons', 8: 'regular octagons', 10: 'regular decagons' };
        return { type: 'mcq', prompt: `Can ${nm[n]} alone tile a floor without gaps?`, ...choose(r, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes']), hints: [`Each angle is ${ang}°.`, 'Does a whole number of them make 360°?'], solution: [`360 ÷ ${ang} = ${rd(360 / ang, 2)}`, ok ? 'Whole number → yes' : 'Not whole → no'] };
      }),
    ],
  }],
};

const unknown: USpec = {
  id: 'c7.u.equations', subject: 'math', title: 'Finding the Unknown', source: src('gp7b', 7, 'Finding the Unknown'),
  objectives: [{
    id: 'c7.alg.equations', title: 'Solving simple equations', prereqs: ['c7.alg.expr'],
    activities: ['game:balance'],
    intro: [
      p('An equation is a balance: both sides are equal. To find the unknown, do the same operation to both sides until the letter is alone.'),
      stepsB('Undo + or − first (add or subtract on both sides).', 'Then undo × or ÷.', 'Check by putting the answer back in.'),
      f('3x + 5 = 20 → 3x = 15 → x = 5'),
    ],
    examples: [
      ex('Solve 4x − 7 = 21.', ['Add 7: 4x = 28', 'Divide by 4: x = 7', 'Check: 28 − 7 = 21 ✓'], 'x = 7'),
      ex('Priya is 3 times as old as her brother. Together they are 32. Brother\'s age?', ['b + 3b = 32', '4b = 32', 'b = 8'], '8 years'),
    ],
    practice: [
      tp('solve', (r) => {
        const x = r.int(-6, 15), a = r.int(2, 9), b = r.int(-20, 20);
        return {
          type: 'typed', keypad: 'algebra', prompt: `Solve for x: ${a}x ${sgn(b)} = ${a * x + b}`, answer: expr(`x=${x}`, String(x)),
          steps: [{ prompt: `${a}x = ?`, answer: num(a * x) }, { prompt: 'x = ?', answer: num(x) }],
          hints: [b >= 0 ? `Subtract ${b} from both sides.` : `Add ${-b} to both sides.`, `Then divide both sides by ${a}.`],
          mistakes: [{ when: `x=${rd((a * x + b + b) / a, 2)}`, explain: `To undo "${sgn(b)}", do the opposite operation on both sides.` }],
          solution: [`${a}x = ${a * x + b} ${sgn(-b)} = ${a * x}`, `x = ${a * x} ÷ ${a} = ${x}`],
        };
      }, 2),
      tp('word', (r) => {
        const b = r.int(5, 15), k = r.int(2, 4);
        const nm = r.pick(NAMES).en;
        return {
          type: 'typed', keypad: 'numeric', prompt: `${nm}'s mother is ${k} times as old as ${nm}. Their ages add up to ${b * (k + 1)}. How old is ${nm}?`, answer: num(b),
          hints: [`Let ${nm}'s age be a. Mother is ${k}a.`, `a + ${k}a = ${b * (k + 1)}`],
          solution: [`${k + 1}a = ${b * (k + 1)}`, `a = ${b}`],
        };
      }),
      tp('think', (r) => {
        const x = r.int(2, 20), a = r.int(2, 6), c = r.int(1, 15);
        return {
          type: 'typed', keypad: 'numeric', prompt: `I think of a number, multiply it by ${a} and add ${c}. I get ${a * x + c}. What is my number?`, answer: num(x),
          hints: ['Work backwards.', `Subtract ${c}, then divide by ${a}.`],
          mistakes: [{ when: String((a * x + c) / a), explain: `Undo the last step first: subtract ${c} before dividing.` }],
          solution: [`${a * x + c} − ${c} = ${a * x}`, `${a * x} ÷ ${a} = ${x}`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICS
const circuits: USpec = {
  id: 'c7.u.circuits', subject: 'physics', title: 'Electricity: Circuits and their Components', source: src('cu7', 3, 'Electricity: Circuits and their Components'),
  objectives: [{
    id: 'c7.phy.circuits', title: 'Closed circuits, conductors and insulators', prereqs: [],
    activities: ['lab:circuit', 'game:circuits'],
    intro: [
      p('A bulb glows only when there is a closed (complete) path from one terminal of the cell, through the bulb, back to the other terminal.'),
      p('Circuit symbols: cell (long line +, short line −), battery (several cells), bulb, switch (open/closed), wire. A switch opens or closes the path.'),
      p('Conductors (copper, aluminium, iron, graphite) let current flow; insulators (plastic, rubber, wood, glass) do not.'),
      act('lab:circuit?cells=1&bulbs=1&closed=0', 'Open circuit: the bulb is off. Close the switch!'),
      act('lab:circuit?cells=2&bulbs=1&closed=1', 'Two cells, one bulb — brighter?'),
      tip('Never experiment with the mains supply at home — it is dangerous.'),
    ],
    examples: [
      ex('A torch has a good bulb and cells, but the switch is OFF. Does it glow?', ['OFF switch = open circuit', 'No complete path'], 'No'),
      ex('A safety pin is placed in the gap of a circuit. Does the bulb glow?', ['Steel is a conductor', 'The circuit closes'], 'Yes'),
    ],
    practice: [
      tp('conductor', (r) => {
        const all = [
          { label: 'Copper wire', ok: true }, { label: 'Iron key', ok: true }, { label: 'Aluminium foil', ok: true }, { label: 'Pencil lead (graphite)', ok: true }, { label: 'Steel spoon', ok: true },
          { label: 'Rubber band', ok: false }, { label: 'Plastic comb', ok: false }, { label: 'Dry wooden stick', ok: false }, { label: 'Glass marble', ok: false }, { label: 'Paper strip', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[5];
        return { type: 'tap', prompt: 'Tap every object that will make the bulb glow when placed in the gap of a circuit (conductors).', ...tapAll(r, pick), hints: ['Metals and graphite conduct.', 'Plastic, rubber, wood and glass are insulators.'], solution: [`Conductors: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
      tp('glow', (r) => {
        const cases: [string, boolean][] = [
          ['The switch is closed and all wires are connected.', true], ['The switch is open.', false], ['One wire is loose at the bulb.', false],
          ['Both wires are connected to the same terminal of the cell.', false], ['The bulb filament is broken (fused).', false], ['A steel paper clip closes the gap.', true], ['A rubber eraser fills the gap.', false],
        ];
        const [c, ok] = r.pick(cases);
        const cells = r.int(1, 2);
        return { type: 'mcq', prompt: `A circuit has ${cells} cell${cells > 1 ? 's' : ''}, a bulb and a switch. ${c} Will the bulb glow?`, ...choose(r, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes']), hints: ['Is there a complete path from + to − through the bulb?'], solution: [ok ? 'The path is complete → it glows.' : 'The path is broken → no current, no glow.'] };
      }),
      tp('symbols', (r) => {
        const pairs: [string, string][] = r.shuffle([['Long and short parallel lines', 'Cell'], ['Circle with a cross inside', 'Bulb'], ['Line with a gap and a raised lever', 'Open switch'], ['Straight line', 'Connecting wire'], ['Several cells joined in a row', 'Battery']] as [string, string][]).slice(0, 4);
        return { type: 'match', prompt: `Match each circuit symbol to its component (${pairs.map((x) => x[1]).join(', ')}).`, ...matching(r, pairs), hints: ['The cell symbol: long line is +, short line is −.'], solution: pairs.map(([a, b]) => `${a} → ${b}`) };
      }),
    ],
  }],
};

const heat: USpec = {
  id: 'c7.u.heat', subject: 'physics', title: 'Heat Transfer in Nature', source: src('cu7', 7, 'Heat Transfer in Nature'),
  objectives: [{
    id: 'c7.phy.heat', title: 'Conduction, convection and radiation', prereqs: [],
    intro: [
      p('Heat flows from a hotter object to a colder one.'),
      stepsB('Conduction: through solids, particle to particle (a steel spoon in hot chai gets hot).', 'Convection: in liquids and gases, the warm part rises and cool part sinks (sea breeze, boiling water).', 'Radiation: needs no medium (heat from the Sun, from a fire).'),
      tip('Sea breeze by day: land heats faster, warm air over land rises, cooler air from the sea moves in. At night it reverses — land breeze.'),
    ],
    examples: [
      ex('Why do cooking pans have plastic or wooden handles?', ['Plastic and wood are poor conductors (insulators)', 'Heat does not reach your hand'], 'They are insulators'),
      ex('How does the Sun\'s heat reach Earth through empty space?', ['There is no medium in space'], 'Radiation'),
    ],
    practice: [
      tp('mode', (r) => {
        const cases: [string, string][] = [
          ['A steel spoon in hot sambar gets hot at the handle.', 'Conduction'], ['Sea breeze blows from sea to land in the afternoon.', 'Convection'], ['You feel warm sitting in the sun.', 'Radiation'],
          ['Water in a pot heats up all through as warm water rises.', 'Convection'], ['An iron tawa gets hot on the stove.', 'Conduction'], ['You feel heat standing near a bonfire.', 'Radiation'], ['Smoke rises from an agarbatti.', 'Convection'],
        ];
        const [c, a] = r.pick(cases);
        return { type: 'mcq', prompt: `${c} How is heat mainly transferred?`, ...choose(r, a, ['Conduction', 'Convection', 'Radiation'].filter((x) => x !== a)), hints: ['Solid touching → conduction; moving fluid → convection; no medium needed → radiation.'], solution: [a] };
      }),
      tp('insulator', (r) => {
        const all = [
          { label: 'Wood', ok: true }, { label: 'Plastic', ok: true }, { label: 'Air', ok: true }, { label: 'Wool', ok: true }, { label: 'Cork', ok: true },
          { label: 'Copper', ok: false }, { label: 'Aluminium', ok: false }, { label: 'Steel', ok: false }, { label: 'Iron', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[5];
        return { type: 'tap', prompt: 'Tap every poor conductor of heat (insulator).', ...tapAll(r, pick), hints: ['Metals are good conductors.'], solution: [`Insulators: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
      tp('breeze', (r) => {
        const when = r.pick(['day', 'night'] as const);
        const ctx = r.pick(['Chennai', 'Kochi', 'Puri', 'Visakhapatnam', 'Goa']);
        const ans = when === 'day' ? 'From sea to land (sea breeze)' : 'From land to sea (land breeze)';
        return { type: 'mcq', prompt: `On a beach in ${ctx}, which way does the breeze usually blow during the ${when}?`, ...choose(r, ans, ['From sea to land (sea breeze)', 'From land to sea (land breeze)', 'There is never any breeze'].filter((x) => x !== ans)), hints: ['Land heats and cools faster than water.', 'Warm air rises; cooler air moves in to replace it.'], solution: [when === 'day' ? 'By day land is warmer; air over land rises; cool sea air moves in.' : 'At night land is cooler; air over the sea rises; air moves from land to sea.'] };
      }),
    ],
  }],
};

const speed: USpec = {
  id: 'c7.u.motion', subject: 'physics', title: 'Measurement of Time and Motion', source: src('cu7', 8, 'Measurement of Time and Motion'),
  objectives: [
    {
      id: 'c7.phy.speed', title: 'Speed = distance ÷ time (with units)', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        p('Speed tells how fast something moves: the distance covered in unit time. SI unit: metres per second (m/s); on roads we use km/h.'),
        f('speed = distance ÷ time', 'speed equals distance divided by time'),
        f('1 km/h = 1000 m ÷ 3600 s = 5/18 m/s;  so 36 km/h = 10 m/s'),
        p('Uniform motion: equal distances in equal times. Non-uniform: the speed changes. For non-uniform motion, distance ÷ time gives the average speed.'),
        act('lab:motion?u=2&a=0&t=10', 'Motion Lab: a cart at 2 m/s for 10 s — does it travel 20 m?'),
      ],
      examples: [
        ex('A bus covers 180 km in 3 h. Average speed?', ['speed = 180 km ÷ 3 h', '= 60 km/h'], '60 km/h'),
        ex('Convert 72 km/h into m/s.', ['72 × 5/18', '= 20'], '20 m/s'),
      ],
      practice: [
        tp('speed', (r) => {
          const kind = r.pick(['road', 'cycle', 'walk'] as const);
          const [d, t, unit, dUnit, tUnit] = kind === 'road'
            ? (() => { const s = r.pick([40, 45, 50, 60, 72, 80]); const h = r.int(2, 6); return [s * h, h, 'km/h', 'km', 'h'] as const; })()
            : kind === 'cycle' ? (() => { const s = r.int(3, 8); const tt = r.pick([20, 50, 100, 120]); return [s * tt, tt, 'm/s', 'm', 's'] as const; })()
            : (() => { const s = r.pick([1, 1.5, 2]); const tt = r.pick([30, 40, 60, 90]); return [s * tt, tt, 'm/s', 'm', 's'] as const; })();
          const v = d / t;
          const who = kind === 'road' ? `A train from ${r.pick(CITIES)}` : kind === 'cycle' ? `${r.pick(NAMES).en} on a bicycle` : `${r.pick(NAMES).en} walking to school`;
          return {
            type: 'typed', keypad: 'units', unitHint: unit, prompt: `${who} covers ${d} ${dUnit} in ${t} ${tUnit}. What is the average speed? Include the unit.`,
            answer: num(v, unit, true),
            hints: ['speed = distance ÷ time', `The unit is ${dUnit} per ${tUnit} = ${unit}.`],
            mistakes: [{ when: 'missing-unit', explain: `A speed needs a unit — here ${unit}.` }, { when: 'wrong-unit', explain: 'Speed units are distance/time, like m/s or km/h.' }, { when: String(d * t), explain: 'Divide distance by time — do not multiply.' }],
            solution: [`speed = ${d} ${dUnit} ÷ ${t} ${tUnit}`, `= ${v} ${unit}`],
          };
        }),
        tp('convert', (r) => {
          const ms = r.pick([5, 10, 15, 20, 25, 30]);
          const to = r.pick(['ms', 'kmh'] as const);
          return to === 'ms' ? {
            type: 'typed', keypad: 'units', unitHint: 'm/s', prompt: `A car moves at ${ms * 3.6} km/h. What is its speed in m/s?`, answer: num(ms, 'm/s', true),
            hints: ['Multiply km/h by 5/18 to get m/s.', `${ms * 3.6} × 5 ÷ 18`],
            mistakes: [{ when: 'missing-unit', explain: 'Write the unit m/s.' }, { when: String(rd(ms * 3.6 * 3.6, 2)), explain: 'Going from km/h to m/s makes the number SMALLER — multiply by 5/18, not 18/5.' }],
            solution: [`${ms * 3.6} × 5/18 = ${ms} m/s`],
          } : {
            type: 'typed', keypad: 'units', unitHint: 'km/h', prompt: `A cheetah runs at ${ms} m/s. What is that in km/h?`, answer: num(ms * 3.6, 'km/h', true),
            hints: ['Multiply m/s by 18/5 to get km/h.'],
            mistakes: [{ when: 'missing-unit', explain: 'Write the unit km/h.' }],
            solution: [`${ms} × 18/5 = ${rd(ms * 3.6, 2)} km/h`],
          };
        }, 2),
        tp('distance', (r) => {
          const s = r.int(2, 9), t = r.pick([5, 10, 12, 15, 20]);
          return {
            type: 'typed', keypad: 'units', unitHint: 'm', prompt: `In the Motion Lab a cart moves steadily at ${s} m/s for ${t} s. How far does it go?`, answer: num(s * t, 'm', true),
            hints: ['distance = speed × time'],
            mistakes: [{ when: 'missing-unit', explain: 'Give the unit: m.' }, { when: String(rd(s / t, 3)), explain: 'Rearrange: distance = speed × time.' }],
            solution: [`${s} m/s × ${t} s = ${s * t} m`],
          };
        }),
      ],
    },
    {
      id: 'c7.phy.dt-graph', title: 'Distance–time graphs and time measurement', prereqs: ['c7.phy.speed'],
      activities: ['lab:motion'],
      intro: [
        p('A distance–time graph plots how far something has gone at each moment. A straight sloping line means uniform motion; a steeper line means a higher speed; a flat line means the object is at rest.'),
        p('Time is measured using periodic motion: a simple pendulum takes the same time for each oscillation — its time period.'),
        f('time period = total time ÷ number of oscillations'),
        act('lab:motion?u=3&a=0&t=8', 'Motion Lab: watch the distance–time graph for 3 m/s'),
      ],
      examples: [
        ex('A graph goes from (0 s, 0 m) to (10 s, 50 m) in a straight line. Speed?', ['Slope = 50 m ÷ 10 s'], '5 m/s'),
        ex('A pendulum makes 20 oscillations in 40 s. Time period?', ['40 ÷ 20'], '2 s'),
      ],
      practice: [
        tp('slope', (r) => {
          const s = r.int(2, 9), n = r.int(4, 6);
          const pts: [number, number][] = Array.from({ length: n + 1 }, (_, i) => [i * 2, i * 2 * s]);
          return {
            type: 'graph', keypad: 'units', unitHint: 'm/s', prompt: 'The distance–time graph shows a toy car moving in a straight line. What is its speed?', visual: { kind: 'line-graph', xLabel: 'Time (s)', yLabel: 'Distance (m)', points: pts },
            answer: num(s, 'm/s', true),
            hints: ['Pick two points on the line.', 'speed = change in distance ÷ change in time'],
            mistakes: [{ when: 'missing-unit', explain: 'Give the unit m/s.' }],
            solution: [`From (0, 0) to (${pts[n][0]}, ${pts[n][1]})`, `speed = ${pts[n][1]} ÷ ${pts[n][0]} = ${s} m/s`],
          };
        }),
        tp('pendulum', (r) => {
          const T = r.pick([1, 1.5, 2, 2.5, 3]), n = r.pick([10, 20, 30]);
          return {
            type: 'typed', keypad: 'units', unitHint: 's', prompt: `A pendulum completes ${n} oscillations in ${T * n} seconds. What is its time period?`, answer: num(T, 's', true),
            hints: ['Time period = total time ÷ number of oscillations.'],
            mistakes: [{ when: 'missing-unit', explain: 'Add the unit: s.' }],
            solution: [`${T * n} s ÷ ${n} = ${T} s`],
          };
        }),
        tp('shape', (r) => {
          const kinds: [string, string, [number, number][]][] = [
            ['At rest', 'Flat (horizontal) line', [[0, 20], [2, 20], [4, 20], [6, 20]]],
            ['Uniform motion', 'Straight sloping line', [[0, 0], [2, 10], [4, 20], [6, 30]]],
            ['Speeding up', 'Curve getting steeper', [[0, 0], [2, 4], [4, 16], [6, 36]]],
          ];
          const k = r.pick(kinds);
          const scale = r.int(1, 3);
          const pts = k[2].map(([x, y]) => [x, y * scale] as [number, number]);
          return { type: 'graph', prompt: 'What does this distance–time graph show?', visual: { kind: 'line-graph', xLabel: 'Time (s)', yLabel: 'Distance (m)', points: pts }, ...choose(r, k[0], kinds.map((x) => x[0]).filter((x) => x !== k[0])), hints: ['Flat → not moving; straight slope → steady speed; steeper and steeper → speeding up.'], solution: [`${k[1]} → ${k[0].toLowerCase()}`] };
        }),
      ],
    },
  ],
};

const lightC7: USpec = {
  id: 'c7.u.light', subject: 'physics', title: 'Light: Shadows and Reflections', source: src('cu7', 11, 'Light: Shadows and Reflections'),
  objectives: [{
    id: 'c7.phy.reflection', title: 'Shadows and the laws of reflection', prereqs: [],
    activities: ['lab:light'],
    intro: [
      p('Light travels in straight lines. An opaque object blocks light and forms a shadow; transparent objects let light through; translucent objects let some through.'),
      p('Laws of reflection: the angle of incidence equals the angle of reflection, and the incident ray, reflected ray and the normal lie in the same plane.'),
      f('angle of incidence (i) = angle of reflection (r)'),
      p('A plane mirror forms an image that is upright, the same size, as far behind the mirror as the object is in front, and laterally inverted (left ↔ right).'),
      act('lab:light?angle=30', 'Light Lab: shine a ray at 30° and measure the reflected angle'),
      act('lab:light?angle=60', 'Try 60° — does r still equal i?'),
    ],
    examples: [
      ex('A ray hits a plane mirror at 35° to the normal. Angle of reflection?', ['i = r'], '35°'),
      ex('A ray makes 50° with the mirror surface. Angle of incidence?', ['The normal is at 90° to the mirror', 'i = 90° − 50°'], '40°'),
    ],
    practice: [
      tp('law', (r) => {
        const a = r.int(10, 80);
        const withSurface = r.next() < 0.4;
        const i = withSurface ? 90 - a : a;
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: withSurface ? `A ray of light makes an angle of ${a}° with the surface of a plane mirror. What is the angle of reflection?` : `A ray strikes a plane mirror with an angle of incidence of ${a}°. What is the angle of reflection?`,
          answer: num(i, '°'),
          hints: ['Angles are measured from the normal (perpendicular to the mirror).', 'Angle of incidence = angle of reflection.'],
          mistakes: [{ when: String(a), explain: 'The angle is given with the MIRROR surface. Measure from the normal: 90° − that angle.' }, { when: String(180 - i), explain: 'The reflected angle is equal to the incident angle, not its supplement.' }],
          solution: withSurface ? [`i = 90° − ${a}° = ${i}°`, `r = i = ${i}°`] : [`r = i = ${a}°`],
        };
      }),
      tp('material', (r) => {
        const cases: [string, string][] = [
          ['A sheet of clear glass', 'Transparent'], ['A wooden door', 'Opaque'], ['Butter paper (tracing paper)', 'Translucent'], ['Clear water in a glass', 'Transparent'],
          ['A steel plate', 'Opaque'], ['Frosted bathroom glass', 'Translucent'], ['A brick wall', 'Opaque'], ['Oiled paper', 'Translucent'],
        ];
        const [m, a] = r.pick(cases);
        return { type: 'mcq', prompt: `${m} is…`, ...choose(r, a, ['Transparent', 'Translucent', 'Opaque'].filter((x) => x !== a)), hints: ['Can you see clearly through it? Partly? Not at all?'], solution: [`${m}: ${a.toLowerCase()}`] };
      }),
      tp('mirror', (r) => {
        const d = r.int(1, 9) / 2 + r.int(0, 2);
        const ask = r.pick(['behind', 'gap'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: ask === 'behind' ? `${r.pick(NAMES).en} stands ${d} m in front of a plane mirror. How far behind the mirror is the image?` : `${r.pick(NAMES).en} stands ${d} m in front of a plane mirror. How far is the image from ${r.pick(['her', 'him'])}?`,
          answer: num(ask === 'behind' ? d : 2 * d, 'm'),
          hints: ['The image is as far behind the mirror as the object is in front.', ask === 'gap' ? 'Add both distances.' : ''].filter(Boolean),
          solution: [ask === 'behind' ? `Image is ${d} m behind the mirror.` : `${d} + ${d} = ${2 * d} m`],
        };
      }),
    ],
  }],
};

const earth: USpec = {
  id: 'c7.u.earth-moon', subject: 'physics', title: 'Earth, Moon, and the Sun', source: src('cu7', 12, 'Earth, Moon, and the Sun'),
  note: 'Enrichment within physical science: day/night, phases and eclipses as consequences of light travelling in straight lines.',
  objectives: [{
    id: 'c7.phy.earth-moon', title: 'Day and night, Moon phases and eclipses', prereqs: ['c7.phy.reflection'], enrichment: true,
    activities: ['lab:light'],
    intro: [
      p('Earth spins on its axis once a day (rotation) — causing day and night — and goes round the Sun once a year (revolution).'),
      p('The Moon shines by reflected sunlight. As it orbits Earth (about 29.5 days), we see different amounts of its lit half: the phases.'),
      p('Eclipses are shadows: a solar eclipse happens when the Moon\'s shadow falls on Earth; a lunar eclipse when Earth\'s shadow falls on the Moon.'),
    ],
    examples: [
      ex('Why is it daytime in India when it is night in the USA?', ['Earth rotates; only the half facing the Sun is lit', 'India and the USA are on opposite sides'], 'Earth\'s rotation'),
      ex('In which order are Sun, Earth and Moon during a lunar eclipse?', ['Earth\'s shadow must fall on the Moon', 'Earth is in the middle'], 'Sun – Earth – Moon'),
    ],
    practice: [
      tp('facts', (r) => {
        const qs: [string, string, string[]][] = [
          ['What causes day and night?', 'Earth rotating on its axis', ['Earth going round the Sun', 'The Moon blocking the Sun', 'Clouds']],
          ['How long does Earth take to go once around the Sun?', 'About 365 days', ['24 hours', 'About 29.5 days', 'About 7 days']],
          ['Why can we see the Moon?', 'It reflects sunlight', ['It makes its own light', 'It is very hot', 'Street lights shine on it']],
          ['In a solar eclipse, which body is in the middle?', 'The Moon', ['The Earth', 'The Sun', 'Mars']],
          ['In a lunar eclipse, which body is in the middle?', 'The Earth', ['The Moon', 'The Sun', 'Venus']],
          ['On which phase of the Moon can a solar eclipse happen?', 'New Moon (Amavasya)', ['Full Moon (Purnima)', 'Half Moon', 'Any phase']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Think of light travelling in straight lines and making shadows.'], solution: [a] };
      }),
      tp('phases', (r) => {
        const seq = ['New Moon', 'Waxing crescent', 'First quarter', 'Full Moon', 'Last quarter'];
        const n = r.int(4, 5);
        const items = seq.slice(0, n);
        return { type: 'order', prompt: `Put these Moon phases in the order they appear after a New Moon${n === 4 ? ' (first four)' : ''}.`, ...ordering(r, items), hints: ['After New Moon the lit part grows (waxes) until Full Moon.'], solution: [items.join(' → ')] };
      }),
    ],
  }],
};

export default buildClass(9, [large, arith, decimals, letters, parallel, numPlay7, triangles, workFrac, twins, integers7, common, decOps, dots, tilings, unknown, circuits, heat, speed, lightC7, earth, ...tsClass7]);
