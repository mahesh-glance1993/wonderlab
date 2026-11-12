// Engine functions for the language courses (called from Kotlin as "language.<name>").
// Course content, rounds, hints, grading, badges and tracing scores all come from the website's own TypeScript
// (src/features/language/*), so the app teaches and marks exactly like the website.
import {
  BADGES, COURSES, PASS, answerText as answerTextFn, buildRound, check as checkFn, earnedUnitBadges, findObjective, findPassage, findTraceSet,
  findUnit, hintsFor, isCourse, levelsWithContent, roundSize, unitsFor, type ActivityMap,
} from '../../src/features/language/engine';
import { newSeed as newSeedFn } from '../../src/shared/grading';
import { GRID, TOLERANCE_RADIUS, TRACE_FONT, scoreTrace as scoreTraceFn, startPoint as startPointFn, type Tolerance } from '../../src/features/language/tracing';
import {
  CONSONANTS, GUNINTHAM_VOWELS, KEYBOARD_ROWS, LETTER_CARDS, SIGN_NAMES, VIRAMA, VOWEL_SIGNS, guninthamRow, showSign,
} from '../../src/features/language/telugu/script';
import { ALPHABET_CARDS } from '../../src/features/language/english/course';
import type { CourseId, Item, Script, Unit } from '../../src/features/language/types';

// ---- constants that live in React files on the website (util.ts / Builders.tsx). Kept identical: the Node test
// scripts/test-android-language.cjs compares them with the website source. ----
export const CLASS_NAMES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const ONSETS = ['b', 'c', 'd', 'f', 'h', 'm', 'p', 'r', 's', 't'];
const VOWELS_EN = ['a', 'e', 'i', 'o', 'u'];
const CODAS = ['t', 'n', 'g', 'p', 'd'];
const REAL = 'bat bad bag ban bet bed beg bid big bin bit bog bot bud bug bun but cat can cap cod cop cot cub cud cup cut dad den dig dim din dip dog dot dug fan fat fed fig fin fit fog fun hat had hen hid hip hit hog hop hot hug hut mad man map mat men met mid mop mud mug nap pan pat peg pen pet pig pin pit pod pop pot pun pup rag ran rap rat red rid rig rip rod rot rub rug run rut sad sag sat set sip sit sod sop sun sup tag tan tap ten tin tip top tot tub tug'.split(' ');
const OTTU_EXCLUDE = ['క్ష', 'ఱ', 'ఙ', 'ఞ'];

const scriptOf = (course: CourseId): Script => COURSES[course].script;
const tileText = (t: string, script: Script) => (script === 'te' ? showSign(t) : t);

function unitSummary(course: CourseId, u: Unit) {
  return {
    id: u.id, level: u.level, title: u.title, titleEn: u.titleEn,
    objectives: u.objectives.map((o) => ({ id: o.id, title: o.title, titleEn: o.titleEn })),
    trace: (u.trace || []).map((t) => findTraceSet(t)).filter((s) => !!s).map((s) => ({ id: s!.id, title: s!.title, titleEn: s!.titleEn })),
    read: (u.read || []).map((p) => findPassage(p)).filter((p) => !!p).map((p) => ({ id: p!.id, title: p!.title, titleEn: p!.titleEn })),
    badge: u.badge,
    course,
  };
}

/** Course chooser data. */
export function courses() {
  return (['telugu', 'english'] as CourseId[]).map((id) => ({ id, script: COURSES[id].script, title: COURSES[id].title, titleEn: COURSES[id].titleEn, levels: levelsWithContent(id) }));
}

export const classNames = () => CLASS_NAMES;
export const pass = () => PASS;

/** Course map for one class: units with objectives, tracing sets and read-alongs. null when the course does not exist. */
export function courseMap(course: string, level: number) {
  if (!isCourse(course)) return null;
  const C = COURSES[course];
  return { id: C.id, script: C.script, title: C.title, titleEn: C.titleEn, levels: levelsWithContent(course), units: unitsFor(course, level).map((u) => unitSummary(course, u)) };
}

export function unit(course: string, unitId: string) {
  if (!isCourse(course)) return null;
  const u = findUnit(course, unitId);
  return u ? unitSummary(course, u) : null;
}

/** Everything the objective screen needs (Learn content + items) and the next objective in the unit. */
export function objective(course: string, unitId: string, objectiveId: string) {
  if (!isCourse(course)) return null;
  const u = findUnit(course, unitId);
  const o = findObjective(course, unitId, objectiveId);
  if (!u || !o) return null;
  const next = u.objectives[u.objectives.findIndex((x) => x.id === o.id) + 1];
  return {
    course, script: scriptOf(course), courseTitleEn: COURSES[course].titleEn,
    unit: { id: u.id, level: u.level, title: u.title, titleEn: u.titleEn },
    objective: o,
    next: next ? { id: next.id, title: next.title, titleEn: next.titleEn } : null,
  };
}

export const newSeed = () => newSeedFn();
export const size = (mode: 'practice' | 'test', tier: string | undefined, available: number) => roundSize(mode, tier, available);

/** The deterministic round for a seed (same seed → same items and choice order), with hints and tile display text. */
export function round(course: string, unitId: string, objectiveId: string, mode: 'practice' | 'test', tier: string | undefined, seed: number) {
  if (!isCourse(course)) return null;
  const o = findObjective(course, unitId, objectiveId);
  if (!o) return null;
  const script = scriptOf(course);
  const n = roundSize(mode, tier, o.items.length);
  return buildRound(o, seed, n).map((r) => ({
    item: r.item,
    choices: r.choices,
    hints: hintsFor(r.item, r.choices),
    display: Object.fromEntries([...r.item.choices, ...r.item.answer].map((t) => [t, tileText(t, script)])),
    answerText: answerTextFn(r.item),
  }));
}

/** Grades one answer (string for choice/listen/type, string[] for build/order). */
export const check = (item: Item, value: string | string[] | null) => checkFn(item, value);
export const answerText = (item: Item) => answerTextFn(item);

/** Unit badges that are complete for this course, given the learner's activity states. */
export const earnedBadges = (course: string, acts: ActivityMap) => (isCourse(course) ? earnedUnitBadges(course, acts || {}) : []);
export const badges = () => BADGES;

/** A read-along passage (null when it is not in that course). */
export function passage(course: string, id: string) {
  const p = findPassage(id);
  if (!p || !isCourse(course) || p.course !== course) return null;
  return { ...p, script: scriptOf(course), className: CLASS_NAMES[p.level] };
}

/** A tracing set with the picture word for each letter (as on the website's trace page). */
export function traceSet(course: string, id: string) {
  const s = findTraceSet(id);
  if (!s || !isCourse(course) || s.course !== course) return null;
  const cards: Record<string, { word: string; pic: string; en: string }> = {};
  for (const l of s.letters) {
    const c = s.script === 'te' ? LETTER_CARDS[l] : ALPHABET_CARDS.find((x) => x.letter === l.toUpperCase());
    if (c) cards[l] = { word: c.word, pic: c.pic, en: c.en };
  }
  return { ...s, cards, grid: GRID, font: TRACE_FONT[s.script], tolerances: TOLERANCE_RADIUS };
}

const toMask = (s: string) => { const m = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) m[i] = s.charCodeAt(i) === 49 ? 1 : 0; return m; };

/** Masks are GRID×GRID strings of '0'/'1' (row-major). */
export const scoreTrace = (glyph: string, ink: string, tol: Tolerance) => scoreTraceFn(toMask(glyph), toMask(ink), GRID, GRID, tol);
export const startPoint = (glyph: string, script: 'te' | 'en') => startPointFn(toMask(glyph), GRID, GRID, script);

/** Learn-mode builders + the on-screen Telugu keyboard. */
export function builders() {
  return {
    consonants: [...CONSONANTS],
    guninthamVowels: [...GUNINTHAM_VOWELS],
    vowelSigns: VOWEL_SIGNS,
    vowelSignShown: Object.fromEntries(Object.entries(VOWEL_SIGNS).map(([v, s]) => [v, s ? showSign(s) : ''])),
    signNames: SIGN_NAMES,
    gunintham: Object.fromEntries(CONSONANTS.map((c) => [c, guninthamRow(c)])),
    ottuOptions: CONSONANTS.filter((x) => !OTTU_EXCLUDE.includes(x)),
    virama: VIRAMA,
    cvc: { onsets: ONSETS, vowels: VOWELS_EN, codas: CODAS, real: REAL },
    keyboard: KEYBOARD_ROWS.map((row) => row.map((k) => ({ key: k, show: showSign(k) }))),
  };
}
