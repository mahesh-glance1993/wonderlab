import { describe, expect, it } from 'vitest';
import { fmt, niceCeil, readNum, snap } from '../src/features/lab/common';
import { MOTION_DT, advanceMotion, initMotion, kinematics, motionOutcome, parseMotionPreset, sanitizeMotion, stepMotion, type MotionParams } from '../src/features/lab/motion';
import { G, advanceForces, forceBreakdown, forceForAcceleration, initForces, parseForcesPreset, type ForcesParams } from '../src/features/lab/forces';
import { BULB_R, CELL_V, advanceCircuit, brightnessWord, faultCircuit, FAULTS, initCircuit, parseCircuitPreset, sanitizeCircuit, solveCircuit } from '../src/features/lab/circuit';
import {
  advanceLight, initLight, intersectRaySegment, mirrorEnds, mirrorNormal, parseLightPreset, placeForIncidence, reflect, traceRay, vec, dot, aimAt, MIRROR, type LightParams,
} from '../src/features/lab/light';
import { LIGHT_TARGETS, MOTION_FLAG } from '../src/features/lab/challenges';

const q = (s: string) => new URLSearchParams(s);
const run = (p: MotionParams) => advanceMotion(initMotion(p), p, 100000);

describe('common helpers', () => {
  it('snaps and clamps to range', () => {
    expect(snap(7.3, { min: 0, max: 10, step: 0.5 })).toBe(7.5);
    expect(snap(99, { min: 0, max: 10, step: 0.5 })).toBe(10);
    expect(snap(-4, { min: 0, max: 10, step: 0.5 })).toBe(0);
  });
  it('reads numbers from query strings, rejecting junk', () => {
    expect(readNum(q('x=3'), 'x', { min: 0, max: 5, step: 1 })).toBe(3);
    expect(readNum(q('x=abc'), 'x', { min: 0, max: 5, step: 1 })).toBeUndefined();
    expect(readNum(q('x='), 'x', { min: 0, max: 5, step: 1 })).toBeUndefined();
    expect(readNum(q('x=Infinity'), 'x', { min: 0, max: 5, step: 1 })).toBeUndefined();
    expect(readNum(q(''), 'x', { min: 0, max: 5, step: 1 })).toBeUndefined();
  });
  it('formats without -0 or float noise', () => {
    expect(fmt(-0.0001)).toBe('0');
    expect(fmt(0.1 + 0.2)).toBe('0.3');
    expect(niceCeil(37)).toBe(50);
    expect(niceCeil(0)).toBe(1);
  });
});

describe('motion kinematics', () => {
  const cases: MotionParams[] = [
    { u: 0, a: 2, t: 10 }, { u: 5, a: 0, t: 6 }, { u: 3, a: 1.5, t: 7.5 }, { u: 12, a: 4, t: 20 }, { u: 30, a: 10, t: 1 },
  ];
  for (const p of cases) {
    it(`matches closed form for u=${p.u}, a=${p.a}`, () => {
      let s = initMotion(p);
      while (!s.done) {
        s = stepMotion(s, p);
        expect(s.x).toBeCloseTo(p.u * s.t + 0.5 * p.a * s.t * s.t, 9);
        expect(s.v).toBeCloseTo(p.u + p.a * s.t, 9);
      }
      expect(s.t).toBeCloseTo(p.t, 9);
      expect(s.samples.length).toBe(Math.round(p.t / MOTION_DT) + 1);
    });
  }
  it('stops (does not reverse) when slowing down', () => {
    const p = { u: 10, a: -2, t: 20 };
    const s = run(p);
    expect(s.stopped).toBe(true);
    expect(s.v).toBe(0);
    expect(s.t).toBeCloseTo(5, 9);
    expect(s.x).toBeCloseTo(25, 9); // u²/2|a|
    expect(kinematics(10, -2, 3).v).toBeCloseTo(4, 9);
    expect(kinematics(10, -2, 9)).toEqual({ x: 25, v: 0, stopped: true });
  });
  it('stays at rest when braking from rest', () => {
    const s = run({ u: 0, a: -3, t: 5 });
    expect(s.x).toBe(0);
    expect(s.v).toBe(0);
  });
  it('is deterministic regardless of how steps are grouped', () => {
    const p = { u: 3, a: 1.5, t: 9 };
    let a = initMotion(p), b = initMotion(p);
    for (let i = 0; i < 180; i++) a = stepMotion(a, p);
    b = advanceMotion(advanceMotion(b, p, 7), p, 173);
    expect(a.x).toBe(b.x);
    expect(a.v).toBe(b.v);
  });
  it('reports outcome for challenges', () => {
    expect(motionOutcome({ u: 0, a: 4, t: 5 }).v).toBeCloseTo(20, 9);
    expect(motionOutcome({ u: 10, a: -2, t: 12 }).x).toBeCloseTo(MOTION_FLAG, 9);
  });
});

describe('forces and friction', () => {
  const p = (mass: number, force: number, friction: number): ForcesParams => ({ mass, force, friction });
  it('static friction balances any push up to μmg (no motion)', () => {
    const base = p(10, 0, 0.5); // μmg = 49 N
    for (const f of [0, 10, 30, 48.9, 49]) {
      const b = forceBreakdown({ ...base, force: f }, 0);
      expect(b.sliding).toBe(false);
      expect(b.friction).toBeCloseTo(f, 9);
      expect(b.net).toBe(0);
      expect(b.acceleration).toBe(0);
      const s = advanceForces(initForces(), { ...base, force: f }, 100);
      expect(s.x).toBe(0);
      expect(s.v).toBe(0);
    }
  });
  it('kinetic friction is μmg once the push beats the threshold', () => {
    const b = forceBreakdown(p(10, 69, 0.5), 0);
    expect(b.sliding).toBe(true);
    expect(b.friction).toBeCloseTo(49, 9);
    expect(b.net).toBeCloseTo(20, 9);
    expect(b.acceleration).toBeCloseTo(2, 9);
    expect(b.weight).toBeCloseTo(10 * G, 9);
    expect(b.normal).toBeCloseTo(b.weight, 9);
  });
  it('a = F_net / m and box motion matches constant acceleration', () => {
    const params = p(4, 30, 0.25); // friction 9.8 N, net 20.2 N, a 5.05
    const b = forceBreakdown(params, 0);
    expect(b.acceleration).toBeCloseTo(20.2 / 4, 9);
    const s = advanceForces(initForces(), params, 40); // 2 s
    expect(s.v).toBeCloseTo(b.acceleration * 2, 6);
    expect(s.x).toBeCloseTo(0.5 * b.acceleration * 4, 6);
  });
  it('a moving box slows to rest and never slides backwards when the push drops', () => {
    let s = advanceForces(initForces(), p(5, 60, 0.4), 20);
    expect(s.v).toBeGreaterThan(0);
    s = advanceForces(s, p(5, 0, 0.4), 200);
    expect(s.v).toBe(0);
    const x = s.x;
    s = advanceForces({ ...s, done: false }, p(5, 0, 0.4), 10);
    expect(s.x).toBe(x);
  });
  it('frictionless floor accelerates with any push', () => {
    expect(forceBreakdown(p(2, 1, 0), 0).acceleration).toBeCloseTo(0.5, 9);
  });
  it('solves the challenge force', () => {
    expect(forceForAcceleration(10, 0.3, 2)).toBeCloseTo(49.4, 9);
    expect(forceBreakdown(p(10, 49.4, 0.3), 0).acceleration).toBeCloseTo(2, 9);
  });
});

describe('circuit', () => {
  it('open circuit or a gap means no current', () => {
    for (let cells = 1; cells <= 4; cells++) for (let bulbs = 1; bulbs <= 3; bulbs++) {
      expect(solveCircuit({ cells, bulbs, closed: false, gap: null }).current).toBe(0);
      expect(solveCircuit({ cells, bulbs, closed: true, gap: 'left' }).current).toBe(0);
      expect(solveCircuit({ cells, bulbs, closed: false, gap: null }).brightness).toBe(0);
    }
  });
  it('closed circuit current is V / R_total', () => {
    for (let cells = 1; cells <= 4; cells++) for (let bulbs = 1; bulbs <= 3; bulbs++) {
      const s = solveCircuit({ cells, bulbs, closed: true, gap: null });
      expect(s.voltage).toBeCloseTo(cells * CELL_V, 9);
      expect(s.resistance).toBeCloseTo(bulbs * BULB_R, 9);
      expect(s.current).toBeCloseTo((cells * CELL_V) / (bulbs * BULB_R), 9);
      expect(s.bulbPower).toBeCloseTo(s.current ** 2 * BULB_R, 9);
      expect(s.totalPower).toBeCloseTo(s.voltage * s.current, 6);
    }
  });
  it('more bulbs in series are dimmer; more cells are brighter', () => {
    const b = (cells: number, bulbs: number) => solveCircuit({ cells, bulbs, closed: true, gap: null }).brightness;
    expect(b(2, 1)).toBeGreaterThan(b(2, 2));
    expect(b(3, 1)).toBeGreaterThan(b(2, 1));
    expect(b(4, 1)).toBe(1);
    expect(brightnessWord(0)).toBe('off');
  });
  it('charge flow only moves when current flows', () => {
    expect(advanceCircuit(initCircuit(), { cells: 2, bulbs: 1, closed: false, gap: null }, 50).phase).toBe(0);
    expect(advanceCircuit(initCircuit(), { cells: 2, bulbs: 1, closed: true, gap: null }, 50).phase).toBeGreaterThan(0);
  });
  it('every fault puzzle starts broken', () => {
    for (const f of FAULTS) expect(solveCircuit(faultCircuit(f)).complete).toBe(false);
  });
});

describe('light reflection', () => {
  it('ray–mirror intersection', () => {
    const [a, b] = mirrorEnds(0);
    const hit = intersectRaySegment(vec(50, 40), vec(0, -1), a, b);
    expect(hit?.point.x).toBeCloseTo(50, 9);
    expect(hit?.point.y).toBeCloseTo(MIRROR.cy, 9);
    expect(hit?.t).toBeCloseTo(40 - MIRROR.cy, 9);
    expect(intersectRaySegment(vec(50, 40), vec(0, 1), a, b)).toBeNull(); // pointing away
    expect(intersectRaySegment(vec(0, 40), vec(1, 0), a, b)).toBeNull(); // parallel
    expect(intersectRaySegment(vec(95, 40), vec(0, -1), a, b)).toBeNull(); // misses the end of the mirror
  });
  it('angle of reflection equals angle of incidence for many mirror tilts and angles', () => {
    for (let tilt = -30; tilt <= 30; tilt += 5) for (let i = 0; i <= 80; i += 5) {
      const pl = placeForIncidence(i, tilt);
      const tr = traceRay({ ...pl, tilt });
      expect(tr.hit).not.toBeNull();
      expect(tr.incidence).not.toBeNull();
      expect(tr.reflection).toBeCloseTo(tr.incidence!, 6);
      if (pl.sy > 22 && pl.sy < 67 && pl.sx > 3 && pl.sx < 97) expect(tr.incidence!).toBeCloseTo(i, 6); // not clamped
    }
  });
  it('reflected ray lies on the other side of the normal (same plane, mirrored)', () => {
    const tilt = 15, n = mirrorNormal(tilt);
    const d = vec(Math.cos(-1), Math.sin(-1));
    const r = reflect(d, n);
    expect(dot(r, n)).toBeCloseTo(-dot(d, n), 9);
    expect(Math.hypot(r.x, r.y)).toBeCloseTo(1, 9);
  });
  it('light from behind the mirror is not reflected', () => {
    const tr = traceRay({ sx: 50, sy: 22, aim: 90, tilt: 0 }); // pointing up: never hits
    expect(tr.hit).toBeNull();
    const p: LightParams = { sx: 50, sy: 22, aim: -90, tilt: 0 };
    expect(traceRay(p).incidence).toBeCloseTo(0, 9);
  });
  it('pulse animation reaches the end of the path', () => {
    const tr = traceRay({ sx: 14, sy: 52, aim: aimAt(14, 52, vec(50, 10)), tilt: 0 });
    const s = advanceLight(initLight(), tr.pathLength, 10000);
    expect(s.done).toBe(true);
    expect(s.dist).toBeCloseTo(tr.pathLength, 9);
  });
  it('challenge targets are reachable', () => {
    for (const t of LIGHT_TARGETS) expect(traceRay(t.solution, t.target).hitsTarget).toBe(true);
    for (const t of LIGHT_TARGETS) expect(traceRay(t.start, t.target).hitsTarget).toBe(false);
  });
});

describe('URL presets', () => {
  it('motion presets parse and clamp', () => {
    expect(parseMotionPreset(q('u=0&a=4&t=5'))).toEqual({ u: 0, a: 4, t: 5 });
    expect(parseMotionPreset(q('u=999&a=-50&t=0'))).toEqual({ u: 30, a: -10, t: 1 });
    expect(parseMotionPreset(q('u=abc&a=2'))).toEqual({ a: 2 });
    expect(parseMotionPreset(q('foo=1'))).toBeNull();
  });
  it('forces presets parse and clamp', () => {
    expect(parseForcesPreset(q('mass=2&force=8&friction=0'))).toEqual({ mass: 2, force: 8, friction: 0 });
    expect(parseForcesPreset(q('mass=-3&force=1e9&friction=7'))).toEqual({ mass: 1, force: 200, friction: 1 });
    expect(parseForcesPreset(q('mass=NaN'))).toBeNull();
  });
  it('circuit presets parse and clamp', () => {
    expect(parseCircuitPreset(q('cells=2&bulbs=1&closed=1'))).toEqual({ cells: 2, bulbs: 1, closed: true });
    expect(parseCircuitPreset(q('cells=9&bulbs=0&closed=0'))).toEqual({ cells: 4, bulbs: 1, closed: false });
    expect(parseCircuitPreset(q('cells=x&closed=maybe'))).toBeNull();
    expect(parseCircuitPreset(q('cells=2.6'))).toEqual({ cells: 3 });
  });
  it('light presets parse and clamp', () => {
    expect(parseLightPreset(q('angle=30'))).toEqual({ angle: 30 });
    expect(parseLightPreset(q('angle=120'))).toEqual({ angle: 85 });
    expect(parseLightPreset(q('angle=-5'))).toEqual({ angle: 0 });
    expect(parseLightPreset(q('angle=wide'))).toBeNull();
  });
  it('restored saved state is sanitised', () => {
    expect(sanitizeMotion({ u: 'x', a: 99, t: 3 })).toEqual({ u: 2, a: 10, t: 3 });
    expect(sanitizeMotion(null)).toEqual({ u: 2, a: 1, t: 8 });
    expect(sanitizeCircuit({ cells: 10, bulbs: -1, closed: 'yes', gap: 'middle' })).toEqual({ cells: 4, bulbs: 1, closed: false, gap: null });
  });
});
