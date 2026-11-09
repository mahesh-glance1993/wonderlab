// Pen pressure & tilt handling (pure, no DOM).
//  - PressureDetector decides whether the device gives *useful* pressure. Mice report a constant
//    0.5 while a button is down (never treated as pressure); some fingers/pens report a constant
//    0, 0.5 or 1 — also not useful. A pen with any in-between value, or a touch with clearly
//    varying values, counts as real pressure. The decision is sticky for the session.
//  - Pressure is smoothed with an exponential moving average and remapped by the learner's
//    calibration (light → 0, heavy → 1). Without real pressure, the manual intensity is used.
import { clamp } from './color';

export interface PointerSample { pointerType: string; pressure: number; tiltX?: number; tiltY?: number }
export interface Calibration { min: number; max: number }
export interface PressurePrefs { pressureMode: 'auto' | 'manual'; manualIntensity: number; calibration?: Calibration }
export type IntensitySource = 'pen' | 'manual';

const PLACEHOLDER = new Set([0, 0.5, 1]);

export class PressureDetector {
  detected = false;
  private lo = Infinity;
  private hi = -Infinity;
  observe(s: PointerSample): boolean {
    if (s.pointerType === 'mouse') return this.detected; // mouse never contributes
    const p = s.pressure;
    if (!Number.isFinite(p) || p <= 0) return this.detected; // hover / lift samples
    this.lo = Math.min(this.lo, p);
    this.hi = Math.max(this.hi, p);
    if (s.pointerType === 'pen' && !PLACEHOLDER.has(p)) this.detected = true;
    if (this.hi - this.lo > 0.08) this.detected = true; // clearly varying values (pen or touch force)
    return this.detected;
  }
  reset() { this.detected = false; this.lo = Infinity; this.hi = -Infinity; }
}

/** Exponential moving average; alpha = weight of the newest sample. */
export class Smoother {
  private v: number | null = null;
  alpha: number;
  constructor(alpha = 0.3) { this.alpha = alpha; }
  reset() { this.v = null; }
  next(x: number) { this.v = this.v === null ? x : this.v + this.alpha * (x - this.v); return this.v; }
}

export function calibrate(p: number, cal?: Calibration): number {
  if (!cal || !(cal.max - cal.min >= 0.05)) return clamp(p);
  return clamp((p - cal.min) / (cal.max - cal.min));
}

/** Angle of the pen from vertical, 0..90 degrees. */
export function tiltDegrees(tiltX = 0, tiltY = 0): number {
  const tx = Math.tan((clamp(tiltX, -89, 89) * Math.PI) / 180), ty = Math.tan((clamp(tiltY, -89, 89) * Math.PI) / 180);
  return Math.round((Math.atan(Math.sqrt(tx * tx + ty * ty)) * 180) / Math.PI);
}

export const MIN_INTENSITY = 0.05;

/** Turns raw pointer samples of one stroke into intensities (0..1) and tilt. */
export class PressureInput {
  private smooth = new Smoother(0.3);
  detector: PressureDetector;
  constructor(detector = new PressureDetector()) { this.detector = detector; }
  begin() { this.smooth.reset(); }
  sample(s: PointerSample, prefs: PressurePrefs): { intensity: number; tilt: number; source: IntensitySource } {
    const real = this.detector.observe(s);
    const usePen = prefs.pressureMode === 'auto' && real && s.pointerType !== 'mouse' && s.pressure > 0;
    const tilt = s.pointerType === 'pen' ? tiltDegrees(s.tiltX, s.tiltY) : 0;
    if (!usePen) return { intensity: clamp(prefs.manualIntensity, MIN_INTENSITY, 1), tilt, source: 'manual' };
    const v = this.smooth.next(calibrate(s.pressure, prefs.calibration));
    return { intensity: clamp(v, MIN_INTENSITY, 1), tilt, source: 'pen' };
  }
  /** What the indicator should show right now. */
  mode(prefs: PressurePrefs): IntensitySource { return prefs.pressureMode === 'auto' && this.detector.detected ? 'pen' : 'manual'; }
}

const pct = (a: number[], q: number) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.round(q * (s.length - 1))))]; };
/** From pressures recorded while pressing lightly and heavily → calibration, or null if not useful. */
export function computeCalibration(light: number[], heavy: number[]): Calibration | null {
  const L = light.filter((p) => p > 0 && p <= 1), H = heavy.filter((p) => p > 0 && p <= 1);
  if (L.length < 5 || H.length < 5) return null;
  const min = pct(L, 0.25), max = pct(H, 0.85);
  if (max - min < 0.1) return null;
  return { min: Math.round(min * 100) / 100, max: Math.round(max * 100) / 100 };
}
