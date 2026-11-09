// Learn mode: short introduction blocks → worked examples revealed step by step (with replay)
// → one independent attempt → review.
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Block, Objective, WorkedExample } from '../../shared/content';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Meter, NarrationControls } from '../../ui/kit';
import { activityLabel, activityPath, learnStages, type LessonState } from './logic';
import { Visual } from './Visual';
import { useS } from './strings';

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
    if (b.type === 'text' || b.type === 'tip') { en.push(b.text.en); te.push(b.text.te ?? b.text.en); }
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
          case 'formula': return <div key={i} className="lq-formula" role="img" aria-label={b.say ?? b.tex}><span aria-hidden="true">{b.tex}</span></div>;
          case 'visual': return <div key={i} className="lq-visual"><Visual spec={b.visual} alt={L(b.alt)} /></div>;
          case 'steps': return <ol key={i} className="lq-blocksteps">{b.steps.map((x, j) => <li key={j}>{L(x)}</li>)}</ol>;
          case 'tip': return <div key={i} className="alert info"><Icon name="bulb" /><span>{L(b.text)}</span></div>;
          case 'activity': return <div key={i}><ActivityButton id={b.activityId} label={b.label} /></div>;
        }
      })}
    </div>
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
