/*
 * Shape Play data — shapes, "find the shapes" scenes, build-a-picture puzzles and pattern rounds.
 * TELUGU REVIEW NEEDED: shape names and prompts below have not been checked by a native speaker.
 * Pure data + seeded generators (no React).
 */
import { L } from './pictures';
import { clampChoices, type Rng, sample, shuffle } from '../logicCore';

export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'heart' | 'oval' | 'diamond';

function starPath() {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? 50 : 20;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(1)} ${(53 + rad * Math.sin(a) * 0.98).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

export interface ShapeDef { id: ShapeId; name: L; /** path in a 0..100 box, filling the box */ path: string; /** width / height for icons */ aspect: number; colour: string; hint: L }
export const SHAPES: ShapeDef[] = [
  { id: 'circle', name: L('Circle', 'వృత్తం'), path: 'M100 50A50 50 0 1 1 0 50A50 50 0 1 1 100 50Z', aspect: 1, colour: '#E0A63A', hint: L('Round, like a ball.', 'బంతిలా గుండ్రంగా ఉంటుంది.') },
  { id: 'square', name: L('Square', 'చతురస్రం'), path: 'M0 0H100V100H0Z', aspect: 1, colour: '#4F86C6', hint: L('Four sides, all the same.', 'నాలుగు సమాన భుజాలు.') },
  { id: 'triangle', name: L('Triangle', 'త్రిభుజం'), path: 'M50 0L100 100H0Z', aspect: 1.1, colour: '#4E9A6B', hint: L('Three sides and three corners.', 'మూడు భుజాలు, మూడు మూలలు.') },
  { id: 'rectangle', name: L('Rectangle', 'దీర్ఘచతురస్రం'), path: 'M0 0H100V100H0Z', aspect: 1.7, colour: '#B5654A', hint: L('Four sides — two long, two short.', 'రెండు పొడవు, రెండు పొట్టి భుజాలు.') },
  { id: 'star', name: L('Star', 'నక్షత్రం'), path: starPath(), aspect: 1, colour: '#E7B832', hint: L('Five points, like a star in the sky.', 'ఆకాశంలో చుక్కలా ఐదు కొనలు.') },
  { id: 'heart', name: L('Heart', 'హృదయం'), path: 'M50 96C22 74 0 56 0 30 0 13 13 0 28 0 38 0 46 6 50 16 54 6 62 0 72 0 87 0 100 13 100 30 100 56 78 74 50 96Z', aspect: 1.05, colour: '#D0577A', hint: L('A shape that means love.', 'ప్రేమకు గుర్తు.') },
  { id: 'oval', name: L('Oval', 'అండాకారం'), path: 'M100 50A50 50 0 1 1 0 50A50 50 0 1 1 100 50Z', aspect: 1.5, colour: '#8A63B5', hint: L('Like an egg — a stretched circle.', 'గుడ్డులా సాగిన వృత్తం.') },
  { id: 'diamond', name: L('Diamond', 'వజ్రాకారం'), path: 'M50 0L100 50L50 100L0 50Z', aspect: 0.8, colour: '#2F8F8F', hint: L('Like a kite in the sky.', 'గాలిపటంలా ఉంటుంది.') },
];
export const SHAPE: Record<ShapeId, ShapeDef> = Object.fromEntries(SHAPES.map((s) => [s.id, s])) as Record<ShapeId, ShapeDef>;
export const SHAPE_IDS = SHAPES.map((s) => s.id);

/** A shape placed in a 400×260 scene (x,y = top-left of its box; rot in degrees about its centre). */
export interface Placed { shape: ShapeId; x: number; y: number; w: number; h: number; fill: string; rot?: number; label?: L }
export interface ShapeScene { id: string; target: ShapeId; title: L; sky: string; ground: string; decor?: Placed[]; items: Placed[] }

const S = (shape: ShapeId, x: number, y: number, w: number, h: number, fill: string, rot?: number, label?: L): Placed => ({ shape, x, y, w, h, fill, rot, label });
export const SHAPE_SCENES: ShapeScene[] = [
  {
    id: 'park', target: 'circle', title: L('A day at the park', 'పార్కులో ఒక రోజు'), sky: '#CFE6F2', ground: '#A9CF95',
    items: [
      S('circle', 318, 18, 52, 52, '#F2C14E', 0, L('sun', 'సూర్యుడు')),
      S('circle', 30, 40, 40, 40, '#D9534F', 0, L('balloon', 'బుడగ')), S('circle', 72, 22, 40, 40, '#4F86C6', 0, L('balloon', 'బుడగ')), S('circle', 108, 52, 40, 40, '#E7B832', 0, L('balloon', 'బుడగ')),
      S('triangle', 20, 120, 70, 70, '#4E9A6B', 0, L('tree', 'చెట్టు')), S('rectangle', 46, 188, 18, 40, '#8A5A36', 0, L('tree trunk', 'చెట్టు కాండం')),
      S('triangle', 215, 140, 70, 50, '#C0533F', 0, L('bicycle frame', 'సైకిల్')),
      S('circle', 182, 172, 56, 56, '#3B4148', 0, L('wheel', 'చక్రం')), S('circle', 262, 172, 56, 56, '#3B4148', 0, L('wheel', 'చక్రం')),
      S('rectangle', 320, 200, 64, 14, '#9B6B43', 0, L('bench', 'బెంచీ')),
    ],
  },
  {
    id: 'house', target: 'square', title: L('My house', 'మా ఇల్లు'), sky: '#D6E9F0', ground: '#A9CF95',
    items: [
      S('triangle', 105, 34, 210, 82, '#C0533F', 0, L('roof', 'పైకప్పు')),
      S('square', 250, 44, 24, 24, '#8A5A36', 0, L('chimney', 'పొగ గొట్టం')),
      S('rectangle', 120, 112, 180, 120, '#EBCB94', 0, L('wall', 'గోడ')),
      S('square', 138, 130, 40, 40, '#9FD0E8', 0, L('window', 'కిటికీ')), S('square', 242, 130, 40, 40, '#9FD0E8', 0, L('window', 'కిటికీ')),
      S('rectangle', 195, 160, 32, 72, '#7A5134', 0, L('door', 'తలుపు')),
      S('square', 34, 190, 44, 44, '#D9534F', 0, L('gift box', 'బహుమతి పెట్టె')),
      S('circle', 334, 18, 44, 44, '#F2C14E', 0, L('sun', 'సూర్యుడు')),
    ],
  },
  {
    id: 'hills', target: 'triangle', title: L('Hills and tents', 'కొండలు, గుడారాలు'), sky: '#D9ECF3', ground: '#B9D79E',
    items: [
      S('triangle', -10, 60, 190, 150, '#7FA88A', 0, L('hill', 'కొండ')), S('triangle', 130, 36, 210, 174, '#6B9478', 0, L('hill', 'కొండ')),
      S('circle', 338, 20, 44, 44, '#F2C14E', 0, L('sun', 'సూర్యుడు')),
      S('oval', 40, 22, 80, 34, '#FFFFFF', 0, L('cloud', 'మేఘం')),
      S('triangle', 282, 156, 100, 72, '#E8862E', 0, L('tent', 'గుడారం')),
      S('rectangle', 70, 150, 6, 80, '#5B4636', 0, L('flag pole', 'జెండా కర్ర')), S('triangle', 76, 150, 40, 30, '#D9534F', 90, L('flag', 'జెండా')),
      S('triangle', 200, 170, 46, 60, '#3F7A55', 0, L('little tree', 'చిన్న చెట్టు')),
      S('circle', 150, 205, 24, 24, '#E58FB0', 0, L('flower', 'పువ్వు')),
    ],
  },
  {
    id: 'train', target: 'rectangle', title: L('The train', 'రైలు బండి'), sky: '#DCEBF3', ground: '#C9B99A',
    decor: [S('rectangle', 0, 226, 400, 6, '#6B5B4B')],
    items: [
      S('oval', 46, 30, 50, 30, '#E7E7E7', 0, L('smoke', 'పొగ')), S('oval', 76, 52, 36, 22, '#E7E7E7', 0, L('smoke', 'పొగ')),
      S('rectangle', 64, 78, 22, 34, '#3B4148', 0, L('chimney', 'పొగ గొట్టం')),
      S('rectangle', 40, 110, 110, 80, '#C0533F', 0, L('engine', 'ఇంజిను')),
      S('rectangle', 160, 126, 100, 64, '#4F86C6', 0, L('carriage', 'బోగీ')), S('rectangle', 270, 126, 100, 64, '#4E9A6B', 0, L('carriage', 'బోగీ')),
      S('circle', 50, 186, 40, 40, '#2C2C2C', 0, L('wheel', 'చక్రం')), S('circle', 100, 186, 40, 40, '#2C2C2C', 0, L('wheel', 'చక్రం')),
      S('circle', 180, 186, 40, 40, '#2C2C2C', 0, L('wheel', 'చక్రం')), S('circle', 290, 186, 40, 40, '#2C2C2C', 0, L('wheel', 'చక్రం')),
      S('triangle', 330, 30, 40, 40, '#E7B832', 0, L('bunting', 'తోరణం')),
    ],
  },
  {
    id: 'night', target: 'star', title: L('Night sky', 'రాత్రి ఆకాశం'), sky: '#2B3557', ground: '#3C4A3E',
    items: [
      S('circle', 300, 24, 56, 56, '#F4EBC2', 0, L('moon', 'చంద్రుడు')),
      S('star', 30, 30, 36, 36, '#F2D16B', 0, L('star', 'నక్షత్రం')), S('star', 110, 70, 30, 30, '#F2D16B', 0, L('star', 'నక్షత్రం')),
      S('star', 190, 20, 40, 40, '#F2D16B', 0, L('star', 'నక్షత్రం')), S('star', 250, 96, 28, 28, '#F2D16B', 0, L('star', 'నక్షత్రం')),
      S('star', 360, 110, 30, 30, '#F2D16B', 0, L('star', 'నక్షత్రం')),
      S('triangle', 120, 128, 120, 52, '#7E3B34', 0, L('roof', 'పైకప్పు')), S('rectangle', 135, 178, 90, 56, '#8E8A7E', 0, L('house', 'ఇల్లు')),
      S('square', 160, 190, 24, 24, '#F2D16B', 0, L('window', 'కిటికీ')),
      S('diamond', 40, 150, 34, 46, '#C9A0DC', 0, L('kite', 'గాలిపటం')),
    ],
  },
  {
    id: 'garden', target: 'heart', title: L('A garden party', 'తోటలో పండుగ'), sky: '#F3E3E8', ground: '#AFD39C',
    items: [
      S('heart', 30, 30, 48, 46, '#D0577A', 0, L('balloon', 'బుడగ')), S('heart', 86, 14, 44, 42, '#E58FB0', 0, L('balloon', 'బుడగ')),
      S('circle', 150, 40, 40, 40, '#4F86C6', 0, L('balloon', 'బుడగ')),
      S('rectangle', 230, 120, 140, 70, '#D9C29A', 0, L('sign', 'బోర్డు')), S('heart', 280, 130, 46, 44, '#C0393F', 0, L('heart sign', 'హృదయం బొమ్మ')),
      S('circle', 40, 200, 30, 30, '#E7B832', 0, L('flower', 'పువ్వు')), S('circle', 90, 210, 28, 28, '#E8862E', 0, L('flower', 'పువ్వు')),
      S('heart', 150, 196, 40, 38, '#D0577A', 0, L('heart cookie', 'హృదయం బిస్కెట్')),
      S('triangle', 330, 30, 40, 36, '#4E9A6B', 0, L('flag', 'జెండా')),
    ],
  },
  {
    id: 'nest', target: 'oval', title: L('Eggs in a nest', 'గూటిలో గుడ్లు'), sky: '#DDEDF2', ground: '#AFD39C',
    items: [
      S('circle', 30, 10, 150, 130, '#5E9E62', 0, L('tree leaves', 'ఆకులు')), S('rectangle', 92, 130, 26, 100, '#8A5A36', 0, L('tree trunk', 'చెట్టు కాండం')),
      S('rectangle', 180, 120, 120, 26, '#9B6B43', 0, L('nest', 'గూడు')),
      S('oval', 196, 86, 26, 36, '#F7F1E3', 0, L('egg', 'గుడ్డు')), S('oval', 228, 82, 26, 40, '#F2E2C6', 0, L('egg', 'గుడ్డు')), S('oval', 262, 86, 26, 36, '#F7F1E3', 0, L('egg', 'గుడ్డు')),
      S('oval', 250, 192, 130, 46, '#7DB7D9', 0, L('pond', 'చెరువు')),
      S('circle', 340, 18, 42, 42, '#F2C14E', 0, L('sun', 'సూర్యుడు')),
      S('square', 150, 200, 34, 34, '#C0533F', 0, L('box', 'పెట్టె')),
    ],
  },
  {
    id: 'kites', target: 'diamond', title: L('Kites on Sankranti', 'సంక్రాంతి గాలిపటాలు'), sky: '#CFE3F0', ground: '#C9B99A',
    decor: [S('rectangle', 0, 214, 400, 46, '#B9A47E')],
    items: [
      S('diamond', 40, 30, 50, 66, '#D9534F', 0, L('kite', 'గాలిపటం')), S('triangle', 58, 98, 14, 14, '#D9534F', 180, L('kite tail', 'తోక')),
      S('diamond', 150, 60, 44, 58, '#E7B832', 0, L('kite', 'గాలిపటం')), S('triangle', 165, 120, 14, 14, '#E7B832', 180, L('kite tail', 'తోక')),
      S('diamond', 250, 20, 56, 72, '#4E9A6B', 0, L('kite', 'గాలిపటం')),
      S('diamond', 330, 90, 40, 54, '#8A63B5', 0, L('kite', 'గాలిపటం')),
      S('oval', 270, 120, 80, 32, '#FFFFFF', 0, L('cloud', 'మేఘం')), S('oval', 80, 140, 70, 28, '#FFFFFF', 0, L('cloud', 'మేఘం')),
      S('circle', 350, 10, 36, 36, '#F2C14E', 0, L('sun', 'సూర్యుడు')),
      S('rectangle', 20, 180, 120, 34, '#C98B5B', 0, L('wall', 'గోడ')),
    ],
  },
];
export const targetsIn = (s: ShapeScene) => s.items.map((it, i) => (it.shape === s.target ? i : -1)).filter((i) => i >= 0);

/** Build a picture: tap the shape that fits each highlighted outline, in order. */
export interface BuildPuzzle { id: string; name: L; slots: Placed[] }
export const BUILDS: BuildPuzzle[] = [
  { id: 'house', name: L('House', 'ఇల్లు'), slots: [S('square', 140, 120, 120, 120, '#EBCB94'), S('triangle', 120, 40, 160, 82, '#C0533F'), S('rectangle', 186, 170, 30, 70, '#7A5134')] },
  { id: 'tree', name: L('Tree', 'చెట్టు'), slots: [S('rectangle', 185, 150, 30, 90, '#8A5A36'), S('circle', 140, 40, 120, 120, '#5E9E62')] },
  { id: 'icecream', name: L('Ice cream', 'ఐస్ క్రీం'), slots: [S('triangle', 168, 120, 64, 110, '#D9A35F', 180), S('circle', 160, 58, 80, 80, '#E58FB0'), S('heart', 188, 30, 24, 24, '#C0393F')] },
  { id: 'fish', name: L('Fish', 'చేప'), slots: [S('oval', 110, 80, 170, 100, '#E8862E'), S('triangle', 268, 92, 80, 76, '#E7B832', 270), S('circle', 140, 110, 22, 22, '#2C2C2C')] },
  { id: 'kite', name: L('Kite', 'గాలిపటం'), slots: [S('diamond', 150, 20, 100, 140, '#D9534F'), S('triangle', 186, 170, 28, 28, '#E7B832', 180), S('triangle', 186, 206, 28, 28, '#4E9A6B', 180)] },
  { id: 'rocket', name: L('Rocket', 'రాకెట్'), slots: [S('rectangle', 170, 80, 60, 130, '#DCDCE4'), S('triangle', 170, 22, 60, 58, '#C0533F'), S('circle', 185, 105, 30, 30, '#7DB7D9'), S('triangle', 138, 166, 32, 46, '#4F86C6'), S('triangle', 230, 166, 32, 46, '#4F86C6'), S('star', 186, 214, 28, 28, '#E7B832')] },
  { id: 'train', name: L('Train', 'రైలు'), slots: [S('rectangle', 60, 120, 120, 70, '#C0533F'), S('square', 130, 76, 46, 46, '#B5654A'), S('rectangle', 196, 130, 130, 60, '#4F86C6'), S('circle', 80, 182, 40, 40, '#2C2C2C'), S('circle', 140, 182, 40, 40, '#2C2C2C'), S('circle', 240, 182, 40, 40, '#2C2C2C')] },
];

/** Choices for a build slot: the needed shape plus distractors (2..4 total). */
export function buildChoices(r: Rng, needed: ShapeId, n: number): ShapeId[] {
  n = clampChoices(n);
  // rectangle & square look alike — keep them apart at 2 choices
  const avoid: ShapeId[] = n <= 2 ? [needed, ...(needed === 'square' ? ['rectangle' as const] : needed === 'rectangle' ? ['square' as const] : needed === 'circle' ? ['oval' as const] : needed === 'oval' ? ['circle' as const] : [])] : [needed];
  return shuffle(r, [needed, ...sample(r, SHAPE_IDS, n - 1, avoid)]);
}

/** Which shape comes next? AB / AAB / ABB / ABC patterns. */
export interface PatternRound { seq: ShapeId[]; answer: ShapeId; choices: ShapeId[]; unit: ShapeId[] }
const UNITS: number[][] = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]];
export function patternRound(r: Rng, level: number, n: number): PatternRound {
  const unitIdx = level <= 0 ? 0 : level === 1 ? r.pick([0, 1, 2]) : r.pick([0, 1, 2, 3]);
  const kinds = UNITS[unitIdx];
  const distinctShapes = sample(r, SHAPE_IDS.filter((s) => s !== 'oval' && s !== 'rectangle'), 3);
  const unit = kinds.map((k) => distinctShapes[k]);
  const len = unit.length === 2 ? r.pick([4, 5]) : r.pick([5, 6, 7]);
  const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const answer = unit[len % unit.length];
  const used = [...new Set(unit)];
  const nn = clampChoices(n);
  let pool = [answer, ...used.filter((s) => s !== answer)].slice(0, nn);
  if (pool.length < nn) pool = [...pool, ...sample(r, SHAPE_IDS.filter((s) => s !== 'oval' && s !== 'rectangle'), nn - pool.length, pool)];
  return { seq, answer, choices: shuffle(r, pool), unit };
}
