// Class 3 — CBSE Mathematics (NCERT Maths Mela, Class 3) and age-appropriate physical-science exploration.
// Telugu (te) is provided for all learner-facing text (needs native-speaker review).
import {
  buildClass, src, tp, ex, p, tip, vis, act, num, choose, chooseNum, pictures, matching, ordering, tapAll,
  L, NAMES, THINGS, range, type USpec,
} from '../lib/kit';
import type { Localized, VisualSpec } from '../../shared/content';
import { tsClass3 } from '../ts/c3';

const SHAPE_TE: Record<string, string> = {
  circle: 'వృత్తం', square: 'చతురస్రం', triangle: 'త్రిభుజం', rectangle: 'దీర్ఘచతురస్రం', pentagon: 'పంచభుజి', hexagon: 'షడ్భుజి',
};
const CORNERS: Record<string, number> = { circle: 0, triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 };
const DAYS: Localized[] = [L('Monday', 'సోమవారం'), L('Tuesday', 'మంగళవారం'), L('Wednesday', 'బుధవారం'), L('Thursday', 'గురువారం'), L('Friday', 'శుక్రవారం'), L('Saturday', 'శనివారం'), L('Sunday', 'ఆదివారం')];
const MONTHS: Localized[] = [
  L('January', 'జనవరి'), L('February', 'ఫిబ్రవరి'), L('March', 'మార్చి'), L('April', 'ఏప్రిల్'), L('May', 'మే'), L('June', 'జూన్'),
  L('July', 'జూలై'), L('August', 'ఆగస్టు'), L('September', 'సెప్టెంబర్'), L('October', 'అక్టోబర్'), L('November', 'నవంబర్'), L('December', 'డిసెంబర్'),
];
const digits = (n: number) => String(n).padStart(3, '0').split('').map(Number);
/** column addition ignoring carries — a common mistake */
const noCarry = (a: number, b: number) => { const x = digits(a), y = digits(b); return +x.map((d, i) => (d + y[i]) % 10).join(''); };
/** "subtract smaller digit from bigger" mistake */
const smallFromBig = (a: number, b: number) => { const x = digits(a), y = digits(b); return +x.map((d, i) => Math.abs(d - y[i])).join(''); };
const tally = (n: number) => `${'卌 '.repeat(Math.floor(n / 5))}${'|'.repeat(n % 5)}`.trim();
const pad2 = (m: number) => String(m).padStart(2, '0');

// ================================================================ MATHS
const name: USpec = {
  id: 'c3.u.name', subject: 'math', title: L("What's in a Name?", 'పేరులో ఏముంది?'), source: src('mm3', 1, "What's in a Name?"),
  note: 'Chapter 1 title needs educator verification.',
  objectives: [{
    id: 'c3.name.tally', title: L('Counting with tally marks', 'టాలీ గుర్తులతో లెక్కించడం'),
    activities: ['game:counting'],
    intro: [
      p('When we count many things quickly, we draw one line for each thing. Every fifth line crosses the four before it: 卌 means 5.', 'చాలా వస్తువులను త్వరగా లెక్కించడానికి ఒక్కో వస్తువుకు ఒక గీత గీస్తాం. ఐదో గీత ముందు నాలుగు గీతలను అడ్డంగా కొడుతుంది: 卌 అంటే 5.'),
      p('To read a tally, count the bundles of 5 first, then add the single lines.', 'టాలీ చదవడానికి ముందు 5ల కట్టలను లెక్కించి, తర్వాత ఒంటరి గీతలను కలుపు.'),
      tip('Count in fives: 5, 10, 15, 20 …', 'ఐదుల చొప్పున లెక్కించు: 5, 10, 15, 20 …'),
    ],
    examples: [
      ex(L('How many marks: 卌 卌 |||?', '卌 卌 ||| — ఎన్ని గీతలు?'), [L('Two bundles of 5 make 10.', 'రెండు 5ల కట్టలు = 10.'), L('3 more lines: 10 + 3 = 13.', 'ఇంకా 3 గీతలు: 10 + 3 = 13.')], L('13', '13'), { kind: 'emoji', text: '卌 卌 |||' }),
      ex(L('How many letters are in the name KAVYA?', 'KAVYA అనే పేరులో ఎన్ని అక్షరాలు?'), [L('K-A-V-Y-A: point and count each letter.', 'K-A-V-Y-A: ఒక్కో అక్షరాన్ని చూపిస్తూ లెక్కించు.')], L('5 letters', '5 అక్షరాలు')),
    ],
    practice: [
      tp('read', (r) => {
        const n = r.int(6, 28);
        return {
          type: 'count', keypad: 'numeric', prompt: L('Count the tally marks. Each 卌 means 5. How many?', 'టాలీ గుర్తులను లెక్కించు. ప్రతి 卌 అంటే 5. మొత్తం ఎన్ని?'),
          visual: { kind: 'emoji', text: tally(n) }, answer: num(n),
          hints: [L('Count the bundles of 5 first.', 'ముందు 5ల కట్టలను లెక్కించు.'), L(`There are ${Math.floor(n / 5)} bundles of 5.`, `${Math.floor(n / 5)} ఐదుల కట్టలు ఉన్నాయి.`)],
          mistakes: [{ when: String(Math.floor(n / 5) * 4 + (n % 5)), explain: L('Each bundle 卌 has 5 lines — the crossing line counts too.', 'ప్రతి 卌 కట్టలో 5 గీతలు — అడ్డ గీత కూడా లెక్కలోకి వస్తుంది.') }],
          solution: [L(`${Math.floor(n / 5)} × 5 = ${Math.floor(n / 5) * 5}`, `${Math.floor(n / 5)} × 5 = ${Math.floor(n / 5) * 5}`), L(`${Math.floor(n / 5) * 5} + ${n % 5} = ${n}`, `${Math.floor(n / 5) * 5} + ${n % 5} = ${n}`)],
        };
      }),
      tp('letters', (r) => {
        const nm = r.pick(NAMES);
        const word = nm.en.toUpperCase();
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`How many letters are in the name ${word}?`, `${word} (${nm.te}) అనే పేరులో ఎన్ని ఇంగ్లీష్ అక్షరాలు ఉన్నాయి?`),
          answer: num(word.length),
          hints: [L('Point to each letter and count.', 'ఒక్కో అక్షరాన్ని చూపిస్తూ లెక్కించు.'), L('You can draw one tally line for each letter.', 'ఒక్కో అక్షరానికి ఒక టాలీ గీత గీయవచ్చు.')],
          solution: [L(`${word.split('').join('-')}`, `${word.split('').join('-')}`), L(`${word.length} letters`, `${word.length} అక్షరాలు`)],
        };
      }),
      tp('make', (r) => {
        const n = r.int(7, 23);
        const c = choose(r, tally(n), [tally(n + 1), tally(n - 1), tally(n + 5)]);
        return {
          type: 'mcq', prompt: L(`Which tally shows ${n}?`, `${n}ని చూపే టాలీ ఏది?`), ...c,
          hints: [L(`${n} = ${Math.floor(n / 5)} fives and ${n % 5} more.`, `${n} = ${Math.floor(n / 5)} ఐదులు, ఇంకా ${n % 5}.`), L('Count each choice in fives.', 'ప్రతి ఎంపికను ఐదుల చొప్పున లెక్కించు.')],
          solution: [L(`${tally(n)} = ${n}`, `${tally(n)} = ${n}`)],
        };
      }),
    ],
  }],
};

const SOLIDS: { en: string; te: string; objs: Localized[]; faces: number; rolls: boolean }[] = [
  { en: 'sphere', te: 'గోళం', objs: [L('ball', 'బంతి'), L('laddoo', 'లడ్డూ'), L('orange', 'నారింజ')], faces: 0, rolls: true },
  { en: 'cube', te: 'ఘనం', objs: [L('dice', 'పాచిక'), L('sugar cube', 'చక్కెర ముక్క')], faces: 6, rolls: false },
  { en: 'cylinder', te: 'స్థూపం', objs: [L('tin can', 'డబ్బా'), L('candle', 'కొవ్వొత్తి'), L('water pipe', 'నీటి పైపు')], faces: 2, rolls: true },
  { en: 'cone', te: 'శంఖువు', objs: [L('party cap', 'పార్టీ టోపీ'), L('ice-cream cone', 'ఐస్‌క్రీమ్ కోన్'), L('funnel', 'గరాటు')], faces: 1, rolls: true },
  { en: 'cuboid', te: 'దీర్ఘఘనం', objs: [L('brick', 'ఇటుక'), L('matchbox', 'అగ్గిపెట్టె'), L('book', 'పుస్తకం')], faces: 6, rolls: false },
];
const toy: USpec = {
  id: 'c3.u.toy', subject: 'math', title: L('Toy Joy', 'బొమ్మల ఆనందం'), source: src('mm3', 2, 'Toy Joy'),
  objectives: [{
    id: 'c3.toy.solids', title: L('Solid shapes around us', 'మన చుట్టూ ఘన ఆకారాలు'),
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('Many toys and things at home have solid shapes: a ball is a sphere, a dice is a cube, a tin is a cylinder, a party cap is a cone and a brick is a cuboid.', 'ఇంట్లో చాలా వస్తువులకు ఘన ఆకారాలు ఉంటాయి: బంతి గోళం, పాచిక ఘనం, డబ్బా స్థూపం, పార్టీ టోపీ శంఖువు, ఇటుక దీర్ఘఘనం.'),
      p('Some shapes roll (sphere, cylinder, cone). Shapes with only flat faces slide and can be stacked.', 'కొన్ని ఆకారాలు దొర్లుతాయి (గోళం, స్థూపం, శంఖువు). చదునైన ముఖాలు మాత్రమే ఉన్నవి జారుతాయి, ఒకదానిపై ఒకటి పేర్చవచ్చు.'),
      tip('Trace the flat face of a box on paper — you get a rectangle!', 'పెట్టె చదునైన ముఖాన్ని కాగితంపై గీస్తే దీర్ఘచతురస్రం వస్తుంది!'),
    ],
    examples: [
      ex(L('What shape is a laddoo?', 'లడ్డూ ఏ ఆకారం?'), [L('It is round all over and has no flat face.', 'అది అన్ని వైపులా గుండ్రంగా ఉంటుంది, చదునైన ముఖం లేదు.')], L('Sphere', 'గోళం')),
      ex(L('How many flat faces does a dice have?', 'పాచికకు ఎన్ని చదునైన ముఖాలు?'), [L('Count the sides with dots: 1, 2, 3, 4, 5, 6.', 'చుక్కలున్న వైపులు లెక్కించు: 1, 2, 3, 4, 5, 6.')], L('6 faces', '6 ముఖాలు')),
    ],
    practice: [
      tp('match', (r) => {
        const set = r.shuffle(SOLIDS).slice(0, 4);
        const pairs: [Localized, Localized][] = set.map((s) => [r.pick(s.objs), L(s.en, s.te)]);
        return {
          type: 'match', prompt: L(`Match each object to its shape: ${pairs.map((x) => x[0].en).join(', ')}.`, `ప్రతి వస్తువును దాని ఆకారంతో జత చేయి: ${pairs.map((x) => x[0].te).join(', ')}.`), ...matching(r, pairs),
          hints: [L('Does it roll? Does it have a point on top?', 'అది దొర్లుతుందా? పైన మొన ఉందా?'), L('A round ball-like thing is a sphere.', 'బంతి లాంటిది గోళం.')],
          solution: pairs.map(([a, b]) => L(`${a.en} → ${b.en}`, `${a.te} → ${b.te}`)),
        };
      }),
      tp('roll', (r) => {
        const pool = SOLIDS.flatMap((s) => s.objs.map((o) => ({ label: o, ok: s.rolls })));
        let pick = r.shuffle(pool).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick = [pool[0], ...pick.slice(1)];
        if (pick.every((x) => x.ok)) pick = [...pick.slice(0, 4), pool[3]];
        return {
          type: 'tap', prompt: L('Tap every object that can roll.', 'దొర్లగల ప్రతి వస్తువును నొక్కు.'), ...tapAll(r, pick),
          hints: [L('Things with a curved surface can roll.', 'వంపు ఉపరితలం ఉన్నవి దొర్లుతాయి.'), L('Boxes and bricks only slide.', 'పెట్టెలు, ఇటుకలు జారుతాయి మాత్రమే.')],
          solution: [L(`These roll: ${pick.filter((x) => x.ok).map((x) => x.label.en).join(', ')}`, `ఇవి దొర్లుతాయి: ${pick.filter((x) => x.ok).map((x) => x.label.te).join(', ')}`)],
        };
      }),
      tp('faces', (r) => {
        const s = r.pick(SOLIDS);
        const o = r.pick(s.objs);
        return {
          type: 'mcq', prompt: L(`A ${o.en} is shaped like a ${s.en}. How many flat faces does it have?`, `${o.te} ${s.te} ఆకారంలో ఉంటుంది. దానికి ఎన్ని చదునైన ముఖాలు?`),
          ...chooseNum(r, s.faces, [0, 1, 2, 6, 4]),
          hints: [L('Imagine putting it on a table — which sides can sit flat?', 'దాన్ని బల్ల మీద పెట్టినట్టు ఊహించు — ఏ వైపులు చదునుగా కూర్చుంటాయి?')],
          solution: [L(`A ${s.en} has ${s.faces} flat face${s.faces === 1 ? '' : 's'}.`, `${s.te}కు ${s.faces} చదునైన ముఖాలు.`)],
        };
      }),
    ],
  }],
};

const century: USpec = {
  id: 'c3.u.century', subject: 'math', title: L('Double Century', 'డబుల్ సెంచరీ'), source: src('mm3', 3, 'Double Century'),
  objectives: [{
    id: 'c3.num.to200', title: L('Numbers up to 200', '200 వరకు సంఖ్యలు'),
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('Ten ones make a ten. Ten tens make a hundred. 200 is two hundreds — a "double century".', 'పది ఒకట్లు ఒక పది. పది పదులు ఒక వంద. 200 అంటే రెండు వందలు — "డబుల్ సెంచరీ".'),
      vis({ kind: 'number-line', from: 100, to: 200, step: 10, marks: [150] }, 'Number line from 100 to 200 with 150 marked', '100 నుండి 200 వరకు సంఖ్యా రేఖ, 150 గుర్తించబడింది'),
      tip('Bundles of 10 sticks make counting large numbers easy.', '10 పుల్లల కట్టలు పెద్ద సంఖ్యలను లెక్కించడాన్ని సులువు చేస్తాయి.'),
    ],
    examples: [
      ex(L('14 bundles of 10 sticks and 6 loose sticks. How many sticks?', '10 పుల్లల 14 కట్టలు, 6 విడి పుల్లలు. మొత్తం ఎన్ని?'), [L('14 tens = 140', '14 పదులు = 140'), L('140 + 6 = 146', '140 + 6 = 146')], L('146', '146')),
      ex(L('Count on by 10s from 160.', '160 నుండి 10ల చొప్పున లెక్కించు.'), [L('160, 170, 180, 190, 200', '160, 170, 180, 190, 200')], L('200 comes after 190', '190 తర్వాత 200')),
    ],
    practice: [
      tp('bundles', (r) => {
        const t = r.int(10, 19), o = r.int(0, 9);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${t} bundles of 10 sticks and ${o} loose sticks. How many sticks in all?`, `10 పుల్లల ${t} కట్టలు, ${o} విడి పుల్లలు. మొత్తం ఎన్ని పుల్లలు?`),
          answer: num(t * 10 + o),
          hints: [L(`${t} tens = ${t * 10}`, `${t} పదులు = ${t * 10}`), L('Now add the loose sticks.', 'ఇప్పుడు విడి పుల్లలను కలుపు.')],
          mistakes: [{ when: String(t + o), explain: L('Each bundle has 10 sticks, so count the bundles in tens.', 'ప్రతి కట్టలో 10 పుల్లలు, కాబట్టి కట్టలను పదుల్లో లెక్కించు.') }],
          solution: [L(`${t} × 10 = ${t * 10}`, `${t} × 10 = ${t * 10}`), L(`${t * 10} + ${o} = ${t * 10 + o}`, `${t * 10} + ${o} = ${t * 10 + o}`)],
        };
      }),
      tp('line', (r) => {
        const n = r.int(21, 39) * 5;
        return {
          type: 'number-line', line: { from: 100, to: 200, step: 5 }, prompt: L(`Show ${n} on the number line.`, `సంఖ్యా రేఖపై ${n}ని చూపించు.`), answer: num(n),
          hints: [L('Find the nearest ten first.', 'ముందు దగ్గరి పదిని కనుక్కో.'), L(`${n} is between ${Math.floor(n / 10) * 10} and ${Math.floor(n / 10) * 10 + 10}.`, `${n} అనేది ${Math.floor(n / 10) * 10}, ${Math.floor(n / 10) * 10 + 10} మధ్య ఉంటుంది.`)],
          solution: [L(`${n} is marked ${n - 100} steps after 100.`, `${n} అనేది 100 తర్వాత ${n - 100} అడుగుల దగ్గర ఉంది.`)],
        };
      }),
      tp('skip', (r) => {
        const s = r.pick([2, 5, 10]), start = r.int(10, 17) * 10 + (s === 10 ? 0 : r.int(0, 3) * s);
        const seq = range(0, 3).map((i) => start + i * s);
        const ans = start + 4 * s;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What comes next? ${seq.join(', ')}, ___`, `తర్వాత ఏది? ${seq.join(', ')}, ___`), answer: num(ans),
          hints: [L('How much does each number go up by?', 'ప్రతి సంఖ్య ఎంత పెరుగుతోంది?'), L(`It goes up by ${s} each time.`, `ప్రతిసారీ ${s} పెరుగుతోంది.`)],
          mistakes: [{ when: String(seq[3] + 1), explain: L(`The jump is ${s}, not 1.`, `దూకడం ${s}, 1 కాదు.`) }],
          solution: [L(`${seq[3]} + ${s} = ${ans}`, `${seq[3]} + ${s} = ${ans}`)],
        };
      }),
    ],
  }],
};

const vacation: USpec = {
  id: 'c3.u.vacation', subject: 'math', title: L('Vacation with My Nani Maa', 'అమ్మమ్మతో సెలవులు'), source: src('mm3', 4, 'Vacation with My Nani Maa'),
  objectives: [{
    id: 'c3.addsub.story', title: L('Adding and subtracting in stories', 'కథల్లో కూడిక, తీసివేత'),
    activities: ['game:balance'],
    intro: [
      p('Words like "in all", "altogether" and "more came" tell us to add. Words like "left", "gave away" and "how many more" tell us to subtract.', '"మొత్తం", "అన్నీ కలిపి", "ఇంకా వచ్చాయి" అంటే కూడాలి. "మిగిలినవి", "ఇచ్చేశాడు", "ఇంకా ఎన్ని ఎక్కువ" అంటే తీసివేయాలి.'),
      tip('Draw a quick picture or a bar to see the story.', 'కథను చూడడానికి చిన్న బొమ్మ లేదా పట్టీ గీయి.'),
    ],
    examples: [
      ex(L('Nani Maa picked 45 mangoes and 38 guavas. How many fruits in all?', 'అమ్మమ్మ 45 మామిడి పండ్లు, 38 జామ పండ్లు కోసింది. మొత్తం ఎన్ని పండ్లు?'), [L('In all → add', 'మొత్తం → కూడు'), L('45 + 38 = 83', '45 + 38 = 83')], L('83 fruits', '83 పండ్లు')),
      ex(L('A bus had 62 people. 27 got off. How many are left?', 'బస్సులో 62 మంది ఉన్నారు. 27 మంది దిగారు. ఎంత మంది మిగిలారు?'), [L('Left → subtract', 'మిగిలినవి → తీసివేయి'), L('62 − 27 = 35', '62 − 27 = 35')], L('35 people', '35 మంది')),
    ],
    practice: [
      tp('add', (r) => {
        const nm = r.pick(NAMES), th = r.pick(THINGS);
        const a = r.int(15, 95), b = r.int(12, 99 - Math.min(a, 90) + 20);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`At Nani Maa's village, ${nm.en} collected ${a} ${th.en} on Monday and ${b} on Tuesday. How many ${th.en} in all?`, `అమ్మమ్మ ఊరిలో ${nm.te} సోమవారం ${a} ${th.te}, మంగళవారం ${b} సేకరించారు. మొత్తం ఎన్ని?`),
          answer: num(a + b),
          hints: [L('"In all" means add.', '"మొత్తం" అంటే కూడాలి.'), L('Add the ones first, then the tens.', 'ముందు ఒకట్లు, తర్వాత పదులు కలుపు.')],
          mistakes: [{ when: String(Math.abs(a - b)), explain: L('You subtracted. "In all" means put the two amounts together — add.', 'నువ్వు తీసివేశావు. "మొత్తం" అంటే రెండింటినీ కలపాలి.') }],
          solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
        };
      }),
      tp('sub', (r) => {
        const total = r.int(40, 150), used = r.int(11, total - 5);
        const ctx = r.pick([
          [L('seats in a train coach', 'రైలు బోగీలో సీట్లు'), L('were taken', 'నిండిపోయాయి'), L('empty', 'ఖాళీగా')],
          [L('km to Nani Maa\'s village', 'అమ్మమ్మ ఊరికి కి.మీ.'), L('are already travelled', 'ఇప్పటికే ప్రయాణించాం'), L('still to go', 'ఇంకా వెళ్ళాలి')],
          [L('pages in a story book', 'కథల పుస్తకంలో పేజీలు'), L('are read', 'చదివేశాం'), L('still to read', 'ఇంకా చదవాలి')],
        ] as Localized[][]);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`There are ${total} ${ctx[0].en}. ${used} ${ctx[1].en}. How many are ${ctx[2].en}?`, `${total} ${ctx[0].te} ఉన్నాయి. ${used} ${ctx[1].te}. ఎన్ని ${ctx[2].te}?`),
          answer: num(total - used),
          hints: [L('Take away the part that is used.', 'వాడిన భాగాన్ని తీసివేయి.'), L(`${total} − ${used} = ?`, `${total} − ${used} = ?`)],
          mistakes: [{ when: String(total + used), explain: L('You added. We need what is left, so subtract.', 'నువ్వు కూడావు. మిగిలినది కావాలి, కాబట్టి తీసివేయి.') }],
          solution: [L(`${total} − ${used} = ${total - used}`, `${total} − ${used} = ${total - used}`)],
        };
      }),
    ],
  }],
};

const SH2 = ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle'] as const;
const shapes: USpec = {
  id: 'c3.u.shapes', subject: 'math', title: L('Fun with Shapes', 'ఆకారాలతో ఆట'), source: src('mm3', 5, 'Fun with Shapes'),
  objectives: [{
    id: 'c3.shape.sides', title: L('Sides and corners of flat shapes', 'చదునైన ఆకారాల భుజాలు, మూలలు'),
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('Flat shapes have straight sides and corners. A triangle has 3 sides and 3 corners; a square and a rectangle have 4 of each.', 'చదునైన ఆకారాలకు సరళ భుజాలు, మూలలు ఉంటాయి. త్రిభుజానికి 3 భుజాలు, 3 మూలలు; చతురస్రం, దీర్ఘచతురస్రానికి 4 చొప్పున.'),
      p('A circle has no straight side and no corner.', 'వృత్తానికి సరళ భుజం లేదు, మూల లేదు.'),
      vis({ kind: 'shape', shape: 'hexagon', color: '#f59e0b' }, 'A hexagon has 6 sides', 'షడ్భుజికి 6 భుజాలు'),
      tip('Tangram pieces are triangles, a square and a parallelogram — try making a boat!', 'టాంగ్రామ్ ముక్కలు త్రిభుజాలు, ఒక చతురస్రం — పడవ చేసి చూడు!'),
    ],
    examples: [
      ex(L('How many corners does a pentagon have?', 'పంచభుజికి ఎన్ని మూలలు?'), [L('Touch each corner and count: 1, 2, 3, 4, 5.', 'ప్రతి మూలను తాకి లెక్కించు: 1, 2, 3, 4, 5.')], L('5 corners', '5 మూలలు'), { kind: 'shape', shape: 'pentagon' }),
      ex(L('A shape has 4 sides; opposite sides are equal but not all four. What is it?', 'ఒక ఆకారానికి 4 భుజాలు; ఎదురెదురు భుజాలు సమానం, కానీ నాలుగూ కాదు. అది ఏమిటి?'), [L('4 sides → square or rectangle.', '4 భుజాలు → చతురస్రం లేదా దీర్ఘచతురస్రం.'), L('Not all equal → rectangle.', 'అన్నీ సమానం కాదు → దీర్ఘచతురస్రం.')], L('Rectangle', 'దీర్ఘచతురస్రం')),
    ],
    practice: [
      tp('corners', (r) => {
        const s = r.pick(SH2);
        const what = r.pick([L('corners', 'మూలలు'), L('sides', 'భుజాలు')]);
        return {
          type: 'count', keypad: 'numeric', visual: { kind: 'shape', shape: s }, prompt: L(`How many ${what.en} does this shape have?`, `ఈ ఆకారానికి ఎన్ని ${what.te} ఉన్నాయి?`),
          answer: num(CORNERS[s]),
          hints: [L(`Touch each of the ${what.en} and count.`, `ప్రతి ${what.te}ను తాకి లెక్కించు.`), L('A shape has as many sides as corners.', 'ఒక ఆకారానికి ఎన్ని మూలలో అన్ని భుజాలు.')],
          solution: [L(`A ${s} has ${CORNERS[s]} ${what.en}.`, `${SHAPE_TE[s]}కు ${CORNERS[s]} ${what.te}.`)],
        };
      }),
      tp('tap', (r) => {
        const target = r.pick([3, 4, 0, 5, 6]);
        const desc: Record<number, Localized> = { 3: L('3 corners', '3 మూలలు'), 4: L('4 corners', '4 మూలలు'), 0: L('no corners', 'మూలలు లేనివి'), 5: L('5 corners', '5 మూలలు'), 6: L('6 corners', '6 మూలలు') };
        const pool = r.shuffle([...SH2, 'triangle', 'square', 'circle'] as string[]);
        let pick = pool.slice(0, 5);
        if (!pick.some((s) => CORNERS[s] === target)) pick = [SH2.find((s) => CORNERS[s] === target)!, ...pick.slice(1)];
        if (pick.every((s) => CORNERS[s] === target)) pick[0] = target === 3 ? 'circle' : 'triangle';
        const items = pick.map((s, i) => ({ label: L(`Shape ${i + 1}`, `ఆకారం ${i + 1}`), ok: CORNERS[s] === target, visual: { kind: 'shape', shape: s } as VisualSpec }));
        return {
          type: 'tap', prompt: L(`Tap every shape with ${desc[target].en}.`, `${desc[target].te} ఉన్న ప్రతి ఆకారాన్ని నొక్కు.`), ...tapAll(r, items),
          hints: [L('Count the corners of each shape.', 'ప్రతి ఆకారపు మూలలను లెక్కించు.'), L('Squares and rectangles both have 4 corners.', 'చతురస్రం, దీర్ఘచతురస్రం రెండింటికీ 4 మూలలు.')],
          solution: [L(`Shapes with ${desc[target].en}: ${pick.filter((s) => CORNERS[s] === target).join(', ')}`, `${desc[target].te}: ${pick.filter((s) => CORNERS[s] === target).map((s) => SHAPE_TE[s]).join(', ')}`)],
        };
      }),
    ],
  }],
};

const hundreds1: USpec = {
  id: 'c3.u.hundreds1', subject: 'math', title: L('House of Hundreds – I', 'వందల ఇల్లు – 1'), source: src('mm3', 6, 'House of Hundreds – I'),
  objectives: [{
    id: 'c3.pv.hundreds', title: L('Hundreds, tens and ones', 'వందలు, పదులు, ఒకట్లు'), prereqs: ['c3.num.to200'],
    activities: ['game:numberline'],
    intro: [
      p('In a 3-digit number, the first digit tells hundreds, the next tells tens, and the last tells ones. In 347: 3 hundreds, 4 tens, 7 ones.', '3 అంకెల సంఖ్యలో మొదటి అంకె వందలు, తర్వాతది పదులు, చివరిది ఒకట్లు. 347లో: 3 వందలు, 4 పదులు, 7 ఒకట్లు.'),
      p('347 = 300 + 40 + 7. This is the expanded form.', '347 = 300 + 40 + 7. ఇది విస్తరణ రూపం.'),
      tip('To compare numbers, look at the hundreds first.', 'సంఖ్యలను పోల్చడానికి ముందు వందల స్థానం చూడు.'),
    ],
    examples: [
      ex(L('What is the value of 6 in 562?', '562లో 6 విలువ ఎంత?'), [L('6 is in the tens place.', '6 పదుల స్థానంలో ఉంది.'), L('6 tens = 60', '6 పదులు = 60')], L('60', '60')),
      ex(L('Which is bigger: 489 or 512?', '489, 512లలో ఏది పెద్దది?'), [L('Hundreds: 4 < 5', 'వందలు: 4 < 5'), L('So 512 is bigger.', 'కాబట్టి 512 పెద్దది.')], L('512', '512')),
    ],
    practice: [
      tp('value', (r) => {
        const ds = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        const n = ds[0] * 100 + ds[1] * 10 + ds[2];
        const pos = r.int(0, 2);
        const val = ds[pos] * [100, 10, 1][pos];
        return {
          type: 'mcq', prompt: L(`What is the value of the digit ${ds[pos]} in ${n}?`, `${n}లో ${ds[pos]} అంకె విలువ ఎంత?`),
          ...chooseNum(r, val, [ds[pos], ds[pos] * 10, ds[pos] * 100]),
          hints: [L('Which place is the digit in: hundreds, tens or ones?', 'అంకె ఏ స్థానంలో ఉంది: వందలు, పదులు, ఒకట్లు?')],
          mistakes: [{ when: 'wrong', explain: L('The value depends on the place: hundreds × 100, tens × 10, ones × 1.', 'విలువ స్థానాన్ని బట్టి ఉంటుంది: వందలు × 100, పదులు × 10, ఒకట్లు × 1.') }],
          solution: [L(`${ds[pos]} is in the ${['hundreds', 'tens', 'ones'][pos]} place, so its value is ${val}.`, `${ds[pos]} ${['వందల', 'పదుల', 'ఒకట్ల'][pos]} స్థానంలో ఉంది, విలువ ${val}.`)],
        };
      }),
      tp('expand', (r) => {
        const h = r.int(1, 9), t = r.int(0, 9), o = r.int(0, 9);
        const parts = [h * 100, t * 10, o].filter((x) => x > 0);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`Write the number: ${parts.join(' + ')} = ?`, `సంఖ్యను రాయి: ${parts.join(' + ')} = ?`), answer: num(h * 100 + t * 10 + o),
          hints: [L('Put each part in its place: hundreds, tens, ones.', 'ప్రతి భాగాన్ని దాని స్థానంలో పెట్టు: వందలు, పదులు, ఒకట్లు.'), L('Use 0 for an empty place.', 'ఖాళీ స్థానానికి 0 వాడు.')],
          mistakes: [{ when: `${h}${t || ''}${o || ''}`, explain: L('An empty place still needs a 0.', 'ఖాళీ స్థానంలో కూడా 0 రాయాలి.') }],
          solution: [L(`${h} hundreds, ${t} tens, ${o} ones = ${h * 100 + t * 10 + o}`, `${h} వందలు, ${t} పదులు, ${o} ఒకట్లు = ${h * 100 + t * 10 + o}`)],
        };
      }),
      tp('biggest', (r) => {
        const h = r.int(2, 8);
        const ns = r.shuffle([h * 100 + r.int(10, 99), h * 100 + r.int(0, 99), (h + 1) * 100 + r.int(0, 9), (h - 1) * 100 + r.int(50, 99)]);
        const uniq = [...new Set(ns)];
        const best = Math.max(...uniq);
        return {
          type: 'mcq', prompt: L('Which number is the greatest?', 'ఏ సంఖ్య అన్నిటికంటే పెద్దది?'), ...choose(r, String(best), uniq.filter((x) => x !== best).map(String)),
          hints: [L('Compare the hundreds digits first.', 'ముందు వందల అంకెలను పోల్చు.'), L('If hundreds are equal, compare tens.', 'వందలు సమానమైతే పదులను పోల్చు.')],
          solution: [L(`${best} has the most hundreds, so it is the greatest.`, `${best}కు ఎక్కువ వందలు ఉన్నాయి, కాబట్టి అది పెద్దది.`)],
        };
      }),
    ],
  }],
};

const rakhi: USpec = {
  id: 'c3.u.rakhi', subject: 'math', title: L('Raksha Bandhan', 'రక్షా బంధన్'), source: src('mm3', 7, 'Raksha Bandhan'),
  objectives: [{
    id: 'c3.mult.groups', title: L('Multiplication as equal groups', 'సమాన గుంపులుగా గుణకారం'),
    activities: ['game:counting', 'game:patterns'],
    intro: [
      p('When we have equal groups, we can multiply instead of adding again and again. 4 groups of 3 = 3 + 3 + 3 + 3 = 4 × 3 = 12.', 'సమాన గుంపులు ఉన్నప్పుడు మళ్ళీ మళ్ళీ కూడకుండా గుణించవచ్చు. 3 చొప్పున 4 గుంపులు = 3 + 3 + 3 + 3 = 4 × 3 = 12.'),
      vis({ kind: 'objects', emoji: '🎀', count: 12, groupsOf: 3 }, '4 groups of 3 rakhis', '3 రాఖీల చొప్పున 4 గుంపులు'),
      tip('Skip counting helps: 3, 6, 9, 12.', 'దాటి లెక్కించడం సహాయపడుతుంది: 3, 6, 9, 12.'),
    ],
    examples: [
      ex(L('Diya ties 2 rakhis on each of her 5 brothers. How many rakhis?', 'దియా తన 5 మంది అన్నదమ్ములకు ఒక్కొక్కరికి 2 రాఖీలు కడుతుంది. మొత్తం ఎన్ని?'), [L('5 groups of 2', '2 చొప్పున 5 గుంపులు'), L('5 × 2 = 10', '5 × 2 = 10')], L('10 rakhis', '10 రాఖీలు'), { kind: 'objects', emoji: '🎀', count: 10, groupsOf: 2 }),
      ex(L('A box has 6 rows of 4 laddoos. How many laddoos?', 'ఒక డబ్బాలో 4 లడ్డూల చొప్పున 6 వరుసలు. మొత్తం ఎన్ని?'), [L('6 × 4: 4, 8, 12, 16, 20, 24', '6 × 4: 4, 8, 12, 16, 20, 24')], L('24 laddoos', '24 లడ్డూలు')),
    ],
    practice: [
      tp('groups', (r) => {
        const g = r.int(2, 5), n = r.int(2, 6);
        const th = r.pick(THINGS);
        return {
          type: 'count', keypad: 'numeric', visual: { kind: 'objects', emoji: th.emoji, count: g * n, groupsOf: n },
          prompt: L(`There are ${g} groups of ${n} ${th.en}. How many in all?`, `${n} ${th.te} చొప్పున ${g} గుంపులు ఉన్నాయి. మొత్తం ఎన్ని?`), answer: num(g * n),
          hints: [L(`Skip count by ${n}.`, `${n} చొప్పున దాటి లెక్కించు.`), L(`${g} × ${n} = ?`, `${g} × ${n} = ?`)],
          mistakes: [{ when: String(g + n), explain: L('You added the number of groups and the group size. Add the group size again and again instead.', 'గుంపుల సంఖ్య, గుంపు పరిమాణం కూడావు. బదులుగా గుంపు పరిమాణాన్ని మళ్ళీ మళ్ళీ కూడు.') }],
          solution: [L(range(1, g).map((i) => i * n).join(', '), range(1, g).map((i) => i * n).join(', ')), L(`${g} × ${n} = ${g * n}`, `${g} × ${n} = ${g * n}`)],
        };
      }),
      tp('fact', (r) => {
        const a = r.int(2, 10), b = r.int(2, 10);
        const nm = r.pick(NAMES);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${nm.en} buys ${a} packets of rakhis. Each packet has ${b} rakhis. How many rakhis?`, `${nm.te} ${a} రాఖీ ప్యాకెట్లు కొన్నారు. ఒక్కో ప్యాకెట్‌లో ${b} రాఖీలు. మొత్తం ఎన్ని రాఖీలు?`),
          answer: num(a * b),
          hints: [L('Equal packets → multiply.', 'సమాన ప్యాకెట్లు → గుణించు.'), L(`${a} × ${b}`, `${a} × ${b}`)],
          mistakes: [{ when: String(a + b), explain: L('Adding the two numbers is not enough — there are several packets of the same size.', 'రెండు సంఖ్యలను కూడితే చాలదు — ఒకే పరిమాణంలో చాలా ప్యాకెట్లు ఉన్నాయి.') }],
          solution: [L(`${a} × ${b} = ${a * b}`, `${a} × ${b} = ${a * b}`)],
        };
      }),
    ],
  }],
};

const fair: USpec = {
  id: 'c3.u.fairshare', subject: 'math', title: L('Fair Share', 'సమాన భాగం'), source: src('mm3', 8, 'Fair Share'),
  objectives: [{
    id: 'c3.frac.half-quarter', title: L('Halves and quarters', 'సగం, పావు'),
    activities: ['game:fractions'],
    intro: [
      p('When a roti is cut into 2 equal parts, each part is one half (1/2). Cut into 4 equal parts, each part is one quarter (1/4).', 'రొట్టెను 2 సమాన భాగాలు చేస్తే ఒక్కో భాగం సగం (1/2). 4 సమాన భాగాలు చేస్తే ఒక్కో భాగం పావు (1/4).'),
      vis({ kind: 'fraction-circle', parts: 4, shaded: 1 }, 'One quarter shaded', 'పావు భాగం రంగు వేయబడింది'),
      tip('The parts must be EQUAL for a fair share.', 'సమాన భాగానికి భాగాలు సమానంగా ఉండాలి.'),
    ],
    examples: [
      ex(L('Half of 12 bananas?', '12 అరటి పండ్లలో సగం?'), [L('Share into 2 equal groups.', '2 సమాన గుంపులుగా పంచు.'), L('12 ÷ 2 = 6', '12 ÷ 2 = 6')], L('6 bananas', '6 అరటి పండ్లు')),
      ex(L('3 of 4 equal parts are shaded. What part is shaded?', '4 సమాన భాగాల్లో 3 రంగు వేశారు. ఎంత భాగం?'), [L('3 quarters', '3 పావులు')], L('3/4', '3/4'), { kind: 'fraction-bar', parts: 4, shaded: 3 }),
    ],
    practice: [
      tp('shaded', (r) => {
        const [parts, shaded] = r.pick([[2, 1], [4, 1], [4, 3]] as [number, number][]);
        const kind = r.pick(['bar', 'circle'] as const);
        const visual: VisualSpec = kind === 'bar' ? { kind: 'fraction-bar', parts, shaded } : { kind: 'fraction-circle', parts, shaded };
        const ans = `${shaded}/${parts}`;
        return {
          type: 'mcq', visual, prompt: L('What part of the shape is shaded?', 'ఆకారంలో ఎంత భాగం రంగు వేయబడింది?'),
          ...choose(r, L(ans, ans), [L('1/2', '1/2'), L('1/4', '1/4'), L('3/4', '3/4'), L('1/3', '1/3')]),
          hints: [L('How many equal parts are there?', 'ఎన్ని సమాన భాగాలు ఉన్నాయి?'), L('How many are shaded?', 'ఎన్ని రంగు వేశారు?')],
          solution: [L(`${shaded} of ${parts} equal parts = ${ans}`, `${parts} సమాన భాగాల్లో ${shaded} = ${ans}`)],
        };
      }),
      tp('half-of', (r) => {
        const which = r.pick([L('half', 'సగం'), L('a quarter', 'పావు భాగం')]);
        const d = which.en === 'half' ? 2 : 4;
        const n = d * r.int(2, 10);
        const th = r.pick(THINGS);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What is ${which.en} of ${n} ${th.en}?`, `${n} ${th.te}లో ${which.te} ఎంత?`), answer: num(n / d),
          hints: [L(`Share ${n} into ${d} equal groups.`, `${n}ని ${d} సమాన గుంపులుగా పంచు.`), L(`${n} ÷ ${d} = ?`, `${n} ÷ ${d} = ?`)],
          mistakes: [{ when: String(n * d), explain: L('Sharing makes each part smaller — divide, do not multiply.', 'పంచితే ఒక్కో భాగం చిన్నదవుతుంది — భాగించు, గుణించకు.') }],
          solution: [L(`${n} ÷ ${d} = ${n / d}`, `${n} ÷ ${d} = ${n / d}`)],
        };
      }),
    ],
  }],
};

const hundreds2: USpec = {
  id: 'c3.u.hundreds2', subject: 'math', title: L('House of Hundreds – II', 'వందల ఇల్లు – 2'), source: src('mm3', 9, 'House of Hundreds – II'),
  objectives: [{
    id: 'c3.pv.addsub3', title: L('Adding and subtracting 3-digit numbers', '3 అంకెల సంఖ్యల కూడిక, తీసివేత'), prereqs: ['c3.pv.hundreds'],
    activities: ['game:balance'],
    intro: [
      p('Line up ones under ones, tens under tens, hundreds under hundreds. Start from the ones.', 'ఒకట్ల కింద ఒకట్లు, పదుల కింద పదులు, వందల కింద వందలు ఉంచు. ఒకట్ల నుండి మొదలుపెట్టు.'),
      p('If the ones add up to 10 or more, carry 1 ten to the tens column. If you cannot take away, borrow 1 ten (10 ones).', 'ఒకట్లు 10 లేదా ఎక్కువ అయితే 1 పదిని పదుల వరుసకు తీసుకెళ్ళు. తీసివేయలేకపోతే 1 పది (10 ఒకట్లు) అప్పు తీసుకో.'),
      tip('Check a subtraction by adding the answer back.', 'తీసివేతను జవాబును తిరిగి కూడి సరిచూడు.'),
    ],
    examples: [
      ex(L('358 + 276', '358 + 276'), [L('Ones: 8 + 6 = 14 → write 4, carry 1', 'ఒకట్లు: 8 + 6 = 14 → 4 రాసి, 1 తీసుకెళ్ళు'), L('Tens: 5 + 7 + 1 = 13 → write 3, carry 1', 'పదులు: 5 + 7 + 1 = 13 → 3 రాసి, 1 తీసుకెళ్ళు'), L('Hundreds: 3 + 2 + 1 = 6', 'వందలు: 3 + 2 + 1 = 6')], L('634', '634')),
      ex(L('521 − 247', '521 − 247'), [L('Ones: 1 < 7, borrow → 11 − 7 = 4', 'ఒకట్లు: 1 < 7, అప్పు → 11 − 7 = 4'), L('Tens: 1 < 4, borrow → 11 − 4 = 7', 'పదులు: 1 < 4, అప్పు → 11 − 4 = 7'), L('Hundreds: 4 − 2 = 2', 'వందలు: 4 − 2 = 2')], L('274', '274')),
    ],
    practice: [
      tp('add', (r) => {
        const a = r.int(105, 589), b = r.int(105, 989 - a);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${a} + ${b} = ?`, `${a} + ${b} = ?`), answer: num(a + b),
          hints: [L('Start with the ones column.', 'ఒకట్ల వరుసతో మొదలుపెట్టు.'), L('If a column makes 10 or more, carry 1 to the next column.', 'ఒక వరుస 10 లేదా ఎక్కువ అయితే, 1ని తర్వాతి వరుసకు తీసుకెళ్ళు.')],
          mistakes: [{ when: String(noCarry(a, b)), explain: L('You forgot to carry. When a column adds to 10 or more, the extra ten goes to the next column.', 'తీసుకెళ్ళడం మర్చిపోయావు. ఒక వరుస 10 దాటితే, ఆ పది తర్వాతి వరుసకు వెళ్తుంది.') }],
          solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
        };
      }),
      tp('sub', (r) => {
        const a = r.int(300, 999), b = r.int(101, a - 50);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${a} − ${b} = ?`, `${a} − ${b} = ?`), answer: num(a - b),
          hints: [L('Start with the ones. If the top digit is smaller, borrow a ten.', 'ఒకట్లతో మొదలుపెట్టు. పై అంకె చిన్నదైతే ఒక పది అప్పు తీసుకో.'), L(`Check: answer + ${b} should give ${a}.`, `సరిచూడు: జవాబు + ${b} = ${a} రావాలి.`)],
          mistakes: [{ when: String(smallFromBig(a, b)), explain: L('Always take the bottom digit from the top digit. If the top is smaller, borrow — do not swap them.', 'ఎప్పుడూ పై అంకె నుండి కింది అంకె తీసివేయి. పైది చిన్నదైతే అప్పు తీసుకో — మార్చకు.') }],
          solution: [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`), L(`Check: ${a - b} + ${b} = ${a}`, `సరిచూడు: ${a - b} + ${b} = ${a}`)],
        };
      }, 2),
    ],
  }],
};

const party: USpec = {
  id: 'c3.u.party', subject: 'math', title: L('Fun at Class Party!', 'క్లాస్ పార్టీలో సరదా!'), source: src('mm3', 10, 'Fun at Class Party!'),
  objectives: [{
    id: 'c3.div.share', title: L('Sharing equally (division)', 'సమానంగా పంచడం (భాగహారం)'), prereqs: ['c3.mult.groups'],
    activities: ['game:counting'],
    intro: [
      p('Division means sharing equally or making equal groups. 12 laddoos shared among 3 friends: each gets 4, because 3 × 4 = 12.', 'భాగహారం అంటే సమానంగా పంచడం లేదా సమాన గుంపులు చేయడం. 12 లడ్డూలను 3 మంది స్నేహితులకు పంచితే ఒక్కొక్కరికి 4, ఎందుకంటే 3 × 4 = 12.'),
      vis({ kind: 'objects', emoji: '🟠', count: 12, groupsOf: 4 }, '12 laddoos in 3 equal groups', '12 లడ్డూలు 3 సమాన గుంపుల్లో'),
      tip('Use the times table backwards to divide.', 'భాగించడానికి ఎక్కాన్ని వెనక్కి వాడు.'),
    ],
    examples: [
      ex(L('20 biscuits shared equally by 5 children. How many each?', '20 బిస్కెట్లను 5 మంది పిల్లలకు సమానంగా పంచితే ఒక్కొక్కరికి ఎన్ని?'), [L('5 × ? = 20', '5 × ? = 20'), L('5 × 4 = 20', '5 × 4 = 20')], L('4 each', 'ఒక్కొక్కరికి 4')),
      ex(L('18 children make teams of 3. How many teams?', '18 మంది పిల్లలు 3 చొప్పున జట్లు అయితే ఎన్ని జట్లు?'), [L('Count in 3s up to 18: 3, 6, 9, 12, 15, 18', '18 వరకు 3ల చొప్పున: 3, 6, 9, 12, 15, 18'), L('That is 6 threes.', 'అది 6 మూడులు.')], L('6 teams', '6 జట్లు')),
    ],
    practice: [
      tp('share', (r) => {
        const k = r.int(2, 6), q = r.int(2, 9);
        const th = r.pick(THINGS);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${k * q} ${th.en} are shared equally among ${k} friends at the class party. How many does each friend get?`, `క్లాస్ పార్టీలో ${k * q} ${th.te}ను ${k} మంది స్నేహితులకు సమానంగా పంచారు. ఒక్కొక్కరికి ఎన్ని?`),
          answer: num(q),
          hints: [L(`${k} × ? = ${k * q}`, `${k} × ? = ${k * q}`), L('Give one to each friend, again and again, until none are left.', 'అన్నీ అయిపోయే వరకు ఒక్కొక్కరికి ఒకటి చొప్పున ఇవ్వు.')],
          mistakes: [{ when: String(k * q - k), explain: L('Sharing is not taking away once — find how many equal groups fit.', 'పంచడం అంటే ఒకసారి తీసివేయడం కాదు — ఎన్ని సమాన గుంపులు సరిపోతాయో చూడు.') }],
          solution: [L(`${k * q} ÷ ${k} = ${q}`, `${k * q} ÷ ${k} = ${q}`), L(`Check: ${k} × ${q} = ${k * q}`, `సరిచూడు: ${k} × ${q} = ${k * q}`)],
        };
      }),
      tp('teams', (r) => {
        const size = r.int(2, 5), teams = r.int(3, 8);
        return {
          type: 'mcq', prompt: L(`${size * teams} children play a game in teams of ${size}. How many teams are there?`, `${size * teams} మంది పిల్లలు ${size} మంది చొప్పున జట్లుగా ఆడుతున్నారు. ఎన్ని జట్లు?`),
          ...chooseNum(r, teams, [size, teams + 1, teams - 1, size * teams - size]),
          hints: [L(`Count in ${size}s up to ${size * teams}.`, `${size * teams} వరకు ${size}ల చొప్పున లెక్కించు.`)],
          solution: [L(`${size * teams} ÷ ${size} = ${teams} teams`, `${size * teams} ÷ ${size} = ${teams} జట్లు`)],
        };
      }),
    ],
  }],
};

const HEAVY: { l: Localized; e: string; w: number }[] = [
  { l: L('elephant', 'ఏనుగు'), e: '🐘', w: 9 }, { l: L('cow', 'ఆవు'), e: '🐄', w: 8 }, { l: L('watermelon', 'పుచ్చకాయ'), e: '🍉', w: 5 },
  { l: L('school bag', 'బడి సంచి'), e: '🎒', w: 4 }, { l: L('mango', 'మామిడి పండు'), e: '🥭', w: 2 }, { l: L('feather', 'ఈక'), e: '🪶', w: 0 },
  { l: L('pencil', 'పెన్సిల్'), e: '✏️', w: 1 }, { l: L('bicycle', 'సైకిల్'), e: '🚲', w: 6 },
];
const lift: USpec = {
  id: 'c3.u.lift', subject: 'math', title: L('Filling and Lifting', 'నింపడం, ఎత్తడం'), source: src('mm3', 11, 'Filling and Lifting'),
  objectives: [{
    id: 'c3.meas.cap-weight', title: L('Comparing capacity and weight', 'సామర్థ్యం, బరువు పోల్చడం'),
    activities: ['game:balance'],
    intro: [
      p('Capacity is how much a container can hold. We measure liquids in litres (L). Weight tells how heavy something is; we measure it in kilograms (kg) and grams (g).', 'సామర్థ్యం అంటే ఒక పాత్రలో ఎంత పడుతుంది. ద్రవాలను లీటర్లలో (L) కొలుస్తాం. బరువు ఎంత బరువుగా ఉందో చెబుతుంది; కిలోగ్రాములు (kg), గ్రాములలో (g) కొలుస్తాం.'),
      p('1 kg = 1000 g. On a balance, the heavier side goes down.', '1 kg = 1000 g. త్రాసులో బరువైన వైపు కిందకు దిగుతుంది.'),
      tip('A big thing is not always heavier — a pillow is big but light!', 'పెద్దది ఎప్పుడూ బరువు కాదు — దిండు పెద్దది కానీ తేలిక!'),
    ],
    examples: [
      ex(L('A bucket holds 10 L. How many 2 L jugs fill it?', 'బకెట్‌లో 10 L పడుతుంది. 2 L జగ్గులు ఎన్ని పోస్తే నిండుతుంది?'), [L('2, 4, 6, 8, 10 → 5 jugs', '2, 4, 6, 8, 10 → 5 జగ్గులు')], L('5 jugs', '5 జగ్గులు')),
      ex(L('Which is heavier: 1 kg rice or 700 g sugar?', '1 kg బియ్యం, 700 g చక్కెరలో ఏది బరువు?'), [L('1 kg = 1000 g', '1 kg = 1000 g'), L('1000 g > 700 g', '1000 g > 700 g')], L('1 kg rice', '1 kg బియ్యం')),
    ],
    practice: [
      tp('heavier', (r) => {
        const [a, b, c] = r.shuffle(HEAVY).slice(0, 3);
        const best = [a, b, c].reduce((x, y) => (y.w > x.w ? y : x));
        const others = [a, b, c].filter((x) => x !== best);
        return {
          type: 'spoken', prompt: L('Which one is the heaviest?', 'వీటిలో ఏది అన్నిటికంటే బరువు?'), say: L('Tap the heaviest one.', 'అన్నిటికంటే బరువైనదాన్ని నొక్కు.'),
          ...pictures(r, { label: best.l, visual: { kind: 'emoji', text: best.e } }, others.map((o) => ({ label: o.l, visual: { kind: 'emoji', text: o.e } as VisualSpec }))),
          hints: [L('Imagine lifting each one.', 'ఒక్కొక్కటి ఎత్తినట్టు ఊహించు.'), L('Which would make a balance go down the most?', 'త్రాసును ఏది ఎక్కువగా కిందకు దించుతుంది?')],
          solution: [L(`The ${best.l.en} is the heaviest.`, `${best.l.te} అన్నిటికంటే బరువు.`)],
        };
      }),
      tp('jugs', (r) => {
        const jug = r.pick([1, 2, 5]), n = r.int(2, 10);
        const pot = r.pick([L('bucket', 'బకెట్'), L('water drum', 'నీటి డ్రమ్'), L('steel pot', 'స్టీల్ బిందె')]);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`A ${pot.en} holds ${jug * n} L of water. How many ${jug} L jugs are needed to fill it?`, `ఒక ${pot.te}లో ${jug * n} L నీరు పడుతుంది. ${jug} L జగ్గులు ఎన్ని కావాలి?`),
          answer: num(n),
          hints: [L(`Count in ${jug}s up to ${jug * n}.`, `${jug * n} వరకు ${jug}ల చొప్పున లెక్కించు.`), L(`${jug * n} ÷ ${jug} = ?`, `${jug * n} ÷ ${jug} = ?`)],
          solution: [L(`${jug * n} ÷ ${jug} = ${n} jugs`, `${jug * n} ÷ ${jug} = ${n} జగ్గులు`)],
        };
      }),
      tp('g-kg', (r) => {
        const g = r.pick([250, 400, 500, 750, 900, 1200, 1500, 2000]);
        const item = r.pick([L('dal', 'పప్పు'), L('sugar', 'చక్కెర'), L('jaggery', 'బెల్లం'), L('rice', 'బియ్యం')]);
        const ans = g > 1000 ? L(`${g} g ${item.en}`, `${g} g ${item.te}`) : g === 1000 ? L('Both are equal', 'రెండూ సమానం') : L(`1 kg ${item.en}`, `1 kg ${item.te}`);
        return {
          type: 'mcq', prompt: L(`Which is heavier: 1 kg ${item.en} or ${g} g ${item.en}?`, `ఏది బరువు: 1 kg ${item.te} లేదా ${g} g ${item.te}?`),
          ...choose(r, ans, [L(`1 kg ${item.en}`, `1 kg ${item.te}`), L(`${g} g ${item.en}`, `${g} g ${item.te}`), L('Both are equal', 'రెండూ సమానం')]),
          hints: [L('1 kg = 1000 g', '1 kg = 1000 g'), L(`Compare 1000 g with ${g} g.`, `1000 gని ${g} gతో పోల్చు.`)],
          mistakes: [{ when: 'wrong', explain: L('Do not compare just the numbers 1 and the grams — change kg into grams first.', '1, గ్రాములను నేరుగా పోల్చకు — ముందు kgని గ్రాములుగా మార్చు.') }],
          solution: [L(`1 kg = 1000 g; ${g > 1000 ? `${g} > 1000` : `1000 > ${g}`}`, `1 kg = 1000 g; ${g > 1000 ? `${g} > 1000` : `1000 > ${g}`}`)],
        };
      }),
    ],
  }],
};

const COINS = [1, 2, 5, 10, 20];
const give: USpec = {
  id: 'c3.u.give', subject: 'math', title: L('Give and Take', 'ఇచ్చి పుచ్చుకోవడం'), source: src('mm3', 12, 'Give and Take'),
  objectives: [{
    id: 'c3.money.change', title: L('Money: totals and change', 'డబ్బు: మొత్తం, చిల్లర'), prereqs: ['c3.addsub.story'],
    activities: ['game:balance'],
    intro: [
      p('We use coins and notes of ₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100 and more. Add the values to find a total.', '₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100 నాణేలు, నోట్లు వాడతాం. మొత్తం కనుక్కోవడానికి విలువలను కూడు.'),
      p('Change = money given − price.', 'చిల్లర = ఇచ్చిన డబ్బు − ధర.'),
      vis({ kind: 'coins', rupees: [10, 5, 2, 1] }, 'Coins worth ₹18', '₹18 విలువైన నాణేలు'),
      tip('Count the biggest coins first.', 'ముందు పెద్ద నాణేలను లెక్కించు.'),
    ],
    examples: [
      ex(L('₹10 + ₹10 + ₹5 + ₹2 = ?', '₹10 + ₹10 + ₹5 + ₹2 = ?'), [L('10, 20, 25, 27', '10, 20, 25, 27')], L('₹27', '₹27'), { kind: 'coins', rupees: [10, 10, 5, 2] }),
      ex(L('A pencil box costs ₹36. You pay ₹50. Change?', 'పెన్సిల్ డబ్బా ధర ₹36. నువ్వు ₹50 ఇచ్చావు. చిల్లర?'), [L('50 − 36 = 14', '50 − 36 = 14'), L('Count up: 36 → 40 (4) → 50 (10) = 14', 'పైకి లెక్కించు: 36 → 40 (4) → 50 (10) = 14')], L('₹14', '₹14')),
    ],
    practice: [
      tp('coins', (r) => {
        const k = r.int(3, 6);
        const cs = range(1, k).map(() => r.pick(COINS)).sort((a, b) => b - a);
        const tot = cs.reduce((a, b) => a + b, 0);
        return {
          type: 'typed', keypad: 'numeric', unitHint: '₹', visual: { kind: 'coins', rupees: cs }, prompt: L('How much money is shown?', 'ఇక్కడ ఎంత డబ్బు ఉంది?'),
          answer: num(tot, '₹'),
          hints: [L('Start with the biggest coin or note.', 'పెద్ద నాణెం లేదా నోటుతో మొదలుపెట్టు.'), L('Keep adding as you go.', 'అలా కూడుకుంటూ వెళ్ళు.')],
          mistakes: [{ when: String(cs.length), explain: L('Count the value of each coin, not the number of coins.', 'నాణేల సంఖ్య కాదు, ప్రతి నాణెం విలువను లెక్కించు.') }],
          solution: [L(cs.map((c) => `₹${c}`).join(' + ') + ` = ₹${tot}`, cs.map((c) => `₹${c}`).join(' + ') + ` = ₹${tot}`)],
        };
      }),
      tp('change', (r) => {
        const paid = r.pick([20, 50, 100]);
        const price = r.int(Math.floor(paid / 3), paid - 1);
        const it = r.pick([L('a notebook', 'ఒక నోట్‌బుక్'), L('a packet of biscuits', 'బిస్కెట్ ప్యాకెట్'), L('a toy whistle', 'బొమ్మ ఈల'), L('bangles', 'గాజులు'), L('a kite', 'గాలిపటం')]);
        return {
          type: 'typed', keypad: 'numeric', unitHint: '₹', prompt: L(`${it.en[0].toUpperCase() + it.en.slice(1)} costs ₹${price}. You pay with a ₹${paid} note. How much change do you get?`, `${it.te} ధర ₹${price}. నువ్వు ₹${paid} నోటు ఇచ్చావు. ఎంత చిల్లర వస్తుంది?`),
          answer: num(paid - price, '₹'),
          hints: [L('Change = money given − price.', 'చిల్లర = ఇచ్చిన డబ్బు − ధర.'), L(`Count up from ₹${price} to ₹${paid}.`, `₹${price} నుండి ₹${paid} వరకు పైకి లెక్కించు.`)],
          mistakes: [{ when: String(paid + price), explain: L('You get money back, so subtract the price from what you gave.', 'డబ్బు తిరిగి వస్తుంది, కాబట్టి ఇచ్చిన దాని నుండి ధర తీసివేయి.') }],
          solution: [L(`₹${paid} − ₹${price} = ₹${paid - price}`, `₹${paid} − ₹${price} = ₹${paid - price}`)],
        };
      }),
    ],
  }],
};

const timeU: USpec = {
  id: 'c3.u.time', subject: 'math', title: L('Time Goes On', 'కాలం సాగిపోతుంది'), source: src('mm3', 13, 'Time Goes On'),
  objectives: [{
    id: 'c3.time.clock-calendar', title: L('Reading clocks and calendars', 'గడియారం, క్యాలెండర్ చదవడం'),
    activities: ['game:numberline'],
    intro: [
      p('The short hand shows the hour. The long hand shows minutes. When the long hand is at 12 it is "o\'clock"; at 6 it is "half past"; at 3 it is "quarter past".', 'చిన్న ముల్లు గంటను చూపిస్తుంది. పెద్ద ముల్లు నిమిషాలను చూపిస్తుంది. పెద్ద ముల్లు 12 దగ్గర ఉంటే సరిగ్గా గంటలు; 6 దగ్గర ఉంటే 30 నిమిషాలు; 3 దగ్గర ఉంటే 15 నిమిషాలు.'),
      vis({ kind: 'clock', h: 4, m: 30 }, 'Clock showing 4:30', '4:30 చూపిస్తున్న గడియారం'),
      p('A week has 7 days. A year has 12 months.', 'వారానికి 7 రోజులు. సంవత్సరానికి 12 నెలలు.'),
    ],
    examples: [
      ex(L('The short hand is just past 7 and the long hand is at 6. What time is it?', 'చిన్న ముల్లు 7 దాటింది, పెద్ద ముల్లు 6 దగ్గర ఉంది. టైమ్ ఎంత?'), [L('Hour: 7', 'గంట: 7'), L('Long hand at 6 → 30 minutes', 'పెద్ద ముల్లు 6 → 30 నిమిషాలు')], L('7:30', '7:30'), { kind: 'clock', h: 7, m: 30 }),
      ex(L('Today is Friday. What day is it 3 days later?', 'ఈ రోజు శుక్రవారం. 3 రోజుల తర్వాత ఏ రోజు?'), [L('Saturday (1), Sunday (2), Monday (3)', 'శనివారం (1), ఆదివారం (2), సోమవారం (3)')], L('Monday', 'సోమవారం')),
    ],
    practice: [
      tp('clock', (r) => {
        const h = r.int(1, 12), m = r.pick([0, 15, 30, 45]);
        const t = (hh: number, mm: number) => `${hh}:${pad2(mm)}`;
        const next = h === 12 ? 1 : h + 1;
        return {
          type: 'mcq', visual: { kind: 'clock', h, m }, prompt: L('What time does the clock show?', 'గడియారం ఎంత టైమ్ చూపిస్తోంది?'),
          ...choose(r, t(h, m), [t(next, m), t(h, (m + 30) % 60), t(h, (m + 15) % 60), t(m === 0 ? 12 : m / 5, h * 5 % 60)]),
          hints: [L('Read the short hand for the hour.', 'గంట కోసం చిన్న ముల్లు చూడు.'), L('Long hand: 3 → 15, 6 → 30, 9 → 45, 12 → 00.', 'పెద్ద ముల్లు: 3 → 15, 6 → 30, 9 → 45, 12 → 00.')],
          mistakes: [{ when: 'wrong', explain: L('Do not mix up the hands — the SHORT hand tells the hour.', 'ముల్లులను కలపకు — చిన్న ముల్లు గంటను చెబుతుంది.') }],
          solution: [L(`Short hand → ${h}, long hand → ${pad2(m)} minutes. Time: ${t(h, m)}`, `చిన్న ముల్లు → ${h}, పెద్ద ముల్లు → ${pad2(m)} నిమిషాలు. టైమ్: ${t(h, m)}`)],
        };
      }),
      tp('days', (r) => {
        const d = r.int(0, 6), n = r.int(2, 9);
        const ans = DAYS[(d + n) % 7];
        return {
          type: 'mcq', prompt: L(`Today is ${DAYS[d].en}. Which day will it be after ${n} days?`, `ఈ రోజు ${DAYS[d].te}. ${n} రోజుల తర్వాత ఏ రోజు?`),
          ...choose(r, ans, [DAYS[(d + n + 1) % 7], DAYS[(d + n + 6) % 7], DAYS[(d + n + 3) % 7]]),
          hints: [L('Count forward one day at a time.', 'ఒక్కో రోజు ముందుకు లెక్కించు.'), L('After Sunday comes Monday again.', 'ఆదివారం తర్వాత మళ్ళీ సోమవారం.')],
          solution: [L(`Counting ${n} days on from ${DAYS[d].en} gives ${ans.en}.`, `${DAYS[d].te} నుండి ${n} రోజులు లెక్కిస్తే ${ans.te}.`)],
        };
      }),
      tp('months', (r) => {
        const s = r.int(0, 8);
        const seq = MONTHS.slice(s, s + 4);
        return {
          type: 'order', prompt: L('Put these months in calendar order.', 'ఈ నెలలను క్యాలెండర్ క్రమంలో పెట్టు.'), ...ordering(r, seq),
          hints: [L('January is the first month of the year.', 'సంవత్సరంలో మొదటి నెల జనవరి.'), L('Say the months aloud from January.', 'జనవరి నుండి నెలలను గట్టిగా చెప్పు.')],
          solution: [L(seq.map((x) => x.en).join(' → '), seq.map((x) => x.te!).join(' → '))],
        };
      }),
    ],
  }],
};

const STALLS: Localized[] = [L('Bangles', 'గాజులు'), L('Pots', 'కుండలు'), L('Toys', 'బొమ్మలు'), L('Sweets', 'మిఠాయిలు'), L('Kites', 'గాలిపటాలు')];
const surajkund: USpec = {
  id: 'c3.u.surajkund', subject: 'math', title: L('The Surajkund Fair', 'సూరజ్‌కుండ్ జాతర'), source: src('mm3', 14, 'The Surajkund Fair'),
  objectives: [{
    id: 'c3.data.fair', title: L('Reading pictures and bar graphs; patterns', 'బొమ్మలు, బార్ గ్రాఫ్‌లు చదవడం; నమూనాలు'),
    activities: ['game:patterns'],
    intro: [
      p('At a fair, we can record how many things each stall sold. A bar graph shows this — a taller bar means more.', 'జాతరలో ఒక్కో దుకాణం ఎన్ని అమ్మిందో రాసుకోవచ్చు. బార్ గ్రాఫ్ దీన్ని చూపిస్తుంది — ఎత్తైన బార్ అంటే ఎక్కువ.'),
      vis({ kind: 'bar-graph', labels: ['Bangles', 'Pots', 'Toys'], values: [12, 7, 9], unit: 'sold' }, 'Bar graph of things sold at three stalls', 'మూడు దుకాణాల్లో అమ్మిన వస్తువుల బార్ గ్రాఫ్'),
      p('Rangoli and border designs repeat in patterns. Find the part that repeats to say what comes next.', 'ముగ్గులు, అంచు డిజైన్లు నమూనాల్లో పునరావృతమవుతాయి. తర్వాత ఏది వస్తుందో చెప్పడానికి పునరావృతమయ్యే భాగాన్ని కనుక్కో.'),
    ],
    examples: [
      ex(L('Bangles 12, pots 7. How many more bangles than pots?', 'గాజులు 12, కుండలు 7. కుండల కంటే గాజులు ఎన్ని ఎక్కువ?'), [L('12 − 7 = 5', '12 − 7 = 5')], L('5 more', '5 ఎక్కువ'), { kind: 'bar-graph', labels: ['Bangles', 'Pots'], values: [12, 7] }),
      ex(L('🔺🔵🔵🔺🔵🔵🔺 … what comes next?', '🔺🔵🔵🔺🔵🔵🔺 … తర్వాత ఏది?'), [L('The part 🔺🔵🔵 repeats.', '🔺🔵🔵 అనే భాగం పునరావృతమవుతుంది.'), L('After 🔺 comes 🔵.', '🔺 తర్వాత 🔵.')], L('🔵', '🔵')),
    ],
    practice: [
      tp('graph', (r) => {
        const st = r.shuffle(STALLS).slice(0, 4);
        const vals = r.shuffle([4, 6, 8, 10, 12, 15, 9]).slice(0, 4);
        const ask = r.pick(['diff', 'total'] as const);
        const [i, j] = vals[0] > vals[1] ? [0, 1] : [1, 0];
        const ans = ask === 'diff' ? vals[i] - vals[j] : vals[0] + vals[1];
        return {
          type: 'graph', keypad: 'numeric', visual: { kind: 'bar-graph', labels: st.map((s) => s.en), values: vals, unit: 'sold' },
          prompt: ask === 'diff' ? L(`How many more ${st[i].en.toLowerCase()} were sold than ${st[j].en.toLowerCase()}?`, `${st[j].te} కంటే ${st[i].te} ఎన్ని ఎక్కువ అమ్ముడయ్యాయి?`) : L(`How many ${st[0].en.toLowerCase()} and ${st[1].en.toLowerCase()} were sold altogether?`, `${st[0].te}, ${st[1].te} మొత్తం ఎన్ని అమ్ముడయ్యాయి?`),
          answer: num(ans),
          hints: [L('Read the height of each bar.', 'ప్రతి బార్ ఎత్తు చదువు.'), ask === 'diff' ? L('"How many more" → subtract.', '"ఎన్ని ఎక్కువ" → తీసివేయి.') : L('"Altogether" → add.', '"మొత్తం" → కూడు.')],
          solution: [ask === 'diff' ? L(`${vals[i]} − ${vals[j]} = ${ans}`, `${vals[i]} − ${vals[j]} = ${ans}`) : L(`${vals[0]} + ${vals[1]} = ${ans}`, `${vals[0]} + ${vals[1]} = ${ans}`)],
        };
      }),
      tp('pattern', (r) => {
        const sym = r.shuffle(['🔺', '🔵', '⭐', '🟩', '🌼', '🪔']).slice(0, 3);
        const unit = r.pick([[0, 1], [0, 1, 1], [0, 0, 1], [0, 1, 2]]).map((k) => sym[k]);
        const len = r.int(unit.length + 2, unit.length * 2 + 1);
        const seq = range(0, len - 1).map((i) => unit[i % unit.length]);
        const ans = unit[len % unit.length];
        return {
          type: 'mcq', prompt: L(`What comes next? ${seq.join(' ')} …`, `తర్వాత ఏది? ${seq.join(' ')} …`), ...choose(r, ans, sym.filter((s) => s !== ans)),
          hints: [L('Find the part that repeats.', 'పునరావృతమయ్యే భాగాన్ని కనుక్కో.'), L(`The repeating part is ${unit.join(' ')}.`, `పునరావృత భాగం ${unit.join(' ')}.`)],
          solution: [L(`Repeat ${unit.join(' ')} → next is ${ans}`, `${unit.join(' ')} పునరావృతం → తర్వాత ${ans}`)],
        };
      }),
    ],
  }],
};

// ================================================================ PHYSICAL SCIENCE (exploration)
const EVS_NOTE = 'Age-appropriate physical-science exploration; mapping to NCERT EVS "Our Wondrous World" chapters needs educator verification.';
type Fact = [Localized, Localized, Localized[]];

const shadow: USpec = {
  id: 'c3.u.shadow', subject: 'physics', title: L('Light and Shadows', 'వెలుగు, నీడలు'), source: null, note: EVS_NOTE,
  objectives: [{
    id: 'c3.sci.shadow', title: L('How shadows change', 'నీడలు ఎలా మారుతాయి'), enrichment: true,
    activities: ['lab:light', 'art:color'],
    intro: [
      p('A shadow forms when an object blocks light. The shadow is always on the side away from the light.', 'ఒక వస్తువు వెలుగును అడ్డుకున్నప్పుడు నీడ ఏర్పడుతుంది. నీడ ఎప్పుడూ వెలుగుకు అవతలి వైపు ఉంటుంది.'),
      p('In the morning and evening the Sun is low, so shadows are long. At noon the Sun is high, so shadows are short.', 'ఉదయం, సాయంత్రం సూర్యుడు కిందగా ఉంటాడు, అందుకే నీడలు పొడవుగా ఉంటాయి. మధ్యాహ్నం సూర్యుడు పైన ఉంటాడు, నీడలు పొట్టిగా ఉంటాయి.'),
      tip('Try it: stand outside at 8 am and at 12 noon and compare your shadow.', 'ప్రయత్నించు: ఉదయం 8కి, మధ్యాహ్నం 12కి బయట నిలబడి నీ నీడను పోల్చు.'),
      act('lab:light?angle=60', 'Play with a light beam in the Light Lab', 'లైట్ ల్యాబ్‌లో కాంతి కిరణంతో ఆడు'),
    ],
    examples: [
      ex(L('In the morning the Sun is in the east. Where is your shadow?', 'ఉదయం సూర్యుడు తూర్పున ఉంటాడు. నీ నీడ ఎక్కడ?'), [L('The shadow falls away from the light.', 'నీడ వెలుగుకు దూరంగా పడుతుంది.'), L('Away from east is west.', 'తూర్పుకు ఎదురు పడమర.')], L('Towards the west', 'పడమర వైపు')),
      ex(L('You move a torch closer to a toy. What happens to its shadow on the wall?', 'టార్చ్‌ను బొమ్మకు దగ్గరగా తెస్తే గోడపై దాని నీడ ఏమవుతుంది?'), [L('The toy blocks more of the light.', 'బొమ్మ ఎక్కువ వెలుగును అడ్డుకుంటుంది.')], L('The shadow gets bigger', 'నీడ పెద్దదవుతుంది')),
    ],
    practice: [
      tp('facts', (r) => {
        const bank: Fact[] = [
          [L('At 12 noon the Sun is high in the sky. How is your shadow?', 'మధ్యాహ్నం 12కి సూర్యుడు ఆకాశంలో పైన ఉంటాడు. నీ నీడ ఎలా ఉంటుంది?'), L('Short', 'పొట్టిగా'), [L('Very long', 'చాలా పొడవుగా'), L('There is no light', 'వెలుగే ఉండదు')]],
          [L('At 7 in the morning, how is the shadow of a tree?', 'ఉదయం 7కి చెట్టు నీడ ఎలా ఉంటుంది?'), L('Long', 'పొడవుగా'), [L('Short', 'పొట్టిగా'), L('Not there at all', 'అస్సలు ఉండదు')]],
          [L('In the evening the Sun is in the west. Where does your shadow fall?', 'సాయంత్రం సూర్యుడు పడమరలో ఉంటాడు. నీ నీడ ఎటు పడుతుంది?'), L('Towards the east', 'తూర్పు వైపు'), [L('Towards the west', 'పడమర వైపు'), L('Straight up', 'నేరుగా పైకి')]],
          [L('A torch is moved closer to a doll. Its shadow becomes…', 'టార్చ్‌ను బొమ్మకు దగ్గరగా తెస్తే దాని నీడ…'), L('Bigger', 'పెద్దదవుతుంది'), [L('Smaller', 'చిన్నదవుతుంది'), L('Coloured', 'రంగులోకి మారుతుంది')]],
          [L('What do we need to make a shadow?', 'నీడ ఏర్పడడానికి ఏమి కావాలి?'), L('Light and an object that blocks it', 'వెలుగు, దాన్ని అడ్డుకునే వస్తువు'), [L('Only water', 'నీరు మాత్రమే'), L('Only darkness', 'చీకటి మాత్రమే')]],
          [L('What colour is the shadow of a red ball?', 'ఎర్ర బంతి నీడ ఏ రంగులో ఉంటుంది?'), L('Dark (black or grey)', 'నల్లగా (నలుపు లేదా బూడిద)'), [L('Red', 'ఎరుపు'), L('Bright white', 'తెల్లగా మెరుస్తూ')]],
        ];
        const [q, a, w] = r.pick(bank);
        return {
          type: 'mcq', prompt: q, ...choose(r, a, w),
          hints: [L('A shadow is on the side away from the light.', 'నీడ వెలుగుకు అవతలి వైపు ఉంటుంది.'), L('Low Sun → long shadow; high Sun → short shadow.', 'కింద సూర్యుడు → పొడవు నీడ; పైన సూర్యుడు → పొట్టి నీడ.')],
          solution: [a],
        };
      }),
      tp('opaque', (r) => {
        const pool = [
          { label: L('Wooden door', 'చెక్క తలుపు'), ok: true }, { label: L('Steel plate', 'స్టీల్ పళ్ళెం'), ok: true }, { label: L('Your hand', 'నీ చేయి'), ok: true },
          { label: L('Book', 'పుస్తకం'), ok: true }, { label: L('Clear window glass', 'పారదర్శక కిటికీ అద్దం'), ok: false }, { label: L('Clean water in a glass', 'గ్లాసులో శుభ్రమైన నీరు'), ok: false },
          { label: L('Clear plastic sheet', 'పారదర్శక ప్లాస్టిక్ షీట్'), ok: false }, { label: L('Brick', 'ఇటుక'), ok: true },
        ];
        let pick = r.shuffle(pool).slice(0, 5);
        if (!pick.some((x) => !x.ok)) pick = [...pick.slice(0, 4), pool[4]];
        return {
          type: 'tap', prompt: L('Tap everything that makes a dark shadow in sunlight.', 'ఎండలో ముదురు నీడను ఏర్పరిచే ప్రతిదాన్నీ నొక్కు.'), ...tapAll(r, pick),
          hints: [L('Can light pass through it?', 'దాని గుండా వెలుగు వెళ్తుందా?'), L('Things we cannot see through make dark shadows.', 'మనం అవతల చూడలేని వస్తువులు ముదురు నీడలు చేస్తాయి.')],
          solution: [L(`Dark shadows: ${pick.filter((x) => x.ok).map((x) => x.label.en).join(', ')}`, `ముదురు నీడలు: ${pick.filter((x) => x.ok).map((x) => x.label.te).join(', ')}`)],
        };
      }),
    ],
  }],
};

const sound: USpec = {
  id: 'c3.u.sound', subject: 'physics', title: L('Sounds Around Us', 'మన చుట్టూ శబ్దాలు'), source: null, note: EVS_NOTE,
  objectives: [{
    id: 'c3.sci.sound', title: L('Sound comes from vibration', 'కంపనం వల్ల శబ్దం'), enrichment: true,
    activities: ['game:patterns'],
    intro: [
      p('Every sound is made when something vibrates — moves back and forth very fast. Touch your throat while humming and feel it!', 'ఏదైనా కంపించినప్పుడు — చాలా వేగంగా అటూ ఇటూ కదిలినప్పుడు — శబ్దం వస్తుంది. హమ్ చేస్తూ నీ గొంతును తాకి చూడు!'),
      p('Sounds can be loud or soft, and high (like a whistle) or low (like a big drum).', 'శబ్దాలు పెద్దగా లేదా మెల్లగా, ఎక్కువ స్థాయి (ఈల లాగా) లేదా తక్కువ స్థాయి (పెద్ద డోలు లాగా) ఉండవచ్చు.'),
      tip('Hitting a drum harder makes a louder sound.', 'డోలును గట్టిగా కొడితే శబ్దం పెద్దగా వస్తుంది.'),
    ],
    examples: [
      ex(L('A veena string is plucked. What makes the sound?', 'వీణ తీగను మీటారు. శబ్దం దేని వల్ల?'), [L('The string moves back and forth quickly.', 'తీగ వేగంగా అటూ ఇటూ కదులుతుంది.')], L('The vibrating string', 'కంపించే తీగ')),
      ex(L('Which sound is higher: a whistle or a lion\'s roar?', 'ఏ శబ్దం ఎక్కువ స్థాయి: ఈల లేదా సింహం గర్జన?'), [L('A whistle is shrill and thin.', 'ఈల సన్నగా, కీచుగా ఉంటుంది.')], L('The whistle', 'ఈల')),
    ],
    practice: [
      tp('facts', (r) => {
        const bank: Fact[] = [
          [L('What happens to a drum skin when you beat it?', 'డోలు చర్మాన్ని కొట్టినప్పుడు ఏమవుతుంది?'), L('It vibrates', 'అది కంపిస్తుంది'), [L('It melts', 'కరిగిపోతుంది'), L('It glows', 'మెరుస్తుంది')]],
          [L('You hit a plate gently, then hard. The second sound is…', 'పళ్ళాన్ని మెల్లగా, తర్వాత గట్టిగా కొట్టావు. రెండో శబ్దం…'), L('Louder', 'పెద్దగా'), [L('Softer', 'మెల్లగా'), L('Silent', 'శబ్దం లేదు')]],
          [L('Which makes a low sound?', 'ఏది తక్కువ స్థాయి శబ్దం చేస్తుంది?'), L('A big drum', 'పెద్ద డోలు'), [L('A bird chirping', 'పక్షి కిలకిల'), L('A whistle', 'ఈల')]],
          [L('Which makes a high sound?', 'ఏది ఎక్కువ స్థాయి శబ్దం చేస్తుంది?'), L('A mouse squeak', 'ఎలుక కీచు'), [L('Thunder', 'ఉరుము'), L('A cow mooing', 'ఆవు అరుపు')]],
          [L('A temple bell stops ringing when you hold it. Why?', 'గుడి గంటను పట్టుకుంటే మోగడం ఆగుతుంది. ఎందుకు?'), L('It stops vibrating', 'కంపించడం ఆగుతుంది'), [L('It gets cold', 'చల్లబడుతుంది'), L('The light goes away', 'వెలుగు పోతుంది')]],
          [L('Why do we cover our ears near loud crackers?', 'పెద్ద టపాసుల దగ్గర చెవులు ఎందుకు మూసుకుంటాం?'), L('Very loud sound can hurt our ears', 'చాలా పెద్ద శబ్దం చెవులకు హాని చేస్తుంది'), [L('To hear better', 'బాగా వినడానికి'), L('To keep warm', 'వెచ్చగా ఉండడానికి')]],
        ];
        const [q, a, w] = r.pick(bank);
        return { type: 'mcq', prompt: q, ...choose(r, a, w), hints: [L('Sound is made by vibration.', 'శబ్దం కంపనం వల్ల వస్తుంది.'), L('Big, slow vibrations → low sounds; small, fast ones → high sounds.', 'పెద్ద, నెమ్మది కంపనాలు → తక్కువ స్థాయి; చిన్న, వేగమైనవి → ఎక్కువ స్థాయి.')], solution: [a] };
      }),
      tp('high', (r) => {
        const pool = [
          { label: L('Whistle', 'ఈల'), ok: true }, { label: L('Bird chirp', 'పక్షి కిలకిల'), ok: true }, { label: L('Mouse squeak', 'ఎలుక కీచు'), ok: true }, { label: L('Baby crying', 'పాప ఏడుపు'), ok: true },
          { label: L('Lion roar', 'సింహం గర్జన'), ok: false }, { label: L('Big drum', 'పెద్ద డోలు'), ok: false }, { label: L('Thunder', 'ఉరుము'), ok: false }, { label: L('Truck horn', 'లారీ హారన్'), ok: false },
        ];
        let pick = r.shuffle(pool).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick = [pool[0], ...pick.slice(1)];
        if (pick.every((x) => x.ok)) pick = [...pick.slice(0, 4), pool[5]];
        return {
          type: 'tap', prompt: L('Tap every HIGH (shrill) sound.', 'ఎక్కువ స్థాయి (కీచు) శబ్దాలన్నిటినీ నొక్కు.'), ...tapAll(r, pick),
          hints: [L('High sounds are thin and sharp.', 'ఎక్కువ స్థాయి శబ్దాలు సన్నగా, పదునుగా ఉంటాయి.'), L('Low sounds are deep and heavy.', 'తక్కువ స్థాయి శబ్దాలు లోతుగా, బరువుగా ఉంటాయి.')],
          solution: [L(`High sounds: ${pick.filter((x) => x.ok).map((x) => x.label.en).join(', ')}`, `ఎక్కువ స్థాయి: ${pick.filter((x) => x.ok).map((x) => x.label.te).join(', ')}`)],
        };
      }),
    ],
  }],
};

const FLOAT = [
  { l: L('wooden spoon', 'చెక్క గరిటె'), e: '🥄', ok: true }, { l: L('leaf', 'ఆకు'), e: '🍃', ok: true }, { l: L('paper boat', 'కాగితం పడవ'), e: '⛵', ok: true },
  { l: L('rubber duck', 'రబ్బరు బాతు'), e: '🦆', ok: true }, { l: L('empty plastic bottle', 'ఖాళీ ప్లాస్టిక్ సీసా'), e: '🧴', ok: true }, { l: L('dry coconut', 'ఎండు కొబ్బరి'), e: '🥥', ok: true },
  { l: L('stone', 'రాయి'), e: '🪨', ok: false }, { l: L('iron key', 'ఇనుప తాళం చెవి'), e: '🔑', ok: false }, { l: L('coin', 'నాణెం'), e: '🪙', ok: false },
  { l: L('iron nail', 'ఇనుప మేకు'), e: '📌', ok: false }, { l: L('glass marble', 'గాజు గోలీ'), e: '🔮', ok: false },
];
const floatU: USpec = {
  id: 'c3.u.float', subject: 'physics', title: L('Floating and Sinking', 'తేలడం, మునగడం'), source: null, note: EVS_NOTE,
  objectives: [{
    id: 'c3.sci.float', title: L('What floats and what sinks?', 'ఏది తేలుతుంది, ఏది మునుగుతుంది?'), enrichment: true,
    activities: ['game:logic'],
    intro: [
      p('Put things in a bucket of water: some stay on top (float), some go to the bottom (sink).', 'బకెట్ నీటిలో వస్తువులు వేయి: కొన్ని పైన ఉంటాయి (తేలుతాయి), కొన్ని అడుగుకు వెళ్తాయి (మునుగుతాయి).'),
      p('Wood, leaves, and things filled with air usually float. Stones, coins and iron things usually sink — even small ones!', 'చెక్క, ఆకులు, గాలితో నిండినవి సాధారణంగా తేలుతాయి. రాళ్ళు, నాణేలు, ఇనుప వస్తువులు చిన్నవైనా మునుగుతాయి!'),
      tip('Guess first, then test — that is how scientists work.', 'ముందు ఊహించు, తర్వాత పరీక్షించు — శాస్త్రవేత్తలు అలాగే చేస్తారు.'),
    ],
    examples: [
      ex(L('Will a small coin float or sink?', 'చిన్న నాణెం తేలుతుందా, మునుగుతుందా?'), [L('It is small but made of metal, which is heavy for its size.', 'అది చిన్నదే కానీ లోహంతో చేసింది, దాని పరిమాణానికి బరువు.')], L('It sinks', 'మునుగుతుంది')),
      ex(L('Will a big wooden log float?', 'పెద్ద చెక్క దుంగ తేలుతుందా?'), [L('Wood is light for its size, even when the piece is big.', 'చెక్క పెద్దదైనా దాని పరిమాణానికి తేలిక.')], L('It floats', 'తేలుతుంది')),
    ],
    practice: [
      tp('tap', (r) => {
        let pick = r.shuffle(FLOAT).slice(0, 5);
        if (!pick.some((x) => x.ok)) pick = [FLOAT[0], ...pick.slice(1)];
        if (pick.every((x) => x.ok)) pick = [...pick.slice(0, 4), FLOAT[6]];
        return {
          type: 'tap', prompt: L('Tap everything that will FLOAT in water.', 'నీటిలో తేలే ప్రతిదాన్నీ నొక్కు.'),
          ...tapAll(r, pick.map((x) => ({ label: x.l, ok: x.ok, visual: { kind: 'emoji', text: x.e } as VisualSpec }))),
          hints: [L('Wood and things with air inside float.', 'చెక్క, లోపల గాలి ఉన్నవి తేలుతాయి.'), L('Metal and stone things sink.', 'లోహం, రాయి వస్తువులు మునుగుతాయి.')],
          mistakes: [{ when: 'wrong', explain: L('Size is not the clue — a tiny coin sinks but a big log floats. Think about what it is made of.', 'పరిమాణం కాదు ముఖ్యం — చిన్న నాణెం మునుగుతుంది, పెద్ద దుంగ తేలుతుంది. అది దేనితో చేశారో ఆలోచించు.') }],
          solution: [L(`Float: ${pick.filter((x) => x.ok).map((x) => x.l.en).join(', ')}`, `తేలేవి: ${pick.filter((x) => x.ok).map((x) => x.l.te).join(', ')}`)],
        };
      }),
      tp('spoken', (r) => {
        const want = r.pick([true, false]);
        const good = r.pick(FLOAT.filter((x) => x.ok === want));
        const bad = r.shuffle(FLOAT.filter((x) => x.ok !== want)).slice(0, 2);
        const verb = want ? L('floats', 'తేలుతుంది') : L('sinks', 'మునుగుతుంది');
        return {
          type: 'spoken', prompt: L(`Which one ${verb.en}?`, `ఏది ${verb.te}?`), say: L(`Listen: which one ${verb.en} in water? Tap the picture.`, `విను: నీటిలో ఏది ${verb.te}? బొమ్మను నొక్కు.`),
          ...pictures(r, { label: good.l, visual: { kind: 'emoji', text: good.e } }, bad.map((b) => ({ label: b.l, visual: { kind: 'emoji', text: b.e } as VisualSpec }))),
          hints: [L('Think: wood or metal?', 'ఆలోచించు: చెక్కా, లోహమా?'), L('Things with air inside float.', 'లోపల గాలి ఉన్నవి తేలుతాయి.')],
          solution: [L(`The ${good.l.en} ${verb.en}.`, `${good.l.te} ${verb.te}.`)],
        };
      }),
    ],
  }],
};

const force: USpec = {
  id: 'c3.u.force', subject: 'physics', title: L('Push, Pull and Rubbing', 'తోయడం, లాగడం, రాపిడి'), source: null, note: EVS_NOTE,
  objectives: [{
    id: 'c3.sci.push-pull', title: L('Pushes, pulls and rough or smooth surfaces', 'తోపు, లాగు; గరుకు, నునుపు ఉపరితలాలు'), enrichment: true,
    activities: ['lab:forces'],
    intro: [
      p('A push moves something away from you; a pull brings it towards you. Pushes and pulls can start, stop or turn moving things.', 'తోపు వస్తువును నీకు దూరంగా కదిలిస్తుంది; లాగు నీ వైపు తెస్తుంది. తోపులు, లాగులు కదిలే వస్తువులను మొదలుపెట్టగలవు, ఆపగలవు, తిప్పగలవు.'),
      p('A ball rolls far on a smooth floor but stops quickly on grass or sand. Rough surfaces rub more and slow things down.', 'నునుపైన నేలపై బంతి దూరం దొర్లుతుంది, కానీ గడ్డి లేదా ఇసుకపై త్వరగా ఆగుతుంది. గరుకు ఉపరితలాలు ఎక్కువ రాపిడి చేసి నెమ్మదింపజేస్తాయి.'),
      act('lab:forces?mass=2&force=10&friction=0.1', 'Push a box on a smooth floor', 'నునుపు నేలపై పెట్టెను తోయి'),
      act('lab:forces?mass=2&force=10&friction=0.6', 'Now push it on a rough floor', 'ఇప్పుడు గరుకు నేలపై తోయి'),
    ],
    examples: [
      ex(L('Opening a drawer: push or pull?', 'సొరుగు తెరవడం: తోపా, లాగా?'), [L('The drawer comes towards you.', 'సొరుగు నీ వైపు వస్తుంది.')], L('Pull', 'లాగు')),
      ex(L('The same push is given to a toy car on a marble floor and on a carpet. Where does it go farther?', 'ఒకే తోపుతో బొమ్మ కారును మార్బుల్ నేలపై, తివాచీపై తోశాం. ఎక్కడ ఎక్కువ దూరం వెళ్తుంది?'), [L('The marble floor is smoother, so it rubs less.', 'మార్బుల్ నేల నునుపు, రాపిడి తక్కువ.')], L('On the marble floor', 'మార్బుల్ నేలపై')),
    ],
    practice: [
      tp('pushpull', (r) => {
        const acts: [Localized, boolean][] = [
          [L('kicking a football', 'ఫుట్‌బాల్ తన్నడం'), true], [L('opening a drawer', 'సొరుగు తెరవడం'), false], [L('drawing water from a well with a rope', 'తాడుతో బావి నుండి నీళ్ళు తోడడం'), false],
          [L('closing a door', 'తలుపు మూయడం'), true], [L('flying a kite by its string', 'దారంతో గాలిపటం ఎగరేయడం'), false], [L('pushing a vegetable cart', 'కూరగాయల బండిని తోయడం'), true],
          [L('pulling a bucket towards you', 'బకెట్‌ను నీ వైపు లాగడం'), false], [L('pressing a doorbell switch', 'డోర్‌బెల్ స్విచ్ నొక్కడం'), true],
        ];
        const [a, isPush] = r.pick(acts);
        const ans = isPush ? L('Push', 'తోపు') : L('Pull', 'లాగు');
        return {
          type: 'mcq', prompt: L(`Is ${a.en} a push or a pull?`, `${a.te} — తోపా లేదా లాగా?`), ...choose(r, ans, [isPush ? L('Pull', 'లాగు') : L('Push', 'తోపు')]),
          hints: [L('Push → away from you. Pull → towards you.', 'తోపు → నీకు దూరంగా. లాగు → నీ వైపు.')],
          solution: [L(`${a.en[0].toUpperCase() + a.en.slice(1)} is a ${ans.en.toLowerCase()}.`, `${a.te} ఒక ${ans.te}.`)],
        };
      }),
      tp('friction', (r) => {
        const thing = r.pick([L('toy car', 'బొమ్మ కారు'), L('marble', 'గోలీ'), L('ball', 'బంతి'), L('carrom striker', 'క్యారమ్ స్ట్రైకర్')]);
        const far = r.pick([true, false]);
        const surf = [L('smooth marble floor', 'నునుపైన మార్బుల్ నేల'), L('carpet', 'తివాచీ'), L('sand', 'ఇసుక'), L('grass', 'గడ్డి')];
        const ans = far ? surf[0] : surf[2];
        return {
          type: 'mcq', prompt: L(`A ${thing.en} is given the same push on each surface. Where will it go the ${far ? 'farthest' : 'shortest distance'}?`, `ఒకే తోపుతో ${thing.te}ను ప్రతి ఉపరితలంపై తోశాం. ఎక్కడ ${far ? 'అన్నిటికంటే ఎక్కువ' : 'అన్నిటికంటే తక్కువ'} దూరం వెళ్తుంది?`),
          ...choose(r, ans, surf.filter((s) => s !== ans)),
          hints: [L('Rough surfaces rub more and slow things down.', 'గరుకు ఉపరితలాలు ఎక్కువ రాపిడి చేసి నెమ్మదింపజేస్తాయి.'), L('Which surface is the smoothest? Which is the roughest?', 'ఏది అన్నిటికంటే నునుపు? ఏది అన్నిటికంటే గరుకు?')],
          solution: [L(far ? 'The smooth marble floor rubs least, so it goes farthest.' : 'Sand is the roughest and softest, so it stops quickly.', far ? 'నునుపైన మార్బుల్ నేలపై రాపిడి తక్కువ, అందుకే ఎక్కువ దూరం.' : 'ఇసుక అన్నిటికంటే గరుకు, మెత్తన, అందుకే త్వరగా ఆగుతుంది.')],
        };
      }),
    ],
  }],
};

export default buildClass(5, [name, toy, century, vacation, shapes, hundreds1, rakhi, fair, hundreds2, party, lift, give, timeU, surajkund, shadow, sound, floatU, force, ...tsClass3]);
