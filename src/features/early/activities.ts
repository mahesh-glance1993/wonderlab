// Pure, seeded logic for the newer Play & Learn activities (no React, no DOM — unit tested in
// tests/early-activities.test.ts): Memory Match, Colour Mixing, Rhymes & Songs, Opposites,
// Patterns, Sound Safari, and the Daily Surprise + Sticker Book.
//
// TELUGU REVIEW NEEDED: every `te` string below is a first draft that has not been checked by a
// native speaker (ideally a pre-primary teacher). Rhymes marked `original` were written for
// WonderLab; `traditional` ones are long-standing public-domain folk / nursery rhymes.
import { PIC, COLOUR_NAMES, L, type ColourId } from './data/pictures';
import { SHAPE, type ShapeId } from './data/shapes';
import { clamp, rng, sample, shuffle, type Rng } from './logicCore';

const nameOfPic = (id: string): L => (PIC[id] ? L(PIC[id].en, PIC[id].te) : L(id, id));

// =====================================================================================
// Memory Match
// =====================================================================================
export type MemorySize = 'small' | 'medium' | 'large';
export const MEMORY_SIZES: Record<MemorySize, { pairs: number; cols: number; name: L }> = {
  small: { pairs: 3, cols: 3, name: L('6 cards', '6 కార్డులు') },
  medium: { pairs: 6, cols: 4, name: L('12 cards', '12 కార్డులు') },
  large: { pairs: 8, cols: 4, name: L('16 cards', '16 కార్డులు') },
};
export const MEMORY_SIZE_IDS = Object.keys(MEMORY_SIZES) as MemorySize[];
export type MemoryTheme = 'animals' | 'fruits' | 'vehicles' | 'mix';
export const MEMORY_POOLS: Record<Exclude<MemoryTheme, 'mix'>, string[]> = {
  animals: ['cow', 'cat', 'dog', 'frog', 'hen', 'crow', 'parrot', 'peacock', 'duck', 'owl', 'elephant', 'lion', 'monkey', 'goat', 'sheep', 'horse'],
  fruits: ['mango', 'banana', 'apple', 'grapes', 'orange', 'watermelon', 'coconut', 'pineapple', 'tomato', 'carrot'],
  vehicles: ['bus', 'car', 'auto', 'bicycle', 'train', 'aeroplane', 'boat', 'tractor'],
};
export const MEMORY_THEMES: { id: MemoryTheme; title: L; cover: string }[] = [
  { id: 'animals', title: L('Animals', 'జంతువులు'), cover: 'cow' },
  { id: 'fruits', title: L('Fruits', 'పండ్లు'), cover: 'mango' },
  { id: 'vehicles', title: L('Vehicles', 'వాహనాలు'), cover: 'bus' },
  { id: 'mix', title: L('Mixed', 'అన్నీ కలిపి'), cover: 'parrot' },
];
export const memoryPool = (theme: MemoryTheme): string[] =>
  theme === 'mix' ? [...MEMORY_POOLS.animals, ...MEMORY_POOLS.fruits, ...MEMORY_POOLS.vehicles] : MEMORY_POOLS[theme];

export interface MemCard { idx: number; pair: string; art: string }
export interface MemState { cards: MemCard[]; open: number[]; matched: string[]; moves: number }
export type FlipEvent = 'ignored' | 'first' | 'match' | 'miss';

/** A shuffled deck of `pairs` × 2 cards; every picture appears exactly twice. */
export function memoryDeck(r: Rng, size: MemorySize, theme: MemoryTheme): MemCard[] {
  const { pairs } = MEMORY_SIZES[size];
  const pics = sample(r, memoryPool(theme), pairs);
  return shuffle(r, [...pics, ...pics]).map((id, idx) => ({ idx, pair: id, art: id }));
}
export const memoryStart = (cards: MemCard[]): MemState => ({ cards, open: [], matched: [], moves: 0 });
/** Turn card `i` face up. Two open cards make one move; a pair stays up, a miss waits for memoryHide. */
export function memoryFlip(s: MemState, i: number): { s: MemState; event: FlipEvent } {
  const c = s.cards[i];
  if (!c || s.open.length >= 2 || s.open.includes(i) || s.matched.includes(c.pair)) return { s, event: 'ignored' };
  const open = [...s.open, i];
  if (open.length === 1) return { s: { ...s, open }, event: 'first' };
  const moves = s.moves + 1;
  const a = s.cards[open[0]];
  if (a.pair === c.pair) return { s: { ...s, open: [], matched: [...s.matched, c.pair], moves }, event: 'match' };
  return { s: { ...s, open, moves }, event: 'miss' };
}
export const memoryHide = (s: MemState): MemState => ({ ...s, open: [] });
export const memoryDone = (s: MemState) => s.cards.length > 0 && s.matched.length * 2 === s.cards.length;
export const isFaceUp = (s: MemState, i: number) => s.open.includes(i) || (!!s.cards[i] && s.matched.includes(s.cards[i].pair));
/** 3 stars for a sharp memory, never fewer than 1. */
export function memoryStars(moves: number, pairs: number): 1 | 2 | 3 {
  if (moves <= Math.ceil(pairs * 1.5)) return 3;
  if (moves <= Math.ceil(pairs * 2.5)) return 2;
  return 1;
}
/** Arrow / Home / End navigation inside a grid of `n` cells with `cols` columns. */
export function gridMove(i: number, key: string, cols: number, n: number): number {
  if (key === 'ArrowRight') return Math.min(n - 1, i + 1);
  if (key === 'ArrowLeft') return Math.max(0, i - 1);
  if (key === 'ArrowDown') return i + cols < n ? i + cols : i;
  if (key === 'ArrowUp') return i - cols >= 0 ? i - cols : i;
  if (key === 'Home') return 0;
  if (key === 'End') return n - 1;
  return i;
}

// =====================================================================================
// Colour Mixing
// =====================================================================================
export type Paint = 'red' | 'yellow' | 'blue' | 'white' | 'black';
export type MixColour = Paint | 'orange' | 'green' | 'purple' | 'pink' | 'lightblue' | 'grey' | 'brown';
const cn = (id: ColourId) => ({ en: COLOUR_NAMES[id].en, te: COLOUR_NAMES[id].te, hex: COLOUR_NAMES[id].hex });
export const MIX_COLOURS: Record<MixColour, L & { hex: string }> = {
  red: cn('red'), yellow: cn('yellow'), blue: cn('blue'), white: cn('white'), black: cn('black'),
  orange: { ...cn('orange'), en: 'Orange' }, green: cn('green'), purple: cn('purple'), pink: cn('pink'), brown: cn('brown'),
  lightblue: { en: 'Light blue', te: 'లేత నీలం', hex: '#8EC3EA' },
  grey: { en: 'Grey', te: 'బూడిద రంగు', hex: '#8F949A' },
};
/** Paints offered at each level (0..2). */
export const MIX_PAINTS: Paint[][] = [['red', 'yellow', 'blue'], ['red', 'yellow', 'blue', 'white'], ['red', 'yellow', 'blue', 'white', 'black']];
/** Colours to make at each level (cumulative). */
export const MIX_TARGETS: MixColour[][] = [['orange', 'green', 'purple'], ['orange', 'green', 'purple', 'pink', 'lightblue'], ['orange', 'green', 'purple', 'pink', 'lightblue', 'grey', 'brown']];
export const RECIPES: { paints: Paint[]; makes: MixColour }[] = [
  { paints: ['red', 'yellow'], makes: 'orange' },
  { paints: ['yellow', 'blue'], makes: 'green' },
  { paints: ['red', 'blue'], makes: 'purple' },
  { paints: ['red', 'white'], makes: 'pink' },
  { paints: ['blue', 'white'], makes: 'lightblue' },
  { paints: ['black', 'white'], makes: 'grey' },
  { paints: ['red', 'yellow', 'blue'], makes: 'brown' },
];
const PAINT_ORDER: Paint[] = ['red', 'yellow', 'blue', 'white', 'black'];
const setKey = (paints: readonly Paint[]) => [...new Set(paints)].sort((a, b) => PAINT_ORDER.indexOf(a) - PAINT_ORDER.indexOf(b)).join('+');
const RECIPE_BY_KEY = new Map(RECIPES.map((rc) => [setKey(rc.paints), rc.makes]));
/** The named colour a set of paints makes (amounts don't matter), or null for an unnamed mix / empty bowl. */
export function mixPaints(paints: readonly Paint[]): MixColour | null {
  const set = [...new Set(paints)];
  if (set.length === 0) return null;
  if (set.length === 1) return set[0];
  return RECIPE_BY_KEY.get(setKey(set)) ?? null;
}
export const recipeFor = (c: MixColour): Paint[] => RECIPES.find((rc) => rc.makes === c)?.paints ?? [c as Paint];
const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Display colour of the bowl: the named colour, or an average of the paints for other mixes. */
export function mixHex(paints: readonly Paint[]): string | null {
  const named = mixPaints(paints);
  if (named) return MIX_COLOURS[named].hex;
  if (!paints.length) return null;
  const sum = paints.map((p) => hexRgb(MIX_COLOURS[p].hex)).reduce((a, b) => a.map((v, i) => v + b[i]), [0, 0, 0]);
  return `#${sum.map((v) => Math.round(v / paints.length).toString(16).padStart(2, '0')).join('')}`;
}
export const MAX_BOWL = 3;
export interface MixRound { target: MixColour; paints: Paint[] }
export function mixRound(r: Rng, level: number, avoid?: MixColour): MixRound {
  const lv = clamp(Math.round(level), 0, 2);
  const targets = MIX_TARGETS[lv].filter((c) => c !== avoid);
  return { target: r.pick(targets), paints: MIX_PAINTS[lv] };
}
export const isMixRight = (target: MixColour, paints: readonly Paint[]) => mixPaints(paints) === target;
/** Multiple-choice version (Daily Surprise): which two paints make `target`? */
export interface MixQuiz { target: MixColour; options: Paint[][]; answer: number }
export function mixQuiz(r: Rng): MixQuiz {
  const target = r.pick(MIX_TARGETS[0]);
  const right = recipeFor(target);
  const wrong = RECIPES.filter((rc) => rc.paints.length === 2 && rc.makes !== target && MIX_TARGETS[0].includes(rc.makes)).map((rc) => rc.paints);
  const options = shuffle(r, [right, ...sample(r, wrong, 2)]);
  return { target, options, answer: options.indexOf(right) };
}

// =====================================================================================
// Rhymes & Songs
// =====================================================================================
export interface Rhyme { id: string; title: L; art: string; bpm: number; source: 'original' | 'traditional'; credit: L; lines: L[] }
export const RHYMES: Rhyme[] = [
  {
    id: 'twinkle', title: L('Twinkle, Twinkle, Little Star', 'మిల మిల చిన్ని చుక్క'), art: 'star', bpm: 84, source: 'traditional',
    credit: L('Traditional (Jane Taylor, 1806)', 'సాంప్రదాయ గేయం (జేన్ టేలర్, 1806)'),
    lines: [
      L('Twinkle, twinkle, little star,', 'మిల మిల మెరిసే చిన్ని చుక్క,'),
      L('How I wonder what you are!', 'నువ్వు ఎవరో చెప్పవే చుక్క!'),
      L('Up above the world so high,', 'ఆకాశంలో ఎంతో ఎత్తున,'),
      L('Like a diamond in the sky.', 'వజ్రంలాగా వెలిగే చుక్క.'),
    ],
  },
  {
    id: 'chandamama', title: L('Chandamama, Come to Me', 'చందమామ రావే'), art: 'moon', bpm: 76, source: 'traditional',
    credit: L('Traditional Telugu lullaby', 'సాంప్రదాయ తెలుగు జోల పాట'),
    lines: [
      L('Moon, moon, come to me, little moon, come to me,', 'చందమామ రావే, జాబిల్లి రావే,'),
      L('Climb over the hill and bring me flowers,', 'కొండెక్కి రావే, గోగుపూలు తేవే,'),
      L('Ride on a cart and bring me marigolds,', 'బండెక్కి రావే, బంతిపూలు తేవే,'),
      L('Moon, moon, come to me, little moon, come to me.', 'చందమామ రావే, జాబిల్లి రావే.'),
    ],
  },
  {
    id: 'rain', title: L('Pitter Patter Rain', 'టప టప వాన'), art: 'rain', bpm: 96, source: 'original',
    credit: L('A WonderLab rhyme', 'వండర్‌ల్యాబ్ పాట'),
    lines: [
      L('Pitter, patter, falls the rain,', 'టప టప టప వాన చినుకులు,'),
      L('On the roof and down the lane.', 'ఇంటి పైన, వీధి లోన.'),
      L('Frogs say croak and ducks say quack,', 'కప్ప బెక బెక, బాతు క్వాక్ క్వాక్,'),
      L('Splash! The puddles splash right back!', 'చిందు చిందు, గుంటల ఆట!'),
    ],
  },
  {
    id: 'vehicles', title: L('Off We Go!', 'పదండి పోదాం!'), art: 'auto', bpm: 104, source: 'original',
    credit: L('A WonderLab rhyme', 'వండర్‌ల్యాబ్ పాట'),
    lines: [
      L('Auto goes put-put down the street,', 'ఆటో టుర్ర్ టుర్ర్ వీధిలోన,'),
      L('Cycle bell goes tring, so sweet.', 'సైకిల్ గంట ట్రింగ్ ట్రింగ్ మోగె,'),
      L('Train goes choo-choo round the hill,', 'రైలు కూ చుక్ కొండ చుట్టూ,'),
      L('Bus says beep, and then stands still.', 'బస్సు పీ పీ, ఆగెను చూడు.'),
    ],
  },
  {
    id: 'mango', title: L('Mango, Mango', 'మామిడి పండు'), art: 'mango', bpm: 92, source: 'original',
    credit: L('A WonderLab rhyme', 'వండర్‌ల్యాబ్ పాట'),
    lines: [
      L('Mango, mango, yellow and sweet,', 'మామిడి పండు, పసుపు పండు,'),
      L('Hanging high for me to eat.', 'చెట్టు మీద తీయని పండు.'),
      L('Parrot sings and monkey too,', 'చిలుక పాడె, కోతి ఆడె,'),
      L('One for me and one for you!', 'నాకొకటి, నీకొకటి!'),
    ],
  },
  {
    id: 'brush', title: L('Brush, Brush', 'బ్రష్ బ్రష్'), art: 'toothbrush', bpm: 100, source: 'original',
    credit: L('A WonderLab rhyme', 'వండర్‌ల్యాబ్ పాట'),
    lines: [
      L('Brush, brush, up and down,', 'బ్రష్ బ్రష్, పైకి కిందకి,'),
      L('Brush, brush, round and round.', 'బ్రష్ బ్రష్, గుండ్రంగా తిప్పి.'),
      L('Rinse with water, swish and spit,', 'నీళ్ళతో పుక్కిలించి ఉమ్మేయి,'),
      L('Shiny teeth, I did it!', 'మెరిసే పళ్ళు, భలే భలే!'),
    ],
  },
];
export const RHYME: Record<string, Rhyme> = Object.fromEntries(RHYMES.map((r) => [r.id, r]));
export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
/** Estimated time (ms) each word takes to say, so the highlight can follow narration. */
export function wordTimings(text: string, rate = 0.9): number[] {
  const r = clamp(rate, 0.5, 1.5);
  return wordsOf(text).map((w) => Math.round((240 + w.replace(/[^\p{L}\p{N}]/gu, '').length * 60 + (/[.,!?]$/.test(w) ? 200 : 0)) / r));
}
/** Which word is being said `elapsed` ms into a line (clamped to the last word). */
export function wordAt(timings: readonly number[], elapsed: number): number {
  if (!timings.length) return -1;
  let t = 0;
  for (let i = 0; i < timings.length; i++) { t += timings[i]; if (elapsed < t) return i; }
  return timings.length - 1;
}
/** Beat times (ms from start) for a clap-along. */
export const beatTimes = (bpm: number, count: number, start = 0): number[] => {
  const gap = 60000 / clamp(bpm, 40, 200);
  return Array.from({ length: Math.max(0, count) }, (_, i) => Math.round(start + i * gap));
};
export const CLAP_WINDOW = [300, 240, 180]; // ms either side of the beat, per level
/** Match taps to beats: each beat counts once, each tap at most one beat (nearest within the window). */
export function judgeClaps(taps: readonly number[], beats: readonly number[], windowMs: number): { hits: boolean[]; count: number; extra: number } {
  const hits = beats.map(() => false);
  let extra = 0;
  for (const t of [...taps].sort((a, b) => a - b)) {
    let best = -1, bestD = Infinity;
    beats.forEach((b, i) => { const d = Math.abs(t - b); if (!hits[i] && d <= windowMs && d < bestD) { best = i; bestD = d; } });
    if (best >= 0) hits[best] = true; else extra++;
  }
  return { hits, count: hits.filter(Boolean).length, extra };
}
/** Index of the beat a single tap lands on (or -1). */
export function beatFor(t: number, beats: readonly number[], windowMs: number): number {
  let best = -1, bestD = Infinity;
  beats.forEach((b, i) => { const d = Math.abs(t - b); if (d <= windowMs && d < bestD) { best = i; bestD = d; } });
  return best;
}

// =====================================================================================
// Opposites & Sizes
// =====================================================================================
export interface OppSide { key: string; word: L; art: string; v?: string; scale?: number }
export interface OppPair { id: string; level: 0 | 1; a: OppSide; b: OppSide }
const side = (pair: string, s: 'a' | 'b', word: L, art: string, extra: Partial<OppSide> = {}): OppSide => ({ key: `${pair}:${s}`, word, art, ...extra });
const pair = (id: string, level: 0 | 1, a: [L, string, Partial<OppSide>?], b: [L, string, Partial<OppSide>?]): OppPair =>
  ({ id, level, a: side(id, 'a', a[0], a[1], a[2]), b: side(id, 'b', b[0], b[1], b[2]) });
export const OPPOSITES: OppPair[] = [
  pair('big-small', 0, [L('big', 'పెద్దది'), 'ball', { scale: 1 }], [L('small', 'చిన్నది'), 'ball', { scale: 0.42 }]),
  pair('full-empty', 0, [L('full', 'నిండుగా ఉన్నది'), 'pot', { v: '4' }], [L('empty', 'ఖాళీగా ఉన్నది'), 'pot', { v: '0' }]),
  pair('hot-cold', 0, [L('hot', 'వేడిది'), 'x-hot'], [L('cold', 'చల్లనిది'), 'x-cold']),
  pair('day-night', 0, [L('day', 'పగలు'), 'x-sky', { v: 'day' }], [L('night', 'రాత్రి'), 'x-sky', { v: 'night' }]),
  pair('happy-sad', 0, [L('happy', 'సంతోషం'), 'x-face', { v: 'happy' }], [L('sad', 'బాధ'), 'x-face', { v: 'sad' }]),
  pair('tall-short', 1, [L('tall', 'పొడవైనది'), 'x-blocks', { v: '5' }], [L('short', 'పొట్టిది'), 'x-blocks', { v: '2' }]),
  pair('long-short', 1, [L('long', 'పొడుగ్గా ఉన్నది'), 'x-pencil', { v: 'long' }], [L('short', 'పొట్టిగా ఉన్నది'), 'x-pencil', { v: 'short' }]),
  pair('open-closed', 1, [L('open', 'తెరిచి ఉన్నది'), 'umbrella'], [L('closed', 'మూసి ఉన్నది'), 'umbrella', { v: 'closed' }]),
  pair('on-off', 1, [L('on', 'వెలుగుతున్నది'), 'diya'], [L('off', 'ఆరిపోయినది'), 'diya', { v: 'off' }]),
  pair('many-few', 1, [L('many', 'ఎక్కువ'), 'x-balls', { v: '7' }], [L('few', 'తక్కువ'), 'x-balls', { v: '2' }]),
];
export const OPP_SIDES: OppSide[] = OPPOSITES.flatMap((p) => [p.a, p.b]);
export const oppSide = (key: string) => OPP_SIDES.find((s) => s.key === key);
export const OPP_LEVELS: L[] = [L('Easy', 'సులువు'), L('More', 'ఇంకా'), L('Opposite of', 'వ్యతిరేకం')];
export type OppRound =
  | { kind: 'pick'; pair: string; ask: OppSide; choices: OppSide[] }
  | { kind: 'opposite'; pair: string; shown: OppSide; ask: OppSide; choices: OppSide[] };
/** level 0: easy pairs, tap the named one; 1: all pairs; 2: "which is the opposite of this?" with 3 pictures. */
export function oppRound(r: Rng, level: number, avoidPair?: string): OppRound {
  const lv = clamp(Math.round(level), 0, 2);
  const pool = OPPOSITES.filter((p) => (lv === 0 ? p.level === 0 : true) && p.id !== avoidPair);
  const p = r.pick(pool);
  const flip = r.next() < 0.5;
  const [x, y] = flip ? [p.b, p.a] : [p.a, p.b];
  if (lv < 2) return { kind: 'pick', pair: p.id, ask: x, choices: shuffle(r, [p.a, p.b]) };
  // distractors: other pictures whose word differs from the answer's word
  const others = OPP_SIDES.filter((s) => !s.key.startsWith(`${p.id}:`) && s.word.en !== y.word.en && s.word.en !== x.word.en);
  return { kind: 'opposite', pair: p.id, shown: x, ask: y, choices: shuffle(r, [y, ...sample(r, others, 2, [], (s) => s.art + (s.v ?? ''))]) };
}
export const oppRight = (round: OppRound, key: string) => round.ask.key === key;

// =====================================================================================
// Patterns
// =====================================================================================
export type PatKind = 'colour' | 'shape' | 'picture';
export const PAT_TOKENS: Record<PatKind, string[]> = {
  colour: ['c-red', 'c-blue', 'c-yellow', 'c-green', 'c-orange', 'c-purple', 'c-pink'],
  shape: (['circle', 'square', 'triangle', 'star', 'heart', 'diamond'] as ShapeId[]).map((s) => `shape-${s}`),
  picture: ['apple', 'banana', 'mango', 'cat', 'dog', 'cow', 'bus', 'car', 'sun', 'moon', 'star', 'flower', 'ball', 'tree'],
};
export const PAT_UNITS: string[][] = [['AB'], ['AAB', 'ABB', 'ABC'], ['AABB', 'ABC', 'AAB', 'ABB']];
export const PAT_LEVELS: L[] = [L('Easy', 'సులువు'), L('Medium', 'మధ్యస్థం'), L('Tricky', 'కష్టం')];
export interface PatRound { kind: PatKind; level: number; unit: string[]; seq: string[]; blank: number; answer: string; choices: string[] }
/** A repeating sequence with one gap. Levels 0–1: the gap is at the end; level 2 may hide one in the middle. */
export function patRound(r: Rng, kind: PatKind, level: number, n = 3): PatRound {
  const lv = clamp(Math.round(level), 0, 2);
  const form = r.pick(PAT_UNITS[lv]);
  const letters = [...new Set(form.split(''))];
  const tokens = sample(r, PAT_TOKENS[kind], letters.length);
  const unit = form.split('').map((ch) => tokens[letters.indexOf(ch)]);
  const reps = unit.length <= 2 ? 3 : 2;
  const len = unit.length * reps + (lv === 0 ? 0 : r.int(0, 1));
  const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const blank = lv === 2 && r.next() < 0.5 ? r.int(unit.length, len - 2) : len - 1;
  const answer = seq[blank];
  const nn = clamp(n, 2, 4);
  let choices = [answer, ...tokens.filter((t) => t !== answer)].slice(0, nn);
  if (choices.length < nn) choices = [...choices, ...sample(r, PAT_TOKENS[kind], nn - choices.length, choices)];
  return { kind, level: lv, unit, seq, blank, answer, choices: shuffle(r, choices) };
}
export const patRight = (round: PatRound, token: string) => round.answer === token;
/** Spoken / written name of a pattern token (colour blob, shape or picture). */
export function tokenName(token: string): L {
  if (token.startsWith('c-')) { const c = COLOUR_NAMES[token.slice(2) as ColourId]; return c ? L(c.en, c.te) : L(token, token); }
  if (token.startsWith('shape-')) { const s = SHAPE[token.slice(6) as ShapeId]; return s ? s.name : L(token, token); }
  return nameOfPic(token);
}

// =====================================================================================
// Sound Safari
// =====================================================================================
export type SafariGroup = 'animal' | 'vehicle' | 'nature';
export interface SafariSource { id: string; sfx: string; art: string; name: L; group: SafariGroup; /** sounds that are easy to confuse share a key */ clash?: string; /** written clue when sound is off */ clue?: L }
/** Written clues for pictures whose data has no sound word. */
const EXTRA_CLUES: Record<string, L> = { parrot: L('Squawk, squawk!', 'కీ కీ!'), car: L('Vroom, vroom!', 'బుర్ర్ బుర్ర్!'), boat: L('Toot, toot!', 'టూట్ టూట్!'), tractor: L('Chug, chug, chug!', 'డగ డగ డగ!') };
const pic = (id: string, sfxName: string, group: SafariGroup, clash?: string): SafariSource => ({ id, sfx: sfxName, art: id, name: nameOfPic(id), group, clash, clue: PIC[id]?.sound ?? EXTRA_CLUES[id] });
export const SAFARI: SafariSource[] = [
  pic('cow', 'cow', 'animal'), pic('cat', 'cat', 'animal'), pic('dog', 'dog', 'animal'), pic('sheep', 'sheep', 'animal', 'baa'), pic('goat', 'goat', 'animal', 'baa'),
  pic('horse', 'horse', 'animal'), pic('elephant', 'elephant', 'animal'), pic('lion', 'lion', 'animal'), pic('monkey', 'monkey', 'animal'), pic('frog', 'frog', 'animal'),
  pic('crow', 'crow', 'animal'), pic('parrot', 'parrot', 'animal'), pic('peacock', 'peacock', 'animal'), pic('hen', 'hen', 'animal'), pic('duck', 'duck', 'animal'),
  pic('owl', 'owl', 'animal'), pic('sparrow', 'bird', 'animal', 'chirp'),
  pic('bus', 'bus', 'vehicle', 'engine'), pic('car', 'car', 'vehicle', 'engine'), pic('auto', 'auto', 'vehicle'), pic('bicycle', 'bicycle', 'vehicle'),
  pic('train', 'train', 'vehicle'), pic('aeroplane', 'aeroplane', 'vehicle'), pic('boat', 'boat', 'vehicle'), pic('tractor', 'tractor', 'vehicle'),
  { id: 'n-rain', sfx: 'rain', art: 'rain', name: L('Rain', 'వాన'), group: 'nature', clash: 'water', clue: L('Pitter-patter!', 'టప టప!') },
  { id: 'n-thunder', sfx: 'thunder', art: 'x-thunder', name: L('Thunder', 'ఉరుము'), group: 'nature', clue: L('Boom! Rumble!', 'ఢాం! గుడగుడ!') },
  { id: 'n-wind', sfx: 'wind', art: 'x-wind', name: L('Wind', 'గాలి'), group: 'nature', clue: L('Whoooosh!', 'హూయ్!') },
  { id: 'n-stream', sfx: 'stream', art: 'x-stream', name: L('Stream', 'సెలయేరు'), group: 'nature', clash: 'water', clue: L('Babble, gurgle!', 'గల గల!') },
  { id: 'n-sea', sfx: 'sea', art: 'x-sea', name: L('Sea waves', 'సముద్రపు అలలు'), group: 'nature', clue: L('Swoosh… swoosh…', 'హోరు… హోరు…') },
  { id: 'n-fire', sfx: 'fire', art: 'x-fire', name: L('Campfire', 'చలిమంట'), group: 'nature', clue: L('Crackle, pop!', 'చిటపట!') },
  { id: 'n-birds', sfx: 'birds', art: 'x-birds', name: L('Birds singing', 'పక్షుల కిలకిలలు'), group: 'nature', clash: 'chirp', clue: L('Tweet, tweet!', 'కిల కిల!') },
  { id: 'n-crickets', sfx: 'crickets', art: 'x-cricket', name: L('Crickets', 'కీచురాళ్ళు'), group: 'nature', clue: L('Cree-cree-cree!', 'కీచ్ కీచ్!') },
  { id: 'n-splash', sfx: 'splash', art: 'x-splash', name: L('Splash', 'నీళ్ళ చప్పుడు'), group: 'nature', clue: L('Splash!', 'చుబుక్!') },
];
export const SAFARI_BY_ID: Record<string, SafariSource> = Object.fromEntries(SAFARI.map((s) => [s.id, s]));
export const SAFARI_GROUPS: { id: SafariGroup | 'mix'; title: L; cover: string }[] = [
  { id: 'animal', title: L('Animals & birds', 'జంతువులు, పక్షులు'), cover: 'lion' },
  { id: 'vehicle', title: L('Vehicles', 'వాహనాలు'), cover: 'train' },
  { id: 'nature', title: L('Nature', 'ప్రకృతి'), cover: 'x-thunder' },
  { id: 'mix', title: L('Everything', 'అన్నీ'), cover: 'x-birds' },
];
/** Only sources whose sound exists in this build (the sound library may still be growing). */
export const availableSafari = (sfxNames: readonly string[]) => { const have = new Set(sfxNames); return SAFARI.filter((s) => have.has(s.sfx)); };
const clashKey = (s: SafariSource) => s.clash ?? s.sfx;
export interface SafariRound { group: SafariGroup | 'mix'; target: string; choices: string[] }
/** One sound to identify + (n-1) pictures that make clearly different sounds. */
export function safariRound(r: Rng, group: SafariGroup | 'mix', n: number, available: readonly SafariSource[], avoid?: string): SafariRound | null {
  const pool = available.filter((s) => group === 'mix' || s.group === group);
  if (pool.length < 2) return null;
  const nn = clamp(n, 2, 4);
  const target = r.pick(pool.length > 2 && avoid ? pool.filter((s) => s.id !== avoid) : pool);
  const others = sample(r, pool, nn - 1, [target], clashKey);
  return { group, target: target.id, choices: shuffle(r, [target, ...others]).map((s) => s.id) };
}
export const safariRight = (round: SafariRound, id: string) => round.target === id;

// =====================================================================================
// Daily Surprise + Sticker Book
// =====================================================================================
/** Local calendar day, e.g. 2026-11-09. */
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function prevDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}
/** FNV-1a — stable seed from a string. */
export function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

export type DailyStep =
  | { kind: 'pattern'; round: PatRound }
  | { kind: 'opposite'; round: OppRound }
  | { kind: 'mix'; quiz: MixQuiz }
  | { kind: 'safari'; round: SafariRound };
export const DAILY_STEPS = 4;
/** Today's short challenge: the same for everyone on the same day, a different mix of games each day. */
export function dailyChallenge(key: string, available: readonly SafariSource[]): DailyStep[] {
  const r = rng(hashStr(`daily:${key}`));
  const kinds: DailyStep['kind'][] = shuffle(r, ['pattern', 'opposite', 'mix', 'safari']);
  return kinds.map((k): DailyStep => {
    if (k === 'pattern') return { kind: 'pattern', round: patRound(r, r.pick<PatKind>(['colour', 'shape', 'picture']), r.int(0, 1), 3) };
    if (k === 'opposite') return { kind: 'opposite', round: oppRound(r, r.int(0, 1)) };
    if (k === 'mix') return { kind: 'mix', quiz: mixQuiz(r) };
    const sr = safariRound(r, r.pick<SafariGroup>(['animal', 'vehicle']), 3, available);
    return sr ? { kind: 'safari', round: sr } : { kind: 'opposite', round: oppRound(r, 1) };
  });
}

export type StickerSource = 'daily' | 'memory' | 'mix' | 'rhymes' | 'opposites' | 'patterns' | 'safari';
export interface Sticker { id: string; art: string; v?: string; name: L; source: StickerSource; bg: string }
const st = (id: string, art: string, en: string, te: string, source: StickerSource, bg: string, v?: string): Sticker => ({ id, art, v, name: L(en, te), source, bg });
export const STICKERS: Sticker[] = [
  st('d-peacock', 'peacock', 'Dancing peacock', 'ఆడే నెమలి', 'daily', '#CDEBD9', 'open'),
  st('d-rainbow', 'rainbow', 'Rainbow', 'ఇంద్రధనుస్సు', 'daily', '#DCE9F8'),
  st('d-sun', 'sun', 'Sunny sun', 'ఎండ సూర్యుడు', 'daily', '#FBE7B5'),
  st('d-moon', 'moon', 'Sleepy moon', 'నిద్ర చందమామ', 'daily', '#D9DDF2'),
  st('d-diya', 'diya', 'Bright lamp', 'వెలిగే దీపం', 'daily', '#F9DDC4'),
  st('d-ladoo', 'ladoo', 'Sweet ladoo', 'తీయని లడ్డు', 'daily', '#FBE3B8'),
  st('d-parrot', 'parrot', 'Talking parrot', 'మాట్లాడే చిలుక', 'daily', '#D5EFCF'),
  st('d-flower', 'flower', 'Flower', 'పువ్వు', 'daily', '#F8D7E3'),
  st('d-train', 'train', 'Choo-choo train', 'కూ చుక్ రైలు', 'daily', '#E3E0F5'),
  st('d-aeroplane', 'aeroplane', 'Aeroplane', 'విమానం', 'daily', '#D3EAF5'),
  st('d-mango', 'mango', 'Mango', 'మామిడి పండు', 'daily', '#FCEBB6'),
  st('d-cat', 'cat', 'Kitty', 'పిల్లి', 'daily', '#EDE4D8'),
  st('d-star', 'star', 'Star', 'నక్షత్రం', 'daily', '#FFF0B8'),
  st('d-boat', 'paperboat', 'Paper boat', 'కాగితం పడవ', 'daily', '#CFE6F2'),
  st('m-dog', 'dog', 'Memory pup', 'జ్ఞాపకాల కుక్కపిల్ల', 'memory', '#F1E1CC'),
  st('m-owl', 'owl', 'Wise owl', 'తెలివైన గుడ్లగూబ', 'memory', '#E6DCCB'),
  st('m-elephant', 'elephant', 'Never forgets', 'మరవని ఏనుగు', 'memory', '#DDE3E8'),
  st('x-orange', 'c-orange', 'Orange splash', 'నారింజ రంగు చిందు', 'mix', '#FCE3CC'),
  st('x-green', 'c-green', 'Green splash', 'ఆకుపచ్చ చిందు', 'mix', '#D7EDD3'),
  st('x-purple', 'c-purple', 'Purple splash', 'ఊదా చిందు', 'mix', '#E5D9EF'),
  st('r-star', 'star', 'Singing star', 'పాడే చుక్క', 'rhymes', '#FFF0B8'),
  st('r-frog', 'frog', 'Rain frog', 'వాన కప్ప', 'rhymes', '#D7EDD3'),
  st('r-toothbrush', 'toothbrush', 'Shiny teeth', 'మెరిసే పళ్ళు', 'rhymes', '#DCEBF5', 'paste'),
  st('o-umbrella', 'umbrella', 'Open umbrella', 'తెరిచిన గొడుగు', 'opposites', '#D6E6F6'),
  st('o-ball', 'ball', 'Big ball', 'పెద్ద బంతి', 'opposites', '#F7D8D4'),
  st('p-heart', 'shape-heart', 'Pattern heart', 'నమూనా హృదయం', 'patterns', '#F8D7E3'),
  st('p-star', 'shape-star', 'Pattern star', 'నమూనా నక్షత్రం', 'patterns', '#FFF0B8'),
  st('s-lion', 'lion', 'Safari lion', 'సఫారీ సింహం', 'safari', '#F6E3B0'),
  st('s-cow', 'cow', 'Moo cow', 'అంబా ఆవు', 'safari', '#EAF2DF'),
  st('s-thunder', 'x-thunder', 'Thunder cloud', 'ఉరుముల మేఘం', 'safari', '#DCE1E8'),
];
export const STICKER: Record<string, Sticker> = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
export const STICKER_SOURCES: Record<StickerSource, L> = {
  daily: L('Daily Surprise', 'రోజూ ఆశ్చర్యం'), memory: L('Memory Match', 'జ్ఞాపకాల ఆట'), mix: L('Colour Mixing', 'రంగులు కలుపుదాం'),
  rhymes: L('Rhymes & Songs', 'పాటలు, గేయాలు'), opposites: L('Opposites', 'వ్యతిరేక పదాలు'), patterns: L('Patterns', 'నమూనాలు'), safari: L('Sound Safari', 'శబ్దాల సఫారీ'),
};
export interface StickerState { earned: Record<string, number>; days: string[] }
export const STICKER_INIT: StickerState = { earned: {}, days: [] };
/** The next sticker to give for `source` (the daily one is picked by date), or null when all are collected. */
export function nextSticker(s: StickerState, source: StickerSource, key?: string): Sticker | null {
  const pool = STICKERS.filter((x) => x.source === source);
  if (!pool.length) return null;
  const start = source === 'daily' && key ? hashStr(`sticker:${key}`) % pool.length : 0;
  for (let i = 0; i < pool.length; i++) {
    const c = pool[(start + i) % pool.length];
    if (!s.earned[c.id]) return c;
  }
  return null;
}
export const earnSticker = (s: StickerState, id: string, at: number): StickerState =>
  (s.earned[id] || !STICKER[id] ? s : { ...s, earned: { ...s.earned, [id]: at } });
export const recordDay = (s: StickerState, key: string): StickerState =>
  (s.days.includes(key) ? s : { ...s, days: [...s.days, key].sort().slice(-400) });
export const doneToday = (s: StickerState, key: string) => s.days.includes(key);
/** Days in a row the daily challenge was done, ending today (or yesterday, so the streak isn't lost before playing). */
export function streak(days: readonly string[], today: string): number {
  const set = new Set(days);
  let k = set.has(today) ? today : prevDay(today);
  let n = 0;
  while (set.has(k)) { n++; k = prevDay(k); }
  return n;
}
export const stickerCount = (s: StickerState) => Object.keys(s.earned).filter((id) => STICKER[id]).length;
