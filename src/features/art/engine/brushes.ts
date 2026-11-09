// Brush definitions and per-dab dynamics (pure). Rendering lives in render.ts.
// Each brush maps intensity (pressure or manual intensity, 0..1) and tilt (0..90°) to
// dab radius / alpha / grain coverage in its own way, giving each medium a distinct feel.
import { clamp } from './color';
import type { IconName } from '../../../ui/Icon';

export type BrushId = 'graphite' | 'colorPencil' | 'crayon' | 'oil' | 'watercolor' | 'marker' | 'ink' | 'airbrush' | 'eraser';

export interface BrushDef {
  id: BrushId;
  label: string;
  labelTe: string;
  icon: IconName;
  /** distance between dabs as a fraction of the dab diameter */
  spacing: number;
  /** 'buffer': dabs collect in a stroke buffer then composite once; 'direct': dabs hit the layer */
  target: 'buffer' | 'direct';
  defaultSize: number;
  /** final stroke alpha applied when the buffer is composited */
  strokeAlpha: number;
  /** how the brush responds, shown in the toolbar tooltip */
  hint: string;
  usesTilt?: boolean;
  fixedColor?: string;
}

export const BRUSHES: Record<BrushId, BrushDef> = {
  graphite: { id: 'graphite', label: 'Pencil', labelTe: 'పెన్సిల్', icon: 'edit', spacing: 0.18, target: 'buffer', defaultSize: 6, strokeAlpha: 1, usesTilt: true, fixedColor: '#3d4046', hint: 'Grey graphite. Press harder for darker lines; tilt the pen to shade.' },
  colorPencil: { id: 'colorPencil', label: 'Colour pencil', labelTe: 'రంగు పెన్సిల్', icon: 'edit', spacing: 0.18, target: 'buffer', defaultSize: 8, strokeAlpha: 1, usesTilt: true, hint: 'Grainy colour that builds up. Tilt to shade.' },
  crayon: { id: 'crayon', label: 'Crayon', labelTe: 'క్రేయాన్', icon: 'brush', spacing: 0.15, target: 'buffer', defaultSize: 18, strokeAlpha: 0.95, hint: 'Waxy colour that shows the paper grain. Press harder to fill gaps.' },
  oil: { id: 'oil', label: 'Oil paint', labelTe: 'ఆయిల్ పెయింట్', icon: 'brush', spacing: 0.12, target: 'direct', defaultSize: 26, strokeAlpha: 1, hint: 'Thick, opaque paint that picks up and smears colours underneath.' },
  watercolor: { id: 'watercolor', label: 'Watercolour', labelTe: 'వాటర్ కలర్', icon: 'brush', spacing: 0.14, target: 'buffer', defaultSize: 34, strokeAlpha: 0.6, hint: 'See-through washes with darker wet edges. Layer strokes to build colour.' },
  marker: { id: 'marker', label: 'Marker', labelTe: 'మార్కర్', icon: 'edit', spacing: 0.08, target: 'buffer', defaultSize: 16, strokeAlpha: 0.8, hint: 'Flat, even colour. Overlaps get a little darker.' },
  ink: { id: 'ink', label: 'Ink pen', labelTe: 'ఇంక్ పెన్', icon: 'edit', spacing: 0.08, target: 'buffer', defaultSize: 10, strokeAlpha: 1, hint: 'Crisp lines. Press harder for thicker lines.' },
  airbrush: { id: 'airbrush', label: 'Airbrush', labelTe: 'ఎయిర్ బ్రష్', icon: 'sparkle', spacing: 0.12, target: 'buffer', defaultSize: 50, strokeAlpha: 1, hint: 'Soft spray. Press harder (or go over again) for more paint.' },
  eraser: { id: 'eraser', label: 'Eraser', labelTe: 'రబ్బరు', icon: 'x', spacing: 0.12, target: 'direct', defaultSize: 28, strokeAlpha: 1, hint: 'Rubs out on the selected layer only. Outlines are safe.' },
};
export const BRUSH_ORDER: BrushId[] = ['graphite', 'colorPencil', 'crayon', 'marker', 'watercolor', 'oil', 'ink', 'airbrush', 'eraser'];
/** Simpler set for the early tier. */
export const EARLY_BRUSHES: BrushId[] = ['crayon', 'marker', 'watercolor', 'eraser'];
export const SIZE_PRESETS = [4, 10, 24, 48, 90];

export interface Dab { radius: number; alpha: number; coverage: number }

/** Per-dab dynamics. `size` is the brush diameter chosen by the learner. */
export function dabParams(brush: BrushId, size: number, intensity: number, tilt = 0): Dab {
  const i = clamp(intensity), r0 = size / 2, tt = clamp(tilt / 70); // 0 upright … 1 well tilted
  switch (brush) {
    case 'graphite':
    case 'colorPencil': {
      const widen = 1 + tt * 2.2; // side of the lead when tilted
      return { radius: Math.max(0.6, r0 * (0.7 + 0.5 * i) * widen), alpha: (brush === 'graphite' ? 0.22 : 0.3) + 0.6 * i * (1 - tt * 0.55), coverage: 0.35 + 0.55 * i };
    }
    case 'crayon': return { radius: r0 * (0.85 + 0.3 * i), alpha: 0.9, coverage: 0.42 + 0.5 * i };
    case 'oil': return { radius: r0 * (0.6 + 0.5 * i), alpha: 0.85 + 0.15 * i, coverage: 1 };
    case 'watercolor': return { radius: r0 * (0.55 + 0.6 * i), alpha: 1, coverage: 1 };
    case 'marker': return { radius: r0 * (0.92 + 0.12 * i), alpha: 1, coverage: 1 };
    case 'ink': return { radius: Math.max(0.5, r0 * (0.15 + 1.0 * i)), alpha: 1, coverage: 1 };
    case 'airbrush': return { radius: r0, alpha: 0.025 + 0.11 * i, coverage: 1 };
    case 'eraser': return { radius: r0 * (0.5 + 0.7 * i), alpha: 1, coverage: 1 };
  }
}
export const dabSpacing = (brush: BrushId, radius: number) => Math.max(0.6, radius * 2 * BRUSHES[brush].spacing);
