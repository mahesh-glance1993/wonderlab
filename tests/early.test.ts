import { describe, expect, it } from 'vitest';
import { PICTURES, PIC, PIC_SETS, MOTHER_BABY, itemsIn } from '../src/features/early/data/pictures';
import { STORIES, PROP_NAMES, wordsOf, wordTimings } from '../src/features/early/data/stories';
import { SHAPES, SHAPE_IDS, SHAPE_SCENES, BUILDS, buildChoices, patternRound, targetsIn } from '../src/features/early/data/shapes';
import {
  ADAPT0, MAX_CHOICES, MIN_CHOICES, adapt, findRound, whatRound, oddRound, soundRound, picRound, sortRound, matchRound, rng, sample, shuffle,
  type Adapt, type PicMode,
} from '../src/features/early/logic';
import { SFX_NAMES } from '../src/lib/sfx';
import { MOTION, MIN_DUR, MAX_DUR, motionIssues, toKeyframes, finalV, initialV, isRest, finalPose, poseCss, due, autoTurnReady, tapDuration } from '../src/features/early/data/motion';
import {
  MODELS, LEVEL_RANGE, SNAP, MAGNET, MIN_SLOT_GAP, levelParts, prebuilt, shapeKey, dropPart, tapPlace, magnet, startOrient, rotate, flip, fits, modelSfx, placeSfx,
  recordBuild, badgesFor, BUILD_INIT, partName, type Level,
} from '../src/features/early/data/builds';
import { BADGES, itemSfx } from '../src/features/early/common';

const SEEDS = Array.from({ length: 200 }, (_, i) => i * 7919 + 17);
const isNum = (c: string) => /^num:\d+$/.test(c);

describe('picture data', () => {
  it('has at least 60 pictures, each with a unique id and English + Telugu names', () => {
    expect(PICTURES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(PICTURES.map((p) => p.id)).size).toBe(PICTURES.length);
    for (const p of PICTURES) {
      expect(p.en.trim(), p.id).not.toBe('');
      expect(p.te.trim(), p.id).not.toBe('');
      expect(/[ఀ-౿]/.test(p.te), `${p.id} Telugu script`).toBe(true);
      expect(p.emoji, p.id).toBeTruthy();
    }
  });
  it('covers every themed set with enough pictures to play', () => {
    for (const s of PIC_SETS) {
      expect(itemsIn(s).length, s.id).toBeGreaterThanOrEqual(MAX_CHOICES);
      expect(PIC[s.cover], s.id).toBeDefined();
    }
    expect(PIC_SETS.length).toBeGreaterThanOrEqual(10);
  });
  it('gives every sound an English and Telugu form', () => {
    for (const p of PICTURES.filter((x) => x.sound)) { expect(p.sound!.en).toBeTruthy(); expect(p.sound!.te).toBeTruthy(); }
  });
  it('mother & baby pairs refer to real pictures', () => {
    for (const m of MOTHER_BABY) { expect(PIC[m.mother]).toBeDefined(); expect(m.baby.en && m.baby.te).toBeTruthy(); }
  });
});

describe('stories', () => {
  it('has at least 8 stories with unique ids', () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
  });
  it('each story has 4–8 pages with English (and Telugu) text', () => {
    for (const s of STORIES) {
      expect(s.pages.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.pages.length, s.id).toBeLessThanOrEqual(8);
      expect(s.title.en && s.title.te).toBeTruthy();
      for (const p of s.pages) {
        expect(p.text.en.trim().length, s.id).toBeGreaterThan(0);
        expect(p.text.te.trim().length, s.id).toBeGreaterThan(0);
        expect(p.text.en.split(/[.!?]+\s/).length, `${s.id}: 1–2 short sentences`).toBeLessThanOrEqual(3);
      }
    }
  });
  it('most pages have a tap moment, and interactions point at actors on that page', () => {
    for (const s of STORIES) {
      expect(s.pages.filter((p) => p.act).length / s.pages.length, s.id).toBeGreaterThan(0.5);
      for (const p of s.pages) {
        const ids = new Set(p.actors.map((a) => a.id));
        expect(ids.size, `${s.id} actor ids unique`).toBe(p.actors.length);
        if (!p.act) continue;
        const refs = p.act.kind === 'tap'
          ? [p.act.actor, ...(p.act.show || []), ...(p.act.hide || []), ...Object.keys(p.act.set || {}), ...(p.act.move ? [p.act.move.actor] : [])]
          : [...p.act.actors, ...(p.act.show || []), ...(p.act.level ? [p.act.level] : [])];
        for (const r of refs) expect(ids.has(r), `${s.id}: ${r}`).toBe(true);
        const tapped = p.act.kind === 'tap' ? [p.act.actor] : p.act.actors;
        for (const t of tapped) expect(p.actors.find((a) => a.id === t)!.hidden, `${s.id}: ${t} visible to tap`).toBeFalsy();
        expect(p.act.prompt.en && p.act.prompt.te && p.act.say.en && p.act.say.te).toBeTruthy();
      }
    }
  });
  it('has 2–3 end questions whose answer is among unique choices', () => {
    for (const s of STORIES) {
      expect(s.questions.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.questions.length, s.id).toBeLessThanOrEqual(3);
      for (const q of s.questions) {
        expect(q.choices).toContain(q.answer);
        expect(new Set(q.choices).size).toBe(q.choices.length);
        expect(q.q.en && q.q.te).toBeTruthy();
        for (const c of q.choices) expect(isNum(c) || !!PIC[c] || !!PROP_NAMES[c] || !!q.labels?.[c], `${s.id}: ${c} has a name`).toBe(true);
      }
    }
  });
  it('word timings line up with words for karaoke', () => {
    for (const s of STORIES) for (const p of s.pages) for (const t of [p.text.en, p.text.te]) {
      const ms = wordTimings(t);
      expect(ms.length).toBe(wordsOf(t).length);
      expect(ms.every((x) => x > 0)).toBe(true);
    }
  });
});

describe('seeded helpers', () => {
  it('shuffle keeps items and sample never repeats', () => {
    for (const seed of SEEDS.slice(0, 30)) {
      const r = rng(seed);
      const arr = Array.from({ length: 12 }, (_, i) => i);
      expect([...shuffle(r, arr)].sort((a, b) => a - b)).toEqual(arr);
      const s = sample(r, arr, 5, [3]);
      expect(new Set(s).size).toBe(5);
      expect(s).not.toContain(3);
    }
  });
  it('is deterministic for a seed', () => {
    expect(findRound(rng(5), PICTURES, 3)).toEqual(findRound(rng(5), PICTURES, 3));
  });
});

describe('picture rounds', () => {
  const modes: PicMode[] = ['find', 'what', 'odd', 'sound'];
  it('never produce duplicate choices and always include the target', () => {
    for (const seed of SEEDS) for (const mode of modes) for (const n of [2, 3, 4]) for (const set of [null, ...PIC_SETS]) {
      const r = picRound(rng(seed), mode, set, n);
      expect(new Set(r.choices).size, `${mode} ${seed}`).toBe(r.choices.length);
      expect(r.choices).toContain(r.target);
      for (const c of r.choices) expect(PIC[c]).toBeDefined();
      // names differ too, so a spoken word is never ambiguous
      expect(new Set(r.choices.map((c) => PIC[c].en.toLowerCase())).size).toBe(r.choices.length);
      expect(r.choices.length).toBeGreaterThanOrEqual(MIN_CHOICES);
      expect(r.choices.length).toBeLessThanOrEqual(MAX_CHOICES);
    }
  });
  it('find uses exactly n choices from the chosen set; what-is-this uses 2–3 words', () => {
    for (const seed of SEEDS) for (const set of PIC_SETS) for (const n of [2, 3, 4]) {
      const f = findRound(rng(seed), itemsIn(set), n);
      expect(f.choices.length).toBe(n);
      expect(f.choices.every((c) => set.cats.includes(PIC[c].cat))).toBe(true);
      const w = whatRound(rng(seed), itemsIn(set), n);
      expect(w.choices.length).toBe(Math.min(n, 3));
    }
  });
  it('avoids repeating the previous target', () => {
    for (const seed of SEEDS) for (const set of PIC_SETS) {
      const a = findRound(rng(seed), itemsIn(set), 2);
      const b = findRound(rng(seed + 1), itemsIn(set), 2, a.target);
      expect(b.target).not.toBe(a.target);
    }
  });
  it('odd-one-out has exactly one item from a different category', () => {
    for (const seed of SEEDS) for (const n of [2, 3, 4]) {
      const r = oddRound(rng(seed), n);
      expect(r.choices.length).toBeGreaterThanOrEqual(3);
      const cats = r.choices.map((c) => PIC[c].cat);
      const different = cats.filter((c) => c !== r.base);
      expect(different.length).toBe(1);
      expect(PIC[r.target].cat).not.toBe(r.base);
      expect(cats.filter((c) => c === r.base).length).toBe(r.choices.length - 1);
    }
  });
  it('sound rounds only use pictures that make a sound, all different', () => {
    for (const seed of SEEDS) for (const n of [2, 3, 4]) {
      const r = soundRound(rng(seed), n);
      expect(r.choices.every((c) => PIC[c].sound)).toBe(true);
      expect(new Set(r.choices.map((c) => PIC[c].sound!.en)).size).toBe(r.choices.length);
      expect(r.choices).toContain(r.target);
    }
  });
});

describe('adaptive difficulty', () => {
  it('starts at 2 choices and stays within 2–4 for any answer sequence', () => {
    expect(ADAPT0.choices).toBe(2);
    for (const seed of SEEDS) {
      const r = rng(seed);
      let a: Adapt = ADAPT0;
      for (let i = 0; i < 80; i++) {
        const ok = r.next() < 0.7;
        a = adapt(a, ok, ok && r.next() < 0.8);
        expect(a.choices).toBeGreaterThanOrEqual(MIN_CHOICES);
        expect(a.choices).toBeLessThanOrEqual(MAX_CHOICES);
      }
    }
  });
  it('grows after successes and drops back after mistakes', () => {
    let a: Adapt = ADAPT0;
    for (let i = 0; i < 3; i++) a = adapt(a, true);
    expect(a.choices).toBe(3);
    for (let i = 0; i < 20; i++) a = adapt(a, true);
    expect(a.choices).toBe(4);
    a = adapt(adapt(a, false), false);
    expect(a.choices).toBe(3);
    for (let i = 0; i < 20; i++) a = adapt(a, false);
    expect(a.choices).toBe(2);
  });
  it('respects a lower cap and repairs bad saved state', () => {
    let a: Adapt = ADAPT0;
    for (let i = 0; i < 30; i++) a = adapt(a, true, true, 3);
    expect(a.choices).toBe(3);
    expect(adapt({ choices: 99, streak: 0, misses: 0 }, true).choices).toBeLessThanOrEqual(4);
    expect(adapt({ choices: -3, streak: 0, misses: 0 } as Adapt, false).choices).toBe(2);
    expect(adapt(undefined, true).choices).toBe(2);
  });
});

describe('shapes', () => {
  it('teaches the eight shapes with names in both languages', () => {
    expect(SHAPE_IDS.sort()).toEqual(['circle', 'diamond', 'heart', 'oval', 'rectangle', 'square', 'star', 'triangle']);
    for (const s of SHAPES) expect(s.name.en && s.name.te && s.path).toBeTruthy();
  });
  it('has a find-the-shapes scene for every shape, each with ≥3 targets and some distractors', () => {
    expect(new Set(SHAPE_SCENES.map((s) => s.target))).toEqual(new Set(SHAPE_IDS));
    for (const s of SHAPE_SCENES) {
      expect(targetsIn(s).length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.items.length - targetsIn(s).length, s.id).toBeGreaterThanOrEqual(2);
      for (const it of s.items) expect(it.label?.en && it.label?.te, s.id).toBeTruthy();
    }
  });
  it('build puzzles offer choices that include the needed shape, without duplicates', () => {
    for (const b of BUILDS) for (const slot of b.slots) for (const seed of SEEDS.slice(0, 40)) for (const n of [2, 3, 4]) {
      const c = buildChoices(rng(seed), slot.shape, n);
      expect(c).toContain(slot.shape);
      expect(new Set(c).size).toBe(c.length);
      expect(c.length).toBe(n);
    }
  });
  it('pattern rounds have a correct, included answer and no duplicate choices', () => {
    for (const seed of SEEDS) for (const level of [0, 1, 2]) for (const n of [2, 3, 4]) {
      const r = patternRound(rng(seed), level, n);
      expect(r.answer).toBe(r.unit[r.seq.length % r.unit.length]);
      expect(r.choices).toContain(r.answer);
      expect(new Set(r.choices).size).toBe(r.choices.length);
      expect(r.choices.length).toBe(n);
      expect(r.seq.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('sort & match', () => {
  it('every sort item belongs to one of two baskets, both used, with unique keys', () => {
    for (const seed of SEEDS) for (const kind of ['colour', 'size', 'category'] as const) for (const level of [0, 1, 2]) {
      const r = sortRound(rng(seed), kind, level);
      expect(r.baskets.length).toBe(2);
      const ids = r.baskets.map((b) => b.id);
      expect(r.items.every((i) => ids.includes(i.basket))).toBe(true);
      for (const id of ids) expect(r.items.some((i) => i.basket === id), `${kind} ${seed}`).toBe(true);
      expect(new Set(r.items.map((i) => i.key)).size).toBe(r.items.length);
      expect(r.items.length).toBe(4 + level);
      if (kind === 'colour') for (const i of r.items) expect(PIC[i.art].colour).toBe(i.basket);
      if (kind === 'category') for (const i of r.items) expect(PIC[i.art].cat).toBe(i.basket);
    }
  });
  it('match rounds pair every left card with exactly one right card', () => {
    for (const seed of SEEDS) for (const kind of ['baby', 'shadow'] as const) for (const n of [2, 3, 4]) {
      const r = matchRound(rng(seed), kind, n);
      expect(r.left.length).toBe(n);
      expect(r.right.length).toBe(n);
      expect(new Set(r.left.map((c) => c.key)).size).toBe(n);
      expect(new Set(Object.values(r.pairs)).size).toBe(n);
      for (const l of r.left) expect(r.right.some((c) => c.key === r.pairs[l.key])).toBe(true);
    }
  });
});

// ---------------- Story Time animations, picture sounds, Build It ----------------
describe('story animations', () => {
  it('every page of every story has a calm 3–8 s animation with a description', () => {
    for (const s of STORIES) {
      const pages = MOTION[s.id];
      expect(pages, s.id).toBeDefined();
      expect(pages.length, s.id).toBe(s.pages.length);
      pages.forEach((m, i) => {
        expect(m.dur).toBeGreaterThanOrEqual(MIN_DUR);
        expect(m.dur).toBeLessThanOrEqual(MAX_DUR);
        expect(m.tracks.length, `${s.id} p${i}`).toBeGreaterThan(0);
        expect(/[ఀ-౿]/.test(m.what.te), `${s.id} p${i} Telugu caption`).toBe(true);
        expect(motionIssues(m, s.pages[i].actors.map((a) => a.id)), `${s.id} p${i}`).toEqual([]);
      });
    }
  });
  it('story actors settle at their resting place, so reduced motion shows the same final picture', () => {
    for (const s of STORIES) MOTION[s.id].forEach((m, i) => {
      const extras = new Set((m.extras || []).map((e) => e.id));
      for (const t of m.tracks) if (!extras.has(t.actor)) expect(isRest(finalPose(t)), `${s.id} p${i} ${t.actor}`).toBe(true);
    });
  });
  it('sound cues use real effects and fall inside the animation', () => {
    const names = new Set(SFX_NAMES);
    for (const s of STORIES) for (const m of MOTION[s.id]) {
      for (const c of m.cues || []) { expect(names.has(c.sfx), c.sfx).toBe(true); expect(c.t).toBeLessThanOrEqual(m.dur); }
      for (const tm of Object.values(m.tap || {})) for (const c of tm.cues || []) expect(names.has(c.sfx), c.sfx).toBe(true);
    }
    for (const s of STORIES) expect(MOTION[s.id].every((m) => (m.cues || []).length > 0), s.id).toBe(true);
  });
  it('tap mini animations point at real actors and are short', () => {
    for (const s of STORIES) MOTION[s.id].forEach((m, i) => {
      for (const [k, tm] of Object.entries(m.tap || {})) {
        if (k !== '@done') expect(s.pages[i].actors.some((a) => a.id === k), `${s.id} p${i} ${k}`).toBe(true);
        expect(tapDuration(tm)).toBeLessThanOrEqual(3000);
      }
    });
  });
  it('keyframes run from offset 0 to 1 and never go backwards', () => {
    for (const s of STORIES) for (const m of MOTION[s.id]) for (const t of m.tracks) {
      const kf = toKeyframes(t, m.dur);
      expect(kf[0].offset).toBe(0);
      expect(kf[kf.length - 1].offset).toBe(1);
      for (let i = 1; i < kf.length; i++) expect(kf[i].offset as number).toBeGreaterThanOrEqual(kf[i - 1].offset as number);
      for (const f of kf) expect(typeof f.transform === 'string' && typeof f.opacity === 'number').toBe(true);
    }
  });
  it('the crow’s pot fills up between the start and the final pose', () => {
    const m = MOTION['thirsty-crow'][3];
    expect(initialV(m).pot).toBe('2');
    expect(finalV(m).pot).toBe('4');
    expect(finalV(undefined)).toEqual({});
  });
  it('helpers: pose css, due items and auto-turn rules', () => {
    expect(poseCss({}).transform).toBe('translate(0px, 0px) rotate(0deg) scale(1, 1)');
    expect(poseCss({ x: 5, s: 2, o: 0.5 })).toEqual({ transform: 'translate(5px, 0px) rotate(0deg) scale(2, 2)', opacity: 0.5 });
    const done = new Set<number>();
    const items = [{ t: 0 }, { t: 500 }, { t: 1000 }];
    expect(due(items, 600, done).length).toBe(2);
    expect(due(items, 600, done).length).toBe(0);
    expect(due(items, 2000, done).length).toBe(1);
    expect(autoTurnReady({ enabled: true, animDone: true, speaking: false, paused: false })).toBe(true);
    expect(autoTurnReady({ enabled: false, animDone: true, speaking: false, paused: false })).toBe(false);
    expect(autoTurnReady({ enabled: true, animDone: true, speaking: true, paused: false })).toBe(false);
    expect(autoTurnReady({ enabled: true, animDone: false, speaking: false, paused: false })).toBe(false);
    expect(autoTurnReady({ enabled: true, animDone: true, speaking: false, paused: true })).toBe(false);
  });
  it('flags fast, flickery or unfinished motion', () => {
    const base = { dur: 4000, what: { en: 'x', te: 'క' }, tracks: [] };
    expect(motionIssues({ ...base, dur: 9000 }, [])).toContain('duration 9000');
    expect(motionIssues({ ...base, tracks: [{ actor: 'a', keys: [{ t: 0, x: -400 }, { t: 500 }] }] }, ['a']).some((x) => x.includes('speed'))).toBe(true);
    expect(motionIssues({ ...base, tracks: [{ actor: 'a', keys: [{ t: 0, o: 0 }, { t: 400, o: 1 }, { t: 800, o: 0 }, { t: 1200, o: 1 }] }] }, ['a']).some((x) => x.includes('flicker'))).toBe(true);
    expect(motionIssues({ ...base, tracks: [{ actor: 'a', keys: [{ t: 0 }, { t: 500, x: 10 }] }] }, ['a']).some((x) => x.includes('rest'))).toBe(true);
  });
});

describe('picture sounds', () => {
  it('every animal, bird and vehicle that "says" something has a sound effect', () => {
    for (const p of PICTURES.filter((x) => x.sound && ['animal', 'bird', 'vehicle'].includes(x.cat))) expect(itemSfx(p.id), p.id).not.toBeNull();
    expect(itemSfx('mango')).toBeNull();
  });
});

describe('build it', () => {
  const LEVELS: Level[] = [1, 2, 3];
  it('has the 15 models, each sounding with real effects', () => {
    expect(MODELS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length);
    for (const id of ['car', 'scooter', 'bicycle', 'aeroplane', 'helicopter', 'cart', 'auto', 'bus', 'train', 'boat', 'tractor', 'rocket', 'crane', 'windmill', 'gears']) expect(MODELS.some((m) => m.id === id), id).toBe(true);
    for (const m of MODELS) {
      expect(m.name.en && /[ఀ-౿]/.test(m.name.te), m.id).toBeTruthy();
      expect(modelSfx(m).length, m.id).toBeGreaterThan(0);
      for (const s of modelSfx(m)) expect(SFX_NAMES, `${m.id} ${s}`).toContain(s);
      for (const p of m.parts) { expect(SFX_NAMES).toContain(placeSfx(p)); expect(partName(p).en && partName(p).te, `${m.id}.${p.id}`).toBeTruthy(); }
    }
  });
  it('part counts per level stay within range', () => {
    for (const m of MODELS) for (const lv of LEVELS) {
      const n = levelParts(m, lv).length;
      expect(n, `${m.id} L${lv}`).toBeGreaterThanOrEqual(LEVEL_RANGE[lv][0]);
      expect(n, `${m.id} L${lv}`).toBeLessThanOrEqual(LEVEL_RANGE[lv][1]);
      expect(n + prebuilt(m, lv).length).toBe(m.parts.length);
    }
  });
  it('slots are apart and inside the board, with unique part ids', () => {
    for (const m of MODELS) {
      expect(new Set(m.parts.map((p) => p.id)).size, m.id).toBe(m.parts.length);
      for (const p of m.parts) expect(p.x >= 0 && p.x <= 400 && p.y >= 0 && p.y <= 260, `${m.id}.${p.id}`).toBe(true);
      for (let i = 0; i < m.parts.length; i++) for (let j = i + 1; j < m.parts.length; j++) {
        const a = m.parts[i], b = m.parts[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${m.id}: ${a.id}/${b.id}`).toBeGreaterThanOrEqual(MIN_SLOT_GAP);
      }
    }
  });
  it('every part has exactly one matching slot of its own (identical parts may swap)', () => {
    for (const m of MODELS) for (const lv of LEVELS) {
      const parts = levelParts(m, lv);
      for (const p of parts) {
        expect(dropPart(m, lv, {}, p, { rot: 0, flip: !!p.mirror }, p.x, p.y), `${m.id} L${lv} ${p.id}`).toEqual({ slot: p.id });
        for (const s of parts) {
          const r = tapPlace(m, lv, {}, p, { rot: 0, flip: !!s.mirror }, s.id);
          expect(r !== null, `${m.id} ${p.id}->${s.id}`).toBe(shapeKey(p) === shapeKey(s));
        }
      }
      const filled: Record<string, string> = {};
      for (const p of parts) { expect(tapPlace(m, lv, filled, p, { rot: 0, flip: !!p.mirror }, p.id)).toEqual({ slot: p.id }); filled[p.id] = p.id; }
      expect(Object.keys(filled).length).toBe(parts.length);
    }
  });
  it('snapping gets tighter and the magnet weaker at higher levels; far drops do not snap', () => {
    expect(SNAP[1]).toBeGreaterThan(SNAP[2]); expect(SNAP[2]).toBeGreaterThan(SNAP[3]);
    expect(MAGNET[1]).toBeGreaterThan(MAGNET[2]); expect(MAGNET[2]).toBeGreaterThan(MAGNET[3]);
    const car = MODELS.find((m) => m.id === 'car')!;
    const body = car.parts.find((p) => p.id === 'body')!;
    expect(dropPart(car, 1, {}, body, startOrient(body, 1), body.x + SNAP[1] - 1, body.y)).toEqual({ slot: 'body' });
    expect(dropPart(car, 3, {}, body, startOrient(body, 3), body.x + SNAP[1] - 1, body.y)).toBeNull();
    expect(dropPart(car, 1, {}, body, startOrient(body, 1), 5, 5)).toBeNull();
    const pulled = magnet(car, 1, {}, body, body.x + 30, body.y);
    expect(pulled.x).toBeLessThan(body.x + 30);
    expect(pulled.near).toBe('body');
    expect(magnet(car, 1, {}, body, 5, 5)).toEqual({ x: 5, y: 5 });
    expect(dropPart(car, 1, { body: 'body' }, body, startOrient(body, 1), body.x, body.y)).toBeNull();
  });
  it('level 3 has parts that must be turned or flipped first', () => {
    for (const m of MODELS) {
      for (const p of levelParts(m, 3)) {
        if (!p.turn && !p.mirror) continue;
        const o = startOrient(p, 3);
        expect(fits(o, p, 3), `${m.id}.${p.id} starts wrong`).toBe(false);
        expect(dropPart(m, 3, {}, p, o, p.x, p.y), `${m.id}.${p.id}`).toEqual({ turn: p.id });
        let fixed = o;
        for (let i = 0; i < 4 && fixed.rot !== 0; i++) fixed = rotate(fixed);
        if (p.mirror) fixed = flip(fixed);
        expect(fits(fixed, p, 3)).toBe(true);
      }
      for (const lv of [1, 2] as Level[]) for (const p of levelParts(m, lv)) expect(fits(startOrient(p, lv), p, lv)).toBe(true);
    }
    expect(MODELS.filter((m) => levelParts(m, 3).some((p) => p.turn || p.mirror)).length).toBeGreaterThanOrEqual(6);
  });
  it('saves progress and earns the build badges', () => {
    let s = BUILD_INIT;
    expect(badgesFor(s)).toEqual([]);
    s = recordBuild(recordBuild(s, 'car', 2), 'car', 1);
    expect(s.done.car).toBe(2);
    expect(badgesFor(s)).toEqual(['play:build-first']);
    for (const m of MODELS.slice(0, 5)) s = recordBuild(s, m.id, 1);
    expect(badgesFor(s)).toContain('play:build-5');
    for (const m of MODELS) s = recordBuild(s, m.id, 1);
    expect(badgesFor(s)).toContain('play:build-all');
    for (const b of ['play:build-first', 'play:build-5', 'play:build-all']) expect(BADGES[b]).toBeDefined();
  });
});
