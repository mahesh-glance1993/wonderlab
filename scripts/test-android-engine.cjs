// Smoke test for android/shared/src/commonMain/composeResources/files/engine.js in Node: every class outline loads,
// every template generates a question, and grading runs.  Usage: node scripts/test-android-engine.cjs
const path = require('node:path');
require(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));
console.log('modules:', W.list());
let qs = 0, bad = 0;
for (let l = 0; l <= 12; l++) {
  const o = call('core.outline', l);
  for (const t of o.templates) {
    for (const seed of [1, 7, 42]) {
      try {
        const q = call('core.generate', l, t.id, seed);
        if (!q || !q.prompt || !q.answer) throw new Error('empty');
        call('core.grade', q.answer, null);
        qs++;
      } catch (e) { bad++; if (bad < 10) console.log('FAIL', l, t.id, seed, e.message); }
    }
  }
  console.log(`class ${l}: ${o.units.length} units, ${o.templates.length} templates`);
}
console.log(`${qs} questions generated, ${bad} failures`);
console.log('recommend:', call('core.recommend', 6, {}).objectiveId);
process.exit(bad ? 1 : 0);
