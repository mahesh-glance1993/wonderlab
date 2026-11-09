// Bounded scanline flood fill on an RGBA buffer (pure; works on ImageData.data or any array).
// The colour layer is filled; the outline (template) layer only provides a boundary mask,
// dilated by 1px so fills cannot leak through tiny gaps in the line art.
export type Pixels = Uint8ClampedArray | Uint8Array;

/** 1 where the outline has ink (alpha above threshold). */
export function outlineMask(rgba: Pixels, w: number, h: number, alphaThreshold = 80): Uint8Array {
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (rgba[i * 4 + 3] > alphaThreshold) m[i] = 1;
  return m;
}

/** Square (Chebyshev) dilation by r pixels — separable, O(w·h·r). */
export function dilate(mask: Uint8Array, w: number, h: number, r = 1): Uint8Array {
  if (r <= 0) return mask.slice();
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (!mask[row + x]) continue;
      const a = Math.max(0, x - r), b = Math.min(w - 1, x + r);
      for (let k = a; k <= b; k++) tmp[row + k] = 1;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (!tmp[y * w + x]) continue;
      const a = Math.max(0, y - r), b = Math.min(h - 1, y + r);
      for (let k = a; k <= b; k++) out[k * w + x] = 1;
    }
  }
  return out;
}

export interface FillOptions {
  /** max per-channel difference (0..255) from the seed colour that still counts as "same region" */
  tolerance?: number;
  /** pixels that block the fill (e.g. the dilated outline mask) */
  boundary?: Uint8Array;
  /** after filling, also colour boundary pixels within this distance of the region (tucks colour under the line) */
  bleed?: number;
}

/**
 * Fills the region connected to (sx, sy) with `color` (straight RGBA). Returns the filled mask
 * and pixel count. Never crosses boundary pixels; does nothing when seeded on a boundary.
 */
export function floodFill(pix: Pixels, w: number, h: number, sx: number, sy: number, color: [number, number, number, number], opts: FillOptions = {}): { count: number; mask: Uint8Array } {
  const mask = new Uint8Array(w * h);
  sx = Math.floor(sx); sy = Math.floor(sy);
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return { count: 0, mask };
  const B = opts.boundary, tol = opts.tolerance ?? 32;
  const si = sy * w + sx;
  if (B && B[si]) return { count: 0, mask };
  const s0 = pix[si * 4], s1 = pix[si * 4 + 1], s2 = pix[si * 4 + 2], s3 = pix[si * 4 + 3];
  const ok = (i: number) => {
    if (mask[i] || (B && B[i])) return false;
    const p = i * 4;
    // fully transparent pixels match each other regardless of stored RGB
    if (s3 === 0 && pix[p + 3] === 0) return true;
    return Math.abs(pix[p] - s0) <= tol && Math.abs(pix[p + 1] - s1) <= tol && Math.abs(pix[p + 2] - s2) <= tol && Math.abs(pix[p + 3] - s3) <= tol;
  };
  let count = 0;
  const stack: number[] = [sx, sy];
  while (stack.length) {
    const y = stack.pop()!, x0 = stack.pop()!;
    const row = y * w;
    if (!ok(row + x0)) continue;
    let l = x0, r = x0;
    while (l > 0 && ok(row + l - 1)) l--;
    while (r < w - 1 && ok(row + r + 1)) r++;
    for (let x = l; x <= r; x++) { mask[row + x] = 1; count++; }
    for (const ny of [y - 1, y + 1]) {
      if (ny < 0 || ny >= h) continue;
      const nrow = ny * w;
      let inRun = false;
      for (let x = l; x <= r; x++) {
        const good = ok(nrow + x);
        if (good && !inRun) { stack.push(x, ny); inRun = true; }
        else if (!good) inRun = false;
      }
    }
  }
  if (!count) return { count, mask };
  let paint = mask;
  if (B && opts.bleed && opts.bleed > 0) {
    const grown = dilate(mask, w, h, opts.bleed);
    paint = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) paint[i] = mask[i] || (grown[i] && B[i]) ? 1 : 0;
  }
  const [r, g, b, a] = color;
  for (let i = 0; i < w * h; i++) {
    if (!paint[i]) continue;
    const p = i * 4;
    pix[p] = r; pix[p + 1] = g; pix[p + 2] = b; pix[p + 3] = a;
  }
  return { count, mask };
}
