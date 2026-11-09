// Nursery — WonderLab pre-primary play curriculum (board 'play').
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
// Nursery (level 0) — WonderLab play curriculum (board 'play'): counting to 5, shapes, colours,
// AB patterns, big/small, light & dark, sounds, rolling and pushing.
// =============================================================================================
const count: USpec = {
  id: 'n.u.count', subject: 'early', title: L('Counting 1 to 5', 'లెక్కలు 1 నుండి 5'), source: null,
  objectives: [
    {
      id: 'n.count.to5', title: L('Count up to 5 things', '5 వరకు వస్తువులను లెక్కపెట్టడం'),
      activities: ['game:counting'],
      intro: [
        p('We count to find out how many. Touch each thing once and say one number: 1, 2, 3, 4, 5.', 'ఎన్ని ఉన్నాయో తెలుసుకోవడానికి లెక్కపెడతాం. ప్రతి దాన్ని ఒక్కసారి తాకి ఒక అంకె చెప్పు: 1, 2, 3, 4, 5.'),
        vis({ kind: 'objects', emoji: '🥭', count: 3 }, 'Three mangoes', 'మూడు మామిడి పండ్లు'),
        tip('The last number you say tells how many there are.', 'నువ్వు చివరగా చెప్పిన అంకెనే మొత్తం ఎన్నో చెబుతుంది.'),
      ],
      examples: [
        ex(L('How many ducks?', 'ఎన్ని బాతులు?'), [L('Touch the first duck: 1.', 'మొదటి బాతును తాకు: 1.'), L('Then 2, then 3.', 'తర్వాత 2, తర్వాత 3.')], L('3 ducks', '3 బాతులు'), { kind: 'objects', emoji: '🦆', count: 3 }),
        ex(L('How many balloons?', 'ఎన్ని బెలూన్లు?'), [L('Count: 1, 2, 3, 4, 5.', 'లెక్కపెట్టు: 1, 2, 3, 4, 5.'), L('The last number is 5.', 'చివరి అంకె 5.')], L('5 balloons', '5 బెలూన్లు'), { kind: 'objects', emoji: '🎈', count: 5 }),
      ],
      practice: [tp('count', (r) => countQ(r, 1, 5)), tp('group', (r) => findGroupQ(r, 1, 5))],
    },
    {
      id: 'n.num.to5', title: L('Know the numbers 1 to 5', '1 నుండి 5 అంకెలను గుర్తించడం'), prereqs: ['n.count.to5'],
      activities: ['art:trace', 'game:counting'],
      intro: [
        p('Each number has a shape we can see and a name we can say. 3 is called three.', 'ప్రతి అంకెకు ఒక రూపం, ఒక పేరు ఉంటాయి. 3 ను మూడు అంటారు.'),
        vis({ kind: 'emoji', text: '1 2 3 4 5' }, 'Numbers one to five', 'ఒకటి నుండి ఐదు వరకు అంకెలు'),
        act('art:trace', 'Trace the numbers 1 to 5', '1 నుండి 5 అంకెలను దిద్దు'),
      ],
      examples: [
        ex(L('Which number shows 🍎🍎?', '🍎🍎 కు ఏ అంకె?'), [L('Count the apples: 1, 2.', 'ఆపిల్‌లను లెక్కపెట్టు: 1, 2.')], L('2', '2')),
        ex(L('Find the number four.', 'నాలుగు అంకెను కనుక్కో.'), [L('Count 1, 2, 3, 4 on your fingers.', 'వేళ్ళపై 1, 2, 3, 4 లెక్కపెట్టు.'), L('Four looks like 4.', 'నాలుగు ఇలా ఉంటుంది: 4.')], L('4', '4')),
      ],
      practice: [tp('numeral', (r) => numeralQ(r, 1, 5)), tp('match', (r) => numberMatchQ(r, 1, 5))],
    },
  ],
};

const shapes: USpec = {
  id: 'n.u.shapes', subject: 'early', title: L('Shapes around us', 'మన చుట్టూ ఆకారాలు'), source: null,
  objectives: [{
    id: 'n.shape.basic', title: L('Circle, square, triangle and star', 'వృత్తం, చతురస్రం, త్రిభుజం, నక్షత్రం'),
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('A circle is round like a coin. A square has 4 equal sides. A triangle has 3 sides. A star has 5 points.', 'వృత్తం నాణెంలా గుండ్రంగా ఉంటుంది. చతురస్రానికి 4 సమాన భుజాలు. త్రిభుజానికి 3 భుజాలు. నక్షత్రానికి 5 కొనలు.'),
      vis({ kind: 'shape', shape: 'circle', color: '#e53935' }, 'A red circle', 'ఎరుపు వృత్తం'),
      act('art:trace', 'Trace a circle and a triangle', 'వృత్తం, త్రిభుజం దిద్దు'),
    ],
    examples: [
      ex(L('Is a coin round?', 'నాణెం గుండ్రంగా ఉందా?'), [L('Run your finger around the edge. There are no corners.', 'అంచు చుట్టూ వేలు తిప్పు. మూలలు లేవు.')], L('Yes — a coin is a circle.', 'అవును — నాణెం వృత్తం.'), { kind: 'emoji', text: '🪙' }),
      ex(L('How many sides does a triangle have?', 'త్రిభుజానికి ఎన్ని భుజాలు?'), [L('Count each side: 1, 2, 3.', 'ప్రతి భుజాన్ని లెక్కపెట్టు: 1, 2, 3.')], L('3 sides', '3 భుజాలు'), { kind: 'shape', shape: 'triangle', color: '#43a047' }),
    ],
    practice: [tp('find', (r) => shapeQ(r, ['circle', 'square', 'triangle', 'star'])), tp('things', (r) => shapeThingsQ(r, 4))],
  }],
};

const colours: USpec = {
  id: 'n.u.colours', subject: 'early', title: L('Colours and patterns', 'రంగులు మరియు నమూనాలు'), source: null,
  objectives: [
    {
      id: 'n.colour.name', title: L('Red, blue, green and yellow', 'ఎరుపు, నీలం, ఆకుపచ్చ, పసుపు'),
      activities: ['art:color'],
      intro: [
        p('Colours are everywhere! A tomato is red, the sky is blue, a leaf is green and a banana is yellow.', 'రంగులు అన్ని చోట్లా ఉన్నాయి! టమాటా ఎరుపు, ఆకాశం నీలం, ఆకు ఆకుపచ్చ, అరటి పండు పసుపు.'),
        act('art:color', 'Colour a picture', 'బొమ్మకు రంగు వేయి'),
      ],
      examples: [
        ex(L('What colour is this leaf?', 'ఈ ఆకు ఏ రంగు?'), [L('Look at it. It is like grass.', 'చూడు. గడ్డిలా ఉంది.')], L('Green', 'ఆకుపచ్చ'), { kind: 'emoji', text: '🍃' }),
        ex(L('Find the yellow star.', 'పసుపు నక్షత్రాన్ని కనుక్కో.'), [L('Yellow is the colour of a banana.', 'పసుపు అరటి పండు రంగు.')], L('The yellow star', 'పసుపు నక్షత్రం'), { kind: 'shape', shape: 'star', color: '#fdd835' }),
      ],
      practice: [tp('tap', (r) => colourQ(r, 4))],
    },
    {
      id: 'n.pattern.ab', title: L('Simple AB patterns', 'సులభమైన AB నమూనాలు'),
      activities: ['game:patterns'],
      intro: [
        p('A pattern repeats again and again: red, blue, red, blue…', 'నమూనా మళ్ళీ మళ్ళీ వస్తుంది: ఎరుపు, నీలం, ఎరుపు, నీలం…'),
        vis({ kind: 'emoji', text: '🔴 🔵 🔴 🔵 🔴 🔵' }, 'Red blue pattern', 'ఎరుపు నీలం నమూనా'),
        tip('Clap and say the pattern out loud.', 'చప్పట్లు కొడుతూ నమూనాను గట్టిగా చెప్పు.'),
      ],
      examples: [
        ex(L('🍎 🍌 🍎 🍌 🍎 … what next?', '🍎 🍌 🍎 🍌 🍎 … తర్వాత?'), [L('Apple, banana repeats.', 'ఆపిల్, అరటి మళ్ళీ వస్తున్నాయి.'), L('After apple comes banana.', 'ఆపిల్ తర్వాత అరటి.')], L('🍌 banana', '🍌 అరటి')),
        ex(L('⭐ 🌙 ⭐ 🌙 … what next?', '⭐ 🌙 ⭐ 🌙 … తర్వాత?'), [L('Star, moon repeats.', 'నక్షత్రం, చంద్రుడు మళ్ళీ వస్తున్నారు.')], L('⭐ star', '⭐ నక్షత్రం')),
      ],
      practice: [tp('next', (r) => patternQ(r, ['AB']))],
    },
  ],
};

const size: USpec = {
  id: 'n.u.size', subject: 'early', title: L('Big and small', 'పెద్దది మరియు చిన్నది'), source: null,
  objectives: [{
    id: 'n.size.bigsmall', title: L('Tell big from small', 'పెద్దది, చిన్నది గుర్తించడం'),
    activities: ['game:logic'],
    intro: [
      p('An elephant is big. An ant is small. We can compare two things and say which is bigger.', 'ఏనుగు పెద్దది. చీమ చిన్నది. రెండింటిని పోల్చి ఏది పెద్దదో చెప్పగలం.'),
      vis({ kind: 'emoji', text: '🐘 🐜' }, 'A big elephant and a small ant', 'పెద్ద ఏనుగు, చిన్న చీమ'),
    ],
    examples: [
      ex(L('Which is bigger: a cow or a mouse?', 'ఏది పెద్దది: ఆవు లేదా ఎలుక?'), [L('A cow is much bigger than a mouse.', 'ఆవు ఎలుక కంటే చాలా పెద్దది.')], L('Cow', 'ఆవు')),
      ex(L('Which is smaller: a cat or an elephant?', 'ఏది చిన్నది: పిల్లి లేదా ఏనుగు?'), [L('A cat can sit on your lap. An elephant cannot!', 'పిల్లి నీ ఒడిలో కూర్చోగలదు. ఏనుగు కూర్చోలేదు!')], L('Cat', 'పిల్లి')),
    ],
    practice: [tp('two', (r) => rankQ(r, 'size', 2))],
  }],
};

const light: USpec = {
  id: 'n.u.light', subject: 'early', title: L('Light and dark', 'వెలుగు మరియు చీకటి'), source: null,
  objectives: [{
    id: 'n.light.sources', title: L('Things that give light', 'వెలుగు ఇచ్చే వస్తువులు'),
    activities: ['lab:light'],
    intro: [
      p('The sun gives us light in the day. At night we use a lamp, a torch or a bulb.', 'పగలు సూర్యుడు వెలుగు ఇస్తాడు. రాత్రి దీపం, టార్చ్ లేదా బల్బు వాడతాం.'),
      p('When something blocks the light, we see a dark shadow.', 'ఏదైనా వెలుగుకు అడ్డు వస్తే చీకటి నీడ కనిపిస్తుంది.'),
      vis({ kind: 'emoji', text: '☀️ 🪔 🔦' }, 'Sun, lamp and torch', 'సూర్యుడు, దీపం, టార్చ్'),
    ],
    examples: [
      ex(L('Which gives light: a ball or a candle?', 'ఏది వెలుగు ఇస్తుంది: బంతి లేదా కొవ్వొత్తి?'), [L('Light a candle and it glows.', 'కొవ్వొత్తి వెలిగిస్తే వెలుగు వస్తుంది.')], L('Candle', 'కొవ్వొత్తి')),
      ex(L('The sun is in the sky. Is it day or night?', 'ఆకాశంలో సూర్యుడు ఉన్నాడు. పగలా రాత్రా?'), [L('The sun shines in the day.', 'సూర్యుడు పగలు ప్రకాశిస్తాడు.')], L('Day', 'పగలు')),
    ],
    practice: [
      tp('which', (r) => poolQ(r, L('Which one gives light?', 'వీటిలో ఏది వెలుగు ఇస్తుంది?'), LIGHTS, NOT_LIGHTS, L('Which one glows and helps us see in the dark?', 'చీకటిలో ఏది వెలిగి మనకు చూపిస్తుంది?'), (x) => L(`The ${x.en} gives light.`, `${x.te} వెలుగు ఇస్తుంది.`))),
      tp('daynight', (r) => factQ(r, [
        { q: L('The sun is shining. Is it day or night?', 'సూర్యుడు ప్రకాశిస్తున్నాడు. పగలా రాత్రా?'), a: P('Day', 'పగలు', '☀️'), w: [P('Night', 'రాత్రి', '🌙')], why: L('The sun shines in the day.', 'సూర్యుడు పగలు ప్రకాశిస్తాడు.') },
        { q: L('The moon and stars are out. Is it day or night?', 'చంద్రుడు, నక్షత్రాలు కనిపిస్తున్నాయి. పగలా రాత్రా?'), a: P('Night', 'రాత్రి', '🌙'), w: [P('Day', 'పగలు', '☀️')], why: L('We see the moon and stars at night.', 'రాత్రి చంద్రుడు, నక్షత్రాలు కనిపిస్తాయి.') },
        { q: L('What do we switch on in a dark room?', 'చీకటి గదిలో ఏది వేస్తాం?'), a: P('bulb', 'బల్బు', '💡'), w: [P('ball', 'బంతి', '⚽'), P('pillow', 'దిండు', '🛏️')], why: L('A bulb lights up the room.', 'బల్బు గదిని వెలిగిస్తుంది.') },
        { q: L('What makes a shadow on the wall?', 'గోడ మీద నీడ ఎలా వస్తుంది?'), a: P('hand in front of a torch', 'టార్చ్ ముందు చేయి', '✋'), w: [P('water', 'నీళ్ళు', '💧'), P('music', 'సంగీతం', '🎵')], why: L('Your hand blocks the light and makes a shadow.', 'చేయి వెలుగును అడ్డుకుని నీడ చేస్తుంది.') },
        { q: L('Which light do we light for Diwali?', 'దీపావళికి ఏ వెలుగు వెలిగిస్తాం?'), a: P('diya', 'దీపం', '🪔'), w: [P('book', 'పుస్తకం', '📕'), P('cup', 'కప్పు', '☕')], why: L('We light diyas for Diwali.', 'దీపావళికి దీపాలు వెలిగిస్తాం.') },
      ], L('Think about when it is bright and when it is dark.', 'ఎప్పుడు వెలుగు, ఎప్పుడు చీకటి అని ఆలోచించు.'))),
    ],
  }],
};

const sound: USpec = {
  id: 'n.u.sound', subject: 'early', title: L('Sounds around us', 'మన చుట్టూ శబ్దాలు'), source: null,
  objectives: [{
    id: 'n.sound.animals', title: L('Animal sounds, loud and soft', 'జంతువుల శబ్దాలు, గట్టి మరియు మెల్లని'),
    activities: ['game:logic'],
    intro: [
      p('Listen! A cow says “moo”, a dog says “bow-wow”, a cat says “meow”.', 'విను! ఆవు “అంబా”, కుక్క “భౌ భౌ”, పిల్లి “మియావ్” అంటాయి.'),
      p('Some sounds are loud, like thunder. Some are soft, like a whisper.', 'కొన్ని శబ్దాలు ఉరుములా గట్టిగా, కొన్ని గుసగుసలా మెల్లగా ఉంటాయి.'),
    ],
    examples: [
      ex(L('Who says “quack”?', '“క్వాక్” అని ఎవరు అంటారు?'), [L('Ducks live near ponds and say quack.', 'బాతులు చెరువు దగ్గర ఉంటూ క్వాక్ అంటాయి.')], L('🦆 Duck', '🦆 బాతు')),
      ex(L('Which is louder: a whisper or thunder?', 'ఏది గట్టిగా: గుసగుస లేదా ఉరుము?'), [L('Thunder is so loud we cover our ears.', 'ఉరుము చాలా గట్టిగా ఉంటుంది, చెవులు మూసుకుంటాం.')], L('Thunder', 'ఉరుము')),
    ],
    practice: [tp('who', (r) => animalSoundQ(r)), tp('loud', (r) => rankQ(r, 'loud', 2))],
  }],
};

const move: USpec = {
  id: 'n.u.move', subject: 'early', title: L('Things that move', 'కదిలే వస్తువులు'), source: null,
  objectives: [{
    id: 'n.move.roll', title: L('Rolling, pushing and pulling', 'దొర్లడం, తోయడం, లాగడం'),
    activities: ['lab:forces'],
    intro: [
      p('Round things like a ball can roll. A box slides but does not roll.', 'బంతి లాంటి గుండ్రని వస్తువులు దొర్లుతాయి. పెట్టె జారుతుంది కానీ దొర్లదు.'),
      p('We push a swing away. We pull a drawer towards us.', 'ఊయలను దూరంగా తోస్తాం. సొరుగును మన వైపు లాగుతాం.'),
    ],
    examples: [
      ex(L('Which can roll: a ball or a book?', 'ఏది దొర్లుతుంది: బంతి లేదా పుస్తకం?'), [L('A ball is round all over.', 'బంతి అంతా గుండ్రంగా ఉంటుంది.')], L('Ball', 'బంతి')),
      ex(L('Kicking a ball — push or pull?', 'బంతిని తన్నడం — తోయడమా లాగడమా?'), [L('The ball moves away from you.', 'బంతి నీ నుండి దూరంగా వెళ్తుంది.')], L('Push', 'తోయడం')),
    ],
    practice: [
      tp('roll', (r) => poolQ(r, L('Which one can roll?', 'వీటిలో ఏది దొర్లుతుంది?'), ROLLERS, SLIDERS, L('Round things roll. Flat sides make things slide.', 'గుండ్రని వస్తువులు దొర్లుతాయి. చదునుగా ఉన్నవి జారుతాయి.'), (x) => L(`The ${x.en} is round, so it rolls.`, `${x.te} గుండ్రంగా ఉంది, కాబట్టి దొర్లుతుంది.`))),
      tp('pushpull', (r) => pushPullQ(r)),
    ],
  }],
};

export default buildClass(0, [count, shapes, colours, size, light, sound, move]);
