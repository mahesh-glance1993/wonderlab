// Telangana SCERT Class 6 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts6.m.ch<n>); objectives ts6.m.<topic>.<skill>.
// Written for an 11-year-old: short sentences, everyday Telangana contexts, a picture for every idea.
// Every template uses only the Rng it is given; every answer key is computed, never typed by hand.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, explore, photo, L, num, frac, choose, matching, ordering, tapAll,
  gcd, lcm, fr, rd, inr, isPrime, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(6, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** signed integer for display with a proper minus sign: −3 */
const n_ = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
/** integer in brackets when negative: (−3) */
const pn = (x: number) => (x < 0 ? `(−${-x})` : `${x}`);
/** Indian grouping: 12345678 → 1,23,45,678 */
const indian = (n: number) => {
  const s = String(n);
  if (s.length <= 3) return s;
  let head = s.slice(0, -3);
  const parts: string[] = [];
  while (head.length > 2) { parts.unshift(head.slice(-2)); head = head.slice(0, -2); }
  if (head) parts.unshift(head);
  return `${parts.join(',')},${s.slice(-3)}`;
};
/** International grouping: 12345678 → 12,345,678 */
const intl = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/** Wrong grouping (pairs all the way): 1234567 → 1,23,45,67 */
const pairsAll = (n: number) => String(n).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const two = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
const three = (n: number) => {
  const hd = Math.floor(n / 100), rest = n % 100;
  return [hd ? `${ONES[hd]} hundred` : '', rest ? two(rest) : ''].filter(Boolean).join(' ');
};
/** number in words, Indian system (n < 100 crore) */
const wordsIN = (n: number) => {
  const cr = Math.floor(n / 1e7), lk = Math.floor(n / 1e5) % 100, th = Math.floor(n / 1000) % 100, rest = n % 1000;
  return [cr ? `${two(cr)} crore` : '', lk ? `${two(lk)} lakh` : '', th ? `${two(th)} thousand` : '', rest ? three(rest) : ''].filter(Boolean).join(' ');
};
/** number in words, international system (n < 1 billion) */
const wordsINT = (n: number) => {
  const mi = Math.floor(n / 1e6), th = Math.floor(n / 1000) % 1000, rest = n % 1000;
  return [mi ? `${three(mi)} million` : '', th ? `${three(th)} thousand` : '', rest ? three(rest) : ''].filter(Boolean).join(' ');
};
/** prime factors listed one by one: 36 → 2 × 2 × 3 × 3 */
const pfl = (n: number) => {
  const parts: number[] = [];
  let x = n;
  for (let d = 2; x > 1; d++) while (x % d === 0) { x /= d; parts.push(d); }
  return parts.join(' × ');
};
const factorsOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
/** k distinct values from a list */
const some = <X,>(r: Rng, list: readonly X[], k: number): X[] => r.shuffle([...list]).slice(0, k);

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
const st = (prompt: string, answer: AnswerSpec) => ({ prompt, answer });
const YN = (r: Rng, prompt: string, yes: boolean, hints: string[], solution: string[]) => mcq(r, prompt, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'], hints, solution);
/** ordinal: 1st, 2nd, 3rd, 11th */
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10]}`;
const TRI = ['ABC', 'PQR', 'XYZ', 'LMN', 'DEF', 'KLM', 'STU', 'GHI'];
const QUAD = ['ABCD', 'PQRS', 'KLMN', 'WXYZ', 'EFGH', 'DEFG'];

// ================================================================== CH 1 KNOWING OUR NUMBERS
const PLACES: [number, string][] = [[10, 'tens'], [100, 'hundreds'], [1000, 'thousands'], [10000, 'ten thousands'], [100000, 'lakhs'], [1000000, 'ten lakhs']];
const ch1: USpec = {
  id: 'ts6.m.ch1', subject: 'math', title: 'Knowing Our Numbers', source: src(1),
  objectives: [
    {
      id: 'ts6.m.num.place', title: 'Place value and large numbers (Indian and international systems)',
      intro: [
        h('How big is big?'),
        p('Hyderabad has about 1,00,00,000 people. A cricket stadium holds about 55,000. To read and write numbers like these we use place value: every digit gets its value from the place where it sits.'),
        def('Place value', 'The value of a digit because of its position. In 4,52,316 the digit 5 is in the ten-thousands place, so its place value is 50,000. Its face value is just 5.'),
        vis({ kind: 'emoji', text: '🧮 ones → tens → hundreds → thousands → ten thousands → lakhs → ten lakhs → crores' }, 'Each place is 10 times the place to its right.'),
        h('Two ways to put commas'),
        p('Indian system: put the first comma after 3 digits from the right, then after every 2 digits: 3,45,67,890 (three crore forty-five lakh sixty-seven thousand eight hundred ninety).'),
        p('International system: put a comma after every 3 digits: 34,567,890 (thirty-four million five hundred sixty-seven thousand eight hundred ninety).'),
        keys('Each place is 10 times the one on its right.', '1 lakh = 1,00,000 = 100 thousand.', '10 lakh = 1 million; 1 crore = 10 million.', 'Commas help us read big numbers quickly.'),
        remember('Place value = face value × value of the place. A 0 in a place has place value 0.'),
        tip('Read a big number in groups: the part before each comma is read together with the name of that group (crore, lakh, thousand).'),
      ],
      examples: [
        ex('Write 70524893 with commas in both systems and read it.', ['Indian: count 3 from the right, then 2s → 7,05,24,893.', 'Read: seven crore five lakh twenty-four thousand eight hundred ninety-three.', 'International: 3s from the right → 70,524,893.', 'Read: seventy million five hundred twenty-four thousand eight hundred ninety-three.'], '7,05,24,893 = 70,524,893'),
        ex('Find the place value of 6 in 3,46,215.', ['6 sits in the thousands place.', 'Place value = 6 × 1,000 = 6,000.'], '6,000'),
      ],
      practice: [
        tp('pv', (r) => {
          let n = r.int(1000000, 9999999);
          const [pl, name] = r.pick(PLACES);
          if (Math.floor(n / pl) % 10 === 0) n += pl;
          const d = Math.floor(n / pl) % 10;
          return typed(`In ${indian(n)}, what is the place value of the digit in the ${name} place?`, num(d * pl),
            ['Find the digit in that place first.', `Then multiply it by ${indian(pl)}.`],
            [`The digit in the ${name} place is ${d}.`, `Place value = ${d} × ${indian(pl)} = ${indian(d * pl)}`],
            [[`${d}`, `${d} is only the face value. Multiply by the value of the place (${indian(pl)}).`]]);
        }),
        tp('commas', (r) => {
          const n = r.int(1000000, 99999999);
          return mcq(r, `Which shows ${n} with commas in the Indian system?`, indian(n), [intl(n), pairsAll(n)],
            ['Indian system: first comma after 3 digits from the right.', 'After that, a comma after every 2 digits.'],
            [`From the right: ${String(n).slice(-3)}, then pairs.`, `Answer: ${indian(n)}`],
            [['wrong', 'Count the first 3 digits from the right, then go 2 at a time.']]);
        }),
        tp('words', (r) => {
          const n = r.int(10, 99) * 100000 + r.int(1, 99) * 1000 + r.int(101, 999);
          const lk = Math.floor(n / 100000) % 10;
          const w1 = n + (lk < 9 ? 100000 : -100000), w2 = n + (Math.floor(n / 1000) % 10 < 9 ? 1000 : -1000);
          return mcq(r, `Which is ${indian(n)} in words (Indian system)?`, wordsIN(n), [wordsIN(w1), wordsIN(w2), wordsINT(n)],
            ['Read the digits before each comma together.', 'The groups are crore, lakh, thousand, then hundreds-tens-ones.'],
            [`${indian(n)} = ${wordsIN(n)}`]);
        }),
        tp('expand', (r) => {
          const a = r.int(1, 9), b = r.int(0, 9), c = r.int(1, 9), d = r.int(0, 9), e = r.int(1, 9);
          const n = a * 100000 + b * 10000 + c * 1000 + d * 100 + e;
          return typed(`Write as a number: ${a} lakh + ${b} ten thousand + ${c} thousand + ${d} hundred + ${e} ones.`, num(n),
            ['Put each digit in its place: lakhs, ten thousands, thousands, hundreds, tens, ones.', 'There are no tens, so the tens digit is 0.'],
            [`${a} ${b} ${c} ${d} 0 ${e}`, `= ${indian(n)}`],
            [[`${a}${b}${c}${d}${e}`, 'You missed a 0 for the empty tens place.']]);
        }),
        matchT('convert', 'Match each amount to the same amount', [
          ['1 lakh', '100 thousand'], ['10 lakh', '1 million'], ['1 crore', '10 million'], ['10 crore', '100 million'], ['1 thousand', '10 hundreds'], ['1 million', '1,000 thousand'],
        ], ['1 million has 6 zeros: 10,00,000 in the Indian system.', '1 crore has 7 zeros.']),
        tp('million-lakh', (r) => {
          const m = r.int(2, 15);
          return typed(`A city has ${m} million trees. How many lakh trees is that?`, num(m * 10),
            ['1 million = 10 lakh.', `So multiply ${m} by 10.`],
            [`${m} million = ${m} × 10 lakh = ${m * 10} lakh`],
            [[`${m}`, '1 million is not 1 lakh — it is 10 lakh.'], [`${m * 100}`, '1 million = 10 lakh, not 100 lakh.']]);
        }),
      ],
    },
    {
      id: 'ts6.m.num.compare', title: 'Comparing and ordering numbers', prereqs: ['ts6.m.num.place'],
      intro: [
        h('Which is more?'),
        p('Bathukamma flower sellers want to know which market sold more garlands. To compare two numbers: first count the digits. More digits means a bigger number. If they have the same number of digits, compare from the LEFT, place by place, until the digits differ.'),
        vis({ kind: 'bar-graph', labels: ['Market A', 'Market B'], values: [4528, 4583] }, 'Two markets sold 4,528 and 4,583 garlands; the hundreds are equal, tens decide.'),
        def('Ascending order', 'From smallest to greatest: 12, 45, 301.'),
        def('Descending order', 'From greatest to smallest: 301, 45, 12.'),
        h('Making numbers with digits'),
        stepsB('Greatest number: put the digits from biggest to smallest.', 'Smallest number: put them from smallest to biggest.', 'If there is a 0, it cannot go first — put the smallest non-zero digit first, then the 0.'),
        keys('More digits → bigger number.', 'Same digits → compare from the left.', '> means "greater than", < means "less than".'),
        remember('The open mouth of > or < always faces the bigger number.'),
        tip('Line the numbers up one below another so the places match — then comparing is easy.'),
      ],
      examples: [
        ex('Compare 58,912 and 58,291.', ['Both have 5 digits.', 'Ten thousands: 5 = 5. Thousands: 8 = 8.', 'Hundreds: 9 > 2.'], '58,912 > 58,291'),
        ex('Make the greatest and smallest 4-digit numbers using 3, 0, 7, 5 once each.', ['Greatest: 7 5 3 0 → 7530.', 'Smallest: 0 cannot be first, so 3 0 5 7 → 3057.'], '7530 and 3057'),
      ],
      practice: [
        tp('largest', (r) => {
          const base = r.int(10, 99) * 1000;
          const nums = some(r, Array.from({ length: 40 }, (_, i) => base + i * 23 + r.int(0, 9)), 4);
          const mx = Math.max(...nums);
          return mcq(r, `Which is the greatest: ${nums.map(indian).join(', ')}?`, indian(mx), nums.filter((x) => x !== mx).map(indian),
            ['All have the same number of digits.', 'Compare from the left until the digits differ.'],
            [`Greatest = ${indian(mx)}`]);
        }),
        tp('order', (r) => {
          const nums = some(r, [r.int(1000, 9999), r.int(10000, 99999), r.int(10000, 99999), r.int(100000, 999999), r.int(100, 999)], 4);
          const uniq = [...new Set(nums)].sort((a, b) => a - b);
          return { type: 'order', prompt: 'Arrange in ascending order (smallest first).', ...ordering(r, uniq.map(indian)), hints: ['Fewer digits means smaller.', 'For equal digits, compare from the left.'], solution: [uniq.map(indian).join(' < ')] };
        }),
        tp('greatest', (r) => {
          const ds = some(r, [1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
          const g = Number([...ds].sort((a, b) => b - a).join(''));
          return typed(`Make the greatest 4-digit number using ${ds.join(', ')} once each.`, num(g),
            ['Biggest digit goes in the thousands place.', 'Then the next biggest, and so on.'],
            [`Digits from biggest to smallest: ${String(g).split('').join(', ')}`, `Greatest = ${g}`],
            [[Number([...ds].sort((a, b) => a - b).join('')).toString(), 'That is the smallest. For the greatest, start with the biggest digit.']]);
        }),
        tp('smallest', (r) => {
          const ds = [0, ...some(r, [1, 2, 3, 4, 5, 6, 7, 8, 9], 3)];
          const up = [...ds].sort((a, b) => a - b);
          const s = Number(`${up[1]}0${up[2]}${up[3]}`);
          return typed(`Make the smallest 4-digit number using ${r.shuffle(ds).join(', ')} once each.`, num(s),
            ['A 4-digit number cannot start with 0.', 'Put the smallest non-zero digit first, then 0.'],
            [`Smallest non-zero digit: ${up[1]}`, `Then 0, then the rest in increasing order: ${s}`],
            [[`${up[1]}${up[2]}${up[3]}`, '0123-type answers are only 3-digit numbers. The 0 must come second.']]);
        }),
        tp('diff', (r) => {
          const ds = some(r, [1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
          const g = Number([...ds].sort((a, b) => b - a).join('')), s = Number([...ds].sort((a, b) => a - b).join(''));
          return typed(`Using ${ds.join(', ')} once each, find the difference between the greatest and smallest 4-digit numbers.`, num(g - s),
            ['Make the greatest and the smallest number first.', 'Then subtract.'],
            [`Greatest = ${g}, smallest = ${s}`, `${g} − ${s} = ${g - s}`],
            [], { steps: [st('Greatest number?', num(g)), st('Smallest number?', num(s)), st('Difference?', num(g - s))] });
        }, 2),
        tp('sign', (r) => {
          const a = r.int(100000, 999999);
          const b = a + r.pick([-1, 1]) * r.pick([1, 10, 100, 1000, 10000]) * r.int(1, 3);
          const s = a > b ? '>' : '<';
          return mcq(r, `Which sign goes in the box?  ${indian(a)} □ ${indian(b)}`, s, [s === '>' ? '<' : '>', '='],
            ['Same number of digits? Compare from the left.', 'Find the first place where the digits differ.'],
            [`${indian(a)} ${s} ${indian(b)}`]);
        }),
      ],
    },
    {
      id: 'ts6.m.num.round', title: 'Rounding off and estimating', prereqs: ['ts6.m.num.place'],
      intro: [
        h('About how many?'),
        p('A newspaper says "about 40,000 people watched the match". The real number was 39,812. When an exact number is not needed, we round it to a nearby, easy number.'),
        vis({ kind: 'number-line', from: 30, to: 40, step: 1, marks: [37] }, '37 is closer to 40 than to 30, so it rounds to 40.'),
        def('Rounding to the nearest ten', 'Look at the ones digit. 0–4: round down. 5–9: round up. So 37 → 40, 34 → 30, 35 → 40.'),
        stepsB('Find the place you are rounding to.', 'Look at the digit just to its right.', 'If it is 5 or more, add 1 to the rounding place; otherwise keep it.', 'Change all digits to the right into 0.'),
        h('Estimating'),
        p('To estimate a sum, difference or product, round each number first and then work it out. The answer is close to the exact one and is quick to find in your head.'),
        keys('5 or more → round up; 4 or less → round down.', 'Round each number before you add, subtract or multiply.', 'Estimates help you check answers.'),
        remember('Rounding to the nearest hundred: look at the tens digit. To the nearest thousand: look at the hundreds digit.'),
        tip('If your exact answer is far from your estimate, check your working again.'),
      ],
      examples: [
        ex('Round 6,748 to the nearest hundred.', ['Hundreds digit is 7; the digit to its right (tens) is 4.', '4 is less than 5, so keep 7.', 'Make the tens and ones 0.'], '6,700'),
        ex('Estimate 486 + 317 by rounding to the nearest hundred.', ['486 → 500 (tens digit 8 ≥ 5).', '317 → 300 (tens digit 1 < 5).', '500 + 300 = 800.', 'Exact: 803 — very close!'], 'About 800'),
      ],
      practice: [
        tp('round', (r) => {
          const pl = r.pick([10, 100, 1000]);
          let n = r.int(1000, 99999);
          if (n % pl === 0) n += 3 * pl / 10 || 3;
          const a = Math.round(n / pl) * pl, dn = Math.floor(n / pl) * pl, up = dn + pl;
          const name = pl === 10 ? 'ten' : pl === 100 ? 'hundred' : 'thousand';
          return typed(`Round ${n} to the nearest ${name}.`, num(a),
            [`Look at the digit just to the right of the ${name}s place.`, '5 or more → round up; less than 5 → round down.'],
            [`${n} lies between ${dn} and ${up}.`, `It is nearer to ${a}.`],
            [[`${a === dn ? up : dn}`, 'Check the digit to the right again: 5 or more rounds up, 4 or less rounds down.']]);
        }),
        tp('est-sum', (r) => {
          const a = r.int(101, 949), b = r.int(101, 949);
          const ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100;
          return typed(`Estimate ${a} + ${b} by rounding each number to the nearest hundred.`, num(ra + rb),
            ['Round each number first.', 'Then add the rounded numbers.'],
            [`${a} → ${ra}, ${b} → ${rb}`, `${ra} + ${rb} = ${ra + rb}`],
            [[`${a + b}`, 'That is the exact sum. An estimate uses the rounded numbers.']]);
        }),
        tp('est-diff', (r) => {
          const a = r.int(5100, 9800), b = r.int(1100, 4900);
          const ra = Math.round(a / 1000) * 1000, rb = Math.round(b / 1000) * 1000;
          return typed(`Estimate ${a} − ${b} by rounding each number to the nearest thousand.`, num(ra - rb),
            ['Look at the hundreds digit to round to the nearest thousand.', 'Subtract the rounded numbers.'],
            [`${a} → ${ra}, ${b} → ${rb}`, `${ra} − ${rb} = ${ra - rb}`],
            [[`${a - b}`, 'That is the exact difference. Round first, then subtract.']]);
        }),
        tp('est-prod', (r) => {
          const a = r.int(12, 98), b = r.int(12, 98);
          const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
          return typed(`Estimate ${a} × ${b} by rounding each number to the nearest ten.`, num(ra * rb),
            ['Round each number to the nearest ten (5 rounds up).', 'Multiply the tens: for example 40 × 60 = 2400.'],
            [`${a} → ${ra}, ${b} → ${rb}`, `${ra} × ${rb} = ${ra * rb}`],
            [[`${a * b}`, 'That is the exact product. An estimate uses the rounded numbers.']]);
        }, 2),
        tp('which', (r) => {
          const x = r.int(3, 89) * 100;
          const ok = x + r.int(-49, 49), w1 = x + r.int(50, 99), w2 = x - r.int(51, 99), w3 = x + r.int(150, 199);
          return mcq(r, `Which number rounds to ${x} (nearest hundred)?`, `${ok}`, [`${w1}`, `${w2}`, `${w3}`],
            [`Numbers from ${x - 50} up to ${x + 49} round to ${x}.`, 'Look at the tens digit of each choice.'],
            [`${ok} is between ${x - 50} and ${x + 49}, so it rounds to ${x}.`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 2 WHOLE NUMBERS
const ch2: USpec = {
  id: 'ts6.m.ch2', subject: 'math', title: 'Whole Numbers', source: src(2),
  objectives: [
    {
      id: 'ts6.m.whole.line', title: 'Whole numbers on the number line',
      intro: [
        h('Counting numbers and zero'),
        p('We count 1, 2, 3, … — these are natural numbers. Add 0 to them and we get whole numbers: 0, 1, 2, 3, … There is a smallest whole number (0) but no biggest one: you can always add 1.'),
        def('Successor and predecessor', 'The successor of a number is the next number (add 1). The predecessor is the one just before (subtract 1). Successor of 99 is 100; predecessor of 100 is 99. 0 has no whole-number predecessor.'),
        vis({ kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[2, 6]] }, 'Adding 4 to 2: start at 2 and make 4 jumps to the right to reach 6.'),
        stepsB('Draw a line, mark 0, then mark equal steps for 1, 2, 3, …', 'To ADD, jump to the right.', 'To SUBTRACT, jump to the left.', 'A number on the right is always greater than a number on its left.'),
        keys('Whole numbers: 0, 1, 2, 3, …', 'Successor = number + 1; predecessor = number − 1.', 'Right on the number line means bigger.'),
        remember('Every natural number is a whole number, but 0 is a whole number that is not a natural number.'),
        tip('Numbers BETWEEN 3 and 8 do not include 3 and 8: they are 4, 5, 6, 7 — that is 8 − 3 − 1 = 4 numbers.'),
      ],
      examples: [
        ex('Use the number line to find 7 − 3.', ['Start at 7.', 'Make 3 jumps to the left: 6, 5, 4.'], '4', { kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[7, 4]] }),
        ex('Write the successor and predecessor of 1,00,000.', ['Successor: 1,00,000 + 1 = 1,00,001.', 'Predecessor: 1,00,000 − 1 = 99,999.'], '1,00,001 and 99,999'),
      ],
      practice: [
        tp('succ', (r) => {
          const n = r.pick([r.int(99, 9999), r.pick([999, 9999, 99999, 1099, 19999])]);
          return typed(`What is the successor of ${n}?`, num(n + 1), ['Successor means the next number.', 'Add 1.'], [`${n} + 1 = ${n + 1}`], [[`${n - 1}`, 'That is the predecessor. The successor comes AFTER.']]);
        }),
        tp('pred', (r) => {
          const n = r.pick([r.int(100, 9999), r.pick([1000, 10000, 100000, 2000, 5010])]);
          return typed(`What is the predecessor of ${n}?`, num(n - 1), ['Predecessor means the number just before.', 'Subtract 1.'], [`${n} − 1 = ${n - 1}`], [[`${n + 1}`, 'That is the successor. The predecessor comes BEFORE.']]);
        }),
        tp('jump', (r) => {
          const a = r.int(0, 10), b = r.int(2, 8), who = nm(r);
          return typed(`${who} stands at ${a} on a number line and makes ${b} jumps of 1 to the right. Where does ${who} land?`, num(a + b),
            ['Jumping right means adding.', `${a} + ${b}`], [`${a} + ${b} = ${a + b}`], [], { visual: { kind: 'number-line', from: 0, to: 20, step: 1, marks: [a] } });
        }),
        tp('back', (r) => {
          const a = r.int(9, 20), b = r.int(2, 8);
          return typed(`On the number line, start at ${a} and jump ${b} steps to the left. Which number do you reach?`, num(a - b),
            ['Jumping left means subtracting.', `${a} − ${b}`], [`${a} − ${b} = ${a - b}`], [[`${a + b}`, 'Left means smaller — subtract.']], { visual: { kind: 'number-line', from: 0, to: 20, step: 1, marks: [a] } });
        }),
        tp('between', (r) => {
          const a = r.int(10, 200), b = a + r.int(5, 60);
          return typed(`How many whole numbers are there between ${a} and ${b}?`, num(b - a - 1),
            ['"Between" does not include the two end numbers.', `Count = ${b} − ${a} − 1`],
            [`${b} − ${a} − 1 = ${b - a - 1}`], [[`${b - a}`, 'Do not count an end number: subtract 1 more.'], [`${b - a + 1}`, 'You counted both end numbers. "Between" leaves them out.']]);
        }),
        bank('facts', [
          { q: 'What is the smallest whole number?', a: '0', w: ['1', '−1', 'There is none'], h: ['Whole numbers start before 1.'], s: ['Whole numbers: 0, 1, 2, … so the smallest is 0.'] },
          { q: 'What is the greatest whole number?', a: 'There is no greatest whole number', w: ['9,99,99,999', '1 crore', '0'], h: ['Can you always add 1?'], s: ['Any whole number + 1 is a bigger whole number, so there is no greatest.'] },
          { q: 'Which whole number has no whole-number predecessor?', a: '0', w: ['1', '10', '100'], h: ['What comes before 0?'], s: ['0 − 1 is not a whole number, so 0 has no predecessor among whole numbers.'] },
          { q: 'Which of these is NOT a whole number?', a: '1/2', w: ['0', '15', '1000'], h: ['Whole numbers have no parts.'], s: ['1/2 is a fraction, not a whole number.'] },
          { q: 'On a number line, a number to the RIGHT of another number is…', a: 'greater', w: ['smaller', 'equal', 'always 0'], h: ['Numbers grow as we move right.'], s: ['Moving right means adding, so it is greater.'] },
          { q: 'Which is a whole number but not a natural number?', a: '0', w: ['1', '7', '100'], h: ['Natural numbers start from 1.'], s: ['0 is whole but not natural.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.whole.props', title: 'Properties of whole numbers', prereqs: ['ts6.m.whole.line'],
      intro: [
        h('Rules that make maths faster'),
        p('3 + 5 = 5 + 3 and 4 × 7 = 7 × 4. These are not accidents — they are properties that work for ALL whole numbers. Using them we can do hard sums in our head.'),
        def('Commutative', 'Changing the order does not change the answer for + and ×: a + b = b + a, a × b = b × a.'),
        def('Associative', 'Changing the grouping does not change the answer for + and ×: (a + b) + c = a + (b + c).'),
        def('Identity', 'Adding 0 keeps a number the same (a + 0 = a). Multiplying by 1 keeps it the same (a × 1 = a).'),
        def('Closure', 'Adding or multiplying two whole numbers always gives a whole number. Subtracting may not (3 − 5 is not whole). Division by 0 is not defined.'),
        f('a × (b + c) = a × b + a × c', 'a times b plus c equals a times b plus a times c'),
        X({
          title: 'What if? Distributive property', formula: 'a × (b + c) = a × b + a × c',
          result: ['P', 'Product', 'a*(b + c)'],
          vars: [['a', 'Multiplier a', 1, 20, 1, 6], ['b', 'First part b', 0, 100, 10, 100], ['c', 'Second part c', 0, 10, 1, 2]],
          notes: [['a', 'Both parts are multiplied by a, so the whole answer grows a times as fast.', 'A smaller a makes both parts smaller.']],
          mistakes: [['6 × (100 + 2) = 600 + 2', 'Multiply BOTH parts: 6 × 100 + 6 × 2 = 612.']],
          real: '6 notebooks at ₹102 each: 6 × 100 + 6 × 2 = ₹612 — easy in your head!',
        }),
        keys('+ and × are commutative and associative.', '− and ÷ are not commutative: 5 − 3 ≠ 3 − 5.', '0 is the additive identity; 1 is the multiplicative identity.', 'a × 0 = 0 for every whole number a.'),
        remember('You can never divide by 0.'),
        tip('Look for pairs that make 10, 100 or 1000: 4 × 25 = 100, 8 × 125 = 1000, 2 × 50 = 100.'),
      ],
      examples: [
        ex('Find 25 × 37 × 4 quickly.', ['Rearrange (commutative): 25 × 4 × 37.', '25 × 4 = 100.', '100 × 37 = 3700.'], '3,700'),
        ex('Find 45 × 102 using the distributive property.', ['45 × 102 = 45 × (100 + 2)', '= 45 × 100 + 45 × 2', '= 4500 + 90'], '4,590'),
      ],
      practice: [
        tp('distrib', (r) => {
          const a = r.int(12, 89), k = r.pick([98, 99, 101, 102, 103]);
          const op = k > 100 ? '+' : '−', d = Math.abs(k - 100);
          return typed(`Use the distributive property to find ${a} × ${k}.`, num(a * k),
            [`Write ${k} as 100 ${op} ${d}.`, `${a} × 100 ${op} ${a} × ${d}`],
            [`${a} × ${k} = ${a} × (100 ${op} ${d})`, `= ${a * 100} ${op} ${a * d}`, `= ${a * k}`]);
        }),
        tp('assoc', (r) => {
          const [x, y] = r.pick([[4, 25], [2, 50], [8, 125], [5, 20]] as [number, number][]);
          const k = r.int(13, 99);
          return typed(`Find ${x} × ${k} × ${y} by clever grouping.`, num(x * y * k),
            [`Group ${x} × ${y} first.`, `${x} × ${y} = ${x * y}`], [`${x} × ${y} = ${x * y}`, `${x * y} × ${k} = ${x * y * k}`]);
        }),
        tp('add-clever', (r) => {
          const a = r.int(101, 899), c = Math.ceil(a / 100) * 100 + 100 - a, b = r.int(102, 899);
          return typed(`Find ${a} + ${b} + ${c} by rearranging.`, num(a + b + c),
            [`Which two numbers add up to a round hundred?`, `${a} + ${c} = ${a + c}`], [`(${a} + ${c}) + ${b} = ${a + c} + ${b} = ${a + b + c}`]);
        }),
        matchT('names', 'Match each statement to the property it shows', [
          ['7 + 9 = 9 + 7', 'Commutative (addition)'], ['(2 × 5) × 8 = 2 × (5 × 8)', 'Associative (multiplication)'], ['46 + 0 = 46', 'Additive identity'],
          ['93 × 1 = 93', 'Multiplicative identity'], ['4 × (10 + 3) = 40 + 12', 'Distributive'], ['58 × 0 = 0', 'Multiplying by zero'],
        ], ['Order changed → commutative.', 'Brackets moved → associative.']),
        bank('concept', [
          { q: 'Is 6 − 9 a whole number?', a: 'No — whole numbers are not closed under subtraction', w: ['Yes, it is 3', 'Yes, it is 15'], h: ['6 − 9 goes below 0.'], s: ['6 − 9 = −3, which is not a whole number.'] },
          { q: 'What is 17 ÷ 0?', a: 'Not defined', w: ['0', '17', '1'], h: ['How many 0s make 17?'], s: ['No number of zeros adds to 17, so division by 0 is not defined.'] },
          { q: 'Which is true for ALL whole numbers a and b?', a: 'a + b = b + a', w: ['a − b = b − a', 'a ÷ b = b ÷ a', 'a − 0 = 0'], h: ['Which operation lets you swap the order?'], s: ['Addition is commutative.'] },
          { q: 'What is the multiplicative identity?', a: '1', w: ['0', '10', '2'], h: ['a × ? = a'], s: ['a × 1 = a, so 1 is the multiplicative identity.'] },
          { q: 'What is the additive identity?', a: '0', w: ['1', '10', '−1'], h: ['a + ? = a'], s: ['a + 0 = a, so 0 is the additive identity.'] },
          { q: '0 ÷ 8 = ?', a: '0', w: ['8', 'Not defined', '1'], h: ['Share 0 sweets among 8 children.'], s: ['0 ÷ 8 = 0 (everyone gets nothing). It is 8 ÷ 0 that is not defined.'] },
        ]),
        tp('missing', (r) => {
          const a = r.int(12, 99), b = r.int(12, 99);
          return typed(`Fill in the box: ${a} × □ = ${b} × ${a}`, num(b),
            ['Multiplication is commutative: order can be swapped.'], [`${a} × ${b} = ${b} × ${a}, so □ = ${b}`], [[`${a}`, `Swap the order of ${b} × ${a}.`]]);
        }),
      ],
    },
    {
      id: 'ts6.m.whole.patterns', title: 'Patterns in whole numbers', prereqs: ['ts6.m.whole.props'],
      intro: [
        h('Numbers love shapes'),
        p('Some numbers can be arranged as a line, a rectangle, a square or a triangle of dots. 9 dots make a 3 × 3 square; 6 dots make a triangle (1 + 2 + 3). Spotting such patterns makes calculating fun.'),
        vis({ kind: 'objects', emoji: '🟠', count: 9, groupsOf: 3 }, '9 laddoos in a 3 by 3 square: 9 is a square number.'),
        def('Square numbers', '1, 4, 9, 16, 25, … (1 × 1, 2 × 2, 3 × 3, …)'),
        def('Triangular numbers', '1, 3, 6, 10, 15, … (1, 1 + 2, 1 + 2 + 3, …). The n-th one is n × (n + 1) ÷ 2.'),
        h('Shortcut patterns'),
        keys('× 9: multiply by 10, then subtract the number. 23 × 9 = 230 − 23 = 207.', '× 99: multiply by 100, then subtract. 23 × 99 = 2300 − 23 = 2277.', '× 5: multiply by 10, then halve. 46 × 5 = 460 ÷ 2 = 230.'),
        remember('Every square number other than 1 can be seen as the sum of two triangular numbers next to each other: 9 = 3 + 6.'),
        tip('In a number pattern, look at the difference between neighbouring terms — it often tells you the rule.'),
      ],
      examples: [
        ex('Find 37 × 99 using a pattern.', ['37 × 99 = 37 × 100 − 37', '= 3700 − 37'], '3,663'),
        ex('What is the next number: 4, 9, 14, 19, …?', ['Differences: 5, 5, 5.', 'Add 5 again: 19 + 5.'], '24'),
      ],
      practice: [
        tp('x9', (r) => {
          const n = r.int(12, 99);
          return typed(`Find ${n} × 9 using the pattern "× 10, then subtract".`, num(n * 9), [`${n} × 10 = ${n * 10}`, `Now subtract ${n}.`], [`${n * 10} − ${n} = ${n * 9}`]);
        }),
        tp('x99', (r) => {
          const n = r.int(12, 99);
          return typed(`Find ${n} × 99 using a pattern.`, num(n * 99), [`${n} × 100 = ${n * 100}`, `Now subtract ${n}.`], [`${n * 100} − ${n} = ${n * 99}`], [[`${n * 100}`, `You still need to subtract ${n}.`]]);
        }),
        tp('x5', (r) => {
          const n = r.int(6, 49) * 2;
          return typed(`Find ${n} × 5 quickly.`, num(n * 5), [`${n} × 10 = ${n * 10}`, 'Halve it.'], [`${n * 10} ÷ 2 = ${n * 5}`]);
        }),
        tp('seq', (r) => {
          const a = r.int(1, 30), d = r.int(2, 12);
          return typed(`What comes next: ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, …?`, num(a + 4 * d),
            ['Find the difference between neighbouring numbers.', `Each time we add ${d}.`], [`${a + 3 * d} + ${d} = ${a + 4 * d}`]);
        }),
        tp('square', (r) => {
          const k = r.int(4, 15), s = k * k;
          return mcq(r, 'Which of these is a square number?', `${s}`, [`${s + 1}`, `${s - 2}`, `${s + k}`, `${2 * k}`].filter((x) => Math.sqrt(+x) % 1 !== 0),
            ['A square number = a number × itself.', 'Try 4 × 4, 5 × 5, 6 × 6, …'], [`${k} × ${k} = ${s}`]);
        }),
        tp('tri', (r) => {
          const n = r.int(5, 12);
          return typed(`Triangular numbers go 1, 3, 6, 10, … What is the ${ord(n)} triangular number?`, num((n * (n + 1)) / 2),
            ['The n-th triangular number = 1 + 2 + … + n.', `Or use n × (n + 1) ÷ 2 with n = ${n}.`], [`${n} × ${n + 1} ÷ 2 = ${(n * (n + 1)) / 2}`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 3 PLAYING WITH NUMBERS
const FACT_N = [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 64, 72, 80, 84, 90, 96, 100];
const ch3: USpec = {
  id: 'ts6.m.ch3', subject: 'math', title: 'Playing with Numbers', source: src(3),
  objectives: [
    {
      id: 'ts6.m.pwn.factors', title: 'Factors, multiples, prime and composite numbers',
      intro: [
        h('Arranging chairs'),
        p('A teacher wants to put 12 chairs in equal rows. She can make 1 row of 12, 2 rows of 6, 3 rows of 4, 4 of 3, 6 of 2 or 12 of 1. The numbers 1, 2, 3, 4, 6, 12 are the factors of 12.'),
        vis({ kind: 'objects', emoji: '🪑', count: 12, groupsOf: 4 }, '12 chairs in 3 rows of 4.'),
        def('Factor', 'A number that divides another exactly (no remainder). 3 is a factor of 12.'),
        def('Multiple', 'A number we get by multiplying: 12, 24, 36, … are multiples of 12. Every number has infinitely many multiples.'),
        def('Prime number', 'A number with exactly two factors, 1 and itself: 2, 3, 5, 7, 11, 13, …'),
        def('Composite number', 'A number with more than two factors: 4, 6, 8, 9, …'),
        keys('1 is neither prime nor composite.', '2 is the only even prime.', 'Co-prime numbers have only 1 as a common factor: 8 and 15.', 'Twin primes differ by 2: (5, 7), (11, 13).'),
        remember('Every number is a factor and a multiple of itself.'),
        tip('To list factors, find them in pairs: 36 = 1 × 36 = 2 × 18 = 3 × 12 = 4 × 9 = 6 × 6.'),
      ],
      examples: [
        ex('List the factors of 30.', ['Find pairs: 1 × 30, 2 × 15, 3 × 10, 5 × 6.'], '1, 2, 3, 5, 6, 10, 15, 30 (8 factors)'),
        ex('Is 51 prime?', ['Try small primes: 51 ÷ 3 = 17.', 'So 51 = 3 × 17 has factors besides 1 and 51.'], 'No, 51 is composite'),
      ],
      practice: [
        tp('nfactors', (r) => {
          const n = r.pick(FACT_N), fs = factorsOf(n);
          return typed(`How many factors does ${n} have?`, num(fs.length), ['Find the factors in pairs.', 'Do not forget 1 and the number itself.'],
            [`Factors of ${n}: ${fs.join(', ')}`, `Count = ${fs.length}`], [[`${fs.length - 2}`, `Remember 1 and ${n} are also factors.`]]);
        }),
        tp('tap', (r) => {
          const n = r.pick(FACT_N), fs = factorsOf(n).filter((x) => x > 1 && x < n);
          const yes = some(r, fs, Math.min(3, fs.length));
          const no = some(r, Array.from({ length: n - 2 }, (_, i) => i + 2).filter((x) => n % x !== 0), 3);
          return { type: 'tap', prompt: `Tap all the factors of ${n}.`, ...tapAll(r, [...yes.map((x) => ({ label: `${x}`, ok: true })), ...no.map((x) => ({ label: `${x}`, ok: false }))]),
            hints: ['A factor divides exactly — no remainder.'], solution: [`Factors of ${n}: ${factorsOf(n).join(', ')}`] } as QSpec;
        }),
        tp('prime', (r) => {
          const primes = Array.from({ length: 80 }, (_, i) => i + 20).filter(isPrime), comps = Array.from({ length: 80 }, (_, i) => i + 20).filter((x) => !isPrime(x) && x % 2 === 1);
          const pr = r.pick(primes);
          return mcq(r, 'Which of these is a prime number?', `${pr}`, some(r, comps, 3).map(String), ['A prime has exactly 2 factors.', 'Try dividing by 3, 5, 7.'],
            [`${pr} has only the factors 1 and ${pr}.`]);
        }),
        tp('multiple', (r) => {
          const m = r.int(3, 15), k = r.int(3, 12);
          return typed(`What is the ${ord(k)} multiple of ${m}?`, num(m * k), [`Multiples of ${m}: ${m}, ${2 * m}, ${3 * m}, …`, `The ${ord(k)} is ${m} × ${k}.`], [`${m} × ${k} = ${m * k}`]);
        }),
        tp('coprime', (r) => {
          const pairs: [number, number][] = [[8, 15], [9, 14], [7, 12], [10, 21], [16, 25], [4, 9], [11, 18], [13, 20]];
          const bad: [number, number][] = [[6, 15], [8, 12], [9, 21], [10, 25], [14, 21], [12, 18], [4, 10], [15, 20]];
          const ok = r.pick(pairs);
          return mcq(r, 'Which pair is co-prime?', `${ok[0]} and ${ok[1]}`, some(r, bad, 3).map(([a, b]) => `${a} and ${b}`),
            ['Co-prime numbers have no common factor except 1.'], [`The only common factor of ${ok[0]} and ${ok[1]} is 1 (HCF = ${gcd(ok[0], ok[1])}).`]);
        }),
        bank('facts', [
          { q: 'The number 1 is…', a: 'neither prime nor composite', w: ['prime', 'composite', 'even'], h: ['How many factors does 1 have?'], s: ['1 has only one factor, so it is neither.'] },
          { q: 'Which is the only even prime number?', a: '2', w: ['4', '0', '6'], h: ['Every other even number is divisible by 2.'], s: ['2 has exactly two factors: 1 and 2.'] },
          { q: 'What is the smallest composite number?', a: '4', w: ['1', '2', '9'], h: ['Composite: more than two factors.'], s: ['4 has factors 1, 2, 4.'] },
          { q: 'Which pair are twin primes?', a: '17 and 19', w: ['19 and 23', '15 and 17', '7 and 9'], h: ['Twin primes are both prime and differ by 2.'], s: ['17 and 19 are both prime and differ by 2.'] },
          { q: 'How many multiples does 7 have?', a: 'Infinitely many', w: ['7', '10', '1'], h: ['7, 14, 21, … does it stop?'], s: ['You can keep multiplying by bigger numbers forever.'] },
          { q: 'Which number is a factor of EVERY number?', a: '1', w: ['0', '2', '10'], h: ['What divides everything exactly?'], s: ['Any number ÷ 1 leaves no remainder.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.pwn.divis', title: 'Tests for divisibility', prereqs: ['ts6.m.pwn.factors'],
      intro: [
        h('Divide without dividing!'),
        p('Can 2,16,512 laddoos be packed in boxes of 8 with none left? Divisibility rules answer such questions just by looking at the digits.'),
        def('Divisible', 'a is divisible by b if a ÷ b leaves remainder 0.'),
        keys(
          'By 2: last digit is 0, 2, 4, 6 or 8.',
          'By 3: sum of digits is divisible by 3.',
          'By 4: the number made by the last two digits is divisible by 4.',
          'By 5: last digit is 0 or 5. By 10: last digit is 0.',
          'By 6: divisible by both 2 and 3.',
          'By 8: the number made by the last three digits is divisible by 8.',
          'By 9: sum of digits is divisible by 9.',
          'By 11: (sum of digits in odd places from the right) − (sum in even places) is 0 or a multiple of 11.',
        ),
        vis({ kind: 'emoji', text: '9 1 8 5 → (5 + 8) − (1 + 9) = 3 → not divisible by 11' }, 'The 11 test uses alternate digits.'),
        remember('If a number is divisible by 9, it is also divisible by 3. The reverse is not always true: 12 is divisible by 3 but not by 9.'),
        tip('For 6, check two rules: even AND digit-sum divisible by 3.'),
      ],
      examples: [
        ex('Is 7,236 divisible by 4 and by 9?', ['Last two digits 36: 36 ÷ 4 = 9 ✓ → divisible by 4.', 'Digit sum 7 + 2 + 3 + 6 = 18 ✓ → divisible by 9.'], 'Yes, by both'),
        ex('Is 61,809 divisible by 11?', ['Odd places from right: 9 + 8 + 6 = 23.', 'Even places: 0 + 1 = 1.', '23 − 1 = 22, a multiple of 11.'], 'Yes'),
      ],
      practice: [
        tp('which', (r) => {
          const k = r.pick([3, 4, 6, 8, 9, 11]);
          const ok = k * r.int(Math.ceil(1000 / k), Math.floor(9999 / k));
          const wrong: string[] = [];
          for (let i = 1; wrong.length < 3 && i < 30; i++) { const w = ok + i * r.int(1, 3); if (w % k !== 0 && !wrong.includes(`${w}`)) wrong.push(`${w}`); }
          return mcq(r, `Which number is divisible by ${k}?`, `${ok}`, wrong, [`Use the divisibility rule for ${k}.`],
            [`${ok} ÷ ${k} = ${ok / k}, remainder 0.`]);
        }),
        tp('missing', (r) => {
          const k = r.pick([3, 9]), a = r.int(1, 9), b = r.int(0, 9), c = r.int(0, 9);
          const d = (k - ((a + b + c) % k)) % k;
          return typed(`Find the smallest digit that can go in the box so that ${a}${b}□${c} is divisible by ${k}.`, num(d),
            [`Rule for ${k}: the digit sum must be a multiple of ${k}.`, `Digits so far add up to ${a + b + c}.`],
            [`${a} + ${b} + ${c} = ${a + b + c}`, `${a + b + c} + ${d} = ${a + b + c + d}, a multiple of ${k}.`, `Smallest digit = ${d}`]);
        }),
        tp('eleven', (r) => {
          const yes = r.next() < 0.5;
          const n = yes ? 11 * r.int(910, 9090) : 11 * r.int(910, 9090) + r.int(1, 10);
          const ds = String(n).split('').reverse().map(Number);
          const odd = ds.filter((_, i) => i % 2 === 0).reduce((s, x) => s + x, 0), even = ds.filter((_, i) => i % 2 === 1).reduce((s, x) => s + x, 0);
          return YN(r, `Is ${n} divisible by 11?`, n % 11 === 0, ['Add the digits in odd places from the right, then the even places.', 'Subtract. Is the difference 0 or a multiple of 11?'],
            [`Odd places: ${odd}; even places: ${even}`, `Difference = ${Math.abs(odd - even)} → ${n % 11 === 0 ? 'divisible' : 'not divisible'} by 11.`]);
        }),
        tp('four', (r) => {
          const nums = Array.from({ length: 5 }, () => r.int(1000, 9999));
          nums[0] = 4 * r.int(250, 2499); nums[1] = 4 * r.int(250, 2499) + r.int(1, 3);
          const uniq = [...new Set(nums)];
          return { type: 'tap', prompt: 'Tap every number that is divisible by 4.', ...tapAll(r, uniq.map((x) => ({ label: `${x}`, ok: x % 4 === 0 }))),
            hints: ['Only the last two digits matter.', 'Is that 2-digit number in the 4 times table?'], solution: uniq.map((x) => `${x}: last two digits ${String(x).slice(-2)} → ${x % 4 === 0 ? 'yes' : 'no'}`) } as QSpec;
        }),
        tp('six', (r) => {
          const n = r.int(100, 999) * 2 + r.pick([0, 1]);
          const ds = String(n).split('').map(Number).reduce((s, x) => s + x, 0);
          return YN(r, `Is ${n} divisible by 6?`, n % 6 === 0, ['Divisible by 6 means divisible by 2 AND by 3.'],
            [`Even? ${n % 2 === 0 ? 'yes' : 'no'}. Digit sum ${ds} → divisible by 3? ${ds % 3 === 0 ? 'yes' : 'no'}.`, `So ${n % 6 === 0 ? 'yes' : 'no'}.`]);
        }),
        matchT('rules', 'Match each divisor with its test', [
          ['2', 'Last digit is even'], ['3', 'Digit sum divisible by 3'], ['4', 'Last two digits divisible by 4'], ['5', 'Last digit 0 or 5'],
          ['8', 'Last three digits divisible by 8'], ['9', 'Digit sum divisible by 9'], ['10', 'Last digit is 0'], ['11', 'Alternate digit sums differ by 0 or a multiple of 11'],
        ], ['Some rules look at the last digits, some at the digit sum.']),
      ],
    },
    {
      id: 'ts6.m.pwn.hcflcm', title: 'Prime factorisation, HCF and LCM', prereqs: ['ts6.m.pwn.divis'],
      intro: [
        h('Breaking numbers into primes'),
        p('Every number bigger than 1 can be written as a product of primes in exactly one way (ignoring order). 60 = 2 × 2 × 3 × 5. This is its prime factorisation — the number\'s "DNA".'),
        vis({ kind: 'emoji', text: '60 → 2 × 30 → 2 × 2 × 15 → 2 × 2 × 3 × 5' }, 'A factor tree for 60.'),
        def('HCF (Highest Common Factor)', 'The biggest number that divides both numbers. HCF of 12 and 18 is 6.'),
        def('LCM (Lowest Common Multiple)', 'The smallest number that both numbers divide. LCM of 4 and 6 is 12.'),
        f('HCF × LCM = first number × second number', 'H C F times L C M equals the product of the two numbers'),
        X({
          title: 'What if? Find the LCM from the HCF', formula: 'LCM = (a × b) ÷ HCF',
          result: ['LCM', 'Lowest common multiple', 'a*b/H'],
          vars: [['a', 'First number a', 2, 60, 2, 12], ['b', 'Second number b', 2, 60, 2, 18], ['H', 'Their HCF', 1, 12, 1, 6]],
          notes: [['H', 'A bigger HCF means the numbers share more, so the LCM is smaller.', 'A smaller HCF means the LCM is larger.']],
          mistakes: [['Using any H you like', 'H must really be the HCF of a and b (e.g. a = 12, b = 18 → H = 6), otherwise the answer is meaningless.']],
          real: 'Two buses leave every 12 and 18 minutes. HCF = 6, so they meet every 12 × 18 ÷ 6 = 36 minutes.',
        }),
        keys('HCF: product of the COMMON prime factors.', 'LCM: product of ALL prime factors, each the most times it appears.', 'Use HCF for "largest equal pieces / groups"; LCM for "when together again".'),
        remember('The HCF of co-prime numbers is 1 and their LCM is their product.'),
        tip('The HCF is never bigger than the smaller number; the LCM is never smaller than the bigger number.'),
      ],
      examples: [
        ex('Find the HCF and LCM of 24 and 36.', ['24 = 2 × 2 × 2 × 3, 36 = 2 × 2 × 3 × 3.', 'Common: 2 × 2 × 3 = 12 → HCF.', 'LCM = 2 × 2 × 2 × 3 × 3 = 72.', 'Check: 12 × 72 = 864 = 24 × 36 ✓'], 'HCF 12, LCM 72'),
        ex('Two bells ring every 6 and 8 minutes. They ring together at 9:00. When do they next ring together?', ['LCM(6, 8) = 24.', '24 minutes after 9:00.'], '9:24'),
      ],
      practice: [
        tp('pf', (r) => {
          const n = r.pick([24, 36, 40, 48, 54, 60, 72, 84, 90, 96, 100, 120, 126, 150, 180]);
          const c = pfl(n), parts = c.split(' × ');
          const w1 = [String(Number(parts[0]) * Number(parts[1])), ...parts.slice(2)].join(' × ');
          const w2 = [...parts.slice(0, -1), String(Number(parts[parts.length - 1]) + 2)].join(' × ');
          const w3 = parts.slice(1).join(' × ');
          return mcq(r, `Which is the prime factorisation of ${n}?`, c, [w1, w2, w3],
            ['Every factor must be prime.', 'Multiply your answer back to check.'], [`${n} = ${c}`],
            [['wrong', 'Check: are all factors prime, and does the product equal the number?']]);
        }),
        tp('hcf', (r) => {
          const g = r.int(2, 12);
          const [m, n] = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7]] as [number, number][]);
          const a = g * m, b = g * n;
          return typed(`Find the HCF of ${a} and ${b}.`, num(g), ['List factors or use prime factorisation.', 'Take the biggest common factor.'],
            [`${a} = ${pfl(a)}, ${b} = ${pfl(b)}`, `HCF = ${g}`], [[`${lcm(a, b)}`, 'That is the LCM. HCF is the biggest common FACTOR.']]);
        }),
        tp('lcm', (r) => {
          const [a, b] = r.pick([[4, 6], [6, 8], [6, 9], [8, 12], [10, 15], [12, 18], [9, 12], [5, 7], [12, 16], [15, 20], [14, 21], [8, 10]] as [number, number][]);
          return typed(`Find the LCM of ${a} and ${b}.`, num(lcm(a, b)), ['List multiples of the bigger number until the smaller one divides it.'],
            [`Multiples of ${b}: ${b}, ${2 * b}, ${3 * b}, …`, `LCM = ${lcm(a, b)}`], [[`${a * b}`, 'The product is a common multiple, but not always the LOWEST one.'], [`${gcd(a, b)}`, 'That is the HCF.']]);
        }),
        tp('rel', (r) => {
          const g = r.int(2, 9), [m, n] = r.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 7]] as [number, number][]);
          const a = g * m, b = g * n;
          return typed(`The HCF of ${a} and ${b} is ${g}. Use HCF × LCM = product to find their LCM.`, num((a * b) / g),
            [`Product = ${a} × ${b} = ${a * b}.`, `LCM = product ÷ HCF.`], [`${a * b} ÷ ${g} = ${(a * b) / g}`]);
        }, 2),
        tp('bells', (r) => {
          const [a, b] = r.pick([[6, 8], [4, 6], [10, 15], [12, 18], [8, 12], [9, 12], [6, 10], [15, 20]] as [number, number][]);
          return typed(`Two school bells ring every ${a} minutes and every ${b} minutes. They ring together now. After how many minutes will they ring together again?`, num(lcm(a, b), 'min'),
            ['"Together again" means a common multiple.', 'Find the LCM.'], [`LCM(${a}, ${b}) = ${lcm(a, b)} minutes`], [[`${gcd(a, b)}`, 'That is the HCF. Use the LCM for "together again".']]);
        }),
        tp('ribbon', (r) => {
          const g = r.pick([5, 6, 8, 9, 12, 15]), [m, n] = r.pick([[3, 4], [2, 5], [5, 7], [3, 8], [4, 9]] as [number, number][]);
          const a = g * m, b = g * n;
          return typed(`${nm(r)} has two ribbons, ${a} cm and ${b} cm long. Both are cut into pieces of the same length, as long as possible, with nothing left over. How long is each piece?`, num(g, 'cm'),
            ['"Largest equal pieces" means the HCF.', `Find the HCF of ${a} and ${b}.`], [`HCF(${a}, ${b}) = ${g} cm`], [[`${lcm(a, b)}`, 'The LCM is bigger than both ribbons! Use the HCF.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 4 BASIC GEOMETRICAL IDEAS
const ch4: USpec = {
  id: 'ts6.m.ch4', subject: 'math', title: 'Basic Geometrical Ideas', source: src(4),
  objectives: [
    {
      id: 'ts6.m.geo.lines', title: 'Point, line segment, line, ray and curve',
      intro: [
        h('The building blocks of shapes'),
        p('The tip of a sharp pencil marks a point. Stretch a thread between two nails and you see a line segment. Every picture in geometry is built from these simple ideas.'),
        def('Point', 'An exact position. It has no length or thickness. We name it with a capital letter: point A.'),
        def('Line segment', 'The straight path between two points A and B. It has two end points and a fixed length. Written AB.'),
        def('Line', 'A line segment stretched forever in both directions. It has no end points.'),
        def('Ray', 'Starts at one point and goes on forever in one direction, like a torch beam. Ray OA starts at O.'),
        def('Curve', 'Any drawing made without lifting the pencil. A straight line is a special curve. A simple closed curve does not cross itself and ends where it starts.'),
        photo('🔦', 'A torch beam is like a ray: it starts at the torch and goes on in one direction.'),
        keys('Only one line passes through two given points.', 'Many lines can pass through one point.', 'Points on the same line are called collinear.', 'Two lines that cross meet in exactly one point.'),
        remember('A segment has 2 end points, a ray has 1, a line has 0.'),
        tip('If n points lie on one line, the number of segments they make is n × (n − 1) ÷ 2.'),
      ],
      examples: [
        ex('Points A, B, C, D lie on a line in that order. Name all the line segments.', ['From A: AB, AC, AD.', 'From B: BC, BD.', 'From C: CD.'], '6 segments'),
        ex('A, B, C are on a line in order with AB = 3 cm and BC = 5 cm. Find AC.', ['B is between A and C.', 'AC = AB + BC = 3 + 5.'], '8 cm'),
      ],
      practice: [
        matchT('names', 'Match each description with its name', [
          ['Has two end points', 'Line segment'], ['Has one end point', 'Ray'], ['Has no end points and is straight', 'Line'],
          ['Shows only a position', 'Point'], ['Is drawn without lifting the pencil and need not be straight', 'Curve'], ['Starts and ends at the same point without crossing itself', 'Simple closed curve'],
        ], ['Count the end points.']),
        tp('segments', (r) => {
          const n = r.int(3, 7), names = 'ABCDEFG'.slice(0, n).split('').join(', ');
          return typed(`Points ${names} are marked on a straight line. How many line segments do they form?`, num((n * (n - 1)) / 2),
            ['Join each point to every point after it.', `Count = ${n} × ${n - 1} ÷ 2`], [`${n - 1} + ${n - 2} + … + 1 = ${(n * (n - 1)) / 2}`], [[`${n - 1}`, 'Count longer segments too, like the one from the first to the last point.']]);
        }),
        tp('lines', (r) => {
          const n = r.int(3, 7);
          return typed(`${n} points are marked so that no three lie on one line. How many lines can be drawn through pairs of them?`, num((n * (n - 1)) / 2),
            ['Exactly one line passes through any two points.', 'Count the pairs.'], [`Pairs = ${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2}`], [[`${n * (n - 1)}`, 'Line AB is the same as line BA — divide by 2.']]);
        }),
        tp('ac', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9), [P, Q, R] = r.pick(TRI).split('');
          return typed(`${P}, ${Q}, ${R} lie on a line in that order. ${P}${Q} = ${a} cm and ${Q}${R} = ${b} cm. Find ${P}${R}.`, num(a + b, 'cm'),
            [`${Q} is between ${P} and ${R}.`, 'Add the two parts.'], [`${P}${R} = ${a} + ${b} = ${a + b} cm`]);
        }),
        bank('facts', [
          { q: 'How many lines can pass through ONE point?', a: 'Countless (infinitely many)', w: ['Only one', 'Two', 'None'], h: ['Turn a ruler around a pin.'], s: ['You can draw lines through a point in every direction.'] },
          { q: 'How many lines can pass through TWO given points?', a: 'Exactly one', w: ['Two', 'Countless', 'None'], h: ['Stretch a thread between two nails.'], s: ['Only one straight line joins two points.'] },
          { q: 'Which has a fixed, measurable length?', a: 'Line segment', w: ['Line', 'Ray', 'None of these'], h: ['Which one stops at both ends?'], s: ['Only a segment has two end points, so it has a length.'] },
          { q: 'Points that lie on the same line are called…', a: 'collinear points', w: ['parallel points', 'end points', 'curved points'], h: ['"co" = together, "linear" = line.'], s: ['They are collinear.'] },
          { q: 'Which is like a ray?', a: 'A beam of light from a torch', w: ['The edge of a ruler', 'A dot of ink', 'A railway track with both ends visible'], h: ['A ray starts somewhere and goes on in one direction.'], s: ['Light starts at the torch and travels on.'] },
          { q: 'Two different lines cross each other. In how many points do they meet?', a: '1', w: ['2', '0', 'Many'], h: ['Draw two crossing lines.'], s: ['Two different straight lines can meet in only one point.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.geo.angle', title: 'Angles', prereqs: ['ts6.m.geo.lines'],
      intro: [
        h('Where two rays meet'),
        p('Open a book a little, or look at the hands of a clock — you see an angle. An angle is made by two rays that start at the same point.'),
        vis({ kind: 'clock', h: 3, m: 0 }, 'At 3 o\'clock the clock hands make a right angle.'),
        def('Angle', 'Two rays with a common starting point. The rays are the arms and the common point is the vertex. ∠PQR has vertex Q and arms QP and QR.'),
        def('Interior and exterior', 'Points between the arms are in the interior of the angle; points outside are in its exterior.'),
        keys('Name an angle with three letters; the vertex is always in the middle.', '∠PQR and ∠RQP are the same angle.', 'If only one angle is at a vertex, you may write just ∠Q.'),
        remember('The middle letter in an angle\'s name is the vertex.'),
        tip('If k rays start from one point (all on one side), they make k × (k − 1) ÷ 2 angles — every pair of rays makes one.'),
      ],
      examples: [
        ex('Name the vertex and arms of ∠LMN.', ['The middle letter M is the vertex.', 'The arms are the rays from M: ML and MN.'], 'Vertex M; arms ML and MN'),
        ex('Three rays OA, OB, OC start from O. How many angles are formed?', ['Pairs of rays: OA & OB, OB & OC, OA & OC.'], '3 angles: ∠AOB, ∠BOC, ∠AOC'),
      ],
      practice: [
        tp('vertex', (r) => {
          const [a, b, c] = r.pick(TRI).split('');
          return mcq(r, `In ∠${a}${b}${c}, which point is the vertex?`, b, [a, c, `${a}${c}`], ['The vertex is the middle letter.'], [`∠${a}${b}${c}: vertex ${b}.`],
            [['wrong', 'The vertex is always the MIDDLE letter of the name.']]);
        }),
        tp('arms', (r) => {
          const [a, b, c] = r.pick(TRI).split('');
          return mcq(r, `What are the arms of ∠${a}${b}${c}?`, `${b}${a} and ${b}${c}`, [`${a}${b} and ${a}${c}`, `${c}${a} and ${c}${b}`, `${a}${c} only`],
            ['Arms are rays starting at the vertex.', `The vertex is ${b}.`], [`Arms: rays ${b}${a} and ${b}${c}.`]);
        }),
        tp('count', (r) => {
          const k = r.int(3, 7), O = r.pick(['O', 'P', 'V']), rays = 'ABCDEFG'.slice(0, k).split('').map((x) => `${O}${x}`).join(', ');
          return typed(`Rays ${rays} start from point ${O} (all on the same side, in order). How many angles are formed?`, num((k * (k - 1)) / 2),
            ['Every pair of rays makes an angle.', `Count = ${k} × ${k - 1} ÷ 2`], [`${(k * (k - 1)) / 2} angles`], [[`${k - 1}`, 'Count the big angles made by rays that are not neighbours too.']]);
        }),
        tp('poly', (r) => {
          const [n, nameS] = r.pick([[3, 'triangle'], [4, 'quadrilateral'], [5, 'pentagon'], [6, 'hexagon'], [8, 'octagon']] as [number, string][]);
          return typed(`How many angles (inside the shape) does a ${nameS} have?`, num(n), ['Each corner (vertex) has one angle.', 'Count the corners.'], [`A ${nameS} has ${n} vertices, so ${n} angles.`]);
        }),
        bank('parts', [
          { q: 'The common starting point of the two arms of an angle is called the…', a: 'vertex', w: ['arm', 'interior', 'centre'], h: ['Think of the corner.'], s: ['It is the vertex.'] },
          { q: '∠ABC and ∠CBA are…', a: 'the same angle', w: ['different angles', 'a straight line', 'a triangle'], h: ['Which letter is in the middle in both?'], s: ['Both have vertex B and arms BA, BC.'] },
          { q: 'A point lying between the two arms of an angle is in its…', a: 'interior', w: ['exterior', 'vertex', 'arm'], h: ['Inside the opening.'], s: ['Points inside the opening are in the interior.'] },
          { q: 'Which of these shows an angle in daily life?', a: 'An open pair of scissors', w: ['A full moon', 'A football', 'A dot on paper'], h: ['Look for two arms from one point.'], s: ['The blades of open scissors are two arms meeting at a vertex.'] },
          { q: 'An angle is formed by…', a: 'two rays with a common starting point', w: ['two parallel lines', 'one point only', 'a circle'], h: ['Remember arms and vertex.'], s: ['Two rays from the same point.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.geo.shapes', title: 'Triangles, quadrilaterals and circles', prereqs: ['ts6.m.geo.angle'],
      intro: [
        h('Shapes made of segments — and one that is not'),
        p('A samosa looks like a triangle, a carrom board is a quadrilateral and a bangle is a circle. Let us learn the parts of each.'),
        vis({ kind: 'triangle', a: 5, b: 4, c: 3, angleLabels: ['A', 'B', 'C'] }, 'Triangle ABC with three sides and three angles.'),
        def('Triangle', 'A closed shape with 3 sides, 3 angles and 3 vertices. In △ABC, side BC is opposite vertex A.'),
        def('Quadrilateral', 'A closed shape with 4 sides. In ABCD, AC and BD are its diagonals; AB and BC are adjacent sides; AB and CD are opposite sides.'),
        def('Circle', 'All points at the same distance (the radius) from a fixed point (the centre). The diameter passes through the centre and is twice the radius.'),
        keys('Chord: a segment joining two points on a circle. The diameter is the longest chord.', 'Arc: part of the circle. Circumference: the distance all around.', 'Sector: region between two radii and an arc. Segment: region between a chord and an arc.'),
        remember('Diameter = 2 × radius, so radius = diameter ÷ 2.'),
        tip('To find a diagonal of ABCD, join two vertices that are NOT next to each other.'),
      ],
      examples: [
        ex('The radius of a bangle is 3 cm. Find its diameter.', ['Diameter = 2 × radius', '= 2 × 3'], '6 cm'),
        ex('Name the diagonals and the side opposite to AB in quadrilateral ABCD.', ['Diagonals join non-neighbouring vertices: AC and BD.', 'The side not touching A or B is CD.'], 'Diagonals AC, BD; opposite side CD'),
      ],
      practice: [
        tp('diam', (r) => {
          const rad = r.int(2, 25);
          return typed(`A circular rangoli has radius ${rad} cm. What is its diameter?`, num(2 * rad, 'cm'), ['Diameter = 2 × radius.'], [`2 × ${rad} = ${2 * rad} cm`], [[`${rad / 2}`, 'Diameter is twice the radius, not half.']]);
        }),
        tp('rad', (r) => {
          const d = 2 * r.int(2, 30);
          return typed(`A wheel has diameter ${d} cm. What is its radius?`, num(d / 2, 'cm'), ['Radius = diameter ÷ 2.'], [`${d} ÷ 2 = ${d / 2} cm`], [[`${2 * d}`, 'Radius is HALF the diameter.']]);
        }),
        tp('opp', (r) => {
          const [a, b, c] = r.pick(TRI).split('');
          const v = r.pick([a, b, c]), side = [a, b, c].filter((x) => x !== v).join('');
          return mcq(r, `In triangle ${a}${b}${c}, which side is opposite vertex ${v}?`, side, [a, b, c].filter((x) => x !== v).map((x) => `${v}${x}`),
            ['The opposite side does not touch that vertex.'], [`Side ${side} does not touch ${v}.`]);
        }),
        tp('diag', (r) => {
          const [a, b, c, d] = r.pick(QUAD).split('');
          const ok = r.pick([`${a}${c}`, `${b}${d}`]);
          return mcq(r, `Which is a diagonal of quadrilateral ${a}${b}${c}${d}?`, ok, [`${a}${b}`, `${b}${c}`, `${c}${d}`, `${d}${a}`],
            ['A diagonal joins two vertices that are not next to each other.'], [`The diagonals are ${a}${c} and ${b}${d}.`]);
        }),
        bank('circle', [
          { q: 'The longest chord of a circle is the…', a: 'diameter', w: ['radius', 'arc', 'sector'], h: ['Which chord passes through the centre?'], s: ['The diameter passes through the centre, so it is the longest chord.'] },
          { q: 'The distance all around a circle is called its…', a: 'circumference', w: ['diameter', 'radius', 'chord'], h: ['Think of walking around a circular track.'], s: ['It is the circumference.'] },
          { q: 'The region between two radii and an arc is a…', a: 'sector', w: ['segment', 'chord', 'diameter'], h: ['Like a slice of pizza.'], s: ['It is a sector.'] },
          { q: 'The region between a chord and an arc is a…', a: 'segment', w: ['sector', 'radius', 'centre'], h: ['Cut a roti with one straight cut.'], s: ['It is a segment.'] },
          { q: 'How many diagonals does a quadrilateral have?', a: '2', w: ['4', '1', '0'], h: ['Join opposite corners.'], s: ['ABCD has diagonals AC and BD.'] },
          { q: 'A triangle has how many vertices?', a: '3', w: ['4', '6', '2'], h: ['"Tri" means three.'], s: ['3 vertices, 3 sides, 3 angles.'] },
        ]),
        matchT('parts', 'Match each part with its description', [
          ['Radius', 'Centre to a point on the circle'], ['Diameter', 'Chord through the centre'], ['Chord', 'Joins any two points on a circle'],
          ['Arc', 'A part of the circle'], ['Diagonal', 'Joins opposite corners of a quadrilateral'], ['Vertex', 'A corner where two sides meet'],
        ], ['Think of where each one starts and ends.']),
      ],
    },
  ],
};

// ================================================================== CH 5 MEASURES OF LINES AND ANGLES
const ANGLE_KIND = (a: number) => (a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Complete');
const ch5: USpec = {
  id: 'ts6.m.ch5', subject: 'math', title: 'Measures of Lines and Angles', source: src(5),
  objectives: [
    {
      id: 'ts6.m.meas.len', title: 'Measuring line segments',
      intro: [
        h('How long is it?'),
        p('Two pencils may look equal, but are they? To compare segments exactly we measure them with a ruler (scale) or a pair of dividers.'),
        photo('📏', 'A ruler marked in centimetres; each centimetre is split into 10 millimetres.'),
        stepsB('Place the 0 mark of the ruler exactly on one end point.', 'Keep your eye straight above the other end point (not at a slant).', 'Read the mark at the other end.', 'If the ruler edge is broken, start at 1 cm and subtract 1 from your reading.'),
        def('Millimetre', '1 cm = 10 mm. So 4.7 cm = 47 mm.'),
        def('Mid-point', 'The point M on AB with AM = MB. Each half is AB ÷ 2.'),
        keys('Length = reading at end − reading at start.', 'Looking at a slant gives a wrong reading (parallax error).', 'Dividers carry a length from a segment to the ruler accurately.'),
        remember('If B is between A and C, then AB + BC = AC.'),
        tip('Write lengths in the same unit before comparing: change mm to cm or cm to mm.'),
      ],
      examples: [
        ex('A segment starts at the 2 cm mark and ends at the 7.5 cm mark. How long is it?', ['Length = end − start', '= 7.5 − 2'], '5.5 cm'),
        ex('Which is longer: PQ = 6.2 cm or RS = 58 mm?', ['6.2 cm = 62 mm.', '62 mm > 58 mm.'], 'PQ is longer'),
      ],
      practice: [
        tp('ruler', (r) => {
          const a = r.int(1, 6) + r.pick([0, 0.5]), b = rd(a + r.int(2, 8) + r.pick([0, 0.5]), 1);
          return typed(`A segment starts at the ${a} cm mark and ends at the ${b} cm mark of a ruler. How long is it (in cm)?`, num(rd(b - a, 1), 'cm'),
            ['Length = end reading − start reading.'], [`${b} − ${a} = ${rd(b - a, 1)} cm`], [[`${b}`, 'The segment does not start at 0 — subtract the start reading.']]);
        }),
        tp('mm', (r) => {
          const c = rd(r.int(11, 129) / 10, 1);
          return typed(`Write ${c} cm in millimetres.`, num(rd(c * 10, 0), 'mm'), ['1 cm = 10 mm.', 'Multiply by 10.'], [`${c} × 10 = ${rd(c * 10, 0)} mm`]);
        }),
        tp('part', (r) => {
          const [P, Q, R] = r.pick(TRI).split(''), ac = r.int(8, 15), ab = r.int(2, ac - 2);
          return typed(`${P}, ${Q}, ${R} lie on a line in that order. ${P}${R} = ${ac} cm and ${P}${Q} = ${ab} cm. Find ${Q}${R}.`, num(ac - ab, 'cm'),
            [`${P}${Q} + ${Q}${R} = ${P}${R}`, 'So subtract.'], [`${Q}${R} = ${ac} − ${ab} = ${ac - ab} cm`], [[`${ac + ab}`, `${Q}${R} is a PART of ${P}${R}, so it must be smaller. Subtract.`]]);
        }),
        tp('mid', (r) => {
          const L2 = r.int(3, 14) * 2 + r.pick([0, 1]);
          return typed(`M is the mid-point of AB, and AB = ${L2} cm. How long is AM?`, num(L2 / 2, 'cm'), ['The mid-point cuts the segment into two equal halves.'], [`AM = ${L2} ÷ 2 = ${L2 / 2} cm`]);
        }),
        tp('longest', (r) => {
          const mm = some(r, [41, 44, 47, 52, 55, 58, 63, 66], 4);
          const mx = Math.max(...mm);
          const show = (x: number, i: number) => (i % 2 === 0 ? `${'ABCD'[i]}: ${x} mm` : `${'ABCD'[i]}: ${x / 10} cm`);
          const lab = mm.map(show);
          return mcq(r, `Which segment is the longest? ${lab.join(', ')}`, lab[mm.indexOf(mx)].split(':')[0], lab.map((x) => x.split(':')[0]).filter((_, i) => i !== mm.indexOf(mx)),
            ['Change all lengths into mm first.', '1 cm = 10 mm.'], [`In mm: ${mm.join(', ')}`, `Longest: ${mx} mm`]);
        }),
        bank('tools', [
          { q: 'Why should your eye be straight above the mark when measuring?', a: 'To avoid a wrong reading caused by looking at a slant', w: ['To make the ruler longer', 'Because rulers are curved', 'It does not matter'], h: ['Try reading a mark from the side.'], s: ['Looking at a slant shifts the mark you see (parallax error).'] },
          { q: 'Which instrument copies a length from a segment to a ruler?', a: 'Dividers', w: ['Protractor', 'Eraser', 'Set square'], h: ['It has two pointed legs.'], s: ['Dividers are used to compare and transfer lengths.'] },
          { q: 'The first mark of a ruler is broken. You start at 1 cm and the end is at 6.4 cm. The length is…', a: '5.4 cm', w: ['6.4 cm', '7.4 cm', '1 cm'], h: ['Subtract the start reading.'], s: ['6.4 − 1 = 5.4 cm.'] },
          { q: 'How many millimetres make 1 centimetre?', a: '10', w: ['100', '1000', '5'], h: ['Count the small marks between 0 and 1.'], s: ['1 cm = 10 mm.'] },
          { q: 'Comparing two segments just by looking is…', a: 'not always reliable', w: ['always correct', 'the best method', 'how engineers measure'], h: ['Our eyes can be tricked.'], s: ['We should measure to be sure.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.meas.angle', title: 'Measuring angles and types of angles', prereqs: ['ts6.m.meas.len'],
      intro: [
        h('How much does it turn?'),
        p('When the minute hand goes all the way round, it makes one complete turn (revolution). We split a complete turn into 360 equal parts called degrees (°).'),
        vis({ kind: 'clock', h: 6, m: 0 }, 'From 12 to 6 the hand makes half a turn: 180°.'),
        keys('Complete turn = 360°.', 'Half turn = straight angle = 180°.', 'Quarter turn = right angle = 90°.'),
        def('Acute angle', 'Less than 90°.'),
        def('Obtuse angle', 'More than 90° but less than 180°.'),
        def('Reflex angle', 'More than 180° but less than 360°.'),
        stepsB('Put the centre of the protractor on the vertex.', 'Line up the 0° line with one arm.', 'Read where the other arm crosses the scale, using the scale that starts at 0 on your arm.'),
        remember('The hour hand turns 30° every hour (360° ÷ 12).'),
        tip('First decide if the angle is acute or obtuse, then read the protractor — this stops you picking the wrong scale.'),
      ],
      examples: [
        ex('What angle does the minute hand turn from 12 to 9?', ['12 → 9 is three quarters of a turn.', '3/4 × 360° = 270°.'], '270°'),
        ex('Two angles make a straight line. One is 65°. Find the other.', ['A straight angle is 180°.', '180° − 65° = 115°.'], '115°'),
      ],
      practice: [
        tp('turn', (r) => {
          const [n, d] = r.pick([[1, 4], [1, 2], [3, 4], [1, 3], [2, 3], [1, 6], [1, 8], [1, 12], [5, 6]] as [number, number][]);
          return typed(`How many degrees are there in ${n}/${d} of a complete turn?`, num((360 * n) / d, '°'), ['A complete turn is 360°.', `Find ${n}/${d} of 360.`], [`360 ÷ ${d} × ${n} = ${(360 * n) / d}°`]);
        }),
        tp('classify', (r) => {
          const a = r.pick([r.int(10, 89), 90, r.int(91, 179), 180, r.int(181, 359)]);
          const k = ANGLE_KIND(a);
          return mcq(r, `What type of angle measures ${a}°?`, k, ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'].filter((x) => x !== k).slice(0, 3),
            ['Compare with 90° and 180°.'], [`${a}° is ${k.toLowerCase()}.`]);
        }),
        tp('straight', (r) => {
          const x = r.int(15, 165);
          return typed(`Two angles together make a straight angle. One is ${x}°. What is the other?`, num(180 - x, '°'), ['A straight angle is 180°.'], [`180 − ${x} = ${180 - x}°`], [[`${90 - x}`, 'A straight angle is 180°, not 90°.']]);
        }),
        tp('clock', (r) => {
          const hh = r.int(1, 11), a = 30 * Math.min(hh, 12 - hh);
          return typed(`What is the smaller angle between the hands of a clock at ${hh} o'clock?`, num(a, '°'), ['Each hour mark is 30° apart.', 'Count the hour gaps between the hands.'],
            [`${Math.min(hh, 12 - hh)} gaps × 30° = ${a}°`], [], { visual: { kind: 'clock', h: hh, m: 0 } });
        }),
        tp('hour', (r) => {
          const a = r.int(1, 12), b = ((a + r.int(1, 11) - 1) % 12) + 1;
          const gaps = (b - a + 12) % 12;
          return typed(`The hour hand moves from ${a} to ${b} (clockwise). Through how many degrees does it turn?`, num(gaps * 30, '°'), ['The hour hand turns 30° per hour.', `From ${a} to ${b} is ${gaps} hours.`], [`${gaps} × 30 = ${gaps * 30}°`]);
        }),
        tp('dir', (r) => {
          const D = ['North', 'East', 'South', 'West'], i = r.int(0, 3), k = r.int(1, 3), j = (i + k) % 4;
          return typed(`${nm(r)} faces ${D[i]} and turns clockwise to face ${D[j]}. Through how many degrees is the turn?`, num(90 * k, '°'),
            ['North → East → South → West is clockwise.', 'Each step is a right angle (90°).'], [`${k} right angle${k > 1 ? 's' : ''} = ${90 * k}°`]);
        }),
      ],
    },
    {
      id: 'ts6.m.meas.lines', title: 'Intersecting, perpendicular and parallel lines', prereqs: ['ts6.m.meas.angle'],
      intro: [
        h('Lines that meet, and lines that never do'),
        p('Look at a window grill: some bars cross, some never meet. The crossing ones are intersecting lines. If they cross at a right angle, they are perpendicular. Lines on a plane that never meet, however far you extend them, are parallel.'),
        photo('🪟', 'Window bars show parallel lines and perpendicular lines.'),
        def('Perpendicular lines', 'Lines that meet at a right angle (90°). We write l ⊥ m.'),
        def('Parallel lines', 'Lines in the same plane that never meet. The gap between them stays the same. We write l ∥ m.'),
        def('Perpendicular bisector', 'A line perpendicular to a segment that passes through its mid-point.'),
        keys('Two intersecting lines make 4 angles.', 'Perpendicular lines make 4 right angles.', 'Railway tracks and the lines of a notebook are parallel.'),
        remember('The letter T shows perpendicular lines; the letter H shows two parallel strokes.'),
        tip('n lines through one point make 2 × n angles around that point.'),
      ],
      examples: [
        ex('Lines l and m are perpendicular. What is each angle between them?', ['Perpendicular means meeting at a right angle.'], '90°'),
        ex('3 lines pass through one point. How many angles are formed around the point?', ['Each line gives 2 rays → 6 rays.', '6 rays around a point make 6 angles (2 × 3).'], '6'),
      ],
      practice: [
        tp('perp', (r) => {
          const pool: [string, boolean][] = [['Two edges at the corner of a notebook', true], ['The plus sign +', true], ['The letter T', true], ['The letter L', true], ['Hands of a clock at 3 o\'clock', true],
            ['Railway tracks', false], ['The letter V', false], ['Opposite edges of a ruler', false], ['The letter Z', false], ['Hands of a clock at 2 o\'clock', false]];
          const pick = [...some(r, pool.filter((x) => x[1]), 2), ...some(r, pool.filter((x) => !x[1]), 3)];
          return { type: 'tap', prompt: 'Tap everything that shows perpendicular lines.', ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints: ['Perpendicular lines meet at a right angle (a square corner).'], solution: pick.filter((x) => x[1]).map((x) => `${x[0]} ✓`) } as QSpec;
        }),
        tp('par', (r) => {
          const pool: [string, boolean][] = [['Railway tracks', true], ['Opposite edges of a blackboard', true], ['The two upright strokes of H', true], ['Lines of a ruled notebook', true], ['Strings of a veena', true],
            ['The letter V', false], ['The letter T', false], ['Hands of a clock at 3 o\'clock', false], ['The letter X', false], ['Two roads meeting at a junction', false]];
          const pick = [...some(r, pool.filter((x) => x[1]), 2), ...some(r, pool.filter((x) => !x[1]), 3)];
          return { type: 'tap', prompt: 'Tap everything that shows parallel lines.', ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints: ['Parallel lines never meet and stay the same distance apart.'], solution: pick.filter((x) => x[1]).map((x) => `${x[0]} ✓`) } as QSpec;
        }),
        tp('angles', (r) => {
          const n = r.int(2, 6);
          return typed(`${n} different lines all pass through one point. How many angles are formed around that point?`, num(2 * n),
            ['Each line makes 2 rays from the point.', 'Neighbouring rays make one angle each.'], [`${n} lines → ${2 * n} rays → ${2 * n} angles`], [[`${n}`, 'Each line gives TWO rays from the point.']]);
        }),
        tp('bisect', (r) => {
          const L2 = r.int(3, 12) * 2;
          return typed(`Line l is the perpendicular bisector of PQ = ${L2} cm and meets PQ at M. Find PM.`, num(L2 / 2, 'cm'), ['A bisector cuts the segment into two equal parts.'], [`PM = ${L2} ÷ 2 = ${L2 / 2} cm`]);
        }),
        matchT('symbols', 'Match each symbol with its meaning', [
          ['⊥', 'is perpendicular to'], ['∥', 'is parallel to'], ['∠', 'angle'], ['°', 'degree'], ['△', 'triangle'],
        ], ['∥ looks like two parallel strokes; ⊥ looks like an upside-down T.']),
        bank('facts', [
          { q: 'How many angles are formed when two lines intersect?', a: '4', w: ['2', '1', '3'], h: ['Draw an X.'], s: ['An X has 4 angles around the crossing point.'] },
          { q: 'Perpendicular lines meet at an angle of…', a: '90°', w: ['180°', '45°', '60°'], h: ['Think of the letter T.'], s: ['They meet at a right angle.'] },
          { q: 'Parallel lines…', a: 'never meet', w: ['meet at one point', 'meet at 90°', 'meet at two points'], h: ['Think of railway tracks.'], s: ['They stay the same distance apart and never meet.'] },
          { q: 'If l ⊥ m, then the angle between m and l is…', a: '90°', w: ['0°', '180°', 'Cannot say'], h: ['Perpendicular works both ways.'], s: ['m ⊥ l too, so 90°.'] },
          { q: 'The perpendicular bisector of a segment passes through its…', a: 'mid-point', w: ['end point', 'any point', 'outside'], h: ['"Bisect" means cut into two equal parts.'], s: ['It passes through the mid-point at 90°.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 6 INTEGERS
const ch6: USpec = {
  id: 'ts6.m.ch6', subject: 'math', title: 'Integers', source: src(6),
  objectives: [
    {
      id: 'ts6.m.int.need', title: 'Why we need negative numbers; integers on the number line',
      intro: [
        h('Below zero'),
        p('In winter the temperature in Adilabad can fall to 4 °C. In Kashmir it can go to 5 degrees BELOW zero. We write that as −5 °C. Numbers like −5 are negative numbers.'),
        vis({ kind: 'number-line', from: -6, to: 6, step: 1, marks: [-5, 4] }, '−5 is 5 steps to the left of 0; 4 is 4 steps to the right.'),
        def('Integers', 'The numbers …, −3, −2, −1, 0, 1, 2, 3, … Positive integers are to the right of 0, negative integers to the left. 0 is neither positive nor negative.'),
        keys('Gain, profit, above, up, deposit → positive.', 'Loss, below, down, withdrawal → negative.', 'Every integer has an opposite: the opposite of 7 is −7.'),
        remember('A number and its opposite are the same distance from 0, on opposite sides.'),
        tip('Sea level is 0: a hill 300 m high is +300 m; a sea bed 200 m deep is −200 m.'),
      ],
      examples: [
        ex('Write as an integer: a loss of ₹250.', ['Loss is negative.'], '−250'),
        ex('Which integer is 3 steps to the left of 1 on the number line?', ['Start at 1.', 'Move left 3: 0, −1, −2.'], '−2', { kind: 'number-line', from: -5, to: 5, step: 1, jumps: [[1, -2]] }),
      ],
      practice: [
        tp('words', (r) => {
          const n = r.int(2, 500);
          const [t, s] = r.pick([[`${n} m below sea level`, -1], [`a gain of ₹${n}`, 1], [`${n} °C below zero`, -1], [`a deposit of ₹${n}`, 1], [`a loss of ₹${n}`, -1], [`${n} m above sea level`, 1], [`a withdrawal of ₹${n}`, -1]] as [string, number][]);
          return typed(`Write as an integer: ${t}.`, num(s * n), ['Below, loss and withdrawal are negative.', 'Above, gain and deposit are positive.'], [`${t} → ${n_(s * n)}`], [[`${-s * n}`, 'Check the sign: is it a gain or a loss, above or below?']]);
        }),
        tp('opp', (r) => {
          const n = r.int(2, 50);
          const [a, b, w1, w2] = r.pick([[`walking ${n} km east`, `walking ${n} km west`, `walking ${n} km north`, `walking ${2 * n} km east`], [`a rise of ${n} °C`, `a fall of ${n} °C`, `a rise of ${n + 5} °C`, `a fall of ${n + 5} °C`], [`earning ₹${n}`, `spending ₹${n}`, `earning ₹${n + 10}`, `spending ₹${2 * n}`], [`going ${n} floors up`, `going ${n} floors down`, `going ${n + 1} floors up`, `going ${n + 2} floors down`], [`${n} m above the ground`, `${n} m below the ground`, `${n + 3} m above the ground`, `${2 * n} m below the ground`]] as [string, string, string, string][]);
          return mcq(r, `What is the opposite of ${a}?`, b, [w1, w2, 'staying at 0'],
            ['The opposite keeps the same amount but reverses the direction.'], [`Opposite of ${a}: ${b}`]);
        }),
        tp('read', (r) => {
          const v = r.pick([-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
          return typed('Which integer is marked on the number line?', num(v), ['Count steps from 0.', 'Left of 0 means negative.'], [`It is ${Math.abs(v)} steps ${v < 0 ? 'left' : 'right'} of 0, so ${n_(v)}.`], [[`${-v}`, 'Check which side of 0 the mark is on.']], { visual: { kind: 'number-line', from: -10, to: 10, step: 1, marks: [v] } });
        }),
        tp('opp-num', (r) => {
          const v = r.pick([-1, 1]) * r.int(2, 99);
          return typed(`What is the opposite of ${n_(v)}?`, num(-v), ['The opposite is the same distance from 0 on the other side.'], [`Opposite of ${n_(v)} is ${n_(-v)}.`], [[`${v}`, 'Change the sign.']]);
        }),
        bank('facts', [
          { q: '0 is…', a: 'neither positive nor negative', w: ['positive', 'negative', 'not an integer'], h: ['Where is 0 on the number line?'], s: ['0 is the starting point; it has no sign.'] },
          { q: 'Which of these is an integer?', a: '−12', w: ['1/2', '2.5', '−0.3'], h: ['Integers have no fractional part.'], s: ['−12 is a negative integer.'] },
          { q: 'On a number line, negative integers are…', a: 'to the left of 0', w: ['to the right of 0', 'above 0', 'at 0'], h: ['Look at the picture of the number line.'], s: ['Negatives are on the left.'] },
          { q: 'A temperature of 7 degrees below zero is written…', a: '−7 °C', w: ['7 °C', '+7 °C', '0.7 °C'], h: ['Below zero → negative.'], s: ['−7 °C.'] },
          { q: 'How many integers are there?', a: 'Infinitely many', w: ['21', '100', '0'], h: ['Can you keep going both ways?'], s: ['They go on forever in both directions.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.int.order', title: 'Comparing and ordering integers', prereqs: ['ts6.m.int.need'],
      intro: [
        h('Further left is smaller'),
        p('Which is colder: −3 °C or −8 °C? −8 °C is colder. On the number line, −8 is to the left of −3, so −8 < −3.'),
        vis({ kind: 'number-line', from: -10, to: 4, step: 1, marks: [-8, -3] }, '−8 is to the left of −3, so −8 is smaller.'),
        keys('Every positive integer is greater than every negative integer.', '0 is greater than every negative integer and less than every positive one.', 'For negatives: the bigger the number after the minus sign, the SMALLER the integer (−10 < −2).'),
        remember('The integer on the right is always the greater one.'),
        tip('Think of money: owing ₹10 (−10) is worse than owing ₹2 (−2).'),
      ],
      examples: [
        ex('Arrange −4, 2, −7, 0 in ascending order.', ['Most to the left: −7, then −4, then 0, then 2.'], '−7 < −4 < 0 < 2'),
        ex('How many integers lie between −3 and 4?', ['They are −2, −1, 0, 1, 2, 3.', 'Or 4 − (−3) − 1 = 6.'], '6'),
      ],
      practice: [
        tp('sign', (r) => {
          const a = r.int(-20, 20); let b = r.int(-20, 20); if (b === a) b = a - 3;
          const s = a > b ? '>' : '<';
          return mcq(r, `Which sign goes in the box? ${n_(a)} □ ${n_(b)}`, s, [s === '>' ? '<' : '>', '='], ['The one further right on the number line is greater.'], [`${n_(a)} ${s} ${n_(b)}`],
            [['wrong', 'For negative numbers, the one with the bigger number after the minus sign is SMALLER.']]);
        }),
        tp('order', (r) => {
          const vals = some(r, [-15, -12, -9, -7, -5, -3, -1, 0, 2, 4, 6, 8, 11], 5).sort((a, b) => a - b);
          return { type: 'order', prompt: 'Arrange in ascending order (smallest first).', ...ordering(r, vals.map(n_)), hints: ['Negative numbers come first; the most negative is smallest.'], solution: [vals.map(n_).join(' < ')] };
        }),
        tp('between', (r) => {
          const a = -r.int(2, 12), b = r.int(1, 12);
          return typed(`How many integers are there between ${n_(a)} and ${b}?`, num(b - a - 1), ['Count the negatives, 0, and the positives in between.', `Or use ${b} − (${n_(a)}) − 1.`], [`${b} − ${pn(a)} − 1 = ${b - a - 1}`], [[`${b - a + 1}`, 'Do not count the two end numbers.'], [`${b + a - 1}`, 'Subtracting a negative means adding its size.']]);
        }),
        tp('least', (r) => {
          const vals = some(r, [-14, -11, -8, -6, -4, -2, 0, 3, 5, 9], 4), mn = Math.min(...vals);
          return mcq(r, `Which is the smallest: ${vals.map(n_).join(', ')}?`, n_(mn), vals.filter((x) => x !== mn).map(n_), ['The smallest is furthest to the left.'], [`${n_(mn)} is furthest left.`]);
        }),
        tp('steps', (r) => {
          const n = r.int(-5, 5), k = r.int(2, 9), left = r.next() < 0.5;
          const ans = left ? n - k : n + k;
          return typed(`Which integer is ${k} steps to the ${left ? 'left' : 'right'} of ${n_(n)} on the number line?`, num(ans), ['Left means smaller, right means greater.'], [`${n_(n)} ${left ? '−' : '+'} ${k} = ${n_(ans)}`], [], { visual: { kind: 'number-line', from: -15, to: 15, step: 1, marks: [n] } });
        }),
      ],
    },
    {
      id: 'ts6.m.int.addsub', title: 'Adding and subtracting integers', prereqs: ['ts6.m.int.order'],
      intro: [
        h('Moving on the number line'),
        p('Adding a positive number means moving right. Adding a negative number means moving left. A lift at floor 2 that goes down 5 floors ends at −3 (the third basement).'),
        vis({ kind: 'number-line', from: -5, to: 5, step: 1, jumps: [[2, -3]] }, '2 + (−5) = −3: start at 2 and move 5 steps left.'),
        stepsB('Same signs: add the sizes and keep the sign. (−3) + (−4) = −7.', 'Different signs: subtract the smaller size from the bigger, and keep the sign of the bigger. (−8) + 5 = −3.', 'To subtract an integer, add its opposite: 4 − (−3) = 4 + 3 = 7.'),
        def('Additive inverse', 'The opposite of a number. A number plus its additive inverse is 0: 6 + (−6) = 0.'),
        keys('a + (−b) = a − b.', 'a − (−b) = a + b.', 'Think of + tokens and − tokens: a pair (+, −) makes 0.'),
        remember('Subtracting a negative number makes the answer BIGGER.'),
        tip('Use money: you have ₹5 and owe ₹8 → you are ₹3 short: 5 + (−8) = −3.'),
      ],
      examples: [
        ex('Find (−7) + 4.', ['Different signs: 7 − 4 = 3.', 'The bigger size (7) is negative.'], '−3'),
        ex('Find 3 − (−6).', ['Subtracting −6 is adding 6.', '3 + 6 = 9.'], '9'),
      ],
      practice: [
        tp('add', (r) => {
          const a = r.int(-15, 15), b = r.pick([-1, 1]) * r.int(1, 15);
          return typed(`Find ${pn(a)} + ${pn(b)}.`, num(a + b), ['Same signs: add sizes. Different signs: subtract sizes.', 'Keep the sign of the bigger size.'], [`${pn(a)} + ${pn(b)} = ${n_(a + b)}`], [[`${-(a + b)}`, 'Check the sign: which number has the bigger size?']]);
        }),
        tp('sub', (r) => {
          const a = r.int(-12, 12), b = r.pick([-1, 1]) * r.int(1, 12);
          return typed(`Find ${pn(a)} − ${pn(b)}.`, num(a - b), ['Subtracting = adding the opposite.', `${pn(a)} + ${pn(-b)}`], [`${pn(a)} − ${pn(b)} = ${pn(a)} + ${pn(-b)} = ${n_(a - b)}`], b < 0 ? [[`${a + b}`, 'Subtracting a negative means ADDING its size.']] : []);
        }),
        tp('temp', (r) => {
          const t = r.int(-4, 12), d = r.int(5, 15), city = r.pick(['Shimla', 'Leh', 'Srinagar', 'Manali']);
          return typed(`The temperature in ${city} was ${n_(t)} °C in the evening. By midnight it fell by ${d} °C. What was it at midnight?`, num(t - d, '°C'), ['A fall means subtract.'], [`${n_(t)} − ${d} = ${n_(t - d)} °C`], [[`${t + d}`, 'The temperature FELL, so subtract.']]);
        }),
        tp('lift', (r) => {
          const f0 = r.int(0, 6), k = r.int(f0 + 1, f0 + 4);
          return typed(`A lift is on floor ${f0}. It goes down ${k} floor${k > 1 ? 's' : ''}. Basements are numbered −1, −2, … Which floor is it on now?`, num(f0 - k), ['Going down means subtract.', 'Below the ground floor (0) the numbers are negative.'], [`${f0} − ${k} = ${n_(f0 - k)}`]);
        }),
        tp('inverse', (r) => {
          const a = r.pick([-1, 1]) * r.int(2, 60);
          return typed(`Fill in the box: ${pn(a)} + □ = 0`, num(-a), ['You need the additive inverse.', 'It has the same size and the opposite sign.'], [`${pn(a)} + ${pn(-a)} = 0`]);
        }),
        tp('line', (r) => {
          const a = r.int(-4, 4), b = -r.int(2, 6);
          return typed(`Use the number line: start at ${n_(a)} and add ${pn(b)}. Where do you land?`, num(a + b), ['Adding a negative number means moving LEFT.'], [`${n_(a)} + ${pn(b)} = ${n_(a + b)}`], [], { visual: { kind: 'number-line', from: -10, to: 6, step: 1, marks: [a] } });
        }),
      ],
    },
  ],
};

// ================================================================== CH 7 FRACTIONS AND DECIMALS
const ch7: USpec = {
  id: 'ts6.m.ch7', subject: 'math', title: 'Fractions and Decimals', source: src(7),
  objectives: [
    {
      id: 'ts6.m.frac.equiv', title: 'Fractions, the number line, equivalent fractions and lowest terms',
      intro: [
        h('Parts of a whole'),
        p('Amma cuts a roti into 4 equal parts and you eat 3. You ate 3/4 of the roti. The bottom number (denominator) tells how many equal parts the whole has; the top number (numerator) tells how many parts we take.'),
        vis({ kind: 'fraction-bar', parts: 4, shaded: 3, label: '3/4' }, 'A bar cut into 4 equal parts with 3 shaded.'),
        def('Proper, improper and mixed fractions', 'Proper: top smaller than bottom (3/4). Improper: top bigger or equal (7/4). Mixed: a whole number and a fraction (1 3/4 = 7/4).'),
        p('On a number line, divide the gap from 0 to 1 into equal parts. 3/4 is the third mark when the gap is split into 4 parts.'),
        vis({ kind: 'number-line', from: 0, to: 2, step: 1, marks: [0.75, 1.5] }, '3/4 lies between 0 and 1; 3/2 = 1 1/2 lies between 1 and 2.'),
        def('Equivalent fractions', 'Fractions that show the same amount: 1/2 = 2/4 = 3/6. Multiply (or divide) the top and bottom by the same number.'),
        def('Lowest terms (standard form)', 'Top and bottom have no common factor except 1. Divide both by their HCF: 12/18 → 2/3.'),
        keys('Equal parts are a must for fractions.', 'a/b = (a × k)/(b × k).', 'Simplest form: divide by the HCF.'),
        remember('To turn 17/5 into a mixed fraction: 17 ÷ 5 = 3 remainder 2, so 3 2/5.'),
        tip('Check equivalence by cross-multiplying: 2/3 and 8/12 → 2 × 12 = 24 and 3 × 8 = 24 ✓.'),
      ],
      examples: [
        ex('Write 18/24 in lowest terms.', ['HCF(18, 24) = 6.', '18 ÷ 6 = 3, 24 ÷ 6 = 4.'], '3/4'),
        ex('Fill in: 3/5 = ?/20.', ['5 × 4 = 20, so multiply the top by 4 too.', '3 × 4 = 12.'], '12'),
      ],
      practice: [
        tp('bar', (r) => {
          const parts = r.int(3, 10), sh = r.int(1, parts - 1);
          return typed('What fraction of the bar is shaded?', frac(sh, parts), ['Count all the equal parts — that is the denominator.', 'Count the shaded parts — that is the numerator.'],
            [`${sh} shaded out of ${parts} → ${sh}/${parts}`], [[`${parts - sh}/${parts}`, 'You counted the unshaded parts.'], [`${parts}/${sh}`, 'Shaded parts go on top.']], { visual: { kind: 'fraction-bar', parts, shaded: sh } });
        }),
        tp('missing', (r) => {
          const b = r.int(2, 9), a = r.int(1, b - 1), k = r.int(2, 8);
          return typed(`Fill in the box: ${a}/${b} = □/${b * k}`, num(a * k), [`${b} × ${k} = ${b * k}.`, `Multiply the numerator by ${k} as well.`], [`${a} × ${k} = ${a * k}`], [[`${a + b * k - b}`, 'Multiply — do not add.']]);
        }),
        tp('lowest', (r) => {
          const b = r.int(2, 9), a = r.int(1, b - 1), k = r.int(2, 9);
          const [x, y] = [a / gcd(a, b), b / gcd(a, b)];
          return typed(`Write ${a * k}/${b * k} in lowest terms.`, frac(x, y, true), ['Find the HCF of the numerator and denominator.', 'Divide both by it.'],
            [`HCF(${a * k}, ${b * k}) = ${gcd(a * k, b * k)}`, `${a * k}/${b * k} = ${x}/${y}`], [['not-lowest', 'Equal value, but you can still divide both by a common factor.']]);
        }),
        tp('equiv', (r) => {
          const b = r.int(3, 9), a = r.int(1, b - 1), k = r.int(2, 5);
          return mcq(r, `Which fraction is equivalent to ${a}/${b}?`, `${a * k}/${b * k}`, [`${a + k}/${b + k}`, `${a * k}/${b}`, `${a}/${b * k}`],
            ['Multiply top AND bottom by the same number.'], [`${a}/${b} = ${a} × ${k} / ${b} × ${k} = ${a * k}/${b * k}`], [['wrong', 'Adding the same number to top and bottom does NOT give an equal fraction.']]);
        }),
        tp('mixed', (r) => {
          const d = r.int(2, 9), w = r.int(1, 5), n = r.int(1, d - 1), top = w * d + n;
          return mcq(r, `Write ${top}/${d} as a mixed fraction.`, `${w} ${n}/${d}`, [`${n} ${w}/${d}`, `${w + 1} ${n}/${d}`, `${w} ${d - n}/${d}`].filter((x) => x !== `${w} ${n}/${d}`),
            [`Divide ${top} by ${d}.`, 'The quotient is the whole number; the remainder is the new numerator.'], [`${top} ÷ ${d} = ${w} remainder ${n}`, `= ${w} ${n}/${d}`]);
        }),
      ],
    },
    {
      id: 'ts6.m.frac.addsub', title: 'Like and unlike fractions: comparing, adding and subtracting', prereqs: ['ts6.m.frac.equiv'],
      intro: [
        h('Same-sized pieces'),
        p('Like fractions have the same denominator (2/7, 5/7): the pieces are the same size, so just compare or add the numerators. Unlike fractions (1/2, 1/3) have different denominators: first change them into like fractions using the LCM.'),
        vis({ kind: 'fraction-bar', parts: 6, shaded: 5, label: '1/2 + 1/3 = 3/6 + 2/6 = 5/6' }, 'Half plus a third is five sixths.'),
        stepsB('Find the LCM of the denominators.', 'Rewrite each fraction with that denominator.', 'Add or subtract the numerators; keep the denominator.', 'Write the answer in lowest terms.'),
        f('a/d + b/d = (a + b)/d', 'a over d plus b over d equals a plus b over d'),
        keys('Like fractions: bigger numerator → bigger fraction.', 'Same numerator: bigger denominator → smaller fraction (1/8 < 1/5).', 'Never add denominators.'),
        remember('1/2 + 1/3 is NOT 2/5. It is 5/6.'),
        tip('To compare unlike fractions quickly, cross-multiply: for 3/5 and 4/7, compare 3 × 7 = 21 with 4 × 5 = 20, so 3/5 > 4/7.'),
      ],
      examples: [
        ex('Find 2/3 + 1/4.', ['LCM(3, 4) = 12.', '2/3 = 8/12, 1/4 = 3/12.', '8/12 + 3/12 = 11/12.'], '11/12'),
        ex('Which is greater: 5/8 or 3/5?', ['Cross-multiply: 5 × 5 = 25, 3 × 8 = 24.', '25 > 24.'], '5/8'),
      ],
      practice: [
        tp('cmp-like', (r) => {
          const d = r.int(5, 15), a = r.int(1, d - 1); let b = r.int(1, d - 1); if (b === a) b = a === 1 ? 2 : a - 1;
          const s = a > b ? '>' : '<';
          return mcq(r, `Which sign goes in the box? ${a}/${d} □ ${b}/${d}`, s, [s === '>' ? '<' : '>', '='], ['Same denominator: compare the numerators.'], [`${a} ${s} ${b}, so ${a}/${d} ${s} ${b}/${d}`]);
        }),
        tp('cmp-unlike', (r) => {
          const pairs: [number, number, number, number][] = [[3, 5, 4, 7], [2, 3, 3, 5], [5, 8, 3, 5], [1, 4, 2, 9], [3, 4, 5, 7], [2, 7, 1, 3], [4, 9, 1, 2], [5, 6, 7, 9]];
          const [a, b, c, d] = r.pick(pairs), s = a * d > c * b ? '>' : '<';
          return mcq(r, `Which sign goes in the box? ${a}/${b} □ ${c}/${d}`, s, [s === '>' ? '<' : '>', '='], ['Cross-multiply or use a common denominator.'], [`${a} × ${d} = ${a * d}; ${c} × ${b} = ${c * b}`, `So ${a}/${b} ${s} ${c}/${d}`]);
        }),
        tp('add-like', (r) => {
          const d = r.int(5, 15), a = r.int(1, d - 2), b = r.int(1, d - a);
          return typed(`Find ${a}/${d} + ${b}/${d}.`, frac(a + b, d), ['Like fractions: add the numerators only.'], [`(${a} + ${b})/${d} = ${fr(a + b, d)}`], [[`${a + b}/${2 * d}`, 'Do not add the denominators — the piece size stays the same.']]);
        }),
        tp('sub-like', (r) => {
          const d = r.int(5, 15), a = r.int(3, d - 1), b = r.int(1, a - 1);
          return typed(`Find ${a}/${d} − ${b}/${d}.`, frac(a - b, d), ['Like fractions: subtract the numerators only.'], [`(${a} − ${b})/${d} = ${fr(a - b, d)}`]);
        }),
        tp('add-unlike', (r) => {
          const [b, d] = r.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8], [3, 6], [2, 7]] as [number, number][]);
          const a = r.int(1, b - 1), c = r.int(1, d - 1), m = lcm(b, d);
          return typed(`Find ${a}/${b} + ${c}/${d}.`, frac(a * (m / b) + c * (m / d), m), [`LCM of ${b} and ${d} is ${m}.`, `${a}/${b} = ${a * (m / b)}/${m}, ${c}/${d} = ${c * (m / d)}/${m}`],
            [`${a * (m / b)}/${m} + ${c * (m / d)}/${m} = ${a * (m / b) + c * (m / d)}/${m} = ${fr(a * (m / b) + c * (m / d), m)}`], [[`${a + c}/${b + d}`, 'You added the denominators. Make them equal first.']]);
        }, 2),
        tp('sub-unlike', (r) => {
          const [b, d] = r.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8], [2, 9]] as [number, number][]);
          const m = lcm(b, d); let a = r.int(1, b - 1); const c = r.int(1, d - 1);
          if (a * (m / b) <= c * (m / d)) a = b - 1;
          const top = a * (m / b) - c * (m / d);
          if (top <= 0) return typed(`Find ${c}/${d} − ${a}/${b}.`, frac(-top, m), [`LCM of ${b} and ${d} is ${m}.`], [`${c * (m / d)}/${m} − ${a * (m / b)}/${m} = ${fr(-top, m)}`]);
          return typed(`Find ${a}/${b} − ${c}/${d}.`, frac(top, m), [`LCM of ${b} and ${d} is ${m}.`, 'Rewrite both, then subtract the numerators.'], [`${a * (m / b)}/${m} − ${c * (m / d)}/${m} = ${fr(top, m)}`]);
        }, 2),
        tp('story', (r) => {
          const who = nm(r), [b, d] = r.pick([[2, 4], [3, 6], [4, 8], [2, 3], [3, 4]] as [number, number][]);
          const m = lcm(b, d), top = (m / b) + (m / d);
          return typed(`${who} painted 1/${b} of a wall in the morning and 1/${d} of it in the evening. What fraction of the wall is painted?`, frac(top, m), ['Add the two parts.', `Use the denominator ${m}.`], [`1/${b} + 1/${d} = ${m / b}/${m} + ${m / d}/${m} = ${fr(top, m)}`], [[`2/${b + d}`, 'Make the denominators equal before adding.']]);
        }),
      ],
    },
    {
      id: 'ts6.m.frac.dec', title: 'Decimals: place value, comparing, adding and subtracting', prereqs: ['ts6.m.frac.equiv'],
      intro: [
        h('Fractions with 10, 100, 1000 at the bottom'),
        p('₹12.50 means 12 rupees and 50 paise. 50 paise is 50/100 of a rupee. Decimals are a short way to write tenths and hundredths.'),
        vis({ kind: 'fraction-bar', parts: 10, shaded: 7, label: '0.7 = 7/10' }, 'Seven tenths shaded: 0.7.'),
        def('Decimal places', 'In 23.47, 2 is tens, 3 is ones, 4 is tenths (4/10) and 7 is hundredths (7/100).'),
        stepsB('Line up the decimal points one under another.', 'Fill empty places with 0s: 4.5 → 4.50.', 'Add or subtract as with whole numbers.', 'Put the decimal point straight down in the answer.'),
        keys('3/10 = 0.3; 3/100 = 0.03; 25/100 = 0.25.', '1 paise = ₹0.01; 1 cm = 0.01 m; 1 g = 0.001 kg.', 'To compare, look at the whole part first, then tenths, then hundredths.'),
        remember('0.5 is MORE than 0.45: write 0.5 as 0.50 and compare 50 with 45.'),
        tip('Adding zeros at the end of a decimal does not change it: 2.3 = 2.30 = 2.300.'),
      ],
      examples: [
        ex('Find 12.5 + 3.75.', ['12.50 + 3.75 with points lined up.', '= 16.25'], '16.25'),
        ex('Write 345 cm in metres.', ['100 cm = 1 m.', '345 ÷ 100 = 3.45.'], '3.45 m'),
      ],
      practice: [
        tp('tenths', (r) => {
          const d = r.pick([10, 100]), n = d === 10 ? r.int(1, 99) : r.int(1, 999);
          return typed(`Write ${n}/${d} as a decimal.`, num(rd(n / d, 2)), [`${d === 10 ? 'One' : 'Two'} decimal place${d === 10 ? '' : 's'} for ÷ ${d}.`], [`${n}/${d} = ${rd(n / d, 2)}`]);
        }),
        tp('place', (r) => {
          const n = rd(r.int(1001, 9999) / 100, 2), [k, name] = r.pick([[1, 'tenths'], [2, 'hundredths']] as [number, string][]);
          const s = n.toFixed(2), dg = Number(s.split('.')[1][k - 1]);
          return typed(`Which digit is in the ${name} place of ${s}?`, num(dg), ['Tenths is the first digit after the point; hundredths is the second.'], [`${s}: ${name} digit = ${dg}`]);
        }),
        tp('greatest', (r) => {
          const a = r.int(2, 9);
          const vals = [`0.${a}`, `0.${a - 1}${r.int(5, 9)}`, `0.0${a}`, `0.${a - 1}0${r.int(1, 9)}`];
          return mcq(r, `Which is the greatest: ${r.shuffle([...vals]).join(', ')}?`, vals[0], vals.slice(1), ['Compare the tenths digit first.', 'Write them with the same number of decimal places.'], [`${vals[0]} has the biggest tenths digit (${a}).`],
            [['wrong', 'More digits does not mean bigger. Compare tenths first.']]);
        }),
        tp('add', (r) => {
          const a = rd(r.int(105, 999) / 10, 1), b = rd(r.int(105, 999) / 100, 2);
          return typed(`Find ${a} + ${b}.`, num(rd(a + b, 2)), ['Line up the decimal points.', `Write ${a} as ${a.toFixed(2)}.`], [`${a.toFixed(2)} + ${b.toFixed(2)} = ${rd(a + b, 2)}`]);
        }),
        tp('sub', (r) => {
          const a = rd(r.int(500, 999) / 10, 1), b = rd(r.int(101, 499) / 100, 2);
          return typed(`Find ${a} − ${b}.`, num(rd(a - b, 2)), ['Line up the decimal points.', `Write ${a} as ${a.toFixed(2)}.`], [`${a.toFixed(2)} − ${b.toFixed(2)} = ${rd(a - b, 2)}`]);
        }),
        tp('money', (r) => {
          const rs = r.int(5, 200), ps = r.int(1, 99), who = nm(r);
          const rs2 = r.int(5, 100), ps2 = r.int(1, 99);
          const tot = rd(rs + ps / 100 + rs2 + ps2 / 100, 2);
          return typed(`${who} buys a book for ₹${rs}.${String(ps).padStart(2, '0')} and a pen for ₹${rs2}.${String(ps2).padStart(2, '0')}. How much is spent in all (in ₹)?`, num(tot, '₹'),
            ['Line up the decimal points and add.', '100 paise = ₹1.'], [`₹${(rs + ps / 100).toFixed(2)} + ₹${(rs2 + ps2 / 100).toFixed(2)} = ₹${tot.toFixed(2)}`]);
        }),
        tp('length', (r) => {
          const c = r.int(105, 999);
          return typed(`Write ${c} cm in metres.`, num(rd(c / 100, 2), 'm'), ['100 cm = 1 m.', 'Divide by 100.'], [`${c} ÷ 100 = ${rd(c / 100, 2)} m`], [[`${c / 10}`, 'Divide by 100, not 10.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 8 DATA HANDLING
const FRUITS = ['Mango', 'Banana', 'Guava', 'Apple', 'Grapes'];
const tally = (n: number) => `${'||||/ '.repeat(Math.floor(n / 5))}${'|'.repeat(n % 5)}`.trim();
const ch8: USpec = {
  id: 'ts6.m.ch8', subject: 'math', title: 'Data Handling', source: src(8),
  objectives: [
    {
      id: 'ts6.m.data.collect', title: 'Collecting, recording and organising data',
      intro: [
        h('Facts we can count'),
        p('Your class teacher asks everyone their favourite fruit. The answers — Mango, Banana, Mango, Guava, … — are data. A long list is hard to read, so we organise it in a table.'),
        def('Data', 'A collection of numbers or facts gathered for a purpose.'),
        def('Tally marks', 'One stroke | for each item. Every fifth stroke crosses the first four, written here as ||||/ , so we can count in fives.'),
        def('Frequency', 'How many times an item appears.'),
        vis({ kind: 'emoji', text: 'Mango ||||/ ||| = 8' }, 'Tally marks for 8: one bundle of five and 3 more.'),
        stepsB('Decide what you want to find out.', 'Collect the data (ask, count or measure).', 'Make tally marks as you read the list.', 'Count the tallies to get the frequency of each item.'),
        keys('Bundles of five make counting fast.', 'The total of all frequencies = number of people asked.'),
        remember('||||/ means 5, not 4.'),
        tip('Strike each item in the list as you tally it so you do not count it twice.'),
      ],
      examples: [
        ex('How many do these tally marks show: ||||/ ||||/ ||?', ['Two bundles of 5 = 10.', '2 more strokes.'], '12'),
        ex('Marks of 10 students: 7, 8, 7, 9, 6, 7, 8, 10, 7, 9. How many scored 7?', ['Count the 7s: 1st, 3rd, 6th, 9th.'], '4'),
      ],
      practice: [
        tp('tally', (r) => {
          const n = r.int(6, 28);
          return typed(`What number do these tally marks show?  ${tally(n)}`, num(n), ['Each ||||/ is a bundle of 5.', 'Count bundles × 5, then add the single strokes.'], [`${Math.floor(n / 5)} × 5 + ${n % 5} = ${n}`],
            [[`${Math.floor(n / 5) * 4 + n % 5}`, 'A crossed bundle is 5 (four strokes plus the cross stroke).']]);
        }),
        tp('freq', (r) => {
          const list = Array.from({ length: r.int(12, 18) }, () => r.pick(FRUITS.slice(0, 4)));
          const f0 = r.pick(FRUITS.slice(0, 4)), c = list.filter((x) => x === f0).length;
          return typed(`Favourite fruits of some students: ${list.join(', ')}. How many chose ${f0}?`, num(c), [`Make a tally mark each time you see ${f0}.`], [`${f0} appears ${c} times.`]);
        }),
        tp('total', (r) => {
          const fs = FRUITS.slice(0, 4).map(() => r.int(2, 15)), tot = fs.reduce((s, x) => s + x, 0);
          return typed(`A frequency table: ${FRUITS.slice(0, 4).map((x, i) => `${x} ${fs[i]}`).join(', ')}. How many students were asked in all?`, num(tot), ['Add all the frequencies.'], [`${fs.join(' + ')} = ${tot}`]);
        }),
        tp('most', (r) => {
          const fs = some(r, [3, 5, 7, 8, 10, 12, 14], 4), mx = Math.max(...fs), fr0 = FRUITS.slice(0, 4);
          return mcq(r, `Votes: ${fr0.map((x, i) => `${x} ${tally(fs[i])}`).join('; ')}. Which fruit is the most popular?`, fr0[fs.indexOf(mx)], fr0.filter((_, i) => fs[i] !== mx),
            ['Count each set of tally marks.', 'Choose the biggest.'], [fr0.map((x, i) => `${x}: ${fs[i]}`).join(', ')]);
        }),
        tp('bundles', (r) => {
          const n = r.int(11, 49);
          return typed(`You record ${n} with tally marks. How many complete bundles of five will you draw?`, num(Math.floor(n / 5)), ['Divide by 5 and ignore the remainder.'], [`${n} = ${Math.floor(n / 5)} × 5 + ${n % 5}`, `${Math.floor(n / 5)} bundles`]);
        }),
      ],
    },
    {
      id: 'ts6.m.data.picto', title: 'Pictographs', prereqs: ['ts6.m.data.collect'],
      intro: [
        h('Pictures that count'),
        p('A pictograph uses a picture to stand for a number of things. A key tells you what one picture is worth. If 🍎 = 10 apples, then 🍎🍎🍎 = 30 apples.'),
        vis({ kind: 'objects', emoji: '🍎', count: 4 }, 'Four apple pictures; with the key 🍎 = 10 they mean 40 apples.'),
        def('Key (scale)', 'Tells how many items one picture shows. Always read it first.'),
        stepsB('Read the key.', 'Count the pictures in the row.', 'Multiply the number of pictures by the key value.', 'Half a picture means half the key value.'),
        keys('Value = number of pictures × key.', 'Pictures needed = value ÷ key.'),
        remember('Without a key, a pictograph cannot be read.'),
        tip('Choose a key that makes the number of pictures small and whole.'),
      ],
      examples: [
        ex('Key: 📚 = 5 books. Monday shows 6 📚. How many books?', ['6 × 5 = 30.'], '30 books'),
        ex('Key: 🎈 = 4 balloons. How many 🎈 pictures show 28 balloons?', ['28 ÷ 4 = 7.'], '7 pictures'),
      ],
      practice: [
        tp('value', (r) => {
          const k = r.pick([2, 5, 10, 20, 50]), n = r.int(2, 9), day = r.pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
          return typed(`In a pictograph each 🍎 stands for ${k} apples sold. On ${day} the row shows ${n} 🍎. How many apples were sold?`, num(n * k), ['Multiply the number of pictures by the key.'], [`${n} × ${k} = ${n * k}`], [[`${n}`, `Each picture means ${k} apples, not 1.`]], { visual: { kind: 'objects', emoji: '🍎', count: n } });
        }),
        tp('half', (r) => {
          const k = r.pick([2, 4, 10, 20, 100]), n = r.int(2, 7);
          return typed(`Key: each 📚 = ${k} books. A row shows ${n} whole 📚 and one half 📚. How many books is that?`, num(n * k + k / 2), ['A half picture is half the key value.'], [`${n} × ${k} + ${k / 2} = ${n * k + k / 2}`]);
        }),
        tp('symbols', (r) => {
          const k = r.pick([5, 10, 20, 25]), v = k * r.int(3, 10);
          return typed(`Key: each 🚲 = ${k} bicycles. How many 🚲 pictures are needed to show ${v} bicycles?`, num(v / k), ['Divide the value by the key.'], [`${v} ÷ ${k} = ${v / k}`]);
        }),
        tp('diff', (r) => {
          const k = r.pick([5, 10, 20]), a = r.int(5, 9), b = r.int(1, a - 1);
          return typed(`Key: each 🐟 = ${k} fish. Pond A shows ${a} 🐟 and pond B shows ${b} 🐟. How many more fish are in pond A?`, num((a - b) * k), ['Find the difference in pictures, then multiply by the key.'], [`(${a} − ${b}) × ${k} = ${(a - b) * k}`], [[`${a - b}`, `Multiply the difference by the key (${k}).`]]);
        }),
        bank('key', [
          { q: 'What does the key of a pictograph tell us?', a: 'How many items one picture stands for', w: ['The title of the graph', 'The colour of the pictures', 'The biggest value'], h: ['Look below the pictograph.'], s: ['The key gives the value of one picture.'] },
          { q: 'Key: ⭐ = 10. What does 3 and a half ⭐ show?', a: '35', w: ['30', '3.5', '40'], h: ['Half a star is 5.'], s: ['3 × 10 + 5 = 35.'] },
          { q: 'To show 60 with key ⚽ = 10, you need…', a: '6 pictures', w: ['60 pictures', '10 pictures', '5 pictures'], h: ['60 ÷ 10'], s: ['60 ÷ 10 = 6.'] },
          { q: 'Why is a key like 🎈 = 100 useful for large numbers?', a: 'It keeps the number of pictures small', w: ['It makes numbers bigger', 'It changes the data', 'It is not useful'], h: ['Imagine drawing 800 balloons.'], s: ['8 pictures are easier than 800.'] },
          { q: 'Key: 🌼 = 4. A row has 5 🌼. The value is…', a: '20', w: ['9', '5', '4'], h: ['Multiply.'], s: ['5 × 4 = 20.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.data.bar', title: 'Bar graphs', prereqs: ['ts6.m.data.picto'],
      intro: [
        h('Bars instead of pictures'),
        p('Drawing many pictures is slow. A bar graph shows each value as a bar; the taller the bar, the bigger the value. Bars have equal width and equal gaps.'),
        vis({ kind: 'bar-graph', labels: ['Mon', 'Tue', 'Wed', 'Thu'], values: [20, 35, 15, 30], unit: 'students' }, 'Students who came by cycle each day.'),
        def('Scale', 'Tells what one unit of height stands for, such as 1 unit = 5 students.'),
        stepsB('Read the title and the labels on both axes.', 'Find the bar you need.', 'Read across to the number on the side axis.', 'Compare bars to answer "most", "least" or "how many more".'),
        keys('Taller bar = bigger value.', 'Value = height in units × scale.', 'Difference = bigger bar − smaller bar.'),
        remember('All bars in one graph must use the same scale.'),
        tip('Use a ruler to read across from the top of a bar to the axis.'),
      ],
      examples: [
        ex('In the graph above, how many more students came on Tuesday than on Wednesday?', ['Tuesday 35, Wednesday 15.', '35 − 15 = 20.'], '20'),
        ex('Scale: 1 unit = 10 trees. A bar is 7 units tall. How many trees?', ['7 × 10 = 70.'], '70 trees'),
      ],
      practice: [
        tp('read', (r) => {
          const labels = some(r, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 4), values = labels.map(() => r.int(2, 12) * 5), i = r.int(0, 3);
          return typed(`The bar graph shows books borrowed from the library. How many books were borrowed on ${labels[i]}?`, num(values[i]), ['Find the bar and read its height.'], [`${labels[i]}: ${values[i]} books`], [], { visual: { kind: 'bar-graph', labels, values, unit: 'books' } });
        }),
        tp('most', (r) => {
          const labels = some(r, ['Cricket', 'Kabaddi', 'Football', 'Kho-kho', 'Chess'], 4), values = some(r, [10, 15, 20, 25, 30, 35, 40], 4), mx = Math.max(...values);
          return mcq(r, 'The bar graph shows the favourite games of a class. Which game is the most popular?', labels[values.indexOf(mx)], labels.filter((_, i) => values[i] !== mx),
            ['Look for the tallest bar.'], [`${labels[values.indexOf(mx)]}: ${mx} votes`], [], { visual: { kind: 'bar-graph', labels, values, unit: 'votes' } });
        }),
        tp('diff', (r) => {
          const labels = some(r, ['Class 6A', 'Class 6B', 'Class 6C', 'Class 6D'], 4), values = some(r, [12, 18, 24, 30, 36, 42], 4);
          const [i, j] = values[0] > values[1] ? [0, 1] : [1, 0];
          return typed(`How many more saplings did ${labels[i]} plant than ${labels[j]}?`, num(values[i] - values[j]), ['Read both bars.', 'Subtract the smaller from the bigger.'], [`${values[i]} − ${values[j]} = ${values[i] - values[j]}`], [], { visual: { kind: 'bar-graph', labels, values, unit: 'saplings' } });
        }),
        tp('total', (r) => {
          const labels = ['Jan', 'Feb', 'Mar'], values = labels.map(() => r.int(2, 10) * 10);
          return typed('The bar graph shows kilograms of rice sold by a ration shop. What is the total for the three months?', num(values.reduce((s, x) => s + x, 0), 'kg'),
            ['Read each bar.', 'Add them.'], [`${values.join(' + ')} = ${values.reduce((s, x) => s + x, 0)} kg`], [], { visual: { kind: 'bar-graph', labels, values, unit: 'kg' } });
        }),
        tp('scale', (r) => {
          const k = r.pick([5, 10, 20, 50, 100]), u = r.int(2, 12);
          return typed(`On a bar graph, 1 unit of height = ${k} people. A bar is ${u} units tall. How many people does it show?`, num(u * k), ['Value = height × scale.'], [`${u} × ${k} = ${u * k}`], [[`${u}`, `Multiply by the scale (${k}).`]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 9 INTRODUCTION TO ALGEBRA
const LETTERS: [string, number][] = [['L', 2], ['T', 2], ['V', 2], ['C', 3], ['F', 3], ['Z', 3], ['H', 3], ['E', 4], ['M', 4]];
const ch9: USpec = {
  id: 'ts6.m.ch9', subject: 'math', title: 'Introduction to Algebra', source: src(9),
  objectives: [
    {
      id: 'ts6.m.alg.pattern', title: 'Patterns and rules with matchsticks',
      intro: [
        h('A rule for any number'),
        p('Sita makes the letter L with 2 matchsticks. For 2 L\'s she needs 4, for 3 L\'s 6, for 10 L\'s 20. Instead of a long table, we write one rule: for n L\'s she needs 2 × n matchsticks, written 2n.'),
        vis({ kind: 'emoji', text: 'L L L L → 2 + 2 + 2 + 2 = 2 × 4' }, 'Four L shapes need 2 × 4 = 8 matchsticks.'),
        def('Rule', 'A statement that tells how to find a quantity for ANY value of n. Example: matchsticks = 2n.'),
        stepsB('Make a table for n = 1, 2, 3, 4.', 'Look at how the numbers grow.', 'Write the rule using n.', 'Check the rule with a value from the table.'),
        keys('Separate letters: rule = (sticks per letter) × n.', 'A row of n joined squares needs 3n + 1 sticks.', 'A row of n joined triangles needs 2n + 1 sticks.'),
        remember('We write 2 × n as 2n and 1 × n as just n.'),
        tip('If the numbers go up by the same amount each time, that amount multiplies n in the rule.'),
      ],
      examples: [
        ex('Each letter C uses 3 matchsticks. How many for 12 C\'s?', ['Rule: 3n.', 'n = 12 → 3 × 12 = 36.'], '36'),
        ex('Find the rule for 4, 7, 10, 13 sticks for 1, 2, 3, 4 joined squares.', ['It goes up by 3 each time → 3n.', '3 × 1 = 3, but we need 4 → add 1.'], '3n + 1'),
      ],
      practice: [
        tp('letters', (r) => {
          const [ch, k] = r.pick(LETTERS), n = r.int(4, 20);
          return typed(`Each letter ${ch} is made with ${k} matchsticks. How many matchsticks are needed for ${n} letter ${ch}'s?`, num(k * n), [`Rule: ${k}n.`, `Put n = ${n}.`], [`${k} × ${n} = ${k * n}`]);
        }),
        tp('rule', (r) => {
          const [ch, k] = r.pick(LETTERS);
          return mcq(r, `Letter ${ch} needs ${k} matchsticks. What is the rule for the number of matchsticks needed for n letter ${ch}'s?`, `${k}n`, [`n + ${k}`, `${k + 1}n`, `${k}`].concat(k > 2 ? [`${k - 1}n`] : []),
            ['Make a table for n = 1, 2, 3.'], [`n = 1 → ${k}, n = 2 → ${2 * k}, n = 3 → ${3 * k}`, `Rule: ${k}n`]);
        }),
        tp('squares', (r) => {
          const n = r.int(4, 25);
          return typed(`A row of joined squares made with matchsticks needs 3n + 1 sticks for n squares. How many sticks for ${n} squares?`, num(3 * n + 1), [`Put n = ${n} in 3n + 1.`], [`3 × ${n} + 1 = ${3 * n + 1}`], [[`${4 * n}`, 'Joined squares share sides — use the rule 3n + 1.']]);
        }),
        tp('triangles', (r) => {
          const n = r.int(4, 25);
          return typed(`A row of joined triangles needs 2n + 1 matchsticks for n triangles. How many for ${n} triangles?`, num(2 * n + 1), [`Put n = ${n}.`], [`2 × ${n} + 1 = ${2 * n + 1}`], [[`${3 * n}`, 'Neighbouring triangles share a stick — use 2n + 1.']]);
        }),
        tp('table', (r) => {
          const k = r.int(2, 9), c = r.int(0, 5);
          const row = [1, 2, 3, 4].map((n) => k * n + c).join(', ');
          const rule = c ? `${k}n + ${c}` : `${k}n`;
          return mcq(r, `For n = 1, 2, 3, 4 the values are ${row}. Which rule fits?`, rule, [c ? `${k}n` : `${k}n + 1`, `n + ${k + c}`, `${k + 1}n`, `${k}n + ${c + 1}`],
            ['How much does the value go up each time? That multiplies n.', 'Check n = 1.'], [`Goes up by ${k} → ${k}n.`, `n = 1: ${k} × 1${c ? ` + ${c}` : ''} = ${k + c} ✓`]);
        }, 2),
      ],
    },
    {
      id: 'ts6.m.alg.var', title: 'Variables and expressions from arithmetic and geometry', prereqs: ['ts6.m.alg.pattern'],
      intro: [
        h('Letters that stand for numbers'),
        p('A letter like n or x that can take different values is called a variable. Using variables we can write rules we already know in a short way.'),
        def('Variable', 'A letter that stands for a number that can change.'),
        def('Expression', 'Numbers and variables joined by +, −, ×, ÷, such as x + 5, 3y, 2n − 1.'),
        f('Perimeter of a square = 4 × s = 4s', 'perimeter of a square equals four s'),
        X({
          title: 'What if? Perimeter of a square', formula: 'P = 4s',
          result: ['P', 'Perimeter', '4*s', 'cm'],
          vars: [['s', 'Side', 1, 30, 1, 5, 'cm']],
          notes: [['s', 'Each of the 4 sides gets longer, so the perimeter goes up 4 cm for every 1 cm.', 'Shorter sides make a smaller perimeter.']],
          mistakes: [['P = s + 4', 'There are 4 sides of length s: s + s + s + s = 4s, not s + 4.']],
          real: 'A square garden with 12 m sides needs 4 × 12 = 48 m of fence.',
        }),
        keys('"5 more than x" → x + 5.', '"3 less than y" → y − 3.', '"4 times n" → 4n.', '"p divided by 2" → p ÷ 2.', 'Commutative rule in letters: a + b = b + a.'),
        remember('3n means 3 × n. If n = 7, then 3n = 21, not 37!'),
        tip('To evaluate an expression, replace the letter by its value and then calculate.'),
      ],
      examples: [
        ex('Find 4x + 3 when x = 5.', ['Replace x by 5: 4 × 5 + 3.', '= 20 + 3.'], '23'),
        ex('Ravi is x years old. His father is 28 years older. Write the father\'s age.', ['"Older by 28" means add 28.'], 'x + 28'),
      ],
      practice: [
        tp('eval', (r) => {
          const a = r.int(2, 9), b = r.int(1, 15), x = r.int(2, 12), v = r.pick(['x', 'y', 'n', 'm', 'p']);
          return typed(`Find the value of ${a}${v} + ${b} when ${v} = ${x}.`, num(a * x + b), [`${a}${v} means ${a} × ${v}.`, `Replace ${v} by ${x}.`], [`${a} × ${x} + ${b} = ${a * x + b}`], [[`${Number(`${a}${x}`) + b}`, `${a}${v} means ${a} × ${v}, not the digits side by side.`]]);
        }),
        tp('words', (r) => {
          const k = r.int(2, 15), v = r.pick(['x', 'y', 'n', 'p']);
          const opts: [string, string, string[]][] = [
            [`${k} more than ${v}`, `${v} + ${k}`, [`${v} − ${k}`, `${k}${v}`, `${v} ÷ ${k}`]],
            [`${k} less than ${v}`, `${v} − ${k}`, [`${k} − ${v}`, `${v} + ${k}`, `${k}${v}`]],
            [`${k} times ${v}`, `${k}${v}`, [`${v} + ${k}`, `${v} − ${k}`, `${v} ÷ ${k}`]],
            [`${v} divided by ${k}`, `${v} ÷ ${k}`, [`${k} ÷ ${v}`, `${k}${v}`, `${v} − ${k}`]],
          ];
          const [w, ok, bad] = r.pick(opts);
          return mcq(r, `Which expression means "${w}"?`, ok, bad, ['"more" → +, "less" → −, "times" → ×, "divided by" → ÷.'], [`"${w}" → ${ok}`], [['wrong', '"k less than y" is y − k: start with y and take away k.']]);
        }),
        tp('perim', (r) => {
          const [shape, k] = r.pick([['square', 4], ['equilateral triangle', 3], ['regular pentagon', 5], ['regular hexagon', 6]] as [string, number][]);
          const s = r.int(3, 20);
          return typed(`The perimeter of a ${shape} with side l is ${k}l. Find the perimeter when l = ${s} cm.`, num(k * s, 'cm'), [`${k}l means ${k} × l.`], [`${k} × ${s} = ${k * s} cm`]);
        }),
        tp('age', (r) => {
          const who = nm(r), k = r.int(3, 30), older = r.next() < 0.5;
          return mcq(r, `${who} is x years old. ${older ? `${who}'s uncle is ${k} years older.` : `${who}'s cousin is ${k} years younger.`} Which expression gives the ${older ? 'uncle\'s' : 'cousin\'s'} age?`, older ? `x + ${k}` : `x − ${k}`, [older ? `x − ${k}` : `x + ${k}`, `${k}x`, `${k} − x`],
            ['Older → add; younger → subtract.'], [older ? `x + ${k}` : `x − ${k}`]);
        }),
        tp('cost', (r) => {
          const p0 = r.int(5, 40), n = r.int(3, 12);
          return typed(`One notebook costs ₹p. The cost of ${n} notebooks is ${n}p rupees. Find it when p = ${p0}.`, num(n * p0, '₹'), [`${n}p = ${n} × p`], [`${n} × ${p0} = ₹${n * p0}`]);
        }),
      ],
    },
    {
      id: 'ts6.m.alg.eq', title: 'Simple equations', prereqs: ['ts6.m.alg.var'],
      intro: [
        h('A balance that must stay level'),
        p('An equation says two things are EQUAL, like x + 4 = 10. It is like a balance: both sides weigh the same. The value of the variable that makes it true is the solution. Here x = 6 because 6 + 4 = 10.'),
        photo('⚖', 'An equation is like a balanced weighing scale.'),
        def('Equation', 'A statement with an = sign that has a variable, such as 3n = 21.'),
        def('Solution', 'The value of the variable that makes both sides equal.'),
        stepsB('Try values (trial and error), or undo the operation.', 'x + a = b → x = b − a.', 'x − a = b → x = b + a.', 'k × x = b → x = b ÷ k.', 'Always check by putting the value back.'),
        keys('An equation has an = sign; an expression does not.', 'Only one value usually makes a simple equation true.'),
        remember('Check: put your answer back into the equation — both sides must match.'),
        tip('Say the equation in words: "what number plus 4 gives 10?"'),
      ],
      examples: [
        ex('Solve 5m = 35.', ['What times 5 gives 35?', '35 ÷ 5 = 7.', 'Check: 5 × 7 = 35 ✓'], 'm = 7'),
        ex('Solve x − 8 = 12.', ['Undo "− 8" by adding 8.', 'x = 12 + 8 = 20.', 'Check: 20 − 8 = 12 ✓'], 'x = 20'),
      ],
      practice: [
        tp('add', (r) => {
          const a = r.int(2, 30), x = r.int(1, 40);
          return typed(`Solve: x + ${a} = ${x + a}`, num(x), [`What number plus ${a} gives ${x + a}?`, `Subtract ${a}.`], [`x = ${x + a} − ${a} = ${x}`, `Check: ${x} + ${a} = ${x + a} ✓`], [[`${2 * a + x}`, `Undo + ${a} by SUBTRACTING ${a}.`]]);
        }),
        tp('sub', (r) => {
          const a = r.int(2, 30), x = r.int(a + 1, 60);
          return typed(`Solve: y − ${a} = ${x - a}`, num(x), [`Undo − ${a} by adding ${a}.`], [`y = ${x - a} + ${a} = ${x}`], [[`${x - 2 * a}`, `Undo − ${a} by ADDING ${a}.`]]);
        }),
        tp('mul', (r) => {
          const k = r.int(2, 12), x = r.int(2, 15);
          return typed(`Solve: ${k}n = ${k * x}`, num(x), [`What times ${k} gives ${k * x}?`, `Divide by ${k}.`], [`n = ${k * x} ÷ ${k} = ${x}`], [[`${k * x - k}`, `${k}n means ${k} × n, so DIVIDE by ${k}.`]]);
        }),
        tp('check', (r) => {
          const k = r.int(2, 6), c = r.int(1, 12), x = r.int(1, 10);
          return mcq(r, `Which value of x makes ${k}x + ${c} = ${k * x + c} true?`, `x = ${x}`, [`x = ${x + 1}`, `x = ${x + 2}`, `x = ${x > 1 ? x - 1 : x + 3}`].filter((s) => s !== `x = ${x}`),
            ['Try each value in the left side.'], [`${k} × ${x} + ${c} = ${k * x + c} ✓`]);
        }),
        tp('form', (r) => {
          const k = r.int(2, 9), t = r.int(20, 80), who = nm(r);
          return mcq(r, `${who} thinks of a number x and adds ${k}. The answer is ${t}. Which equation shows this?`, `x + ${k} = ${t}`, [`x − ${k} = ${t}`, `${k}x = ${t}`, `x + ${t} = ${k}`],
            ['"Adds" → +; "the answer is" → ='], [`x + ${k} = ${t}`]);
        }),
        tp('think', (r) => {
          const k = r.int(2, 6), c = r.int(1, 10), x = r.int(2, 12);
          return typed(`I think of a number, multiply it by ${k} and add ${c}. I get ${k * x + c}. What is my number?`, num(x), [`Undo the steps backwards: subtract ${c}, then divide by ${k}.`],
            [`${k * x + c} − ${c} = ${k * x}`, `${k * x} ÷ ${k} = ${x}`], [], { steps: [st(`First subtract ${c}: what do you get?`, num(k * x)), st(`Now divide by ${k}.`, num(x))] });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 10 PERIMETER AND AREA
const ch10: USpec = {
  id: 'ts6.m.ch10', subject: 'math', title: 'Perimeter and Area', source: src(10),
  objectives: [
    {
      id: 'ts6.m.mensa.perim', title: 'Perimeter of rectangles, squares and polygons',
      intro: [
        h('Walking around a field'),
        p('Teja runs once around the school ground. The distance he runs is the perimeter of the ground: the total length of its boundary.'),
        def('Perimeter', 'The distance all the way around a closed figure. Add the lengths of all its sides.'),
        vis({ kind: 'shape', shape: 'rectangle', color: '#4caf50' }, 'A rectangle: two lengths and two breadths.'),
        f('Perimeter of a rectangle = 2 × (l + b)', 'perimeter of a rectangle equals two times length plus breadth'),
        X({
          title: 'What if? Perimeter of a rectangle', formula: 'P = 2 × (l + b)',
          result: ['P', 'Perimeter', '2*(l + b)', 'm'],
          vars: [['l', 'Length', 1, 50, 1, 12, 'm'], ['b', 'Breadth', 1, 50, 1, 8, 'm']],
          notes: [['l', 'Both lengths grow, so the perimeter grows by 2 m for every 1 m.', 'Shorter length → smaller perimeter.'], ['b', 'Both breadths grow, adding 2 m for every 1 m.', 'Narrower → smaller perimeter.']],
          mistakes: [['P = l + b', 'That is only half way round. A rectangle has TWO lengths and TWO breadths.'], ['P = l × b', 'l × b is the area, not the perimeter.']],
          real: 'A field 40 m by 25 m needs 2 × (40 + 25) = 130 m of fencing.',
        }),
        f('Perimeter of a square = 4 × side', 'perimeter of a square equals four times side'),
        f('Perimeter of a regular polygon = number of sides × side', 'perimeter of a regular polygon equals number of sides times side'),
        keys('Perimeter is a length: measure it in cm, m or km.', 'Equilateral triangle: 3 × side.', 'Regular hexagon: 6 × side.'),
        remember('Write all sides in the same unit before adding.'),
        tip('Cost of fencing = perimeter × cost per metre.'),
      ],
      examples: [
        ex('Find the perimeter of a rectangle 15 cm long and 9 cm broad.', ['P = 2 × (15 + 9)', '= 2 × 24'], '48 cm'),
        ex('A square park has a side of 60 m. Fencing costs ₹20 per metre. Find the cost.', ['Perimeter = 4 × 60 = 240 m.', 'Cost = 240 × 20.'], '₹4,800'),
      ],
      practice: [
        tp('rect', (r) => {
          const l = r.int(5, 40), b = r.int(2, l - 1);
          return typed(`Find the perimeter of a rectangle of length ${l} cm and breadth ${b} cm.`, num(2 * (l + b), 'cm'), ['P = 2 × (l + b)'], [`2 × (${l} + ${b}) = 2 × ${l + b} = ${2 * (l + b)} cm`],
            [[`${l + b}`, 'You went only half way round. Multiply by 2.'], [`${l * b}`, 'That is the area. Perimeter adds the sides.']]);
        }),
        tp('square', (r) => {
          const s = r.int(3, 50);
          return typed(`Find the perimeter of a square tile with side ${s} cm.`, num(4 * s, 'cm'), ['A square has 4 equal sides.'], [`4 × ${s} = ${4 * s} cm`], [[`${s * s}`, 'That is the area.']]);
        }),
        tp('tri', (r) => {
          const a = r.int(4, 15), b = r.int(4, 15), c = r.int(Math.abs(a - b) + 1, a + b - 1);
          return typed(`A triangle has sides ${a} cm, ${b} cm and ${c} cm. Find its perimeter.`, num(a + b + c, 'cm'), ['Add all three sides.'], [`${a} + ${b} + ${c} = ${a + b + c} cm`]);
        }),
        tp('regular', (r) => {
          const [nmS, n] = r.pick([['equilateral triangle', 3], ['regular pentagon', 5], ['regular hexagon', 6], ['regular octagon', 8]] as [string, number][]);
          const s = r.int(3, 20);
          return typed(`Find the perimeter of ${/^[aeiou]/.test(nmS) ? 'an' : 'a'} ${nmS} with side ${s} cm.`, num(n * s, 'cm'), [`A ${nmS} has ${n} equal sides.`], [`${n} × ${s} = ${n * s} cm`]);
        }),
        tp('fence', (r) => {
          const l = r.int(10, 50), b = r.int(5, l - 1), rate = r.pick([5, 10, 12, 15, 20, 25]);
          const P = 2 * (l + b);
          return typed(`A garden is ${l} m long and ${b} m broad. Fencing costs ₹${rate} per metre. What is the total cost (in ₹)?`, num(P * rate, '₹'),
            ['First find the perimeter.', 'Then multiply by the rate.'], [`P = 2 × (${l} + ${b}) = ${P} m`, `Cost = ${P} × ${rate} = ${inr(P * rate)}`], [],
            { steps: [st('Perimeter in metres?', num(P)), st('Cost in rupees?', num(P * rate))] });
        }, 2),
        tp('side', (r) => {
          const s = r.int(4, 40);
          return typed(`A square has a perimeter of ${4 * s} m. How long is each side?`, num(s, 'm'), ['Perimeter = 4 × side.', 'So side = perimeter ÷ 4.'], [`${4 * s} ÷ 4 = ${s} m`]);
        }),
      ],
    },
    {
      id: 'ts6.m.mensa.area', title: 'Area of rectangles and squares', prereqs: ['ts6.m.mensa.perim'],
      intro: [
        h('How much surface?'),
        p('Perimeter tells how long the boundary is. Area tells how much surface is covered inside. We measure area by counting unit squares: a square of side 1 cm has area 1 square centimetre (1 cm²).'),
        vis({ kind: 'grid-shape', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]], cols: 6, rows: 4 }, 'A 4 by 3 rectangle covers 12 unit squares: area 12 square units.'),
        def('Area', 'The amount of surface enclosed by a closed figure, measured in square units (cm², m²).'),
        f('Area of a rectangle = l × b', 'area of a rectangle equals length times breadth'),
        X({
          title: 'What if? Area of a rectangle', formula: 'A = l × b',
          result: ['A', 'Area', 'l*b', 'm²'],
          vars: [['l', 'Length', 1, 30, 1, 6, 'm'], ['b', 'Breadth', 1, 30, 1, 4, 'm']],
          notes: [['l', 'Each extra metre of length adds a whole row of b squares.', 'A shorter length removes rows of squares.']],
          mistakes: [['A = 2 × (l + b)', 'That is the perimeter (a length). Area counts squares: l × b.'], ['Writing m instead of m²', 'Area is in SQUARE units.']],
          real: 'A classroom floor 8 m by 6 m has area 48 m² — enough for 48 one-metre square mats.',
        }),
        f('Area of a square = side × side', 'area of a square equals side times side'),
        keys('Area is in square units: cm², m².', 'Count a square if more than half of it is inside; ignore it if less than half (for curved shapes).', 'Number of tiles = area of floor ÷ area of one tile.'),
        remember('Perimeter → cm (a length). Area → cm² (a surface).'),
        tip('If you know the area and the length, breadth = area ÷ length.'),
      ],
      examples: [
        ex('Find the area of a rectangle 12 m by 7 m.', ['A = l × b = 12 × 7.'], '84 m²'),
        ex('How many square tiles of side 20 cm cover a floor 2 m by 1 m?', ['2 m = 200 cm, 1 m = 100 cm.', 'Tiles along length: 200 ÷ 20 = 10; along breadth: 100 ÷ 20 = 5.', '10 × 5 = 50.'], '50 tiles'),
      ],
      practice: [
        tp('grid', (r) => {
          const cols = 6, rows = 5, all: [number, number][] = [];
          for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) all.push([x, y]);
          const cells = some(r, all, r.int(6, 16));
          return typed('Each small square is 1 cm². What is the area of the shaded shape?', num(cells.length, 'cm²'), ['Count the shaded squares.'], [`${cells.length} squares → ${cells.length} cm²`], [], { visual: { kind: 'grid-shape', cells, cols, rows } });
        }),
        tp('rect', (r) => {
          const l = r.int(4, 30), b = r.int(2, 20);
          return typed(`Find the area of a rectangle ${l} cm long and ${b} cm broad.`, num(l * b, 'cm²'), ['A = l × b'], [`${l} × ${b} = ${l * b} cm²`], [[`${2 * (l + b)}`, 'That is the perimeter. Area = l × b.']]);
        }),
        tp('square', (r) => {
          const s = r.int(2, 25);
          return typed(`Find the area of a square of side ${s} m.`, num(s * s, 'm²'), ['A = side × side'], [`${s} × ${s} = ${s * s} m²`], [[`${4 * s}`, 'That is the perimeter. Area = side × side.'], [`${2 * s}`, 'side × side, not side × 2.']]);
        }),
        tp('missing', (r) => {
          const l = r.int(5, 25), b = r.int(2, 15);
          return typed(`A rectangular mat has area ${l * b} cm² and length ${l} cm. Find its breadth.`, num(b, 'cm'), ['Area = l × b, so b = area ÷ l.'], [`${l * b} ÷ ${l} = ${b} cm`]);
        }),
        tp('tiles', (r) => {
          const t = r.pick([10, 20, 25, 50]), a = t * r.int(4, 12), b = t * r.int(2, 8);
          return typed(`How many square tiles of side ${t} cm are needed to cover a floor ${a} cm by ${b} cm?`, num((a / t) * (b / t)), ['Count tiles along the length and along the breadth.', 'Multiply.'],
            [`${a} ÷ ${t} = ${a / t}, ${b} ÷ ${t} = ${b / t}`, `${a / t} × ${b / t} = ${(a / t) * (b / t)} tiles`]);
        }, 2),
        bank('units', [
          { q: 'Which unit is used for area?', a: 'cm²', w: ['cm', 'kg', 'litre'], h: ['Area counts squares.'], s: ['Area uses square units like cm².'] },
          { q: 'Which unit is used for perimeter?', a: 'm', w: ['m²', 'cm²', 'kg'], h: ['Perimeter is a length.'], s: ['Perimeter is measured in length units like m.'] },
          { q: 'A square of side 1 m has area…', a: '1 m²', w: ['4 m²', '4 m', '2 m²'], h: ['1 × 1'], s: ['1 m × 1 m = 1 m².'] },
          { q: 'To find how much carpet covers a floor, we need its…', a: 'area', w: ['perimeter', 'height', 'weight'], h: ['Carpet covers a surface.'], s: ['Covering a surface needs area.'] },
          { q: 'To put a lace border around a tablecloth, we need its…', a: 'perimeter', w: ['area', 'volume', 'weight'], h: ['A border goes around the edge.'], s: ['The edge length is the perimeter.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.mensa.apply', title: 'Using perimeter and area together', prereqs: ['ts6.m.mensa.area'],
      intro: [
        h('Same fence, different gardens'),
        p('Imran has 24 m of fence. He can make a 10 m × 2 m garden (area 20 m²) or a 6 m × 6 m garden (area 36 m²). Same perimeter, different areas! Perimeter and area are different ideas.'),
        vis({ kind: 'bar-graph', labels: ['10 × 2', '8 × 4', '7 × 5', '6 × 6'], values: [20, 32, 35, 36], unit: 'm²' }, 'Rectangles with perimeter 24 m: the square has the biggest area.'),
        f('Cost = area × rate per square metre', 'cost equals area times rate per square metre'),
        X({
          title: 'What if? Cost of painting a wall', formula: 'Cost = l × b × rate',
          result: ['C', 'Cost', 'l*b*R', '₹'],
          vars: [['l', 'Length', 1, 20, 1, 5, 'm'], ['b', 'Height', 1, 10, 1, 3, 'm'], ['R', 'Rate per m²', 5, 100, 5, 40, '₹']],
          notes: [['R', 'A costlier paint makes every square metre dearer.', 'A cheaper rate lowers the cost.']],
          mistakes: [['Using perimeter × rate for painting', 'Paint covers the surface, so use AREA. Fencing uses perimeter.']],
          real: 'A wall 5 m by 3 m painted at ₹40 per m² costs 15 × 40 = ₹600.',
        }),
        keys('Fencing, borders, running around → perimeter.', 'Painting, carpeting, tiling → area.', 'For a fixed perimeter, the square has the largest area.'),
        remember('If the side of a square doubles, its perimeter doubles but its area becomes 4 times.'),
        tip('Breadth of a rectangle from its perimeter: b = P ÷ 2 − l.'),
      ],
      examples: [
        ex('A rectangle has perimeter 30 cm and length 9 cm. Find its breadth and area.', ['l + b = 30 ÷ 2 = 15.', 'b = 15 − 9 = 6 cm.', 'Area = 9 × 6 = 54 cm².'], 'b = 6 cm, area 54 cm²'),
        ex('Carpeting costs ₹50 per m². Find the cost for a room 5 m by 4 m.', ['Area = 20 m².', 'Cost = 20 × 50.'], '₹1,000'),
      ],
      practice: [
        tp('breadth', (r) => {
          const l = r.int(6, 25), b = r.int(2, l - 1), P = 2 * (l + b);
          return typed(`A rectangle has perimeter ${P} cm and length ${l} cm. Find its breadth.`, num(b, 'cm'), ['l + b = P ÷ 2.', `b = ${P / 2} − ${l}`], [`${P} ÷ 2 = ${P / 2}`, `${P / 2} − ${l} = ${b} cm`], [[`${P - l}`, 'Halve the perimeter first: it contains TWO lengths.']]);
        }),
        tp('cost', (r) => {
          const l = r.int(3, 12), b = r.int(2, 8), rate = r.pick([20, 25, 30, 40, 50, 60]);
          return typed(`A wall is ${l} m long and ${b} m high. Painting costs ₹${rate} per m². Find the cost (in ₹).`, num(l * b * rate, '₹'), ['Find the area first.', 'Multiply by the rate.'],
            [`Area = ${l} × ${b} = ${l * b} m²`, `Cost = ${l * b} × ${rate} = ${inr(l * b * rate)}`], [[`${2 * (l + b) * rate}`, 'Painting covers the surface — use AREA, not perimeter.']]);
        }),
        tp('bigger', (r) => {
          const P2 = r.pick([10, 12, 14, 16, 18]);
          const opts = some(r, Array.from({ length: P2 - 1 }, (_, i) => i + 1).filter((l) => l >= P2 - l), 3);
          const best = opts.reduce((m, l) => (l * (P2 - l) > m * (P2 - m) ? l : m));
          const lab = (l: number) => `${l} m × ${P2 - l} m`;
          return mcq(r, `These rectangles all have perimeter ${2 * P2} m. Which has the greatest area?`, lab(best), opts.filter((l) => l !== best).map(lab).concat(opts.length < 3 ? [`${P2} m × 1 m`] : []),
            ['Find l × b for each.', 'The closer to a square, the bigger the area.'], opts.map((l) => `${lab(l)} → ${l * (P2 - l)} m²`));
        }, 2),
        tp('both', (r) => {
          const l = r.int(4, 20), b = r.int(2, l);
          return typed(`For a rectangle ${l} m by ${b} m, find the perimeter and then the area. Enter the area.`, num(l * b, 'm²'), ['P = 2 × (l + b), A = l × b.'], [`P = ${2 * (l + b)} m`, `A = ${l * b} m²`], [],
            { steps: [st('Perimeter (m)?', num(2 * (l + b))), st('Area (m²)?', num(l * b))] });
        }),
        bank('double', [
          { q: 'The side of a square is doubled. Its area becomes…', a: '4 times', w: ['2 times', 'the same', '8 times'], h: ['Try side 1 → 2.'], s: ['1 × 1 = 1; 2 × 2 = 4: four times.'] },
          { q: 'The side of a square is doubled. Its perimeter becomes…', a: '2 times', w: ['4 times', 'the same', 'half'], h: ['Perimeter = 4 × side.'], s: ['4 × 2s = 2 × (4s): twice.'] },
          { q: 'Two rectangles have the same perimeter. Their areas…', a: 'may be different', w: ['are always equal', 'are always 0', 'are always double'], h: ['Compare 10 × 2 with 6 × 6.'], s: ['Both have perimeter 24 but areas 20 and 36.'] },
          { q: 'Fencing a field needs its…', a: 'perimeter', w: ['area', 'diagonal', 'height'], h: ['A fence goes around.'], s: ['Fencing follows the boundary.'] },
          { q: 'Tiling a floor needs its…', a: 'area', w: ['perimeter', 'length only', 'breadth only'], h: ['Tiles cover a surface.'], s: ['Tiling covers the surface.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 11 RATIO AND PROPORTION
const rat = (a: number, b: number) => { const g = gcd(a, b); return `${a / g} : ${b / g}`; };
const ch11: USpec = {
  id: 'ts6.m.ch11', subject: 'math', title: 'Ratio and Proportion', source: src(11),
  objectives: [
    {
      id: 'ts6.m.ratio.ratio', title: 'Comparing quantities using ratio',
      intro: [
        h('How many times as much?'),
        p('A class has 30 girls and 20 boys. We can say there are 10 more girls, or we can say girls to boys is 30 : 20 = 3 : 2. The second comparison is a ratio — it compares by division.'),
        vis({ kind: 'objects', emoji: '👧', count: 3 }, 'For every 3 girls there are 2 boys.'),
        def('Ratio', 'a : b compares a with b by division (a ÷ b). Read "a is to b".'),
        stepsB('Write both quantities in the SAME unit.', 'Write them as a : b.', 'Divide both by their HCF to get the simplest form.'),
        keys('Ratio has no unit.', 'Order matters: 3 : 2 is not 2 : 3.', 'Equivalent ratios: 2 : 3 = 4 : 6 = 6 : 9.'),
        remember('Compare ₹1 and 50 paise as 100 paise : 50 paise = 2 : 1.'),
        tip('To share in the ratio a : b, split into a + b equal parts.'),
      ],
      examples: [
        ex('Find the ratio of 45 cm to 1 m in simplest form.', ['1 m = 100 cm.', '45 : 100; HCF 5.', '= 9 : 20'], '9 : 20'),
        ex('Share ₹60 between Diya and Arjun in the ratio 2 : 3.', ['Total parts: 2 + 3 = 5.', 'One part = 60 ÷ 5 = 12.', 'Diya 2 × 12 = 24, Arjun 3 × 12 = 36.'], '₹24 and ₹36'),
      ],
      practice: [
        tp('simplest', (r) => {
          const [x, y] = r.pick([[2, 3], [3, 4], [1, 2], [3, 5], [4, 7], [5, 6], [2, 5], [7, 9]] as [number, number][]), k = r.int(2, 9);
          return mcq(r, `Write ${x * k} : ${y * k} in its simplest form.`, `${x} : ${y}`, [`${y} : ${x}`, `${x * k - 1} : ${y * k - 1}`, `${x + 1} : ${y + 1}`, `${2 * x} : ${y}`],
            ['Divide both terms by their HCF.'], [`HCF = ${k}`, `${x * k} ÷ ${k} : ${y * k} ÷ ${k} = ${x} : ${y}`]);
        }),
        tp('units', (r) => {
          const [a, ua, b, ub, aa, bb] = r.pick([[50, 'paise', 2, 'rupees', 50, 200], [30, 'minutes', 2, 'hours', 30, 120], [400, 'g', 1, 'kg', 400, 1000], [75, 'cm', 3, 'm', 75, 300], [500, 'mL', 2, 'litres', 500, 2000], [20, 'seconds', 1, 'minute', 20, 60]] as [number, string, number, string, number, number][]);
          return mcq(r, `Find the ratio of ${a} ${ua} to ${b} ${ub}.`, rat(aa, bb), [rat(a, b), rat(bb, aa), `${aa} : ${bb + 1}`], ['Change both into the same unit first.'], [`${b} ${ub} = ${bb} ${ua}`, `${aa} : ${bb} = ${rat(aa, bb)}`],
            [['wrong', 'Change both quantities into the same unit before writing the ratio.']]);
        }),
        tp('share', (r) => {
          const [a, b] = r.pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5]] as [number, number][]), u = r.int(5, 40), T = (a + b) * u;
          return typed(`Divide ₹${T} between two friends in the ratio ${a} : ${b}. How much does the second friend get (in ₹)?`, num(b * u, '₹'), [`Total parts = ${a} + ${b} = ${a + b}.`, `One part = ${T} ÷ ${a + b}.`],
            [`One part = ${u}`, `Second friend: ${b} × ${u} = ₹${b * u}`], [[`${a * u}`, 'That is the first friend\'s share.'], [`${T / b}`, `Divide by the total number of parts (${a + b}), not by ${b}.`]]);
        }),
        tp('part', (r) => {
          const [a, b] = r.pick([[3, 2], [4, 5], [5, 3], [2, 3], [7, 5]] as [number, number][]), u = r.int(3, 8);
          return typed(`In a class the ratio of boys to girls is ${a} : ${b}. There are ${(a + b) * u} students. How many girls are there?`, num(b * u), [`Total parts: ${a + b}.`, `One part = ${(a + b) * u} ÷ ${a + b} = ${u}.`], [`Girls = ${b} × ${u} = ${b * u}`]);
        }),
        tp('equiv', (r) => {
          const a = r.int(1, 9), b = r.int(2, 9), k = r.int(2, 8);
          return typed(`Fill in the box: ${a} : ${b} = □ : ${b * k}`, num(a * k), [`${b} was multiplied by ${k}.`, `Multiply ${a} by ${k} too.`], [`${a} × ${k} = ${a * k}`]);
        }),
      ],
    },
    {
      id: 'ts6.m.ratio.prop', title: 'Proportion: the same ratio in different situations', prereqs: ['ts6.m.ratio.ratio'],
      intro: [
        h('Two ratios that match'),
        p('Lakshmi mixes 2 cups of rice with 4 cups of water. For a party she uses 6 cups of rice and 12 cups of water. 2 : 4 = 6 : 12, so the two mixtures are in proportion and the rice tastes the same.'),
        def('Proportion', 'Four numbers a, b, c, d are in proportion if a : b = c : d. We write a : b :: c : d.'),
        def('Extremes and means', 'In a : b :: c : d, a and d are the extremes; b and c are the means. In a proportion, product of extremes = product of means (a × d = b × c).'),
        keys('Check a proportion by simplifying both ratios, or by cross-multiplying.', 'A map scale like 1 cm : 5 km is a proportion.'),
        remember('The ORDER of the four numbers matters.'),
        tip('To find a missing term: a × d = b × c, so d = b × c ÷ a.'),
      ],
      examples: [
        ex('Are 3, 5, 12, 20 in proportion?', ['3 : 5 is already simple.', '12 : 20 = 3 : 5.', 'Equal → yes.'], 'Yes'),
        ex('Find x: 4 : 7 :: 12 : x.', ['4 × x = 7 × 12 = 84.', 'x = 84 ÷ 4.'], '21'),
      ],
      practice: [
        tp('is', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9) === a ? a + 1 : r.int(2, 9), k = r.int(2, 6), yes = r.next() < 0.5;
          const c = a * k, d = b * k + (yes ? 0 : r.pick([1, 2, -1]));
          return YN(r, `Are ${a}, ${b}, ${c}, ${d} in proportion?`, a * d === b * c, ['Check whether a × d = b × c.'], [`${a} × ${d} = ${a * d}; ${b} × ${c} = ${b * c}`, a * d === b * c ? 'Equal, so they are in proportion.' : 'Not equal, so they are not in proportion.']);
        }),
        tp('missing', (r) => {
          const a = r.int(2, 9), b0 = r.int(2, 12), b = b0 === a ? a + 3 : b0, k = r.int(2, 6);
          return typed(`Find the missing number: ${a} : ${b} :: ${a * k} : □`, num(b * k), ['Product of extremes = product of means.', `${a} × □ = ${b} × ${a * k}`], [`□ = ${b} × ${a * k} ÷ ${a} = ${b * k}`]);
        }),
        tp('extremes', (r) => {
          const a = r.int(2, 9), b0 = r.int(2, 9), b = b0 === a ? a + 1 : b0, k = r.int(2, 5);
          const ask = r.pick(['extremes', 'means']);
          return typed(`In the proportion ${a} : ${b} :: ${a * k} : ${b * k}, what is the product of the ${ask}?`, num(a * b * k), ['Extremes: first and last. Means: the middle two.', 'In a proportion both products are equal.'],
            [ask === 'extremes' ? `${a} × ${b * k} = ${a * b * k}` : `${b} × ${a * k} = ${a * b * k}`]);
        }),
        tp('which', (r) => {
          const a = r.int(1, 7), b = r.int(a + 1, 9), k = r.int(2, 6);
          return mcq(r, `Which ratio is in proportion with ${a} : ${b}?`, `${a * k} : ${b * k}`, [`${a * k} : ${b * k + 1}`, `${b * k} : ${a * k}`, `${a + k} : ${b + k}`],
            ['Simplify each choice.'], [`${a * k} : ${b * k} = ${a} : ${b}`], [['wrong', 'Adding the same number to both terms changes the ratio.']]);
        }),
        tp('map', (r) => {
          const k = r.pick([2, 5, 10, 20, 25, 50]), d = r.int(2, 15);
          return typed(`On a map, 1 cm stands for ${k} km. Two towns are ${d} cm apart on the map. How far apart are they really (in km)?`, num(d * k, 'km'), ['Each cm is ' + k + ' km.'], [`${d} × ${k} = ${d * k} km`]);
        }),
      ],
    },
    {
      id: 'ts6.m.ratio.unitary', title: 'Unitary method', prereqs: ['ts6.m.ratio.prop'],
      intro: [
        h('Find one, then find many'),
        p('If 6 pencils cost ₹30, how much do 10 cost? First find the cost of ONE pencil: 30 ÷ 6 = ₹5. Then 10 pencils cost 10 × 5 = ₹50. This is the unitary method.'),
        vis({ kind: 'objects', emoji: '✏️', count: 6 }, '6 pencils for ₹30 — one pencil costs ₹5.'),
        f('Value of many = value of one × number', 'value of many equals value of one times number'),
        X({
          title: 'What if? Unitary method', formula: 'Cost = (T ÷ n) × m',
          result: ['C', 'Cost of m items', 'T/n*m', '₹', 2],
          vars: [['T', 'Cost of n items', 10, 500, 10, 30, '₹'], ['n', 'Number bought first', 1, 20, 1, 6], ['m', 'Number wanted', 1, 50, 1, 10]],
          notes: [['m', 'More items, more cost — in the same proportion.', 'Fewer items cost less.'], ['n', 'If the same money bought more items, each one is cheaper.', 'If it bought fewer, each one is dearer.']],
          mistakes: [['Multiplying before dividing by the wrong number', 'Always find ONE first: divide the total by the number it was for.']],
          real: 'If 4 kg of tomatoes cost ₹120, then 1 kg costs ₹30 and 7 kg cost ₹210.',
        }),
        keys('Step 1: divide to find the value of one unit.', 'Step 2: multiply to find the value of the needed units.'),
        remember('Unit price lets you compare which pack is a better buy.'),
        tip('Write the step "1 item costs …" clearly — most mistakes happen when this step is skipped.'),
      ],
      examples: [
        ex('A car goes 150 km in 3 hours. How far in 5 hours at the same speed?', ['In 1 hour: 150 ÷ 3 = 50 km.', 'In 5 hours: 5 × 50.'], '250 km'),
        ex('Which is cheaper: 4 pens for ₹48 or 5 pens for ₹55?', ['First pack: 48 ÷ 4 = ₹12 each.', 'Second pack: 55 ÷ 5 = ₹11 each.'], '5 pens for ₹55'),
      ],
      practice: [
        tp('many', (r) => {
          const u = r.int(3, 40), n = r.int(2, 9), m = r.int(2, 15), item = r.pick(['notebooks', 'pens', 'erasers', 'bangles', 'mangoes']);
          return typed(`${n} ${item} cost ₹${u * n}. What do ${m} ${item} cost (in ₹)?`, num(u * m, '₹'), [`Cost of 1 = ${u * n} ÷ ${n}.`, `Then multiply by ${m}.`], [`1 costs ₹${u}`, `${m} cost ${m} × ${u} = ₹${u * m}`], [],
            { steps: [st('Cost of one (₹)?', num(u)), st(`Cost of ${m} (₹)?`, num(u * m))] });
        }),
        tp('one', (r) => {
          const u = r.int(4, 60), n = r.int(3, 12);
          return typed(`${n} kg of onions cost ₹${u * n}. What is the cost of 1 kg (in ₹)?`, num(u, '₹'), ['Divide the total cost by the number of kg.'], [`${u * n} ÷ ${n} = ₹${u}`]);
        }),
        tp('travel', (r) => {
          const v = r.int(20, 80), t = r.int(2, 6), t2 = r.int(2, 9);
          return typed(`A bus covers ${v * t} km in ${t} hours. How far will it go in ${t2} hours at the same speed?`, num(v * t2, 'km'), [`In 1 hour: ${v * t} ÷ ${t}.`], [`1 hour: ${v} km`, `${t2} hours: ${t2} × ${v} = ${v * t2} km`]);
        }),
        tp('wages', (r) => {
          const w = r.pick([300, 350, 400, 450, 500, 600]), d = r.int(2, 7), d2 = r.int(3, 30);
          return typed(`A worker earns ₹${w * d} in ${d} days. How much will the worker earn in ${d2} days (in ₹)?`, num(w * d2, '₹'), ['Find the earning for 1 day first.'], [`1 day: ₹${w}`, `${d2} days: ₹${w * d2}`]);
        }),
        tp('better', (r) => {
          const u1 = r.int(8, 20); let u2 = r.int(8, 20); if (u2 === u1) u2 = u1 + 2;
          const n1 = r.int(2, 6), n2 = r.int(3, 8);
          const A = `${n1} soaps for ₹${u1 * n1}`, B = `${n2} soaps for ₹${u2 * n2}`;
          return mcq(r, `Which is the better buy: ${A} or ${B}?`, u1 < u2 ? A : B, [u1 < u2 ? B : A, 'Both cost the same per soap'], ['Find the cost of one soap in each pack.'],
            [`${A}: ₹${u1} each`, `${B}: ₹${u2} each`, `Cheaper per soap: ${u1 < u2 ? A : B}`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 12 SYMMETRY
const SYM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'K', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'];
const NO_SYM = ['F', 'G', 'J', 'L', 'N', 'P', 'Q', 'R', 'S', 'Z'];
const SHAPE_LINES: [string, number][] = [['square', 4], ['rectangle (not a square)', 2], ['equilateral triangle', 3], ['isosceles triangle (not equilateral)', 1], ['scalene triangle', 0], ['rhombus (not a square)', 2], ['regular pentagon', 5], ['regular hexagon', 6], ['kite', 1], ['parallelogram (not a rectangle or rhombus)', 0]];
const ch12: USpec = {
  id: 'ts6.m.ch12', subject: 'math', title: 'Symmetry', source: src(12),
  objectives: [
    {
      id: 'ts6.m.sym.line', title: 'Line symmetry',
      intro: [
        h('Fold and match'),
        p('Fold a picture of a butterfly down the middle. The two halves fit exactly on each other. The fold line is a line of symmetry, and the figure is symmetrical.'),
        photo('🦋', 'A butterfly has one line of symmetry down its body.'),
        def('Line of symmetry (mirror line)', 'A line that divides a figure into two halves that match exactly when folded along it.'),
        keys('Many leaves, the Charminar front, and the letter A are symmetrical.', 'The letters F, G, J, L, N, P, Q, R, S and Z have no line of symmetry.', 'Each point and its image are the same distance from the mirror line.'),
        remember('If the two halves do not match after folding, that line is NOT a line of symmetry.'),
        tip('Hold a small mirror on the line you are testing: if the half plus its reflection makes the whole figure, it is a line of symmetry.'),
      ],
      examples: [
        ex('Does the letter T have a line of symmetry?', ['Fold it down the middle (vertical line).', 'Both halves match.'], 'Yes, one vertical line'),
        ex('A mirror line is at 5 on a number line. Where is the image of the point 2?', ['2 is 3 units left of 5.', 'The image is 3 units right of 5.'], '8'),
      ],
      practice: [
        tp('letters', (r) => {
          const yes = some(r, SYM_LETTERS, 3), no = some(r, NO_SYM, 3);
          return { type: 'tap', prompt: 'Tap the capital letters that have at least one line of symmetry.', ...tapAll(r, [...yes.map((x) => ({ label: x, ok: true })), ...no.map((x) => ({ label: x, ok: false }))]),
            hints: ['Imagine folding each letter down the middle or across the middle.'], solution: [`Symmetrical: ${yes.join(', ')}`, `Not symmetrical: ${no.join(', ')}`] } as QSpec;
        }),
        tp('image', (r) => {
          const m = r.int(-2, 8), a = m - r.int(1, 6);
          return typed(`A mirror line passes through ${n_(m)} on a number line. Where is the image of the point ${n_(a)}?`, num(2 * m - a), ['The image is the same distance on the other side.', `Distance from mirror: ${m - a}.`],
            [`${n_(m)} + ${m - a} = ${n_(2 * m - a)}`], [], { visual: { kind: 'number-line', from: -10, to: 15, step: 1, marks: [a, m] } });
        }),
        tp('half', (r) => {
          const A = r.int(6, 60);
          return typed(`A symmetrical rangoli is folded along its line of symmetry. One half has area ${A} cm². What is the area of the whole rangoli?`, num(2 * A, 'cm²'), ['The two halves are exactly equal.'], [`2 × ${A} = ${2 * A} cm²`]);
        }),
        tp('dist', (r) => {
          const d = r.int(2, 12);
          return typed(`A point is ${d} squares to the left of a mirror line on squared paper. How many squares apart are the point and its image?`, num(2 * d), ['The image is the same distance on the other side.'], [`${d} + ${d} = ${2 * d}`], [[`${d}`, 'That is the distance to the mirror. The image is a further ' + d + ' squares beyond it.']]);
        }),
        bank('objects', [
          { q: 'Which of these is usually symmetrical?', a: 'A butterfly', w: ['A scribble', 'The letter F', 'A broken stick'], h: ['Fold it in your mind.'], s: ['A butterfly\'s wings match.'] },
          { q: 'A line of symmetry divides a figure into…', a: 'two matching halves', w: ['three equal parts', 'two unequal parts', 'four triangles'], h: ['Think of folding.'], s: ['The two halves fit exactly.'] },
          { q: 'Which letter has NO line of symmetry?', a: 'S', w: ['A', 'H', 'O'], h: ['Try folding each letter.'], s: ['S looks the same after half a turn, but no fold makes its halves match.'] },
          { q: 'Which letter has a horizontal line of symmetry?', a: 'B', w: ['A', 'T', 'V'], h: ['Fold the letter top to bottom.'], s: ['The top and bottom of B match.'] },
          { q: 'A mirror line is also called a…', a: 'line of symmetry', w: ['diagonal', 'radius', 'ray'], h: ['It reflects one half onto the other.'], s: ['They mean the same thing.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.sym.multi', title: 'Figures with many lines of symmetry', prereqs: ['ts6.m.sym.line'],
      intro: [
        h('More than one fold'),
        p('A square can be folded in 4 different ways so that the halves match: two through the middles of opposite sides and two along the diagonals. A circle can be folded along ANY diameter.'),
        vis({ kind: 'shape', shape: 'hexagon', color: '#ff9800' }, 'A regular hexagon has 6 lines of symmetry.'),
        keys('Square: 4. Rectangle: 2. Equilateral triangle: 3.', 'Isosceles triangle: 1. Scalene triangle: 0.', 'A regular polygon with n sides has n lines of symmetry.', 'A circle has infinitely many.'),
        remember('The diagonals of a rectangle (that is not a square) are NOT lines of symmetry.'),
        tip('Kolam and rangoli designs often have 4 or 8 lines of symmetry.'),
      ],
      examples: [
        ex('How many lines of symmetry does a regular octagon have?', ['A regular polygon with n sides has n lines.', 'n = 8.'], '8'),
        ex('How many lines of symmetry does the letter H have?', ['One vertical (left and right match).', 'One horizontal (top and bottom match).'], '2'),
      ],
      practice: [
        tp('count', (r) => {
          const [s, n] = r.pick(SHAPE_LINES);
          return typed(`How many lines of symmetry does a ${s} have?`, num(n), ['Imagine every way of folding it so the halves match.'], [`A ${s} has ${n} line${n === 1 ? '' : 's'} of symmetry.`]);
        }),
        tp('regular', (r) => {
          const n = r.int(5, 12);
          return typed(`How many lines of symmetry does a regular polygon with ${n} sides have?`, num(n), ['Regular polygon: number of lines = number of sides.'], [`${n} sides → ${n} lines of symmetry`]);
        }),
        matchT('shapes', 'Match each figure with its number of lines of symmetry', [
          ['Square', '4'], ['Rectangle', '2'], ['Equilateral triangle', '3'], ['Scalene triangle', '0'], ['Isosceles triangle', '1'], ['Circle', 'Infinitely many'], ['Regular hexagon', '6'],
        ], ['Only regular shapes have as many lines as sides.']),
        tp('two', (r) => {
          const yes = some(r, ['H', 'I', 'O', 'X'], 2), no = some(r, ['A', 'M', 'T', 'U', 'V', 'W', 'B', 'C', 'D', 'E', 'K'], 3);
          return { type: 'tap', prompt: 'Tap the letters that have TWO lines of symmetry.', ...tapAll(r, [...yes.map((x) => ({ label: x, ok: true })), ...no.map((x) => ({ label: x, ok: false }))]),
            hints: ['Check both a vertical fold and a horizontal fold.'], solution: ['H, I, O and X have two lines; the others have only one.'] } as QSpec;
        }),
        bank('facts', [
          { q: 'How many lines of symmetry does a circle have?', a: 'Infinitely many', w: ['1', '2', '4'], h: ['Every diameter works.'], s: ['Any diameter is a line of symmetry.'] },
          { q: 'Which triangle has exactly 3 lines of symmetry?', a: 'Equilateral', w: ['Isosceles', 'Scalene', 'Right-angled scalene'], h: ['All sides equal.'], s: ['An equilateral triangle has 3.'] },
          { q: 'Are the diagonals of a non-square rectangle lines of symmetry?', a: 'No', w: ['Yes', 'Only one of them', 'Only when it is long'], h: ['Fold a rectangular paper along a diagonal.'], s: ['The halves do not match.'] },
          { q: 'A regular polygon has 9 lines of symmetry. How many sides does it have?', a: '9', w: ['18', '3', '4'], h: ['Lines = sides for regular polygons.'], s: ['9 sides.'] },
          { q: 'Which has the most lines of symmetry?', a: 'Square', w: ['Rectangle', 'Isosceles triangle', 'Kite'], h: ['Count each.'], s: ['Square 4, rectangle 2, isosceles 1, kite 1.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.sym.mirror', title: 'Reflection and mirror images', prereqs: ['ts6.m.sym.line'],
      intro: [
        h('What a mirror does'),
        p('Stand in front of a mirror and raise your right hand — your image raises its left. A mirror flips left and right. The image is as far behind the mirror as you are in front of it.'),
        def('Reflection', 'The mirror image of a figure. Every point and its image are at equal distances from the mirror line, on opposite sides, and the line joining them is perpendicular to the mirror.'),
        keys('Size and shape do not change in a reflection.', 'Left and right are swapped.', 'Distance from object to image = 2 × distance from object to mirror.'),
        remember('AMBULANCE is written reversed on the front of an ambulance so drivers read it correctly in their mirrors.'),
        tip('On squared paper, count the squares from a point to the mirror line, then count the same number on the other side.'),
      ],
      examples: [
        ex('A girl stands 2 m in front of a mirror. How far is she from her image?', ['Her image is 2 m behind the mirror.', '2 + 2 = 4 m.'], '4 m'),
        ex('A clock shows 3:00. What time does its mirror image seem to show?', ['The hour hand points to 3; in a mirror it points to 9.'], '9:00'),
      ],
      practice: [
        tp('distance', (r) => {
          const d = r.int(1, 15) * 10;
          const who = nm(r);
          return typed(`${who} stands ${d} cm in front of a mirror. How far is ${who} from the image (in cm)?`, num(2 * d, 'cm'), ['The image is as far behind the mirror as the object is in front.'], [`${d} + ${d} = ${2 * d} cm`], [[`${d}`, 'That is only the distance to the mirror.']]);
        }),
        tp('clock', (r) => {
          const hh = r.int(1, 11), mirror = 12 - hh;
          return typed(`A clock shows ${hh}:00. In a mirror placed beside it, the hour hand seems to point to which number?`, num(mirror === 0 ? 12 : mirror), ['A mirror swaps left and right.', 'The 12–6 line stays where it is.'],
            [`Image hour = 12 − ${hh} = ${mirror}`], [], { visual: { kind: 'clock', h: hh, m: 0 } });
        }),
        tp('point', (r) => {
          const m = r.int(0, 10), a = m + r.int(1, 7);
          return typed(`On a number line, a mirror stands at ${m}. A point is at ${a}. Where is its image?`, num(2 * m - a), ['Find the distance from the point to the mirror.', 'Go the same distance on the other side.'], [`Distance = ${a - m}`, `${m} − ${a - m} = ${n_(2 * m - a)}`], [], { visual: { kind: 'number-line', from: -10, to: 20, step: 1, marks: [m, a] } });
        }),
        bank('facts', [
          { q: 'When you raise your right hand in front of a mirror, your image raises its…', a: 'left hand', w: ['right hand', 'both hands', 'no hand'], h: ['A mirror swaps sides.'], s: ['Left and right are swapped.'] },
          { q: 'Does reflection change the size of a shape?', a: 'No', w: ['Yes, it doubles', 'Yes, it halves', 'Only for big shapes'], h: ['Look at your own image.'], s: ['Size and shape stay the same.'] },
          { q: 'Why is AMBULANCE written backwards on the vehicle?', a: 'So it reads correctly in a driver\'s mirror', w: ['To look stylish', 'It is a printing mistake', 'For people inside'], h: ['Who sees it in a mirror?'], s: ['Drivers ahead see it the right way in their rear-view mirrors.'] },
          { q: 'The line joining a point to its mirror image is ___ to the mirror line.', a: 'perpendicular', w: ['parallel', 'curved', 'at 45°'], h: ['It meets the mirror at a right angle.'], s: ['It is perpendicular.'] },
          { q: 'Which word looks the same in a mirror held beside it (vertical mirror)?', a: 'TOOT', w: ['BOOK', 'CAR', 'SUN'], h: ['The letters must be symmetric AND the word must read the same backwards.'], s: ['TOOT is a palindrome made of symmetric letters.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 13 PRACTICAL GEOMETRY
const ch13: USpec = {
  id: 'ts6.m.ch13', subject: 'math', title: 'Practical Geometry', source: src(13),
  objectives: [
    {
      id: 'ts6.m.pg.seg', title: 'Constructing line segments and circles',
      intro: [
        h('Tools in a geometry box'),
        p('A ruler, compasses, dividers, set squares and a protractor help us draw exact figures. With a ruler and compasses we can draw a segment of a given length, copy a segment, and draw circles.'),
        photo('📏', 'A ruler is used to draw and measure straight segments.'),
        stepsB('To draw a circle of radius r: open the compasses to r cm on a ruler.', 'Mark the centre O.', 'Put the pointed leg on O.', 'Turn the pencil leg once around without changing the opening.'),
        def('Copying a segment', 'Open the compasses to the length of AB, then mark the same length on a new line from a point P.'),
        keys('Never change the compass opening while drawing an arc.', 'Sum of segments: draw one, then continue from its end.', 'Difference: draw the longer, then cut off the shorter from one end.'),
        remember('The compass opening for a circle is the RADIUS, not the diameter.'),
        tip('Use a sharp pencil — a thick line makes your measurements inaccurate.'),
      ],
      examples: [
        ex('Draw a circle of diameter 8 cm. What opening do you set?', ['Radius = 8 ÷ 2 = 4 cm.'], '4 cm'),
        ex('AB = 7 cm, CD = 3 cm. How long is the segment XY = AB − CD?', ['Draw AB, cut off 3 cm with the compasses from A.', '7 − 3 = 4.'], '4 cm'),
      ],
      practice: [
        orderT('circle', 'Put the steps for drawing a circle of radius 3 cm in order.', [
          'Open the compasses to 3 cm using a ruler', 'Mark the centre O', 'Place the pointed leg on O', 'Turn the pencil leg round once to draw the circle',
        ], ['You need the right opening before you start drawing.']),
        orderT('copy', 'Put the steps for copying segment AB onto line l in order.', [
          'Mark a point P on line l', 'Place the compass legs on A and B', 'Without changing the opening, put the pointed leg on P', 'Draw an arc cutting l at Q; PQ is the copy of AB',
        ], ['Measure AB with the compasses before you move to line l.']),
        tp('diff', (r) => {
          const a = r.int(6, 15), b = r.int(2, a - 1);
          return typed(`Given AB = ${a} cm and CD = ${b} cm, a segment of length AB − CD is constructed. How long is it?`, num(a - b, 'cm'), ['Cut off CD from AB.'], [`${a} − ${b} = ${a - b} cm`]);
        }),
        tp('sum', (r) => {
          const a = r.int(2, 9), b = r.int(2, 9);
          return typed(`Segment PQ = ${a} cm is drawn and then extended by a copy of RS = ${b} cm. How long is the new segment?`, num(a + b, 'cm'), ['Add the two lengths.'], [`${a} + ${b} = ${a + b} cm`]);
        }),
        tp('opening', (r) => {
          const d = r.int(2, 10) * 2 + r.pick([0, 1]);
          return typed(`You want to draw a circle of diameter ${d} cm. To how many cm should you open the compasses?`, num(d / 2, 'cm'), ['The opening is the radius.', 'Radius = diameter ÷ 2.'], [`${d} ÷ 2 = ${d / 2} cm`], [[`${d}`, 'The opening is the radius, half of the diameter.']]);
        }),
        bank('tools', [
          { q: 'Which instrument is used to draw circles?', a: 'Compasses', w: ['Protractor', 'Set square', 'Eraser'], h: ['It has a pointed leg and a pencil leg.'], s: ['Compasses draw circles and arcs.'] },
          { q: 'Which instrument measures angles?', a: 'Protractor', w: ['Compasses', 'Dividers', 'Ruler'], h: ['It is shaped like a half circle.'], s: ['A protractor measures angles in degrees.'] },
          { q: 'Circles drawn with the same centre but different radii are called…', a: 'concentric circles', w: ['equal circles', 'diameters', 'chords'], h: ['Think of ripples in a pond.'], s: ['They are concentric circles.'] },
          { q: 'Which instrument has two pointed legs for comparing lengths?', a: 'Dividers', w: ['Compasses', 'Protractor', 'Set square'], h: ['No pencil on it.'], s: ['Dividers.'] },
          { q: 'Set squares help us to draw…', a: 'perpendicular and parallel lines', w: ['circles', 'curves', 'arcs'], h: ['They have a right angle.'], s: ['Set squares have right-angled corners.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.pg.perp', title: 'Constructing perpendiculars and perpendicular bisectors', prereqs: ['ts6.m.pg.seg'],
      intro: [
        h('Cutting a segment exactly in half'),
        p('To find the exact middle of a segment we construct its perpendicular bisector with compasses — no measuring needed!'),
        stepsB('Draw segment AB.', 'With centre A and radius more than half of AB, draw arcs above and below AB.', 'With the same radius and centre B, draw arcs cutting the first ones at P and Q.', 'Join P and Q. PQ is the perpendicular bisector of AB; it meets AB at the mid-point M.'),
        def('Perpendicular bisector', 'A line that cuts a segment into two equal parts at a right angle.'),
        keys('Every point on the perpendicular bisector is equally far from A and B.', 'AM = MB = AB ÷ 2.', 'The angle between PQ and AB is 90°.'),
        remember('The compass opening must be MORE than half of AB, or the arcs will not meet.'),
        tip('You can also draw a perpendicular through a point on a line with a set square or a protractor (90°).'),
      ],
      examples: [
        ex('AB = 9 cm. Its perpendicular bisector meets AB at M. Find AM.', ['AM = AB ÷ 2 = 9 ÷ 2.'], '4.5 cm'),
        ex('P lies on the perpendicular bisector of AB and PA = 5 cm. Find PB.', ['Points on the bisector are equidistant from A and B.'], 'PB = 5 cm'),
      ],
      practice: [
        orderT('bisector', 'Order the steps to construct the perpendicular bisector of AB.', [
          'Draw segment AB', 'With centre A and radius more than half AB, draw arcs above and below AB', 'With centre B and the same radius, draw arcs cutting them at P and Q', 'Join PQ',
        ], ['Arcs from A come before arcs from B.', 'Joining is last.']),
        tp('mid', (r) => {
          const L2 = r.int(5, 15) + r.pick([0, 0.5]) * 2;
          return typed(`The perpendicular bisector of AB = ${L2} cm meets it at M. Find MB.`, num(rd(L2 / 2, 2), 'cm'), ['The bisector cuts AB into two equal parts.'], [`${L2} ÷ 2 = ${rd(L2 / 2, 2)} cm`]);
        }),
        tp('equi', (r) => {
          const x = r.int(3, 12);
          return typed(`Point P lies on the perpendicular bisector of segment XY. PX = ${x} cm. What is PY?`, num(x, 'cm'), ['Every point on the perpendicular bisector is the same distance from both ends.'], [`PY = PX = ${x} cm`]);
        }),
        tp('opening', (r) => {
          const L2 = r.int(4, 12);
          const ok = L2 / 2 + r.int(1, 3), bad1 = L2 / 2 - 1, bad2 = r.int(1, Math.max(1, Math.floor(L2 / 2) - 1));
          return mcq(r, `To bisect AB = ${L2} cm with compasses, which opening will work?`, `${ok} cm`, [`${bad1} cm`, `${bad2} cm`, `${L2 / 2} cm`], ['The opening must be MORE than half of AB.'], [`Half of AB = ${L2 / 2} cm, so ${ok} cm works.`]);
        }),
        bank('facts', [
          { q: 'The perpendicular bisector of AB meets AB at an angle of…', a: '90°', w: ['45°', '180°', '60°'], h: ['"Perpendicular".'], s: ['It is at right angles to AB.'] },
          { q: 'Where does the perpendicular bisector cross AB?', a: 'At its mid-point', w: ['At A', 'At B', 'Anywhere'], h: ['"Bisector" means cuts in half.'], s: ['At the mid-point.'] },
          { q: 'How many perpendicular bisectors does a segment have?', a: 'Exactly one', w: ['Two', 'Countless', 'None'], h: ['There is only one mid-point.'], s: ['Only one line passes through the mid-point at 90°.'] },
          { q: 'Which tool is NOT needed to construct a perpendicular bisector?', a: 'Protractor', w: ['Compasses', 'Ruler', 'Pencil'], h: ['We use arcs, not angle measures.'], s: ['Only a ruler, compasses and a pencil are needed.'] },
          { q: 'A point on the perpendicular bisector of AB is…', a: 'equally far from A and B', w: ['closer to A', 'closer to B', 'always on AB'], h: ['Think of the arcs you drew.'], s: ['It is equidistant from A and B.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.pg.angle', title: 'Constructing, copying and bisecting angles; angles of special measures', prereqs: ['ts6.m.pg.perp'],
      intro: [
        h('Angles with compasses'),
        p('With a protractor we can draw any angle. With only a ruler and compasses we can still make special angles: 60°, 30°, 90°, 45°, 120°, 135°, 15° and more, by bisecting again and again.'),
        stepsB('To bisect ∠ABC: with centre B draw an arc cutting BA at P and BC at Q.', 'With centres P and Q and equal radius, draw two arcs meeting at R.', 'Join BR. It divides the angle into two equal halves.'),
        def('Angle bisector', 'A ray that divides an angle into two equal angles.'),
        keys('60°: an arc from the vertex, then an arc of the same radius from where it cuts the arm.', '30° = half of 60°; 15° = half of 30°.', '90°: perpendicular, or bisect 180°; 45° = half of 90°.', '120° = 60° + 60°; 135° = 90° + 45°.'),
        remember('When copying an angle, keep the SAME compass opening for the matching arcs.'),
        tip('On a protractor, the inner and outer scales add to 180°: if one reads 40°, the other reads 140°.'),
      ],
      examples: [
        ex('An angle of 84° is bisected. What is each part?', ['84 ÷ 2 = 42.'], '42°'),
        ex('How do you construct 45° with ruler and compasses?', ['Construct 90° (a perpendicular).', 'Bisect it.'], 'Bisect a right angle'),
      ],
      practice: [
        tp('bisect', (r) => {
          const x = r.int(10, 89) * 2;
          return typed(`An angle of ${x}° is bisected. What is the measure of each part?`, num(x / 2, '°'), ['Bisect = cut into two equal halves.'], [`${x} ÷ 2 = ${x / 2}°`]);
        }),
        tp('twice', (r) => {
          const x = r.int(5, 40) * 4;
          return typed(`An angle of ${x}° is bisected, and then one of the halves is bisected again. What is the smallest angle formed?`, num(x / 4, '°'), ['Halve it, then halve again.'], [`${x} ÷ 2 = ${x / 2}`, `${x / 2} ÷ 2 = ${x / 4}°`]);
        }),
        tp('special', (r) => {
          const ok = r.pick([15, 30, 45, 60, 75, 90, 105, 120, 135, 150]);
          return mcq(r, 'Which angle can be constructed using only a ruler and compasses?', `${ok}°`, some(r, [25, 35, 40, 50, 70, 80, 100, 110], 3).map((x) => `${x}°`),
            ['Start from 60° and 90°, then bisect or add.'], [`${ok}° comes from 60°/90° by bisecting and adding.`]);
        }),
        matchT('how', 'Match each angle with how it is constructed', [
          ['60°', 'Arc from the vertex, then an equal arc from where it meets the arm'], ['30°', 'Bisect 60°'], ['90°', 'Bisect a straight angle (180°)'], ['45°', 'Bisect 90°'], ['120°', 'Two 60° angles side by side'], ['15°', 'Bisect 30°'],
        ], ['Most special angles come from 60° and 90°.']),
        orderT('steps', 'Order the steps to bisect ∠ABC.', [
          'With centre B, draw an arc cutting BA at P and BC at Q', 'With centre P, draw an arc inside the angle', 'With centre Q and the same radius, draw an arc cutting it at R', 'Join BR',
        ], ['The first arc is drawn from the vertex.']),
        tp('scale', (r) => {
          const x = r.int(10, 170);
          return typed(`On a protractor, an arm reads ${x}° on the outer scale. What does it read on the inner scale?`, num(180 - x, '°'), ['The two scales add up to 180°.'], [`180 − ${x} = ${180 - x}°`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 14 UNDERSTANDING 3D AND 2D SHAPES
const SOLIDS: [string, number, number, number][] = [['cube', 6, 8, 12], ['cuboid', 6, 8, 12], ['triangular prism', 5, 6, 9], ['square pyramid', 5, 5, 8], ['triangular pyramid', 4, 4, 6], ['pentagonal prism', 7, 10, 15], ['hexagonal prism', 8, 12, 18], ['pentagonal pyramid', 6, 6, 10]];
const POLY: [string, number][] = [['triangle', 3], ['quadrilateral', 4], ['pentagon', 5], ['hexagon', 6], ['heptagon', 7], ['octagon', 8], ['nonagon', 9], ['decagon', 10]];
const ch14: USpec = {
  id: 'ts6.m.ch14', subject: 'math', title: 'Understanding 3D and 2D Shapes', source: src(14),
  objectives: [
    {
      id: 'ts6.m.solid.fev', title: 'Faces, edges and vertices of 3D shapes',
      intro: [
        h('Solid shapes around us'),
        p('A dice, a brick, a ball and an ice-cream cone are 3D (solid) shapes: they have length, breadth and height. Flat shapes like squares and circles are 2D.'),
        photo('🎲', 'A dice is a cube: 6 square faces, 8 vertices, 12 edges.'),
        def('Face, edge, vertex', 'A face is a flat surface. An edge is where two faces meet. A vertex is a corner where edges meet.'),
        def('Prism and pyramid', 'A prism has two identical end faces joined by rectangles. A pyramid has one base and triangular faces meeting at a top point.'),
        f('F + V − E = 2', 'faces plus vertices minus edges equals two'),
        X({
          title: 'What if? Euler\'s rule', formula: 'E = F + V − 2',
          result: ['E', 'Edges', 'F + V - 2'],
          vars: [['F', 'Faces', 4, 12, 1, 6], ['V', 'Vertices', 4, 20, 1, 8]],
          notes: [['F', 'Each extra face (with the same vertices) needs one more edge.', 'Fewer faces → fewer edges.']],
          mistakes: [['Using F + V + E = 2', 'It is F + V − E = 2. For a cube: 6 + 8 − 12 = 2.']],
          real: 'A cube: 6 faces and 8 vertices, so 6 + 8 − 2 = 12 edges.',
        }),
        keys('Cube and cuboid: F 6, V 8, E 12.', 'Square pyramid: F 5, V 5, E 8.', 'Triangular prism: F 5, V 6, E 9.', 'Sphere, cylinder and cone have curved surfaces.'),
        remember('Euler\'s rule works for solids with flat faces only (not spheres or cylinders).'),
        tip('Count edges of a prism as: edges on top + edges on bottom + upright edges.'),
      ],
      examples: [
        ex('How many edges does a triangular prism have?', ['Top triangle: 3, bottom triangle: 3, uprights: 3.'], '9'),
        ex('A solid has 7 faces and 10 vertices. How many edges?', ['E = F + V − 2 = 7 + 10 − 2.'], '15'),
      ],
      practice: [
        tp('count', (r) => {
          const [s, F, V, E] = r.pick(SOLIDS), [what, ans] = r.pick([['faces', F], ['vertices', V], ['edges', E]] as [string, number][]);
          return typed(`How many ${what} does a ${s} have?`, num(ans), ['Picture the solid and count carefully.', 'Check with F + V − E = 2.'], [`A ${s} has F = ${F}, V = ${V}, E = ${E}.`, `${what}: ${ans}`]);
        }),
        tp('edges', (r) => {
          const [, F, V, E] = r.pick(SOLIDS);
          return typed(`A solid has ${F} faces and ${V} vertices. Use Euler's rule to find the number of edges.`, num(E), ['E = F + V − 2'], [`${F} + ${V} − 2 = ${E}`], [[`${F + V + 2}`, 'Subtract 2, do not add.']]);
        }),
        tp('faces', (r) => {
          const [, F, V, E] = r.pick(SOLIDS);
          return typed(`A solid has ${V} vertices and ${E} edges. How many faces does it have?`, num(F), ['F = E − V + 2'], [`${E} − ${V} + 2 = ${F}`]);
        }, 2),
        matchT('objects', 'Match each object with its shape', [
          ['Dice', 'Cube'], ['Brick', 'Cuboid'], ['Ball', 'Sphere'], ['Water pipe', 'Cylinder'], ['Birthday cap', 'Cone'], ['Pyramids of Egypt', 'Square pyramid'], ['Tent with triangular ends', 'Triangular prism'],
        ], ['Look at the shape of the faces.']),
        bank('curved', [
          { q: 'Which solid has no flat face, no edge and no vertex?', a: 'Sphere', w: ['Cylinder', 'Cone', 'Cube'], h: ['Think of a ball.'], s: ['A sphere has only a curved surface.'] },
          { q: 'How many flat faces does a cylinder have?', a: '2', w: ['1', '0', '3'], h: ['Look at the top and bottom of a tin.'], s: ['Two circular flat faces and one curved surface.'] },
          { q: 'How many vertices does a cone have?', a: '1', w: ['0', '2', '3'], h: ['The pointed tip.'], s: ['The apex is the one vertex.'] },
          { q: 'Which solid has 6 rectangular faces?', a: 'Cuboid', w: ['Cylinder', 'Square pyramid', 'Triangular prism'], h: ['A matchbox.'], s: ['A cuboid has 6 rectangular faces.'] },
          { q: 'The faces of a triangular pyramid are all…', a: 'triangles', w: ['squares', 'circles', 'rectangles'], h: ['It has 4 faces.'], s: ['All 4 faces are triangles.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.solid.nets', title: 'Drawing 3D shapes in 2D: nets and views', prereqs: ['ts6.m.solid.fev'],
      intro: [
        h('Open the box'),
        p('Cut open a sweet box along some edges and lay it flat. The flat pattern is called a net. Fold the net back and you get the box again.'),
        photo('📦', 'A cardboard box opens into a net of 6 rectangles.'),
        def('Net', 'A flat shape that can be folded to make a solid.'),
        def('Views', 'A solid looks different from the top, the front and the side. For a cylinder: top view is a circle, front view is a rectangle.'),
        keys('Net of a cube: 6 squares joined edge to edge (there are 11 different nets).', 'Net of a cylinder: 2 circles and 1 rectangle.', 'Net of a cone: a circle and a curved sector.', 'Net of a square pyramid: 1 square and 4 triangles.'),
        remember('Not every arrangement of 6 squares folds into a cube — two squares must never end up on the same face.'),
        tip('To check a net, imagine folding it in your mind one face at a time.'),
      ],
      examples: [
        ex('What shapes make the net of a triangular prism?', ['Two triangles for the ends.', 'Three rectangles for the sides.'], '2 triangles and 3 rectangles'),
        ex('What is the top view of a cone standing on its base?', ['From above you see the circular base with the tip at the centre.'], 'A circle (with a dot at the centre)'),
      ],
      practice: [
        tp('pieces', (r) => {
          const [s, n, what] = r.pick([['cube', 6, 'squares'], ['square pyramid', 5, 'faces (1 square and 4 triangles)'], ['triangular pyramid', 4, 'triangles'], ['cuboid', 6, 'rectangles'], ['triangular prism', 5, 'faces (2 triangles and 3 rectangles)'], ['hexagonal prism', 8, 'faces (2 hexagons and 6 rectangles)']] as [string, number, string][]);
          return typed(`How many pieces (faces) are in the net of a ${s}?`, num(n), ['A net has one piece for each face.'], [`A ${s} has ${n} faces → ${n} ${what}.`]);
        }),
        tp('faces', (r) => {
          const opts: [string, string][] = [['cube', 'all squares'], ['cuboid', 'all rectangles'], ['triangular pyramid', 'all triangles'], ['square pyramid', 'a square and 4 triangles'], ['triangular prism', '2 triangles and 3 rectangles']];
          const [s, ok] = r.pick(opts);
          return mcq(r, `The faces of a ${s} are…`, ok, opts.filter((o) => o[1] !== ok).map((o) => o[1]), ['Picture the solid and its base.'], [`A ${s}: ${ok}.`]);
        }),
        matchT('views', 'Match each solid with its top view', [
          ['Cylinder standing up', 'Circle'], ['Cube', 'Square'], ['Square pyramid', 'Square with its diagonals'], ['Cone standing on its base', 'Circle with a dot in the centre'], ['Cuboid (brick lying flat)', 'Rectangle'],
        ], ['Imagine looking down from the ceiling.']),
        bank('nets', [
          { q: 'The net of a cylinder has…', a: '2 circles and 1 rectangle', w: ['3 circles', '1 circle and 1 triangle', '6 squares'], h: ['Open a tin can.'], s: ['Two lids and a rolled-out rectangle.'] },
          { q: 'How many squares are in the net of a cube?', a: '6', w: ['4', '8', '12'], h: ['A cube has 6 faces.'], s: ['6 squares.'] },
          { q: 'Can 6 squares in one straight row fold into a cube?', a: 'No', w: ['Yes', 'Only if they are big', 'Only with glue'], h: ['Some faces would overlap.'], s: ['A row of 6 overlaps itself and leaves two faces open.'] },
          { q: 'The front view of a standing cylinder is a…', a: 'rectangle', w: ['circle', 'triangle', 'square with diagonals'], h: ['Look at a glass from the side.'], s: ['From the front it looks like a rectangle.'] },
          { q: 'A net of a cone has a circle and a…', a: 'sector (curved fan shape)', w: ['rectangle', 'square', 'triangle'], h: ['Unroll a birthday cap.'], s: ['The curved surface opens into a sector.'] },
        ]),
        bank('view-q', [
          { q: 'The top view of a ball is a…', a: 'circle', w: ['square', 'triangle', 'rectangle'], h: ['A ball looks round from every side.'], s: ['Circle.'] },
          { q: 'The side view of a cube is a…', a: 'square', w: ['rectangle', 'circle', 'triangle'], h: ['All faces of a cube are squares.'], s: ['Square.'] },
          { q: 'The front view of a square pyramid is a…', a: 'triangle', w: ['square', 'circle', 'rectangle'], h: ['Think of the Pyramids of Egypt from the front.'], s: ['Triangle.'] },
          { q: 'A shape is a circle from the top and a triangle from the front. It is a…', a: 'cone', w: ['cylinder', 'sphere', 'cube'], h: ['Which solid has a pointed top and round base?'], s: ['A cone.'] },
          { q: 'A shape is a circle from the top and a rectangle from the front. It is a…', a: 'cylinder', w: ['cone', 'sphere', 'pyramid'], h: ['Think of a tin can.'], s: ['A cylinder.'] },
        ]),
      ],
    },
    {
      id: 'ts6.m.solid.poly', title: 'Polygons', prereqs: ['ts6.m.solid.fev'],
      intro: [
        h('Closed figures made of segments'),
        p('A polygon is a simple closed figure made only of line segments. Triangles, quadrilaterals, pentagons and hexagons are polygons; a circle is not, because it is curved.'),
        vis({ kind: 'shape', shape: 'pentagon', color: '#3f51b5' }, 'A pentagon has 5 sides, 5 vertices and 5 angles.'),
        def('Regular polygon', 'A polygon with all sides equal and all angles equal, like a square or an equilateral triangle.'),
        def('Diagonal', 'A segment joining two vertices that are not next to each other.'),
        f('Number of diagonals = n × (n − 3) ÷ 2', 'number of diagonals equals n times n minus three, divided by two'),
        X({
          title: 'What if? Diagonals of a polygon', formula: 'D = n(n − 3) ÷ 2',
          result: ['D', 'Diagonals', 'n*(n - 3)/2'],
          vars: [['n', 'Number of sides', 3, 20, 1, 6]],
          notes: [['n', 'Each new vertex can join to many more vertices, so diagonals grow fast.', 'Fewer sides, far fewer diagonals; a triangle has none.']],
          mistakes: [['n × (n − 3) without halving', 'Each diagonal is counted from both of its ends, so divide by 2.']],
          real: 'A hexagonal table has 6 × 3 ÷ 2 = 9 diagonals.',
        }),
        keys('Polygon with n sides has n vertices and n angles.', 'From one vertex, n − 3 diagonals can be drawn, cutting the polygon into n − 2 triangles.', 'Names: 5 pentagon, 6 hexagon, 7 heptagon, 8 octagon, 9 nonagon, 10 decagon.'),
        remember('A triangle has no diagonals.'),
        tip('Count diagonals from one vertex (n − 3), multiply by n, then halve.'),
      ],
      examples: [
        ex('How many diagonals does an octagon have?', ['n = 8: 8 × 5 ÷ 2.'], '20'),
        ex('Is a circle a polygon?', ['A polygon is made only of line segments.', 'A circle is curved.'], 'No'),
      ],
      practice: [
        tp('sides', (r) => {
          const [s, n] = r.pick(POLY);
          return typed(`How many sides does a ${s} have?`, num(n), ['Use the name: tri 3, quad 4, penta 5, hexa 6, hepta 7, octa 8, nona 9, deca 10.'], [`A ${s} has ${n} sides.`]);
        }),
        tp('name', (r) => {
          const [s, n] = r.pick(POLY);
          return mcq(r, `What is a polygon with ${n} sides called?`, s, POLY.filter((x) => x[1] !== n).map((x) => x[0]).slice(n % 3, n % 3 + 3), ['Think of the number words: penta 5, hexa 6, octa 8.'], [`${n} sides → ${s}`]);
        }),
        tp('diag', (r) => {
          const n = r.int(4, 12);
          return typed(`How many diagonals does a polygon with ${n} sides have?`, num((n * (n - 3)) / 2), ['From each vertex: n − 3 diagonals.', 'Multiply by n and halve.'], [`${n} × ${n - 3} ÷ 2 = ${(n * (n - 3)) / 2}`], [[`${n * (n - 3)}`, 'Each diagonal was counted twice — divide by 2.']]);
        }),
        tp('triangles', (r) => {
          const [s, n] = r.pick(POLY.slice(1));
          return typed(`All diagonals are drawn from ONE vertex of a ${s}. Into how many triangles is it divided?`, num(n - 2), ['From one vertex we can draw n − 3 diagonals.', 'They make n − 2 triangles.'], [`${n} − 2 = ${n - 2} triangles`]);
        }),
        bank('facts', [
          { q: 'Which of these is NOT a polygon?', a: 'Circle', w: ['Triangle', 'Hexagon', 'Square'], h: ['Polygons have only straight sides.'], s: ['A circle is curved.'] },
          { q: 'A regular polygon has…', a: 'all sides and all angles equal', w: ['only sides equal', 'only angles equal', 'no equal sides'], h: ['Think of a square.'], s: ['Both sides and angles are equal.'] },
          { q: 'Is a rectangle (not a square) a regular polygon?', a: 'No — its sides are not all equal', w: ['Yes — its angles are equal', 'Yes — it has 4 sides', 'Only if it is big'], h: ['Check sides AND angles.'], s: ['Angles are equal but sides are not.'] },
          { q: 'How many diagonals does a triangle have?', a: '0', w: ['1', '3', '2'], h: ['Every vertex is next to the other two.'], s: ['No diagonals.'] },
          { q: 'A polygon with the fewest possible sides is a…', a: 'triangle', w: ['quadrilateral', 'line', 'pentagon'], h: ['Can 2 segments close a shape?'], s: ['You need at least 3 sides.'] },
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14];
