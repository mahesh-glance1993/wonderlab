// Editable project model (pure, serialisable). A project is a stack of layers, each holding the
// list of operations that draw it, plus the undo/redo history. Rendering = replaying ops.
//
// Format (JSON, `v: 1`):
//   { v, w, h, paper, layers: [{ id, name, visible, locked, order, kind, template?, ops, base?, snap? }],
//     active, history: { undo: Action[], redo: Action[] }, palettes, recent, meta, ui }
//   op = { t: 'stroke', id, brush, color, size, opacity, seed, pts: [[x, y, pressure, tilt], …] }
//      | { t: 'fill', id, x, y, color, tol }  | { t: 'clear', id }
//   base = raster data URL replacing pruned ops (size budget); snap = cached raster after n ops.
import type { BrushId } from './brushes';
import { shortId, uid } from './rng';

export const PROJECT_VERSION = 1;
export type PaperId = 'smooth' | 'warm' | 'sketch' | 'watercolor' | 'canvas' | 'kraft';
export type Point = [number, number, number, number]; // x, y, pressure/intensity 0..1, tilt degrees

export interface StrokeOp { t: 'stroke'; id: string; brush: BrushId; color: string; size: number; opacity: number; seed: number; pts: Point[] }
export interface FillOp { t: 'fill'; id: string; x: number; y: number; color: string; tol: number }
export interface ClearOp { t: 'clear'; id: string }
export type Op = StrokeOp | FillOp | ClearOp;

export interface TemplateRef { kind: 'coloring'; id: string }
export interface Layer {
  id: string; name: string; visible: boolean; locked: boolean;
  kind: 'paint' | 'template';
  template?: TemplateRef;
  ops: Op[];
  base?: string;
  snap?: { n: number; opId: string; url: string };
}
export type LayerProps = Partial<Pick<Layer, 'name' | 'visible' | 'locked'>>;
export type Action =
  | { a: 'op'; layer: string; opId: string; op?: Op }
  | { a: 'addLayer'; id: string; index: number; layer?: Layer }
  | { a: 'delLayer'; id: string; index: number; layer?: Layer }
  | { a: 'props'; id: string; before: LayerProps; after: LayerProps }
  | { a: 'move'; id: string; from: number; to: number };

export interface Palette { id: string; name: string; colors: string[] }
export interface ToolState { brush: BrushId; color: string; size: number; opacity: number }
export interface Project {
  v: number; w: number; h: number; paper: PaperId;
  layers: Layer[]; // index 0 = bottom
  active: string;
  history: { undo: Action[]; redo: Action[] };
  palettes: Palette[];
  recent: string[];
  meta: { kind: 'paint' | 'color'; pageId?: string };
  ui?: ToolState;
}

export const CANVAS_SIZES = [
  { id: 'standard', label: 'Standard', w: 1024, h: 768 },
  { id: 'large', label: 'Large', w: 1600, h: 1200 },
  { id: 'square', label: 'Square', w: 1200, h: 1200 },
  { id: 'a4', label: 'A4 portrait', w: 1240, h: 1754 },
] as const;
export const PAPERS: { id: PaperId; label: string }[] = [
  { id: 'smooth', label: 'Smooth white' }, { id: 'warm', label: 'Warm cream' }, { id: 'sketch', label: 'Sketch paper' }, { id: 'watercolor', label: 'Watercolour paper' },
  { id: 'canvas', label: 'Canvas' }, { id: 'kraft', label: 'Brown kraft' },
];
export const MAX_UNDO = 250;

/** Round stroke points to keep the JSON compact. */
export const qpt = (x: number, y: number, p: number, tilt: number): Point => [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(p * 100) / 100, Math.round(tilt)];

export function newLayer(name: string, kind: Layer['kind'] = 'paint', template?: TemplateRef): Layer {
  return { id: shortId(), name, visible: true, locked: kind === 'template', kind, template, ops: [] };
}

export function createProject(o: { w: number; h: number; paper?: PaperId; template?: TemplateRef }): Project {
  const paint = newLayer(o.template ? 'Colours' : 'Layer 1');
  const layers = [paint];
  if (o.template) layers.push(newLayer('Outline', 'template', o.template));
  return {
    v: PROJECT_VERSION, w: o.w, h: o.h, paper: o.paper || 'smooth', layers, active: paint.id,
    history: { undo: [], redo: [] }, palettes: [], recent: [],
    meta: o.template ? { kind: 'color', pageId: o.template.id } : { kind: 'paint' },
  };
}

export const layerById = (p: Project, id: string) => p.layers.find((l) => l.id === id);
export const layerIndex = (p: Project, id: string) => p.layers.findIndex((l) => l.id === id);
export const activeLayer = (p: Project) => layerById(p, p.active);

/** Why a layer can't be painted on (or null if it can). Template layers are never editable. */
export function paintBlock(l: Layer | undefined): null | 'missing' | 'template' | 'locked' | 'hidden' {
  if (!l) return 'missing';
  if (l.kind === 'template') return 'template';
  if (l.locked) return 'locked';
  if (!l.visible) return 'hidden';
  return null;
}
export const canPaint = (l: Layer | undefined) => paintBlock(l) === null;

function push(p: Project, a: Action) {
  p.history.undo.push(a);
  if (p.history.undo.length > MAX_UNDO) p.history.undo.splice(0, p.history.undo.length - MAX_UNDO);
  p.history.redo = [];
}

/** Adds a stroke/fill/clear op to a layer. Refuses locked, hidden and template layers. */
export function addOp(p: Project, layerId: string, op: Op): boolean {
  const l = layerById(p, layerId);
  if (!canPaint(l)) return false;
  l!.ops.push(op);
  push(p, { a: 'op', layer: layerId, opId: op.id });
  return true;
}

export function addLayer(p: Project, name?: string): Layer {
  const l = newLayer(name || `Layer ${p.layers.filter((x) => x.kind === 'paint').length + 1}`);
  // insert above the active layer, but below a template layer that sits on top
  let idx = layerIndex(p, p.active) + 1;
  if (idx <= 0) idx = p.layers.length;
  p.layers.splice(idx, 0, l);
  p.active = l.id;
  push(p, { a: 'addLayer', id: l.id, index: idx });
  return l;
}

export function canDeleteLayer(p: Project, id: string) {
  const l = layerById(p, id);
  return !!l && l.kind !== 'template' && p.layers.filter((x) => x.kind === 'paint').length > 1;
}
export function deleteLayer(p: Project, id: string): boolean {
  if (!canDeleteLayer(p, id)) return false;
  const index = layerIndex(p, id);
  const [l] = p.layers.splice(index, 1);
  push(p, { a: 'delLayer', id, index, layer: l });
  fixActive(p, index);
  return true;
}

function fixActive(p: Project, near = 0) {
  if (layerById(p, p.active)?.kind === 'paint') return;
  const paints = p.layers.map((l, i) => ({ l, i })).filter((x) => x.l.kind === 'paint');
  if (!paints.length) return;
  paints.sort((a, b) => Math.abs(a.i - near) - Math.abs(b.i - near));
  p.active = paints[0].l.id;
}

export function setLayerProps(p: Project, id: string, after: LayerProps): boolean {
  const l = layerById(p, id);
  if (!l) return false;
  if (l.kind === 'template' && after.locked === false) return false; // templates stay locked
  const before: LayerProps = {};
  for (const k of Object.keys(after) as (keyof LayerProps)[]) (before as Record<string, unknown>)[k] = l[k];
  Object.assign(l, after);
  push(p, { a: 'props', id, before, after });
  return true;
}

/** Move a layer up (+1, towards the top) or down (-1). */
export function moveLayer(p: Project, id: string, dir: 1 | -1): boolean {
  const from = layerIndex(p, id), to = from + dir;
  if (from < 0 || to < 0 || to >= p.layers.length) return false;
  const [l] = p.layers.splice(from, 1);
  p.layers.splice(to, 0, l);
  push(p, { a: 'move', id, from, to });
  return true;
}

export interface Change { layers: string[]; structure: boolean }

export function undo(p: Project): Change | null {
  const a = p.history.undo.pop();
  if (!a) return null;
  const ch = revert(p, a);
  p.history.redo.push(a);
  return ch;
}
export function redo(p: Project): Change | null {
  const a = p.history.redo.pop();
  if (!a) return null;
  const ch = reapply(p, a);
  p.history.undo.push(a);
  return ch;
}

function revert(p: Project, a: Action): Change {
  switch (a.a) {
    case 'op': {
      const l = layerById(p, a.layer);
      if (l) {
        const i = l.ops.findIndex((o) => o.id === a.opId);
        if (i >= 0) a.op = l.ops.splice(i, 1)[0];
      }
      return { layers: [a.layer], structure: false };
    }
    case 'addLayer': {
      const i = layerIndex(p, a.id);
      if (i >= 0) a.layer = p.layers.splice(i, 1)[0];
      fixActive(p, a.index);
      return { layers: [], structure: true };
    }
    case 'delLayer': {
      if (a.layer) { p.layers.splice(Math.min(a.index, p.layers.length), 0, a.layer); delete a.layer; }
      p.active = a.id;
      return { layers: [a.id], structure: true };
    }
    case 'props': { const l = layerById(p, a.id); if (l) Object.assign(l, a.before); return { layers: [], structure: true }; }
    case 'move': { const i = layerIndex(p, a.id); if (i >= 0) { const [l] = p.layers.splice(i, 1); p.layers.splice(a.from, 0, l); } return { layers: [], structure: true }; }
  }
}
function reapply(p: Project, a: Action): Change {
  switch (a.a) {
    case 'op': {
      const l = layerById(p, a.layer);
      if (l && a.op) { l.ops.push(a.op); delete a.op; }
      return { layers: [a.layer], structure: false };
    }
    case 'addLayer': {
      if (a.layer) { p.layers.splice(Math.min(a.index, p.layers.length), 0, a.layer); delete a.layer; }
      p.active = a.id;
      return { layers: [a.id], structure: true };
    }
    case 'delLayer': {
      const i = layerIndex(p, a.id);
      if (i >= 0) a.layer = p.layers.splice(i, 1)[0];
      fixActive(p, a.index);
      return { layers: [], structure: true };
    }
    case 'props': { const l = layerById(p, a.id); if (l) Object.assign(l, a.after); return { layers: [], structure: true }; }
    case 'move': { const i = layerIndex(p, a.id); if (i >= 0) { const [l] = p.layers.splice(i, 1); p.layers.splice(a.to, 0, l); } return { layers: [], structure: true }; }
  }
}

// ---------- replay planning & size budget ----------

/** Where replay of a layer starts: a valid cached snapshot, the pruned base raster, or empty. */
export function replayPlan(l: Layer): { from: 'snap' | 'base' | 'empty'; url?: string; ops: Op[] } {
  const s = l.snap;
  if (s && s.n <= l.ops.length && l.ops[s.n - 1]?.id === s.opId) return { from: 'snap', url: s.url, ops: l.ops.slice(s.n) };
  return { from: l.base ? 'base' : 'empty', url: l.base, ops: l.ops };
}
export const SNAP_EVERY = 120;
/** True when a layer has enough ops since its last snapshot that a new raster snapshot would speed up reopening. */
export function wantsSnapshot(l: Layer): boolean {
  if (l.kind !== 'paint') return false;
  const plan = replayPlan(l);
  return plan.ops.length >= SNAP_EVERY;
}

/** Replace a layer's ops with a raster (keeps the picture, drops undo for that layer). */
export function bakeLayer(p: Project, id: string, rasterUrl: string) {
  const l = layerById(p, id);
  if (!l) return;
  l.base = rasterUrl;
  l.ops = [];
  delete l.snap;
  const keep = (a: Action) => !(a.a === 'op' && a.layer === id);
  p.history.undo = p.history.undo.filter(keep);
  p.history.redo = p.history.redo.filter(keep);
}
/** Drop the oldest history entries (keeps the picture as-is). */
export function trimHistory(p: Project, keep: number) {
  if (p.history.undo.length > keep) p.history.undo.splice(0, p.history.undo.length - keep);
  p.history.redo = p.history.redo.slice(-keep);
}

export const MAX_JSON = 3_800_000; // the server accepts 4.5 MB; leave headroom for thumb/title

// ---------- (de)serialisation ----------

export function toJSON(p: Project): object {
  return { ...p, layers: p.layers.map((l, order) => ({ ...l, order })) };
}
export const serialize = (p: Project) => JSON.stringify(toJSON(p));

export class ProjectFormatError extends Error {}
export function deserialize(input: string | unknown): Project {
  const o = (typeof input === 'string' ? JSON.parse(input) : structuredCloneSafe(input)) as Partial<Project> & { layers?: (Layer & { order?: number })[] };
  if (!o || typeof o !== 'object' || !Array.isArray(o.layers) || !(Number(o.w) > 0) || !(Number(o.h) > 0)) throw new ProjectFormatError('Not a WonderLab art project');
  if ((o.v ?? 1) > PROJECT_VERSION) throw new ProjectFormatError('This picture was made with a newer version of WonderLab');
  const layers = [...o.layers]
    .map((l, i) => ({ l, order: typeof l.order === 'number' ? l.order : i }))
    .sort((a, b) => a.order - b.order)
    .map(({ l }) => {
      const { order: _o, ...rest } = l as Layer & { order?: number };
      void _o;
      return { ...rest, kind: rest.kind === 'template' ? 'template' : 'paint', ops: Array.isArray(rest.ops) ? rest.ops : [], visible: rest.visible !== false, locked: rest.kind === 'template' ? true : !!rest.locked, name: String(rest.name || 'Layer') } as Layer;
    });
  const p: Project = {
    v: PROJECT_VERSION, w: Number(o.w), h: Number(o.h), paper: (o.paper as PaperId) || 'smooth', layers,
    active: String(o.active || ''),
    history: { undo: Array.isArray(o.history?.undo) ? o.history!.undo : [], redo: Array.isArray(o.history?.redo) ? o.history!.redo : [] },
    palettes: Array.isArray(o.palettes) ? o.palettes : [], recent: Array.isArray(o.recent) ? o.recent : [],
    meta: o.meta && typeof o.meta === 'object' ? o.meta : { kind: 'paint' }, ui: o.ui,
  };
  if (!p.layers.some((l) => l.kind === 'paint')) p.layers.unshift(newLayer('Layer 1'));
  fixActive(p, 0);
  return p;
}
function structuredCloneSafe(x: unknown) { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); }

export function cloneProject(p: Project): Project { return deserialize(serialize(p)); }
export const newArtworkId = () => uid();
