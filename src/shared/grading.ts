// Deterministic answer grading shared by the app (instant feedback, offline) and the API.
// Accepts equivalent fractions, decimals, unit conversions and numeric tolerances when the
// answer spec allows them.

export type AnswerSpec =
  | { kind: 'choice'; correct: string } // choice id
  | { kind: 'multi'; correct: string[] } // tap-to-select several
  | { kind: 'number'; value: number; tolerance?: number; relTolerance?: number; unit?: string; requireUnit?: boolean }
  | { kind: 'fraction'; num: number; den: number; acceptEquivalent?: boolean; acceptDecimal?: boolean; requireLowest?: boolean }
  | { kind: 'text'; accept: string[]; caseSensitive?: boolean }
  | { kind: 'order'; correct: string[] }
  | { kind: 'match'; pairs: Record<string, string> }
  | { kind: 'expression'; accept: string[] }; // normalised string forms, e.g. "x=5"

export type Response =
  | { kind: 'choice'; value: string }
  | { kind: 'multi'; value: string[] }
  | { kind: 'text'; value: string }
  | { kind: 'order'; value: string[] }
  | { kind: 'match'; value: Record<string, string> };

export interface GradeResult {
  correct: boolean;
  /** Machine-readable reason, used to pick targeted feedback. */
  reason?: 'empty' | 'unparsable' | 'wrong-value' | 'missing-unit' | 'wrong-unit' | 'not-lowest' | 'wrong';
  /** What we understood the learner to say, for review screens. */
  understood?: string;
}

// ---------------- numbers & fractions ----------------

const SUPER: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };

export function normaliseInput(s: string): string {
  return s
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (c) => SUPER[c])
    .replace(/[−–—]/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d),(?=\d)/g, '$1') // digit grouping: 1,250 and Indian 1,25,000 -> plain digits
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Rational { num: number; den: number }
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const reduce = (r: Rational): Rational => {
  if (r.den === 0) return r;
  const g = gcd(r.num, r.den) || 1;
  const s = r.den < 0 ? -1 : 1;
  return { num: (s * r.num) / g, den: (s * r.den) / g };
};

/** Parses "3/4", "-3/4", "1 1/2", "0.75", "75%", "2" into a rational (exact for decimals). */
export function parseRational(raw: string): Rational | null {
  const s = normaliseInput(raw).replace(/\s*\/\s*/g, '/');
  let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/); // mixed number
  if (m) {
    const whole = +m[2], n = +m[3], d = +m[4];
    if (d === 0) return null;
    return reduce({ num: (m[1] ? -1 : 1) * (whole * d + n), den: d });
  }
  m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) return +m[2] === 0 ? null : { num: +m[1], den: +m[2] };
  m = s.match(/^(-?)(\d*)\.?(\d*)(%?)$/);
  if (m && (m[2] || m[3])) {
    const dec = m[3] || '';
    const num = parseInt((m[2] || '0') + dec, 10) * (m[1] ? -1 : 1);
    let den = 10 ** dec.length;
    if (m[4]) den *= 100;
    if (!Number.isFinite(num)) return null;
    return reduce({ num, den });
  }
  // scientific notation like 3 * 10^8 or 3e8
  m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:\*\s*10\^|e)(-?\d+)$/i);
  if (m) {
    const v = parseFloat(m[1]) * 10 ** parseInt(m[2], 10);
    return Number.isFinite(v) ? { num: v, den: 1 } : null;
  }
  return null;
}
export const ratValue = (r: Rational) => r.num / r.den;

// ---------------- units ----------------

type Dim = 'length' | 'mass' | 'time' | 'speed' | 'force' | 'energy' | 'power' | 'voltage' | 'current' | 'resistance' | 'money' | 'area' | 'volume' | 'angle' | 'temperature' | 'acceleration' | 'pressure' | 'frequency' | 'momentum' | 'density' | 'charge';
interface UnitDef { dim: Dim; factor: number } // factor to SI/base unit

const U: Record<string, UnitDef> = {};
const def = (names: string[], dim: Dim, factor: number) => names.forEach((n) => (U[n] = { dim, factor }));
def(['mm', 'millimetre', 'millimetres', 'millimeter', 'millimeters'], 'length', 0.001);
def(['cm', 'centimetre', 'centimetres', 'centimeter', 'centimeters'], 'length', 0.01);
def(['m', 'metre', 'metres', 'meter', 'meters'], 'length', 1);
def(['km', 'kilometre', 'kilometres', 'kilometer', 'kilometers'], 'length', 1000);
def(['mg', 'milligram', 'milligrams'], 'mass', 1e-6);
def(['g', 'gram', 'grams', 'gm'], 'mass', 0.001);
def(['kg', 'kilogram', 'kilograms'], 'mass', 1);
def(['ms', 'millisecond', 'milliseconds'], 'time', 0.001);
def(['s', 'sec', 'second', 'seconds'], 'time', 1);
def(['min', 'mins', 'minute', 'minutes'], 'time', 60);
def(['h', 'hr', 'hrs', 'hour', 'hours'], 'time', 3600);
def(['m/s', 'mps', 'ms^-1', 'ms-1', 'm s^-1'], 'speed', 1);
def(['km/h', 'kmph', 'km/hr', 'kmh'], 'speed', 1000 / 3600);
def(['cm/s'], 'speed', 0.01);
def(['m/s^2', 'm/s2', 'ms^-2', 'ms-2'], 'acceleration', 1);
def(['n', 'newton', 'newtons'], 'force', 1);
def(['j', 'joule', 'joules'], 'energy', 1);
def(['kj', 'kilojoule', 'kilojoules'], 'energy', 1000);
def(['kwh', 'unit', 'units'], 'energy', 3.6e6);
def(['w', 'watt', 'watts'], 'power', 1);
def(['kw', 'kilowatt', 'kilowatts'], 'power', 1000);
def(['v', 'volt', 'volts'], 'voltage', 1);
def(['a', 'amp', 'amps', 'ampere', 'amperes'], 'current', 1);
def(['ma', 'milliamp', 'milliampere', 'milliamperes'], 'current', 0.001);
def(['ω', 'ohm', 'ohms', 'Ω'], 'resistance', 1);
def(['kω', 'kilohm', 'kilohms'], 'resistance', 1000);
def(['c', 'coulomb', 'coulombs'], 'charge', 1);
def(['₹', 'rs', 'rs.', 'rupee', 'rupees', 'inr'], 'money', 1);
def(['p', 'paise', 'paisa'], 'money', 0.01);
def(['cm^2', 'cm2', 'sq cm'], 'area', 1e-4);
def(['m^2', 'm2', 'sq m'], 'area', 1);
def(['ml', 'millilitre', 'millilitres', 'milliliter'], 'volume', 1e-6);
def(['l', 'litre', 'litres', 'liter', 'liters'], 'volume', 1e-3);
def(['cm^3', 'cm3', 'cc'], 'volume', 1e-6);
def(['m^3', 'm3'], 'volume', 1);
def(['°', 'deg', 'degree', 'degrees'], 'angle', 1);
def(['°c', 'celsius', 'degc'], 'temperature', 1);
def(['pa', 'pascal', 'pascals', 'n/m^2', 'n/m2'], 'pressure', 1);
def(['hz', 'hertz'], 'frequency', 1);
def(['kg m/s', 'kg·m/s', 'kgm/s', 'kg m s^-1'], 'momentum', 1);
def(['g/cm^3', 'g/cm3', 'g/cc'], 'density', 1000);
def(['kg/m^3', 'kg/m3'], 'density', 1);

export function unitInfo(u: string): UnitDef | undefined {
  const k = normaliseInput(u).replace(/²/g, '^2').replace(/³/g, '^3');
  return U[k] ?? U[k.toLowerCase()];
}

/** Splits "25 km/h" -> {num:"25", unit:"km/h"}; "₹ 45" -> {num:"45", unit:"₹"}. */
export function splitUnit(raw: string): { num: string; unit: string } {
  const s = normaliseInput(raw);
  const pre = s.match(/^(₹|rs\.?)\s*(.+)$/i);
  if (pre) return { num: pre[2].trim(), unit: '₹' };
  const m = s.match(/^(-?[\d.\s/]+(?:(?:\*\s*10\^|e)-?\d+)?%?)\s*(.*)$/i);
  if (!m) return { num: s, unit: '' };
  return { num: m[1].trim(), unit: m[2].trim() };
}

// ---------------- grading ----------------

const normText = (s: string, cs?: boolean) => {
  const t = normaliseInput(s).replace(/[.!?]+$/, '').trim();
  return cs ? t : t.toLowerCase();
};
const normExpr = (s: string) => normaliseInput(s).toLowerCase().replace(/\s+/g, '').replace(/\*/g, '');

export function grade(spec: AnswerSpec, r: Response | null | undefined): GradeResult {
  if (!r) return { correct: false, reason: 'empty' };
  switch (spec.kind) {
    case 'choice':
      return r.kind === 'choice' && r.value === spec.correct ? { correct: true } : { correct: false, reason: 'wrong' };
    case 'multi': {
      if (r.kind !== 'multi') return { correct: false, reason: 'wrong' };
      const a = [...r.value].sort().join('|'), b = [...spec.correct].sort().join('|');
      return { correct: a === b, reason: a === b ? undefined : 'wrong' };
    }
    case 'order':
      return r.kind === 'order' && r.value.join('|') === spec.correct.join('|') ? { correct: true } : { correct: false, reason: 'wrong' };
    case 'match': {
      if (r.kind !== 'match') return { correct: false, reason: 'wrong' };
      const keys = Object.keys(spec.pairs);
      const ok = keys.length === Object.keys(r.value).length && keys.every((k) => r.value[k] === spec.pairs[k]);
      return { correct: ok, reason: ok ? undefined : 'wrong' };
    }
    case 'text': {
      if (r.kind !== 'text' || !r.value.trim()) return { correct: false, reason: 'empty' };
      const v = normText(r.value, spec.caseSensitive);
      return spec.accept.some((a) => normText(a, spec.caseSensitive) === v) ? { correct: true, understood: v } : { correct: false, reason: 'wrong', understood: v };
    }
    case 'expression': {
      if (r.kind !== 'text' || !r.value.trim()) return { correct: false, reason: 'empty' };
      const v = normExpr(r.value);
      return spec.accept.some((a) => normExpr(a) === v) ? { correct: true } : { correct: false, reason: 'wrong', understood: v };
    }
    case 'fraction': {
      const raw = r.kind === 'text' ? r.value : r.kind === 'choice' ? r.value : '';
      if (!raw.trim()) return { correct: false, reason: 'empty' };
      const q = parseRational(raw);
      if (!q) return { correct: false, reason: 'unparsable' };
      const target = reduce({ num: spec.num, den: spec.den });
      const isFractionForm = /\//.test(raw);
      const equal = q.num * target.den === target.num * q.den;
      if (!equal) return { correct: false, reason: 'wrong-value', understood: `${q.num}/${q.den}` };
      if (!isFractionForm && spec.acceptDecimal === false) return { correct: false, reason: 'wrong', understood: raw };
      if (isFractionForm) {
        const parts = normaliseInput(raw).replace(/\s*\/\s*/g, '/').match(/(-?\d+)\/(-?\d+)$/);
        if (parts) {
          const n = +parts[1], d = +parts[2];
          const lowest = gcd(n, d) === 1;
          if (spec.requireLowest && !lowest) return { correct: false, reason: 'not-lowest' };
          if (spec.acceptEquivalent === false && !(n === spec.num && d === spec.den) && !lowest) return { correct: false, reason: 'not-lowest' };
        }
      }
      return { correct: true };
    }
    case 'number': {
      const raw = r.kind === 'text' || r.kind === 'choice' ? r.value : '';
      if (!raw.trim()) return { correct: false, reason: 'empty' };
      const { num, unit } = splitUnit(raw);
      const q = parseRational(num);
      if (!q) return { correct: false, reason: 'unparsable' };
      let value = ratValue(q);
      if (spec.unit) {
        const target = unitInfo(spec.unit);
        if (unit) {
          const given = unitInfo(unit);
          if (!given || !target || given.dim !== target.dim) return { correct: false, reason: 'wrong-unit', understood: `${value} ${unit}` };
          value = (value * given.factor) / target.factor; // convert into the expected unit
        } else if (spec.requireUnit) {
          return { correct: false, reason: 'missing-unit', understood: String(value) };
        }
      }
      const tol = Math.max(spec.tolerance ?? 1e-9, spec.relTolerance ? Math.abs(spec.value) * spec.relTolerance : 0);
      const ok = Math.abs(value - spec.value) <= tol;
      return ok ? { correct: true, understood: `${+value.toPrecision(10)}${spec.unit ? ' ' + spec.unit : ''}` } : { correct: false, reason: 'wrong-value', understood: `${+value.toPrecision(10)}${spec.unit ? ' ' + spec.unit : ''}` };
    }
  }
}

// ---------------- deterministic RNG for templates ----------------

/** Mulberry32 — the same seed always yields the same question (needed for review & sync). */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    shuffle: <T>(arr: readonly T[]): T[] => {
      const a2 = [...arr];
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
  };
}
export type Rng = ReturnType<typeof rng>;
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
