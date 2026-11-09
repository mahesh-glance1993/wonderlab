// Pure lesson-workspace logic (no DOM, no React) so it can be unit tested.
import type { Choice, Localized, Objective, Question, Template, Unit, VisualSpec } from '../../shared/content';
import { normaliseInput, parseRational, reduce, rng, splitUnit, unitInfo, type AnswerSpec, type GradeResult, type Response } from '../../shared/grading';
import type { Tier } from '../../shared/levels';

// ---------------------------------------------------------------- modes

export type Mode = 'learn' | 'practice' | 'test';
export const MODES: readonly Mode[] = ['learn', 'practice', 'test'];
export const parseMode = (s: string | null | undefined): Mode | null => (s === 'learn' || s === 'practice' || s === 'test' ? s : null);

// ---------------------------------------------------------------- hashing

/** FNV-1a — stable small hash used for deterministic shuffles of a given question. */
export function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

// ---------------------------------------------------------------- question ids

export const questionId = (templateId: string, seed: number) => `${templateId}#${seed}`;

export function parseQuestionId(id: string): { templateId: string; seed: number } | { itemId: string } {
  const i = id.lastIndexOf('#');
  if (i > 0) {
    const tail = id.slice(i + 1);
    if (/^\d+$/.test(tail)) return { templateId: id.slice(0, i), seed: Number(tail) };
  }
  return { itemId: id };
}

/** Rebuilds a question from its id: `${templateId}#${seed}` (deterministic) or a static item id. */
export function resolveQuestion(id: string, items: readonly Question[], templates: Record<string, Template>): Question | null {
  const p = parseQuestionId(id);
  if ('templateId' in p) {
    const t = templates[p.templateId];
    if (!t) return null;
    try {
      const q = t.generate(rng(p.seed), p.seed);
      return { ...q, id, version: q.version ?? t.version };
    } catch {
      return null;
    }
  }
  return items.find((q) => q.id === p.itemId) ?? null;
}

// ---------------------------------------------------------------- adaptive picking

export interface Candidate { id: string; kind: 'template' | 'item'; difficulty: 1 | 2 | 3 }

export function candidatesFor(o: Objective, templates: Record<string, Template>): Candidate[] {
  const out: Candidate[] = [];
  for (const id of o.templates) if (templates[id]) out.push({ id, kind: 'template', difficulty: templates[id].difficulty });
  for (const q of o.items ?? []) out.push({ id: q.id, kind: 'item', difficulty: q.difficulty });
  return out;
}

/** Picks the candidate closest to the target difficulty; random among ties; avoids ids in `avoid` when possible. */
export function pickCandidate(cands: readonly Candidate[], target: 1 | 2 | 3, rand: () => number, avoid: readonly string[] = []): Candidate | null {
  if (!cands.length) return null;
  let pool = cands.filter((c) => !avoid.includes(c.id));
  if (!pool.length) pool = [...cands];
  const best = Math.min(...pool.map((c) => Math.abs(c.difficulty - target)));
  const near = pool.filter((c) => Math.abs(c.difficulty - target) === best);
  return near[Math.min(near.length - 1, Math.floor(rand() * near.length))];
}

/** The template/item id behind a question id (templates share an id across seeds). */
export const sourceOf = (qid: string) => { const p = parseQuestionId(qid); return 'templateId' in p ? p.templateId : p.itemId; };

/**
 * Next practice question id. Fresh seed for templates; static items already answered correctly
 * (`solved`) and the source of the previous question (`lastId`) are avoided when alternatives exist.
 */
export function nextPracticeId(cands: readonly Candidate[], target: 1 | 2 | 3, seed: number, opts: { lastId?: string | null; solved?: readonly string[]; rand?: () => number } = {}): string | null {
  const rand = opts.rand ?? rng(seed ^ 0x9e3779b9).next;
  const avoid = [...(opts.solved ?? []).filter((id) => cands.some((c) => c.kind === 'item' && c.id === id))];
  if (opts.lastId) avoid.push(sourceOf(opts.lastId));
  const c = pickCandidate(cands, target, rand, avoid);
  if (!c) return null;
  return c.kind === 'template' ? questionId(c.id, seed) : c.id;
}

/** "Try a similar one": same template with a new seed, or another item of the same difficulty. */
export function similarId(currentId: string, cands: readonly Candidate[], seed: number, solved: readonly string[] = []): string | null {
  const p = parseQuestionId(currentId);
  if ('templateId' in p && cands.some((c) => c.kind === 'template' && c.id === p.templateId)) {
    return questionId(p.templateId, seed === p.seed ? seed + 1 : seed);
  }
  const cur = cands.find((c) => c.id === sourceOf(currentId));
  return nextPracticeId(cands, cur?.difficulty ?? 1, seed, { lastId: currentId, solved });
}

/** Difficulty spread for a test of n questions, e.g. 6 → [1,1,2,2,3,3]. */
export function testTargets(n: number): (1 | 2 | 3)[] {
  return Array.from({ length: n }, (_, i) => (Math.min(3, 1 + Math.floor((i * 3) / n)) as 1 | 2 | 3));
}

export const TEST_MIN = 5, TEST_MAX = 8, TEST_DEFAULT = 6;

/**
 * Builds a fixed, deterministic test set (same seed → same questions) of TEST_MIN..TEST_MAX questions,
 * spread across difficulties, with no duplicate ids. `accept` can reject questions the learner can't
 * answer (e.g. typing for early learners).
 */
export function buildTestSet(cands: readonly Candidate[], seed: number, opts: { size?: number; accept?: (qid: string) => boolean } = {}): string[] {
  if (!cands.length) return [];
  const size = Math.max(TEST_MIN, Math.min(TEST_MAX, opts.size ?? TEST_DEFAULT));
  const r = rng(seed);
  const out: string[] = [];
  const usedSources: string[] = [];
  const items = cands.filter((c) => c.kind === 'item');
  const hasTemplates = cands.some((c) => c.kind === 'template');
  // without templates we can only ask each static item once
  const maxQuestions = hasTemplates ? size : Math.min(size, items.length);
  for (const target of testTargets(size)) {
    if (out.length >= maxQuestions) break;
    for (let tries = 0; tries < 12; tries++) {
      // avoid reusing a source until every candidate has been used once; never reuse static items
      const avoid = usedSources.length < cands.length ? usedSources : items.filter((c) => usedSources.includes(c.id)).map((c) => c.id);
      const c = pickCandidate(cands, target, r.next, avoid);
      if (!c) break;
      if (c.kind === 'item' && usedSources.includes(c.id)) continue;
      const id = c.kind === 'template' ? questionId(c.id, r.int(1, 2 ** 31 - 2)) : c.id;
      if (out.includes(id) || (opts.accept && !opts.accept(id))) { if (c.kind === 'item') usedSources.push(c.id); continue; }
      out.push(id);
      usedSources.push(c.id);
      break;
    }
  }
  return out;
}

// ---------------------------------------------------------------- input kinds & tier adaptation

export type InputKind = 'choice' | 'multi' | 'match' | 'order' | 'numberline' | 'count' | 'typed';

export function inputKindFor(q: Question): InputKind {
  if (q.type === 'number-line' && q.line) return 'numberline';
  switch (q.answer.kind) {
    case 'multi': return 'multi';
    case 'match': return 'match';
    case 'order': return 'order';
    case 'choice': return 'choice';
    default: break;
  }
  if (q.choices?.length) return 'choice';
  if (q.type === 'count') return 'count';
  return 'typed';
}

const fmtNum = (v: number) => String(+v.toPrecision(10));

/** Multiple-choice options generated from a numeric/fraction answer so early learners never type. */
export function generatedChoices(spec: AnswerSpec, qid: string): Choice[] | null {
  let labels: string[] = [];
  if (spec.kind === 'number') {
    const v = spec.value;
    const step = Number.isInteger(v) ? 1 : Math.abs(v) < 1 ? 0.1 : 0.5;
    const opts = [v, v + step, v - step >= 0 || v < 0 ? v - step : v + 2 * step, v + 2 * step];
    const unit = spec.unit && spec.requireUnit ? ` ${spec.unit}` : '';
    labels = [...new Set(opts.map((x) => fmtNum(x) + unit))].slice(0, 3);
  } else if (spec.kind === 'fraction') {
    const t = spec.requireLowest ? reduce({ num: spec.num, den: spec.den }) : { num: spec.num, den: spec.den };
    const opts = [`${t.num}/${t.den}`, `${t.num + 1}/${t.den}`, t.num !== 0 && t.num !== t.den ? `${t.den}/${t.num}` : `${t.num}/${t.den + 1}`, `${t.num}/${t.den + 1}`];
    labels = [...new Set(opts)].slice(0, 3);
  } else if (spec.kind === 'text' && spec.accept.length) {
    return null; // no safe distractors for free text
  } else return null;
  const r = rng(hashStr(qid));
  return r.shuffle(labels).map((l, i) => ({ id: `g${i}`, label: { en: l } }));
}

/**
 * Adjusts a question to the learner's tier. Early learners get choices instead of typing and
 * no intermediate typed steps; returns null when the question can't be offered without typing.
 */
export function adaptForTier(q: Question, tier: Tier): Question | null {
  if (tier !== 'early') return q;
  const base: Question = { ...q, steps: undefined, keypad: undefined };
  if (inputKindFor(base) !== 'typed') return base;
  const choices = generatedChoices(q.answer, q.id);
  return choices ? { ...base, type: q.type === 'spoken' ? 'spoken' : 'mcq', choices } : null;
}

/** Response for tapping a choice: the id for choice answers, otherwise the label as typed text. */
export function responseForChoice(q: Question, choiceId: string): Response {
  if (q.answer.kind === 'choice') return { kind: 'choice', value: choiceId };
  const c = q.choices?.find((x) => x.id === choiceId);
  return { kind: 'text', value: c ? c.label.en : choiceId };
}
/** Which choice id a stored response corresponds to (for highlighting). */
export function choiceIdOf(q: Question, r: Response | null): string | null {
  if (!r) return null;
  if (r.kind === 'choice') return r.value;
  if (r.kind === 'text') return q.choices?.find((c) => c.label.en === r.value)?.id ?? null;
  return null;
}

export function isEmptyResponse(r: Response | null | undefined): boolean {
  if (!r) return true;
  switch (r.kind) {
    case 'choice': case 'text': return !r.value.trim();
    case 'multi': return r.value.length === 0;
    case 'order': return r.value.length === 0;
    case 'match': return Object.keys(r.value).length === 0;
  }
}

/** Starting order for 'order' items: deterministic shuffle that is never already correct. */
export function initialOrder(q: Question): string[] {
  const ids = (q.choices ?? []).map((c) => c.id);
  if (ids.length < 2) return ids;
  const out = rng(hashStr(q.id)).shuffle(ids);
  const correct = q.answer.kind === 'order' ? q.answer.correct : [];
  if (out.join('|') === correct.join('|')) out.push(out.shift()!);
  return out;
}

// ---------------------------------------------------------------- number line

export const decimalsOf = (n: number) => { const s = String(n); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };
export function snapToStep(v: number, line: { from: number; to: number; step: number }): number {
  const { from, to, step } = line;
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const clamped = Math.max(lo, Math.min(hi, v));
  const snapped = from + Math.round((clamped - from) / step) * step;
  return +Math.max(lo, Math.min(hi, snapped)).toFixed(Math.max(decimalsOf(step), decimalsOf(from)));
}

/** 1/step when it is a whole number (e.g. step 1/8 -> 8), else null. */
export function lineDenominator(step: number): number | null {
  if (!(step > 0)) return null;
  const d = 1 / step, r = Math.round(d);
  return r >= 1 && Math.abs(d - r) < 1e-9 ? r : null;
}
const terminates = (d: number) => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
/** Label for tick k on a line; fractions when asked or when the decimal would not terminate. */
export function lineLabel(k: number, line: { from: number; step: number }, fractions = false): string {
  const D = lineDenominator(line.step);
  if (D && D > 1 && Number.isInteger(line.from) && (fractions || !terminates(D))) {
    const t = reduce({ num: line.from * D + k, den: D });
    return t.den === 1 ? String(t.num) : `${t.num}/${t.den}`;
  }
  return fmtNum(line.from + k * line.step);
}
/** Index of the tick nearest to a value (clamped to the line). */
export function lineIndex(v: number, line: { from: number; to: number; step: number }): number {
  const n = Math.max(1, Math.round((line.to - line.from) / line.step));
  return Math.max(0, Math.min(n, Math.round((v - line.from) / line.step)));
}
/** Value of a number-line response (accepts "3/8", "0.375", "-4"). */
export function lineResponseValue(r: Response | null): number | null {
  if (!r || r.kind !== 'text' || !r.value.trim()) return null;
  const q = parseRational(r.value);
  return q ? q.num / q.den : null;
}

// ---------------------------------------------------------------- feedback

const norm = (s: string) => normaliseInput(s).toLowerCase().replace(/\s+/g, '');
const REASONS = new Set(['empty', 'unparsable', 'wrong-value', 'missing-unit', 'wrong-unit', 'not-lowest', 'wrong']);

function responseKeys(q: Question, r: Response | null): string[] {
  if (!r) return [];
  switch (r.kind) {
    case 'text': { const { num } = splitUnit(r.value); return [r.value, num]; }
    case 'choice': { const c = q.choices?.find((x) => x.id === r.value); return c ? [r.value, c.label.en] : [r.value]; }
    case 'multi': return [[...r.value].sort().join(',')];
    case 'order': return [r.value.join(',')];
    case 'match': return [Object.entries(r.value).sort().map(([a, b]) => `${a}:${b}`).join(',')];
  }
}

/**
 * Targeted feedback: `question.mistakes[].when` is matched first against the learner's value
 * (what grading understood, the raw answer, chosen id/label — numerically equal values match),
 * then against the grading reason (e.g. "not-lowest", "missing-unit").
 */
export function matchMistake(q: Question, result: GradeResult, r: Response | null): Localized | null {
  if (result.correct || !q.mistakes?.length) return null;
  const values = [result.understood ?? '', ...responseKeys(q, r)].filter(Boolean);
  const normed = new Set(values.map(norm));
  const rats = values.map((v) => parseRational(splitUnit(v).num)).filter((x): x is NonNullable<typeof x> => !!x);
  for (const m of q.mistakes) {
    if (REASONS.has(m.when)) continue;
    if (normed.has(norm(m.when))) return m.explain;
    const w = parseRational(m.when);
    if (w && rats.some((x) => x.num * w.den === w.num * x.den)) return m.explain;
  }
  for (const m of q.mistakes) if (result.reason && m.when === result.reason) return m.explain;
  return null;
}

// ---------------------------------------------------------------- formatting answers

const labelIn = (q: Question, id: string) =>
  [...(q.choices ?? []), ...(q.left ?? []), ...(q.right ?? [])].find((c) => c.id === id)?.label.en ?? id;

export function formatAnswer(q: Question, spec: AnswerSpec = q.answer): string {
  switch (spec.kind) {
    case 'choice': return labelIn(q, spec.correct);
    case 'multi': return spec.correct.map((id) => labelIn(q, id)).join(', ');
    case 'order': return spec.correct.map((id) => labelIn(q, id)).join(' → ');
    case 'match': return Object.entries(spec.pairs).map(([a, b]) => `${labelIn(q, a)} — ${labelIn(q, b)}`).join('; ');
    case 'number': return `${fmtNum(spec.value)}${spec.unit ? ' ' + spec.unit : ''}`;
    case 'fraction': { const t = reduce({ num: spec.num, den: spec.den }); return t.den === 1 ? String(t.num) : `${t.num}/${t.den}`; }
    case 'text': case 'expression': return spec.accept[0] ?? '';
  }
}

export function formatResponse(q: Question, r: Response | null | undefined): string {
  if (!r || isEmptyResponse(r)) return '';
  switch (r.kind) {
    case 'choice': return labelIn(q, r.value);
    case 'text': return r.value.trim();
    case 'multi': return r.value.map((id) => labelIn(q, id)).join(', ');
    case 'order': return r.value.map((id) => labelIn(q, id)).join(' → ');
    case 'match': return Object.entries(r.value).map(([a, b]) => `${labelIn(q, a)} — ${labelIn(q, b)}`).join('; ');
  }
}

// ---------------------------------------------------------------- keypad

export interface KeyState { value: string; caret: number }
export const DEFAULT_UNITS = ['m', 's', 'm/s', 'N', 'J', 'W', 'V', 'A', 'Ω', '₹', 'cm', 'kg'];

const KEY_TEXT: Record<string, string> = {
  frac: '/', dot: '.', minus: '-', pow: '^', sqrt: '√(', pi: 'π', times: '×', div: '÷', open: '(', close: ')', space: ' ', eq: '=', plus: '+',
};

/** Sets (or toggles off) a trailing unit: "25" + m/s → "25 m/s"; "25 cm" + m → "25 m". */
export function setUnit(value: string, unit: string): string {
  const v = value.trim();
  const { num, unit: cur } = splitUnit(v);
  const hasUnit = !!cur && !!unitInfo(cur) && num !== '';
  const base = hasUnit ? num : v;
  if (hasUnit && (cur === unit || normaliseInput(cur) === normaliseInput(unit) || (cur === '₹' && unit === '₹'))) return base;
  return base ? `${base} ${unit}` : unit;
}

/**
 * Applies an on-screen keypad key. Keys: '0'..'9', letters 'x'/'y', named keys in KEY_TEXT,
 * 'back', 'clear', 'left', 'right', 'unit:<u>'.
 */
export function applyKey(s: KeyState, key: string): KeyState {
  const caret = Math.max(0, Math.min(s.value.length, s.caret));
  if (key === 'back') return caret === 0 ? { value: s.value, caret } : { value: s.value.slice(0, caret - 1) + s.value.slice(caret), caret: caret - 1 };
  if (key === 'clear') return { value: '', caret: 0 };
  if (key === 'left') return { value: s.value, caret: Math.max(0, caret - 1) };
  if (key === 'right') return { value: s.value, caret: Math.min(s.value.length, caret + 1) };
  if (key.startsWith('unit:')) { const value = setUnit(s.value, key.slice(5)); return { value, caret: value.length }; }
  const text = KEY_TEXT[key] ?? (/^[0-9a-z]$/i.test(key) ? key : '');
  if (!text) return { value: s.value, caret };
  return { value: s.value.slice(0, caret) + text + s.value.slice(caret), caret: caret + text.length };
}

/** Keypad text → the string handed to grade() (grading normalises ×, ÷, − and superscripts itself). */
export const keypadAnswer = (value: string) => value.replace(/\s+/g, ' ').trim();

export function keypadRows(kind: Question['keypad'], tier: Tier): string[][] {
  const rows = [['7', '8', '9', 'back'], ['4', '5', '6', 'minus'], ['1', '2', '3', 'dot'], ['0', 'frac', 'space', 'clear']];
  if (kind === 'algebra' || tier === 'senior' || tier === 'middle') rows.push(['pow', 'sqrt', 'pi', 'times', 'div', 'open', 'close']);
  if (kind === 'algebra') rows.push(['x', 'y', 'plus', 'eq', 'left', 'right']);
  return rows;
}
export function unitChips(q: Question): string[] {
  const extra = [q.unitHint, q.answer.kind === 'number' ? q.answer.unit : undefined].filter((u): u is string => !!u && !!unitInfo(u));
  const show = q.keypad === 'units' || extra.length > 0;
  if (!show) return [];
  return [...new Set([...extra, ...DEFAULT_UNITS])];
}
export const KEY_LABEL: Record<string, string> = {
  back: '⌫', clear: 'C', minus: '−', dot: '.', frac: 'a/b', space: '␣', pow: 'xⁿ', sqrt: '√', pi: 'π', times: '×', div: '÷', open: '(', close: ')', eq: '=', plus: '+', left: '◀', right: '▶',
};
export const KEY_NAME: Record<string, string> = {
  back: 'Delete', clear: 'Clear', minus: 'Minus', dot: 'Decimal point', frac: 'Fraction bar', space: 'Space (mixed number)', pow: 'Power', sqrt: 'Square root', pi: 'Pi', times: 'Times', div: 'Divide', open: 'Open bracket', close: 'Close bracket', eq: 'Equals', plus: 'Plus', left: 'Move left', right: 'Move right',
};

// ---------------------------------------------------------------- lesson state (save / restore)

export interface StepState { values: string[]; ok: boolean[] }
export interface QState { qid: string; draft: Response | null; hints: number; checked: boolean; steps: StepState }
export interface TestState { seed: number; ids: string[]; index: number; answers: Record<string, Response>; submitted: boolean; recorded: boolean }
export interface LessonState {
  v: 1;
  mode: Mode;
  learn: { step: number; revealed: number; q: QState | null };
  practice: { q: QState | null; count: number };
  test: TestState | null;
}

export const newQState = (qid: string): QState => ({ qid, draft: null, hints: 0, checked: false, steps: { values: [], ok: [] } });
export const emptyLessonState = (mode: Mode = 'learn'): LessonState => ({ v: 1, mode, learn: { step: 0, revealed: 0, q: null }, practice: { q: null, count: 0 }, test: null });

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const isStrArr = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');
const nat = (x: unknown, d = 0) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? Math.floor(x) : d);

export function isResponse(x: unknown): x is Response {
  if (!isObj(x)) return false;
  switch (x.kind) {
    case 'choice': case 'text': return typeof x.value === 'string';
    case 'multi': case 'order': return isStrArr(x.value);
    case 'match': return isObj(x.value) && Object.values(x.value).every((v) => typeof v === 'string');
    default: return false;
  }
}
function restoreQ(x: unknown): QState | null {
  if (!isObj(x) || typeof x.qid !== 'string' || !x.qid) return null;
  const st = isObj(x.steps) ? x.steps : {};
  return {
    qid: x.qid,
    draft: isResponse(x.draft) ? x.draft : null,
    hints: nat(x.hints),
    checked: x.checked === true,
    steps: { values: isStrArr(st.values) ? st.values : [], ok: Array.isArray(st.ok) ? st.ok.map((b) => b === true) : [] },
  };
}
function restoreTest(x: unknown): TestState | null {
  if (!isObj(x) || !isStrArr(x.ids) || !x.ids.length) return null;
  const answers: Record<string, Response> = {};
  if (isObj(x.answers)) for (const [k, v] of Object.entries(x.answers)) if (x.ids.includes(k) && isResponse(v)) answers[k] = v;
  return { seed: nat(x.seed), ids: x.ids, index: Math.min(nat(x.index), x.ids.length - 1), answers, submitted: x.submitted === true, recorded: x.recorded === true };
}

/** Defensive restore: anything malformed falls back to defaults rather than breaking the lesson. */
export function restoreLessonState(raw: unknown): LessonState {
  const d = emptyLessonState();
  if (!isObj(raw) || raw.v !== 1) return d;
  const learn = isObj(raw.learn) ? raw.learn : {};
  const practice = isObj(raw.practice) ? raw.practice : {};
  return {
    v: 1,
    mode: parseMode(raw.mode as string) ?? 'learn',
    learn: { step: nat(learn.step), revealed: nat(learn.revealed), q: restoreQ(learn.q) },
    practice: { q: restoreQ(practice.q), count: nat(practice.count) },
    test: restoreTest(raw.test),
  };
}
/** JSON-safe copy for saveLessonState. */
export const serialiseLessonState = (s: LessonState): unknown => JSON.parse(JSON.stringify(s));

// ---------------------------------------------------------------- learn-mode sequence

export type LearnStage = { kind: 'intro' } | { kind: 'example'; index: number } | { kind: 'try' } | { kind: 'review' };
export function learnStages(o: Objective): LearnStage[] {
  const s: LearnStage[] = [];
  if (o.intro.length) s.push({ kind: 'intro' });
  o.examples.forEach((_, index) => s.push({ kind: 'example', index }));
  s.push({ kind: 'try' }, { kind: 'review' });
  return s;
}

// ---------------------------------------------------------------- linked activities

const ACT_BASE: Record<string, string> = { lab: '/lab/', game: '/games/', games: '/games/', art: '/art/' };
/** `lab:forces?mass=5&force=20` → `/lab/forces?mass=5&force=20`; `game:fractions` → `/games/fractions`. */
export function activityPath(id: string): string | null {
  const m = id.trim().match(/^(lab|games?|art):([A-Za-z0-9_\-/]+)(\?[^#\s]*)?$/);
  if (!m) return null;
  return ACT_BASE[m[1]] + m[2] + (m[3] ?? '');
}
export function activityLabel(id: string): Localized {
  const m = id.match(/^(lab|games?|art):([^?]+)/);
  const name = m ? m[2].replace(/[-_/]+/g, ' ').trim() : id;
  const kind = m?.[1];
  if (kind === 'lab') return { en: `Try it in the lab: ${name}`, te: `ప్రయోగశాలలో ప్రయత్నించు: ${name}` };
  if (kind === 'art') return { en: `Draw it: ${name}`, te: `బొమ్మ గీయి: ${name}` };
  return { en: `Play a game: ${name}`, te: `ఆట ఆడు: ${name}` };
}

// ---------------------------------------------------------------- visuals (text alternatives)

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
export function describeVisual(v: VisualSpec): string {
  switch (v.kind) {
    case 'objects': return v.groupsOf && v.groupsOf > 0
      ? `${v.count} ${v.emoji} in ${Math.ceil(v.count / v.groupsOf)} groups of ${v.groupsOf}`
      : `${v.count} ${v.emoji}`;
    case 'fraction-bar': return `A bar cut into ${plural(v.parts, 'equal part')}, ${v.shaded} shaded${v.label ? ` (${v.label})` : ''}`;
    case 'fraction-circle': return `A circle cut into ${plural(v.parts, 'equal part')}, ${v.shaded} shaded`;
    case 'number-line': {
      const j = v.jumps?.length ? `; jumps ${v.jumps.map(([a, b]) => `from ${a} to ${b}`).join(', ')}` : '';
      const mk = v.marks?.length ? `; marked ${v.marks.join(', ')}` : '';
      return `Number line from ${v.from} to ${v.to} in steps of ${v.step}${mk}${j}`;
    }
    case 'shape': return `A ${v.color ? v.color + ' ' : ''}${v.shape}`;
    case 'clock': return `A clock showing ${v.h}:${String(v.m).padStart(2, '0')}`;
    case 'coins': return `Money: ${v.rupees.map((r) => `₹${r}`).join(', ')} (total ₹${v.rupees.reduce((a, b) => a + b, 0)})`;
    case 'bar-graph': return `Bar graph: ${v.labels.map((l, i) => `${l} ${v.values[i]}${v.unit ? ' ' + v.unit : ''}`).join(', ')}`;
    case 'line-graph': return `Line graph of ${v.yLabel} against ${v.xLabel}: ${v.points.map(([x, y]) => `(${x}, ${y})`).join(', ')}`;
    case 'grid-shape': return `A shape covering ${plural(v.cells.length, 'square')} on a ${v.cols} by ${v.rows} grid`;
    case 'triangle': return v.c ? `A triangle with sides ${v.a}, ${v.b} and ${v.c}` : `A right triangle with sides ${v.a} and ${v.b} around the right angle`;
    case 'emoji': return v.text;
  }
}

// ---------------------------------------------------------------- diagnostic

export interface DiagItem { qid: string; objectiveId: string; unitId: string }

/**
 * Resolves `diagnosticFor(level)` ids into concrete questions. Accepts objective ids (one easy
 * question is generated), template ids, `${templateId}#${seed}` ids, or static item ids.
 */
export function resolveDiagnostic(ids: readonly string[], units: readonly Unit[], templates: Record<string, Template>, seed: number): DiagItem[] {
  const r = rng(seed);
  const objs = units.flatMap((u) => u.objectives.map((o) => ({ u, o })));
  const unitOfObj = (oid: string) => objs.find((x) => x.o.id === oid)?.u.id;
  const out: DiagItem[] = [];
  for (const id of ids) {
    const s = r.int(1, 2 ** 31 - 2);
    const hit = objs.find((x) => x.o.id === id);
    let item: DiagItem | null = null;
    if (hit) {
      const qid = nextPracticeId(candidatesFor(hit.o, templates), 1, s, { rand: r.next });
      if (qid) item = { qid, objectiveId: hit.o.id, unitId: hit.u.id };
    } else if (templates[id]) {
      const t = templates[id];
      const u = unitOfObj(t.objectiveId);
      if (u) item = { qid: questionId(id, s), objectiveId: t.objectiveId, unitId: u };
    } else {
      const p = parseQuestionId(id);
      if ('templateId' in p && templates[p.templateId]) {
        const t = templates[p.templateId];
        const u = unitOfObj(t.objectiveId);
        if (u) item = { qid: id, objectiveId: t.objectiveId, unitId: u };
      } else {
        const st = objs.find((x) => x.o.items?.some((q) => q.id === id));
        if (st) item = { qid: id, objectiveId: st.o.id, unitId: st.u.id };
      }
    }
    if (item && !out.some((x) => x.qid === item!.qid)) out.push(item);
  }
  return out;
}

export interface DiagSummary { objectiveId: string; unitId: string; correct: number; total: number }
export function summariseDiagnostic(items: readonly DiagItem[], results: Record<string, boolean>): DiagSummary[] {
  const map = new Map<string, DiagSummary>();
  for (const it of items) {
    if (!(it.qid in results)) continue;
    const s = map.get(it.objectiveId) ?? { objectiveId: it.objectiveId, unitId: it.unitId, correct: 0, total: 0 };
    s.total++;
    if (results[it.qid]) s.correct++;
    map.set(it.objectiveId, s);
  }
  return [...map.values()];
}

/** Items used by the objective plus every static item in the class (diagnostic may cross objectives). */
export const allItems = (units: readonly Unit[]): Question[] => units.flatMap((u) => u.objectives.flatMap((o) => o.items ?? []));
