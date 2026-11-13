// Class 9 — CBSE Mathematics (NCERT Ganita Manjari Parts 1 & 2, 2026-27) and physics chapters of NCERT Science: Exploration.
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, stepsB, num, approx, frac, expr, choose, matching, ordering, tapAll,
  gcd, fr, rd, sgn, NAMES, CITIES, isPrime, type USpec,
} from '../lib/kit';
import { tsClass9 } from '../ts/c9';

const PI = 22 / 7;
const HERON: [number, number, number, number][] = [[3, 4, 5, 6], [5, 5, 6, 12], [5, 5, 8, 12], [6, 8, 10, 24], [5, 12, 13, 30], [13, 14, 15, 84], [10, 10, 12, 48], [9, 10, 17, 36], [7, 15, 20, 42], [13, 13, 10, 60], [8, 15, 17, 60]];
const lin = (a: number, b: number, v = 'x') => `${a === 1 ? '' : a === -1 ? '−' : a}${v}${b ? ` ${sgn(b)}` : ''}`;

// ------------------------------------------------------------------ MATHS PART 1
const coords: USpec = {
  id: 'c9.u.coords', subject: 'math', title: 'Orienting Yourself: The Use of Coordinates', source: src('gm9a', 1, 'Orienting Yourself: The Use of Coordinates'),
  objectives: [{
    id: 'c9.coord.plane', title: 'Points, quadrants and distances on the coordinate plane', prereqs: [],
    activities: ['game:numberline'],
    intro: [
      p('Two perpendicular number lines (x-axis and y-axis) meeting at the origin O(0, 0) let us locate any point by an ordered pair (x, y).'),
      p('The axes split the plane into four quadrants: I (+, +), II (−, +), III (−, −), IV (+, −). Points on an axis lie in no quadrant.'),
      f('Distance between (x₁, y₁) and (x₂, y₂) = √((x₂ − x₁)² + (y₂ − y₁)²)'),
      tip('x first, then y — "walk along the corridor, then up the stairs".'),
    ],
    examples: [
      ex('In which quadrant is (−3, 5)?', ['x negative, y positive', 'That is quadrant II'], 'Quadrant II'),
      ex('Distance from (1, 1) to (7, 9)?', ['Δx = 6, Δy = 8', '√(36 + 64) = 10'], '10 units'),
    ],
    practice: [
      tp('quadrant', (r) => {
        const x = r.pick([-7, -5, -3, -2, -1, 1, 2, 4, 6, 8]), y = r.pick([-6, -4, -2, -1, 1, 3, 5, 9]);
        const q = x > 0 ? (y > 0 ? 'Quadrant I' : 'Quadrant IV') : y > 0 ? 'Quadrant II' : 'Quadrant III';
        return {
          type: 'mcq', prompt: `In which quadrant does the point (${x}, ${y}) lie?`, ...choose(r, q, ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'].filter((z) => z !== q)),
          hints: ['Look at the sign of x, then the sign of y.', 'I (+,+), II (−,+), III (−,−), IV (+,−)'], solution: [`x is ${x > 0 ? 'positive' : 'negative'}, y is ${y > 0 ? 'positive' : 'negative'} → ${q}`],
        };
      }),
      tp('dist', (r) => {
        const T: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
        const [a, b, c] = r.pick(T);
        const x1 = r.int(-5, 5), y1 = r.int(-5, 5);
        const x2 = x1 + a * r.pick([1, -1]), y2 = y1 + b * r.pick([1, -1]);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the distance between P(${x1}, ${y1}) and Q(${x2}, ${y2}).`, answer: num(c),
          hints: ['Find Δx and Δy.', 'Use √(Δx² + Δy²).'],
          mistakes: [{ when: String(a + b), explain: 'Use Pythagoras — do not just add the differences.' }],
          solution: [`Δx = ${x2 - x1}, Δy = ${y2 - y1}`, `√(${a * a} + ${b * b}) = ${c}`],
        };
      }),
      tp('axis', (r) => {
        const v = r.int(1, 9) * r.pick([1, -1]);
        const onX = r.next() < 0.5;
        const pt = onX ? `(${v}, 0)` : `(0, ${v})`;
        const ans = onX ? 'On the x-axis' : 'On the y-axis';
        return { type: 'mcq', prompt: `Where does the point ${pt} lie?`, ...choose(r, ans, ['On the x-axis', 'On the y-axis', 'In Quadrant I', 'At the origin'].filter((z) => z !== ans)), hints: ['A zero coordinate puts the point on an axis.'], solution: [onX ? 'y = 0, so it is on the x-axis.' : 'x = 0, so it is on the y-axis.'] };
      }),
    ],
  }],
};

const linpoly: USpec = {
  id: 'c9.u.linpoly', subject: 'math', title: 'Introduction to Linear Polynomials', source: src('gm9a', 2, 'Introduction to Linear Polynomials'),
  objectives: [{
    id: 'c9.poly.linear', title: 'Linear polynomials: values and zeroes', prereqs: ['c9.coord.plane'],
    intro: [
      p('A linear polynomial has the form ax + b with a ≠ 0. Its graph y = ax + b is a straight line.'),
      p('The zero of ax + b is the value of x that makes it 0: x = −b/a. It is where the line crosses the x-axis.'),
      vis({ kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[-1, -5], [0, -3], [1, -1], [2, 1], [3, 3]] }, 'Graph of y = 2x − 3'),
    ],
    examples: [
      ex('Find p(3) for p(x) = 4x − 7.', ['p(3) = 12 − 7 = 5'], '5'),
      ex('Find the zero of 3x + 12.', ['3x + 12 = 0', 'x = −4'], '−4'),
    ],
    practice: [
      tp('value', (r) => {
        const a = r.pick([-5, -3, -2, 2, 3, 4, 5, 7]), b = r.int(-9, 9), x = r.int(-5, 6);
        return {
          type: 'typed', keypad: 'numeric', prompt: `If p(x) = ${lin(a, b)}, find p(${x}).`, answer: num(a * x + b),
          hints: [`Replace x by ${x}.`, `${a} × ${x} = ${a * x}`], solution: [`p(${x}) = ${a}(${x}) ${sgn(b)} = ${a * x + b}`],
        };
      }),
      tp('zero', (r) => {
        const a = r.pick([2, 3, 4, 5, -2, -3]), z = r.int(-6, 6), b = -a * z;
        return {
          type: 'typed', keypad: 'fraction', prompt: `Find the zero of the polynomial ${lin(a, b)}.`, answer: frac(z, 1),
          hints: ['Set it equal to 0.', 'x = −b/a'],
          mistakes: [{ when: String(-z), explain: 'Check the sign: x = −b/a.' }],
          solution: [`${lin(a, b)} = 0`, `x = ${-b}/${a} = ${z}`],
        };
      }),
      tp('graph', (r) => {
        const a = r.pick([1, 2, 3, -1, -2]), b = r.int(-4, 4);
        const pts: [number, number][] = [-2, -1, 0, 1, 2].map((x) => [x, a * x + b]);
        const ask = r.pick(['slope', 'intercept'] as const);
        return {
          type: 'graph', keypad: 'numeric', visual: { kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: pts },
          prompt: ask === 'slope' ? `The graph shows y = ax + ${b} (x from −2 to 2). By how much does y change when x increases by 1? (This is a.)` : `The graph shows a line y = ${a}x + b. Read the value of b (where the line crosses the y-axis).`,
          answer: num(ask === 'slope' ? a : b),
          hints: [ask === 'slope' ? 'Compare y at x = 0 and x = 1.' : 'Find y when x = 0.'], solution: [ask === 'slope' ? `y goes from ${b} to ${a + b}: change = ${a}` : `At x = 0, y = ${b}`],
        };
      }),
    ],
  }],
};

const numbers: USpec = {
  id: 'c9.u.numbers', subject: 'math', title: 'The World of Numbers', source: src('gm9a', 3, 'The World of Numbers'),
  objectives: [{
    id: 'c9.num.real', title: 'Rational and irrational numbers; surds', prereqs: [],
    intro: [
      p('A rational number can be written as p/q with integers p, q and q ≠ 0. Its decimal either terminates or repeats.'),
      p('An irrational number (like √2, √3, π) has a decimal that never ends and never repeats. Together they form the real numbers.'),
      f('√a × √b = √(ab),  √(a²b) = a√b,  1/√a = √a/a'),
      tip('√n is rational only when n is a perfect square.'),
    ],
    examples: [
      ex('Simplify √72.', ['72 = 36 × 2', '√72 = 6√2'], '6√2'),
      ex('Write 0.4545… as p/q.', ['x = 0.4545…, 100x = 45.4545…', '99x = 45', 'x = 45/99 = 5/11'], '5/11'),
    ],
    practice: [
      tp('classify', (r) => {
        const opts: [string, boolean][] = [['√16', true], ['√7', false], ['3/8', true], ['π', false], ['0.333…', true], ['√2 + 1', false], ['1.25', true], ['√50', false], ['√(9/4)', true], ['2√3', false], ['0.1010010001…', false], ['−7', true]];
        const [n, rat] = r.pick(opts);
        return { type: 'mcq', prompt: `Is ${n} rational or irrational?`, ...choose(r, rat ? 'Rational' : 'Irrational', [rat ? 'Irrational' : 'Rational']), hints: ['Can it be written as p/q?', 'Does its decimal terminate or repeat?'], solution: [`${n} is ${rat ? 'rational' : 'irrational'}.`] };
      }),
      tp('simplify', (r) => {
        const k = r.int(2, 9), m = r.pick([2, 3, 5, 6, 7]);
        const n = k * k * m;
        return {
          type: 'typed', keypad: 'algebra', prompt: `Simplify √${n} to the form a√b (type like 3√5 or 3*sqrt5).`, answer: expr(`${k}√${m}`, `${k}sqrt${m}`, `${k}sqrt(${m})`, `${k}√(${m})`),
          hints: ['Find the largest perfect square factor.', `${n} = ${k * k} × ${m}`], solution: [`√${n} = √(${k * k} × ${m}) = ${k}√${m}`],
        };
      }, 2),
      tp('recurring', (r) => {
        const d = r.pick([9, 99]);
        const n = d === 9 ? r.int(1, 8) : r.int(10, 98);
        const rep = d === 9 ? `0.${n}${n}${n}…` : `0.${n}${n}…`;
        return {
          type: 'typed', keypad: 'fraction', prompt: `Write ${rep} as a fraction p/q in lowest terms.`, answer: frac(n / gcd(n, d), d / gcd(n, d), true),
          hints: [`Let x = ${rep}; multiply by ${d + 1}.`, `Subtract: ${d}x = ${n}.`],
          mistakes: [{ when: 'not-lowest', explain: 'Correct value — now cancel common factors to get lowest terms.' }],
          solution: [`${d}x = ${n}`, `x = ${n}/${d} = ${fr(n, d)}`],
        };
      }, 2),
    ],
  }],
};

const identities: USpec = {
  id: 'c9.u.identities', subject: 'math', title: 'Exploring Algebraic Identities', source: src('gm9a', 4, 'Exploring Algebraic Identities'),
  objectives: [{
    id: 'c9.alg.identities', title: 'Using and factorising with identities', prereqs: ['c9.poly.linear'],
    intro: [
      f('(a + b)² = a² + 2ab + b²,  (a − b)² = a² − 2ab + b²'),
      f('a² − b² = (a + b)(a − b)'),
      f('(a + b)³ = a³ + 3a²b + 3ab² + b³'),
      f('a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca)'),
      tip('If a + b + c = 0, then a³ + b³ + c³ = 3abc.'),
    ],
    examples: [
      ex('Factorise 9x² − 25.', ['= (3x)² − 5²', '= (3x + 5)(3x − 5)'], '(3x + 5)(3x − 5)'),
      ex('Find 103³ using an identity.', ['(100 + 3)³ = 1000000 + 90000 + 2700 + 27', '= 1092727'], '1092727'),
    ],
    practice: [
      tp('diffsq', (r) => {
        const a = r.int(11, 99), b = r.int(1, 10);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Use a² − b² = (a + b)(a − b) to evaluate ${a}² − ${a - b}².`, answer: num(a * a - (a - b) ** 2),
          hints: [`a + b = ${2 * a - b}, a − b = ${b}`], solution: [`(${a} + ${a - b})(${a} − ${a - b}) = ${2 * a - b} × ${b} = ${(2 * a - b) * b}`],
        };
      }),
      tp('abc', (r) => {
        const a = r.int(-9, 9) || 4, b = r.int(-9, 9) || -3;
        const c = -(a + b);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Without cubing, find ${a}³ + ${b < 0 ? `(${b})` : b}³ + ${c < 0 ? `(${c})` : c}³.`, answer: num(3 * a * b * c),
          hints: ['Check: what is a + b + c?', 'If a + b + c = 0 then a³ + b³ + c³ = 3abc.'],
          solution: [`${a} + ${b} + ${c} = 0`, `So the sum = 3 × ${a} × ${b} × ${c} = ${3 * a * b * c}`],
        };
      }, 2),
      tp('factor', (r) => {
        const p2 = r.int(1, 5), q = r.int(1, 9);
        const right = `(${p2 === 1 ? '' : p2}x + ${q})(${p2 === 1 ? '' : p2}x − ${q})`;
        return {
          type: 'mcq', prompt: `Factorise ${p2 * p2 === 1 ? '' : p2 * p2}x² − ${q * q}.`,
          ...choose(r, right, [`(${p2 === 1 ? '' : p2}x − ${q})²`, `(${p2 === 1 ? '' : p2}x + ${q})²`, `(${p2 * p2 === 1 ? '' : p2 * p2}x − ${q})(x + ${q})`]),
          hints: ['Is it a difference of two squares?', `${p2 * p2}x² = (${p2}x)², ${q * q} = ${q}²`], solution: [right],
        };
      }),
    ],
  }],
};

const circles: USpec = {
  id: 'c9.u.circles', subject: 'math', title: "I'm Up and Down, and Round and Round", source: src('gm9a', 5, "I'm Up and Down, and Round and Round"),
  note: 'Topic coverage (circles: chords, angles, circumference) inferred from the chapter title and secondary summaries — needs educator verification against the chapter content.',
  objectives: [{
    id: 'c9.circ.basics', title: 'Circles: circumference, chords and angles', prereqs: [],
    activities: ['art:trace'],
    intro: [
      p('A circle is the set of points at a fixed distance (radius) from a centre. A wheel turning once moves forward one circumference.'),
      f('Circumference C = 2πr = πd'),
      p('Equal chords are equidistant from the centre. The perpendicular from the centre to a chord bisects it. The angle a chord makes at the centre is double the angle at the circle.'),
    ],
    examples: [
      ex('A cycle wheel has radius 35 cm. Distance in one turn? (π = 22/7)', ['C = 2 × 22/7 × 35', '= 220 cm'], '220 cm'),
      ex('A chord of length 16 cm is 6 cm from the centre. Radius?', ['Half chord = 8', 'r² = 8² + 6² = 100', 'r = 10 cm'], '10 cm'),
    ],
    practice: [
      tp('circum', (r) => {
        const rad = r.pick([7, 14, 21, 28, 35, 42]), turns = r.pick([1, 10, 50, 100]);
        const C = 2 * PI * rad;
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: `A wheel of radius ${rad} cm makes ${turns} complete turn${turns > 1 ? 's' : ''}. How far does it travel? (π = 22/7)`,
          answer: approx(rd(C * turns, 2), 0.002, 'cm'),
          hints: ['One turn = one circumference = 2πr.', `Multiply by ${turns}.`],
          mistakes: [{ when: String(rd(PI * rad * rad * turns, 2)), explain: 'πr² is area. Distance rolled uses the circumference 2πr.' }],
          solution: [`C = 2 × 22/7 × ${rad} = ${rd(C, 2)} cm`, `Distance = ${rd(C * turns, 2)} cm`],
        };
      }),
      tp('chord', (r) => {
        const T: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
        const [d, h, rad] = r.pick(T);
        const ask = r.pick(['radius', 'chord'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm',
          prompt: ask === 'radius' ? `A chord of length ${2 * h} cm is at a distance ${d} cm from the centre. Find the radius.` : `In a circle of radius ${rad} cm, a chord is ${d} cm from the centre. Find the length of the chord.`,
          answer: num(ask === 'radius' ? rad : 2 * h, 'cm'),
          hints: ['The perpendicular from the centre bisects the chord.', 'Use Pythagoras with the half-chord.'],
          mistakes: [{ when: String(h), explain: ask === 'chord' ? 'That is half the chord — double it.' : 'Use the half-chord and the distance in Pythagoras.' }],
          solution: ask === 'radius' ? [`Half chord = ${h}`, `r = √(${h}² + ${d}²) = ${rad} cm`] : [`Half chord = √(${rad}² − ${d}²) = ${h}`, `Chord = ${2 * h} cm`],
        };
      }, 2),
      tp('angle', (r) => {
        const a = r.int(20, 85);
        const ask = r.next() < 0.5;
        return {
          type: 'typed', keypad: 'numeric', prompt: ask ? `An arc subtends ${2 * a}° at the centre. What angle does it subtend at a point on the remaining part of the circle?` : `An arc subtends ${a}° at a point on the circle. What angle does it subtend at the centre?`,
          answer: num(ask ? a : 2 * a, '°'),
          hints: ['Angle at the centre = 2 × angle at the circle.'], solution: [ask ? `${2 * a} ÷ 2 = ${a}°` : `2 × ${a} = ${2 * a}°`],
        };
      }),
    ],
  }],
};

const heron: USpec = {
  id: 'c9.u.area', subject: 'math', title: 'Measuring Space: Perimeter and Area', source: src('gm9a', 6, 'Measuring Space: Perimeter and Area'),
  objectives: [{
    id: 'c9.area.heron', title: 'Perimeter and area, including Heron\'s formula', prereqs: [],
    intro: [
      p('When you know all three sides of a triangle but not its height, use Heron\'s formula.'),
      f('s = (a + b + c)/2,  Area = √(s(s − a)(s − b)(s − c))'),
      tip('Always compute the semi-perimeter s first.'),
    ],
    examples: [
      ex('Triangle with sides 13, 14, 15 m. Area?', ['s = 21', '√(21 × 8 × 7 × 6) = √7056 = 84'], '84 m²'),
      ex('A rectangular park 40 m × 25 m. Fencing needed?', ['Perimeter = 2(40 + 25) = 130 m'], '130 m'),
    ],
    practice: [
      tp('heron', (r) => {
        const [a, b, c, A] = r.pick(HERON);
        const k = r.pick([1, 2, 3]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm²', prompt: `A triangular plot has sides ${a * k} m, ${b * k} m and ${c * k} m. Find its area using Heron's formula.`, answer: num(A * k * k, 'm^2'),
          steps: [{ prompt: 'Semi-perimeter s (m)', answer: num(((a + b + c) * k) / 2, 'm') }, { prompt: 'Area (m²)', answer: num(A * k * k, 'm^2') }],
          hints: ['s = (a + b + c) ÷ 2', 'Area = √(s(s − a)(s − b)(s − c))'],
          mistakes: [{ when: String((a + b + c) * k), explain: 'That is the perimeter. Use s = half the perimeter in Heron\'s formula.' }],
          solution: [`s = ${((a + b + c) * k) / 2}`, `Area = √(${((a + b + c) * k) / 2} × ${((b + c - a) * k) / 2} × ${((a + c - b) * k) / 2} × ${((a + b - c) * k) / 2}) = ${A * k * k} m²`],
        };
      }, 2),
      tp('fence', (r) => {
        const l = r.int(15, 60), w = r.int(10, 40), rate = r.pick([10, 15, 20, 25, 40]);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `A rectangular garden is ${l} m by ${w} m. Fencing costs ₹${rate} per metre. Find the total cost.`, answer: num(2 * (l + w) * rate, '₹'),
          hints: ['Fencing goes around the edge — use the perimeter.', 'Perimeter = 2(l + w)'],
          mistakes: [{ when: String(l * w * rate), explain: 'Fencing is along the boundary: use perimeter, not area.' }],
          solution: [`Perimeter = 2(${l} + ${w}) = ${2 * (l + w)} m`, `Cost = ${2 * (l + w)} × ${rate} = ₹${2 * (l + w) * rate}`],
        };
      }),
    ],
  }],
};

const probability: USpec = {
  id: 'c9.u.prob', subject: 'math', title: 'The Mathematics of Maybe: Introduction to Probability', source: src('gm9a', 7, 'The Mathematics of Maybe: Introduction to Probability'),
  objectives: [{
    id: 'c9.prob.experimental', title: 'Experimental and theoretical probability', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('Probability measures how likely an event is, from 0 (impossible) to 1 (certain).'),
      f('Experimental P(E) = number of times E happened ÷ total trials'),
      f('Theoretical P(E) = favourable outcomes ÷ equally likely outcomes'),
      tip('With more trials, experimental probability gets closer to the theoretical value.'),
    ],
    examples: [
      ex('A coin tossed 50 times shows 28 heads. Experimental P(head)?', ['28/50 = 14/25 = 0.56'], '0.56'),
      ex('A spinner has 8 equal parts, 3 red. P(red)?', ['3 favourable out of 8'], '3/8'),
    ],
    practice: [
      tp('exp', (r) => {
        const n = r.pick([20, 25, 40, 50, 80, 100]), k = r.int(1, n - 1);
        const ev = r.pick(['the bus arrived late', 'it rained', 'a six was rolled', 'the cricket team won the toss']);
        return {
          type: 'typed', keypad: 'fraction', prompt: `Out of ${n} observations, ${ev} ${k} times. What is the experimental probability that ${ev}? (fraction or decimal)`, answer: frac(k, n),
          hints: ['Divide the number of times it happened by the total.'], solution: [`P = ${k}/${n} = ${fr(k, n)}`],
        };
      }),
      tp('theory', (r) => {
        const parts = r.pick([4, 5, 6, 8, 10, 12]), col = r.int(1, parts - 1);
        const c = r.pick(['red', 'blue', 'yellow', 'green']);
        return {
          type: 'typed', keypad: 'fraction', prompt: `A spinner has ${parts} equal sections; ${col} are ${c}. What is the probability of landing on ${c}?`, answer: frac(col, parts),
          visual: { kind: 'fraction-circle', parts, shaded: col },
          hints: ['Count favourable sections.', 'Divide by the total sections.'],
          mistakes: [{ when: `${col}/${parts - col}`, explain: 'Divide by the total number of sections, not the other sections.' }],
          solution: [`P = ${col}/${parts}`],
        };
      }),
      tp('scale', (r) => {
        const evs: [string, string][] = [['The Sun rises in the east tomorrow', 'Certain'], ['Rolling a 7 on a normal die', 'Impossible'], ['A tossed coin shows heads', 'Even chance'], ['Picking a red ball from a bag of 9 red and 1 blue', 'Likely'], ['Picking the 1 blue ball from 9 red and 1 blue', 'Unlikely']];
        const set = r.shuffle(evs).slice(0, 4);
        return { type: 'match', prompt: `Match each event to how likely it is: ${set.map((s) => s[0]).join('; ')}.`, ...matching(r, set), hints: ['0 = impossible, ½ = even chance, 1 = certain.'], solution: set.map(([a, b]) => `${a}: ${b}`) };
      }),
    ],
  }],
};

const seqs: USpec = {
  id: 'c9.u.seq', subject: 'math', title: 'Predicting What Comes Next: Exploring Sequences and Progressions', source: src('gm9a', 8, 'Predicting What Comes Next: Exploring Sequences and Progressions'),
  objectives: [{
    id: 'c9.seq.ap-gp', title: 'Arithmetic and geometric patterns', prereqs: [],
    activities: ['game:patterns'],
    intro: [
      p('A sequence is an ordered list of numbers following a rule.'),
      p('Arithmetic progression: add the same number d each time (2, 5, 8, …). Geometric progression: multiply by the same number r each time (3, 6, 12, …).'),
      f('AP: aₙ = a + (n − 1)d;  GP: aₙ = a·rⁿ⁻¹'),
    ],
    examples: [
      ex('Next term of 7, 11, 15, 19, …?', ['d = 4', '19 + 4 = 23'], '23'),
      ex('8th term of 2, 6, 18, …?', ['r = 3', 'a₈ = 2 × 3⁷ = 4374'], '4374'),
    ],
    practice: [
      tp('next', (r) => {
        const geo = r.next() < 0.4;
        const a = r.int(1, 9), d = geo ? r.pick([2, 3]) : r.pick([-4, -3, 3, 4, 5, 6, 7, 11]);
        const t = Array.from({ length: 5 }, (_, i) => (geo ? a * d ** i : a + d * i));
        return {
          type: 'typed', keypad: 'numeric', prompt: `What comes next: ${t.slice(0, 4).join(', ')}, ?`, answer: num(t[4]),
          hints: ['Is it adding the same amount, or multiplying?', geo ? `Each term is ${d} times the last.` : `Each term increases by ${d}.`],
          solution: [geo ? `r = ${d}: ${t[3]} × ${d} = ${t[4]}` : `d = ${d}: ${t[3]} ${sgn(d)} = ${t[4]}`],
        };
      }),
      tp('nth', (r) => {
        const a = r.int(-5, 15), d = r.pick([2, 3, 4, 5, 6, -3]), n = r.int(10, 40);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the ${n}th term of ${a}, ${a + d}, ${a + 2 * d}, …`, answer: num(a + (n - 1) * d),
          hints: [`a = ${a}, d = ${d}`, 'aₙ = a + (n − 1)d'],
          mistakes: [{ when: String(a + n * d), explain: 'Use (n − 1)d.' }],
          solution: [`${a} + ${n - 1} × ${d} = ${a + (n - 1) * d}`],
        };
      }),
      tp('kind', (r) => {
        const opts: [number[], string][] = [[[3, 7, 11, 15], 'Arithmetic'], [[2, 6, 18, 54], 'Geometric'], [[1, 4, 9, 16], 'Neither'], [[5, 10, 20, 40], 'Geometric'], [[20, 17, 14, 11], 'Arithmetic'], [[1, 1, 2, 3, 5], 'Neither'], [[81, 27, 9, 3], 'Geometric']];
        const [s, k] = r.pick(opts);
        return { type: 'mcq', prompt: `What kind of sequence is ${s.join(', ')}, …?`, ...choose(r, k, ['Arithmetic', 'Geometric', 'Neither'].filter((x) => x !== k)), hints: ['Check differences, then ratios.'], solution: [`${k}.`] };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ MATHS PART 2
const props: USpec = {
  id: 'c9.u.props', subject: 'math', title: 'Propositions and their Converses', source: src('gm9b', 9, 'Propositions and their Converses'),
  objectives: [{
    id: 'c9.logic.converse', title: 'Statements, converses and counterexamples', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('A proposition is a statement that is either true or false. "If P, then Q" has converse "If Q, then P".'),
      p('A statement can be true while its converse is false. One counterexample is enough to show a statement is false.'),
      tip('"If a number is divisible by 4 then it is even" is true; its converse "if even, then divisible by 4" is false (6).'),
    ],
    examples: [
      ex('Converse of "If a quadrilateral is a square, its diagonals are equal"? True?', ['Converse: "If the diagonals are equal, it is a square."', 'A rectangle has equal diagonals but is not always a square'], 'Converse is false'),
      ex('Find a counterexample: "Every prime is odd".', ['2 is prime and even'], '2'),
    ],
    practice: [
      tp('truth', (r) => {
        const st: [string, boolean][] = [['If n is divisible by 6, then n is divisible by 3.', true], ['If n is divisible by 3, then n is divisible by 6.', false], ['If a triangle is equilateral, all its angles are 60°.', true], ['If x² = 9 then x = 3.', false], ['If a number ends in 0, it is divisible by 5.', true], ['If two angles are equal, they are vertically opposite.', false], ['If a shape is a rhombus, its diagonals bisect each other.', true], ['If p is prime, then p + 2 is prime.', false]];
        const [s, t] = r.pick(st);
        return { type: 'mcq', prompt: `True or false? ${s}`, ...choose(r, t ? 'True' : 'False', [t ? 'False' : 'True']), hints: ['Try to find a counterexample.'], solution: [t ? 'True — no counterexample exists.' : 'False — a counterexample exists.'] };
      }),
      tp('counter', (r) => {
        const cs: [string, number[], number[]][] = [
          ['Every odd number is prime.', [9, 15, 21, 25], [3, 5, 7, 11]],
          ['Every number divisible by 2 is divisible by 4.', [6, 10, 14, 18], [4, 8, 12, 16]],
          ['n² > n for every whole number n.', [0, 1], [2, 3, 5, 7]],
          ['Every multiple of 3 is odd.', [6, 12, 18, 24], [3, 9, 15, 21]],
        ];
        const [s, bad, good] = r.pick(cs);
        const c = r.pick(bad);
        return {
          type: 'mcq', prompt: `Which number is a counterexample to: "${s}"`, ...choose(r, String(c), r.shuffle(good).slice(0, 3).map(String)),
          hints: ['A counterexample makes the "if" part true but the "then" part false.'], solution: [`${c} breaks the statement.`],
        };
      }),
    ],
  }],
};

const data: USpec = {
  id: 'c9.u.data', subject: 'math', title: 'How Quantities Combine: Understanding Data', source: src('gm9b', 10, 'How Quantities Combine: Understanding Data'),
  objectives: [{
    id: 'c9.data.central', title: 'Mean, median, mode and weighted mean', prereqs: [],
    intro: [
      p('Mean, median and mode summarise data with one number. The mean is sensitive to extreme values; the median is not.'),
      f('Weighted mean = Σ(wᵢxᵢ) ÷ Σwᵢ'),
      p('Example: combining two class averages needs weights (number of students), not a simple average of averages.'),
    ],
    examples: [
      ex('Class A (30 students) averages 60; class B (20 students) averages 70. Combined mean?', ['(30 × 60 + 20 × 70) ÷ 50', '= 3200 ÷ 50 = 64'], '64'),
      ex('Mode of 3, 5, 5, 7, 8, 5, 3?', ['5 appears most often'], '5'),
    ],
    practice: [
      tp('weighted', (r) => {
        const n1 = r.pick([20, 25, 30, 40]), n2 = r.pick([10, 15, 20, 35]), m1 = r.int(50, 80), m2 = r.int(50, 90);
        const M = (n1 * m1 + n2 * m2) / (n1 + n2);
        return {
          type: 'typed', keypad: 'numeric', prompt: `Section A has ${n1} students with mean mark ${m1}; section B has ${n2} students with mean mark ${m2}. Find the mean of all students (2 d.p.).`, answer: approx(rd(M, 2), 0.002),
          hints: ['Total marks = students × mean, for each section.', 'Divide total marks by total students.'],
          mistakes: [{ when: String((m1 + m2) / 2), explain: 'Averaging the averages ignores that sections have different sizes. Use a weighted mean.' }],
          solution: [`(${n1}×${m1} + ${n2}×${m2}) ÷ ${n1 + n2} = ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} ≈ ${rd(M, 2)}`],
        };
      }, 2),
      tp('bars', (r) => {
        const labels = ['Idli', 'Dosa', 'Poha', 'Upma', 'Paratha'];
        const vals = labels.map(() => r.int(2, 20));
        const mx = Math.max(...vals);
        if (vals.filter((v) => v === mx).length > 1) vals[vals.indexOf(mx)] += 1;
        const top = labels[vals.indexOf(Math.max(...vals))];
        return {
          type: 'graph', prompt: `A survey in ${r.pick(CITIES)} asked students their favourite breakfast. Which is the mode?`, visual: { kind: 'bar-graph', labels, values: vals, unit: 'students' },
          ...choose(r, top, labels.filter((l) => l !== top)), hints: ['The mode is the most frequent value — the tallest bar.'], solution: [`${top} has the tallest bar.`],
        };
      }),
      tp('median', (r) => {
        const n = r.pick([6, 8]);
        const v = Array.from({ length: n }, () => r.int(10, 60));
        const s = [...v].sort((a, b) => a - b);
        const med = (s[n / 2 - 1] + s[n / 2]) / 2;
        return {
          type: 'typed', keypad: 'numeric', prompt: `Find the median of ${v.join(', ')}.`, answer: num(med),
          hints: ['Sort the values.', 'With an even count, average the two middle values.'], solution: [`Sorted: ${s.join(', ')}`, `(${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${med}`],
        };
      }),
    ],
  }],
};

const algos: USpec = {
  id: 'c9.u.algos', subject: 'math', title: 'The World of Algorithms', source: src('gm9b', 11, 'The World of Algorithms'),
  objectives: [{
    id: 'c9.algo.steps', title: 'Following and ordering algorithms (Euclid\'s HCF, sorting)', prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('An algorithm is a finite list of exact steps that solves a problem. Recipes and long division are algorithms.'),
      stepsB('Euclid\'s algorithm for HCF(a, b), a > b:', 'Divide a by b; let r be the remainder.', 'If r = 0, the HCF is b.', 'Otherwise replace (a, b) by (b, r) and repeat.'),
      tip('Good algorithms always stop and always give the right answer.'),
    ],
    examples: [
      ex('HCF(84, 36) by Euclid.', ['84 = 2 × 36 + 12', '36 = 3 × 12 + 0', 'HCF = 12'], '12'),
      ex('How many comparisons to find the largest of 5 numbers by scanning?', ['Compare with the current largest, 4 times'], '4'),
    ],
    practice: [
      tp('euclid', (r) => {
        const g = r.int(2, 15), m = r.int(3, 20), n = r.int(2, 19);
        if (gcd(m, n) !== 1 || m === n) return { type: 'typed', keypad: 'numeric', prompt: `Use Euclid's algorithm to find HCF(${g * 7 * 3}, ${g * 7 * 2}).`, answer: num(g * 7), hints: ['Divide the larger by the smaller.'], solution: [`HCF = ${g * 7}`] };
        const a = g * Math.max(m, n), b = g * Math.min(m, n);
        const st: string[] = [];
        let x = a, y = b;
        while (y) { st.push(`${x} = ${Math.floor(x / y)} × ${y} + ${x % y}`); [x, y] = [y, x % y]; }
        return {
          type: 'typed', keypad: 'numeric', prompt: `Use Euclid's algorithm to find HCF(${a}, ${b}).`, answer: num(g),
          hints: ['Divide the larger number by the smaller and keep the remainder.', 'Repeat with the divisor and remainder until the remainder is 0.'],
          solution: [...st, `HCF = ${g}`],
        };
      }, 2),
      tp('order', (r) => {
        const algs: [string, string[]][] = [
          ['making a cup of tea', ['Boil water', 'Add tea leaves', 'Add milk and sugar', 'Strain into a cup']],
          ['Euclid\'s algorithm', ['Divide the larger number by the smaller', 'Note the remainder', 'Replace the pair by (divisor, remainder)', 'Stop when the remainder is 0; the divisor is the HCF']],
          ['finding the largest number in a list', ['Take the first number as the current largest', 'Compare it with the next number', 'If the next is bigger, make it the current largest', 'Repeat until the list ends']],
        ];
        const [nm, s] = r.pick(algs);
        return { type: 'order', prompt: `Arrange the steps of the algorithm for ${nm}.`, ...ordering(r, s), hints: ['What must happen first?'], solution: s };
      }),
      tp('trace', (r) => {
        const start = r.int(3, 30);
        let x = start, k = 0;
        while (x !== 1 && k < 200) { x = x % 2 ? 3 * x + 1 : x / 2; k++; }
        return {
          type: 'typed', keypad: 'numeric', prompt: `Algorithm: start at ${start}. If the number is even, halve it; if odd, multiply by 3 and add 1. How many steps to reach 1?`, answer: num(k),
          hints: ['Write each number as you go.', 'Count the steps, not the numbers.'], solution: [`It takes ${k} steps.`],
        };
      }, 3),
    ],
  }],
};

const quads: USpec = {
  id: 'c9.u.quads', subject: 'math', title: 'Quadrilaterals', source: src('gm9b', 12, 'Quadrilaterals'),
  objectives: [{
    id: 'c9.quad.para', title: 'Parallelogram properties and the mid-point theorem', prereqs: [],
    intro: [
      p('In a parallelogram, opposite sides and opposite angles are equal and the diagonals bisect each other.'),
      p('Mid-point theorem: the segment joining the mid-points of two sides of a triangle is parallel to the third side and half its length.'),
      tip('Joining the mid-points of any quadrilateral always makes a parallelogram (Varignon).'),
    ],
    examples: [
      ex('In △ABC, D and E are mid-points of AB and AC, BC = 14 cm. DE?', ['DE = ½ BC'], '7 cm'),
      ex('Diagonals of a parallelogram are 10 cm and 16 cm. Half-lengths?', ['They bisect each other', '5 cm and 8 cm'], '5 cm and 8 cm'),
    ],
    practice: [
      tp('mid', (r) => {
        const bc = r.int(4, 30) * 2;
        const ask = r.next() < 0.5;
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', prompt: ask ? `In △PQR, M and N are the mid-points of PQ and PR. QR = ${bc} cm. Find MN.` : `In △PQR, M and N are the mid-points of PQ and PR, and MN = ${bc / 2} cm. Find QR.`,
          answer: num(ask ? bc / 2 : bc, 'cm'),
          hints: ['Mid-point theorem: MN = ½ QR.'], solution: [ask ? `MN = ${bc} ÷ 2 = ${bc / 2} cm` : `QR = 2 × ${bc / 2} = ${bc} cm`],
        };
      }),
      tp('angles', (r) => {
        const x = r.int(5, 25);
        const a = 3 * x + 10, b = 180 - a;
        return {
          type: 'typed', keypad: 'numeric', prompt: `In parallelogram ABCD, ∠A = (3x + 10)° and ∠B = ${b}°. Find x.`, answer: num(x),
          steps: [{ prompt: '∠A in degrees', answer: num(a) }, { prompt: 'x', answer: num(x) }],
          hints: ['Adjacent angles of a parallelogram add to 180°.', `∠A = 180 − ${b}`], solution: [`∠A = ${a}°`, `3x + 10 = ${a} → x = ${x}`],
        };
      }, 2),
      tp('tap', (r) => {
        const all = [
          { label: 'Opposite sides are equal', ok: true }, { label: 'Diagonals bisect each other', ok: true }, { label: 'Opposite angles are equal', ok: true }, { label: 'Adjacent angles add to 180°', ok: true },
          { label: 'Diagonals are always equal', ok: false }, { label: 'All angles are 90°', ok: false }, { label: 'Diagonals always meet at 90°', ok: false }, { label: 'All sides are equal', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[4];
        return { type: 'tap', prompt: 'Tap every property that is true for EVERY parallelogram.', ...tapAll(r, pick), hints: ['Rectangles and rhombuses are special parallelograms — what is true for all?'], solution: [pick.filter((x) => x.ok).map((x) => x.label).join('; ')] };
      }),
    ],
  }],
};

const twovar: USpec = {
  id: 'c9.u.twovar', subject: 'math', title: 'Two Variables, One Line', source: src('gm9b', 13, 'Two Variables, One Line'),
  objectives: [{
    id: 'c9.lin.twovar', title: 'Linear equations in two variables and their graphs', prereqs: ['c9.poly.linear'],
    activities: ['game:numberline'],
    intro: [
      p('An equation like 2x + 3y = 12 has infinitely many solutions (x, y). Plotted, they form a straight line.'),
      p('To draw it, find two or three solutions — e.g. put x = 0, then y = 0.'),
      vis({ kind: 'line-graph', xLabel: 'x', yLabel: 'y', points: [[0, 4], [3, 2], [6, 0]] }, 'The line 2x + 3y = 12'),
    ],
    examples: [
      ex('Is (3, 2) a solution of 2x + 3y = 12?', ['2(3) + 3(2) = 12 ✓'], 'Yes'),
      ex('Auto fare: ₹30 fixed + ₹15 per km. Equation?', ['y = 15x + 30'], 'y = 15x + 30'),
    ],
    practice: [
      tp('findy', (r) => {
        const a = r.int(1, 6), b = r.pick([1, 2, 3, 4, 5]), x = r.int(-4, 6), y = r.int(-4, 6);
        const c = a * x + b * y;
        return {
          type: 'typed', keypad: 'numeric', prompt: `For ${a}x + ${b}y = ${c}, find y when x = ${x}.`, answer: num(y),
          hints: [`Put x = ${x}: ${a * x} + ${b}y = ${c}.`, `${b}y = ${c - a * x}`], solution: [`${b}y = ${c - a * x}`, `y = ${y}`],
        };
      }),
      tp('fare', (r) => {
        const fixed = r.pick([20, 25, 30, 40]), per = r.pick([10, 12, 15, 18]), km = r.int(2, 15);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: `An auto in ${r.pick(CITIES)} charges ₹${fixed} plus ₹${per} per km (y = ${per}x + ${fixed}). What is the fare for ${km} km?`, answer: num(per * km + fixed, '₹'),
          hints: [`Substitute x = ${km}.`], mistakes: [{ when: String(per * km), explain: `Don't forget the fixed charge of ₹${fixed}.` }], solution: [`y = ${per} × ${km} + ${fixed} = ₹${per * km + fixed}`],
        };
      }),
      tp('check', (r) => {
        const a = r.int(1, 5), b = r.int(1, 5), x = r.int(0, 5), y = r.int(0, 5);
        const c = a * x + b * y;
        const pts = [[x, y], [x + 1, y], [x, y + 1], [x + b, y - a]].map(([p1, p2]) => `(${p1}, ${p2})`);
        const good = [pts[0], pts[3]];
        const cand = r.shuffle(pts);
        return {
          type: 'tap', prompt: `Tap every point that lies on the line ${a}x + ${b}y = ${c}.`, ...tapAll(r, cand.map((pt) => ({ label: pt, ok: good.includes(pt) }))),
          hints: ['Substitute each point and check if the equation is true.'], solution: [`${good.join(' and ')} satisfy ${a}x + ${b}y = ${c}.`],
        };
      }),
    ],
  }],
};

const solids: USpec = {
  id: 'c9.u.solids', subject: 'math', title: 'Math of Space: Surface Area and Volume', source: src('gm9b', 14, 'Math of Space: Surface Area and Volume'),
  objectives: [{
    id: 'c9.solid.sa-vol', title: 'Surface area and volume of cuboids, cylinders, cones and spheres', prereqs: ['c9.area.heron'],
    intro: [
      f('Cuboid: V = lbh, TSA = 2(lb + bh + hl)'),
      f('Cylinder: V = πr²h, CSA = 2πrh'),
      f('Cone: V = ⅓πr²h, CSA = πrl;  Sphere: V = ⁴⁄₃πr³, SA = 4πr²'),
      tip('1 litre = 1000 cm³.'),
    ],
    examples: [
      ex('A water tank 2 m × 1.5 m × 1 m. Capacity in litres?', ['V = 3 m³', '1 m³ = 1000 L', '3000 L'], '3000 L'),
      ex('Surface area of a ball of radius 7 cm?', ['4 × 22/7 × 49 = 616'], '616 cm²'),
    ],
    practice: [
      tp('cuboid', (r) => {
        const l = r.int(2, 15), b = r.int(2, 12), h = r.int(2, 10);
        const ask = r.pick(['V', 'TSA'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: ask === 'V' ? 'cm³' : 'cm²', prompt: `A box is ${l} cm × ${b} cm × ${h} cm. Find its ${ask === 'V' ? 'volume' : 'total surface area'}.`,
          answer: num(ask === 'V' ? l * b * h : 2 * (l * b + b * h + h * l), ask === 'V' ? 'cm^3' : 'cm^2'),
          hints: [ask === 'V' ? 'V = l × b × h' : 'TSA = 2(lb + bh + hl)'],
          mistakes: [{ when: 'wrong-unit', explain: ask === 'V' ? 'Volume is in cubic units (cm³).' : 'Area is in square units (cm²).' }],
          solution: [ask === 'V' ? `${l} × ${b} × ${h} = ${l * b * h} cm³` : `2(${l * b} + ${b * h} + ${h * l}) = ${2 * (l * b + b * h + h * l)} cm²`],
        };
      }),
      tp('round', (r) => {
        const rad = r.pick([7, 14, 21, 3.5]);
        const shape = r.pick(['sphere-sa', 'sphere-v', 'cyl-csa'] as const);
        const h = r.pick([10, 12, 20]);
        const v = shape === 'sphere-sa' ? 4 * PI * rad * rad : shape === 'sphere-v' ? (4 / 3) * PI * rad ** 3 : 2 * PI * rad * h;
        const unit = shape === 'sphere-v' ? 'cm^3' : 'cm^2';
        return {
          type: 'typed', keypad: 'units', unitHint: shape === 'sphere-v' ? 'cm³' : 'cm²',
          prompt: shape === 'sphere-sa' ? `Find the surface area of a sphere of radius ${rad} cm. (π = 22/7)` : shape === 'sphere-v' ? `Find the volume of a sphere of radius ${rad} cm to 2 d.p. (π = 22/7)` : `Find the curved surface area of a cylinder of radius ${rad} cm and height ${h} cm. (π = 22/7)`,
          answer: approx(rd(v, 2), 0.003, unit),
          hints: [shape === 'sphere-sa' ? 'SA = 4πr²' : shape === 'sphere-v' ? 'V = ⁴⁄₃πr³' : 'CSA = 2πrh'],
          solution: [`= ${rd(v, 2)} ${shape === 'sphere-v' ? 'cm³' : 'cm²'}`],
        };
      }, 2),
      tp('litres', (r) => {
        const l = r.pick([1, 2, 3]), b = r.pick([1, 1.5, 2]), h = r.pick([0.5, 1, 2]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'L', prompt: `A tank measures ${l} m × ${b} m × ${h} m. How many litres can it hold?`, answer: num(l * b * h * 1000, 'L'),
          hints: ['Find the volume in m³.', '1 m³ = 1000 litres.'], mistakes: [{ when: String(l * b * h), explain: 'That is in m³ — multiply by 1000 for litres.' }], solution: [`V = ${l * b * h} m³ = ${l * b * h * 1000} L`],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICS (Exploration)
const motion: USpec = {
  id: 'c9.u.motion', subject: 'physics', title: 'Describing Motion Around Us', source: src('ex9', 4, 'Describing Motion Around Us'),
  objectives: [
    {
      id: 'c9.phy.speed', title: 'Distance, displacement, speed and velocity', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        p('Distance is the total path length; displacement is the straight-line change in position with direction.'),
        f('Average speed = total distance ÷ total time'),
        p('Velocity is speed in a given direction. Units: m/s or km/h (1 m/s = 3.6 km/h).'),
        act('lab:motion?u=10&a=0&t=5', 'Motion Lab: a car at a steady 10 m/s for 5 s'),
      ],
      examples: [
        ex('A bus covers 120 km in 2.5 h. Average speed?', ['120 ÷ 2.5 = 48 km/h'], '48 km/h'),
        ex('Convert 72 km/h to m/s.', ['72 × 1000 ÷ 3600', '= 20 m/s'], '20 m/s'),
      ],
      practice: [
        tp('avg', (r) => {
          const v = r.pick([30, 40, 45, 48, 60, 72, 80]), t = r.pick([1.5, 2, 2.5, 3, 4]);
          const c1 = r.pick(CITIES), c2 = r.pick(CITIES.filter((c) => c !== c1));
          return {
            type: 'typed', keypad: 'units', unitHint: 'km/h', prompt: `A bus travels ${v * t} km from near ${c1} towards ${c2} in ${t} hours. Find its average speed.`, answer: num(v, 'km/h', true),
            hints: ['Speed = distance ÷ time', 'Give a unit like km/h.'],
            mistakes: [{ when: 'missing-unit', explain: 'Speed needs a unit (km/h or m/s).' }, { when: 'wrong-unit', explain: 'Speed is distance per time, e.g. km/h — not km or h.' }],
            solution: [`${v * t} ÷ ${t} = ${v} km/h`],
          };
        }),
        tp('convert', (r) => {
          const ms = r.pick([5, 10, 15, 20, 25, 30]);
          const toMs = r.next() < 0.5;
          return {
            type: 'typed', keypad: 'units', unitHint: toMs ? 'm/s' : 'km/h', prompt: toMs ? `Convert ${ms * 3.6} km/h to m/s.` : `Convert ${ms} m/s to km/h.`,
            answer: num(toMs ? ms : rd(ms * 3.6, 2), toMs ? 'm/s' : 'km/h', true),
            hints: ['1 m/s = 3.6 km/h', toMs ? 'Divide by 3.6.' : 'Multiply by 3.6.'],
            mistakes: [{ when: 'missing-unit', explain: 'Include the unit you converted to.' }],
            solution: [toMs ? `${ms * 3.6} ÷ 3.6 = ${ms} m/s` : `${ms} × 3.6 = ${rd(ms * 3.6, 2)} km/h`],
          };
        }),
      ],
    },
    {
      id: 'c9.phy.kinematics', title: 'Uniform acceleration: v = u + at and s = ut + ½at²', prereqs: ['c9.phy.speed'],
      activities: ['lab:motion'],
      intro: [
        f('a = (v − u)/t'),
        f('v = u + at,  s = ut + ½at²,  v² = u² + 2as'),
        p('On a velocity–time graph the slope is the acceleration and the area under the graph is the displacement.'),
        act('lab:motion?u=0&a=2&t=5', 'Motion Lab: start from rest with a = 2 m/s² for 5 s — check v = 10 m/s and s = 25 m'),
      ],
      examples: [
        ex('A scooter starts from rest and reaches 12 m/s in 4 s. Acceleration?', ['a = (12 − 0)/4', '= 3 m/s²'], '3 m/s²'),
        ex('u = 5 m/s, a = 2 m/s², t = 3 s. Distance?', ['s = 5×3 + ½×2×9', '= 15 + 9 = 24 m'], '24 m'),
      ],
      practice: [
        tp('v', (r) => {
          const u = r.int(0, 15), a = r.pick([1, 2, 3, 4, 0.5, 1.5]), t = r.int(2, 10);
          const v = rd(u + a * t, 2);
          return {
            type: 'typed', keypad: 'units', unitHint: 'm/s', prompt: `A car moving at ${u} m/s accelerates uniformly at ${a} m/s² for ${t} s. Find its final velocity.`, answer: num(v, 'm/s', true),
            hints: ['v = u + at', `at = ${a} × ${t}`],
            mistakes: [{ when: 'missing-unit', explain: 'Velocity needs a unit: m/s.' }, { when: 'wrong-unit', explain: 'Velocity is in m/s (or km/h).' }, { when: String(rd(a * t, 2)), explain: `Add the starting velocity u = ${u} m/s.` }],
            solution: [`v = ${u} + ${a} × ${t} = ${v} m/s`, `Try it: Motion Lab with u=${u}, a=${a}, t=${t}.`],
          };
        }),
        tp('s', (r) => {
          const u = r.int(0, 10), a = r.pick([2, 4, 6, 1]), t = r.int(2, 8);
          const s = u * t + 0.5 * a * t * t;
          return {
            type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A cart starts at ${u} m/s and accelerates at ${a} m/s² for ${t} s. How far does it travel?`, answer: num(s, 'm', true),
            steps: [{ prompt: 'ut (m)', answer: num(u * t, 'm') }, { prompt: '½at² (m)', answer: num(0.5 * a * t * t, 'm') }, { prompt: 'Total s (m)', answer: num(s, 'm') }],
            hints: ['s = ut + ½at²', 'Square t before multiplying.'],
            mistakes: [{ when: 'missing-unit', explain: 'Distance needs a unit: m.' }, { when: String(u * t + 0.5 * a * t), explain: 'In ½at², t is squared.' }],
            solution: [`s = ${u}×${t} + ½×${a}×${t}² = ${u * t} + ${0.5 * a * t * t} = ${s} m`],
          };
        }, 2),
        tp('graph', (r) => {
          const u = r.int(0, 6), a = r.pick([1, 2, 3]);
          const pts: [number, number][] = [0, 1, 2, 3, 4, 5].map((t) => [t, u + a * t]);
          return {
            type: 'graph', keypad: 'units', unitHint: 'm/s²', visual: { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'velocity (m/s)', points: pts },
            prompt: `The velocity–time graph of a bicycle (starting at ${u} m/s) is shown. Find its acceleration.`, answer: num(a, 'm/s^2'),
            hints: ['Acceleration = slope = change in v ÷ change in t.', `From t = 0 to t = 5, v changes from ${u} to ${u + 5 * a}.`],
            solution: [`a = (${u + 5 * a} − ${u}) ÷ 5 = ${a} m/s²`],
          };
        }),
      ],
    },
  ],
};

const forceMotion: USpec = {
  id: 'c9.u.forces', subject: 'physics', title: 'How Forces Affect Motion', source: src('ex9', 6, 'How Forces Affect Motion'),
  objectives: [{
    id: 'c9.phy.newton', title: 'Newton\'s second law F = ma and momentum', prereqs: ['c9.phy.kinematics'],
    activities: ['lab:forces'],
    intro: [
      p('First law: an object stays at rest or moves uniformly unless an unbalanced force acts (inertia).'),
      f('F = m × a   (1 N = 1 kg·m/s²)'),
      f('Momentum p = m × v (kg·m/s)'),
      p('Third law: forces come in equal and opposite pairs.'),
      act('lab:forces?mass=4&force=12&friction=0', 'Forces Lab: 12 N on 4 kg with no friction — expect a = 3 m/s²'),
    ],
    examples: [
      ex('A 1200 kg car accelerates at 2 m/s². Net force?', ['F = 1200 × 2', '= 2400 N'], '2400 N'),
      ex('A 0.15 kg cricket ball moves at 30 m/s. Momentum?', ['p = 0.15 × 30', '= 4.5 kg·m/s'], '4.5 kg·m/s'),
    ],
    practice: [
      tp('fma', (r) => {
        const m = r.pick([2, 4, 5, 10, 20, 50]), a = r.pick([1, 2, 3, 4, 5]);
        const ask = r.pick(['F', 'a'] as const);
        return ask === 'F' ? {
          type: 'typed', keypad: 'units', unitHint: 'N', prompt: `What net force gives a ${m} kg trolley an acceleration of ${a} m/s²?`, answer: num(m * a, 'N', true),
          hints: ['F = ma', 'Unit: newton (N).'],
          mistakes: [{ when: 'missing-unit', explain: 'Force needs a unit: N.' }, { when: 'wrong-unit', explain: 'Force is in newtons (N), not kg.' }],
          solution: [`F = ${m} × ${a} = ${m * a} N`, `Check in the Forces Lab: mass=${m}, force=${m * a}, friction=0.`],
        } : {
          type: 'typed', keypad: 'units', unitHint: 'm/s²', prompt: `A net force of ${m * a} N acts on a ${m} kg box on a frictionless floor. Find its acceleration.`, answer: num(a, 'm/s^2', true),
          hints: ['a = F ÷ m'],
          mistakes: [{ when: 'missing-unit', explain: 'Acceleration needs a unit: m/s².' }, { when: String(m * a * m), explain: 'Divide the force by the mass.' }],
          solution: [`a = ${m * a} ÷ ${m} = ${a} m/s²`, `Verify: Forces Lab mass=${m}, force=${m * a}, friction=0.`],
        };
      }, 2),
      tp('momentum', (r) => {
        const [what, m] = r.pick([['cricket ball', 0.15], ['football', 0.4], ['bicycle with rider', 80], ['auto-rickshaw', 400], ['hockey ball', 0.16]] as [string, number][]);
        const v = r.pick([2, 5, 10, 15, 20, 25]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'kg m/s', prompt: `Find the momentum of a ${what} of mass ${m} kg moving at ${v} m/s.`, answer: approx(m * v, 0.001, 'kg m/s', true),
          hints: ['p = m × v', 'Unit: kg m/s'], mistakes: [{ when: 'missing-unit', explain: 'Momentum unit: kg m/s.' }], solution: [`p = ${m} × ${v} = ${rd(m * v, 2)} kg m/s`],
        };
      }),
      tp('laws', (r) => {
        const set: [string, string][] = r.shuffle([['Passengers lurch forward when a bus brakes', 'First law (inertia)'], ['A heavier cart needs more force for the same acceleration', 'Second law (F = ma)'], ['A gun recoils when fired', 'Third law (action–reaction)'], ['Dust flies off a carpet when it is beaten', 'First law (inertia)'], ['A rocket rises as gases rush down', 'Third law (action–reaction)']] as [string, string][]);
        const q = set[0];
        return { type: 'mcq', prompt: `Which law explains: "${q[0]}"?`, ...choose(r, q[1], ['First law (inertia)', 'Second law (F = ma)', 'Third law (action–reaction)'].filter((x) => x !== q[1])), hints: ['Inertia = resisting change; pairs of forces = third law.'], solution: [q[1]] };
      }),
    ],
  }],
};

const work: USpec = {
  id: 'c9.u.work', subject: 'physics', title: 'Work, Energy, and Simple Machines', source: src('ex9', 7, 'Work, Energy, and Simple Machines'),
  objectives: [{
    id: 'c9.phy.energy', title: 'Work, kinetic and potential energy, power, mechanical advantage', prereqs: ['c9.phy.newton'],
    activities: ['lab:forces', 'game:balance'],
    intro: [
      f('Work W = F × s (joule, J)'),
      f('KE = ½mv²,  PE = mgh  (g ≈ 10 m/s²)'),
      f('Power P = W ÷ t (watt, W);  Mechanical advantage MA = load ÷ effort'),
      p('Energy is conserved: a falling mango loses PE and gains the same KE (ignoring air resistance).'),
    ],
    examples: [
      ex('A 20 N force pushes a box 5 m. Work done?', ['W = 20 × 5 = 100 J'], '100 J'),
      ex('A lever lifts a 600 N load with 150 N effort. MA?', ['MA = 600 ÷ 150 = 4'], '4'),
    ],
    practice: [
      tp('ke-pe', (r) => {
        const kind = r.pick(['KE', 'PE', 'W'] as const);
        const m = r.pick([2, 5, 10, 20, 40]), v = r.pick([2, 3, 4, 5, 10]), h = r.pick([2, 3, 5, 10, 15]), F = r.pick([10, 25, 50, 100]), s = r.pick([2, 4, 5, 10]);
        const val = kind === 'KE' ? 0.5 * m * v * v : kind === 'PE' ? m * 10 * h : F * s;
        const prompt = kind === 'KE' ? `Find the kinetic energy of a ${m} kg object moving at ${v} m/s.` : kind === 'PE' ? `Find the potential energy gained when a ${m} kg bag is lifted ${h} m (g = 10 m/s²).` : `A force of ${F} N moves a trolley ${s} m in its direction. Find the work done.`;
        return {
          type: 'typed', keypad: 'units', unitHint: 'J', prompt, answer: num(val, 'J', true),
          hints: [kind === 'KE' ? 'KE = ½mv²' : kind === 'PE' ? 'PE = mgh' : 'W = F × s', 'Energy and work are in joules (J).'],
          mistakes: [{ when: 'missing-unit', explain: 'Energy needs a unit: J.' }, { when: 'wrong-unit', explain: 'Work and energy are in joules (J).' }, ...(kind === 'KE' ? [{ when: String(0.5 * m * v), explain: 'Square the speed in ½mv².' }] : [])],
          solution: [kind === 'KE' ? `½ × ${m} × ${v}² = ${val} J` : kind === 'PE' ? `${m} × 10 × ${h} = ${val} J` : `${F} × ${s} = ${val} J`],
        };
      }, 2),
      tp('power', (r) => {
        const W = r.pick([600, 1200, 1500, 3000, 6000]), t = r.pick([5, 10, 20, 30, 60]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'W', prompt: `A motor does ${W} J of work in ${t} s while lifting water to a tank. Find its power.`, answer: num(W / t, 'W', true),
          hints: ['P = W ÷ t'], mistakes: [{ when: 'missing-unit', explain: 'Power is in watts (W).' }], solution: [`P = ${W} ÷ ${t} = ${W / t} W`],
        };
      }),
      tp('ma', (r) => {
        const effort = r.pick([50, 100, 150, 200]), ma = r.pick([2, 3, 4, 5]);
        const mach = r.pick(['lever', 'pulley system', 'ramp', 'car jack']);
        return {
          type: 'typed', keypad: 'numeric', prompt: `A ${mach} lifts a ${effort * ma} N load with an effort of ${effort} N. What is its mechanical advantage?`, answer: num(ma),
          hints: ['MA = load ÷ effort', 'MA has no unit.'], mistakes: [{ when: String(rd(effort / (effort * ma), 2)), explain: 'Load goes on top: MA = load ÷ effort.' }], solution: [`MA = ${effort * ma} ÷ ${effort} = ${ma}`],
        };
      }),
    ],
  }],
};

const sound: USpec = {
  id: 'c9.u.sound', subject: 'physics', title: 'Sound Waves: Characteristics and Applications', source: src('ex9', 10, 'Sound Waves: Characteristics and Applications'),
  objectives: [{
    id: 'c9.phy.sound', title: 'Wave speed, frequency, wavelength and echoes', prereqs: [],
    intro: [
      p('Sound is a longitudinal wave of compressions and rarefactions. It needs a medium and cannot travel through vacuum.'),
      f('v = f × λ  (speed = frequency × wavelength)'),
      p('Pitch depends on frequency (Hz); loudness on amplitude. Humans hear about 20 Hz to 20 000 Hz.'),
      f('Echo: distance to wall = (speed × time) ÷ 2'),
    ],
    examples: [
      ex('A 500 Hz sound has wavelength 0.68 m. Speed?', ['v = 500 × 0.68 = 340 m/s'], '340 m/s'),
      ex('An echo returns after 2 s; v = 340 m/s. Distance to the cliff?', ['Total path = 680 m', 'One way = 340 m'], '340 m'),
    ],
    practice: [
      tp('wave', (r) => {
        const fq = r.pick([100, 200, 250, 340, 500, 680, 1000]), lam = r.pick([0.34, 0.5, 1, 1.7, 0.68, 2]);
        const v = rd(fq * lam, 3);
        const ask = r.pick(['v', 'lambda'] as const);
        return ask === 'v' ? {
          type: 'typed', keypad: 'units', unitHint: 'm/s', prompt: `A sound wave has frequency ${fq} Hz and wavelength ${lam} m. Find its speed.`, answer: approx(v, 0.002, 'm/s', true),
          hints: ['v = f × λ'], mistakes: [{ when: 'missing-unit', explain: 'Speed needs a unit: m/s.' }], solution: [`v = ${fq} × ${lam} = ${v} m/s`],
        } : {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `Sound travels at ${v} m/s. Find the wavelength of a ${fq} Hz note.`, answer: approx(lam, 0.002, 'm', true),
          hints: ['λ = v ÷ f'], mistakes: [{ when: 'missing-unit', explain: 'Wavelength is a length: give it in m.' }, { when: 'wrong-unit', explain: 'Wavelength is a length (m), not a frequency.' }], solution: [`λ = ${v} ÷ ${fq} = ${lam} m`],
        };
      }, 2),
      tp('echo', (r) => {
        const v = r.pick([330, 340, 344]), t = r.pick([0.5, 1, 1.5, 2, 3, 4]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'm', prompt: `A student claps near a hill and hears the echo after ${t} s. Speed of sound = ${v} m/s. How far is the hill?`, answer: approx(rd((v * t) / 2, 2), 0.002, 'm', true),
          hints: ['The sound goes there AND back.', 'Distance = v × t ÷ 2'],
          mistakes: [{ when: String(v * t), explain: 'That is the there-and-back distance. Halve it.' }, { when: 'missing-unit', explain: 'Give the distance with a unit (m).' }],
          solution: [`Total path = ${v} × ${t} = ${v * t} m`, `Distance = ${(v * t) / 2} m`],
        };
      }),
      tp('facts', (r) => {
        const qs: [string, string, string[]][] = [
          ['Through which can sound NOT travel?', 'Vacuum', ['Water', 'Steel', 'Air']],
          ['A higher frequency sound has a…', 'higher pitch', ['louder volume', 'lower pitch', 'slower speed']],
          ['Bats find their way using…', 'ultrasound echoes', ['infrared light', 'magnetism', 'infrasound from the ground']],
          ['Sound usually travels fastest in…', 'solids', ['gases', 'vacuum', 'liquids']],
          ['Sounds above 20 000 Hz are called…', 'ultrasound', ['infrasound', 'echo', 'noise']],
          ['Loudness of a sound depends on its…', 'amplitude', ['frequency', 'wavelength only', 'speed']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Pitch ↔ frequency; loudness ↔ amplitude; sound needs a medium.'], solution: [a] };
      }),
    ],
  }],
};

void tip; void f; void isPrime; void NAMES;

export default buildClass(11, [coords, linpoly, numbers, identities, circles, heron, probability, seqs, props, data, algos, quads, twovar, solids, motion, forceMotion, work, sound, ...tsClass9]);
