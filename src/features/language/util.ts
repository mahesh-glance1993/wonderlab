// Non-component helpers for the language courses (hooks, constants, badge helpers).
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../lib/app';
import { hasVoice, speak } from '../../lib/audio';
import { toast } from '../../ui/kit';
import { BADGES, COURSES, earnedUnitBadges, type ActivityMap } from './engine';
import type { CourseId, Script } from './types';
import { showSign } from './telugu/script';

export const scriptOf = (course: CourseId): Script => COURSES[course].script;

/** Narration in a given script regardless of the UI language. Returns false when nothing could be spoken. */
export function useSay() {
  const { prefs } = useApp();
  const [teVoice, setTeVoice] = useState(() => (typeof window !== 'undefined' ? hasVoice('te') : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const f = () => setTeVoice(hasVoice('te'));
    f();
    speechSynthesis.addEventListener?.('voiceschanged', f);
    return () => speechSynthesis.removeEventListener?.('voiceschanged', f);
  }, []);
  const say = useCallback((text: string, script: Script) => {
    if (!prefs.narration || !text) return Promise.resolve(false);
    return speak(text.replace(/\n/g, ' '), script);
  }, [prefs.narration]);
  return { say, teVoice };
}

/** "Show in English" toggle, remembered on this device. */
export function useGloss(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(() => { try { return localStorage.getItem('wl-lang-gloss') === '1'; } catch { return false; } });
  const set = useCallback((v: boolean) => { setOn(v); try { localStorage.setItem('wl-lang-gloss', v ? '1' : '0'); } catch { /* private mode */ } }, []);
  return [on, set];
}

/** Display form of a tile / key (lone Telugu vowel signs on a dotted circle). */
export const tileText = (t: string, script: Script) => (script === 'te' ? showSign(t) : t);

/** Award unit badges that are now complete, with a toast. */
export async function awardUnitBadges(course: CourseId, acts: ActivityMap, award: (id: string) => Promise<boolean>) {
  for (const id of earnedUnitBadges(course, acts)) {
    if (await award(id)) toast(`Badge earned: ${BADGES.find((b) => b.id === id)?.title ?? id}`);
  }
}

export async function awardBadge(id: string, award: (id: string) => Promise<boolean>) {
  if (await award(id)) toast(`Badge earned: ${BADGES.find((b) => b.id === id)?.title ?? id}`);
}

export const CLASS_NAMES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
