// Generates docs/CURRICULUM_COVERAGE.md tables from the live content. Run with vite-node from the repo root.
import { writeFileSync, readFileSync } from 'node:fs';
import { loadAll, diagnosticFor } from '../src/content/index';
import { CLASSES, type ClassLevel } from '../src/shared/levels';
import { rng } from '../src/shared/grading';

const header = readFileSync(process.argv[2] || 'docs/coverage-header.md', 'utf8');
const out: string[] = [header.trimEnd(), ''];
const all = await loadAll();
const summary: string[] = ['| Class | Units (maths / physics / early) | Objectives | Templates | Static items |', '|---|---|---|---|---|'];
const body: string[] = [];
let tot = [0, 0, 0, 0];
const VER = (n?: string) => !n ? '' : n.includes('official NCERT listing') ? 'Confirmed (official CIET/NCERT listing)' : n.includes('corroborated') ? 'Secondary sources — needs educator verification' : n.includes('not confirmed') ? 'Needs educator verification' : n.includes('play-based') ? 'WonderLab play curriculum' : 'Exploration / enrichment (no textbook chapter)';
for (const c of all) {
  const lvl = c.units[0]?.classLevel ?? 0;
  const info = CLASSES[lvl as ClassLevel];
  const objs = c.units.flatMap((u) => u.objectives);
  const items = objs.reduce((a, o) => a + (o.items?.length ?? 0), 0);
  const subj = (s: string) => c.units.filter((u) => u.subject === s).length;
  summary.push(`| ${info.label} | ${c.units.length} (${subj('math')} / ${subj('physics')} / ${subj('early')}) | ${objs.length} | ${Object.keys(c.templates).length} | ${items} |`);
  tot = [tot[0] + c.units.length, tot[1] + objs.length, tot[2] + Object.keys(c.templates).length, tot[3] + items];
  body.push(`\n## ${info.label} (level ${lvl}, key \`${info.key}\`)\n`);
  body.push(`Diagnostic templates: ${diagnosticFor(lvl as ClassLevel).map((d) => `\`${d}\``).join(', ')}\n`);
  body.push('| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |');
  body.push('|---|---|---|---|---|---|---|');
  for (const u of c.units) {
    const s = u.source ? `${u.source.book} · ${u.source.edition} · Ch ${u.source.chapterNo ?? '?'} “${u.source.chapterTitle}”` : '—';
    const ob = u.objectives.map((o) => `\`${o.id}\` ${o.title.en}${o.prereqs.length ? ` (needs ${o.prereqs.join(', ')})` : ''}${o.enrichment ? ' *[enrichment]*' : ''}`).join('<br>');
    const types = new Set<string>();
    for (const o of u.objectives) {
      for (const t of o.templates) for (let sd = 1; sd <= 6; sd++) types.add(c.templates[t].generate(rng(sd), sd).type);
      for (const q of o.items ?? []) types.add(q.type);
    }
    const acts = new Set<string>();
    for (const o of u.objectives) { (o.activities ?? []).forEach((a) => acts.add(a)); o.intro.forEach((b) => b.type === 'activity' && acts.add(b.activityId)); }
    const extra = u.coverageNote && !/^(Chapter confirmed|Chapter title\/number corroborated|Chapter mapping not confirmed|WonderLab play-based|Enrichment \/ exploration unit — not mapped to a prescribed textbook chapter\.)/.test(u.coverageNote.replace(/^.*?\. /, '')) ? '' : '';
    const note = u.coverageNote?.replace(/^(Chapter confirmed from an official NCERT listing \(CIET\)\.|Chapter title\/number corroborated by several secondary listings; needs educator verification against the official NCERT PDF\.|Chapter mapping not confirmed from an official source in this pass; needs educator verification\.|WonderLab play-based pre-primary curriculum \(not an NCERT textbook chapter\)\.|Enrichment \/ exploration unit — not mapped to a prescribed textbook chapter\.)\s*/, '') ?? '';
    body.push(`| ${u.title.en}${u.title.te ? `<br>${u.title.te}` : ''} | ${u.subject} | ${s} | ${VER(u.coverageNote)}${note ? `<br>*${note.replace(/\|/g, '/')}*` : ''}${extra} | ${ob} | ${[...types].join(', ')} | ${[...acts].map((a) => `\`${a}\``).join(' ')} |`);
  }
}
summary.push(`| **Total** | ${tot[0]} | ${tot[1]} | ${tot[2]} | ${tot[3]} |`);
out.push('## Summary\n', ...summary, '', '# Per-class coverage map', ...body, '');
writeFileSync('docs/CURRICULUM_COVERAGE.md', out.join('\n'));
console.log(summary.join('\n'));
