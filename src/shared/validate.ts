// Content validation used by tests, the seed script and the educator editor's "Validate" step.
import { checkExplore } from './formula';
import type { Question, Objective, Template, Unit } from './content';
import { grade, rng, type Response } from './grading';

export interface ValidationIssue { level: 'error' | 'warning'; path: string; message: string }

/** Builds the response a learner would give if they answered exactly the key. */
export function keyResponse(q: Question): Response | null {
  const a = q.answer;
  switch (a.kind) {
    case 'choice': return { kind: 'choice', value: a.correct };
    case 'multi': return { kind: 'multi', value: a.correct };
    case 'order': return { kind: 'order', value: a.correct };
    case 'match': return { kind: 'match', value: a.pairs };
    case 'text': return { kind: 'text', value: a.accept[0] ?? '' };
    case 'expression': return { kind: 'text', value: a.accept[0] ?? '' };
    case 'fraction': return { kind: 'text', value: `${a.num}/${a.den}` };
    case 'number': return { kind: 'text', value: `${a.value}${a.unit ? ' ' + a.unit : ''}` };
  }
}

export function validateQuestion(q: Question, path = q.id): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const e = (message: string) => out.push({ level: 'error', path, message });
  const w = (message: string) => out.push({ level: 'warning', path, message });
  if (!q.id) e('missing id');
  if (!q.prompt?.en?.trim()) e('missing English prompt');
  if (!q.solution?.length) e('missing worked solution');
  if (!q.hints?.length) w('no hints');
  const a = q.answer;
  if (!a) { e('missing answer key'); return out; }
  if (a.kind === 'choice' || a.kind === 'multi') {
    const ids = new Set((q.choices || []).map((c) => c.id));
    if ((q.choices || []).length < 2) e('needs at least 2 choices');
    if (ids.size !== (q.choices || []).length) e('duplicate choice ids');
    const keys = a.kind === 'choice' ? [a.correct] : a.correct;
    for (const k of keys) if (!ids.has(k)) e(`answer "${k}" is not one of the choices`);
    const labels = (q.choices || []).map((c) => c.label.en.trim().toLowerCase() + JSON.stringify(c.visual ?? ''));
    if (new Set(labels).size !== labels.length) e('two choices look identical');
  }
  if (a.kind === 'order') {
    const ids = new Set((q.choices || []).map((c) => c.id));
    if (a.correct.some((k) => !ids.has(k)) || a.correct.length !== ids.size) e('order answer must use every choice exactly once');
  }
  if (a.kind === 'match') {
    const L = new Set((q.left || []).map((c) => c.id)), Rr = new Set((q.right || []).map((c) => c.id));
    for (const [l, r] of Object.entries(a.pairs)) if (!L.has(l) || !Rr.has(r)) e(`match pair ${l}->${r} references unknown items`);
  }
  if (a.kind === 'number' && !Number.isFinite(a.value)) e('numeric answer is not finite');
  if (a.kind === 'fraction' && a.den === 0) e('fraction denominator is zero');
  if (a.kind === 'text' && !a.accept.length) e('no accepted text answers');
  const kr = keyResponse(q);
  if (kr && !grade(a, kr).correct) e('answer key does not grade as correct');
  for (const [i, s] of (q.steps || []).entries()) {
    const sq = { ...q, answer: s.answer } as Question;
    const sr = keyResponse(sq);
    if (sr && !grade(s.answer, sr).correct) e(`step ${i + 1} key does not grade as correct`);
  }
  return out;
}

/** Runs a template across many seeds: every output must validate, be deterministic, and vary. */
export function validateTemplate(t: Template, samples = 60): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (let s = 1; s <= samples; s++) {
    let q: Question;
    try { q = t.generate(rng(s), s); } catch (ex) { out.push({ level: 'error', path: t.id, message: `seed ${s} threw: ${(ex as Error).message}` }); continue; }
    const again = t.generate(rng(s), s);
    if (JSON.stringify(again) !== JSON.stringify(q)) out.push({ level: 'error', path: t.id, message: `seed ${s} is not deterministic` });
    if (q.objectiveId !== t.objectiveId) out.push({ level: 'error', path: t.id, message: 'objectiveId mismatch' });
    out.push(...validateQuestion(q, `${t.id}#${s}`).filter((i) => i.level === 'error'));
    seen.add(q.prompt.en + JSON.stringify(q.visual ?? '') + JSON.stringify(q.choices?.map((c) => c.label.en) ?? ''));
  }
  if (seen.size < 5) out.push({ level: 'error', path: t.id, message: `only ${seen.size} distinct questions across ${samples} seeds (need >= 5)` });
  return out;
}

export function validateObjective(o: Objective, templates: Record<string, Template>): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  if ((o.examples || []).length < 2) out.push({ level: 'error', path: o.id, message: 'needs at least 2 worked examples/demonstrations' });
  if (!o.intro?.length) out.push({ level: 'error', path: o.id, message: 'missing introduction' });
  for (const b of o.intro || []) if (b.type === 'explore') for (const m of checkExplore(b.explore)) out.push({ level: 'error', path: o.id, message: `explorer: ${m}` });
  const tpl = o.templates.map((id) => templates[id]);
  if (tpl.some((t) => !t)) out.push({ level: 'error', path: o.id, message: `unknown template: ${o.templates.filter((id) => !templates[id]).join(', ')}` });
  const staticCount = (o.items || []).length;
  if (!o.templates.length && staticCount < 5) out.push({ level: 'error', path: o.id, message: 'needs >= 5 validated practice items (templates or static)' });
  for (const q of o.items || []) out.push(...validateQuestion(q));
  return out;
}

export function validateUnit(u: Unit, templates: Record<string, Template>): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  if (!u.objectives.length) out.push({ level: 'error', path: u.id, message: 'unit has no objectives' });
  const ids = new Set<string>();
  for (const o of u.objectives) {
    if (ids.has(o.id)) out.push({ level: 'error', path: o.id, message: 'duplicate objective id' });
    ids.add(o.id);
    out.push(...validateObjective(o, templates));
  }
  return out;
}
