// One question in Learn ("your turn") or Practice: prompt + narration, optional intermediate steps,
// progressive hints (one at a time), deterministic checking, targeted feedback and worked solution.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Localized, Question } from '../../shared/content';
import { grade, type Response } from '../../shared/grading';
import type { Tier } from '../../shared/levels';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Feedback, NarrationControls } from '../../ui/kit';
import { formatAnswer, formatResponse, inputKindFor, isEmptyResponse, matchMistake, unitChips, type QState } from './logic';
import { AnswerInput, CountObjects, TypedInput, effectiveResponse } from './inputs';
import { Visual } from './Visual';
import { useS } from './strings';

export function QuestionPrompt({ q, autoRead, compact }: { q: Question; autoRead: boolean; compact?: boolean }) {
  const L = useL();
  const { speak, presentation } = useApp();
  const say = q.say ?? q.prompt;
  // spoken items are always read aloud for young learners (early / primary tiers)
  const read = autoRead || (!compact && q.type === 'spoken' && (presentation?.tier === 'early' || presentation?.tier === 'primary'));
  useEffect(() => {
    if (read) speak(say.en, { te: say.te });
  }, [q.id, read]); // eslint-disable-line react-hooks/exhaustive-deps
  const kind = inputKindFor(q);
  const v = q.visual;
  return (
    <div className="lq-prompt">
      <div className="lq-prompt-row">
        <h2 className={`lq-q ${compact ? 'sm' : ''}`}>{L(q.prompt)}</h2>
        <NarrationControls text={say.en} te={say.te} />
      </div>
      {q.unitHint && <p className="muted lq-unithint"><Icon name="info" /> {q.unitHint}</p>}
      {v && !(kind === 'count' && v.kind === 'objects') && (
        q.type === 'count' && v.kind === 'objects' && !compact
          ? <CountObjects key={q.id} spec={v} />
          : <div className="lq-visual"><Visual spec={v} size={compact ? 'sm' : 'md'} animate={!compact} /></div>
      )}
    </div>
  );
}

export function Solution({ q }: { q: Question }) {
  const L = useL();
  const s = useS();
  if (!q.solution.length) return null;
  return (
    <div className="lq-solution">
      <h3><Icon name="book" /> {s('howToSolve')}</h3>
      <ol>{q.solution.map((st, i) => <li key={i}>{L(st)}</li>)}</ol>
    </div>
  );
}

function Steps({ q, st, set, tier }: { q: Question; st: QState; set: (fn: (s: QState) => QState) => void; tier: Tier }) {
  const L = useL();
  const s = useS();
  const { t } = useApp();
  const steps = q.steps ?? [];
  const [wrong, setWrong] = useState<Record<number, number>>({});
  const active = steps.findIndex((_, i) => !st.steps.ok[i]);
  const setVal = (i: number, v: string) => set((x) => { const values = [...x.steps.values]; values[i] = v; return { ...x, steps: { ...x.steps, values } }; });
  const markOk = (i: number, value?: string) => set((x) => {
    const ok = [...x.steps.ok]; ok[i] = true;
    const values = [...x.steps.values]; if (value !== undefined) values[i] = value;
    return { ...x, steps: { values, ok } };
  });
  const check = (i: number) => {
    const r: Response = { kind: 'text', value: st.steps.values[i] ?? '' };
    if (!r.value.trim()) return;
    if (grade(steps[i].answer, r).correct) markOk(i);
    else setWrong((w) => ({ ...w, [i]: (w[i] ?? 0) + 1 }));
  };
  return (
    <div className="lq-steps">
      <h3>{s('steps')}</h3>
      <ol>
        {steps.map((stp, i) => {
          if (active !== -1 && i > active) return null;
          const ok = !!st.steps.ok[i];
          return (
            <li key={i} className={`lq-step ${ok ? 'done' : ''}`}>
              <p className="lq-step-q"><b>{s('stepN', { n: i + 1 })}.</b> {L(stp.prompt)}</p>
              {ok
                ? <p className="lq-step-ok"><Icon name="check" /> {st.steps.values[i]} <span className="sr-only">{s('right')}</span></p>
                : <>
                  <TypedInput compact value={st.steps.values[i] ?? ''} onChange={(v) => setVal(i, v)} tier={tier} units={unitChips({ ...q, answer: stp.answer })} onSubmit={() => check(i)} label={L(stp.prompt)} />
                  <div className="row">
                    <Button small icon="check" onClick={() => check(i)} disabled={!(st.steps.values[i] ?? '').trim()}>{s('checkStep')}</Button>
                    {(wrong[i] ?? 0) > 0 && <Button small variant="ghost" icon="eye" onClick={() => markOk(i, formatAnswer(q, stp.answer))}>{s('showMe')}</Button>}
                  </div>
                  {(wrong[i] ?? 0) > 0 && <div className="feedback bad" role="status" aria-live="polite"><Icon name="info" />{t('notQuite')} — {s('stepWrong')}</div>}
                </>}
            </li>
          );
        })}
      </ol>
      {active !== -1 && (
        <Button small variant="ghost" onClick={() => set((x) => ({ ...x, steps: { values: steps.map((stp, i) => x.steps.ok[i] ? x.steps.values[i] ?? '' : formatAnswer(q, stp.answer)), ok: steps.map(() => true) } }))}>{s('skipSteps')}</Button>
      )}
    </div>
  );
}

export interface PanelProps {
  q: Question;
  st: QState;
  set: (fn: (s: QState) => QState) => void;
  tier: Tier;
  autoRead: boolean;
  onAnswered: (q: Question, correct: boolean, response: Response | null, hints: number) => void;
  /** buttons shown after the answer has been checked */
  after?: ReactNode;
}

export function QuestionPanel({ q, st, set, tier, autoRead, onAnswered, after }: PanelProps) {
  const L = useL();
  const s = useS();
  const { t, speak } = useApp();
  const resultRef = useRef<HTMLDivElement>(null);
  const justChecked = useRef(false);
  useEffect(() => { if (st.checked && justChecked.current) { justChecked.current = false; resultRef.current?.focus(); } }, [st.checked]);

  const stepsOn = !!q.steps?.length && tier !== 'early' && !st.checked;
  const stepsDone = !q.steps?.length || (q.steps ?? []).every((_, i) => st.steps.ok[i]);
  const showFinal = !stepsOn || stepsDone;
  const resp = effectiveResponse(q, st.draft);
  const result = st.checked ? grade(q.answer, resp) : null;
  const mistake: Localized | null = result && !result.correct ? matchMistake(q, result, resp) : null;

  const check = () => {
    if (st.checked || isEmptyResponse(resp)) return;
    const r = grade(q.answer, resp);
    justChecked.current = true;
    set((x) => ({ ...x, checked: true, draft: resp }));
    onAnswered(q, r.correct, resp, st.hints);
    if (autoRead) speak(r.correct ? t('correct') : t('notQuite'));
  };

  return (
    <article className="card lq-card" aria-labelledby={`q-${q.id}`}>
      <div id={`q-${q.id}`}><QuestionPrompt q={q} autoRead={autoRead} /></div>

      {q.steps?.length && tier !== 'early' && !st.checked ? <Steps q={q} st={st} set={set} tier={tier} /> : null}

      {showFinal && (
        <div className="lq-answer">
          {stepsOn && <h3>{s('finalAnswer')}</h3>}
          <AnswerInput key={q.id} q={q} value={st.draft} tier={tier} locked={st.checked} reveal={st.checked}
            onChange={(r) => set((x) => ({ ...x, draft: r }))} onSubmit={check} />
        </div>
      )}

      {q.hints.length > 0 && (
        <div className="lq-hints" aria-live="polite">
          {q.hints.slice(0, st.hints).map((h, i) => (
            <div key={i} className="alert info lq-hint"><Icon name="bulb" /><span><b>{s('hintN', { n: i + 1 })}:</b> {L(h)}</span></div>
          ))}
        </div>
      )}

      {!st.checked && (
        <div className="lq-actions">
          {q.hints.length > 0 && (st.hints < q.hints.length
            ? <Button icon="bulb" onClick={() => { const h = q.hints[st.hints]; set((x) => ({ ...x, hints: x.hints + 1 })); if (autoRead) speak(h.en, { te: h.te }); }}>{s('hintOf', { i: st.hints + 1, n: q.hints.length })}</Button>
            : <span className="muted">{s('noHints')}</span>)}
          {showFinal && <Button variant="primary" icon="check" onClick={check} disabled={isEmptyResponse(resp)}>{t('check')}</Button>}
        </div>
      )}

      {st.checked && result && (
        <div className="lq-result" ref={resultRef} tabIndex={-1}>
          <Feedback ok={result.correct}>
            <span className="stack" style={{ gap: 4 }}>
              <b>{result.correct ? (st.hints ? t('correct') : t('greatJob')) : t('notQuite')}</b>
              {mistake && <span>{L(mistake)}</span>}
              {!result.correct && result.understood && result.reason !== 'wrong' && inputKindFor(q) === 'typed' && <span>{s('weRead', { v: result.understood })}</span>}
            </span>
          </Feedback>
          {!result.correct && (
            <dl className="lq-compare">
              <div><dt>{s('yourAnswer')}</dt><dd>{formatResponse(q, resp) || s('noAnswer')}</dd></div>
              <div><dt>{s('correctAnswer')}</dt><dd>{formatAnswer(q)}</dd></div>
            </dl>
          )}
          <Solution q={q} />
          {after && <div className="lq-actions">{after}</div>}
        </div>
      )}
    </article>
  );
}
