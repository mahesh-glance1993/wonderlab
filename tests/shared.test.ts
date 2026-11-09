import { describe, it, expect } from 'vitest';
import { grade, parseRational, rng, splitUnit, type AnswerSpec } from '../src/shared/grading';
import { applyAttempt, emptyMastery, difficultyFor, MASTERY_DISTINCT } from '../src/shared/mastery';
import { recommend } from '../src/shared/recommend';
import { validateQuestion } from '../src/shared/validate';
import { presentationFor, tierForClass } from '../src/shared/levels';
import type { Question, Unit } from '../src/shared/content';

const T = (value: string) => ({ kind: 'text' as const, value });

describe('fraction grading', () => {
  const half: AnswerSpec = { kind: 'fraction', num: 1, den: 2, acceptEquivalent: true, acceptDecimal: true };
  it.each(['1/2', '2/4', '50/100', '0.5', '.5', '50%', ' 1 / 2 '])('accepts equivalent form %s', (v) => expect(grade(half, T(v)).correct).toBe(true));
  it.each(['1/3', '2/3', '0.4', '5/2'])('rejects wrong value %s', (v) => expect(grade(half, T(v))).toMatchObject({ correct: false, reason: 'wrong-value' }));
  it('rejects empty and unparsable', () => {
    expect(grade(half, T('')).reason).toBe('empty');
    expect(grade(half, T('half')).reason).toBe('unparsable');
    expect(grade(half, T('1/0')).reason).toBe('unparsable');
  });
  it('requireLowest flags unsimplified answers', () => {
    const s: AnswerSpec = { kind: 'fraction', num: 3, den: 4, requireLowest: true };
    expect(grade(s, T('3/4')).correct).toBe(true);
    expect(grade(s, T('6/8')).reason).toBe('not-lowest');
  });
  it('decimals can be disallowed', () => {
    expect(grade({ kind: 'fraction', num: 1, den: 4, acceptDecimal: false }, T('0.25')).correct).toBe(false);
  });
  it('mixed numbers and negatives', () => {
    expect(grade({ kind: 'fraction', num: 3, den: 2 }, T('1 1/2')).correct).toBe(true);
    expect(grade({ kind: 'fraction', num: -3, den: 4 }, T('-3/4')).correct).toBe(true);
    expect(grade({ kind: 'fraction', num: -3, den: 4 }, T('3/-4')).correct).toBe(true);
  });
  it('parses exact decimals', () => expect(parseRational('0.125')).toEqual({ num: 1, den: 8 }));
});

describe('numeric grading with units and tolerance', () => {
  const speed: AnswerSpec = { kind: 'number', value: 20, unit: 'm/s', requireUnit: true };
  it('accepts the value with the right unit', () => expect(grade(speed, T('20 m/s')).correct).toBe(true));
  it('converts valid units', () => expect(grade(speed, T('72 km/h')).correct).toBe(true));
  it('flags missing unit', () => expect(grade(speed, T('20')).reason).toBe('missing-unit'));
  it('flags wrong dimension', () => expect(grade(speed, T('20 m')).reason).toBe('wrong-unit'));
  it('unit optional when not required', () => expect(grade({ kind: 'number', value: 5, unit: 'N' }, T('5')).correct).toBe(true));
  it('length conversions', () => {
    expect(grade({ kind: 'number', value: 1.5, unit: 'm', requireUnit: true }, T('150 cm')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 2, unit: 'km' }, T('2000 m')).correct).toBe(true);
  });
  it('rupees prefix and paise', () => {
    expect(grade({ kind: 'number', value: 45, unit: '₹' }, T('₹45')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 45, unit: '₹' }, T('Rs. 45')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 2.5, unit: '₹' }, T('250 paise')).correct).toBe(true);
  });
  it('tolerance and boundaries', () => {
    const g: AnswerSpec = { kind: 'number', value: 9.8, tolerance: 0.05 };
    expect(grade(g, T('9.8')).correct).toBe(true);
    expect(grade(g, T('9.85')).correct).toBe(true);
    expect(grade(g, T('9.86')).correct).toBe(false);
    expect(grade({ kind: 'number', value: 3.14159, relTolerance: 0.01 }, T('3.14')).correct).toBe(true);
  });
  it('Indian digit grouping, unicode minus, superscripts', () => {
    expect(grade({ kind: 'number', value: 125000 }, T('1,25,000')).correct).toBe(true);
    expect(grade({ kind: 'number', value: -7 }, T('−7')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 300000000, unit: 'm/s' }, T('3e8 m/s')).correct).toBe(true);
  });
  it('splits units', () => expect(splitUnit('25 km/h')).toEqual({ num: '25', unit: 'km/h' }));
  it('energy, power, electricity', () => {
    expect(grade({ kind: 'number', value: 2, unit: 'kJ', requireUnit: true }, T('2000 J')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 0.5, unit: 'A', requireUnit: true }, T('500 mA')).correct).toBe(true);
    expect(grade({ kind: 'number', value: 12, unit: 'Ω', requireUnit: true }, T('12 ohm')).correct).toBe(true);
  });
});

describe('other answer kinds', () => {
  it('choice, multi, order, match, text, expression', () => {
    expect(grade({ kind: 'choice', correct: 'b' }, { kind: 'choice', value: 'b' }).correct).toBe(true);
    expect(grade({ kind: 'multi', correct: ['a', 'c'] }, { kind: 'multi', value: ['c', 'a'] }).correct).toBe(true);
    expect(grade({ kind: 'multi', correct: ['a', 'c'] }, { kind: 'multi', value: ['a'] }).correct).toBe(false);
    expect(grade({ kind: 'order', correct: ['1', '2', '3'] }, { kind: 'order', value: ['1', '3', '2'] }).correct).toBe(false);
    expect(grade({ kind: 'match', pairs: { a: 'x', b: 'y' } }, { kind: 'match', value: { b: 'y', a: 'x' } }).correct).toBe(true);
    expect(grade({ kind: 'text', accept: ['Isosceles'] }, T('isosceles.')).correct).toBe(true);
    expect(grade({ kind: 'expression', accept: ['x=5'] }, T('x = 5')).correct).toBe(true);
    expect(grade({ kind: 'choice', correct: 'b' }, null).reason).toBe('empty');
  });
});

describe('deterministic rng', () => {
  it('same seed → same sequence; different seeds differ', () => {
    const a = rng(7), b = rng(7), c = rng(8);
    const sa = [a.int(0, 1000), a.int(0, 1000), a.next()], sb = [b.int(0, 1000), b.int(0, 1000), b.next()];
    expect(sa).toEqual(sb);
    expect([c.int(0, 1000), c.int(0, 1000)]).not.toEqual(sa.slice(0, 2));
  });
});

describe('mastery', () => {
  it('requires distinct correct answers and a streak', () => {
    let m = emptyMastery('o', 0);
    for (let i = 0; i < MASTERY_DISTINCT; i++) m = applyAttempt(m, { questionId: 'same', correct: true, hintsUsed: 0, mode: 'practice', at: i });
    expect(m.masteredAt).toBeNull(); // the same question repeated is not mastery
    for (let i = 0; i < MASTERY_DISTINCT; i++) m = applyAttempt(m, { questionId: `t#${i}`, correct: true, hintsUsed: 0, mode: 'practice', at: 10 + i });
    expect(m.masteredAt).not.toBeNull();
  });
  it('misses schedule a review and lower difficulty', () => {
    let m = emptyMastery('o', 0);
    m = applyAttempt(m, { questionId: 'a', correct: true, hintsUsed: 0, mode: 'practice', at: 0 });
    m = applyAttempt(m, { questionId: 'b', correct: true, hintsUsed: 0, mode: 'practice', at: 1 });
    m = applyAttempt(m, { questionId: 'c', correct: true, hintsUsed: 0, mode: 'practice', at: 2 });
    expect(difficultyFor(m)).toBe(2);
    m = applyAttempt(m, { questionId: 'd', correct: false, hintsUsed: 0, mode: 'practice', at: 100 });
    expect(m.nextReviewAt).toBe(100 + 86400);
    expect(m.streak).toBe(0);
  });
  it('learn mode does not count', () => {
    const m = applyAttempt(emptyMastery('o'), { questionId: 'a', correct: true, hintsUsed: 0, mode: 'learn', at: 5 });
    expect(m.attempts).toBe(0);
  });
});

describe('recommendations', () => {
  const o = (id: string, prereqs: string[] = []) => ({ id, title: { en: id }, prereqs, intro: [], examples: [], templates: [] });
  const units = [{ id: 'u1', board: 'cbse', classLevel: 7, subject: 'math', title: { en: 'Fractions' }, source: null, review: { validated: true, educator: 'pending' }, objectives: [o('a'), o('b', ['a']), o('c', ['b'])] }] as unknown as Unit[];
  it('starts at the first objective', () => expect(recommend(units, {}, 1000)).toMatchObject({ objectiveId: 'a', kind: 'start' }));
  it('due review comes first, with an explanation', () => {
    const r = recommend(units, { b: { ...emptyMastery('b'), attempts: 2, nextReviewAt: 500 } }, 1000);
    expect(r).toMatchObject({ objectiveId: 'b', kind: 'review' });
    expect(r!.reason.en).toMatch(/tricky/);
  });
  it('respects prerequisites', () => {
    const r = recommend(units, { a: { ...emptyMastery('a'), masteredAt: 1, attempts: 5, correct: 5 } }, 1000);
    expect(r!.objectiveId).toBe('b');
  });
});

describe('validation catches bad answer keys', () => {
  const base: Question = { id: 'q', version: 1, objectiveId: 'o', type: 'mcq', prompt: { en: 'Pick' }, choices: [{ id: 'a', label: { en: '1' } }, { id: 'b', label: { en: '2' } }], answer: { kind: 'choice', correct: 'a' }, hints: [{ en: 'h' }], solution: [{ en: 's' }], difficulty: 1 };
  it('valid question passes', () => expect(validateQuestion(base).filter((i) => i.level === 'error')).toHaveLength(0));
  it('answer not among choices fails', () => expect(validateQuestion({ ...base, answer: { kind: 'choice', correct: 'z' } }).some((i) => /not one of the choices/.test(i.message))).toBe(true));
  it('duplicate choices fail', () => expect(validateQuestion({ ...base, choices: [{ id: 'a', label: { en: '1' } }, { id: 'b', label: { en: '1' } }] }).some((i) => /identical/.test(i.message))).toBe(true));
});

describe('age-tiered presentation', () => {
  it('tiers by class', () => { expect(tierForClass(0)).toBe('early'); expect(tierForClass(5)).toBe('primary'); expect(tierForClass(8)).toBe('middle'); expect(tierForClass(12)).toBe('senior'); });
  it('young age band softens presentation; Telugu offered at every class', () => {
    expect(presentationFor(4, '5-6')).toMatchObject({ readAloud: true, bigTargets: true, teluguAvailable: true });
    expect(presentationFor(6, '9-10')).toMatchObject({ readAloud: false, teluguAvailable: false });
    expect(presentationFor(0, '3-4').allowTyping).toBe(false);
  });
});
