import { describe, expect, it } from 'vitest';
import {
  CONSONANTS, CONSONANT_CARDS, GUNINTHAM_VOWELS, LETTER_CARDS, VOWELS, VOWEL_CARDS, VOWEL_SIGNS, VIRAMA, compose, conjunct, guninthamRow, letterOccurs,
} from '../src/features/language/telugu/script';
import { ALPHABET_CARDS, LOWER, UPPER } from '../src/features/language/english/course';
import { BADGES, COURSES, buildRound, check, earnedUnitBadges, findPassage, findTraceSet, hintsFor, levelsWithContent, objectiveKey, activityId, roundSize, specFor } from '../src/features/language/engine';
import { PASSAGES } from '../src/features/language/passages';
import { TRACE_SETS, dilate, scoreTrace, startPoint } from '../src/features/language/tracing';
import { grade } from '../src/shared/grading';
import type { Item } from '../src/features/language/types';

/** Correct response for an item, as the UI would submit it. */
const correctValue = (it: Item): string | string[] => (it.type === 'build' || it.type === 'order' ? it.answer : it.answer[0]);

function checkItem(it: Item, where: string) {
  const ctx = `${where}/${it.id}`;
  expect(it.prompt.trim(), ctx).not.toBe('');
  expect(it.answer.length, ctx).toBeGreaterThan(0);
  // answer key is among the choices (tiles: as a multiset)
  if (it.type === 'build' || it.type === 'order') {
    const pool = [...it.choices];
    for (const a of it.answer) {
      const i = pool.indexOf(a);
      expect(i, `${ctx}: tile ${a} missing`).toBeGreaterThanOrEqual(0);
      pool.splice(i, 1);
    }
    if (it.type === 'order') expect(pool.length, ctx).toBe(0);
    expect(it.choices.length, ctx).toBeGreaterThanOrEqual(2);
  } else {
    expect(it.choices, ctx).toContain(it.answer[0]);
    expect(new Set(it.choices).size, `${ctx}: duplicate choices ${it.choices.join('|')}`).toBe(it.choices.length);
    expect(it.choices.length, ctx).toBeGreaterThanOrEqual(2);
  }
  // grades correct with the shared grader, and a wrong choice grades wrong
  expect(grade(specFor(it), it.type === 'build' || it.type === 'order' ? { kind: 'order', value: it.answer } : it.type === 'type' ? { kind: 'text', value: it.answer[0] } : { kind: 'choice', value: it.answer[0] }).correct, ctx).toBe(true);
  expect(check(it, correctValue(it)), ctx).toBe(true);
  if (it.type !== 'build' && it.type !== 'order') {
    const wrong = it.choices.find((c) => !it.answer.includes(c));
    if (wrong) expect(check(it, wrong), `${ctx}: wrong choice ${wrong} graded correct`).toBe(false);
  } else if (it.answer.length > 1) {
    expect(check(it, [...it.answer].reverse()), `${ctx}: reversed order graded correct`).toBe(false);
  }
  if (it.picChoices) for (const c of it.choices) expect(it.pics?.[c], `${ctx}: picture for ${c}`).toBeTruthy();
}

describe('Telugu script', () => {
  it('has 16 vowels, all unique', () => {
    expect(VOWELS.length).toBe(16);
    expect(new Set(VOWELS).size).toBe(16);
    expect([...VOWELS]).toEqual(['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః']);
  });
  it('has the complete, unique consonant list (క…ఱ)', () => {
    const expected = 'క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ ళ క్ష ఱ'.split(' ');
    expect([...CONSONANTS]).toEqual(expected);
    expect(new Set(CONSONANTS).size).toBe(36);
    // every single-codepoint consonant is in the Telugu consonant block
    for (const c of CONSONANTS.filter((x) => x.length === 1)) { expect(c.charCodeAt(0)).toBeGreaterThanOrEqual(0x0c15); expect(c.charCodeAt(0)).toBeLessThanOrEqual(0x0c39); }
  });
  it('every letter has a picture word containing / starting with it', () => {
    expect(VOWEL_CARDS.map((c) => c.letter)).toEqual([...VOWELS]);
    expect(CONSONANT_CARDS.map((c) => c.letter)).toEqual([...CONSONANTS]);
    for (const c of [...VOWEL_CARDS, ...CONSONANT_CARDS]) {
      expect(letterOccurs(c.letter, c.word), `${c.letter} – ${c.word}`).toBe(true);
      expect(c.pic, c.letter).toBeTruthy();
      expect(c.en, c.letter).toBeTruthy();
    }
    // most picture words start with their letter
    const starting = [...VOWEL_CARDS, ...CONSONANT_CARDS].filter((c) => c.word.startsWith(c.letter)).length;
    expect(starting).toBeGreaterThanOrEqual(40);
    expect(Object.keys(LETTER_CARDS).length).toBe(52);
  });
  it('గుణింతం builder composes the correct Unicode for every consonant × vowel sign', () => {
    const expectedSign: Record<string, number | null> = { 'అ': null, 'ఆ': 0x0c3e, 'ఇ': 0x0c3f, 'ఈ': 0x0c40, 'ఉ': 0x0c41, 'ఊ': 0x0c42, 'ఋ': 0x0c43, 'ఎ': 0x0c46, 'ఏ': 0x0c47, 'ఐ': 0x0c48, 'ఒ': 0x0c4a, 'ఓ': 0x0c4b, 'ఔ': 0x0c4c, 'అం': 0x0c02, 'అః': 0x0c03 };
    expect(GUNINTHAM_VOWELS.length).toBe(15);
    for (const c of CONSONANTS) {
      for (const v of GUNINTHAM_VOWELS) {
        const s = compose(c, v);
        const want = expectedSign[v] === null ? c : c + String.fromCharCode(expectedSign[v]!);
        expect(s, `${c}+${v}`).toBe(want);
        expect(s.normalize('NFC')).toBe(s);
      }
      expect(guninthamRow(c).length).toBe(15);
      expect(new Set(guninthamRow(c)).size).toBe(15);
    }
    // spot checks with literal strings
    expect(compose('క', 'ఇ')).toBe('కి');
    expect(compose('క', 'ఆ')).toBe('కా');
    expect(compose('మ', 'ఉ')).toBe('ము');
    expect(compose('క', 'ఒ')).toBe('కొ');
    expect(compose('క', 'ఐ')).toBe('కై');
    expect(compose('క', 'అం')).toBe('కం');
    expect(compose('క', 'ఋ')).toBe('కృ');
    expect(guninthamRow('క').join(' ')).toBe('క కా కి కీ కు కూ కృ కె కే కై కొ కో కౌ కం కః');
    expect(VOWEL_SIGNS['ౠ']).toBe('ౄ');
  });
  it('builds ఒత్తులు with the virama', () => {
    expect(conjunct('క', 'క')).toBe('క్క');
    expect(conjunct('మ', 'మ')).toBe('మ్మ');
    expect(conjunct('ప', 'ర')).toBe('ప్ర');
    expect(conjunct('క', 'ష')).toBe(CONSONANTS[34]);
    expect(VIRAMA.charCodeAt(0)).toBe(0x0c4d);
  });
});

describe('English alphabet', () => {
  it('has A–Z cards with picture words containing the letter', () => {
    expect(UPPER.length).toBe(26);
    expect(LOWER.join('')).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(ALPHABET_CARDS.map((c) => c.letter)).toEqual(UPPER);
    for (const c of ALPHABET_CARDS) expect(c.word.toUpperCase().includes(c.letter), c.letter).toBe(true);
  });
});

for (const course of Object.values(COURSES)) {
  describe(`${course.titleEn} course`, () => {
    it('has units for every class (Nursery to Class 10)', () => {
      expect(levelsWithContent(course.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
    it('has no duplicate unit, objective or item ids', () => {
      const unitIds = course.units.map((u) => u.id);
      expect(new Set(unitIds).size).toBe(unitIds.length);
      for (const reserved of ['trace', 'read', 'print']) expect(unitIds).not.toContain(reserved);
      const itemIds = new Set<string>();
      for (const u of course.units) {
        const objIds = u.objectives.map((o) => o.id);
        expect(new Set(objIds).size, u.id).toBe(objIds.length);
        for (const o of u.objectives) {
          for (const it of o.items) {
            expect(itemIds.has(it.id), `duplicate item id ${it.id} in ${u.id}/${o.id}`).toBe(false);
            itemIds.add(it.id);
          }
        }
      }
    });
    it('every objective has ≥2 examples and ≥5 distinct, valid items', () => {
      for (const u of course.units) {
        expect(u.objectives.length, u.id).toBeGreaterThan(0);
        for (const o of u.objectives) {
          const where = `${u.id}/${o.id}`;
          expect(o.examples.length, where).toBeGreaterThanOrEqual(2);
          expect(o.items.length, where).toBeGreaterThanOrEqual(5);
          const distinct = new Set(o.items.map((it) => `${it.prompt}|${it.say || ''}|${it.pic || ''}|${it.answer.join(',')}`));
          expect(distinct.size, `${where}: items not distinct`).toBe(o.items.length);
          for (const it of o.items) checkItem(it, where);
          if (course.id === 'telugu') {
            expect(o.introEn, `${where}: English gloss for intro`).toBeTruthy();
            expect(o.titleEn, where).toBeTruthy();
            for (const ex of o.examples) expect(ex.en, `${where}: example gloss`).toBeTruthy();
            for (const it of o.items) expect(it.en, `${where}/${it.id}: English gloss`).toBeTruthy();
          }
        }
      }
    });
    it('linked trace sets and passages exist and belong to this course', () => {
      for (const u of course.units) {
        for (const s of u.trace || []) expect(findTraceSet(s)?.course, `${u.id} → ${s}`).toBe(course.id);
        for (const p of u.read || []) expect(findPassage(p)?.course, `${u.id} → ${p}`).toBe(course.id);
      }
    });
    it('rounds are deterministic, sized correctly and keep every item gradeable', () => {
      for (const u of course.units) for (const o of u.objectives) {
        for (const seed of [1, 42, 99991]) {
          const size = roundSize('test', 'senior', o.items.length);
          const a = buildRound(o, seed, size), b = buildRound(o, seed, size);
          expect(a.map((r) => r.item.id + r.choices.join())).toEqual(b.map((r) => r.item.id + r.choices.join()));
          expect(a.length).toBe(Math.min(size, o.items.length));
          expect(a.length).toBeGreaterThanOrEqual(5);
          for (const r of a) {
            expect([...r.choices].sort()).toEqual([...r.item.choices].sort());
            if (r.item.type === 'order') expect(r.choices.join('|')).not.toBe(r.item.answer.join('|'));
            const hs = hintsFor(r.item, r.choices);
            for (const h of hs) if (h.eliminate) expect(r.item.answer).not.toContain(h.eliminate);
          }
        }
      }
    });
  });
}

describe('passages (read-along)', () => {
  it('have unique ids, text, and 2–4 valid comprehension questions', () => {
    const ids = PASSAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PASSAGES) {
      expect(p.lines.length, p.id).toBeGreaterThanOrEqual(4);
      expect(p.questions.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.questions.length, p.id).toBeLessThanOrEqual(4);
      expect(new Set(p.questions.map((q) => q.id)).size).toBe(p.questions.length);
      for (const q of p.questions) checkItem(q, p.id);
      if (p.course === 'telugu') {
        expect(p.linesEn?.length, p.id).toBe(p.lines.length);
        for (const q of p.questions) expect(q.en, `${p.id}/${q.id}`).toBeTruthy();
      }
    }
  });
  it('one passage per class per course', () => {
    for (const c of ['telugu', 'english'] as const) {
      const levels = PASSAGES.filter((p) => p.course === c).map((p) => p.level).sort((a, b) => a - b);
      expect(levels).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  });
});

describe('tracing', () => {
  const W = 40, H = 40;
  const rect = (x0: number, y0: number, x1: number, y1: number) => { const m = new Uint8Array(W * H); for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) m[y * W + x] = 1; return m; };
  it('trace sets have unique ids and letters', () => {
    expect(new Set(TRACE_SETS.map((s) => s.id)).size).toBe(TRACE_SETS.length);
    for (const s of TRACE_SETS) { expect(s.letters.length).toBeGreaterThan(0); expect(new Set(s.letters).size).toBe(s.letters.length); }
  });
  it('dilate grows a single cell into a square', () => {
    const m = new Uint8Array(W * H); m[20 * W + 20] = 1;
    const d = dilate(m, W, H, 2);
    let n = 0; for (const v of d) n += v;
    expect(n).toBe(25);
    expect(d[18 * W + 18]).toBe(1);
    expect(d[17 * W + 20]).toBe(0);
  });
  it('scores a faithful trace highly and scribbles / empty ink low', () => {
    const glyph = rect(10, 5, 16, 35); // a thick vertical bar
    const good = rect(12, 6, 14, 34);
    expect(scoreTrace(glyph, good, W, H, 'medium').stars).toBe(3);
    const half = rect(12, 6, 14, 18);
    const rh = scoreTrace(glyph, half, W, H, 'medium');
    expect(rh.stars).toBeLessThan(3);
    expect(rh.coverage).toBeLessThan(0.7);
    const scribble = rect(0, 0, 40, 40);
    const rs = scoreTrace(glyph, scribble, W, H, 'medium');
    expect(rs.outside).toBeGreaterThan(0.5);
    expect(rs.stars).toBeLessThanOrEqual(1);
    expect(scoreTrace(glyph, new Uint8Array(W * H), W, H).stars).toBe(0);
    // tolerance: a slightly offset line passes on easy but scores lower on hard
    const off = rect(18, 6, 20, 34);
    expect(scoreTrace(glyph, off, W, H, 'easy').score).toBeGreaterThan(scoreTrace(glyph, off, W, H, 'hard').score);
  });
  it('start point is on the glyph', () => {
    const glyph = rect(10, 5, 16, 35);
    const te = startPoint(glyph, W, H, 'te')!, en = startPoint(glyph, W, H, 'en')!;
    expect(glyph[te[1] * W + te[0]]).toBe(1);
    expect(glyph[en[1] * W + en[0]]).toBe(1);
    expect(en[1]).toBe(5);
    expect(te[0]).toBe(10);
  });
});

describe('progress and badges', () => {
  it('awards a unit badge only when every objective is passed', () => {
    const u = COURSES.telugu.units.find((x) => x.id === 'te-l-vowels')!;
    const acts: Record<string, { state: unknown; updatedAt: number }> = {};
    acts[activityId(objectiveKey('telugu', u.id, u.objectives[0].id))] = { state: { practiceBest: 0.9 }, updatedAt: 1 };
    expect(earnedUnitBadges('telugu', acts)).not.toContain('lang:te-vowels');
    acts[activityId(objectiveKey('telugu', u.id, u.objectives[1].id))] = { state: { testBest: 0.8 }, updatedAt: 1 };
    expect(earnedUnitBadges('telugu', acts)).toContain('lang:te-vowels');
  });
  it('badge ids are unique and include vowels, consonants and first story', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['lang:te-vowels', 'lang:te-consonants', 'lang:first-story', 'lang:en-alphabet']) expect(ids).toContain(id);
  });
});
