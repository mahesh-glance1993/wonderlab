// Procedural paper textures (pure). Each paper is a tileable 256×256 "height" map (0 = valley,
// 1 = peak). Crayons and pencils deposit pigment on the peaks, so the grain shows through.
import { mulberry32 } from './rng';
import type { PaperId } from './project';

export const GRAIN = 256;
export const PAPER_COLORS: Record<PaperId, string> = { smooth: '#ffffff', sketch: '#fcfbf7', watercolor: '#fbf8f0', canvas: '#f6f2e8', kraft: '#c8a679' };

/** Tileable value noise with `cells` lattice cells across the tile. */
function valueNoise(cells: number, seed: number): Float32Array {
  const rnd = mulberry32(seed);
  const lat = new Float32Array(cells * cells).map(() => rnd());
  const out = new Float32Array(GRAIN * GRAIN);
  const s = GRAIN / cells;
  const fade = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < GRAIN; y++) {
    const gy = y / s, y0 = Math.floor(gy), ty = fade(gy - y0), y1 = (y0 + 1) % cells;
    for (let x = 0; x < GRAIN; x++) {
      const gx = x / s, x0 = Math.floor(gx), tx = fade(gx - x0), x1 = (x0 + 1) % cells;
      const a = lat[y0 * cells + x0], b = lat[y0 * cells + x1], c = lat[y1 * cells + x0], d = lat[y1 * cells + x1];
      out[y * GRAIN + x] = (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
    }
  }
  return out;
}

const cache = new Map<PaperId, Float32Array>();
export function grainTile(kind: PaperId): Float32Array {
  const hit = cache.get(kind);
  if (hit) return hit;
  const g = new Float32Array(GRAIN * GRAIN);
  const add = (n: Float32Array, w: number) => { for (let i = 0; i < g.length; i++) g[i] += n[i] * w; };
  switch (kind) {
    case 'smooth': add(valueNoise(128, 11), 0.7); add(valueNoise(64, 12), 0.3); break;
    case 'sketch': add(valueNoise(128, 21), 0.55); add(valueNoise(64, 22), 0.3); add(valueNoise(16, 23), 0.15); break;
    case 'watercolor': add(valueNoise(32, 31), 0.45); add(valueNoise(64, 32), 0.3); add(valueNoise(128, 33), 0.25); break;
    case 'canvas': {
      const n = valueNoise(128, 41);
      for (let y = 0; y < GRAIN; y++) for (let x = 0; x < GRAIN; x++) {
        const weave = (Math.sin((x * Math.PI * 2) / 8) * Math.sin((y * Math.PI * 2) / 8) + 1) / 2;
        g[y * GRAIN + x] = weave * 0.65 + n[y * GRAIN + x] * 0.35;
      }
      break;
    }
    case 'kraft': {
      const n = valueNoise(64, 51), f = valueNoise(16, 52);
      for (let y = 0; y < GRAIN; y++) for (let x = 0; x < GRAIN; x++) {
        const fibre = (Math.sin(x * 0.9 + f[y * GRAIN + x] * 14) + 1) / 2; // horizontal-ish fibres
        g[y * GRAIN + x] = n[y * GRAIN + x] * 0.6 + fibre * 0.4;
      }
      break;
    }
  }
  // normalise to 0..1
  let lo = Infinity, hi = -Infinity;
  for (const v of g) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  for (let i = 0; i < g.length; i++) g[i] = (g[i] - lo) / (hi - lo || 1);
  cache.set(kind, g);
  return g;
}

/** Alpha (0..255) a grainy medium leaves at a pixel of height g for a given coverage 0..1. */
export function grainAlpha(g: number, coverage: number, softness: number): number {
  const edge = 1 - coverage; // peaks above this receive pigment
  const a = (g - edge + softness) / (softness * 2);
  return Math.round(Math.min(1, Math.max(0, a)) * 255);
}
