import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../ui/kit';
import { fmt } from './common';
import {
  BULB_R, CELL_V, CIRCUIT_DT, MAX_BULBS, MAX_CELLS, advanceCircuit, brightnessWord, initCircuit, parseCircuitPreset, sanitizeCircuit, solveCircuit,
  type CircuitParams, type WireSide,
} from './circuit';
import { circuitChallenges } from './challenges';
import { useChallengeRewards, useLabState, useReducedMotion, useSimLoop, useTier } from './hooks';
import { Announce, Challenges, Intro, LabFooter, LabPage, Prediction, PresetBanner, Toggle, Transport, ValuesTable, type PredictionDef } from './LabKit';

const STEP_N = 10;
// loop geometry (clockwise from top-left)
const LX = 70, RX = 530, TY = 60, BY = 260;
const PERIM = 2 * (RX - LX) + 2 * (BY - TY);
function pointOnLoop(s: number): [number, number] {
  const w = RX - LX, h = BY - TY;
  s = ((s % PERIM) + PERIM) % PERIM;
  if (s < w) return [LX + s, TY];
  if (s < w + h) return [RX, TY + (s - w)];
  if (s < 2 * w + h) return [RX - (s - w - h), BY];
  return [LX, BY - (s - 2 * w - h)];
}
const GAP_AT: Record<WireSide, [number, number]> = { left: [LX, (TY + BY) / 2], right: [RX, TY + 45], bottom: [RX - 40, BY], top: [LX + 30, TY] };
const SIDE_NAME: Record<WireSide, string> = { left: 'left', right: 'right', bottom: 'bottom', top: 'top' };

function prediction(c: CircuitParams, simple: boolean): PredictionDef {
  const s = solveCircuit(c);
  const why = s.complete
    ? `The switch was closed and the wires made a complete loop, so charge could flow all the way round from the battery, through the bulb${c.bulbs > 1 ? 's' : ''} and back.`
    : c.gap ? `There was a gap in the ${c.gap} wire, so the loop was broken (an open circuit) and no charge could flow.`
      : 'The switch was open, which leaves a gap in the loop (an open circuit), so no charge could flow.';
  if (simple) {
    return {
      question: 'Will the bulbs light up when you press Play?',
      choices: [{ value: 'yes', label: 'Yes, they will light' }, { value: 'no', label: 'No, they will stay dark' }],
      spec: { kind: 'choice', correct: s.complete ? 'yes' : 'no' }, outcome: why,
    };
  }
  return {
    question: 'Predict the current I in the circuit.',
    choices: [...new Set([s.current, s.voltage / BULB_R, 0].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} A` })),
    spec: { kind: 'number', value: s.current, unit: 'A', tolerance: 0.01 }, unit: 'A',
    outcome: <>{why} {s.complete
      ? <>V = {c.cells} × {CELL_V} = {fmt(s.voltage)} V, R = {c.bulbs} × {BULB_R} = {fmt(s.resistance)} Ω, so I = V ÷ R = <b>{fmt(s.current, 3)} A</b>. Each bulb gets P = I²R = {fmt(s.bulbPower, 3)} W.</>
      : <>In an open circuit <b>I = 0 A</b>.</>}</>,
  };
}

export default function CircuitLab() {
  const [search] = useSearchParams();
  const preset = useMemo(() => parseCircuitPreset(search), [search]);
  const { params, setParams, completed, markDone, seenIntro, markIntroSeen } = useLabState('circuit', sanitizeCircuit, preset);
  const { simple, allowTyping } = useTier();
  const reduced = useReducedMotion();
  const [sim, setSim] = useState(initCircuit);
  const [playing, setPlaying] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [bannerFor] = useState<CircuitParams | null>(() => (preset ? params : null));
  const [banner, setBanner] = useState(!!preset);
  const [active, setActive] = useState<string | null>(null);
  const [faultIndex, setFaultIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [announce, setAnnounce] = useState('');
  const { record, complete } = useChallengeRewards('circuit', completed, markDone);

  useSimLoop(playing, CIRCUIT_DT, reduced, (n) => setSim((s) => advanceCircuit(s, params, n)));

  const sol = solveCircuit(params);
  const powered = playing || sim.steps > 0; // the experiment starts with Play; before that you build and predict
  const I = powered ? sol.current : 0;
  const word = brightnessWord(powered ? sol.bulbPower : 0);
  const glow = powered ? Math.sqrt(sol.brightness) : 0;
  const phase = sim.t >= 1 ? 'after' : sim.steps === 0 && !playing ? 'before' : 'running';

  const challenges = circuitChallenges(faultIndex).filter((c) => !simple || !c.seniorOnly);
  const cur = challenges.find((c) => c.id === active) || null;
  const met = !!cur && cur.check(params, sim);
  useEffect(() => { if (cur && met) void complete(cur.id, cur.title, 'sim', { params }); }, [met]); // eslint-disable-line react-hooks/exhaustive-deps
  const lockedParts = !!cur?.locked.includes('cells');

  const change = (p: Partial<CircuitParams>, msg: string) => { setParams((c) => ({ ...c, ...p })); setAnnounce(msg); };
  const toggleSwitch = () => change({ closed: !params.closed }, params.closed ? 'Switch opened. The circuit is broken.' : 'Switch closed.');
  const inspectWire = (side: WireSide) => {
    if (params.gap === side) change({ gap: null }, `There was a gap in the ${SIDE_NAME[side]} wire. You joined it!`);
    else setAnnounce(`The ${SIDE_NAME[side]} wire is connected properly.`);
  };
  const key = (fn: () => void) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
  const reset = () => { setPlaying(false); setSim(initCircuit()); setRunId((r) => r + 1); };

  // components along the loop
  const cellW = 54, cellsX0 = (LX + RX) / 2 - (params.cells * cellW) / 2;
  const bulbXs = Array.from({ length: params.bulbs }, (_, i) => (LX + RX) / 2 + (i - (params.bulbs - 1) / 2) * 110);
  const SW_Y = (TY + BY) / 2 + 10;
  const dots = powered && sol.complete && !reduced ? Array.from({ length: 18 }, (_, i) => pointOnLoop(((i / 18 + sim.phase) % 1) * PERIM)) : [];
  const chevrons = powered && sol.complete && reduced ? [0.12, 0.37, 0.62, 0.87].map((f) => ({ p: pointOnLoop(f * PERIM), f })) : [];

  const wire = (side: WireSide, d: string) => (
    <g className="lab-wire-hit" role="button" tabIndex={0} aria-label={`${SIDE_NAME[side]} wire — check it`} onClick={() => inspectWire(side)} onKeyDown={key(() => inspectWire(side))}>
      <path d={d} className="lab-wire-touch" />
      <path d={d} className="lab-wire" />
    </g>
  );
  const gapMask = params.gap ? GAP_AT[params.gap] : null;

  return (
    <LabPage title="Circuit Lab">
      {banner && bannerFor && (() => {
        const s = solveCircuit({ ...bannerFor, gap: null });
        return (
          <PresetBanner onDismiss={() => setBanner(false)}>
            {bannerFor.cells} cell{bannerFor.cells > 1 ? 's' : ''} ({fmt(s.voltage)} V), {bannerFor.bulbs} bulb{bannerFor.bulbs > 1 ? 's' : ''} ({fmt(s.resistance)} Ω), switch {bannerFor.closed ? 'closed' : 'open'}:
            {' '}<b>current = {fmt(s.current, 3)} A</b>{s.complete ? `, each bulb ${brightnessWord(s.bulbPower)}` : ' — open circuit, bulbs off'}. Press Play to test it.
          </PresetBanner>
        );
      })()}
      <Intro
        open={!seenIntro} onToggle={(o) => { if (!o) markIntroSeen(); }}
        explore={simple
          ? 'Build a circuit with batteries, a switch and bulbs. Find out what makes a bulb light up, and what makes it brighter or dimmer.'
          : 'Build a series circuit and explore Ohm’s law: how the number of cells and bulbs sets the voltage, resistance, current and brightness.'}
        assumptions={[
          `Each cell gives ${CELL_V} V. Cells add up because they are joined one after another (in series).`,
          `Each bulb has the same resistance, ${BULB_R} Ω. Bulbs in series add their resistances.`,
          'Wires and cells are perfect (no resistance of their own).',
          'Brightness grows with the power each bulb uses (P = I²R).',
          'Charge only flows round a complete, closed loop.',
        ]}
        units={[['Voltage', 'volts (V)'], ['Current', 'amperes (A)'], ['Resistance', 'ohms (Ω)'], ['Power', 'watts (W)']]}
      />
      <div className="lab-layout">
        <div className="lab-main">
          <div className="lab-stage card">
            <svg viewBox="0 0 600 320" role="img" aria-labelledby="circuit-stage-t">
              <title id="circuit-stage-t">{`Series circuit with ${params.cells} cells, ${params.bulbs} bulbs, switch ${params.closed ? 'closed' : 'open'}${params.gap ? ', and a broken wire somewhere' : ''}. ${powered ? (sol.complete ? `Current ${fmt(sol.current, 3)} amps, bulbs ${word}.` : 'No current: bulbs off.') : 'Power not switched on yet: press Play.'}`}</title>
              {wire('top', `M${LX} ${TY} H${RX}`)}
              {wire('right', `M${RX} ${TY} V${BY}`)}
              {wire('bottom', `M${RX} ${BY} H${LX}`)}
              {wire('left', `M${LX} ${BY} V${TY}`)}
              {gapMask && (
                <g>
                  <rect x={gapMask[0] - 14} y={gapMask[1] - 14} width={28} height={28} className="lab-gap-bg" />
                  <circle cx={gapMask[0] + (params.gap === 'left' || params.gap === 'right' ? 0 : -12)} cy={gapMask[1] + (params.gap === 'left' || params.gap === 'right' ? -12 : 0)} r={3} className="lab-wire-end" />
                  <circle cx={gapMask[0] + (params.gap === 'left' || params.gap === 'right' ? 0 : 12)} cy={gapMask[1] + (params.gap === 'left' || params.gap === 'right' ? 12 : 0)} r={3} className="lab-wire-end" />
                </g>
              )}
              {/* cells on the top wire, + terminal on the right */}
              {Array.from({ length: params.cells }, (_, i) => {
                const x = cellsX0 + i * cellW;
                return (
                  <g key={`c${i}`} className="lab-cell">
                    <rect x={x + 4} y={TY - 16} width={cellW - 12} height={32} rx={5} />
                    <rect x={x + cellW - 8} y={TY - 7} width={5} height={14} rx={1} className="lab-cell-tip" />
                    <text x={x + cellW / 2 - 2} y={TY + 5} textAnchor="middle" className="lab-cell-label">1.5 V</text>
                    <text x={x + cellW - 14} y={TY - 20} textAnchor="middle" className="lab-tick">+</text>
                  </g>
                );
              })}
              <text x={(LX + RX) / 2} y={TY - 26} textAnchor="middle" className="lab-label">Battery {fmt(params.cells * CELL_V)} V</text>
              {/* switch on the right wire */}
              <g className="lab-switch" role="button" tabIndex={0} aria-pressed={params.closed} aria-label={`Switch, ${params.closed ? 'closed' : 'open'}. Press to ${params.closed ? 'open' : 'close'} it.`} onClick={toggleSwitch} onKeyDown={key(toggleSwitch)}>
                <rect x={RX - 34} y={SW_Y - 40} width={68} height={80} className="lab-switch-bg" rx={10} />
                <circle cx={RX} cy={SW_Y - 22} r={5} className="lab-wire-end" />
                <circle cx={RX} cy={SW_Y + 22} r={5} className="lab-wire-end" />
                <line x1={RX} y1={SW_Y + 22} x2={params.closed ? RX : RX + 24} y2={params.closed ? SW_Y - 22 : SW_Y - 14} className="lab-switch-lever" />
                <text x={RX - 42} y={SW_Y + 5} textAnchor="end" className="lab-label">switch {params.closed ? 'closed' : 'open'}</text>
              </g>
              {/* bulbs on the bottom wire */}
              {bulbXs.map((x, i) => (
                <g key={`b${i}`} className="lab-bulb">
                  {glow > 0 && Array.from({ length: 8 }, (_, k) => {
                    const ang = (k / 8) * Math.PI * 2, r1 = 26, r2 = 26 + 6 + glow * 16;
                    return <line key={k} x1={x + Math.cos(ang) * r1} y1={BY - 30 + Math.sin(ang) * r1} x2={x + Math.cos(ang) * r2} y2={BY - 30 + Math.sin(ang) * r2} className="lab-ray-glow" />;
                  })}
                  <circle cx={x} cy={BY - 30} r={22} className="lab-bulb-glass" />
                  <circle cx={x} cy={BY - 30} r={22} className="lab-bulb-light" style={{ opacity: glow }} />
                  <path d={`M${x - 8} ${BY - 26} q4 -12 8 0 q4 -12 8 0`} className="lab-filament" />
                  <rect x={x - 11} y={BY - 10} width={22} height={12} rx={3} className="lab-bulb-base" />
                  <text x={x} y={BY + 26} textAnchor="middle" className="lab-label">{word}</text>
                </g>
              ))}
              {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} className="lab-charge" />)}
              {chevrons.map(({ p: [x, y], f }) => {
                const ang = f < 0.25 ? 0 : f < 0.5 ? 90 : f < 0.75 ? 180 : 270;
                return <path key={f} d="M-6 -6 L4 0 L-6 6" transform={`translate(${x} ${y}) rotate(${ang})`} className="lab-chevron" />;
              })}
              <text x={300} y={(TY + BY) / 2 + 4} textAnchor="middle" className="lab-readout">{powered ? `I = ${fmt(I, 3)} A` : 'Press Play to switch on'}</text>
            </svg>
          </div>
          <Transport playing={playing} done={false} stepLabel="Step forward 0.5 seconds"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onStep={() => { setPlaying(false); setSim((s) => advanceCircuit(s, params, STEP_N)); }}
            onReset={() => { reset(); setAnnounce('Power off. Build and predict, then press Play.'); }} />
          <div className="row"><Toggle icon="table" pressed={showTable} onChange={setShowTable}>Table</Toggle></div>
          {showTable && (
            <ValuesTable caption="Circuit values" rows={[
              ['Cells', String(params.cells)], ['Bulbs', String(params.bulbs)], ['Switch', params.closed ? 'closed' : 'open'],
              ['Complete loop?', sol.complete ? 'yes' : 'no'], ['Power on (playing)?', powered ? 'yes' : 'no'],
              ['Voltage V', fmt(sol.voltage), 'V'], ['Total resistance R', fmt(sol.resistance), 'Ω'], ['Current I', powered ? fmt(sol.current, 3) : '— (press Play)', powered ? 'A' : undefined],
              ['Voltage across each bulb', powered ? fmt(sol.bulbVoltage, 3) : '—', powered ? 'V' : undefined], ['Power of each bulb', powered ? fmt(sol.bulbPower, 3) : '—', powered ? 'W' : undefined],
              ['Brightness', word],
            ]} />
          )}
        </div>
        <div className="lab-side">
          <section className="card flat stack" aria-label="Build the circuit">
            <h3>Build</h3>
            <div className="lab-parts">
              <span>Cells: <b>{params.cells}</b></span>
              <Button small icon="minus" disabled={lockedParts || params.cells <= 1} onClick={() => change({ cells: params.cells - 1 }, `${params.cells - 1} cells.`)} aria-label="Remove a cell">Remove</Button>
              <Button small icon="plus" disabled={lockedParts || params.cells >= MAX_CELLS} onClick={() => change({ cells: params.cells + 1 }, `${params.cells + 1} cells.`)} aria-label="Add a cell">Add</Button>
            </div>
            <div className="lab-parts">
              <span>Bulbs: <b>{params.bulbs}</b></span>
              <Button small icon="minus" disabled={lockedParts || params.bulbs <= 1} onClick={() => change({ bulbs: params.bulbs - 1 }, `${params.bulbs - 1} bulbs.`)} aria-label="Remove a bulb">Remove</Button>
              <Button small icon="plus" disabled={lockedParts || params.bulbs >= MAX_BULBS} onClick={() => change({ bulbs: params.bulbs + 1 }, `${params.bulbs + 1} bulbs.`)} aria-label="Add a bulb">Add</Button>
            </div>
            <Button aria-pressed={params.closed} onClick={toggleSwitch} icon={params.closed ? 'check' : 'x'}>Switch: {params.closed ? 'closed (on)' : 'open (off)'}</Button>
            <p className="muted" style={{ margin: 0 }}>Tip: tap a wire in the picture (or Tab to it and press Enter) to check it for breaks.</p>
          </section>
          {simple ? (
            <section className="card flat" aria-label="Open and closed circuits">
              <h3>Open or closed?</h3>
              <p><b>Closed circuit:</b> a complete loop with no gaps. Electricity flows all the way round and the bulbs light.</p>
              <p><b>Open circuit:</b> there is a gap — an open switch or a broken wire. Electricity stops and the bulbs go dark.</p>
            </section>
          ) : (
            <section className="card flat lab-formulas" aria-label="Formulas">
              <h3>Ohm’s law (series)</h3>
              <p>V = {params.cells} × {CELL_V} V = <b>{fmt(sol.voltage)} V</b></p>
              <p>R = {params.bulbs} × {BULB_R} Ω = <b>{fmt(sol.resistance)} Ω</b></p>
              <p>I = V ÷ R = {sol.complete ? <>{fmt(sol.voltage)} ÷ {fmt(sol.resistance)} = <b>{fmt(sol.current, 3)} A</b></> : <b>0 A (open circuit)</b>}</p>
              <p>P per bulb = I²R = <b>{fmt(sol.bulbPower, 3)} W</b></p>
            </section>
          )}
          <Prediction key={`${JSON.stringify(params)}:${runId}`} def={prediction(params, simple || !allowTyping)} phase={phase} typed={allowTyping && !simple} />
          <Challenges
            items={challenges.map((c) => ({ id: c.id, title: c.title, goal: simple && c.goalSimple ? c.goalSimple : c.goal, hint: c.hint, question: c.question, met: c.id === active && met }))}
            active={active} completed={completed} typed={allowTyping && !simple}
            onStart={(id) => {
              const nextFault = id === 'fault' ? faultIndex + 1 : faultIndex;
              if (id === 'fault') setFaultIndex(nextFault);
              const c = circuitChallenges(nextFault).find((x) => x.id === id)!;
              setActive(id); setParams((p) => ({ ...p, ...c.setup })); reset();
            }}
            onExit={() => setActive(null)}
            onAnswer={(id, raw, correct, hints) => { record(id, correct, { answer: raw }, hints); if (correct) void complete(id, challenges.find((c) => c.id === id)!.title, 'answer'); }}
          />
        </div>
      </div>
      <Announce text={announce} />
      <LabFooter sim="circuit" />
    </LabPage>
  );
}
