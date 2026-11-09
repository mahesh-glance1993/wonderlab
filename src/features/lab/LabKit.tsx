// UI building blocks shared by the four labs.
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Button, Feedback, NarrationControls, Page, ReportProblem } from '../../ui/kit';
import { Icon, type IconName } from '../../ui/Icon';
import { grade, type AnswerSpec } from '../../shared/grading';
import { fmt, snap, type Range } from './common';
import type { ChallengeQuestion } from './challenges';
import './lab.css';

export function LabPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Page title={title} back="/lab" wide fullscreen>
      <div className="lab">{children}</div>
    </Page>
  );
}

/** Introduction: what you'll explore, model assumptions, units. Open until first dismissed. */
export function Intro({ explore, assumptions, units, open, onToggle }: { explore: string; assumptions: string[]; units: [string, string][]; open: boolean; onToggle: (open: boolean) => void }) {
  const say = `${explore} ${assumptions.join(' ')}`;
  return (
    <details className="lab-intro card flat" open={open} onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)}>
      <summary><Icon name="info" /> <b>About this lab</b></summary>
      <div className="stack">
        <div className="row"><p style={{ margin: 0, flex: 1 }}>{explore}</p><NarrationControls text={say} /></div>
        <div>
          <b>How the model works</b>
          <ul>{assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <div>
          <b>Units used</b>
          <ul className="lab-units">{units.map(([q, u]) => <li key={q}>{q}: <b>{u}</b></li>)}</ul>
        </div>
      </div>
    </details>
  );
}

/** Slider + numeric input with units; both keyboard operable and always in sync. */
export function NumberSlider({ label, value, range, unit, onChange, disabled, note, display }: {
  label: string; value: number; range: Range; unit: string; onChange: (v: number) => void; disabled?: boolean; note?: string; display?: (v: number) => string;
}) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const n = Number(text.replace(/[−–]/g, '-'));
    if (Number.isFinite(n) && text.trim() !== '') onChange(snap(n, range));
    else setText(String(value));
  };
  const shown = display ? display(value) : `${fmt(value)} ${unit}`;
  return (
    <div className={`lab-slider ${disabled ? 'is-locked' : ''}`}>
      <label htmlFor={`${id}-r`}>{label} {disabled && <span className="pill"><Icon name="lock" />fixed</span>}</label>
      <div className="lab-slider-row">
        <input id={`${id}-r`} type="range" min={range.min} max={range.max} step={range.step} value={value} disabled={disabled}
          aria-valuetext={shown} aria-describedby={note ? `${id}-n` : undefined}
          onChange={(e) => onChange(snap(Number(e.target.value), range))} />
        <span className="lab-num">
          <input className="input" type="text" inputMode="decimal" aria-label={`${label} (${unit})`} value={text} disabled={disabled}
            onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); }} />
          <span className="lab-unit" aria-hidden="true">{unit}</span>
        </span>
      </div>
      {note && <span className="hint muted" id={`${id}-n`}>{note}</span>}
    </div>
  );
}

/** Play / Pause / Step / Reset. */
export function Transport({ playing, done, onPlay, onPause, onStep, onReset, stepLabel }: {
  playing: boolean; done: boolean; onPlay: () => void; onPause: () => void; onStep: () => void; onReset: () => void; stepLabel: string;
}) {
  return (
    <div className="lab-transport" role="group" aria-label="Simulation controls">
      {playing
        ? <Button icon="pause" onClick={onPause} variant="primary">Pause</Button>
        : <Button icon="play" onClick={onPlay} variant="primary" disabled={done} title={done ? 'Finished — press Reset to run again' : undefined}>Play</Button>}
      <Button icon="step" onClick={onStep} disabled={done} aria-label={stepLabel} title={stepLabel}>Step</Button>
      <Button icon="reset" onClick={onReset}>Reset</Button>
    </div>
  );
}

export function PresetBanner({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  return (
    <div className="alert info lab-banner" role="status">
      <Icon name="check" />
      <div style={{ flex: 1 }}><b>Checking your answer</b><div>{children}</div></div>
      <Button small variant="ghost" onClick={onDismiss}>Hide</Button>
    </div>
  );
}

export function Toggle({ pressed, onChange, icon, children }: { pressed: boolean; onChange: (v: boolean) => void; icon: IconName; children: ReactNode }) {
  return <Button small icon={icon} aria-pressed={pressed} onClick={() => onChange(!pressed)}>{children}</Button>;
}

/** Key values as a table (text alternative to the picture). */
export function ValuesTable({ caption, rows }: { caption: string; rows: [ReactNode, ReactNode, string?][] }) {
  return (
    <table className="data lab-table">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">Quantity</th><th scope="col">Value</th></tr></thead>
      <tbody>{rows.map(([k, v, u], i) => <tr key={i}><th scope="row">{k}</th><td>{v}{u ? ` ${u}` : ''}</td></tr>)}</tbody>
    </table>
  );
}

/** Answer input: choices for younger learners or when typing is off; typed (with units) otherwise. */
function AnswerInput({ q, typed, onSubmit, disabled }: { q: Pick<ChallengeQuestion, 'choices' | 'unit'> & { spec: AnswerSpec }; typed: boolean; onSubmit: (raw: string) => void; disabled?: boolean }) {
  const [val, setVal] = useState('');
  const id = useId();
  if (!typed || q.spec.kind === 'choice') {
    return (
      <div className="lab-choices" role="group" aria-label="Choose an answer">
        {q.choices.map((c) => <button type="button" key={c.value} className="btn" disabled={disabled} onClick={() => onSubmit(c.value)}>{c.label}</button>)}
      </div>
    );
  }
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); if (val.trim()) onSubmit(val); }}>
      <label htmlFor={id} className="sr-only">Your answer{q.unit ? ` in ${q.unit}` : ''}</label>
      <input id={id} className="input" style={{ flex: 1, minWidth: 120 }} value={val} disabled={disabled} onChange={(e) => setVal(e.target.value)} placeholder={q.unit ? `Number in ${q.unit}` : 'Your answer'} autoComplete="off" />
      <Button type="submit" variant="primary" disabled={disabled || !val.trim()}>Check</Button>
    </form>
  );
}

const checkAnswer = (spec: AnswerSpec, raw: string) => grade(spec, spec.kind === 'choice' ? { kind: 'choice', value: raw } : { kind: 'text', value: raw });

export interface PredictionDef {
  question: string;
  choices: { value: string; label: string }[];
  /** For numeric predictions (senior): typed answer graded with units. */
  spec: AnswerSpec;
  unit?: string;
  outcome: ReactNode; // explanation shown after the experiment
}

/** "What do you think will happen?" — answered before running, explained afterwards. */
export function Prediction({ def, phase, typed }: { def: PredictionDef; phase: 'before' | 'running' | 'after'; typed: boolean }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const label = (v: string) => def.choices.find((c) => c.value === v)?.label ?? `${v}`;
  const ok = answer != null ? checkAnswer(def.spec, answer).correct : false;
  return (
    <section className="lab-predict card flat" aria-label="Prediction">
      <h3><Icon name="sparkle" /> Predict</h3>
      <p><b>{def.question}</b></p>
      {phase === 'before' && answer == null && !skipped && (
        <>
          <AnswerInput q={{ choices: def.choices, unit: def.unit, spec: def.spec }} typed={typed} onSubmit={setAnswer} />
          <Button small variant="ghost" onClick={() => setSkipped(true)}>Skip</Button>
        </>
      )}
      {answer != null && <p>Your prediction: <b>{label(answer)}{typed && def.unit && def.spec.kind !== 'choice' && !/[a-z°Ω]/i.test(answer) ? ` ${def.unit}` : ''}</b>{phase !== 'after' && ' — now press Play to test it.'}</p>}
      {answer == null && (skipped || phase !== 'before') && phase !== 'after' && <p className="muted">No prediction made. Press Play and watch closely.</p>}
      {phase === 'after' && (
        <div className="stack">
          {answer != null && <Feedback ok={ok}>{ok ? 'Your prediction was right!' : 'Not quite what happened — see why below.'}</Feedback>}
          <div className="lab-explain"><b>What happened and why</b><div>{def.outcome}</div></div>
        </div>
      )}
    </section>
  );
}

export interface ChallengeView {
  id: string; title: string; goal: string; hint: string; question: ChallengeQuestion; met: boolean;
}

/** Guided challenges: pick one, try it in the sim (status shown as text), or answer the question. */
export function Challenges({ items, active, completed, onStart, onExit, onAnswer, typed }: {
  items: ChallengeView[]; active: string | null; completed: string[];
  onStart: (id: string) => void; onExit: () => void;
  onAnswer: (id: string, raw: string, correct: boolean, hintsUsed: number) => void; typed: boolean;
}) {
  const cur = items.find((c) => c.id === active) || null;
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; understood?: string } | null>(null);
  useEffect(() => { setHint(false); setResult(null); }, [active]);
  return (
    <section className="lab-challenge card flat" aria-label="Challenges">
      <h3><Icon name="trophy" /> Challenges</h3>
      {!cur && (
        <ul className="lab-challenge-list">
          {items.map((c) => (
            <li key={c.id}>
              <Button block onClick={() => onStart(c.id)} icon={completed.includes(c.id) ? 'check' : 'flag'}>
                {c.title}{completed.includes(c.id) ? ' (done)' : ''}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {cur && (
        <div className="stack">
          <p style={{ margin: 0 }}><b>{cur.title}.</b> {cur.goal}</p>
          <p className={`lab-status ${cur.met ? 'good' : ''}`} role="status" aria-live="polite">
            <Icon name={cur.met ? 'check' : 'clock'} /> {cur.met ? 'Goal reached — well done!' : completed.includes(cur.id) ? 'Already completed. Try again for practice.' : 'Goal not reached yet.'}
          </p>
          {hint ? <p className="alert warn" style={{ margin: 0 }}><Icon name="bulb" />{cur.hint}</p> : <Button small variant="ghost" icon="bulb" onClick={() => setHint(true)}>Show a hint</Button>}
          <div className="lab-question">
            <p style={{ margin: '0 0 6px' }}><b>Or answer this:</b> {cur.question.text}</p>
            <AnswerInput key={cur.id} q={cur.question} typed={typed} onSubmit={(raw) => {
              const g = checkAnswer(cur.question.spec, raw);
              setResult({ ok: g.correct, understood: g.understood });
              onAnswer(cur.id, raw, g.correct, hint ? 1 : 0);
            }} />
            {result && (
              <div style={{ marginTop: 8 }}>
                <Feedback ok={result.ok}>{result.ok ? <span>Correct! {cur.question.explain}</span> : <span>Not quite{result.understood ? ` (we read “${result.understood}”)` : ''}. Try again or use the simulation to check.</span>}</Feedback>
              </div>
            )}
          </div>
          <Button small onClick={onExit} icon="back">All challenges</Button>
        </div>
      )}
    </section>
  );
}

export function LabFooter({ sim }: { sim: string }) {
  return <div className="row lab-footer"><ReportProblem lessonId={`lab:${sim}`} /></div>;
}

/** Visually hidden live region for key moments (run finished, goal reached) — never every frame. */
export function Announce({ text }: { text: string }) {
  return <p className="sr-only" aria-live="polite" role="status">{text}</p>;
}
