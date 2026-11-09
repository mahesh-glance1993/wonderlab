// Painting studio: layered canvas with media brushes, bounded fill, eyedropper, zoom/pan,
// undo/redo, pressure & tilt, autosave. Used for free painting and for colouring pages
// (a colouring page is a project with a locked outline template layer).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../lib/app';
import { onSync, retrySync, type SyncStatus } from '../../../lib/sync';
import { Button, IconButton, Page, Segmented, celebrate, toast } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { BRUSHES, BRUSH_ORDER, EARLY_BRUSHES, SIZE_PRESETS, type BrushId } from '../engine/brushes';
import { colorName } from '../engine/color';
import { PressureInput, type IntensitySource, type PressurePrefs } from '../engine/pressure';
import {
  CANVAS_SIZES, MAX_JSON, PAPERS, activeLayer, addLayer, addOp, bakeLayer, createProject, deleteLayer, deserialize, layerById, moveLayer,
  paintBlock, qpt, redo, serialize, setLayerProps, toJSON, trimHistory, undo, wantsSnapshot,
  type Change, type FillOp, type PaperId, type Palette, type Point, type Project, type StrokeOp,
} from '../engine/project';
import { LayerStack, type StrokePainter } from '../engine/render';
import { newSeed, shortId } from '../engine/rng';
import { pageById } from '../coloring/pages';
import { resolveTemplate } from '../coloring/template';
import { loadArtwork, storeArtwork } from '../storage';
import { ColorPanel } from './ColorPanel';
import { LayersPanel } from './LayersPanel';
import { CalibrationPad } from './Calibration';
import { RenameDialog } from './RenameDialog';
import { downloadCanvas } from './artFile';

type Tool = 'brush' | 'fill' | 'eyedropper' | 'hand';
interface View { s: number; tx: number; ty: number }
const FILL_TOL: Record<string, number> = { small: 12, medium: 40, large: 90 };

export default function Studio() {
  const { id: routeId } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { profile, presentation, prefs, updatePrefs, lang, award, setLastActivity } = useApp();
  const pid = profile!.id;
  const early = presentation?.tier === 'early';
  const allowTyping = presentation?.allowTyping !== false;

  // ---------- document ----------
  const idRef = useRef(routeId!);
  const projRef = useRef<Project | null>(null);
  const stackRef = useRef<LayerStack | null>(null);
  const baseVersionRef = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [title, setTitle] = useState('My picture');
  const titleRef = useRef(title);
  titleRef.current = title;
  const [, setVer] = useState(0);
  const bump = useCallback(() => setVer((v) => v + 1), []);

  // ---------- tools ----------
  const [tool, setToolState] = useState<Tool>('brush');
  const [brush, setBrush] = useState<BrushId>(early ? 'crayon' : 'colorPencil');
  const [color, setColor] = useState('#1e88e5');
  const [size, setSize] = useState(BRUSHES[early ? 'crayon' : 'colorPencil'].defaultSize);
  const [opacity, setOpacity] = useState(1);
  const [fillTol, setFillTol] = useState<'small' | 'medium' | 'large'>('medium');
  const [intensity, setIntensity] = useState(prefs.manualIntensity);
  const [source, setSource] = useState<IntensitySource>('manual');
  const [zoom, setZoom] = useState(100);
  const [panelOpen, setPanelOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 900);
  const [panelTab, setPanelTab] = useState<'colour' | 'brush' | 'layers'>('colour');
  const [msg, setMsg] = useState('');
  const [calib, setCalib] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [local, setLocal] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sync, setSync] = useState<SyncStatus>('idle');

  const toolRef = useRef(tool), brushRef = useRef(brush), colorRef = useRef(color), sizeRef = useRef(size), opacityRef = useRef(opacity), tolRef = useRef(fillTol);
  toolRef.current = tool; brushRef.current = brush; colorRef.current = color; sizeRef.current = size; opacityRef.current = opacity; tolRef.current = fillTol;
  const pprefs: PressurePrefs = { pressureMode: prefs.pressureMode, manualIntensity: intensity, calibration: prefs.calibration };
  const prefsRef = useRef(pprefs);
  prefsRef.current = pprefs;
  const inputRef = useRef(new PressureInput());
  const spaceRef = useRef(false);
  const strokeRef = useRef<null | { pointerId: number; painter: StrokePainter; op: StrokeOp; layerId: string; type: string; at: number }>(null);
  const prevTool = useRef<Tool>('brush');

  const vpRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ s: 1, tx: 0, ty: 0 });
  const autoFit = useRef(true);

  const announce = useCallback((m: string) => { setMsg(''); requestAnimationFrame(() => setMsg(m)); }, []);
  useEffect(() => { if (!msg) return; const t = window.setTimeout(() => setMsg(''), 5000); return () => window.clearTimeout(t); }, [msg]);

  // ---------- view ----------
  const applyView = useCallback(() => {
    const v = viewRef.current;
    if (hostRef.current) hostRef.current.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.s})`;
    setZoom(Math.round(v.s * 100));
  }, []);
  const fit = useCallback(() => {
    const vp = vpRef.current, p = projRef.current;
    if (!vp || !p) return;
    const W = vp.clientWidth, H = vp.clientHeight;
    const s = Math.max(0.05, Math.min((W - 24) / p.w, (H - 24) / p.h));
    viewRef.current = { s, tx: (W - p.w * s) / 2, ty: (H - p.h * s) / 2 };
    autoFit.current = true;
    applyView();
  }, [applyView]);
  const zoomBy = useCallback((f: number, cx?: number, cy?: number) => {
    const vp = vpRef.current;
    if (!vp) return;
    const v = viewRef.current;
    const x = cx ?? vp.clientWidth / 2, y = cy ?? vp.clientHeight / 2;
    const s2 = Math.min(8, Math.max(0.05, v.s * f));
    viewRef.current = { s: s2, tx: x - (x - v.tx) * (s2 / v.s), ty: y - (y - v.ty) * (s2 / v.s) };
    autoFit.current = false;
    applyView();
  }, [applyView]);

  const syncDom = useCallback(() => {
    const host = hostRef.current, st = stackRef.current, p = projRef.current;
    if (!host || !st || !p) return;
    const els: HTMLCanvasElement[] = [st.paper];
    for (const l of p.layers) {
      const c = st.canvas(l.id);
      c.style.display = l.visible ? '' : 'none';
      c.setAttribute('aria-hidden', 'true');
      els.push(c);
      if (l.id === p.active) els.push(st.buffer);
    }
    if (!p.layers.some((l) => l.id === p.active)) els.push(st.buffer);
    els.forEach((c, i) => { if (host.children[i] !== c) host.insertBefore(c, host.children[i] || null); });
    while (host.children.length > els.length) host.lastChild!.remove();
  }, []);

  // ---------- load ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = idRef.current;
      let p: Project;
      let ttl = 'My picture';
      const loaded = await loadArtwork(pid, id).catch(() => null);
      if (loaded) {
        try { p = deserialize(loaded.data); } catch { if (!cancelled) setStatus('error'); return; }
        ttl = loaded.title;
        baseVersionRef.current = loaded.baseVersion;
      } else {
        const page = sp.get('page') ? pageById(sp.get('page')!) : undefined;
        const sz = CANVAS_SIZES.find((s) => s.id === sp.get('size')) || (page ? CANVAS_SIZES[1] : CANVAS_SIZES[0]);
        const paper = (PAPERS.find((x) => x.id === sp.get('paper'))?.id || 'smooth') as PaperId;
        p = createProject({ w: sz.w, h: sz.h, paper, template: page ? { kind: 'coloring', id: page.id } : undefined });
        ttl = page ? page.title : 'My picture';
      }
      const st = new LayerStack(p, resolveTemplate);
      await st.renderAll();
      if (cancelled) return;
      projRef.current = p;
      stackRef.current = st;
      if (p.ui) {
        setBrush(p.ui.brush in BRUSHES ? p.ui.brush : 'colorPencil');
        setColor(p.ui.color); setSize(p.ui.size); setOpacity(p.ui.opacity);
      } else if (p.meta.kind === 'color') { setBrush(early ? 'crayon' : 'colorPencil'); setToolState('fill'); }
      setTitle(ttl);
      setStatus('ready');
      setLastActivity(`/art/paint/${id}`, ttl);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    syncDom();
    fit();
    const vp = vpRef.current!;
    let last = { w: vp.clientWidth, h: vp.clientHeight };
    const ro = new ResizeObserver(() => {
      if (autoFit.current) { fit(); return; }
      const v = viewRef.current; // keep the same part of the picture centred
      viewRef.current = { ...v, tx: v.tx + (vp.clientWidth - last.w) / 2, ty: v.ty + (vp.clientHeight - last.h) / 2 };
      last = { w: vp.clientWidth, h: vp.clientHeight };
      applyView();
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, [status, syncDom, fit, applyView]);

  // ---------- saving ----------
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const savedOnce = useRef(false);

  const prepare = (p: Project, st: LayerStack) => {
    const webp = (id: string) => { const u = st.canvas(id).toDataURL('image/webp', 0.92); return u.startsWith('data:image/webp') ? u : st.rasterUrl(id); };
    let size = serialize(p).length;
    for (const l of p.layers) {
      if (!wantsSnapshot(l)) continue;
      const url = webp(l.id);
      const old = l.snap?.url.length || 0;
      if (size - old + url.length < MAX_JSON * 0.8) { l.snap = { n: l.ops.length, opId: l.ops[l.ops.length - 1].id, url }; size = size - old + url.length; }
    }
    if (size <= MAX_JSON) return;
    // too big: bake the heaviest layers into rasters (keeps the picture; drops their undo steps)
    const heavy = p.layers.filter((l) => l.kind === 'paint').map((l) => ({ l, n: JSON.stringify(l.ops).length + (l.snap?.url.length || 0) })).sort((a, b) => b.n - a.n);
    for (const { l } of heavy) {
      bakeLayer(p, l.id, webp(l.id));
      if (serialize(p).length <= MAX_JSON) return;
    }
    trimHistory(p, 10);
  };

  const saveNow = useCallback(async () => {
    const p = projRef.current, st = stackRef.current;
    if (!p || !st || !dirtyRef.current) return;
    if (strokeRef.current || savingRef.current) { window.clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => void saveNow(), 800); return; }
    savingRef.current = true;
    dirtyRef.current = false;
    setLocal('saving');
    try {
      await st.run(() => prepare(p, st));
      p.ui = { brush: brushRef.current, color: colorRef.current, size: sizeRef.current, opacity: opacityRef.current };
      const data = toJSON(p);
      const thumb = st.thumbnail();
      await storeArtwork(pid, { id: idRef.current, title: titleRef.current, data, thumb }, baseVersionRef.current);
      setLocal('saved');
      if (!savedOnce.current) { savedOnce.current = true; void award('art-first-artwork'); }
    } catch {
      dirtyRef.current = true;
      setLocal('error');
    } finally { savingRef.current = false; }
  }, [pid, award]);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void saveNow(), 1500);
  }, [saveNow]);

  useEffect(() => onSync((s) => setSync(s)), []);
  useEffect(() => {
    const hide = () => { if (document.visibilityState === 'hidden') void saveNow(); };
    const ph = () => void saveNow();
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', ph);
    document.body.classList.add('art-editing');
    return () => {
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('pagehide', ph);
      document.body.classList.remove('art-editing');
      window.clearTimeout(timerRef.current);
      void saveNow();
    };
  }, [saveNow]);
  // The server kept both copies after an offline edit clash: keep working on our copy.
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ pid: string; originalId: string; copyId: string }>).detail;
      if (d.pid !== pid || d.originalId !== idRef.current) return;
      idRef.current = d.copyId;
      baseVersionRef.current = 1;
      window.history.replaceState(window.history.state, '', `/art/paint/${d.copyId}`);
      toast('This picture changed on another device, so your version was kept as a separate copy.');
    };
    window.addEventListener('wl-art-conflict', on);
    return () => window.removeEventListener('wl-art-conflict', on);
  }, [pid]);
  // keep manual intensity in prefs (debounced)
  useEffect(() => {
    if (Math.abs(intensity - prefs.manualIntensity) < 0.005) return;
    const t = window.setTimeout(() => void updatePrefs({ manualIntensity: Math.round(intensity * 100) / 100 }), 700);
    return () => window.clearTimeout(t);
  }, [intensity, prefs.manualIntensity, updatePrefs]);

  // ---------- edits ----------
  const afterChange = useCallback((ch: Change | null) => {
    if (!ch) return;
    const p = projRef.current!, st = stackRef.current!;
    void st.run(async () => { for (const id of ch.layers) { const l = layerById(p, id); if (l) await st.renderLayer(l); } });
    syncDom();
    markDirty();
    bump();
  }, [syncDom, markDirty, bump]);
  const doUndo = useCallback(() => { if (strokeRef.current || !projRef.current) return; const ch = undo(projRef.current); if (ch) { afterChange(ch); announce('Undone'); } }, [afterChange, announce]);
  const doRedo = useCallback(() => { if (strokeRef.current || !projRef.current) return; const ch = redo(projRef.current); if (ch) { afterChange(ch); announce('Redone'); } }, [afterChange, announce]);

  const setTool = useCallback((t: Tool, b?: BrushId) => {
    if (t !== 'eyedropper') prevTool.current = t;
    setToolState(t);
    if (b) {
      setBrush(b);
      setSize(BRUSHES[b].defaultSize);
      announce(`${lang === 'te' ? BRUSHES[b].labelTe : BRUSHES[b].label} selected. ${BRUSHES[b].hint}`);
    } else announce(t === 'fill' ? 'Fill bucket selected. Tap inside a shape to fill it.' : t === 'eyedropper' ? 'Colour picker selected. Tap the picture to pick a colour.' : t === 'hand' ? 'Move tool selected. Drag to move the picture.' : 'Brush selected.');
  }, [announce, lang]);

  const pickColor = useCallback((hex: string) => {
    setColor(hex);
    const p = projRef.current;
    if (p) { p.recent = [hex, ...p.recent.filter((c) => c !== hex)].slice(0, 12); }
  }, []);

  // ---------- pointer input ----------
  useEffect(() => {
    if (status !== 'ready') return;
    const vp = vpRef.current!;
    const pointers = new Map<number, { x: number; y: number; type: string }>();
    let gesture: null | { kind: 'pan'; id: number; x0: number; y0: number; v0: View } | { kind: 'pinch'; d0: number; c0: [number, number]; v0: View } = null;
    const rect = () => vp.getBoundingClientRect();
    const toDoc = (cx: number, cy: number, r = rect()): [number, number] => { const v = viewRef.current; return [(cx - r.left - v.tx) / v.s, (cy - r.top - v.ty) / v.s]; };
    const touchPts = () => [...pointers.values()].filter((p) => p.type === 'touch');
    const pinchInfo = () => { const [a, b] = touchPts(); return { d: Math.hypot(a.x - b.x, a.y - b.y), c: [(a.x + b.x) / 2, (a.y + b.y) / 2] as [number, number] }; };

    const addSamples = (e: PointerEvent) => {
      const s = strokeRef.current;
      if (!s) return;
      const evs = (e.getCoalescedEvents?.() || []) as PointerEvent[];
      const list = evs.length ? evs : [e];
      const r = rect();
      const pts: Point[] = [];
      let src: IntensitySource = 'manual';
      for (const ev of list) {
        const [x, y] = toDoc(ev.clientX, ev.clientY, r);
        const smp = inputRef.current.sample({ pointerType: ev.pointerType, pressure: ev.pressure, tiltX: ev.tiltX, tiltY: ev.tiltY }, prefsRef.current);
        src = smp.source;
        pts.push(qpt(x, y, smp.intensity, smp.tilt));
      }
      s.op.pts.push(...pts);
      s.painter.add(pts);
      setSource((cur) => (cur === src ? cur : src));
    };
    const endStroke = (commit: boolean) => {
      const s = strokeRef.current, p = projRef.current, st = stackRef.current;
      if (!s || !p || !st) return;
      strokeRef.current = null;
      st.buffer.style.opacity = '1';
      if (!commit || !s.op.pts.length) {
        s.painter.cancel();
        const l = layerById(p, s.layerId);
        if (l && !s.painter.usesBuffer) void st.run(() => st.renderLayer(l));
        return;
      }
      s.painter.finish();
      if (!addOp(p, s.layerId, s.op)) { const l = layerById(p, s.layerId); if (l) void st.run(() => st.renderLayer(l)); return; }
      st.committed(layerById(p, s.layerId)!);
      if (s.op.brush !== 'eraser' && !BRUSHES[s.op.brush].fixedColor) p.recent = [s.op.color, ...p.recent.filter((c) => c !== s.op.color)].slice(0, 12);
      markDirty();
      bump();
    };
    const blockMsg = (b: ReturnType<typeof paintBlock>) =>
      b === 'locked' ? 'This layer is locked. Unlock it in Layers to draw.' : b === 'hidden' ? 'This layer is hidden. Show it in Layers to draw.' : 'Choose a colour layer to draw on.';

    const down = (e: PointerEvent) => {
      const p = projRef.current, st = stackRef.current;
      if (!p || !st) return;
      try { vp.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
      if (e.pointerType === 'touch' && touchPts().length >= 2) {
        if (strokeRef.current?.type === 'touch') endStroke(false); // second finger: it's a pinch, not a stroke
        const { d, c } = pinchInfo();
        gesture = { kind: 'pinch', d0: d, c0: c, v0: { ...viewRef.current } };
        return;
      }
      if (strokeRef.current || gesture) return;
      if (e.button === 1 || spaceRef.current || toolRef.current === 'hand') {
        e.preventDefault();
        gesture = { kind: 'pan', id: e.pointerId, x0: e.clientX, y0: e.clientY, v0: { ...viewRef.current } };
        return;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const [x, y] = toDoc(e.clientX, e.clientY);
      const l = activeLayer(p);
      const t = toolRef.current;
      if (t === 'eyedropper') {
        const hex = st.pick(x, y);
        pickColor(hex);
        announce(`Picked ${colorName(hex, lang)}`);
        setToolState(prevTool.current);
        return;
      }
      const block = paintBlock(l);
      if (block) { announce(blockMsg(block)); return; }
      if (t === 'fill') {
        if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
        if (st.onOutline(x, y)) { announce('That is the outline. Tap inside a shape to fill it.'); return; }
        const op: FillOp = { t: 'fill', id: shortId(), x: Math.floor(x), y: Math.floor(y), color: colorRef.current, tol: FILL_TOL[tolRef.current] };
        const n = st.fill(st.canvas(l!.id), op);
        if (n && addOp(p, l!.id, op)) { st.committed(l!); p.recent = [op.color, ...p.recent.filter((c) => c !== op.color)].slice(0, 12); markDirty(); bump(); }
        else announce('That area is already this colour.');
        return;
      }
      // brush stroke — one finger or pen always draws
      const b = brushRef.current;
      const op: StrokeOp = { t: 'stroke', id: shortId(), brush: b, color: BRUSHES[b].fixedColor || colorRef.current, size: sizeRef.current, opacity: opacityRef.current, seed: newSeed(), pts: [] };
      const painter = st.painter(l!.id, op);
      st.buffer.style.opacity = String(painter.previewAlpha);
      inputRef.current.begin();
      strokeRef.current = { pointerId: e.pointerId, painter, op, layerId: l!.id, type: e.pointerType, at: performance.now() };
      addSamples(e);
    };
    const move = (e: PointerEvent) => {
      const pt = pointers.get(e.pointerId);
      if (pt) { pt.x = e.clientX; pt.y = e.clientY; }
      if (gesture?.kind === 'pinch') {
        if (touchPts().length < 2) return;
        const { d, c } = pinchInfo(), r = rect(), g = gesture;
        const s2 = Math.min(8, Math.max(0.05, g.v0.s * (d / (g.d0 || 1))));
        const cx0 = g.c0[0] - r.left, cy0 = g.c0[1] - r.top, cx = c[0] - r.left, cy = c[1] - r.top;
        viewRef.current = { s: s2, tx: cx - (cx0 - g.v0.tx) * (s2 / g.v0.s), ty: cy - (cy0 - g.v0.ty) * (s2 / g.v0.s) };
        autoFit.current = false;
        applyView();
        return;
      }
      if (gesture?.kind === 'pan' && gesture.id === e.pointerId) {
        viewRef.current = { ...gesture.v0, tx: gesture.v0.tx + e.clientX - gesture.x0, ty: gesture.v0.ty + e.clientY - gesture.y0 };
        autoFit.current = false;
        applyView();
        return;
      }
      if (strokeRef.current?.pointerId === e.pointerId) { e.preventDefault(); addSamples(e); }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (gesture?.kind === 'pinch' && touchPts().length < 2) gesture = null;
      else if (gesture?.kind === 'pan' && gesture.id === e.pointerId) gesture = null;
      if (strokeRef.current?.pointerId === e.pointerId) endStroke(true);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = rect();
      if (e.ctrlKey || e.metaKey) zoomBy(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
      else { const v = viewRef.current; viewRef.current = { ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY }; autoFit.current = false; applyView(); }
    };
    const noMenu = (e: Event) => e.preventDefault();
    vp.addEventListener('pointerdown', down);
    vp.addEventListener('pointermove', move);
    vp.addEventListener('pointerup', up);
    vp.addEventListener('pointercancel', up);
    vp.addEventListener('wheel', wheel, { passive: false });
    vp.addEventListener('contextmenu', noMenu);
    return () => {
      vp.removeEventListener('pointerdown', down);
      vp.removeEventListener('pointermove', move);
      vp.removeEventListener('pointerup', up);
      vp.removeEventListener('pointercancel', up);
      vp.removeEventListener('wheel', wheel);
      vp.removeEventListener('contextmenu', noMenu);
      if (strokeRef.current) endStroke(true);
    };
  }, [status, applyView, zoomBy, announce, markDirty, bump, pickColor, lang]);

  // ---------- keyboard ----------
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.closest('input, textarea, select, [contenteditable], .modal')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (e.code === 'Space') { if (e.type === 'keydown' && !tgt.closest('button')) { spaceRef.current = true; e.preventDefault(); } else if (e.type === 'keyup') spaceRef.current = false; return; }
      if (e.type !== 'keydown') return;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); return; }
      if (mod) return;
      const k = e.key.toLowerCase();
      if (k === 'b') setTool('brush', brushRef.current);
      else if (k === 'e') setTool('brush', 'eraser');
      else if (k === 'g' || k === 'f') setTool('fill');
      else if (k === 'i') setTool('eyedropper');
      else if (k === 'h') setTool('hand');
      else if (k === '+' || k === '=') zoomBy(1.25);
      else if (k === '-') zoomBy(0.8);
      else if (k === '0') fit();
      else if (k === '[') setSize((s) => Math.max(1, Math.round(s * 0.85)));
      else if (k === ']') setSize((s) => Math.min(200, Math.round(s * 1.18) + 1));
    };
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('keyup', key); };
  }, [doUndo, doRedo, setTool, zoomBy, fit]);

  // ---------- actions ----------
  const p = projRef.current, st = stackRef.current;
  const layerAction = (fn: (p: Project) => unknown) => { if (!projRef.current) return; fn(projRef.current); afterChange({ layers: [], structure: true }); };
  const exportPng = () => { if (st) downloadCanvas(st.flatten(true), title); };
  const printIt = async () => { dirtyRef.current = true; await saveNow(); nav(`/art/print/art/${idRef.current}`); };
  const changePaper = (paper: PaperId) => {
    if (!p || !st) return;
    p.paper = paper;
    void st.run(() => st.renderAll());
    markDirty();
    bump();
  };

  const saveLabel = (() => {
    if (local === 'saving') return { icon: 'cloud', text: 'Saving…', cls: 'saving' };
    if (local === 'error') return { icon: 'alert', text: 'Could not save', cls: 'error', retry: () => { dirtyRef.current = true; void saveNow(); } };
    if (local === 'idle') return null;
    if (sync === 'saving') return { icon: 'cloud', text: 'Saving…', cls: 'saving' };
    if (sync === 'offline') return { icon: 'wifiOff', text: 'Offline (saved on device)', cls: 'offline' };
    if (sync === 'error') return { icon: 'alert', text: 'Saved on device — not uploaded', cls: 'error', retry: () => void retrySync() };
    return { icon: 'check', text: 'Saved', cls: 'saved' };
  })();

  const brushes = early ? EARLY_BRUSHES : BRUSH_ORDER;
  const canUndo = !!p?.history.undo.length, canRedo = !!p?.history.redo.length;
  const showSource = prefs.pressureMode === 'manual' ? 'manual' : source;

  const statusEl = saveLabel && (
    <span className={`sync art-save ${saveLabel.cls}`} role="status" aria-live="polite">
      <Icon name={saveLabel.icon} />{saveLabel.text}
      {saveLabel.retry && <button className="btn small ghost" onClick={saveLabel.retry}>Retry</button>}
    </span>
  );

  if (status === 'error') {
    return <Page title="Art Studio" back="/art/gallery"><div className="alert error"><Icon name="alert" />This picture could not be opened.</div></Page>;
  }

  return (
    <Page title={title} back="/art" wide fullscreen actions={<>{statusEl}{!early && allowTyping && <IconButton className="small ghost" icon="edit" label="Rename picture" onClick={() => setRenaming(true)} />}</>}>
      <div className={`art-studio ${early ? 'early' : ''} ${panelOpen ? 'panel-open' : ''}`}>
        <div className="art-toolbar" role="toolbar" aria-label="Drawing tools">
          <div className="art-group" role="group" aria-label="Media">
            {brushes.map((b) => (
              <button key={b} type="button" className="btn art-tool" aria-pressed={tool === 'brush' && brush === b} title={BRUSHES[b].hint} onClick={() => setTool('brush', b)}>
                <Icon name={BRUSHES[b].icon} /><span>{lang === 'te' ? BRUSHES[b].labelTe : BRUSHES[b].label}</span>
              </button>
            ))}
          </div>
          <div className="art-group" role="group" aria-label="Tools">
            <button type="button" className="btn art-tool" aria-pressed={tool === 'fill'} onClick={() => setTool('fill')} title="Fill a shape (G)"><Icon name="bucket" /><span>Fill</span></button>
            <button type="button" className="btn art-tool" aria-pressed={tool === 'eyedropper'} onClick={() => setTool('eyedropper')} title="Pick a colour from the picture (I)"><Icon name="pipette" /><span>Pick</span></button>
            {!early && <button type="button" className="btn art-tool" aria-pressed={tool === 'hand'} onClick={() => setTool('hand')} title="Move the picture (H, or hold Space)"><Icon name="hand" /><span>Move</span></button>}
          </div>
          <div className="art-group" role="group" aria-label="History">
            <IconButton icon="undo" label="Undo" disabled={!canUndo} onClick={doUndo} />
            <IconButton icon="redo" label="Redo" disabled={!canRedo} onClick={doRedo} />
          </div>
          <div className="art-group" role="group" aria-label="Zoom">
            <IconButton icon="zoomOut" label="Zoom out" onClick={() => zoomBy(0.8)} />
            <button type="button" className="btn small art-zoom" onClick={fit} title="Fit to screen (0)" aria-label={`Zoom ${zoom}%. Fit to screen`}>{zoom}%</button>
            <IconButton icon="zoomIn" label="Zoom in" onClick={() => zoomBy(1.25)} />
          </div>
          <span className="spacer" />
          <button type="button" className="btn art-tool" aria-expanded={panelOpen} aria-controls="art-panel" onClick={() => setPanelOpen(!panelOpen)}><Icon name="palette" /><span>{panelOpen ? 'Hide panel' : 'Colours'}</span></button>
        </div>

        <div className="art-body">
          <div ref={vpRef} className={`art-viewport tool-${tool}`} aria-label={`Canvas. ${tool === 'brush' ? BRUSHES[brush].label : tool} selected.`} role="img">
            <div ref={hostRef} className="art-stack" style={p ? { width: p.w, height: p.h } : undefined} />
            {status === 'loading' && <div className="art-loading" role="status">Opening…</div>}
            <span className="art-indicator" role="status" aria-live="polite" title={showSource === 'pen' ? 'Your pen pressure controls the strokes' : 'The intensity slider controls the strokes'}>
              <Icon name={showSource === 'pen' ? 'edit' : 'hand'} />{showSource === 'pen' ? 'Pen Pressure' : 'Manual Intensity'}
            </span>
          </div>

          <aside id="art-panel" className="art-panel" hidden={!panelOpen} aria-label="Colours, brush and layers">
            <div className="art-sheet-handle no-print"><button className="btn small ghost" onClick={() => setPanelOpen(false)} aria-label="Close panel"><Icon name="x" /></button></div>
            {!early && (
              <div className="art-tabs" role="tablist" aria-label="Panel">
                {(['colour', 'brush', 'layers'] as const).map((k) => (
                  <button key={k} role="tab" type="button" aria-selected={panelTab === k} className="btn small" onClick={() => setPanelTab(k)}>{k === 'colour' ? 'Colour' : k === 'brush' ? 'Brush' : 'Layers'}</button>
                ))}
              </div>
            )}
            {(early || panelTab === 'colour') && p && (
              <section aria-label="Colour">
                <ColorPanel color={color} onChange={pickColor} recent={p.recent} palettes={p.palettes} onPalettes={(pl: Palette[]) => { p.palettes = pl; markDirty(); bump(); }} early={early} allowTyping={allowTyping} lang={lang} />
                {BRUSHES[brush].fixedColor && tool === 'brush' && <p className="muted" style={{ fontSize: '.85rem' }}>The pencil is always grey. Pick Colour pencil for colours.</p>}
              </section>
            )}
            {(early || panelTab === 'brush') && p && (
              <section className="stack" style={{ gap: 10 }} aria-label="Brush settings">
                <div>
                  <div className="art-sub">Size</div>
                  <div className="row" role="group" aria-label="Brush size presets" style={{ gap: 6 }}>
                    {(early ? [10, 24, 48] : SIZE_PRESETS).map((s) => (
                      <button key={s} type="button" className="btn small art-size" aria-pressed={size === s} aria-label={`Size ${s}`} onClick={() => setSize(s)}><i style={{ width: Math.min(28, 4 + s / 3.5), height: Math.min(28, 4 + s / 3.5) }} /></button>
                    ))}
                  </div>
                  {!early && <label className="art-range">Fine size <span>{size}px</span><input type="range" min={1} max={200} value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>}
                </div>
                {!early && <label className="art-range">Opacity <span>{Math.round(opacity * 100)}%</span><input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} /></label>}
                {tool === 'fill' && (
                  <div><div className="art-sub">Fill spreads over</div>
                    <Segmented label="Fill tolerance" value={fillTol} onChange={setFillTol} options={[{ value: 'small', label: 'Same colour' }, { value: 'medium', label: 'Similar' }, { value: 'large', label: 'Most colours' }]} />
                  </div>
                )}
                <div className="art-pressure">
                  <div className="art-sub">Pressure</div>
                  <p className="row" style={{ gap: 6, margin: 0 }}><Icon name={showSource === 'pen' ? 'edit' : 'hand'} /><b>{showSource === 'pen' ? 'Pen Pressure' : 'Manual Intensity'}</b></p>
                  {!early && (
                    <Segmented label="Pressure mode" value={prefs.pressureMode} onChange={(v) => void updatePrefs({ pressureMode: v })} options={[{ value: 'auto', label: 'Use pen pressure' }, { value: 'manual', label: 'Always manual' }]} />
                  )}
                  {early ? (
                    <Segmented label="How strong" value={intensity < 0.45 ? 0.35 : intensity < 0.75 ? 0.6 : 0.9} onChange={setIntensity} options={[{ value: 0.35, label: 'Light' }, { value: 0.6, label: 'Medium' }, { value: 0.9, label: 'Strong' }]} />
                  ) : (
                    <label className="art-range">Manual intensity <span>{Math.round(intensity * 100)}%</span>
                      <input type="range" min={5} max={100} value={Math.round(intensity * 100)} onChange={(e) => setIntensity(Number(e.target.value) / 100)} aria-describedby="art-int-hint" />
                    </label>
                  )}
                  {!early && <span id="art-int-hint" className="muted" style={{ fontSize: '.8rem' }}>Used for mouse, finger, or pens without pressure.</span>}
                  {!early && <Button small icon="gear" onClick={() => setCalib(true)}>{prefs.calibration ? 'Recalibrate pen' : 'Calibrate pen'}</Button>}
                </div>
                {!early && (
                  <label className="art-range">Paper
                    <select className="input" value={p.paper} onChange={(e) => changePaper(e.target.value as PaperId)} style={{ minHeight: 40 }}>
                      {PAPERS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </label>
                )}
              </section>
            )}
            {!early && panelTab === 'layers' && p && (
              <section aria-label="Layers">
                <LayersPanel
                  project={p} allowTyping={allowTyping}
                  onSelect={(id) => { p.active = id; syncDom(); bump(); announce(`Drawing on ${layerById(p, id)?.name}`); }}
                  onAdd={() => layerAction((pp) => addLayer(pp))}
                  onDelete={(id) => layerAction((pp) => deleteLayer(pp, id))}
                  onProps={(id, pr) => layerAction((pp) => setLayerProps(pp, id, pr))}
                  onMove={(id, d) => layerAction((pp) => moveLayer(pp, id, d))}
                />
              </section>
            )}
            <section className="row art-export" aria-label="Save and share">
              <Button small icon="download" onClick={exportPng}>PNG</Button>
              <Button small icon="print" onClick={() => void printIt()}>Print</Button>
              <Button small icon="image" onClick={() => { void saveNow(); nav('/art/gallery'); }}>Gallery</Button>
              {p?.meta.kind === 'color' && <Button small icon="sparkle" onClick={() => { celebrate(); void award(`art-colour-${p.meta.pageId}`); }}>I'm done!</Button>}
            </section>
          </aside>
        </div>
        <div className="art-msg" aria-live="polite" role="status">{msg}</div>
      </div>
      {calib && <CalibrationPad current={prefs.calibration} onClose={() => setCalib(false)} onSave={(c) => { void updatePrefs({ calibration: c }); setCalib(false); toast(c ? 'Pen calibrated' : 'Calibration reset'); }} />}
      {renaming && <RenameDialog title={title} onClose={() => setRenaming(false)} onSave={(t) => { setTitle(t); titleRef.current = t; dirtyRef.current = true; void saveNow(); setRenaming(false); }} />}
    </Page>
  );
}
