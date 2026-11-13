// Learn mode: short introduction blocks → worked examples revealed step by step (with replay)
// → one independent attempt → review.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Block, ExploreSpec, Objective, WorkedExample } from '../../shared/content';
import { evaluate, explainChange } from '../../shared/formula';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Meter, NarrationControls } from '../../ui/kit';
import { activityLabel, activityPath, learnStages, type LessonState } from './logic';
import { Visual } from './Visual';
import { useS } from './strings';
import { useNoteTarget } from './noteTarget';

// ---------------------------------------------------------------- linked activities

export function ActivityButton({ id, label }: { id: string; label?: { en: string; te?: string } }) {
  const nav = useNavigate();
  const L = useL();
  const path = activityPath(id);
  if (!path) return null;
  const icon = id.startsWith('lab') ? 'atom' : id.startsWith('art') ? 'palette' : 'puzzle';
  return <Button icon={icon} onClick={() => nav(path)}>{L(label ?? activityLabel(id))}</Button>;
}

export function ActivityLinks({ o }: { o: Objective }) {
  const s = useS();
  const seen = new Set<string>();
  const list: { id: string; label?: { en: string; te?: string } }[] = [];
  for (const b of o.intro) if (b.type === 'activity' && !seen.has(b.activityId)) { seen.add(b.activityId); list.push({ id: b.activityId, label: b.label }); }
  for (const id of o.activities ?? []) if (!seen.has(id)) { seen.add(id); list.push({ id }); }
  const shown = list.filter((a) => activityPath(a.id));
  if (!shown.length) return null;
  return (
    <section className="card flat stack lq-activities" aria-labelledby="act-h">
      <h3 id="act-h"><Icon name="sparkle" /> {s('linkedActivities')}</h3>
      <div className="row">{shown.map((a) => <ActivityButton key={a.id} id={a.id} label={a.label} />)}</div>
    </section>
  );
}

// ---------------------------------------------------------------- instruction blocks

const blockSpeech = (blocks: Block[]) => {
  const en: string[] = [], te: string[] = [];
  for (const b of blocks) {
    if (b.type === 'text' || b.type === 'tip' || b.type === 'heading' || b.type === 'remember') { en.push(b.text.en); te.push(b.text.te ?? b.text.en); }
    if (b.type === 'definition') { en.push(`${b.term.en}: ${b.text.en}`); te.push(`${b.term.te ?? b.term.en}: ${b.text.te ?? b.text.en}`); }
    if (b.type === 'keypoints') b.points.forEach((x) => { en.push(x.en); te.push(x.te ?? x.en); });
    if (b.type === 'formula') { en.push(b.say ?? b.tex); te.push(b.say ?? b.tex); }
    if (b.type === 'steps') b.steps.forEach((x) => { en.push(x.en); te.push(x.te ?? x.en); });
  }
  return { en: en.join(' '), te: te.join(' ') };
};

export function Blocks({ blocks, autoRead }: { blocks: Block[]; autoRead: boolean }) {
  const L = useL();
  const { speak } = useApp();
  const say = blockSpeech(blocks);
  useEffect(() => { if (autoRead && say.en) speak(say.en, { te: say.te }); }, [autoRead]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="lq-blocks">
      {say.en && <div className="lq-narr"><NarrationControls text={say.en} te={say.te} /></div>}
      {blocks.map((b, i): ReactNode => {
        switch (b.type) {
          case 'text': return <p key={i} className="lq-text">{L(b.text)}</p>;
          case 'formula': return (
            <div key={i} className="lq-formula-wrap">
              <div className="lq-formula" role="img" aria-label={b.say ?? b.tex}><span aria-hidden="true">{b.tex}</span></div>
              <SaveToNotes text={`Formula: ${b.tex}`} />
            </div>
          );
          case 'visual': return <div key={i} className="lq-visual"><Visual spec={b.visual} alt={L(b.alt)} /></div>;
          case 'steps': return <ol key={i} className="lq-blocksteps">{b.steps.map((x, j) => <li key={j}>{L(x)}</li>)}</ol>;
          case 'tip': return <div key={i} className="alert info"><Icon name="bulb" /><span>{L(b.text)}</span></div>;
          case 'activity': return <div key={i}><ActivityButton id={b.activityId} label={b.label} /></div>;
          case 'heading': return <h3 key={i} className="lq-heading">{L(b.text)}</h3>;
          case 'definition': return (
            <div key={i} className="lq-def">
              <b className="lq-def-term">{L(b.term)}</b>
              <p className="lq-text">{L(b.text)}</p>
              <SaveToNotes text={`${L(b.term)}: ${L(b.text)}`} />
            </div>
          );
          case 'keypoints': return (
            <div key={i} className="lq-keybox">
              <b>Key points</b>
              <ul className="lq-keypoints">{b.points.map((x, j) => <li key={j}>{L(x)}</li>)}</ul>
              <SaveToNotes text={b.points.map((x) => L(x)).join('\n• ')} />
            </div>
          );
          case 'remember': return (
            <div key={i} className="alert warn lq-remember"><Icon name="star" />
              <div className="lq-remember-body"><span><b>Remember:</b> {L(b.text)}</span><SaveToNotes text={`Remember: ${L(b.text)}`} /></div>
            </div>
          );
          case 'photo': return <figure key={i} className="lq-photo"><span className="lq-photo-pic" aria-hidden="true">{b.picture}</span><figcaption>{L(b.caption)}</figcaption></figure>;
          case 'explore': return <Explorer key={i} spec={b.explore} />;
        }
      })}
    </div>
  );
}

/** "Save to notes": adds a line to this chapter's note (only inside a lesson, not for pre-primary). */
function SaveToNotes({ text }: { text: string }) {
  const save = useNoteTarget();
  if (!save || !text.trim()) return null;
  return <Button small variant="ghost" icon="note" className="save-note" onClick={() => save(text)}>Save to notes</Button>;
}

// ---------------------------------------------------------------- "what if?" formula explorer

const fmt = (x: number, d: number) => (isFinite(x) ? String(+x.toFixed(d)) : '—');
const safeEval = (expr: string, vals: Record<string, number>) => { try { return evaluate(expr, vals); } catch { return NaN; } };

function Explorer({ spec }: { spec: ExploreSpec }) {
  const L = useL();
  const save = useNoteTarget();
  const init = useMemo(() => Object.fromEntries(spec.vars.map((v) => [v.sym, v.value])), [spec]);
  const [vals, setVals] = useState<Record<string, number>>(init);
  const [why, setWhy] = useState('');
  const [showMistakes, setShowMistakes] = useState(false);
  const decimals = spec.result.decimals ?? 2;
  const result = safeEval(spec.result.expr, vals);
  // result range across the sliders (for the gauge), like the apps
  const range = useMemo(() => {
    const pts: number[] = [];
    for (const v of spec.vars) for (const x of [v.min, v.max]) pts.push(safeEval(spec.result.expr, { ...init, [v.sym]: x }));
    const ok = pts.filter((x) => isFinite(x));
    return ok.length ? [Math.min(...ok), Math.max(...ok)] as const : [0, 1] as const;
  }, [spec, init]);
  const frac = isFinite(result) && range[1] > range[0] ? Math.min(1, Math.max(0.03, (result - range[0]) / (range[1] - range[0]))) : 0.5;
  const set = (sym: string, x: number) => {
    const next = { ...vals, [sym]: x };
    try { setWhy(explainChange(spec, sym, vals, next, L)); } catch { setWhy(''); }
    setVals(next);
  };
  const unit = spec.result.unit ? ` ${spec.result.unit}` : '';
  const title = L(spec.title) || 'What if?';
  return (
    <section className="card flat lq-explore" aria-label={title}>
      <div className="lq-explore-head">
        <span className="lq-explore-pic" aria-hidden="true">🧪</span>
        <div>
          <h3>{title}</h3>
          <p className="muted small">Move the sliders and watch what happens.</p>
        </div>
      </div>
      <div className="lq-formula"><span>{spec.formula}</span></div>
      {spec.vars.map((v) => {
        const id = `ex-${spec.result.sym}-${v.sym}`;
        const valueText = `${fmt(vals[v.sym], 3)}${v.unit ? ` ${v.unit}` : ''}`;
        return (
          <div key={v.sym} className="lq-explore-var">
            <label htmlFor={id} className="lq-explore-label"><span><b>{v.sym}</b> · {L(v.name)}</span><b className="lq-explore-val">{valueText}</b></label>
            <input id={id} type="range" min={v.min} max={v.max} step={v.step} value={vals[v.sym]} aria-valuetext={valueText} onChange={(e) => set(v.sym, Number(e.target.value))} />
          </div>
        );
      })}
      <div className="lq-explore-result" role="status" aria-live="polite">
        <b>{L(spec.result.name)} ({spec.result.sym}) = {fmt(result, decimals)}{unit}</b>
        <div className="lq-gauge" aria-hidden="true"><i style={{ width: `${Math.round(frac * 100)}%` }} /></div>
      </div>
      {why && <div className="lq-explore-why" aria-live="polite"><span aria-hidden="true">💡</span><p>{why}</p></div>}
      {spec.realWorld && <p className="muted lq-text"><b>In real life:</b> {L(spec.realWorld)}</p>}
      {!!spec.mistakes?.length && (
        <div className="stack-sm">
          <Button small aria-expanded={showMistakes} onClick={() => setShowMistakes(!showMistakes)} className="save-note">
            {showMistakes ? 'Hide common mistakes' : `Common mistakes (${spec.mistakes.length})`}
          </Button>
          {showMistakes && (
            <ul className="lq-mistakes">
              {spec.mistakes.map((m, j) => <li key={j}><b><span aria-hidden="true">✗ </span>{L(m.wrong)}</b><span>{L(m.why)}</span></li>)}
            </ul>
          )}
        </div>
      )}
      <div className="row">
        <Button small icon="reset" onClick={() => { setVals(init); setWhy(''); }}>Reset</Button>
        {save && <Button small variant="ghost" icon="note" onClick={() => save(`${title}: ${spec.formula}${spec.realWorld ? ` — ${L(spec.realWorld)}` : ''}`)}>Save to notes</Button>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- worked example

function Example({ ex, n, revealed, setRevealed, autoRead }: { ex: WorkedExample; n: number; revealed: number; setRevealed: (r: number) => void; autoRead: boolean }) {
  const L = useL();
  const s = useS();
  const { speak } = useApp();
  const [replayKey, setReplayKey] = useState(0);
  const total = ex.steps.length;
  const shown = Math.min(revealed, total);
  const done = shown >= total;
  useEffect(() => { if (autoRead) speak(ex.problem.en, { te: ex.problem.te }); }, [ex.id, autoRead]); // eslint-disable-line react-hooks/exhaustive-deps
  const reveal = () => {
    const next = shown + 1;
    setRevealed(next);
    const st = ex.steps[next - 1];
    if (autoRead && st) speak(st.en, { te: st.te });
    else if (autoRead && next > total) speak(ex.answer.en, { te: ex.answer.te });
  };
  return (
    <section className="card stack lq-card" aria-labelledby={`ex-${ex.id}`}>
      <h2 id={`ex-${ex.id}`}>{s('example', { n })}</h2>
      <div className="lq-prompt-row">
        <p className="lq-q">{L(ex.problem)}</p>
        <NarrationControls text={[ex.problem.en, ...ex.steps.slice(0, shown).map((x) => x.en)].join(' ')} te={[ex.problem.te ?? ex.problem.en, ...ex.steps.slice(0, shown).map((x) => x.te ?? x.en)].join(' ')} />
      </div>
      {ex.visual && <div className="lq-visual"><Visual key={replayKey} spec={ex.visual} /></div>}
      <ol className="lq-exsteps" aria-live="polite">
        {ex.steps.slice(0, shown).map((st, i) => <li key={`${replayKey}-${i}`} className="lq-reveal">{L(st)}</li>)}
      </ol>
      {done && <div className="alert good lq-reveal" role="status"><Icon name="check" /><span><b>{s('answerIs')}:</b> {L(ex.answer)}</span></div>}
      <div className="row">
        {!done && <Button variant="primary" icon="step" onClick={reveal}>{s('nextStep')} ({shown + 1}/{total})</Button>}
        {shown > 0 && <Button icon="reset" onClick={() => { setRevealed(0); setReplayKey((k) => k + 1); }}>{s('replay')}</Button>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- learn mode

export interface LearnModeProps {
  o: Objective;
  learn: LessonState['learn'];
  setLearn: (fn: (l: LessonState['learn']) => LessonState['learn']) => void;
  autoRead: boolean;
  /** "your turn" question panel (already wired to the lesson state) */
  tryPanel: ReactNode;
  tryChecked: boolean;
  tryCorrect: boolean | null;
  goMode: (m: 'practice' | 'test') => void;
}

export function LearnMode({ o, learn, setLearn, autoRead, tryPanel, tryChecked, tryCorrect, goMode }: LearnModeProps) {
  const L = useL();
  const s = useS();
  const { t } = useApp();
  const stages = learnStages(o);
  const i = Math.max(0, Math.min(stages.length - 1, learn.step));
  const stage = stages[i];
  const go = (n: number) => { setLearn((l) => ({ ...l, step: Math.max(0, Math.min(stages.length - 1, n)), revealed: 0 })); document.getElementById('main')?.scrollTo?.(0, 0); window.scrollTo?.(0, 0); };
  const recap = o.intro.filter((b) => b.type === 'formula' || b.type === 'tip');

  return (
    <div className="stack">
      <div className="lq-progress">
        <span className="muted">{s('stepOf', { i: i + 1, n: stages.length })}</span>
        <Meter value={(i + 1) / stages.length} label={s('stepOf', { i: i + 1, n: stages.length })} />
      </div>

      {stage.kind === 'intro' && (
        <section className="card stack lq-card" aria-labelledby="intro-h">
          <h2 id="intro-h">{s('intro')}</h2>
          <Blocks blocks={o.intro} autoRead={autoRead} />
        </section>
      )}

      {stage.kind === 'example' && (
        <Example key={o.examples[stage.index].id} ex={o.examples[stage.index]} n={stage.index + 1} revealed={learn.revealed} autoRead={autoRead}
          setRevealed={(r) => setLearn((l) => ({ ...l, revealed: r }))} />
      )}

      {stage.kind === 'try' && (
        <>
          <div className="alert info"><Icon name="hand" /><span><b>{s('yourTurn')}.</b> {s('yourTurnBody')}</span></div>
          {tryPanel}
        </>
      )}

      {stage.kind === 'review' && (
        <section className="card stack lq-card" aria-labelledby="recap-h">
          <h2 id="recap-h"><Icon name="star" /> {s('recap')}</h2>
          <p className="lq-q">{L(o.title)}</p>
          {recap.length > 0 && <Blocks blocks={recap} autoRead={false} />}
          {tryCorrect !== null && (
            <p className={`lq-verdict ${tryCorrect ? 'ok' : 'no'}`}><Icon name={tryCorrect ? 'check' : 'info'} /> {s('yourTurn')}: {tryCorrect ? t('wellDone') : t('notQuite')}</p>
          )}
          <div className="row">
            <Button variant="primary" icon="bulb" onClick={() => goMode('practice')}>{s('goPractice')}</Button>
            <Button icon="trophy" onClick={() => goMode('test')}>{s('goTest')}</Button>
            <Button icon="reset" variant="ghost" onClick={() => go(0)}>{s('goLearn')}</Button>
          </div>
        </section>
      )}

      <div className="lq-actions">
        {i > 0 && <Button icon="prev" onClick={() => go(i - 1)}>{t('back')}</Button>}
        {i < stages.length - 1 && (stage.kind !== 'try' || tryChecked) && (
          <Button variant={stage.kind === 'try' || stage.kind === 'intro' || (stage.kind === 'example' && learn.revealed >= o.examples[stage.index].steps.length) ? 'primary' : undefined} icon="next" onClick={() => go(i + 1)}>{s('continue')}</Button>
        )}
        {stage.kind === 'try' && !tryChecked && <Button variant="ghost" onClick={() => go(i + 1)}>{t('next')}</Button>}
      </div>
    </div>
  );
}
