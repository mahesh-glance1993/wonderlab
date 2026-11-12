// Engine functions for the games feature (called from Kotlin as "games.<name>").
// Generation, answer checking, instructions, hints and feedback messages are the website's own
// (src/features/games/gen/* and the module definitions in views/*.tsx, ported here 1:1 because the
// .tsx files import React UI). The native screens only draw and dispatch actions.
import { GAMES, BADGES, badgeIds, gamesForClass, classRangeLabel, gameById, type GameId } from '../../src/features/games/catalog';
import { GENERATORS, dailyPuzzle } from '../../src/features/games/gen';
import { L, levelFor as levelForFn, prevDateKey as prevDateKeyFn, type Variant } from '../../src/features/games/gen/common';
import { checkCounting, OBJECT_NAMES, type CountingRound } from '../../src/features/games/gen/counting';
import { checkDrop, binFor, pieceValue, SHAPE_NAMES, COLOR_NAMES, SIDES, type ShapesRound, type Piece } from '../../src/features/games/gen/shapes';
import { checkPattern, patternAnswer, unitSeq, numberSeq, tokenKey, type PatternsRound, type Token } from '../../src/features/games/gen/patterns';
import { answerK, formatK, expression, type NumberLineRound } from '../../src/features/games/gen/numberline';
import { checkMatch, decText, type FractionsRound, type FracCard } from '../../src/features/games/gen/fractions';
import { isSudokuSolved, isMagicSolved, sudokuConflicts, MAGIC_LINES, type LogicRound } from '../../src/features/games/gen/logic';
import { applyOp, isSolvedEq, solvedValue, nextStep, formatEq, formatOp, formatSide, type BalanceRound, type Eq, type BalanceOp } from '../../src/features/games/gen/balance';
import { simulate, circuitGoalMet, forceAnswer, netForce, mirrorAnswer, reflectDir, unitLabel, type CircuitsRound, type CircuitRound, type ForceRound, type MirrorRound, type NumericRound } from '../../src/features/games/gen/circuits';
import { grade } from '../../src/shared/grading';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Realistic pictures used by the native hub (bundled 3D emoji).
const EMOJI: Record<GameId, string> = { counting: '🍎', shapes: '🔺', patterns: '🟣', numberline: '🐸', fractions: '🍕', logic: '🎲', balance: '🪙', circuits: '💡' };
const BADGE_EMOJI: Record<string, string> = { star: '⭐', sparkle: '🎈', trophy: '👑', sun: '☀️', flag: '🚩' };
// Counting objects as realistic pictures.
export const COUNT_EMOJI: Record<string, string> = { apple: '🍎', ball: '⚽', fish: '🐟', flower: '🌸', star: '⭐', leaf: '🍃' };

/** UI strings, copied from src/features/games/ui.ts (that file also holds React hooks). */
const S = {
  library: L('Games and Puzzles', 'ఆటలు మరియు పజిల్స్'),
  greatForClass: L('Great for your class', 'మీ తరగతికి సరైనవి'),
  moreGames: L('More games', 'మరిన్ని ఆటలు'),
  play: L('Play', 'ఆడు'),
  dailyPuzzle: L('Daily puzzle', 'రోజువారీ పజిల్'),
  dailyBody: L('A new puzzle every day, just for you.', 'ప్రతి రోజు మీ కోసం ఒక కొత్త పజిల్.'),
  dailyDone: L('Solved today — come back tomorrow!', 'ఈ రోజు పూర్తయింది — రేపు మళ్ళీ రండి!'),
  dayStreak: L('day streak', 'రోజుల వరుస'),
  badges: L('My badges', 'నా బ్యాడ్జీలు'),
  noBadges: L('Play a game to earn your first badge.', 'మొదటి బ్యాడ్జీ కోసం ఒక ఆట ఆడండి.'),
  badgesPrivate: L('Badges are just for you — no leaderboards.', 'బ్యాడ్జీలు మీ కోసం మాత్రమే.'),
  locked: L('still to earn', 'ఇంకా సంపాదించాలి'),
  classes: L('Classes', 'తరగతులు'),
  roundsPlayed: L('rounds', 'ఆటలు'),
  guided: L('Guided', 'సహాయంతో'),
  regular: L('Regular', 'సాధారణ'),
  challenge: L('Challenge', 'సవాలు'),
  mode: L('Mode', 'విధానం'),
  level: L('Level', 'స్థాయి'),
  streak: L('streak', 'వరుస'),
  hint: L('Hint', 'సూచన'),
  noHintsChallenge: L('No hints in challenge mode', 'సవాలులో సూచనలు లేవు'),
  restart: L('Restart', 'మళ్ళీ మొదలు'),
  newRound: L('New puzzle', 'కొత్త పజిల్'),
  next: L('Next puzzle', 'తదుపరి పజిల్'),
  check: L('Check', 'సరిచూడు'),
  timer: L('Timer', 'టైమర్'),
  timerOff: L('Untimed', 'సమయం లేదు'),
  correct: L('Correct! Well done.', 'సరైనది! బాగా చేశారు.'),
  solvedFirstTry: L('Solved on the first try!', 'మొదటి ప్రయత్నంలోనే!'),
  tryAgain: L('Not quite — try again.', 'సరిగ్గా లేదు — మళ్ళీ ప్రయత్నించండి.'),
  newBadge: L('New badge', 'కొత్త బ్యాడ్జీ'),
  howToPlay: L('How to play', 'ఎలా ఆడాలి'),
  undo: L('Undo', 'వెనక్కి'),
  erase: L('Erase', 'తుడిచివేయి'),
  answer: L('Your answer', 'మీ జవాబు'),
  hintsLabel: L('Hints', 'సూచనలు'),
  dailyTag: L('Today’s puzzle', 'నేటి పజిల్'),
  notFound: L('That game was not found.', 'ఆ ఆట కనబడలేదు.'),
  backToGames: L('Back to games', 'ఆటలకు తిరిగి'),
};
export const strings = () => S;
export const catalog = () => GAMES.map((g) => ({ ...g, emoji: EMOJI[g.id], rangeLabel: classRangeLabel(g), rangeLabelTe: classRangeLabel(g, true) }));
export const library = (classLevel: number) => gamesForClass(classLevel).map(({ game, fits }) => ({ id: game.id, fits }));
export const badges = () => BADGES.map((b) => ({ ...b, emoji: BADGE_EMOJI[b.icon] ?? '⭐' }));
export const badgeIdsFor = (id: GameId) => ({ first: badgeIds.first(id), five: badgeIds.five(id), challenge: badgeIds.challenge(id), dailyFirst: badgeIds.dailyFirst, dailyStreak3: badgeIds.dailyStreak3, dailyStreak7: badgeIds.dailyStreak7 });
export const countEmoji = () => COUNT_EMOJI;
export function levelFor(id: GameId, classLevel: number, variant: Variant, adjust = 0) {
  const g = gameById(id);
  return g ? levelForFn(g.classRange, classLevel, variant, adjust) : 0;
}
export const daily = (date: string, profileId: string, classLevel: number) => dailyPuzzle(date, profileId, classLevel);
export const prevDateKey = (key: string) => prevDateKeyFn(key);
export const generate = (id: GameId, seed: number, level: number) => GENERATORS[id].generate(seed, level);
export const validate = (id: GameId, round: Any): string[] => (GENERATORS[id].validate as (r: Any) => string[])(round);

// ---------------------------------------------------------------- per-game definitions
interface Fx { mistake?: L; complete?: L; perfect?: boolean; notice?: L; say?: L }
interface Def {
  init(r: Any): Any;
  instructions(r: Any): L;
  hints(r: Any, p: Any): L[];
  view(r: Any, p: Any): Any;
  act(r: Any, p: Any, a: Any, solved: boolean): { progress: Any; fx: Fx };
}
const out = (progress: Any, fx: Fx = {}) => ({ progress, fx });

// ---------- counting (views/Counting.tsx) ----------
const counting: Def = {
  init: () => ({ counted: [], choice: null }),
  instructions: (r: CountingRound) => r.kind === 'count'
    ? L(`Tap each ${OBJECT_NAMES[r.object].en.replace(/s$/, '')} to count it. Then choose how many there are.`, `ప్రతి దాన్ని తాకి లెక్కించండి. తర్వాత ఎన్ని ${OBJECT_NAMES[r.object].te} ఉన్నాయో ఎంచుకోండి.`)
    : L(`Find the group that has ${r.target}.`, `${r.target} ఉన్న గుంపును కనుగొనండి.`),
  hints: (r: CountingRound) => r.kind === 'count'
    ? [
      L('Touch each one only once. Say the number out loud as you touch it.', 'ప్రతి దాన్ని ఒక్కసారే తాకండి. తాకుతూ సంఖ్యను పైకి చెప్పండి.'),
      L(`Counted ones line up in rows of ${r.groupSize}. A full row is ${r.groupSize}.`, `లెక్కించినవి ${r.groupSize} చొప్పున వరుసల్లో ఉంటాయి.`),
      L(`The last number you say is how many there are.`, 'మీరు చెప్పే చివరి సంఖ్యే మొత్తం.'),
    ]
    : [
      L('Count each group carefully, one at a time.', 'ప్రతి గుంపును జాగ్రత్తగా లెక్కించండి.'),
      L(`Rows of ${r.groupSize} help: a full row is ${r.groupSize}.`, `${r.groupSize} వరుసలు సహాయపడతాయి.`),
      L(`${r.target} is ${Math.floor(r.target / r.groupSize)} full row(s) and ${r.target % r.groupSize} more.`, `${r.target} = ${Math.floor(r.target / r.groupSize)} పూర్తి వరుసలు + ${r.target % r.groupSize}.`),
    ],
  view: (r: CountingRound) => r.kind === 'count'
    ? { emoji: COUNT_EMOJI[r.object], name: OBJECT_NAMES[r.object], question: L(`How many ${OBJECT_NAMES[r.object].en}?`, `ఎన్ని ${OBJECT_NAMES[r.object].te}?`) }
    : { groups: r.groups.map((g) => ({ emoji: COUNT_EMOJI[g.object], name: OBJECT_NAMES[g.object], right: g.n === r.target })) },
  act(r: CountingRound, p, a, solved) {
    if (solved) return out(p);
    if (r.kind === 'match') {
      if (a.type !== 'chooseGroup') return out(p);
      const i = a.i as number;
      const progress = { ...p, choice: i };
      if (checkCounting(r, i)) return out(progress, { complete: L(`Yes! That group has ${r.target}.`, `అవును! ఆ గుంపులో ${r.target} ఉన్నాయి.`) });
      return out(progress, { mistake: L(`That group has ${r.groups[i].n}. Count again to find ${r.target}.`, `ఆ గుంపులో ${r.groups[i].n} ఉన్నాయి. ${r.target} కోసం మళ్ళీ లెక్కించండి.`) });
    }
    const name = OBJECT_NAMES[r.object];
    const count = p.counted.length;
    if (a.type === 'tap') {
      if (p.counted.includes(a.i)) return out(p);
      return out({ ...p, counted: [...p.counted, a.i] }, { say: L(String(count + 1)) });
    }
    if (a.type === 'choose') {
      const v = a.v as number;
      const progress = { ...p, choice: v };
      if (checkCounting(r, v)) return out(progress, { complete: L(`Yes! There are ${r.n} ${name.en}.`, `అవును! ${r.n} ${name.te} ఉన్నాయి.`) });
      return out(progress, { mistake: count < r.n
        ? L(`Not ${v}. Some ${name.en} are not counted yet — tap them all.`, `${v} కాదు. ఇంకా కొన్ని లెక్కించలేదు — అన్నింటినీ తాకండి.`)
        : L(`Not ${v}. Look at the tray and count again.`, `${v} కాదు. ట్రేలో చూసి మళ్ళీ లెక్కించండి.`) });
    }
    return out(p);
  },
};

// ---------- shapes (views/Shapes.tsx) ----------
const pieceName = (p: Piece): L => L(`${COLOR_NAMES[p.color].en} ${SHAPE_NAMES[p.shape].en}`, `${COLOR_NAMES[p.color].te} ${SHAPE_NAMES[p.shape].te}`);
const attrText: Record<ShapesRound['attr'], L> = { color: L('colour', 'రంగు'), shape: L('shape', 'ఆకారం'), sides: L('number of sides', 'భుజాల సంఖ్య') };
const shapes: Def = {
  init: () => ({ placed: {}, selected: null, last: null }),
  instructions: (r: ShapesRound) => L(
    `Sort the shapes by ${attrText[r.attr].en}. Drag a shape into a bin — or tap a shape, then tap its bin.`,
    `ఆకారాలను ${attrText[r.attr].te} ప్రకారం వేరు చేయండి. ఆకారాన్ని లాగి డబ్బాలో వేయండి — లేదా ఆకారాన్ని తాకి, తర్వాత డబ్బాను తాకండి.`,
  ),
  hints: (r: ShapesRound, p) => {
    const next = r.pieces.find((x) => !p.placed[x.id]);
    const h = [
      r.attr === 'sides' ? L('Count the straight edges of each shape. A circle has no straight sides.', 'ప్రతి ఆకారం యొక్క సరళ అంచులను లెక్కించండి.')
        : r.attr === 'shape' ? L('Look at the corners and sides: triangles have 3 corners, squares have 4 equal sides.', 'మూలలు, భుజాలు చూడండి: త్రిభుజానికి 3 మూలలు.')
          : L('Look only at the colour and the pattern inside the shape.', 'ఆకారం లోపలి రంగు, నమూనా మాత్రమే చూడండి.'),
    ];
    if (next) {
      const b = binFor(r, next)!;
      h.push(L(`The ${pieceName(next).en} goes in "${b.label.en}" (${r.attr === 'sides' ? `${pieceValue(next, 'sides')} sides` : b.label.en}).`, `${pieceName(next).te} — "${b.label.te}" డబ్బాలోకి.`));
    }
    return h;
  },
  view: (r: ShapesRound) => ({ names: Object.fromEntries(r.pieces.map((p) => [p.id, pieceName(p)])) }),
  act(r: ShapesRound, p, a, solved) {
    if (solved) return out(p);
    const drop = (pieceId: string, binId: string) => {
      const pc = r.pieces.find((x) => x.id === pieceId);
      const bin = r.bins.find((b) => b.id === binId);
      if (!pc || !bin || p.placed[pieceId]) return out(p);
      if (checkDrop(r, pieceId, binId)) {
        const placed = { ...p.placed, [pieceId]: binId };
        const fx: Fx = { say: L(`${pieceName(pc).en} in ${bin.label.en}`, `${pieceName(pc).te} — ${bin.label.te}`) };
        if (Object.keys(placed).length === r.pieces.length) fx.complete = L('All sorted! Every shape is in the right bin.', 'అన్నీ సరిగ్గా వేరు చేశారు!');
        return out({ placed, selected: null, last: pieceId }, fx);
      }
      const why = r.attr === 'sides'
        ? L(`A ${SHAPE_NAMES[pc.shape].en} has ${SIDES[pc.shape]} sides, not ${bin.value}.`, `${SHAPE_NAMES[pc.shape].te}కి ${SIDES[pc.shape]} భుజాలు ఉంటాయి.`)
        : L(`That is a ${pieceName(pc).en}. It does not go in "${bin.label.en}". Try another bin.`, `అది ${pieceName(pc).te}. వేరే డబ్బా ప్రయత్నించండి.`);
      return out({ ...p, selected: null }, { mistake: why });
    };
    if (a.type === 'drop') return drop(a.piece, a.bin);
    if (a.type === 'select') {
      const sel = p.selected === a.id ? null : a.id;
      const pc = r.pieces.find((x) => x.id === a.id);
      return out({ ...p, selected: sel }, sel && pc ? { say: pieceName(pc) } : {});
    }
    if (a.type === 'bin') return p.selected ? drop(p.selected, a.bin) : out(p, { notice: L('First choose a shape, then tap a bin.', 'ముందు ఒక ఆకారాన్ని ఎంచుకోండి.') });
    if (a.type === 'deselect') return out({ ...p, selected: null });
    return out(p);
  },
};

// ---------- patterns (views/Patterns.tsx) ----------
const tokName = (t: Token): L => L(`${COLOR_NAMES[t.color].en} ${SHAPE_NAMES[t.shape].en}`, `${COLOR_NAMES[t.color].te} ${SHAPE_NAMES[t.shape].te}`);
const optKey = (o: Token | number) => (typeof o === 'number' ? String(o) : tokenKey(o));
function ruleText(r: Extract<PatternsRound, { kind: 'number' }>): L {
  const x = r.rule;
  switch (x.type) {
    case 'arith': return x.step > 0 ? L(`Add ${x.step} each time.`, `ప్రతిసారి ${x.step} కలపండి.`) : L(`Take away ${-x.step} each time.`, `ప్రతిసారి ${-x.step} తీసివేయండి.`);
    case 'geom': return L(`Multiply by ${x.ratio} each time.`, `ప్రతిసారి ${x.ratio}తో గుణించండి.`);
    case 'growing': return L(`The jumps grow by 1: +${x.firstStep}, +${x.firstStep + 1}, +${x.firstStep + 2}, …`, `దూకులు 1 చొప్పున పెరుగుతాయి.`);
    case 'squares': return L(`These are square numbers: ${x.offset}×${x.offset}, ${x.offset + 1}×${x.offset + 1}, …`, 'ఇవి వర్గ సంఖ్యలు.');
  }
}
const patterns: Def = {
  init: () => ({ choice: null }),
  instructions: (r: PatternsRound) => r.kind === 'unit'
    ? L('Look at the pattern. Which shape comes in the empty space?', 'నమూనాను చూడండి. ఖాళీలో ఏ ఆకారం వస్తుంది?')
    : L('Find the rule of the number pattern. Which number goes in the empty space?', 'సంఖ్యల నమూనా నియమం కనుగొనండి. ఖాళీలో ఏ సంఖ్య వస్తుంది?'),
  hints: (r: PatternsRound) => r.kind === 'unit'
    ? [
      L('Say the pattern out loud from the start: ' + r.unit.map((t) => tokName(t).en).join(', ') + ' …', 'మొదటి నుండి నమూనాను పైకి చెప్పండి.'),
      L(`The pattern repeats every ${r.unit.length} shapes (${r.unitName}). The repeats are marked.`, `నమూనా ప్రతి ${r.unit.length} ఆకారాలకు మళ్ళీ వస్తుంది.`),
    ]
    : [L('Find the difference between neighbouring numbers.', 'పక్క పక్క సంఖ్యల మధ్య తేడా కనుగొనండి.'), ruleText(r)],
  view: (r: PatternsRound) => {
    const seq: (Token | number)[] = r.kind === 'unit' ? unitSeq(r) : numberSeq(r);
    const opts: (Token | number)[] = r.options;
    return {
      seq: seq.map((t) => (typeof t === 'number' ? { num: t, text: t < 0 ? `−${-t}` : String(t) } : { token: t, name: tokName(t) })),
      unitLength: r.kind === 'unit' ? r.unit.length : 0,
      answerKey: optKey(patternAnswer(r)),
      options: opts.map((o) => (typeof o === 'number' ? { key: optKey(o), num: o, text: o < 0 ? `−${-o}` : String(o) } : { key: optKey(o), token: o, name: tokName(o) })),
      question: L('What goes in the empty space?', 'ఖాళీలో ఏమి వస్తుంది?'),
    };
  },
  act(r: PatternsRound, p, a, solved) {
    if (solved || a.type !== 'choose') return out(p);
    const opts: (Token | number)[] = r.options;
    const o = opts.find((x) => optKey(x) === a.key);
    if (o === undefined) return out(p);
    const progress = { choice: optKey(o) };
    const fx: Fx = {};
    if (checkPattern(r, o)) fx.complete = L('Yes! That keeps the pattern going.', 'అవును! నమూనా సరిగ్గా కొనసాగుతుంది.');
    else fx.mistake = typeof o === 'number'
      ? L(`${o} does not fit. Look at how each number changes.`, `${o} సరిపోదు. ప్రతి సంఖ్య ఎలా మారుతుందో చూడండి.`)
      : L(`The ${tokName(o).en} does not fit there. Say the pattern out loud.`, `${tokName(o).te} అక్కడ సరిపోదు. నమూనాను పైకి చెప్పండి.`);
    if (typeof o !== 'number') fx.say = tokName(o);
    return out(progress, fx);
  },
};

// ---------- number line (views/NumberLine.tsx) ----------
const numberline: Def = {
  init: (r: NumberLineRound) => ({ pos: r.startK, hops: 0 }),
  instructions: (r: NumberLineRound) => L(
    `Solve ${expression(r)}. The frog starts at ${formatK(r.startK, r.den, r.display)}. Hop ${r.op === '+' ? 'right to add' : 'left to subtract'}, then press Check.`,
    `${expression(r)} చేయండి. కప్ప ${formatK(r.startK, r.den, r.display)} వద్ద మొదలవుతుంది. ${r.op === '+' ? 'కలపడానికి కుడికి' : 'తీసివేయడానికి ఎడమకు'} దూకి, సరిచూడు నొక్కండి.`,
  ),
  hints: (r: NumberLineRound) => [
    L(`Adding moves right; subtracting moves left. Here we ${r.op === '+' ? 'add, so hop right' : 'subtract, so hop left'}.`, r.op === '+' ? 'కలిపితే కుడికి, కాబట్టి కుడికి దూకండి.' : 'తీసివేస్తే ఎడమకు, కాబట్టి ఎడమకు దూకండి.'),
    L(`Make hops that add up to ${formatK(r.amountK, r.den, r.display)}. The dashed arc shows the whole jump.`, `మొత్తం ${formatK(r.amountK, r.den, r.display)} అయ్యేలా దూకండి. చుక్కల వంపు మొత్తం దూకును చూపుతుంది.`),
    ...(r.den > 1 ? [L(`Each small tick is 1/${r.den}${r.display === 'dec' ? ' = 0.1' : ''}.`, `ప్రతి చిన్న గీత 1/${r.den}.`)] : []),
  ],
  view: (r: NumberLineRound, p) => {
    const fmt = (k: number) => formatK(k, r.den, r.display);
    const n = r.maxK - r.minK + 1;
    const ticks = Array.from({ length: n }, (_, i) => {
      const k = r.minK + i;
      const label = (k - r.minK) % r.labelEvery === 0 || k === 0 || (r.display === 'frac' && k % r.den === 0);
      return { k, text: fmt(k), show: label || n <= 21, whole: k % r.den === 0 };
    });
    return {
      ticks, expression: expression(r), target: answerK(r), targetText: fmt(answerK(r)), posText: fmt(p.pos),
      hops: r.hops.map((h) => ({ h, text: fmt(h), left: L(`Hop left ${fmt(h)}`, `ఎడమకు ${fmt(h)} దూకు`), right: L(`Hop right ${fmt(h)}`, `కుడికి ${fmt(h)} దూకు`) })),
    };
  },
  act(r: NumberLineRound, p, a, solved) {
    if (solved) return out(p);
    const fmt = (k: number) => formatK(k, r.den, r.display);
    const target = answerK(r);
    if (a.type === 'move') {
      const pos = clampN(a.k, r.minK, r.maxK);
      if (pos === p.pos) return out(p);
      return out({ pos, hops: p.hops + 1 }, { say: L(fmt(pos).replace('−', 'minus ')) });
    }
    if (a.type === 'reset') return out({ pos: r.startK, hops: 0 });
    if (a.type === 'check') {
      if (p.pos === r.startK) return out(p, { notice: L('Hop first! Start at the frog and jump.', 'ముందు దూకండి!') });
      if (p.pos === target) return out(p, { complete: L(`Yes! ${expression(r)} = ${fmt(target)}.`, `అవును! ${expression(r)} = ${fmt(target)}.`) });
      const dir = p.pos < target ? L('right', 'కుడి') : L('left', 'ఎడమ');
      return out(p, { mistake: L(`You landed on ${fmt(p.pos)}. That is not ${expression(r)} — hop further ${dir.en}.`, `మీరు ${fmt(p.pos)} పై ఉన్నారు. ఇంకా ${dir.te} వైపు దూకండి.`) });
    }
    return out(p);
  },
};

// ---------- fractions (views/Fractions.tsx) ----------
const spoken = (c: FracCard) => (c.kind === 'bar' || c.kind === 'circle' ? `picture: ${c.num} of ${c.den} parts` : c.kind === 'frac' ? `${c.num} over ${c.den}` : c.text);
const fractions: Def = {
  init: () => ({ matched: [], selL: null, selR: null, wrong: null }),
  instructions: (r: FractionsRound) => r.level === 0
    ? L('Match each picture to its fraction. Tap a card on the left, then its partner on the right.', 'ప్రతి చిత్రాన్ని దాని భిన్నంతో జత చేయండి. ఎడమ కార్డు తాకి, తర్వాత కుడి వైపు జత తాకండి.')
    : L('Match cards that show the same amount (fractions, decimals, percentages or pictures). Tap one on the left, then its partner on the right.', 'ఒకే విలువ చూపే కార్డులను జత చేయండి. ఎడమది తాకి, తర్వాత కుడి వైపు జత తాకండి.'),
  hints: (r: FractionsRound) => [
    r.level <= 1
      ? L('Equivalent fractions: multiply the top and bottom by the same number. 1/2 = 2/4 = 3/6.', 'పైన, కింద ఒకే సంఖ్యతో గుణిస్తే సమాన భిన్నం వస్తుంది: 1/2 = 2/4.')
      : L('Turn everything into a decimal: divide the top by the bottom. 50% = 0.5, 25% = 0.25.', 'అన్నింటినీ దశాంశంగా మార్చండి: పైది కిందితో భాగించండి.'),
    L('Start with the easy ones: one half is 0.5 or 50%; one quarter is 0.25 or 25%.', 'సులభమైనవి ముందు: సగం = 0.5 = 50%.'),
  ],
  view: (r: FractionsRound) => ({ spoken: Object.fromEntries([...r.left, ...r.right].map((c) => [c.id, spoken(c)])) }),
  act(r: FractionsRound, p, a, solved) {
    if (solved || a.type !== 'pick') return out(p);
    const isMatched = (id: string) => p.matched.some(([x, y]: [string, string]) => x === id || y === id);
    if (isMatched(a.id)) return out(p);
    const tryPair = (l: string, rr: string) => {
      const A = r.left.find((c) => c.id === l)!, B = r.right.find((c) => c.id === rr)!;
      if (checkMatch(r, l, rr)) {
        const matched = [...p.matched, [l, rr]];
        return out({ matched, selL: null, selR: null, wrong: null }, matched.length === r.left.length ? { complete: L('All matched! Every pair shows the same amount.', 'అన్నీ జత అయ్యాయి!') } : {});
      }
      const va = `${A.num}/${A.den} = ${decText(A.num, A.den).length <= 6 ? decText(A.num, A.den) : (A.num / A.den).toFixed(3)}`;
      const vb = `${B.num}/${B.den} = ${decText(B.num, B.den).length <= 6 ? decText(B.num, B.den) : (B.num / B.den).toFixed(3)}`;
      return out({ ...p, selL: null, selR: null, wrong: [l, rr] }, { mistake: L(`Those are not equal: ${va}, but ${vb}.`, `అవి సమానం కావు: ${va}, ${vb}.`) });
    };
    if (a.side === 'L') {
      const selL = p.selL === a.id ? null : a.id;
      return selL && p.selR ? tryPair(selL, p.selR) : out({ ...p, selL, wrong: null });
    }
    const selR = p.selR === a.id ? null : a.id;
    return selR && p.selL ? tryPair(p.selL, selR) : out({ ...p, selR, wrong: null });
  },
};

// ---------- logic (views/Logic.tsx) ----------
function candidates(grid: number[], i: number, n: number, br: number, bc: number): number[] {
  const r = Math.floor(i / n), c = i % n;
  const used = new Set<number>();
  for (let k = 0; k < n; k++) { used.add(grid[r * n + k]); used.add(grid[k * n + c]); }
  const r0 = Math.floor(r / br) * br, c0 = Math.floor(c / bc) * bc;
  for (let a = 0; a < br; a++) for (let b = 0; b < bc; b++) used.add(grid[(r0 + a) * n + c0 + b]);
  return Array.from({ length: n }, (_, k) => k + 1).filter((v) => !used.has(v));
}
const logic: Def = {
  init: (r: LogicRound) => ({ grid: r.givens.slice(), sel: Math.max(0, r.givens.findIndex((v) => !v)), shown: [] }),
  instructions: (r: LogicRound) => r.kind === 'sudoku'
    ? L(`Fill the grid so every row, column and box has the numbers 1 to ${r.n} exactly once. Pick a square, then a number (or type it).`, `ప్రతి వరుస, నిలువు వరుస, పెట్టెలో 1 నుండి ${r.n} వరకు సంఖ్యలు ఒక్కసారే వచ్చేలా నింపండి.`)
    : L(`Place the numbers ${r.numbers[0]}–${r.numbers[8]} so every row, column and diagonal adds up to ${r.total}.`, `ప్రతి వరుస, నిలువు, కర్ణం మొత్తం ${r.total} అయ్యేలా సంఖ్యలను ఉంచండి.`),
  hints: (r: LogicRound, p) => {
    if (r.kind === 'magic') {
      const center = r.solution[4];
      return [
        L(`Each line must add up to ${r.total}. Look for a line with only one empty square.`, `ఒకే ఖాళీ ఉన్న వరుస కోసం చూడండి.`),
        L(`The middle square is always the middle number: ${center}.`, `మధ్య గడిలో ఎప్పుడూ మధ్య సంఖ్య: ${center}.`),
      ];
    }
    const hs: L[] = [L('Look for a row, column or box that is missing only one number.', 'ఒకే సంఖ్య లేని వరుస లేదా పెట్టె కోసం చూడండి.')];
    const empties = (p.grid as number[]).map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const single = empties.find((i) => candidates(p.grid, i, r.n, r.br, r.bc).length === 1);
    const i = single ?? empties[0];
    if (i !== undefined) {
      const rr = Math.floor(i / r.n) + 1, cc = (i % r.n) + 1;
      hs.push(single !== undefined
        ? L(`Row ${rr}, column ${cc} can only be ${r.solution[i]} — every other number is already used nearby.`, `వరుస ${rr}, నిలువు ${cc}లో ${r.solution[i]} మాత్రమే రాగలదు.`)
        : L(`Row ${rr}, column ${cc} is ${r.solution[i]}.`, `వరుస ${rr}, నిలువు ${cc} = ${r.solution[i]}.`));
    }
    return hs;
  },
  view: (r: LogicRound, p) => {
    const n = r.kind === 'sudoku' ? r.n : 3;
    const conflicts = r.kind === 'sudoku' && p.shown.length ? sudokuConflicts(p.grid, n, r.br, r.bc) : [];
    const sum = (l: number[]) => l.reduce((s, i) => s + p.grid[i], 0);
    const sums = r.kind === 'magic' ? MAGIC_LINES.map((l) => { const full = l.every((i) => p.grid[i]); return { sum: sum(l), full, ok: full && sum(l) === r.total }; }) : [];
    return { n, br: r.kind === 'sudoku' ? r.br : 3, bc: r.kind === 'sudoku' ? r.bc : 3, conflicts, sums, palette: r.kind === 'sudoku' ? Array.from({ length: n }, (_, k) => k + 1) : r.numbers };
  },
  act(r: LogicRound, p, a, solved) {
    const n = r.kind === 'sudoku' ? r.n : 3;
    const isGiven = (i: number) => !!r.givens[i];
    if (a.type === 'sel') return out({ ...p, sel: clampN(a.i, 0, n * n - 1) });
    if (solved) return out(p);
    const setCell = (i: number, v: number) => {
      if (isGiven(i)) return p;
      const grid = (p.grid as number[]).slice();
      if (r.kind === 'magic' && v) { const j = grid.indexOf(v); if (j >= 0 && !isGiven(j)) grid[j] = 0; }
      grid[i] = v;
      return { ...p, grid, shown: [] };
    };
    if (a.type === 'set') return out(setCell(p.sel, a.v), a.v ? { say: L(String(a.v)) } : {});
    if (a.type === 'erase') return out(setCell(p.sel, 0));
    if (a.type === 'check') {
      if ((p.grid as number[]).some((v) => !v)) return out(p, { notice: L('Fill every empty square first.', 'ముందు అన్ని ఖాళీ గడులను నింపండి.') });
      if (r.kind === 'sudoku') {
        if (isSudokuSolved(p.grid, r)) return out(p, { complete: L('Solved! Every row, column and box has each number once.', 'పూర్తయింది! ప్రతి వరుస, నిలువు, పెట్టెలో ప్రతి సంఖ్య ఒక్కసారే.') });
        return out({ ...p, shown: sudokuConflicts(p.grid, n, r.br, r.bc) }, { mistake: L('Some numbers repeat in a row, column or box — they are marked with !', 'కొన్ని సంఖ్యలు మళ్ళీ వచ్చాయి — ! తో గుర్తించాము.') });
      }
      if (isMagicSolved(p.grid, r)) return out(p, { complete: L(`Magic! Every line adds up to ${r.total}.`, `మాయ! ప్రతి వరుస మొత్తం ${r.total}.`) });
      return out({ ...p, shown: [1] }, { mistake: L(`Not every line adds up to ${r.total} yet — check the sums at the edges.`, `అన్ని వరుసల మొత్తం ఇంకా ${r.total} కాలేదు.`) });
    }
    return out(p);
  },
};

// ---------- balance (views/Balance.tsx) ----------
const balance: Def = {
  init: (r: BalanceRound) => ({ eq: r.start, history: [] }),
  instructions: (r: BalanceRound) => L(`Find x. The scale must stay balanced, so whatever you do to one side you must do to the other. Get x alone on one side of ${formatEq(r.start)}.`),
  hints: (r: BalanceRound, p) => {
    const s = nextStep(p.eq);
    const h = [L(r.start.a !== 0 && r.start.c !== 0 ? 'First collect all the x terms on one side (subtract the smaller x term from both sides).' : 'Undo the + or − first, then the multiplying.')];
    if (s) h.push(L(`Next step: ${formatOp(s)} on both sides.`));
    return h;
  },
  view: (r: BalanceRound, p) => {
    const eq: Eq = p.eq;
    const s = nextStep(eq);
    const hist = p.history as { eq: Eq; op: BalanceOp }[];
    return {
      eqText: formatEq(eq), left: formatSide(eq.a, eq.b), right: formatSide(eq.c, eq.d), startText: formatEq(r.start),
      suggestion: s, suggestionText: s ? `Try: ${formatOp(s)} on both sides` : null,
      steps: hist.map((h, i) => ({ op: `${formatOp(h.op)} on both sides`, eq: formatEq(i + 1 < hist.length ? hist[i + 1].eq : eq) })),
    };
  },
  act(r: BalanceRound, p, a, solved) {
    if (solved) return out(p);
    if (a.type === 'undo') {
      if (!p.history.length) return out(p);
      return out({ eq: p.history[p.history.length - 1].eq, history: p.history.slice(0, -1) });
    }
    if (a.type !== 'apply') return out(p);
    const op: BalanceOp = a.op;
    if (!Number.isInteger(op.value) || op.value <= 0) return out(p, { notice: L('Choose a whole number greater than 0.') });
    const res = applyOp(p.eq, op);
    if (!res.ok) {
      return out(p, { notice: res.reason === 'fraction' ? L(`Dividing by ${op.value} would make fractions here. Try a different step first.`)
        : res.reason === 'x-mul' ? L('Multiply or divide by a number, not by x.') : L('You cannot divide by 0.') });
    }
    const history = [...p.history, { eq: p.eq, op }];
    const progress = { eq: res.eq, history };
    if (isSolvedEq(res.eq)) {
      const extra = history.length - r.optimal;
      return out(progress, {
        complete: extra <= 1
          ? L(`Solved: x = ${solvedValue(res.eq)} in ${history.length} step${history.length === 1 ? '' : 's'}. Check: put ${solvedValue(res.eq)} back into ${formatEq(r.start)} — both sides match.`)
          : L(`x = ${solvedValue(res.eq)}. You got there! It can be done in ${r.optimal} steps — try a shorter path next time.`),
        perfect: extra <= 1,
      });
    }
    return out(progress);
  },
};

// ---------- circuits & physics (views/Circuits.tsx) ----------
const reasonText = (reason: string | undefined, unit: string) =>
  reason === 'missing-unit' ? `Add the unit (${unitLabel(unit)}).` : reason === 'wrong-unit' ? `That unit does not measure the right thing — the answer is in ${unitLabel(unit)} (or an equivalent unit).` : reason === 'unparsable' ? 'Type a number and a unit, like 4.5 N.' : 'The number is not right yet.';
const forceLabel = (id: string) => {
  if (id === 'L') return '← Moves left'; if (id === 'R') return 'Moves right →'; if (id === 'none') return 'Stays still (balanced)';
  const [n, d] = id.split(':'); return d === 'none' ? '0 N (balanced)' : `${n} N to the ${d === 'L' ? 'left' : 'right'}`;
};
const PROMPTS: Record<NumericRound['template'], (n: NumericRound) => string> = {
  'ohm-I': (n) => `A ${n.givens.V.value} V battery is connected across a ${n.givens.R.value} ${n.givens.R.unit} resistor. What current flows? Answer in ${unitLabel(n.unit)}.`,
  'ohm-V': (n) => `A current of ${n.givens.I.value} A flows through a ${n.givens.R.value} Ω resistor. What is the voltage across it?`,
  'ohm-R': (n) => `A ${n.givens.V.value} V supply drives ${n.givens.I.value} mA through a resistor. What is its resistance?`,
  power: (n) => `A heater runs on ${n.givens.V.value} V and draws ${n.givens.I.value} A. What is its power?`,
  series: (n) => `Three resistors of ${n.givens.R1.value} Ω, ${n.givens.R2.value} Ω and ${n.givens.R3.value} Ω are joined in series. What is the total resistance?`,
  speed: (n) => `A train covers ${n.givens.d.value} km in ${n.givens.t.value} min. What is its average speed in ${unitLabel(n.unit)}?`,
  fma: (n) => `A net force of ${n.givens.F.value} N acts on a ${n.givens.m.value} ${n.givens.m.unit} trolley. What is its acceleration?`,
};
const circuits: Def = {
  init: () => ({ closed: [], choice: null, text: '' }),
  instructions: (r: CircuitsRound) => L(
    r.kind === 'circuit' ? 'Tap switches to open or close them. Current flows only around a complete loop from the battery and back. Then press Check.'
      : r.kind === 'force' ? 'Forces push the box left and right. Combine them to find the net force.'
        : r.kind === 'mirror' ? (r.ask === 'choice' ? 'Aim the mirror so the laser bounces into the target. The angle in equals the angle out.' : 'Use the law of reflection to find the angle.')
          : 'Solve the problem. Write the number and its unit — equivalent units (like mA instead of A) are accepted.',
  ),
  hints: (r: CircuitsRound) => {
    if (r.kind === 'circuit') return [L('A bulb lights only if there is a closed path from + through the bulb back to −.'), L(`Close ${r.solution.join(', ')}; keep the others open.`)];
    if (r.kind === 'force') return [L('Forces in the same direction add; opposite forces subtract.'), ...(r.ask === 'accel' ? [L('Change grams to kilograms first (1000 g = 1 kg), then a = F ÷ m.')] : [L(`Right total: ${r.forces.filter((f) => f.dir === 'R').reduce((s, f) => s + f.n, 0)} N; left total: ${r.forces.filter((f) => f.dir === 'L').reduce((s, f) => s + f.n, 0)} N.`)])];
    if (r.kind === 'mirror') return r.ask === 'choice' ? [L('The mirror must sit exactly halfway between the incoming ray and the way you want it to go.'), L(`The target is at ${r.target}°. Halfway between 0° and ${r.target}° is ${r.target / 2}°.`)] : [L('The normal is at 90° to the mirror. Angle to the normal = 90° − angle to the surface.')];
    return [L(`Use ${r.formula}.`), L('Convert to base units first: kΩ → Ω (×1000), mA → A (÷1000), g → kg (÷1000), min → s (×60), km → m (×1000).')];
  },
  view: (r: CircuitsRound, p) => {
    if (r.kind === 'circuit') {
      const sim = simulate(r, new Set(p.closed));
      return { lit: [...sim.lit], short: sim.short, question: `Light ${r.targetOn.join(' and ')}${r.mustOff.length ? `, but keep ${r.mustOff.join(', ')} off` : ''}.` };
    }
    if (r.kind === 'force') {
      const ans = forceAnswer(r);
      return {
        answer: ans, net: netForce(r.forces), optionLabels: Object.fromEntries((r.options ?? []).map((o) => [o, forceLabel(o)])),
        box: r.mass ? `${r.mass.value} ${r.mass.unit}` : 'box',
        question: r.ask === 'direction' ? 'Which way will the box move?' : r.ask === 'netChoice' ? 'What is the net force on the box?' : r.ask === 'net' ? 'What is the size of the net force? Include the unit.' : `The box has mass ${r.mass!.value} ${r.mass!.unit}. What is its acceleration? (a = F ÷ m, use kg)`,
        inputLabel: `Your answer (with unit, e.g. "12 ${unitLabel(ans.unit ?? '')}")`,
      };
    }
    if (r.kind === 'mirror') {
      const ans = mirrorAnswer(r);
      const picked = p.choice === null ? null : +p.choice;
      return {
        answer: ans, picked, out: picked === null ? null : reflectDir(r.inDir, picked),
        question: r.ask === 'choice' ? 'Which mirror angle sends the laser to the target?' : `A light ray hits a flat mirror making an angle of ${r.grazing}° with the mirror surface. What is the angle of reflection (measured from the normal)?`,
        inputLabel: 'Your answer ',
      };
    }
    return {
      question: PROMPTS[r.template](r), givens: Object.entries(r.givens).map(([k, q]) => ({ k, text: `${q.value} ${unitLabel(q.unit)}` })),
      inputLabel: `Your answer (with unit, e.g. "12 ${unitLabel(r.unit)}")`,
    };
  },
  act(r: CircuitsRound, p, a, solved) {
    if (solved) return out(p);
    if (a.type === 'text') return out({ ...p, text: String(a.text ?? '') });
    if (r.kind === 'circuit') {
      const cr = r as CircuitRound;
      if (a.type === 'toggle') {
        const next = new Set<string>(p.closed);
        if (next.has(a.id)) next.delete(a.id); else next.add(a.id);
        return out({ ...p, closed: [...next] });
      }
      if (a.type === 'check') {
        const closed = new Set<string>(p.closed);
        const sim = simulate(cr, closed);
        if (circuitGoalMet(cr, closed)) return out(p, { complete: L(`The circuit works! Current flows through ${cr.targetOn.join(' and ')}.`) });
        if (sim.short) return out(p, { mistake: L('Short circuit! A path with no bulb lets the current skip the bulbs — nothing lights. Open that switch.') });
        const dark = cr.targetOn.filter((b) => !sim.lit.has(b));
        const wrongOn = cr.mustOff.filter((b) => sim.lit.has(b));
        return out(p, { mistake: L(dark.length ? `${dark.join(', ')} ${dark.length > 1 ? 'are' : 'is'} still off — is there a complete loop through ${dark.length > 1 ? 'them' : 'it'}?` : `${wrongOn.join(', ')} should stay off.`) });
      }
      return out(p);
    }
    if (r.kind === 'force') {
      const fr = r as ForceRound;
      const ans = forceAnswer(fr);
      const net = netForce(fr.forces);
      if (a.type === 'choose') {
        const progress = { ...p, choice: a.id };
        if (a.id === ans.choice) return out(progress, { complete: L(`Right! Net force = ${Math.abs(net)} N ${net > 0 ? 'to the right' : net < 0 ? 'to the left' : '(balanced)'}.`) });
        return out(progress, { mistake: L('Not quite. Add the forces on each side, then subtract the smaller total from the larger.') });
      }
      if (a.type === 'submit') {
        const t = String(a.text ?? p.text);
        if (!t.trim()) return out(p);
        const g = grade({ kind: 'number', value: ans.value!, unit: ans.unit!, requireUnit: true, relTolerance: 0.01 }, { kind: 'text', value: t });
        if (g.correct) return out({ ...p, text: t }, { complete: L(fr.ask === 'net' ? `Correct: net force = ${ans.value} N ${net > 0 ? 'to the right' : 'to the left'}.` : `Correct: a = F ÷ m = ${+ans.value!.toFixed(3)} m/s².`) });
        return out({ ...p, text: t }, { mistake: L(reasonText(g.reason, ans.unit!)) });
      }
      return out(p);
    }
    if (r.kind === 'mirror') {
      const mr = r as MirrorRound;
      const ans = mirrorAnswer(mr);
      if (a.type === 'chooseMirror') {
        const m = a.m as number;
        const progress = { ...p, choice: String(m) };
        if (m === ans) return out(progress, { complete: L(`Bullseye! A mirror at ${m}° turns the ray to the target.`) });
        return out(progress, { mistake: L(`The ray went off to ${reflectDir(mr.inDir, m)}° instead. Angle in = angle out — try another mirror.`) });
      }
      if (a.type === 'submit') {
        const t = String(a.text ?? p.text);
        if (!t.trim()) return out(p);
        const g = grade({ kind: 'number', value: ans, unit: '°', tolerance: 0.5 }, { kind: 'text', value: t });
        if (g.correct) return out({ ...p, text: t }, { complete: L(`Correct: the ray makes ${mr.grazing}° with the mirror, so ${ans}° with the normal — angle of reflection = angle of incidence = ${ans}°.`) });
        return out({ ...p, text: t }, { mistake: L(g.reason === 'wrong-unit' ? 'Give the answer in degrees (°).' : 'Remember: angles of incidence and reflection are measured from the normal (the line at 90° to the mirror).') });
      }
      return out(p);
    }
    const nr = r as NumericRound;
    if (a.type === 'submit') {
      const t = String(a.text ?? p.text);
      if (!t.trim()) return out(p);
      const g = grade({ kind: 'number', value: nr.value, unit: nr.unit, requireUnit: true, relTolerance: 0.01 }, { kind: 'text', value: t });
      if (g.correct) return out({ ...p, text: t }, { complete: L(`Correct: ${nr.formula} gives ${nr.value} ${unitLabel(nr.unit)}.`) });
      return out({ ...p, text: t }, { mistake: L(reasonText(g.reason, nr.unit)) });
    }
    return out(p);
  },
};

const DEFS: Record<GameId, Def> = { counting, shapes, patterns, numberline, fractions, logic, balance, circuits };

/** Everything the screen needs for a round + progress (instructions, hints and display data). */
export function describe(id: GameId, round: Any, progress: Any) {
  const d = DEFS[id];
  return { instructions: d.instructions(round), hints: d.hints(round, progress), view: d.view(round, progress) };
}
/** Starts a round: generated by the website's generator, with its initial progress. */
export function start(id: GameId, seed: number, level: number) {
  const round = generate(id, seed, level);
  const progress = DEFS[id].init(round);
  return { round, progress, ...describe(id, round, progress) };
}
export const init = (id: GameId, round: Any) => DEFS[id].init(round);
/** Applies one learner action; returns the new progress, the effects (mistake / complete / notice / say) and fresh hints + view. */
export function act(id: GameId, round: Any, progress: Any, action: Any, solved = false) {
  const r = DEFS[id].act(round, progress, action ?? {}, !!solved);
  return { ...r, hints: DEFS[id].hints(round, r.progress), view: DEFS[id].view(round, r.progress) };
}
