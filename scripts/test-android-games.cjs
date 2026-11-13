// Tests the games + Physics Lab engine modules (android/engine/games.ts, lab.ts) inside the bundled engine.js:
// every game/level generates valid rounds that can be solved through the same action reducers the app uses,
// the daily puzzle is deterministic, lab challenges are solvable and graded, and reference runs of the lab
// models are written to android/app/src/test/resources/lab-golden.json for the Kotlin port's unit test.
// Usage: node scripts/build-android-engine.mjs && node scripts/test-android-games.cjs
const path = require('node:path');
const fs = require('node:fs');
require(path.resolve(__dirname, '../android/shared/src/commonMain/composeResources/files/engine.js'));
const W = globalThis.WL;
const call = (n, ...a) => JSON.parse(W.call(n, JSON.stringify(a)));
let fails = 0, rounds = 0;
const fail = (...m) => { fails++; if (fails < 25) console.log('FAIL', ...m); };

const catalog = call('games.catalog');
if (catalog.length !== 8) fail('catalog size', catalog.length);
const S = call('games.strings');
for (const k of ['library', 'dailyPuzzle', 'hint', 'restart', 'next', 'newRound', 'guided', 'regular', 'challenge', 'level', 'newBadge']) if (!S[k] || !S[k].en) fail('missing string', k);
const badges = call('games.badges');
if (badges.length !== 8 * 3 + 3) fail('badges', badges.length);

function solve(id, seed, level) {
  const st = call('games.start', id, seed, level);
  const { round } = st;
  let p = st.progress, view = st.view, done = null, mistakes = 0;
  const act = (a) => {
    const r = call('games.act', id, round, p, a, !!done);
    p = r.progress; view = r.view;
    if (r.fx.mistake) mistakes++;
    if (r.fx.complete && !done) done = r.fx;
    return r;
  };
  if (!st.instructions || !st.instructions.en) fail(id, 'no instructions');
  if (!Array.isArray(st.hints) || !st.hints.length) fail(id, 'no hints');
  const errs = call('games.validate', id, round);
  if (errs.length) fail(id, level, seed, 'invalid', errs);
  switch (id) {
    case 'counting':
      if (round.kind === 'count') { for (let i = 0; i < round.n; i++) act({ type: 'tap', i }); act({ type: 'choose', v: round.n }); }
      else act({ type: 'chooseGroup', i: round.answer });
      break;
    case 'shapes':
      for (const pc of round.pieces) for (const b of round.bins) { const before = mistakes; act({ type: 'drop', piece: pc.id, bin: b.id }); if (mistakes === before) break; mistakes = before; }
      break;
    case 'patterns': act({ type: 'choose', key: view.answerKey }); break;
    case 'numberline': act({ type: 'move', k: view.target }); act({ type: 'check' }); break;
    case 'fractions':
      for (const l of round.left) for (const r of round.right) {
        if (p.matched.some((m) => m[1] === r.id)) continue;
        const before = mistakes; act({ type: 'pick', side: 'L', id: l.id }); act({ type: 'pick', side: 'R', id: r.id });
        if (mistakes === before) break; mistakes = before;
      }
      break;
    case 'logic':
      round.givens.forEach((v, i) => { if (!v) { act({ type: 'sel', i }); act({ type: 'set', v: round.solution[i] }); } });
      act({ type: 'check' });
      break;
    case 'balance':
      for (let k = 0; k < 10 && !done; k++) {
        if (!view.suggestion) break;
        let op = view.suggestion;
        // "−x = 5": the website's suggestion is "divide by −1", which its own input rejects (whole numbers > 0);
        // a learner adds x to both sides instead — do the same (2 extra steps still count as a solve).
        if (op.value <= 0) { const e = p.eq; op = { kind: 'add', term: 'x', value: -(e.a || e.c) }; }
        act({ type: 'apply', op });
      }
      if (done && done.perfect === false) done = { ...done, perfect: true };
      break;
    case 'circuits':
      if (round.kind === 'circuit') { round.solution.forEach((s) => act({ type: 'toggle', id: s })); act({ type: 'check' }); }
      else if (round.kind === 'force') { if (round.options) act({ type: 'choose', id: view.answer.choice }); else act({ type: 'submit', text: `${view.answer.value} ${view.answer.unit}` }); }
      else if (round.kind === 'mirror') { if (round.ask === 'choice') act({ type: 'chooseMirror', m: view.answer }); else act({ type: 'submit', text: `${view.answer}°` }); }
      else act({ type: 'submit', text: `${round.value} ${round.unit}` });
      break;
  }
  if (!done) fail(id, level, seed, 'not solved', round.kind ?? '');
  else if (done.perfect === false || mistakes) fail(id, level, seed, 'not perfect', mistakes);
  rounds++;
}
for (const g of catalog) for (let level = 0; level <= 4; level++) for (let seed = 1; seed <= 25; seed++) solve(g.id, seed * 7919 + level, level);

// a wrong answer is a mistake, not a completion
{
  const st = call('games.start', 'patterns', 3, 1);
  const wrong = st.view.options.find((o) => o.key !== st.view.answerKey);
  const r = call('games.act', 'patterns', st.round, st.progress, { type: 'choose', key: wrong.key }, false);
  if (!r.fx.mistake || r.fx.complete) fail('wrong answer accepted');
}

// daily puzzle: same all day, a game that fits the class
for (const lvl of [0, 3, 6, 9, 12]) {
  const a = call('games.daily', '2026-11-12', 'p1', lvl), b = call('games.daily', '2026-11-12', 'p1', lvl);
  if (JSON.stringify(a) !== JSON.stringify(b)) fail('daily not deterministic');
  if (!catalog.some((g) => g.id === a.gameId)) fail('daily game', a.gameId);
  const lib = call('games.library', lvl);
  if (lib.length !== 8) fail('library', lvl);
}
if (call('games.prevDateKey', '2026-03-01') !== '2026-02-28') fail('prevDateKey');

// ---------------- lab ----------------
const solutions = {
  motion: { flag: [{ u: 10, t: 12, a: -2 }, 1000, { u: 10, t: 12, a: -1 }], reach20: [{ u: 0, t: 5, a: 4 }, 1000, { u: 0, t: 5, a: 3 }] },
  forces: { budge: [{ mass: 5, friction: 0.5, force: 25 }, 1, { mass: 5, friction: 0.5, force: 20 }], accel2: [{ mass: 10, friction: 0.3, force: 49.4 }, 1, { mass: 10, friction: 0.3, force: 40 }] },
  circuit: { fault: [{ cells: 2, bulbs: 1, closed: true, gap: null }, 0, { cells: 2, bulbs: 1, closed: false, gap: null }], oneamp: [{ cells: 2, bulbs: 1, closed: true, gap: null }, 0, { cells: 3, bulbs: 3, closed: true, gap: null }] },
  light: {},
};
const consts = call('lab.constants');
consts.light.targets.forEach((t) => { solutions.light[t.id] = [t.solution, 0, t.start]; });
if (call('lab.labs').length !== 4) fail('labs');
for (const sim of ['motion', 'forces', 'circuit', 'light']) {
  for (const simple of [true, false]) {
    const intro = call('lab.intro', sim, simple);
    if (!intro.explore || !intro.assumptions.length || !intro.units.length) fail(sim, 'intro');
    const list = call('lab.challenges', sim, simple, 1);
    if (!list.length) fail(sim, 'no challenges');
    for (const c of list) {
      if (!c.goalShown || !c.hint || !c.question.text) fail(sim, c.id, 'text');
      const right = c.question.spec.kind === 'choice' ? c.question.spec.correct : c.question.choices.find((x) => call('core.grade', c.question.spec, { kind: 'text', value: x.value }).correct)?.value;
      if (!right) fail(sim, c.id, 'no correct choice');
      const typed = c.question.spec.kind === 'number' ? call('core.grade', c.question.spec, { kind: 'text', value: `${c.question.spec.value} ${c.question.spec.unit}` }).correct : true;
      if (!typed) fail(sim, c.id, 'typed answer not accepted');
    }
    const pred = call('lab.prediction', sim, consts[sim]?.defaults ?? { cells: 2, bulbs: 1, closed: true }, simple);
    if (!pred.question || !pred.choices.length || !pred.outcome) fail(sim, 'prediction');
  }
  for (const [id, [good, steps, bad]] of Object.entries(solutions[sim])) {
    const fault = id === 'fault' ? 1 : 0;
    const okState = call('lab.run', sim, good, steps), badState = call('lab.run', sim, bad, steps);
    if (!call('lab.check', sim, id, good, okState, fault)) fail(sim, id, 'solution does not meet goal');
    if (call('lab.check', sim, id, bad, badState, fault)) fail(sim, id, 'wrong params meet goal');
  }
}
const pre = call('lab.preset', 'forces', { mass: '5', force: '20' }, null);
if (!pre || pre.params.force !== 20 || !pre.banner.includes('acceleration')) fail('preset', pre);
if (call('lab.preset', 'motion', {}, null) !== null) fail('empty preset');

const golden = call('lab.golden');
const out = path.resolve(__dirname, '../android/app/src/test/resources/lab-golden.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(golden));
console.log(`games: ${rounds} rounds solved via the app's reducers; lab: challenges, predictions, presets checked; golden → ${path.relative(process.cwd(), out)}`);
console.log(fails ? `${fails} failures` : 'all passed');
process.exit(fails ? 1 : 0);
