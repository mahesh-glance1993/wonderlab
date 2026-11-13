// Node test for the Play & Learn part of android/shared/src/commonMain/composeResources/files/engine.js (feature "early").
// Checks the static bundle, every round generator, the SVG drawings the app renders natively, and that
// every picture's 3D emoji image is bundled.  Usage: node scripts/build-android-engine.mjs && node scripts/test-android-early.cjs
const path = require('node:path');
const fs = require('node:fs');
require(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } };

const b = call('early.bundle');
console.log(`pictures ${b.pictures.length}, sets ${b.sets.length}, shapes ${b.shapes.length}, scenes ${b.shapeScenes.length}, stories ${b.stories.length}, models ${b.models.length}, stickers ${b.stickers.length}, rhymes ${b.rhymes.length}, safari ${b.safari.length}`);
ok(b.pictures.length >= 80, 'pictures');
ok(b.stories.length === 16, 'stories = 16');
ok(Object.keys(b.motion).length === b.stories.length, 'motion for every story');
for (const s of b.stories) ok((b.motion[s.id] || []).length === s.pages.length, `motion pages ${s.id}`);

// 3D emoji for every picture
const idx = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/emoji/index.json'), 'utf8'));
const norm = (e) => e.replace(/️/g, '');
const have = new Set(Object.keys(idx).map(norm));
const missing = b.pictures.filter((p) => !have.has(norm(p.emoji)));
console.log('pictures without a bundled 3D image:', missing.map((p) => `${p.id} ${p.emoji}`).join(', ') || 'none');

// drawings
const keys = new Set();
for (const id of b.artIds) keys.add(`${id}|`);
for (const id of b.actArtIds) keys.add(`${id}|`);
for (const s of b.stories) for (const p of s.pages) for (const a of p.actors) keys.add(`${a.art}|${a.v || ''}`);
for (const m of Object.values(b.motion)) for (const pm of m) for (const e of pm.extras || []) keys.add(`${e.art}|${e.v || ''}`);
const arts = call('early.svgArts', [...keys]);
let nodes = 0;
const count = (n) => { nodes++; (n.c || []).forEach(count); };
for (const [k, v] of Object.entries(arts)) { ok(Array.isArray(v) && v.length > 0, `drawing ${k}`); (v || []).forEach(count); }
console.log(`${Object.keys(arts).length} drawings, ${nodes} nodes`);
const tags = new Set();
const walk = (n) => { tags.add(n.t); (n.c || []).forEach(walk); };
Object.values(arts).forEach((v) => (v || []).forEach(walk));
for (const bg of ['day', 'hot', 'garden', 'rain', 'village', 'festival', 'night', 'road', 'river', 'room', 'bathroom', 'forest', 'riverbank', 'sea', 'bedroom', 'evening']) { const t = call('early.svgBackdrop', bg); ok(t.length > 0, `backdrop ${bg}`); t.forEach(walk); }
for (const sc of ['road', 'sky', 'water', 'field', 'space', 'room']) call('early.svgScenery', sc).forEach(walk);
for (const m of b.models) for (const p of m.parts) { const t = call('early.svgPart', p.kind, p.w, p.h, p.c); ok(t.length > 0, `part ${m.id}.${p.id}`); t.forEach(walk); }
for (const fb of b.freeBodies) for (const fw of b.freeWheels) call('early.svgFreeVehicle', { body: fb.id, wheel: fw.id, colour: b.palette[0] }).forEach(walk);
console.log('svg tags:', [...tags].join(' '));

// generators
for (let seed = 1; seed <= 40; seed++) {
  for (const mode of ['find', 'what', 'odd', 'sound']) for (const set of [null, ...b.sets.map((s) => s.id)]) {
    const r = call('early.picRound', seed, mode, mode === 'find' || mode === 'what' ? set : null, 2 + (seed % 3), null);
    ok(r.choices.includes(r.target), `picRound ${mode} ${set}`);
  }
  for (const k of ['colour', 'size', 'category']) { const r = call('early.sortRound', seed, k, seed % 3); ok(r.items.length >= 4 && r.baskets.length === 2, `sortRound ${k}`); }
  for (const k of ['baby', 'shadow']) { const r = call('early.matchRound', seed, k, 2 + (seed % 3)); ok(r.left.length === r.right.length, `matchRound ${k}`); }
  ok(call('early.patternRound', seed, seed % 3, 3).choices.length >= 2, 'patternRound');
  ok(call('early.buildChoices', seed, 'square', 2 + (seed % 3)).includes('square'), 'buildChoices');
  for (const sz of ['small', 'medium', 'large']) ok(call('early.memoryDeck', seed, sz, 'mix').length > 0, 'memoryDeck');
  ok(call('early.mixRound', seed, seed % 3, null).paints.length >= 3, 'mixRound');
  ok(call('early.oppRound', seed, seed % 3, null).choices.length >= 2, 'oppRound');
  for (const k of ['colour', 'shape', 'picture']) { const r = call('early.patRound', seed, k, seed % 3, 3); ok(r.choices.includes(r.answer), 'patRound'); }
  for (const g of ['animal', 'vehicle', 'nature', 'mix']) { const r = call('early.safariRound', seed, g, 3, null, null); ok(r && r.choices.includes(r.target), `safari ${g}`); }
}
const day = call('early.dailyChallenge', '2026-11-12', null);
ok(day.length === 4, 'daily 4 steps');
const g = call('early.giveSticker', null, 'daily', '2026-11-12', 1, true);
ok(g.sticker && g.state.days.includes('2026-11-12') && g.count === 1, 'giveSticker');
ok(call('early.streak', ['2026-11-11', '2026-11-12'], '2026-11-12') === 2, 'streak');
ok(call('early.mixPaints', ['red', 'yellow']) === 'orange', 'mix orange');
ok(call('early.isMixRight', 'green', ['yellow', 'blue']), 'mix green');
ok(call('early.wordTimings', 'Twinkle, twinkle, little star,', 0.9).length === 4, 'wordTimings');
ok(call('early.judgeClaps', [0, 700], [0, 714, 1428], 300).count === 2, 'judgeClaps');
const car = b.models.find((m) => m.id === 'car');
const o = call('early.startOrients', 'car', 1);
ok(call('early.tapPlace', 'car', 1, {}, 'w1', o.w1.o, 'w2').slot === 'w2', 'tapPlace interchangeable wheels');
ok(call('early.dropPart', 'car', 1, {}, 'body', o.body.o, car.parts[0].x + 10, car.parts[0].y).slot === 'body', 'dropPart');
ok(call('early.badgesFor', call('early.recordBuild', null, 'car', 1)).includes('play:build-first'), 'badges');
console.log(fails ? `${fails} failures` : 'all early engine checks passed');
process.exit(fails ? 1 : 0);
