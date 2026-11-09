// UKG — WonderLab pre-primary play curriculum (board 'play').
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
// UKG (level 2) — WonderLab play curriculum (board 'play'): numbers to 20, adding and taking away
// within 10, shapes & sides, growing patterns, measuring, light & shadows, sound, forces,
// floating & sinking, magnets.
// =============================================================================================
/** Number just before / after. */
function beforeAfterQ(r: Rng, lo: number, hi: number): QSpec {
  const n = r.int(lo + 1, hi - 1);
  const after = r.next() < 0.5;
  const ans = after ? n + 1 : n - 1;
  const c = chooseNum(r, ans, [after ? n - 1 : n + 1, n, ans + 1], String, 3);
  return {
    type: 'spoken', prompt: after ? L(`Which number comes just after ${n}?`, `${n} తర్వాత వెంటనే ఏ అంకె వస్తుంది?`) : L(`Which number comes just before ${n}?`, `${n} కి ముందు వెంటనే ఏ అంకె వస్తుంది?`),
    visual: { kind: 'number-line', from: Math.max(0, n - 4), to: Math.min(20, n + 4), step: 1, marks: [n] }, ...c,
    hints: [L(after ? 'Count on by one.' : 'Count back by one.', after ? 'ఒకటి ముందుకు లెక్కపెట్టు.' : 'ఒకటి వెనక్కి లెక్కపెట్టు.')],
    solution: [L(`${after ? `${n}, ${ans}` : `${ans}, ${n}`} — so the answer is ${ans}.`, `${after ? `${n}, ${ans}` : `${ans}, ${n}`} — కాబట్టి జవాబు ${ans}.`)],
  };
}
/** Order 4 numbers. */
function orderNumQ(r: Rng, lo: number, hi: number): QSpec {
  const ns = r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, 4).sort((a, b) => a - b);
  const o = ordering(r, ns.map((n) => L(String(n), String(n))));
  return {
    type: 'drag', prompt: L('Drag the numbers into order, smallest first.', 'అంకెలను చిన్నది ముందుగా వరుసలో పెట్టు.'), ...o,
    hints: [L('Which number do you say first when you count?', 'లెక్కపెట్టేటప్పుడు ఏ అంకె ముందు చెబుతావు?')],
    solution: [L(ns.join(', '), ns.join(', '))],
  };
}
/** Adding two small groups. */
function addQ(r: Rng, max: number): QSpec {
  const o = r.pick(OBJ);
  const a = r.int(1, max - 1), b = r.int(1, max - a);
  const c = chooseNum(r, a + b, [a + b + 1, a + b - 1, Math.max(a, b)], String, 3);
  return {
    type: 'spoken', prompt: L(`${a} ${o.en} and ${b} more ${o.en}. How many ${o.en} in all?`, `${a} ${o.te}, ఇంకా ${b} ${o.te}. మొత్తం ఎన్ని ${o.te}?`),
    visual: { kind: 'emoji', text: `${o.e.repeat(a)} ➕ ${o.e.repeat(b)}` }, ...c,
    hints: [L(`Start at ${a} and count on ${b} more.`, `${a} నుండి మొదలుపెట్టి ఇంకా ${b} ముందుకు లెక్కపెట్టు.`), L('Or count all of them together.', 'లేదా అన్నింటినీ కలిపి లెక్కపెట్టు.')],
    solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
  };
}
/** Taking away. */
function subQ(r: Rng, max: number): QSpec {
  const o = r.pick(OBJ.filter((x) => ['birds', 'ducks', 'butterflies', 'balloons', 'fish'].includes(x.en)));
  const a = r.int(3, max), b = r.int(1, a - 1);
  const away: Record<string, [string, string]> = { birds: ['fly away', 'ఎగిరిపోయాయి'], ducks: ['swim away', 'ఈదుకుంటూ వెళ్ళిపోయాయి'], butterflies: ['fly away', 'ఎగిరిపోయాయి'], balloons: ['pop', 'పగిలిపోయాయి'], fish: ['swim away', 'ఈదుకుంటూ వెళ్ళిపోయాయి'] };
  const c = chooseNum(r, a - b, [a + b, a - b + 1, a - b - 1], String, 3);
  return {
    type: 'spoken', prompt: L(`There are ${a} ${o.en}. ${b} ${away[o.en][0]}. How many are left?`, `${a} ${o.te} ఉన్నాయి. ${b} ${away[o.en][1]}. ఎన్ని మిగిలాయి?`),
    visual: { kind: 'emoji', text: `${o.e.repeat(a - b)} ${'✖️'.repeat(b)}` }, ...c,
    hints: [L(`Hide ${b} fingers out of ${a}.`, `${a} వేళ్ళలో ${b} వేళ్ళు మూసెయ్.`), L('Count the ones that are left.', 'మిగిలినవాటిని లెక్కపెట్టు.')],
    mistakes: [{ when: String(a + b), explain: L('Some went away, so there are fewer now — take away, do not add.', 'కొన్ని వెళ్ళిపోయాయి, కాబట్టి ఇప్పుడు తక్కువ — తీసివేయాలి, కలపకూడదు.') }],
    solution: [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`)],
  };
}
/** Hop on a number line. */
function hopQ(r: Rng, max: number): QSpec {
  const s = r.int(0, max - 2), h = r.int(1, Math.min(5, max - s));
  return {
    type: 'number-line', prompt: L(`A frog starts at ${s} and hops ${h} steps forward. Where does it land?`, `కప్ప ${s} వద్ద మొదలై ${h} అడుగులు ముందుకు దూకింది. ఎక్కడ ఆగింది?`),
    line: { from: 0, to: max, step: 1 }, visual: { kind: 'number-line', from: 0, to: max, step: 1, marks: [s] }, answer: num(s + h),
    hints: [L(`Put your finger on ${s}.`, `నీ వేలు ${s} మీద పెట్టు.`), L(`Hop ${h} times, counting each hop.`, `${h} సార్లు దూకు, ప్రతి దూకును లెక్కపెట్టు.`)],
    mistakes: [{ when: String(s + h - 1), explain: L('Do not count the starting number as a hop.', 'మొదలుపెట్టిన అంకెను దూకుగా లెక్కపెట్టకు.') }],
    solution: [L(`${s} + ${h} = ${s + h}`, `${s} + ${h} = ${s + h}`)],
  };
}
/** Number patterns: counting on by 1, 2, 5 or 10. */
function numPatternQ(r: Rng): QSpec {
  const step = r.pick([1, 2, 5, 10]);
  const start = step === 10 ? r.int(0, 2) * 10 : step === 5 ? r.int(0, 2) * 5 : r.int(1, step === 2 ? 10 : 14);
  const seq = [0, 1, 2, 3].map((i) => start + i * step);
  const ans = start + 4 * step;
  const c = chooseNum(r, ans, [ans + 1, ans - 1, ans + step], String, 3);
  return {
    type: 'spoken', prompt: L(`What comes next? ${seq.join(', ')}, …`, `తర్వాత ఏది? ${seq.join(', ')}, …`), ...c,
    hints: [L('How much does it grow each time?', 'ప్రతిసారి ఎంత పెరుగుతోంది?'), L(`It grows by ${step}.`, `ప్రతిసారి ${step} పెరుగుతుంది.`)],
    solution: [L(`${seq[3]} + ${step} = ${ans}`, `${seq[3]} + ${step} = ${ans}`)],
  };
}

const FLOATS: Pic[] = [P('leaf', 'ఆకు', '🍃'), P('feather', 'ఈక', '🪶'), P('rubber duck', 'రబ్బరు బాతు', '🦆'), P('paper boat', 'కాగితం పడవ', '⛵'), P('piece of wood', 'చెక్క ముక్క', '🪵'), P('sponge', 'స్పాంజి', '🧽'), P('empty bottle', 'ఖాళీ సీసా', '🍾')];
const SINKS: Pic[] = [P('stone', 'రాయి', '🪨'), P('coin', 'నాణెం', '🪙'), P('key', 'తాళం చెవి', '🔑'), P('iron nail', 'ఇనుప మేకు', '🔩'), P('steel spoon', 'స్టీలు చెంచా', '🥄'), P('marble', 'గోలీ', '🔮')];
const MAGNETIC: Pic[] = [P('paper clip', 'పేపర్ క్లిప్', '📎'), P('iron nail', 'ఇనుప మేకు', '🔩'), P('safety pin', 'సేఫ్టీ పిన్', '🧷'), P('iron key', 'ఇనుప తాళం చెవి', '🔑'), P('pin', 'గుండు సూది', '📌')];
const NON_MAGNETIC: Pic[] = [P('paper', 'కాగితం', '📄'), P('teddy bear', 'టెడ్డీ బొమ్మ', '🧸'), P('pencil', 'పెన్సిల్', '✏️'), P('wooden block', 'చెక్క ముక్క', '🪵'), P('glass', 'గాజు గ్లాసు', '🥛'), P('banana', 'అరటి పండు', '🍌'), P('rubber ball', 'రబ్బరు బంతి', '⚽')];

const numbers: USpec = {
  id: 'ukg.u.numbers', subject: 'early', title: L('Numbers 1 to 20', 'అంకెలు 1 నుండి 20'), source: null,
  objectives: [
    {
      id: 'ukg.num.to20', title: L('Count and read numbers to 20', '20 వరకు లెక్కపెట్టడం, చదవడం'),
      activities: ['game:counting', 'art:trace'],
      intro: [
        p('After 10 we keep counting: 11, 12, 13 … 20. A ten and some more ones make the teen numbers.', '10 తర్వాత కూడా లెక్కపెడతాం: 11, 12, 13 … 20. ఒక పది, కొన్ని ఒకట్లు కలిస్తే 11 నుండి 19 అంకెలు వస్తాయి.'),
        vis({ kind: 'objects', emoji: '⭐', count: 14, groupsOf: 10 }, 'Fourteen stars: a group of ten and four more', 'పద్నాలుగు నక్షత్రాలు: పది ఒక గుంపు, ఇంకా నాలుగు'),
        tip('Count in groups of 5 or 10 so you do not lose your place.', '5 లేదా 10 గుంపులుగా లెక్కపెడితే తప్పిపోవు.'),
      ],
      examples: [
        ex(L('How many stars?', 'ఎన్ని నక్షత్రాలు?'), [L('There is a full group of 10.', 'ఒక పూర్తి 10 గుంపు ఉంది.'), L('Count on: 11, 12, 13, 14.', 'ముందుకు లెక్కపెట్టు: 11, 12, 13, 14.')], L('14', '14'), { kind: 'objects', emoji: '⭐', count: 14, groupsOf: 10 }),
        ex(L('Which number is seventeen?', 'పదిహేడు ఏ అంకె?'), [L('Seventeen is ten and seven.', 'పదిహేడు అంటే పది, ఏడు.'), L('We write 1 then 7.', '1 తర్వాత 7 రాస్తాం.')], L('17', '17')),
      ],
      practice: [tp('count', (r) => countQ(r, 8, 20, 5)), tp('numeral', (r) => numeralQ(r, 11, 20))],
    },
    {
      id: 'ukg.num.order', title: L('Before, after and in order', 'ముందు, తర్వాత, వరుస'), prereqs: ['ukg.num.to20'],
      activities: ['game:numberline'],
      intro: [
        p('On a number line, numbers grow as we move right. The number just after 12 is 13; just before 12 is 11.', 'సంఖ్యారేఖపై కుడి వైపుకు వెళ్తే అంకెలు పెరుగుతాయి. 12 తర్వాత 13; 12 కి ముందు 11.'),
        vis({ kind: 'number-line', from: 10, to: 20, step: 1, marks: [12] }, 'Number line from 10 to 20', '10 నుండి 20 వరకు సంఖ్యారేఖ'),
      ],
      examples: [
        ex(L('What comes just after 15?', '15 తర్వాత వెంటనే ఏది?'), [L('Count on one: 15, 16.', 'ఒకటి ముందుకు: 15, 16.')], L('16', '16')),
        ex(L('Put 18, 11, 14 in order.', '18, 11, 14 ను వరుసలో పెట్టు.'), [L('11 is the smallest.', '11 అన్నింటికంటే చిన్నది.'), L('Then 14, then 18.', 'తర్వాత 14, తర్వాత 18.')], L('11, 14, 18', '11, 14, 18')),
      ],
      practice: [tp('beforeafter', (r) => beforeAfterQ(r, 1, 20)), tp('order', (r) => orderNumQ(r, 1, 20))],
    },
  ],
};

const addsub: USpec = {
  id: 'ukg.u.addsub', subject: 'early', title: L('Adding and taking away', 'కలపడం మరియు తీసివేయడం'), source: null,
  objectives: [
    {
      id: 'ukg.add.within10', title: L('Add within 10', '10 లోపు కలపడం'), prereqs: ['ukg.num.to20'],
      activities: ['game:counting', 'game:numberline'],
      intro: [
        p('Adding means putting groups together. 3 mangoes and 2 more mangoes make 5 mangoes.', 'కలపడం అంటే గుంపులను ఒకటిగా చేయడం. 3 మామిడి పండ్లు, ఇంకా 2 కలిపితే 5.'),
        vis({ kind: 'emoji', text: '🥭🥭🥭 ➕ 🥭🥭' }, 'Three mangoes plus two mangoes', 'మూడు మామిడి పండ్లు కలిపి రెండు'),
        tip('Start with the bigger number and count on.', 'పెద్ద అంకె నుండి మొదలుపెట్టి ముందుకు లెక్కపెట్టు.'),
      ],
      examples: [
        ex(L('4 balloons and 3 more. How many?', '4 బెలూన్లు, ఇంకా 3. మొత్తం ఎన్ని?'), [L('Start at 4.', '4 నుండి మొదలుపెట్టు.'), L('Count on: 5, 6, 7.', 'ముందుకు: 5, 6, 7.')], L('7 balloons', '7 బెలూన్లు')),
        ex(L('Frog at 2 hops 5 steps. Where does it land?', 'కప్ప 2 వద్ద నుండి 5 అడుగులు దూకింది. ఎక్కడ?'), [L('Hop: 3, 4, 5, 6, 7.', 'దూకు: 3, 4, 5, 6, 7.')], L('7', '7'), { kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[2, 7]] }),
      ],
      practice: [tp('add', (r) => addQ(r, 10)), tp('hop', (r) => hopQ(r, 10))],
    },
    {
      id: 'ukg.sub.within10', title: L('Take away within 10', '10 లోపు తీసివేయడం'), prereqs: ['ukg.add.within10'],
      activities: ['game:counting'],
      intro: [
        p('Taking away means some go away and we count what is left. 6 birds, 2 fly away, 4 are left.', 'తీసివేయడం అంటే కొన్ని వెళ్ళిపోతాయి, మిగిలినవి లెక్కపెడతాం. 6 పక్షులు, 2 ఎగిరిపోయాయి, 4 మిగిలాయి.'),
        vis({ kind: 'emoji', text: '🐦🐦🐦🐦 ✖️✖️' }, 'Four birds left after two flew away', 'రెండు ఎగిరిపోయాక నాలుగు పక్షులు'),
      ],
      examples: [
        ex(L('5 ducks, 1 swims away. How many are left?', '5 బాతులు, 1 ఈదుకుంటూ వెళ్ళింది. ఎన్ని మిగిలాయి?'), [L('Hold up 5 fingers, fold 1.', '5 వేళ్ళు చూపించి 1 మడువు.')], L('4 ducks', '4 బాతులు')),
        ex(L('8 balloons, 3 pop. How many are left?', '8 బెలూన్లు, 3 పగిలాయి. ఎన్ని మిగిలాయి?'), [L('Count back 3 from 8: 7, 6, 5.', '8 నుండి 3 వెనక్కి: 7, 6, 5.')], L('5 balloons', '5 బెలూన్లు')),
      ],
      practice: [tp('sub', (r) => subQ(r, 10))],
    },
  ],
};

const shapes: USpec = {
  id: 'ukg.u.shapes', subject: 'early', title: L('Shapes and sides', 'ఆకారాలు మరియు భుజాలు'), source: null,
  objectives: [{
    id: 'ukg.shape.sides', title: L('Count sides and name shapes', 'భుజాలు లెక్కపెట్టి ఆకారాలను గుర్తించడం'),
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('A triangle has 3 sides, a square and a rectangle have 4, a pentagon has 5 and a hexagon has 6. A circle has no straight sides.', 'త్రిభుజానికి 3, చతురస్రం, దీర్ఘచతురస్రాలకు 4, పంచభుజికి 5, షడ్భుజికి 6 భుజాలు. వృత్తానికి సరళ భుజాలు ఉండవు.'),
      vis({ kind: 'shape', shape: 'hexagon', color: '#fb8c00' }, 'An orange hexagon, like a honeycomb cell', 'తేనెపట్టు గదిలా నారింజ షడ్భుజి'),
    ],
    examples: [
      ex(L('How many sides does a pentagon have?', 'పంచభుజికి ఎన్ని భుజాలు?'), [L('Trace and count: 1, 2, 3, 4, 5.', 'దిద్దుతూ లెక్కపెట్టు: 1, 2, 3, 4, 5.')], L('5', '5'), { kind: 'shape', shape: 'pentagon', color: '#8e24aa' }),
      ex(L('A shape has 4 sides — 2 long and 2 short. What is it?', '4 భుజాలు — 2 పొడవు, 2 పొట్టి. ఏ ఆకారం?'), [L('A square has 4 equal sides, so it is not a square.', 'చతురస్రానికి 4 సమాన భుజాలు, కాబట్టి అది కాదు.')], L('Rectangle', 'దీర్ఘచతురస్రం')),
    ],
    practice: [tp('sides', (r) => sidesQ(r)), tp('find', (r) => shapeQ(r, ['circle', 'square', 'triangle', 'rectangle', 'pentagon', 'hexagon', 'oval', 'diamond']))],
  }],
};

const patterns: USpec = {
  id: 'ukg.u.patterns', subject: 'early', title: L('Patterns', 'నమూనాలు'), source: null,
  objectives: [{
    id: 'ukg.pattern.grow', title: L('Repeating and number patterns', 'పునరావృత మరియు అంకెల నమూనాలు'),
    activities: ['game:patterns'],
    intro: [
      p('Some patterns repeat: 🍎 🍌 🥭 🍎 🍌 🥭. Some patterns grow: 2, 4, 6, 8 — each time we add 2.', 'కొన్ని నమూనాలు మళ్ళీ వస్తాయి: 🍎 🍌 🥭. కొన్ని పెరుగుతాయి: 2, 4, 6, 8 — ప్రతిసారి 2 కలుపుతాం.'),
      tip('Find the rule, then use it to find the next one.', 'నియమం కనుక్కొని, దాంతో తర్వాతది కనుక్కో.'),
    ],
    examples: [
      ex(L('5, 10, 15, 20, … what next?', '5, 10, 15, 20, … తర్వాత?'), [L('Each number is 5 more.', 'ప్రతి అంకె 5 ఎక్కువ.'), L('20 + 5 = 25', '20 + 5 = 25')], L('25', '25')),
      ex(L('🔴 🔵 🟢 🔴 🔵 … what next?', '🔴 🔵 🟢 🔴 🔵 … తర్వాత?'), [L('Red, blue, green repeats.', 'ఎరుపు, నీలం, ఆకుపచ్చ మళ్ళీ వస్తాయి.')], L('🟢 green', '🟢 ఆకుపచ్చ')),
    ],
    practice: [tp('repeat', (r) => patternQ(r, ['ABC', 'ABB', 'AABB'])), tp('number', (r) => numPatternQ(r))],
  }],
};

const measure: USpec = {
  id: 'ukg.u.measure', subject: 'early', title: L('Measuring and comparing', 'కొలవడం మరియు పోల్చడం'), source: null,
  objectives: [{
    id: 'ukg.measure.order', title: L('Order by length, height and weight', 'పొడవు, ఎత్తు, బరువు ప్రకారం వరుస'),
    activities: ['game:balance'],
    intro: [
      p('We can put things in order: shortest to longest, lightest to heaviest.', 'వస్తువులను వరుసలో పెట్టగలం: పొట్టిది నుండి పొడవైనది, తేలికైనది నుండి బరువైనది.'),
      p('A balance tips down on the heavier side.', 'త్రాసు బరువైన వైపు కిందకు దిగుతుంది.'),
      act('game:balance', 'Try the balance game', 'త్రాసు ఆట ఆడు'),
    ],
    examples: [
      ex(L('Order lightest to heaviest: watermelon, feather, apple.', 'తేలికైనది నుండి బరువైనది: పుచ్చకాయ, ఈక, ఆపిల్.'), [L('A feather is the lightest.', 'ఈక అన్నింటికంటే తేలిక.'), L('A watermelon is the heaviest.', 'పుచ్చకాయ అన్నింటికంటే బరువు.')], L('feather → apple → watermelon', 'ఈక → ఆపిల్ → పుచ్చకాయ')),
      ex(L('Which is the tallest: plant, palm tree or child?', 'ఏది ఎత్తైనది: మొక్క, తాటి చెట్టు, పిల్లవాడు?'), [L('A palm tree is taller than a house.', 'తాటి చెట్టు ఇంటి కంటే ఎత్తు.')], L('Palm tree', 'తాటి చెట్టు')),
    ],
    practice: [
      tp('order', (r) => rankOrderQ(r, r.pick(['long', 'tall', 'heavy', 'size']), 4, 'drag'), 2),
      tp('heavy3', (r) => rankQ(r, 'heavy', 3)), tp('long3', (r) => rankQ(r, 'long', 3)),
    ],
  }],
};

const light: USpec = {
  id: 'ukg.u.light', subject: 'early', title: L('Light and shadows', 'వెలుగు మరియు నీడలు'), source: null,
  objectives: [{
    id: 'ukg.light.shadow', title: L('How shadows are made', 'నీడలు ఎలా ఏర్పడతాయి'),
    activities: ['lab:light'],
    intro: [
      p('Light travels in straight lines. When an object blocks it, a dark shadow forms on the other side.', 'వెలుగు సరళ రేఖల్లో ప్రయాణిస్తుంది. ఏదైనా అడ్డుపడితే అవతలి వైపు చీకటి నీడ ఏర్పడుతుంది.'),
      p('Clear glass lets light through, so it makes almost no shadow.', 'పారదర్శక గాజు వెలుగును పోనిస్తుంది, కాబట్టి దాదాపు నీడ ఉండదు.'),
      act('lab:light?angle=30', 'Shine a ray in the Light Lab', 'లైట్ ల్యాబ్‌లో కిరణం వేయి'),
    ],
    examples: [
      ex(L('The lamp is on the right of the doll. Where is the shadow?', 'దీపం బొమ్మకు కుడి వైపు ఉంది. నీడ ఎక్కడ?'), [L('The shadow is on the side away from the light.', 'నీడ వెలుగుకు ఎదురు వైపు ఉంటుంది.')], L('On the left', 'ఎడమ వైపు')),
      ex(L('Does a window pane make a dark shadow?', 'కిటికీ అద్దం చీకటి నీడ చేస్తుందా?'), [L('Light passes through clear glass.', 'వెలుగు పారదర్శక గాజు గుండా పోతుంది.')], L('No', 'లేదు')),
    ],
    practice: [
      tp('tap', (r) => tapQ(r, L('Tap everything that gives its own light.', 'సొంతంగా వెలుగు ఇచ్చే వాటన్నిటినీ నొక్కు.'), LIGHTS, NOT_LIGHTS, L('Would it glow in a dark room?', 'చీకటి గదిలో అది వెలుగుతుందా?'), ['Light sources', 'వెలుగు ఇచ్చేవి'])),
      tp('shadow', (r) => factQ(r, [
        { q: L('The lamp is on the right. Where does the shadow fall?', 'దీపం కుడి వైపు ఉంది. నీడ ఎక్కడ పడుతుంది?'), a: P('on the left', 'ఎడమ వైపు', '⬅️'), w: [P('on the right', 'కుడి వైపు', '➡️'), P('nowhere', 'ఎక్కడా పడదు', '🚫')], why: L('Shadows fall away from the light.', 'నీడ వెలుగుకు దూరంగా పడుతుంది.') },
        { q: L('Which one makes almost no shadow?', 'దేనికి దాదాపు నీడ ఉండదు?'), a: P('clear glass', 'పారదర్శక గాజు', '🪟'), w: [P('book', 'పుస్తకం', '📕'), P('hand', 'చేయి', '✋')], why: L('Light passes through clear glass.', 'వెలుగు పారదర్శక గాజు గుండా పోతుంది.') },
        { q: L('When is your shadow longest outside?', 'బయట నీ నీడ ఎప్పుడు అన్నింటికంటే పొడవు?'), a: P('early morning', 'తెల్లవారుజామున', '🌅'), w: [P('at noon', 'మధ్యాహ్నం', '🕛'), P('never', 'ఎప్పుడూ కాదు', '🚫')], why: L('When the sun is low, shadows are long.', 'సూర్యుడు కిందుగా ఉన్నప్పుడు నీడలు పొడవుగా ఉంటాయి.') },
        { q: L('What colour is a shadow?', 'నీడ ఏ రంగులో ఉంటుంది?'), a: P('dark', 'చీకటి', '⬛'), w: [P('rainbow colours', 'ఇంద్రధనుస్సు రంగులు', '🌈'), P('bright yellow', 'పసుపు', '🟨')], why: L('A shadow is dark because light cannot reach there.', 'అక్కడికి వెలుగు రాదు కాబట్టి నీడ చీకటిగా ఉంటుంది.') },
        { q: L('Move the torch closer to your hand. The shadow becomes…', 'టార్చ్‌ను చేతికి దగ్గరగా తెస్తే నీడ…'), a: P('bigger', 'పెద్దదవుతుంది', '🔼'), w: [P('smaller', 'చిన్నదవుతుంది', '🔽'), P('disappears', 'మాయమవుతుంది', '🚫')], why: L('Closer to the light, the object blocks more light, so the shadow grows.', 'వెలుగుకు దగ్గరైతే ఎక్కువ వెలుగు అడ్డుపడి నీడ పెద్దదవుతుంది.') },
      ], L('Shadows form on the side away from the light.', 'నీడలు వెలుగుకు ఎదురు వైపు ఏర్పడతాయి.'))),
    ],
  }],
};

const sound: USpec = {
  id: 'ukg.u.sound', subject: 'early', title: L('Sounds', 'శబ్దాలు'), source: null,
  objectives: [{
    id: 'ukg.sound.sources', title: L('Where sounds come from', 'శబ్దాలు ఎక్కడి నుండి వస్తాయి'),
    activities: ['game:logic'],
    intro: [
      p('Sounds are made when things shake (vibrate): a drum skin, guitar strings, a bell.', 'వస్తువులు కంపిస్తే శబ్దం వస్తుంది: డప్పు చర్మం, గిటార్ తీగలు, గంట.'),
      p('We hear sounds with our ears. Very loud sounds can hurt our ears.', 'శబ్దాలను చెవులతో వింటాం. చాలా గట్టి శబ్దాలు చెవులకు హాని చేస్తాయి.'),
    ],
    examples: [
      ex(L('Pluck a rubber band. What do you see and hear?', 'రబ్బరు బ్యాండ్‌ను మీటు. ఏమి చూస్తావు, వింటావు?'), [L('It shakes fast.', 'అది వేగంగా కంపిస్తుంది.'), L('It makes a twang sound.', 'శబ్దం చేస్తుంది.')], L('It vibrates and makes a sound', 'కంపించి శబ్దం చేస్తుంది')),
      ex(L('Which is the loudest: whisper, drum, thunder?', 'ఏది అత్యంత గట్టిగా: గుసగుస, డప్పు, ఉరుము?'), [L('Thunder can shake windows.', 'ఉరుము కిటికీలను కూడా కదిలిస్తుంది.')], L('Thunder', 'ఉరుము')),
    ],
    practice: [
      tp('match', (r) => pairsQ(r, L('Match each animal to its sound', 'ప్రతి జంతువును దాని శబ్దంతో జత చేయి'), ANIMAL_SOUNDS.map(([a, en, te]) => [a, P(`“${en}”`, `“${te}”`, '🔊')] as [Pic, Pic]), L('Say each sound aloud.', 'ప్రతి శబ్దాన్ని గట్టిగా చెప్పు.'))),
      tp('instrument', (r) => factQ(r, INSTRUMENTS, L('How do you play it?', 'దాన్ని ఎలా వాయిస్తావు?'))),
      tp('loud', (r) => rankOrderQ(r, 'loud', 3)),
    ],
  }],
};

const move: USpec = {
  id: 'ukg.u.move', subject: 'early', title: L('Push, pull, roll and slide', 'తోయడం, లాగడం, దొర్లడం, జారడం'), source: null,
  objectives: [{
    id: 'ukg.move.force', title: L('Forces make things move', 'బలం వస్తువులను కదిలిస్తుంది'),
    activities: ['lab:forces'],
    intro: [
      p('A push or a pull is called a force. A bigger push makes things go faster. A rough floor slows things down.', 'తోయడం లేదా లాగడాన్ని బలం అంటారు. ఎక్కువ బలంగా తోస్తే వేగంగా వెళ్తుంది. గరుకు నేల వస్తువులను నెమ్మదింపజేస్తుంది.'),
      act('lab:forces?mass=2&force=10&friction=0.1', 'Push a box gently, then harder', 'పెట్టెను మెల్లగా, తర్వాత గట్టిగా తోయి'),
    ],
    examples: [
      ex(L('Pulling water from a well — push or pull?', 'బావి నుండి నీళ్ళు చేదడం — తోయడమా లాగడమా?'), [L('The bucket comes up towards you.', 'బకెట్ నీ వైపు పైకి వస్తుంది.')], L('Pull', 'లాగడం')),
      ex(L('Which goes farther on a smooth floor: a ball or a brick?', 'నునుపు నేలపై ఏది ఎక్కువ దూరం: బంతి లేదా ఇటుక?'), [L('The ball rolls; the brick only slides and stops soon.', 'బంతి దొర్లుతుంది; ఇటుక జారి త్వరగా ఆగుతుంది.')], L('Ball', 'బంతి')),
    ],
    practice: [
      tp('pushpull', (r) => pushPullQ(r)),
      tp('roll', (r) => tapQ(r, L('Tap everything that rolls.', 'దొర్లే వాటన్నిటినీ నొక్కు.'), ROLLERS, SLIDERS, L('Round things roll; flat things slide.', 'గుండ్రనివి దొర్లుతాయి; చదునువి జారుతాయి.'), ['These roll', 'ఇవి దొర్లుతాయి'])),
    ],
  }],
};

const floatSink: USpec = {
  id: 'ukg.u.float', subject: 'early', title: L('Floating and sinking', 'తేలడం మరియు మునగడం'), source: null,
  objectives: [{
    id: 'ukg.float.sink', title: L('What floats? What sinks?', 'ఏది తేలుతుంది? ఏది మునుగుతుంది?'),
    activities: ['lab:forces'],
    intro: [
      p('Put things in a bucket of water. Some stay on top — they float. Some go down to the bottom — they sink.', 'బకెట్ నీళ్ళలో వస్తువులను వేయి. కొన్ని పైనే ఉంటాయి — తేలుతాయి. కొన్ని అడుగుకు వెళ్తాయి — మునుగుతాయి.'),
      tip('Wood, leaves and empty bottles usually float. Stones, coins and keys sink.', 'చెక్క, ఆకులు, ఖాళీ సీసాలు తేలుతాయి. రాళ్ళు, నాణేలు, తాళాలు మునుగుతాయి.'),
    ],
    examples: [
      ex(L('A paper boat in a puddle — float or sink?', 'నీటి గుంటలో కాగితం పడవ — తేలుతుందా మునుగుతుందా?'), [L('It is light and spread out.', 'అది తేలికగా, విశాలంగా ఉంటుంది.')], L('Float', 'తేలుతుంది')),
      ex(L('A coin dropped in a glass of water?', 'గ్లాసు నీళ్ళలో వేసిన నాణెం?'), [L('A small coin is heavy for its size.', 'చిన్న నాణెం దాని పరిమాణానికి బరువు.')], L('Sink', 'మునుగుతుంది')),
    ],
    practice: [
      tp('tap', (r) => tapQ(r, L('Tap everything that floats on water.', 'నీటిపై తేలే వాటన్నిటినీ నొక్కు.'), FLOATS, SINKS, L('Is it light for its size, or full of air?', 'అది తేలికగా ఉందా, లోపల గాలి ఉందా?'), ['These float', 'ఇవి తేలుతాయి'])),
      tp('which', (r) => poolQ(r, L('Which one will sink?', 'వీటిలో ఏది మునుగుతుంది?'), SINKS, FLOATS, L('Heavy, solid things like metal and stone sink.', 'లోహం, రాయి లాంటి బరువైన గట్టి వస్తువులు మునుగుతాయి.'), (x) => L(`The ${x.en} sinks.`, `${x.te} మునుగుతుంది.`))),
    ],
  }],
};

const magnets: USpec = {
  id: 'ukg.u.magnet', subject: 'early', title: L('Magic of magnets', 'అయస్కాంతాల మాయ'), source: null,
  objectives: [{
    id: 'ukg.magnet.attract', title: L('What does a magnet pull?', 'అయస్కాంతం దేన్ని లాగుతుంది?'),
    activities: ['game:logic'],
    intro: [
      p('A magnet pulls things made of iron, like pins, nails and paper clips. It does not pull paper, wood, plastic or glass.', 'అయస్కాంతం ఇనుముతో చేసిన పిన్నులు, మేకులు, క్లిప్పులను లాగుతుంది. కాగితం, చెక్క, ప్లాస్టిక్, గాజును లాగదు.'),
      p('Two magnets can pull together or push apart, depending on which ends face each other.', 'రెండు అయస్కాంతాలు ఏ చివరలు ఎదురెదురుగా ఉన్నాయో బట్టి దగ్గరకు లాక్కుంటాయి లేదా దూరంగా తోసుకుంటాయి.'),
    ],
    examples: [
      ex(L('Will a magnet pick up a safety pin?', 'అయస్కాంతం సేఫ్టీ పిన్‌ను ఎత్తుతుందా?'), [L('A safety pin is made of iron/steel.', 'సేఫ్టీ పిన్ ఇనుముతో చేసింది.')], L('Yes', 'అవును')),
      ex(L('Will a magnet pick up a pencil?', 'అయస్కాంతం పెన్సిల్‌ను ఎత్తుతుందా?'), [L('A pencil is wood and graphite — no iron.', 'పెన్సిల్ చెక్కతో చేసింది — ఇనుము లేదు.')], L('No', 'లేదు')),
    ],
    practice: [
      tp('tap', (r) => tapQ(r, L('Tap everything a magnet will pull.', 'అయస్కాంతం లాగే వాటన్నిటినీ నొక్కు.'), MAGNETIC, NON_MAGNETIC, L('Is it made of iron?', 'అది ఇనుముతో చేసిందా?'), ['A magnet pulls', 'అయస్కాంతం లాగేవి'])),
      tp('which', (r) => poolQ(r, L('Which one will stick to a magnet?', 'వీటిలో ఏది అయస్కాంతానికి అంటుకుంటుంది?'), MAGNETIC, NON_MAGNETIC, L('Magnets pull iron things.', 'అయస్కాంతాలు ఇనుప వస్తువులను లాగుతాయి.'), (x) => L(`The ${x.en} has iron, so the magnet pulls it.`, `${x.te} లో ఇనుము ఉంది, కాబట్టి అయస్కాంతం లాగుతుంది.`))),
    ],
  }],
};

export default buildClass(2, [numbers, addsub, shapes, patterns, measure, light, sound, move, floatSink, magnets]);
