import { describe, expect, it } from 'vitest';
import { PIC } from '../src/features/early/data/pictures';
import { SFX_NAMES } from '../src/lib/sfx';
import { rng } from '../src/features/early/logicCore';
import {
  MEMORY_SIZES, MEMORY_SIZE_IDS, MEMORY_THEMES, memoryPool, memoryDeck, memoryStart, memoryFlip, memoryHide, memoryDone, memoryStars, isFaceUp, gridMove,
  MIX_COLOURS, MIX_PAINTS, MIX_TARGETS, RECIPES, MAX_BOWL, mixPaints, mixHex, recipeFor, mixRound, isMixRight, mixQuiz,
  RHYMES, wordsOf, wordTimings, wordAt, beatTimes, judgeClaps, beatFor, CLAP_WINDOW,
  OPPOSITES, OPP_SIDES, oppRound, oppRight, oppSide,
  PAT_TOKENS, patRound, patRight, tokenName, type PatKind,
  SAFARI, SAFARI_BY_ID, SAFARI_GROUPS, availableSafari, safariRound, safariRight,
  dayKey, prevDay, hashStr, dailyChallenge, DAILY_STEPS, STICKERS, STICKER, STICKER_SOURCES, STICKER_INIT, nextSticker, earnSticker, recordDay, doneToday, streak, stickerCount,
  type Paint, type MemState,
} from '../src/features/early/activities';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);
const TE = /[ఀ-౿]/;

describe('memory match', () => {
  it('has three sizes whose grids fill evenly', () => {
    expect(MEMORY_SIZE_IDS).toEqual(['small', 'medium', 'large']);
    for (const id of MEMORY_SIZE_IDS) {
      const { pairs, cols } = MEMORY_SIZES[id];
      expect((pairs * 2) % cols, id).toBe(0);
      expect(MEMORY_SIZES[id].name.te).toMatch(TE);
    }
  });
  it('every theme pool has enough distinct real pictures for the largest board', () => {
    for (const t of MEMORY_THEMES) {
      const pool = memoryPool(t.id);
      expect(new Set(pool).size, t.id).toBe(pool.length);
      expect(pool.length, t.id).toBeGreaterThanOrEqual(MEMORY_SIZES.large.pairs);
      for (const id of pool) expect(PIC[id], id).toBeDefined();
    }
  });
  it('deals every picture exactly twice', () => {
    for (const seed of SEEDS) for (const size of MEMORY_SIZE_IDS) for (const t of MEMORY_THEMES) {
      const deck = memoryDeck(rng(seed), size, t.id);
      expect(deck.length).toBe(MEMORY_SIZES[size].pairs * 2);
      const counts = new Map<string, number>();
      deck.forEach((c) => counts.set(c.pair, (counts.get(c.pair) ?? 0) + 1));
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
      expect(deck.map((c) => c.idx)).toEqual(deck.map((_, i) => i));
    }
  });
  it('is deterministic for a seed', () => {
    expect(memoryDeck(rng(5), 'large', 'mix')).toEqual(memoryDeck(rng(5), 'large', 'mix'));
  });
  it('flips, matches, misses and hides correctly', () => {
    const cards = [{ idx: 0, pair: 'cow', art: 'cow' }, { idx: 1, pair: 'cat', art: 'cat' }, { idx: 2, pair: 'cow', art: 'cow' }, { idx: 3, pair: 'cat', art: 'cat' }];
    let s: MemState = memoryStart(cards);
    let r = memoryFlip(s, 0); expect(r.event).toBe('first'); s = r.s;
    expect(memoryFlip(s, 0).event).toBe('ignored'); // same card again
    r = memoryFlip(s, 1); expect(r.event).toBe('miss'); s = r.s;
    expect(s.moves).toBe(1);
    expect(memoryFlip(s, 2).event).toBe('ignored'); // two already open
    s = memoryHide(s);
    expect(isFaceUp(s, 0)).toBe(false);
    s = memoryFlip(s, 0).s; r = memoryFlip(s, 2); expect(r.event).toBe('match'); s = r.s;
    expect(isFaceUp(s, 0) && isFaceUp(s, 2)).toBe(true);
    expect(memoryFlip(s, 2).event).toBe('ignored'); // matched cards stay put
    expect(memoryFlip(s, 99).event).toBe('ignored');
    expect(memoryDone(s)).toBe(false);
    s = memoryFlip(memoryFlip(s, 1).s, 3).s;
    expect(memoryDone(s)).toBe(true);
    expect(s.moves).toBe(3);
  });
  it('a perfect-memory player can always finish', () => {
    for (const seed of SEEDS.slice(0, 40)) {
      let s = memoryStart(memoryDeck(rng(seed), 'large', 'mix'));
      const seen = new Map<string, number>();
      for (let i = 0; i < s.cards.length; i++) {
        if (isFaceUp(s, i)) continue;
        const other = seen.get(s.cards[i].pair);
        if (other !== undefined && !isFaceUp(s, other)) { s = memoryFlip(memoryFlip(s, other).s, i).s; continue; }
        seen.set(s.cards[i].pair, i);
      }
      // remaining: flip pairs directly
      for (let i = 0; i < s.cards.length; i++) for (let j = i + 1; j < s.cards.length; j++) {
        if (!isFaceUp(s, i) && !isFaceUp(s, j) && s.cards[i].pair === s.cards[j].pair) s = memoryFlip(memoryFlip(s, i).s, j).s;
      }
      expect(memoryDone(s)).toBe(true);
    }
  });
  it('awards 1–3 stars, more for fewer turns', () => {
    expect(memoryStars(3, 3)).toBe(3);
    expect(memoryStars(7, 3)).toBe(2);
    expect(memoryStars(30, 3)).toBe(1);
    for (let m = 1; m < 40; m++) expect(memoryStars(m, 8)).toBeGreaterThanOrEqual(memoryStars(m + 1, 8));
  });
  it('moves around the grid with arrow keys without leaving it', () => {
    expect(gridMove(0, 'ArrowLeft', 4, 12)).toBe(0);
    expect(gridMove(0, 'ArrowRight', 4, 12)).toBe(1);
    expect(gridMove(1, 'ArrowDown', 4, 12)).toBe(5);
    expect(gridMove(9, 'ArrowDown', 4, 12)).toBe(9);
    expect(gridMove(5, 'ArrowUp', 4, 12)).toBe(1);
    expect(gridMove(2, 'ArrowUp', 4, 12)).toBe(2);
    expect(gridMove(5, 'End', 4, 12)).toBe(11);
    expect(gridMove(5, 'Home', 4, 12)).toBe(0);
    expect(gridMove(11, 'ArrowRight', 4, 12)).toBe(11);
    expect(gridMove(3, 'x', 4, 12)).toBe(3);
  });
});

describe('colour mixing', () => {
  it('mixes the primary colours correctly', () => {
    expect(mixPaints(['red', 'yellow'])).toBe('orange');
    expect(mixPaints(['yellow', 'blue'])).toBe('green');
    expect(mixPaints(['blue', 'red'])).toBe('purple');
    expect(mixPaints(['red', 'white'])).toBe('pink');
    expect(mixPaints(['white', 'blue'])).toBe('lightblue');
    expect(mixPaints(['black', 'white'])).toBe('grey');
    expect(mixPaints(['red', 'yellow', 'blue'])).toBe('brown');
  });
  it('ignores amounts and order; one paint is itself; empty is nothing', () => {
    expect(mixPaints(['red', 'red', 'yellow'])).toBe('orange');
    expect(mixPaints(['yellow', 'red', 'red'])).toBe('orange');
    expect(mixPaints(['blue', 'blue'])).toBe('blue');
    expect(mixPaints([])).toBeNull();
    expect(mixPaints(['yellow', 'black'])).toBeNull();
  });
  it('gives every colour a name in English and Telugu and a valid hex', () => {
    for (const [id, c] of Object.entries(MIX_COLOURS)) {
      expect(c.en, id).toBeTruthy();
      expect(c.te, id).toMatch(TE);
      expect(c.hex, id).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
  it('shows a sensible bowl colour for named and unnamed mixes', () => {
    expect(mixHex([])).toBeNull();
    expect(mixHex(['red', 'yellow'])).toBe(MIX_COLOURS.orange.hex);
    expect(mixHex(['yellow', 'black'])).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('every target at every level can be made from that level’s paints within the bowl size', () => {
    MIX_TARGETS.forEach((targets, lv) => {
      for (const t of targets) {
        const rec = recipeFor(t);
        expect(rec.length).toBeLessThanOrEqual(MAX_BOWL);
        expect(rec.every((p) => MIX_PAINTS[lv].includes(p)), `${t} @${lv}`).toBe(true);
        expect(isMixRight(t, rec)).toBe(true);
      }
    });
    for (const rc of RECIPES) expect(mixPaints(rc.paints)).toBe(rc.makes);
  });
  it('mix rounds stay in level and avoid repeating the last target', () => {
    for (const seed of SEEDS) for (const lv of [0, 1, 2]) {
      const r = mixRound(rng(seed), lv, 'orange');
      expect(MIX_TARGETS[lv]).toContain(r.target);
      expect(r.target).not.toBe('orange');
      expect(r.paints).toEqual(MIX_PAINTS[lv]);
    }
    expect(mixRound(rng(1), 99).paints).toEqual(MIX_PAINTS[2]);
    expect(mixRound(rng(1), -5).paints).toEqual(MIX_PAINTS[0]);
  });
  it('quiz has exactly one right answer among three different options', () => {
    for (const seed of SEEDS) {
      const q = mixQuiz(rng(seed));
      expect(q.options.length).toBe(3);
      expect(new Set(q.options.map((o) => o.join('+'))).size).toBe(3);
      const right = q.options.filter((o) => mixPaints(o as Paint[]) === q.target);
      expect(right.length).toBe(1);
      expect(q.options[q.answer]).toEqual(right[0]);
    }
  });
});

describe('rhymes & songs', () => {
  it('has rhymes with English and Telugu lines, credits and unique ids', () => {
    expect(RHYMES.length).toBeGreaterThanOrEqual(5);
    expect(new Set(RHYMES.map((r) => r.id)).size).toBe(RHYMES.length);
    for (const r of RHYMES) {
      expect(r.lines.length, r.id).toBeGreaterThanOrEqual(3);
      expect(r.title.te, r.id).toMatch(TE);
      expect(r.credit.en, r.id).toBeTruthy();
      expect(['original', 'traditional']).toContain(r.source);
      expect(r.bpm).toBeGreaterThanOrEqual(60);
      expect(r.bpm).toBeLessThanOrEqual(130);
      for (const ln of r.lines) {
        expect(ln.en.trim(), r.id).not.toBe('');
        expect(ln.te, r.id).toMatch(TE);
        expect(wordsOf(ln.en).length, `${r.id}: short lines`).toBeLessThanOrEqual(12);
      }
    }
  });
  it('times words so longer words and line ends take longer, and slower speech takes longer', () => {
    const t = wordTimings('Up above the world so high,');
    expect(t.length).toBe(6);
    expect(t[5]).toBeGreaterThan(t[4]); // "high," has a pause
    expect(t[1]).toBeGreaterThan(t[0]); // "above" > "Up"
    const slow = wordTimings('Twinkle twinkle', 0.6), fast = wordTimings('Twinkle twinkle', 1);
    expect(slow[0]).toBeGreaterThan(fast[0]);
    expect(wordTimings('')).toEqual([]);
    expect(wordTimings('చందమామ రావే').length).toBe(2);
  });
  it('finds the word being said at a time', () => {
    const t = [100, 200, 300];
    expect(wordAt(t, 0)).toBe(0);
    expect(wordAt(t, 99)).toBe(0);
    expect(wordAt(t, 100)).toBe(1);
    expect(wordAt(t, 350)).toBe(2);
    expect(wordAt(t, 10_000)).toBe(2);
    expect(wordAt([], 5)).toBe(-1);
  });
  it('spaces beats evenly by tempo', () => {
    expect(beatTimes(120, 4)).toEqual([0, 500, 1000, 1500]);
    expect(beatTimes(60, 2, 100)).toEqual([100, 1100]);
    expect(beatTimes(100, 0)).toEqual([]);
  });
  it('judges claps: each beat once, near enough, extras counted', () => {
    const beats = beatTimes(120, 4); // 0 500 1000 1500
    const j = judgeClaps([10, 490, 520, 1200, 1490], beats, 150);
    expect(j.hits).toEqual([true, true, false, true]);
    expect(j.count).toBe(3);
    expect(j.extra).toBe(2); // 520 (beat already taken) and 1200 (too far)
    expect(judgeClaps([], beats, 150).count).toBe(0);
    expect(judgeClaps(beats, beats, CLAP_WINDOW[2]).count).toBe(4);
    expect(beatFor(260, beats, 200)).toBe(-1);
    expect(beatFor(440, beats, 200)).toBe(1);
    expect(CLAP_WINDOW[0]).toBeGreaterThan(CLAP_WINDOW[2]);
  });
});

describe('opposites', () => {
  it('covers the core opposites with English + Telugu words', () => {
    const ids = OPPOSITES.map((p) => p.id);
    for (const need of ['big-small', 'tall-short', 'full-empty', 'hot-cold', 'day-night']) expect(ids).toContain(need);
    expect(new Set(OPP_SIDES.map((s) => s.key)).size).toBe(OPP_SIDES.length);
    for (const s of OPP_SIDES) { expect(s.word.en).toBeTruthy(); expect(s.word.te).toMatch(TE); expect(oppSide(s.key)).toBe(s); }
    for (const p of OPPOSITES) expect(p.a.art + (p.a.v ?? '') + (p.a.scale ?? '')).not.toBe(p.b.art + (p.b.v ?? '') + (p.b.scale ?? ''));
  });
  it('pick rounds show both sides of one pair and ask for one of them', () => {
    for (const seed of SEEDS) for (const lv of [0, 1]) {
      const r = oppRound(rng(seed), lv, 'big-small');
      expect(r.kind).toBe('pick');
      expect(r.pair).not.toBe('big-small');
      expect(r.choices.length).toBe(2);
      expect(r.choices.map((c) => c.key)).toContain(r.ask.key);
      expect(r.choices.every((c) => c.key.startsWith(`${r.pair}:`))).toBe(true);
      if (lv === 0) expect(OPPOSITES.find((p) => p.id === r.pair)!.level).toBe(0);
      expect(oppRight(r, r.ask.key)).toBe(true);
      expect(oppRight(r, r.choices.find((c) => c.key !== r.ask.key)!.key)).toBe(false);
    }
  });
  it('opposite-of rounds have one right answer and unambiguous distractors', () => {
    for (const seed of SEEDS) {
      const r = oppRound(rng(seed), 2);
      if (r.kind !== 'opposite') throw new Error('expected opposite round');
      expect(r.choices.length).toBe(3);
      expect(r.shown.key).not.toBe(r.ask.key);
      expect(r.shown.key.split(':')[0]).toBe(r.ask.key.split(':')[0]);
      expect(r.choices.filter((c) => c.word.en === r.ask.word.en).length).toBe(1);
      expect(r.choices.map((c) => c.key)).not.toContain(r.shown.key);
      expect(new Set(r.choices.map((c) => c.art + (c.v ?? ''))).size).toBe(3);
    }
  });
});

describe('patterns', () => {
  const KINDS: PatKind[] = ['colour', 'shape', 'picture'];
  it('uses tokens that all have names', () => {
    for (const k of KINDS) for (const t of PAT_TOKENS[k]) {
      const n = tokenName(t);
      expect(n.en, t).not.toBe(t);
      expect(n.te, t).toMatch(TE);
    }
  });
  it('builds a true repeating sequence with exactly one right answer', () => {
    for (const seed of SEEDS) for (const k of KINDS) for (const lv of [0, 1, 2]) for (const n of [2, 3, 4]) {
      const r = patRound(rng(seed), k, lv, n);
      r.seq.forEach((t, i) => expect(t).toBe(r.unit[i % r.unit.length]));
      expect(r.seq.length).toBeGreaterThanOrEqual(r.unit.length * 2);
      expect(r.answer).toBe(r.seq[r.blank]);
      expect(r.blank).toBeGreaterThanOrEqual(r.unit.length); // pattern is shown at least once before the gap
      expect(r.choices.length).toBe(Math.min(Math.max(n, 2), 4));
      expect(new Set(r.choices).size).toBe(r.choices.length);
      expect(r.choices.filter((c) => patRight(r, c)).length).toBe(1);
      r.choices.forEach((c) => expect(PAT_TOKENS[k]).toContain(c));
      if (lv < 2) expect(r.blank).toBe(r.seq.length - 1);
      if (lv === 0) expect(r.unit.length).toBe(2);
    }
  });
  it('level 2 sometimes hides a token in the middle', () => {
    const mids = SEEDS.map((s) => patRound(rng(s), 'colour', 2)).filter((r) => r.blank < r.seq.length - 1);
    expect(mids.length).toBeGreaterThan(10);
  });
});

describe('sound safari', () => {
  it('has animals, vehicles and the nature sounds, with names in both languages', () => {
    for (const n of ['rain', 'thunder', 'wind', 'stream', 'sea', 'fire', 'birds', 'crickets', 'splash']) expect(SAFARI.some((s) => s.sfx === n), n).toBe(true);
    expect(SAFARI.filter((s) => s.group === 'animal').length).toBeGreaterThanOrEqual(8);
    expect(SAFARI.filter((s) => s.group === 'vehicle').length).toBeGreaterThanOrEqual(6);
    expect(new Set(SAFARI.map((s) => s.id)).size).toBe(SAFARI.length);
    for (const s of SAFARI) { expect(s.name.en).toBeTruthy(); expect(s.name.te, s.id).toMatch(TE); expect(s.clue?.en, `${s.id} clue`).toBeTruthy(); }
    for (const g of SAFARI_GROUPS) expect(g.title.te).toMatch(TE);
  });
  it('only offers sounds that exist in the sound library', () => {
    const avail = availableSafari(SFX_NAMES);
    expect(avail.every((s) => (SFX_NAMES as string[]).includes(s.sfx))).toBe(true);
    expect(avail.filter((s) => s.group === 'animal').length).toBeGreaterThanOrEqual(8);
    expect(availableSafari(['cow'])).toEqual([SAFARI_BY_ID.cow]);
    expect(availableSafari([])).toEqual([]);
  });
  it('rounds never put two confusable sounds together', () => {
    const all = availableSafari(SAFARI.map((s) => s.sfx));
    for (const seed of SEEDS) for (const g of ['animal', 'vehicle', 'nature', 'mix'] as const) for (const n of [2, 3, 4]) {
      const r = safariRound(rng(seed), g, n, all, 'cow')!;
      expect(r).not.toBeNull();
      expect(r.choices.length).toBe(n);
      expect(r.choices).toContain(r.target);
      const keys = r.choices.map((id) => SAFARI_BY_ID[id].clash ?? SAFARI_BY_ID[id].sfx);
      expect(new Set(keys).size).toBe(keys.length);
      if (g !== 'mix') expect(r.choices.every((id) => SAFARI_BY_ID[id].group === g)).toBe(true);
      expect(safariRight(r, r.target)).toBe(true);
      if (g === 'animal') expect(r.target).not.toBe('cow');
    }
  });
  it('returns null when too few sounds are available', () => {
    expect(safariRound(rng(1), 'nature', 3, availableSafari(['rain']))).toBeNull();
  });
});

describe('daily surprise & stickers', () => {
  it('formats local days and steps back across months and years', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(prevDay('2026-03-01')).toBe('2026-02-28');
    expect(prevDay('2028-03-01')).toBe('2028-02-29');
    expect(prevDay('2027-01-01')).toBe('2026-12-31');
  });
  it('hashes strings stably', () => {
    expect(hashStr('abc')).toBe(hashStr('abc'));
    expect(hashStr('2026-11-09')).not.toBe(hashStr('2026-11-10'));
  });
  it('gives the same challenge all day, with all four kinds of game', () => {
    const avail = availableSafari(SAFARI.map((s) => s.sfx));
    const a = dailyChallenge('2026-11-09', avail), b = dailyChallenge('2026-11-09', avail);
    expect(a).toEqual(b);
    expect(a.length).toBe(DAILY_STEPS);
    expect(new Set(a.map((s) => s.kind))).toEqual(new Set(['pattern', 'opposite', 'mix', 'safari']));
    const days = Array.from({ length: 30 }, (_, i) => dailyChallenge(dayKey(new Date(2026, 10, i + 1)), avail).map((s) => s.kind).join());
    expect(new Set(days).size).toBeGreaterThan(3);
  });
  it('still works when no sounds are available (safari swapped out)', () => {
    const steps = dailyChallenge('2026-11-09', []);
    expect(steps.length).toBe(DAILY_STEPS);
    expect(steps.some((s) => s.kind === 'safari')).toBe(false);
  });
  it('has stickers with unique ids, both languages, and a few for every game', () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const s of STICKERS) { expect(s.name.te, s.id).toMatch(TE); expect(s.bg).toMatch(/^#[0-9A-F]{6}$/i); expect(STICKER[s.id]).toBe(s); }
    for (const src of Object.keys(STICKER_SOURCES)) expect(STICKERS.filter((s) => s.source === src).length, src).toBeGreaterThanOrEqual(2);
    expect(STICKERS.filter((s) => s.source === 'daily').length).toBeGreaterThanOrEqual(7);
  });
  it('gives each sticker once and runs out gracefully', () => {
    let s = STICKER_INIT;
    const got: string[] = [];
    for (let i = 0; i < 10; i++) { const n = nextSticker(s, 'memory'); if (!n) break; got.push(n.id); s = earnSticker(s, n.id, 1000 + i); }
    expect(got.length).toBe(STICKERS.filter((x) => x.source === 'memory').length);
    expect(new Set(got).size).toBe(got.length);
    expect(nextSticker(s, 'memory')).toBeNull();
    expect(earnSticker(s, got[0], 99)).toBe(s); // already earned: unchanged
    expect(earnSticker(s, 'nope', 99)).toBe(s);
    expect(stickerCount(s)).toBe(got.length);
  });
  it('picks the daily sticker by date and skips ones already earned', () => {
    const a = nextSticker(STICKER_INIT, 'daily', '2026-11-09')!;
    expect(a.source).toBe('daily');
    expect(nextSticker(STICKER_INIT, 'daily', '2026-11-09')).toBe(a);
    const s = earnSticker(STICKER_INIT, a.id, 1);
    expect(nextSticker(s, 'daily', '2026-11-09')!.id).not.toBe(a.id);
  });
  it('records days once and counts the streak', () => {
    let s = recordDay(STICKER_INIT, '2026-11-08');
    s = recordDay(s, '2026-11-08');
    expect(s.days).toEqual(['2026-11-08']);
    s = recordDay(recordDay(s, '2026-11-07'), '2026-11-09');
    expect(doneToday(s, '2026-11-09')).toBe(true);
    expect(streak(s.days, '2026-11-09')).toBe(3);
    expect(streak(s.days, '2026-11-10')).toBe(3); // not played yet today: streak kept
    expect(streak(s.days, '2026-11-11')).toBe(0);
    expect(streak(['2026-11-01', '2026-11-03'], '2026-11-03')).toBe(1);
    expect(streak([], '2026-11-03')).toBe(0);
  });
});
