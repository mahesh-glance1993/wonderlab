// Class 5 — CBSE Mathematics (NCERT Maths Mela, Class 5) and age-appropriate physical-science exploration.
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, num, frac, choose, chooseNum, matching, ordering, tapAll,
  lcm, fr, NAMES, THINGS, CITIES, type USpec, type QSpec,
} from '../lib/kit';
import type { Rng } from '../../shared/grading';
import type { Choice } from '../../shared/content';
import { tsClass5 } from '../ts/c5';

const nm = (r: Rng) => r.pick(NAMES).en;
const comma = (n: number) => n.toLocaleString('en-IN');
function sortInto(r: Rng, items: [string, number][], bins: string[]): Pick<QSpec, 'left' | 'right' | 'answer'> {
  const sh = r.shuffle(items);
  const left: Choice[] = sh.map(([l], i) => ({ id: `l${i + 1}`, label: { en: l } }));
  const right: Choice[] = bins.map((b, i) => ({ id: `r${i + 1}`, label: { en: b } }));
  const pairs: Record<string, string> = {};
  sh.forEach(([, bi], i) => (pairs[`l${i + 1}`] = `r${bi + 1}`));
  return { left, right, answer: { kind: 'match', pairs } };
}
/** Pick a fact question from a bank (≥5 entries). */
const factMcq = (bank: [string, string, string[]][], hint: string) => (r: Rng): QSpec => {
  const [q, a, w] = r.pick(bank);
  return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint], solution: [a] };
};

// ------------------------------------------------------------------ MATHS
const travel1: USpec = {
  id: 'c5.u.travel1', subject: 'math', title: 'We the Travellers — I', source: src('mm5', 1, 'We the Travellers—I'),
  objectives: [{
    id: 'c5.num.large', title: 'Reading and rounding large numbers (Indian system)', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('In the Indian system we group digits as ones, thousands, lakhs and crores: 1,00,000 = one lakh; 10,00,000 = ten lakh.'),
      f('3,45,672 = 3 lakh + 45 thousand + 672'),
      p('To round to the nearest thousand, look at the hundreds digit: 5 or more rounds up, less than 5 rounds down.'),
    ],
    examples: [
      ex('Value of 4 in 2,48,316?', ['4 is in the ten-thousands place', '4 × 10,000 = 40,000'], '40,000'),
      ex('Round 1,23,684 km to the nearest thousand.', ['Hundreds digit is 6 (≥ 5)', 'Round up: 1,24,000'], '1,24,000 km'),
    ],
    practice: [
      tp('value', (r) => {
        const n = r.int(100000, 999999), s = String(n), pos = r.int(0, 4);
        const names = ['lakhs', 'ten-thousands', 'thousands', 'hundreds', 'tens'];
        const v = +s[pos] * 10 ** (5 - pos);
        return {
          type: 'typed', keypad: 'numeric', prompt: `What is the place value of the digit in the ${names[pos]} place of ${comma(n)}?`, answer: num(v),
          hints: [`The digit there is ${s[pos]}.`, `Multiply by ${comma(10 ** (5 - pos))}.`],
          mistakes: [{ when: s[pos], explain: 'That is the face value (the digit). Multiply it by the value of its place.' }],
          solution: [`${s[pos]} × ${comma(10 ** (5 - pos))} = ${comma(v)}`],
        };
      }),
      tp('round', (r) => {
        const n = r.int(10000, 499999);
        const ans = Math.round(n / 1000) * 1000;
        const a = r.pick(CITIES), b = r.pick(CITIES.filter((c) => c !== a));
        return {
          type: 'typed', keypad: 'numeric', prompt: `A train company's records show ${comma(n)} passengers travelled from ${a} to ${b} this year. Round to the nearest thousand.`, answer: num(ans),
          hints: ['Look at the hundreds digit.', '5 or more → round up; less than 5 → round down.'],
          mistakes: [{ when: String(Math.floor(n / 1000) * 1000 === ans ? ans + 1000 : Math.floor(n / 1000) * 1000), explain: 'Check the hundreds digit again to decide whether to round up or down.' }],
          solution: [`Hundreds digit = ${Math.floor(n / 100) % 10}`, `${comma(n)} ≈ ${comma(ans)}`],
        };
      }),
    ],
  }],
};

const fracBar = (n: number, d: number) => ({ kind: 'fraction-bar' as const, parts: d, shaded: n });
const fractions: USpec = {
  id: 'c5.u.fractions', subject: 'math', title: 'Fractions', source: src('mm5', 2, 'Fractions'),
  objectives: [
    {
      id: 'c5.frac.equiv', title: 'Equivalent fractions and comparing', prereqs: [],
      activities: ['game:fractions'],
      intro: [
        p('Equivalent fractions name the same amount: 1/2 = 2/4 = 3/6. Multiply (or divide) the top and bottom by the same number.'),
        vis(fracBar(2, 4), '2/4 shades the same length as 1/2'),
        p('To compare fractions with different denominators, first make the denominators the same.'),
      ],
      examples: [
        ex('Fill in: 3/4 = ?/12', ['4 × 3 = 12', 'So multiply the top by 3 too: 3 × 3 = 9'], '9/12'),
        ex('Which is bigger, 2/3 or 3/5?', ['Common denominator 15', '2/3 = 10/15, 3/5 = 9/15', '10/15 > 9/15'], '2/3'),
      ],
      practice: [
        tp('missing', (r) => {
          const d = r.pick([2, 3, 4, 5, 6, 8]), n = r.int(1, d - 1), k = r.int(2, 6);
          return {
            type: 'typed', keypad: 'numeric', prompt: `Fill in the missing number: ${n}/${d} = ?/${d * k}`, answer: num(n * k),
            hints: [`${d} × ? = ${d * k}`, `Multiply the top by ${k} as well.`],
            mistakes: [{ when: String(n + (d * k - d)), explain: 'Equivalent fractions come from MULTIPLYING top and bottom by the same number, not adding.' }],
            solution: [`${d} × ${k} = ${d * k}`, `${n} × ${k} = ${n * k}`, `${n}/${d} = ${n * k}/${d * k}`],
          };
        }),
        tp('compare', (r) => {
          const d1 = r.pick([3, 4, 5, 6, 8]), d2 = r.pick([3, 4, 5, 6, 8, 10]);
          const n1 = r.int(1, d1 - 1); let n2 = r.int(1, d2 - 1);
          if (n1 * d2 === n2 * d1) n2 = n2 === 1 ? 2 : n2 - 1;
          if (n2 >= d2) n2 = d2 - 1;
          const big = n1 * d2 > n2 * d1 ? `${n1}/${d1}` : `${n2}/${d2}`;
          return {
            type: 'mcq', prompt: `Which fraction is greater: ${n1}/${d1} or ${n2}/${d2}?`, ...choose(r, big, [big === `${n1}/${d1}` ? `${n2}/${d2}` : `${n1}/${d1}`, 'They are equal']),
            hints: ['Make the denominators the same.', `Use ${lcm(d1, d2)} as the common denominator.`],
            solution: [`${n1}/${d1} = ${(n1 * lcm(d1, d2)) / d1}/${lcm(d1, d2)}`, `${n2}/${d2} = ${(n2 * lcm(d1, d2)) / d2}/${lcm(d1, d2)}`, `${big} is greater`],
          };
        }),
      ],
    },
    {
      id: 'c5.frac.add', title: 'Adding fractions', prereqs: ['c5.frac.equiv'],
      activities: ['game:fractions'],
      intro: [
        p('Fractions with the same denominator are pieces of the same size, so we just add the tops: 2/7 + 3/7 = 5/7.'),
        p('With different denominators, first change both to equivalent fractions with a common denominator — then the pieces are the same size.'),
        f('1/2 + 1/3 = 3/6 + 2/6 = 5/6'),
        vis(fracBar(5, 6), '1/2 and 1/3 together cover 5 of 6 equal pieces'),
        tip('Never add the denominators! The denominator tells the SIZE of each piece, not how many you have.'),
      ],
      examples: [
        ex('Add: 3/8 + 2/8', ['Same-size pieces (eighths)', '3 + 2 = 5 eighths'], '5/8', fracBar(5, 8)),
        ex('Meena drank 1/4 of a bottle of milk and Ravi drank 1/2. What part did they drink together?', ['1/2 = 2/4', '1/4 + 2/4 = 3/4'], '3/4 of the bottle', fracBar(3, 4)),
      ],
      practice: [
        tp('like', (r) => {
          const d = r.pick([5, 6, 7, 8, 9, 10, 12]), a = r.int(1, d - 2), c = r.int(1, d - a - 1);
          return {
            type: 'typed', keypad: 'fraction', prompt: `Add: ${a}/${d} + ${c}/${d}`, visual: fracBar(a + c, d), answer: frac(a + c, d),
            hints: ['The pieces are the same size, so the denominator stays the same.', 'Add only the numerators.'],
            mistakes: [{ when: `${a + c}/${2 * d}`, explain: `Adding the denominators would make each piece half as big (${2 * d}ths instead of ${d}ths). Keep the denominator ${d} and add the tops. Try a similar one: 1/4 + 2/4 with a fraction bar.` }],
            solution: [`${a}/${d} + ${c}/${d} = ${a + c}/${d}${fr(a + c, d) !== `${a + c}/${d}` ? ` = ${fr(a + c, d)}` : ''}`],
          };
        }),
        tp('unlike', (r) => {
          const pairs: [number, number][] = [[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 8], [3, 5], [4, 6], [2, 6], [5, 10], [4, 5], [3, 9]];
          const [b, d] = r.pick(pairs);
          const a = r.int(1, b - 1), c = r.int(1, d - 1);
          const L = lcm(b, d), N = (a * L) / b + (c * L) / d;
          return {
            type: 'typed', keypad: 'fraction', prompt: `Add: ${a}/${b} + ${c}/${d}`, answer: frac(N, L),
            hints: [`Find a common denominator for ${b} and ${d}: ${L}.`, `${a}/${b} = ${(a * L) / b}/${L} and ${c}/${d} = ${(c * L) / d}/${L}.`, 'Now add the numerators.'],
            mistakes: [
              { when: `${a + c}/${b + d}`, explain: `You added the denominators. ${b}ths and ${d}ths are different-sized pieces — adding ${b} + ${d} makes the pieces even smaller (${b + d}ths), so the answer cannot be right. Change both to ${L}ths first. Try a similar one: 1/2 + 1/4 with a fraction bar.` },
              { when: `${a + c}/${L}`, explain: 'You changed the denominator but not the numerators. Multiply each top by the same number you used for its bottom.' },
            ],
            solution: [`${a}/${b} = ${(a * L) / b}/${L}`, `${c}/${d} = ${(c * L) / d}/${L}`, `Sum = ${N}/${L}${fr(N, L) !== `${N}/${L}` ? ` = ${fr(N, L)}` : ''}`],
          };
        }, 2),
        tp('story', (r) => {
          const opts: [number, number, number, number][] = [[1, 4, 1, 2], [1, 3, 1, 6], [2, 5, 1, 10], [1, 2, 1, 3], [3, 8, 1, 4], [1, 6, 1, 2], [2, 3, 1, 6], [1, 5, 1, 2]];
          const [a, b, c, d] = r.pick(opts);
          const L = lcm(b, d), N = (a * L) / b + (c * L) / d;
          const who = nm(r), food = r.pick(['a watermelon', 'a pizza', 'a roti', 'a cake', 'a pot of kheer']);
          return {
            type: 'typed', keypad: 'fraction', prompt: `${who} ate ${a}/${b} of ${food} and a friend ate ${c}/${d} of it. What part was eaten in all? (${a}/${b} + ${c}/${d})`, answer: frac(N, L),
            hints: ['"In all" means add.', `Common denominator: ${L}.`],
            mistakes: [{ when: `${a + c}/${b + d}`, explain: 'Adding the denominators changes the size of the pieces. Make the pieces the same size first (common denominator), then add the tops. Try 1/2 + 1/4 with a fraction bar.' }],
            solution: [`${a}/${b} + ${c}/${d} = ${(a * L) / b}/${L} + ${(c * L) / d}/${L} = ${fr(N, L)}`],
          };
        }, 2),
      ],
    },
  ],
};

const angles: USpec = {
  id: 'c5.u.angles', subject: 'math', title: 'Angles as Turns', source: src('mm5', 3, 'Angles as Turns'),
  objectives: [{
    id: 'c5.geo.turns', title: 'Turns, right angles and degrees', prereqs: [],
    intro: [p('An angle measures how much something turns. A full turn is 360°, a half turn 180°, a quarter turn (right angle) 90°.'), p('Angles smaller than 90° are acute; between 90° and 180° are obtuse.'), vis({ kind: 'clock', h: 3, m: 0 }, 'At 3 o\'clock the hands make a right angle')],
    examples: [
      ex('How many degrees in three quarter turns?', ['One quarter turn = 90°', '3 × 90° = 270°'], '270°'),
      ex('The minute hand moves from 12 to 4. Angle turned?', ['Each number is 30° (360 ÷ 12)', '4 × 30° = 120°'], '120°'),
    ],
    practice: [
      tp('turns', (r) => {
        const opts: [string, number][] = [['a quarter turn', 90], ['a half turn', 180], ['three-quarters of a turn', 270], ['a full turn', 360], ['two full turns', 720], ['one and a half turns', 540]];
        const [t, deg] = r.pick(opts);
        const who = r.pick(['A top', 'A ceiling fan blade', 'A merry-go-round', 'A door handle', 'Arjun on a swivel chair']);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${who} makes ${t}. How many degrees is that?`, answer: num(deg, '°'),
          hints: ['A full turn is 360°.', 'A quarter turn is 90°.'], solution: [`${t} = ${deg}°`],
        };
      }),
      tp('clock', (r) => {
        const a = r.int(1, 11);
        return {
          type: 'typed', keypad: 'numeric', prompt: `The minute hand moves from 12 to ${a}. Through how many degrees does it turn?`, visual: { kind: 'clock', h: 12, m: a * 5 }, answer: num(a * 30, '°'),
          hints: ['360° ÷ 12 numbers = 30° per number.', `${a} × 30°`], mistakes: [{ when: String(a * 5), explain: 'That counts minutes. Each number on the clock is 30°.' }],
          solution: [`${a} × 30° = ${a * 30}°`],
        };
      }),
      tp('classify', (r) => {
        const deg = r.pick([20, 35, 45, 60, 75, 89, 90, 100, 120, 135, 150, 170, 180]);
        const ans = deg < 90 ? 'Acute' : deg === 90 ? 'Right angle' : deg < 180 ? 'Obtuse' : 'Straight angle';
        return { type: 'mcq', prompt: `What kind of angle is ${deg}°?`, ...choose(r, ans, ['Acute', 'Right angle', 'Obtuse', 'Straight angle'].filter((x) => x !== ans)), hints: ['Compare with 90° (a corner of a book) and 180° (a straight line).'], solution: [`${deg}° → ${ans}`] };
      }),
    ],
  }],
};

const travel2: USpec = {
  id: 'c5.u.travel2', subject: 'math', title: 'We the Travellers — II', source: src('mm5', 4, 'We the Travellers—II'),
  objectives: [{
    id: 'c5.ops.large', title: 'Operations with large numbers', prereqs: ['c5.num.large'],
    intro: [p('Add and subtract large numbers by lining up the places, exactly as with small numbers.'), p('Estimate first by rounding — it helps you check whether your answer is sensible.')],
    examples: [
      ex('A family drives 1,248 km to Jaipur and 987 km on to Delhi. Total distance?', ['1248 + 987 = 2235', 'Estimate: 1200 + 1000 = 2200 ✓'], '2,235 km'),
      ex('A train ticket costs ₹1,785 and a flight ₹6,450. Difference?', ['6450 − 1785 = 4665'], '₹4,665'),
    ],
    practice: [
      tp('trip', (r) => {
        const a = r.int(1200, 45000), b = r.int(900, 38000);
        const c1 = r.pick(CITIES), c2 = r.pick(CITIES.filter((c) => c !== c1));
        const add = r.next() < 0.5;
        return {
          type: 'typed', keypad: 'numeric', prompt: add ? `${comma(a)} people visited ${c1} on Monday and ${comma(b)} on Tuesday. How many in total?` : `${comma(Math.max(a, b))} tickets were sold for ${c1} and ${comma(Math.min(a, b))} for ${c2}. How many more for ${c1}?`,
          answer: num(add ? a + b : Math.abs(a - b)),
          hints: ['Line up the digits by place value.', 'Estimate first by rounding to the nearest thousand.'],
          solution: [add ? `${comma(a)} + ${comma(b)} = ${comma(a + b)}` : `${comma(Math.max(a, b))} − ${comma(Math.min(a, b))} = ${comma(Math.abs(a - b))}`],
        };
      }),
      tp('fare', (r) => {
        const fare = r.int(120, 950), n = r.int(12, 48);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `A school books ${n} bus tickets at ₹${fare} each for a trip. What is the total cost?`, answer: num(fare * n, '₹'),
          hints: [`Multiply ${fare} × ${n}.`, `Split: ${fare} × ${Math.floor(n / 10) * 10} + ${fare} × ${n % 10}`],
          solution: [`${fare} × ${n} = ₹${comma(fare * n)}`],
        };
      }, 2),
    ],
  }],
};

const farNear: USpec = {
  id: 'c5.u.far', subject: 'math', title: 'Far and Near', source: src('mm5', 5, 'Far and Near'),
  objectives: [{
    id: 'c5.meas.km', title: 'Kilometres and metres', prereqs: [],
    intro: [f('1 km = 1000 m'), p('Long distances between towns are measured in kilometres; a running track in metres.'), tip('To change km to m, multiply by 1000.')],
    examples: [
      ex('3 km 450 m = ? m', ['3 km = 3000 m', '3000 + 450 = 3450'], '3450 m'),
      ex('Sana walks 750 m to school and back. How far in a day?', ['750 × 2 = 1500 m', '= 1 km 500 m'], '1.5 km'),
    ],
    practice: [
      tp('convert', (r) => {
        const km = r.int(1, 25), m = r.pick([50, 100, 250, 400, 500, 750, 800, 905]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `${km} km ${m} m = how many metres?`, answer: num(km * 1000 + m, 'm'),
          hints: ['1 km = 1000 m'], mistakes: [{ when: String(km * 100 + m), explain: '1 km is 1000 m, not 100 m.' }],
          solution: [`${km} × 1000 + ${m} = ${km * 1000 + m} m`],
        };
      }),
      tp('round-trip', (r) => {
        const d = r.pick([250, 400, 600, 750, 850, 1200]), days = r.int(2, 6);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `${nm(r)} walks ${d} m to the library and back home each day for ${days} days. How far is that in all? (Write a unit.)`, answer: num(2 * d * days, 'm', true),
          hints: ['"There and back" is two trips each day.', `${d} × 2 × ${days}`],
          mistakes: [{ when: 'missing-unit', explain: 'Distances need a unit: m or km.' }, { when: String(d * days), explain: 'Remember the walk back — each day is two trips.' }],
          solution: [`${d} × 2 = ${2 * d} m per day`, `${2 * d} × ${days} = ${2 * d * days} m`],
        };
      }, 2),
    ],
  }],
};

const dairy: USpec = {
  id: 'c5.u.dairy', subject: 'math', title: 'The Dairy Farm', source: src('mm5', 6, 'The Dairy Farm'),
  objectives: [{
    id: 'c5.ops.dairy', title: 'Multiplication and division with litres', prereqs: [],
    intro: [p('A dairy farm deals with litres of milk every day. Multiply to find totals; divide to share or pack.'), f('1 L = 1000 mL; a 500 mL packet is half a litre')],
    examples: [
      ex('12 cows each give 8 L a day. Milk in a day?', ['12 × 8 = 96'], '96 L'),
      ex('How many 500 mL packets from 45 L?', ['45 L = 45000 mL', '45000 ÷ 500 = 90'], '90 packets'),
    ],
    practice: [
      tp('total', (r) => {
        const cows = r.int(8, 35), l = r.int(5, 14), days = r.pick([1, 7]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'L', prompt: `A farm in Anand has ${cows} cows. Each gives ${l} L of milk a day. How much milk in ${days === 1 ? 'a day' : 'a week'}?`, answer: num(cows * l * days, 'L'),
          hints: [`${cows} × ${l} per day.`, days === 7 ? 'A week has 7 days.' : 'Just one day.'], solution: [`${cows} × ${l}${days === 7 ? ' × 7' : ''} = ${cows * l * days} L`],
        };
      }),
      tp('packets', (r) => {
        const L = r.int(5, 60), size = r.pick([250, 500]);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${L} L of milk is filled into ${size} mL packets. How many packets?`, answer: num((L * 1000) / size),
          hints: [`${L} L = ${L * 1000} mL`, `Divide by ${size}.`], mistakes: [{ when: String(L * size), explain: 'Divide the total mL by the packet size.' }],
          solution: [`${L * 1000} ÷ ${size} = ${(L * 1000) / size} packets`],
        };
      }),
    ],
  }],
};

const shapesPat: USpec = {
  id: 'c5.u.shapes', subject: 'math', title: 'Shapes and Patterns', source: src('mm5', 7, 'Shapes and Patterns'),
  objectives: [{
    id: 'c5.geo.tiling', title: 'Tiling and growing patterns', prereqs: [],
    activities: ['game:patterns', 'game:shapes'],
    intro: [p('Some shapes fit together with no gaps — they tile. Squares, rectangles, equilateral triangles and regular hexagons tile; circles and regular pentagons do not.'), p('In a growing pattern each step adds the same amount, so we can predict any step.'), vis({ kind: 'emoji', text: '⬛ ⬛⬛ ⬛⬛⬛' }, 'A growing pattern')],
    examples: [
      ex('Matchstick squares in a row use 4, 7, 10, … sticks. Sticks for 5 squares?', ['Each new square adds 3 sticks', '10, 13, 16'], '16'),
      ex('Do circles tile a floor?', ['Circles leave gaps between them'], 'No'),
    ],
    practice: [
      tp('grow', (r) => {
        const first = r.int(2, 6), add = r.int(2, 5), k = r.int(5, 10);
        const seq = [0, 1, 2].map((i) => first + i * add);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A rangoli pattern uses ${seq.join(', ')}, … dots in steps 1, 2, 3. How many dots in step ${k}?`, answer: num(first + (k - 1) * add),
          hints: [`Each step adds ${add}.`, `Step ${k} = ${first} + ${k - 1} × ${add}`],
          mistakes: [{ when: String(first + k * add), explain: `Step 1 already has ${first}; you only add ${add} for each step after the first.` }],
          solution: [`${first} + ${k - 1} × ${add} = ${first + (k - 1) * add}`],
        };
      }),
      tp('tiles', (r) => {
        const all: [string, boolean][] = [['Square', true], ['Rectangle', true], ['Equilateral triangle', true], ['Regular hexagon', true], ['Circle', false], ['Regular pentagon', false], ['Regular octagon', false], ['Oval', false]];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some(([, ok]) => ok)) pick[0] = all[0];
        if (pick.every(([, ok]) => ok)) pick[4] = all[4];
        return { type: 'tap', prompt: 'Tap the shapes that can cover a floor with no gaps or overlaps.', ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints: ['Think of floor tiles you have seen.', 'Corners meeting at a point must add up to exactly 360°.'], solution: [`Tile: ${pick.filter(([, ok]) => ok).map(([l]) => l).join(', ')}`] };
      }),
    ],
  }],
};

const weight: USpec = {
  id: 'c5.u.weight', subject: 'math', title: 'Weight and Capacity', source: src('mm5', 8, 'Weight and Capacity'),
  objectives: [{
    id: 'c5.meas.mass-cap', title: 'Converting and comparing weight and capacity', prereqs: [],
    activities: ['game:balance'],
    intro: [f('1 kg = 1000 g, 1 L = 1000 mL'), p('To compare, write both quantities in the same unit.')],
    examples: [
      ex('Which is more: 1 kg 200 g or 1500 g?', ['1 kg 200 g = 1200 g', '1500 > 1200'], '1500 g'),
      ex('A bucket holds 12 L. How many 750 mL mugs fill it?', ['12000 ÷ 750 = 16'], '16 mugs'),
    ],
    practice: [
      tp('shop', (r) => {
        const items = r.shuffle([['rice', 2500], ['dal', 750], ['sugar', 1250], ['atta', 5000], ['salt', 500], ['jaggery', 900]] as [string, number][]).slice(0, 3);
        const tot = items.reduce((s, [, g]) => s + g, 0);
        return {
          type: 'typed', keypad: 'units', unitHint: 'g', prompt: `${nm(r)} buys ${items.map(([n, g]) => `${g >= 1000 ? `${Math.floor(g / 1000)} kg ${g % 1000} g` : `${g} g`} of ${n}`).join(', ')}. What is the total weight? (Write a unit.)`,
          answer: num(tot, 'g', true),
          hints: ['Change everything to grams.', 'Then add.'], mistakes: [{ when: 'missing-unit', explain: 'Add a unit: g or kg.' }],
          solution: [`${items.map(([, g]) => g).join(' + ')} = ${tot} g = ${tot / 1000} kg`],
        };
      }, 2),
      tp('mugs', (r) => {
        const L = r.pick([3, 6, 9, 12, 15]), mug = r.pick([250, 300, 500, 750]);
        if ((L * 1000) % mug !== 0) return { type: 'typed', keypad: 'numeric', prompt: `How many 250 mL cups can be filled from a ${L} L can of water?`, answer: num(L * 4), hints: ['1 L = 1000 mL'], solution: [`${L * 1000} ÷ 250 = ${L * 4}`] };
        return { type: 'typed', keypad: 'numeric', prompt: `How many ${mug} mL mugs can be filled from a ${L} L bucket?`, answer: num((L * 1000) / mug), hints: ['1 L = 1000 mL', `${L * 1000} ÷ ${mug}`], solution: [`${L * 1000} ÷ ${mug} = ${(L * 1000) / mug}`] };
      }),
    ],
  }],
};

const coconut: USpec = {
  id: 'c5.u.coconut', subject: 'math', title: 'Coconut Farm', source: src('mm5', 9, 'Coconut Farm'),
  objectives: [{
    id: 'c5.ops.muldiv', title: 'Multiplying and dividing bigger numbers', prereqs: [],
    intro: [p('Multiply a 3-digit number by a 2-digit number by splitting the 2-digit number into tens and ones.'), f('234 × 26 = 234 × 20 + 234 × 6'), p('Division: how many equal groups, and what is left over.')],
    examples: [
      ex('A farm has 24 rows of 135 coconut trees. How many trees?', ['135 × 20 = 2700', '135 × 4 = 540', '2700 + 540 = 3240'], '3,240 trees'),
      ex('852 coconuts are packed in sacks of 6. How many sacks?', ['852 ÷ 6 = 142'], '142 sacks'),
    ],
    practice: [
      tp('mult', (r) => {
        const a = r.int(105, 480), b = r.int(12, 39);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A coconut farm in Kerala has ${b} rows with ${a} trees in each row. How many trees in all?`, answer: num(a * b),
          steps: [{ prompt: `${a} × ${Math.floor(b / 10) * 10}`, answer: num(a * Math.floor(b / 10) * 10) }, { prompt: `${a} × ${b % 10}`, answer: num(a * (b % 10)) }, { prompt: 'Add them', answer: num(a * b) }],
          hints: [`Split ${b} = ${Math.floor(b / 10) * 10} + ${b % 10}.`, 'Multiply each part, then add.'],
          solution: [`${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}`, `${a} × ${b % 10} = ${a * (b % 10)}`, `Total = ${comma(a * b)}`],
        };
      }, 2),
      tp('div', (r) => {
        const d = r.int(3, 9), q = r.int(25, 160), rem = r.int(0, d - 1);
        const n = d * q + rem;
        return {
          type: 'typed', keypad: 'numeric', prompt: `${n} coconuts are packed in sacks of ${d}. How many full sacks?`, answer: num(q),
          hints: [`How many ${d}s in ${n}?`, 'Divide starting from the hundreds.'], mistakes: [{ when: String(q + 1), explain: 'Only FULL sacks count — the leftover coconuts do not fill another sack.' }],
          solution: [`${n} ÷ ${d} = ${q}${rem ? ` remainder ${rem}` : ''}`, `${q} full sacks`],
        };
      }),
    ],
  }],
};

const POLY: [string, 'triangle' | 'square' | 'pentagon' | 'hexagon', number][] = [['equilateral triangle', 'triangle', 3], ['square', 'square', 4], ['regular pentagon', 'pentagon', 5], ['regular hexagon', 'hexagon', 6]];
const symm: USpec = {
  id: 'c5.u.symm', subject: 'math', title: 'Symmetrical Designs', source: src('mm5', 10, 'Symmetrical Designs'),
  objectives: [{
    id: 'c5.geo.symm', title: 'Reflection and rotational symmetry in designs', prereqs: [],
    activities: ['art:color'],
    intro: [p('A design has reflection symmetry if a mirror line splits it into matching halves. Rangoli and kolam designs often have several mirror lines.'), p('A regular polygon with n sides has n lines of symmetry. It also looks the same after turning by 360° ÷ n.'), vis({ kind: 'shape', shape: 'hexagon' }, 'A regular hexagon has 6 lines of symmetry')],
    examples: [
      ex('Lines of symmetry of a regular pentagon?', ['n = 5'], '5'),
      ex('Smallest turn that makes a square look the same?', ['360° ÷ 4 = 90°'], '90°'),
    ],
    practice: [
      tp('lines', (r) => {
        const [name, shape, n] = r.pick(POLY);
        const ask = r.pick(['lines', 'turn'] as const);
        if (ask === 'lines') return { type: 'mcq', prompt: `How many lines of symmetry does a ${name} have?`, visual: { kind: 'shape', shape }, ...chooseNum(r, n, [n - 1, n + 1, 2 * n]), hints: ['A regular shape has as many lines as sides.'], solution: [`${n} lines`] };
        return { type: 'typed', keypad: 'numeric', prompt: `What is the smallest turn (in degrees) after which a ${name} looks exactly the same?`, visual: { kind: 'shape', shape }, answer: num(360 / n, '°'), hints: ['A full turn is 360°.', `Divide by the number of sides (${n}).`], solution: [`360° ÷ ${n} = ${360 / n}°`] };
      }),
      tp('complete', (r) => {
        const cols = 6, rows = 4;
        const half = r.shuffle([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3]] as [number, number][]).slice(0, r.int(3, 6));
        return {
          type: 'typed', keypad: 'numeric', prompt: `The left half of a design has ${half.length} coloured squares. The vertical line down the middle is a mirror line. How many coloured squares will the complete design have?`,
          visual: { kind: 'grid-shape', cells: half, cols, rows }, answer: num(half.length * 2),
          hints: ['Every square on the left has a mirror twin on the right.'], solution: [`${half.length} × 2 = ${half.length * 2}`],
        };
      }),
    ],
  }],
};

const quilt: USpec = {
  id: 'c5.u.quilt', subject: 'math', title: 'Grandmother\'s Quilt', source: src('mm5', 11, 'Grandmother\'s Quilt'),
  objectives: [{
    id: 'c5.meas.area', title: 'Area and perimeter', prereqs: [],
    intro: [p('Area is the space a shape covers — count unit squares. Perimeter is the distance around the edge.'), f('Rectangle: area = length × breadth, perimeter = 2 × (length + breadth)'), vis({ kind: 'grid-shape', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], cols: 4, rows: 3 }, 'A 3 × 2 rectangle covers 6 squares')],
    examples: [
      ex('A quilt patch is 4 cm by 3 cm. Area?', ['4 × 3 = 12'], '12 cm²'),
      ex('Perimeter of a 5 m by 2 m mat?', ['2 × (5 + 2) = 14'], '14 m'),
    ],
    practice: [
      tp('count', (r) => {
        const w = r.int(2, 5), h = r.int(2, 4);
        const cells: [number, number][] = [];
        for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) cells.push([x, y]);
        const extra = r.int(0, 2);
        for (let i = 0; i < extra; i++) cells.push([w, i]);
        return { type: 'count', prompt: 'Count the squares. What is the area of the quilt patch in square units?', visual: { kind: 'grid-shape', cells, cols: w + 2, rows: h + 1 }, answer: num(cells.length), hints: ['Count row by row.', 'Or multiply rows × columns, then add the extra squares.'], solution: [`${w} × ${h}${extra ? ` + ${extra}` : ''} = ${cells.length}`] };
      }),
      tp('rect', (r) => {
        const l = r.int(3, 15), b = r.int(2, 10);
        const ask = r.pick(['area', 'perimeter'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: ask === 'area' ? 'cm²' : 'cm', prompt: `A rectangular quilt square is ${l} cm long and ${b} cm wide. Find its ${ask}. (Write the unit.)`,
          answer: ask === 'area' ? num(l * b, 'cm^2', true) : num(2 * (l + b), 'cm', true),
          hints: [ask === 'area' ? 'Area = length × breadth' : 'Perimeter = 2 × (length + breadth)', ask === 'area' ? 'Area is in square cm (cm²).' : 'Perimeter is a length, in cm.'],
          mistakes: [
            { when: String(ask === 'area' ? 2 * (l + b) : l * b), explain: ask === 'area' ? 'That is the perimeter (distance around). Area = length × breadth.' : 'That is the area. Perimeter adds all four sides.' },
            { when: 'missing-unit', explain: `Write the unit: ${ask === 'area' ? 'cm²' : 'cm'}.` }, { when: 'wrong-unit', explain: ask === 'area' ? 'Area is measured in square units, like cm².' : 'Perimeter is a length — use cm.' },
          ],
          solution: [ask === 'area' ? `${l} × ${b} = ${l * b} cm²` : `2 × (${l} + ${b}) = ${2 * (l + b)} cm`],
        };
      }),
    ],
  }],
};

const racing: USpec = {
  id: 'c5.u.racing', subject: 'math', title: 'Racing Seconds', source: src('mm5', 12, 'Racing Seconds'),
  objectives: [{
    id: 'c5.time.seconds', title: 'Seconds and minutes', prereqs: [],
    intro: [f('1 minute = 60 seconds'), p('Races are timed in seconds. The SMALLEST time wins.'), tip('Convert minutes to seconds before comparing.')],
    examples: [
      ex('2 min 15 s = ? s', ['2 × 60 = 120', '120 + 15 = 135'], '135 s'),
      ex('Imran ran 100 m in 14 s and Kavya in 16 s. Who was faster, by how much?', ['Smaller time is faster', '16 − 14 = 2'], 'Imran, by 2 s'),
    ],
    practice: [
      tp('convert', (r) => {
        const m = r.int(1, 9), s = r.int(1, 59);
        return {
          type: 'typed', keypad: 'units', unitHint: 's', prompt: `${m} min ${s} s = how many seconds?`, answer: num(m * 60 + s, 's'),
          hints: ['1 minute = 60 seconds.'], mistakes: [{ when: String(m * 100 + s), explain: 'A minute has 60 seconds, not 100.' }],
          solution: [`${m} × 60 + ${s} = ${m * 60 + s} s`],
        };
      }),
      tp('order', (r) => {
        const people = r.shuffle(NAMES).slice(0, 4).map((x) => x.en);
        const times = r.shuffle([12, 13, 14, 15, 16, 17, 18, 19]).slice(0, 4);
        const sorted = people.map((pp, i) => [pp, times[i]] as [string, number]).sort((a, b) => a[1] - b[1]);
        return {
          type: 'order', prompt: `Race times: ${people.map((pp, i) => `${pp} ${times[i]} s`).join(', ')}. Arrange from fastest to slowest.`, ...ordering(r, sorted.map(([pp]) => pp)),
          hints: ['The fastest runner takes the LEAST time.'], solution: [sorted.map(([pp, t]) => `${pp} (${t} s)`).join(' → ')],
        };
      }),
      tp('diff', (r) => {
        const a = r.int(65, 180), b = a + r.int(3, 40);
        const fmt = (x: number) => `${Math.floor(x / 60)} min ${x % 60} s`;
        return {
          type: 'typed', keypad: 'units', unitHint: 's', prompt: `In a cycle race, ${nm(r)} finished in ${fmt(a)} and the next rider in ${fmt(b)}. By how many seconds did ${'the winner'} win?`, answer: num(b - a, 's'),
          hints: ['Change both times into seconds.', `${fmt(a)} = ${a} s`], solution: [`${b} − ${a} = ${b - a} s`],
        };
      }, 2),
    ],
  }],
};

const jumps: USpec = {
  id: 'c5.u.jumps', subject: 'math', title: 'Animal Jumps', source: src('mm5', 13, 'Animal Jumps'),
  objectives: [{
    id: 'c5.num.multiples', title: 'Multiples, factors and common multiples', prereqs: [],
    activities: ['game:numberline'],
    intro: [p('A frog that jumps 3 steps at a time lands on 3, 6, 9, 12, … — the multiples of 3.'), p('Where two animals both land is a common multiple. The first such place is the lowest common multiple.'), vis({ kind: 'number-line', from: 0, to: 24, step: 1, jumps: [[0, 4], [4, 8], [8, 12], [12, 16]] }, 'A rabbit jumping 4 at a time')],
    examples: [
      ex('A frog jumps 3, a rabbit jumps 4, both from 0. First place both land?', ['Frog: 3, 6, 9, 12', 'Rabbit: 4, 8, 12'], '12'),
      ex('Factors of 18?', ['1 × 18, 2 × 9, 3 × 6'], '1, 2, 3, 6, 9, 18'),
    ],
    practice: [
      tp('land', (r) => {
        const step = r.int(2, 9), k = r.int(3, 8);
        const animal = r.pick(['frog', 'rabbit', 'kangaroo', 'grasshopper']);
        return {
          type: 'number-line', line: { from: 0, to: step * 10, step }, prompt: `A ${animal} starts at 0 and jumps ${step} each time. Where does it land after ${k} jumps?`, answer: num(step * k),
          hints: [`Count in ${step}s.`, `${k} × ${step}`], solution: [`${k} × ${step} = ${step * k}`],
        };
      }),
      tp('common', (r) => {
        const pairs: [number, number][] = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [6, 8], [4, 5], [6, 9], [2, 7], [5, 6]];
        const [a, b] = r.pick(pairs);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A frog jumps ${a} steps and a rabbit jumps ${b} steps, both starting at 0. What is the first number (after 0) where both land?`, answer: num(lcm(a, b)),
          hints: [`List multiples of ${a} and of ${b}.`, 'Find the first number in both lists.'],
          mistakes: [{ when: String(a * b), explain: a * b === lcm(a, b) ? 'Correct value — check the format.' : `${a * b} is a common landing place, but not the FIRST. Look for a smaller one.` }],
          solution: [`Multiples of ${a}: ${[1, 2, 3, 4, 5, 6].map((i) => a * i).join(', ')}…`, `Multiples of ${b}: ${[1, 2, 3, 4, 5].map((i) => b * i).join(', ')}…`, `First common: ${lcm(a, b)}`],
        };
      }),
      tp('factors', (r) => {
        const n = r.pick([12, 16, 18, 20, 24, 28, 30, 36]);
        const cands = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]).slice(0, 6);
        if (!cands.some((c) => n % c === 0)) cands[0] = 2;
        if (cands.every((c) => n % c === 0)) cands[5] = 7;
        return { type: 'tap', prompt: `Tap every number that is a factor of ${n}.`, ...tapAll(r, cands.map((c) => ({ label: String(c), ok: n % c === 0 }))), hints: [`A factor divides ${n} with no remainder.`], solution: [`Factors among these: ${cands.filter((c) => n % c === 0).sort((x, y) => x - y).join(', ')}`] };
      }),
    ],
  }],
};

const maps: USpec = {
  id: 'c5.u.maps', subject: 'math', title: 'Maps and Locations', source: src('mm5', 14, 'Maps and Locations'),
  objectives: [{
    id: 'c5.geo.maps', title: 'Directions and map scale', prereqs: [],
    intro: [p('Maps use directions — North, South, East, West — and a scale that tells how much real distance one centimetre stands for.'), f('Real distance = map distance × scale'), tip('On most maps, North is at the top.')],
    examples: [
      ex('Scale 1 cm = 5 km. Two villages are 7 cm apart on the map. Real distance?', ['7 × 5 = 35'], '35 km'),
      ex('Facing North, turn right. Which way are you facing?', ['Right of North is East'], 'East'),
    ],
    practice: [
      tp('scale', (r) => {
        const s = r.pick([2, 5, 10, 20, 25, 50]), d = r.int(2, 12);
        const c1 = r.pick(CITIES), c2 = r.pick(CITIES.filter((c) => c !== c1));
        return {
          type: 'typed', keypad: 'units', unitHint: 'km', prompt: `On a map, 1 cm stands for ${s} km. ${c1} and ${c2} are ${d} cm apart on the map. What is the real distance? (Write a unit.)`, answer: num(d * s, 'km', true),
          hints: ['Multiply the map distance by the scale.'], mistakes: [{ when: 'missing-unit', explain: 'Write the unit: km.' }, { when: String(d + s), explain: 'Each centimetre stands for the scale distance — multiply, do not add.' }],
          solution: [`${d} × ${s} = ${d * s} km`],
        };
      }),
      tp('direction', (r) => {
        const dirs = ['North', 'East', 'South', 'West'];
        const s = r.int(0, 3), t = r.pick([1, 2, 3]);
        const turn = t === 1 ? 'right' : t === 2 ? 'around (half turn)' : 'left';
        return { type: 'mcq', prompt: `Priya is facing ${dirs[s]} at the school gate. She turns ${turn}. Which direction is she facing now?`, ...choose(r, dirs[(s + t) % 4], dirs.filter((_, i) => i !== (s + t) % 4)), hints: ['Clockwise: North → East → South → West.', 'Turning right is one step clockwise.'], solution: [`${dirs[s]} → turn ${turn} → ${dirs[(s + t) % 4]}`] };
      }),
    ],
  }],
};

const pictures: USpec = {
  id: 'c5.u.data', subject: 'math', title: 'Data Through Pictures', source: src('mm5', 15, 'Data Through Pictures'),
  objectives: [{
    id: 'c5.data.picto', title: 'Pictographs and bar graphs', prereqs: [],
    intro: [p('A pictograph uses symbols to show data. A key tells what one symbol stands for.'), vis({ kind: 'emoji', text: '🐄🐄🐄  (each 🐄 = 5 cows)' }, '3 symbols × 5 = 15 cows'), p('Bar graphs show the same information with bars.')],
    examples: [
      ex('Each 🥭 = 10 mangoes. A row shows 🥭🥭🥭🥭. How many mangoes?', ['4 × 10 = 40'], '40'),
      ex('Bars: Mon 20, Tue 35. How many more on Tuesday?', ['35 − 20 = 15'], '15'),
    ],
    practice: [
      tp('picto', (r) => {
        const t = r.pick(THINGS), k = r.pick([2, 5, 10, 20]), n = r.int(2, 8);
        return {
          type: 'typed', keypad: 'numeric', prompt: `In a pictograph, each ${t.emoji} stands for ${k} ${t.en}. How many ${t.en} does this row show?`, visual: { kind: 'emoji', text: t.emoji.repeat(n) }, answer: num(n * k),
          hints: ['Count the symbols.', `Multiply by ${k}.`], mistakes: [{ when: String(n), explain: `Each symbol stands for ${k}, not 1 — multiply.` }], solution: [`${n} × ${k} = ${n * k}`],
        };
      }),
      tp('bar', (r) => {
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const values = labels.map(() => r.int(2, 12) * 5);
        const total = values.reduce((a, b) => a + b, 0);
        return {
          type: 'graph', keypad: 'numeric', prompt: 'The graph shows litres of milk sold by a dairy each day. How many litres were sold in all 5 days?', visual: { kind: 'bar-graph', labels, values, unit: 'L' }, answer: num(total, 'L'),
          hints: ['Read each bar.', 'Add all five values.'], solution: [`${values.join(' + ')} = ${total} L`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICAL SCIENCE (exploration)
const EXPLORE = 'Age-appropriate exploration; mapping to the Class 5 EVS book needs educator verification.';
const floatSink: USpec = {
  id: 'c5.u.float', subject: 'physics', title: 'Floating and Sinking', source: null, note: EXPLORE,
  objectives: [{
    id: 'c5.phy.float', title: 'What floats and what sinks?', prereqs: [],
    intro: [
      p('Whether something floats depends on how heavy it is for its size. Things that are lighter than the same amount of water float; heavier ones sink.'),
      p('Each cubic centimetre of water weighs about 1 gram. If an object weighs less than 1 g for every cm³ of its size, it floats.'),
      tip('A big log floats but a small stone sinks — size alone does not decide!'),
    ],
    examples: [
      ex('A wooden block of size 10 cm³ weighs 6 g. Float or sink?', ['6 g for 10 cm³ is less than 1 g per cm³'], 'Floats'),
      ex('Why does a steel ship float when a steel nail sinks?', ['The ship is hollow and holds a lot of air', 'Its total weight for its size is less than water'], 'Its shape makes it light for its size'),
    ],
    practice: [
      tp('sort', (r) => {
        const all: [string, number][] = [['Wooden spoon', 0], ['Dry leaf', 0], ['Plastic ball', 0], ['Cork', 0], ['Ice cube', 0], ['Coconut', 0], ['Stone', 1], ['Iron nail', 1], ['Coin', 1], ['Key', 1], ['Glass marble', 1]];
        const fl = r.shuffle(all.filter(([, b]) => b === 0)).slice(0, 2), sk = r.shuffle(all.filter(([, b]) => b === 1)).slice(0, 2);
        const items = [...fl, ...sk];
        return {
          type: 'drag', prompt: `Drag each object into Floats or Sinks: ${items.map((x) => x[0]).join(', ')}.`, ...sortInto(r, items, ['Floats', 'Sinks']),
          hints: ['Think of a bucket of water at home.', 'Metal and stone objects that are solid usually sink.'],
          solution: [`Floats: ${fl.map((x) => x[0]).join(', ')}`, `Sinks: ${sk.map((x) => x[0]).join(', ')}`],
        };
      }),
      tp('density', (r) => {
        const v = r.pick([10, 20, 25, 40, 50]), m = r.pick([0.3, 0.5, 0.8, 1.5, 2, 3, 7]) * v;
        const ans = m < v ? 'Floats' : 'Sinks';
        return {
          type: 'mcq', prompt: `An object has a size (volume) of ${v} cm³ and weighs ${m} g. Will it float or sink in water?`, ...choose(r, ans, [ans === 'Floats' ? 'Sinks' : 'Floats']),
          hints: ['Water weighs 1 g for every 1 cm³.', `The same size of water would weigh ${v} g.`],
          solution: [`${m} g ${m < v ? '<' : '>'} ${v} g (same size of water)`, ans],
        };
      }, 2),
    ],
  }],
};

const friction: USpec = {
  id: 'c5.u.friction', subject: 'physics', title: 'Rough and Smooth: Friction', source: null, note: EXPLORE,
  objectives: [{
    id: 'c5.phy.friction', title: 'Friction slows things down', prereqs: [],
    activities: ['lab:forces'],
    intro: [
      p('Friction is a force between two surfaces that rubs against motion. Rough surfaces give more friction; smooth surfaces give less.'),
      p('Friction is useful (it lets us walk and brake) but also wastes effort (it wears out shoes and tyres).'),
      act('lab:forces?mass=5&force=20&friction=0.1', 'Forces Lab: push a 5 kg box on a smooth floor'),
      act('lab:forces?mass=5&force=20&friction=0.5', 'Same push on a rough floor — what changes?'),
    ],
    examples: [
      ex('A toy car is rolled on a carpet and on a tiled floor with the same push. Where does it go farther?', ['Tiles are smoother than carpet', 'Less friction → it rolls farther'], 'On the tiled floor'),
      ex('Why do we sprinkle sand on a slippery road?', ['Sand makes the surface rougher', 'More friction stops slipping'], 'To increase friction'),
    ],
    practice: [
      tp('order', (r) => {
        const surfaces = ['Glass sheet', 'Polished tiles', 'Wooden floor', 'Carpet', 'Sandy ground'];
        const pick = surfaces.filter(() => r.next() < 0.8);
        const use = pick.length >= 3 ? pick : surfaces.slice(0, 4);
        return { type: 'order', prompt: `A marble is rolled with the same push on: ${use.join(', ')}. Order them from the farthest roll to the shortest.`, ...ordering(r, use), hints: ['Smoother surface → less friction → farther roll.'], solution: [use.join(' → ')] };
      }),
      tp('facts', factMcq([
        ['Why do shoes have grooves on their soles?', 'To increase friction so we do not slip', ['To make them lighter', 'To reduce friction', 'For decoration only']],
        ['Why is oil put on a squeaky door hinge?', 'Oil reduces friction', ['Oil increases friction', 'Oil makes it heavier', 'Oil cools the hinge']],
        ['Which is easier to pull: a box on wheels or the same box sliding?', 'The box on wheels', ['The sliding box', 'Both are the same', 'Neither can move']],
        ['When you rub your palms together they get warm. Why?', 'Friction produces heat', ['Your blood gets cold', 'Air pushes them', 'Magnetism']],
        ['Why do cricket players\' shoes have spikes?', 'To get a better grip (more friction)', ['To run slower', 'To reduce weight', 'To dig the pitch']],
        ['A cyclist brakes on a wet road. Why does the cycle take longer to stop?', 'Water reduces friction between tyres and road', ['Water adds friction', 'The cycle is heavier', 'The brakes get warmer']],
      ], 'Rough surfaces grip; smooth or oily surfaces slip.')),
    ],
  }],
};

const light: USpec = {
  id: 'c5.u.light', subject: 'physics', title: 'Light and Shadows', source: null, note: EXPLORE,
  objectives: [{
    id: 'c5.phy.light', title: 'Transparent, translucent, opaque and shadows', prereqs: [],
    activities: ['lab:light'],
    intro: [
      p('Transparent things (clear glass, water) let light through. Translucent things (butter paper, frosted glass) let some light through. Opaque things (wood, a book) block light.'),
      p('An opaque object blocks light and makes a shadow on the side away from the light. The shadow is shortest at noon when the Sun is high.'),
      act('lab:light?angle=30', 'Shine light at an angle in the Light Lab'),
    ],
    examples: [
      ex('Is a steel plate transparent, translucent or opaque?', ['No light passes through'], 'Opaque'),
      ex('In the morning the Sun is in the East. Where does your shadow fall?', ['Shadows fall away from the light'], 'Towards the West'),
    ],
    practice: [
      tp('match', (r) => {
        const pool: [string, string][] = [['Clear window glass', 'Transparent'], ['Butter paper', 'Translucent'], ['Wooden door', 'Opaque'], ['Clean water', 'Transparent'], ['Frosted glass', 'Translucent'], ['Cardboard', 'Opaque'], ['Plastic wrap', 'Transparent'], ['Thin cotton cloth', 'Translucent'], ['Brick wall', 'Opaque']];
        const t = r.shuffle(pool.filter((x) => x[1] === 'Transparent'))[0], tl = r.shuffle(pool.filter((x) => x[1] === 'Translucent'))[0], o = r.shuffle(pool.filter((x) => x[1] === 'Opaque'))[0];
        const pairs = r.shuffle([t, tl, o]);
        return { type: 'match', prompt: `Match each material to how it lets light through: ${pairs.map((x) => x[0]).join(', ')}.`, ...matching(r, pairs), hints: ['Can you see clearly through it, a little, or not at all?'], solution: pairs.map(([a, b]) => `${a} → ${b}`) };
      }),
      tp('shadow', (r) => {
        const dirs = ['East', 'West', 'North', 'South'];
        const opp: Record<string, string> = { East: 'West', West: 'East', North: 'South', South: 'North' };
        const light = r.pick(dirs);
        const src2 = r.pick(['the Sun', 'a street lamp', 'a torch', 'a candle']);
        return {
          type: 'mcq', prompt: `${src2[0].toUpperCase() + src2.slice(1)} is to the ${light} of a tree. On which side is the tree's shadow?`, ...choose(r, opp[light], dirs.filter((d) => d !== opp[light])),
          hints: ['Light travels in straight lines.', 'The shadow is on the side away from the light.'], solution: [`Light from the ${light} → shadow towards the ${opp[light]}`],
        };
      }),
    ],
  }],
};

const sound: USpec = {
  id: 'c5.u.sound', subject: 'physics', title: 'Sounds Around Us', source: null, note: EXPLORE,
  objectives: [{
    id: 'c5.phy.sound', title: 'Vibrations and pitch', prereqs: [],
    intro: [
      p('Every sound is made by something vibrating (moving back and forth quickly): a veena string, a drum skin, our vocal cords.'),
      p('Pitch is how high or low a sound is. Faster vibration → higher pitch. Shorter, thinner or tighter strings vibrate faster.'),
      tip('Put your fingers on your throat and hum — feel the vibration!'),
    ],
    examples: [
      ex('What vibrates when a tabla is played?', ['The stretched skin on top'], 'The skin (membrane)'),
      ex('Which string of a sitar gives the higher note: a thick one or a thin one?', ['Thin strings vibrate faster'], 'The thin string'),
    ],
    practice: [
      tp('source', factMcq([
        ['What vibrates to make the sound of a flute?', 'The air inside it', ['The holes', 'The player\'s fingers', 'The wood only']],
        ['What vibrates when a temple bell rings?', 'The metal bell', ['The rope', 'The floor', 'Nothing']],
        ['What vibrates when we speak?', 'Our vocal cords', ['Our teeth', 'Our ears', 'Our tongue only']],
        ['What vibrates when a veena is played?', 'Its strings', ['The pegs', 'The player\'s nails', 'The floor']],
        ['What vibrates when a dholak is beaten?', 'The stretched skin', ['The rope', 'The wooden body only', 'The air outside only']],
        ['How does sound reach our ears from a ringing phone?', 'Vibrations travel through the air', ['Light carries it', 'It travels through wires to our ears', 'It does not travel']],
      ], 'Sound always comes from something vibrating.')),
      tp('pitch', (r) => {
        const cases: [string, string, string][] = [
          ['a short string', 'a long string', 'a short string'], ['a thin string', 'a thick string', 'a thin string'], ['a tight string', 'a loose string', 'a tight string'],
          ['a small bell', 'a big bell', 'a small bell'], ['a glass with little water (tapped)', 'a glass full of water (tapped)', 'a glass with little water (tapped)'], ['a mouse squeak', 'a lion roar', 'a mouse squeak'],
        ];
        const [a, b, hi] = r.pick(cases);
        return { type: 'mcq', prompt: `Which makes the higher-pitched sound: ${a} or ${b}?`, ...choose(r, hi, [hi === a ? b : a, 'Both the same']), hints: ['Higher pitch comes from faster vibration.', 'Smaller, shorter, thinner or tighter things vibrate faster.'], solution: [`${hi} vibrates faster → higher pitch.`] };
      }),
    ],
  }],
};


export default buildClass(7, [travel1, fractions, angles, travel2, farNear, dairy, shapesPat, weight, coconut, symm, quilt, racing, jumps, maps, pictures, floatSink, friction, light, sound, ...tsClass5]);
