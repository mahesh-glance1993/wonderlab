import { describe, expect, it } from 'vitest';
import type { Objective, Question, Template, Unit, VisualSpec } from '../src/shared/content';
import { grade, rng, type Response } from '../src/shared/grading';
import { loadClass } from '../src/content';
import type { ClassLevel } from '../src/shared/levels';
import {
  activityLabel, activityPath, adaptForTier, applyKey, buildTestSet, candidatesFor, describeVisual, emptyLessonState, formatAnswer, formatResponse,
  generatedChoices, initialOrder, inputKindFor, isEmptyResponse, keypadAnswer, keypadRows, learnStages, lineIndex, lineLabel, lineResponseValue,
  matchMistake, newQState, nextPracticeId, parseMode, parseQuestionId, pickCandidate, questionId, resolveDiagnostic, resolveQuestion,
  responseForChoice, restoreLessonState, serialiseLessonState, setUnit, similarId, snapToStep, sourceOf, summariseDiagnostic, testTargets, unitChips,
  TEST_MAX, TEST_MIN, type Candidate, type KeyState, type LessonState,
} from '../src/features/lesson/logic';

// ---------------------------------------------------------------- fixtures

const L = (en: string) => ({ en });
function q(partial: Partial<Question> & Pick<Question, 'id' | 'answer'>): Question {
  return { version: 1, objectiveId: 'o1', type: 'typed', prompt: L('?'), hints: [], solution: [], difficulty: 1, ...partial };
}
function tpl(id: string, difficulty: 1 | 2 | 3): Template {
  return {
    id, objectiveId: 'o1', version: 2, difficulty,
    generate: (r, seed) => { const a = r.int(1, 9), b = r.int(1, 9); return q({ id: `${id}#${seed}`, prompt: L(`${a} + ${b}`), answer: { kind: 'number', value: a + b }, difficulty }); },
  };
}
const templates: Record<string, Template> = { 'add.easy': tpl('add.easy', 1), 'add.mid': tpl('add.mid', 2), 'add.hard': tpl('add.hard', 3) };
const item = q({ id: 'static-1', type: 'mcq', answer: { kind: 'choice', correct: 'b' }, choices: [{ id: 'a', label: L('3') }, { id: 'b', label: L('4') }], difficulty: 2 });
const objective: Objective = {
  id: 'o1', title: L('Add'), prereqs: [], intro: [{ type: 'text', text: L('hi') }, { type: 'activity', activityId: 'game:sums', label: L('Play') }],
  examples: [{ id: 'e1', problem: L('1+1'), steps: [L('a')], answer: L('2') }, { id: 'e2', problem: L('2+2'), steps: [L('b')], answer: L('4') }],
  templates: ['add.easy', 'add.mid', 'add.hard', 'missing.template'], items: [item], activities: ['lab:forces?mass=5&force=20'],
};
const unit: Unit = { id: 'u1', board: 'cbse', classLevel: 7, subject: 'math', title: L('Unit'), source: null, objectives: [objective], review: { validated: true, educator: 'pending' } };

// ---------------------------------------------------------------- ids & resolution

describe('question ids', () => {
  it('round-trips template ids with seeds and treats others as static items', () => {
    expect(questionId('m5.frac.add', 42)).toBe('m5.frac.add#42');
    expect(parseQuestionId('m5.frac.add#42')).toEqual({ templateId: 'm5.frac.add', seed: 42 });
    expect(parseQuestionId('static-1')).toEqual({ itemId: 'static-1' });
    expect(parseQuestionId('weird#id')).toEqual({ itemId: 'weird#id' });
    expect(sourceOf('add.mid#9')).toBe('add.mid');
  });
  it('rebuilds the exact same question from its id (resume after refresh)', () => {
    const a = resolveQuestion('add.mid#12345', [item], templates)!;
    const b = resolveQuestion('add.mid#12345', [item], templates)!;
    expect(a).not.toBeNull();
    expect(a.id).toBe('add.mid#12345');
    expect(a.prompt).toEqual(b.prompt);
    expect(a.answer).toEqual(b.answer);
    expect(resolveQuestion('static-1', [item], templates)).toBe(item);
    expect(resolveQuestion('nope#1', [item], templates)).toBeNull();
    expect(resolveQuestion('nope', [item], templates)).toBeNull();
  });
  it('parses modes', () => {
    expect(parseMode('test')).toBe('test');
    expect(parseMode('quiz')).toBeNull();
    expect(parseMode(null)).toBeNull();
  });
});

// ---------------------------------------------------------------- adaptive picking

describe('adaptive template picking', () => {
  const cands = candidatesFor(objective, templates);
  it('lists templates that exist plus static items', () => {
    expect(cands.map((c) => c.id)).toEqual(['add.easy', 'add.mid', 'add.hard', 'static-1']);
  });
  it('picks the difficulty closest to the learner level', () => {
    expect(pickCandidate(cands, 1, () => 0)!.id).toBe('add.easy');
    expect(pickCandidate(cands, 3, () => 0)!.id).toBe('add.hard');
    const mid = new Set([0, 0.6, 0.99].map((r) => pickCandidate(cands, 2, () => r)!.id));
    expect(mid).toEqual(new Set(['add.mid', 'static-1']));
  });
  it('falls back to the nearest difficulty when none match', () => {
    const only: Candidate[] = [{ id: 'x', kind: 'template', difficulty: 1 }, { id: 'y', kind: 'template', difficulty: 3 }];
    expect(pickCandidate(only, 2, () => 0)).not.toBeNull();
    expect(pickCandidate([{ id: 'y', kind: 'template', difficulty: 3 }], 1, () => 0)!.id).toBe('y');
    expect(pickCandidate([], 1, () => 0)).toBeNull();
  });
  it('avoids the previous template and solved static items when possible', () => {
    const c2: Candidate[] = [{ id: 'a', kind: 'template', difficulty: 2 }, { id: 'b', kind: 'template', difficulty: 2 }];
    for (let s = 0; s < 20; s++) expect(nextPracticeId(c2, 2, s + 1, { lastId: 'a#5' })).toMatch(/^b#/);
    expect(nextPracticeId(cands, 2, 7, { solved: ['static-1'], rand: () => 0.99 })).toBe('add.mid#7');
    // only one candidate: repeating it is allowed
    expect(nextPracticeId([c2[0]], 2, 3, { lastId: 'a#1' })).toBe('a#3');
  });
  it('"try a similar one" keeps the template with a fresh seed', () => {
    expect(similarId('add.mid#5', cands, 99)).toBe('add.mid#99');
    expect(similarId('add.mid#5', cands, 5)).toBe('add.mid#6');
    const sim = similarId('static-1', cands, 11)!;
    expect(sim).toBe('add.mid#11'); // same difficulty (2), different source
  });
});

describe('test set', () => {
  const cands = candidatesFor(objective, templates);
  it('spreads difficulty', () => {
    expect(testTargets(6)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(testTargets(5)).toEqual([1, 1, 2, 2, 3]);
  });
  it('is deterministic, sized 5–8 and has unique questions', () => {
    const a = buildTestSet(cands, 2024), b = buildTestSet(cands, 2024);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(TEST_MIN);
    expect(a.length).toBeLessThanOrEqual(TEST_MAX);
    expect(new Set(a).size).toBe(a.length);
    expect(a.filter((id) => id === 'static-1').length).toBeLessThanOrEqual(1);
    expect(buildTestSet(cands, 1, { size: 20 }).length).toBe(TEST_MAX);
    expect(buildTestSet(cands, 1, { size: 1 }).length).toBe(TEST_MIN);
    for (const id of a) expect(resolveQuestion(id, [item], templates)).not.toBeNull();
  });
  it('respects the accept filter and copes with item-only objectives', () => {
    const noStatic = buildTestSet(cands, 5, { accept: (id) => id !== 'static-1' });
    expect(noStatic).not.toContain('static-1');
    expect(noStatic.length).toBeGreaterThanOrEqual(TEST_MIN);
    const items: Candidate[] = [1, 2, 3].map((i) => ({ id: `s${i}`, kind: 'item', difficulty: 1 }));
    expect(buildTestSet(items, 3).sort()).toEqual(['s1', 's2', 's3']);
    expect(buildTestSet([], 3)).toEqual([]);
  });
});

// ---------------------------------------------------------------- feedback

describe('targeted feedback', () => {
  const frac = q({
    id: 'f', answer: { kind: 'fraction', num: 5, den: 6, requireLowest: true },
    mistakes: [
      { when: 'not-lowest', explain: L('Simplify your answer.') },
      { when: '2/5', explain: L('You added the tops and the bottoms.') },
      { when: '0.5', explain: L('That is one half.') },
    ],
  });
  const t = (v: string): Response => ({ kind: 'text', value: v });
  it('matches the learner value first, including equivalent forms', () => {
    expect(matchMistake(frac, grade(frac.answer, t('2/5')), t('2/5'))!.en).toMatch(/tops/);
    expect(matchMistake(frac, grade(frac.answer, t('4/10')), t('4/10'))!.en).toMatch(/tops/);
    expect(matchMistake(frac, grade(frac.answer, t('1/2')), t('1/2'))!.en).toMatch(/half/);
  });
  it('falls back to the grading reason', () => {
    const r = grade(frac.answer, t('10/12'));
    expect(r.reason).toBe('not-lowest');
    expect(matchMistake(frac, r, t('10/12'))!.en).toMatch(/Simplify/);
  });
  it('returns null when correct or unmatched', () => {
    expect(matchMistake(frac, grade(frac.answer, t('5/6')), t('5/6'))).toBeNull();
    expect(matchMistake(frac, grade(frac.answer, t('1/9')), t('1/9'))).toBeNull();
  });
  it('handles units and choices', () => {
    const speed = q({ id: 's', answer: { kind: 'number', value: 20, unit: 'm/s', requireUnit: true }, mistakes: [{ when: 'missing-unit', explain: L('Add the unit.') }, { when: '80', explain: L('You multiplied.') }] });
    expect(matchMistake(speed, grade(speed.answer, t('20')), t('20'))!.en).toMatch(/unit/);
    expect(matchMistake(speed, grade(speed.answer, t('80 m/s')), t('80 m/s'))!.en).toMatch(/multiplied/);
    const mc = { ...item, mistakes: [{ when: 'a', explain: L('3 is one short.') }] };
    const r: Response = { kind: 'choice', value: 'a' };
    expect(matchMistake(mc, grade(mc.answer, r), r)!.en).toMatch(/short/);
  });
});

describe('answer formatting', () => {
  it('formats correct answers and responses for review screens', () => {
    expect(formatAnswer(item)).toBe('4');
    expect(formatResponse(item, { kind: 'choice', value: 'a' })).toBe('3');
    expect(formatAnswer(q({ id: 'n', answer: { kind: 'number', value: 2.5, unit: 'm' } }))).toBe('2.5 m');
    expect(formatAnswer(q({ id: 'f', answer: { kind: 'fraction', num: 4, den: 8 } }))).toBe('1/2');
    const ord = q({ id: 'o', type: 'order', choices: [{ id: 'x', label: L('one') }, { id: 'y', label: L('two') }], answer: { kind: 'order', correct: ['x', 'y'] } });
    expect(formatAnswer(ord)).toBe('one → two');
    expect(formatResponse(ord, null)).toBe('');
  });
});

// ---------------------------------------------------------------- keypad

describe('math keypad', () => {
  const press = (keys: string[], start: KeyState = { value: '', caret: 0 }) => keys.reduce(applyKey, start);
  it('builds fractions, decimals, negatives, powers and roots', () => {
    expect(press(['3', 'frac', '4']).value).toBe('3/4');
    expect(press(['minus', '1', 'dot', '5']).value).toBe('-1.5');
    expect(press(['1', 'space', '1', 'frac', '2']).value).toBe('1 1/2');
    expect(press(['x', 'pow', '2']).value).toBe('x^2');
    expect(press(['sqrt', '9', 'close']).value).toBe('√(9)');
    expect(press(['2', 'pi']).value).toBe('2π');
    expect(press(['3', 'times', '1', '0', 'pow', '8']).value).toBe('3×10^8');
  });
  it('edits at the caret', () => {
    expect(applyKey({ value: '15', caret: 1 }, '2')).toEqual({ value: '125', caret: 2 });
    expect(applyKey({ value: '125', caret: 2 }, 'back')).toEqual({ value: '15', caret: 1 });
    expect(applyKey({ value: '125', caret: 0 }, 'back')).toEqual({ value: '125', caret: 0 });
    expect(applyKey({ value: '125', caret: 2 }, 'left').caret).toBe(1);
    expect(applyKey({ value: '125', caret: 3 }, 'right').caret).toBe(3);
    expect(applyKey({ value: '125', caret: 3 }, 'clear')).toEqual({ value: '', caret: 0 });
    expect(applyKey({ value: '1', caret: 1 }, 'bogus')).toEqual({ value: '1', caret: 1 });
  });
  it('sets, replaces and toggles units', () => {
    expect(press(['2', '5', 'unit:m/s']).value).toBe('25 m/s');
    expect(setUnit('25 m/s', 'km/h')).toBe('25 km/h');
    expect(setUnit('25 m/s', 'm/s')).toBe('25');
    expect(setUnit('45', '₹')).toBe('45 ₹');
    expect(setUnit('', 'N')).toBe('N');
  });
  it('produces answer strings the shared grader accepts', () => {
    const g = (spec: Parameters<typeof grade>[0], keys: string[]) => grade(spec, { kind: 'text', value: keypadAnswer(press(keys).value) }).correct;
    expect(g({ kind: 'fraction', num: 3, den: 4 }, ['3', 'frac', '4'])).toBe(true);
    expect(g({ kind: 'fraction', num: 3, den: 2 }, ['1', 'space', '1', 'frac', '2'])).toBe(true);
    expect(g({ kind: 'number', value: 25, unit: 'm/s', requireUnit: true }, ['2', '5', 'unit:m/s'])).toBe(true);
    expect(g({ kind: 'number', value: -1.5 }, ['minus', '1', 'dot', '5'])).toBe(true);
    expect(g({ kind: 'number', value: 3e8 }, ['3', 'times', '1', '0', 'pow', '8'])).toBe(true);
    expect(g({ kind: 'number', value: 45, unit: '₹', requireUnit: true }, ['4', '5', 'unit:₹'])).toBe(true);
    expect(keypadAnswer('  3   /4 ')).toBe('3 /4');
  });
  it('offers the extended row to older learners and unit chips when relevant', () => {
    expect(keypadRows('numeric', 'primary').flat()).not.toContain('sqrt');
    expect(keypadRows('numeric', 'senior').flat()).toEqual(expect.arrayContaining(['pow', 'sqrt', 'pi', 'times', 'div', 'open', 'close', 'frac', 'dot', 'minus']));
    expect(keypadRows('algebra', 'middle').flat()).toContain('x');
    const u = unitChips(q({ id: 'u', keypad: 'units', unitHint: 'km/h', answer: { kind: 'number', value: 1, unit: 'km/h' } }));
    expect(u[0]).toBe('km/h');
    expect(u).toEqual(expect.arrayContaining(['m', 's', 'm/s', 'N', 'J', 'W', 'V', 'A', 'Ω', '₹', 'cm', 'kg']));
    expect(unitChips(q({ id: 'p', answer: { kind: 'number', value: 1 } }))).toEqual([]);
  });
});

// ---------------------------------------------------------------- lesson state

describe('lesson state save / restore', () => {
  it('round-trips through JSON', () => {
    const s: LessonState = {
      ...emptyLessonState('practice'),
      learn: { step: 2, revealed: 1, q: null },
      practice: { q: { ...newQState('m5.frac.add#777'), draft: { kind: 'text', value: '3/' }, hints: 1, steps: { values: ['12'], ok: [true] } }, count: 4 },
      test: { seed: 9, ids: ['a#1', 'b#2'], index: 1, answers: { 'a#1': { kind: 'choice', value: 'x' } }, submitted: false, recorded: false },
    };
    const back = restoreLessonState(JSON.parse(JSON.stringify(serialiseLessonState(s))));
    expect(back).toEqual(s);
    expect(back.practice.q!.qid).toBe('m5.frac.add#777'); // same question after a refresh
  });
  it('falls back to defaults for missing or malformed data', () => {
    expect(restoreLessonState(undefined)).toEqual(emptyLessonState());
    expect(restoreLessonState({ v: 2 })).toEqual(emptyLessonState());
    expect(restoreLessonState('junk')).toEqual(emptyLessonState());
    const r = restoreLessonState({
      v: 1, mode: 'party', learn: { step: -3, revealed: 'x' },
      practice: { q: { qid: 'a#1', draft: { kind: 'text', value: 5 }, hints: -1, checked: 'yes' } },
      test: { ids: ['a', 'b'], index: 99, answers: { a: { kind: 'multi', value: ['x'] }, c: { kind: 'choice', value: 'z' }, b: { kind: 'nope' } } },
    });
    expect(r.mode).toBe('learn');
    expect(r.learn).toEqual({ step: 0, revealed: 0, q: null });
    expect(r.practice.q).toEqual({ qid: 'a#1', draft: null, hints: 0, checked: false, steps: { values: [], ok: [] } });
    expect(r.test!.index).toBe(1);
    expect(Object.keys(r.test!.answers)).toEqual(['a']);
    expect(restoreLessonState({ v: 1, test: { ids: [] } }).test).toBeNull();
  });
  it('builds the learn sequence: intro, examples, your turn, review', () => {
    expect(learnStages(objective).map((s) => s.kind)).toEqual(['intro', 'example', 'example', 'try', 'review']);
    expect(learnStages({ ...objective, intro: [] })[0].kind).toBe('example');
  });
});

// ---------------------------------------------------------------- tiers & inputs

describe('tier adaptation & inputs', () => {
  it('gives early learners choices instead of typing', () => {
    const typed = q({ id: 't#1', answer: { kind: 'number', value: 7 }, keypad: 'numeric', steps: [{ prompt: L('s'), answer: { kind: 'number', value: 1 } }] });
    expect(adaptForTier(typed, 'senior')).toBe(typed);
    const e = adaptForTier(typed, 'early')!;
    expect(e.type).toBe('mcq');
    expect(e.steps).toBeUndefined();
    expect(inputKindFor(e)).toBe('choice');
    expect(e.choices!.length).toBe(3);
    const right = e.choices!.filter((c) => grade(e.answer, responseForChoice(e, c.id)).correct);
    expect(right.length).toBe(1);
    const fr = adaptForTier(q({ id: 'f#1', answer: { kind: 'fraction', num: 2, den: 4, requireLowest: true } }), 'early')!;
    expect(fr.choices!.filter((c) => grade(fr.answer, responseForChoice(fr, c.id)).correct).length).toBe(1);
    expect(adaptForTier(q({ id: 'w', answer: { kind: 'text', accept: ['cat'] } }), 'early')).toBeNull();
    expect(generatedChoices({ kind: 'number', value: 0 }, 'z')!.every((c) => !c.label.en.startsWith('-'))).toBe(true);
    const count = q({ id: 'c', type: 'count', answer: { kind: 'number', value: 4 }, visual: { kind: 'objects', emoji: '🍎', count: 4 } });
    expect(adaptForTier(count, 'early')!.type).toBe('count');
  });
  it('picks an input kind for every item type', () => {
    expect(inputKindFor(item)).toBe('choice');
    expect(inputKindFor(q({ id: 'a', type: 'tap', answer: { kind: 'multi', correct: ['a'] } }))).toBe('multi');
    expect(inputKindFor(q({ id: 'a', type: 'match', answer: { kind: 'match', pairs: {} } }))).toBe('match');
    expect(inputKindFor(q({ id: 'a', type: 'drag', answer: { kind: 'match', pairs: {} } }))).toBe('match');
    expect(inputKindFor(q({ id: 'a', type: 'order', answer: { kind: 'order', correct: [] } }))).toBe('order');
    expect(inputKindFor(q({ id: 'a', type: 'number-line', line: { from: 0, to: 1, step: 0.25 }, answer: { kind: 'number', value: 1 } }))).toBe('numberline');
    expect(inputKindFor(q({ id: 'a', type: 'count', answer: { kind: 'number', value: 1 } }))).toBe('count');
    expect(inputKindFor(q({ id: 'a', type: 'graph', answer: { kind: 'number', value: 1 } }))).toBe('typed');
    expect(inputKindFor(q({ id: 'a', type: 'spoken', answer: { kind: 'choice', correct: 'a' }, choices: [] }))).toBe('choice');
  });
  it('never starts an order item already solved', () => {
    for (let i = 0; i < 30; i++) {
      const o = q({ id: `ord${i}`, type: 'order', choices: ['a', 'b', 'c'].map((id) => ({ id, label: L(id) })), answer: { kind: 'order', correct: ['a', 'b', 'c'] } });
      const start = initialOrder(o);
      expect(start.sort()).toEqual(['a', 'b', 'c']);
      expect(initialOrder(o).join()).not.toBe('a,b,c');
      expect(initialOrder(o)).toEqual(initialOrder(o));
    }
  });
  it('detects empty responses', () => {
    expect(isEmptyResponse(null)).toBe(true);
    expect(isEmptyResponse({ kind: 'text', value: '  ' })).toBe(true);
    expect(isEmptyResponse({ kind: 'match', value: {} })).toBe(true);
    expect(isEmptyResponse({ kind: 'multi', value: ['a'] })).toBe(false);
  });
});

describe('number line', () => {
  it('snaps values to steps', () => {
    expect(snapToStep(0.37, { from: 0, to: 1, step: 0.25 })).toBe(0.25);
    expect(snapToStep(7, { from: 0, to: 5, step: 1 })).toBe(5);
    expect(snapToStep(0.3, { from: 0, to: 1, step: 0.1 })).toBe(0.3);
  });
  it('labels sevenths as fractions and places points by index', () => {
    const line = { from: 0, to: 1, step: 1 / 7 };
    expect(lineIndex(3 / 7, line)).toBe(3);
    expect(lineLabel(3, line)).toBe('3/7');
    expect(lineLabel(7, line)).toBe('1');
    expect(lineLabel(2, { from: 0, to: 1, step: 0.25 })).toBe('0.5');
    expect(lineLabel(2, { from: 0, to: 1, step: 0.25 }, true)).toBe('1/2');
    expect(lineLabel(3, { from: -20, to: 20, step: 1 })).toBe('-17');
    expect(grade({ kind: 'fraction', num: 3, den: 7 }, { kind: 'text', value: lineLabel(3, line, true) }).correct).toBe(true);
    expect(lineResponseValue({ kind: 'text', value: '3/8' })).toBe(0.375);
    expect(lineResponseValue(null)).toBeNull();
  });
});

// ---------------------------------------------------------------- activities & visuals

describe('linked activities', () => {
  it('maps activity ids to routes', () => {
    expect(activityPath('lab:forces?mass=5&force=20')).toBe('/lab/forces?mass=5&force=20');
    expect(activityPath('game:fractions')).toBe('/games/fractions');
    expect(activityPath('art:trace')).toBe('/art/trace');
    expect(activityPath('video:abc')).toBeNull();
    expect(activityPath('lab:../../x')).toBeNull(); // no path traversal
    expect(activityLabel('game:fractions').en).toMatch(/fractions/);
    expect(activityLabel('lab:forces?mass=5').en).toMatch(/lab: forces$/);
  });
});

describe('visual text alternatives', () => {
  const all: VisualSpec[] = [
    { kind: 'objects', emoji: '🍎', count: 6, groupsOf: 3 }, { kind: 'fraction-bar', parts: 4, shaded: 3 }, { kind: 'fraction-circle', parts: 8, shaded: 1 },
    { kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[2, 5]], marks: [5] }, { kind: 'shape', shape: 'hexagon' }, { kind: 'clock', h: 3, m: 5 },
    { kind: 'coins', rupees: [10, 5, 1] }, { kind: 'bar-graph', labels: ['A', 'B'], values: [3, 5], unit: 'kg' },
    { kind: 'line-graph', xLabel: 't', yLabel: 'v', points: [[0, 0], [1, 2]] }, { kind: 'grid-shape', cells: [[0, 0], [1, 0]], cols: 3, rows: 2 },
    { kind: 'triangle', a: 3, b: 4 }, { kind: 'emoji', text: '🌞' },
  ];
  it('describes every VisualSpec kind', () => {
    for (const v of all) expect(describeVisual(v).length).toBeGreaterThan(0);
    expect(describeVisual(all[0])).toBe('6 🍎 in 2 groups of 3');
    expect(describeVisual(all[5])).toBe('A clock showing 3:05');
    expect(describeVisual(all[6])).toMatch(/total ₹16/);
  });
});

// ---------------------------------------------------------------- diagnostic

describe('diagnostic', () => {
  it('resolves template ids, objective ids, seeded ids and static items', () => {
    const items = resolveDiagnostic(['add.hard', 'o1', 'add.mid#4', 'static-1', 'unknown'], [unit], templates, 1);
    expect(items.map((i) => i.objectiveId)).toEqual(['o1', 'o1', 'o1', 'o1']);
    expect(items[0].qid).toMatch(/^add\.hard#\d+$/);
    expect(items[2].qid).toBe('add.mid#4');
    expect(items[3].qid).toBe('static-1');
    expect(items.every((i) => i.unitId === 'u1')).toBe(true);
    expect(resolveDiagnostic(['add.hard'], [unit], templates, 1)).toEqual(resolveDiagnostic(['add.hard'], [unit], templates, 1));
  });
  it('summarises answered items by objective', () => {
    const items = [{ qid: 'a#1', objectiveId: 'o1', unitId: 'u' }, { qid: 'b#1', objectiveId: 'o1', unitId: 'u' }, { qid: 'c#1', objectiveId: 'o2', unitId: 'u' }, { qid: 'd#1', objectiveId: 'o3', unitId: 'u' }];
    expect(summariseDiagnostic(items, { 'a#1': true, 'b#1': false, 'c#1': true })).toEqual([
      { objectiveId: 'o1', unitId: 'u', correct: 1, total: 2 }, { objectiveId: 'o2', unitId: 'u', correct: 1, total: 1 },
    ]);
  });
});

// ---------------------------------------------------------------- real curriculum smoke test

describe('real curriculum', () => {
  it('every template question resolves, adapts per tier, builds tests and accepts its own answer', async () => {
    const tiers = ['early', 'primary', 'middle', 'senior'] as const;
    for (let level = 0 as ClassLevel; level <= 12; level = (level + 1) as ClassLevel) {
      const c = await loadClass(level);
      const tier = tiers[level <= 2 ? 0 : level <= 5 ? 1 : level <= 8 ? 2 : 3];
      for (const u of c.units) for (const o of u.objectives) {
        const cands = candidatesFor(o, c.templates);
        if (!cands.length) continue;
        const ids = buildTestSet(cands, 99, { accept: (id) => { const x = resolveQuestion(id, o.items ?? [], c.templates); return !!x && !!adaptForTier(x, tier); } });
        expect(ids.length, `${o.id} test size`).toBeGreaterThan(0);
        for (const id of [...ids, nextPracticeId(cands, 2, 4242)!]) {
          const raw = resolveQuestion(id, o.items ?? [], c.templates);
          expect(raw, id).not.toBeNull();
          expect(resolveQuestion(id, o.items ?? [], c.templates)!.answer).toEqual(raw!.answer); // deterministic
          const qq = adaptForTier(raw!, tier);
          if (!qq) continue;
          if (tier === 'early') expect(inputKindFor(qq), id).not.toBe('typed');
          const k = inputKindFor(qq);
          if (k === 'typed' && (qq.answer.kind === 'number' || qq.answer.kind === 'fraction')) {
            expect(grade(qq.answer, { kind: 'text', value: formatAnswer(qq) }).correct, `${id} formatted answer`).toBe(true);
          }
          if (k === 'numberline' && qq.line && (qq.answer.kind === 'number' || qq.answer.kind === 'fraction')) {
            const v = qq.answer.kind === 'number' ? qq.answer.value : qq.answer.num / qq.answer.den;
            const lbl = lineLabel(lineIndex(v, qq.line), qq.line, qq.answer.kind === 'fraction');
            expect(grade(qq.answer, { kind: 'text', value: lbl }).correct, `${id} number line`).toBe(true);
          }
          if (k === 'choice' && qq.choices) {
            expect(qq.choices.some((ch) => grade(qq.answer, responseForChoice(qq, ch.id)).correct), `${id} has a right choice`).toBe(true);
          }
        }
      }
    }
  }, 300000); // whole curriculum (all boards, all classes): grows with content
  it('uses the per-level seeded ids to rebuild the same question (Class 5 fraction resume)', async () => {
    // Class 5 is level 7; while its content is still being authored, use the first fraction objective found.
    let c = await loadClass(7);
    let o = c.units.flatMap((u) => u.objectives).find((x) => /frac/i.test(x.id) && x.templates.length);
    for (let l = 0; !o && l <= 12; l++) {
      c = await loadClass(l as ClassLevel);
      o = c.units.flatMap((u) => u.objectives).find((x) => /frac/i.test(x.id) && x.templates.length);
    }
    expect(o).toBeTruthy();
    const id = nextPracticeId(candidatesFor(o!, c.templates), 2, 123456)!;
    const st = restoreLessonState(serialiseLessonState({ ...emptyLessonState('practice'), practice: { q: newQState(id), count: 1 } }));
    const a = resolveQuestion(st.practice.q!.qid, o!.items ?? [], c.templates)!;
    const b = resolveQuestion(id, o!.items ?? [], c.templates)!;
    expect(a.prompt).toEqual(b.prompt);
    expect(a.answer).toEqual(b.answer);
  });
});

// sanity: fixture template uses the shared RNG
it('fixture templates are deterministic via rng()', () => {
  expect(templates['add.easy'].generate(rng(5), 5).answer).toEqual(templates['add.easy'].generate(rng(5), 5).answer);
});
