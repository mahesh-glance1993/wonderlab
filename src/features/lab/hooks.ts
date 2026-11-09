// React hooks shared by the labs: fixed-timestep loop, reduced motion, tier, persistence, challenges.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../lib/app';
import { celebrate, toast } from '../../ui/kit';
import type { SimId } from './challenges';

/** Tracks the app-wide `.reduce-motion` class (set from the learner's prefs or the OS setting). */
export function useReducedMotion(): boolean {
  const get = () => typeof document !== 'undefined' && document.documentElement.classList.contains('reduce-motion');
  const [r, setR] = useState(get);
  useEffect(() => {
    const mo = new MutationObserver(() => setR(get()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return r;
}

/** Reduced motion: advance in bigger discrete jumps this often, with no easing. */
export const REDUCED_INTERVAL_MS = 500;

/**
 * Drives a fixed-timestep simulation while `running`. `onSteps(n)` is asked to advance n fixed steps.
 * Normal: requestAnimationFrame with an accumulator. Reduced motion: every 0.5 s, 0.5 s of steps at once.
 */
export function useSimLoop(running: boolean, dt: number, reduced: boolean, onSteps: (n: number) => void) {
  const cb = useRef(onSteps);
  useLayoutEffect(() => { cb.current = onSteps; });
  useEffect(() => {
    if (!running) return;
    if (reduced) {
      const n = Math.max(1, Math.round(REDUCED_INTERVAL_MS / 1000 / dt));
      const id = window.setInterval(() => cb.current(n), REDUCED_INTERVAL_MS);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      acc += Math.min(0.25, (now - last) / 1000); // avoid a huge jump after a background tab
      last = now;
      const n = Math.floor(acc / dt + 1e-9);
      if (n > 0) { acc -= n * dt; cb.current(n); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, dt, reduced]);
}

/** Classes 3–6 (and younger) get simpler wording and fewer controls; Classes 7–10 get formulas and graphs. */
export function useTier() {
  const { presentation } = useApp();
  const tier = presentation?.tier ?? 'senior';
  return { tier, simple: tier !== 'senior', allowTyping: presentation?.allowTyping ?? true, readAloud: presentation?.readAloud ?? false };
}

interface Saved<P> { params?: P; completed?: string[]; seenIntro?: boolean }

/**
 * Params + challenge completion, restored from and saved to `saveActivityState('lab:<sim>')`.
 * URL presets win over saved params (but completion is still restored).
 */
export function useLabState<P>(sim: SimId, sanitize: (raw: unknown) => P, preset: Partial<P> | null) {
  const { learner, saveActivityState, setLastActivity } = useApp();
  const key = `lab:${sim}`;
  const entry = learner.activities[key];
  const saved = (entry?.state ?? null) as Saved<P> | null;
  const [params, setParamsState] = useState<P>(() => (preset ? { ...sanitize(saved?.params), ...preset } : sanitize(saved?.params)));
  const [localDone, setLocalDone] = useState<string[]>([]);
  const [seenIntro, setSeenIntro] = useState(!!saved?.seenIntro);
  const dirty = useRef(false);
  const restored = useRef(!!entry);

  // Learner state loads asynchronously: restore once it arrives, unless the learner already changed something.
  useEffect(() => {
    if (restored.current || !entry) return;
    restored.current = true;
    if (!dirty.current && !preset) setParamsState(sanitize(saved?.params));
    if (saved?.seenIntro) setSeenIntro(true);
  }, [entry, saved, preset, sanitize]);

  // keyed by value: learner state gets a new identity after every save, which must not trigger another save
  const savedDoneKey = Array.isArray(saved?.completed) ? saved!.completed.filter((x): x is string => typeof x === 'string').join('|') : '';
  const completed = useMemo(() => [...new Set([...(savedDoneKey ? savedDoneKey.split('|') : []), ...localDone])].sort(), [savedDoneKey, localDone]);

  const setParams = useCallback((next: P | ((p: P) => P)) => { dirty.current = true; setParamsState(next); }, []);
  const markDone = useCallback((id: string) => { dirty.current = true; setLocalDone((d) => (d.includes(id) ? d : [...d, id])); }, []);
  const markIntroSeen = useCallback(() => { dirty.current = true; setSeenIntro(true); }, []);

  // debounced save
  const payloadJson = JSON.stringify({ params, completed, seenIntro });
  const lastSaved = useRef<string | null>(null);
  useEffect(() => {
    if (!dirty.current || payloadJson === lastSaved.current) return;
    const id = window.setTimeout(() => { lastSaved.current = payloadJson; void saveActivityState(key, JSON.parse(payloadJson)); }, 600);
    return () => window.clearTimeout(id);
  }, [payloadJson, key, saveActivityState]);

  // "continue where you left off" (once per visit)
  const labelRef = useRef(sim);
  useEffect(() => { setLastActivity(`/lab/${labelRef.current}`, `${labelRef.current[0].toUpperCase()}${labelRef.current.slice(1)} Lab`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { params, setParams, completed, markDone, seenIntro, markIntroSeen };
}

/** Records challenge answers as game attempts and awards `lab:<sim>:challenge` on first completion. */
export function useChallengeRewards(sim: SimId, completed: string[], markDone: (id: string) => void) {
  const { recordAttempt, award } = useApp();
  const doneRef = useRef(completed);
  useLayoutEffect(() => { doneRef.current = completed; });
  const record = useCallback((challengeId: string, correct: boolean, response: unknown, hintsUsed = 0) => {
    void recordAttempt({ questionId: `lab:${sim}:${challengeId}`, questionVersion: 1, objectiveId: `lab:${sim}`, mode: 'game', correct, response, hintsUsed }).catch(() => undefined);
  }, [recordAttempt, sim]);
  const complete = useCallback(async (challengeId: string, title: string, via: 'sim' | 'answer', response?: unknown, hintsUsed = 0) => {
    if (doneRef.current.includes(challengeId)) return;
    doneRef.current = [...doneRef.current, challengeId];
    markDone(challengeId);
    if (via === 'sim') record(challengeId, true, response ?? { via: 'sim' }, hintsUsed);
    toast(`Challenge complete: ${title}`);
    const first = await award(`lab:${sim}:challenge`).catch(() => false);
    if (first) celebrate();
  }, [award, markDone, record, sim]);
  return { record, complete };
}
