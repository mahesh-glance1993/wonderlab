// Light Lab model: reflection of a single ray from a one-sided plane mirror.
// World units are centimetres, y points up, angles in degrees.
import { clamp, deg, rad, readNum, sanitizeParams, tidy, type Range } from './common';

export interface Vec { x: number; y: number }
export const vec = (x: number, y: number): Vec => ({ x, y });
const add = (a: Vec, b: Vec) => vec(a.x + b.x, a.y + b.y);
const sub = (a: Vec, b: Vec) => vec(a.x - b.x, a.y - b.y);
const mul = (a: Vec, k: number) => vec(a.x * k, a.y * k);
export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x;
const len = (a: Vec) => Math.hypot(a.x, a.y);
const norm = (a: Vec) => { const l = len(a) || 1; return vec(a.x / l, a.y / l); };
export const dirFromAngle = (d: number) => vec(Math.cos(rad(d)), Math.sin(rad(d)));

export const WORLD = { w: 100, h: 70 };
export const MIRROR = { cx: 50, cy: 10, len: 56 };
export const LIGHT_DT = 0.05; // s
export const PULSE_SPEED = 80; // cm per second of animation (slowed right down so we can watch it)

export interface LightParams { sx: number; sy: number; aim: number; tilt: number } // source position (cm), beam direction (° from +x, anticlockwise), mirror tilt (°)
export const LIGHT_RANGES: { [K in keyof LightParams]: Range } = {
  sx: { min: 3, max: 97, step: 0.5 },
  sy: { min: 22, max: 67, step: 0.5 },
  aim: { min: -180, max: 180, step: 1 },
  tilt: { min: -30, max: 30, step: 1 },
};
export const LIGHT_DEFAULTS: LightParams = { sx: 14, sy: 52, aim: -60, tilt: 0 };

export function mirrorEnds(tilt: number): [Vec, Vec] {
  const d = mul(dirFromAngle(tilt), MIRROR.len / 2), c = vec(MIRROR.cx, MIRROR.cy);
  return [sub(c, d), add(c, d)];
}
/** Unit normal on the shiny (front) side of the mirror. */
export const mirrorNormal = (tilt: number) => vec(-Math.sin(rad(tilt)), Math.cos(rad(tilt)));

/** Ray o + t·d (t > 0) against segment a–b: hit point, distance t and position u in [0,1] along the segment. */
export function intersectRaySegment(o: Vec, d: Vec, a: Vec, b: Vec): { t: number; u: number; point: Vec } | null {
  const e = sub(b, a);
  const den = cross(d, e);
  if (Math.abs(den) < 1e-12) return null; // parallel
  const ao = sub(a, o);
  const t = cross(ao, e) / den, u = cross(ao, d) / den;
  if (t <= 1e-9 || u < 0 || u > 1) return null;
  return { t, u, point: add(o, mul(d, t)) };
}

/** Angle between two vectors in degrees (atan2 form: accurate near 0° and 180°). */
export const angleBetween = (a: Vec, b: Vec) => tidy(deg(Math.atan2(Math.abs(cross(a, b)), dot(a, b))));

/** Mirror reflection: r = d − 2(d·n)n. */
export const reflect = (d: Vec, n: Vec) => sub(d, mul(n, 2 * dot(d, n)));

/** Where a ray leaves the world rectangle. */
export function rayExit(o: Vec, d: Vec): Vec {
  let best = Infinity;
  if (d.x > 1e-12) best = Math.min(best, (WORLD.w - o.x) / d.x);
  if (d.x < -1e-12) best = Math.min(best, -o.x / d.x);
  if (d.y > 1e-12) best = Math.min(best, (WORLD.h - o.y) / d.y);
  if (d.y < -1e-12) best = Math.min(best, -o.y / d.y);
  return add(o, mul(d, Number.isFinite(best) ? Math.max(0, best) : 0));
}

/** Does the ray (from o along unit d, up to maxT) pass within r of point c? */
export function rayHitsCircle(o: Vec, d: Vec, c: Vec, r: number, maxT = Infinity): boolean {
  const t = clamp(dot(sub(c, o), d), 0, maxT);
  return len(sub(add(o, mul(d, t)), c)) <= r;
}

export interface Target { x: number; y: number; r: number }
export interface Trace {
  source: Vec; incEnd: Vec; hit: Vec | null; backside: boolean;
  normal: Vec; incidence: number | null; reflection: number | null;
  reflEnd: Vec | null; reflDir: Vec | null;
  /** true only when the REFLECTED ray passes through the target (a direct hit doesn't count). */
  hitsTarget: boolean; pathLength: number;
}

export function traceRay(p: LightParams, target?: Target): Trace {
  const o = vec(p.sx, p.sy), d = norm(dirFromAngle(p.aim));
  const [a, b] = mirrorEnds(p.tilt), n = mirrorNormal(p.tilt);
  const hit = intersectRaySegment(o, d, a, b);
  const base = { source: o, normal: n };
  if (!hit) {
    const incEnd = rayExit(o, d), l = len(sub(incEnd, o));
    return { ...base, incEnd, hit: null, backside: false, incidence: null, reflection: null, reflEnd: null, reflDir: null, hitsTarget: false, pathLength: l };
  }
  if (dot(d, n) > 0) { // reaches the painted back of the mirror: absorbed, no reflection
    return { ...base, incEnd: hit.point, hit: hit.point, backside: true, incidence: null, reflection: null, reflEnd: null, reflDir: null, hitsTarget: false, pathLength: hit.t };
  }
  const r = norm(reflect(d, n));
  // measured independently: incidence between the reversed incident ray and the normal; reflection between reflected ray and normal
  const incidence = angleBetween(mul(d, -1), n);
  const reflection = angleBetween(r, n);
  const reflEnd = rayExit(hit.point, r);
  const reflLen = len(sub(reflEnd, hit.point));
  const hitsTarget = !!target && rayHitsCircle(hit.point, r, target, target.r, reflLen);
  return { ...base, incEnd: hit.point, hit: hit.point, backside: false, incidence, reflection, reflEnd, reflDir: r, hitsTarget, pathLength: hit.t + reflLen };
}

/** Beam angle (°) pointing from the source towards point q. */
export const aimAt = (sx: number, sy: number, q: Vec) => tidy(deg(Math.atan2(q.y - sy, q.x - sx)));

/** Place the source so the ray strikes the mirror centre at the given angle of incidence (source on the left of the normal). */
export function placeForIncidence(angle: number, tilt: number, dist = 42): Pick<LightParams, 'sx' | 'sy' | 'aim'> {
  const i = rad(clamp(angle, 0, 85));
  const n = mirrorNormal(tilt);
  const toSource = vec(n.x * Math.cos(i) - n.y * Math.sin(i), n.x * Math.sin(i) + n.y * Math.cos(i)); // normal rotated anticlockwise by i
  const s = add(vec(MIRROR.cx, MIRROR.cy), mul(toSource, dist));
  const sx = tidy(clamp(s.x, LIGHT_RANGES.sx.min, LIGHT_RANGES.sx.max)), sy = tidy(clamp(s.y, LIGHT_RANGES.sy.min, LIGHT_RANGES.sy.max));
  return { sx, sy, aim: aimAt(sx, sy, vec(MIRROR.cx, MIRROR.cy)) };
}

/** A light pulse travelling along the traced path (Play/Step animate this). */
export interface LightState { steps: number; t: number; dist: number; done: boolean }
export const initLight = (): LightState => ({ steps: 0, t: 0, dist: 0, done: false });
export function stepLight(s: LightState, pathLength: number): LightState {
  if (s.done) return s;
  const steps = s.steps + 1;
  const dist = Math.min(pathLength, tidy(steps * LIGHT_DT * PULSE_SPEED));
  return { steps, t: tidy(steps * LIGHT_DT), dist, done: dist >= pathLength - 1e-9 };
}
export function advanceLight(s: LightState, pathLength: number, n: number): LightState {
  let cur = s;
  for (let i = 0; i < n && !cur.done; i++) cur = stepLight(cur, pathLength);
  return cur;
}
/** Point reached by the pulse after travelling `dist` along the path. */
export function pointAlong(tr: Trace, dist: number): Vec {
  const l1 = len(sub(tr.incEnd, tr.source));
  if (dist <= l1 || !tr.hit || !tr.reflEnd) return add(tr.source, mul(norm(sub(tr.incEnd, tr.source)), Math.min(dist, l1)));
  const l2 = len(sub(tr.reflEnd, tr.hit));
  return add(tr.hit, mul(norm(sub(tr.reflEnd, tr.hit)), Math.min(dist - l1, l2)));
}

export function parseLightPreset(q: URLSearchParams): { angle: number } | null {
  const angle = readNum(q, 'angle', { min: 0, max: 85, step: 1 });
  return angle === undefined ? null : { angle };
}
export const sanitizeLight = (raw: unknown) => sanitizeParams(raw, LIGHT_DEFAULTS, LIGHT_RANGES);
