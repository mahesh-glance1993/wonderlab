// Engine functions for the Art Studio (called from Kotlin as "art.<name>").
// Pure data and rules shared with the website: colouring pages (SVG line art converted into simple
// native drawing commands), tracing sheets + scoring, brush/canvas/paper definitions, colour names.
// Drawing itself is native (android.graphics) — see feature/art/engine/*.kt.
import { CATEGORIES, PAGES, pageById } from '../../src/features/art/coloring/pages';
import { SHEETS, sheetById, guidePolys, type Guide } from '../../src/features/art/tracing/guides';
import { pointAt, polyLength, type Pt } from '../../src/features/art/tracing/path';
import { TOLERANCE, checkStroke as checkStrokeFn, scoreTrace as scoreTraceFn, type Tolerance } from '../../src/features/art/tracing/scoring';
import { BRUSHES, BRUSH_ORDER, EARLY_BRUSHES, SIZE_PRESETS } from '../../src/features/art/engine/brushes';
import { CANVAS_SIZES, PAPERS } from '../../src/features/art/engine/project';
import { PAPER_COLORS } from '../../src/features/art/engine/paper';
import { colorName as colorNameFn } from '../../src/features/art/engine/color';

// ---------------- colouring pages ----------------

export const categories = () => CATEGORIES;
export const pages = () => PAGES.map(({ svg: _s, ...p }) => p);

type M = [number, number, number, number, number, number]; // a b c d e f (SVG matrix)
const ID: M = [1, 0, 0, 1, 0, 0];
const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
function parseTransform(t: string | undefined): M {
  let m: M = ID;
  if (!t) return m;
  const re = /(translate|scale|rotate|matrix)\s*\(([^)]*)\)/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(t))) {
    const a = x[2].split(/[\s,]+/).filter(Boolean).map(Number);
    let n: M = ID;
    if (x[1] === 'translate') n = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
    else if (x[1] === 'scale') n = [a[0], 0, 0, a.length > 1 ? a[1] : a[0], 0, 0];
    else if (x[1] === 'matrix') n = [a[0], a[1], a[2], a[3], a[4], a[5]];
    else {
      const r = ((a[0] || 0) * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), cx = a[1] || 0, cy = a[2] || 0;
      n = mul(mul([1, 0, 0, 1, cx, cy], [c, s, -s, c, 0, 0]), [1, 0, 0, 1, -cx, -cy]);
    }
    m = mul(m, n);
  }
  return m;
}
const attrs = (s: string) => {
  const o: Record<string, string> = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(s))) o[x[1]] = x[2];
  return o;
};
const n = (v: string | undefined, d = 0) => (v === undefined || v === '' ? d : Number(v));
const unescapeXml = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

export interface DrawItem { d: string; m: M; sw: number; fill: string | null; stroke: string | null; clip?: [number, number, number, number] }
export interface DrawText { x: number; y: number; text: string; size: number; anchor: string; bold: boolean; m: M; fill: string }
export interface DrawList { w: number; h: number; items: DrawItem[]; texts: DrawText[] }

/**
 * Converts one of the website's SVG colouring pages into native drawing commands: every shape becomes
 * an SVG path string (drawn with PathParser on Android) with its accumulated transform and stroke width.
 */
export function svgToDrawList(svg: string): DrawList {
  const root = attrs((svg.match(/<svg\b([^>]*)>/) || ['', ''])[1]);
  const vb = (root.viewBox || '0 0 800 600').split(/[\s,]+/).map(Number);
  const out: DrawList = { w: vb[2] || 800, h: vb[3] || 600, items: [], texts: [] };
  const clips: Record<string, [number, number, number, number]> = {};
  // clip paths (only rect clips are used by the pages)
  const cre = /<clipPath\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/clipPath>/g;
  let cx: RegExpExecArray | null;
  while ((cx = cre.exec(svg))) {
    const r = /<rect\b([^>]*)\/?>/.exec(cx[2]);
    if (r) { const a = attrs(r[1]); clips[cx[1]] = [n(a.x), n(a.y), n(a.width), n(a.height)]; }
  }
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  interface St { m: M; sw: number; fill: string | null; stroke: string | null; clip?: [number, number, number, number]; size: number; anchor: string; bold: boolean }
  const stack: St[] = [{ m: ID, sw: 1, fill: '#000', stroke: null, size: 16, anchor: 'start', bold: false }];
  const tagRe = /<(\/?)(\w+)\b([^>]*?)(\/?)>|([^<]+)/g;
  let t: RegExpExecArray | null;
  let textOpen: { a: Record<string, string>; st: St } | null = null;
  const inherit = (cur: St, a: Record<string, string>): St => {
    const clipId = a['clip-path']?.match(/url\(#([^)]+)\)/)?.[1];
    return {
      m: mul(cur.m, parseTransform(a.transform)),
      sw: a['stroke-width'] !== undefined ? n(a['stroke-width']) : cur.sw,
      fill: a.fill !== undefined ? (a.fill === 'none' ? null : a.fill) : cur.fill,
      stroke: a.stroke !== undefined ? (a.stroke === 'none' ? null : a.stroke) : cur.stroke,
      clip: clipId && clips[clipId] ? clips[clipId] : cur.clip,
      size: a['font-size'] !== undefined ? n(a['font-size']) : cur.size,
      anchor: a['text-anchor'] || cur.anchor,
      bold: a['font-weight'] !== undefined ? Number(a['font-weight']) >= 600 || a['font-weight'] === 'bold' : cur.bold,
    };
  };
  const f = (v: number) => Math.round(v * 100) / 100;
  while ((t = tagRe.exec(body))) {
    if (t[5] !== undefined) { if (textOpen) (textOpen.a as Record<string, string>).__text = ((textOpen.a.__text || '') + t[5]); continue; }
    const closing = t[1] === '/', name = t[2], selfClose = t[4] === '/';
    const cur = stack[stack.length - 1];
    if (closing) {
      if (name === 'g' && stack.length > 1) stack.pop();
      if (name === 'text' && textOpen) {
        const { a, st } = textOpen;
        out.texts.push({ x: n(a.x), y: n(a.y), text: unescapeXml((a.__text || '').trim()), size: st.size, anchor: st.anchor, bold: st.bold, m: st.m, fill: st.fill || '#1d1d1d' });
        textOpen = null;
      }
      continue;
    }
    if (name === 'svg') continue;
    const a = attrs(t[3]);
    const st = inherit(cur, a);
    if (name === 'g') { if (!selfClose) stack.push(st); continue; }
    if (name === 'text') { textOpen = { a, st }; if (selfClose) textOpen = null; continue; }
    let d = '';
    switch (name) {
      case 'path': d = a.d || ''; break;
      case 'circle': { const x = n(a.cx), y = n(a.cy), r = n(a.r); d = `M${f(x - r)} ${f(y)}A${r} ${r} 0 1 0 ${f(x + r)} ${f(y)}A${r} ${r} 0 1 0 ${f(x - r)} ${f(y)}Z`; break; }
      case 'ellipse': { const x = n(a.cx), y = n(a.cy), rx = n(a.rx), ry = n(a.ry); d = `M${f(x - rx)} ${f(y)}A${rx} ${ry} 0 1 0 ${f(x + rx)} ${f(y)}A${rx} ${ry} 0 1 0 ${f(x - rx)} ${f(y)}Z`; break; }
      case 'rect': { const x = n(a.x), y = n(a.y), w = n(a.width), h = n(a.height); d = `M${x} ${y}H${x + w}V${y + h}H${x}Z`; break; }
      case 'line': d = `M${n(a.x1)} ${n(a.y1)}L${n(a.x2)} ${n(a.y2)}`; break;
      case 'polyline': case 'polygon': {
        const p = (a.points || '').trim().split(/[\s,]+/).map(Number);
        for (let i = 0; i + 1 < p.length; i += 2) d += `${i ? 'L' : 'M'}${p[i]} ${p[i + 1]}`;
        if (name === 'polygon') d += 'Z';
        break;
      }
      default: continue;
    }
    if (d) out.items.push({ d, m: st.m, sw: st.sw, fill: st.fill, stroke: st.stroke, clip: st.clip });
  }
  return out;
}

const drawCache = new Map<string, DrawList>();
/** Native drawing commands for one colouring page (cached), or null for an unknown id. */
export function pageDrawList(id: string): DrawList | null {
  const hit = drawCache.get(id);
  if (hit) return hit;
  const p = pageById(id);
  if (!p) return null;
  const dl = svgToDrawList(p.svg);
  drawCache.set(id, dl);
  return dl;
}

// ---------------- tracing ----------------

/** Arrow positions along a stroke (same rule as the website's GuideSvg): roughly every 30 units. */
function arrowsFor(pl: Pt[]) {
  const L = polyLength(pl);
  const k = Math.max(1, Math.round(L / 30));
  return Array.from({ length: k }, (_, i) => { const r = pointAt(pl, (i + 0.6) / (k + 0.2)); return { x: r.pt[0], y: r.pt[1], angle: r.angle }; });
}
const round = (p: Pt[]) => p.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
const guideOut = (g: Guide) => {
  const polys = guidePolys(g);
  return { ...g, polys: polys.map(round), arrows: polys.map(arrowsFor), lengths: polys.map(polyLength) };
};
/** Sheet list for the picker (with the preview guide fully expanded). */
export const sheets = () => SHEETS.map((s) => {
  const preview = s.guides[Math.min(s.guides.length - 1, s.id === 'capitals' || s.id === 'small' ? 0 : 1)];
  return { id: s.id, title: s.title, titleTe: s.titleTe, icon: s.icon, minTier: s.minTier, count: s.guides.length, preview: guideOut(preview) };
});
/** One sheet with every guide's polylines, arrows and stroke lengths. */
export function sheet(id: string) {
  const s = sheetById(id);
  return s ? { id: s.id, title: s.title, titleTe: s.titleTe, icon: s.icon, minTier: s.minTier, guides: s.guides.map(guideOut) } : null;
}
export const tolerances = () => TOLERANCE;
export const checkStroke = (guide: Pt[], user: Pt[], tol: number) => checkStrokeFn(guide, user, tol);
export const scoreTrace = (guides: Pt[][], users: Pt[][], tol: number, ordered: boolean) => scoreTraceFn(guides, users, tol, { ordered });
/** Guided mode: checks one stroke against the current line, and explains a rejection like the website. */
export function guidedStroke(sheetId: string, index: number, current: number, done: boolean[], user: Pt[], tolName: Tolerance) {
  const g = sheetById(sheetId)?.guides[index];
  if (!g) return null;
  const polys = guidePolys(g), tol = TOLERANCE[tolName] ?? TOLERANCE.medium;
  const chk = checkStrokeFn(polys[current], user, tol);
  if (chk.coverage >= 0.7 && chk.accuracy >= 0.5 && chk.forward) return { ok: true, check: chk, message: '' };
  const other = polys.findIndex((p, i) => i !== current && !done[i] && checkStrokeFn(p, user, tol).coverage >= 0.6);
  let message: string;
  if (other >= 0) message = `That was line ${other + 1}. Do line ${current + 1} first — start at green dot ${current + 1}.`;
  else if (!chk.forward && chk.coverage >= 0.4) message = 'Oops, that went the other way. Start at the green dot and follow the arrows.';
  else if (chk.accuracy < 0.5) message = 'Try to stay inside the grey path.';
  else message = 'Keep going all the way to the end of the line.';
  return { ok: false, check: chk, message };
}
/** Scores a finished tracing for a sheet guide. */
export function scoreGuide(sheetId: string, index: number, users: Pt[][], tolName: Tolerance, ordered: boolean) {
  const g = sheetById(sheetId)?.guides[index];
  if (!g) return null;
  return scoreTraceFn(guidePolys(g), users, TOLERANCE[tolName] ?? TOLERANCE.medium, { ordered });
}

// ---------------- studio definitions ----------------

export const brushes = () => ({ defs: BRUSH_ORDER.map((id) => BRUSHES[id]), order: BRUSH_ORDER, early: EARLY_BRUSHES, sizes: SIZE_PRESETS });
export const canvasSizes = () => CANVAS_SIZES;
export const papers = () => PAPERS.map((p) => ({ ...p, color: PAPER_COLORS[p.id] }));
export const colorName = (hex: string, lang: 'en' | 'te' = 'en') => colorNameFn(hex, lang);
