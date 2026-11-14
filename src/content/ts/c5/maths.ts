// Telangana SCERT Class 5 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts5.m.ch<n>); objectives ts5.m.<topic>.<skill>.
// Written for a 10-year-old: short sentences, Telangana contexts, pictures. Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, f, vis, def, keys, photo, explore, L, num, frac, choose, chooseNum, tapAll,
  lcm, NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { Block, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(5, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
/** Indian digit grouping: 123456 → 1,23,456 */
const c = (n: number) => n.toLocaleString('en-IN');
const em = (t: string): VisualSpec => ({ kind: 'emoji', text: t });
const pad = (m: number) => (m < 10 ? `0${m}` : `${m}`);
const hm = (hh: number, mm: number) => `${hh}:${pad(mm)}`;

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
interface MC { q: string; a: string; w: string[]; h: string[]; s: string[]; why?: string; v?: VisualSpec; pic?: [string, string[]] }
/** a template that draws one question from a bank (bank needs >= 5 entries) */
const bank = (key: string, list: MC[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const it = r.pick(list);
  const ch = it.pic ? choose(r, it.a, it.w, 4, { correct: em(it.pic[0]), wrong: it.pic[1].map(em) }) : choose(r, it.a, it.w);
  const q: QSpec = { type: 'mcq', prompt: it.q, ...ch, hints: it.h, solution: it.s, ...mk(it.why ? [['wrong', it.why]] : []) };
  if (it.v) q.visual = it.v;
  return q;
}, d);
interface QA { q: string; a: number; h: string[]; s: string[]; w?: [string, string] }
/** typed-number questions from a bank */
const qaBank = (key: string, list: QA[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const it = r.pick(list);
  return typed(it.q, num(it.a), it.h, it.s, it.w ? [it.w] : []);
}, d);
/** tap-all-that-apply from a list of [label, correct] (needs >= 3 of each kind) */
const tapT = (key: string, prompt: string, items: [string, boolean][], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const k = r.int(2, 3);
  const yes = r.shuffle(items.filter((i) => i[1])).slice(0, k);
  const no = r.shuffle(items.filter((i) => !i[1])).slice(0, 5 - k);
  return {
    type: 'tap', prompt, ...tapAll(r, [...yes, ...no].map(([label, ok]) => ({ label, ok }))), hints,
    solution: [`Correct: ${yes.map((y) => y[0]).join(', ')}.`, `Not correct: ${no.map((n) => n[0]).join(', ')}.`],
  };
}, d);
type Var = [sym: string, name: string, min: number, max: number, step: number, value: number, unit?: string];
interface XS {
  title: string; formula: string;
  result: [sym: string, name: string, expr: string, unit?: string];
  vars: Var[]; notes: [sym: string, up: string, down: string][]; mistakes: [wrong: string, why: string][]; real: string;
}
/** "What if?" explorer block from compact arrays. */
const X = (s: XS): Block => {
  const [rs, rn, re, ru] = s.result;
  return explore({
    title: L(s.title), formula: s.formula,
    result: ru ? { sym: rs, name: L(rn), expr: re, unit: ru, decimals: 0 } : { sym: rs, name: L(rn), expr: re, decimals: 0 },
    vars: s.vars.map(([sym, name, min, max, step, value, unit]) => (unit ? { sym, name: L(name), min, max, step, value, unit } : { sym, name: L(name), min, max, step, value })),
    notes: s.notes.map(([sym, up, down]) => ({ sym, up: L(up), down: L(down) })),
    mistakes: s.mistakes.map(([wrong, why]) => ({ wrong: L(wrong), why: L(why) })),
    realWorld: L(s.real),
  });
};

// ================================================================== CH 1 BIGGER NUMBERS
const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'lakhs'];
const ch1: USpec = {
  id: 'ts5.m.ch1', subject: 'math', title: 'Bigger Numbers', source: src(1),
  objectives: [
    {
      id: 'ts5.m.bignum.place', title: 'Reading, place value and comparing big numbers',
      intro: [
        h('Numbers can grow very big!'),
        p('At the Medaram jatara, lakhs of people come to pray. How do we read such big numbers? We use places.'),
        p('In India we put commas like this: 1,00,000. This number is called one lakh. It is 100 thousands.'),
        vis({ kind: 'emoji', text: 'L | TTh | Th | H | T | O' }, 'The places from left to right: lakhs, ten thousands, thousands, hundreds, tens, ones'),
        def('Place value', 'The value a digit gets from its place. In 3,52,416 the 5 is in the ten thousands place, so its value is 50,000.'),
        p('Read 3,52,416 as: three lakh fifty-two thousand four hundred sixteen.'),
        h('Which is bigger?'),
        p('First count the digits. More digits means a bigger number. If both have the same number of digits, compare from the LEFT, one place at a time.'),
        photo('🧮', 'An abacus shows each place on its own rod. More beads on the left rod means a much bigger number.'),
        keys('1 lakh = 1,00,000 = 100 thousands.', 'Place value = digit × value of its place.', 'Compare big numbers from the left.'),
        tip('The digit alone is the face value. The place gives it its real value.'),
      ],
      examples: [
        ex('What is the place value of 7 in 4,73,215?', ['Find the place of 7: it is in the ten thousands place.', 'Value = 7 × 10,000 = 70,000.'], '70,000'),
        ex('Which is bigger: 2,45,890 or 2,54,098?', ['Both have 6 digits.', 'Lakhs: 2 and 2 — same.', 'Ten thousands: 4 and 5 — 5 is bigger.'], '2,54,098 is bigger'),
        ex('Write 5 lakh 6 thousand 30 as a number.', ['5 lakh = 5,00,000', '6 thousand = 6,000', '5,00,000 + 6,000 + 30 = 5,06,030'], '5,06,030'),
      ],
      practice: [
        tp('place', (r) => {
          const n = r.int(10000, 999999), s = String(n);
          let pos = r.int(0, s.length - 2);
          while (s[pos] === '0') pos = (pos + 1) % (s.length - 1);
          const pw = s.length - 1 - pos, dg = +s[pos], v = dg * 10 ** pw;
          return typed(`What is the place value of the digit ${dg} in the ${PLACES[pw]} place of ${c(n)}?`, num(v),
            [`The digit is ${dg}. Its place is ${PLACES[pw]}.`, `One ${PLACES[pw].replace(/s$/, '')} is worth ${c(10 ** pw)}.`, `Multiply: ${dg} × ${c(10 ** pw)}.`],
            [`${dg} is in the ${PLACES[pw]} place.`, `${dg} × ${c(10 ** pw)} = ${c(v)}`],
            [[String(dg), 'That is the face value (just the digit). Multiply it by the value of its place.']]);
        }),
        tp('build', (r) => {
          const a = r.int(1, 9), b = r.int(0, 99), cc = r.int(0, 999), n = a * 100000 + b * 1000 + cc;
          return typed(`Write as a number: ${a} lakh ${b} thousand ${cc}.`, num(n),
            [`${a} lakh = ${c(a * 100000)}.`, `${b} thousand = ${c(b * 1000)}.`, 'Add all the parts.'],
            [`${c(a * 100000)} + ${c(b * 1000)} + ${cc} = ${c(n)}`],
            [[String(a * 1000 + b * 1000 + cc), 'One lakh is 1,00,000 (100 thousands), not 1,000.']]);
        }),
        tp('compare', (r) => {
          const a = r.int(100000, 999999);
          const s = String(a).split('');
          const i = r.int(1, 4);
          s[i] = String((+s[i] + r.int(1, 8)) % 10);
          const b = +s.join('');
          const big = Math.max(a, b);
          return mcq(r, `Which number is bigger: ${c(a)} or ${c(b)}?`, c(big), [c(Math.min(a, b)), 'Both are equal'],
            ['Both have 6 digits.', 'Compare digits from the left.', 'Find the first place where the digits are different.'],
            [`The first different digit is in the ${PLACES[5 - i]} place.`, `${c(big)} has the bigger digit there, so it is bigger.`]);
        }),
      ],
    },
    {
      id: 'ts5.m.bignum.addsub', title: 'Adding, subtracting and estimating big numbers', prereqs: ['ts5.m.bignum.place'],
      intro: [
        h('Add and subtract place by place'),
        p('Write the numbers one below the other. Ones under ones, tens under tens. Start adding from the ones place.'),
        p('If a place adds up to 10 or more, carry 1 to the next place. When subtracting, borrow from the next place if you need to.'),
        f('35,846 + 22,519 = 58,365'),
        h('Estimate first'),
        p('Rounding gives a quick guess. To round to the nearest thousand, look at the hundreds digit: 5 or more → round up; less than 5 → round down.'),
        photo('🚌', 'TSRTC buses carry thousands of people to the jatara every day. Officers estimate the crowd before counting exactly.'),
        keys('Line up the places.', 'Carry when a place adds to 10 or more.', 'Estimate to check if your answer makes sense.'),
        tip('After subtracting, check by adding: answer + smaller number = bigger number.'),
      ],
      examples: [
        ex('On day 1, 48,275 people visited a fair. On day 2, 36,950 came. How many in all?', ['48,275 + 36,950', 'Ones 5+0=5; tens 7+5=12, write 2 carry 1; hundreds 2+9+1=12, write 2 carry 1; thousands 8+6+1=15, write 5 carry 1; ten thousands 4+3+1=8.'], '85,225 people'),
        ex('Estimate 23,780 + 41,210 to the nearest thousand.', ['23,780 → 24,000 (hundreds digit 7)', '41,210 → 41,000 (hundreds digit 2)', '24,000 + 41,000 = 65,000'], 'About 65,000'),
      ],
      practice: [
        tp('add', (r) => {
          const a = r.int(12000, 59999), b = r.int(10000, 39999), who = r.pick(['Medaram jatara', 'Numaish exhibition in Hyderabad', 'Sammakka-Saralamma temple', 'book fair']);
          return typed(`On Saturday ${c(a)} people visited the ${who}. On Sunday ${c(b)} people visited. How many visited in all?`, num(a + b),
            ['Add the two numbers.', 'Line up ones under ones.', 'Remember to carry.'],
            [`${c(a)} + ${c(b)} = ${c(a + b)}`], [[String(Math.abs(a - b)), 'You subtracted. "In all" means add.']]);
        }),
        tp('sub', (r) => {
          const a = r.int(30000, 89999), b = r.int(10000, a - 1000), x = nm(r), y = nm(r);
          return typed(`In a school election-style quiz, ${x}'s team got ${c(a)} points and ${y}'s team got ${c(b)} points. How many more points did ${x}'s team get?`, num(a - b),
            ['"How many more" means subtract.', 'Bigger number minus smaller number.', 'Borrow when the top digit is smaller.'],
            [`${c(a)} − ${c(b)} = ${c(a - b)}`], [[String(a + b), 'You added. "How many more" asks for the difference.']]);
        }),
        tp('estimate', (r) => {
          const a = r.int(11, 79) * 1000 + r.int(0, 999), b = r.int(11, 79) * 1000 + r.int(0, 999);
          const ra = Math.round(a / 1000) * 1000, rb = Math.round(b / 1000) * 1000;
          return {
            type: 'mcq', prompt: `Estimate ${c(a)} + ${c(b)} by rounding each number to the nearest thousand.`,
            ...chooseNum(r, ra + rb, [a + b, ra + rb + 1000, ra + rb - 1000], c),
            hints: ['Round each number first.', 'Look at the hundreds digit: 5 or more rounds up.', 'Then add the rounded numbers.'],
            solution: [`${c(a)} ≈ ${c(ra)}`, `${c(b)} ≈ ${c(rb)}`, `${c(ra)} + ${c(rb)} = ${c(ra + rb)}`],
          };
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 2 MULTIPLY AND DIVIDE
const ch2: USpec = {
  id: 'ts5.m.ch2', subject: 'math', title: 'Multiply and Divide', source: src(2),
  objectives: [
    {
      id: 'ts5.m.muldiv.mul', title: 'Multiplying in shopping and ticket problems',
      intro: [
        h('Multiplication is fast adding'),
        p('A ticket for a Bathukamma cultural show costs ₹45. If 23 people buy tickets, we do not add 45 twenty-three times. We multiply: 45 × 23.'),
        p('Break the second number into tens and ones: 45 × 20 = 900 and 45 × 3 = 135. Add them: 900 + 135 = 1,035.'),
        f('45 × 23 = 45 × 20 + 45 × 3 = 900 + 135 = 1,035'),
        h('Estimate the product'),
        p('Round both numbers to the nearest ten, then multiply. 48 × 23 is about 50 × 20 = 1,000.'),
        photo('🛒', 'At the kirana shop: 12 soaps at ₹35 each cost 12 × 35 = ₹420.'),
        X({
          title: 'What if? Total cost of tickets', formula: 'Total = number of tickets × price',
          result: ['T', 'Total cost', 'n * p', '₹'],
          vars: [['n', 'Number of tickets', 1, 50, 1, 10], ['p', 'Price of one ticket', 5, 100, 5, 20, '₹']],
          notes: [['n', 'More tickets means more money to pay.', 'Fewer tickets cost less.'], ['p', 'If each ticket costs more, the total goes up.', 'Cheaper tickets make the total smaller.']],
          mistakes: [['Adding the price and the number of tickets', 'Each ticket costs the price, so we multiply, not add.']],
          real: 'Teachers use this to collect money for a school trip to the zoo.',
        }),
        keys('Multiply = repeated adding.', 'Split into tens and ones, then add the parts.', 'Estimate to check.'),
        tip('When the price rises, first find the new price of one, then multiply.'),
      ],
      examples: [
        ex('A bus ticket costs ₹28. How much for 34 children?', ['28 × 30 = 840', '28 × 4 = 112', '840 + 112 = 952'], '₹952'),
        ex('A pen cost ₹12 last year. Now it costs ₹3 more. What do 15 pens cost now?', ['New price = 12 + 3 = ₹15', '15 × 15 = 225'], '₹225'),
      ],
      practice: [
        tp('tickets', (r) => {
          const pr = r.int(15, 95), n = r.int(12, 49), what = r.pick(['zoo', 'Bathukamma cultural show', 'Golkonda light show', 'puppet show', 'science fair']);
          return typed(`A ticket for the ${what} costs ₹${pr}. ${n} children buy tickets. How much money is that?`, num(pr * n, '₹'),
            ['Multiply the price by the number of tickets.', `Split ${n} into ${Math.floor(n / 10) * 10} + ${n % 10}.`, `${pr} × ${Math.floor(n / 10) * 10} = ${pr * Math.floor(n / 10) * 10}`],
            [`${pr} × ${n} = ${pr * n}`, `Total = ₹${c(pr * n)}`], [[String(pr + n), 'You added. Each ticket costs ₹' + pr + ', so multiply.']]);
        }),
        tp('rise', (r) => {
          const old = r.int(8, 40), up = r.int(2, 9), n = r.int(5, 20), thing = r.pick(['notebook', 'packet of biscuits', 'pencil box', 'kg of tomatoes', 'litre of milk']);
          return typed(`A ${thing} cost ₹${old} last year. Now the price has gone up by ₹${up}. How much do ${n} of them cost now?`, num((old + up) * n, '₹'),
            ['First find the new price of one.', `New price = ${old} + ${up}.`, 'Then multiply by the number of items.'],
            [`New price = ₹${old + up}`, `${old + up} × ${n} = ₹${(old + up) * n}`],
            [[String(old * n + up), 'The price went up for EACH item, not just once.'], [String(old * n), 'Use the NEW price, not the old one.']], { unitHint: '₹' });
        }, 2),
        tp('estimate', (r) => {
          let a = r.int(11, 98), b = r.int(11, 98);
          if (a % 10 === 5) a += 1;
          if (b % 10 === 5) b += 1;
          const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
          return {
            type: 'mcq', prompt: `Estimate ${a} × ${b} by rounding both numbers to the nearest ten.`,
            ...chooseNum(r, ra * rb, [a * b, ra * rb + 100, ra * rb - 100], c),
            hints: ['Round each number to the nearest ten.', `${a} → ${ra}, ${b} → ${rb}`, 'Now multiply the rounded numbers.'],
            solution: [`${a} ≈ ${ra}, ${b} ≈ ${rb}`, `${ra} × ${rb} = ${c(ra * rb)}`],
          };
        }, 2),
      ],
    },
    {
      id: 'ts5.m.muldiv.div', title: 'Dividing with quotient and remainder', prereqs: ['ts5.m.muldiv.mul'],
      intro: [
        h('Sharing equally'),
        p('Amma made 50 laddoos. She packs 6 in each box. How many full boxes? 6 × 8 = 48, so 8 full boxes. 2 laddoos are left over.'),
        vis({ kind: 'objects', emoji: '🟠', count: 50, groupsOf: 6 }, '50 laddoos in groups of 6: 8 groups and 2 left'),
        def('Quotient', 'How many equal groups we get.'),
        def('Remainder', 'What is left over. It is always smaller than the divisor.'),
        f('50 ÷ 6 = 8, remainder 2  (check: 6 × 8 + 2 = 50)'),
        tip('Sometimes the leftover still needs a place! 45 children and 40 seats in a bus need 2 buses.'),
        keys('Dividend = divisor × quotient + remainder.', 'Remainder < divisor.'),
      ],
      examples: [
        ex('Divide 157 by 5.', ['5 × 30 = 150', '157 − 150 = 7, and 5 goes into 7 once: 5 × 31 = 155', '157 − 155 = 2'], 'Quotient 31, remainder 2'),
        ex('130 children go on a trip. Each bus holds 40. How many buses?', ['130 ÷ 40 = 3 remainder 10', '10 children still need a seat, so one more bus.'], '4 buses'),
      ],
      practice: [
        tp('quot', (r) => {
          const d = r.int(3, 9), q = r.int(12, 60), rem = r.int(0, d - 1), n = d * q + rem;
          return typed(`${n} mangoes are packed in baskets of ${d}. How many FULL baskets are there?`, num(q),
            [`How many ${d}s fit into ${n}?`, `Try ${d} × ${Math.floor(q / 10) * 10} = ${d * Math.floor(q / 10) * 10}.`, 'The leftover mangoes do not make a full basket.'],
            [`${n} ÷ ${d} = ${q} remainder ${rem}`, `${q} full baskets`], [[String(q + 1), 'The last basket is not full, so do not count it.']]);
        }),
        tp('rem', (r) => {
          const d = r.int(3, 9), q = r.int(10, 40), rem = r.int(1, d - 1), n = d * q + rem;
          return typed(`${n} flowers are tied into bunches of ${d} for Bathukamma. How many flowers are left over?`, num(rem),
            [`Find the biggest multiple of ${d} that is not more than ${n}.`, `${d} × ${q} = ${d * q}`, `Left over = ${n} − ${d * q}.`],
            [`${d} × ${q} = ${d * q}`, `${n} − ${d * q} = ${rem}`], [[String(q), 'That is the number of bunches (quotient). The question asks what is left over.']]);
        }),
        tp('buses', (r) => {
          const cap = r.pick([30, 35, 40, 45, 50]), k = r.int(2, 6), extra = r.int(1, cap - 1), n = cap * k + extra;
          return typed(`${n} students are going to Golkonda Fort. Each bus can carry ${cap} students. How many buses are needed?`, num(k + 1),
            [`${n} ÷ ${cap} = ?`, `${k} buses carry ${cap * k} students.`, `${extra} students are still waiting!`],
            [`${n} ÷ ${cap} = ${k} remainder ${extra}`, `${extra} more students need one more bus: ${k + 1} buses`], [[String(k), `${extra} students would be left behind. They need one more bus.`]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 3 SMART TABLES
const tallyStr = (n: number) => [...Array(Math.floor(n / 5)).fill('||||/'), ...(n % 5 ? ['|'.repeat(n % 5)] : [])].join('  ');
const ch3: USpec = {
  id: 'ts5.m.ch3', subject: 'math', title: 'Smart Tables', source: src(3),
  objectives: [
    {
      id: 'ts5.m.tables.tally', title: 'Counting with tally marks',
      intro: [
        h('Tally marks help us count quickly'),
        p('Our class is voting for a favourite fruit. For each vote we draw one line: |'),
        p('After four lines, the fifth line goes ACROSS them, like a gate: ||||/  — that is 5. Then we start a new gate.'),
        vis({ kind: 'emoji', text: '||||/  ||||/  |||' }, 'Two gates and three lines: 5 + 5 + 3 = 13'),
        p('To count, count the gates in fives (5, 10, 15 …) and then add the single lines.'),
        photo('📝', 'Tally marks are used to count votes, runs in a cricket match and even birds seen in a park.'),
        keys('One line = 1.', 'A gate ||||/ = 5.', 'Count gates by fives, then add the extra lines.'),
        tip('Making gates of 5 makes counting much faster than counting every line.'),
      ],
      examples: [
        ex('Count: ||||/  ||||/  ||||/  ||', ['3 gates = 5 + 5 + 5 = 15', '2 more lines', '15 + 2 = 17'], '17'),
        ex('Show 9 using tally marks.', ['9 = 5 + 4', 'One gate and four lines'], '||||/  ||||'),
      ],
      practice: [
        tp('count', (r) => {
          const n = r.int(6, 29), g = Math.floor(n / 5);
          return typed(`Count the tally marks: ${tallyStr(n)}`, num(n),
            ['Each gate ||||/ is 5.', `There are ${g} gates. Count 5, 10, 15 …`, 'Add the extra single lines.'],
            [`${g} gates = ${g * 5}`, `${n % 5} more lines`, `${g * 5} + ${n % 5} = ${n}`],
            [[String(g * 4 + (n % 5)), 'A gate has 5 lines — four standing and one across.']]);
        }),
        tp('show', (r) => {
          const n = r.int(7, 24);
          return mcq(r, `Which tally marks show ${n}?`, tallyStr(n), [tallyStr(n + 1), tallyStr(n - 1), tallyStr(n + 5)],
            [`${n} = ${Math.floor(n / 5)} fives and ${n % 5} more.`, 'Count the gates first.', 'Then count the single lines.'],
            [`${n} = ${Math.floor(n / 5) * 5} + ${n % 5}`, tallyStr(n)]);
        }),
        tp('fruit', (r) => {
          const fruits = r.shuffle(['Mango', 'Banana', 'Guava', 'Jamun', 'Sitaphal']).slice(0, 3);
          const counts = fruits.map(() => r.int(4, 16));
          const lines = fruits.map((x, i) => `${x}: ${tallyStr(counts[i])}`).join(';  ');
          const i = r.int(0, 2);
          return typed(`Votes for favourite fruit — ${lines}. How many children voted for ${fruits[i]}?`, num(counts[i]),
            [`Look only at the ${fruits[i]} row.`, 'Count the gates by fives.', 'Add the single lines.'],
            [`${fruits[i]}: ${tallyStr(counts[i])} = ${counts[i]}`]);
        }),
      ],
    },
    {
      id: 'ts5.m.tables.read', title: 'Reading tables and bar graphs', prereqs: ['ts5.m.tables.tally'],
      intro: [
        h('Tables keep information neat'),
        p('A health worker at a village camp writes how many children got their vaccine each day. A table puts the days in one column and the numbers in another.'),
        p('A bar graph shows the same table as bars. A taller bar means a bigger number.'),
        vis({ kind: 'bar-graph', labels: ['Mon', 'Tue', 'Wed', 'Thu'], values: [12, 18, 9, 15], unit: 'children' }, 'Children vaccinated each day: Mon 12, Tue 18, Wed 9, Thu 15'),
        p('From this graph: most children came on Tuesday. 18 − 9 = 9 more came on Tuesday than on Wednesday. In all, 12 + 18 + 9 + 15 = 54.'),
        photo('🧑‍⚕️', 'Health workers keep tables of vaccines so no child is missed.'),
        keys('Read the label, then the number.', '"How many more" → subtract.', '"In all / total" → add.'),
        tip('Always read the title and the units of a table first.'),
      ],
      examples: [
        ex('Rainy days — June 8, July 14, August 12. Which month had the most rainy days?', ['Compare 8, 14 and 12.', '14 is the biggest.'], 'July', { kind: 'bar-graph', labels: ['Jun', 'Jul', 'Aug'], values: [8, 14, 12], unit: 'days' }),
        ex('Using the same table, how many rainy days in all?', ['8 + 14 + 12'], '34 days'),
      ],
      practice: [
        tp('most', (r) => {
          const labels = r.shuffle(['Paddy', 'Cotton', 'Maize', 'Red gram', 'Jowar']).slice(0, 4);
          const values = r.shuffle([20, 35, 45, 25, 30, 40, 15]).slice(0, 4);
          const big = labels[values.indexOf(Math.max(...values))];
          return mcq(r, 'The bar graph shows bags of crop sold by a village. Which crop sold the MOST bags?', big, labels.filter((x) => x !== big),
            ['Find the tallest bar.', 'Read the label under it.'], [`The tallest bar is ${big} with ${Math.max(...values)} bags.`], [],
            { visual: { kind: 'bar-graph', labels, values, unit: 'bags' } });
        }),
        tp('diff', (r) => {
          const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
          const values = labels.map(() => r.int(5, 30));
          let i = r.int(0, 4), j = r.int(0, 4);
          while (values[i] === values[j]) { j = (j + 1) % 5; if (j === i) { values[j] += 3; } }
          if (values[i] < values[j]) [i, j] = [j, i];
          return typed(`The bar graph shows children vaccinated at a health camp. How many more children came on ${labels[i]} than on ${labels[j]}?`, num(values[i] - values[j]),
            [`${labels[i]}: ${values[i]}.`, `${labels[j]}: ${values[j]}.`, 'Subtract the smaller from the bigger.'],
            [`${values[i]} − ${values[j]} = ${values[i] - values[j]}`], [[String(values[i] + values[j]), '"How many more" means subtract.']],
            { visual: { kind: 'bar-graph', labels, values, unit: 'children' } });
        }),
        tp('total', (r) => {
          const labels = ['Week 1', 'Week 2', 'Week 3'];
          const values = labels.map(() => r.int(10, 60));
          const t = values.reduce((a, b) => a + b, 0);
          return typed('A school garden table shows kilograms of tomatoes picked each week. How many kilograms in all?', num(t, 'kg'),
            ['"In all" means add.', `Add ${values.join(', ')}.`], [`${values.join(' + ')} = ${t} kg`], [],
            { visual: { kind: 'bar-graph', labels, values, unit: 'kg' } });
        }),
      ],
    },
  ],
};

// ================================================================== CH 4 LENGTHS
const ch4: USpec = {
  id: 'ts5.m.ch4', subject: 'math', title: 'Smaller Lengths - Bigger Lengths', source: src(4),
  objectives: [
    {
      id: 'ts5.m.len.units', title: 'Units of length: mm, cm, m and km',
      intro: [
        h('Small things, big distances'),
        p('An ant is a few millimetres long. A pencil is about 15 centimetres. A classroom is a few metres wide. Hyderabad to Warangal is about 150 kilometres.'),
        f('1 cm = 10 mm,  1 m = 100 cm,  1 km = 1000 m'),
        photo('📏', 'On a ruler, the tiny lines between two numbers are millimetres. Ten of them make one centimetre.'),
        p('To change a BIG unit into a SMALL unit, multiply. 3 m = 3 × 100 = 300 cm.'),
        keys('mm for tiny things, cm for small things, m for rooms and ropes, km for roads.', 'Big unit → small unit: multiply.'),
        tip('2 m 35 cm = 200 cm + 35 cm = 235 cm.'),
      ],
      examples: [
        ex('How many centimetres in 4 m 20 cm?', ['4 m = 400 cm', '400 + 20 = 420'], '420 cm'),
        ex('Which unit would you use for the distance from Karimnagar to Hyderabad?', ['It is a long road distance.'], 'km'),
      ],
      practice: [
        tp('convert', (r) => {
          const kind = r.int(0, 3);
          if (kind === 0) { const m = r.int(2, 9), cm = r.int(5, 95); return typed(`How many centimetres are in ${m} m ${cm} cm?`, num(m * 100 + cm, 'cm'), ['1 m = 100 cm.', `${m} m = ${m * 100} cm.`, `Add ${cm} cm.`], [`${m * 100} + ${cm} = ${m * 100 + cm} cm`], [[String(m * 10 + cm), '1 m is 100 cm, not 10 cm.']]); }
          if (kind === 1) { const km = r.int(2, 9); return typed(`How many metres are in ${km} km?`, num(km * 1000, 'm'), ['1 km = 1000 m.', `Multiply ${km} by 1000.`], [`${km} × 1000 = ${km * 1000} m`], [[String(km * 100), '1 km is 1000 m, not 100 m.']]); }
          if (kind === 2) { const cm = r.int(2, 19); return typed(`How many millimetres are in ${cm} cm?`, num(cm * 10, 'mm'), ['1 cm = 10 mm.', `Multiply ${cm} by 10.`], [`${cm} × 10 = ${cm * 10} mm`], [[String(cm * 100), '1 cm is 10 mm.']]); }
          const km = r.int(1, 5), m = r.int(50, 950); return typed(`How many metres are in ${km} km ${m} m?`, num(km * 1000 + m, 'm'), ['1 km = 1000 m.', `${km} km = ${km * 1000} m.`, `Add ${m} m.`], [`${km * 1000} + ${m} = ${km * 1000 + m} m`]);
        }),
        bank('unit', [
          { q: 'Which unit is best for the length of an ant?', a: 'mm', w: ['km', 'm', 'cm'], h: ['An ant is very, very small.', 'Use the smallest unit.'], s: ['An ant is a few millimetres long.'], v: em('🐜') },
          { q: 'Which unit is best for the distance from Hyderabad to Warangal?', a: 'km', w: ['mm', 'cm', 'm'], h: ['It is a long journey by bus.', 'Use the biggest unit.'], s: ['Long road distances are in kilometres.'], v: em('🚌') },
          { q: 'Which unit is best for the length of a pencil?', a: 'cm', w: ['km', 'm', 'mm'], h: ['A pencil fits in your hand.', 'Look at your ruler.'], s: ['A pencil is about 15 cm long.'], v: em('✏️') },
          { q: 'Which unit is best for the length of a saree?', a: 'm', w: ['km', 'mm', 'cm'], h: ['A saree is longer than you.', 'Cloth is sold by this unit.'], s: ['A saree is about 5 to 6 metres long.'] },
          { q: 'Which unit is best for the thickness of a ₹1 coin?', a: 'mm', w: ['km', 'm', 'cm'], h: ['A coin is very thin.', 'Use the smallest unit.'], s: ['A coin is only about 1 to 2 mm thick.'], v: em('🪙') },
          { q: 'Which unit is best for the height of a classroom door?', a: 'm', w: ['km', 'mm', 'cm'], h: ['A door is a little taller than a grown-up.'], s: ['A door is about 2 metres tall.'], v: em('🚪') },
        ]),
      ],
    },
    {
      id: 'ts5.m.len.problems', title: 'Heights in feet and inches, and length word problems', prereqs: ['ts5.m.len.units'],
      intro: [
        h('Feet and inches'),
        p('Doctors and tailors sometimes measure height in feet and inches.'),
        f('1 foot = 12 inches'),
        p('Meena is 4 feet 3 inches tall. In inches: 4 × 12 = 48, and 48 + 3 = 51 inches.'),
        h('Word problems'),
        p('Read slowly. Are we putting lengths together (add) or finding a difference (subtract)? Make the units the same first!'),
        photo('📏', 'A tailor uses a measuring tape to measure in inches and centimetres.'),
        keys('1 foot = 12 inches.', 'Same units before adding or subtracting.'),
        tip('Write your answer with its unit: cm, m, km or inches.'),
      ],
      examples: [
        ex('Teja is 132 cm tall. His sister is 118 cm. How much taller is Teja?', ['132 − 118 = 14'], '14 cm'),
        ex('Kiran walks 650 m to the bus stop and the bus goes 3 km to school. How far in metres?', ['3 km = 3000 m', '3000 + 650 = 3650'], '3650 m'),
      ],
      practice: [
        tp('feet', (r) => {
          const ft = r.int(3, 5), inch = r.int(1, 11), x = nm(r);
          return typed(`${x} is ${ft} feet ${inch} inches tall. What is ${x}'s height in inches?`, num(ft * 12 + inch),
            ['1 foot = 12 inches.', `${ft} feet = ${ft} × 12.`, `Then add ${inch} inches.`],
            [`${ft} × 12 = ${ft * 12}`, `${ft * 12} + ${inch} = ${ft * 12 + inch} inches`], [[`${ft}${inch}`, `${ft} feet is not ${ft}0 inches. One foot is 12 inches.`]]);
        }),
        tp('taller', (r) => {
          const a = r.int(125, 150), b = r.int(105, a - 3), x = nm(r), y = nm(r);
          return typed(`${x} is ${a} cm tall and ${y} is ${b} cm tall. How much taller is ${x}?`, num(a - b, 'cm'),
            ['"How much taller" means find the difference.', 'Subtract the smaller height.'], [`${a} − ${b} = ${a - b} cm`], [[String(a + b), 'Subtract, do not add.']]);
        }),
        tp('walk', (r) => {
          const km = r.int(1, 6), m = r.int(100, 900), x = nm(r);
          return typed(`${x} walks ${m} m to the bus stop and then travels ${km} km by bus. How many metres does ${x} travel in all?`, num(km * 1000 + m, 'm'),
            ['Change km into m first.', '1 km = 1000 m.', 'Then add.'], [`${km} km = ${km * 1000} m`, `${km * 1000} + ${m} = ${km * 1000 + m} m`], [[String(km + m), 'Change km to metres before adding.']]);
        }, 2),
        tp('ribbon', (r) => {
          const piece = r.pick([10, 20, 25, 50]), n = r.int(3, 12);
          const total = piece * n;
          return typed(`A ribbon is ${total} cm long. It is cut into pieces of ${piece} cm each to tie Bathukamma. How many pieces?`, num(n),
            ['Divide the total length by the length of one piece.', `${total} ÷ ${piece} = ?`], [`${total} ÷ ${piece} = ${n} pieces`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 5 SPACES AND BOUNDARIES 1
const rectCells = (x0: number, y0: number, w: number, hh: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + hh; y++) out.push([x, y]);
  return out;
};
const ch5: USpec = {
  id: 'ts5.m.ch5', subject: 'math', title: 'Spaces and Boundaries - 1', source: src(5),
  objectives: [
    {
      id: 'ts5.m.peri.rect', title: 'Perimeter of squares and rectangles',
      intro: [
        h('Walking around the boundary'),
        p('Raju wants to put a fence around his vegetable field. The length of the boundary all around is called the PERIMETER.'),
        p('For any shape, add the lengths of all its sides.'),
        vis({ kind: 'shape', shape: 'rectangle' }, 'A rectangle has two long sides and two short sides'),
        f('Perimeter of rectangle = 2 × (length + breadth)'),
        f('Perimeter of square = 4 × side'),
        X({
          title: 'What if? Fence around a field', formula: 'P = 2 × (l + b)',
          result: ['P', 'Perimeter', '2 * (l + b)', 'm'],
          vars: [['l', 'Length', 1, 30, 1, 10, 'm'], ['b', 'Breadth', 1, 30, 1, 6, 'm']],
          notes: [['l', 'A longer field needs more fence — two sides get longer.', 'A shorter field needs less fence.'], ['b', 'A wider field needs more fence.', 'A narrower field needs less fence.']],
          mistakes: [['Adding only length + breadth', 'That is only half the way round. There are TWO lengths and TWO breadths.'], ['Multiplying length × breadth', 'That gives area (the space inside), not the boundary.']],
          real: 'Farmers use perimeter to find how much wire to buy for a fence.',
        }),
        photo('🌾', 'A field with a fence: the fence follows the perimeter.'),
        keys('Perimeter = total length of the boundary.', 'Rectangle: 2 × (l + b).', 'Square: 4 × side.'),
        tip('Perimeter is a length, so its unit is cm or m (not square units).'),
      ],
      examples: [
        ex('A field is 25 m long and 15 m wide. Find its perimeter.', ['2 × (25 + 15)', '= 2 × 40', '= 80'], '80 m'),
        ex('A square handkerchief has side 30 cm. How much lace goes around it?', ['4 × 30 = 120'], '120 cm'),
        ex('Fencing costs ₹20 per metre. Fence a 10 m by 8 m garden.', ['Perimeter = 2 × (10 + 8) = 36 m', 'Cost = 36 × 20 = ₹720'], '₹720'),
      ],
      practice: [
        tp('rect', (r) => {
          const l = r.int(8, 40), b = r.int(3, l - 1);
          return typed(`A rectangular field is ${l} m long and ${b} m wide. What is its perimeter?`, num(2 * (l + b), 'm'),
            ['Add all four sides.', 'Perimeter = 2 × (length + breadth).', `2 × (${l} + ${b}) = ?`],
            [`2 × (${l} + ${b}) = 2 × ${l + b} = ${2 * (l + b)} m`], [[String(l + b), 'That is only two sides. Go all the way round.'], [String(l * b), 'That is the area. Perimeter is the boundary.']]);
        }),
        tp('square', (r) => {
          const s = r.int(5, 60), thing = r.pick(['square tile', 'square garden', 'square rangoli', 'square photo frame']);
          return typed(`A ${thing} has each side ${s} cm. What is its perimeter?`, num(4 * s, 'cm'),
            ['A square has 4 equal sides.', `4 × ${s} = ?`], [`4 × ${s} = ${4 * s} cm`], [[String(s * s), 'That is area. Perimeter = 4 × side.']]);
        }),
        tp('fence', (r) => {
          const l = r.int(5, 20), b = r.int(3, 12), rate = r.pick([10, 15, 20, 25, 30]);
          const P = 2 * (l + b);
          return typed(`A garden is ${l} m long and ${b} m wide. Fencing costs ₹${rate} for each metre. What is the cost of fencing?`, num(P * rate, '₹'),
            ['First find the perimeter.', `Perimeter = 2 × (${l} + ${b}) = ${P} m.`, `Then multiply by ₹${rate}.`],
            [`Perimeter = ${P} m`, `${P} × ${rate} = ₹${P * rate}`], [[String(P), 'That is the perimeter. Now multiply by the rate.']], { unitHint: '₹' });
        }, 2),
        tp('side', (r) => {
          const s = r.int(3, 25);
          return typed(`The perimeter of a square is ${4 * s} cm. How long is one side?`, num(s, 'cm'),
            ['A square has 4 equal sides.', `Divide ${4 * s} by 4.`], [`${4 * s} ÷ 4 = ${s} cm`], [[String(2 * s), 'Divide by 4, because a square has 4 sides.']]);
        }, 2),
      ],
    },
    {
      id: 'ts5.m.peri.count', title: 'Area by counting squares', prereqs: ['ts5.m.peri.rect'],
      intro: [
        h('Space inside a shape'),
        p('The space a shape covers is its AREA. Put the shape on squared paper and count the squares inside.'),
        vis({ kind: 'grid-shape', cells: rectCells(1, 1, 4, 3), cols: 7, rows: 5 }, 'A rectangle covering 4 × 3 = 12 squares'),
        p('This rectangle covers 12 squares. Its area is 12 square units. Its perimeter is 4 + 3 + 4 + 3 = 14 units.'),
        photo('🧩', 'Floor tiles are like squares on a grid. Count the tiles to know the area of the floor.'),
        keys('Area = number of squares inside.', 'Perimeter = number of edges around.', 'Rows × squares in each row is faster than counting one by one.'),
        tip('Two shapes can have the same area but different perimeters!'),
      ],
      examples: [
        ex('A shape covers 3 rows of 5 squares. What is its area?', ['3 × 5 = 15'], '15 square units', { kind: 'grid-shape', cells: rectCells(0, 0, 5, 3), cols: 7, rows: 5 }),
        ex('An L-shape has 4 squares in the bottom row and 2 squares above the left end. What is its area?', ['4 + 2 = 6'], '6 square units', { kind: 'grid-shape', cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2]], cols: 6, rows: 4 }),
      ],
      practice: [
        tp('rect', (r) => {
          const w = r.int(2, 6), hh = r.int(2, 4), x0 = r.int(0, 7 - w), y0 = r.int(0, 5 - hh);
          return typed('Each small square is 1 square unit. What is the area of the coloured shape?', num(w * hh),
            ['Count the squares in one row.', 'Count the rows.', 'Multiply rows × squares in a row.'],
            [`${hh} rows of ${w} squares`, `${hh} × ${w} = ${w * hh} square units`], [[String(2 * (w + hh)), 'That is the perimeter. Area counts the squares INSIDE.']],
            { visual: { kind: 'grid-shape', cells: rectCells(x0, y0, w, hh), cols: 7, rows: 5 } });
        }),
        tp('lshape', (r) => {
          const w = r.int(3, 6), hh = r.int(2, 4), cut = r.int(1, w - 1);
          const cells = [...rectCells(0, 0, w, 1), ...rectCells(0, 1, cut, hh - 1)];
          return typed('Each small square is 1 square unit. Count the area of this shape.', num(cells.length),
            ['Split the shape into two rectangles.', `Top row: ${w} squares.`, `Below: ${hh - 1} rows of ${cut}.`],
            [`${w} + ${(hh - 1) * cut} = ${cells.length} square units`], [], { visual: { kind: 'grid-shape', cells, cols: 7, rows: 5 } });
        }, 2),
        tp('perim', (r) => {
          const w = r.int(2, 6), hh = r.int(1, 4);
          return typed('Each square has sides of 1 cm. What is the PERIMETER of the coloured rectangle?', num(2 * (w + hh), 'cm'),
            ['Count the edges all the way around.', `It is ${w} squares long and ${hh} squares high.`, '2 × (length + breadth).'],
            [`2 × (${w} + ${hh}) = ${2 * (w + hh)} cm`], [[String(w * hh), 'That is the area. The perimeter goes around the outside.']],
            { visual: { kind: 'grid-shape', cells: rectCells(0, 0, w, hh), cols: 7, rows: 5 } });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 6 ANGLES
const ANG = ['less than a right angle', 'a right angle', 'more than a right angle'];
const ch6: USpec = {
  id: 'ts5.m.ch6', subject: 'math', title: 'Angles in Our Surroundings', source: src(6),
  objectives: [
    {
      id: 'ts5.m.angle.clock', title: 'Right angle, less than and more than a right angle',
      intro: [
        h('Corners make angles'),
        p('When two straight lines meet at a point, they make an ANGLE. The corner of your book makes a special angle called a RIGHT ANGLE.'),
        vis({ kind: 'clock', h: 3, m: 0 }, 'At 3 o\'clock the clock hands make a right angle'),
        p('Fold a paper twice to make a right-angle tester. If an angle is smaller than your tester, it is LESS than a right angle (sharp, like a slice of pizza). If it is wider, it is MORE than a right angle.'),
        vis({ kind: 'clock', h: 1, m: 0 }, 'At 1 o\'clock the angle is less than a right angle'),
        vis({ kind: 'clock', h: 5, m: 0 }, 'At 5 o\'clock the angle is more than a right angle'),
        keys('Right angle: like the corner of a book (square corner).', 'Less than a right angle: narrower, sharper.', 'More than a right angle: wider, more open.'),
        tip('At 3 o\'clock and 9 o\'clock the clock hands make right angles.'),
      ],
      examples: [
        ex('What angle do the hands make at 9 o\'clock?', ['The hour hand points to 9, the minute hand to 12.', 'That is a quarter of the clock — a square corner.'], 'A right angle', { kind: 'clock', h: 9, m: 0 }),
        ex('What angle do the hands make at 2 o\'clock?', ['The hands are close together.', 'The opening is smaller than a square corner.'], 'Less than a right angle', { kind: 'clock', h: 2, m: 0 }),
      ],
      practice: [
        tp('clock', (r) => {
          const hh = r.pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
          const k = hh === 3 || hh === 9 ? 1 : [1, 2, 10, 11].includes(hh) ? 0 : 2;
          return mcq(r, `Look at the clock showing ${hh} o'clock. The angle between the hands is…`, ANG[k], ANG.filter((_, i) => i !== k),
            ['Compare with the square corner of a book.', '3 o\'clock is exactly a right angle.', 'Are the hands closer together or further apart than at 3 o\'clock?'],
            [`At ${hh} o'clock the angle is ${ANG[k]}.`], [], { visual: { kind: 'clock', h: hh, m: 0 } });
        }),
        bank('around', [
          { q: 'The corner of a notebook makes…', a: 'a right angle', w: ['less than a right angle', 'more than a right angle'], h: ['Check with a right-angle tester.', 'It is a square corner.'], s: ['A notebook corner is a right angle.'], v: em('📚') },
          { q: 'The tip of a pizza slice makes…', a: 'less than a right angle', w: ['a right angle', 'more than a right angle'], h: ['The tip is sharp and narrow.'], s: ['A sharp tip is less than a right angle.'], v: em('🍕') },
          { q: 'A door opened very wide, almost flat against the wall, makes…', a: 'more than a right angle', w: ['a right angle', 'less than a right angle'], h: ['Very wide open is wider than a square corner.'], s: ['A wide-open door makes more than a right angle.'], v: em('🚪') },
          { q: 'The corner where the floor meets the wall makes…', a: 'a right angle', w: ['less than a right angle', 'more than a right angle'], h: ['Walls stand straight up from the floor.'], s: ['Floor and wall meet at a right angle.'], v: em('🏠') },
          { q: 'The two blades of slightly open scissors make…', a: 'less than a right angle', w: ['a right angle', 'more than a right angle'], h: ['Slightly open means a small opening.'], s: ['A small opening is less than a right angle.'] },
          { q: 'The roof slopes of a hut meeting at the top usually make…', a: 'more than a right angle', w: ['a right angle', 'less than a right angle'], h: ['A low, flat roof top is wide open.'], s: ['A wide, low roof top is more than a right angle.'] },
        ]),
        qaBank('turns', [
          { q: 'How many right angles make a full turn?', a: 4, h: ['Turn from 12 all the way back to 12 on a clock.', '12 → 3 → 6 → 9 → 12.'], s: ['4 quarter turns = 1 full turn, so 4 right angles.'] },
          { q: 'How many right angles make a half turn (like turning to face behind you)?', a: 2, h: ['12 to 6 on a clock is a half turn.', '12 → 3 is one right angle, 3 → 6 is another.'], s: ['2 right angles make a half turn.'] },
          { q: 'How many right angles does a square have?', a: 4, h: ['Check each corner of a square.'], s: ['All 4 corners of a square are right angles.'] },
          { q: 'How many right angles does a rectangle have?', a: 4, h: ['Look at the corners of your book.'], s: ['All 4 corners of a rectangle are right angles.'] },
          { q: 'The minute hand goes from 12 to 6. How many right angles has it turned?', a: 2, h: ['12 to 3 is one right angle.', '3 to 6 is another.'], s: ['12 → 6 is a half turn = 2 right angles.'] },
          { q: 'The minute hand goes from 12 to 9 (clockwise). How many right angles?', a: 3, h: ['12→3, 3→6, 6→9.'], s: ['Three quarter turns = 3 right angles.'] },
        ]),
      ],
    },
    {
      id: 'ts5.m.angle.compare', title: 'Spotting angles in shapes and letters', prereqs: ['ts5.m.angle.clock'],
      intro: [
        h('Angles hide in shapes and letters'),
        p('Look at the letter L. Its two lines meet in a right angle. The letter V has an angle less than a right angle at the bottom.'),
        p('A square and a rectangle have 4 right angles each. A triangle can have one right angle, but never two.'),
        vis({ kind: 'shape', shape: 'triangle' }, 'A triangle has three angles'),
        photo('🪁', 'A kite shape has some sharp angles and some wide ones.'),
        keys('L and T have right angles.', 'V has an angle less than a right angle.', 'Square and rectangle: 4 right angles.'),
        tip('Use the corner of a paper as a right-angle tester to check.'),
      ],
      examples: [
        ex('How many right angles are in the letter T?', ['The top bar meets the stem in the middle.', 'It makes one right angle on each side.'], '2 right angles'),
        ex('Which has a right angle: the letter L or the letter V?', ['L is like a book corner.', 'V is narrower.'], 'L'),
      ],
      practice: [
        tapT('letters', 'Tap the letters that have at least one right angle.', [['L', true], ['T', true], ['E', true], ['H', true], ['F', true], ['V', false], ['O', false], ['C', false], ['A', false], ['S', false]],
          ['Check each corner with a right-angle tester.', 'Straight lines that meet like a book corner make a right angle.']),
        bank('shapes', [
          { q: 'How many right angles does a square have?', a: '4', w: ['2', '3', '0'], h: ['Check all the corners.'], s: ['All 4 corners are right angles.'], v: { kind: 'shape', shape: 'square' } },
          { q: 'How many right angles does a circle have?', a: '0', w: ['1', '2', '4'], h: ['A circle has no corners.'], s: ['No corners, so no angles.'], v: { kind: 'shape', shape: 'circle' } },
          { q: 'How many right angles does a rectangle have?', a: '4', w: ['2', '1', '0'], h: ['A rectangle is like a book.'], s: ['All 4 corners are right angles.'], v: { kind: 'shape', shape: 'rectangle' } },
          { q: 'Can a triangle have TWO right angles?', a: 'No', w: ['Yes'], h: ['Try drawing two right angles on one side and joining the ends.'], s: ['The two sides would never meet, so a triangle has at most one right angle.'], v: { kind: 'shape', shape: 'triangle' } },
          { q: 'The letter V has an angle that is…', a: 'less than a right angle', w: ['a right angle', 'more than a right angle'], h: ['V is narrow at the bottom.'], s: ['V makes a sharp angle, less than a right angle.'] },
          { q: 'The letter L has an angle that is…', a: 'a right angle', w: ['less than a right angle', 'more than a right angle'], h: ['L looks like a book corner.'], s: ['L makes a right angle.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 7 PLAYING WITH SHAPES
const ch7: USpec = {
  id: 'ts5.m.ch7', subject: 'math', title: 'Playing with Shapes', source: src(7),
  objectives: [
    {
      id: 'ts5.m.shapes.cube', title: 'Cube, its net, tangram and tiling',
      intro: [
        h('The cube'),
        p('A dice is a cube. It has 6 square faces, 12 edges and 8 corners (vertices).'),
        photo('🎲', 'On a dice, opposite faces always add up to 7: 1 and 6, 2 and 5, 3 and 4.'),
        def('Net', 'A flat shape that can be folded to make a solid. A cube\'s net has 6 squares joined edge to edge.'),
        p('The most famous cube net is a cross: four squares in a row, with one square above and one below.'),
        h('Tiling and tangram'),
        p('Shapes that fit together with no gaps make a TILING — like floor tiles. Squares, rectangles, equal triangles and hexagons tile well. Circles leave gaps.'),
        p('A tangram is a square cut into 7 pieces. You can make animals, boats and people with them.'),
        keys('Cube: 6 faces, 12 edges, 8 corners.', 'A cube net has 6 squares.', 'Tiles fit with no gaps and no overlaps.'),
        tip('A honeycomb is a hexagon tiling made by bees!'),
      ],
      examples: [
        ex('On a dice, which number is opposite 2?', ['Opposite faces add to 7.', '7 − 2 = 5'], '5'),
        ex('Do circles make a tiling?', ['Put coins side by side.', 'There are gaps between them.'], 'No, circles leave gaps'),
      ],
      practice: [
        qaBank('cube', [
          { q: 'How many faces does a cube have?', a: 6, h: ['Think of a dice.', 'Top, bottom and four sides.'], s: ['A cube has 6 faces.'] },
          { q: 'How many edges does a cube have?', a: 12, h: ['4 on the top, 4 on the bottom…', '…and 4 standing edges.'], s: ['4 + 4 + 4 = 12 edges.'] },
          { q: 'How many corners (vertices) does a cube have?', a: 8, h: ['4 corners on top.', '4 corners at the bottom.'], s: ['4 + 4 = 8 corners.'] },
          { q: 'How many squares are in a net of a cube?', a: 6, h: ['One square for each face.'], s: ['A cube has 6 faces, so 6 squares.'] },
          { q: 'On a dice, which number is opposite 1?', a: 6, h: ['Opposite faces add up to 7.'], s: ['7 − 1 = 6'] },
          { q: 'On a dice, which number is opposite 3?', a: 4, h: ['Opposite faces add up to 7.'], s: ['7 − 3 = 4'] },
          { q: 'On a dice, which number is opposite 5?', a: 2, h: ['Opposite faces add up to 7.'], s: ['7 − 5 = 2'] },
        ]),
        tapT('tile', 'Tap the shapes that can tile a floor with no gaps (all pieces the same size).', [['Square', true], ['Rectangle', true], ['Equal-sided triangle', true], ['Hexagon', true], ['Circle', false], ['Oval', false], ['Star', false]],
          ['Imagine many copies placed side by side.', 'Do round shapes leave gaps?']),
      ],
    },
    {
      id: 'ts5.m.shapes.circle', title: 'Circle: centre, radius and diameter',
      intro: [
        h('Every point is the same distance away'),
        p('Tie a string to a stick in the ground. Keep the string tight and walk around. You draw a circle! The stick is the CENTRE.'),
        vis({ kind: 'shape', shape: 'circle' }, 'A circle'),
        def('Radius', 'The distance from the centre to the edge of the circle.'),
        def('Diameter', 'A straight line across the circle through the centre. It is two radii long.'),
        f('Diameter = 2 × radius'),
        X({
          title: 'What if? Grow a circle', formula: 'd = 2 × r', result: ['d', 'Diameter', '2 * r', 'cm'],
          vars: [['r', 'Radius', 1, 20, 1, 5, 'cm']],
          notes: [['r', 'A longer radius makes the whole circle bigger, and the diameter grows twice as fast.', 'A shorter radius makes a smaller circle.']],
          mistakes: [['Thinking diameter = radius', 'The diameter goes ALL the way across — it is two radii.']],
          real: 'A bangle with radius 3 cm is 6 cm across.',
        }),
        photo('🛞', 'The spokes of a cycle wheel are radii: they go from the centre to the rim.'),
        keys('Centre: the middle point.', 'Radius: centre to edge.', 'Diameter = 2 × radius.'),
        tip('To find the radius from the diameter, divide by 2.'),
      ],
      examples: [
        ex('A roti has radius 9 cm. What is its diameter?', ['2 × 9 = 18'], '18 cm'),
        ex('A well is 4 m across. What is its radius?', ['Radius = diameter ÷ 2', '4 ÷ 2 = 2'], '2 m'),
      ],
      practice: [
        tp('diam', (r) => {
          const rad = r.int(2, 30), thing = r.pick(['roti', 'bangle', 'plate', 'clock', 'cycle wheel']);
          return typed(`A ${thing} has radius ${rad} cm. What is its diameter?`, num(2 * rad, 'cm'),
            ['The diameter goes all the way across.', 'Diameter = 2 × radius.'], [`2 × ${rad} = ${2 * rad} cm`], [[String(rad), 'That is the radius. The diameter is twice as long.']]);
        }),
        tp('rad', (r) => {
          const rad = r.int(2, 30), thing = r.pick(['well', 'round table', 'Bathukamma base', 'pond', 'rangoli']);
          return typed(`A ${thing} is ${2 * rad} cm across (diameter). What is its radius?`, num(rad, 'cm'),
            ['Radius is half the diameter.', `${2 * rad} ÷ 2 = ?`], [`${2 * rad} ÷ 2 = ${rad} cm`], [[String(4 * rad), 'Divide by 2, do not multiply.']]);
        }),
        bank('parts', [
          { q: 'The middle point of a circle is called the…', a: 'centre', w: ['radius', 'diameter', 'edge'], h: ['It is where you put the compass point.'], s: ['It is the centre.'] },
          { q: 'A line from the centre to the edge is the…', a: 'radius', w: ['diameter', 'centre', 'corner'], h: ['Think of a spoke of a wheel.'], s: ['That is the radius.'] },
          { q: 'A line across a circle through the centre is the…', a: 'diameter', w: ['radius', 'centre', 'corner'], h: ['It goes all the way across.'], s: ['That is the diameter.'] },
          { q: 'How many corners does a circle have?', a: '0', w: ['1', '4', '2'], h: ['A circle is perfectly round.'], s: ['A circle has no corners.'] },
          { q: 'The diameter of a circle is how many times its radius?', a: '2 times', w: ['the same', '3 times', 'half'], h: ['Diameter = radius + radius.'], s: ['Diameter = 2 × radius.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 8 SPACES AND BOUNDARIES 2
const ch8: USpec = {
  id: 'ts5.m.ch8', subject: 'math', title: 'Spaces and Boundaries - 2', source: src(8),
  objectives: [
    {
      id: 'ts5.m.area.rect', title: 'Area of rectangles and squares',
      intro: [
        h('A faster way to count squares'),
        p('A rectangle with 5 squares in each row and 3 rows has 3 × 5 = 15 squares. So area = length × breadth.'),
        vis({ kind: 'grid-shape', cells: rectCells(0, 0, 5, 3), cols: 6, rows: 4 }, '3 rows of 5 squares = 15 square units'),
        f('Area of rectangle = length × breadth'),
        f('Area of square = side × side'),
        def('Square centimetre (sq cm)', 'The space covered by a square of side 1 cm — about the size of a stamp.'),
        def('Square metre (sq m)', 'The space covered by a square of side 1 m. Used for floors and fields.'),
        X({
          title: 'What if? Change the size of a room', formula: 'A = l × b', result: ['A', 'Area', 'l * b', 'sq m'],
          vars: [['l', 'Length', 1, 20, 1, 6, 'm'], ['b', 'Breadth', 1, 20, 1, 4, 'm']],
          notes: [['l', 'A longer room covers more floor.', 'A shorter room covers less floor.'], ['b', 'A wider room covers more floor.', 'A narrower room covers less floor.']],
          mistakes: [['Adding length and breadth', 'Area counts squares: rows × squares in a row. Multiply.'], ['Writing m instead of sq m', 'Area is measured in SQUARE units.']],
          real: 'To buy tiles for a classroom floor, first find its area in square metres.',
        }),
        keys('Area of rectangle = l × b.', 'Area of square = side × side.', 'Area is in square units.'),
        tip('Perimeter is about the boundary (cm, m). Area is about the inside (sq cm, sq m).'),
      ],
      examples: [
        ex('A classroom is 8 m long and 6 m wide. Find the floor area.', ['8 × 6 = 48'], '48 sq m'),
        ex('A square carrom board has side 70 cm. Find its area.', ['70 × 70 = 4900'], '4900 sq cm'),
      ],
      practice: [
        tp('rect', (r) => {
          const l = r.int(4, 15), b = r.int(2, l), what = r.pick(['classroom', 'kitchen', 'verandah', 'school stage', 'shop']);
          return typed(`A ${what} floor is ${l} m long and ${b} m wide. What is its area in square metres?`, num(l * b, 'sq m'),
            ['Area = length × breadth.', `${l} × ${b} = ?`], [`${l} × ${b} = ${l * b} sq m`], [[String(2 * (l + b)), 'That is the perimeter. For area, multiply.'], [String(l + b), 'Multiply, do not add.']]);
        }),
        tp('square', (r) => {
          const s = r.int(3, 15);
          return typed(`A square greeting card has side ${s} cm. What is its area in square cm?`, num(s * s, 'sq cm'),
            ['Area of square = side × side.', `${s} × ${s} = ?`], [`${s} × ${s} = ${s * s} sq cm`], [[String(4 * s), 'That is the perimeter. Area = side × side.']]);
        }),
        tp('stamps', (r) => {
          const l = r.int(3, 9), b = r.int(2, 6);
          return typed(`How many 1 cm × 1 cm stamps are needed to cover a card ${l} cm long and ${b} cm wide?`, num(l * b),
            ['Each stamp covers 1 sq cm.', `There are ${b} rows of ${l} stamps.`], [`${b} × ${l} = ${l * b} stamps`]);
        }),
        tp('tiles', (r) => {
          const l = r.int(3, 9), b = r.int(2, 7), cost = r.pick([50, 80, 100, 120]);
          return typed(`A room is ${l} m by ${b} m. Each square-metre tile costs ₹${cost}. What is the cost of tiles for the floor?`, num(l * b * cost, '₹'),
            ['First find the area.', `${l} × ${b} = ${l * b} tiles.`, `Then multiply by ₹${cost}.`], [`Area = ${l * b} sq m`, `${l * b} × ${cost} = ₹${l * b * cost}`],
            [[String(l * b), 'That is the number of tiles. Now find the cost.']], { unitHint: '₹' });
        }, 2),
      ],
    },
    {
      id: 'ts5.m.area.tri', title: 'Area of a triangle as half a rectangle; choosing square units', prereqs: ['ts5.m.area.rect'],
      intro: [
        h('Cut a rectangle in half'),
        p('Fold a rectangular paper from one corner to the opposite corner and cut. You get two triangles that are exactly the same.'),
        p('So each triangle has HALF the area of the rectangle.'),
        vis({ kind: 'shape', shape: 'triangle' }, 'A right triangle is half of a rectangle'),
        f('Area of this triangle = (length × breadth) ÷ 2'),
        h('Which square unit?'),
        p('Small things like a stamp or a book cover: square centimetres. Floors, playgrounds and fields: square metres.'),
        keys('Diagonal cut → 2 equal triangles.', 'Triangle area = half the rectangle.', 'sq cm for small, sq m for big.'),
        tip('Find the rectangle\'s area first, then halve it.'),
      ],
      examples: [
        ex('A rectangle 8 cm by 6 cm is cut along its diagonal. Area of one triangle?', ['Rectangle area = 8 × 6 = 48 sq cm', 'Half = 24'], '24 sq cm'),
        ex('Which unit to measure a playground?', ['A playground is very big.'], 'square metres'),
      ],
      practice: [
        tp('half', (r) => {
          let l = r.int(3, 14), b = r.int(2, 10);
          if ((l * b) % 2) l += 1;
          return typed(`A rectangle ${l} cm long and ${b} cm wide is cut along a diagonal into two triangles. What is the area of ONE triangle?`, num((l * b) / 2, 'sq cm'),
            ['Find the area of the rectangle.', `${l} × ${b} = ${l * b}.`, 'One triangle is half of it.'],
            [`${l} × ${b} = ${l * b} sq cm`, `${l * b} ÷ 2 = ${(l * b) / 2} sq cm`], [[String(l * b), 'That is the whole rectangle. One triangle is half.']]);
        }),
        bank('unit', [
          { q: 'Which unit is best to measure the area of a postage stamp?', a: 'square centimetres', w: ['square metres', 'metres', 'kilograms'], h: ['A stamp is tiny.'], s: ['Small areas are measured in sq cm.'] },
          { q: 'Which unit is best to measure the area of a school playground?', a: 'square metres', w: ['square centimetres', 'centimetres', 'litres'], h: ['A playground is big.'], s: ['Big areas are measured in sq m.'] },
          { q: 'Which unit is best to measure the area of your notebook cover?', a: 'square centimetres', w: ['square metres', 'kilometres', 'grams'], h: ['A notebook fits in your bag.'], s: ['Use sq cm for small things.'] },
          { q: 'Which unit is best to measure the area of a classroom floor?', a: 'square metres', w: ['square centimetres', 'millimetres', 'litres'], h: ['A floor is many metres long.'], s: ['Use sq m for floors.'] },
          { q: 'The area of a rectangle is 40 sq cm. What is the area of half of it?', a: '20 sq cm', w: ['80 sq cm', '40 sq cm', '10 sq cm'], h: ['Half means divide by 2.'], s: ['40 ÷ 2 = 20 sq cm.'] },
          { q: 'Perimeter is measured in cm. Area is measured in…', a: 'square cm', w: ['cm', 'kg', 'litres'], h: ['Area counts squares.'], s: ['Area uses square units.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 9 MAPS AND ROUTES
const DIRS = ['North', 'East', 'South', 'West'];
const ch9: USpec = {
  id: 'ts5.m.ch9', subject: 'math', title: 'Maps and Routes', source: src(9),
  objectives: [
    {
      id: 'ts5.m.maps.dir', title: 'Directions: North, South, East and West',
      intro: [
        h('Where does the sun rise?'),
        p('The sun rises in the EAST. Stand with your right hand pointing to the sunrise. You are facing NORTH. Behind you is SOUTH, and your left hand points WEST.'),
        photo('🧭', 'A compass needle always points North.'),
        p('Going round clockwise: North → East → South → West → North. A right turn moves one step clockwise. A left turn moves one step anticlockwise.'),
        keys('Sun rises in the East, sets in the West.', 'Right turn: N → E → S → W.', 'About turn (half turn): face the opposite direction.'),
        tip('Never Eat Soggy Waffles: North, East, South, West — clockwise.'),
      ],
      examples: [
        ex('Sana faces North and turns right. Which way does she face now?', ['Clockwise from North is East.'], 'East'),
        ex('Ravi faces East and turns about (half turn). Which way now?', ['Opposite of East is West.'], 'West'),
      ],
      practice: [
        tp('turn', (r) => {
          const start = r.int(0, 3), t = r.int(0, 2);
          const tn = ['turns right', 'turns left', 'turns about (half turn)'][t];
          const end = (start + [1, 3, 2][t]) % 4;
          const x = nm(r);
          return mcq(r, `${x} is facing ${DIRS[start]} and ${tn}. Which direction does ${x} face now?`, DIRS[end], DIRS.filter((d) => d !== DIRS[end]),
            ['Clockwise order: North, East, South, West.', 'Right = one step clockwise; left = one step anticlockwise.', 'About turn = opposite direction.'],
            [`From ${DIRS[start]}, ${tn} → ${DIRS[end]}.`]);
        }),
        bank('sun', [
          { q: 'In which direction does the sun rise?', a: 'East', w: ['West', 'North', 'South'], h: ['Think of early morning.'], s: ['The sun rises in the East.'], v: em('🌅') },
          { q: 'In which direction does the sun set?', a: 'West', w: ['East', 'North', 'South'], h: ['It is opposite to sunrise.'], s: ['The sun sets in the West.'] },
          { q: 'If you face the sunrise, what is on your left?', a: 'North', w: ['South', 'West', 'East'], h: ['Facing East, turn left one step anticlockwise.'], s: ['Left of East is North.'] },
          { q: 'Which direction is opposite to North?', a: 'South', w: ['East', 'West', 'North'], h: ['Do a half turn from North.'], s: ['Opposite of North is South.'] },
          { q: 'A compass needle points to…', a: 'North', w: ['South', 'East', 'West'], h: ['Sailors use this to find their way.'], s: ['A compass needle points North.'], v: em('🧭') },
        ]),
      ],
    },
    {
      id: 'ts5.m.maps.route', title: 'Reading route maps and floor maps', prereqs: ['ts5.m.maps.dir'],
      intro: [
        h('A map is a drawing from above'),
        p('Imagine you are a bird looking down at your classroom. A floor map shows where the door, windows, desks and blackboard are.'),
        p('A route map shows roads. If each block on the map stands for 100 m, then 3 blocks is 300 m.'),
        photo('🗺️', 'A map uses a scale, like "1 cm on the map = 1 km on the ground".'),
        keys('Maps show things from above.', 'The scale tells how far one step on the map really is.', 'Add up all the parts of a route.'),
        tip('Count blocks carefully: each turn starts a new part of the route.'),
      ],
      examples: [
        ex('On a map, each block is 100 m. Teja walks 3 blocks East and 2 blocks North. How far?', ['3 + 2 = 5 blocks', '5 × 100 = 500'], '500 m'),
        ex('Map scale: 1 cm = 5 km. Two towns are 4 cm apart on the map. Real distance?', ['4 × 5 = 20'], '20 km'),
      ],
      practice: [
        tp('blocks', (r) => {
          const a = r.int(1, 6), b = r.int(1, 5), sz = r.pick([50, 100, 200]), x = nm(r);
          return typed(`On a route map each block is ${sz} m. ${x} walks ${a} blocks East and then ${b} blocks North to reach school. How many metres does ${x} walk?`, num((a + b) * sz, 'm'),
            ['Count all the blocks.', `${a} + ${b} = ${a + b} blocks.`, `Multiply by ${sz} m.`], [`${a + b} × ${sz} = ${(a + b) * sz} m`], [[String(a + b), 'That is the number of blocks. Change it into metres.']]);
        }),
        tp('scale', (r) => {
          const k = r.pick([2, 5, 10, 20]), d = r.int(2, 9), t = r.pick(['Siddipet', 'Jangaon', 'Nalgonda', 'Medak', 'Karimnagar']);
          return typed(`On a map, 1 cm stands for ${k} km. Hyderabad and ${t} are ${d} cm apart on the map. What is the real distance?`, num(d * k, 'km'),
            ['Each cm is ' + k + ' km.', `Multiply ${d} × ${k}.`], [`${d} × ${k} = ${d * k} km`], [[String(d + k), 'Multiply, do not add.']]);
        }),
        tp('back', (r) => {
          const a = r.int(2, 9) * 100, b = r.int(2, 9) * 100;
          return typed(`From home, Diya walks ${a} m to the shop and then ${b} m to the temple. She comes back home the same way. How far does she walk in all?`, num(2 * (a + b), 'm'),
            ['One way = shop part + temple part.', `${a} + ${b} = ${a + b} m.`, 'She walks it twice (there and back).'],
            [`${a} + ${b} = ${a + b} m one way`, `2 × ${a + b} = ${2 * (a + b)} m`], [[String(a + b), 'That is one way. She also walks back.']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 10 WEIGHT
const ch10: USpec = {
  id: 'ts5.m.ch10', subject: 'math', title: 'How Much Does It Weigh?', source: src(10),
  objectives: [
    {
      id: 'ts5.m.wt.units', title: 'Kilograms and grams',
      intro: [
        h('Heavy and light'),
        p('At the rythu bazaar, the vendor weighs tomatoes on a balance. Heavy things are weighed in KILOGRAMS (kg). Light things are weighed in GRAMS (g).'),
        f('1 kg = 1000 g'),
        photo('⚖', 'A balance: when both pans are level, both sides weigh the same.'),
        p('Half a kilogram = 500 g. A quarter kilogram = 250 g.'),
        p('2 kg 300 g = 2000 g + 300 g = 2300 g.'),
        keys('1 kg = 1000 g.', '½ kg = 500 g, ¼ kg = 250 g.', 'kg → g: multiply by 1000.'),
        tip('A bag of rice is weighed in kg. A packet of turmeric is weighed in g.'),
      ],
      examples: [
        ex('How many grams in 3 kg 450 g?', ['3 kg = 3000 g', '3000 + 450 = 3450'], '3450 g'),
        ex('How many 250 g packets make 1 kg?', ['250 + 250 + 250 + 250 = 1000'], '4 packets'),
      ],
      practice: [
        tp('tog', (r) => {
          const kg = r.int(1, 9), g = r.int(1, 19) * 50;
          return typed(`How many grams are in ${kg} kg ${g} g?`, num(kg * 1000 + g, 'g'), ['1 kg = 1000 g.', `${kg} kg = ${kg * 1000} g.`, `Add ${g} g.`],
            [`${kg * 1000} + ${g} = ${kg * 1000 + g} g`], [[String(kg * 100 + g), '1 kg is 1000 g, not 100 g.']]);
        }),
        tp('packets', (r) => {
          const sz = r.pick([100, 125, 200, 250, 500]), kg = r.int(1, 5);
          return typed(`How many ${sz} g packets of turmeric make ${kg} kg?`, num((kg * 1000) / sz),
            [`${kg} kg = ${kg * 1000} g.`, `Divide ${kg * 1000} by ${sz}.`], [`${kg * 1000} ÷ ${sz} = ${(kg * 1000) / sz} packets`]);
        }),
        bank('which', [
          { q: 'Which is best weighed in kilograms?', a: 'A sack of rice', w: ['A pencil', 'A feather', 'A letter'], h: ['Which is the heaviest?'], s: ['A sack of rice is heavy, so use kg.'], pic: ['🌾', ['✏️', '🪶', '📄']] },
          { q: 'Which is best weighed in grams?', a: 'An egg', w: ['A cow', 'A bag of cement', 'A bicycle'], h: ['Which is the lightest?'], s: ['An egg is light, so use grams.'], pic: ['🥚', ['🐄', '🧱', '🚲']] },
          { q: 'Half a kilogram is how many grams?', a: '500 g', w: ['50 g', '250 g', '5000 g'], h: ['1 kg = 1000 g.', 'Half of 1000.'], s: ['1000 ÷ 2 = 500 g'] },
          { q: 'A quarter kilogram is how many grams?', a: '250 g', w: ['25 g', '400 g', '500 g'], h: ['1 kg = 1000 g.', 'Divide 1000 into 4 equal parts.'], s: ['1000 ÷ 4 = 250 g'] },
          { q: 'Which is heavier: 1 kg of cotton or 1 kg of iron?', a: 'Both weigh the same', w: ['Cotton', 'Iron'], h: ['Look at the numbers, not the things.'], s: ['Both are 1 kg, so they weigh the same.'], pic: ['⚖', ['☁️', '🔩']] },
          { q: '2000 g is the same as…', a: '2 kg', w: ['20 kg', '200 kg', '1 kg'], h: ['1000 g = 1 kg.'], s: ['2000 ÷ 1000 = 2 kg'] },
        ]),
      ],
    },
    {
      id: 'ts5.m.wt.problems', title: 'Weight word problems', prereqs: ['ts5.m.wt.units'],
      intro: [
        h('Shopping bag maths'),
        p('Amma buys 2 kg rice, 500 g dal and 250 g sugar. How heavy is her bag? Change everything into grams: 2000 + 500 + 250 = 2750 g = 2 kg 750 g.'),
        photo('🛒', 'At the shop, many small packets add up to a heavy bag.'),
        keys('Make units the same first.', 'Add for total weight; subtract for difference.'),
        tip('If the answer is more than 1000 g, you can say it in kg and g too.'),
      ],
      examples: [
        ex('A bag holds 5 kg. It has 3 kg 200 g of onions. How much more can it hold?', ['5 kg = 5000 g, 3 kg 200 g = 3200 g', '5000 − 3200 = 1800'], '1800 g (1 kg 800 g)'),
        ex('6 packets of 250 g biscuits. Total weight?', ['6 × 250 = 1500'], '1500 g = 1 kg 500 g'),
      ],
      practice: [
        tp('total', (r) => {
          const a = r.int(1, 5), b = r.int(1, 9) * 100, cc = r.pick([50, 100, 150, 250]);
          return typed(`Amma buys ${a} kg rice, ${b} g dal and ${cc} g sugar. What is the total weight in grams?`, num(a * 1000 + b + cc, 'g'),
            ['Change kg into g.', `${a} kg = ${a * 1000} g.`, 'Now add all three.'], [`${a * 1000} + ${b} + ${cc} = ${a * 1000 + b + cc} g`], [[String(a + b + cc), 'Change kg to grams before adding.']]);
        }),
        tp('left', (r) => {
          const cap = r.int(4, 10), have = r.int(1, cap - 1) * 1000 + r.int(1, 9) * 100;
          return typed(`A bag can hold ${cap} kg. It already has ${have} g of potatoes. How many more grams can it hold?`, num(cap * 1000 - have, 'g'),
            [`${cap} kg = ${cap * 1000} g.`, 'Subtract what is already there.'], [`${cap * 1000} − ${have} = ${cap * 1000 - have} g`]);
        }, 2),
        tp('many', (r) => {
          const sz = r.pick([200, 250, 400, 500]), n = r.int(3, 12);
          return typed(`${n} packets of jaggery weigh ${sz} g each. What is their total weight in grams?`, num(n * sz, 'g'),
            ['Multiply the weight of one packet by the number of packets.'], [`${n} × ${sz} = ${n * sz} g`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 11 LITRES
const ch11: USpec = {
  id: 'ts5.m.ch11', subject: 'math', title: 'Many More Litres', source: src(11),
  objectives: [
    {
      id: 'ts5.m.cap.units', title: 'Litres and millilitres',
      intro: [
        h('How much can it hold?'),
        p('Milk, water, oil and petrol are measured in LITRES (L). Small amounts, like medicine, are measured in MILLILITRES (mL).'),
        f('1 L = 1000 mL'),
        photo('🥛', 'A milk packet often holds 500 mL — that is half a litre.'),
        p('2 L 250 mL = 2000 mL + 250 mL = 2250 mL.'),
        keys('1 L = 1000 mL.', '½ L = 500 mL, ¼ L = 250 mL.', 'L → mL: multiply by 1000.'),
        tip('A spoon of cough syrup is about 5 mL. A bucket holds about 15 to 20 L.'),
      ],
      examples: [
        ex('How many mL in 3 L 500 mL?', ['3 L = 3000 mL', '3000 + 500 = 3500'], '3500 mL'),
        ex('How many 250 mL glasses fill a 1 L jug?', ['1000 ÷ 250 = 4'], '4 glasses'),
      ],
      practice: [
        tp('toml', (r) => {
          const l = r.int(1, 9), ml = r.int(1, 19) * 50;
          return typed(`How many millilitres are in ${l} L ${ml} mL?`, num(l * 1000 + ml, 'mL'), ['1 L = 1000 mL.', `${l} L = ${l * 1000} mL.`, `Add ${ml}.`],
            [`${l * 1000} + ${ml} = ${l * 1000 + ml} mL`], [[String(l * 100 + ml), '1 L is 1000 mL, not 100 mL.']]);
        }),
        tp('glasses', (r) => {
          const g = r.pick([100, 200, 250, 500]), l = r.int(1, 5);
          return typed(`How many ${g} mL glasses can be filled from a ${l} L bottle of buttermilk?`, num((l * 1000) / g),
            [`${l} L = ${l * 1000} mL.`, `Divide by ${g}.`], [`${l * 1000} ÷ ${g} = ${(l * 1000) / g} glasses`]);
        }),
        bank('which', [
          { q: 'Which is measured in litres?', a: 'Water in a bucket', w: ['Medicine in a spoon', 'Weight of a mango', 'Length of a rope'], h: ['Litres are for a lot of liquid.'], s: ['A bucket holds many litres of water.'], pic: ['🪣', ['🥄', '🥭', '🪢']] },
          { q: 'Which is measured in millilitres?', a: 'Cough syrup dose', w: ['Water in a tank', 'Milk in a dairy can', 'Petrol in a tanker'], h: ['mL is for very small amounts.'], s: ['A dose of syrup is a few mL.'] },
          { q: 'Half a litre is…', a: '500 mL', w: ['50 mL', '250 mL', '5000 mL'], h: ['1 L = 1000 mL.'], s: ['1000 ÷ 2 = 500 mL'] },
          { q: '3000 mL is the same as…', a: '3 L', w: ['30 L', '300 L', '0.3 L'], h: ['1000 mL = 1 L.'], s: ['3000 ÷ 1000 = 3 L'] },
          { q: 'A quarter litre is…', a: '250 mL', w: ['25 mL', '400 mL', '500 mL'], h: ['Divide 1000 mL into 4 equal parts.'], s: ['1000 ÷ 4 = 250 mL'] },
        ]),
      ],
    },
    {
      id: 'ts5.m.cap.problems', title: 'Capacity word problems: milk, paint and petrol', prereqs: ['ts5.m.cap.units'],
      intro: [
        h('Litres in daily life'),
        p('Nanna fills 2 litres of petrol in his bike. If petrol costs ₹110 per litre, he pays 2 × 110 = ₹220.'),
        p('The milkman pours 750 mL in the morning and 500 mL in the evening. In all: 1250 mL = 1 L 250 mL.'),
        photo('🚲', 'Vehicles use litres of fuel; a cycle uses none!'),
        keys('Same units first.', 'Cost = litres × price of 1 litre.', 'Fill with mugs: big amount ÷ small amount.'),
        tip('Prices change from day to day — always use the price given in the question.'),
      ],
      examples: [
        ex('A family uses 1 L 500 mL of milk a day. How much in 4 days?', ['1500 mL × 4 = 6000 mL', '6000 mL = 6 L'], '6 L'),
        ex('Paint costs ₹180 per litre. Cost of 5 litres?', ['180 × 5 = 900'], '₹900'),
      ],
      practice: [
        tp('milk', (r) => {
          const a = r.int(2, 9) * 100 + r.pick([0, 50]), b = r.int(2, 9) * 100, x = nm(r);
          return typed(`${x}'s family buys ${a} mL of milk in the morning and ${b} mL in the evening. How many mL in all?`, num(a + b, 'mL'),
            ['Add the two amounts.'], [`${a} + ${b} = ${a + b} mL`]);
        }),
        tp('petrol', (r) => {
          const pr = r.int(95, 115), l = r.int(2, 9);
          return typed(`Suppose petrol costs ₹${pr} for 1 litre. How much do ${l} litres cost?`, num(pr * l, '₹'),
            ['Multiply the price by the number of litres.', `${pr} × ${l} = ?`], [`${pr} × ${l} = ₹${pr * l}`], [[String(pr + l), 'Each litre costs ₹' + pr + ', so multiply.']], { unitHint: '₹' });
        }),
        tp('bucket', (r) => {
          const b = r.int(10, 20), mug = r.pick([500, 250]);
          return typed(`A bucket holds ${b} L of water. How many ${mug} mL mugs of water can it hold?`, num((b * 1000) / mug),
            [`${b} L = ${b * 1000} mL.`, `Divide by ${mug}.`, mug === 500 ? '2 mugs make 1 L.' : '4 mugs make 1 L.'], [`${b * 1000} ÷ ${mug} = ${(b * 1000) / mug} mugs`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 12 TIME
const MONTHS: [string, number][] = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];
const ch12: USpec = {
  id: 'ts5.m.ch12', subject: 'math', title: 'Time', source: src(12),
  objectives: [
    {
      id: 'ts5.m.time.read', title: 'Reading the clock; a.m. and p.m.',
      intro: [
        h('Two hands, one time'),
        p('The short hand shows the HOUR. The long hand shows the MINUTES. Each number on the clock means 5 minutes for the long hand.'),
        vis({ kind: 'clock', h: 7, m: 25 }, 'The clock shows 7:25'),
        p('When the long hand is on 5, it is 25 minutes past. So this clock shows 7:25.'),
        h('a.m. and p.m.'),
        p('A day has 24 hours. From midnight to noon we say a.m. From noon to midnight we say p.m. School starts at 9 a.m. and we eat dinner at 8 p.m.'),
        keys('Short hand: hours. Long hand: minutes.', 'Each number = 5 minutes.', 'a.m. = before noon, p.m. = after noon.'),
        tip('Count by fives around the clock: 5, 10, 15, 20 …'),
      ],
      examples: [
        ex('The short hand is just past 4 and the long hand is on 6. What time is it?', ['Long hand on 6 → 6 × 5 = 30 minutes', 'Hour is 4'], '4:30', { kind: 'clock', h: 4, m: 30 }),
        ex('Is lunch at 1 o\'clock a.m. or p.m.?', ['Lunch is in the afternoon, after noon.'], 'p.m.'),
      ],
      practice: [
        tp('read', (r) => {
          const hh = r.int(1, 12), mm = r.int(0, 11) * 5;
          const swap = mm === 0 ? 12 : mm / 5;
          const wrong = [hm(hh, (mm + 5) % 60), hm(swap, (hh % 12) * 5), hm(hh === 12 ? 1 : hh + 1, mm)];
          return mcq(r, 'What time does the clock show?', hm(hh, mm), wrong,
            ['The short hand shows the hour.', 'The long hand: count by 5s from 12.', `The long hand points to ${swap}.`],
            [`Hour: ${hh}. Minutes: ${swap === 12 ? 0 : swap} × 5 = ${mm}.`, `Time = ${hm(hh, mm)}`], [], { visual: { kind: 'clock', h: hh, m: mm } });
        }),
        bank('ampm', [
          { q: 'You wake up at 6:30 in the morning. Is it a.m. or p.m.?', a: 'a.m.', w: ['p.m.'], h: ['Morning is before noon.'], s: ['Before noon → a.m.'], v: em('🌅') },
          { q: 'You go to bed at 9:00 at night. Is it a.m. or p.m.?', a: 'p.m.', w: ['a.m.'], h: ['Night comes after noon.'], s: ['After noon → p.m.'], v: em('🌙') },
          { q: 'School prayer is at 9:15 in the morning. a.m. or p.m.?', a: 'a.m.', w: ['p.m.'], h: ['Morning is before noon.'], s: ['9:15 a.m.'], v: em('🏫') },
          { q: 'Evening tea is at 5:00. a.m. or p.m.?', a: 'p.m.', w: ['a.m.'], h: ['Evening is after noon.'], s: ['5:00 p.m.'], v: em('☕') },
          { q: 'The milkman comes at 5:30 early in the morning. a.m. or p.m.?', a: 'a.m.', w: ['p.m.'], h: ['Early morning is before noon.'], s: ['5:30 a.m.'], v: em('🥛') },
          { q: 'How many hours are there in one full day?', a: '24', w: ['12', '60', '7'], h: ['12 a.m. hours and 12 p.m. hours.'], s: ['12 + 12 = 24 hours'] },
        ]),
      ],
    },
    {
      id: 'ts5.m.time.duration', title: 'How long does it take? (duration)', prereqs: ['ts5.m.time.read'],
      intro: [
        h('From start to end'),
        p('A cricket match starts at 2:00 p.m. and ends at 5:30 p.m. How long did it last? From 2:00 to 5:00 is 3 hours. Then 30 more minutes. So 3 hours 30 minutes.'),
        f('1 hour = 60 minutes'),
        photo('⏰', 'An alarm clock helps you wake up on time.'),
        keys('Count whole hours first, then the extra minutes.', '1 hour = 60 minutes.'),
        tip('Use a number line: jump to the next full hour first, then the rest.'),
      ],
      examples: [
        ex('A bus leaves at 10:15 a.m. and arrives at 11:45 a.m. How long is the journey?', ['10:15 → 11:15 = 1 hour', '11:15 → 11:45 = 30 minutes'], '1 hour 30 minutes = 90 minutes'),
        ex('A film starts at 6:00 p.m. and lasts 2 hours 20 minutes. When does it end?', ['6:00 + 2 hours = 8:00', '8:00 + 20 minutes = 8:20'], '8:20 p.m.'),
      ],
      practice: [
        tp('mins', (r) => {
          const sh = r.int(7, 10), sm = r.int(0, 5) * 5, dur = r.int(4, 30) * 5;
          const end = sh * 60 + sm + dur;
          return typed(`A class picnic game starts at ${hm(sh, sm)} a.m. and ends at ${hm(Math.floor(end / 60), end % 60)} a.m. How many minutes did it last?`, num(dur, 'minutes'),
            ['Jump to the next full hour first.', '1 hour = 60 minutes.', 'Add the jumps.'],
            [`From ${hm(sh, sm)} to ${hm(Math.floor(end / 60), end % 60)} is ${dur} minutes.`]);
        }),
        tp('hrs2min', (r) => {
          const hh = r.int(1, 4), mm = r.int(1, 11) * 5;
          return typed(`A train journey from Secunderabad takes ${hh} hour${hh > 1 ? 's' : ''} ${mm} minutes. How many minutes is that?`, num(hh * 60 + mm, 'minutes'),
            ['1 hour = 60 minutes.', `${hh} × 60 = ${hh * 60}.`, `Add ${mm}.`], [`${hh * 60} + ${mm} = ${hh * 60 + mm} minutes`], [[String(hh * 100 + mm), '1 hour is 60 minutes, not 100.']]);
        }),
        tp('end', (r) => {
          const sh = r.int(1, 5), sm = r.int(0, 3) * 15, dh = r.int(1, 2), dm = r.pick([15, 30, 45]);
          const t = sh * 60 + sm + dh * 60 + dm;
          const ans = hm(Math.floor(t / 60), t % 60);
          return mcq(r, `A function starts at ${hm(sh, sm)} p.m. and lasts ${dh} hour${dh > 1 ? 's' : ''} ${dm} minutes. When does it end?`, `${ans} p.m.`,
            [`${hm(Math.floor(t / 60) + 1, t % 60)} p.m.`, `${hm(sh + dh, (sm + dm) % 60)} p.m.`, `${hm(Math.floor((t - 60) / 60), t % 60)} p.m.`].filter((x) => x !== `${ans} p.m.`),
            ['Add the hours first.', 'Then add the minutes.', 'If minutes reach 60, that makes one more hour.'],
            [`${hm(sh, sm)} + ${dh} h = ${hm(sh + dh, sm)}`, `+ ${dm} min = ${ans} p.m.`], [], {});
        }, 2),
      ],
    },
    {
      id: 'ts5.m.time.calendar', title: 'Calendar, dates and age', prereqs: ['ts5.m.time.read'],
      intro: [
        h('Days, months and years'),
        p('A year has 12 months and 365 days (366 in a leap year). Some months have 31 days, some have 30, and February has 28 (29 in a leap year).'),
        p('A birth certificate shows the date you were born, like 15-08-2016: day 15, month 8 (August), year 2016.'),
        p('To find your age, subtract your birth year from this year (after your birthday).'),
        photo('📖', 'A calendar helps us plan festivals like Bathukamma, Bonalu and Sankranti.'),
        keys('12 months, 365 days.', '30 days: April, June, September, November.', 'February: 28 days (29 in a leap year).', 'Age = this year − birth year (after your birthday).'),
        tip('Count your knuckles: a knuckle month has 31 days, a dip between knuckles has 30 (or 28/29 for February).'),
      ],
      examples: [
        ex('Priya was born in 2016. How old is she on her birthday in 2026?', ['2026 − 2016 = 10'], '10 years'),
        ex('Today is 12 June. What is the date after 10 days?', ['12 + 10 = 22, June has 30 days'], '22 June'),
      ],
      practice: [
        tp('age', (r) => {
          const y = r.int(2010, 2020), now = r.int(2025, 2030), x = nm(r);
          return typed(`${x}'s birth certificate says ${x} was born in ${y}. How old will ${x} be on the birthday in ${now}?`, num(now - y),
            ['Subtract the birth year from the later year.', `${now} − ${y} = ?`], [`${now} − ${y} = ${now - y} years`]);
        }),
        tp('days', (r) => {
          const [m, d] = r.pick(MONTHS);
          return mcq(r, `How many days are there in ${m}${m === 'February' ? ' in a year that is not a leap year' : ''}?`, String(d), ['28', '29', '30', '31'].filter((x) => x !== String(d)),
            ['Use the knuckle trick.', '30 days: April, June, September, November.'], [`${m} has ${d} days.`]);
        }),
        tp('after', (r) => {
          const [m, d] = r.pick(MONTHS.filter((x) => x[1] >= 30)), s = r.int(1, 15), k = r.int(3, d - s);
          return typed(`Today is ${s} ${m}. What date will it be after ${k} days? (Type just the day number.)`, num(s + k),
            [`Add ${k} to ${s}.`, `${m} has ${d} days, so we stay in ${m}.`], [`${s} + ${k} = ${s + k}`, `${s + k} ${m}`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 13 FRACTIONS
const fb = (n: number, d: number): VisualSpec => ({ kind: 'fraction-bar', parts: d, shaded: n });
const ch13: USpec = {
  id: 'ts5.m.ch13', subject: 'math', title: 'Fractions', source: src(13),
  objectives: [
    {
      id: 'ts5.m.frac.part', title: 'Fractions of a whole and of a group',
      intro: [
        h('Equal parts'),
        p('A farmer divides his land into 4 equal parts and grows paddy in 1 part. Paddy grows on one-fourth (1/4) of the land.'),
        vis({ kind: 'fraction-circle', parts: 4, shaded: 1 }, 'One of four equal parts is shaded: 1/4'),
        def('Fraction', 'Top number (numerator): parts we take. Bottom number (denominator): equal parts in the whole.'),
        p('Fractions of a group: 1/4 of 20 laddoos → share 20 into 4 equal groups → 5 in each group. So 3/4 of 20 = 3 × 5 = 15.'),
        vis({ kind: 'objects', emoji: '🟠', count: 20, groupsOf: 5 }, '20 laddoos in 4 groups of 5'),
        keys('The parts must be EQUAL.', 'n/d of a group: divide by d, then multiply by n.'),
        tip('The bigger the denominator, the smaller each piece.'),
      ],
      examples: [
        ex('What fraction is shaded?', ['5 equal parts in all', '2 are shaded'], '2/5', fb(2, 5)),
        ex('Find 2/3 of 18 mangoes.', ['18 ÷ 3 = 6', '2 × 6 = 12'], '12 mangoes'),
      ],
      practice: [
        tp('shaded', (r) => {
          const d = r.int(3, 10), n = r.int(1, d - 1), circle = r.int(0, 1) === 1 && d <= 8;
          return typed('What fraction of the shape is shaded?', frac(n, d),
            ['Count all the equal parts — that is the bottom number.', 'Count the shaded parts — that is the top number.'],
            [`${n} shaded out of ${d} equal parts = ${n}/${d}`], [[`${d}/${n}`, 'Shaded parts go on TOP; all the parts go at the bottom.'], [`${n}/${d - n}`, 'The bottom number is ALL the parts, not just the unshaded ones.']],
            { visual: circle ? { kind: 'fraction-circle', parts: d, shaded: n } : fb(n, d) });
        }),
        tp('ofgroup', (r) => {
          const d = r.pick([2, 3, 4, 5, 6]), n = r.int(1, d - 1), k = r.int(2, 8), total = d * k;
          const t = r.pick(['laddoos', 'mangoes', 'marbles', 'flowers', 'bangles']);
          return typed(`Find ${n}/${d} of ${total} ${t}.`, num(n * k),
            [`First find 1/${d}: ${total} ÷ ${d}.`, `1/${d} of ${total} = ${k}.`, `Now multiply by ${n}.`],
            [`${total} ÷ ${d} = ${k}`, `${n} × ${k} = ${n * k} ${t}`], [[String(k), `That is 1/${d}. You need ${n} such parts.`]]);
        }),
        tp('land', (r) => {
          const d = r.pick([4, 5, 6, 8]), a = r.int(1, d - 2), crops = r.shuffle(['paddy', 'cotton', 'maize', 'turmeric']).slice(0, 2);
          return typed(`A farmer's land has ${d} equal parts. ${crops[0]} grows on ${a} part${a > 1 ? 's' : ''} and ${crops[1]} on the rest. What fraction of the land has ${crops[1]}?`, frac(d - a, d),
            [`How many parts are left after ${crops[0]}?`, `${d} − ${a} = ${d - a}.`], [`${crops[1]}: ${d - a} out of ${d} parts = ${d - a}/${d}`], [[`${a}/${d}`, `That is the ${crops[0]} part.`]]);
        }, 2),
      ],
    },
    {
      id: 'ts5.m.frac.compare', title: 'Comparing fractions and fractions on a number line', prereqs: ['ts5.m.frac.part'],
      intro: [
        h('Which piece is bigger?'),
        p('Same bottom number? Then compare the tops: 3/8 is more than 2/8.'),
        p('Same top number of 1? Then a bigger bottom number means smaller pieces: 1/3 is bigger than 1/6. Think of one roti shared by 3 friends or by 6 friends!'),
        vis(fb(1, 3), '1/3 of a bar'), vis(fb(1, 6), '1/6 of a bar — smaller'),
        h('On a number line'),
        p('Cut the gap from 0 to 1 into equal parts. If there are 4 parts, the marks are 1/4, 2/4, 3/4 and then 4/4 = 1.'),
        vis({ kind: 'number-line', from: 0, to: 4, step: 1, marks: [3] }, 'From 0 to 1 cut into 4 parts: the mark at step 3 is 3/4'),
        keys('Same denominator: bigger numerator wins.', 'Numerator 1: smaller denominator wins.', 'd/d = 1 whole.'),
        tip('2/4 and 1/2 are equal — they cover the same length.'),
      ],
      examples: [
        ex('Which is bigger: 5/9 or 7/9?', ['Same bottom number', '7 > 5'], '7/9'),
        ex('Which is bigger: 1/4 or 1/7?', ['Shared among 4 is a bigger piece than among 7'], '1/4'),
      ],
      practice: [
        tp('same', (r) => {
          const d = r.int(5, 12), a = r.int(1, d - 1); let b = r.int(1, d - 1); if (b === a) b = a === 1 ? 2 : a - 1;
          const big = Math.max(a, b);
          return mcq(r, `Which is bigger: ${a}/${d} or ${b}/${d}?`, `${big}/${d}`, [`${Math.min(a, b)}/${d}`, 'They are equal'],
            ['The pieces are the same size.', 'More pieces means more.'], [`${big} > ${Math.min(a, b)}, so ${big}/${d} is bigger.`], [], { visual: fb(big, d) });
        }),
        tp('unit', (r) => {
          const a = r.int(2, 6); let b = r.int(2, 10); if (b === a) b = a + 2;
          const big = Math.min(a, b);
          return mcq(r, `A roti is shared equally. Which piece is bigger: 1/${a} or 1/${b}?`, `1/${big}`, [`1/${Math.max(a, b)}`, 'They are equal'],
            ['Sharing with MORE people makes each piece smaller.', 'Compare the bottom numbers.'], [`1/${big} is bigger because the roti is shared among fewer people.`],
            [['wrong', 'A bigger bottom number means smaller pieces.']]);
        }),
        tp('line', (r) => {
          const d = r.int(3, 8), k = r.int(1, d - 1);
          return typed(`The gap from 0 to 1 is cut into ${d} equal parts. What fraction is at mark number ${k} from 0?`, frac(k, d),
            [`Each part is 1/${d}.`, `${k} parts from 0 is ${k}/${d}.`], [`${k} × 1/${d} = ${k}/${d}`], [], { visual: { kind: 'number-line', from: 0, to: d, step: 1, marks: [k] } });
        }),
      ],
    },
    {
      id: 'ts5.m.frac.measure', title: 'Fractions in money and measurement', prereqs: ['ts5.m.frac.part'],
      intro: [
        h('Half a kilo, quarter of a rupee hundred'),
        p('We use fractions every day. Half a kilogram of tomatoes = 1/2 of 1000 g = 500 g. A quarter of ₹100 = ₹25.'),
        vis({ kind: 'coins', rupees: [20, 5] }, '₹25 is one quarter of ₹100'),
        f('1/2 of 1 m = 50 cm,  1/4 of 1 L = 250 mL,  3/4 of 1 kg = 750 g'),
        keys('Find 1 part by dividing.', 'Multiply by the number of parts you need.'),
        tip('1 m = 100 cm, 1 kg = 1000 g, 1 L = 1000 mL, ₹1 = 100 paise.'),
      ],
      examples: [
        ex('How many grams is 3/4 kg?', ['1 kg = 1000 g', '1000 ÷ 4 = 250', '3 × 250 = 750'], '750 g'),
        ex('Ravi spends 1/5 of ₹200 on a book. How much?', ['200 ÷ 5 = 40'], '₹40'),
      ],
      practice: [
        tp('money', (r) => {
          const d = r.pick([2, 4, 5, 10]), n = r.int(1, d - 1), tot = r.pick([100, 200, 500]);
          return typed(`What is ${n}/${d} of ₹${tot}?`, num((tot / d) * n, '₹'),
            [`1/${d} of ₹${tot} = ₹${tot / d}.`, `Multiply by ${n}.`], [`${tot} ÷ ${d} = ${tot / d}`, `${n} × ${tot / d} = ₹${(tot / d) * n}`], [], { unitHint: '₹' });
        }),
        tp('measure', (r) => {
          const [d, n] = r.pick([[2, 1], [4, 1], [4, 3], [5, 2], [10, 3], [5, 4]] as [number, number][]);
          const [u, base, small] = r.pick([['kg', 1000, 'g'], ['L', 1000, 'mL'], ['m', 100, 'cm']] as [string, number, string][]);
          return typed(`How many ${small} is ${n}/${d} ${u}?`, num((base / d) * n, small),
            [`1 ${u} = ${base} ${small}.`, `1/${d} of ${base} = ${base / d}.`, `Multiply by ${n}.`], [`${base} ÷ ${d} × ${n} = ${(base / d) * n} ${small}`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 14 FACTORS AND MULTIPLES
const mults = (k: number, n: number) => Array.from({ length: n }, (_, i) => k * (i + 1));
const factors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const ch14: USpec = {
  id: 'ts5.m.ch14', subject: 'math', title: 'Factors and Multiples', source: src(14),
  objectives: [
    {
      id: 'ts5.m.fm.multiples', title: 'Multiples and common multiples',
      intro: [
        h('Skip counting gives multiples'),
        p('Count in 4s: 4, 8, 12, 16, 20 … These are the MULTIPLES of 4. They are the answers in the 4 times table.'),
        vis({ kind: 'number-line', from: 0, to: 24, step: 4, jumps: [[0, 4], [4, 8], [8, 12], [12, 16], [16, 20], [20, 24]] }, 'Jumps of 4 land on multiples of 4'),
        p('Multiples of 3: 3, 6, 9, 12, 15, 18 … Multiples of 4: 4, 8, 12, 16 … 12 is in BOTH lists. It is a COMMON multiple. It is the smallest one, so it is the lowest common multiple.'),
        photo('🚌', 'One bus comes every 3 minutes, another every 4 minutes. Both come together after 12 minutes.'),
        keys('Multiples of k: k, 2k, 3k, …', 'Common multiple: in both lists.', 'Every number is a multiple of itself.'),
        tip('A list of multiples never ends!'),
      ],
      examples: [
        ex('Write the first five multiples of 6.', ['6 × 1, 6 × 2, 6 × 3, 6 × 4, 6 × 5'], '6, 12, 18, 24, 30'),
        ex('Find the smallest common multiple of 4 and 6.', ['Multiples of 4: 4, 8, 12, …', 'Multiples of 6: 6, 12, …'], '12'),
      ],
      practice: [
        tp('tap', (r) => {
          const k = r.int(3, 9);
          const yes = r.shuffle(mults(k, 10)).slice(0, 3);
          const no: number[] = [];
          while (no.length < 3) { const x = r.int(10, 9 * k + 5); if (x % k && !no.includes(x)) no.push(x); }
          return {
            type: 'tap', prompt: `Tap all the multiples of ${k}.`, ...tapAll(r, [...yes, ...no].map((x) => ({ label: String(x), ok: x % k === 0 }))),
            hints: [`Say the ${k} times table.`, `A multiple of ${k} can be shared into groups of ${k} with nothing left.`],
            solution: [`Multiples of ${k}: ${yes.sort((a, b) => a - b).join(', ')}.`],
          };
        }),
        tp('lcm', (r) => {
          const [a, b] = r.pick([[2, 3], [3, 4], [4, 6], [2, 5], [3, 5], [4, 5], [6, 8], [3, 6], [5, 10], [6, 9]] as [number, number][]);
          const L_ = lcm(a, b);
          return typed(`Bus A comes every ${a} minutes. Bus B comes every ${b} minutes. Both just came together. After how many minutes will they come together again?`, num(L_, 'minutes'),
            [`List multiples of ${a}: ${mults(a, 4).join(', ')} …`, `List multiples of ${b}: ${mults(b, 4).join(', ')} …`, 'Find the first number in both lists.'],
            [`Smallest common multiple of ${a} and ${b} = ${L_}`], [[String(a * b), `${a * b} is a common multiple, but is there a smaller one?`]]);
        }, 2),
        tp('nth', (r) => {
          const k = r.int(3, 12), n = r.int(3, 10);
          return typed(`What is the ${n}th multiple of ${k}?`, num(k * n), [`Multiply ${k} × ${n}.`], [`${k} × ${n} = ${k * n}`]);
        }),
      ],
    },
    {
      id: 'ts5.m.fm.factors', title: 'Factors', prereqs: ['ts5.m.fm.multiples'],
      intro: [
        h('Numbers that divide exactly'),
        p('Arrange 12 chairs in equal rows: 1 row of 12, 2 rows of 6, 3 rows of 4, 4 rows of 3, 6 rows of 2, 12 rows of 1. So 1, 2, 3, 4, 6 and 12 are the FACTORS of 12.'),
        vis({ kind: 'objects', emoji: '🪑', count: 12, groupsOf: 4 }, '12 chairs in 3 rows of 4'),
        def('Factor', 'A number that divides another number exactly, with no remainder.'),
        keys('1 is a factor of every number.', 'Every number is a factor of itself.', 'Factors come in pairs: 3 × 4 = 12.'),
        tip('If 12 is a multiple of 3, then 3 is a factor of 12.'),
      ],
      examples: [
        ex('Find all factors of 18.', ['1 × 18, 2 × 9, 3 × 6'], '1, 2, 3, 6, 9, 18'),
        ex('Is 7 a factor of 30?', ['30 ÷ 7 = 4 remainder 2'], 'No'),
      ],
      practice: [
        tp('tap', (r) => {
          const n = r.pick([12, 16, 18, 20, 24, 28, 30, 36, 40]);
          const fs = factors(n);
          const yes = r.shuffle(fs.filter((x) => x > 1 && x < n)).slice(0, 3);
          const no = r.shuffle(Array.from({ length: n }, (_, i) => i + 1).filter((x) => n % x && x > 1)).slice(0, 3);
          return {
            type: 'tap', prompt: `Tap all the factors of ${n}.`, ...tapAll(r, [...yes, ...no].map((x) => ({ label: String(x), ok: n % x === 0 }))),
            hints: [`Does it divide ${n} with no remainder?`, 'Think of pairs that multiply to ' + n + '.'],
            solution: [`Factors of ${n}: ${fs.join(', ')}.`],
          };
        }),
        tp('count', (r) => {
          const n = r.pick([6, 8, 10, 12, 15, 16, 18, 20, 24]);
          const fs = factors(n);
          return typed(`How many factors does ${n} have?`, num(fs.length),
            ['Find the pairs that multiply to ' + n + '.', 'Do not forget 1 and the number itself.'], [`Factors of ${n}: ${fs.join(', ')}`, `That is ${fs.length} factors.`]);
        }, 2),
        tp('isf', (r) => {
          const a = r.int(2, 9), b = r.int(12, 60), yes = b % a === 0;
          return mcq(r, `Is ${a} a factor of ${b}?`, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'],
            [`Divide ${b} by ${a}.`, 'If there is no remainder, it is a factor.'], [`${b} ÷ ${a} = ${Math.floor(b / a)} remainder ${b % a}`, yes ? 'No remainder, so yes.' : 'There is a remainder, so no.']);
        }),
      ],
    },
    {
      id: 'ts5.m.fm.divis', title: 'Divisibility by 2 and 5', prereqs: ['ts5.m.fm.multiples'],
      intro: [
        h('Quick tests'),
        p('A number can be shared equally in 2s if its ones digit is 0, 2, 4, 6 or 8. These are EVEN numbers.'),
        p('A number is divisible by 5 if its ones digit is 0 or 5.'),
        p('If the ones digit is 0, the number is divisible by both 2 and 5 (and by 10).'),
        keys('By 2: last digit 0, 2, 4, 6, 8.', 'By 5: last digit 0 or 5.', 'By 2 and 5: last digit 0.'),
        tip('Just look at the last digit — no need to divide!'),
      ],
      examples: [
        ex('Is 3,475 divisible by 5?', ['Ones digit is 5'], 'Yes'),
        ex('Is 1,238 divisible by 5?', ['Ones digit is 8 (not 0 or 5)'], 'No, but it is divisible by 2'),
      ],
      practice: [
        tp('tap5', (r) => {
          const k = r.pick([2, 5]);
          const yes: number[] = [], no: number[] = [];
          while (yes.length < 3) { const x = r.int(10, 999); if (x % k === 0 && !yes.includes(x)) yes.push(x); }
          while (no.length < 3) { const x = r.int(10, 999); if (x % k && !no.includes(x)) no.push(x); }
          return {
            type: 'tap', prompt: `Tap all the numbers divisible by ${k}.`, ...tapAll(r, [...yes, ...no].map((x) => ({ label: String(x), ok: x % k === 0 }))),
            hints: ['Look at the ones digit only.', k === 2 ? 'It must be 0, 2, 4, 6 or 8.' : 'It must be 0 or 5.'], solution: [`Divisible by ${k}: ${yes.join(', ')}.`],
          };
        }),
        tp('both', (r) => {
          const x = r.int(10, 999);
          const ans = x % 10 === 0 ? 'By both 2 and 5' : x % 2 === 0 ? 'By 2 only' : x % 5 === 0 ? 'By 5 only' : 'By neither';
          return mcq(r, `Is ${x} divisible by 2, by 5, by both or by neither?`, ans, ['By both 2 and 5', 'By 2 only', 'By 5 only', 'By neither'].filter((a) => a !== ans),
            ['Look at the ones digit.', 'Even last digit → divisible by 2.', 'Last digit 0 or 5 → divisible by 5.'], [`The ones digit is ${x % 10}. ${ans}.`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 15 SYMMETRY
const ch15: USpec = {
  id: 'ts5.m.ch15', subject: 'math', title: 'Symmetry', source: src(15),
  objectives: [
    {
      id: 'ts5.m.sym.lines', title: 'Lines of symmetry',
      intro: [
        h('Mirror halves'),
        p('Fold a butterfly picture down the middle. Both halves match exactly! The fold line is a LINE OF SYMMETRY.'),
        photo('🦋', 'A butterfly\'s two wings are mirror halves.'),
        p('Paper-cut designs for festivals are made by folding paper and cutting. When you open it, the design is symmetrical.'),
        p('A square has 4 lines of symmetry, a rectangle has 2, an equal-sided triangle has 3 and a circle has very many (any line through the centre).'),
        vis({ kind: 'shape', shape: 'square' }, 'A square: 4 lines of symmetry'),
        keys('Both halves must match exactly when folded.', 'Letters like A, H, M, O, T have symmetry; F, G, J, P, R do not.'),
        tip('Hold a small mirror on the line. If the picture looks whole, it is a line of symmetry.'),
      ],
      examples: [
        ex('How many lines of symmetry does a rectangle have?', ['Fold top to bottom — halves match.', 'Fold left to right — halves match.', 'Diagonal folds do not match.'], '2'),
        ex('Does the letter H have a line of symmetry?', ['Fold it down the middle — the halves match.'], 'Yes (it has 2)'),
      ],
      practice: [
        bank('shape', [
          { q: 'How many lines of symmetry does a square have?', a: '4', w: ['2', '1', '0'], h: ['Fold side to side, top to bottom, and along both diagonals.'], s: ['A square has 4 lines of symmetry.'], v: { kind: 'shape', shape: 'square' } },
          { q: 'How many lines of symmetry does a rectangle (not a square) have?', a: '2', w: ['4', '1', '0'], h: ['Diagonal folds do not match.'], s: ['A rectangle has 2 lines of symmetry.'], v: { kind: 'shape', shape: 'rectangle' } },
          { q: 'How many lines of symmetry does an equal-sided triangle have?', a: '3', w: ['1', '2', '0'], h: ['Fold from each corner to the middle of the opposite side.'], s: ['It has 3 lines of symmetry.'], v: { kind: 'shape', shape: 'triangle' } },
          { q: 'How many lines of symmetry does a circle have?', a: 'Very many', w: ['1', '2', '4'], h: ['Any fold through the centre works.'], s: ['A circle has countless lines of symmetry.'], v: { kind: 'shape', shape: 'circle' } },
          { q: 'How many lines of symmetry does a regular hexagon have?', a: '6', w: ['3', '2', '4'], h: ['Fold corner to corner and side to side.'], s: ['A regular hexagon has 6 lines of symmetry.'], v: { kind: 'shape', shape: 'hexagon' } },
          { q: 'How many lines of symmetry does the letter A have?', a: '1', w: ['2', '0', '4'], h: ['Fold it down the middle.'], s: ['A has 1 line of symmetry (up and down).'] },
        ]),
        tapT('letters', 'Tap the letters that have at least one line of symmetry.', [['A', true], ['H', true], ['M', true], ['O', true], ['T', true], ['X', true], ['F', false], ['G', false], ['J', false], ['P', false], ['R', false], ['L', false]],
          ['Imagine folding the letter.', 'Try a straight-down fold and a side-to-side fold.']),
      ],
    },
    {
      id: 'ts5.m.sym.turns', title: 'Turns: quarter, half and full; clockwise and anticlockwise',
      intro: [
        h('Turning like clock hands'),
        p('Clock hands move CLOCKWISE. Turning the other way is ANTICLOCKWISE (like opening a bottle cap).'),
        vis({ kind: 'clock', h: 12, m: 15 }, 'The minute hand from 12 to 3 is a quarter turn clockwise'),
        p('From 12 to 3 is a quarter turn. From 12 to 6 is a half turn. From 12 to 9 is three-quarter turn. Back to 12 is a full turn.'),
        p('Some shapes look the same after a half turn — like the letter S, N or Z.'),
        keys('Quarter turn = 1 right angle.', 'Half turn = 2 right angles.', 'Full turn = 4 right angles.'),
        tip('Opening a tap is usually anticlockwise; closing it is clockwise.'),
      ],
      examples: [
        ex('The minute hand goes from 12 to 6. What turn is it?', ['12 → 3 → 6: two quarters'], 'A half turn'),
        ex('Does the letter S look the same after a half turn?', ['Turn the page upside down.'], 'Yes'),
      ],
      practice: [
        tp('clock', (r) => {
          const a = r.int(1, 12), k = r.int(1, 4), b = ((a - 1 + 3 * k) % 12) + 1;
          const names = ['a quarter turn', 'a half turn', 'a three-quarter turn', 'a full turn'];
          return mcq(r, `The minute hand turns clockwise from ${a} to ${b}${k === 4 ? ' (all the way round)' : ''}. What turn is it?`, names[k - 1], names.filter((_, i) => i !== k - 1),
            ['Every 3 numbers is a quarter turn.', 'Count in jumps of 3.'], [`${a} → ${b} is ${3 * k} numbers = ${names[k - 1]}.`]);
        }),
        bank('dir', [
          { q: 'Clock hands move…', a: 'clockwise', w: ['anticlockwise'], h: ['The name tells you!'], s: ['Clock hands move clockwise.'], v: em('🕰️') },
          { q: 'Opening the cap of a water bottle is usually…', a: 'anticlockwise', w: ['clockwise'], h: ['It is the opposite of clock hands.'], s: ['Caps usually open anticlockwise.'], v: em('🧴') },
          { q: 'Which letter looks the same after a half turn?', a: 'S', w: ['A', 'T', 'E'], h: ['Turn the letters upside down.'], s: ['S looks the same after a half turn.'] },
          { q: 'Which letter looks the same after a half turn?', a: 'N', w: ['M', 'V', 'L'], h: ['Turn the page upside down.'], s: ['N looks the same after a half turn.'] },
          { q: 'How many quarter turns make a full turn?', a: '4', w: ['2', '3', '6'], h: ['12 → 3 → 6 → 9 → 12.'], s: ['4 quarter turns.'] },
          { q: 'A half turn is the same as how many quarter turns?', a: '2', w: ['1', '3', '4'], h: ['12 → 3 → 6.'], s: ['2 quarter turns.'] },
        ]),
      ],
    },
  ],
};

// ================================================================== CH 16 PATTERNS
const PAT = ['🌼', '🔵', '🔺', '⭐', '🟩', '🍃', '🟠'];
const ch16: USpec = {
  id: 'ts5.m.ch16', subject: 'math', title: 'Patterns', source: src(16),
  objectives: [
    {
      id: 'ts5.m.pat.number', title: 'Number patterns and rules',
      intro: [
        h('Find the rule'),
        p('5, 10, 15, 20, … The rule is "add 5". The next number is 25.'),
        p('2, 4, 8, 16, … The rule is "double it" (× 2). The next number is 32.'),
        p('100, 90, 80, 70, … The rule is "subtract 10". The next number is 60.'),
        vis({ kind: 'number-line', from: 0, to: 25, step: 5, jumps: [[0, 5], [5, 10], [10, 15], [15, 20], [20, 25]] }, 'Jumps of 5'),
        h('A number trick'),
        p('Think of any number. Double it. Add 10. Halve it. Take away the number you first thought of. The answer is always 5! Why? Doubling and halving cancel, and half of 10 is 5.'),
        keys('Look at how each number changes.', 'Check the rule on every step.'),
        tip('Find the difference between neighbours. If it is always the same, the rule is "add" or "subtract".'),
      ],
      examples: [
        ex('Next number: 7, 11, 15, 19, …', ['Each time +4', '19 + 4 = 23'], '23'),
        ex('Next number: 3, 6, 12, 24, …', ['Each time × 2', '24 × 2 = 48'], '48'),
      ],
      practice: [
        tp('next', (r) => {
          const kind = r.int(0, 2), a = r.int(2, 20), k = r.int(2, 9);
          const seq = kind === 0 ? [0, 1, 2, 3].map((i) => a + i * k) : kind === 1 ? [0, 1, 2, 3].map((i) => a * 2 ** i).map((x) => x) : [0, 1, 2, 3].map((i) => 100 + a - i * k);
          const next = kind === 0 ? a + 4 * k : kind === 1 ? a * 16 : 100 + a - 4 * k;
          const rule = kind === 0 ? `add ${k}` : kind === 1 ? 'double (× 2)' : `subtract ${k}`;
          return typed(`What comes next? ${seq.join(', ')}, …`, num(next),
            ['How does each number change?', 'Find the difference between two neighbours.', `The rule is: ${rule}.`], [`Rule: ${rule}.`, `Next: ${next}`]);
        }),
        tp('rule', (r) => {
          const k = r.int(2, 9), a = r.int(1, 30), kind = r.int(0, 1);
          const seq = [0, 1, 2, 3].map((i) => (kind ? 60 + a - i * k : a + i * k));
          const ans = kind ? `Subtract ${k}` : `Add ${k}`;
          return mcq(r, `What is the rule? ${seq.join(', ')}, …`, ans, [kind ? `Add ${k}` : `Subtract ${k}`, `Add ${k + 1}`, 'Double'],
            ['Subtract one number from the next.', 'Is it getting bigger or smaller?'], [`Each step changes by ${k}: ${ans.toLowerCase()}.`]);
        }),
        tp('trick', (r) => {
          const x = r.int(3, 30), add = r.pick([4, 6, 8, 10, 12, 20]);
          return typed(`${nm(r)} thinks of ${x}. Double it, add ${add}, halve it, then take away ${x}. What is the answer?`, num(add / 2),
            [`Double: ${2 * x}.`, `Add ${add}: ${2 * x + add}.`, `Halve: ${x + add / 2}. Now take away ${x}.`], [`${2 * x} → ${2 * x + add} → ${x + add / 2} → ${add / 2}`, `The answer is always half of ${add}.`]);
        }, 2),
      ],
    },
    {
      id: 'ts5.m.pat.shape', title: 'Shape patterns that repeat and grow',
      intro: [
        h('Repeat the core'),
        p('In a rangoli or a border on a saree, a small group of shapes repeats again and again. That small group is the CORE of the pattern.'),
        vis({ kind: 'emoji', text: '🌼🔵🌼🔵🌼🔵' }, 'Flower, dot, flower, dot …'),
        p('Growing patterns get bigger each step: 1 matchstick square uses 4 sticks, 2 squares in a row use 7, 3 squares use 10 — add 3 each time.'),
        photo('🎨', 'Muggulu (rangoli) at Sankranti is full of repeating and turning patterns.'),
        keys('Find the core that repeats.', 'Growing patterns: find how much is added each time.'),
        tip('Say the pattern aloud: "flower, dot, flower, dot…" — your ears can spot the core!'),
      ],
      examples: [
        ex('What comes next? 🔺⭐⭐🔺⭐⭐🔺', ['Core: 🔺⭐⭐', 'After 🔺 comes ⭐'], '⭐'),
        ex('Squares in a row use 4, 7, 10, … sticks. How many for 4 squares?', ['Add 3 each time', '10 + 3 = 13'], '13 sticks'),
      ],
      practice: [
        tp('next', (r) => {
          const len = r.int(2, 3), core = r.shuffle(PAT).slice(0, len), shown = r.int(len + 2, 2 * len + 2);
          const seq = Array.from({ length: shown }, (_, i) => core[i % len]);
          const ans = core[shown % len];
          return {
            type: 'mcq', prompt: `What comes next? ${seq.join(' ')} …`, visual: em(seq.join('')),
            ...choose(r, ans, core.filter((x) => x !== ans).concat(PAT.filter((x) => !core.includes(x)).slice(0, 1)), 3),
            hints: ['Find the group that repeats.', `The core is ${core.join(' ')}.`], solution: [`Core: ${core.join(' ')}`, `Next: ${ans}`],
          };
        }),
        tp('sticks', (r) => {
          const n = r.int(4, 10);
          return typed(`Matchstick squares in a row: 1 square uses 4 sticks, 2 squares use 7, 3 squares use 10. How many sticks for ${n} squares?`, num(3 * n + 1),
            ['Each new square adds 3 sticks.', `Keep adding 3 until you reach ${n} squares.`], [`4 + 3 × ${n - 1} = ${3 * n + 1} sticks`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 17 AI AND DIGITAL LITERACY
const ch17: USpec = {
  id: 'ts5.m.ch17', subject: 'math', title: 'Artificial Intelligence (AI) and Digital Literacy', source: src(17),
  objectives: [
    {
      id: 'ts5.m.ai.what', title: 'What is AI?',
      intro: [
        h('Machines that learn from examples'),
        p('A calculator only follows fixed steps. Artificial Intelligence (AI) is a computer program that learns patterns from lots of examples. Then it can make a good guess about something new.'),
        p('If you show a program thousands of photos of mangoes and bananas, it can learn to tell a new mango photo from a banana photo.'),
        photo('💡', 'AI is an idea made by people: computers that learn from examples.'),
        p('You may have seen AI in: voice assistants that answer questions, maps that suggest the fastest route, apps that read text aloud, and tools that translate English into Telugu.'),
        keys('AI learns from many examples.', 'AI can make mistakes — it guesses.', 'People build AI and must check its work.'),
        tip('AI is a helper. You still need to think for yourself!'),
      ],
      examples: [
        ex('Is a map app that suggests the fastest route to school using AI?', ['It learns from traffic data to make a guess about the best road.'], 'Yes, it uses AI'),
        ex('Is a simple light switch AI?', ['It only turns on or off. It does not learn.'], 'No'),
      ],
      practice: [
        tapT('which', 'Tap the things that use AI (they learn from examples).', [['Voice assistant answering questions', true], ['App that translates English to Telugu', true], ['Map app finding the fastest route', true], ['Photo app that finds faces', true], ['A pencil', false], ['A light switch', false], ['A bicycle bell', false], ['A wooden ruler', false]],
          ['Does it learn and make guesses?', 'Simple tools that only do one fixed thing are not AI.']),
        bank('facts', [
          { q: 'How does an AI program learn?', a: 'From many examples', w: ['By eating food', 'By sleeping', 'It never learns'], h: ['Think of how you learn to spot a mango.'], s: ['AI learns patterns from many examples.'] },
          { q: 'Can AI make mistakes?', a: 'Yes, so we must check', w: ['No, never', 'Only on Sundays'], h: ['AI makes guesses.'], s: ['AI can be wrong. Always check its answers.'] },
          { q: 'Who makes AI programs?', a: 'People', w: ['Plants', 'Animals', 'They grow on trees'], h: ['Computers are built by…'], s: ['People design and build AI.'] },
          { q: 'Which is a good use of AI for learning?', a: 'Hearing a story read aloud', w: ['Copying homework without thinking', 'Sharing your password', 'Skipping school'], h: ['Which one helps you learn honestly?'], s: ['Read-aloud tools help you learn.'] },
          { q: 'A calculator that only adds numbers is…', a: 'not AI, it just follows fixed steps', w: ['AI that learns', 'a robot teacher'], h: ['Does it learn from examples?'], s: ['A simple calculator follows fixed steps; it does not learn.'] },
        ]),
      ],
    },
    {
      id: 'ts5.m.ai.chatbot', title: 'Chatbots and using AI tools safely', prereqs: ['ts5.m.ai.what'],
      intro: [
        h('What is a chatbot?'),
        p('A CHATBOT is an AI program you can "talk" to by typing or speaking. You ask a question and it writes an answer.'),
        p('It can help you practise maths, find word meanings or explain a science idea. But it can sometimes give wrong answers, so check with your teacher or book.'),
        photo('🗣️', 'You can speak or type to a chatbot.'),
        h('Stay safe online'),
        p('Never share your full name, address, phone number, school name or photos with a chatbot or online stranger. Use AI tools with a grown-up nearby.'),
        keys('Chatbot = AI you chat with.', 'Check its answers.', 'Never share personal details.', 'Use it to learn, not to copy.'),
        tip('If something online makes you feel uncomfortable, stop and tell a parent or teacher.'),
      ],
      examples: [
        ex('A chatbot says 7 × 8 = 54. What should you do?', ['Check it yourself: 7 × 8 = 56.', 'The chatbot made a mistake.'], 'Check and trust the correct answer, 56'),
        ex('A chatbot asks for your home address. What do you do?', ['Personal details must stay private.'], 'Do not share it; tell a grown-up'),
      ],
      practice: [
        bank('safe', [
          { q: 'A chatbot asks for your phone number. You should…', a: 'Not share it and tell a grown-up', w: ['Type it quickly', 'Share your parents\' number too'], h: ['Phone numbers are private.'], s: ['Never share personal details online.'] },
          { q: 'What is a chatbot?', a: 'An AI program you can chat with', w: ['A small robot cat', 'A type of bat', 'A school bag'], h: ['Chat + robot.'], s: ['A chatbot is an AI program that answers your messages.'] },
          { q: 'A chatbot gives an answer that looks wrong. You should…', a: 'Check it in your book or ask the teacher', w: ['Believe it anyway', 'Copy it into the exam'], h: ['AI can make mistakes.'], s: ['Always check AI answers.'] },
          { q: 'Which is the BEST way to use a chatbot for homework?', a: 'Ask it to explain, then do the work yourself', w: ['Copy its whole answer', 'Ask it to write your name on the paper'], h: ['Homework is for YOUR learning.'], s: ['Use AI to understand, not to copy.'] },
          { q: 'Which of these is safe to tell a chatbot?', a: 'Your favourite fruit', w: ['Your home address', 'Your password', 'Your school and class section'], h: ['Which one cannot be used to find you?'], s: ['A favourite fruit is not personal information.'] },
          { q: 'Something online makes you feel scared. You should…', a: 'Stop and tell a parent or teacher', w: ['Keep it a secret', 'Reply angrily'], h: ['Trusted grown-ups can help.'], s: ['Always tell a trusted grown-up.'] },
        ]),
        tapT('private', 'Tap the things you should NEVER share with a chatbot or online stranger.', [['Home address', true], ['Phone number', true], ['Password', true], ['Your photo', true], ['Favourite colour', false], ['A maths question', false], ['Name of a fruit', false]],
          ['Could someone use it to find you or open your account?', 'Keep personal details private.']),
      ],
    },
  ],
};

// ================================================================== CH 18 TRIP TO GOLKONDA
const ch18: USpec = {
  id: 'ts5.m.ch18', subject: 'math', title: 'Trip to the Golkonda Fort', source: src(18),
  note: 'Ticket prices in the practice items are made-up classroom numbers, not real fees.',
  objectives: [
    {
      id: 'ts5.m.trip.money', title: 'Trip money: tickets, snacks and change',
      intro: [
        h('Planning the school trip'),
        p('Class 5 is going to Golkonda Fort in Hyderabad! The teacher must plan the money: tickets, bus and snacks.'),
        photo('⛰️', 'Golkonda Fort stands on a hill. A clap at the entrance gate can be heard high up at the top!'),
        p('Suppose an adult ticket costs ₹30 and a child ticket costs ₹15. For 3 teachers and 40 children: 3 × 30 = ₹90 and 40 × 15 = ₹600. Total ₹690.'),
        p('If the teacher pays with ₹1000, the change is 1000 − 690 = ₹310.'),
        vis({ kind: 'coins', rupees: [500, 200, 100, 10] }, '₹500 + ₹200 + ₹100 + ₹10 = ₹810'),
        keys('Multiply for many tickets.', 'Add the parts for the total.', 'Change = money given − cost.'),
        tip('Estimate first so you know if you have enough money.'),
      ],
      examples: [
        ex('2 adults at ₹30 and 25 children at ₹15. Total?', ['2 × 30 = 60', '25 × 15 = 375', '60 + 375 = 435'], '₹435'),
        ex('Snacks cost ₹265. You pay ₹500. Change?', ['500 − 265 = 235'], '₹235'),
      ],
      practice: [
        tp('tickets', (r) => {
          const a = r.int(2, 5), ch = r.int(20, 45), pa = r.pick([20, 25, 30, 40]), pc = r.pick([5, 10, 15]);
          return typed(`Suppose a Golkonda ticket costs ₹${pa} for an adult and ₹${pc} for a child. ${a} teachers and ${ch} children go. What is the total cost?`, num(a * pa + ch * pc, '₹'),
            [`Adults: ${a} × ${pa}.`, `Children: ${ch} × ${pc}.`, 'Add the two.'], [`${a} × ${pa} = ${a * pa}`, `${ch} × ${pc} = ${ch * pc}`, `Total = ₹${a * pa + ch * pc}`], [], { unitHint: '₹' });
        }),
        tp('change', (r) => {
          const cost = r.int(120, 480), note = r.pick([500, 1000]);
          return typed(`The snacks cost ₹${cost}. The teacher pays with a ₹${note} note. How much change does she get?`, num(note - cost, '₹'),
            ['Change = money given − cost.', `${note} − ${cost} = ?`], [`${note} − ${cost} = ₹${note - cost}`], [[String(note + cost), 'Subtract the cost from the note.']], { unitHint: '₹' });
        }),
        tp('share', (r) => {
          const n = r.int(4, 10), each = r.int(15, 60);
          return typed(`The bus costs ₹${c(n * each * 10)} and ${n * 10} children share the cost equally. How much does each child pay?`, num(each, '₹'),
            ['Share equally means divide.', `${c(n * each * 10)} ÷ ${n * 10}.`], [`${n * each * 10} ÷ ${n * 10} = ₹${each}`], [], { unitHint: '₹' });
        }, 2),
      ],
    },
    {
      id: 'ts5.m.trip.time', title: 'Trip time and distance',
      intro: [
        h('When will we reach?'),
        p('The bus leaves school at 8:30 a.m. The journey takes 1 hour 15 minutes. 8:30 + 1 hour = 9:30. 9:30 + 15 minutes = 9:45 a.m.'),
        vis({ kind: 'clock', h: 9, m: 45 }, 'We reach Golkonda at 9:45 a.m.'),
        p('If the fort is 18 km from school, the bus travels 18 km there and 18 km back: 36 km in all.'),
        photo('🚌', 'A school bus trip: count the time and the kilometres.'),
        keys('Add hours, then minutes.', 'There and back = 2 × one way.'),
        tip('Plan to come back before sunset!'),
      ],
      examples: [
        ex('The bus leaves at 9:15 a.m. and takes 45 minutes. When does it reach?', ['9:15 + 45 minutes = 10:00'], '10:00 a.m.'),
        ex('The fort is 22 km away. Total distance for the round trip?', ['22 + 22 = 44'], '44 km'),
      ],
      practice: [
        tp('arrive', (r) => {
          const sh = r.int(7, 9), sm = r.pick([0, 15, 30, 45]), dur = r.pick([30, 45, 60, 75, 90]);
          const t = sh * 60 + sm + dur, ans = `${hm(Math.floor(t / 60), t % 60)} a.m.`;
          const w = [`${hm(Math.floor(t / 60) + 1, t % 60)} a.m.`, `${hm(Math.floor((t + 15) / 60), (t + 15) % 60)} a.m.`, `${hm(Math.floor((t - 15) / 60), (t - 15) % 60)} a.m.`];
          return mcq(r, `The bus leaves school at ${hm(sh, sm)} a.m. The journey takes ${dur} minutes. When does it reach Golkonda?`, ans, w,
            ['60 minutes = 1 hour.', 'Add the minutes to the start time.'], [`${hm(sh, sm)} + ${dur} min = ${ans}`]);
        }),
        tp('round', (r) => {
          const d = r.int(12, 40);
          return typed(`Golkonda Fort is ${d} km from the school. How many km does the bus travel to go there and come back?`, num(2 * d, 'km'),
            ['There and back means two times.', `${d} + ${d} = ?`], [`2 × ${d} = ${2 * d} km`], [[String(d), 'That is only one way. The bus also comes back.']]);
        }),
        tp('steps', (r) => {
          const a = r.int(120, 300), b = r.int(100, 250);
          return typed(`At the fort, Kavya climbs ${a} steps in the morning and ${b} steps in the afternoon. How many steps in all?`, num(a + b),
            ['"In all" means add.'], [`${a} + ${b} = ${a + b} steps`]);
        }),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18];
