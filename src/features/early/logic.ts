// Pure, seeded round generators and adaptive difficulty for Play & Learn (no React, no DOM).
import { PICTURES, PIC, MOTHER_BABY, COLOUR_NAMES, type PicItem, type PicSet, type Cat, type ColourId, itemsIn } from './data/pictures';

import { rng, newSeed, shuffle, sample, clamp, MIN_CHOICES, MAX_CHOICES, ADAPT0, adapt, clampChoices, type Rng, type Adapt } from './logicCore';
export { rng, newSeed, shuffle, sample, clamp, MIN_CHOICES, MAX_CHOICES, ADAPT0, adapt, clampChoices, type Rng, type Adapt };

// ---------- Picture Fun rounds ----------
export type PicMode = 'find' | 'what' | 'odd' | 'sound';
export interface PicRound { mode: PicMode; target: string; choices: string[]; /** odd mode: the shared category of the others */ base?: Cat }

const nameKey = (p: PicItem) => p.en.toLowerCase();
/** Find the ___: target + (n-1) distractors from the same set (fall back to all pictures). */
export function findRound(r: Rng, pool: PicItem[], n: number, avoidTarget?: string): PicRound {
  n = clamp(n, MIN_CHOICES, MAX_CHOICES);
  const candidates = pool.length > 1 && avoidTarget ? pool.filter((p) => p.id !== avoidTarget) : pool;
  const target = r.pick(candidates);
  let distract = sample(r, pool, n - 1, [target], nameKey);
  if (distract.length < n - 1) distract = [...distract, ...sample(r, PICTURES, n - 1 - distract.length, [target, ...distract], nameKey)];
  return { mode: 'find', target: target.id, choices: shuffle(r, [target, ...distract]).map((p) => p.id) };
}
/** What is this?: one picture, 2–3 spoken word choices. */
export function whatRound(r: Rng, pool: PicItem[], n: number, avoidTarget?: string): PicRound {
  const round = findRound(r, pool, clamp(n, MIN_CHOICES, 3), avoidTarget);
  return { ...round, mode: 'what' };
}
/** Odd one out — 3 or 4 pictures: all but one share a category. */
export const ODD_CATS: Cat[] = ['fruit', 'vegetable', 'animal', 'bird', 'vehicle', 'body', 'home', 'nature'];
export function oddRound(r: Rng, n: number): PicRound {
  n = clamp(n + 1, 3, MAX_CHOICES); // 2 → 3 pictures, 3+ → 4 pictures
  const base = r.pick(ODD_CATS);
  // keep the odd one clearly different: avoid fruit/vegetable and animal/bird pairings
  const near: Partial<Record<Cat, Cat>> = { fruit: 'vegetable', vegetable: 'fruit', animal: 'bird', bird: 'animal' };
  const oddCats = ODD_CATS.filter((c) => c !== base && c !== near[base]);
  const same = sample(r, PICTURES.filter((p) => p.cat === base), n - 1, [], nameKey);
  const odd = r.pick(PICTURES.filter((p) => oddCats.includes(p.cat) && !same.some((s) => nameKey(s) === nameKey(p))));
  return { mode: 'odd', target: odd.id, base, choices: shuffle(r, [...same, odd]).map((p) => p.id) };
}
/** Who says ___? — only pictures with a sound; all choices make different sounds. */
export const SOUND_ITEMS = PICTURES.filter((p) => p.sound);
export function soundRound(r: Rng, n: number, avoidTarget?: string): PicRound {
  n = clamp(n, MIN_CHOICES, MAX_CHOICES);
  const pool = SOUND_ITEMS.filter((p) => p.cat === 'animal' || p.cat === 'bird' || p.cat === 'vehicle');
  const target = r.pick(pool.filter((p) => p.id !== avoidTarget));
  const others = sample(r, pool, n - 1, [target], (p) => p.sound!.en);
  return { mode: 'sound', target: target.id, choices: shuffle(r, [target, ...others]).map((p) => p.id) };
}
export function picRound(r: Rng, mode: PicMode, set: PicSet | null, n: number, avoidTarget?: string): PicRound {
  const pool = set ? itemsIn(set) : PICTURES;
  if (mode === 'find') return findRound(r, pool, n, avoidTarget);
  if (mode === 'what') return whatRound(r, pool, n, avoidTarget);
  if (mode === 'odd') return oddRound(r, n);
  return soundRound(r, n, avoidTarget);
}
export const isCorrectPic = (round: PicRound, id: string) => round.target === id;

// ---------- Sort & Match ----------
export type SortKind = 'colour' | 'size' | 'category';
export interface SortItem { key: string; art: string; basket: string; big?: boolean }
export interface SortBasket { id: string; label: { en: string; te: string }; art?: string; colour?: ColourId }
export interface SortRound { kind: SortKind; baskets: SortBasket[]; items: SortItem[] }

const CAT_PAIRS: [Cat, Cat][] = [['fruit', 'animal'], ['vehicle', 'animal'], ['fruit', 'vehicle'], ['bird', 'fruit'], ['fruit', 'vegetable'], ['animal', 'bird']];
const COLOUR_POOL: ColourId[] = ['red', 'yellow', 'green', 'orange', 'purple', 'brown'];
/** level 0..2: number of items 4 / 5 / 6; category pairs get closer at higher levels. */
export function sortRound(r: Rng, kind: SortKind, level: number): SortRound {
  const count = 4 + clamp(level, 0, 2);
  const real = PICTURES.filter((p) => p.cat !== 'colour' && p.cat !== 'people');
  if (kind === 'colour') {
    const [a, b] = sample(r, COLOUR_POOL.filter((c) => real.filter((p) => p.colour === c).length >= 3), 2);
    const half = Math.ceil(count / 2);
    const ia = sample(r, real.filter((p) => p.colour === a), half);
    const ib = sample(r, real.filter((p) => p.colour === b), count - ia.length);
    const items = shuffle(r, [...ia.map((p) => ({ key: p.id, art: p.id, basket: a })), ...ib.map((p) => ({ key: p.id, art: p.id, basket: b }))]);
    return { kind, baskets: [a, b].map((c) => ({ id: c, label: { en: COLOUR_NAMES[c].en, te: COLOUR_NAMES[c].te }, colour: c })), items };
  }
  if (kind === 'size') {
    const pics = sample(r, real, count, [], nameKey);
    // guarantee at least one of each
    const items = pics.map((p, i) => ({ key: `${p.id}-${i}`, art: p.id, big: i === 0 ? true : i === 1 ? false : r.next() < 0.5 }))
      .map((x) => ({ ...x, basket: x.big ? 'big' : 'small' }));
    return { kind, baskets: [{ id: 'big', label: { en: 'Big', te: 'పెద్దది' }, art: 'box' }, { id: 'small', label: { en: 'Small', te: 'చిన్నది' }, art: 'box' }], items: shuffle(r, items) };
  }
  const pairs = level >= 2 ? CAT_PAIRS : CAT_PAIRS.slice(0, 4);
  const [a, b] = r.pick(pairs);
  const half = Math.ceil(count / 2);
  const ia = sample(r, real.filter((p) => p.cat === a), half, [], nameKey);
  const ib = sample(r, real.filter((p) => p.cat === b), count - half, ia, nameKey);
  const coverOf = (c: Cat) => ({ fruit: 'mango', vegetable: 'carrot', animal: 'cow', bird: 'parrot', vehicle: 'bus' } as Partial<Record<Cat, string>>)[c];
  const label = (c: Cat) => ({ fruit: { en: 'Fruits', te: 'పండ్లు' }, vegetable: { en: 'Vegetables', te: 'కూరగాయలు' }, animal: { en: 'Animals', te: 'జంతువులు' }, bird: { en: 'Birds', te: 'పక్షులు' }, vehicle: { en: 'Vehicles', te: 'వాహనాలు' } } as Record<string, { en: string; te: string }>)[c];
  return {
    kind,
    baskets: [a, b].map((c) => ({ id: c, label: label(c), art: coverOf(c) })),
    items: shuffle(r, [...ia.map((p) => ({ key: p.id, art: p.id, basket: a })), ...ib.map((p) => ({ key: p.id, art: p.id, basket: b }))]),
  };
}
export const sortCorrect = (round: SortRound, itemKey: string, basketId: string) => round.items.find((i) => i.key === itemKey)?.basket === basketId;

export type MatchKind = 'baby' | 'shadow';
export interface MatchCard { key: string; art: string; label: { en: string; te: string }; shadow?: boolean; small?: boolean }
export interface MatchRound { kind: MatchKind; left: MatchCard[]; right: MatchCard[]; /** left key → right key */ pairs: Record<string, string> }
/** n pairs (2..4), left and right in different random orders. */
export function matchRound(r: Rng, kind: MatchKind, n: number): MatchRound {
  n = clamp(n, 2, 4);
  if (kind === 'baby') {
    const chosen = sample(r, MOTHER_BABY, n, [], (p) => p.mother);
    const left = chosen.map((p) => ({ key: p.mother, art: p.mother, label: { en: PIC[p.mother].en, te: PIC[p.mother].te } }));
    const right = chosen.map((p) => ({ key: p.baby.id, art: p.baby.id === 'chick' ? 'chick' : p.mother, label: { en: p.baby.en, te: p.baby.te }, small: true }));
    return { kind, left: shuffle(r, left), right: shuffle(r, right), pairs: Object.fromEntries(chosen.map((p) => [p.mother, p.baby.id])) };
  }
  const pool = PICTURES.filter((p) => ['fruit', 'animal', 'vehicle', 'home', 'bird', 'nature'].includes(p.cat) && p.id !== 'rain' && p.id !== 'rainbow');
  // shadows must look different from each other: pick from different categories when possible
  let chosen = sample(r, pool, n, [], (p) => p.cat);
  if (chosen.length < n) chosen = sample(r, pool, n, [], nameKey);
  const left = chosen.map((p) => ({ key: p.id, art: p.id, label: { en: p.en, te: p.te } }));
  const right = chosen.map((p) => ({ key: `${p.id}~s`, art: p.id, label: { en: `${p.en} shadow`, te: `${p.te} నీడ` }, shadow: true }));
  return { kind, left: shuffle(r, left), right: shuffle(r, right), pairs: Object.fromEntries(chosen.map((p) => [p.id, `${p.id}~s`])) };
}
