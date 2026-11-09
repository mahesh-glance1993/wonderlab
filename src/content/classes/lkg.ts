// LKG — WonderLab pre-primary play curriculum (board 'play').
import { buildClass, tp, ex, p, tip, vis, act, L, num, choose, chooseNum, matching, ordering, tapAll, type USpec, type QSpec } from '../lib/kit';
import type { Choice, Localized, VisualSpec } from '../../shared/content';
import type { Rng } from '../../shared/grading';

// ---------------------------------------------------------------------------------------------
// Early-years helpers. Duplicated in each pre-primary class file on purpose, so that every class
// stays a single self-contained module (one offline lesson pack per class). Picture-led, no typing.
// ---------------------------------------------------------------------------------------------
export interface Pic { en: string; te: string; e: string }
export const P = (en: string, te: string, e: string): Pic => ({ en, te, e });
export const lab = (x: Pic): Localized => L(`${x.e} ${x.en}`, `${x.e} ${x.te}`);
export const em = (x: Pic): VisualSpec => ({ kind: 'emoji', text: x.e });
export const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const NUM_TE = ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది', 'ఇరవై'];
export const OBJ: Pic[] = [
  P('apples', 'ఆపిల్ పండ్లు', '🍎'), P('mangoes', 'మామిడి పండ్లు', '🥭'), P('bananas', 'అరటి పండ్లు', '🍌'), P('balls', 'బంతులు', '⚽'),
  P('stars', 'నక్షత్రాలు', '⭐'), P('fish', 'చేపలు', '🐟'), P('birds', 'పక్షులు', '🐦'), P('flowers', 'పువ్వులు', '🌼'),
  P('kites', 'గాలిపటాలు', '🪁'), P('balloons', 'బెలూన్లు', '🎈'), P('ducks', 'బాతులు', '🦆'), P('butterflies', 'సీతాకోకచిలుకలు', '🦋'),
];
export const COUNT_HINTS = [L('Touch each one as you count.', 'ఒక్కొక్కదాన్ని తాకుతూ లెక్కపెట్టు.'), L('Say one number for each one. Do not skip any.', 'ఒక్కోదానికి ఒక్క అంకె మాత్రమే చెప్పు. ఏదీ వదలకు.')];

/** Count the objects (answer is a number button). */
export function countQ(r: Rng, lo: number, hi: number, groupsOf?: number): QSpec {
  const o = r.pick(OBJ), n = r.int(lo, hi);
  const visual: VisualSpec = groupsOf && n > groupsOf ? { kind: 'objects', emoji: o.e, count: n, groupsOf } : { kind: 'objects', emoji: o.e, count: n };
  return {
    type: 'count', prompt: L(`How many ${o.en} are there? Count and tap the number.`, `ఎన్ని ${o.te} ఉన్నాయి? లెక్కపెట్టి అంకెను నొక్కు.`),
    visual, answer: num(n), hints: COUNT_HINTS,
    mistakes: [
      { when: String(n + 1), explain: L('One was counted twice. Count again slowly.', 'ఒకదాన్ని రెండుసార్లు లెక్కపెట్టావు. మళ్ళీ నెమ్మదిగా లెక్కపెట్టు.') },
      { when: String(n - 1), explain: L('One was missed. Touch each one as you count.', 'ఒకటి వదిలేశావు. ప్రతిదాన్ని తాకుతూ లెక్కపెట్టు.') },
    ],
    solution: [L(`There are ${n} ${o.en}.`, `${n} ${o.te} ఉన్నాయి.`)],
  };
}

/** Find the group that has N things (choices are labelled by position, not by count). */
export function findGroupQ(r: Rng, lo: number, hi: number): QSpec {
  const o = r.pick(OBJ), n = r.int(lo, hi);
  const others = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((k) => k !== n)).slice(0, 2);
  const counts = r.shuffle([n, ...others]);
  const choices: Choice[] = counts.map((k, i) => ({ id: 'abc'[i], label: L(`Group ${i + 1}`, `గుంపు ${i + 1}`), visual: { kind: 'objects', emoji: o.e, count: k } }));
  return {
    type: 'spoken', prompt: L(`Tap the group with ${NUM_EN[n]} ${o.en}.`, `${NUM_TE[n]} ${o.te} ఉన్న గుంపును నొక్కు.`),
    choices, answer: { kind: 'choice', correct: choices[counts.indexOf(n)].id }, hints: COUNT_HINTS,
    solution: [L(`Group ${counts.indexOf(n) + 1} has ${n} ${o.en}.`, `గుంపు ${counts.indexOf(n) + 1} లో ${n} ${o.te} ఉన్నాయి.`)],
  };
}

/** Recognise a numeral that is said aloud. */
export function numeralQ(r: Rng, lo: number, hi: number): QSpec {
  const n = r.int(lo, hi);
  const pool = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((k) => k !== n)).slice(0, 2);
  const c = choose(r, String(n), pool.map(String), 3, { correct: { kind: 'emoji', text: String(n) }, wrong: pool.map((k) => ({ kind: 'emoji', text: String(k) }) as VisualSpec) });
  return {
    type: 'spoken', prompt: L(`Tap the number ${NUM_EN[n]}.`, `${NUM_TE[n]} అంకెను నొక్కు.`), ...c,
    hints: [L('Listen to the number name again.', 'అంకె పేరును మళ్ళీ విను.'), L(`Count up from 1 to ${n} on your fingers.`, `వేళ్ళపై 1 నుండి ${n} వరకు లెక్కపెట్టు.`)],
    solution: [L(`This is ${n}: ${NUM_EN[n]}.`, `ఇది ${n}: ${NUM_TE[n]}.`)],
  };
}

/** Match numerals to groups of objects. */
export function numberMatchQ(r: Rng, lo: number, hi: number): QSpec {
  const o = r.pick(OBJ);
  const ns = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, 3);
  const m = matching(r, ns.map((n) => [L(String(n), String(n)), L(o.e.repeat(n), o.e.repeat(n))]));
  return {
    type: 'match', prompt: L(`Match each number to the group with that many ${o.en}.`, `ప్రతి అంకెను అన్ని ${o.te} ఉన్న గుంపుతో జత చేయి.`), ...m,
    hints: [L('Count each group first.', 'ముందు ప్రతి గుంపును లెక్కపెట్టు.')],
    solution: ns.map((n) => L(`${n} → ${o.e.repeat(n)}`, `${n} → ${o.e.repeat(n)}`)),
  };
}

/** Which basket has more / fewer? */
export function moreLessQ(r: Rng, lo: number, hi: number): QSpec {
  const o = r.pick(OBJ);
  const a = r.int(lo, hi);
  let b = r.int(lo, hi);
  while (b === a) b = r.int(lo, hi);
  const more = r.next() < 0.5;
  const target = more ? Math.max(a, b) : Math.min(a, b);
  const choices: Choice[] = [a, b].map((k, i) => ({ id: 'ab'[i], label: L(`Basket ${i + 1}`, `బుట్ట ${i + 1}`), visual: { kind: 'objects', emoji: o.e, count: k } }));
  const idx = [a, b].indexOf(target);
  return {
    type: 'spoken', prompt: more ? L(`Which basket has more ${o.en}?`, `ఏ బుట్టలో ఎక్కువ ${o.te} ఉన్నాయి?`) : L(`Which basket has fewer ${o.en}?`, `ఏ బుట్టలో తక్కువ ${o.te} ఉన్నాయి?`),
    choices, answer: { kind: 'choice', correct: choices[idx].id },
    hints: [L('Count both baskets.', 'రెండు బుట్టలనూ లెక్కపెట్టు.'), L('Match them one to one — the basket with some left over has more.', 'ఒకదానికి ఒకటి జత చేయి — మిగిలినవి ఉన్న బుట్టలో ఎక్కువ.')],
    solution: [L(`Basket 1 has ${a}, basket 2 has ${b}. Basket ${idx + 1} has ${more ? 'more' : 'fewer'}.`, `బుట్ట 1 లో ${a}, బుట్ట 2 లో ${b}. బుట్ట ${idx + 1} లో ${more ? 'ఎక్కువ' : 'తక్కువ'}.`)],
  };
}

export interface Shape { k: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'hexagon' | 'pentagon' | 'oval' | 'diamond'; en: string; te: string; sides: number }
export const SHAPES: Record<string, Shape> = {
  circle: { k: 'circle', en: 'circle', te: 'వృత్తం', sides: 0 }, square: { k: 'square', en: 'square', te: 'చతురస్రం', sides: 4 },
  triangle: { k: 'triangle', en: 'triangle', te: 'త్రిభుజం', sides: 3 }, rectangle: { k: 'rectangle', en: 'rectangle', te: 'దీర్ఘచతురస్రం', sides: 4 },
  star: { k: 'star', en: 'star', te: 'నక్షత్రం', sides: 10 }, oval: { k: 'oval', en: 'oval', te: 'అండాకారం', sides: 0 },
  diamond: { k: 'diamond', en: 'diamond', te: 'వజ్రాకారం', sides: 4 }, hexagon: { k: 'hexagon', en: 'hexagon', te: 'షడ్భుజి', sides: 6 },
  pentagon: { k: 'pentagon', en: 'pentagon', te: 'పంచభుజి', sides: 5 },
};
export interface Colour { en: string; te: string; hex: string }
export const COLOURS: Colour[] = [
  { en: 'red', te: 'ఎరుపు', hex: '#e53935' }, { en: 'blue', te: 'నీలం', hex: '#1e88e5' }, { en: 'green', te: 'ఆకుపచ్చ', hex: '#43a047' },
  { en: 'yellow', te: 'పసుపు', hex: '#fdd835' }, { en: 'orange', te: 'నారింజ', hex: '#fb8c00' }, { en: 'purple', te: 'ఊదా', hex: '#8e24aa' },
  { en: 'pink', te: 'గులాబీ', hex: '#ec407a' }, { en: 'brown', te: 'గోధుమ', hex: '#6d4c41' }, { en: 'black', te: 'నలుపు', hex: '#212121' }, { en: 'white', te: 'తెలుపు', hex: '#fafafa' },
];

/** Tap the named shape. */
export function shapeQ(r: Rng, names: string[]): QSpec {
  const pool = names.map((n) => SHAPES[n]);
  const [t, ...rest] = r.shuffle(pool);
  const wrong = rest.slice(0, 2);
  const col = r.pick(COLOURS.slice(0, 7)).hex;
  const sv = (s: Shape): VisualSpec => ({ kind: 'shape', shape: s.k, color: col });
  const c = choose(r, L(t.en, t.te), wrong.map((w) => L(w.en, w.te)), 3, { correct: sv(t), wrong: wrong.map(sv) });
  return {
    type: 'spoken', prompt: L(`Tap the ${t.en}.`, `${t.te} ను నొక్కు.`), ...c,
    hints: [L(t.sides === 0 ? `A ${t.en} has no corners.` : t.k === 'star' ? 'A star has five points.' : `A ${t.en} has ${t.sides} sides.`, t.sides === 0 ? `${t.te} కు మూలలు ఉండవు.` : t.k === 'star' ? 'నక్షత్రానికి ఐదు కొనలు ఉంటాయి.' : `${t.te} కు ${t.sides} భుజాలు ఉంటాయి.`), L('Trace each shape with your finger.', 'ప్రతి ఆకారాన్ని వేలితో గీయి.')],
    solution: [L(`This is the ${t.en}.`, `ఇదే ${t.te}.`)],
  };
}

export const SHAPE_THINGS: [Pic, string][] = [
  [P('coin', 'నాణెం', '🪙'), 'circle'], [P('dice', 'పాచిక', '🎲'), 'square'], [P('pizza slice', 'పిజ్జా ముక్క', '🍕'), 'triangle'],
  [P('door', 'తలుపు', '🚪'), 'rectangle'], [P('egg', 'గుడ్డు', '🥚'), 'oval'], [P('kite', 'గాలిపటం', '🪁'), 'diamond'],
];
/** Match everyday things to their shapes. */
export function shapeThingsQ(r: Rng, upto: number): QSpec {
  const pick = r.shuffle(SHAPE_THINGS.slice(0, upto)).slice(0, 3);
  const m = matching(r, pick.map(([t, s]) => [lab(t), L(SHAPES[s].en, SHAPES[s].te)]));
  return {
    type: 'match', prompt: L(`Match each thing to its shape: ${pick.map(([t]) => `${t.e} ${t.en}`).join(', ')}.`, `ప్రతి వస్తువును దాని ఆకారంతో జత చేయి: ${pick.map(([t]) => `${t.e} ${t.te}`).join(', ')}.`), ...m,
    hints: [L('Look at the outline of each thing.', 'ప్రతి వస్తువు అంచును చూడు.'), L('Is it round? Does it have corners?', 'అది గుండ్రంగా ఉందా? మూలలు ఉన్నాయా?')],
    solution: pick.map(([t, s]) => L(`A ${t.en} looks like a ${SHAPES[s].en}.`, `${t.te} ${SHAPES[s].te} లా ఉంటుంది.`)),
  };
}

/** How many sides? */
export function sidesQ(r: Rng): QSpec {
  const s = r.pick([SHAPES.triangle, SHAPES.square, SHAPES.rectangle, SHAPES.pentagon, SHAPES.hexagon, SHAPES.circle]);
  const col = r.pick(COLOURS.slice(0, 7));
  const c = chooseNum(r, s.sides, [s.sides + 1, Math.max(0, s.sides - 1), s.sides + 2], String, 3);
  return {
    type: 'spoken', prompt: L(`How many sides does this ${col.en} ${s.en} have?`, `ఈ ${col.te} ${s.te} కు ఎన్ని భుజాలు ఉన్నాయి?`), visual: { kind: 'shape', shape: s.k, color: col.hex }, ...c,
    hints: [L('Run your finger along each straight side and count.', 'ప్రతి సరళ భుజం మీద వేలు జరుపుతూ లెక్కపెట్టు.'), L('A circle has no straight sides.', 'వృత్తానికి సరళ భుజాలు ఉండవు.')],
    solution: [L(`A ${s.en} has ${s.sides} straight sides.`, `${s.te} కు ${s.sides} సరళ భుజాలు ఉంటాయి.`)],
  };
}

/** Tap the shape of the named colour. */
export function colourQ(r: Rng, n: number): QSpec {
  const [t, ...rest] = r.shuffle(COLOURS.slice(0, n));
  const wrong = rest.slice(0, 2);
  const s = r.pick([SHAPES.circle, SHAPES.star, SHAPES.square, SHAPES.triangle]);
  const sv = (c: Colour): VisualSpec => ({ kind: 'shape', shape: s.k, color: c.hex });
  const c = choose(r, L(t.en, t.te), wrong.map((w) => L(w.en, w.te)), 3, { correct: sv(t), wrong: wrong.map(sv) });
  return {
    type: 'spoken', prompt: L(`Tap the ${t.en} ${s.en}.`, `${t.te} రంగు ${s.te} ను నొక్కు.`), ...c,
    hints: [L(`Find something ${t.en} around you.`, `నీ చుట్టూ ${t.te} రంగు వస్తువును వెతుకు.`)],
    solution: [L(`This ${s.en} is ${t.en}.`, `ఈ ${s.te} ${t.te} రంగులో ఉంది.`)],
  };
}

export const COLOUR_THINGS: [Pic, number][] = [
  [P('ripe banana', 'పండిన అరటి పండు', '🍌'), 3], [P('leaf', 'ఆకు', '🍃'), 2], [P('tomato', 'టమాటా', '🍅'), 0], [P('crow', 'కాకి', '🐦‍⬛'), 8],
  [P('milk', 'పాలు', '🥛'), 9], [P('carrot', 'క్యారెట్', '🥕'), 4], [P('brinjal', 'వంకాయ', '🍆'), 5], [P('clear sky', 'ఆకాశం', '🌤️'), 1], [P('parrot', 'చిలుక', '🦜'), 2],
];
/** What colour is it? */
export function colourThingQ(r: Rng): QSpec {
  const [t, ci] = r.pick(COLOUR_THINGS);
  const right = COLOURS[ci];
  const wrong = r.shuffle(COLOURS.filter((c) => c !== right)).slice(0, 2);
  const sv = (c: Colour): VisualSpec => ({ kind: 'shape', shape: 'circle', color: c.hex });
  const c = choose(r, L(right.en, right.te), wrong.map((w) => L(w.en, w.te)), 3, { correct: sv(right), wrong: wrong.map(sv) });
  return {
    type: 'spoken', prompt: L(`What colour is a ${t.en}?`, `${t.te} ఏ రంగులో ఉంటుంది?`), visual: em(t), ...c,
    hints: [L(`Think of a ${t.en} you have seen.`, `నువ్వు చూసిన ${t.te} ను గుర్తు తెచ్చుకో.`)],
    solution: [L(`A ${t.en} is ${right.en}.`, `${t.te} ${right.te} రంగులో ఉంటుంది.`)],
  };
}

export const PATTERN_POOLS: Pic[][] = [
  [P('apple', 'ఆపిల్', '🍎'), P('banana', 'అరటి', '🍌'), P('mango', 'మామిడి', '🥭'), P('grapes', 'ద్రాక్ష', '🍇')],
  [P('red circle', 'ఎరుపు వృత్తం', '🔴'), P('blue circle', 'నీలం వృత్తం', '🔵'), P('green circle', 'ఆకుపచ్చ వృత్తం', '🟢'), P('yellow circle', 'పసుపు వృత్తం', '🟡')],
  [P('star', 'నక్షత్రం', '⭐'), P('moon', 'చంద్రుడు', '🌙'), P('sun', 'సూర్యుడు', '☀️'), P('cloud', 'మేఘం', '☁️')],
  [P('cat', 'పిల్లి', '🐱'), P('dog', 'కుక్క', '🐶'), P('rabbit', 'కుందేలు', '🐰'), P('cow', 'ఆవు', '🐮')],
  [P('red square', 'ఎరుపు చతురస్రం', '🟥'), P('blue square', 'నీలం చతురస్రం', '🟦'), P('green square', 'ఆకుపచ్చ చతురస్రం', '🟩'), P('orange square', 'నారింజ చతురస్రం', '🟧')],
];
/** What comes next in a repeating pattern? kinds like 'AB', 'ABB', 'AAB', 'ABC'. */
export function patternQ(r: Rng, kinds: string[]): QSpec {
  const kind = r.pick(kinds);
  const pool = r.shuffle(r.pick(PATTERN_POOLS));
  const letters = [...new Set(kind.split(''))];
  const unit = kind.split('').map((ch) => pool[letters.indexOf(ch)]);
  const len = r.int(Math.max(4, unit.length + 2), unit.length * 2 + 2);
  const shown = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const next = unit[len % unit.length];
  const wrong = pool.filter((x) => x !== next).slice(0, 2);
  const c = choose(r, L(next.en, next.te), wrong.map((w) => L(w.en, w.te)), 3, { correct: em(next), wrong: wrong.map(em) });
  const row = shown.map((x) => x.e).join(' ');
  return {
    type: 'spoken', prompt: L(`What comes next? ${row} …`, `తర్వాత ఏది వస్తుంది? ${row} …`), visual: { kind: 'emoji', text: `${row} ❓` }, ...c,
    hints: [L('Say the pattern aloud and clap on each picture.', 'నమూనాను గట్టిగా చెబుతూ ప్రతి బొమ్మకు చప్పట్లు కొట్టు.'), L(`The part that repeats is: ${unit.map((x) => x.e).join(' ')}`, `మళ్ళీ మళ్ళీ వచ్చే భాగం: ${unit.map((x) => x.e).join(' ')}`)],
    solution: [L(`The pattern repeats ${unit.map((x) => x.e).join(' ')}, so next is ${next.e} ${next.en}.`, `నమూనా ${unit.map((x) => x.e).join(' ')} మళ్ళీ వస్తుంది, కాబట్టి తర్వాత ${next.e} ${next.te}.`)],
  };
}

/** A comparison dimension: items in increasing order. */
export interface Dim { items: Pic[]; more: [string, string, string]; less: [string, string, string]; hint: Localized }
export const DIMS: Record<string, Dim> = {
  size: { items: [P('ant', 'చీమ', '🐜'), P('mouse', 'ఎలుక', '🐭'), P('cat', 'పిల్లి', '🐈'), P('dog', 'కుక్క', '🐕'), P('cow', 'ఆవు', '🐄'), P('elephant', 'ఏనుగు', '🐘')], more: ['bigger', 'biggest', 'పెద్దది'], less: ['smaller', 'smallest', 'చిన్నది'], hint: L('Think how much space each one takes.', 'ప్రతిది ఎంత చోటు ఆక్రమిస్తుందో ఆలోచించు.') },
  long: { items: [P('crayon', 'క్రేయాన్', '🖍️'), P('pencil', 'పెన్సిల్', '✏️'), P('ruler', 'స్కేలు', '📏'), P('umbrella', 'గొడుగు', '☂️'), P('bed', 'మంచం', '🛏️'), P('train', 'రైలు', '🚆')], more: ['longer', 'longest', 'పొడవైనది'], less: ['shorter', 'shortest', 'పొట్టిది'], hint: L('Imagine them side by side, starting at the same line.', 'అన్నింటినీ ఒకే గీత దగ్గర మొదలుపెట్టి పక్కపక్కన ఊహించు.') },
  tall: { items: [P('plant', 'మొక్క', '🌱'), P('child', 'పిల్లవాడు', '🧒'), P('giraffe', 'జిరాఫీ', '🦒'), P('palm tree', 'తాటి చెట్టు', '🌴'), P('building', 'భవనం', '🏢'), P('mountain', 'కొండ', '⛰️')], more: ['taller', 'tallest', 'ఎత్తైనది'], less: ['shorter', 'shortest', 'పొట్టిది'], hint: L('Which one reaches higher from the ground?', 'నేల నుండి ఏది ఎక్కువ ఎత్తుకు చేరుతుంది?') },
  heavy: { items: [P('feather', 'ఈక', '🪶'), P('leaf', 'ఆకు', '🍃'), P('apple', 'ఆపిల్', '🍎'), P('books', 'పుస్తకాలు', '📚'), P('watermelon', 'పుచ్చకాయ', '🍉'), P('elephant', 'ఏనుగు', '🐘')], more: ['heavier', 'heaviest', 'బరువైనది'], less: ['lighter', 'lightest', 'తేలికైనది'], hint: L('Which would be hardest to lift?', 'దేనిని ఎత్తడం కష్టం?') },
  loud: { items: [P('leaf falling', 'ఆకు రాలడం', '🍃'), P('whisper', 'గుసగుస', '🤫'), P('talking', 'మాట్లాడటం', '🗣️'), P('dog barking', 'కుక్క మొరగడం', '🐕'), P('drum beat', 'డప్పు మోత', '🥁'), P('thunder', 'ఉరుము', '⛈️')], more: ['louder', 'loudest', 'పెద్ద శబ్దం'], less: ['softer', 'softest', 'మెల్లని శబ్దం'], hint: L('Which would make you cover your ears?', 'ఏది విన్నప్పుడు చెవులు మూసుకుంటావు?') },
};
/** Which is bigger / smaller (2 or 3 items)? */
export function rankQ(r: Rng, dimKey: string, n: 2 | 3): QSpec {
  const d = DIMS[dimKey];
  const idx = r.shuffle(d.items.map((_, i) => i)).slice(0, n);
  const most = r.next() < 0.5;
  const ansI = most ? Math.max(...idx) : Math.min(...idx);
  const ans = d.items[ansI];
  const w = idx.filter((i) => i !== ansI).map((i) => d.items[i]);
  const word = most ? d.more : d.less;
  const c = choose(r, L(ans.en, ans.te), w.map((x) => L(x.en, x.te)), 3, { correct: em(ans), wrong: w.map(em) });
  return {
    type: 'spoken', prompt: L(n === 2 ? `Which one is ${word[0]}?` : `Which one is the ${word[1]}?`, `వీటిలో ఏది ${word[2]}?`), ...c,
    hints: [d.hint],
    solution: [L(`The ${ans.en} is the ${word[1]} here.`, `ఇక్కడ ${ans.te} ${word[2]}.`)],
  };
}
/** Put items in order from least to most. */
export function rankOrderQ(r: Rng, dimKey: string, n: 3 | 4, type: 'order' | 'drag' = 'order'): QSpec {
  const d = DIMS[dimKey];
  const idx = r.shuffle(d.items.map((_, i) => i)).slice(0, n).sort((a, b) => a - b);
  const items = idx.map((i) => d.items[i]);
  const o = ordering(r, items.map(lab));
  return {
    type, prompt: L(`Put them in order from ${d.less[1]} to ${d.more[1]}.`, `${d.less[2]} నుండి ${d.more[2]} వరకు వరుసగా పెట్టు.`), ...o,
    hints: [d.hint, L(`First find the ${d.less[1]} one.`, `ముందు ${d.less[2]} ఏదో కనుక్కో.`)],
    solution: [L(items.map((x) => x.en).join(' → '), items.map((x) => x.te).join(' → '))],
  };
}

/** Picture fact question from a bank. */
export interface Fact { q: Localized; a: Pic; w: Pic[]; why: Localized }
export function factQ(r: Rng, bank: Fact[], hint: Localized): QSpec {
  const f = r.pick(bank);
  const c = choose(r, L(f.a.en, f.a.te), f.w.map((x) => L(x.en, x.te)), 3, { correct: em(f.a), wrong: f.w.map(em) });
  return { type: 'spoken', prompt: f.q, ...c, hints: [hint], solution: [f.why] };
}

/** "Which one …?" — one item from `yes`, two from `no`. */
export function poolQ(r: Rng, q: Localized, yes: Pic[], no: Pic[], hint: Localized, why: (x: Pic) => Localized): QSpec {
  const a = r.pick(yes);
  const w = r.shuffle(no).slice(0, 2);
  const c = choose(r, L(a.en, a.te), w.map((x) => L(x.en, x.te)), 3, { correct: em(a), wrong: w.map(em) });
  return { type: 'spoken', prompt: q, ...c, hints: [hint], solution: [why(a)] };
}

/** Tap all that apply: 2–3 from `yes`, the rest from `no` (5 pictures). */
export function tapQ(r: Rng, q: Localized, yes: Pic[], no: Pic[], hint: Localized, summary: [string, string]): QSpec {
  const k = r.int(2, 3);
  const ys = r.shuffle(yes).slice(0, k), ns = r.shuffle(no).slice(0, 5 - k);
  const t = tapAll(r, [...ys.map((x) => ({ label: L(x.en, x.te), ok: true, visual: em(x) })), ...ns.map((x) => ({ label: L(x.en, x.te), ok: false, visual: em(x) }))]);
  return {
    type: 'tap', prompt: q, ...t, hints: [hint, L(`There are ${k} to find.`, `${k} కనుక్కోవాలి.`)],
    solution: [L(`${summary[0]}: ${ys.map((x) => x.en).join(', ')}.`, `${summary[1]}: ${ys.map((x) => x.te).join(', ')}.`)],
  };
}

/** Match pairs from a pool (left → right). */
export function pairsQ(r: Rng, q: Localized, pool: [Pic, Pic][], hint: Localized, n = 3): QSpec {
  const pick = r.shuffle(pool).slice(0, n);
  const m = matching(r, pick.map(([a, b]) => [lab(a), lab(b)]));
  const list = (k: 'en' | 'te') => pick.map(([a]) => `${a.e} ${a[k]}`).join(', ');
  return { type: 'match', prompt: L(`${q.en} (${list('en')})`, `${q.te ?? q.en} (${list('te')})`), ...m, hints: [hint], solution: pick.map(([a, b]) => L(`${a.e} ${a.en} → ${b.e} ${b.en}`, `${a.e} ${a.te} → ${b.e} ${b.te}`)) };
}

// ---- shared physical-world banks ----
export const LIGHTS: Pic[] = [P('sun', 'సూర్యుడు', '☀️'), P('oil lamp (diya)', 'దీపం', '🪔'), P('torch', 'టార్చ్', '🔦'), P('candle', 'కొవ్వొత్తి', '🕯️'), P('bulb', 'బల్బు', '💡'), P('fire', 'మంట', '🔥')];
export const NOT_LIGHTS: Pic[] = [P('ball', 'బంతి', '⚽'), P('book', 'పుస్తకం', '📕'), P('cat', 'పిల్లి', '🐈'), P('chair', 'కుర్చీ', '🪑'), P('spoon', 'చెంచా', '🥄'), P('leaf', 'ఆకు', '🍃'), P('cup', 'కప్పు', '☕')];
export const ANIMAL_SOUNDS: [Pic, string, string][] = [
  [P('cow', 'ఆవు', '🐄'), 'moo', 'అంబా'], [P('dog', 'కుక్క', '🐕'), 'bow-wow', 'భౌ భౌ'], [P('cat', 'పిల్లి', '🐈'), 'meow', 'మియావ్'],
  [P('duck', 'బాతు', '🦆'), 'quack', 'క్వాక్ క్వాక్'], [P('rooster', 'కోడిపుంజు', '🐓'), 'cock-a-doodle-doo', 'కొక్కొరొకో'], [P('lion', 'సింహం', '🦁'), 'roar', 'గర్ర్'],
  [P('crow', 'కాకి', '🐦‍⬛'), 'caw caw', 'కావ్ కావ్'], [P('goat', 'మేక', '🐐'), 'maa', 'మే మే'], [P('frog', 'కప్ప', '🐸'), 'croak', 'బెక బెక'],
];
/** Who makes this sound? */
export function animalSoundQ(r: Rng): QSpec {
  const [t, ...rest] = r.shuffle(ANIMAL_SOUNDS);
  const w = rest.slice(0, 2).map((x) => x[0]);
  const c = choose(r, L(t[0].en, t[0].te), w.map((x) => L(x.en, x.te)), 3, { correct: em(t[0]), wrong: w.map(em) });
  return {
    type: 'spoken', prompt: L(`Who says “${t[1]}”?`, `“${t[2]}” అని ఎవరు అంటారు?`), ...c,
    hints: [L('Make each animal’s sound yourself and listen.', 'ప్రతి జంతువు శబ్దాన్ని నువ్వే చేసి విను.')],
    solution: [L(`The ${t[0].en} says “${t[1]}”.`, `${t[0].te} “${t[2]}” అంటుంది.`)],
  };
}
export const INSTRUMENTS: Fact[] = [
  { q: L('Which one do we beat with our hands or sticks?', 'దేనిని చేతులతో లేదా కర్రలతో కొడతాం?'), a: P('drum', 'డప్పు', '🥁'), w: [P('trumpet', 'బూర', '🎺'), P('bell', 'గంట', '🔔')], why: L('We beat a drum to make its sound.', 'డప్పును కొడితే శబ్దం వస్తుంది.') },
  { q: L('Which one do we blow into?', 'దేనిలో ఊదుతాం?'), a: P('trumpet', 'బూర', '🎺'), w: [P('drum', 'డప్పు', '🥁'), P('guitar', 'గిటార్', '🎸')], why: L('We blow air into a trumpet.', 'బూరలో గాలి ఊదుతాం.') },
  { q: L('Which one do we shake or ring?', 'దేనిని ఊపి మోగిస్తాం?'), a: P('bell', 'గంట', '🔔'), w: [P('piano', 'పియానో', '🎹'), P('trumpet', 'బూర', '🎺')], why: L('A temple bell rings when we shake it.', 'గుడి గంటను ఊపితే మోగుతుంది.') },
  { q: L('Which one has strings that we pluck?', 'దేని తీగలను మీటుతాం?'), a: P('guitar', 'గిటార్', '🎸'), w: [P('drum', 'డప్పు', '🥁'), P('bell', 'గంట', '🔔')], why: L('Plucking the strings of a guitar makes them shake and sing.', 'గిటార్ తీగలను మీటితే అవి కంపించి శబ్దం చేస్తాయి.') },
  { q: L('Which one has keys that we press?', 'దేని మీటలను నొక్కుతాం?'), a: P('piano', 'పియానో', '🎹'), w: [P('trumpet', 'బూర', '🎺'), P('guitar', 'గిటార్', '🎸')], why: L('We press the keys of a piano.', 'పియానో మీటలను నొక్కుతాం.') },
  { q: L('Which one makes a sound to wake us up in the morning?', 'ఉదయం మనల్ని లేపడానికి ఏది మోగుతుంది?'), a: P('alarm clock', 'అలారం గడియారం', '⏰'), w: [P('pillow', 'దిండు', '🛏️'), P('book', 'పుస్తకం', '📕')], why: L('An alarm clock rings loudly.', 'అలారం గడియారం గట్టిగా మోగుతుంది.') },
];
export const PUSH_PULL: [Pic, 'push' | 'pull'][] = [
  [P('kicking a ball', 'బంతిని తన్నడం', '⚽'), 'push'], [P('opening a drawer', 'సొరుగు తెరవడం', '🗄️'), 'pull'], [P('pushing a swing', 'ఊయలను తోయడం', '🛝'), 'push'],
  [P('flying a kite by its string', 'గాలిపటం దారం లాగడం', '🪁'), 'pull'], [P('pushing a shopping cart', 'బండిని తోయడం', '🛒'), 'push'], [P('pulling water from a well', 'బావి నుండి నీళ్ళు చేదడం', '🪣'), 'pull'],
  [P('shutting a door', 'తలుపు మూయడం', '🚪'), 'push'], [P('tug of war', 'తాడు లాగుడు ఆట', '🪢'), 'pull'], [P('pulling a toy cart', 'బొమ్మ బండి లాగడం', '🧸'), 'pull'], [P('pressing a doorbell', 'కాలింగ్ బెల్ నొక్కడం', '🔔'), 'push'],
];
const PUSH = P('Push', 'తోయడం', '👐');
const PULL = P('Pull', 'లాగడం', '🪢');
/** Is it a push or a pull? */
export function pushPullQ(r: Rng): QSpec {
  const [a, k] = r.pick(PUSH_PULL);
  const right = k === 'push' ? PUSH : PULL, wrong = k === 'push' ? PULL : PUSH;
  const c = choose(r, L(right.en, right.te), [L(wrong.en, wrong.te)], 2, { correct: em(right), wrong: [em(wrong)] });
  return {
    type: 'spoken', prompt: L(`${a.e} Is ${a.en} a push or a pull?`, `${a.e} ${a.te} — తోయడమా, లాగడమా?`), visual: em(a), ...c,
    hints: [L('A push moves things away from you. A pull brings things towards you.', 'తోస్తే వస్తువు మన నుండి దూరంగా వెళ్తుంది. లాగితే మన వైపు వస్తుంది.')],
    solution: [L(`${a.en[0].toUpperCase() + a.en.slice(1)} is a ${k}.`, `${a.te} — ${k === 'push' ? 'తోయడం' : 'లాగడం'}.`)],
  };
}
export const ROLLERS: Pic[] = [P('ball', 'బంతి', '⚽'), P('wheel', 'చక్రం', '🛞'), P('orange', 'నారింజ పండు', '🍊'), P('basketball', 'బాస్కెట్‌బాల్', '🏀'), P('tin can', 'డబ్బా', '🥫'), P('coconut', 'కొబ్బరికాయ', '🥥')];
export const SLIDERS: Pic[] = [P('box', 'పెట్టె', '📦'), P('book', 'పుస్తకం', '📕'), P('brick', 'ఇటుక', '🧱'), P('ice cube', 'ఐస్ ముక్క', '🧊'), P('eraser', 'రబ్బరు', '🧽'), P('dice', 'పాచిక', '🎲')];

// =============================================================================================
// LKG (level 1) — WonderLab play curriculum (board 'play'): numbers to 10, more/less, shapes,
// colours & patterns, long/tall/heavy, light & shadows, loud/soft & instruments, push/pull.
// =============================================================================================
/** Order 4 numbers from smallest to biggest. */
function orderNumQ(r: Rng, lo: number, hi: number): QSpec {
  const ns = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, 4).sort((a, b) => a - b);
  const o = ordering(r, ns.map((n) => L(String(n), String(n))));
  return {
    type: 'drag', prompt: L('Drag the numbers into order, smallest first.', 'అంకెలను చిన్నది ముందుగా వరుసలో పెట్టు.'), ...o,
    hints: [L('Count from 1 and see which number you reach first.', '1 నుండి లెక్కపెట్టు — ఏ అంకె ముందు వస్తుందో చూడు.')],
    solution: [L(ns.join(', '), ns.join(', '))],
  };
}

const numbers: USpec = {
  id: 'lkg.u.numbers', subject: 'early', title: L('Numbers 1 to 10', 'అంకెలు 1 నుండి 10'), source: null,
  objectives: [
    {
      id: 'lkg.count.to10', title: L('Count up to 10 things', '10 వరకు వస్తువులను లెక్కపెట్టడం'),
      activities: ['game:counting'],
      intro: [
        p('We can count all the way to 10: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.', 'మనం 10 వరకు లెక్కపెట్టగలం: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.'),
        vis({ kind: 'objects', emoji: '🌼', count: 7, groupsOf: 5 }, 'Seven flowers: a group of 5 and 2 more', 'ఏడు పువ్వులు: 5 ఒక గుంపు, ఇంకా 2'),
        tip('Count a group of 5 first, then keep going: 6, 7…', 'ముందు 5 గుంపును లెక్కపెట్టి, తర్వాత కొనసాగించు: 6, 7…'),
      ],
      examples: [
        ex(L('How many fish?', 'ఎన్ని చేపలు?'), [L('Count the first row: 1 to 5.', 'మొదటి వరుస: 1 నుండి 5.'), L('Keep going: 6, 7, 8.', 'కొనసాగించు: 6, 7, 8.')], L('8 fish', '8 చేపలు'), { kind: 'objects', emoji: '🐟', count: 8, groupsOf: 5 }),
        ex(L('How many kites?', 'ఎన్ని గాలిపటాలు?'), [L('Two full hands of 5 make 10.', 'రెండు చేతుల 5 వేళ్ళు కలిపి 10.')], L('10 kites', '10 గాలిపటాలు'), { kind: 'objects', emoji: '🪁', count: 10, groupsOf: 5 }),
      ],
      practice: [tp('count', (r) => countQ(r, 3, 10, 5)), tp('group', (r) => findGroupQ(r, 4, 10))],
    },
    {
      id: 'lkg.num.to10', title: L('Read and order numbers to 10', '10 వరకు అంకెలను చదవడం, వరుసగా పెట్టడం'), prereqs: ['lkg.count.to10'],
      activities: ['art:trace', 'game:numberline'],
      intro: [
        p('Numbers come in order. 6 comes after 5, and 9 comes before 10.', 'అంకెలు వరుసగా వస్తాయి. 5 తర్వాత 6, 10 కి ముందు 9.'),
        vis({ kind: 'number-line', from: 0, to: 10, step: 1 }, 'Number line from 0 to 10', '0 నుండి 10 వరకు సంఖ్యారేఖ'),
        act('art:trace', 'Trace the numbers 6 to 10', '6 నుండి 10 అంకెలను దిద్దు'),
      ],
      examples: [
        ex(L('Put 7, 2, 9 in order.', '7, 2, 9 ను వరుసలో పెట్టు.'), [L('2 comes first when we count.', 'లెక్కపెట్టేటప్పుడు 2 ముందు వస్తుంది.'), L('Then 7, then 9.', 'తర్వాత 7, తర్వాత 9.')], L('2, 7, 9', '2, 7, 9')),
        ex(L('Which number is eight?', 'ఎనిమిది ఏ అంకె?'), [L('Count to eight on your fingers.', 'వేళ్ళపై ఎనిమిది వరకు లెక్కపెట్టు.')], L('8', '8')),
      ],
      practice: [tp('numeral', (r) => numeralQ(r, 1, 10)), tp('order', (r) => orderNumQ(r, 1, 10)), tp('match', (r) => numberMatchQ(r, 1, 6))],
    },
  ],
};

const compare: USpec = {
  id: 'lkg.u.compare', subject: 'early', title: L('More and fewer', 'ఎక్కువ మరియు తక్కువ'), source: null,
  objectives: [{
    id: 'lkg.compare.groups', title: L('Which group has more?', 'ఏ గుంపులో ఎక్కువ?'), prereqs: ['lkg.count.to10'],
    activities: ['game:balance', 'game:counting'],
    intro: [
      p('To compare two groups, count both — or match them one to one. The group with some left over has more.', 'రెండు గుంపులను పోల్చడానికి రెండింటినీ లెక్కపెట్టు — లేదా ఒకదానికి ఒకటి జత చేయి. మిగిలినవి ఉన్న గుంపులో ఎక్కువ.'),
      vis({ kind: 'emoji', text: '🍌🍌🍌🍌  |  🍌🍌' }, 'Four bananas and two bananas', 'నాలుగు అరటి పండ్లు, రెండు అరటి పండ్లు'),
    ],
    examples: [
      ex(L('Basket 1 has 4 bananas, basket 2 has 2. Which has more?', 'బుట్ట 1 లో 4, బుట్ట 2 లో 2 అరటి పండ్లు. దేనిలో ఎక్కువ?'), [L('4 comes after 2 when we count.', 'లెక్కలో 2 తర్వాత 4 వస్తుంది.')], L('Basket 1', 'బుట్ట 1')),
      ex(L('6 birds and 9 birds. Which group has fewer?', '6 పక్షులు, 9 పక్షులు. ఏ గుంపులో తక్కువ?'), [L('6 comes before 9.', '9 కి ముందు 6 వస్తుంది.')], L('The group of 6', '6 ఉన్న గుంపు')),
    ],
    practice: [tp('baskets', (r) => moreLessQ(r, 1, 10))],
  }],
};

const shapes: USpec = {
  id: 'lkg.u.shapes', subject: 'early', title: L('Shapes', 'ఆకారాలు'), source: null,
  objectives: [{
    id: 'lkg.shape.match', title: L('Name and match shapes', 'ఆకారాలను గుర్తించి జత చేయడం'),
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('Shapes have names: circle, square, triangle, rectangle, oval, star and diamond.', 'ఆకారాలకు పేర్లు ఉన్నాయి: వృత్తం, చతురస్రం, త్రిభుజం, దీర్ఘచతురస్రం, అండాకారం, నక్షత్రం, వజ్రాకారం.'),
      p('A door is a rectangle — two long sides and two short sides. An egg is an oval.', 'తలుపు దీర్ఘచతురస్రం — రెండు పొడవు భుజాలు, రెండు పొట్టి భుజాలు. గుడ్డు అండాకారం.'),
      vis({ kind: 'shape', shape: 'rectangle', color: '#1e88e5' }, 'A blue rectangle', 'నీలం దీర్ఘచతురస్రం'),
    ],
    examples: [
      ex(L('What shape is a door?', 'తలుపు ఏ ఆకారం?'), [L('It has 4 sides: 2 long and 2 short.', 'దానికి 4 భుజాలు: 2 పొడవు, 2 పొట్టి.')], L('Rectangle', 'దీర్ఘచతురస్రం'), { kind: 'emoji', text: '🚪' }),
      ex(L('What shape is a kite?', 'గాలిపటం ఏ ఆకారం?'), [L('It has 4 equal sides and stands on a corner.', 'దానికి 4 సమాన భుజాలు, ఒక మూలపై నిలబడుతుంది.')], L('Diamond', 'వజ్రాకారం'), { kind: 'emoji', text: '🪁' }),
    ],
    practice: [tp('find', (r) => shapeQ(r, ['circle', 'square', 'triangle', 'rectangle', 'oval', 'star', 'diamond'])), tp('things', (r) => shapeThingsQ(r, 6))],
  }],
};

const patterns: USpec = {
  id: 'lkg.u.patterns', subject: 'early', title: L('Colours and patterns', 'రంగులు మరియు నమూనాలు'), source: null,
  objectives: [
    {
      id: 'lkg.colour.things', title: L('Colours of things around us', 'మన చుట్టూ వస్తువుల రంగులు'),
      activities: ['art:color'],
      intro: [
        p('Things have colours: a ripe banana is yellow, a crow is black, milk is white, a brinjal is purple.', 'వస్తువులకు రంగులు ఉంటాయి: పండిన అరటి పసుపు, కాకి నలుపు, పాలు తెలుపు, వంకాయ ఊదా.'),
        act('art:color', 'Colour the fruits', 'పండ్లకు రంగు వేయి'),
      ],
      examples: [
        ex(L('What colour is a carrot?', 'క్యారెట్ ఏ రంగు?'), [L('Think of carrot halwa!', 'క్యారెట్ హల్వా గుర్తు తెచ్చుకో!')], L('Orange', 'నారింజ'), { kind: 'emoji', text: '🥕' }),
        ex(L('What colour is a parrot?', 'చిలుక ఏ రంగు?'), [L('A parrot is the colour of leaves.', 'చిలుక ఆకుల రంగులో ఉంటుంది.')], L('Green', 'ఆకుపచ్చ'), { kind: 'emoji', text: '🦜' }),
      ],
      practice: [tp('thing', (r) => colourThingQ(r)), tp('tap', (r) => colourQ(r, 7))],
    },
    {
      id: 'lkg.pattern.repeat', title: L('Repeating patterns', 'మళ్ళీ మళ్ళీ వచ్చే నమూనాలు'),
      activities: ['game:patterns'],
      intro: [
        p('Find the part that repeats. In 🐱 🐶 🐶 🐱 🐶 🐶 the part “cat, dog, dog” repeats.', 'మళ్ళీ వచ్చే భాగాన్ని కనుక్కో. 🐱 🐶 🐶 🐱 🐶 🐶 లో “పిల్లి, కుక్క, కుక్క” మళ్ళీ వస్తుంది.'),
        tip('Say it like a song: cat-dog-dog, cat-dog-dog…', 'పాటలా చెప్పు: పిల్లి-కుక్క-కుక్క…'),
      ],
      examples: [
        ex(L('🔴 🔴 🔵 🔴 🔴 🔵 🔴 … what next?', '🔴 🔴 🔵 🔴 🔴 🔵 🔴 … తర్వాత?'), [L('Red, red, blue repeats.', 'ఎరుపు, ఎరుపు, నీలం మళ్ళీ వస్తుంది.'), L('After one red comes another red.', 'ఒక ఎరుపు తర్వాత ఇంకో ఎరుపు.')], L('🔴 red', '🔴 ఎరుపు')),
        ex(L('☀️ 🌙 ☀️ 🌙 … what next?', '☀️ 🌙 ☀️ 🌙 … తర్వాత?'), [L('Sun, moon repeats.', 'సూర్యుడు, చంద్రుడు మళ్ళీ వస్తారు.')], L('☀️ sun', '☀️ సూర్యుడు')),
      ],
      practice: [tp('next', (r) => patternQ(r, ['AB', 'ABB', 'AAB']))],
    },
  ],
};

const measure: USpec = {
  id: 'lkg.u.measure', subject: 'early', title: L('Long, tall and heavy', 'పొడవు, ఎత్తు, బరువు'), source: null,
  objectives: [{
    id: 'lkg.measure.compare', title: L('Compare length, height and weight', 'పొడవు, ఎత్తు, బరువు పోల్చడం'),
    activities: ['game:balance'],
    intro: [
      p('A train is longer than a pencil. A giraffe is taller than a child. A watermelon is heavier than an apple.', 'రైలు పెన్సిల్ కంటే పొడవు. జిరాఫీ పిల్లవాడి కంటే ఎత్తు. పుచ్చకాయ ఆపిల్ కంటే బరువు.'),
      tip('To compare length, start both things at the same line.', 'పొడవు పోల్చడానికి రెండింటినీ ఒకే గీత దగ్గర మొదలుపెట్టు.'),
      act('game:balance', 'Weigh things on the balance', 'త్రాసులో వస్తువులను తూచు'),
    ],
    examples: [
      ex(L('Which is heavier: a feather or a book?', 'ఏది బరువు: ఈక లేదా పుస్తకం?'), [L('A feather floats in the air. A book is hard to hold up for long.', 'ఈక గాలిలో తేలుతుంది. పుస్తకం బరువుగా ఉంటుంది.')], L('Book', 'పుస్తకం')),
      ex(L('Order from shortest to longest: ruler, crayon, umbrella.', 'పొట్టిది నుండి పొడవైనది వరకు: స్కేలు, క్రేయాన్, గొడుగు.'), [L('The crayon is the shortest.', 'క్రేయాన్ అన్నింటికంటే పొట్టిది.'), L('Then the ruler, then the umbrella.', 'తర్వాత స్కేలు, తర్వాత గొడుగు.')], L('crayon → ruler → umbrella', 'క్రేయాన్ → స్కేలు → గొడుగు')),
    ],
    practice: [
      tp('long', (r) => rankQ(r, 'long', 2)), tp('tall', (r) => rankQ(r, 'tall', 2)), tp('heavy', (r) => rankQ(r, 'heavy', 2)),
      tp('order', (r) => rankOrderQ(r, r.pick(['long', 'tall', 'size']), 3), 2),
    ],
  }],
};

const light: USpec = {
  id: 'lkg.u.light', subject: 'early', title: L('Light and shadows', 'వెలుగు మరియు నీడలు'), source: null,
  objectives: [{
    id: 'lkg.light.shadow', title: L('Light sources and shadows', 'వెలుగు ఇచ్చేవి, నీడలు'),
    activities: ['lab:light', 'art:color'],
    intro: [
      p('Light comes from the sun, a diya, a torch or a bulb. When your body blocks the light, a shadow forms behind you.', 'వెలుగు సూర్యుడు, దీపం, టార్చ్ లేదా బల్బు నుండి వస్తుంది. నీ శరీరం వెలుగును అడ్డుకుంటే నీ వెనుక నీడ పడుతుంది.'),
      p('Make shadow animals on the wall with your hands and a torch!', 'టార్చ్, చేతులతో గోడ మీద నీడ జంతువులు చేయి!'),
      act('lab:light', 'Play with light in the Light Lab', 'లైట్ ల్యాబ్‌లో వెలుగుతో ఆడు'),
    ],
    examples: [
      ex(L('Tap all the things that give light: sun, ball, torch, book.', 'వెలుగు ఇచ్చేవాటిని నొక్కు: సూర్యుడు, బంతి, టార్చ్, పుస్తకం.'), [L('The sun and the torch glow.', 'సూర్యుడు, టార్చ్ వెలుగుతాయి.')], L('Sun and torch', 'సూర్యుడు, టార్చ్')),
      ex(L('Where is your shadow if the sun is in front of you?', 'సూర్యుడు నీ ముందు ఉంటే నీడ ఎక్కడ?'), [L('Your body blocks the light.', 'నీ శరీరం వెలుగును అడ్డుకుంటుంది.'), L('The shadow falls on the other side.', 'నీడ ఎదురు వైపు పడుతుంది.')], L('Behind you', 'నీ వెనుక')),
    ],
    practice: [
      tp('tap', (r) => tapQ(r, L('Tap everything that gives light.', 'వెలుగు ఇచ్చే వాటన్నిటినీ నొక్కు.'), LIGHTS, NOT_LIGHTS, L('Does it glow by itself?', 'అది తనంతట తానే వెలుగుతుందా?'), ['These give light', 'ఇవి వెలుగు ఇస్తాయి'])),
      tp('shadow', (r) => factQ(r, [
        { q: L('What do we need to make a shadow?', 'నీడ రావాలంటే ఏమి కావాలి?'), a: P('light', 'వెలుగు', '🔦'), w: [P('water', 'నీళ్ళు', '💧'), P('music', 'సంగీతం', '🎵')], why: L('A shadow needs light and something to block it.', 'నీడకు వెలుగు, దాన్ని అడ్డుకునే వస్తువు కావాలి.') },
        { q: L('The torch shines from the left. Where does the shadow fall?', 'టార్చ్ ఎడమ వైపు నుండి వెలుగుతోంది. నీడ ఎక్కడ పడుతుంది?'), a: P('on the right', 'కుడి వైపు', '➡️'), w: [P('on the left', 'ఎడమ వైపు', '⬅️'), P('nowhere', 'ఎక్కడా పడదు', '🚫')], why: L('Shadows fall on the side away from the light.', 'నీడ వెలుగుకు ఎదురు వైపు పడుతుంది.') },
        { q: L('Which one makes the darkest shadow?', 'ఏది ఎక్కువ చీకటి నీడ చేస్తుంది?'), a: P('wooden board', 'చెక్క పలక', '🪵'), w: [P('clear glass', 'పారదర్శక గాజు', '🪟'), P('air', 'గాలి', '🌬️')], why: L('Wood stops all the light, so its shadow is dark.', 'చెక్క వెలుగునంతా ఆపుతుంది, కాబట్టి నీడ చీకటిగా ఉంటుంది.') },
        { q: L('In a dark room with no light, can you see your shadow?', 'వెలుగు లేని చీకటి గదిలో నీ నీడ కనిపిస్తుందా?'), a: P('No', 'లేదు', '🙅'), w: [P('Yes', 'అవును', '🙋')], why: L('No light means no shadow.', 'వెలుగు లేకపోతే నీడ ఉండదు.') },
        { q: L('What lights up the sky at night?', 'రాత్రి ఆకాశాన్ని ఏది వెలిగిస్తుంది?'), a: P('moon', 'చంద్రుడు', '🌙'), w: [P('cloud', 'మేఘం', '☁️'), P('kite', 'గాలిపటం', '🪁')], why: L('The moon shines at night.', 'రాత్రి చంద్రుడు ప్రకాశిస్తాడు.') },
      ], L('A shadow forms where light is blocked.', 'వెలుగు అడ్డుపడిన చోట నీడ ఏర్పడుతుంది.'))),
    ],
  }],
};

const sound: USpec = {
  id: 'lkg.u.sound', subject: 'early', title: L('Loud and soft sounds', 'గట్టి మరియు మెల్లని శబ్దాలు'), source: null,
  objectives: [{
    id: 'lkg.sound.loudsoft', title: L('Loud, soft and musical sounds', 'గట్టి, మెల్లని, సంగీత శబ్దాలు'),
    activities: ['game:patterns'],
    intro: [
      p('Thunder and drums are loud. A whisper and a falling leaf are soft.', 'ఉరుము, డప్పు గట్టిగా ఉంటాయి. గుసగుస, రాలే ఆకు మెల్లగా ఉంటాయి.'),
      p('We make music by beating a drum, blowing a trumpet, ringing a bell or plucking guitar strings.', 'డప్పు కొట్టి, బూర ఊది, గంట మోగించి, గిటార్ తీగలు మీటి సంగీతం చేస్తాం.'),
    ],
    examples: [
      ex(L('Which is softer: talking or a whisper?', 'ఏది మెల్లగా: మాట్లాడటం లేదా గుసగుస?'), [L('We whisper to tell a secret quietly.', 'రహస్యం మెల్లగా చెప్పడానికి గుసగుసలాడతాం.')], L('Whisper', 'గుసగుస')),
      ex(L('How do we play a drum?', 'డప్పు ఎలా వాయిస్తాం?'), [L('We hit it with hands or sticks.', 'చేతులతో లేదా కర్రలతో కొడతాం.')], L('We beat it', 'కొడతాం')),
    ],
    practice: [
      tp('loud', (r) => rankQ(r, 'loud', 3)),
      tp('instrument', (r) => factQ(r, INSTRUMENTS, L('Think how you play it: beat, blow, ring, pluck or press?', 'ఎలా వాయిస్తావో ఆలోచించు: కొట్టడం, ఊదడం, మోగించడం, మీటడం లేదా నొక్కడం?'))),
      tp('animal', (r) => animalSoundQ(r)),
    ],
  }],
};

const move: USpec = {
  id: 'lkg.u.move', subject: 'early', title: L('Push and pull', 'తోయడం మరియు లాగడం'), source: null,
  objectives: [{
    id: 'lkg.move.pushpull', title: L('Pushes, pulls and rolling', 'తోయడం, లాగడం, దొర్లడం'),
    activities: ['lab:forces'],
    intro: [
      p('A push moves something away from you. A pull brings it closer. Pushes and pulls make things start, stop or change direction.', 'తోస్తే వస్తువు దూరంగా వెళ్తుంది. లాగితే దగ్గరకు వస్తుంది. తోయడం, లాగడం వల్ల వస్తువులు కదులుతాయి, ఆగుతాయి, దిశ మార్చుకుంటాయి.'),
      act('lab:forces?mass=2&force=10&friction=0', 'Push a box in the Forces Lab', 'ఫోర్సెస్ ల్యాబ్‌లో పెట్టెను తోయి'),
    ],
    examples: [
      ex(L('Opening a drawer — push or pull?', 'సొరుగు తెరవడం — తోయడమా లాగడమా?'), [L('The drawer comes towards you.', 'సొరుగు నీ వైపు వస్తుంది.')], L('Pull', 'లాగడం')),
      ex(L('Tap the things that roll: ball, box, wheel.', 'దొర్లే వాటిని నొక్కు: బంతి, పెట్టె, చక్రం.'), [L('Round things roll.', 'గుండ్రని వస్తువులు దొర్లుతాయి.')], L('Ball and wheel', 'బంతి, చక్రం')),
    ],
    practice: [
      tp('pushpull', (r) => pushPullQ(r)),
      tp('roll', (r) => tapQ(r, L('Tap everything that can roll.', 'దొర్లగలిగే వాటన్నిటినీ నొక్కు.'), ROLLERS, SLIDERS, L('Is it round?', 'అది గుండ్రంగా ఉందా?'), ['These roll', 'ఇవి దొర్లుతాయి'])),
    ],
  }],
};

export default buildClass(1, [numbers, compare, shapes, patterns, measure, light, sound, move]);
