import { describe, it, expect } from 'vitest';
import { loadClass, loadAll, applyOverrides, diagnosticFor, type ClassContent } from '../src/content/index';
import { validateTemplate, validateUnit, keyResponse } from '../src/shared/validate';
import { grade, rng, parseRational } from '../src/shared/grading';
import type { Question } from '../src/shared/content';
import { CLASSES, type ClassLevel } from '../src/shared/levels';

const LEVELS = CLASSES.map((c) => c.level);
const ACTIVITY = /^(game:(counting|shapes|patterns|numberline|fractions|logic|balance|circuits)|lab:(motion|forces|circuit|light)(\?[a-z]+=[\d.]+(&[a-z]+=[\d.]+)*)?|art:(trace|color))$/;
const fmt = (issues: { path: string; message: string }[]) => issues.map((i) => `${i.path}: ${i.message}`).join('\n');

const sample = (c: ClassContent, id: string, seeds = 60): Question[] => {
  const t = c.templates[id];
  return Array.from({ length: seeds }, (_, i) => t.generate(rng(i + 1), i + 1));
};

describe.each(LEVELS)('class level %i', (level) => {
  const key = CLASSES[level].key;

  it(`${key}: units and objectives validate with zero errors`, async () => {
    const c = await loadClass(level as ClassLevel);
    expect(c.units.length, 'class has units').toBeGreaterThan(0);
    const errors = c.units.flatMap((u) => validateUnit(u, c.templates)).filter((i) => i.level === 'error');
    expect(fmt(errors)).toBe('');
    for (const u of c.units) {
      expect(u.classLevel).toBe(level);
      expect(u.review.educator).toBe('pending');
      if (level <= 2) expect(u.board).toBe('play');
      else expect(['cbse', 'ts', 'ap']).toContain(u.board);
      if (u.source) expect(u.source.book && u.source.edition && u.source.chapterTitle).toBeTruthy();
    }
  });

  it(`${key}: every template validates (deterministic, valid keys, >=5 distinct)`, async () => {
    const c = await loadClass(level as ClassLevel);
    const errors = Object.values(c.templates).flatMap((t) => validateTemplate(t)).filter((i) => i.level === 'error');
    expect(fmt(errors)).toBe('');
    for (const [id, t] of Object.entries(c.templates)) {
      expect(t.id).toBe(id);
      const q = t.generate(rng(7), 7);
      expect(q.id).toBe(`${id}#7`);
      expect(q.version).toBe(t.version);
      expect(q.solution.length).toBeGreaterThan(0);
      expect(q.hints.length, `${id} hints`).toBeGreaterThan(0);
    }
  });

  it(`${key}: each objective has intro, >=2 examples, >=5 distinct practice items, valid links`, async () => {
    const c = await loadClass(level as ClassLevel);
    const referenced = new Set<string>();
    for (const u of c.units) for (const o of u.objectives) {
      expect(o.intro.length, `${o.id} intro`).toBeGreaterThan(0);
      expect(o.examples.length, `${o.id} examples`).toBeGreaterThanOrEqual(2);
      const distinct = new Set<string>();
      for (const tid of o.templates) {
        referenced.add(tid);
        for (const q of sample(c, tid)) distinct.add(q.prompt.en + JSON.stringify(q.visual ?? '') + JSON.stringify(q.choices?.map((x) => x.label.en) ?? ''));
      }
      for (const q of o.items ?? []) { distinct.add(q.id); expect(q.version).toBeGreaterThanOrEqual(1); expect(q.objectiveId).toBe(o.id); }
      expect(distinct.size, `${o.id} distinct items`).toBeGreaterThanOrEqual(5);
      for (const a of o.activities ?? []) expect(a, `${o.id} activity`).toMatch(ACTIVITY);
      for (const b of o.intro) if (b.type === 'activity') expect(b.activityId, `${o.id} intro activity`).toMatch(ACTIVITY);
    }
    expect(Object.keys(c.templates).filter((id) => !referenced.has(id)), 'orphan templates').toEqual([]);
  });

  if (level <= 5) {
    it(`${key}: Telugu present for titles, intro text, prompts, hints and solutions (Nursery–Class 3)`, async () => {
      const c = await loadClass(level as ClassLevel);
      const missing: string[] = [];
      for (const u of c.units) {
        if (!u.title.te) missing.push(`${u.id} unit title`);
        for (const o of u.objectives) {
          if (!o.title.te) missing.push(`${o.id} title`);
          for (const b of o.intro) if ((b.type === 'text' || b.type === 'tip') && !b.text.te) missing.push(`${o.id} intro text`);
          const qs = [...o.templates.flatMap((tid) => sample(c, tid, 5)), ...(o.items ?? [])];
          for (const q of qs) {
            if (!q.prompt.te) missing.push(`${q.id} prompt`);
            if (q.hints.some((h) => !h.te)) missing.push(`${q.id} hints`);
            if (q.solution.some((s) => !s.te)) missing.push(`${q.id} solution`);
          }
        }
      }
      expect([...new Set(missing)].slice(0, 25)).toEqual([]);
    });
  }

  it(`${key}: diagnostic lists existing templates spanning the class`, async () => {
    const c = await loadClass(level as ClassLevel);
    const d = diagnosticFor(level as ClassLevel);
    expect(d.length).toBeGreaterThanOrEqual(4);
    expect(d.length).toBeLessThanOrEqual(8);
    for (const id of d) expect(c.templates[id], id).toBeDefined();
  });
});

describe('whole curriculum', () => {
  it('ids are unique across all classes', async () => {
    const all = await loadAll();
    expect(all.length).toBe(13);
    const seen = new Map<string, number>();
    const add = (id: string) => seen.set(id, (seen.get(id) ?? 0) + 1);
    for (const c of all) {
      for (const u of c.units) {
        add(`unit:${u.id}`);
        for (const o of u.objectives) {
          add(`obj:${o.id}`);
          o.examples.forEach((e) => add(`ex:${e.id}`));
          (o.items ?? []).forEach((q) => add(`item:${q.id}`));
        }
      }
      Object.keys(c.templates).forEach((id) => add(`tpl:${id}`));
    }
    expect([...seen].filter(([, n]) => n > 1).map(([id]) => id)).toEqual([]);
  });

  it('covers Mathematics for every school class and physics from Class 6', async () => {
    const all = await loadAll();
    for (let l = 3; l <= 12; l++) expect(all[l].units.some((u) => u.subject === 'math' && u.source), `math level ${l}`).toBe(true);
    for (let l = 3; l <= 12; l++) expect(all[l].units.some((u) => u.subject === 'physics'), `physics level ${l}`).toBe(true);
    for (let l = 8; l <= 12; l++) expect(all[l].units.some((u) => u.subject === 'physics' && u.source), `mapped physics level ${l}`).toBe(true);
    for (let l = 0; l <= 2; l++) expect(all[l].units.every((u) => u.subject === 'early')).toBe(true);
  });
});

describe('answer-key spot checks', () => {
  it('Class 5 fraction addition answers equal the true sum', async () => {
    const c = await loadClass(7);
    const ids = Object.keys(c.templates).filter((id) => id.startsWith('c5.frac.add'));
    expect(ids.length).toBeGreaterThan(0);
    let checked = 0;
    for (const id of ids) for (const q of sample(c, id, 30)) {
      const m = q.prompt.en.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)/);
      if (!m || q.answer.kind !== 'fraction') continue;
      const [a, b, x, y] = m.slice(1).map(Number);
      expect(q.answer.num * b * y).toBe((a * y + x * b) * q.answer.den);
      // adding denominators is a targeted mistake
      const wrong = grade(q.answer, { kind: 'text', value: `${a + x}/${b + y}` });
      if ((a + x) * q.answer.den !== q.answer.num * (b + y)) expect(wrong.correct).toBe(false);
      checked++;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it('Class 10 Ohm\'s law numericals accept unit conversions and require units', async () => {
    const c = await loadClass(12);
    const id = Object.keys(c.templates).find((k) => k.startsWith('c10.phy.ohm'));
    expect(id).toBeDefined();
    for (const q of sample(c, id!, 20)) {
      expect(q.answer.kind).toBe('number');
      if (q.answer.kind !== 'number') continue;
      expect(grade(q.answer, keyResponse(q)).correct).toBe(true);
      if (q.answer.requireUnit) expect(grade(q.answer, { kind: 'text', value: String(q.answer.value) }).reason).toBe('missing-unit');
      if (q.answer.unit === 'A') expect(grade(q.answer, { kind: 'text', value: `${q.answer.value * 1000} mA` }).correct).toBe(true);
      if (q.answer.unit === 'V') expect(grade(q.answer, { kind: 'text', value: `${q.answer.value} A` }).reason).toBe('wrong-unit');
      // V = IR consistency check from the prompt numbers
      const v = q.prompt.en.match(/([\d.]+) V\b/), i = q.prompt.en.match(/([\d.]+) A\b/), r = q.prompt.en.match(/([\d.]+) Ω/);
      const vals = [v, i, r].filter(Boolean).length;
      expect(vals).toBe(2);
      if (v && r) expect(q.answer.value).toBeCloseTo(+v[1] / +r[1], 6);
      if (i && r) expect(q.answer.value).toBeCloseTo(+i[1] * +r[1], 6);
      if (v && i) expect(q.answer.value).toBeCloseTo(+v[1] / +i[1], 6);
    }
  });

  it("Class 10 Ohm's law objective links a Circuit Lab preset to verify the result", async () => {
    const c = await loadClass(12);
    const o = c.units.flatMap((u) => u.objectives).find((x) => x.id === 'c10.phy.ohm');
    expect(o).toBeDefined();
    expect(o!.intro.some((b) => b.type === 'activity' && b.activityId.startsWith('lab:circuit?'))).toBe(true);
  });

  it('a speed template accepts km/h ↔ m/s conversion', () => {
    const r = grade({ kind: 'number', value: 10, unit: 'm/s', requireUnit: true }, { kind: 'text', value: '36 km/h' });
    expect(r.correct).toBe(true);
    expect(parseRational('3/4')).toEqual({ num: 3, den: 4 });
  });
});

describe('applyOverrides', () => {
  it('replaces objectives and static questions by id and ignores unknown ids', async () => {
    const c = await loadClass(12);
    const all = await loadAll();
    const withItems = all.flatMap((x) => x.units.flatMap((u) => u.objectives)).find((o) => o.items?.length);
    const o = c.units[0].objectives[0];
    const res = applyOverrides(c, [
      { id: o.id, kind: 'objective', version: 2, data: { title: { en: 'New title' } } },
      { id: 'does.not.exist', kind: 'objective', version: 5, data: { title: { en: 'x' } } },
    ]);
    expect(res.units[0].objectives[0].title.en).toBe('New title');
    expect(res.units[0].objectives[0].examples).toBe(o.examples);
    expect(c.units[0].objectives[0].title.en).not.toBe('New title'); // not mutated
    if (withItems) {
      const owner = all.find((x) => x.units.some((u) => u.objectives.includes(withItems)))!;
      const q = withItems.items![0];
      const r2 = applyOverrides(owner, [{ id: q.id, kind: 'question', version: 3, data: { prompt: { en: 'Edited?' } } }]);
      const edited = r2.units.flatMap((u) => u.objectives).flatMap((x) => x.items ?? []).find((x) => x.id === q.id)!;
      expect(edited.prompt.en).toBe('Edited?');
      expect(edited.version).toBe(3);
      expect(edited.answer).toEqual(q.answer);
    }
  });
});
