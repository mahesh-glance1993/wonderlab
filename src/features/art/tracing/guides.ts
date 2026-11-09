// Tracing guides: lines, curves, shapes, numbers 0–10, letters A–Z / a–z and simple pictures.
// Strokes are listed in teaching order; each stroke's path runs in its drawing direction.
// (Path language: see path.ts.) All artwork here is original.
import { parseStroke, type Pt } from './path';

export interface Guide {
  id: string;
  label: string; // shown big + read aloud
  say: string;
  sayTe?: string;
  strokes: string[];
  /** viewBox x y w h */
  box: [number, number, number, number];
  /** y positions of writing lines (letters/numbers) */
  lines?: number[];
}
export interface Sheet { id: string; title: string; titleTe: string; icon: string; guides: Guide[]; minTier?: 'early' | 'primary' }

const UP_BOX: [number, number, number, number] = [-10, 0, 100, 100];
const LOW_BOX: [number, number, number, number] = [-10, 0, 100, 125];
const UP_LINES = [10, 50, 90];
const LOW_LINES = [10, 45, 90, 115];

const UPPER: Record<string, string[]> = {
  A: ['M40 10 L10 90', 'M40 10 L70 90', 'M22 60 L58 60'],
  B: ['M15 10 L15 90', 'M15 10 L45 10 O45 30 20 -90 90 L15 50', 'M15 50 L48 50 O48 70 20 -90 90 L15 90'],
  C: ['O45 50 40 -45 -315'],
  D: ['M15 10 L15 90', 'M15 10 L35 10 O35 50 40 -90 90 L15 90'],
  E: ['M15 10 L15 90', 'M15 10 L65 10', 'M15 50 L55 50', 'M15 90 L65 90'],
  F: ['M15 10 L15 90', 'M15 10 L65 10', 'M15 50 L55 50'],
  G: ['O45 50 40 -45 -360 L55 50'],
  H: ['M15 10 L15 90', 'M65 10 L65 90', 'M15 50 L65 50'],
  I: ['M40 10 L40 90', 'M20 10 L60 10', 'M20 90 L60 90'],
  J: ['M60 10 L60 70 O40 70 20 0 180'],
  K: ['M15 10 L15 90', 'M65 10 L15 55', 'M30 42 L65 90'],
  L: ['M15 10 L15 90 L60 90'],
  M: ['M10 90 L10 10', 'M10 10 L40 60 L70 10 L70 90'],
  N: ['M15 90 L15 10', 'M15 10 L65 90 L65 10'],
  O: ['O45 50 40 -90 -450'],
  P: ['M15 10 L15 90', 'M15 10 L45 10 O45 30 20 -90 90 L15 50'],
  Q: ['O45 50 40 -90 -450', 'M55 68 L82 96'],
  R: ['M15 10 L15 90', 'M15 10 L45 10 O45 30 20 -90 90 L15 50', 'M38 50 L65 90'],
  S: ['O45 30 20 -30 -270 O45 70 20 -90 150'],
  T: ['M10 10 L70 10', 'M40 10 L40 90'],
  U: ['M15 10 L15 65 O40 65 25 180 0 L65 10'],
  V: ['M10 10 L40 90 L70 10'],
  W: ['M5 10 L22 90 L40 35 L58 90 L75 10'],
  X: ['M10 10 L70 90', 'M70 10 L10 90'],
  Y: ['M10 10 L40 50', 'M70 10 L40 50', 'M40 50 L40 90'],
  Z: ['M10 10 L70 10 L10 90 L70 90'],
};
const LOWER: Record<string, string[]> = {
  a: ['O40 67.5 22.5 0 -360', 'M62.5 45 L62.5 90'],
  b: ['M15 10 L15 90', 'O37.5 67.5 22.5 180 540'],
  c: ['O40 67.5 22.5 -45 -315'],
  d: ['O40 67.5 22.5 0 -360', 'M62.5 10 L62.5 90'],
  e: ['M17.5 67.5 L62.5 67.5 O40 67.5 22.5 0 -315'],
  f: ['M58 18 O48 22 12 -20 -180 L36 90', 'M22 48 L52 48'],
  g: ['O40 67.5 22.5 0 -360', 'M62.5 45 L62.5 100 O47.5 100 15 0 170'],
  h: ['M15 10 L15 90', 'M15 90 L15 65 O37.5 65 22.5 180 360 L60 90'],
  i: ['M40 45 L40 90', 'M40 27 L40 31'],
  j: ['M45 45 L45 100 O30 100 15 0 160', 'M45 27 L45 31'],
  k: ['M15 10 L15 90', 'M55 45 L15 72', 'M28 64 L58 90'],
  l: ['M30 10 L30 90'],
  m: ['M10 45 L10 90', 'M10 90 L10 62 O22.5 62 12.5 180 360 L35 90', 'M35 90 L35 62 O47.5 62 12.5 180 360 L60 90'],
  n: ['M15 45 L15 90', 'M15 90 L15 65 O37.5 65 22.5 180 360 L60 90'],
  o: ['O40 67.5 22.5 -90 -450'],
  p: ['M15 45 L15 115', 'O37.5 67.5 22.5 180 540'],
  q: ['O40 67.5 22.5 0 -360', 'M62.5 45 L62.5 115'],
  r: ['M15 45 L15 90', 'M15 90 L15 62 O35 62 20 180 300'],
  s: ['O40 56.25 11.25 -30 -270 O40 78.75 11.25 -90 150'],
  t: ['M35 20 L35 80 O45 80 10 180 45', 'M20 45 L55 45'],
  u: ['M15 45 L15 67.5 O37.5 67.5 22.5 180 0 L60 45', 'M60 45 L60 90'],
  v: ['M15 45 L37.5 90 L60 45'],
  w: ['M8 45 L22 90 L37.5 60 L53 90 L67 45'],
  x: ['M15 45 L60 90', 'M60 45 L15 90'],
  y: ['M15 45 L37.5 90', 'M60 45 L30 115'],
  z: ['M15 45 L60 45 L15 90 L60 90'],
};
const DIGITS: string[][] = [
  ['E40 50 25 40 -90 -450'],
  ['M25 25 L40 10 L40 90'],
  ['O40 32 22 -160 30 L15 90 L68 90'],
  ['O40 30 20 -150 90 O40 70 20 -90 150'],
  ['M45 10 L12 65 L70 65', 'M55 10 L55 90'],
  ['M25 10 L22 45 O40 65 22 -120 145', 'M25 10 L62 10'],
  ['M58 12 Q18 25 18 68 O40 68 22 180 -180'],
  ['M12 10 L68 10 L32 90'],
  ['O40 30 18 -30 -270 O40 70 22 -90 270 O40 30 18 90 -30'],
  ['O40 32 22 0 -360', 'M62 32 L62 90'],
  ['M10 25 L23 10 L23 90', 'E60 50 20 40 -90 -450'],
];
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const NUM_TE = ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది'];
const LETTER_TE: Record<string, string> = {
  A: 'ఏ', B: 'బీ', C: 'సీ', D: 'డీ', E: 'ఈ', F: 'ఎఫ్', G: 'జీ', H: 'హెచ్', I: 'ఐ', J: 'జే', K: 'కే', L: 'ఎల్', M: 'ఎమ్',
  N: 'ఎన్', O: 'ఓ', P: 'పీ', Q: 'క్యూ', R: 'ఆర్', S: 'ఎస్', T: 'టీ', U: 'యూ', V: 'వీ', W: 'డబ్ల్యూ', X: 'ఎక్స్', Y: 'వై', Z: 'జెడ్',
};

const P_BOX: [number, number, number, number] = [0, 0, 100, 100];
const g = (id: string, label: string, say: string, sayTe: string, strokes: string[], box = P_BOX, lines?: number[]): Guide => ({ id, label, say, sayTe, strokes, box, lines });

function spiral(cx: number, cy: number, turns: number, r1: number): string {
  const pts: string[] = [];
  const n = turns * 36;
  for (let i = 0; i <= n; i++) {
    const a = (i / 36) * Math.PI * 2, r = (r1 * i) / n;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}
function star(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

export const SHEETS: Sheet[] = [
  {
    id: 'lines', title: 'Lines', titleTe: 'గీతలు', icon: 'edit', minTier: 'early',
    guides: [
      g('line-standing', 'Standing lines', 'Standing line', 'నిలువు గీత', ['M20 10 L20 90', 'M50 10 L50 90', 'M80 10 L80 90']),
      g('line-sleeping', 'Sleeping lines', 'Sleeping line', 'అడ్డ గీత', ['M10 20 L90 20', 'M10 50 L90 50', 'M10 80 L90 80']),
      g('line-slant', 'Slanting lines', 'Slanting line', 'ఏటవాలు గీత', ['M10 10 L50 90', 'M50 10 L90 90']),
      g('line-slant-back', 'Slanting lines', 'Slanting line', 'ఏటవాలు గీత', ['M50 10 L10 90', 'M90 10 L50 90']),
      g('line-zigzag', 'Zigzag', 'Zigzag line', 'జిగ్‌జాగ్ గీత', ['M5 70 L20 30 L35 70 L50 30 L65 70 L80 30 L95 70']),
      g('line-steps', 'Steps', 'Steps', 'మెట్లు', ['M10 85 L10 65 L30 65 L30 45 L50 45 L50 25 L70 25 L70 10 L90 10']),
    ],
  },
  {
    id: 'curves', title: 'Curves', titleTe: 'వంపు గీతలు', icon: 'reset', minTier: 'early',
    guides: [
      g('curve-wave', 'Waves', 'Wave', 'అల గీత', ['M5 50 Q16 25 27 50 Q38 75 50 50 Q61 25 72 50 Q83 75 95 50']),
      g('curve-hills', 'Hills', 'Hills', 'కొండలు', ['M5 75 Q20 20 35 75 Q50 20 65 75 Q80 20 95 75']),
      g('curve-cups', 'Cups', 'Cups', 'కప్పులు', ['M5 25 Q20 85 35 25 Q50 85 65 25 Q80 85 95 25']),
      g('curve-loops', 'Loops', 'Loops', 'చుట్టలు', ['M5 70 C20 70 30 20 20 20 C10 20 15 70 40 70 C55 70 65 20 55 20 C45 20 50 70 75 70 C90 70 95 50 95 50']),
      g('curve-spiral', 'Spiral', 'Spiral', 'సర్పిలం', [spiral(50, 50, 3, 42)]),
      g('curve-c', 'Big curves', 'Curve', 'వంపు', ['O50 50 38 -45 -315']),
    ],
  },
  {
    id: 'shapes', title: 'Shapes', titleTe: 'ఆకారాలు', icon: 'grid', minTier: 'early',
    guides: [
      g('shape-circle', 'Circle', 'Circle', 'వృత్తం', ['O50 50 38 -90 -450']),
      g('shape-square', 'Square', 'Square', 'చతురస్రం', ['M15 15 L15 85', 'M15 15 L85 15 L85 85', 'M15 85 L85 85']),
      g('shape-triangle', 'Triangle', 'Triangle', 'త్రిభుజం', ['M50 12 L12 85', 'M50 12 L88 85', 'M12 85 L88 85']),
      g('shape-rectangle', 'Rectangle', 'Rectangle', 'దీర్ఘచతురస్రం', ['M8 25 L8 75', 'M8 25 L92 25 L92 75', 'M8 75 L92 75']),
      g('shape-oval', 'Oval', 'Oval', 'అండాకారం', ['E50 50 42 28 -90 -450']),
      g('shape-diamond', 'Diamond', 'Diamond', 'వజ్రం', ['M50 8 L18 50 L50 92', 'M50 8 L82 50 L50 92']),
      g('shape-star', 'Star', 'Star', 'నక్షత్రం', [star(50, 54, 44, 18)]),
      g('shape-heart', 'Heart', 'Heart', 'హృదయం', ['M50 30 C50 10 15 5 12 32 C10 55 40 70 50 90', 'M50 30 C50 10 85 5 88 32 C90 55 60 70 50 90']),
    ],
  },
  {
    id: 'numbers', title: 'Numbers 0–10', titleTe: 'అంకెలు 0–10', icon: 'table', minTier: 'early',
    guides: DIGITS.map((s, n) => g(`num-${n}`, String(n), NUM_EN[n], NUM_TE[n], s, n === 10 ? [-10, 0, 105, 100] : UP_BOX, UP_LINES)),
  },
  {
    id: 'capitals', title: 'Capital letters A–Z', titleTe: 'పెద్ద అక్షరాలు A–Z', icon: 'book', minTier: 'early',
    guides: Object.entries(UPPER).map(([k, s]) => g(`up-${k}`, k, `Capital ${k}`, `పెద్ద ${LETTER_TE[k]}`, s, UP_BOX, UP_LINES)),
  },
  {
    id: 'small', title: 'Small letters a–z', titleTe: 'చిన్న అక్షరాలు a–z', icon: 'book',
    guides: Object.entries(LOWER).map(([k, s]) => g(`low-${k}`, k, `Small ${k}`, `చిన్న ${LETTER_TE[k.toUpperCase()]}`, s, LOW_BOX, LOW_LINES)),
  },
  {
    id: 'pictures', title: 'Pictures', titleTe: 'బొమ్మలు', icon: 'image', minTier: 'early',
    guides: [
      g('pic-house', 'House', 'House', 'ఇల్లు', ['M20 45 L20 90 L80 90 L80 45', 'M12 50 L50 12 L88 50', 'M42 90 L42 65 L58 65 L58 90']),
      g('pic-sun', 'Sun', 'Sun', 'సూర్యుడు', ['O50 50 20 -90 -450', 'M50 22 L50 6', 'M70 30 L82 18', 'M78 50 L94 50', 'M70 70 L82 82', 'M50 78 L50 94', 'M30 70 L18 82', 'M22 50 L6 50', 'M30 30 L18 18']),
      g('pic-fish', 'Fish', 'Fish', 'చేప', ['M70 50 Q50 20 20 50 Q50 80 70 50', 'M70 50 L90 32 L90 68 L70 50', 'O32 45 3 0 360']),
      g('pic-balloon', 'Balloon', 'Balloon', 'బెలూన్', ['E50 38 26 32 -90 -450', 'M50 70 Q42 80 50 88 Q58 95 50 100']),
      g('pic-boat', 'Boat', 'Boat', 'పడవ', ['M10 65 L90 65 L75 85 L25 85 L10 65', 'M50 65 L50 10', 'M50 12 L80 55 L50 55']),
      g('pic-flower', 'Flower', 'Flower', 'పువ్వు', ['O50 35 8 -90 -450', 'M50 27 Q38 5 50 3 Q62 5 50 27', 'M58 35 Q80 23 82 35 Q80 47 58 35', 'M50 43 Q62 65 50 67 Q38 65 50 43', 'M42 35 Q20 47 18 35 Q20 23 42 35', 'M50 67 L50 97', 'M50 85 Q65 70 75 78 Q65 88 50 85']),
    ],
  },
];

export const sheetById = (id: string) => SHEETS.find((s) => s.id === id);
const parsed = new Map<string, Pt[][]>();
/** Flattened stroke polylines for a guide (cached). */
export function guidePolys(gd: Guide): Pt[][] {
  let p = parsed.get(gd.id);
  if (!p) { p = gd.strokes.map((s) => parseStroke(s)); parsed.set(gd.id, p); }
  return p;
}
