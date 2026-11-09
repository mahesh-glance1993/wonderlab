// Optional starting check for the learner's class: low-pressure (no right/wrong shown while answering),
// attempts recorded with mode 'diagnostic', then a summary and a link to "What should I learn next?".
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { diagnosticFor } from '../../content';
import type { Question } from '../../shared/content';
import { grade, newSeed, type Response } from '../../shared/grading';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, Meter, Page, toast } from '../../ui/kit';
import { adaptForTier, allItems, isResponse, isEmptyResponse, resolveDiagnostic, resolveQuestion, summariseDiagnostic, type DiagItem } from './logic';
import { AnswerInput, effectiveResponse } from './inputs';
import { QuestionPrompt } from './QuestionPanel';
import { useLessonContent } from './useLessonContent';
import { useS } from './strings';

interface DiagState { v: 1; items: DiagItem[]; index: number; results: Record<string, boolean>; draft: Response | null; done: boolean }

function restoreDiag(raw: unknown): DiagState | null {
  if (!raw || typeof raw !== 'object') return null;
  const x = raw as Record<string, unknown>;
  if (x.v !== 1 || !Array.isArray(x.items)) return null;
  const items = (x.items as unknown[]).filter((i): i is DiagItem => !!i && typeof i === 'object' && typeof (i as DiagItem).qid === 'string' && typeof (i as DiagItem).objectiveId === 'string' && typeof (i as DiagItem).unitId === 'string');
  const results: Record<string, boolean> = {};
  if (x.results && typeof x.results === 'object') for (const [k, v] of Object.entries(x.results)) if (typeof v === 'boolean') results[k] = v;
  const index = typeof x.index === 'number' ? Math.max(0, Math.min(items.length, Math.floor(x.index))) : 0;
  return { v: 1, items, index, results, draft: isResponse(x.draft) ? x.draft : null, done: x.done === true };
}

export default function Diagnostic() {
  const { profile, presentation, learner, recordAttempt, saveLessonState, setLastActivity } = useApp();
  const L = useL();
  const s = useS();
  const level = profile?.classLevel;
  const content = useLessonContent(level);
  const key = `diagnostic/${level}`;
  const tier = presentation?.tier ?? 'primary';
  const autoRead = !!presentation?.readAloud;
  const saved = learner.lessons[key];
  const [st, setSt] = useState<DiagState | null>(() => restoreDiag(saved?.state));
  const touched = useRef(false);
  const startedAt = useRef(Date.now());
  useEffect(() => { if (!touched.current && saved) setSt(restoreDiag(saved.state)); }, [saved?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLastActivity('/lesson/diagnostic', s('diagTitle')); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (n: DiagState | null) => { touched.current = true; setSt(n); void saveLessonState(key, n ? JSON.parse(JSON.stringify(n)) : null); };

  const ready = content.status === 'ready' ? content.content : null;
  const items = useMemo(() => (ready ? allItems(ready.units) : []), [ready]);
  const resolve = (qid: string): Question | null => {
    if (!ready) return null;
    const q = resolveQuestion(qid, items, ready.templates);
    return q ? adaptForTier(q, tier) : null;
  };
  const ids = useMemo(() => { if (level === undefined) return []; try { return diagnosticFor(level) ?? []; } catch { return []; } }, [level]);

  const start = () => {
    if (!ready) return;
    const list = resolveDiagnostic(ids, ready.units, ready.templates, newSeed()).filter((it) => !!resolve(it.qid));
    startedAt.current = Date.now();
    change({ v: 1, items: list, index: 0, results: {}, draft: null, done: list.length === 0 });
  };

  const title = s('diagTitle');
  if (content.status === 'loading') return <Page title={title} back="/"><p className="muted center" role="status">{s('loading')}</p></Page>;
  if (content.status === 'error' || !ready) return <Page title={title} back="/"><div className="alert warn"><Icon name="wifiOff" />This class is not available offline yet.</div></Page>;

  const objTitle = (oid: string) => { for (const u of ready.units) { const o = u.objectives.find((x) => x.id === oid); if (o) return L(o.title); } return oid; };

  // ---------- intro ----------
  if (!st) {
    return (
      <Page title={title} back="/">
        <section className="card stack lq-card lesson" aria-labelledby="diag-h">
          <h1 id="diag-h"><Icon name="compass" /> {title}</h1>
          {ids.length ? <>
            <p>{s('diagIntro')}</p>
            <div className="row">
              <Button variant="primary" icon="play" onClick={start}>{s('diagStart')}</Button>
              <Link className="btn ghost" to="/next">{s('notNow')}</Link>
            </div>
          </> : <>
            <p>{s('diagNone')}</p>
            <div><Link className="btn primary" to="/next">{s('whatNext')}</Link></div>
          </>}
        </section>
      </Page>
    );
  }

  // ---------- summary ----------
  if (st.done || st.index >= st.items.length) {
    const sum = summariseDiagnostic(st.items, st.results);
    return (
      <Page title={title} back="/">
        <section className="stack lesson" aria-labelledby="diag-done">
          <div className="card stack lq-card">
            <h1 id="diag-done"><Icon name="star" /> {s('diagDone')}</h1>
            <ul className="lq-diagsum">
              {sum.map((x) => {
                const strong = x.correct === x.total;
                return (
                  <li key={x.objectiveId} className={`lq-verdict ${strong ? 'ok' : 'no'}`}>
                    <Icon name={strong ? 'check' : 'bulb'} />
                    <span><b>{objTitle(x.objectiveId)}</b> — {strong ? s('strong') : s('practiseThis')} ({x.correct}/{x.total})</span>
                    {!strong && <Link className="btn small" to={`/lesson/${x.unitId}/${x.objectiveId}?mode=learn`}>{s('open')}</Link>}
                  </li>
                );
              })}
            </ul>
            <div className="row">
              <Link className="btn primary" to="/next"><Icon name="compass" />{s('whatNext')}</Link>
              <Button variant="ghost" icon="reset" onClick={() => change(null)}>{s('diagAgain')}</Button>
            </div>
          </div>
        </section>
      </Page>
    );
  }

  // ---------- question ----------
  const it = st.items[st.index];
  const q = resolve(it.qid);
  const answer = async (skip: boolean) => {
    const r = q && !skip ? effectiveResponse(q, st.draft) : null;
    const correct = !!q && !skip && grade(q.answer, r).correct;
    const nextIndex = st.index + 1;
    change({ ...st, results: { ...st.results, [it.qid]: correct }, index: nextIndex, draft: null, done: nextIndex >= st.items.length });
    if (q) {
      try {
        await recordAttempt({ questionId: q.id, questionVersion: q.version, objectiveId: it.objectiveId, mode: 'diagnostic', correct, response: r ?? undefined, hintsUsed: 0, durationMs: Math.min(Date.now() - startedAt.current, 30 * 60 * 1000) });
      } catch { toast('Your answer could not be saved.'); }
    }
    startedAt.current = Date.now();
  };
  return (
    <Page title={title} back="/" fullscreen>
      <section className={`stack lesson tier-${tier}`} aria-labelledby="diag-q">
        <div className="lq-progress">
          <span id="diag-q" className="muted">{s('qOf', { i: st.index + 1, n: st.items.length })}</span>
          <Meter value={st.index / st.items.length} label={s('qOf', { i: st.index + 1, n: st.items.length })} />
        </div>
        {q ? (
          <article className="card lq-card">
            <QuestionPrompt q={q} autoRead={autoRead} />
            <div className="lq-answer">
              <AnswerInput key={q.id} q={q} value={st.draft} tier={tier} onChange={(r) => { touched.current = true; setSt({ ...st, draft: r }); }} onSubmit={() => { if (!isEmptyResponse(effectiveResponse(q, st.draft))) void answer(false); }} />
            </div>
          </article>
        ) : <p className="card">{s('noQuestions')}</p>}
        <div className="lq-actions lq-sticky">
          <Button variant="ghost" onClick={() => void answer(true)}>{s('dontKnow')}</Button>
          <Button variant="primary" icon="next" disabled={!!q && isEmptyResponse(effectiveResponse(q, st.draft))} onClick={() => void answer(false)}>{s('saveAndNext')}</Button>
        </div>
      </section>
    </Page>
  );
}
