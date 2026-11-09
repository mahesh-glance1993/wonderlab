// Canvas renderer: one bitmap per layer (the cache), a stroke buffer, and deterministic replay of
// ops. The same StrokePainter is used live (points streamed in as the pointer moves) and when
// replaying a saved project, so reopening reproduces the picture exactly.
import { BRUSHES, dabParams, dabSpacing, type BrushDef } from './brushes';
import { compositeOver, mix, parseHex, rgba, shade, toHex, type RGB, type RGBA } from './color';
import { dilate, floodFill, outlineMask } from './floodfill';
import { GRAIN, PAPER_COLORS, grainAlpha, grainTile } from './paper';
import { replayPlan, type FillOp, type Layer, type Op, type PaperId, type Point, type Project, type StrokeOp, type TemplateRef } from './project';
import { mulberry32 } from './rng';

export type TemplateResolver = (ref: TemplateRef) => Promise<HTMLImageElement | null>;
type C2D = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
// Everything that takes part in replay uses CPU-backed canvases (willReadFrequently): layers are read
// back (fill, oil pick-up, eyedropper), and keeping one rendering path stops the browser switching a
// canvas between software and GPU mid-session, which would make replays differ slightly.
// Draw-only output canvases (flatten, thumbnail) use the default context.
const ctxOf = (c: HTMLCanvasElement) => c.getContext('2d', { willReadFrequently: true })!;
const ctxDraw = (c: HTMLCanvasElement) => c.getContext('2d')!;

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('image failed to load'));
    i.src = src;
  });
}

// ---------- grain patterns ----------
const tileCache = new Map<string, HTMLCanvasElement>();
function grainTileCanvas(paper: PaperId, color: RGB, coverage: number, softness: number): HTMLCanvasElement {
  const bucket = Math.round(coverage * 16) / 16;
  const key = `${paper}|${toHex(color)}|${bucket}|${softness}`;
  let t = tileCache.get(key);
  if (t) return t;
  const g = grainTile(paper);
  t = makeCanvas(GRAIN, GRAIN);
  const ctx = ctxOf(t), img = ctx.createImageData(GRAIN, GRAIN);
  for (let i = 0; i < GRAIN * GRAIN; i++) {
    img.data[i * 4] = color[0]; img.data[i * 4 + 1] = color[1]; img.data[i * 4 + 2] = color[2];
    img.data[i * 4 + 3] = grainAlpha(g[i], bucket, softness);
  }
  ctx.putImageData(img, 0, 0);
  if (tileCache.size > 80) tileCache.delete(tileCache.keys().next().value!);
  tileCache.set(key, t);
  return t;
}

// soft round sprite (white→transparent radial falloff, tinted per colour) for the airbrush
const spriteCache = new Map<string, HTMLCanvasElement>();
function softSprite(color: RGB): HTMLCanvasElement {
  const key = toHex(color);
  let c = spriteCache.get(key);
  if (c) return c;
  c = makeCanvas(64, 64);
  const ctx = ctxOf(c), g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, rgba(color, 1));
  g.addColorStop(0.5, rgba(color, 0.55));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  if (spriteCache.size > 32) spriteCache.delete(spriteCache.keys().next().value!);
  spriteCache.set(key, c);
  return c;
}

// ---------- stroke painter ----------
export class StrokePainter {
  private last: Point | null = null;
  private carry = 0;
  private rnd: () => number;
  private n = 0;
  private dir = 0;
  private def: BrushDef;
  private base: RGB;
  private cur: RGB;
  private lctx: C2D;
  private bctx: C2D;
  private patterns = new Map<number, CanvasPattern>();
  bbox = [Infinity, Infinity, -Infinity, -Infinity];
  private st: LayerStack;
  op: StrokeOp;
  constructor(st: LayerStack, layer: HTMLCanvasElement, op: StrokeOp) {
    this.st = st;
    this.op = op;
    this.def = BRUSHES[op.brush] || BRUSHES.marker;
    this.rnd = mulberry32(op.seed);
    this.base = parseHex(this.def.fixedColor || op.color) || [0, 0, 0];
    this.cur = [...this.base];
    this.lctx = ctxOf(layer);
    this.bctx = ctxOf(st.buffer);
  }
  /** CSS opacity to show the live buffer with, approximating the final composite. */
  get previewAlpha() { return this.def.strokeAlpha * this.op.opacity * (this.op.brush === 'watercolor' ? 0.55 : 1); }
  get usesBuffer() { return this.def.target === 'buffer'; }

  add(pts: Point[]) {
    for (const p of pts) {
      if (!this.last) { this.dab(p); this.last = p; this.carry = this.spacing(p); continue; }
      const a = this.last, dx = p[0] - a[0], dy = p[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 1e-6) continue;
      this.dir = Math.atan2(dy, dx);
      let pos = this.carry;
      while (pos <= len) {
        const t = pos / len;
        const q: Point = [a[0] + dx * t, a[1] + dy * t, a[2] + (p[2] - a[2]) * t, a[3] + (p[3] - a[3]) * t];
        this.dab(q);
        pos += this.spacing(q);
      }
      this.carry = pos - len;
      this.last = p;
    }
  }
  private spacing(p: Point) { return dabSpacing(this.op.brush, dabParams(this.op.brush, this.op.size, p[2], p[3]).radius); }
  private grow(x: number, y: number, r: number) {
    const b = this.bbox;
    b[0] = Math.min(b[0], x - r); b[1] = Math.min(b[1], y - r); b[2] = Math.max(b[2], x + r); b[3] = Math.max(b[3], y + r);
  }
  private grainFill(coverage: number, softness: number) {
    const key = Math.round(coverage * 16);
    let p = this.patterns.get(key);
    if (!p) { p = this.bctx.createPattern(grainTileCanvas(this.st.project.paper, this.base, coverage, softness), 'repeat')!; this.patterns.set(key, p); }
    return p;
  }
  private circle(ctx: C2D, x: number, y: number, r: number) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2); ctx.fill(); }

  private dab(q: Point) {
    const op = this.op, [x, y, i, tilt] = q;
    const d = dabParams(op.brush, op.size, i, tilt);
    const r = d.radius;
    this.n++;
    this.grow(x, y, r + 3);
    const b = this.bctx;
    switch (op.brush) {
      case 'graphite':
      case 'colorPencil':
      case 'crayon': {
        const jx = (this.rnd() - 0.5) * r * 0.25, jy = (this.rnd() - 0.5) * r * 0.25;
        b.globalAlpha = d.alpha;
        b.fillStyle = this.grainFill(d.coverage, op.brush === 'crayon' ? 0.05 : 0.22);
        this.circle(b, x + jx, y + jy, r);
        b.globalAlpha = 1;
        break;
      }
      case 'marker':
      case 'ink':
      case 'watercolor':
        b.fillStyle = rgba(this.base, 1);
        this.circle(b, x, y, r);
        break;
      case 'airbrush': {
        b.globalAlpha = d.alpha;
        b.drawImage(softSprite(this.base), x - r, y - r, r * 2, r * 2);
        b.globalAlpha = 1;
        b.fillStyle = rgba(this.base, Math.min(1, d.alpha * 3));
        for (let k = 0; k < 3; k++) {
          const a = this.rnd() * Math.PI * 2, rr = r * Math.sqrt(this.rnd()) * 0.9;
          b.fillRect(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1.3, 1.3);
        }
        break;
      }
      case 'oil': {
        const l = this.lctx;
        if (this.n % 4 === 1) { // pick up wet paint just ahead of the brush
          const sx = Math.round(x + Math.cos(this.dir) * r * 0.9), sy = Math.round(y + Math.sin(this.dir) * r * 0.9);
          if (sx >= 0 && sy >= 0 && sx < this.st.w && sy < this.st.h) {
            const px = l.getImageData(sx, sy, 1, 1).data;
            if (px[3] > 30) this.cur = mix(this.cur, [px[0], px[1], px[2]], 0.2 * (px[3] / 255));
          }
        }
        this.cur = mix(this.cur, this.base, 0.06); // brush reloads slowly
        l.globalAlpha = d.alpha * op.opacity;
        l.fillStyle = rgba(this.cur, 1);
        this.circle(l, x, y, r);
        // bristle streaks
        const nx = -Math.sin(this.dir), ny = Math.cos(this.dir), tx = Math.cos(this.dir), ty = Math.sin(this.dir);
        l.lineWidth = Math.max(1, r * 0.12);
        l.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          const off = (this.rnd() * 2 - 1) * r * 0.8;
          l.globalAlpha = 0.28 * op.opacity;
          l.strokeStyle = rgba(shade(this.cur, (this.rnd() - 0.5) * 0.3), 1);
          l.beginPath();
          l.moveTo(x + nx * off - tx * r * 0.5, y + ny * off - ty * r * 0.5);
          l.lineTo(x + nx * off + tx * r * 0.5, y + ny * off + ty * r * 0.5);
          l.stroke();
        }
        l.globalAlpha = 1;
        break;
      }
      case 'eraser': {
        const l = this.lctx;
        l.save();
        l.globalCompositeOperation = 'destination-out';
        l.globalAlpha = op.opacity;
        l.fillStyle = '#000';
        this.circle(l, x, y, r);
        l.restore();
        break;
      }
    }
  }

  /** Composite the buffer into the layer and clear it. */
  finish() {
    if (!this.usesBuffer || this.bbox[0] === Infinity) return;
    const W = this.st.w, H = this.st.h;
    const x0 = Math.max(0, Math.floor(this.bbox[0])), y0 = Math.max(0, Math.floor(this.bbox[1]));
    const x1 = Math.min(W, Math.ceil(this.bbox[2])), y1 = Math.min(H, Math.ceil(this.bbox[3]));
    const w = x1 - x0, h = y1 - y0;
    if (w <= 0 || h <= 0) { this.bctx.clearRect(0, 0, W, H); return; }
    const b = this.bctx;
    if (this.op.brush === 'watercolor') {
      // wet edge: subtract a blurred copy so the middle of the wash gets lighter than its rim
      const k = Math.max(3, Math.min(18, this.op.size / 8)); // blur radius ≈ rim width
      const pad = Math.ceil(k * 2);
      const bx0 = Math.max(0, x0 - pad), by0 = Math.max(0, y0 - pad), bw = Math.min(W, x1 + pad) - bx0, bh = Math.min(H, y1 + pad) - by0;
      const blur = this.st.scratch(bw, bh), bl = ctxOf(blur);
      bl.clearRect(0, 0, bw, bh);
      if (typeof bl.filter === 'string') {
        bl.filter = `blur(${k.toFixed(1)}px)`;
        bl.drawImage(this.st.buffer, bx0, by0, bw, bh, 0, 0, bw, bh);
        bl.filter = 'none';
      } else { // fallback blur: downscale then upscale with smoothing
        const sw = Math.max(1, Math.ceil(bw / k)), sh = Math.max(1, Math.ceil(bh / k));
        const small = this.st.scratchSmall(sw, sh), sctx = ctxOf(small);
        sctx.clearRect(0, 0, sw, sh);
        sctx.drawImage(this.st.buffer, bx0, by0, bw, bh, 0, 0, sw, sh);
        bl.imageSmoothingEnabled = true;
        bl.drawImage(small, 0, 0, sw, sh, 0, 0, bw, bh);
      }
      b.save();
      b.globalCompositeOperation = 'destination-out';
      b.globalAlpha = 0.65;
      b.drawImage(blur, 0, 0, bw, bh, bx0, by0, bw, bh);
      // granulation: pigment settles in the paper's valleys
      b.globalAlpha = 0.3;
      b.fillStyle = b.createPattern(grainTileCanvas(this.st.project.paper, [0, 0, 0], 0.45, 0.3), 'repeat')!;
      b.fillRect(x0, y0, w, h);
      b.restore();
    }
    const l = this.lctx;
    l.save();
    l.globalAlpha = this.def.strokeAlpha * this.op.opacity;
    l.drawImage(this.st.buffer, x0, y0, w, h, x0, y0, w, h);
    l.restore();
    b.clearRect(x0, y0, w, h);
  }
  /** Throw the stroke away (e.g. a pinch started). Direct brushes need the layer re-rendered. */
  cancel() { this.bctx.clearRect(0, 0, this.st.w, this.st.h); }
}

// ---------- layer stack ----------
export class LayerStack {
  canvases = new Map<string, HTMLCanvasElement>();
  paper: HTMLCanvasElement;
  buffer: HTMLCanvasElement;
  templateMask: Uint8Array | null = null;
  private images = new Map<string, HTMLImageElement>();
  private scratchC: HTMLCanvasElement | null = null;
  private scratchS: HTMLCanvasElement | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  /** In-memory bitmaps of a layer after every CHECK_EVERY ops, so undo replays only a few ops. */
  private checkpoints: { layer: string; n: number; opId: string; canvas: HTMLCanvasElement }[] = [];
  static CHECK_EVERY = 8;
  static MAX_CHECKPOINTS = 6; // ~7 MB each at 1600×1200; oldest are evicted

  project: Project;
  private resolveTemplate: TemplateResolver;
  constructor(project: Project, resolveTemplate: TemplateResolver) {
    this.project = project;
    this.resolveTemplate = resolveTemplate;
    this.paper = makeCanvas(project.w, project.h);
    this.buffer = makeCanvas(project.w, project.h);
  }
  get w() { return this.project.w; }
  get h() { return this.project.h; }

  canvas(id: string) {
    let c = this.canvases.get(id);
    if (!c) { c = makeCanvas(this.w, this.h); c.dataset.layer = id; this.canvases.set(id, c); }
    return c;
  }
  scratch(w: number, h: number) {
    if (!this.scratchC || this.scratchC.width < w || this.scratchC.height < h) this.scratchC = makeCanvas(Math.max(w, this.scratchC?.width || 0), Math.max(h, this.scratchC?.height || 0));
    return this.scratchC;
  }
  scratchSmall(w: number, h: number) {
    if (!this.scratchS || this.scratchS.width < w || this.scratchS.height < h) this.scratchS = makeCanvas(Math.max(w, this.scratchS?.width || 0), Math.max(h, this.scratchS?.height || 0));
    return this.scratchS;
  }
  /** Serialise async rendering so re-renders never interleave. */
  run<T>(fn: () => Promise<T> | T): Promise<T> {
    const p = this.queue.then(fn, fn);
    this.queue = p.catch(() => undefined);
    return p;
  }

  renderPaper() {
    const ctx = ctxOf(this.paper);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = PAPER_COLORS[this.project.paper] || '#fff';
    ctx.fillRect(0, 0, this.w, this.h);
    if (this.project.paper !== 'smooth') {
      // subtle shading of the paper tooth
      ctx.fillStyle = ctx.createPattern(grainTileCanvas(this.project.paper, this.project.paper === 'kraft' ? [90, 60, 30] : [120, 110, 95], 0.55, 0.45), 'repeat')!;
      ctx.globalAlpha = this.project.paper === 'kraft' ? 0.18 : 0.12;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = 1;
    }
  }

  private async image(url: string) {
    let i = this.images.get(url);
    if (!i) { i = await loadImage(url); this.images.set(url, i); }
    return i;
  }

  async renderLayer(l: Layer) {
    const c = this.canvas(l.id), ctx = ctxOf(c);
    if (l.kind === 'template') {
      const img = l.template ? await this.resolveTemplate(l.template).catch(() => null) : null;
      ctx.clearRect(0, 0, this.w, this.h);
      if (img) {
        const iw = img.naturalWidth || img.width || this.w, ih = img.naturalHeight || img.height || this.h;
        const s = Math.min((this.w * 0.96) / iw, (this.h * 0.96) / ih);
        ctx.drawImage(img, (this.w - iw * s) / 2, (this.h - ih * s) / 2, iw * s, ih * s);
      }
      this.templateMask = dilate(outlineMask(ctx.getImageData(0, 0, this.w, this.h).data, this.w, this.h), this.w, this.h, 1);
      return;
    }
    // forget checkpoints from a different branch of history
    this.checkpoints = this.checkpoints.filter((cp) => cp.layer !== l.id || cp.n > l.ops.length || l.ops[cp.n - 1]?.id === cp.opId);
    const cps = this.checkpoints.filter((cp) => cp.layer === l.id && cp.n <= l.ops.length);
    const best = cps.reduce<(typeof cps)[number] | null>((a, b) => (!a || b.n > a.n ? b : a), null);
    const plan = replayPlan(l);
    const planStart = l.ops.length - plan.ops.length;
    ctx.clearRect(0, 0, this.w, this.h);
    let start: number;
    if (best && best.n >= planStart) {
      ctx.drawImage(best.canvas, 0, 0);
      start = best.n;
    } else {
      const img = plan.url ? await this.image(plan.url).catch(() => null) : null;
      if (img) ctx.drawImage(img, 0, 0, this.w, this.h);
      start = planStart;
    }
    for (let i = start; i < l.ops.length; i++) {
      this.applyOp(l, l.ops[i]);
      if (l.ops.length - i <= LayerStack.CHECK_EVERY * 3) this.checkpoint(l, i + 1);
    }
  }

  /** Call after an op was committed to a layer (live drawing). */
  committed(l: Layer) { this.checkpoint(l, l.ops.length); }
  private checkpoint(l: Layer, n: number) {
    if (!n || n % LayerStack.CHECK_EVERY || l.kind !== 'paint') return;
    const opId = l.ops[n - 1].id;
    if (this.checkpoints.some((cp) => cp.layer === l.id && cp.n === n && cp.opId === opId)) return;
    const reuse = this.checkpoints.length >= LayerStack.MAX_CHECKPOINTS ? this.checkpoints.shift()!.canvas : makeCanvas(this.w, this.h);
    const ctx = ctxOf(reuse);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.drawImage(this.canvas(l.id), 0, 0);
    this.checkpoints.push({ layer: l.id, n, opId, canvas: reuse });
  }

  async renderAll() {
    // templates first: fills in paint layers use the outline as their boundary
    const order = [...this.project.layers].sort((a, b) => (a.kind === 'template' ? -1 : 0) - (b.kind === 'template' ? -1 : 0));
    if (!order.some((l) => l.kind === 'template')) this.templateMask = null;
    for (const l of order) await this.renderLayer(l);
    this.renderPaper();
    for (const id of [...this.canvases.keys()]) if (!this.project.layers.some((l) => l.id === id)) { this.canvases.get(id)!.remove(); this.canvases.delete(id); }
  }

  applyOp(l: Layer, op: Op) {
    const c = this.canvas(l.id);
    if (op.t === 'stroke') { const sp = new StrokePainter(this, c, op); sp.add(op.pts); sp.finish(); }
    else if (op.t === 'fill') this.fill(c, op);
    else if (op.t === 'clear') ctxOf(c).clearRect(0, 0, this.w, this.h);
  }

  painter(layerId: string, op: StrokeOp) { return new StrokePainter(this, this.canvas(layerId), op); }

  /** Bounded bucket fill on a paint layer (outline layer = boundary). Returns filled pixel count. */
  fill(c: HTMLCanvasElement, op: FillOp): number {
    const ctx = ctxOf(c);
    const img = ctx.getImageData(0, 0, this.w, this.h);
    const col = parseHex(op.color) || [0, 0, 0];
    const r = floodFill(img.data, this.w, this.h, op.x, op.y, [col[0], col[1], col[2], 255], { tolerance: op.tol, boundary: this.templateMask || undefined, bleed: this.templateMask ? 2 : 0 });
    if (r.count) ctx.putImageData(img, 0, 0);
    return r.count;
  }
  /** Would a fill at x,y hit the outline itself? */
  onOutline(x: number, y: number) {
    const m = this.templateMask;
    return !!m && m[Math.floor(y) * this.w + Math.floor(x)] === 1;
  }

  flatten(withPaper = true): HTMLCanvasElement {
    const out = makeCanvas(this.w, this.h), ctx = ctxDraw(out);
    if (withPaper) ctx.drawImage(this.paper, 0, 0);
    for (const l of this.project.layers) if (l.visible) ctx.drawImage(this.canvas(l.id), 0, 0);
    return out;
  }
  thumbnail(max = 320): string {
    const flat = this.flatten(true);
    const s = Math.min(1, max / Math.max(this.w, this.h));
    const t = makeCanvas(Math.round(this.w * s), Math.round(this.h * s));
    const ctx = ctxDraw(t);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(flat, 0, 0, t.width, t.height);
    return t.toDataURL('image/jpeg', 0.72);
  }
  /** Colour under a point on the visible picture (eyedropper). */
  pick(x: number, y: number): string {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return '#000000';
    const paper = ctxOf(this.paper).getImageData(x, y, 1, 1).data;
    const stack: RGBA[] = [];
    for (const l of this.project.layers) {
      if (!l.visible) continue;
      const d = ctxOf(this.canvas(l.id)).getImageData(x, y, 1, 1).data;
      stack.push([d[0], d[1], d[2], d[3]]);
    }
    return toHex(compositeOver(stack, [paper[0], paper[1], paper[2]]));
  }
  rasterUrl(id: string) { return this.canvas(id).toDataURL('image/png'); }
}
