// Circuit Lab model: a single series loop of 1.5 V cells, a switch and identical bulbs.
// Ideal wires and cells (no internal resistance); each bulb is a fixed 3 Ω resistor.
import { clamp, readNum, tidy } from './common';

export const CELL_V = 1.5; // V
export const BULB_R = 3; // Ω
export const MAX_CELLS = 4, MAX_BULBS = 3;
export const CIRCUIT_DT = 0.05; // s
export const P_MAX = ((MAX_CELLS * CELL_V) / BULB_R) ** 2 * BULB_R; // brightest possible bulb (W)

export type WireSide = 'top' | 'right' | 'bottom' | 'left';
export interface CircuitParams { cells: number; bulbs: number; closed: boolean; gap: WireSide | null }
export const CIRCUIT_DEFAULTS: CircuitParams = { cells: 2, bulbs: 1, closed: false, gap: null };

export interface CircuitSolution {
  voltage: number; resistance: number; current: number; complete: boolean;
  bulbVoltage: number; bulbPower: number; totalPower: number;
  brightness: number; // 0..1, proportional to bulb power
}

export function solveCircuit(c: CircuitParams): CircuitSolution {
  const voltage = tidy(c.cells * CELL_V);
  const resistance = tidy(c.bulbs * BULB_R);
  const complete = c.closed && c.gap == null && c.cells > 0 && c.bulbs > 0;
  const current = complete ? tidy(voltage / resistance) : 0;
  const bulbVoltage = tidy(current * BULB_R);
  const bulbPower = tidy(current * current * BULB_R);
  return { voltage, resistance, current, complete, bulbVoltage, bulbPower, totalPower: tidy(bulbPower * c.bulbs), brightness: clamp(bulbPower / P_MAX, 0, 1) };
}

export type Brightness = 'off' | 'dim' | 'medium' | 'bright' | 'very bright';
export function brightnessWord(power: number): Brightness {
  if (power <= 0) return 'off';
  if (power < 0.5) return 'dim';
  if (power < 2) return 'medium';
  if (power < 6) return 'bright';
  return 'very bright';
}

/** Charge-flow animation: phase in [0,1) advances in proportion to the current. */
export interface CircuitState { steps: number; t: number; phase: number }
export const initCircuit = (): CircuitState => ({ steps: 0, t: 0, phase: 0 });
export function stepCircuit(s: CircuitState, c: CircuitParams): CircuitState {
  const I = solveCircuit(c).current;
  const steps = s.steps + 1;
  return { steps, t: tidy(steps * CIRCUIT_DT), phase: tidy((s.phase + I * 0.25 * CIRCUIT_DT) % 1) };
}
export function advanceCircuit(s: CircuitState, c: CircuitParams, n: number): CircuitState {
  let cur = s;
  for (let i = 0; i < n; i++) cur = stepCircuit(cur, c);
  return cur;
}

export function parseCircuitPreset(q: URLSearchParams): Partial<CircuitParams> | null {
  const out: Partial<CircuitParams> = {};
  const cells = readNum(q, 'cells', { min: 1, max: MAX_CELLS, step: 1 });
  const bulbs = readNum(q, 'bulbs', { min: 1, max: MAX_BULBS, step: 1 });
  const closed = q.get('closed');
  if (cells !== undefined) out.cells = cells;
  if (bulbs !== undefined) out.bulbs = bulbs;
  if (closed === '1' || closed === 'true') out.closed = true;
  else if (closed === '0' || closed === 'false') out.closed = false;
  return Object.keys(out).length ? out : null;
}

const SIDES: WireSide[] = ['top', 'right', 'bottom', 'left'];
export function sanitizeCircuit(raw: unknown): CircuitParams {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const int = (x: unknown, lo: number, hi: number, d: number) => (typeof x === 'number' && Number.isFinite(x) ? clamp(Math.round(x), lo, hi) : d);
  return {
    cells: int(r.cells, 1, MAX_CELLS, CIRCUIT_DEFAULTS.cells),
    bulbs: int(r.bulbs, 1, MAX_BULBS, CIRCUIT_DEFAULTS.bulbs),
    closed: typeof r.closed === 'boolean' ? r.closed : CIRCUIT_DEFAULTS.closed,
    gap: SIDES.includes(r.gap as WireSide) ? (r.gap as WireSide) : null,
  };
}

/** Deterministic "find the fault" puzzles, used in rotation. */
export type Fault = { kind: 'switch' } | { kind: 'gap'; side: WireSide };
export const FAULTS: Fault[] = [{ kind: 'gap', side: 'left' }, { kind: 'switch' }, { kind: 'gap', side: 'bottom' }, { kind: 'gap', side: 'right' }];
export function faultCircuit(f: Fault, cells = 2, bulbs = 1): CircuitParams {
  return f.kind === 'switch' ? { cells, bulbs, closed: false, gap: null } : { cells, bulbs, closed: true, gap: f.side };
}
