// Shared frame for every game: instructions + read-aloud, variants, hints, restart/new round,
// optional count-up timer, feedback, persistence (saveActivityState), attempts and private badges.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../../lib/app';
import { Button, Feedback, NarrationControls, Page, Segmented, celebrate, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { newSeed } from '../../shared/grading';
import { BADGES, badgeIds, gameById, type GameId } from './catalog';
import { L, levelFor, prevDateKey, type Variant } from './gen/common';
import { S, formatTime, useTx } from './ui';
import { cheerWon } from '../../lib/cheer';

export interface ViewProps<R, P> {
  round: R;
  progress: P;
  setProgress: (p: P | ((prev: P) => P)) => void;
  /** Number of hints the learner has revealed this round. */
  hints: number;
  solved: boolean;
  variant: Variant;
  /** Report a wrong attempt (shows feedback, counts against "first try"). */
  mistake: (msg: L) => void;
  /** Report the round as solved. `perfect=false` marks it as not first-try even without mistakes. */
  complete: (msg?: L, perfect?: boolean) => void;
  /** Neutral, non-scoring message (e.g. "fill every square first"). */
  notice: (msg: L) => void;
  tx: (l: L | undefined) => string;
  say: (l: L) => void;
  reduceMotion: boolean;
  allowTyping: boolean;
}

export interface GameModule<R, P> {
  id: GameId;
  generate(seed: number, level: number): R;
  init(round: R): P;
  instructions(round: R): L;
  hints(round: R, progress: P): L[];
  View(props: ViewProps<R, P>): ReactNode;
}

interface Stats { rounds: number; firstTry: number; streak: number; best: number; challenge: number; wrongRun: number }
interface DailyInfo { date: string; streak: number; lastSolved: string | null }
interface Saved<P> {
  v: 1; game: GameId; variant: Variant; timerOn: boolean; adjust: number;
  seed: number; level: number; progress: P; hints: number; mistakes: number; solved: boolean; elapsed: number;
  /** Replaying an already-solved round: not scored again. */
  replay?: boolean;
  stats: Stats; daily?: DailyInfo;
}
const emptyStats = (): Stats => ({ rounds: 0, firstTry: 0, streak: 0, best: 0, challenge: 0, wrongRun: 0 });

export interface DailySpec { date: string; seed: number; level: number }

/** Read a game's saved stats (for the library cards). */
export function readStats(state: unknown): (Stats & { daily?: DailyInfo }) | null {
  const s = state as Saved<unknown> | undefined;
  return s && s.v === 1 ? { ...s.stats, daily: s.daily } : null;
}

type Feed = { ok: boolean; msg: L; n: number } | { ok: null; msg: L; n: number } | null;

export function GameShell<R, P>({ module, storageKey, daily }: { module: GameModule<R, P>; storageKey: string; daily?: DailySpec }) {
  const app = useApp();
  const { profile, prefs, presentation, learner, saveActivityState, recordAttempt, award, setLastActivity, speak } = app;
  const tx = useTx();
  const info = gameById(module.id)!;
  const classLevel = profile?.classLevel ?? 0;
  const reduceMotion = prefs.reduceMotion || (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const fresh = useCallback((variant: Variant, adjust: number, keep?: Partial<Saved<P>>): Saved<P> => {
    const seed = daily ? daily.seed : newSeed();
    const level = daily ? daily.level : levelFor(info.classRange, classLevel, variant, adjust);
    const round = module.generate(seed, level);
    return {
      v: 1, game: module.id, variant, timerOn: false, adjust, stats: emptyStats(), ...keep,
      seed, level, progress: module.init(round), hints: variant === 'guided' ? 1 : 0, mistakes: 0, solved: false, elapsed: 0,
    };
  }, [daily, info.classRange, classLevel, module]);

  const restore = useCallback((raw: unknown): Saved<P> | null => {
    const s = raw as Saved<P> | undefined;
    if (!s || s.v !== 1 || typeof s.seed !== 'number') return null;
    if (daily && (s.daily?.date !== daily.date || s.game !== module.id)) {
      // a new day: keep the streak record, start today's puzzle
      return fresh('regular', 0, { stats: s.stats, daily: s.daily ? { ...s.daily, date: daily.date } : undefined });
    }
    return s;
  }, [daily, fresh, module.id]);

  const stored = learner.activities[storageKey]?.state;
  const [s, setS] = useState<Saved<P>>(() => restore(stored) ?? fresh('regular', 0, daily ? { daily: { date: daily.date, streak: 0, lastSolved: null } } : undefined));
  const touched = useRef(false);
  const dirty = useRef(false);
  // learner state may arrive after first render (async load) — adopt it if the learner hasn't started
  useEffect(() => {
    if (touched.current || !stored) return;
    const r = restore(stored);
    if (r) setS(r);
  }, [stored, restore]);

  const update = useCallback((fn: (prev: Saved<P>) => Saved<P>) => { touched.current = true; dirty.current = true; setS(fn); }, []);

  // ---- persistence (debounced; flush on leave) ----
  const elapsedRef = useRef(s.elapsed);
  const latest = useRef(s);
  latest.current = s;
  const save = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    void saveActivityState(storageKey, { ...latest.current, elapsed: Math.round(elapsedRef.current) });
  }, [saveActivityState, storageKey]);
  useEffect(() => { const t = setTimeout(save, 500); return () => clearTimeout(t); }, [s, save]);
  useEffect(() => () => save(), [save]);
  useEffect(() => {
    const h = () => { dirty.current = true; save(); };
    const vis = () => { if (document.visibilityState === 'hidden') h(); };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [save]);

  useEffect(() => { setLastActivity(daily ? '/games/daily' : `/games/${module.id}`, daily ? tx(S.dailyPuzzle) : info.title); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- round ----
  const round = useMemo(() => module.generate(s.seed, s.level), [module, s.seed, s.level]);
  const instructions = module.instructions(round);
  const hintList = module.hints(round, s.progress);
  const [feed, setFeed] = useState<Feed>(null);
  const feedN = useRef(0);
  const show = (ok: boolean | null, msg: L) => setFeed({ ok, msg, n: ++feedN.current } as Feed);

  // auto read-aloud of instructions for younger learners on each new round
  useEffect(() => {
    if (presentation?.readAloud) speak(instructions.en, { te: instructions.te });
  }, [s.seed]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- timer (count-up, never a deadline) ----
  const timersAllowed = !!prefs.timers;
  const timerOn = timersAllowed && s.timerOn;
  const [elapsed, setElapsed] = useState(s.elapsed);
  useEffect(() => { elapsedRef.current = s.elapsed; setElapsed(s.elapsed); }, [s.seed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!timerOn || s.solved) return;
    const i = setInterval(() => { elapsedRef.current += 1; setElapsed(elapsedRef.current); }, 1000);
    return () => clearInterval(i);
  }, [timerOn, s.solved]);

  const say = useCallback((l: L) => speak(l.en, { te: l.te }), [speak]);

  const setProgress = useCallback((p: P | ((prev: P) => P)) => {
    update((prev) => ({ ...prev, progress: typeof p === 'function' ? (p as (x: P) => P)(prev.progress) : p }));
  }, [update]);

  const mistake = useCallback((msg: L) => {
    if (latest.current.solved) return;
    update((prev) => ({ ...prev, mistakes: prev.mistakes + 1 }));
    show(false, msg);
  }, [update]);
  const notice = useCallback((msg: L) => show(null, msg), []);

  const grant = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      if (await award(id)) {
        const b = BADGES.find((x) => x.id === id);
        if (b) toast(`${tx(S.newBadge)}: ${tx(L(b.title, b.titleTe))}`);
      }
    }
  }, [award, tx]);

  const complete = useCallback((msg?: L, perfect = true) => {
    const cur = latest.current;
    if (cur.solved) return;
    const correct = perfect && cur.mistakes === 0;
    if (cur.replay) {
      update((prev) => ({ ...prev, solved: true }));
      show(true, msg ?? S.correct);
      return;
    }
    const st = { ...cur.stats };
    st.rounds += 1;
    let adjust = cur.adjust;
    if (correct) {
      st.firstTry += 1; st.streak += 1; st.best = Math.max(st.best, st.streak); st.wrongRun = 0;
      if (!daily && st.streak % 4 === 0) adjust = Math.min(1, adjust + 1);
    } else {
      st.streak = 0; st.wrongRun += 1;
      if (!daily && st.wrongRun >= 2) { adjust = Math.max(-1, adjust - 1); st.wrongRun = 0; }
    }
    const challengeWin = cur.variant === 'challenge' && correct && cur.hints === 0;
    if (challengeWin) st.challenge += 1;
    let dailyInfo = cur.daily;
    if (daily) {
      const prevStreak = dailyInfo?.lastSolved === prevDateKey(daily.date) ? dailyInfo.streak : 0;
      dailyInfo = { date: daily.date, lastSolved: daily.date, streak: prevStreak + 1 };
    }
    update((prev) => ({ ...prev, solved: true, stats: st, adjust, daily: dailyInfo }));
    // a win: varied praise (same words as the apps) + a streak shout-out at 3 / 5 / 10 in a row
    const tier = presentation?.tier;
    const bonus = !correct ? '' : st.streak === 3 ? ' 3 in a row! 🔥' : st.streak === 5 ? " 5 in a row — you're on fire! 🔥" : st.streak === 10 ? " 10 in a row! You're a champion! 🏆" : '';
    const won = L(`${cheerWon(tier)} ${(correct ? S.solvedFirstTry : S.correct).en}${bonus}`, (correct ? S.solvedFirstTry : S.correct).te);
    show(true, msg ? L(`${msg.en}${bonus}`, msg.te) : won);
    void recordAttempt({ questionId: `${module.id}:${cur.level}:${cur.seed}`, questionVersion: 1, objectiveId: info.objectiveId, mode: 'game', correct, hintsUsed: cur.hints }).catch(() => undefined);
    const ids = [badgeIds.first(module.id)];
    if (st.rounds >= 5) ids.push(badgeIds.five(module.id));
    if (challengeWin) { ids.push(badgeIds.challenge(module.id)); celebrate(); }
    if (daily && dailyInfo) {
      ids.push(badgeIds.dailyFirst);
      if (dailyInfo.streak >= 3) ids.push(badgeIds.dailyStreak3);
      if (dailyInfo.streak >= 7) ids.push(badgeIds.dailyStreak7);
      celebrate();
    }
    void grant(ids);
  }, [daily, update, recordAttempt, module.id, info.objectiveId, grant, presentation?.tier]);

  /** Leaving an attempted-but-unsolved round still records an (incorrect) attempt. */
  const recordSkip = useCallback(() => {
    const cur = latest.current;
    if (!cur.solved && (cur.mistakes > 0 || cur.hints > (cur.variant === 'guided' ? 1 : 0))) {
      void recordAttempt({ questionId: `${module.id}:${cur.level}:${cur.seed}`, questionVersion: 1, objectiveId: info.objectiveId, mode: 'game', correct: false, hintsUsed: cur.hints }).catch(() => undefined);
    }
  }, [recordAttempt, module.id, info.objectiveId]);

  const newRound = (variant = s.variant) => {
    recordSkip();
    setFeed(null);
    update((prev) => fresh(variant, prev.adjust, { stats: prev.stats, timerOn: prev.timerOn, daily: prev.daily }));
  };
  const restart = () => {
    setFeed(null);
    update((prev) => ({ ...prev, progress: module.init(round), solved: false, replay: prev.replay || prev.solved }));
  };
  const showHint = () => {
    update((prev) => ({ ...prev, hints: Math.min(hintList.length, prev.hints + 1) }));
    const h = hintList[Math.min(hintList.length - 1, s.hints)];
    if (h && presentation?.readAloud) say(h);
  };

  const boardRef = useRef<HTMLDivElement>(null);
  const dailySolvedToday = daily && s.daily?.lastSolved === daily.date;
  const variants: { value: Variant; label: string }[] = info.variants.map((v) => ({ value: v, label: tx(S[v]) }));
  const title = daily ? `${tx(S.dailyPuzzle)} · ${tx(L(info.title, info.titleTe))}` : tx(L(info.title, info.titleTe));
  const View = module.View;

  return (
    <Page title={title} back="/games" fullscreen>
      <div className={`gm gm-${module.id}`}>
        <section className="gm-head card flat" aria-labelledby="gm-instr-h">
          <div className="gm-instr">
            <h2 id="gm-instr-h" className="sr-only">{tx(S.howToPlay)}</h2>
            <Icon name="info" />
            <p id="gm-instr">{tx(instructions)}</p>
            <NarrationControls text={instructions.en} te={instructions.te} />
          </div>
          <div className="gm-bar">
            {!daily && <Segmented label={tx(S.mode)} value={s.variant} options={variants} onChange={(v) => newRound(v)} />}
            <span className="pill" title={tx(S.level)}><Icon name="layers" />{tx(S.level)} {s.level + 1}</span>
            {s.stats.streak > 1 && <span className="pill"><Icon name="star" />{s.stats.streak} {tx(S.streak)}</span>}
            {daily && s.daily && s.daily.streak > 0 && <span className="pill"><Icon name="sun" />{s.daily.streak} {tx(S.dayStreak)}</span>}
            {timersAllowed && (
              <button type="button" className="btn small" aria-pressed={s.timerOn} onClick={() => update((p) => ({ ...p, timerOn: !p.timerOn }))}>
                <Icon name="clock" />{s.timerOn ? <span aria-live="off">{formatTime(elapsed)}</span> : tx(S.timerOff)}
              </button>
            )}
          </div>
        </section>

        <div className="gm-board" ref={boardRef} aria-describedby="gm-instr">
          <View
            round={round} progress={s.progress} setProgress={setProgress} hints={s.hints} solved={s.solved} variant={s.variant}
            mistake={mistake} complete={complete} notice={notice} tx={tx} say={say} reduceMotion={reduceMotion} allowTyping={presentation?.allowTyping ?? true}
          />
        </div>

        <div className="gm-feedback" aria-live="polite">
          {feed && (feed.ok === null
            ? <div className="alert info" role="status" key={feed.n}><Icon name="info" />{tx(feed.msg)}</div>
            : <Feedback ok={feed.ok} key={feed.n}>{tx(feed.msg)}</Feedback>)}
        </div>

        {s.hints > 0 && hintList.length > 0 && (
          <section className="gm-hints" aria-label={tx(S.hintsLabel)}>
            {hintList.slice(0, s.hints).map((h, i) => <p key={i}><Icon name="bulb" />{tx(h)}</p>)}
          </section>
        )}

        <div className="gm-actions">
          {s.variant === 'challenge'
            ? <span className="muted gm-nohint"><Icon name="lock" />{tx(S.noHintsChallenge)}</span>
            : <Button icon="bulb" onClick={showHint} disabled={s.solved || s.hints >= hintList.length}>{tx(S.hint)}</Button>}
          <Button icon="reset" onClick={restart}>{tx(S.restart)}</Button>
          <span className="spacer" />
          {!daily && <Button icon="next" variant={s.solved ? 'primary' : undefined} onClick={() => newRound()}>{tx(s.solved ? S.next : S.newRound)}</Button>}
          {dailySolvedToday && <span className="pill"><Icon name="check" />{tx(S.dailyDone)}</span>}
        </div>
      </div>
    </Page>
  );
}
