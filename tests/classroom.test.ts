import { describe, expect, it } from 'vitest';
import type { Unit } from '../src/shared/content';
import type { ClassContent } from '../src/content';
import { classOverview, csvCell, overviewCsv, overviewFilters, overviewRows, parseLearnerNames, skillScore, summariseLearner, type OverviewProfile } from '../src/features/parent/classroom';
import { MAX_BULK, nicknameProblem } from '../src/shared/levels';

const unit = (id: string, subject: Unit['subject'], objs: string[], board: Unit['board'] = 'ts'): Unit => ({
  id, board, classLevel: 8, subject, title: { en: `Chapter ${id}` }, source: null, review: { validated: true, educator: 'pending' },
  objectives: objs.map((o) => ({ id: o, title: { en: `Skill ${o}` }, prereqs: [] })) as Unit['objectives'],
});
const content: ClassContent = { units: [unit('m1', 'math', ['a', 'b']), unit('m2', 'math', ['c']), unit('s1', 'physics', ['d']), unit('x', 'math', ['z'], 'cbse')], templates: {} };
const learner = (over: Partial<OverviewProfile> = {}): OverviewProfile => ({ id: 'p1', nickname: 'Ravi', avatar: 'owl', classLevel: 8, board: 'ts', lastActive: 100, mastery: [], ...over });

describe('class overview', () => {
  it('counts chapters, mastery and needs-help per subject for the learner syllabus', () => {
    const s = summariseLearner(learner({ mastery: [['a', 6, 6, 5, 50], ['b', 6, 6, 5, 60], ['c', 5, 1, 1, null], ['d', 2, 2, 2, null], ['z', 9, 9, 5, 1]] }), content);
    expect(s.subjects.map((x) => x.subject)).toEqual(['math', 'science']); // TS Class 6: physics → Science; CBSE unit ignored
    const math = s.subjects[0];
    expect(math).toMatchObject({ chapters: 2, chaptersDone: 1, skills: 3, mastered: 2, needsHelp: 1 });
    expect(math.masteryPct).toBe(Math.round(((1 + 1 + 0.2) / 3) * 100));
    expect(s.weakest[0]).toMatchObject({ objectiveId: 'c', needsHelp: true, accuracyPct: 20 });
    expect(s.weakest.map((w) => w.objectiveId)).toEqual(['c', 'd']);
    expect(s.needsHelp).toBe(1);
  });
  it('mastery score caps unmastered skills below 100%', () => {
    expect(skillScore(['a', 20, 20, 30, null])).toBe(0.8);
    expect(skillScore(['a', 1, 1, 1, 5])).toBe(1);
    expect(skillScore(undefined)).toBe(0);
  });
  it('filters, sorts and exports CSV safely', () => {
    const list = classOverview({ generatedAt: 0, profiles: [learner(), learner({ id: 'p2', nickname: '=cmd', classLevel: 9, lastActive: null })] }, () => content);
    expect(overviewFilters(list).levels.map((l) => l.level)).toEqual([8, 9]);
    const rows = overviewRows(list, { level: 8, subject: 'math' });
    expect(rows).toHaveLength(1);
    const csv = overviewCsv(overviewRows(list, { sort: 'name' }), { p1: '2026-11-20' });
    expect(csv.startsWith('﻿Learner,Class,Subject')).toBe(true);
    expect(csv).toContain("'=cmd,Class 7,");
    expect(csv).toContain('Ravi,Class 6,Maths,0,2,0,0,2026-11-20');
    expect(csv).toContain('Never');
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
  });
});

describe('bulk learner names', () => {
  it('splits, de-duplicates and checks names', () => {
    const r = parseLearnerNames('Ravi\nSita, ravi;  Anil Kumar Reddy \n\nme@x.com\n9876543210\nAsha', ['Asha']);
    expect(r.names).toEqual(['Ravi', 'Sita', 'Anil Kumar Reddy', 'Asha']);
    expect(r.problems.map((p) => p.name)).toEqual(['me@x.com', '9876543210']);
    expect(r.warnings.map((w) => w.name)).toEqual(['Anil Kumar Reddy', 'Asha']);
  });
  it('limits one paste', () => {
    const r = parseLearnerNames(Array.from({ length: MAX_BULK + 1 }, (_, i) => `Kid${i}`).join('\n'));
    expect(r.problems.some((p) => p.problem.includes(String(MAX_BULK)))).toBe(true);
    expect(nicknameProblem('')).toBeTruthy();
  });
});
