// Letter tracing on a canvas (Pointer Events; finger, mouse or pen) + printable tracing sheet.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Page, Segmented, celebrate } from '../../ui/kit';
import { findTraceSet, isCourse } from './engine';
import { GRID, TRACE_FONT, scoreTrace, startPoint, type Mask, type Tolerance, type TraceResult } from './tracing';
import type { Script } from './types';
import { LETTER_CARDS } from './telugu/script';
import { ALPHABET_CARDS } from './english/course';
import { VoiceNote } from './common';
import { awardBadge, useSay } from './util';
import { NotFound } from './NotFound';

type Pt = [number, number];
const INK = 0.075; // ink width as a fraction of the box

function fontFor(script: Script, px: number) { return `600 ${Math.round(px)}px ${TRACE_FONT[script]}, sans-serif`; }

/** Same layout for the visible canvas and the scoring grid: glyph centred in the box. */
function layout(ctx: CanvasRenderingContext2D, letter: string, side: number, script: Script) {
  let size = side * (script === 'te' ? 0.62 : 0.72);
  ctx.font = fontFor(script, size);
  let m = ctx.measureText(letter);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const fit = Math.min(1, (side * 0.82) / Math.max(1, w), (side * 0.82) / Math.max(1, h));
  if (fit < 1) { size *= fit; ctx.font = fontFor(script, size); m = ctx.measureText(letter); }
  const bw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, bh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const x = (side - bw) / 2 + m.actualBoundingBoxLeft;
  const y = (side - bh) / 2 + m.actualBoundingBoxAscent;
  return { x, y, size };
}

function glyphMask(letter: string, script: Script): Mask {
  const c = document.createElement('canvas');
  c.width = c.height = GRID;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const L = layout(ctx, letter, GRID, script);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#000';
  ctx.fillText(letter, L.x, L.y);
  const d = ctx.getImageData(0, 0, GRID, GRID).data;
  const m = new Uint8Array(GRID * GRID);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  return m;
}
function inkMask(strokes: Pt[][]): Mask {
  const c = document.createElement('canvas');
  c.width = c.height = GRID;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  drawStrokes(ctx, strokes, GRID, '#000');
  const d = ctx.getImageData(0, 0, GRID, GRID).data;
  const m = new Uint8Array(GRID * GRID);
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 60 ? 1 : 0;
  return m;
}
function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Pt[][], side: number, color: string) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = side * INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0][0] * side, s[0][1] * side, (side * INK) / 2, 0, Math.PI * 2); ctx.fill(); continue; }
    ctx.beginPath();
    s.forEach((p, i) => (i ? ctx.lineTo(p[0] * side, p[1] * side) : ctx.moveTo(p[0] * side, p[1] * side)));
    ctx.stroke();
  }
}

function useFontReady(script: Script, letter: string) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    const f = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!f) { setReady(true); return; }
    f.load(fontFor(script, 100), letter).catch(() => undefined).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [script, letter]);
  return ready;
}

function TraceCanvas({ letter, script, tol, onResult, clearSignal }: { letter: string; script: Script; tol: Tolerance; onResult: (r: TraceResult) => void; clearSignal: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>([]);
  const drawing = useRef(false);
  const [side, setSide] = useState(320);
  const [hasInk, setHasInk] = useState(false);
  const ready = useFontReady(script, letter);
  const maskRef = useRef<Mask | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSide(Math.max(220, Math.min(480, Math.floor(el.clientWidth)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== side * dpr) { c.width = side * dpr; c.height = side * dpr; }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, side, side);
    ctx.fillStyle = '#FBFAF6'; ctx.fillRect(0, 0, side, side);
    // guide lines
    ctx.strokeStyle = 'rgba(47,58,53,.12)'; ctx.lineWidth = 1; ctx.setLineDash([]);
    [0.25, 0.5, 0.75].forEach((f) => { ctx.beginPath(); ctx.moveTo(0, side * f); ctx.lineTo(side, side * f); ctx.stroke(); });
    if (ready) {
      const L = layout(ctx, letter, side, script);
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(63,111,88,.13)';
      ctx.fillText(letter, L.x, L.y);
      ctx.setLineDash([4, 5]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(47,58,53,.55)';
      ctx.strokeText(letter, L.x, L.y);
      ctx.setLineDash([]);
      const m = maskRef.current;
      const sp = m && startPoint(m, GRID, GRID, script);
      if (sp) {
        ctx.fillStyle = '#2F6B4F';
        ctx.beginPath(); ctx.arc(((sp[0] + 0.5) / GRID) * side, ((sp[1] + 0.5) / GRID) * side, Math.max(8, side * 0.028), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(side * 0.03)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('1', ((sp[0] + 0.5) / GRID) * side, ((sp[1] + 0.5) / GRID) * side);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      }
    }
    drawStrokes(ctx, strokes.current, side, '#2F6F9A');
  }, [side, ready, letter, script]);

  useEffect(() => { if (ready) maskRef.current = glyphMask(letter, script); redraw(); }, [ready, letter, script, redraw]);
  useEffect(() => {
    strokes.current = []; setHasInk(false); redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, clearSignal]);

  const pt = (e: RPointerEvent | PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };
  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([pt(e)]);
    setHasInk(true);
    redraw();
  };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const s = strokes.current[strokes.current.length - 1];
    const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() || [e.nativeEvent];
    for (const ev of evs) s.push(pt(ev));
    redraw();
  };
  const up = () => { drawing.current = false; };

  const checkNow = () => {
    if (!maskRef.current) return;
    onResult(scoreTrace(maskRef.current, inkMask(strokes.current), GRID, GRID, tol));
  };

  return (
    <div className="stack lang-trace">
      <div ref={wrap} className="lang-trace-wrap">
        <canvas ref={canvas} className="lang-trace-canvas" style={{ width: side, height: side }}
          role="img" aria-label={`Tracing area for the letter ${letter}. Draw over the dotted letter starting at the green dot marked 1.`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
      </div>
      <div className="row">
        <Button variant="primary" icon="check" disabled={!hasInk} onClick={checkNow}>Check my tracing</Button>
        <Button icon="undo" disabled={!hasInk} onClick={() => { strokes.current.pop(); setHasInk(strokes.current.length > 0); redraw(); }}>Undo stroke</Button>
      </div>
    </div>
  );
}

interface TraceState { index: number; stars: Record<string, number>; tol?: Tolerance }

export function TracePage() {
  const { course, setId = '' } = useParams();
  const { learner, saveActivityState, presentation, award, setLastActivity } = useApp();
  const set = findTraceSet(setId);
  const key = `lang:${course}/trace/${setId}`;
  const saved = learner.activities[key]?.state as TraceState | undefined;
  const [st, setSt] = useState<TraceState>(() => saved || { index: 0, stars: {}, tol: presentation?.tier === 'early' ? 'easy' : 'medium' });
  const [result, setResult] = useState<TraceResult | null>(null);
  const [clear, setClear] = useState(0);
  const { say, teVoice } = useSay();
  useEffect(() => {
    if (set) setLastActivity(`/lang/${course}/trace/${setId}`, `Tracing: ${set.titleEn || set.title}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);
  if (!isCourse(course) || !set || set.course !== course) return <NotFound />;
  const idx = Math.min(st.index, set.letters.length - 1);
  const letter = set.letters[idx];
  const tol = st.tol || 'medium';
  const cardFor = set.script === 'te' ? LETTER_CARDS[letter] : ALPHABET_CARDS.find((c) => c.letter === letter.toUpperCase());
  const save = (n: TraceState) => { setSt(n); void saveActivityState(key, n); };
  const goto = (i: number) => { setResult(null); save({ ...st, index: (i + set.letters.length) % set.letters.length }); if (presentation?.readAloud) void say(set.letters[(i + set.letters.length) % set.letters.length], set.script); };
  const onResult = (r: TraceResult) => {
    setResult(r);
    const best = Math.max(st.stars[letter] || 0, r.stars);
    save({ ...st, stars: { ...st.stars, [letter]: best } });
    void say(r.message, 'en');
    if (r.stars >= 2) void awardBadge(set.script === 'te' ? 'lang:first-trace-te' : 'lang:first-trace-en', award);
    if (r.stars === 3) celebrate();
  };
  const totalStars = Object.values(st.stars).reduce((a, b) => a + b, 0);
  return (
    <Page title={`Trace: ${set.titleEn || set.title}`} back={`/lang/${course}`} fullscreen
      actions={<Link className="btn small" to={`/lang/${course}/print/${set.id}`}><Icon name="print" />Print sheet</Link>}>
      <div className="lang-wrap stack">
        <div className="row">
          <h1 className={`lang-${set.script}`} lang={set.script}>{set.title}</h1>
          <span className="spacer" />
          <span className="pill"><Icon name="star" />{totalStars} stars</span>
        </div>
        <VoiceNote course={course} teVoice={teVoice} />
        <div className="row">
          <Button icon="back" onClick={() => goto(idx - 1)} aria-label="Previous letter">Prev</Button>
          <span className="pill">Letter {idx + 1} of {set.letters.length}</span>
          <Button icon="next" onClick={() => goto(idx + 1)} aria-label="Next letter">Next</Button>
          <Button icon="speaker" onClick={() => void say(cardFor ? `${letter}. ${cardFor.word}` : letter, set.script)}>Hear it</Button>
          <Button icon="reset" variant="ghost" onClick={() => { setResult(null); setClear((x) => x + 1); }}>Clear</Button>
        </div>
        {cardFor && <p className="muted"><span lang={set.script} className={`lang-${set.script} lang-big-inline`}>{letter}</span> — <span lang={set.script} className={`lang-${set.script}`}>{cardFor.word}</span> ({cardFor.en}) <span role="img" aria-label={cardFor.en}>{cardFor.pic}</span></p>}
        <Segmented label="How strict" value={tol} onChange={(v) => { setResult(null); save({ ...st, tol: v }); }}
          options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Tricky' }]} />
        <TraceCanvas letter={letter} script={set.script} tol={tol} onResult={onResult} clearSignal={clear} />
        {result && (
          <div className={`alert ${result.stars >= 2 ? 'good' : 'warn'}`} role="status">
            <Icon name={result.stars >= 2 ? 'check' : 'info'} />
            <span>
              <b>{result.stars} of 3 stars.</b> {result.message} <span className="muted small">(covered {Math.round(result.coverage * 100)}%, outside the letter {Math.round(result.outside * 100)}%)</span>
            </span>
          </div>
        )}
        <div className="lang-trace-strip" role="group" aria-label="Letters in this set">
          {set.letters.map((l, i) => (
            <button key={l} type="button" className="lang-key" lang={set.script} aria-pressed={i === idx} aria-label={`${l}${st.stars[l] ? `, ${st.stars[l]} stars` : ''}`} onClick={() => goto(i)}>
              {l}{st.stars[l] ? <small aria-hidden="true"> {'★'.repeat(st.stars[l])}</small> : null}
            </button>
          ))}
        </div>
        <p className="muted small">Use a finger, mouse or pen. Tracing can’t be done with the keyboard — the printable sheet is another way to practise.</p>
      </div>
    </Page>
  );
}

export function PrintSheet() {
  const { course, setId = '' } = useParams();
  const set = findTraceSet(setId);
  if (!isCourse(course) || !set || set.course !== course) return <NotFound />;
  const font = TRACE_FONT[set.script];
  const perPage = 6;
  const pages: string[][] = [];
  for (let i = 0; i < set.letters.length; i += perPage) pages.push(set.letters.slice(i, i + perPage));
  return (
    <Page title={`Print: ${set.titleEn || set.title}`} back={`/lang/${course}/trace/${set.id}`}
      actions={<Button small variant="primary" icon="print" onClick={() => window.print()}>Print</Button>}>
      <div className="lang-print">
        <p className="no-print muted">Each row shows the letter, then dotted copies to trace and space to write. Use your browser’s print dialog (A4, portrait).</p>
        {pages.map((pg, pi) => (
          <section key={pi} className="print-sheet lang-sheet">
            <h2 lang={set.script} className={`lang-${set.script}`}>{set.title} <small>· Name: ____________</small></h2>
            {pg.map((l) => (
              <svg key={l} viewBox="0 0 700 110" className="lang-sheet-row" role="img" aria-label={`Trace the letter ${l}`}>
                <line x1="0" y1="20" x2="700" y2="20" stroke="#bbb" strokeWidth="1" />
                <line x1="0" y1="60" x2="700" y2="60" stroke="#ddd" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#bbb" strokeWidth="1" />
                <text x="45" y="88" textAnchor="middle" fontFamily={font} fontSize="78" fontWeight="600" fill="#2F3A35">{l}</text>
                {[1, 2, 3, 4].map((k) => (
                  <text key={k} x={45 + k * 110} y="88" textAnchor="middle" fontFamily={font} fontSize="78" fontWeight="600" fill="none" stroke="#777" strokeWidth="1.6" strokeDasharray="3 4">{l}</text>
                ))}
              </svg>
            ))}
          </section>
        ))}
      </div>
    </Page>
  );
}
