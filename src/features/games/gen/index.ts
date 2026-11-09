// Registry of the pure, seeded generators (one per game) plus the daily-puzzle picker.
import type { GameId } from '../catalog';
import { GAMES, fitsClass } from '../catalog';
import { hashStr, levelFor, rng } from './common';
import { parseRational } from '../../../shared/grading';
import { generateCounting, validateCounting, type CountingRound } from './counting';
import { generateShapes, validateShapes, type ShapesRound } from './shapes';
import { generatePatterns, validatePatterns, type PatternsRound } from './patterns';
import { generateNumberLine, validateNumberLine, type NumberLineRound } from './numberline';
import { generateFractions, validateFractions, type FractionsRound } from './fractions';
import { generateLogic, validateLogic, type LogicRound } from './logic';
import { generateBalance, validateBalance, type BalanceRound } from './balance';
import { generateCircuits, validateCircuits, type CircuitsRound } from './circuits';

export type AnyRound = CountingRound | ShapesRound | PatternsRound | NumberLineRound | FractionsRound | LogicRound | BalanceRound | CircuitsRound;

export const GENERATORS = {
  counting: { generate: generateCounting, validate: validateCounting },
  shapes: { generate: generateShapes, validate: validateShapes },
  patterns: { generate: generatePatterns, validate: validatePatterns },
  numberline: { generate: generateNumberLine, validate: validateNumberLine },
  fractions: { generate: generateFractions, validate: (r: FractionsRound) => validateFractions(r, parseRational) },
  logic: { generate: generateLogic, validate: validateLogic },
  balance: { generate: generateBalance, validate: validateBalance },
  circuits: { generate: generateCircuits, validate: validateCircuits },
} satisfies Record<GameId, { generate: (seed: number, level: number) => unknown; validate: (r: never) => string[] }>;

/** Daily puzzle: same game + seed all day for a learner; changes each day. */
export function dailyPuzzle(date: string, profileId: string, classLevel: number): { gameId: GameId; seed: number; level: number } {
  const seed = hashStr(`${date}|${profileId}`);
  const fits = GAMES.filter((g) => fitsClass(g, classLevel));
  const pool = fits.length ? fits : GAMES;
  const game = rng(seed).pick(pool);
  return { gameId: game.id, seed, level: levelFor(game.classRange, classLevel, 'regular') };
}
