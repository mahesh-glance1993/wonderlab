// Class overview for teachers and tuition centres: one account, one learner profile per student.
// Pure logic shared by the website and the apps (the apps run it through the engine: android/engine/core.ts),
// so both show exactly the same numbers. No React here.
import type { Localized } from '../../shared/content';
import type { ClassContent } from '../../content';
import { CLASSES, MAX_BULK, nicknameProblem, type ClassLevel } from '../../shared/levels';
import { MASTERY_DISTINCT } from '../../shared/mastery';
import { DEFAULT_BOARD, groupName, subjectGroup, syllabusView, type LearnerBoard } from '../home/subjects';

export { MAX_BULK, MAX_PROFILES } from '../../shared/levels';

/** One objective's progress as sent by GET /api/profiles/overview: [objectiveId, attempts, correct, distinctCorrect, masteredAt]. */
export type OverviewMastery = [string, number, number, number, number | null];
export interface OverviewProfile {
  id: string;
  nickname: string;
  avatar: string;
  classLevel: number;
  board?: string | null;
  /** Epoch seconds of the latest saved progress (lessons, practice, activities), or null if never active. */
  lastActive: number | null;
  mastery: OverviewMastery[];
}
export interface OverviewResponse { profiles: OverviewProfile[]; generatedAt: number }

export interface SubjectSummary {
  subject: string; // subject tab id (math, science, physical-science…)
  name: string;
  chapters: number;
  chaptersDone: number; // every skill in the chapter mastered
  skills: number;
  mastered: number;
  /** 0–100: average progress toward mastering each skill in the subject (100 = every skill mastered). */
  masteryPct: number;
  /** Skills flagged "needs help": several tries, mostly wrong, not yet mastered. */
  needsHelp: number;
}
export interface WeakSkill {
  objectiveId: string;
  title: Localized;
  chapter: Localized;
  subject: string;
  attempts: number;
  accuracyPct: number;
  masteryPct: number;
  needsHelp: boolean;
}
export interface LearnerSummary {
  id: string;
  nickname: string;
  avatar: string;
  classLevel: number;
  classLabel: string;
  board: string;
  lastActive: number | null;
  subjects: SubjectSummary[];
  /** Over all subjects. */
  masteryPct: number;
  chaptersDone: number;
  chapters: number;
  needsHelp: number;
  /** The 5 weakest skills that have been tried and are not yet mastered (needs-help first). */
  weakest: WeakSkill[];
}

/** A skill needs help after several tries with low accuracy — the same rule as "Needs practice" (statusOf). */
export const needsHelp = (attempts: number, correct: number, masteredAt: number | null) => !masteredAt && attempts >= 3 && correct / attempts < 0.6;

/** 1 when mastered; otherwise progress toward the distinct-correct threshold, capped below mastery (max 0.8). */
export function skillScore(m: OverviewMastery | undefined): number {
  if (!m) return 0;
  if (m[4]) return 1;
  return Math.min(m[3], MASTERY_DISTINCT - 1) / MASTERY_DISTINCT;
}

const pct = (x: number) => Math.round(x * 100);

/** Summary for one learner, using their class and syllabus (board) — the same lessons they see on Learn. */
export function summariseLearner(p: OverviewProfile, content: ClassContent | null): LearnerSummary {
  const level = Math.max(0, Math.min(12, p.classLevel | 0));
  const board = (p.board as LearnerBoard) || DEFAULT_BOARD;
  const byId = new Map(p.mastery.map((m) => [m[0], m]));
  const { pool, groups } = syllabusView(content?.units ?? [], board, level);
  const subjects: SubjectSummary[] = [];
  const weak: WeakSkill[] = [];
  let scoreSum = 0, skillsAll = 0;
  for (const g of groups) {
    const units = pool.filter((u) => subjectGroup(u.subject, u.board, level) === g);
    let chaptersDone = 0, skills = 0, mastered = 0, help = 0, score = 0;
    for (const u of units) {
      let unitMastered = 0;
      for (const o of u.objectives) {
        const m = byId.get(o.id);
        const s = skillScore(m);
        skills++; score += s;
        if (m?.[4]) { mastered++; unitMastered++; }
        if (m && needsHelp(m[1], m[2], m[4])) help++;
        if (m && m[1] > 0 && !m[4]) {
          weak.push({ objectiveId: o.id, title: o.title, chapter: u.title, subject: groupName(g), attempts: m[1], accuracyPct: pct(m[2] / m[1]), masteryPct: pct(s), needsHelp: needsHelp(m[1], m[2], m[4]) });
        }
      }
      if (u.objectives.length && unitMastered === u.objectives.length) chaptersDone++;
    }
    subjects.push({ subject: g, name: groupName(g), chapters: units.length, chaptersDone, skills, mastered, masteryPct: skills ? pct(score / skills) : 0, needsHelp: help });
    scoreSum += score; skillsAll += skills;
  }
  weak.sort((a, b) => Number(b.needsHelp) - Number(a.needsHelp) || a.masteryPct - b.masteryPct || a.accuracyPct - b.accuracyPct || b.attempts - a.attempts);
  return {
    id: p.id, nickname: p.nickname, avatar: p.avatar, classLevel: level, classLabel: CLASSES[level as ClassLevel]?.label ?? `Class ${level}`, board,
    lastActive: p.lastActive ?? null, subjects,
    masteryPct: skillsAll ? pct(scoreSum / skillsAll) : 0,
    chaptersDone: subjects.reduce((s, x) => s + x.chaptersDone, 0),
    chapters: subjects.reduce((s, x) => s + x.chapters, 0),
    needsHelp: subjects.reduce((s, x) => s + x.needsHelp, 0),
    weakest: weak.slice(0, 5),
  };
}

/** Summaries for every learner. `contentFor(level)` returns that class's curriculum (null while it loads). */
export function classOverview(r: OverviewResponse, contentFor: (level: number) => ClassContent | null): LearnerSummary[] {
  return (r.profiles || []).map((p) => summariseLearner(p, contentFor(p.classLevel)));
}

// ---------------------------------------------------------------- filtering, sorting, CSV

export type SortKey = 'name' | 'class' | 'mastery' | 'lastActive' | 'needsHelp';
export interface OverviewRow { learner: LearnerSummary; subject: SubjectSummary }

/** One row per learner × subject, filtered by class level (null = all) and subject id (null = all), then sorted. */
export function overviewRows(list: LearnerSummary[], opts: { level?: number | null; subject?: string | null; sort?: SortKey } = {}): OverviewRow[] {
  const rows: OverviewRow[] = [];
  for (const l of list) {
    if (opts.level != null && l.classLevel !== opts.level) continue;
    for (const s of l.subjects) if (!opts.subject || s.subject === opts.subject) rows.push({ learner: l, subject: s });
  }
  const byName = (a: OverviewRow, b: OverviewRow) => a.learner.nickname.localeCompare(b.learner.nickname, 'en', { sensitivity: 'base' }) || a.learner.id.localeCompare(b.learner.id);
  const cmp: Record<SortKey, (a: OverviewRow, b: OverviewRow) => number> = {
    name: byName,
    class: (a, b) => a.learner.classLevel - b.learner.classLevel,
    mastery: (a, b) => a.subject.masteryPct - b.subject.masteryPct, // weakest first
    lastActive: (a, b) => (a.learner.lastActive ?? 0) - (b.learner.lastActive ?? 0), // longest inactive first
    needsHelp: (a, b) => b.subject.needsHelp - a.subject.needsHelp,
  };
  const c = cmp[opts.sort ?? 'name'];
  return rows.sort((a, b) => c(a, b) || byName(a, b) || a.subject.name.localeCompare(b.subject.name));
}

/** Class levels and subjects present in the list (for the filter menus), in curriculum order. */
export function overviewFilters(list: LearnerSummary[]) {
  const levels = [...new Set(list.map((l) => l.classLevel))].sort((a, b) => a - b).map((level) => ({ level, label: CLASSES[level as ClassLevel]?.label ?? `Class ${level}` }));
  const seen = new Map<string, string>();
  for (const l of list) for (const s of l.subjects) if (!seen.has(s.subject)) seen.set(s.subject, s.name);
  return { levels, subjects: [...seen].map(([subject, name]) => ({ subject, name })) };
}

/** A CSV cell: quoted when needed; text that a spreadsheet would run as a formula is neutralised. */
export function csvCell(v: string | number): string {
  let s = String(v);
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CSV_HEADER = ['Learner', 'Class', 'Subject', 'Chapters done', 'Chapters', 'Mastery %', 'Skills needing help', 'Last active'];

/**
 * CSV of the rows shown (one line per learner × subject). `lastActiveDates` maps learner id → local "YYYY-MM-DD"
 * (dates are formatted by the caller, in the device's time zone). Starts with a BOM so spreadsheet apps read Telugu names.
 */
export function overviewCsv(rows: OverviewRow[], lastActiveDates: Record<string, string>): string {
  const lines = [CSV_HEADER.map(csvCell).join(',')];
  for (const { learner: l, subject: s } of rows) {
    lines.push([l.nickname, l.classLabel, s.name, s.chaptersDone, s.chapters, s.masteryPct, s.needsHelp, lastActiveDates[l.id] ?? 'Never'].map(csvCell).join(','));
  }
  return '﻿' + lines.join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------- adding several learners at once

export interface NameCheck { names: string[]; problems: { name: string; problem: string }[]; warnings: { name: string; warning: string }[] }

/**
 * Parses a pasted list of first names (one per line, or separated by commas / semicolons). Blank entries are
 * skipped and repeats dropped. Problems block saving (same rules as the server); warnings are reminders only.
 */
export function parseLearnerNames(text: string, existing: string[] = []): NameCheck {
  const names: string[] = [], problems: NameCheck['problems'] = [], warnings: NameCheck['warnings'] = [];
  const have = new Set(existing.map((n) => n.trim().toLowerCase()));
  const seen = new Set<string>();
  for (const raw of String(text || '').split(/[\n\r,;\t]+/)) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const problem = nicknameProblem(name);
    if (problem) { problems.push({ name, problem }); continue; }
    if (have.has(key)) warnings.push({ name, warning: 'A learner with this name already exists. Add an initial (e.g. "Ravi K") to tell them apart.' });
    else if (name.split(' ').length >= 3 || (name.split(' ').length === 2 && name.split(' ')[1].length > 2)) warnings.push({ name, warning: 'Looks like a full name. A first name or nickname is enough.' });
    names.push(name);
  }
  if (names.length > MAX_BULK) problems.push({ name: '', problem: `Add up to ${MAX_BULK} learners at a time.` });
  return { names, problems, warnings };
}
