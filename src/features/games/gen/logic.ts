// Logic grids: mini-sudoku (4×4, 6×6, 9×9) and 3×3 magic squares.
// Generators remove clues only while a solver confirms the solution stays unique.
import { rng, clamp, type Rng } from './common';

export interface SudokuRound { game: 'logic'; kind: 'sudoku'; level: number; n: number; br: number; bc: number; givens: number[]; solution: number[] }
export interface MagicRound { game: 'logic'; kind: 'magic'; level: number; givens: number[]; solution: number[]; numbers: number[]; total: number }
export type LogicRound = SudokuRound | MagicRound;

// ---------------- sudoku ----------------

/** Counts solutions of a partially filled grid (0 = empty), stopping at `limit`. */
export function countSudokuSolutions(grid: number[], n: number, br: number, bc: number, limit = 2, out?: number[]): number {
  const g = grid.slice();
  const full = (1 << n) - 1;
  const rows = new Array(n).fill(0), cols = new Array(n).fill(0), boxes = new Array(n).fill(0);
  const box = (r: number, c: number) => Math.floor(r / br) * (n / bc) + Math.floor(c / bc);
  for (let i = 0; i < n * n; i++) {
    const v = g[i];
    if (!v) continue;
    const r = Math.floor(i / n), c = i % n, b = 1 << (v - 1);
    if (rows[r] & b || cols[c] & b || boxes[box(r, c)] & b) return 0; // givens conflict
    rows[r] |= b; cols[c] |= b; boxes[box(r, c)] |= b;
  }
  let count = 0;
  const solve = (): void => {
    // most-constrained empty cell
    let best = -1, bestMask = 0, bestCount = 99;
    for (let i = 0; i < n * n; i++) {
      if (g[i]) continue;
      const r = Math.floor(i / n), c = i % n;
      const mask = full & ~(rows[r] | cols[c] | boxes[box(r, c)]);
      let k = 0; for (let m = mask; m; m &= m - 1) k++;
      if (k < bestCount) { best = i; bestMask = mask; bestCount = k; if (k <= 1) break; }
    }
    if (best < 0) { count++; if (out && count === 1) out.splice(0, out.length, ...g); return; }
    if (bestCount === 0) return;
    const r = Math.floor(best / n), c = best % n, bx = box(r, c);
    for (let m = bestMask; m && count < limit; m &= m - 1) {
      const b = m & -m;
      const v = 31 - Math.clz32(b) + 1;
      g[best] = v; rows[r] |= b; cols[c] |= b; boxes[bx] |= b;
      solve();
      g[best] = 0; rows[r] &= ~b; cols[c] &= ~b; boxes[bx] &= ~b;
    }
  };
  solve();
  return count;
}

/** Problems in a (possibly partial) grid: duplicate digits in a row/column/box. */
export function sudokuConflicts(grid: number[], n: number, br: number, bc: number): number[] {
  const bad = new Set<number>();
  const units: number[][] = [];
  for (let r = 0; r < n; r++) units.push(Array.from({ length: n }, (_, c) => r * n + c));
  for (let c = 0; c < n; c++) units.push(Array.from({ length: n }, (_, r) => r * n + c));
  for (let b = 0; b < n; b++) {
    const r0 = Math.floor(b / (n / bc)) * br, c0 = (b % (n / bc)) * bc;
    const u: number[] = [];
    for (let r = 0; r < br; r++) for (let c = 0; c < bc; c++) u.push((r0 + r) * n + c0 + c);
    units.push(u);
  }
  for (const u of units) {
    const seen = new Map<number, number>();
    for (const i of u) { const v = grid[i]; if (!v) continue; if (seen.has(v)) { bad.add(i); bad.add(seen.get(v)!); } else seen.set(v, i); }
  }
  return [...bad].sort((a, b) => a - b);
}
export function isSudokuSolved(grid: number[], round: SudokuRound): boolean {
  const { n, br, bc } = round;
  if (grid.length !== n * n || grid.some((v) => !(v >= 1 && v <= n))) return false;
  if (round.givens.some((v, i) => v && grid[i] !== v)) return false;
  return sudokuConflicts(grid, n, br, bc).length === 0;
}

function fullSudoku(r: Rng, n: number, br: number, bc: number): number[] {
  // pattern solution, then symmetry-preserving shuffles
  const bands = n / br, stacks = n / bc;
  const rowOrder = r.shuffle([...Array(bands).keys()]).flatMap((b) => r.shuffle([...Array(br).keys()]).map((x) => b * br + x));
  const colOrder = r.shuffle([...Array(stacks).keys()]).flatMap((s) => r.shuffle([...Array(bc).keys()]).map((x) => s * bc + x));
  const relabel = r.shuffle([...Array(n).keys()].map((x) => x + 1));
  const g: number[] = [];
  for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
    const R = rowOrder[row], C = colOrder[col];
    g.push(relabel[(bc * (R % br) + Math.floor(R / br) + C) % n]);
  }
  return g;
}

const SUDOKU_LEVELS = [
  { n: 4, br: 2, bc: 2, givens: 10 },
  { n: 4, br: 2, bc: 2, givens: 6 },
  { n: 6, br: 2, bc: 3, givens: 22 },
  { n: 6, br: 2, bc: 3, givens: 15 },
  { n: 9, br: 3, bc: 3, givens: 36 },
];

export function generateSudoku(seed: number, level: number): SudokuRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const { n, br, bc, givens: target } = SUDOKU_LEVELS[lv];
  const solution = fullSudoku(r, n, br, bc);
  const g = solution.slice();
  let filled = n * n;
  for (const i of r.shuffle([...Array(n * n).keys()])) {
    if (filled <= target) break;
    const keep = g[i];
    g[i] = 0;
    if (countSudokuSolutions(g, n, br, bc, 2) !== 1) g[i] = keep; else filled--;
  }
  return { game: 'logic', kind: 'sudoku', level: lv, n, br, bc, givens: g, solution };
}

// ---------------- magic squares ----------------

const LO_SHU = [2, 7, 6, 9, 5, 1, 4, 3, 8];
const rot = (g: number[]) => [g[6], g[3], g[0], g[7], g[4], g[1], g[8], g[5], g[2]];
const flip = (g: number[]) => [g[2], g[1], g[0], g[5], g[4], g[3], g[8], g[7], g[6]];
export const MAGIC_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export function isMagic(grid: number[], total: number): boolean {
  return grid.every((v) => v > 0) && MAGIC_LINES.every((l) => l.reduce((s, i) => s + grid[i], 0) === total);
}
function permutations<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a.slice()];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
/** Number of ways to fill the blanks with the unused numbers so that every line sums to total. */
export function countMagicSolutions(givens: number[], numbers: number[], total: number): number {
  const blanks = givens.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const missing = numbers.filter((x) => !givens.includes(x));
  if (missing.length !== blanks.length) return 0;
  let c = 0;
  for (const p of permutations(missing)) {
    const g = givens.slice();
    blanks.forEach((b, k) => (g[b] = p[k]));
    if (isMagic(g, total)) c++;
  }
  return c;
}
export function isMagicSolved(grid: number[], round: MagicRound): boolean {
  if (round.givens.some((v, i) => v && grid[i] !== v)) return false;
  const sorted = [...grid].sort((a, b) => a - b).join(',');
  return sorted === [...round.numbers].sort((a, b) => a - b).join(',') && isMagic(grid, round.total);
}

export function generateMagic(seed: number, level: number): MagicRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  let g = LO_SHU.slice();
  for (let k = r.int(0, 3); k > 0; k--) g = rot(g);
  if (r.next() < 0.5) g = flip(g);
  const offset = lv <= 2 ? 0 : lv === 3 ? r.int(1, 10) : r.int(5, 40);
  const solution = g.map((x) => x + offset);
  const numbers = solution.slice().sort((a, b) => a - b);
  const total = 15 + 3 * offset;
  const blanksWanted = [3, 4, 4, 5, 6][lv];
  const givens = solution.slice();
  let blanks = 0;
  for (const i of r.shuffle([...Array(9).keys()])) {
    if (blanks >= blanksWanted) break;
    const keep = givens[i];
    givens[i] = 0;
    if (countMagicSolutions(givens, numbers, total) !== 1) givens[i] = keep; else blanks++;
  }
  return { game: 'logic', kind: 'magic', level: lv, givens, solution, numbers, total };
}

/** Levels 0–1: 4×4 sudoku; levels 2–4 alternate sudoku and magic squares. */
export function generateLogic(seed: number, level: number): LogicRound {
  const lv = clamp(level, 0, 4);
  const magic = lv >= 2 && rng(seed ^ 0x5bd1e995).next() < 0.35;
  return magic ? generateMagic(seed, lv) : generateSudoku(seed, lv);
}

export function validateLogic(round: LogicRound): string[] {
  const e: string[] = [];
  if (round.kind === 'sudoku') {
    const { n, br, bc } = round;
    if (!isSudokuSolved(round.solution, round)) e.push('solution invalid');
    if (round.givens.some((v, i) => v && v !== round.solution[i])) e.push('givens disagree with solution');
    const sol: number[] = [];
    const c = countSudokuSolutions(round.givens, n, br, bc, 2, sol);
    if (c !== 1) e.push(`puzzle has ${c} solutions`);
    else if (sol.join() !== round.solution.join()) e.push('solver found a different solution');
    if (round.givens.every((v) => v)) e.push('nothing to solve');
  } else {
    if (!isMagic(round.solution, round.total)) e.push('solution not magic');
    if (round.givens.some((v, i) => v && v !== round.solution[i])) e.push('givens disagree');
    const c = countMagicSolutions(round.givens, round.numbers, round.total);
    if (c !== 1) e.push(`magic square has ${c} solutions`);
    if (new Set(round.solution).size !== 9) e.push('repeated numbers');
  }
  return e;
}
