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
    { dur: 6000, what: L('The hot sun shines. The tired crow hops in and droops its head. It wants water.', 'వేడి సూర్యుడు మెరుస్తున్నాడు. అలసిన కాకి గెంతుతూ వచ్చి తల వాల్చింది. దానికి నీళ్ళు కావాలి.'),
      tracks: [T('sun', [k(0, { y: 24, s: 0.9 }), k(1800), ...swing(1800, 2, 800, { s: 1.06 })]), T('tree', sway(0, 2, 1500, 1.5), 'bottom'),
        T('crow', [...walk(-150, 400, 3000, 4, 8), ...sway(3000, 1, 700, -10).slice(0, 3), k(4400), k(5100, { r: -10 }), k(5800)])],
      cues: cues([300, 'wind'], [3700, 'crow']),
      tap: { sun: { tracks: [], cues: cues([0, 'wind']) } } },
    { dur: 5500, what: L('The crow flies down to a pot and peeps in. The water is far down at the bottom.', 'కాకి ఎగురుతూ కుండ దగ్గరకు వచ్చి లోపలికి చూసింది. నీళ్ళు బాగా అడుగున ఉన్నాయి.'),
      tracks: [T('crow', [...fly(-160, -110, 0, 2200, -10), ...hop(2400, 1, 8), k(3600, { r: -10 }), k(4300)]), T('pot', [k(0), k(4200), k(4500, { r: 2 }), k(4800, { r: -2 }), k(5100)])],
      cues: cues([0, 'whoosh'], [400, 'crow'], [4200, 'water']),
      tap: { pot: { tracks: [], cues: cues([0, 'water']) } } },
    { dur: 5000, what: L('The crow carries a pebble over the pot and drops it in. Plop! Now you drop the other pebbles.', 'కాకి ఒక గులకరాయిని తెచ్చి కుండలో వేసింది. టప్! ఇప్పుడు మిగతా రాళ్ళు నువ్వు వెయ్యి.'),
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
    { dur: 6000, what: L('The water rises up to the top. The crow flies onto the pot, dips its beak and drinks.', 'నీళ్ళు పైకి వచ్చాయి. కాకి కుండ మీద వాలి ముక్కు ముంచి నీళ్ళు తాగింది.'),
      init: { pot: '2' }, sets: [{ t: 600, actor: 'pot', v: '3' }, { t: 1600, actor: 'pot', v: '4' }],
      tracks: [T('crow', [...fly(-120, -70, 0, 2200), k(3000, { r: -14 }), k(3600), k(4300, { r: -14 }), k(4900)])],
      cues: cues([100, 'crow'], [600, 'water'], [3000, 'splash']),
      tap: { crow: { tracks: [], cues: cues([0, 'crow']) } } },
    { dur: 4500, what: L('The happy crow hops two times and flaps. The sun smiles and the tree sways.', 'సంతోషంగా కాకి రెండు సార్లు గెంతింది. సూర్యుడు నవ్వాడు, చెట్టు ఊగింది.'),
      tracks: [T('crow', [...hop(0, 2, 14, 550), k(2900, { r: 6 }), k(3600)]), T('sun', [k(0, { y: 16 }), k(2000)]), T('tree', sway(0, 2, 1100, 1.5), 'bottom')],
      cues: cues([600, 'crow'], [1500, 'birds']) },
  ],
  'mango-tree': [
    { dur: 5000, what: L('Meena walks into the garden. She bends down and drops a mango seed into the soil.', 'మీనా తోటలోకి నడిచి వచ్చింది. వంగి మామిడి టెంకను మట్టిలో వేసింది.'),
      tracks: [T('child', [...walk(-120, 0, 2400, 4, 6), k(2900, { r: 10 }), k(3700)], 'bottom'),
        T('seed', [k(0, { x: -129, y: -58, o: 0 }), k(2600, { x: -129, y: -58, o: 0 }), k(2900, { x: -129, y: -58 }), k(3400, { x: -65, y: -80 }), k(3900), k(4200, { sx: 1.1, sy: 0.85 }), k(4600)], 'bottom')],
      cues: cues([300, 'birds'], [3900, 'pop']),
      tap: { seed: { tracks: [T('water', [k(0, { y: -30, o: 0 }), k(300, { y: -30 }), k(1300)])], cues: cues([0, 'water']) } } },
    { dur: 4500, what: L('The sun rises and warms the soil. The seed wiggles. Something is waking up!', 'సూర్యుడు ఉదయించి మట్టిని వేడి చేశాడు. విత్తనం కదిలింది. ఏదో మేలుకుంటోంది!'),
      tracks: [T('sun', [k(0, { y: 40, s: 0.85 }), k(2400), k(3000, { s: 1.06 }), k(3600)]), T('seed', [k(0), ...sway(2600, 2, 300, 6)])],
      cues: cues([300, 'birds']),
      tap: { sun: { tracks: [T('sprout', [k(0, { s: 0.2 }), k(1500)], 'bottom')], cues: cues([0, 'sparkle']) } } },
    { dur: 6000, what: L('A grey cloud floats over. Raindrops fall on the little plant and it sways.', 'బూడిద రంగు మేఘం తేలుతూ వచ్చింది. చిన్న మొక్క మీద వాన చినుకులు పడ్డాయి, అది ఊగింది.'),
      extras: [X('xr1', 'drops', 180, 130, 0.6), X('xr2', 'drops', 260, 140, 0.6)],
      tracks: [T('cloud', [k(0, { x: 150 }), k(2500)]), fall('xr1', 2300), fall('xr2', 2700), T('tree', [k(0), ...sway(3500, 2, 600, 2)], 'bottom')],
      cues: cues([2300, 'rain']),
      tap: { cloud: { tracks: [T('drops', [k(0, { y: -30 }), k(1500)])], cues: cues([0, 'rain']) } } },
    { dur: 5000, what: L('The plant grows taller and taller into a big mango tree. Meena jumps for joy.', 'మొక్క పెరిగి పెరిగి పెద్ద మామిడి చెట్టు అయ్యింది. మీనా సంతోషంగా ఎగిరింది.'),
      tracks: [T('tree', [k(0, { s: 0.6 }), k(3000), ...sway(3000, 1, 600, 1.5)], 'bottom'), T('child', [k(0), ...hop(3000, 1, 10, 400)])],
      cues: cues([200, 'leaves'], [3000, 'birds']),
      tap: { tree: { tracks: [], cues: cues([0, 'leaves']) } } },
    { dur: 4500, what: L('One by one, four yellow mangoes appear on the tree. Meena hops.', 'ఒక్కొక్కటిగా నాలుగు పసుపు మామిడి పండ్లు చెట్టుకు కనిపించాయి. మీనా గెంతింది.'),
      tracks: [T('m1', popIn(500)), T('m2', popIn(1200)), T('m3', popIn(1900)), T('m4', popIn(2600)), T('child', [k(0), ...hop(3500)])],
      cues: cues([500, 'pop'], [1200, 'pop'], [1900, 'pop'], [2600, 'pop']),
      tap: { '@done': { tracks: [T('child', hop(0, 2, 10, 300))], cues: cues([0, 'success']) } } },
    { dur: 4500, what: L('Meena hands a mango to her friend. Her friend jumps happily.', 'మీనా తన స్నేహితుడికి మామిడి పండు ఇచ్చింది. స్నేహితుడు సంతోషంగా ఎగిరాడు.'),
      tracks: [T('mango', [k(0, { x: -55, y: -15 }), k(800, { x: -55, y: -15 }), k(2000)]), T('child2', [k(0), ...hop(2300, 2, 12, 400)])],
      cues: cues([800, 'whoosh'], [2300, 'sparkle']) },
  ],
  'rainy-day': [
    { dur: 6000, what: L('Big grey clouds roll across the sky. A soft glow and a rumble of thunder. Ravi looks up.', 'పెద్ద బూడిద మేఘాలు ఆకాశంలో కదిలాయి. మెల్లని వెలుగు, ఉరుము శబ్దం. రవి పైకి చూశాడు.'),
      extras: [X('xglow', 'glow', 150, 62, 1.3)],
      tracks: [T('cloud', [k(0, { x: -200 }), k(4000)]), T('cloud2', [k(0, { x: 160 }), k(500, { x: 160 }), k(4200)]),
        T('xglow', [k(0, { o: 0 }), k(4200, { o: 0 }), k(4800, { o: 0.6 }), k(6000, { o: 0 })]), T('child', [k(0), k(4300), k(4900, { r: -6 }), k(5600)], 'bottom')],
      cues: cues([300, 'wind'], [4300, 'thunder']),
      tap: { cloud: { tracks: [], cues: cues([0, 'thunder']) } } },
    { dur: 4500, what: L('Rain is falling. Ravi runs in with his closed umbrella and lifts it up.', 'వాన పడుతోంది. రవి మూసిన గొడుగుతో పరుగెత్తుకుంటూ వచ్చి దాన్ని పైకి ఎత్తాడు.'),
      extras: [X('xr1', 'drops', 110, 90, 0.7), X('xr2', 'drops', 310, 100, 0.7)],
      tracks: [T('child', walk(-100, 0, 2400, 4, 6)), T('umbrella', [...walk(-100, 0, 2400, 4, 6), k(3000, { y: -8 }), k(3500)]), fall('xr1', 0), fall('xr2', 1200)],
      cues: cues([0, 'rain']),
      tap: { umbrella: { tracks: [], cues: cues([0, 'whoosh']) } } },
    { dur: 4500, what: L('The frog takes a big jump into the puddle. Splash! Ravi laughs and hops.', 'కప్ప నీటి గుంటలోకి పెద్ద గెంతు వేసింది. చప్! రవి నవ్వి గెంతాడు.'),
      extras: [X('xs', 'drops', 260, 200, 0.5)],
      tracks: [T('frog', [k(0, { x: -90, y: -10 }), k(500, { x: -90, y: -10 }), k(1100, { x: -45, y: -60 }), k(1700)]),
        T('puddle', [k(0), k(1700), k(2000, { sx: 1.12, sy: 0.85 }), k(2500)]),
        T('xs', [k(0, { s: 0.3, o: 0 }), k(1700, { s: 0.3, o: 0 }), k(2000, { y: -15 }), k(2700, { y: -25, o: 0 })]),
        T('child', [k(0), ...hop(2200)]), T('umbrella', [k(0), ...hop(2200)])],
      cues: cues([0, 'rain'], [600, 'frog'], [1700, 'splash']),
      tap: { frog: { tracks: [], cues: cues([0, 'frog'], [500, 'splash']) } } },
    { dur: 5000, what: L('Ravi bends down and puts his paper boat on the water. It bobs up and down.', 'రవి వంగి కాగితం పడవను నీళ్ళలో పెట్టాడు. అది పైకీ కిందికీ ఊగుతోంది.'),
      tracks: [T('child', [k(0), k(600, { r: 10 }), k(1400)], 'bottom'),
        T('boat', [k(0, { x: -40, y: -25, o: 0 }), k(700, { x: -40, y: -25, o: 0 }), k(1000, { x: -40, y: -25 }), k(1700), k(2300, { y: -3, r: 4 }), k(2900, { r: -4 }), k(3500, { y: -3, r: 4 }), k(4100)])],
      cues: cues([0, 'rain'], [1700, 'water']),
      tap: { boat: { tracks: [T('boat', sway(0, 2, 400, 4))], cues: cues([0, 'water']) } } },
    { dur: 5000, what: L('The rain stops. The sun peeps out from behind the cloud and Ravi jumps.', 'వాన ఆగింది. మేఘం వెనక నుంచి సూర్యుడు తొంగి చూశాడు, రవి ఎగిరాడు.'),
      tracks: [T('cloud', [k(0, { x: -12 }), k(2000), k(3000, { x: -8 }), k(4000)]), T('sun', [k(0, { y: 20 }), k(2500)]), T('child', [k(0), ...hop(3000, 2, 10, 400)])],
      cues: cues([300, 'birds']),
      tap: { cloud: { tracks: [T('rainbow', [k(0, { s: 0.5, o: 0 }), k(1800)], 'bottom')], cues: cues([0, 'sparkle']) } } },
  ],
  'lost-kitten': [
    { dur: 5500, what: L('A little kitten walks along all alone. It looks this way and that way.', 'ఒక చిన్న పిల్లి పిల్ల ఒంటరిగా నడుస్తోంది. అటూ ఇటూ చూస్తోంది.'),
      tracks: [T('kitten', [...walk(-160, 0, 3000, 5, 6), k(3600, { r: -8 }), k(4200), k(4800, { r: 8 }), k(5400)])],
      cues: cues([0, 'birds'], [3400, 'cat']) },
    { dur: 5000, what: L('The kitten walks up to the dog. The dog shakes its head: Mother Cat is not here.', 'పిల్లి పిల్ల కుక్క దగ్గరకు వచ్చింది. కుక్క తల ఊపింది: అమ్మ పిల్లి ఇక్కడ లేదు.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('dog', [k(0), ...sway(2400, 2, 400, 5)])],
      cues: cues([2100, 'cat'], [2700, 'dog']) },
    { dur: 5000, what: L('The kitten asks the cow. The cow nods slowly and says moo.', 'పిల్లి పిల్ల ఆవును అడిగింది. ఆవు మెల్లగా తల ఊపి అంబా అంది.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('cow', [k(0), ...swing(2400, 2, 500, { r: 6 })])],
      cues: cues([2100, 'cat'], [2600, 'cow']) },
    { dur: 5000, what: L('The kitten asks the hen. The hen pecks and points to the red house.', 'పిల్లి పిల్ల కోడిని అడిగింది. కోడి పొడుస్తూ ఎర్ర ఇంటిని చూపింది.'),
      tracks: [T('kitten', walk(-80, 0, 2000, 3, 6)), T('hen', [k(0), ...swing(2400, 2, 300, { r: -14 })])],
      cues: cues([2100, 'cat'], [2500, 'hen']) },
    { dur: 4500, what: L('The kitten walks to the red house and stops at the door.', 'పిల్లి పిల్ల ఎర్ర ఇంటి దగ్గరకు నడిచి తలుపు దగ్గర ఆగింది.'),
      tracks: [T('kitten', [...walk(-90, 0, 2500, 4, 6), ...hop(3200, 1, 8)])],
      cues: cues([0, 'birds']),
      tap: { house: { tracks: [T('house', sway(0, 2, 250, 1)), T('mother', [k(0, { x: 40, o: 0 }), k(400, { x: 40, o: 0 }), k(1400)])], cues: cues([0, 'drum'], [500, 'drum'], [1300, 'cat']) } } },
    { dur: 5500, what: L('The kitten runs to Mother Cat and she nuzzles her baby. Home at last!', 'పిల్లి పిల్ల అమ్మ పిల్లి దగ్గరకు పరుగెత్తింది. అమ్మ ముద్దాడింది. ఇంటికి చేరింది!'),
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
    { dur: 4500, what: L('The moon rises over the glowing house. The little lamp keeps shining.', 'వెలుగుతున్న ఇంటి మీద చంద్రుడు ఉదయించాడు. చిన్న దీపం వెలుగుతూనే ఉంది.'),
      tracks: [T('moon', [k(0, { y: 40 }), k(2500)])],
      cues: cues([300, 'wind']),
      tap: { moon: { tracks: [T('s1', popIn(0, 600)), T('s2', popIn(400, 600)), T('s3', popIn(800, 600))], cues: cues([0, 'sparkle'], [800, 'sparkle']) } } },
  ],
  'bus-ride': [
    { dur: 5500, what: L('Anu and Amma wait at the bus stop. A car drives past. Anu looks down the road.', 'అను, అమ్మ బస్ స్టాప్‌లో ఎదురు చూస్తున్నారు. ఒక కారు వెళ్ళింది. అను దారి వైపు చూసింది.'),
      extras: [X('xcar', 'car', 470, 228, 0.7)],
      tracks: [T('xcar', [k(0, { x: -560 }), k(800, { x: -560 }), k(4800)]), T('child', [k(0), k(1200, { r: -6 }), k(2000), ...hop(3000, 1, 8)], 'bottom'), T('adult', [k(0), k(1500, { r: 4 }), k(2500)], 'bottom')],
      cues: cues([0, 'birds'], [800, 'car']),
      tap: { sign: { tracks: [T('bus', [k(0, { x: 200 }), k(2000)])], cues: cues([0, 'bus'], [1900, 'horn']) } } },
    { dur: 6000, what: L('The bus rolls along. Trees and cows slide past the window as it drives.', 'బస్సు సాగుతోంది. కిటికీ బయట చెట్లు, ఆవులు వెనక్కి వెళ్తున్నట్టు కనిపిస్తున్నాయి.'),
      extras: [X('xt', 'tree', -80, 150, 1.2, { back: true }), X('xf', 'flower', -40, 205, 0.5, { back: true })],
      tracks: [T('bus', swing(0, 8, 350, { y: -3 })), T('c1', [k(0, { x: 220 }), k(4500)]), T('c2', [k(0, { x: 220 }), k(4500)]), T('c3', [k(0, { x: 220 }), k(4500)]),
        T('xt', [k(0, { x: 520 }), k(5500)]), T('xf', [k(0, { x: 480 }), k(4000)])],
      cues: cues([0, 'bus'], [2800, 'bus'], [4500, 'cow']),
      tap: Object.fromEntries(['c1', 'c2', 'c3'].map((id) => [id, { tracks: [], cues: cues([0, 'cow']) }])) },
    { dur: 5000, what: L('The bus drives into the village. A farmer’s tractor chugs across the field.', 'బస్సు ఊళ్ళోకి వచ్చింది. రైతు ట్రాక్టర్ పొలంలో టక టక సాగుతోంది.'),
      tracks: [T('bus', [k(0, { x: -160 }), k(2500)]), T('tractor', [k(0, { x: 40 }), k(600, { x: 30, y: -3 }), k(1200, { x: 20 }), k(1800, { x: 10, y: -3 }), k(2400), ...swing(2400, 2, 300, { y: -3 })])],
      cues: cues([0, 'bus'], [800, 'tractor']),
      tap: { tractor: { tracks: [], cues: cues([0, 'tractor']) } } },
    { dur: 5500, what: L('The bus crosses the bridge over the river. Below, a little boat rocks on the water.', 'బస్సు నది మీది వంతెన దాటింది. కింద ఒక చిన్న పడవ నీళ్ళలో ఊగుతోంది.'),
      tracks: [T('bus', [k(0, { x: -260 }), k(3500)]), T('boat', [k(0), k(1000, { y: -3, r: 3 }), k(2000, { r: -3 }), k(3000, { y: -3, r: 3 }), k(4000)])],
      cues: cues([0, 'bus'], [1500, 'water'], [3300, 'horn']),
      tap: { boat: { tracks: [], cues: cues([0, 'boat']) } } },
    { dur: 5000, what: L('Anu runs up the path. Grandma waves hello at her house.', 'అను దారిలో పరుగెత్తుకుంటూ వచ్చింది. నానమ్మ ఇంటి దగ్గర చేయి ఊపింది.'),
      tracks: [T('child', [...walk(-120, 0, 2500, 4, 6), ...hop(3000)]), T('grandma', [k(0), ...sway(2600, 2, 450, 6)], 'bottom')],
      cues: cues([0, 'horn'], [500, 'birds']) },
  ],
  'peacock-dance': [
    { dur: 5000, what: L('A peacock walks slowly through the forest, step by step.', 'ఒక నెమలి అడవిలో అడుగు అడుగు మెల్లగా నడుస్తోంది.'),
      tracks: [T('peacock', walk(140, 0, 3200, 5, 5)), T('tree', sway(0, 2, 1200, 1.5), 'bottom')],
      cues: cues([0, 'birds'], [3400, 'peacock']) },
    { dur: 5000, what: L('Dark clouds float in with a soft glow and a rumble. The peacock looks up, happy.', 'నల్లని మేఘాలు మెల్లని వెలుగు, ఉరుముతో వచ్చాయి. నెమలి సంతోషంగా పైకి చూసింది.'),
      extras: [X('xglow', 'glow', 200, 62, 1.4)],
      tracks: [T('cloud', [k(0, { x: -220 }), k(3000)]), T('xglow', [k(0, { o: 0 }), k(3000, { o: 0 }), k(3600, { o: 0.6 }), k(4800, { o: 0 })]),
        T('peacock', [k(0), k(3200), k(3700, { r: 8 }), k(4300), k(4650, { y: -8 }), k(5000)])],
      cues: cues([0, 'wind'], [3000, 'thunder'], [4300, 'peacock']) },
    { dur: 4500, what: L('Rain begins. The peacock shuffles its feet and stands tall, ready to open its feathers.', 'వాన మొదలైంది. నెమలి కాళ్ళు కదిలించి నిటారుగా నిలబడింది, పింఛం విప్పడానికి సిద్ధం.'),
      extras: [X('xr1', 'drops', 90, 90, 0.7), X('xr2', 'drops', 320, 100, 0.7)],
      tracks: [T('peacock', [...sway(0, 2, 600, 4), k(3000, { s: 1.05 }), k(3600)], 'bottom'), fall('xr1', 0), fall('xr2', 1400)],
      cues: cues([0, 'rain']),
      tap: { peacock: { tracks: [], cues: cues([0, 'whoosh'], [700, 'peacock']) } } },
    { dur: 7000, what: L('The peacock sways and dances in the rain. Three birds fly in to watch.', 'నెమలి వానలో ఊగుతూ నాట్యం చేస్తోంది. మూడు పక్షులు చూడటానికి ఎగిరి వచ్చాయి.'),
      tracks: [T('peacock', sway(0, 2, 900, 5), 'bottom'), T('b1', fly(-120, -40, 800, 2600)), T('b2', fly(100, -40, 1400, 3200)), T('b3', fly(120, -30, 2000, 3800))],
      cues: cues([0, 'rain'], [500, 'peacock'], [1200, 'birds'], [4000, 'peacock']),
      tap: { ...Object.fromEntries(['b1', 'b2', 'b3'].map((id) => [id, { tracks: [T(id, hop(0, 1, 8, 300))], cues: cues([0, 'bird']) }])), '@done': { tracks: [T('peacock', sway(0, 1, 500, 4), 'bottom')], cues: cues([0, 'peacock']) } } },
    { dur: 4500, what: L('The peacock sways once more and the children jump and clap for its lovely dance.', 'నెమలి మళ్ళీ ఊగింది. పిల్లలు ఎగిరి చప్పట్లు కొట్టారు.'),
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
};
