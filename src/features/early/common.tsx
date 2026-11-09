// Shared building blocks for Play & Learn screens: localisation, narration, saved state, big picture buttons.
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/app';
import { onSpeaking, tone } from '../../lib/audio';
import { sfx, sfxFor, type SfxName } from '../../lib/sfx';
import { Feedback, toast } from '../../ui/kit';
import { Icon } from '../../ui/Icon';
import { Art } from './art';
import { L, PIC } from './data/pictures';

/** UI words (TELUGU REVIEW NEEDED — first drafts, not yet checked by a native speaker). */
export const UI = {
  playLearn: L('Play & Learn', 'ఆడుకుందాం, నేర్చుకుందాం'),
  pictures: L('Picture Fun', 'బొమ్మల ఆట'),
  stories: L('Story Time', 'కథల సమయం'),
  shapes: L('Shape Play', 'ఆకారాల ఆట'),
  sort: L('Sort & Match', 'వేరుచేద్దాం, జతచేద్దాం'),
  build: L('Build It', 'తయారు చేద్దాం'),
  wellDone: L('Well done!', 'భలే!'),
  tryAgain: L('Try again!', 'మళ్ళీ ప్రయత్నించు!'),
  lookHere: L('Look — this one!', 'చూడు — ఇదే!'),
  next: L('Next', 'తర్వాత'),
  back: L('Back', 'వెనక్కి'),
  listen: L('Listen', 'విను'),
  playAgain: L('Play again', 'మళ్ళీ ఆడు'),
  allDone: L('All done! Great job!', 'అయిపోయింది! చాలా బాగా చేశావు!'),
  menu: L('Choose a game', 'ఆట ఎంచుకో'),
  round: L('Round', 'ఆట'),
  of: L('of', '/'),
};

export function useTx() {
  const { lang, speak } = useApp();
  const tx = useCallback((l: L | { en: string; te?: string }) => (lang === 'te' && l.te ? l.te : l.en), [lang]);
  const say = useCallback((l: L | { en: string; te?: string }) => speak(l.en, { te: l.te }), [speak]);
  return { tx, say, lang };
}

/** Per-activity saved state (`play:<id>`), read from the learner store and written with saveActivityState. */
export function useActivity<T extends object>(id: string, initial: T): [T, (patch: Partial<T> | ((s: T) => Partial<T>)) => void] {
  const { learner, saveActivityState } = useApp();
  const key = `play:${id}`;
  const saved = learner.activities[key]?.state as Partial<T> | undefined;
  const state = { ...initial, ...(saved || {}) } as T;
  const ref = useRef(state);
  ref.current = state;
  const update = useCallback((patch: Partial<T> | ((s: T) => Partial<T>)) => {
    const p = typeof patch === 'function' ? patch(ref.current) : patch;
    const next = { ...ref.current, ...p };
    ref.current = next;
    void saveActivityState(key, next);
  }, [key, saveActivityState]);
  return [state, update];
}

/** Remember this place for "Continue" on the home screen. */
export function useLastActivity(path: string, label: L) {
  const { setLastActivity } = useApp();
  const { tx } = useTx();
  const text = tx(label);
  useEffect(() => { setLastActivity(path, text); }, [path, text]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Speak `l` whenever `dep` changes (new round / page). */
export function useNarrate(l: L | null, dep: unknown) {
  const { say } = useTx();
  useEffect(() => {
    if (!l) return;
    const id = window.setTimeout(() => say(l), 250);
    return () => window.clearTimeout(id);
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** The sound effect for a picture (animals, birds, vehicles, nature), if it has one. */
export function itemSfx(id: string): SfxName | null {
  const p = PIC[id];
  if (!p || !['animal', 'bird', 'vehicle', 'nature'].includes(p.cat)) return null;
  return sfxFor(p.id) || sfxFor(p.en);
}
export const playItemSfx = (id: string) => { const n = itemSfx(id); if (n) sfx(n); };

/** Play a sound effect once the narration started with `dep` has finished (or soon, if nothing is spoken). */
export function useSfxAfterNarration(name: SfxName | null, dep: unknown) {
  useEffect(() => {
    if (!name) return;
    let started = false, fired = false;
    const fire = () => { if (!fired) { fired = true; sfx(name); } };
    const off = onSpeaking((on) => { if (on) started = true; else if (started) window.setTimeout(fire, 250); });
    const t = window.setTimeout(() => { if (!started) fire(); }, 1600);
    return () => { off(); window.clearTimeout(t); };
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
}

export const BADGES: Record<string, L> = {
  'play:first-story': L('First story', 'మొదటి కథ'),
  'play:5-stories': L('Five stories', 'ఐదు కథలు'),
  'play:50-pictures': L('50 pictures', '50 బొమ్మలు'),
  'play:all-shapes': L('Shape finder', 'ఆకారాల వేటగాడు'),
  'play:build-first': L('First build', 'మొదటి నిర్మాణం'),
  'play:build-5': L('Five builds', 'ఐదు నిర్మాణాలు'),
  'play:build-all': L('Master builder', 'గొప్ప నిర్మాత'),
};
export function useBadge() {
  const { award } = useApp();
  const { tx } = useTx();
  return useCallback(async (id: string, name?: L) => {
    const fresh = await award(id).catch(() => false);
    if (fresh) toast(`${tx(L('New badge', 'కొత్త బ్యాడ్జ్'))}: ${tx(name || BADGES[id] || L('Badge', 'బ్యాడ్జ్'))}`);
    return fresh;
  }, [award, tx]);
}

/** Record one answer for mastery (objective play:<activity>). */
export function useRecord(activity: string) {
  const { recordAttempt } = useApp();
  return useCallback((questionId: string, correct: boolean, hintsUsed = 0) => {
    void recordAttempt({ questionId: `play:${activity}:${questionId}`, questionVersion: 1, objectiveId: `play:${activity}`, mode: 'game', correct, hintsUsed }).catch(() => undefined);
  }, [activity, recordAttempt]);
}

export type PickState = 'right' | 'wrong' | 'hint' | undefined;
/** A big picture button. Words are optional (always given as the accessible name). */
export function PicButton({ art, v, label, onPick, state, disabled, showLabel, shadow, small, big, extra }: {
  art: string; v?: string; label: string; onPick: () => void; state?: PickState; disabled?: boolean; showLabel?: boolean; shadow?: boolean; small?: boolean; big?: boolean; extra?: ReactNode;
}) {
  return (
    <button type="button" className={`el-pick ${state ? `is-${state}` : ''} ${small ? 'is-small' : ''} ${big ? 'is-big' : ''}`} onClick={onPick} disabled={disabled} aria-label={label}>
      <span className="el-pick-art"><Art id={art} v={v} shadow={shadow} /></span>
      {showLabel && <span className="el-pick-label" aria-hidden="true">{label}</span>}
      {state === 'right' && <span className="el-badge good" aria-hidden="true"><Icon name="check" /></span>}
      {state === 'hint' && <span className="el-badge hint" aria-hidden="true"><Icon name="hand" /></span>}
      {extra}
    </button>
  );
}

/** Speaker button that reads a word aloud. */
export function SayButton({ l, label }: { l: L | { en: string; te?: string }; label?: string }) {
  const { say, tx } = useTx();
  return (
    <button type="button" className="btn el-say" onClick={() => { tone('tap'); say(l); }} aria-label={`${tx(UI.listen)}: ${label ?? tx(l)}`}>
      <Icon name="speaker" />
    </button>
  );
}

/** Prompt line: big text + replay button. Text is always visible. */
export function Prompt({ l, children }: { l: L | { en: string; te?: string }; children?: ReactNode }) {
  const { tx } = useTx();
  return (
    <div className="el-prompt">
      <SayButton l={l} />
      <p className="el-prompt-text">{children ?? tx(l)}</p>
    </div>
  );
}

/** Gentle feedback: icon + words + soft tone (via kit Feedback). */
export function EarlyFeedback({ ok, tries, extra }: { ok: boolean; tries: number; extra?: string }) {
  const { tx } = useTx();
  return (
    <div className="el-feedback">
      <Feedback key={`${ok}-${tries}`} ok={ok}>
        <span>{tx(ok ? UI.wellDone : tries >= 2 ? UI.lookHere : UI.tryAgain)}{extra ? ` ${extra}` : ''}</span>
      </Feedback>
    </div>
  );
}

/** Progress dots for a short set of rounds (text alternative included). */
export function RoundDots({ done, total }: { done: number; total: number }) {
  const { tx } = useTx();
  return (
    <div className="el-dots" role="img" aria-label={`${tx(UI.round)} ${Math.min(done + 1, total)} ${tx(UI.of)} ${total}`}>
      {Array.from({ length: total }, (_, i) => <span key={i} className={i < done ? 'on' : i === done ? 'cur' : ''}>{i < done && <Icon name="check" />}</span>)}
    </div>
  );
}

/** End-of-set panel with play again / menu. */
export function DonePanel({ onAgain, backTo, children }: { onAgain: () => void; backTo: string; children?: ReactNode }) {
  const { tx } = useTx();
  const nav = useNavigate();
  return (
    <div className="el-done" role="status">
      <div className="el-done-star" aria-hidden="true"><Icon name="star" size="lg" /></div>
      <h2>{tx(UI.allDone)}</h2>
      {children}
      <div className="el-row">
        <button type="button" className="btn primary el-big" onClick={onAgain}><Icon name="reset" />{tx(UI.playAgain)}</button>
        <button type="button" className="btn el-big" onClick={() => nav(backTo)}><Icon name="grid" />{tx(UI.menu)}</button>
      </div>
    </div>
  );
}

/** A large menu tile; label is read aloud on focus (keyboard) and on tap. */
export function BigTile({ art, title, onGo, tint, sub }: { art: string; title: L; onGo: () => void; tint?: string; sub?: string }) {
  const { tx, say } = useTx();
  return (
    <button type="button" className="el-tile" style={tint ? { background: tint } : undefined} onClick={() => { say(title); onGo(); }}
      onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) say(title); }}>
      <span className="el-tile-art"><Art id={art} /></span>
      <span className="el-tile-label">{tx(title)}</span>
      {sub && <span className="el-tile-sub">{sub}</span>}
    </button>
  );
}

/** In-activity "back one step" control (the page header back goes to the Play menu). */
export function BackRow({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  const { tx } = useTx();
  return (
    <div className="el-backrow">
      <button type="button" className="btn el-big" onClick={onBack}><Icon name="back" />{tx(UI.back)}</button>
      {children}
    </div>
  );
}
