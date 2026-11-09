import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Segmented } from '../../ui/kit';
import { fmt } from './common';
import { FORCES_DT, FORCES_RANGES, FORCES_RUN, G, advanceForces, forceBreakdown, initForces, parseForcesPreset, sanitizeForces, type ForcesParams } from './forces';
import { FORCES_CHALLENGES } from './challenges';
import { useChallengeRewards, useLabState, useReducedMotion, useSimLoop, useTier } from './hooks';
import { Announce, Challenges, Intro, LabFooter, LabPage, NumberSlider, Prediction, PresetBanner, Toggle, Transport, ValuesTable, type PredictionDef } from './LabKit';
import { Arrow } from './svg';

const STEP_N = 10; // 0.5 s
const SURFACES = [
  { mu: 0.05, label: 'Ice' }, { mu: 0.3, label: 'Wood' }, { mu: 0.5, label: 'Carpet' }, { mu: 0.8, label: 'Sandpaper' },
];
const surfaceName = (mu: number) => SURFACES.find((s) => Math.abs(s.mu - mu) < 1e-9)?.label;

function prediction(p: ForcesParams, simple: boolean): PredictionDef {
  const b = forceBreakdown(p, 0);
  const moves = b.sliding;
  const plain = moves
    ? `The push (${fmt(p.force)} N) was bigger than the most friction the floor can give (${fmt(b.maxFriction)} N), so the box slid and kept speeding up.`
    : `Friction can hold back up to ${fmt(b.maxFriction)} N. The push was only ${fmt(p.force)} N, so friction matched it exactly and the box stayed still.`;
  if (simple) {
    return {
      question: 'Will the box move when you press Play?',
      choices: [{ value: 'yes', label: 'Yes, it will slide' }, { value: 'no', label: 'No, it will stay still' }],
      spec: { kind: 'choice', correct: moves ? 'yes' : 'no' }, outcome: plain,
    };
  }
  return {
    question: 'Predict the acceleration a of the box.',
    choices: [...new Set([b.acceleration, p.force / p.mass, 0].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} m/s²` })),
    spec: { kind: 'number', value: b.acceleration, unit: 'm/s^2', tolerance: Math.max(0.05, Math.abs(b.acceleration) * 0.02) }, unit: 'm/s²',
    outcome: <>{plain} Maximum friction = μmg = {fmt(p.friction)} × {fmt(p.mass)} × {G} = {fmt(b.maxFriction)} N. {moves
      ? <>F<sub>net</sub> = {fmt(p.force)} − {fmt(b.maxFriction)} = {fmt(b.net)} N, so a = F<sub>net</sub> ÷ m = {fmt(b.net)} ÷ {fmt(p.mass)} = <b>{fmt(b.acceleration)} m/s²</b>.</>
      : <>F<sub>net</sub> = 0 N, so <b>a = 0 m/s²</b>.</>}</>,
  };
}

export default function ForcesLab() {
  const [search] = useSearchParams();
  const preset = useMemo(() => parseForcesPreset(search), [search]);
  const { params, setParams, completed, markDone, seenIntro, markIntroSeen } = useLabState('forces', sanitizeForces, preset);
  const { simple, allowTyping } = useTier();
  const reduced = useReducedMotion();
  const [sim, setSim] = useState(initForces);
  const [playing, setPlaying] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [bannerFor] = useState<ForcesParams | null>(() => (preset ? params : null));
  const [banner, setBanner] = useState(!!preset);
  const [active, setActive] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [announce, setAnnounce] = useState('');
  const { record, complete } = useChallengeRewards('forces', completed, markDone);

  useSimLoop(playing, FORCES_DT, reduced, (n) => setSim((s) => advanceForces(s, params, n)));
  useEffect(() => {
    if (!sim.done) return;
    setPlaying(false);
    setAnnounce(`Run finished after ${FORCES_RUN} seconds. The box travelled ${fmt(sim.x)} metres and is moving at ${fmt(sim.v)} metres per second.`);
  }, [sim.done]); // eslint-disable-line react-hooks/exhaustive-deps

  const b = forceBreakdown(params, sim.v);
  const challenges = FORCES_CHALLENGES.filter((c) => !simple || !c.seniorOnly);
  const cur = challenges.find((c) => c.id === active) || null;
  const met = !!cur && cur.check(params, sim);
  useEffect(() => { if (cur && met) void complete(cur.id, cur.title, 'sim', { params }); }, [met]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = (k: keyof ForcesParams) => !!cur?.locked.includes(k);
  const set = (k: keyof ForcesParams) => (v: number) => setParams((p) => ({ ...p, [k]: v }));
  const reset = () => { setPlaying(false); setSim(initForces()); setRunId((r) => r + 1); };
  const phase = sim.done || sim.t >= 1 ? 'after' : sim.steps === 0 && !playing ? 'before' : 'running';

  // stage geometry: 40 px per metre; camera follows the box once it passes the middle
  const PPM = 40, X0 = 170, FLOOR = 205;
  const boxW = 50 + Math.min(40, params.mass), boxH = boxW * 0.8;
  const travel = sim.x * PPM;
  const boxX = X0 + Math.min(travel, 160);
  const offset = travel - (boxX - X0);
  const cx = boxX, cy = FLOOR - boxH / 2;
  const fScale = 100 / Math.max(params.force, b.weight, b.maxFriction, 1); // one scale for every arrow: length ∝ force
  const L = (f: number) => f * fScale;
  const firstTick = Math.floor(offset / PPM) - 5;

  return (
    <LabPage title="Forces Lab">
      {banner && bannerFor && (() => {
        const bb = forceBreakdown(bannerFor, 0);
        return (
          <PresetBanner onDismiss={() => setBanner(false)}>
            Mass {fmt(bannerFor.mass)} kg, push {fmt(bannerFor.force)} N, μ = {fmt(bannerFor.friction)}: friction = {fmt(bb.friction)} N, net force = {fmt(bb.net)} N,
            {' '}<b>acceleration = {fmt(bb.acceleration)} m/s²</b>.
          </PresetBanner>
        );
      })()}
      <Intro
        open={!seenIntro} onToggle={(o) => { if (!o) markIntroSeen(); }}
        explore={simple
          ? 'Push a box along the floor. See how its weight and the floor’s roughness change what happens.'
          : 'Explore Newton’s second law with friction: how applied force, mass and the friction coefficient μ decide the acceleration.'}
        assumptions={[
          'The floor is flat, so the normal force equals the weight (mg), with g = 9.8 m/s².',
          'Friction pushes against the motion. While the box is still, friction matches the push up to a maximum of μmg.',
          'Once sliding, friction is exactly μmg (we use one μ for both, a simplification).',
          'The push is steady and horizontal; there is no air resistance.',
          `Time moves in fixed steps of ${FORCES_DT} s; each run lasts ${FORCES_RUN} s.`,
        ]}
        units={[['Force', 'newtons (N)'], ['Mass', 'kilograms (kg)'], ['Acceleration', 'm/s²'], ['Speed', 'm/s'], ['Distance', 'metres (m)'], ['Friction coefficient μ', 'no unit']]}
      />
      <div className="lab-layout">
        <div className="lab-main">
          <div className="lab-stage card">
            <svg viewBox="0 0 600 340" role="img" aria-labelledby="forces-stage-t">
              <title id="forces-stage-t">{`Box of ${fmt(params.mass)} kg pushed with ${fmt(params.force)} newtons. Friction ${fmt(b.friction)} N, weight ${fmt(b.weight)} N, normal force ${fmt(b.normal)} N. ${b.sliding ? `Sliding with acceleration ${fmt(b.acceleration)} m/s².` : 'Not moving.'}`}</title>
              <rect x={0} y={FLOOR} width={600} height={26} className={`lab-floor mu-${Math.round(params.friction * 10)}`} />
              {Array.from({ length: 22 }, (_, i) => firstTick + i).map((m) => {
                const x = X0 + m * PPM - offset;
                return x < -10 || x > 610 ? null : (
                  <g key={m}><line x1={x} x2={x} y1={FLOOR} y2={FLOOR + 8} className="lab-axis" />{m % 2 === 0 && m >= 0 && <text x={x} y={FLOOR + 22} textAnchor="middle" className="lab-tick">{m} m</text>}</g>
                );
              })}
              <rect x={cx - boxW / 2} y={FLOOR - boxH} width={boxW} height={boxH} rx={6} className="lab-box" />
              <text x={cx} y={FLOOR - boxH + 17} textAnchor="middle" className="lab-box-label">{fmt(params.mass)} kg</text>
              <Arrow x1={cx + boxW / 2} y1={cy} x2={cx + boxW / 2 + L(params.force)} y2={cy} className="f-applied" label={`${simple ? 'Push' : 'Applied'} ${fmt(params.force, 1)} N`} anchor="start" labelDx={-L(params.force) / 2 + 4} labelDy={-10} />
              <Arrow x1={cx - boxW / 2} y1={FLOOR - 6} x2={cx - boxW / 2 - L(b.friction)} y2={FLOOR - 6} className="f-friction" label={`Friction ${fmt(b.friction, 1)} N`} anchor="end" labelDx={L(b.friction) / 2 - 4} labelDy={-10} />
              <Arrow x1={cx} y1={FLOOR - boxH} x2={cx} y2={FLOOR - boxH - L(b.normal)} className="f-normal" label={`Normal ${fmt(b.normal, 1)} N`} anchor="start" labelDx={10} labelDy={-L(b.normal) / 2 + 6} />
              <Arrow x1={cx} y1={cy + 6} x2={cx} y2={cy + 6 + L(b.weight)} className="f-weight" label={`Weight ${fmt(b.weight, 1)} N`} anchor="start" labelDx={10} labelDy={L(b.weight) / 2 - 2} />
              {!simple && b.net > 0 && <Arrow x1={cx - L(b.net) / 2} y1={24} x2={cx + L(b.net) / 2} y2={24} className="f-net" label={`Net force ${fmt(b.net, 1)} N`} anchor="start" labelDx={L(b.net) / 2 + 8} labelDy={5} />}
              <text x={590} y={18} textAnchor="end" className="lab-readout">t = {fmt(sim.t, 2)} s</text>
            </svg>
            <p className="lab-readline" aria-hidden="true">
              <span>{b.sliding ? 'Sliding' : 'Not moving'}</span>
              <span>{simple ? 'Speed' : 'v'} = <b>{fmt(sim.v, 2)} m/s</b></span>
              <span>{simple ? 'Distance' : 'x'} = <b>{fmt(sim.x, 2)} m</b></span>
              {!simple && <span>a = <b>{fmt(b.acceleration, 2)} m/s²</b></span>}
            </p>
          </div>
          <Transport playing={playing} done={sim.done} stepLabel="Step forward 0.5 seconds"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onStep={() => { setPlaying(false); setSim((s) => advanceForces(s, params, STEP_N)); }}
            onReset={() => { reset(); setAnnounce('Box back at the start.'); }} />
          <div className="row"><Toggle icon="table" pressed={showTable} onChange={setShowTable}>Table</Toggle></div>
          {showTable && (
            <ValuesTable caption="Forces and motion now" rows={[
              ['Mass m', fmt(params.mass), 'kg'], [simple ? 'Push' : 'Applied force F', fmt(params.force), 'N'],
              ['Friction coefficient μ', `${fmt(params.friction)}${surfaceName(params.friction) ? ` (${surfaceName(params.friction)})` : ''}`],
              ['Weight (mg)', fmt(b.weight), 'N'], ['Normal force', fmt(b.normal), 'N'], ['Most friction possible (μmg)', fmt(b.maxFriction), 'N'],
              ['Friction now', fmt(b.friction), 'N'], ['Net force', fmt(b.net), 'N'], ['Acceleration a', fmt(b.acceleration), 'm/s²'],
              ['Moving?', b.sliding ? 'yes' : 'no'], ['Time', fmt(sim.t, 2), 's'], ['Speed', fmt(sim.v, 2), 'm/s'], ['Distance', fmt(sim.x, 2), 'm'],
            ]} />
          )}
        </div>
        <div className="lab-side">
          <section className="card flat stack" aria-label="Settings">
            <h3>Settings</h3>
            <NumberSlider label={simple ? 'Mass of the box' : 'Mass m'} value={params.mass} range={FORCES_RANGES.mass} unit="kg" onChange={set('mass')} disabled={locked('mass')} />
            <NumberSlider label={simple ? 'Push' : 'Applied force F'} value={params.force} range={FORCES_RANGES.force} unit="N" onChange={set('force')} disabled={locked('force')} />
            {simple ? (
              <div className="lab-slider">
                <span className="lab-seg-label" id="surface-l">Floor {locked('friction') && <span className="pill">fixed</span>}</span>
                {locked('friction')
                  ? <p style={{ margin: 0 }}>{surfaceName(params.friction) ?? 'Custom'} (μ = {fmt(params.friction)})</p>
                  : <Segmented label="Floor surface" value={surfaceName(params.friction) ? params.friction : -1}
                      options={SURFACES.map((s) => ({ value: s.mu, label: `${s.label} (μ ${s.mu})` }))} onChange={(mu) => set('friction')(mu)} />}
              </div>
            ) : (
              <NumberSlider label="Friction coefficient μ" value={params.friction} range={FORCES_RANGES.friction} unit="" display={(v) => `mu ${fmt(v)}`} onChange={set('friction')} disabled={locked('friction')}
                note={surfaceName(params.friction) ? `About the same as ${surfaceName(params.friction)!.toLowerCase()}.` : undefined} />
            )}
          </section>
          {!simple && (
            <section className="card flat lab-formulas" aria-label="Formulas">
              <h3>Newton’s second law</h3>
              <p>W = mg = {fmt(params.mass)} × {G} = <b>{fmt(b.weight)} N</b></p>
              <p>Max friction = μmg = {fmt(params.friction)} × {fmt(b.normal)} = <b>{fmt(b.maxFriction)} N</b></p>
              <p>F<sub>net</sub> = F − friction = {fmt(params.force)} − {fmt(b.friction)} = <b>{fmt(b.net)} N</b></p>
              <p>a = F<sub>net</sub> ÷ m = {fmt(b.net)} ÷ {fmt(params.mass)} = <b>{fmt(b.acceleration)} m/s²</b></p>
            </section>
          )}
          <Prediction key={`${JSON.stringify(params)}:${runId}`} def={prediction(params, simple || !allowTyping)} phase={phase} typed={allowTyping && !simple} />
          <Challenges
            items={challenges.map((c) => ({ id: c.id, title: c.title, goal: simple && c.goalSimple ? c.goalSimple : c.goal, hint: c.hint, question: c.question, met: c.id === active && met }))}
            active={active} completed={completed} typed={allowTyping && !simple}
            onStart={(id) => { const c = challenges.find((x) => x.id === id)!; setActive(id); setParams((p) => ({ ...p, ...c.setup })); reset(); }}
            onExit={() => setActive(null)}
            onAnswer={(id, raw, correct, hints) => { record(id, correct, { answer: raw }, hints); if (correct) void complete(id, challenges.find((c) => c.id === id)!.title, 'answer'); }}
          />
        </div>
      </div>
      <Announce text={announce} />
      <LabFooter sim="forces" />
    </LabPage>
  );
}
