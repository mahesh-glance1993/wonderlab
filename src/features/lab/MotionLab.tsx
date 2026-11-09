import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fmt, niceCeil } from './common';
import {
  MOTION_DT, MOTION_RANGES, advanceMotion, initMotion, kinematics, motionOutcome, parseMotionPreset, sanitizeMotion, stopTime, type MotionParams,
} from './motion';
import { MOTION_CHALLENGES, MOTION_FLAG } from './challenges';
import { useChallengeRewards, useLabState, useReducedMotion, useSimLoop, useTier } from './hooks';
import { Announce, Challenges, Intro, LabFooter, LabPage, NumberSlider, Prediction, PresetBanner, Toggle, Transport, ValuesTable, type PredictionDef } from './LabKit';
import { TimeGraph } from './Graph';
import { Arrow } from './svg';

const STEP_N = 10; // Step = 0.5 s
const sign = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

function prediction(p: MotionParams, simple: boolean): PredictionDef {
  const o = motionOutcome(p);
  const ts = stopTime(p.u, p.a);
  const way = p.a > 0 ? 'up' : p.a < 0 ? 'down' : 'same';
  const plain = p.a > 0
    ? `The car sped up. It gained ${fmt(p.a)} m/s every second, going from ${fmt(p.u)} m/s to ${fmt(o.v)} m/s.`
    : p.a === 0
      ? `With no acceleration the speed stayed at ${fmt(p.u)} m/s, so the car covered the same distance every second.`
      : o.stopped
        ? `The brakes took away ${fmt(-p.a)} m/s every second, so the car stopped after ${fmt(o.tEnd)} s, ${fmt(o.x)} m from the start.`
        : `The brakes took away ${fmt(-p.a)} m/s every second, slowing the car from ${fmt(p.u)} to ${fmt(o.v)} m/s.`;
  if (simple) {
    return {
      question: 'What will happen to the car’s speed?',
      choices: [{ value: 'up', label: 'It will speed up' }, { value: 'same', label: 'It will stay the same' }, { value: 'down', label: 'It will slow down' }],
      spec: { kind: 'choice', correct: way }, outcome: plain,
    };
  }
  const formula = o.stopped && ts != null
    ? <>v = u + at reaches 0 when t = u ÷ |a| = {fmt(p.u)} ÷ {fmt(-p.a)} = {fmt(ts)} s. The brakes can’t push it backwards, so v stays 0 m/s. Distance s = u² ÷ 2|a| = {fmt(o.x)} m.</>
    : <>v = u + at = {fmt(p.u)} + {sign(p.a)} × {fmt(o.tEnd)} = <b>{fmt(o.v)} m/s</b>; s = ut + ½at² = {fmt(p.u)} × {fmt(o.tEnd)} + ½ × {sign(p.a)} × {fmt(o.tEnd)}² = <b>{fmt(o.x)} m</b>.</>;
  return {
    question: `Predict the speed v at the end of the run (t = ${fmt(o.tEnd)} s${o.stopped ? ', when it stops' : ''}).`,
    choices: [...new Set([o.v, p.u, Math.max(0, p.u + 2 * p.a)].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} m/s` })),
    spec: { kind: 'number', value: o.v, unit: 'm/s', tolerance: Math.max(0.1, Math.abs(o.v) * 0.02) }, unit: 'm/s',
    outcome: <>{plain} {formula}</>,
  };
}

export default function MotionLab() {
  const [search] = useSearchParams();
  const preset = useMemo(() => parseMotionPreset(search), [search]);
  const { params, setParams, completed, markDone, seenIntro, markIntroSeen } = useLabState('motion', sanitizeMotion, preset);
  const { simple, allowTyping } = useTier();
  const reduced = useReducedMotion();
  const [sim, setSim] = useState(() => initMotion(params));
  const [playing, setPlaying] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showGraphs, setShowGraphs] = useState(!simple);
  const [bannerFor] = useState<MotionParams | null>(() => (preset ? params : null));
  const [banner, setBanner] = useState(!!preset);
  const [active, setActive] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [announce, setAnnounce] = useState('');
  const { record, complete } = useChallengeRewards('motion', completed, markDone);

  useEffect(() => { setShowGraphs(!simple); }, [simple]);
  useEffect(() => { setSim(initMotion(params)); setPlaying(false); }, [params]);
  useSimLoop(playing, MOTION_DT, reduced, (n) => setSim((s) => advanceMotion(s, params, n)));
  useEffect(() => {
    if (!sim.done) return;
    setPlaying(false);
    setAnnounce(`Run finished at t = ${fmt(sim.t)} s: speed ${fmt(sim.v)} metres per second, distance ${fmt(sim.x)} metres${sim.stopped ? ', car stopped' : ''}.`);
  }, [sim.done]); // eslint-disable-line react-hooks/exhaustive-deps

  const challenges = MOTION_CHALLENGES.filter((c) => !simple || !c.seniorOnly);
  const cur = challenges.find((c) => c.id === active) || null;
  const met = !!cur && cur.check(params, sim);
  useEffect(() => { if (cur && met) void complete(cur.id, cur.title, 'sim', { params }); }, [met]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = (k: keyof MotionParams) => !!cur?.locked.includes(k);
  const set = (k: keyof MotionParams) => (v: number) => setParams((p) => ({ ...p, [k]: v }));

  const out = motionOutcome(params);
  const flag = cur?.id === 'flag' ? MOTION_FLAG : null;
  const trackMax = niceCeil(Math.max(out.x, flag ?? 0, 10) * 1.05);
  const vScale = niceCeil(Math.max(out.vMax, 1));
  const phase = sim.done ? 'after' : sim.steps === 0 && !playing ? 'before' : 'running';
  const pred = prediction(params, simple || !allowTyping);

  // stage geometry
  const X0 = 40, X1 = 570, px = (m: number) => X0 + (m / trackMax) * (X1 - X0);
  const carX = px(sim.x);
  const vLen = (sim.v / vScale) * 110;
  const aLen = params.a === 0 || sim.stopped ? 0 : Math.sign(params.a) * (20 + (Math.abs(params.a) / 10) * 70);
  const tickStep = trackMax / 5;

  const sampleRows = sim.samples.filter((_, i) => i % 10 === 0 || i === sim.samples.length - 1);
  const k = kinematics(params.u, params.a, sim.t);

  return (
    <LabPage title="Motion Lab">
      {banner && bannerFor && (
        <PresetBanner onDismiss={() => setBanner(false)}>
          With u = {fmt(bannerFor.u)} m/s and a = {fmt(bannerFor.a)} m/s², at t = {fmt(motionOutcome(bannerFor).tEnd)} s:
          {' '}<b>v = {fmt(motionOutcome(bannerFor).v)} m/s</b> and <b>s = {fmt(motionOutcome(bannerFor).x)} m</b>. Press Play to watch it happen.
        </PresetBanner>
      )}
      <Intro
        open={!seenIntro} onToggle={(o) => { if (!o) markIntroSeen(); }}
        explore={simple
          ? 'Watch a car move along a straight road. Change how fast it starts and whether it speeds up or slows down.'
          : 'Explore motion in a straight line with constant acceleration. Compare the car with its position–time and velocity–time graphs.'}
        assumptions={[
          'The road is straight and flat; the car is treated as a single point.',
          'The acceleration stays the same for the whole run.',
          'A negative acceleration means braking. Brakes slow the car to a stop but never push it backwards.',
          `Time moves in small fixed steps of ${MOTION_DT} s, so every run is exactly the same.`,
        ]}
        units={[['Distance', 'metres (m)'], ['Time', 'seconds (s)'], ['Speed / velocity', 'metres per second (m/s)'], ['Acceleration', 'metres per second squared (m/s²)']]}
      />
      <div className="lab-layout">
        <div className="lab-main">
          <div className="lab-stage card">
            <svg viewBox="0 0 600 170" role="img" aria-labelledby="motion-stage-t">
              <title id="motion-stage-t">{`Car on a track at ${fmt(sim.x)} m, moving at ${fmt(sim.v)} m/s, time ${fmt(sim.t)} s${flag ? `. Flag at ${flag} m` : ''}.`}</title>
              <rect x={X0 - 10} y={118} width={X1 - X0 + 20} height={14} rx={7} className="lab-road" />
              {Array.from({ length: 6 }, (_, i) => i * tickStep).map((m) => (
                <g key={m}>
                  <line x1={px(m)} x2={px(m)} y1={132} y2={140} className="lab-axis" />
                  <text x={px(m)} y={156} textAnchor="middle" className="lab-tick">{fmt(m, 1)} m</text>
                </g>
              ))}
              {flag != null && (
                <g aria-hidden="true">
                  <line x1={px(flag)} x2={px(flag)} y1={70} y2={120} className="lab-flagpole" />
                  <path d={`M${px(flag)} 70 h26 l-7 8 l7 8 h-26z`} className="lab-flag" />
                  <text x={px(flag) + 4} y={64} className="lab-label">flag {flag} m</text>
                </g>
              )}
              <g transform={`translate(${carX} 0)`} className="lab-car">
                <rect x={-24} y={92} width={48} height={20} rx={7} />
                <rect x={-14} y={80} width={26} height={16} rx={5} />
                <circle cx={-13} cy={114} r={6} className="lab-wheel" />
                <circle cx={13} cy={114} r={6} className="lab-wheel" />
              </g>
              <Arrow x1={carX} y1={56} x2={carX + vLen} y2={56} className="v" label={`v = ${fmt(sim.v, 1)} m/s`} labelDy={-8} />
              {!simple && <Arrow x1={carX} y1={30} x2={carX + aLen} y2={30} className="a" label={`a = ${fmt(sim.stopped ? 0 : params.a, 1)} m/s²`} labelDy={-8} />}
              <text x={590} y={18} textAnchor="end" className="lab-readout">t = {fmt(sim.t, 2)} s</text>
            </svg>
            <p className="lab-readline" aria-hidden="true">
              <span>t = <b>{fmt(sim.t, 2)} s</b></span>
              <span>{simple ? 'Distance' : 'Position s'} = <b>{fmt(sim.x, 2)} m</b></span>
              <span>{simple ? 'Speed' : 'Velocity v'} = <b>{fmt(sim.v, 2)} m/s</b></span>
            </p>
          </div>
          <Transport playing={playing} done={sim.done} stepLabel="Step forward 0.5 seconds"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onStep={() => { setPlaying(false); setSim((s) => advanceMotion(s, params, STEP_N)); }}
            onReset={() => { setPlaying(false); setSim(initMotion(params)); setRunId((r) => r + 1); setAnnounce('Reset to the start.'); }} />
          <div className="row">
            <Toggle icon="table" pressed={showTable} onChange={setShowTable}>Table</Toggle>
            <Toggle icon="chart" pressed={showGraphs} onChange={setShowGraphs}>Graphs</Toggle>
          </div>
          {showGraphs && (
            <div className="lab-graphs">
              <TimeGraph title="Position–time graph" tone="x" points={sim.samples.map((s) => ({ t: s.t, y: s.x }))} tMax={params.t} yMin={0} yMax={niceCeil(Math.max(out.x, 1))} yLabel="position s" unit="m" marker={{ t: sim.t, y: sim.x }} />
              <TimeGraph title="Velocity–time graph" tone="v" points={sim.samples.map((s) => ({ t: s.t, y: s.v }))} tMax={params.t} yMin={0} yMax={vScale} yLabel="velocity v" unit="m/s" marker={{ t: sim.t, y: sim.v }} />
            </div>
          )}
          {showTable && (
            <div className="lab-tables">
              <ValuesTable caption="Values now" rows={[
                ['Time t', fmt(sim.t, 2), 's'], ['Starting speed u', fmt(params.u), 'm/s'], ['Acceleration a', fmt(params.a), 'm/s²'],
                [simple ? 'Distance' : 'Position s', fmt(sim.x, 2), 'm'], [simple ? 'Speed' : 'Velocity v', fmt(sim.v, 2), 'm/s'],
                ['Car stopped?', sim.stopped ? 'yes' : 'no'],
                ...(flag != null ? [['Distance to flag', fmt(flag - sim.x, 2), 'm'] as [string, string, string]] : []),
              ]} />
              <div className="lab-scroll" tabIndex={0} role="region" aria-label="Graph data table">
                <table className="data lab-table">
                  <caption>Graph data (every 0.5 s)</caption>
                  <thead><tr><th scope="col">t (s)</th><th scope="col">s (m)</th><th scope="col">v (m/s)</th></tr></thead>
                  <tbody>{sampleRows.map((r) => <tr key={r.t}><td>{fmt(r.t, 2)}</td><td>{fmt(r.x, 2)}</td><td>{fmt(r.v, 2)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="lab-side">
          <section className="card flat stack" aria-label="Settings">
            <h3>Settings</h3>
            <NumberSlider label={simple ? 'Starting speed' : 'Initial speed u'} value={params.u} range={MOTION_RANGES.u} unit="m/s" onChange={set('u')} disabled={locked('u')} />
            <NumberSlider label={simple ? 'Speeding up (+) or braking (−)' : 'Acceleration a'} value={params.a} range={MOTION_RANGES.a} unit="m/s²" onChange={set('a')} disabled={locked('a')}
              note={params.a < 0 ? 'Negative: the car is braking.' : params.a > 0 ? 'Positive: the car is speeding up.' : 'Zero: steady speed.'} />
            {(!simple || locked('t')) && <NumberSlider label={simple ? 'Run time' : 'Run time t'} value={params.t} range={MOTION_RANGES.t} unit="s" onChange={set('t')} disabled={locked('t')} />}
          </section>
          {!simple && (
            <section className="card flat lab-formulas" aria-label="Formulas">
              <h3>Equations of motion</h3>
              <p>v = u + at = {fmt(params.u)} + {sign(params.a)} × {fmt(sim.t, 2)} = <b>{fmt(k.v, 2)} m/s</b>{k.stopped && ' (stopped)'}</p>
              <p>s = ut + ½at² = {fmt(params.u)} × {fmt(sim.t, 2)} + ½ × {sign(params.a)} × {fmt(sim.t, 2)}² = <b>{fmt(k.x, 2)} m</b></p>
            </section>
          )}
          <Prediction key={`${JSON.stringify(params)}:${runId}`} def={pred} phase={phase} typed={allowTyping && !simple} />
          <Challenges
            items={challenges.map((c) => ({ id: c.id, title: c.title, goal: simple && c.goalSimple ? c.goalSimple : c.goal, hint: c.hint, question: c.question, met: c.id === active && met }))}
            active={active} completed={completed} typed={allowTyping && !simple}
            onStart={(id) => { const c = challenges.find((x) => x.id === id)!; setActive(id); setParams((p) => ({ ...p, ...c.setup })); setRunId((r) => r + 1); }}
            onExit={() => setActive(null)}
            onAnswer={(id, raw, correct, hints) => { record(id, correct, { answer: raw }, hints); if (correct) void complete(id, challenges.find((c) => c.id === id)!.title, 'answer'); }}
          />
        </div>
      </div>
      <Announce text={announce} />
      <LabFooter sim="motion" />
    </LabPage>
  );
}
