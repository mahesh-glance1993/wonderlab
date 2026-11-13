// Class 4 — CBSE Mathematics (NCERT Maths Mela, Class 4) and age-appropriate physical-science exploration.
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, stepsB, num, frac, choose, chooseNum, matching, ordering, tapAll,
  NAMES, THINGS, type USpec, type QSpec,
} from '../lib/kit';
import type { Rng } from '../../shared/grading';
import type { Choice } from '../../shared/content';
import { tsClass4 } from '../ts/c4';

const nm = (r: Rng) => r.pick(NAMES).en;
const comma = (n: number) => n.toLocaleString('en-IN');
const pad2 = (n: number) => String(n).padStart(2, '0');
/** Wrong answer from the "subtract smaller digit from larger" slip. */
const smallFromLarge = (a: number, b: number) => {
  const A = String(a), B = String(b).padStart(A.length, '0');
  return +A.split('').map((d, i) => Math.abs(+d - +B[i])).join('');
};
/** Drag items into bins (rendered with a tap alternative). */
function sortInto(r: Rng, items: [string, number][], bins: string[]): Pick<QSpec, 'left' | 'right' | 'answer'> {
  const sh = r.shuffle(items);
  const left: Choice[] = sh.map(([l], i) => ({ id: `l${i + 1}`, label: { en: l } }));
  const right: Choice[] = bins.map((b, i) => ({ id: `r${i + 1}`, label: { en: b } }));
  const pairs: Record<string, string> = {};
  sh.forEach(([, bi], i) => (pairs[`l${i + 1}`] = `r${bi + 1}`));
  return { left, right, answer: { kind: 'match', pairs } };
}

// ------------------------------------------------------------------ MATHS
const SHAPES2D: { name: string; shape: 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon'; n: number }[] = [
  { name: 'triangle', shape: 'triangle', n: 3 }, { name: 'square', shape: 'square', n: 4 }, { name: 'rectangle', shape: 'rectangle', n: 4 },
  { name: 'pentagon', shape: 'pentagon', n: 5 }, { name: 'hexagon', shape: 'hexagon', n: 6 },
];
const shapes: USpec = {
  id: 'c4.u.shapes', subject: 'math', title: 'Shapes Around Us', source: src('mm4', 1, 'Shapes Around Us'),
  objectives: [{
    id: 'c4.shapes.props', title: 'Sides, corners, faces and edges', prereqs: [],
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('Flat (2D) shapes have sides and corners. Solid (3D) shapes have faces, edges and corners (vertices).'),
      vis({ kind: 'shape', shape: 'hexagon' }, 'A hexagon has 6 sides and 6 corners'),
      p('A dice is a cube: 6 square faces, 12 edges, 8 corners. A brick is a cuboid with the same counts but rectangular faces.'),
      tip('Count each corner once — put a finger on it as you count.'),
    ],
    examples: [
      ex('How many sides does a pentagon have?', ['"Penta" means five', 'Count the sides: 1, 2, 3, 4, 5'], '5 sides', { kind: 'shape', shape: 'pentagon' }),
      ex('How many edges does a matchbox (cuboid) have?', ['4 edges on top, 4 at the bottom, 4 standing up', '4 + 4 + 4 = 12'], '12 edges'),
    ],
    practice: [
      tp('sides', (r) => {
        const s = r.pick(SHAPES2D);
        const what = r.pick(['sides', 'corners']);
        return {
          type: 'typed', keypad: 'numeric', prompt: `How many ${what} does this ${s.name} have?`, visual: { kind: 'shape', shape: s.shape }, answer: num(s.n),
          hints: [`Touch each ${what === 'sides' ? 'side' : 'corner'} as you count.`, 'A closed flat shape has as many corners as sides.'],
          solution: [`A ${s.name} has ${s.n} sides and ${s.n} corners.`],
        };
      }),
      tp('solids', (r) => {
        const bank: [string, string, number][] = [
          ['a dice (cube)', 'faces', 6], ['a dice (cube)', 'edges', 12], ['a dice (cube)', 'corners', 8],
          ['a brick (cuboid)', 'faces', 6], ['a brick (cuboid)', 'edges', 12], ['a tin of ghee (cylinder)', 'flat faces', 2],
          ['a birthday cap (cone)', 'flat faces', 1], ['a cricket ball (sphere)', 'flat faces', 0], ['a birthday cap (cone)', 'corners (pointed tips)', 1],
        ];
        const [obj, what, n] = r.pick(bank);
        return {
          type: 'mcq', prompt: `How many ${what} does ${obj} have?`, ...chooseNum(r, n, [n + 2, n - 2, n + 4, 6, 8, 12]),
          hints: ['Imagine holding the object and turning it around.', 'Faces are the flat surfaces; edges are where two faces meet.'],
          solution: [`${obj[0].toUpperCase() + obj.slice(1)} has ${n} ${what}.`],
        };
      }),
    ],
  }],
};

const hide: USpec = {
  id: 'c4.u.hide', subject: 'math', title: 'Hide and Seek', source: src('mm4', 2, 'Hide and Seek'),
  objectives: [{
    id: 'c4.space.views', title: 'Views from top and front; positions', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('The same object looks different from the top, the front and the side. A glass looks like a circle from the top but like a rectangle from the front.'),
      p('Positions in a line can be counted from the left or from the right.'),
      f('Position from right = (total − position from left) + 1'),
    ],
    examples: [
      ex('What does a bucket look like from the top?', ['Look straight down at the rim', 'The rim is round'], 'A circle'),
      ex('In a row of 9 children, Diya is 3rd from the left. Her place from the right?', ['Children to her right: 9 − 3 = 6', 'She is next: 6 + 1 = 7'], '7th from the right'),
    ],
    practice: [
      tp('top-view', (r) => {
        const bank: [string, string, string][] = [
          ['a steel glass', 'top', 'Circle'], ['a dice', 'top', 'Square'], ['a matchbox lying flat', 'top', 'Rectangle'],
          ['a cricket ball', 'top', 'Circle'], ['a tent', 'front', 'Triangle'], ['a tin of oil', 'front', 'Rectangle'],
          ['an ice-cream cone (point down)', 'top', 'Circle'], ['a birthday cap', 'side', 'Triangle'],
        ];
        const [obj, side, ans] = r.pick(bank);
        return {
          type: 'mcq', prompt: `What shape do you see when you look at ${obj} from the ${side}?`, ...choose(r, ans, ['Circle', 'Square', 'Rectangle', 'Triangle'].filter((x) => x !== ans)),
          hints: [`Imagine standing so that your eye is exactly at the ${side}.`, 'Only the outline facing you matters.'],
          solution: [`From the ${side}, ${obj} looks like a ${ans.toLowerCase()}.`],
        };
      }),
      tp('position', (r) => {
        const n = r.int(7, 25), k = r.int(2, n - 1);
        const who = nm(r);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${n} children stand in a line for the assembly. ${who} is ${k}th from the left. What is ${who}'s position from the right?`,
          answer: num(n - k + 1),
          hints: [`How many children are to the right of ${who}? ${n} − ${k}.`, `Then add 1 for ${who}.`],
          mistakes: [{ when: String(n - k), explain: `You counted the children to the right but forgot to count ${who} as well — add 1.` }],
          solution: [`Children to the right: ${n} − ${k} = ${n - k}`, `Position from right = ${n - k} + 1 = ${n - k + 1}`],
        };
      }),
    ],
  }],
};

const pattern: USpec = {
  id: 'c4.u.pattern', subject: 'math', title: 'Pattern Around Us', source: src('mm4', 3, 'Pattern Around Us'),
  objectives: [{
    id: 'c4.pattern.number', title: 'Number and shape patterns', prereqs: [],
    activities: ['game:patterns'],
    intro: [
      p('A pattern follows a rule. Find the rule, then use it to find the next term.'),
      stepsB('Look at how each number changes to the next.', 'Check the rule works for every step.', 'Apply it once more.'),
      vis({ kind: 'emoji', text: '🔺🟦🔺🟦🔺🟦' }, 'A repeating pattern: triangle, square'),
    ],
    examples: [
      ex('Next number: 5, 12, 19, 26, …', ['Each number is 7 more', '26 + 7 = 33'], '33'),
      ex('Next number: 2, 4, 8, 16, …', ['Each number doubles', '16 × 2 = 32'], '32'),
    ],
    practice: [
      tp('add-rule', (r) => {
        const a = r.int(2, 60), d = r.pick([3, 4, 5, 6, 7, 9, 11, 25, 50, 100]) * r.pick([1, 1, -1]);
        const start = d < 0 ? a + 10 * -d : a;
        const seq = [0, 1, 2, 3].map((i) => start + i * d);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the next number: ${seq.join(', ')}, …`, answer: num(start + 4 * d),
          hints: ['Subtract one number from the next to find the change.', `The change each time is ${d > 0 ? '+' : '−'}${Math.abs(d)}.`],
          mistakes: [{ when: String(start + 3 * d - d), explain: 'Careful with the direction: is the pattern going up or down?' }],
          solution: [`Rule: ${d > 0 ? 'add' : 'subtract'} ${Math.abs(d)}`, `${seq[3]} ${d > 0 ? '+' : '−'} ${Math.abs(d)} = ${start + 4 * d}`],
        };
      }),
      tp('repeat', (r) => {
        const sets = [['🔺', '🟦', '🟢'], ['🌼', '🍃'], ['🥭', '🍌', '🍌'], ['⭐', '🌙', '🌙', '⭐'], ['🪁', '🎈', '🟠']];
        const unit = r.pick(sets);
        const len = r.int(unit.length + 2, unit.length * 3);
        const shown = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
        const next = unit[len % unit.length];
        const uniq = [...new Set(unit)];
        return {
          type: 'mcq', prompt: `What comes next? ${shown.join(' ')} …`, ...choose(r, next, [...uniq.filter((u) => u !== next), '🔵', '🍎'].slice(0, 3)),
          hints: ['Find the part that repeats.', `The repeating part is ${unit.join(' ')}.`],
          solution: [`Repeating unit: ${unit.join(' ')}`, `Next is ${next}`],
        };
      }),
      tp('double', (r) => {
        const a = r.int(1, 9), m = r.pick([2, 3]);
        const seq = [a, a * m, a * m * m, a * m ** 3];
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the next number: ${seq.join(', ')}, …`, answer: num(a * m ** 4),
          hints: ['The jumps are getting bigger — try multiplying.', `Each number is ${m} times the one before.`],
          mistakes: [{ when: String(seq[3] + (seq[3] - seq[2])), explain: 'The difference is not the same each time; check if the numbers are being multiplied.' }],
          solution: [`Rule: multiply by ${m}`, `${seq[3]} × ${m} = ${a * m ** 4}`],
        };
      }, 2),
    ],
  }],
};

const thousands: USpec = {
  id: 'c4.u.thousands', subject: 'math', title: 'Thousands Around Us', source: src('mm4', 4, 'Thousands Around Us'),
  objectives: [{
    id: 'c4.num.thousands', title: 'Place value up to 9999', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('In a 4-digit number the places are thousands, hundreds, tens and ones. 3,472 = 3 thousands + 4 hundreds + 7 tens + 2 ones.'),
      f('3472 = 3000 + 400 + 70 + 2'),
      vis({ kind: 'number-line', from: 0, to: 10000, step: 1000, marks: [3000, 7000] }, 'Number line from 0 to 10000 in thousands'),
    ],
    examples: [
      ex('What is the value of 6 in 6,315?', ['6 is in the thousands place', '6 × 1000 = 6000'], '6000'),
      ex('Which is greater: 4,089 or 4,098?', ['Thousands same (4), hundreds same (0)', 'Tens: 8 > 9? No, 9 > 8'], '4,098'),
    ],
    practice: [
      tp('value', (r) => {
        const n = r.int(1000, 9999);
        const s = String(n), pos = r.int(0, 3);
        const placeNames = ['thousands', 'hundreds', 'tens', 'ones'];
        const d = +s[pos], v = d * 10 ** (3 - pos);
        return {
          type: 'typed', keypad: 'numeric', prompt: `What is the place value of the digit in the ${placeNames[pos]} place of ${comma(n)}?`, answer: num(v),
          hints: [`The digit in the ${placeNames[pos]} place is ${d}.`, `Multiply it by ${10 ** (3 - pos)}.`],
          mistakes: [{ when: String(d), explain: `${d} is the digit (face value). Its place value is ${d} × ${10 ** (3 - pos)}.` }],
          solution: [`${comma(n)} = ${s.split('').map((x, i) => +x * 10 ** (3 - i)).join(' + ')}`, `Place value = ${v}`],
        };
      }),
      tp('expand', (r) => {
        const th = r.int(1, 9), h = r.int(0, 9), t = r.int(0, 9), o = r.int(0, 9);
        const parts = [[th, 1000], [h, 100], [t, 10], [o, 1]].filter(([d]) => d > 0).map(([d, pv]) => d * pv);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Write the number: ${r.shuffle(parts).join(' + ')}`, answer: num(th * 1000 + h * 100 + t * 10 + o),
          hints: ['Put each part in its place: thousands, hundreds, tens, ones.', 'Use 0 for a missing place.'],
          solution: [`${th} thousands, ${h} hundreds, ${t} tens, ${o} ones`, `= ${th * 1000 + h * 100 + t * 10 + o}`],
        };
      }),
      tp('order', (r) => {
        const base = r.int(1, 8) * 1000;
        const nums = [...new Set([0, 1, 2, 3, 4].map(() => base + r.int(0, 999)))];
        while (nums.length < 4) nums.push(nums[nums.length - 1] + 101);
        const sorted = [...nums].sort((a, b) => a - b);
        return {
          type: 'order', prompt: 'Arrange from smallest to greatest.', ...ordering(r, sorted.map(comma)),
          hints: ['All have the same thousands — compare hundreds first.', 'If hundreds are equal, compare tens.'],
          solution: [sorted.map(comma).join(' < ')],
        };
      }),
      tp('line', (r) => {
        const n = r.int(1, 9) * 1000 + r.pick([0, 500]);
        return {
          type: 'number-line', line: { from: 0, to: 10000, step: 500 }, prompt: `Mark ${comma(n)} on the number line.`, answer: num(n),
          hints: ['Each small step is 500.', `Count thousands first: ${Math.floor(n / 1000)}.`],
          solution: [`${comma(n)} is ${n / 500} steps of 500 from 0.`],
        };
      }),
    ],
  }],
};

const sharing: USpec = {
  id: 'c4.u.sharing', subject: 'math', title: 'Sharing and Measuring', source: src('mm4', 5, 'Sharing and Measuring'),
  objectives: [{
    id: 'c4.frac.parts', title: 'Halves, quarters and equal parts', prereqs: [],
    activities: ['game:fractions'],
    intro: [
      p('When a whole is shared into equal parts, each part is a fraction. 1 of 4 equal parts is one-quarter, written 1/4.'),
      vis({ kind: 'fraction-circle', parts: 4, shaded: 1 }, 'A roti cut into 4 equal parts, 1 part shaded'),
      tip('The parts must be EQUAL in size for fractions to work.'),
    ],
    examples: [
      ex('A roti is cut into 4 equal pieces. Ravi eats 3. What fraction did he eat?', ['4 equal parts in the whole', '3 parts eaten'], '3/4', { kind: 'fraction-circle', parts: 4, shaded: 3 }),
      ex('Half of 18 laddoos?', ['Share 18 into 2 equal groups', '18 ÷ 2 = 9'], '9 laddoos'),
    ],
    practice: [
      tp('shaded', (r) => {
        const parts = r.pick([2, 3, 4, 5, 6, 8]), shaded = r.int(1, parts - 1);
        const kind = r.pick(['fraction-circle', 'fraction-bar'] as const);
        return {
          type: 'typed', keypad: 'fraction', prompt: 'What fraction of the shape is shaded?', visual: kind === 'fraction-bar' ? { kind, parts, shaded } : { kind, parts, shaded },
          answer: frac(shaded, parts),
          hints: ['Count all the equal parts — that goes at the bottom.', 'Count the shaded parts — that goes on top.'],
          mistakes: [{ when: `${parts}/${shaded}`, explain: 'Upside down! The bottom number counts all the parts; the top counts the shaded parts.' }, { when: `${shaded}/${parts - shaded}`, explain: 'The bottom number is ALL the parts, not just the unshaded ones.' }],
          solution: [`${shaded} shaded out of ${parts} equal parts = ${shaded}/${parts}`],
        };
      }),
      tp('of-amount', (r) => {
        const d = r.pick([2, 3, 4]), each = r.int(2, 12), n = d * each;
        const t = r.pick(THINGS);
        const word = d === 2 ? 'half' : d === 3 ? 'one-third' : 'one-quarter';
        return {
          type: 'typed', keypad: 'numeric', prompt: `${nm(r)} has ${n} ${t.en}. ${word[0].toUpperCase() + word.slice(1)} of them are given to a friend. How many is that?`,
          visual: { kind: 'objects', emoji: t.emoji, count: n, groupsOf: each },
          answer: num(each),
          hints: [`${word} means share into ${d} equal groups.`, `${n} ÷ ${d}`],
          solution: [`${n} ÷ ${d} = ${each}`, `${word} of ${n} is ${each}`],
        };
      }),
    ],
  }],
};

const length: USpec = {
  id: 'c4.u.length', subject: 'math', title: 'Measuring Length', source: src('mm4', 6, 'Measuring Length'),
  objectives: [{
    id: 'c4.meas.length', title: 'Metres and centimetres', prereqs: [],
    intro: [
      f('1 m = 100 cm'),
      p('Use centimetres for small things (a pencil) and metres for big things (a classroom).'),
      p('To change metres to centimetres, multiply by 100.'),
    ],
    examples: [
      ex('2 m 35 cm = ? cm', ['2 m = 200 cm', '200 + 35 = 235'], '235 cm'),
      ex('Meena has 1 m of ribbon and uses 45 cm. How much is left?', ['1 m = 100 cm', '100 − 45 = 55'], '55 cm'),
    ],
    practice: [
      tp('convert', (r) => {
        const m = r.int(1, 9), cm = r.int(1, 99);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `${m} m ${cm} cm = how many centimetres?`, answer: num(m * 100 + cm, 'cm'),
          hints: ['1 m = 100 cm', `${m} m = ${m * 100} cm`],
          mistakes: [{ when: String(m * 10 + cm), explain: 'One metre is 100 cm, not 10 cm.' }, { when: `${m}${cm}`, explain: 'Do not just write the numbers side by side — change metres to cm and add.' }],
          solution: [`${m} m = ${m * 100} cm`, `${m * 100} + ${cm} = ${m * 100 + cm} cm`],
        };
      }),
      tp('left', (r) => {
        const total = r.int(1, 4), used = r.int(15, total * 100 - 10);
        const item = r.pick(['ribbon', 'rope', 'cloth', 'wire']);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `${nm(r)} has ${total} m of ${item} and cuts off ${used} cm. How much ${item} is left? (Write the unit.)`,
          answer: num(total * 100 - used, 'cm', true),
          hints: [`Change ${total} m into cm first.`, `${total * 100} − ${used}`],
          mistakes: [{ when: 'missing-unit', explain: 'Lengths need a unit — write cm (or m).' }],
          solution: [`${total} m = ${total * 100} cm`, `${total * 100} − ${used} = ${total * 100 - used} cm`],
        };
      }, 2),
      tp('best-unit', (r) => {
        const bank: [string, string][] = [['the length of a pencil', 'cm'], ['the height of a coconut tree', 'm'], ['the length of a classroom', 'm'], ['the width of your thumb', 'cm'], ['the length of a cricket pitch', 'm'], ['the length of an eraser', 'cm'], ['the height of a door', 'm']];
        const [thing, u] = r.pick(bank);
        return { type: 'mcq', prompt: `Which unit is best for measuring ${thing}?`, ...choose(r, u === 'cm' ? 'centimetres (cm)' : 'metres (m)', [u === 'cm' ? 'metres (m)' : 'centimetres (cm)', 'kilograms (kg)']), hints: ['Is it smaller or bigger than your arm span?'], solution: [`Use ${u === 'cm' ? 'centimetres' : 'metres'} for ${thing}.`] };
      }),
    ],
  }],
};

const village: USpec = {
  id: 'c4.u.village', subject: 'math', title: 'The Cleanest Village', source: src('mm4', 7, 'The Cleanest Village'),
  objectives: [{
    id: 'c4.ops.addsub', title: 'Adding and subtracting 4-digit numbers', prereqs: ['c4.num.thousands'],
    intro: [
      p('Line up the digits by place value. Start from the ones place and regroup (carry or borrow) when needed.'),
      stepsB('Ones', 'Tens', 'Hundreds', 'Thousands'),
      tip('Check a subtraction by adding the answer to the smaller number.'),
    ],
    examples: [
      ex('A village collected 2,456 kg of dry waste and 1,879 kg of wet waste. Total?', ['6 + 9 = 15: write 5 carry 1', '5 + 7 + 1 = 13: write 3 carry 1', '4 + 8 + 1 = 13: write 3 carry 1', '2 + 1 + 1 = 4'], '4,335 kg'),
      ex('5,002 − 1,348?', ['Borrow across the zeros: 5002 = 4 thousands, 9 hundreds, 9 tens, 12 ones', '12 − 8 = 4, 9 − 4 = 5, 9 − 3 = 6, 4 − 1 = 3'], '3,654'),
    ],
    practice: [
      tp('add', (r) => {
        const a = r.int(1200, 5999), b = r.int(1100, 3999);
        const v = r.pick(['Swachhpur', 'Hariyali', 'Nirmalgaon', 'Sundarpalli']);
        return {
          type: 'typed', keypad: 'numeric', prompt: `${v} village planted ${comma(a)} saplings last year and ${comma(b)} this year. How many saplings in all?`, answer: num(a + b),
          hints: ['Add ones first, then tens, hundreds, thousands.', 'Remember to carry when a column adds up to 10 or more.'],
          mistakes: [{ when: String(a + b - 10), explain: 'Looks like a carry was missed. Check each column again.' }],
          solution: [`${comma(a)} + ${comma(b)} = ${comma(a + b)}`],
        };
      }),
      tp('sub', (r) => {
        let a = r.int(3000, 9000), b = r.int(1000, a - 500);
        if (smallFromLarge(a, b) === a - b) { a += 3; b += 7; }
        const wrong = smallFromLarge(a, b);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A school had ${comma(a)} plastic bottles to recycle. ${comma(b)} have been sent to the recycling centre. How many are left?`, answer: num(a - b),
          hints: ['Subtract column by column starting with the ones.', 'If the top digit is smaller, borrow from the next place.'],
          mistakes: [{ when: String(wrong), explain: 'You took the smaller digit from the larger one in some columns. When the top digit is smaller, borrow 1 from the next place instead.' }],
          solution: [`${comma(a)} − ${comma(b)} = ${comma(a - b)}`, `Check: ${comma(a - b)} + ${comma(b)} = ${comma(a)}`],
        };
      }),
    ],
  }],
};

const weigh: USpec = {
  id: 'c4.u.weigh', subject: 'math', title: 'Weigh it, Pour it', source: src('mm4', 8, 'Weigh it, Pour it'),
  objectives: [{
    id: 'c4.meas.mass-cap', title: 'Kilograms, grams, litres and millilitres', prereqs: [],
    activities: ['game:balance'],
    intro: [f('1 kg = 1000 g'), f('1 L = 1000 mL'), p('We weigh rice in kilograms and spices in grams. We measure milk in litres and medicine in millilitres.')],
    examples: [
      ex('2 kg 350 g = ? g', ['2 kg = 2000 g', '2000 + 350 = 2350'], '2350 g'),
      ex('How many 250 mL glasses can be filled from a 1 L bottle?', ['1 L = 1000 mL', '1000 ÷ 250 = 4'], '4 glasses'),
    ],
    practice: [
      tp('kg-g', (r) => {
        const kg = r.int(1, 9), g = r.pick([50, 100, 250, 300, 450, 500, 750, 800, 125]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'g', prompt: `A bag of rice weighs ${kg} kg ${g} g. How many grams is that?`, answer: num(kg * 1000 + g, 'g'),
          hints: ['1 kg = 1000 g', `${kg} kg = ${kg * 1000} g`],
          mistakes: [{ when: String(kg * 100 + g), explain: '1 kg is 1000 g, not 100 g.' }],
          solution: [`${kg} kg = ${kg * 1000} g`, `${kg * 1000} + ${g} = ${kg * 1000 + g} g`],
        };
      }),
      tp('glasses', (r) => {
        const L = r.int(1, 5), cup = r.pick([100, 200, 250, 500]);
        const drink = r.pick(['buttermilk', 'lemon juice', 'water', 'milk']);
        return {
          type: 'typed', keypad: 'numeric', prompt: `How many ${cup} mL glasses can be filled from ${L} L of ${drink}?`, answer: num((L * 1000) / cup),
          hints: ['Change litres into millilitres.', `${L} L = ${L * 1000} mL`],
          mistakes: [{ when: String(L * cup), explain: 'Divide the total millilitres by the size of one glass.' }],
          solution: [`${L} L = ${L * 1000} mL`, `${L * 1000} ÷ ${cup} = ${(L * 1000) / cup} glasses`],
        };
      }),
      tp('heavier', (r) => {
        const a = r.int(1, 4) * 1000 + r.pick([0, 200, 500]), b = r.int(500, 4500);
        const [x, y] = [`${Math.floor(a / 1000)} kg ${a % 1000} g`, `${b} g`];
        if (a === b) return { type: 'mcq', prompt: `Which is heavier: ${x} or ${b + 100} g?`, ...choose(r, `${b + 100} g`, [x, 'Both are equal']), hints: ['Change both to grams.'], solution: [`${x} = ${a} g < ${b + 100} g`] };
        const ans = a > b ? x : y;
        return { type: 'mcq', prompt: `Which is heavier: ${x} or ${y}?`, ...choose(r, ans, [a > b ? y : x, 'Both are equal']), hints: ['Change both to grams before comparing.', `${x} = ${a} g`], solution: [`${x} = ${a} g, ${y} = ${b} g`, `${ans} is heavier.`] };
      }),
    ],
  }],
};

const groups: USpec = {
  id: 'c4.u.groups', subject: 'math', title: 'Equal Groups', source: src('mm4', 9, 'Equal Groups'),
  objectives: [{
    id: 'c4.ops.mult', title: 'Multiplication as equal groups', prereqs: [],
    activities: ['game:counting'],
    intro: [p('When there are equal groups, multiply instead of adding again and again.'), f('4 groups of 6 = 4 × 6 = 24'), vis({ kind: 'objects', emoji: '🍌', count: 12, groupsOf: 3 }, '4 groups of 3 bananas')],
    examples: [
      ex('5 plates with 4 idlis each. How many idlis?', ['5 equal groups of 4', '5 × 4 = 20'], '20 idlis'),
      ex('23 × 4 using place value?', ['20 × 4 = 80', '3 × 4 = 12', '80 + 12 = 92'], '92'),
    ],
    practice: [
      tp('groups', (r) => {
        const g = r.int(2, 6), each = r.int(2, 6), t = r.pick(THINGS);
        return {
          type: 'count', prompt: `There are ${g} groups of ${t.en}. How many ${t.en} in all?`, visual: { kind: 'objects', emoji: t.emoji, count: g * each, groupsOf: each }, answer: num(g * each),
          hints: [`How many in one group? ${each}.`, `${g} groups × ${each}`], mistakes: [{ when: String(g + each), explain: 'Adding the number of groups and the group size does not count all the objects — multiply.' }],
          solution: [`${g} × ${each} = ${g * each}`],
        };
      }),
      tp('2digit', (r) => {
        const a = r.int(12, 49), b = r.int(2, 9);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A bus has ${a} seats. How many seats are there in ${b} such buses?`, answer: num(a * b),
          hints: [`Split ${a} into tens and ones: ${Math.floor(a / 10) * 10} + ${a % 10}.`, 'Multiply each part and add.'],
          solution: [`${Math.floor(a / 10) * 10} × ${b} = ${Math.floor(a / 10) * 10 * b}`, `${a % 10} × ${b} = ${(a % 10) * b}`, `Total = ${a * b}`],
        };
      }),
    ],
  }],
};

const animals: USpec = {
  id: 'c4.u.animals', subject: 'math', title: 'Elephants, Tigers, and Leopards', source: src('mm4', 10, 'Elephants, Tigers, and Leopards'),
  note: 'One secondary listing numbers this chapter 11.',
  objectives: [{
    id: 'c4.num.reverse', title: 'Number puzzles and wildlife word problems', prereqs: ['c4.ops.addsub'],
    activities: ['game:logic'],
    intro: [
      p('Reverse a 2-digit number by swapping its digits: 52 becomes 25. The difference between a number and its reverse is always a multiple of 9!'),
      p('Wildlife counts use large numbers — add and compare them carefully.'),
    ],
    examples: [
      ex('Find 73 − 37.', ['73 − 37 = 36', '36 = 4 × 9'], '36'),
      ex('A reserve counted 486 spotted deer and 239 sambar. How many more spotted deer?', ['486 − 239', '= 247'], '247 more'),
    ],
    practice: [
      tp('reverse', (r) => {
        const a = r.int(1, 9); let b = r.int(0, 9);
        if (a === b) b = (b + 3) % 10;
        if (b === 0) b = 1;
        const n = Math.max(a, b) * 10 + Math.min(a, b), rev = Math.min(a, b) * 10 + Math.max(a, b);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Reverse ${n} to get ${rev}. What is ${n} − ${rev}?`, answer: num(n - rev),
          hints: ['Subtract carefully, borrowing if needed.', 'Your answer should be a multiple of 9.'],
          solution: [`${n} − ${rev} = ${n - rev} = 9 × ${(n - rev) / 9}`],
        };
      }),
      tp('wildlife', (r) => {
        const animal = r.pick(['tigers', 'elephants', 'leopards', 'blackbucks']);
        const a = r.int(120, 890), b = r.int(100, 780);
        const ask = r.pick(['total', 'diff'] as const);
        return {
          type: 'typed', keypad: 'numeric', prompt: ask === 'total' ? `A survey counted ${a} ${animal} in one forest and ${b} in another. How many in both?` : `A survey counted ${Math.max(a, b)} ${animal} in one forest and ${Math.min(a, b)} in another. How many more in the first?`,
          answer: num(ask === 'total' ? a + b : Math.abs(a - b)),
          hints: [ask === 'total' ? '"In both" means add.' : '"How many more" means subtract.', 'Line up the digits by place.'],
          solution: [ask === 'total' ? `${a} + ${b} = ${a + b}` : `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}`],
        };
      }),
    ],
  }],
};

const LETTERS: Record<string, number> = { A: 1, B: 1, C: 1, D: 1, E: 1, H: 2, I: 2, M: 1, T: 1, U: 1, V: 1, W: 1, X: 2, Y: 1, F: 0, G: 0, J: 0, L: 0, N: 0, P: 0, R: 0, S: 0, Z: 0 };
const symmetry: USpec = {
  id: 'c4.u.symmetry', subject: 'math', title: 'Fun with Symmetry', source: src('mm4', 11, 'Fun with Symmetry'),
  objectives: [{
    id: 'c4.geo.symmetry', title: 'Lines of symmetry', prereqs: ['c4.shapes.props'],
    activities: ['art:color', 'game:shapes'],
    intro: [p('A line of symmetry folds a shape into two halves that match exactly, like a mirror image.'), p('A square has 4 lines of symmetry; a rectangle has 2; a rangoli design often has many.'), vis({ kind: 'shape', shape: 'square' }, 'A square: 2 lines through the middles of sides and 2 diagonals')],
    examples: [
      ex('How many lines of symmetry does the letter H have?', ['Fold top to bottom: matches', 'Fold left to right: matches'], '2'),
      ex('Does the letter F have a line of symmetry?', ['Try folding across and down: the halves never match'], 'No'),
    ],
    practice: [
      tp('letters', (r) => {
        const ls = r.shuffle(Object.keys(LETTERS)).slice(0, 6);
        if (!ls.some((l) => LETTERS[l] > 0)) ls[0] = 'A';
        if (ls.every((l) => LETTERS[l] > 0)) ls[5] = 'F';
        return {
          type: 'tap', prompt: 'Tap every letter that has at least one line of symmetry.', ...tapAll(r, ls.map((l) => ({ label: l, ok: LETTERS[l] > 0 }))),
          hints: ['Imagine folding the letter down the middle, or across.', 'Letters like F, N, S have no line of symmetry.'],
          solution: [`Symmetric: ${ls.filter((l) => LETTERS[l] > 0).join(', ')}`],
        };
      }),
      tp('shape-lines', (r) => {
        const bank: [string, 'square' | 'rectangle' | 'triangle' | 'hexagon' | 'pentagon' | 'star' | 'diamond', number][] = [
          ['square', 'square', 4], ['rectangle', 'rectangle', 2], ['equilateral triangle', 'triangle', 3], ['regular hexagon', 'hexagon', 6], ['regular pentagon', 'pentagon', 5], ['five-pointed star', 'star', 5], ['rhombus (diamond)', 'diamond', 2],
        ];
        const [name, shape, n] = r.pick(bank);
        return {
          type: 'mcq', prompt: `How many lines of symmetry does a ${name} have?`, visual: { kind: 'shape', shape }, ...chooseNum(r, n, [n + 1, n - 1, n * 2]),
          hints: ['Try lines through corners and through the middles of sides.', 'Regular shapes have as many lines as sides.'],
          solution: [`A ${name} has ${n} lines of symmetry.`],
        };
      }),
    ],
  }],
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const clocks: USpec = {
  id: 'c4.u.clocks', subject: 'math', title: 'Ticking Clocks and Turning Calendar', source: src('mm4', 12, 'Ticking Clocks and Turning Calendar'),
  objectives: [{
    id: 'c4.time.clock', title: 'Reading clocks, time taken and calendars', prereqs: [],
    intro: [p('The short hand shows the hour; the long hand shows minutes. Each number on the clock is 5 minutes for the long hand.'), f('1 hour = 60 minutes; 1 week = 7 days'), vis({ kind: 'clock', h: 3, m: 45 }, 'Clock showing 3:45')],
    examples: [
      ex('School starts at 8:30 and the first period ends at 9:15. How long is it?', ['8:30 → 9:00 is 30 min', '9:00 → 9:15 is 15 min', '30 + 15 = 45'], '45 minutes', { kind: 'clock', h: 8, m: 30 }),
      ex('Today is Monday. What day will it be after 10 days?', ['7 days later is Monday again', '3 more days → Thursday'], 'Thursday'),
    ],
    practice: [
      tp('read', (r) => {
        const h = r.int(1, 12), m = r.pick([0, 5, 10, 15, 20, 30, 40, 45, 50]);
        const t = (hh: number, mm: number) => `${hh}:${pad2(mm)}`;
        const swapH = m === 0 ? 12 : m / 5;
        return {
          type: 'mcq', prompt: 'What time does the clock show?', visual: { kind: 'clock', h, m }, ...choose(r, t(h, m), [t(swapH, (h * 5) % 60), t((h % 12) + 1, m), t(h, (m + 15) % 60)]),
          hints: ['Read the short hand for the hour.', 'Count the long hand in fives for minutes.'],
          mistakes: [{ when: 'wrong', explain: 'Check which hand is which: short = hours, long = minutes.' }],
          solution: [`Short hand near ${h}, long hand at ${m === 0 ? 12 : m / 5} → ${t(h, m)}`],
        };
      }),
      tp('elapsed', (r) => {
        const h = r.int(7, 10), m = r.pick([0, 10, 15, 20, 30, 45]), d = r.pick([25, 35, 40, 45, 50, 55, 70, 80, 90]);
        const em = h * 60 + m + d;
        const what = r.pick(['A cricket match practice', 'A train journey', 'A drawing class', 'A bus ride']);
        return {
          type: 'typed', keypad: 'units', unitHint: 'min', prompt: `${what} starts at ${h}:${pad2(m)} and ends at ${Math.floor(em / 60)}:${pad2(em % 60)}. How many minutes does it take?`, answer: num(d, 'min'),
          hints: ['Count up to the next full hour first.', 'Then add the remaining minutes.'],
          mistakes: [{ when: String(d + 40), explain: 'An hour has 60 minutes, not 100 — you cannot subtract clock times like ordinary numbers.' }],
          solution: [`From ${h}:${pad2(m)} to ${Math.floor(em / 60)}:${pad2(em % 60)} is ${d} minutes.`],
        };
      }),
      tp('calendar', (r) => {
        const s = r.int(0, 6), n = r.int(3, 20);
        return {
          type: 'mcq', prompt: `Today is ${DAYS[s]}. What day will it be after ${n} days?`, ...choose(r, DAYS[(s + n) % 7], [DAYS[(s + n + 1) % 7], DAYS[(s + n + 6) % 7], DAYS[(s + n + 3) % 7]]),
          hints: ['Every 7 days the same day comes back.', `${n} = ${Math.floor(n / 7)} weeks and ${n % 7} days.`],
          solution: [`${n} days = ${Math.floor(n / 7)} week(s) + ${n % 7} day(s)`, `${DAYS[s]} + ${n % 7} days → ${DAYS[(s + n) % 7]}`],
        };
      }),
    ],
  }],
};

const transport: USpec = {
  id: 'c4.u.transport', subject: 'math', title: 'The Transport Museum', source: src('mm4', 13, 'The Transport Museum'),
  note: 'One secondary listing numbers this chapter 14.',
  objectives: [{
    id: 'c4.ops.divide', title: 'Tables of 11–20 and division with remainders', prereqs: ['c4.ops.mult'],
    intro: [p('Division shares into equal groups. Anything that cannot be shared equally is the remainder.'), f('Dividend = Divisor × Quotient + Remainder'), tip('The remainder must always be smaller than the divisor.')],
    examples: [
      ex('15 × 6?', ['10 × 6 = 60', '5 × 6 = 30', '60 + 30 = 90'], '90'),
      ex('47 children, 12 per van. How many full vans and how many children left?', ['12 × 3 = 36, 12 × 4 = 48 (too many)', '47 − 36 = 11'], '3 full vans, 11 left over'),
    ],
    practice: [
      tp('table', (r) => {
        const a = r.int(11, 20), b = r.int(2, 9);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A museum has ${b} rows of old cycles with ${a} cycles in each row. How many cycles? (${a} × ${b})`, answer: num(a * b),
          hints: [`Split ${a} = 10 + ${a - 10}.`, `10 × ${b} + ${a - 10} × ${b}`], solution: [`${10 * b} + ${(a - 10) * b} = ${a * b}`],
        };
      }),
      tp('remainder', (r) => {
        const d = r.int(3, 12), q = r.int(3, 9), rem = r.int(1, d - 1);
        const n = d * q + rem;
        return {
          type: 'typed', keypad: 'numeric', prompt: `${n} passengers wait at the bus museum. Each mini-bus seats ${d}. How many passengers are left after filling as many mini-buses as possible?`,
          answer: num(rem), steps: [{ prompt: 'How many full mini-buses?', answer: num(q) }, { prompt: 'How many passengers left over?', answer: num(rem) }],
          hints: [`Which multiple of ${d} is just below ${n}?`, `${d} × ${q} = ${d * q}`],
          mistakes: [{ when: String(q), explain: 'That is the number of full buses (quotient). The question asks for passengers left over (remainder).' }],
          solution: [`${n} = ${d} × ${q} + ${rem}`, `${rem} passengers are left over.`],
        };
      }, 2),
    ],
  }],
};

const data: USpec = {
  id: 'c4.u.data', subject: 'math', title: 'Data Handling', source: src('mm4', 14, 'Data Handling'),
  objectives: [{
    id: 'c4.data.bars', title: 'Reading bar graphs and tables', prereqs: [],
    intro: [p('A bar graph shows data with bars: the taller the bar, the bigger the number.'), vis({ kind: 'bar-graph', labels: ['Idli', 'Dosa', 'Poha', 'Upma'], values: [8, 12, 5, 3], unit: 'children' }, 'Favourite breakfast of children'), tip('Read the number at the top of each bar from the scale.')],
    examples: [
      ex('Using the breakfast graph, which is most liked?', ['Find the tallest bar: Dosa (12)'], 'Dosa'),
      ex('How many more like idli than upma?', ['Idli 8, Upma 3', '8 − 3 = 5'], '5 more'),
    ],
    practice: [
      tp('more', (r) => {
        const labels = r.pick([['Mango', 'Banana', 'Guava', 'Grapes'], ['Kabaddi', 'Cricket', 'Kho-kho', 'Football'], ['Bus', 'Cycle', 'Walk', 'Auto']]);
        const values = labels.map(() => r.int(2, 15));
        const i = r.int(0, 3); let j = r.int(0, 3);
        if (i === j) j = (i + 1) % 4;
        if (values[i] === values[j]) values[i] += 2;
        const [hi, lo] = values[i] > values[j] ? [i, j] : [j, i];
        return {
          type: 'graph', keypad: 'numeric', prompt: `How many more children chose ${labels[hi]} than ${labels[lo]}?`, visual: { kind: 'bar-graph', labels, values, unit: 'children' }, answer: num(values[hi] - values[lo]),
          hints: ['Read both bars.', `${labels[hi]}: ${values[hi]}, ${labels[lo]}: ${values[lo]}`],
          mistakes: [{ when: String(values[hi] + values[lo]), explain: '"How many more" means find the difference — subtract.' }],
          solution: [`${values[hi]} − ${values[lo]} = ${values[hi] - values[lo]}`],
        };
      }),
      tp('most', (r) => {
        const labels = ['Red', 'Blue', 'Green', 'Yellow'];
        const values = r.shuffle([4, 7, 10, 13]).map((v) => v + r.int(0, 1));
        const least = r.next() < 0.5;
        const k = values.indexOf(least ? Math.min(...values) : Math.max(...values));
        return {
          type: 'graph', prompt: `Which colour was chosen by the ${least ? 'fewest' : 'most'} children?`, visual: { kind: 'bar-graph', labels, values, unit: 'children' },
          ...choose(r, labels[k], labels.filter((_, x) => x !== k)),
          hints: [least ? 'Look for the shortest bar.' : 'Look for the tallest bar.'], solution: [`${labels[k]} (${values[k]})`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICAL SCIENCE (exploration)
const machines: USpec = {
  id: 'c4.u.machines', subject: 'physics', title: 'Simple Machines', source: null,
  note: 'Age-appropriate exploration; mapping to the Class 4 EVS book (Our Wondrous World) needs educator verification.',
  objectives: [{
    id: 'c4.phy.machines', title: 'Levers, pulleys, ramps and wheels', prereqs: [],
    activities: ['game:balance', 'lab:forces'],
    intro: [
      p('Simple machines make work easier. A lever (seesaw) turns about a pivot. A pulley lifts loads by pulling down on a rope. A ramp lets us push heavy things up slowly. Wheels make moving easy.'),
      p('On a seesaw, a lighter child sitting further from the middle can balance a heavier child sitting closer.'),
      f('weight × distance (left) = weight × distance (right)'),
      act('lab:forces?mass=20&force=50&friction=0.1', 'Push a box in the Forces Lab — then try less friction'),
    ],
    examples: [
      ex('Ravi (30 kg) sits 2 m from the middle of a seesaw. Where should his father (60 kg) sit to balance?', ['30 × 2 = 60', '60 × ? = 60', '? = 1 m'], '1 m from the middle'),
      ex('Which machine is used to draw water from a well?', ['The bucket rope goes over a wheel at the top', 'Pulling down lifts the bucket up'], 'A pulley'),
    ],
    practice: [
      tp('balance', (r) => {
        const w1 = r.pick([20, 25, 30, 40]), d1 = r.pick([1, 2, 3]), k = r.pick([2, 3, 4]);
        const w2 = w1 * k;
        if ((w1 * d1) % w2 !== 0) {
          return { type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A ${w1} kg child sits ${d1 * k} m from the pivot of a seesaw. How far from the pivot must a ${w2} kg adult sit to balance?`, answer: num(d1, 'm'), hints: ['Weight × distance must be equal on both sides.', `${w1} × ${d1 * k} = ${w1 * d1 * k}`], solution: [`${w1 * d1 * k} ÷ ${w2} = ${d1} m`] };
        }
        return { type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A ${w1} kg child sits ${d1} m from the pivot. How far must a ${w2} kg adult sit to balance?`, answer: num((w1 * d1) / w2, 'm'), hints: ['Weight × distance must match.'], solution: [`${(w1 * d1) / w2} m`] };
      }, 2),
      tp('match', (r) => {
        const pairs: [string, string][] = r.shuffle([['Seesaw', 'Lever'], ['Flagpole rope', 'Pulley'], ['Slope into a truck', 'Ramp (inclined plane)'], ['Bullock cart', 'Wheel and axle'], ['Axe blade', 'Wedge'], ['Bottle-cap screw', 'Screw']] as [string, string][]).slice(0, 4);
        return { type: 'match', prompt: `Match each object to the simple machine it uses: ${pairs.map((x) => x[0]).join(', ')}.`, ...matching(r, pairs), hints: ['A lever turns about a point; a pulley has a rope over a wheel.'], solution: pairs.map(([a, b]) => `${a} → ${b}`) };
      }),
      tp('ramp', (r) => {
        const qs: [string, string, string[]][] = [
          ['Which ramp makes it easiest to push a drum of oil onto a truck?', 'A long, gentle ramp', ['A short, steep ramp', 'No ramp — lift it', 'A ramp made of sand']],
          ['Why do suitcases have wheels?', 'Rolling needs much less force than sliding', ['Wheels make it lighter', 'Wheels look nice', 'Wheels add friction']],
          ['Where should you push a door to open it most easily?', 'Far from the hinges', ['Near the hinges', 'Exactly at the hinges', 'It makes no difference']],
          ['A pulley at the top of a flagpole lets you…', 'Pull down to lift the flag up', ['Make the flag lighter', 'Lift without any force', 'Pull the pole down']],
          ['Which is a lever?', 'A bottle opener', ['A football', 'A rope', 'A bucket']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Simple machines trade a longer distance for a smaller force.'], solution: [a] };
      }),
    ],
  }],
};

const magnets: USpec = {
  id: 'c4.u.magnets', subject: 'physics', title: 'Fun with Magnets', source: null,
  note: 'Age-appropriate exploration; magnets are formally studied in Class 6 Curiosity ch. 4. EVS mapping needs educator verification.',
  objectives: [{
    id: 'c4.phy.magnets', title: 'Magnetic materials, poles and the compass', prereqs: [],
    intro: [
      p('Magnets pull (attract) things made of iron, nickel or cobalt. They do not attract wood, plastic, paper, glass, aluminium or copper.'),
      p('Every magnet has a North pole and a South pole. Like poles repel (push away); unlike poles attract.'),
      p('A freely hanging magnet always points North–South. That is how a compass works.'),
    ],
    examples: [
      ex('Will a magnet pick up a steel spoon?', ['Steel is mostly iron', 'Iron is attracted by magnets'], 'Yes'),
      ex('Two magnets are placed North pole to North pole. What happens?', ['Like poles repel'], 'They push away'),
    ],
    practice: [
      tp('materials', (r) => {
        const all: [string, boolean][] = [['Iron nail', true], ['Steel safety pin', true], ['Paper clip', true], ['Iron key', true], ['Wooden pencil', false], ['Plastic scale', false], ['Rubber eraser', false], ['Glass bangle', false], ['Aluminium foil', false], ['Copper wire', false], ['Cotton thread', false]];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some(([, ok]) => ok)) pick[0] = all[0];
        if (pick.every(([, ok]) => ok)) pick[4] = all[4];
        return {
          type: 'tap', prompt: 'Tap every object a magnet will pull.', ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))),
          hints: ['Magnets attract iron and steel.', 'Aluminium and copper are metals, but magnets do NOT attract them.'],
          solution: [`Attracted: ${pick.filter(([, ok]) => ok).map(([l]) => l).join(', ')}`],
        };
      }),
      tp('sort', (r) => {
        const all: [string, number][] = [['Iron nail', 0], ['Steel spoon', 0], ['Paper clip', 0], ['Iron key', 0], ['Wooden ruler', 1], ['Plastic bottle', 1], ['Glass marble', 1], ['Copper coin', 1], ['Aluminium plate', 1], ['Leather belt', 1]];
        const iron = r.shuffle(all.filter(([, b]) => b === 0)).slice(0, 2), other = r.shuffle(all.filter(([, b]) => b === 1)).slice(0, 2);
        const items = [...iron, ...other];
        return {
          type: 'drag', prompt: `Drag each object into the right box: ${items.map((x) => x[0]).join(', ')}.`, ...sortInto(r, items, ['Magnet pulls it', 'Magnet does not pull it']),
          hints: ['Only iron, steel, nickel and cobalt are attracted.', 'Copper and aluminium are metals that magnets do not pull.'],
          solution: [`Pulled: ${iron.map((x) => x[0]).join(', ')}`, `Not pulled: ${other.map((x) => x[0]).join(', ')}`],
        };
      }),
      tp('poles', (r) => {
        const a = r.pick(['North', 'South']), b = r.pick(['North', 'South']);
        const ans = a === b ? 'They repel (push apart)' : 'They attract (pull together)';
        const hold = r.pick(['a bar magnet', 'a ring magnet', 'a fridge magnet', 'a horseshoe magnet', 'a toy-train magnet']);
        return {
          type: 'mcq', prompt: `The ${a} pole of ${hold} is brought near the ${b} pole of another magnet. What happens?`, ...choose(r, ans, ['They repel (push apart)', 'They attract (pull together)', 'Nothing happens'].filter((x) => x !== ans)),
          hints: ['Like poles repel; unlike poles attract.'], solution: [`${a} and ${b} are ${a === b ? 'like' : 'unlike'} poles → ${ans.toLowerCase()}.`],
        };
      }),
      tp('compass', (r) => {
        const dirs = ['North', 'East', 'South', 'West'];
        const facing = r.int(0, 3), turn = r.pick([1, 2, 3]);
        const tname = turn === 1 ? 'a quarter turn to the right' : turn === 2 ? 'a half turn' : 'a quarter turn to the left';
        return {
          type: 'mcq', prompt: `Kiran uses a compass and faces ${dirs[facing]}. He makes ${tname}. Which direction does he face now?`, ...choose(r, dirs[(facing + turn) % 4], dirs.filter((_, i) => i !== (facing + turn) % 4)),
          hints: ['Clockwise order: North → East → South → West.', 'A quarter turn moves one step.'],
          solution: [`${dirs[facing]} + ${tname} → ${dirs[(facing + turn) % 4]}`],
        };
      }),
    ],
  }],
};

export default buildClass(6, [shapes, hide, pattern, thousands, sharing, length, village, weigh, groups, animals, symmetry, clocks, transport, data, machines, magnets, ...tsClass4]);
