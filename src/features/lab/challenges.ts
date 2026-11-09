// Guided challenges for each lab (pure data + checks, unit-testable).
// Each challenge can be completed two ways: by running the simulation and meeting the goal
// (status is also shown as text in the table), or by answering a question (typed or chosen).
import type { AnswerSpec } from '../../shared/grading';
import { forceBreakdown, type ForcesParams, type ForcesState } from './forces';
import { faultCircuit, FAULTS, solveCircuit, type CircuitParams, type Fault } from './circuit';
import { traceRay, type LightParams, type Target } from './light';
import type { MotionParams, MotionState } from './motion';

export type SimId = 'motion' | 'forces' | 'circuit' | 'light';

export interface ChallengeQuestion {
  text: string;
  /** Numeric answer (typed by senior learners; chosen from `choices` by younger ones). */
  spec: AnswerSpec;
  unit?: string;
  choices: { value: string; label: string }[];
  explain: string;
}
export interface Challenge<P, S> {
  id: string;
  title: string;
  goal: string; // what to do (full wording)
  goalSimple?: string; // Classes 3–6 wording
  hint: string;
  setup: Partial<P>;
  locked: string[]; // controls fixed during the challenge
  seniorOnly?: boolean;
  check: (p: P, s: S) => boolean;
  question: ChallengeQuestion;
}

const num = (value: number, unit: string, tolerance = 0.05): AnswerSpec => ({ kind: 'number', value, unit, tolerance });

// ---------------- Motion ----------------
export const MOTION_FLAG = 25; // m
export const MOTION_CHALLENGES: Challenge<MotionParams, MotionState>[] = [
  {
    id: 'flag',
    title: 'Stop at the flag',
    goal: `The car starts at 10 m/s. Choose the acceleration a so that it stops exactly at the flag ${MOTION_FLAG} m away (within 0.5 m).`,
    goalSimple: `The car starts fast. Choose how hard to brake so it stops right at the flag.`,
    hint: 'Braking means a is negative. Stopping distance = u² ÷ (2 × braking). Try a few values and watch where it stops.',
    setup: { u: 10, t: 12, a: -1 },
    locked: ['u', 't'],
    check: (_p, s) => s.done && s.stopped && Math.abs(s.x - MOTION_FLAG) <= 0.5,
    question: {
      text: `Starting at 10 m/s, which acceleration stops the car in exactly ${MOTION_FLAG} m?`,
      spec: num(-2, 'm/s^2'), unit: 'm/s²',
      choices: [{ value: '-1', label: '−1 m/s²' }, { value: '-2', label: '−2 m/s²' }, { value: '-5', label: '−5 m/s²' }],
      explain: 'Stopping distance = u² ÷ 2|a| = 100 ÷ 4 = 25 m when a = −2 m/s². The car loses 2 m/s every second and stops after 5 s.',
    },
  },
  {
    id: 'reach20',
    title: 'Reach 20 m/s in 5 s',
    goal: 'Starting from rest, find the acceleration a that gets the car to 20 m/s in exactly 5 s.',
    goalSimple: 'The car starts still. How quickly must it speed up to reach 20 m/s after 5 seconds?',
    hint: 'v = u + at, so a = (v − u) ÷ t.',
    setup: { u: 0, t: 5, a: 1 },
    locked: ['u', 't'],
    check: (p, s) => s.done && Math.abs(s.t - 5) < 1e-6 && p.u === 0 && Math.abs(s.v - 20) <= 0.01,
    question: {
      text: 'A car starts from rest. What acceleration gives 20 m/s after 5 s?',
      spec: num(4, 'm/s^2'), unit: 'm/s²',
      choices: [{ value: '2', label: '2 m/s²' }, { value: '4', label: '4 m/s²' }, { value: '5', label: '5 m/s²' }],
      explain: 'a = (v − u) ÷ t = (20 − 0) ÷ 5 = 4 m/s². The car gains 4 m/s every second.',
    },
  },
];

// ---------------- Forces ----------------
export const FORCES_CHALLENGES: Challenge<ForcesParams, ForcesState>[] = [
  {
    id: 'budge',
    title: 'Get it moving',
    goal: 'The 5 kg box sits on carpet (μ = 0.5). Find a push that only just makes it slide — no more than 26 N — then press Play.',
    goalSimple: 'The box is on a carpet. Find the smallest push that makes it slide (not more than 26 N), then press Play.',
    hint: 'Friction can hold the box until the push is bigger than μ × m × g = 0.5 × 5 × 9.8.',
    setup: { mass: 5, friction: 0.5, force: 10 },
    locked: ['mass', 'friction'],
    check: (p, s) => s.t > 0 && forceBreakdown(p, 0).sliding && p.force <= 26,
    question: {
      text: 'What is the biggest friction force the carpet can give the 5 kg box (μ = 0.5, g = 9.8 m/s²)?',
      spec: num(24.5, 'N', 0.1), unit: 'N',
      choices: [{ value: '5', label: '5 N' }, { value: '24.5', label: '24.5 N' }, { value: '49', label: '49 N' }],
      explain: 'Maximum friction = μmg = 0.5 × 5 × 9.8 = 24.5 N. Any push above that makes the box slide.',
    },
  },
  {
    id: 'accel2',
    title: 'Accelerate at 2 m/s²',
    goal: 'Make the 10 kg box accelerate at 2 m/s² on a rough floor (μ = 0.3), then press Play.',
    hint: 'The push must beat friction (μmg) AND provide ma: F = ma + μmg.',
    setup: { mass: 10, friction: 0.3, force: 20 },
    locked: ['mass', 'friction'],
    seniorOnly: true,
    check: (p, s) => s.t > 0 && Math.abs(forceBreakdown(p, 0).acceleration - 2) <= 0.02,
    question: {
      text: 'What applied force gives the 10 kg box an acceleration of 2 m/s² when μ = 0.3?',
      spec: num(49.4, 'N', 0.15), unit: 'N',
      choices: [{ value: '20', label: '20 N' }, { value: '29.4', label: '29.4 N' }, { value: '49.4', label: '49.4 N' }],
      explain: 'Friction = μmg = 0.3 × 10 × 9.8 = 29.4 N. Net force needed = ma = 20 N. So F = 20 + 29.4 = 49.4 N.',
    },
  },
];

// ---------------- Circuit ----------------
export const faultAnswer = (f: Fault) => (f.kind === 'switch' ? 'switch' : `gap-${f.side}`);
export const CIRCUIT_FAULT_CHOICES = [
  { value: 'switch', label: 'The switch is open' },
  { value: 'gap-left', label: 'A gap in the left wire' },
  { value: 'gap-right', label: 'A gap in the right wire' },
  { value: 'gap-bottom', label: 'A gap in the bottom wire' },
  { value: 'battery', label: 'The battery is flat' },
];
export function circuitChallenges(faultIndex: number): Challenge<CircuitParams, unknown>[] {
  const fault = FAULTS[((faultIndex % FAULTS.length) + FAULTS.length) % FAULTS.length];
  return [
    {
      id: 'fault',
      title: 'Find the fault',
      goal: 'The bulb will not light. Find what is wrong and fix it (tap the broken part, or choose the answer below).',
      goalSimple: 'Oh no — the bulb will not light! Find the problem and fix it.',
      hint: 'Electricity needs a complete loop with no gaps. Check the switch and every wire.',
      setup: faultCircuit(fault),
      locked: ['cells', 'bulbs'],
      check: (p) => solveCircuit(p).complete,
      question: {
        text: 'What is stopping the current?',
        spec: { kind: 'choice', correct: faultAnswer(fault) },
        choices: CIRCUIT_FAULT_CHOICES,
        explain: fault.kind === 'switch'
          ? 'The switch was open, which leaves a gap in the loop. Closing it completes the circuit.'
          : `There was a gap in the ${fault.side} wire. Charges cannot jump the gap, so no current flows until it is joined.`,
      },
    },
    {
      id: 'oneamp',
      title: 'Make exactly 1 A',
      goal: 'Build a closed circuit with a current of exactly 1 A.',
      hint: 'I = V ÷ R. Each cell gives 1.5 V and each bulb is 3 Ω.',
      setup: { cells: 1, bulbs: 1, closed: false, gap: null },
      locked: [],
      seniorOnly: true,
      check: (p) => Math.abs(solveCircuit(p).current - 1) < 1e-9,
      question: {
        text: 'Three 1.5 V cells drive three 3 Ω bulbs in series. What current flows?',
        spec: num(0.5, 'A', 0.01), unit: 'A',
        choices: [{ value: '0.5', label: '0.5 A' }, { value: '1.5', label: '1.5 A' }, { value: '4.5', label: '4.5 A' }],
        explain: 'V = 3 × 1.5 = 4.5 V, R = 3 × 3 = 9 Ω, so I = V ÷ R = 4.5 ÷ 9 = 0.5 A. (2 cells + 1 bulb, or 4 cells + 2 bulbs, give 1 A.)',
      },
    },
  ];
}

// ---------------- Light ----------------
export interface LightTarget { id: string; target: Target; start: LightParams; solution: LightParams }
export const LIGHT_TARGETS: LightTarget[] = [
  { id: 'star', target: { x: 86, y: 48, r: 4 }, start: { sx: 14, sy: 52, aim: -60, tilt: 0 }, solution: { sx: 14, sy: 52, aim: -48, tilt: 0 } },
  { id: 'tilt', target: { x: 85, y: 55, r: 4 }, start: { sx: 20, sy: 60, aim: -70, tilt: 0 }, solution: { sx: 20, sy: 60, aim: -70, tilt: -14 } },
];
export const LIGHT_CHALLENGES: Challenge<LightParams, unknown>[] = [
  {
    id: 'star',
    title: 'Hit the star',
    goal: 'Aim the torch so the REFLECTED ray hits the star. Use the table: “Star hit” turns to “yes”.',
    goalSimple: 'Turn the torch so the light bounces off the mirror and hits the star.',
    hint: 'The ray leaves the mirror at the same angle it arrives. Aim at a point on the mirror halfway between you and the star.',
    setup: LIGHT_TARGETS[0].start,
    locked: ['tilt'],
    check: (p) => traceRay(p, LIGHT_TARGETS[0].target).hitsTarget,
    question: {
      text: 'A ray hits a mirror with an angle of incidence of 35°. What is the angle of reflection?',
      spec: num(35, '°', 0.5), unit: '°',
      choices: [{ value: '35', label: '35°' }, { value: '55', label: '55°' }, { value: '70', label: '70°' }],
      explain: 'Law of reflection: the angle of reflection equals the angle of incidence, both measured from the normal. So it is 35°.',
    },
  },
  {
    id: 'tilt',
    title: 'Tilt the mirror',
    goal: 'The torch is fixed. Tilt the mirror so the reflected ray hits the star.',
    hint: 'Tilting the mirror by some angle turns the reflected ray by twice that angle.',
    setup: LIGHT_TARGETS[1].start,
    locked: ['sx', 'sy', 'aim'],
    seniorOnly: true,
    check: (p) => traceRay(p, LIGHT_TARGETS[1].target).hitsTarget,
    question: {
      text: 'The angle of incidence is 20°. What is the angle between the incident ray and the reflected ray?',
      spec: num(40, '°', 0.5), unit: '°',
      choices: [{ value: '20', label: '20°' }, { value: '40', label: '40°' }, { value: '90', label: '90°' }],
      explain: 'Incidence 20° + reflection 20° = 40° between the two rays.',
    },
  },
];
