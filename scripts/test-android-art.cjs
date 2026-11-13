// Tests for the Art Studio part of android/shared/src/commonMain/composeResources/files/engine.js (run after build-android-engine.mjs):
// every colouring page converts to native draw commands, every tracing sheet/guide expands, tracing
// scoring behaves (perfect trace = 3 stars, scribble = low), guided-stroke messages match the website.
// Usage: node scripts/test-android-art.cjs
const path = require('node:path');
require(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } };

// colouring pages
const pages = call('art.pages');
ok(pages.length >= 21, `pages: ${pages.length}`);
const cats = call('art.categories');
ok(cats.length === 5, 'categories');
for (const p of pages) {
  ok(!('svg' in p), `${p.id}: list has no svg`);
  const d = call('art.pageDrawList', p.id);
  ok(d && d.w === 800 && d.h === 600, `${p.id}: viewBox`);
  ok(d.items.length > 5, `${p.id}: items ${d.items.length}`);
  for (const it of d.items) {
    ok(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(it.d) && /^M/i.test(it.d.trim()), `${p.id}: bad path ${it.d.slice(0, 40)}`);
    ok(it.m.length === 6 && it.m.every(Number.isFinite), `${p.id}: matrix`);
    ok(it.sw > 0, `${p.id}: stroke width`);
  }
  ok(cats.some((c) => c.id === p.category), `${p.id}: category`);
}
ok(call('art.pageDrawList', 'nope') === null, 'unknown page');
const mandala = call('art.pageDrawList', 'mandala');
ok(mandala.items.some((i) => i.m[1] !== 0), 'mandala rotate transform kept');
const honey = call('art.pageDrawList', 'honeycomb');
ok(honey.items.some((i) => i.clip && i.clip[2] === 740), 'honeycomb clip kept');
ok(call('art.pageDrawList', 'water-cycle').texts.some((t) => t.text === 'Evaporation'), 'water cycle labels');

// tracing
const sheets = call('art.sheets');
ok(sheets.length === 7, `sheets: ${sheets.length}`);
let guides = 0;
for (const s of sheets) {
  const full = call('art.sheet', s.id);
  ok(full.guides.length === s.count, `${s.id}: count`);
  for (const g of full.guides) {
    guides++;
    ok(g.polys.length === g.strokes.length && g.polys.every((p) => p.length >= 2), `${g.id}: polys`);
    ok(g.arrows.length === g.polys.length && g.arrows.every((a) => a.length >= 1), `${g.id}: arrows`);
    ok(g.box.length === 4, `${g.id}: box`);
  }
}
ok(guides === 6 + 6 + 8 + 11 + 26 + 26 + 6, `guides: ${guides}`);

// scoring: perfect trace of capital A
const A = call('art.sheet', 'capitals').guides[0];
const perfect = call('art.scoreGuide', 'capitals', 0, A.polys, 'medium', true);
ok(perfect.stars === 3 && perfect.orderOk && perfect.directionOk, `perfect A: ${JSON.stringify(perfect.feedback)}`);
const offset = A.polys.map((p) => p.map(([x, y]) => [x + 30, y]));
ok(call('art.scoreGuide', 'capitals', 0, offset, 'medium', true).stars < 2, 'offset trace scores low');
const reversed = [A.polys[1], A.polys[0], A.polys[2]];
const rev = call('art.scoreGuide', 'capitals', 0, reversed, 'medium', true);
ok(!rev.orderOk, 'wrong order detected');
ok(call('art.scoreGuide', 'capitals', 0, reversed, 'medium', false).score >= rev.score, 'free mode ignores order');

// guided strokes
const g1 = call('art.guidedStroke', 'capitals', 0, 0, [], A.polys[0], 'medium');
ok(g1.ok, 'guided line 1 accepted');
const g2 = call('art.guidedStroke', 'capitals', 0, 0, [], A.polys[1], 'medium');
ok(!g2.ok && /That was line 2/.test(g2.message), `guided wrong line: ${g2.message}`);
const back = [...A.polys[0]].reverse();
const g3 = call('art.guidedStroke', 'capitals', 0, 0, [], back, 'medium');
ok(!g3.ok && /other way/.test(g3.message), `guided reversed: ${g3.message}`);

// studio definitions
const b = call('art.brushes');
ok(b.order.length === 9 && b.early.length === 4 && b.sizes.length === 5, 'brushes');
ok(call('art.canvasSizes').length === 4 && call('art.papers').length === 6, 'canvas sizes & papers');
ok(call('art.colorName', '#e53935') === 'red' && call('art.colorName', '#e53935', 'te') === 'ఎరుపు', 'colour names');

console.log(`${pages.length} pages, ${sheets.length} sheets (${guides} guides) checked, ${fails} failures`);
process.exit(fails ? 1 : 0);
