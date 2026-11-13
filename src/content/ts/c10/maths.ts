// Telangana SCERT Class 10 — maths. Original explanations aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts10.m.ch<n>); objectives ts10.m.<topic>.<skill>.
// Every formula has a "what if?" explorer; every template uses only the Rng it is given.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, explore, L, num, frac, choose, matching, ordering, tapAll,
  gcd, lcm, fr, rd, inr, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(10, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** signed number for display: −3 */
const n_ = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
/** number in brackets when negative: (−3) */
const pn = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
const pt = (x: number, y: number) => `(${n_(x)}, ${n_(y)})`;
/** display a fraction n/d in lowest terms with a proper minus sign */
const fx = (n: number, d: number) => fr(n, d).replace('-', '−');
const subN = (n: number) => String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
/** ordinal: 1st, 2nd, 3rd, 11th, 21st */
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10]}`;
const SUP = ['', '', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
/** polynomial from coefficients, highest degree first: [1, -3, 2] → x² − 3x + 2 */
const poly = (cs: number[], v = 'x') => {
  const n = cs.length - 1;
  let s = '';
  cs.forEach((c, i) => {
    const deg = n - i;
    if (!c) return;
    const a = Math.abs(c);
    const body = deg === 0 ? `${a}` : `${a === 1 ? '' : a}${v}${SUP[deg]}`;
    s += s ? ` ${c < 0 ? '−' : '+'} ${body}` : `${c < 0 ? '−' : ''}${body}`;
  });
  return s || '0';
};
/** prime factorisation with powers: 360 → 2³ × 3² × 5 */
const pfs = (n: number) => {
  const parts: string[] = [];
  let x = n;
  for (let d = 2; x > 1; d++) {
    let k = 0;
    while (x % d === 0) { x /= d; k++; }
    if (k) parts.push(`${d}${k > 1 ? SUP[k] : ''}`);
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
/** n-th step answer helper */
const st = (prompt: string, answer: AnswerSpec) => ({ prompt, answer });
const PI7 = 22 / 7;
const S3 = 1.732;

// ================================================================== CH 1 REAL NUMBERS
const ch1: USpec = {
  id: 'ts10.m.ch1', subject: 'math', title: 'Real Numbers', source: src(1),
  objectives: [
    {
      id: 'ts10.m.real.fta', title: 'Fundamental Theorem of Arithmetic: HCF and LCM',
      intro: [
        h('Every number has a prime "fingerprint"'),
        p('Your Aadhaar number belongs to you alone. Whole numbers have something similar: every whole number bigger than 1 can be built by multiplying primes, and there is only ONE way to do it (apart from the order of the factors). That one-and-only product is the number\'s prime fingerprint.'),
        def('Prime factorisation', 'Writing a number as a product of prime numbers, e.g. 360 = 2³ × 3² × 5.'),
        def('Fundamental Theorem of Arithmetic', 'Every composite number can be written as a product of primes, and this factorisation is unique except for the order in which the primes appear.'),
        stepsB('Divide the number by the smallest prime that goes into it (2, then 3, then 5, …).', 'Keep dividing the quotient the same way until you reach 1.', 'Collect equal primes as powers: 2 × 2 × 2 = 2³.'),
        h('Using the fingerprint for HCF and LCM'),
        p('HCF (highest common factor): look only at the primes that BOTH numbers share and take each with its SMALLER power.'),
        p('LCM (lowest common multiple): take EVERY prime that appears in either number, each with its LARGER power.'),
        f('HCF(a, b) × LCM(a, b) = a × b', 'H C F times L C M equals a times b'),
        p('Why does this work? Write a = H × m and b = H × n, where H is the HCF and m, n have no common factor. Then LCM = H × m × n, and HCF × LCM = H × (H × m × n) = (H × m) × (H × n) = a × b.'),
        X({
          title: 'What if? Build two numbers from their HCF', formula: 'a = H × m, b = H × n (m, n co-prime) ⇒ LCM = H × m × n',
          result: ['LCM', 'Lowest common multiple', 'H * m * n'],
          vars: [['H', 'HCF (shared part)', 1, 12, 1, 6], ['m', 'Extra factor of a', 1, 9, 1, 2], ['n', 'Extra factor of b', 1, 9, 1, 5]],
          notes: [
            ['H', 'A bigger shared part makes both numbers bigger by the same factor, so the LCM grows in the same proportion.', 'A smaller shared part shrinks both numbers, so the LCM shrinks too.'],
            ['m', 'The first number gains an extra factor that the second number does not have, so the LCM must include it.', 'The first number loses an extra factor, so the LCM needs less.'],
            ['n', 'The second number gains an unshared factor, so the LCM gets bigger.', 'The second number loses an unshared factor, so the LCM gets smaller.'],
          ],
          mistakes: [
            ['Choosing m and n that share a factor (like m = 2, n = 4)', 'Then H is not really the HCF: 12 and 24 share 12, not 6. The rule needs m and n to be co-prime.'],
            ['Using HCF × LCM = product for three numbers', 'The rule is proven only for TWO numbers. For 2, 4 and 8: HCF × LCM = 2 × 8 = 16 but the product is 64.'],
            ['Taking the larger powers for the HCF', 'Smaller powers give the HCF (what both can share); larger powers give the LCM (what covers both).'],
          ],
          real: 'Two buses leaving MGBS Hyderabad every 12 and 18 minutes leave together again after LCM(12, 18) = 36 minutes.',
        }),
        keys('Every number > 1 has exactly one prime factorisation.', 'HCF: common primes, smaller powers.', 'LCM: all primes, larger powers.', 'HCF × LCM = a × b (two numbers only).'),
        remember('A number ends in 0 only if its prime factorisation contains both 2 and 5. So 6ⁿ = 2ⁿ × 3ⁿ can never end in 0 — there is no 5.'),
        tip('Check your work: the HCF must divide both numbers, and both numbers must divide the LCM.'),
      ],
      examples: [
        ex('Find the HCF and LCM of 140 and 252.', ['140 = 2² × 5 × 7', '252 = 2² × 3² × 7', 'HCF: common primes 2 and 7 with smaller powers → 2² × 7 = 28', 'LCM: all primes with larger powers → 2² × 3² × 5 × 7 = 1260', 'Check: 28 × 1260 = 35280 = 140 × 252 ✓'], 'HCF = 28, LCM = 1260'),
        ex('Can 4ⁿ end with the digit 0 for any natural number n?', ['4ⁿ = (2²)ⁿ = 2²ⁿ', 'Its only prime factor is 2.', 'To end in 0 a number must be divisible by 10 = 2 × 5, so 5 must be a prime factor.', 'By uniqueness of prime factorisation, 5 can never appear.'], 'No, 4ⁿ never ends in 0'),
        ex('At a Bathukamma celebration, sweets are packed in boxes of 18 and 24 with none left over. What is the smallest number of sweets for which both packings work?', ['We need the LCM of 18 and 24.', '18 = 2 × 3², 24 = 2³ × 3', 'LCM = 2³ × 3² = 72'], '72 sweets'),
      ],
      practice: [
        tp('hcf', (r) => {
          const hh = r.pick([2, 3, 4, 6, 7, 8, 9, 12, 14, 15]);
          const m = r.int(2, 9);
          let n = r.int(2, 11);
          while (gcd(m, n) !== 1 || m === n) n = r.int(2, 11);
          const a = hh * m, b = hh * n;
          return typed(`Find the HCF of ${a} and ${b} using prime factorisation.`, num(hh),
            [`Write ${a} and ${b} as products of primes.`, 'Keep only the primes common to both, each with the smaller power.', `${a} = ${pfs(a)} and ${b} = ${pfs(b)}.`],
            [`${a} = ${pfs(a)}`, `${b} = ${pfs(b)}`, `Common part = ${pfs(hh)} = ${hh}`, `HCF = ${hh}`],
            [[String(lcm(a, b)), 'That is the LCM (smallest common multiple). The HCF is the largest common FACTOR, so it is never bigger than the smaller number.']]);
        }),
        tp('lcm', (r) => {
          const hh = r.pick([2, 3, 4, 5, 6]);
          const m = r.int(2, 7);
          let n = r.int(2, 9);
          while (gcd(m, n) !== 1 || m === n) n = r.int(2, 9);
          const a = hh * m, b = hh * n;
          return typed(`Find the LCM of ${a} and ${b}.`, num(lcm(a, b)),
            ['Factorise both numbers into primes.', 'Take every prime that appears, each with its larger power.'],
            [`${a} = ${pfs(a)}`, `${b} = ${pfs(b)}`, `LCM = ${pfs(lcm(a, b))} = ${lcm(a, b)}`],
            [[String(a * b), `${a} × ${b} is a common multiple, but not the lowest one because the numbers share the factor ${hh}.`], [String(hh), 'That is the HCF. The LCM is a multiple of both numbers.']]);
        }),
        tp('product-rule', (r) => {
          const hh = r.pick([3, 4, 6, 7, 9, 12]);
          const m = r.int(2, 9);
          let n = r.int(3, 13);
          while (gcd(m, n) !== 1 || m === n) n = r.int(3, 13);
          const a = hh * m, b = hh * n, l = hh * m * n;
          return typed(`The HCF of two numbers is ${hh} and their LCM is ${l}. One number is ${a}. Find the other number.`, num(b),
            ['Use HCF × LCM = product of the two numbers.', `Other number = (${hh} × ${l}) ÷ ${a}`],
            [`HCF × LCM = ${hh} × ${l} = ${hh * l}`, `Other number = ${hh * l} ÷ ${a} = ${b}`, `Check: HCF(${a}, ${b}) = ${hh} ✓`],
            [[String(hh * l), 'That is the product of the two numbers. Divide it by the number you already know.']], { steps: [st('First find the product of the two numbers (HCF × LCM).', num(hh * l)), st('Now find the other number.', num(b))] });
        }, 2),
        tp('buses', (r) => {
          const opts = [12, 15, 18, 20, 24, 30, 36, 40, 45];
          const x = r.pick(opts);
          let y = r.pick(opts);
          while (y === x || lcm(x, y) === Math.max(x, y)) y = r.pick(opts);
          const who = r.pick(['Two buses leave Jubilee Bus Station', 'Two bells in a Warangal temple ring', 'Two traffic lights at a Hyderabad junction turn green']);
          return typed(`${who} together at 8:00 a.m. One repeats every ${x} minutes, the other every ${y} minutes. After how many minutes will they next happen together?`, num(lcm(x, y), 'min'),
            ['They coincide at a common multiple of both times.', 'The FIRST time is the lowest common multiple.', `${x} = ${pfs(x)}, ${y} = ${pfs(y)}`],
            [`${x} = ${pfs(x)}`, `${y} = ${pfs(y)}`, `LCM = ${pfs(lcm(x, y))} = ${lcm(x, y)} minutes`],
            [[String(x * y), 'That is a common multiple but not the first one. Use the LCM.'], [String(gcd(x, y)), 'That is the HCF. Events repeating together need a common MULTIPLE.']]);
        }, 2),
        bank('fingerprint', [
          { q: 'Which number can end with the digit 0 for some natural number n?', a: '10ⁿ', w: ['6ⁿ', '4ⁿ', '9ⁿ'], h: ['A number ending in 0 is divisible by 2 and 5.'], s: ['10ⁿ = 2ⁿ × 5ⁿ contains both 2 and 5. The others have no factor 5.'] },
          { q: 'What is the prime factorisation of 3825?', a: '3² × 5² × 17', w: ['3 × 5² × 51', '3² × 5 × 85', '5² × 153'], h: ['Every factor must be prime.', '51 = 3 × 17 and 153 = 9 × 17 are not prime.'], s: ['3825 ÷ 5 = 765, ÷ 5 = 153, ÷ 3 = 51, ÷ 3 = 17', '3825 = 3² × 5² × 17'] },
          { q: 'If p and q are different primes, what is HCF(p, q)?', a: '1', w: ['p', 'pq', 'q'], h: ['A prime has only two factors: 1 and itself.'], s: ['The only factor common to two different primes is 1.'] },
          { q: 'Why is 7 × 11 × 13 + 13 a composite number?', a: 'It equals 13 × (7 × 11 + 1) = 13 × 78', w: ['Because it is odd', 'Because 13 is prime', 'Because it ends in 4'], h: ['Look for a common factor in both terms.'], s: ['7 × 11 × 13 + 13 = 13(77 + 1) = 13 × 78, so it has factors other than 1 and itself.'] },
          { q: 'HCF(a, b) × LCM(a, b) = a × b is true for:', a: 'any two positive integers', w: ['any three positive integers', 'prime numbers only', 'even numbers only'], h: ['Try 2, 4, 8 with three numbers.'], s: ['The rule is proved for exactly two numbers. For three numbers it fails in general.'] },
          { q: 'The LCM of two co-prime numbers a and b is:', a: 'a × b', w: ['1', 'a + b', 'the larger number'], h: ['Co-prime means HCF = 1.'], s: ['LCM = (a × b) ÷ HCF = (a × b) ÷ 1 = a × b.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.real.decimal', title: 'Terminating and recurring decimals', prereqs: ['ts10.m.real.fta'],
      intro: [
        h('When does a decimal stop?'),
        p('Share ₹1 among 8 friends: each gets ₹0.125 — the decimal stops. Share ₹1 among 3 friends: ₹0.333… — the 3s never stop. Why does one end and the other go on forever? The answer is hidden in the prime factors of the denominator.'),
        def('Terminating decimal', 'A decimal that ends after a finite number of digits, e.g. 7/8 = 0.875.'),
        def('Non-terminating recurring decimal', 'A decimal that never ends but repeats a block of digits forever, e.g. 2/11 = 0.181818… = 0.‾18.'),
        p('Our decimal system is built on 10 = 2 × 5. If the denominator is made only of 2s and 5s, we can multiply top and bottom to make the denominator a power of 10 — and then the decimal must stop. Example: 3/40 = 3/(2³ × 5) = (3 × 5²)/(2³ × 5³) = 75/1000 = 0.075.'),
        p('If the denominator (in lowest terms) has any other prime, such as 3 or 7, no power of 10 can ever be divided by it, so the division never finishes. The remainders must eventually repeat, so the digits repeat.'),
        f('p/q (lowest terms) terminates ⇔ q = 2ᵐ × 5ⁿ;  number of decimal places = the larger of m and n', 'p over q terminates exactly when q is 2 to the m times 5 to the n'),
        X({
          title: 'What if? Count the decimal places', formula: 'places = max(m, n) for p / (2ᵐ × 5ⁿ)',
          result: ['k', 'Number of decimal places', 'max(m, n)'],
          vars: [['m', 'Power of 2 in the denominator', 0, 6, 1, 3], ['n', 'Power of 5 in the denominator', 0, 6, 1, 1]],
          notes: [
            ['m', 'More 2s in the denominator need more 5s on top to reach a power of 10 — once m is the larger power, each extra 2 adds a decimal place.', 'Fewer 2s: if m drops below n, the 5s decide the number of places.'],
            ['n', 'More 5s need more 2s to pair with — once n is the larger power, each extra 5 adds a decimal place.', 'Fewer 5s: the 2s may now decide the number of places.'],
          ],
          mistakes: [
            ['Testing the denominator before reducing the fraction', '6/15 looks risky (15 = 3 × 5), but 6/15 = 2/5 = 0.4 terminates. Always reduce to lowest terms first.'],
            ['Adding m and n to count places', '1/40 = 1/(2³ × 5) = 0.025 has 3 places, not 4. Only the LARGER power matters.'],
            ['Thinking a recurring decimal is irrational', '0.333… = 1/3 is rational. Recurring decimals are always rational.'],
          ],
          real: 'Prices like ₹12.50 or ₹0.75 terminate because they are hundredths: 100 = 2² × 5².',
        }),
        h('Turning a recurring decimal back into a fraction'),
        stepsB('Let x = the decimal, e.g. x = 0.474747…', 'Multiply by 10 for each digit in the repeating block: 100x = 47.474747…', 'Subtract: 100x − x = 47, so 99x = 47.', 'x = 47/99.'),
        keys('Denominator only 2s and 5s (in lowest terms) → terminating.', 'Any other prime in the denominator → non-terminating recurring.', 'Every terminating or recurring decimal is rational.', '0.‾ab = ab/99 and 0.‾a = a/9.'),
        remember('Always reduce the fraction to lowest terms before looking at the denominator.'),
      ],
      examples: [
        ex('Without dividing, decide whether 13/3125 terminates. If yes, write the decimal.', ['3125 = 5⁵, only 5s', 'So it terminates, with 5 decimal places.', '13/5⁵ = (13 × 2⁵)/(2⁵ × 5⁵) = 416/100000', '= 0.00416'], 'Terminates: 0.00416'),
        ex('Write 0.474747… as a fraction.', ['x = 0.474747…', '100x = 47.474747…', '99x = 47', 'x = 47/99'], '47/99'),
        ex('Does 29/343 terminate?', ['343 = 7³', '7 is neither 2 nor 5, and 29/343 is already in lowest terms.'], 'No — it is non-terminating recurring'),
      ],
      practice: [
        tp('classify', (r) => {
          const dens = [8, 16, 20, 25, 40, 50, 125, 80, 3, 6, 7, 12, 15, 21, 35, 45, 9, 14, 24];
          const q = r.pick(dens);
          let pn2 = r.int(1, 30);
          while (gcd(pn2, q) !== 1) pn2 = r.int(1, 30);
          let x = q;
          while (x % 2 === 0) x /= 2;
          while (x % 5 === 0) x /= 5;
          const term = x === 1;
          return mcq(r, `Without long division, decide: what kind of decimal is ${pn2}/${q}?`, term ? 'Terminating' : 'Non-terminating recurring', [term ? 'Non-terminating recurring' : 'Terminating', 'Non-terminating non-recurring'],
            ['The fraction is already in lowest terms.', `Factorise the denominator: ${q} = ${pfs(q)}.`, 'Are 2 and 5 the only primes?'],
            [`${q} = ${pfs(q)}`, term ? 'Only 2s and 5s, so the decimal terminates.' : 'It has a prime other than 2 and 5, so the decimal recurs forever.'],
            [['wrong', 'Reduce, then factorise the denominator: only 2s and 5s means terminating, any other prime means recurring. A fraction never gives a non-recurring decimal.']]);
        }),
        tp('places', (r) => {
          const m = r.int(0, 4), n = r.int(0, 4);
          const q = 2 ** m * 5 ** n;
          if (q === 1) return typed('How many decimal places does 7/8 have when written as a decimal?', num(3), ['8 = 2³'], ['8 = 2³, so 3 places: 7/8 = 0.875']);
          const top = r.pick([1, 3, 7, 9, 11, 13, 17, 19, 21, 23].filter((t) => gcd(t, q) === 1));
          const k = Math.max(m, n);
          return typed(`How many decimal places does ${top}/${q} have when written as a decimal?`, num(k),
            [`Factorise ${q} into 2s and 5s.`, `${q} = ${pfs(q)}`, 'The number of places is the larger of the two powers.'],
            [`${q} = ${pfs(q)}`, `Larger power = ${k}`, `${top}/${q} = ${rd(top / q, 8)} (${k} decimal places)`],
            [[String(m + n), 'Do not add the powers. Only the larger power matters.']]);
        }),
        tp('recurring', (r) => {
          const two = r.next() < 0.6;
          let ab = two ? r.int(10, 98) : r.int(1, 8);
          while (two && ab % 11 === 0) ab = r.int(10, 98);
          const den = two ? 99 : 9;
          const shown = two ? `0.${ab}${ab}${ab}…` : `0.${ab}${ab}${ab}${ab}…`;
          return typed(`Write ${shown} as a fraction p/q.`, frac(ab, den),
            ['Let x equal the decimal.', two ? 'Two digits repeat, so multiply by 100.' : 'One digit repeats, so multiply by 10.', `Subtract to get ${den}x = ${ab}.`],
            [`x = ${shown}`, `${den + 1}x = ${ab}.${two ? `${ab}${ab}` : `${ab}${ab}${ab}`}…`, `${den}x = ${ab}`, `x = ${ab}/${den}${fr(ab, den) !== `${ab}/${den}` ? ` = ${fr(ab, den)}` : ''}`],
            [[`${ab}/${two ? 100 : 10}`, `That fraction is ${ab / (two ? 100 : 10)}, which stops. A repeating decimal needs 9s in the denominator.`]]);
        }, 2),
        tp('value', (r) => {
          const m = r.int(1, 4), n = r.int(0, 3);
          const q = 2 ** m * 5 ** n;
          const top = r.pick([1, 3, 7, 9, 11, 13].filter((t) => gcd(t, q) === 1 && t < q));
          const k = Math.max(m, n);
          const mult = 10 ** k / q;
          return typed(`Write ${top}/${q} as a decimal by making the denominator a power of 10.`, num(rd(top / q, 8)),
            [`${q} = ${pfs(q)}`, `Multiply top and bottom by ${mult} to get a denominator of ${10 ** k}.`],
            [`${top}/${q} = (${top} × ${mult})/(${q} × ${mult}) = ${top * mult}/${10 ** k}`, `= ${rd(top / q, 8)}`]);
        }),
      ],
    },
    {
      id: 'ts10.m.real.irr', title: 'Irrational numbers', prereqs: ['ts10.m.real.decimal'],
      intro: [
        h('Numbers that refuse to be fractions'),
        p('A square tile in your classroom is 1 m on each side. Its diagonal is √2 m (by Pythagoras). Try as hard as you like — no fraction p/q equals √2 exactly. Numbers like this are called irrational.'),
        def('Rational number', 'A number that can be written as p/q, where p and q are integers and q ≠ 0. Its decimal terminates or recurs.'),
        def('Irrational number', 'A real number that cannot be written as p/q. Its decimal goes on forever WITHOUT repeating, e.g. √2 = 1.41421356…, π = 3.14159265…'),
        h('How do we know √2 is irrational? Proof by contradiction'),
        stepsB(
          'Suppose √2 IS rational: √2 = a/b with a, b co-prime integers (no common factor), b ≠ 0.',
          'Square both sides: 2 = a²/b², so a² = 2b². So 2 divides a², and therefore 2 divides a (2 is prime).',
          'Write a = 2c. Then 4c² = 2b², so b² = 2c². So 2 divides b too.',
          'Now 2 divides both a and b — but we said they had no common factor. Contradiction!',
          'So our assumption was false: √2 is irrational.',
        ),
        p('The same argument works for √p for any prime p (√3, √5, √7 …) using the fact: if a prime p divides a², then p divides a.'),
        h('Rules that save time'),
        p('rational + irrational = irrational (e.g. 3 + √5). Non-zero rational × irrational = irrational (e.g. 2√3). But two irrationals can combine to a rational: √2 × √8 = √16 = 4, and (2 + √3)(2 − √3) = 4 − 3 = 1.'),
        keys('Rational: terminating or recurring decimal.', 'Irrational: non-terminating, non-recurring decimal.', '√p is irrational for every prime p.', 'Rational + irrational is irrational; non-zero rational × irrational is irrational.'),
        remember('22/7 is NOT π. It is a rational approximation (3.142857…); π itself is irrational.'),
        tip('To prove 3 + 2√5 is irrational, assume it is rational, rearrange to get √5 = (rational), and reach a contradiction.'),
      ],
      examples: [
        ex('Prove that 3 + 2√5 is irrational.', ['Suppose 3 + 2√5 = r, a rational number.', 'Then √5 = (r − 3)/2.', 'The right side is rational (rationals are closed under − and ÷).', 'But √5 is irrational — contradiction.', 'So 3 + 2√5 is irrational.'], 'Irrational'),
        ex('Is (√3 + √2)(√3 − √2) rational or irrational?', ['Use (a + b)(a − b) = a² − b²', '= 3 − 2 = 1'], 'Rational (it equals 1)'),
        ex('Classify 0.1010010001… (one more 0 each time).', ['The digits never stop.', 'No block repeats, because the gaps keep growing.'], 'Irrational'),
      ],
      practice: [
        tp('tap', (r) => {
          const irr = ['√2', 'π', '0.1010010001…', '2 + √3', '√7', '−√11', '6/√3', '5√2', '√3 + 1'];
          const rat = ['√9', '3/7', '0.272727…', '√16', '1.732', '(√2)²', '22/7', '2√2 − √8', '√3 × √12', '0'];
          const pick = [...r.shuffle(irr).slice(0, 3).map((label) => ({ label, ok: true })), ...r.shuffle(rat).slice(0, 3).map((label) => ({ label, ok: false }))];
          return {
            type: 'tap', prompt: 'Tap every IRRATIONAL number.', ...tapAll(r, pick),
            hints: ['Simplify first: √16 = 4, (√2)² = 2, √3 × √12 = 6.', 'A terminating or repeating decimal is rational.'],
            solution: [`Irrational: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`, `Rational: ${pick.filter((x) => !x.ok).map((x) => x.label).join(', ')}`],
            mistakes: [{ when: 'wrong', explain: '22/7 and 1.732 are rational approximations of π and √3, not the numbers themselves.' }],
          };
        }),
        bank('rules', [
          { q: 'The sum of a rational number and an irrational number is:', a: 'always irrational', w: ['always rational', 'sometimes rational', 'always an integer'], h: ['If r + x were rational, x = (rational) − r would be rational.'], s: ['Rational + irrational is always irrational.'] },
          { q: 'The product of two irrational numbers is:', a: 'sometimes rational, sometimes irrational', w: ['always irrational', 'always rational', 'never an integer'], h: ['Try √2 × √2 and √2 × √3.'], s: ['√2 × √2 = 2 (rational) but √2 × √3 = √6 (irrational).'] },
          { q: 'The decimal expansion of an irrational number is:', a: 'non-terminating and non-recurring', w: ['terminating', 'non-terminating recurring', 'always ending in 0'], h: ['Terminating and recurring decimals are rational.'], s: ['Irrational numbers have decimals that never end and never repeat.'] },
          { q: 'In the proof that √2 is irrational, we assume √2 = a/b where:', a: 'a and b are co-prime integers, b ≠ 0', w: ['a and b are both even', 'a = b', 'a and b are irrational'], h: ['We want the fraction in lowest terms.'], s: ['Assuming lowest terms (co-prime) is what leads to the contradiction.'] },
          { q: 'If a prime p divides a², then:', a: 'p divides a', w: ['p divides a only if a is even', 'a divides p', 'p² divides a'], h: ['This follows from unique prime factorisation.'], s: ['The primes of a² are the primes of a, so p must already divide a.'] },
          { q: 'π is:', a: 'irrational', w: ['rational because π = 22/7', 'a terminating decimal', 'a recurring decimal'], h: ['22/7 is only an approximation.'], s: ['π = 3.14159… never ends or repeats, so it is irrational.'] },
          { q: 'Which of these is rational?', a: '(2 + √3)(2 − √3)', w: ['2 + √3', '√3/2', '2√3'], h: ['Use (a + b)(a − b) = a² − b².'], s: ['(2 + √3)(2 − √3) = 4 − 3 = 1, which is rational.'] },
        ]),
        tp('conjugate', (r) => {
          const a = r.int(2, 9), b = r.pick([2, 3, 5, 6, 7, 10, 11]);
          return typed(`Find the value of (${a} + √${b})(${a} − √${b}). (Two irrationals can multiply to a rational!)`, num(a * a - b),
            ['Use (x + y)(x − y) = x² − y².', `x = ${a}, y = √${b}, so y² = ${b}.`],
            [`(${a} + √${b})(${a} − √${b}) = ${a}² − (√${b})²`, `= ${a * a} − ${b} = ${a * a - b}`],
            [[String(a * a + b), 'The middle terms cancel and the last term is −(√b)², so subtract.']]);
        }),
      ],
    },
    {
      id: 'ts10.m.real.log', title: 'Exponentials and logarithms', prereqs: ['ts10.m.real.fta'],
      intro: [
        h('Asking "how many times?"'),
        p('A bacteria colony doubles every hour. Starting from 1, after how many hours are there 1024 bacteria? We need 2 × 2 × … = 1024, i.e. 2ⁿ = 1024. The logarithm answers exactly this question: n = log₂ 1024 = 10.'),
        def('Exponential form', 'aⁿ = x: the base a is multiplied n times to give x.'),
        def('Logarithm', 'If aⁿ = x (with a > 0, a ≠ 1, x > 0) then logₐ x = n. The logarithm is the POWER you must raise a to, to get x.'),
        f('aⁿ = x  ⇔  logₐ x = n', 'a to the n equals x means log base a of x equals n'),
        p('Two facts follow at once: logₐ a = 1 (because a¹ = a) and logₐ 1 = 0 (because a⁰ = 1).'),
        h('The three laws of logarithms'),
        f('logₐ(xy) = logₐ x + logₐ y;  logₐ(x/y) = logₐ x − logₐ y;  logₐ(xᵐ) = m logₐ x'),
        p('These come from the laws of exponents: multiplying powers ADDS the exponents, so the log of a product is the SUM of the logs.'),
        X({
          title: 'What if? How many times must a be multiplied to reach x?', formula: 'n = logₐ x',
          result: ['n', 'Logarithm (the power)', 'ln(x) / ln(a)', '', 3],
          vars: [['a', 'Base', 2, 10, 1, 2], ['x', 'Number', 1, 1024, 1, 64]],
          notes: [
            ['x', 'A bigger target needs more multiplications, but slowly: multiplying x by a adds only 1 to the log.', 'A smaller target needs fewer multiplications. At x = 1 the log is 0, because a⁰ = 1.'],
            ['a', 'A bigger base reaches the target in fewer multiplications, so the log gets smaller.', 'A smaller base needs more multiplications to reach the same target, so the log grows.'],
          ],
          mistakes: [
            ['log(x + y) = log x + log y', 'The product law is for MULTIPLYING: log(xy) = log x + log y. There is no simple law for log(x + y).'],
            ['log x ÷ log y = log(x/y)', 'The quotient law is log(x/y) = log x − log y (a subtraction, not a division).'],
            ['Taking the log of 0 or a negative number', 'No power of a positive base gives 0 or a negative number, so these logs are undefined.'],
          ],
          real: 'The Richter scale is logarithmic: a magnitude 7 earthquake shakes the ground 10 times more than magnitude 6, because log₁₀ goes up by 1 each time the shaking is multiplied by 10.',
        }),
        keys('logₐ x = n means aⁿ = x.', 'logₐ a = 1, logₐ 1 = 0.', 'Product → add, quotient → subtract, power → multiply.', 'Logs exist only for positive x, with base a > 0 and a ≠ 1.'),
        remember('log 343/125 = 3 log 7 − 3 log 5: first quotient law, then power law.'),
      ],
      examples: [
        ex('Find log₂ 32.', ['Ask: 2 to what power is 32?', '2⁵ = 32'], 'log₂ 32 = 5'),
        ex('Expand log(343/125).', ['log(343/125) = log 343 − log 125', '343 = 7³ and 125 = 5³', '= 3 log 7 − 3 log 5'], '3 log 7 − 3 log 5'),
        ex('Write 10⁻² = 0.01 in logarithmic form.', ['Base 10, power −2, result 0.01'], 'log₁₀ 0.01 = −2'),
      ],
      practice: [
        tp('eval', (r) => {
          const a = r.pick([2, 3, 5, 10, 4]);
          const maxK = a === 2 ? 10 : a === 3 ? 6 : a === 4 ? 5 : a === 5 ? 4 : 5;
          const k = r.int(-2, maxK);
          const x = k >= 0 ? `${a ** k}` : `1/${a ** -k}`;
          const sub = subN(a);
          return typed(`Find log${sub} ${x}.`, num(k),
            [`Ask: ${a} raised to what power gives ${x}?`, k < 0 ? 'A fraction 1/aᵏ means a negative power: a⁻ᵏ.' : `Write ${x} as a power of ${a}.`],
            [`${x} = ${a}${k < 0 ? '⁻' + SUP[-k] : k === 1 ? '¹' : k === 0 ? '⁰' : SUP[k]}`, `So log${sub} ${x} = ${n_(k)}`],
            [[x, 'That is the number itself. The log is the POWER.'], [String(-k), 'Check the sign: a fraction below 1 has a negative log.']]);
        }),
        tp('laws', (r) => {
          const a = r.pick([2, 3]);
          const sub = a === 2 ? '₂' : '₃';
          const p1 = r.int(1, a === 2 ? 7 : 4), p2 = r.int(1, a === 2 ? 6 : 4);
          const add = r.next() < 0.5;
          const ans = add ? p1 + p2 : p1 - p2;
          return typed(`Evaluate log${sub} ${a ** p1} ${add ? '+' : '−'} log${sub} ${a ** p2}.`, num(ans),
            [`log${sub} ${a ** p1} = ${p1} because ${a}${p1 === 1 ? '' : SUP[p1]} = ${a ** p1}.`, add ? 'Or use the product law: it equals the log of the product.' : 'Or use the quotient law: it equals the log of the quotient.'],
            [`log${sub} ${a ** p1} = ${p1}`, `log${sub} ${a ** p2} = ${p2}`, `${add ? 'Sum' : 'Difference'} = ${n_(ans)}`]);
        }),
        tp('form', (r) => {
          const a = r.pick([2, 3, 5, 7]);
          const k = r.int(2, 4);
          const x = a ** k;
          return mcq(r, `Write ${a}${SUP[k]} = ${x} in logarithmic form.`, `log${subN(a)} ${x} = ${k}`, [`log${subN(a)} ${k} = ${x}`, `log${subN(k)} ${x} = ${a}`, `log${subN(x)} ${a} = ${k}`],
            ['The base of the power stays the base of the log.', 'The log equals the POWER.'],
            [`Base ${a}, power ${k}, result ${x}`, `So log base ${a} of ${x} = ${k}: log${subN(a)} ${x} = ${k}`],
            [['wrong', 'In aⁿ = x the base is a and the answer of the log is the power n: logₐ x = n.']]);
        }),
        bank('law-mcq', [
          { q: 'log 6 + log 5 equals:', a: 'log 30', w: ['log 11', 'log 6 × log 5', 'log 1.2'], h: ['Product law: log x + log y = log(xy).'], s: ['log 6 + log 5 = log(6 × 5) = log 30'] },
          { q: 'log 72 − log 8 equals:', a: 'log 9', w: ['log 64', 'log 72 ÷ log 8', 'log 576'], h: ['Quotient law: log x − log y = log(x/y).'], s: ['log 72 − log 8 = log(72/8) = log 9'] },
          { q: '2 log 5 equals:', a: 'log 25', w: ['log 10', 'log 7', '(log 5)²'], h: ['Power law: m log x = log xᵐ.'], s: ['2 log 5 = log 5² = log 25'] },
          { q: 'log₇ 1 equals:', a: '0', w: ['1', '7', 'undefined'], h: ['7 to what power is 1?'], s: ['7⁰ = 1, so log₇ 1 = 0.'] },
          { q: 'log₁₀ 10 equals:', a: '1', w: ['0', '10', '100'], h: ['10 to what power is 10?'], s: ['10¹ = 10, so log₁₀ 10 = 1.'] },
          { q: 'Which logarithm is NOT defined?', a: 'log₁₀(−100)', w: ['log₁₀ 0.1', 'log₂ 1', 'log₃ 27'], h: ['Can a positive base raised to a power be negative?'], s: ['Every power of 10 is positive, so the log of a negative number is undefined.'] },
          { q: 'log₂ 8 + log₂ 4 equals:', a: '5', w: ['12', '32', '6'], h: ['log₂ 8 = 3 and log₂ 4 = 2.'], s: ['3 + 2 = 5 (also log₂ 32 = 5).'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 2 SETS
const LETTERS = 'abcdefgh';
const setStr = (xs: (number | string)[]) => (xs.length ? `{${xs.join(', ')}}` : 'φ');
const ch2: USpec = {
  id: 'ts10.m.ch2', subject: 'math', title: 'Sets', source: src(2),
  objectives: [
    {
      id: 'ts10.m.sets.basics', title: 'Sets, elements, empty and universal sets',
      intro: [
        h('Collections with clear membership'),
        p('Your class attendance register, the districts of Telangana, the players in a kabaddi team — each is a collection where you can say clearly whether something belongs or not. Mathematics calls such a collection a set.'),
        def('Set', 'A well-defined collection of objects. "Well-defined" means that for any object we can say for certain whether it is in the collection or not.'),
        p('"The tall students of my class" is NOT a set: different people have different ideas of "tall". "Students of my class taller than 160 cm" IS a set.'),
        def('Element (∈)', 'An object in a set. We write 3 ∈ A ("3 belongs to A") and 4 ∉ A ("4 does not belong to A").'),
        h('Two ways to write a set'),
        p('Roster form lists the elements inside curly brackets: V = {a, e, i, o, u}. Each element is written only once, and order does not matter.'),
        p('Set-builder form describes the rule: V = {x : x is a vowel of the English alphabet}. Read the colon as "such that".'),
        def('Empty set (φ or { })', 'A set with no elements, e.g. {x : x is a natural number less than 1}.'),
        def('Universal set (U)', 'The set of everything being discussed in a problem. For a question about digits, U = {0, 1, 2, …, 9}.'),
        def('Subset (A ⊆ B)', 'Every element of A is also an element of B. The empty set and B itself are always subsets of B.'),
        f('A set with n elements has 2ⁿ subsets', 'two to the power n subsets'),
        p('Why 2ⁿ? Build a subset by going through the elements one by one and deciding "in" or "out" — 2 choices for each element, so 2 × 2 × … × 2 = 2ⁿ ways.'),
        X({
          title: 'What if? Count the subsets', formula: 'number of subsets = 2ⁿ',
          result: ['S', 'Number of subsets', '2^n'],
          vars: [['n', 'Number of elements', 0, 10, 1, 3]],
          notes: [['n', 'Each new element can be in or out of every old subset, so the count DOUBLES.', 'Removing an element halves the number of subsets.']],
          mistakes: [
            ['Answering 2n instead of 2ⁿ', 'For {a, b, c}: 2 × 3 = 6, but there are 8 subsets: φ, {a}, {b}, {c}, {a, b}, {a, c}, {b, c}, {a, b, c}.'],
            ['Forgetting φ and the set itself', 'Both always count as subsets.'],
            ['Thinking {0} is empty', '{0} has one element, the number 0. The empty set has none.'],
          ],
          real: 'A pizza shop offering 5 toppings can make 2⁵ = 32 different topping combinations (including a plain pizza).',
        }),
        keys('A set must be well-defined.', 'Roster form lists; set-builder form describes.', 'φ has no elements; U contains everything under discussion.', 'n elements → 2ⁿ subsets.'),
        remember('φ, {0} and {φ} are all different: φ has no elements, {0} has the element 0, and {φ} has one element — the empty set.'),
      ],
      examples: [
        ex('Write A = {x : x is a prime number less than 20} in roster form.', ['Primes below 20: 2, 3, 5, 7, 11, 13, 17, 19'], 'A = {2, 3, 5, 7, 11, 13, 17, 19}'),
        ex('List all subsets of {p, q}.', ['Choose in/out for p and for q: 2 × 2 = 4 subsets', 'φ, {p}, {q}, {p, q}'], 'φ, {p}, {q}, {p, q}'),
        ex('Is B = {x : x is a natural number and 2x + 1 = 4} empty?', ['2x + 1 = 4 gives x = 3/2', '3/2 is not a natural number'], 'Yes, B = φ'),
      ],
      practice: [
        bank('well-defined', [
          { q: 'Is "the collection of districts of Telangana" a set?', a: 'Yes, it is well-defined', w: ['No, it is not well-defined'], h: ['Can everyone agree on what belongs?'], s: ['The districts are officially listed, so membership is clear.'] },
          { q: 'Is "the collection of good cricketers in Hyderabad" a set?', a: 'No, it is not well-defined', w: ['Yes, it is well-defined'], h: ['Who decides what "good" means?'], s: ['"Good" is a matter of opinion, so membership is not clear.'] },
          { q: 'Is "the collection of vowels in the English alphabet" a set?', a: 'Yes, it is well-defined', w: ['No, it is not well-defined'], h: ['Can everyone agree on what belongs?'], s: ['{a, e, i, o, u} — membership is clear.'] },
          { q: 'Is "the collection of tall students in your class" a set?', a: 'No, it is not well-defined', w: ['Yes, it is well-defined'], h: ['How tall is "tall"?'], s: ['"Tall" is not precise, so this is not a set.'] },
          { q: 'Is "the collection of even numbers between 1 and 11" a set?', a: 'Yes, it is well-defined', w: ['No, it is not well-defined'], h: ['List them.'], s: ['{2, 4, 6, 8, 10} — membership is clear.'] },
          { q: 'Is "the collection of beautiful flowers in a garden" a set?', a: 'No, it is not well-defined', w: ['Yes, it is well-defined'], h: ['Is beauty measurable?'], s: ['"Beautiful" depends on opinion, so this is not a set.'] },
          { q: 'Is "the collection of months having 31 days" a set?', a: 'Yes, it is well-defined', w: ['No, it is not well-defined'], h: ['Check a calendar.'], s: ['Jan, Mar, May, Jul, Aug, Oct, Dec — membership is clear.'] },
        ]),
        tp('roster-count', (r) => {
          const k = r.int(2, 9), N = r.int(15, 60);
          const els = Array.from({ length: Math.floor(N / k) }, (_, i) => k * (i + 1));
          return typed(`How many elements does A = {x : x is a natural number, x ≤ ${N} and x is a multiple of ${k}} have?`, num(els.length),
            ['Write the set in roster form.', `Start at ${k} and keep adding ${k} without going past ${N}.`],
            [`A = {${els.slice(0, 4).join(', ')}${els.length > 4 ? ', …, ' + els[els.length - 1] : ''}}`, `${N} ÷ ${k} = ${(N / k).toFixed(2)} → ${els.length} multiples`],
            [[String(els.length + 1), 'Do not count 0 — natural numbers start at 1.']]);
        }),
        tp('subsets', (r) => {
          const n = r.int(1, 6);
          const set = LETTERS.slice(0, n).split('');
          return typed(`How many subsets does ${setStr(set)} have?`, num(2 ** n),
            ['Each element is either in or out of a subset.', `That is 2 choices for each of ${n} element${n > 1 ? 's' : ''}.`],
            [`Number of subsets = 2${SUP[n] || '¹'} = ${2 ** n}`, 'This includes φ and the set itself.'],
            [[String(2 * n), 'Not 2 × n: the choices multiply, 2 × 2 × … , giving 2ⁿ.'], [String(2 ** n - 1), 'Remember to count the empty set φ as well.']]);
        }),
        bank('symbols', [
          { q: 'True or false: 3 ∈ {1, 3, 5, 7}', a: 'True', w: ['False'], h: ['∈ means "is an element of".'], s: ['3 is listed in the set, so it is true.'] },
          { q: 'True or false: {2} ∈ {1, 2, 3}', a: 'False', w: ['True'], h: ['Is the SET {2} listed as an element?'], s: ['The element is 2, not the set {2}. Correct statement: {2} ⊆ {1, 2, 3}.'] },
          { q: 'True or false: φ ⊆ {a, b}', a: 'True', w: ['False'], h: ['The empty set has no element that could fail.'], s: ['φ is a subset of every set.'] },
          { q: 'True or false: {x : x is a natural number less than 1} = φ', a: 'True', w: ['False'], h: ['Natural numbers start at 1.'], s: ['No natural number is less than 1, so the set is empty.'] },
          { q: 'True or false: {0} is the empty set.', a: 'False', w: ['True'], h: ['Count the elements of {0}.'], s: ['{0} has one element (zero), so it is not empty.'] },
          { q: 'True or false: {a, b} ⊆ {a, b, c}', a: 'True', w: ['False'], h: ['Is every element of the first set inside the second?'], s: ['Both a and b are in {a, b, c}.'] },
          { q: 'True or false: {x : x² = 4, x is an even integer} is empty.', a: 'False', w: ['True'], h: ['Solve x² = 4.'], s: ['x = 2 or −2, both even, so the set is {−2, 2}.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.sets.kinds', title: 'Equal, finite and infinite sets; cardinality', prereqs: ['ts10.m.sets.basics'],
      intro: [
        h('Comparing and counting sets'),
        p('The letters of FOLLOW and the letters of WOLF look different as words, but as sets they are the same: {F, O, L, W}. Repeats and order do not matter in a set.'),
        def('Equal sets (A = B)', 'Two sets with exactly the same elements. Every element of A is in B and every element of B is in A.'),
        def('Finite set', 'A set whose elements can be counted and the counting ends, e.g. the days of a week.'),
        def('Infinite set', 'A set whose elements can never be counted to an end, e.g. the natural numbers {1, 2, 3, …}.'),
        def('Cardinal number n(A)', 'The number of distinct elements in a finite set A. n(φ) = 0.'),
        p('To find n(A) for a word, list each letter once: TELANGANA → {T, E, L, A, N, G}, so n = 6, even though the word has 9 letters.'),
        p('For a range of whole numbers, count carefully at the ends. {x : x ∈ N, 3 ≤ x ≤ 10} has 10 − 3 + 1 = 8 elements, but {x : 3 < x < 10} has 10 − 3 − 1 = 6.'),
        f('number of integers from a to b inclusive = b − a + 1'),
        X({
          title: 'What if? Count whole numbers in a range', formula: 'n = b − a + 1 (both ends included)',
          result: ['n', 'Number of elements', 'b - a + 1'],
          vars: [['a', 'First number', 1, 50, 1, 3], ['b', 'Last number', 50, 100, 1, 60]],
          notes: [
            ['a', 'Starting later leaves fewer numbers in the range.', 'Starting earlier adds numbers to the range.'],
            ['b', 'Ending later adds one element for each step.', 'Ending earlier removes elements.'],
          ],
          mistakes: [
            ['Using b − a', 'From 3 to 10 there are 8 numbers (3, 4, …, 10), not 7. Both ends count, so add 1.'],
            ['Forgetting that < excludes the end', 'For 3 < x < 10 neither 3 nor 10 is included: 10 − 3 − 1 = 6.'],
            ['Counting repeated letters', 'In a set each element counts once: n({B, A, N, A, N, A}) = 3.'],
          ],
          real: 'If you read pages 45 to 72 of a book tonight, you read 72 − 45 + 1 = 28 pages.',
        }),
        keys('Order and repetition do not change a set.', 'Equal sets have exactly the same elements.', 'Finite: counting ends. Infinite: it never ends.', 'n(A) counts distinct elements; n(φ) = 0.'),
        remember('n(A) is defined for finite sets. A set like {1, 2, 3, …} is infinite, so we do not give it a number of elements.'),
      ],
      examples: [
        ex('Are A = {letters of FOLLOW} and B = {letters of WOLF} equal?', ['A = {F, O, L, W}', 'B = {W, O, L, F}', 'Same elements'], 'Yes, A = B'),
        ex('Find n(A) for A = {x : x is a letter of HYDERABAD}.', ['Distinct letters: H, Y, D, E, R, A, B'], 'n(A) = 7'),
        ex('Is the set of points on a line finite or infinite?', ['Between any two points there is always another point.'], 'Infinite'),
      ],
      practice: [
        tp('card-word', (r) => {
          const w = r.pick(['TELANGANA', 'HYDERABAD', 'WARANGAL', 'MATHEMATICS', 'GODAVARI', 'KRISHNA', 'MISSISSIPPI', 'BANANA', 'KARIMNAGAR', 'NIZAMABAD', 'BATHUKAMMA']);
          const s = [...new Set(w.split(''))];
          return typed(`A is the set of letters of the word ${w}. Find n(A).`, num(s.length),
            ['Write each letter only once.', 'Order does not matter, repeats are ignored.'],
            [`A = {${s.join(', ')}}`, `n(A) = ${s.length}`],
            [[String(w.length), `${w} has ${w.length} letters, but repeated letters count only once in a set.`]]);
        }),
        bank('finite', [
          { q: 'Is the set of natural numbers finite or infinite?', a: 'Infinite', w: ['Finite'], h: ['Is there a largest natural number?'], s: ['You can always add 1, so it never ends.'] },
          { q: 'Is the set of days in a week finite or infinite?', a: 'Finite', w: ['Infinite'], h: ['Count them.'], s: ['There are 7 days.'] },
          { q: 'Is the set of people living in Telangana today finite or infinite?', a: 'Finite', w: ['Infinite'], h: ['A very large number is still a number.'], s: ['The number is huge but countable, so the set is finite.'] },
          { q: 'Is {x : x is a multiple of 5} finite or infinite?', a: 'Infinite', w: ['Finite'], h: ['Is there a largest multiple of 5?'], s: ['5, 10, 15, … goes on forever.'] },
          { q: 'Is the set of factors of 120 finite or infinite?', a: 'Finite', w: ['Infinite'], h: ['Factors cannot be bigger than 120.'], s: ['120 has 16 factors — a finite set.'] },
          { q: 'Is the set of lines passing through a given point finite or infinite?', a: 'Infinite', w: ['Finite'], h: ['Rotate a line about the point.'], s: ['Every direction gives a new line, so there are infinitely many.'] },
          { q: 'Is the set of rivers in India finite or infinite?', a: 'Finite', w: ['Infinite'], h: ['Could you list them all, given time?'], s: ['The list is long but it ends.'] },
        ]),
        tp('equal', (r) => {
          const pool = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          const A = pool.slice(0, r.int(3, 5));
          const same = r.next() < 0.5;
          const extra = pool[6];
          const Bbase = same ? [...A, A[0]] : [...A.slice(1), extra];
          const B = r.shuffle(Bbase);
          return mcq(r, `Are A = ${setStr(A)} and B = ${setStr(B)} equal sets?`, same ? 'Yes, they are equal' : 'No, they are not equal', [same ? 'No, they are not equal' : 'Yes, they are equal'],
            ['Ignore order and ignore repeats.', 'Check every element of A is in B and every element of B is in A.'],
            same ? [`B without repeats is {${[...new Set(B)].sort((x, y) => x - y).join(', ')}}, which has the same elements as A.`] : [`${A[0]} ∈ A but ${A[0]} ∉ B (and ${extra} ∈ B but ${extra} ∉ A).`],
            [['wrong', 'Repeats and order never matter. Only the distinct elements decide equality.']]);
        }),
        tp('card-range', (r) => {
          const a = r.int(2, 20), b = a + r.int(5, 30);
          const kind = r.int(0, 2);
          const n = kind === 0 ? b - a + 1 : kind === 1 ? b - a - 1 : b - a;
          const cond = kind === 0 ? `${a} ≤ x ≤ ${b}` : kind === 1 ? `${a} < x < ${b}` : `${a} ≤ x < ${b}`;
          return typed(`Find n(A) if A = {x : x is a natural number and ${cond}}.`, num(n),
            ['Check whether each end is included (≤) or excluded (<).', `From ${a} to ${b} inclusive there are ${b} − ${a} + 1 = ${b - a + 1} numbers.`],
            [`Inclusive count = ${b - a + 1}`, kind === 0 ? 'Both ends included.' : kind === 1 ? 'Both ends excluded: subtract 2.' : `${b} is excluded: subtract 1.`, `n(A) = ${n}`],
            kind === 2 ? [[String(b - a + 1), `${b} is not included because of "<".`]] : [[String(b - a), 'Count both ends carefully; b − a is usually off by one.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.sets.ops', title: 'Union, intersection, difference and Venn diagrams', prereqs: ['ts10.m.sets.kinds'],
      intro: [
        h('Combining sets'),
        p('In a class, some students play cricket (set C) and some play kabaddi (set K). Who plays at least one game? Who plays both? Who plays only cricket? Set operations answer these questions.'),
        def('Union A ∪ B', 'All elements that are in A, or in B, or in both. {1, 2, 3} ∪ {3, 4} = {1, 2, 3, 4}.'),
        def('Intersection A ∩ B', 'Elements that are in BOTH A and B. {1, 2, 3} ∩ {3, 4} = {3}.'),
        def('Difference A − B', 'Elements in A that are NOT in B. {1, 2, 3} − {3, 4} = {1, 2}. Note: B − A = {4} is different.'),
        def('Disjoint sets', 'Sets with no common element: A ∩ B = φ.'),
        h('Venn diagrams'),
        p('Draw a rectangle for the universal set U and a circle for each set. The overlap of two circles is A ∩ B; everything inside either circle is A ∪ B; the part of A outside B is A − B.'),
        vis({ kind: 'emoji', text: '🟦 A only  |  🟪 A ∩ B  |  🟥 B only  |  ⬜ outside both' }, 'Venn diagram regions: A only, both, B only, neither'),
        h('Counting with a Venn diagram'),
        p('If we add n(A) and n(B), the people in BOTH sets are counted twice. Subtract them once:'),
        f('n(A ∪ B) = n(A) + n(B) − n(A ∩ B)', 'n of A union B equals n of A plus n of B minus n of A intersection B'),
        X({
          title: 'What if? Students playing cricket or kabaddi', formula: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)',
          result: ['U', 'Students playing at least one game', 'a + b - c'],
          vars: [['a', 'n(A): play cricket', 0, 40, 1, 25], ['b', 'n(B): play kabaddi', 0, 40, 1, 20], ['c', 'n(A ∩ B): play both', 0, 20, 1, 8]],
          notes: [
            ['a', 'More cricket players (with the same overlap) means more students play at least one game.', 'Fewer cricket players means fewer in the union.'],
            ['b', 'More kabaddi players add to the union.', 'Fewer kabaddi players shrink the union.'],
            ['c', 'A bigger overlap means more students were counted twice in a + b, so the union is SMALLER.', 'A smaller overlap means fewer double-counts, so the union is bigger.'],
          ],
          mistakes: [
            ['Just adding n(A) + n(B)', 'Students who play both games get counted twice. Subtract n(A ∩ B) once.'],
            ['Overlap bigger than one of the sets', 'n(A ∩ B) can never exceed n(A) or n(B) — the overlap lives inside both circles.'],
            ['Thinking A − B = B − A', 'A − B is "A only", B − A is "B only"; they are usually different.'],
          ],
          real: 'A school surveying 40 students finds 25 like cricket, 20 like kabaddi and 8 like both: 37 like at least one, so 3 like neither.',
        }),
        keys('∪ = or (everything), ∩ = and (common part), A − B = in A but not B.', 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B).', 'n(A only) = n(A) − n(A ∩ B).', 'Neither = total − n(A ∪ B).'),
        remember('If A ∩ B = φ (disjoint), then n(A ∪ B) = n(A) + n(B).'),
        tip('In word problems, fill the overlap of the Venn diagram FIRST, then the "only" parts, then the outside.'),
      ],
      examples: [
        ex('A = {1, 2, 3, 4, 5}, B = {4, 5, 6, 7}. Find A ∪ B, A ∩ B, A − B and B − A.', ['A ∪ B = {1, 2, 3, 4, 5, 6, 7}', 'A ∩ B = {4, 5}', 'A − B = {1, 2, 3}', 'B − A = {6, 7}'], 'See steps'),
        ex('In a class of 40, 25 play cricket, 20 play kabaddi and 8 play both. How many play neither?', ['n(C ∪ K) = 25 + 20 − 8 = 37', 'Neither = 40 − 37 = 3'], '3 students'),
      ],
      practice: [
        tp('ops-count', (r) => {
          const pool = r.shuffle(Array.from({ length: 12 }, (_, i) => i + 1));
          const common = pool.slice(0, r.int(1, 3));
          const onlyA = pool.slice(3, 3 + r.int(1, 4));
          const onlyB = pool.slice(7, 7 + r.int(1, 4));
          const A = [...common, ...onlyA].sort((x, y) => x - y), B = [...common, ...onlyB].sort((x, y) => x - y);
          const op = r.pick(['∪', '∩', 'A − B', 'B − A'] as const);
          const res = (op === '∪' ? [...A, ...onlyB] : op === '∩' ? common : op === 'A − B' ? onlyA : onlyB).sort((x, y) => x - y);
          const label = op === '∪' ? 'A ∪ B' : op === '∩' ? 'A ∩ B' : op;
          return typed(`A = ${setStr(A)} and B = ${setStr(B)}. How many elements are in ${label}?`, num(res.length),
            [op === '∪' ? 'Combine both lists, writing common elements once.' : op === '∩' ? 'Keep only elements in both.' : `Keep elements of ${op[0]} that are not in ${op[4]}.`],
            [`${label} = ${setStr(res)}`, `n(${label}) = ${res.length}`],
            op === '∪' ? [[String(A.length + B.length), 'The common elements were counted twice. Write them only once.']] : []);
        }),
        tp('venn-word', (r) => {
          const c = r.int(3, 10), oa = r.int(5, 18), ob = r.int(5, 18), ne = r.int(0, 8);
          const total = c + oa + ob + ne;
          const ask = r.pick(['least', 'neither', 'only'] as const);
          const ans = ask === 'least' ? c + oa + ob : ask === 'neither' ? ne : oa;
          const q = ask === 'least' ? 'How many like at least one of the two?' : ask === 'neither' ? 'How many like neither?' : 'How many like ONLY biryani?';
          return typed(`In a survey of ${total} students in Karimnagar, ${oa + c} like biryani, ${ob + c} like pulihora and ${c} like both. ${q}`, num(ans),
            ['Start with the overlap: both = ' + c + '.', `Only biryani = ${oa + c} − ${c} = ${oa}; only pulihora = ${ob + c} − ${c} = ${ob}.`, `At least one = ${oa + c} + ${ob + c} − ${c}.`],
            [`n(B ∪ P) = ${oa + c} + ${ob + c} − ${c} = ${c + oa + ob}`, `Only biryani = ${oa}`, `Neither = ${total} − ${c + oa + ob} = ${ne}`, `Answer: ${ans}`],
            ask === 'least' ? [[String(oa + ob + 2 * c), 'The students who like both were counted twice. Subtract them once.']] : ask === 'only' ? [[String(oa + c), 'That includes students who like both. Subtract the overlap.']] : []);
        }, 2),
        tp('find-overlap', (r) => {
          const c = r.int(2, 15), a = c + r.int(3, 20), b = c + r.int(3, 20);
          return typed(`n(A) = ${a}, n(B) = ${b} and n(A ∪ B) = ${a + b - c}. Find n(A ∩ B).`, num(c),
            ['Use n(A ∪ B) = n(A) + n(B) − n(A ∩ B).', `${a + b - c} = ${a} + ${b} − n(A ∩ B)`],
            [`n(A ∩ B) = ${a} + ${b} − ${a + b - c} = ${c}`]);
        }),
        bank('venn-mcq', [
          { q: 'If A ∩ B = φ, the sets A and B are called:', a: 'disjoint sets', w: ['equal sets', 'universal sets', 'infinite sets'], h: ['They have nothing in common.'], s: ['Sets with no common element are disjoint.'] },
          { q: 'A − B contains the elements that are:', a: 'in A but not in B', w: ['in B but not in A', 'in both A and B', 'in neither A nor B'], h: ['Start with A and remove what is in B.'], s: ['A − B = {x : x ∈ A and x ∉ B}.'] },
          { q: 'If A ⊆ B, then A ∪ B equals:', a: 'B', w: ['A', 'φ', 'A ∩ B'], h: ['A is already inside B.'], s: ['Adding A to B adds nothing new, so A ∪ B = B.'] },
          { q: 'If A ⊆ B, then A ∩ B equals:', a: 'A', w: ['B', 'φ', 'U'], h: ['Every element of A is in B.'], s: ['The common part is all of A.'] },
          { q: 'A ∪ φ equals:', a: 'A', w: ['φ', 'U', '{φ}'], h: ['Adding nothing changes nothing.'], s: ['A ∪ φ = A.'] },
          { q: 'In a Venn diagram, the region inside A but outside B shows:', a: 'A − B', w: ['A ∩ B', 'B − A', 'A ∪ B'], h: ['These are elements of A only.'], s: ['"A only" is A − B.'] },
          { q: 'For any sets A and B, n(A ∪ B) + n(A ∩ B) equals:', a: 'n(A) + n(B)', w: ['n(A) − n(B)', 'n(U)', '2 n(A ∩ B)'], h: ['Rearrange the union formula.'], s: ['n(A ∪ B) = n(A) + n(B) − n(A ∩ B), so n(A ∪ B) + n(A ∩ B) = n(A) + n(B).'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 3 POLYNOMIALS
const ch3: USpec = {
  id: 'ts10.m.ch3', subject: 'math', title: 'Polynomials', source: src(3),
  objectives: [
    {
      id: 'ts10.m.poly.degree', title: 'Degree and value of a polynomial',
      intro: [
        h('Expressions that model real life'),
        p('A Warangal juice stall earns ₹20 on each glass but pays ₹150 a day for ice. Its profit for x glasses is p(x) = 20x − 150. The area of a square garden of side x m with a 1 m path all around is (x + 2)² = x² + 4x + 4. These expressions are polynomials.'),
        def('Polynomial', 'An expression made of terms of the form a·xⁿ where n is a whole number (0, 1, 2, …). No variable in a denominator, no square root of the variable.'),
        def('Degree', 'The highest power of the variable in the polynomial (after simplifying).'),
        p('Degree 1: linear (2x + 3). Degree 2: quadratic (x² − 5x + 6). Degree 3: cubic (x³ − 1). A non-zero constant like 7 has degree 0.'),
        p('Not polynomials: x + 1/x (power −1), √x + 2 (power ½).'),
        def('Value p(k)', 'The number you get by replacing x with k in p(x).'),
        f('p(x) = ax² + bx + c  ⇒  p(k) = a·k² + b·k + c'),
        X({
          title: 'What if? Change x and watch p(x)', formula: 'p(x) = ax² + bx + c',
          result: ['p', 'Value of the polynomial', 'a * x^2 + b * x + c', '', 2],
          vars: [['a', 'Coefficient of x²', -3, 3, 1, 1], ['b', 'Coefficient of x', -6, 6, 1, -2], ['c', 'Constant term', -10, 10, 1, -3], ['x', 'Value of x', -5, 5, 0.5, 2]],
          notes: [
            ['x', 'For a positive a, far from the middle the x² term dominates and p(x) climbs quickly.', 'Moving x back towards the turning point makes p(x) smaller (when a is positive).'],
            ['a', 'A bigger a multiplies the x² term, so far-away values of x grow much faster.', 'A negative a flips the curve upside down.'],
            ['c', 'c is added to every value: it lifts the whole graph up.', 'Lowering c moves the whole graph down by the same amount.'],
          ],
          mistakes: [
            ['(−2)² = −4', 'A negative number squared is positive: (−2)² = (−2) × (−2) = +4. Always use brackets when substituting negatives.'],
            ['Computing (a·x)² instead of a·x²', 'In 3x² only x is squared: for x = 2, 3x² = 3 × 4 = 12, not 6² = 36.'],
            ['Reading the degree from the first term', 'In 5x³ − 2x⁷ + 1 the degree is 7, not 3. Look for the highest power anywhere.'],
          ],
          real: 'Engineers evaluate polynomial models at many x values to predict a cricket ball\'s height or a bridge\'s sag.',
        }),
        keys('Powers must be whole numbers.', 'Degree = highest power.', 'p(k): substitute k for x, using brackets for negatives.'),
        remember('Simplify first: (x + 1)² − x² = 2x + 1 has degree 1, not 2.'),
      ],
      examples: [
        ex('Find the degree of 5x³ − 2x⁷ + x + 1.', ['Powers present: 3, 7, 1, 0', 'Highest is 7'], 'Degree 7'),
        ex('If p(x) = x² − 5x + 6, find p(−1).', ['p(−1) = (−1)² − 5(−1) + 6', '= 1 + 5 + 6'], 'p(−1) = 12'),
      ],
      practice: [
        tp('degree', (r) => {
          const degs = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
          const terms = degs.map((d) => ({ d, c: r.pick([-7, -5, -3, -2, 2, 3, 4, 5, 8]) }));
          const s = terms.map((t, i) => {
            const a = Math.abs(t.c);
            const body = t.d === 0 ? `${a}` : `${a}x${SUP[t.d]}`;
            return i === 0 ? `${t.c < 0 ? '−' : ''}${body}` : ` ${t.c < 0 ? '−' : '+'} ${body}`;
          }).join('');
          const deg = Math.max(...degs);
          return typed(`What is the degree of the polynomial ${s}?`, num(deg),
            ['Look at the power of x in every term.', 'The degree is the highest power, wherever it appears.'],
            [`Powers present: ${degs.join(', ')}`, `Highest = ${deg}`],
            degs[0] !== deg ? [[String(degs[0]), 'That is only the power in the FIRST term. The polynomial is not written in order.']] : []);
        }),
        tp('value', (r) => {
          const a = r.pick([1, 2, 3, -1]), b = r.int(-6, 6), c = r.int(-9, 9), k = r.pick([-3, -2, -1, 2, 3, 4]);
          const v = a * k * k + b * k + c;
          return typed(`If p(x) = ${poly([a, b, c])}, find p(${n_(k)}).`, num(v),
            ['Replace every x with ' + pn(k) + '.', `x² = ${pn(k)}² = ${k * k}.`],
            [`p(${n_(k)}) = ${a === 1 ? '' : a === -1 ? '−' : a}${pn(k)}² ${b < 0 ? '−' : '+'} ${Math.abs(b)}${pn(k)} ${c < 0 ? '−' : '+'} ${Math.abs(c)}`, `= ${a * k * k} ${b * k < 0 ? '−' : '+'} ${Math.abs(b * k)} ${c < 0 ? '−' : '+'} ${Math.abs(c)}`, `= ${v}`],
            [[String(a * -(k * k) + b * k + c), 'A negative number squared is positive.']]);
        }),
        bank('type', [
          { q: 'Which type is 3x − 7?', a: 'Linear (degree 1)', w: ['Quadratic (degree 2)', 'Cubic (degree 3)', 'Not a polynomial'], h: ['Highest power of x?'], s: ['The highest power is 1, so it is linear.'] },
          { q: 'Which type is 4 − x²?', a: 'Quadratic (degree 2)', w: ['Linear (degree 1)', 'Cubic (degree 3)', 'Not a polynomial'], h: ['Highest power of x?'], s: ['The highest power is 2.'] },
          { q: 'Which type is x³ − 2x + 1?', a: 'Cubic (degree 3)', w: ['Quadratic (degree 2)', 'Linear (degree 1)', 'Not a polynomial'], h: ['Highest power of x?'], s: ['The highest power is 3.'] },
          { q: 'Which type is x² + 1/x?', a: 'Not a polynomial', w: ['Quadratic (degree 2)', 'Linear (degree 1)', 'Cubic (degree 3)'], h: ['1/x = x⁻¹. Is −1 allowed?'], s: ['Powers must be whole numbers; x⁻¹ is not allowed.'] },
          { q: 'Which type is √x + 5?', a: 'Not a polynomial', w: ['Linear (degree 1)', 'Quadratic (degree 2)', 'Cubic (degree 3)'], h: ['√x = x^(1/2).'], s: ['The power ½ is not a whole number.'] },
          { q: 'Which type is (x + 1)² − x²?', a: 'Linear (degree 1)', w: ['Quadratic (degree 2)', 'Cubic (degree 3)', 'Not a polynomial'], h: ['Expand and simplify first.'], s: ['(x + 1)² − x² = 2x + 1, degree 1.'] },
          { q: 'Which type is 2x³ − x³ + x²?', a: 'Cubic (degree 3)', w: ['Quadratic (degree 2)', 'Linear (degree 1)', 'Not a polynomial'], h: ['Combine like terms.'], s: ['= x³ + x², degree 3.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.poly.graph', title: 'Geometrical meaning of the zeroes', prereqs: ['ts10.m.poly.degree'],
      intro: [
        h('Where the graph meets the x-axis'),
        p('A zero of p(x) is a value of x for which p(x) = 0. On the graph of y = p(x), these are exactly the points where the curve touches or crosses the x-axis (because there y = 0).'),
        def('Zero of a polynomial', 'A number k with p(k) = 0.'),
        h('Linear polynomials: always exactly one zero'),
        p('The graph of y = ax + b is a straight line that crosses the x-axis once, at x = −b/a.'),
        f('zero of ax + b is x = −b/a', 'x equals minus b over a'),
        X({
          title: 'What if? Move the zero of a straight line', formula: 'x = −b / a',
          result: ['z', 'Zero of ax + b', '-b / a', '', 2],
          vars: [['a', 'Coefficient a (slope)', 1, 6, 1, 2], ['b', 'Constant b', -10, 10, 1, -6]],
          notes: [
            ['a', 'A steeper line reaches the x-axis sooner, so the zero moves closer to 0.', 'A flatter line travels further before reaching the axis, so the zero moves away from 0.'],
            ['b', 'Raising b lifts the line, so it now crosses the axis further LEFT (the zero decreases).', 'Lowering b drops the line, so the crossing moves to the right.'],
          ],
          mistakes: [
            ['Writing the zero as b/a', 'Solve ax + b = 0: ax = −b, so x = −b/a. The minus sign is essential.'],
            ['Confusing the zero with the y-intercept', 'The y-intercept is b (where x = 0). The zero is where y = 0.'],
            ['Dividing a by b', 'x = −b/a, not −a/b. For 2x − 6 the zero is 3, not 1/3.'],
          ],
          real: 'A phone plan costing ₹150 with ₹2 back per referral: 150 − 2x = 0 tells you 75 referrals make it free.',
        }),
        h('Quadratics: 0, 1 or 2 zeroes'),
        p('The graph of y = ax² + bx + c is a U-shaped curve called a parabola (opening up if a > 0, down if a < 0). It can cross the x-axis twice, touch it once, or miss it completely.'),
        vis({ kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[-2, 5], [-1, 0], [0, -3], [1, -4], [2, -3], [3, 0], [4, 5]] }, 'Parabola y = x² − 2x − 3 crossing the x-axis at −1 and 3'),
        p('A cubic can cross the x-axis at most 3 times. In general a polynomial of degree n has at most n zeroes.'),
        keys('Zeroes = x-coordinates where the graph meets the x-axis.', 'Linear: exactly one zero, −b/a.', 'Quadratic: 0, 1 or 2 zeroes.', 'Degree n: at most n zeroes.'),
        remember('Count the points where the graph MEETS the x-axis — a touching point counts as one zero.'),
      ],
      examples: [
        ex('Find the zero of 3x − 12.', ['3x − 12 = 0', 'x = 12/3'], 'x = 4'),
        ex('The graph of y = x² − 4x + 4 just touches the x-axis at x = 2. How many zeroes?', ['It meets the axis at only one point.', 'x² − 4x + 4 = (x − 2)²'], 'One zero: x = 2'),
      ],
      practice: [
        tp('linear-zero', (r) => {
          const a = r.pick([1, 2, 3, 4, 5, -2, -3]);
          let b = r.int(-12, 12);
          while (b === 0) b = r.int(-12, 12);
          return typed(`Find the zero of p(x) = ${poly([a, b])}.`, frac(-b, a),
            ['Set p(x) = 0.', `${poly([a, b])} = 0 → ${a === 1 ? '' : n_(a)}x = ${n_(-b)}`],
            [`${poly([a, b])} = 0`, `x = ${n_(-b)} ÷ ${pn(a)} = ${fx(-b, a)}`],
            [[fr(b, a), 'Sign error: move b to the other side, it becomes −b.']]);
        }),
        tp('graph-count', (r) => {
          const hh = r.int(-2, 2), k = r.pick([-4, -1, 0, 2, 3]);
          const pts: [number, number][] = [];
          for (let x = hh - 3; x <= hh + 3; x++) pts.push([x, (x - hh) ** 2 + k]);
          const z = k < 0 ? 2 : k === 0 ? 1 : 0;
          return {
            type: 'mcq', prompt: `The graph of y = p(x) passes through the points shown (lowest point at ${pt(hh, k)}). How many zeroes does p(x) have?`,
            visual: { kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: pts },
            ...choose(r, String(z), ['0', '1', '2', '3'].filter((s) => s !== String(z))),
            hints: ['Zeroes are where the graph meets the x-axis (y = 0).', `The lowest point has y = ${n_(k)}.`],
            solution: [k < 0 ? 'The lowest point is below the axis and the curve rises on both sides, so it crosses twice.' : k === 0 ? 'The lowest point is ON the axis: the curve only touches it once.' : 'The lowest point is above the axis, so the curve never meets it.', `Number of zeroes = ${z}`],
          };
        }),
        tp('check-zero', (r) => {
          const p1 = r.int(-5, 5), p2 = r.int(-5, 6);
          const B = -(p1 + p2), C = p1 * p2;
          const isZ = r.next() < 0.5;
          let k = isZ ? p1 : p1 + r.pick([1, -1, 2]);
          if (!isZ && (k === p2 || k === p1)) k = p1 + 3 === p2 ? p1 - 3 : p1 + 3;
          const v = k * k + B * k + C;
          return mcq(r, `Is ${n_(k)} a zero of p(x) = ${poly([1, B, C])}?`, v === 0 ? 'Yes' : 'No', [v === 0 ? 'No' : 'Yes'],
            [`Work out p(${n_(k)}).`, 'It is a zero only if the answer is exactly 0.'],
            [`p(${n_(k)}) = ${pn(k)}² ${B < 0 ? '−' : '+'} ${Math.abs(B)}${pn(k)} ${C < 0 ? '−' : '+'} ${Math.abs(C)} = ${v}`, v === 0 ? 'p(k) = 0, so it is a zero.' : 'p(k) ≠ 0, so it is not a zero.']);
        }),
      ],
    },
    {
      id: 'ts10.m.poly.rel', title: 'Zeroes and coefficients of a quadratic', prereqs: ['ts10.m.poly.graph'],
      intro: [
        h('The coefficients already know the zeroes'),
        p('If α and β are the zeroes of a quadratic, it can be written k(x − α)(x − β). Expanding: k[x² − (α + β)x + αβ]. Compare with ax² + bx + c (so k = a): b = −a(α + β) and c = aαβ.'),
        f('α + β = −b/a', 'sum of zeroes equals minus b over a'),
        f('αβ = c/a', 'product of zeroes equals c over a'),
        p('So you can find the sum and product of the zeroes WITHOUT solving. And going backwards, a quadratic with a given sum S and product P is x² − Sx + P.'),
        X({
          title: 'What if? Sum of the zeroes', formula: 'α + β = −b/a',
          result: ['S', 'Sum of zeroes', '-b / a', '', 2],
          vars: [['a', 'Coefficient of x²', 1, 5, 1, 1], ['b', 'Coefficient of x', -10, 10, 1, -5]],
          notes: [
            ['b', 'Increasing b pushes the sum of the zeroes DOWN (the minus sign in −b/a).', 'Decreasing b makes the sum bigger.'],
            ['a', 'A bigger a divides the sum into a smaller number (zeroes squeeze towards each other\'s average).', 'A smaller a spreads the sum out.'],
          ],
          mistakes: [
            ['Sum = b/a', 'The minus sign comes from (x − α)(x − β) = x² − (α + β)x + …'],
            ['Forgetting to divide by a', 'For 2x² − 8x + 6 the sum is 8/2 = 4, not 8.'],
            ['Mixing up sum and product formulas', 'Sum uses b (the x term); product uses c (the constant).'],
          ],
          real: 'If you know the total and the product of two lengths (e.g. perimeter and area of a plot), they are the zeroes of x² − (sum)x + product.',
        }),
        X({
          title: 'What if? Product of the zeroes', formula: 'αβ = c/a',
          result: ['P', 'Product of zeroes', 'c / a', '', 2],
          vars: [['a', 'Coefficient of x²', 1, 5, 1, 1], ['c', 'Constant term', -12, 12, 1, 6]],
          notes: [
            ['c', 'A bigger constant means a bigger product. If c < 0 the product is negative, so one zero is positive and one negative.', 'Making c smaller lowers the product; at c = 0 one zero is 0.'],
            ['a', 'Dividing by a bigger a shrinks the product.', 'A smaller a makes the product larger.'],
          ],
          mistakes: [
            ['Product = −c/a', 'The product has NO minus sign: αβ = c/a.'],
            ['Using b for the product', 'b gives the sum; c gives the product.'],
          ],
          real: 'A rectangular plot whose sides are the zeroes of x² − 17x + 70 has area 70 m² and half-perimeter 17 m (sides 7 m and 10 m).',
        }),
        keys('α + β = −b/a, αβ = c/a.', 'Quadratic from zeroes: x² − (sum)x + (product).', 'Check signs carefully.'),
        remember('Always verify: after factorising, add and multiply your zeroes and compare with −b/a and c/a.'),
      ],
      examples: [
        ex('Find the zeroes of 6x² − 7x − 3 and verify the relations.', ['6x² − 9x + 2x − 3 = 3x(2x − 3) + 1(2x − 3) = (3x + 1)(2x − 3)', 'Zeroes: 3/2 and −1/3', 'Sum = 3/2 − 1/3 = 7/6 = −(−7)/6 ✓', 'Product = −1/2 = −3/6 ✓'], '3/2 and −1/3'),
        ex('Find a quadratic whose zeroes have sum 1/4 and product −1.', ['x² − (1/4)x − 1', 'Multiply by 4 to clear the fraction'], '4x² − x − 4'),
      ],
      practice: [
        tp('sum-product', (r) => {
          const a = r.pick([1, 1, 2, 3]);
          const z1 = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), z2 = r.pick([-5, -3, -2, 1, 2, 4, 7]);
          const B = -a * (z1 + z2), C = a * z1 * z2;
          const ask = r.pick(['sum', 'product'] as const);
          const ans = ask === 'sum' ? z1 + z2 : z1 * z2;
          return typed(`For p(x) = ${poly([a, B, C])}, find the ${ask} of its zeroes without solving.`, num(ans),
            [ask === 'sum' ? 'Sum of zeroes = −b/a.' : 'Product of zeroes = c/a.', `Here a = ${a}, b = ${B}, c = ${C}.`],
            [`a = ${a}, b = ${B}, c = ${C}`, ask === 'sum' ? `Sum = −(${B})/${a} = ${ans}` : `Product = ${C}/${a} = ${ans}`],
            [[String(ask === 'sum' ? B / a : -C / a), 'Watch the sign: the sum is −b/a and the product is +c/a.']]);
        }),
        tp('form', (r) => {
          const z1 = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), z2 = r.pick([-3, -2, 1, 2, 3, 5, 7]);
          const s = z1 + z2, pr = z1 * z2;
          return mcq(r, `Which quadratic has zeroes ${n_(z1)} and ${n_(z2)}?`, poly([1, -s, pr]), [poly([1, s, pr]), poly([1, -s, -pr]), poly([1, pr, s]), poly([1, -s + 1, pr]), poly([1, -s, pr + 2])],
            ['Use x² − (sum)x + (product).', `Sum = ${s}, product = ${pr}.`],
            [`Sum = ${s}, product = ${pr}`, `p(x) = x² − (${s})x + (${pr}) = ${poly([1, -s, pr])}`],
            [['wrong', 'The x-coefficient is MINUS the sum; the constant is PLUS the product.']]);
        }, 2),
        tp('find-k', (r) => {
          const B = r.pick([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]), z = r.pick([-3, -2, -1, 1, 2, 3, 4]);
          const k = -(z * z + B * z);
          return typed(`If ${n_(z)} is a zero of ${poly([1, B, 0])} + k, find k.`, num(k),
            [`Substitute x = ${n_(z)} and set the result to 0.`, `${pn(z)}² ${B < 0 ? '−' : '+'} ${Math.abs(B)}${pn(z)} + k = 0`],
            [`${z * z} ${B * z < 0 ? '−' : '+'} ${Math.abs(B * z)} + k = 0`, `k = ${k}`]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.poly.cubic', title: 'Cubic polynomials: zeroes and coefficients', prereqs: ['ts10.m.poly.rel'],
      intro: [
        h('Three zeroes, three relations'),
        p('A cubic ax³ + bx² + cx + d has at most three zeroes α, β, γ. Writing it as a(x − α)(x − β)(x − γ) and expanding gives three relations — the signs alternate −, +, −.'),
        f('α + β + γ = −b/a'),
        f('αβ + βγ + γα = c/a'),
        f('αβγ = −d/a'),
        p('Memory trick: go along the coefficients b, c, d and alternate the signs: −b/a, +c/a, −d/a.'),
        X({
          title: 'What if? Product of the three zeroes', formula: 'αβγ = −d/a',
          result: ['P', 'Product of zeroes', '-d / a', '', 2],
          vars: [['a', 'Coefficient of x³', 1, 5, 1, 1], ['d', 'Constant term', -24, 24, 1, -6]],
          notes: [
            ['d', 'A bigger constant gives a MORE NEGATIVE product (because of the minus sign).', 'A smaller (more negative) constant makes the product larger.'],
            ['a', 'A bigger leading coefficient divides the product down.', 'A smaller leading coefficient makes the product larger in size.'],
          ],
          mistakes: [
            ['Product = d/a (like the quadratic)', 'For a cubic the product is −d/a. The sign pattern is −, +, −.'],
            ['Sum of products = −c/a', 'The middle relation has a PLUS sign: αβ + βγ + γα = c/a.'],
            ['Forgetting to divide by a', 'If a = 2, every relation is halved.'],
          ],
          real: 'A cuboid tank whose sides are the zeroes of x³ − 6x² + 11x − 6 has volume 1 × 2 × 3 = 6 m³ — the same as −d/a.',
        }),
        keys('Sum = −b/a; sum of pairwise products = c/a; product = −d/a.', 'A cubic with zeroes α, β, γ: x³ − (sum)x² + (pair-sum)x − (product).'),
        remember('To check a zero k, substitute it: p(k) must be exactly 0.'),
      ],
      examples: [
        ex('Verify that 1/2, 1 and −2 are zeroes of 2x³ + x² − 5x + 2, and check the relations.', ['p(1) = 2 + 1 − 5 + 2 = 0 ✓ (check the others similarly)', 'Sum = 1/2 + 1 − 2 = −1/2 = −b/a = −1/2 ✓', 'Pair-sum = 1/2 − 2 − 1 = −5/2 = c/a ✓', 'Product = −1 = −d/a = −2/2 ✓'], 'All three relations hold'),
        ex('Find the cubic with zeroes 1, 2 and 3.', ['Sum = 6, pair-sum = 2 + 6 + 3 = 11, product = 6', 'x³ − 6x² + 11x − 6'], 'x³ − 6x² + 11x − 6'),
      ],
      practice: [
        tp('cubic-rel', (r) => {
          const z = [r.int(-3, 3), r.int(-3, 4), r.int(1, 4)];
          const s = z[0] + z[1] + z[2], ps = z[0] * z[1] + z[1] * z[2] + z[2] * z[0], pr = z[0] * z[1] * z[2];
          const ask = r.pick(['sum', 'pair', 'product'] as const);
          const ans = ask === 'sum' ? s : ask === 'pair' ? ps : pr;
          const label = ask === 'sum' ? 'α + β + γ' : ask === 'pair' ? 'αβ + βγ + γα' : 'αβγ';
          return typed(`α, β, γ are the zeroes of ${poly([1, -s, ps, -pr])}. Find ${label}.`, num(ans),
            ['Read off a, b, c, d.', ask === 'sum' ? 'Use −b/a.' : ask === 'pair' ? 'Use c/a.' : 'Use −d/a.'],
            [`a = 1, b = ${-s}, c = ${ps}, d = ${-pr}`, `${label} = ${ans}`],
            ans !== 0 && ask !== 'pair' ? [[String(-ans), 'Sign error: sum = −b/a and product = −d/a.']] : []);
        }, 2),
        tp('check-root', (r) => {
          const z = [r.int(-3, 3), r.int(-2, 3), r.int(1, 4)];
          const cs = [1, -(z[0] + z[1] + z[2]), z[0] * z[1] + z[1] * z[2] + z[2] * z[0], -z[0] * z[1] * z[2]];
          let k = r.next() < 0.5 ? z[r.int(0, 2)] : r.int(-4, 5);
          const val = (x: number) => x ** 3 + cs[1] * x * x + cs[2] * x + cs[3];
          if (r.next() < 0.1) k = 5;
          const v = val(k);
          return mcq(r, `Is ${n_(k)} a zero of ${poly(cs)}?`, v === 0 ? 'Yes' : 'No', [v === 0 ? 'No' : 'Yes'],
            [`Substitute x = ${n_(k)}.`, 'It is a zero only if the value is exactly 0.'],
            [`p(${n_(k)}) = ${v}`, v === 0 ? 'So it is a zero.' : 'Not 0, so it is not a zero.']);
        }),
        tp('form-cubic', (r) => {
          const z = [r.int(-3, -1), r.int(1, 2), r.int(3, 5)];
          const s = z[0] + z[1] + z[2], ps = z[0] * z[1] + z[1] * z[2] + z[2] * z[0], pr = z[0] * z[1] * z[2];
          const right = poly([1, -s, ps, -pr]);
          return mcq(r, `Which cubic has zeroes ${z.map(n_).join(', ')}?`, right, [poly([1, s, ps, pr]), poly([1, -s, -ps, -pr]), poly([1, -s, ps, pr]), poly([1, s, -ps, -pr])],
            ['Use x³ − (sum)x² + (pair-sum)x − (product).', `Sum = ${s}, pair-sum = ${ps}, product = ${pr}.`],
            [`Sum = ${s}, pair-sum = ${ps}, product = ${pr}`, `p(x) = ${right}`]);
        }, 3),
      ],
    },
  ],
};

// ================================================================== CH 4 PAIR OF LINEAR EQUATIONS
/** ax + by with proper signs (b ≠ 0) */
const lin2 = (a: number, b: number) => `${a === 1 ? '' : a === -1 ? '−' : n_(a)}x ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
const ch4: USpec = {
  id: 'ts10.m.ch4', subject: 'math', title: 'Pair of Linear Equations in Two Variables', source: src(4),
  objectives: [
    {
      id: 'ts10.m.pair.graph', title: 'Graphical method and consistency',
      intro: [
        h('Two conditions, two lines'),
        p('Teja buys 2 notebooks and 1 pen for ₹50. Lakshmi buys 1 notebook and 2 pens for ₹40. Each statement alone allows many prices. Together they pin down ONE price for each item. Each statement is a linear equation in two variables, and its graph is a straight line.'),
        def('Linear equation in two variables', 'An equation of the form ax + by + c = 0 (a and b not both 0). Every solution (x, y) is a point on its straight-line graph.'),
        stepsB('For each equation make a small table: choose 2–3 values of x and work out y.', 'Plot the points and join them with a ruler — one line per equation.', 'Read where the lines meet: that point satisfies BOTH equations.'),
        h('Three possible pictures'),
        p('Intersecting lines: exactly one common point → one unique solution. The pair is called consistent.'),
        p('Parallel lines: no common point → no solution. The pair is inconsistent.'),
        p('Coincident lines (one on top of the other): every point is common → infinitely many solutions. The pair is dependent (and consistent).'),
        vis({ kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]] }, 'Graph of x + y = 5: points (0, 5), (1, 4), …, (5, 0) lie on one straight line'),
        keys('Each linear equation → a straight line.', 'Meeting point = solution of both.', 'Intersecting: unique solution (consistent).', 'Parallel: no solution (inconsistent).', 'Coincident: infinitely many (dependent).'),
        remember('A point is a solution of the pair only if it satisfies BOTH equations — check by substituting into each.'),
        tip('Choose table values that give whole-number y, so the points are easy to plot accurately.'),
      ],
      examples: [
        ex('Solve graphically: x + y = 5 and x − y = 1.', ['Table for x + y = 5: (0, 5), (5, 0), (2, 3)', 'Table for x − y = 1: (1, 0), (3, 2), (0, −1)', 'The lines meet at (3, 2)', 'Check: 3 + 2 = 5 ✓, 3 − 2 = 1 ✓'], 'x = 3, y = 2'),
        ex('Are x + 2y = 4 and 2x + 4y = 12 consistent?', ['Table for the first: (0, 2), (4, 0)', 'Table for the second: (0, 3), (6, 0)', 'Both lines have the same steepness but different positions — they are parallel.'], 'Inconsistent: no solution'),
      ],
      practice: [
        tp('table', (r) => {
          const a = r.int(1, 4), b = r.pick([1, 2, 3, -1, -2]), x0 = r.int(-3, 5), y0 = r.int(-3, 6);
          const c = a * x0 + b * y0;
          return typed(`To draw the line ${lin2(a, b)} = ${n_(c)}, ${nm(r)} makes a table. Find y when x = ${n_(x0)}.`, num(y0),
            [`Put x = ${n_(x0)} in the equation.`, `${a * x0 === 0 ? '0' : n_(a * x0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${n_(c)}`],
            [`${n_(a * x0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${n_(c)}`, `${b === 1 ? '' : n_(b)}y = ${n_(c - a * x0)}`, `y = ${n_(y0)}`, `So the point ${pt(x0, y0)} lies on the line.`]);
        }),
        tp('on-both', (r) => {
          const x0 = r.int(-3, 5), y0 = r.int(-3, 5);
          const a1 = r.int(1, 3), b1 = r.int(1, 3), a2 = r.int(1, 3), b2 = -r.int(1, 3);
          const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
          const which = r.int(0, 2);
          const P: [number, number] = which === 0 ? [x0, y0] : which === 1 ? [x0 + 1, y0] : [x0, y0 - 1];
          const ok1 = a1 * P[0] + b1 * P[1] === c1, ok2 = a2 * P[0] + b2 * P[1] === c2;
          const both = ok1 && ok2;
          return mcq(r, `The lines ${lin2(a1, b1)} = ${n_(c1)} and ${lin2(a2, b2)} = ${n_(c2)} are drawn on graph paper. Is ${pt(P[0], P[1])} the point where they meet?`, both ? 'Yes, it lies on both lines' : 'No, it does not lie on both lines', [both ? 'No, it does not lie on both lines' : 'Yes, it lies on both lines'],
            ['Substitute the point into each equation.', 'It must satisfy BOTH.'],
            [`First: ${a1 * P[0] + b1 * P[1]} ${ok1 ? '=' : '≠'} ${n_(c1)}`, `Second: ${a2 * P[0] + b2 * P[1]} ${ok2 ? '=' : '≠'} ${n_(c2)}`, both ? 'It satisfies both, so it is the meeting point.' : 'It fails at least one equation.'],
            [['wrong', 'Satisfying only one equation means the point is on one line but not the other.']]);
        }),
        bank('consistency', [
          { q: 'The graphs of a pair of linear equations intersect at exactly one point. The pair is:', a: 'consistent, with a unique solution', w: ['inconsistent', 'dependent, with infinitely many solutions', 'impossible to decide'], h: ['One meeting point = one solution.'], s: ['Intersecting lines → unique solution → consistent.'] },
          { q: 'The graphs of a pair of linear equations are parallel lines. The pair has:', a: 'no solution', w: ['one solution', 'two solutions', 'infinitely many solutions'], h: ['Do parallel lines ever meet?'], s: ['Parallel lines never meet, so there is no solution (inconsistent).'] },
          { q: 'The graphs of a pair of linear equations coincide. The pair has:', a: 'infinitely many solutions', w: ['no solution', 'exactly one solution', 'exactly two solutions'], h: ['Every point of one line is on the other.'], s: ['Coincident lines share every point → infinitely many solutions (dependent).'] },
          { q: 'A pair of linear equations that has no solution is called:', a: 'inconsistent', w: ['consistent', 'dependent', 'coincident'], h: ['Think of parallel lines.'], s: ['No common solution → inconsistent.'] },
          { q: 'How many solutions can a pair of linear equations NEVER have?', a: 'exactly two', w: ['none', 'exactly one', 'infinitely many'], h: ['Two different straight lines can meet at most once.'], s: ['Two straight lines meet in 0, 1 or infinitely many points — never exactly two.'] },
          { q: 'To check that (2, 1) is a solution of a pair of equations you must:', a: 'substitute it into both equations', w: ['substitute it into one equation', 'check that 2 > 1', 'draw only one line'], h: ['A solution of the PAIR satisfies…'], s: ['It must satisfy both equations.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.pair.ratios', title: 'Coefficients and the nature of solutions', prereqs: ['ts10.m.pair.graph'],
      intro: [
        h('Predict the picture without drawing'),
        p('Write the pair as a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0. Comparing the ratios of the coefficients tells us whether the lines cross, are parallel, or coincide.'),
        f('a₁/a₂ ≠ b₁/b₂ → intersecting: unique solution'),
        f('a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → parallel: no solution'),
        f('a₁/a₂ = b₁/b₂ = c₁/c₂ → coincident: infinitely many solutions'),
        p('Why? If a₁/a₂ = b₁/b₂, the second equation\'s x and y parts are just a multiple of the first\'s, so the lines have the same steepness. If the constant is ALSO in the same ratio, the second equation is a copy of the first.'),
        p('A neat test: the lines have the same steepness exactly when a₁b₂ − a₂b₁ = 0.'),
        X({
          title: 'What if? Will the lines cross?', formula: 'D = a₁b₂ − a₂b₁  (D ≠ 0 ⇒ unique solution)',
          result: ['D', 'Cross-difference a₁b₂ − a₂b₁', 'a1 * b2 - a2 * b1'],
          vars: [['a1', 'a₁ (x in first equation)', 1, 6, 1, 2], ['b1', 'b₁ (y in first equation)', 1, 6, 1, 3], ['a2', 'a₂ (x in second equation)', 1, 12, 1, 4], ['b2', 'b₂ (y in second equation)', 1, 12, 1, 6]],
          notes: [
            ['a2', 'Changing a₂ tilts the second line. When D becomes 0 the two lines have the same steepness.', 'Tilting the other way: D ≠ 0 means the lines cross at exactly one point.'],
            ['b2', 'Changing b₂ also tilts the second line; D = 0 means parallel or coincident lines.', 'Any value giving D ≠ 0 gives one unique solution.'],
            ['a1', 'Tilting the first line changes D. At the start (2, 3, 4, 6) D = 0: the lines are parallel or coincident.', 'Move a₁ away from 2 and the lines cross.'],
            ['b1', 'Changing b₁ tilts the first line; watch D leave 0.', 'D returns to 0 when a₁/a₂ = b₁/b₂ again.'],
          ],
          mistakes: [
            ['Comparing a₁/b₁ with c₁/c₂', 'Compare like with like: x-coefficients with x-coefficients (a₁/a₂) and y with y (b₁/b₂).'],
            ['Concluding "no solution" when all three ratios are equal', 'If c₁/c₂ is ALSO equal, the lines coincide and there are infinitely many solutions.'],
            ['Forgetting to move every term to one side first', 'Write both equations in the same form (ax + by + c = 0) before reading c₁ and c₂, or the signs go wrong.'],
          ],
          real: 'Two auto fare plans with the same rate per km but different base fares are parallel lines: one is always cheaper, and they never cost the same.',
        }),
        keys('Different slopes (a₁/a₂ ≠ b₁/b₂) → one solution.', 'Same slope, different constant → none.', 'All ratios equal → infinitely many.'),
        remember('In exams, write the three ratios explicitly and state the conclusion: "consistent", "inconsistent" or "dependent".'),
      ],
      examples: [
        ex('Without drawing, find the nature of 5x − 4y + 8 = 0 and 7x + 6y − 9 = 0.', ['a₁/a₂ = 5/7', 'b₁/b₂ = −4/6 = −2/3', '5/7 ≠ −2/3'], 'Intersecting: unique solution (consistent)'),
        ex('For which k does 2x + 3y = 5, 4x + ky = 7 have no solution?', ['Need a₁/a₂ = b₁/b₂: 2/4 = 3/k → k = 6', 'Check c₁/c₂ = 5/7 ≠ 1/2 ✓'], 'k = 6'),
      ],
      practice: [
        tp('nature', (r) => {
          const kind = r.pick(['unique', 'none', 'many'] as const);
          const a1 = r.int(1, 5), b1 = r.pick([1, 2, 3, -1, -2, -3]), c1 = r.int(1, 9);
          let a2: number, b2: number, c2: number;
          const m = r.int(2, 3);
          if (kind === 'unique') { a2 = r.int(1, 6); b2 = r.pick([1, 2, 4, -1, -3]); if (a1 * b2 === a2 * b1) b2 += 5; c2 = r.int(1, 12); }
          else if (kind === 'none') { a2 = m * a1; b2 = m * b1; c2 = m * c1 + r.pick([1, 2, -1]); }
          else { a2 = m * a1; b2 = m * b1; c2 = m * c1; }
          const ans = kind === 'unique' ? 'Exactly one solution' : kind === 'none' ? 'No solution' : 'Infinitely many solutions';
          return mcq(r, `How many solutions does the pair ${lin2(a1, b1)} = ${c1} and ${lin2(a2, b2)} = ${c2} have?`, ans, ['Exactly one solution', 'No solution', 'Infinitely many solutions'].filter((x) => x !== ans),
            ['Compare a₁/a₂, b₁/b₂ and c₁/c₂.', `a₁/a₂ = ${fx(a1, a2)}, b₁/b₂ = ${fx(b1, b2)}`],
            [`a₁/a₂ = ${fx(a1, a2)}, b₁/b₂ = ${fx(b1, b2)}, c₁/c₂ = ${fx(c1, c2)}`, kind === 'unique' ? 'a₁/a₂ ≠ b₁/b₂ → the lines intersect.' : kind === 'none' ? 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → parallel lines.' : 'All three ratios are equal → coincident lines.'],
            [['wrong', 'Equal a and b ratios mean same steepness; then the c ratio decides between parallel (none) and coincident (infinitely many).']]);
        }, 2),
        tp('k-none', (r) => {
          const a1 = r.int(1, 4), b1 = r.int(1, 5), m = r.int(2, 4), c1 = r.int(1, 9);
          const a2 = m * a1, k = m * b1;
          let c2 = r.int(1, 30);
          if (c2 === m * c1) c2 += 1;
          return typed(`Find k so that ${lin2(a1, b1)} = ${c1} and ${a2}x + ky = ${c2} have NO solution.`, num(k),
            ['No solution needs a₁/a₂ = b₁/b₂ (parallel lines).', `${a1}/${a2} = ${b1}/k`],
            [`${fx(a1, a2)} = ${b1}/k`, `k = ${b1} × ${a2} ÷ ${a1} = ${k}`, `Check c₁/c₂ = ${fx(c1, c2)} ≠ ${fx(a1, a2)} ✓`]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.pair.solve', title: 'Substitution and elimination methods', prereqs: ['ts10.m.pair.ratios'],
      intro: [
        h('Exact answers without graph paper'),
        p('Graphs can be inaccurate when the answer is a fraction like (7/3, −1/5). Algebra gives exact answers.'),
        h('Substitution method'),
        stepsB('From one equation, write one variable in terms of the other, e.g. y = 14 − x.', 'Substitute this into the OTHER equation — now there is only one variable.', 'Solve it, then put the value back to find the second variable.'),
        h('Elimination method'),
        stepsB('Multiply one or both equations so that one variable has the same (or opposite) coefficient.', 'Subtract (or add) the equations to eliminate that variable.', 'Solve for the remaining variable, then substitute back.'),
        p('Both methods give the same answer. Choose substitution when a variable already has coefficient 1; choose elimination when coefficients are easy to match.'),
        h('A formula that does it all (cross-multiplication)'),
        f('For a₁x + b₁y = c₁ and a₂x + b₂y = c₂:  x = (c₁b₂ − c₂b₁)/(a₁b₂ − a₂b₁),  y = (a₁c₂ − a₂c₁)/(a₁b₂ − a₂b₁)'),
        X({
          title: 'What if? Change one number in the pair', formula: 'x = (c₁b₂ − c₂b₁) / (a₁b₂ − a₂b₁)',
          result: ['x', 'Solution x', '(c1 * b2 - c2 * b1) / (a1 * b2 - a2 * b1)', '', 3],
          vars: [['a1', 'a₁', 1, 5, 1, 2], ['b1', 'b₁', 1, 5, 1, 3], ['c1', 'c₁', -20, 20, 1, 12], ['a2', 'a₂', -5, -1, 1, -1], ['b2', 'b₂', 1, 5, 1, 2], ['c2', 'c₂', -20, 20, 1, 1]],
          notes: [
            ['c1', 'Raising c₁ slides the first line outward, so the meeting point moves and x grows.', 'Lowering c₁ slides the first line back, so x falls.'],
            ['c2', 'Raising c₂ slides the second line; here x falls because b₁ is subtracted.', 'Lowering c₂ moves the meeting point the other way.'],
            ['a1', 'Tilting the first line changes both the top and the bottom of the fraction.', 'The bottom a₁b₂ − a₂b₁ must never be 0 — that would mean parallel lines.'],
          ],
          mistakes: [
            ['Subtracting equations but forgetting to change every sign', '(2x + 3y = 12) − (2x − y = 4) gives 4y = 8: the −y becomes +y.'],
            ['Multiplying only the left side', 'When you multiply an equation, multiply EVERY term, including the right-hand side.'],
            ['Stopping after finding x', 'A pair needs both x and y. Substitute back, then check in both equations.'],
          ],
          real: 'Shops use exactly this: from two bills (2 notebooks + 1 pen = ₹50, 1 notebook + 2 pens = ₹40) you can find each price — ₹20 and ₹10.',
        }),
        keys('Substitution: express, substitute, solve, back-substitute.', 'Elimination: match coefficients, add/subtract, solve, back-substitute.', 'Always check the answer in both equations.'),
        remember('Write the final answer as x = …, y = … and state it in words for word problems (with ₹, km, years…).'),
      ],
      examples: [
        ex('Solve x + y = 14 and x − y = 4.', ['Add: 2x = 18 → x = 9', 'y = 14 − 9 = 5', 'Check: 9 − 5 = 4 ✓'], 'x = 9, y = 5'),
        ex('3 notebooks and 2 pens cost ₹110; 1 notebook and 1 pen cost ₹45. Find each price.', ['3n + 2p = 110 and n + p = 45', 'Substitution: p = 45 − n', '3n + 2(45 − n) = 110 → n + 90 = 110 → n = 20', 'p = 25'], 'Notebook ₹20, pen ₹25'),
        ex('Solve 2x + 3y = 12 and −x + 2y = 1 by elimination.', ['Multiply the second by 2: −2x + 4y = 2', 'Add to the first: 7y = 14 → y = 2', '2x + 6 = 12 → x = 3'], 'x = 3, y = 2'),
      ],
      practice: [
        tp('elim', (r) => {
          const x = r.int(-5, 9), y = r.int(-5, 9);
          const a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 4), b2 = -r.int(1, 4);
          const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
          return typed(`Solve by elimination: ${lin2(a1, b1)} = ${n_(c1)} and ${lin2(a2, b2)} = ${n_(c2)}. What is x?`, num(x),
            ['Make the y-coefficients equal in size, then add the equations.', `Multiply the first by ${-b2} and the second by ${b1}.`],
            [`(${lin2(a1, b1)} = ${n_(c1)}) × ${-b2}`, `(${lin2(a2, b2)} = ${n_(c2)}) × ${b1}`, `Adding eliminates y: ${a1 * -b2 + a2 * b1}x = ${n_(c1 * -b2 + c2 * b1)}`, `x = ${n_(x)}, then y = ${n_(y)}`],
            [[String(y), 'That is the value of y. The question asks for x.']], { steps: [st('First find x.', num(x)), st('Now find y.', num(y))] });
        }, 2),
        tp('subst', (r) => {
          const x = r.int(-4, 6), y = r.int(-4, 8);
          const m = r.pick([2, 3, -2, -1, 4]);
          const k = y - m * x;
          const a = r.int(1, 4), b = r.pick([1, 2, 3, -1, -2]);
          if (a + b * m === 0) return typed('Solve by substitution: y = 2x + 1 and 3x + y = 11. What is x?', num(2), ['Replace y in the second equation.'], ['3x + 2x + 1 = 11 → 5x = 10 → x = 2', 'y = 5']);
          const c = a * x + b * y;
          return typed(`Solve by substitution: y = ${m === 1 ? '' : m === -1 ? '−' : n_(m)}x ${k < 0 ? '−' : '+'} ${Math.abs(k)} and ${lin2(a, b)} = ${n_(c)}. What is x?`, num(x),
            ['The first equation already gives y. Put it into the second.', `${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}(${m}x ${k < 0 ? '−' : '+'} ${Math.abs(k)}) = ${n_(c)}`],
            [`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}(${m}x ${k < 0 ? '−' : '+'} ${Math.abs(k)}) = ${n_(c)}`, `${a + b * m}x ${b * k < 0 ? '−' : '+'} ${Math.abs(b * k)} = ${n_(c)}`, `x = ${n_(x)}`, `y = ${m}(${n_(x)}) ${k < 0 ? '−' : '+'} ${Math.abs(k)} = ${n_(y)}`],
            [], { steps: [st('Find x.', num(x)), st('Find y.', num(y))] });
        }, 2),
        tp('tickets', (r) => {
          const ad = r.pick([40, 50, 60, 80, 100]), ch = r.pick([20, 25, 30]);
          const A = r.int(3, 25), C = r.int(3, 25);
          const place = r.pick(['Golconda Fort', 'the Salar Jung Museum', 'the Nehru Zoological Park', 'Ramappa Temple', 'Bhongir Fort']);
          return typed(`At ${place}, an adult ticket costs ₹${ad} and a child ticket ₹${ch}. A school group of ${A + C} people paid ₹${ad * A + ch * C}. How many adults were there?`, num(A),
            ['Let a = adults and c = children.', `a + c = ${A + C} and ${ad}a + ${ch}c = ${ad * A + ch * C}`, `Substitute c = ${A + C} − a.`],
            [`a + c = ${A + C}, ${ad}a + ${ch}c = ${ad * A + ch * C}`, `${ad}a + ${ch}(${A + C} − a) = ${ad * A + ch * C}`, `${ad - ch}a = ${ad * A + ch * C - ch * (A + C)}`, `a = ${A} adults (and ${C} children)`],
            [[String(C), 'That is the number of children.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.pair.reduce', title: 'Equations reducible to linear form', prereqs: ['ts10.m.pair.solve'],
      intro: [
        h('Disguised linear equations'),
        p('Equations like 2/x + 3/y = 13 are not linear in x and y, because x and y sit in denominators. But if we rename u = 1/x and v = 1/y, they become 2u + 3v = 13 — an ordinary linear equation!'),
        stepsB('Spot the repeated "awkward" pieces (1/x, 1/y, 1/(x + y), …).', 'Replace them by new letters u and v.', 'Solve the linear pair for u and v.', 'Go back: x = 1/u, y = 1/v. Check in the original equations.'),
        h('Boats and streams'),
        p('A boat with speed b km/h in still water, on a river flowing at s km/h, goes downstream at (b + s) km/h and upstream at (b − s) km/h. Time = distance ÷ speed gives equations with speeds in the denominator — another disguised pair.'),
        f('downstream speed = b + s;  upstream speed = b − s;  time = distance ÷ speed'),
        X({
          title: 'What if? A boat going upstream', formula: 'time upstream = d / (b − s)',
          result: ['t', 'Time upstream', 'd / (b - s)', 'h', 2],
          vars: [['d', 'Distance', 6, 60, 1, 24, 'km'], ['b', 'Boat speed in still water', 6, 20, 1, 10, 'km/h'], ['s', 'Speed of the stream', 0, 5, 0.5, 2, 'km/h']],
          notes: [
            ['s', 'A faster stream pushes against the boat, so its effective speed b − s drops and the trip takes longer.', 'A slower stream fights the boat less, so the trip is quicker.'],
            ['b', 'A faster boat beats the current more easily, so time falls.', 'A slower boat struggles: as b gets close to s, the time shoots up.'],
            ['d', 'Twice the distance at the same speed takes twice the time.', 'Half the distance takes half the time.'],
          ],
          mistakes: [
            ['Using b + s for upstream', 'Upstream the river works AGAINST the boat, so subtract: b − s.'],
            ['Solving for u and stopping', 'u = 1/x is not the answer; finish with x = 1/u.'],
            ['Adding fractions 1/x + 1/y = 1/(x + y)', 'That is false. Keep 1/x and 1/y as separate unknowns u and v.'],
          ],
          real: 'A ferry on the Godavari takes longer to go upstream to Bhadrachalam than to come back downstream over the same distance.',
        }),
        keys('Put u = 1/x, v = 1/y to make the pair linear.', 'Downstream b + s, upstream b − s.', 'Finish by converting back and checking.'),
        remember('x and y cannot be 0 in equations with 1/x and 1/y — always state x ≠ 0, y ≠ 0.'),
      ],
      examples: [
        ex('Solve 2/x + 3/y = 13 and 5/x − 4/y = −2.', ['Let u = 1/x, v = 1/y: 2u + 3v = 13, 5u − 4v = −2', 'Multiply by 4 and 3: 8u + 12v = 52, 15u − 12v = −6', 'Add: 23u = 46 → u = 2, then v = 3', 'x = 1/2, y = 1/3'], 'x = 1/2, y = 1/3'),
        ex('A boat goes 30 km upstream and 44 km downstream in 10 hours; it goes 40 km upstream and 55 km downstream in 13 hours. Find the speeds.', ['Let u = 1/(b − s), v = 1/(b + s)', '30u + 44v = 10 and 40u + 55v = 13', 'Solving: u = 1/5, v = 1/11', 'b − s = 5, b + s = 11 → b = 8, s = 3'], 'Boat 8 km/h, stream 3 km/h'),
      ],
      practice: [
        tp('recip', (r) => {
          const x = r.int(1, 6), y = r.int(1, 6);
          const pp = r.int(1, 4), q = r.int(1, 4), s = r.int(1, 4), t = r.int(1, 4);
          const A1 = x * pp, B1 = y * q, A2 = x * s, B2 = y * t;
          return typed(`Solve: ${A1}/x + ${B1}/y = ${pp + q} and ${A2}/x − ${B2}/y = ${n_(s - t)}. What is x?`, num(x),
            ['Let u = 1/x and v = 1/y.', `${A1}u + ${B1}v = ${pp + q} and ${A2}u − ${B2}v = ${n_(s - t)}`, 'Eliminate v, find u, then x = 1/u.'],
            [`${A1}u + ${B1}v = ${pp + q}`, `${A2}u − ${B2}v = ${n_(s - t)}`, `Solving: u = 1/${x}, v = 1/${y}`, `x = ${x}, y = ${y}`],
            [[`1/${x}`, 'That is u = 1/x. Turn it upside down to get x.']], { steps: [st('First find u = 1/x.', frac(1, x)), st('Now find x.', num(x)), st('And y?', num(y))] });
        }, 3),
        tp('boat', (r) => {
          const b = r.int(8, 15), s = r.int(1, 4), t1 = r.int(2, 5), t2 = r.int(2, 5);
          const D1 = (b + s) * t1, D2 = (b - s) * t2;
          const ask = r.pick(['boat', 'stream'] as const);
          return typed(`A boat travels ${D1} km downstream in ${t1} hours and ${D2} km upstream in ${t2} hours on the Krishna river. Find the speed of the ${ask === 'boat' ? 'boat in still water' : 'stream'}.`, num(ask === 'boat' ? b : s, 'km/h'),
            [`Downstream speed = ${D1} ÷ ${t1} = ${b + s} km/h = b + s.`, `Upstream speed = ${D2} ÷ ${t2} = ${b - s} km/h = b − s.`, ask === 'boat' ? 'Add the two equations and halve.' : 'Subtract the two equations and halve.'],
            [`b + s = ${b + s}`, `b − s = ${b - s}`, `b = (${b + s} + ${b - s}) ÷ 2 = ${b} km/h`, `s = (${b + s} − ${b - s}) ÷ 2 = ${s} km/h`],
            [[String(ask === 'boat' ? s : b), ask === 'boat' ? 'That is the stream speed.' : 'That is the boat speed.'], [String(b + s), 'That is the downstream speed b + s, not a single speed.']],
            { steps: [st('Downstream speed (km/h)?', num(b + s)), st('Upstream speed (km/h)?', num(b - s))] });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 5 QUADRATIC EQUATIONS
const ch5: USpec = {
  id: 'ts10.m.ch5', subject: 'math', title: 'Quadratic Equations', source: src(5),
  objectives: [
    {
      id: 'ts10.m.quad.std', title: 'Quadratic equations in standard form',
      intro: [
        h('When a square sneaks in'),
        p('A rectangular kitchen garden in Siddipet has length 5 m more than its breadth and area 84 m². If the breadth is x m, then x(x + 5) = 84, i.e. x² + 5x − 84 = 0. An x² has appeared — this is a quadratic equation.'),
        def('Quadratic equation', 'An equation that can be written as ax² + bx + c = 0 with a ≠ 0. This is its standard form.'),
        def('Root', 'A value of x that makes ax² + bx + c equal to 0. A quadratic has at most two roots.'),
        p('To decide whether an equation is quadratic, expand and bring everything to one side. Sometimes the x² terms cancel — then it is NOT quadratic.'),
        f('ax² + bx + c = 0,  a ≠ 0'),
        X({
          title: 'What if? Hunt for the roots by sliding x', formula: 'value = ax² + bx + c (a root makes it 0)',
          result: ['v', 'Value of ax² + bx + c', 'a * x^2 + b * x + c', '', 2],
          vars: [['x', 'Trial value of x', -6, 6, 0.5, 0], ['a', 'a', 1, 3, 1, 1], ['b', 'b', -8, 8, 1, -5], ['c', 'c', -10, 10, 1, 6]],
          notes: [
            ['x', 'Watch the value: when it reaches exactly 0, you have found a root (for a = 1, b = −5, c = 6 try x = 2 and x = 3).', 'Moving x back past a root, the value changes sign.'],
            ['c', 'Raising c lifts every value; roots can disappear if the curve lifts above 0.', 'Lowering c pulls the values down, which can create two roots.'],
            ['b', 'Changing b shifts where the roots are.', 'Changing b the other way moves the roots the other way.'],
          ],
          mistakes: [
            ['Calling an equation quadratic before simplifying', 'x(x + 1) + 8 = (x + 2)(x − 2) becomes x + 12 = 0 after expanding — the x² terms cancel, so it is linear.'],
            ['Letting a = 0', 'If a = 0 the x² term disappears and the equation is linear, not quadratic.'],
            ['Not bringing everything to one side', 'Standard form needs "= 0" on the right before you read off a, b, c.'],
          ],
          real: 'Area problems (plots, tiles, frames) almost always lead to a quadratic because area multiplies two lengths.',
        }),
        keys('Standard form ax² + bx + c = 0, a ≠ 0.', 'Expand and simplify before deciding.', 'A root makes the expression exactly 0.'),
        remember('Read a, b, c with their signs: in 3x² − 2x − 5 = 0, a = 3, b = −2, c = −5.'),
      ],
      examples: [
        ex('Is (x − 2)² + 1 = 2x − 3 a quadratic equation?', ['x² − 4x + 4 + 1 = 2x − 3', 'x² − 6x + 8 = 0', 'a = 1 ≠ 0'], 'Yes'),
        ex('A garden\'s length is 5 m more than its breadth and its area is 84 m². Write the equation.', ['Breadth x, length x + 5', 'x(x + 5) = 84', 'x² + 5x − 84 = 0'], 'x² + 5x − 84 = 0'),
      ],
      practice: [
        bank('is-quad', [
          { q: 'Is (x − 2)² + 1 = 2x − 3 a quadratic equation?', a: 'Yes', w: ['No'], h: ['Expand and bring all terms to one side.'], s: ['x² − 6x + 8 = 0, and a = 1 ≠ 0.'] },
          { q: 'Is x(x + 1) + 8 = (x + 2)(x − 2) a quadratic equation?', a: 'No', w: ['Yes'], h: ['Expand both sides.'], s: ['x² + x + 8 = x² − 4 → x + 12 = 0, which is linear.'], why: 'The x² terms cancel after expanding.' },
          { q: 'Is (x + 2)³ = x³ − 4 a quadratic equation?', a: 'Yes', w: ['No'], h: ['(x + 2)³ = x³ + 6x² + 12x + 8.'], s: ['6x² + 12x + 12 = 0 — the x³ terms cancel, leaving a quadratic.'] },
          { q: 'Is x² + 3x + 1 = (x − 2)² a quadratic equation?', a: 'No', w: ['Yes'], h: ['Expand (x − 2)².'], s: ['x² + 3x + 1 = x² − 4x + 4 → 7x − 3 = 0, linear.'] },
          { q: 'Is (2x − 1)(x − 3) = (x + 5)(x − 1) a quadratic equation?', a: 'Yes', w: ['No'], h: ['Expand both sides.'], s: ['2x² − 7x + 3 = x² + 4x − 5 → x² − 11x + 8 = 0.'] },
          { q: 'Is x² + 2x = x² − 5 a quadratic equation?', a: 'No', w: ['Yes'], h: ['What happens to x²?'], s: ['2x + 5 = 0 — linear.'] },
          { q: 'Is x − 3/x = 2 (x ≠ 0) a quadratic equation?', a: 'Yes', w: ['No'], h: ['Multiply both sides by x.'], s: ['x² − 3 = 2x → x² − 2x − 3 = 0.'] },
        ]),
        tp('std-abc', (r) => {
          const NZ = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
          const p1 = r.pick(NZ), q1 = r.pick(NZ), k = r.int(-10, 20);
          const B = p1 + q1, C = p1 * q1 - k;
          const ask = r.pick(['b', 'c'] as const);
          const fac = (v: number) => (v === 0 ? 'x' : `(x ${v < 0 ? '−' : '+'} ${Math.abs(v)})`);
          return typed(`Write ${fac(p1)}${fac(q1)} = ${n_(k)} in the form x² + bx + c = 0. What is ${ask}?`, num(ask === 'b' ? B : C),
            ['Expand the left side.', `Then subtract ${n_(k)} from both sides.`],
            [`Left side = ${poly([1, B, p1 * q1])}`, `${poly([1, B, p1 * q1])} − ${pn(k)} = 0`, `${poly([1, B, C])} = 0`, `b = ${B}, c = ${C}`],
            ask === 'c' ? [[String(p1 * q1), `You forgot to move ${n_(k)} to the left side.`]] : []);
        }),
        tp('is-root', (r) => {
          const z1 = r.int(-5, 5), z2 = r.int(-5, 6), a = r.pick([1, 2]);
          const cs = [a, -a * (z1 + z2), a * z1 * z2];
          const k = r.next() < 0.5 ? z2 : z1 + r.pick([1, -1, 2]);
          const v = cs[0] * k * k + cs[1] * k + cs[2];
          return mcq(r, `Is x = ${n_(k)} a root of ${poly(cs)} = 0?`, v === 0 ? 'Yes' : 'No', [v === 0 ? 'No' : 'Yes'],
            ['Substitute the value for x.', 'It is a root only if the left side becomes exactly 0.'],
            [`${poly(cs)} at x = ${n_(k)} gives ${v}`, v === 0 ? 'So it is a root.' : 'Not 0, so it is not a root.']);
        }),
      ],
    },
    {
      id: 'ts10.m.quad.factor', title: 'Solving by factorisation', prereqs: ['ts10.m.quad.std'],
      intro: [
        h('Split the middle, then use zero'),
        p('If two numbers multiply to give 0, at least one of them must be 0. So if we can write a quadratic as (something)(something) = 0, each bracket gives a root.'),
        def('Zero-product rule', 'If P × Q = 0 then P = 0 or Q = 0.'),
        h('Splitting the middle term'),
        stepsB('For ax² + bx + c, find two numbers whose PRODUCT is a × c and whose SUM is b.', 'Split bx into those two terms.', 'Group in pairs and take out common factors.', 'Set each bracket equal to 0 and solve.'),
        p('Example: 2x² − 5x + 3. a × c = 6, sum = −5 → −2 and −3. 2x² − 2x − 3x + 3 = 2x(x − 1) − 3(x − 1) = (2x − 3)(x − 1). Roots: 3/2 and 1.'),
        keys('Product = ac, sum = b.', 'Group, factor, then each bracket = 0.', 'Check roots by substituting.'),
        remember('Never divide both sides by x — you would lose the root x = 0. Factor x out instead.'),
        tip('If the signs of ac and b are both positive, both numbers are positive; if ac > 0 but b < 0, both are negative; if ac < 0, the numbers have opposite signs.'),
      ],
      examples: [
        ex('Solve 2x² − 5x + 3 = 0.', ['ac = 6, need sum −5: −2 and −3', '2x² − 2x − 3x + 3 = 0', '2x(x − 1) − 3(x − 1) = 0', '(2x − 3)(x − 1) = 0'], 'x = 3/2 or x = 1'),
        ex('The product of two consecutive positive integers is 306. Find them.', ['n(n + 1) = 306 → n² + n − 306 = 0', 'Need product −306, sum 1: 18 and −17', '(n + 18)(n − 17) = 0', 'n = 17 (positive)'], '17 and 18'),
      ],
      practice: [
        tp('roots-int', (r) => {
          const p1 = r.int(-9, 8);
          let q1 = r.int(-8, 9);
          while (q1 === p1) q1 = r.int(-8, 9);
          const lo = Math.min(p1, q1), hi = Math.max(p1, q1);
          return typed(`Solve ${poly([1, -(p1 + q1), p1 * q1])} = 0 by factorisation. What is the LARGER root?`, num(hi),
            [`Find two numbers with product ${p1 * q1} and sum ${-(p1 + q1)}.`, `They are ${n_(-p1)} and ${n_(-q1)}.`],
            [`${poly([1, -(p1 + q1), p1 * q1])} = (x ${-p1 < 0 ? '−' : '+'} ${Math.abs(p1)})(x ${-q1 < 0 ? '−' : '+'} ${Math.abs(q1)})`, `Roots: ${n_(lo)} and ${n_(hi)}`, `Larger root = ${n_(hi)}`],
            [[String(-hi), 'Sign error: (x − 3) = 0 gives x = +3.'], [String(lo), 'That is the smaller root.']],
            { steps: [st('Smaller root?', num(lo)), st('Larger root?', num(hi))] });
        }),
        tp('roots-frac', (r) => {
          const a = r.pick([2, 3, 5]);
          let m = r.pick([-7, -5, -4, -2, -1, 1, 2, 4, 5, 7]);
          while (gcd(Math.abs(m), a) !== 1) m = r.pick([-7, -1, 1, 7]);
          const n = r.int(-4, 4);
          const cs = [a, -(m + a * n), m * n];
          return typed(`Solve ${poly(cs)} = 0. One root is a whole number; find the OTHER (fractional) root.`, frac(m, a),
            [`Product ac = ${a * m * n}, sum b = ${cs[1]}.`, `It factorises as (${a}x ${m < 0 ? '+' : '−'} ${Math.abs(m)})(x ${n < 0 ? '+' : '−'} ${Math.abs(n)}).`],
            [`${poly(cs)} = (${a}x ${m < 0 ? '+' : '−'} ${Math.abs(m)})(x ${n < 0 ? '+' : '−'} ${Math.abs(n)})`, `${a}x ${m < 0 ? '+' : '−'} ${Math.abs(m)} = 0 → x = ${fx(m, a)}`, `x ${n < 0 ? '+' : '−'} ${Math.abs(n)} = 0 → x = ${n_(n)}`],
            [[fr(-m, a), 'Sign error: (ax − m) = 0 gives x = +m/a.'], [fr(a, m), 'Upside down: ax = m gives x = m/a.']]);
        }, 2),
        tp('word', (r) => {
          if (r.next() < 0.5) {
            const n = r.int(8, 30);
            return typed(`The product of two consecutive positive integers is ${n * (n + 1)}. Find the smaller integer.`, num(n),
              ['Let the integers be n and n + 1.', `n² + n − ${n * (n + 1)} = 0`, `Find two numbers with product −${n * (n + 1)} and sum 1.`],
              [`n(n + 1) = ${n * (n + 1)}`, `n² + n − ${n * (n + 1)} = 0`, `(n + ${n + 1})(n − ${n}) = 0`, `n = ${n} (the negative root is rejected)`]);
          }
          const b = r.int(5, 20), k = r.int(2, 8);
          return typed(`A rectangular plot in Nalgonda is ${k} m longer than it is wide. Its area is ${b * (b + k)} m². Find its breadth.`, num(b, 'm'),
            ['Let breadth = x, length = x + ' + k + '.', `x² + ${k}x − ${b * (b + k)} = 0`],
            [`x(x + ${k}) = ${b * (b + k)}`, `x² + ${k}x − ${b * (b + k)} = 0`, `(x + ${b + k})(x − ${b}) = 0`, `x = ${b} m (length cannot be negative)`],
            [[String(b + k), 'That is the length. The question asks for the breadth.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.quad.formula', title: 'Completing the square and the quadratic formula', prereqs: ['ts10.m.quad.factor'],
      intro: [
        h('A method that always works'),
        p('Many quadratics do not factorise nicely (try x² + 4x − 1). Completing the square turns ANY quadratic into "(something)² = number", which we can solve by square roots.'),
        h('Completing the square'),
        p('x² + bx is "almost" a perfect square: (x + b/2)² = x² + bx + (b/2)². So x² + bx = (x + b/2)² − (b/2)².'),
        stepsB('Make the coefficient of x² equal to 1 (divide by a).', 'Move the constant to the right side.', 'Add (half the coefficient of x)² to BOTH sides.', 'Write the left as a square, take square roots (±), and solve.'),
        p('Example: x² + 4x − 5 = 0 → x² + 4x = 5 → x² + 4x + 4 = 9 → (x + 2)² = 9 → x + 2 = ±3 → x = 1 or −5.'),
        h('The quadratic formula'),
        p('Doing these steps once for the general ax² + bx + c = 0 gives a formula that solves every quadratic:'),
        f('x = [−b ± √(b² − 4ac)] / 2a', 'x equals minus b plus or minus root of b squared minus 4 a c, all over 2 a'),
        X({
          title: 'What if? Change a, b or c and watch the larger root', formula: 'x = [−b + √(b² − 4ac)] / 2a',
          result: ['x', 'Larger root', '(-b + sqrt(b^2 - 4 * a * c)) / (2 * a)', '', 3],
          vars: [['a', 'a', 1, 5, 1, 1], ['b', 'b', -10, 10, 1, 1], ['c', 'c (kept ≤ 0 here so real roots exist)', -20, 0, 1, -6]],
          notes: [
            ['b', 'Increasing b shifts both roots to the LEFT (the −b in front), so the larger root decreases.', 'Decreasing b shifts the roots to the right, so the larger root grows.'],
            ['c', 'Raising c towards 0 shrinks b² − 4ac, so the roots move closer together (larger root falls).', 'Making c more negative grows b² − 4ac, spreading the roots apart.'],
            ['a', 'A bigger a divides everything by more, squeezing the roots towards 0.', 'A smaller a lets the roots spread out.'],
          ],
          mistakes: [
            ['Dividing only the square root by 2a', 'The whole numerator −b ± √(…) is divided by 2a.'],
            ['Writing −b² for a negative b', 'If b = −4 then b² = (−4)² = 16 and −b = +4.'],
            ['Forgetting ±', 'There are usually two roots: one with +, one with −.'],
          ],
          real: 'Physics uses this formula to find when a ball thrown upward lands: 0 = ut − ½gt² is a quadratic in t.',
        }),
        keys('Add (b/2)² to complete the square.', 'x = [−b ± √(b² − 4ac)] / 2a works for every quadratic.', 'Write a, b, c with their signs first.'),
        remember('Before using the formula, put the equation in standard form ax² + bx + c = 0.'),
      ],
      examples: [
        ex('Solve x² + 4x − 5 = 0 by completing the square.', ['x² + 4x = 5', 'Add (4/2)² = 4: x² + 4x + 4 = 9', '(x + 2)² = 9 → x + 2 = ±3'], 'x = 1 or x = −5'),
        ex('Solve 2x² + x − 4 = 0 using the formula.', ['a = 2, b = 1, c = −4', 'b² − 4ac = 1 + 32 = 33', 'x = (−1 ± √33)/4', '√33 ≈ 5.745'], 'x ≈ 1.19 or x ≈ −1.69'),
      ],
      practice: [
        tp('add-square', (r) => {
          const b = r.pick([-12, -10, -8, -7, -6, -5, -3, 2, 3, 4, 5, 6, 7, 9, 10, 12]);
          return typed(`What number must be added to x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x to make it a perfect square?`, frac(b * b, 4),
            ['Take half the coefficient of x and square it.', `Half of ${n_(b)} is ${fx(b, 2)}.`],
            [`(${fx(b, 2)})² = ${fx(b * b, 4)}`, `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${fx(b * b, 4)} = (x ${b < 0 ? '−' : '+'} ${fx(Math.abs(b), 2)})²`],
            [[fr(Math.abs(b), 2), 'You halved it but did not square it.'], [String(b * b), 'Halve first, then square: (b/2)², not b².']]);
        }),
        tp('formula-exact', (r) => {
          const n = r.int(-4, 4);
          let m = r.pick([-7, -5, -3, -1, 1, 3, 5, 7]);
          if (m === 2 * n) m += 2;
          const cs = [2, -(m + 2 * n), m * n];
          const D = cs[1] * cs[1] - 8 * cs[2];
          const hiN = Math.max(m, 2 * n);
          return typed(`Use the quadratic formula to solve ${poly(cs)} = 0. Enter the LARGER root.`, frac(hiN, 2),
            ['a = 2, b = ' + cs[1] + ', c = ' + cs[2] + '.', `b² − 4ac = ${D} = ${Math.sqrt(D)}²`, `x = (${n_(-cs[1])} ± ${Math.sqrt(D)}) / 4`],
            [`b² − 4ac = ${cs[1] * cs[1]} − ${8 * cs[2] < 0 ? `(${8 * cs[2]})` : 8 * cs[2]} = ${D}`, `√${D} = ${Math.sqrt(D)}`, `x = (${n_(-cs[1])} + ${Math.sqrt(D)})/4 = ${fx(hiN, 2)}  or  x = (${n_(-cs[1])} − ${Math.sqrt(D)})/4 = ${fx(Math.min(m, 2 * n), 2)}`],
            [], { steps: [st('First find the discriminant b² − 4ac.', num(D)), st('Now the larger root.', frac(hiN, 2))] });
        }, 2),
        tp('formula-approx', (r) => {
          let b = r.int(-9, 9), c = -r.int(1, 12);
          let D = b * b - 4 * c;
          let guard = 0;
          while (Number.isInteger(Math.sqrt(D)) && guard++ < 20) { b = r.int(-9, 9); c = -r.int(1, 12); D = b * b - 4 * c; }
          if (Number.isInteger(Math.sqrt(D))) { b = 4; c = -1; D = 20; }
          const x = (-b + Math.sqrt(D)) / 2;
          return typed(`Solve ${poly([1, b, c])} = 0 using the formula. Give the larger root correct to 2 decimal places.`, num(rd(x, 2), undefined, false, 0.011),
            [`a = 1, b = ${b}, c = ${c}.`, `b² − 4ac = ${D}.`, `x = (${n_(-b)} + √${D}) / 2`],
            [`b² − 4ac = ${b * b} + ${-4 * c} = ${D}`, `√${D} ≈ ${rd(Math.sqrt(D), 3)}`, `x = (${n_(-b)} + ${rd(Math.sqrt(D), 3)}) / 2 ≈ ${rd(x, 2)}`],
            [[String(rd((b + Math.sqrt(D)) / 2, 2)), 'The formula starts with −b, not b.']]);
        }, 3),
      ],
    },
    {
      id: 'ts10.m.quad.nature', title: 'Nature of roots: the discriminant', prereqs: ['ts10.m.quad.formula'],
      intro: [
        h('Know the answer type before solving'),
        p('In the formula x = [−b ± √(b² − 4ac)]/2a, everything depends on the number under the square root. We call it the discriminant, because it discriminates (tells apart) the three kinds of answers.'),
        def('Discriminant D', 'D = b² − 4ac for the quadratic ax² + bx + c = 0.'),
        f('D = b² − 4ac', 'D equals b squared minus 4 a c'),
        p('D > 0: √D is a real positive number, so + and − give two DIFFERENT real roots. The parabola crosses the x-axis twice.'),
        p('D = 0: ±√0 adds nothing, so both roots equal −b/2a. The parabola just touches the x-axis.'),
        p('D < 0: there is no real square root of a negative number, so there are NO real roots. The parabola misses the x-axis.'),
        X({
          title: 'What if? Change the coefficients and watch D', formula: 'D = b² − 4ac',
          result: ['D', 'Discriminant', 'b^2 - 4 * a * c'],
          vars: [['a', 'a', 1, 5, 1, 1], ['b', 'b', -10, 10, 1, 4], ['c', 'c', -10, 10, 1, 4]],
          notes: [
            ['b', 'Making b bigger in SIZE (either sign) grows b², pushing D up — towards two distinct roots.', 'Bringing b towards 0 shrinks b², so D can fall below 0 (no real roots).'],
            ['c', 'With a > 0, raising c makes 4ac bigger, so D falls: the parabola lifts off the x-axis.', 'Lowering c (especially below 0) makes D bigger, so two real roots appear.'],
            ['a', 'With c > 0, a bigger a makes 4ac bigger, so D falls.', 'A smaller a reduces 4ac, so D rises.'],
          ],
          mistakes: [
            ['Squaring a negative b to get a negative number', '(−4)² = +16. b² is never negative.'],
            ['Forgetting the 4 in 4ac', 'D = b² − 4ac, not b² − ac.'],
            ['Saying "no roots" when D < 0', 'Say "no REAL roots" — the equation still has roots in the complex numbers you will meet later.'],
          ],
          real: 'A cricket ball\'s height h(t) = 20t − 5t². Can it reach 25 m? 5t² − 20t + 25 = 0 has D = 400 − 500 < 0, so no — it never gets that high.',
        }),
        keys('D > 0: two distinct real roots.', 'D = 0: two equal real roots, x = −b/2a.', 'D < 0: no real roots.', 'Equal roots problems: set D = 0 and solve for k.'),
        remember('"Real and equal roots" questions always mean b² − 4ac = 0.'),
      ],
      examples: [
        ex('Find the nature of the roots of 2x² − 4x + 3 = 0.', ['D = (−4)² − 4(2)(3) = 16 − 24 = −8', 'D < 0'], 'No real roots'),
        ex('For what k does kx² − 6x + 1 = 0 have equal roots?', ['D = 36 − 4k = 0', 'k = 9'], 'k = 9'),
        ex('Can a rectangular park with perimeter 80 m have area 400 m²?', ['l + b = 40 and l(40 − l) = 400', 'l² − 40l + 400 = 0, D = 1600 − 1600 = 0', 'One (repeated) root l = 20'], 'Yes — it is a 20 m × 20 m square'),
      ],
      practice: [
        tp('disc', (r) => {
          const a = r.int(1, 4), b = r.int(-9, 9), c = r.int(-8, 8);
          const D = b * b - 4 * a * c;
          return typed(`Find the discriminant of ${poly([a, b, c])} = 0.`, num(D),
            ['D = b² − 4ac.', `a = ${a}, b = ${b}, c = ${c}.`],
            [`D = ${pn(b)}² − 4(${a})${pn(c)}`, `= ${b * b} ${4 * a * c < 0 ? '+' : '−'} ${Math.abs(4 * a * c)}`, `= ${D}`],
            [[String(-b * b - 4 * a * c), 'b² is always positive, even when b is negative.'], [String(b * b - a * c), 'Do not forget the 4 in 4ac.']]);
        }),
        tp('nature', (r) => {
          const kind = r.pick(['two', 'equal', 'none'] as const);
          let cs: number[];
          if (kind === 'equal') { const a = r.int(1, 3), k = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]); cs = [a, -2 * a * k, a * k * k]; }
          else if (kind === 'two') { const a = r.int(1, 3), p1 = r.int(-5, 5); let q1 = r.int(-5, 5); if (q1 === p1) q1 = p1 + 2; cs = [a, -a * (p1 + q1), a * p1 * q1]; }
          else { const a = r.int(1, 3), b = r.int(-5, 5); cs = [a, b, Math.floor((b * b) / (4 * a)) + r.int(1, 5)]; }
          const D = cs[1] * cs[1] - 4 * cs[0] * cs[2];
          const ans = D > 0 ? 'Two distinct real roots' : D === 0 ? 'Two equal real roots' : 'No real roots';
          return mcq(r, `What is the nature of the roots of ${poly(cs)} = 0?`, ans, ['Two distinct real roots', 'Two equal real roots', 'No real roots'].filter((x) => x !== ans),
            ['Work out D = b² − 4ac.', 'Compare D with 0.'],
            [`D = ${pn(cs[1])}² − 4(${cs[0]})${pn(cs[2])} = ${D}`, D > 0 ? 'D > 0 → two distinct real roots.' : D === 0 ? 'D = 0 → two equal real roots.' : 'D < 0 → no real roots.'],
            [['wrong', 'Check D carefully: positive → two distinct, zero → equal, negative → no real roots.']]);
        }, 2),
        tp('k-equal', (r) => {
          const m = r.int(1, 9);
          if (r.next() < 0.5) {
            return typed(`Find the positive value of k for which x² − kx + ${m * m} = 0 has two equal roots.`, num(2 * m),
              ['Equal roots ⇔ D = 0.', `D = k² − 4(1)(${m * m}) = k² − ${4 * m * m}`],
              [`k² − ${4 * m * m} = 0`, `k² = ${4 * m * m}`, `k = ${2 * m} (positive value)`],
              [[String(m), 'k² = 4m², so k = 2m, not m.'], [String(4 * m * m), 'That is k². Take the square root.']]);
          }
          const b = 2 * m;
          return typed(`Find k so that kx² − ${b}x + 1 = 0 has two equal roots.`, num(m * m),
            ['Equal roots ⇔ D = 0.', `D = ${b}² − 4k(1)`],
            [`${b * b} − 4k = 0`, `k = ${b * b} ÷ 4 = ${m * m}`],
            [[String(b * b), 'Divide by 4: 4k = b².']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 6 PROGRESSIONS
const seq = (xs: number[]) => xs.map(n_).join(', ');
const ch6: USpec = {
  id: 'ts10.m.ch6', subject: 'math', title: 'Progressions', source: src(6),
  objectives: [
    {
      id: 'ts10.m.prog.ap', title: 'Arithmetic progressions',
      intro: [
        h('Patterns that grow by adding'),
        p('An auto in Hyderabad charges ₹30 for the first kilometre and ₹15 for each extra kilometre: fares ₹30, ₹45, ₹60, ₹75, … Each fare is the previous one PLUS the same amount. Such a list is an arithmetic progression (AP).'),
        def('Arithmetic progression (AP)', 'A list of numbers in which each term after the first is obtained by adding a fixed number to the previous term.'),
        def('Common difference d', 'The fixed number added each time: d = a₂ − a₁ = a₃ − a₂ = … It can be positive, negative or zero.'),
        p('The general AP is a, a + d, a + 2d, a + 3d, …, where a is the first term.'),
        p('To test a list, subtract each term from the NEXT one. If all the differences are equal, it is an AP. 1, 4, 9, 16 is not an AP (differences 3, 5, 7).'),
        vis({ kind: 'number-line', from: 0, to: 20, step: 1, marks: [2, 5, 8, 11, 14, 17, 20], jumps: [[2, 5], [5, 8], [8, 11], [11, 14], [14, 17], [17, 20]] }, 'Equal jumps of 3 on a number line: 2, 5, 8, 11, 14, 17, 20'),
        keys('AP: add the same d each time.', 'd = (any term) − (the term before it).', 'd < 0 means the AP decreases; d = 0 means all terms are equal.'),
        remember('Always subtract in the order "later term minus earlier term". For 10, 7, 4, … d = 7 − 10 = −3, not +3.'),
        tip('Fractions and decimals can form APs too: 1/2, 1, 3/2, 2, … has d = 1/2.'),
      ],
      examples: [
        ex('Is 2, 5/2, 3, 7/2, … an AP?', ['5/2 − 2 = 1/2', '3 − 5/2 = 1/2', '7/2 − 3 = 1/2'], 'Yes, d = 1/2'),
        ex('Auto fares: ₹30 for the first km, ₹15 for every extra km. Write the fares for 1, 2, 3, 4 km.', ['30, 30 + 15, 30 + 30, 30 + 45'], '₹30, ₹45, ₹60, ₹75 — an AP with d = 15'),
      ],
      practice: [
        tp('find-d', (r) => {
          const a = r.int(-10, 20), d = r.pick([-7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 11]);
          const xs = [0, 1, 2, 3].map((i) => a + i * d);
          return typed(`Find the common difference of the AP ${seq(xs)}, …`, num(d),
            ['Subtract a term from the NEXT term.', `${n_(xs[1])} − ${pn(xs[0])}`],
            [`d = ${n_(xs[1])} − ${pn(xs[0])} = ${n_(d)}`, `Check: ${n_(xs[2])} − ${pn(xs[1])} = ${n_(d)} ✓`],
            [[String(-d), 'Subtract in the right order: later term minus earlier term.']]);
        }),
        tp('next', (r) => {
          const a = r.int(-15, 30), d = r.pick([-9, -6, -4, -3, -1, 2, 3, 5, 7, 9, 12]);
          const xs = [0, 1, 2, 3].map((i) => a + i * d);
          return typed(`Write the next term of the AP ${seq(xs)}, …`, num(a + 4 * d),
            ['Find d first.', `d = ${n_(d)}`],
            [`d = ${n_(d)}`, `Next term = ${n_(xs[3])} + ${pn(d)} = ${n_(a + 4 * d)}`]);
        }),
        tp('is-ap', (r) => {
          const a = r.int(1, 12), d = r.int(2, 6);
          const kind = r.int(0, 2);
          let xs = [0, 1, 2, 3].map((i) => a + i * d);
          if (kind === 1) xs[2] += 1;
          if (kind === 2) xs = [1, 2, 3, 4].map((i) => (i + a) ** 2 - a * a);
          const diffs = xs.slice(1).map((x, i) => x - xs[i]);
          const ok = diffs.every((x) => x === diffs[0]);
          return mcq(r, `Is ${seq(xs)}, … an arithmetic progression?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['Find the differences between consecutive terms.', 'Are they all equal?'],
            [`Differences: ${diffs.join(', ')}`, ok ? 'All equal, so it is an AP.' : 'Not all equal, so it is not an AP.']);
        }),
      ],
    },
    {
      id: 'ts10.m.prog.nth', title: 'nth term of an AP', prereqs: ['ts10.m.prog.ap'],
      intro: [
        h('Jump straight to any term'),
        p('Meena saves ₹50 in week 1 and adds ₹20 more each week. How much does she save in week 30? Listing 30 terms is slow. Notice: to reach term 2 we add d once, term 3 twice, … term n (n − 1) times.'),
        f('aₙ = a + (n − 1)d', 'a n equals a plus n minus 1 times d'),
        p('Here a is the first term, d the common difference, n the position, and aₙ the term in position n. Week 30: a₃₀ = 50 + 29 × 20 = ₹630.'),
        X({
          title: 'What if? Find any term of an AP', formula: 'aₙ = a + (n − 1)d',
          result: ['an', 'nth term', 'a + (n - 1) * d'],
          vars: [['a', 'First term', -20, 50, 1, 5], ['d', 'Common difference', -10, 10, 1, 3], ['n', 'Position n', 1, 50, 1, 10]],
          notes: [
            ['n', 'Each step forward adds one more d: the terms rise steadily if d > 0 (or fall if d < 0).', 'Stepping back removes one d each time; at n = 1 you are back at a.'],
            ['d', 'A bigger d makes every later term grow faster; the first term does not change.', 'A negative d makes the terms decrease.'],
            ['a', 'Changing a shifts EVERY term by the same amount.', 'Lowering a lowers every term equally.'],
          ],
          mistakes: [
            ['Using a + nd', 'The first term already is a, so only (n − 1) jumps are needed. a + nd gives the (n + 1)th term.'],
            ['Taking d = a₁ − a₂', 'd = a₂ − a₁ (later minus earlier). For 10, 7, 4, … d = −3.'],
            ['Using the formula for the number of terms without +1', 'From the first term to the last there are (l − a)/d jumps but (l − a)/d + 1 terms.'],
          ],
          real: 'Seats in a stadium: 20 seats in row 1 and 2 more in each row → row 25 has 20 + 24 × 2 = 68 seats.',
        }),
        h('Two useful rearrangements'),
        f('number of terms: n = (l − a)/d + 1'),
        f('nth term from the end: l − (n − 1)d', 'last term minus n minus 1 times d'),
        keys('aₙ = a + (n − 1)d.', 'Which term is x? Solve a + (n − 1)d = x for n (n must be a positive whole number).', 'nth from the end: l − (n − 1)d.'),
        remember('If n comes out as a fraction or negative, the number is NOT a term of the AP.'),
      ],
      examples: [
        ex('Find the 10th term of 2, 7, 12, …', ['a = 2, d = 5, n = 10', 'a₁₀ = 2 + 9 × 5'], '47'),
        ex('How many three-digit numbers are divisible by 7?', ['First: 105, last: 994, d = 7', 'n = (994 − 105)/7 + 1 = 127 + 1'], '128'),
        ex('Is 301 a term of 5, 11, 17, 23, …?', ['5 + (n − 1)6 = 301 → (n − 1) = 296/6 = 49.33…', 'n is not a whole number'], 'No'),
      ],
      practice: [
        tp('nth', (r) => {
          const a = r.int(-10, 25), d = r.pick([-6, -4, -3, -2, 2, 3, 4, 5, 7, 9]), n = r.int(8, 40);
          return typed(`Find the ${ord(n)} term of the AP ${seq([a, a + d, a + 2 * d])}, …`, num(a + (n - 1) * d),
            ['Use aₙ = a + (n − 1)d.', `a = ${n_(a)}, d = ${n_(d)}, n = ${n}.`],
            [`a${subN(n)} = ${n_(a)} + (${n} − 1)${pn(d)}`, `= ${n_(a)} + ${n_((n - 1) * d)}`, `= ${n_(a + (n - 1) * d)}`],
            [[String(a + n * d), 'You used a + nd. Only (n − 1) jumps are needed from the first term.']]);
        }),
        tp('which-term', (r) => {
          const a = r.int(-5, 20), d = r.pick([2, 3, 4, 5, 6, 7, -3, -4]), n = r.int(10, 60);
          const x = a + (n - 1) * d;
          return typed(`Which term of the AP ${seq([a, a + d, a + 2 * d])}, … is ${n_(x)}?`, num(n),
            ['Set a + (n − 1)d equal to the number.', `${n_(a)} + (n − 1)${pn(d)} = ${n_(x)}`],
            [`(n − 1)${pn(d)} = ${n_(x - a)}`, `n − 1 = ${n - 1}`, `n = ${n}`],
            [[String(n - 1), 'You found n − 1. Add 1 to get n.']]);
        }),
        tp('count', (r) => {
          const k = r.pick([3, 4, 6, 7, 8, 9, 11, 12, 13]);
          const two = r.next() < 0.5;
          const lo = two ? 10 : 100, hi = two ? 99 : 999;
          const first = Math.ceil(lo / k) * k, last = Math.floor(hi / k) * k;
          const n = (last - first) / k + 1;
          return typed(`How many ${two ? 'two' : 'three'}-digit numbers are divisible by ${k}?`, num(n),
            [`The smallest is ${first} and the largest is ${last}.`, `They form an AP with d = ${k}.`, 'Use n = (l − a)/d + 1.'],
            [`a = ${first}, l = ${last}, d = ${k}`, `n = (${last} − ${first})/${k} + 1 = ${(last - first) / k} + 1 = ${n}`],
            [[String((last - first) / k), 'Count both ends: add 1.']]);
        }, 2),
        tp('from-end', (r) => {
          const a = r.int(1, 10), d = r.int(2, 6), N = r.int(20, 40), k = r.int(3, 12);
          const l = a + (N - 1) * d;
          return typed(`Find the ${ord(k)} term from the END of the AP ${seq([a, a + d, a + 2 * d])}, …, ${l}.`, num(l - (k - 1) * d),
            ['Reverse the AP: it starts at the last term and has common difference −d.', `Use l − (k − 1)d with l = ${l}, d = ${d}.`],
            [`${ord(k)} from the end = ${l} − (${k} − 1) × ${d}`, `= ${l} − ${(k - 1) * d} = ${l - (k - 1) * d}`],
            [[String(a + (k - 1) * d), 'That is the kth term from the BEGINNING.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.prog.sum', title: 'Sum of the first n terms of an AP', prereqs: ['ts10.m.prog.nth'],
      intro: [
        h('The young Gauss trick'),
        p('Add 1 + 2 + 3 + … + 100. Write the sum forwards and backwards and add the columns: (1 + 100) + (2 + 99) + … — every pair makes 101, and there are 100 pairs. That is twice the sum, so the sum = 100 × 101 ÷ 2 = 5050.'),
        p('The same pairing works for any AP: first + last = second + second-last = … So the sum is (number of terms) × (first + last) ÷ 2.'),
        f('Sₙ = n/2 (a + l)', 'S n equals n over 2 times a plus l'),
        f('Sₙ = n/2 [2a + (n − 1)d]', 'S n equals n over 2 times 2a plus n minus 1 d'),
        p('Use the first form when you know the last term l; the second when you know d.'),
        X({
          title: 'What if? Add up an AP', formula: 'Sₙ = n/2 [2a + (n − 1)d]',
          result: ['S', 'Sum of the first n terms', 'n / 2 * (2 * a + (n - 1) * d)'],
          vars: [['a', 'First term', -20, 50, 1, 1], ['d', 'Common difference', -5, 10, 1, 1], ['n', 'Number of terms', 1, 100, 1, 100]],
          notes: [
            ['n', 'More terms add more numbers, and when d > 0 the new terms are also bigger — so the sum grows faster than n (about like n²).', 'Fewer terms: the sum drops quickly.'],
            ['a', 'Raising the first term raises every term, adding n to the sum for each step of a.', 'Lowering a lowers every term.'],
            ['d', 'A bigger d makes later terms bigger, so the sum grows.', 'A negative d makes later terms smaller (even negative), so the sum shrinks.'],
          ],
          mistakes: [
            ['Using n/2 (a + d)', 'Inside the brackets it is 2a + (n − 1)d, or a + l. d alone is not the last term.'],
            ['Using n instead of (n − 1)', 'The last term is a + (n − 1)d, so the bracket is 2a + (n − 1)d.'],
            ['Halving twice', 'n/2 is applied once to the whole bracket: for n = 10, a = 1, d = 1 → 5 × 11 = 55.'],
          ],
          real: 'Stacking logs in a pile with 20 at the bottom and one fewer in each row up: 20 + 19 + … + 1 = 20 × 21 ÷ 2 = 210 logs.',
        }),
        keys('Sₙ = n/2(a + l) = n/2[2a + (n − 1)d].', '1 + 2 + … + n = n(n + 1)/2.', 'First n odd numbers add to n².', 'aₙ = Sₙ − Sₙ₋₁.'),
        remember('Read word problems carefully: "in the 10th week" asks for a term (aₙ); "in 10 weeks" asks for a sum (Sₙ).'),
      ],
      examples: [
        ex('Find the sum of the first 20 odd numbers.', ['1, 3, 5, …: a = 1, d = 2, n = 20', 'S = 20/2 [2 + 19 × 2] = 10 × 40'], '400'),
        ex('Kavya saves ₹50 in the first week and ₹10 more each week. How much has she saved after 12 weeks?', ['a = 50, d = 10, n = 12', 'S = 12/2 [100 + 11 × 10] = 6 × 210'], '₹1260'),
      ],
      practice: [
        tp('sum', (r) => {
          const a = r.int(-5, 15), d = r.pick([-2, 2, 3, 4, 5, 6]), n = r.int(10, 30);
          const S = (n * (2 * a + (n - 1) * d)) / 2;
          return typed(`Find the sum of the first ${n} terms of ${seq([a, a + d, a + 2 * d])}, …`, num(S),
            ['Use Sₙ = n/2 [2a + (n − 1)d].', `a = ${n_(a)}, d = ${n_(d)}, n = ${n}.`],
            [`S = ${n}/2 [2(${n_(a)}) + ${n - 1}(${n_(d)})]`, `= ${n / 2} × ${2 * a + (n - 1) * d}`, `= ${n_(S)}`],
            [[String((n * (2 * a + n * d)) / 2), 'Use (n − 1)d, not nd.'], [String(a + (n - 1) * d), 'That is the nth term, not the sum.']]);
        }),
        tp('sum-al', (r) => {
          const a = r.int(2, 20), d = r.int(2, 7), n = r.pick([10, 12, 14, 15, 16, 20, 25]);
          const l = a + (n - 1) * d;
          const S = (n * (a + l)) / 2;
          return typed(`An AP has ${n} terms. Its first term is ${a} and its last term is ${l}. Find the sum of all its terms.`, num(S),
            ['You know the last term, so use Sₙ = n/2 (a + l).'],
            [`S = ${n}/2 × (${a} + ${l})`, `= ${n / 2} × ${a + l} = ${S}`]);
        }),
        tp('save', (r) => {
          const a = r.pick([20, 30, 50, 100]), d = r.pick([5, 10, 15, 20]), n = r.int(8, 26);
          const who = nm(r);
          const S = (n * (2 * a + (n - 1) * d)) / 2;
          const term = r.next() < 0.35;
          if (term) return typed(`${who} saves ₹${a} in the first week and ₹${d} more than the previous week every week after that. How much does ${who} save IN week ${n}?`, num(a + (n - 1) * d, '₹'),
            ['"In week n" asks for one term, not a total.', 'Use aₙ = a + (n − 1)d.'],
            [`a${subN(n)} = ${a} + ${n - 1} × ${d} = ₹${a + (n - 1) * d}`],
            [[String(S), 'That is the total saved over all the weeks. The question asks for one week.']]);
          return typed(`${who} saves ₹${a} in the first week and ₹${d} more than the previous week every week after that. What is the TOTAL saved in ${n} weeks?`, num(S, '₹'),
            ['"Total in n weeks" asks for the sum Sₙ.', `a = ${a}, d = ${d}, n = ${n}.`],
            [`S = ${n}/2 [2 × ${a} + ${n - 1} × ${d}]`, `= ${n / 2} × ${2 * a + (n - 1) * d} = ${inr(S)}`],
            [[String(a + (n - 1) * d), 'That is only the amount saved in the last week.']]);
        }, 2),
        tp('naturals', (r) => {
          const k = r.pick([1, 2, 3, 5, 7, 8]), n = r.int(10, 40);
          const S = (k * n * (n + 1)) / 2;
          return typed(k === 1 ? `Find 1 + 2 + 3 + … + ${n}.` : `Find the sum of the first ${n} multiples of ${k}.`, num(S),
            [k === 1 ? 'Use n(n + 1)/2.' : `The multiples ${k}, ${2 * k}, ${3 * k}, … form an AP with a = d = ${k}.`, k === 1 ? '' : `Sum = ${k} × (1 + 2 + … + ${n}).`].filter(Boolean),
            [k === 1 ? `${n} × ${n + 1} ÷ 2 = ${S}` : `${k} × ${n} × ${n + 1} ÷ 2 = ${S}`]);
        }),
      ],
    },
    {
      id: 'ts10.m.prog.gp', title: 'Geometric progressions and the nth term', prereqs: ['ts10.m.prog.ap'],
      intro: [
        h('Patterns that grow by multiplying'),
        p('One bacterium splits into 2 every hour: 1, 2, 4, 8, 16, … A ₹10,00,000 car loses one-tenth of its value each year: 10,00,000, 9,00,000, 8,10,000, … Here each term is the previous one MULTIPLIED by a fixed number. This is a geometric progression (GP).'),
        def('Geometric progression (GP)', 'A list of non-zero numbers in which each term after the first is obtained by multiplying the previous term by a fixed non-zero number.'),
        def('Common ratio r', 'The fixed multiplier: r = a₂ ÷ a₁ = a₃ ÷ a₂ = …'),
        p('The general GP is a, ar, ar², ar³, … To reach term n we multiply by r exactly (n − 1) times:'),
        f('aₙ = a·rⁿ⁻¹', 'a n equals a times r to the power n minus 1'),
        X({
          title: 'What if? Grow a GP', formula: 'aₙ = a·rⁿ⁻¹',
          result: ['an', 'nth term', 'a * r^(n - 1)', '', 2],
          vars: [['a', 'First term', 1, 100, 1, 3], ['r', 'Common ratio', 0.5, 3, 0.1, 2], ['n', 'Position n', 1, 15, 1, 6]],
          notes: [
            ['r', 'When r > 1 the terms explode upwards — each step multiplies again. A small rise in r makes later terms MUCH bigger.', 'When r < 1 the terms shrink towards 0 (like a depreciating vehicle).'],
            ['n', 'Each step forward multiplies by r once more.', 'Each step back divides by r.'],
            ['a', 'Doubling a doubles every term.', 'Halving a halves every term.'],
          ],
          mistakes: [
            ['Using a·rⁿ', 'The first term has no factor r, so term n has (n − 1) factors: a·rⁿ⁻¹.'],
            ['Finding r by subtracting', 'In a GP divide: r = a₂ ÷ a₁. Subtracting gives an AP\'s d.'],
            ['Calculating (a·r)ⁿ⁻¹', 'Only r is raised to the power: 3 × 2⁵ = 96, but (3 × 2)⁵ = 7776.'],
          ],
          real: 'Viral messages on WhatsApp: if each person forwards to 5 new people, the 6th round reaches 5⁵ = 3125 people.',
        }),
        h('Compound growth is a GP'),
        p('Money growing at R% per year is multiplied by (1 + R/100) every year, so the yearly amounts form a GP with r = 1 + R/100.'),
        f('A = P(1 + R/100)ⁿ'),
        X({
          title: 'What if? Compound growth', formula: 'A = P(1 + R/100)ⁿ',
          result: ['A', 'Amount after n years', 'P * (1 + R / 100)^n', '₹', 0],
          vars: [['P', 'Starting amount', 1000, 100000, 1000, 10000, '₹'], ['R', 'Rate per year', 1, 20, 0.5, 8, '%'], ['n', 'Years', 1, 20, 1, 5]],
          notes: [
            ['R', 'A higher rate means a bigger multiplier every year, and the extra compounds on itself.', 'A lower rate slows the growth a lot over many years.'],
            ['n', 'Each extra year multiplies once more — growth speeds up over time.', 'Fewer years: less compounding.'],
            ['P', 'Double the starting amount and the final amount doubles.', 'Halve it and the final amount halves.'],
          ],
          mistakes: [
            ['Adding R% of P every year (simple interest)', 'Compound growth takes R% of the NEW amount each year, so the growth itself grows.'],
            ['Using R instead of R/100', 'At 8% the multiplier is 1.08, not 9.'],
          ],
          real: 'A Telangana village of 10,000 people growing 10% a year has 10,000 × 1.1³ = 13,310 people after 3 years.',
        }),
        keys('GP: multiply by the same r each time.', 'r = (any term) ÷ (the term before it).', 'aₙ = a·rⁿ⁻¹.', 'Compound growth: r = 1 + R/100.'),
        remember('AP → add d (constant differences). GP → multiply by r (constant ratios). Check which one before using a formula.'),
      ],
      examples: [
        ex('Find the 8th term of 5, 10, 20, …', ['a = 5, r = 10 ÷ 5 = 2', 'a₈ = 5 × 2⁷ = 5 × 128'], '640'),
        ex('Which term of 2, 6, 18, … is 486?', ['a = 2, r = 3', '2 × 3ⁿ⁻¹ = 486 → 3ⁿ⁻¹ = 243 = 3⁵', 'n − 1 = 5'], 'The 6th term'),
        ex('A village has 10,000 people and grows 10% a year. Find the population after 3 years.', ['r = 1.1', '10000 × 1.1³ = 10000 × 1.331'], '13,310'),
      ],
      practice: [
        tp('ratio', (r) => {
          const a = r.pick([2, 3, 4, 5, 6, 8, 81, 64, 48]);
          const rr = r.pick([[2, 1], [3, 1], [-2, 1], [1, 2], [-1, 3], [1, 4], [4, 1], [-3, 1]] as [number, number][]);
          const [pp, qq] = rr;
          const terms = [a];
          for (let i = 0; i < 3; i++) terms.push((terms[i] * pp) / qq);
          const show = terms.map((t) => (Number.isInteger(t) ? n_(t) : fx(Math.round(t * qq ** 3), qq ** 3)));
          return typed(`Find the common ratio of the GP ${show.join(', ')}, …`, frac(pp, qq),
            ['Divide a term by the term BEFORE it.', `r = ${show[1]} ÷ ${show[0]}`],
            [`r = ${show[1]} ÷ ${show[0]} = ${fx(pp, qq)}`, `Check: ${show[2]} ÷ ${show[1]} = ${fx(pp, qq)} ✓`],
            [[fr(qq, pp), 'Upside down: divide the LATER term by the earlier term.'], [String(terms[1] - terms[0]), 'That is a difference. In a GP we divide.']]);
        }),
        tp('nth', (r) => {
          const a = r.pick([1, 2, 3, 4, 5, 6]), q = r.pick([2, 3, -2]), n = r.int(4, q === 3 ? 7 : 9);
          const v = a * q ** (n - 1);
          return typed(`Find the ${ord(n)} term of the GP ${seq([a, a * q, a * q * q])}, …`, num(v),
            ['Use aₙ = a·rⁿ⁻¹.', `a = ${a}, r = ${n_(q)}, n − 1 = ${n - 1}.`],
            [`a${subN(n)} = ${a} × ${pn(q)}${SUP[n - 1]}`, `= ${a} × ${n_(q ** (n - 1))} = ${n_(v)}`],
            [[String(a * q ** n), 'Use rⁿ⁻¹, not rⁿ.']]);
        }),
        tp('which', (r) => {
          const a = r.pick([1, 2, 3, 5]), q = r.pick([2, 3]), n = r.int(4, q === 2 ? 10 : 7);
          const v = a * q ** (n - 1);
          return typed(`Which term of the GP ${seq([a, a * q, a * q * q])}, … is ${v}?`, num(n),
            [`${a} × ${q}ⁿ⁻¹ = ${v}`, `${q}ⁿ⁻¹ = ${v / a} = ${q}${SUP[n - 1]}`],
            [`${q}ⁿ⁻¹ = ${v / a} = ${q}${SUP[n - 1]}`, `n − 1 = ${n - 1}`, `n = ${n}`],
            [[String(n - 1), 'That is n − 1. Add 1.']]);
        }, 2),
        tp('kind', (r) => {
          const k = r.int(0, 2);
          const a = r.int(2, 6), m = r.int(2, 4);
          const xs = k === 0 ? [a, a + m, a + 2 * m, a + 3 * m] : k === 1 ? [a, a * m, a * m * m, a * m ** 3] : [a, a + m, a + 3 * m, a + 6 * m];
          const ans = k === 0 ? 'An AP' : k === 1 ? 'A GP' : 'Neither';
          return mcq(r, `What kind of progression is ${seq(xs)}, …?`, ans, ['An AP', 'A GP', 'Neither'].filter((x) => x !== ans),
            ['Check differences (AP) and ratios (GP).'],
            [`Differences: ${xs.slice(1).map((x, i) => x - xs[i]).join(', ')}`, `Ratios: ${xs.slice(1).map((x, i) => fx(x, xs[i])).join(', ')}`, `${ans}.`]);
        }),
        tp('grow', (r) => {
          const P = r.pick([10000, 20000, 50000, 8000]), R = r.pick([10, 20, 5]), n = r.int(2, 3);
          const A = rd(P * (1 + R / 100) ** n, 2);
          return typed(`A sum of ${inr(P)} grows at ${R}% per year, compounded yearly. What is it worth after ${n} years?`, num(A, '₹'),
            [`Each year multiplies by 1 + ${R}/100 = ${1 + R / 100}.`, `A = ${P} × ${1 + R / 100}${SUP[n]}`],
            [`r = ${1 + R / 100}`, `A = ${P} × ${rd((1 + R / 100) ** n, 6)} = ${inr(A)}`],
            [[String(P + (P * R * n) / 100), 'That is simple interest. With compounding, each year earns on the new total.']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 7 COORDINATE GEOMETRY
const TRIP: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
const ch7: USpec = {
  id: 'ts10.m.ch7', subject: 'math', title: 'Coordinate Geometry', source: src(7),
  objectives: [
    {
      id: 'ts10.m.coord.distance', title: 'Distance formula',
      intro: [
        h('How far apart are two points?'),
        p('On a map grid of Hyderabad, Charminar is at (1, 2) and the Golconda gate is at (−5, 10) (in km). How far apart are they "as the crow flies"? Draw a right triangle: the horizontal leg is the change in x, the vertical leg is the change in y, and the distance is the hypotenuse.'),
        f('d = √[(x₂ − x₁)² + (y₂ − y₁)²]', 'd equals root of x2 minus x1 squared plus y2 minus y1 squared'),
        p('Charminar → Golconda: √[(−6)² + 8²] = √100 = 10 km. The order of the points does not matter because the differences are squared.'),
        vis({ kind: 'triangle', a: 6, b: 8 }, 'Right triangle with legs 6 and 8 (changes in x and y), hypotenuse 10 (the distance)'),
        p('Distance of P(x, y) from the origin O(0, 0): √(x² + y²).'),
        X({
          title: 'What if? Move one point', formula: 'd = √[(x₂ − x₁)² + (y₂ − y₁)²]',
          result: ['d', 'Distance', 'sqrt((x2 - x1)^2 + (y2 - y1)^2)', 'units', 2],
          vars: [['x1', 'x₁', -10, 10, 1, 1], ['y1', 'y₁', -10, 10, 1, 2], ['x2', 'x₂', -10, 10, 1, 4], ['y2', 'y₂', -10, 10, 1, 6]],
          notes: [
            ['x2', 'Moving B further sideways from A lengthens the horizontal leg, so the distance grows (once B is to the right of A).', 'Moving B back towards A shortens the horizontal leg; distance is smallest when x₂ = x₁.'],
            ['y2', 'Moving B further up from A lengthens the vertical leg.', 'Moving B level with A (y₂ = y₁) leaves only the horizontal distance.'],
            ['x1', 'Moving A changes the same horizontal gap from the other end.', 'The distance depends only on the GAP, not where the points are.'],
          ],
          mistakes: [
            ['√(a² + b²) = a + b', '√(6² + 8²) = √100 = 10, not 6 + 8 = 14. You cannot split a square root over a sum.'],
            ['Mixing coordinates: (x₂ − y₁)', 'Subtract x from x and y from y.'],
            ['Losing the sign before squaring', '(−6)² = 36. Squaring always gives a positive number.'],
          ],
          real: 'GPS apps compute straight-line distances between map coordinates with exactly this Pythagoras idea (on a small area of the Earth).',
        }),
        keys('d = √[(x₂ − x₁)² + (y₂ − y₁)²].', 'From origin: √(x² + y²).', 'Use it to classify triangles (equal sides) and to test collinearity (AB + BC = AC).'),
        remember('The distance is never negative. Simplify the square root at the end (√50 = 5√2).'),
      ],
      examples: [
        ex('Find the distance between (2, 3) and (4, 1).', ['Δx = 2, Δy = −2', 'd = √(4 + 4) = √8'], '2√2 units'),
        ex('Show that (1, 7), (4, 2), (−1, −1) and (−4, 4) are the vertices of a square.', ['Each side: √(9 + 25) = √34', 'Diagonals: (1,7)–(−1,−1): √(4 + 64) = √68; (4,2)–(−4,4): √(64 + 4) = √68', 'Equal sides and equal diagonals'], 'It is a square'),
      ],
      practice: [
        tp('dist', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const x1 = r.int(-6, 6), y1 = r.int(-6, 6);
          const sx = r.pick([1, -1]), sy = r.pick([1, -1]);
          const swap = r.next() < 0.5;
          const x2 = x1 + sx * (swap ? b : a), y2 = y1 + sy * (swap ? a : b);
          return typed(`Find the distance between A${pt(x1, y1)} and B${pt(x2, y2)}.`, num(c),
            ['Find x₂ − x₁ and y₂ − y₁.', `Δx = ${n_(x2 - x1)}, Δy = ${n_(y2 - y1)}.`, 'Square, add, then take the square root.'],
            [`d = √[${pn(x2 - x1)}² + ${pn(y2 - y1)}²]`, `= √(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = √${c * c}`, `= ${c} units`],
            [[String(Math.abs(x2 - x1) + Math.abs(y2 - y1)), 'You added the legs. The distance is the hypotenuse: square, add, square-root.'], [String(c * c), 'Take the square root at the end.']]);
        }),
        tp('origin', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const x = r.pick([1, -1]) * a, y = r.pick([1, -1]) * b;
          return typed(`How far is the point ${pt(x, y)} from the origin?`, num(c),
            ['Use √(x² + y²).'],
            [`√(${x * x} + ${y * y}) = √${c * c} = ${c}`]);
        }),
        tp('unknown', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const x1 = r.int(-4, 4), y1 = r.int(-4, 4);
          const x2 = x1 + a;
          const y = y1 + b;
          return typed(`The distance between ${pt(x1, y1)} and ${pt(x2, 0).replace(', 0)', ', y)')} is ${c} units, and y > ${n_(y1)}. Find y.`, num(y),
            ['Set up the distance formula equal to ' + c + '.', `${a}² + (y − ${pn(y1)})² = ${c}²`],
            [`${a * a} + (y − ${pn(y1)})² = ${c * c}`, `(y − ${pn(y1)})² = ${b * b}`, `y − ${pn(y1)} = ${b} (positive, since y > ${n_(y1)})`, `y = ${n_(y)}`]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.coord.section', title: 'Section formula, midpoint and trisection', prereqs: ['ts10.m.coord.distance'],
      intro: [
        h('Finding a point part-way along'),
        p('A straight road joins Kazipet A(1, 2) and Hanamkonda B(7, 11). A bus stop is to be built so that it is twice as far from A as from B — it divides AB in the ratio 2 : 1. Where is it?'),
        def('Internal division in ratio m : n', 'P lies on AB with AP : PB = m : n.'),
        f('P = ( (m·x₂ + n·x₁)/(m + n) , (m·y₂ + n·y₁)/(m + n) )', 'P equals m x2 plus n x1 over m plus n, and the same for y'),
        p('Think of it as a weighted average: the bigger part m is attached to the FAR point B, which pulls P towards B. For the bus stop: x = (2 × 7 + 1 × 1)/3 = 5, y = (2 × 11 + 1 × 2)/3 = 8 → (5, 8).'),
        def('Midpoint (ratio 1 : 1)', '((x₁ + x₂)/2, (y₁ + y₂)/2) — just the average of the coordinates.'),
        def('Points of trisection', 'The two points dividing AB into three equal parts — ratios 1 : 2 and 2 : 1.'),
        X({
          title: 'What if? Slide the dividing point', formula: 'x = (m·x₂ + n·x₁)/(m + n)',
          result: ['x', 'x-coordinate of P', '(m * x2 + n * x1) / (m + n)', '', 2],
          vars: [['m', 'm (part next to A)', 1, 10, 1, 1], ['n', 'n (part next to B)', 1, 10, 1, 1], ['x1', 'x₁ (point A)', -10, 10, 1, -2], ['x2', 'x₂ (point B)', -10, 10, 1, 8]],
          notes: [
            ['m', 'A bigger m means AP is a bigger share of AB, so P moves towards B.', 'A smaller m means P stays closer to A.'],
            ['n', 'A bigger n makes PB longer, so P moves back towards A.', 'A smaller n lets P approach B.'],
            ['x2', 'Moving B to the right drags P along, but only by the fraction m/(m + n).', 'Moving B left pulls P left by the same fraction.'],
          ],
          mistakes: [
            ['Pairing m with x₁', 'm multiplies the coordinate of the FAR end B: (m·x₂ + n·x₁). Pairing m with x₁ gives the point dividing in n : m.'],
            ['Dividing by m·n or by 2', 'Divide by m + n (the total number of parts). Divide by 2 only for the midpoint.'],
            ['Giving only one trisection point', 'There are two: ratio 1 : 2 (near A) and 2 : 1 (near B).'],
          ],
          real: 'Animation software uses this "weighted average of two points" (called linear interpolation) to move a character smoothly from one position to another.',
        }),
        keys('Section: ((mx₂ + nx₁)/(m + n), (my₂ + ny₁)/(m + n)).', 'Midpoint: average the coordinates.', 'Trisection: ratios 1 : 2 and 2 : 1.'),
        remember('To find the ratio in which a point divides a segment, call the ratio k : 1 and solve for k.'),
      ],
      examples: [
        ex('Find the point dividing A(1, 2) and B(7, 11) in the ratio 2 : 1.', ['x = (2 × 7 + 1 × 1)/3 = 15/3 = 5', 'y = (2 × 11 + 1 × 2)/3 = 24/3 = 8'], '(5, 8)'),
        ex('Find the points of trisection of A(2, −2) and B(−7, 4).', ['Ratio 1 : 2: ((−7 + 4)/3, (4 − 4)/3) = (−1, 0)', 'Ratio 2 : 1: ((−14 + 2)/3, (8 − 2)/3) = (−4, 2)'], '(−1, 0) and (−4, 2)'),
        ex('In what ratio does (−4, 6) divide the join of (−6, 10) and (3, −8)?', ['Let the ratio be k : 1', 'x: (3k − 6)/(k + 1) = −4 → 3k − 6 = −4k − 4 → k = 2/7'], '2 : 7'),
      ],
      practice: [
        tp('section', (r) => {
          const m = r.int(1, 4);
          let n = r.int(1, 4);
          while (gcd(m, n) !== 1) n = r.int(1, 4);
          const t = r.pick([1, 2, -1, -2]), u = r.pick([1, 2, 3, -1, -2]);
          const x1 = r.int(-6, 6), y1 = r.int(-6, 6);
          const x2 = x1 + (m + n) * t, y2 = y1 + (m + n) * u;
          const px = x1 + m * t, py = y1 + m * u;
          const ask = r.pick(['x', 'y'] as const);
          return typed(`P divides the line segment joining A${pt(x1, y1)} and B${pt(x2, y2)} internally in the ratio ${m} : ${n}. Find the ${ask}-coordinate of P.`, num(ask === 'x' ? px : py),
            ['Use the section formula; m goes with B, n goes with A.', ask === 'x' ? `x = (${m} × ${pn(x2)} + ${n} × ${pn(x1)}) / ${m + n}` : `y = (${m} × ${pn(y2)} + ${n} × ${pn(y1)}) / ${m + n}`],
            [`x = (${m * x2} ${n * x1 < 0 ? '−' : '+'} ${Math.abs(n * x1)}) / ${m + n} = ${n_(px)}`, `y = (${m * y2} ${n * y1 < 0 ? '−' : '+'} ${Math.abs(n * y1)}) / ${m + n} = ${n_(py)}`, `P = ${pt(px, py)}`],
            [[String(ask === 'x' ? (m * x1 + n * x2) / (m + n) : (m * y1 + n * y2) / (m + n)), 'You paired m with A. m multiplies the coordinate of B.']]);
        }),
        tp('midpoint', (r) => {
          const x1 = r.int(-9, 9), y1 = r.int(-9, 9), x2 = r.int(-9, 9), y2 = r.int(-9, 9);
          const ask = r.pick(['x', 'y'] as const);
          const v = ask === 'x' ? (x1 + x2) / 2 : (y1 + y2) / 2;
          return typed(`Find the ${ask}-coordinate of the midpoint of ${pt(x1, y1)} and ${pt(x2, y2)}.`, num(v),
            ['The midpoint is the average of the coordinates.', ask === 'x' ? `(${n_(x1)} + ${pn(x2)}) / 2` : `(${n_(y1)} + ${pn(y2)}) / 2`],
            [`Midpoint = (${fx(x1 + x2, 2)}, ${fx(y1 + y2, 2)})`],
            [[String(ask === 'x' ? (x2 - x1) / 2 : (y2 - y1) / 2), 'Add the coordinates (do not subtract), then halve.']]);
        }),
        tp('trisect', (r) => {
          const x1 = r.int(-6, 6), y1 = r.int(-6, 6), t = r.pick([1, 2, -1, -2, 3]), u = r.pick([1, -1, 2, -3]);
          const x2 = x1 + 3 * t, y2 = y1 + 3 * u;
          return typed(`Find the x-coordinate of the point of trisection of A${pt(x1, y1)} and B${pt(x2, y2)} that is NEARER to A.`, num(x1 + t),
            ['Nearer to A means ratio 1 : 2.', `x = (1 × ${pn(x2)} + 2 × ${pn(x1)}) / 3`],
            [`Ratio 1 : 2: x = (${n_(x2)} + ${n_(2 * x1)}) / 3 = ${n_(x1 + t)}`, `The point is ${pt(x1 + t, y1 + u)}; the other trisection point is ${pt(x1 + 2 * t, y1 + 2 * u)}.`],
            [[String(x1 + 2 * t), 'That point divides AB in 2 : 1, so it is nearer to B.']]);
        }, 2),
        tp('ratio', (r) => {
          const m = r.int(1, 5);
          let n = r.int(1, 5);
          while (gcd(m, n) !== 1 || m === n) n = r.int(1, 5);
          const t = r.pick([1, 2, -1]), u = r.pick([1, -1, 2]);
          const x1 = r.int(-5, 5), y1 = r.int(-5, 5);
          const P = pt(x1 + m * t, y1 + m * u);
          return mcq(r, `In what ratio does ${P} divide the segment joining ${pt(x1, y1)} and ${pt(x1 + (m + n) * t, y1 + (m + n) * u)}?`, `${m} : ${n}`, [`${n} : ${m}`, `${m} : ${m + n}`, `${m + n} : ${n}`, '1 : 1'],
            ['Let the ratio be k : 1 and use the x-coordinates.', 'Or compare how far P is from A and from B along x.'],
            [`From A to P the x-coordinate changes by ${n_(m * t)}; from P to B by ${n_(n * t)}.`, `Ratio = ${Math.abs(m * t)} : ${Math.abs(n * t)} = ${m} : ${n}`]);
        }, 3),
      ],
    },
    {
      id: 'ts10.m.coord.centroid', title: 'Centroid of a triangle', prereqs: ['ts10.m.coord.section'],
      intro: [
        h('The balancing point'),
        p('Cut a triangle out of cardboard. There is exactly one point where it balances on a pencil tip — the centroid. It is where the three medians meet (a median joins a vertex to the midpoint of the opposite side), and it divides each median in the ratio 2 : 1.'),
        def('Centroid G', 'The point of intersection of the medians of a triangle.'),
        f('G = ( (x₁ + x₂ + x₃)/3 , (y₁ + y₂ + y₃)/3 )', 'G equals the average of the x-coordinates and the average of the y-coordinates'),
        p('So the centroid is simply the AVERAGE of the three vertices.'),
        X({
          title: 'What if? Move a vertex', formula: 'Gx = (x₁ + x₂ + x₃)/3',
          result: ['Gx', 'x-coordinate of the centroid', '(x1 + x2 + x3) / 3', '', 2],
          vars: [['x1', 'x₁', -10, 10, 1, 1], ['x2', 'x₂', -10, 10, 1, 5], ['x3', 'x₃', -10, 10, 1, 6]],
          notes: [
            ['x1', 'Moving one vertex 3 units right moves the centroid only 1 unit right — each vertex has one-third of the say.', 'Moving it left drags the centroid left by a third as much.'],
            ['x2', 'Same effect: a third of the movement.', 'Same effect in reverse.'],
            ['x3', 'Same effect: a third of the movement.', 'Same effect in reverse.'],
          ],
          mistakes: [
            ['Dividing by 2', 'There are three vertices, so divide by 3.'],
            ['Thinking the centroid is the midpoint of the longest side', 'The centroid is always INSIDE the triangle, two-thirds of the way along each median.'],
          ],
          real: 'Engineers find the centroid of a triangular metal plate so they know where to attach a hook so it hangs level.',
        }),
        keys('G = average of the three vertices.', 'Medians meet at G and are divided 2 : 1 from the vertex.', 'Missing vertex: x₃ = 3Gx − x₁ − x₂.'),
        remember('The centroid always lies inside the triangle.'),
      ],
      examples: [
        ex('Find the centroid of the triangle with vertices (3, −5), (−7, 4) and (10, −2).', ['x = (3 − 7 + 10)/3 = 2', 'y = (−5 + 4 − 2)/3 = −1'], 'G(2, −1)'),
        ex('The centroid of a triangle is (1, 3). Two vertices are (−2, 4) and (5, 1). Find the third.', ['x₃ = 3 × 1 − (−2) − 5 = 0', 'y₃ = 3 × 3 − 4 − 1 = 4'], '(0, 4)'),
      ],
      practice: [
        tp('centroid', (r) => {
          const gx = r.int(-5, 5), gy = r.int(-5, 5);
          const x1 = r.int(-9, 9), x2 = r.int(-9, 9), y1 = r.int(-9, 9), y2 = r.int(-9, 9);
          const x3 = 3 * gx - x1 - x2, y3 = 3 * gy - y1 - y2;
          const ask = r.pick(['x', 'y'] as const);
          return typed(`Find the ${ask}-coordinate of the centroid of the triangle with vertices ${pt(x1, y1)}, ${pt(x2, y2)} and ${pt(x3, y3)}.`, num(ask === 'x' ? gx : gy),
            ['Add the three coordinates and divide by 3.'],
            [`x = (${n_(x1)} + ${pn(x2)} + ${pn(x3)})/3 = ${n_(gx)}`, `y = (${n_(y1)} + ${pn(y2)} + ${pn(y3)})/3 = ${n_(gy)}`, `G = ${pt(gx, gy)}`],
            [[String(ask === 'x' ? 3 * gx : 3 * gy), 'You found the sum. Divide by 3.']]);
        }),
        tp('missing', (r) => {
          const gx = r.int(-4, 4), gy = r.int(-4, 4);
          const x1 = r.int(-8, 8), x2 = r.int(-8, 8), y1 = r.int(-8, 8), y2 = r.int(-8, 8);
          const x3 = 3 * gx - x1 - x2, y3 = 3 * gy - y1 - y2;
          const ask = r.pick(['x', 'y'] as const);
          return typed(`The centroid of a triangle is ${pt(gx, gy)}. Two vertices are ${pt(x1, y1)} and ${pt(x2, y2)}. Find the ${ask}-coordinate of the third vertex.`, num(ask === 'x' ? x3 : y3),
            ['(x₁ + x₂ + x₃)/3 = Gx, so x₃ = 3Gx − x₁ − x₂.'],
            [`x₃ = 3(${n_(gx)}) − ${pn(x1)} − ${pn(x2)} = ${n_(x3)}`, `y₃ = 3(${n_(gy)}) − ${pn(y1)} − ${pn(y2)} = ${n_(y3)}`],
            [[String(ask === 'x' ? gx - x1 - x2 : gy - y1 - y2), 'Multiply the centroid coordinate by 3 first.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.coord.area', title: 'Area of a triangle, collinearity and Heron\'s formula', prereqs: ['ts10.m.coord.distance'],
      intro: [
        h('Area straight from coordinates'),
        p('A farmer in Medak marks the corners of a triangular field with GPS coordinates. Can we find its area without measuring any height? Yes:'),
        f('Area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|', 'half the absolute value of x1 times y2 minus y3 plus …'),
        p('The bars | | mean "take the positive value" — area cannot be negative (the sign just depends on whether you went round clockwise).'),
        p('If the area comes out as 0, the three points do not make a triangle — they lie on one straight line. They are collinear.'),
        X({
          title: 'What if? Drag a vertex of the field', formula: 'Area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|',
          result: ['A', 'Area', 'abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2', 'sq units', 2],
          vars: [['x1', 'x₁', -8, 8, 1, 0], ['y1', 'y₁', -8, 8, 1, 0], ['x2', 'x₂', -8, 8, 1, 6], ['y2', 'y₂', -8, 8, 1, 0], ['x3', 'x₃', -8, 8, 1, 2], ['y3', 'y₃', -8, 8, 1, 4]],
          notes: [
            ['y3', 'With base along the x-axis, raising the third vertex increases the height, so the area grows.', 'Lower it to y₃ = 0 and all three points are on the x-axis: area 0, collinear.'],
            ['x3', 'Sliding the top vertex sideways keeps the same base and height, so the area does not change!', 'Same: sliding parallel to the base never changes the area.'],
            ['x2', 'A longer base gives more area.', 'A shorter base gives less area.'],
          ],
          mistakes: [
            ['Forgetting the ½', 'The bracket gives TWICE the area.'],
            ['Leaving a negative answer', 'Take the absolute value — area is never negative.'],
            ['Mixing up the cycle', 'The pattern is x₁(y₂ − y₃), x₂(y₃ − y₁), x₃(y₁ − y₂): each x pairs with the OTHER two ys in cyclic order.'],
          ],
          real: 'Land survey software splits a plot into triangles and adds their coordinate areas to compute the plot\'s area for land records.',
        }),
        h('Heron\'s formula: area from three sides'),
        p('If you know the three side lengths a, b, c (for example by measuring with a tape), first find the semi-perimeter s = (a + b + c)/2.'),
        f('Area = √[s(s − a)(s − b)(s − c)]', 'root of s times s minus a times s minus b times s minus c'),
        X({
          title: 'What if? Change a side of the triangle', formula: 'Area = √[s(s − a)(s − b)(s − c)],  s = (a + b + c)/2',
          result: ['A', 'Area (0 means the sides cannot form a triangle)', 'sqrt(max(0, (a + b + c) / 2 * ((b + c - a) / 2) * ((a + c - b) / 2) * ((a + b - c) / 2)))', 'sq units', 2],
          vars: [['a', 'Side a', 1, 30, 1, 13], ['b', 'Side b', 1, 30, 1, 14], ['c', 'Side c', 1, 30, 1, 15]],
          notes: [
            ['a', 'A longer side opens the triangle up — until a gets close to b + c, when the triangle flattens and the area falls to 0.', 'A shorter side squeezes the triangle; if a ≤ |b − c| it cannot close up at all.'],
            ['b', 'Changing b reshapes the triangle; area is largest when the triangle is "balanced".', 'If b becomes too short, the sides no longer meet.'],
            ['c', 'Same idea: area grows, then collapses when c ≥ a + b.', 'Same idea in reverse.'],
          ],
          mistakes: [
            ['Using the perimeter instead of the SEMI-perimeter', 's is HALF the perimeter: for 13, 14, 15, s = 21, not 42.'],
            ['Ignoring the triangle inequality', 'Each side must be less than the sum of the other two, otherwise s − (that side) ≤ 0 and there is no triangle.'],
          ],
          real: 'Farmers who can only measure the three sides of a triangular field with a chain use Heron\'s formula to find its area.',
        }),
        keys('Coordinate area: ½|x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|.', 'Area = 0 ⇔ collinear.', 'Heron: s = (a + b + c)/2, Area = √[s(s − a)(s − b)(s − c)].'),
        remember('For a quadrilateral, split it into two triangles along a diagonal and add the areas.'),
      ],
      examples: [
        ex('Find the area of the triangle with vertices (1, −1), (−4, 6) and (−3, −5).', ['½|1(6 + 5) + (−4)(−5 + 1) + (−3)(−1 − 6)|', '= ½|11 + 16 + 21|', '= ½ × 48'], '24 sq units'),
        ex('Find k if (2, 3), (4, k) and (6, −3) are collinear.', ['Area = 0: 2(k + 3) + 4(−3 − 3) + 6(3 − k) = 0', '2k + 6 − 24 + 18 − 6k = 0 → −4k = 0'], 'k = 0'),
        ex('A triangular plot has sides 13 m, 14 m and 15 m. Find its area.', ['s = 42/2 = 21', 'Area = √(21 × 8 × 7 × 6) = √7056'], '84 m²'),
      ],
      practice: [
        tp('area', (r) => {
          const x1 = r.int(-5, 5), y1 = r.int(-5, 5), x2 = r.int(-5, 5), y2 = r.int(-5, 5);
          let x3 = r.int(-5, 5), y3 = r.int(-5, 5);
          let twice = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
          if (twice === 0) { x3 += 3; y3 += 1; twice = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2); }
          if (twice === 0) { y3 += 2; twice = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2); }
          const A = Math.abs(twice) / 2;
          return typed(`Find the area of the triangle with vertices ${pt(x1, y1)}, ${pt(x2, y2)} and ${pt(x3, y3)}.`, num(A),
            ['Use ½|x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|.', `y₂ − y₃ = ${n_(y2 - y3)}, y₃ − y₁ = ${n_(y3 - y1)}, y₁ − y₂ = ${n_(y1 - y2)}.`],
            [`½|${n_(x1)}(${n_(y2 - y3)}) + ${pn(x2)}(${n_(y3 - y1)}) + ${pn(x3)}(${n_(y1 - y2)})|`, `= ½|${n_(x1 * (y2 - y3))} + ${pn(x2 * (y3 - y1))} + ${pn(x3 * (y1 - y2))}| = ½ × ${Math.abs(twice)}`, `= ${A} sq units`],
            [[String(Math.abs(twice)), 'Do not forget the ½.'], [String(twice / 2), 'Area cannot be negative — take the absolute value.']]);
        }),
        tp('collinear-k', (r) => {
          const x1 = r.int(-4, 4), y1 = r.int(-4, 4), m = r.pick([-3, -2, -1, 1, 2, 3]);
          const d1 = r.int(1, 3), d2 = r.int(4, 6);
          const x2 = x1 + d1, y2 = y1 + m * d1, x3 = x1 + d2, k = y1 + m * d2;
          return typed(`The points ${pt(x1, y1)}, ${pt(x2, y2)} and (${n_(x3)}, k) are collinear. Find k.`, num(k),
            ['Collinear means the triangle has zero area.', 'Or: the "rise per step" must stay the same along the line.'],
            [`From the first two points: y changes by ${n_(m * d1)} when x changes by ${d1}, i.e. ${n_(m)} per unit.`, `From x = ${n_(x1)} to x = ${n_(x3)} is ${d2} units, so k = ${n_(y1)} + ${d2} × ${pn(m)} = ${n_(k)}`, 'Check: the area formula gives 0 ✓']);
        }, 2),
        tp('heron', (r) => {
          const T: [number, number, number, number][] = [[13, 14, 15, 84], [5, 5, 6, 12], [5, 5, 8, 12], [6, 8, 10, 24], [9, 10, 17, 36], [10, 13, 13, 60], [7, 15, 20, 42], [13, 13, 24, 60], [8, 15, 17, 60], [11, 13, 20, 66], [14, 25, 25, 168]];
          const [a, b, c, A] = r.pick(T);
          const s = (a + b + c) / 2;
          return typed(`A triangular park in Khammam has sides ${a} m, ${b} m and ${c} m. Use Heron's formula to find its area.`, num(A, 'm²'),
            [`s = (${a} + ${b} + ${c}) / 2 = ${s}`, `s − a = ${s - a}, s − b = ${s - b}, s − c = ${s - c}`],
            [`s = ${s}`, `Area = √(${s} × ${s - a} × ${s - b} × ${s - c}) = √${s * (s - a) * (s - b) * (s - c)}`, `= ${A} m²`],
            [[String(rd(Math.sqrt(2 * s * (2 * s - a) * (2 * s - b) * (2 * s - c)), 2)), 'Use the SEMI-perimeter s = half the perimeter.']]);
        }),
      ],
    },
    {
      id: 'ts10.m.coord.slope', title: 'Slope of a line', prereqs: ['ts10.m.coord.distance'],
      intro: [
        h('How steep is it?'),
        p('A ghat road to Ananthagiri hills climbs 1 m for every 10 m it goes forward. A wheelchair ramp might rise 1 m in 12 m. Steepness is "rise over run" — the slope.'),
        def('Slope (gradient) m', 'For a line through (x₁, y₁) and (x₂, y₂) with x₁ ≠ x₂, the change in y divided by the change in x.'),
        f('m = (y₂ − y₁)/(x₂ − x₁)', 'm equals y2 minus y1 over x2 minus x1'),
        p('m > 0: the line rises from left to right. m < 0: it falls. m = 0: horizontal. For a vertical line x₂ = x₁, so the slope is not defined.'),
        X({
          title: 'What if? Tilt the line', formula: 'm = (y₂ − y₁)/(x₂ − x₁)',
          result: ['m', 'Slope', '(y2 - y1) / (x2 - x1)', '', 3],
          vars: [['x1', 'x₁', -5, 0, 1, -1], ['y1', 'y₁', -8, 8, 1, 1], ['x2', 'x₂', 1, 8, 1, 3], ['y2', 'y₂', -8, 8, 1, 5]],
          notes: [
            ['y2', 'Raising the second point makes the rise bigger, so the line gets steeper.', 'Lowering it below y₁ makes the slope negative — the line falls.'],
            ['x2', 'Moving the second point further right spreads the same rise over a longer run, so the line gets flatter.', 'Moving it closer (smaller run) makes the line steeper; with x₂ = x₁ the slope would be undefined.'],
            ['y1', 'Raising the first point reduces the rise, so the slope falls.', 'Lowering the first point increases the rise.'],
          ],
          mistakes: [
            ['Run over rise: (x₂ − x₁)/(y₂ − y₁)', 'Slope is change in y OVER change in x.'],
            ['Mixing the order: (y₂ − y₁)/(x₁ − x₂)', 'Subtract in the same order top and bottom, or the sign flips.'],
            ['Saying a vertical line has slope 0', 'A horizontal line has slope 0. A vertical line\'s slope is undefined (division by 0).'],
          ],
          real: 'Road signs show slopes as percentages: a 10% gradient means a rise of 10 m per 100 m — a slope of 0.1.',
        }),
        keys('m = (y₂ − y₁)/(x₂ − x₁).', 'Positive: rising; negative: falling; zero: horizontal; vertical: undefined.', 'Same slope for any two points on the same line.'),
        remember('Three points are collinear exactly when the slope AB equals the slope BC.'),
      ],
      examples: [
        ex('Find the slope of the line through (2, 3) and (6, 11).', ['m = (11 − 3)/(6 − 2) = 8/4'], 'm = 2'),
        ex('Find the slope of the line through (−3, 4) and (5, −2).', ['m = (−2 − 4)/(5 + 3) = −6/8'], 'm = −3/4 (the line falls)'),
      ],
      practice: [
        tp('slope', (r) => {
          const x1 = r.int(-6, 4), y1 = r.int(-6, 6);
          const dx = r.pick([1, 2, 3, 4, 5, 6, -2, -3]), dy = r.int(-8, 8);
          const x2 = x1 + dx, y2 = y1 + dy;
          return typed(`Find the slope of the line through ${pt(x1, y1)} and ${pt(x2, y2)}.`, frac(dy, dx),
            ['m = (y₂ − y₁)/(x₂ − x₁).', `Rise = ${n_(dy)}, run = ${n_(dx)}.`],
            [`m = (${n_(y2)} − ${pn(y1)})/(${n_(x2)} − ${pn(x1)}) = ${n_(dy)}/${n_(dx)} = ${fx(dy, dx)}`],
            dy !== 0 ? [[fr(dx, dy), 'Upside down: slope is rise over run (y over x).'], [fr(-dy, dx), 'Check the sign: subtract in the same order on top and bottom.']] : []);
        }),
        tp('slope-kind', (r) => {
          const k = r.int(0, 3);
          const x1 = r.int(-5, 3), y1 = r.int(-5, 5), d = r.int(1, 5);
          const P2 = k === 0 ? [x1 + d, y1 + r.int(1, 6)] : k === 1 ? [x1 + d, y1 - r.int(1, 6)] : k === 2 ? [x1 + d, y1] : [x1, y1 + d];
          const ans = ['Rising (positive slope)', 'Falling (negative slope)', 'Horizontal (slope 0)', 'Vertical (slope not defined)'][k];
          return mcq(r, `The line through ${pt(x1, y1)} and ${pt(P2[0], P2[1])} is:`, ans, ['Rising (positive slope)', 'Falling (negative slope)', 'Horizontal (slope 0)', 'Vertical (slope not defined)'].filter((x) => x !== ans),
            ['Compare the changes in x and y.', 'If x does not change, you cannot divide by the run.'],
            [`Rise = ${n_(P2[1] - y1)}, run = ${n_(P2[0] - x1)}`, ans]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 8 SIMILAR TRIANGLES
const ch8: USpec = {
  id: 'ts10.m.ch8', subject: 'math', title: 'Similar Triangles', source: src(8),
  objectives: [
    {
      id: 'ts10.m.sim.figures', title: 'Similar figures and scale factor',
      intro: [
        h('Same shape, different size'),
        p('A passport photo and its enlarged print, a map of Telangana and the real state, a model of the Charminar and the monument itself — each pair has the same shape but different sizes. Such figures are similar.'),
        def('Similar polygons', 'Two polygons with the same number of sides are similar if (i) their corresponding angles are equal and (ii) their corresponding sides are in the same ratio.'),
        def('Scale factor', 'The common ratio of corresponding sides: (side of image) ÷ (side of original). k > 1 enlarges, k < 1 reduces.'),
        p('BOTH conditions matter for polygons in general: a square and a rhombus have sides in the same ratio but different angles; a square and a rectangle have equal angles but sides not in the same ratio. Neither pair is similar.'),
        def('Congruent figures', 'Similar figures with scale factor 1 — same shape AND same size.'),
        f('new length = k × original length'),
        X({
          title: 'What if? Change the scale factor', formula: 'L = k × l',
          result: ['L', 'Length in the copy', 'k * l', 'cm', 2],
          vars: [['k', 'Scale factor', 0.1, 5, 0.1, 2], ['l', 'Length in the original', 1, 20, 0.5, 6, 'cm']],
          notes: [
            ['k', 'k > 1 enlarges: every length is multiplied by the same k, so the shape stays the same.', 'k < 1 reduces the figure; k = 1 gives a congruent copy.'],
            ['l', 'A longer original side gives a proportionally longer copy.', 'A shorter side gives a shorter copy, in the same ratio.'],
          ],
          mistakes: [
            ['Adding instead of multiplying', 'Enlarging a 4 × 6 photo by "adding 2 cm" gives 6 × 8, which is NOT the same shape (4/6 ≠ 6/8). Similar figures need multiplication.'],
            ['Thinking equal angles are enough for any polygon', 'A rectangle 2 × 8 and a square have equal angles but different shapes. (For triangles, equal angles ARE enough.)'],
            ['Scaling area by k', 'Lengths scale by k, but area scales by k² — see the areas lesson.'],
          ],
          real: 'A map with scale 1 : 50,000 uses k = 1/50,000: 4 cm on the map is 2,00,000 cm = 2 km on the ground.',
        }),
        keys('Similar: same shape, maybe different size.', 'Polygons: equal angles AND proportional sides.', 'All circles, all squares and all equilateral triangles are similar.'),
        remember('Write similar figures with vertices in matching order: if ABCD ~ PQRS then A ↔ P, B ↔ Q, …'),
      ],
      examples: [
        ex('A 4 cm × 6 cm photo is enlarged so that its shorter side is 10 cm. Find the longer side.', ['Scale factor k = 10/4 = 5/2', 'Longer side = 6 × 5/2'], '15 cm'),
        ex('On a map of scale 1 : 2,00,000, Hyderabad and Secunderabad stations are 5 cm apart. Find the real distance.', ['Real = 5 × 2,00,000 cm = 10,00,000 cm', '= 10 km'], '10 km'),
      ],
      practice: [
        tp('scale', (r) => {
          const [pp, q] = r.pick([[3, 2], [2, 1], [5, 2], [3, 1], [4, 3], [5, 4]] as [number, number][]);
          const a = r.int(2, 6), b = r.int(a + 1, 9);
          const w = q * a, hh = q * b;
          return typed(`A ${w} cm × ${hh} cm photo is enlarged (keeping the same shape) so that the ${w} cm side becomes ${pp * a} cm. What does the ${hh} cm side become?`, num(pp * b, 'cm'),
            ['Find the scale factor: new ÷ old.', `k = ${pp * a}/${w} = ${fx(pp, q)}`],
            [`k = ${pp * a} ÷ ${w} = ${fx(pp, q)}`, `New side = ${hh} × ${fx(pp, q)} = ${pp * b} cm`],
            [[String(hh + pp * a - w), 'Adding the same amount changes the shape. Multiply by the scale factor instead.']]);
        }),
        tp('map', (r) => {
          const N = r.pick([50000, 100000, 200000, 250000, 500000]), d = r.int(2, 12);
          const km = (d * N) / 100000;
          return typed(`A map of Telangana has scale 1 : ${N.toLocaleString('en-IN')}. Two towns are ${d} cm apart on the map. What is the real distance in km?`, num(km, 'km'),
            ['Every 1 cm on the map is ' + N.toLocaleString('en-IN') + ' cm on the ground.', '1 km = 1,00,000 cm.'],
            [`Real distance = ${d} × ${N.toLocaleString('en-IN')} cm = ${(d * N).toLocaleString('en-IN')} cm`, `= ${km} km`],
            [[String(d * N), 'That is in centimetres. Divide by 1,00,000 to get km.']]);
        }),
        bank('always-similar', [
          { q: 'Are any two circles always similar?', a: 'Yes', w: ['No', 'Only if they have equal radii'], h: ['Does a circle\'s shape ever change?'], s: ['Every circle is an enlargement of every other: scale factor = ratio of radii.'] },
          { q: 'Are any two squares always similar?', a: 'Yes', w: ['No', 'Only if they have equal sides'], h: ['Angles are all 90° and sides are all equal.'], s: ['All angles equal, and sides in a common ratio.'] },
          { q: 'Are any two rectangles always similar?', a: 'No', w: ['Yes', 'Only if they have equal areas'], h: ['Compare a 1 × 1 and a 1 × 5 rectangle.'], s: ['Angles match, but the side ratios can differ.'] },
          { q: 'Are any two equilateral triangles always similar?', a: 'Yes', w: ['No', 'Only if they have equal perimeters'], h: ['All angles are 60°.'], s: ['Equal angles (60° each), so they are similar.'] },
          { q: 'Are any two rhombuses always similar?', a: 'No', w: ['Yes', 'Only if they have equal sides'], h: ['A square is a rhombus. So is a "squashed" diamond.'], s: ['Sides are proportional but angles can differ.'] },
          { q: 'Are any two isosceles triangles always similar?', a: 'No', w: ['Yes', 'Only if they have equal bases'], h: ['Compare a tall thin one with a short wide one.'], s: ['The vertex angle can differ, so the shapes differ.'] },
          { q: 'Two congruent figures are always:', a: 'similar', w: ['never similar', 'similar only if they are triangles', 'different in shape'], h: ['Congruent means same shape and same size.'], s: ['Congruent figures are similar with scale factor 1.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.sim.bpt', title: 'Basic proportionality theorem (Thales)', prereqs: ['ts10.m.sim.figures'],
      intro: [
        h('A line parallel to one side cuts the others in the same ratio'),
        p('Draw triangle ABC and a line DE parallel to BC, cutting AB at D and AC at E. Measure: AD/DB comes out equal to AE/EC every time. This is the Basic Proportionality Theorem (BPT), first stated by Thales.'),
        def('Basic Proportionality Theorem', 'If a line is drawn parallel to one side of a triangle, cutting the other two sides at distinct points, it divides those two sides in the same ratio.'),
        f('DE ∥ BC  ⇒  AD/DB = AE/EC', 'A D over D B equals A E over E C'),
        p('Why? Triangles BDE and CDE stand on the same base DE between the same parallels, so they have equal areas. Comparing each with triangle ADE (same height from E or D) gives AD/DB = AE/EC.'),
        def('Converse of BPT', 'If a line divides two sides of a triangle in the same ratio, it is parallel to the third side.'),
        vis({ kind: 'triangle', a: 6, b: 8, angleLabels: ['A', 'B', 'C'] }, 'Triangle ABC with a line DE parallel to BC'),
        X({
          title: 'What if? Move the parallel line', formula: 'AE = AD × EC / DB',
          result: ['AE', 'Length AE', 'AD * EC / DB', 'cm', 2],
          vars: [['AD', 'AD', 1, 12, 0.5, 3, 'cm'], ['DB', 'DB', 1, 12, 0.5, 4, 'cm'], ['EC', 'EC', 1, 12, 0.5, 6, 'cm']],
          notes: [
            ['AD', 'Moving D away from A (bigger AD) means the parallel line is lower, so E must also move away from A: AE grows in proportion.', 'Moving D towards A makes AE shrink in the same ratio.'],
            ['DB', 'A bigger DB (with the same AD) means the line is closer to A, so AE is smaller compared to EC.', 'A smaller DB means the line is near BC, so AE is large.'],
            ['EC', 'A longer EC with the same ratio means a longer AE too.', 'A shorter EC gives a shorter AE.'],
          ],
          mistakes: [
            ['Writing AD/AB = AE/EC', 'Compare matching pieces: AD/DB = AE/EC, or whole sides AD/AB = AE/AC — do not mix a part with a whole.'],
            ['Using BPT when DE is not parallel to BC', 'The ratio rule needs DE ∥ BC. Check first (or use the converse to prove it).'],
            ['Thinking DE/BC = AD/DB', 'DE/BC = AD/AB (part over whole), because triangle ADE ~ triangle ABC.'],
          ],
          real: 'Carpenters use BPT when they cut equally-spaced parallel shelves across a sloping (triangular) frame.',
        }),
        keys('DE ∥ BC ⇒ AD/DB = AE/EC (and AD/AB = AE/AC).', 'Converse: equal ratios ⇒ parallel.'),
        remember('In exams, state the reason: "by BPT, since DE ∥ BC".'),
      ],
      examples: [
        ex('In ΔABC, DE ∥ BC, AD = 1.5 cm, DB = 3 cm, AE = 1 cm. Find EC.', ['AD/DB = AE/EC', '1.5/3 = 1/EC', 'EC = 2'], 'EC = 2 cm'),
        ex('D and E are on AB and AC with AD = 4, DB = 6, AE = 6, EC = 9. Is DE ∥ BC?', ['AD/DB = 4/6 = 2/3', 'AE/EC = 6/9 = 2/3', 'Equal ratios, so by the converse of BPT'], 'Yes, DE ∥ BC'),
      ],
      practice: [
        tp('bpt-find', (r) => {
          const pp = r.int(1, 5), q = r.int(2, 6), t = r.int(1, 4);
          const AD = pp * t + 0, DB = q * t, k = r.pick([1, 2, 3]);
          const AE = pp * k, EC = q * k;
          const askEC = r.next() < 0.5;
          return typed(askEC ? `In ΔABC, DE ∥ BC with D on AB and E on AC. AD = ${AD} cm, DB = ${DB} cm and AE = ${AE} cm. Find EC.` : `In ΔABC, DE ∥ BC with D on AB and E on AC. AD = ${AD} cm, DB = ${DB} cm and EC = ${EC} cm. Find AE.`, num(askEC ? EC : AE, 'cm'),
            ['By BPT, AD/DB = AE/EC.', askEC ? `${AD}/${DB} = ${AE}/EC` : `${AD}/${DB} = AE/${EC}`],
            [`AD/DB = ${AD}/${DB} = ${fx(AD, DB)}`, askEC ? `EC = ${AE} × ${DB} ÷ ${AD} = ${EC} cm` : `AE = ${EC} × ${AD} ÷ ${DB} = ${AE} cm`],
            askEC ? [[String(rd((AE * AD) / DB, 2)), 'Upside down: EC/AE should equal DB/AD.']] : [[String(rd((EC * DB) / AD, 2)), 'Upside down: AE/EC should equal AD/DB.']]);
        }),
        tp('converse', (r) => {
          const pp = r.int(1, 4), q = r.int(2, 5), t = r.int(1, 3), k = r.int(2, 4);
          const par = r.next() < 0.5;
          const AD = pp * t, DB = q * t, AE = pp * k, EC = q * k + (par ? 0 : 1);
          const ok = AD * EC === DB * AE;
          return mcq(r, `In ΔABC, D is on AB and E is on AC with AD = ${AD}, DB = ${DB}, AE = ${AE}, EC = ${EC} (cm). Is DE ∥ BC?`, ok ? 'Yes' : 'No', [ok ? 'No' : 'Yes'],
            ['Compare AD/DB with AE/EC.', 'Converse of BPT: equal ratios ⇒ parallel.'],
            [`AD/DB = ${fx(AD, DB)}, AE/EC = ${fx(AE, EC)}`, ok ? 'Equal, so DE ∥ BC.' : 'Not equal, so DE is not parallel to BC.']);
        }),
        tp('bpt-whole', (r) => {
          const pp = r.int(1, 4), q = r.int(1, 4), t = r.int(2, 5), k = r.int(1, 3);
          const AD = pp * t, AB = (pp + q) * t, AE = pp * k, AC = (pp + q) * k;
          return typed(`In ΔABC, DE ∥ BC. AD = ${AD} cm, AB = ${AB} cm and AC = ${AC} cm. Find AE.`, num(AE, 'cm'),
            ['With DE ∥ BC, AD/AB = AE/AC (part over whole on both sides).'],
            [`AE = AC × AD/AB = ${AC} × ${AD}/${AB} = ${AE} cm`],
            [[String(rd((AC * AD) / (AB - AD), 2)), 'You used DB instead of AB. Keep part/whole on both sides.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.sim.criteria', title: 'Criteria for similarity of triangles', prereqs: ['ts10.m.sim.bpt'],
      intro: [
        h('Short-cuts for triangles'),
        p('For triangles we do not need to check all six conditions (three angles and three ratios). Any ONE of these criteria is enough:'),
        def('AAA (or AA) similarity', 'If the corresponding angles are equal, the triangles are similar. Since the angles add to 180°, two equal pairs are enough.'),
        def('SSS similarity', 'If the corresponding sides are in the same ratio, the triangles are similar.'),
        def('SAS similarity', 'If one angle is equal and the sides including that angle are in the same ratio, the triangles are similar.'),
        p('Once similar, ALL corresponding sides are in the same ratio — so we can find unknown lengths, like the height of a tower from its shadow.'),
        h('Shadow method for heights'),
        p('At the same moment of the day, the Sun\'s rays make the same angle with the ground everywhere nearby. A stick and its shadow, and a tower and its shadow, form two similar right triangles (AA).'),
        f('H / S = h / s  ⇒  H = h × S / s', 'tower height over tower shadow equals stick height over stick shadow'),
        X({
          title: 'What if? Measure a tower with a stick', formula: 'H = h × S / s',
          result: ['H', 'Height of the tower', 'h * S / s', 'm', 2],
          vars: [['h', 'Height of the stick', 0.5, 3, 0.1, 1.5, 'm'], ['s', 'Shadow of the stick', 0.5, 5, 0.1, 2, 'm'], ['S', 'Shadow of the tower', 5, 100, 1, 40, 'm']],
          notes: [
            ['S', 'A longer tower shadow at the same time of day means a taller tower — in direct proportion.', 'A shorter shadow means a shorter tower.'],
            ['s', 'A longer stick shadow means the Sun is lower, so the same tower shadow belongs to a SHORTER tower.', 'A shorter stick shadow (Sun high) means the tower must be taller to cast the same shadow.'],
            ['h', 'A taller stick with the same shadow means steeper sun rays, so the tower is taller too.', 'A shorter stick with the same shadow means flatter rays, so the tower is shorter.'],
          ],
          mistakes: [
            ['Measuring the shadows at different times', 'The method needs the SAME Sun angle — measure both shadows at the same moment.'],
            ['Mixing corresponding sides: H/s = h/S', 'Match height with height and shadow with shadow: H/S = h/s.'],
            ['Using SSA as a criterion', 'Two sides and a NON-included angle do not guarantee similarity. The angle must be between the two sides (SAS).'],
          ],
          real: 'Thales is said to have measured the height of an Egyptian pyramid this way, using his own shadow.',
        }),
        keys('AA, SSS and SAS are enough for triangles.', 'Similar ⇒ all corresponding sides in the same ratio.', 'Shadow method: H/S = h/s.'),
        remember('Write the correspondence carefully: ΔABC ~ ΔPQR means ∠A = ∠P, ∠B = ∠Q, ∠C = ∠R and AB/PQ = BC/QR = CA/RP.'),
      ],
      examples: [
        ex('A 1.5 m stick casts a 2 m shadow when a temple gopuram casts a 40 m shadow. Find the gopuram\'s height.', ['The two triangles are similar (AA).', 'H/40 = 1.5/2', 'H = 40 × 1.5 ÷ 2'], '30 m'),
        ex('ΔABC ~ ΔDEF with AB = 4, BC = 6, DE = 6. Find EF.', ['AB/DE = BC/EF', '4/6 = 6/EF', 'EF = 9'], 'EF = 9'),
      ],
      practice: [
        bank('criterion', [
          { q: 'In ΔABC and ΔPQR, ∠A = ∠P = 50° and ∠B = ∠Q = 70°. Which criterion shows they are similar?', a: 'AA (AAA)', w: ['SSS', 'SAS', 'They need not be similar'], h: ['Two pairs of angles are equal.'], s: ['Two equal angle pairs force the third pair equal too, so AA similarity applies.'] },
          { q: 'Sides 3, 4, 5 and 6, 8, 10. Which criterion shows the triangles are similar?', a: 'SSS', w: ['AA (AAA)', 'SAS', 'They need not be similar'], h: ['Compare the ratios of all three sides.'], s: ['6/3 = 8/4 = 10/5 = 2, so SSS similarity.'] },
          { q: 'AB = 4, AC = 6, ∠A = 40°; PQ = 6, PR = 9, ∠P = 40°. Which criterion applies?', a: 'SAS', w: ['SSS', 'AA (AAA)', 'They need not be similar'], h: ['The equal angle is between the two given sides.'], s: ['6/4 = 9/6 = 3/2 and the included angles are equal: SAS similarity.'] },
          { q: 'Sides 2, 3, 4 and 4, 6, 9. Are the triangles similar?', a: 'No, the ratios differ', w: ['Yes, by SSS', 'Yes, by AA', 'Yes, by SAS'], h: ['Compare 4/2, 6/3 and 9/4.'], s: ['2, 2 and 2.25 are not all equal, so the triangles are not similar.'] },
          { q: 'Two right triangles each have a 35° angle. Are they similar?', a: 'Yes, by AA', w: ['No, sides are unknown', 'Yes, by SSS', 'Only if their hypotenuses are equal'], h: ['Each has a 90° angle and a 35° angle.'], s: ['Two pairs of equal angles (90° and 35°): AA similarity.'] },
          { q: 'Which is NOT a valid criterion for similarity of triangles?', a: 'SSA (two sides and a non-included angle)', w: ['AA', 'SSS', 'SAS'], h: ['The angle must be between the two sides.'], s: ['SSA can fit two different shapes, so it does not prove similarity.'] },
        ]),
        tp('shadow', (r) => {
          const hh = r.pick([1, 1.5, 2, 2.5, 3]), s = r.pick([1, 2, 2.5, 4, 5]), t = r.int(4, 15);
          const S = rd(s * t, 2), H = rd(hh * t, 2);
          const what = r.pick(['a flagpole at a school in Adilabad', 'a water tank in Mahbubnagar', 'a tree in Karimnagar', 'a mobile tower in Siddipet']);
          return typed(`A vertical stick ${hh} m tall casts a shadow ${s} m long. At the same time, ${what} casts a shadow ${S} m long. How tall is it?`, num(H, 'm'),
            ['The two right triangles are similar (equal Sun angle).', `H/${S} = ${hh}/${s}`],
            [`H = ${S} × ${hh} ÷ ${s}`, `= ${H} m`],
            [[String(rd((S * s) / hh, 2)), 'Match height with height and shadow with shadow: H/S = h/s.']]);
        }),
        tp('corr-side', (r) => {
          const k = r.pick([[3, 2], [2, 1], [5, 2], [4, 3], [3, 1]] as [number, number][]);
          const a = r.int(2, 6) * k[1], b = r.int(3, 8) * k[1];
          const P = (a * k[0]) / k[1], Q = (b * k[0]) / k[1];
          return typed(`ΔABC ~ ΔPQR. AB = ${a} cm, BC = ${b} cm and PQ = ${P} cm. Find QR.`, num(Q, 'cm'),
            ['Corresponding sides are in the same ratio: AB/PQ = BC/QR.', `Scale factor PQ/AB = ${fx(P, a)}.`],
            [`QR = BC × PQ/AB = ${b} × ${P}/${a} = ${Q} cm`]);
        }),
      ],
    },
    {
      id: 'ts10.m.sim.areas', title: 'Areas of similar triangles', prereqs: ['ts10.m.sim.criteria'],
      intro: [
        h('Double the sides, four times the area'),
        p('If you double every side of a triangle, its base doubles AND its height doubles, so its area (½ × base × height) becomes 2 × 2 = 4 times bigger.'),
        def('Area theorem', 'The ratio of the areas of two similar triangles equals the square of the ratio of their corresponding sides.'),
        f('ar(ABC)/ar(PQR) = (AB/PQ)² = (BC/QR)² = (CA/RP)²'),
        p('The same is true for corresponding altitudes, medians and angle bisectors — they are all lengths, so areas go as their squares.'),
        X({
          title: 'What if? Scale a triangle and watch its area', formula: 'A₂ = A₁ × (s₂/s₁)²',
          result: ['A2', 'Area of the second triangle', 'A1 * (s2 / s1)^2', 'cm²', 2],
          vars: [['A1', 'Area of the first triangle', 5, 100, 1, 24, 'cm²'], ['s1', 'A side of the first triangle', 1, 20, 0.5, 6, 'cm'], ['s2', 'Matching side of the second', 1, 20, 0.5, 12, 'cm']],
          notes: [
            ['s2', 'Doubling the matching side makes the area FOUR times bigger, because both base and height double.', 'Halving the side makes the area one quarter.'],
            ['s1', 'A bigger first side (same s₂) means the second triangle is relatively smaller, so its area falls as the square.', 'A smaller first side makes the second triangle relatively bigger.'],
            ['A1', 'A bigger first area gives a proportionally bigger second area.', 'A smaller first area gives a smaller second area.'],
          ],
          mistakes: [
            ['Area ratio = side ratio', 'Area is two-dimensional: the ratio must be SQUARED. Sides 1 : 2 give areas 1 : 4.'],
            ['Squaring the area ratio to find sides', 'Going from areas to sides, take the SQUARE ROOT: areas 9 : 16 give sides 3 : 4.'],
          ],
          real: 'A pizza (or a dosa!) twice as wide has four times as much area — so it should cost about four times as much.',
        }),
        keys('Area ratio = (side ratio)².', 'Side ratio = √(area ratio).', 'Works for altitudes and medians too.'),
        remember('Only for SIMILAR figures. Two triangles with equal sides ratios but not similar? Impossible — SSS makes them similar.'),
      ],
      examples: [
        ex('ΔABC ~ ΔPQR, AB = 4 cm, PQ = 6 cm, ar(ABC) = 48 cm². Find ar(PQR).', ['ar(PQR)/48 = (6/4)² = 9/4', 'ar(PQR) = 48 × 9/4'], '108 cm²'),
        ex('Areas of two similar triangles are 81 cm² and 49 cm². Find the ratio of their corresponding altitudes.', ['Ratio = √(81/49)'], '9 : 7'),
      ],
      practice: [
        tp('area-ratio', (r) => {
          const a = r.int(1, 7);
          let b = r.int(2, 9);
          while (b === a || gcd(a, b) !== 1) b = r.int(2, 9);
          return typed(`The sides of two similar triangles are in the ratio ${a} : ${b}. Find the ratio of their areas as a fraction.`, frac(a * a, b * b),
            ['Area ratio = (side ratio)².'],
            [`(${a}/${b})² = ${a * a}/${b * b}`],
            [[`${a}/${b}`, 'That is the side ratio. Areas go as the square.']]);
        }),
        tp('find-area', (r) => {
          const s1 = r.int(2, 8), s2 = r.int(2, 10), A1 = s1 * s1 * r.int(1, 5);
          if (s1 === s2) return typed('ΔABC ~ ΔPQR with AB = 3 cm, PQ = 6 cm and ar(ABC) = 18 cm². Find ar(PQR).', num(72, 'cm²'), ['Area ratio = (PQ/AB)² = 4'], ['18 × 4 = 72 cm²'], [['36', 'Square the side ratio: (6/3)² = 4, not 2.']]);
          const A2 = (A1 * s2 * s2) / (s1 * s1);
          return typed(`ΔABC ~ ΔPQR with AB = ${s1} cm, PQ = ${s2} cm and ar(ABC) = ${A1} cm². Find ar(PQR).`, num(A2, 'cm²'),
            ['ar(PQR)/ar(ABC) = (PQ/AB)².', `(${s2}/${s1})² = ${fx(s2 * s2, s1 * s1)}`],
            [`ar(PQR) = ${A1} × ${fx(s2 * s2, s1 * s1)} = ${A2} cm²`],
            [[String(rd((A1 * s2) / s1, 2)), 'You used the side ratio. Areas scale with its square.']]);
        }, 2),
        tp('side-from-area', (r) => {
          const pp = r.int(2, 9);
          let q = r.int(2, 11);
          while (q === pp) q = r.int(2, 11);
          const t = r.int(1, 4);
          return typed(`The areas of two similar triangles are ${pp * pp} cm² and ${q * q} cm². A side of the first is ${pp * t} cm. Find the corresponding side of the second.`, num(q * t, 'cm'),
            ['Side ratio = √(area ratio).', `√(${pp * pp}/${q * q}) = ${pp}/${q}`],
            [`Side ratio = ${pp} : ${q}`, `Second side = ${pp * t} × ${q}/${pp} = ${q * t} cm`],
            [[String(rd((pp * t * q * q) / (pp * pp), 2)), 'Take the square root of the area ratio before using it for sides.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.sim.pyth', title: 'Pythagoras theorem', prereqs: ['ts10.m.sim.criteria'],
      intro: [
        h('The most famous right-angle rule'),
        p('A ladder leans against a wall in Nizamabad. Its foot is 6 m from the wall and it reaches 8 m up. How long is the ladder? The wall, the ground and the ladder form a right triangle.'),
        def('Pythagoras theorem', 'In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.'),
        f('c² = a² + b²  (c = hypotenuse)', 'c squared equals a squared plus b squared'),
        p('Proof idea using similarity: drop a perpendicular BD from the right angle B to the hypotenuse AC. ΔADB ~ ΔABC and ΔBDC ~ ΔABC (AA), so AB² = AD·AC and BC² = DC·AC. Adding: AB² + BC² = AC(AD + DC) = AC².'),
        def('Converse', 'If c² = a² + b² for the sides of a triangle, then the angle opposite c is a right angle.'),
        vis({ kind: 'triangle', a: 6, b: 8 }, 'Right triangle with legs 6 m and 8 m; the ladder is the hypotenuse, 10 m'),
        X({
          title: 'What if? Change the legs of the right triangle', formula: 'c = √(a² + b²)',
          result: ['c', 'Hypotenuse', 'sqrt(a^2 + b^2)', 'm', 2],
          vars: [['a', 'Leg a', 1, 20, 0.5, 6, 'm'], ['b', 'Leg b', 1, 20, 0.5, 8, 'm']],
          notes: [
            ['a', 'A longer leg makes the hypotenuse longer — but by less than the increase, because only the squares add.', 'A shorter leg makes the hypotenuse shorter; it can never be shorter than the other leg.'],
            ['b', 'Same: the hypotenuse grows, always staying the longest side.', 'Same in reverse.'],
          ],
          mistakes: [
            ['c = a + b', '√(36 + 64) = 10, not 6 + 8 = 14. Square, add, then square-root.'],
            ['Adding squares when finding a LEG', 'For a leg: a² = c² − b² — subtract the smaller square from the hypotenuse\'s square.'],
            ['Using the theorem in a non-right triangle', 'c² = a² + b² holds only when the angle opposite c is 90°.'],
          ],
          real: 'Masons check a right-angled corner with the 3-4-5 rule: mark 3 m on one wall and 4 m on the other — the diagonal must be exactly 5 m.',
        }),
        keys('c² = a² + b² (c is opposite the right angle).', 'Leg: a = √(c² − b²).', 'Converse checks for a right angle.', 'Triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25 (and their multiples).'),
        remember('The hypotenuse is always the LONGEST side — use it to sanity-check your answer.'),
      ],
      examples: [
        ex('A ladder\'s foot is 6 m from a wall and it reaches 8 m up. Find its length.', ['c² = 6² + 8² = 36 + 64 = 100', 'c = 10'], '10 m'),
        ex('Is a triangle with sides 7 cm, 24 cm, 25 cm right-angled?', ['7² + 24² = 49 + 576 = 625', '25² = 625'], 'Yes, the angle opposite 25 cm is 90°'),
      ],
      practice: [
        tp('hyp', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const k = r.pick([1, 1, 2, 3]);
          return typed(`The two shorter sides of a right triangle are ${a * k} cm and ${b * k} cm. Find the hypotenuse.`, num(c * k, 'cm'),
            ['c² = a² + b².', `${a * k}² + ${b * k}² = ${(a * k) ** 2 + (b * k) ** 2}`],
            [`c² = ${(a * k) ** 2} + ${(b * k) ** 2} = ${(c * k) ** 2}`, `c = ${c * k} cm`],
            [[String((a + b) * k), 'Do not add the sides. Square, add, square-root.']]);
        }),
        tp('leg', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const k = r.pick([1, 2]);
          const what = r.pick(['ladder', 'rope from a flagpole top', 'bamboo pole']);
          return typed(`A ${c * k} m ${what} reaches a point ${b * k} m up a vertical wall. How far is its foot from the wall?`, num(a * k, 'm'),
            ['The ' + what + ' is the hypotenuse.', `a² = ${c * k}² − ${b * k}²`],
            [`a² = ${(c * k) ** 2} − ${(b * k) ** 2} = ${(a * k) ** 2}`, `a = ${a * k} m`],
            [[String(rd(Math.sqrt((c * k) ** 2 + (b * k) ** 2), 2)), 'For a leg, SUBTRACT the squares.']]);
        }),
        tp('is-right', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const right = r.next() < 0.5;
          const cc = right ? c : c + 1;
          const sides = r.shuffle([a, b, cc]);
          return mcq(r, `A triangle has sides ${sides.join(' cm, ')} cm. Is it right-angled?`, right ? 'Yes' : 'No', [right ? 'No' : 'Yes'],
            ['Check whether (longest side)² = sum of the squares of the other two.'],
            [`${a}² + ${b}² = ${a * a + b * b}`, `${cc}² = ${cc * cc}`, right ? 'Equal, so it is right-angled (converse of Pythagoras).' : 'Not equal, so it is not right-angled.']);
        }),
      ],
    },
  ],
};

// ================================================================== CH 9 TANGENTS AND SECANTS
const ch9: USpec = {
  id: 'ts10.m.ch9', subject: 'math', title: 'Tangents and Secants to a Circle', source: src(9),
  objectives: [
    {
      id: 'ts10.m.tan.props', title: 'Tangents, secants and their properties',
      intro: [
        h('A line and a circle: three possibilities'),
        p('Roll a bicycle wheel along a straight road: at every moment the wheel touches the road at exactly one point. The road is a tangent to the wheel.'),
        def('Secant', 'A line that cuts a circle at two distinct points.'),
        def('Tangent', 'A line that touches a circle at exactly one point, called the point of contact.'),
        p('A line can also miss the circle completely (no common point).'),
        h('Key property'),
        def('Tangent ⟂ radius', 'The tangent at any point of a circle is perpendicular to the radius through the point of contact.'),
        p('Reason: the radius is the SHORTEST distance from the centre to the tangent line (every other point of the tangent is outside the circle, so further away), and the shortest distance from a point to a line is the perpendicular.'),
        h('How many tangents from a point P?'),
        p('P inside the circle: none — every line through P is a secant. P on the circle: exactly one. P outside the circle: exactly two.'),
        def('Equal tangents', 'The two tangents drawn from an external point to a circle are equal in length.'),
        p('In quadrilateral OAPB (O centre, A and B points of contact), ∠OAP = ∠OBP = 90°, so ∠APB + ∠AOB = 360° − 180° = 180°.'),
        f('∠APB + ∠AOB = 180°'),
        X({
          title: 'What if? Change the angle between the tangents', formula: '∠AOB = 180° − ∠APB',
          result: ['O', 'Angle AOB at the centre', '180 - P', '°'],
          vars: [['P', 'Angle APB between the tangents', 10, 170, 1, 60, '°']],
          notes: [['P', 'Moving P closer to the circle opens the tangents wider (bigger ∠APB), so the arc between the contact points — and ∠AOB — shrinks.', 'Moving P far away makes the tangents nearly parallel (small ∠APB), so ∠AOB approaches 180°.']],
          mistakes: [
            ['Thinking ∠AOB = ∠APB', 'They are supplementary (add to 180°), because the two 90° angles at A and B use up 180° of the quadrilateral\'s 360°.'],
            ['Forgetting the right angle', 'The radius meets the tangent at exactly 90° — use it whenever a radius goes to a point of contact.'],
          ],
          real: 'A belt around two pulleys leaves each pulley along a tangent — engineers use the 90° radius–tangent angle to design belt drives.',
        }),
        keys('Secant: 2 points; tangent: 1 point.', 'Radius ⟂ tangent at the point of contact.', 'From outside: 2 equal tangents; on: 1; inside: 0.', '∠APB + ∠AOB = 180°.'),
        remember('The two tangents from P make equal angles with OP, and OP bisects ∠APB.'),
      ],
      examples: [
        ex('From P, tangents PA and PB are drawn to a circle with centre O. ∠APB = 80°. Find ∠AOB.', ['∠OAP = ∠OBP = 90°', '∠AOB = 180° − 80°'], '100°'),
        ex('Tangents PA and PB make ∠APB = 50°. Find ∠PAB.', ['PA = PB, so ΔPAB is isosceles', '∠PAB = (180° − 50°)/2'], '65°'),
      ],
      practice: [
        tp('count', (r) => {
          const R = r.int(3, 9), k = r.int(0, 2);
          const d = k === 0 ? r.int(0, R - 1) : k === 1 ? R : R + r.int(1, 8);
          const ans = String([0, 1, 2][k]);
          return mcq(r, `A circle has radius ${R} cm. A point P is ${d} cm from the centre. How many tangents can be drawn to the circle from P?`, ans, ['0', '1', '2', 'Infinitely many'].filter((x) => x !== ans),
            ['Compare the distance with the radius.', 'Inside: none; on the circle: one; outside: two.'],
            [`d = ${d} cm ${d < R ? '<' : d === R ? '=' : '>'} r = ${R} cm`, d < R ? 'P is inside, so no tangent.' : d === R ? 'P is on the circle: exactly one tangent.' : 'P is outside: exactly two tangents.']);
        }),
        tp('angle-aob', (r) => {
          const P = r.pick([30, 40, 45, 50, 60, 70, 75, 80, 90, 100, 110, 120]);
          return typed(`Tangents PA and PB are drawn from an external point P to a circle with centre O. If ∠APB = ${P}°, find ∠AOB.`, num(180 - P, '°'),
            ['∠OAP and ∠OBP are 90° each (radius ⟂ tangent).', 'Angles of quadrilateral OAPB add to 360°.'],
            [`∠AOB = 360° − 90° − 90° − ${P}°`, `= ${180 - P}°`],
            [[String(P), '∠AOB is not equal to ∠APB; they add up to 180°.']]);
        }),
        tp('angle-pab', (r) => {
          const P = r.pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 110]);
          return typed(`PA and PB are tangents from P to a circle. If ∠APB = ${P}°, find ∠PAB.`, num((180 - P) / 2, '°'),
            ['PA = PB (tangents from an external point are equal).', 'So ΔPAB is isosceles: ∠PAB = ∠PBA.'],
            [`∠PAB = (180° − ${P}°)/2 = ${(180 - P) / 2}°`],
            [[String(180 - P), 'Share the remaining angle equally between the two base angles.']]);
        }, 2),
        bank('facts', [
          { q: 'The angle between a tangent and the radius at the point of contact is:', a: '90°', w: ['45°', '60°', '180°'], h: ['The radius is the shortest distance to the tangent.'], s: ['Tangent ⟂ radius, so the angle is 90°.'] },
          { q: 'A line that meets a circle at two distinct points is called a:', a: 'secant', w: ['tangent', 'radius', 'diameter'], h: ['It "cuts" the circle.'], s: ['Two common points → secant.'] },
          { q: 'How many tangents can a circle have in total?', a: 'Infinitely many', w: ['One', 'Two', 'Four'], h: ['There is one tangent at each point of the circle.'], s: ['Every point of the circle has its own tangent.'] },
          { q: 'Two tangents from an external point to a circle are:', a: 'equal in length', w: ['perpendicular to each other', 'always parallel', 'unequal in length'], h: ['Think of the congruent triangles OAP and OBP.'], s: ['ΔOAP ≅ ΔOBP (RHS), so PA = PB.'] },
          { q: 'Tangents drawn at the two ends of a diameter are:', a: 'parallel', w: ['perpendicular', 'equal to the diameter', 'intersecting at the centre'], h: ['Both are perpendicular to the same diameter.'], s: ['Two lines perpendicular to the same line are parallel.'] },
          { q: 'From a point INSIDE a circle, how many tangents can be drawn?', a: 'None', w: ['One', 'Two', 'Infinitely many'], h: ['Any line through an inside point crosses the circle twice.'], s: ['Every line through an inside point is a secant.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.tan.length', title: 'Constructing tangents and finding their length', prereqs: ['ts10.m.tan.props'],
      intro: [
        h('Length of a tangent'),
        p('Let P be outside a circle with centre O and radius r, and let PT be a tangent. Since OT ⟂ PT, triangle OTP is right-angled at T with hypotenuse OP = d.'),
        f('PT = √(d² − r²)', 'tangent length equals root of d squared minus r squared'),
        X({
          title: 'What if? Move P away from the circle', formula: 'PT = √(d² − r²)',
          result: ['PT', 'Length of the tangent', 'sqrt(d^2 - r^2)', 'cm', 2],
          vars: [['d', 'Distance OP from the centre', 10, 30, 0.5, 13, 'cm'], ['r', 'Radius', 1, 9, 0.5, 5, 'cm']],
          notes: [
            ['d', 'Moving P further away makes the tangent longer; when d is much bigger than r, PT is almost equal to d.', 'Moving P towards the circle shortens the tangent; at d = r it would shrink to 0 (P on the circle).'],
            ['r', 'A bigger circle (same d) leaves less room, so the tangent is SHORTER.', 'A smaller circle gives a longer tangent.'],
          ],
          mistakes: [
            ['PT = d − r', 'd − r is the distance from P to the nearest point of the circle, not the tangent length. Use Pythagoras: √(d² − r²).'],
            ['Adding the squares', 'OP is the hypotenuse, so subtract: PT² = OP² − r².'],
          ],
          real: 'From a hilltop lookout, the distance to the horizon is a tangent to the Earth: √(d² − R²) where R is the Earth\'s radius.',
        }),
        h('Construction of the two tangents from an external point'),
        stepsB(
          'Draw the circle with centre O and mark the external point P. Join OP.',
          'Draw the perpendicular bisector of OP; let M be the midpoint of OP.',
          'With centre M and radius MO, draw a circle cutting the given circle at A and B.',
          'Join PA and PB — these are the required tangents.',
        ),
        p('Why it works: ∠OAP is an angle in a semicircle (on diameter OP), so it is 90°. A line perpendicular to the radius OA at A is a tangent.'),
        keys('PT = √(OP² − r²).', 'Construction uses the circle on OP as diameter.', 'Measure both tangents — they come out equal.'),
        remember('For a quadrilateral drawn around a circle, AB + CD = AD + BC (equal tangents from each vertex).'),
      ],
      examples: [
        ex('A point P is 13 cm from the centre of a circle of radius 5 cm. Find the length of the tangent from P.', ['PT² = 13² − 5² = 169 − 25 = 144', 'PT = 12'], '12 cm'),
        ex('A quadrilateral ABCD is drawn to circumscribe a circle. AB = 6, BC = 7, CD = 4 (cm). Find AD.', ['AB + CD = AD + BC', '6 + 4 = AD + 7'], 'AD = 3 cm'),
      ],
      practice: [
        tp('length', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const ask = r.pick(['PT', 'r', 'd'] as const);
          const rr = a, PT = b, d = c;
          if (ask === 'PT') return typed(`A point P is ${d} cm from the centre of a circle of radius ${rr} cm. Find the length of the tangent from P.`, num(PT, 'cm'),
            ['OT ⟂ PT, so ΔOTP is right-angled at T.', `PT² = ${d}² − ${rr}²`],
            [`PT² = ${d * d} − ${rr * rr} = ${PT * PT}`, `PT = ${PT} cm`],
            [[String(d - rr), 'd − r is not the tangent length. Use Pythagoras.']]);
          if (ask === 'r') return typed(`The tangent from a point P, ${d} cm from the centre of a circle, has length ${PT} cm. Find the radius.`, num(rr, 'cm'),
            ['r² = OP² − PT².'], [`r² = ${d * d} − ${PT * PT} = ${rr * rr}`, `r = ${rr} cm`]);
          return typed(`The tangent from P to a circle of radius ${rr} cm is ${PT} cm long. How far is P from the centre?`, num(d, 'cm'),
            ['OP is the hypotenuse of right ΔOTP.', `OP² = ${rr}² + ${PT}²`], [`OP² = ${rr * rr} + ${PT * PT} = ${d * d}`, `OP = ${d} cm`],
            [[String(rr + PT), 'Square, add, then take the square root.']]);
        }),
        tp('order', (r) => {
          const steps = ['Join the external point P to the centre O.', 'Find M, the midpoint of OP, by bisecting OP.', 'With centre M and radius MO, draw a circle cutting the given circle at A and B.', 'Join PA and PB: these are the tangents.'];
          return { type: 'order', prompt: 'Put the steps for constructing tangents from an external point P in order.', ...ordering(r, steps), hints: ['Start by joining P to the centre.', 'The circle on OP as diameter gives right angles at A and B.'], solution: steps.map((s, i) => `${i + 1}. ${s}`) };
        }),
        tp('quad', (r) => {
          const w = r.int(2, 6), x = r.int(2, 6), y = r.int(2, 6), z = r.int(2, 6);
          const AB = w + x, BC = x + y, CD = y + z, AD = z + w;
          return typed(`A quadrilateral ABCD is drawn so that all its sides touch a circle. AB = ${AB} cm, BC = ${BC} cm and CD = ${CD} cm. Find AD.`, num(AD, 'cm'),
            ['Tangents from each vertex are equal.', 'This gives AB + CD = AD + BC.'],
            [`AB + CD = AD + BC`, `${AB} + ${CD} = AD + ${BC}`, `AD = ${AD} cm`]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.tan.segment', title: 'Area of a segment formed by a secant', prereqs: ['ts10.m.tan.props'],
      intro: [
        h('Slices of a circle'),
        p('A chord (part of a secant inside the circle) cuts a circular dosa into two pieces. The smaller piece is the minor segment. To find its area, take the pizza-slice shape (sector) and remove the triangle.'),
        def('Sector', 'The region between two radii and the arc between them. Its angle at the centre is θ.'),
        def('Segment', 'The region between a chord and its arc.'),
        f('Area of sector = (θ/360) × πr²;  length of arc = (θ/360) × 2πr'),
        f('Area of minor segment = (θ/360) × πr² − ½ r² sin θ'),
        p('The triangle OAB has two sides r with angle θ between them; its area is ½ r² sin θ. For θ = 90° that is ½ r²; for θ = 60° it is (√3/4) r² (an equilateral triangle).'),
        X({
          title: 'What if? Change the angle of the slice', formula: 'Segment = (θ/360)πr² − ½r² sin θ',
          result: ['A', 'Area of the minor segment', '(θ / 360) * pi * r^2 - 0.5 * r^2 * sin(θ)', 'cm²', 2],
          vars: [['θ', 'Angle at the centre', 10, 180, 1, 90, '°'], ['r', 'Radius', 1, 30, 1, 14, 'cm']],
          notes: [
            ['θ', 'A wider angle gives a bigger sector and the chord moves towards the centre, so the segment grows fast. At 180° it is a semicircle.', 'A narrow angle gives a thin sliver: the chord almost hugs the arc.'],
            ['r', 'Doubling the radius makes the segment FOUR times bigger (area depends on r²).', 'Halving the radius makes it a quarter.'],
          ],
          mistakes: [
            ['Using (θ/360) × 2πr for area', 'That is the ARC LENGTH. Area uses πr².'],
            ['Forgetting to subtract the triangle', 'Sector − triangle = segment. The sector alone includes the triangle.'],
            ['Using r instead of r² in the triangle', 'Triangle OAB = ½ × r × r × sin θ.'],
          ],
          real: 'Engineers find the water-filled area of a partly-full round pipe using exactly this segment formula.',
        }),
        keys('Sector = θ/360 × πr².', 'Arc = θ/360 × 2πr.', 'Minor segment = sector − ΔOAB.', 'Major segment = circle − minor segment.'),
        remember('Use the value of π the question gives (22/7 or 3.14) and √3 ≈ 1.73.'),
      ],
      examples: [
        ex('Find the area of a sector of angle 60° in a circle of radius 6 cm (π = 3.14).', ['(60/360) × 3.14 × 36', '= 1/6 × 113.04'], '18.84 cm²'),
        ex('A chord of a circle of radius 10 cm subtends a right angle at the centre. Find the minor segment\'s area (π = 3.14).', ['Sector = ¼ × 3.14 × 100 = 78.5', 'Triangle = ½ × 10 × 10 = 50', 'Segment = 78.5 − 50'], '28.5 cm²'),
      ],
      practice: [
        tp('sector', (r) => {
          const R = r.pick([7, 14, 21, 28]), th = r.pick([30, 45, 60, 72, 90, 120, 150]);
          const arc = r.next() < 0.4;
          const v = arc ? (th / 360) * 2 * PI7 * R : (th / 360) * PI7 * R * R;
          return typed(arc ? `Find the length of an arc of a circle of radius ${R} cm that subtends ${th}° at the centre. (Use π = 22/7, give 2 decimal places.)` : `Find the area of a sector of radius ${R} cm and angle ${th}°. (Use π = 22/7, give 2 decimal places if needed.)`, num(rd(v, 2), arc ? 'cm' : 'cm²', false, Math.max(0.011, rd(v, 2) * 0.002)),
            [arc ? 'Arc = (θ/360) × 2πr.' : 'Sector = (θ/360) × πr².', `θ/360 = ${fx(th, 360)}`],
            [arc ? `Arc = ${fx(th, 360)} × 2 × 22/7 × ${R}` : `Area = ${fx(th, 360)} × 22/7 × ${R * R}`, `= ${rd(v, 2)} ${arc ? 'cm' : 'cm²'}`],
            [[String(rd(arc ? (th / 360) * PI7 * R * R : (th / 360) * 2 * PI7 * R, 2)), arc ? 'That is the area. Arc length uses 2πr.' : 'That is the arc length. Area uses πr².']]);
        }),
        tp('segment', (r) => {
          const R = r.pick([6, 10, 12, 14, 20, 21]), th = r.pick([60, 90]);
          const sector = (th / 360) * 3.14 * R * R;
          const tri = th === 90 ? 0.5 * R * R : (S3 / 4) * R * R;
          const v = sector - tri;
          return typed(`A chord of a circle of radius ${R} cm subtends ${th}° at the centre. Find the area of the minor segment. (π = 3.14${th === 60 ? ', √3 = 1.732' : ''})`, num(rd(v, 2), 'cm²', false, Math.max(0.05, v * 0.005)),
            [`Sector = (${th}/360) × 3.14 × ${R}².`, th === 90 ? `Triangle = ½ × ${R} × ${R}.` : `The triangle is equilateral: area = (√3/4) × ${R}².`, 'Segment = sector − triangle.'],
            [`Sector = ${rd(sector, 2)} cm²`, `Triangle = ${rd(tri, 2)} cm²`, `Segment = ${rd(sector, 2)} − ${rd(tri, 2)} = ${rd(v, 2)} cm²`],
            [[String(rd(sector, 2)), 'That is the whole sector. Subtract the triangle.']], { steps: [st('Area of the sector (cm²)?', num(rd(sector, 2), undefined, false, 0.05)), st('Area of the triangle (cm²)?', num(rd(tri, 2), undefined, false, 0.05))] });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 10 MENSURATION
const v3 = (x: number) => rd(x, 2);
const ch10: USpec = {
  id: 'ts10.m.ch10', subject: 'math', title: 'Mensuration', source: src(10),
  objectives: [
    {
      id: 'ts10.m.mens.solids', title: 'Surface area and volume of cylinders, cones and spheres',
      intro: [
        h('The solids around us'),
        p('A water pipe is a cylinder, an ice-cream cone is a cone, a cricket ball is a sphere, and half a coconut shell is a hemisphere. Before combining solids we need each one\'s formulas.'),
        def('Curved surface area (CSA)', 'The area of the curved part only (e.g. the label of a tin).'),
        def('Total surface area (TSA)', 'CSA plus the flat faces (e.g. the label plus the top and bottom lids).'),
        def('Slant height l of a cone', 'The distance from the tip to the edge of the base: l = √(r² + h²).'),
        f('Cylinder: CSA = 2πrh, TSA = 2πr(r + h), V = πr²h'),
        f('Cone: CSA = πrl, TSA = πr(l + r), V = ⅓πr²h'),
        f('Sphere: SA = 4πr², V = (4/3)πr³;  Hemisphere: CSA = 2πr², TSA = 3πr², V = (2/3)πr³'),
        p('A cone holds exactly one-third of the cylinder with the same base and height — try filling a cylinder with three cones of sand!'),
        X({
          title: 'What if? Resize a cone', formula: 'V = ⅓πr²h',
          result: ['V', 'Volume of the cone', 'pi * r^2 * h / 3', 'cm³', 1],
          vars: [['r', 'Radius', 1, 20, 0.5, 7, 'cm'], ['h', 'Height', 1, 40, 0.5, 12, 'cm']],
          notes: [
            ['r', 'The radius is squared: double the radius and the cone holds FOUR times as much.', 'Halve the radius and the volume drops to a quarter.'],
            ['h', 'Volume grows in direct proportion to height.', 'Half the height, half the volume.'],
          ],
          mistakes: [
            ['Forgetting the ⅓', 'Without ⅓ you have the volume of a CYLINDER with the same base and height.'],
            ['Using slant height l for volume', 'Volume uses the vertical height h; l is only for curved surface area.'],
            ['Using the diameter as r', 'If the diameter is 14 cm the radius is 7 cm.'],
          ],
          real: 'A conical heap of paddy in a Telangana field: knowing its radius and height tells the farmer how many quintals it holds.',
        }),
        X({
          title: 'What if? Inflate a ball', formula: 'V = (4/3)πr³',
          result: ['V', 'Volume of the sphere', '4 / 3 * pi * r^3', 'cm³', 1],
          vars: [['r', 'Radius', 1, 20, 0.5, 7, 'cm']],
          notes: [['r', 'Volume depends on r³: double the radius and the ball holds 8 times as much air.', 'Halve the radius and the volume is one-eighth.']],
          mistakes: [
            ['Mixing up 4πr² and (4/3)πr³', 'Surface area (square units) uses r²; volume (cubic units) uses r³.'],
            ['Using 2/3 for a full sphere', '(2/3)πr³ is a HEMISPHERE; a full sphere is (4/3)πr³.'],
          ],
          real: 'A football with radius 11 cm holds about 5,577 cm³ of air — nearly 5.6 litres.',
        }),
        keys('Areas in cm², volumes in cm³.', 'Slant height l = √(r² + h²).', 'Cone = ⅓ cylinder; hemisphere = ½ sphere.'),
        remember('1 litre = 1000 cm³, and 1 m³ = 1000 litres.'),
      ],
      examples: [
        ex('Find the volume of a cylinder of radius 7 cm and height 10 cm.', ['V = πr²h = 22/7 × 49 × 10'], '1540 cm³'),
        ex('Find the curved surface area of a cone with radius 6 cm and height 8 cm. (π = 3.14)', ['l = √(36 + 64) = 10 cm', 'CSA = πrl = 3.14 × 6 × 10'], '188.4 cm²'),
      ],
      practice: [
        tp('volume', (r) => {
          const R = r.pick([7, 14, 3.5, 21]);
          const kind = r.pick(['cylinder', 'cone', 'sphere', 'hemisphere'] as const);
          const H = r.pick([6, 9, 10, 12, 15, 24]);
          const v = kind === 'cylinder' ? PI7 * R * R * H : kind === 'cone' ? (PI7 * R * R * H) / 3 : kind === 'sphere' ? (4 / 3) * PI7 * R ** 3 : (2 / 3) * PI7 * R ** 3;
          const fml = kind === 'cylinder' ? 'πr²h' : kind === 'cone' ? '⅓πr²h' : kind === 'sphere' ? '(4/3)πr³' : '(2/3)πr³';
          const desc = kind === 'sphere' || kind === 'hemisphere' ? `a ${kind} of radius ${R} cm` : `a ${kind} of radius ${R} cm and height ${H} cm`;
          return typed(`Find the volume of ${desc}. (Use π = 22/7.)`, num(v3(v), 'cm³', false, Math.max(0.011, v * 0.002)),
            [`V = ${fml}.`, kind === 'sphere' || kind === 'hemisphere' ? `r³ = ${rd(R ** 3, 3)}` : `r² = ${R * R}`],
            [`V = ${fml} = ${v3(v)} cm³`],
            kind === 'cone' ? [[String(v3(PI7 * R * R * H)), 'That is the cylinder\'s volume. A cone is one-third of it.']] : kind === 'hemisphere' ? [[String(v3((4 / 3) * PI7 * R ** 3)), 'That is a whole sphere. A hemisphere is half.']] : []);
        }),
        tp('slant', (r) => {
          const [a, b, c] = r.pick(TRIP);
          return typed(`A cone has base radius ${a} cm and height ${b} cm. Find its slant height.`, num(c, 'cm'),
            ['l = √(r² + h²).'],
            [`l = √(${a * a} + ${b * b}) = √${c * c} = ${c} cm`],
            [[String(a + b), 'Square, add, then square-root.']]);
        }),
        tp('csa', (r) => {
          const R = r.pick([7, 14, 21]);
          const kind = r.pick(['cylinder', 'sphere', 'hemisphere-total'] as const);
          const H = r.pick([5, 10, 12, 20]);
          const v = kind === 'cylinder' ? 2 * PI7 * R * H : kind === 'sphere' ? 4 * PI7 * R * R : 3 * PI7 * R * R;
          const q = kind === 'cylinder' ? `the curved surface area of a cylinder of radius ${R} cm and height ${H} cm` : kind === 'sphere' ? `the surface area of a sphere of radius ${R} cm` : `the total surface area of a solid hemisphere of radius ${R} cm`;
          return typed(`Find ${q}. (Use π = 22/7.)`, num(v3(v), 'cm²', false, 0.011),
            [kind === 'cylinder' ? 'CSA = 2πrh.' : kind === 'sphere' ? 'SA = 4πr².' : 'TSA = curved 2πr² + flat circle πr² = 3πr².'],
            [`= ${v3(v)} cm²`],
            kind === 'hemisphere-total' ? [[String(v3(2 * PI7 * R * R)), 'A SOLID hemisphere also has a flat circular face: add πr².']] : []);
        }),
      ],
    },
    {
      id: 'ts10.m.mens.sa', title: 'Surface area of combinations of solids', prereqs: ['ts10.m.mens.solids'],
      intro: [
        h('Paint only what you can see'),
        p('A toy top is a cone stuck on a hemisphere. To paint it, we need the area of its OUTSIDE. Where the cone joins the hemisphere, the two circular faces are hidden inside — so they are not counted.'),
        stepsB('Break the object into familiar solids.', 'For each part, decide which surfaces are visible (usually only the curved ones).', 'Add the visible areas. Do NOT just add the total surface areas.'),
        p('Example: a capsule = a cylinder with a hemisphere on each end. Visible surface = CSA of cylinder + 2 × CSA of hemisphere = 2πrh + 4πr².'),
        f('Capsule surface = 2πrh + 4πr²'),
        X({
          title: 'What if? Change the capsule', formula: 'S = 2πrh + 4πr²',
          result: ['S', 'Outer surface area', '2 * pi * r * h + 4 * pi * r^2', 'mm²', 1],
          vars: [['r', 'Radius', 1, 10, 0.5, 2.5, 'mm'], ['h', 'Length of the cylindrical part', 0, 30, 0.5, 10, 'mm']],
          notes: [
            ['h', 'A longer middle adds a band of area 2πr per mm: area grows steadily (linearly).', 'With h = 0 the capsule is just a sphere: 4πr².'],
            ['r', 'Radius appears in both parts — and squared in the ends — so area grows faster than proportionally.', 'A thinner capsule needs much less coating.'],
          ],
          mistakes: [
            ['Adding total surface areas', 'The flat circles where the parts join are hidden inside — they must not be counted.'],
            ['Using the total length as h', 'If the whole capsule is 15 mm long with radius 2.5 mm, the cylinder part is 15 − 2 × 2.5 = 10 mm.'],
          ],
          real: 'Pharmaceutical companies compute capsule surface areas to decide how much coating each one needs.',
        }),
        keys('Count only exposed surfaces.', 'Hidden joins are not painted.', 'Find the cylinder part\'s length carefully when the total length is given.'),
        remember('Tent = cylinder (CSA) + cone (CSA). No floor, no hidden join.'),
      ],
      examples: [
        ex('A toy is a cone of radius 3.5 cm on a hemisphere of the same radius. The total height is 15.5 cm. Find its surface area. (π = 22/7)', ['Cone height = 15.5 − 3.5 = 12 cm', 'l = √(3.5² + 12²) = √156.25 = 12.5 cm', 'CSA cone = 22/7 × 3.5 × 12.5 = 137.5 cm²', 'CSA hemisphere = 2 × 22/7 × 3.5² = 77 cm²'], '214.5 cm²'),
        ex('A tent is a cylinder of radius 14 m and height 3 m topped by a cone of slant height 15 m. Find the canvas needed. (π = 22/7)', ['Cylinder: 2 × 22/7 × 14 × 3 = 264 m²', 'Cone: 22/7 × 14 × 15 = 660 m²'], '924 m²'),
      ],
      practice: [
        tp('toy', (r) => {
          const [a, b, c] = r.pick(TRIP.slice(0, 6));
          const k = r.pick([0.5, 1, 1.5]);
          const R = a * k, Hc = b * k, l = c * k;
          const S = PI7 * R * l + 2 * PI7 * R * R;
          return typed(`A toy is a cone of radius ${R} cm and height ${Hc} cm mounted on a hemisphere of the same radius. Find the total outer surface area. (π = 22/7)`, num(v3(S), 'cm²', false, Math.max(0.011, S * 0.002)),
            [`Slant height l = √(${R}² + ${Hc}²) = ${l} cm.`, 'Outer surface = CSA of cone + CSA of hemisphere = πrl + 2πr².'],
            [`l = ${l} cm`, `πrl = ${v3(PI7 * R * l)} cm²`, `2πr² = ${v3(2 * PI7 * R * R)} cm²`, `Total = ${v3(S)} cm²`],
            [[String(v3(PI7 * R * (l + R) + 3 * PI7 * R * R)), 'You added total surface areas. The joining circles are hidden.']]);
        }, 2),
        tp('tent', (r) => {
          const R = r.pick([7, 14, 21]), H = r.int(2, 5), l = r.pick([10, 15, 25]);
          const S = 2 * PI7 * R * H + PI7 * R * l;
          return typed(`A tent at a Medaram jatara camp is a cylinder of radius ${R} m and height ${H} m with a conical top of slant height ${l} m. How much canvas is needed (no floor)? (π = 22/7)`, num(v3(S), 'm²', false, 0.011),
            ['Canvas = CSA of cylinder + CSA of cone.', `2πrh = 2 × 22/7 × ${R} × ${H}; πrl = 22/7 × ${R} × ${l}`],
            [`Cylinder: ${v3(2 * PI7 * R * H)} m²`, `Cone: ${v3(PI7 * R * l)} m²`, `Total: ${v3(S)} m²`]);
        }, 2),
        tp('capsule', (r) => {
          const R = r.pick([3.5, 7]), H = r.pick([7, 10, 14, 20]);
          const S = 2 * PI7 * R * H + 4 * PI7 * R * R;
          return typed(`A capsule-shaped water tank is a cylinder of length ${H} m with a hemisphere of radius ${R} m at each end. Find its outer surface area. (π = 22/7)`, num(v3(S), 'm²', false, 0.011),
            ['Two hemispheres make one sphere: 4πr².', 'Add the cylinder\'s curved surface 2πrh.'],
            [`2πrh = ${v3(2 * PI7 * R * H)} m²`, `4πr² = ${v3(4 * PI7 * R * R)} m²`, `Total = ${v3(S)} m²`]);
        }),
      ],
    },
    {
      id: 'ts10.m.mens.vol', title: 'Volume of combinations of solids', prereqs: ['ts10.m.mens.solids'],
      intro: [
        h('Volumes simply add (or subtract)'),
        p('Unlike surface area, volume has no hidden parts: the space inside a combined solid is just the sum of the spaces inside each part. If a part is cut out (like a cone drilled out of a cylinder), subtract its volume.'),
        f('V(ice cream) = ⅓πr²h + (2/3)πr³'),
        X({
          title: 'What if? Ice cream in a cone with a hemispherical top', formula: 'V = ⅓πr²h + (2/3)πr³',
          result: ['V', 'Volume of ice cream', 'pi * r^2 * h / 3 + 2 / 3 * pi * r^3', 'cm³', 1],
          vars: [['r', 'Radius', 1, 6, 0.5, 3.5, 'cm'], ['h', 'Height of the cone', 4, 20, 0.5, 12, 'cm']],
          notes: [
            ['r', 'Radius appears squared in the cone and cubed in the scoop, so a slightly wider cone holds a lot more.', 'A narrower cone holds much less.'],
            ['h', 'Only the cone part depends on h, so volume grows steadily with height.', 'A shorter cone loses only the cone\'s share; the scoop stays.'],
          ],
          mistakes: [
            ['Using the full height (cone + scoop) as h', 'h is the height of the CONE part only.'],
            ['Using (4/3)πr³ for the top', 'The top is a HEMISPHERE: (2/3)πr³.'],
          ],
          real: 'An ice-cream shop in Hyderabad uses this to decide how many cones one 5-litre tub can fill.',
        }),
        keys('Combined volume = sum of parts (minus anything removed).', 'Watch which height belongs to which part.', 'Convert units before adding (cm³ ↔ m³ ↔ litres).'),
        remember('1 m³ = 1000 litres; 1 litre = 1000 cm³.'),
      ],
      examples: [
        ex('A capsule has radius 0.25 cm and total length 2 cm. Find its volume. (π = 22/7)', ['Cylinder length = 2 − 0.5 = 1.5 cm', 'V = πr²(1.5) + (4/3)πr³', '= 22/7 × 0.0625 × 1.5 + 4/3 × 22/7 × 0.015625', '≈ 0.2946 + 0.0655'], '≈ 0.36 cm³'),
        ex('A solid cylinder of radius 7 cm and height 15 cm has a cone of the same radius and height 6 cm hollowed out. Find the remaining volume. (π = 22/7)', ['Cylinder = 22/7 × 49 × 15 = 2310 cm³', 'Cone = ⅓ × 22/7 × 49 × 6 = 308 cm³'], '2002 cm³'),
      ],
      practice: [
        tp('icecream', (r) => {
          const R = r.pick([3.5, 7]), H = r.pick([6, 9, 12, 15]);
          const V = (PI7 * R * R * H) / 3 + (2 / 3) * PI7 * R ** 3;
          return typed(`An ice-cream cone has radius ${R} cm and height ${H} cm, filled and topped with a hemisphere of ice cream. Find the volume of ice cream. (π = 22/7)`, num(v3(V), 'cm³', false, Math.max(0.011, V * 0.002)),
            ['Volume = cone + hemisphere.', '⅓πr²h + (2/3)πr³'],
            [`Cone: ${v3((PI7 * R * R * H) / 3)} cm³`, `Hemisphere: ${v3((2 / 3) * PI7 * R ** 3)} cm³`, `Total: ${v3(V)} cm³`],
            [[String(v3((PI7 * R * R * H) / 3 + (4 / 3) * PI7 * R ** 3)), 'The top is a HEMISPHERE: (2/3)πr³.']]);
        }),
        tp('hollow', (r) => {
          const R = r.pick([7, 14]), H = r.pick([12, 15, 18, 21]), h2 = r.pick([6, 9]);
          const V = PI7 * R * R * H - (PI7 * R * R * h2) / 3;
          return typed(`From a solid cylinder of radius ${R} cm and height ${H} cm, a cone of the same radius and height ${h2} cm is hollowed out. Find the volume left. (π = 22/7)`, num(v3(V), 'cm³', false, 0.011),
            ['Remaining = cylinder − cone.'],
            [`Cylinder: ${v3(PI7 * R * R * H)} cm³`, `Cone: ${v3((PI7 * R * R * h2) / 3)} cm³`, `Left: ${v3(V)} cm³`],
            [[String(v3(PI7 * R * R * H + (PI7 * R * R * h2) / 3)), 'The cone is REMOVED — subtract its volume.']]);
        }, 2),
        tp('tank', (r) => {
          const R = r.pick([0.7, 1.4, 2.1]), H = r.pick([2, 3, 5]);
          const L = PI7 * R * R * H * 1000 + (4 / 3) * PI7 * R ** 3 * 1000;
          return typed(`A tanker on a lorry is a cylinder of radius ${R} m and length ${H} m with a hemisphere of the same radius at each end. How many litres does it hold? (π = 22/7)`, num(rd(L, 0), 'l', false, Math.max(1, L * 0.002)),
            ['V = πr²h + (4/3)πr³ (two hemispheres make a sphere).', '1 m³ = 1000 litres.'],
            [`V = ${rd(PI7 * R * R * H, 4)} + ${rd((4 / 3) * PI7 * R ** 3, 4)} = ${rd(L / 1000, 4)} m³`, `= ${rd(L, 0)} litres`],
            [[String(rd(L / 1000, 3)), 'That is in m³. Multiply by 1000 for litres.']]);
        }, 3),
      ],
    },
    {
      id: 'ts10.m.mens.convert', title: 'Converting a solid from one shape to another', prereqs: ['ts10.m.mens.vol'],
      intro: [
        h('Melting keeps the volume'),
        p('A goldsmith in Karimnagar melts a gold ball and draws it into wire for filigree work. The shape changes completely, but the amount of metal — the volume — stays the same. (Surface area does NOT stay the same.)'),
        f('Volume before = volume after'),
        stepsB('Write the volume of the original solid.', 'Write the volume of the new solid with the unknown (height, radius or number of pieces).', 'Set them equal and solve.'),
        p('Example: sphere of radius r melted into a cylinder (wire) of radius R: (4/3)πr³ = πR²h, so h = 4r³/(3R²).'),
        X({
          title: 'What if? Draw a ball into wire', formula: 'h = 4r³ / (3R²)',
          result: ['h', 'Length of the wire/cylinder', '4 * r^3 / (3 * R^2)', 'cm', 1],
          vars: [['r', 'Radius of the sphere', 1, 10, 0.5, 6, 'cm'], ['R', 'Radius of the wire', 0.5, 10, 0.5, 2, 'cm']],
          notes: [
            ['R', 'A thicker wire uses up more metal per cm, so the wire is shorter — halve the thickness and the wire becomes 4 times longer.', 'A thinner wire stretches much further.'],
            ['r', 'The sphere\'s volume grows as r³: double the ball\'s radius and you get 8 times as much wire.', 'A smaller ball gives much less wire.'],
          ],
          mistakes: [
            ['Equating surface areas', 'Melting conserves VOLUME, not surface area.'],
            ['Mixing units', 'If the ball is in cm and the wire in mm, convert first (1 cm = 10 mm).'],
            ['Using diameter as radius', 'A wire of diameter 2 mm has radius 1 mm.'],
          ],
          real: 'Recycling plants melt aluminium cans into ingots; the volume of metal (minus losses) is what they sell.',
        }),
        keys('Volume is conserved; surface area is not.', 'Number of small pieces = big volume ÷ small volume.', 'Earth dug out = earth spread out.'),
        remember('In "how many small balls" questions, π and the 4/3 cancel — the answer is (R/r)³.'),
      ],
      examples: [
        ex('A metal sphere of radius 4.2 cm is melted and recast into a cylinder of radius 6 cm. Find the height of the cylinder.', ['(4/3)π(4.2)³ = π(6)²h', 'h = 4 × 74.088 / (3 × 36)'], '2.744 cm'),
        ex('How many lead shots of radius 1 cm can be made from a sphere of radius 4 cm?', ['n = (4/3)π(4³) ÷ (4/3)π(1³)', '= 64'], '64 shots'),
      ],
      practice: [
        tp('balls', (r) => {
          const small = r.pick([0.5, 1, 1.5, 2]), k = r.int(2, 6);
          const big = small * k;
          return typed(`A solid metal sphere of radius ${big} cm is melted and recast into small spheres of radius ${small} cm. How many small spheres are made?`, num(k ** 3),
            ['Number = (volume of big) ÷ (volume of small).', 'The (4/3)π cancels: n = (R/r)³.'],
            [`n = (${big}/${small})³ = ${k}³ = ${k ** 3}`],
            [[String(k), 'Volume goes as r³, not r — cube the ratio.'], [String(k * k), 'Volume goes as r³, not r².']]);
        }),
        tp('cone-cyl', (r) => {
          const R = r.int(2, 8), H = 3 * r.int(2, 8);
          const same = r.next() < 0.5;
          if (same) return typed(`A cone of radius ${R} cm and height ${H} cm is melted and recast into a cylinder of the SAME radius. Find the cylinder's height.`, num(H / 3, 'cm'),
            ['⅓πr²H = πr²h.', 'The πr² cancels.'], [`h = ${H}/3 = ${H / 3} cm`], [[String(3 * H), 'The cone is one-third of a cylinder — the cylinder is SHORTER.']]);
          const R2 = 2 * R;
          return typed(`A cylinder of radius ${R2} cm and height ${H} cm is melted and recast into cones of radius ${R} cm and height ${H} cm. How many cones?`, num(12),
            ['n = πR²H ÷ (⅓πr²H).', `= 3 × (${R2}/${R})²`],
            [`n = 3 × ${R2 * R2}/${R * R} = 12`]);
        }, 2),
        tp('wire', (r) => {
          const t = r.int(1, 3), R = r.pick([0.5, 1, 2]);
          const sr = 3 * t;
          const h = (4 * sr ** 3) / (3 * R * R);
          return typed(`A silver ball of radius ${sr} cm is melted and drawn into a wire of radius ${R} cm. Find the length of the wire.`, num(rd(h, 2), 'cm'),
            ['(4/3)πr³ = πR²h', 'h = 4r³/(3R²)'],
            [`h = 4 × ${sr ** 3} ÷ (3 × ${R * R})`, `= ${rd(h, 2)} cm`],
            [[String(rd((4 * sr ** 3) / (3 * R), 2)), 'Square the wire\'s radius: πR²h.']]);
        }, 2),
        tp('well', (r) => {
          const d = r.pick([2, 3, 4]), depth = r.pick([7, 14, 21]), L = r.pick([20, 22, 28]), B = r.pick([14, 11, 15]);
          const V = PI7 * (d / 2) ** 2 * depth;
          const hh = V / (L * B);
          return typed(`A well of diameter ${d} m is dug ${depth} m deep. The earth taken out is spread evenly over a rectangular field ${L} m × ${B} m. By how many centimetres does the field rise? (π = 22/7, 2 decimal places)`, num(rd(hh * 100, 2), 'cm', false, 0.02),
            ['Volume of earth = πr²h of the well.', 'Height of the layer = volume ÷ area of the field.', 'Convert m to cm at the end.'],
            [`Volume = 22/7 × ${(d / 2) ** 2} × ${depth} = ${rd(V, 3)} m³`, `Rise = ${rd(V, 3)} ÷ ${L * B} = ${rd(hh, 4)} m = ${rd(hh * 100, 2)} cm`],
            [[String(rd(hh, 4)), 'That is in metres. Multiply by 100 for centimetres.']]);
        }, 3),
      ],
    },
  ],
};

// ================================================================== CH 11 TRIGONOMETRY
type Q = [number, number];
const qadd = (a: Q, b: Q): Q => { const n = a[0] * b[1] + b[0] * a[1], d = a[1] * b[1]; const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const qmul = (k: number, a: Q): Q => { const g = gcd(Math.abs(k * a[0]), a[1]) || 1; return [(k * a[0]) / g, a[1] / g]; };
const ANG = [0, 30, 45, 60, 90];
/** squares of the ratios at the standard angles (tan 90° excluded) */
const SQ: Record<'sin' | 'cos' | 'tan', (Q | null)[]> = {
  sin: [[0, 1], [1, 4], [1, 2], [3, 4], [1, 1]],
  cos: [[1, 1], [3, 4], [1, 2], [1, 4], [0, 1]],
  tan: [[0, 1], [1, 3], [1, 1], [3, 1], null],
};
/** exact display values of the ratios at the standard angles */
const VAL: Record<'sin' | 'cos' | 'tan', string[]> = {
  sin: ['0', '1/2', '1/√2', '√3/2', '1'],
  cos: ['1', '√3/2', '1/√2', '1/2', '0'],
  tan: ['0', '1/√3', '1', '√3', 'not defined'],
};
const ch11: USpec = {
  id: 'ts10.m.ch11', subject: 'math', title: 'Trigonometry', source: src(11),
  objectives: [
    {
      id: 'ts10.m.trig.ratios', title: 'Trigonometric ratios',
      intro: [
        h('Measuring triangles through angles'),
        p('Imagine a ramp at the entrance of your school. Whether the ramp is short or long, if it is tilted at the same angle, the ratio "height ÷ length of ramp" is the same. Trigonometry studies these fixed ratios that depend only on the angle.'),
        p('In a right triangle ABC with the right angle at B, look from angle A: BC is the side OPPOSITE A, AB is the side ADJACENT to A (next to it, not the hypotenuse), and AC is the HYPOTENUSE.'),
        vis({ kind: 'triangle', a: 4, b: 3, angleLabels: ['A', 'B', 'C'] }, 'Right triangle ABC, right angle at B: AB = 4 (adjacent to A), BC = 3 (opposite A), AC = 5 (hypotenuse)'),
        def('sine', 'sin A = opposite / hypotenuse = BC/AC'),
        def('cosine', 'cos A = adjacent / hypotenuse = AB/AC'),
        def('tangent', 'tan A = opposite / adjacent = BC/AB'),
        p('Their reciprocals: cosec A = 1/sin A, sec A = 1/cos A, cot A = 1/tan A. Also tan A = sin A / cos A.'),
        f('sin A = opp/hyp,  cos A = adj/hyp,  tan A = opp/adj'),
        X({
          title: 'What if? Open the angle', formula: 'sin θ = opposite / hypotenuse',
          result: ['s', 'sin θ', 'sin(θ)', '', 3],
          vars: [['θ', 'Angle θ', 0, 90, 1, 30, '°']],
          notes: [['θ', 'As θ grows, the opposite side becomes a bigger share of the hypotenuse, so sin θ rises from 0 towards 1.', 'As θ shrinks, the opposite side shrinks, so sin θ falls towards 0.']],
          mistakes: [
            ['sin θ = opposite/adjacent', 'That is tan θ. Sine uses the hypotenuse: opposite/hypotenuse.'],
            ['Thinking sin θ changes with the size of the triangle', 'Similar triangles have the same ratios — sin θ depends ONLY on θ.'],
            ['A sine bigger than 1', 'The hypotenuse is the longest side, so sin θ and cos θ are never more than 1.'],
          ],
          real: 'Ramps for wheelchairs must have a small angle: a 1 m rise along a 12 m ramp has sin θ = 1/12, about 4.8°.',
        }),
        X({
          title: 'What if? How steep is the slope?', formula: 'tan θ = opposite / adjacent',
          result: ['t', 'tan θ', 'tan(θ)', '', 3],
          vars: [['θ', 'Angle θ', 0, 85, 1, 45, '°']],
          notes: [['θ', 'As θ approaches 90°, the adjacent side shrinks towards 0, so tan θ shoots up without limit.', 'At θ = 0° there is no rise at all: tan 0° = 0. At 45° rise = run, so tan 45° = 1.']],
          mistakes: [
            ['tan θ = adjacent/opposite', 'That is cot θ. tan is opposite over adjacent.'],
            ['Saying tan 90° = 1', 'At 90° the adjacent side is 0, so tan 90° is not defined.'],
          ],
          real: 'A road sign "gradient 1 in 10" means tan θ = 0.1.',
        }),
        keys('SOH: sin = O/H. CAH: cos = A/H. TOA: tan = O/A.', 'cosec, sec, cot are reciprocals of sin, cos, tan.', 'Ratios depend only on the angle.'),
        remember('"Opposite" and "adjacent" change when you look from the OTHER acute angle. Always label the sides from the angle in the question.'),
      ],
      examples: [
        ex('In ΔABC right-angled at B, AB = 24 cm and BC = 7 cm. Find sin A and cos A.', ['AC = √(24² + 7²) = √625 = 25', 'sin A = BC/AC = 7/25', 'cos A = AB/AC = 24/25'], 'sin A = 7/25, cos A = 24/25'),
        ex('If tan A = 4/3, find sin A.', ['Take opposite = 4k, adjacent = 3k', 'Hypotenuse = 5k', 'sin A = 4k/5k'], 'sin A = 4/5'),
      ],
      practice: [
        tp('ratio', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const at = r.pick(['A', 'C'] as const);
          const fn = r.pick(['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'] as const);
          // AB = a, BC = b, AC = c (right angle at B)
          const opp = at === 'A' ? b : a, adj = at === 'A' ? a : b;
          const val: Q = fn === 'sin' ? [opp, c] : fn === 'cos' ? [adj, c] : fn === 'tan' ? [opp, adj] : fn === 'cosec' ? [c, opp] : fn === 'sec' ? [c, adj] : [adj, opp];
          return typed(`In ΔABC, ∠B = 90°, AB = ${a} cm, BC = ${b} cm and AC = ${c} cm. Find ${fn} ${at}.`, frac(val[0], val[1]),
            [`From angle ${at}: opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${c}.`, `${fn} = ${fn === 'sin' ? 'opp/hyp' : fn === 'cos' ? 'adj/hyp' : fn === 'tan' ? 'opp/adj' : fn === 'cosec' ? 'hyp/opp' : fn === 'sec' ? 'hyp/adj' : 'adj/opp'}`],
            [`${fn} ${at} = ${val[0]}/${val[1]} = ${fr(val[0], val[1])}`],
            [[fr(val[1], val[0]), 'That is the reciprocal ratio. Check which side goes on top.']], { visual: { kind: 'triangle', a, b, angleLabels: ['A', 'B', 'C'] } });
        }),
        tp('given', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const g = gcd(gcd(a, b), c);
          const [o, ad, hy] = [b / g, a / g, c / g];
          const giv = r.pick(['sin', 'tan', 'cos'] as const);
          const want = giv === 'sin' ? r.pick(['cos', 'tan'] as const) : giv === 'tan' ? r.pick(['sin', 'cos'] as const) : r.pick(['sin', 'tan'] as const);
          const gv = giv === 'sin' ? `${o}/${hy}` : giv === 'tan' ? `${o}/${ad}` : `${ad}/${hy}`;
          const ans: Q = want === 'sin' ? [o, hy] : want === 'cos' ? [ad, hy] : [o, ad];
          return typed(`If ${giv} A = ${gv} (A acute), find ${want} A.`, frac(ans[0], ans[1]),
            ['Draw a right triangle and label two sides from the given ratio.', 'Find the third side with Pythagoras.'],
            [`Sides: opposite ${o}k, adjacent ${ad}k, hypotenuse ${hy}k`, `${want} A = ${ans[0]}/${ans[1]}`],
            [[`${ans[1]}/${ans[0]}`, 'Upside down — check the definition of the ratio.']]);
        }, 2),
        bank('recip', [
          { q: 'cosec A is the reciprocal of:', a: 'sin A', w: ['cos A', 'tan A', 'cot A'], h: ['cosec = hyp/opp.'], s: ['cosec A = 1/sin A.'] },
          { q: 'sec A is the reciprocal of:', a: 'cos A', w: ['sin A', 'tan A', 'cosec A'], h: ['sec = hyp/adj.'], s: ['sec A = 1/cos A.'] },
          { q: 'tan A equals:', a: 'sin A / cos A', w: ['cos A / sin A', 'sin A × cos A', '1/sin A'], h: ['(opp/hyp) ÷ (adj/hyp)'], s: ['sin A/cos A = opp/adj = tan A.'] },
          { q: 'If sin A = 3/5, then cosec A =', a: '5/3', w: ['3/5', '4/5', '5/4'], h: ['Reciprocal.'], s: ['cosec A = 1/sin A = 5/3.'] },
          { q: 'Which value can sin A NEVER take for an acute angle A?', a: '5/4', w: ['1/2', '0.9', '3/5'], h: ['The hypotenuse is the longest side.'], s: ['sin A = opp/hyp < 1 for acute angles, so 5/4 is impossible.'] },
          { q: 'cot A is the reciprocal of:', a: 'tan A', w: ['sin A', 'cos A', 'sec A'], h: ['cot = adj/opp.'], s: ['cot A = 1/tan A.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.trig.special', title: 'Ratios of 0°, 30°, 45°, 60° and 90°', prereqs: ['ts10.m.trig.ratios'],
      intro: [
        h('Five angles worth memorising'),
        p('45°: in a right isosceles triangle with legs 1, the hypotenuse is √2, so sin 45° = cos 45° = 1/√2 and tan 45° = 1.'),
        p('30° and 60°: cut an equilateral triangle of side 2 in half. You get a right triangle with sides 1, √3, 2 and angles 30°, 60°, 90°. So sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3, and sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3.'),
        p('0° and 90°: as the angle shrinks to 0° the opposite side vanishes (sin 0° = 0, cos 0° = 1); as it grows to 90° the adjacent side vanishes (sin 90° = 1, cos 90° = 0, tan 90° not defined).'),
        vis({ kind: 'bar-graph', labels: ['0°', '30°', '45°', '60°', '90°'], values: [0, 0.5, 0.707, 0.866, 1] }, 'sin θ at 0°, 30°, 45°, 60°, 90°: 0, 0.5, 0.707, 0.866, 1 — rising'),
        p('Memory trick for sine: √0/2, √1/2, √2/2, √3/2, √4/2. Cosine is the same list backwards.'),
        f('sin: 0, 1/2, 1/√2, √3/2, 1   cos: 1, √3/2, 1/√2, 1/2, 0   tan: 0, 1/√3, 1, √3, not defined'),
        keys('sin increases 0 → 1 as θ goes 0° → 90°; cos decreases 1 → 0.', 'tan 45° = 1; tan 90° is not defined.', 'sin 30° = cos 60° = 1/2.'),
        remember('sin²30° means (sin 30°)² = 1/4 — square the VALUE, not the angle.'),
        tip('√2 ≈ 1.414 and √3 ≈ 1.732 for decimal answers.'),
      ],
      examples: [
        ex('Evaluate sin 60° cos 30° + sin 30° cos 60°.', ['= (√3/2)(√3/2) + (1/2)(1/2)', '= 3/4 + 1/4'], '1'),
        ex('If sin(A − B) = 1/2 and cos(A + B) = 1/2 (A + B ≤ 90°), find A and B.', ['A − B = 30°, A + B = 60°', 'Add: 2A = 90° → A = 45°', 'B = 15°'], 'A = 45°, B = 15°'),
      ],
      practice: [
        tp('eval', (r) => {
          const fns = ['sin', 'cos', 'tan'] as const;
          const pickTerm = () => {
            for (;;) {
              const fn = r.pick(fns), i = r.int(0, 4), k = r.int(1, 3);
              const v = SQ[fn][i];
              if (v) return { fn, i, k, v };
            }
          };
          const t1 = pickTerm(), t2 = pickTerm();
          const minus = r.next() < 0.4;
          const val = qadd(qmul(t1.k, t1.v), qmul(minus ? -t2.k : t2.k, t2.v));
          const show = (t: typeof t1) => `${t.k === 1 ? '' : t.k + ' '}${t.fn}²${ANG[t.i]}°`;
          return typed(`Evaluate ${show(t1)} ${minus ? '−' : '+'} ${show(t2)}.`, frac(val[0], val[1]),
            ['Write each ratio\'s value, then square it.', `${t1.fn} ${ANG[t1.i]}° = ${VAL[t1.fn][t1.i]}, ${t2.fn} ${ANG[t2.i]}° = ${VAL[t2.fn][t2.i]}`],
            [`${t1.fn}²${ANG[t1.i]}° = ${fr(t1.v[0], t1.v[1])}, ${t2.fn}²${ANG[t2.i]}° = ${fr(t2.v[0], t2.v[1])}`, `${t1.k} × ${fr(t1.v[0], t1.v[1])} ${minus ? '−' : '+'} ${t2.k} × ${fr(t2.v[0], t2.v[1])} = ${fx(val[0], val[1])}`]);
        }, 2),
        tp('match', (r) => {
          const all: [string, string][] = [['sin 30°', '1/2'], ['cos 30°', '√3/2'], ['tan 45°', '1'], ['tan 30°', '1/√3'], ['sin 45°', '1/√2'], ['tan 60°', '√3'], ['cos 90°', '0']];
          const pick = r.shuffle(all).slice(0, 4);
          return { type: 'match', prompt: `Match each ratio with its exact value: ${pick.map(([x]) => x).join(', ')}.`, ...matching(r, pick), hints: ['Use the half-equilateral triangle (1, √3, 2) and the right isosceles triangle (1, 1, √2).'], solution: pick.map(([a, b]) => `${a} = ${b}`) };
        }),
        tp('find-angle', (r) => {
          const pairs: [number, number][] = [[90, 60], [90, 30], [90, 0], [60, 30], [60, 0], [30, 0]];
          const [X0, Y0] = r.pick(pairs);
          const fx1 = r.pick(['sin', 'cos'] as const), fx2 = r.pick(['sin', 'cos'] as const);
          const vx = VAL[fx1][ANG.indexOf(X0)], vy = VAL[fx2][ANG.indexOf(Y0)];
          const ask = r.pick(['A', 'B'] as const);
          const A = (X0 + Y0) / 2, B = (X0 - Y0) / 2;
          return typed(`If ${fx1}(A + B) = ${vx} and ${fx2}(A − B) = ${vy}, with 0° ≤ A − B < A + B ≤ 90°, find ${ask} (in degrees).`, num(ask === 'A' ? A : B, '°'),
            [`${fx1}(A + B) = ${vx} gives A + B = ${X0}°.`, `${fx2}(A − B) = ${vy} gives A − B = ${Y0}°.`, 'Add and subtract the two equations.'],
            [`A + B = ${X0}°, A − B = ${Y0}°`, `A = ${A}°, B = ${B}°`],
            [[String(ask === 'A' ? B : A), `That is ${ask === 'A' ? 'B' : 'A'}.`]]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.trig.compl', title: 'Ratios of complementary angles', prereqs: ['ts10.m.trig.special'],
      intro: [
        h('Two angles, one triangle'),
        p('In right triangle ABC (∠B = 90°), the acute angles A and C add to 90° — they are complementary, so C = 90° − A. The side opposite A is adjacent to C and vice versa. So every ratio of A equals the "co-ratio" of C.'),
        f('sin(90° − A) = cos A,  cos(90° − A) = sin A'),
        f('tan(90° − A) = cot A,  cot(90° − A) = tan A,  sec(90° − A) = cosec A,  cosec(90° − A) = sec A'),
        p('That is where the names come from: cosine is the "complement\'s sine".'),
        X({
          title: 'What if? Compare sin(90° − A) with cos A', formula: 'sin(90° − A) = cos A',
          result: ['s', 'sin(90° − A)  (always equal to cos A)', 'sin(90 - A)', '', 3],
          vars: [['A', 'Angle A', 0, 90, 1, 30, '°']],
          notes: [['A', 'As A grows, 90° − A shrinks, so sin(90° − A) falls — exactly as cos A falls.', 'As A shrinks, 90° − A grows, so the value rises — like cos A.']],
          mistakes: [
            ['sin(90° − A) = sin 90° − sin A', 'Ratios do not split over subtraction. sin(90° − 30°) = sin 60° = 0.866, but 1 − 0.5 = 0.5.'],
            ['Pairing tan with cos', 'The pairs are sin ↔ cos, tan ↔ cot, sec ↔ cosec.'],
          ],
          real: 'Builders lean a ladder at angle A to the ground; the angle with the wall is 90° − A, and the ladder\'s height on the wall is L sin A = L cos(90° − A).',
        }),
        keys('Complementary: A + B = 90°.', 'sin ↔ cos, tan ↔ cot, sec ↔ cosec.', 'Useful to simplify without tables: sin 18°/cos 72° = 1.'),
        remember('To solve equations like tan 2A = cot(A − 18°): write cot(A − 18°) = tan(90° − (A − 18°)) and equate the angles.'),
      ],
      examples: [
        ex('Evaluate sin 18° / cos 72°.', ['cos 72° = cos(90° − 18°) = sin 18°'], '1'),
        ex('If tan 2A = cot(A − 18°), where 2A is acute, find A.', ['cot(A − 18°) = tan(108° − A)', '2A = 108° − A → 3A = 108°'], 'A = 36°'),
      ],
      practice: [
        tp('eval', (r) => {
          const x = r.int(10, 80);
          const kind = r.int(0, 3);
          const y = 90 - x;
          const q = kind === 0 ? `sin ${x}° ÷ cos ${y}°` : kind === 1 ? `tan ${x}° ÷ cot ${y}°` : kind === 2 ? `cosec ${x}° − sec ${y}°` : `cos ${x}° − sin ${y}°`;
          const ans = kind <= 1 ? 1 : 0;
          return typed(`Without tables, evaluate ${q}.`, num(ans),
            [`${x}° and ${y}° are complementary.`, kind === 0 ? `cos ${y}° = sin ${x}°` : kind === 1 ? `cot ${y}° = tan ${x}°` : kind === 2 ? `sec ${y}° = cosec ${x}°` : `sin ${y}° = cos ${x}°`],
            [kind === 0 ? `cos ${y}° = cos(90° − ${x}°) = sin ${x}°` : kind === 1 ? `cot ${y}° = tan ${x}°` : kind === 2 ? `sec ${y}° = cosec ${x}°` : `sin ${y}° = cos ${x}°`, `So the value is ${ans}.`]);
        }),
        tp('solve', (r) => {
          let A = 0, pp = 2, c = 0;
          for (let i = 0; i < 40; i++) {
            A = r.int(10, 40); pp = r.int(2, 4); c = (pp + 1) * A - 90;
            if (c > 0 && c < 40 && pp * A < 90 && A - c > 0) break;
            A = 0;
          }
          if (!A) { A = 36; pp = 2; c = 18; }
          const fns = r.pick([['sin', 'cos'], ['tan', 'cot'], ['sec', 'cosec']] as [string, string][]);
          return typed(`If ${fns[0]} ${pp}A = ${fns[1]}(A − ${c}°), where ${pp}A is acute, find A (in degrees).`, num(A, '°'),
            [`${fns[1]}(A − ${c}°) = ${fns[0]}(90° − (A − ${c}°)).`, `So ${pp}A = 90° − A + ${c}°.`],
            [`${pp}A = ${90 + c}° − A`, `${pp + 1}A = ${90 + c}°`, `A = ${A}°`]);
        }, 2),
        bank('pairs', [
          { q: 'sin(90° − A) equals:', a: 'cos A', w: ['sin A', 'tan A', '1 − sin A'], h: ['Complementary pairs: sin ↔ cos.'], s: ['sin(90° − A) = cos A.'] },
          { q: 'tan(90° − A) equals:', a: 'cot A', w: ['tan A', 'sec A', 'cos A'], h: ['tan ↔ cot.'], s: ['tan(90° − A) = cot A.'] },
          { q: 'sec 70° equals:', a: 'cosec 20°', w: ['sec 20°', 'cos 20°', 'cosec 70°'], h: ['70° + 20° = 90°.'], s: ['sec 70° = sec(90° − 20°) = cosec 20°.'] },
          { q: 'If A + B = 90° and sin A = 3/5, then cos B =', a: '3/5', w: ['4/5', '5/3', '1'], h: ['cos B = cos(90° − A).'], s: ['cos B = sin A = 3/5.'] },
          { q: 'cos 48° − sin 42° equals:', a: '0', w: ['1', 'cos 6°', '2 cos 48°'], h: ['48° + 42° = 90°.'], s: ['sin 42° = cos 48°, so the difference is 0.'] },
          { q: 'In ΔABC, ∠A + ∠B + ∠C = 180°. sin((B + C)/2) equals:', a: 'cos(A/2)', w: ['sin(A/2)', 'cos A', 'tan(A/2)'], h: ['(B + C)/2 = 90° − A/2.'], s: ['sin((B + C)/2) = sin(90° − A/2) = cos(A/2).'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.trig.identities', title: 'Trigonometric identities', prereqs: ['ts10.m.trig.ratios'],
      intro: [
        h('Equations true for every angle'),
        p('Divide Pythagoras AB² + BC² = AC² by AC²: (AB/AC)² + (BC/AC)² = 1, i.e. cos²A + sin²A = 1. This holds for EVERY angle A (0° ≤ A ≤ 90°), so it is called an identity.'),
        f('sin²A + cos²A = 1'),
        f('1 + tan²A = sec²A  (divide by cos²A, A ≠ 90°)'),
        f('1 + cot²A = cosec²A  (divide by sin²A, A ≠ 0°)'),
        X({
          title: 'What if? Try any angle in sin² + cos²', formula: 'sin²θ + cos²θ = 1',
          result: ['S', 'sin²θ + cos²θ', 'sin(θ)^2 + cos(θ)^2', '', 3],
          vars: [['θ', 'Angle θ', 0, 90, 1, 35, '°']],
          notes: [['θ', 'sin θ goes up and cos θ goes down by exactly the right amounts — the total stays 1.', 'Going the other way, cos θ grows while sin θ shrinks — still a total of 1. That is what "identity" means.']],
          mistakes: [
            ['sin²A + cos²A = sin²(2A) or = 2', 'It is always exactly 1 — it is Pythagoras divided by the hypotenuse squared.'],
            ['sec²A − tan²A = −1', 'Rearranging 1 + tan²A = sec²A gives sec²A − tan²A = +1.'],
            ['sin²A written as sin A²', 'sin²A means (sin A)², the square of the value, not the sine of A².'],
          ],
          real: 'Every point on a circle of radius 1 has coordinates (cos θ, sin θ); the identity says its distance from the centre is always 1.',
        }),
        h('Proving an identity'),
        stepsB('Work on the more complicated side.', 'Write everything in terms of sin and cos if stuck.', 'Use the three identities to simplify.', 'Stop when you reach the other side exactly.'),
        keys('sin² + cos² = 1; sec² − tan² = 1; cosec² − cot² = 1.', 'If sec A + tan A = p, then sec A − tan A = 1/p.', 'Find one ratio from another without the angle.'),
        remember('Never "cross over" from both sides at once in a proof — transform ONE side into the other.'),
      ],
      examples: [
        ex('If sin A = 5/13, find cos A and tan A (A acute).', ['cos²A = 1 − 25/169 = 144/169', 'cos A = 12/13', 'tan A = (5/13)/(12/13) = 5/12'], 'cos A = 12/13, tan A = 5/12'),
        ex('Prove (1 − cos²A) cosec²A = 1.', ['1 − cos²A = sin²A', 'sin²A × cosec²A = sin²A × 1/sin²A', '= 1'], 'Proved'),
        ex('If sec A + tan A = 3, find sec A − tan A.', ['(sec A + tan A)(sec A − tan A) = sec²A − tan²A = 1', 'sec A − tan A = 1/3'], '1/3'),
      ],
      practice: [
        tp('cos-from-sin', (r) => {
          const [a, b, c] = r.pick(TRIP);
          const g = gcd(gcd(a, b), c);
          const [o, ad, hy] = [b / g, a / g, c / g];
          const giv = r.pick(['sin', 'cos'] as const);
          return typed(`If ${giv} A = ${giv === 'sin' ? o : ad}/${hy} (A acute), use sin²A + cos²A = 1 to find ${giv === 'sin' ? 'cos' : 'sin'} A.`, frac(giv === 'sin' ? ad : o, hy),
            [`${giv === 'sin' ? 'cos' : 'sin'}²A = 1 − (${giv === 'sin' ? o : ad}/${hy})²`, `= ${hy * hy - (giv === 'sin' ? o : ad) ** 2}/${hy * hy}`],
            [`${giv === 'sin' ? 'cos' : 'sin'}²A = ${(giv === 'sin' ? ad : o) ** 2}/${hy * hy}`, `${giv === 'sin' ? 'cos' : 'sin'} A = ${giv === 'sin' ? ad : o}/${hy}`],
            [[`${hy - (giv === 'sin' ? o : ad)}/${hy}`, 'Use squares: cos²A = 1 − sin²A, not cos A = 1 − sin A.']]);
        }, 2),
        tp('sec-tan', (r) => {
          const pp = r.int(2, 9), q = r.pick([1, 1, 2, 3]);
          const show = q === 1 ? `${pp}` : `${pp}/${q}`;
          if (gcd(pp, q) !== 1) return typed('If sec A + tan A = 5, find sec A − tan A.', frac(1, 5), ['sec²A − tan²A = 1.'], ['(sec A + tan A)(sec A − tan A) = 1', 'sec A − tan A = 1/5']);
          return typed(`If sec A + tan A = ${show}, find sec A − tan A.`, frac(q, pp),
            ['Use sec²A − tan²A = 1.', 'Factorise: (sec A + tan A)(sec A − tan A) = 1.'],
            [`(sec A + tan A)(sec A − tan A) = 1`, `sec A − tan A = 1 ÷ ${show} = ${fr(q, pp)}`],
            [[`-${show}`, 'It is the reciprocal, not the negative.']]);
        }, 2),
        bank('simplify', [
          { q: 'Simplify (1 − cos²θ) cosec²θ.', a: '1', w: ['0', 'sin²θ', 'cos²θ'], h: ['1 − cos²θ = sin²θ.'], s: ['sin²θ × 1/sin²θ = 1.'] },
          { q: 'Simplify (1 + tan²θ) cos²θ.', a: '1', w: ['sec²θ', 'sin²θ', '0'], h: ['1 + tan²θ = sec²θ.'], s: ['sec²θ × cos²θ = 1.'] },
          { q: '9 sec²A − 9 tan²A equals:', a: '9', w: ['1', '0', '18'], h: ['Take 9 common.'], s: ['9(sec²A − tan²A) = 9 × 1 = 9.'] },
          { q: 'tan θ × cot θ equals:', a: '1', w: ['0', 'tan²θ', 'sec θ'], h: ['cot θ = 1/tan θ.'], s: ['They are reciprocals, so the product is 1.'] },
          { q: 'cosec²A − cot²A equals:', a: '1', w: ['−1', '0', 'sin²A'], h: ['1 + cot²A = cosec²A.'], s: ['cosec²A − cot²A = 1.'] },
          { q: 'Simplify (1 + cot²A) sin²A.', a: '1', w: ['cos²A', 'cosec²A', '2'], h: ['1 + cot²A = cosec²A.'], s: ['cosec²A × sin²A = 1.'] },
          { q: 'sin⁴A − cos⁴A equals:', a: 'sin²A − cos²A', w: ['1', 'sin²A + cos²A', '0'], h: ['Difference of squares.'], s: ['(sin²A − cos²A)(sin²A + cos²A) = sin²A − cos²A.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 12 APPLICATIONS OF TRIGONOMETRY
const TANV: Record<number, number> = { 30: 1 / Math.sqrt(3), 45: 1, 60: Math.sqrt(3) };
const ch12: USpec = {
  id: 'ts10.m.ch12', subject: 'math', title: 'Applications of Trigonometry', source: src(12),
  objectives: [
    {
      id: 'ts10.m.ht.figures', title: 'Drawing figures; angles of elevation and depression',
      intro: [
        h('Measuring what you cannot reach'),
        p('Nobody climbs the Buddha statue in Hussain Sagar with a measuring tape. Instead, surveyors stand at a known distance, measure ONE angle, and use trigonometry. The secret is drawing the right figure.'),
        def('Line of sight', 'The line from the observer\'s eye to the object being viewed.'),
        def('Angle of elevation', 'The angle between the horizontal and the line of sight when the object is ABOVE the horizontal level of the eye (you look UP).'),
        def('Angle of depression', 'The angle between the horizontal and the line of sight when the object is BELOW the horizontal level of the eye (you look DOWN).'),
        p('If a girl on the ground sees the top of a tower at an angle of elevation of 40°, then a person at the top of the tower sees the girl at an angle of depression of 40°. The two horizontals are parallel, so these are alternate angles.'),
        stepsB('Draw a horizontal ground line and the vertical object (tower, tree, building) as a perpendicular.', 'Mark the observer\'s eye and draw the line of sight.', 'Mark the angle FROM THE HORIZONTAL (never from the vertical).', 'Label known lengths and the unknown; find the right triangle.', 'Choose the ratio that connects the known side with the unknown (usually tan).'),
        keys('Elevation: look up from the horizontal. Depression: look down from the horizontal.', 'Elevation from A to B = depression from B to A.', 'Angles are always measured from the horizontal.'),
        remember('If the observer\'s eye is above the ground (e.g. 1.5 m tall), add that height to your answer for the object\'s full height.'),
      ],
      examples: [
        ex('A boy on the roof of a building looks at a car on the road below at 30° below the horizontal. Name the angle.', ['He looks DOWN from his horizontal line.'], 'Angle of depression = 30°'),
        ex('From a ship, the top of a lighthouse is seen at 45°. What angle does the lighthouse keeper see the ship at?', ['Horizontals at the ship and at the top are parallel.', 'Alternate angles are equal.'], 'Angle of depression 45°'),
      ],
      practice: [
        bank('which-angle', [
          { q: 'Ravi stands on the ground and looks at a kite flying above. The angle between his line of sight and the horizontal is called the angle of:', a: 'elevation', w: ['depression', 'incidence', 'reflection'], h: ['He looks UP.'], s: ['Looking up from the horizontal → angle of elevation.'] },
          { q: 'From the top of Golconda fort, Sana looks down at a bus. The angle between her line of sight and the horizontal is the angle of:', a: 'depression', w: ['elevation', 'incidence', 'refraction'], h: ['She looks DOWN.'], s: ['Looking down from the horizontal → angle of depression.'] },
          { q: 'The angle of elevation of a tower top from P is 35°. The angle of depression of P from the tower top is:', a: '35°', w: ['55°', '145°', '90°'], h: ['The two horizontals are parallel.'], s: ['They are alternate angles, so they are equal: 35°.'] },
          { q: 'Angles of elevation and depression are measured from:', a: 'the horizontal line through the observer\'s eye', w: ['the vertical line', 'the line of sight', 'the ground at the object'], h: ['Think of a level line at eye height.'], s: ['Both are measured from the horizontal.'] },
          { q: 'As you walk TOWARDS a tall tower, the angle of elevation of its top:', a: 'increases', w: ['decreases', 'stays the same', 'becomes zero'], h: ['You have to look up more steeply.'], s: ['Closer means a steeper line of sight, so the angle increases.'] },
          { q: 'In a height-and-distance problem with the angle and the horizontal distance known, which ratio usually finds the height?', a: 'tan', w: ['sin', 'cos', 'sec'], h: ['Height is opposite, distance is adjacent.'], s: ['tan θ = opposite/adjacent = height/distance.'] },
        ]),
        tp('order', (r) => {
          const steps = ['Draw the ground and the vertical tower.', 'Mark the observer and draw the line of sight to the top.', 'Mark the angle of elevation from the horizontal.', 'Label the known distance and the unknown height.', 'Use tan θ = height ÷ distance and solve.'];
          return { type: 'order', prompt: 'Put the steps for solving a height-and-distance problem in order.', ...ordering(r, steps), hints: ['Draw first, calculate last.'], solution: steps.map((s, i) => `${i + 1}. ${s}`) };
        }),
      ],
    },
    {
      id: 'ts10.m.ht.one', title: 'Heights and distances with one right triangle', prereqs: ['ts10.m.ht.figures', 'ts10.m.trig.special'],
      intro: [
        h('Height = distance × tan θ'),
        p('Stand d metres from the foot of a tower and measure the angle of elevation θ of its top. In the right triangle, the height h is opposite θ and d is adjacent to θ, so tan θ = h/d.'),
        f('h = d × tan θ   and   d = h ÷ tan θ', 'h equals d tan theta'),
        X({
          title: 'What if? Measure a tower', formula: 'h = d × tan θ',
          result: ['h', 'Height of the tower', 'd * tan(θ)', 'm', 2],
          vars: [['d', 'Distance from the foot', 1, 100, 1, 30, 'm'], ['θ', 'Angle of elevation', 5, 85, 1, 30, '°']],
          notes: [
            ['θ', 'A steeper angle from the same spot means a taller tower — and near 90° the height grows very fast, because tan θ shoots up.', 'A smaller angle from the same spot means a shorter tower.'],
            ['d', 'For the same angle, twice the distance means twice the height (similar triangles).', 'Closer, with the same angle, means a shorter tower.'],
          ],
          mistakes: [
            ['Using sin θ = h/d', 'd is the horizontal distance (adjacent), not the slanting line of sight. Use tan.'],
            ['Forgetting the observer\'s height', 'If the eye is 1.5 m above the ground, the full height is d tan θ + 1.5.'],
            ['Using tan 30° = √3', 'tan 30° = 1/√3 ≈ 0.577; tan 60° = √3 ≈ 1.732.'],
          ],
          real: 'Forest officers measure tree heights with a clinometer (an angle-measuring tool) and a tape for the distance.',
        }),
        p('For a kite string or a ladder (a slanting length L), the height is L sin θ.'),
        keys('Height & horizontal distance → tan.', 'Slant length & height → sin.', 'Slant length & horizontal distance → cos.'),
        remember('Use √3 ≈ 1.732 and √2 ≈ 1.414 unless told otherwise; keep √ until the last step.'),
      ],
      examples: [
        ex('From a point 30 m from the foot of a tower, the angle of elevation of its top is 30°. Find its height.', ['tan 30° = h/30', 'h = 30 × 1/√3 = 10√3', '≈ 10 × 1.732'], '≈ 17.32 m'),
        ex('A kite flies at a height of 60 m. The string makes 60° with the ground. Find the length of the string.', ['sin 60° = 60/L', 'L = 60 ÷ (√3/2) = 120/√3 = 40√3', '≈ 69.28'], '≈ 69.28 m'),
      ],
      practice: [
        tp('height', (r) => {
          const th = r.pick([30, 45, 60]), d = r.pick([10, 12, 15, 20, 24, 25, 30, 36, 40, 50]);
          const hh = d * TANV[th];
          const thing = r.pick(['tower', 'temple gopuram', 'tree', 'mobile tower', 'water tank']);
          return typed(`From a point ${d} m from the foot of a ${thing}, the angle of elevation of its top is ${th}°. Find its height (√3 ≈ 1.732, 2 decimal places).`, num(rd(hh, 2), 'm', false, Math.max(0.05, hh * 0.003)),
            [`tan ${th}° = h/${d}`, `tan ${th}° = ${th === 30 ? '1/√3' : th === 45 ? '1' : '√3'}`],
            [`h = ${d} × tan ${th}°`, `= ${th === 30 ? `${d}/√3` : th === 45 ? `${d}` : `${d}√3`}`, `≈ ${rd(hh, 2)} m`],
            [[String(rd(d * Math.sin((th * Math.PI) / 180), 2)), 'Use tan (opposite/adjacent), not sin.'], [String(rd(d / TANV[th], 2)), 'You divided by tan θ. Height = distance × tan θ.']]);
        }),
        tp('distance', (r) => {
          const th = r.pick([30, 45, 60]), hh = r.pick([20, 30, 45, 50, 60, 75, 100]);
          const d = hh / TANV[th];
          const thing = r.pick(['lighthouse', 'cliff', 'building']);
          return typed(`From the top of a ${hh} m high ${thing}, the angle of depression of a boat is ${th}°. How far is the boat from the foot of the ${thing}? (√3 ≈ 1.732, 2 decimal places)`, num(rd(d, 2), 'm', false, Math.max(0.05, d * 0.003)),
            ['The angle of depression equals the angle of elevation of the top from the boat.', `tan ${th}° = ${hh}/d`],
            [`d = ${hh} ÷ tan ${th}°`, `= ${th === 30 ? `${hh}√3` : th === 45 ? `${hh}` : `${hh}/√3`}`, `≈ ${rd(d, 2)} m`],
            [[String(rd(hh * TANV[th], 2)), 'Distance = height ÷ tan θ (you multiplied).']]);
        }),
        tp('kite', (r) => {
          const th = r.pick([30, 45, 60]), L = r.pick([40, 50, 60, 80, 100, 120]);
          const hh = L * Math.sin((th * Math.PI) / 180);
          return typed(`A kite string is ${L} m long and makes an angle of ${th}° with the level ground. Assuming the string is straight, how high is the kite? (√2 ≈ 1.414, √3 ≈ 1.732, 2 decimal places)`, num(rd(hh, 2), 'm', false, Math.max(0.05, hh * 0.003)),
            ['The string is the hypotenuse; the height is opposite the angle.', `sin ${th}° = h/${L}`],
            [`h = ${L} × sin ${th}° = ${L} × ${VAL.sin[ANG.indexOf(th)]}`, `≈ ${rd(hh, 2)} m`],
            [[String(rd(L * TANV[th], 2)), 'The string is slanting (hypotenuse), so use sin, not tan.']]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.ht.two', title: 'Problems with two right triangles', prereqs: ['ts10.m.ht.one'],
      intro: [
        h('Two angles, one unknown height'),
        p('Often we cannot reach the foot of a tower (there is a river or a lake). Then we measure the angle of elevation from two points on the same line, a known distance d apart: angle A from the nearer point and angle B from the farther point (A > B).'),
        p('Let the height be h and the distance from the nearer point be x. Then tan A = h/x and tan B = h/(x + d). Eliminating x gives:'),
        f('h = d × tan A × tan B / (tan A − tan B)'),
        X({
          title: 'What if? Two observers, one tower', formula: 'h = d·tan A·tan B / (tan A − tan B)',
          result: ['h', 'Height of the tower', 'd * tan(A) * tan(B) / (tan(A) - tan(B))', 'm', 2],
          vars: [['d', 'Distance between the two points', 5, 100, 1, 40, 'm'], ['A', 'Angle from the nearer point', 40, 80, 1, 60, '°'], ['B', 'Angle from the farther point', 10, 35, 1, 30, '°']],
          notes: [
            ['d', 'With the same two angles, a longer walk between them means a bigger (similar) picture: the height grows in proportion.', 'A shorter walk with the same angles means a smaller tower.'],
            ['A', 'If the near angle is steeper, the two lines of sight meet lower, so the tower is SHORTER for the same d.', 'If the near angle gets closer to B, the lines of sight become almost parallel, so they meet very high — the height grows a lot.'],
            ['B', 'If the far angle grows towards A, the two sightlines are nearly parallel and the height increases sharply.', 'If the far angle is small, the tower must be shorter.'],
          ],
          mistakes: [
            ['Using the same x for both triangles', 'From the farther point the distance is x + d, not x.'],
            ['Subtracting the angles: tan(A − B)', 'Work with tan A and tan B separately; tan(A − B) is not tan A − tan B.'],
          ],
          real: 'Surveyors across the Godavari use two-point sightings to find the height of hills on the far bank without crossing the river.',
        }),
        p('Another common picture: from the top of a building of height b, the angle of elevation of a tower\'s top is α and the angle of depression of its foot is β. The horizontal distance is b/tan β, and the tower\'s height is b + (b/tan β) × tan α.'),
        keys('Draw both triangles sharing the same vertical side.', 'Write tan for each triangle, then eliminate the unknown distance.', 'A > B means the nearer point has the larger angle.'),
        remember('Exact answers like 20√3 m are preferred; give decimals only if asked.'),
      ],
      examples: [
        ex('The angles of elevation of a tower top from two points 40 m apart (on the same side, in line with the foot) are 60° and 30°. Find the height.', ['tan 60° = h/x → h = √3x', 'tan 30° = h/(x + 40) → √3h = x + 40', '√3(√3x) = x + 40 → 3x = x + 40 → x = 20', 'h = 20√3'], '20√3 ≈ 34.64 m'),
        ex('From the top of a 7 m building, the angle of elevation of a cable tower\'s top is 60° and the angle of depression of its foot is 45°. Find the tower\'s height.', ['Distance = 7/tan 45° = 7 m', 'Extra height = 7 tan 60° = 7√3', 'Height = 7 + 7√3 = 7(1 + √3)'], '≈ 19.12 m'),
      ],
      practice: [
        tp('two-points', (r) => {
          const [A, B] = r.pick([[60, 30], [45, 30], [60, 45]] as [number, number][]);
          const d = r.pick([10, 20, 30, 40, 50, 60]);
          const tA = TANV[A], tB = TANV[B];
          const hh = (d * tA * tB) / (tA - tB);
          const x = hh / tA;
          return typed(`The angles of elevation of the top of a tower from two points on the same side, ${d} m apart and in line with its foot, are ${A}° and ${B}°. Find the height of the tower (2 decimal places).`, num(rd(hh, 2), 'm', false, Math.max(0.05, hh * 0.004)),
            [`Nearer point: tan ${A}° = h/x.`, `Farther point: tan ${B}° = h/(x + ${d}).`, 'Eliminate x.'],
            [`From the near point: x = h/tan ${A}°`, `From the far point: h = (x + ${d}) tan ${B}°`, `Solving: x ≈ ${rd(x, 2)} m`, `h ≈ ${rd(hh, 2)} m`],
            [[String(rd(d * tA, 2)), `${d} m is the gap between the points, not the distance from the nearer point.`]],
            { steps: [st('Distance of the nearer point from the foot (m, 2 d.p.)?', num(rd(x, 2), 'm', false, Math.max(0.05, x * 0.004))), st('Height of the tower (m)?', num(rd(hh, 2), 'm', false, Math.max(0.05, hh * 0.004)))] });
        }, 3),
        tp('building', (r) => {
          const b = r.pick([7, 8, 10, 12, 15, 20]);
          const [al, be] = r.pick([[60, 45], [45, 30], [30, 45], [60, 30], [45, 45]] as [number, number][]);
          const dist = b / TANV[be];
          const H = b + dist * TANV[al];
          return typed(`From the top of a ${b} m high building, the angle of elevation of the top of a tower is ${al}° and the angle of depression of its foot is ${be}°. Find the height of the tower (2 decimal places).`, num(rd(H, 2), 'm', false, Math.max(0.05, H * 0.004)),
            [`Horizontal distance = ${b} ÷ tan ${be}°.`, `Extra height above the building = distance × tan ${al}°.`, `Tower = ${b} + extra height.`],
            [`Distance = ${rd(dist, 2)} m`, `Extra = ${rd(dist * TANV[al], 2)} m`, `Height = ${b} + ${rd(dist * TANV[al], 2)} ≈ ${rd(H, 2)} m`],
            [[String(rd(dist * TANV[al], 2)), `Add the building's height ${b} m.`]]);
        }, 3),
        tp('flag', (r) => {
          const [A, B] = r.pick([[30, 45], [45, 60], [30, 60]] as [number, number][]);
          const d = r.pick([10, 15, 20, 25, 30]);
          const L = d * (TANV[B] - TANV[A]);
          return typed(`From a point ${d} m from a building, the angle of elevation of its top is ${A}° and of the top of a flagstaff on it is ${B}°. Find the length of the flagstaff (2 decimal places).`, num(rd(L, 2), 'm', false, Math.max(0.05, L * 0.004)),
            [`Building height = ${d} tan ${A}°.`, `Building + flagstaff = ${d} tan ${B}°.`, 'Subtract.'],
            [`Building = ${rd(d * TANV[A], 2)} m`, `Top of flagstaff = ${rd(d * TANV[B], 2)} m`, `Flagstaff = ${rd(L, 2)} m`],
            [[String(rd(d * TANV[B], 2)), 'That is the total height. Subtract the building.']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 13 PROBABILITY
const ch13: USpec = {
  id: 'ts10.m.ch13', subject: 'math', title: 'Probability', source: src(13),
  objectives: [
    {
      id: 'ts10.m.prob.theory', title: 'Theoretical probability',
      intro: [
        h('Measuring chance with a number'),
        p('Before a cricket match the captains toss a coin. Head or tail — each is equally likely, so each has a chance of 1 in 2. Probability puts a number between 0 and 1 on how likely something is.'),
        def('Experiment and outcomes', 'An experiment is an action with uncertain results (tossing a coin, rolling a die). Each possible result is an outcome.'),
        def('Equally likely outcomes', 'Outcomes that each have the same chance (a fair die: 1, 2, 3, 4, 5, 6).'),
        def('Event', 'A collection of outcomes we are interested in, e.g. "getting an even number" = {2, 4, 6}.'),
        f('P(E) = number of outcomes favourable to E ÷ total number of equally likely outcomes', 'P of E equals favourable over total'),
        X({
          title: 'What if? Change the favourable and total outcomes', formula: 'P(E) = favourable / total',
          result: ['P', 'Probability of E', 'f / n', '', 3],
          vars: [['f', 'Favourable outcomes', 0, 20, 1, 4], ['n', 'Total equally likely outcomes', 20, 52, 1, 52]],
          notes: [
            ['f', 'More favourable outcomes (same total) make E more likely: P grows in proportion.', 'Fewer favourable outcomes make E less likely; with f = 0 the event is impossible (P = 0).'],
            ['n', 'More total outcomes with the same favourable ones dilute the chance: P falls.', 'Fewer total outcomes make each favourable one a bigger share.'],
          ],
          mistakes: [
            ['Counting outcomes that are not equally likely', '"Rain or no rain" are 2 outcomes, but not equally likely, so P(rain) is not automatically 1/2.'],
            ['Writing total over favourable', 'P is always favourable ÷ total, so it is never more than 1.'],
            ['Forgetting outcomes', 'Two coins have 4 outcomes (HH, HT, TH, TT), not 3 — HT and TH are different.'],
          ],
          real: 'In a deck of 52 cards with 4 aces, the chance of drawing an ace is 4/52 = 1/13 ≈ 0.077.',
        }),
        keys('0 ≤ P(E) ≤ 1.', 'P = favourable ÷ total (equally likely outcomes).', 'List the outcomes carefully before counting.'),
        remember('Give probabilities as fractions in lowest terms (or decimals) — never as "2 out of 6" in an exam answer.'),
      ],
      examples: [
        ex('A die is rolled once. Find P(prime number).', ['Outcomes: 1, 2, 3, 4, 5, 6', 'Primes: 2, 3, 5 → 3 outcomes', 'P = 3/6'], '1/2'),
        ex('Two coins are tossed. Find P(at least one head).', ['Outcomes: HH, HT, TH, TT', 'At least one head: HH, HT, TH', 'P = 3/4'], '3/4'),
      ],
      practice: [
        tp('die', (r) => {
          const evs: [string, number[]][] = [['an even number', [2, 4, 6]], ['a prime number', [2, 3, 5]], ['a number greater than 4', [5, 6]], ['a multiple of 3', [3, 6]], ['a factor of 6', [1, 2, 3, 6]], ['a number less than 3', [1, 2]], ['an odd number', [1, 3, 5]], ['a number greater than 6', []], ['a number less than 7', [1, 2, 3, 4, 5, 6]], ['a perfect square', [1, 4]]];
          const [name, fav] = r.pick(evs);
          return typed(`A fair die is rolled once. What is the probability of getting ${name}?`, frac(fav.length, 6),
            ['Total outcomes: 1, 2, 3, 4, 5, 6.', 'Which of these fit the event?'],
            [`Favourable: ${fav.length ? fav.join(', ') : 'none'} (${fav.length})`, `P = ${fav.length}/6${fav.length && fav.length < 6 ? ` = ${fr(fav.length, 6)}` : fav.length === 6 ? ' = 1 (sure event)' : ' = 0 (impossible event)'}`],
            fav.length ? [[`6/${fav.length}`, 'Upside down: favourable goes on top.']] : []);
        }),
        tp('coins', (r) => {
          const three = r.next() < 0.5;
          const outs = three ? ['HHH', 'HHT', 'HTH', 'THH', 'HTT', 'THT', 'TTH', 'TTT'] : ['HH', 'HT', 'TH', 'TT'];
          const ev = r.pick(three ? ['exactly two heads', 'at least two heads', 'no head', 'at least one tail', 'exactly one head'] : ['exactly one head', 'at least one head', 'no head', 'two tails']);
          const nH = (s: string) => s.split('').filter((c) => c === 'H').length;
          const test = (s: string) => ev === 'exactly two heads' ? nH(s) === 2 : ev === 'at least two heads' ? nH(s) >= 2 : ev === 'no head' ? nH(s) === 0 : ev === 'at least one tail' ? nH(s) < s.length : ev === 'exactly one head' ? nH(s) === 1 : ev === 'at least one head' ? nH(s) >= 1 : nH(s) === 0;
          const fav = outs.filter(test);
          return typed(`${three ? 'Three' : 'Two'} coins are tossed together. Find the probability of getting ${ev}.`, frac(fav.length, outs.length),
            [`List all ${outs.length} outcomes: ${outs.join(', ')}.`, 'Count those that fit the event.'],
            [`Favourable: ${fav.join(', ')} (${fav.length})`, `P = ${fav.length}/${outs.length} = ${fr(fav.length, outs.length)}`],
            three ? [] : [[`${fav.length}/3`, 'There are 4 outcomes, not 3: HT and TH are different.']]);
        }, 2),
        tp('letters', (r) => {
          const w = r.pick(['TELANGANA', 'HYDERABAD', 'PROBABILITY', 'MATHEMATICS', 'WARANGAL', 'ASSOCIATION']);
          const vow = w.split('').filter((c) => 'AEIOU'.includes(c)).length;
          const ask = r.pick(['vowel', 'consonant'] as const);
          const fav = ask === 'vowel' ? vow : w.length - vow;
          return typed(`A letter is chosen at random from the letters of the word ${w} (each letter card equally likely). What is the probability that it is a ${ask}?`, frac(fav, w.length),
            [`The word has ${w.length} letters (count repeats — each is a separate card).`, `Count the ${ask}s.`],
            [`${ask === 'vowel' ? 'Vowels' : 'Consonants'}: ${fav}`, `P = ${fav}/${w.length}${gcd(fav, w.length) > 1 ? ` = ${fr(fav, w.length)}` : ''}`],
            [[`${fav}/${new Set(w.split('')).size}`, 'Each letter card counts separately, including repeats.']]);
        }),
      ],
    },
    {
      id: 'ts10.m.prob.events', title: 'Complementary and mutually exclusive events', prereqs: ['ts10.m.prob.theory'],
      intro: [
        h('Events that cannot happen together'),
        def('Sure event', 'An event certain to happen: P = 1 (e.g. a die shows a number less than 7).'),
        def('Impossible event', 'An event that cannot happen: P = 0 (e.g. a die shows 8).'),
        def('Mutually exclusive events', 'Events that cannot happen at the same time. On one die roll, "getting 2" and "getting 5" are mutually exclusive.'),
        p('For mutually exclusive events, P(A or B) = P(A) + P(B). Also, the probabilities of ALL the elementary outcomes of an experiment add up to 1.'),
        def('Complementary event (not E, written Ē)', 'The event that E does NOT happen. E and Ē are mutually exclusive and together cover every outcome.'),
        f('P(E) + P(not E) = 1   ⇒   P(not E) = 1 − P(E)'),
        X({
          title: 'What if? The chance that something does NOT happen', formula: 'P(not E) = 1 − P(E)',
          result: ['Q', 'P(not E)', '1 - p', '', 3],
          vars: [['p', 'P(E)', 0, 1, 0.01, 0.35]],
          notes: [['p', 'As E becomes more likely, "not E" becomes less likely by exactly the same amount — together they always make 1.', 'As E becomes less likely, "not E" becomes more likely.']],
          mistakes: [
            ['P(not E) = 1/P(E)', 'Complement means SUBTRACT from 1, not take the reciprocal.'],
            ['Adding probabilities of events that can happen together', 'P(A or B) = P(A) + P(B) only for mutually exclusive events. "Even" and "prime" on a die share 2.'],
          ],
          real: 'If the weather office says the chance of rain in Hyderabad tomorrow is 0.3, the chance of no rain is 0.7.',
        }),
        keys('0 ≤ P(E) ≤ 1; sure = 1; impossible = 0.', 'P(not E) = 1 − P(E).', 'Mutually exclusive: cannot occur together.'),
        remember('"At least one" problems are often easiest as 1 − P(none).'),
      ],
      examples: [
        ex('P(E) = 0.05. Find P(not E).', ['P(not E) = 1 − 0.05'], '0.95'),
        ex('A bag has only red and blue balls. P(red) = 2/5. Find P(blue).', ['Red and blue are complementary here.', 'P(blue) = 1 − 2/5'], '3/5'),
      ],
      practice: [
        tp('complement', (r) => {
          const dec = r.next() < 0.5;
          if (dec) {
            const pp = r.int(1, 99) / 100;
            return typed(`The probability that a bus from Nalgonda arrives on time is ${pp}. What is the probability that it does NOT arrive on time?`, num(rd(1 - pp, 2)),
              ['Use P(not E) = 1 − P(E).'], [`1 − ${pp} = ${rd(1 - pp, 2)}`], [[String(rd(1 / pp, 2)), 'Subtract from 1; do not take the reciprocal.']]);
          }
          const d = r.int(3, 15), n = r.int(1, d - 1);
          return typed(`If P(E) = ${fr(n, d)}, find P(not E).`, frac(d - n, d),
            ['P(not E) = 1 − P(E).'], [`1 − ${fr(n, d)} = ${fr(d - n, d)}`], [[`${d}/${n}`, 'Subtract from 1; do not flip the fraction.']]);
        }),
        bank('kinds', [
          { q: 'Getting a number less than 7 on a single die roll is:', a: 'a sure event', w: ['an impossible event', 'a complementary event', 'an event with probability 1/2'], h: ['Which outcomes are less than 7?'], s: ['All six outcomes qualify, so P = 1: sure event.'] },
          { q: 'Getting 8 on a single die roll is:', a: 'an impossible event', w: ['a sure event', 'an event with probability 1/8', 'a mutually exclusive event'], h: ['Can a die show 8?'], s: ['No outcome gives 8, so P = 0.'] },
          { q: 'Which pair of events is mutually exclusive on one die roll?', a: '"getting 1" and "getting an even number"', w: ['"getting 2" and "getting an even number"', '"getting a prime" and "getting an odd number"', '"getting 6" and "getting a multiple of 3"'], h: ['They must share NO outcome.'], s: ['1 is not even, so they cannot happen together.'] },
          { q: 'Which can NOT be the probability of an event?', a: '1.2', w: ['0', '2/3', '0.99'], h: ['Probabilities lie between 0 and 1.'], s: ['1.2 > 1 is impossible as a probability.'] },
          { q: 'The sum of the probabilities of all elementary outcomes of an experiment is:', a: '1', w: ['0', 'the number of outcomes', 'it depends on the experiment'], h: ['One of the outcomes must happen.'], s: ['Together they make the sure event: total 1.'] },
          { q: 'E and "not E" are always:', a: 'mutually exclusive and together cover all outcomes', w: ['equally likely', 'both impossible', 'the same event'], h: ['Can E and not E happen at once?'], s: ['They cannot happen together and one of them must happen.'] },
        ]),
      ],
    },
    {
      id: 'ts10.m.prob.cards', title: 'A deck of cards and probability', prereqs: ['ts10.m.prob.theory'],
      intro: [
        h('Know the deck'),
        p('A standard deck has 52 cards in 4 suits of 13 each: spades ♠ and clubs ♣ are black; hearts ♥ and diamonds ♦ are red. Each suit has A, 2–10, J, Q, K.'),
        def('Face cards', 'Kings, queens and jacks — 3 per suit, so 12 in the deck. (Aces are NOT face cards.)'),
        p('Useful counts: red 26, black 26, each suit 13, aces 4, kings 4, face cards 12, red face cards 6, black face cards 6, non-face cards 40.'),
        vis({ kind: 'bar-graph', labels: ['♠ spades', '♣ clubs', '♥ hearts', '♦ diamonds'], values: [13, 13, 13, 13] }, 'Four suits of 13 cards each'),
        p('"Well-shuffled" means each of the 52 cards is equally likely to be drawn, so P = (number of such cards) ÷ 52.'),
        keys('52 cards, 4 suits × 13.', '12 face cards (J, Q, K); 4 aces.', 'Red: hearts and diamonds; black: spades and clubs.'),
        remember('"A red face card" means BOTH red and face: 6 cards. "A spade or an ace" has 13 + 3 = 16 cards (the ace of spades is counted once).'),
      ],
      examples: [
        ex('One card is drawn from a well-shuffled deck. Find P(a red king).', ['Red kings: king of hearts, king of diamonds → 2', 'P = 2/52'], '1/26'),
        ex('Find P(not a face card).', ['Non-face cards = 52 − 12 = 40', 'P = 40/52'], '10/13'),
      ],
      practice: [
        tp('cards', (r) => {
          const evs: [string, number, string][] = [
            ['a red card', 26, 'hearts 13 + diamonds 13'], ['a black card', 26, 'spades 13 + clubs 13'], ['a face card', 12, 'J, Q, K in 4 suits'], ['an ace', 4, 'one per suit'], ['a king', 4, 'one per suit'],
            ['a spade', 13, 'one suit'], ['a red face card', 6, 'J, Q, K of hearts and diamonds'], ['the queen of hearts', 1, 'only one'], ['a black jack', 2, 'jack of spades and jack of clubs'],
            ['a card that is not a face card', 40, '52 − 12'], ['a card that is not an ace', 48, '52 − 4'], ['a spade or an ace', 16, '13 spades + 3 other aces'], ['a red ace', 2, 'ace of hearts and ace of diamonds'],
          ];
          const [name, n, why] = r.pick(evs);
          return typed(`One card is drawn from a well-shuffled deck of 52 cards. Find the probability of drawing ${name}.`, frac(n, 52),
            ['Count the cards that fit, then divide by 52.', 'Face cards are J, Q, K (12 in all).'],
            [`Favourable cards: ${n} (${why})`, `P = ${n}/52 = ${fr(n, 52)}`],
            n === 12 ? [['16/52', 'Aces are not face cards: only J, Q, K.'], ['4/13', 'Aces are not face cards: only J, Q, K.']] : n === 16 ? [['17/52', 'The ace of spades was counted twice.']] : []);
        }),
        tp('removed', (r) => {
          const rem = r.pick([['the king, queen and jack of hearts', 3, 'heart', 13 - 3], ['all four aces', 4, 'king', 4], ['the two red kings', 2, 'king', 2], ['all 13 spades', 13, 'black card', 13], ['all 12 face cards', 12, 'ace', 4], ['the four queens', 4, 'red card', 24]] as [string, number, string, number][]);
          const [what, k, ask, fav] = rem;
          const tot = 52 - k;
          return typed(`From a deck of 52 cards, ${what} are removed. The remaining cards are shuffled and one is drawn. Find P(${ask === 'ace' ? 'an' : 'a'} ${ask}).`, frac(fav, tot),
            [`Cards left: 52 − ${k} = ${tot}.`, `How many ${ask}s are left?`],
            [`${ask}s left: ${fav}`, `P = ${fav}/${tot} = ${fr(fav, tot)}`],
            [[`${fav}/52`, `Only ${tot} cards remain, so the total is ${tot}.`]]);
        }, 2),
      ],
    },
    {
      id: 'ts10.m.prob.apply', title: 'Applications of probability', prereqs: ['ts10.m.prob.events'],
      intro: [
        h('Bags, dice and quality checks'),
        p('Probability is used to design fair games, to check quality in factories, and to plan for risks. The same rule works everywhere: list the equally likely outcomes, count the favourable ones, and divide.'),
        h('Two dice'),
        p('Rolling two dice gives 6 × 6 = 36 equally likely ordered pairs, from (1, 1) to (6, 6). Sums from 2 to 12 are NOT equally likely: 7 can happen 6 ways but 2 only one way.'),
        vis({ kind: 'bar-graph', labels: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], values: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1] }, 'Number of ways to get each sum with two dice: rises from 1 (sum 2) to 6 (sum 7) and falls to 1 (sum 12)'),
        f('ways to get sum S with two dice = 6 − |S − 7|  (for 2 ≤ S ≤ 12)'),
        X({
          title: 'What if? Change the target sum of two dice', formula: 'P(sum S) = (6 − |S − 7|)/36',
          result: ['P', 'Probability of sum S', '(6 - abs(S - 7)) / 36', '', 3],
          vars: [['S', 'Target sum', 2, 12, 1, 7]],
          notes: [['S', 'Moving the target from 2 up to 7 adds one more way each step, so the chance rises; above 7 it falls again.', 'Moving towards the extremes (2 or 12) leaves only one way, (1, 1) or (6, 6).']],
          mistakes: [
            ['Treating the 11 sums as equally likely', 'There are 11 possible sums but 36 equally likely pairs. P(sum 7) = 6/36, not 1/11.'],
            ['Counting (2, 5) and (5, 2) as the same', 'The two dice are different, so these are two different outcomes.'],
          ],
          real: 'Board games like Ludo and Snakes and Ladders feel "fair" because every face of a die is equally likely.',
        }),
        keys('Bag problems: total = all balls; favourable = balls of that colour.', 'Two dice: 36 outcomes.', 'Defective items: P(good) = 1 − P(defective).'),
        remember('If extra balls are added to a bag, BOTH the favourable count and the total may change.'),
      ],
      examples: [
        ex('A bag has 3 red and 5 black balls. One ball is drawn. Find P(red) and P(not red).', ['Total = 8', 'P(red) = 3/8', 'P(not red) = 1 − 3/8 = 5/8'], '3/8 and 5/8'),
        ex('Two dice are thrown. Find P(sum is 8).', ['Pairs: (2,6), (3,5), (4,4), (5,3), (6,2) → 5', 'P = 5/36'], '5/36'),
        ex('In a lot of 144 ball pens, 20 are defective. One pen is picked at random. Find P(it is good).', ['Good pens = 124', 'P = 124/144'], '31/36'),
      ],
      practice: [
        tp('bag', (r) => {
          const R = r.int(2, 9), B = r.int(2, 9), G = r.int(0, 6);
          const tot = R + B + G;
          const ask = r.pick(G ? (['red', 'blue', 'not blue', 'red or green'] as const) : (['red', 'blue', 'not blue'] as const));
          const fav = ask === 'red' ? R : ask === 'blue' ? B : ask === 'not blue' ? R + G : R + G;
          return typed(`A bag contains ${R} red, ${B} blue${G ? ` and ${G} green` : ''} marbles. One marble is taken out at random. Find the probability that it is ${ask}.`, frac(fav, tot),
            [`Total marbles = ${tot}.`, ask === 'not blue' ? 'Not blue = red or green.' : `Count the ${ask} marbles.`],
            [`Favourable = ${fav}`, `P = ${fav}/${tot}${gcd(fav, tot) > 1 ? ` = ${fr(fav, tot)}` : ''}`],
            [[`${fav}/${tot - fav}`, 'Divide by the TOTAL number of marbles, not by the others.']]);
        }),
        tp('dice2', (r) => {
          const S = r.int(2, 12);
          const ways = 6 - Math.abs(S - 7);
          const pairs: string[] = [];
          for (let a = 1; a <= 6; a++) { const b = S - a; if (b >= 1 && b <= 6) pairs.push(`(${a}, ${b})`); }
          return typed(`Two dice are thrown at the same time. What is the probability that the sum of the numbers is ${S}?`, frac(ways, 36),
            ['There are 36 equally likely ordered pairs.', `List the pairs that add to ${S}.`],
            [`Pairs: ${pairs.join(', ')} → ${ways}`, `P = ${ways}/36${gcd(ways, 36) > 1 ? ` = ${fr(ways, 36)}` : ''}`],
            [['1/11', 'The 11 sums are not equally likely. Use the 36 pairs.']]);
        }, 2),
        tp('defective', (r) => {
          const N = r.pick([100, 120, 144, 150, 200, 250, 400]), d = r.int(3, 30);
          const ask = r.pick(['good', 'defective'] as const);
          const fav = ask === 'good' ? N - d : d;
          return typed(`A box of ${N} bulbs from a Hyderabad factory has ${d} defective ones. One bulb is picked at random. Find the probability that it is ${ask}.`, frac(fav, N),
            ['P = favourable ÷ total.', ask === 'good' ? `Good bulbs = ${N} − ${d}.` : `Defective bulbs = ${d}.`],
            [`Favourable = ${fav}`, `P = ${fav}/${N} = ${fr(fav, N)}`],
            ask === 'good' ? [[`${d}/${N}`, 'That is the probability of a DEFECTIVE bulb.']] : [[`${N - d}/${N}`, 'That is the probability of a GOOD bulb.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 14 STATISTICS
interface GT { lo: number; w: number; f: number[] }
const classes = (g: GT) => g.f.map((_, i) => `${g.lo + i * g.w}–${g.lo + (i + 1) * g.w}`);
const table = (g: GT) => `Classes: ${classes(g).join(', ')}; frequencies: ${g.f.join(', ')}.`;
const gtVis = (g: GT) => ({ kind: 'bar-graph' as const, labels: classes(g), values: g.f });
const makeGT = (r: Rng, n = 5): GT => ({ lo: r.pick([0, 10, 20, 100]), w: r.pick([5, 10, 20]), f: Array.from({ length: n }, () => r.int(2, 15)) });
const ch14: USpec = {
  id: 'ts10.m.ch14', subject: 'math', title: 'Statistics', source: src(14),
  objectives: [
    {
      id: 'ts10.m.stat.mean', title: 'Mean of grouped data: direct and deviation methods',
      intro: [
        h('One number for a whole class'),
        p('The marks of 40 students in a Mahabubabad school are grouped into classes 0–10, 10–20, … We no longer know each mark, so we assume every value in a class sits at its middle — the class mark.'),
        def('Class mark xᵢ', 'The midpoint of a class: (lower limit + upper limit) ÷ 2.'),
        h('Direct method'),
        f('x̄ = Σfᵢxᵢ / Σfᵢ', 'mean equals sum of f x over sum of f'),
        h('Deviation (assumed mean) method'),
        p('When the class marks are large, choose an assumed mean a (usually a central class mark), find the deviations dᵢ = xᵢ − a (small numbers!), and correct a by the average deviation.'),
        f('x̄ = a + Σfᵢdᵢ / Σfᵢ'),
        X({
          title: 'What if? Change the assumed mean or the deviations', formula: 'x̄ = a + Σfd / Σf',
          result: ['m', 'Mean', 'a + S / F', '', 2],
          vars: [['a', 'Assumed mean a', 0, 100, 1, 50], ['S', 'Σfd (sum of f × deviation)', -200, 200, 1, 40], ['F', 'Σf (total frequency)', 1, 100, 1, 40]],
          notes: [
            ['S', 'A bigger positive Σfd means more of the data lies above a, so the true mean is above a.', 'A negative Σfd means the data is mostly below a, so the mean is less than a.'],
            ['F', 'The same total deviation spread over more items moves the mean less.', 'Fewer items make each deviation count more.'],
            ['a', 'In real use, changing a also changes every d — the final mean comes out the SAME whatever a you choose. Here we hold Σfd fixed to see the formula.', 'Any convenient a works; it just makes the arithmetic easier.'],
          ],
          mistakes: [
            ['Dividing by the number of classes', 'Divide by Σf (total frequency), not by how many classes there are.'],
            ['Using class limits instead of class marks', 'Each class is represented by its MIDPOINT.'],
            ['Forgetting to add a back', 'Σfd/Σf is only the correction; the mean is a + Σfd/Σf.'],
          ],
          real: 'Telangana\'s statistics department averages grouped data like household incomes in ranges, using exactly these class-mark methods.',
        }),
        keys('Class mark = midpoint.', 'Direct: Σfx/Σf.', 'Deviation: a + Σfd/Σf.', 'Both methods give the same mean.'),
        remember('Make a table with columns: class, f, x, fx (or d, fd). Add the f and fx columns at the bottom.'),
      ],
      examples: [
        ex('Find the mean: classes 0–10, 10–20, 20–30, 30–40, 40–50 with frequencies 3, 5, 9, 5, 3.', ['Class marks: 5, 15, 25, 35, 45', 'Σf = 25', 'Σfx = 15 + 75 + 225 + 175 + 135 = 625', 'x̄ = 625/25'], '25'),
        ex('Using a = 25 for the same data, find the mean by the deviation method.', ['d = −20, −10, 0, 10, 20', 'Σfd = −60 − 50 + 0 + 50 + 60 = 0', 'x̄ = 25 + 0/25'], '25 (same answer)'),
      ],
      practice: [
        tp('direct', (r) => {
          const g = makeGT(r);
          const xs = g.f.map((_, i) => g.lo + i * g.w + g.w / 2);
          const sf = g.f.reduce((s, x) => s + x, 0), sfx = g.f.reduce((s, x, i) => s + x * xs[i], 0);
          const m = sfx / sf;
          return typed(`Find the mean of the grouped data (2 decimal places). ${table(g)}`, num(rd(m, 2), undefined, false, 0.011),
            ['Find each class mark (midpoint).', 'Multiply each f by its class mark and add.', 'Divide Σfx by Σf.'],
            [`Class marks: ${xs.join(', ')}`, `Σf = ${sf}`, `Σfx = ${sfx}`, `x̄ = ${sfx}/${sf} ≈ ${rd(m, 2)}`],
            [[String(rd(sfx / g.f.length, 2)), 'Divide by Σf (total frequency), not by the number of classes.']],
            { visual: gtVis(g), steps: [st('Σf (total frequency)?', num(sf)), st('Σfx?', num(sfx)), st('Mean (2 d.p.)?', num(rd(m, 2), undefined, false, 0.011))] });
        }, 2),
        tp('assumed', (r) => {
          const a = r.pick([25, 35, 45, 55, 150, 250]), F = r.int(20, 60), S = r.int(-120, 120);
          const m = a + S / F;
          return typed(`Using the assumed mean method with a = ${a}, a table gives Σfᵢ = ${F} and Σfᵢdᵢ = ${n_(S)}. Find the mean (2 decimal places).`, num(rd(m, 2), undefined, false, 0.011),
            ['x̄ = a + Σfd/Σf.'],
            [`x̄ = ${a} + (${n_(S)})/${F}`, `= ${a} ${S < 0 ? '−' : '+'} ${rd(Math.abs(S) / F, 4)}`, `≈ ${rd(m, 2)}`],
            [[String(rd(S / F, 2)), 'Add the assumed mean a back.']]);
        }),
        tp('class-mark', (r) => {
          const lo = r.int(1, 30) * 5, w = r.pick([5, 10, 20, 25]);
          return typed(`What is the class mark of the class ${lo}–${lo + w}?`, num(lo + w / 2),
            ['Class mark = (lower + upper) ÷ 2.'], [`(${lo} + ${lo + w}) ÷ 2 = ${lo + w / 2}`],
            [[String(w), 'That is the class width. The class mark is the midpoint.']]);
        }),
      ],
    },
    {
      id: 'ts10.m.stat.mode', title: 'Mode of grouped data', prereqs: ['ts10.m.stat.mean'],
      intro: [
        h('The most popular value'),
        p('A shoe shop in Warangal wants to stock the size people buy most — the mode. With grouped data, the class with the highest frequency is the modal class, and the mode lies inside it, pulled towards whichever neighbour is bigger.'),
        def('Modal class', 'The class with the highest frequency.'),
        f('Mode = l + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × h'),
        p('l = lower limit of the modal class, h = class width, f₁ = frequency of the modal class, f₀ = frequency of the class before it, f₂ = frequency of the class after it.'),
        X({
          title: 'What if? Change the neighbours of the modal class', formula: 'Mode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h',
          result: ['Mo', 'Mode', 'l + (f1 - f0) / (2 * f1 - f0 - f2) * h', '', 2],
          vars: [['l', 'Lower limit of modal class', 0, 100, 5, 40], ['h', 'Class width', 5, 20, 5, 10], ['f1', 'Frequency of modal class', 10, 30, 1, 20], ['f0', 'Frequency before', 0, 9, 1, 8], ['f2', 'Frequency after', 0, 9, 1, 6]],
          notes: [
            ['f0', 'A bigger class BEFORE pulls the mode back towards the lower end of the modal class.', 'A smaller class before lets the mode move up.'],
            ['f2', 'A bigger class AFTER pulls the mode towards the upper end.', 'A smaller class after lets the mode slide down.'],
            ['f1', 'A taller modal class makes the pull from the neighbours relatively weaker, so the mode heads towards the middle of the class.', 'A shorter modal class is pulled more by its neighbours.'],
          ],
          mistakes: [
            ['Taking f₀ and f₂ from the wrong classes', 'f₀ is the class just BEFORE the modal class, f₂ the one just AFTER.'],
            ['Using the class mark as l', 'l is the LOWER LIMIT of the modal class.'],
            ['Forgetting to multiply by h', 'The fraction tells you how far into the class (as a share of h) the mode lies.'],
          ],
          real: 'Clothing companies stock most units in the modal size range found from customer data.',
        }),
        keys('Find the modal class first (highest f).', 'Mode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h.', 'The mode always lies within the modal class.'),
        remember('If the modal class is the first class, f₀ = 0; if it is the last, f₂ = 0.'),
      ],
      examples: [
        ex('Find the mode: 0–10: 5, 10–20: 8, 20–30: 12, 30–40: 7, 40–50: 3.', ['Modal class 20–30: l = 20, f₁ = 12, f₀ = 8, f₂ = 7, h = 10', 'Mode = 20 + (12 − 8)/(24 − 8 − 7) × 10', '= 20 + 4/9 × 10 ≈ 20 + 4.44'], '≈ 24.44'),
        ex('Families with 1–3, 3–5, 5–7, 7–9, 9–11 members: 7, 8, 2, 2, 1. Find the mode.', ['Modal class 3–5: l = 3, f₁ = 8, f₀ = 7, f₂ = 2, h = 2', 'Mode = 3 + 1/7 × 2'], '≈ 3.29'),
      ],
      practice: [
        tp('mode', (r) => {
          const g = makeGT(r);
          const k = r.int(1, 3);
          g.f[k] = Math.max(...g.f) + r.int(1, 5);
          const l = g.lo + k * g.w, f1 = g.f[k], f0 = g.f[k - 1], f2 = g.f[k + 1];
          const mo = l + ((f1 - f0) / (2 * f1 - f0 - f2)) * g.w;
          return typed(`Find the mode of the grouped data (2 decimal places). ${table(g)}`, num(rd(mo, 2), undefined, false, 0.011),
            ['The modal class has the highest frequency.', `Modal class ${classes(g)[k]}: l = ${l}, f₁ = ${f1}, f₀ = ${f0}, f₂ = ${f2}, h = ${g.w}.`],
            [`Mode = ${l} + (${f1} − ${f0})/(${2 * f1} − ${f0} − ${f2}) × ${g.w}`, `= ${l} + ${f1 - f0}/${2 * f1 - f0 - f2} × ${g.w}`, `≈ ${rd(mo, 2)}`],
            [[String(l + g.w / 2), 'That is the class mark. Use the mode formula.']], { visual: gtVis(g) });
        }, 2),
        tp('modal-class', (r) => {
          const g = makeGT(r);
          const k = r.int(0, 4);
          g.f[k] = Math.max(...g.f) + r.int(1, 4);
          const cl = classes(g);
          return mcq(r, `Which is the modal class? ${table(g)}`, cl[k], cl.filter((_, i) => i !== k),
            ['Look for the highest frequency.'], [`Highest frequency ${g.f[k]} → modal class ${cl[k]}`], [], { visual: gtVis(g) });
        }),
      ],
    },
    {
      id: 'ts10.m.stat.median', title: 'Median of grouped data', prereqs: ['ts10.m.stat.mean'],
      intro: [
        h('The middle value'),
        p('The median splits the data into two equal halves: half the values are below it, half above. With grouped data we find which class contains the middle position n/2, then estimate inside that class.'),
        def('Cumulative frequency (cf)', 'The running total of frequencies up to and including a class.'),
        def('Median class', 'The first class whose cumulative frequency is greater than n/2.'),
        f('Median = l + [(n/2 − cf) / f] × h'),
        p('l = lower limit of the median class, n = total frequency, cf = cumulative frequency of the class BEFORE the median class, f = frequency of the median class, h = class width.'),
        X({
          title: 'What if? Slide the median within its class', formula: 'Median = l + (n/2 − cf)/f × h',
          result: ['Me', 'Median', 'l + (n / 2 - c) / f * h', '', 2],
          vars: [['l', 'Lower limit of median class', 0, 100, 5, 30], ['n', 'Total frequency n', 40, 60, 2, 50], ['c', 'cf before the median class', 10, 20, 1, 18], ['f', 'Frequency of the median class', 10, 30, 1, 12], ['h', 'Class width', 5, 20, 5, 10]],
          notes: [
            ['c', 'If more values lie before the median class, the middle position is reached sooner, so the median moves DOWN within the class.', 'Fewer values before means we must go further into the class.'],
            ['f', 'A crowded median class reaches the middle quickly, so the median is nearer its lower limit.', 'A thin median class spreads the values, so the median moves further in.'],
            ['n', 'More data pushes the middle position n/2 further along, so the median rises.', 'Less data pulls the middle back.'],
          ],
          mistakes: [
            ['Using the cf OF the median class', 'cf must be the cumulative frequency of the class BEFORE the median class.'],
            ['Using (n + 1)/2 for grouped data', 'For grouped data use n/2.'],
            ['Choosing the class with the biggest f as median class', 'That is the modal class. The median class is found from cumulative frequencies.'],
          ],
          real: 'News reports quote "median household income" because a few very rich households cannot drag the median up the way they drag the mean.',
        }),
        keys('Build the cf column.', 'Median class: first cf > n/2.', 'Median = l + (n/2 − cf)/f × h.'),
        remember('Check that your median lies inside the median class.'),
      ],
      examples: [
        ex('Find the median: 0–10: 5, 10–20: 8, 20–30: 12, 30–40: 7, 40–50: 3.', ['n = 35, n/2 = 17.5', 'cf: 5, 13, 25, 32, 35 → median class 20–30', 'l = 20, cf = 13, f = 12, h = 10', 'Median = 20 + (17.5 − 13)/12 × 10 = 20 + 3.75'], '23.75'),
        ex('In a median class 40–50, n = 60, cf before = 22, f = 16. Find the median.', ['40 + (30 − 22)/16 × 10 = 40 + 5'], '45'),
      ],
      practice: [
        tp('median', (r) => {
          const g = makeGT(r);
          const n = g.f.reduce((s, x) => s + x, 0);
          let cum = 0, k = 0;
          for (let i = 0; i < g.f.length; i++) { if (cum + g.f[i] > n / 2) { k = i; break; } cum += g.f[i]; }
          const l = g.lo + k * g.w, fk = g.f[k];
          const me = l + ((n / 2 - cum) / fk) * g.w;
          return typed(`Find the median of the grouped data (2 decimal places). ${table(g)}`, num(rd(me, 2), undefined, false, 0.011),
            ['Find n and n/2, then the cumulative frequencies.', `n = ${n}, n/2 = ${n / 2}. The median class is ${classes(g)[k]}.`, `l = ${l}, cf = ${cum}, f = ${fk}, h = ${g.w}.`],
            [`cf column: ${g.f.map((_, i) => g.f.slice(0, i + 1).reduce((s, x) => s + x, 0)).join(', ')}`, `Median class ${classes(g)[k]}`, `Median = ${l} + (${n / 2} − ${cum})/${fk} × ${g.w} ≈ ${rd(me, 2)}`],
            [[String(rd(l + ((n / 2 - cum - fk) / fk) * g.w, 2)), 'Use the cf of the class BEFORE the median class.']],
            { visual: gtVis(g), steps: [st('n/2?', num(n / 2)), st('cf of the class before the median class?', num(cum)), st('Median (2 d.p.)?', num(rd(me, 2), undefined, false, 0.011))] });
        }, 2),
        tp('median-formula', (r) => {
          const l = r.pick([10, 20, 30, 40, 50, 60]), h0 = r.pick([5, 10, 20]), f0 = r.int(8, 20), c = r.int(5, 25), n = 2 * (c + r.int(1, f0 - 1));
          const me = l + ((n / 2 - c) / f0) * h0;
          return typed(`For grouped data, n = ${n}. The median class is ${l}–${l + h0} with frequency ${f0}, and the cumulative frequency of the class before it is ${c}. Find the median (2 decimal places).`, num(rd(me, 2), undefined, false, 0.011),
            ['Median = l + (n/2 − cf)/f × h.'], [`= ${l} + (${n / 2} − ${c})/${f0} × ${h0}`, `≈ ${rd(me, 2)}`]);
        }),
      ],
    },
    {
      id: 'ts10.m.stat.ogive', title: 'Ogives (cumulative frequency curves)', prereqs: ['ts10.m.stat.median'],
      intro: [
        h('A picture of running totals'),
        p('An ogive (pronounced "oh-jive") is a graph of cumulative frequency. It rises steadily and lets you read the median, or "how many students scored less than 35?", straight off the graph.'),
        def('Less than ogive', 'Plot (upper limit of each class, "less than" cumulative frequency) and join with a smooth curve. It rises from left to right.'),
        def('More than ogive', 'Plot (lower limit of each class, "more than" cumulative frequency). It falls from left to right.'),
        vis({ kind: 'line-graph', xLabel: 'marks (upper limit)', yLabel: 'cumulative frequency', points: [[10, 5], [20, 13], [30, 25], [40, 32], [50, 35]] }, 'Less than ogive rising through (10, 5), (20, 13), (30, 25), (40, 32), (50, 35)'),
        p('Reading the median: mark n/2 on the cumulative frequency axis, go across to the curve, and down to the x-axis. The two ogives (less than and more than) cross exactly at the median.'),
        f('Median (from an ogive) = x-coordinate where cf = n/2 (or where the two ogives meet)'),
        X({
          title: 'What if? Where do you read the median?', formula: 'read at cf = n/2',
          result: ['c', 'cf level to read the median at', 'n / 2'],
          vars: [['n', 'Total frequency n', 10, 200, 2, 60]],
          notes: [['n', 'More data: you read further up the cumulative frequency axis — always exactly half-way up the curve.', 'Less data: the reading level drops, still at half of n.']],
          mistakes: [
            ['Plotting cf against class marks', 'A less than ogive uses UPPER limits; a more than ogive uses LOWER limits.'],
            ['Reading at n instead of n/2', 'The median is half-way up: at n/2.'],
            ['Joining points with a ruler-drawn zig-zag', 'Draw a smooth freehand curve through the points.'],
          ],
          real: 'Exam boards use ogives to see what mark separates the top half of candidates from the bottom half.',
        }),
        keys('Less than: (upper limit, cf) — rising.', 'More than: (lower limit, cf) — falling.', 'Median at cf = n/2, or where the ogives cross.'),
        remember('The last point of a less than ogive is at cf = n (everyone is below the top limit).'),
      ],
      examples: [
        ex('Marks 0–10: 5, 10–20: 8, 20–30: 12, 30–40: 7, 40–50: 3. Write the points for the less than ogive.', ['Cumulative: 5, 13, 25, 32, 35', 'Upper limits: 10, 20, 30, 40, 50'], '(10, 5), (20, 13), (30, 25), (40, 32), (50, 35)'),
        ex('For the same data, write the points for the more than ogive.', ['More than 0: 35, more than 10: 30, more than 20: 22, more than 30: 10, more than 40: 3'], '(0, 35), (10, 30), (20, 22), (30, 10), (40, 3)'),
      ],
      practice: [
        tp('less-cf', (r) => {
          const g = makeGT(r);
          const k = r.int(1, 4);
          const up = g.lo + (k + 1) * g.w;
          const cf = g.f.slice(0, k + 1).reduce((s, x) => s + x, 0);
          return typed(`${table(g)} For the less than ogive, what cumulative frequency is plotted at ${up} (i.e. "less than ${up}")?`, num(cf),
            ['Add the frequencies of all classes below ' + up + '.'],
            [`${g.f.slice(0, k + 1).join(' + ')} = ${cf}`, `Point: (${up}, ${cf})`],
            [[String(g.f[k]), 'That is only one class. Cumulative means the running total.']], { visual: gtVis(g) });
        }),
        tp('more-cf', (r) => {
          const g = makeGT(r);
          const k = r.int(1, 4);
          const low = g.lo + k * g.w;
          const cf = g.f.slice(k).reduce((s, x) => s + x, 0);
          return typed(`${table(g)} For the more than ogive, what cumulative frequency is plotted at ${low} (i.e. "${low} or more")?`, num(cf),
            [`Add the frequencies of all classes from ${low} upwards.`],
            [`${g.f.slice(k).join(' + ')} = ${cf}`, `Point: (${low}, ${cf})`],
            [[String(g.f.slice(0, k).reduce((s, x) => s + x, 0)), 'That counts the values BELOW. "More than" counts from this limit upward.']], { visual: gtVis(g) });
        }, 2),
        bank('ogive-facts', [
          { q: 'For a "less than" ogive, the cumulative frequencies are plotted against:', a: 'the upper limits of the classes', w: ['the lower limits of the classes', 'the class marks', 'the frequencies'], h: ['"Less than 20" ends at 20.'], s: ['Less than ogive → upper limits.'] },
          { q: 'For a "more than" ogive, the cumulative frequencies are plotted against:', a: 'the lower limits of the classes', w: ['the upper limits of the classes', 'the class marks', 'the class widths'], h: ['"More than 20" starts at 20.'], s: ['More than ogive → lower limits.'] },
          { q: 'The x-coordinate of the point where the less than and more than ogives intersect gives the:', a: 'median', w: ['mean', 'mode', 'range'], h: ['At that point, half are below and half above.'], s: ['Both cumulative counts equal n/2 there, so it is the median.'] },
          { q: 'For 80 students, at what cumulative frequency do you read the median on a less than ogive?', a: '40', w: ['80', '41', '20'], h: ['Half of n.'], s: ['n/2 = 40.'] },
          { q: 'A less than ogive always:', a: 'rises (or stays level) from left to right', w: ['falls from left to right', 'is a straight line', 'starts at the total frequency'], h: ['Running totals never decrease.'], s: ['Cumulative "less than" counts can only grow.'] },
          { q: 'The last point of a less than ogive has cumulative frequency equal to:', a: 'the total frequency n', w: ['0', 'n/2', 'the largest class frequency'], h: ['Everyone is below the top limit.'], s: ['All n values are less than the last upper limit.'] },
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14];
