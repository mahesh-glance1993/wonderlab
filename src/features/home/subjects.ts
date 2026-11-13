// Syllabus (board) and subject tabs — same rules as the apps (android/.../feature/lesson/CurriculumScreens.kt).
import type { BoardId, Unit } from '../../shared/content';

export type LearnerBoard = 'ts' | 'ap' | 'cbse';
export const DEFAULT_BOARD: LearnerBoard = 'ts';
export const BOARDS: { id: LearnerBoard; label: string }[] = [
  { id: 'ts', label: 'Telangana (SCERT)' },
  { id: 'ap', label: 'Andhra Pradesh' },
  { id: 'cbse', label: 'CBSE (NCERT)' },
];
export const boardName = (b: string) => (b === 'ts' ? 'Telangana' : b === 'ap' ? 'Andhra Pradesh' : 'CBSE');

const SUBJECT_ORDER = ['early', 'telugu', 'hindi', 'english', 'math', 'evs', 'science', 'physical-science', 'biological-science', 'physics', 'chemistry', 'biology', 'social'];

/** Telangana Classes 8–10 teach Physical Science (physics + chemistry) and Biological Science; Classes 6–7 one Science book. */
export function subjectGroup(subject: string, board: BoardId | string, level: number): string {
  if (board === 'ts' && level >= 10 && (subject === 'physics' || subject === 'chemistry')) return 'physical-science';
  if (board === 'ts' && level >= 10 && subject === 'biology') return 'biological-science';
  if (board === 'ts' && level >= 8 && level <= 9 && ['physics', 'chemistry', 'biology'].includes(subject)) return 'science';
  return subject;
}

const NAMES: Record<string, string> = {
  early: 'My World', math: 'Maths', physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', science: 'Science',
  'physical-science': 'Physical Science', 'biological-science': 'Biological Science', evs: 'EVS', social: 'Social Studies',
  telugu: 'Telugu', hindi: 'Hindi', english: 'English',
};
export const groupName = (g: string) => NAMES[g] ?? g.charAt(0).toUpperCase() + g.slice(1);

const EMOJI: Record<string, string> = {
  early: '🌍', math: '🔢', physics: '🧲', 'physical-science': '🧲', chemistry: '⚗️', biology: '🌿', 'biological-science': '🌿',
  science: '🔬', evs: '🌳', social: '🗺️', telugu: '📖', hindi: '📜', english: '🔤',
};
export const groupEmoji = (g: string) => EMOJI[g] ?? '📚';

/**
 * Units for the learner's syllabus, grouped into subject tabs. A class with no units for that syllabus falls back
 * to the CBSE (NCERT) / play lessons (`fallback` is then true for Class 1+ so the page can say so).
 */
export function syllabusView(all: Unit[], board: LearnerBoard, level: number) {
  const own = all.filter((u) => u.board === board);
  const fallback = own.length === 0 && all.length > 0 && board !== 'cbse' && level >= 3;
  const pool = own.length ? own : all.filter((u) => u.board === 'cbse' || u.board === 'play');
  const groups = [...new Set(pool.map((u) => subjectGroup(u.subject, u.board, level)))]
    .sort((a, b) => (SUBJECT_ORDER.indexOf(a) + 1 || 99) - (SUBJECT_ORDER.indexOf(b) + 1 || 99));
  return { pool, groups, fallback };
}
