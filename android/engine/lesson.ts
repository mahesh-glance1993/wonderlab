// Engine functions for the lesson feature (called from Kotlin as "lesson.<name>").
// Every rule here is the website's own lesson logic (src/features/lesson/logic.ts), so the native lesson
// screens pick, adapt, grade and explain questions exactly like the website does. Kotlin only draws.
import { content } from './core';
import {
  activityLabel, activityPath, adaptForTier, allItems, buildTestSet, candidatesFor, describeVisual, formatAnswer, formatResponse,
  initialOrder, inputKindFor, isEmptyResponse, isResponse, keypadRows, learnStages, lineIndex, lineLabel, matchMistake, nextPracticeId,
  resolveDiagnostic, resolveQuestion, responseForChoice, restoreLessonState, similarId, summariseDiagnostic, unitChips, applyKey as applyKeyFn,
  type DiagItem,
} from '../../src/features/lesson/logic';
import { grade, newSeed, type AnswerSpec, type Response } from '../../src/shared/grading';
import { MASTERY_DISTINCT, difficultyFor, type MasteryState } from '../../src/shared/mastery';
import { recommend } from '../../src/shared/recommend';
import { diagnosticFor } from '../../src/content/index';
import { CLASSES, type ClassLevel, type Tier } from '../../src/shared/levels';
import type { Block, Localized, Objective, Question, Unit } from '../../src/shared/content';

// ---------------------------------------------------------------- helpers

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
const VISUAL_KINDS = new Set(['objects', 'fraction-bar', 'fraction-circle', 'number-line', 'shape', 'clock', 'coins', 'bar-graph', 'line-graph', 'grid-shape', 'triangle', 'emoji']);

/** Adds what the native renderer needs to every VisualSpec in a JSON tree: tick labels for number lines, alt text. */
function decorate<T>(x: T): T {
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (!v || typeof v !== 'object') return;
    const o = v as Record<string, unknown>;
    if (typeof o.kind === 'string' && VISUAL_KINDS.has(o.kind) && !('answer' in o)) {
      try { o.alt = describeVisual(o as never); } catch { /* keep going */ }
      if (o.kind === 'number-line' && typeof o.from === 'number' && typeof o.to === 'number' && typeof o.step === 'number' && o.step > 0) {
        const n = Math.max(1, Math.min(200, Math.round((o.to - o.from) / o.step)));
        o.labels = Array.from({ length: n + 1 }, (_, k) => lineLabel(k, o as { from: number; step: number }));
      }
    }
    if (o.type === 'activity' && typeof o.activityId === 'string') o.path = activityPath(o.activityId);
    for (const k of Object.keys(o)) walk(o[k]);
  };
  walk(x);
  return x;
}

function find(level: number, objectiveId: string): { u: Unit; o: Objective } | null {
  for (const u of content(level).units) { const o = u.objectives.find((x) => x.id === objectiveId); if (o) return { u, o }; }
  return null;
}

/** Resolves + tier-adapts a question. With an objective id, only that objective's items (like the lesson workspace);
 *  without one, every static item in the class (like the diagnostic). */
function resolveQ(level: number, objectiveId: string | null, qid: string, tier: Tier): Question | null {
  const c = content(level);
  const items = objectiveId ? (find(level, objectiveId)?.o.items ?? []) : allItems(c.units);
  const q = resolveQuestion(qid, items, c.templates);
  return q ? adaptForTier(q, tier) : null;
}

const blockSpeech = (blocks: Block[]): Localized => {
  const en: string[] = [], te: string[] = [];
  for (const b of blocks) {
    if (b.type === 'text' || b.type === 'tip') { en.push(b.text.en); te.push(b.text.te ?? b.text.en); }
    if (b.type === 'formula') { en.push(b.say ?? b.tex); te.push(b.say ?? b.tex); }
    if (b.type === 'steps') b.steps.forEach((x) => { en.push(x.en); te.push(x.te ?? x.en); });
  }
  return { en: en.join(' '), te: te.join(' ') };
};

// ---------------------------------------------------------------- lesson workspace

/** Everything the lesson screen needs for one objective (unitId given; objectiveId null → the unit's first). */
export function load(level: number, unitId: string, objectiveId: string | null) {
  const c = content(level);
  const u = c.units.find((x) => x.id === unitId);
  if (!u) return null;
  const o = objectiveId ? u.objectives.find((x) => x.id === objectiveId) : u.objectives[0];
  if (!o) return null;
  const seen = new Set<string>();
  const acts: { id: string; label?: Localized }[] = [];
  for (const b of o.intro) if (b.type === 'activity' && !seen.has(b.activityId)) { seen.add(b.activityId); acts.push({ id: b.activityId, label: b.label }); }
  for (const id of o.activities ?? []) if (!seen.has(id)) { seen.add(id); acts.push({ id }); }
  const activities = acts.filter((a) => activityPath(a.id)).map((a) => ({ id: a.id, path: activityPath(a.id), label: a.label ?? activityLabel(a.id), kind: a.id.startsWith('lab') ? 'lab' : a.id.startsWith('art') ? 'art' : 'game' }));
  const recap = o.intro.filter((b) => b.type === 'formula' || b.type === 'tip');
  const { items: _items, ...rest } = o;
  return decorate({
    unit: { id: u.id, title: u.title, subject: u.subject },
    objective: clone(rest),
    firstObjectiveId: u.objectives[0]?.id ?? null,
    stages: learnStages(o),
    activities,
    recap: clone(recap),
    introSay: blockSpeech(o.intro),
    recapSay: blockSpeech(recap),
    masteryDistinct: MASTERY_DISTINCT,
    hasQuestions: candidatesFor(o, c.templates).length > 0,
  });
}

/** One question ready to draw: the adapted question + everything derived from it by the website's logic. */
export function view(level: number, objectiveId: string | null, qid: string, tier: Tier) {
  const q = resolveQ(level, objectiveId, qid, tier);
  if (!q) return null;
  const kind = inputKindFor(q);
  const choiceResponses: Record<string, Response> = {};
  const choiceCorrect: Record<string, boolean> = {};
  for (const ch of q.choices ?? []) { const r = responseForChoice(q, ch.id); choiceResponses[ch.id] = r; choiceCorrect[ch.id] = grade(q.answer, r).correct; }
  let lineLabels: string[] = [];
  let lineCorrect: number | null = null;
  if (kind === 'numberline' && q.line) {
    const line = q.line;
    const n = Math.max(1, Math.min(200, Math.round((line.to - line.from) / line.step)));
    const asFrac = q.answer.kind === 'fraction';
    lineLabels = Array.from({ length: n + 1 }, (_, k) => lineLabel(k, line, asFrac));
    const cv = q.answer.kind === 'number' ? q.answer.value : q.answer.kind === 'fraction' ? q.answer.num / q.answer.den : null;
    lineCorrect = cv === null ? null : lineIndex(cv, line);
  }
  const a = q.answer;
  return decorate({
    q: clone(q),
    kind,
    initialOrder: initialOrder(q),
    units: unitChips(q),
    keypadRows: keypadRows(q.keypad, tier),
    stepUnits: (q.steps ?? []).map((st) => unitChips({ ...q, answer: st.answer })),
    stepAnswers: (q.steps ?? []).map((st) => formatAnswer(q, st.answer)),
    answerText: formatAnswer(q),
    answerKind: a.kind,
    choiceResponses,
    choiceCorrect,
    multiCorrect: a.kind === 'multi' ? a.correct : [],
    orderCorrect: a.kind === 'order' ? a.correct : [],
    matchPairs: a.kind === 'match' ? a.pairs : {},
    lineLabels,
    lineCorrect,
  });
}

/** The response that will be graded: an untouched 'order' item counts as its starting order. */
function effective(q: Question, r: Response | null): Response | null {
  if (!r && inputKindFor(q) === 'order') return { kind: 'order', value: initialOrder(q) };
  return r;
}

/** Grades an answer and builds the feedback the website shows (targeted mistake, "we read your answer as"). */
export function check(level: number, objectiveId: string | null, qid: string, tier: Tier, response: Response | null) {
  const q = resolveQ(level, objectiveId, qid, tier);
  if (!q) return null;
  const r = effective(q, isResponse(response) ? response : null);
  const res = grade(q.answer, r);
  const mistake = res.correct ? null : matchMistake(q, res, r);
  return {
    correct: res.correct,
    reason: res.reason ?? null,
    understood: res.understood ?? null,
    showUnderstood: !res.correct && !!res.understood && res.reason !== 'wrong' && inputKindFor(q) === 'typed',
    mistake,
    response: r,
    empty: isEmptyResponse(r),
    yourAnswer: formatResponse(q, r),
    correctAnswer: formatAnswer(q),
  };
}

/** True when an answer is non-empty (after the 'order' default). */
export function answerable(level: number, objectiveId: string | null, qid: string, tier: Tier, response: Response | null) {
  const q = resolveQ(level, objectiveId, qid, tier);
  return !!q && !isEmptyResponse(effective(q, isResponse(response) ? response : null));
}

/** Grades one intermediate typed step. */
export function gradeStep(level: number, objectiveId: string | null, qid: string, tier: Tier, index: number, value: string) {
  const q = resolveQ(level, objectiveId, qid, tier);
  const st = q?.steps?.[index];
  if (!st || !value.trim()) return false;
  return grade(st.answer as AnswerSpec, { kind: 'text', value }).correct;
}

/** A fresh question id at a target difficulty (avoiding solved static items and the previous source), like Workspace.fresh(). */
export function fresh(level: number, objectiveId: string, tier: Tier, target: 1 | 2 | 3, lastId: string | null, solved: string[] | null): string | null {
  const hit = find(level, objectiveId);
  if (!hit) return null;
  const cands = candidatesFor(hit.o, content(level).templates);
  for (let i = 0; i < 12; i++) {
    const id = nextPracticeId(cands, target, newSeed(), { lastId, solved: solved ?? [] });
    if (!id) return null;
    if (resolveQ(level, objectiveId, id, tier)) return id;
  }
  return null;
}

/** Next practice question for the learner's current mastery. */
export function nextPractice(level: number, objectiveId: string, tier: Tier, mastery: MasteryState | null, lastId: string | null) {
  return fresh(level, objectiveId, tier, difficultyFor(mastery ?? undefined), lastId, mastery?.distinctCorrect ?? []);
}

/** "Try a similar one" (same template with a new seed, else another item of the same difficulty). */
export function similar(level: number, objectiveId: string, tier: Tier, currentId: string, mastery: MasteryState | null) {
  const hit = find(level, objectiveId);
  if (!hit) return null;
  const cands = candidatesFor(hit.o, content(level).templates);
  const solved = mastery?.distinctCorrect ?? [];
  for (let i = 0; i < 8; i++) {
    const c = similarId(currentId, cands, newSeed(), solved);
    if (c && resolveQ(level, objectiveId, c, tier)) return c;
  }
  return nextPractice(level, objectiveId, tier, mastery, currentId);
}

/** A new fixed test set (or its size when `seed` is 1, like the website's intro card). */
export function buildTest(level: number, objectiveId: string, tier: Tier, seed?: number) {
  const hit = find(level, objectiveId);
  if (!hit) return { seed: 0, ids: [] as string[] };
  const s = seed ?? newSeed();
  const ids = buildTestSet(candidatesFor(hit.o, content(level).templates), s, { accept: (id) => !!resolveQ(level, objectiveId, id, tier) });
  return { seed: s, ids };
}

/** Defensive restore of a saved LessonState (same shape as the website's). */
export const restore = (raw: unknown) => restoreLessonState(raw);

/** On-screen keypad key (units use the website's unit parser). */
export const applyKey = (value: string, caret: number, key: string) => applyKeyFn({ value, caret }, key);

// ---------------------------------------------------------------- diagnostic

interface DiagState { v: 1; items: DiagItem[]; index: number; results: Record<string, boolean>; draft: Response | null; done: boolean }

export function restoreDiag(raw: unknown): DiagState | null {
  if (!raw || typeof raw !== 'object') return null;
  const x = raw as Record<string, unknown>;
  if (x.v !== 1 || !Array.isArray(x.items)) return null;
  const items = (x.items as unknown[]).filter((i): i is DiagItem => !!i && typeof i === 'object' && typeof (i as DiagItem).qid === 'string' && typeof (i as DiagItem).objectiveId === 'string' && typeof (i as DiagItem).unitId === 'string');
  const results: Record<string, boolean> = {};
  if (x.results && typeof x.results === 'object') for (const [k, v] of Object.entries(x.results)) if (typeof v === 'boolean') results[k] = v;
  const index = typeof x.index === 'number' ? Math.max(0, Math.min(items.length, Math.floor(x.index))) : 0;
  return { v: 1, items, index, results, draft: isResponse(x.draft) ? x.draft : null, done: x.done === true };
}

const diagIds = (level: number): string[] => { try { return diagnosticFor(level as ClassLevel) ?? []; } catch { return []; } };
export const diagnosticCount = (level: number) => diagIds(level).length;

/** Starts a diagnostic: resolved items the learner can answer at their tier. */
export function diagnosticStart(level: number, tier: Tier) {
  const c = content(level);
  return resolveDiagnostic(diagIds(level), c.units, c.templates, newSeed()).filter((it) => !!resolveQ(level, null, it.qid, tier));
}

export function diagnosticSummary(level: number, items: DiagItem[], results: Record<string, boolean>) {
  return summariseDiagnostic(items ?? [], results ?? {}).map((s) => ({ ...s, title: find(level, s.objectiveId)?.o.title ?? { en: s.objectiveId } }));
}

// ---------------------------------------------------------------- curriculum browser & recommendation

/** Light outline for the curriculum browser (no lesson bodies). */
export function curriculum(level: number) {
  const c = content(level);
  return {
    level,
    label: CLASSES[level as ClassLevel]?.label ?? `Class ${level}`,
    units: c.units.map((u) => ({
      id: u.id, subject: u.subject, title: u.title, enrichment: !u.source,
      source: u.source ? `${u.source.book}${u.source.chapterNo ? ` · Ch ${u.source.chapterNo}` : ''}` : null,
      objectives: u.objectives.map((o) => ({ id: o.id, title: o.title })),
    })),
  };
}

export const classLabels = () => CLASSES.map((c) => c.label);

/** "What should I learn next?" — the website's recommend() plus the practice queue. */
export function next(level: number, mastery: Record<string, MasteryState>, lastObjectiveId: string | null, nowSec?: number) {
  const units = content(level).units;
  const now = nowSec ?? Math.floor(Date.now() / 1000);
  const rec = recommend(units, mastery || {}, now, lastObjectiveId ?? undefined);
  const u = rec ? units.find((x) => x.id === rec.unitId) : undefined;
  const o = u?.objectives.find((x) => x.id === rec!.objectiveId);
  const due = units.flatMap((uu) => uu.objectives.map((oo) => ({ uu, oo })))
    .filter(({ oo }) => { const m = mastery?.[oo.id]; return !!m?.nextReviewAt && m.nextReviewAt <= Date.now() / 1000; })
    .map(({ uu, oo }) => ({ unitId: uu.id, objectiveId: oo.id, title: oo.title }));
  return {
    rec: rec && u && o ? { ...rec, unitTitle: u.title, objectiveTitle: o.title, mode: rec.kind === 'review' || rec.kind === 'continue' ? 'practice' : 'learn' } : null,
    due,
  };
}
