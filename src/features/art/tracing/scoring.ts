// Tracing scoring (pure): path coverage + staying within tolerance + stroke order/direction.
import { distToPoly, resample, type Pt } from './path';

export type Tolerance = 'easy' | 'medium' | 'hard';
/** Tolerance radius in guide units (guides are drawn in a ~100-unit tall box). */
export const TOLERANCE: Record<Tolerance, number> = { easy: 10, medium: 7, hard: 4.5 };

export interface StrokeCheck { coverage: number; accuracy: number; forward: boolean }

const near = (q: Pt, pts: Pt[], tol: number) => { for (const p of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) <= tol) return true; return false; };

/** User ink: one stroke, or several separate strokes (never joined to each other). */
type Ink = Pt[] | Pt[][];
const strokesOf = (ink: Ink): Pt[][] => (ink.length && Array.isArray(ink[0][0]) ? (ink as Pt[][]) : [ink as Pt[]]);
const densifyAll = (ink: Ink, spacing: number) => strokesOf(ink).flatMap((s) => densify(s, spacing));

/** Fraction of guide samples that the user's points come within `tol` of. */
export function coverage(guide: Pt[], user: Ink, tol: number): number {
  const gs = resample(guide, Math.max(1, tol / 2));
  if (!gs.length || !user.length) return 0;
  const u = densifyAll(user, tol / 2);
  let hit = 0;
  for (const g of gs) if (near(g, u, tol)) hit++;
  return hit / gs.length;
}
/** Fraction of the user's ink that stays within `tol` of any of the guide strokes. */
export function accuracy(guides: Pt[][], user: Ink, tol: number): number {
  const u = densifyAll(user, tol / 2);
  if (!u.length) return 0;
  let ok = 0;
  for (const q of u) if (guides.some((g) => distToPoly(q, g) <= tol)) ok++;
  return ok / u.length;
}
/** Fill gaps between fast pointer samples so a quick straight swipe still counts. */
function densify(p: Pt[], spacing: number): Pt[] {
  if (p.length < 2) return p;
  return resample(p, Math.max(0.5, spacing));
}

const signedArea = (p: Pt[]) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
const isClosed = (g: Pt[]) => g.length > 3 && Math.hypot(g[0][0] - g[g.length - 1][0], g[0][1] - g[g.length - 1][1]) < 3;

/** Did the user travel along the guide in its drawing direction? */
export function followsDirection(guide: Pt[], user: Pt[], tol: number): boolean {
  const u = user.filter((q) => distToPoly(q, guide) <= tol * 1.5);
  if (u.length < 2) return true;
  if (isClosed(guide)) return Math.sign(signedArea(guide)) === Math.sign(signedArea(u)) || Math.abs(signedArea(u)) < 1;
  const gs = resample(guide, Math.max(1, tol / 2));
  const idx = (q: Pt) => { let b = 0, bd = Infinity; gs.forEach((g, i) => { const d = Math.hypot(g[0] - q[0], g[1] - q[1]); if (d < bd) { bd = d; b = i; } }); return b; };
  const third = Math.max(1, Math.floor(u.length / 3));
  const avg = (a: Pt[]) => a.reduce((s, q) => s + idx(q), 0) / a.length;
  return avg(u.slice(-third)) >= avg(u.slice(0, third));
}

export function checkStroke(guide: Pt[], user: Pt[], tol: number): StrokeCheck {
  return { coverage: coverage(guide, user, tol), accuracy: accuracy([guide], user, tol), forward: followsDirection(guide, user, tol) };
}

export interface TraceScore {
  coverage: number; accuracy: number; score: number; stars: 0 | 1 | 2 | 3;
  perStroke: number[];
  /** guide stroke index each user stroke mostly traced (-1 = none) */
  matched: number[];
  orderOk: boolean; directionOk: boolean;
  feedback: string[];
}

export function scoreTrace(guides: Pt[][], users: Pt[][], tol: number, opts: { ordered: boolean } = { ordered: true }): TraceScore {
  const all = users.filter((u) => u.length);
  const perStroke = guides.map((g) => coverage(g, all, tol));
  const lens = guides.map((g) => Math.max(1, resample(g, 2).length));
  const totalLen = lens.reduce((a, b) => a + b, 0);
  const cov = perStroke.reduce((s, c, i) => s + c * lens[i], 0) / totalLen;
  const acc = accuracy(guides, all, tol);
  const matched = users.map((u) => {
    let best = -1, bc = 0.2;
    guides.forEach((g, i) => { const c = coverage(g, u, tol); if (c > bc) { bc = c; best = i; } });
    return best;
  });
  const seq = matched.filter((m, i) => m >= 0 && matched.indexOf(m) === i);
  const orderOk = seq.every((m, i) => i === 0 || m > seq[i - 1]) && (seq.length === 0 || seq[0] === 0);
  const directionOk = users.every((u, i) => matched[i] < 0 || followsDirection(guides[matched[i]], u, tol));
  // coverage gates the score (half a letter can't do well); accuracy scales it (scribbles lose points)
  let score = cov * (0.4 + 0.6 * acc);
  if (opts.ordered && (!orderOk || !directionOk)) score -= 0.08;
  score = Math.max(0, Math.min(1, score));
  const stars = (score >= 0.85 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0) as TraceScore['stars'];
  const feedback: string[] = [];
  const missed = perStroke.map((c, i) => (c < 0.6 ? i + 1 : 0)).filter(Boolean);
  if (missed.length) feedback.push(`Trace all of line ${missed.join(', ')}.`);
  if (acc < 0.7) feedback.push('Try to stay inside the grey path.');
  if (opts.ordered && !orderOk) feedback.push('Follow the numbers: start with line 1.');
  if (opts.ordered && !directionOk) feedback.push('Start at the green dot and follow the arrows.');
  if (!feedback.length) feedback.push(stars === 3 ? 'Beautiful tracing!' : 'Good work!');
  return { coverage: cov, accuracy: acc, score, stars, perStroke, matched, orderOk, directionOk, feedback };
}
