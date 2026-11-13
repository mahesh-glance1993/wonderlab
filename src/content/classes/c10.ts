// Class 10 — CBSE Mathematics (NCERT Mathematics, rationalised) and physics chapters of NCERT Science.
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, stepsB, def, explore, keys, remember, L, num, approx, frac, choose, matching, ordering, tapAll, item,
  gcd, lcm, fr, rd, inr, sgn, NAMES, CITIES, isPrime, type USpec, type QSpec,
} from '../lib/kit';
import type { Rng } from '../../shared/grading';
import { tsClass10 } from '../ts/c10';

const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
const PI = 22 / 7;
/** x² + Bx + C with zero terms dropped */
const q2 = (B: number, C: number, a = 1) => `${a === 1 ? '' : a}x²${B ? ` ${B < 0 ? '−' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}x` : ''}${C ? ` ${sgn(C)}` : ''}`;
const pf = (n: number) => { const out: number[] = []; let x = n; for (let d = 2; x > 1; d++) while (x % d === 0) { out.push(d); x /= d; } return out.join(' × '); };

// ------------------------------------------------------------------ MATHS
const real: USpec = {
  id: 'c10.u.real', subject: 'math', title: 'Real Numbers', source: src('m10', 1, 'Real Numbers'),
  objectives: [{
    id: 'c10.real.hcf-lcm', title: 'HCF and LCM by prime factorisation', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('Every whole number greater than 1 can be written as a product of primes in exactly one way (the Fundamental Theorem of Arithmetic).'),
      p('HCF = product of the smallest power of each common prime. LCM = product of the greatest power of every prime that appears.'),
      f('HCF(a, b) × LCM(a, b) = a × b', 'H C F times L C M equals a times b'),
      tip('The product rule works for two numbers only — not for three.'),
    ],
    examples: [
      ex('Find HCF and LCM of 96 and 404.', ['96 = 2⁵ × 3', '404 = 2² × 101', 'HCF = 2² = 4', 'LCM = 2⁵ × 3 × 101 = 9696'], 'HCF 4, LCM 9696'),
      ex('HCF(306, 657) = 9. Find their LCM.', ['LCM = (306 × 657) ÷ 9', '= 201042 ÷ 9 = 22338'], 'LCM = 22338'),
    ],
    practice: [
      tp('hcf', (r) => {
        const h = r.pick([2, 3, 4, 6, 8, 9, 12, 14, 15]);
        const m = r.int(2, 9); let n = r.int(2, 11);
        while (gcd(m, n) !== 1 || m === n) n = r.int(2, 11);
        const a = h * m, b = h * n;
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the HCF of ${a} and ${b}.`, answer: num(h),
          hints: [`Write ${a} and ${b} as products of primes.`, 'Take each prime common to both, with the smaller power.'],
          mistakes: [{ when: String(lcm(a, b)), explain: 'That is the LCM (the smallest common multiple). The HCF is the largest common factor.' }],
          solution: [`${a} = ${pf(a)}`, `${b} = ${pf(b)}`, `Common part: ${pf(h)} = ${h}`, `HCF = ${h}`],
        };
      }),
      tp('lcm-product', (r) => {
        const h = r.pick([3, 4, 6, 7, 9, 12]);
        const m = r.int(2, 9); let n = r.int(3, 13);
        while (gcd(m, n) !== 1 || m === n) n = r.int(3, 13);
        const a = h * m, b = h * n;
        return {
          type: 'typed', keypad: 'numeric', prompt: `The HCF of ${a} and ${b} is ${h}. Use HCF × LCM = a × b to find their LCM.`, answer: num(lcm(a, b)),
          hints: ['LCM = (a × b) ÷ HCF', `${a} × ${b} = ${a * b}`],
          mistakes: [{ when: String(a * b), explain: 'You found a × b. Divide it by the HCF to get the LCM.' }],
          solution: [`LCM = (${a} × ${b}) ÷ ${h}`, `= ${a * b} ÷ ${h} = ${lcm(a, b)}`],
        };
      }, 2),
      tp('prime', (r) => {
        const cands = [91, 87, 119, 133, 97, 101, 143, 113, 127, 161, 169, 109, 221, 131];
        const n = r.pick(cands);
        const ok = isPrime(n);
        const c = choose(r, ok ? 'Prime' : 'Composite', [ok ? 'Composite' : 'Prime']);
        return {
          type: 'mcq', prompt: `Is ${n} prime or composite?`, ...c,
          hints: ['Test divisibility by primes up to √n.', `√${n} is about ${Math.floor(Math.sqrt(n))}.`],
          solution: ok ? [`${n} is not divisible by any prime up to ${Math.floor(Math.sqrt(n))}, so it is prime.`] : [`${n} = ${pf(n)}, so it is composite.`],
        };
      }),
    ],
  }],
};

const poly: USpec = {
  id: 'c10.u.poly', subject: 'math', title: 'Polynomials', source: src('m10', 2, 'Polynomials'),
  objectives: [{
    id: 'c10.poly.zeroes', title: 'Zeroes and coefficients of a quadratic', prereqs: [],
    intro: [
      p('A zero of p(x) is a value of x that makes p(x) = 0. A quadratic has at most two zeroes — where its graph meets the x-axis.'),
      f('For ax² + bx + c: α + β = −b/a, αβ = c/a', 'sum of zeroes is minus b over a, product is c over a'),
      vis({ kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[-1, 0], [0, -4], [1, -6], [2, -6], [3, -4], [4, 0]] }, 'Graph of y = x² − 3x − 4 crossing the x-axis at −1 and 4'),
    ],
    examples: [
      ex('Find the zeroes of x² − 2x − 8 and check the relations.', ['x² − 2x − 8 = (x − 4)(x + 2)', 'Zeroes: 4 and −2', 'Sum = 2 = −(−2)/1 ✓', 'Product = −8 = −8/1 ✓'], '4 and −2'),
      ex('Form a quadratic whose zeroes have sum −3 and product 2.', ['p(x) = x² − (sum)x + product', '= x² + 3x + 2'], 'x² + 3x + 2'),
    ],
    practice: [
      tp('sum-product', (r) => {
        const a = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), b = r.pick([-7, -5, -3, -2, 1, 2, 4, 7]);
        const B = -(a + b), C = a * b;
        const ask = r.pick(['sum', 'product'] as const);
        const ans = ask === 'sum' ? a + b : a * b;
        return {
          type: 'typed', keypad: 'numeric', prompt: `For p(x) = ${q2(B, C)}, find the ${ask} of its zeroes.`, answer: num(ans),
          hints: [ask === 'sum' ? 'Sum of zeroes = −b/a.' : 'Product of zeroes = c/a.', `Here a = 1, b = ${B}, c = ${C}.`],
          mistakes: [{ when: String(ask === 'sum' ? B : -C), explain: 'Watch the sign: the sum is −b/a, the product is +c/a.' }],
          solution: [`a = 1, b = ${B}, c = ${C}`, ask === 'sum' ? `Sum = −b/a = ${a + b}` : `Product = c/a = ${C}`, `(Zeroes are ${a} and ${b}.)`],
        };
      }),
      tp('form', (r) => {
        const a = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), b = r.pick([-3, -2, 1, 2, 3, 5, 7]);
        const s = a + b, pr = a * b;
        const right = q2(-s, pr);
        const c = choose(r, right, [q2(s, pr), q2(-s, -pr), q2(pr, -s), q2(-s + 1, pr), q2(-s, pr + 2)]);
        return {
          type: 'mcq', prompt: `Which quadratic has zeroes ${a} and ${b}?`, ...c,
          hints: ['Use x² − (sum)x + (product).', `Sum = ${s}, product = ${pr}.`],
          solution: [`Sum = ${s}, product = ${pr}`, `p(x) = x² − (${s})x + (${pr}) = ${right}`],
        };
      }, 2),
    ],
  }],
};

const pair: USpec = {
  id: 'c10.u.pair', subject: 'math', title: 'Pair of Linear Equations in Two Variables', source: src('m10', 3, 'Pair of Linear Equations in Two Variables'),
  objectives: [{
    id: 'c10.pair.solve', title: 'Solve a pair of linear equations', prereqs: [],
    activities: ['game:balance'],
    intro: [
      p('Two linear equations in x and y are two straight lines. Where they cross is the solution that satisfies both.'),
      stepsB('Substitution: make one variable the subject, put it in the other equation.', 'Elimination: multiply to make one coefficient equal, then add or subtract.'),
      tip('Always check your answer in BOTH equations.'),
    ],
    examples: [
      ex('Solve x + y = 14, x − y = 4.', ['Add: 2x = 18 → x = 9', 'Then y = 14 − 9 = 5', 'Check: 9 − 5 = 4 ✓'], 'x = 9, y = 5'),
      ex('2 pens and 3 pencils cost ₹48; 1 pen and 1 pencil cost ₹19. Price of a pen?', ['2p + 3q = 48, p + q = 19', 'From the second: p = 19 − q', '2(19 − q) + 3q = 48 → q = 10', 'p = 9'], 'A pen costs ₹9'),
    ],
    practice: [
      tp('elim', (r) => {
        const x = r.int(-5, 9), y = r.int(-5, 9);
        const a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 4), b2 = -r.int(1, 4);
        const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
        const t = (a: number, b: number) => `${a === 1 ? '' : a}x ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
        return {
          type: 'typed', keypad: 'numeric', prompt: `Solve: ${t(a1, b1)} = ${c1} and ${t(a2, b2)} = ${c2}. What is x?`, answer: num(x),
          steps: [{ prompt: 'First find x.', answer: num(x) }, { prompt: 'Now find y.', answer: num(y) }],
          hints: ['Make the y-coefficients equal in size, then add the equations.', `Multiply the first by ${-b2} and the second by ${b1}.`],
          solution: [`(${t(a1, b1)} = ${c1}) × ${-b2}`, `(${t(a2, b2)} = ${c2}) × ${b1}`, `Adding eliminates y: ${a1 * -b2 + a2 * b1}x = ${c1 * -b2 + c2 * b1}`, `x = ${x}, then y = ${y}`],
        };
      }, 2),
      tp('word', (r) => {
        const pen = r.int(5, 20), pencil = r.int(2, 9);
        const m = r.int(2, 4), n = r.int(1, 5);
        const nm = r.pick(NAMES).en;
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `${nm} pays ₹${m * pen + n * pencil} for ${m} pens and ${n} pencils. A pen and a pencil together cost ₹${pen + pencil}. Find the cost of one pen.`,
          answer: num(pen, '₹'),
          hints: ['Let a pen cost ₹p and a pencil ₹q.', `Write: ${m}p + ${n}q = ${m * pen + n * pencil} and p + q = ${pen + pencil}.`, 'Substitute q = (sum) − p.'],
          solution: [`q = ${pen + pencil} − p`, `${m}p + ${n}(${pen + pencil} − p) = ${m * pen + n * pencil}`, `${m - n}p = ${m * pen + n * pencil - n * (pen + pencil)}`, `p = ₹${pen}`],
        };
      }, 2),
      tp('consistency', (r) => {
        const a = r.int(1, 5), b = r.int(1, 5), k = r.int(2, 4);
        const kind = r.pick(['unique', 'none', 'many'] as const);
        const a2 = kind === 'unique' ? a * k + 1 : a * k, b2 = b * k, c1 = r.int(1, 9), c2 = kind === 'many' ? c1 * k : c1 * k + r.int(1, 3);
        const lab = { unique: 'Exactly one solution (lines intersect)', none: 'No solution (parallel lines)', many: 'Infinitely many solutions (same line)' };
        const c = choose(r, lab[kind], Object.values(lab).filter((v) => v !== lab[kind]));
        return {
          type: 'mcq', prompt: `${a}x + ${b}y = ${c1} and ${a2}x + ${b2}y = ${c2}. How many solutions?`, ...c,
          hints: ['Compare a₁/a₂, b₁/b₂ and c₁/c₂.', 'If a₁/a₂ ≠ b₁/b₂ the lines cross once.'],
          solution: [`a₁/a₂ = ${fr(a, a2)}, b₁/b₂ = ${fr(b, b2)}, c₁/c₂ = ${fr(c1, c2)}`, lab[kind]],
        };
      }, 2),
    ],
  }],
};

const quad: USpec = {
  id: 'c10.u.quad', subject: 'math', title: 'Quadratic Equations', source: src('m10', 4, 'Quadratic Equations'),
  objectives: [{
    id: 'c10.quad.roots', title: 'Solve quadratics and read the discriminant', prereqs: ['c10.poly.zeroes'],
    intro: [
      p('A quadratic equation has the form ax² + bx + c = 0 with a ≠ 0.'),
      f('x = (−b ± √(b² − 4ac)) / 2a', 'x equals minus b plus or minus root of b squared minus 4 a c, over 2 a'),
      p('The discriminant D = b² − 4ac tells you the nature of roots: D > 0 two distinct real roots, D = 0 two equal roots, D < 0 no real roots.'),
    ],
    examples: [
      ex('Solve x² − 5x + 6 = 0.', ['Find two numbers with product 6 and sum −5: −2 and −3', '(x − 2)(x − 3) = 0', 'x = 2 or x = 3'], 'x = 2, 3'),
      ex('Nature of roots of 2x² − 4x + 3 = 0?', ['D = (−4)² − 4·2·3 = 16 − 24 = −8', 'D < 0'], 'No real roots'),
    ],
    practice: [
      tp('factor', (r) => {
        const a = r.int(-6, 7), b = r.pick([-5, -3, -1, 2, 4, 6, 8]);
        const B = -(a + b), C = a * b;
        const big = Math.max(a, b);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Solve ${q2(B, C)} = 0. Enter the larger root.`, answer: num(big),
          hints: [`Find two numbers whose product is ${C} and whose sum is ${B}.`, 'Write (x − p)(x − q) = 0.'],
          mistakes: [{ when: String(-big), explain: 'Sign slip: if (x − p) = 0 then x = p, not −p.' }],
          solution: [`${q2(B, C)} = (x ${sgn(-a)})(x ${sgn(-b)})`, `Roots: ${a} and ${b}`, `Larger root = ${big}`],
        };
      }),
      tp('disc', (r) => {
        const a = r.int(1, 4), b = r.int(-8, 8), c = r.int(-5, 6);
        const D = b * b - 4 * a * c;
        const lab = D > 0 ? 'Two distinct real roots' : D === 0 ? 'Two equal real roots' : 'No real roots';
        const ch = choose(r, lab, ['Two distinct real roots', 'Two equal real roots', 'No real roots'].filter((x) => x !== lab));
        return {
          type: 'mcq', prompt: `What is the nature of the roots of ${q2(b, c, a)} = 0?`, ...ch,
          hints: ['Compute D = b² − 4ac.', `b² = ${b * b}, 4ac = ${4 * a * c}.`],
          solution: [`D = ${b * b} − ${4 * a * c} = ${D}`, lab],
        };
      }, 2),
    ],
  }],
};

const ap: USpec = {
  id: 'c10.u.ap', subject: 'math', title: 'Arithmetic Progressions', source: src('m10', 5, 'Arithmetic Progressions'),
  objectives: [{
    id: 'c10.ap.nth-sum', title: 'nth term and sum of an AP', prereqs: [],
    activities: ['game:patterns'],
    intro: [
      p('In an arithmetic progression each term is the previous one plus a fixed common difference d.'),
      f('aₙ = a + (n − 1)d', 'a n equals a plus n minus 1 times d'),
      f('Sₙ = n/2 [2a + (n − 1)d]', 'S n equals n by 2 times 2 a plus n minus 1 d'),
    ],
    examples: [
      ex('Find the 10th term of 2, 7, 12, …', ['a = 2, d = 5', 'a₁₀ = 2 + 9 × 5 = 47'], '47'),
      ex('Sum of the first 20 terms of 3, 7, 11, …', ['a = 3, d = 4, n = 20', 'S₂₀ = 10 × (6 + 19 × 4) = 10 × 82 = 820'], '820'),
    ],
    practice: [
      tp('nth', (r) => {
        const a = r.int(-10, 20), d = r.pick([-4, -3, -2, 2, 3, 4, 5, 6, 7]), n = r.int(8, 30);
        const t = a + (n - 1) * d;
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the ${n}th term of the AP ${a}, ${a + d}, ${a + 2 * d}, …`, answer: num(t),
          hints: [`a = ${a}, d = ${d}`, 'aₙ = a + (n − 1)d'],
          mistakes: [{ when: String(a + n * d), explain: 'Use (n − 1)d, not nd: the first term already counts as term 1.' }],
          solution: [`a = ${a}, d = ${d}, n = ${n}`, `aₙ = ${a} + ${n - 1} × ${d} = ${t}`],
        };
      }),
      tp('sum', (r) => {
        const a = r.int(1, 15), d = r.int(1, 6), n = r.pick([10, 12, 15, 16, 20, 24, 25]);
        const S = (n / 2) * (2 * a + (n - 1) * d);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the sum of the first ${n} terms of ${a}, ${a + d}, ${a + 2 * d}, …`, answer: num(S),
          hints: ['Sₙ = n/2 [2a + (n − 1)d]', `2a + (n − 1)d = ${2 * a + (n - 1) * d}`],
          solution: [`S = ${n}/2 × [${2 * a} + ${n - 1} × ${d}]`, `= ${n / 2} × ${2 * a + (n - 1) * d} = ${S}`],
        };
      }, 2),
      tp('savings', (r) => {
        const a = r.pick([50, 100, 150, 200]), d = r.pick([10, 20, 25, 50]), n = r.int(6, 12);
        const nm = r.pick(NAMES).en;
        const S = (n / 2) * (2 * a + (n - 1) * d);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `${nm} saves ₹${a} in the first month and ₹${d} more each month after that. How much is saved in ${n} months altogether?`, answer: num(S, '₹'),
          hints: ['This is an AP with a = first saving, d = monthly increase.', 'Use Sₙ = n/2 [2a + (n − 1)d].'],
          solution: [`a = ${a}, d = ${d}, n = ${n}`, `S = ${n}/2 × [${2 * a} + ${(n - 1) * d}] = ${inr(S)}`],
        };
      }, 2),
    ],
  }],
};

const tri: USpec = {
  id: 'c10.u.tri', subject: 'math', title: 'Triangles', source: src('m10', 6, 'Triangles'),
  objectives: [{
    id: 'c10.tri.similar', title: 'Similar triangles and the Basic Proportionality Theorem', prereqs: [],
    intro: [
      p('Two triangles are similar when their angles are equal and their sides are in the same ratio.'),
      p('Basic Proportionality Theorem (Thales): a line parallel to one side of a triangle divides the other two sides in the same ratio.'),
      f('If DE ∥ BC in △ABC, then AD/DB = AE/EC'),
      vis({ kind: 'triangle', a: 6, b: 8, angleLabels: ['A', 'B', 'C'] }, 'Triangle ABC with DE parallel to BC'),
    ],
    examples: [
      ex('In △ABC, DE ∥ BC, AD = 3, DB = 6, AE = 4. Find EC.', ['AD/DB = AE/EC', '3/6 = 4/EC', 'EC = 8'], 'EC = 8 cm'),
      ex('A 1.5 m girl casts a 2 m shadow; a pole casts 12 m. Height of pole?', ['Sun rays make similar triangles', 'h/12 = 1.5/2', 'h = 9 m'], '9 m'),
    ],
    practice: [
      tp('bpt', (r) => {
        const k = r.pick([2, 3, 4, 5]), ad = r.int(2, 8), db = r.int(2, 9), ae = ad * k;
        const ec = db * k;
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `In △ABC, DE ∥ BC with D on AB and E on AC. AD = ${ad} cm, DB = ${db} cm, AE = ${ae} cm. Find EC.`,
          answer: num(ec, 'cm'),
          hints: ['Use AD/DB = AE/EC.', `${ad}/${db} = ${ae}/EC`],
          mistakes: [{ when: String(rd((ad * db) / ae, 2)), explain: 'Cross-multiply carefully: EC = AE × DB ÷ AD.' }],
          solution: [`AD/DB = AE/EC`, `EC = AE × DB ÷ AD = ${ae} × ${db} ÷ ${ad} = ${ec} cm`],
        };
      }, 2),
      tp('shadow', (r) => {
        const h = r.pick([1.2, 1.5, 1.6, 1.8]), s = r.pick([1, 2, 3, 4]), S = r.pick([5, 6, 8, 10, 12, 15]);
        const H = rd((h * S) / s, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A ${h} m tall student casts a ${s} m shadow. At the same time a tower casts a ${S} m shadow. How tall is the tower?`,
          answer: approx(H, 0.01, 'm'),
          hints: ['The two triangles are similar (same Sun angle).', 'height/shadow is the same for both.'],
          solution: [`H/${S} = ${h}/${s}`, `H = ${h} × ${S} ÷ ${s} = ${H} m`],
        };
      }),
    ],
  }],
};

const coord: USpec = {
  id: 'c10.u.coord', subject: 'math', title: 'Coordinate Geometry', source: src('m10', 7, 'Coordinate Geometry'),
  objectives: [{
    id: 'c10.coord.distance', title: 'Distance and section formulae', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      f('Distance PQ = √((x₂ − x₁)² + (y₂ − y₁)²)'),
      f('Mid-point = ((x₁ + x₂)/2, (y₁ + y₂)/2)'),
      f('Point dividing in m : n = ((mx₂ + nx₁)/(m + n), (my₂ + ny₁)/(m + n))'),
    ],
    examples: [
      ex('Distance between (1, 2) and (4, 6)?', ['Δx = 3, Δy = 4', '√(9 + 16) = √25 = 5'], '5 units'),
      ex('Point dividing (−1, 7) and (4, −3) in ratio 2 : 3?', ['x = (2·4 + 3·(−1))/5 = 1', 'y = (2·(−3) + 3·7)/5 = 3'], '(1, 3)'),
    ],
    practice: [
      tp('dist', (r) => {
        const [a, b, c] = r.pick(TRIPLES);
        const x1 = r.int(-6, 6), y1 = r.int(-6, 6);
        const sx = r.pick([1, -1]), sy = r.pick([1, -1]);
        const flip = r.next() < 0.5;
        const x2 = x1 + sx * (flip ? b : a), y2 = y1 + sy * (flip ? a : b);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the distance between A(${x1}, ${y1}) and B(${x2}, ${y2}).`, answer: num(c),
          hints: ['Find the change in x and the change in y.', 'Square, add, then take the square root.'],
          mistakes: [{ when: String(a + b), explain: 'Distances do not add along x and y — use Pythagoras: √(Δx² + Δy²).' }],
          solution: [`Δx = ${x2 - x1}, Δy = ${y2 - y1}`, `AB = √(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = √${c * c} = ${c}`],
        };
      }),
      tp('section', (r) => {
        const m = r.int(1, 3), n = r.int(1, 3);
        const px = r.int(-4, 5), py = r.int(-4, 5);
        const dx = r.int(-3, 3) || 2, dy = r.int(-3, 3) || -1;
        const x1 = px - m * dx, y1 = py - m * dy, x2 = px + n * dx, y2 = py + n * dy;
        return {
          type: 'typed', keypad: 'numeric', prompt: `P divides the join of A(${x1}, ${y1}) and B(${x2}, ${y2}) in the ratio ${m} : ${n}. Find the x-coordinate of P.`, answer: num(px),
          steps: [{ prompt: 'x-coordinate of P', answer: num(px) }, { prompt: 'y-coordinate of P', answer: num(py) }],
          hints: ['x = (m·x₂ + n·x₁)/(m + n)', `m = ${m}, n = ${n}`],
          solution: [`x = (${m}·${x2} + ${n}·${x1})/${m + n} = ${px}`, `y = (${m}·${y2} + ${n}·${y1})/${m + n} = ${py}`, `P = (${px}, ${py})`],
        };
      }, 2),
    ],
  }],
};

const RATIOS = { sin: (a: number, _b: number, c: number) => fr(a, c), cos: (_a: number, b: number, c: number) => fr(b, c), tan: (a: number, b: number) => fr(a, b) };
const trig: USpec = {
  id: 'c10.u.trig', subject: 'math', title: 'Introduction to Trigonometry', source: src('m10', 8, 'Introduction to Trigonometry'),
  objectives: [{
    id: 'c10.trig.ratios', title: 'Trigonometric ratios and standard values', prereqs: ['c10.coord.distance'],
    intro: [
      p('In a right triangle, for an acute angle A: the side opposite A, the side adjacent to A, and the hypotenuse.'),
      f('sin A = opposite/hypotenuse, cos A = adjacent/hypotenuse, tan A = opposite/adjacent'),
      p('Standard values: sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1, sin 60° = √3/2, cos 30° = √3/2, sin 90° = 1, cos 0° = 1.'),
      f('sin²A + cos²A = 1'),
    ],
    examples: [
      ex('In △ABC right-angled at B, AB = 24, BC = 7. Find sin A.', ['AC = √(24² + 7²) = 25', 'Opposite A is BC = 7', 'sin A = 7/25'], '7/25', { kind: 'triangle', a: 24, b: 7, c: 25, angleLabels: ['A', 'B', 'C'] }),
      ex('Evaluate 2 tan²45° + cos²30° − sin²60°.', ['tan 45° = 1, cos 30° = sin 60° = √3/2', '2(1) + 3/4 − 3/4 = 2'], '2'),
    ],
    practice: [
      tp('ratio', (r) => {
        const [a, b, c] = r.pick(TRIPLES);
        const fn = r.pick(['sin', 'cos', 'tan'] as const);
        const g = gcd(gcd(a, b), c);
        const [o, ad, h] = [a / g, b / g, c / g];
        const ans = fn === 'tan' ? [o, ad] : fn === 'sin' ? [o, h] : [ad, h];
        return {
          type: 'typed', keypad: 'fraction', prompt: `In a right triangle, the side opposite angle θ is ${a} cm, the adjacent side is ${b} cm and the hypotenuse is ${c} cm. Find ${fn} θ.`,
          visual: { kind: 'triangle', a, b, c },
          answer: frac(ans[0], ans[1]),
          hints: [fn === 'sin' ? 'sin = opposite ÷ hypotenuse' : fn === 'cos' ? 'cos = adjacent ÷ hypotenuse' : 'tan = opposite ÷ adjacent', 'Simplify the fraction.'],
          mistakes: [{ when: 'wrong-value', explain: 'Check which side is opposite θ and which is adjacent to it.' }],
          solution: [`${fn} θ = ${RATIOS[fn](a, b, c)}`],
        };
      }),
      tp('standard', (r) => {
        const table: [string, string][] = [['sin 30°', '1/2'], ['cos 60°', '1/2'], ['tan 45°', '1'], ['sin 90°', '1'], ['cos 0°', '1'], ['sin 0°', '0'], ['cos 90°', '0'], ['sin 60°', '√3/2'], ['cos 30°', '√3/2'], ['tan 60°', '√3'], ['tan 30°', '1/√3'], ['sin 45°', '1/√2']];
        const [q, a] = r.pick(table);
        const c = choose(r, a, r.shuffle(['1/2', '√3/2', '1', '0', '√3', '1/√3', '1/√2'].filter((x) => x !== a)));
        return { type: 'mcq', prompt: `What is the value of ${q}?`, ...c, hints: ['Picture the 30-60-90 or 45-45-90 triangle.', 'In a 30-60-90 triangle sides are 1 : √3 : 2.'], solution: [`${q} = ${a}`] };
      }),
      tp('match', (r) => {
        const sets: [string, string][][] = [
          [['sin 30°', '1/2'], ['tan 45°', '1'], ['cos 90°', '0'], ['tan 60°', '√3']],
          [['cos 60°', '1/2'], ['sin 90°', '1'], ['sin 0°', '0'], ['cos 30°', '√3/2']],
          [['sin 60°', '√3/2'], ['tan 30°', '1/√3'], ['cos 0°', '1'], ['sin 45°', '1/√2']],
        ];
        const set = r.shuffle(r.pick(sets));
        const m = matching(r, set.slice(0, 4));
        return { type: 'match', prompt: `Match each ratio to its value (${set.map((s) => s[0]).join(', ')}).`, ...m, hints: ['Start with the ones you are sure of: tan 45° = 1.'], solution: set.map(([a, b]) => `${a} = ${b}`) };
      }),
    ],
  }],
};

const heights: USpec = {
  id: 'c10.u.heights', subject: 'math', title: 'Some Applications of Trigonometry', source: src('m10', 9, 'Some Applications of Trigonometry'),
  objectives: [{
    id: 'c10.trig.heights', title: 'Heights and distances', prereqs: ['c10.trig.ratios'],
    intro: [
      p('The angle of elevation is measured up from the horizontal to an object above you; the angle of depression is measured down to an object below.'),
      p('Most problems reduce to tan θ = height ÷ horizontal distance.'),
      tip('Take √3 ≈ 1.732 unless told otherwise.'),
    ],
    examples: [
      ex('From 30 m away the angle of elevation of a tower top is 45°. Height?', ['tan 45° = h/30', '1 = h/30 → h = 30 m'], '30 m'),
      ex('A kite string is 60 m long and makes 60° with the ground. Height of kite?', ['sin 60° = h/60', 'h = 60 × √3/2 = 30√3 ≈ 51.96 m'], '≈ 51.96 m'),
    ],
    practice: [
      tp('tower', (r) => {
        const d = r.pick([10, 15, 20, 25, 30, 40, 50]);
        const ang = r.pick([30, 45, 60]);
        const t = ang === 45 ? 1 : ang === 60 ? Math.sqrt(3) : 1 / Math.sqrt(3);
        const h = rd(d * t, 2);
        const place = r.pick(['Charminar', 'a temple gopuram', 'a lighthouse in ' + r.pick(CITIES), 'a water tank', 'a mobile tower']);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `From a point ${d} m from the foot of ${place}, the angle of elevation of the top is ${ang}°. Find the height (to 2 decimal places).`,
          answer: approx(h, 0.01, 'm'),
          hints: ['tan(angle) = height ÷ distance.', `tan ${ang}° = ${ang === 45 ? '1' : ang === 60 ? '√3 ≈ 1.732' : '1/√3 ≈ 0.577'}`],
          solution: [`h = ${d} × tan ${ang}°`, `h ≈ ${h} m`],
        };
      }, 2),
      tp('angle', (r) => {
        const h = r.pick([5, 8, 10, 12, 20, 25]);
        const ang = r.pick([30, 45, 60]);
        const d = ang === 45 ? h : ang === 60 ? `${h}/√3` : `${h}√3`;
        const c = choose(r, `${ang}°`, ['30°', '45°', '60°', '90°'].filter((x) => x !== `${ang}°`));
        return {
          type: 'mcq', prompt: `A ${h} m pole stands on level ground. From a point ${d} m from its foot, what is the angle of elevation of its top?`, ...c,
          hints: ['tan θ = height ÷ distance.', 'Compare with tan 30° = 1/√3, tan 45° = 1, tan 60° = √3.'],
          solution: [`tan θ = ${h} ÷ (${d})`, `θ = ${ang}°`],
        };
      }),
    ],
  }],
};

const circles: USpec = {
  id: 'c10.u.circles', subject: 'math', title: 'Circles', source: src('m10', 10, 'Circles'),
  objectives: [{
    id: 'c10.circ.tangent', title: 'Tangents to a circle', prereqs: ['c10.coord.distance'],
    intro: [
      p('A tangent touches a circle at exactly one point and is perpendicular to the radius at that point.'),
      p('From an external point, the two tangents to a circle are equal in length.'),
      f('tangent² + radius² = (distance to centre)²'),
    ],
    examples: [
      ex('A point is 13 cm from the centre of a circle of radius 5 cm. Tangent length?', ['Radius ⟂ tangent', 't² = 13² − 5² = 144', 't = 12 cm'], '12 cm'),
      ex('Tangents PA and PB from P; PA = 7 cm. PB?', ['Tangents from an external point are equal'], 'PB = 7 cm'),
    ],
    practice: [
      tp('length', (r) => {
        const [a, b, c] = r.pick(TRIPLES);
        const ask = r.pick(['tangent', 'radius'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm',
          prompt: ask === 'tangent' ? `A point P is ${c} cm from the centre O of a circle of radius ${a} cm. Find the length of the tangent from P.` : `The tangent from a point ${c} cm from the centre of a circle is ${b} cm long. Find the radius.`,
          answer: num(ask === 'tangent' ? b : a, 'cm'),
          hints: ['The radius meets the tangent at 90°.', 'Use Pythagoras with OP as the hypotenuse.'],
          mistakes: [{ when: String(c - (ask === 'tangent' ? a : b)), explain: 'Subtracting lengths does not work — subtract the squares and take a square root.' }],
          solution: [`${ask === 'tangent' ? 't' : 'r'}² = ${c}² − ${ask === 'tangent' ? a : b}² = ${(ask === 'tangent' ? b : a) ** 2}`, `= ${ask === 'tangent' ? b : a} cm`],
        };
      }),
      tp('quad', (r) => {
        const ab = r.int(5, 12), bc = r.int(5, 12), cd = r.int(5, 12);
        const ad = ab + cd - bc;
        if (ad <= 0) return { type: 'typed', keypad: 'numeric', prompt: `A quadrilateral ABCD is drawn around a circle with AB = ${ab + 4} cm, BC = ${bc} cm, CD = ${cd} cm. Find AD.`, answer: num(ab + 4 + cd - bc), hints: ['AB + CD = BC + AD for a quadrilateral around a circle.'], solution: [`AD = AB + CD − BC = ${ab + 4 + cd - bc} cm`] };
        return {
          type: 'typed', keypad: 'numeric', prompt: `A quadrilateral ABCD is drawn around a circle with AB = ${ab} cm, BC = ${bc} cm, CD = ${cd} cm. Find AD (in cm).`, answer: num(ad),
          hints: ['Equal tangents from each corner give AB + CD = BC + AD.'],
          solution: [`AB + CD = BC + AD`, `AD = ${ab} + ${cd} − ${bc} = ${ad} cm`],
        };
      }, 3),
    ],
  }],
};

const areaCirc: USpec = {
  id: 'c10.u.area-circ', subject: 'math', title: 'Areas Related to Circles', source: src('m10', 11, 'Areas Related to Circles'),
  objectives: [{
    id: 'c10.circ.sector', title: 'Area of a sector and length of an arc', prereqs: [],
    activities: ['game:fractions'],
    intro: [
      p('A sector is a "pizza slice" of a circle. Its share of the whole circle is θ/360.'),
      f('Area of sector = (θ/360) × πr²'),
      f('Length of arc = (θ/360) × 2πr'),
      vis({ kind: 'fraction-circle', parts: 4, shaded: 1 }, 'A 90° sector is one quarter of the circle'),
    ],
    examples: [
      ex('Area of a sector with r = 7 cm and θ = 90°? (π = 22/7)', ['(90/360) × 22/7 × 49', '= 1/4 × 154 = 38.5 cm²'], '38.5 cm²'),
      ex('Arc length for r = 21 cm, θ = 60°?', ['(60/360) × 2 × 22/7 × 21', '= 1/6 × 132 = 22 cm'], '22 cm'),
    ],
    practice: [
      tp('sector', (r) => {
        const rad = r.pick([7, 14, 21, 28, 35]), th = r.pick([30, 45, 60, 90, 120, 180]);
        const A = rd((th / 360) * PI * rad * rad, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm²', prompt: `Find the area of a sector of a circle with radius ${rad} cm and angle ${th}°. (Use π = 22/7.)`,
          answer: approx(A, 0.005, 'cm^2'),
          hints: ['Area = (θ/360) × πr²', `πr² = 22/7 × ${rad * rad} = ${rd(PI * rad * rad, 2)}`],
          mistakes: [{ when: String(rd((th / 360) * 2 * PI * rad, 2)), explain: 'That is the arc length (uses 2πr). For area use πr².' }],
          solution: [`(${th}/360) × 22/7 × ${rad}²`, `= ${A} cm²`],
        };
      }, 2),
      tp('arc', (r) => {
        const rad = r.pick([7, 14, 21, 42]), th = r.pick([30, 60, 90, 120, 180]);
        const Ls = rd((th / 360) * 2 * PI * rad, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `Find the length of the arc of a circle of radius ${rad} cm that subtends ${th}° at the centre. (π = 22/7)`,
          answer: approx(Ls, 0.005, 'cm'),
          hints: ['Arc = (θ/360) × 2πr'],
          solution: [`(${th}/360) × 2 × 22/7 × ${rad} = ${Ls} cm`],
        };
      }),
    ],
  }],
};

const solids: USpec = {
  id: 'c10.u.solids', subject: 'math', title: 'Surface Areas and Volumes', source: src('m10', 12, 'Surface Areas and Volumes'),
  objectives: [{
    id: 'c10.solid.volume', title: 'Volumes of combined solids', prereqs: ['c10.circ.sector'],
    intro: [
      p('Many real objects are combinations of simple solids: a capsule is a cylinder with two hemispheres, an ice-cream cone is a cone with a hemisphere.'),
      f('Cylinder V = πr²h, Cone V = ⅓πr²h, Sphere V = ⁴⁄₃πr³, Hemisphere V = ⅔πr³'),
      tip('Add volumes of the parts. For surface area, only count the surfaces you can see.'),
    ],
    examples: [
      ex('A cylinder has r = 7 cm, h = 10 cm. Volume? (π = 22/7)', ['V = 22/7 × 49 × 10', '= 1540 cm³'], '1540 cm³'),
      ex('A toy is a cone (r = 3.5 cm, h = 6 cm) on a hemisphere of the same radius. Volume?', ['Cone: ⅓ × 22/7 × 12.25 × 6 = 77', 'Hemisphere: ⅔ × 22/7 × 42.875 ≈ 89.83', 'Total ≈ 166.83 cm³'], '≈ 166.83 cm³'),
    ],
    practice: [
      tp('cyl-cone', (r) => {
        const rad = r.pick([7, 14, 3.5, 21]), h = r.pick([6, 9, 10, 12, 15]);
        const shape = r.pick(['cylinder', 'cone'] as const);
        const V = rd((shape === 'cone' ? 1 / 3 : 1) * PI * rad * rad * h, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm³', prompt: `Find the volume of a ${shape} with radius ${rad} cm and height ${h} cm. (π = 22/7)`,
          answer: approx(V, 0.005, 'cm^3'),
          hints: [shape === 'cone' ? 'V = ⅓πr²h' : 'V = πr²h', `r² = ${rad * rad}`],
          mistakes: [{ when: String(rd(PI * rad * rad * h * (shape === 'cone' ? 1 : 1 / 3), 2)), explain: 'A cone holds one third of the cylinder with the same base and height.' }],
          solution: [`V = ${shape === 'cone' ? '⅓ × ' : ''}22/7 × ${rad}² × ${h}`, `= ${V} cm³`],
        };
      }),
      tp('capsule', (r) => {
        const rad = r.pick([7, 14, 3.5]), h = r.pick([10, 12, 20, 6]);
        const V = rd(PI * rad * rad * h + (4 / 3) * PI * rad ** 3, 2);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm³', prompt: `A capsule is a cylinder (radius ${rad} cm, length ${h} cm) with a hemisphere on each end. Find its volume to 2 decimal places. (π = 22/7)`,
          answer: approx(V, 0.005, 'cm^3'),
          hints: ['Two hemispheres make one sphere.', 'Total = πr²h + ⁴⁄₃πr³'],
          solution: [`Cylinder = ${rd(PI * rad * rad * h, 2)} cm³`, `Sphere = ${rd((4 / 3) * PI * rad ** 3, 2)} cm³`, `Total = ${V} cm³`],
        };
      }, 3),
    ],
  }],
};

const stats: USpec = {
  id: 'c10.u.stats', subject: 'math', title: 'Statistics', source: src('m10', 13, 'Statistics'),
  objectives: [{
    id: 'c10.stat.grouped', title: 'Mean and modal class of grouped data', prereqs: [],
    intro: [
      p('For grouped data, use the class mark (mid-point) of each class as its representative value.'),
      f('Mean = Σfᵢxᵢ / Σfᵢ'),
      p('The modal class is the class with the highest frequency.'),
    ],
    examples: [
      ex('Classes 0–10, 10–20, 20–30 have frequencies 3, 5, 2. Mean?', ['Class marks: 5, 15, 25', 'Σfx = 15 + 75 + 50 = 140, Σf = 10', 'Mean = 14'], '14'),
      ex('Frequencies 4, 9, 6, 2 for classes 0–5, 5–10, 10–15, 15–20. Modal class?', ['Highest frequency is 9'], '5–10'),
    ],
    practice: [
      tp('mean', (r) => {
        const w = r.pick([10, 20]), start = r.pick([0, 10, 20]);
        const fs = [r.int(1, 8), r.int(2, 10), r.int(1, 8), r.int(1, 6)];
        const xs = fs.map((_, i) => start + w * i + w / 2);
        const S = fs.reduce((a, b) => a + b, 0), SX = fs.reduce((a, fi, i) => a + fi * xs[i], 0);
        const labels = fs.map((_, i) => `${start + w * i}–${start + w * (i + 1)}`);
        return {
          type: 'graph', keypad: 'numeric', prompt: `The bar graph shows marks in a class test (classes ${labels.join(', ')}). Find the mean mark to 2 decimal places.`,
          visual: { kind: 'bar-graph', labels, values: fs, unit: 'students' },
          answer: approx(rd(SX / S, 2), 0.003),
          hints: [`Class marks are ${xs.join(', ')}.`, 'Mean = Σfx ÷ Σf'],
          solution: [`Σf = ${S}`, `Σfx = ${fs.map((fi, i) => `${fi}×${xs[i]}`).join(' + ')} = ${SX}`, `Mean = ${SX} ÷ ${S} ≈ ${rd(SX / S, 2)}`],
        };
      }, 2),
      tp('modal', (r) => {
        const fs = r.shuffle([3, 5, 8, 12, 6]).slice(0, 4);
        const labels = ['0–20', '20–40', '40–60', '60–80'];
        const mi = fs.indexOf(Math.max(...fs));
        const c = choose(r, labels[mi], labels.filter((_, i) => i !== mi));
        return {
          type: 'graph', prompt: 'Daily rainfall (mm) was recorded for a month in Kochi. Which is the modal class?', visual: { kind: 'bar-graph', labels, values: fs, unit: 'days' }, ...c,
          hints: ['The modal class has the tallest bar.'], solution: [`Highest frequency ${fs[mi]} → modal class ${labels[mi]}`],
        };
      }),
    ],
  }],
};

const prob: USpec = {
  id: 'c10.u.prob', subject: 'math', title: 'Probability', source: src('m10', 14, 'Probability'),
  objectives: [{
    id: 'c10.prob.classical', title: 'Theoretical probability', prereqs: [],
    activities: ['game:logic'],
    intro: [
      f('P(E) = number of favourable outcomes ÷ total number of outcomes'),
      p('0 ≤ P(E) ≤ 1. An impossible event has probability 0; a sure event has probability 1.'),
      f('P(not E) = 1 − P(E)'),
    ],
    examples: [
      ex('A die is thrown. P(prime number)?', ['Primes on a die: 2, 3, 5', 'P = 3/6 = 1/2'], '1/2'),
      ex('A bag has 3 red and 5 blue marbles. P(not red)?', ['P(red) = 3/8', 'P(not red) = 1 − 3/8 = 5/8'], '5/8'),
    ],
    practice: [
      tp('bag', (r) => {
        const red = r.int(1, 9), blue = r.int(1, 9), green = r.int(0, 6);
        const T = red + blue + green;
        const ask = r.pick(['red', 'blue', 'not red'] as const);
        const fav = ask === 'red' ? red : ask === 'blue' ? blue : T - red;
        return {
          type: 'typed', keypad: 'fraction', prompt: `A bag has ${red} red, ${blue} blue and ${green} green balls. One is drawn at random. Find P(${ask}).`,
          answer: frac(fav, T),
          hints: [`Total balls = ${T}.`, `Favourable outcomes = ${fav}.`],
          mistakes: [{ when: `${fav}/${T - fav}`, explain: 'Divide by the TOTAL number of balls, not by the number of other balls.' }],
          solution: [`P = ${fav}/${T}${fr(fav, T) !== `${fav}/${T}` ? ` = ${fr(fav, T)}` : ''}`],
        };
      }),
      tp('dice', (r) => {
        const evs: [string, number][] = [['an even number', 3], ['a number greater than 4', 2], ['a prime number', 3], ['a multiple of 3', 2], ['a number less than 7', 6], ['8', 0], ['a factor of 6', 4]];
        const [e, fav] = r.pick(evs);
        return {
          type: 'typed', keypad: 'fraction', prompt: `A fair die is thrown once. What is the probability of getting ${e}?`, answer: frac(fav, 6),
          hints: ['There are 6 equally likely outcomes: 1–6.', 'List the outcomes that match.'],
          solution: [`Favourable: ${fav}`, `P = ${fav}/6${fav ? ` = ${fr(fav, 6)}` : ' = 0'}`],
        };
      }),
      tp('two-coins', (r) => {
        const opts: [string, number][] = [['exactly one head', 2], ['two heads', 1], ['at least one head', 3], ['no head', 1], ['at most one head', 3]];
        const [e, fav] = r.pick(opts);
        const n = r.pick(['two coins are tossed together', 'a coin is tossed twice']);
        return {
          type: 'typed', keypad: 'fraction', prompt: `When ${n}, what is the probability of ${e}?`, answer: frac(fav, 4),
          hints: ['Outcomes: HH, HT, TH, TT.', 'Count the ones that match.'],
          solution: ['Sample space: HH, HT, TH, TT (4 outcomes)', `Favourable: ${fav}`, `P = ${fr(fav, 4)}`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICS
const light: USpec = {
  id: 'c10.u.light', subject: 'physics', title: 'Light – Reflection and Refraction', source: src('s10', 9, 'Light – Reflection and Refraction'),
  objectives: [
    {
      id: 'c10.phy.mirror', title: 'Mirror and lens formulae', prereqs: [],
      activities: ['lab:light'],
      intro: [
        p('Use the New Cartesian sign convention: distances are measured from the pole/optical centre; along the incident light is positive, against it negative. The object is always on the left, so u is negative.'),
        f('Mirror: 1/v + 1/u = 1/f'),
        f('Lens: 1/v − 1/u = 1/f'),
        f('Magnification m = h′/h = −v/u (mirror), v/u (lens)'),
        act('lab:light?angle=30', 'Try reflection in the Light Lab'),
      ],
      examples: [
        ex('Object at 30 cm in front of a concave mirror, f = −15 cm. Image?', ['u = −30, f = −15', '1/v = 1/f − 1/u = −1/15 + 1/30 = −1/30', 'v = −30 cm (real, inverted, same size)'], 'v = −30 cm'),
        ex('Object 10 cm in front of a convex lens of f = 15 cm. Image?', ['1/v = 1/f + 1/u = 1/15 − 1/10 = −1/30', 'v = −30 cm: virtual, erect, on the object side', 'm = v/u = 3'], 'v = −30 cm, m = 3'),
      ],
      practice: [
        tp('mirror', (r) => {
          const pairs: [number, number][] = [[-30, -15], [-20, -10], [-60, -20], [-40, -10], [-24, -12], [-36, -12], [-45, -30], [-15, -10]];
          const [u, fl] = r.pick(pairs);
          const v = rd(1 / (1 / fl - 1 / u), 2);
          return {
            type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `An object is placed ${-u} cm in front of a concave mirror of focal length ${-fl} cm. Find the image distance v (with sign).`,
            answer: approx(v, 0.01, 'cm'),
            hints: [`With sign convention: u = ${u} cm, f = ${fl} cm.`, '1/v = 1/f − 1/u'],
            mistakes: [{ when: String(-v), explain: 'Check your signs: for a concave mirror both u and f are negative, so a real image has negative v.' }],
            solution: [`1/v = 1/(${fl}) − 1/(${u})`, `v = ${v} cm`, v < 0 ? 'Negative v: real image in front of the mirror.' : 'Positive v: virtual image behind the mirror.'],
          };
        }, 2),
        tp('lens', (r) => {
          const pairs: [number, number][] = [[-30, 15], [-20, 10], [-60, 20], [-12, 8], [-40, 24], [-36, 12], [-10, 15], [-6, 12]];
          const [u, fl] = r.pick(pairs);
          const v = rd(1 / (1 / fl + 1 / u), 2);
          return {
            type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `An object is ${-u} cm from a convex lens of focal length ${fl} cm. Find the image distance v (with sign).`,
            answer: approx(v, 0.01, 'cm'),
            hints: [`u = ${u} cm, f = +${fl} cm`, '1/v = 1/f + 1/u'],
            solution: [`1/v = 1/${fl} + 1/(${u})`, `v = ${v} cm`, `m = v/u = ${rd(v / u, 2)}`],
          };
        }, 2),
      ],
    },
    {
      id: 'c10.phy.refraction', title: 'Refractive index and speed of light', prereqs: [],
      activities: ['lab:light'],
      intro: [
        p('Light bends (refracts) when it passes from one medium into another because its speed changes.'),
        f('n = c / v', 'refractive index equals speed of light in vacuum over speed in the medium'),
        p('c = 3 × 10⁸ m/s. A larger n means light travels more slowly and the medium is optically denser.'),
        act('lab:light?angle=45', 'See refraction at 45° in the Light Lab'),
      ],
      examples: [
        ex('n of glass is 1.5. Speed of light in glass?', ['v = c/n = 3 × 10⁸ ÷ 1.5', '= 2 × 10⁸ m/s'], '2 × 10⁸ m/s'),
        ex('Light travels at 2.25 × 10⁸ m/s in water. n?', ['n = 3 × 10⁸ ÷ 2.25 × 10⁸', '≈ 1.33'], '≈ 1.33'),
      ],
      practice: [
        tp('speed', (r) => {
          const [mat, n] = r.pick([['glass', 1.5], ['crown glass', 1.52], ['water', 1.33], ['diamond', 2.42], ['kerosene', 1.44], ['rock salt', 1.54], ['ice', 1.31]] as [string, number][]);
          const v = 3e8 / n;
          return {
            type: 'typed', keypad: 'units', unitHint: 'm/s', prompt: `The refractive index of ${mat} is ${n}. Find the speed of light in ${mat}. (c = 3 × 10⁸ m/s; you may type 2.25e8 m/s)`,
            answer: approx(v, 0.01, 'm/s', true),
            hints: ['v = c ÷ n', 'Keep the unit m/s.'],
            mistakes: [{ when: 'missing-unit', explain: 'A speed needs a unit — add m/s.' }, { when: 'wrong-unit', explain: 'Speed is measured in m/s (or km/h), not in length or time units.' }],
            solution: [`v = 3 × 10⁸ ÷ ${n}`, `≈ ${rd(v / 1e8, 2)} × 10⁸ m/s`],
          };
        }, 2),
        tp('bend', (r) => {
          const cases: [string, string, string][] = [
            ['air', 'glass', 'towards the normal'], ['glass', 'air', 'away from the normal'], ['air', 'water', 'towards the normal'],
            ['water', 'air', 'away from the normal'], ['water', 'glass', 'towards the normal'], ['diamond', 'water', 'away from the normal'],
          ];
          const [a, b, ans] = r.pick(cases);
          const c = choose(r, ans, ['towards the normal', 'away from the normal', 'it does not bend at all'].filter((x) => x !== ans));
          return { type: 'mcq', prompt: `A ray enters ${b} from ${a} at an angle. Which way does it bend?`, ...c, hints: ['Into a denser medium (larger n): slows down, bends towards the normal.'], solution: [`Going from ${a} to ${b}, light bends ${ans}.`] };
        }),
      ],
    },
  ],
};

const eye: USpec = {
  id: 'c10.u.eye', subject: 'physics', title: 'The Human Eye and the Colourful World', source: src('s10', 10, 'The Human Eye and the Colourful World'),
  objectives: [{
    id: 'c10.phy.power', title: 'Power of a lens and defects of vision', prereqs: ['c10.phy.mirror'],
    activities: ['lab:light'],
    intro: [
      p('The power of a lens measures how strongly it bends light. A convex lens has positive power; a concave lens has negative power.'),
      f('P = 1/f   (f in metres, P in dioptres D)'),
      p('Myopia (short-sightedness) is corrected with a concave lens; hypermetropia (long-sightedness) with a convex lens.'),
    ],
    examples: [
      ex('Power of a convex lens of focal length 25 cm?', ['f = 0.25 m', 'P = 1/0.25 = +4 D'], '+4 D'),
      ex('A doctor prescribes −2.5 D. Lens and focal length?', ['Negative power → concave lens', 'f = 1/P = −0.4 m = −40 cm'], 'Concave, f = −40 cm'),
    ],
    practice: [
      tp('power', (r) => {
        const fcm = r.pick([10, 20, 25, 40, 50, 100, 200]) * r.pick([1, -1]);
        const P = rd(100 / fcm, 2);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the power (in dioptres) of a ${fcm > 0 ? 'convex' : 'concave'} lens of focal length ${fcm} cm. Enter a number with its sign.`,
          answer: num(P, undefined, false, 0.01),
          hints: ['Convert f to metres first.', `f = ${fcm / 100} m; P = 1/f`],
          mistakes: [{ when: String(rd(1 / fcm, 4)), explain: 'f must be in metres: divide the centimetres by 100 first.' }],
          solution: [`f = ${fcm} cm = ${fcm / 100} m`, `P = 1/${fcm / 100} = ${P > 0 ? '+' : ''}${P} D`],
        };
      }),
      tp('defect', (r) => {
        const qs: [string, string, string[]][] = [
          ['Meena can read a book but cannot see the blackboard clearly. Which lens corrects this?', 'Concave lens', ['Convex lens', 'Bifocal lens', 'No lens needed']],
          ['Grandfather can see distant hills but holds the newspaper far away to read. Which lens helps?', 'Convex lens', ['Concave lens', 'Plane glass', 'Cylindrical mirror']],
          ['Why is the sky blue?', 'Air scatters blue light more than red', ['Sea water reflects blue', 'The Sun is blue', 'Ozone is blue in colour']],
          ['Why does a glass prism split white light into colours?', 'Different colours bend by different amounts', ['The prism adds colour', 'Light reflects inside', 'Red light is absorbed']],
          ['Why do we see the Sun about 2 minutes before actual sunrise?', 'Atmospheric refraction', ['Dispersion', 'Reflection by clouds', 'Scattering']],
          ['Why are danger signals red?', 'Red light is scattered the least, so it travels far', ['Red is brightest', 'Red has the shortest wavelength', 'Red reflects from fog']],
        ];
        const [q, a, w] = r.pick(qs);
        const c = choose(r, a, w);
        return { type: 'mcq', prompt: q, ...c, hints: ['Think about where the image forms, or how light interacts with particles.'], solution: [a] };
      }),
    ],
  }],
};

const OHM_CASES = (r: Rng): QSpec => {
  const ask = r.pick(['I', 'V', 'R'] as const);
  const R = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30]);
  const I = r.pick([0.25, 0.5, 1, 1.5, 2, 3]);
  const V = rd(I * R, 3);
  const nm = r.pick(['a bulb', 'a heater coil', 'a resistor', 'a toaster element', 'an LED strip']);
  if (ask === 'I') return {
    type: 'typed', keypad: 'units', unitHint: 'A', prompt: `A potential difference of ${V} V is applied across ${nm} of resistance ${R} Ω. Find the current through it.`,
    answer: num(I, 'A', true),
    hints: ['Ohm\'s law: V = IR', 'So I = V ÷ R. Give your answer with a unit (A or mA).'],
    mistakes: [{ when: 'missing-unit', explain: 'Current needs a unit: amperes (A) or milliamperes (mA).' }, { when: 'wrong-unit', explain: 'Current is measured in amperes (A), not volts or ohms.' }, { when: String(V * R), explain: 'You multiplied. Current = voltage ÷ resistance.' }],
    solution: [`I = V/R = ${V} ÷ ${R}`, `I = ${I} A (= ${I * 1000} mA)`],
  };
  if (ask === 'V') return {
    type: 'typed', keypad: 'units', unitHint: 'V', prompt: `A current of ${I} A flows through ${nm} of resistance ${R} Ω. Find the potential difference across it.`,
    answer: num(V, 'V', true),
    hints: ['V = IR', 'Answer in volts (V).'],
    mistakes: [{ when: 'missing-unit', explain: 'Potential difference needs a unit: volts (V).' }, { when: 'wrong-unit', explain: 'Potential difference is measured in volts (V).' }],
    solution: [`V = I × R = ${I} × ${R}`, `V = ${V} V`],
  };
  return {
    type: 'typed', keypad: 'units', unitHint: 'Ω', prompt: `${nm[0].toUpperCase() + nm.slice(1)} draws ${I} A when connected to ${V} V. Find its resistance.`,
    answer: num(R, 'ohm', true),
    hints: ['R = V ÷ I', 'Resistance is measured in ohms (Ω).'],
    mistakes: [{ when: 'missing-unit', explain: 'Resistance needs a unit: ohms (Ω).' }],
    solution: [`R = V/I = ${V} ÷ ${I}`, `R = ${R} Ω`],
  };
};

const elec: USpec = {
  id: 'c10.u.elec', subject: 'physics', title: 'Electricity', source: src('s10', 11, 'Electricity'),
  objectives: [
    {
      id: 'c10.phy.ohm', title: 'Ohm\'s law numericals (with units)', prereqs: [],
      activities: ['lab:circuit', 'game:circuits'],
      intro: [
        p('Current (I) is the rate of flow of charge, measured in amperes (A). Potential difference (V) pushes the charge, measured in volts (V). Resistance (R) opposes the flow, measured in ohms (Ω).'),
        f('V = I × R', 'V equals I times R'),
        def("Ohm's law", 'At a constant temperature, the current through a conductor is directly proportional to the potential difference across it: V = IR.'),
        explore({
          title: L("What if? Play with Ohm's law"),
          formula: 'I = V / R',
          result: { sym: 'I', name: L('Current'), unit: 'A', expr: 'V / R', decimals: 3 },
          vars: [
            { sym: 'V', name: L('Potential difference'), unit: 'V', min: 1, max: 24, step: 0.5, value: 6 },
            { sym: 'R', name: L('Resistance'), unit: 'Ω', min: 1, max: 100, step: 1, value: 12 },
          ],
          notes: [
            { sym: 'V', up: L('A bigger push (more cells in the battery) drives more charge per second, so the bulb glows brighter.'), down: L('A smaller push drives less charge per second, so the bulb glows dimmer.') },
            { sym: 'R', up: L('More resistance (a longer or thinner wire, or more bulbs in series) opposes the flow, so less current flows.'), down: L('Less resistance lets charge flow more easily, so more current flows — too little resistance can overheat a circuit.') },
          ],
          mistakes: [
            { wrong: L('Multiplying: I = V × R'), why: L('Current goes DOWN when resistance goes up, so R must divide: I = V ÷ R.') },
            { wrong: L('Forgetting to convert kΩ or mA'), why: L('Use base units: 1 kΩ = 1000 Ω and 1 mA = 0.001 A before substituting.') },
            { wrong: L('Writing the answer without a unit'), why: L('An answer like "0.5" is incomplete — current is 0.5 A.') },
          ],
          realWorld: L('A phone charger supplies about 5 V; the phone controls its resistance so a safe current flows into the battery.'),
        }),
        keys('V = IR, so I = V/R and R = V/I.', 'Units: V in volts (V), I in amperes (A), R in ohms (Ω).', 'Double V (same R) → I doubles. Double R (same V) → I halves.'),
        remember('In exams always write the formula, substitute with units, and write the unit in the final answer.'),
        stepsB('Write down what is given, with units.', 'Convert units if needed (mA → A, kΩ → Ω).', 'Rearrange V = IR for the unknown.', 'Substitute, calculate, and write the unit.'),
        act('lab:circuit?cells=2&bulbs=1&closed=1', 'Verify in the Circuit Lab: 2 cells (3 V) and 1 bulb — read the ammeter and check V = IR'),
        act('lab:circuit?cells=4&bulbs=2&closed=1', 'Double the cells and add a bulb in series — does I change as Ohm\'s law predicts?'),
      ],
      examples: [
        ex('A 3 V battery (two 1.5 V cells) drives 0.5 A through a bulb. Resistance of the bulb?', ['Given V = 3 V, I = 0.5 A', 'R = V/I = 3 ÷ 0.5', 'R = 6 Ω', 'Check it in the Circuit Lab preset with 2 cells and 1 bulb.'], '6 Ω'),
        ex('An electric iron of resistance 20 Ω runs on 220 V. Current?', ['I = V/R = 220 ÷ 20', 'I = 11 A'], '11 A'),
      ],
      practice: [tp('calc', OHM_CASES, 2)],
      items: [
        item('c10.phy.ohm.s1', 'c10.phy.ohm', {
          type: 'typed', keypad: 'units', unitHint: 'mA', prompt: 'A torch bulb of resistance 1.5 kΩ is connected to a 3 V battery. Find the current in milliamperes.',
          answer: num(2, 'mA', true),
          hints: ['Convert kΩ to Ω: 1.5 kΩ = 1500 Ω.', 'I = V/R, then convert A to mA.'],
          mistakes: [{ when: 'missing-unit', explain: 'Give the unit, e.g. mA.' }, { when: '2000', explain: 'Did you forget to convert kΩ to Ω?' }],
          solution: ['R = 1500 Ω', 'I = 3 ÷ 1500 = 0.002 A', '= 2 mA'],
        }, 2),
      ],
    },
    {
      id: 'c10.phy.resist', title: 'Resistors in series and parallel', prereqs: ['c10.phy.ohm'],
      activities: ['lab:circuit', 'game:circuits'],
      intro: [
        f('Series: R = R₁ + R₂ + R₃'),
        f('Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃'),
        p('In series the same current flows through each resistor. In parallel each resistor gets the full voltage, and the total resistance is less than the smallest one — that is why household wiring is parallel.'),
        act('lab:circuit?cells=2&bulbs=3&closed=1', 'Explore bulbs in the Circuit Lab'),
      ],
      examples: [
        ex('Resistors 5 Ω, 10 Ω, 15 Ω in series with 12 V. Current?', ['R = 30 Ω', 'I = 12 ÷ 30 = 0.4 A'], '0.4 A'),
        ex('6 Ω and 3 Ω in parallel. Equivalent resistance?', ['1/R = 1/6 + 1/3 = 1/2', 'R = 2 Ω'], '2 Ω'),
      ],
      practice: [
        tp('series', (r) => {
          const a = r.int(2, 12), b = r.int(2, 12), c = r.int(1, 10);
          return {
            type: 'typed', keypad: 'units', unitHint: 'Ω', prompt: `Find the equivalent resistance of ${a} Ω, ${b} Ω and ${c} Ω connected in series.`, answer: num(a + b + c, 'ohm'),
            hints: ['In series, resistances simply add.'], solution: [`R = ${a} + ${b} + ${c} = ${a + b + c} Ω`],
          };
        }),
        tp('parallel', (r) => {
          const pairs: [number, number][] = [[6, 3], [12, 4], [10, 10], [20, 5], [12, 6], [30, 15], [8, 8], [4, 12], [6, 12], [18, 9]];
          const [a, b] = r.pick(pairs);
          const R = (a * b) / (a + b);
          return {
            type: 'typed', keypad: 'units', unitHint: 'Ω', prompt: `Find the equivalent resistance of ${a} Ω and ${b} Ω connected in parallel.`, answer: approx(R, 0.005, 'ohm'),
            hints: ['1/R = 1/R₁ + 1/R₂', 'For two resistors: R = R₁R₂/(R₁ + R₂).'],
            mistakes: [{ when: String(a + b), explain: 'Adding is for series. In parallel the total is smaller than either resistor.' }],
            solution: [`R = (${a} × ${b}) ÷ (${a} + ${b}) = ${rd(R, 2)} Ω`],
          };
        }, 2),
      ],
    },
    {
      id: 'c10.phy.power-energy', title: 'Electric power and energy bills', prereqs: ['c10.phy.ohm'],
      intro: [
        f('P = V × I = I²R = V²/R'),
        p('The "unit" on an electricity bill is 1 kilowatt-hour (kWh) = 3.6 × 10⁶ J.'),
        f('Energy (kWh) = power (kW) × time (h)'),
      ],
      examples: [
        ex('A 220 V bulb draws 0.5 A. Power?', ['P = VI = 220 × 0.5', '= 110 W'], '110 W'),
        ex('A 2 kW geyser runs 30 min daily for 30 days at ₹6/unit. Cost?', ['Energy = 2 × 0.5 × 30 = 30 kWh', 'Cost = 30 × 6 = ₹180'], '₹180'),
      ],
      practice: [
        tp('power', (r) => {
          const V = r.pick([220, 230, 12, 6]);
          const I = r.pick([0.5, 1, 2, 4, 5, 0.25]);
          return {
            type: 'typed', keypad: 'units', unitHint: 'W', prompt: `An appliance on ${V} V draws a current of ${I} A. What is its power?`, answer: num(V * I, 'W', true),
            hints: ['P = V × I', 'Power is in watts (W).'],
            mistakes: [{ when: 'missing-unit', explain: 'Give the unit: W (watts) or kW.' }],
            solution: [`P = ${V} × ${I} = ${V * I} W`],
          };
        }),
        tp('bill', (r) => {
          const app = r.pick([['fan', 75], ['TV', 120], ['fridge', 200], ['AC', 1500], ['geyser', 2000], ['LED bulb', 10], ['iron', 1000]] as [string, number][]);
          const h = r.pick([2, 4, 5, 6, 8, 10]), d = 30, rate = r.pick([5, 6, 7, 8]);
          const kwh = (app[1] / 1000) * h * d;
          return {
            type: 'typed', keypad: 'units', unitHint: '₹', prompt: `A ${app[1]} W ${app[0]} runs ${h} hours a day for ${d} days. At ₹${rate} per unit (kWh), what is the cost?`, answer: approx(rd(kwh * rate, 2), 0.002, '₹'),
            steps: [{ prompt: 'Energy used in kWh', answer: approx(kwh, 0.002) }, { prompt: 'Cost in ₹', answer: approx(rd(kwh * rate, 2), 0.002, '₹') }],
            hints: ['Convert W to kW (÷ 1000).', 'kWh = kW × hours.'],
            mistakes: [{ when: String(app[1] * h * d * rate), explain: 'Convert watts to kilowatts first: one unit is 1 kWh, not 1 Wh.' }],
            solution: [`Energy = ${app[1] / 1000} kW × ${h} h × ${d} = ${rd(kwh, 3)} kWh`, `Cost = ${rd(kwh, 3)} × ₹${rate} = ${inr(rd(kwh * rate, 2))}`],
          };
        }, 2),
      ],
    },
  ],
};

const magnet: USpec = {
  id: 'c10.u.magnet', subject: 'physics', title: 'Magnetic Effects of Electric Current', source: src('s10', 12, 'Magnetic Effects of Electric Current'),
  objectives: [{
    id: 'c10.phy.magnetic', title: 'Field lines, right-hand rule and Fleming\'s left-hand rule', prereqs: ['c10.phy.ohm'],
    activities: ['lab:circuit'],
    intro: [
      p('A current-carrying wire produces a magnetic field around it. Field lines go from N to S outside a magnet and never cross.'),
      p('Right-hand thumb rule: hold the wire with thumb along the current — curled fingers show the field direction.'),
      p('Fleming\'s left-hand rule: First finger = Field, seCond finger = Current, thuMb = Motion (force). Electric motors use this force.'),
      tip('Household circuits use a fuse and earthing for safety.'),
    ],
    examples: [
      ex('Current flows upward in a vertical wire. Field direction seen from above?', ['Right thumb points up', 'Fingers curl anticlockwise'], 'Anticlockwise circles'),
      ex('Field into the page, current to the right. Force on the wire?', ['First finger: into page; second finger: right', 'Thumb points up the page'], 'Upwards'),
    ],
    practice: [
      tp('facts', (r) => {
        const qs: [string, string, string[]][] = [
          ['What do field lines that are closer together show?', 'A stronger magnetic field', ['A weaker field', 'No field', 'Electric current']],
          ['Which rule gives the direction of force on a current-carrying conductor in a magnetic field?', 'Fleming\'s left-hand rule', ['Right-hand thumb rule', 'Ohm\'s law', 'Snell\'s law']],
          ['Which device converts electrical energy into mechanical energy?', 'Electric motor', ['Electric generator', 'Fuse', 'Galvanometer']],
          ['Why is a fuse used in household circuits?', 'It melts and breaks the circuit when current is too large', ['It increases the voltage', 'It stores charge', 'It makes the field stronger']],
          ['Inside a long current-carrying solenoid, the magnetic field is…', 'Uniform (parallel straight lines)', ['Zero', 'Circular', 'Strongest at the ends only']],
          ['What happens to the force on a wire if the current direction is reversed?', 'The force reverses', ['It doubles', 'It becomes zero', 'It stays the same']],
          ['Can two magnetic field lines cross each other?', 'No — the field has one direction at each point', ['Yes, near the poles', 'Yes, always', 'Only inside a magnet']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Recall the rules: left hand for motors (force), right thumb for the field around a wire.'], solution: [a] };
      }),
      tp('fleming', (r) => {
        const dirs = ['up the page', 'down the page', 'to the left', 'to the right'];
        const cases: [string, string, string][] = [
          ['into the page', 'to the right', 'up the page'], ['into the page', 'to the left', 'down the page'],
          ['out of the page', 'to the right', 'down the page'], ['out of the page', 'to the left', 'up the page'],
          ['into the page', 'up the page', 'to the left'], ['out of the page', 'up the page', 'to the right'],
          ['into the page', 'down the page', 'to the right'], ['out of the page', 'down the page', 'to the left'],
        ];
        const [B, I, F] = r.pick(cases);
        return {
          type: 'mcq', prompt: `A wire carries current ${I} in a magnetic field pointing ${B}. Which way is the force on the wire?`, ...choose(r, F, dirs.filter((d) => d !== F)),
          hints: ['Use Fleming\'s left-hand rule.', 'First finger → field, second finger → current, thumb → force.'],
          solution: [`Field ${B}, current ${I}`, `Thumb points ${F}`],
        };
      }, 2),
      tp('order', (r) => {
        const seqs = [
          ['Close the switch', 'Current flows in the coil', 'Coil experiences a force in the field', 'Coil rotates', 'Split ring reverses current every half turn'],
          ['Main supply enters the meter', 'Main fuse', 'Distribution box', 'Separate circuits with fuses', 'Appliances connected in parallel'],
        ];
        const s = r.pick(seqs);
        const take = r.int(4, 5);
        const items = s.slice(0, take);
        const o = ordering(r, items);
        return { type: 'order', prompt: `Put these steps in order: ${s === seqs[0] ? 'how an electric motor works' : 'how electricity reaches appliances at home'}${take === 4 ? ' (first four steps)' : ''}.`, ...o, hints: ['Start from where the current comes from.'], solution: items };
      }),
      tp('tap', (r) => {
        const all = [
          { label: 'Electric motor', ok: true }, { label: 'Electric bell', ok: true }, { label: 'Loudspeaker', ok: true }, { label: 'MRI scanner', ok: true },
          { label: 'Solar cooker', ok: false }, { label: 'Candle', ok: false }, { label: 'Plane mirror', ok: false }, { label: 'Electromagnetic crane', ok: true },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[4];
        return { type: 'tap', prompt: 'Tap every device that uses the magnetic effect of electric current.', ...tapAll(r, pick), hints: ['Does it need a current to make a magnetic field?'], solution: [`Uses magnetic effect: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
    ],
  }],
};


export default buildClass(12, [real, poly, pair, quad, ap, tri, coord, trig, heights, circles, areaCirc, solids, stats, prob, light, eye, elec, magnet, ...tsClass10]);
