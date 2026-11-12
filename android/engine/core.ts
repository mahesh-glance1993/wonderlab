// Core engine functions: classes, curriculum outline, question generation, grading, mastery, recommendations.
// Everything here is the same TypeScript the website runs, so the app and site always teach the same thing.
import { CLASSES, AGE_BANDS, AVATARS, AVATAR_EMOJI, SECURITY_QUESTIONS, presentationFor, tierForClass, suggestAgeBand, type ClassLevel, type AgeBand } from '../../src/shared/levels';
import { grade as gradeFn, type AnswerSpec, type Response } from '../../src/shared/grading';
import { applyAttempt as applyAttemptFn, emptyMastery as emptyMasteryFn, isMastered, difficultyFor, type MasteryState, type AttemptInput } from '../../src/shared/mastery';
import { recommend as recommendFn } from '../../src/shared/recommend';
import { applyOverrides, diagnosticFor, type ClassContent, type ContentOverride } from '../../src/content/index';
import { resolveQuestion } from '../../src/features/lesson/logic';
import { en } from '../../src/i18n/en';
import { te } from '../../src/i18n/te';
import { PACKS } from '../../src/shared/packs';
import nursery from '../../src/content/classes/nursery';
import lkg from '../../src/content/classes/lkg';
import ukg from '../../src/content/classes/ukg';
import c1 from '../../src/content/classes/c1';
import c2 from '../../src/content/classes/c2';
import c3 from '../../src/content/classes/c3';
import c4 from '../../src/content/classes/c4';
import c5 from '../../src/content/classes/c5';
import c6 from '../../src/content/classes/c6';
import c7 from '../../src/content/classes/c7';
import c8 from '../../src/content/classes/c8';
import c9 from '../../src/content/classes/c9';
import c10 from '../../src/content/classes/c10';

const RAW: ClassContent[] = [nursery, lkg, ukg, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10];
let overrides: ContentOverride[] = [];
const cache = new Map<number, ClassContent>();

/** Educator overrides fetched from /api/content/overrides (also cached offline by the app). */
export function setOverrides(list: ContentOverride[]) { overrides = Array.isArray(list) ? list : []; cache.clear(); return true; }

export function content(level: number): ClassContent {
  let c = cache.get(level);
  if (!c) { c = applyOverrides(RAW[level] ?? { units: [], templates: {} }, overrides); cache.set(level, c); }
  return c;
}

/** UI strings for a language (Telugu falls back to English per key). */
export const strings = (lang: 'en' | 'te') => (lang === 'te' ? { ...en, ...te } : en);
export const packs = () => PACKS.map(({ modules: _m, files: _f, ...p }) => p);
export const classes = () => CLASSES;
export const ageBands = () => AGE_BANDS;
export const avatars = () => AVATARS.map((id) => ({ id, emoji: AVATAR_EMOJI[id] }));
export const securityQuestions = () => SECURITY_QUESTIONS;
export const presentation = (level: ClassLevel, band: AgeBand) => presentationFor(level, band);
export const tier = (level: ClassLevel) => tierForClass(level);
export const suggestBand = (level: ClassLevel) => suggestAgeBand(level);

/** Units → objectives (serialisable: no generator functions). Templates are listed with their metadata. */
export function outline(level: number) {
  const c = content(level);
  const templates = Object.values(c.templates).map((t) => ({ id: t.id, objectiveId: t.objectiveId, difficulty: t.difficulty, version: t.version }));
  return { units: c.units, templates };
}

/** One objective with its unit (for lesson screens). */
export function objective(level: number, objectiveId: string) {
  for (const u of content(level).units) {
    const o = u.objectives.find((x) => x.id === objectiveId);
    if (o) return { unit: { id: u.id, title: u.title, subject: u.subject, classLevel: u.classLevel, source: u.source }, objective: o };
  }
  return null;
}

/** The class level that contains an objective (objective ids are unique across classes), or -1. */
export function levelOfObjective(objectiveId: string): number {
  for (let l = 0; l < RAW.length; l++) if (content(l).units.some((u) => u.objectives.some((o) => o.id === objectiveId))) return l;
  return -1;
}

/** Question by id: `templateId#seed` (generated) or a static item id. */
export function question(level: number, qid: string) {
  const c = content(level);
  const items = c.units.flatMap((u) => u.objectives.flatMap((o) => o.items ?? []));
  return resolveQuestion(qid, items, c.templates);
}
export const generate = (level: number, templateId: string, seed: number) => question(level, `${templateId}#${seed}`);

export const grade = (spec: AnswerSpec, r: Response | null) => gradeFn(spec, r);
export const applyAttempt = (m: MasteryState, a: AttemptInput) => applyAttemptFn(m, a);
export const emptyMastery = (objectiveId: string, t?: number) => emptyMasteryFn(objectiveId, t);
export const mastered = (m: MasteryState | undefined) => isMastered(m);
export const difficulty = (m: MasteryState | undefined) => difficultyFor(m);
export const recommend = (level: number, mastery: Record<string, MasteryState>, nowSec?: number, lastObjectiveId?: string) =>
  recommendFn(content(level).units, mastery || {}, nowSec ?? Math.floor(Date.now() / 1000), lastObjectiveId);
export const diagnostic = (level: ClassLevel) => diagnosticFor(level);
