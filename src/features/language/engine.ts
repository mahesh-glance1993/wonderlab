// Course engine (pure): grading, seeded rounds, hints, progress and badge rules.
import { grade, rng, type AnswerSpec, type Response } from '../../shared/grading';
import type { ClassLevel } from '../../shared/levels';
import type { Course, CourseId, Item, Objective, Passage, TraceSet, Unit } from './types';
import { TELUGU } from './telugu/course';
import { ENGLISH } from './english/course';
import { PASSAGES } from './passages';
import { TRACE_SETS } from './tracing';

export const COURSES: Record<CourseId, Course> = { telugu: TELUGU, english: ENGLISH };
export const isCourse = (c: string | undefined): c is CourseId => c === 'telugu' || c === 'english';

export const unitsFor = (course: CourseId, level: number): Unit[] => COURSES[course].units.filter((u) => u.level === level);
export const findUnit = (course: CourseId, unitId: string) => COURSES[course].units.find((u) => u.id === unitId);
export const findObjective = (course: CourseId, unitId: string, objectiveId: string) => findUnit(course, unitId)?.objectives.find((o) => o.id === objectiveId);
export const findPassage = (id: string): Passage | undefined => PASSAGES.find((p) => p.id === id);
export const findTraceSet = (id: string): TraceSet | undefined => TRACE_SETS.find((s) => s.id === id);

/** Keys used for saveActivityState / recordAttempt. */
export const objectiveKey = (course: CourseId, unitId: string, objectiveId: string) => `${course}/${unitId}/${objectiveId}`;
export const activityId = (key: string) => `lang:${key}`;
export const questionId = (key: string, itemId: string) => `lang:${key}/${itemId}`;

// ---------------- grading ----------------

const nfc = (s: string) => s.normalize('NFC');

export function specFor(item: Item): AnswerSpec {
  switch (item.type) {
    case 'choice':
    case 'listen':
      return { kind: 'choice', correct: item.answer[0] };
    case 'build':
    case 'order':
      return { kind: 'order', correct: item.answer.map(nfc) };
    case 'type':
      return { kind: 'text', accept: item.answer.map(nfc) };
  }
}

/** value: chosen option (string) or tapped tiles (string[]). */
export function responseFor(item: Item, value: string | string[]): Response {
  if (item.type === 'build' || item.type === 'order') return { kind: 'order', value: (Array.isArray(value) ? value : [value]).map(nfc) };
  const v = Array.isArray(value) ? value.join('') : value;
  if (item.type === 'type') return { kind: 'text', value: nfc(v) };
  return { kind: 'choice', value: v };
}

export function check(item: Item, value: string | string[] | undefined | null): boolean {
  if (value == null || (Array.isArray(value) && !value.length) || value === '') return false;
  const r = responseFor(item, value);
  if (grade(specFor(item), r).correct) return true;
  return item.type === 'order' && !!item.alts?.some((alt) => grade({ kind: 'order', correct: alt.map(nfc) }, r).correct);
}

/** Canonical answer text for review screens. */
export const answerText = (item: Item) => (item.type === 'build' ? item.answer.join('') : item.type === 'order' ? item.answer.join(' ') : item.answer[0]);

// ---------------- rounds ----------------

export interface RoundItem { item: Item; choices: string[] }

export function roundSize(mode: 'practice' | 'test', tier: string | undefined, available: number) {
  const want = tier === 'early' ? 5 : mode === 'test' ? 8 : 6;
  return Math.min(available, Math.max(5, want));
}

/** Deterministic round: the same seed always yields the same items and choice order (needed for resume + review). */
export function buildRound(obj: Objective, seed: number, size: number): RoundItem[] {
  const r = rng(seed);
  const items = r.shuffle(obj.items).slice(0, Math.min(size, obj.items.length));
  return items.map((item) => ({ item, choices: item.type === 'order' || item.type === 'build' ? shuffleNotSolved(r.shuffle(item.choices), item) : r.shuffle(item.choices) }));
}
/** Never present tiles already in the solved order. */
function shuffleNotSolved(tiles: string[], item: Item) {
  if (tiles.length > 1 && tiles.slice(0, item.answer.length).join('|') === item.answer.join('|')) return [...tiles.slice(1), tiles[0]];
  return tiles;
}

// ---------------- hints ----------------

export interface Hint { text: string; en?: string; eliminate?: string; reveal?: string }

/** Progressive hints: authored hints first, then a structural hint (remove a wrong option / show the first tile). */
export function hintsFor(item: Item, choices: string[]): Hint[] {
  const out: Hint[] = (item.hints || []).map((h, i) => ({ text: h, en: item.hintsEn?.[i] }));
  if (item.type === 'choice' || item.type === 'listen' || item.type === 'type') {
    const wrong = choices.filter((c) => !item.answer.includes(c));
    if (wrong.length > 1) out.push({ text: 'One wrong answer has been taken away.', eliminate: wrong[wrong.length - 1] });
  } else {
    out.push({ text: `The first part is “${item.answer[0]}”.`, reveal: item.answer[0] });
  }
  return out;
}

// ---------------- progress ----------------

export interface ObjectiveState {
  learned?: boolean;
  practiceBest?: number;
  testBest?: number;
  session?: Session;
}
export interface Session {
  mode: 'practice' | 'test';
  seed: number;
  index: number;
  answers: Record<string, string | string[]>;
  /** first-try correctness (practice) or graded result (test) */
  checked: Record<string, boolean>;
  /** practice: wrong tries, hints shown, solved items */
  tries: Record<string, number>;
  hints: Record<string, number>;
  solved: Record<string, boolean>;
  submitted: boolean;
  score?: number;
}
export const PASS = 0.8;
export const passed = (s: ObjectiveState | undefined) => !!s && Math.max(s.practiceBest ?? 0, s.testBest ?? 0) >= PASS;

export type ActivityMap = Record<string, { state: unknown; updatedAt: number }>;
export const objectiveState = (acts: ActivityMap, key: string) => acts[activityId(key)]?.state as ObjectiveState | undefined;

/** Unit badges whose every objective is now passed. */
export function earnedUnitBadges(course: CourseId, acts: ActivityMap): string[] {
  return COURSES[course].units.filter((u) => u.badge && u.objectives.every((o) => passed(objectiveState(acts, objectiveKey(course, u.id, o.id))))).map((u) => u.badge!.id);
}

export const BADGES: { id: string; title: string }[] = [
  ...TELUGU.units.filter((u) => u.badge).map((u) => u.badge!),
  ...ENGLISH.units.filter((u) => u.badge).map((u) => u.badge!),
  { id: 'lang:first-story', title: 'First story read' },
  { id: 'lang:first-trace-te', title: 'First Telugu letter traced' },
  { id: 'lang:first-trace-en', title: 'First English letter traced' },
];

/** Levels that have content for a course (0..12). */
export const levelsWithContent = (course: CourseId): ClassLevel[] => [...new Set(COURSES[course].units.map((u) => u.level))].sort((a, b) => a - b) as ClassLevel[];
