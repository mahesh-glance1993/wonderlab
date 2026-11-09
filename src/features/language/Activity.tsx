// Objective screen: Learn (intro + worked examples + explorer/builder) and Practice / Test rounds.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { newSeed } from '../../shared/grading';
import { Icon } from '../../ui/Icon';
import { Button, Feedback, Meter, Page, ReportProblem, Segmented, celebrate } from '../../ui/kit';
import {
  COURSES, PASS, activityId, answerText, buildRound, check, findObjective, findUnit, hintsFor, isCourse, objectiveKey, objectiveState, questionId, roundSize,
  type ActivityMap, type ObjectiveState, type Session,
} from './engine';
import type { CourseId, Item, Objective, Script, Unit } from './types';
import { GlossToggle, Gloss, Pic, SayButton, T, VoiceNote } from './common';
import { awardUnitBadges, scriptOf, useGloss, useSay } from './util';
import { ItemView, type Value } from './ItemView';
import { CvcBuilder, GuninthamBuilder, OttuBuilder } from './Builders';
import { NotFound } from './NotFound';

type Mode = 'learn' | 'practice' | 'test';

export function ActivityPage() {
  const { course, unitId = '', objectiveId = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const { setLastActivity } = useApp();
  const raw = sp.get('mode');
  const mode: Mode = raw === 'practice' || raw === 'test' ? raw : 'learn';
  const c = isCourse(course) ? course : null;
  const unit = c ? findUnit(c, unitId) : undefined;
  const obj = c ? findObjective(c, unitId, objectiveId) : undefined;
  const [gloss, setGloss] = useGloss();
  const { say, teVoice } = useSay();

  useEffect(() => {
    if (c && unit && obj) setLastActivity(`/lang/${c}/${unit.id}/${obj.id}?mode=${mode}`, `${COURSES[c].titleEn}: ${obj.titleEn || obj.title}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, unit?.id, obj?.id, mode]);

  if (!c || !unit || !obj) return <NotFound />;
  const script = scriptOf(c);
  return (
    <Page title={obj.titleEn || obj.title} back={`/lang/${c}/${unit.id}`} fullscreen>
      <div className="lang-wrap stack">
        <div className="page-head lang-head">
          <div className="stack" style={{ gap: 2 }}>
            <span className="muted small"><T script={script}>{unit.title}</T></span>
            <h1><T script={script}>{obj.title}</T></h1>
            {c === 'telugu' && <Gloss show={gloss}>{obj.titleEn}</Gloss>}
          </div>
          <span className="spacer" />
          {c === 'telugu' && <GlossToggle on={gloss} set={setGloss} />}
        </div>
        <Segmented label="Mode" value={mode} onChange={(m) => setSp({ mode: m })}
          options={[{ value: 'learn', label: <><Icon name="book" />Learn</> }, { value: 'practice', label: <><Icon name="edit" />Practice</> }, { value: 'test', label: <><Icon name="star" />Test</> }]} />
        <VoiceNote course={c} teVoice={teVoice} />
        {mode === 'learn'
          ? <Learn course={c} unit={unit} obj={obj} script={script} gloss={gloss} say={say} />
          : <Round key={mode} course={c} unit={unit} obj={obj} mode={mode} script={script} gloss={gloss} say={say} teVoice={teVoice} />}
      </div>
    </Page>
  );
}

type Say = (t: string, s: Script) => Promise<boolean>;

function Learn({ course, unit, obj, script, gloss, say }: { course: CourseId; unit: Unit; obj: Objective; script: Script; gloss: boolean; say: Say }) {
  const { presentation, learner, saveActivityState } = useApp();
  const nav = useNavigate();
  const key = objectiveKey(course, unit.id, obj.id);
  const [tapped, setTapped] = useState<string[]>([]);
  useEffect(() => {
    if (presentation?.readAloud) void say(obj.intro, script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obj.id]);
  const done = async () => {
    const st = objectiveState(learner.activities, key) || {};
    await saveActivityState(activityId(key), { ...st, learned: true });
    nav(`/lang/${course}/${unit.id}/${obj.id}?mode=practice`);
  };
  return (
    <div className="stack">
      <section className="card stack" aria-labelledby="lang-intro">
        <h2 id="lang-intro" className="sr-only">Introduction</h2>
        <div className="row lang-intro">
          <T script={script} className="lang-lead">{obj.intro}</T>
          <SayButton text={obj.intro} script={script} say={say} />
        </div>
        <Gloss show={gloss}>{obj.introEn}</Gloss>
      </section>

      {obj.cards && (
        <section aria-labelledby="lang-cards" className="stack">
          <h2 id="lang-cards">Tap a letter to hear it</h2>
          <div className="lang-cards">
            {obj.cards.map((cd) => (
              <button key={cd.letter} type="button" className="lang-card" aria-pressed={tapped.includes(cd.letter)}
                aria-label={`${cd.letter} – ${cd.word} (${cd.en})`}
                onClick={() => { void say(`${cd.letter}. ${cd.word}`, script); setTapped((t) => (t.includes(cd.letter) ? t : [...t, cd.letter])); }}>
                <span className={`lang-card-letter lang-${script}`} lang={script} aria-hidden="true">{cd.letter}</span>
                <Pic emoji={cd.pic} label={cd.en} />
                <span lang={script} aria-hidden="true" className={`lang-${script}`}>{cd.word}</span>
                {(gloss || script === 'en') && script === 'te' && <span className="lang-gloss inline" aria-hidden="true">{cd.en}</span>}
              </button>
            ))}
          </div>
          <p className="muted small" aria-live="polite">{tapped.length} of {obj.cards.length} letters heard</p>
        </section>
      )}

      {obj.builder === 'gunintham' && <GuninthamBuilder say={say} />}
      {obj.builder === 'ottu' && <OttuBuilder say={say} />}
      {obj.builder === 'cvc' && <CvcBuilder say={say} />}

      <section aria-labelledby="lang-ex" className="stack">
        <h2 id="lang-ex">Worked examples</h2>
        <ol className="lang-examples">
          {obj.examples.map((e, i) => (
            <li key={i} className="card flat">
              <div className="row lang-ex-row">
                {e.pic && <Pic emoji={e.pic} label={e.en || 'picture'} />}
                <T script={script} className="lang-ex-text">{e.text}</T>
                <SayButton text={e.text} script={script} say={say} label={`Listen to example ${i + 1}`} />
              </div>
              {e.note && <p><T script={script}>{e.note}</T></p>}
              {script === 'te' ? <Gloss show={gloss}>{e.en}{e.noteEn ? ` — ${e.noteEn}` : ''}</Gloss> : e.en && <p className="muted">{e.en}</p>}
            </li>
          ))}
        </ol>
      </section>
      <div className="row">
        <Button variant="primary" icon="next" onClick={() => void done()}>I’m ready to practise</Button>
        <Link className="btn" to={`/lang/${course}/${unit.id}/${obj.id}?mode=test`}><Icon name="star" />Take the test</Link>
      </div>
    </div>
  );
}

const freshSession = (mode: 'practice' | 'test'): Session => ({ mode, seed: newSeed(), index: 0, answers: {}, checked: {}, tries: {}, hints: {}, solved: {}, submitted: false });

function Round({ course, unit, obj, mode, script, gloss, say, teVoice }: { course: CourseId; unit: Unit; obj: Objective; mode: 'practice' | 'test'; script: Script; gloss: boolean; say: Say; teVoice: boolean }) {
  const { learner, presentation, saveActivityState, recordAttempt, award } = useApp();
  const key = objectiveKey(course, unit.id, obj.id);
  const stRef = useRef<ObjectiveState>(objectiveState(learner.activities, key) || {});
  const [s, setS] = useState<Session>(() => {
    const prev = stRef.current.session;
    return prev && prev.mode === mode && !prev.submitted && prev.checked && prev.tries ? prev : freshSession(mode);
  });
  const size = roundSize(mode, presentation?.tier, obj.items.length);
  const round = useMemo(() => buildRound(obj, s.seed, size), [obj, s.seed, size]);
  const typing = !!presentation?.allowTyping && (presentation.tier === 'middle' || presentation.tier === 'senior');
  const r = round[Math.min(s.index, round.length - 1)];
  const id = r.item.id;

  const persist = (next: Session, extra: Partial<ObjectiveState> = {}) => {
    stRef.current = { ...stRef.current, ...extra, session: next };
    setS(next);
    void saveActivityState(activityId(key), stRef.current);
  };
  const attempt = (item: Item, correct: boolean, hintsUsed: number) =>
    void recordAttempt({ questionId: questionId(key, item.id), questionVersion: 1, objectiveId: `lang:${key}`, mode, correct, hintsUsed }).catch(() => undefined);

  const finish = (next: Session) => {
    const score = round.filter((x) => next.checked[x.item.id]).length / round.length;
    const field = mode === 'practice' ? 'practiceBest' : 'testBest';
    const best = Math.max(stRef.current[field] ?? 0, score);
    persist({ ...next, submitted: true, score }, { [field]: best });
    if (score >= PASS) celebrate();
    const acts: ActivityMap = { ...learner.activities, [activityId(key)]: { state: stRef.current, updatedAt: Date.now() } };
    void awardUnitBadges(course, acts, award);
  };

  if (s.submitted) return <Summary course={course} unit={unit} obj={obj} mode={mode} s={s} round={round} script={script} gloss={gloss} onAgain={() => persist(freshSession(mode))} />;

  const value = s.answers[id];
  const setValue = (v: Value) => persist({ ...s, answers: { ...s.answers, [id]: v as string | string[] } });
  const hints = hintsFor(r.item, r.choices);
  const shown = s.hints[id] || 0;
  const solved = !!s.solved[id];
  const tries = s.tries[id] || 0;
  const revealed = solved || tries >= 2;
  const answered = value != null && !(Array.isArray(value) && !value.length) && value !== '';
  const last = s.index >= round.length - 1;

  const onCheck = () => {
    const ok = check(r.item, value);
    const next: Session = { ...s, checked: { ...s.checked }, tries: { ...s.tries }, solved: { ...s.solved } };
    if (next.checked[id] === undefined) { next.checked[id] = ok; attempt(r.item, ok, shown); }
    if (ok) next.solved[id] = true; else next.tries[id] = tries + 1;
    persist(next);
  };
  const go = (i: number) => persist({ ...s, index: i });
  const submitTest = () => {
    const checked: Record<string, boolean> = {};
    for (const x of round) { checked[x.item.id] = check(x.item, s.answers[x.item.id]); attempt(x.item, checked[x.item.id], 0); }
    finish({ ...s, checked });
  };

  return (
    <div className="stack lang-round">
      <div className="row">
        <span className="pill">{mode === 'practice' ? 'Practice' : 'Test'} · Question {s.index + 1} of {round.length}</span>
        <span className="spacer" />
        <Button small variant="ghost" icon="reset" onClick={() => persist(freshSession(mode))}>Start over</Button>
      </div>
      <Meter value={(s.index + (mode === 'practice' && revealed ? 1 : 0)) / round.length} label="Progress" />
      <section className="card">
        <ItemView item={r.item} choices={r.choices} script={script} value={value} onChange={setValue} gloss={gloss} typing={typing} teVoice={teVoice} say={say}
          locked={mode === 'practice' && revealed} reveal={mode === 'practice' && revealed}
          eliminated={mode === 'practice' ? hints.slice(0, shown).map((h) => h.eliminate).filter((x): x is string => !!x) : undefined}
          autoSay={!!presentation?.readAloud} />
      </section>

      {mode === 'practice' && shown > 0 && (
        <div className="alert warn stack" role="status">
          {hints.slice(0, shown).map((h, i) => (
            <div key={i} className="row"><Icon name="bulb" /><span><T script={h.en ? script : 'en'}>{h.text}</T>{h.en && <Gloss show={gloss}> {h.en}</Gloss>}</span></div>
          ))}
        </div>
      )}
      {mode === 'practice' && (solved
        ? <Feedback ok><span>Correct! {r.item.explain && <T script={script}>{r.item.explain}</T>} <Gloss show={gloss}>{r.item.explainEn}</Gloss></span></Feedback>
        : tries >= 2
          ? <Feedback ok={false}><span>Here is the answer: <T script={script}>{answerText(r.item)}</T>. {r.item.explain && <T script={script}>{r.item.explain}</T>} <Gloss show={gloss}>{r.item.explainEn}</Gloss></span></Feedback>
          : tries === 1 ? <Feedback ok={false}>Not quite — have another go{hints.length > shown ? ', or tap Hint.' : '.'}</Feedback> : null)}

      <div className="row lang-actions">
        {mode === 'practice' ? (
          <>
            {!revealed && <Button variant="primary" icon="check" disabled={!answered} onClick={onCheck}>Check</Button>}
            {!revealed && hints.length > shown && <Button icon="bulb" onClick={() => persist({ ...s, hints: { ...s.hints, [id]: shown + 1 } })}>Hint</Button>}
            {revealed && (last
              ? <Button variant="primary" icon="star" onClick={() => finish(s)}>See my score</Button>
              : <Button variant="primary" icon="next" onClick={() => go(s.index + 1)}>Next</Button>)}
          </>
        ) : (
          <>
            <Button icon="back" disabled={s.index === 0} onClick={() => go(s.index - 1)}>Back</Button>
            {!last && <Button variant="primary" icon="next" onClick={() => go(s.index + 1)}>Next</Button>}
            {last && <Button variant="primary" icon="check" onClick={submitTest}>Submit test</Button>}
            <span className="muted small">{Object.keys(s.answers).filter((k) => round.some((x) => x.item.id === k)).length} of {round.length} answered</span>
          </>
        )}
        <span className="spacer" />
        <ReportProblem lessonId={`lang:${key}`} questionId={id} contentVersion={1} />
      </div>
    </div>
  );
}

function Summary({ course, unit, obj, mode, s, round, script, gloss, onAgain }: { course: CourseId; unit: Unit; obj: Objective; mode: 'practice' | 'test'; s: Session; round: { item: Item; choices: string[] }[]; script: Script; gloss: boolean; onAgain: () => void }) {
  const score = s.score ?? 0;
  const right = round.filter((x) => s.checked[x.item.id]).length;
  const nextUnitObj = unit.objectives[unit.objectives.findIndex((o) => o.id === obj.id) + 1];
  return (
    <div className="stack">
      <section className="card stack center" aria-live="polite">
        <h2>{score >= PASS ? 'Well done!' : 'Good effort!'}</h2>
        <p className="lang-score"><Icon name={score >= PASS ? 'trophy' : 'star'} size="lg" /> {right} of {round.length} right{mode === 'practice' ? ' on the first try' : ''}</p>
        <Meter value={score} label="Score" />
        <p className="muted">{score >= PASS ? 'You have passed this objective.' : `Score ${Math.round(PASS * 100)}% or more to pass. Try the Learn page again, then practise.`}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Button icon="reset" onClick={onAgain}>{mode === 'practice' ? 'Practise again' : 'Retake test'}</Button>
          {mode === 'practice' && <Link className="btn primary" to={`/lang/${course}/${unit.id}/${obj.id}?mode=test`}><Icon name="star" />Take the test</Link>}
          {nextUnitObj && <Link className="btn" to={`/lang/${course}/${unit.id}/${nextUnitObj.id}`}><Icon name="next" />Next: {nextUnitObj.titleEn || nextUnitObj.title}</Link>}
          <Link className="btn" to={`/lang/${course}`}><Icon name="home" />Course map</Link>
        </div>
      </section>
      {mode === 'test' && (
        <section className="stack" aria-labelledby="lang-review">
          <h2 id="lang-review">Review your answers</h2>
          <ol className="lang-review">
            {round.map(({ item }) => {
              const ok = s.checked[item.id];
              const given = s.answers[item.id];
              return (
                <li key={item.id} className={`card flat ${ok ? 'good' : 'bad'}`}>
                  <p className="row"><Icon name={ok ? 'check' : 'x'} /><b>{ok ? 'Correct' : 'Not correct'}</b></p>
                  <p><T script={script}>{item.prompt}</T>{item.pic && <> <Pic emoji={item.pic} label={item.picLabel || 'picture'} /></>}</p>
                  <Gloss show={gloss}>{item.en}</Gloss>
                  <p>Your answer: <T script={script}>{given == null || given === '' ? '(none)' : Array.isArray(given) ? given.join(item.type === 'build' ? '' : ' ') : given}</T></p>
                  {!ok && <p>Correct answer: <T script={script}><b>{answerText(item)}</b></T></p>}
                  {item.explain && <p className="muted"><T script={script}>{item.explain}</T></p>}
                  <Gloss show={gloss}>{item.explainEn}</Gloss>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
