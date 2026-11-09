// Class 2 — NCERT Joyful Mathematics (Class 2) + age-appropriate physical-science exploration.
// Telugu (te) provided for all learner-facing text; needs native-speaker review.
import {
  buildClass, src, tp, ex, p, tip, vis, act, L, num, choose, chooseNum, matching, ordering, tapAll,
  NAMES, THINGS, range, type USpec,
} from '../lib/kit';
import type { Localized, VisualSpec } from '../../shared/content';
import type { Rng } from '../../shared/grading';

const obj = (emoji: string, count: number, groupsOf?: number): VisualSpec => (groupsOf ? { kind: 'objects', emoji, count, groupsOf } : { kind: 'objects', emoji, count });
type Fact = { q: Localized; a: Localized; w: Localized[] };
const factQ = (r: Rng, pool: Fact[], hint: Localized, type: 'mcq' | 'spoken' = 'mcq') => {
  const f = r.pick(pool);
  return { type, prompt: f.q, ...choose(r, f.a, f.w), hints: [hint], mistakes: [{ when: 'wrong', explain: L('Think about what you have seen or tried yourself.', 'నువ్వు చూసినది లేదా చేసి చూసినది ఆలోచించు.') }], solution: [L(`Answer: ${f.a.en}`, `జవాబు: ${f.a.te ?? f.a.en}`)] };
};
const NO_EVS = 'NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.';

// ---------------------------------------------------------------- 1 A Day at the Beach
const beach: USpec = {
  id: 'c2.u.beach', subject: 'math', title: L('A Day at the Beach', 'సముద్ర తీరంలో ఒక రోజు'), source: src('jm2', 1, 'A Day at the Beach'),
  objectives: [{
    id: 'c2.num.groups', title: L('Counting in groups of 2, 5 and 10', '2, 5, 10 గుంపులుగా లెక్కించడం'),
    activities: ['game:counting', 'game:numberline'],
    intro: [
      p('Counting in groups is faster: 2, 4, 6, 8… or 5, 10, 15, 20… or 10, 20, 30…', 'గుంపులుగా లెక్కించడం వేగం: 2, 4, 6, 8… లేదా 5, 10, 15, 20… లేదా 10, 20, 30…'),
      vis(obj('🐚', 15, 5), 'Fifteen shells in groups of five', 'ఐదేసి గుంపులుగా పదిహేను గవ్వలు'),
      tip('Circle groups first, then skip count.', 'ముందు గుంపులు చుట్టు, తర్వాత దాటుతూ లెక్కించు.'),
    ],
    examples: [
      ex(L('Count the shells in fives.', 'గవ్వలను ఐదేసి లెక్కించు.'), [L('5, 10, 15, 20', '5, 10, 15, 20')], L('20 shells', '20 గవ్వలు'), obj('🐚', 20, 5)),
      ex(L('What comes next: 10, 20, 30, …?', 'తర్వాత ఏది: 10, 20, 30, …?'), [L('Add 10 each time.', 'ప్రతిసారి 10 కలుపు.')], L('40', '40')),
    ],
    practice: [
      tp('count', (r) => {
        const g = r.pick([2, 5, 10]), k = r.int(2, g === 10 ? 6 : 8), t = r.pick(THINGS);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`Count the ${t.en} in groups of ${g}. How many?`, `${t.te}ను ${g} చొప్పున లెక్కించు. ఎన్ని?`), visual: obj(t.emoji, g * k, g), answer: num(g * k),
          hints: [L(`Say: ${range(1, Math.min(k, 3)).map((i) => i * g).join(', ')}…`, `చెప్పు: ${range(1, Math.min(k, 3)).map((i) => i * g).join(', ')}…`), L(`There are ${k} groups.`, `${k} గుంపులు ఉన్నాయి.`)],
          mistakes: [{ when: String(k), explain: L('That is the number of groups. Count the things inside them.', 'అది గుంపుల సంఖ్య. లోపల ఉన్నవి లెక్కించు.') }],
          solution: [L(range(1, k).map((i) => i * g).join(', '), range(1, k).map((i) => i * g).join(', '))],
        };
      }),
      tp('skip', (r) => {
        const g = r.pick([2, 5, 10]), s = r.int(1, 6) * g;
        const seq = range(0, 3).map((i) => s + i * g);
        return {
          type: 'mcq', prompt: L(`What comes next? ${seq.join(', ')}, ?`, `తర్వాత ఏది? ${seq.join(', ')}, ?`), ...chooseNum(r, s + 4 * g, [seq[3] + 1, s + 5 * g, seq[3] + 2]),
          hints: [L('How much is added each time?', 'ప్రతిసారి ఎంత కలుస్తోంది?')],
          mistakes: [{ when: 'wrong', explain: L(`The numbers jump by ${g}, not by 1.`, `సంఖ్యలు 1 కాదు, ${g} చొప్పున పెరుగుతున్నాయి.`) }],
          solution: [L(`${seq[3]} + ${g} = ${s + 4 * g}`, `${seq[3]} + ${g} = ${s + 4 * g}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 2 Shapes Around Us (3D)
const SOLIDS: [Localized, Localized][] = [
  [L('a ball', 'బంతి'), L('sphere', 'గోళం')], [L('a laddoo', 'లడ్డూ'), L('sphere', 'గోళం')], [L('a dice', 'పాచిక'), L('cube', 'ఘనం')], [L('a sugar cube', 'చక్కెర ముక్క'), L('cube', 'ఘనం')],
  [L('a gas cylinder', 'గ్యాస్ సిలిండర్'), L('cylinder', 'స్తూపం')], [L('a drum', 'డప్పు'), L('cylinder', 'స్తూపం')], [L('an ice-cream cone', 'ఐస్‌క్రీమ్ కోన్'), L('cone', 'శంకువు')], [L('a birthday cap', 'పుట్టినరోజు టోపీ'), L('cone', 'శంకువు')],
  [L('a brick', 'ఇటుక'), L('cuboid', 'దీర్ఘఘనం')], [L('a lunch box', 'టిఫిన్ బాక్స్'), L('cuboid', 'దీర్ఘఘనం')],
];
const SOLID_NAMES = [L('sphere', 'గోళం'), L('cube', 'ఘనం'), L('cylinder', 'స్తూపం'), L('cone', 'శంకువు'), L('cuboid', 'దీర్ఘఘనం')];
const shapes3d: USpec = {
  id: 'c2.u.shapes', subject: 'math', title: L('Shapes Around Us', 'మన చుట్టూ ఆకారాలు'), source: src('jm2', 2, 'Shapes Around Us'),
  objectives: [{
    id: 'c2.geo.solids', title: L('Solid shapes: sphere, cube, cylinder, cone, cuboid', 'ఘన ఆకారాలు: గోళం, ఘనం, స్తూపం, శంకువు'),
    activities: ['game:shapes'],
    intro: [
      p('Things around us have solid shapes. A ball is a sphere; a dice is a cube; a pipe is a cylinder; a cone has a point.', 'మన చుట్టూ వస్తువులకు ఘన ఆకారాలు ఉన్నాయి. బంతి గోళం; పాచిక ఘనం; పైపు స్తూపం; శంకువుకు ఒక మొన ఉంటుంది.'),
      tip('A sphere rolls in every direction. A cube only slides.', 'గోళం అన్ని వైపులా దొర్లుతుంది. ఘనం జారుతుంది మాత్రమే.'),
    ],
    examples: [
      ex(L('What shape is a laddoo?', 'లడ్డూ ఏ ఆకారం?'), [L('It is round all over, like a ball.', 'అది బంతిలా అంతా గుండ్రంగా ఉంటుంది.')], L('Sphere', 'గోళం'), { kind: 'emoji', text: '🟠' }),
      ex(L('Which can roll AND stand flat: cylinder or cube?', 'ఏది దొర్లుతుంది, నిలబడుతుంది కూడా: స్తూపమా ఘనమా?'), [L('A cylinder has a curved side and flat ends.', 'స్తూపానికి వంపు పక్క, చదునైన చివరలు ఉంటాయి.')], L('Cylinder', 'స్తూపం')),
    ],
    practice: [
      tp('name', (r) => {
        const [o, s] = r.pick(SOLIDS);
        return {
          type: 'mcq', prompt: L(`${o.en[0].toUpperCase() + o.en.slice(1)} is shaped like a…`, `${o.te} ఏ ఆకారంలో ఉంటుంది?`), ...choose(r, s, r.shuffle(SOLID_NAMES.filter((x) => x.en !== s.en))),
          hints: [L('Does it have corners? Does it roll?', 'దానికి మూలలు ఉన్నాయా? అది దొర్లుతుందా?')],
          mistakes: [{ when: 'wrong', explain: L('Picture the object and check its faces and corners.', 'వస్తువును ఊహించి దాని ముఖాలు, మూలలు చూడు.') }],
          solution: [L(`${o.en} is a ${s.en}.`, `${o.te} — ${s.te}.`)],
        };
      }),
      tp('match', (r) => {
        const used = new Set<string>();
        const set = r.shuffle(SOLIDS).filter(([, s]) => (used.has(s.en) ? false : (used.add(s.en), true))).slice(0, 3);
        return {
          type: 'match', prompt: L(`Match each thing to its shape: ${set.map((s) => s[0].en).join(', ')}.`, `ప్రతి వస్తువును ఆకారంతో జత చేయి: ${set.map((s) => s[0].te).join(', ')}.`), ...matching(r, set),
          hints: [L('Start with the one you are sure about.', 'నీకు బాగా తెలిసిన దానితో మొదలుపెట్టు.')],
          mistakes: [{ when: 'wrong', explain: L('A cone has one point; a cylinder has two flat round ends.', 'శంకువుకు ఒక మొన; స్తూపానికి రెండు గుండ్రటి చదునైన చివరలు.') }],
          solution: set.map(([a, b]) => L(`${a.en} → ${b.en}`, `${a.te} → ${b.te}`)),
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 3 Fun with Numbers (place value)
const numbers: USpec = {
  id: 'c2.u.numbers', subject: 'math', title: L('Fun with Numbers', 'సంఖ్యలతో ఆట'), source: src('jm2', 3, 'Fun with Numbers'),
  objectives: [{
    id: 'c2.num.place', title: L('Place value and comparing numbers up to 100 and beyond', 'స్థాన విలువ, సంఖ్యల పోలిక'), prereqs: ['c2.num.groups'],
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('In 64, the 6 means 6 tens (60) and the 4 means 4 ones. 100 is ten tens.', '64 లో 6 అంటే 6 పదులు (60), 4 అంటే 4 ఒకట్లు. 100 అంటే పది పదులు.'),
      vis(obj('🥢', 64, 10), 'Six bundles of ten and four sticks', 'ఆరు పదుల కట్టలు, నాలుగు పుల్లలు'),
      tip('To compare, look at tens first. If tens are equal, look at ones.', 'పోల్చేటప్పుడు ముందు పదులు చూడు. పదులు సమానమైతే ఒకట్లు చూడు.'),
    ],
    examples: [
      ex(L('Which is bigger: 58 or 85?', 'ఏది పెద్దది: 58 లేదా 85?'), [L('58 has 5 tens; 85 has 8 tens.', '58 లో 5 పదులు; 85 లో 8 పదులు.'), L('8 tens is more.', '8 పదులు ఎక్కువ.')], L('85', '85')),
      ex(L('Write 40 + 7 as a number.', '40 + 7 ను సంఖ్యగా రాయి.'), [L('4 tens and 7 ones.', '4 పదులు, 7 ఒకట్లు.')], L('47', '47')),
    ],
    practice: [
      tp('order', (r) => {
        const ns: number[] = [];
        while (ns.length < 4) { const n = r.int(10, 120); if (!ns.includes(n)) ns.push(n); }
        const sorted = [...ns].sort((a, b) => a - b);
        return {
          type: 'order', prompt: L(`Arrange from smallest to biggest: ${ns.join(', ')}.`, `చిన్న నుండి పెద్దకు అమర్చు: ${ns.join(', ')}.`), ...ordering(r, sorted.map(String)),
          hints: [L('Compare the tens digits first.', 'ముందు పదుల అంకెలు పోల్చు.'), L('A 3-digit number is bigger than any 2-digit number.', '3 అంకెల సంఖ్య ఏ 2 అంకెల సంఖ్య కంటే పెద్దది.')],
          mistakes: [{ when: 'wrong', explain: L('Look at the place of each digit, not just the first digit you see.', 'ప్రతి అంకె స్థానం చూడు.') }],
          solution: [L(sorted.join(' < '), sorted.join(' < '))],
        };
      }),
      tp('expand', (r) => {
        const t = r.int(1, 9), o = r.int(1, 9);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${t * 10} + ${o} = ?`, `${t * 10} + ${o} = ?`), answer: num(t * 10 + o),
          hints: [L(`${t * 10} is ${t} tens.`, `${t * 10} అంటే ${t} పదులు.`), L(`Put ${o} in the ones place.`, `ఒకట్ల స్థానంలో ${o} పెట్టు.`)],
          mistakes: [{ when: String(o * 10 + t), explain: L('Tens and ones are swapped. Tens go on the left.', 'పదులు, ఒకట్లు మారిపోయాయి. పదులు ఎడమ వైపు.') }, { when: `${t * 10}${o}`, explain: L(`Do not write ${t * 10} and ${o} side by side; ${t * 10} + ${o} is ${t} tens and ${o} ones.`, `${t * 10}, ${o} పక్కపక్కన రాయకు; ఇది ${t} పదులు, ${o} ఒకట్లు.`) }],
          solution: [L(`${t} tens and ${o} ones = ${t * 10 + o}`, `${t} పదులు, ${o} ఒకట్లు = ${t * 10 + o}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 4 Shadow Story (2D shapes)
const SHADOW: [Localized, 'circle' | 'rectangle' | 'square' | 'triangle' | 'oval' | 'star' | 'diamond', Localized][] = [
  [L('a coin', 'నాణెం'), 'circle', L('circle', 'వృత్తం')], [L('a plate', 'పళ్ళెం'), 'circle', L('circle', 'వృత్తం')], [L('a book', 'పుస్తకం'), 'rectangle', L('rectangle', 'దీర్ఘచతురస్రం')],
  [L('a floor tile', 'నేల టైల్'), 'square', L('square', 'చతురస్రం')], [L('a samosa', 'సమోసా'), 'triangle', L('triangle', 'త్రిభుజం')], [L('an egg', 'గుడ్డు'), 'oval', L('oval', 'అండాకారం')],
  [L('a star cookie', 'నక్షత్ర బిస్కెట్'), 'star', L('star', 'నక్షత్రం')], [L('a kite', 'గాలిపటం'), 'diamond', L('diamond', 'వజ్రాకారం')],
];
const POLY: [Localized, 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon', number][] = [
  [L('triangle', 'త్రిభుజం'), 'triangle', 3], [L('square', 'చతురస్రం'), 'square', 4], [L('rectangle', 'దీర్ఘచతురస్రం'), 'rectangle', 4], [L('pentagon', 'పంచభుజి'), 'pentagon', 5], [L('hexagon', 'షడ్భుజి'), 'hexagon', 6],
];
const shadow2d: USpec = {
  id: 'c2.u.shadow', subject: 'math', title: L('Shadow Story', 'నీడల కథ'), source: src('jm2', 4, 'Shadow Story'),
  objectives: [{
    id: 'c2.geo.flat', title: L('Flat shapes from shadows and outlines', 'నీడల నుండి సమతల ఆకారాలు'), prereqs: ['c2.geo.solids'],
    activities: ['game:shapes', 'lab:light', 'art:trace'],
    intro: [
      p('The shadow or outline of an object shows a flat shape: a coin makes a circle, a book makes a rectangle.', 'వస్తువు నీడ లేదా అంచు గీత సమతల ఆకారం చూపిస్తుంది: నాణెం వృత్తం, పుస్తకం దీర్ఘచతురస్రం.'),
      vis({ kind: 'shape', shape: 'triangle', color: '#6366f1' }, 'A triangle has 3 sides and 3 corners', 'త్రిభుజానికి 3 భుజాలు, 3 మూలలు'),
      tip('Trace around a block on paper to see its flat face.', 'కాగితం మీద బ్లాక్ చుట్టూ గీసి దాని ముఖం చూడు.'),
    ],
    examples: [
      ex(L('What shape is the shadow of a coin held flat?', 'చదునుగా పట్టుకున్న నాణెం నీడ ఏ ఆకారం?'), [L('The coin’s face is round.', 'నాణెం ముఖం గుండ్రంగా ఉంటుంది.')], L('Circle', 'వృత్తం'), { kind: 'shape', shape: 'circle' }),
      ex(L('How many corners does a square have?', 'చతురస్రానికి ఎన్ని మూలలు?'), [L('Count each corner: 1, 2, 3, 4.', 'ప్రతి మూల లెక్కించు: 1, 2, 3, 4.')], L('4', '4'), { kind: 'shape', shape: 'square' }),
    ],
    practice: [
      tp('shadow', (r) => {
        const [o, s, name] = r.pick(SHADOW);
        const others = r.shuffle(SHADOW.filter((x) => x[1] !== s)).filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i).slice(0, 2);
        return {
          type: 'spoken', prompt: L(`Which shape is the shadow of ${o.en}?`, `${o.te} నీడ ఏ ఆకారం?`),
          ...choose(r, name, others.map((x) => x[2]), 3, { correct: { kind: 'shape', shape: s }, wrong: others.map((x) => ({ kind: 'shape', shape: x[1] }) as VisualSpec) }),
          hints: [L('Imagine holding it in front of a torch.', 'దాన్ని టార్చి ముందు పట్టుకున్నట్టు ఊహించు.')],
          mistakes: [{ when: 'wrong', explain: L('Look at the outline of its flat face.', 'దాని చదునైన ముఖం అంచు చూడు.') }],
          solution: [L(`The shadow of ${o.en} is a ${name.en}.`, `${o.te} నీడ ${name.te}.`)],
        };
      }),
      tp('corners', (r) => {
        const [n, s, c] = r.pick(POLY);
        const ask = r.pick(['corners', 'sides'] as const);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`How many ${ask} does a ${n.en} have?`, `${n.te}కు ఎన్ని ${ask === 'corners' ? 'మూలలు' : 'భుజాలు'}?`), visual: { kind: 'shape', shape: s }, answer: num(c),
          hints: [L('Touch each one as you count.', 'లెక్కిస్తూ ఒక్కొక్కటి తాకు.'), L('Sides and corners are always the same number in these shapes.', 'ఈ ఆకారాల్లో భుజాలు, మూలలు ఎప్పుడూ సమానం.')],
          mistakes: [{ when: String(c + 1), explain: L('You counted the first one twice. Mark where you start.', 'మొదటిదాన్ని రెండుసార్లు లెక్కించావు. మొదలైన చోట గుర్తు పెట్టు.') }],
          solution: [L(`A ${n.en} has ${c} ${ask}.`, `${n.te}కు ${c} ${ask === 'corners' ? 'మూలలు' : 'భుజాలు'}.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 5 Playing with Lines
const STRAIGHT = 'AEFHIKLMNTVWXYZ'.split(''), CURVED = 'COSUGJ'.split('');
const lines: USpec = {
  id: 'c2.u.lines', subject: 'math', title: L('Playing with Lines', 'గీతలతో ఆట'), source: src('jm2', 5, 'Playing with Lines'),
  objectives: [{
    id: 'c2.geo.lines', title: L('Straight and curved lines', 'సరళ రేఖలు, వక్ర రేఖలు'),
    activities: ['art:trace', 'game:shapes'],
    intro: [
      p('A straight line goes in one direction, like the edge of a ruler. A curved line bends, like a rainbow.', 'సరళ రేఖ ఒకే దిశలో వెళ్తుంది, స్కేలు అంచులా. వక్ర రేఖ వంగుతుంది, ఇంద్రధనుస్సులా.'),
      vis({ kind: 'emoji', text: '📏  🌈' }, 'A ruler edge is straight; a rainbow is curved', 'స్కేలు అంచు సరళం; ఇంద్రధనుస్సు వక్రం'),
      act('art:trace', 'Trace straight and curved lines', 'సరళ, వక్ర రేఖలు దిద్దు', ),
    ],
    examples: [
      ex(L('Is the letter L made of straight lines?', 'L అక్షరం సరళ రేఖలతో ఉందా?'), [L('L has one standing line and one sleeping line.', 'L కు ఒక నిలువు, ఒక అడ్డం గీత.')], L('Yes', 'అవును')),
      ex(L('Is a bangle straight or curved?', 'గాజు సరళమా వక్రమా?'), [L('It bends all the way round.', 'అది చుట్టూ వంగి ఉంటుంది.')], L('Curved', 'వక్రం')),
    ],
    practice: [
      tp('letters', (r) => {
        const s = r.shuffle(STRAIGHT).slice(0, r.int(2, 3)), c = r.shuffle(CURVED).slice(0, 5 - s.length);
        const items = [...s.map((x) => ({ label: x, ok: true })), ...c.map((x) => ({ label: x, ok: false }))];
        return {
          type: 'tap', prompt: L('Tap the letters made only of straight lines.', 'సరళ రేఖలతో మాత్రమే ఉన్న అక్షరాలు నొక్కు.'), ...tapAll(r, items),
          hints: [L('Does the letter have any bend?', 'అక్షరంలో ఏదైనా వంపు ఉందా?')],
          mistakes: [{ when: 'wrong', explain: L('Letters like C, O and S bend — they have curves.', 'C, O, S లాంటి అక్షరాలు వంగుతాయి — వాటిలో వక్రాలు ఉన్నాయి.') }],
          solution: [L(`Straight only: ${s.join(', ')}`, `సరళ రేఖలు మాత్రమే: ${s.join(', ')}`)],
        };
      }),
      tp('objects', (r) => {
        const pool: [Localized, boolean][] = [[L('the edge of a ruler', 'స్కేలు అంచు'), true], [L('a rainbow', 'ఇంద్రధనుస్సు'), false], [L('a bangle', 'గాజు'), false], [L('a door edge', 'తలుపు అంచు'), true], [L('a snake moving', 'కదిలే పాము'), false], [L('a pencil', 'పెన్సిల్'), true], [L('the rim of a plate', 'పళ్ళెం అంచు'), false], [L('a railway track', 'రైలు పట్టా'), true]];
        const [o, st] = r.pick(pool);
        const S = L('Straight', 'సరళం'), C = L('Curved', 'వక్రం');
        return {
          type: 'spoken', prompt: L(`Is ${o.en} straight or curved?`, `${o.te} సరళమా వక్రమా?`), ...choose(r, st ? S : C, [st ? C : S]),
          hints: [L('Run your finger along it in your mind. Does it bend?', 'మనసులో వేలితో దాని మీద తడుము. అది వంగుతుందా?')],
          mistakes: [{ when: 'wrong', explain: L('Straight lines never bend; curved lines bend.', 'సరళ రేఖ వంగదు; వక్ర రేఖ వంగుతుంది.') }],
          solution: [L(`${o.en}: ${st ? 'straight' : 'curved'}`, `${o.te}: ${st ? 'సరళం' : 'వక్రం'}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 6 Decoration for Festival (add/sub)
const festival: USpec = {
  id: 'c2.u.festival', subject: 'math', title: L('Decoration for Festival', 'పండుగ అలంకరణ'), source: src('jm2', 6, 'Decoration for Festival'),
  objectives: [{
    id: 'c2.add.2digit', title: L('Adding and subtracting 2-digit numbers', '2 అంకెల కూడిక, తీసివేత'), prereqs: ['c2.num.place'],
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('Add ones with ones and tens with tens. If ones make 10 or more, carry one ten.', 'ఒకట్లతో ఒకట్లు, పదులతో పదులు కలుపు. ఒకట్లు 10 లేదా ఎక్కువైతే ఒక పదిని పదుల్లోకి తీసుకెళ్ళు.'),
      p('When subtracting, if there are not enough ones, break one ten into 10 ones.', 'తీసివేతలో ఒకట్లు సరిపోకపోతే, ఒక పదిని 10 ఒకట్లుగా మార్చు.'),
      tip('Check a subtraction by adding back.', 'తీసివేతను తిరిగి కలిపి సరిచూడు.'),
    ],
    examples: [
      ex(L('Meena made 38 paper flowers and Teja made 25. How many in all?', 'మీనా 38, తేజ 25 కాగితపు పువ్వులు చేశారు. మొత్తం ఎన్ని?'), [L('Ones: 8 + 5 = 13 → write 3, carry 1 ten.', 'ఒకట్లు: 8 + 5 = 13 → 3 రాసి, 1 పది తీసుకెళ్ళు.'), L('Tens: 3 + 2 + 1 = 6.', 'పదులు: 3 + 2 + 1 = 6.')], L('63 flowers', '63 పువ్వులు')),
      ex(L('52 diyas, 27 are lit. How many are not lit?', '52 దీపాలు, 27 వెలిగించారు. ఎన్ని వెలగలేదు?'), [L('2 ones minus 7? Break a ten: 12 − 7 = 5.', '2 నుండి 7 రాదు; ఒక పదిని మార్చు: 12 − 7 = 5.'), L('Tens: 4 − 2 = 2.', 'పదులు: 4 − 2 = 2.')], L('25 diyas', '25 దీపాలు')),
    ],
    practice: [
      tp('add', (r) => {
        const a = r.int(11, 69), b = r.int(11, 99 - a), n = r.pick(NAMES), t = r.pick([L('diyas', 'దీపాలు'), L('flowers', 'పువ్వులు'), L('mango leaves', 'మామిడి ఆకులు'), L('balloons', 'బెలూన్లు')]);
        const noCarry = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10 + ((a % 10) + (b % 10)) % 10;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${n.en} has ${a} ${t.en} and gets ${b} more for the festival. How many now?`, `${n.te} దగ్గర ${a} ${t.te} ఉన్నాయి, పండుగకు ఇంకా ${b} వచ్చాయి. ఇప్పుడు ఎన్ని?`), answer: num(a + b),
          hints: [L('Add the ones first.', 'ముందు ఒకట్లు కలుపు.'), L('If ones make 10 or more, carry 1 to the tens.', 'ఒకట్లు 10 దాటితే పదుల్లోకి 1 తీసుకెళ్ళు.')],
          mistakes: noCarry !== a + b ? [{ when: String(noCarry), explain: L('You forgot to carry the ten from the ones.', 'ఒకట్ల నుండి వచ్చిన పదిని మరిచిపోయావు.') }] : [{ when: String(a - b), explain: L('"More" means add.', '"ఇంకా" అంటే కలుపు.') }],
          solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
        };
      }),
      tp('sub', (r) => {
        const a = r.int(30, 99), b = r.int(11, a - 5);
        const wrong = Math.abs(Math.floor(a / 10) - Math.floor(b / 10)) * 10 + Math.abs((a % 10) - (b % 10));
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`There are ${a} rangoli dots. ${b} are coloured. How many are not coloured?`, `${a} ముగ్గు చుక్కలు ఉన్నాయి. ${b} కి రంగు వేశారు. ఎన్నిటికి రంగు వేయలేదు?`), answer: num(a - b),
          hints: [L(`Find ${a} − ${b}.`, `${a} − ${b} కనుక్కో.`), L('If the ones on top are smaller, break one ten.', 'పైన ఒకట్లు చిన్నవైతే ఒక పదిని మార్చు.')],
          mistakes: wrong !== a - b ? [{ when: String(wrong), explain: L('You took the smaller digit from the bigger one. Break a ten instead.', 'చిన్న అంకెను పెద్దదాని నుండి తీశావు. బదులుగా ఒక పదిని మార్చు.') }] : [{ when: String(a + b), explain: L('"Not coloured" means take away.', '"రంగు వేయలేదు" అంటే తీసివేయి.') }],
          solution: [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`), L(`Check: ${a - b} + ${b} = ${a}`, `సరిచూడు: ${a - b} + ${b} = ${a}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 7 Rani's Gift (length)
const rani: USpec = {
  id: 'c2.u.rani', subject: 'math', title: L("Rani's Gift", 'రాణి బహుమతి'), source: src('jm2', 7, "Rani's Gift"),
  objectives: [{
    id: 'c2.meas.length', title: L('Measuring length with hand-spans and centimetres', 'జానలు, సెంటీమీటర్లతో పొడవు కొలవడం'), prereqs: ['c2.add.2digit'],
    activities: ['game:numberline'],
    intro: [
      p('We can measure with hand-spans or steps, but everyone’s hand is a different size. A ruler in centimetres (cm) gives the same answer for everyone.', 'జానలు, అడుగులతో కొలవచ్చు, కానీ అందరి చేతులు ఒకేలా ఉండవు. సెంటీమీటర్ల (సెం.మీ.) స్కేలు అందరికీ ఒకే జవాబు ఇస్తుంది.'),
      vis({ kind: 'number-line', from: 0, to: 15, step: 1, marks: [0, 9] }, 'A ruler: a ribbon from 0 to 9 cm', 'స్కేలు: 0 నుండి 9 సెం.మీ. రిబ్బను'),
      tip('Always start measuring from 0.', 'ఎప్పుడూ 0 నుండి కొలవడం మొదలుపెట్టు.'),
    ],
    examples: [
      ex(L('Rani’s table is 6 of her spans; her father’s is 4 of his spans. Why different?', 'రాణికి బల్ల 6 జానలు, నాన్నకు 4 జానలు. ఎందుకు తేడా?'), [L('Father’s hand is bigger.', 'నాన్న చేయి పెద్దది.'), L('Bigger unit → fewer spans.', 'పెద్ద కొలమానం → తక్కువ జానలు.')], L('Their hand-spans are different sizes', 'వారి జానలు వేర్వేరు పరిమాణాలు')),
      ex(L('A ribbon is 25 cm; Rani cuts 10 cm. How much is left?', 'రిబ్బను 25 సెం.మీ.; రాణి 10 సెం.మీ. కత్తిరించింది. ఎంత మిగిలింది?'), [L('25 − 10 = 15', '25 − 10 = 15')], L('15 cm', '15 సెం.మీ.')),
    ],
    practice: [
      tp('ribbon', (r) => {
        const a = r.int(20, 90), b = r.int(5, a - 5);
        return {
          type: 'mcq', prompt: L(`Rani has a ${a} cm ribbon. She uses ${b} cm to wrap a gift. How much is left?`, `రాణి దగ్గర ${a} సెం.మీ. రిబ్బను ఉంది. బహుమతికి ${b} సెం.మీ. వాడింది. ఎంత మిగిలింది?`),
          ...chooseNum(r, a - b, [a + b, a - b + 10, a - b - 1], (n) => `${n} cm`),
          hints: [L('Left over means subtract.', 'మిగిలింది అంటే తీసివేయి.'), L(`${a} − ${b}`, `${a} − ${b}`)],
          mistakes: [{ when: 'wrong', explain: L('Subtract the part used from the whole ribbon.', 'మొత్తం రిబ్బను నుండి వాడిన భాగం తీసివేయి.') }],
          solution: [L(`${a} − ${b} = ${a - b} cm`, `${a} − ${b} = ${a - b} సెం.మీ.`)],
        };
      }),
      tp('ruler', (r) => {
        const start = r.pick([0, 0, 2, 3]), len = r.int(3, 11);
        return {
          type: 'number-line', line: { from: 0, to: 15, step: 1 }, prompt: L(`A pencil lies on a ruler from ${start} cm to ${start + len} cm. How long is it?`, `ఒక పెన్సిల్ స్కేలు మీద ${start} సెం.మీ. నుండి ${start + len} సెం.మీ. వరకు ఉంది. దాని పొడవు ఎంత?`),
          visual: { kind: 'number-line', from: 0, to: 15, step: 1, marks: [start, start + len] }, answer: num(len, 'cm'),
          hints: [L('Count the centimetre gaps between the two ends.', 'రెండు చివరల మధ్య సెం.మీ. ఖాళీలు లెక్కించు.'), L(`${start + len} − ${start}`, `${start + len} − ${start}`)],
          mistakes: [{ when: String(start + len), explain: L('The pencil does not start at 0 — subtract the start mark.', 'పెన్సిల్ 0 నుండి మొదలవలేదు — మొదలు గుర్తును తీసివేయి.') }],
          solution: [L(`${start + len} − ${start} = ${len} cm`, `${start + len} − ${start} = ${len} సెం.మీ.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 8 Grouping and Sharing
const share: USpec = {
  id: 'c2.u.share', subject: 'math', title: L('Grouping and Sharing', 'గుంపులు చేయడం, పంచడం'), source: src('jm2', 8, 'Grouping and Sharing'),
  objectives: [{
    id: 'c2.mul.share', title: L('Equal groups and equal sharing', 'సమాన గుంపులు, సమానంగా పంచడం'), prereqs: ['c2.num.groups'],
    activities: ['game:counting', 'game:fractions'],
    intro: [
      p('4 groups of 3 is 3 + 3 + 3 + 3 = 12. Sharing 12 laddoos equally among 3 friends gives each 4.', '3 చొప్పున 4 గుంపులు = 3 + 3 + 3 + 3 = 12. 12 లడ్డూలను 3 మిత్రులకు సమానంగా పంచితే ఒక్కొక్కరికి 4.'),
      vis(obj('🟠', 12, 4), 'Twelve laddoos in three groups of four', 'నాలుగేసి చొప్పున మూడు గుంపుల్లో పన్నెండు లడ్డూలు'),
      tip('Share one at a time, going round, until none are left.', 'ఒక్కొక్కటి చొప్పున తిప్పుతూ, అన్నీ అయిపోయేదాకా పంచు.'),
    ],
    examples: [
      ex(L('5 children each get 2 bananas. How many bananas?', '5 పిల్లలకు ఒక్కొక్కరికి 2 అరటి పండ్లు. మొత్తం ఎన్ని?'), [L('2 + 2 + 2 + 2 + 2 = 10', '2 + 2 + 2 + 2 + 2 = 10')], L('10 bananas', '10 అరటి పండ్లు'), obj('🍌', 10, 2)),
      ex(L('Share 15 chocolates among 3 friends equally.', '15 చాక్లెట్లను 3 మిత్రులకు సమానంగా పంచు.'), [L('Give one each, round and round.', 'ఒక్కొక్కటి చొప్పున తిప్పుతూ ఇవ్వు.'), L('Each gets 5.', 'ఒక్కొక్కరికి 5.')], L('5 each', 'ఒక్కొక్కరికి 5')),
    ],
    practice: [
      tp('share', (r) => {
        const k = r.int(2, 5), each = r.int(2, 6), t = r.pick(THINGS);
        return {
          type: 'mcq', prompt: L(`Share ${k * each} ${t.en} equally among ${k} friends. How many does each get?`, `${k * each} ${t.te}ను ${k} మిత్రులకు సమానంగా పంచు. ఒక్కొక్కరికి ఎన్ని?`), visual: obj(t.emoji, k * each),
          ...chooseNum(r, each, [k, each + 1, k * each - k]),
          hints: [L(`Make ${k} equal groups.`, `${k} సమాన గుంపులు చేయి.`), L('Check: groups × each = total.', 'సరిచూడు: గుంపులు × ఒక్కొక్కరికి = మొత్తం.')],
          mistakes: [{ when: 'wrong', explain: L('That is the number of friends, or not equal. Share one by one.', 'అది మిత్రుల సంఖ్య, లేదా సమానం కాదు. ఒక్కొక్కటిగా పంచు.') }],
          solution: [L(`${k * each} shared among ${k} = ${each} each`, `${k * each} ని ${k} మందికి పంచితే ఒక్కొక్కరికి ${each}`)],
        };
      }),
      tp('groups', (r) => {
        const g = r.int(2, 5), k = r.int(2, 5), t = r.pick(THINGS);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${k} plates have ${g} ${t.en} each. How many ${t.en} in all?`, `${k} పళ్ళేల్లో ఒక్కోదానిలో ${g} ${t.te}. మొత్తం ఎన్ని?`), visual: obj(t.emoji, g * k, g), answer: num(g * k),
          hints: [L(`Add ${g}, ${k} times.`, `${g} ని ${k} సార్లు కలుపు.`)],
          mistakes: [{ when: String(g + k), explain: L(`Do not add ${g} and ${k}; add ${g} once for every plate.`, `${g}, ${k} కలపకు; ప్రతి పళ్ళేనికి ${g} కలుపు.`) }],
          solution: [L(`${Array(k).fill(g).join(' + ')} = ${g * k}`, `${Array(k).fill(g).join(' + ')} = ${g * k}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 9 Which Season is it?
const MONTHS = [L('January', 'జనవరి'), L('February', 'ఫిబ్రవరి'), L('March', 'మార్చి'), L('April', 'ఏప్రిల్'), L('May', 'మే'), L('June', 'జూన్'), L('July', 'జూలై'), L('August', 'ఆగస్టు'), L('September', 'సెప్టెంబర్'), L('October', 'అక్టోబర్'), L('November', 'నవంబర్'), L('December', 'డిసెంబర్')];
const DAYS = [L('Sunday', 'ఆదివారం'), L('Monday', 'సోమవారం'), L('Tuesday', 'మంగళవారం'), L('Wednesday', 'బుధవారం'), L('Thursday', 'గురువారం'), L('Friday', 'శుక్రవారం'), L('Saturday', 'శనివారం')];
const season: USpec = {
  id: 'c2.u.season', subject: 'math', title: L('Which Season is it?', 'ఇది ఏ కాలం?'), source: src('jm2', 9, 'Which Season is it?'),
  objectives: [{
    id: 'c2.time.calendar', title: L('Days, months and seasons', 'రోజులు, నెలలు, కాలాలు'),
    activities: ['game:logic'],
    intro: [
      p('A week has 7 days. A year has 12 months. In much of India we have summer, the rainy season and winter.', 'వారానికి 7 రోజులు. సంవత్సరానికి 12 నెలలు. మన దేశంలో వేసవి, వర్షాకాలం, చలికాలం ఉంటాయి.'),
      tip('Say the months as a song to remember the order.', 'క్రమం గుర్తుండేలా నెలల పేర్లు పాటలా పాడు.'),
    ],
    examples: [
      ex(L('Which month comes after June?', 'జూన్ తర్వాత ఏ నెల?'), [L('…May, June, July…', '…మే, జూన్, జూలై…')], L('July', 'జూలై')),
      ex(L('Today is Friday. What day is tomorrow?', 'ఈ రోజు శుక్రవారం. రేపు ఏ రోజు?'), [L('Friday, then Saturday.', 'శుక్రవారం, తర్వాత శనివారం.')], L('Saturday', 'శనివారం')),
    ],
    practice: [
      tp('months', (r) => {
        const s = r.int(0, 8);
        const items = MONTHS.slice(s, s + 4);
        return {
          type: 'order', prompt: L(`Put these months in order: ${items.map((m) => m.en).join(', ')}.`, `ఈ నెలలను క్రమంలో పెట్టు: ${items.map((m) => m.te).join(', ')}.`), ...ordering(r, items),
          hints: [L('Start with January and say the months in order.', 'జనవరి నుండి నెలలు క్రమంగా చెప్పు.')],
          mistakes: [{ when: 'wrong', explain: L('Sing the month song again from January.', 'జనవరి నుండి నెలల పాట మళ్ళీ పాడు.') }],
          solution: [L(items.map((m) => m.en).join(' → '), items.map((m) => m.te).join(' → '))],
        };
      }),
      tp('after', (r) => {
        const useDays = r.next() < 0.5;
        const list = useDays ? DAYS : MONTHS;
        const i = r.int(0, list.length - 1), dir = r.pick(['after', 'before'] as const);
        const ans = list[(i + (dir === 'after' ? 1 : -1) + list.length) % list.length];
        const wrong = [list[(i + (dir === 'after' ? -1 : 1) + list.length) % list.length], list[(i + 2) % list.length], list[i]];
        return {
          type: 'mcq', prompt: L(`Which ${useDays ? 'day' : 'month'} comes just ${dir} ${list[i].en}?`, `${list[i].te} కి ${dir === 'after' ? 'తర్వాత' : 'ముందు'} ఏ ${useDays ? 'రోజు' : 'నెల'}?`), ...choose(r, ans, wrong),
          hints: [L(`Say the ${useDays ? 'days' : 'months'} in order.`, `${useDays ? 'రోజులు' : 'నెలలు'} క్రమంగా చెప్పు.`)],
          mistakes: [{ when: 'wrong', explain: L(`"${dir}" means ${dir === 'after' ? 'the next one' : 'the one before'}.`, dir === 'after' ? '"తర్వాత" అంటే తరువాతిది.' : '"ముందు" అంటే ముందున్నది.') }],
          solution: [L(`${dir === 'after' ? `${list[i].en} → ${ans.en}` : `${ans.en} → ${list[i].en}`}`, `${dir === 'after' ? `${list[i].te} → ${ans.te}` : `${ans.te} → ${list[i].te}`}`)],
        };
      }),
      tp('seasons', (r) => factQ(r, [
        { q: L('When do we use umbrellas and raincoats most?', 'గొడుగులు, రెయిన్‌కోట్లు ఎక్కువగా ఎప్పుడు వాడతాం?'), a: L('Rainy season', 'వర్షాకాలం'), w: [L('Summer', 'వేసవి'), L('Winter', 'చలికాలం')] },
        { q: L('When do we wear sweaters?', 'స్వెటర్లు ఎప్పుడు వేసుకుంటాం?'), a: L('Winter', 'చలికాలం'), w: [L('Summer', 'వేసవి'), L('Rainy season', 'వర్షాకాలం')] },
        { q: L('Mangoes are most plentiful in…', 'మామిడి పండ్లు ఎక్కువగా దొరికేది…'), a: L('Summer', 'వేసవి'), w: [L('Winter', 'చలికాలం'), L('Rainy season', 'వర్షాకాలం')] },
        { q: L('How many months are in a year?', 'సంవత్సరంలో ఎన్ని నెలలు?'), a: L('12', '12'), w: [L('7', '7'), L('10', '10')] },
        { q: L('How many days are in a week?', 'వారంలో ఎన్ని రోజులు?'), a: L('7', '7'), w: [L('5', '5'), L('12', '12')] },
        { q: L('Which month is the last month of the year?', 'సంవత్సరంలో చివరి నెల ఏది?'), a: L('December', 'డిసెంబర్'), w: [L('January', 'జనవరి'), L('October', 'అక్టోబర్')] },
      ], L('Think about the weather and what you wear.', 'వాతావరణం, నువ్వు వేసుకునే బట్టల గురించి ఆలోచించు.'), 'spoken')),
    ],
  }],
};

// ---------------------------------------------------------------- 10 Fun at the Fair (money)
const FAIR = [L('a balloon', 'బెలూన్'), L('a whistle', 'ఈల'), L('a toy car', 'బొమ్మ కారు'), L('candy floss', 'పీచు మిఠాయి'), L('a bangle set', 'గాజుల సెట్'), L('a ride on the wheel', 'జెయింట్ వీల్ సవారీ')];
const fair: USpec = {
  id: 'c2.u.fair', subject: 'math', title: L('Fun at the Fair', 'జాతరలో సరదా'), source: src('jm2', 10, 'Fun at the Fair'),
  objectives: [{
    id: 'c2.money.fair', title: L('Buying and getting change (up to ₹100)', 'కొనడం, చిల్లర తీసుకోవడం (₹100 వరకు)'), prereqs: ['c2.add.2digit'],
    activities: ['game:counting'],
    intro: [
      p('Add prices to find the total. Subtract the total from what you pay to find the change.', 'మొత్తం కోసం ధరలు కలుపు. చిల్లర కోసం ఇచ్చిన డబ్బు నుండి మొత్తం తీసివేయి.'),
      vis({ kind: 'coins', rupees: [50, 20, 10, 5] }, 'Notes and coins: ₹50, ₹20, ₹10, ₹5', 'నోట్లు, నాణేలు: ₹50, ₹20, ₹10, ₹5'),
    ],
    examples: [
      ex(L('A balloon costs ₹15 and a whistle ₹10. Total?', 'బెలూన్ ₹15, ఈల ₹10. మొత్తం?'), [L('15 + 10 = 25', '15 + 10 = 25')], L('₹25', '₹25')),
      ex(L('You pay ₹50 for a ₹35 toy. Change?', '₹35 బొమ్మకు ₹50 ఇచ్చావు. చిల్లర?'), [L('Count up from 35 to 50: 15.', '35 నుండి 50 వరకు లెక్కించు: 15.')], L('₹15', '₹15')),
    ],
    practice: [
      tp('total', (r) => {
        const [a, b] = r.shuffle(FAIR).slice(0, 2);
        const pa = r.int(5, 45), pb = r.int(5, 45);
        return {
          type: 'typed', keypad: 'numeric', unitHint: '₹', prompt: L(`At the fair, ${a.en} costs ₹${pa} and ${b.en} costs ₹${pb}. How much for both?`, `జాతరలో ${a.te} ధర ₹${pa}, ${b.te} ధర ₹${pb}. రెండింటికీ ఎంత?`), answer: num(pa + pb, '₹'),
          hints: [L('Both means add the prices.', 'రెండింటికీ అంటే ధరలు కలుపు.')],
          mistakes: [{ when: String(Math.abs(pa - pb)), explain: L('To find the total, add — do not subtract.', 'మొత్తం కోసం కలుపు — తీసివేయకు.') }],
          solution: [L(`₹${pa} + ₹${pb} = ₹${pa + pb}`, `₹${pa} + ₹${pb} = ₹${pa + pb}`)],
        };
      }),
      tp('change', (r) => {
        const it = r.pick(FAIR), pay = r.pick([20, 50, 100]), cost = r.int(5, pay - 1);
        return {
          type: 'mcq', prompt: L(`${it.en} costs ₹${cost}. You pay with a ₹${pay} note. How much change do you get?`, `${it.te} ధర ₹${cost}. నువ్వు ₹${pay} నోటు ఇచ్చావు. ఎంత చిల్లర వస్తుంది?`),
          ...chooseNum(r, pay - cost, [pay + cost, pay - cost + 10, cost], (n) => `₹${n}`),
          hints: [L(`Count up from ₹${cost} to ₹${pay}.`, `₹${cost} నుండి ₹${pay} వరకు లెక్కించు.`), L(`Or find ${pay} − ${cost}.`, `లేదా ${pay} − ${cost} కనుక్కో.`)],
          mistakes: [{ when: 'wrong', explain: L('Change = money given − price.', 'చిల్లర = ఇచ్చిన డబ్బు − ధర.') }],
          solution: [L(`₹${pay} − ₹${cost} = ₹${pay - cost}`, `₹${pay} − ₹${cost} = ₹${pay - cost}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 11 Data Handling
const FRUITS = [L('mango', 'మామిడి'), L('banana', 'అరటి'), L('guava', 'జామ'), L('apple', 'ఆపిల్'), L('grapes', 'ద్రాక్ష')];
const data: USpec = {
  id: 'c2.u.data', subject: 'math', title: L('Data Handling', 'దత్తాంశ నిర్వహణ'), source: src('jm2', 11, 'Data Handling'),
  objectives: [{
    id: 'c2.data.bars', title: L('Tally marks and bar graphs', 'గణన గుర్తులు, పట్టీ గ్రాఫ్‌లు'), prereqs: ['c2.add.2digit'],
    activities: ['game:counting'],
    intro: [
      p('We can collect answers (like favourite fruits) using tally marks: |||| with a line across means 5.', 'ఇష్టమైన పండ్ల లాంటి జవాబులను గణన గుర్తులతో సేకరించవచ్చు: నాలుగు గీతలకు అడ్డంగా గీత అంటే 5.'),
      vis({ kind: 'bar-graph', labels: ['mango', 'banana', 'guava'], values: [8, 5, 3] }, 'Favourite fruits: mango 8, banana 5, guava 3', 'ఇష్టమైన పండ్లు: మామిడి 8, అరటి 5, జామ 3'),
    ],
    examples: [
      ex(L('How many more children like mango than banana?', 'అరటి కంటే మామిడి ఎంత మందికి ఎక్కువ ఇష్టం?'), [L('Mango 8, banana 5', 'మామిడి 8, అరటి 5'), L('8 − 5 = 3', '8 − 5 = 3')], L('3 more', '3 ఎక్కువ'), { kind: 'bar-graph', labels: ['mango', 'banana', 'guava'], values: [8, 5, 3] }),
      ex(L('How many children were asked in all?', 'మొత్తం ఎంత మందిని అడిగారు?'), [L('8 + 5 + 3 = 16', '8 + 5 + 3 = 16')], L('16', '16')),
    ],
    practice: [
      tp('more', (r) => {
        const labs = r.shuffle(FRUITS).slice(0, 3);
        const vals = labs.map(() => r.int(2, 12));
        let i = 0, j = 1; if (vals[i] === vals[j]) vals[j] = vals[i] + 2;
        if (vals[i] < vals[j]) [i, j] = [j, i];
        return {
          type: 'graph', keypad: 'numeric', prompt: L(`How many more children like ${labs[i].en} than ${labs[j].en}?`, `${labs[j].te} కంటే ${labs[i].te} ఎంత మందికి ఎక్కువ ఇష్టం?`), visual: { kind: 'bar-graph', labels: labs.map((l) => l.en), values: vals, unit: 'children' },
          answer: num(vals[i] - vals[j]),
          hints: [L('Read both bars.', 'రెండు పట్టీలు చదువు.'), L('Subtract the smaller from the bigger.', 'పెద్ద దాని నుండి చిన్నది తీసివేయి.')],
          mistakes: [{ when: String(vals[i] + vals[j]), explain: L('"How many more" means find the difference — subtract.', '"ఎంత ఎక్కువ" అంటే తేడా — తీసివేయి.') }],
          solution: [L(`${vals[i]} − ${vals[j]} = ${vals[i] - vals[j]}`, `${vals[i]} − ${vals[j]} = ${vals[i] - vals[j]}`)],
        };
      }),
      tp('tally', (r) => {
        const n = r.int(3, 18);
        const tally = '卌 '.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`How many does this tally show? ${tally.trim()}`, `ఈ గణన గుర్తులు ఎంత? ${tally.trim()}`), visual: { kind: 'emoji', text: tally.trim() }, answer: num(n),
          hints: [L('Each bundle with a cross line is 5.', 'అడ్డ గీత ఉన్న ప్రతి కట్ట 5.'), L('Count 5s first, then the single lines.', 'ముందు 5లు, తర్వాత విడి గీతలు లెక్కించు.')],
          mistakes: [{ when: String(Math.floor(n / 5) * 4 + (n % 5)), explain: L('The cross line is the 5th mark — each bundle is 5, not 4.', 'అడ్డ గీత 5వ గుర్తు — ప్రతి కట్ట 4 కాదు, 5.') }],
          solution: [L(`${Math.floor(n / 5)} fives and ${n % 5} ones = ${n}`, `${Math.floor(n / 5)} ఐదులు, ${n % 5} ఒకట్లు = ${n}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- Physics exploration
const FLOAT: [Localized, boolean][] = [[L('a leaf', 'ఆకు'), true], [L('a stone', 'రాయి'), false], [L('a paper boat', 'కాగితపు పడవ'), true], [L('an iron nail', 'ఇనుప మేకు'), false], [L('a wooden spoon', 'చెక్క గరిటె'), true], [L('a key', 'తాళం చెవి'), false], [L('a plastic ball', 'ప్లాస్టిక్ బంతి'), true], [L('a marble', 'గోలీ'), false], [L('a cork', 'బిరడా'), true], [L('a steel spoon', 'స్టీలు చెంచా'), false]];
const floatSink: USpec = {
  id: 'c2.u.float', subject: 'physics', title: L('Floating and Sinking', 'తేలడం, మునగడం'), source: null, note: NO_EVS,
  objectives: [{
    id: 'c2.phy.float', title: L('Which things float and which sink?', 'ఏవి తేలుతాయి, ఏవి మునుగుతాయి?'), enrichment: true,
    activities: ['game:balance'],
    intro: [
      p('Put things in a bucket of water: some stay on top (float), some go to the bottom (sink).', 'బకెట్ నీళ్ళలో వస్తువులు వేయి: కొన్ని పైనే ఉంటాయి (తేలుతాయి), కొన్ని అడుగుకు వెళ్తాయి (మునుగుతాయి).'),
      p('Wood, cork and many plastics float. Stones and iron sink.', 'చెక్క, బిరడా, చాలా ప్లాస్టిక్‌లు తేలుతాయి. రాళ్ళు, ఇనుము మునుగుతాయి.'),
      tip('Guess first, then test with water at home (with a grown-up).', 'ముందు ఊహించు, తర్వాత పెద్దవాళ్ళతో కలిసి నీళ్ళలో పరీక్షించు.'),
    ],
    examples: [
      ex(L('Does a paper boat float?', 'కాగితపు పడవ తేలుతుందా?'), [L('It is light and spreads out on the water.', 'అది తేలికగా ఉండి నీటి మీద పరచుకుంటుంది.')], L('Yes, it floats', 'అవును, తేలుతుంది')),
      ex(L('A small stone and a big log: which floats?', 'చిన్న రాయి, పెద్ద దుంగ: ఏది తేలుతుంది?'), [L('Size alone does not decide.', 'పరిమాణం మాత్రమే నిర్ణయించదు.'), L('Wood floats; stone sinks.', 'చెక్క తేలుతుంది; రాయి మునుగుతుంది.')], L('The log floats', 'దుంగ తేలుతుంది')),
    ],
    practice: [
      tp('one', (r) => {
        const [o, fl] = r.pick(FLOAT);
        const F = L('Floats', 'తేలుతుంది'), S = L('Sinks', 'మునుగుతుంది');
        return {
          type: 'spoken', prompt: L(`If we put ${o.en} in water, does it float or sink?`, `${o.te}ను నీళ్ళలో వేస్తే తేలుతుందా మునుగుతుందా?`), ...choose(r, fl ? F : S, [fl ? S : F]),
          hints: [L('What is it made of — wood, plastic, metal or stone?', 'అది దేనితో చేశారు — చెక్క, ప్లాస్టిక్, లోహం, రాయి?')],
          mistakes: [{ when: 'wrong', explain: L('Metal and stone things usually sink; wood and cork float.', 'లోహం, రాయి సాధారణంగా మునుగుతాయి; చెక్క, బిరడా తేలుతాయి.') }],
          solution: [L(`${o.en} ${fl ? 'floats' : 'sinks'}.`, `${o.te} ${fl ? 'తేలుతుంది' : 'మునుగుతుంది'}.`)],
        };
      }),
      tp('tap', (r) => {
        const fl = r.shuffle(FLOAT.filter((x) => x[1])).slice(0, 2), sk = r.shuffle(FLOAT.filter((x) => !x[1])).slice(0, 3);
        const items = [...fl, ...sk].map(([label, ok]) => ({ label, ok }));
        return {
          type: 'tap', prompt: L('Tap everything that floats.', 'తేలే వాటిని అన్నీ నొక్కు.'), ...tapAll(r, items),
          hints: [L('Light materials like wood and cork float.', 'చెక్క, బిరడా లాంటి తేలికైన పదార్థాలు తేలుతాయి.')],
          mistakes: [{ when: 'wrong', explain: L('Check what each thing is made of.', 'ప్రతిదీ దేనితో చేశారో చూడు.') }],
          solution: [L(`Float: ${fl.map((x) => x[0].en).join(', ')}`, `తేలేవి: ${fl.map((x) => x[0].te).join(', ')}`)],
        };
      }),
    ],
  }],
};

const MAG: [Localized, boolean][] = [[L('an iron nail', 'ఇనుప మేకు'), true], [L('a safety pin', 'సేఫ్టీ పిన్'), true], [L('a paper clip', 'పేపర్ క్లిప్'), true], [L('an iron key', 'ఇనుప తాళం చెవి'), true], [L('a wooden block', 'చెక్క ముక్క'), false], [L('a plastic ruler', 'ప్లాస్టిక్ స్కేలు'), false], [L('an eraser', 'రబ్బరు'), false], [L('a paper sheet', 'కాగితం'), false], [L('a glass marble', 'గాజు గోలీ'), false], [L('a rubber band', 'రబ్బరు బ్యాండ్'), false]];
const magnets: USpec = {
  id: 'c2.u.magnets', subject: 'physics', title: L('Magic of Magnets', 'అయస్కాంతాల మాయ'), source: null, note: NO_EVS,
  objectives: [{
    id: 'c2.phy.magnets', title: L('What does a magnet pull?', 'అయస్కాంతం దేన్ని ఆకర్షిస్తుంది?'), enrichment: true, prereqs: ['c2.phy.float'],
    activities: ['lab:forces'],
    intro: [
      p('A magnet pulls (attracts) things made of iron, like nails and pins. It does not pull wood, plastic, paper or glass.', 'అయస్కాంతం ఇనుముతో చేసిన మేకులు, పిన్నుల లాంటివాటిని ఆకర్షిస్తుంది. చెక్క, ప్లాస్టిక్, కాగితం, గాజును ఆకర్షించదు.'),
      p('Every magnet has two ends called poles: North and South.', 'ప్రతి అయస్కాంతానికి ఉత్తర, దక్షిణ అనే రెండు ధ్రువాలు ఉంటాయి.'),
      tip('Keep magnets away from phones and cards.', 'అయస్కాంతాలను ఫోన్లు, కార్డులకు దూరంగా ఉంచు.'),
    ],
    examples: [
      ex(L('Will a magnet pick up a safety pin?', 'అయస్కాంతం సేఫ్టీ పిన్‌ను ఎత్తుతుందా?'), [L('A safety pin is made of iron/steel.', 'సేఫ్టీ పిన్ ఇనుము/ఉక్కుతో చేసింది.')], L('Yes', 'అవును')),
      ex(L('Will a magnet pull a pencil?', 'అయస్కాంతం పెన్సిల్‌ను ఆకర్షిస్తుందా?'), [L('A pencil is wood and graphite.', 'పెన్సిల్ చెక్క, గ్రాఫైట్‌తో చేసింది.')], L('No', 'లేదు')),
    ],
    practice: [
      tp('tap', (r) => {
        const y = r.shuffle(MAG.filter((x) => x[1])).slice(0, 2), n = r.shuffle(MAG.filter((x) => !x[1])).slice(0, 3);
        const items = [...y, ...n].map(([label, ok]) => ({ label, ok }));
        return {
          type: 'tap', prompt: L('Tap the things a magnet will pull.', 'అయస్కాంతం ఆకర్షించే వాటిని నొక్కు.'), ...tapAll(r, items),
          hints: [L('Look for things made of iron.', 'ఇనుముతో చేసినవి వెతుకు.')],
          mistakes: [{ when: 'wrong', explain: L('Magnets do not pull wood, plastic, paper, rubber or glass.', 'అయస్కాంతం చెక్క, ప్లాస్టిక్, కాగితం, రబ్బరు, గాజును ఆకర్షించదు.') }],
          solution: [L(`Pulled: ${y.map((x) => x[0].en).join(', ')}`, `ఆకర్షించేవి: ${y.map((x) => x[0].te).join(', ')}`)],
        };
      }),
      tp('poles', (r) => factQ(r, [
        { q: L('Two North poles are brought close. What happens?', 'రెండు ఉత్తర ధ్రువాలను దగ్గరకు తెస్తే ఏమవుతుంది?'), a: L('They push apart', 'దూరంగా తోసుకుంటాయి'), w: [L('They stick together', 'అతుక్కుంటాయి'), L('Nothing', 'ఏమీ కాదు')] },
        { q: L('A North pole and a South pole are brought close. What happens?', 'ఉత్తర, దక్షిణ ధ్రువాలను దగ్గరకు తెస్తే?'), a: L('They pull together', 'దగ్గరకు లాగుకుంటాయి'), w: [L('They push apart', 'దూరంగా తోసుకుంటాయి'), L('They melt', 'కరిగిపోతాయి')] },
        { q: L('Where is a bar magnet strongest?', 'బార్ అయస్కాంతం ఎక్కడ బలంగా ఉంటుంది?'), a: L('At its two ends', 'రెండు చివరల్లో'), w: [L('In the middle', 'మధ్యలో'), L('Everywhere the same', 'అంతటా ఒకేలా')] },
        { q: L('A freely hanging magnet always points…', 'స్వేచ్ఛగా వేలాడే అయస్కాంతం ఎప్పుడూ చూపించేది…'), a: L('North–South', 'ఉత్తరం–దక్షిణం'), w: [L('East–West', 'తూర్పు–పడమర'), L('Up–Down', 'పైకి–కిందకి')] },
        { q: L('Can a magnet pull a pin through a thin paper?', 'పలుచటి కాగితం గుండా అయస్కాంతం పిన్‌ను లాగగలదా?'), a: L('Yes', 'అవును'), w: [L('No', 'లేదు')] },
      ], L('Like poles push away; unlike poles pull together.', 'ఒకే రకం ధ్రువాలు తోసుకుంటాయి; వేర్వేరు ధ్రువాలు ఆకర్షించుకుంటాయి.'), 'spoken')),
    ],
  }],
};

export default buildClass(4, [beach, shapes3d, numbers, shadow2d, lines, festival, rani, share, season, fair, data, floatSink, magnets]);
