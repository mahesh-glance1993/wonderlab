// Tiny path language for tracing guides (pure). Coordinates are in the guide's box units.
//   M x y            move (start of the stroke)
//   L x y            straight line
//   Q cx cy x y      quadratic curve
//   C ax ay bx by x y  cubic curve
//   O cx cy r a0 a1  circular arc from angle a0 to a1 (degrees; 0 = right, 90 = down)
//   E cx cy rx ry a0 a1  elliptical arc
// The direction of travel is the drawing direction the learner should follow.
export type Pt = [number, number];

export function parseStroke(d: string, step = 1.5): Pt[] {
  const tok = d.match(/[MLQCOE]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
  const out: Pt[] = [];
  let i = 0;
  const num = () => Number(tok[i++]);
  const cur = (): Pt | null => out[out.length - 1] || null;
  const push = (p: Pt) => { const c = cur(); if (!c || Math.hypot(c[0] - p[0], c[1] - p[1]) > 1e-6) out.push(p); };
  const line = (to: Pt) => {
    const c = cur();
    if (!c) { push(to); return; }
    const n = Math.max(1, Math.ceil(Math.hypot(to[0] - c[0], to[1] - c[1]) / step));
    for (let k = 1; k <= n; k++) push([c[0] + ((to[0] - c[0]) * k) / n, c[1] + ((to[1] - c[1]) * k) / n]);
  };
  const curve = (f: (t: number) => Pt, approxLen: number) => {
    const n = Math.max(2, Math.ceil(approxLen / step));
    for (let k = 1; k <= n; k++) push(f(k / n));
  };
  while (i < tok.length) {
    const cmd = tok[i++].toUpperCase();
    if (cmd === 'M') { const p: Pt = [num(), num()]; if (!cur()) push(p); else line(p); }
    else if (cmd === 'L') line([num(), num()]);
    else if (cmd === 'Q') {
      const c0 = cur() || [0, 0], c1: Pt = [num(), num()], p: Pt = [num(), num()];
      curve((t) => [(1 - t) ** 2 * c0[0] + 2 * (1 - t) * t * c1[0] + t * t * p[0], (1 - t) ** 2 * c0[1] + 2 * (1 - t) * t * c1[1] + t * t * p[1]], dist(c0, c1) + dist(c1, p));
    } else if (cmd === 'C') {
      const c0 = cur() || [0, 0], a: Pt = [num(), num()], b: Pt = [num(), num()], p: Pt = [num(), num()];
      curve((t) => {
        const u = 1 - t;
        return [u ** 3 * c0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t ** 3 * p[0], u ** 3 * c0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t ** 3 * p[1]];
      }, dist(c0, a) + dist(a, b) + dist(b, p));
    } else if (cmd === 'O' || cmd === 'E') {
      const cx = num(), cy = num(), rx = num(), ry = cmd === 'E' ? num() : rx, a0 = num(), a1 = num();
      const at = (deg: number): Pt => [cx + rx * Math.cos((deg * Math.PI) / 180), cy + ry * Math.sin((deg * Math.PI) / 180)];
      if (cur()) line(at(a0)); else push(at(a0));
      curve((t) => at(a0 + (a1 - a0) * t), (Math.abs(a1 - a0) * Math.PI * Math.max(rx, ry)) / 180);
    } else break;
  }
  return out;
}
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polyLength(p: Pt[]) { let s = 0; for (let i = 1; i < p.length; i++) s += dist(p[i - 1], p[i]); return s; }

/** Evenly spaced points along a polyline. */
export function resample(p: Pt[], spacing: number): Pt[] {
  if (p.length < 2) return p.slice();
  const out: Pt[] = [p[0]];
  let need = spacing;
  for (let i = 1; i < p.length; i++) {
    let a = p[i - 1];
    const b = p[i];
    let seg = dist(a, b);
    while (seg >= need) {
      const t = need / seg;
      a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      out.push(a);
      seg -= need;
      need = spacing;
    }
    need -= seg;
  }
  const last = p[p.length - 1];
  if (dist(out[out.length - 1], last) > spacing * 0.3) out.push(last);
  return out;
}

/** Point and tangent angle (radians) at fraction t of the length. */
export function pointAt(p: Pt[], t: number): { pt: Pt; angle: number } {
  const L = polyLength(p) * Math.min(1, Math.max(0, t));
  let s = 0;
  for (let i = 1; i < p.length; i++) {
    const d = dist(p[i - 1], p[i]);
    if (s + d >= L && d > 0) {
      const k = (L - s) / d;
      return { pt: [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k], angle: Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0]) };
    }
    s += d;
  }
  const n = p.length;
  return { pt: p[n - 1], angle: n > 1 ? Math.atan2(p[n - 1][1] - p[n - 2][1], p[n - 1][0] - p[n - 2][0]) : 0 };
}

export function distToSegment(q: Pt, a: Pt, b: Pt) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L2)) : 0;
  return Math.hypot(q[0] - (a[0] + dx * t), q[1] - (a[1] + dy * t));
}
export function distToPoly(q: Pt, p: Pt[]) {
  if (p.length === 1) return dist(q, p[0]);
  let m = Infinity;
  for (let i = 1; i < p.length; i++) m = Math.min(m, distToSegment(q, p[i - 1], p[i]));
  return m;
}
export const toSvgPoints = (p: Pt[]) => p.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`).join(' ');
