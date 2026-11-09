/*
 * Build It — assemble vehicles and machines from parts (fine-motor practice).
 * Pure data + logic (no DOM) so it can be tested.
 *
 * Every model sits on a 400×260 board. Each part has one slot (its x/y). Parts of the same shape
 * and size are interchangeable (two identical wheels can go in either wheel slot).
 * Levels: 1 = 3–4 big parts (the rest are already built), 2 = 5–7 parts, 3 = 6–10 parts where some
 * must be turned or flipped first (UKG).
 *
 * TELUGU REVIEW NEEDED: model and part names below are first drafts.
 */
import type { SfxName } from '../../../lib/sfx';
import { L } from './pictures';

export type PartKind = 'box' | 'wheel' | 'window' | 'carbody' | 'frame' | 'seat' | 'handle' | 'light' | 'wing' | 'fin' | 'nose' | 'cone' | 'bubble' | 'tail'
  | 'rotor' | 'prop' | 'skid' | 'bullock' | 'yoke' | 'canopy' | 'hull' | 'sail' | 'chimney' | 'track' | 'arm' | 'bucket' | 'tower' | 'blades' | 'gear' | 'flame';
export type Level = 1 | 2 | 3;
export interface Part {
  id: string; kind: PartKind; x: number; y: number; w: number; h: number; c: string; lv: Level;
  /** Fixed tilt of the part in the finished model (degrees). */
  angle?: number;
  /** Drawn mirrored in the finished model. At level 3 it starts un-mirrored and must be flipped. */
  mirror?: boolean;
  /** At level 3 the part starts turned by this much and must be rotated back. */
  turn?: 90 | 180 | 270;
  /** Name key (defaults to kind). */
  n?: string;
}
export type Alive = 'drive' | 'slow' | 'fly' | 'hover' | 'sail' | 'launch' | 'lift' | 'turn';
export interface Model { id: string; name: L; alive: Alive; /** -1 when the model faces left (moves off to the left). */ dir?: 1 | -1; cues: [number, SfxName][]; scene: 'road' | 'sky' | 'water' | 'field' | 'space' | 'room'; parts: Part[] }

export const BOARD = { w: 400, h: 260 };
export const LEVEL_RANGE: Record<Level, [number, number]> = { 1: [3, 4], 2: [5, 7], 3: [6, 10] };
export const LEVEL_NAMES: Record<Level, L> = { 1: L('Big parts', 'పెద్ద భాగాలు'), 2: L('More parts', 'ఇంకా భాగాలు'), 3: L('Turn & flip', 'తిప్పి పెట్టు') };
/** How close (board units) a dropped part must be to snap — generous for little fingers, tighter later. */
export const SNAP: Record<Level, number> = { 1: 70, 2: 50, 3: 36 };
/** Magnet assist while dragging near the right slot (0 = none, 1 = jumps to it). */
export const MAGNET: Record<Level, number> = { 1: 0.5, 2: 0.3, 3: 0.12 };
export const MIN_SLOT_GAP = 24;
export const ALIVE_MS = 4000;

const C = { red: '#D9655B', blue: '#4F86C6', green: '#5E9E62', yellow: '#F2C14E', orange: '#E8862E', purple: '#8E6BB8', wood: '#B5814F', dark: '#3A3530', grey: '#9AA5AE', white: '#F7F4EC', glass: '#BFE3F2', brown: '#7A5134' };
export const PALETTE = [C.red, C.blue, C.green, C.yellow, C.orange, C.purple];
const P = (id: string, kind: PartKind, x: number, y: number, w: number, h: number, c: string, lv: Level, extra: Partial<Part> = {}): Part => ({ id, kind, x, y, w, h, c, lv, ...extra });

export const PART_NAMES: Record<string, L> = {
  box: L('Body', 'బాడీ'), wheel: L('Wheel', 'చక్రం'), window: L('Window', 'కిటికీ'), carbody: L('Car body', 'కారు బాడీ'), frame: L('Frame', 'ఫ్రేమ్'), seat: L('Seat', 'సీటు'),
  handle: L('Handlebar', 'హ్యాండిల్'), light: L('Light', 'లైటు'), wing: L('Wing', 'రెక్క'), fin: L('Fin', 'తోక రెక్క'), nose: L('Nose', 'ముక్కు'), cone: L('Top', 'పై భాగం'),
  bubble: L('Cabin', 'క్యాబిన్'), tail: L('Tail', 'తోక'), rotor: L('Rotor', 'రోటర్'), prop: L('Propeller', 'ప్రొపెల్లర్'), skid: L('Legs', 'కాళ్ళు'), bullock: L('Bullock', 'ఎద్దు'),
  yoke: L('Yoke', 'కాడి'), canopy: L('Roof', 'పైకప్పు'), hull: L('Boat bottom', 'పడవ అడుగు'), sail: L('Sail', 'తెరచాప'), chimney: L('Chimney', 'పొగ గొట్టం'),
  track: L('Tracks', 'పట్టాలు'), arm: L('Arm', 'చేయి'), bucket: L('Bucket', 'బకెట్'), tower: L('Tower', 'గోపురం'), blades: L('Blades', 'రెక్కలు'), gear: L('Gear', 'గేరు'), flame: L('Flame', 'మంట'),
  mast: L('Mast', 'స్తంభం'), door: L('Door', 'తలుపు'), flag: L('Flag', 'జెండా'), bell: L('Bell', 'గంట'), motor: L('Motor', 'మోటారు'), base: L('Base', 'అడుగు'), stripe: L('Stripe', 'పట్టీ'),
  basket: L('Basket', 'బుట్ట'), pedal: L('Pedals', 'పెడల్స్'), weight: L('Weight', 'బరువు'), cab: L('Cab', 'క్యాబ్'), boiler: L('Boiler', 'బాయిలర్'), guard: L('Front guard', 'ముందు కంచె'),
  deck: L('Footboard', 'పాదాల పలక'), exhaust: L('Exhaust pipe', 'పొగ గొట్టం'), lamp: L('Lamp', 'దీపం'), porthole: L('Round window', 'గుండ్రని కిటికీ'),
};
export const partName = (p: Part): L => PART_NAMES[p.n || p.kind] || PART_NAMES[p.kind];

export const MODELS: Model[] = [
  { id: 'car', name: L('Car', 'కారు'), alive: 'drive', scene: 'road', cues: [[0, 'car'], [2200, 'horn']], parts: [
    P('body', 'carbody', 200, 165, 200, 70, C.red, 1), P('w1', 'wheel', 145, 205, 48, 48, C.dark, 1), P('w2', 'wheel', 255, 205, 48, 48, C.dark, 1),
    P('win1', 'window', 175, 145, 40, 22, C.glass, 2), P('win2', 'window', 228, 145, 40, 22, C.glass, 2),
    P('light', 'light', 292, 172, 14, 14, C.yellow, 3), P('exhaust', 'box', 98, 190, 16, 8, C.grey, 3, { n: 'exhaust', turn: 90 })] },
  { id: 'scooter', name: L('Scooter', 'స్కూటర్'), alive: 'drive', scene: 'road', cues: [[0, 'bike']], parts: [
    P('deck', 'box', 200, 197, 120, 16, C.blue, 1, { n: 'deck' }), P('stem', 'arm', 262, 160, 14, 80, C.blue, 1, { n: 'stem', angle: 15 }),
    P('wf', 'wheel', 272, 212, 40, 40, C.dark, 1), P('wb', 'wheel', 148, 212, 40, 40, C.dark, 1),
    P('seat', 'seat', 165, 170, 50, 14, C.dark, 2), P('handle', 'handle', 256, 120, 46, 10, C.dark, 2), P('light', 'light', 276, 140, 12, 12, C.yellow, 3)] },
  { id: 'bicycle', name: L('Bicycle', 'సైకిల్'), alive: 'slow', scene: 'road', cues: [[0, 'bicycle'], [2000, 'bicycle']], parts: [
    P('w1', 'wheel', 135, 195, 70, 70, C.dark, 1), P('w2', 'wheel', 265, 195, 70, 70, C.dark, 1), P('frame', 'frame', 200, 165, 130, 60, C.red, 1),
    P('seat', 'seat', 168, 128, 36, 10, C.dark, 2), P('handle', 'handle', 248, 124, 40, 10, C.dark, 2),
    P('pedal', 'gear', 200, 197, 22, 22, C.grey, 3, { n: 'pedal' }), P('basket', 'box', 290, 140, 32, 22, C.wood, 3, { n: 'basket' })] },
  { id: 'aeroplane', name: L('Aeroplane', 'విమానం'), alive: 'fly', dir: -1, scene: 'sky', cues: [[0, 'aeroplane']], parts: [
    P('body', 'box', 200, 140, 220, 44, C.white, 1), P('wing', 'wing', 190, 172, 120, 26, C.blue, 1), P('fin', 'fin', 296, 100, 40, 46, C.blue, 1, { turn: 90 }),
    P('nose', 'nose', 77, 140, 30, 44, C.white, 2), P('win1', 'window', 150, 132, 22, 14, C.glass, 2),
    P('win2', 'window', 250, 132, 22, 14, C.glass, 3), P('tailwing', 'wing', 292, 132, 50, 14, C.blue, 3)] },
  { id: 'helicopter', name: L('Helicopter', 'హెలికాప్టర్'), alive: 'hover', scene: 'sky', cues: [[0, 'helicopter']], parts: [
    P('cabin', 'bubble', 180, 150, 110, 80, C.yellow, 1), P('tail', 'tail', 285, 140, 120, 16, C.yellow, 1), P('rotor', 'rotor', 180, 96, 210, 10, C.dark, 1), P('skid', 'skid', 180, 205, 120, 16, C.dark, 1),
    P('win', 'window', 152, 135, 44, 30, C.glass, 2), P('tprop', 'prop', 345, 140, 10, 40, C.dark, 2, { turn: 90 }), P('light', 'light', 128, 172, 10, 10, C.red, 3)] },
  { id: 'cart', name: L('Bullock cart', 'ఎడ్ల బండి'), alive: 'slow', dir: -1, scene: 'field', cues: [[0, 'cart']], parts: [
    P('bed', 'box', 240, 160, 140, 36, C.wood, 1), P('wheel', 'wheel', 240, 196, 70, 70, C.brown, 1), P('bullock', 'bullock', 95, 180, 96, 70, C.white, 1), P('yoke', 'yoke', 152, 150, 80, 10, C.brown, 1),
    P('roof', 'canopy', 245, 124, 120, 40, C.orange, 2), P('bell', 'light', 75, 150, 10, 10, C.yellow, 2, { n: 'bell' }), P('flag', 'fin', 296, 94, 20, 24, C.red, 3, { n: 'flag', mirror: true })] },
  { id: 'auto', name: L('Auto-rickshaw', 'ఆటో'), alive: 'drive', scene: 'road', cues: [[0, 'auto']], parts: [
    P('top', 'canopy', 205, 122, 150, 40, C.dark, 1, { n: 'canopy' }), P('body', 'box', 205, 170, 160, 56, C.yellow, 1), P('wb', 'wheel', 140, 205, 40, 40, C.dark, 1), P('wf', 'wheel', 275, 205, 40, 40, C.dark, 1),
    P('shield', 'window', 262, 140, 30, 30, C.glass, 2), P('light', 'light', 292, 165, 12, 12, C.white, 2), P('seat', 'seat', 170, 150, 40, 10, C.dark, 3)] },
  { id: 'bus', name: L('Bus', 'బస్సు'), alive: 'drive', scene: 'road', cues: [[0, 'bus']], parts: [
    P('body', 'box', 200, 152, 270, 92, C.red, 1), P('wb', 'wheel', 120, 205, 44, 44, C.dark, 1), P('wf', 'wheel', 280, 205, 44, 44, C.dark, 1),
    P('win1', 'window', 110, 130, 40, 28, C.glass, 2), P('win2', 'window', 170, 130, 40, 28, C.glass, 2), P('win3', 'window', 230, 130, 40, 28, C.glass, 2),
    P('door', 'box', 306, 160, 30, 56, C.yellow, 3, { n: 'door' }), P('light', 'light', 325, 186, 10, 10, C.white, 3)] },
  { id: 'train', name: L('Train engine', 'రైలు ఇంజన్'), alive: 'slow', dir: -1, scene: 'road', cues: [[0, 'train']], parts: [
    P('cab', 'box', 275, 140, 80, 90, C.red, 1, { n: 'cab' }), P('boiler', 'box', 175, 165, 130, 50, C.blue, 1, { n: 'boiler' }), P('w1', 'wheel', 140, 205, 40, 40, C.dark, 1), P('w2', 'wheel', 210, 205, 40, 40, C.dark, 1),
    P('w3', 'wheel', 280, 205, 40, 40, C.dark, 2), P('chimney', 'chimney', 130, 120, 26, 40, C.dark, 2), P('cabwin', 'window', 275, 113, 36, 26, C.glass, 2),
    P('guard', 'fin', 95, 198, 30, 28, C.dark, 3, { n: 'guard' }), P('light', 'light', 106, 152, 12, 12, C.yellow, 3)] },
  { id: 'boat', name: L('Boat', 'పడవ'), alive: 'sail', scene: 'water', cues: [[0, 'boat'], [300, 'sea']], parts: [
    P('hull', 'hull', 200, 192, 200, 40, C.wood, 1), P('mast', 'box', 200, 122, 8, 110, C.dark, 1, { n: 'mast' }), P('sail', 'sail', 232, 122, 60, 90, C.white, 1),
    P('flag', 'fin', 210, 60, 22, 16, C.red, 2, { n: 'flag' }), P('port1', 'light', 150, 192, 12, 12, C.glass, 2, { n: 'porthole' }), P('port2', 'light', 250, 192, 12, 12, C.glass, 2, { n: 'porthole' }),
    P('sail2', 'sail', 172, 132, 40, 64, C.orange, 3, { mirror: true })] },
  { id: 'tractor', name: L('Tractor', 'ట్రాక్టర్'), alive: 'slow', dir: -1, scene: 'field', cues: [[0, 'tractor']], parts: [
    P('body', 'box', 175, 168, 130, 48, C.green, 1), P('cab', 'box', 262, 145, 60, 72, C.green, 1, { n: 'cab' }), P('bigw', 'wheel', 268, 195, 70, 70, C.dark, 1), P('smw', 'wheel', 128, 207, 40, 40, C.dark, 1),
    P('cabwin', 'window', 262, 118, 36, 26, C.glass, 2), P('chimney', 'chimney', 150, 128, 14, 40, C.dark, 2), P('light', 'light', 112, 162, 10, 10, C.yellow, 3)] },
  { id: 'rocket', name: L('Rocket', 'రాకెట్'), alive: 'launch', scene: 'space', cues: [[0, 'rocket']], parts: [
    P('body', 'box', 200, 140, 60, 130, C.white, 1), P('nose', 'cone', 200, 58, 60, 40, C.red, 1), P('fin1', 'fin', 158, 188, 30, 44, C.red, 1), P('fin2', 'fin', 242, 188, 30, 44, C.red, 1, { mirror: true }),
    P('port', 'light', 200, 112, 24, 24, C.glass, 2, { n: 'porthole' }), P('flame', 'flame', 200, 228, 30, 40, C.orange, 2), P('stripe', 'box', 200, 172, 60, 10, C.blue, 3, { n: 'stripe' })] },
  { id: 'crane', name: L('Crane', 'క్రేన్'), alive: 'lift', scene: 'field', cues: [[0, 'crane']], parts: [
    P('base', 'track', 190, 205, 170, 30, C.dark, 1), P('cab', 'box', 165, 158, 90, 64, C.yellow, 1, { n: 'cab' }), P('arm', 'arm', 250, 122, 110, 16, C.yellow, 1, { angle: -30 }), P('bucket', 'bucket', 306, 124, 40, 34, C.grey, 1),
    P('win', 'window', 145, 140, 30, 22, C.glass, 2), P('light', 'light', 222, 180, 10, 10, C.orange, 2), P('weight', 'box', 110, 170, 26, 30, C.grey, 3, { n: 'weight', turn: 90 })] },
  { id: 'windmill', name: L('Windmill', 'గాలిమర'), alive: 'turn', scene: 'field', cues: [[0, 'wind']], parts: [
    P('tower', 'tower', 200, 168, 60, 110, C.white, 1), P('door', 'box', 200, 195, 20, 30, C.wood, 1, { n: 'door' }),
    P('win', 'window', 200, 140, 16, 16, C.glass, 2), P('base', 'box', 200, 226, 110, 12, C.green, 2, { n: 'base' }), P('roof', 'cone', 200, 108, 64, 26, C.red, 3),
    P('blades', 'blades', 200, 80, 140, 140, C.wood, 1)] },
  { id: 'gears', name: L('Gear machine', 'గేర్ల యంత్రం'), alive: 'turn', scene: 'room', cues: [[0, 'motor'], [300, 'gears'], [1900, 'gears']], parts: [
    P('base', 'box', 200, 215, 240, 20, C.wood, 1, { n: 'base' }), P('big', 'gear', 150, 150, 80, 80, C.orange, 1), P('mid', 'gear', 215, 130, 56, 56, C.blue, 1),
    P('small', 'gear', 250, 162, 36, 36, C.green, 2), P('motor', 'box', 85, 186, 44, 40, C.blue, 2, { n: 'motor' }), P('lamp', 'light', 300, 120, 16, 16, C.yellow, 3, { n: 'lamp', turn: 180 })] },
];
export const MODEL: Record<string, Model> = Object.fromEntries(MODELS.map((m) => [m.id, m]));

// ---------------- logic ----------------
/** Parts the child places at this level (the others are already built). */
export const levelParts = (m: Model, level: Level) => m.parts.filter((p) => p.lv <= level);
export const prebuilt = (m: Model, level: Level) => m.parts.filter((p) => p.lv > level);
/** Shape key: parts with the same key are interchangeable. */
export const shapeKey = (p: Part) => `${p.kind}:${p.w}x${p.h}:${p.c}:${p.angle ?? 0}`;

export interface Orient { rot: number; flip: boolean }
/** How a part starts in the tray (level 3 parts may need turning / flipping). */
export const startOrient = (p: Part, level: Level): Orient => (level === 3 ? { rot: p.turn ?? 0, flip: false } : { rot: 0, flip: !!p.mirror });
export const rotate = (o: Orient): Orient => ({ ...o, rot: (o.rot + 90) % 360 });
export const flip = (o: Orient): Orient => ({ ...o, flip: !o.flip });
export const canTurn = (p: Part, level: Level) => level === 3 && !!p.turn;
export const canFlip = (p: Part, level: Level) => level === 3 && !!p.mirror;
/** Is the part's orientation right for this slot? (levels 1–2 fit automatically) */
export const fits = (o: Orient, slot: Part, level: Level) => level < 3 || (o.rot % 360 === 0 && o.flip === !!slot.mirror);

export type DropResult = { slot: string } | { turn: string } | null;
/**
 * Where a part dropped at (x, y) goes: the nearest free slot of the same shape within the snap
 * distance ({ slot }), or { turn } if it is the right place but must be turned/flipped first.
 */
export function dropPart(m: Model, level: Level, filled: Record<string, string>, part: Part, o: Orient, x: number, y: number): DropResult {
  let best: Part | null = null, bestD = Infinity;
  for (const s of levelParts(m, level)) {
    if (filled[s.id] || shapeKey(s) !== shapeKey(part)) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= SNAP[level] && d < bestD) { best = s; bestD = d; }
  }
  if (!best) return null;
  return fits(o, best, level) ? { slot: best.id } : { turn: best.id };
}
/** Tap-then-tap: can this part go into this slot? */
export function tapPlace(m: Model, level: Level, filled: Record<string, string>, part: Part, o: Orient, slotId: string): DropResult {
  const s = levelParts(m, level).find((x) => x.id === slotId);
  if (!s || filled[s.id] || shapeKey(s) !== shapeKey(part)) return null;
  return fits(o, s, level) ? { slot: s.id } : { turn: s.id };
}
/** Gentle magnet: pull a dragged point toward the nearest matching free slot when it is close. */
export function magnet(m: Model, level: Level, filled: Record<string, string>, part: Part, x: number, y: number): { x: number; y: number; near?: string } {
  let best: Part | null = null, bestD = Infinity;
  for (const s of levelParts(m, level)) {
    if (filled[s.id] || shapeKey(s) !== shapeKey(part)) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d < bestD) { best = s; bestD = d; }
  }
  if (!best || bestD > SNAP[level] * 1.5) return { x, y };
  const k = MAGNET[level] * (1 - bestD / (SNAP[level] * 1.5));
  return { x: x + (best.x - x) * k, y: y + (best.y - y) * k, near: bestD <= SNAP[level] ? best.id : undefined };
}
/** Sound when a part clicks into place. */
export function placeSfx(p: Part): SfxName {
  if (p.kind === 'wheel' || p.kind === 'track') return 'screw';
  if (p.kind === 'gear') return 'gears';
  if (p.kind === 'rotor' || p.kind === 'prop' || p.kind === 'blades' || p.kind === 'sail') return 'whoosh';
  if (p.n === 'bell') return 'bell';
  if (p.kind === 'bullock') return 'cow';
  if (p.w * p.h >= 5000) return 'hammer';
  return 'snap';
}
export const modelSfx = (m: Model): SfxName[] => [...new Set(m.cues.map(([, s]) => s))];

// ---------------- saved progress ----------------
export interface BuildState { done: Record<string, number>; level: Level; free?: FreeDesign }
export const BUILD_INIT: BuildState = { done: {}, level: 1 };
export function recordBuild(s: BuildState, modelId: string, level: Level): BuildState {
  return { ...s, done: { ...s.done, [modelId]: Math.max(s.done[modelId] ?? 0, level) } };
}
export const builtCount = (s: BuildState) => Object.keys(s.done).filter((id) => MODEL[id]).length;
export function badgesFor(s: BuildState): string[] {
  const n = builtCount(s);
  return [...(n >= 1 ? ['play:build-first'] : []), ...(n >= 5 ? ['play:build-5'] : []), ...(n >= MODELS.length ? ['play:build-all'] : [])];
}

// ---------------- free build ----------------
export type FreeBody = 'car' | 'bus' | 'auto' | 'tractor';
export type FreeWheel = 'small' | 'big' | 'flower';
export interface FreeDesign { body: FreeBody; wheel: FreeWheel; colour: string }
export const FREE_BODIES: { id: FreeBody; name: L; sfx: SfxName }[] = [
  { id: 'car', name: L('Car', 'కారు'), sfx: 'car' }, { id: 'bus', name: L('Bus', 'బస్సు'), sfx: 'bus' },
  { id: 'auto', name: L('Auto', 'ఆటో'), sfx: 'auto' }, { id: 'tractor', name: L('Tractor', 'ట్రాక్టర్'), sfx: 'tractor' },
];
export const FREE_WHEELS: { id: FreeWheel; name: L; r: number }[] = [
  { id: 'small', name: L('Small wheels', 'చిన్న చక్రాలు'), r: 20 }, { id: 'big', name: L('Big wheels', 'పెద్ద చక్రాలు'), r: 32 }, { id: 'flower', name: L('Flower wheels', 'పువ్వు చక్రాలు'), r: 26 },
];
export const FREE_INIT: FreeDesign = { body: 'car', wheel: 'small', colour: PALETTE[1] };
