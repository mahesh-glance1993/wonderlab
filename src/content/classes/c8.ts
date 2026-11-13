// Class 8 — CBSE Mathematics (NCERT Ganita Prakash Parts 1 & 2) and physics chapters of NCERT Science: Curiosity.
// Maths is bilingual (English + Telugu); physics has Telugu titles only. Telugu needs native-speaker review.
import {
  buildClass, src, tp, ex, p, tip, f, vis, act, stepsB, num, approx, frac, expr, choose, matching, ordering, tapAll,
  gcd, rd, inr, NAMES, CITIES, L, type USpec,
} from '../lib/kit';
import { tsClass8 } from '../ts/c8';

const sq = (n: number) => n * n;
const YES = L('Yes', 'అవును'), NO = L('No', 'కాదు');
const yn = (ok: boolean) => (ok ? [YES, NO] : [NO, YES]) as [typeof YES, typeof NO];

// ------------------------------------------------------------------ MATHS PART 1
const squares: USpec = {
  id: 'c8.u.square-cube', subject: 'math', title: L('A Square and A Cube', 'వర్గం మరియు ఘనం'), source: src('gp8a', 1, 'A Square and A Cube'),
  objectives: [{
    id: 'c8.sq.roots', title: L('Squares, cubes and their roots', 'వర్గాలు, ఘనాలు మరియు వాటి మూలాలు'), prereqs: [],
    activities: ['game:patterns'],
    intro: [
      p('A square number is a number times itself (n × n = n²). A cube number is n × n × n = n³.', 'ఒక సంఖ్యను అదే సంఖ్యతో గుణిస్తే వర్గం వస్తుంది (n × n = n²). n × n × n = n³ ను ఘనం అంటారు.'),
      p('The square root undoes squaring: √144 = 12 because 12² = 144. The cube root undoes cubing: ∛27 = 3.', 'వర్గమూలం వర్గాన్ని తిరగదీస్తుంది: 12² = 144 కాబట్టి √144 = 12. ఘనమూలం ఘనాన్ని తిరగదీస్తుంది: ∛27 = 3.'),
      tip('A perfect square never ends in 2, 3, 7 or 8. Its prime factors come in pairs; a perfect cube has prime factors in triples.', 'పరిపూర్ణ వర్గం 2, 3, 7 లేదా 8 తో ముగియదు. దాని ప్రధాన కారణాంకాలు జంటలుగా ఉంటాయి; పరిపూర్ణ ఘనంలో మూడేసిగా ఉంటాయి.'),
      vis({ kind: 'grid-shape', cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], cols: 3, rows: 3 }, 'A 3 by 3 square has 9 cells: 3² = 9', '3 × 3 చతురస్రంలో 9 గడులు: 3² = 9'),
    ],
    examples: [
      ex(L('Find √1764 by prime factorisation.', 'ప్రధాన కారణాంక విభజనతో √1764 కనుగొనండి.'),
        [L('1764 = 2 × 2 × 3 × 3 × 7 × 7'), L('Pair the factors: (2×2)(3×3)(7×7)', 'కారణాంకాలను జంటలు చేయండి: (2×2)(3×3)(7×7)'), L('Take one from each pair: 2 × 3 × 7 = 42', 'ప్రతి జంట నుండి ఒకటి తీసుకోండి: 2 × 3 × 7 = 42')].map((x) => (x.te ? x : L(x.en, x.en))), L('42', '42')),
      ex(L('Is 216 a perfect cube?', '216 పరిపూర్ణ ఘనమా?'),
        [L('216 = 2 × 2 × 2 × 3 × 3 × 3', '216 = 2 × 2 × 2 × 3 × 3 × 3'), L('Factors form triples', 'కారణాంకాలు మూడేసిగా ఉన్నాయి'), L('∛216 = 2 × 3 = 6', '∛216 = 2 × 3 = 6')], L('Yes, 6³ = 216', 'అవును, 6³ = 216')),
    ],
    practice: [
      tp('sqrt', (r) => {
        const n = r.int(11, 45);
        const t = Math.floor(n / 10) * 10;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Find √${n * n}.`, `√${n * n} కనుగొనండి.`), answer: num(n),
          hints: [L('Look at the last digit to guess the last digit of the root.', 'చివరి అంకెను చూసి మూలం చివరి అంకెను ఊహించండి.'), L(`${t}² = ${sq(t)} — start nearby.`, `${t}² = ${sq(t)} — దాని దగ్గర నుండి మొదలుపెట్టండి.`)],
          mistakes: [{ when: String((n * n) / 2), explain: L('The square root is not half the number: find a number that multiplied by ITSELF gives it.', 'వర్గమూలం సంఖ్యలో సగం కాదు: తనతో తానే గుణిస్తే ఆ సంఖ్య వచ్చే సంఖ్యను కనుగొనండి.') }],
          solution: [L(`${n} × ${n} = ${n * n}`, `${n} × ${n} = ${n * n}`), L(`So √${n * n} = ${n}`, `కాబట్టి √${n * n} = ${n}`)],
        };
      }),
      tp('cube', (r) => {
        const n = r.int(2, 15);
        const ask = r.pick(['cube', 'root'] as const);
        return {
          type: 'typed', keypad: 'numeric', prompt: ask === 'cube' ? L(`Find ${n}³.`, `${n}³ కనుగొనండి.`) : L(`Find the cube root of ${n ** 3}.`, `${n ** 3} యొక్క ఘనమూలం కనుగొనండి.`), answer: num(ask === 'cube' ? n ** 3 : n),
          hints: ask === 'cube'
            ? [L('n³ = n × n × n', 'n³ = n × n × n'), L(`${n} × ${n} = ${n * n}`, `${n} × ${n} = ${n * n}`)]
            : [L('Which number times itself three times gives this?', 'ఏ సంఖ్యను మూడుసార్లు గుణిస్తే ఇది వస్తుంది?'), L('Try prime factorisation and group the factors in threes.', 'ప్రధాన కారణాంకాలుగా విభజించి మూడేసిగా జట్టు కట్టండి.')],
          mistakes: [{ when: String(3 * n), explain: L('Cubing means multiplying the number by itself three times, not multiplying by 3.', 'ఘనం అంటే సంఖ్యను తనతో మూడుసార్లు గుణించడం, 3 తో గుణించడం కాదు.') }],
          solution: [L(`${n} × ${n} × ${n} = ${n ** 3}`, `${n} × ${n} × ${n} = ${n ** 3}`)],
        };
      }),
      tp('perfect', (r) => {
        const base = r.int(4, 30);
        const sh = r.pick([0, 0, 2, 3, 5, 7]);
        const n = base * base + sh;
        const ok = sh === 0;
        const [c, w] = yn(ok);
        return {
          type: 'mcq', prompt: L(`Is ${n} a perfect square?`, `${n} పరిపూర్ణ వర్గమా?`), ...choose(r, c, [w]),
          hints: [L('Check the last digit first.', 'మొదట చివరి అంకెను పరిశీలించండి.'), L(`${base}² = ${base * base}.`, `${base}² = ${base * base}.`)],
          solution: [ok ? L(`${n} = ${base}², so yes.`, `${n} = ${base}², కాబట్టి అవును.`) : L(`${base}² = ${base * base} and ${base + 1}² = ${sq(base + 1)}; ${n} lies between, so no.`, `${base}² = ${base * base}, ${base + 1}² = ${sq(base + 1)}; ${n} వీటి మధ్య ఉంది, కాబట్టి కాదు.`)],
        };
      }),
    ],
  }],
};

const power: USpec = {
  id: 'c8.u.power', subject: 'math', title: L('Power Play', 'ఘాతాంకాల ఆట'), source: src('gp8a', 2, 'Power Play'),
  objectives: [{
    id: 'c8.pow.laws', title: L('Exponents and the laws of exponents', 'ఘాతాంకాలు మరియు ఘాతాంక నియమాలు'), prereqs: ['c8.sq.roots'],
    intro: [
      p('aⁿ means a multiplied by itself n times. a is the base, n is the exponent (power).', 'aⁿ అంటే a ను n సార్లు గుణించడం. a భూమి, n ఘాతాంకం.'),
      f('aᵐ × aⁿ = aᵐ⁺ⁿ,  aᵐ ÷ aⁿ = aᵐ⁻ⁿ,  (aᵐ)ⁿ = aᵐⁿ,  a⁰ = 1,  a⁻ⁿ = 1/aⁿ'),
      p('Large numbers are written in standard form: 3,84,000 km = 3.84 × 10⁵ km (distance to the Moon).', 'పెద్ద సంఖ్యలను ప్రామాణిక రూపంలో రాస్తాం: 3,84,000 కి.మీ = 3.84 × 10⁵ కి.మీ (చంద్రుని దూరం).'),
      tip('Folding a paper in half doubles its thickness: after n folds it is 2ⁿ times thicker!', 'కాగితాన్ని సగానికి మడిస్తే మందం రెట్టింపు అవుతుంది: n మడతల తర్వాత 2ⁿ రెట్లు!'),
    ],
    examples: [
      ex(L('Simplify 2⁵ × 2³ ÷ 2⁴.', '2⁵ × 2³ ÷ 2⁴ ను సూక్ష్మీకరించండి.'), [L('Add powers when multiplying: 2⁸', 'గుణించేటప్పుడు ఘాతాంకాలు కూడండి: 2⁸'), L('Subtract when dividing: 2⁸⁻⁴ = 2⁴', 'భాగించేటప్పుడు తీసివేయండి: 2⁸⁻⁴ = 2⁴'), L('= 16', '= 16')], L('16', '16')),
      ex(L('Write 0.00045 in standard form.', '0.00045 ను ప్రామాణిక రూపంలో రాయండి.'), [L('Move the decimal 4 places right: 4.5', 'దశాంశ బిందువును 4 స్థానాలు కుడికి జరపండి: 4.5'), L('0.00045 = 4.5 × 10⁻⁴', '0.00045 = 4.5 × 10⁻⁴')], L('4.5 × 10⁻⁴', '4.5 × 10⁻⁴')),
    ],
    practice: [
      tp('combine', (r) => {
        const b = r.pick([2, 3, 5, 10]);
        const m = r.int(2, 9), n = r.int(2, 9), k = r.int(1, 6);
        const e = m + n - k;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${b}^${m} × ${b}^${n} ÷ ${b}^${k} = ${b}^?  Find the missing exponent.`, `${b}^${m} × ${b}^${n} ÷ ${b}^${k} = ${b}^?  లోపించిన ఘాతాంకం కనుగొనండి.`), answer: num(e),
          hints: [L('Same base: add exponents when multiplying.', 'ఒకే భూమి: గుణించేటప్పుడు ఘాతాంకాలు కూడండి.'), L('Subtract exponents when dividing.', 'భాగించేటప్పుడు ఘాతాంకాలు తీసివేయండి.')],
          mistakes: [{ when: String(m * n - k), explain: L('Multiply the powers only for (aᵐ)ⁿ. For aᵐ × aⁿ, add the exponents.', '(aᵐ)ⁿ కు మాత్రమే ఘాతాంకాలను గుణిస్తాం. aᵐ × aⁿ కు కూడాలి.') }],
          solution: [L(`${m} + ${n} − ${k} = ${e}`, `${m} + ${n} − ${k} = ${e}`), L(`Answer: ${b}^${e}`, `జవాబు: ${b}^${e}`)],
        };
      }),
      tp('value', (r) => {
        const b = r.pick([2, 3, 4, 5]);
        const n = b === 2 ? r.int(0, 10) : r.int(0, 5);
        const neg = r.next() < 0.3 && n > 0;
        return {
          type: 'typed', keypad: neg ? 'fraction' : 'numeric', prompt: L(`Evaluate ${b}^${neg ? -n : n}.`, `${b}^${neg ? -n : n} విలువ కనుగొనండి.`), answer: neg ? frac(1, b ** n) : num(b ** n),
          hints: [n === 0 ? L('Any non-zero number to the power 0 is 1.', 'సున్నా కాని ఏ సంఖ్యకైనా ఘాతాంకం 0 అయితే విలువ 1.') : L(`Multiply ${b} by itself ${n} times.`, `${b} ను ${n} సార్లు గుణించండి.`),
            neg ? L('A negative exponent means "one over": a⁻ⁿ = 1/aⁿ.', 'ఋణ ఘాతాంకం అంటే వ్యుత్క్రమం: a⁻ⁿ = 1/aⁿ.') : L('Do it step by step.', 'అంచెలంచెలుగా చేయండి.')],
          mistakes: [{ when: String(b * n), explain: L('A power is repeated multiplication, not b × n.', 'ఘాతం అంటే పునరావృత గుణకారం, b × n కాదు.') }],
          solution: [neg ? L(`${b}^-${n} = 1/${b}^${n} = 1/${b ** n}`, `${b}^-${n} = 1/${b}^${n} = 1/${b ** n}`) : L(`${b}^${n} = ${b ** n}`, `${b}^${n} = ${b ** n}`)],
        };
      }),
      tp('std', (r) => {
        const facts: [string, string, number, number][] = [['Distance from Earth to the Moon (km)', 'భూమి నుండి చంద్రుని దూరం (కి.మీ)', 3.84, 5], ['Population of India (approx.)', 'భారతదేశ జనాభా (సుమారు)', 1.4, 9], ['Speed of light (m/s)', 'కాంతి వేగం (మీ/సె)', 3, 8], ['Diameter of the Sun (km)', 'సూర్యుని వ్యాసం (కి.మీ)', 1.39, 6], ['Thickness of a hair (m)', 'వెంట్రుక మందం (మీ)', 8, -5], ['Size of a red blood cell (m)', 'ఎర్ర రక్తకణం పరిమాణం (మీ)', 7, -6], ['Distance Earth–Sun (km)', 'భూమి–సూర్యుడు దూరం (కి.మీ)', 1.5, 8]];
        const [what, whatTe, a, k] = r.pick(facts);
        const right = `${a} × 10^${k}`;
        const shown = k > 0 ? (a * 10 ** k).toLocaleString('en-IN') : (a * 10 ** k).toFixed(-k + 2).replace(/0+$/, '');
        return {
          type: 'mcq', prompt: L(`${what} is about ${shown}. Which is the standard form?`, `${whatTe} సుమారు ${shown}. దీని ప్రామాణిక రూపం ఏది?`),
          ...choose(r, right, [`${a} × 10^${k + 1}`, `${a} × 10^${k - 1}`, `${a * 10} × 10^${k}`, `${a} × 10^${-k}`]),
          hints: [L('Standard form is a × 10ⁿ with 1 ≤ a < 10.', 'ప్రామాణిక రూపం a × 10ⁿ, ఇక్కడ 1 ≤ a < 10.'), L('Count how many places the decimal point moves.', 'దశాంశ బిందువు ఎన్ని స్థానాలు జరుగుతుందో లెక్కించండి.')],
          solution: [L(`Answer: ${right}`, `జవాబు: ${right}`)],
        };
      }, 2),
    ],
  }],
};

const ROMAN: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const toRoman = (x: number) => { let s = '', y = x; for (const [v, sy] of ROMAN) while (y >= v) { s += sy; y -= v; } return s; };
const story: USpec = {
  id: 'c8.u.story', subject: 'math', title: L('A Story of Numbers', 'సంఖ్యల కథ'), source: src('gp8a', 3, 'A Story of Numbers'),
  objectives: [{
    id: 'c8.num.systems', title: L('Number systems: Roman numerals and other bases', 'సంఖ్యా వ్యవస్థలు: రోమన్ సంఖ్యలు, ఇతర ఆధారాలు'), prereqs: [],
    intro: [
      p('People have counted in many ways: tally marks, Roman numerals, and the Indian place-value system with zero that the whole world now uses.', 'మనుషులు ఎన్నో విధాలుగా లెక్కించారు: గీతల గుర్తులు, రోమన్ సంఖ్యలు, మరియు సున్నాతో కూడిన భారతీయ స్థాన విలువ పద్ధతి — దీనినే ఇప్పుడు ప్రపంచమంతా వాడుతోంది.'),
      p('Our system is base 10: each place is 10 times the place to its right. Computers use base 2 (binary): places are 1, 2, 4, 8, 16, …', 'మన పద్ధతి ఆధారం 10: ప్రతి స్థానం కుడి స్థానానికి 10 రెట్లు. కంప్యూటర్లు ఆధారం 2 (ద్విసంఖ్యామానం) వాడతాయి: స్థానాలు 1, 2, 4, 8, 16, …'),
      f('1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11'),
      p('Roman numerals: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. A smaller symbol before a larger one is subtracted (IV = 4).', 'రోమన్ సంఖ్యలు: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. పెద్ద గుర్తుకు ముందు చిన్న గుర్తు ఉంటే తీసివేయాలి (IV = 4).'),
    ],
    examples: [
      ex(L('Convert 11010₂ to base 10.', '11010₂ ను ఆధారం 10 లోకి మార్చండి.'), [L('Places: 16, 8, 4, 2, 1', 'స్థానాలు: 16, 8, 4, 2, 1'), L('16 + 8 + 0 + 2 + 0', '16 + 8 + 0 + 2 + 0'), L('= 26', '= 26')], L('26', '26')),
      ex(L('Write 1947 in Roman numerals.', '1947 ను రోమన్ సంఖ్యలలో రాయండి.'), [L('1000 = M', '1000 = M'), L('900 = CM', '900 = CM'), L('40 = XL', '40 = XL'), L('7 = VII', '7 = VII')], L('MCMXLVII', 'MCMXLVII')),
    ],
    practice: [
      tp('bin', (r) => {
        const n = r.int(5, 63);
        const b = n.toString(2);
        const sum = b.split('').reverse().map((d, i) => (d === '1' ? 2 ** i : 0)).filter(Boolean).reverse().join(' + ') + ` = ${n}`;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Convert the binary number ${b}₂ to base 10.`, `ద్విసంఖ్య ${b}₂ ను ఆధారం 10 లోకి మార్చండి.`), answer: num(n),
          hints: [L('Write the place values 1, 2, 4, 8, 16, 32 from the right.', 'కుడి నుండి స్థాన విలువలు 1, 2, 4, 8, 16, 32 రాయండి.'), L('Add the place values where the digit is 1.', 'అంకె 1 ఉన్న స్థాన విలువలను కూడండి.')],
          solution: [L(sum, sum)],
        };
      }, 2),
      tp('roman', (r) => {
        const n = r.int(4, 399);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What number is written as ${toRoman(n)} in Roman numerals?`, `రోమన్ సంఖ్య ${toRoman(n)} విలువ ఎంత?`), answer: num(n),
          hints: [L('Read from left to right, adding values.', 'ఎడమ నుండి కుడికి చదువుతూ విలువలు కూడండి.'), L('If a smaller symbol comes before a larger one, subtract it.', 'పెద్ద గుర్తుకు ముందు చిన్న గుర్తు ఉంటే తీసివేయండి.')],
          solution: [L(`${toRoman(n)} = ${n}`, `${toRoman(n)} = ${n}`)],
        };
      }),
      tp('place', (r) => {
        const d = r.int(1, 9), pos = r.int(1, 6);
        const n = r.int(1000000, 9999999);
        const s = String(n).split('');
        s[s.length - 1 - pos] = String(d);
        const val = d * 10 ** pos;
        const shown = Number(s.join('')).toLocaleString('en-IN');
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`In ${shown}, what is the place value of the digit ${d} that is ${pos} places from the right end (counting the ones place as 0)?`, `${shown} లో, కుడి చివర నుండి ${pos} స్థానాల దూరంలో ఉన్న అంకె ${d} యొక్క స్థాన విలువ ఎంత (ఒకట్ల స్థానం 0)?`),
          answer: num(val),
          hints: [L('Ones, tens, hundreds, thousands, ten-thousands, lakhs, ten-lakhs …', 'ఒకట్లు, పదులు, వందలు, వేలు, పదివేలు, లక్షలు, పదిలక్షలు …'), L('Place value = digit × value of its place.', 'స్థాన విలువ = అంకె × దాని స్థానం విలువ.')],
          mistakes: [{ when: String(d), explain: L('That is the face value. Place value multiplies the digit by its place (10, 100, …).', 'అది ముఖ విలువ. స్థాన విలువ అంటే అంకెను దాని స్థానంతో (10, 100, …) గుణించడం.') }],
          solution: [L(`${d} × ${(10 ** pos).toLocaleString('en-IN')} = ${val.toLocaleString('en-IN')}`, `${d} × ${(10 ** pos).toLocaleString('en-IN')} = ${val.toLocaleString('en-IN')}`)],
        };
      }),
    ],
  }],
};

const quads: USpec = {
  id: 'c8.u.quad', subject: 'math', title: L('Quadrilaterals', 'చతుర్భుజాలు'), source: src('gp8a', 4, 'Quadrilaterals'),
  objectives: [{
    id: 'c8.quad.props', title: L('Properties of quadrilaterals', 'చతుర్భుజాల ధర్మాలు'), prereqs: [],
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('A quadrilateral has 4 sides and 4 angles that add up to 360°.', 'చతుర్భుజానికి 4 భుజాలు, 4 కోణాలు ఉంటాయి; కోణాల మొత్తం 360°.'),
      p('Parallelogram: opposite sides parallel and equal, opposite angles equal. Rectangle: a parallelogram with all angles 90°. Rhombus: all sides equal. Square: rectangle and rhombus together.', 'సమాంతర చతుర్భుజం: ఎదురెదురు భుజాలు సమాంతరం, సమానం; ఎదురెదురు కోణాలు సమానం. దీర్ఘచతురస్రం: అన్ని కోణాలు 90°. రాంబస్: అన్ని భుజాలు సమానం. చతురస్రం: దీర్ఘచతురస్రం మరియు రాంబస్ రెండూ.'),
      tip('Diagonals of a rectangle are equal; diagonals of a rhombus cross at right angles.', 'దీర్ఘచతురస్రం కర్ణాలు సమానం; రాంబస్ కర్ణాలు లంబంగా ఖండించుకుంటాయి.'),
      vis({ kind: 'shape', shape: 'diamond' }, 'A rhombus', 'రాంబస్'),
    ],
    examples: [
      ex(L('Three angles of a quadrilateral are 80°, 95°, 110°. Fourth?', 'ఒక చతుర్భుజంలో మూడు కోణాలు 80°, 95°, 110°. నాలుగవది?'), [L('Sum = 360°', 'మొత్తం = 360°'), L('360 − (80 + 95 + 110) = 75', '360 − (80 + 95 + 110) = 75')], L('75°', '75°')),
      ex(L('In parallelogram ABCD, ∠A = 70°. Find ∠B.', 'సమాంతర చతుర్భుజం ABCD లో ∠A = 70°. ∠B కనుగొనండి.'), [L('Adjacent angles add to 180°', 'ఆసన్న కోణాల మొత్తం 180°'), L('∠B = 110°', '∠B = 110°')], L('110°', '110°')),
    ],
    practice: [
      tp('fourth', (r) => {
        const a = r.int(60, 120), b = r.int(60, 120), c = r.int(50, 110);
        const d = 360 - a - b - c;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. Find the fourth angle (in degrees).`, `ఒక చతుర్భుజంలో మూడు కోణాలు ${a}°, ${b}°, ${c}°. నాలుగవ కోణం (డిగ్రీలలో) కనుగొనండి.`), answer: num(d, '°'),
          hints: [L('The angles of a quadrilateral add up to 360°.', 'చతుర్భుజం కోణాల మొత్తం 360°.')],
          mistakes: [{ when: String(180 - a - b - c), explain: L('180° is the triangle angle sum. A quadrilateral\'s angles add to 360°.', '180° త్రిభుజ కోణాల మొత్తం. చతుర్భుజానికి 360°.') }],
          solution: [L(`360 − (${a} + ${b} + ${c}) = ${d}°`, `360 − (${a} + ${b} + ${c}) = ${d}°`)],
        };
      }),
      tp('para', (r) => {
        const A = r.int(40, 140);
        const ask = r.pick(['B', 'C', 'D'] as const);
        const v = ask === 'C' ? A : 180 - A;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`ABCD is a parallelogram with ∠A = ${A}°. Find ∠${ask}.`, `ABCD సమాంతర చతుర్భుజం, ∠A = ${A}°. ∠${ask} కనుగొనండి.`), answer: num(v, '°'),
          hints: [L('Opposite angles of a parallelogram are equal.', 'సమాంతర చతుర్భుజంలో ఎదురెదురు కోణాలు సమానం.'), L('Adjacent angles add up to 180°.', 'ఆసన్న కోణాల మొత్తం 180°.')],
          solution: [ask === 'C' ? L(`∠C is opposite ∠A, so ∠C = ${A}°`, `∠C, ∠A కు ఎదురుగా ఉంది, కాబట్టి ∠C = ${A}°`) : L(`∠${ask} is next to ∠A, so ∠${ask} = 180 − ${A} = ${v}°`, `∠${ask}, ∠A కు ఆసన్నం, కాబట్టి ∠${ask} = 180 − ${A} = ${v}°`)],
        };
      }),
      tp('which', (r) => {
        const all: [ReturnType<typeof L>, ReturnType<typeof L>][] = [
          [L('All sides equal and all angles 90°', 'అన్ని భుజాలు సమానం, అన్ని కోణాలు 90°'), L('Square', 'చతురస్రం')],
          [L('Opposite sides equal, all angles 90°, sides not all equal', 'ఎదురు భుజాలు సమానం, అన్ని కోణాలు 90°, అన్ని భుజాలు సమానం కావు'), L('Rectangle', 'దీర్ఘచతురస్రం')],
          [L('All sides equal, angles not 90°', 'అన్ని భుజాలు సమానం, కోణాలు 90° కావు'), L('Rhombus', 'రాంబస్')],
          [L('Exactly one pair of parallel sides', 'ఒకే ఒక జత సమాంతర భుజాలు'), L('Trapezium', 'సమలంబ చతుర్భుజం')],
          [L('Two pairs of equal adjacent sides, not a rhombus', 'రెండు జతల సమాన ఆసన్న భుజాలు, రాంబస్ కాదు'), L('Kite', 'గాలిపటం')],
          [L('Both pairs of opposite sides parallel, no right angles, sides not all equal', 'రెండు జతల ఎదురు భుజాలు సమాంతరం, లంబ కోణాలు లేవు, అన్ని భుజాలు సమానం కావు'), L('Parallelogram', 'సమాంతర చతుర్భుజం')],
        ];
        const set = r.shuffle(all).slice(0, 4);
        return {
          type: 'match', prompt: L(`Match each description to the quadrilateral: ${set.map((x) => x[1].en).join(', ')}.`, `ప్రతి వివరణను చతుర్భుజంతో జతపరచండి: ${set.map((x) => x[1].te).join(', ')}.`), ...matching(r, set),
          hints: [L('Check sides first, then angles.', 'మొదట భుజాలు, తర్వాత కోణాలు పరిశీలించండి.')], solution: set.map(([a, b]) => L(`${a.en} → ${b.en}`, `${a.te} → ${b.te}`)),
        };
      }),
    ],
  }],
};

const numplay: USpec = {
  id: 'c8.u.numplay', subject: 'math', title: L('Number Play', 'సంఖ్యలతో ఆట'), source: src('gp8a', 5, 'Number Play'),
  objectives: [{
    id: 'c8.np.divis', title: L('Divisibility rules and digit puzzles', 'భాజనీయతా నియమాలు, అంకెల పజిల్స్'), prereqs: [],
    activities: ['game:logic'],
    intro: [
      p('Divisibility rules let you test a number without dividing.', 'భాజనీయతా నియమాలతో భాగించకుండానే పరీక్షించవచ్చు.'),
      stepsB(L('By 3: digit sum divisible by 3.', '3 చే: అంకెల మొత్తం 3 చే భాగించబడాలి.'), L('By 9: digit sum divisible by 9.', '9 చే: అంకెల మొత్తం 9 చే భాగించబడాలి.'), L('By 4: last two digits divisible by 4.', '4 చే: చివరి రెండు అంకెలు 4 చే భాగించబడాలి.'), L('By 8: last three digits divisible by 8.', '8 చే: చివరి మూడు అంకెలు 8 చే భాగించబడాలి.'), L('By 11: difference of alternate-digit sums is 0 or a multiple of 11.', '11 చే: ఏకాంతర అంకెల మొత్తాల భేదం 0 లేదా 11 గుణిజం.')),
      tip('Remainder of n ÷ 9 equals the remainder of its digit sum ÷ 9.', 'n ÷ 9 శేషం = దాని అంకెల మొత్తం ÷ 9 శేషం.'),
    ],
    examples: [
      ex(L('Is 7425 divisible by 9?', '7425, 9 చే భాగించబడుతుందా?'), [L('Digit sum = 7 + 4 + 2 + 5 = 18', 'అంకెల మొత్తం = 7 + 4 + 2 + 5 = 18'), L('18 is divisible by 9', '18, 9 చే భాగించబడుతుంది')], YES),
      ex(L('Is 9152 divisible by 11?', '9152, 11 చే భాగించబడుతుందా?'), [L('(9 + 5) − (1 + 2) = 11', '(9 + 5) − (1 + 2) = 11'), L('11 is a multiple of 11', '11, 11 యొక్క గుణిజం')], YES),
    ],
    practice: [
      tp('test', (r) => {
        const d = r.pick([3, 4, 8, 9, 11]);
        const n = r.next() < 0.5 ? d * r.int(120, 1100) : d * r.int(120, 1100) + r.int(1, d - 1);
        const ok = n % d === 0;
        const [c, w] = yn(ok);
        return {
          type: 'mcq', prompt: L(`Is ${n} divisible by ${d}? (Use a divisibility rule.)`, `${n}, ${d} చే భాగించబడుతుందా? (భాజనీయతా నియమం వాడండి.)`), ...choose(r, c, [w]),
          hints: [d === 3 || d === 9 ? L('Add the digits.', 'అంకెలను కూడండి.') : d === 11 ? L('Find the difference between alternate digit sums.', 'ఏకాంతర అంకెల మొత్తాల భేదం కనుగొనండి.') : L(`Look at the last ${d === 4 ? 'two' : 'three'} digits.`, `చివరి ${d === 4 ? 'రెండు' : 'మూడు'} అంకెలను చూడండి.`)],
          solution: [L(`${n} ÷ ${d} leaves remainder ${n % d}`, `${n} ÷ ${d} శేషం ${n % d}`), ok ? L('So it is divisible.', 'కాబట్టి భాగించబడుతుంది.') : L('So it is not divisible.', 'కాబట్టి భాగించబడదు.')],
        };
      }),
      tp('remainder9', (r) => {
        const n = r.int(1000, 99999);
        const ds = String(n).split('').reduce((a, c) => a + +c, 0);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Without long division, find the remainder when ${n} is divided by 9.`, `భాగహారం చేయకుండా, ${n} ను 9 చే భాగిస్తే శేషం కనుగొనండి.`), answer: num(n % 9),
          hints: [L('Add the digits.', 'అంకెలను కూడండి.'), L('Keep adding digits until you get a single digit; 9 means remainder 0.', 'ఒక్క అంకె వచ్చే వరకు కూడుతూ ఉండండి; 9 వస్తే శేషం 0.')],
          solution: [L(`Digit sum = ${ds}`, `అంకెల మొత్తం = ${ds}`), L(`${ds} ÷ 9 leaves ${ds % 9}`, `${ds} ÷ 9 శేషం ${ds % 9}`), L(`Remainder = ${n % 9}`, `శేషం = ${n % 9}`)],
        };
      }, 2),
      tp('missing', (r) => {
        const a = r.int(1, 9), c = r.int(0, 9), d = r.int(0, 9);
        const x = (9 - ((a + c + d) % 9)) % 9;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`The 4-digit number ${a}?${c}${d} is divisible by 9. Find the missing digit (0–8).`, `4 అంకెల సంఖ్య ${a}?${c}${d}, 9 చే భాగించబడుతుంది. లోపించిన అంకె (0–8) కనుగొనండి.`), answer: num(x),
          hints: [L('The digit sum must be a multiple of 9.', 'అంకెల మొత్తం 9 గుణిజం కావాలి.'), L(`${a} + ${c} + ${d} = ${a + c + d}`, `${a} + ${c} + ${d} = ${a + c + d}`)],
          solution: [L(`${a + c + d} + ? must be a multiple of 9`, `${a + c + d} + ? 9 గుణిజం కావాలి`), L(`? = ${x}`, `? = ${x}`)],
        };
      }, 2),
    ],
  }],
};

const distribute: USpec = {
  id: 'c8.u.distribute', subject: 'math', title: L('We Distribute, Yet Things Multiply', 'విభాగ న్యాయం — గుణకారాల విస్తరణ'), source: src('gp8a', 6, 'We Distribute, Yet Things Multiply'),
  objectives: [{
    id: 'c8.alg.expand', title: L('Expanding products and standard identities', 'లబ్ధాల విస్తరణ మరియు ప్రామాణిక సర్వసమీకరణాలు'), prereqs: ['c8.pow.laws'],
    intro: [
      p('Multiplication distributes over addition: a(b + c) = ab + ac. Multiplying two brackets distributes twice.', 'గుణకారం సంకలనంపై విభాగ న్యాయం పాటిస్తుంది: a(b + c) = ab + ac. రెండు బ్రాకెట్లు గుణిస్తే రెండుసార్లు విస్తరిస్తాం.'),
      f('(a + b)² = a² + 2ab + b²'),
      f('(a − b)² = a² − 2ab + b²'),
      f('(a + b)(a − b) = a² − b²'),
      tip('Mental maths: 102² = (100 + 2)² = 10000 + 400 + 4 = 10404.', 'మనోగణితం: 102² = (100 + 2)² = 10000 + 400 + 4 = 10404.'),
    ],
    examples: [
      ex(L('Expand (x + 3)(x + 5).', '(x + 3)(x + 5) ను విస్తరించండి.'), [L('x·x + 5x + 3x + 15', 'x·x + 5x + 3x + 15'), L('= x² + 8x + 15', '= x² + 8x + 15')], L('x² + 8x + 15', 'x² + 8x + 15')),
      ex(L('Find 98 × 102 mentally.', '98 × 102 ను మనసులో లెక్కించండి.'), [L('= (100 − 2)(100 + 2)', '= (100 − 2)(100 + 2)'), L('= 10000 − 4 = 9996', '= 10000 − 4 = 9996')], L('9996', '9996')),
    ],
    practice: [
      tp('mental', (r) => {
        const kind = r.pick(['sq+', 'sq-', 'diff'] as const);
        const base = r.pick([10, 20, 30, 50, 100]), k = r.int(1, 4);
        const [a, b] = kind === 'sq+' ? [base + k, base + k] : kind === 'sq-' ? [base - k, base - k] : [base - k, base + k];
        const id = kind === 'diff' ? '(a − b)(a + b) = a² − b²' : kind === 'sq+' ? '(a + b)² = a² + 2ab + b²' : '(a − b)² = a² − 2ab + b²';
        const sol = kind === 'diff' ? `${base}² − ${k}² = ${base * base} − ${k * k} = ${a * b}` : `${base}² ${kind === 'sq+' ? '+' : '−'} 2·${base}·${k} + ${k}² = ${a * b}`;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Use an identity to find ${a} × ${b}.`, `సర్వసమీకరణం ఉపయోగించి ${a} × ${b} కనుగొనండి.`), answer: num(a * b),
          hints: [L(id, id), L(`Write each as ${base} ± ${k}.`, `ప్రతిదాన్ని ${base} ± ${k} గా రాయండి.`)],
          mistakes: [{ when: String(base * base + k * k), explain: L('Do not forget the middle term 2ab when squaring a sum or difference.', 'మొత్తం లేదా భేదం వర్గం చేసేటప్పుడు మధ్య పదం 2ab మరచిపోకండి.') }],
          solution: [L(sol, sol)],
        };
      }),
      tp('expand', (r) => {
        const a = r.int(1, 9), b = r.pick([-7, -5, -3, -2, 1, 2, 4, 6]);
        const B = a + b, C = a * b;
        const t = (v: number, s: string) => (v === 0 ? '' : ` ${v < 0 ? '-' : '+'} ${Math.abs(v) === 1 && s ? '' : Math.abs(v)}${s}`);
        const right = `x^2${t(B, 'x')}${t(C, '')}`;
        const q = `(x + ${a})(x ${b < 0 ? '−' : '+'} ${Math.abs(b)})`;
        return {
          type: 'typed', keypad: 'algebra', prompt: L(`Expand ${q}. Type like x^2 + 5x + 6.`, `${q} ను విస్తరించండి. x^2 + 5x + 6 లాగా టైప్ చేయండి.`),
          answer: expr(right, right.replace('x^2', 'x²')),
          hints: [L('Multiply each term in the first bracket by each in the second.', 'మొదటి బ్రాకెట్‌లోని ప్రతి పదాన్ని రెండవ దానిలోని ప్రతి పదంతో గుణించండి.'), L(`x·x, x·(${b}), ${a}·x, ${a}·(${b})`, `x·x, x·(${b}), ${a}·x, ${a}·(${b})`)],
          solution: [L(`x² + ${b}x + ${a}x + ${C}`, `x² + ${b}x + ${a}x + ${C}`), L(`= ${right.replace('x^2', 'x²')}`, `= ${right.replace('x^2', 'x²')}`)],
        };
      }, 2),
      tp('area', (r) => {
        const a = r.int(3, 12), b = r.int(1, 6);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`A square plot of side (${a} + ${b}) m. Using (a + b)² = a² + 2ab + b², what is the value of the 2ab part (in m²)?`, `భుజం (${a} + ${b}) మీ. ఉన్న చతురస్ర స్థలం. (a + b)² = a² + 2ab + b² ఉపయోగించి 2ab భాగం విలువ (మీ² లో) ఎంత?`), answer: num(2 * a * b, 'm^2'),
          hints: [L(`a = ${a}, b = ${b}`, `a = ${a}, b = ${b}`), L('2ab = 2 × a × b', '2ab = 2 × a × b')],
          solution: [L(`2ab = 2 × ${a} × ${b} = ${2 * a * b}`, `2ab = 2 × ${a} × ${b} = ${2 * a * b}`), L(`Total area = ${a * a} + ${2 * a * b} + ${b * b} = ${(a + b) ** 2} m²`, `మొత్తం వైశాల్యం = ${a * a} + ${2 * a * b} + ${b * b} = ${(a + b) ** 2} మీ²`)],
        };
      }),
    ],
  }],
};

const prop1: USpec = {
  id: 'c8.u.prop1', subject: 'math', title: L('Proportional Reasoning-1', 'అనుపాత తర్కం-1'), source: src('gp8a', 7, 'Proportional Reasoning-1'),
  objectives: [{
    id: 'c8.ratio.basic', title: L('Ratios and proportions', 'నిష్పత్తులు మరియు అనుపాతాలు'), prereqs: [],
    activities: ['game:balance'],
    intro: [
      p('A ratio a : b compares two quantities of the same kind. Ratios are in proportion when a : b = c : d, i.e. a × d = b × c.', 'నిష్పత్తి a : b ఒకే రకమైన రెండు రాశులను పోలుస్తుంది. a : b = c : d అయితే (అంటే a × d = b × c) అవి అనుపాతంలో ఉంటాయి.'),
      p('To share an amount in the ratio a : b, split it into (a + b) equal parts.', 'ఒక మొత్తాన్ని a : b నిష్పత్తిలో పంచాలంటే, దానిని (a + b) సమాన భాగాలు చేయండి.'),
      tip('Simplify a ratio by dividing both terms by their HCF.', 'రెండు పదాలను వాటి గ.సా.భా. చే భాగించి నిష్పత్తిని సూక్ష్మీకరించండి.'),
    ],
    examples: [
      ex(L('Share ₹600 between Ravi and Meena in the ratio 2 : 3.', '₹600 ను రవి, మీనాల మధ్య 2 : 3 నిష్పత్తిలో పంచండి.'), [L('Total parts = 5', 'మొత్తం భాగాలు = 5'), L('One part = ₹120', 'ఒక భాగం = ₹120'), L('Ravi ₹240, Meena ₹360', 'రవి ₹240, మీనా ₹360')], L('Ravi ₹240, Meena ₹360', 'రవి ₹240, మీనా ₹360')),
      ex(L('Are 4 : 6 and 10 : 15 in proportion?', '4 : 6 మరియు 10 : 15 అనుపాతంలో ఉన్నాయా?'), [L('4 × 15 = 60', '4 × 15 = 60'), L('6 × 10 = 60', '6 × 10 = 60'), L('Equal products', 'లబ్ధాలు సమానం')], YES),
    ],
    practice: [
      tp('share', (r) => {
        const a = r.int(1, 5), b = r.int(1, 6), unit = r.pick([20, 25, 50, 100, 120]);
        const tot = (a + b) * unit;
        const n1 = r.pick(NAMES), n2 = r.pick(NAMES.filter((x) => x !== n1));
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: L(`${n1.en} and ${n2.en} share ${inr(tot)} in the ratio ${a} : ${b}. How much does ${n1.en} get?`, `${n1.te}, ${n2.te} ${inr(tot)} ను ${a} : ${b} నిష్పత్తిలో పంచుకున్నారు. ${n1.te} కు ఎంత వస్తుంది?`), answer: num(a * unit, '₹'),
          steps: [{ prompt: L('Value of one part (₹)', 'ఒక భాగం విలువ (₹)'), answer: num(unit, '₹') }, { prompt: L(`${n1.en}'s share (₹)`, `${n1.te} వాటా (₹)`), answer: num(a * unit, '₹') }],
          hints: [L(`Total parts = ${a} + ${b} = ${a + b}`, `మొత్తం భాగాలు = ${a} + ${b} = ${a + b}`), L(`One part = ${inr(tot)} ÷ ${a + b}`, `ఒక భాగం = ${inr(tot)} ÷ ${a + b}`)],
          mistakes: [{ when: String(tot / a), explain: L('Divide by the TOTAL number of parts first, then multiply by the share.', 'మొదట మొత్తం భాగాల సంఖ్యతో భాగించి, తర్వాత వాటాతో గుణించండి.') }],
          solution: [L(`One part = ${tot} ÷ ${a + b} = ${inr(unit)}`, `ఒక భాగం = ${tot} ÷ ${a + b} = ${inr(unit)}`), L(`${n1.en} gets ${a} × ${unit} = ${inr(a * unit)}`, `${n1.te} కు ${a} × ${unit} = ${inr(a * unit)}`)],
        };
      }),
      tp('simplify', (r) => {
        const g = r.int(2, 12), a = r.int(1, 9), b = r.int(1, 9);
        const [x, y] = [a / gcd(a, b), b / gcd(a, b)];
        return {
          type: 'mcq', prompt: L(`Simplify the ratio ${a * g} : ${b * g}.`, `${a * g} : ${b * g} నిష్పత్తిని సూక్ష్మీకరించండి.`), ...choose(r, `${x} : ${y}`, [`${y} : ${x}`, `${x + 1} : ${y}`, `${(a * g) / 2} : ${(b * g) / 2}`, `${x} : ${y + 1}`]),
          hints: [L('Divide both terms by their HCF.', 'రెండు పదాలను గ.సా.భా. చే భాగించండి.')], solution: [L(`HCF = ${gcd(a * g, b * g)}`, `గ.సా.భా. = ${gcd(a * g, b * g)}`), L(`${x} : ${y}`, `${x} : ${y}`)],
        };
      }),
      tp('fourth', (r) => {
        const a = r.int(2, 9), b = r.int(2, 12), k = r.int(2, 6);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Find x if ${a} : ${b} = ${a * k} : x.`, `${a} : ${b} = ${a * k} : x అయితే x కనుగొనండి.`), answer: num(b * k),
          hints: [L('Product of extremes = product of means.', 'అంత్యముల లబ్ధం = మధ్యముల లబ్ధం.'), L(`${a} × x = ${b} × ${a * k}`, `${a} × x = ${b} × ${a * k}`)],
          solution: [L(`x = ${b} × ${a * k} ÷ ${a} = ${b * k}`, `x = ${b} × ${a * k} ÷ ${a} = ${b * k}`)],
        };
      }),
    ],
  }],
};

// ------------------------------------------------------------------ MATHS PART 2
const percent: USpec = {
  id: 'c8.u.percent', subject: 'math', title: L('Fractions in Disguise', 'మారువేషంలో భిన్నాలు (శాతాలు)'), source: src('gp8b', 1, 'Fractions in Disguise'),
  objectives: [{
    id: 'c8.pct.basic', title: L('Percentages, discounts and profit', 'శాతాలు, తగ్గింపు మరియు లాభం'), prereqs: ['c8.ratio.basic'],
    activities: ['game:fractions'],
    intro: [
      p('A percentage is a fraction with denominator 100: 35% = 35/100.', 'శాతం అంటే హారం 100 గల భిన్నం: 35% = 35/100.'),
      f('x% of A = (x/100) × A'),
      f('Discount = Marked price × discount% ; Profit% = Profit ÷ Cost price × 100'),
      tip('10% of a number: move the decimal one place left. 5% is half of that.', 'ఒక సంఖ్యలో 10%: దశాంశ బిందువును ఒక స్థానం ఎడమకు జరపండి. 5% అందులో సగం.'),
    ],
    examples: [
      ex(L('A ₹1200 school bag has a 15% discount. Sale price?', '₹1200 స్కూల్ బ్యాగ్‌పై 15% తగ్గింపు. అమ్మకపు ధర?'), [L('Discount = 15/100 × 1200 = ₹180', 'తగ్గింపు = 15/100 × 1200 = ₹180'), L('Sale price = 1200 − 180 = ₹1020', 'అమ్మకపు ధర = 1200 − 180 = ₹1020')], L('₹1020', '₹1020')),
      ex(L('Bought for ₹400, sold for ₹460. Profit %?', '₹400 కు కొని ₹460 కు అమ్మారు. లాభ శాతం?'), [L('Profit = ₹60', 'లాభం = ₹60'), L('60/400 × 100 = 15%', '60/400 × 100 = 15%')], L('15%', '15%')),
    ],
    practice: [
      tp('of', (r) => {
        const x = r.pick([5, 10, 12, 15, 20, 25, 40, 60, 75]), A = r.pick([80, 120, 240, 360, 400, 500, 800, 1200]);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Find ${x}% of ${A}.`, `${A} లో ${x}% కనుగొనండి.`), answer: num((x * A) / 100),
          hints: [L(`${x}% = ${x}/100`, `${x}% = ${x}/100`), L(`Multiply by ${A}.`, `${A} తో గుణించండి.`)],
          solution: [L(`${x}/100 × ${A} = ${(x * A) / 100}`, `${x}/100 × ${A} = ${(x * A) / 100}`)],
        };
      }),
      tp('discount', (r) => {
        const mp = r.pick([400, 600, 800, 1000, 1500, 2000, 2400]), d = r.pick([10, 15, 20, 25, 30]);
        const it = r.pick([L('pair of shoes', 'జత చెప్పులు'), L('kurta', 'కుర్తా'), L('cricket bat', 'క్రికెట్ బ్యాట్'), L('pressure cooker', 'ప్రెషర్ కుక్కర్'), L('school bag', 'స్కూల్ బ్యాగ్')]);
        const sp = mp - (mp * d) / 100;
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: L(`A ${it.en} marked ${inr(mp)} is sold at ${d}% off during Diwali. What is the sale price?`, `${inr(mp)} ధర గల ${it.te} దీపావళికి ${d}% తగ్గింపుతో అమ్ముతున్నారు. అమ్మకపు ధర ఎంత?`), answer: num(sp, '₹'),
          steps: [{ prompt: L('Discount (₹)', 'తగ్గింపు (₹)'), answer: num((mp * d) / 100, '₹') }, { prompt: L('Sale price (₹)', 'అమ్మకపు ధర (₹)'), answer: num(sp, '₹') }],
          hints: [L('Find the discount first.', 'మొదట తగ్గింపు కనుగొనండి.'), L('Subtract it from the marked price.', 'దానిని ముద్రిత ధర నుండి తీసివేయండి.')],
          mistakes: [{ when: String((mp * d) / 100), explain: L('That is the discount. The sale price is marked price minus discount.', 'అది తగ్గింపు. అమ్మకపు ధర = ముద్రిత ధర − తగ్గింపు.') }],
          solution: [L(`Discount = ${d}% of ${mp} = ${inr((mp * d) / 100)}`, `తగ్గింపు = ${mp} లో ${d}% = ${inr((mp * d) / 100)}`), L(`Sale price = ${inr(sp)}`, `అమ్మకపు ధర = ${inr(sp)}`)],
        };
      }),
      tp('profit', (r) => {
        const cp = r.pick([200, 250, 400, 500, 800]), pc = r.pick([5, 10, 12, 20, 25, -10, -20]);
        const sp = cp + (cp * pc) / 100;
        const pe = pc >= 0 ? 'profit' : 'loss', pt = pc >= 0 ? 'లాభ' : 'నష్ట';
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`A shopkeeper buys a toy for ${inr(cp)} and sells it for ${inr(sp)}. Find the ${pe} percent.`, `ఒక దుకాణదారు బొమ్మను ${inr(cp)} కు కొని ${inr(sp)} కు అమ్మాడు. ${pt} శాతం కనుగొనండి.`), answer: num(Math.abs(pc)),
          hints: [L(`${pc >= 0 ? 'Profit' : 'Loss'} = difference of the two prices.`, `${pc >= 0 ? 'లాభం' : 'నష్టం'} = రెండు ధరల భేదం.`), L('Divide by the COST price and multiply by 100.', 'కొన్న ధరతో భాగించి 100 తో గుణించండి.')],
          mistakes: [{ when: String(rd((Math.abs(sp - cp) / sp) * 100, 2)), explain: L('Profit and loss percent are calculated on the cost price, not the selling price.', 'లాభ నష్ట శాతాలు కొన్న ధరపై లెక్కిస్తాం, అమ్మిన ధరపై కాదు.') }],
          solution: [L(`${pc >= 0 ? 'Profit' : 'Loss'} = ${inr(Math.abs(sp - cp))}`, `${pc >= 0 ? 'లాభం' : 'నష్టం'} = ${inr(Math.abs(sp - cp))}`), L(`${Math.abs(sp - cp)}/${cp} × 100 = ${Math.abs(pc)}%`, `${Math.abs(sp - cp)}/${cp} × 100 = ${Math.abs(pc)}%`)],
        };
      }, 2),
    ],
  }],
};

const TRIP: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
const pyth: USpec = {
  id: 'c8.u.pyth', subject: 'math', title: L('The Baudhayana-Pythagoras Theorem', 'బౌధాయన-పైథాగరస్ సిద్ధాంతం'), source: src('gp8b', 2, 'The Baudhayana-Pythagoras Theorem'),
  objectives: [{
    id: 'c8.pyth.theorem', title: L('Using the Baudhayana-Pythagoras theorem', 'బౌధాయన-పైథాగరస్ సిద్ధాంతం వినియోగం'), prereqs: ['c8.sq.roots'],
    intro: [
      p('In a right-angled triangle, the square on the hypotenuse equals the sum of the squares on the other two sides. Baudhayana stated this in the Śulba-sūtras long before it was named after Pythagoras.', 'లంబకోణ త్రిభుజంలో కర్ణంపై వర్గం మిగిలిన రెండు భుజాలపై వర్గాల మొత్తానికి సమానం. పైథాగరస్ కంటే ఎంతో ముందే బౌధాయనుడు శుల్బ సూత్రాలలో దీనిని చెప్పాడు.'),
      f('c² = a² + b²'),
      vis({ kind: 'triangle', a: 3, b: 4, c: 5 }, 'A 3-4-5 right triangle', '3-4-5 లంబకోణ త్రిభుజం'),
      tip('Numbers like 3, 4, 5 and 5, 12, 13 are called Pythagorean triples.', '3, 4, 5 మరియు 5, 12, 13 వంటి వాటిని పైథాగరియన్ త్రికాలు అంటారు.'),
    ],
    examples: [
      ex(L('Legs are 6 cm and 8 cm. Hypotenuse?', 'భుజాలు 6 సెం.మీ, 8 సెం.మీ. కర్ణం?'), [L('c² = 36 + 64 = 100', 'c² = 36 + 64 = 100'), L('c = 10 cm', 'c = 10 సెం.మీ')], L('10 cm', '10 సెం.మీ')),
      ex(L('A 13 m ladder reaches 12 m up a wall. How far is its foot from the wall?', '13 మీ. నిచ్చెన గోడపై 12 మీ. ఎత్తు చేరుతుంది. దాని అడుగు గోడ నుండి ఎంత దూరం?'), [L('13² = 12² + x²', '13² = 12² + x²'), L('x² = 169 − 144 = 25', 'x² = 169 − 144 = 25'), L('x = 5 m', 'x = 5 మీ')], L('5 m', '5 మీ')),
    ],
    practice: [
      tp('hyp', (r) => {
        const [a, b, c] = r.pick(TRIP);
        const ask = r.pick(['hyp', 'leg'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm', visual: { kind: 'triangle', a, b, c },
          prompt: ask === 'hyp' ? L(`A right triangle has legs ${a} cm and ${b} cm. Find the hypotenuse.`, `లంబకోణ త్రిభుజం భుజాలు ${a} సెం.మీ, ${b} సెం.మీ. కర్ణం కనుగొనండి.`) : L(`A right triangle has hypotenuse ${c} cm and one leg ${a} cm. Find the other leg.`, `లంబకోణ త్రిభుజం కర్ణం ${c} సెం.మీ, ఒక భుజం ${a} సెం.మీ. మరో భుజం కనుగొనండి.`),
          answer: num(ask === 'hyp' ? c : b, 'cm'),
          hints: [L('c² = a² + b²', 'c² = a² + b²'), ask === 'hyp' ? L('Add the squares, then take the square root.', 'వర్గాలు కూడి వర్గమూలం తీసుకోండి.') : L('Subtract the squares, then take the square root.', 'వర్గాలు తీసివేసి వర్గమూలం తీసుకోండి.')],
          mistakes: [{ when: String(ask === 'hyp' ? a + b : c - a), explain: L('Lengths do not simply add or subtract — work with the squares.', 'పొడవులను నేరుగా కూడడం/తీసివేయడం కాదు — వర్గాలతో పని చేయండి.') }],
          solution: ask === 'hyp' ? [L(`c² = ${a * a} + ${b * b} = ${c * c}`, `c² = ${a * a} + ${b * b} = ${c * c}`), L(`c = ${c} cm`, `c = ${c} సెం.మీ`)] : [L(`b² = ${c * c} − ${a * a} = ${b * b}`, `b² = ${c * c} − ${a * a} = ${b * b}`), L(`b = ${b} cm`, `b = ${b} సెం.మీ`)],
        };
      }),
      tp('isright', (r) => {
        const [a, b, c] = r.pick(TRIP);
        const ok = r.next() < 0.5;
        const cc = ok ? c : c + r.pick([1, 2, -1]);
        const [y, n] = yn(ok);
        return {
          type: 'mcq', prompt: L(`Can ${a} cm, ${b} cm and ${cc} cm be the sides of a right-angled triangle?`, `${a} సెం.మీ, ${b} సెం.మీ, ${cc} సెం.మీ లంబకోణ త్రిభుజ భుజాలు కాగలవా?`), ...choose(r, y, [n]),
          hints: [L('Check whether (longest)² = sum of squares of the other two.', '(పెద్ద భుజం)² = మిగిలిన రెండింటి వర్గాల మొత్తమా అని పరిశీలించండి.')],
          solution: [L(`${a}² + ${b}² = ${a * a + b * b}; ${cc}² = ${cc * cc}`, `${a}² + ${b}² = ${a * a + b * b}; ${cc}² = ${cc * cc}`), ok ? L('Equal → right-angled.', 'సమానం → లంబకోణ త్రిభుజం.') : L('Not equal → not right-angled.', 'సమానం కాదు → లంబకోణ త్రిభుజం కాదు.')],
        };
      }),
    ],
  }],
};

const DIRECT = L('Direct', 'అనులోమానుపాతం'), INVERSE = L('Inverse', 'విలోమానుపాతం'), NEITHER = L('Neither', 'ఏదీ కాదు');
const prop2: USpec = {
  id: 'c8.u.prop2', subject: 'math', title: L('Proportional Reasoning-2', 'అనుపాత తర్కం-2'), source: src('gp8b', 3, 'Proportional Reasoning-2'),
  objectives: [{
    id: 'c8.ratio.direct-inverse', title: L('Direct and inverse proportion', 'అనులోమ మరియు విలోమ అనుపాతం'), prereqs: ['c8.ratio.basic'],
    intro: [
      p('Direct proportion: both quantities change by the same factor (more kg of rice → more cost). x/y stays constant.', 'అనులోమానుపాతం: రెండు రాశులు ఒకే రెట్లు మారతాయి (ఎక్కువ కిలోల బియ్యం → ఎక్కువ ధర). x/y స్థిరం.'),
      p('Inverse proportion: one goes up as the other goes down by the same factor (more workers → fewer days). x × y stays constant.', 'విలోమానుపాతం: ఒకటి పెరిగితే మరొకటి అదే రెట్లు తగ్గుతుంది (ఎక్కువ పనివారు → తక్కువ రోజులు). x × y స్థిరం.'),
      tip('Ask: "if one doubles, does the other double or halve?"', 'అడగండి: "ఒకటి రెట్టింపైతే, మరొకటి రెట్టింపా లేక సగమా?"'),
    ],
    examples: [
      ex(L('5 kg rice costs ₹300. Cost of 8 kg?', '5 కిలోల బియ్యం ₹300. 8 కిలోల ధర?'), [L('Direct: cost per kg = ₹60', 'అనులోమం: కిలో ధర = ₹60'), L('8 × 60 = ₹480', '8 × 60 = ₹480')], L('₹480', '₹480')),
      ex(L('6 workers build a wall in 10 days. How long for 15 workers?', '6 మంది గోడను 10 రోజుల్లో కడతారు. 15 మందికి ఎన్ని రోజులు?'), [L('Inverse: 6 × 10 = 60 worker-days', 'విలోమం: 6 × 10 = 60 పని-రోజులు'), L('60 ÷ 15 = 4 days', '60 ÷ 15 = 4 రోజులు')], L('4 days', '4 రోజులు')),
    ],
    practice: [
      tp('direct', (r) => {
        const k = r.pick([30, 40, 45, 60, 80, 120]), a = r.int(2, 8), b = r.int(3, 15);
        const it = r.pick([L('kg of rice', 'కిలోల బియ్యం'), L('litres of milk', 'లీటర్ల పాలు'), L('notebooks', 'నోటుపుస్తకాలు'), L('kg of tomatoes', 'కిలోల టమాటాలు')]);
        return {
          type: 'typed', keypad: 'units', unitHint: '₹', prompt: L(`${a} ${it.en} cost ${inr(a * k)}. How much do ${b} ${it.en} cost?`, `${a} ${it.te} ధర ${inr(a * k)}. ${b} ${it.te} ధర ఎంత?`), answer: num(b * k, '₹'),
          hints: [L('This is direct proportion.', 'ఇది అనులోమానుపాతం.'), L('Find the cost of one first.', 'మొదట ఒక దాని ధర కనుగొనండి.')], solution: [L(`One costs ${inr(k)}`, `ఒక దాని ధర ${inr(k)}`), L(`${b} cost ${inr(b * k)}`, `${b} ధర ${inr(b * k)}`)],
        };
      }),
      tp('inverse', (r) => {
        const total = r.pick([60, 72, 120, 144, 180]);
        const ws = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15].filter((x) => total % x === 0);
        const w1 = r.pick(ws), w2 = r.pick(ws.filter((x) => x !== w1));
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${w1} workers can paint a school in ${total / w1} days. How many days will ${w2} workers take (same speed)?`, `${w1} మంది పనివారు ఒక పాఠశాలకు ${total / w1} రోజుల్లో రంగులు వేస్తారు. ${w2} మందికి (అదే వేగంతో) ఎన్ని రోజులు?`), answer: num(total / w2),
          hints: [L('More workers → fewer days: inverse proportion.', 'ఎక్కువ పనివారు → తక్కువ రోజులు: విలోమానుపాతం.'), L(`Total work = ${w1} × ${total / w1} worker-days.`, `మొత్తం పని = ${w1} × ${total / w1} పని-రోజులు.`)],
          mistakes: [{ when: String(rd(((total / w1) * w2) / w1, 2)), explain: L('This is inverse proportion — more workers need FEWER days.', 'ఇది విలోమానుపాతం — ఎక్కువ మందికి తక్కువ రోజులు.') }],
          solution: [L(`${w1} × ${total / w1} = ${total} worker-days`, `${w1} × ${total / w1} = ${total} పని-రోజులు`), L(`${total} ÷ ${w2} = ${total / w2} days`, `${total} ÷ ${w2} = ${total / w2} రోజులు`)],
        };
      }, 2),
      tp('which', (r) => {
        const cases: [ReturnType<typeof L>, ReturnType<typeof L>][] = [
          [L('Number of pens bought and total cost', 'కొన్న పెన్నుల సంఖ్య మరియు మొత్తం ధర'), DIRECT], [L('Speed of a bus and time for a fixed journey', 'బస్సు వేగం మరియు నిర్ణీత ప్రయాణ సమయం'), INVERSE],
          [L('Number of taps filling a tank and time taken', 'ట్యాంకు నింపే కుళాయిల సంఖ్య మరియు పట్టే సమయం'), INVERSE], [L('Distance travelled at constant speed and time', 'స్థిర వేగంతో ప్రయాణ దూరం మరియు సమయం'), DIRECT],
          [L('Number of children sharing laddoos and laddoos each gets', 'లడ్డూలు పంచుకునే పిల్లల సంఖ్య మరియు ఒక్కొక్కరికి వచ్చే లడ్డూలు'), INVERSE], [L('Length of cloth and its price', 'బట్ట పొడవు మరియు దాని ధర'), DIRECT],
        ];
        const [q, a] = r.pick(cases);
        return {
          type: 'mcq', prompt: L(`${q.en}: what kind of proportion?`, `${q.te}: ఇది ఏ రకమైన అనుపాతం?`), ...choose(r, a, [DIRECT, INVERSE, NEITHER].filter((x) => x !== a)),
          hints: [L('If one doubles, what happens to the other?', 'ఒకటి రెట్టింపైతే మరొకటి ఏమవుతుంది?')], solution: [L(`${a.en} proportion.`, `${a.te}.`)],
        };
      }),
    ],
  }],
};

const geo3d: USpec = {
  id: 'c8.u.geo-themes', subject: 'math', title: L('Exploring Some Geometric Themes', 'కొన్ని జ్యామితీయ అంశాల అన్వేషణ'), source: src('gp8b', 4, 'Exploring Some Geometric Themes'),
  objectives: [{
    id: 'c8.geo.solids', title: L('Faces, edges, vertices and Euler\'s formula', 'తలాలు, అంచులు, శీర్షాలు మరియు ఆయ్లర్ సూత్రం'), prereqs: [],
    activities: ['game:shapes'],
    intro: [
      p('Solid shapes (polyhedra) have flat faces, straight edges and corner points called vertices.', 'ఘన ఆకారాలకు (బహుముఖులకు) సమతల తలాలు, సరళ అంచులు, శీర్షాలు అనే మూల బిందువులు ఉంటాయి.'),
      f('F + V − E = 2', 'faces plus vertices minus edges equals 2'),
      p('A solid looks different from the front, side and top — these are its views.', 'ఒక ఘనం ముందు నుండి, పక్క నుండి, పై నుండి వేరుగా కనిపిస్తుంది — ఇవే దాని దృశ్యాలు.'),
    ],
    examples: [
      ex(L('A cube: F, V, E?', 'ఘనం (క్యూబ్): F, V, E?'), [L('F = 6, V = 8, E = 12', 'F = 6, V = 8, E = 12'), L('6 + 8 − 12 = 2 ✓', '6 + 8 − 12 = 2 ✓')], L('6, 8, 12', '6, 8, 12')),
      ex(L('A polyhedron has 5 faces and 6 vertices. Edges?', 'ఒక బహుముఖికి 5 తలాలు, 6 శీర్షాలు. అంచులు?'), [L('5 + 6 − E = 2', '5 + 6 − E = 2'), L('E = 9', 'E = 9')], L('9 (a triangular prism)', '9 (త్రిభుజాకార పట్టకం)')),
    ],
    practice: [
      tp('euler', (r) => {
        const solids: [string, string, number, number, number][] = [['cube', 'ఘనం', 6, 8, 12], ['triangular prism', 'త్రిభుజాకార పట్టకం', 5, 6, 9], ['square pyramid', 'చతురస్రాకార పిరమిడ్', 5, 5, 8], ['triangular pyramid', 'త్రిభుజాకార పిరమిడ్', 4, 4, 6], ['pentagonal prism', 'పంచభుజ పట్టకం', 7, 10, 15], ['hexagonal prism', 'షడ్భుజ పట్టకం', 8, 12, 18], ['octahedron', 'అష్టముఖి', 8, 6, 12], ['pentagonal pyramid', 'పంచభుజ పిరమిడ్', 6, 6, 10]];
        const [n, nt, F, V, E] = r.pick(solids);
        const ask = r.pick(['F', 'V', 'E'] as const);
        const known = ask === 'F' ? [`${V} vertices and ${E} edges`, `${V} శీర్షాలు, ${E} అంచులు`] : ask === 'V' ? [`${F} faces and ${E} edges`, `${F} తలాలు, ${E} అంచులు`] : [`${F} faces and ${V} vertices`, `${F} తలాలు, ${V} శీర్షాలు`];
        const what = ask === 'F' ? ['faces', 'తలాల'] : ask === 'V' ? ['vertices', 'శీర్షాల'] : ['edges', 'అంచుల'];
        const ans = ask === 'F' ? F : ask === 'V' ? V : E;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`A ${n} has ${known[0]}. Use Euler's formula to find the number of ${what[0]}.`, `ఒక ${nt} కు ${known[1]} ఉన్నాయి. ఆయ్లర్ సూత్రంతో ${what[1]} సంఖ్య కనుగొనండి.`), answer: num(ans),
          hints: [L('F + V − E = 2', 'F + V − E = 2')], solution: [L(`F + V − E = 2 → ${ask} = ${ans}`, `F + V − E = 2 → ${ask} = ${ans}`)],
        };
      }),
      tp('match', (r) => {
        const all: [ReturnType<typeof L>, ReturnType<typeof L>][] = [
          [L('Cube', 'ఘనం'), L('6 square faces', '6 చతురస్ర తలాలు')], [L('Cylinder', 'స్థూపం'), L('2 circular faces, 1 curved surface', '2 వృత్తాకార తలాలు, 1 వక్ర తలం')],
          [L('Cone', 'శంకువు'), L('1 circular face, 1 vertex', '1 వృత్తాకార తలం, 1 శీర్షం')], [L('Sphere', 'గోళం'), L('no edges, no vertices', 'అంచులు, శీర్షాలు లేవు')],
          [L('Square pyramid', 'చతురస్రాకార పిరమిడ్'), L('1 square + 4 triangular faces', '1 చతురస్రం + 4 త్రిభుజాకార తలాలు')], [L('Triangular prism', 'త్రిభుజాకార పట్టకం'), L('2 triangles + 3 rectangles', '2 త్రిభుజాలు + 3 దీర్ఘచతురస్రాలు')],
        ];
        const set = r.shuffle(all).slice(0, 4);
        return {
          type: 'match', prompt: L(`Match each solid to its description: ${set.map((x) => x[0].en).join(', ')}.`, `ప్రతి ఘనాన్ని దాని వివరణతో జతపరచండి: ${set.map((x) => x[0].te).join(', ')}.`), ...matching(r, set),
          hints: [L('Picture each solid: count flat faces.', 'ప్రతి ఘనాన్ని ఊహించి సమతల తలాలు లెక్కించండి.')], solution: set.map(([a, b]) => L(`${a.en}: ${b.en}`, `${a.te}: ${b.te}`)),
        };
      }),
    ],
  }],
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dots: USpec = {
  id: 'c8.u.dots', subject: 'math', title: L('Tales by Dots and Lines', 'చుక్కలు, గీతలు చెప్పే కథలు'), source: src('gp8b', 5, 'Tales by Dots and Lines'),
  objectives: [{
    id: 'c8.data.graphs', title: L('Reading line graphs and bar graphs; mean and median', 'రేఖా, కమ్మీ రేఖాచిత్రాలు చదవడం; సరాసరి, మధ్యగతం'), prereqs: [],
    intro: [
      p('Line graphs show how a quantity changes over time; bar graphs compare categories.', 'రేఖా చిత్రాలు ఒక రాశి కాలంతో ఎలా మారుతుందో చూపుతాయి; కమ్మీ చిత్రాలు వర్గాలను పోలుస్తాయి.'),
      f('Mean = sum of values ÷ number of values'),
      p('The median is the middle value when the data is arranged in order.', 'దత్తాంశాన్ని క్రమంలో అమర్చినప్పుడు మధ్య విలువే మధ్యగతం.'),
    ],
    examples: [
      ex(L('Temperatures 28, 31, 30, 33, 28 °C. Mean?', 'ఉష్ణోగ్రతలు 28, 31, 30, 33, 28 °C. సరాసరి?'), [L('Sum = 150', 'మొత్తం = 150'), L('150 ÷ 5 = 30 °C', '150 ÷ 5 = 30 °C')], L('30 °C', '30 °C')),
      ex(L('Median of 7, 3, 9, 4, 6?', '7, 3, 9, 4, 6 ల మధ్యగతం?'), [L('Order: 3, 4, 6, 7, 9', 'క్రమం: 3, 4, 6, 7, 9'), L('Middle value = 6', 'మధ్య విలువ = 6')], L('6', '6')),
    ],
    practice: [
      tp('line', (r) => {
        const pts: [number, number][] = [1, 2, 3, 4, 5, 6].map((h) => [h, r.int(20, 40)]);
        const i = r.int(0, 4);
        const rise = pts[i + 1][1] - pts[i][1];
        const city = r.pick(CITIES);
        return {
          type: 'graph', keypad: 'numeric', prompt: L(`The line graph shows the temperature (°C) in ${city} at hourly readings 1–6. By how much did it change from reading ${i + 1} to reading ${i + 2}? (Use a minus sign for a fall.)`, `రేఖా చిత్రం ${city} లో గంటకోసారి తీసిన ఉష్ణోగ్రతలు (°C) 1–6 చూపుతుంది. రీడింగ్ ${i + 1} నుండి ${i + 2} కి ఎంత మారింది? (తగ్గితే మైనస్ గుర్తు వాడండి.)`),
          visual: { kind: 'line-graph', xLabel: 'reading', yLabel: '°C', points: pts }, answer: num(rise),
          hints: [L('Read both points on the y-axis.', 'రెండు బిందువులను y-అక్షంపై చదవండి.'), L('Change = later − earlier.', 'మార్పు = తర్వాతి − ముందరి.')],
          solution: [L(`${pts[i + 1][1]} − ${pts[i][1]} = ${rise}`, `${pts[i + 1][1]} − ${pts[i][1]} = ${rise}`)],
        };
      }),
      tp('mean', (r) => {
        const n = r.int(4, 6);
        const vals = Array.from({ length: n }, () => r.int(10, 50));
        const s = vals.reduce((a, b) => a + b, 0);
        return {
          type: 'graph', keypad: 'numeric', prompt: L('The bar graph shows cycles sold each day by a shop. Find the mean number per day (2 decimal places if needed).', 'కమ్మీ చిత్రం ఒక దుకాణం రోజూ అమ్మిన సైకిళ్ళను చూపుతుంది. రోజుకు సరాసరి కనుగొనండి (అవసరమైతే 2 దశాంశ స్థానాలు).'),
          visual: { kind: 'bar-graph', labels: DAYS.slice(0, n), values: vals, unit: 'cycles' }, answer: approx(rd(s / n, 2), 0.003),
          hints: [L('Add all bar heights.', 'అన్ని కమ్మీల ఎత్తులు కూడండి.'), L(`Divide by ${n}.`, `${n} తో భాగించండి.`)], solution: [L(`Sum = ${s}`, `మొత్తం = ${s}`), L(`Mean = ${s} ÷ ${n} = ${rd(s / n, 2)}`, `సరాసరి = ${s} ÷ ${n} = ${rd(s / n, 2)}`)],
        };
      }, 2),
      tp('median', (r) => {
        const vals = Array.from({ length: r.pick([5, 7]) }, () => r.int(1, 60));
        const sorted = [...vals].sort((a, b) => a - b);
        const med = sorted[(sorted.length - 1) / 2];
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Find the median of: ${vals.join(', ')}.`, `మధ్యగతం కనుగొనండి: ${vals.join(', ')}.`), answer: num(med),
          hints: [L('Arrange in increasing order first.', 'మొదట ఆరోహణ క్రమంలో అమర్చండి.'), L('Pick the middle value.', 'మధ్య విలువను ఎంచుకోండి.')],
          mistakes: [{ when: String(vals[(vals.length - 1) / 2]), explain: L('Sort the data before choosing the middle value.', 'మధ్య విలువను ఎంచుకునే ముందు దత్తాంశాన్ని క్రమంలో అమర్చండి.') }],
          solution: [L(`Sorted: ${sorted.join(', ')}`, `క్రమంలో: ${sorted.join(', ')}`), L(`Median = ${med}`, `మధ్యగతం = ${med}`)],
        };
      }),
    ],
  }],
};

const algplay: USpec = {
  id: 'c8.u.algplay', subject: 'math', title: L('Algebra Play', 'బీజగణితంతో ఆట'), source: src('gp8b', 6, 'Algebra Play'),
  objectives: [{
    id: 'c8.alg.equations', title: L('Solving linear equations and number tricks', 'రేఖీయ సమీకరణాల సాధన, సంఖ్యా మాయలు'), prereqs: ['c8.alg.expand'],
    activities: ['game:balance'],
    intro: [
      p('An equation is a balance: do the same thing to both sides to keep it balanced.', 'సమీకరణం ఒక త్రాసు: సమతుల్యత ఉండాలంటే రెండు వైపులా ఒకే పని చేయాలి.'),
      stepsB(L('Expand brackets.', 'బ్రాకెట్లు విస్తరించండి.'), L('Collect x-terms on one side, numbers on the other.', 'x పదాలు ఒక వైపు, సంఖ్యలు మరో వైపు చేర్చండి.'), L('Divide by the coefficient of x.', 'x గుణకంతో భాగించండి.')),
      tip('Many "think of a number" tricks work because of algebra: the x cancels out!', '"ఒక సంఖ్యను ఊహించుకో" మాయలు బీజగణితం వల్లే పనిచేస్తాయి: x రద్దవుతుంది!'),
    ],
    examples: [
      ex(L('Solve 3(x − 2) = 2x + 5.', '3(x − 2) = 2x + 5 సాధించండి.'), [L('3x − 6 = 2x + 5', '3x − 6 = 2x + 5'), L('x = 11', 'x = 11')], L('x = 11', 'x = 11')),
      ex(L('Think of a number, add 5, double it, subtract 10, halve it. Why do you get your number back?', 'ఒక సంఖ్యను ఊహించి, 5 కలిపి, రెట్టింపు చేసి, 10 తీసివేసి, సగం చేయండి. మళ్ళీ అదే సంఖ్య ఎందుకు వస్తుంది?'), [L('x → x + 5 → 2x + 10 → 2x → x', 'x → x + 5 → 2x + 10 → 2x → x')], L('Every step is undone', 'ప్రతి అడుగు తిరగబడుతుంది')),
    ],
    practice: [
      tp('solve', (r) => {
        const x = r.int(-6, 12), a = r.int(2, 7), b = r.int(1, a - 1 || 1), c = r.int(-9, 9);
        const d = a * x + c - b * x;
        const eq = `${a}x ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${b === 1 ? '' : b}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Solve for x: ${eq}`, `x విలువ కనుగొనండి: ${eq}`), answer: num(x),
          hints: [L(`Subtract ${b === 1 ? '' : b}x from both sides.`, `రెండు వైపులా ${b === 1 ? '' : b}x తీసివేయండి.`), L(`Then move ${c} to the right side.`, `తర్వాత ${c} ను కుడి వైపుకు మార్చండి.`)],
          solution: [L(`${a - b}x = ${d} − (${c}) = ${d - c}`, `${a - b}x = ${d} − (${c}) = ${d - c}`), L(`x = ${x}`, `x = ${x}`)],
        };
      }),
      tp('age', (r) => {
        const s = r.int(5, 14), k = r.int(2, 4), y = r.int(3, 10);
        const n = r.pick(NAMES);
        const tot = (k + 1) * s + 2 * y;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${n.en}'s mother is ${k} times as old as ${n.en}. In ${y} years the sum of their ages will be ${tot}. How old is ${n.en} now?`, `${n.te} తల్లి వయస్సు ${n.te} వయస్సుకు ${k} రెట్లు. ${y} సంవత్సరాల తర్వాత వారి వయస్సుల మొత్తం ${tot}. ఇప్పుడు ${n.te} వయస్సు ఎంత?`), answer: num(s),
          steps: [{ prompt: L(`Let x be ${n.en}'s age. Solve ${k + 1}x + ${2 * y} = ${tot} for x.`, `${n.te} వయస్సు x అనుకోండి. ${k + 1}x + ${2 * y} = ${tot} నుండి x కనుగొనండి.`), answer: num(s) }],
          hints: [L(`Let ${n.en}'s age be x; mother is ${k}x.`, `${n.te} వయస్సు x; తల్లి వయస్సు ${k}x.`), L(`(x + ${y}) + (${k}x + ${y}) = ${tot}`, `(x + ${y}) + (${k}x + ${y}) = ${tot}`)],
          solution: [L(`${k + 1}x + ${2 * y} = ${tot}`, `${k + 1}x + ${2 * y} = ${tot}`), L(`${k + 1}x = ${(k + 1) * s}`, `${k + 1}x = ${(k + 1) * s}`), L(`x = ${s}`, `x = ${s}`)],
        };
      }, 2),
    ],
  }],
};

const area: USpec = {
  id: 'c8.u.area', subject: 'math', title: L('Area', 'వైశాల్యం'), source: src('gp8b', 7, 'Area'),
  objectives: [{
    id: 'c8.area.polygons', title: L('Area of trapeziums, rhombuses and polygons', 'సమలంబ చతుర్భుజాలు, రాంబస్‌లు, బహుభుజుల వైశాల్యం'), prereqs: ['c8.quad.props'],
    intro: [
      f('Trapezium: A = ½ × (sum of parallel sides) × height'),
      f('Rhombus / kite: A = ½ × d₁ × d₂'),
      p('Any polygon can be split into triangles and rectangles; add their areas.', 'ఏ బహుభుజినైనా త్రిభుజాలు, దీర్ఘచతురస్రాలుగా విభజించి వాటి వైశాల్యాలు కూడవచ్చు.'),
    ],
    examples: [
      ex(L('Trapezium with parallel sides 10 m and 6 m, height 4 m.', 'సమాంతర భుజాలు 10 మీ, 6 మీ, ఎత్తు 4 మీ గల సమలంబ చతుర్భుజం.'), [L('½ × (10 + 6) × 4', '½ × (10 + 6) × 4'), L('= 32 m²', '= 32 మీ²')], L('32 m²', '32 మీ²')),
      ex(L('Rhombus with diagonals 12 cm and 8 cm.', 'కర్ణాలు 12 సెం.మీ, 8 సెం.మీ గల రాంబస్.'), [L('½ × 12 × 8 = 48', '½ × 12 × 8 = 48')], L('48 cm²', '48 సెం.మీ²')),
    ],
    practice: [
      tp('trap', (r) => {
        const a = r.int(4, 20), b = r.int(3, 15), h = r.pick([2, 4, 5, 6, 8, 10]);
        const A = ((a + b) * h) / 2;
        return {
          type: 'typed', keypad: 'units', unitHint: 'm²', prompt: L(`A field is a trapezium with parallel sides ${a} m and ${b} m, ${h} m apart. Find its area.`, `ఒక పొలం సమలంబ చతుర్భుజాకారం: సమాంతర భుజాలు ${a} మీ, ${b} మీ, వాటి మధ్య దూరం ${h} మీ. వైశాల్యం కనుగొనండి.`), answer: num(A, 'm^2'),
          hints: [L('A = ½ × (a + b) × h', 'A = ½ × (a + b) × h')],
          mistakes: [{ when: String((a + b) * h), explain: L('Remember the ½.', '½ ను మరచిపోకండి.') }, { when: 'wrong-unit', explain: L('Area is in square units, e.g. m².', 'వైశాల్యం చదరపు ప్రమాణాల్లో ఉంటుంది, ఉదా. మీ².') }],
          solution: [L(`½ × (${a} + ${b}) × ${h} = ${A} m²`, `½ × (${a} + ${b}) × ${h} = ${A} మీ²`)],
        };
      }),
      tp('rhombus', (r) => {
        const d1 = r.pick([6, 8, 10, 12, 14, 16, 20]), d2 = r.pick([4, 5, 6, 9, 10, 15]);
        return {
          type: 'typed', keypad: 'units', unitHint: 'cm²', prompt: L(`Find the area of a rhombus with diagonals ${d1} cm and ${d2} cm.`, `కర్ణాలు ${d1} సెం.మీ, ${d2} సెం.మీ గల రాంబస్ వైశాల్యం కనుగొనండి.`), answer: num((d1 * d2) / 2, 'cm^2'),
          hints: [L('A = ½ × d₁ × d₂', 'A = ½ × d₁ × d₂')], mistakes: [{ when: String(d1 * d2), explain: L('Half the product of the diagonals.', 'కర్ణాల లబ్ధంలో సగం.') }], solution: [L(`½ × ${d1} × ${d2} = ${(d1 * d2) / 2} cm²`, `½ × ${d1} × ${d2} = ${(d1 * d2) / 2} సెం.మీ²`)],
        };
      }),
      tp('lshape', (r) => {
        const W = r.int(6, 12), H = r.int(6, 12), w = r.int(2, W - 2), h = r.int(2, H - 2);
        const cells: [number, number][] = [];
        for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (!(x >= W - w && y < h)) cells.push([x, y]);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`An L-shaped room is a ${W} m × ${H} m rectangle with a ${w} m × ${h} m corner removed. Find its area in m².`, `L-ఆకార గది ${W} మీ × ${H} మీ దీర్ఘచతురస్రం నుండి ${w} మీ × ${h} మీ మూల తీసివేసినది. వైశాల్యం (మీ² లో) కనుగొనండి.`), visual: { kind: 'grid-shape', cells, cols: W, rows: H }, answer: num(W * H - w * h, 'm^2'),
          hints: [L('Big rectangle minus the missing corner.', 'పెద్ద దీర్ఘచతురస్రం − తీసివేసిన మూల.')], solution: [L(`${W * H} − ${w * h} = ${W * H - w * h} m²`, `${W * H} − ${w * h} = ${W * H - w * h} మీ²`)],
        };
      }, 2),
    ],
  }],
};

// ------------------------------------------------------------------ PHYSICS (Curiosity)
const elec: USpec = {
  id: 'c8.u.elec', subject: 'physics', title: 'Electricity: Magnetic and Heating Effects', source: src('cu8', 4, 'Electricity: Magnetic and Heating Effects'),
  objectives: [{
    id: 'c8.phy.elec-effects', title: 'Heating and magnetic effects of current', prereqs: [],
    activities: ['lab:circuit', 'game:circuits'],
    intro: [
      p('When current flows through a wire it heats up — used in heaters, irons and kettles. Too much heating is dangerous, so circuits have fuses or MCBs.'),
      p('A current also makes a magnetic field. A coil of wire around an iron nail becomes an electromagnet that can be switched on and off.'),
      act('lab:circuit?cells=2&bulbs=1&closed=1', 'Close the circuit in the Circuit Lab and watch the bulb glow'),
      tip('More cells → more current → brighter bulb and a stronger electromagnet.'),
    ],
    examples: [
      ex('Why does an electric iron get hot?', ['Current flows through its high-resistance element', 'Electrical energy changes to heat'], 'Heating effect of current'),
      ex('How can you make an electromagnet stronger?', ['Increase the number of turns of the coil', 'Increase the current (more cells)', 'Use a soft-iron core'], 'More turns, more current, iron core'),
    ],
    practice: [
      tp('which', (r) => {
        const all = [
          { label: 'Electric kettle', ok: true }, { label: 'Toaster', ok: true }, { label: 'Room heater', ok: true }, { label: 'Electric iron', ok: true }, { label: 'Fuse wire', ok: true },
          { label: 'Electric bell', ok: false }, { label: 'Electromagnetic crane', ok: false }, { label: 'Compass needle', ok: false }, { label: 'Loudspeaker', ok: false },
        ];
        const pick = r.shuffle(all).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick[0] = all[0];
        if (pick.every((x) => x.ok)) pick[4] = all[5];
        return { type: 'tap', prompt: 'Tap every device that mainly uses the HEATING effect of current.', ...tapAll(r, pick), hints: ['Does its job need heat?'], solution: [`Heating effect: ${pick.filter((x) => x.ok).map((x) => x.label).join(', ')}`] };
      }),
      tp('facts', (r) => {
        const qs: [string, string, string[]][] = [
          ['What happens to a fuse wire when too much current flows?', 'It melts and breaks the circuit', ['It glows like a bulb', 'It becomes a magnet', 'It increases the current']],
          ['An electromagnet loses its magnetism when…', 'the current is switched off', ['more cells are added', 'the coil has more turns', 'an iron core is used']],
          ['Which material makes the best core for an electromagnet?', 'Soft iron', ['Copper', 'Plastic', 'Wood']],
          ['Why are heater elements made of nichrome?', 'High resistance and high melting point', ['It is a magnet', 'It conducts no electricity', 'It is cheap plastic']],
          ['A compass needle near a current-carrying wire…', 'deflects', ['stays still', 'melts', 'glows']],
          ['MCB stands for…', 'Miniature Circuit Breaker', ['Main Current Battery', 'Magnetic Coil Bulb', 'Metal Current Barrier']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Think: heating or magnetic effect?'], solution: [a] };
      }),
      tp('cells', (r) => {
        const n = r.int(1, 4), turns = r.pick([10, 20, 30, 50]);
        const k = r.int(2, 3);
        return {
          type: 'typed', keypad: 'numeric', prompt: `An electromagnet with ${turns} turns and ${n} cell${n > 1 ? 's' : ''} picks up ${n * turns / 10 * 2} pins. If the number of turns becomes ${k} times as many (same cells), and the pins picked up are roughly proportional to turns, about how many pins will it pick up?`,
          answer: num(k * (n * turns / 10) * 2),
          hints: ['More turns → stronger magnet.', `Multiply by ${k}.`], solution: [`${n * turns / 10 * 2} × ${k} = ${k * (n * turns / 10) * 2} pins`],
        };
      }),
    ],
  }],
};

const forces: USpec = {
  id: 'c8.u.forces', subject: 'physics', title: 'Exploring Forces', source: src('cu8', 5, 'Exploring Forces'),
  objectives: [{
    id: 'c8.phy.forces', title: 'Net force, contact and non-contact forces, friction', prereqs: [],
    activities: ['lab:forces'],
    intro: [
      p('A force is a push or a pull. It can start or stop motion, change speed or direction, or change shape. Forces are measured in newtons (N).'),
      p('Contact forces need touching (muscular force, friction). Non-contact forces act at a distance (magnetic, electrostatic, gravitational).'),
      p('Forces in the same direction add; in opposite directions, subtract. The result is the net force.'),
      act('lab:forces?mass=5&force=20&friction=0', 'Forces Lab: push a 5 kg box with 20 N, no friction'),
      act('lab:forces?mass=5&force=20&friction=0.3', 'Now add friction (0.3) — what changes?'),
    ],
    examples: [
      ex('Two children push a cart: 40 N and 25 N in the same direction. Net force?', ['Same direction → add', '40 + 25 = 65 N'], '65 N'),
      ex('Tug of war: team A pulls 300 N left, team B 260 N right. Net force?', ['Opposite → subtract', '300 − 260 = 40 N towards A (left)'], '40 N to the left'),
    ],
    practice: [
      tp('net', (r) => {
        const a = r.int(10, 90), b = r.int(10, 90);
        const same = r.next() < 0.5;
        const ans = same ? a + b : Math.abs(a - b);
        return {
          type: 'typed', keypad: 'units', unitHint: 'N', prompt: `Two forces of ${a} N and ${b} N act on a box in ${same ? 'the same direction' : 'opposite directions'}. Find the size of the net force.`,
          answer: num(ans, 'N', true),
          hints: [same ? 'Same direction: add.' : 'Opposite directions: subtract the smaller from the larger.', 'Include the unit N.'],
          mistakes: [{ when: 'missing-unit', explain: 'Forces are measured in newtons — add N.' }, { when: 'wrong-unit', explain: 'Force is measured in newtons (N), not kg or m.' }, { when: `${same ? Math.abs(a - b) : a + b} N`, explain: same ? 'Forces in the same direction add up.' : 'Opposite forces partly cancel — subtract.' }],
          solution: [same ? `${a} + ${b} = ${ans} N` : `${Math.max(a, b)} − ${Math.min(a, b)} = ${ans} N`],
        };
      }),
      tp('classify', (r) => {
        const all: [string, string][] = [['Magnet pulling a pin', 'Non-contact'], ['Pushing a door', 'Contact'], ['An apple falling to the ground', 'Non-contact'], ['Brakes stopping a cycle', 'Contact'], ['A charged comb attracting paper bits', 'Non-contact'], ['Kicking a football', 'Contact'], ['Rubbing hands to warm them', 'Contact']];
        const [q, a] = r.pick(all);
        return { type: 'mcq', prompt: `${q}: what kind of force?`, ...choose(r, a, ['Contact', 'Non-contact'].filter((x) => x !== a)), hints: ['Do the objects touch?'], solution: [`${a} force.`] };
      }),
      tp('friction', (r) => {
        const qs: [string, string, string[]][] = [
          ['Which surface gives the most friction for a rolling marble?', 'Carpet', ['Glass', 'Polished floor', 'Ice']],
          ['Why are tyres treaded?', 'To increase friction and grip', ['To reduce friction', 'To look nice', 'To make them lighter']],
          ['Why do we oil a squeaky hinge?', 'To reduce friction', ['To increase friction', 'To add weight', 'To make it magnetic']],
          ['Which is usually smallest for the same object?', 'Rolling friction', ['Sliding friction', 'Static friction', 'They are always equal']],
          ['Why are ball bearings used in cycle wheels?', 'Rolling reduces friction', ['They add friction', 'They make a magnetic force', 'They hold air']],
        ];
        const [q, a, w] = r.pick(qs);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: ['Rough surfaces → more friction; rolling and lubricants → less.'], solution: [a] };
      }),
    ],
  }],
};

const pressure: USpec = {
  id: 'c8.u.pressure', subject: 'physics', title: 'Pressure, Winds, Storms, and Cyclones', source: src('cu8', 6, 'Pressure, Winds, Storms, and Cyclones'),
  objectives: [{
    id: 'c8.phy.pressure', title: 'Pressure = force ÷ area', prereqs: ['c8.phy.forces'],
    activities: ['lab:forces'],
    intro: [
      p('Pressure is the force acting on each unit of area. The same force on a smaller area gives more pressure — that is why knives are sharp and camels have wide feet.'),
      f('P = F / A', 'pressure equals force divided by area'),
      p('The SI unit is the pascal: 1 Pa = 1 N/m². Air pressure differences cause winds; very low pressure at the centre of a cyclone draws in fast winds.'),
    ],
    examples: [
      ex('A 600 N box rests on 2 m². Pressure?', ['P = 600 ÷ 2', '= 300 Pa'], '300 Pa'),
      ex('Why do school bags have broad straps?', ['Larger area', 'Same weight → less pressure on shoulders'], 'Broad straps reduce pressure'),
    ],
    practice: [
      tp('calc', (r) => {
        const A = r.pick([0.5, 1, 2, 4, 5, 0.25]), P = r.pick([100, 200, 400, 600, 1000, 1200]);
        const F = P * A;
        const ask = r.pick(['P', 'F'] as const);
        return {
          type: 'typed', keypad: 'units', unitHint: ask === 'P' ? 'Pa' : 'N',
          prompt: ask === 'P' ? `A force of ${F} N acts on an area of ${A} m². Find the pressure.` : `A pressure of ${P} Pa acts on an area of ${A} m². Find the force.`,
          answer: num(ask === 'P' ? P : F, ask === 'P' ? 'Pa' : 'N', true),
          hints: [ask === 'P' ? 'P = F ÷ A' : 'F = P × A', ask === 'P' ? 'Unit: Pa (N/m²)' : 'Unit: N'],
          mistakes: [{ when: 'missing-unit', explain: ask === 'P' ? 'Pressure needs a unit: Pa or N/m².' : 'Force needs a unit: N.' }, { when: 'wrong-unit', explain: ask === 'P' ? 'Pressure is in pascals (Pa) = N/m².' : 'Force is in newtons (N).' }, { when: String(F * A), explain: 'Divide force by area — do not multiply.' }],
          solution: ask === 'P' ? [`P = ${F} ÷ ${A} = ${P} Pa`] : [`F = ${P} × ${A} = ${F} N`],
        };
      }, 2),
      tp('compare', (r) => {
        const W = r.pick([400, 500, 600, 800]);
        const a1 = r.pick([0.02, 0.04, 0.05]), a2 = r.pick([0.1, 0.2, 0.25]);
        return {
          type: 'mcq', prompt: `A ${W} N person stands on (A) one foot of area ${a1} m² or (B) skis of area ${a2} m². Which gives LESS pressure on the snow?`,
          ...choose(r, `B: ${W / a2} Pa`, [`A: ${W / a1} Pa`, 'Both give the same pressure']),
          hints: ['P = F ÷ A; same F.', 'Larger area → smaller pressure.'], solution: [`A: ${W}/${a1} = ${W / a1} Pa`, `B: ${W}/${a2} = ${W / a2} Pa`, 'Skis give less pressure.'],
        };
      }),
      tp('order', (r) => {
        const seq = ['Sea surface heats up strongly', 'Warm moist air rises', 'Low pressure forms over the sea', 'Surrounding air rushes in', 'Winds spin around a calm eye — a cyclone'];
        const o = ordering(r, seq);
        return { type: 'order', prompt: 'Put the steps of cyclone formation in order.', ...o, hints: ['It starts with heat from the Sun.'], solution: seq };
      }),
    ],
  }],
};

const lightC8: USpec = {
  id: 'c8.u.light', subject: 'physics', title: 'Light: Mirrors and Lenses', source: src('cu8', 10, 'Light: Mirrors and Lenses'),
  objectives: [{
    id: 'c8.phy.mirrors', title: 'Laws of reflection, spherical mirrors and lenses', prereqs: [],
    activities: ['lab:light'],
    intro: [
      p('Law of reflection: angle of incidence = angle of reflection, both measured from the normal.'),
      p('Concave mirrors (like a spoon\'s inside) can form real, inverted images; convex mirrors (car side mirrors) always form small, upright images and show a wide view.'),
      p('Convex lenses converge light (magnifying glass); concave lenses spread it out.'),
      act('lab:light?angle=40', 'Light Lab: shine a ray at 40° and measure the reflected angle'),
    ],
    examples: [
      ex('A ray hits a plane mirror at 35° to the normal. Angle of reflection?', ['i = r'], '35°'),
      ex('A ray makes 50° with the mirror surface. Angle of reflection?', ['Angle with normal = 90 − 50 = 40°', 'r = 40°'], '40°'),
    ],
    practice: [
      tp('angle', (r) => {
        const a = r.int(10, 80);
        const fromSurface = r.next() < 0.4;
        const i = fromSurface ? 90 - a : a;
        return {
          type: 'typed', keypad: 'units', unitHint: '°', prompt: fromSurface ? `A ray makes ${a}° with the surface of a plane mirror. Find the angle of reflection.` : `The angle of incidence on a plane mirror is ${a}°. Find the angle of reflection.`,
          answer: num(i, '°'),
          hints: ['Angles are measured from the normal (90° to the mirror).', 'Angle of incidence = angle of reflection.'],
          mistakes: [{ when: String(fromSurface ? a : 90 - a), explain: 'Measure from the normal, not from the mirror surface.' }],
          solution: fromSurface ? [`i = 90 − ${a} = ${i}°`, `r = ${i}°`] : [`r = i = ${i}°`],
        };
      }, 2),
      tp('uses', (r) => {
        const set: [string, string][] = r.shuffle([['Rear-view mirror of a scooter', 'Convex mirror'], ['Dentist\'s mirror', 'Concave mirror'], ['Magnifying glass', 'Convex lens'], ['Torch reflector', 'Concave mirror'], ['Dressing-table mirror', 'Plane mirror'], ['Spectacles for short-sight', 'Concave lens']] as [string, string][]).slice(0, 4);
        if (new Set(set.map((s) => s[1])).size < 4) return { type: 'mcq', prompt: `Which is used in a ${set[0][0].toLowerCase()}?`, ...choose(r, set[0][1], ['Convex mirror', 'Concave mirror', 'Convex lens', 'Plane mirror', 'Concave lens'].filter((x) => x !== set[0][1])), hints: ['Think about the image needed.'], solution: [set[0][1]] };
        return { type: 'match', prompt: `Match each use to the mirror or lens: ${set.map((x) => x[0]).join('; ')}.`, ...matching(r, set), hints: ['Wide view → convex mirror; enlarged close-up → concave mirror or convex lens.'], solution: set.map(([a, b]) => `${a}: ${b}`) };
      }),
    ],
  }],
};

export default buildClass(10, [squares, power, story, quads, numplay, distribute, prop1, percent, pyth, prop2, geo3d, dots, algplay, area, elec, forces, pressure, lightC8, ...tsClass8]);

