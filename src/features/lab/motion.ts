// Motion Lab model: 1-D motion with constant acceleration (SI units: m, s, m/s, m/s²).
// Brakes can slow the car to rest but never push it backwards.
import { readNum, sanitizeParams, tidy, type Range } from './common';

export const MOTION_DT = 0.05; // s, fixed timestep

export interface MotionParams { u: number; a: number; t: number } // initial speed, acceleration, run time
export const MOTION_RANGES: { [K in keyof MotionParams]: Range } = {
  u: { min: 0, max: 30, step: 0.5 },
  a: { min: -10, max: 10, step: 0.5 },
  t: { min: 1, max: 20, step: 0.5 },
};
export const MOTION_DEFAULTS: MotionParams = { u: 2, a: 1, t: 8 };

export interface MotionSample { t: number; x: number; v: number }
export interface MotionState { steps: number; t: number; x: number; v: number; stopped: boolean; done: boolean; samples: MotionSample[] }

/** Time at which the car comes to rest, or null if it never does. */
export function stopTime(u: number, a: number): number | null {
  return a < 0 ? u / -a : null;
}

/** Closed-form kinematics: s = ut + ½at², v = u + at (until the car stops). */
export function kinematics(u: number, a: number, t: number): { x: number; v: number; stopped: boolean } {
  const ts = stopTime(u, a);
  if (ts != null && t >= ts) return { x: tidy(u * ts + 0.5 * a * ts * ts), v: 0, stopped: true };
  return { x: tidy(u * t + 0.5 * a * t * t), v: tidy(u + a * t), stopped: false };
}

export function initMotion(p: MotionParams): MotionState {
  return { steps: 0, t: 0, x: 0, v: p.u, stopped: false, done: false, samples: [{ t: 0, x: 0, v: p.u }] };
}

/** Advance by one fixed timestep. Position and speed come from the closed form at t = steps·dt, so there is no drift. */
export function stepMotion(s: MotionState, p: MotionParams): MotionState {
  if (s.done) return s;
  const steps = s.steps + 1;
  const ts = stopTime(p.u, p.a);
  let t = Math.min(tidy(steps * MOTION_DT), p.t);
  if (ts != null && t > ts) t = tidy(ts); // land exactly on the stopping moment
  const k = kinematics(p.u, p.a, t);
  const done = t >= p.t - 1e-9 || k.stopped;
  return { steps, t, x: k.x, v: k.v, stopped: k.stopped, done, samples: [...s.samples, { t, x: k.x, v: k.v }] };
}

export function advanceMotion(s: MotionState, p: MotionParams, n: number): MotionState {
  let cur = s;
  for (let i = 0; i < n && !cur.done; i++) cur = stepMotion(cur, p);
  return cur;
}

/** Final outcome of a full run (for axis scaling, predictions and explanations). */
export function motionOutcome(p: MotionParams) {
  const ts = stopTime(p.u, p.a);
  const end = ts != null && ts < p.t ? ts : p.t;
  const k = kinematics(p.u, p.a, end);
  return { tEnd: tidy(end), x: k.x, v: k.v, stopped: k.stopped, vMax: Math.max(p.u, k.v) };
}

export function parseMotionPreset(q: URLSearchParams): Partial<MotionParams> | null {
  const out: Partial<MotionParams> = {};
  const u = readNum(q, 'u', MOTION_RANGES.u), a = readNum(q, 'a', MOTION_RANGES.a), t = readNum(q, 't', MOTION_RANGES.t);
  if (u !== undefined) out.u = u;
  if (a !== undefined) out.a = a;
  if (t !== undefined) out.t = t;
  return Object.keys(out).length ? out : null;
}
export const sanitizeMotion = (raw: unknown) => sanitizeParams(raw, MOTION_DEFAULTS, MOTION_RANGES);
