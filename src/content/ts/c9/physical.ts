// Telangana SCERT Class 9 — Physical Science (12 chapters). Original explanations aligned to the official
// chapter list (src/content/ts/books.ts, syllabus.json). Class 9 carries refraction at plane surfaces
// (Snell's law, critical angle, total internal reflection) and heat (specific heat, latent heat), which are
// not repeated in Class 10. Values used: g = 9.8 m/s² unless a question says g = 10 m/s²; c = 3 × 10⁸ m/s;
// specific heat of water ≈ 4.2 J/(g °C) (1 cal/g °C); latent heat of fusion of ice ≈ 334 J/g (80 cal/g).
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, L, approx, frac, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(9, 'physical-science', n);
const who = (r: Rng) => r.pick(NAMES).en;

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, hint, why the answer is right] */
type MQ = [string, string, string[], string, string];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1],
    mistakes: [{ when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}.`, why],
  };
}, d);

const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched — check each left item against its meaning one at a time.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, steps), hints,
  mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
  solution: [...steps.map((s, i) => `${i + 1}. ${s}`), why],
}), d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option separately. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join(', ')}.`, why],
  };
}, d);

// ---------- "what if?" explorer helper ----------
type XV = [sym: string, name: string, unit: string, min: number, max: number, step: number, value: number];
interface XSpec { title: string; formula: string; res: [sym: string, name: string, unit: string, expr: string, decimals?: number]; vars: XV[]; notes: [string, string, string][]; mistakes: [string, string][]; real: string }
const xp = (o: XSpec) => {
  const [sym, name, unit, expr, decimals] = o.res;
  return explore({
    title: L(o.title), formula: o.formula,
    result: { sym, name: L(name), expr, ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) },
    vars: o.vars.map(([s, n, u, min, max, step, value]) => ({ sym: s, name: L(n), ...(u ? { unit: u } : {}), min, max, step, value })),
    notes: o.notes.map(([s, up, down]) => ({ sym: s, up: L(up), down: L(down) })),
    mistakes: o.mistakes.map(([wrong, why]) => ({ wrong: L(wrong), why: L(why) })),
    realWorld: L(o.real),
  });
};

/** Typed numeric item, with a required unit when `unit` is given. */
const numQ = (prompt: string, ans: number, unit: string | undefined, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, true) : approx(ans, rel),
  hints, solution,
  mistakes: [
    ...(unit ? [{ when: 'missing-unit', explain: `Add the unit (${unit}) — a number alone is not a complete physical answer.` }, { when: 'wrong-unit', explain: `That unit measures a different quantity. The answer should be in ${unit} (or an equivalent unit of the same kind).` }] : []),
    { when: 'wrong-value', explain: 'Check the formula you used and redo the arithmetic step by step — write each value with its unit first.' },
    ...mistakes,
  ],
});

// =====================================================================================
// Chapter 1 — Matter around us
// =====================================================================================
const ch1: USpec = {
  id: 'ts9.ps.ch1', subject: 'chemistry', title: 'Matter around us', source: src(1),
  objectives: [
    {
      id: 'ts9.ps.matter.states', title: 'States of matter and their properties; compressibility', prereqs: [],
      intro: [
        h('Everything is made of tiny particles'),
        photo('🧊', 'An ice cube, the water it melts into and the steam above a kettle are the same substance in three different states.'),
        p('Anything that has mass and takes up space is matter: the air you breathe, the water you drink and the bench you sit on. All matter is made of extremely small particles that we cannot see even with an ordinary microscope.'),
        p('How these particles are packed, how strongly they pull on each other and how fast they move decides whether a substance is a solid, a liquid or a gas.'),
        def('Solid', 'Particles packed very closely, held by strong attraction, only vibrating in place. A solid has a fixed shape and a fixed volume and is almost impossible to compress.'),
        def('Liquid', 'Particles close together but able to slide past one another. A liquid has a fixed volume but takes the shape of its container; it can flow.'),
        def('Gas', 'Particles far apart, moving fast in all directions with very weak attraction. A gas has no fixed shape or volume; it fills any container.'),
        def('Compressibility', 'How much the volume of a substance can be reduced by pressing it. Gases are highly compressible because there is a lot of empty space between their particles.'),
        p('Because gases compress so well, a large amount of gas can be packed into a small cylinder. LPG for cooking and CNG for autos and buses are stored this way. A liquid like water hardly compresses at all, which is why hydraulic brakes and lifts work.'),
        keys('Solid: fixed shape, fixed volume, rigid.', 'Liquid: fixed volume, no fixed shape, flows.', 'Gas: no fixed shape or volume, fills its container.', 'Compressibility: gas ≫ liquid > solid.'),
        remember('Space between particles: smallest in solids, more in liquids, most in gases. Force of attraction is in the reverse order.'),
        tip('A sponge seems compressible, but it is a solid full of air holes — when you squeeze it, you push the air out.'),
      ],
      examples: [
        ex('Why can a 14 kg cylinder of LPG supply a family kitchen for weeks?', ['Gas particles have large spaces between them.', 'Under high pressure the gas is squeezed into a small volume (it even turns into liquid).', 'So a large quantity of fuel fits into a small cylinder.'], 'Gases are highly compressible, so a lot of fuel can be stored in a small space.'),
        ex('Imran pours 200 mL of water from a glass into a flat plate. What changes and what stays the same?', ['Liquids take the shape of the container, so the shape changes.', 'Liquids have a fixed volume, so the amount stays 200 mL.'], 'Shape changes; volume stays 200 mL.'),
      ],
      practice: [
        mcq('props', 'Think about how closely the particles are packed.', [
          ['Which state of matter has a fixed volume but no fixed shape?', 'Liquid', ['Solid', 'Gas', 'None of these'], 'It flows and takes the shape of its container.', 'A liquid keeps its volume but takes the shape of whatever holds it.'],
          ['Which state is the most compressible?', 'Gas', ['Solid', 'Liquid', 'All are equally compressible'], 'Where is there the most empty space?', 'Gas particles are far apart, so they can be pushed much closer.'],
          ['In which state are the forces of attraction between particles strongest?', 'Solid', ['Liquid', 'Gas', 'They are equal in all states'], 'Which state keeps its shape?', 'Strong attraction holds solid particles in fixed positions.'],
          ['Why is CNG stored in strong cylinders at high pressure?', 'Gases can be compressed into a small volume', ['Gases become solid under pressure', 'Gases have a fixed volume', 'Pressure makes the gas lighter'], 'Compressibility.', 'High pressure squeezes a large amount of gas into a small cylinder.'],
          ['A gas released in one corner of a closed room soon fills the room. This shows that a gas…', 'Has no fixed volume and fills its container', ['Has a fixed shape', 'Has a fixed volume', 'Cannot move'], 'Gas particles move freely.', 'Gas particles move in all directions until they occupy the whole space.'],
          ['Which property allows a liquid to be poured?', 'Its particles can slide over one another (fluidity)', ['Its particles are fixed in place', 'It has no mass', 'It is very compressible'], 'Think of flowing.', 'Liquid particles can move past each other, so liquids flow.'],
        ]),
        matchT('match', 'state to its property', [
          ['Solid', 'Fixed shape and fixed volume'], ['Liquid', 'Fixed volume, takes container shape'], ['Gas', 'Fills the whole container'],
          ['Compressibility', 'Reduction in volume on pressing'], ['Rigidity', 'Keeps its shape under force'], ['Fluidity', 'Ability to flow'],
        ], ['Match the three states first.', 'Rigidity belongs to solids; fluidity to liquids and gases.']),
        tapT('tap-gas', 'Tap every statement that is TRUE for gases.', [
          ['They have no fixed shape', true], ['They have no fixed volume', true], ['They are highly compressible', true], ['Their particles move fast and randomly', true],
          ['They have a fixed shape', false], ['Their particles are tightly packed', false], ['They cannot be compressed', false],
        ], ['Picture particles far apart and moving fast.', 'Gases fill any container.'], 'Gas particles are far apart and move freely, so gases have no fixed shape or volume and compress easily.'),
      ],
    },
    {
      id: 'ts9.ps.matter.diffusion', title: 'Diffusion — particles of matter keep moving', prereqs: ['ts9.ps.matter.states'],
      intro: [
        h('Why can you smell food from another room?'),
        photo('🕯️', 'Light an agarbatti in one corner of a room and soon its smell reaches every corner — without anyone carrying it.'),
        p('Particles of matter are always moving. When two substances meet, their particles move into the spaces between each other and slowly spread out until they are evenly mixed. This spreading on its own is called diffusion.'),
        def('Diffusion', 'The intermixing of particles of two different substances on their own, caused by the continuous movement of particles.'),
        p('Diffusion is fastest in gases (particles move fastest and have the most space), slower in liquids and extremely slow in solids. Heating makes particles move faster, so diffusion speeds up when the temperature rises. A crystal of potassium permanganate colours hot water faster than cold water.'),
        p('Diffusion is important in life too: oxygen from air diffuses into the water of ponds for fish, and carbon dioxide diffuses into leaves.'),
        keys('Diffusion happens because particles are always moving.', 'Rate: gases > liquids > solids.', 'Higher temperature → faster diffusion.'),
        remember('Diffusion proves two things: particles of matter are moving, and there are spaces between them.'),
        tip('Try it: drop a little ink into a glass of still water and do not stir. Watch the colour spread for 10 minutes.'),
      ],
      examples: [
        ex('A drop of ink spreads faster in a cup of hot tea-water than in cold water. Explain.', ['At a higher temperature particles have more kinetic energy.', 'They move faster and mix more quickly.'], 'Diffusion is faster at higher temperature because particles move faster.'),
        ex('Why do you smell hot food from a distance but cold food only when you go close?', ['Hot food releases particles of the smell that move fast.', 'Fast gas particles diffuse quickly through the air.', 'Cold food releases fewer, slower particles.'], 'Higher temperature increases the rate of diffusion of smell particles.'),
      ],
      practice: [
        mcq('rate', 'Remember: faster particles and more space → faster diffusion.', [
          ['In which state of matter is diffusion fastest?', 'Gas', ['Liquid', 'Solid', 'Same in all'], 'Particles have most space and speed here.', 'Gas particles move fastest with large gaps, so they intermix quickest.'],
          ['What happens to the rate of diffusion when temperature increases?', 'It increases', ['It decreases', 'It stays the same', 'It stops'], 'Heat gives particles more energy.', 'Faster particles intermix more quickly.'],
          ['Diffusion shows that particles of matter…', 'Are continuously moving', ['Are at rest', 'Have no space between them', 'Are very large'], 'Nobody stirs the mixture.', 'The spreading happens on its own because particles move all the time.'],
          ['A copper vessel and a brass vessel kept touching for a day do not mix noticeably because…', 'Diffusion in solids is extremely slow', ['Metals have no particles', 'Solids diffuse fastest', 'Metals repel each other'], 'Solid particles only vibrate in place.', 'Solid particles hardly move from their positions, so diffusion is extremely slow.'],
          ['Aquatic animals breathe because oxygen from air…', 'Diffuses into the water', ['Freezes in water', 'Condenses in water', 'Does not mix with water'], 'Gases can spread into liquids.', 'Oxygen particles diffuse into water and dissolve.'],
          ['Which example is NOT diffusion?', 'Stirring sugar into tea with a spoon', ['Smell of perfume spreading in a room', 'Ink spreading in still water', 'Smell of incense reaching the next room'], 'Diffusion happens on its own.', 'Stirring is forced mixing, not spontaneous diffusion.'],
        ]),
        orderT('order-rate', 'Arrange from the FASTEST diffusion to the SLOWEST.', ['Smell of perfume spreading in air', 'Ink spreading in still water', 'Two metal blocks pressed together mixing at the surface'], ['Gas → liquid → solid.', 'Solids diffuse the slowest.'], 'Diffusion rate depends on state: gas fastest, then liquid, then solid.'),
        tapT('tap', 'Tap every example of diffusion.', [
          ['Smell of jasmine flowers filling a room', true], ['Potassium permanganate colouring still water', true], ['Smoke from an agarbatti spreading', true], ['Carbon dioxide entering a leaf', true],
          ['Shaking a bottle of oil and water', false], ['Ice melting in a glass', false], ['Water boiling in a pot', false],
        ], ['Diffusion is spontaneous mixing of different substances.', 'A change of state is not diffusion.'], 'Diffusion is the spreading/mixing of particles on their own; melting, boiling and shaking are different processes.'),
      ],
    },
    {
      id: 'ts9.ps.matter.change', title: 'Change of state; particles attract each other', prereqs: ['ts9.ps.matter.states'],
      intro: [
        h('Particles hold hands'),
        photo('💧', 'A drop of water hanging from a tap stays together as a round bead because its particles pull on one another.'),
        p('Try breaking an iron nail, a piece of chalk and a stream of water. The nail is hardest, chalk is easier and the water stream splits instantly. This shows that particles of matter attract each other, and the strength of this attraction is different in different substances.'),
        h('Changing state by heating and cooling'),
        p('When ice is heated, its particles vibrate faster. At 0 °C they have enough energy to break free of their fixed positions and the ice melts. The temperature stays at 0 °C until all the ice has melted — the heat supplied is used to overcome the attraction between particles, not to raise temperature. This hidden heat is called latent heat.'),
        def('Melting point', 'The temperature at which a solid changes into a liquid at atmospheric pressure. For ice it is 0 °C (273 K).'),
        def('Boiling point', 'The temperature at which a liquid boils and changes into gas throughout its bulk at atmospheric pressure. For water it is 100 °C (373 K).'),
        def('Sublimation', 'A change directly from solid to gas without becoming liquid, e.g. camphor, naphthalene balls, ammonium chloride and dry ice (solid CO₂).'),
        p('Pressure matters too. Squeezing a gas pushes its particles together; with cooling, the gas can become a liquid. That is how LPG is liquefied.'),
        h('Celsius and kelvin'),
        p('Scientists use the kelvin (K) scale, the SI unit of temperature. A change of 1 K is the same size as 1 °C; the kelvin scale simply starts lower.'),
        f('T (K) = t (°C) + 273', 'temperature in kelvin equals temperature in degrees Celsius plus 273'),
        xp({
          title: 'What if? Convert Celsius to kelvin', formula: 'T = t + 273',
          res: ['T', 'Temperature in kelvin', 'K', 't + 273', 0],
          vars: [['t', 'Temperature in Celsius', '°C', -50, 150, 1, 25]],
          notes: [['t', 'Every degree Celsius up is exactly one kelvin up — the two scales have the same step size.', 'Lowering t by one degree lowers T by one kelvin; only the starting point differs.']],
          mistakes: [['Subtracting 273 when going from °C to K', 'Kelvin numbers are always bigger: add 273 to go from °C to K, subtract to go back.'], ['Writing "°K"', 'The kelvin unit has no degree sign: write 300 K, not 300 °K.']],
          real: 'Room temperature of about 27 °C is 300 K; water boils at 373 K.',
        }),
        keys('Particles attract each other; attraction is strongest in solids.', 'Heating overcomes attraction → solid melts, liquid boils.', 'Temperature stays constant during a change of state (latent heat).', 'T(K) = t(°C) + 273.'),
        remember('Melting point of ice = 0 °C = 273 K. Boiling point of water = 100 °C = 373 K.'),
      ],
      examples: [
        ex('Convert 37 °C (normal body temperature) to kelvin.', ['T = t + 273', 'T = 37 + 273'], '310 K'),
        ex('Convert 250 K to degrees Celsius.', ['t = T − 273', 't = 250 − 273'], '−23 °C'),
        ex('Why does the temperature of melting ice stay at 0 °C even though we keep heating it?', ['The heat supplied breaks the attraction between particles.', 'This latent heat does not raise the temperature.', 'Only after all ice has melted does the temperature rise.'], 'The heat is used as latent heat to change state.'),
      ],
      practice: [
        tp('to-k', (r) => {
          const t = r.pick([-40, -10, 0, 15, 25, 27, 37, 50, 80, 100, 127]);
          const back = r.next() < 0.4;
          if (back) return numQ(`Convert ${t + 273} K to degrees Celsius.`, t, '°C', ['t = T − 273', `t = ${t + 273} − 273`], [`t = ${t + 273} − 273 = ${t} °C`], [{ when: `${t + 546} °C`, explain: 'To go from kelvin to Celsius, subtract 273 — do not add it.' }]);
          return numQ(`Convert ${t} °C to kelvin. (Type just the number of kelvin.)`, t + 273, undefined, ['T = t + 273', `T = ${t} + 273`], [`T = ${t} + 273 = ${t + 273} K`], [{ when: String(t - 273), explain: 'Kelvin values are larger: add 273, do not subtract.' }]);
        }),
        mcq('change', 'Think about what heat does to the particles.', [
          ['Changing directly from solid to gas without becoming liquid is called…', 'Sublimation', ['Evaporation', 'Condensation', 'Melting'], 'Camphor does this.', 'Sublimation skips the liquid state.'],
          ['During melting, the temperature of ice…', 'Stays at 0 °C until all ice melts', ['Rises steadily', 'Falls', 'Jumps to 100 °C'], 'Where does the heat go?', 'The heat is used to overcome particle attraction (latent heat), so temperature is constant.'],
          ['Which substance sublimes?', 'Camphor', ['Common salt', 'Sugar', 'Wax'], 'Think of things that vanish without melting.', 'Camphor turns straight into vapour on heating.'],
          ['The SI unit of temperature is…', 'Kelvin (K)', ['Degree Celsius', 'Degree Fahrenheit', 'Joule'], 'Its zero is the coldest possible temperature.', 'Kelvin is the SI unit; 0 K = −273 °C.'],
          ['An iron nail is harder to break than a chalk piece because…', 'Attraction between its particles is stronger', ['It has no particles', 'It is lighter', 'Its particles move faster'], 'Particles attract each other with different strengths.', 'Stronger forces of attraction make a solid harder to break.'],
          ['Gases can be liquefied by…', 'Applying pressure and lowering temperature', ['Heating them', 'Reducing pressure', 'Stirring them'], 'Push particles closer and slow them down.', 'High pressure and cooling bring gas particles close enough to form a liquid.'],
        ]),
        orderT('order', 'Put the changes in order as ice is heated steadily from −10 °C to 110 °C.', ['Ice warms up to 0 °C', 'Ice melts at 0 °C', 'Water warms from 0 °C to 100 °C', 'Water boils at 100 °C', 'Steam heats above 100 °C'], ['Temperature is constant at each change of state.', 'Melting comes before boiling.'], 'Heat → warm solid → melt (constant T) → warm liquid → boil (constant T) → warm gas.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Motion
// =====================================================================================
const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [30, 40, 50], [60, 80, 100]];
const AVG_PAIRS: [number, number, number][] = [[30, 60, 40], [40, 60, 48], [20, 30, 24], [60, 90, 72], [10, 15, 12], [30, 70, 42], [20, 60, 30], [40, 120, 60]];

const ch2: USpec = {
  id: 'ts9.ps.ch2', subject: 'physics', title: 'Motion', source: src(2),
  objectives: [
    {
      id: 'ts9.ps.motion.displacement', title: 'Rest and motion are relative; distance and displacement', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        h('Are you moving right now?'),
        photo('🚆', 'Sitting in a moving train, your friend in the next seat is at rest with respect to you, but moving with respect to the platform.'),
        p('An object is in motion if its position changes with time compared to some reference point. Whether something is "at rest" or "moving" depends on which reference you choose. A passenger is at rest relative to the train but moving relative to the trees outside. So rest and motion are relative.'),
        def('Distance', 'The total length of the path actually travelled. It has only size (magnitude), so it is a scalar. It can never decrease or be negative.'),
        def('Displacement', 'The shortest straight-line length from the starting point to the final point, together with its direction. It is a vector. It can be zero even when distance is not.'),
        p('If Ravi walks 4 m east and then 3 m north, the distance is 4 + 3 = 7 m. His displacement is the straight line from start to end: by Pythagoras, √(4² + 3²) = 5 m, towards the north-east.'),
        f('displacement = √(a² + b²)  (for a walk of a, then b at right angles)', 'displacement equals the square root of a squared plus b squared'),
        xp({
          title: 'What if? Walk east, then turn north', formula: 's = √(a² + b²)',
          res: ['s', 'Displacement (size)', 'm', 'sqrt(a^2 + b^2)', 1],
          vars: [['a', 'Distance walked east', 'm', 0, 100, 1, 40], ['b', 'Distance walked north', 'm', 0, 100, 1, 30]],
          notes: [['a', 'A longer first leg pushes the end point farther away, so displacement grows — but always less than the total distance a + b.', 'A shorter first leg brings the end point closer to the start.'], ['b', 'Walking further north increases displacement, but by less than the extra walking.', 'If b becomes 0, displacement equals the distance walked east.']],
          mistakes: [['Adding the legs: 40 + 30 = 70 m', 'That is the distance. Displacement is the straight line from start to finish, found with Pythagoras: 50 m.'], ['Forgetting the direction', 'Displacement is a vector — say "50 m towards north-east", not just "50 m".']],
          real: 'A delivery rider in Hyderabad may drive 7 km through streets (distance) to reach a shop only 4 km away in a straight line (displacement).',
        }),
        keys('Rest and motion depend on the reference point.', 'Distance = path length (scalar).', 'Displacement = shortest start-to-end length with direction (vector).', 'Displacement ≤ distance; equal only for straight-line motion in one direction.'),
        remember('One full round of a circular track: distance = 2πr, displacement = 0 (you are back at the start).'),
      ],
      examples: [
        ex('Kavya runs half a lap of a circular track of radius 35 m. Find the distance and displacement. (π = 22/7)', ['Distance = half the circumference = πr = 22/7 × 35 = 110 m', 'She ends at the opposite end of a diameter.', 'Displacement = diameter = 2r = 70 m'], 'Distance 110 m; displacement 70 m'),
        ex('A boy walks 12 m east, then 5 m north. Find his distance and displacement.', ['Distance = 12 + 5 = 17 m', 'Displacement = √(12² + 5²) = √169 = 13 m'], 'Distance 17 m; displacement 13 m north-east of start'),
      ],
      practice: [
        tp('pyth', (r) => {
          const [a, b, c] = r.pick(TRIPLES);
          const name = who(r);
          return numQ(`${name} walks ${a} m east and then ${b} m north. Find the size of the displacement.`, c, 'm',
            ['Draw the path: the two legs form a right angle.', 'Displacement = √(a² + b²)'],
            [`Displacement = √(${a}² + ${b}²) = √${a * a + b * b} = ${c} m`, `(The distance walked is ${a + b} m.)`],
            [{ when: `${a + b} m`, explain: `${a + b} m is the distance. Displacement is the straight line from start to end.` }]);
        }),
        tp('line', (r) => {
          const a = r.pick([20, 30, 40, 50, 60, 80]);
          const b = r.pick([10, 15, 25, 35]);
          const askDist = r.next() < 0.5;
          const ans = askDist ? a + b : a - b;
          return numQ(`A cyclist rides ${a} m due east along a straight road and then ${b} m due west. Find the ${askDist ? 'distance travelled' : 'size of the displacement'}.`, ans, 'm',
            ['Distance adds every metre travelled.', 'Displacement only cares where you end up: east minus west.'],
            [askDist ? `Distance = ${a} + ${b} = ${ans} m` : `Displacement = ${a} − ${b} = ${ans} m towards east`],
            [{ when: `${askDist ? a - b : a + b} m`, explain: askDist ? 'For distance add both parts — the direction does not matter.' : 'For displacement the westward part cancels some of the eastward part: subtract.' }]);
        }),
        mcq('concept', 'Distance is the path; displacement is the shortcut with direction.', [
          ['A passenger sits in a moving bus. Relative to the bus driver, the passenger is…', 'At rest', ['Moving forward', 'Moving backward', 'Accelerating'], 'Does the passenger\'s position change compared to the driver?', 'Their positions do not change relative to each other, so the passenger is at rest relative to the driver.'],
          ['An athlete completes one full lap of a 400 m track. The displacement is…', '0 m', ['400 m', '200 m', '800 m'], 'Where does the athlete finish?', 'Start and finish are the same point, so displacement is zero.'],
          ['Which quantity is a vector?', 'Displacement', ['Distance', 'Speed', 'Time'], 'Which one needs a direction?', 'Displacement has both size and direction.'],
          ['Can displacement be greater than distance?', 'No, never', ['Yes, always', 'Only on curved paths', 'Only for fast objects'], 'The straight line is the shortest route.', 'The straight line between two points is the shortest path, so displacement ≤ distance.'],
          ['When are distance and displacement equal in size?', 'When motion is along a straight line in one direction', ['Always', 'On a circular track', 'When the object returns to start'], 'No turning back, no curving.', 'Only straight-line motion without reversing gives equal values.'],
          ['"The Sun moves across the sky" — this motion is really relative to…', 'The rotating Earth', ['The Moon', 'Other stars', 'Nothing — the Sun is fixed'], 'Who is actually turning?', 'The Sun appears to move because we observe it from the rotating Earth.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.motion.speed', title: 'Speed, velocity, averages and uniform / non-uniform motion', prereqs: ['ts9.ps.motion.displacement'],
      activities: ['lab:motion'],
      intro: [
        h('How fast — and which way?'),
        photo('🚌', 'A TSRTC bus from Hyderabad to Warangal speeds up, slows down and stops at signals; its speedometer reading keeps changing.'),
        def('Speed', 'Distance travelled per unit time. SI unit: metre per second (m/s). Speed is a scalar.'),
        def('Velocity', 'Displacement per unit time, i.e. speed in a stated direction. It is a vector, also measured in m/s.'),
        p('Speed rarely stays constant on a real journey, so we often use average values:'),
        f('average speed = total distance ÷ total time', 'average speed equals total distance divided by total time'),
        xp({
          title: 'What if? Change the trip', formula: 'v_avg = d / t',
          res: ['v', 'Average speed', 'km/h', 'd / t', 1],
          vars: [['d', 'Total distance', 'km', 10, 300, 5, 120], ['t', 'Total time', 'h', 0.5, 8, 0.5, 3]],
          notes: [['d', 'More distance in the same time means a higher average speed.', 'Less distance in the same time means a lower average speed.'], ['t', 'Taking longer for the same trip lowers the average speed — stops count as time too.', 'Finishing sooner raises the average speed.']],
          mistakes: [['Averaging the two speeds: (30 + 60)/2 = 45', 'This only works if equal TIMES are spent at each speed. For equal distances, divide total distance by total time.'], ['Leaving out stop time', 'Average speed uses the TOTAL time, including waiting at signals.']],
          real: 'A 120 km bus trip taking 3 h has an average speed of 40 km/h even if the bus touched 70 km/h on the highway.',
        }),
        f('average velocity = total displacement ÷ total time', 'average velocity equals displacement divided by time'),
        xp({
          title: 'What if? A round trip', formula: 'v_avg = s / t',
          res: ['vel', 'Average velocity', 'm/s', 's / t', 2],
          vars: [['s', 'Displacement', 'm', 0, 500, 10, 200], ['t', 'Time taken', 's', 10, 200, 5, 50]],
          notes: [['s', 'A larger net displacement in the same time means a larger average velocity.', 'If you come back towards the start, displacement shrinks — at 0 the average velocity is 0 even though you moved.']],
          mistakes: [['Using distance instead of displacement', 'A round trip has displacement 0, so average velocity is 0 — but average speed is not.']],
          real: 'A swimmer who swims 50 m and back in 100 s has an average speed of 1 m/s but an average velocity of 0.',
        }),
        def('Uniform motion', 'Equal distances in equal intervals of time along a straight line — constant velocity.'),
        def('Non-uniform motion', 'Unequal distances in equal intervals of time — speed or direction keeps changing (most real motion).'),
        p('Units: to change km/h into m/s, multiply by 5/18 (because 1 km/h = 1000 m ÷ 3600 s). So 72 km/h = 20 m/s.'),
        keys('Speed: scalar. Velocity: vector.', 'Average speed = total distance / total time.', 'Average velocity = displacement / time.', 'km/h × 5/18 = m/s.'),
        remember('For two equal distances at speeds v₁ and v₂, the average speed is 2v₁v₂/(v₁ + v₂) — NOT (v₁ + v₂)/2.'),
      ],
      examples: [
        ex('Teja rides 30 km to Siddipet at 30 km/h and returns at 60 km/h. Find his average speed.', ['Time going = 30/30 = 1 h; returning = 30/60 = 0.5 h', 'Total distance = 60 km; total time = 1.5 h', 'Average speed = 60 ÷ 1.5'], '40 km/h'),
        ex('Convert 54 km/h to m/s.', ['Multiply by 5/18', '54 × 5/18 = 15'], '15 m/s'),
        ex('A car covers 20 m every second for 10 seconds along a straight road. Is the motion uniform?', ['Equal distances (20 m) in equal times (1 s)', 'Straight line, no change of direction'], 'Yes — uniform motion at 20 m/s'),
      ],
      practice: [
        tp('avg', (r) => {
          const [v1, v2, va] = r.pick(AVG_PAIRS);
          const d = v1 * v2 / 10 * r.pick([1, 2]);
          return numQ(`A car travels ${d} km at ${v1} km/h and then another ${d} km at ${v2} km/h. Find its average speed for the whole trip.`, va, 'km/h',
            [`Find each time: t = d / v.`, 'Average speed = total distance ÷ total time.'],
            [`t₁ = ${d}/${v1} = ${rd(d / v1, 3)} h, t₂ = ${d}/${v2} = ${rd(d / v2, 3)} h`, `Average = ${2 * d} ÷ ${rd(d / v1 + d / v2, 3)} = ${va} km/h`],
            [{ when: `${(v1 + v2) / 2} km/h`, explain: 'You averaged the two speeds. More time is spent at the slower speed, so divide total distance by total time.' }]);
        }, 2),
        tp('simple', (r) => {
          const v = r.pick([5, 8, 10, 12, 15, 20, 25]);
          const t = r.pick([4, 6, 10, 20, 30, 40]);
          const d = v * t;
          return numQ(`A ${r.pick(['runner', 'cyclist', 'toy car', 'boat'])} covers ${d} m in ${t} s. Find its average speed.`, v, 'm/s', ['Speed = distance ÷ time.'], [`Speed = ${d} ÷ ${t} = ${v} m/s`], [{ when: `${d * t} m/s`, explain: 'Divide distance by time; do not multiply.' }]);
        }),
        tp('convert', (r) => {
          const k = r.pick([18, 36, 54, 72, 90, 108, 126]);
          return numQ(`Convert ${k} km/h into m/s.`, k * 5 / 18, 'm/s', ['1 km = 1000 m and 1 h = 3600 s.', 'Multiply km/h by 5/18.'], [`${k} × 5/18 = ${k * 5 / 18} m/s`], [{ when: `${rd(k * 18 / 5, 2)} m/s`, explain: 'Use 5/18 (not 18/5) when going from km/h to m/s — the number should get smaller.' }]);
        }),
        mcq('uniform', 'Uniform = equal distances in equal times along a straight line.', [
          ['A ball rolling down a slope covers 1 m, 3 m, 5 m in successive seconds. Its motion is…', 'Non-uniform', ['Uniform', 'At rest', 'Circular'], 'Are the distances equal each second?', 'Different distances in equal times means non-uniform motion.'],
          ['Average velocity of a body returning to its starting point is…', 'Zero', ['Equal to its average speed', 'Infinite', 'Always negative'], 'What is the displacement?', 'Displacement is zero, so average velocity is zero.'],
          ['The SI unit of velocity is…', 'm/s', ['km/h', 'm/s²', 'm'], 'Length ÷ time.', 'Velocity = displacement/time, so m/s.'],
          ['Speed with a direction is called…', 'Velocity', ['Acceleration', 'Distance', 'Displacement'], 'It is a vector.', 'Velocity is speed in a given direction.'],
          ['The odometer of a scooter measures…', 'Distance travelled', ['Displacement', 'Velocity', 'Acceleration'], 'It keeps counting every km.', 'An odometer adds up the path length — distance.'],
          ['A car moves on a circular path at a constant 40 km/h. Its velocity is…', 'Changing, because its direction changes', ['Constant', 'Zero', 'Equal to 40 km/h north'], 'Velocity includes direction.', 'Even with constant speed, a change in direction means the velocity changes.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.motion.equations', title: 'Acceleration, equations of uniformly accelerated motion and sign convention', prereqs: ['ts9.ps.motion.speed'],
      activities: ['lab:motion'],
      intro: [
        h('Speeding up and slowing down'),
        photo('🚗', 'When the signal turns green, a car gains speed every second; when the driver brakes, it loses speed every second.'),
        def('Acceleration', 'The rate of change of velocity: change in velocity ÷ time taken. SI unit: m/s². If the velocity decreases, the acceleration is negative (retardation or deceleration).'),
        f('a = (v − u) / t', 'acceleration equals final velocity minus initial velocity, divided by time'),
        xp({
          title: 'What if? Change how quickly the speed changes', formula: 'a = (v − u)/t',
          res: ['a', 'Acceleration', 'm/s²', '(v - u) / t', 2],
          vars: [['u', 'Initial velocity', 'm/s', 0, 30, 1, 0], ['v', 'Final velocity', 'm/s', 0, 30, 1, 20], ['t', 'Time taken', 's', 1, 20, 1, 5]],
          notes: [['t', 'The same change in velocity spread over more time is a gentler acceleration.', 'Making the same change in less time needs a bigger acceleration.'], ['v', 'A larger final velocity means a larger acceleration.', 'If v drops below u, acceleration becomes negative — the body is slowing down.']],
          mistakes: [['Writing (u − v)/t', 'Always final minus initial. Reversing them flips the sign.'], ['Giving the unit as m/s', 'Acceleration is velocity per second: m/s per s = m/s².']],
          real: 'An auto-rickshaw going from 0 to 10 m/s in 5 s has an acceleration of 2 m/s².',
        }),
        h('Three equations for constant acceleration'),
        p('When the acceleration a stays constant along a straight line, u (initial velocity), v (final velocity), s (displacement) and t (time) are linked by:'),
        f('v = u + at', 'v equals u plus a t'),
        xp({
          title: 'What if? Velocity after some time', formula: 'v = u + at',
          res: ['v', 'Final velocity', 'm/s', 'u + a * t', 1],
          vars: [['u', 'Initial velocity', 'm/s', 0, 30, 1, 5], ['a', 'Acceleration', 'm/s²', -3, 5, 0.5, 2], ['t', 'Time', 's', 0, 10, 1, 4]],
          notes: [['a', 'More acceleration adds more velocity every second.', 'A negative acceleration takes velocity away every second (braking).'], ['t', 'The longer the push lasts, the more velocity is added.', 'Less time, less change from u.']],
          mistakes: [['Using this when acceleration is not constant', 'These equations only hold for uniform acceleration along a straight line.']],
          real: 'A train leaving Kazipet at 2 m/s with a = 0.5 m/s² reaches 2 + 0.5 × 20 = 12 m/s after 20 s.',
        }),
        f('s = ut + ½at²', 's equals u t plus half a t squared'),
        xp({
          title: 'What if? Distance covered while speeding up', formula: 's = ut + ½at²',
          res: ['s', 'Displacement', 'm', 'u * t + 0.5 * a * t^2', 1],
          vars: [['u', 'Initial velocity', 'm/s', 0, 20, 1, 0], ['a', 'Acceleration', 'm/s²', 0, 5, 0.5, 2], ['t', 'Time', 's', 1, 20, 1, 5]],
          notes: [['t', 'Starting from rest, doubling the time makes the distance four times bigger — the body keeps getting faster.', 'Halving the time cuts the distance to a quarter (from rest).'], ['a', 'Doubling a doubles the extra ½at² part of the distance.', 'With a = 0 the body just moves uniformly: s = ut.']],
          mistakes: [['Forgetting the ½', 's = ut + ½at², not ut + at².'], ['Squaring (at) instead of t', 'Only t is squared: ½ × a × t².']],
          real: 'A ball rolling from rest down a smooth slope covers 1, 4, 9, 16 … units of distance after 1, 2, 3, 4 … seconds.',
        }),
        f('v² = u² + 2as', 'v squared equals u squared plus two a s'),
        xp({
          title: 'What if? Stopping distance of a car', formula: 'v² = u² + 2as → s = u²/(2|a|) when v = 0',
          res: ['s', 'Stopping distance', 'm', 'u^2 / (2 * b)', 1],
          vars: [['u', 'Speed before braking', 'm/s', 5, 40, 1, 20], ['b', 'Braking deceleration |a|', 'm/s²', 2, 10, 0.5, 5]],
          notes: [['u', 'Doubling the speed makes the stopping distance FOUR times longer — that is why speed limits matter.', 'Driving slower shortens stopping distance dramatically.'], ['b', 'Better brakes or dry roads (bigger deceleration) shorten the stopping distance.', 'Wet roads or worn tyres reduce deceleration and the car needs more room to stop.']],
          mistakes: [['Using a positive a for braking', 'With the motion taken as positive, braking acceleration is negative: 0 = u² − 2|a|s.']],
          real: 'At 20 m/s (72 km/h) with 5 m/s² braking a car needs 40 m to stop; at 40 m/s it needs 160 m.',
        }),
        h('Sign convention'),
        p('Pick one direction (usually the direction of the initial motion) as positive. Velocities, displacements and accelerations in that direction are +, opposite ones are −. A body slowing down has acceleration opposite to its velocity, so a is negative.'),
        keys('a = (v − u)/t; unit m/s².', 'v = u + at; s = ut + ½at²; v² = u² + 2as.', 'Starting from rest: u = 0. Coming to rest: v = 0.', 'Retardation → negative a.'),
        remember('List u, v, a, s, t first, mark the unknown, then pick the equation that does NOT contain the quantity you neither know nor need.'),
      ],
      examples: [
        ex('A bus starts from rest and reaches 15 m/s in 10 s. Find its acceleration and the distance covered.', ['u = 0, v = 15 m/s, t = 10 s', 'a = (15 − 0)/10 = 1.5 m/s²', 's = ut + ½at² = 0 + ½ × 1.5 × 10² = 75 m'], 'a = 1.5 m/s²; s = 75 m'),
        ex('A car moving at 20 m/s brakes with a retardation of 4 m/s². How far does it go before stopping?', ['u = 20 m/s, v = 0, a = −4 m/s²', 'v² = u² + 2as → 0 = 400 + 2(−4)s', 's = 400/8'], '50 m'),
      ],
      practice: [
        tp('accel', (r) => {
          const u = r.pick([0, 2, 4, 5, 10]);
          const t = r.pick([2, 4, 5, 10]);
          const a = r.pick([0.5, 1, 1.5, 2, 3]);
          const v = u + a * t;
          return numQ(`A scooter's velocity increases from ${u} m/s to ${v} m/s in ${t} s. Find its acceleration.`, a, 'm/s²',
            ['a = (v − u)/t', `a = (${v} − ${u}) / ${t}`], [`a = ${v - u} ÷ ${t} = ${a} m/s²`],
            [{ when: `${rd(v / t, 2)} m/s²`, explain: 'Subtract the initial velocity first: a = (v − u)/t.' }]);
        }),
        tp('suvat-s', (r) => {
          const a = r.pick([1, 2, 3, 4]);
          const t = r.pick([2, 3, 4, 5, 6, 10]);
          const u = r.pick([0, 0, 2, 5]);
          const s = u * t + 0.5 * a * t * t;
          return numQ(`A body starts with velocity ${u} m/s and accelerates uniformly at ${a} m/s² for ${t} s. Find the distance covered.`, s, 'm',
            ['Use s = ut + ½at².', `s = ${u} × ${t} + ½ × ${a} × ${t}²`], [`s = ${u * t} + ${0.5 * a * t * t} = ${s} m`],
            [{ when: `${u * t + a * t * t} m`, explain: 'Remember the ½ in ½at².' }], 0.005);
        }, 2),
        tp('brake', (r) => {
          const u = r.pick([10, 12, 15, 20, 24, 30]);
          const b = r.pick([2, 3, 4, 5, 6]);
          const s = (u * u) / (2 * b);
          return numQ(`A car moving at ${u} m/s brakes with a uniform retardation of ${b} m/s². Find the distance it travels before stopping.`, s, 'm',
            ['v = 0 at the end; a is negative.', 'v² = u² + 2as → s = u²/(2 × retardation)'],
            [`0 = ${u}² − 2 × ${b} × s`, `s = ${u * u} ÷ ${2 * b} = ${rd(s, 2)} m`],
            [{ when: `${rd(-s, 2)} m`, explain: 'Distance travelled forward is positive; the negative sign belongs to the acceleration, not to s.' }], 0.01);
        }, 3),
        mcq('sign', 'Choose a positive direction and stick to it.', [
          ['A car moving forward applies brakes. Its acceleration is…', 'Negative (opposite to motion)', ['Positive', 'Zero', 'Infinite'], 'Velocity decreases.', 'Slowing down means acceleration opposite to velocity — negative.'],
          ['A body "starts from rest". Which value is known?', 'u = 0', ['v = 0', 'a = 0', 's = 0 at the end'], 'Rest at the start.', 'Starting from rest means initial velocity u is zero.'],
          ['The SI unit of acceleration is…', 'm/s²', ['m/s', 'km/h', 'N'], 'Velocity per second.', '(m/s) ÷ s = m/s².'],
          ['Which equation does NOT contain time?', 'v² = u² + 2as', ['v = u + at', 's = ut + ½at²', 'a = (v − u)/t'], 'Look for the missing t.', 'v² = u² + 2as links velocities and distance without t.'],
          ['A body moving with constant velocity has acceleration…', 'Zero', ['Positive', 'Negative', 'Equal to its speed'], 'Velocity does not change.', 'No change in velocity → a = 0.'],
          ['A ball thrown straight up, taking upward as positive, has acceleration…', '−9.8 m/s² (downward)', ['+9.8 m/s²', '0 at all times', 'Changes sign at the top'], 'Gravity always pulls down.', 'Gravity acts downward throughout the flight, so a = −9.8 m/s².'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Laws of motion
// =====================================================================================
const ch3: USpec = {
  id: 'ts9.ps.ch3', subject: 'physics', title: 'Laws of motion', source: src(3),
  objectives: [
    {
      id: 'ts9.ps.laws.inertia', title: 'Newton\'s first law; inertia and mass', prereqs: [],
      activities: ['lab:forces'],
      intro: [
        h('Things like to keep doing what they are doing'),
        photo('🚌', 'When a bus brakes suddenly, standing passengers lurch forward; when it starts suddenly, they fall backward.'),
        p('A ball on the ground does not start rolling by itself, and a rolling ball would keep rolling for ever if nothing — friction, air, a wall — slowed it. Galileo and later Newton realised that a force is needed to CHANGE motion, not to keep it going.'),
        def('Newton\'s first law', 'An object stays at rest, or keeps moving with constant velocity in a straight line, unless an unbalanced external force acts on it.'),
        def('Inertia', 'The natural tendency of an object to resist any change in its state of rest or of uniform motion.'),
        p('The more mass a body has, the greater its inertia. It is much harder to push-start a lorry than a bicycle, and much harder to stop a loaded lorry. Mass is therefore a measure of inertia.'),
        p('Examples: the standing passenger lurches forward on braking because the body tends to keep moving; dust leaves a carpet when it is beaten because the carpet moves but the dust stays at rest; a coin on a card over a glass drops into the glass when the card is flicked away.'),
        keys('No unbalanced force → no change in velocity.', 'Inertia = resistance to change of motion.', 'More mass → more inertia.', 'Seat belts protect us from our own inertia.'),
        remember('The first law is also called the law of inertia. Balanced forces do not change motion.'),
        tip('Try: place a coin on a postcard over a glass. Flick the card sharply sideways — the coin drops straight in.'),
      ],
      examples: [
        ex('Why are seat belts compulsory in cars?', ['When a car stops suddenly, the passenger\'s body tends to keep moving forward (inertia of motion).', 'The belt applies a force that stops the body safely.'], 'They provide the force needed to overcome the body\'s inertia of motion.'),
        ex('Which has more inertia: a 2 kg football or a 5 kg stone of the same size?', ['Inertia depends only on mass.', '5 kg > 2 kg'], 'The 5 kg stone'),
      ],
      practice: [
        mcq('inertia', 'Inertia = the body tries to keep its present state.', [
          ['Dust comes out of a carpet when it is beaten because of…', 'Inertia of rest of the dust', ['Inertia of motion of the dust', 'Gravity only', 'Friction'], 'The carpet moves; does the dust?', 'The carpet moves suddenly but the dust tends to stay at rest, so it separates.'],
          ['Passengers in a bus that suddenly starts fall…', 'Backward', ['Forward', 'Sideways', 'Upward'], 'The feet move with the bus; the upper body…', 'The upper body tends to stay at rest while the feet move forward, so passengers fall backward.'],
          ['Inertia of a body depends on its…', 'Mass', ['Speed', 'Shape', 'Colour'], 'Heavier things are harder to start or stop.', 'Mass is the measure of inertia.'],
          ['According to the first law, a body moving with uniform velocity will…', 'Continue to do so unless an unbalanced force acts', ['Slow down by itself', 'Stop after some time on its own', 'Speed up'], 'Real objects slow because of friction — a force.', 'Without an unbalanced force, velocity does not change.'],
          ['An athlete runs some distance before a long jump to…', 'Use inertia of motion to jump farther', ['Reduce inertia', 'Increase mass', 'Reduce friction'], 'Moving bodies keep moving.', 'The forward motion continues during the jump because of inertia.'],
          ['Which has the greatest inertia?', 'A loaded truck', ['A bicycle', 'A cricket ball', 'A pencil'], 'Biggest mass.', 'The loaded truck has the largest mass, hence greatest inertia.'],
        ]),
        tapT('tap', 'Tap every example that is explained by INERTIA.', [
          ['Coin drops into glass when card is flicked', true], ['Passengers lurch forward when a bus brakes', true], ['Shaking a branch makes mangoes fall', true], ['Hard to push a heavy almirah into motion', true],
          ['A magnet pulling an iron nail', false], ['Water evaporating from a pond', false], ['A balloon floating up', false],
        ], ['Look for a body that resists a change in its motion.', 'Magnet pulls and evaporation are not inertia.'], 'Inertia explains cases where a body tends to stay at rest or keep moving when something around it changes.'),
        matchT('match', 'term to its meaning', [
          ['Inertia', 'Resistance to change in motion'], ['Mass', 'Measure of inertia'], ['Balanced forces', 'Cause no change in motion'],
          ['Unbalanced force', 'Changes velocity'], ['Inertia of rest', 'Body at rest tends to stay at rest'], ['Inertia of motion', 'Moving body tends to keep moving'],
        ], ['Start with inertia of rest and inertia of motion.', 'Balanced forces cancel out.']),
      ],
    },
    {
      id: 'ts9.ps.laws.second', title: 'Momentum and Newton\'s second law (F = ma)', prereqs: ['ts9.ps.laws.inertia'],
      activities: ['lab:forces'],
      intro: [
        h('How much "oomph" does a moving body carry?'),
        photo('⚽', 'A football and a medicine ball rolling at the same speed: you can stop the football with your foot, but the heavier ball is much harder to stop.'),
        def('Momentum (p)', 'The product of mass and velocity: p = mv. SI unit: kg m/s. It is a vector in the direction of velocity.'),
        f('p = m × v', 'momentum equals mass times velocity'),
        xp({
          title: 'What if? Change mass or speed', formula: 'p = mv',
          res: ['p', 'Momentum', 'kg m/s', 'm * v', 1],
          vars: [['m', 'Mass', 'kg', 0.1, 100, 0.1, 5], ['v', 'Velocity', 'm/s', 0, 40, 1, 10]],
          notes: [['m', 'Twice the mass at the same speed carries twice the momentum.', 'A lighter body at the same speed is easier to stop.'], ['v', 'Twice the speed, twice the momentum.', 'At rest (v = 0) a body has no momentum, however heavy.']],
          mistakes: [['Giving momentum in N', 'Momentum is kg × m/s, so its unit is kg m/s.']],
          real: 'A 0.15 kg cricket ball at 40 m/s has 6 kg m/s of momentum — as much as a 60 kg person walking at 0.1 m/s.',
        }),
        def('Newton\'s second law', 'The rate of change of momentum of a body is proportional to the unbalanced force on it and happens in the direction of the force. For constant mass this gives F = ma.'),
        f('F = m × a', 'force equals mass times acceleration'),
        xp({
          title: 'What if? Push different masses', formula: 'F = ma',
          res: ['F', 'Force', 'N', 'm * a', 1],
          vars: [['m', 'Mass', 'kg', 0.5, 2000, 0.5, 50], ['a', 'Acceleration', 'm/s²', 0, 10, 0.1, 2]],
          notes: [['m', 'A heavier body needs more force for the same acceleration.', 'A lighter body needs less force.'], ['a', 'Doubling the acceleration needs double the force.', 'A smaller acceleration needs less force.']],
          mistakes: [['Using weight in newtons as the mass', 'm must be in kilograms. A 50 kg person has mass 50 kg, not 490.'], ['Forgetting that F is the NET (unbalanced) force', 'If friction acts, F in F = ma is applied force minus friction.']],
          real: 'One newton is the force that gives a 1 kg mass an acceleration of 1 m/s².',
        }),
        p('Since a = (v − u)/t, the law can also be written F = (mv − mu)/t: force equals change in momentum divided by time.'),
        keys('p = mv (kg m/s).', 'F = ma; 1 N = 1 kg m/s².', 'F = change in momentum ÷ time.', 'Force and acceleration point the same way.'),
        remember('Second law gives the unit of force: 1 newton = 1 kg × 1 m/s².'),
      ],
      examples: [
        ex('Find the force needed to give a 1200 kg car an acceleration of 2 m/s².', ['F = ma', 'F = 1200 × 2'], '2400 N'),
        ex('A 0.5 kg ball moving at 4 m/s is stopped in 0.2 s. Find the force applied.', ['Change in momentum = 0.5 × 0 − 0.5 × 4 = −2 kg m/s', 'F = −2 ÷ 0.2 = −10 N', 'The minus sign shows the force is opposite to the motion.'], '10 N, opposite to the motion'),
      ],
      practice: [
        tp('fma', (r) => {
          const m = r.pick([2, 5, 10, 20, 50, 250, 800, 1000]);
          const a = r.pick([0.5, 1.5, 2, 3, 4]);
          const mode = r.int(0, 2);
          if (mode === 0) return numQ(`Find the force needed to give a ${m} kg body an acceleration of ${a} m/s².`, m * a, 'N', ['F = ma'], [`F = ${m} × ${a} = ${m * a} N`], [{ when: `${rd(m / a, 2)} N`, explain: 'Multiply mass and acceleration — do not divide.' }]);
          if (mode === 1) return numQ(`A force of ${m * a} N acts on a ${m} kg body. Find its acceleration.`, a, 'm/s²', ['a = F/m'], [`a = ${m * a} ÷ ${m} = ${a} m/s²`]);
          return numQ(`A force of ${m * a} N gives a body an acceleration of ${a} m/s². Find its mass.`, m, 'kg', ['m = F/a'], [`m = ${m * a} ÷ ${a} = ${m} kg`]);
        }),
        tp('mom', (r) => {
          const m = r.pick([0.15, 0.5, 2, 40, 60, 1000]);
          const v = r.pick([2, 4, 5, 10, 20]);
          return numQ(`Find the momentum of a ${m} kg object moving at ${v} m/s.`, rd(m * v, 3), 'kg m/s', ['p = mv'], [`p = ${m} × ${v} = ${rd(m * v, 3)} kg m/s`]);
        }),
        tp('dp', (r) => {
          const m = r.pick([0.2, 0.5, 1, 2]);
          const u = r.pick([5, 10, 20]);
          const t = r.pick([0.1, 0.2, 0.5]);
          const F = rd((m * u) / t, 2);
          return numQ(`A ${m} kg ball moving at ${u} m/s is stopped in ${t} s. Find the size of the average stopping force.`, F, 'N',
            ['F = (mv − mu)/t', 'Final velocity v = 0.'], [`Change in momentum = ${m} × ${u} = ${rd(m * u, 3)} kg m/s`, `F = ${rd(m * u, 3)} ÷ ${t} = ${F} N`],
            [{ when: `${rd(m * u * t, 3)} N`, explain: 'Divide the change in momentum by the time, do not multiply.' }]);
        }, 2),
        mcq('concept', 'F = ma and p = mv.', [
          ['1 newton equals…', '1 kg m/s²', ['1 kg m/s', '1 kg/s²', '1 g cm/s²'], 'F = ma.', 'Mass in kg × acceleration in m/s².'],
          ['The SI unit of momentum is…', 'kg m/s', ['N', 'kg m/s²', 'J'], 'p = mv.', 'kg × m/s = kg m/s.'],
          ['If the net force on a body is doubled (same mass), its acceleration…', 'Doubles', ['Halves', 'Stays the same', 'Becomes four times'], 'a = F/m.', 'a is directly proportional to F.'],
          ['A body of mass 2 kg is at rest. Its momentum is…', '0', ['2 kg m/s', '19.6 kg m/s', 'Cannot say'], 'v = 0.', 'p = m × 0 = 0.'],
          ['Force is the rate of change of…', 'Momentum', ['Mass', 'Distance', 'Speed only'], 'Second law.', 'F = Δp/Δt.'],
          ['Same force on a 1 kg and a 4 kg trolley. The 1 kg trolley\'s acceleration is…', '4 times that of the 4 kg trolley', ['¼ of it', 'Equal', '2 times'], 'a = F/m.', 'Acceleration is inversely proportional to mass.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.laws.third', title: 'Third law of motion and conservation of momentum', prereqs: ['ts9.ps.laws.second'],
      activities: ['lab:forces'],
      intro: [
        h('Forces come in pairs'),
        photo('⛵', 'Step off a small boat onto the bank and the boat moves back away from the shore.'),
        def('Newton\'s third law', 'When one body exerts a force on a second body, the second body exerts an equal and opposite force on the first. Action and reaction act on DIFFERENT bodies, at the same instant.'),
        p('When you walk, your foot pushes the ground backward; the ground pushes you forward. A rocket pushes hot gases backward; the gases push the rocket forward. When a gun fires, the bullet is pushed forward and the gun is pushed back (recoil).'),
        h('Conservation of momentum'),
        p('During a collision or explosion the two bodies push each other with equal and opposite forces for the same time. So the momentum gained by one equals the momentum lost by the other. The total momentum of the system does not change, provided no external force acts.'),
        def('Law of conservation of momentum', 'In the absence of an external unbalanced force, the total momentum of a system of bodies remains constant: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.'),
        f('m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', 'total momentum before equals total momentum after'),
        xp({
          title: 'What if? Gun recoil', formula: 'm_b v_b + m_g v_g = 0 → recoil speed = m_b v_b / m_g',
          res: ['vg', 'Recoil speed of gun', 'm/s', 'mb * vb / mg', 2],
          vars: [['mb', 'Mass of bullet', 'kg', 0.005, 0.1, 0.005, 0.02], ['vb', 'Speed of bullet', 'm/s', 50, 800, 10, 400], ['mg', 'Mass of gun', 'kg', 1, 10, 0.5, 4]],
          notes: [['mg', 'A heavier gun recoils more slowly for the same bullet — that is why rifles are heavy.', 'A light gun kicks back hard.'], ['vb', 'A faster bullet carries more momentum forward, so the gun must carry more backward.', 'A slower bullet gives a gentler recoil.']],
          mistakes: [['Thinking action and reaction cancel', 'They act on DIFFERENT bodies (bullet and gun), so they do not cancel each other.'], ['Forgetting the direction', 'The gun moves opposite to the bullet: its velocity is negative if the bullet\'s is positive.']],
          real: 'A 0.02 kg bullet fired at 400 m/s from a 4 kg gun makes the gun recoil at 2 m/s.',
        }),
        keys('Action = reaction, opposite in direction, on different bodies.', 'Total momentum before = total momentum after (no external force).', 'Recoil: m_g v_g = −m_b v_b.', 'Bodies that stick together: (m₁ + m₂)v = m₁u₁ + m₂u₂.'),
        remember('Before firing, gun and bullet are at rest: total momentum = 0. After firing it must still be 0.'),
      ],
      examples: [
        ex('A 4 kg gun fires a 20 g bullet at 300 m/s. Find the recoil velocity of the gun.', ['m_b = 0.02 kg, v_b = 300 m/s, m_g = 4 kg', '0 = 0.02 × 300 + 4 × v_g', 'v_g = −6/4 = −1.5 m/s'], '1.5 m/s backward'),
        ex('A 2 kg trolley moving at 3 m/s hits a 1 kg trolley at rest and they stick together. Find their common velocity.', ['Before: 2 × 3 + 1 × 0 = 6 kg m/s', 'After: (2 + 1) × v = 6', 'v = 2 m/s'], '2 m/s in the original direction'),
      ],
      practice: [
        tp('recoil', (r) => {
          const mb = r.pick([0.01, 0.02, 0.05]);
          const vb = r.pick([200, 300, 400, 500]);
          const mg = r.pick([2, 4, 5]);
          const v = rd((mb * vb) / mg, 3);
          return numQ(`A gun of mass ${mg} kg fires a bullet of mass ${mb * 1000} g with a speed of ${vb} m/s. Find the recoil speed of the gun.`, v, 'm/s',
            ['Total momentum before firing = 0.', `Convert ${mb * 1000} g to kg first.`], [`0 = ${mb} × ${vb} + ${mg} × v`, `v = −${rd(mb * vb, 3)}/${mg} = −${v} m/s`, `Recoil speed ${v} m/s, opposite to the bullet.`],
            [{ when: `${rd(mb * 1000 * vb / mg, 2)} m/s`, explain: 'Convert grams to kilograms (÷ 1000) before using the momentum equation.' }]);
        }, 2),
        tp('stick', (r) => {
          const m1 = r.pick([1, 2, 3, 4]);
          const m2 = r.pick([1, 2, 4, 6]);
          const u = r.pick([2, 3, 5, 6, 10]);
          const v = rd((m1 * u) / (m1 + m2), 3);
          return numQ(`A ${m1} kg trolley moving at ${u} m/s collides with a ${m2} kg trolley at rest. They stick together. Find their common velocity.`, v, 'm/s',
            ['Momentum before = momentum after.', '(m₁ + m₂) v = m₁u₁'], [`Before: ${m1} × ${u} = ${m1 * u} kg m/s`, `v = ${m1 * u} ÷ ${m1 + m2} = ${v} m/s`],
            [{ when: `${u} m/s`, explain: 'The combined mass is larger, so the common velocity must be smaller than the original velocity.' }]);
        }, 2),
        mcq('third', 'Action and reaction act on different bodies.', [
          ['When a rocket is launched, the force that pushes it up comes from…', 'The reaction of the exhaust gases pushed down', ['The air below pushing up', 'Gravity', 'The launch pad only'], 'The rocket pushes gas backward.', 'The rocket pushes gases down; the gases push the rocket up (third law).'],
          ['Action and reaction forces…', 'Act on different bodies', ['Act on the same body', 'Cancel each other', 'Are unequal'], 'Who pushes whom?', 'They act on two different bodies, so they never cancel.'],
          ['A swimmer pushes water backward. The water…', 'Pushes the swimmer forward', ['Pushes the swimmer backward', 'Does nothing', 'Pulls the swimmer down'], 'Equal and opposite.', 'The reaction of the water pushes the swimmer forward.'],
          ['Momentum is conserved when…', 'No external unbalanced force acts on the system', ['Bodies move slowly', 'Friction is large', 'Only one body moves'], 'Condition for the law.', 'Only external forces can change the total momentum.'],
          ['A man jumps from a boat to the shore. The boat…', 'Moves away from the shore', ['Moves towards the shore', 'Stays still', 'Sinks'], 'He pushes the boat backward.', 'His forward push on the boat creates a backward reaction on the boat.'],
          ['Two equal-mass balls moving towards each other at equal speeds collide and stick. Their final velocity is…', '0', ['Double the speed', 'The same speed', 'Half the speed'], 'Total momentum before?', 'Equal and opposite momenta add to zero, so the combined mass stops.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.laws.impulse', title: 'Impulse — force over a time', prereqs: ['ts9.ps.laws.second'],
      intro: [
        h('Why do fielders pull their hands back?'),
        photo('🏀', 'Catching a hard pass, a player lets the hands move back with the ball. The ball takes longer to stop, so it stings less. Cricket fielders do the same.'),
        def('Impulse', 'The product of a force and the time for which it acts: J = F × t. It equals the change in momentum it produces. SI unit: N s (same as kg m/s).'),
        f('Impulse = F × t = mv − mu', 'impulse equals force times time equals change in momentum'),
        p('For a given change in momentum (for example, stopping a ball), the impulse is fixed. If the time is made longer, the force becomes smaller. That is the secret of safety design: airbags, helmets, sand pits for long jump, packing straw around glassware and the "give" when catching a ball all increase the stopping time.'),
        xp({
          title: 'What if? Stop a ball more slowly', formula: 'F = Δp / t',
          res: ['F', 'Average force on the hands', 'N', 'dp / t', 1],
          vars: [['dp', 'Change in momentum', 'kg m/s', 1, 20, 0.5, 6], ['t', 'Time taken to stop', 's', 0.01, 1, 0.01, 0.1]],
          notes: [['t', 'Doubling the stopping time halves the force — pulling the hands back makes catching safer.', 'Stopping the ball in a shorter time needs a much larger force — that is what hurts.'], ['dp', 'A faster or heavier ball has more momentum to remove, so the force rises.', 'A slower ball needs less force to stop.']],
          mistakes: [['Thinking moving the hands back reduces the momentum change', 'The ball still goes from moving to rest: Δp is the same. Only the TIME increases, which lowers the force.']],
          real: 'A cricket ball with 6 kg m/s of momentum stopped in 0.01 s needs 600 N; stopped in 0.1 s it needs only 60 N.',
        }),
        keys('Impulse = Ft = change in momentum.', 'Unit: N s = kg m/s.', 'Longer stopping time → smaller force.', 'Used in airbags, helmets, sand pits, catching.'),
        remember('Impulse depends on both force AND time — a small force for a long time can give the same impulse as a big force for a short time.'),
      ],
      examples: [
        ex('A force of 50 N acts on a ball for 0.2 s. Find the impulse.', ['J = F × t', 'J = 50 × 0.2'], '10 N s (10 kg m/s)'),
        ex('A 0.15 kg ball moving at 20 m/s is caught in 0.1 s by Arjun. If he had stopped it in 0.01 s, how much larger would the force be?', ['Δp = 0.15 × 20 = 3 kg m/s', 'F = 3/0.1 = 30 N; F = 3/0.01 = 300 N', '300 ÷ 30 = 10'], '10 times larger (300 N instead of 30 N)'),
      ],
      practice: [
        tp('j', (r) => {
          const F = r.pick([10, 20, 50, 100, 250]);
          const t = r.pick([0.01, 0.05, 0.1, 0.2, 0.5]);
          return numQ(`A bat applies an average force of ${F} N on a ball for ${t} s. Find the impulse.`, rd(F * t, 3), 'kg m/s',
            ['Impulse = F × t', 'N s and kg m/s are the same unit.'], [`J = ${F} × ${t} = ${rd(F * t, 3)} N s (kg m/s)`],
            [{ when: `${rd(F / t, 2)} kg m/s`, explain: 'Multiply force by time — impulse is F × t.' }]);
        }),
        tp('force', (r) => {
          const m = r.pick([0.1, 0.15, 0.2, 0.4]);
          const v = r.pick([10, 15, 20, 30]);
          const t = r.pick([0.02, 0.05, 0.1, 0.2]);
          const F = rd((m * v) / t, 2);
          return numQ(`A ${m} kg ball moving at ${v} m/s is caught and brought to rest in ${t} s. Find the average force on the catcher's hands.`, F, 'N',
            ['Impulse = change in momentum = m × v here.', 'F = impulse ÷ time.'], [`Δp = ${m} × ${v} = ${rd(m * v, 3)} kg m/s`, `F = ${rd(m * v, 3)} ÷ ${t} = ${F} N`]);
        }, 2),
        mcq('safety', 'Longer time → smaller force for the same momentum change.', [
          ['Airbags in cars reduce injury because they…', 'Increase the time over which the person stops', ['Reduce the person\'s momentum change', 'Increase the force', 'Make the car stop faster'], 'Impulse is fixed; what can change?', 'Same Δp spread over a longer time gives a smaller force.'],
          ['A long jumper lands in a sand pit so that…', 'The stopping time increases and the force decreases', ['The momentum increases', 'The jump is longer', 'The force increases'], 'Sand gives way slowly.', 'Sand makes stopping slower, reducing force on the body.'],
          ['The SI unit of impulse is…', 'N s', ['N', 'N/s', 'J'], 'Force × time.', 'Impulse = F × t, so N s (equal to kg m/s).'],
          ['Impulse is equal to the…', 'Change in momentum', ['Change in mass', 'Change in velocity only', 'Work done'], 'F t = m(v − u).', 'From the second law, Ft = mv − mu.'],
          ['Glassware is packed in straw or paper because it…', 'Increases the time of impact if jerked', ['Makes it lighter', 'Increases the force', 'Prevents momentum'], 'Cushioning.', 'Packing lengthens impact time, so forces on the glass are smaller.'],
          ['Karate experts break a brick with a very quick strike because…', 'A short contact time gives a very large force', ['A long time gives a large force', 'The brick has no inertia', 'Impulse is zero'], 'F = Δp/t.', 'A small time in the denominator makes the force very large.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Refraction of light at plane surfaces
// =====================================================================================
const MEDIA: [string, number][] = [['water', 1.33], ['kerosene', 1.44], ['crown glass', 1.52], ['glass', 1.5], ['diamond', 2.42], ['ice', 1.31], ['turpentine oil', 1.47], ['rock salt', 1.54]];
const SNELL: [number, number][] = [[0.6, 0.4], [0.75, 0.5], [0.9, 0.6], [0.8, 0.5], [0.66, 0.44], [0.5, 0.25], [0.84, 0.6], [0.96, 0.64]];

const ch4: USpec = {
  id: 'ts9.ps.ch4', subject: 'physics', title: 'Refraction of light at plane surfaces', source: src(4),
  objectives: [
    {
      id: 'ts9.ps.refraction.index', title: 'Refraction and refractive index', prereqs: [],
      activities: ['lab:light'],
      intro: [
        h('The bent pencil'),
        photo('🥛', 'A pencil dipped slanting into a glass of water looks broken at the water surface.'),
        p('Light travels in straight lines in one medium. When it passes at an angle from one transparent medium into another — air to water, air to glass — it changes direction at the boundary. This bending is called refraction.'),
        p('Why does it bend? Light travels at different speeds in different media: about 3 × 10⁸ m/s in vacuum (and nearly the same in air), slower in water, slower still in glass. When one side of a beam enters the slower medium first, it slows down first and the beam swings round, like a marching row of students stepping from a road onto sand.'),
        def('Refraction', 'The change in direction of light when it passes obliquely from one transparent medium into another, caused by the change in its speed.'),
        def('Absolute refractive index (n)', 'The ratio of the speed of light in vacuum to its speed in the medium: n = c/v. It has no unit and is always greater than 1 for a material medium.'),
        f('n = c / v', 'refractive index equals speed of light in vacuum divided by speed of light in the medium'),
        xp({
          title: 'What if? Light slows down in a medium', formula: 'v = c / n',
          res: ['v', 'Speed of light in the medium (× 10⁸ m/s)', '× 10⁸ m/s', '3 / n', 2],
          vars: [['n', 'Refractive index', '', 1, 2.5, 0.01, 1.5]],
          notes: [['n', 'A larger refractive index means light travels more slowly — the medium is optically denser.', 'A smaller refractive index means light travels faster; at n = 1 it moves as fast as in vacuum.']],
          mistakes: [['Thinking "optically denser" means heavier', 'Optical density is about the speed of light, not mass density. Kerosene (n = 1.44) is optically denser than water (1.33) but floats on it.'], ['Getting n less than 1', 'Light is fastest in vacuum, so n = c/v is always 1 or more.']],
          real: 'In glass (n = 1.5) light slows to 2 × 10⁸ m/s; in diamond (n = 2.42) to about 1.24 × 10⁸ m/s.',
        }),
        def('Relative refractive index', 'The refractive index of medium 2 with respect to medium 1: n₂₁ = n₂/n₁ = v₁/v₂.'),
        f('n₂₁ = n₂ / n₁ = v₁ / v₂', 'relative refractive index equals n two over n one equals v one over v two'),
        xp({
          title: 'What if? Light goes from one medium into another', formula: 'n₂₁ = n₂ / n₁',
          res: ['n21', 'Relative refractive index', '', 'n2 / n1', 3],
          vars: [['n1', 'Index of first medium', '', 1, 2.5, 0.01, 1.33], ['n2', 'Index of second medium', '', 1, 2.5, 0.01, 1.5]],
          notes: [['n2', 'If the second medium is denser (n₂ > n₁), n₂₁ > 1 and light bends towards the normal.', 'If the second medium is rarer, n₂₁ < 1 and light bends away from the normal.']],
          mistakes: [['Dividing the wrong way round', '"Index of 2 with respect to 1" means n₂ on top: n₂₁ = n₂/n₁.']],
          real: 'Glass with respect to water: 1.5/1.33 ≈ 1.13, so light bends only a little going from water into glass.',
        }),
        p('Rarer → denser (e.g. air to glass): the ray bends TOWARDS the normal. Denser → rarer: it bends AWAY from the normal. A ray along the normal (angle of incidence 0°) goes straight through without bending.'),
        keys('Refraction is caused by a change in the speed of light.', 'n = c/v; no unit; n ≥ 1.', 'Rarer → denser: towards the normal.', 'Denser → rarer: away from the normal.'),
        remember('Typical values: air 1.0003, water 1.33, glass 1.5, diamond 2.42.'),
      ],
      examples: [
        ex('The speed of light in a glass is 2 × 10⁸ m/s. Find its refractive index.', ['n = c/v', 'n = (3 × 10⁸) ÷ (2 × 10⁸)'], 'n = 1.5'),
        ex('Find the speed of light in water (n = 1.33).', ['v = c/n', 'v = 3 × 10⁸ ÷ 1.33 ≈ 2.26 × 10⁸ m/s'], 'About 2.26 × 10⁸ m/s'),
      ],
      practice: [
        tp('speed', (r) => {
          const [name, n] = r.pick(MEDIA);
          const v = rd(3 / n, 2);
          return numQ(`The refractive index of ${name} is ${n}. Find the speed of light in it, in units of 10⁸ m/s (type just the number, e.g. 2.1).`, v, undefined,
            ['v = c/n with c = 3 × 10⁸ m/s.', `v = 3 ÷ ${n} (× 10⁸ m/s)`], [`v = 3 × 10⁸ ÷ ${n} ≈ ${v} × 10⁸ m/s`],
            [{ when: String(rd(3 * n, 2)), explain: 'Light slows down in a medium, so divide c by n — the answer must be less than 3.' }], 0.02);
        }),
        tp('n', (r) => {
          const v = r.pick([2, 2.25, 1.5, 2.4, 1.25, 1.2]);
          const n = rd(3 / v, 3);
          return numQ(`Light travels at ${v} × 10⁸ m/s in a transparent material. Find its refractive index.`, n, undefined, ['n = c/v', `n = 3 ÷ ${v}`], [`n = 3 × 10⁸ ÷ (${v} × 10⁸) = ${n}`], [{ when: String(rd(v / 3, 3)), explain: 'Put c on top: n = c/v, which is always more than 1.' }], 0.01);
        }),
        tp('rel', (r) => {
          const a = r.pick(MEDIA), b = r.pick(MEDIA.filter((m) => m[0] !== a[0]));
          const n = rd(b[1] / a[1], 3);
          return numQ(`Find the refractive index of ${b[0]} (n = ${b[1]}) with respect to ${a[0]} (n = ${a[1]}). Give 2 or 3 decimals.`, n, undefined,
            ['n₂₁ = n₂ / n₁', `Medium 2 is ${b[0]}; medium 1 is ${a[0]}.`], [`n = ${b[1]} ÷ ${a[1]} ≈ ${n}`],
            [{ when: String(rd(a[1] / b[1], 3)), explain: 'You divided the wrong way: the medium named first goes on top.' }], 0.01);
        }, 2),
        mcq('concept', 'Speed changes cause the bending.', [
          ['When light goes from air into glass obliquely, it bends…', 'Towards the normal', ['Away from the normal', 'Not at all', 'Back into air always'], 'Rarer to denser.', 'Light slows in glass and bends towards the normal.'],
          ['A ray falls along the normal on a glass surface. It…', 'Goes straight without bending', ['Bends towards the normal', 'Bends away from the normal', 'Is totally reflected'], 'Angle of incidence is 0°.', 'With i = 0°, r = 0°: no change in direction.'],
          ['The refractive index of a medium has…', 'No unit', ['Unit m/s', 'Unit metre', 'Unit degree'], 'It is a ratio of two speeds.', 'Speed ÷ speed cancels units.'],
          ['In which medium does light travel slowest?', 'Diamond (n = 2.42)', ['Water (n = 1.33)', 'Glass (n = 1.5)', 'Air (n ≈ 1)'], 'Larger n → slower.', 'v = c/n is smallest for the largest n.'],
          ['The main cause of refraction is…', 'Change in speed of light in different media', ['Change in colour of light', 'Reflection at the surface', 'Light getting absorbed'], 'Why does the beam swing?', 'Different speeds in the two media make the ray change direction.'],
          ['A coin at the bottom of a bucket of water looks raised because…', 'Light from it bends away from the normal as it leaves water', ['Water magnifies everything', 'Light bends towards the normal in air', 'The coin floats up'], 'Water → air is denser → rarer.', 'Rays bend away from the normal, so they seem to come from a higher point.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.refraction.snell', title: 'Snell\'s law and refraction through a glass slab', prereqs: ['ts9.ps.refraction.index'],
      activities: ['lab:light'],
      intro: [
        h('A rule for the bending'),
        photo('🔬', 'In the lab, a rectangular glass slab, a sheet of paper and four pins are enough to measure how much glass bends light.'),
        p('Angles are always measured from the NORMAL — the line drawn at 90° to the surface where the ray strikes. The angle of incidence i is between the incident ray and the normal; the angle of refraction r is between the refracted ray and the normal.'),
        def('Laws of refraction', '1. The incident ray, the refracted ray and the normal at the point of incidence lie in the same plane. 2. For a given pair of media, n₁ sin i = n₂ sin r (Snell\'s law). For light from air (n₁ ≈ 1): sin i / sin r = n, a constant.'),
        f('n₁ sin i = n₂ sin r', 'n one sine i equals n two sine r'),
        xp({
          title: 'What if? Change the angle and the material', formula: 'sin r = sin i / n  (light from air into the medium)',
          res: ['sr', 'sin r', '', 'sin(i) / n', 3],
          vars: [['i', 'Angle of incidence', '°', 0, 89, 1, 40], ['n', 'Refractive index of the medium', '', 1, 2.5, 0.01, 1.5]],
          notes: [['i', 'A bigger angle of incidence gives a bigger angle of refraction — but r always stays smaller than i going into a denser medium.', 'At i = 0° the ray goes straight in (sin r = 0).'], ['n', 'A denser medium bends the ray more towards the normal: r gets smaller.', 'With n = 1 there is no bending at all (r = i).']],
          mistakes: [['Measuring angles from the surface', 'Angles of incidence and refraction are measured from the normal, not from the glass surface.'], ['Writing sin i / sin r = n for light going OUT of glass', 'Use the full law n₁ sin i = n₂ sin r: for glass to air, 1.5 sin i = 1 × sin r.']],
          real: 'For i = 30° into glass (n = 1.5), sin r = 0.5/1.5 = 0.33, so r ≈ 19.5°.',
        }),
        h('Through a glass slab'),
        p('When light passes through a rectangular glass slab, it bends towards the normal on entering and away from the normal on leaving. The two surfaces are parallel, so the two bendings undo each other: the emergent ray is PARALLEL to the incident ray, but shifted sideways. This sideways shift is called lateral shift (lateral displacement). It is larger for a thicker slab, a larger angle of incidence and a larger refractive index.'),
        def('Lateral shift', 'The perpendicular distance between the incident ray (extended) and the emergent ray of a parallel-sided slab.'),
        keys('Angles are measured from the normal.', 'Snell\'s law: n₁ sin i = n₂ sin r.', 'Glass slab: emergent ray ∥ incident ray, but laterally shifted.', 'Slab experiment: n = sin i / sin r.'),
        remember('At the second face of the slab, the angle of incidence inside glass equals the first angle of refraction r, and the emergent angle equals the original i.'),
      ],
      examples: [
        ex('Light from air strikes glass at i = 60° (sin 60° ≈ 0.866) and refracts at r = 35.3° (sin r ≈ 0.578). Find n of the glass.', ['n = sin i / sin r', 'n = 0.866 ÷ 0.578'], 'n ≈ 1.5'),
        ex('Light enters water (n = 1.33) from air at i = 30°. Find sin r.', ['1 × sin 30° = 1.33 × sin r', 'sin r = 0.5 ÷ 1.33 ≈ 0.376', 'r ≈ 22°'], 'sin r ≈ 0.376 (r ≈ 22°)'),
      ],
      practice: [
        tp('find-n', (r) => {
          const [si, sr] = r.pick(SNELL);
          const n = rd(si / sr, 3);
          return numQ(`In a glass-slab experiment, a ray from air has sin i = ${si} and the refracted ray has sin r = ${sr}. Find the refractive index of the slab.`, n, undefined,
            ['Snell\'s law from air: n = sin i / sin r.'], [`n = ${si} ÷ ${sr} = ${n}`], [{ when: String(rd(sr / si, 3)), explain: 'Put sin i on top. A denser medium has n > 1.' }], 0.01);
        }),
        tp('find-sinr', (r) => {
          const si = r.pick([0.5, 0.6, 0.75, 0.9, 0.3]);
          const [name, n] = r.pick(MEDIA);
          const sr = rd(si / n, 3);
          return numQ(`Light from air enters ${name} (n = ${n}) with sin i = ${si}. Find sin r (3 decimals).`, sr, undefined,
            ['1 × sin i = n × sin r', `sin r = ${si} ÷ ${n}`], [`sin r = ${si} ÷ ${n} ≈ ${sr}`], [{ when: String(rd(si * n, 3)), explain: 'Divide by n — light bends towards the normal, so sin r must be smaller than sin i.' }], 0.01);
        }, 2),
        mcq('slab', 'Two parallel faces undo each other\'s bending.', [
          ['The emergent ray from a rectangular glass slab is…', 'Parallel to the incident ray', ['Perpendicular to the incident ray', 'Along the normal always', 'Bent towards the base'], 'The faces are parallel.', 'The bending at the two parallel faces is equal and opposite.'],
          ['Lateral shift through a slab increases when…', 'The slab is thicker', ['The slab is thinner', 'The angle of incidence is 0°', 'The refractive index is 1'], 'More glass → more sideways travel.', 'A thicker slab gives the ray more distance to drift sideways.'],
          ['Angles of incidence and refraction are measured from the…', 'Normal', ['Surface', 'Emergent ray', 'Horizontal'], 'A line at 90° to the surface.', 'Both angles are taken from the normal at the point of incidence.'],
          ['If a ray hits a slab at i = 0°, the lateral shift is…', 'Zero', ['Maximum', 'Equal to the thickness', 'Infinite'], 'No bending at all.', 'A ray along the normal is not bent, so there is no shift.'],
          ['The incident ray, refracted ray and normal…', 'Lie in the same plane', ['Are all parallel', 'Are perpendicular to each other', 'Lie in different planes'], 'First law of refraction.', 'All three lie in one plane.'],
          ['Snell\'s law is…', 'n₁ sin i = n₂ sin r', ['n₁ sin r = n₂ sin i', 'n₁ i = n₂ r', 'sin i + sin r = n'], 'Each index pairs with the angle in its own medium.', 'The index of each medium multiplies the sine of the angle in that medium.'],
        ]),
        orderT('expt', 'Arrange the steps to find the refractive index of a glass slab.', [
          'Trace the outline of the slab on paper and draw a normal on one face', 'Draw an incident ray at a chosen angle i and fix two pins on it', 'Look through the opposite face and fix two pins in line with the images of the first two', 'Remove the slab, join the points and draw the refracted ray inside', 'Measure i and r, then calculate n = sin i / sin r',
        ], ['You need the outline before you can draw the normal.', 'Calculation comes last.'], 'Outline → incident ray with pins → sight emergent pins → join to get r → calculate n.', 2),
      ],
    },
    {
      id: 'ts9.ps.refraction.tir', title: 'Critical angle and total internal reflection', prereqs: ['ts9.ps.refraction.snell'],
      activities: ['lab:light'],
      intro: [
        h('When light cannot get out'),
        photo('✨', 'A cut diamond sparkles because light entering it bounces around inside many times before escaping.'),
        p('Send light from a denser medium (glass, water) into a rarer one (air). It bends away from the normal, so the angle of refraction is bigger than the angle of incidence. Increase the angle of incidence: at one particular angle the refracted ray just skims along the surface (r = 90°). That angle of incidence is the critical angle C.'),
        def('Critical angle (C)', 'The angle of incidence in the denser medium for which the angle of refraction in the rarer medium is 90°.'),
        f('sin C = 1 / n', 'sine of the critical angle equals one over the refractive index (denser medium into air)'),
        xp({
          title: 'What if? Change the material', formula: 'sin C = 1/n',
          res: ['sC', 'sin C', '', '1 / n', 3],
          vars: [['n', 'Refractive index of the denser medium', '', 1.05, 2.5, 0.01, 1.5]],
          notes: [['n', 'A larger n makes sin C (and so C) smaller — light gets trapped more easily. Diamond\'s C is only about 24°.', 'A smaller n gives a larger critical angle; water\'s C is about 49°.']],
          mistakes: [['Applying TIR to light going from air into glass', 'TIR only happens when light goes from a DENSER to a RARER medium.'], ['Writing sin C = n', 'sin can never be more than 1; for n > 1 it must be 1/n.']],
          real: 'Glass (n = 1.5): sin C = 0.667, C ≈ 41.8°. Water (n = 1.33): C ≈ 48.8°.',
        }),
        def('Total internal reflection (TIR)', 'When light in a denser medium strikes the boundary with a rarer medium at an angle of incidence greater than the critical angle, no light is refracted; it is all reflected back into the denser medium.'),
        p('Two conditions for TIR: (1) light must travel from a denser to a rarer medium; (2) the angle of incidence must be greater than the critical angle. Unlike a mirror, TIR reflects practically 100% of the light.'),
        keys('Critical angle: r = 90° in the rarer medium.', 'sin C = 1/n (into air).', 'TIR needs denser → rarer AND i > C.', 'Larger n → smaller C.'),
        remember('Glass C ≈ 42°, water C ≈ 49°, diamond C ≈ 24°.'),
      ],
      examples: [
        ex('Find the critical angle for glass of refractive index 1.5 (sin 41.8° ≈ 0.667).', ['sin C = 1/n = 1/1.5 = 0.667', 'C ≈ 41.8°'], 'C ≈ 42°'),
        ex('Light inside water (C ≈ 49°) hits the water surface at 60°. What happens?', ['Light goes from denser (water) to rarer (air).', '60° > 49°, so i > C.'], 'Total internal reflection — the light is reflected back into the water.'),
      ],
      practice: [
        tp('sinc', (r) => {
          const [name, n] = r.pick(MEDIA);
          const s = rd(1 / n, 3);
          const back = r.next() < 0.35;
          if (back) return numQ(`For a material the sine of the critical angle is ${s}. Find its refractive index (2 decimals).`, n, undefined, ['sin C = 1/n, so n = 1/sin C.'], [`n = 1 ÷ ${s} ≈ ${n}`], [], 0.01);
          return numQ(`Find sin C, the sine of the critical angle, for ${name} (n = ${n}) in contact with air. Give 3 decimals.`, s, undefined,
            ['sin C = 1/n'], [`sin C = 1 ÷ ${n} ≈ ${s}`], [{ when: String(n), explain: 'sin C = 1/n, not n — a sine can never be more than 1.' }], 0.01);
        }),
        mcq('tir', 'Check both conditions: denser → rarer, and i > C.', [
          ['Total internal reflection can occur when light goes from…', 'Glass to air', ['Air to glass', 'Air to water', 'Vacuum to glass'], 'Denser to rarer.', 'Only denser → rarer allows TIR.'],
          ['Light in glass (C = 42°) strikes the surface at 30°. It is…', 'Mostly refracted into air', ['Totally internally reflected', 'Absorbed', 'Refracted along the surface'], 'Compare i with C.', '30° < 42°, so the light refracts out (bending away from the normal).'],
          ['At the critical angle, the angle of refraction is…', '90°', ['0°', '45°', 'Equal to C'], 'The refracted ray skims the surface.', 'By definition r = 90° at the critical angle.'],
          ['Which has the smallest critical angle?', 'Diamond', ['Water', 'Glass', 'Ice'], 'Largest n → smallest C.', 'Diamond has n = 2.42, so C ≈ 24°.'],
          ['The critical angle for water is about 49°. Light inside water hits the surface at 70°. What happens?', 'Total internal reflection', ['It passes into air', 'It bends towards the normal', 'It stops'], '70° > 49°.', 'Denser to rarer and i > C → TIR.'],
          ['Compared with a plane mirror, total internal reflection…', 'Reflects almost all the light', ['Reflects only half', 'Gives a dimmer image', 'Needs silvering'], 'No light escapes.', 'TIR reflects practically 100% — no loss to absorption by a silver layer.'],
        ], 2),
        tapT('tap', 'Tap every situation in which TOTAL INTERNAL REFLECTION will happen.', [
          ['Glass to air, i = 50° (C = 42°)', true], ['Water to air, i = 60° (C = 49°)', true], ['Diamond to air, i = 30° (C = 24°)', true],
          ['Air to glass, i = 60°', false], ['Glass to air, i = 30° (C = 42°)', false], ['Water to air, i = 40° (C = 49°)', false], ['Air to water, i = 80°', false],
        ], ['Rule out anything starting in air.', 'Then check i > C.'], 'TIR needs light travelling from denser to rarer AND an angle of incidence larger than the critical angle.', 5, 2),
      ],
    },
    {
      id: 'ts9.ps.refraction.uses', title: 'Mirages and applications of total internal reflection', prereqs: ['ts9.ps.refraction.tir'],
      intro: [
        h('Water on a dry road'),
        photo('☀️', 'On a hot afternoon, a dry highway far ahead seems to have a shiny pool of water on it.'),
        p('On a hot day the road heats the air just above it. Hot air is less dense and has a slightly lower refractive index than the cooler air higher up. Light from the sky coming down at a slant passes from cooler (optically denser) air into hotter (rarer) layers and bends more and more away from the normal. Close to the road, the angle becomes larger than the critical angle and the light is totally internally reflected upwards into your eyes.'),
        p('Your brain assumes light travels straight, so you see an image of the sky on the road — it looks just like reflection from water. This optical illusion is a mirage. Mirages are also seen in deserts.'),
        def('Mirage', 'An optical illusion caused by refraction and total internal reflection of light through layers of air at different temperatures, which makes a distant object (or the sky) appear reflected from the ground.'),
        h('Using total internal reflection'),
        def('Optical fibre', 'A very thin strand of glass or plastic whose core is surrounded by a cladding of lower refractive index. Light entering one end strikes the walls at more than the critical angle and is carried along by repeated TIR, even round bends.'),
        p('Optical fibres carry internet, telephone and TV signals as light pulses with very little loss. Doctors use bundles of fibres in an endoscope to see inside the stomach. Diamonds are cut so that light undergoes TIR many times inside, making them sparkle. Totally reflecting glass prisms (45°–90°–45°) turn light by 90° or 180° in periscopes and binoculars, giving brighter images than mirrors.'),
        keys('Mirage: hot air near the ground is rarer; light bends and then undergoes TIR.', 'Optical fibres guide light by repeated TIR.', 'Uses: communication, endoscopy, decoration lamps.', 'Diamond sparkle and prism periscopes/binoculars use TIR.'),
        remember('A mirage cannot be photographed away — it is real light — but the "water" is really an image of the sky.'),
      ],
      examples: [
        ex('Why does a mirage disappear when you walk closer?', ['TIR needs light to strike the hot layer at a very large (grazing) angle.', 'As you come closer, the rays reaching your eye arrive at smaller angles.', 'These are less than the critical angle, so no TIR.'], 'The angle condition for TIR is no longer met.'),
        ex('Why is the core of an optical fibre given a higher refractive index than the cladding?', ['TIR needs light to go from denser to rarer.', 'Core (denser) → cladding (rarer) at large angles.'], 'So that light inside the core undergoes total internal reflection at the boundary.'),
      ],
      practice: [
        mcq('uses', 'TIR needs denser → rarer and a large angle.', [
          ['A mirage on a hot road is mainly due to…', 'Refraction and total internal reflection in layers of hot air', ['Reflection from water on the road', 'Dispersion of light', 'Scattering by dust'], 'Hot air near the road is rarer.', 'Rays bend through layers of air and finally undergo TIR.'],
          ['On a hot day the air close to the road is…', 'Optically rarer than the air above', ['Optically denser than the air above', 'The same as the air above', 'Solid'], 'Hot air is less dense.', 'Hotter air has a lower refractive index.'],
          ['Optical fibres work on the principle of…', 'Total internal reflection', ['Diffusion', 'Scattering', 'Absorption'], 'Light bounces along the inside.', 'Light is trapped in the core by repeated TIR.'],
          ['Doctors look inside the stomach using an endoscope, which uses…', 'Optical fibres', ['X-ray film', 'A convex mirror', 'Sound waves'], 'Flexible light pipes.', 'Fibre bundles carry light in and an image out by TIR.'],
          ['Diamonds sparkle because…', 'Their small critical angle causes multiple TIR inside', ['They give out their own light', 'They absorb all light', 'They are very hard'], 'C ≈ 24°.', 'Light bounces inside many times before escaping, making them sparkle.'],
          ['A 45°–90°–45° glass prism can be used in a periscope to…', 'Turn light through 90° by TIR', ['Split white light', 'Magnify images', 'Absorb light'], 'Light hits the long face at 45°.', '45° > 42° (glass), so light is totally reflected through 90°.'],
        ]),
        orderT('mirage', 'Put the steps of mirage formation in order.', [
          'The road heats the air just above it', 'Layers of air near the road become rarer than the air above', 'Light from the sky bends away from the normal as it passes into hotter layers', 'Near the road the angle exceeds the critical angle and TIR occurs', 'The light travels up to the eye and an image of the sky appears on the road',
        ], ['The heating of air comes first.', 'You see the image at the very end.'], 'Heated road → rarer air layers → bending → TIR → image of sky seen on the road.', 2),
        matchT('match', 'device or effect to how it uses light', [
          ['Optical fibre', 'Carries light by repeated TIR'], ['Endoscope', 'Fibre bundle to see inside the body'], ['Mirage', 'Image of the sky on a hot road'],
          ['Diamond', 'Small critical angle, sparkles'], ['Periscope prism', 'Turns light through 90°'], ['Fibre-optic internet', 'Signals as pulses of light'],
        ], ['All of these involve total internal reflection.', 'Think about what each is used for.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Gravitation
// =====================================================================================
const ch5: USpec = {
  id: 'ts9.ps.ch5', subject: 'physics', title: 'Gravitation', source: src(5),
  objectives: [
    {
      id: 'ts9.ps.gravity.circular', title: 'Uniform circular motion and centripetal acceleration', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        h('Constant speed, changing velocity'),
        photo('🚲', 'A point on a bicycle wheel spinning at a steady rate moves round a circle at constant speed.'),
        p('Tie a stone to a thread and whirl it in a circle at a steady speed. Its speed stays the same, but its direction changes every instant. Since velocity includes direction, the velocity is changing — so the stone is accelerating even though its speed is constant.'),
        def('Uniform circular motion', 'Motion of a body along a circular path with constant speed. The velocity at any point is along the tangent to the circle.'),
        p('Let go of the thread and the stone flies off along the tangent — proof that the velocity at each point is tangential. While it moves in a circle, the thread pulls the stone towards the centre. This acceleration towards the centre is the centripetal acceleration, and the force causing it is the centripetal force.'),
        f('v = 2πR / T', 'speed equals two pi R divided by the time period'),
        xp({
          title: 'What if? Change the circle or the time for a round', formula: 'v = 2πR/T',
          res: ['v', 'Speed', 'm/s', '2 * pi * R / T', 2],
          vars: [['R', 'Radius', 'm', 0.5, 50, 0.5, 7], ['T', 'Time for one round', 's', 1, 60, 1, 11]],
          notes: [['R', 'A bigger circle in the same time means more distance per round — faster.', 'A smaller circle in the same time means slower motion.'], ['T', 'Taking longer for each round means a lower speed.', 'Completing rounds quicker means a higher speed.']],
          mistakes: [['Using πR instead of 2πR', 'One full round is the whole circumference, 2πR.']],
          real: 'A seat on a giant wheel of radius 7 m that turns once in 11 s moves at 2 × 22/7 × 7 ÷ 11 = 4 m/s.',
        }),
        f('a꜀ = v² / R', 'centripetal acceleration equals v squared over R'),
        xp({
          title: 'What if? Take a sharper bend or go faster', formula: 'a = v²/R',
          res: ['a', 'Centripetal acceleration', 'm/s²', 'v^2 / R', 2],
          vars: [['v', 'Speed', 'm/s', 1, 30, 1, 10], ['R', 'Radius of the path', 'm', 5, 200, 5, 50]],
          notes: [['v', 'Doubling the speed makes the needed acceleration four times bigger — that is why vehicles skid on fast turns.', 'Slowing down sharply reduces the inward pull needed.'], ['R', 'A wider (gentler) turn needs less inward acceleration.', 'A sharp turn (small R) needs much more.']],
          mistakes: [['Thinking the acceleration points outward', 'The acceleration and the force point towards the CENTRE. The "outward push" you feel is your own inertia.']],
          real: 'For a car of mass m, the inward force F = mv²/R comes from friction between the tyres and the road.',
        }),
        keys('Speed constant, direction changes → accelerated motion.', 'Velocity is along the tangent.', 'Centripetal acceleration v²/R towards the centre.', 'Centripetal force F = mv²/R.'),
        remember('If the centripetal force disappears, the body moves off along the tangent in a straight line.'),
      ],
      examples: [
        ex('A cyclist goes round a circular track of radius 35 m once in 44 s. Find the speed. (π = 22/7)', ['v = 2πR/T', 'v = 2 × 22/7 × 35 ÷ 44 = 220 ÷ 44'], '5 m/s'),
        ex('A car moves at 10 m/s round a bend of radius 50 m. Find its centripetal acceleration.', ['a = v²/R', 'a = 100 ÷ 50'], '2 m/s² towards the centre of the bend'),
      ],
      practice: [
        tp('ac', (r) => {
          const v = r.pick([4, 5, 6, 10, 12, 15, 20]);
          const R = r.pick([2, 5, 10, 20, 25, 50, 100]);
          const a = rd((v * v) / R, 2);
          return numQ(`A body moves at a constant ${v} m/s on a circle of radius ${R} m. Find its centripetal acceleration.`, a, 'm/s²', ['a = v²/R', `a = ${v}² ÷ ${R}`], [`a = ${v * v} ÷ ${R} = ${a} m/s²`], [{ when: `${rd(v / R, 3)} m/s²`, explain: 'Square the speed first: a = v²/R.' }]);
        }),
        tp('v', (r) => {
          const R = r.pick([7, 14, 21, 35, 70]);
          const v = r.pick([2, 4, 5, 10]);
          const T = (2 * 22 / 7 * R) / v;
          return numQ(`A runner completes one round of a circular track of radius ${R} m in ${rd(T, 2)} s. Find the speed. (Use π = 22/7.)`, v, 'm/s',
            ['Distance in one round = 2πR.', 'v = 2πR/T'], [`2πR = 2 × 22/7 × ${R} = ${rd(2 * 22 / 7 * R, 2)} m`, `v = ${rd(2 * 22 / 7 * R, 2)} ÷ ${rd(T, 2)} = ${v} m/s`]);
        }),
        mcq('ucm', 'Velocity has a direction — direction keeps changing on a circle.', [
          ['In uniform circular motion, which stays constant?', 'Speed', ['Velocity', 'Direction', 'Acceleration direction'], 'The direction keeps turning.', 'Only the speed (magnitude) is constant.'],
          ['The direction of velocity at any point on a circular path is…', 'Along the tangent', ['Towards the centre', 'Away from the centre', 'Along the radius'], 'Release the stone and see where it goes.', 'A released stone flies off along the tangent.'],
          ['Centripetal acceleration is directed…', 'Towards the centre', ['Away from the centre', 'Along the tangent', 'Upward'], '"Centre-seeking".', 'Centripetal means directed towards the centre.'],
          ['For the Moon going round the Earth, the centripetal force is provided by…', 'Gravitational force of the Earth', ['Friction', 'Magnetic force', 'Air pressure'], 'What pulls the Moon?', 'Earth\'s gravity pulls the Moon towards the centre of its orbit.'],
          ['Uniform circular motion is called accelerated motion because…', 'The direction of velocity changes continuously', ['The speed increases', 'The body slows down', 'The radius changes'], 'Acceleration is change in velocity.', 'Changing direction means changing velocity, i.e. acceleration.'],
          ['If the speed on a curve is doubled, the centripetal acceleration becomes…', '4 times', ['2 times', 'Half', 'The same'], 'a = v²/R.', 'a depends on v², so 2² = 4 times.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.gravity.law', title: 'Universal law of gravitation', prereqs: ['ts9.ps.gravity.circular'],
      intro: [
        h('The same pull for apples and the Moon'),
        photo('🍎', 'An apple falls to the ground, and the Moon keeps circling the Earth. Newton realised both are pulled by the same force.'),
        def('Universal law of gravitation', 'Every object in the universe attracts every other object with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centres.'),
        f('F = G m₁ m₂ / d²', 'F equals G times m one times m two divided by d squared'),
        p('G is the universal gravitational constant: G = 6.67 × 10⁻¹¹ N m²/kg². Its value is tiny, so the pull between everyday objects is too small to notice. It becomes large only when at least one mass is huge, like the Earth or the Sun.'),
        xp({
          title: 'What if? Change the masses or the distance', formula: 'F ∝ m₁m₂ / d²  (F relative to a starting value of 1)',
          res: ['F', 'Force (relative)', '', 'M1 * M2 / D^2', 3],
          vars: [['M1', 'Mass 1 (times original)', '', 0.5, 5, 0.5, 1], ['M2', 'Mass 2 (times original)', '', 0.5, 5, 0.5, 1], ['D', 'Distance (times original)', '', 0.5, 5, 0.5, 1]],
          notes: [['D', 'Doubling the distance makes the force a QUARTER; tripling makes it one-ninth (inverse-square law).', 'Halving the distance makes the force four times stronger.'], ['M1', 'Doubling one mass doubles the force.', 'Halving one mass halves the force.']],
          mistakes: [['Halving the force when distance doubles', 'The distance is squared: 2² = 4, so the force becomes ¼.'], ['Thinking only the bigger body pulls', 'By the third law both bodies pull each other with equal force.']],
          real: 'The Earth pulls the Moon and the Moon pulls the Earth equally hard; the Moon\'s pull on our oceans causes tides.',
        }),
        p('The law explains why we stay on the Earth, why the Moon orbits the Earth, why planets orbit the Sun and why there are tides.'),
        keys('F ∝ m₁m₂ and F ∝ 1/d².', 'G = 6.67 × 10⁻¹¹ N m²/kg² (universal, same everywhere).', 'Every pair of masses attracts — equally and oppositely.', 'Explains orbits, tides and falling objects.'),
        remember('Double distance → ¼ force. Triple distance → 1/9 force. Double both masses → 4 × force.'),
      ],
      examples: [
        ex('The distance between two bodies is tripled. What happens to the gravitational force?', ['F ∝ 1/d²', 'New F = F/3² = F/9'], 'It becomes one-ninth.'),
        ex('Both masses are doubled and the distance is also doubled. Find the new force.', ['F′ = G(2m₁)(2m₂)/(2d)²', '= 4Gm₁m₂/4d² = F'], 'The force stays the same.'),
      ],
      practice: [
        tp('ratio', (r) => {
          const k = r.pick([2, 3, 4, 5]);
          const mm = r.pick([1, 2, 3, 4]);
          const num = mm, den = k * k;
          const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
          const c = g(num, den);
          const desc = mm === 1 ? '' : ` and one of the masses is made ${mm} times bigger`;
          return {
            type: 'typed', keypad: 'fraction', prompt: `The distance between two bodies is made ${k} times larger${desc}. The new gravitational force is what fraction (or multiple) of the original? (e.g. 1/4)`,
            answer: frac(num / c, den / c), hints: ['F ∝ m₁m₂/d²', `The distance factor is squared: ${k}² = ${k * k}.`],
            mistakes: [{ when: `${mm}/${k}`, explain: 'You forgot to square the distance factor.' }],
            solution: [`F′/F = ${mm} ÷ ${k}² = ${mm}/${k * k}`, `= ${num / c}/${den / c}`],
          };
        }, 2),
        mcq('law', 'F = G m₁ m₂ / d²', [
          ['The value of G is…', '6.67 × 10⁻¹¹ N m²/kg²', ['9.8 m/s²', '6.67 × 10¹¹ N m²/kg²', '3 × 10⁸ m/s'], 'It is a very tiny number.', 'G = 6.67 × 10⁻¹¹ N m²/kg², the same everywhere.'],
          ['The SI unit of G is…', 'N m²/kg²', ['N', 'm/s²', 'kg m/s'], 'Rearrange G = Fd²/(m₁m₂).', 'N × m² ÷ kg² = N m²/kg².'],
          ['If the distance between two masses is halved, the force becomes…', '4 times', ['2 times', 'Half', 'One-quarter'], 'Inverse square.', '1/(½)² = 4.'],
          ['The Earth attracts an apple. The apple attracts the Earth with…', 'An equal force', ['A smaller force', 'No force', 'A larger force'], 'Third law.', 'Gravitational forces between two bodies are equal and opposite.'],
          ['We do not notice the gravitational pull between two students because…', 'Their masses are small and G is very tiny', ['There is no force between them', 'Air blocks gravity', 'Gravity only acts on the Earth'], 'The force exists but is tiny.', 'With small masses and tiny G, the force is far too weak to feel.'],
          ['The ocean tides are mainly caused by…', 'The Moon\'s gravitational pull', ['Wind', 'The Earth\'s magnetic field', 'Rivers flowing into the sea'], 'Which nearby body pulls the oceans?', 'The Moon\'s gravity pulls on ocean water, raising tides.'],
        ]),
        tapT('tap', 'Tap every phenomenon explained by the universal law of gravitation.', [
          ['The Moon orbiting the Earth', true], ['Tides in the sea', true], ['Planets orbiting the Sun', true], ['A mango falling from a tree', true],
          ['A magnet attracting a pin', false], ['A rainbow after rain', false], ['A comb attracting bits of paper after rubbing', false],
        ], ['Gravity acts between masses.', 'Magnetic and electric attractions are different forces.'], 'Orbits, tides and falling objects are all due to gravitation; magnets and charged combs are not.'),
      ],
    },
    {
      id: 'ts9.ps.gravity.freefall', title: 'Free fall, acceleration due to gravity and weight', prereqs: ['ts9.ps.gravity.law'],
      activities: ['lab:motion'],
      intro: [
        h('Everything falls the same way'),
        photo('🪶', 'In air a feather drifts down slowly; in a tube with the air pumped out, a feather and a coin fall together.'),
        def('Free fall', 'Motion of a body falling under the force of gravity alone (no air resistance).'),
        p('Near the Earth\'s surface every freely falling body has the same acceleration, g ≈ 9.8 m/s², whatever its mass. It comes from the law of gravitation: g = GM/R², where M and R are the Earth\'s mass and radius. g is slightly more at the poles than at the equator, and it decreases as you go higher.'),
        p('The equations of motion work for free fall with a = g: v = u + gt, h = ut + ½gt², v² = u² + 2gh.'),
        f('h = ½ g t²  (dropped from rest)', 'height fallen equals half g t squared'),
        xp({
          title: 'What if? Drop a stone into a well', formula: 'h = ½gt²',
          res: ['h', 'Distance fallen', 'm', '0.5 * g * t^2', 1],
          vars: [['t', 'Time of fall', 's', 0.5, 6, 0.1, 2], ['g', 'Acceleration due to gravity', 'm/s²', 1.6, 9.8, 0.1, 9.8]],
          notes: [['t', 'Twice the falling time means four times the depth — the stone keeps speeding up.', 'Half the time means only a quarter of the distance.'], ['g', 'On the Moon (g ≈ 1.6 m/s²) the same time gives a much shorter fall.', 'Stronger gravity makes things fall farther in the same time.']],
          mistakes: [['Thinking heavier things fall faster', 'Without air, all bodies fall with the same g. Air resistance, not mass, slows a feather.']],
          real: 'If a stone takes 2 s to hit the water in a well, the water is about ½ × 9.8 × 4 ≈ 19.6 m down.',
        }),
        def('Weight', 'The force with which the Earth pulls a body: W = mg. It is a force, measured in newtons (N), and changes from place to place. Mass, the amount of matter, stays the same everywhere.'),
        f('W = m g', 'weight equals mass times g'),
        xp({
          title: 'What if? Weigh yourself on the Moon', formula: 'W = mg',
          res: ['W', 'Weight', 'N', 'm * g', 1],
          vars: [['m', 'Mass', 'kg', 1, 120, 1, 50], ['g', 'Gravity where you stand', 'm/s²', 1.6, 24.8, 0.1, 9.8]],
          notes: [['g', 'On Jupiter (g ≈ 24.8 m/s²) you would weigh about 2.5 times more — your mass stays the same.', 'On the Moon (g ≈ 1.6 m/s²) your weight is about one-sixth.']],
          mistakes: [['Saying "my weight is 50 kg"', 'Kilograms measure mass. A 50 kg person weighs 50 × 9.8 = 490 N on the Earth.']],
          real: 'An astronaut of mass 60 kg weighs 588 N on Earth but only about 98 N on the Moon.',
        }),
        keys('All bodies in free fall have the same acceleration g ≈ 9.8 m/s².', 'g = GM/R²; varies slightly from place to place.', 'Weight W = mg (N); mass (kg) does not change.', 'Weight on the Moon ≈ ⅙ of weight on Earth.'),
        remember('Mass is measured with a beam balance (kg); weight with a spring balance (N).'),
      ],
      examples: [
        ex('A stone is dropped from a bridge and hits the water after 3 s. Find the height of the bridge and the speed on hitting the water. (g = 9.8 m/s²)', ['u = 0, t = 3 s', 'h = ½ × 9.8 × 3² = 44.1 m', 'v = gt = 9.8 × 3 = 29.4 m/s'], 'h = 44.1 m; v = 29.4 m/s'),
        ex('Find the weight of a 30 kg bag on the Earth and on the Moon.', ['W = mg = 30 × 9.8 = 294 N', 'On the Moon ≈ 294 ÷ 6 = 49 N'], '294 N on Earth; about 49 N on the Moon'),
      ],
      practice: [
        tp('weight', (r) => {
          const m = r.pick([5, 10, 20, 25, 40, 50, 60, 75]);
          const moon = r.next() < 0.4;
          if (moon) return numQ(`An object has a weight of ${rd(m * 9.8, 2)} N on the Earth. What is its approximate weight on the Moon (one-sixth)?`, rd((m * 9.8) / 6, 2), 'N', ['Moon\'s gravity is about one-sixth of the Earth\'s.'], [`W(Moon) = ${rd(m * 9.8, 2)} ÷ 6 ≈ ${rd((m * 9.8) / 6, 2)} N`], [], 0.02);
          return numQ(`Find the weight of a ${m} kg object on the Earth (g = 9.8 m/s²).`, rd(m * 9.8, 2), 'N', ['W = mg'], [`W = ${m} × 9.8 = ${rd(m * 9.8, 2)} N`], [{ when: `${m} N`, explain: 'Multiply mass by g: weight in newtons is about ten times the mass in kg.' }]);
        }),
        tp('drop', (r) => {
          const t = r.pick([1, 2, 3, 4, 5]);
          const askV = r.next() < 0.5;
          if (askV) return numQ(`A ball is dropped from rest. Find its speed after ${t} s of free fall (g = 9.8 m/s²).`, rd(9.8 * t, 2), 'm/s', ['v = u + gt with u = 0.'], [`v = 9.8 × ${t} = ${rd(9.8 * t, 2)} m/s`]);
          return numQ(`A stone dropped into a well hits the water after ${t} s. How deep is the water surface? (g = 9.8 m/s², ignore sound travel time)`, rd(4.9 * t * t, 2), 'm',
            ['h = ½gt² (u = 0)', `h = ½ × 9.8 × ${t}²`], [`h = 4.9 × ${t * t} = ${rd(4.9 * t * t, 2)} m`], [{ when: `${rd(9.8 * t * t, 2)} m`, explain: 'Remember the ½ in h = ½gt².' }]);
        }),
        mcq('mass-weight', 'Mass is the amount of matter; weight is a force.', [
          ['The SI unit of weight is…', 'Newton', ['Kilogram', 'Gram', 'm/s²'], 'Weight is a force.', 'Weight = mg, measured in newtons.'],
          ['When an astronaut goes from the Earth to the Moon, her mass…', 'Stays the same', ['Becomes one-sixth', 'Becomes zero', 'Doubles'], 'Amount of matter does not change.', 'Mass is constant; only weight changes.'],
          ['In vacuum, a feather and a coin dropped together…', 'Reach the ground together', ['The coin lands first', 'The feather lands first', 'Neither falls'], 'No air resistance.', 'All bodies fall with the same acceleration g in vacuum.'],
          ['The value of g is greatest at the…', 'Poles', ['Equator', 'Top of Mount Everest', 'Centre of the Earth'], 'The Earth is slightly flattened at the poles.', 'The poles are closest to the Earth\'s centre, so g is greatest there.'],
          ['g on the Earth\'s surface is given by…', 'GM/R²', ['GMR', 'GM/R', 'G/MR²'], 'Use F = GMm/R² = mg.', 'Equating mg with GMm/R² gives g = GM/R².'],
          ['A body is thrown straight up. At the highest point its velocity is…', 'Zero, but acceleration is still g downward', ['Zero and acceleration is zero', 'Maximum', 'Equal to g'], 'Gravity never switches off.', 'Velocity is momentarily zero; g still acts downward.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.gravity.cg', title: 'Centre of gravity, balancing and stability', prereqs: ['ts9.ps.gravity.freefall'],
      intro: [
        h('Where does the weight act?'),
        photo('📏', 'Balance a ruler on one finger: there is just one point where it stays level — near the middle.'),
        def('Centre of gravity (CG)', 'The point of a body through which its entire weight appears to act, whatever the position of the body.'),
        p('For a uniform ruler, rod, disc or sphere, the CG is at its geometrical centre. For an irregular body like a cardboard map of Telangana, it can be found with a plumb line: hang the card from a hole, mark the vertical line of the plumb line, hang it from another hole and mark again. The CG is where the lines cross. The CG can even lie outside the material, as in a ring or a bangle.'),
        h('Stability'),
        p('A body is stable if, when tilted slightly, the vertical line through its CG still falls inside its base — then its weight pulls it back. It topples when that line falls outside the base. So a body is more stable when (1) its CG is low and (2) its base is wide.'),
        def('Stable equilibrium', 'When slightly disturbed, the body returns to its original position (CG rises on tilting), e.g. a cone resting on its base.'),
        p('Examples: buses are built with heavy parts low down; racing cars are low and wide; a tightrope walker holds a long pole to lower the CG and control balance; a person carrying a heavy bucket in one hand leans the other way to keep the CG over the feet; a balancing doll has a heavy rounded base.'),
        keys('Weight acts through the CG.', 'Uniform bodies: CG at the geometric centre.', 'Plumb-line method finds the CG of a lamina.', 'Low CG + wide base = more stable.'),
        remember('A body topples when the vertical line through its CG falls outside its base.'),
      ],
      examples: [
        ex('Why should passengers not stand on the upper deck of a double-decker bus in large numbers?', ['Many people up top raise the CG of the bus.', 'On a turn the bus tilts; a high CG\'s vertical line can fall outside the wheels\' base.', 'The bus could topple.'], 'It raises the centre of gravity and reduces stability.'),
        ex('Where is the CG of a uniform metre scale, and how could you check it?', ['A uniform body has its CG at the geometric centre.', 'Balance it on a knife-edge; it balances at the middle.'], 'At the 50 cm mark'),
      ],
      practice: [
        mcq('cg', 'Low CG and wide base give stability.', [
          ['The centre of gravity of a uniform ring is…', 'At its centre, where there is no material', ['On the ring itself', 'At the top of the ring', 'Anywhere on the ring'], 'CG can lie outside the body.', 'By symmetry, the CG of a ring is at its centre, which is empty space.'],
          ['A body will topple when the vertical line through its CG…', 'Falls outside its base', ['Falls inside its base', 'Passes through the top', 'Is horizontal'], 'Picture a leaning tower.', 'Outside the base, the weight turns the body over.'],
          ['Racing cars are built low and wide so that…', 'They are more stable', ['They are lighter', 'They go faster on straight roads only', 'They use less fuel'], 'Stability rules.', 'A low CG and a wide base make the car hard to overturn on bends.'],
          ['A tightrope walker carries a long pole to…', 'Lower the centre of gravity and keep balance', ['Look taller', 'Increase weight', 'Push the rope'], 'The pole bends downward at the ends.', 'The pole helps keep the CG low and over the rope.'],
          ['Which position of a cone is the most stable?', 'Resting on its flat base', ['Balanced on its tip', 'Lying on its side', 'All are equal'], 'Widest base and lowest CG.', 'On its base the CG is lowest and the base widest.'],
          ['A person carrying a heavy bucket in the right hand leans to the left to…', 'Keep the combined CG above the feet', ['Reduce the weight', 'Look stylish', 'Increase friction'], 'Where must the CG line fall?', 'Leaning shifts the CG back over the base (feet).'],
        ]),
        orderT('plumb', 'Arrange the steps to find the centre of gravity of an irregular cardboard sheet.', [
          'Make two or three small holes near the edges of the sheet', 'Hang the sheet freely from one hole with a plumb line from the same point', 'Draw a line along the plumb line on the sheet', 'Hang it from another hole and draw the new plumb line', 'Mark the point where the lines cross — this is the CG',
        ], ['You need holes before you can hang the sheet.', 'The crossing point comes last.'], 'Holes → hang → mark vertical → repeat from another hole → intersection is the CG.'),
        tapT('tap', 'Tap every change that makes an object MORE stable.', [
          ['Making its base wider', true], ['Putting heavy parts lower down', true], ['Loading luggage on the floor of a bus instead of the roof', true],
          ['Raising its centre of gravity', false], ['Making its base narrower', false], ['Stacking heavy luggage on the roof', false], ['Standing on one foot', false],
        ], ['Low CG and wide base help.', 'Anything that raises the CG reduces stability.'], 'Stability increases with a lower CG and a wider base.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Is matter pure?
// =====================================================================================
const ch6: USpec = {
  id: 'ts9.ps.ch6', subject: 'chemistry', title: 'Is matter pure?', source: src(6),
  objectives: [
    {
      id: 'ts9.ps.pure.mixtures', title: 'Pure substances (elements, compounds) and mixtures', prereqs: [],
      intro: [
        h('What does "pure" mean to a chemist?'),
        photo('🥛', 'A milkman may call his milk "pure", but to a chemist milk is a mixture of water, fats, proteins and sugars.'),
        p('In daily life "pure" means "nothing added". In science, a pure substance is made of only one kind of particle, so it has a fixed composition and fixed properties (such as a definite melting and boiling point).'),
        def('Element', 'A pure substance that cannot be broken down into simpler substances by chemical reactions, e.g. iron, oxygen, carbon. Elements are grouped into metals, non-metals and metalloids (like silicon and boron).'),
        def('Compound', 'A pure substance made of two or more elements chemically combined in a fixed ratio by mass, e.g. water (H₂O), common salt (NaCl). Its properties are different from those of its elements.'),
        def('Mixture', 'Two or more substances mixed together in any ratio without chemical combination. Each keeps its own properties and they can be separated by physical methods.'),
        def('Homogeneous mixture', 'A mixture with the same composition throughout, e.g. sugar in water, air, brass (an alloy of copper and zinc).'),
        def('Heterogeneous mixture', 'A mixture whose composition is not uniform and whose parts can often be seen, e.g. sand in water, oil and water, salad.'),
        p('Iron filings and sulphur powder mixed together are a mixture: a magnet pulls out the iron. Heat them strongly and they react to form iron sulphide, a compound — the magnet no longer attracts it.'),
        keys('Pure substances: elements and compounds.', 'Compounds: fixed ratio, new properties, separated only chemically.', 'Mixtures: any ratio, components keep properties, separated physically.', 'Homogeneous = uniform; heterogeneous = not uniform.'),
        remember('Alloys (brass, bronze, steel) are mixtures — homogeneous ones — not compounds.'),
      ],
      examples: [
        ex('Classify: (a) air (b) water (c) oxygen (d) muddy water.', ['Air: several gases mixed → homogeneous mixture', 'Water: H and O combined in fixed ratio → compound', 'Oxygen: one kind of atom → element', 'Muddy water: particles visible → heterogeneous mixture'], '(a) homogeneous mixture (b) compound (c) element (d) heterogeneous mixture'),
        ex('Give two differences between a mixture of iron and sulphur and iron sulphide.', ['In the mixture, iron is still attracted by a magnet; in iron sulphide it is not.', 'The mixture can have any ratio; iron sulphide has a fixed ratio.'], 'Magnet test and fixed vs variable composition'),
      ],
      practice: [
        tp('classify', (r) => {
          const bank: [string, string][] = [
            ['Distilled water', 'Compound'], ['Common salt', 'Compound'], ['Carbon dioxide', 'Compound'], ['Sugar', 'Compound'],
            ['Iron', 'Element'], ['Oxygen gas', 'Element'], ['Mercury', 'Element'], ['Sulphur', 'Element'],
            ['Air', 'Homogeneous mixture'], ['Brass', 'Homogeneous mixture'], ['Salt solution', 'Homogeneous mixture'], ['Soda water', 'Homogeneous mixture'],
            ['Sand and water', 'Heterogeneous mixture'], ['Oil and water', 'Heterogeneous mixture'], ['Muddy water', 'Heterogeneous mixture'], ['Iron filings and sulphur powder', 'Heterogeneous mixture'],
          ];
          const [thing, kind] = r.pick(bank);
          const all = ['Element', 'Compound', 'Homogeneous mixture', 'Heterogeneous mixture'];
          return {
            type: 'mcq', prompt: `Classify: ${thing}.`, ...choose(r, kind, all.filter((x) => x !== kind)),
            hints: ['Is it one kind of particle (pure) or several mixed?', 'If pure: can it be broken down chemically? If a mixture: is it uniform?'],
            mistakes: [{ when: 'wrong', explain: `${thing} is a ${kind.toLowerCase()}.` }],
            solution: [`${thing} → ${kind}.`],
          };
        }),
        mcq('props', 'Compounds have fixed ratios; mixtures do not.', [
          ['Which statement is true for a compound?', 'Its elements are combined in a fixed ratio by mass', ['Its components keep their own properties', 'It can be separated by a magnet', 'It can have any composition'], 'Water is always H₂O.', 'A compound has a fixed composition.'],
          ['Brass is…', 'A homogeneous mixture (alloy)', ['A compound', 'An element', 'A heterogeneous mixture'], 'Copper and zinc in varying ratios.', 'Alloys are homogeneous mixtures because their composition can vary.'],
          ['Which is a metalloid?', 'Silicon', ['Iron', 'Oxygen', 'Copper'], 'It has properties between metals and non-metals.', 'Silicon (and boron) are metalloids.'],
          ['When iron and sulphur are heated together, the product…', 'Is not attracted by a magnet', ['Is still attracted by a magnet', 'Is a mixture', 'Separates on standing'], 'A new compound forms.', 'Iron sulphide is a compound with new properties.'],
          ['A pure substance has…', 'A fixed melting point', ['A melting range that varies', 'Any composition', 'Visible different particles'], 'Pure means one kind of particle.', 'Pure substances melt and boil at definite temperatures.'],
          ['Which can be separated by physical methods?', 'A mixture', ['A compound', 'An element', 'None of these'], 'Components are not chemically bonded.', 'Mixtures can be separated physically (filtering, evaporating, etc.).'],
        ]),
        matchT('match', 'substance to its type', [
          ['Gold', 'Element (metal)'], ['Water', 'Compound'], ['Air', 'Homogeneous mixture'], ['Sand in water', 'Heterogeneous mixture'],
          ['Boron', 'Element (metalloid)'], ['Carbon', 'Element (non-metal)'],
        ], ['Elements have one kind of atom.', 'Compounds have fixed ratios; mixtures do not.']),
      ],
    },
    {
      id: 'ts9.ps.pure.solutions', title: 'Solutions, suspensions and colloids; concentration', prereqs: ['ts9.ps.pure.mixtures'],
      intro: [
        h('Lemonade, muddy water and milk'),
        photo('🌳', 'Sunlight streaming through a misty forest shows bright beams — light scattered by tiny droplets of a colloid.'),
        def('Solution', 'A homogeneous mixture of two or more substances. The substance present in larger amount is the solvent; the one dissolved is the solute. Particles are extremely small (smaller than about 1 nm), do not settle, pass through filter paper and do not scatter light.'),
        def('Suspension', 'A heterogeneous mixture in which solid particles are spread through a liquid but are big enough to be seen. They scatter light, settle down on standing and can be separated by filtration, e.g. muddy water, chalk powder in water.'),
        def('Colloid', 'A mixture whose particles are in between: too small to see or to settle, but big enough to scatter a beam of light (the Tyndall effect). It looks homogeneous but is actually heterogeneous, e.g. milk, fog, smoke, jelly, shaving cream.'),
        p('A colloid has a dispersed phase (the particles) and a dispersion medium (what they are spread in). Fog is liquid dispersed in gas (aerosol); milk is liquid in liquid (emulsion); smoke is solid in gas.'),
        h('How strong is a solution?'),
        p('A solution that can dissolve no more solute at a given temperature is saturated. Solubility increases with temperature for most solids. Concentration tells how much solute is present in a given amount of solution:'),
        f('mass % = (mass of solute ÷ mass of solution) × 100', 'mass percentage equals mass of solute over mass of solution times one hundred'),
        xp({
          title: 'What if? Make the sugar syrup stronger', formula: 'mass % = solute / (solute + solvent) × 100',
          res: ['c', 'Concentration (mass %)', '%', '100 * s / (s + w)', 1],
          vars: [['s', 'Mass of solute', 'g', 1, 100, 1, 20], ['w', 'Mass of solvent (water)', 'g', 50, 500, 10, 180]],
          notes: [['s', 'Adding more solute makes the solution more concentrated — but not in simple proportion, because the total mass grows too.', 'Less solute → more dilute.'], ['w', 'Adding water dilutes the solution.', 'Evaporating water concentrates it.']],
          mistakes: [['Dividing by the mass of solvent', 'The formula uses the mass of SOLUTION = solute + solvent.']],
          real: '20 g of salt in 180 g of water gives a 10% salt solution by mass.',
        }),
        keys('Solution: tiny particles, transparent, no Tyndall effect, stable.', 'Suspension: visible particles, settle, filterable.', 'Colloid: intermediate, Tyndall effect, does not settle.', 'mass % = solute ÷ solution × 100.'),
        remember('Tyndall effect = scattering of a light beam by colloid particles. True solutions do not show it.'),
      ],
      examples: [
        ex('Diya dissolves 40 g of sugar in 160 g of water. Find the concentration by mass.', ['Mass of solution = 40 + 160 = 200 g', 'mass % = 40 ÷ 200 × 100'], '20%'),
        ex('A beam of torchlight is passed through (a) salt water and (b) diluted milk. In which is the path visible?', ['Salt water is a true solution — particles too small to scatter light.', 'Milk is a colloid — its particles scatter light (Tyndall effect).'], 'In diluted milk'),
      ],
      practice: [
        tp('conc', (r) => {
          const [s, w] = r.pick([[10, 90], [20, 180], [25, 75], [5, 45], [30, 120], [15, 135], [40, 160], [50, 200], [12, 188], [36, 264]] as [number, number][]);
          const c = rd((100 * s) / (s + w), 2);
          return numQ(`${who(r)} dissolves ${s} g of salt in ${w} g of water. Find the concentration of the solution as a mass percentage (type just the number).`, c, undefined,
            ['Mass of solution = mass of solute + mass of solvent.', 'mass % = solute ÷ solution × 100'], [`Solution = ${s} + ${w} = ${s + w} g`, `mass % = ${s} ÷ ${s + w} × 100 = ${c}`],
            [{ when: String(rd((100 * s) / w, 2)), explain: 'Divide by the mass of the whole SOLUTION (salt + water), not by water alone.' }]);
        }),
        mcq('types', 'Think about particle size: tiny → colloid → large.', [
          ['Which shows the Tyndall effect?', 'Milk', ['Salt solution', 'Sugar solution', 'Copper sulphate solution'], 'Colloid particles scatter light.', 'Milk is a colloid, so it scatters a light beam.'],
          ['Particles that settle down on standing are found in a…', 'Suspension', ['Solution', 'Colloid', 'Compound'], 'Large particles.', 'Suspension particles are large and heavy enough to settle.'],
          ['Fog is a colloid of…', 'Liquid dispersed in gas', ['Gas in liquid', 'Solid in gas', 'Solid in liquid'], 'Water droplets in air.', 'Fog = tiny water droplets (liquid) in air (gas): an aerosol.'],
          ['In a solution of salt in water, the solvent is…', 'Water', ['Salt', 'Both', 'Neither'], 'The larger component.', 'Water dissolves the salt, so water is the solvent.'],
          ['A solution that cannot dissolve any more solute at that temperature is…', 'Saturated', ['Unsaturated', 'Dilute', 'A suspension'], 'It is "full".', 'A saturated solution holds the maximum solute at that temperature.'],
          ['Which can be separated by filtration?', 'Chalk powder in water', ['Salt in water', 'Sugar in water', 'Milk'], 'Particles must be large.', 'Suspensions have particles large enough to be caught by filter paper.'],
        ]),
        matchT('match', 'mixture to its type', [
          ['Sugar in water', 'True solution'], ['Muddy water', 'Suspension'], ['Milk', 'Colloid (emulsion)'], ['Smoke', 'Colloid (solid in gas)'],
          ['Air', 'Gaseous solution'], ['Chalk in water', 'Suspension'],
        ], ['Does it settle? Then suspension.', 'Does it scatter light without settling? Then colloid.'], 4),
      ],
    },
    {
      id: 'ts9.ps.pure.separation', title: 'Separating the components of a mixture', prereqs: ['ts9.ps.pure.mixtures'],
      intro: [
        h('Getting things back out'),
        photo('🌾', 'Farmers separate grain from husk by winnowing — a separation that uses a difference in weight.'),
        p('Because the components of a mixture keep their own properties, we can separate them by using a property in which they differ — boiling point, solubility, ability to sublime, or how fast they travel with a solvent.'),
        def('Evaporation', 'Heating a solution so that the volatile solvent escapes as vapour, leaving the non-volatile solute behind, e.g. salt from sea water, dye from ink.'),
        def('Sublimation', 'Separating a component that changes directly from solid to vapour on heating (camphor, naphthalene, ammonium chloride, iodine) from one that does not, e.g. ammonium chloride from common salt.'),
        def('Paper chromatography', 'Separating coloured components (dyes) of a mixture. The solvent rises up the paper carrying each dye; the dye that dissolves more readily travels farther, so the colours separate.'),
        def('Distillation', 'Separating two miscible liquids with sufficiently different boiling points (e.g. acetone and water) by boiling and then condensing the vapour of the lower-boiling liquid. When the boiling points are close (difference less than about 25 °C), fractional distillation with a fractionating column is used.'),
        p('Chromatography is used to detect colours in a dye, pigments in plants, and to identify drugs in blood. Distillation gives pure drinking water from salty water; fractional distillation separates petroleum and the gases of air.'),
        keys('Evaporation: soluble solid from liquid.', 'Sublimation: sublimable solid from a non-sublimable one.', 'Chromatography: dyes that move at different speeds.', 'Distillation: miscible liquids with different boiling points.'),
        remember('In chromatography, the dye that is MORE soluble in the solvent rises HIGHER on the paper.'),
      ],
      examples: [
        ex('How would you separate a mixture of common salt and ammonium chloride?', ['Ammonium chloride sublimes; salt does not.', 'Heat the mixture in a china dish covered with an inverted funnel.', 'Ammonium chloride vapour condenses on the cool funnel; salt stays behind.'], 'By sublimation'),
        ex('Find out whether black ink is a single dye or a mixture.', ['Put a spot of ink near the bottom of a filter-paper strip.', 'Dip the strip end (not the spot) in water.', 'If several colours appear at different heights, the ink is a mixture.'], 'Use paper chromatography'),
      ],
      practice: [
        tp('method', (r) => {
          const bank: [string, string][] = [
            ['Salt from sea water', 'Evaporation'], ['Blue dye from blue ink', 'Evaporation'], ['Camphor from salt', 'Sublimation'], ['Ammonium chloride from sand', 'Sublimation'],
            ['Naphthalene from common salt', 'Sublimation'], ['Different coloured dyes in black ink', 'Paper chromatography'], ['Pigments from a leaf extract', 'Paper chromatography'],
            ['Acetone from water', 'Distillation'], ['Pure water from salty water (collecting the water)', 'Distillation'], ['Iodine from salt', 'Sublimation'],
          ];
          const [mix, m] = r.pick(bank);
          const all = ['Evaporation', 'Sublimation', 'Paper chromatography', 'Distillation'];
          return {
            type: 'mcq', prompt: `Which method is best to separate: ${mix}?`, ...choose(r, m, all.filter((x) => x !== m)),
            hints: ['Which property of the components is different?', 'Does one sublime? Are both liquids? Are they coloured dyes?'],
            mistakes: [{ when: 'wrong', explain: `For "${mix}", the best method is ${m.toLowerCase()}.` }],
            solution: [`${mix} → ${m}.`],
          };
        }),
        orderT('distil', 'Arrange the steps of separating acetone from water by distillation.', [
          'Put the mixture in a distillation flask fitted with a thermometer', 'Heat the mixture slowly', 'Acetone (lower boiling point) vaporises first', 'The vapour cools and condenses in the condenser', 'Collect liquid acetone in a beaker; water stays in the flask',
        ], ['Heating comes before vaporising.', 'Condensing comes before collecting.'], 'Set up → heat → lower-boiling liquid vaporises → condenses → collected.'),
        mcq('concept', 'Each method uses a different property.', [
          ['Paper chromatography separates dyes because they…', 'Dissolve in and travel with the solvent at different rates', ['Have different colours only', 'Have different masses', 'Evaporate at different rates'], 'Solubility in the solvent.', 'Each dye moves at its own rate, so they spread apart.'],
          ['Fractional distillation is used when the boiling points of the liquids…', 'Differ by less than about 25 °C', ['Differ by more than 100 °C', 'Are equal', 'Cannot be measured'], 'Close boiling points need extra help.', 'A fractionating column is needed when boiling points are close.'],
          ['Which substance sublimes?', 'Ammonium chloride', ['Common salt', 'Sand', 'Sugar'], 'Turns straight to vapour.', 'Ammonium chloride sublimes on heating.'],
          ['Different gases of air are separated by…', 'Fractional distillation of liquid air', ['Evaporation', 'Sublimation', 'Filtration'], 'Gases have different boiling points.', 'Air is liquefied, then the gases boil off at different temperatures.'],
          ['In the ink chromatography experiment the ink spot is kept…', 'Above the level of the water', ['Below the water', 'At the top of the paper', 'Dipped in the water'], 'Otherwise the ink dissolves away.', 'The spot must stay above the solvent so the solvent can carry it up.'],
          ['Salt is obtained from sea water in salt pans by…', 'Evaporation', ['Sublimation', 'Distillation', 'Chromatography'], 'The Sun does the heating.', 'Water evaporates, leaving salt crystals.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Atoms and molecules and chemical reactions
// =====================================================================================
/** [formula, molecular mass, working] using H 1, C 12, N 14, O 16, Na 23, Mg 24, S 32, Cl 35.5, Ca 40 */
const MOLS: [string, number, string][] = [
  ['H₂O', 18, '2 × 1 + 16'], ['CO₂', 44, '12 + 2 × 16'], ['NH₃', 17, '14 + 3 × 1'], ['CH₄', 16, '12 + 4 × 1'], ['H₂SO₄', 98, '2 × 1 + 32 + 4 × 16'],
  ['CaCO₃', 100, '40 + 12 + 3 × 16'], ['NaCl', 58.5, '23 + 35.5'], ['C₆H₁₂O₆', 180, '6 × 12 + 12 × 1 + 6 × 16'], ['HNO₃', 63, '1 + 14 + 3 × 16'],
  ['C₂H₅OH', 46, '2 × 12 + 6 × 1 + 16'], ['HCl', 36.5, '1 + 35.5'], ['MgO', 40, '24 + 16'], ['NaOH', 40, '23 + 16 + 1'], ['N₂', 28, '2 × 14'], ['O₂', 32, '2 × 16'],
];

const ch7: USpec = {
  id: 'ts9.ps.ch7', subject: 'chemistry', title: 'Atoms and molecules and chemical reactions', source: src(7),
  objectives: [
    {
      id: 'ts9.ps.atoms.laws', title: 'Laws of chemical combination', prereqs: [],
      intro: [
        h('Nothing is lost, and the recipe is fixed'),
        photo('⚖', 'Carry out a reaction in a closed flask on a balance: the reading does not change, even though new substances form.'),
        p('Towards the end of the 1700s chemists began weighing substances very carefully before and after reactions. Two simple but powerful rules came out of these measurements.'),
        def('Law of conservation of mass (Lavoisier)', 'Mass can neither be created nor destroyed in a chemical reaction. Total mass of reactants = total mass of products.'),
        f('mass of reactants = mass of products', 'mass of reactants equals mass of products'),
        xp({
          title: 'What if? Weigh a reaction in a closed flask', formula: 'mass of products = mass of A + mass of B',
          res: ['P', 'Total mass of products', 'g', 'A + B', 1],
          vars: [['A', 'Mass of reactant A', 'g', 1, 50, 0.5, 5.3], ['B', 'Mass of reactant B', 'g', 1, 50, 0.5, 6]],
          notes: [['A', 'Every extra gram of reactant that reacts appears as an extra gram of product.', 'Less reactant, less product — mass is only rearranged, never lost.']],
          mistakes: [['"Mass decreased when the gas bubbled away"', 'In an open flask the gas escapes and the balance reading drops. In a closed flask the total mass stays the same.']],
          real: '5.3 g of sodium carbonate and 6.0 g of ethanoic acid give products with a total mass of 11.3 g in a closed flask.',
        }),
        def('Law of constant proportions (Proust)', 'In a chemical substance the elements are always present in a definite proportion by mass, whatever its source or method of preparation. In water, hydrogen : oxygen = 1 : 8 by mass.'),
        f('mass of oxygen = 8 × mass of hydrogen  (in water)', 'mass of oxygen equals eight times mass of hydrogen'),
        xp({
          title: 'What if? Make water from more hydrogen', formula: 'O = 8 × H; water = 9 × H',
          res: ['W', 'Mass of water formed', 'g', '9 * H', 1],
          vars: [['H', 'Mass of hydrogen that reacts', 'g', 0.5, 20, 0.5, 2]],
          notes: [['H', 'Twice the hydrogen needs twice the oxygen and gives twice the water — the 1 : 8 ratio never changes.', 'Less hydrogen, proportionally less water.']],
          mistakes: [['Using 2 : 1 for the mass ratio', 'H₂O has 2 hydrogen ATOMS for 1 oxygen atom, but by MASS it is 2 g : 16 g = 1 : 8.']],
          real: 'Whether water comes from a river in Khammam or a laboratory, 9 g of it always contains 1 g of hydrogen and 8 g of oxygen.',
        }),
        p('These laws led John Dalton to his atomic theory: matter is made of tiny indivisible atoms; atoms of an element are identical in mass and properties; atoms combine in small whole-number ratios to form compounds; and atoms are neither created nor destroyed in reactions.'),
        keys('Conservation of mass: total mass unchanged in a reaction.', 'Constant proportions: fixed mass ratio of elements in a compound.', 'Water H : O = 1 : 8; carbon dioxide C : O = 3 : 8.', 'Dalton\'s atomic theory explains both laws.'),
        remember('Conservation of mass is checked in a CLOSED system so that no gas escapes or enters.'),
      ],
      examples: [
        ex('3 g of carbon burns completely in 8 g of oxygen. What mass of carbon dioxide forms?', ['Conservation of mass: products = reactants', '3 + 8 = 11'], '11 g of carbon dioxide'),
        ex('How much oxygen is needed to react completely with 5 g of hydrogen to form water?', ['H : O = 1 : 8 by mass', 'O = 8 × 5'], '40 g of oxygen (giving 45 g of water)'),
      ],
      practice: [
        tp('cons', (r) => {
          const a = r.pick([2.4, 5.6, 6.5, 10, 12, 16, 24]);
          const b = r.pick([1.6, 3.2, 4, 7.3, 8]);
          const askOther = r.next() < 0.5;
          if (askOther) return numQ(`In a closed flask, ${a} g of a metal reacts completely with an acid to give ${rd(a + b, 2)} g of products in total. What mass of acid reacted?`, b, 'g', ['Mass of reactants = mass of products.'], [`Acid = ${rd(a + b, 2)} − ${a} = ${b} g`]);
          return numQ(`${a} g of substance A reacts completely with ${b} g of substance B in a sealed container. What is the total mass of the products?`, rd(a + b, 2), 'g', ['Law of conservation of mass.', 'Add the reactant masses.'], [`Products = ${a} + ${b} = ${rd(a + b, 2)} g`]);
        }),
        tp('prop', (r) => {
          const k = r.pick([1, 2, 3, 4, 5, 0.5]);
          const water = r.next() < 0.5;
          if (water) return numQ(`Hydrogen and oxygen combine in the ratio 1 : 8 by mass to form water. How much oxygen is needed to react with ${k} g of hydrogen?`, 8 * k, 'g', ['O = 8 × H'], [`O = 8 × ${k} = ${8 * k} g`], [{ when: `${k / 2} g`, explain: 'The 2 : 1 ratio is for atoms, not mass. By mass it is 1 : 8.' }]);
          return numQ(`Carbon and oxygen combine in the ratio 3 : 8 by mass to form carbon dioxide. How much oxygen reacts with ${3 * k} g of carbon?`, 8 * k, 'g', ['O ÷ C = 8 ÷ 3', `O = ${3 * k} × 8/3`], [`O = ${3 * k} × 8 ÷ 3 = ${8 * k} g`]);
        }, 2),
        mcq('laws', 'Mass is conserved; composition is fixed.', [
          ['The law of conservation of mass was given by…', 'Lavoisier', ['Proust', 'Dalton', 'Newton'], 'French chemist who weighed reactions carefully.', 'Antoine Lavoisier stated the law of conservation of mass.'],
          ['The law of constant proportions was given by…', 'Proust', ['Lavoisier', 'Rutherford', 'Bohr'], 'Joseph …', 'Joseph Proust stated the law of definite (constant) proportions.'],
          ['In water, the ratio of masses of hydrogen and oxygen is…', '1 : 8', ['2 : 1', '1 : 16', '8 : 1'], '2 × 1 g : 16 g.', '2 g of hydrogen : 16 g of oxygen = 1 : 8.'],
          ['According to Dalton, atoms…', 'Are neither created nor destroyed in a chemical reaction', ['Can be split in a chemical reaction', 'Of one element differ in mass', 'Combine in any ratio, even fractions'], 'Which postulate explains conservation of mass?', 'If atoms are only rearranged, total mass stays the same.'],
          ['Pure water from a well and from a laboratory have…', 'The same composition by mass', ['Different compositions', 'Different elements', 'Different molecules'], 'Constant proportions.', 'A compound always has the same mass ratio of its elements.'],
          ['To verify conservation of mass, the reaction is done…', 'In a closed container', ['In an open dish', 'Under water', 'Only with solids'], 'Gases must not escape.', 'A closed container keeps every product inside to be weighed.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.atoms.symbols', title: 'Atoms, molecules, symbols, ions and formulae', prereqs: ['ts9.ps.atoms.laws'],
      intro: [
        h('The alphabet of chemistry'),
        photo('🧪', 'A label reading "CuSO₄" tells a chemist exactly which atoms, and how many, are in the blue crystals inside.'),
        def('Atom', 'The smallest particle of an element that takes part in a chemical reaction. Atoms are incredibly small — the radius of a hydrogen atom is about 10⁻¹⁰ m.'),
        def('Molecule', 'The smallest particle of an element or compound that can exist independently and shows its properties. The number of atoms in a molecule is its atomicity: O₂ (diatomic), O₃ (triatomic), P₄ (tetra-atomic), S₈ (poly-atomic). Noble gases like He and Ar are monatomic.'),
        p('Each element has a symbol of one or two letters, the first always a capital: H, O, C, N, Ca, Cl, Mg. Some come from Latin names: Na (natrium, sodium), K (kalium, potassium), Fe (ferrum, iron), Cu (cuprum, copper), Ag (argentum, silver), Au (aurum, gold), Pb (plumbum, lead), Hg (hydrargyrum, mercury).'),
        def('Ion', 'A charged atom or group of atoms. A positive ion is a cation (Na⁺, Ca²⁺, NH₄⁺); a negative ion is an anion (Cl⁻, O²⁻, OH⁻, NO₃⁻, SO₄²⁻, CO₃²⁻). A group of atoms carrying a charge is a polyatomic ion.'),
        def('Valency', 'The combining capacity of an element or ion. For ions it equals the size of the charge.'),
        h('Writing a formula — crossing over valencies'),
        p('Write the symbols (positive ion first), write each valency under it, cross them over as subscripts and reduce to the simplest ratio. Aluminium (3) and oxide (2) → Al₂O₃. Calcium (2) and chloride (1) → CaCl₂. Magnesium (2) and oxide (2) → Mg₂O₂ → MgO. Use brackets for more than one polyatomic ion: Ca(OH)₂, (NH₄)₂SO₄.'),
        keys('Symbols: capital letter first; some from Latin.', 'Atomicity: number of atoms in a molecule.', 'Cations positive, anions negative; polyatomic ions act as one unit.', 'Formula: criss-cross valencies, simplify, bracket polyatomic ions.'),
        remember('Na = sodium, K = potassium, Fe = iron, Cu = copper, Ag = silver, Au = gold, Pb = lead, Hg = mercury.'),
      ],
      examples: [
        ex('Write the formula of aluminium sulphate. (Al³⁺, SO₄²⁻)', ['Valencies: Al 3, SO₄ 2', 'Cross over: Al₂(SO₄)₃', 'Ratio 2 : 3 cannot be reduced'], 'Al₂(SO₄)₃'),
        ex('Write the formula of sodium oxide. (Na⁺, O²⁻)', ['Valencies: Na 1, O 2', 'Cross over: Na₂O₁'], 'Na₂O'),
      ],
      practice: [
        tp('formula', (r) => {
          const bank: [string, string, string[]][] = [
            ['calcium chloride (Ca²⁺, Cl⁻)', 'CaCl₂', ['CaCl', 'Ca₂Cl', 'Ca₂Cl₃']], ['aluminium oxide (Al³⁺, O²⁻)', 'Al₂O₃', ['AlO', 'Al₃O₂', 'AlO₃']],
            ['magnesium oxide (Mg²⁺, O²⁻)', 'MgO', ['Mg₂O₂', 'Mg₂O', 'MgO₂']], ['sodium sulphate (Na⁺, SO₄²⁻)', 'Na₂SO₄', ['NaSO₄', 'Na(SO₄)₂', 'Na₂(SO₄)₃']],
            ['calcium hydroxide (Ca²⁺, OH⁻)', 'Ca(OH)₂', ['CaOH', 'CaOH₂', 'Ca₂OH']], ['ammonium sulphate (NH₄⁺, SO₄²⁻)', '(NH₄)₂SO₄', ['NH₄SO₄', 'NH₄(SO₄)₂', 'N₂H₈SO₄₂']],
            ['calcium carbonate (Ca²⁺, CO₃²⁻)', 'CaCO₃', ['Ca₂CO₃', 'Ca(CO₃)₂', 'CaCO']], ['potassium nitrate (K⁺, NO₃⁻)', 'KNO₃', ['K₂NO₃', 'K(NO₃)₂', 'KNO']],
            ['aluminium chloride (Al³⁺, Cl⁻)', 'AlCl₃', ['AlCl', 'Al₃Cl', 'Al₂Cl₃']], ['sodium oxide (Na⁺, O²⁻)', 'Na₂O', ['NaO', 'NaO₂', 'Na₂O₂']],
          ];
          const [name, ans, wrong] = r.pick(bank);
          return {
            type: 'mcq', prompt: `Choose the correct formula of ${name}.`, ...choose(r, ans, wrong),
            hints: ['Write the valencies (sizes of the charges) under the symbols.', 'Cross them over and simplify; bracket polyatomic ions if more than one.'],
            mistakes: [{ when: 'wrong', explain: `Cross over the valencies: the correct formula is ${ans}.` }],
            solution: [`Criss-cross the charges and simplify → ${ans}.`],
          };
        }, 2),
        matchT('match', 'symbol to its element', [
          ['Na', 'Sodium'], ['K', 'Potassium'], ['Fe', 'Iron'], ['Cu', 'Copper'], ['Ag', 'Silver'], ['Au', 'Gold'], ['Pb', 'Lead'], ['Hg', 'Mercury'],
        ], ['Many symbols come from Latin names.', 'Ferrum → Fe, Argentum → Ag, Plumbum → Pb.']),
        mcq('ions', 'Cations are positive; anions are negative.', [
          ['The atomicity of ozone (O₃) is…', '3', ['1', '2', '8'], 'Count the atoms.', 'O₃ has three oxygen atoms.'],
          ['Which is a polyatomic ion?', 'SO₄²⁻', ['Cl⁻', 'Na⁺', 'O²⁻'], 'More than one atom.', 'Sulphate contains one S and four O atoms with a 2− charge.'],
          ['A negatively charged ion is called…', 'An anion', ['A cation', 'A molecule', 'An isotope'], 'Anion = negative.', 'Anions carry negative charge; cations positive.'],
          ['Which element is monatomic?', 'Argon', ['Oxygen', 'Nitrogen', 'Sulphur'], 'Noble gases exist as single atoms.', 'Argon is a noble gas whose atoms exist alone.'],
          ['The valency of the ammonium ion NH₄⁺ is…', '1', ['4', '3', '5'], 'Look at the charge.', 'The charge is +1, so its valency is 1.'],
          ['The symbol of potassium is K because…', 'It comes from the Latin name kalium', ['P is used for phosphorus and PO is not allowed', 'It was discovered by Kelvin', 'It is a random letter'], 'Latin origin.', 'K comes from the Latin "kalium".'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.atoms.mass', title: 'Atomic mass and molecular mass', prereqs: ['ts9.ps.atoms.symbols'],
      intro: [
        h('Weighing the unweighable'),
        photo('⚖', 'No balance can weigh a single atom, so chemists compare atoms with a standard atom instead.'),
        def('Atomic mass unit (u)', 'One-twelfth (1/12) of the mass of one atom of carbon-12. Atomic masses are given relative to this unit.'),
        p('On this scale: H = 1 u, C = 12 u, N = 14 u, O = 16 u, Na = 23 u, Mg = 24 u, Al = 27 u, S = 32 u, Cl = 35.5 u, K = 39 u, Ca = 40 u.'),
        def('Molecular mass', 'The sum of the atomic masses of all the atoms in a molecule. For ionic compounds the same sum is called the formula unit mass.'),
        f('molecular mass = Σ (number of atoms × atomic mass)', 'molecular mass equals the sum of number of atoms times atomic mass for each element'),
        xp({
          title: 'What if? Build a molecule CₓHᵧO_z', formula: 'M = 12x + 1y + 16z',
          res: ['M', 'Molecular mass', 'u', '12 * x + y + 16 * z', 0],
          vars: [['x', 'Carbon atoms', '', 0, 12, 1, 6], ['y', 'Hydrogen atoms', '', 0, 24, 1, 12], ['z', 'Oxygen atoms', '', 0, 12, 1, 6]],
          notes: [['x', 'Each extra carbon adds 12 u.', 'Removing a carbon takes away 12 u.'], ['z', 'Each oxygen adds 16 u — the heaviest of these three atoms.', 'Fewer oxygens, lighter molecule.']],
          mistakes: [['Forgetting the subscript', 'In H₂O count 2 hydrogens: 2 × 1 + 16 = 18 u, not 17.'], ['Adding subscripts instead of multiplying', 'Multiply each atomic mass by the number of that atom, then add.']],
          real: 'Glucose C₆H₁₂O₆: 6 × 12 + 12 × 1 + 6 × 16 = 180 u.',
        }),
        keys('u = 1/12 of the mass of a C-12 atom.', 'Molecular mass = sum of atomic masses.', 'Ionic compounds: formula unit mass.', 'Multiply by subscripts, then add.'),
        remember('Brackets multiply everything inside: Ca(OH)₂ = 40 + 2 × (16 + 1) = 74 u.'),
      ],
      examples: [
        ex('Find the molecular mass of sulphuric acid, H₂SO₄.', ['H: 2 × 1 = 2', 'S: 1 × 32 = 32', 'O: 4 × 16 = 64', 'Total = 2 + 32 + 64'], '98 u'),
        ex('Find the formula unit mass of calcium carbonate, CaCO₃.', ['Ca 40 + C 12 + O 3 × 16 = 48', '40 + 12 + 48'], '100 u'),
      ],
      practice: [
        tp('mr', (r) => {
          const [fm, m, work] = r.pick(MOLS);
          return numQ(`Find the molecular (or formula unit) mass of ${fm} in u. Use H = 1, C = 12, N = 14, O = 16, Na = 23, Mg = 24, S = 32, Cl = 35.5, Ca = 40. (Type just the number.)`, m, undefined,
            ['Multiply each atomic mass by the number of those atoms.', 'Add all the parts.'], [`${fm}: ${work} = ${m} u`], [], 0.005);
        }),
        tp('which', (r) => {
          const [fm, m] = r.pick(MOLS);
          const wrongs = MOLS.filter((x) => x[1] !== m).map((x) => x[0]);
          const picks = r.shuffle(wrongs).slice(0, 3);
          return {
            type: 'mcq', prompt: `Which substance has a molecular (formula unit) mass of ${m} u?`, ...choose(r, fm, picks),
            hints: ['Work out the mass of each option.', 'H 1, C 12, N 14, O 16, Na 23, Mg 24, S 32, Cl 35.5, Ca 40.'],
            mistakes: [{ when: 'wrong', explain: `Calculate each option; only ${fm} adds up to ${m} u.` }],
            solution: [`${fm} = ${m} u.`],
          };
        }, 2),
        mcq('unit', 'The standard is carbon-12.', [
          ['One atomic mass unit is…', '1/12 of the mass of a carbon-12 atom', ['The mass of one hydrogen atom exactly', '1/16 of the mass of an oxygen atom', '1 gram'], 'Carbon-12 is the reference.', 'Since 1961 the reference is 1/12 of a C-12 atom.'],
          ['The molecular mass of O₂ is…', '32 u', ['16 u', '8 u', '64 u'], 'Two oxygen atoms.', '2 × 16 = 32 u.'],
          ['For an ionic compound like NaCl we call the sum of atomic masses the…', 'Formula unit mass', ['Atomic number', 'Mass number', 'Valency'], 'Ionic compounds do not form molecules.', 'Ionic solids are made of ions, so we use formula units.'],
          ['The atomic mass of chlorine is 35.5 u because…', 'It is an average of its isotopes', ['It is measured wrongly', 'Atoms have half protons', 'It loses electrons'], 'Cl-35 and Cl-37 both exist.', 'Natural chlorine is a mixture of Cl-35 and Cl-37; the average is 35.5 u.'],
          ['The molecular mass of NH₃ is…', '17 u', ['15 u', '14 u', '18 u'], '14 + 3 × 1.', 'N 14 + 3 H = 17 u.'],
          ['Which has the greatest molecular mass?', 'C₆H₁₂O₆', ['H₂O', 'CO₂', 'CH₄'], 'Count the big atoms.', 'Glucose is 180 u, far above 18, 44 and 16.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.atoms.reactions', title: 'Types of chemical reactions and corrosion', prereqs: ['ts9.ps.atoms.symbols'],
      intro: [
        h('Signs that something new has formed'),
        photo('🔩', 'An iron bolt left outside in the rain turns reddish-brown — a slow chemical reaction called rusting.'),
        p('In a chemical reaction new substances form. Clues include a change of colour, gas bubbles, a precipitate, or a change in temperature. Reactions are grouped into a few main types:'),
        def('Combination reaction', 'Two or more substances combine to form a single product: CaO + H₂O → Ca(OH)₂ (slaking of lime, which releases heat).'),
        def('Decomposition reaction', 'One substance breaks down into two or more simpler ones, usually needing heat, light or electricity: CaCO₃ → CaO + CO₂ on heating.'),
        def('Displacement reaction', 'A more reactive element pushes a less reactive one out of its compound: Fe + CuSO₄ → FeSO₄ + Cu (blue solution turns green; brown copper coats the iron nail).'),
        def('Double displacement reaction', 'Two compounds exchange ions, often forming a precipitate: Na₂SO₄ + BaCl₂ → BaSO₄ (white precipitate) + 2NaCl.'),
        p('Reactions that give out heat are exothermic (burning, respiration, slaking of lime); those that take in heat are endothermic (decomposition of calcium carbonate).'),
        h('Corrosion'),
        def('Corrosion', 'The slow eating away of a metal by substances around it such as air, moisture and acids. Rusting of iron is the best-known example: rust is hydrated iron(III) oxide, Fe₂O₃·xH₂O.'),
        p('Iron rusts only when BOTH oxygen (air) and water (moisture) are present. Silver turns black (silver sulphide) and copper gets a green coat (basic copper carbonate). Corrosion is prevented by painting, oiling or greasing, galvanising (coating with zinc), chrome plating, and making alloys such as stainless steel.'),
        keys('Combination: A + B → AB.', 'Decomposition: AB → A + B.', 'Displacement: A + BC → AC + B (A more reactive).', 'Double displacement: AB + CD → AD + CB.', 'Rusting needs air and water; prevent by paint, oil, galvanising, alloying.'),
        remember('Iron nail in copper sulphate: the nail becomes brownish and the blue solution turns pale green.'),
      ],
      examples: [
        ex('Identify the type: Zn + 2HCl → ZnCl₂ + H₂.', ['Zinc (an element) replaces hydrogen from its compound.', 'One element pushes out another.'], 'Displacement reaction'),
        ex('Imran keeps three test tubes with iron nails: (A) in dry air with calcium chloride, (B) in boiled water with an oil layer, (C) in ordinary water open to air. Which rusts?', ['A: air but no moisture → no rust', 'B: water but no air → no rust', 'C: both air and water → rusts'], 'Only C — rusting needs both air and water'),
      ],
      practice: [
        tp('type', (r) => {
          const bank: [string, string][] = [
            ['CaO + H₂O → Ca(OH)₂', 'Combination'], ['2Mg + O₂ → 2MgO', 'Combination'], ['C + O₂ → CO₂', 'Combination'], ['2H₂ + O₂ → 2H₂O', 'Combination'],
            ['CaCO₃ → CaO + CO₂', 'Decomposition'], ['2H₂O → 2H₂ + O₂ (electricity)', 'Decomposition'], ['2AgCl → 2Ag + Cl₂ (sunlight)', 'Decomposition'],
            ['Fe + CuSO₄ → FeSO₄ + Cu', 'Displacement'], ['Zn + CuSO₄ → ZnSO₄ + Cu', 'Displacement'], ['Zn + 2HCl → ZnCl₂ + H₂', 'Displacement'],
            ['Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl', 'Double displacement'], ['AgNO₃ + NaCl → AgCl + NaNO₃', 'Double displacement'], ['Pb(NO₃)₂ + 2KI → PbI₂ + 2KNO₃', 'Double displacement'],
          ];
          const [eq, t] = r.pick(bank);
          const all = ['Combination', 'Decomposition', 'Displacement', 'Double displacement'];
          return {
            type: 'mcq', prompt: `What type of reaction is this? ${eq}`, ...choose(r, t, all.filter((x) => x !== t)),
            hints: ['Count reactants and products.', 'One product → combination; one reactant → decomposition; element swaps → displacement; two compounds swap → double displacement.'],
            mistakes: [{ when: 'wrong', explain: `Look at the pattern: this is ${t.toLowerCase()}.` }],
            solution: [`${eq} → ${t} reaction.`],
          };
        }),
        tapT('rust', 'Tap every method that helps PREVENT rusting of iron.', [
          ['Painting the iron gate', true], ['Galvanising (zinc coating)', true], ['Applying oil or grease', true], ['Making stainless steel (alloy)', true],
          ['Keeping it wet in open air', false], ['Washing it with salt water', false], ['Scratching off the paint', false],
        ], ['Rusting needs air and water.', 'A barrier or an alloy stops it.'], 'Any coating that keeps out air and water, or alloying, prevents rusting; salt water and exposure speed it up.'),
        mcq('corrosion', 'Rusting needs both air and moisture.', [
          ['Rust is chemically…', 'Hydrated iron(III) oxide', ['Iron sulphide', 'Iron carbonate', 'Pure iron'], 'Fe₂O₃·xH₂O.', 'Rust is hydrated iron(III) oxide.'],
          ['Silver articles turn black in air because of…', 'Silver sulphide forming', ['Silver oxide forming', 'Dust', 'Copper coating'], 'Sulphur compounds in air.', 'Silver reacts with sulphur compounds to form black silver sulphide.'],
          ['Galvanising means coating iron with…', 'Zinc', ['Tin', 'Copper', 'Paint'], 'Like corrugated roof sheets.', 'Galvanised iron has a zinc coating.'],
          ['Which pair is needed for iron to rust?', 'Oxygen and water', ['Oxygen and nitrogen', 'Water and salt only', 'Carbon dioxide only'], 'Remember the three test-tube experiment.', 'Iron rusts only when both oxygen (air) and moisture are present.'],
          ['When an iron nail is kept in copper sulphate solution, the solution turns…', 'Pale green', ['Deep blue', 'Red', 'Colourless and then blue'], 'FeSO₄ forms.', 'Iron sulphate solution is pale green.'],
          ['Burning of natural gas is…', 'Exothermic', ['Endothermic', 'A decomposition', 'A double displacement'], 'It gives out heat.', 'Combustion releases heat — exothermic.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Floating bodies
// =====================================================================================
const SOLIDS: [string, number][] = [['iron', 7.8], ['aluminium', 2.7], ['copper', 8.9], ['wood (teak)', 0.6], ['ice', 0.92], ['glass', 2.5], ['cork', 0.25], ['lead', 11.3]];

const ch8: USpec = {
  id: 'ts9.ps.ch8', subject: 'physics', title: 'Floating bodies', source: src(8),
  objectives: [
    {
      id: 'ts9.ps.float.density', title: 'Density and relative density', prereqs: [],
      intro: [
        h('Heavy for its size'),
        photo('🪨', 'A small stone sinks in a pond while a huge log floats. Size alone does not decide — density does.'),
        def('Density', 'Mass per unit volume of a substance: ρ = m/V. SI unit: kg/m³; also often g/cm³ (1 g/cm³ = 1000 kg/m³). Water has a density of 1 g/cm³ = 1000 kg/m³.'),
        f('ρ = m / V', 'density equals mass divided by volume'),
        xp({
          title: 'What if? Change mass or volume', formula: 'ρ = m/V',
          res: ['rho', 'Density', 'g/cm³', 'm / V', 2],
          vars: [['m', 'Mass', 'g', 10, 1000, 10, 270], ['V', 'Volume', 'cm³', 10, 500, 10, 100]],
          notes: [['m', 'More mass packed into the same volume → denser.', 'Less mass in the same volume → less dense.'], ['V', 'The same mass spread over a bigger volume is less dense.', 'Squeezing the same mass into a smaller volume makes it denser.']],
          mistakes: [['Thinking a bigger piece of iron is denser', 'Cutting a piece in half halves both mass and volume: density, a property of the material, stays the same.']],
          real: '270 g of aluminium has a volume of 100 cm³, so its density is 2.7 g/cm³.',
        }),
        def('Relative density (RD)', 'The density of a substance divided by the density of water: RD = ρ(substance) / ρ(water). It has no unit. Numerically it equals the density in g/cm³.'),
        f('RD = density of substance ÷ density of water', 'relative density equals density of substance divided by density of water'),
        xp({
          title: 'What if? Compare with water', formula: 'RD = ρ / 1000 (ρ in kg/m³)',
          res: ['RD', 'Relative density', '', 'rho / 1000', 2],
          vars: [['rho', 'Density of substance', 'kg/m³', 100, 20000, 100, 2700]],
          notes: [['rho', 'RD above 1 → the substance sinks in water.', 'RD below 1 → it floats in water.']],
          mistakes: [['Giving RD a unit', 'RD is a ratio of two densities, so it has no unit.']],
          real: 'Milk has an RD of about 1.03; a lactometer uses this to check whether water has been added.',
        }),
        p('Relative density can also be measured with a spring balance: RD = weight in air ÷ loss of weight in water.'),
        keys('ρ = m/V; units kg/m³ or g/cm³.', 'Water: 1 g/cm³ = 1000 kg/m³.', 'RD = ρ/ρ_water; no unit.', 'RD > 1 sinks; RD < 1 floats in water.'),
        remember('To convert g/cm³ to kg/m³, multiply by 1000.'),
      ],
      examples: [
        ex('A block of mass 540 g has a volume of 200 cm³. Find its density and relative density.', ['ρ = 540 ÷ 200 = 2.7 g/cm³', 'RD = 2.7 ÷ 1 = 2.7'], 'ρ = 2.7 g/cm³ (2700 kg/m³); RD = 2.7'),
        ex('A stone weighs 3 N in air and 2 N when fully under water. Find its relative density.', ['Loss of weight = 3 − 2 = 1 N', 'RD = weight in air ÷ loss of weight = 3 ÷ 1'], 'RD = 3'),
      ],
      practice: [
        tp('rho', (r) => {
          const [name, d] = r.pick(SOLIDS);
          const V = r.pick([10, 20, 50, 100, 200]);
          const m = rd(d * V, 2);
          return numQ(`A piece of ${name} has a mass of ${m} g and a volume of ${V} cm³. Find its density.`, d, 'g/cm³', ['ρ = m/V'], [`ρ = ${m} ÷ ${V} = ${d} g/cm³`], [{ when: `${rd(V / m, 3)} g/cm³`, explain: 'Put mass on top: ρ = m/V.' }]);
        }),
        tp('rd', (r) => {
          const w = r.pick([2, 3, 4, 5, 6, 8, 10]);
          const loss = r.pick([0.5, 1, 2]);
          const ans = rd(w / loss, 3);
          return numQ(`An object weighs ${w} N in air and ${rd(w - loss, 2)} N when completely immersed in water. Find its relative density.`, ans, undefined,
            ['Loss of weight = weight in air − weight in water.', 'RD = weight in air ÷ loss of weight.'], [`Loss = ${w} − ${rd(w - loss, 2)} = ${loss} N`, `RD = ${w} ÷ ${loss} = ${ans}`],
            [{ when: String(rd(w / (w - loss), 3)), explain: 'Divide by the LOSS of weight, not by the weight in water.' }]);
        }, 2),
        mcq('concept', 'Density belongs to the material, not the size.', [
          ['The SI unit of density is…', 'kg/m³', ['g', 'kg/m²', 'N/m³'], 'Mass ÷ volume.', 'kg ÷ m³ = kg/m³.'],
          ['A piece of iron is cut into two equal halves. The density of each half is…', 'The same as before', ['Half', 'Double', 'Zero'], 'Mass and volume both halve.', 'Density is a property of the substance; it does not change with size.'],
          ['Relative density of a substance is 2.5. Its density is…', '2500 kg/m³', ['25 kg/m³', '250 kg/m³', '2.5 kg/m³'], 'Multiply by the density of water.', '2.5 × 1000 kg/m³ = 2500 kg/m³.'],
          ['The density of water is…', '1000 kg/m³', ['1 kg/m³', '100 kg/m³', '10 kg/m³'], '1 g per cm³.', '1 g/cm³ = 1000 kg/m³.'],
          ['A lactometer measures the…', 'Relative density (purity) of milk', ['Temperature of milk', 'Fat in butter', 'Pressure of air'], 'Diluted milk is less dense.', 'A lactometer floats lower in watered-down milk.'],
          ['Relative density has…', 'No unit', ['Unit kg/m³', 'Unit g/cm³', 'Unit N'], 'A ratio.', 'It is one density divided by another.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.float.buoyancy', title: 'Buoyancy, floating and sinking, and Archimedes\' principle', prereqs: ['ts9.ps.float.density'],
      intro: [
        h('The upward push of a liquid'),
        photo('🚢', 'A steel ship weighing thousands of tonnes floats, yet a steel nail sinks.'),
        p('Push an empty plastic bottle into a bucket of water: you feel the water pushing it back up. Any liquid (or gas) pushes up on a body placed in it. This upward force is called buoyant force or upthrust, and the effect is buoyancy.'),
        def('Archimedes\' principle', 'When a body is wholly or partially immersed in a fluid, it experiences an upward force equal to the weight of the fluid displaced by it.'),
        f('F_b = ρ_liquid × V_displaced × g', 'buoyant force equals density of liquid times volume displaced times g'),
        xp({
          title: 'What if? Change the liquid or the volume under it', formula: 'F_b = ρVg',
          res: ['Fb', 'Buoyant force', 'N', 'rho * V * 10', 2],
          vars: [['rho', 'Density of liquid', 'kg/m³', 700, 13600, 100, 1000], ['V', 'Volume immersed', 'm³', 0.0001, 0.01, 0.0001, 0.001]],
          notes: [['rho', 'A denser liquid pushes up harder — it is easier to float in sea water than in river water.', 'A less dense liquid (like kerosene) gives less upthrust.'], ['V', 'Pushing more of the body under the liquid displaces more liquid and increases the upthrust.', 'Less volume under the liquid, less upthrust.']],
          mistakes: [['Using the density of the OBJECT', 'Buoyant force depends on the density of the LIQUID and the volume displaced.'], ['Thinking deeper means more buoyancy', 'Once fully immersed, the upthrust does not change with depth.']],
          real: 'A 1-litre (0.001 m³) block fully in water feels an upthrust of 1000 × 0.001 × 10 = 10 N (taking g = 10 m/s²).',
        }),
        h('Float or sink?'),
        p('If the weight of the body is more than the greatest upthrust it can get, it sinks. A body denser than the liquid sinks; a body less dense floats. A floating body sinks just enough to displace its own weight of liquid (law of flotation). A steel ship floats because its hollow shape displaces a huge volume of water.'),
        f('fraction submerged = ρ_body / ρ_liquid', 'the fraction under the surface equals density of the body over density of the liquid'),
        xp({
          title: 'What if? How much of a floating block is under water?', formula: 'fraction = ρ_body / ρ_liquid',
          res: ['fr', 'Percentage submerged', '%', '100 * b / l', 0],
          vars: [['b', 'Density of the body', 'kg/m³', 100, 1000, 10, 600], ['l', 'Density of the liquid', 'kg/m³', 1000, 1300, 10, 1000]],
          notes: [['b', 'A denser floating body sits lower; at equal densities it is fully under but does not sink.', 'A lighter body (like cork) rides high.'], ['l', 'In denser liquid (salt water) the body floats higher.', 'In less dense liquid the body sinks deeper.']],
          mistakes: [['Inverting the ratio', 'The fraction under water must be less than 1 for floating, so the body\'s density goes on top.']],
          real: 'Ice (920 kg/m³) floats with about 92% under water — the "tip of the iceberg" is only about one-tenth.',
        }),
        keys('Buoyant force = weight of fluid displaced (Archimedes).', 'ρ_body > ρ_liquid → sinks; less → floats.', 'Floating: weight of body = weight of liquid displaced.', 'Apparent weight = real weight − buoyant force.'),
        remember('Apparent loss of weight in a liquid = buoyant force = weight of liquid displaced.'),
      ],
      examples: [
        ex('A stone of volume 500 cm³ is fully immersed in water. Find the buoyant force. (g = 10 m/s²)', ['V = 500 cm³ = 0.0005 m³', 'F_b = 1000 × 0.0005 × 10'], '5 N'),
        ex('A wooden block of density 600 kg/m³ floats in water. What percentage of it is under water?', ['fraction = 600 ÷ 1000 = 0.6'], '60%'),
      ],
      practice: [
        tp('fb', (r) => {
          const Vc = r.pick([100, 200, 250, 500, 1000, 2000]);
          const [lname, rho] = r.pick([['water', 1000], ['sea water', 1030], ['kerosene', 800], ['glycerine', 1260]] as [string, number][]);
          const F = rd(rho * Vc * 1e-6 * 10, 3);
          return numQ(`A body of volume ${Vc} cm³ is fully immersed in ${lname} (density ${rho} kg/m³). Find the buoyant force on it. (g = 10 m/s²)`, F, 'N',
            ['Convert cm³ to m³: divide by 1 000 000.', 'F_b = ρ × V × g'], [`V = ${Vc} cm³ = ${rd(Vc * 1e-6, 6)} m³`, `F_b = ${rho} × ${rd(Vc * 1e-6, 6)} × 10 = ${F} N`],
            [{ when: `${rd(rho * Vc * 10, 0)} N`, explain: 'Convert the volume to m³ before multiplying (1 cm³ = 10⁻⁶ m³).' }], 0.01);
        }, 2),
        tp('float', (r) => {
          const [name, d] = r.pick(SOLIDS);
          const sinks = d > 1;
          return {
            type: 'mcq', prompt: `A solid block of ${name} (density ${d} g/cm³) is put in water (1 g/cm³). What happens?`,
            ...choose(r, sinks ? 'It sinks' : 'It floats', [sinks ? 'It floats' : 'It sinks', 'It rises out of the water completely', 'It dissolves']),
            hints: ['Compare the density of the block with that of water.', 'Denser than water → sinks.'],
            mistakes: [{ when: 'wrong', explain: `${d} g/cm³ is ${sinks ? 'more' : 'less'} than 1 g/cm³, so it ${sinks ? 'sinks' : 'floats'}.` }],
            solution: [`${d} ${sinks ? '>' : '<'} 1 g/cm³ → ${sinks ? 'sinks' : 'floats'}.`],
          };
        }),
        tp('apparent', (r) => {
          const W = r.pick([5, 8, 10, 12, 20]);
          const Fb = r.pick([1, 2, 3, 4]);
          return numQ(`An object weighs ${W} N in air. When fully immersed in water, it displaces water weighing ${Fb} N. What will a spring balance read now?`, W - Fb, 'N',
            ['Buoyant force = weight of water displaced.', 'Apparent weight = real weight − buoyant force.'], [`Apparent weight = ${W} − ${Fb} = ${W - Fb} N`],
            [{ when: `${W + Fb} N`, explain: 'The upthrust acts upward, so the reading is LESS than the real weight.' }]);
        }),
        mcq('arch', 'Upthrust = weight of fluid displaced.', [
          ['Archimedes\' principle states that the upthrust equals…', 'The weight of fluid displaced', ['The weight of the body', 'The volume of the body', 'The density of the fluid'], 'Displaced fluid.', 'Upthrust equals the weight of the fluid pushed aside.'],
          ['A steel ship floats because…', 'Its hollow shape displaces water equal to its weight', ['Steel is lighter than water', 'Water has no upthrust on steel', 'Air pushes it up'], 'Volume displaced.', 'The ship\'s shape displaces a large volume, giving enough upthrust.'],
          ['It is easier to float in the sea than in a river because sea water is…', 'Denser', ['Less dense', 'Warmer', 'Deeper'], 'Salt increases density.', 'Denser liquid gives more upthrust for the same volume.'],
          ['A submarine dives by…', 'Filling its tanks with water to increase its weight', ['Reducing its volume', 'Pumping air into tanks', 'Switching off its engine'], 'Heavier than the upthrust.', 'Extra water makes its weight exceed the upthrust.'],
          ['A floating body displaces liquid whose weight is…', 'Equal to its own weight', ['More than its weight', 'Less than its weight', 'Zero'], 'Law of flotation.', 'In floating, upthrust balances weight exactly.'],
          ['Hydrometers and lactometers work on the principle of…', 'Floatation (Archimedes\' principle)', ['Pascal\'s law', 'Inertia', 'Total internal reflection'], 'They float at different depths.', 'They float lower in less dense liquids.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.float.pressure', title: 'Pressure in liquids and measuring atmospheric pressure', prereqs: ['ts9.ps.float.density'],
      intro: [
        h('An ocean of air above us'),
        photo('🌍', 'We live at the bottom of a sea of air about a hundred kilometres deep. Its weight presses on everything.'),
        def('Pressure', 'Force acting per unit area. SI unit: pascal (Pa) = 1 N/m².'),
        p('A liquid presses on the base and walls of its container and on anything inside it. The deeper you go, the more liquid there is above you, so the pressure increases with depth. Pressure at depth h in a liquid of density ρ is:'),
        f('P = h ρ g', 'pressure equals height times density times g'),
        xp({
          title: 'What if? Dive deeper, or change the liquid', formula: 'P = hρg',
          res: ['P', 'Pressure due to the liquid', 'Pa', 'h * rho * g', 0],
          vars: [['h', 'Depth', 'm', 0.1, 20, 0.1, 5], ['rho', 'Density of liquid', 'kg/m³', 800, 13600, 100, 1000], ['g', 'g', 'm/s²', 9.8, 10, 0.2, 10]],
          notes: [['h', 'Twice as deep, twice the pressure — dams are built thicker at the bottom.', 'Near the surface the pressure due to the liquid is small.'], ['rho', 'A denser liquid like mercury gives much more pressure for the same depth.', 'A lighter liquid gives less pressure.']],
          mistakes: [['Thinking a wider container gives more pressure', 'Pressure depends only on depth, density and g — not on the shape or width of the container.']],
          real: 'At 10 m under water the extra pressure is about 10 × 1000 × 10 = 100 000 Pa — about one more atmosphere.',
        }),
        h('Measuring atmospheric pressure'),
        p('Torricelli filled a 1 m glass tube with mercury and turned it upside down into a dish of mercury. The mercury fell and stopped at a height of about 76 cm, leaving vacuum above. The air pressing on the mercury in the dish holds up this column. So atmospheric pressure = pressure of 76 cm of mercury ≈ 0.76 × 13 600 × 9.8 ≈ 1.01 × 10⁵ Pa. This instrument is a mercury barometer.'),
        p('Mercury is used because it is very dense; a water barometer would need a tube over 10 m tall. Atmospheric pressure decreases with height, which is why fountain pens may leak in aeroplanes and why it is harder to cook on hills.'),
        keys('Pressure = force/area; unit Pa.', 'Liquid pressure P = hρg increases with depth.', 'Atmospheric pressure ≈ 76 cm of mercury ≈ 1.01 × 10⁵ Pa.', 'Barometers measure atmospheric pressure; it falls with altitude.'),
        remember('1 atmosphere ≈ 76 cm of Hg ≈ 1.01 × 10⁵ Pa ≈ 10.3 m of water.'),
      ],
      examples: [
        ex('Find the pressure due to water at the bottom of a 3 m deep tank. (g = 10 m/s²)', ['P = hρg', 'P = 3 × 1000 × 10'], '30 000 Pa'),
        ex('Show that 76 cm of mercury is about 1.01 × 10⁵ Pa. (ρ = 13 600 kg/m³, g = 9.8 m/s²)', ['h = 0.76 m', 'P = 0.76 × 13 600 × 9.8 ≈ 101 293 Pa'], '≈ 1.01 × 10⁵ Pa'),
      ],
      practice: [
        tp('hrg', (r) => {
          const h0 = r.pick([0.5, 1, 2, 4, 5, 8, 10, 15]);
          const [lname, rho] = r.pick([['water', 1000], ['sea water', 1030], ['kerosene', 800], ['mercury', 13600]] as [string, number][]);
          const P = rd(h0 * rho * 10, 2);
          return numQ(`Find the pressure due to ${lname} (density ${rho} kg/m³) at a depth of ${h0} m. (g = 10 m/s²)`, P, 'Pa', ['P = hρg', `P = ${h0} × ${rho} × 10`], [`P = ${P} Pa`], [{ when: `${rd(h0 * rho, 2)} Pa`, explain: 'Remember to multiply by g as well.' }]);
        }),
        mcq('atm', 'Air has weight, so it presses on everything.', [
          ['The normal atmospheric pressure is about…', '76 cm of mercury', ['76 m of mercury', '10 cm of water', '1 Pa'], 'Torricelli\'s tube.', 'The air supports a mercury column about 76 cm high.'],
          ['Mercury is used in barometers because…', 'It is very dense, so the column is short', ['It is cheap', 'It is transparent', 'It evaporates quickly'], 'A water barometer would be over 10 m tall.', 'High density gives a manageable column height.'],
          ['Atmospheric pressure as we go up a mountain…', 'Decreases', ['Increases', 'Stays the same', 'Becomes zero at 1 km'], 'Less air above you.', 'There is less air above, so less pressure.'],
          ['The SI unit of pressure is…', 'Pascal (N/m²)', ['Newton', 'Joule', 'kg/m³'], 'Force per area.', '1 Pa = 1 N/m².'],
          ['Why are dams made thicker at the bottom?', 'Water pressure increases with depth', ['Water is lighter at the bottom', 'To look strong', 'Pressure is less at the bottom'], 'P = hρg.', 'The deepest water presses hardest, so the base must be strongest.'],
          ['The space above the mercury in Torricelli\'s tube is…', 'Nearly a vacuum', ['Filled with air', 'Filled with water vapour at high pressure', 'Filled with mercury'], 'Mercury fell, leaving empty space.', 'No air could enter, so the space is almost a vacuum.'],
        ]),
        tapT('tap', 'Tap every statement that is TRUE about pressure.', [
          ['Liquid pressure increases with depth', true], ['A barometer measures atmospheric pressure', true], ['Pressure at a depth depends on the density of the liquid', true], ['Air pressure is lower on a hilltop than at sea level', true],
          ['Liquid pressure depends on the width of the container', false], ['Atmospheric pressure is zero at sea level', false], ['Water barometers need shorter tubes than mercury ones', false],
        ], ['Use P = hρg.', 'Shape of container does not matter.'], 'Pressure grows with depth and density, is measured by barometers and falls with altitude.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — What is inside the atom
// =====================================================================================
const ELEMS = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium', 'Aluminium', 'Silicon', 'Phosphorus', 'Sulphur', 'Chlorine', 'Argon', 'Potassium', 'Calcium'];
const config = (z: number): number[] => { const out: number[] = []; let left = z; for (const cap of [2, 8, 8, 2]) { if (left <= 0) break; const k = Math.min(cap, left); out.push(k); left -= k; } return out; };
const valency = (z: number) => { if ([2, 10, 18].includes(z)) return 0; const v = config(z).slice(-1)[0]; return z === 1 ? 1 : v <= 4 ? v : 8 - v; };
const ISOS: [string, string, number, number][] = [
  ['Carbon-12', 'C', 6, 12], ['Carbon-14', 'C', 6, 14], ['Chlorine-35', 'Cl', 17, 35], ['Chlorine-37', 'Cl', 17, 37], ['Sodium-23', 'Na', 11, 23], ['Aluminium-27', 'Al', 13, 27],
  ['Deuterium', 'H', 1, 2], ['Tritium', 'H', 1, 3], ['Oxygen-16', 'O', 8, 16], ['Oxygen-18', 'O', 8, 18], ['Uranium-235', 'U', 92, 235], ['Cobalt-60', 'Co', 27, 60], ['Iodine-131', 'I', 53, 131], ['Calcium-40', 'Ca', 20, 40],
];

const ch9: USpec = {
  id: 'ts9.ps.ch9', subject: 'chemistry', title: 'What is inside the atom', source: src(9),
  objectives: [
    {
      id: 'ts9.ps.atom.structure', title: 'Sub-atomic particles and models of the atom', prereqs: [],
      intro: [
        h('Dalton\'s "indivisible" atom breaks open'),
        photo('🔬', 'No microscope in a school lab can show the inside of an atom; scientists worked it out from clever experiments.'),
        p('Dalton thought atoms could not be divided. But experiments with electric discharge through gases around 1900 showed that atoms contain even smaller charged particles.'),
        def('Electron (e⁻)', 'A negatively charged particle (charge −1) with a very tiny mass, about 1/1840 of a hydrogen atom. Discovered by J. J. Thomson through cathode rays.'),
        def('Proton (p⁺)', 'A positively charged particle (charge +1) with a mass of about 1 u. Its existence was shown by E. Goldstein\'s canal rays.'),
        def('Neutron (n)', 'A particle with no charge and a mass of about 1 u, found in the nucleus. Discovered by James Chadwick in 1932. (Ordinary hydrogen has no neutron.)'),
        h('Picturing the atom'),
        p('Thomson\'s model: the atom is a sphere of positive charge with electrons embedded in it, like seeds in a watermelon; overall neutral.'),
        p('Rutherford fired fast alpha particles (positively charged) at a very thin gold foil. Most went straight through, some were deflected by small angles, and very few (about 1 in 12 000) bounced back. He concluded: most of the atom is empty space; all the positive charge and almost all the mass are concentrated in a tiny nucleus at the centre; electrons revolve around the nucleus. But a revolving charge should lose energy and fall into the nucleus — so his model could not explain why atoms are stable.'),
        p('Niels Bohr fixed this: electrons revolve only in certain permitted orbits (energy levels or shells), named K, L, M, N… (n = 1, 2, 3, 4…). While in these orbits they do not radiate energy.'),
        keys('Electron: −1, ≈ 1/1840 u. Proton: +1, ≈ 1 u. Neutron: 0, ≈ 1 u.', 'Thomson: watermelon model.', 'Rutherford: tiny dense positive nucleus; mostly empty space.', 'Bohr: fixed shells K, L, M, N; no energy lost in them.'),
        remember('Gold-foil result: MOST alpha particles pass straight through → atom is mostly empty space.'),
      ],
      examples: [
        ex('Why did only a few alpha particles bounce back from the gold foil?', ['To bounce back, an alpha particle must nearly hit the positive nucleus head on.', 'The nucleus is tiny compared to the atom.', 'So such hits are very rare.'], 'Because the nucleus is extremely small compared to the size of the atom.'),
        ex('An atom has 8 protons and 8 neutrons. What is the charge on its nucleus and its approximate mass?', ['Charge = +8 (protons only)', 'Mass ≈ 8 + 8 = 16 u (electrons are negligible)'], 'Charge +8; mass ≈ 16 u'),
      ],
      practice: [
        matchT('particles', 'particle or scientist to the right fact', [
          ['Electron', 'Charge −1, negligible mass'], ['Proton', 'Charge +1, mass about 1 u'], ['Neutron', 'No charge, mass about 1 u'],
          ['J. J. Thomson', 'Discovered the electron'], ['Chadwick', 'Discovered the neutron'], ['Rutherford', 'Gold-foil experiment, nucleus'], ['Bohr', 'Fixed energy shells'],
        ], ['Start with the three particles.', 'Then link each scientist to his discovery.']),
        mcq('models', 'Remember each model and its weakness.', [
          ['In Rutherford\'s experiment most alpha particles passed straight through. This shows that…', 'Most of the atom is empty space', ['The nucleus is large', 'Electrons are heavy', 'Gold is very thin'], 'No obstacle in the way.', 'Most of the atom has nothing to deflect the particles.'],
          ['Thomson\'s model of the atom is compared to a…', 'Watermelon (seeds in red pulp)', ['Solar system', 'Hollow ball', 'Onion'], 'Electrons embedded in positive matter.', 'Electrons are scattered in a positive sphere like seeds in a watermelon.'],
          ['The main drawback of Rutherford\'s model was that it could not explain…', 'The stability of the atom', ['The nucleus', 'Positive charge', 'Alpha particles'], 'Revolving charges lose energy.', 'Electrons should spiral into the nucleus, but atoms are stable.'],
          ['According to Bohr, while revolving in a permitted orbit an electron…', 'Does not radiate energy', ['Keeps losing energy', 'Gains mass', 'Becomes a proton'], 'Stationary orbits.', 'Bohr\'s postulate: no energy is radiated in permitted orbits.'],
          ['The neutron was discovered by…', 'James Chadwick', ['J. J. Thomson', 'Goldstein', 'Dalton'], '1932.', 'Chadwick discovered the neutron in 1932.'],
          ['The mass of an electron compared with a proton is about…', '1/1840', ['Equal', 'Double', '1/2'], 'Very, very small.', 'An electron is about 1840 times lighter than a proton.'],
        ]),
        orderT('history', 'Arrange these ideas about the atom in the order they were proposed.', [
          'Dalton: atoms are indivisible', 'Thomson: electrons embedded in a positive sphere', 'Rutherford: tiny dense nucleus with electrons around it', 'Bohr: electrons in fixed shells', 'Chadwick: neutrons in the nucleus',
        ], ['Dalton came first, around 1808.', 'The neutron was found last (1932).'], 'Dalton → Thomson → Rutherford → Bohr → Chadwick.'),
      ],
    },
    {
      id: 'ts9.ps.atom.shells', title: 'Distribution of electrons in shells and valency', prereqs: ['ts9.ps.atom.structure'],
      intro: [
        h('Filling the shells'),
        photo('🧅', 'Like the layers of an onion, electrons are arranged in shells around the nucleus.'),
        p('Bohr and Bury gave simple rules for arranging electrons in the shells of the first 20 elements:'),
        p('1. The maximum number of electrons in a shell is 2n², where n is the shell number: K (n = 1) holds 2, L (n = 2) holds 8, M (n = 3) holds 18, N (n = 4) holds 32. 2. The outermost shell can hold at most 8 electrons. 3. Shells fill step-wise — an inner shell is filled before electrons go into the next one (for the first 18 elements; potassium and calcium put electrons into N after M has 8).'),
        f('maximum electrons in shell n = 2n²', 'maximum electrons equals two n squared'),
        xp({
          title: 'What if? Go to an outer shell', formula: 'N_max = 2n²',
          res: ['N', 'Maximum electrons in the shell', '', '2 * n^2', 0],
          vars: [['n', 'Shell number', '', 1, 4, 1, 2]],
          notes: [['n', 'Outer shells are bigger and can hold many more electrons: 2, 8, 18, 32.', 'Inner shells hold fewer electrons.']],
          mistakes: [['Writing 2n instead of 2n²', 'For n = 3: 2 × 3² = 18, not 6.'], ['Putting 9 or more electrons in the outermost shell', 'The OUTERMOST shell can hold at most 8 electrons even if 2n² is bigger.']],
          real: 'Sodium (11 electrons) is 2, 8, 1: K full, L full, one lonely electron in M.',
        }),
        def('Valence electrons', 'The electrons in the outermost shell. They decide how an atom reacts.'),
        def('Valency', 'The combining capacity of an atom: the number of electrons it loses, gains or shares to get a full outer shell (octet, or duplet for H and He). If valence electrons are 1–4, valency usually equals that number; if 5–8, valency = 8 − valence electrons. Noble gases have valency 0.'),
        keys('Shell capacity 2n²: 2, 8, 18, 32.', 'Outermost shell: max 8.', 'Fill inner shells first.', 'Valency: valence electrons (1–4) or 8 − valence electrons (5–8).'),
        remember('First 20: …Ar 2,8,8; K 2,8,8,1; Ca 2,8,8,2.'),
      ],
      examples: [
        ex('Write the electronic configuration and valency of chlorine (Z = 17).', ['K: 2, L: 8, M: 7 → 2, 8, 7', 'Valence electrons 7 → needs 1 more', 'Valency = 8 − 7 = 1'], '2, 8, 7; valency 1'),
        ex('Write the electronic configuration and valency of magnesium (Z = 12).', ['K: 2, L: 8, M: 2 → 2, 8, 2', 'Loses 2 electrons'], '2, 8, 2; valency 2'),
      ],
      practice: [
        tp('config', (r) => {
          const z = r.int(3, 20);
          const c = config(z).join(', ');
          const wrong = [config(z + 1).join(', '), config(z - 1).join(', '), z > 10 ? `2, ${z - 2}` : `${z}`];
          return {
            type: 'mcq', prompt: `What is the electronic configuration of ${ELEMS[z - 1]} (atomic number ${z})?`, ...choose(r, c, wrong),
            hints: ['Fill K (2), then L (8), then M (up to 8), then N.', `Total electrons = ${z}.`],
            mistakes: [{ when: 'wrong', explain: `Fill shells in order: ${c} adds up to ${z}.` }],
            solution: [`${ELEMS[z - 1]}: ${c}`],
          };
        }),
        tp('val', (r) => {
          const z = r.int(1, 20);
          const v = valency(z);
          const c = config(z);
          return numQ(`What is the valency of ${ELEMS[z - 1]} (atomic number ${z})?`, v, undefined,
            ['Write the electronic configuration first.', 'Valence electrons 1–4 → same number; 5–8 → 8 minus that number; full shell → 0.'],
            [`Configuration: ${c.join(', ')}`, `Valence electrons: ${c[c.length - 1]}`, `Valency = ${v}`], [], 0);
        }, 2),
        tp('cap', (r) => {
          const n = r.int(1, 4);
          return numQ(r.next() < 0.5 ? `What is the maximum number of electrons the shell n = ${n} (${'KLMN'[n - 1]} shell) can hold?` : `Using the 2n² rule, how many electrons at most can the ${'KLMN'[n - 1]} shell (shell number ${n}) accommodate?`, 2 * n * n, undefined, ['Use 2n².'], [`2 × ${n}² = ${2 * n * n}`], [{ when: String(2 * n), explain: 'Square n first: 2n², not 2n.' }], 0);
        }),
      ],
    },
    {
      id: 'ts9.ps.atom.isotopes', title: 'Atomic number, mass number, symbols of atoms and isotopes', prereqs: ['ts9.ps.atom.shells'],
      intro: [
        h('An atom\'s identity card'),
        photo('🔢', 'Two numbers written beside a symbol tell you how many protons, neutrons and electrons an atom has.'),
        def('Atomic number (Z)', 'The number of protons in the nucleus. It defines the element: every carbon atom has Z = 6. In a neutral atom, electrons = protons.'),
        def('Mass number (A)', 'The total number of protons and neutrons (nucleons) in the nucleus.'),
        f('number of neutrons N = A − Z', 'neutrons equals mass number minus atomic number'),
        xp({
          title: 'What if? Add nucleons to the nucleus', formula: 'N = A − Z',
          res: ['N', 'Number of neutrons', '', 'A - Z', 0],
          vars: [['A', 'Mass number', '', 20, 60, 1, 35], ['Z', 'Atomic number', '', 1, 20, 1, 17]],
          notes: [['A', 'For the same element (same Z), a larger A means more neutrons — a heavier isotope.', 'A smaller A means fewer neutrons.'], ['Z', 'Raising Z changes the element itself.', 'Lowering Z gives a different element too.']],
          mistakes: [['Adding A and Z', 'Mass number already includes protons; subtract Z to get neutrons.']],
          real: 'Chlorine-35 (Z = 17) has 35 − 17 = 18 neutrons; chlorine-37 has 20.',
        }),
        p('The symbol of an atom is written with A as a superscript and Z as a subscript on the left: ²³₁₁Na means sodium with 11 protons, 11 electrons and 23 − 11 = 12 neutrons.'),
        def('Isotopes', 'Atoms of the same element with the same atomic number but different mass numbers (different numbers of neutrons). They have the same chemical properties but different physical properties.'),
        p('Hydrogen has three isotopes: protium ¹₁H (no neutron), deuterium ²₁H and tritium ³₁H. Uses: uranium-235 as fuel in nuclear reactors, cobalt-60 for treating cancer, iodine-131 for treating goitre, carbon-14 for finding the age of ancient objects.'),
        p('Because natural chlorine is about 75% Cl-35 and 25% Cl-37, its average atomic mass is 35 × 0.75 + 37 × 0.25 = 35.5 u.'),
        f('average atomic mass = Σ (mass of isotope × fraction)', 'average atomic mass equals the sum of each isotope mass times its fraction'),
        xp({
          title: 'What if? Change the mix of chlorine isotopes', formula: 'M = 35 × p/100 + 37 × (100 − p)/100',
          res: ['M', 'Average atomic mass', 'u', '35 * p / 100 + 37 * (100 - p) / 100', 2],
          vars: [['p', 'Percentage of Cl-35', '%', 0, 100, 1, 75]],
          notes: [['p', 'More of the lighter isotope pulls the average towards 35.', 'More of the heavier isotope pulls the average towards 37.']],
          mistakes: [['Taking a simple average (35 + 37)/2 = 36', 'The isotopes are not equally common; weight each by its percentage.']],
          real: 'With 75% Cl-35 and 25% Cl-37, the average is 35.5 u — the value in your table of atomic masses.',
        }),
        keys('Z = protons (= electrons in a neutral atom).', 'A = protons + neutrons; N = A − Z.', 'Symbol: ᴬ_Z X.', 'Isotopes: same Z, different A; same chemistry.'),
        remember('Isotopes differ only in the number of NEUTRONS.'),
      ],
      examples: [
        ex('How many protons, electrons and neutrons are in ²⁷₁₃Al?', ['Z = 13 → 13 protons, 13 electrons', 'N = 27 − 13 = 14'], '13 p, 13 e, 14 n'),
        ex('Are ¹²₆C and ¹⁴₆C isotopes? Explain.', ['Both have Z = 6 (same element).', 'Mass numbers 12 and 14 differ (6 and 8 neutrons).'], 'Yes — same atomic number, different mass numbers'),
      ],
      practice: [
        tp('neutrons', (r) => {
          const [name, sym, z, a] = r.pick(ISOS);
          return numQ(`${name} is written as A = ${a}, Z = ${z} (symbol ${sym}). How many neutrons does one atom have?`, a - z, undefined,
            ['N = A − Z'], [`N = ${a} − ${z} = ${a - z}`], [{ when: String(a + z), explain: 'Subtract Z from A — do not add.' }, { when: String(z), explain: 'That is the number of protons. Neutrons = A − Z.' }], 0);
        }),
        tp('pe', (r) => {
          const [name, , z, a] = r.pick(ISOS);
          const askE = r.next() < 0.5;
          return numQ(`How many ${askE ? 'electrons' : 'protons'} are there in a neutral atom of ${name} (Z = ${z}, A = ${a})?`, z, undefined,
            ['Atomic number = number of protons.', 'A neutral atom has as many electrons as protons.'], [`${askE ? 'Electrons' : 'Protons'} = Z = ${z}`], [{ when: String(a), explain: 'A is the mass number (protons + neutrons). Use Z.' }], 0);
        }),
        mcq('iso', 'Isotopes: same Z, different A.', [
          ['Isotopes of an element have the same…', 'Atomic number', ['Mass number', 'Number of neutrons', 'Physical properties'], 'Same element.', 'Same number of protons, i.e. same Z.'],
          ['Which pair are isotopes?', '³⁵₁₇Cl and ³⁷₁₇Cl', ['⁴⁰₁₈Ar and ⁴⁰₂₀Ca', '¹²₆C and ¹⁴₇N', '²³₁₁Na and ²⁴₁₂Mg'], 'Look for equal Z.', 'Both have Z = 17 but different A.'],
          ['Which isotope is used to treat goitre?', 'Iodine-131', ['Cobalt-60', 'Uranium-235', 'Carbon-12'], 'The thyroid uses iodine.', 'Iodine-131 is used for thyroid treatment.'],
          ['Uranium-235 is used…', 'As fuel in nuclear reactors', ['To treat goitre', 'In fluorescent lamps', 'To date fossils'], 'Nuclear energy.', 'U-235 undergoes fission in reactors.'],
          ['The isotope of hydrogen with no neutron is…', 'Protium', ['Deuterium', 'Tritium', 'Helium'], 'Most common hydrogen.', 'Protium ¹H has one proton and no neutron.'],
          ['Isotopes have the same chemical properties because they have…', 'The same number of electrons', ['The same mass', 'The same number of neutrons', 'Different nuclei'], 'Chemistry depends on electrons.', 'Same Z → same electron arrangement → same chemistry.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Work and energy
// =====================================================================================
const ch10: USpec = {
  id: 'ts9.ps.ch10', subject: 'physics', title: 'Work and energy', source: src(10),
  objectives: [
    {
      id: 'ts9.ps.energy.work', title: 'Scientific meaning of work', prereqs: [],
      activities: ['lab:forces'],
      intro: [
        h('Is studying "work"?'),
        photo('🛒', 'Pushing a loaded trolley across a shop floor is work in the scientific sense: a force moves something.'),
        p('In everyday language, reading for an exam or holding a heavy bag is "hard work". In science, work is done only when a force acts on a body AND the body moves in the direction of the force.'),
        def('Work', 'Work done by a constant force = force × displacement in the direction of the force: W = F × s. SI unit: joule (J). 1 J = 1 N × 1 m. Work is a scalar.'),
        f('W = F × s', 'work equals force times displacement'),
        xp({
          title: 'What if? Push harder or push farther', formula: 'W = F × s',
          res: ['W', 'Work done', 'J', 'F * s', 1],
          vars: [['F', 'Force', 'N', 0, 500, 5, 50], ['s', 'Displacement along the force', 'm', 0, 50, 0.5, 10]],
          notes: [['s', 'Twice the displacement, twice the work.', 'If the body does not move (s = 0), no work is done however hard you push.'], ['F', 'A bigger force over the same displacement does more work.', 'With zero force, no work is done.']],
          mistakes: [['Saying a person holding a heavy suitcase still is doing work', 'The suitcase does not move, so s = 0 and W = 0 (even though the person gets tired).'], ['Using distance in a direction perpendicular to the force', 'Only displacement ALONG the force counts. Carrying a bag horizontally, gravity does no work on it.']],
          real: 'Lifting a 10 kg bag of rice (weight ≈ 100 N) up 1.5 m onto a shelf takes about 150 J of work.',
        }),
        p('Work can be positive, negative or zero. When force and displacement are in the same direction, work is positive (pushing a cart forward). When they are opposite, work is negative (friction slowing a rolling ball). When the force is perpendicular to the motion, or there is no displacement, work is zero (gravity on a satellite in a circular orbit, a coolie standing still with a load).'),
        keys('Work needs a force AND displacement along it.', 'W = F × s; unit joule.', 'Positive, negative or zero work.', 'Perpendicular force does no work.'),
        remember('1 joule = the work done when a force of 1 N moves a body 1 m along the force.'),
      ],
      examples: [
        ex('Sana pushes a box with a force of 40 N through 5 m along the floor. Find the work done.', ['W = F × s', 'W = 40 × 5'], '200 J'),
        ex('Friction of 20 N acts on a sliding block that moves 3 m. Find the work done by friction.', ['Friction acts opposite to motion.', 'W = −20 × 3'], '−60 J (negative work)'),
      ],
      practice: [
        tp('w', (r) => {
          const F = r.pick([10, 20, 25, 40, 50, 100, 150]);
          const s = r.pick([2, 3, 4, 5, 8, 10, 12]);
          const mode = r.int(0, 2);
          if (mode === 0) return numQ(`A force of ${F} N moves a body through ${s} m in the direction of the force. Find the work done.`, F * s, 'J', ['W = F × s'], [`W = ${F} × ${s} = ${F * s} J`], [{ when: `${rd(F / s, 2)} J`, explain: 'Multiply force by displacement.' }]);
          if (mode === 1) return numQ(`${F * s} J of work is done in moving a box ${s} m along the floor. Find the force applied (along the motion).`, F, 'N', ['F = W/s'], [`F = ${F * s} ÷ ${s} = ${F} N`]);
          return numQ(`A force of ${F} N does ${F * s} J of work on a trolley. How far does the trolley move along the force?`, s, 'm', ['s = W/F'], [`s = ${F * s} ÷ ${F} = ${s} m`]);
        }),
        tp('lift', (r) => {
          const m = r.pick([2, 5, 10, 20, 25, 50]);
          const hh = r.pick([1, 1.5, 2, 3, 4]);
          return numQ(`How much work is done in lifting a ${m} kg bag vertically up through ${hh} m? (g = 10 m/s²)`, rd(m * 10 * hh, 2), 'J',
            ['Force needed = weight = mg.', 'W = mg × h'], [`F = ${m} × 10 = ${m * 10} N`, `W = ${m * 10} × ${hh} = ${rd(m * 10 * hh, 2)} J`],
            [{ when: `${rd(m * hh, 2)} J`, explain: 'Use the weight (mg) in newtons, not the mass in kg.' }]);
        }),
        mcq('sign', 'Ask: is there displacement, and is it along the force?', [
          ['A man holds a heavy box still on his head for 10 minutes. Work done on the box is…', 'Zero', ['Positive', 'Negative', 'Very large'], 'Does the box move?', 'No displacement → no work.'],
          ['Work done by friction on a sliding block is…', 'Negative', ['Positive', 'Zero', 'Infinite'], 'Friction opposes motion.', 'Force opposite to displacement → negative work.'],
          ['The Earth\'s gravity on a satellite in a circular orbit does…', 'Zero work', ['Positive work', 'Negative work', 'Infinite work'], 'Force is towards the centre; motion is along the tangent.', 'The force is perpendicular to the displacement, so no work is done.'],
          ['1 joule equals…', '1 N × 1 m', ['1 N ÷ 1 m', '1 kg × 1 m/s', '1 W × 1 m'], 'W = F × s.', 'Newton × metre = joule.'],
          ['A boy pushes a wall hard but it does not move. The work done on the wall is…', 'Zero', ['Positive', 'Equal to his weight', 'Negative'], 'No displacement.', 'The wall does not move, so W = 0.'],
          ['When you lift a bucket up, the work done by gravity on it is…', 'Negative', ['Positive', 'Zero', 'Equal to your work'], 'Gravity pulls down; bucket moves up.', 'Gravity acts opposite to the displacement.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.energy.mechanical', title: 'Energy, kinetic and potential energy, conservation of mechanical energy', prereqs: ['ts9.ps.energy.work'],
      activities: ['lab:motion'],
      intro: [
        h('The ability to do work'),
        photo('🎈', 'A balloon stretched and then let go flies around the room: the stored energy has turned into motion.'),
        def('Energy', 'The capacity to do work. Its unit is the same as work: joule (J). When a body does work it loses energy; when work is done on it, it gains energy.'),
        p('Energy appears in many forms — heat, light, sound, chemical, electrical, nuclear and mechanical — and can change from one form to another. Mechanical energy has two forms:'),
        def('Kinetic energy (KE)', 'Energy a body has because of its motion: KE = ½mv².'),
        f('KE = ½ m v²', 'kinetic energy equals half m v squared'),
        xp({
          title: 'What if? Speed up a moving body', formula: 'KE = ½mv²',
          res: ['KE', 'Kinetic energy', 'J', '0.5 * m * v^2', 1],
          vars: [['m', 'Mass', 'kg', 0.1, 100, 0.1, 10], ['v', 'Speed', 'm/s', 0, 30, 0.5, 5]],
          notes: [['v', 'Doubling the speed gives FOUR times the kinetic energy — fast vehicles cause far worse crashes.', 'Halving the speed cuts KE to a quarter.'], ['m', 'Double the mass, double the KE.', 'A lighter body at the same speed has less KE.']],
          mistakes: [['Forgetting to square v', 'KE = ½ × m × v × v, not ½ × m × v.'], ['Forgetting the ½', 'A 2 kg ball at 3 m/s has ½ × 2 × 9 = 9 J, not 18 J.']],
          real: 'A 1000 kg car at 20 m/s (72 km/h) has 200 000 J of kinetic energy; at 40 m/s it has 800 000 J.',
        }),
        def('Potential energy (PE)', 'Energy stored in a body because of its position or shape. Near the Earth, a mass m raised through height h gains gravitational PE = mgh.'),
        f('PE = m g h', 'potential energy equals m g h'),
        xp({
          title: 'What if? Lift the load higher', formula: 'PE = mgh',
          res: ['PE', 'Potential energy', 'J', 'm * g * h', 1],
          vars: [['m', 'Mass', 'kg', 0.1, 100, 0.1, 5], ['h', 'Height', 'm', 0, 50, 0.5, 4], ['g', 'g', 'm/s²', 1.6, 9.8, 0.1, 9.8]],
          notes: [['h', 'Twice as high, twice the stored energy.', 'At ground level (h = 0) the PE is zero.'], ['g', 'On the Moon the same lift stores only about one-sixth of the energy.', 'Weaker gravity stores less energy for the same height.']],
          mistakes: [['Using the path length on a slope', 'PE depends only on the vertical height, not on the path taken.']],
          real: 'Water stored behind a dam has large PE, which turns into KE and then electricity in a hydro power station.',
        }),
        h('Conservation of energy'),
        def('Law of conservation of energy', 'Energy can neither be created nor destroyed; it can only change from one form to another. The total energy before and after any change stays the same.'),
        p('A ball dropped from a height: at the top it has only PE; as it falls PE decreases and KE increases; just before hitting the ground PE has all become KE (ignoring air resistance). So mgh = ½mv², giving v = √(2gh). At every point, KE + PE = constant.'),
        keys('Energy = capacity to do work (J).', 'KE = ½mv²; PE = mgh.', 'Energy is conserved; it only changes form.', 'Free fall: mgh at the top = ½mv² at the bottom.'),
        remember('Mechanical energy = KE + PE, constant when only gravity acts.'),
      ],
      examples: [
        ex('Find the kinetic energy of a 50 kg girl cycling at 4 m/s.', ['KE = ½ × 50 × 4²', '= 25 × 16'], '400 J'),
        ex('A 2 kg stone is dropped from 5 m. Find its PE at the top and its speed just before landing. (g = 10 m/s²)', ['PE = 2 × 10 × 5 = 100 J', 'At the bottom ½ × 2 × v² = 100 → v² = 100', 'v = 10 m/s'], 'PE = 100 J; v = 10 m/s'),
      ],
      practice: [
        tp('ke', (r) => {
          const m = r.pick([0.5, 1, 2, 4, 10, 50, 1000]);
          const v = r.pick([2, 3, 4, 5, 10, 20]);
          return numQ(`Find the kinetic energy of a ${m} kg body moving at ${v} m/s.`, rd(0.5 * m * v * v, 2), 'J', ['KE = ½mv²', 'Square v first.'], [`KE = ½ × ${m} × ${v}² = ${rd(0.5 * m * v * v, 2)} J`],
            [{ when: `${rd(0.5 * m * v, 2)} J`, explain: 'v must be squared.' }, { when: `${rd(m * v * v, 2)} J`, explain: 'Remember the ½.' }]);
        }),
        tp('pe', (r) => {
          const m = r.pick([1, 2, 5, 10, 20, 40]);
          const hh = r.pick([2, 3, 5, 10, 15, 20]);
          return numQ(`Find the potential energy of a ${m} kg object kept at a height of ${hh} m. (g = 10 m/s²)`, m * 10 * hh, 'J', ['PE = mgh'], [`PE = ${m} × 10 × ${hh} = ${m * 10 * hh} J`]);
        }),
        tp('drop', (r) => {
          const hh = r.pick([5, 20, 45, 80, 1.25, 3.2]);
          const v = rd(Math.sqrt(20 * hh), 2);
          return numQ(`A ball is dropped from a height of ${hh} m. Using conservation of energy, find its speed just before it hits the ground. (g = 10 m/s², ignore air resistance)`, v, 'm/s',
            ['mgh = ½mv² — the mass cancels.', 'v = √(2gh)'], [`v = √(2 × 10 × ${hh}) = √${rd(20 * hh, 2)} = ${v} m/s`], [{ when: `${rd(20 * hh, 2)} m/s`, explain: 'Take the square root of 2gh.' }]);
        }, 2),
        mcq('energy', 'Energy only changes form.', [
          ['At the highest point of its swing, a pendulum bob has…', 'Maximum PE and zero KE', ['Maximum KE and zero PE', 'Zero energy', 'Equal KE and PE'], 'It stops for an instant.', 'At the top, speed is zero, so all mechanical energy is PE.'],
          ['If the speed of a car doubles, its kinetic energy becomes…', '4 times', ['2 times', 'Half', 'The same'], 'KE ∝ v².', '2² = 4.'],
          ['Energy stored in a stretched rubber band is…', 'Potential energy', ['Kinetic energy', 'Heat energy', 'Sound energy'], 'Due to change in shape.', 'Energy stored due to change of shape is (elastic) potential energy.'],
          ['The SI unit of energy is…', 'Joule', ['Newton', 'Watt', 'Pascal'], 'Same as work.', 'Energy and work are both measured in joules.'],
          ['When a ball falls freely, its…', 'PE decreases and KE increases', ['PE and KE both increase', 'PE increases and KE decreases', 'Total energy increases'], 'Height falls, speed rises.', 'PE turns into KE; the total stays the same.'],
          ['Water stored in a dam has…', 'Potential energy', ['Kinetic energy only', 'No energy', 'Nuclear energy'], 'Because of height.', 'Water held at a height has gravitational PE.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.energy.sources', title: 'Sources of energy and nuclear fusion', prereqs: ['ts9.ps.energy.mechanical'],
      intro: [
        h('Where does our energy come from?'),
        photo('☀️', 'Almost every source of energy on Earth — food, wood, wind, coal — can be traced back to the Sun.'),
        def('Renewable sources', 'Sources that are replaced naturally and will not run out: solar, wind, flowing water (hydro), biomass, tides, geothermal heat.'),
        def('Non-renewable sources', 'Sources that took millions of years to form and will run out if used up: coal, petroleum, natural gas (fossil fuels) and nuclear fuels like uranium.'),
        p('A good source of energy gives a lot of energy per unit mass, is easy to store and transport, is economical, and causes little pollution. Burning fossil fuels releases carbon dioxide (adding to global warming) and other harmful gases, so we must use energy wisely and shift towards renewable sources. Telangana has large solar parks, and the Nagarjuna Sagar dam produces hydroelectricity.'),
        h('Nuclear fusion — the power of the Sun'),
        def('Nuclear fusion', 'The joining of very light nuclei, such as isotopes of hydrogen, to form a heavier nucleus such as helium, releasing an enormous amount of energy.'),
        p('Fusion needs extremely high temperatures (millions of degrees) and pressures, which exist in the core of the Sun and other stars. In fusion the mass of the product is a little less than the mass of the nuclei that joined; this tiny "missing" mass becomes a huge amount of energy. Fusion is different from fission, in which a heavy nucleus like uranium splits into lighter ones (used in today\'s nuclear power plants). Scientists are still working to make controlled fusion practical on Earth.'),
        keys('Renewable: solar, wind, hydro, biomass, tidal, geothermal.', 'Non-renewable: coal, petroleum, natural gas, nuclear fuel.', 'Fusion: light nuclei join (hydrogen → helium); powers the Sun.', 'Fission: heavy nucleus splits; used in reactors.'),
        remember('FUSion = FUSE together (light nuclei). FISSion = split (heavy nucleus).'),
      ],
      examples: [
        ex('Classify: coal, wind, natural gas, solar, biogas.', ['Coal and natural gas formed over millions of years → non-renewable.', 'Wind, solar and biogas are replaced naturally → renewable.'], 'Renewable: wind, solar, biogas; non-renewable: coal, natural gas'),
        ex('Why does the Sun keep shining for billions of years?', ['In its core, hydrogen nuclei fuse to form helium.', 'A small loss of mass becomes a huge amount of energy.', 'The Sun has enormous amounts of hydrogen.'], 'Nuclear fusion of hydrogen into helium in its core'),
      ],
      practice: [
        tp('classify', (r) => {
          const bank: [string, boolean][] = [['Solar energy', true], ['Wind energy', true], ['Hydroelectricity', true], ['Biogas', true], ['Tidal energy', true], ['Geothermal energy', true], ['Coal', false], ['Petroleum', false], ['Natural gas', false], ['Uranium (nuclear fuel)', false]];
          const [s, ren] = r.pick(bank);
          const ans = ren ? 'Renewable' : 'Non-renewable';
          return {
            type: 'mcq', prompt: `Is ${s} a renewable or a non-renewable source of energy?`, ...choose(r, ans, [ren ? 'Non-renewable' : 'Renewable', 'Neither — it is not an energy source']),
            hints: ['Is it replaced naturally in a short time?', 'Fossil and nuclear fuels run out.'],
            mistakes: [{ when: 'wrong', explain: `${s} is ${ans.toLowerCase()}.` }], solution: [`${s} → ${ans}.`],
          };
        }),
        mcq('fusion', 'Fusion joins light nuclei; fission splits heavy ones.', [
          ['The energy of the Sun comes from…', 'Nuclear fusion of hydrogen into helium', ['Burning of coal', 'Nuclear fission of uranium', 'Chemical reactions of oxygen'], 'Light nuclei join.', 'Hydrogen nuclei fuse into helium in the Sun\'s core.'],
          ['Nuclear fusion needs…', 'Extremely high temperature and pressure', ['Very low temperature', 'Only sunlight', 'Water'], 'Nuclei repel each other strongly.', 'Only at millions of degrees can light nuclei come close enough to fuse.'],
          ['In nuclear fission…', 'A heavy nucleus splits into lighter nuclei', ['Light nuclei join', 'Electrons are created', 'Atoms burn in oxygen'], 'Fission = splitting.', 'Fission splits heavy nuclei like uranium-235.'],
          ['The energy released in fusion comes from…', 'A small loss of mass', ['Burning hydrogen in air', 'Friction', 'Electrons jumping'], 'Mass becomes energy.', 'The products weigh slightly less; the lost mass is converted to energy.'],
          ['Which is a disadvantage of fossil fuels?', 'They release carbon dioxide and pollutants', ['They are renewable', 'They give no energy', 'They cannot be transported'], 'Think of air pollution and global warming.', 'Burning them adds CO₂ and harmful gases to the air.'],
          ['Which is a characteristic of a good fuel?', 'High energy per unit mass and low pollution', ['Low energy and much smoke', 'Very hard to store', 'Very expensive'], 'Efficient and clean.', 'A good source gives lots of energy cheaply and cleanly.'],
        ]),
        matchT('match', 'energy source to its description', [
          ['Solar cell', 'Sunlight → electricity'], ['Windmill', 'Moving air → electricity'], ['Hydro power', 'Falling water → electricity'], ['Biogas plant', 'Animal dung → fuel gas'],
          ['Nuclear reactor', 'Fission of uranium'], ['The Sun', 'Fusion of hydrogen'],
        ], ['Think about what each one uses.', 'Fission in reactors; fusion in the Sun.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Heat
// =====================================================================================
const SPH: [string, number][] = [['water', 4.2], ['aluminium', 0.9], ['iron', 0.45], ['copper', 0.39], ['kerosene', 2.1]];

const ch11: USpec = {
  id: 'ts9.ps.ch11', subject: 'physics', title: 'Heat', source: src(11),
  objectives: [
    {
      id: 'ts9.ps.heat.temperature', title: 'Thermal equilibrium, heat, temperature and kinetic energy', prereqs: [],
      intro: [
        h('Hot tea, cool tea'),
        photo('☕', 'A cup of hot tea left on the table cools down until it is as warm as the room — and then stops cooling.'),
        p('Touch a hot cup: something flows into your hand and it feels hot. That "something" is heat — energy that flows from a hotter body to a colder body because of the difference in their temperatures. The flow stops when both reach the same temperature.'),
        def('Heat', 'A form of energy that flows from a body at higher temperature to a body at lower temperature. Units: joule (J), also calorie (cal); 1 cal ≈ 4.2 J (4.186 J).'),
        def('Temperature', 'A measure of how hot or cold a body is. It tells the direction in which heat will flow. Measured with a thermometer in °C or kelvin (K).'),
        def('Thermal equilibrium', 'The state of two bodies in contact when no net heat flows between them because they are at the same temperature.'),
        p('Why do hot things have more "heat inside"? The particles of a substance are always moving. Temperature is a measure of the average kinetic energy of the particles: the faster they move on average, the higher the temperature. When a hot body touches a cold one, collisions pass energy from the faster particles to the slower ones until the average kinetic energies match.'),
        f('T (K) = t (°C) + 273', 'temperature in kelvin equals Celsius plus 273'),
        xp({
          title: 'What if? Read the thermometer in kelvin', formula: 'T = t + 273',
          res: ['T', 'Kelvin temperature', 'K', 't + 273', 0],
          vars: [['t', 'Celsius temperature', '°C', -273, 500, 1, 27]],
          notes: [['t', 'Higher temperature → faster particles → higher average kinetic energy.', 'At −273 °C (0 K) particle motion would be at its least — nothing can be colder.']],
          mistakes: [['Thinking a bigger object at the same temperature is "hotter"', 'A bucket and a cup of water at 60 °C have the same temperature; the bucket simply holds more heat energy.']],
          real: 'Normal body temperature 37 °C = 310 K.',
        }),
        keys('Heat flows from higher to lower temperature.', 'Equal temperatures → thermal equilibrium, no net flow.', 'Temperature ∝ average kinetic energy of particles.', 'Heat in J or cal; temperature in °C or K.'),
        remember('Heat is energy in transit; temperature is the "level" that decides the direction of flow.'),
      ],
      examples: [
        ex('A hot iron ball is dropped into a bucket of cold water. What happens and when does it stop?', ['Heat flows from the hotter ball to the cooler water.', 'Ball cools, water warms.', 'It stops when both reach the same temperature.'], 'Heat flows ball → water until thermal equilibrium is reached.'),
        ex('A bucket of water and a cup of water are both at 50 °C. Which has more heat energy, and which way will heat flow if they are mixed?', ['The bucket has more mass, so more total energy.', 'Same temperature → no net heat flow.'], 'The bucket has more heat energy, but no heat flows between them.'),
      ],
      practice: [
        mcq('concept', 'Heat flows from hot to cold until temperatures are equal.', [
          ['Heat always flows from…', 'A body at higher temperature to one at lower temperature', ['A bigger body to a smaller body', 'A lower temperature to a higher one', 'A heavier body to a lighter one'], 'Temperature decides direction.', 'Heat flows down the temperature difference.'],
          ['Temperature of a body is a measure of the…', 'Average kinetic energy of its particles', ['Total mass', 'Total heat it contains', 'Number of particles'], 'Faster particles → hotter.', 'Higher average kinetic energy means higher temperature.'],
          ['Two bodies in contact are in thermal equilibrium when they have the same…', 'Temperature', ['Mass', 'Heat energy', 'Volume'], 'No net flow.', 'Equal temperatures stop the net flow of heat.'],
          ['The SI unit of heat is…', 'Joule', ['Kelvin', 'Degree Celsius', 'Calorie'], 'Heat is energy.', 'All energy is measured in joules in SI.'],
          ['1 calorie is approximately…', '4.2 J', ['1 J', '42 J', '0.42 J'], 'Calorie is bigger than joule.', '1 cal ≈ 4.186 J ≈ 4.2 J.'],
          ['Why does a metal spoon in hot tea become hot?', 'Heat flows from the tea into the spoon', ['Cold flows out of the spoon', 'The spoon makes heat', 'Temperature flows into the spoon'], 'Energy moves from hot to cold.', 'Faster tea particles pass energy to the spoon\'s particles.'],
        ]),
        tapT('tap', 'Tap every statement that is TRUE.', [
          ['Heat is a form of energy', true], ['Temperature rises when particles move faster on average', true], ['Thermal equilibrium means equal temperatures', true], ['0 K is the lowest possible temperature', true],
          ['Heat flows from a big cold body to a small hot body', false], ['Temperature and heat are the same thing', false], ['Bodies at equal temperature exchange net heat', false],
        ], ['Direction of flow depends only on temperature.', 'Heat and temperature are different ideas.'], 'Heat is energy that flows due to a temperature difference; temperature reflects average particle kinetic energy.'),
        orderT('order', 'Arrange from the LOWEST temperature to the HIGHEST.', ['0 K', '−10 °C', '273 K', '37 °C', '373 K'], ['Convert all to kelvin.', '−10 °C = 263 K; 37 °C = 310 K.'], '0 K < 263 K < 273 K < 310 K < 373 K.', 2),
      ],
    },
    {
      id: 'ts9.ps.heat.specific', title: 'Specific heat and the method of mixtures', prereqs: ['ts9.ps.heat.temperature'],
      intro: [
        h('Why is the sand hot but the sea cool?'),
        photo('🐚', 'At noon on a beach the sand burns your feet while the sea water stays cool, even though both get the same sunshine.'),
        p('Heat equal masses of water and sand with the same burner for the same time: the sand gets much hotter. Different substances need different amounts of heat to warm by the same amount. This property is called specific heat.'),
        def('Specific heat (s)', 'The amount of heat needed to raise the temperature of unit mass of a substance by 1 °C. Units: J/(kg °C) or J/(g °C), or cal/(g °C). Water has a very high specific heat: 1 cal/(g °C) ≈ 4.2 J/(g °C).'),
        f('Q = m s Δt', 'heat equals mass times specific heat times change in temperature'),
        xp({
          title: 'What if? Heat different amounts of water', formula: 'Q = m s Δt',
          res: ['Q', 'Heat needed', 'J', 'm * s * dt', 0],
          vars: [['m', 'Mass', 'g', 10, 2000, 10, 500], ['s', 'Specific heat', 'J/(g °C)', 0.1, 4.2, 0.05, 4.2], ['dt', 'Temperature rise', '°C', 1, 100, 1, 20]],
          notes: [['s', 'A substance with high specific heat (like water) needs much more heat for the same rise — it warms up and cools down slowly.', 'Metals have low specific heat, so they heat up quickly.'], ['m', 'Twice the mass needs twice the heat for the same rise.', 'A small amount warms quickly.']],
          mistakes: [['Using the final temperature instead of the change', 'Δt = final − initial. Heating from 20 °C to 70 °C is Δt = 50 °C.'], ['Mixing grams and kilograms', 'If s is in J/(g °C), m must be in grams.']],
          real: 'Warming 500 g of water by 20 °C takes 500 × 4.2 × 20 = 42 000 J.',
        }),
        h('Method of mixtures'),
        p('When a hot and a cold body are mixed in an insulated container, heat lost by the hot body = heat gained by the cold body (no heat lost to the surroundings). This is the principle of the method of mixtures, used to find the specific heat of a solid with a calorimeter.'),
        p('For two amounts of the same liquid, m₁ at T₁ and m₂ at T₂, the final temperature is:'),
        f('T = (m₁T₁ + m₂T₂) / (m₁ + m₂)', 'final temperature equals m one T one plus m two T two divided by m one plus m two'),
        xp({
          title: 'What if? Mix hot and cold water', formula: 'T = (m₁T₁ + m₂T₂)/(m₁ + m₂)',
          res: ['T', 'Final temperature', '°C', '(m1 * T1 + m2 * T2) / (m1 + m2)', 1],
          vars: [['m1', 'Mass of hot water', 'g', 10, 1000, 10, 200], ['T1', 'Hot water temperature', '°C', 40, 100, 1, 80], ['m2', 'Mass of cold water', 'g', 10, 1000, 10, 200], ['T2', 'Cold water temperature', '°C', 0, 40, 1, 20]],
          notes: [['m1', 'More hot water pulls the final temperature towards T₁.', 'Less hot water lets the cold water dominate.'], ['m2', 'More cold water pulls the mixture towards T₂.', 'Less cold water keeps the mixture hotter.']],
          mistakes: [['Simply averaging the temperatures', 'That works only for EQUAL masses. Otherwise weight each temperature by its mass.']],
          real: 'Mixing 200 g of water at 80 °C with 200 g at 20 °C gives 50 °C; with 600 g at 20 °C it gives only 35 °C.',
        }),
        keys('Q = m s Δt.', 'Water: s ≈ 4.2 J/(g °C) = 1 cal/(g °C) — very high.', 'Heat lost by hot = heat gained by cold.', 'Same liquid: T = (m₁T₁ + m₂T₂)/(m₁ + m₂).'),
        remember('Water\'s high specific heat explains cool sea breezes by day, warm land breezes at night, and its use as a coolant in car radiators.'),
      ],
      examples: [
        ex('How much heat is needed to raise 200 g of water from 25 °C to 75 °C? (s = 4.2 J/(g °C))', ['Δt = 75 − 25 = 50 °C', 'Q = 200 × 4.2 × 50'], '42 000 J (42 kJ)'),
        ex('Priya mixes 100 g of water at 70 °C with 300 g of water at 30 °C. Find the final temperature.', ['T = (100 × 70 + 300 × 30)/(100 + 300)', '= (7000 + 9000)/400 = 16 000/400'], '40 °C'),
      ],
      practice: [
        tp('q', (r) => {
          const [name, s] = r.pick(SPH);
          const m = r.pick([50, 100, 200, 250, 500]);
          const dt = r.pick([10, 20, 25, 40, 50]);
          const Q = rd(m * s * dt, 2);
          return numQ(`How much heat is needed to raise the temperature of ${m} g of ${name} by ${dt} °C? (specific heat of ${name} = ${s} J/(g °C))`, Q, 'J',
            ['Q = m s Δt', `Q = ${m} × ${s} × ${dt}`], [`Q = ${Q} J`], [{ when: `${rd(m * dt, 2)} J`, explain: 'Do not forget to multiply by the specific heat.' }]);
        }),
        tp('mix', (r) => {
          const m1 = r.pick([100, 200, 300]);
          const m2 = r.pick([100, 200, 300, 400]);
          const T1 = r.pick([60, 70, 80, 90]);
          const T2 = r.pick([10, 20, 30]);
          const T = rd((m1 * T1 + m2 * T2) / (m1 + m2), 2);
          return numQ(`${m1} g of water at ${T1} °C is mixed with ${m2} g of water at ${T2} °C in an insulated vessel. Find the final temperature.`, T, '°C',
            ['Heat lost by hot water = heat gained by cold water.', 'T = (m₁T₁ + m₂T₂)/(m₁ + m₂)'], [`T = (${m1} × ${T1} + ${m2} × ${T2}) ÷ ${m1 + m2}`, `T = ${m1 * T1 + m2 * T2} ÷ ${m1 + m2} = ${T} °C`],
            [{ when: `${rd((T1 + T2) / 2, 2)} °C`, explain: 'Simple averaging works only for equal masses — weight each temperature by its mass.' }]);
        }, 2),
        tp('s', (r) => {
          const [name, s] = r.pick(SPH.slice(1));
          const m = r.pick([100, 200, 500]);
          const dt = r.pick([10, 20, 50]);
          const Q = rd(m * s * dt, 2);
          return numQ(`${Q} J of heat raises the temperature of ${m} g of ${name} by ${dt} °C. Find the specific heat of ${name} in J/(g °C). (Type just the number.)`, s, undefined,
            ['s = Q / (m Δt)'], [`s = ${Q} ÷ (${m} × ${dt}) = ${s} J/(g °C)`], [], 0.01);
        }, 2),
        mcq('concept', 'High specific heat → slow to warm up and slow to cool down.', [
          ['Water is used in car radiators because it has…', 'A high specific heat', ['A low specific heat', 'A low boiling point', 'A high density'], 'It can absorb lots of heat.', 'Water absorbs much heat with only a small rise in temperature.'],
          ['On a sunny day the sand on a beach is hotter than the sea because sand has…', 'A lower specific heat than water', ['A higher specific heat', 'More mass', 'No specific heat'], 'Same heat, bigger rise.', 'Low specific heat → larger temperature rise for the same heat.'],
          ['In the method of mixtures we assume that…', 'Heat lost by the hot body = heat gained by the cold body', ['Temperature lost = temperature gained', 'Mass is lost', 'No heat flows'], 'Conservation of energy.', 'In an insulated system, heat lost equals heat gained.'],
          ['The specific heat of water is…', '1 cal/(g °C) ≈ 4.2 J/(g °C)', ['0.39 J/(g °C)', '4.2 J/(kg °C)', '100 cal/(g °C)'], 'The highest of common substances.', 'Water\'s specific heat is 1 cal/(g °C) or about 4200 J/(kg °C).'],
          ['A calorimeter is used to…', 'Measure heat exchanged in mixtures', ['Measure density', 'Measure air pressure', 'Measure speed of sound'], 'Calor = heat.', 'It is an insulated vessel for heat measurements by mixing.'],
          ['Equal masses of copper (s = 0.39) and aluminium (s = 0.9) get the same heat. Which warms more?', 'Copper', ['Aluminium', 'Both equally', 'Neither'], 'Δt = Q/(ms).', 'Lower specific heat → larger temperature rise.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.heat.evaporation', title: 'Evaporation, condensation, humidity, dew and fog', prereqs: ['ts9.ps.heat.temperature'],
      intro: [
        h('Wet clothes dry; cold glasses "sweat"'),
        photo('🌧️', 'Clouds, rain, dew and fog are all water changing between liquid and vapour.'),
        def('Evaporation', 'The escape of fast-moving molecules from the surface of a liquid at any temperature below its boiling point. It causes cooling, because the most energetic molecules leave and the average kinetic energy of those left behind falls.'),
        p('Evaporation is faster when the surface area is larger, the temperature is higher, the wind speed is greater and the humidity is lower. That is why clothes dry quickly on a hot, windy, dry day and why water in a matka (earthen pot) stays cool.'),
        def('Condensation', 'The change of water vapour into liquid when it is cooled — the reverse of evaporation. It releases heat.'),
        def('Humidity', 'The amount of water vapour present in the air. When humidity is high, evaporation is slow and we feel sticky because sweat does not evaporate easily.'),
        def('Dew', 'Tiny drops of water formed when water vapour in the air condenses on cool surfaces such as leaves and grass, usually on clear, calm nights. The temperature at which this begins is the dew point.'),
        def('Fog', 'A cloud near the ground: tiny water droplets formed when air near the ground cools below its dew point and vapour condenses on dust and smoke particles floating in the air.'),
        keys('Evaporation: surface process, any temperature, causes cooling.', 'Faster with more area, heat, wind; slower with high humidity.', 'Condensation: vapour → liquid on cooling, releases heat.', 'Dew forms on cool surfaces; fog forms on particles in the air.'),
        remember('A cold glass of water "sweats" because water vapour in the AIR condenses on its cool surface — the water does not leak through the glass.'),
      ],
      examples: [
        ex('Why do we feel cool after a bath, especially under a fan?', ['Water on the skin evaporates.', 'The fastest molecules escape, taking energy from the skin.', 'The fan blows away vapour and speeds up evaporation.'], 'Evaporation causes cooling; the fan speeds it up.'),
        ex('Why do clothes take longer to dry in the rainy season?', ['The air already has a lot of water vapour (high humidity).', 'Evaporation slows down.'], 'High humidity reduces the rate of evaporation.'),
      ],
      practice: [
        mcq('evap', 'Area, temperature, wind and humidity control evaporation.', [
          ['Evaporation causes…', 'Cooling', ['Heating', 'No change in temperature', 'Freezing always'], 'The fastest molecules leave.', 'The remaining liquid has lower average KE, so it cools.'],
          ['Evaporation is slower when…', 'Humidity is high', ['Wind is strong', 'Temperature is high', 'Surface area is large'], 'Air already full of vapour.', 'Humid air cannot take up much more vapour.'],
          ['Water in an earthen pot (matka) stays cool because…', 'Water seeping through its pores evaporates', ['Clay is cold', 'Clay absorbs heat', 'Air cannot enter'], 'Evaporation from the outer surface.', 'Evaporation through the pores takes heat from the water inside.'],
          ['Droplets on the outside of a glass of ice water come from…', 'Water vapour in the air condensing', ['Water leaking through the glass', 'Ice melting outside', 'The table'], 'Cool surface, moist air.', 'Vapour in the air cools on the glass and condenses.'],
          ['Dew forms mostly on…', 'Clear, calm nights', ['Cloudy, windy afternoons', 'Very hot noons', 'Rainy afternoons'], 'Surfaces must cool a lot.', 'On clear nights, surfaces cool quickly below the dew point.'],
          ['Fog forms when…', 'Air near the ground cools and vapour condenses on dust particles', ['Water boils', 'Ice sublimes', 'The Sun heats the ground strongly'], 'A cloud at ground level.', 'Cooling below dew point makes vapour condense on particles in the air.'],
        ]),
        tapT('faster', 'Tap every condition that makes wet clothes dry FASTER.', [
          ['Spreading them out (more surface area)', true], ['A hot sunny day', true], ['A windy day', true], ['Dry air (low humidity)', true],
          ['Keeping them folded', false], ['A humid rainy day', false], ['Still air in a closed room', false],
        ], ['Think about area, temperature, wind and humidity.', 'Humidity slows evaporation.'], 'Evaporation increases with surface area, temperature and wind, and decreases with humidity.'),
        matchT('match', 'term to its meaning', [
          ['Evaporation', 'Liquid → vapour at the surface, below boiling point'], ['Condensation', 'Vapour → liquid on cooling'], ['Humidity', 'Amount of water vapour in air'],
          ['Dew', 'Water drops on cool surfaces at night'], ['Fog', 'Droplets on dust near the ground'], ['Dew point', 'Temperature at which condensation begins'],
        ], ['Dew forms on surfaces; fog forms in the air.', 'Evaporation and condensation are opposites.']),
      ],
    },
    {
      id: 'ts9.ps.heat.latent', title: 'Boiling, melting and freezing; latent heat', prereqs: ['ts9.ps.heat.specific'],
      intro: [
        h('Heat that hides'),
        photo('🧊', 'Ice in a glass stays at 0 °C while it melts, however warm the room is.'),
        def('Melting and freezing', 'Melting is the change from solid to liquid at a fixed temperature, the melting point (ice: 0 °C). Freezing is the reverse, at the same temperature. Water expands on freezing, so ice is less dense than water and floats.'),
        def('Boiling', 'The change from liquid to vapour throughout the liquid (bubbles form inside) at a fixed temperature, the boiling point (water: 100 °C at normal atmospheric pressure). The boiling point falls when pressure falls (on hills) and rises when pressure rises (pressure cooker).'),
        def('Latent heat (L)', 'The heat absorbed or released per unit mass during a change of state, without any change in temperature. Latent heat of fusion of ice ≈ 80 cal/g ≈ 334 J/g. Latent heat of vaporisation of water ≈ 540 cal/g ≈ 2260 J/g.'),
        f('Q = m L', 'heat equals mass times latent heat'),
        xp({
          title: 'What if? Melt more ice', formula: 'Q = mL',
          res: ['Q', 'Heat needed', 'J', 'm * Lh', 0],
          vars: [['m', 'Mass', 'g', 1, 1000, 1, 100], ['Lh', 'Latent heat', 'J/g', 334, 2260, 1, 334]],
          notes: [['m', 'Twice the mass needs twice the heat to change state.', 'Less mass, less heat.'], ['Lh', 'Vaporising (2260 J/g) needs nearly seven times the heat of melting (334 J/g) — that is why steam burns are so severe.', 'Melting needs much less heat than boiling away.']],
          mistakes: [['Using Q = m s Δt during melting', 'During a change of state Δt = 0; use Q = mL.'], ['Thinking temperature rises while ice melts', 'The heat goes into breaking the bonds between molecules, not into raising temperature.']],
          real: 'Melting a 100 g ice cube needs about 33 400 J — the same heat could warm 100 g of water by about 80 °C.',
        }),
        keys('Melting point and boiling point are fixed (at a given pressure).', 'Temperature is constant during a change of state.', 'Q = mL; L_fusion(ice) ≈ 334 J/g, L_vap(water) ≈ 2260 J/g.', 'Lower pressure → lower boiling point.'),
        remember('Steam at 100 °C burns more than water at 100 °C because it gives out its large latent heat as it condenses on the skin.'),
      ],
      examples: [
        ex('How much heat is needed to melt 50 g of ice at 0 °C? (L = 334 J/g)', ['Q = mL', 'Q = 50 × 334'], '16 700 J'),
        ex('Why is cooking slower in an open pot at Ooty or in the Himalayas?', ['Air pressure is lower at height.', 'Water boils below 100 °C.', 'Food gets less hot, so it cooks slowly.'], 'The boiling point of water is lower at high altitude.'),
      ],
      practice: [
        tp('mL', (r) => {
          const m = r.pick([10, 20, 25, 50, 100, 200]);
          const vap = r.next() < 0.4;
          const Lh = vap ? 2260 : 334;
          return numQ(`How much heat is needed to ${vap ? 'turn' : 'melt'} ${m} g of ${vap ? 'water at 100 °C into steam at 100 °C' : 'ice at 0 °C into water at 0 °C'}? (L = ${Lh} J/g)`, m * Lh, 'J',
            ['There is no temperature change, so use Q = mL.'], [`Q = ${m} × ${Lh} = ${m * Lh} J`], [{ when: `${rd(Lh / m, 2)} J`, explain: 'Multiply mass by latent heat.' }]);
        }),
        mcq('boil', 'Pressure changes boiling point; latent heat keeps temperature fixed.', [
          ['A pressure cooker cooks food faster because…', 'Higher pressure raises the boiling point of water', ['It lowers the boiling point', 'It traps cold air', 'It adds latent heat to food'], 'More pressure, hotter boiling.', 'Water boils at about 120 °C inside, so food cooks faster.'],
          ['During boiling, the temperature of water…', 'Remains constant', ['Keeps rising', 'Falls', 'Becomes 0 °C'], 'Latent heat of vaporisation.', 'Heat is used for the change of state, not for raising temperature.'],
          ['Ice floats on water because…', 'Water expands on freezing, so ice is less dense', ['Ice is heavier', 'Ice has air bubbles only', 'Water contracts on freezing'], 'Density comparison.', 'Water expands about 9% on freezing, making ice less dense than water.'],
          ['Steam at 100 °C causes more severe burns than water at 100 °C because…', 'Steam releases latent heat when it condenses', ['Steam is hotter', 'Water has no heat', 'Steam is denser'], 'Extra hidden heat.', 'Each gram of steam gives out about 2260 J extra on condensing.'],
          ['The latent heat of fusion of ice is about…', '80 cal/g (334 J/g)', ['540 cal/g', '1 cal/g', '4.2 J/g'], 'Melting needs less than boiling.', 'L_f ≈ 80 cal/g; L_v ≈ 540 cal/g.'],
          ['Evaporation differs from boiling because evaporation…', 'Happens only at the surface and at any temperature', ['Happens throughout the liquid', 'Happens only at 100 °C', 'Causes heating'], 'Bubbles form only in boiling.', 'Evaporation is a slow surface process at any temperature.'],
        ]),
        orderT('order', 'Water at 20 °C is cooled steadily in a freezer down to −5 °C. Put the stages in order.', ['Water cools from 20 °C to 4 °C', 'Water cools from 4 °C to 0 °C', 'Water freezes at 0 °C, giving out latent heat', 'Ice cools below 0 °C to −5 °C'], ['Freezing happens at a fixed temperature.', 'Ice cools only after all water has frozen.'], 'Liquid cools → reaches 0 °C → freezes at constant temperature → solid ice cools further.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Sound
// =====================================================================================
const ch12: USpec = {
  id: 'ts9.ps.ch12', subject: 'physics', title: 'Sound', source: src(12),
  objectives: [
    {
      id: 'ts9.ps.sound.production', title: 'Production and propagation of sound; types of waves', prereqs: [],
      intro: [
        h('Every sound starts with a vibration'),
        photo('🥁', 'Touch a dholak just after striking it: you can feel the skin vibrating. Stop the vibration and the sound stops.'),
        p('Sound is a form of energy that produces the sensation of hearing. It is produced by vibrating objects: the vocal cords in your throat, the strings of a veena, the skin of a drum, the prongs of a tuning fork.'),
        p('A vibrating object pushes the air particles next to it, which push their neighbours, and so on. The particles themselves only move back and forth about their positions; it is the disturbance (and energy) that travels to your ear. Sound needs a medium — solid, liquid or gas — to travel. It cannot travel through vacuum: a ringing bell in a jar becomes silent as the air is pumped out.'),
        def('Longitudinal wave', 'A wave in which the particles of the medium vibrate back and forth along the direction in which the wave travels. Sound in air is longitudinal, made of compressions (crowded, high-pressure regions) and rarefactions (spread-out, low-pressure regions).'),
        def('Transverse wave', 'A wave in which the particles vibrate perpendicular to the direction of travel, forming crests and troughs, e.g. waves on a stretched string or ripples on water.'),
        keys('Sound = energy produced by vibrations.', 'Needs a medium; cannot travel in vacuum.', 'Particles vibrate; the disturbance travels.', 'Sound in air: longitudinal (compressions and rarefactions).'),
        remember('Longitudinal → compressions & rarefactions. Transverse → crests & troughs.'),
        tip('Slinky experiment: push and pull one end along its length to see compressions travel (longitudinal); flick it sideways to see crests and troughs (transverse).'),
      ],
      examples: [
        ex('Why can astronauts on the Moon not talk to each other directly, even when standing close?', ['The Moon has no atmosphere — it is nearly a vacuum.', 'Sound needs a medium to travel.'], 'There is no air to carry the sound; they use radio.'),
        ex('What kind of wave is set up when you press and release a slinky along its length?', ['Coils move back and forth along the slinky\'s length.', 'Crowded and spread-out regions move along it.'], 'A longitudinal wave with compressions and rarefactions'),
      ],
      practice: [
        mcq('wave', 'Look at how particles move compared with the wave.', [
          ['Sound waves in air are…', 'Longitudinal', ['Transverse', 'Electromagnetic', 'Not waves at all'], 'Particles move along the direction of travel.', 'Air particles vibrate back and forth along the direction of the sound.'],
          ['A region where air particles are crowded together is a…', 'Compression', ['Rarefaction', 'Crest', 'Trough'], 'High pressure.', 'Compressions are high-density regions in a longitudinal wave.'],
          ['Sound cannot travel through…', 'Vacuum', ['Water', 'Steel', 'Air'], 'It needs particles.', 'Without a medium there is nothing to pass the vibrations on.'],
          ['Ripples on the surface of a pond are…', 'Transverse waves', ['Longitudinal waves', 'Sound waves', 'Not waves'], 'Up-and-down motion with crests and troughs.', 'Water surface particles move up and down as the ripple moves outward.'],
          ['When sound travels through air, the air particles…', 'Vibrate about their mean positions', ['Travel from the source to the listener', 'Stay perfectly still', 'Move in circles only'], 'Energy moves, not matter.', 'Only the disturbance travels; the particles oscillate in place.'],
          ['Sound is produced in our throat by…', 'Vibrating vocal cords', ['The tongue only', 'Our lungs heating air', 'Teeth'], 'The larynx.', 'Air from the lungs makes the vocal cords vibrate.'],
        ]),
        tapT('tap', 'Tap every LONGITUDINAL wave.', [
          ['Sound in air', true], ['Sound in water', true], ['Push-pull wave along a slinky', true],
          ['Ripples on water surface', false], ['Wave on a shaken rope', false], ['Sideways flick of a slinky', false],
        ], ['Particles move along the direction of travel.', 'Crests and troughs mean transverse.'], 'Sound in fluids and push-pull slinky waves are longitudinal; rope, ripple and sideways slinky waves are transverse.'),
        orderT('chain', 'Order the steps by which you hear a temple bell.', ['The bell is struck and vibrates', 'It pushes nearby air particles, making compressions and rarefactions', 'The disturbance passes from particle to particle through the air', 'The vibrations reach your eardrum and make it vibrate', 'The brain interprets the signal as sound'], ['The source vibrates first.', 'The brain is last.'], 'Vibration → disturbance in air → travels through medium → eardrum vibrates → brain hears.'),
      ],
    },
    {
      id: 'ts9.ps.sound.characteristics', title: 'Characteristics of sound: frequency, wavelength, amplitude, pitch, loudness, quality', prereqs: ['ts9.ps.sound.production'],
      intro: [
        h('High, low, loud, soft'),
        photo('🎸', 'Tighten a guitar string and its note goes up; pluck it harder and the note gets louder but stays the same.'),
        def('Wavelength (λ)', 'The distance between two consecutive compressions (or two rarefactions). SI unit: metre.'),
        def('Frequency (f)', 'The number of complete oscillations per second. SI unit: hertz (Hz).'),
        def('Time period (T)', 'Time taken for one complete oscillation: T = 1/f.'),
        def('Amplitude', 'The maximum disturbance of the medium from its mean value — how big the vibration is.'),
        f('v = f × λ', 'speed equals frequency times wavelength'),
        xp({
          title: 'What if? Change the note', formula: 'λ = v / f',
          res: ['lam', 'Wavelength', 'm', 'v / f', 3],
          vars: [['v', 'Speed of sound', 'm/s', 300, 1500, 10, 340], ['f', 'Frequency', 'Hz', 20, 2000, 10, 340]],
          notes: [['f', 'A higher frequency (higher pitch) means shorter wavelength in the same medium.', 'A lower frequency means longer waves.'], ['v', 'In water sound travels faster, so the same note has a longer wavelength.', 'Slower medium, shorter wavelength.']],
          mistakes: [['Thinking a higher note travels faster', 'In a given medium all frequencies travel at the same speed; only λ changes.']],
          real: 'A 340 Hz note in air (340 m/s) has a wavelength of 1 m.',
        }),
        f('T = 1 / f', 'time period equals one over frequency'),
        xp({
          title: 'What if? Faster vibrations', formula: 'T = 1/f',
          res: ['T', 'Time period', 's', '1 / f', 4],
          vars: [['f', 'Frequency', 'Hz', 1, 1000, 1, 50]],
          notes: [['f', 'Double the frequency halves the time period.', 'Lower frequency means each vibration takes longer.']],
          mistakes: [['Multiplying instead of dividing', 'T = 1/f: a 50 Hz vibration takes 1/50 = 0.02 s.']],
          real: 'Our AC mains supply alternates at 50 Hz, i.e. once every 0.02 s.',
        }),
        h('How we hear these properties'),
        p('Pitch depends on frequency: a high frequency sounds shrill (whistle, a child\'s voice), a low frequency sounds deep (a lion\'s roar). Loudness depends on amplitude: a bigger amplitude carries more energy and sounds louder. Loudness is measured in decibels (dB). Quality or timbre is what lets us tell a flute from a violin playing the same note at the same loudness — it depends on the shape of the wave.'),
        p('Humans hear frequencies from about 20 Hz to 20 000 Hz (20 kHz). Below 20 Hz is infrasound (elephants, earthquakes); above 20 kHz is ultrasound (bats, dolphins).'),
        keys('v = fλ; T = 1/f.', 'Pitch ↔ frequency; loudness ↔ amplitude; quality ↔ waveform.', 'Audible range 20 Hz – 20 kHz.', 'Infrasound < 20 Hz; ultrasound > 20 kHz.'),
        remember('Frequency is decided by the SOURCE and does not change when sound passes into another medium; speed and wavelength do.'),
      ],
      examples: [
        ex('A sound of frequency 500 Hz travels at 340 m/s in air. Find its wavelength.', ['λ = v/f', 'λ = 340 ÷ 500'], '0.68 m'),
        ex('A tuning fork makes 256 vibrations per second. Find its time period.', ['T = 1/f = 1/256'], '≈ 0.0039 s'),
      ],
      practice: [
        tp('vfl', (r) => {
          const f0 = r.pick([100, 170, 200, 256, 340, 500, 680, 1000]);
          const lam = r.pick([0.5, 1, 1.5, 2, 0.34]);
          const mode = r.int(0, 2);
          const v = rd(f0 * lam, 2);
          if (mode === 0) return numQ(`A sound wave has frequency ${f0} Hz and wavelength ${lam} m. Find its speed.`, v, 'm/s', ['v = f × λ'], [`v = ${f0} × ${lam} = ${v} m/s`]);
          if (mode === 1) return numQ(`Sound travels at ${v} m/s and has a wavelength of ${lam} m. Find its frequency.`, f0, 'Hz', ['f = v/λ'], [`f = ${v} ÷ ${lam} = ${f0} Hz`], [{ when: `${rd(v * lam, 2)} Hz`, explain: 'Divide speed by wavelength.' }]);
          return numQ(`A ${f0} Hz sound travels at ${v} m/s. Find its wavelength.`, lam, 'm', ['λ = v/f'], [`λ = ${v} ÷ ${f0} = ${lam} m`], [{ when: `${rd(f0 / v, 4)} m`, explain: 'Speed goes on top: λ = v/f.' }]);
        }),
        tp('period', (r) => {
          const f0 = r.pick([2, 4, 5, 10, 20, 25, 50, 100, 200, 500]);
          return numQ(`An object vibrates with a frequency of ${f0} Hz. Find its time period.`, 1 / f0, 's', ['T = 1/f'], [`T = 1 ÷ ${f0} = ${1 / f0} s`], [{ when: `${f0} s`, explain: 'Time period is the reciprocal of frequency.' }]);
        }),
        mcq('chars', 'Pitch ↔ frequency, loudness ↔ amplitude, quality ↔ wave shape.', [
          ['The pitch of a sound depends on its…', 'Frequency', ['Amplitude', 'Speed', 'Wavelength alone in any medium'], 'High notes vibrate faster.', 'Higher frequency → higher pitch.'],
          ['The loudness of a sound depends on its…', 'Amplitude', ['Frequency', 'Time period', 'Quality'], 'Bigger vibrations are louder.', 'Larger amplitude carries more energy → louder.'],
          ['We can tell a flute from a violin playing the same note because of…', 'Quality (timbre)', ['Pitch', 'Loudness', 'Speed'], 'Same note, same loudness.', 'Different wave shapes give different quality.'],
          ['The audible range of the human ear is about…', '20 Hz to 20 000 Hz', ['2 Hz to 200 Hz', '200 Hz to 2 000 000 Hz', '0 Hz to 20 Hz'], '20 to 20 thousand.', 'Normal human hearing spans about 20 Hz to 20 kHz.'],
          ['Sound with frequency above 20 kHz is called…', 'Ultrasound', ['Infrasound', 'Supersonic', 'Audible sound'], 'Ultra = beyond.', 'Ultrasound is above the upper limit of hearing.'],
          ['The SI unit of frequency is…', 'Hertz', ['Metre', 'Second', 'Decibel'], 'Vibrations per second.', '1 Hz = one oscillation per second.'],
        ]),
      ],
    },
    {
      id: 'ts9.ps.sound.echo', title: 'Speed of sound, reflection, echo, multiple reflection, ultrasound and SONAR', prereqs: ['ts9.ps.sound.characteristics'],
      intro: [
        h('Clap near a cliff and the hill claps back'),
        photo('⛰️', 'Shout towards a distant hill near Bhongir fort and you hear your voice return a moment later — an echo.'),
        p('Sound travels fastest in solids, slower in liquids and slowest in gases. At about 20 °C its speed is roughly 343 m/s in air, about 1500 m/s in water and about 5000–6000 m/s in steel. In a gas the speed increases with temperature. Light is so much faster (3 × 10⁸ m/s) that we see lightning before we hear thunder.'),
        p('Sound reflects from hard surfaces just like light from a mirror: the angle of incidence equals the angle of reflection.'),
        def('Echo', 'A reflected sound heard distinctly after the original sound. The sensation of a sound lasts about 0.1 s in our brain, so an echo is heard only if the reflected sound arrives at least 0.1 s later. In air at 344 m/s, the reflector must be at least 344 × 0.1 / 2 ≈ 17.2 m away.'),
        f('d = v × t / 2', 'distance to the reflector equals speed times time divided by two'),
        xp({
          title: 'What if? Time the echo', formula: 'd = vt/2',
          res: ['d', 'Distance to the reflector', 'm', 'v * t / 2', 1],
          vars: [['v', 'Speed of sound', 'm/s', 330, 1550, 10, 340], ['t', 'Time for the echo', 's', 0.1, 10, 0.1, 2]],
          notes: [['t', 'A longer wait for the echo means the reflector is farther away.', 'A shorter wait means it is closer; below 0.1 s you cannot hear a separate echo.'], ['v', 'In water (≈ 1500 m/s) the same echo time means a much greater distance — that is how SONAR measures sea depth.', 'Slower sound, shorter distance for the same time.']],
          mistakes: [['Forgetting to divide by 2', 'The sound goes to the reflector AND back, so the one-way distance is half of v × t.']],
          real: 'A ship\'s SONAR pulse returning after 2 s from the sea bed means a depth of 1500 × 2 / 2 = 1500 m.',
        }),
        h('Multiple reflection and its uses'),
        p('Megaphones, horns and shehnais are shaped to reflect sound forward in one direction. A doctor\'s stethoscope carries the patient\'s heartbeat to the ears by multiple reflections inside the tube. Concert halls have curved ceilings and soundboards behind the stage to spread sound evenly. Too much reflection causes reverberation — a persisting sound — so halls use sound-absorbing curtains, seats and panels.'),
        h('Ultrasound and SONAR'),
        p('Ultrasound has frequencies above 20 kHz. It travels in well-defined beams even through obstacles, so it is used to clean hard-to-reach parts of objects, detect cracks in metal blocks, take images of internal organs (ultrasonography, echocardiography) and break small kidney stones. Bats and dolphins use ultrasound echoes to find their way and their food.'),
        def('SONAR', 'Sound Navigation And Ranging: a ship sends ultrasound pulses into the water and detects the echoes to find the depth of the sea or locate submarines, shoals of fish and shipwrecks. Depth = v × t / 2.'),
        keys('Speed: solids > liquids > gases; air ≈ 343 m/s, water ≈ 1500 m/s.', 'Echo needs ≥ 0.1 s delay → reflector ≥ ≈ 17.2 m away.', 'd = vt/2.', 'Multiple reflection: megaphone, stethoscope, soundboard; reverberation.', 'Ultrasound: cleaning, crack detection, medical imaging; SONAR.'),
        remember('Always halve: echo time covers the trip there AND back.'),
      ],
      examples: [
        ex('Kiran claps near a cliff and hears the echo 2 s later. Speed of sound = 340 m/s. How far is the cliff?', ['Total path = 340 × 2 = 680 m (there and back)', 'd = 680 ÷ 2'], '340 m'),
        ex('A SONAR pulse returns 4 s after being sent. If sound travels at 1500 m/s in sea water, find the depth.', ['d = vt/2 = 1500 × 4 ÷ 2'], '3000 m'),
      ],
      practice: [
        tp('echo', (r) => {
          const sonar = r.next() < 0.5;
          const v = sonar ? 1500 : r.pick([330, 340, 344]);
          const t = sonar ? r.pick([0.4, 1, 2, 3, 4, 6]) : r.pick([0.5, 1, 1.5, 2, 3, 4]);
          const d = rd((v * t) / 2, 2);
          const prompt = sonar ? `A ship's SONAR receives the echo from the sea bed ${t} s after sending a pulse. Sound travels at 1500 m/s in sea water. Find the depth of the sea.` : `A girl shouts in front of a tall building and hears the echo after ${t} s. If sound travels at ${v} m/s, how far away is the building?`;
          return numQ(prompt, d, 'm', ['The sound travels there and back.', 'd = v × t / 2'], [`d = ${v} × ${t} ÷ 2 = ${d} m`], [{ when: `${rd(v * t, 2)} m`, explain: 'That is the total there-and-back path. Divide by 2 for the distance.' }]);
        }),
        tp('min', (r) => {
          const v = r.pick([330, 340, 344, 346, 350]);
          return numQ(`Sound travels at ${v} m/s in air. What is the minimum distance from a wall needed to hear a distinct echo? (Persistence of hearing = 0.1 s)`, rd(v * 0.05, 2), 'm',
            ['The echo must return at least 0.1 s later.', 'd = v × 0.1 / 2'], [`d = ${v} × 0.1 ÷ 2 = ${rd(v * 0.05, 2)} m`], [{ when: `${rd(v * 0.1, 2)} m`, explain: 'Halve the round-trip distance.' }], 0.01);
        }, 2),
        mcq('uses', 'Multiple reflection, ultrasound and SONAR.', [
          ['Sound travels fastest in…', 'Steel', ['Water', 'Air', 'Vacuum'], 'Solids are best.', 'Sound speed: solids > liquids > gases; none in vacuum.'],
          ['A stethoscope works on the principle of…', 'Multiple reflection of sound', ['Refraction of light', 'Ultrasound', 'Total internal reflection of light'], 'Sound bounces inside the tube.', 'Sound reflects repeatedly along the tube to the doctor\'s ears.'],
          ['The persistence of sound that is caused by repeated reflections in a big hall is called…', 'Reverberation', ['Echo', 'Resonance', 'Refraction'], 'It lingers.', 'Reverberation is sound persisting due to many reflections.'],
          ['SONAR uses…', 'Ultrasonic waves', ['Infrasonic waves', 'Light waves', 'Radio waves'], 'High frequency, well-directed.', 'SONAR sends ultrasound pulses into water.'],
          ['Bats find their way in the dark using…', 'Echoes of ultrasound they produce', ['Infrared light', 'Infrasound', 'Smell only'], 'Echolocation.', 'Bats emit ultrasound and listen to the echoes.'],
          ['We see lightning before hearing thunder because…', 'Light travels much faster than sound', ['Thunder is produced later', 'Sound travels faster', 'Our eyes are closer to the sky'], 'Compare 3 × 10⁸ m/s and 340 m/s.', 'Light reaches us almost instantly; sound takes seconds.'],
        ]),
        matchT('match', 'device or use to the property of sound it relies on', [
          ['Megaphone', 'Directs sound by multiple reflection'], ['Soundboard in a hall', 'Spreads sound evenly'], ['Ultrasonography', 'Images of internal organs'],
          ['SONAR', 'Depth of sea from echo time'], ['Ultrasonic cleaning', 'Removes dirt from tiny parts'], ['Sound-absorbing curtains', 'Reduce reverberation'],
        ], ['Megaphones and soundboards use reflection.', 'Medical and cleaning uses need ultrasound.']),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12];
