// Circuits & physics challenges. Circuit rounds are checked by simulation; numeric rounds carry
// structured givens so answers can be recomputed from the formula, and are graded with units.
import { rng, clamp, type Rng } from './common';

// ---------------- circuits ----------------
export interface Comp { type: 'switch' | 'bulb'; id: string }
export interface CircuitRound {
  game: 'circuits'; kind: 'circuit'; level: number;
  main: Comp[]; branches: Comp[][]; // branches are in parallel; components in a branch are in series
  targetOn: string[]; mustOff: string[]; solution: string[]; // closed switch ids
}
export function simulate(c: Pick<CircuitRound, 'main' | 'branches'>, closed: ReadonlySet<string>): { lit: Set<string>; short: boolean } {
  const lit = new Set<string>();
  if (c.main.some((x) => x.type === 'switch' && !closed.has(x.id))) return { lit, short: false };
  const active = c.branches.filter((b) => b.every((x) => x.type !== 'switch' || closed.has(x.id)));
  if (!active.length) return { lit, short: false };
  const short = active.some((b) => !b.some((x) => x.type === 'bulb'));
  if (short) return { lit, short: true }; // current takes the easy path: no bulb lights
  for (const b of active) for (const x of b) if (x.type === 'bulb') lit.add(x.id);
  for (const x of c.main) if (x.type === 'bulb') lit.add(x.id);
  return { lit, short: false };
}
export function circuitGoalMet(c: CircuitRound, closed: ReadonlySet<string>): boolean {
  const s = simulate(c, closed);
  return !s.short && c.targetOn.every((b) => s.lit.has(b)) && c.mustOff.every((b) => !s.lit.has(b));
}

function genCircuit(r: Rng, lv: number): CircuitRound {
  let sw = 0, bl = 0;
  const S = (): Comp => ({ type: 'switch', id: `S${++sw}` });
  const B = (): Comp => ({ type: 'bulb', id: `B${++bl}` });
  const main: Comp[] = [S()];
  const branches: Comp[][] = [];
  const targetOn: string[] = [], mustOff: string[] = [];
  const style = lv === 0 ? r.pick(['series', 'parallel']) : r.pick(['parallel', 'parallel', 'mixed']);
  if (style === 'series') {
    const b = [B(), S(), B()];
    branches.push(b);
    targetOn.push(...b.filter((x) => x.type === 'bulb').map((x) => x.id));
  } else {
    const nb = lv === 0 ? 2 : 3;
    for (let i = 0; i < nb; i++) {
      const br = style === 'mixed' && i === 0 ? [S(), B(), B()] : [S(), B()];
      branches.push(br);
    }
    const bulbBranches = branches.map((_, i) => i);
    const offIdx = lv >= 1 ? r.pick(bulbBranches) : -1;
    branches.forEach((b, i) => b.filter((x) => x.type === 'bulb').forEach((x) => (i === offIdx ? mustOff : targetOn).push(x.id)));
    if (lv >= 1 && r.next() < 0.6) branches.splice(r.int(0, branches.length), 0, [S()]); // a tempting short-circuit wire
  }
  const solution = [...main, ...branches.filter((b) => !b.some((x) => x.type === 'bulb' && mustOff.includes(x.id)) && b.some((x) => x.type === 'bulb')).flat()]
    .filter((x) => x.type === 'switch').map((x) => x.id);
  return { game: 'circuits', kind: 'circuit', level: lv, main, branches, targetOn, mustOff, solution };
}

// ---------------- forces ----------------
export interface Force { dir: 'L' | 'R'; n: number; label: string }
export interface ForceRound {
  game: 'circuits'; kind: 'force'; level: number; forces: Force[];
  ask: 'direction' | 'netChoice' | 'net' | 'accel';
  mass?: { value: number; unit: 'kg' | 'g' };
  options?: string[]; // choice ids for direction / netChoice
}
export const netForce = (f: Force[]) => f.reduce((s, x) => s + (x.dir === 'R' ? x.n : -x.n), 0);
export const dirOf = (net: number) => (net > 0 ? 'R' : net < 0 ? 'L' : 'none');
const netId = (net: number) => (net === 0 ? '0:none' : `${Math.abs(net)}:${dirOf(net)}`);
/** Expected answer for force rounds: choice id, or SI value with unit. */
export function forceAnswer(f: ForceRound): { choice?: string; value?: number; unit?: string } {
  const net = netForce(f.forces);
  if (f.ask === 'direction') return { choice: dirOf(net) };
  if (f.ask === 'netChoice') return { choice: netId(net) };
  if (f.ask === 'net') return { value: Math.abs(net), unit: 'N' };
  const kg = f.mass!.unit === 'g' ? f.mass!.value / 1000 : f.mass!.value;
  return { value: Math.abs(net) / kg, unit: 'm/s^2' };
}
const LABELS = ['push', 'pull', 'wind', 'rope', 'friction'];
function genForce(r: Rng, lv: number): ForceRound {
  const ask: ForceRound['ask'] = lv === 0 ? 'direction' : lv === 1 ? 'netChoice' : lv === 2 ? 'net' : 'accel';
  const k = lv === 0 ? 2 : r.int(2, 4);
  const forces: Force[] = [];
  for (let i = 0; i < k; i++) forces.push({ dir: i === 0 ? 'R' : i === 1 ? 'L' : r.pick(['L', 'R'] as const), n: r.int(1, lv === 0 ? 10 : 20) * (lv >= 3 ? 5 : 1), label: r.pick(LABELS) });
  if (ask !== 'direction' || r.next() < 0.85) while (netForce(forces) === 0) forces[0].n += lv >= 3 ? 5 : 1;
  const f: ForceRound = { game: 'circuits', kind: 'force', level: lv, forces, ask };
  if (ask === 'direction') f.options = ['L', 'none', 'R'];
  if (ask === 'netChoice') {
    const net = netForce(forces);
    const sumAll = forces.reduce((s, x) => s + x.n, 0);
    const cands = [netId(-net), `${sumAll}:${dirOf(net)}`, `${Math.abs(net) + 2}:${dirOf(net)}`, `${sumAll}:${dirOf(-net)}`, `${Math.abs(net) + 1}:${dirOf(-net)}`];
    const opts = [netId(net)];
    for (const c of cands) if (!opts.includes(c) && opts.length < 4) opts.push(c);
    f.options = r.shuffle(opts);
  }
  if (ask === 'accel') {
    const net = Math.abs(netForce(forces));
    // choose a mass that divides nicely
    const masses = lv === 3 ? [2, 4, 5, 10] : [0.25, 0.5, 2, 2.5, 4];
    const kg = r.pick(masses.filter((m) => Number.isInteger((net / m) * 100)));
    f.mass = kg < 1 || (lv === 4 && r.next() < 0.5) ? { value: kg * 1000, unit: 'g' } : { value: kg, unit: 'kg' };
  }
  return f;
}

// ---------------- mirrors ----------------
export interface MirrorRound {
  game: 'circuits'; kind: 'mirror'; level: number;
  inDir: number; target: number; // ray heading and the direction (deg) from the mirror to the target
  ask: 'choice' | 'angle'; options: number[]; // mirror line angles (deg, 0..179)
  grazing?: number; // for 'angle': angle between ray and mirror surface
}
export const reflectDir = (inDir: number, mirror: number) => (((2 * mirror - inDir) % 360) + 360) % 360;
export const mirrorAnswer = (m: MirrorRound) => (m.ask === 'choice' ? (((m.inDir + m.target) / 2) % 180 + 180) % 180 : 90 - m.grazing!);
function genMirror(r: Rng, lv: number): MirrorRound {
  if (lv >= 3 && r.next() < 0.5) {
    const grazing = r.int(10, 80);
    return { game: 'circuits', kind: 'mirror', level: lv, inDir: 0, target: 0, ask: 'angle', options: [], grazing };
  }
  const step = lv === 0 ? 90 : lv === 1 ? 30 : 15;
  let target = 0;
  while (target === 0 || target === 180) target = r.int(1, 360 / step - 1) * step;
  const answer = target / 2;
  const opts = [answer];
  for (const d of r.shuffle(lv === 0 ? [45, 90, 135] : [45, 90, 135, 30, 60, 120, 150, 15, 75, 105, 165])) {
    const m = (answer + d) % 180;
    if (!opts.includes(m) && opts.length < (lv === 0 ? 3 : 4)) opts.push(m);
  }
  return { game: 'circuits', kind: 'mirror', level: lv, inDir: 0, target, ask: 'choice', options: r.shuffle(opts) };
}

// ---------------- numeric physics with units ----------------
export interface Quantity { value: number; unit: string }
export type NumericTemplate = 'ohm-I' | 'ohm-V' | 'ohm-R' | 'power' | 'series' | 'speed' | 'fma';
export interface NumericRound {
  game: 'circuits'; kind: 'numeric'; level: number; template: NumericTemplate;
  givens: Record<string, Quantity>; unit: string; value: number; formula: string;
}
const UNIT_SI: Record<string, number> = { V: 1, A: 1, mA: 0.001, 'Ω': 1, 'kΩ': 1000, W: 1, m: 1, km: 1000, s: 1, min: 60, h: 3600, 'm/s': 1, 'km/h': 1000 / 3600, N: 1, kg: 1, g: 0.001, 'm/s^2': 1 };
export const toSI = (q: Quantity) => q.value * UNIT_SI[q.unit];
export const fromSI = (v: number, unit: string) => v / UNIT_SI[unit];
/** Recomputes the answer (in the round's unit) from the givens using the physics formula. */
export function numericFromFormula(n: NumericRound): number {
  const g = (k: string) => toSI(n.givens[k]);
  let si: number;
  switch (n.template) {
    case 'ohm-I': si = g('V') / g('R'); break;
    case 'ohm-V': si = g('I') * g('R'); break;
    case 'ohm-R': si = g('V') / g('I'); break;
    case 'power': si = g('V') * g('I'); break;
    case 'series': si = g('R1') + g('R2') + g('R3'); break;
    case 'speed': si = g('d') / g('t'); break;
    case 'fma': si = g('F') / g('m'); break;
  }
  return fromSI(si, n.unit);
}
const round6 = (x: number) => Math.round(x * 1e6) / 1e6;
function genNumeric(r: Rng, lv: number): NumericRound {
  const base = { game: 'circuits' as const, kind: 'numeric' as const, level: lv };
  const t: NumericTemplate = lv <= 2 ? r.pick(['ohm-I', 'ohm-V', 'series'] as const) : lv === 3 ? r.pick(['ohm-I', 'ohm-R', 'fma', 'series'] as const) : r.pick(['ohm-I', 'power', 'speed', 'fma', 'ohm-R'] as const);
  let n: Omit<NumericRound, 'value'>;
  switch (t) {
    case 'ohm-I': {
      const I = r.int(1, 12) * (lv >= 3 ? 0.5 : 1), R = r.pick([2, 3, 4, 5, 6, 10]);
      if (lv >= 4) { const Rk = r.pick([1, 2, 4, 5]); const V = r.pick([3, 6, 9, 12]); n = { ...base, template: t, givens: { V: { value: V, unit: 'V' }, R: { value: Rk, unit: 'kΩ' } }, unit: 'mA', formula: 'I = V / R' }; break; }
      n = { ...base, template: t, givens: { V: { value: round6(I * R), unit: 'V' }, R: { value: R, unit: 'Ω' } }, unit: 'A', formula: 'I = V / R' }; break;
    }
    case 'ohm-V': { const I = r.int(1, 6), R = r.int(2, 12); n = { ...base, template: t, givens: { I: { value: I, unit: 'A' }, R: { value: R, unit: 'Ω' } }, unit: 'V', formula: 'V = I × R' }; break; }
    case 'ohm-R': {
      const R = r.int(2, 20), ImA = r.pick([100, 200, 250, 500]);
      n = { ...base, template: t, givens: { V: { value: round6((R * ImA) / 1000), unit: 'V' }, I: { value: ImA, unit: 'mA' } }, unit: 'Ω', formula: 'R = V / I' }; break;
    }
    case 'power': { const V = r.pick([6, 12, 24, 230]), I = r.pick([0.5, 1, 2, 3, 5]); n = { ...base, template: t, givens: { V: { value: V, unit: 'V' }, I: { value: I, unit: 'A' } }, unit: 'W', formula: 'P = V × I' }; break; }
    case 'series': { n = { ...base, template: t, givens: { R1: { value: r.int(1, 20), unit: 'Ω' }, R2: { value: r.int(1, 20), unit: 'Ω' }, R3: { value: r.int(1, 20), unit: 'Ω' } }, unit: 'Ω', formula: 'R = R₁ + R₂ + R₃' }; break; }
    case 'speed': {
      const vk = r.pick([18, 36, 54, 72, 90]), tmin = r.pick([10, 20, 30, 40]);
      const km = round6((vk * tmin) / 60);
      n = { ...base, template: t, givens: { d: { value: km, unit: 'km' }, t: { value: tmin, unit: 'min' } }, unit: r.pick(['m/s', 'km/h']), formula: 'v = d / t' }; break;
    }
    case 'fma': {
      const a = r.int(1, 10), mkg = r.pick([0.5, 2, 4, 5]);
      const m: Quantity = mkg < 1 ? { value: mkg * 1000, unit: 'g' } : { value: mkg, unit: 'kg' };
      n = { ...base, template: t, givens: { F: { value: round6(a * mkg), unit: 'N' }, m }, unit: 'm/s^2', formula: 'a = F / m' }; break;
    }
  }
  const out: NumericRound = { ...n, value: 0 };
  out.value = round6(numericFromFormula(out));
  return out;
}

export type CircuitsRound = CircuitRound | ForceRound | MirrorRound | NumericRound;

export function generateCircuits(seed: number, level: number): CircuitsRound {
  const r = rng(seed);
  const lv = clamp(level, 0, 4);
  const kinds: CircuitsRound['kind'][] = lv <= 1 ? ['circuit', 'force', 'mirror'] : lv === 2 ? ['circuit', 'force', 'mirror', 'numeric'] : ['force', 'mirror', 'numeric', 'numeric', 'circuit'];
  const kind = r.pick(kinds);
  if (kind === 'circuit') return genCircuit(r, Math.min(lv, 2));
  if (kind === 'force') return genForce(r, lv);
  if (kind === 'mirror') return genMirror(r, lv);
  return genNumeric(r, lv);
}

/** Display string of a unit for learners. */
export const unitLabel = (u: string) => (u === 'm/s^2' ? 'm/s²' : u);

export function validateCircuits(round: CircuitsRound): string[] {
  const e: string[] = [];
  if (round.kind === 'circuit') {
    if (!circuitGoalMet(round, new Set(round.solution))) e.push('stored solution does not meet goal');
    if (circuitGoalMet(round, new Set())) e.push('already solved with all switches open');
    const all = [...round.main, ...round.branches.flat()].filter((x) => x.type === 'switch').map((x) => x.id);
    const tricky = round.mustOff.length > 0 || round.branches.some((b) => !b.some((x) => x.type === 'bulb'));
    if (tricky && circuitGoalMet(round, new Set(all))) e.push('closing every switch also works (no thinking needed)');
    if (!round.targetOn.length) e.push('no target');
  } else if (round.kind === 'force') {
    const a = forceAnswer(round);
    const net = netForce(round.forces);
    if (round.options) {
      if (round.options.filter((o) => o === a.choice).length !== 1) e.push('answer must appear once');
      if (new Set(round.options).size !== round.options.length) e.push('duplicate options');
    }
    if (round.ask !== 'direction' && net === 0) e.push('net zero');
    if (round.ask === 'accel' && !(a.value! > 0)) e.push('bad accel');
  } else if (round.kind === 'mirror') {
    if (round.ask === 'choice') {
      const ans = mirrorAnswer(round);
      if (reflectDir(round.inDir, ans) !== round.target) e.push('answer does not hit target');
      if (round.options.filter((o) => reflectDir(round.inDir, o) === round.target).length !== 1) e.push('more than one option hits');
      if (!round.options.includes(ans)) e.push('answer missing');
    } else if (!(round.grazing! > 0 && round.grazing! < 90)) e.push('bad grazing angle');
  } else {
    if (Math.abs(numericFromFormula(round) - round.value) > 1e-6 * Math.max(1, Math.abs(round.value))) e.push('value != formula');
    if (!(round.value > 0)) e.push('non-positive answer');
  }
  return e;
}
