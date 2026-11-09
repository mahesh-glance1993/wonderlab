// Shape sorting — pieces and bins with a single sorting rule per round.
import { rng, clamp, L } from './common';

export const SHAPES = ['circle', 'triangle', 'square', 'rectangle', 'rhombus', 'trapezium', 'pentagon', 'hexagon', 'octagon'] as const;
export type ShapeKind = (typeof SHAPES)[number];
export const SIDES: Record<ShapeKind, number> = { circle: 0, triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezium: 4, pentagon: 5, hexagon: 6, octagon: 8 };
export const SHAPE_NAMES: Record<ShapeKind, L> = {
  circle: L('circle', 'వృత్తం'), triangle: L('triangle', 'త్రిభుజం'), square: L('square', 'చతురస్రం'), rectangle: L('rectangle', 'దీర్ఘచతురస్రం'),
  rhombus: L('rhombus', 'రాంబస్'), trapezium: L('trapezium', 'ట్రెపీజియం'), pentagon: L('pentagon', 'పంచభుజి'), hexagon: L('hexagon', 'షడ్భుజి'), octagon: L('octagon', 'అష్టభుజి'),
};
export const COLORS = ['red', 'blue', 'yellow', 'green'] as const;
export type ShapeColor = (typeof COLORS)[number];
export const COLOR_NAMES: Record<ShapeColor, L> = { red: L('red', 'ఎరుపు'), blue: L('blue', 'నీలం'), yellow: L('yellow', 'పసుపు'), green: L('green', 'ఆకుపచ్చ') };

export type SortAttr = 'color' | 'shape' | 'sides';
export interface Piece { id: string; shape: ShapeKind; color: ShapeColor; size: 1 | 2 | 3; rot: number }
export interface Bin { id: string; attr: SortAttr; value: string; label: L }
export interface ShapesRound { game: 'shapes'; level: number; attr: SortAttr; pieces: Piece[]; bins: Bin[] }

const sidesLabel = (n: number): L => L(`${n} sides`, `${n} భుజాలు`);

export function pieceValue(p: Piece, attr: SortAttr): string {
  return attr === 'color' ? p.color : attr === 'shape' ? p.shape : String(SIDES[p.shape]);
}
/** The one bin a piece belongs in (undefined if none — never happens for valid rounds). */
export function binFor(round: ShapesRound, p: Piece): Bin | undefined {
  return round.bins.find((b) => b.value === pieceValue(p, round.attr));
}
export const checkDrop = (round: ShapesRound, pieceId: string, binId: string) => {
  const p = round.pieces.find((x) => x.id === pieceId);
  return !!p && binFor(round, p)?.id === binId;
};

export function generateShapes(seed: number, level: number): ShapesRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const count = [4, 6, 8, 8, 10][lv];
  let attr: SortAttr; let values: string[]; let shapePool: ShapeKind[];
  if (lv === 0) {
    attr = 'color'; values = r.shuffle(COLORS).slice(0, 2); shapePool = ['circle', 'square', 'triangle'];
  } else if (lv <= 2) {
    attr = 'shape';
    const pool: ShapeKind[] = lv === 1 ? ['circle', 'triangle', 'square'] : ['circle', 'triangle', 'square', 'rectangle', 'hexagon'];
    values = r.shuffle(pool).slice(0, lv === 1 ? 2 : 3); shapePool = values as ShapeKind[];
  } else {
    attr = 'sides';
    const sideSets = lv === 3 ? [['3', '4', '5'], ['3', '4', '6'], ['4', '5', '6']] : [['3', '4', '5', '6'], ['3', '4', '6', '8'], ['4', '5', '6', '8']];
    values = r.pick(sideSets);
    shapePool = SHAPES.filter((s) => values.includes(String(SIDES[s])));
  }
  const bins: Bin[] = values.map((v, i) => ({
    id: `b${i}`, attr, value: v,
    label: attr === 'color' ? COLOR_NAMES[v as ShapeColor] : attr === 'shape' ? SHAPE_NAMES[v as ShapeKind] : sidesLabel(+v),
  }));
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    // first pass guarantees every bin gets at least one piece
    const want = i < values.length ? values[i] : undefined;
    let shape: ShapeKind, color: ShapeColor;
    if (attr === 'color') {
      color = (want ?? r.pick(values)) as ShapeColor; shape = r.pick(shapePool);
    } else if (attr === 'shape') {
      shape = (want ?? r.pick(values)) as ShapeKind; color = r.pick(COLORS);
    } else {
      const opts = want ? shapePool.filter((s) => String(SIDES[s]) === want) : shapePool;
      shape = r.pick(opts); color = r.pick(COLORS);
    }
    pieces.push({ id: `p${i}`, shape, color, size: r.pick([1, 2, 3] as const), rot: lv >= 3 ? r.pick([0, 15, 30, 45, 90]) : 0 });
  }
  return { game: 'shapes', level: lv, attr, bins, pieces: r.shuffle(pieces) };
}

export function validateShapes(round: ShapesRound): string[] {
  const e: string[] = [];
  for (const p of round.pieces) {
    const matches = round.bins.filter((b) => b.value === pieceValue(p, round.attr));
    if (matches.length !== 1) e.push(`piece ${p.id} fits ${matches.length} bins`);
  }
  for (const b of round.bins) if (!round.pieces.some((p) => binFor(round, p)?.id === b.id)) e.push(`bin ${b.id} empty`);
  if (new Set(round.pieces.map((p) => p.id)).size !== round.pieces.length) e.push('duplicate ids');
  return e;
}
