// Language courses (Telugu + English) — pure data types. No React here so tests can import freely.
import type { ClassLevel } from '../../shared/levels';

export type CourseId = 'telugu' | 'english';
export type Script = 'te' | 'en';

/**
 * One practice/test item.
 *  choice — tap one option (MCQ, picture ↔ word, choose the spelling…)
 *  listen — the prompt is heard (and shown after a tap on "show"), then tap one option
 *  build  — tap tiles in order to build a syllable/word (tiles may include distractors)
 *  order  — put all the tiles (words) into the right order
 *  type   — typed answer (middle/senior tiers); younger tiers get `choices` as a fallback MCQ
 */
export type ItemType = 'choice' | 'listen' | 'build' | 'order' | 'type';

export interface Item {
  id: string;
  type: ItemType;
  /** Question in the course language (Telugu for the Telugu course). */
  prompt: string;
  /** English gloss / explanation of the prompt (Telugu course: always present, toggled by "Show in English"). */
  en?: string;
  /** Text spoken for listen items (course language). Defaults to the answer for listen items. */
  say?: string;
  /** Picture (emoji drawn inside an accessible frame) and its accessible label. */
  pic?: string;
  picLabel?: string;
  /** When true, choices are shown as pictures (from `pics`) rather than words; the word is revealed after answering. */
  picChoices?: boolean;
  pics?: Record<string, string>;
  /** Options (choice/listen/type-fallback) or tiles (build/order). */
  choices: string[];
  /** choice/listen: [correct]; build/order: correct tile sequence; type: accepted answers (first is canonical). */
  answer: string[];
  /** order items: other accepted orders (Telugu word order is flexible). */
  alts?: string[][];
  /** English glosses for individual choices (Telugu course). */
  gloss?: Record<string, string>;
  /** Progressive hints (Practice only). The engine adds a final "remove a wrong option" hint for choice items. */
  hints?: string[];
  hintsEn?: string[];
  /** Explanation shown after answering / in the test review. */
  explain?: string;
  explainEn?: string;
}

export interface Example {
  /** Main line (displayed big and read aloud). */
  text: string;
  /** English gloss. */
  en?: string;
  /** Short note under the example (course language) and its English. */
  note?: string;
  noteEn?: string;
  pic?: string;
}

/** Letter card for the explorer grid in Learn mode. */
export interface LetterCard { letter: string; word: string; pic: string; en: string }

export interface Objective {
  id: string;
  title: string;
  titleEn?: string;
  intro: string;
  introEn?: string;
  examples: Example[];
  items: Item[];
  /** Learn-mode extras. */
  cards?: LetterCard[];
  builder?: 'gunintham' | 'ottu' | 'cvc';
  /** Use the on-screen Telugu keyboard for typed items. */
  keyboard?: boolean;
}

export interface Unit {
  id: string;
  level: ClassLevel;
  title: string;
  titleEn?: string;
  objectives: Objective[];
  /** Tracing sets and read-along passages linked from this unit. */
  trace?: string[];
  read?: string[];
  /** Badge awarded when every objective in the unit is passed (≥ 80% in practice or test). */
  badge?: { id: string; title: string };
}

export interface Course {
  id: CourseId;
  script: Script;
  title: string;
  titleEn: string;
  units: Unit[];
}

export interface Passage {
  id: string;
  course: CourseId;
  level: ClassLevel;
  kind: 'rhyme' | 'story' | 'passage';
  title: string;
  titleEn?: string;
  /** Sentences / lines in the course language. */
  lines: string[];
  /** English gloss per line (Telugu passages). */
  linesEn?: string[];
  questions: Item[];
}

export interface TraceSet {
  id: string;
  course: CourseId;
  script: Script;
  title: string;
  titleEn?: string;
  letters: string[];
  /** Spoken name/word for each letter (optional). */
  say?: Record<string, string>;
}
