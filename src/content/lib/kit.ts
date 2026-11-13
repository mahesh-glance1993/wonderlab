// Authoring kit for WonderLab curriculum content.
// Keeps class files compact: objectives declare their practice templates inline and the
// builder assigns stable ids, versions and review metadata.
//
// Conventions
//  - Objective ids: `<class>.<topic>.<skill>` e.g. "c10.phy.ohm".
//  - Template ids: `<objectiveId>.<key>`; generated question ids: `<templateId>#<seed>`.
//  - Worked-example ids: `<objectiveId>.ex<n>`.
//  - Mistake `when` keys: a grading reason ('wrong-value', 'missing-unit', 'wrong-unit',
//    'not-lowest', 'wrong', 'unparsable') or a specific wrong answer as the learner would type it
//    (e.g. "2/7", "35"). Choice-based items may key on the wrong choice id.
//  - Templates MUST only use the Rng they are given (never Math.random / Date).
import type {
  Block, BoardId, Choice, ExploreSpec, ItemType, Localized, Objective, Question, SourceRef, Subject, Template, Unit, VisualSpec, WorkedExample,
} from '../../shared/content';
import type { AnswerSpec, Rng } from '../../shared/grading';
import type { ClassLevel } from '../../shared/levels';
import type { ClassContent } from '../index';

export type T = string | Localized;
export const loc = (x: T): Localized => (typeof x === 'string' ? { en: x } : x);
/** Localized string; Telugu optional (required for Nursery–Class 3 learner-facing text). */
export const L = (en: string, te?: string): Localized => (te ? { en, te } : { en });

// ---------------- blocks ----------------
export const p = (en: string, te?: string): Block => ({ type: 'text', text: L(en, te) });
export const tip = (en: string, te?: string): Block => ({ type: 'tip', text: L(en, te) });
export const f = (tex: string, say?: string): Block => (say ? { type: 'formula', tex, say } : { type: 'formula', tex });
export const vis = (visual: VisualSpec, en: string, te?: string): Block => ({ type: 'visual', visual, alt: L(en, te) });
export const stepsB = (...s: T[]): Block => ({ type: 'steps', steps: s.map(loc) });
export const act = (activityId: string, en: string, te?: string): Block => ({ type: 'activity', activityId, label: L(en, te) });
export const h = (en: string, te?: string): Block => ({ type: 'heading', text: L(en, te) });
export const def = (term: T, text: T): Block => ({ type: 'definition', term: loc(term), text: loc(text) });
export const keys = (...points: T[]): Block => ({ type: 'keypoints', points: points.map(loc) });
export const remember = (en: string, te?: string): Block => ({ type: 'remember', text: L(en, te) });
export const photo = (picture: string, caption: T): Block => ({ type: 'photo', picture, caption: loc(caption) });
export const explore = (spec: ExploreSpec): Block => ({ type: 'explore', explore: spec });

// ---------------- worked examples ----------------
export interface ExSpec { problem: T; steps: T[]; answer: T; visual?: VisualSpec }
export const ex = (problem: T, steps: T[], answer: T, visual?: VisualSpec): ExSpec => ({ problem, steps, answer, visual });

// ---------------- question specs ----------------
export interface QSpec {
  type: ItemType;
  prompt: T;
  say?: T;
  visual?: VisualSpec;
  choices?: Choice[];
  left?: Choice[];
  right?: Choice[];
  line?: { from: number; to: number; step: number };
  keypad?: 'numeric' | 'fraction' | 'algebra' | 'units';
  unitHint?: string;
  answer: AnswerSpec;
  hints: T[];
  mistakes?: { when: string; explain: T }[];
  solution: T[];
  steps?: { prompt: T; answer: AnswerSpec }[];
}
export interface TSpec { key: string; d: 1 | 2 | 3; v: number; gen: (r: Rng, seed: number) => QSpec }
/** Declare a practice template. `key` must be unique within its objective. */
export const tp = (key: string, gen: (r: Rng, seed: number) => QSpec, d: 1 | 2 | 3 = 1, v = 1): TSpec => ({ key, d, v, gen });

const toQuestion = (s: QSpec, id: string, version: number, objectiveId: string, difficulty: 1 | 2 | 3): Question => {
  const q: Question = {
    id, version, objectiveId, type: s.type, prompt: loc(s.prompt), answer: s.answer,
    hints: s.hints.map(loc), solution: s.solution.map(loc), difficulty,
  };
  if (s.say !== undefined) q.say = loc(s.say);
  if (s.visual) q.visual = s.visual;
  if (s.choices) q.choices = s.choices;
  if (s.left) q.left = s.left;
  if (s.right) q.right = s.right;
  if (s.line) q.line = s.line;
  if (s.keypad) q.keypad = s.keypad;
  if (s.unitHint) q.unitHint = s.unitHint;
  if (s.mistakes) q.mistakes = s.mistakes.map((m) => ({ when: m.when, explain: loc(m.explain) }));
  if (s.steps) q.steps = s.steps.map((st) => ({ prompt: loc(st.prompt), answer: st.answer }));
  return q;
};

/** A hand-written static item (version 1 unless overridden by an educator). */
export const item = (id: string, objectiveId: string, s: QSpec, difficulty: 1 | 2 | 3 = 1): Question => toQuestion(s, id, 1, objectiveId, difficulty);

// ---------------- answers ----------------
export const num = (value: number, unit?: string, requireUnit = false, tolerance?: number): AnswerSpec => {
  const a: AnswerSpec = { kind: 'number', value };
  if (unit) { a.unit = unit; if (requireUnit) a.requireUnit = true; }
  if (tolerance !== undefined) a.tolerance = tolerance;
  return a;
};
export const approx = (value: number, rel = 0.01, unit?: string, requireUnit = false): AnswerSpec => {
  const a: AnswerSpec = { kind: 'number', value, relTolerance: rel, tolerance: 1e-9 };
  if (unit) { a.unit = unit; if (requireUnit) a.requireUnit = true; }
  return a;
};
export const frac = (n: number, d: number, requireLowest = false): AnswerSpec => ({ kind: 'fraction', num: n, den: d, acceptEquivalent: true, requireLowest });
export const text = (...accept: string[]): AnswerSpec => ({ kind: 'text', accept });
export const expr = (...accept: string[]): AnswerSpec => ({ kind: 'expression', accept });

// ---------------- choice builders ----------------
const key = (c: { label: Localized; visual?: VisualSpec }) => c.label.en.trim().toLowerCase() + JSON.stringify(c.visual ?? '');

/** Multiple choice from a correct option and distractors (deduped, shuffled, max options). */
export function choose(r: Rng, correct: T, wrong: T[], max = 4, visuals?: { correct?: VisualSpec; wrong?: (VisualSpec | undefined)[] }): { choices: Choice[]; answer: AnswerSpec } {
  const opts: { label: Localized; visual?: VisualSpec; ok: boolean }[] = [{ label: loc(correct), visual: visuals?.correct, ok: true }];
  const seen = new Set([key(opts[0])]);
  wrong.forEach((w, i) => {
    if (opts.length >= max) return;
    const o = { label: loc(w), visual: visuals?.wrong?.[i], ok: false };
    const k = key(o);
    if (!seen.has(k)) { seen.add(k); opts.push(o); }
  });
  if (opts.length < 2) throw new Error('choose(): needs at least one distinct distractor');
  const sh = r.shuffle(opts);
  const choices: Choice[] = sh.map((o, i) => (o.visual ? { id: 'abcdefgh'[i], label: o.label, visual: o.visual } : { id: 'abcdefgh'[i], label: o.label }));
  return { choices, answer: { kind: 'choice', correct: choices[sh.findIndex((o) => o.ok)].id } };
}

/** Numeric multiple choice; pads with nearby values if distractors collide. */
export function chooseNum(r: Rng, correct: number, wrong: number[], fmt: (n: number) => string = String, max = 4): { choices: Choice[]; answer: AnswerSpec } {
  const out: number[] = [];
  const ok = (n: number) => Number.isFinite(n) && fmt(n) !== fmt(correct) && !out.some((x) => fmt(x) === fmt(n));
  for (const w of wrong) if (out.length < max - 1 && ok(w)) out.push(w);
  for (let k = 1; out.length < max - 1 && k < 50; k++) {
    for (const c of [correct + k, correct - k]) if (out.length < max - 1 && ok(c) && (c >= 0 || correct < 0)) out.push(c);
  }
  return choose(r, fmt(correct), out.map(fmt), max);
}

/** Picture choices (spoken / young learners). `labels` must be distinct. */
export function pictures(r: Rng, correct: { label: T; visual: VisualSpec }, wrong: { label: T; visual: VisualSpec }[], max = 3) {
  return choose(r, correct.label, wrong.map((w) => w.label), max, { correct: correct.visual, wrong: wrong.map((w) => w.visual) });
}

/** Match pairs. Left keeps order, right is shuffled. */
export function matching(r: Rng, pairs: [T, T][]): { left: Choice[]; right: Choice[]; answer: AnswerSpec } {
  const left = pairs.map(([a], i) => ({ id: `l${i + 1}`, label: loc(a) }));
  const rightRaw = pairs.map(([, b], i) => ({ id: `r${i + 1}`, label: loc(b) }));
  let right = r.shuffle(rightRaw);
  if (right.every((c, i) => c.id === rightRaw[i].id)) right = [...right.slice(1), right[0]];
  const pairsMap: Record<string, string> = {};
  pairs.forEach((_, i) => (pairsMap[`l${i + 1}`] = `r${i + 1}`));
  return { left, right, answer: { kind: 'match', pairs: pairsMap } };
}

/** Put items in order. `inOrder` is the correct sequence. */
export function ordering(r: Rng, inOrder: T[]): { choices: Choice[]; answer: AnswerSpec } {
  const base = inOrder.map((x, i) => ({ id: `o${i + 1}`, label: loc(x) }));
  let sh = r.shuffle(base);
  if (sh.every((c, i) => c.id === base[i].id)) sh = [...sh].reverse();
  return { choices: sh, answer: { kind: 'order', correct: base.map((b) => b.id) } };
}

/** Tap all that apply. */
export function tapAll(r: Rng, items: { label: T; ok: boolean; visual?: VisualSpec }[]): { choices: Choice[]; answer: AnswerSpec } {
  const sh = r.shuffle(items);
  const choices: Choice[] = sh.map((o, i) => (o.visual ? { id: 'abcdefgh'[i], label: loc(o.label), visual: o.visual } : { id: 'abcdefgh'[i], label: loc(o.label) }));
  return { choices, answer: { kind: 'multi', correct: choices.filter((_, i) => sh[i].ok).map((c) => c.id) } };
}

// ---------------- maths helpers ----------------
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
export const simp = (n: number, d: number): [number, number] => { const g = gcd(n, d) || 1; return d < 0 ? [-n / g, -d / g] : [n / g, d / g]; };
export const fr = (n: number, d: number) => { const [a, b] = simp(n, d); return b === 1 ? `${a}` : `${a}/${b}`; };
/** Round to k decimals and strip float noise. */
export const rd = (x: number, k = 2) => +(Math.round(+(x + 'e' + k)) + 'e-' + k);
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const sgn = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`);
export const isPrime = (n: number) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---------------- Indian context ----------------
export const NAMES: Localized[] = [
  L('Ravi', 'రవి'), L('Meena', 'మీనా'), L('Aarav', 'ఆరవ్'), L('Diya', 'దియా'), L('Kavya', 'కావ్య'), L('Arjun', 'అర్జున్'),
  L('Lakshmi', 'లక్ష్మి'), L('Imran', 'ఇమ్రాన్'), L('Priya', 'ప్రియ'), L('Teja', 'తేజ'), L('Sana', 'సనా'), L('Joseph', 'జోసెఫ్'),
  L('Harpreet', 'హర్‌ప్రీత్'), L('Anil', 'అనిల్'), L('Sita', 'సీత'), L('Kiran', 'కిరణ్'),
];
export const THINGS: { en: string; te: string; emoji: string }[] = [
  { en: 'mangoes', te: 'మామిడి పండ్లు', emoji: '🥭' }, { en: 'bananas', te: 'అరటి పండ్లు', emoji: '🍌' },
  { en: 'laddoos', te: 'లడ్డూలు', emoji: '🟠' }, { en: 'balloons', te: 'బెలూన్లు', emoji: '🎈' },
  { en: 'stars', te: 'నక్షత్రాలు', emoji: '⭐' }, { en: 'flowers', te: 'పువ్వులు', emoji: '🌼' },
  { en: 'kites', te: 'గాలిపటాలు', emoji: '🪁' }, { en: 'apples', te: 'ఆపిల్ పండ్లు', emoji: '🍎' },
  { en: 'fish', te: 'చేపలు', emoji: '🐟' }, { en: 'birds', te: 'పక్షులు', emoji: '🐦' },
];
export const CITIES = ['Hyderabad', 'Vijayawada', 'Chennai', 'Pune', 'Jaipur', 'Kochi', 'Lucknow', 'Bhopal', 'Guwahati', 'Mysuru'];

// ---------------- sources ----------------
export type Verify = 'official' | 'secondary' | 'unverified';
export interface Book { book: string; edition: string; verify: Verify; url?: string }
export const BOOKS = {
  jm1: { book: 'NCERT Joyful Mathematics — Class 1', edition: 'NCF-SE 2023 series (current reprint, mapped Nov 2026)', verify: 'official', url: 'https://ciet.ncert.gov.in/audio-book/118' },
  jm2: { book: 'NCERT Joyful Mathematics — Class 2', edition: 'NCF-SE 2023 series (current reprint, mapped Nov 2026)', verify: 'official', url: 'https://ciet.ncert.gov.in/audio-book/121' },
  mm3: { book: 'NCERT Maths Mela — Class 3', edition: '2024-25 first edition (current reprint)', verify: 'secondary' },
  mm4: { book: 'NCERT Maths Mela — Class 4', edition: '2025-26 first edition (current reprint)', verify: 'secondary' },
  mm5: { book: 'NCERT Maths Mela — Class 5', edition: '2025-26 first edition (June 2025)', verify: 'secondary' },
  gp6: { book: 'NCERT Ganita Prakash — Class 6', edition: '2024-25 first edition (current reprint)', verify: 'secondary' },
  gp7a: { book: 'NCERT Ganita Prakash — Class 7 Part 1', edition: '2025-26 first edition', verify: 'secondary' },
  gp7b: { book: 'NCERT Ganita Prakash — Class 7 Part 2', edition: '2025-26 first edition', verify: 'secondary' },
  gp8a: { book: 'NCERT Ganita Prakash — Class 8 Part 1', edition: '2025-26 first edition (July 2025)', verify: 'secondary' },
  gp8b: { book: 'NCERT Ganita Prakash — Class 8 Part 2', edition: '2025-26 first edition', verify: 'secondary' },
  gm9a: { book: 'NCERT Ganita Manjari — Class 9 Part 1', edition: '2026-27 first edition', verify: 'secondary' },
  gm9b: { book: 'NCERT Ganita Manjari — Class 9 Part 2', edition: '2026-27 first edition', verify: 'unverified' },
  m10: { book: 'NCERT Mathematics — Class 10', edition: 'Rationalised edition (2023-24 onward), used for 2026-27', verify: 'unverified' },
  cu6: { book: 'NCERT Science: Curiosity — Class 6', edition: '2024-25 first edition', verify: 'secondary' },
  cu7: { book: 'NCERT Science: Curiosity — Class 7', edition: '2025-26 first edition', verify: 'secondary' },
  cu8: { book: 'NCERT Science: Curiosity — Class 8', edition: '2025-26 first edition', verify: 'secondary' },
  ex9: { book: 'NCERT Science: Exploration — Class 9', edition: '2026-27 first edition', verify: 'secondary' },
  s10: { book: 'NCERT Science — Class 10', edition: 'Rationalised edition (2023-24 onward), used for 2026-27', verify: 'unverified' },
} satisfies Record<string, Book>;
export type BookKey = keyof typeof BOOKS;
export const src = (b: BookKey, chapterNo: number | string, chapterTitle: string): SourceRef & { verify: Verify } => {
  const bk: Book = BOOKS[b];
  const s: SourceRef & { verify: Verify } = { book: bk.book, edition: bk.edition, chapterNo, chapterTitle, verify: bk.verify };
  if (bk.url) s.url = bk.url;
  return s;
};

const VERIFY_NOTE: Record<Verify, string> = {
  official: 'Chapter confirmed from the official textbook / official listing (NCERT CIET or SCERT Telangana PDF).',
  secondary: 'Chapter title/number corroborated by several secondary listings; needs educator verification against the official NCERT PDF.',
  unverified: 'Chapter mapping not confirmed from an official source in this pass; needs educator verification.',
};

// ---------------- objectives, units, classes ----------------
export interface OSpec {
  id: string;
  title: T;
  prereqs?: string[];
  intro: Block[];
  examples: ExSpec[];
  practice: TSpec[];
  items?: Question[];
  activities?: string[];
  enrichment?: boolean;
}
export interface USpec {
  id: string;
  subject: Subject;
  title: T;
  /** null for play curriculum / enrichment exploration */
  source: (SourceRef & { verify: Verify }) | null;
  objectives: OSpec[];
  board?: BoardId;
  note?: string;
}

export function buildClass(level: ClassLevel, specs: USpec[]): ClassContent {
  const templates: Record<string, Template> = {};
  const units: Unit[] = specs.map((u) => {
    const objectives: Objective[] = u.objectives.map((o) => {
      const ids = o.practice.map((t) => {
        const id = `${o.id}.${t.key}`;
        if (templates[id]) throw new Error(`duplicate template id ${id}`);
        templates[id] = { id, objectiveId: o.id, version: t.v, difficulty: t.d, generate: (r, seed) => toQuestion(t.gen(r, seed), `${id}#${seed}`, t.v, o.id, t.d) };
        return id;
      });
      const examples: WorkedExample[] = o.examples.map((e, i) => {
        const w: WorkedExample = { id: `${o.id}.ex${i + 1}`, problem: loc(e.problem), steps: e.steps.map(loc), answer: loc(e.answer) };
        if (e.visual) w.visual = e.visual;
        return w;
      });
      const obj: Objective = { id: o.id, title: loc(o.title), prereqs: o.prereqs ?? [], intro: o.intro, examples, templates: ids };
      if (o.items) obj.items = o.items;
      if (o.activities) obj.activities = o.activities;
      if (o.enrichment) obj.enrichment = true;
      return obj;
    });
    let source: SourceRef | null = null;
    let verifyNote = u.board === 'play' || level <= 2 ? 'WonderLab play-based pre-primary curriculum (not an NCERT textbook chapter).' : 'Enrichment / exploration unit — not mapped to a prescribed textbook chapter.';
    if (u.source) {
      const { verify, ...rest } = u.source;
      source = rest;
      verifyNote = VERIFY_NOTE[verify];
    }
    const unit: Unit = {
      id: u.id,
      board: u.board ?? (level <= 2 ? 'play' : 'cbse'),
      classLevel: level,
      subject: u.subject,
      title: loc(u.title),
      source,
      objectives,
      // validated: enforced by tests/content.test.ts (answer keys, templates, units). Educator sign-off not yet obtained.
      review: { validated: true, educator: 'pending' },
      coverageNote: u.note ? `${verifyNote} ${u.note}` : verifyNote,
    };
    return unit;
  });
  return { units, templates };
}
