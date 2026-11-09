import { type FormEvent } from 'react';
import {
  generateCircuits, simulate, circuitGoalMet, forceAnswer, netForce, mirrorAnswer, reflectDir, unitLabel,
  type CircuitsRound, type CircuitRound, type ForceRound, type MirrorRound, type NumericRound, type Comp,
} from '../gen/circuits';
import { grade } from '../../../shared/grading';
import { L } from '../gen/common';
import type { GameModule, ViewProps } from '../Shell';
import { Button } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';

interface CP { closed: string[]; choice: string | null; text: string }
type VP<R> = ViewProps<R, CP> & { round: R };

// ---------- circuit ----------
function SwitchGlyph({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 60 30" width="60" height="30" aria-hidden="true">
      <circle cx="8" cy="20" r="4" fill="currentColor" /><circle cx="52" cy="20" r="4" fill="currentColor" />
      <line x1="8" y1="20" x2={closed ? 52 : 46} y2={closed ? 20 : 2} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
function BulbGlyph({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 40 50" width="34" height="42" aria-hidden="true" className={on ? 'gm-bulb-on' : ''}>
      {on && <g stroke="#E8A93C" strokeWidth="3" strokeLinecap="round"><path d="M20 1v5M4 8l4 4M36 8l-4 4" /></g>}
      <circle cx="20" cy="22" r="13" fill={on ? '#F6D365' : 'var(--surface-2)'} stroke="currentColor" strokeWidth="3" />
      <path d="M14 34h12v8H14z" fill="var(--surface)" stroke="currentColor" strokeWidth="3" />
      <path d="M15 22l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CircuitView({ round, progress, setProgress, solved, mistake, complete }: VP<CircuitRound>) {
  const closed = new Set(progress.closed);
  const sim = simulate(round, closed);
  const toggle = (id: string) => {
    if (solved) return;
    const next = new Set(closed);
    if (next.has(id)) next.delete(id); else next.add(id);
    setProgress({ ...progress, closed: [...next] });
  };
  const comp = (c: Comp) => c.type === 'switch'
    ? (
      <button key={c.id} type="button" className="btn gm-switch" aria-pressed={closed.has(c.id)} onClick={() => toggle(c.id)} disabled={solved}>
        <SwitchGlyph closed={closed.has(c.id)} /><span>{c.id} {closed.has(c.id) ? 'closed' : 'open'}</span>
      </button>
    ) : (
      <span key={c.id} className={`gm-bulb ${sim.lit.has(c.id) ? 'on' : ''}`} role="img" aria-label={`Bulb ${c.id} ${sim.lit.has(c.id) ? 'on' : 'off'}`}>
        <BulbGlyph on={sim.lit.has(c.id)} /><span aria-hidden="true">{c.id} {sim.lit.has(c.id) ? 'ON' : 'off'}</span>
        {round.targetOn.includes(c.id) && <Icon name="star" label="must light" />}
        {round.mustOff.includes(c.id) && <Icon name="eyeOff" label="must stay off" />}
      </span>
    );
  const check = () => {
    if (circuitGoalMet(round, closed)) complete(L(`The circuit works! Current flows through ${round.targetOn.join(' and ')}.`));
    else if (sim.short) mistake(L('Short circuit! A path with no bulb lets the current skip the bulbs — nothing lights. Open that switch.'));
    else {
      const dark = round.targetOn.filter((b) => !sim.lit.has(b));
      const wrongOn = round.mustOff.filter((b) => sim.lit.has(b));
      mistake(L(dark.length ? `${dark.join(', ')} ${dark.length > 1 ? 'are' : 'is'} still off — is there a complete loop through ${dark.length > 1 ? 'them' : 'it'}?` : `${wrongOn.join(', ')} should stay off.`));
    }
  };
  return (
    <div className="stack">
      <p className="gm-q">Light {round.targetOn.join(' and ')}{round.mustOff.length ? `, but keep ${round.mustOff.join(', ')} off` : ''}.</p>
      <div className="gm-circuit" aria-label="Circuit">
        <div className="gm-battery" role="img" aria-label="Battery"><span>+</span><b /><span>−</span></div>
        <div className="gm-wire-top">{round.main.map(comp)}</div>
        <div className="gm-branches">
          {round.branches.map((b, i) => <div key={i} className="gm-branch" aria-label={`Path ${i + 1}`}>{b.map(comp)}{!b.some((x) => x.type === 'bulb') && <small className="muted">plain wire</small>}</div>)}
        </div>
      </div>
      {sim.short && <div className="alert warn" role="status"><Icon name="alert" />Short circuit — current skips the bulbs!</div>}
      <div className="row"><Button icon="check" variant="primary" disabled={solved} onClick={check}>Check</Button></div>
    </div>
  );
}

// ---------- shared answer input ----------
function NumberAnswer({ unit, progress, setProgress, solved, onSubmit, unitOptional }: { unit: string; progress: CP; setProgress: VP<unknown>['setProgress']; solved: boolean; onSubmit: (t: string) => void; unitOptional?: boolean }) {
  const submit = (e: FormEvent) => { e.preventDefault(); if (progress.text.trim()) onSubmit(progress.text); };
  return (
    <form className="row gm-numans" onSubmit={submit}>
      <label className="field" style={{ flex: '1 1 220px' }}>
        <span>Your answer {unitOptional ? '' : `(with unit, e.g. "12 ${unitLabel(unit)}")`}</span>
        <input className="input" inputMode="decimal" autoComplete="off" value={progress.text} disabled={solved} onChange={(e) => setProgress({ ...progress, text: e.target.value })} />
      </label>
      <Button icon="check" variant="primary" type="submit" disabled={solved || !progress.text.trim()}>Check</Button>
    </form>
  );
}
const reasonText = (reason: string | undefined, unit: string) =>
  reason === 'missing-unit' ? `Add the unit (${unitLabel(unit)}).` : reason === 'wrong-unit' ? `That unit does not measure the right thing — the answer is in ${unitLabel(unit)} (or an equivalent unit).` : reason === 'unparsable' ? 'Type a number and a unit, like 4.5 N.' : 'The number is not right yet.';

// ---------- forces ----------
function ForceView({ round, progress, setProgress, solved, mistake, complete }: VP<ForceRound>) {
  const ans = forceAnswer(round);
  const net = netForce(round.forces);
  const left = round.forces.filter((f) => f.dir === 'L'), right = round.forces.filter((f) => f.dir === 'R');
  const label = (id: string) => {
    if (id === 'L') return '← Moves left'; if (id === 'R') return 'Moves right →'; if (id === 'none') return 'Stays still (balanced)';
    const [n, d] = id.split(':'); return d === 'none' ? '0 N (balanced)' : `${n} N to the ${d === 'L' ? 'left' : 'right'}`;
  };
  const choose = (id: string) => {
    if (solved) return;
    setProgress({ ...progress, choice: id });
    if (id === ans.choice) complete(L(`Right! Net force = ${Math.abs(net)} N ${net > 0 ? 'to the right' : net < 0 ? 'to the left' : '(balanced)'}.`));
    else mistake(L('Not quite. Add the forces on each side, then subtract the smaller total from the larger.'));
  };
  const typed = (t: string) => {
    const spec = { kind: 'number' as const, value: ans.value!, unit: ans.unit!, requireUnit: true, relTolerance: 0.01 };
    const g = grade(spec, { kind: 'text', value: t });
    if (g.correct) complete(L(round.ask === 'net' ? `Correct: net force = ${ans.value} N ${net > 0 ? 'to the right' : 'to the left'}.` : `Correct: a = F ÷ m = ${+ans.value!.toFixed(3)} m/s².`));
    else mistake(L(reasonText(g.reason, ans.unit!)));
  };
  const arrow = (n: number, dir: 'L' | 'R', i: number, lbl: string) => (
    <div key={`${dir}${i}`} className={`gm-force ${dir}`} style={{ ['--len' as string]: `${Math.min(160, 30 + n * (round.level >= 3 ? 1.2 : 6))}px` }}>
      <span className="gm-arrow" aria-hidden="true" /><small>{n} N {lbl}</small>
    </div>
  );
  return (
    <div className="stack">
      <div className="gm-forces" role="img" aria-label={`Box with forces: ${round.forces.map((f) => `${f.n} newtons ${f.dir === 'L' ? 'left' : 'right'}`).join(', ')}`}>
        <div className="gm-fside L">{left.map((f, i) => arrow(f.n, 'L', i, f.label))}</div>
        <div className="gm-box">{round.mass ? `${round.mass.value} ${round.mass.unit}` : 'box'}</div>
        <div className="gm-fside R">{right.map((f, i) => arrow(f.n, 'R', i, f.label))}</div>
      </div>
      <p className="gm-q">{round.ask === 'direction' ? 'Which way will the box move?' : round.ask === 'netChoice' ? 'What is the net force on the box?' : round.ask === 'net' ? 'What is the size of the net force? Include the unit.' : `The box has mass ${round.mass!.value} ${round.mass!.unit}. What is its acceleration? (a = F ÷ m, use kg)`}</p>
      {round.options ? (
        <div className="gm-options" role="group" aria-label="Choices">
          {round.options.map((o) => {
            const picked = progress.choice === o;
            return <button key={o} type="button" className={`choice ${picked ? (o === ans.choice ? 'is-right' : 'is-wrong') : ''}`} aria-pressed={picked} disabled={solved && !picked} onClick={() => choose(o)}>{label(o)}{picked && <Icon name={o === ans.choice ? 'check' : 'x'} />}</button>;
          })}
        </div>
      ) : <NumberAnswer unit={ans.unit!} progress={progress} setProgress={setProgress} solved={solved} onSubmit={typed} />}
    </div>
  );
}

// ---------- mirrors ----------
function MirrorDiagram({ round, mirror }: { round: MirrorRound; mirror: number | null }) {
  const cx = 160, cy = 120, R = 100;
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (deg: number, r: number) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
  const [tx, ty] = pt(round.target, R);
  const out = mirror === null ? null : reflectDir(round.inDir, mirror);
  const [ox, oy] = out === null ? [0, 0] : pt(out, R);
  const [m1x, m1y] = pt(mirror ?? 0, 34), [m2x, m2y] = pt((mirror ?? 0) + 180, 34);
  return (
    <svg viewBox="0 0 320 240" className="gm-mirror" role="img" aria-label={`Laser from the left. Target at ${round.target} degrees.${mirror !== null ? ` Mirror at ${mirror} degrees sends the ray to ${out} degrees.` : ''}`}>
      <rect x="4" y={cy - 12} width="30" height="24" rx="4" fill="var(--surface-2)" stroke="currentColor" strokeWidth="2" />
      <line x1="34" y1={cy} x2={cx} y2={cy} stroke="#D9695C" strokeWidth="4" />
      <g transform={`translate(${tx} ${ty})`}><circle r="14" fill="none" stroke="currentColor" strokeWidth="3" /><circle r="6" fill="currentColor" /></g>
      {mirror !== null && <>
        <line x1={m1x} y1={m1y} x2={m2x} y2={m2y} stroke="#5C8FC9" strokeWidth="6" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={ox} y2={oy} stroke="#D9695C" strokeWidth="4" strokeDasharray={out === round.target ? undefined : '8 6'} />
      </>}
      <text x={tx} y={ty + (ty > cy ? 32 : -22)} textAnchor="middle" className="gm-svg-label">target</text>
    </svg>
  );
}
function MirrorView({ round, progress, setProgress, solved, mistake, complete }: VP<MirrorRound>) {
  const ans = mirrorAnswer(round);
  if (round.ask === 'angle') {
    const typed = (t: string) => {
      const g = grade({ kind: 'number', value: ans, unit: '°', tolerance: 0.5 }, { kind: 'text', value: t });
      if (g.correct) complete(L(`Correct: the ray makes ${round.grazing}° with the mirror, so ${ans}° with the normal — angle of reflection = angle of incidence = ${ans}°.`));
      else mistake(L(g.reason === 'wrong-unit' ? 'Give the answer in degrees (°).' : 'Remember: angles of incidence and reflection are measured from the normal (the line at 90° to the mirror).'));
    };
    return (
      <div className="stack">
        <p className="gm-q">A light ray hits a flat mirror making an angle of <b>{round.grazing}°</b> with the mirror surface. What is the angle of reflection (measured from the normal)?</p>
        <NumberAnswer unit="°" unitOptional progress={progress} setProgress={setProgress} solved={solved} onSubmit={typed} />
      </div>
    );
  }
  const picked = progress.choice === null ? null : +progress.choice;
  const choose = (m: number) => {
    if (solved) return;
    setProgress({ ...progress, choice: String(m) });
    if (m === ans) complete(L(`Bullseye! A mirror at ${m}° turns the ray to the target.`));
    else mistake(L(`The ray went off to ${reflectDir(round.inDir, m)}° instead. Angle in = angle out — try another mirror.`));
  };
  return (
    <div className="stack">
      <MirrorDiagram round={round} mirror={picked} />
      <p className="gm-q">Which mirror angle sends the laser to the target?</p>
      <div className="gm-options" role="group" aria-label="Mirror angles">
        {round.options.map((m) => (
          <button key={m} type="button" className={`choice ${picked === m ? (m === ans ? 'is-right' : 'is-wrong') : ''}`} aria-pressed={picked === m} disabled={solved && picked !== m} onClick={() => choose(m)}>
            <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><line x1={20 - 16 * Math.cos((m * Math.PI) / 180)} y1={20 + 16 * Math.sin((m * Math.PI) / 180)} x2={20 + 16 * Math.cos((m * Math.PI) / 180)} y2={20 - 16 * Math.sin((m * Math.PI) / 180)} stroke="#5C8FC9" strokeWidth="5" strokeLinecap="round" /></svg>
            {m}°{picked === m && <Icon name={m === ans ? 'check' : 'x'} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- numeric ----------
const PROMPTS: Record<NumericRound['template'], (n: NumericRound) => string> = {
  'ohm-I': (n) => `A ${n.givens.V.value} V battery is connected across a ${n.givens.R.value} ${n.givens.R.unit} resistor. What current flows? Answer in ${unitLabel(n.unit)}.`,
  'ohm-V': (n) => `A current of ${n.givens.I.value} A flows through a ${n.givens.R.value} Ω resistor. What is the voltage across it?`,
  'ohm-R': (n) => `A ${n.givens.V.value} V supply drives ${n.givens.I.value} mA through a resistor. What is its resistance?`,
  power: (n) => `A heater runs on ${n.givens.V.value} V and draws ${n.givens.I.value} A. What is its power?`,
  series: (n) => `Three resistors of ${n.givens.R1.value} Ω, ${n.givens.R2.value} Ω and ${n.givens.R3.value} Ω are joined in series. What is the total resistance?`,
  speed: (n) => `A train covers ${n.givens.d.value} km in ${n.givens.t.value} min. What is its average speed in ${unitLabel(n.unit)}?`,
  fma: (n) => `A net force of ${n.givens.F.value} N acts on a ${n.givens.m.value} ${n.givens.m.unit} trolley. What is its acceleration?`,
};
function NumericView({ round, progress, setProgress, solved, mistake, complete }: VP<NumericRound>) {
  const typed = (t: string) => {
    const g = grade({ kind: 'number', value: round.value, unit: round.unit, requireUnit: true, relTolerance: 0.01 }, { kind: 'text', value: t });
    if (g.correct) complete(L(`Correct: ${round.formula} gives ${round.value} ${unitLabel(round.unit)}.`));
    else mistake(L(reasonText(g.reason, round.unit)));
  };
  return (
    <div className="stack">
      <p className="gm-q">{PROMPTS[round.template](round)}</p>
      <table className="data gm-givens"><caption className="sr-only">Given values</caption><tbody>
        {Object.entries(round.givens).map(([k, q]) => <tr key={k}><th scope="row">{k}</th><td>{q.value} {unitLabel(q.unit)}</td></tr>)}
      </tbody></table>
      <NumberAnswer unit={round.unit} progress={progress} setProgress={setProgress} solved={solved} onSubmit={typed} />
    </div>
  );
}

function View(p: ViewProps<CircuitsRound, CP>) {
  const r = p.round;
  if (r.kind === 'circuit') return <CircuitView {...p} round={r} />;
  if (r.kind === 'force') return <ForceView {...p} round={r} />;
  if (r.kind === 'mirror') return <MirrorView {...p} round={r} />;
  return <NumericView {...p} round={r} />;
}

export const circuitsModule: GameModule<CircuitsRound, CP> = {
  id: 'circuits',
  generate: generateCircuits,
  init: () => ({ closed: [], choice: null, text: '' }),
  instructions: (r) => L(
    r.kind === 'circuit' ? 'Tap switches to open or close them. Current flows only around a complete loop from the battery and back. Then press Check.'
      : r.kind === 'force' ? 'Forces push the box left and right. Combine them to find the net force.'
      : r.kind === 'mirror' ? (r.ask === 'choice' ? 'Aim the mirror so the laser bounces into the target. The angle in equals the angle out.' : 'Use the law of reflection to find the angle.')
      : 'Solve the problem. Write the number and its unit — equivalent units (like mA instead of A) are accepted.',
  ),
  hints: (r) => {
    if (r.kind === 'circuit') return [L('A bulb lights only if there is a closed path from + through the bulb back to −.'), L(`Close ${r.solution.join(', ')}; keep the others open.`)];
    if (r.kind === 'force') return [L('Forces in the same direction add; opposite forces subtract.'), ...(r.ask === 'accel' ? [L('Change grams to kilograms first (1000 g = 1 kg), then a = F ÷ m.')] : [L(`Right total: ${r.forces.filter((f) => f.dir === 'R').reduce((s, f) => s + f.n, 0)} N; left total: ${r.forces.filter((f) => f.dir === 'L').reduce((s, f) => s + f.n, 0)} N.`)])];
    if (r.kind === 'mirror') return r.ask === 'choice' ? [L('The mirror must sit exactly halfway between the incoming ray and the way you want it to go.'), L(`The target is at ${r.target}°. Halfway between 0° and ${r.target}° is ${r.target / 2}°.`)] : [L('The normal is at 90° to the mirror. Angle to the normal = 90° − angle to the surface.')];
    return [L(`Use ${r.formula}.`), L('Convert to base units first: kΩ → Ω (×1000), mA → A (÷1000), g → kg (÷1000), min → s (×60), km → m (×1000).')];
  },
  View,
};
