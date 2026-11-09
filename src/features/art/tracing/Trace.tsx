import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../lib/app';
import { Button, Feedback, IconButton, Page, Segmented, celebrate } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { sheetById, guidePolys } from './guides';
import { GuideSvg, isReducedMotion } from './GuideSvg';
import { toSvgPoints, type Pt } from './path';
import { TOLERANCE, checkStroke, scoreTrace, type Tolerance, type TraceScore } from './scoring';

type Mode = 'guided' | 'free';

export default function Trace() {
  const { sheetId } = useParams();
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const { presentation, speak, award, lang, setLastActivity } = useApp();
  const sheet = sheetId ? sheetById(sheetId) : undefined;
  const idx = Math.max(0, Math.min((sheet?.guides.length || 1) - 1, Number(sp.get('i')) || 0));
  const guide = sheet?.guides[idx];
  const polys = useMemo(() => (guide ? guidePolys(guide) : []), [guide]);

  const [tolName, setTolName] = useState<Tolerance>(presentation?.tier === 'early' ? 'easy' : 'medium');
  const [guidance, setGuidance] = useState(true);
  const [mode, setMode] = useState<Mode>('guided');
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [live, setLive] = useState<Pt[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<boolean[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [result, setResult] = useState<TraceScore | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [animate, setAnimate] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef<{ id: number; pts: Pt[] } | null>(null);
  const tol = TOLERANCE[tolName];

  const reset = useCallback(() => { setStrokes([]); setLive(null); setCurrent(0); setDone([]); setMsg(null); setResult(null); }, []);
  const sayIt = useCallback(() => { if (guide) speak(guide.say, { te: guide.sayTe }); }, [guide, speak]);

  useEffect(() => {
    reset();
    setAnimate(true);
    setAnimKey((k) => k + 1);
    if (guide && presentation?.readAloud) sayIt();
    if (sheet && guide) setLastActivity(`/art/trace/${sheet.id}?i=${idx}`, `Trace ${guide.label}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id]);
  useEffect(() => { reset(); }, [mode, reset]);

  if (!sheet || !guide) return <Navigate to="/art/trace" replace />;

  const toGuide = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [Math.round(pt.x * 10) / 10, Math.round(pt.y * 10) / 10];
  };
  const finish = (all: Pt[][]) => {
    const r = scoreTrace(polys, all, tol, { ordered: mode === 'guided' });
    setResult(r);
    setMsg({ ok: r.stars >= 2, text: r.feedback.join(' ') });
    if (r.stars >= 2) celebrate();
    if (r.stars >= 1) void award(`art-trace-${guide.id}`);
    speak(r.stars >= 2 ? 'Well done!' : 'Good try!', { te: r.stars >= 2 ? 'చాలా బాగుంది!' : 'మంచి ప్రయత్నం!' });
  };
  const onStrokeEnd = (pts: Pt[]) => {
    if (pts.length < 2) { if (pts.length === 1) pts = [pts[0], [pts[0][0] + 0.5, pts[0][1]]]; else return; }
    if (mode === 'free') { setStrokes((s) => [...s, pts]); return; }
    if (result) return;
    const g = polys[current];
    const chk = checkStroke(g, pts, tol);
    if (chk.coverage >= 0.7 && chk.accuracy >= 0.5 && chk.forward) {
      const all = [...strokes, pts];
      const d = [...done]; d[current] = true;
      setStrokes(all); setDone(d);
      if (current + 1 >= polys.length) { finish(all); return; }
      setCurrent(current + 1);
      setMsg({ ok: true, text: `Great! Now line ${current + 2} — start at the green dot ${current + 2}.` });
      return;
    }
    // not accepted: explain why, and let them try this line again
    const other = polys.findIndex((p, i) => i !== current && !done[i] && checkStroke(p, pts, tol).coverage >= 0.6);
    if (other >= 0) setMsg({ ok: false, text: `That was line ${other + 1}. Do line ${current + 1} first — start at green dot ${current + 1}.` });
    else if (!chk.forward && chk.coverage >= 0.4) setMsg({ ok: false, text: 'Oops, that went the other way. Start at the green dot and follow the arrows.' });
    else if (chk.accuracy < 0.5) setMsg({ ok: false, text: 'Try to stay inside the grey path.' });
    else setMsg({ ok: false, text: 'Keep going all the way to the end of the line.' });
  };
  const handlers = {
    down: (e: React.PointerEvent<SVGSVGElement>) => {
      if (drawing.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      drawing.current = { id: e.pointerId, pts: [toGuide(e)] };
      setLive(drawing.current.pts.slice());
      setAnimate(false);
    },
    move: (e: React.PointerEvent<SVGSVGElement>) => {
      const d = drawing.current;
      if (!d || d.id !== e.pointerId) return;
      const evs = (e.nativeEvent.getCoalescedEvents?.() || []) as PointerEvent[];
      for (const ev of evs.length ? evs : [e.nativeEvent]) d.pts.push(toGuide(ev));
      setLive(d.pts.slice());
    },
    up: (e: React.PointerEvent<SVGSVGElement>) => {
      const d = drawing.current;
      if (!d || d.id !== e.pointerId) return;
      drawing.current = null;
      setLive(null);
      onStrokeEnd(d.pts);
    },
  };
  const go = (n: number) => setSp({ i: String(n) }, { replace: true });
  const reduced = isReducedMotion();
  const label = guide.label;

  return (
    <Page title={lang === 'te' ? sheet.titleTe : sheet.title} back="/art/trace" fullscreen>
      <div className="trace-wrap">
        <div className="trace-head">
          <IconButton icon="back" label="Previous" disabled={idx === 0} onClick={() => go(idx - 1)} />
          <h1 className="trace-label" aria-live="polite">{label}</h1>
          <IconButton icon="next" label="Next" disabled={idx >= sheet.guides.length - 1} onClick={() => go(idx + 1)} />
          <IconButton icon="speaker" label={`Say ${guide.say}`} onClick={sayIt} />
          <span className="muted">{idx + 1} / {sheet.guides.length}</span>
        </div>
        <div className="trace-board">
          <GuideSvg
            guide={guide} polys={polys} tol={tol} guidance={guidance} current={mode === 'guided' && !result ? current : -1} done={done}
            animKey={animKey} animate={animate} svgRef={svgRef} onPointer={handlers} className="trace-main"
          >
            {strokes.map((s, i) => <polyline key={i} points={toSvgPoints(s)} className="trace-ink" strokeWidth={Math.max(2.5, tol * 0.55)} />)}
            {live && <polyline points={toSvgPoints(live)} className="trace-ink" strokeWidth={Math.max(2.5, tol * 0.55)} />}
          </GuideSvg>
        </div>
        <div className="trace-status">
          {msg ? <Feedback ok={msg.ok}>{msg.text}</Feedback> : (
            <p className="muted" role="status">{mode === 'guided' ? `Start at green dot ${current + 1} and follow the arrows.` : 'Trace the lines in any order, then press Check.'}</p>
          )}
          {result && (
            <div className="row" aria-label={`${result.stars} of 3 stars`} role="img">
              {[0, 1, 2].map((k) => <Icon key={k} name="star" className={k < result.stars ? 'trace-star on' : 'trace-star'} />)}
              <span className="muted">Covered {Math.round(result.coverage * 100)}% · Neat {Math.round(result.accuracy * 100)}%</span>
            </div>
          )}
        </div>
        <div className="trace-controls row">
          <Button icon={reduced ? 'eye' : 'play'} onClick={() => { setAnimate(true); setAnimKey((k) => k + 1); }}>{reduced ? 'Show order' : 'Show me'}</Button>
          <Button icon="reset" onClick={reset}>Clear</Button>
          {mode === 'free' && <Button variant="primary" icon="check" disabled={!strokes.length} onClick={() => finish(strokes)}>Check</Button>}
          {result && idx < sheet.guides.length - 1 && <Button variant="primary" icon="next" onClick={() => go(idx + 1)}>Next</Button>}
          <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'guided', label: 'Step by step' }, { value: 'free', label: 'Free tracing' }]} />
          <Segmented label="How careful" value={tolName} onChange={setTolName} options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          <Button small icon={guidance ? 'eye' : 'eyeOff'} aria-pressed={guidance} onClick={() => setGuidance(!guidance)}>{guidance ? 'Arrows on' : 'Arrows off'}</Button>
          <Link className="btn small" to={`/art/print/trace/${sheet.id}?i=${idx}`}><Icon name="print" />Print</Link>
          <Button small variant="ghost" onClick={() => nav('/art/trace')}>All sheets</Button>
        </div>
      </div>
    </Page>
  );
}
