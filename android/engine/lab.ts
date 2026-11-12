// Engine functions for the Physics Lab (called from Kotlin as "lab.<name>").
// Challenge definitions + checks, predictions, intros, presets and sanitising are the website's own
// (src/features/lab/*). The 60 fps simulation runs natively (LabModels.kt) with identical formulas;
// `golden()` gives reference runs from the TypeScript models so the Kotlin port is checked against them.
// Text marked **like this** is shown in bold by the app.
import { fmt } from '../../src/features/lab/common';
import {
  MOTION_DT, MOTION_RANGES, MOTION_DEFAULTS, advanceMotion, initMotion, motionOutcome, parseMotionPreset, sanitizeMotion, stopTime, type MotionParams, type MotionState,
} from '../../src/features/lab/motion';
import {
  FORCES_DT, FORCES_RANGES, FORCES_DEFAULTS, FORCES_RUN, G, advanceForces, forceBreakdown, initForces, parseForcesPreset, sanitizeForces, type ForcesParams, type ForcesState,
} from '../../src/features/lab/forces';
import {
  BULB_R, CELL_V, MAX_BULBS, MAX_CELLS, CIRCUIT_DT, P_MAX, advanceCircuit, brightnessWord, initCircuit, parseCircuitPreset, sanitizeCircuit, solveCircuit, type CircuitParams,
} from '../../src/features/lab/circuit';
import {
  LIGHT_DT, LIGHT_RANGES, LIGHT_DEFAULTS, MIRROR, WORLD, PULSE_SPEED, advanceLight, initLight, parseLightPreset, placeForIncidence, pointAlong, sanitizeLight, traceRay, type LightParams,
} from '../../src/features/lab/light';
import { MOTION_CHALLENGES, MOTION_FLAG, FORCES_CHALLENGES, LIGHT_CHALLENGES, LIGHT_TARGETS, circuitChallenges, type Challenge, type SimId } from '../../src/features/lab/challenges';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

/** Lab index (src/features/lab/index.tsx). */
export const labs = () => [
  { id: 'motion', title: 'Motion Lab', emoji: '🚗', desc: 'Speed, acceleration and braking, with live position–time and velocity–time graphs.', descSimple: 'Make a car speed up, slow down and stop at a flag.', classes: 'Classes 5–10 (graphs and equations for 7–10)' },
  { id: 'forces', title: 'Forces Lab', emoji: '📦', desc: 'Push a box against friction and discover F = ma.', descSimple: 'Push a box on ice, wood and carpet — will it move?', classes: 'Classes 4–10 (F = ma for 8–10)' },
  { id: 'circuit', title: 'Circuit Lab', emoji: '💡', desc: 'Build series circuits from cells, a switch and bulbs; measure V, I and R.', descSimple: 'Light up bulbs and find out why a circuit stops working.', classes: 'Classes 3–10 (Ohm’s law for 7–10)' },
  { id: 'light', title: 'Light Lab', emoji: '🔦', desc: 'Reflect a ray off a plane mirror and measure the angles from the normal.', descSimple: 'Bounce torchlight off a mirror to hit a star.', classes: 'Classes 3–10 (angle measurement for 6–10)' },
];

/** Constants and ranges the native screens need. */
export const constants = () => ({
  motion: { dt: MOTION_DT, ranges: MOTION_RANGES, defaults: MOTION_DEFAULTS, flag: MOTION_FLAG },
  forces: { dt: FORCES_DT, ranges: FORCES_RANGES, defaults: FORCES_DEFAULTS, run: FORCES_RUN, g: G, surfaces: [{ mu: 0.05, label: 'Ice' }, { mu: 0.3, label: 'Wood' }, { mu: 0.5, label: 'Carpet' }, { mu: 0.8, label: 'Sandpaper' }] },
  circuit: { dt: CIRCUIT_DT, cellV: CELL_V, bulbR: BULB_R, maxCells: MAX_CELLS, maxBulbs: MAX_BULBS, pMax: P_MAX },
  light: { dt: LIGHT_DT, ranges: LIGHT_RANGES, defaults: LIGHT_DEFAULTS, mirror: MIRROR, world: WORLD, pulseSpeed: PULSE_SPEED, targets: LIGHT_TARGETS },
});

/** "About this lab": what you explore, model assumptions, units (from each Lab.tsx). */
export function intro(sim: SimId, simple: boolean) {
  switch (sim) {
    case 'motion': return {
      explore: simple
        ? 'Watch a car move along a straight road. Change how fast it starts and whether it speeds up or slows down.'
        : 'Explore motion in a straight line with constant acceleration. Compare the car with its position–time and velocity–time graphs.',
      assumptions: [
        'The road is straight and flat; the car is treated as a single point.',
        'The acceleration stays the same for the whole run.',
        'A negative acceleration means braking. Brakes slow the car to a stop but never push it backwards.',
        `Time moves in small fixed steps of ${MOTION_DT} s, so every run is exactly the same.`,
      ],
      units: [['Distance', 'metres (m)'], ['Time', 'seconds (s)'], ['Speed / velocity', 'metres per second (m/s)'], ['Acceleration', 'metres per second squared (m/s²)']],
    };
    case 'forces': return {
      explore: simple
        ? 'Push a box along the floor. See how its weight and the floor’s roughness change what happens.'
        : 'Explore Newton’s second law with friction: how applied force, mass and the friction coefficient μ decide the acceleration.',
      assumptions: [
        'The floor is flat, so the normal force equals the weight (mg), with g = 9.8 m/s².',
        'Friction pushes against the motion. While the box is still, friction matches the push up to a maximum of μmg.',
        'Once sliding, friction is exactly μmg (we use one μ for both, a simplification).',
        'The push is steady and horizontal; there is no air resistance.',
        `Time moves in fixed steps of ${FORCES_DT} s; each run lasts ${FORCES_RUN} s.`,
      ],
      units: [['Force', 'newtons (N)'], ['Mass', 'kilograms (kg)'], ['Acceleration', 'm/s²'], ['Speed', 'm/s'], ['Distance', 'metres (m)'], ['Friction coefficient μ', 'no unit']],
    };
    case 'circuit': return {
      explore: simple
        ? 'Build a circuit with batteries, a switch and bulbs. Find out what makes a bulb light up, and what makes it brighter or dimmer.'
        : 'Build a series circuit and explore Ohm’s law: how the number of cells and bulbs sets the voltage, resistance, current and brightness.',
      assumptions: [
        `Each cell gives ${CELL_V} V. Cells add up because they are joined one after another (in series).`,
        `Each bulb has the same resistance, ${BULB_R} Ω. Bulbs in series add their resistances.`,
        'Wires and cells are perfect (no resistance of their own).',
        'Brightness grows with the power each bulb uses (P = I²R).',
        'Charge only flows round a complete, closed loop.',
      ],
      units: [['Voltage', 'volts (V)'], ['Current', 'amperes (A)'], ['Resistance', 'ohms (Ω)'], ['Power', 'watts (W)']],
    };
    case 'light': return {
      explore: simple
        ? 'Shine a torch at a mirror and see where the light bounces. Compare the angle going in with the angle coming out.'
        : 'Explore the law of reflection with a plane mirror: measure the angles of incidence and reflection from the normal.',
      assumptions: [
        'Light travels in straight lines called rays.',
        'The mirror is perfectly flat and shiny on its front side only; the back is painted, so light hitting it is absorbed.',
        'The normal is an imaginary line at 90° to the mirror where the ray hits it. Angles are measured from the normal.',
        'The moving dot is slowed right down so you can follow it — real light is far too fast to see.',
      ],
      units: [['Angles', 'degrees (°)'], ['Positions', 'centimetres (cm)'], ['Time', 'seconds (s)']],
    };
  }
}

// ---------------------------------------------------------------- challenges
const list = (sim: SimId, faultIndex: number): Challenge<Any, Any>[] =>
  sim === 'motion' ? MOTION_CHALLENGES : sim === 'forces' ? FORCES_CHALLENGES : sim === 'circuit' ? circuitChallenges(faultIndex) : LIGHT_CHALLENGES;

/** Challenges for a lab (seniorOnly ones hidden for the simple tier), without their check functions. */
export function challenges(sim: SimId, simple: boolean, faultIndex = 0) {
  return list(sim, faultIndex).filter((c) => !simple || !c.seniorOnly).map(({ check: _c, ...c }) => ({
    ...c, goalShown: simple && c.goalSimple ? c.goalSimple : c.goal,
    target: sim === 'light' ? LIGHT_TARGETS.find((t) => t.id === c.id)?.target ?? null : null,
  }));
}
/** Is the challenge goal met by these params and this simulation state? */
export function check(sim: SimId, id: string, params: Any, state: Any, faultIndex = 0): boolean {
  const c = list(sim, faultIndex).find((x) => x.id === id);
  if (!c) return false;
  try { return !!c.check(sanitize(sim, params), state ?? {}); } catch { return false; }
}

// ---------------------------------------------------------------- sanitise / presets
export function sanitize(sim: SimId, raw: unknown): Any {
  return sim === 'motion' ? sanitizeMotion(raw) : sim === 'forces' ? sanitizeForces(raw) : sim === 'circuit' ? sanitizeCircuit(raw) : sanitizeLight(raw);
}
/** URL presets (e.g. /lab/forces?mass=5&force=20 from a lesson): params to apply + the "Checking your answer" banner. */
export function preset(sim: SimId, query: Record<string, string>, saved: unknown) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v != null) q.set(k, String(v));
  if (sim === 'motion') {
    const pr = parseMotionPreset(q);
    if (!pr) return null;
    const p: MotionParams = { ...sanitizeMotion(saved), ...pr };
    const o = motionOutcome(p);
    return { params: p, banner: `With u = ${fmt(p.u)} m/s and a = ${fmt(p.a)} m/s², at t = ${fmt(o.tEnd)} s: **v = ${fmt(o.v)} m/s** and **s = ${fmt(o.x)} m**. Press Play to watch it happen.` };
  }
  if (sim === 'forces') {
    const pr = parseForcesPreset(q);
    if (!pr) return null;
    const p: ForcesParams = { ...sanitizeForces(saved), ...pr };
    const bb = forceBreakdown(p, 0);
    return { params: p, banner: `Mass ${fmt(p.mass)} kg, push ${fmt(p.force)} N, μ = ${fmt(p.friction)}: friction = ${fmt(bb.friction)} N, net force = ${fmt(bb.net)} N, **acceleration = ${fmt(bb.acceleration)} m/s²**.` };
  }
  if (sim === 'circuit') {
    const pr = parseCircuitPreset(q);
    if (!pr) return null;
    const p: CircuitParams = { ...sanitizeCircuit(saved), ...pr };
    const s = solveCircuit({ ...p, gap: null });
    return { params: p, banner: `${p.cells} cell${p.cells > 1 ? 's' : ''} (${fmt(s.voltage)} V), ${p.bulbs} bulb${p.bulbs > 1 ? 's' : ''} (${fmt(s.resistance)} Ω), switch ${p.closed ? 'closed' : 'open'}: **current = ${fmt(s.current, 3)} A**${s.complete ? `, each bulb ${brightnessWord(s.bulbPower)}` : ' — open circuit, bulbs off'}. Press Play to test it.` };
  }
  const pa = parseLightPreset(q);
  if (!pa) return null;
  const p: LightParams = { ...sanitizeLight(saved), ...placeForIncidence(pa.angle, 0), tilt: 0 };
  return { params: p, banner: `Angle of incidence ${fmt(pa.angle)}° on a flat mirror: **angle of reflection = ${fmt(traceRay({ ...placeForIncidence(pa.angle, 0), tilt: 0 }).reflection ?? pa.angle, 1)}°** (law of reflection). Press Play to watch the ray.` };
}
export const placeIncidence = (angle: number, tilt: number) => placeForIncidence(angle, tilt);

// ---------------------------------------------------------------- predictions (from each Lab.tsx)
const sign = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));
export function prediction(sim: SimId, raw: Any, simple: boolean) {
  if (sim === 'motion') {
    const p = sanitizeMotion(raw);
    const o = motionOutcome(p);
    const ts = stopTime(p.u, p.a);
    const way = p.a > 0 ? 'up' : p.a < 0 ? 'down' : 'same';
    const plain = p.a > 0
      ? `The car sped up. It gained ${fmt(p.a)} m/s every second, going from ${fmt(p.u)} m/s to ${fmt(o.v)} m/s.`
      : p.a === 0
        ? `With no acceleration the speed stayed at ${fmt(p.u)} m/s, so the car covered the same distance every second.`
        : o.stopped
          ? `The brakes took away ${fmt(-p.a)} m/s every second, so the car stopped after ${fmt(o.tEnd)} s, ${fmt(o.x)} m from the start.`
          : `The brakes took away ${fmt(-p.a)} m/s every second, slowing the car from ${fmt(p.u)} to ${fmt(o.v)} m/s.`;
    if (simple) {
      return {
        question: 'What will happen to the car’s speed?',
        choices: [{ value: 'up', label: 'It will speed up' }, { value: 'same', label: 'It will stay the same' }, { value: 'down', label: 'It will slow down' }],
        spec: { kind: 'choice', correct: way }, outcome: plain,
      };
    }
    const formula = o.stopped && ts != null
      ? `v = u + at reaches 0 when t = u ÷ |a| = ${fmt(p.u)} ÷ ${fmt(-p.a)} = ${fmt(ts)} s. The brakes can’t push it backwards, so v stays 0 m/s. Distance s = u² ÷ 2|a| = ${fmt(o.x)} m.`
      : `v = u + at = ${fmt(p.u)} + ${sign(p.a)} × ${fmt(o.tEnd)} = **${fmt(o.v)} m/s**; s = ut + ½at² = ${fmt(p.u)} × ${fmt(o.tEnd)} + ½ × ${sign(p.a)} × ${fmt(o.tEnd)}² = **${fmt(o.x)} m**.`;
    return {
      question: `Predict the speed v at the end of the run (t = ${fmt(o.tEnd)} s${o.stopped ? ', when it stops' : ''}).`,
      choices: [...new Set([o.v, p.u, Math.max(0, p.u + 2 * p.a)].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} m/s` })),
      spec: { kind: 'number', value: o.v, unit: 'm/s', tolerance: Math.max(0.1, Math.abs(o.v) * 0.02) }, unit: 'm/s',
      outcome: `${plain} ${formula}`,
    };
  }
  if (sim === 'forces') {
    const p = sanitizeForces(raw);
    const b = forceBreakdown(p, 0);
    const moves = b.sliding;
    const plain = moves
      ? `The push (${fmt(p.force)} N) was bigger than the most friction the floor can give (${fmt(b.maxFriction)} N), so the box slid and kept speeding up.`
      : `Friction can hold back up to ${fmt(b.maxFriction)} N. The push was only ${fmt(p.force)} N, so friction matched it exactly and the box stayed still.`;
    if (simple) {
      return {
        question: 'Will the box move when you press Play?',
        choices: [{ value: 'yes', label: 'Yes, it will slide' }, { value: 'no', label: 'No, it will stay still' }],
        spec: { kind: 'choice', correct: moves ? 'yes' : 'no' }, outcome: plain,
      };
    }
    return {
      question: 'Predict the acceleration a of the box.',
      choices: [...new Set([b.acceleration, p.force / p.mass, 0].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} m/s²` })),
      spec: { kind: 'number', value: b.acceleration, unit: 'm/s^2', tolerance: Math.max(0.05, Math.abs(b.acceleration) * 0.02) }, unit: 'm/s²',
      outcome: `${plain} Maximum friction = μmg = ${fmt(p.friction)} × ${fmt(p.mass)} × ${G} = ${fmt(b.maxFriction)} N. ${moves
        ? `F₍net₎ = ${fmt(p.force)} − ${fmt(b.maxFriction)} = ${fmt(b.net)} N, so a = F₍net₎ ÷ m = ${fmt(b.net)} ÷ ${fmt(p.mass)} = **${fmt(b.acceleration)} m/s²**.`
        : 'F₍net₎ = 0 N, so **a = 0 m/s²**.'}`,
    };
  }
  if (sim === 'circuit') {
    const c = sanitizeCircuit(raw);
    const s = solveCircuit(c);
    const why = s.complete
      ? `The switch was closed and the wires made a complete loop, so charge could flow all the way round from the battery, through the bulb${c.bulbs > 1 ? 's' : ''} and back.`
      : c.gap ? `There was a gap in the ${c.gap} wire, so the loop was broken (an open circuit) and no charge could flow.`
        : 'The switch was open, which leaves a gap in the loop (an open circuit), so no charge could flow.';
    if (simple) {
      return {
        question: 'Will the bulbs light up when you press Play?',
        choices: [{ value: 'yes', label: 'Yes, they will light' }, { value: 'no', label: 'No, they will stay dark' }],
        spec: { kind: 'choice', correct: s.complete ? 'yes' : 'no' }, outcome: why,
      };
    }
    return {
      question: 'Predict the current I in the circuit.',
      choices: [...new Set([s.current, s.voltage / BULB_R, 0].map((x) => fmt(x)))].map((x) => ({ value: x, label: `${x} A` })),
      spec: { kind: 'number', value: s.current, unit: 'A', tolerance: 0.01 }, unit: 'A',
      outcome: `${why} ${s.complete
        ? `V = ${c.cells} × ${CELL_V} = ${fmt(s.voltage)} V, R = ${c.bulbs} × ${BULB_R} = ${fmt(s.resistance)} Ω, so I = V ÷ R = **${fmt(s.current, 3)} A**. Each bulb gets P = I²R = ${fmt(s.bulbPower, 3)} W.`
        : 'In an open circuit **I = 0 A**.'}`,
    };
  }
  const p = sanitizeLight(raw);
  const tr = traceRay(p);
  if (tr.incidence == null) {
    const why = tr.backside ? 'The light reached the back of the mirror, which is painted, so it was absorbed — no reflection.' : 'The beam was not pointing at the mirror, so it travelled on in a straight line.';
    return { question: 'Will the light hit the shiny side of the mirror?', choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], spec: { kind: 'choice', correct: 'no' }, outcome: why };
  }
  const i = tr.incidence;
  const law = `The light bounced off at ${fmt(i, 1)}° from the normal — the same angle it arrived at. This is the law of reflection: angle of incidence = angle of reflection.`;
  if (simple) {
    return {
      question: `The light reaches the mirror at ${fmt(i, 0)}° from the normal (the dashed line). How will it bounce off?`,
      choices: [{ value: 'smaller', label: 'At a smaller angle' }, { value: 'same', label: 'At the same angle' }, { value: 'bigger', label: 'At a bigger angle' }],
      spec: { kind: 'choice', correct: 'same' }, outcome: law,
    };
  }
  return {
    question: `The angle of incidence is ${fmt(i, 1)}°. Predict the angle of reflection r.`,
    choices: [...new Set([i, 90 - i, 2 * i].map((x) => fmt(x, 1)))].map((x) => ({ value: x, label: `${x}°` })),
    spec: { kind: 'number', value: tr.reflection!, unit: '°', tolerance: 1 }, unit: '°',
    outcome: `${law} Measured: i = ${fmt(i, 1)}°, r = **${fmt(tr.reflection!, 1)}°**. Both angles are measured from the normal, not from the mirror surface.`,
  };
}

/** The ray trace for the given params and (optional) challenge target — same function the website draws. */
export const trace = (raw: Any, target?: Any) => traceRay(sanitizeLight(raw), target ?? undefined);

// ---------------------------------------------------------------- reference runs for the Kotlin port
export function golden() {
  const motion = ([{ u: 2, a: 1, t: 8 }, { u: 10, a: -2, t: 12 }, { u: 0, a: 4, t: 5 }, { u: 30, a: -10, t: 20 }, { u: 7.5, a: -0.5, t: 20 }, { u: 3, a: 0, t: 1 }] as MotionParams[])
    .map((p) => { const s = advanceMotion(initMotion(p), p, 10000); return { p, t: s.t, x: s.x, v: s.v, stopped: s.stopped, steps: s.steps, mid: advanceMotion(initMotion(p), p, 37) }; });
  const forces = ([{ mass: 5, force: 30, friction: 0.3 }, { mass: 5, force: 24.5, friction: 0.5 }, { mass: 10, force: 49.4, friction: 0.3 }, { mass: 50, force: 200, friction: 0 }, { mass: 1, force: 0.5, friction: 1 }] as ForcesParams[])
    .map((p) => { const s = advanceForces(initForces(), p, 1000); const mid = advanceForces(initForces(), p, 77); return { p, b: forceBreakdown(p, 0), bMoving: forceBreakdown(p, 1), t: s.t, x: s.x, v: s.v, mid: { t: mid.t, x: mid.x, v: mid.v } }; });
  const circuit = [1, 2, 3, 4].flatMap((cells) => [1, 2, 3].map((bulbs) => { const p: CircuitParams = { cells, bulbs, closed: true, gap: null }; return { p, s: solveCircuit(p), word: brightnessWord(solveCircuit(p).bulbPower), phase: advanceCircuit(initCircuit(), p, 123).phase }; }));
  const light = ([LIGHT_DEFAULTS, ...LIGHT_TARGETS.map((t) => t.solution), { sx: 20, sy: 60, aim: -70, tilt: 0 }, { sx: 50, sy: 40, aim: -90, tilt: 30 }, { sx: 90, sy: 30, aim: 180, tilt: 0 }, { sx: 30, sy: 25, aim: -10, tilt: -30 }] as LightParams[])
    .map((p, i) => {
      const target = LIGHT_TARGETS[i % 2].target;
      const tr = traceRay(p, target);
      const s = advanceLight(initLight(), tr.pathLength, 9);
      return { p, target, tr, dist9: s.dist, pt: pointAlong(tr, s.dist), place: placeForIncidence(10 + i * 9, p.tilt) };
    });
  return { motion, forces, circuit, light };
}
/** Reference only (Node test): state shapes the checks expect. */
export const sampleStates = () => ({ motion: initMotion(MOTION_DEFAULTS) as MotionState, forces: initForces() as ForcesState, circuit: initCircuit(), light: initLight() });

/** Runs the TypeScript model n fixed steps from the start (tests compare the native port and challenge goals). */
export function run(sim: SimId, raw: Any, n: number) {
  if (sim === 'motion') { const p = sanitizeMotion(raw); const { samples: _s, ...s } = advanceMotion(initMotion(p), p, n); return s; }
  if (sim === 'forces') { const p = sanitizeForces(raw); return advanceForces(initForces(), p, n); }
  if (sim === 'circuit') return advanceCircuit(initCircuit(), sanitizeCircuit(raw), n);
  const p = sanitizeLight(raw);
  return advanceLight(initLight(), traceRay(p).pathLength, n);
}
