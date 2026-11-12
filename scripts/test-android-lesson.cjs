// Tests the lesson engine module (android/engine/lesson.ts) inside the bundled engine.js, in Node.
// For every class: curriculum loads, every objective loads, practice/test/learn questions resolve to a drawable
// view, grading with the correct answer works, state restore keeps the website's LessonState shape, the diagnostic
// runs, and "what next" recommends something.   Usage: node scripts/build-android-engine.mjs && node scripts/test-android-lesson.cjs
const path = require('node:path');
require(path.resolve(__dirname, '../android/app/src/main/assets/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));
let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; if (fails < 40) console.log('FAIL', msg); } };

const fns = JSON.parse(W.list()).lesson;
for (const f of ['load', 'view', 'check', 'answerable', 'gradeStep', 'fresh', 'nextPractice', 'similar', 'buildTest', 'restore', 'applyKey', 'restoreDiag', 'diagnosticCount', 'diagnosticStart', 'diagnosticSummary', 'curriculum', 'classLabels', 'next']) ok(fns.includes(f), `missing lesson.${f}`);

/** A response that answers the question correctly, built from the view (like a learner would). */
function correctResponse(v) {
  const a = v.q.answer;
  switch (v.kind) {
    case 'choice': { const id = Object.keys(v.choiceCorrect).find((k) => v.choiceCorrect[k]); return id ? v.choiceResponses[id] : null; }
    case 'multi': return { kind: 'multi', value: v.multiCorrect };
    case 'order': return { kind: 'order', value: v.orderCorrect };
    case 'match': return { kind: 'match', value: v.matchPairs };
    case 'numberline': return v.lineCorrect == null ? null : { kind: 'text', value: v.lineLabels[v.lineCorrect] };
    default: return a.kind === 'choice' ? null : { kind: 'text', value: v.answerText };
  }
}

const kinds = {}, visuals = {};
const countVis = (x) => { if (Array.isArray(x)) return x.forEach(countVis); if (x && typeof x === 'object') { if (x.alt && x.kind) visuals[x.kind] = (visuals[x.kind] || 0) + 1; Object.values(x).forEach(countVis); } };

for (let level = 0; level <= 12; level++) {
  const tier = call('core.tier', level);
  const cur = call('lesson.curriculum', level);
  ok(cur.units.length > 0, `class ${level} has units`);
  let objs = 0, qs = 0;
  for (const u of cur.units) {
    const first = call('lesson.load', level, u.id, null);
    ok(first && first.objective.id === u.objectives[0].id, `${u.id} first objective`);
    for (const o of u.objectives) {
      objs++;
      const info = call('lesson.load', level, u.id, o.id);
      ok(info && info.stages.length >= 2 && info.stages.at(-1).kind === 'review', `${o.id} stages`);
      countVis(info.objective);
      for (const a of info.activities) ok(a.path && a.path.startsWith('/'), `${o.id} activity path ${a.id}`);
      if (!info.hasQuestions) continue;
      const ids = new Set();
      for (let i = 0; i < 3; i++) { const id = call('lesson.nextPractice', level, o.id, tier, null, null); if (id) ids.add(id); }
      const tryId = call('lesson.fresh', level, o.id, tier, 1, null, []);
      if (tryId) ids.add(tryId);
      const test = call('lesson.buildTest', level, o.id, tier);
      test.ids.forEach((id) => ids.add(id));
      ok(ids.size > 0, `${o.id} has a resolvable question at tier ${tier}`);
      for (const id of ids) {
        const v = call('lesson.view', level, o.id, id, tier);
        ok(v && v.q && v.q.prompt && v.q.prompt.en, `${id} view`);
        if (!v) continue;
        qs++;
        kinds[v.kind] = (kinds[v.kind] || 0) + 1;
        countVis(v.q);
        const r = correctResponse(v);
        if (r) {
          const res = call('lesson.check', level, o.id, id, tier, r);
          ok(res && res.correct, `${id} (${v.kind}) graded correct with its own answer ${JSON.stringify(r)} → ${JSON.stringify(res && { reason: res.reason, understood: res.understood })}`);
        }
        const empty = call('lesson.check', level, o.id, id, tier, null);
        ok(empty && (v.kind === 'order' ? !empty.empty : empty.empty && !empty.correct), `${id} empty answer`);
        (v.q.steps || []).forEach((st, i) => ok(call('lesson.gradeStep', level, o.id, id, tier, i, v.stepAnswers[i]), `${id} step ${i} with shown answer`));
        const sim = call('lesson.similar', level, o.id, tier, id, null);
        ok(sim === null || typeof sim === 'string', `${id} similar`);
      }
    }
  }
  // diagnostic
  const n = call('lesson.diagnosticCount', level);
  const items = call('lesson.diagnosticStart', level, tier);
  ok(n === 0 || items.length > 0, `class ${level} diagnostic items`);
  const results = {};
  for (const it of items) {
    const v = call('lesson.view', level, null, it.qid, tier);
    ok(!!v, `diag ${it.qid} view`);
    const r = v && correctResponse(v);
    results[it.qid] = !!(r && call('lesson.check', level, null, it.qid, tier, r).correct);
  }
  const sum = call('lesson.diagnosticSummary', level, items, results);
  ok(items.length === 0 || sum.length > 0, `class ${level} diagnostic summary`);
  const rd = call('lesson.restoreDiag', { v: 1, items, index: 1, results, draft: null, done: false });
  ok(rd && rd.items.length === items.length, `class ${level} restoreDiag`);
  // next
  const nx = call('lesson.next', level, {}, null);
  ok(nx.rec && nx.rec.objectiveTitle && nx.rec.mode === 'learn', `class ${level} next`);
  console.log(`class ${level} (${tier}): ${cur.units.length} units, ${objs} objectives, ${qs} questions viewed, diagnostic ${items.length}/${n}`);
}

// lesson state round trip keeps the website's shape
const st = call('lesson.restore', { v: 1, mode: 'practice', learn: { step: 2, revealed: 1, q: null }, practice: { q: { qid: 'x#1', draft: { kind: 'text', value: '3' }, hints: 1, checked: false, steps: { values: ['1', null], ok: [true] } }, count: 4 }, test: { seed: 5, ids: ['a', 'b'], index: 9, answers: { a: { kind: 'choice', value: 'c1' }, z: { kind: 'text', value: '' } }, submitted: false, recorded: false } });
ok(st.mode === 'practice' && st.practice.count === 4 && st.practice.q.hints === 1 && st.test.index === 1 && !st.test.answers.z && st.learn.q === null, 'restore shape ' + JSON.stringify(st));
ok(call('lesson.restore', 'junk').mode === 'learn', 'restore junk');
// keypad
ok(call('lesson.applyKey', '25', 2, 'unit:m/s').value === '25 m/s', 'unit key');
ok(call('lesson.applyKey', '25 cm', 5, 'unit:m').value === '25 m', 'unit swap');
ok(call('lesson.applyKey', '3', 1, 'frac').value === '3/', 'frac key');

console.log('input kinds:', kinds);
console.log('visual kinds:', visuals);
console.log(`${checks} checks, ${fails} failures`);
process.exit(fails ? 1 : 0);
