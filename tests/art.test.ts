import { describe, expect, it } from 'vitest';
import { PressureDetector, PressureInput, Smoother, calibrate, computeCalibration, tiltDegrees, type PressurePrefs } from '../src/features/art/engine/pressure';
import { dabParams } from '../src/features/art/engine/brushes';
import { dilate, floodFill, outlineMask } from '../src/features/art/engine/floodfill';
import {
  addLayer, addOp, canPaint, createProject, deleteLayer, deserialize, layerById, moveLayer, paintBlock, redo, replayPlan, serialize,
  setLayerProps, undo, bakeLayer, type StrokeOp, type FillOp, type Project,
} from '../src/features/art/engine/project';
import { colorName, compositeOver, hsvToRgb, parseHex, rgbToHsv, toHex } from '../src/features/art/engine/color';
import { parseStroke, polyLength } from '../src/features/art/tracing/path';
import { TOLERANCE, checkStroke, coverage, scoreTrace } from '../src/features/art/tracing/scoring';
import { SHEETS, guidePolys } from '../src/features/art/tracing/guides';
import { PAGES } from '../src/features/art/coloring/pages';
import { mergeGallery } from '../src/features/art/storage';

const AUTO: PressurePrefs = { pressureMode: 'auto', manualIntensity: 0.6 };

// ---------------------------------------------------------------- pressure
describe('pressure smoothing and mapping', () => {
  it('pen with varying pressure → varying widths (ink and pencil)', () => {
    const inp = new PressureInput();
    inp.begin();
    const seq = [0.1, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95, 0.95, 0.95];
    const out = seq.map((p) => inp.sample({ pointerType: 'pen', pressure: p, tiltX: 0, tiltY: 0 }, AUTO));
    expect(out.every((o) => o.source === 'pen')).toBe(true);
    const widths = out.map((o) => dabParams('ink', 20, o.intensity).radius);
    expect(widths[widths.length - 1]).toBeGreaterThan(widths[0] * 2);
    for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1]); // monotone ramp stays monotone
    const pencil = out.map((o) => dabParams('graphite', 10, o.intensity));
    expect(pencil[9].alpha).toBeGreaterThan(pencil[0].alpha);
  });

  it('mouse reporting constant 0.5 → manual intensity is used, never pressure', () => {
    const inp = new PressureInput();
    inp.begin();
    const out = Array.from({ length: 20 }, () => inp.sample({ pointerType: 'mouse', pressure: 0.5 }, { pressureMode: 'auto', manualIntensity: 0.3 }));
    expect(out.every((o) => o.source === 'manual' && Math.abs(o.intensity - 0.3) < 1e-9)).toBe(true);
    expect(inp.detector.detected).toBe(false);
    expect(inp.mode(AUTO)).toBe('manual');
    const w = out.map((o) => dabParams('ink', 20, o.intensity).radius);
    expect(new Set(w).size).toBe(1); // constant width
  });

  it('touch with constant placeholder values is not treated as pressure; varying touch force is', () => {
    const d = new PressureDetector();
    for (let i = 0; i < 10; i++) d.observe({ pointerType: 'touch', pressure: 1 });
    expect(d.detected).toBe(false);
    const d2 = new PressureDetector();
    [0.2, 0.25, 0.4, 0.6].forEach((p) => d2.observe({ pointerType: 'touch', pressure: p }));
    expect(d2.detected).toBe(true);
  });

  it('a pen that only reports 0.5 is treated as no pressure', () => {
    const inp = new PressureInput();
    const out = Array.from({ length: 10 }, () => inp.sample({ pointerType: 'pen', pressure: 0.5 }, AUTO));
    expect(out.every((o) => o.source === 'manual')).toBe(true);
  });

  it('manual mode ignores real pen pressure', () => {
    const inp = new PressureInput();
    const o = inp.sample({ pointerType: 'pen', pressure: 0.9 }, { pressureMode: 'manual', manualIntensity: 0.4 });
    expect(o.source).toBe('manual');
    expect(o.intensity).toBeCloseTo(0.4);
  });

  it('EMA smoothing damps jitter', () => {
    const s = new Smoother(0.3);
    const noisy = [0.5, 0.9, 0.1, 0.9, 0.1, 0.9, 0.1, 0.9];
    const sm = noisy.map((x) => s.next(x));
    const range = (a: number[]) => Math.max(...a) - Math.min(...a);
    expect(range(sm.slice(2))).toBeLessThan(range(noisy.slice(2)) / 2);
  });

  it('calibration min/max remaps the learner range to 0..1', () => {
    const cal = { min: 0.2, max: 0.6 };
    expect(calibrate(0.2, cal)).toBeCloseTo(0);
    expect(calibrate(0.4, cal)).toBeCloseTo(0.5);
    expect(calibrate(0.6, cal)).toBeCloseTo(1);
    expect(calibrate(0.9, cal)).toBe(1);
    expect(calibrate(0.1, cal)).toBe(0);
    expect(calibrate(0.37)).toBeCloseTo(0.37); // no calibration = identity
    // a light-handed learner reaches full width with calibration
    const inp = new PressureInput();
    const prefs: PressurePrefs = { ...AUTO, calibration: cal };
    let last = 0;
    for (let i = 0; i < 30; i++) last = inp.sample({ pointerType: 'pen', pressure: 0.6 }, prefs).intensity;
    expect(last).toBeGreaterThan(0.95);
    const uncal = new PressureInput();
    let l2 = 0;
    for (let i = 0; i < 30; i++) l2 = uncal.sample({ pointerType: 'pen', pressure: 0.6 }, AUTO).intensity;
    expect(l2).toBeLessThan(0.65);
  });

  it('computeCalibration from light and heavy pads', () => {
    const light = [0.1, 0.12, 0.15, 0.11, 0.14, 0.13, 0.12];
    const heavy = [0.7, 0.75, 0.8, 0.78, 0.72, 0.74];
    const c = computeCalibration(light, heavy)!;
    expect(c.min).toBeGreaterThanOrEqual(0.1);
    expect(c.min).toBeLessThan(0.16);
    expect(c.max).toBeGreaterThan(0.7);
    expect(computeCalibration([0.5, 0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5, 0.5])).toBeNull(); // no pressure device
    expect(computeCalibration([0.1], [0.9])).toBeNull(); // not enough samples
  });

  it('tilt widens pencil shading and lightens it', () => {
    expect(tiltDegrees(0, 0)).toBe(0);
    expect(tiltDegrees(45, 0)).toBe(45);
    const up = dabParams('colorPencil', 10, 0.5, 0), tilted = dabParams('colorPencil', 10, 0.5, tiltDegrees(60, 0));
    expect(tilted.radius).toBeGreaterThan(up.radius * 1.8);
    expect(tilted.alpha).toBeLessThan(up.alpha);
  });
});

// ---------------------------------------------------------------- flood fill
function buffer(w: number, h: number) { return new Uint8ClampedArray(w * h * 4); }
function drawRectOutline(px: Uint8ClampedArray, w: number, x0: number, y0: number, x1: number, y1: number, gap?: [number, number]) {
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) if (!gap || gap[0] !== x || gap[1] !== y) px.set([0, 0, 0, 255], (y * w + x) * 4);
  for (let y = y0; y <= y1; y++) for (const x of [x0, x1]) if (!gap || gap[0] !== x || gap[1] !== y) px.set([0, 0, 0, 255], (y * w + x) * 4);
}
const alphaAt = (px: Uint8ClampedArray, w: number, x: number, y: number) => px[(y * w + x) * 4 + 3];

describe('bounded flood fill', () => {
  const W = 20, H = 20;
  it('fills the enclosed region fully and never crosses the outline', () => {
    const outline = buffer(W, H);
    drawRectOutline(outline, W, 4, 4, 15, 15);
    const boundary = dilate(outlineMask(outline, W, H), W, H, 1);
    const colour = buffer(W, H); // empty colour layer
    const r = floodFill(colour, W, H, 9, 9, [255, 0, 0, 255], { boundary, tolerance: 10 });
    // inside of the 1px-dilated outline: x,y in 6..13 → 8×8 = 64 pixels
    expect(r.count).toBe(64);
    for (let y = 6; y <= 13; y++) for (let x = 6; x <= 13; x++) expect(alphaAt(colour, W, x, y)).toBe(255);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 4 || x > 15 || y < 4 || y > 15) expect(alphaAt(colour, W, x, y)).toBe(0);
  });

  it('does not leak through a 1-pixel gap thanks to the dilated mask', () => {
    const outline = buffer(W, H);
    drawRectOutline(outline, W, 4, 4, 15, 15, [9, 4]); // gap in the top edge
    const raw = outlineMask(outline, W, H);
    const leaky = floodFill(buffer(W, H), W, H, 9, 9, [0, 0, 255, 255], { boundary: raw });
    expect(leaky.count).toBeGreaterThan(200); // without dilation it escapes
    const safe = floodFill(buffer(W, H), W, H, 9, 9, [0, 0, 255, 255], { boundary: dilate(raw, W, H, 1) });
    expect(safe.count).toBeLessThanOrEqual(64);
    expect(safe.count).toBeGreaterThan(50);
  });

  it('respects colour tolerance on the colour layer and does nothing on the outline', () => {
    const colour = buffer(W, H);
    for (let x = 0; x < W; x++) colour.set([0, 200, 0, 255], (10 * W + x) * 4); // a green line splits the layer
    const r = floodFill(colour, W, H, 2, 2, [255, 255, 0, 255], { tolerance: 20 });
    expect(r.count).toBe(W * 10); // rows 0..9 only
    expect(alphaAt(colour, W, 2, 15)).toBe(0);
    const outline = buffer(W, H);
    drawRectOutline(outline, W, 4, 4, 15, 15);
    const none = floodFill(buffer(W, H), W, H, 4, 4, [1, 2, 3, 255], { boundary: outlineMask(outline, W, H) });
    expect(none.count).toBe(0);
  });

  it('bleed tucks colour under the outline without escaping', () => {
    const outline = buffer(W, H);
    drawRectOutline(outline, W, 4, 4, 15, 15);
    const boundary = dilate(outlineMask(outline, W, H), W, H, 1);
    const colour = buffer(W, H);
    floodFill(colour, W, H, 9, 9, [255, 0, 0, 255], { boundary, bleed: 2 });
    expect(alphaAt(colour, W, 4, 9)).toBe(255); // under the line
    expect(alphaAt(colour, W, 2, 9)).toBe(0); // outside stays empty
  });
});

// ---------------------------------------------------------------- project
const stroke = (id: string, brush: StrokeOp['brush'] = 'marker'): StrokeOp => ({ t: 'stroke', id, brush, color: '#ff0000', size: 10, opacity: 1, seed: 42, pts: [[10, 10, 0.5, 0], [20, 20, 0.7, 15]] });

describe('project format, undo/redo and layers', () => {
  it('serialise → deserialise round-trip restores everything and undo/redo still work after reload', () => {
    const p = createProject({ w: 1024, h: 768, paper: 'watercolor' });
    const l1 = p.active;
    expect(addOp(p, l1, stroke('a'))).toBe(true);
    expect(addOp(p, l1, stroke('b', 'watercolor'))).toBe(true);
    const l2 = addLayer(p, 'Sky').id;
    const fill: FillOp = { t: 'fill', id: 'f1', x: 5, y: 6, color: '#00ff00', tol: 32 };
    expect(addOp(p, l2, fill)).toBe(true);
    setLayerProps(p, l1, { name: 'Ground' });
    undo(p); // undo rename
    p.palettes = [{ id: 'p1', name: 'Sea', colors: ['#0000ff'] }];

    const json = serialize(p);
    const q = deserialize(json);
    expect(q.w).toBe(1024);
    expect(q.paper).toBe('watercolor');
    expect(q.layers.map((l) => l.name)).toEqual(['Layer 1', 'Sky']);
    expect(layerById(q, l1)!.ops.map((o) => o.id)).toEqual(['a', 'b']);
    expect((layerById(q, l1)!.ops[0] as StrokeOp).pts[1]).toEqual([20, 20, 0.7, 15]);
    expect(q.palettes[0].colors).toEqual(['#0000ff']);
    expect(q.history.redo.length).toBe(1); // the undone rename can be redone after reload

    redo(q);
    expect(layerById(q, l1)!.name).toBe('Ground');
    undo(q); // rename
    undo(q); // fill on Sky
    expect(layerById(q, l2)!.ops).toEqual([]);
    undo(q); // add layer
    expect(layerById(q, l2)).toBeUndefined();
    undo(q); // stroke b
    expect(layerById(q, l1)!.ops.map((o) => o.id)).toEqual(['a']);
    // round-trip again mid-history
    const r = deserialize(serialize(q));
    redo(r); redo(r); redo(r);
    expect(layerById(r, l1)!.ops.map((o) => o.id)).toEqual(['a', 'b']);
    expect(layerById(r, l2)!.ops.map((o) => o.id)).toEqual(['f1']);
    // a new edit clears redo
    addOp(r, l1, stroke('c'));
    expect(r.history.redo).toEqual([]);
  });

  it('serialised layers carry an explicit order and are restored in that order', () => {
    const p = createProject({ w: 100, h: 100 });
    const a = p.active, b = addLayer(p, 'B').id, c = addLayer(p, 'C').id;
    moveLayer(p, c, -1);
    const json = JSON.parse(serialize(p));
    expect(json.layers.map((l: { id: string; order: number }) => [l.id, l.order])).toEqual([[a, 0], [c, 1], [b, 2]]);
    json.layers.reverse(); // order field wins over array order
    const q = deserialize(json);
    expect(q.layers.map((l) => l.id)).toEqual([a, c, b]);
    undo(q);
    expect(q.layers.map((l) => l.id)).toEqual([a, b, c]);
  });

  it('delete layer is undoable and restores its content', () => {
    const p = createProject({ w: 100, h: 100 });
    const a = p.active;
    const b = addLayer(p).id;
    addOp(p, b, stroke('s1'));
    expect(deleteLayer(p, b)).toBe(true);
    expect(layerById(p, b)).toBeUndefined();
    const q = deserialize(serialize(p));
    undo(q);
    expect(layerById(q, b)!.ops.map((o) => o.id)).toEqual(['s1']);
    expect(q.active).toBe(b);
    redo(q);
    expect(layerById(q, b)).toBeUndefined();
    expect(q.active).toBe(a);
  });

  it('locked, hidden and template layers reject edits; eraser cannot touch the template', () => {
    const p = createProject({ w: 800, h: 600, template: { kind: 'coloring', id: 'cat' } });
    const tpl = p.layers.find((l) => l.kind === 'template')!;
    const paint = p.layers.find((l) => l.kind === 'paint')!;
    expect(p.layers[p.layers.length - 1].id).toBe(tpl.id); // outline sits on top
    expect(tpl.locked).toBe(true);
    expect(paintBlock(tpl)).toBe('template');
    expect(addOp(p, tpl.id, stroke('e1', 'eraser'))).toBe(false);
    expect(addOp(p, tpl.id, { t: 'fill', id: 'f', x: 1, y: 1, color: '#000000', tol: 1 })).toBe(false);
    expect(tpl.ops).toEqual([]);
    expect(setLayerProps(p, tpl.id, { locked: false })).toBe(false); // can't unlock the template
    expect(deleteLayer(p, tpl.id)).toBe(false);
    expect(deleteLayer(p, paint.id)).toBe(false); // last paint layer stays
    // locked paint layer
    setLayerProps(p, paint.id, { locked: true });
    expect(canPaint(paint)).toBe(false);
    expect(addOp(p, paint.id, stroke('e2', 'eraser'))).toBe(false);
    setLayerProps(p, paint.id, { locked: false, visible: false });
    expect(paintBlock(paint)).toBe('hidden');
    setLayerProps(p, paint.id, { visible: true });
    expect(addOp(p, paint.id, stroke('e3', 'eraser'))).toBe(true);
    // template survives a round trip still locked, even if the JSON was tampered with
    const json = JSON.parse(serialize(p));
    json.layers.find((l: { kind: string }) => l.kind === 'template').locked = false;
    const q = deserialize(json);
    expect(q.layers.find((l) => l.kind === 'template')!.locked).toBe(true);
  });

  it('layer order moves up/down within bounds; new layers go above the active one but below the outline', () => {
    const p = createProject({ w: 100, h: 100, template: { kind: 'coloring', id: 'fish' } });
    const n = addLayer(p, 'Extra');
    expect(p.layers.map((l) => l.kind)).toEqual(['paint', 'paint', 'template']);
    expect(p.layers[1].id).toBe(n.id);
    expect(moveLayer(p, p.layers[0].id, -1)).toBe(false);
    expect(moveLayer(p, p.layers[2].id, 1)).toBe(false);
    expect(moveLayer(p, n.id, -1)).toBe(true);
    expect(p.layers[0].id).toBe(n.id);
  });

  it('replay plan uses a valid snapshot and falls back after undo past it; baking drops that layer’s undo', () => {
    const p = createProject({ w: 100, h: 100 });
    const id = p.active;
    ['a', 'b', 'c'].forEach((k) => addOp(p, id, stroke(k)));
    const l = layerById(p, id)!;
    l.snap = { n: 2, opId: 'b', url: 'data:snap' };
    let plan = replayPlan(l);
    expect(plan.from).toBe('snap');
    expect(plan.ops.map((o) => o.id)).toEqual(['c']);
    undo(p); undo(p); // removes c and b → snapshot no longer matches
    plan = replayPlan(l);
    expect(plan.from).toBe('empty');
    expect(plan.ops.map((o) => o.id)).toEqual(['a']);
    bakeLayer(p, id, 'data:base');
    expect(replayPlan(l)).toEqual({ from: 'base', url: 'data:base', ops: [] });
    expect(p.history.undo.filter((a) => a.a === 'op')).toEqual([]);
  });

  it('rejects files that are not projects', () => {
    expect(() => deserialize('{"hello":1}')).toThrow();
    expect(() => deserialize({ v: 99, w: 10, h: 10, layers: [] })).toThrow();
  });

  it('a long session stays well under the size budget', () => {
    const p: Project = createProject({ w: 1600, h: 1200 });
    for (let i = 0; i < 300; i++) {
      const pts = Array.from({ length: 60 }, (_, k) => [100 + k * 3.3, 200 + Math.sin(k) * 40, 0.55, 0] as [number, number, number, number]);
      addOp(p, p.active, { t: 'stroke', id: `s${i}`, brush: 'colorPencil', color: '#123456', size: 8, opacity: 1, seed: i, pts });
    }
    expect(serialize(p).length).toBeLessThan(4_000_000);
  });
});

// ---------------------------------------------------------------- tracing
describe('tracing scoring', () => {
  const L = SHEETS.find((s) => s.id === 'capitals')!.guides.find((g) => g.label === 'L')!;
  const T = SHEETS.find((s) => s.id === 'capitals')!.guides.find((g) => g.label === 'T')!;
  const tol = TOLERANCE.medium;
  const wobble = (pts: [number, number][], amp: number) => pts.map(([x, y], i) => [x + Math.sin(i) * amp, y + Math.cos(i * 1.3) * amp] as [number, number]);

  it('a faithful trace covers the path and earns 3 stars', () => {
    const polys = guidePolys(L);
    const user = polys.map((p) => wobble(p, 1.5));
    const s = scoreTrace(polys, user, tol);
    expect(s.coverage).toBeGreaterThan(0.95);
    expect(s.accuracy).toBeGreaterThan(0.95);
    expect(s.stars).toBe(3);
    expect(s.orderOk).toBe(true);
    expect(s.directionOk).toBe(true);
  });

  it('half a trace scores lower coverage', () => {
    const polys = guidePolys(L);
    const half = polys[0].slice(0, Math.floor(polys[0].length / 2));
    const s = scoreTrace(polys, [half], tol);
    expect(s.coverage).toBeLessThan(0.65);
    expect(s.coverage).toBeLessThan(scoreTrace(polys, polys, tol).coverage - 0.3);
    expect(s.stars).toBeLessThan(2);
  });

  it('scribbling outside the tolerance lowers accuracy', () => {
    const polys = guidePolys(L);
    const off = [...polys[0], ...Array.from({ length: 80 }, (_, i) => [60 + i * 0.3, 20 + i * 0.4] as [number, number])];
    const s = scoreTrace(polys, [off], tol);
    expect(s.accuracy).toBeLessThan(0.75);
    expect(s.feedback.join(' ')).toMatch(/grey path/);
  });

  it('wrong direction and wrong stroke order are reported in guided mode but not in free mode', () => {
    const polys = guidePolys(T); // 1: top bar, 2: stem
    const reversed = [polys[0].slice().reverse(), polys[1]];
    const sDir = scoreTrace(polys, reversed, tol);
    expect(sDir.directionOk).toBe(false);
    expect(checkStroke(polys[0], polys[0].slice().reverse(), tol).forward).toBe(false);
    expect(checkStroke(polys[0], polys[0], tol).forward).toBe(true);
    const swapped = [polys[1], polys[0]];
    const sOrd = scoreTrace(polys, swapped, tol, { ordered: true });
    expect(sOrd.orderOk).toBe(false);
    expect(sOrd.feedback.join(' ')).toMatch(/line 1/);
    const free = scoreTrace(polys, swapped, tol, { ordered: false });
    expect(free.stars).toBe(3);
  });

  it('closed shapes check direction by winding', () => {
    const O = SHEETS.find((s) => s.id === 'capitals')!.guides.find((g) => g.label === 'O')!;
    const [ring] = guidePolys(O);
    expect(checkStroke(ring, ring, tol).forward).toBe(true);
    expect(checkStroke(ring, ring.slice().reverse(), tol).forward).toBe(false);
  });

  it('tolerance changes how forgiving coverage is', () => {
    const [line] = guidePolys(L);
    const shifted = line.map(([x, y]) => [x + 6, y] as [number, number]);
    expect(coverage(line, shifted, TOLERANCE.easy)).toBeGreaterThan(0.9);
    expect(coverage(line, shifted, TOLERANCE.hard)).toBeLessThan(0.5);
  });

  it('every guide parses into non-empty strokes; all required sets exist', () => {
    const labels = SHEETS.flatMap((s) => s.guides.map((g) => g.label));
    for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') expect(labels).toContain(c);
    for (const c of 'abcdefghijklmnopqrstuvwxyz') expect(labels).toContain(c);
    for (let n = 0; n <= 10; n++) expect(labels).toContain(String(n));
    for (const s of SHEETS) for (const g of s.guides) for (const p of guidePolys(g)) { expect(p.length).toBeGreaterThan(1); expect(polyLength(p)).toBeGreaterThan(2); }
    expect(SHEETS.find((s) => s.id === 'numbers')!.guides.every((g) => g.sayTe)).toBe(true);
  });

  it('path arcs follow the requested direction', () => {
    const p = parseStroke('O0 0 10 0 90'); // right → down
    expect(p[0][0]).toBeCloseTo(10);
    expect(p[p.length - 1][1]).toBeCloseTo(10);
  });
});

// ---------------------------------------------------------------- misc
describe('colour, pages and gallery merge', () => {
  it('HSV/HEX conversions round-trip', () => {
    for (const hex of ['#ff0000', '#00ff00', '#1e88e5', '#808080', '#000000', '#ffffff']) {
      const [h, s, v] = rgbToHsv(parseHex(hex)!);
      expect(toHex(hsvToRgb(h, s, v))).toBe(hex);
    }
    expect(parseHex('#abc')).toEqual([170, 187, 204]);
    expect(parseHex('nope')).toBeNull();
    expect(colorName('#e53935')).toBe('red');
    expect(compositeOver([[255, 0, 0, 128]], [255, 255, 255])).toEqual([255, 127, 127]);
  });

  it('has at least 15 original colouring pages across all categories, with easier ones', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(15);
    for (const c of ['animals', 'nature', 'vehicles', 'patterns', 'science']) expect(PAGES.some((p) => p.category === c)).toBe(true);
    for (const id of ['solar-system', 'plant-parts', 'magnet', 'circuit', 'water-cycle']) expect(PAGES.some((p) => p.id === id)).toBe(true);
    expect(PAGES.filter((p) => p.level === 'easy').length).toBeGreaterThanOrEqual(5);
    for (const p of PAGES) { expect(p.svg.startsWith('<svg')).toBe(true); expect(p.svg).not.toMatch(/fill="(?!none|#1d1d1d)/); }
  });

  it('gallery merge: unsynced/newer local drafts win; clean drafts deleted elsewhere drop out', () => {
    const server = [
      { id: 'a', title: 'Server A', version: 3, updatedAt: 1000 },
      { id: 'b', title: 'Server B', version: 1, updatedAt: 2000 },
    ];
    const local = [
      { id: 'a', title: 'Local A', data: {}, baseVersion: 3, dirty: true, updatedAt: 500_000 },
      { id: 'b', title: 'Old B', data: {}, baseVersion: 1, dirty: false, updatedAt: 1_000_000 },
      { id: 'c', title: 'New offline', data: {}, baseVersion: 0, dirty: true, updatedAt: 3_000_000 },
      { id: 'd', title: 'Deleted elsewhere', data: {}, baseVersion: 2, dirty: false, updatedAt: 100 },
    ];
    const { items, staleLocal } = mergeGallery(server, local);
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    expect(byId.a.title).toBe('Local A');
    expect(byId.a.unsynced).toBe(true);
    expect(byId.b.title).toBe('Server B');
    expect(byId.c.unsynced).toBe(true);
    expect(byId.d).toBeUndefined();
    expect(staleLocal).toEqual(['d']);
    // offline (no server list): everything local is shown
    expect(mergeGallery(null, local).items.length).toBe(4);
    expect(mergeGallery(server, local, ['a']).items.some((i) => i.id === 'a')).toBe(false);
  });
});
