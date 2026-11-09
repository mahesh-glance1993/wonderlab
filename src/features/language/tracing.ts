// Letter tracing: sets + pure mask-based scoring (no DOM, so it is unit-tested).
// The view renders the glyph with the real font onto a small grid; scoring compares the learner's
// ink with that glyph mask: how much of the glyph is covered, and how much ink falls outside a
// dilated (tolerance-widened) glyph.
import type { TraceSet } from './types';
import { CONSONANTS, VOWELS } from './telugu/script';
import { LOWER, UPPER } from './english/course';

export const TRACE_SETS: TraceSet[] = [
  { id: 'te-vowels-1', course: 'telugu', script: 'te', title: 'అచ్చులు: అ – ఊ', titleEn: 'Vowels అ – ఊ', letters: VOWELS.slice(0, 6) },
  { id: 'te-vowels', course: 'telugu', script: 'te', title: 'అచ్చులు', titleEn: 'All vowels', letters: [...VOWELS] },
  { id: 'te-cons-1', course: 'telugu', script: 'te', title: 'హల్లులు: క – న', titleEn: 'Consonants క – న', letters: CONSONANTS.slice(0, 20) },
  { id: 'te-cons-2', course: 'telugu', script: 'te', title: 'హల్లులు: ప – ఱ', titleEn: 'Consonants ప – ఱ', letters: CONSONANTS.slice(20) },
  { id: 'en-upper-1', course: 'english', script: 'en', title: 'Capital letters A – M', letters: UPPER.slice(0, 13) },
  { id: 'en-upper-2', course: 'english', script: 'en', title: 'Capital letters N – Z', letters: UPPER.slice(13) },
  { id: 'en-lower', course: 'english', script: 'en', title: 'Small letters a – z', letters: LOWER },
];

export const TRACE_FONT: Record<'te' | 'en', string> = { te: "'Noto Sans Telugu'", en: "'Andika'" };

export type Tolerance = 'easy' | 'medium' | 'hard';
/** Dilation radius in grid cells (grid is GRID × GRID). */
export const TOLERANCE_RADIUS: Record<Tolerance, number> = { easy: 6, medium: 4, hard: 2 };
export const GRID = 96;

export type Mask = Uint8Array;

/** Square (Chebyshev) dilation, separable: O(w·h·1). */
export function dilate(mask: Mask, w: number, h: number, r: number): Mask {
  if (r <= 0) return mask.slice();
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let count = 0;
    // sliding window over x
    for (let x = -r; x < w; x++) {
      const add = x + r;
      if (add < w && mask[y * w + add]) count++;
      const rem = x - r - 1;
      if (rem >= 0 && mask[y * w + rem]) count--;
      if (x >= 0) tmp[y * w + x] = count > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < w; x++) {
    let count = 0;
    for (let y = -r; y < h; y++) {
      const add = y + r;
      if (add < h && tmp[add * w + x]) count++;
      const rem = y - r - 1;
      if (rem >= 0 && tmp[rem * w + x]) count--;
      if (y >= 0) out[y * w + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

const count = (m: Mask) => { let n = 0; for (let i = 0; i < m.length; i++) n += m[i]; return n; };

export interface TraceResult {
  /** Fraction of glyph cells within the tolerance of some ink. */
  coverage: number;
  /** Fraction of ink cells that fall outside the tolerance-widened glyph. */
  outside: number;
  score: number;
  stars: 0 | 1 | 2 | 3;
  message: string;
}

export function scoreTrace(glyph: Mask, ink: Mask, w: number, h: number, tol: Tolerance = 'medium'): TraceResult {
  const r = TOLERANCE_RADIUS[tol];
  const g = count(glyph), k = count(ink);
  if (!g || !k) return { coverage: 0, outside: 0, score: 0, stars: 0, message: 'Draw over the dotted letter, starting at the green dot.' };
  const inkWide = dilate(ink, w, h, Math.max(1, Math.round(r / 2)));
  const glyphWide = dilate(glyph, w, h, r);
  let covered = 0, out = 0;
  for (let i = 0; i < glyph.length; i++) {
    if (glyph[i] && inkWide[i]) covered++;
    if (ink[i] && !glyphWide[i]) out++;
  }
  const coverage = covered / g;
  const outside = out / k;
  const score = Math.max(0, Math.min(1, coverage - 0.8 * outside));
  const need = tol === 'easy' ? [0.3, 0.5, 0.7] : tol === 'medium' ? [0.35, 0.55, 0.75] : [0.4, 0.62, 0.82];
  const stars = (score >= need[2] ? 3 : score >= need[1] ? 2 : score >= need[0] ? 1 : 0) as 0 | 1 | 2 | 3;
  const message = stars === 3 ? 'Beautiful tracing!'
    : outside > 0.35 ? 'Try to keep your line on the dotted letter.'
      : coverage < 0.6 ? 'Good start! Trace the whole letter — some parts are still empty.'
        : 'Nice! Go over it once more, slowly.';
  return { coverage, outside, score, stars, message };
}

/** Where to put the start dot: for Telugu the leftmost glyph cell (most letters begin on the left);
 *  for English the top-most cell (most letters begin at the top). Heuristic — see docs. */
export function startPoint(glyph: Mask, w: number, h: number, script: 'te' | 'en'): [number, number] | null {
  if (script === 'en') {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (glyph[y * w + x]) return [x, y];
  } else {
    for (let x = 0; x < w; x++) {
      let ys: number[] = [];
      for (let y = 0; y < h; y++) if (glyph[y * w + x]) ys.push(y);
      if (ys.length) { ys = ys.sort((a, b) => a - b); return [x, ys[Math.floor(ys.length / 2)]]; }
    }
  }
  return null;
}
