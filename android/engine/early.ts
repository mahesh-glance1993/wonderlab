// Engine functions for Play & Learn (called from Kotlin as "early.<name>").
// The data, round generators and rules are the website's own TypeScript (src/features/early/**), so the
// native app teaches exactly what the website teaches. The website's original SVG drawings (art.tsx,
// activityArt.tsx, buildArt.tsx) are evaluated here with a tiny element factory and returned as a JSON
// node tree that the app draws natively (feature/early/Svg.kt) — no WebView, same pictures.
import { PICTURES, PIC, PIC_SETS, CAT_NAMES, COLOUR_NAMES, MOTHER_BABY, type PicSet } from '../../src/features/early/data/pictures';
import { SHAPES, SHAPE_SCENES, BUILDS, buildChoices as buildChoicesFn, patternRound as patternRoundFn, type ShapeId } from '../../src/features/early/data/shapes';
import { picRound as picRoundFn, sortRound as sortRoundFn, matchRound as matchRoundFn, type PicMode, type SortKind, type MatchKind } from '../../src/features/early/logic';
import { rng, adapt as adaptFn, ADAPT0, type Adapt } from '../../src/features/early/logicCore';
import {
  MEMORY_SIZES, MEMORY_SIZE_IDS, MEMORY_THEMES, memoryDeck as memoryDeckFn, memoryStars as memoryStarsFn, type MemorySize, type MemoryTheme,
  MIX_COLOURS, MIX_PAINTS, MIX_TARGETS, RECIPES, MAX_BOWL, mixPaints as mixPaintsFn, mixHex as mixHexFn, mixRound as mixRoundFn, recipeFor as recipeForFn, isMixRight as isMixRightFn, type Paint, type MixColour,
  RHYMES, CLAP_WINDOW, wordTimings as wordTimingsFn, wordsOf as wordsOfFn, judgeClaps as judgeClapsFn, beatFor as beatForFn, beatTimes as beatTimesFn,
  OPPOSITES, OPP_LEVELS, oppRound as oppRoundFn,
  PAT_LEVELS, PAT_TOKENS, patRound as patRoundFn, tokenName as tokenNameFn, type PatKind,
  SAFARI, SAFARI_GROUPS, availableSafari, safariRound as safariRoundFn, type SafariGroup,
  DAILY_STEPS, dailyChallenge as dailyChallengeFn, STICKERS, STICKER_SOURCES, STICKER_INIT, nextSticker as nextStickerFn, earnSticker as earnStickerFn,
  recordDay as recordDayFn, doneToday as doneTodayFn, streak as streakFn, stickerCount as stickerCountFn, prevDay as prevDayFn, type StickerSource, type StickerState,
} from '../../src/features/early/activities';
import {
  MODELS, MODEL, LEVEL_NAMES, PART_NAMES, PALETTE, FREE_BODIES, FREE_WHEELS, FREE_INIT, BUILD_INIT, ALIVE_MS, SNAP, MAGNET,
  levelParts as levelPartsFn, prebuilt as prebuiltFn, startOrient as startOrientFn, canTurn as canTurnFn, canFlip as canFlipFn, dropPart as dropPartFn,
  tapPlace as tapPlaceFn, magnet as magnetFn, placeSfx as placeSfxFn, partName as partNameFn, recordBuild as recordBuildFn, badgesFor as badgesForFn,
  type Level, type Orient, type BuildState, type FreeDesign,
} from '../../src/features/early/data/builds';
import { STORIES, PROP_NAMES } from '../../src/features/early/data/stories';
import { MOTION, AUTO_TURN_MS } from '../../src/features/early/data/motion';
import { ART, Backdrop, BLINK } from '../../src/features/early/art';
import { ACT_ART_IDS, hasActArt } from '../../src/features/early/activityArt';
import { drawShape, Scenery, FreeVehicle, roleOf } from '../../src/features/early/buildArt';

// ---------------------------------------------------------------------------------------------
// Element factory for the website's JSX drawings (esbuild compiles them to React.createElement).
// ---------------------------------------------------------------------------------------------
interface El { type: unknown; props: Record<string, unknown> }
interface SvgNode { t: string; a?: Record<string, unknown>; c?: SvgNode[] }
const FRAGMENT = Symbol('fragment');
(globalThis as unknown as { React: unknown }).React = {
  createElement: (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): El =>
    ({ type, props: { ...(props || {}), children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children } }),
  Fragment: FRAGMENT,
};

function ser(el: unknown): SvgNode[] {
  if (el === null || el === undefined || el === false || el === true) return [];
  if (Array.isArray(el)) return el.flatMap(ser);
  if (typeof el === 'string' || typeof el === 'number') return [{ t: '#text', a: { v: String(el) } }];
  const { type, props } = el as El;
  if (typeof type === 'function') return ser((type as (p: unknown) => unknown)(props));
  const { children, key: _k, className, style, ...rest } = (props || {}) as Record<string, unknown>;
  const kids = ser(children);
  if (typeof type !== 'string') return kids; // fragment
  const a: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) if (v !== undefined && v !== null && typeof v !== 'function' && !k.startsWith('aria')) a[k] = v;
  if (className) a.class = className;
  const s = style as { transform?: string; opacity?: number } | undefined;
  if (s?.transform) a.css = s.transform;
  if (s && s.opacity !== undefined) a.cssOpacity = s.opacity;
  const node: SvgNode = { t: type, a };
  if (kids.length) node.c = kids;
  return [node];
}

type Draw = (v?: string) => unknown;
/** A picture / prop / activity drawing in the -50..50 box (null when the website has no drawing for it). */
export function svgArt(id: string, v?: string | null): SvgNode[] | null {
  const vv = v ?? undefined;
  if (hasActArt(id)) {
    // activityArt's drawings are not exported individually; render through the X table via ActArt's inner svg
    const tree = ser(actArtEl(id, vv));
    return tree;
  }
  const d = (ART as Record<string, Draw>)[id];
  return d ? ser(d(vv)) : null;
}
// activityArt.tsx keeps its table private; ActArt(id) returns <svg>{X[id](v)}</svg> for x- ids.
import { ActArt } from '../../src/features/early/activityArt';
function actArtEl(id: string, v?: string): unknown {
  const svg = (ActArt as unknown as (p: Record<string, unknown>) => El)({ id, v });
  return (svg.props as { children?: unknown }).children;
}
/** Many drawings at once: { "<id>|<v>": nodes }. */
export function svgArts(keys: string[]): Record<string, SvgNode[] | null> {
  const out: Record<string, SvgNode[] | null> = {};
  for (const k of keys || []) { const [id, v] = k.split('|'); out[k] = svgArt(id, v || null); }
  return out;
}
/** Story background on the 400×260 stage. */
export const svgBackdrop = (bg: string) => ser((Backdrop as unknown as (p: unknown) => unknown)({ bg }));
/** A Build It part drawn centred on 0,0 at its own size. */
export const svgPart = (kind: string, w: number, h: number, c: string) => ser(drawShape({ kind, w, h, c } as Parameters<typeof drawShape>[0]));
/** Build It scenery on the 400×260 board. */
export const svgScenery = (scene: string) => ser((Scenery as unknown as (p: unknown) => unknown)({ scene }));
/** A free-build vehicle (wheels are groups with data-role="wheel"). */
export const svgFreeVehicle = (d: FreeDesign) => ser((FreeVehicle as unknown as (p: unknown) => unknown)({ d: d || FREE_INIT }));

// ---------------------------------------------------------------------------------------------
// Static content (one call at start-up; the app caches it).
// ---------------------------------------------------------------------------------------------
export function bundle() {
  return {
    pictures: PICTURES,
    sets: PIC_SETS,
    catNames: CAT_NAMES,
    colourNames: COLOUR_NAMES,
    motherBaby: MOTHER_BABY,
    shapes: SHAPES,
    shapeScenes: SHAPE_SCENES,
    shapeBuilds: BUILDS,
    memorySizes: MEMORY_SIZE_IDS.map((id) => ({ id, ...MEMORY_SIZES[id] })),
    memoryThemes: MEMORY_THEMES,
    mixColours: MIX_COLOURS,
    mixPaints: MIX_PAINTS,
    mixTargets: MIX_TARGETS,
    recipes: RECIPES,
    maxBowl: MAX_BOWL,
    rhymes: RHYMES,
    clapWindow: CLAP_WINDOW,
    opposites: OPPOSITES,
    oppLevels: OPP_LEVELS,
    patLevels: PAT_LEVELS,
    patTokens: PAT_TOKENS,
    safari: SAFARI,
    safariGroups: SAFARI_GROUPS,
    dailySteps: DAILY_STEPS,
    stickers: STICKERS,
    stickerSources: STICKER_SOURCES,
    stickerInit: STICKER_INIT,
    models: MODELS.map((m) => ({ ...m, parts: m.parts.map((p) => ({ ...p, role: roleOf(p) ?? null })) })),
    levelNames: LEVEL_NAMES,
    partNames: PART_NAMES,
    palette: PALETTE,
    freeBodies: FREE_BODIES,
    freeWheels: FREE_WHEELS,
    freeInit: FREE_INIT,
    buildInit: BUILD_INIT,
    aliveMs: ALIVE_MS,
    snap: SNAP,
    magnet: MAGNET,
    stories: STORIES,
    motion: MOTION,
    autoTurnMs: AUTO_TURN_MS,
    propNames: PROP_NAMES,
    blink: BLINK,
    actArtIds: ACT_ART_IDS,
    artIds: Object.keys(ART),
  };
}

// ---------------------------------------------------------------------------------------------
// Round generators and rules (seeded: same seed → same round as the website).
// ---------------------------------------------------------------------------------------------
export const adapt = (a: Adapt | null, correct: boolean, firstTry?: boolean, max?: number) => adaptFn(a ?? ADAPT0, correct, firstTry ?? correct, max);
export function picRound(seed: number, mode: PicMode, setId: string | null, n: number, avoid?: string | null) {
  const set: PicSet | null = setId ? PIC_SETS.find((s) => s.id === setId) ?? null : null;
  return picRoundFn(rng(seed), mode, set, n, avoid ?? undefined);
}
export const sortRound = (seed: number, kind: SortKind, level: number) => sortRoundFn(rng(seed), kind, level);
export const matchRound = (seed: number, kind: MatchKind, n: number) => matchRoundFn(rng(seed), kind, n);
export const buildChoices = (seed: number, needed: ShapeId, n: number) => buildChoicesFn(rng(seed), needed, n);
export const patternRound = (seed: number, level: number, n: number) => patternRoundFn(rng(seed), level, n);

export const memoryDeck = (seed: number, size: MemorySize, theme: MemoryTheme) => memoryDeckFn(rng(seed), size, theme);
export const memoryStars = (moves: number, pairs: number) => memoryStarsFn(moves, pairs);

export const mixPaints = (paints: Paint[]) => mixPaintsFn(paints || []);
export const mixHex = (paints: Paint[]) => mixHexFn(paints || []);
export const mixRound = (seed: number, level: number, avoid?: MixColour | null) => mixRoundFn(rng(seed), level, avoid ?? undefined);
export const recipeFor = (c: MixColour) => recipeForFn(c);
export const isMixRight = (target: MixColour, paints: Paint[]) => isMixRightFn(target, paints || []);

export const wordsOf = (text: string) => wordsOfFn(text);
export const wordTimings = (text: string, rate?: number) => wordTimingsFn(text, rate);
export const judgeClaps = (taps: number[], beats: number[], windowMs: number) => judgeClapsFn(taps, beats, windowMs);
export const beatFor = (t: number, beats: number[], windowMs: number) => beatForFn(t, beats, windowMs);
export const beatTimes = (bpm: number, count: number, start?: number) => beatTimesFn(bpm, count, start);

export const oppRound = (seed: number, level: number, avoidPair?: string | null) => oppRoundFn(rng(seed), level, avoidPair ?? undefined);
export const patRound = (seed: number, kind: PatKind, level: number, n?: number) => patRoundFn(rng(seed), kind, level, n);
export const tokenName = (token: string) => tokenNameFn(token);

/** `sfxNames`: sounds the app can play (all of the website's library is synthesised natively). */
const avail = (sfxNames?: string[] | null) => (sfxNames && sfxNames.length ? availableSafari(sfxNames) : SAFARI);
export const safariRound = (seed: number, group: SafariGroup | 'mix', n: number, sfxNames?: string[] | null, avoid?: string | null) =>
  safariRoundFn(rng(seed), group, n, avail(sfxNames), avoid ?? undefined);
export const safariAvailable = (sfxNames?: string[] | null) => avail(sfxNames).map((s) => s.id);

export const dailyChallenge = (key: string, sfxNames?: string[] | null) => dailyChallengeFn(key, avail(sfxNames));
export const nextSticker = (s: StickerState | null, source: StickerSource, key?: string | null) => nextStickerFn(s ?? STICKER_INIT, source, key ?? undefined);
export const earnSticker = (s: StickerState | null, id: string, at: number) => earnStickerFn(s ?? STICKER_INIT, id, at);
export const recordDay = (s: StickerState | null, key: string) => recordDayFn(s ?? STICKER_INIT, key);
export const doneToday = (s: StickerState | null, key: string) => doneTodayFn(s ?? STICKER_INIT, key);
export const streak = (days: string[], today: string) => streakFn(days || [], today);
export const stickerCount = (s: StickerState | null) => stickerCountFn(s ?? STICKER_INIT);
export const prevDay = (key: string) => prevDayFn(key);
/** The Sticker Book save after earning the next sticker for `source` (what useStickers().give does on the web). */
export function giveSticker(s: StickerState | null, source: StickerSource, key: string, at: number, day: boolean) {
  const cur: StickerState = { ...STICKER_INIT, ...(s || {}) };
  const st = nextStickerFn(cur, source, key);
  let n = st ? earnStickerFn(cur, st.id, at) : cur;
  if (day) n = recordDayFn(n, key);
  return { sticker: st, state: n, count: stickerCountFn(n) };
}

// ---------------- Build It ----------------
const model = (id: string) => MODEL[id];
const part = (modelId: string, partId: string) => MODEL[modelId]?.parts.find((p) => p.id === partId);
export const levelParts = (modelId: string, level: Level) => (model(modelId) ? levelPartsFn(model(modelId), level).map((p) => p.id) : []);
export const prebuilt = (modelId: string, level: Level) => (model(modelId) ? prebuiltFn(model(modelId), level).map((p) => p.id) : []);
export function startOrients(modelId: string, level: Level) {
  const m = model(modelId);
  if (!m) return {};
  return Object.fromEntries(levelPartsFn(m, level).map((p) => [p.id, { o: startOrientFn(p, level), turn: canTurnFn(p, level), flip: canFlipFn(p, level) }]));
}
export function dropPart(modelId: string, level: Level, filled: Record<string, string>, partId: string, o: Orient, x: number, y: number) {
  const m = model(modelId), p = part(modelId, partId);
  return m && p ? dropPartFn(m, level, filled || {}, p, o, x, y) : null;
}
export function tapPlace(modelId: string, level: Level, filled: Record<string, string>, partId: string, o: Orient, slotId: string) {
  const m = model(modelId), p = part(modelId, partId);
  return m && p ? tapPlaceFn(m, level, filled || {}, p, o, slotId) : null;
}
export function magnet(modelId: string, level: Level, filled: Record<string, string>, partId: string, x: number, y: number) {
  const m = model(modelId), p = part(modelId, partId);
  return m && p ? magnetFn(m, level, filled || {}, p, x, y) : { x, y };
}
export const placeSfx = (modelId: string, partId: string) => { const p = part(modelId, partId); return p ? placeSfxFn(p) : 'snap'; };
export const partName = (modelId: string, partId: string) => { const p = part(modelId, partId); return p ? partNameFn(p) : null; };
export const recordBuild = (s: BuildState | null, modelId: string, level: Level) => recordBuildFn({ ...BUILD_INIT, ...(s || {}) }, modelId, level);
export const badgesFor = (s: BuildState | null) => badgesForFn({ ...BUILD_INIT, ...(s || {}) });

/** Names for a list of picture ids (Picture Fun items / story props). */
export function names(ids: string[]) {
  return Object.fromEntries((ids || []).map((id) => [id, PIC[id] ? { en: PIC[id].en, te: PIC[id].te } : PROP_NAMES[id] ?? null]));
}
