// Read-along: narrated passage with word-by-word highlighting (static line highlight with reduced motion),
// tap any word to hear it, then 2–4 comprehension questions.
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { onSpeaking, stopSpeaking } from '../../lib/audio';
import { Icon } from '../../ui/Icon';
import { Button, Feedback, Page, celebrate } from '../../ui/kit';
import { COURSES, check, findPassage, isCourse } from './engine';
import type { Passage, Script } from './types';
import { Gloss, GlossToggle, T, VoiceNote } from './common';
import { CLASS_NAMES, awardBadge, useGloss, useSay } from './util';
import { NotFound } from './NotFound';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MS_PER_WORD: Record<Script, number> = { te: 560, en: 400 };

function waitForSpeechEnd(maxMs: number) {
  let off: () => void = () => {};
  let timer: ReturnType<typeof setTimeout>;
  const promise = new Promise<void>((res) => {
    let started = false;
    off = onSpeaking((sp) => { if (sp) started = true; else if (started) { off(); clearTimeout(timer); res(); } });
    timer = setTimeout(() => { off(); res(); }, maxMs);
  });
  return { promise, cancel: () => { off(); clearTimeout(timer); } };
}

interface ReadState { done?: boolean; score?: number; answers?: Record<string, string> }

export function ReadAlongPage() {
  const { course, passageId = '' } = useParams();
  const p = findPassage(passageId);
  if (!isCourse(course) || !p || p.course !== course) return <NotFound />;
  return <ReadAlong p={p} />;
}

function ReadAlong({ p }: { p: Passage }) {
  const { prefs, learner, saveActivityState, recordAttempt, award, setLastActivity } = useApp();
  const script = COURSES[p.course].script;
  const { say, teVoice } = useSay();
  const [gloss, setGloss] = useGloss();
  const key = `lang:read/${p.id}`;
  const saved = learner.activities[key]?.state as ReadState | undefined;
  const [answers, setAnswers] = useState<Record<string, string>>(saved?.answers || {});
  const [cur, setCur] = useState<{ line: number; word: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const token = useRef(0);
  const words = p.lines.map((l) => l.split(/\s+/).filter(Boolean));

  useEffect(() => {
    setLastActivity(`/lang/${p.course}/read/${p.id}`, `Read along: ${p.titleEn || p.title}`);
    const t = token;
    return () => { t.current++; stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);

  const play = async (from = 0) => {
    const my = ++token.current;
    setPlaying(true);
    for (let li = from; li < p.lines.length; li++) {
      if (token.current !== my) return;
      setCur({ line: li, word: 0 });
      const n = words[li].length;
      const waiter = waitForSpeechEnd(n * 900 + 4000);
      const spoken = await say(p.lines[li], script);
      if (!spoken) waiter.cancel();
      // advance the highlight word by word (or keep the whole line highlighted with reduced motion)
      const per = MS_PER_WORD[script] * (spoken ? 1 : 1.25);
      if (!prefs.reduceMotion) {
        for (let w = 1; w < n; w++) { await sleep(per); if (token.current !== my) return; setCur({ line: li, word: w }); }
      }
      if (spoken) await waiter.promise; else await sleep(prefs.reduceMotion ? n * per : per);
      if (token.current !== my) return;
      await sleep(250);
    }
    if (token.current === my) { setPlaying(false); setCur(null); }
  };
  const stop = () => { token.current++; stopSpeaking(); setPlaying(false); setCur(null); };
  const tapWord = (w: string) => { if (playing) stop(); void say(w.replace(/[“”"!?.,:;]/g, ''), script); };

  const answer = (qid: string, v: string) => {
    if (answers[qid]) return;
    const q = p.questions.find((x) => x.id === qid)!;
    const ok = check(q, v);
    void recordAttempt({ questionId: `${key}/${qid}`, questionVersion: 1, objectiveId: key, mode: 'practice', correct: ok, hintsUsed: 0 }).catch(() => undefined);
    const next = { ...answers, [qid]: v };
    setAnswers(next);
    const all = p.questions.every((x) => next[x.id]);
    const score = p.questions.filter((x) => next[x.id] && check(x, next[x.id])).length / p.questions.length;
    void saveActivityState(key, { done: all, score, answers: next } satisfies ReadState);
    if (all) { void awardBadge('lang:first-story', award); if (score >= 0.5) celebrate(); }
  };
  const done = p.questions.every((x) => answers[x.id]);
  const right = p.questions.filter((x) => answers[x.id] && check(x, answers[x.id])).length;

  return (
    <Page title={`Read along: ${p.titleEn || p.title}`} back={`/lang/${p.course}?class=${p.level}`} fullscreen>
      <div className="lang-wrap stack">
        <div className="page-head">
          <div className="stack" style={{ gap: 2 }}>
            <span className="muted small">{CLASS_NAMES[p.level]} · {p.kind}</span>
            <h1><T script={script}>{p.title}</T></h1>
            {script === 'te' && <Gloss show={gloss}>{p.titleEn}</Gloss>}
          </div>
          <span className="spacer" />
          {script === 'te' && <GlossToggle on={gloss} set={setGloss} />}
        </div>
        <VoiceNote course={p.course} teVoice={teVoice} />
        <div className="row">
          {!playing ? <Button variant="primary" icon="play" onClick={() => void play(0)}>Read to me</Button> : <Button icon="stop" onClick={stop}>Stop</Button>}
          <span className="muted small">Tap any word to hear it.</span>
        </div>
        <section className={`card lang-passage ${p.kind}`} aria-label="Passage">
          {p.lines.map((_line, li) => (
            <p key={li} className={`lang-line ${cur?.line === li ? 'current' : ''}`}>
              <T script={script}>
                {words[li].map((w, wi) => (
                  <span key={wi}>
                    <button type="button" className={`lang-word ${cur?.line === li && (prefs.reduceMotion || cur.word === wi) ? 'on' : ''}`} onClick={() => tapWord(w)}
                      aria-current={cur?.line === li && cur.word === wi ? 'true' : undefined}>{w}</button>{' '}
                  </span>
                ))}
              </T>
              {script === 'te' && <Gloss show={gloss}>{p.linesEn?.[li]}</Gloss>}
              <button type="button" className="btn small ghost lang-line-play" aria-label={`Read line ${li + 1} from here`} onClick={() => void play(li)}><Icon name="play" /></button>
            </p>
          ))}
        </section>

        <section className="stack" aria-labelledby="lang-q">
          <h2 id="lang-q">Questions</h2>
          {p.questions.map((q, qi) => {
            const a = answers[q.id];
            const ok = a ? check(q, a) : false;
            return (
              <div key={q.id} className="card stack">
                <div className="row"><b>{qi + 1}.</b> <T script={script}>{q.prompt}</T>
                  <button type="button" className="btn small" aria-label="Read the question aloud" onClick={() => void say(q.prompt, script)}><Icon name="speaker" /></button></div>
                <Gloss show={gloss}>{q.en}</Gloss>
                <div className="lang-choices" role="group" aria-label={`Choices for question ${qi + 1}`}>
                  {q.choices.map((c) => (
                    <button key={c} type="button" className={`choice lang-choice ${a ? (q.answer.includes(c) ? 'is-right' : a === c ? 'is-wrong' : '') : ''}`} aria-pressed={a === c} disabled={!!a} onClick={() => answer(q.id, c)}>
                      <T script={script}>{c}</T>
                      {a && q.answer.includes(c) && <span className="lang-mark"><Icon name="check" />Correct</span>}
                      {a === c && !q.answer.includes(c) && <span className="lang-mark"><Icon name="x" />Your answer</span>}
                    </button>
                  ))}
                </div>
                {a && <Feedback ok={ok}>{ok ? 'Correct!' : <>The answer is <T script={script}>{q.answer[0]}</T>. Look at the passage again.</>}</Feedback>}
              </div>
            );
          })}
          {done && (
            <div className="alert good" role="status"><Icon name="trophy" /><span>You answered {right} of {p.questions.length} correctly. <Link to={`/lang/${p.course}?class=${p.level}`}>Back to the course map</Link></span></div>
          )}
          {done && <Button variant="ghost" icon="reset" onClick={() => { setAnswers({}); void saveActivityState(key, { ...(saved || {}), answers: {} }); }}>Try the questions again</Button>}
        </section>
      </div>
    </Page>
  );
}
