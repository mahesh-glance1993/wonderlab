// The lesson workspace for one objective: Learn / Practice / Test, saved & resumable.
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import type { Objective, Question, Template, Unit } from '../../shared/content';
import { grade, newSeed, type Response } from '../../shared/grading';
import { MASTERY_DISTINCT, difficultyFor } from '../../shared/mastery';
import { useApp, useL } from '../../lib/app';
import { Icon } from '../../ui/Icon';
import { Button, IconButton, Meter, Page, ReportProblem, Segmented, celebrate, toast } from '../../ui/kit';
import {
  adaptForTier, candidatesFor, emptyLessonState, learnStages, newQState, nextPracticeId, parseMode, resolveQuestion, restoreLessonState,
  serialiseLessonState, similarId, type LessonState, type Mode, type QState,
} from './logic';
import { useLessonContent } from './useLessonContent';
import { QuestionPanel } from './QuestionPanel';
import { LearnMode, ActivityLinks } from './LearnMode';
import { TestMode } from './TestMode';
import { Scratchpad } from './Scratchpad';
import { useS } from './strings';

export default function Workspace() {
  const { unitId = '', objectiveId } = useParams();
  const loc = useLocation();
  const { profile } = useApp();
  const s = useS();
  const content = useLessonContent(profile?.classLevel);
  if (content.status === 'loading') return <Page title={s('loading')} back="/learn"><p className="muted center" role="status">{s('loading')}</p></Page>;
  if (content.status === 'error') return <Page title={s('notFound')} back="/learn"><div className="alert warn"><Icon name="wifiOff" />This class is not available offline yet. Connect to the internet or download it in Downloads.</div></Page>;
  const unit = content.content.units.find((u) => u.id === unitId);
  if (unit && !objectiveId && unit.objectives[0]) return <Navigate to={`/lesson/${unit.id}/${unit.objectives[0].id}${loc.search}`} replace />;
  const o = unit?.objectives.find((x) => x.id === objectiveId);
  if (!unit || !o) {
    return (
      <Page title={s('notFound')} back="/learn">
        <div className="card stack"><p>{s('notFound')}</p><div><Link className="btn" to="/learn">{s('backToLearn')}</Link></div></div>
      </Page>
    );
  }
  return <LessonWorkspace key={`${unit.id}/${o.id}`} unit={unit} o={o} templates={content.content.templates} />;
}

/** Keeps the keypad / sticky actions above an on-screen keyboard and focused inputs in view. */
function useKeyboardInset(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!vv || !el) return;
    const f = () => el.style.setProperty('--kb-inset', `${Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))}px`);
    const focus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches('input, textarea')) setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'auto' }), 300);
    };
    vv.addEventListener('resize', f); vv.addEventListener('scroll', f); el.addEventListener('focusin', focus);
    f();
    return () => { vv.removeEventListener('resize', f); vv.removeEventListener('scroll', f); el.removeEventListener('focusin', focus); };
  }, [ref]);
}

function LessonWorkspace({ unit, o, templates }: { unit: Unit; o: Objective; templates: Record<string, Template> }) {
  const { presentation, learner, recordAttempt, saveLessonState, award, setLastActivity, t } = useApp();
  const L = useL();
  const s = useS();
  const loc = useLocation();
  const [params, setParams] = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  useKeyboardInset(rootRef);

  const tier = presentation?.tier ?? 'primary';
  const autoRead = !!presentation?.readAloud;
  const lessonId = `${unit.id}/${o.id}`;
  const saved = learner.lessons[lessonId];
  const urlMode = parseMode(params.get('mode'));

  // ---------- state, save & restore ----------
  const fromSaved = (raw: unknown): LessonState => { const st = raw ? restoreLessonState(raw) : emptyLessonState(); return urlMode ? { ...st, mode: urlMode } : st; };
  const [ls, setLs] = useState<LessonState>(() => fromSaved(saved?.state));
  const dirty = useRef(false); // set once the learner interacts; until then late-arriving saved state wins
  const lsRef = useRef(ls); lsRef.current = ls;
  const saveRef = useRef(saveLessonState); saveRef.current = saveLessonState;
  const update = useCallback((fn: (x: LessonState) => LessonState, user = true) => { if (user) dirty.current = true; setLs(fn); }, []);

  useEffect(() => { if (!dirty.current && saved) setLs(fromSaved(saved.state)); }, [saved?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dirty.current) return;
    const h = setTimeout(() => void saveRef.current(lessonId, serialiseLessonState(ls)), 250);
    return () => clearTimeout(h);
  }, [ls, lessonId]);
  useEffect(() => {
    const flush = () => { if (dirty.current) void saveRef.current(lessonId, serialiseLessonState(lsRef.current)); };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, [lessonId]);

  // mode ↔ URL
  useEffect(() => { if (urlMode && urlMode !== ls.mode) update((x) => ({ ...x, mode: urlMode }), false); }, [urlMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const switchMode = (m: Mode) => {
    update((x) => ({ ...x, mode: m }));
    setParams((p) => { const n = new URLSearchParams(p); n.set('mode', m); return n; }, { replace: true });
  };

  // continue-learning pointer
  const lastAct = useRef('');
  useEffect(() => {
    const path = `${loc.pathname}?mode=${ls.mode}`;
    if (lastAct.current === path) return;
    lastAct.current = path;
    setLastActivity(path, L(o.title));
  }, [ls.mode, loc.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- questions ----------
  const cands = useMemo(() => candidatesFor(o, templates), [o, templates]);
  const cache = useRef(new Map<string, Question | null>());
  const resolve = useCallback((qid: string): Question | null => {
    const c = cache.current;
    if (!c.has(qid)) { const q = resolveQuestion(qid, o.items ?? [], templates); c.set(qid, q ? adaptForTier(q, tier) : null); }
    return c.get(qid) ?? null;
  }, [o, templates, tier]);
  const mastery = learner.mastery[o.id];
  const solved = mastery?.distinctCorrect ?? [];
  const fresh = (target: 1 | 2 | 3, lastId?: string | null): string | null => {
    for (let i = 0; i < 12; i++) {
      const id = nextPracticeId(cands, target, newSeed(), { lastId, solved });
      if (!id) return null;
      if (resolve(id)) return id;
    }
    return null;
  };

  const stages = learnStages(o);
  const learnStage = stages[Math.max(0, Math.min(stages.length - 1, ls.learn.step))];
  const practiceQ = ls.practice.q && resolve(ls.practice.q.qid) ? ls.practice.q : null;
  const learnQ = ls.learn.q && resolve(ls.learn.q.qid) ? ls.learn.q : null;

  // make sure a question exists where one is needed (auto change — not saved until the learner acts)
  useEffect(() => {
    if (ls.mode === 'practice' && !practiceQ) {
      const id = fresh(difficultyFor(mastery));
      if (id) update((x) => ({ ...x, practice: { ...x.practice, q: newQState(id) } }), false);
    }
    if (ls.mode === 'learn' && learnStage.kind === 'try' && !learnQ) {
      const id = fresh(1);
      if (id) update((x) => ({ ...x, learn: { ...x.learn, q: newQState(id) } }), false);
    }
  }, [ls.mode, practiceQ?.qid, learnQ?.qid, learnStage.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- recording & mastery ----------
  const masteryRef = useRef(learner.mastery); masteryRef.current = learner.mastery;
  const [masteredNow, setMasteredNow] = useState(false);
  const fired = useRef(false);
  const shownAt = useRef(new Map<string, number>());
  const currentQid = ls.mode === 'practice' ? practiceQ?.qid : ls.mode === 'learn' && learnStage.kind === 'try' ? learnQ?.qid : ls.mode === 'test' && ls.test && !ls.test.submitted ? ls.test.ids[ls.test.index] : undefined;
  useEffect(() => { if (currentQid && !shownAt.current.has(currentQid)) shownAt.current.set(currentQid, Date.now()); }, [currentQid]);

  const record = useCallback(async (q: Question, mode: Mode, correct: boolean, response: Response | null, hints: number, durationMs?: number) => {
    const before = !!masteryRef.current[o.id]?.masteredAt;
    const start = shownAt.current.get(q.id);
    const dur = durationMs ?? (start ? Date.now() - start : undefined);
    try {
      const m = await recordAttempt({
        questionId: q.id, questionVersion: q.version, objectiveId: o.id, mode, correct, response: response ?? undefined, hintsUsed: hints,
        durationMs: dur === undefined ? undefined : Math.min(dur, 30 * 60 * 1000),
      });
      if (m.masteredAt && !before && !fired.current) {
        fired.current = true;
        celebrate();
        void award(`mastered:${o.id}`);
        setMasteredNow(true);
      }
    } catch {
      toast('Your answer could not be saved. It will be kept on this device.');
    }
  }, [o.id, recordAttempt, award]);

  // ---------- per-mode wiring ----------
  const setQ = (which: 'learn' | 'practice') => (fn: (q: QState) => QState) =>
    update((x) => {
      const cur = x[which].q;
      if (!cur) return x;
      return which === 'learn' ? { ...x, learn: { ...x.learn, q: fn(cur) } } : { ...x, practice: { ...x.practice, q: fn(cur) } };
    });
  const newPractice = (id: string | null) => { if (id) update((x) => ({ ...x, practice: { q: newQState(id), count: x.practice.count + 1 } })); };
  const trySimilar = () => {
    if (!practiceQ) return;
    let id: string | null = null;
    for (let i = 0; i < 8 && !id; i++) { const c = similarId(practiceQ.qid, cands, newSeed(), solved); if (c && resolve(c)) id = c; }
    newPractice(id ?? fresh(difficultyFor(mastery), practiceQ.qid));
  };

  const pq = practiceQ ? resolve(practiceQ.qid) : null;
  const lq = learnQ ? resolve(learnQ.qid) : null;
  const reportQ = ls.mode === 'practice' ? pq : ls.mode === 'learn' ? (learnStage.kind === 'try' ? lq : null) : (ls.test && !ls.test.submitted ? resolve(ls.test.ids[ls.test.index]) : null);
  const tryCorrect = learnQ?.checked && lq ? grade(lq.answer, learnQ.draft).correct : null;
  const progress = Math.min(1, (mastery?.distinctCorrect.length ?? 0) / MASTERY_DISTINCT);
  const [scratch, setScratch] = useState(false);
  const senior = tier === 'senior';

  return (
    <Page title={L(o.title)} back="/learn" fullscreen actions={<ReportProblem lessonId={lessonId} questionId={reportQ?.id} contentVersion={reportQ?.version} />}>
      <div ref={rootRef} className={`lesson tier-${tier} ${scratch ? 'with-scratch' : ''}`}>
        <header className="lesson-head">
          <div className="lesson-titles">
            <span className="muted lesson-unit">{L(unit.title)}</span>
            <h1>{L(o.title)}</h1>
          </div>
          <div className="lesson-tools">
            <Segmented<Mode> label={s('lessonMode')} value={ls.mode} onChange={switchMode} options={[
              { value: 'learn', label: <><Icon name="book" />{t('learn')}</> },
              { value: 'practice', label: <><Icon name="bulb" />{t('practice')}</> },
              { value: 'test', label: <><Icon name="trophy" />{t('test')}</> },
            ]} />
            {senior && <Button small icon="edit" aria-pressed={scratch} aria-controls="lesson-scratch" onClick={() => setScratch(!scratch)}>{s('scratch')}</Button>}
          </div>
          <div className="lesson-mastery">
            {mastery?.masteredAt
              ? <span className="pill lq-mastered"><Icon name="star" />{t('mastered')}</span>
              : <><span className="muted sm">{s('masteryProgress')}</span><Meter value={progress} label={s('masteryProgress')} /></>}
          </div>
        </header>

        {masteredNow && (
          <div className="card lq-masterbanner" role="status">
            <Icon name="trophy" size="lg" />
            <div><b>{t('canNowDo')}</b> <span className="lq-q">{L(o.title)}</span></div>
            <IconButton icon="x" className="small ghost" label={t('close')} onClick={() => setMasteredNow(false)} />
          </div>
        )}

        <div className="lesson-body">
          <div className="lesson-main">
            {ls.mode === 'learn' && (
              <LearnMode o={o} learn={ls.learn} autoRead={autoRead} goMode={switchMode}
                setLearn={(fn) => update((x) => ({ ...x, learn: fn(x.learn) }))}
                tryChecked={!!learnQ?.checked} tryCorrect={tryCorrect ?? null}
                tryPanel={lq && learnQ
                  ? <QuestionPanel key={lq.id} q={lq} st={learnQ} set={setQ('learn')} tier={tier} autoRead={autoRead}
                    onAnswered={(q, ok, r, h) => void record(q, 'learn', ok, r, h)} />
                  : <p className="card">{s('noQuestions')}</p>} />
            )}

            {ls.mode === 'practice' && (
              pq && practiceQ
                ? <QuestionPanel key={pq.id} q={pq} st={practiceQ} set={setQ('practice')} tier={tier} autoRead={autoRead}
                  onAnswered={(q, ok, r, h) => void record(q, 'practice', ok, r, h)}
                  after={<>
                    <Button variant="primary" icon="reset" onClick={trySimilar}>{s('similar')}</Button>
                    <Button icon="next" onClick={() => newPractice(fresh(difficultyFor(masteryRef.current[o.id]), practiceQ.qid))}>{s('nextQ')}</Button>
                  </>} />
                : <p className="card">{s('noQuestions')}</p>
            )}

            {ls.mode === 'test' && (
              <TestMode cands={cands} test={ls.test} tier={tier} autoRead={autoRead} resolve={resolve}
                setTest={(fn) => update((x) => ({ ...x, test: fn(x.test) }))}
                record={(q, ok, r, h, d) => record(q, 'test', ok, r, h, d)}
                onPractice={() => switchMode('practice')} />
            )}

            <ActivityLinks o={o} />
          </div>
          {senior && scratch && <aside className="lesson-aside"><Scratchpad id="lesson-scratch" /></aside>}
        </div>
      </div>
    </Page>
  );
}
