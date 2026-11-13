// Tests the language-course functions of android/shared/src/commonMain/composeResources/files/engine.js in Node:
// every objective of both courses loads, every item of every objective appears in some round and grades
// its own answer as correct (and a wrong answer as wrong), every passage / tracing set / unit link resolves,
// tracing scoring runs, and constants copied from the website's React files still match their source.
// Usage: node scripts/build-android-engine.mjs && node scripts/test-android-language.cjs
const path = require('node:path');
const fs = require('node:fs');
require(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));

let bad = 0;
const fail = (...m) => { bad++; if (bad < 40) console.log('FAIL', ...m); };

const fns = JSON.parse(W.list()).language;
console.log('language functions:', fns.join(', '));

const courses = call('language.courses');
let objectives = 0, items = 0, rounds = 0, passages = 0, traceSets = 0;
for (const c of courses) {
  const seenUnits = new Set();
  for (const level of c.levels) {
    const map = call('language.courseMap', c.id, level);
    if (!map || !map.units.length) fail(c.id, 'no units at level', level);
    for (const u of map.units) {
      seenUnits.add(u.id);
      if (!call('language.unit', c.id, u.id)) fail(c.id, u.id, 'unit lookup');
      for (const t of u.trace) {
        const s = call('language.traceSet', c.id, t.id);
        if (!s || !s.letters.length) fail('trace set', t.id); else traceSets++;
      }
      for (const r of u.read) {
        const p = call('language.passage', c.id, r.id);
        if (!p || !p.lines.length || !p.questions.length) { fail('passage', r.id); continue; }
        passages++;
        for (const q of p.questions) {
          if (!call('language.check', q, q.answer[0])) fail('passage q', r.id, q.id);
          const wrong = q.choices.find((x) => !q.answer.includes(x));
          if (wrong && call('language.check', q, wrong)) fail('passage q wrong accepted', r.id, q.id);
        }
      }
      for (const o of u.objectives) {
        const d = call('language.objective', c.id, u.id, o.id);
        if (!d) { fail('objective', c.id, u.id, o.id); continue; }
        objectives++;
        const all = d.objective.items;
        if (!d.objective.intro || !d.objective.examples.length) fail('learn content', o.id);
        const covered = new Set();
        for (const mode of ['practice', 'test']) {
          for (const tier of ['early', 'primary', 'middle', 'senior']) {
            // enough seeds that every item appears in some round
            for (let seed = 1; seed <= 400 && (covered.size < all.length || seed <= 3); seed++) {
              const r = call('language.round', c.id, u.id, o.id, mode, tier, seed * 7919);
              rounds++;
              const want = call('language.size', mode, tier, all.length);
              if (!r || r.length !== want) { fail('round size', o.id, mode, tier, r && r.length, want); break; }
              const again = call('language.round', c.id, u.id, o.id, mode, tier, seed * 7919);
              if (JSON.stringify(again) !== JSON.stringify(r)) fail('round not deterministic', o.id);
              for (const x of r) covered.add(x.item.id);
            }
          }
        }
        if (covered.size !== all.length) fail('items never in a round', o.id, all.length - covered.size);
        for (const it of all) {
          items++;
          if (!it.prompt || !it.choices.length || !it.answer.length) fail('item shape', o.id, it.id);
          const right = it.type === 'build' || it.type === 'order' ? it.answer : it.answer[0];
          if (!call('language.check', it, right)) fail('own answer marked wrong', o.id, it.id, it.type);
          if (it.type === 'choice' || it.type === 'listen') {
            if (!it.choices.includes(it.answer[0])) fail('answer not among choices', o.id, it.id);
            const wrong = it.choices.find((x) => !it.answer.includes(x));
            if (wrong && call('language.check', it, wrong)) fail('wrong choice accepted', o.id, it.id);
            if (it.picChoices && it.choices.some((ch) => !(it.pics || {})[ch])) fail('missing choice picture', o.id, it.id);
          }
          if (it.type === 'type' && !it.choices.includes(it.answer[0])) fail('type fallback lacks answer', o.id, it.id);
          if ((it.type === 'build' || it.type === 'order')) {
            const pool = [...it.choices];
            for (const a of it.answer) { const k = pool.indexOf(a); if (k < 0) fail('tile missing', o.id, it.id, a); else pool.splice(k, 1); }
            if (call('language.check', it, [...it.answer].reverse()) && it.answer.length > 1 && it.answer[0] !== it.answer[it.answer.length - 1] && !(it.alts || []).length) fail('reversed order accepted', o.id, it.id);
          }
          if (call('language.check', it, null)) fail('empty accepted', o.id, it.id);
        }
      }
    }
  }
  console.log(`${c.id}: ${c.levels.length} classes, ${seenUnits.size} units`);
}

// unknown ids are null (NotFound screens)
if (call('language.courseMap', 'french', 0) !== null) fail('unknown course');
if (call('language.objective', 'english', 'nope', 'nope') !== null) fail('unknown objective');
if (call('language.passage', 'english', 'te-rhyme-1') !== null) fail('passage from other course');
if (call('language.traceSet', 'telugu', 'en-lower') !== null) fail('trace set from other course');

// badges: everything passed → every unit badge of the course
for (const c of courses) {
  const acts = {};
  for (const level of c.levels) for (const u of call('language.courseMap', c.id, level).units) for (const o of u.objectives) acts[`lang:${c.id}/${u.id}/${o.id}`] = { state: { practiceBest: 0.8 }, updatedAt: 1 };
  const earned = call('language.earnedBadges', c.id, acts);
  const all = call('language.badges').filter((b) => b.id.startsWith(c.id === 'telugu' ? 'lang:te' : 'lang:en') || b.id.includes(`:${c.id}`));
  if (!earned.length) fail('no unit badges earned', c.id);
  if (call('language.earnedBadges', c.id, {}).length) fail('badges with no progress', c.id);
  console.log(`${c.id}: ${earned.length} unit badges (${all.length} matching ids)`);
}

// tracing: a glyph traced exactly scores 3 stars, empty ink 0
const G = 96;
const glyph = Array.from({ length: G * G }, (_, i) => { const x = i % G, y = Math.floor(i / G); return x > 40 && x < 52 && y > 15 && y < 80 ? '1' : '0'; }).join('');
const full = call('language.scoreTrace', glyph, glyph, 'medium');
if (full.stars !== 3) fail('exact trace stars', full.stars);
const none = call('language.scoreTrace', glyph, '0'.repeat(G * G), 'easy');
if (none.stars !== 0) fail('empty trace stars', none.stars);
const sp = call('language.startPoint', glyph, 'en');
if (!sp || sp[1] !== 16) fail('start point', sp);

// builders
const b = call('language.builders');
if (b.consonants.length !== 36 || b.guninthamVowels.length !== 15 || b.keyboard.length !== 4) fail('builders shape');
if (b.gunintham['క'][1] !== 'కా') fail('gunintham');
if (b.keyboard[3][0].show !== '◌ా') fail('showSign');

// constants copied from React files must match the website source
const src = (f) => fs.readFileSync(path.resolve(__dirname, '../src/features/language', f), 'utf8');
const util = src('util.ts');
const classNames = call('language.classNames');
if (!util.includes(`CLASS_NAMES = [${classNames.map((n) => `'${n}'`).join(', ')}]`)) fail('CLASS_NAMES differ from util.ts');
const builders = src('Builders.tsx');
const arr = (name) => { const m = builders.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`)); return m ? m[1].split(',').map((s) => s.trim().replace(/'/g, '')) : null; };
if (JSON.stringify(arr('ONSETS')) !== JSON.stringify(b.cvc.onsets)) fail('ONSETS differ');
if (JSON.stringify(arr('VOWELS_EN')) !== JSON.stringify(b.cvc.vowels)) fail('VOWELS_EN differ');
if (JSON.stringify(arr('CODAS')) !== JSON.stringify(b.cvc.codas)) fail('CODAS differ');
const real = builders.match(/new Set\('([^']*)'/);
if (!real || real[1] !== b.cvc.real.join(' ')) fail('REAL words differ');
if (!builders.includes("x !== 'క్ష' && x !== 'ఱ' && x !== 'ఙ' && x !== 'ఞ'") || b.ottuOptions.length !== 32) fail('ottu options differ');

// every picture the course uses has a bundled 3D image
const idxFile = path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/emoji/index.json');
if (fs.existsSync(idxFile)) {
  const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
  const norm = (e) => e.replace(/️/g, '');
  const have = new Set(Object.keys(idx).map(norm));
  const pics = new Set();
  for (const c of courses) for (const level of c.levels) for (const u of call('language.courseMap', c.id, level).units) {
    for (const t of u.trace) Object.values(call('language.traceSet', c.id, t.id).cards).forEach((x) => pics.add(x.pic));
    for (const o of u.objectives) {
      const d = call('language.objective', c.id, u.id, o.id).objective;
      (d.cards || []).forEach((x) => pics.add(x.pic));
      d.examples.forEach((x) => x.pic && pics.add(x.pic));
      d.items.forEach((x) => { if (x.pic) pics.add(x.pic); Object.values(x.pics || {}).forEach((p) => pics.add(p)); });
    }
  }
  const missing = [...pics].filter((p) => !have.has(norm(p)));
  console.log(`pictures: ${pics.size} used, ${missing.length} without a 3D image${missing.length ? ': ' + missing.join(' ') : ''}`);
}

console.log(`${objectives} objectives, ${items} items, ${rounds} rounds, ${passages} passages, ${traceSets} tracing-set links; ${bad} failures`);
process.exit(bad ? 1 : 0);
