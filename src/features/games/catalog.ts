// Game catalog: ids, class ranges and learning objectives. Pure data — other modules may import it
// (e.g. lessons linking to `/games/<id>`, recommendations, progress screens).
import type { Variant } from './gen/common';

export type GameId = 'counting' | 'shapes' | 'patterns' | 'numberline' | 'fractions' | 'logic' | 'balance' | 'circuits';

export interface GameInfo {
  id: GameId;
  title: string;
  titleTe: string;
  /** Inclusive class-level range (0 = Nursery, 1 = LKG, 2 = UKG, 3 = Class 1 … 12 = Class 10). */
  classRange: [number, number];
  objectives: string;
  objectivesTe?: string;
  /** Mastery objective id used with recordAttempt. */
  objectiveId: string;
  variants: Variant[];
  icon: string;
  subject: 'math' | 'logic' | 'science';
}

const ALL: Variant[] = ['guided', 'regular', 'challenge'];

export const GAMES: GameInfo[] = [
  {
    id: 'counting', title: 'Counting & Number Match', titleTe: 'లెక్కించడం & సంఖ్యల జత', classRange: [0, 3],
    objectives: 'Count objects one by one, say the total, and match numerals to quantities.',
    objectivesTe: 'వస్తువులను ఒక్కొక్కటిగా లెక్కించి, మొత్తం చెప్పి, సంఖ్యలను జత చేయడం.',
    objectiveId: 'game:counting', variants: ALL, icon: 'star', subject: 'math',
  },
  {
    id: 'shapes', title: 'Shape Sorter', titleTe: 'ఆకారాలు వేరు చేయడం', classRange: [0, 5],
    objectives: 'Recognise shapes and sort them by colour, shape and number of sides.',
    objectivesTe: 'ఆకారాలను గుర్తించి రంగు, ఆకారం, భుజాల సంఖ్య ప్రకారం వేరు చేయడం.',
    objectiveId: 'game:shapes', variants: ALL, icon: 'grid', subject: 'math',
  },
  {
    id: 'patterns', title: 'Pattern Builder', titleTe: 'నమూనాలు పూర్తి చేయడం', classRange: [0, 6],
    objectives: 'Find the rule in AB, ABB and ABC patterns and in growing number patterns.',
    objectivesTe: 'AB, ABB, ABC నమూనాలు మరియు పెరిగే సంఖ్యల నమూనాలలో నియమం కనుగొనడం.',
    objectiveId: 'game:patterns', variants: ALL, icon: 'layers', subject: 'math',
  },
  {
    id: 'numberline', title: 'Number-Line Hops', titleTe: 'సంఖ్యా రేఖ దూకులు', classRange: [3, 9],
    objectives: 'Add and subtract by hopping on a number line; then integers, fractions and decimals.',
    objectivesTe: 'సంఖ్యా రేఖపై దూకుతూ కూడిక, తీసివేత; తర్వాత పూర్ణాంకాలు, భిన్నాలు, దశాంశాలు.',
    objectiveId: 'game:numberline', variants: ALL, icon: 'next', subject: 'math',
  },
  {
    id: 'fractions', title: 'Fraction Match', titleTe: 'భిన్నాల జత', classRange: [5, 10],
    objectives: 'Match equivalent fractions, decimals, percentages and fraction pictures.',
    objectivesTe: 'సమాన భిన్నాలు, దశాంశాలు, శాతాలు మరియు చిత్రాలను జత చేయడం.',
    objectiveId: 'game:fractions', variants: ALL, icon: 'puzzle', subject: 'math',
  },
  {
    id: 'logic', title: 'Logic Grids', titleTe: 'తర్క గడులు', classRange: [4, 12],
    objectives: 'Use reasoning to solve mini-sudoku and magic squares (each puzzle has exactly one solution).',
    objectivesTe: 'తర్కంతో చిన్న సుడోకు, మాయా చతురస్రాలను పరిష్కరించడం.',
    objectiveId: 'game:logic', variants: ALL, icon: 'table', subject: 'logic',
  },
  {
    id: 'balance', title: 'Balance the Scale', titleTe: 'త్రాసు సమతుల్యం', classRange: [7, 12],
    objectives: 'Solve linear equations step by step by doing the same thing to both sides.',
    objectiveId: 'game:balance', variants: ALL, icon: 'scale', subject: 'math',
  },
  {
    id: 'circuits', title: 'Circuits & Forces', titleTe: 'సర్క్యూట్లు & బలాలు', classRange: [6, 12],
    objectives: 'Complete circuits, predict motion from net force, aim mirrors, and solve physics problems with units.',
    objectiveId: 'game:circuits', variants: ALL, icon: 'bulb', subject: 'science',
  },
];

export const gameById = (id: string): GameInfo | undefined => GAMES.find((g) => g.id === id);

const CLASS_LABEL = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const CLASS_LABEL_TE = ['నర్సరీ', 'ఎల్‌కేజీ', 'యూకేజీ', '1వ తరగతి', '2వ తరగతి', '3వ తరగతి', '4వ తరగతి', '5వ తరగతి', '6వ తరగతి', '7వ తరగతి', '8వ తరగతి', '9వ తరగతి', '10వ తరగతి'];
export const classRangeLabel = (g: GameInfo, te = false) => {
  const l = te ? CLASS_LABEL_TE : CLASS_LABEL;
  return `${l[g.classRange[0]]} – ${l[g.classRange[1]]}`;
};
export const fitsClass = (g: GameInfo, classLevel: number) => classLevel >= g.classRange[0] && classLevel <= g.classRange[1];

/** Games for a learner: "great for your class" first, then others by distance from the class range. */
export function gamesForClass(classLevel: number): { game: GameInfo; fits: boolean }[] {
  const dist = (g: GameInfo) => (fitsClass(g, classLevel) ? 0 : classLevel < g.classRange[0] ? g.classRange[0] - classLevel : classLevel - g.classRange[1]);
  return [...GAMES].sort((a, b) => dist(a) - dist(b)).map((game) => ({ game, fits: dist(game) === 0 }));
}

// ---------- private badges ----------
export interface BadgeInfo { id: string; title: string; titleTe: string; icon: string }
export const badgeIds = {
  first: (g: GameId) => `game:${g}:first`,
  five: (g: GameId) => `game:${g}:5`,
  challenge: (g: GameId) => `game:${g}:challenge`,
  dailyFirst: 'game:daily:first',
  dailyStreak3: 'game:daily:streak3',
  dailyStreak7: 'game:daily:streak7',
};
export const BADGES: BadgeInfo[] = [
  ...GAMES.flatMap((g): BadgeInfo[] => [
    { id: badgeIds.first(g.id), title: `${g.title}: first win`, titleTe: `${g.titleTe}: మొదటి విజయం`, icon: 'star' },
    { id: badgeIds.five(g.id), title: `${g.title}: 5 rounds`, titleTe: `${g.titleTe}: 5 ఆటలు`, icon: 'sparkle' },
    { id: badgeIds.challenge(g.id), title: `${g.title}: challenge cleared`, titleTe: `${g.titleTe}: సవాలు పూర్తి`, icon: 'trophy' },
  ]),
  { id: badgeIds.dailyFirst, title: 'Daily puzzle solved', titleTe: 'రోజువారీ పజిల్ పూర్తి', icon: 'sun' },
  { id: badgeIds.dailyStreak3, title: 'Daily puzzle: 3 days in a row', titleTe: 'వరుసగా 3 రోజులు', icon: 'flag' },
  { id: badgeIds.dailyStreak7, title: 'Daily puzzle: 7 days in a row', titleTe: 'వరుసగా 7 రోజులు', icon: 'trophy' },
];
