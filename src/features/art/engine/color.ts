// Colour maths (pure): HSV <-> RGB, hex parsing, mixing, compositing and friendly names.
export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** h 0..360, s and v 0..1 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
export function rgbToHsv([r, g, b]: RGB): [number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  let h = 0;
  if (d) {
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }
  if (h < 0) h += 360;
  return [h, max ? d / max : 0, max];
}
export function parseHex(s: string): RGB | null {
  let t = s.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(t)) t = t.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(t)) return null;
  return [parseInt(t.slice(0, 2), 16), parseInt(t.slice(2, 4), 16), parseInt(t.slice(4, 6), 16)];
}
export const toHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
export const normalizeHex = (s: string) => { const c = parseHex(s); return c ? toHex(c) : null; };
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const shade = (c: RGB, amt: number): RGB => (amt >= 0 ? mix(c, [255, 255, 255], amt) : mix(c, [0, 0, 0], -amt));
export const rgba = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

/** Composite straight-alpha pixels (bottom → top) over an opaque background. */
export function compositeOver(layers: RGBA[], bg: RGB): RGB {
  let out: RGB = [...bg];
  for (const [r, g, b, a] of layers) {
    const A = a / 255;
    out = [out[0] * (1 - A) + r * A, out[1] * (1 - A) + g * A, out[2] * (1 - A) + b * A];
  }
  return [Math.round(out[0]), Math.round(out[1]), Math.round(out[2])];
}

const NAMES: [string, string, string][] = [
  ['#000000', 'black', 'నలుపు'], ['#ffffff', 'white', 'తెలుపు'], ['#808080', 'grey', 'బూడిద'], ['#c0c0c0', 'light grey', 'లేత బూడిద'],
  ['#e53935', 'red', 'ఎరుపు'], ['#8b1e1e', 'dark red', 'ముదురు ఎరుపు'], ['#fb8c00', 'orange', 'నారింజ'], ['#fdd835', 'yellow', 'పసుపు'],
  ['#43a047', 'green', 'ఆకుపచ్చ'], ['#1b5e20', 'dark green', 'ముదురు ఆకుపచ్చ'], ['#9ccc65', 'light green', 'లేత ఆకుపచ్చ'],
  ['#1e88e5', 'blue', 'నీలం'], ['#0d2c6b', 'navy blue', 'ముదురు నీలం'], ['#81d4fa', 'sky blue', 'ఆకాశ నీలం'], ['#26a69a', 'teal', 'నీలి ఆకుపచ్చ'],
  ['#8e24aa', 'purple', 'ఊదా'], ['#ec407a', 'pink', 'గులాబీ'], ['#f8bbd0', 'light pink', 'లేత గులాబీ'], ['#6d4c41', 'brown', 'గోధుమ'],
  ['#d7b98e', 'tan', 'లేత గోధుమ'], ['#ffccbc', 'peach', 'పీచ్'],
];
const NAME_RGB = NAMES.map(([h, en, te]) => ({ c: parseHex(h)!, en, te }));
/** Nearest friendly colour name, so colour is never conveyed by swatch alone. */
export function colorName(hex: string, lang: 'en' | 'te' = 'en'): string {
  const c = parseHex(hex);
  if (!c) return hex;
  let best = NAME_RGB[0], bd = Infinity;
  for (const n of NAME_RGB) {
    const d = (n.c[0] - c[0]) ** 2 * 0.3 + (n.c[1] - c[1]) ** 2 * 0.59 + (n.c[2] - c[2]) ** 2 * 0.11;
    if (d < bd) { bd = d; best = n; }
  }
  return lang === 'te' ? best.te : best.en;
}
