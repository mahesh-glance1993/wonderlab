// Test mode: a fixed set of questions, no hints or feedback until submission, then a review screen
// with each answer, the correct answer and the worked solution.
import { useEffect, useRef, useState } from 'react';
import type { Question } from '../../shared/content';
import { grade, newSeed, type Response } from '../../shared/grading';
import type { Tier } from '../../shared/levels';
import { useApp } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Meter } from '../../ui/kit';
import { buildTestSet, formatAnswer, formatResponse, isEmptyResponse, type Candidate, type TestState } from './logic';
import { AnswerInput, effectiveResponse } from './inputs';
import { QuestionPrompt, Solution } from './QuestionPanel';
import { useS } from './strings';

export interface TestModeProps {
  cands: Candidate[];
  test: TestState | null;
  setTest: (fn: (t: TestState | null) => TestState | null) => void;
  resolve: (qid: string) => Question | null;
  tier: Tier;
  autoRead: boolean;
  record: (q: Question, correct: boolean, response: Response | null, hints: number, durationMs?: number) => Promise<void>;
  onPractice: () => void;
}

export function TestMode({ cands, test, setTest, resolve, tier, autoRead, record, onPractice }: TestModeProps) {
  const s = useS();
  const { t } = useApp();
  const [confirm, setConfirm] = useState(false);
  const times = useRef<Record<string, number>>({});
  const enteredAt = useRef<{ id: string; at: number } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const start = () => {
    const seed = newSeed();
    const ids = buildTestSet(cands, seed, { accept: (id) => !!resolve(id) });
    times.current = {};
    setTest(() => ({ seed, ids, index: 0, answers: {}, submitted: false, recorded: false }));
  };

  const curId = test && !test.submitted ? test.ids[test.index] : null;
  useEffect(() => {
    const now = Date.now();
    const prev = enteredAt.current;
    if (prev) times.current[prev.id] = (times.current[prev.id] ?? 0) + (now - prev.at);
    enteredAt.current = curId ? { id: curId, at: now } : null;
  }, [curId]);

  if (!test) {
    const n = buildTestSet(cands, 1, { accept: (id) => !!resolve(id) }).length;
    return (
      <section className="card stack lq-card" aria-labelledby="test-h">
        <h2 id="test-h"><Icon name="trophy" /> {t('test')}</h2>
        {n ? <>
          <p>{s('testIntro', { n })}</p>
          <div><Button variant="primary" icon="play" onClick={start}>{s('startTest')}</Button></div>
        </> : <p>{s('noQuestions')}</p>}
      </section>
    );
  }

  const qs = test.ids.map((id) => resolve(id));
  if (!test.ids.length || qs.some((q) => !q)) {
    return (
      <section className="card stack lq-card">
        <p>{s('noQuestions')}</p>
        <div><Button onClick={start} icon="reset">{s('retake')}</Button></div>
      </section>
    );
  }
  const questions = qs as Question[];
  const answered = (id: string) => !isEmptyResponse(test.answers[id]);
  const unanswered = test.ids.filter((id) => !answered(id)).length;

  const go = (i: number) => { setConfirm(false); setTest((x) => (x ? { ...x, index: Math.max(0, Math.min(x.ids.length - 1, i)) } : x)); topRef.current?.focus(); };

  const submit = async () => {
    setConfirm(false);
    if (enteredAt.current) { const p = enteredAt.current; times.current[p.id] = (times.current[p.id] ?? 0) + (Date.now() - p.at); enteredAt.current = null; }
    const already = test.recorded;
    setTest((x) => (x ? { ...x, submitted: true, recorded: true } : x));
    topRef.current?.focus();
    if (already) return;
    for (const q of questions) {
      const r = effectiveResponse(q, test.answers[q.id] ?? null);
      await record(q, grade(q.answer, r).correct, r, 0, times.current[q.id]);
      await new Promise((res) => setTimeout(res, 0)); // let mastery state settle between attempts
    }
  };

  if (test.submitted) {
    const results = questions.map((q) => { const r = effectiveResponse(q, test.answers[q.id] ?? null); return { q, r, ok: grade(q.answer, r).correct }; });
    const c = results.filter((x) => x.ok).length;
    return (
      <section className="stack" aria-labelledby="review-h">
        <div className="card stack lq-card" ref={topRef} tabIndex={-1}>
          <h2 id="review-h"><Icon name="trophy" /> {t('review')}</h2>
          <p className="lq-score" role="status">{s('score', { c, n: results.length })}</p>
          <Meter value={c / results.length} label={s('score', { c, n: results.length })} />
          <div className="row">
            <Button variant="primary" icon="reset" onClick={start}>{s('retake')}</Button>
            <Button icon="bulb" onClick={onPractice}>{s('goPractice')}</Button>
          </div>
        </div>
        <ol className="lq-review">
          {results.map(({ q, r, ok }, i) => (
            <li key={q.id} className="card lq-card">
              <p className={`lq-verdict ${ok ? 'ok' : 'no'}`}><Icon name={ok ? 'check' : 'x'} /> <b>{s('qOf', { i: i + 1, n: results.length })} — {ok ? s('right') : s('wrong')}</b></p>
              <QuestionPrompt q={q} autoRead={false} compact />
              <AnswerInput q={q} value={r} onChange={() => undefined} locked reveal tier={tier} />
              <dl className="lq-compare">
                <div><dt>{s('yourAnswer')}</dt><dd>{formatResponse(q, r) || s('noAnswer')}</dd></div>
                <div><dt>{s('correctAnswer')}</dt><dd>{formatAnswer(q)}</dd></div>
              </dl>
              <details open={!ok}><summary>{s('howToSolve')}</summary><Solution q={q} /></details>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const q = questions[test.index];
  return (
    <section className="stack" aria-labelledby="test-q">
      <div className="lq-testnav" ref={topRef} tabIndex={-1}>
        <span id="test-q" className="lq-qof">{s('qOf', { i: test.index + 1, n: test.ids.length })}</span>
        <nav className="row lq-dots" aria-label={s('jumpTo')}>
          {test.ids.map((id, i) => (
            <button key={id} type="button" className={`lq-dot ${answered(id) ? 'done' : ''}`} aria-current={i === test.index ? 'step' : undefined} onClick={() => go(i)}
              aria-label={`${s('qOf', { i: i + 1, n: test.ids.length })}${answered(id) ? `, ${s('answered')}` : ''}`}>
              {answered(id) ? <Icon name="check" /> : i + 1}
            </button>
          ))}
        </nav>
      </div>
      <article className="card lq-card">
        <QuestionPrompt q={q} autoRead={autoRead} />
        <div className="lq-answer">
          <AnswerInput key={q.id} q={q} value={test.answers[q.id] ?? null} tier={tier}
            onChange={(r) => setTest((x) => (x ? { ...x, answers: { ...x.answers, [q.id]: r } } : x))}
            onSubmit={() => (test.index < test.ids.length - 1 ? go(test.index + 1) : setConfirm(true))} />
        </div>
      </article>
      {confirm && unanswered > 0 && (
        <div className="alert warn" role="alert">
          <Icon name="alert" />
          <span className="stack" style={{ gap: 8 }}>{s('unanswered', { n: unanswered })}
            <span className="row"><Button variant="primary" onClick={() => void submit()}>{s('submitTest')}</Button><Button onClick={() => setConfirm(false)}>{t('cancel')}</Button></span>
          </span>
        </div>
      )}
      <div className="lq-actions lq-sticky">
        <Button icon="prev" onClick={() => go(test.index - 1)} disabled={test.index === 0}>{s('prev')}</Button>
        {test.index < test.ids.length - 1
          ? <Button variant="primary" icon="next" onClick={() => go(test.index + 1)}>{t('next')}</Button>
          : null}
        <Button variant={test.index === test.ids.length - 1 ? 'primary' : undefined} icon="check" onClick={() => (unanswered ? setConfirm(true) : void submit())}>{s('submitTest')}</Button>
      </div>
    </section>
  );
}
