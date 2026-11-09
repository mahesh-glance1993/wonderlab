// Forces Lab model: a box pushed along a level floor with friction (SI units).
// One coefficient μ is used for both static and sliding friction (a simplification).
import { readNum, sanitizeParams, tidy, type Range } from './common';

export const G = 9.8; // m/s²
export const FORCES_DT = 0.05; // s
export const FORCES_RUN = 10; // s, a run stops after this long

export interface ForcesParams { mass: number; force: number; friction: number }
export const FORCES_RANGES: { [K in keyof ForcesParams]: Range } = {
  mass: { min: 1, max: 50, step: 1 },
  force: { min: 0, max: 200, step: 0.1 },
  friction: { min: 0, max: 1, step: 0.05 },
};
export const FORCES_DEFAULTS: ForcesParams = { mass: 5, force: 30, friction: 0.3 };

export interface ForceBreakdown {
  weight: number; normal: number; maxFriction: number;
  friction: number; // magnitude; acts opposite to the (attempted) motion
  net: number; acceleration: number; sliding: boolean;
}

/** All forces on the box given its current speed v (m/s, >= 0). */
export function forceBreakdown(p: ForcesParams, speed: number): ForceBreakdown {
  const weight = tidy(p.mass * G);
  const normal = weight;
  const maxFriction = tidy(p.friction * normal);
  let friction: number, net: number, sliding: boolean;
  if (speed > 1e-9 || p.force > maxFriction + 1e-9) { friction = maxFriction; net = tidy(p.force - maxFriction); sliding = true; }
  else { friction = p.force; net = 0; sliding = false; } // static friction exactly balances the push
  return { weight, normal, maxFriction, friction, net, acceleration: tidy(net / p.mass), sliding };
}

export interface ForcesState { steps: number; t: number; x: number; v: number; done: boolean }
export const initForces = (): ForcesState => ({ steps: 0, t: 0, x: 0, v: 0, done: false });

export function stepForces(s: ForcesState, p: ForcesParams): ForcesState {
  if (s.done) return s;
  const { acceleration: a } = forceBreakdown(p, s.v);
  const dt = FORCES_DT;
  let nv = s.v + a * dt, dx: number;
  if (nv < 0) { // friction brings the box to rest within this step; it never slides backwards
    const tStop = s.v / -a;
    dx = s.v * tStop + 0.5 * a * tStop * tStop;
    nv = 0;
  } else dx = s.v * dt + 0.5 * a * dt * dt;
  const steps = s.steps + 1;
  const t = tidy(steps * dt);
  return { steps, t, x: tidy(s.x + dx), v: tidy(nv), done: t >= FORCES_RUN - 1e-9 };
}
export function advanceForces(s: ForcesState, p: ForcesParams, n: number): ForcesState {
  let cur = s;
  for (let i = 0; i < n && !cur.done; i++) cur = stepForces(cur, p);
  return cur;
}

/** The push needed to give acceleration a on this floor: F = ma + μmg. */
export const forceForAcceleration = (mass: number, mu: number, a: number) => tidy(mass * a + mu * mass * G);

export function parseForcesPreset(q: URLSearchParams): Partial<ForcesParams> | null {
  const out: Partial<ForcesParams> = {};
  const m = readNum(q, 'mass', FORCES_RANGES.mass), f = readNum(q, 'force', FORCES_RANGES.force), mu = readNum(q, 'friction', FORCES_RANGES.friction);
  if (m !== undefined) out.mass = m;
  if (f !== undefined) out.force = f;
  if (mu !== undefined) out.friction = mu;
  return Object.keys(out).length ? out : null;
}
export const sanitizeForces = (raw: unknown) => sanitizeParams(raw, FORCES_DEFAULTS, FORCES_RANGES);
