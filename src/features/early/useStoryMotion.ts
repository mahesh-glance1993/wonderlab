// Runs a story page animation with the Web Animations API (transform/opacity only) and plays its
// sound cues on the same clock. Pauses when the tab is hidden; reduced motion jumps to the final pose.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { sfx, type SfxHandle } from '../../lib/sfx';
import { due, finalPose, finalV, initialV, poseCss, tapDuration, toKeyframes, type Cue, type PageMotion, type Track, type VSet } from './data/motion';

export type MotionStatus = 'ready' | 'running' | 'paused' | 'done';

const canAnimate = (el: Element | null): el is SVGGElement => !!el && typeof (el as SVGGElement).animate === 'function';

export function useStoryMotion(pm: PageMotion | undefined, svgRef: RefObject<SVGSVGElement | null>, reduced: boolean) {
  const [status, setStatusState] = useState<MotionStatus>(() => (reduced || !pm ? 'done' : 'ready'));
  const [v, setV] = useState<Record<string, string>>(() => (reduced ? finalV(pm) : initialV(pm)));
  const st = useRef<MotionStatus>(status);
  const anims = useRef<Animation[]>([]);
  const extra = useRef<Animation[]>([]); // tap mini animations
  const sounds = useRef<SfxHandle[]>([]);
  const timers = useRef<number[]>([]);
  const t0 = useRef(0); // performance.now() at time 0 of the page clock (while running)
  const at = useRef(0); // page clock when paused
  const firedCues = useRef(new Set<number>());
  const firedSets = useRef(new Set<number>());
  const raf = useRef(0);
  const hiddenHold = useRef(false);

  const setStatus = useCallback((s: MotionStatus) => { st.current = s; setStatusState(s); }, []);
  const el = useCallback((id: string) => svgRef.current?.querySelector(`[data-anim="${CSS.escape(id)}"]`) ?? null, [svgRef]);
  const play = useCallback((name: Cue['sfx']) => { const h = sfx(name); if (h) { sounds.current.push(h); void h.done.then(() => { sounds.current = sounds.current.filter((x) => x !== h); }); } }, []);
  const stopSounds = useCallback(() => { sounds.current.forEach((h) => h.stop()); sounds.current = []; timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; }, []);
  const clock = () => (st.current === 'running' ? performance.now() - t0.current : at.current);

  const tick = useCallback(() => {
    if (!pm || st.current !== 'running') return;
    const t = performance.now() - t0.current;
    for (const c of due(pm.cues, t, firedCues.current)) if (t - c.t < 1500) play(c.sfx);
    const sets: VSet[] = due(pm.sets, t, firedSets.current);
    if (sets.length) setV((cur) => ({ ...cur, ...Object.fromEntries(sets.map((s) => [s.actor, s.v])) }));
    if (t >= pm.dur) { at.current = pm.dur; setStatus('done'); return; }
    raf.current = requestAnimationFrame(tick);
  }, [pm, play, setStatus]);

  // build the page animations (paused at time 0 so the first frame already shows the starting pose)
  useLayoutEffect(() => {
    anims.current = [];
    firedCues.current = new Set(); firedSets.current = new Set(); at.current = 0;
    if (!pm) return;
    for (const tr of pm.tracks) {
      const e = el(tr.actor);
      if (!canAnimate(e)) continue;
      if (reduced) { const f = poseCss(finalPose(tr)); e.animate([f, f], { duration: 0, fill: 'forwards' }); continue; }
      const a = e.animate(toKeyframes(tr, pm.dur), { duration: pm.dur, fill: 'both' });
      a.pause();
      a.currentTime = 0;
      anims.current.push(a);
    }
    const list = anims.current;
    return () => { cancelAnimationFrame(raf.current); list.forEach((a) => a.cancel()); };
  }, [pm, reduced, el]);

  const start = useCallback(() => {
    if (!pm || reduced || st.current !== 'ready') return;
    t0.current = performance.now() - at.current;
    anims.current.forEach((a) => a.play());
    setStatus('running');
    raf.current = requestAnimationFrame(tick);
  }, [pm, reduced, setStatus, tick]);

  const pause = useCallback(() => {
    stopSounds();
    extra.current.forEach((a) => a.pause());
    if (st.current !== 'running') return;
    at.current = clock();
    cancelAnimationFrame(raf.current);
    anims.current.forEach((a) => a.pause());
    setStatus('paused');
  }, [setStatus, stopSounds]);

  const resume = useCallback(() => {
    extra.current.forEach((a) => { if (a.playState === 'paused') a.play(); });
    if (st.current !== 'paused') return;
    t0.current = performance.now() - at.current;
    anims.current.forEach((a) => a.play());
    setStatus('running');
    raf.current = requestAnimationFrame(tick);
  }, [setStatus, tick]);

  /** Back to the starting pose, ready to start again (call start, usually when narration begins). */
  const reset = useCallback(() => {
    stopSounds();
    cancelAnimationFrame(raf.current);
    if (!pm || reduced) return;
    at.current = 0; firedCues.current = new Set(); firedSets.current = new Set();
    anims.current.forEach((a) => { a.pause(); a.currentTime = 0; });
    setV(initialV(pm));
    setStatus('ready');
  }, [pm, reduced, setStatus, stopSounds]);

  /** Mini animation + sounds for a tap (or '@done'). Returns false when the page has none for this key. */
  const tap = useCallback((key: string) => {
    const tm = pm?.tap?.[key];
    if (!tm) return false;
    for (const tr of tm.tracks as Track[]) {
      const e = el(tr.actor);
      if (!canAnimate(e)) continue;
      const end = Math.max(1, tr.keys[tr.keys.length - 1]?.t ?? 1);
      if (reduced) { const f = poseCss(finalPose(tr)); e.animate([f, f], { duration: 0, fill: 'forwards' }); continue; }
      const a = e.animate(toKeyframes(tr, end), { duration: end, fill: 'forwards' });
      extra.current.push(a);
      void a.finished.then(() => { extra.current = extra.current.filter((x) => x !== a); }).catch(() => undefined);
    }
    for (const c of tm.cues || []) {
      if (c.t <= 0) play(c.sfx);
      else timers.current.push(window.setTimeout(() => play(c.sfx), c.t));
    }
    return true;
  }, [pm, reduced, el, play]);

  // pause while the tab is hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && st.current === 'running') { hiddenHold.current = true; pause(); }
      else if (!document.hidden && hiddenHold.current) { hiddenHold.current = false; resume(); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [pause, resume]);

  // stop sounds and mini animations when the page goes away
  useEffect(() => () => { stopSounds(); cancelAnimationFrame(raf.current); extra.current.forEach((a) => a.cancel()); }, [stopSounds]);

  return { status, v, start, pause, resume, reset, tap, tapDelay: (id: string) => tapDuration(pm?.tap?.[id]) };
}
