import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../ui/kit';
import { clamp, fmt, snap } from './common';
import {
  LIGHT_DT, LIGHT_RANGES, MIRROR, WORLD, advanceLight, aimAt, initLight, mirrorEnds, parseLightPreset, placeForIncidence, pointAlong, sanitizeLight, traceRay,
  vec, type LightParams, type Vec,
} from './light';
import { LIGHT_CHALLENGES, LIGHT_TARGETS } from './challenges';
import { useChallengeRewards, useLabState, useReducedMotion, useSimLoop, useTier } from './hooks';
import { Announce, Challenges, Intro, LabFooter, LabPage, NumberSlider, Prediction, PresetBanner, Toggle, Transport, ValuesTable, type PredictionDef } from './LabKit';

const S = 6; // px per cm
const VW = WORLD.w * S, VH = WORLD.h * S;
const X = (p: Vec) => p.x * S, Y = (p: Vec) => (WORLD.h - p.y) * S;
const STEP_N = 5; // 0.25 s
const wrapAngle = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

function prediction(p: LightParams, simple: boolean): PredictionDef {
  const tr = traceRay(p);
  if (tr.incidence == null) {
    const why = tr.backside ? 'The light reached the back of the mirror, which is painted, so it was absorbed — no reflection.' : 'The beam was not pointing at the mirror, so it travelled on in a straight line.';
    return {
      question: 'Will the light hit the shiny side of the mirror?',
      choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
      spec: { kind: 'choice', correct: 'no' }, outcome: why,
    };
  }
  const i = tr.incidence;
  const law = `The light bounced off at ${fmt(i, 1)}° from the normal — the same angle it arrived at. This is the law of reflection: angle of incidence = angle of reflection.`;
  if (simple) {
    return {
      question: `The light reaches the mirror at ${fmt(i, 0)}° from the normal (the dashed line). How will it bounce off?`,
      choices: [{ value: 'smaller', label: 'At a smaller angle' }, { value: 'same', label: 'At the same angle' }, { value: 'bigger', label: 'At a bigger angle' }],
      spec: { kind: 'choice', correct: 'same' }, outcome: law,
    };
  }
  return {
    question: `The angle of incidence is ${fmt(i, 1)}°. Predict the angle of reflection r.`,
    choices: [...new Set([i, 90 - i, 2 * i].map((x) => fmt(x, 1)))].map((x) => ({ value: x, label: `${x}°` })),
    spec: { kind: 'number', value: tr.reflection!, unit: '°', tolerance: 1 }, unit: '°',
    outcome: <>{law} Measured: i = {fmt(i, 1)}°, r = <b>{fmt(tr.reflection!, 1)}°</b>. Both angles are measured from the normal, not from the mirror surface.</>,
  };
}

/** Angle arc between two unit directions (world) at point h, in screen space. */
function arcPath(h: Vec, a: Vec, b: Vec, R: number) {
  const ax = a.x, ay = -a.y, bx = b.x, by = -b.y; // to screen directions
  const hx = X(h), hy = Y(h);
  const sweep = ax * by - ay * bx > 0 ? 1 : 0;
  return `M${hx + ax * R} ${hy + ay * R} A${R} ${R} 0 0 ${sweep} ${hx + bx * R} ${hy + by * R}`;
}
/** Label spot just outside an angle arc, on the ray's side; returns position and text anchor. */
function arcLabel(h: Vec, ray: Vec, normal: Vec, R: number): { x: number; y: number; anchor: 'start' | 'end' } {
  const mx = ray.x + normal.x, my = ray.y + normal.y, l = Math.hypot(mx, my) || 1;
  const x = X(h) + (mx / l) * R, y = Y(h) - (my / l) * R;
  const left = x < X(h);
  return { x: x + (left ? -6 : 6), y: y + 4, anchor: left ? 'end' : 'start' };
}

export default function LightLab() {
  const [search] = useSearchParams();
  const presetAngle = useMemo(() => parseLightPreset(search), [search]);
  const preset = useMemo(() => (presetAngle ? { ...placeForIncidence(presetAngle.angle, 0), tilt: 0 } : null), [presetAngle]);
  const { params, setParams, completed, markDone, seenIntro, markIntroSeen } = useLabState('light', sanitizeLight, preset);
  const { simple, allowTyping } = useTier();
  const reduced = useReducedMotion();
  const [sim, setSim] = useState(initLight);
  const [playing, setPlaying] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [fullRay, setFullRay] = useState(false);
  const [banner, setBanner] = useState(!!presetAngle);
  const [active, setActive] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [announce, setAnnounce] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<null | 'move' | 'aim'>(null);
  const { record, complete } = useChallengeRewards('light', completed, markDone);

  const challenges = LIGHT_CHALLENGES.filter((c) => !simple || !c.seniorOnly);
  const cur = challenges.find((c) => c.id === active) || null;
  const target = cur ? LIGHT_TARGETS.find((t) => t.id === cur.id)!.target : undefined;
  const tr = traceRay(params, target);

  useEffect(() => { setSim(initLight()); setPlaying(false); }, [params]);
  useSimLoop(playing, LIGHT_DT, reduced, (n) => setSim((s) => advanceLight(s, tr.pathLength, n)));
  useEffect(() => {
    if (!sim.done) return;
    setPlaying(false);
    setAnnounce(tr.incidence != null ? `The light reflected. Angle of incidence ${fmt(tr.incidence, 1)} degrees, angle of reflection ${fmt(tr.reflection!, 1)} degrees.` : 'The light did not reflect off the mirror.');
  }, [sim.done]); // eslint-disable-line react-hooks/exhaustive-deps

  const met = !!cur && cur.check(params, null);
  useEffect(() => { if (cur && met) void complete(cur.id, cur.title, 'sim', { params }); }, [met]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = (k: keyof LightParams) => !!cur?.locked.includes(k);
  const set = (k: keyof LightParams) => (v: number) => setParams((p) => ({ ...p, [k]: v }));
  const reset = () => { setPlaying(false); setSim(initLight()); setRunId((r) => r + 1); };
  const phase = sim.done ? 'after' : sim.steps === 0 && !playing ? 'before' : 'running';

  // pointer: drag the torch body to move it, drag the aim handle to rotate it
  const toWorld = (e: RPointerEvent): Vec | null => {
    const svg = svgRef.current, m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return vec(pt.x / S, WORLD.h - pt.y / S);
  };
  const onMove = (e: RPointerEvent) => {
    if (!drag.current) return;
    const w = toWorld(e);
    if (!w) return;
    if (drag.current === 'move' && !locked('sx')) setParams((p) => ({ ...p, sx: snap(w.x, LIGHT_RANGES.sx), sy: snap(w.y, LIGHT_RANGES.sy) }));
    if (drag.current === 'aim' && !locked('aim')) setParams((p) => ({ ...p, aim: snap(aimAt(p.sx, p.sy, w), LIGHT_RANGES.aim) }));
  };
  const startDrag = (kind: 'move' | 'aim') => (e: RPointerEvent) => {
    if ((kind === 'move' && locked('sx')) || (kind === 'aim' && locked('aim'))) return;
    drag.current = kind;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const endDrag = () => { drag.current = null; };
  const torchKeys = (e: KeyboardEvent) => {
    const big = e.shiftKey ? 5 : 1;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-big, 0], ArrowRight: [big, 0], ArrowUp: [0, big], ArrowDown: [0, -big] };
    if (moves[e.key] && !locked('sx')) { e.preventDefault(); setParams((p) => ({ ...p, sx: snap(p.sx + moves[e.key][0], LIGHT_RANGES.sx), sy: snap(p.sy + moves[e.key][1], LIGHT_RANGES.sy) })); }
    if ((e.key === 'q' || e.key === 'Q' || e.key === 'PageUp') && !locked('aim')) { e.preventDefault(); setParams((p) => ({ ...p, aim: snap(wrapAngle(p.aim + big), LIGHT_RANGES.aim) })); }
    if ((e.key === 'e' || e.key === 'E' || e.key === 'PageDown') && !locked('aim')) { e.preventDefault(); setParams((p) => ({ ...p, aim: snap(wrapAngle(p.aim - big), LIGHT_RANGES.aim) })); }
  };

  // drawing
  const [ma, mb] = mirrorEnds(params.tilt);
  const n = tr.normal;
  const src = tr.source;
  const pulse = pointAlong(tr, sim.dist);
  const incLen = Math.hypot(tr.incEnd.x - src.x, tr.incEnd.y - src.y);
  const reflShown = !!tr.hit && !!tr.reflEnd && (fullRay || sim.dist > incLen);
  const reflTo = reflShown ? (fullRay || sim.done ? tr.reflEnd! : pulse) : null;
  const backOff = vec(-n.x * 1.6, -n.y * 1.6);
  const hatches = Array.from({ length: 14 }, (_, i) => { const f = (i + 0.5) / 14; return vec(ma.x + (mb.x - ma.x) * f, ma.y + (mb.y - ma.y) * f); });
  const handle = vec(src.x + Math.cos((params.aim * Math.PI) / 180) * 7, src.y + Math.sin((params.aim * Math.PI) / 180) * 7);

  return (
    <LabPage title="Light Lab">
      {banner && presetAngle && (
        <PresetBanner onDismiss={() => setBanner(false)}>
          Angle of incidence {fmt(presetAngle.angle)}° on a flat mirror: <b>angle of reflection = {fmt(traceRay({ ...placeForIncidence(presetAngle.angle, 0), tilt: 0 }).reflection ?? presetAngle.angle, 1)}°</b> (law of reflection). Press Play to watch the ray.
        </PresetBanner>
      )}
      <Intro
        open={!seenIntro} onToggle={(o) => { if (!o) markIntroSeen(); }}
        explore={simple
          ? 'Shine a torch at a mirror and see where the light bounces. Compare the angle going in with the angle coming out.'
          : 'Explore the law of reflection with a plane mirror: measure the angles of incidence and reflection from the normal.'}
        assumptions={[
          'Light travels in straight lines called rays.',
          'The mirror is perfectly flat and shiny on its front side only; the back is painted, so light hitting it is absorbed.',
          'The normal is an imaginary line at 90° to the mirror where the ray hits it. Angles are measured from the normal.',
          'The moving dot is slowed right down so you can follow it — real light is far too fast to see.',
        ]}
        units={[['Angles', 'degrees (°)'], ['Positions', 'centimetres (cm)'], ['Time', 'seconds (s)']]}
      />
      <div className="lab-layout">
        <div className="lab-main">
          <div className="lab-stage card">
            <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} role="img" aria-labelledby="light-stage-t" className="lab-light-svg"
              onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <title id="light-stage-t">{`Torch at ${fmt(params.sx)}, ${fmt(params.sy)} cm aiming at ${fmt(params.aim)}°. Mirror tilted ${fmt(params.tilt)}°. ${tr.incidence != null ? `Angle of incidence ${fmt(tr.incidence, 1)}°, angle of reflection ${fmt(tr.reflection!, 1)}°.` : 'The ray does not reflect.'}${target ? ` Star ${tr.hitsTarget ? 'hit' : 'not hit'}.` : ''}`}</title>
              {/* mirror */}
              {hatches.map((h, i) => <line key={i} x1={X(h)} y1={Y(h)} x2={X(vec(h.x + backOff.x - 1, h.y + backOff.y))} y2={Y(vec(h.x + backOff.x - 1, h.y + backOff.y))} className="lab-hatch" />)}
              <line x1={X(ma)} y1={Y(ma)} x2={X(mb)} y2={Y(mb)} className="lab-mirror" />
              <text x={X(mb) + 6} y={Y(mb) + 18} className="lab-label" textAnchor="end">mirror{params.tilt ? ` (tilt ${fmt(params.tilt)}°)` : ''}</text>
              {/* target */}
              {target && (
                <g className={`lab-star ${tr.hitsTarget ? 'hit' : ''}`}>
                  <path transform={`translate(${X(target)} ${Y(target)}) scale(1.4) translate(-12 -12)`} d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
                  <text x={X(target)} y={Y(target) + 34} textAnchor="middle" className="lab-label">{tr.hitsTarget ? 'star hit!' : 'target'}</text>
                </g>
              )}
              {/* normal + angles */}
              {tr.hit && !tr.backside && (
                <g>
                  <line x1={X(tr.hit)} y1={Y(tr.hit)} x2={X(vec(tr.hit.x + n.x * 24, tr.hit.y + n.y * 24))} y2={Y(vec(tr.hit.x + n.x * 24, tr.hit.y + n.y * 24))} className="lab-normal" />
                  <text x={X(vec(tr.hit.x + n.x * 25, tr.hit.y + n.y * 25))} y={Y(vec(tr.hit.x + n.x * 25, tr.hit.y + n.y * 25)) - 4} textAnchor="middle" className="lab-label">normal</text>
                  {tr.incidence != null && tr.incidence > 0.5 && (() => {
                    const back = vec(src.x - tr.hit.x, src.y - tr.hit.y), bl = Math.hypot(back.x, back.y);
                    const din = vec(back.x / bl, back.y / bl);
                    const lb = arcLabel(tr.hit, din, n, 64);
                    return <g className="lab-angle i"><path d={arcPath(tr.hit, n, din, 60)} /><text x={lb.x} y={lb.y} textAnchor={lb.anchor} className="lab-label">i = {fmt(tr.incidence, 1)}°</text></g>;
                  })()}
                  {reflShown && tr.reflDir && tr.reflection != null && tr.reflection > 0.5 && (() => {
                    const lb = arcLabel(tr.hit, tr.reflDir, n, 64);
                    return <g className="lab-angle r"><path d={arcPath(tr.hit, n, tr.reflDir, 48)} /><text x={lb.x} y={lb.y} textAnchor={lb.anchor} className="lab-label">r = {fmt(tr.reflection, 1)}°</text></g>;
                  })()}
                </g>
              )}
              {/* rays */}
              <line x1={X(src)} y1={Y(src)} x2={X(tr.incEnd)} y2={Y(tr.incEnd)} className="lab-ray inc" />
              <text x={(X(src) + X(tr.incEnd)) / 2 - 8} y={(Y(src) + Y(tr.incEnd)) / 2 - 6} textAnchor="end" className="lab-label">incident ray</text>
              {reflTo && tr.hit && (
                <g>
                  <line x1={X(tr.hit)} y1={Y(tr.hit)} x2={X(reflTo)} y2={Y(reflTo)} className="lab-ray refl" />
                  {(fullRay || sim.done) && <text x={(X(tr.hit) + X(reflTo)) / 2 + 8} y={(Y(tr.hit) + Y(reflTo)) / 2 - 6} className="lab-label">reflected ray</text>}
                </g>
              )}
              {(playing || (sim.steps > 0 && !sim.done)) && <circle cx={X(pulse)} cy={Y(pulse)} r={7} className="lab-pulse" />}
              {/* torch */}
              <g className={`lab-torch ${locked('sx') ? 'is-locked' : ''}`} role="button" tabIndex={0}
                aria-label={`Torch at x ${fmt(params.sx)} centimetres, y ${fmt(params.sy)} centimetres, pointing ${fmt(params.aim)} degrees. Arrow keys move it; Q and E (or Page Up and Page Down) rotate it.`}
                onPointerDown={startDrag('move')} onKeyDown={torchKeys}>
                <g transform={`translate(${X(src)} ${Y(src)}) rotate(${-params.aim})`}>
                  <rect x={-30} y={-11} width={34} height={22} rx={5} className="lab-torch-body" />
                  <path d="M4 -14 L16 -18 L16 18 L4 14 Z" className="lab-torch-head" />
                </g>
              </g>
              {!locked('aim') && (
                <circle cx={X(handle)} cy={Y(handle)} r={11} className="lab-aim-handle" onPointerDown={startDrag('aim')} aria-hidden="true" />
              )}
            </svg>
            <p className="lab-readline" aria-hidden="true">
              <span>i = <b>{tr.incidence != null ? `${fmt(tr.incidence, 1)}°` : '—'}</b></span>
              <span>r = <b>{tr.reflection != null && reflShown ? `${fmt(tr.reflection, 1)}°` : '—'}</b></span>
              {target && <span>Star: <b>{tr.hitsTarget ? 'hit' : 'not yet'}</b></span>}
            </p>
          </div>
          <Transport playing={playing} done={sim.done} stepLabel="Step the light forward"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onStep={() => { setPlaying(false); setSim((s) => advanceLight(s, tr.pathLength, STEP_N)); }}
            onReset={() => { reset(); setAnnounce('Light switched off. Press Play to send a new pulse.'); }} />
          <div className="row">
            <Toggle icon="table" pressed={showTable} onChange={setShowTable}>Table</Toggle>
            <Toggle icon="eye" pressed={fullRay} onChange={setFullRay}>Always show reflected ray</Toggle>
          </div>
          {showTable && (
            <ValuesTable caption="Ray values" rows={[
              ['Torch position (x, y)', `${fmt(params.sx)}, ${fmt(params.sy)}`, 'cm'], ['Torch direction', fmt(params.aim), '°'], ['Mirror tilt', fmt(params.tilt), '°'],
              ['Hits the shiny side?', tr.incidence != null ? 'yes' : tr.backside ? 'no (back of mirror)' : 'no'],
              ['Angle of incidence i', tr.incidence != null ? fmt(tr.incidence, 1) : '—', tr.incidence != null ? '°' : undefined],
              ['Angle of reflection r', tr.reflection != null ? fmt(tr.reflection, 1) : '—', tr.reflection != null ? '°' : undefined],
              ...(target ? [['Star hit', tr.hitsTarget ? 'yes' : 'no'] as [string, string]] : []),
            ]} />
          )}
        </div>
        <div className="lab-side">
          <section className="card flat stack" aria-label="Settings">
            <h3>Settings</h3>
            <NumberSlider label={simple ? 'Torch direction' : 'Torch direction (from the +x axis)'} value={params.aim} range={LIGHT_RANGES.aim} unit="°" onChange={set('aim')} disabled={locked('aim')} />
            {!simple && <NumberSlider label="Mirror tilt" value={params.tilt} range={LIGHT_RANGES.tilt} unit="°" onChange={set('tilt')} disabled={locked('tilt')} />}
            {simple && locked('tilt') === false && params.tilt !== 0 && <p className="muted">Mirror tilt: {fmt(params.tilt)}°</p>}
            <div className="row">
              <Button small icon="compass" disabled={locked('aim')} onClick={() => setParams((p) => ({ ...p, aim: snap(aimAt(p.sx, p.sy, vec(MIRROR.cx, MIRROR.cy)), LIGHT_RANGES.aim) }))}>Aim at mirror centre</Button>
            </div>
            {!simple && !locked('sx') && (
              <NumberSlider label="Set the angle of incidence (places the torch)" value={clamp(Math.round(tr.incidence ?? 0), 0, 85)} range={{ min: 0, max: 85, step: 1 }} unit="°"
                onChange={(a) => setParams((p) => ({ ...p, ...placeForIncidence(a, p.tilt) }))} note="Moves the torch so the ray hits the middle of the mirror at this angle." />
            )}
            <p className="muted" style={{ margin: 0 }}>Drag the torch to move it, or drag the round handle to turn it. Keyboard: Tab to the torch, arrows move, Q/E turn.</p>
          </section>
          <Prediction key={`${JSON.stringify(params)}:${runId}`} def={prediction(params, simple || !allowTyping)} phase={phase} typed={allowTyping && !simple} />
          <Challenges
            items={challenges.map((c) => ({ id: c.id, title: c.title, goal: simple && c.goalSimple ? c.goalSimple : c.goal, hint: c.hint, question: c.question, met: c.id === active && met }))}
            active={active} completed={completed} typed={allowTyping && !simple}
            onStart={(id) => { const c = challenges.find((x) => x.id === id)!; setActive(id); setParams((p) => ({ ...p, ...c.setup })); setFullRay(true); reset(); }}
            onExit={() => setActive(null)}
            onAnswer={(id, raw, correct, hints) => { record(id, correct, { answer: raw }, hints); if (correct) void complete(id, challenges.find((c) => c.id === id)!.title, 'answer'); }}
          />
        </div>
      </div>
      <Announce text={announce} />
      <LabFooter sim="light" />
    </LabPage>
  );
}
