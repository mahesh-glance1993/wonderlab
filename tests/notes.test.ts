import { describe, it, expect } from 'vitest';
import { allNotes, appendLine, decodeStroke, encodeStroke, newNote, parseNote, readNote } from '../src/features/notes/model';
import { subjectGroup, syllabusView } from '../src/features/home/subjects';
import { pictureStyleFor, splitEmoji } from '../src/lib/pictures';
import { cheerCorrect, cheerStreak, cheerTryAgain } from '../src/lib/cheer';
import type { LearnerState } from '../src/lib/app';
import type { Unit } from '../src/shared/content';

const learnerWith = (activities: LearnerState['activities']): LearnerState => ({ mastery: {}, lessons: {}, activities, rewards: {}, downloads: {} });

describe('My Notes model (same NoteDoc as the apps)', () => {
  it('reads app-written notes, tolerating missing fields', () => {
    const n = parseNote({ key: 'unit-c10.light', subject: 'physics', title: 'Light', text: 'hello', ink: ['1,2 3,4'], updatedAt: 5, extra: 1 });
    expect(n).toMatchObject({ key: 'unit-c10.light', subject: 'physics', title: 'Light', chapter: null, text: 'hello', ink: ['1,2 3,4'], createdAt: 0, deleted: false });
    expect(parseNote({ title: 'no key' })).toBeNull();
    expect(parseNote(null)).toBeNull();
  });
  it('lists notes newest first and hides deleted ones', () => {
    const l = learnerWith({
      'notes:a': { state: { key: 'a', updatedAt: 1 }, updatedAt: 1 },
      'notes:b': { state: { key: 'b', updatedAt: 3 }, updatedAt: 1 },
      'notes:c': { state: { key: 'c', updatedAt: 9, deleted: true }, updatedAt: 1 },
      'game:x': { state: { key: 'x' }, updatedAt: 1 },
    });
    expect(allNotes(l).map((n) => n.key)).toEqual(['b', 'a']);
    expect(readNote(l, 'c')?.deleted).toBe(true);
  });
  it('appends a bullet line to a chapter note', () => {
    const first = appendLine(null, 'c10.light', 'physics', 'Light', 'Formula: v = u + at');
    expect(first).toMatchObject({ key: 'unit-c10.light', subject: 'physics', title: 'Light', chapter: 'Light', text: '• Formula: v = u + at', deleted: false });
    expect(first.createdAt).toBeGreaterThan(0);
    const second = appendLine({ ...first, text: 'My words\n\n' }, 'c10.light', 'physics', 'Light', ' Remember: n = c/v ');
    expect(second.text).toBe('My words\n• Remember: n = c/v');
    expect(second.createdAt).toBe(first.createdAt);
  });
  it('encodes handwriting like the apps ("x,y x,y" in 0..1000 units)', () => {
    expect(encodeStroke([[10.4, 20.6], [999.9, 0]])).toBe('10,21 1000,0');
    expect(decodeStroke('10,21 1000,0 bad 5,')).toEqual([[10, 21], [1000, 0]]);
    expect(newNote('free-1').subject).toBe('general');
  });
});

describe('syllabus and subject tabs', () => {
  const u = (id: string, board: Unit['board'], subject: Unit['subject']) => ({ id, board, subject }) as Unit;
  it('groups Telangana science by class', () => {
    expect(subjectGroup('physics', 'ts', 12)).toBe('physical-science');
    expect(subjectGroup('chemistry', 'ts', 10)).toBe('physical-science');
    expect(subjectGroup('biology', 'ts', 11)).toBe('biological-science');
    expect(subjectGroup('physics', 'ts', 9)).toBe('science');
    expect(subjectGroup('physics', 'cbse', 12)).toBe('physics');
  });
  it('shows the board units, else falls back to CBSE with a note', () => {
    const all = [u('a', 'cbse', 'math'), u('b', 'cbse', 'physics'), u('c', 'ts', 'math'), u('d', 'ts', 'physics'), u('e', 'ts', 'biology')];
    const ts = syllabusView(all, 'ts', 12);
    expect(ts.pool.map((x) => x.id)).toEqual(['c', 'd', 'e']);
    expect(ts.groups).toEqual(['math', 'physical-science', 'biological-science']);
    expect(ts.fallback).toBe(false);
    const ap = syllabusView(all, 'ap', 12);
    expect(ap.fallback).toBe(true);
    expect(ap.pool.map((x) => x.id)).toEqual(['a', 'b']);
    expect(syllabusView(all, 'cbse', 12).fallback).toBe(false);
  });
});

describe('realistic pictures', () => {
  it('uses photos from Class 1, 3D pictures before', () => {
    expect(pictureStyleFor(null)).toBe('emoji3d');
    expect(pictureStyleFor(2)).toBe('emoji3d');
    expect(pictureStyleFor(3)).toBe('photo');
  });
  it('splits text into emoji runs (sequences, flags, keycaps)', () => {
    const parts = splitEmoji('What next? 🥭 🍌 👩‍🔬 🇮🇳 1️⃣ ☁️ end');
    expect(parts.filter((p) => p.emoji).map((p) => p.text)).toEqual(['🥭', '🍌', '👩‍🔬', '🇮🇳', '1️⃣', '☁️']);
    expect(parts.map((p) => p.text).join('')).toBe('What next? 🥭 🍌 👩‍🔬 🇮🇳 1️⃣ ☁️ end');
    expect(splitEmoji('plain 123 text')).toEqual([{ emoji: false, text: 'plain 123 text' }]);
  });
});

describe('encouragement', () => {
  it('counts streaks and resets on a miss', () => {
    cheerTryAgain('primary');
    cheerCorrect('primary', false);
    cheerCorrect('primary', false);
    expect(cheerCorrect('primary', false)).toMatch(/3 in a row/);
    expect(cheerStreak()).toBe(3);
    expect(typeof cheerTryAgain('senior')).toBe('string');
    expect(cheerStreak()).toBe(0);
  });
});
