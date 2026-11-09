// Curriculum content model. Board-agnostic so another board can be added later.
import type { AnswerSpec, Rng } from './grading';
import type { ClassLevel } from './levels';

export type Subject = 'early' | 'math' | 'physics';
export type BoardId = 'cbse' | 'play'; // 'play' = WonderLab pre-primary play curriculum

export interface Localized { en: string; te?: string }

export interface SourceRef {
  /** e.g. "NCERT Mathematics Class 6 — Ganita Prakash" */
  book: string;
  /** e.g. "2024-25 edition" — the edition/academic year this mapping was made against */
  edition: string;
  chapterNo?: number | string;
  chapterTitle: string;
  url?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'changes-requested';
export interface Review {
  /** Automated: answer keys, templates, units checked by the test suite. */
  validated: boolean;
  /** Human educator sign-off — recorded only when actually obtained. */
  educator: ReviewStatus;
  reviewer?: string;
  reviewedAt?: string;
  notes?: string;
}

/** Instructional blocks shown in Learn mode. */
export type Block =
  | { type: 'text'; text: Localized }
  | { type: 'formula'; tex: string; say?: string } // plain-text formula, e.g. "v = u + at"
  | { type: 'visual'; visual: VisualSpec; alt: Localized }
  | { type: 'steps'; steps: Localized[] }
  | { type: 'tip'; text: Localized }
  | { type: 'activity'; activityId: string; label: Localized }; // link to a sim / game / art activity

/** Declarative visuals rendered by the lesson workspace (no external images). */
export type VisualSpec =
  | { kind: 'objects'; emoji: string; count: number; groupsOf?: number }
  | { kind: 'fraction-bar'; parts: number; shaded: number; label?: string }
  | { kind: 'fraction-circle'; parts: number; shaded: number }
  | { kind: 'number-line'; from: number; to: number; step: number; marks?: number[]; jumps?: [number, number][] }
  | { kind: 'shape'; shape: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'hexagon' | 'pentagon' | 'oval' | 'diamond'; color?: string }
  | { kind: 'clock'; h: number; m: number }
  | { kind: 'coins'; rupees: number[] }
  | { kind: 'bar-graph'; labels: string[]; values: number[]; unit?: string }
  | { kind: 'line-graph'; xLabel: string; yLabel: string; points: [number, number][] }
  | { kind: 'grid-shape'; cells: [number, number][]; cols: number; rows: number }
  | { kind: 'triangle'; a: number; b: number; c?: number; angleLabels?: string[] }
  | { kind: 'emoji'; text: string };

export interface WorkedExample {
  id: string;
  problem: Localized;
  visual?: VisualSpec;
  steps: Localized[];
  answer: Localized;
}

export type ItemType = 'mcq' | 'typed' | 'tap' | 'match' | 'order' | 'number-line' | 'graph' | 'drag' | 'count' | 'spoken';

export interface Choice { id: string; label: Localized; visual?: VisualSpec }

/** One fully-specified question (static, or the output of a template). */
export interface Question {
  id: string; // stable id: static item id, or `${templateId}#${seed}`
  version: number;
  objectiveId: string;
  type: ItemType;
  prompt: Localized;
  /** read-aloud text when it differs from the prompt */
  say?: Localized;
  visual?: VisualSpec;
  choices?: Choice[];
  /** for 'match': left items and right items (ids reference choices) */
  left?: Choice[];
  right?: Choice[];
  /** for 'number-line' items */
  line?: { from: number; to: number; step: number };
  /** for typed answers: show math keypad / unit picker */
  keypad?: 'numeric' | 'fraction' | 'algebra' | 'units';
  unitHint?: string;
  answer: AnswerSpec;
  /** Progressive hints — shown one at a time in Practice; hidden in Test. */
  hints: Localized[];
  /** Targeted feedback keyed by grading reason or a specific wrong value. */
  mistakes?: { when: string; explain: Localized }[];
  /** Worked solution shown after answering (Practice) or at review (Test). */
  solution: Localized[];
  /** Intermediate steps the learner can submit, each graded (optional). */
  steps?: { prompt: Localized; answer: AnswerSpec }[];
  difficulty: 1 | 2 | 3;
}

/** A parameterised generator with known answers. */
export interface Template {
  id: string;
  objectiveId: string;
  version: number;
  difficulty: 1 | 2 | 3;
  generate: (r: Rng, seed: number) => Question;
}

export interface Objective {
  id: string; // stable, e.g. "m6.frac.add-unlike"
  title: Localized;
  prereqs: string[];
  /** Learn mode */
  intro: Block[];
  examples: WorkedExample[]; // >= 2
  /** Practice & Test pull from these */
  templates: string[]; // template ids (>= 5 distinct validated items obtainable)
  items?: Question[]; // static validated items
  /** Linked activities (games / sims / art) */
  activities?: string[];
  enrichment?: boolean;
}

export interface Unit {
  id: string;
  board: BoardId;
  classLevel: ClassLevel;
  subject: Subject;
  title: Localized;
  source: SourceRef | null; // null for enrichment / play curriculum
  objectives: Objective[];
  review: Review;
  /** Coverage note — e.g. "gap: probability simulations pending" */
  coverageNote?: string;
}

export interface Curriculum {
  board: BoardId;
  version: string;
  units: Unit[];
}
