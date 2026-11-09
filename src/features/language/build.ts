// Small constructors that keep the course content files readable.
import type { Item } from './types';

type Extra = Partial<Omit<Item, 'id' | 'type' | 'prompt' | 'choices' | 'answer'>>;

/** Multiple choice. */
export const mcq = (id: string, prompt: string, choices: string[], answer: string, x: Extra = {}): Item =>
  ({ id, type: 'choice', prompt, choices, answer: [answer], ...x });

/** Listen and tap. `say` is spoken; prompt is the written instruction. */
export const listen = (id: string, prompt: string, say: string, choices: string[], answer: string, x: Extra = {}): Item =>
  ({ id, type: 'listen', prompt, say, choices, answer: [answer], ...x });

/** Put the words in order. `answer` is the correct sequence; tiles are the same words. */
export const order = (id: string, prompt: string, answer: string[], x: Extra = {}): Item =>
  ({ id, type: 'order', prompt, choices: [...answer], answer, ...x });

/** Build from tiles (answer tiles plus distractors). */
export const build = (id: string, prompt: string, answer: string[], distractors: string[], x: Extra = {}): Item =>
  ({ id, type: 'build', prompt, choices: [...answer, ...distractors], answer, ...x });

/** Typed answer with an MCQ fallback for tiers that do not type. */
export const typed = (id: string, prompt: string, accept: string[], fallback: string[], x: Extra = {}): Item =>
  ({ id, type: 'type', prompt, choices: fallback.includes(accept[0]) ? fallback : [accept[0], ...fallback], answer: accept, ...x });

/** Deterministic distractors: items at growing offsets from `idx`, skipping the answer and duplicates. */
export function others<T>(list: readonly T[], idx: number, n: number, offsets = [1, 3, 5, 2, 7, 4, 9, 6, 11, 8]): T[] {
  const out: T[] = [];
  for (const o of offsets) {
    const v = list[(idx + o) % list.length];
    if (v !== list[idx] && !out.includes(v)) out.push(v);
    if (out.length === n) break;
  }
  return out;
}

/** Classification items: every row becomes "which category is X?" with all categories as choices. */
export function classify(prefix: string, rows: [text: string, cat: string, en?: string][], cats: string[], prompt: (text: string) => string, x: (row: [string, string, string?]) => Extra = () => ({})): Item[] {
  return rows.map((r, i) => mcq(`${prefix}-${i + 1}`, prompt(r[0]), cats, r[1], x(r)));
}
