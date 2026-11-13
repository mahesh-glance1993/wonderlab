// My Notes — data model shared with the apps (android/.../feature/notes/Notes.kt). Each note is learner activity
// state "notes:<key>" (saved offline first, then synced), so notes written on the website show up in the apps and back.
import type { LearnerState } from '../../lib/app';

export interface NoteDoc {
  key: string;
  subject: string;
  title: string;
  chapter: string | null;
  text: string;
  /** handwriting: strokes as "x,y x,y …" in 0..1000 page units */
  ink: string[];
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
}

export const NOTE_PREFIX = 'notes:';
export const MAX_TEXT = 40_000;
/** the server keeps up to 100 000 characters of state per note */
export const MAX_STATE = 95_000;

export const SUBJECT_INFO: Record<string, [string, string]> = {
  math: ['Maths', '🔢'], physics: ['Physics', '🧲'], chemistry: ['Chemistry', '⚗️'], biology: ['Biology', '🌿'], science: ['Science', '🔬'],
  evs: ['EVS', '🌍'], social: ['Social Studies', '🗺️'], telugu: ['Telugu', '📖'], hindi: ['Hindi', '📜'], english: ['English', '🔤'], general: ['My notes', '📝'],
};
export const subjectName = (s: string) => SUBJECT_INFO[s]?.[0] ?? (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'My notes');
export const subjectEmoji = (s: string) => SUBJECT_INFO[s]?.[1] ?? '📝';

const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);

/** Reads a stored note (tolerant of missing fields, like the apps' ignoreUnknownKeys + defaults). */
export function parseNote(raw: unknown): NoteDoc | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.key !== 'string' || !o.key) return null;
  return {
    key: o.key, subject: str(o.subject, 'general') || 'general', title: str(o.title), chapter: typeof o.chapter === 'string' ? o.chapter : null,
    text: str(o.text), ink: Array.isArray(o.ink) ? o.ink.filter((x): x is string => typeof x === 'string') : [],
    createdAt: num(o.createdAt), updatedAt: num(o.updatedAt), deleted: o.deleted === true,
  };
}

export const newNote = (key: string, subject = 'general', title = ''): NoteDoc =>
  ({ key, subject: subject || 'general', title, chapter: title || null, text: '', ink: [], createdAt: 0, updatedAt: 0, deleted: false });

/** All of the learner's notes (newest first), without deleted ones. */
export function allNotes(learner: LearnerState): NoteDoc[] {
  return Object.entries(learner.activities)
    .filter(([k]) => k.startsWith(NOTE_PREFIX))
    .map(([, v]) => parseNote(v.state))
    .filter((n): n is NoteDoc => !!n && !n.deleted)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export const readNote = (learner: LearnerState, key: string) => parseNote(learner.activities[NOTE_PREFIX + key]?.state);

/** Stamps the times (milliseconds, like the apps) for saving. */
export function stamp(n: NoteDoc): NoteDoc {
  const now = Date.now();
  return { ...n, updatedAt: now, createdAt: n.createdAt || now };
}

export const notePath = (key: string, subject: string, title: string) =>
  `/notes/edit/${encodeURIComponent(key)}?subject=${encodeURIComponent(subject)}&title=${encodeURIComponent(title)}`;
/** A chapter's note (from a lesson): key "unit-<unitId>". */
export const chapterNotePath = (unitId: string, subject: string, chapter: string) => notePath(`unit-${unitId}`, subject, chapter);

/** Adds a line to a chapter's note ("Save to notes" on a key point / definition / formula). */
export function appendLine(cur: NoteDoc | null, unitId: string, subject: string, chapter: string, line: string): NoteDoc {
  const key = `unit-${unitId}`;
  const base = cur ?? { ...newNote(key, subject, chapter), chapter };
  const text = `${base.text.trimEnd()}\n• ${line.trim()}`.replace(/^\n+/, '');
  return stamp({ ...base, text: text.slice(0, MAX_TEXT), deleted: false });
}

// ---------------------------------------------------------------- handwriting

export type Pt = [number, number];
export const encodeStroke = (pts: Pt[]) => pts.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(' ');
export function decodeStroke(s: string): Pt[] {
  const out: Pt[] = [];
  for (const p of s.split(' ')) {
    const [a, b] = p.split(',');
    const x = Number(a), y = Number(b);
    if (a && b && isFinite(x) && isFinite(y)) out.push([x, y]);
  }
  return out;
}

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
