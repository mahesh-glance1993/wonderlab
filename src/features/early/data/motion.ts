/*
 * Story Time animations — pure data + helpers (no DOM), so they can be tested.
 *
 * Every story page gets a short, calm animation (3–8 s) that tells the page visually and ends in
 * the page's "final pose": every story actor finishes at its resting place from data/stories.ts,
 * so the reduced-motion version (no movement, final pose only) shows the same picture.
 *
 * Poses are offsets from the actor's resting place in stage units (400×260 stage):
 *   x/y translate, r rotate (deg), s scale, sx/sy stretch, o opacity.
 * Sound cues (lib/sfx) are timed on the same clock as the movement.
 *
 * TELUGU REVIEW NEEDED: the `what` captions' Telugu text are first drafts.
 */
import type { SfxName } from '../../../lib/sfx';
import type { AmbienceName } from '../../../lib/nature';
import { L } from './pictures';
import type { Actor } from './stories';

export interface Pose { x?: number; y?: number; r?: number; s?: number; sx?: number; sy?: number; o?: number }
export interface Key extends Pose { t: number }
export interface Track { actor: string; keys: Key[]; origin?: 'bottom' }
export interface Cue { t: number; sfx: SfxName }
export interface VSet { t: number; actor: string; v: string }
/** A mini animation run when an actor is tapped (or `@done` when a counting moment is finished). */
export interface TapMotion { tracks: Track[]; cues?: Cue[] }
export interface PageMotion {
  dur: number;
  /** Text description of what happens in the animation (screen readers / caption). */
  what: L;
  tracks: Track[];
  cues?: Cue[];
  /** Starting look (`v`) for actors that change during the animation, and the timed changes. */
  init?: Record<string, string>;
  sets?: VSet[];
  /** Decorative, non-interactive actors used only by the animation. `back` draws them behind the story actors. */
  extras?: (Actor & { back?: boolean })[];
  tap?: Record<string, TapMotion>;
  /** Quiet looping background sound for the whole page (rain, forest, night crickets...). */
  bed?: AmbienceName;
}

export const EASE = 'cubic-bezier(.45,0,.35,1)';
export const MIN_DUR = 3000;
export const MAX_DUR = 8000;
/** Calm-motion limits used by the tests. */
export const LIMITS = { maxSpeed: 350, maxSpin: 120, minGap: 200, maxOpacityTurns: 2 };

// ---------------- pose helpers ----------------
const full = (p: Pose): Required<Pose> => ({ x: p.x ?? 0, y: p.y ?? 0, r: p.r ?? 0, s: p.s ?? 1, sx: p.sx ?? 1, sy: p.sy ?? 1, o: p.o ?? 1 });
export const isRest = (p: Pose) => { const f = full(p); return f.x === 0 && f.y === 0 && f.r === 0 && f.s === 1 && f.sx === 1 && f.sy === 1 && f.o === 1; };
export function poseCss(p: Pose): { transform: string; opacity: number } {
  const f = full(p);
  return { transform: `translate(${f.x}px, ${f.y}px) rotate(${f.r}deg) scale(${+(f.s * f.sx).toFixed(4)}, ${+(f.s * f.sy).toFixed(4)})`, opacity: f.o };
}
const samePose = (a: Pose, b: Pose) => JSON.stringify(full(a)) === JSON.stringify(full(b));
export const finalPose = (t: Track): Pose => t.keys[t.keys.length - 1] ?? {};
export const trackEnd = (t: Track) => t.keys[t.keys.length - 1]?.t ?? 0;
export const tapDuration = (m?: TapMotion) => (m ? Math.max(0, ...m.tracks.map(trackEnd), ...(m.cues || []).map((c) => c.t)) : 0);

/** Web Animations keyframes for a track over `dur` ms (holds the first pose before it starts and the last after). */
export function toKeyframes(track: Track, dur: number): Keyframe[] {
  const keys = track.keys;
  if (!keys.length) return [];
  const frames: Keyframe[] = [];
  const push = (t: number, p: Pose) => frames.push({ offset: Math.min(1, Math.max(0, t / dur)), easing: EASE, ...poseCss(p) });
  if (keys[0].t > 0) push(0, keys[0]);
  for (const k of keys) push(k.t, k);
  if (keys[keys.length - 1].t < dur) push(dur, keys[keys.length - 1]);
  // offsets must never go backwards
  for (let i = 1; i < frames.length; i++) if ((frames[i].offset as number) < (frames[i - 1].offset as number)) frames[i].offset = frames[i - 1].offset;
  return frames;
}

/** Look (`v`) of actors at the start and at the end of the page animation. */
export const initialV = (m?: PageMotion): Record<string, string> => ({ ...(m?.init || {}) });
export function finalV(m?: PageMotion): Record<string, string> {
  const v = initialV(m);
  for (const s of [...(m?.sets || [])].sort((a, b) => a.t - b.t)) v[s.actor] = s.v;
  return v;
}
/** Items (cues or sets) whose time has come at `t` and that were not yet done. */
export function due<T extends { t: number }>(items: T[] | undefined, t: number, done: Set<number>): T[] {
  const out: T[] = [];
  (items || []).forEach((c, i) => { if (!done.has(i) && c.t <= t) { done.add(i); out.push(c); } });
  return out;
}
/** Auto-turn: next page a few seconds after the animation and narration have both finished. */
export const AUTO_TURN_MS = 4500;
export const autoTurnReady = (s: { enabled: boolean; animDone: boolean; speaking: boolean; paused: boolean }) => s.enabled && s.animDone && !s.speaking && !s.paused;

/** Problems with a page animation (empty = calm and valid). Used by tests. */
export function motionIssues(m: PageMotion, actorIds: string[]): string[] {
  const out: string[] = [];
  const extraIds = new Set((m.extras || []).map((e) => e.id));
  const ids = new Set([...actorIds, ...extraIds]);
  if (m.dur < MIN_DUR || m.dur > MAX_DUR) out.push(`duration ${m.dur}`);
  if (!m.what.en.trim() || !m.what.te.trim()) out.push('missing description');
  const check = (tracks: Track[], end: number, where: string, mustRest: boolean) => {
    for (const tr of tracks) {
      if (!ids.has(tr.actor)) out.push(`${where}: unknown actor ${tr.actor}`);
      if (!tr.keys.length) out.push(`${where}: ${tr.actor} has no keys`);
      let turns = 0, dir = 0;
      tr.keys.forEach((k, i) => {
        if (k.t < 0 || k.t > end) out.push(`${where}: ${tr.actor} key at ${k.t} outside 0–${end}`);
        if (i === 0) return;
        const a = full(tr.keys[i - 1]), b = full(k), dt = k.t - tr.keys[i - 1].t;
        if (dt < 0) out.push(`${where}: ${tr.actor} keys out of order`);
        if (dt < LIMITS.minGap && !samePose(a, b)) out.push(`${where}: ${tr.actor} moves too fast at ${k.t} (gap ${dt}ms)`);
        if (dt > 0) {
          const speed = (Math.hypot(b.x - a.x, b.y - a.y) / dt) * 1000;
          if (speed > LIMITS.maxSpeed) out.push(`${where}: ${tr.actor} speed ${Math.round(speed)} at ${k.t}`);
          const spin = (Math.abs(b.r - a.r) / dt) * 1000;
          if (spin > LIMITS.maxSpin) out.push(`${where}: ${tr.actor} spins ${Math.round(spin)}°/s at ${k.t}`);
        }
        const d = Math.sign(b.o - a.o);
        if (d && dir && d !== dir) turns++;
        if (d) dir = d;
      });
      if (turns > LIMITS.maxOpacityTurns - 1) out.push(`${where}: ${tr.actor} opacity flickers`);
      if (mustRest && !extraIds.has(tr.actor) && !isRest(finalPose(tr))) out.push(`${where}: ${tr.actor} does not end at rest`);
    }
  };
  check(m.tracks, m.dur, 'page', true);
  for (const c of m.cues || []) if (c.t < 0 || c.t > m.dur) out.push(`cue ${c.sfx} at ${c.t}`);
  for (const s of m.sets || []) if (!ids.has(s.actor) || s.t > m.dur) out.push(`set ${s.actor}`);
  for (const [k, tm] of Object.entries(m.tap || {})) {
    if (k !== '@done' && !ids.has(k)) out.push(`tap on unknown ${k}`);
    if (tapDuration(tm) > 3000) out.push(`tap ${k} too long`);
    check(tm.tracks, 3000, `tap ${k}`, false);
  }
  return out;
}

// ---------------- builders ----------------
const k = (t: number, p: Pose = {}): Key => ({ t, ...p });
const T = (actor: string, keys: Key[], origin?: 'bottom'): Track => {
  // drop repeated keys at the same time with the same pose (segments joined end-to-start)
  const ks = keys.filter((x, i) => i === 0 || !(x.t === keys[i - 1].t && samePose(x, keys[i - 1])));
  return origin ? { actor, keys: ks, origin } : { actor, keys: ks };
};
/** Walk in from `dx` to the resting place with small hops. */
function walk(dx: number, t0: number, t1: number, steps = 4, h = 6, dy = 0): Key[] {
  const out: Key[] = [k(t0, { x: dx, y: dy })];
  const step = (t1 - t0) / steps;
  for (let i = 1; i <= steps; i++) {
    const f = i / steps, fm = (i - 0.5) / steps;
    out.push(k(Math.round(t0 + step * (i - 0.5)), { x: Math.round(dx * (1 - fm)), y: Math.round(dy * (1 - fm)) - h }));
    out.push(k(Math.round(t0 + step * i), { x: Math.round(dx * (1 - f)), y: Math.round(dy * (1 - f)) }));
  }
  return out;
}
/** Fly in along a gentle arc. */
const fly = (dx: number, dy: number, t0: number, t1: number, r = 0): Key[] =>
  [k(t0, { x: dx, y: dy, r }), k(Math.round((t0 + t1) / 2), { x: Math.round(dx * 0.35), y: Math.round(dy * 0.35) - 12, r: r / 2 }), k(t1)];
/** Swing a pose back and forth n times, ending at rest. */
function swing(t0: number, n: number, half: number, p: Pose, alt = false): Key[] {
  const out: Key[] = [k(t0)];
  for (let i = 0; i < n; i++) {
    const neg = alt && i % 2 === 1;
    const q: Pose = Object.fromEntries(Object.entries(p).map(([key, val]) => [key, key === 's' || key === 'sx' || key === 'sy' || key === 'o' ? val : neg ? -(val as number) : val]));
    out.push(k(t0 + half * (2 * i + 1), q), k(t0 + half * (2 * i + 2)));
  }
  return out;
}
const hop = (t0: number, n = 1, h = 10, half = 350) => swing(t0, n, half, { y: -h });
const sway = (t0: number, n: number, half: number, deg: number) => swing(t0, n, half, { r: deg }, true);
const popIn = (t0: number, d = 700): Key[] => [k(0, { s: 0.3, o: 0 }), k(t0, { s: 0.3, o: 0 }), k(t0 + d)];
const dropIn = (t0: number, dy = -50, d = 700): Key[] => [k(0, { y: dy, o: 0 }), k(t0, { y: dy, o: 0 }), k(t0 + d)];
/** A decorative raindrop group falling once and fading. */
const fall = (actor: string, t0: number): Track => T(actor, [k(0, { y: -40, o: 0 }), k(t0, { y: -40, o: 0 }), k(t0 + 500, { y: -20 }), k(t0 + 2000, { y: 30, o: 0 })]);
const X = (id: string, art: string, x: number, y: number, s = 1, extra: Partial<Actor & { back?: boolean }> = {}) => ({ id, art, x, y, s, ...extra });
const cues = (...c: [number, SfxName][]): Cue[] => c.map(([t, sfx]) => ({ t, sfx }));

// ---------------- the stories ----------------
export const MOTION: Record<string, PageMotion[]> = {
  'thirsty-crow': [
    { dur: 6000, bed: 'breeze', what: L('The hot sun shines. The tired crow hops in and droops its head. It wants water.', 'వేడి సూర్యుడు మెరుస్తున్నాడు. అలసిన కాకి గెంతుతూ వచ్చి తల వాల్చింది. దానికి నీళ్ళు కావాలి.'),
      tracks: [T('sun', [k(0, { y: 24, s: 0.9 }), k(1800), ...swing(1800, 2, 800, { s: 1.06 })]), T('tree', sway(0, 2, 1500, 1.5), 'bottom'),
        T('crow', [...walk(-150, 400, 3000, 4, 8), ...sway(3000, 1, 700, -10).slice(0, 3), k(4400), k(5100, { r: -10 }), k(5800)])],
      cues: cues([300, 'wind'], [3700, 'crow']),
      tap: { sun: { tracks: [], cues: cues([0, 'wind']) } } },
    { dur: 5500, bed: 'breeze', what: L('The crow flies down to a pot and peeps in. The water is far down at the bottom.', 'కాకి ఎగురుతూ కుండ దగ్గరకు వచ్చి లోపలికి చూసింది. నీళ్ళు బాగా అడుగున ఉన్నాయి.'),
      tracks: [T('crow', [...fly(-160, -110, 0, 2200, -10), ...hop(2400, 1, 8), k(3600, { r: -10 }), k(4300)]), T('pot', [k(0), k(4200), k(4500, { r: 2 }), k(4800, { r: -2 }), k(5100)])],
      cues: cues([0, 'whoosh'], [400, 'crow'], [4200, 'water']),
      tap: { pot: { tracks: [], cues: cues([0, 'water']) } } },
    { dur: 5000, bed: 'breeze', what: L('The crow carries a pebble over the pot and drops it in. Plop! Now you drop the other pebbles.', 'కాకి ఒక గులకరాయిని తెచ్చి కుండలో వేసింది. టప్! ఇప్పుడు మిగతా రాళ్ళు నువ్వు వెయ్యి.'),
      extras: [X('xp', 'pebble', 270, 140, 0.5)],
      tracks: [T('crow', [k(0), k(1200, { x: 202, y: -28 }), k(2600, { x: 202, y: -28 }), k(3800)]),
        T('xp', [k(0, { x: -202, y: -17 }), k(1200, { x: 0, y: -45 }), k(2600, { x: 0, y: -45 }), k(3300), k(3800, { o: 0 })]),
        T('pot', [k(0), k(3300), k(3600, { sx: 1.03, sy: 0.96 }), k(4000)], 'bottom')],
      cues: cues([200, 'crow'], [3300, 'splash']),
      tap: {
        p1: { tracks: [T('p1', [k(0), k(550, { x: 105, y: -140 }), k(1100, { x: 210, y: -97, s: 0.6 })])], cues: cues([1000, 'splash']) },
        p2: { tracks: [T('p2', [k(0), k(550, { x: 75, y: -140 }), k(1100, { x: 150, y: -103, s: 0.6 })])], cues: cues([1000, 'splash']) },
        p3: { tracks: [T('p3', [k(0), k(550, { x: 48, y: -130 }), k(1100, { x: 95, y: -97, s: 0.6 })])], cues: cues([1000, 'splash']) },
        '@done': { tracks: [T('crow', hop(0, 2, 10, 300))], cues: cues([200, 'crow']) },
      } },
    { dur: 6000, bed: 'breeze', what: L('The water rises up to the top. The crow flies onto the pot, dips its beak and drinks.', 'నీళ్ళు పైకి వచ్చాయి. కాకి కుండ మీద వాలి ముక్కు ముంచి నీళ్ళు తాగింది.'),
      init: { pot: '2' }, sets: [{ t: 600, actor: 'pot', v: '3' }, { t: 1600, actor: 'pot', v: '4' }],
      tracks: [T('crow', [...fly(-120, -70, 0, 2200), k(3000, { r: -14 }), k(3600), k(4300, { r: -14 }), k(4900)])],
      cues: cues([100, 'crow'], [600, 'water'], [3000, 'splash']),
      tap: { crow: { tracks: [], cues: cues([0, 'crow']) } } },
    { dur: 4500, bed: 'breeze', what: L('The happy crow hops two times and flaps. The sun smiles and the tree sways.', 'సంతోషంగా కాకి రెండు సార్లు గెంతింది. సూర్యుడు నవ్వాడు, చెట్టు ఊగింది.'),
      tracks: [T('crow', [...hop(0, 2, 14, 550), k(2900, { r: 6 }), k(3600)]), T('sun', [k(0, { y: 16 }), k(2000)]), T('tree', sway(0, 2, 1100, 1.5), 'bottom')],
      cues: cues([600, 'crow'], [1500, 'birds']) },
  ],
  'mango-tree': [
    { dur: 5000, bed: 'garden', what: L('Meena walks into the garden. She bends down and drops a mango seed into the soil.', 'మీనా తోటలోకి నడిచి వచ్చింది. వంగి మామిడి టెంకను మట్టిలో వేసింది.'),
      tracks: [T('child', [...walk(-120, 0, 2400, 4, 6), k(2900, { r: 10 }), k(3700)], 'bottom'),
        T('seed', [k(0, { x: -129, y: -58, o: 0 }), k(2600, { x: -129, y: -58, o: 0 }), k(2900, { x: -129, y: -58 }), k(3400, { x: -65, y: -80 }), k(3900), k(4200, { sx: 1.1, sy: 0.85 }), k(4600)], 'bottom')],
      cues: cues([300, 'birds'], [3900, 'pop']),
      tap: { seed: { tracks: [T('water', [k(0, { y: -30, o: 0 }), k(300, { y: -30 }), k(1300)])], cues: cues([0, 'water']) } } },
    { dur: 4500, bed: 'garden', what: L('The sun rises and warms the soil. The seed wiggles. Something is waking up!', 'సూర్యుడు ఉదయించి మట్టిని వేడి చేశాడు. విత్తనం కదిలింది. ఏదో మేలుకుంటోంది!'),
      tracks: [T('sun', [k(0, { y: 40, s: 0.85 }), k(2400), k(3000, { s: 1.06 }), k(3600)]), T('seed', [k(0), ...sway(2600, 2, 300, 6)])],
      cues: cues([300, 'birds']),
      tap: { sun: { tracks: [T('sprout', [k(0, { s: 0.2 }), k(1500)], 'bottom')], cues: cues([0, 'sparkle']) } } },
    { dur: 6000, bed: 'drizzle', what: L('A grey cloud floats over. Raindrops fall on the little plant and it sways.', 'బూడిద రంగు మేఘం తేలుతూ వచ్చింది. చిన్న మొక్క మీద వాన చినుకులు పడ్డాయి, అది ఊగింది.'),
      extras: [X('xr1', 'drops', 180, 130, 0.6), X('xr2', 'drops', 260, 140, 0.6)],
      tracks: [T('cloud', [k(0, { x: 150 }), k(2500)]), fall('xr1', 2300), fall('xr2', 2700), T('tree', [k(0), ...sway(3500, 2, 600, 2)], 'bottom')],
      cues: cues([2300, 'rain']),
      tap: { cloud: { tracks: [T('drops', [k(0, { y: -30 }), k(1500)])], cues: cues([0, 'rain']) } } },
    { dur: 5000, bed: 'garden', what: L('The plant grows taller and taller into a big mango tree. Meena jumps for joy.', 'మొక్క పెరిగి పెరిగి పెద్ద మామిడి చెట్టు అయ్యింది. మీనా సంతోషంగా ఎగిరింది.'),
      tracks: [T('tree', [k(0, { s: 0.6 }), k(3000), ...sway(3000, 1, 600, 1.5)], 'bottom'), T('child', [k(0), ...hop(3000, 1, 10, 400)])],
      cues: cues([200, 'leaves'], [3000, 'birds']),
      tap: { tree: { tracks: [], cues: cues([0, 'leaves']) } } },
    { dur: 4500, bed: 'garden', what: L('One by one, four yellow mangoes appear on the tree. Meena hops.', 'ఒక్కొక్కటిగా నాలుగు పసుపు మామిడి పండ్లు చెట్టుకు కనిపించాయి. మీనా గెంతింది.'),
      tracks: [T('m1', popIn(500)), T('m2', popIn(1200)), T('m3', popIn(1900)), T('m4', popIn(2600)), T('child', [k(0), ...hop(3500)])],
      cues: cues([500, 'pop'], [1200, 'pop'], [1900, 'pop'], [2600, 'pop']),
      tap: { '@done': { tracks: [T('child', hop(0, 2, 10, 300))], cues: cues([0, 'success']) } } },
    { dur: 4500, bed: 'garden', what: L('Meena hands a mango to her friend. Her friend jumps happily.', 'మీనా తన స్నేహితుడికి మామిడి పండు ఇచ్చింది. స్నేహితుడు సంతోషంగా ఎగిరాడు.'),
      tracks: [T('mango', [k(0, { x: -55, y: -15 }), k(800, { x: -55, y: -15 }), k(2000)]), T('child2', [k(0), ...hop(2300, 2, 12, 400)])],
      cues: cues([800, 'whoosh'], [2300, 'sparkle']) },
  ],
  'rainy-day': [
    { dur: 6000, bed: 'wind', what: L('Big grey clouds roll across the sky. A soft glow and a rumble of thunder. Ravi looks up.', 'పెద్ద బూడిద మేఘాలు ఆకాశంలో కదిలాయి. మెల్లని వెలుగు, ఉరుము శబ్దం. రవి పైకి చూశాడు.'),
      extras: [X('xglow', 'glow', 150, 62, 1.3)],
      tracks: [T('cloud', [k(0, { x: -200 }), k(4000)]), T('cloud2', [k(0, { x: 160 }), k(500, { x: 160 }), k(4200)]),
        T('xglow', [k(0, { o: 0 }), k(4200, { o: 0 }), k(4800, { o: 0.6 }), k(6000, { o: 0 })]), T('child', [k(0), k(4300), k(4900, { r: -6 }), k(5600)], 'bottom')],
      cues: cues([300, 'wind'], [4300, 'thunder']),
      tap: { cloud: { tracks: [], cues: cues([0, 'thunder']) } } },
    { dur: 4500, bed: 'rain', what: L('Rain is falling. Ravi runs in with his closed umbrella and lifts it up.', 'వాన పడుతోంది. రవి మూసిన గొడుగుతో పరుగెత్తుకుంటూ వచ్చి దాన్ని పైకి ఎత్తాడు.'),
      extras: [X('xr1', 'drops', 110, 90, 0.7), X('xr2', 'drops', 310, 100, 0.7)],
      tracks: [T('child', walk(-100, 0, 2400, 4, 6)), T('umbrella', [...walk(-100, 0, 2400, 4, 6), k(3000, { y: -8 }), k(3500)]), fall('xr1', 0), fall('xr2', 1200)],
      cues: cues([0, 'rain']),
      tap: { umbrella: { tracks: [], cues: cues([0, 'whoosh']) } } },
    { dur: 4500, bed: 'rain', what: L('The frog takes a big jump into the puddle. Splash! Ravi laughs and hops.', 'కప్ప నీటి గుంటలోకి పెద్ద గెంతు వేసింది. చప్! రవి నవ్వి గెంతాడు.'),
      extras: [X('xs', 'drops', 260, 200, 0.5)],
      tracks: [T('frog', [k(0, { x: -90, y: -10 }), k(500, { x: -90, y: -10 }), k(1100, { x: -45, y: -60 }), k(1700)]),
        T('puddle', [k(0), k(1700), k(2000, { sx: 1.12, sy: 0.85 }), k(2500)]),
        T('xs', [k(0, { s: 0.3, o: 0 }), k(1700, { s: 0.3, o: 0 }), k(2000, { y: -15 }), k(2700, { y: -25, o: 0 })]),
        T('child', [k(0), ...hop(2200)]), T('umbrella', [k(0), ...hop(2200)])],
      cues: cues([0, 'rain'], [600, 'frog'], [1700, 'splash']),
      tap: { frog: { tracks: [], cues: cues([0, 'frog'], [500, 'splash']) } } },
    { dur: 5000, bed: 'rain', what: L('Ravi bends down and puts his paper boat on the water. It bobs up and down.', 'రవి వంగి కాగితం పడవను నీళ్ళలో పెట్టాడు. అది పైకీ కిందికీ ఊగుతోంది.'),
      tracks: [T('child', [k(0), k(600, { r: 10 }), k(1400)], 'bottom'),
        T('boat', [k(0, { x: -40, y: -25, o: 0 }), k(700, { x: -40, y: -25, o: 0 }), k(1000, { x: -40, y: -25 }), k(1700), k(2300, { y: -3, r: 4 }), k(2900, { r: -4 }), k(3500, { y: -3, r: 4 }), k(4100)])],
      cues: cues([0, 'rain'], [1700, 'water']),
      tap: { boat: { tracks: [T('boat', sway(0, 2, 400, 4))], cues: cues([0, 'water']) } } },
    { dur: 5000, bed: 'garden', what: L('The rain stops. The sun peeps out from behind the cloud and Ravi jumps.', 'వాన ఆగింది. మేఘం వెనక నుంచి సూర్యుడు తొంగి చూశాడు, రవి ఎగిరాడు.'),
      tracks: [T('cloud', [k(0, { x: -12 }), k(2000), k(3000, { x: -8 }), k(4000)]), T('sun', [k(0, { y: 20 }), k(2500)]), T('child', [k(0), ...hop(3000, 2, 10, 400)])],
      cues: cues([300, 'birds']),
      tap: { cloud: { tracks: [T('rainbow', [k(0, { s: 0.5, o: 0 }), k(1800)], 'bottom')], cues: cues([0, 'sparkle']) } } },
  ],
  'lost-kitten': [
    { dur: 5500, bed: 'garden', what: L('A little kitten walks along all alone. It looks this way and that way.', 'ఒక చిన్న పిల్లి పిల్ల ఒంటరిగా నడుస్తోంది. అటూ ఇటూ చూస్తోంది.'),
      tracks: [T('kitten', [...walk(-160, 0, 3000, 5, 6), k(3600, { r: -8 }), k(4200), k(4800, { r: 8 }), k(5400)])],
      cues: cues([0, 'birds'], [3400, 'cat']) },
    { dur: 5000, bed: 'garden', what: L('The kitten walks up to the dog. The dog shakes its head: Mother Cat is not here.', 'పిల్లి పిల్ల కుక్క దగ్గరకు వచ్చింది. కుక్క తల ఊపింది: అమ్మ పిల్లి ఇక్కడ లేదు.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('dog', [k(0), ...sway(2400, 2, 400, 5)])],
      cues: cues([2100, 'cat'], [2700, 'dog']) },
    { dur: 5000, bed: 'garden', what: L('The kitten asks the cow. The cow nods slowly and says moo.', 'పిల్లి పిల్ల ఆవును అడిగింది. ఆవు మెల్లగా తల ఊపి అంబా అంది.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('cow', [k(0), ...swing(2400, 2, 500, { r: 6 })])],
      cues: cues([2100, 'cat'], [2600, 'cow']) },
    { dur: 5000, bed: 'garden', what: L('The kitten asks the hen. The hen pecks and points to the red house.', 'పిల్లి పిల్ల కోడిని అడిగింది. కోడి పొడుస్తూ ఎర్ర ఇంటిని చూపింది.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('hen', [k(0), ...swing(2400, 2, 300, { r: -14 })])],
      cues: cues([2100, 'cat'], [2500, 'hen']) },
    { dur: 4500, bed: 'garden', what: L('The kitten walks to the red house and stops at the door.', 'పిల్లి పిల్ల ఎర్ర ఇంటి దగ్గరకు నడిచి తలుపు దగ్గర ఆగింది.'),
      tracks: [T('kitten', [...walk(-90, 0, 2500, 4, 6), ...hop(3200, 1, 8)])],
      cues: cues([0, 'birds']),
      tap: { house: { tracks: [T('house', sway(0, 2, 250, 1)), T('mother', [k(0, { x: 40, o: 0 }), k(400, { x: 40, o: 0 }), k(1400)])], cues: cues([0, 'drum'], [500, 'drum'], [1300, 'cat']) } } },
    { dur: 5500, bed: 'garden', what: L('The kitten runs to Mother Cat and she nuzzles her baby. Home at last!', 'పిల్లి పిల్ల అమ్మ పిల్లి దగ్గరకు పరుగెత్తింది. అమ్మ ముద్దాడింది. ఇంటికి చేరింది!'),
      tracks: [T('kitten', [...walk(-80, 0, 2000, 3, 6), ...hop(2600, 1, 10)]), T('mother', [k(0), ...swing(2200, 2, 600, { r: -6 })])],
      cues: cues([2200, 'cat'], [3800, 'cat']) },
  ],
  'diwali-ladoos': [
    { dur: 4500, what: L('Grandma rocks gently as she rolls sweet ladoos. A plate slides out, ready.', 'నానమ్మ మెల్లగా ఊగుతూ లడ్డూలు చుడుతోంది. ఒక పళ్ళెం సిద్ధంగా వచ్చింది.'),
      tracks: [T('grandma', sway(0, 2, 700, 4), 'bottom'), T('plate', [k(0, { y: 10, o: 0 }), k(1200, { y: 10, o: 0 }), k(2000)])],
      cues: cues([200, 'bell']),
      tap: { plate: { tracks: [T('l1', popIn(0, 600)), T('l2', popIn(400, 600)), T('l3', popIn(800, 600))], cues: cues([0, 'pop'], [400, 'pop'], [800, 'pop']) } } },
    { dur: 4000, what: L('Four little lamps are set out in a row, ready to be lit.', 'నాలుగు చిన్న దీపాలు వరుసగా పెట్టారు, వెలిగించడానికి సిద్ధం.'),
      tracks: [T('d1', dropIn(200, 16)), T('d2', dropIn(600, 16)), T('d3', dropIn(1000, 16)), T('d4', dropIn(1400, 16))],
      cues: cues([200, 'tick'], [600, 'tick'], [1000, 'tick'], [1400, 'tick']),
      tap: { d1: { tracks: [], cues: cues([0, 'sparkle']) }, d2: { tracks: [], cues: cues([0, 'sparkle']) }, d3: { tracks: [], cues: cues([0, 'sparkle']) }, d4: { tracks: [], cues: cues([0, 'sparkle']) }, '@done': { tracks: [], cues: cues([300, 'bell']) } } },
    { dur: 5000, what: L('Two friends walk in from both sides, meet by the lamp and jump with joy.', 'ఇద్దరు స్నేహితులు రెండు వైపుల నుంచి వచ్చి దీపం దగ్గర కలిసి సంతోషంగా ఎగిరారు.'),
      tracks: [T('child', [...walk(-100, 0, 2200, 3, 6), ...hop(2800, 2, 10, 350)]), T('child2', [...walk(120, 0, 2200, 3, 6), ...hop(2950, 2, 10, 350)])],
      cues: cues([2600, 'bell']) },
    { dur: 4500, what: L('Grandma puts five round ladoos on the big plate, one at a time.', 'నానమ్మ పెద్ద పళ్ళెంలో ఐదు గుండ్రని లడ్డూలను ఒక్కొక్కటిగా పెట్టింది.'),
      tracks: [T('l1', dropIn(300)), T('l2', dropIn(1000)), T('l3', dropIn(1700)), T('l4', dropIn(2400)), T('l5', dropIn(3100))],
      cues: cues([1000, 'pop'], [1700, 'pop'], [2400, 'pop'], [3100, 'pop'], [3800, 'pop']),
      tap: Object.fromEntries(['l1', 'l2', 'l3', 'l4', 'l5'].map((id) => [id, { tracks: [T(id, hop(0, 1, 10, 300))], cues: cues([0, 'pop']) }])) },
    { dur: 4500, bed: 'night', what: L('The moon rises over the glowing house. The little lamp keeps shining.', 'వెలుగుతున్న ఇంటి మీద చంద్రుడు ఉదయించాడు. చిన్న దీపం వెలుగుతూనే ఉంది.'),
      tracks: [T('moon', [k(0, { y: 40 }), k(2500)])],
      cues: cues([300, 'wind']),
      tap: { moon: { tracks: [T('s1', popIn(0, 600)), T('s2', popIn(400, 600)), T('s3', popIn(800, 600))], cues: cues([0, 'sparkle'], [800, 'sparkle']) } } },
  ],
  'bus-ride': [
    { dur: 5500, bed: 'garden', what: L('Anu and Amma wait at the bus stop. A car drives past. Anu looks down the road.', 'అను, అమ్మ బస్ స్టాప్‌లో ఎదురు చూస్తున్నారు. ఒక కారు వెళ్ళింది. అను దారి వైపు చూసింది.'),
      extras: [X('xcar', 'car', 470, 228, 0.7)],
      tracks: [T('xcar', [k(0, { x: -560 }), k(800, { x: -560 }), k(4800)]), T('child', [k(0), k(1200, { r: -6 }), k(2000), ...hop(3000, 1, 8)], 'bottom'), T('adult', [k(0), k(1500, { r: 4 }), k(2500)], 'bottom')],
      cues: cues([0, 'birds'], [800, 'car']),
      tap: { sign: { tracks: [T('bus', [k(0, { x: 200 }), k(2000)])], cues: cues([0, 'bus'], [1900, 'horn']) } } },
    { dur: 6000, bed: 'garden', what: L('The bus rolls along. Trees and cows slide past the window as it drives.', 'బస్సు సాగుతోంది. కిటికీ బయట చెట్లు, ఆవులు వెనక్కి వెళ్తున్నట్టు కనిపిస్తున్నాయి.'),
      extras: [X('xt', 'tree', -80, 150, 1.2, { back: true }), X('xf', 'flower', -40, 205, 0.5, { back: true })],
      tracks: [T('bus', swing(0, 8, 350, { y: -3 })), T('c1', [k(0, { x: 220 }), k(4500)]), T('c2', [k(0, { x: 220 }), k(4500)]), T('c3', [k(0, { x: 220 }), k(4500)]),
        T('xt', [k(0, { x: 520 }), k(5500)]), T('xf', [k(0, { x: 480 }), k(4000)])],
      cues: cues([0, 'bus'], [2800, 'bus'], [4500, 'cow']),
      tap: Object.fromEntries(['c1', 'c2', 'c3'].map((id) => [id, { tracks: [], cues: cues([0, 'cow']) }])) },
    { dur: 5000, bed: 'garden', what: L('The bus drives into the village. A farmer’s tractor chugs across the field.', 'బస్సు ఊళ్ళోకి వచ్చింది. రైతు ట్రాక్టర్ పొలంలో టక టక సాగుతోంది.'),
      tracks: [T('bus', [k(0, { x: -160 }), k(2500)]), T('tractor', [k(0, { x: 40 }), k(600, { x: 30, y: -3 }), k(1200, { x: 20 }), k(1800, { x: 10, y: -3 }), k(2400), ...swing(2400, 2, 300, { y: -3 })])],
      cues: cues([0, 'bus'], [800, 'tractor']),
      tap: { tractor: { tracks: [], cues: cues([0, 'tractor']) } } },
    { dur: 5500, bed: 'stream', what: L('The bus crosses the bridge over the river. Below, a little boat rocks on the water.', 'బస్సు నది మీది వంతెన దాటింది. కింద ఒక చిన్న పడవ నీళ్ళలో ఊగుతోంది.'),
      tracks: [T('bus', [k(0, { x: -260 }), k(3500)]), T('boat', [k(0), k(1000, { y: -3, r: 3 }), k(2000, { r: -3 }), k(3000, { y: -3, r: 3 }), k(4000)])],
      cues: cues([0, 'bus'], [1500, 'water'], [3300, 'horn']),
      tap: { boat: { tracks: [], cues: cues([0, 'boat']) } } },
    { dur: 5000, bed: 'garden', what: L('Anu runs up the path. Grandma waves hello at her house.', 'అను దారిలో పరుగెత్తుకుంటూ వచ్చింది. నానమ్మ ఇంటి దగ్గర చేయి ఊపింది.'),
      tracks: [T('child', [...walk(-120, 0, 2500, 4, 6), ...hop(3000)]), T('grandma', [k(0), ...sway(2600, 2, 450, 6)], 'bottom')],
      cues: cues([0, 'horn'], [500, 'birds']) },
  ],
  'peacock-dance': [
    { dur: 5000, bed: 'forest', what: L('A peacock walks slowly through the forest, step by step.', 'ఒక నెమలి అడవిలో అడుగు అడుగు మెల్లగా నడుస్తోంది.'),
      tracks: [T('peacock', walk(140, 0, 3200, 5, 5)), T('tree', sway(0, 2, 1200, 1.5), 'bottom')],
      cues: cues([0, 'birds'], [3400, 'peacock']) },
    { dur: 5000, bed: 'wind', what: L('Dark clouds float in with a soft glow and a rumble. The peacock looks up, happy.', 'నల్లని మేఘాలు మెల్లని వెలుగు, ఉరుముతో వచ్చాయి. నెమలి సంతోషంగా పైకి చూసింది.'),
      extras: [X('xglow', 'glow', 200, 62, 1.4)],
      tracks: [T('cloud', [k(0, { x: -220 }), k(3000)]), T('xglow', [k(0, { o: 0 }), k(3000, { o: 0 }), k(3600, { o: 0.6 }), k(4800, { o: 0 })]),
        T('peacock', [k(0), k(3200), k(3700, { r: 8 }), k(4300), k(4650, { y: -8 }), k(5000)])],
      cues: cues([0, 'wind'], [3000, 'thunder'], [4300, 'peacock']) },
    { dur: 4500, bed: 'rain', what: L('Rain begins. The peacock shuffles its feet and stands tall, ready to open its feathers.', 'వాన మొదలైంది. నెమలి కాళ్ళు కదిలించి నిటారుగా నిలబడింది, పింఛం విప్పడానికి సిద్ధం.'),
      extras: [X('xr1', 'drops', 90, 90, 0.7), X('xr2', 'drops', 320, 100, 0.7)],
      tracks: [T('peacock', [...sway(0, 2, 600, 4), k(3000, { s: 1.05 }), k(3600)], 'bottom'), fall('xr1', 0), fall('xr2', 1400)],
      cues: cues([0, 'rain']),
      tap: { peacock: { tracks: [], cues: cues([0, 'whoosh'], [700, 'peacock']) } } },
    { dur: 7000, bed: 'rain', what: L('The peacock sways and dances in the rain. Three birds fly in to watch.', 'నెమలి వానలో ఊగుతూ నాట్యం చేస్తోంది. మూడు పక్షులు చూడటానికి ఎగిరి వచ్చాయి.'),
      tracks: [T('peacock', sway(0, 2, 900, 5), 'bottom'), T('b1', fly(-120, -40, 800, 2600)), T('b2', fly(100, -40, 1400, 3200)), T('b3', fly(120, -30, 2000, 3800))],
      cues: cues([0, 'rain'], [500, 'peacock'], [1200, 'birds'], [4000, 'peacock']),
      tap: { ...Object.fromEntries(['b1', 'b2', 'b3'].map((id) => [id, { tracks: [T(id, hop(0, 1, 8, 300))], cues: cues([0, 'bird']) }])), '@done': { tracks: [T('peacock', sway(0, 1, 500, 4), 'bottom')], cues: cues([0, 'peacock']) } } },
    { dur: 4500, bed: 'garden', what: L('The peacock sways once more and the children jump and clap for its lovely dance.', 'నెమలి మళ్ళీ ఊగింది. పిల్లలు ఎగిరి చప్పట్లు కొట్టారు.'),
      tracks: [T('peacock', sway(0, 1, 1000, 4), 'bottom'), T('child', [k(0), ...hop(800, 2, 10, 400)]), T('child2', [k(0), ...hop(1100, 2, 10, 400)])],
      cues: cues([800, 'drum'], [1600, 'drum'], [2600, 'peacock']),
      tap: { child: { tracks: [], cues: cues([0, 'drum'], [350, 'drum']) } } },
  ],
  'shiny-teeth': [
    { dur: 4500, what: L('The sun peeps into the window. Kiran sits up, stands and stretches.', 'కిటికీలోంచి సూర్యుడు తొంగి చూశాడు. కిరణ్ లేచి నిలబడి ఒళ్ళు విరుచుకున్నాడు.'),
      tracks: [T('sun', [k(0, { y: 20 }), k(2000)]), T('child', [k(0, { r: -75 }), k(800, { r: -75 }), k(2600), k(3200, { sy: 1.08 }), k(3800)], 'bottom')],
      cues: cues([0, 'rooster'], [2600, 'birds']) },
    { dur: 4000, what: L('Kiran walks to the sink. His toothbrush bobs, waiting for him.', 'కిరణ్ సింక్ దగ్గరకు నడిచాడు. బ్రష్ అతని కోసం ఎదురు చూస్తోంది.'),
      tracks: [T('child', walk(-80, 0, 2000, 3, 6)), T('brush', [k(0), ...hop(2200, 2, 10, 300)])],
      cues: cues([200, 'water']),
      tap: { brush: { tracks: [], cues: cues([0, 'pop']) } } },
    { dur: 5500, what: L('A toothbrush scrubs up and down, then round and round. Bits of dirt wobble on the teeth.', 'బ్రష్ పైకీ కిందికీ, గుండ్రంగా తోముతోంది. పళ్ళ మీద మురికి కదులుతోంది.'),
      extras: [X('xb', 'toothbrush', 330, 215, 0.9), X('xs1', 'sparkle', 165, 110, 0.35), X('xs2', 'sparkle', 240, 165, 0.3)],
      tracks: [T('xb', [k(0, { x: -130, y: -85, o: 0 }), k(500, { x: -130, y: -85 }), k(1000, { x: -130, y: -100 }), k(1500, { x: -130, y: -75 }), k(2000, { x: -130, y: -100 }), k(2500, { x: -130, y: -75 }), k(3000, { x: -170, y: -90 }), k(3500, { x: -90, y: -90 }), k(4000, { x: -130, y: -85 }), k(4800)]),
        T('xs1', [k(0, { o: 0 })]), T('xs2', [k(0, { o: 0 })]),
        T('g1', sway(0, 1, 600, 8)), T('g2', sway(300, 1, 600, 8)), T('g3', sway(600, 1, 600, 8))],
      cues: cues([1000, 'leaves'], [3000, 'leaves']),
      tap: { ...Object.fromEntries(['g1', 'g2', 'g3'].map((id) => [id, { tracks: [T(id, [k(0), k(600, { s: 0.4, r: 60 })])], cues: cues([0, 'pop']) }])),
        '@done': { tracks: [T('xs1', popIn(0, 700)), T('xs2', popIn(400, 700))], cues: cues([0, 'sparkle']) } } },
    { dur: 4500, what: L('The cup tips up. Kiran takes water, swishes and spits.', 'కప్పు వంగింది. కిరణ్ నీళ్ళు తీసుకుని పుక్కిలించి ఉమ్మేశాడు.'),
      tracks: [T('cup', swing(0, 2, 800, { y: -12, r: -20 })), T('child', [k(0), ...hop(1600, 1, 8)])],
      cues: cues([800, 'water'], [2400, 'splash']),
      tap: { cup: { tracks: [], cues: cues([0, 'water']) } } },
    { dur: 4500, what: L('Kiran smiles a big smile and his clean teeth sparkle!', 'కిరణ్ పెద్దగా నవ్వాడు. శుభ్రమైన పళ్ళు మెరిశాయి!'),
      extras: [X('xs', 'sparkle', 222, 150, 0.35)],
      tracks: [T('child', [...hop(0, 1, 12, 500), k(1600, { s: 1.04 }), k(2200)], 'bottom'), T('xs', [k(0, { s: 0.2, o: 0 }), k(1600, { s: 0.2, o: 0 }), k(2400, { r: 45 }), k(3200)])],
      cues: cues([1600, 'sparkle']),
      tap: { child: { tracks: [T('sp1', popIn(0, 600)), T('sp2', popIn(300, 600))], cues: cues([0, 'sparkle']) } } },
  ],
  // ---------------- added stories ----------------
  'clever-rabbit': [
    { dur: 5500, bed: 'forest', what: L('The big lion stomps in and gives a loud roar. The little rabbit shivers and the bird flaps up.', 'పెద్ద సింహం దబదబా నడిచి వచ్చి గట్టిగా గర్జించింది. చిన్ని కుందేలు వణికింది, పక్షి రెక్కలు ఆడించింది.'),
      tracks: [T('tree', sway(0, 2, 1300, 1.5), 'bottom'), T('lion', [...walk(160, 0, 2600, 4, 5), k(3000), k(3400, { s: 1.08 }), k(4000)], 'bottom'),
        T('rabbit', [k(0), ...swing(3100, 3, 200, { x: -3 })]), T('bird', [k(0), k(3100), k(3700, { y: -14 }), k(4400)])],
      cues: cues([400, 'leaves'], [3000, 'lion'], [3500, 'bird']),
      tap: { lion: { tracks: [T('lion', swing(0, 1, 300, { s: 1.06 }))], cues: cues([0, 'lion']) } } },
    { dur: 5000, bed: 'forest', what: L('Little Rabbit hops in and sniffs the carrots. He tilts his head this way and that way, thinking.', 'చిన్ని కుందేలు గెంతుతూ వచ్చి క్యారెట్లను వాసన చూసింది. అటూ ఇటూ తల వంచి ఆలోచిస్తోంది.'),
      tracks: [T('rabbit', [...walk(-140, 0, 2400, 4, 10), k(2900, { r: -6 }), k(3400), k(3900, { r: 6 }), k(4400)], 'bottom'),
        T('c1', dropIn(400, -20)), T('c2', dropIn(800, -20)), T('c3', dropIn(1200, -20))],
      cues: cues([300, 'leaves'], [1200, 'pop'], [2600, 'pop']),
      tap: { ...Object.fromEntries(['c1', 'c2', 'c3'].map((id) => [id, { tracks: [T(id, [k(0), k(600, { s: 0.4, y: -10 })])], cues: cues([0, 'pop']) }])),
        '@done': { tracks: [T('rabbit', hop(0, 2, 12, 300)), T('idea', popIn(0, 600))], cues: cues([0, 'sparkle']) } } },
    { dur: 5000, bed: 'forest', what: L('Rabbit races up to the lion and points far away. The lion tilts his head and listens.', 'కుందేలు పరుగెత్తి సింహం దగ్గరకు వచ్చి దూరంగా చూపించింది. సింహం తల వంచి వింటోంది.'),
      tracks: [T('rabbit', walk(-120, 0, 2200, 5, 12)), T('lion', [k(0), k(2600), k(3100, { r: -8 }), k(3700), k(4300, { r: -8 }), k(4900)], 'bottom'), T('tree', sway(0, 2, 1200, 1.5), 'bottom')],
      cues: cues([200, 'leaves'], [2400, 'pop'], [3100, 'lion']),
      tap: { rabbit: { tracks: [T('rabbit', hop(0, 2, 12, 300))], cues: cues([0, 'pop']) } } },
    { dur: 5500, bed: 'forest', what: L('The lion walks to the well and leans over to peep into the dark water.', 'సింహం బావి దగ్గరకు నడిచి, వంగి చీకటి నీళ్ళలోకి తొంగి చూసింది.'),
      tracks: [T('lion', [...walk(-100, 0, 2200, 4, 5), k(2800, { r: 12 }), k(4000, { r: 12 }), k(4800)], 'bottom'), T('rabbit', [k(0), ...hop(2000, 2, 8, 300)])],
      cues: cues([300, 'leaves'], [2800, 'water'], [4000, 'lion']),
      tap: { well: { tracks: [T('well', swing(0, 2, 250, { sx: 1.02, sy: 0.98 }))], cues: cues([0, 'water'], [500, 'lion']) } } },
    { dur: 6000, bed: 'forest', what: L('The lion leaps into the well. Splash! He scrambles out dripping wet and runs off.', 'సింహం బావిలోకి దూకింది. చప్! తడిసి ముద్దయి బయటకు వచ్చి పరుగు తీసింది.'),
      extras: [X('xs', 'drops', 200, 160, 0.7)],
      tracks: [T('lion', [k(0, { x: -120 }), k(900, { x: -120, y: -30 }), k(1500, { x: -120, y: 10, s: 0.6, o: 0 }), k(2600, { x: -120, y: 10, s: 0.6, o: 0 }), k(3200, { x: -100, y: -10 }), k(4500), k(5000, { y: -8 }), k(5500)]),
        T('xs', [k(0, { s: 0.3, o: 0 }), k(1500, { s: 0.3, o: 0 }), k(1900, { y: -15 }), k(2700, { y: -25, o: 0 })]),
        T('well', [k(0), k(1500), k(1800, { sx: 1.04, sy: 0.96 }), k(2200)], 'bottom')],
      cues: cues([0, 'lion'], [1500, 'splash'], [2700, 'water'], [3300, 'whoosh']),
      tap: { lion: { tracks: [], cues: cues([0, 'lion'], [400, 'whoosh']) } } },
    { dur: 5500, bed: 'forest', what: L('The monkey drops down, the elephant stomps in and the bird flies back. Rabbit jumps for joy.', 'కోతి కిందకు దిగింది, ఏనుగు నడిచి వచ్చింది, పక్షి తిరిగి ఎగిరి వచ్చింది. కుందేలు ఆనందంగా ఎగిరింది.'),
      tracks: [T('monkey', [k(0, { y: -30, o: 0 }), k(500, { y: -30, o: 0 }), k(1200), ...hop(1600, 1, 10, 300)]), T('elephant', walk(140, 0, 2600, 4, 4)),
        T('bird', fly(120, -30, 800, 2600)), T('rabbit', [k(0), ...hop(3000, 2, 14, 400)]), T('tree', sway(0, 2, 1200, 1.5), 'bottom')],
      cues: cues([0, 'birds'], [1200, 'monkey'], [2600, 'elephant'], [3000, 'bird']),
      tap: { monkey: { tracks: [T('monkey', hop(0, 1, 10, 300))], cues: cues([0, 'monkey']) }, bird: { tracks: [T('bird', hop(0, 1, 8, 300))], cues: cues([0, 'bird']) },
        elephant: { tracks: [T('elephant', hop(0, 1, 6, 300))], cues: cues([0, 'elephant']) }, '@done': { tracks: [T('rabbit', hop(0, 2, 14, 300))], cues: cues([0, 'success']) } } },
  ],
  'ant-pigeon': [
    { dur: 5000, bed: 'stream', what: L('A tiny ant marches along the river bank. A pigeon sits up in the tree.', 'ఒక చిన్న చీమ నది ఒడ్డున నడుస్తోంది. పైన చెట్టు మీద ఒక పావురం కూర్చుంది.'),
      tracks: [T('ant', walk(-110, 0, 3000, 6, 3)), T('pigeon', [k(0), ...hop(3400, 1, 6, 300)]), T('tree', sway(0, 2, 1200, 1.2), 'bottom')],
      cues: cues([300, 'birds'], [3400, 'bird']),
      tap: { ant: { tracks: [T('ant', hop(0, 1, 8, 300))], cues: cues([0, 'pop']) } } },
    { dur: 5000, bed: 'stream', what: L('A little wave washes the ant into the river. She bobs up and down, and the pigeon looks down.', 'చిన్న అల చీమను నదిలోకి లాగింది. అది నీళ్ళలో పైకీ కిందికీ ఊగుతోంది, పావురం కిందకు చూసింది.'),
      extras: [X('xs', 'drops', 200, 190, 0.5)],
      tracks: [T('ant', [k(0, { x: -80, y: 36 }), k(1200, { x: -80, y: 36 }), k(1800, { x: -40, y: 16, r: 20 }), k(2400), ...swing(2400, 3, 400, { y: -4 })]),
        T('xs', [k(0, { s: 0.3, o: 0 }), k(2300, { s: 0.3, o: 0 }), k(2600, { y: -12 }), k(3300, { y: -20, o: 0 })]), T('pigeon', [k(0), k(2800), k(3300, { r: -12 }), k(4000)])],
      cues: cues([1200, 'water'], [2300, 'splash'], [3300, 'bird']),
      tap: { ant: { tracks: [T('ant', sway(0, 2, 250, 10))], cues: cues([0, 'splash']) } } },
    { dur: 5000, bed: 'stream', what: L('The ant bobs in the water. Up in the tree, the pigeon sees her and flaps its wings.', 'చీమ నీళ్ళలో ఊగుతోంది. చెట్టు మీద ఉన్న పావురం దాన్ని చూసి రెక్కలు ఆడించింది.'),
      tracks: [T('pigeon', [k(0), k(800, { r: -12 }), k(1600), ...hop(2000, 2, 8, 300)]), T('ant', swing(0, 5, 400, { y: -4 })), T('tree', [k(0), ...sway(2000, 2, 300, 2)], 'bottom')],
      cues: cues([0, 'water'], [800, 'bird'], [2000, 'leaves']),
      tap: { pigeon: { tracks: [T('leaf', [k(0, { x: 110, y: -120, r: -40 }), k(700, { x: 60, y: -70, r: 20 }), k(1400)]), T('ant', [k(0), k(1500), k(1900, { y: -8 }), k(2300)])], cues: cues([0, 'bird'], [1400, 'splash']) } } },
    { dur: 5000, bed: 'stream', what: L('The leaf boat floats to the bank with the ant on top. The ant hops off onto the dry ground.', 'చీమతో ఆకు పడవ ఒడ్డుకు తేలుతూ వచ్చింది. చీమ పొడి నేల మీదకు గెంతింది.'),
      tracks: [T('leaf', [k(0, { x: 60, y: -30 }), k(800, { x: 48, y: -26, r: 4 }), k(1600, { x: 34, y: -18, r: -4 }), k(2400, { x: 18, y: -8, r: 4 }), k(3200)]),
        T('ant', [k(0, { x: 60, y: -30 }), k(800, { x: 48, y: -26, r: 4 }), k(1600, { x: 34, y: -18, r: -4 }), k(2400, { x: 18, y: -8, r: 4 }), k(3200), k(3600, { y: -8 }), k(4000)]),
        T('pigeon', [k(0), ...hop(3800, 1, 8, 300)])],
      cues: cues([0, 'water'], [3200, 'pop'], [3800, 'bird']),
      tap: { ant: { tracks: [T('ant', hop(0, 2, 8, 300))], cues: cues([0, 'sparkle']) } } },
    { dur: 5500, bed: 'garden', what: L('A hunter tiptoes in with a big net. The tiny ant sees him and jumps up.', 'ఒక వేటగాడు పెద్ద వలతో మెల్లగా వచ్చాడు. చిన్ని చీమ అతన్ని చూసి ఎగిరింది.'),
      tracks: [T('hunter', walk(-130, 0, 3000, 5, 4)), T('net', walk(-130, 0, 3000, 5, 4)), T('pigeon', [k(0), ...swing(500, 2, 600, { r: -6 })]),
        T('ant', [k(0), k(3400), k(3800, { y: -8 }), k(4200), k(4600, { y: -8 }), k(5000)]), T('tree', sway(0, 2, 1300, 1.2), 'bottom')],
      cues: cues([300, 'leaves'], [1800, 'leaves'], [3400, 'bird']),
      tap: { net: { tracks: [T('net', sway(0, 2, 250, 8))], cues: cues([0, 'whoosh']) } } },
    { dur: 5500, bed: 'garden', what: L('The ant creeps to the hunter’s foot and nips it. The hunter hops up, and the pigeon flaps free.', 'చీమ మెల్లగా వేటగాడి కాలి దగ్గరకు వెళ్ళి కుట్టింది. వేటగాడు ఎగిరాడు, పావురం రెక్కలు ఆడించింది.'),
      tracks: [T('ant', walk(80, 0, 1800, 4, 3)), T('hunter', [k(0), k(2000), k(2400, { y: -16, r: -8 }), k(2900, { r: 8 }), k(3400)], 'bottom'),
        T('net', [k(0), ...sway(2000, 2, 300, 15)]), T('pigeon', [k(0), ...hop(2600, 2, 10, 300)])],
      cues: cues([0, 'leaves'], [1900, 'pop'], [2300, 'whoosh'], [2700, 'bird']),
      tap: { pigeon: { tracks: [], cues: cues([0, 'bird'], [300, 'whoosh']) } } },
  ],
  'monkey-crocodile': [
    { dur: 5000, bed: 'stream', what: L('The monkey climbs up the jamun tree and sits on a branch. Purple jamuns pop out.', 'కోతి నేరేడు చెట్టు ఎక్కి కొమ్మ మీద కూర్చుంది. ఊదా రంగు నేరేడు పండ్లు కనిపించాయి.'),
      tracks: [T('monkey', [k(0, { x: -40, y: 70 }), k(1200, { x: -40, y: 40 }), k(2200, { x: -10, y: 5 }), k(2800), ...hop(3200, 2, 8, 300)]),
        T('tree', [k(0), ...sway(2800, 1, 400, 2)], 'bottom'), T('j1', popIn(3000, 500)), T('j2', popIn(3300, 500)), T('j3', popIn(3600, 500))],
      cues: cues([300, 'leaves'], [2800, 'monkey'], [3000, 'pop'], [3600, 'pop']),
      tap: { monkey: { tracks: [T('monkey', hop(0, 2, 10, 300))], cues: cues([0, 'monkey']) } } },
    { dur: 5500, bed: 'stream', what: L('A crocodile swims slowly up to the tree. The monkey waves hello from his branch.', 'ఒక మొసలి మెల్లగా ఈదుకుంటూ చెట్టు దగ్గరకు వచ్చింది. కోతి కొమ్మ మీద నుంచి చేయి ఊపింది.'),
      tracks: [T('croc', [k(0, { x: 160 }), k(800, { x: 130, y: -3 }), k(1600, { x: 100 }), k(2400, { x: 70, y: -3 }), k(3200, { x: 40 }), k(4000)]),
        T('monkey', [k(0), ...sway(3800, 2, 300, 10)]), T('j1', popIn(600, 500)), T('j2', popIn(1000, 500)), T('j3', popIn(1400, 500)), T('j4', popIn(1800, 500))],
      cues: cues([0, 'water'], [1600, 'water'], [3800, 'monkey']),
      tap: { ...Object.fromEntries(([['j1', 179, 122], ['j2', 137, 146], ['j3', 105, 130], ['j4', 159, 92]] as const).map(([id, dx, dy]) => [id, {
        tracks: [T(id, [k(0), k(450, { x: Math.round(dx / 2), y: Math.round(dy / 2) - 30 }), k(900, { x: dx, y: dy, s: 0.6 })])], cues: cues([0, 'whoosh'], [900, 'pop']) }])),
        '@done': { tracks: [T('croc', swing(0, 2, 300, { y: -4 }))], cues: cues([0, 'splash']) } } },
    { dur: 5500, bed: 'stream', what: L('The monkey leaps from the tree onto the crocodile’s back. Splash! They bob on the water.', 'కోతి చెట్టు మీద నుంచి మొసలి వీపు మీదకు దూకింది. చప్! రెండూ నీళ్ళలో ఊగుతున్నాయి.'),
      tracks: [T('monkey', [k(0, { x: -110, y: -80 }), k(800, { x: -110, y: -80 }), k(1600, { x: -50, y: -70 }), k(2400), k(2700, { y: 4 }), k(3100), ...swing(3100, 2, 500, { y: -3 })]),
        T('croc', [k(0), k(2400), k(2700, { y: 4 }), k(3100), ...swing(3100, 2, 500, { y: -3 })]), T('tree', [k(0), ...sway(800, 1, 400, 2)], 'bottom')],
      cues: cues([800, 'monkey'], [2400, 'splash'], [3200, 'water']),
      tap: { croc: { tracks: [T('croc', swing(0, 2, 300, { y: -4 })), T('monkey', swing(0, 2, 300, { y: -4 }))], cues: cues([0, 'water']) } } },
    { dur: 5500, bed: 'stream', what: L('In the middle of the river the crocodile stops. The monkey jumps with fright, then scratches his head and thinks.', 'నది మధ్యలో మొసలి ఆగింది. కోతి భయంతో ఎగిరింది, తర్వాత తల గోక్కుంటూ ఆలోచించింది.'),
      tracks: [T('croc', swing(0, 4, 500, { y: -3 })), T('monkey', [...swing(0, 2, 500, { y: -3 }), k(2600, { y: -10 }), k(3000), k(3600, { r: -8 }), k(4200), k(4800, { r: 8 }), k(5400)])],
      cues: cues([0, 'water'], [2200, 'splash'], [2600, 'monkey']),
      tap: { monkey: { tracks: [T('idea', popIn(0, 600)), T('monkey', hop(0, 1, 8, 300))], cues: cues([0, 'sparkle']) } } },
    { dur: 6000, bed: 'stream', what: L('The crocodile swims back to the bank. The monkey leaps off his back, right up into the tree!', 'మొసలి తిరిగి ఒడ్డుకు ఈదింది. కోతి దాని వీపు మీద నుంచి ఒక్క గెంతులో చెట్టు మీదకు దూకింది!'),
      tracks: [T('croc', [k(0, { x: 100 }), k(700, { x: 80, y: -3 }), k(1400, { x: 60 }), k(2100, { x: 40, y: -3 }), k(2800)]),
        T('monkey', [k(0, { x: 225, y: 95 }), k(700, { x: 205, y: 92 }), k(1400, { x: 185, y: 95 }), k(2100, { x: 165, y: 92 }), k(2800, { x: 125, y: 95 }), k(3500, { x: 60, y: 20 }), k(4200)]),
        T('tree', [k(0), ...sway(4200, 2, 300, 2)], 'bottom')],
      cues: cues([0, 'water'], [1400, 'water'], [2900, 'whoosh'], [4200, 'leaves'], [4500, 'monkey']),
      tap: { monkey: { tracks: [T('monkey', hop(0, 2, 10, 300))], cues: cues([0, 'monkey']) } } },
    { dur: 5000, bed: 'stream', what: L('Safe in his tree, the monkey swings happily. Three jamuns appear, and the crocodile floats far away.', 'చెట్టు మీద క్షేమంగా కోతి సంతోషంగా ఊగుతోంది. మూడు నేరేడు పండ్లు కనిపించాయి, మొసలి దూరంగా తేలుతోంది.'),
      tracks: [T('croc', swing(0, 4, 500, { y: -3 })), T('monkey', [k(0), ...sway(500, 2, 500, 10)]), T('j1', popIn(1500, 500)), T('j2', popIn(2000, 500)), T('j3', popIn(2500, 500)),
        T('tree', sway(0, 2, 1200, 1.5), 'bottom')],
      cues: cues([0, 'birds'], [600, 'monkey'], [1500, 'pop'], [2500, 'pop']),
      tap: { ...Object.fromEntries(['j1', 'j2', 'j3'].map((id) => [id, { tracks: [T(id, hop(0, 1, 8, 300))], cues: cues([0, 'pop']) }])),
        '@done': { tracks: [T('monkey', hop(0, 2, 10, 300))], cues: cues([0, 'success']) } } },
  ],
  'elephant-bath': [
    { dur: 5500, bed: 'forest', what: L('Little Elephant stomps into the mud and wiggles about. Splosh! Mud flies everywhere.', 'చిన్ని ఏనుగు బురదలోకి దిగి అటూ ఇటూ దొర్లింది. పచ్! బురద అంతటా ఎగిరింది.'),
      extras: [X('xm1', 'mud', 205, 198, 0.25), X('xm2', 'mud', 265, 192, 0.25)],
      tracks: [T('baby', [...walk(120, 0, 2500, 4, 6), ...sway(2800, 3, 300, 10)], 'bottom'), T('pool', [k(0), k(2500), k(2800, { sx: 1.1, sy: 0.85 }), k(3300)], 'bottom'),
        T('xm1', [k(0, { s: 0.3, o: 0 }), k(2900, { s: 0.3, o: 0 }), k(3300, { x: -12, y: -24 }), k(4000, { x: -20, o: 0 })]),
        T('xm2', [k(0, { s: 0.3, o: 0 }), k(3100, { s: 0.3, o: 0 }), k(3500, { x: 12, y: -24 }), k(4200, { x: 20, o: 0 })]), T('tree', sway(0, 2, 1300, 1.2), 'bottom')],
      cues: cues([300, 'elephant'], [2700, 'splash'], [3300, 'splash'], [4600, 'elephant']),
      tap: { baby: { tracks: [T('baby', sway(0, 2, 300, 8))], cues: cues([0, 'splash']) } } },
    { dur: 5500, bed: 'stream', what: L('Big Mother Elephant walks into the river. Little Elephant trots behind her. Splash!', 'పెద్ద అమ్మ ఏనుగు నదిలోకి నడిచింది. చిన్ని ఏనుగు వెనకాలే పరుగెత్తింది. చప్!'),
      tracks: [T('mother', walk(160, 0, 3000, 5, 4)), T('baby', walk(200, 300, 3300, 6, 6))],
      cues: cues([0, 'elephant'], [1500, 'water'], [3300, 'splash']),
      tap: { mother: { tracks: [T('mother', swing(0, 1, 400, { s: 1.05 }))], cues: cues([0, 'elephant']) } } },
    { dur: 5000, bed: 'stream', what: L('Little Elephant dips his trunk into the river, then lifts it high. Whoosh! Water sprays out.', 'చిన్ని ఏనుగు తొండాన్ని నదిలో ముంచి పైకి ఎత్తింది. బుష్! నీళ్ళు చిమ్మాయి.'),
      extras: [X('xs', 'drops', 172, 118, 0.8)],
      tracks: [T('baby', [k(0), k(800, { r: -12 }), k(1800, { r: -12 }), k(2600, { r: 8 }), k(3400)], 'bottom'), T('xs', [k(0, { y: 20, o: 0 }), k(2600, { y: 20, o: 0 }), k(3000), k(4000, { y: 30, o: 0 })])],
      cues: cues([800, 'water'], [2600, 'splash'], [3400, 'elephant']),
      tap: { baby: { tracks: [T('shower', [k(0, { y: 20, o: 0 }), k(400), k(1600, { y: 20 })])], cues: cues([0, 'splash'], [300, 'water']) } } },
    { dur: 5000, bed: 'stream', what: L('Water rains down on Little Elephant. He sways happily, still covered in mud spots.', 'చిన్ని ఏనుగు మీద నీళ్ళు జల్లుగా పడుతున్నాయి. బురద మచ్చలతోనే అది సంతోషంగా ఊగుతోంది.'),
      extras: [X('xr1', 'drops', 180, 110, 0.6), X('xr2', 'drops', 250, 115, 0.6)],
      tracks: [...['baby', 's1', 's2', 's3', 's4'].map((id) => T(id, [k(0), ...swing(500, 2, 500, { y: -3 })])), fall('xr1', 300), fall('xr2', 1500)],
      cues: cues([300, 'water'], [1500, 'water'], [3000, 'elephant']),
      tap: { ...Object.fromEntries(['s1', 's2', 's3', 's4'].map((id) => [id, { tracks: [T(id, [k(0), k(600, { s: 0.4, r: 60 })])], cues: cues([0, 'splash']) }])),
        '@done': { tracks: [T('baby', hop(0, 2, 10, 300))], cues: cues([0, 'sparkle']) } } },
    { dur: 5500, bed: 'stream', what: L('Three fish swim in one after another. The duck bobs on the water and Little Elephant swings his trunk.', 'మూడు చేపలు ఒకదాని వెనక ఒకటి ఈదుతూ వచ్చాయి. బాతు నీళ్ళ మీద ఊగుతోంది, చిన్ని ఏనుగు తొండం ఊపింది.'),
      tracks: [...(['f1', 'f2', 'f3'] as const).map((id, i) => { const d = i * 400; return T(id, [k(0, { x: 200, o: 0 }), k(d, { x: 200, o: 0 }), k(d + 700, { x: 160, y: -4 }), k(d + 1400, { x: 120 }), k(d + 2100, { x: 80, y: -4 }), k(d + 2800, { x: 40 }), k(d + 3500)]); }),
        T('duck', swing(0, 3, 500, { y: -3 })), T('baby', [k(0), ...sway(3800, 2, 300, 6)], 'bottom')],
      cues: cues([500, 'water'], [2000, 'duck'], [3800, 'elephant']),
      tap: { ...Object.fromEntries(['f1', 'f2', 'f3'].map((id) => [id, { tracks: [T(id, hop(0, 1, 8, 300))], cues: cues([0, 'splash']) }])),
        '@done': { tracks: [T('duck', hop(0, 2, 8, 300))], cues: cues([0, 'duck']) } } },
    { dur: 5000, bed: 'garden', what: L('Clean Little Elephant trots back to the garden and jumps for joy. Mother Elephant nods.', 'శుభ్రమైన చిన్ని ఏనుగు తోటలోకి పరుగెత్తి ఆనందంగా ఎగిరింది. అమ్మ ఏనుగు తల ఊపింది.'),
      tracks: [T('baby', [...walk(100, 0, 2000, 4, 6), ...hop(2600, 2, 10, 350)]), T('mother', [k(0), ...sway(2200, 2, 400, 4)], 'bottom'), T('flower', sway(0, 2, 1000, 4), 'bottom')],
      cues: cues([0, 'birds'], [2400, 'elephant'], [3000, 'sparkle']),
      tap: { baby: { tracks: [T('sp1', popIn(0, 600)), T('sp2', popIn(300, 600))], cues: cues([0, 'sparkle'], [400, 'elephant']) } } },
  ],
  'night-sky': [
    { dur: 6000, bed: 'breeze', what: L('The sun slides slowly down towards the hills. Two birds fly home to the tree.', 'సూర్యుడు మెల్లగా కొండల వైపు దిగుతున్నాడు. రెండు పక్షులు చెట్టు వైపు ఇంటికి ఎగిరి వెళ్ళాయి.'),
      tracks: [T('sun', [k(0, { y: -90 }), k(4500)]), T('b1', fly(200, -30, 500, 3000)), T('b2', fly(220, -20, 1000, 3600)), T('tree', sway(0, 2, 1400, 1.2), 'bottom')],
      cues: cues([300, 'birds'], [2500, 'bird'], [4500, 'crickets']),
      tap: { sun: { tracks: [T('sun', swing(0, 1, 400, { s: 1.06 }))], cues: cues([0, 'bell']) } } },
    { dur: 5000, bed: 'night', what: L('The moon rises slowly over the sleepy village and glows softly. The house lights are on.', 'నిద్రపోతున్న ఊరి మీద చందమామ మెల్లగా పైకి వచ్చి వెలుగుతోంది. ఇంట్లో దీపాలు వెలుగుతున్నాయి.'),
      extras: [X('xglow', 'glow', 200, 80, 1.3, { back: true })],
      tracks: [T('moon', [k(0, { y: 70, o: 0.3 }), k(3500)]), T('xglow', [k(0, { o: 0 }), k(3500, { o: 0.6 })]), T('tree', sway(0, 2, 1200, 1), 'bottom')],
      cues: cues([300, 'crickets'], [3500, 'sparkle']),
      tap: { moon: { tracks: [T('moon', swing(0, 1, 400, { s: 1.06 }))], cues: cues([0, 'sparkle']) } } },
    { dur: 5000, bed: 'night', what: L('Five stars pop out one by one and twinkle. The moon rocks gently.', 'ఐదు చుక్కలు ఒక్కొక్కటిగా కనిపించి మిణుకుమంటున్నాయి. చందమామ మెల్లగా ఊగింది.'),
      tracks: [...['s1', 's2', 's3', 's4', 's5'].map((id, i) => T(id, popIn(500 + i * 600, 600))), T('moon', [k(0), ...sway(3600, 1, 400, 5)])],
      cues: cues([500, 'sparkle'], [1100, 'pop'], [1700, 'sparkle'], [2300, 'pop'], [2900, 'sparkle']),
      tap: { ...Object.fromEntries(['s1', 's2', 's3', 's4', 's5'].map((id) => [id, { tracks: [T(id, swing(0, 1, 300, { s: 1.25 }))], cues: cues([0, 'sparkle']) }])),
        '@done': { tracks: [T('moon', sway(0, 1, 400, 6))], cues: cues([0, 'bell']) } } },
    { dur: 5000, bed: 'night', what: L('The owl turns its head left and right. Its big round eyes blink in the dark.', 'గుడ్లగూబ తలను ఎడమకూ కుడికీ తిప్పింది. చీకట్లో దాని పెద్ద గుండ్రని కళ్ళు రెప్ప వేస్తున్నాయి.'),
      tracks: [T('owl', [k(0), k(800, { r: -12 }), k(1600), k(2400, { r: 12 }), k(3200)]), T('tree', sway(0, 2, 1200, 1), 'bottom')],
      cues: cues([500, 'owl'], [2000, 'crickets'], [3500, 'owl']),
      tap: { owl: { tracks: [T('owl', hop(0, 1, 8, 300))], cues: cues([0, 'owl']) } } },
    { dur: 6000, bed: 'night', what: L('Amma rocks gently and sings a lullaby. Priya yawns, and her eyes slowly close.', 'అమ్మ మెల్లగా ఊగుతూ జోల పాడింది. ప్రియ ఆవలించి మెల్లగా కళ్ళు మూసుకుంది.'),
      init: { sleepbed: 'awake' }, sets: [{ t: 3600, actor: 'sleepbed', v: 'sleep' }],
      tracks: [T('mother', sway(0, 3, 800, 4), 'bottom'), T('sleepbed', [k(0), ...swing(500, 2, 1200, { sy: 1.02 })], 'bottom'), T('lamp', swing(0, 3, 600, { s: 1.04 }), 'bottom')],
      cues: cues([400, 'bell'], [2000, 'bell'], [3600, 'crickets']),
      tap: { lamp: { tracks: [], cues: cues([0, 'click']) } } },
    { dur: 5000, bed: 'night', what: L('The moon rocks softly and the stars twinkle. Everyone in the village is going to sleep.', 'చందమామ మెల్లగా ఊగుతోంది, చుక్కలు మిణుకుమంటున్నాయి. ఊళ్ళో అందరూ నిద్రపోతున్నారు.'),
      tracks: [T('moon', sway(0, 2, 1000, 3)), T('s1', [k(0), ...swing(300, 2, 500, { s: 1.2 })]), T('s2', [k(0), ...swing(800, 2, 500, { s: 1.2 })]), T('s3', [k(0), ...swing(1300, 2, 500, { s: 1.2 })])],
      cues: cues([500, 'crickets'], [2500, 'sparkle'], [4000, 'owl']),
      tap: { house: { tracks: [], cues: cues([0, 'click']) } } },
  ],
  'sankranti-kites': [
    { dur: 5000, bed: 'garden', what: L('Amma bends down and puts white dots and lines on the ground. A round muggu appears.', 'అమ్మ వంగి నేల మీద తెల్లని చుక్కలు, గీతలు పెట్టింది. గుండ్రని ముగ్గు కనిపించింది.'),
      init: { rangoli: 'blank' }, sets: [{ t: 1800, actor: 'rangoli', v: 'dots' }],
      tracks: [T('mother', [k(0), k(600, { r: 12 }), k(2800, { r: 12 }), k(3600)], 'bottom'), T('rangoli', [k(0), k(1800), k(2200, { s: 1.05 }), k(2700)])],
      cues: cues([300, 'birds'], [1800, 'sparkle'], [3600, 'bell']),
      tap: { rangoli: { tracks: [T('rangoli', swing(0, 1, 400, { s: 1.05 }))], cues: cues([0, 'sparkle']) } } },
    { dur: 5000, bed: 'garden', what: L('Three kites float down, one by one: red, blue and yellow. Raju and Sita jump with joy.', 'మూడు గాలిపటాలు ఒక్కొక్కటిగా వచ్చాయి: ఎరుపు, నీలం, పసుపు. రాజు, సీత ఆనందంగా ఎగిరారు.'),
      tracks: [T('k1', dropIn(600, -30)), T('k2', dropIn(1200, -30)), T('k3', dropIn(1800, -30)), T('child', [k(0), ...hop(2800, 1, 10, 350)]), T('child2', [k(0), ...hop(3100, 1, 10, 350)])],
      cues: cues([600, 'pop'], [1200, 'pop'], [1800, 'pop'], [2800, 'sparkle']),
      tap: { ...Object.fromEntries(['k1', 'k2', 'k3'].map((id) => [id, { tracks: [T(id, sway(0, 1, 300, 10))], cues: cues([0, 'whoosh']) }])),
        '@done': { tracks: [T('child', hop(0, 2, 10, 300)), T('child2', hop(0, 2, 10, 300))], cues: cues([0, 'success']) } } },
    { dur: 6000, bed: 'breeze', what: L('The wind catches the red kite. It dips and swoops, then climbs high into the sky.', 'గాలి ఎర్ర గాలిపటాన్ని పట్టుకుంది. అది కిందకు వంగి, మళ్ళీ ఆకాశంలో పైపైకి ఎగిరింది.'),
      tracks: [T('kite', [k(0, { x: -115, y: 45, r: -20 }), k(1500, { x: -60, y: 20, r: 10 }), k(3000, { x: -20, y: -10, r: -8 }), k(4200, { r: 6 }), k(5200)]),
        T('child', [k(0), k(1500, { r: -6 }), k(3000), ...hop(3400, 1, 8, 350)], 'bottom'), T('cloud', [k(0, { x: -40 }), k(6000)])],
      cues: cues([0, 'wind'], [1500, 'whoosh'], [3500, 'breeze']),
      tap: { kite: { tracks: [T('kite', sway(0, 2, 350, 10))], cues: cues([0, 'whoosh']) } } },
    { dur: 6000, bed: 'breeze', what: L('Kites of many colours rise up from the rooftops and dance in the breeze.', 'ఎన్నో రంగుల గాలిపటాలు ఇళ్ళ పైనుంచి పైకి ఎగిరి గాలిలో నాట్యం చేస్తున్నాయి.'),
      tracks: [...['k1', 'k2', 'k3', 'k4', 'k5'].map((id, i) => T(id, [k(0, { y: 40, o: 0 }), k(i * 300, { y: 40, o: 0 }), k(i * 300 + 1500), ...sway(i * 300 + 1500, 2, 500, 8)])),
        T('child', [k(0), k(1500, { r: -6 }), k(2500), ...hop(3000, 1, 8, 350)], 'bottom')],
      cues: cues([0, 'breeze'], [1500, 'whoosh'], [3000, 'birds']),
      tap: { ...Object.fromEntries(['k1', 'k2', 'k3', 'k4', 'k5'].map((id) => [id, { tracks: [T(id, swing(0, 1, 300, { y: -10 }))], cues: cues([0, 'whoosh']) }])),
        '@done': { tracks: [T('child', hop(0, 2, 10, 300))], cues: cues([0, 'success']) } } },
    { dur: 5000, bed: 'garden', what: L('The decorated cow walks in, its bell going ding-ding. The girl claps and jumps.', 'అలంకరించిన ఆవు గంట గణగణలాడిస్తూ నడిచి వచ్చింది. పాప చప్పట్లు కొట్టి ఎగిరింది.'),
      tracks: [T('cow', walk(140, 0, 3000, 4, 4)), T('child', [k(0), ...hop(3400, 2, 10, 350)])],
      cues: cues([300, 'bell'], [1500, 'bell'], [3100, 'cow'], [3500, 'drum']),
      tap: { cow: { tracks: [T('cow', swing(0, 2, 250, { r: 3 }))], cues: cues([0, 'bell'], [500, 'cow']) } } },
    { dur: 5000, bed: 'fire', what: L('Grandma stirs the pongal pot. Steam rises and the pot bubbles. Raju comes running.', 'నానమ్మ పొంగలి కుండ కలుపుతోంది. ఆవిరి పైకి లేస్తోంది, కుండ పొంగుతోంది. రాజు పరుగెత్తుకుంటూ వచ్చాడు.'),
      extras: [X('xst', 'cloud', 215, 140, 0.35)],
      tracks: [T('grandma', sway(0, 3, 500, 5), 'bottom'), T('pot', [k(0), ...swing(1500, 3, 300, { sy: 1.04 })], 'bottom'), T('child', walk(120, 0, 2400, 4, 6)),
        T('xst', [k(0, { y: 10, o: 0 }), k(1200, { y: 10, o: 0 }), k(2000, { y: -5, o: 0.8 }), k(3200, { y: -25, o: 0 })])],
      cues: cues([0, 'fire'], [1500, 'bell'], [3000, 'pop']),
      tap: { pot: { tracks: [T('pot', swing(0, 2, 250, { sy: 1.06 }))], cues: cues([0, 'pop'], [400, 'sparkle']) } } },
  ],
  'fishing-boat': [
    { dur: 5500, bed: 'sea', what: L('Somu and Nanna push the boat from the sand into the waves. It bobs on the water.', 'సోము, నాన్న ఇసుక మీద నుంచి పడవను అలల్లోకి తోశారు. అది నీళ్ళ మీద ఊగుతోంది.'),
      tracks: [T('boat', [k(0, { x: -90, y: 50 }), k(1000, { x: -90, y: 50 }), k(3000), ...swing(3000, 2, 500, { y: -3, r: 2 })]),
        T('father', [k(0), k(1000, { r: 10 }), k(3000, { x: 30, r: 10 }), k(4000)], 'bottom'), T('child', [k(0), ...hop(3200, 2, 10, 350)])],
      cues: cues([0, 'sea'], [1000, 'splash'], [3000, 'boat'], [3600, 'bird']),
      tap: { boat: { tracks: [T('boat', sway(0, 2, 300, 3))], cues: cues([0, 'boat']) } } },
    { dur: 4500, bed: 'sea', what: L('Somu walks up to his orange life jacket. It hops, as if to say: wear me!', 'సోము తన నారింజ రంగు లైఫ్ జాకెట్ దగ్గరకు నడిచాడు. అది ‘నన్ను వేసుకో!’ అన్నట్టు గెంతింది.'),
      tracks: [T('child', walk(-100, 0, 2000, 3, 6)), T('jacket', [k(0), ...hop(2200, 2, 8, 300)])],
      cues: cues([0, 'sea'], [2200, 'pop']),
      tap: { child: { tracks: [T('child', hop(0, 1, 10, 300))], cues: cues([0, 'snap'], [400, 'sparkle']) } } },
    { dur: 6000, bed: 'sea', what: L('The boat rocks up and down on the big waves. Nanna holds on and gets the net ready.', 'పెద్ద అలల మీద పడవ పైకీ కిందికీ ఊగుతోంది. నాన్న గట్టిగా పట్టుకుని వలను సిద్ధం చేశాడు.'),
      tracks: [T('boat', swing(0, 5, 500, { y: -4, r: 3 }, true)), T('father', swing(0, 5, 500, { y: -4, r: 3 }, true))],
      cues: cues([0, 'sea'], [1500, 'boat'], [3500, 'sea']),
      tap: { boat: { tracks: [T('net', [k(0, { x: -110, y: -50, s: 0.4 }), k(700, { x: -50, y: -40, s: 0.8 }), k(1400)])], cues: cues([0, 'whoosh'], [1400, 'splash']) } } },
    { dur: 5000, bed: 'sea', what: L('Nanna pulls the net up out of the water. Five fish wiggle inside it.', 'నాన్న వలను నీళ్ళలోంచి పైకి లాగాడు. అందులో ఐదు చేపలు గిలగిల కొట్టుకుంటున్నాయి.'),
      tracks: [T('net', [k(0, { y: 40 }), k(2500)]), ...['f1', 'f2', 'f3', 'f4', 'f5'].map((id, i) => T(id, [k(0, { y: 40 }), k(2500), ...sway(2500 + i * 150, 2, 300, 10)]))],
      cues: cues([0, 'sea'], [2500, 'splash'], [3000, 'water']),
      tap: { ...Object.fromEntries(['f1', 'f2', 'f3', 'f4', 'f5'].map((id) => [id, { tracks: [T(id, sway(0, 1, 250, 15))], cues: cues([0, 'splash']) }])),
        '@done': { tracks: [], cues: cues([0, 'success']) } } },
    { dur: 5000, bed: 'sea', what: L('Somu holds the tiny fish gently and lowers it into the sea. Splash! It wiggles its tail.', 'సోము చిన్న చేపను మెల్లగా పట్టుకుని సముద్రంలో వదిలాడు. చప్! అది తోక ఆడించింది.'),
      tracks: [T('fish', [k(0, { x: -120, y: -45 }), k(1200, { x: -120, y: -45 }), k(2200, { x: -60, y: -60 }), k(3000), ...sway(3000, 2, 250, 12)]),
        T('child', [k(0), k(1200, { r: 10 }), k(2400), ...swing(2800, 2, 500, { y: -3 })], 'bottom'), T('boat', [k(0), ...swing(2800, 2, 500, { y: -3 })])],
      cues: cues([0, 'sea'], [3000, 'splash'], [3500, 'water']),
      tap: { fish: { tracks: [T('fish', sway(0, 2, 250, 15))], cues: cues([0, 'splash']) } } },
    { dur: 5500, bed: 'sea', what: L('The sun sinks low as the boat sails back to the beach. Amma waves to welcome them.', 'సూర్యుడు కిందకు దిగుతుండగా పడవ ఒడ్డుకు తిరిగి వచ్చింది. అమ్మ చేయి ఊపి స్వాగతం పలికింది.'),
      tracks: [T('boat', [k(0, { x: 160 }), k(3500), ...swing(3500, 1, 500, { y: -3 })]), T('sun', [k(0, { y: -30 }), k(5000)]), T('mother', [k(0), ...sway(3500, 2, 350, 6)], 'bottom')],
      cues: cues([0, 'sea'], [1500, 'bird'], [3000, 'boat'], [3800, 'birds']),
      tap: { mother: { tracks: [T('mother', hop(0, 2, 10, 300))], cues: cues([0, 'sparkle']) } } },
  ],
  'farm-morning': [
    { dur: 5500, bed: 'garden', what: L('The sun comes up behind the hills. The rooster struts in, stretches tall and crows.', 'కొండల వెనక నుంచి సూర్యుడు ఉదయించాడు. కోడిపుంజు నడిచి వచ్చి నిటారుగా నిలబడి కూసింది.'),
      tracks: [T('sun', [k(0, { y: 60, s: 0.85 }), k(2500)]), T('rooster', [...walk(130, 0, 2400, 4, 5), k(3000), k(3400, { sy: 1.1 }), k(4200)], 'bottom')],
      cues: cues([300, 'birds'], [3000, 'rooster']),
      tap: { rooster: { tracks: [T('rooster', hop(0, 1, 10, 300))], cues: cues([0, 'rooster']) } } },
    { dur: 5500, bed: 'garden', what: L('Lakshmi puts down fresh grass. The big cow munches, and the small calf trots over.', 'లక్ష్మి పచ్చగడ్డి వేసింది. పెద్ద ఆవు మేస్తోంది, చిన్న దూడ పరుగెత్తుకుంటూ వచ్చింది.'),
      tracks: [T('calf', walk(120, 0, 2600, 5, 5)), T('cow', [k(0), ...swing(500, 3, 500, { r: 4 })], 'bottom'), T('grass', dropIn(800, -30)), T('child', [k(0), k(600, { r: 10 }), k(1400)], 'bottom')],
      cues: cues([300, 'cow'], [1200, 'leaves'], [3000, 'cow']),
      tap: { calf: { tracks: [T('calf', hop(0, 1, 10, 300))], cues: cues([0, 'cow']) } } },
    { dur: 5500, bed: 'garden', what: L('Mother Hen walks along, and four little chicks hurry after her in a row.', 'అమ్మ కోడి నడుస్తోంది, నాలుగు చిన్న కోడిపిల్లలు వరుసగా వెనకాలే పరుగెత్తాయి.'),
      tracks: [T('hen', walk(150, 0, 2800, 5, 5)), ...['c1', 'c2', 'c3', 'c4'].map((id, i) => T(id, walk(150, 300 + i * 200, 3000 + i * 200, 6, 6)))],
      cues: cues([300, 'hen'], [1500, 'bird'], [3200, 'hen']),
      tap: { ...Object.fromEntries(['c1', 'c2', 'c3', 'c4'].map((id) => [id, { tracks: [T(id, hop(0, 1, 8, 250))], cues: cues([0, 'bird']) }])),
        '@done': { tracks: [T('hen', hop(0, 2, 8, 300))], cues: cues([0, 'hen']) } } },
    { dur: 6000, bed: 'garden', what: L('Tatayya drives the green tractor across the field. Chug, chug! Little clods of mud fly up.', 'తాతయ్య పచ్చని ట్రాక్టర్‌ను పొలంలో నడిపాడు. టక టక! చిన్న మట్టి గడ్డలు ఎగిరాయి.'),
      extras: [X('xm', 'mud', 150, 225, 0.25)],
      tracks: [...['tractor', 'grandpa'].map((id) => T(id, [k(0, { x: 200 }), k(800, { x: 170, y: -3 }), k(1600, { x: 130 }), k(2400, { x: 90, y: -3 }), k(3200, { x: 50 }), k(4000, { x: 10, y: -3 }), k(4600)])),
        T('xm', [k(0, { o: 0 }), k(3400, { o: 0 }), k(3800, { x: -10, y: -10 }), k(4600, { x: -20, o: 0 })])],
      cues: cues([0, 'tractor'], [2400, 'tractor'], [4600, 'birds']),
      tap: { tractor: { tracks: ['tractor', 'grandpa'].map((id) => T(id, [k(0), k(1200, { x: -60 }), k(2400)])), cues: cues([0, 'tractor']) } } },
    { dur: 5000, bed: 'garden', what: L('Three goats nibble the green grass, nodding their heads up and down. A bee buzzes by.', 'మూడు మేకలు తల ఊపుతూ పచ్చగడ్డి మేస్తున్నాయి. ఒక తేనెటీగ ఝుమ్మని ఎగిరింది.'),
      tracks: ['g1', 'g2', 'g3'].map((id, i) => T(id, [k(0), ...swing(i * 400, 2, 500, { r: 6 })], 'bottom')),
      cues: cues([300, 'goat'], [1800, 'goat'], [3000, 'bee']),
      tap: { ...Object.fromEntries(['g1', 'g2', 'g3'].map((id) => [id, { tracks: [T(id, hop(0, 1, 10, 300))], cues: cues([0, 'goat']) }])),
        '@done': { tracks: [], cues: cues([0, 'success']) } } },
    { dur: 5000, bed: 'garden', what: L('The farmer walks in from the fields with fresh corn. The girl jumps up to say thank you.', 'రైతు పొలం నుంచి తాజా మొక్కజొన్నతో నడిచి వచ్చాడు. పాప ఎగిరి ధన్యవాదాలు చెప్పింది.'),
      tracks: [T('farmer', walk(-120, 0, 2400, 4, 5)), T('corn', dropIn(1500, -20)), T('child', [k(0), ...hop(2800, 2, 10, 350)])],
      cues: cues([300, 'birds'], [1500, 'pop'], [2800, 'bell']),
      tap: { farmer: { tracks: [T('farmer', swing(0, 1, 400, { r: 5 }))], cues: cues([0, 'success']) } } },
  ],
};
