// Telangana SCERT Class 8 — Physical Science (12 chapters). Original explanations aligned to the official
// chapter list (src/content/ts/books.ts, syllabus.json → classes["8"].subjects["physical-science"]).
// Numbers used in practice: speed of sound in air taken as 340 m/s; calorific values are typical textbook values.
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(8, 'physical-science', n);
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched — check each left item one at a time and start with the pair you are surest of.' }],
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

/** Typed numeric item (with unit when given). */
const numQ = (prompt: string, ans: number, unit: string | undefined, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, true) : approx(ans, rel),
  hints, solution,
  mistakes: [
    ...(unit ? [{ when: 'missing-unit', explain: `Add the unit (${unit}) — a number alone is not a complete physical answer.` }, { when: 'wrong-unit', explain: `That unit measures a different quantity. The answer should be in ${unit}.` }] : []),
    ...mistakes,
  ],
});

// =====================================================================================
// Chapter 1 — Force
// =====================================================================================
const ch1: USpec = {
  id: 'ts8.ps.ch1', subject: 'physics', title: 'Force', source: src(1),
  objectives: [
    {
      id: 'ts8.ps.force.pushpull', title: 'What is a force? Push, pull, contact and non-contact forces', prereqs: [],
      activities: ['lab:forces'],
      intro: [
        h('Every change starts with a push or a pull'),
        photo('🛒', 'You push a shopping trolley to start it, and pull it back to stop it. Both are forces.'),
        p('Kick a ball, open a door, stretch a rubber band, lift a school bag. In each case you either push or pull something. Scientists call any push or pull a force.'),
        p('A force always acts between two objects: one applies it and the other feels it. A force has a size (how strong) and a direction (which way). Force is measured in newtons (N). Lifting a 100 g packet of biscuits needs a force of about 1 N.'),
        def('Force', 'A push or a pull on an object that results from its interaction with another object. SI unit: newton (N).'),
        h('Contact forces'),
        p('Some forces act only when the two objects touch. Your hand pushing a door, a bullock pulling a cart and friction between tyres and the road are contact forces. Muscular force (from our muscles) and friction are the two common contact forces.'),
        h('Non-contact forces'),
        p('Other forces act even across a gap. A magnet pulls an iron pin before touching it. A comb rubbed in dry hair attracts bits of paper. A mango falls from a tree because the Earth pulls it. Magnetic force, electrostatic force and gravitational force are non-contact forces.'),
        keys('Force = push or pull; unit newton (N).', 'A force needs two interacting objects.', 'Contact: muscular force, friction.', 'Non-contact: magnetic, electrostatic, gravitational.'),
        remember('Gravity is a non-contact force that pulls every object towards the Earth — even you, right now.'),
        tip('Quick test: if the force can still act when the objects are separated by a small gap, it is non-contact.'),
      ],
      examples: [
        ex('Meena holds a magnet 2 cm above some iron filings and they jump up to it. Name the force and its type.', ['The magnet and filings are not touching.', 'The force acts across the gap.', 'It is caused by magnetism.'], 'Magnetic force — a non-contact force'),
        ex('A farmer near Warangal drags a plough through the soil. Which forces are acting on the plough?', ['The farmer (or bullock) pulls it with muscles — muscular force, contact.', 'The soil rubs against the blade and resists the motion — friction, contact.', 'The Earth pulls it down — gravity, non-contact.'], 'Muscular force and friction (contact), gravity (non-contact)'),
      ],
      practice: [
        mcq('kind', 'Ask: do the objects have to touch?', [
          ['A comb rubbed on dry hair pulls tiny bits of paper towards it. This force is…', 'Electrostatic force (non-contact)', ['Muscular force (contact)', 'Friction (contact)', 'Magnetic force (non-contact)'], 'The comb has been charged by rubbing.', 'Charged objects attract light objects across a gap — electrostatic force.'],
          ['A coconut falls from a tree. Which force pulls it down?', 'Gravitational force', ['Magnetic force', 'Muscular force', 'Friction'], 'Nobody is touching the coconut.', 'The Earth pulls all objects towards itself — gravity.'],
          ['A ball rolling on the ground slowly stops. The force stopping it is…', 'Friction (contact)', ['Gravity (non-contact)', 'Magnetic force', 'Electrostatic force'], 'The ball rubs against the ground.', 'Friction between ball and ground opposes the motion.'],
          ['Lifting a bucket of water uses…', 'Muscular force', ['Magnetic force', 'Electrostatic force', 'No force'], 'Your arm does the work.', 'Force produced by muscles is muscular force — a contact force.'],
          ['Which of these is a non-contact force?', 'Magnetic force', ['Friction', 'Muscular force', 'The push of a hand on a door'], 'Which one acts across a gap?', 'A magnet can pull iron without touching it.'],
          ['The SI unit of force is…', 'newton (N)', ['kilogram (kg)', 'pascal (Pa)', 'joule (J)'], 'Named after Isaac Newton.', 'Force is measured in newtons.'],
        ]),
        tapT('tap-noncontact', 'Tap every example of a NON-CONTACT force.', [
          ['A magnet pulling a steel pin', true], ['A charged balloon attracting paper bits', true], ['The Earth pulling a falling stone', true],
          ['A cricketer hitting a ball with a bat', false], ['Brakes slowing a bicycle wheel', false], ['Pushing a stalled car', false], ['Pulling a bucket up with a rope', false],
        ], ['Non-contact forces work across a gap.', 'Magnetism, static charge and gravity are the non-contact ones.'], 'Magnetic, electrostatic and gravitational forces act without touching; pushes, pulls by hand and friction need contact.'),
        matchT('match', 'situation to the force at work', [
          ['Dog pulling on a leash', 'Muscular force'], ['Shoe sole gripping the floor', 'Friction'], ['Fridge magnet holding a note', 'Magnetic force'],
          ['Rain falling from clouds', 'Gravitational force'], ['Rubbed balloon sticking to a wall', 'Electrostatic force'],
        ], ['There is exactly one force name for each situation.', 'Rubbing can make friction OR static charge — look at what happens afterwards.']),
      ],
    },
    {
      id: 'ts8.ps.force.net', title: 'Net force: adding and subtracting forces', prereqs: ['ts8.ps.force.pushpull'],
      activities: ['lab:forces'],
      intro: [
        h('When more than one force acts'),
        photo('🪢', 'In a tug of war both teams pull hard, but the rope moves towards the team whose pull is bigger.'),
        p('Usually several forces act on an object at the same time. What matters is their combined effect, called the net force (or resultant force).'),
        p('Forces in the SAME direction add up. If Ravi pushes a box with 40 N and Diya pushes the same way with 30 N, the box feels 70 N.'),
        p('Forces in OPPOSITE directions subtract. If one team pulls a rope with 500 N to the left and the other pulls with 450 N to the right, the net force is 50 N to the left — the direction of the bigger force.'),
        p('If two opposite forces are equal, the net force is zero. The forces are balanced and the object does not start moving (or keeps doing what it was doing). Unequal forces are unbalanced and change the motion.'),
        def('Net force', 'The single force that has the same effect as all the forces acting on an object together.'),
        f('Same direction: F_net = F1 + F2;  Opposite: F_net = F1 − F2 (towards the bigger force)', 'add forces in the same direction, subtract forces in opposite directions'),
        xp({
          title: 'What if? Two teams in a tug of war', formula: 'F_net = F1 − F2',
          res: ['Fnet', 'Net force (+ means towards team 1)', 'N', 'F1 - F2', 0],
          vars: [['F1', 'Pull of team 1', 'N', 0, 1000, 10, 600], ['F2', 'Pull of team 2', 'N', 0, 1000, 10, 450]],
          notes: [['F1', 'Team 1 pulls harder, so the net force shifts towards team 1.', 'Team 1 weakens; once F1 < F2 the net force turns negative — the rope moves towards team 2.'], ['F2', 'Team 2 pulls harder and cancels more of team 1\'s pull.', 'Team 2 eases off, so more of team 1\'s pull is left over.']],
          mistakes: [['Adding opposite forces: 600 + 450 = 1050 N', 'Opposite forces work against each other, so subtract them.'], ['Giving only a number, not the direction', 'Net force is towards the bigger force — always say which way.']],
          real: 'When F1 = F2 the rope does not move even though both teams are straining — balanced forces.',
        }),
        keys('Same direction → add.', 'Opposite directions → subtract; net force points towards the bigger one.', 'Net force zero → balanced forces → no change in motion.', 'Unbalanced forces change speed or direction.'),
        remember('A force is fully described only by its size AND its direction.'),
      ],
      examples: [
        ex('Two friends push a stalled auto forward with 250 N and 200 N. What is the net force?', ['Both forces are in the same direction, so add.', '250 + 200 = 450 N'], '450 N forward'),
        ex('In a tug of war, Team A pulls with 620 N to the left and Team B with 680 N to the right. Find the net force.', ['Opposite directions, so subtract.', '680 − 620 = 60 N', 'The bigger force is Team B\'s, to the right.'], '60 N towards the right (Team B wins)'),
        ex('A book rests on a table. Gravity pulls it down with 5 N. What upward force does the table give?', ['The book is not moving, so forces are balanced.', 'Up force = down force.'], '5 N upwards; net force 0 N'),
      ],
      practice: [
        tp('opposite', (r) => {
          const a = r.pick([200, 250, 300, 350, 400, 450, 500, 600]);
          const b = a + r.pick([20, 30, 40, 50, 60, 80, 100]);
          const [n1, n2] = [who(r), who(r)];
          return numQ(`In a tug of war, ${n1}'s team pulls with ${a} N to the left and ${n2}'s team pulls with ${b} N to the right. What is the size of the net force?`, b - a, 'N',
            ['The forces are in opposite directions.', 'Subtract the smaller from the bigger.'],
            [`Net force = ${b} − ${a} = ${b - a} N`, `It acts to the right, towards ${n2}'s team.`],
            [{ when: `${a + b} N`, explain: 'You added the forces. They pull in opposite directions, so subtract.' }, { when: String(a + b), explain: 'Opposite forces must be subtracted, not added.' }]);
        }),
        tp('same', (r) => {
          const a = r.pick([15, 20, 25, 30, 40, 45, 50, 60]);
          const b = r.pick([10, 12, 18, 22, 35, 55]);
          const n = who(r);
          return numQ(`${n} pushes a cupboard with ${a} N and a friend pushes it in the same direction with ${b} N. Find the net force.`, a + b, 'N',
            ['Both pushes are in the same direction.', 'Forces in the same direction add up.'],
            [`Net force = ${a} + ${b} = ${a + b} N in the direction of the pushes.`],
            [{ when: `${Math.abs(a - b)} N`, explain: 'You subtracted. Pushes in the same direction add together.' }]);
        }),
        mcq('balance', 'Compare the forces in each direction.', [
          ['Two equal forces act on a box in opposite directions. The box…', 'Does not start moving — the forces are balanced', ['Moves in the direction of either force', 'Moves twice as fast', 'Breaks into two'], 'Equal and opposite cancel.', 'Equal opposite forces give zero net force, so the motion does not change.'],
          ['Forces of 30 N east and 30 N west act on a cart. The net force is…', '0 N', ['60 N east', '30 N west', '60 N west'], 'Subtract opposite forces.', '30 − 30 = 0 N: balanced.'],
          ['Which set of forces is unbalanced?', '40 N left and 25 N right', ['20 N left and 20 N right', '15 N up and 15 N down', '50 N north and 50 N south'], 'Look for unequal pairs.', 'Only 40 N and 25 N are unequal, leaving 15 N to the left.'],
          ['A net force acts on a moving ball in its direction of motion. The ball…', 'Speeds up', ['Slows down', 'Stops at once', 'Keeps the same speed'], 'The push is along the motion.', 'An unbalanced force along the motion increases speed.'],
          ['When two forces act in the same direction, the net force is…', 'Their sum', ['Their difference', 'Zero', 'The smaller force'], 'They help each other.', 'Forces in the same direction add.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.force.effects', title: 'Effects of force', prereqs: ['ts8.ps.force.pushpull'],
      activities: ['lab:forces'],
      intro: [
        h('What can a force do?'),
        photo('⚽', 'One kick can start a football, speed it up, stop it or curve its path — and squash it a little for a moment.'),
        p('A force cannot be seen, but its effects can. Watch carefully and you will notice five things a force can do.'),
        p('1. Make a still object move — pushing a parked cycle. 2. Change the speed of a moving object — pedalling harder, or braking. 3. Stop a moving object — a goalkeeper catching a ball. 4. Change the direction of motion — a batsman deflecting a ball. 5. Change the shape (and size) of an object — pressing dough, squeezing a sponge, stretching a spring.'),
        p('Some shape changes stay (a crushed can, kneaded clay). Others spring back when the force is removed (a rubber band, a sponge). Materials that return to their shape are called elastic.'),
        def('Effect of force', 'A force can change an object\'s state of motion (start, stop, speed up, slow down, turn) or its shape.'),
        keys('Force can start or stop motion.', 'Force can change speed.', 'Force can change direction.', 'Force can change shape.'),
        remember('A force does NOT always produce motion: pushing a wall hard does not move it, but you still apply a force.'),
        tip('In any example, ask: did the speed change, the direction change, or the shape change? There may be more than one effect.'),
      ],
      examples: [
        ex('A potter presses wet clay on a wheel into a pot. Which effect of force is this?', ['The clay is not mainly moving faster or turning.', 'Its form changes from a lump to a pot.'], 'Change of shape'),
        ex('A fielder catches a fast ball and it stops in his hands. Which effects of force are seen?', ['The ball was moving and now it is at rest — motion stopped.', 'The ball is also squeezed a little in the catch.'], 'Stops the motion (and slightly changes shape)'),
      ],
      practice: [
        mcq('identify', 'Look at what changes: motion, speed, direction or shape?', [
          ['A batsman hits a ball back towards the bowler. The main effect is…', 'Change of direction of motion', ['Change of shape only', 'Making a still object move', 'No effect'], 'The ball was already moving.', 'The bat turns the ball around, changing its direction.'],
          ['Squeezing a sponge in your fist shows that force can…', 'Change the shape of an object', ['Change the direction of motion', 'Stop a moving object', 'Make an object lighter'], 'Look at the sponge itself.', 'The sponge gets squashed — a change of shape.'],
          ['Pressing the brakes of a moving bicycle…', 'Reduces its speed', ['Increases its speed', 'Changes its shape', 'Has no effect'], 'Brakes oppose motion.', 'The braking force slows the cycle down.'],
          ['Kicking a football lying still on the ground…', 'Makes a stationary object move', ['Only changes its shape', 'Stops it', 'Turns it around'], 'It was at rest.', 'The kick puts the ball in motion.'],
          ['Pedalling harder on a moving cycle…', 'Increases its speed', ['Decreases its speed', 'Changes its direction', 'Changes its shape'], 'Extra push forward.', 'A bigger forward force speeds it up.'],
          ['Pushing hard on a brick wall produces…', 'No visible motion, though a force is applied', ['Fast motion of the wall', 'A change in the wall\'s direction', 'Zero force'], 'Does every force cause motion?', 'The wall is too firmly held; force is applied but no motion results.'],
        ]),
        matchT('match', 'action to the effect of force', [
          ['Rolling chapati dough flat', 'Change of shape'], ['Goalkeeper catching a ball', 'Stops motion'], ['Pushing a parked scooter', 'Starts motion'],
          ['Turning a cycle handle at a corner', 'Changes direction'], ['Pressing the accelerator of a car', 'Increases speed'],
        ], ['Each action shows one main effect.', 'Something at rest that begins to move → starts motion.']),
        tapT('tap-shape', 'Tap every action in which force mainly CHANGES SHAPE.', [
          ['Stretching a rubber band', true], ['Kneading dough', true], ['Crushing an empty can', true], ['Squeezing a toothpaste tube', true],
          ['Stopping a rolling marble', false], ['Swinging a cricket bat', false], ['Turning a kite in the wind', false],
        ], ['Shape changes are about the object\'s form, not its motion.', 'Stopping or turning changes motion.'], 'Stretching, kneading, crushing and squeezing change shape; stopping and turning change motion.'),
      ],
    },
    {
      id: 'ts8.ps.force.pressure', title: 'Pressure: force spread over an area', prereqs: ['ts8.ps.force.net'],
      intro: [
        h('Why are knives sharp and bag straps wide?'),
        photo('📌', 'A drawing pin goes into the board easily because your thumb\'s push is focused on its tiny pointed tip.'),
        p('Push a pencil into your palm with its blunt end, then (gently!) with the sharp tip using the same force. The tip hurts more. The force is the same; what changed is the area it acts on.'),
        def('Pressure', 'The force acting perpendicular (straight on) to a surface per unit area of that surface.'),
        f('Pressure = Force / Area   (P = F / A)', 'pressure equals force divided by area'),
        p('Force is in newtons (N) and area in square metres (m²), so pressure is in N/m², called the pascal (Pa). 1 Pa = 1 N/m².'),
        p('Smaller area → bigger pressure: knives, needles, nails and axes have thin edges or points. Bigger area → smaller pressure: school bags have wide straps, trucks have many wide tyres, and camels have broad feet so they do not sink into sand.'),
        h('Liquids and gases also press'),
        p('Water presses on the walls and bottom of its container, and the pressure grows with depth — that is why a dam is built thicker at the bottom. Air presses on us from all sides too: this is atmospheric pressure. We do not feel crushed because the pressure inside our body balances it.'),
        xp({
          title: 'What if? Same force, different area', formula: 'P = F / A',
          res: ['P', 'Pressure', 'Pa', 'F / A', 1],
          vars: [['F', 'Force', 'N', 10, 1000, 10, 200], ['A', 'Area', 'm²', 0.01, 2, 0.01, 0.5]],
          notes: [['F', 'More force on the same area gives more pressure.', 'Less force on the same area gives less pressure.'], ['A', 'Spreading the force over a bigger area lowers the pressure — like wide bag straps.', 'Focusing the force on a smaller area raises the pressure — like a sharp knife.']],
          mistakes: [['Multiplying F × A', 'Pressure is force PER area, so divide: P = F ÷ A.'], ['Using cm² with Pa', 'Pa means N per m². Convert cm² to m² first (1 cm² = 0.0001 m²).']],
          real: 'Standing on one foot halves the area under you, so the pressure on the floor doubles.',
        }),
        keys('P = F/A; unit pascal (Pa) = N/m².', 'Small area → high pressure (cutting, piercing).', 'Large area → low pressure (wide straps, broad tyres).', 'Liquid pressure increases with depth; air exerts atmospheric pressure.'),
        remember('Pressure depends on BOTH the force and the area. Same force + smaller area = more pressure.'),
      ],
      examples: [
        ex('A box weighing 600 N rests on a floor area of 2 m². Find the pressure on the floor.', ['P = F/A', 'P = 600 N ÷ 2 m²', 'P = 300 Pa'], '300 Pa'),
        ex('A force of 40 N acts on an area of 0.05 m². What is the pressure?', ['P = 40 ÷ 0.05', 'P = 800 N/m²'], '800 Pa'),
        ex('A pressure of 2000 Pa acts on an area of 0.3 m². What force is applied?', ['F = P × A', 'F = 2000 × 0.3 = 600 N'], '600 N'),
      ],
      practice: [
        tp('p', (r) => {
          const F = r.pick([60, 120, 200, 240, 300, 450, 500, 600, 800, 1200]);
          const A = r.pick([0.5, 2, 4, 0.2, 0.25, 1.5, 3]);
          const P = rd(F / A, 2);
          return numQ(`A force of ${F} N acts on an area of ${A} m². Find the pressure.`, P, 'Pa',
            ['Pressure = Force ÷ Area.', `P = ${F} ÷ ${A}`],
            [`P = F/A = ${F} ÷ ${A}`, `P = ${P} Pa (N/m²)`],
            [{ when: `${rd(F * A, 2)} Pa`, explain: 'You multiplied. Pressure is force divided by area.' }]);
        }),
        tp('force', (r) => {
          const P = r.pick([500, 1000, 1500, 2000, 2500, 4000]);
          const A = r.pick([0.2, 0.4, 0.5, 1.5, 2, 3]);
          const F = rd(P * A, 2);
          return numQ(`A pressure of ${P} Pa acts on an area of ${A} m². What force is acting?`, F, 'N',
            ['Rearrange P = F/A.', 'F = P × A'],
            [`F = P × A = ${P} × ${A}`, `F = ${F} N`],
            [{ when: `${rd(P / A, 2)} N`, explain: 'You divided. To find force, multiply pressure by area.' }], 2);
        }, 2),
        mcq('apply', 'Think: does a smaller area increase or decrease pressure?', [
          ['Why do school bags have wide straps?', 'A wide strap spreads the weight over a bigger area, lowering pressure on the shoulder', ['A wide strap makes the bag lighter', 'A wide strap increases pressure', 'It is only for decoration'], 'Bigger area, same force.', 'Larger area means less pressure, so it hurts less.'],
          ['Why is a knife sharpened?', 'A thin edge has a tiny area, so the same force gives high pressure', ['To make it heavier', 'To lower the pressure', 'To increase its area'], 'Small area → ?', 'Small area means large pressure, so it cuts easily.'],
          ['The unit of pressure is…', 'pascal (Pa)', ['newton (N)', 'joule (J)', 'metre (m)'], 'N per m².', '1 Pa = 1 N/m².'],
          ['Why is a dam wall made thicker at the bottom?', 'Water pressure increases with depth', ['Water is lighter at the bottom', 'Air pressure is greater at the bottom', 'To save cement'], 'Deeper water presses harder.', 'Liquid pressure grows with depth, so the base must be strongest.'],
          ['A camel walks easily on sand because…', 'Its broad feet spread its weight, lowering the pressure', ['It is very light', 'Its feet are pointed', 'Sand has no friction'], 'Wide feet, large area.', 'Large area → small pressure → feet do not sink.'],
          ['Which exerts the greatest pressure on the floor with the same weight?', 'Standing on the heel of one high-heeled shoe', ['Lying flat on the floor', 'Standing on both feet', 'Sitting on a mat'], 'Find the smallest area.', 'The smallest contact area gives the greatest pressure.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Friction
// =====================================================================================
const ch2: USpec = {
  id: 'ts8.ps.ch2', subject: 'physics', title: 'Friction', source: src(2),
  objectives: [
    {
      id: 'ts8.ps.friction.basics', title: 'Force of friction and the factors that affect it', prereqs: ['ts8.ps.force.net'],
      activities: ['lab:forces'],
      intro: [
        h('The force that resists sliding'),
        photo('🧱', 'Push a brick along the floor and it stops the moment you let go. An invisible force acts against its motion.'),
        p('Roll a marble on the floor and it slowly comes to a stop. Nobody pushed it backwards — the floor did. Friction is a force that acts between two surfaces in contact and always opposes their relative motion (or the attempt to move).'),
        p('Why? Even surfaces that look smooth have tiny bumps and hollows. When two surfaces touch, these irregularities lock into each other. To slide one over the other we must overcome this interlocking.'),
        def('Friction', 'The force that opposes the relative motion between two surfaces in contact. It acts along the surfaces, opposite to the direction of motion.'),
        h('Three kinds of friction'),
        p('Static friction acts when you push something that has not yet started moving. Sliding friction acts once it slides. Rolling friction acts when one body rolls over another. Static friction is the largest and rolling friction the smallest — that is why it is harder to start pushing a heavy box than to keep it sliding, and why wheels make moving loads easy.'),
        h('What does friction depend on?'),
        p('1. Nature of the surfaces: rough surfaces (sand, carpet) give more friction than smooth ones (glass, polished tiles). 2. How hard the surfaces are pressed together: a heavier object has more friction. Friction hardly depends on how much area is in contact.'),
        f('Net force on a pushed object = Applied force − Friction', 'net force equals applied force minus friction'),
        keys('Friction opposes motion; it acts between surfaces in contact.', 'Cause: interlocking of surface irregularities.', 'Static > sliding > rolling.', 'More friction with rougher surfaces and heavier objects.'),
        remember('Friction acts opposite to the direction of motion — never in the same direction as the slide.'),
        tip('Try it: a spring balance pulling a brick shows a bigger reading just before the brick starts to move (static friction) than while it slides.'),
      ],
      examples: [
        ex('Arjun pushes a box with 80 N. Sliding friction on it is 50 N. What is the net force on the box?', ['Friction acts opposite to the push.', 'Net force = 80 − 50 = 30 N'], '30 N in the direction of the push'),
        ex('A ball rolled on a carpet stops sooner than one rolled on a polished floor. Explain.', ['The carpet is rougher than the floor.', 'More interlocking → more friction.', 'Greater friction slows the ball faster.'], 'Friction is greater on the rough carpet'),
      ],
      practice: [
        tp('net', (r) => {
          const fr = r.pick([20, 25, 30, 40, 45, 60]);
          const F = fr + r.pick([10, 15, 20, 35, 50]);
          const n = who(r);
          return numQ(`${n} pushes a crate with a force of ${F} N. The friction from the floor is ${fr} N. What is the net force on the crate?`, F - fr, 'N',
            ['Friction acts opposite to the push.', 'Subtract friction from the applied force.'],
            [`Net force = ${F} − ${fr} = ${F - fr} N, in the direction of the push.`],
            [{ when: `${F + fr} N`, explain: 'Friction opposes motion, so subtract it — do not add it.' }]);
        }),
        mcq('concept', 'Remember: friction always opposes motion.', [
          ['Friction acts…', 'Opposite to the direction of motion', ['In the direction of motion', 'Upwards only', 'Only in liquids'], 'It resists sliding.', 'Friction always opposes relative motion.'],
          ['What causes friction between two surfaces?', 'Interlocking of tiny bumps on the surfaces', ['Magnetism between surfaces', 'Gravity of the surfaces', 'Air between surfaces only'], 'Look at the surfaces under a magnifier.', 'Irregularities lock together and resist sliding.'],
          ['Which kind of friction is the smallest?', 'Rolling friction', ['Static friction', 'Sliding friction', 'All are equal'], 'Wheels make work easy.', 'Rolling friction is much smaller than sliding friction.'],
          ['It is harder to start a heavy box moving than to keep it moving because…', 'Static friction is greater than sliding friction', ['Sliding friction is greater', 'The box gets lighter', 'Gravity switches off'], 'Before vs after it moves.', 'Static friction > sliding friction.'],
          ['Friction increases when…', 'The surfaces are rougher or pressed together harder', ['The surfaces are polished', 'Oil is applied', 'Wheels are added'], 'Two factors.', 'Rougher surfaces and greater pressing force both raise friction.'],
          ['A ball rolled on which surface will go the farthest?', 'A glass sheet', ['Sand', 'A carpet', 'A gravel path'], 'Least rough surface.', 'Glass is smoothest, so friction is least.'],
        ]),
        orderT('order', 'Arrange the kinds of friction from GREATEST to SMALLEST.', ['Static friction', 'Sliding friction', 'Rolling friction'], ['Starting is hardest.', 'Wheels make things easiest to move.'], 'Static friction is greatest, then sliding; rolling friction is smallest.'),
      ],
    },
    {
      id: 'ts8.ps.friction.uses', title: 'Is friction necessary? Increasing and reducing friction', prereqs: ['ts8.ps.friction.basics'],
      intro: [
        h('A friend and a foe'),
        photo('🚲', 'Brakes, tyre treads and the grip on cycle handles all use friction; the oil on the chain and ball bearings in the wheels fight it.'),
        p('Imagine a world with no friction. You could not walk (your feet would slip), write (the pencil would slide over the paper), tie a knot, light a matchstick or stop a cycle. Nails would slide out of walls. Friction is necessary.'),
        p('But friction also wears out shoe soles, tyres and machine parts, and turns useful energy into heat. Rub your palms together and they warm up — engines lose energy this way. That is why friction is called a "necessary evil".'),
        h('Increasing friction'),
        p('Treads on tyres and soles, sand spread on slippery roads, chalk powder on gymnasts\' hands, and brake pads all increase friction where we need grip.'),
        h('Reducing friction'),
        p('Lubricants (oil, grease) fill the bumps so the surfaces slide easily. Ball bearings replace sliding with rolling. Wheels do the same. Polishing makes surfaces smoother. Powder on a carrom board helps the coins glide.'),
        def('Lubricant', 'A substance such as oil or grease that reduces friction between moving parts.'),
        keys('Friction lets us walk, write, hold and stop.', 'Friction causes wear and tear and produces heat.', 'Increase: treads, sand, chalk, brakes.', 'Decrease: lubricants, ball bearings, wheels, polishing, powder.'),
        remember('Ball bearings change sliding friction into much smaller rolling friction.'),
      ],
      examples: [
        ex('Why do cricketers wear shoes with spikes?', ['Spikes dig into the ground.', 'They increase friction (grip).', 'Players can run and turn without slipping.'], 'To increase friction and avoid slipping'),
        ex('The hinges of Lakshmi\'s door squeak. What should she do and why?', ['Squeaking is caused by friction between metal parts.', 'Put a few drops of oil (lubricant).', 'The oil fills the gaps and reduces friction.'], 'Oil the hinges to reduce friction'),
      ],
      practice: [
        tapT('tap-increase', 'Tap every method that INCREASES friction.', [
          ['Treads on tyres', true], ['Sprinkling sand on a slippery road', true], ['Gymnasts rubbing chalk on hands', true], ['Grooves on shoe soles', true],
          ['Oiling a sewing machine', false], ['Ball bearings in a fan', false], ['Powder on a carrom board', false], ['Polishing a floor', false],
        ], ['Increasing friction gives more grip.', 'Oil, bearings, powder and polish make things slide.'], 'Treads, sand, chalk and grooves increase grip; lubricants, bearings, powder and polish reduce friction.'),
        mcq('why', 'Ask: do we want more grip or less rubbing here?', [
          ['Why is it hard to walk on a freshly wet, soapy floor?', 'Friction between feet and floor is greatly reduced', ['Friction is greatly increased', 'Gravity is stronger', 'The floor pushes harder'], 'Soap acts like a lubricant.', 'Less friction means our feet slip.'],
          ['Ball bearings are used in cycle wheels to…', 'Replace sliding friction with smaller rolling friction', ['Increase friction', 'Make the cycle heavier', 'Stop the wheel'], 'Balls roll.', 'Rolling friction is much smaller than sliding friction.'],
          ['Why do our palms become warm when rubbed together?', 'Friction produces heat', ['Blood stops flowing', 'Air pressure rises', 'Static charge forms'], 'Work against friction.', 'Overcoming friction turns energy into heat.'],
          ['Friction is called a "necessary evil" because…', 'It is useful, yet it also causes wear and wastes energy', ['It is always harmful', 'It is always useful', 'It exists only in machines'], 'Both sides.', 'We need it to walk and stop, but it wears things out and heats them.'],
          ['Without friction, which would be impossible?', 'Writing with a pencil on paper', ['Seeing a rainbow', 'Hearing music', 'A magnet attracting iron'], 'Pencil lead must rub off.', 'Writing needs friction to leave graphite on paper.'],
          ['Which method reduces friction?', 'Applying grease to moving parts', ['Making tyre grooves deeper', 'Spreading sand on ice', 'Using rubber brake pads'], 'Lubricant.', 'Grease fills the surface bumps and reduces friction.'],
        ]),
        matchT('match', 'situation to the way friction is changed', [
          ['Squeaky door hinge', 'Apply oil'], ['Slippery road in winter', 'Spread sand'], ['Heavy luggage', 'Use wheels'],
          ['Carrom board', 'Sprinkle powder'], ['Motor shaft spinning fast', 'Fit ball bearings'],
        ], ['Some need more grip, others less rubbing.', 'Only the slippery road needs MORE friction.']),
      ],
    },
    {
      id: 'ts8.ps.friction.fluid', title: 'Fluid friction (drag)', prereqs: ['ts8.ps.friction.basics'],
      intro: [
        h('Air and water push back too'),
        photo('🐟', 'A fish\'s pointed head and smooth body let it slip through water with little resistance.'),
        p('Liquids and gases are together called fluids. When something moves through a fluid, the fluid resists the motion. This is fluid friction, also called drag.'),
        def('Fluid friction (drag)', 'The frictional force exerted by a liquid or gas on an object moving through it.'),
        p('Drag depends on: the speed of the object (faster → more drag), the shape of the object, and the nature of the fluid (water resists more than air; honey more than water).'),
        p('To reduce drag, objects are given a streamlined shape: pointed in front, broad in the middle and tapering at the back. Fish, birds, boats, aeroplanes and racing cars all have this shape. Nature designed it first; engineers copied it.'),
        p('Drag can also help: a parachute has a large surface so that air resistance slows the fall of a skydiver.'),
        keys('Fluids = liquids and gases.', 'Drag increases with speed and depends on shape and on the fluid.', 'Streamlined shape reduces drag.', 'Parachutes use drag to slow a fall.'),
        remember('Streamlined = pointed front, broad middle, tapering tail.'),
        tip('Hold your palm flat out of a moving bus window (safely) — palm facing forward feels a strong push; edge forward feels much less. That is shape affecting drag.'),
      ],
      examples: [
        ex('Why are aeroplanes shaped like birds?', ['Both move fast through air.', 'A streamlined shape lets air flow smoothly around them.', 'Less drag means less fuel is needed.'], 'To reduce air resistance (drag)'),
        ex('A paper ball and a flat sheet of paper are dropped together. Which lands first and why?', ['Both have the same weight.', 'The flat sheet meets more air (larger area).', 'More drag slows it.'], 'The paper ball lands first; the sheet feels more drag'),
      ],
      practice: [
        mcq('concept', 'Drag depends on speed, shape and the fluid.', [
          ['Fluid friction acts on objects moving through…', 'Liquids and gases', ['Solids only', 'Vacuum', 'Only water'], 'What are fluids?', 'Fluids are liquids and gases.'],
          ['Which shape experiences the least drag?', 'Streamlined (pointed front, tapering back)', ['A flat plate facing the flow', 'A cube', 'An open umbrella'], 'Think of a fish.', 'Streamlining lets the fluid flow smoothly around.'],
          ['As a cyclist rides faster, air resistance…', 'Increases', ['Decreases', 'Stays the same', 'Becomes zero'], 'Speed matters.', 'Drag increases with speed.'],
          ['A parachute works because…', 'Its large area increases air resistance', ['It reduces air resistance', 'It is lighter than air', 'It removes gravity'], 'More area facing the air.', 'Large area → large drag → slow fall.'],
          ['Walking in a swimming pool is harder than walking on land because…', 'Water exerts more fluid friction than air', ['Gravity is stronger in water', 'Water has no friction', 'The pool floor is rough'], 'Compare the fluids.', 'Water resists motion more than air.'],
          ['Boats are made pointed at the front to…', 'Reduce water resistance', ['Increase water resistance', 'Look beautiful only', 'Make them heavier'], 'Streamlining.', 'A pointed bow cuts through water with less drag.'],
        ]),
        tapT('tap-stream', 'Tap every thing that is STREAMLINED to reduce drag.', [
          ['Body of a fish', true], ['Aeroplane', true], ['Racing car', true], ['Body of a flying bird', true],
          ['Open parachute', false], ['Brick', false], ['Open umbrella', false],
        ], ['Streamlined things are pointed in front and taper behind.', 'A parachute is designed to INCREASE drag.'], 'Fish, birds, aeroplanes and racing cars are streamlined; parachutes and umbrellas catch air.'),
        matchT('match', 'example to the idea it shows', [
          ['Skydiver opens a parachute', 'Drag can be useful'], ['Faster car uses more fuel', 'Drag grows with speed'], ['Fish body shape', 'Streamlining'],
          ['Wading in a river is tiring', 'Water resists more than air'],
        ], ['Read each example and ask what it teaches about drag.', 'Fish body → nature\'s streamlining.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Synthetic Fibres and Plastics
// =====================================================================================
const ch3: USpec = {
  id: 'ts8.ps.ch3', subject: 'chemistry', title: 'Synthetic Fibres and Plastics', source: src(3),
  objectives: [
    {
      id: 'ts8.ps.fibre.types', title: 'Natural and synthetic fibres; what a polymer is', prereqs: [],
      intro: [
        h('Where do our clothes come from?'),
        photo('🧦', 'Check the label on a sock or school uniform: cotton, polyester, nylon, or a blend of them.'),
        p('Cotton comes from cotton bolls, jute from a plant stem, wool from sheep, silk from silkworm cocoons. These are natural fibres — made by plants or animals.'),
        p('Many fibres are made in factories from chemicals, mostly obtained from petroleum. These are synthetic (man-made) fibres: nylon, polyester and acrylic are common ones.'),
        def('Synthetic fibre', 'A fibre made by humans from chemical substances, usually petrochemicals, rather than taken directly from plants or animals.'),
        h('Long chains: polymers'),
        p('A synthetic fibre is made of very long chains. Each chain is formed by joining a huge number of small units, like beads on a necklace or children holding hands in a long line. The small unit is a monomer; the long chain is a polymer ("poly" = many, "mer" = parts).'),
        p('Polymers are not only man-made. Cotton is mainly cellulose — a natural polymer of glucose units. Wool and silk are natural polymers made of proteins.'),
        def('Polymer', 'A large molecule formed by joining many small repeating units (monomers).'),
        keys('Natural fibres: cotton, jute, wool, silk.', 'Synthetic fibres: nylon, polyester, acrylic (made from petrochemicals).', 'Polymer = many monomers joined in a long chain.', 'Cellulose (cotton) is a natural polymer.'),
        remember('Synthetic fibres are strong, light, cheap and dry quickly — but they melt on heating and do not absorb sweat well.'),
      ],
      examples: [
        ex('Sort these: wool, nylon, jute, polyester.', ['Wool comes from sheep — natural (animal).', 'Jute comes from a plant — natural (plant).', 'Nylon and polyester are made from chemicals.'], 'Natural: wool, jute. Synthetic: nylon, polyester'),
        ex('Why is cotton called a polymer even though it grows on a plant?', ['Cotton is mostly cellulose.', 'Cellulose is a long chain of many glucose units joined together.'], 'Because cellulose is a natural polymer of glucose'),
      ],
      practice: [
        tapT('tap-synthetic', 'Tap every SYNTHETIC fibre.', [
          ['Nylon', true], ['Polyester', true], ['Acrylic', true], ['Terylene', true],
          ['Cotton', false], ['Wool', false], ['Silk', false], ['Jute', false],
        ], ['Synthetic fibres are made in factories from petrochemicals.', 'Cotton, wool, silk and jute come from plants or animals.'], 'Nylon, polyester (terylene) and acrylic are synthetic; cotton, wool, silk and jute are natural.'),
        mcq('polymer', 'Remember: poly = many, mer = unit.', [
          ['A polymer is…', 'A long chain made by joining many small units', ['A single small molecule', 'A type of metal', 'A mixture of gases'], 'Many beads on one string.', 'Polymers are chains of many monomers.'],
          ['The small repeating unit of a polymer is called a…', 'Monomer', ['Polymer', 'Fibre', 'Crystal'], 'Mono = one.', 'Monomers join to form polymers.'],
          ['Cotton is mainly made of…', 'Cellulose', ['Nylon', 'Protein', 'Polyester'], 'A plant polymer.', 'Cellulose is a natural polymer of glucose.'],
          ['Most synthetic fibres are made from raw materials obtained from…', 'Petroleum (petrochemicals)', ['Sheep', 'Silkworms', 'Cotton plants'], 'Made in factories from chemicals.', 'Petrochemicals are the main raw material.'],
          ['Which is a natural fibre from an animal?', 'Wool', ['Nylon', 'Cotton', 'Acrylic'], 'Sheep.', 'Wool is the hair of sheep and goats.'],
          ['A disadvantage of synthetic clothes is that they…', 'Melt on heating and absorb little sweat', ['Are very weak', 'Take very long to dry', 'Are very expensive'], 'Think of a hot summer day and a kitchen fire.', 'Synthetics melt and stick to skin, and do not soak up sweat.'],
        ]),
        matchT('match', 'fibre to its source', [
          ['Cotton', 'Cotton plant (boll)'], ['Jute', 'Stem of jute plant'], ['Wool', 'Hair of sheep'], ['Silk', 'Silkworm cocoon'], ['Nylon', 'Petrochemicals in a factory'],
        ], ['Two come from animals, two from plants, one from a factory.', 'Silk is spun by an insect.']),
      ],
    },
    {
      id: 'ts8.ps.fibre.synthetic', title: 'Rayon, nylon, polyester and acrylic', prereqs: ['ts8.ps.fibre.types'],
      intro: [
        h('Meet the man-made fibres'),
        photo('🎒', 'School bags, ropes, tents and seat belts are usually made of nylon or polyester because they are strong and light.'),
        def('Rayon', 'Made by chemically treating wood pulp (cellulose). It looks and feels like silk, so it is called artificial silk. It is cheaper than silk and is used for sarees, bed sheets and carpets. Because it starts from a natural material it is often called semi-synthetic.'),
        def('Nylon', 'The first fully synthetic fibre (made in the 1930s, without any natural raw material). It is very strong, elastic, light and shiny. A nylon thread is stronger than a steel wire of the same thickness. Used for ropes, parachutes, fishing nets, socks, toothbrush bristles and seat belts.'),
        def('Polyester', 'A fibre that does not crease easily and stays crisp. Terylene is a well-known polyester. Polyester is often blended with cotton (polycot) or wool (polywool). PET, the material of water bottles, is also a polyester.'),
        def('Acrylic', 'Looks and feels like wool, so it is called artificial wool. It is cheaper than wool and is used for sweaters, shawls and blankets.'),
        p('Why are synthetic fibres so popular? They are strong, durable, cheap, readily available, easy to wash and dry quickly. Their drawbacks: they melt and stick to the skin in a fire, absorb little sweat and are not biodegradable.'),
        keys('Rayon = artificial silk (from wood pulp).', 'Nylon = first fully synthetic fibre; very strong.', 'Polyester (terylene, PET) = does not wrinkle.', 'Acrylic = artificial wool.'),
        remember('Never wear synthetic clothes while cooking or near fire — they melt and stick to the body.'),
      ],
      examples: [
        ex('Which fibre would you choose for a mountaineering rope? Why?', ['A rope must hold a large weight without snapping.', 'Nylon is very strong and elastic, and light.'], 'Nylon — it is very strong, elastic and light'),
        ex('Kavya wants a cheap warm sweater. Which synthetic fibre suits her?', ['Wool is warm but costly.', 'Acrylic looks and feels like wool and is cheaper.'], 'Acrylic (artificial wool)'),
      ],
      practice: [
        matchT('match', 'fibre to its best description', [
          ['Rayon', 'Artificial silk from wood pulp'], ['Nylon', 'First fully synthetic, very strong'], ['Polyester', 'Does not crease easily'], ['Acrylic', 'Artificial wool'], ['PET', 'Polyester used for bottles'],
        ], ['Artificial silk and artificial wool are nicknames.', 'Nylon is the famous strong one.']),
        mcq('uses', 'Match the property to the use.', [
          ['Which fibre is called artificial silk?', 'Rayon', ['Acrylic', 'Nylon', 'Jute'], 'Made from wood pulp.', 'Rayon looks like silk and is made from cellulose.'],
          ['Which fibre is called artificial wool?', 'Acrylic', ['Rayon', 'Polyester', 'Nylon'], 'Used for cheap sweaters.', 'Acrylic resembles wool.'],
          ['Parachutes and climbing ropes are made of nylon because it is…', 'Strong, elastic and light', ['Heavy and rigid', 'Absorbs a lot of water', 'Easily torn'], 'They must not snap.', 'Nylon has high strength and elasticity.'],
          ['Terylene is a kind of…', 'Polyester', ['Acrylic', 'Rayon', 'Natural fibre'], 'Easy-care fabric.', 'Terylene is a popular polyester.'],
          ['The first fully synthetic fibre was…', 'Nylon', ['Rayon', 'Cotton', 'Acrylic'], 'Rayon still starts from wood pulp.', 'Nylon was made without any natural raw material.'],
          ['Polycot is a blend of…', 'Polyester and cotton', ['Polyester and wool', 'Nylon and silk', 'Acrylic and jute'], 'Poly + cot.', 'Polycot = polyester + cotton.'],
        ]),
        tapT('tap-props', 'Tap every property that is TRUE of most synthetic fibres.', [
          ['Strong and durable', true], ['Dry quickly after washing', true], ['Cheaper than natural fibres', true], ['Melt on heating', true],
          ['Absorb lots of sweat', false], ['Biodegradable', false], ['Made from cotton plants', false],
        ], ['Think about rain coats and tents.', 'Synthetic fibres do not rot away easily.'], 'Synthetics are strong, quick-drying and cheap but melt, absorb little sweat and are not biodegradable.'),
      ],
    },
    {
      id: 'ts8.ps.plastic.types', title: 'Plastics: thermoplastics, thermosetting plastics and the environment', prereqs: ['ts8.ps.fibre.types'],
      intro: [
        h('One material, a thousand shapes'),
        photo('🧴', 'Bottles, buckets, pipes, pens and switches — plastics can be moulded into almost any shape.'),
        p('Plastic is also a polymer, like synthetic fibres. In some plastics the chains are arranged in a line (linear); in others they are cross-linked like a net. This difference decides how the plastic behaves on heating.'),
        def('Thermoplastic', 'A plastic that softens on heating and can be reshaped again and again. Examples: polythene (PE), PVC. Used for bags, bottles, toys, pipes, combs.'),
        def('Thermosetting plastic', 'A plastic that, once moulded, does not soften on heating. Examples: Bakelite and melamine. Bakelite is a poor conductor of heat and electricity — used for switches and pan handles. Melamine resists fire — used for kitchenware and floor tiles.'),
        h('Why plastics are popular'),
        p('Plastics do not rust or react with water and air, are light, strong, cheap, easy to mould and are poor conductors of heat and electricity.'),
        h('The problem: plastics last for ever'),
        p('A material that is broken down by bacteria in nature is biodegradable (vegetable peels, paper, cotton cloth). Most plastics are non-biodegradable — they stay in the soil for hundreds of years, choke drains, harm animals that swallow them, and give out poisonous gases when burnt.'),
        p('Follow the 4 R principle: Reduce, Reuse, Recycle, Recover. Carry a cloth bag, refuse single-use plastics and never burn plastic waste. Only thermoplastics can be recycled by melting.'),
        keys('Thermoplastics soften on heating: polythene, PVC.', 'Thermosetting plastics do not: Bakelite, melamine.', 'Plastics are light, strong, non-corrosive, insulating.', 'Most plastics are non-biodegradable → Reduce, Reuse, Recycle, Recover.'),
        remember('Electrical switches are Bakelite (thermosetting): it does not soften with heat and does not conduct electricity.'),
      ],
      examples: [
        ex('Why is the handle of a frying pan made of Bakelite and not polythene?', ['The handle gets hot.', 'Polythene (thermoplastic) would soften and bend.', 'Bakelite (thermosetting) does not soften and is a poor conductor of heat.'], 'Bakelite does not soften and does not conduct heat'),
        ex('Sort into biodegradable and non-biodegradable: paper bag, plastic bottle, banana peel, polythene bag.', ['Bacteria can break down paper and peels.', 'Plastic bottle and polythene bag last for hundreds of years.'], 'Biodegradable: paper bag, banana peel. Non-biodegradable: plastic bottle, polythene bag'),
      ],
      practice: [
        tapT('tap-thermoset', 'Tap every THERMOSETTING plastic or its use.', [
          ['Bakelite', true], ['Melamine', true], ['Electric switch', true], ['Frying-pan handle', true],
          ['Polythene', false], ['PVC', false], ['Carry bag', false], ['Plastic toy bucket', false],
        ], ['Thermosetting plastics do not soften on heating.', 'Switches and pan handles must withstand heat.'], 'Bakelite and melamine are thermosetting (switches, handles); polythene and PVC are thermoplastics (bags, buckets).'),
        mcq('plastic', 'Think: what happens to this plastic on heating?', [
          ['A plastic that can be softened and reshaped many times is a…', 'Thermoplastic', ['Thermosetting plastic', 'Natural fibre', 'Metal'], 'Thermo + plastic (mouldable).', 'Thermoplastics soften on heating.'],
          ['Floor tiles and fire-resistant kitchenware are made of…', 'Melamine', ['Polythene', 'PVC', 'Rayon'], 'Resists fire.', 'Melamine is a heat-resistant thermosetting plastic.'],
          ['Why should we not burn plastic waste?', 'It releases poisonous gases', ['It gives too little heat', 'It turns into metal', 'It becomes biodegradable'], 'Smoke from plastic.', 'Burning plastics pollutes air with toxic gases.'],
          ['A material broken down by bacteria in nature is called…', 'Biodegradable', ['Non-biodegradable', 'Thermosetting', 'Synthetic'], 'Bio = living things.', 'Biodegradable materials decompose naturally.'],
          ['Plastic containers are used to store food and chemicals because plastics…', 'Do not react with water or air (do not corrode)', ['Rust quickly', 'Conduct electricity', 'Dissolve in water'], 'Compare with iron tins.', 'Plastics are chemically unreactive with most substances.'],
          ['Which plastic is used for electric switches?', 'Bakelite', ['Polythene', 'PVC sheet', 'Nylon'], 'Must not conduct or soften.', 'Bakelite is an insulator and does not soften on heating.'],
        ]),
        matchT('match', 'R of the 4R principle to an action', [
          ['Reduce', 'Carry a cloth bag instead of taking new polythene'], ['Reuse', 'Use an old jar to store pens'], ['Recycle', 'Send used bottles to be melted into new items'], ['Recover', 'Get energy or useful material from waste that cannot be recycled'],
        ], ['Reduce = use less in the first place.', 'Recycle needs a factory process.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Metals and Non-metals
// =====================================================================================
const ch4: USpec = {
  id: 'ts8.ps.ch4', subject: 'chemistry', title: 'Metals and Non-metals', source: src(4),
  objectives: [
    {
      id: 'ts8.ps.metal.physical', title: 'Physical properties of metals and non-metals', prereqs: [],
      intro: [
        h('Shiny, ringing and bendable'),
        photo('🔔', 'A temple bell rings loudly when struck — metals are sonorous. A wooden block would just thud.'),
        p('Look at iron, copper, aluminium, gold. They shine when freshly cut or polished (lustre). They can be beaten into thin sheets (malleable) — think of aluminium foil or silver varq on sweets. They can be drawn into wires (ductile) — copper wires in your home. They make a ringing sound when struck (sonorous). They conduct heat and electricity well. Most are hard and solid at room temperature.'),
        p('Non-metals such as sulphur, carbon (coal), phosphorus, oxygen and iodine behave differently: they are usually dull, brittle (break into pieces on hammering), not sonorous, and poor conductors. Many are gases (oxygen, nitrogen).'),
        def('Malleability', 'The property of being beaten into thin sheets.'),
        def('Ductility', 'The property of being drawn into thin wires.'),
        h('Exceptions to remember'),
        p('Mercury is a metal but a liquid at room temperature. Sodium and potassium are metals soft enough to cut with a knife. Graphite (a form of carbon) is a non-metal that conducts electricity. Iodine is a non-metal with a shine. Diamond, also carbon, is the hardest natural substance.'),
        keys('Metals: lustrous, malleable, ductile, sonorous, good conductors, mostly hard.', 'Non-metals: dull, brittle, not sonorous, poor conductors.', 'Exceptions: mercury (liquid metal), sodium (soft metal), graphite (conducting non-metal), iodine (shiny non-metal).'),
        remember('Silver and copper are the best conductors of electricity; lead and mercury are comparatively poor conductors of heat among metals.'),
      ],
      examples: [
        ex('Why are cooking vessels made of metals but their handles of plastic or wood?', ['The vessel should pass heat to the food — metals conduct heat well.', 'The handle should not burn our hand — wood and plastic are poor conductors.'], 'Metals conduct heat; handles need a poor conductor'),
        ex('Teja hammers a piece of coal and a piece of copper. What does he see?', ['Coal (carbon, a non-metal) is brittle — it breaks into pieces.', 'Copper (a metal) is malleable — it flattens into a sheet.'], 'Coal shatters; copper flattens'),
      ],
      practice: [
        mcq('property', 'Recall the property names: lustre, malleable, ductile, sonorous, conductor.', [
          ['Aluminium foil for wrapping food shows that aluminium is…', 'Malleable', ['Ductile', 'Brittle', 'Sonorous'], 'Foil is a thin sheet.', 'Beaten into sheets → malleable.'],
          ['Copper is used for electric wires because it is ductile and…', 'A good conductor of electricity', ['Brittle', 'Dull', 'An insulator'], 'Electricity must flow.', 'Copper conducts well and can be drawn into wires.'],
          ['Which metal is a liquid at room temperature?', 'Mercury', ['Iron', 'Sodium', 'Gold'], 'Used in old thermometers.', 'Mercury is the liquid metal.'],
          ['Which non-metal conducts electricity?', 'Graphite', ['Sulphur', 'Iodine', 'Oxygen'], 'Pencil lead.', 'Graphite (carbon) is the conducting exception.'],
          ['Sulphur breaks into powder when hammered. It is…', 'Brittle', ['Malleable', 'Ductile', 'Sonorous'], 'It does not flatten.', 'Non-metals are usually brittle.'],
          ['School bells are made of metal because metals are…', 'Sonorous', ['Brittle', 'Dull', 'Poor conductors'], 'They ring.', 'Metals produce a ringing sound when struck.'],
          ['Which metal is soft enough to be cut with a knife?', 'Sodium', ['Iron', 'Copper', 'Aluminium'], 'It is kept under kerosene.', 'Sodium and potassium are very soft metals.'],
        ]),
        tapT('tap-metal', 'Tap every substance that is a METAL.', [
          ['Iron', true], ['Copper', true], ['Mercury', true], ['Sodium', true], ['Aluminium', true],
          ['Sulphur', false], ['Iodine', false], ['Graphite', false], ['Phosphorus', false],
        ], ['Mercury is liquid but still a metal.', 'Graphite conducts but is a form of carbon, a non-metal.'], 'Iron, copper, mercury, sodium and aluminium are metals; sulphur, iodine, carbon (graphite) and phosphorus are non-metals.'),
        matchT('match', 'property to the everyday example', [
          ['Malleable', 'Silver varq on sweets'], ['Ductile', 'Copper wire'], ['Sonorous', 'Temple bell'], ['Lustrous', 'Shining gold ornament'], ['Good heat conductor', 'Aluminium cooking pot'], ['Brittle', 'Lump of sulphur crumbles'],
        ], ['Sheets → malleable; wires → ductile.', 'Brittle is the only non-metal property here.']),
      ],
    },
    {
      id: 'ts8.ps.metal.chemical', title: 'Chemical properties of metals', prereqs: ['ts8.ps.metal.physical'],
      intro: [
        h('How metals react'),
        photo('🔩', 'An iron bolt left in the rain turns reddish-brown: iron has reacted with oxygen and water to form rust.'),
        h('1. With oxygen → metal oxides (basic)'),
        p('Burn a magnesium ribbon (hold it with tongs; do not stare at the flame) — it burns with a dazzling white light and leaves white magnesium oxide ash. Dissolve the ash in water and test with red litmus: it turns blue. Metal oxides are basic.'),
        p('Iron + oxygen + water → rust (iron oxide). Copper slowly gets a dull green coat in moist air. Non-metals form acidic oxides instead: sulphur burns to sulphur dioxide, whose solution turns blue litmus red.'),
        h('2. With water'),
        p('Sodium and potassium react so vigorously with water that they catch fire, so they are stored under kerosene. Sodium + water → sodium hydroxide + hydrogen. Iron reacts slowly (rusting); copper, silver and gold hardly react.'),
        h('3. With acids → salt + hydrogen'),
        p('Zinc granules in dilute hydrochloric acid give bubbles of hydrogen gas, which burns with a "pop" sound. Zinc + hydrochloric acid → zinc chloride + hydrogen. Non-metals generally do not give hydrogen with acids.'),
        h('4. Displacement'),
        p('Put an iron nail in blue copper sulphate solution. After a while the nail gets a brown coat of copper and the solution turns pale green. Iron is more reactive than copper, so it pushes copper out: iron + copper sulphate → iron sulphate + copper. A less reactive metal cannot displace a more reactive one.'),
        p('A simple reactivity order: potassium > sodium > calcium > magnesium > aluminium > zinc > iron > lead > copper > silver > gold.'),
        keys('Metal + oxygen → basic oxide; non-metal + oxygen → acidic oxide.', 'Very reactive metals (Na, K) react violently with water → stored in kerosene.', 'Metal + dilute acid → salt + hydrogen (pop test).', 'A more reactive metal displaces a less reactive one from its salt solution.'),
        remember('Gold and silver are used for jewellery because they hardly react with air, water or acids.'),
      ],
      examples: [
        ex('A zinc strip is placed in copper sulphate solution. What happens?', ['Zinc is above copper in the reactivity order.', 'Zinc displaces copper.', 'Zinc + copper sulphate → zinc sulphate + copper.'], 'Copper deposits on the zinc; the blue colour fades'),
        ex('A copper strip is placed in zinc sulphate solution. Will a reaction occur?', ['Copper is less reactive than zinc.', 'A less reactive metal cannot displace a more reactive one.'], 'No reaction'),
      ],
      practice: [
        tp('displace', (r) => {
          const ORDER = ['magnesium', 'zinc', 'iron', 'copper', 'silver'];
          const SALT: Record<string, string> = { magnesium: 'magnesium sulphate', zinc: 'zinc sulphate', iron: 'iron sulphate', copper: 'copper sulphate', silver: 'silver nitrate' };
          const i = r.int(0, 4);
          let j = r.int(0, 4);
          if (j === i) j = (i + 2) % 5;
          const metal = ORDER[i], salt = SALT[ORDER[j]];
          const yes = i < j;
          const a = yes ? `Yes — ${metal} displaces ${ORDER[j]}` : `No reaction — ${metal} is less reactive than ${ORDER[j]}`;
          const w = yes ? `No reaction — ${metal} is less reactive than ${ORDER[j]}` : `Yes — ${metal} displaces ${ORDER[j]}`;
          return {
            type: 'mcq', prompt: `Reactivity order: magnesium > zinc > iron > copper > silver. A strip of ${metal} is dipped into ${salt} solution. Will a displacement reaction take place?`,
            ...choose(r, a, [w, 'Yes — both metals dissolve completely', `No — ${metal} turns into a gas`]),
            hints: ['Find both metals in the reactivity order.', 'Only a MORE reactive metal can push out a less reactive one.'],
            mistakes: [{ when: 'wrong', explain: `Compare positions: ${metal} is ${yes ? 'above' : 'below'} ${ORDER[j]}.` }],
            solution: [`${metal} is ${yes ? 'more' : 'less'} reactive than ${ORDER[j]}.`, a + '.'],
          };
        }, 2),
        mcq('react', 'Recall what metals form with oxygen, water and acids.', [
          ['The oxide of a metal, dissolved in water, turns red litmus…', 'Blue (it is basic)', ['Red stays red', 'Colourless', 'Green'], 'Metal oxides are basic.', 'Magnesium oxide solution is basic → red litmus turns blue.'],
          ['Sulphur dioxide dissolved in water turns blue litmus…', 'Red (it is acidic)', ['Blue stays blue', 'Yellow', 'Black'], 'Non-metal oxides.', 'Non-metal oxides are acidic.'],
          ['Sodium is stored in kerosene because…', 'It reacts violently with air and water', ['It is a liquid', 'It is very heavy', 'It dissolves in kerosene'], 'Highly reactive.', 'Kerosene keeps air and moisture away from sodium.'],
          ['Zinc reacts with dilute hydrochloric acid to give…', 'Zinc chloride and hydrogen', ['Zinc oxide and oxygen', 'Copper and chlorine', 'No reaction'], 'Metal + acid → salt + ?', 'Metal + dilute acid → salt + hydrogen.'],
          ['The gas given off when metals react with dilute acids burns with a…', '"Pop" sound — it is hydrogen', ['Green flame — it is chlorine', 'Bright flash — it is oxygen', 'No flame — it is nitrogen'], 'A lighted matchstick test.', 'Hydrogen burns with a pop sound.'],
          ['Rusting of iron needs…', 'Both oxygen (air) and water', ['Only water', 'Only oxygen', 'Only heat'], 'Iron in dry air does not rust.', 'Rust forms when iron meets air and moisture together.'],
          ['When magnesium burns in air it gives…', 'A dazzling white flame and white ash (magnesium oxide)', ['A blue flame and black ash', 'No light at all', 'Brown rust'], 'Bright white light.', 'Mg + O₂ → MgO with a brilliant white flame.'],
        ]),
        orderT('order', 'Arrange these metals from MOST reactive to LEAST reactive.', ['Sodium', 'Magnesium', 'Zinc', 'Iron', 'Copper', 'Gold'], ['Sodium reacts violently even with cold water.', 'Gold hardly reacts at all.'], 'Na > Mg > Zn > Fe > Cu > Au.', 2),
      ],
    },
    {
      id: 'ts8.ps.nonmetal.uses', title: 'Uses of non-metals (and metals)', prereqs: ['ts8.ps.metal.physical'],
      intro: [
        h('Non-metals keep us alive'),
        photo('🧪', 'A small brown bottle of tincture of iodine in a first-aid box: iodine is a non-metal used as an antiseptic.'),
        p('Non-metals may not shine or ring, but life depends on them.'),
        p('Oxygen — essential for breathing and burning; hospitals give it to patients. Nitrogen — used to make fertilisers (urea, ammonium salts) and is filled in chip packets to stop food spoiling. Carbon — in fuels such as coal and charcoal; plants and animals are built of carbon compounds. Hydrogen — used as a fuel (e.g. in rockets) and to make ammonia.'),
        p('Sulphur — used in fungicides, firecrackers and to harden rubber for tyres (vulcanisation). Phosphorus — used on matchbox sides and in fertilisers. Chlorine — used to kill germs in drinking water and swimming pools. Iodine — tincture of iodine is an antiseptic; iodised salt prevents goitre.'),
        h('And a few metal uses'),
        p('Iron for building and machines; copper and aluminium for wires; aluminium for aircraft bodies and foil; gold and silver for jewellery and coins.'),
        keys('Oxygen: breathing, burning.', 'Nitrogen: fertilisers, food packaging.', 'Chlorine: water purification.', 'Iodine: antiseptic, iodised salt.', 'Sulphur: vulcanising rubber, fungicides.', 'Phosphorus: matchsticks, fertilisers.'),
        remember('Chlorine kills germs in water; iodine is the antiseptic in tincture of iodine.'),
      ],
      examples: [
        ex('Why are chip packets filled with nitrogen instead of air?', ['Oxygen in air reacts with oils in the chips and spoils their taste (rancidity).', 'Nitrogen is unreactive.'], 'Nitrogen prevents the chips from spoiling'),
        ex('Which non-metal is added to municipal drinking water, and why?', ['Water may carry disease-causing germs.', 'Chlorine (or bleaching powder) kills them.'], 'Chlorine — to kill germs'),
      ],
      practice: [
        matchT('match', 'non-metal to its use', [
          ['Oxygen', 'Breathing support in hospitals'], ['Nitrogen', 'Making fertilisers like urea'], ['Chlorine', 'Purifying drinking water'], ['Iodine', 'Antiseptic for wounds'],
          ['Sulphur', 'Vulcanising (hardening) rubber'], ['Phosphorus', 'Matchbox striking surface'], ['Hydrogen', 'Rocket fuel'],
        ], ['Think of hospitals, farms, water tanks and first-aid boxes.', 'Matches strike on a phosphorus-coated surface.']),
        mcq('uses', 'Link each non-metal to the job it does best.', [
          ['Iodised salt is used to prevent…', 'Goitre', ['Rickets', 'Scurvy', 'Malaria'], 'A thyroid problem.', 'Iodine deficiency causes goitre.'],
          ['Which non-metal is used in fertilisers?', 'Nitrogen', ['Iodine', 'Chlorine', 'Helium'], 'Urea.', 'Nitrogen compounds help plants grow.'],
          ['Which non-metal is essential for all living things to breathe?', 'Oxygen', ['Nitrogen', 'Sulphur', 'Carbon'], 'We inhale it.', 'Oxygen is needed for respiration.'],
          ['Tyre rubber is hardened using…', 'Sulphur', ['Chlorine', 'Oxygen', 'Iodine'], 'Vulcanisation.', 'Sulphur cross-links rubber, making it tough.'],
          ['Swimming pool water is disinfected with…', 'Chlorine', ['Nitrogen', 'Carbon', 'Phosphorus'], 'It kills germs.', 'Chlorine disinfects water.'],
          ['Which non-metal is used in matchsticks?', 'Phosphorus', ['Iodine', 'Nitrogen', 'Oxygen'], 'Strike surface.', 'Red phosphorus is on the matchbox side.'],
        ]),
        tapT('tap-nonmetal', 'Tap every use that depends on a NON-METAL.', [
          ['Tincture of iodine on a cut', true], ['Chlorine tablets in a water tank', true], ['Urea fertiliser on fields', true], ['Charcoal in a barbecue', true],
          ['Copper electric wires', false], ['Aluminium foil', false], ['Gold earrings', false], ['Iron gate', false],
        ], ['Copper, aluminium, gold and iron are metals.', 'Iodine, chlorine, nitrogen (in urea) and carbon (charcoal) are non-metals.'], 'Iodine, chlorine, nitrogen and carbon are non-metals; the others use metals.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Sound
// =====================================================================================
const VS = 340; // speed of sound in air used in practice, m/s
const ch5: USpec = {
  id: 'ts8.ps.ch5', subject: 'physics', title: 'Sound', source: src(5),
  objectives: [
    {
      id: 'ts8.ps.sound.production', title: 'How sound is produced: vibrations, instruments and the human voice', prereqs: [],
      intro: [
        h('No vibration, no sound'),
        photo('🥁', 'Sprinkle a few grains of rice on a drum and tap it. The grains jump — the drum skin is vibrating.'),
        p('Touch your throat while you hum. Pluck a stretched rubber band. Strike a steel plate with a spoon and touch it gently. In each case you feel a fast to-and-fro movement. Sound is produced by vibrating objects.'),
        def('Vibration', 'A rapid to-and-fro (back-and-forth) motion of an object about its rest position.'),
        h('Musical instruments'),
        p('Instruments are designed to make something vibrate. In string instruments (veena, sitar, guitar, violin) a stretched string vibrates. In wind instruments (flute, shehnai, nadaswaram) an air column inside a tube vibrates. In percussion instruments (tabla, mridangam, drum, dappu) a stretched membrane vibrates. Instruments like the ghatam, jaltarang, bells and cymbals make the body of the instrument itself vibrate.'),
        h('Our voice'),
        p('In the throat is the voice box, or larynx. Two vocal cords are stretched across it with a narrow slit between them. When air from the lungs is forced through the slit, the vocal cords vibrate and produce sound. Muscles change how tight and thick the cords are, changing the voice. Men usually have longer vocal cords (about 20 mm) than women (about 15 mm) and children, so their voices are deeper.'),
        keys('All sound comes from vibrating objects.', 'String: vibrating string. Wind: vibrating air column. Percussion: vibrating membrane.', 'Human voice: vocal cords in the larynx vibrate.'),
        remember('Stop the vibration and the sound stops — that is why you hold a ringing plate to silence it.'),
        tip('Blow across the mouth of an empty bottle: the air column inside vibrates. Add water to shorten it and the note gets higher.'),
      ],
      examples: [
        ex('What vibrates when a flute is played?', ['A flute is a hollow tube.', 'Blowing into it makes the air inside vibrate.'], 'The air column inside the flute'),
        ex('Why does a ringing school bell stop sounding when you hold it firmly?', ['Holding it stops its vibrations.', 'No vibration means no sound.'], 'Its vibration is stopped'),
      ],
      practice: [
        matchT('match', 'instrument to the part that vibrates', [
          ['Veena', 'Stretched string'], ['Flute', 'Air column'], ['Tabla', 'Stretched membrane'], ['Ghatam', 'Body of the clay pot'], ['Human voice', 'Vocal cords'], ['Shehnai', 'Air column (with reed)'],
        ], ['Strings, air, skins or the body itself.', 'Wind instruments have air columns.']),
        mcq('produce', 'Every sound starts with a vibration.', [
          ['Sound is produced by…', 'Vibrating objects', ['Objects at rest', 'Light falling on objects', 'Cold objects only'], 'Touch your throat while humming.', 'A sound source is always vibrating.'],
          ['The voice box is also called the…', 'Larynx', ['Cochlea', 'Eardrum', 'Lung'], 'In the throat.', 'The larynx holds the vocal cords.'],
          ['Men usually have deeper voices than women because their vocal cords are…', 'Longer', ['Shorter', 'Missing', 'Made of bone'], 'About 20 mm vs 15 mm.', 'Longer cords vibrate more slowly, giving a lower pitch.'],
          ['Which is a percussion instrument?', 'Mridangam', ['Flute', 'Violin', 'Sitar'], 'You strike it.', 'Drums like the mridangam have vibrating membranes.'],
          ['In a sitar, sound is produced by a vibrating…', 'String', ['Air column', 'Membrane', 'Reed only'], 'You pluck it.', 'The sitar is a string instrument.'],
          ['Rice grains placed on a drum jump when it is beaten. This shows that…', 'The drum skin vibrates', ['The rice makes the sound', 'Air is absent', 'The drum is hot'], 'What moves the grains?', 'Vibrations of the membrane throw the grains up.'],
        ]),
        tapT('tap-wind', 'Tap every WIND instrument (air column vibrates).', [
          ['Flute', true], ['Shehnai', true], ['Nadaswaram', true], ['Whistle', true],
          ['Tabla', false], ['Veena', false], ['Violin', false], ['Jaltarang', false],
        ], ['Wind instruments are played by blowing.', 'Jaltarang uses bowls struck with sticks.'], 'Flute, shehnai, nadaswaram and whistle are wind instruments.'),
      ],
    },
    {
      id: 'ts8.ps.sound.propagation', title: 'How sound travels, and how we hear it', prereqs: ['ts8.ps.sound.production'],
      intro: [
        h('Sound needs something to travel through'),
        photo('👂', 'Put your ear to one end of a long table while a friend gently scratches the other end. You hear it more clearly through the wood than through the air.'),
        p('A vibrating object pushes and pulls the particles next to it, which pass the vibration to their neighbours, and so on. So sound needs a material medium — solid, liquid or gas. In a vacuum (empty space) there are no particles, so sound cannot travel. Astronauts on the Moon talk by radio.'),
        p('A classic experiment: a ringing electric bell in a glass jar. As the air is pumped out, the sound becomes fainter and fainter, even though the bell is still seen vibrating.'),
        p('Sound travels fastest in solids, slower in liquids and slowest in gases. In air it moves at about 340 m/s, in water about 1500 m/s and in steel about 5000 m/s. Light is much faster — that is why we see lightning before we hear thunder.'),
        h('Echo'),
        p('Sound bounces off a hard surface such as a cliff or a big wall. The reflected sound heard separately is an echo. It travels to the wall and back, so the distance to the wall is half the total distance travelled.'),
        f('distance to the wall d = (speed × time for echo) / 2', 'd equals v times t divided by 2'),
        xp({
          title: 'What if? How far away is the wall?', formula: 'd = v × t / 2',
          res: ['d', 'Distance to the reflecting wall', 'm', 'v * t / 2', 1],
          vars: [['t', 'Time to hear the echo', 's', 0.1, 6, 0.1, 1], ['v', 'Speed of sound', 'm/s', 300, 1600, 10, 340]],
          notes: [['t', 'A longer wait for the echo means the wall is farther.', 'A quicker echo means the wall is nearer.'], ['v', 'In a faster medium (like water) the same time corresponds to a bigger distance.', 'Slower sound covers less distance in the same time.']],
          mistakes: [['Forgetting to divide by 2', 'The sound goes to the wall AND back; the wall is only half that distance away.']],
          real: 'Ships use echoes of sound in water (SONAR) to measure how deep the sea is.',
        }),
        h('How we hear: the ear'),
        p('The outer ear (pinna) collects sound and sends it down the ear canal to the eardrum, a thin stretched membrane, which starts vibrating. In the middle ear three tiny bones — hammer, anvil and stirrup — pass and strengthen the vibrations. In the inner ear the snail-shaped cochlea turns them into signals that travel along the auditory nerve to the brain.'),
        keys('Sound needs a medium; it cannot travel in a vacuum.', 'Speed: solids > liquids > gases (air about 340 m/s).', 'Echo: d = vt/2.', 'Pinna → ear canal → eardrum → hammer, anvil, stirrup → cochlea → auditory nerve → brain.'),
        remember('Never put sharp objects like pins into your ears — the eardrum can tear and cause deafness.'),
      ],
      examples: [
        ex('Imran claps near a cliff and hears the echo after 2 s. Taking the speed of sound as 340 m/s, how far is the cliff?', ['Total distance = v × t = 340 × 2 = 680 m (to the cliff and back)', 'd = 680 ÷ 2 = 340 m'], '340 m'),
        ex('Why can two astronauts on the Moon not hear each other directly even if they shout?', ['The Moon has no air.', 'Sound needs a medium to travel.'], 'There is no medium (air) to carry the sound'),
      ],
      practice: [
        tp('echo', (r) => {
          const t = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
          const d = rd((VS * t) / 2, 2);
          return numQ(`${who(r)} shouts towards a hill and hears the echo after ${t} s. Speed of sound = ${VS} m/s. How far away is the hill?`, d, 'm',
            ['Sound travels to the hill and back.', 'd = v × t ÷ 2'],
            [`Total path = ${VS} × ${t} = ${rd(VS * t, 2)} m`, `Distance to hill = ${rd(VS * t, 2)} ÷ 2 = ${d} m`],
            [{ when: `${rd(VS * t, 2)} m`, explain: 'That is the to-and-fro distance. Divide by 2 to get the distance to the hill.' }]);
        }, 2),
        mcq('medium', 'Sound needs particles to pass on the vibration.', [
          ['Sound cannot travel through…', 'A vacuum', ['Water', 'Steel', 'Air'], 'No particles.', 'With no particles, vibrations cannot be passed on.'],
          ['Sound travels fastest in…', 'Steel (a solid)', ['Air', 'Water', 'A vacuum'], 'Particles are packed closest.', 'Solids carry sound fastest.'],
          ['We see lightning before we hear thunder because…', 'Light travels much faster than sound', ['Sound travels faster than light', 'Thunder happens later', 'Our ears are slow'], 'Compare speeds.', 'Light is almost a million times faster than sound in air.'],
          ['As air is pumped out of a jar with a ringing bell, the sound…', 'Becomes fainter', ['Becomes louder', 'Stays the same', 'Changes to light'], 'Fewer particles.', 'Less air means less sound is carried.'],
          ['The approximate speed of sound in air is…', '340 m/s', ['3 m/s', '3,00,000 km/s', '5000 m/s'], 'A few hundred metres every second.', 'Sound covers about 340 m each second in air.'],
        ]),
        orderT('ear', 'Put the path of sound through the ear in order.', ['Pinna (outer ear)', 'Ear canal', 'Eardrum', 'Hammer, anvil and stirrup', 'Cochlea', 'Auditory nerve to the brain'], ['Sound is collected first, and the brain is last.', 'The three small bones come right after the eardrum.'], 'Outer ear → canal → eardrum → three bones → cochlea → nerve → brain.'),
      ],
    },
    {
      id: 'ts8.ps.sound.characteristics', title: 'Amplitude, time period and frequency; loudness and pitch', prereqs: ['ts8.ps.sound.production'],
      intro: [
        h('Why does a mosquito whine and a lion roar?'),
        photo('🎸', 'Tighten a guitar string and its note goes higher; pluck it harder and the same note gets louder.'),
        p('Two numbers describe a vibration. Amplitude is how far the object moves from its rest position. Frequency is how many complete vibrations (oscillations) it makes in one second.'),
        def('Oscillation', 'One complete to-and-fro movement of a vibrating object.'),
        def('Time period (T)', 'The time taken for one oscillation. Unit: second (s).'),
        def('Frequency (f)', 'The number of oscillations per second. Unit: hertz (Hz). 1 Hz = one oscillation per second.'),
        f('f = number of oscillations / time taken;   T = 1 / f', 'frequency equals oscillations divided by time; time period equals one over frequency'),
        xp({
          title: 'What if? Count the oscillations', formula: 'f = n / t',
          res: ['f', 'Frequency', 'Hz', 'n / t', 1],
          vars: [['n', 'Number of oscillations', '', 1, 2000, 1, 400], ['t', 'Time taken', 's', 0.5, 20, 0.5, 2]],
          notes: [['n', 'More vibrations in the same time means a higher frequency — a higher-pitched note.', 'Fewer vibrations in the same time means a lower frequency — a deeper note.'], ['t', 'Spreading the same vibrations over a longer time lowers the frequency.', 'Squeezing them into less time raises the frequency.']],
          mistakes: [['Dividing time by oscillations', 'That gives the time period T, not frequency. f = n ÷ t.'], ['Writing the unit as seconds', 'Frequency is in hertz (Hz), meaning per second.']],
          real: 'A mosquito\'s wings beat a few hundred times a second, which is why it makes a high-pitched whine.',
        }),
        h('Loudness and pitch'),
        p('Loudness depends on amplitude: hit a drum harder → bigger amplitude → louder sound. Loudness is measured in decibels (dB).'),
        p('Pitch (shrillness) depends on frequency: higher frequency → higher pitch. A whistle, a baby\'s cry and a woman\'s voice usually have higher pitch; a lion\'s roar and a man\'s voice are lower.'),
        p('Quality (timbre) lets you tell a flute from a violin even when both play the same note equally loudly.'),
        keys('Amplitude → loudness (dB).', 'Frequency → pitch (Hz).', 'f = n/t and T = 1/f.', 'Quality tells sources apart.'),
        remember('Loud ≠ high. A lion\'s roar is loud but low-pitched; a mosquito\'s buzz is soft but high-pitched.'),
      ],
      examples: [
        ex('A pendulum makes 40 oscillations in 20 s. Find its frequency and time period.', ['f = n/t = 40/20 = 2 Hz', 'T = 1/f = 1/2 = 0.5 s'], 'f = 2 Hz, T = 0.5 s'),
        ex('A tuning fork has a frequency of 256 Hz. How many vibrations does it make in 5 s?', ['n = f × t', 'n = 256 × 5 = 1280'], '1280 vibrations'),
      ],
      practice: [
        tp('freq', (r) => {
          const t = r.pick([2, 4, 5, 10, 20]);
          const fq = r.pick([2, 5, 10, 25, 50, 100, 200, 256, 512]);
          const n = fq * t;
          return numQ(`An object makes ${n} oscillations in ${t} s. What is its frequency?`, fq, 'Hz',
            ['Frequency = oscillations ÷ time.', `f = ${n} ÷ ${t}`],
            [`f = ${n} ÷ ${t} = ${fq} Hz`],
            [{ when: `${rd(t / n, 4)} Hz`, explain: 'You divided time by oscillations — that is the time period. Frequency is n ÷ t.' }]);
        }),
        tp('period', (r) => {
          const fq = r.pick([2, 4, 5, 8, 10, 20, 25, 50, 100]);
          const T = rd(1 / fq, 4);
          return numQ(`A vibrating string has a frequency of ${fq} Hz. What is its time period?`, T, 's',
            ['Time period and frequency are reciprocals.', 'T = 1 ÷ f'],
            [`T = 1 ÷ ${fq} = ${T} s`],
            [{ when: `${fq} s`, explain: 'Time period is 1 divided by the frequency, not equal to it.' }], 0.02);
        }, 2),
        mcq('pitch', 'Amplitude ↔ loudness; frequency ↔ pitch.', [
          ['Loudness of sound depends on its…', 'Amplitude', ['Frequency', 'Time period only', 'Speed'], 'How far the object swings.', 'Bigger amplitude → louder sound.'],
          ['Pitch of sound depends on its…', 'Frequency', ['Amplitude', 'Loudness', 'Colour'], 'How many vibrations per second.', 'Higher frequency → higher pitch.'],
          ['The unit of frequency is…', 'hertz (Hz)', ['decibel (dB)', 'second (s)', 'metre (m)'], 'Named after Heinrich Hertz.', 'Frequency is measured in hertz.'],
          ['Loudness is measured in…', 'decibels (dB)', ['hertz (Hz)', 'newtons (N)', 'metres per second'], 'Noise level.', 'Sound level uses the decibel scale.'],
          ['Which usually has the highest pitch?', 'A mosquito\'s buzz', ['A lion\'s roar', 'A man\'s voice', 'A big drum'], 'Thin, shrill sound.', 'The mosquito\'s wings vibrate at a high frequency.'],
          ['Striking a drum harder makes the sound…', 'Louder, with the same pitch', ['Higher in pitch', 'Lower in pitch', 'Silent'], 'Bigger amplitude.', 'Force changes amplitude, so loudness changes.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.sound.noise', title: 'Music and noise; audible range; noise pollution', prereqs: ['ts8.ps.sound.characteristics'],
      intro: [
        h('Pleasant or unpleasant?'),
        photo('🔊', 'A loudspeaker blaring late at night disturbs sleep — sound can become pollution.'),
        p('Sounds that are pleasant to hear, like a song or a veena, are music. Unpleasant, unwanted sounds — honking horns, a drilling machine — are noise. Music is usually regular vibrations; noise is irregular.'),
        h('What can we hear?'),
        p('The human ear can hear frequencies from about 20 Hz to 20,000 Hz (20 kHz). This is the audible range. Sounds below 20 Hz are infrasonic (elephants and whales communicate with them; earthquakes produce them). Sounds above 20 kHz are ultrasonic (bats, dogs and dolphins can hear them; doctors use ultrasound scans).'),
        def('Audible range', 'The range of frequencies the human ear can hear: roughly 20 Hz to 20,000 Hz.'),
        h('Noise pollution'),
        p('Unwanted, excessive sound is noise pollution. Sources: vehicle horns, loudspeakers, firecrackers, factories, construction, aircraft. Sounds above about 80 dB become harmful. Effects: sleeplessness, stress, high blood pressure, headaches, and with long exposure, partial or permanent hearing loss.'),
        p('Control: silence zones near hospitals and schools, no-horn rules, silencers on vehicles and machines, keeping TV and music volume low, planting trees along roads (they absorb sound), and soundproofing.'),
        keys('Music: pleasant, regular; noise: unpleasant, irregular.', 'Audible range 20 Hz – 20 kHz.', 'Below 20 Hz: infrasonic; above 20 kHz: ultrasonic.', 'Above about 80 dB is harmful; plant trees and reduce honking.'),
        remember('Dogs can hear the ultrasonic "silent" dog whistle because their range goes above 20 kHz.'),
      ],
      examples: [
        ex('Is a sound of 30,000 Hz audible to us?', ['Our upper limit is about 20,000 Hz.', '30,000 Hz is above it.'], 'No — it is ultrasonic'),
        ex('Suggest two ways a school near a highway can reduce noise.', ['Plant thick rows of trees along the boundary — they absorb sound.', 'Request a "No horn / silence zone" sign near the school.'], 'Tree belts and a no-horn silence zone'),
      ],
      practice: [
        tp('range', (r) => {
          const fq = r.pick([5, 10, 15, 50, 256, 1000, 5000, 15000, 25000, 40000, 60000]);
          const kind = fq < 20 ? 'Infrasonic (below our hearing range)' : fq > 20000 ? 'Ultrasonic (above our hearing range)' : 'Audible to humans';
          return {
            type: 'mcq', prompt: `A source vibrates at ${fq.toLocaleString('en-IN')} Hz. How do we classify this sound?`,
            ...choose(r, kind, ['Infrasonic (below our hearing range)', 'Ultrasonic (above our hearing range)', 'Audible to humans']),
            hints: ['The audible range is about 20 Hz to 20,000 Hz.', 'Below the range is infra-, above it is ultra-.'],
            mistakes: [{ when: 'wrong', explain: `Compare ${fq} Hz with the limits 20 Hz and 20,000 Hz.` }],
            solution: [`${fq} Hz is ${fq < 20 ? 'below 20 Hz' : fq > 20000 ? 'above 20,000 Hz' : 'between 20 Hz and 20,000 Hz'}.`, `So it is: ${kind}.`],
          };
        }),
        mcq('noise', 'Noise is unwanted sound; loud noise harms health.', [
          ['Which is the approximate audible range for humans?', '20 Hz to 20,000 Hz', ['2 Hz to 200 Hz', '200 Hz to 2,00,000 Hz', '0 Hz to 20 Hz'], 'Twenty to twenty thousand.', 'Humans hear roughly 20 Hz to 20 kHz.'],
          ['Sounds above 20,000 Hz are called…', 'Ultrasonic', ['Infrasonic', 'Supersonic', 'Audible'], 'Ultra = beyond.', 'Ultrasound is above the audible range.'],
          ['Which can cause permanent hearing loss?', 'Long exposure to sounds above about 80 dB', ['Soft music', 'Whispering', 'Birdsong'], 'Think of factories and loudspeakers.', 'Very loud sound over time damages the inner ear.'],
          ['Which is a good way to reduce noise pollution near a road?', 'Planting trees along the road', ['Using pressure horns', 'Removing vehicle silencers', 'Playing music loudly'], 'Something that absorbs sound.', 'Trees absorb and block sound.'],
          ['Areas around hospitals are declared…', 'Silence zones', ['Horn zones', 'Industrial zones', 'Music zones'], 'Patients need rest.', 'Honking and loudspeakers are banned there.'],
          ['Which animal uses ultrasonic sound to find its way?', 'Bat', ['Cow', 'Elephant', 'Hen'], 'Flies at night.', 'Bats use ultrasonic echoes to locate objects.'],
        ]),
        tapT('tap-noise', 'Tap every source of NOISE POLLUTION.', [
          ['Pressure horns on buses', true], ['Firecrackers at midnight', true], ['Loudspeakers at full volume', true], ['A construction drill', true], ['A jet aircraft taking off', true],
          ['Soft flute music', false], ['Leaves rustling', false], ['A quiet conversation', false],
        ], ['Noise pollution is loud, unwanted sound.', 'Soft pleasant sounds are not pollution.'], 'Horns, crackers, loudspeakers, drills and aircraft cause noise pollution.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Reflection of Light by Plane Surfaces
// =====================================================================================
const ANGLES = [30, 36, 40, 45, 60, 72, 90, 120, 180];
const ch6: USpec = {
  id: 'ts8.ps.ch6', subject: 'physics', title: 'Reflection of Light by Plane Surfaces', source: src(6),
  objectives: [
    {
      id: 'ts8.ps.plane.laws', title: 'Reflection of light and its laws', prereqs: [],
      activities: ['lab:light'],
      intro: [
        h('Light bounces'),
        photo('🔦', 'Shine a torch on a mirror in a dark room and a bright spot appears on the opposite wall — the light has bounced back.'),
        p('Light travels in straight lines. When it falls on a polished surface such as a mirror, it bounces back. This is reflection. We see most objects because light reflected from them enters our eyes.'),
        def('Incident ray', 'The ray of light that falls on the mirror.'),
        def('Reflected ray', 'The ray that bounces off the mirror.'),
        def('Normal', 'An imaginary line drawn at 90° to the mirror at the point where the ray strikes it.'),
        p('Angles are always measured from the normal, not from the mirror. The angle between the incident ray and the normal is the angle of incidence (i); between the reflected ray and the normal is the angle of reflection (r).'),
        h('Laws of reflection'),
        p('Law 1: The angle of incidence equals the angle of reflection (∠i = ∠r). Law 2: The incident ray, the reflected ray and the normal at the point of incidence all lie in the same plane.'),
        f('∠i = ∠r', 'angle of incidence equals angle of reflection'),
        p('A smooth surface (mirror, still water) reflects parallel rays in one direction — regular reflection, giving clear images. A rough surface (paper, wall) scatters them in many directions — diffuse reflection. The laws still hold at every tiny point.'),
        keys('Reflection: light bouncing off a surface.', 'Angles are measured from the normal.', '∠i = ∠r; incident ray, reflected ray and normal lie in one plane.', 'If the ray makes angle g with the mirror, i = 90° − g.'),
        remember('A ray falling along the normal (i = 0°) reflects straight back along itself.'),
        tip('Exam trap: "the ray makes 30° with the mirror" means i = 60°, not 30°.'),
      ],
      examples: [
        ex('A ray strikes a plane mirror with an angle of incidence of 35°. Find the angle of reflection and the angle between the two rays.', ['∠r = ∠i = 35°', 'Angle between rays = i + r = 70°'], '∠r = 35°; rays are 70° apart'),
        ex('A ray makes an angle of 20° with the mirror surface. Find the angle of reflection.', ['The normal is at 90° to the mirror.', '∠i = 90° − 20° = 70°', '∠r = ∠i = 70°'], '70°'),
      ],
      practice: [
        tp('angle', (r) => {
          const mode = r.int(0, 2);
          const a = r.pick([10, 15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70]);
          if (mode === 0) return numQ(`The angle of incidence on a plane mirror is ${a}°. What is the angle of reflection?`, a, '°', ['First law of reflection.', '∠i = ∠r'], [`∠r = ∠i = ${a}°`], [{ when: `${90 - a}°`, explain: 'Angles are measured from the normal, and ∠r = ∠i directly.' }]);
          if (mode === 1) return numQ(`A ray of light makes an angle of ${a}° with the surface of a plane mirror. What is the angle of reflection?`, 90 - a, '°', ['Angles are measured from the NORMAL.', `∠i = 90° − ${a}°`], [`∠i = 90° − ${a}° = ${90 - a}°`, `∠r = ∠i = ${90 - a}°`], [{ when: `${a}°`, explain: `${a}° is measured from the mirror. Subtract from 90° to get the angle from the normal.` }]);
          return numQ(`The angle of incidence is ${a}°. What is the angle between the incident ray and the reflected ray?`, 2 * a, '°', ['∠r = ∠i.', 'The two rays are on opposite sides of the normal: add them.'], [`∠r = ${a}°`, `Angle between rays = ${a}° + ${a}° = ${2 * a}°`], [{ when: `${a}°`, explain: 'That is only one side. Add ∠i and ∠r.' }]);
        }),
        mcq('laws', 'Angles are measured from the normal.', [
          ['The normal is a line drawn…', 'Perpendicular (at 90°) to the mirror at the point of incidence', ['Along the mirror surface', 'Parallel to the incident ray', 'From the eye to the object'], 'Normal = perpendicular.', 'The normal makes 90° with the reflecting surface.'],
          ['If a ray falls along the normal, the angle of reflection is…', '0°', ['90°', '45°', '180°'], 'Angle of incidence is zero.', '∠i = 0°, so ∠r = 0° and it retraces its path.'],
          ['Reflection from a rough wall is called…', 'Diffuse (irregular) reflection', ['Regular reflection', 'Refraction', 'No reflection'], 'Rays go in many directions.', 'Rough surfaces scatter the reflected rays.'],
          ['Which law says the incident ray, reflected ray and normal lie in one plane?', 'Second law of reflection', ['First law of reflection', 'Law of gravity', 'Law of friction'], 'The first is about angles.', 'The second law is about the common plane.'],
          ['We can see a book in a lit room because…', 'Light reflected from the book enters our eyes', ['The book gives out its own light', 'Our eyes send out light', 'Sound reaches us'], 'Most objects are not luminous.', 'Reflected light carries the image to our eyes.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.plane.image', title: 'Image formed by a plane mirror', prereqs: ['ts8.ps.plane.laws'],
      activities: ['lab:light'],
      intro: [
        h('The person in the mirror'),
        photo('🪟', 'At night a window pane acts like a weak plane mirror: your room appears to continue behind the glass.'),
        p('Rays from a point on an object reflect off the mirror according to the laws of reflection. To our eye they seem to come from a point behind the mirror. That point is the image. Nothing is actually behind the mirror, so the image cannot be caught on a screen: it is virtual.'),
        h('Features of the image in a plane mirror'),
        p('1. Virtual — cannot be taken on a screen. 2. Erect — the right way up. 3. Same size as the object. 4. As far behind the mirror as the object is in front. 5. Laterally inverted — left and right are swapped. Raise your right hand and your image raises its left. That is why AMBULANCE is written in mirror letters on ambulances, so drivers ahead read it correctly in their rear-view mirrors.'),
        def('Lateral inversion', 'The sideways reversal of left and right in an image formed by a plane mirror.'),
        p('Distance from object to image = 2 × distance of object from mirror. If you step 1 m towards a mirror, your image also comes 1 m closer, so the gap between you and your image shrinks by 2 m.'),
        p('To see your full height in a plane mirror, the mirror needs to be only half your height (placed at the right level).'),
        keys('Plane-mirror image: virtual, erect, same size, laterally inverted.', 'Image distance behind = object distance in front.', 'Object-to-image distance = 2 × object distance.', 'A full-length view needs a mirror half your height.'),
        remember('Image distance is measured from the mirror, not from the object — read questions carefully.'),
      ],
      examples: [
        ex('Priya stands 3 m in front of a plane mirror. How far is her image from her?', ['Image is 3 m behind the mirror.', 'Distance from Priya to image = 3 + 3 = 6 m'], '6 m'),
        ex('Ravi stands 5 m from a mirror and walks 2 m towards it. What is the new distance between Ravi and his image?', ['New distance from mirror = 5 − 2 = 3 m', 'Image is 3 m behind the mirror.', 'Gap = 3 + 3 = 6 m'], '6 m'),
      ],
      practice: [
        tp('dist', (r) => {
          const d = r.pick([1, 1.5, 2, 2.5, 3, 4, 5, 6]);
          const step = r.pick([0.5, 1]);
          const mode = r.int(0, 1);
          const n = who(r);
          if (mode === 0) return numQ(`${n} stands ${d} m in front of a plane mirror. What is the distance between ${n} and the image?`, 2 * d, 'm', ['The image is as far behind the mirror as the object is in front.', 'Add both distances.'], [`Image is ${d} m behind the mirror.`, `Distance = ${d} + ${d} = ${2 * d} m`], [{ when: `${d} m`, explain: 'That is the distance from the MIRROR. The question asks for the distance from the person to the image.' }]);
          const nd = d + 1 - step;
          return numQ(`${n} stands ${d + 1} m in front of a plane mirror and walks ${step} m towards it. What is the new distance between ${n} and the image?`, rd(2 * nd, 2), 'm', ['Find the new distance from the mirror first.', 'Then double it.'], [`New distance from mirror = ${d + 1} − ${step} = ${nd} m`, `Distance to image = 2 × ${nd} = ${rd(2 * nd, 2)} m`], [{ when: `${nd} m`, explain: 'Double it — the image is also that far behind the mirror.' }], 0.01);
        }),
        tapT('tap-props', 'Tap every TRUE statement about the image in a plane mirror.', [
          ['It is virtual', true], ['It is erect', true], ['It is the same size as the object', true], ['It is laterally inverted', true], ['It is as far behind the mirror as the object is in front', true],
          ['It can be caught on a screen', false], ['It is upside down', false], ['It is magnified', false],
        ], ['Think of looking at yourself in a dressing mirror.', 'Virtual images cannot be caught on a screen.'], 'The image is virtual, erect, same-sized, laterally inverted and equally far behind the mirror.'),
        mcq('lateral', 'Left and right swap in a plane mirror.', [
          ['Why is "AMBULANCE" written in reverse on the front of ambulances?', 'So drivers see it correctly in their rear-view mirrors', ['To confuse people', 'It is a spelling mistake', 'So it glows at night'], 'Lateral inversion.', 'The mirror reverses it back to normal.'],
          ['You raise your right hand in front of a mirror. Your image raises its…', 'Left hand', ['Right hand', 'Both hands', 'No hand'], 'Left-right swap.', 'Plane mirrors cause lateral inversion.'],
          ['To see your full image, a plane mirror must be at least…', 'Half your height', ['Your full height', 'Twice your height', 'One-quarter your height'], 'Rays from head and feet meet the mirror halfway.', 'A mirror half your height is enough when placed correctly.'],
          ['An image that cannot be obtained on a screen is called…', 'Virtual', ['Real', 'Inverted', 'Magnified'], 'Rays only seem to meet.', 'Virtual images form where rays appear to come from.'],
          ['If you move 2 m closer to a plane mirror, your image moves…', '2 m closer to the mirror', ['1 m closer', '4 m away', 'It does not move'], 'Image distance = object distance.', 'The image keeps the same distance behind the mirror.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.plane.multiple', title: 'Multiple images; periscope and kaleidoscope', prereqs: ['ts8.ps.plane.image'],
      intro: [
        h('Mirrors talking to mirrors'),
        photo('✨', 'In a barber\'s shop, two facing mirrors show a long row of your images, fading into the distance.'),
        p('If two plane mirrors are placed at an angle, light reflects again and again between them, giving many images. The smaller the angle, the more images.'),
        f('Number of images n = (360° / θ) − 1', 'n equals 360 divided by theta, minus 1'),
        p('This works neatly when 360/θ is a whole number (for an object placed symmetrically). Two mirrors at 90° give 360/90 − 1 = 3 images. At 60° you get 5. When the mirrors are parallel (θ = 0°) the number becomes infinite in theory.'),
        xp({
          title: 'What if? Close the angle between two mirrors', formula: 'n = 360/θ − 1',
          res: ['n', 'Number of images', '', '360 / θ - 1', 0],
          vars: [['θ', 'Angle between mirrors', '°', 20, 180, 1, 90]],
          notes: [['θ', 'Opening the mirrors wider gives fewer images.', 'Closing the angle gives more and more images.']],
          mistakes: [['Forgetting to subtract 1', 'At 90° the formula gives 4 sectors, but one of them holds the object itself — so 3 images.'], ['Using 180 instead of 360', 'A full turn around the meeting line is 360°.']],
          real: 'A kaleidoscope uses three mirrors at 60° to make beautiful repeating patterns from a few glass bangle pieces.',
        }),
        h('Using plane mirrors'),
        def('Periscope', 'A tube with two plane mirrors at 45°, facing each other, so you can see over walls or obstacles. Used in submarines and tanks.'),
        def('Kaleidoscope', 'A tube with three plane mirror strips forming a triangular prism. Coloured bits at the end give endless symmetric patterns through multiple reflections.'),
        keys('n = 360/θ − 1.', 'Smaller angle → more images; parallel mirrors → endless images.', 'Periscope: two mirrors at 45°.', 'Kaleidoscope: three mirrors, multiple reflections.'),
        remember('90° → 3 images, 60° → 5 images, 45° → 7 images.'),
      ],
      examples: [
        ex('How many images are formed by two mirrors at 60°?', ['n = 360/60 − 1', 'n = 6 − 1 = 5'], '5 images'),
        ex('Diya wants 11 images of a candle. At what angle should she keep the mirrors?', ['n + 1 = 360/θ', '12 = 360/θ', 'θ = 30°'], '30°'),
      ],
      practice: [
        tp('n', (r) => {
          const t = r.pick(ANGLES);
          const n = 360 / t - 1;
          return numQ(`Two plane mirrors are placed at ${t}° to each other with a coin between them. How many images of the coin are formed?`, n, undefined,
            ['n = 360/θ − 1', `360 ÷ ${t} = ${360 / t}`],
            [`n = 360/${t} − 1 = ${360 / t} − 1 = ${n}`],
            [{ when: String(360 / t), explain: 'Subtract 1 — one of the sectors holds the coin itself.' }]);
        }),
        tp('angle', (r) => {
          const t = r.pick([30, 40, 45, 60, 72, 90, 120]);
          const n = 360 / t - 1;
          return numQ(`At what angle should two plane mirrors be kept to see ${n} images of an object?`, t, '°',
            ['Rearrange: 360/θ = n + 1.', `θ = 360 ÷ (${n} + 1)`],
            [`n + 1 = ${n + 1}`, `θ = 360 ÷ ${n + 1} = ${t}°`],
            [{ when: `${rd(360 / n, 2)}°`, explain: 'Add 1 to the number of images before dividing 360.' }], 0.01);
        }, 2),
        mcq('uses', 'Think about how many mirrors and at what angle.', [
          ['A periscope uses…', 'Two plane mirrors at 45°', ['One concave mirror', 'Three mirrors at 60°', 'A lens only'], 'Light turns twice.', 'Two 45° mirrors turn the light down and then forward.'],
          ['A kaleidoscope makes patterns using…', 'Multiple reflections in three plane mirrors', ['Refraction in water', 'A single convex mirror', 'Coloured lights'], 'Three mirror strips.', 'Repeated reflections create symmetric patterns.'],
          ['Two parallel mirrors facing each other give…', 'A very large (theoretically infinite) number of images', ['No images', 'One image', 'Two images'], 'θ → 0.', '360/θ grows without limit as θ shrinks.'],
          ['Submarine crews look above water using a…', 'Periscope', ['Kaleidoscope', 'Microscope', 'Stethoscope'], 'See over an obstacle.', 'A periscope lets you see from a higher level.'],
          ['As the angle between two mirrors decreases, the number of images…', 'Increases', ['Decreases', 'Stays the same', 'Becomes zero'], 'n = 360/θ − 1.', 'Smaller θ gives a larger 360/θ.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Coal and Petroleum
// =====================================================================================
const ch7: USpec = {
  id: 'ts8.ps.ch7', subject: 'chemistry', title: 'Coal and Petroleum', source: src(7),
  objectives: [
    {
      id: 'ts8.ps.fuel.resources', title: 'Sources of materials; exhaustible and inexhaustible resources', prereqs: [],
      intro: [
        h('Where does everything come from?'),
        photo('🌍', 'Air, water, soil, minerals, forests, coal and oil — every material we use comes from the Earth or the Sun\'s energy.'),
        p('Everything we use — food, clothes, houses, vehicles, fuel — is made from materials taken from nature. Materials obtained from nature are called natural resources.'),
        def('Inexhaustible resources', 'Resources present in unlimited quantity that are not used up by human activity. Examples: sunlight, air, wind.'),
        def('Exhaustible resources', 'Resources present in limited quantity that can be used up. Examples: coal, petroleum, natural gas, minerals, forests and wildlife.'),
        p('Some exhaustible resources can be renewed if we use them wisely — forests can regrow, wildlife can recover. But coal, petroleum and natural gas took millions of years to form; once used, they are gone for our lifetimes. These three are fossil fuels, formed from the dead remains of living things.'),
        keys('Inexhaustible: sunlight, air, wind.', 'Exhaustible: coal, petroleum, natural gas, minerals, forests, wildlife.', 'Fossil fuels: coal, petroleum, natural gas — formed over millions of years from dead organisms.'),
        remember('Water is renewable but not unlimited — clean fresh water can run short through misuse.'),
      ],
      examples: [
        ex('Classify: sunlight, coal, wind, natural gas.', ['Sunlight and wind will not be used up.', 'Coal and natural gas are limited fossil fuels.'], 'Inexhaustible: sunlight, wind. Exhaustible: coal, natural gas'),
        ex('Why is petroleum called a fossil fuel?', ['It was formed from remains of tiny sea organisms buried millions of years ago.', 'Remains of ancient life are fossils.'], 'It formed from the remains of organisms that lived long ago'),
      ],
      practice: [
        tapT('tap-exhaust', 'Tap every EXHAUSTIBLE resource.', [
          ['Coal', true], ['Petroleum', true], ['Natural gas', true], ['Minerals', true], ['Forests', true],
          ['Sunlight', false], ['Air', false], ['Wind', false],
        ], ['Exhaustible means it can run out.', 'Sun, air and wind will not run out.'], 'Coal, petroleum, natural gas, minerals and forests are exhaustible; sunlight, air and wind are not.'),
        mcq('res', 'Ask: can this ever run out?', [
          ['Which is an inexhaustible natural resource?', 'Sunlight', ['Coal', 'Petroleum', 'Natural gas'], 'Available every day.', 'Sunlight is not used up by us.'],
          ['Fossil fuels are formed from…', 'Dead remains of living organisms', ['Rocks melting', 'Sea water', 'Sunlight directly'], 'Fossils.', 'Ancient plants and animals turned into coal, oil and gas.'],
          ['Which is a fossil fuel?', 'Natural gas', ['Wood', 'Biogas', 'Hydrogen'], 'Formed over millions of years.', 'Natural gas is a fossil fuel.'],
          ['Forests are exhaustible because…', 'They can be destroyed faster than they regrow', ['They never regrow', 'They are made of coal', 'They are unlimited'], 'Cutting vs growing.', 'Over-cutting uses forests up faster than nature replaces them.'],
          ['Materials obtained from nature are called…', 'Natural resources', ['Synthetic materials', 'Plastics', 'Pollutants'], 'From nature.', 'Natural resources come directly from nature.'],
        ]),
        matchT('match', 'resource to its type', [
          ['Wind', 'Inexhaustible'], ['Coal', 'Exhaustible fossil fuel'], ['Forest', 'Exhaustible but renewable with care'], ['Iron ore', 'Exhaustible mineral'],
        ], ['Only one is unlimited.', 'Forests can regrow if protected.']),
      ],
    },
    {
      id: 'ts8.ps.fuel.coal', title: 'How coal and petroleum formed, and their products', prereqs: ['ts8.ps.fuel.resources'],
      intro: [
        h('Sunlight from millions of years ago'),
        photo('🪨', 'A lump of coal is the squashed, baked remains of ancient forests.'),
        p('About 300 million years ago, the Earth had dense forests in low-lying wet areas. Floods buried these forests under soil. More layers piled up on top. Deep underground, high pressure and high temperature with little air slowly changed the dead plants into coal. This slow change of plant matter into coal is called carbonisation. Since coal formed from plant remains, it is a fossil fuel.'),
        h('Products from coal'),
        p('Heating coal strongly in the absence of air (in industry) gives: coke — tough, porous, almost pure carbon, used to make steel; coal tar — a black thick liquid used to make dyes, drugs, explosives, perfumes, paints and naphthalene balls (and once for roads); coal gas — once used for lighting and as a fuel in industry.'),
        h('Petroleum'),
        p('Petroleum formed from tiny plants and animals living in the sea. When they died, they settled on the seabed and were covered with sand and clay. Over millions of years, heat and pressure without air turned them into petroleum and natural gas, which are trapped between rock layers. In India, oil is found in Assam, Gujarat, Mumbai High and the Krishna–Godavari basin.'),
        p('Crude petroleum is a dark oily mixture. In a refinery it is separated into useful parts (fractions): LPG, petrol, kerosene, diesel, lubricating oil, paraffin wax and bitumen. Because it is so valuable it is called "black gold". Natural gas, compressed as CNG, is a cleaner fuel for vehicles.'),
        keys('Coal: buried forests → heat + pressure, no air → carbonisation.', 'Coal products: coke (steel), coal tar (dyes, drugs, naphthalene), coal gas.', 'Petroleum: remains of sea organisms under rock layers.', 'Refining gives LPG, petrol, kerosene, diesel, lubricating oil, wax, bitumen.'),
        remember('Petroleum = "black gold"; coke is almost pure carbon.'),
      ],
      examples: [
        ex('Which coal product is used to make steel, and why?', ['Steel making needs a strong carbon source and a hot fuel.', 'Coke is almost pure carbon.'], 'Coke'),
        ex('Which petroleum product is used to surface roads?', ['Roads need a sticky black material that binds gravel.', 'This is the heaviest fraction from refining.'], 'Bitumen'),
      ],
      practice: [
        orderT('order', 'Put the steps of coal formation in order.', ['Dense forests grow in low wet areas', 'Floods bury the forests under soil', 'More layers pile up and press down', 'High heat and pressure without air act for millions of years', 'Plant remains turn into coal'], ['Living forests come first.', 'Coal is the last step.'], 'Forests → buried → pressed by layers → heat and pressure → coal.'),
        matchT('match', 'product to its use', [
          ['Coke', 'Making steel'], ['Coal tar', 'Dyes, drugs and naphthalene balls'], ['LPG', 'Cooking gas in homes'], ['Diesel', 'Fuel for trucks and generators'],
          ['Bitumen', 'Surfacing roads'], ['Paraffin wax', 'Candles and ointments'], ['Lubricating oil', 'Reducing friction in engines'],
        ], ['Coal products: coke, coal tar.', 'Petroleum products: the rest.'], 5),
        mcq('form', 'Fossil fuels need heat, pressure and no air over millions of years.', [
          ['The slow process by which dead plants change into coal is called…', 'Carbonisation', ['Refining', 'Combustion', 'Evaporation'], 'Turning into carbon.', 'Carbonisation converts plant matter into coal.'],
          ['Petroleum was formed from…', 'Tiny organisms that lived in the sea', ['Forests on mountains', 'Volcanic rocks', 'Rainwater'], 'Seabed.', 'Marine organisms buried under sediment became petroleum.'],
          ['Separating crude oil into its parts is done in a…', 'Refinery', ['Mine', 'Power plant', 'Coal field'], 'Refining.', 'A petroleum refinery separates the fractions.'],
          ['Petroleum is called "black gold" because…', 'It is very valuable and gives many useful products', ['It contains gold', 'It shines like gold', 'It is mined with gold'], 'Value.', 'Its many products make it commercially precious.'],
          ['Naphthalene balls are obtained from…', 'Coal tar', ['Coke', 'LPG', 'Bitumen'], 'A thick black liquid from coal.', 'Naphthalene is made from coal tar.'],
          ['Which is almost pure carbon?', 'Coke', ['Coal gas', 'Kerosene', 'Coal tar'], 'Used in steel plants.', 'Coke is a tough, porous form of nearly pure carbon.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.fuel.conserve', title: 'Misuse and conservation of energy resources', prereqs: ['ts8.ps.fuel.coal'],
      intro: [
        h('Save fuel, save the future'),
        photo('🚌', 'One bus carrying 50 people uses far less fuel per person than 50 cars.'),
        p('Coal and petroleum are being used much faster than nature can make them. Known reserves may last only a few more generations. Burning them also releases carbon dioxide (which warms the Earth) and smoke and gases that pollute the air.'),
        p('The Petroleum Conservation Research Association (PCRA) in India gives simple tips to save fuel while driving: drive at a steady, moderate speed; switch off the engine at red lights and while waiting; keep tyre pressure correct; service the vehicle regularly.'),
        h('What each of us can do'),
        p('Walk or cycle short distances. Use public transport or share rides. Switch off lights and fans when not needed. Use the pressure cooker and cover pans while cooking. Prefer solar water heaters and solar lamps. Use CNG, which burns more cleanly than petrol or diesel.'),
        keys('Fossil fuels are limited and polluting.', 'PCRA tips: steady speed, engine off when waiting, correct tyre pressure, regular servicing.', 'Use public transport, cycles, solar energy; switch off unused appliances.', 'CNG is a cleaner fuel.'),
        remember('Conserving energy saves money, saves fuel for the future and reduces pollution — all at once.'),
      ],
      examples: [
        ex('Give two PCRA tips to save petrol while driving.', ['Drive at a constant, moderate speed.', 'Switch off the engine at traffic lights.'], 'Steady moderate speed; engine off when waiting'),
        ex('Anil\'s school is 1 km away. Suggest an energy-saving way to get there.', ['Short distance — no fuel needed.', 'Walking or cycling uses no fossil fuel and is healthy.'], 'Walk or cycle'),
      ],
      practice: [
        tapT('tap-save', 'Tap every action that SAVES fuel or energy.', [
          ['Switching off the engine at a red light', true], ['Keeping tyres at correct pressure', true], ['Cycling to a nearby shop', true], ['Using a solar water heater', true], ['Cooking with a lid on the pan', true],
          ['Leaving fans on in an empty room', false], ['Driving very fast with sudden braking', false], ['Idling a car engine for 20 minutes', false],
        ], ['Saving means using less fuel or electricity for the same job.', 'Idling and fast driving waste fuel.'], 'Engine off, tyre pressure, cycling, solar heating and covered cooking all save energy.'),
        mcq('why', 'Fossil fuels are limited and polluting.', [
          ['We must conserve coal and petroleum mainly because…', 'They are limited and take millions of years to form', ['They are unlimited', 'They are very cheap', 'They are renewable in a year'], 'Exhaustible.', 'Once used, they cannot be replaced in our lifetime.'],
          ['PCRA stands for…', 'Petroleum Conservation Research Association', ['Public Coal Research Agency', 'Petrol Cars Regulation Act', 'Power Conservation Rules Authority'], 'It advises on saving petroleum.', 'PCRA promotes saving petroleum products.'],
          ['Which fuel is cleaner for city buses and autos?', 'CNG', ['Coal', 'Diesel', 'Kerosene'], 'Compressed natural gas.', 'CNG produces fewer harmful emissions.'],
          ['Burning fossil fuels adds which gas that causes global warming?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Helium'], 'From burning carbon.', 'CO₂ traps heat in the atmosphere.'],
          ['Which is the best way to save fuel for a 20 km daily trip to work?', 'Use public transport or share a ride', ['Drive alone at high speed', 'Keep the engine running at signals', 'Use an old badly serviced car'], 'Fuel per person.', 'Sharing a vehicle cuts fuel used per person.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Combustion, Fuels and Flame
// =====================================================================================
/** [fuel, calorific value in kJ/kg] — typical values */
const CV: [string, number][] = [['LPG', 55000], ['CNG', 50000], ['petrol', 45000], ['kerosene', 45000], ['diesel', 45000], ['coal', 25000], ['wood', 17000], ['cow-dung cake', 6000], ['hydrogen', 150000], ['biogas', 35000]];
const ch8: USpec = {
  id: 'ts8.ps.ch8', subject: 'chemistry', title: 'Combustion, Fuels and Flame', source: src(8),
  objectives: [
    {
      id: 'ts8.ps.burn.conditions', title: 'Conditions for combustion and ignition temperature', prereqs: [],
      intro: [
        h('What does a fire need?'),
        photo('🔥', 'A campfire needs wood (fuel), air and a first spark of heat. Remove any one and it dies.'),
        p('Combustion is a chemical process in which a substance reacts with oxygen to give off heat (and often light). The substance that burns is a combustible substance, or fuel. Wood, paper, kerosene, LPG and charcoal are combustible; stone, glass and iron nails are not.'),
        def('Combustion', 'A chemical reaction in which a substance combines with oxygen and releases heat and light.'),
        p('Three things are needed together — the fire triangle: 1. a fuel, 2. air (oxygen), 3. enough heat to reach the ignition temperature. Cover a burning candle with a glass and it goes out when the oxygen is used up.'),
        def('Ignition temperature', 'The lowest temperature at which a substance catches fire.'),
        p('A matchstick does not catch fire on its own at room temperature; rubbing it on the box raises the head\'s temperature to its ignition point. Substances with very low ignition temperatures (petrol, kerosene, LPG) are inflammable and catch fire easily — keep them away from flames.'),
        p('Try this (with a teacher): heat water in a paper cup over a candle. The cup does not burn! The water takes away the heat, so the paper never reaches its ignition temperature.'),
        keys('Combustion: fuel + oxygen → heat + light.', 'Fire needs fuel, oxygen and heat (ignition temperature).', 'Inflammable substances have low ignition temperatures.', 'Remove any one side of the fire triangle to stop a fire.'),
        remember('Oxygen supports burning but does not itself burn.'),
      ],
      examples: [
        ex('Why does a paper cup with water not burn when heated over a candle?', ['Heat given to the paper passes to the water.', 'The paper\'s temperature stays below its ignition temperature.'], 'The water keeps the paper below its ignition temperature'),
        ex('Why does a burning candle go out when covered with a glass tumbler?', ['Combustion needs oxygen.', 'The candle uses up the oxygen inside the glass.', 'No fresh air can enter.'], 'It runs out of oxygen'),
      ],
      practice: [
        tapT('tap-comb', 'Tap every COMBUSTIBLE substance.', [
          ['Paper', true], ['Kerosene', true], ['Charcoal', true], ['Wood', true], ['LPG', true],
          ['Glass', false], ['Stone', false], ['Iron nail', false], ['Water', false],
        ], ['Combustible substances burn in air.', 'Glass, stone, iron nails and water do not burn.'], 'Paper, kerosene, charcoal, wood and LPG burn; glass, stone, iron and water do not.'),
        mcq('triangle', 'Fire needs fuel, oxygen and heat.', [
          ['Which three things are needed for combustion?', 'Fuel, oxygen and heat (ignition temperature)', ['Fuel, water and carbon dioxide', 'Oxygen, nitrogen and water', 'Heat, light and sound'], 'The fire triangle.', 'All three must be present together.'],
          ['The lowest temperature at which a substance catches fire is its…', 'Ignition temperature', ['Boiling point', 'Melting point', 'Calorific value'], 'The igniting point.', 'Below it, the substance will not burn.'],
          ['Petrol is called inflammable because…', 'Its ignition temperature is very low', ['It does not burn', 'It is a solid', 'Its ignition temperature is very high'], 'It catches fire easily.', 'Low ignition temperature → easily ignited.'],
          ['A matchstick catches fire when struck because…', 'Friction raises the head to its ignition temperature', ['The box contains oxygen gas', 'The matchstick is wet', 'Light falls on it'], 'Rubbing produces heat.', 'Rubbing heats the match head enough to ignite it.'],
          ['Which gas supports combustion?', 'Oxygen', ['Carbon dioxide', 'Nitrogen', 'Water vapour'], 'We breathe it.', 'Oxygen is needed for things to burn.'],
          ['Wet wood is hard to light because…', 'Water keeps the wood below its ignition temperature', ['Wet wood has no carbon', 'Water adds oxygen', 'It is too light'], 'Heat goes into evaporating water.', 'The heat is used up drying the wood first.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.burn.types', title: 'Types of combustion', prereqs: ['ts8.ps.burn.conditions'],
      intro: [
        h('Fast, sudden or by itself'),
        photo('🎉', 'Crackers burst with a bang — a very fast reaction that releases heat, light, sound and gas all at once.'),
        def('Rapid combustion', 'The substance burns quickly with heat and light once a flame is brought near. Example: LPG on a gas stove, camphor, a lighted matchstick.'),
        def('Spontaneous combustion', 'The substance bursts into flame by itself without any apparent cause. Example: white phosphorus catches fire in air at about room temperature (so it is stored under water); large heaps of coal dust or hay can heat up and catch fire on their own.'),
        def('Explosion', 'A very fast combustion that releases a lot of heat, light, sound and gas suddenly. Example: firecrackers on ignition or pressure.'),
        h('Complete and incomplete combustion'),
        p('With plenty of air, a fuel burns completely, giving carbon dioxide and water with a clean blue flame. With too little air it burns incompletely, giving soot (unburnt carbon) and carbon monoxide — a poisonous gas. Never sleep in a closed room with a burning coal stove (angithi).'),
        keys('Rapid: LPG, camphor. Spontaneous: white phosphorus, coal dust. Explosion: crackers.', 'Complete combustion → CO₂ + water.', 'Incomplete combustion → soot + carbon monoxide (poisonous).'),
        remember('Carbon monoxide has no colour or smell — that is what makes it dangerous.'),
      ],
      examples: [
        ex('White phosphorus is stored under water. Why?', ['It has a very low ignition temperature.', 'It catches fire by itself in air (spontaneous combustion).', 'Water keeps air away.'], 'To prevent spontaneous combustion'),
        ex('Why is it dangerous to burn coal in a closed room?', ['Little air → incomplete combustion.', 'Carbon monoxide forms.', 'It is poisonous and can kill sleeping people.'], 'Poisonous carbon monoxide forms'),
      ],
      practice: [
        matchT('match', 'example to the type of combustion', [
          ['LPG on a gas stove', 'Rapid combustion'], ['White phosphorus in air', 'Spontaneous combustion'], ['Firecracker bursting', 'Explosion'], ['Camphor lit with a match', 'Rapid combustion'], ['Coal dust heap catching fire on its own', 'Spontaneous combustion'],
        ], ['Did it need a flame nearby? Did it go bang?', 'Spontaneous = by itself.']),
        mcq('types', 'Rapid, spontaneous or explosion? Complete or incomplete?', [
          ['Which substance shows spontaneous combustion?', 'White phosphorus', ['LPG', 'Candle wax', 'Kerosene'], 'Stored under water.', 'White phosphorus catches fire in air by itself.'],
          ['Incomplete combustion of fuels produces the poisonous gas…', 'Carbon monoxide', ['Oxygen', 'Nitrogen', 'Water vapour'], 'Not enough oxygen.', 'Too little air gives CO.'],
          ['Complete combustion of a fuel gives…', 'Carbon dioxide and water', ['Carbon monoxide and soot', 'Oxygen and hydrogen', 'Only smoke'], 'Plenty of air.', 'Full oxidation gives CO₂ and H₂O.'],
          ['A sudden reaction producing heat, light, sound and lots of gas is called…', 'Explosion', ['Spontaneous combustion', 'Slow combustion', 'Rusting'], 'Crackers.', 'Explosions are extremely fast combustion.'],
          ['The black soot on a vessel over a kerosene stove shows…', 'Incomplete combustion', ['Complete combustion', 'Explosion', 'No combustion'], 'Unburnt carbon.', 'Soot is unburnt carbon from too little air.'],
          ['LPG burning on a stove is an example of…', 'Rapid combustion', ['Spontaneous combustion', 'Explosion', 'Incomplete combustion only'], 'Burns quickly when lit.', 'It burns fast with heat and light once ignited.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.burn.fuels', title: 'Fuels, calorific value and controlling fire', prereqs: ['ts8.ps.burn.conditions'],
      intro: [
        h('Which fuel gives the most heat?'),
        photo('🪵', 'Firewood, cow-dung cakes, coal, kerosene and LPG are all fuels, but they give very different amounts of heat.'),
        p('Fuels can be solid (wood, coal), liquid (kerosene, petrol, diesel) or gas (LPG, CNG, biogas). We compare them by their calorific value.'),
        def('Calorific value', 'The amount of heat energy produced by completely burning 1 kg of a fuel. Unit: kilojoule per kilogram (kJ/kg).'),
        f('Heat produced = mass of fuel × calorific value', 'heat equals mass times calorific value'),
        p('Typical values: cow-dung cake about 6,000 kJ/kg; wood about 17,000; coal about 25,000–33,000; biogas about 35,000; petrol, kerosene and diesel about 45,000; CNG about 50,000; LPG about 55,000; hydrogen about 150,000 kJ/kg.'),
        xp({
          title: 'What if? Burn more fuel, or a better fuel', formula: 'Q = m × C',
          res: ['Q', 'Heat produced', 'kJ', 'm * C', 0],
          vars: [['m', 'Mass of fuel burnt', 'kg', 0.5, 20, 0.5, 2], ['C', 'Calorific value', 'kJ/kg', 6000, 150000, 1000, 55000]],
          notes: [['m', 'Burning more of the same fuel gives proportionally more heat.', 'Less fuel, less heat.'], ['C', 'A fuel with a higher calorific value gives more heat from the same mass.', 'A low-calorific fuel like dung cake gives much less heat per kilogram.']],
          mistakes: [['Dividing instead of multiplying', 'Calorific value is heat per kg; total heat is that times the number of kg.'], ['Forgetting the kilo in kJ', 'Calorific values are in kilojoules per kilogram.']],
          real: 'That is why an LPG cylinder cooks many more meals than the same mass of firewood — and without smoke.',
        }),
        h('A good fuel'),
        p('An ideal fuel is cheap, easily available, burns easily at a moderate rate, has a high calorific value, and leaves no harmful residue or smoke.'),
        h('Controlling fire'),
        p('To put out a fire remove one side of the fire triangle: cool it below the ignition temperature, cut off the air, or remove the fuel. Water cools and is fine for wood and paper fires. But water must NOT be used on electrical fires (it conducts electricity) or oil and petrol fires (oil floats on water and keeps burning). For these, carbon dioxide extinguishers are best: CO₂ is heavier than air, blankets the fire and cuts off oxygen. Sand or a thick blanket also smothers small fires.'),
        keys('Calorific value in kJ/kg; Heat = mass × CV.', 'Ideal fuel: cheap, available, high CV, no pollution.', 'Water: cools — not for electric or oil fires.', 'CO₂: heavier than air, cuts off oxygen — best for electric and oil fires.'),
        remember('In an electrical fire, switch off the main supply first.'),
      ],
      examples: [
        ex('How much heat is produced when 3 kg of kerosene (CV = 45,000 kJ/kg) burns completely?', ['Heat = m × CV', '= 3 × 45,000', '= 1,35,000 kJ'], '1,35,000 kJ'),
        ex('Burning 4 kg of a fuel produces 2,00,000 kJ. Find its calorific value.', ['CV = heat ÷ mass', '= 2,00,000 ÷ 4 = 50,000 kJ/kg'], '50,000 kJ/kg (like CNG)'),
      ],
      practice: [
        tp('heat', (r) => {
          const [fuel, c] = r.pick(CV);
          const m = r.pick([0.5, 1, 2, 3, 4, 5, 10]);
          const Q = rd(m * c, 2);
          return numQ(`The calorific value of ${fuel} is ${c.toLocaleString('en-IN')} kJ/kg. How much heat is produced when ${m} kg of it burns completely?`, Q, 'kJ',
            ['Heat = mass × calorific value.', `Heat = ${m} × ${c}`],
            [`Heat = ${m} kg × ${c} kJ/kg`, `= ${Q.toLocaleString('en-IN')} kJ`],
            [{ when: `${rd(c / m, 2)} kJ`, explain: 'You divided. Total heat = mass × calorific value.' }]);
        }),
        tp('cv', (r) => {
          const [fuel, c] = r.pick(CV);
          const m = r.pick([2, 4, 5, 8, 10]);
          const Q = m * c;
          return numQ(`When ${m} kg of ${fuel} burns completely, ${Q.toLocaleString('en-IN')} kJ of heat is produced. What is its calorific value in kJ per kg? (Type the number only.)`, c, undefined,
            ['Calorific value = heat ÷ mass.', `CV = ${Q} ÷ ${m}`],
            [`CV = ${Q} ÷ ${m} = ${c.toLocaleString('en-IN')} kJ/kg`],
            [{ when: String(Q * m), explain: 'You multiplied. Calorific value is heat PER kilogram, so divide by the mass.' }]);
        }, 2),
        mcq('fire', 'Remove fuel, oxygen or heat to stop a fire.', [
          ['Why should water not be used on an electrical fire?', 'Water conducts electricity and can cause a shock', ['Water makes the fire hotter', 'Water is too heavy', 'Water contains oxygen gas'], 'Water and wires.', 'Water can carry current to the person.'],
          ['Why is water not used to put out a petrol fire?', 'Petrol floats on water and keeps burning', ['Water explodes', 'Water is a fuel', 'Petrol dissolves water'], 'Oil and water do not mix.', 'The burning oil spreads on top of the water.'],
          ['CO₂ extinguishes fire because it…', 'Is heavier than air and cuts off the oxygen supply', ['Is a fuel', 'Is lighter than air', 'Raises the temperature'], 'Blanket of gas.', 'CO₂ covers the fire and keeps oxygen out.'],
          ['Which fuel has the highest calorific value?', 'Hydrogen', ['Wood', 'Coal', 'Cow-dung cake'], 'Used in rockets.', 'Hydrogen gives about 150,000 kJ/kg.'],
          ['The unit of calorific value is…', 'kJ/kg', ['kg', 'N', '°C'], 'Heat per mass.', 'Calorific value is energy per unit mass.'],
          ['Which is NOT a property of an ideal fuel?', 'Leaves a lot of smoke and ash', ['Cheap and easily available', 'High calorific value', 'Burns at a moderate rate'], 'An ideal fuel is clean.', 'An ideal fuel leaves no harmful residue.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.burn.flame', title: 'Structure of a flame', prereqs: ['ts8.ps.burn.types'],
      intro: [
        h('Three zones in one flame'),
        photo('🕯️', 'Look closely at a still candle flame: dark near the wick, bright yellow in the middle, faint blue at the edges.'),
        p('Substances that turn into vapour while burning (wax, kerosene, LPG) give flames. Charcoal and coal just glow. A candle flame has three zones:'),
        def('Innermost zone (dark)', 'Around the wick; contains hot, unburnt wax vapour. It is the least hot zone.'),
        def('Middle zone (luminous, yellow)', 'Partial (incomplete) combustion happens here because there is not enough air. Glowing carbon particles make it bright yellow. Moderately hot.'),
        def('Outermost zone (non-luminous, blue)', 'Complete combustion happens here because plenty of air is available. It is the hottest part of the flame.'),
        p('Hold a clean glass plate in the luminous zone for a few seconds: a black ring of soot forms — proof of unburnt carbon. Goldsmiths blow air through a metal pipe onto the outermost part of a flame to melt gold and silver, because it is the hottest.'),
        keys('Inner zone: dark, unburnt vapour, least hot.', 'Middle zone: yellow, luminous, partial combustion.', 'Outer zone: blue, non-luminous, complete combustion, hottest.'),
        remember('Yellow flame = not enough air (soot). Blue flame = complete combustion — the gas stove should burn blue.'),
      ],
      examples: [
        ex('Which part of the flame does a goldsmith use to melt gold, and why?', ['The outermost zone has complete combustion.', 'It is the hottest zone.'], 'The outermost (blue, non-luminous) zone'),
        ex('Lakshmi\'s gas stove burns with a yellow flame and blackens the vessels. What is wrong?', ['Yellow flame and soot mean incomplete combustion.', 'Not enough air is mixing with the gas.', 'The air holes may be blocked — clean the burner.'], 'Too little air: incomplete combustion'),
      ],
      practice: [
        matchT('match', 'flame zone to its description', [
          ['Innermost zone', 'Dark, unburnt wax vapour, least hot'], ['Middle zone', 'Yellow, partial combustion'], ['Outermost zone', 'Blue, complete combustion, hottest'],
        ], ['Air is plentiful only on the outside.', 'More air → more complete burning → hotter.'], 3),
        mcq('zones', 'The more air reaches a zone, the more completely it burns.', [
          ['The hottest part of a candle flame is the…', 'Outermost zone', ['Innermost zone', 'Middle zone', 'Wick'], 'Most air.', 'Complete combustion makes the outer zone hottest.'],
          ['The luminous (yellow) zone shows…', 'Partial combustion', ['Complete combustion', 'No combustion at all', 'An explosion'], 'Glowing carbon.', 'Unburnt carbon particles glow yellow.'],
          ['A glass plate held in the middle zone gets a black ring because of…', 'Unburnt carbon (soot)', ['Water vapour', 'Melted wax', 'Ash from the wick'], 'Partial burning.', 'Soot is carbon left unburnt.'],
          ['The innermost zone of a flame contains…', 'Unburnt wax vapour', ['Pure oxygen', 'Soot only', 'Carbon dioxide only'], 'Near the wick.', 'Wax vapour has not yet met enough air.'],
          ['Which of these burns WITHOUT a flame?', 'Charcoal', ['Candle wax', 'Kerosene', 'LPG'], 'Does it vaporise?', 'Charcoal glows; it does not form vapours.'],
          ['A blue flame on a gas stove indicates…', 'Complete combustion', ['Incomplete combustion', 'A gas leak', 'Low temperature'], 'Plenty of air.', 'Blue = complete combustion.'],
        ]),
        orderT('hot', 'Arrange the zones of a candle flame from LEAST hot to HOTTEST.', ['Innermost dark zone', 'Middle luminous zone', 'Outermost non-luminous zone'], ['The vapour near the wick has not burnt yet.', 'Complete combustion is hottest.'], 'Inner (unburnt) < middle (partial) < outer (complete).'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Electrical Conductivity of Liquids
// =====================================================================================
const ch9: USpec = {
  id: 'ts8.ps.ch9', subject: 'chemistry', title: 'Electrical Conductivity of Liquids', source: src(9),
  objectives: [
    {
      id: 'ts8.ps.conduct.liquids', title: 'Which liquids conduct electricity?', prereqs: [],
      activities: ['lab:circuit'],
      intro: [
        h('Testing liquids with a bulb'),
        photo('💡', 'A simple tester: a cell, a bulb (or LED) and two wire ends dipped into the liquid. If the bulb glows, the liquid conducts.'),
        p('We know metals conduct electricity and plastic, rubber and wood do not. What about liquids? Make a tester with a battery, a small bulb and wires. Dip the two free ends into a liquid, keeping them close but not touching. If the circuit is completed through the liquid, the bulb glows.'),
        p('If the current is weak, an ordinary bulb may not glow even though a little current flows. An LED glows with a much smaller current, so it is a better indicator. A magnetic compass placed near the wire also deflects when current flows.'),
        p('Results: lemon juice, vinegar, salt water, tap water and solutions of acids, bases and salts conduct. Distilled water, pure vegetable oil, kerosene, honey and sugar solution are poor conductors.'),
        p('Why does tap water conduct but distilled water does not? Tap water has small amounts of dissolved salts. Pure (distilled) water has almost none. So water is a poor conductor; the salts dissolved in it make it conduct. That is why touching electrical switches with wet hands is dangerous.'),
        def('Good conductor (liquid)', 'A liquid that allows electric current to pass through it, usually because it contains dissolved acids, bases or salts.'),
        keys('Tester: cell + bulb/LED + two probes.', 'LED or compass detects weak currents.', 'Conduct: lemon juice, vinegar, salt water, tap water.', 'Poor: distilled water, oil, sugar solution, kerosene.'),
        remember('Never test mains electricity or electrical appliances with liquids — use only a small cell for experiments.'),
      ],
      examples: [
        ex('Kiran dips the tester in sugar solution and in salt solution. In which does the LED glow?', ['Salt dissolves to give charged particles that carry current.', 'Sugar solution has almost none.'], 'Salt solution — the LED glows; sugar solution — it does not'),
        ex('Why should we not handle electrical appliances with wet hands?', ['Water on our skin has dissolved salts (sweat, impurities).', 'It conducts electricity.', 'Current could pass through our body.'], 'Impure water conducts and can give a shock'),
      ],
      practice: [
        tapT('tap-cond', 'Tap every liquid that CONDUCTS electricity well.', [
          ['Lemon juice', true], ['Vinegar', true], ['Salt water', true], ['Tap water', true], ['Copper sulphate solution', true],
          ['Distilled water', false], ['Vegetable oil', false], ['Sugar solution', false], ['Kerosene', false], ['Honey', false],
        ], ['Acids, bases and salt solutions conduct.', 'Pure water, oils and sugar solution do not.'], 'Lemon juice, vinegar, salt water, tap water and copper sulphate solution conduct.', 6),
        mcq('why', 'Dissolved salts make water conduct.', [
          ['Distilled water does not conduct electricity well because…', 'It has no dissolved salts', ['It is too cold', 'It contains too many salts', 'It is a metal'], 'Pure water.', 'Without dissolved salts there is little to carry current.'],
          ['An LED is better than a bulb in a tester because…', 'It glows even with a weak current', ['It needs more current', 'It is made of metal', 'It works without a cell'], 'Weak currents.', 'LEDs respond to very small currents.'],
          ['Besides a bulb, the flow of current can be detected by a…', 'Magnetic compass deflecting near the wire', ['Thermometer', 'Measuring cylinder', 'Magnifying glass'], 'Current has a magnetic effect.', 'A current-carrying wire deflects a compass needle.'],
          ['Tap water conducts electricity because…', 'It contains dissolved salts', ['It is pure', 'It is colourless', 'It has no minerals'], 'Not pure.', 'Salts dissolved in tap water conduct.'],
          ['Which liquid will NOT make a tester\'s LED glow?', 'Vegetable oil', ['Lemon juice', 'Salt solution', 'Vinegar'], 'Oils are insulators.', 'Oil does not conduct electricity.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.conduct.cell', title: 'The electrolytic cell: chemical effects of current', prereqs: ['ts8.ps.conduct.liquids'],
      activities: ['lab:circuit'],
      intro: [
        h('Current can cause chemical changes'),
        photo('🧪', 'Pass current through copper sulphate solution with carbon rods: in a while a reddish-brown coat of copper appears on one rod.'),
        p('When an electric current passes through a conducting solution, it causes chemical reactions. This is the chemical effect of electric current. The set-up is an electrolytic cell.'),
        def('Electrolytic cell', 'A vessel containing a conducting liquid (electrolyte) with two electrodes connected to a battery, in which current produces chemical change.'),
        def('Electrode', 'A conductor (metal plate or carbon rod) through which current enters or leaves the liquid. The one joined to the positive terminal is the anode; the one joined to the negative terminal is the cathode.'),
        def('Electrolyte', 'The conducting solution in the cell, such as copper sulphate or acidified water.'),
        p('You can see the chemical effect as: bubbles of gas at the electrodes (e.g. passing current through water with a little acid gives hydrogen at the cathode and oxygen at the anode); a metal coat deposited on an electrode; or a change in the colour of the solution.'),
        p('With copper sulphate solution, copper is deposited on the cathode (negative electrode). If the anode is a copper plate, it slowly gets thinner as copper dissolves from it into the solution — the solution stays blue.'),
        p('Scientist William Nicholson showed that passing current through water produces hydrogen and oxygen; Michael Faraday later studied these effects in detail.'),
        keys('Current through a conducting liquid causes chemical change.', 'Anode → + terminal; cathode → − terminal.', 'Signs: gas bubbles, metal deposits, colour change.', 'In CuSO₄ solution, copper deposits on the cathode.'),
        remember('Metal always deposits on the CATHODE (the electrode joined to the negative terminal).'),
      ],
      examples: [
        ex('In an electrolytic cell with copper sulphate solution, a copper plate is the anode and a carbon rod the cathode. What happens?', ['Copper from the solution deposits on the cathode (carbon rod).', 'The same amount of copper dissolves from the anode into the solution.'], 'Carbon rod gets copper-coated; copper anode gets thinner'),
        ex('Bubbles appear at both electrodes when current passes through acidified water. What gases are they?', ['Water splits under current.', 'Hydrogen collects at the cathode, oxygen at the anode.'], 'Hydrogen (cathode) and oxygen (anode)'),
      ],
      practice: [
        mcq('cell', 'Anode is +, cathode is −; metals deposit on the cathode.', [
          ['The electrode connected to the positive terminal of a battery is the…', 'Anode', ['Cathode', 'Electrolyte', 'Filament'], 'A for "above zero"? Remember: anode = +.', 'Anode is joined to the positive terminal.'],
          ['In electrolysis of copper sulphate solution, copper deposits on the…', 'Cathode', ['Anode', 'Beaker wall', 'Battery'], 'Metals go to the negative electrode.', 'Copper is deposited on the cathode.'],
          ['The conducting solution in an electrolytic cell is called the…', 'Electrolyte', ['Electrode', 'Insulator', 'Anode'], 'Electro + lyte (liquid).', 'The electrolyte carries current inside the cell.'],
          ['Which is a visible sign of the chemical effect of current?', 'Gas bubbles forming on the electrodes', ['The bulb gets colder', 'The wire becomes longer', 'Sound is produced'], 'Something new forms.', 'Bubbles, deposits and colour changes are chemical effects.'],
          ['Passing current through acidified water produces…', 'Hydrogen and oxygen', ['Nitrogen and carbon dioxide', 'Only steam', 'Chlorine and copper'], 'Water is H₂O.', 'Water splits into hydrogen and oxygen.'],
          ['The electrode joined to the negative terminal is the…', 'Cathode', ['Anode', 'Electrolyte', 'Switch'], 'Cathode = −.', 'Cathode connects to the negative terminal.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Anode', 'Electrode joined to + terminal'], ['Cathode', 'Electrode joined to − terminal'], ['Electrolyte', 'Conducting solution'], ['Electrode', 'Rod or plate dipped in the liquid'], ['Chemical effect', 'Gas, deposit or colour change caused by current'],
        ], ['Anode and cathode are both electrodes.', 'Cathode → negative.']),
      ],
    },
    {
      id: 'ts8.ps.conduct.plating', title: 'Electroplating', prereqs: ['ts8.ps.conduct.cell'],
      intro: [
        h('A thin coat of a better metal'),
        photo('🪙', 'Shiny silver-coloured jewellery and bright chrome bicycle bells are often cheaper metals with a thin plated coat.'),
        p('Electroplating uses the chemical effect of current to coat one metal with a thin layer of another metal.'),
        def('Electroplating', 'The process of depositing a layer of a desired metal on another material by passing electric current through a solution of a salt of that metal.'),
        h('How to set it up'),
        p('1. Make the object to be plated the cathode (connect it to the − terminal). 2. Make a plate of the coating metal the anode (+ terminal). 3. Use a solution of a salt of the coating metal as the electrolyte. For copper plating: copper anode, object as cathode, copper sulphate solution.'),
        p('Current carries metal from the solution onto the object; the anode dissolves to keep the solution topped up. The object must be cleaned well first, or the coat will not stick.'),
        h('Why plate?'),
        p('Chromium plating gives a shiny, scratch-resistant finish to taps, cycle handles and car parts. Tin is plated on iron to make cans for food, because tin is less reactive than iron and does not spoil the food. Gold and silver plating make cheaper ornaments look precious. Plating also protects iron from rusting. Iron is often coated with zinc (galvanised iron) for buckets, pipes and bridges.'),
        p('Factories must dispose of used plating solutions carefully — they contain metal salts that pollute water.'),
        keys('Object to be plated = cathode (−).', 'Coating metal = anode (+).', 'Electrolyte = salt solution of the coating metal.', 'Uses: chromium (shine), tin (food cans), gold/silver (jewellery), zinc on iron (rust protection).'),
        remember('"Cathode gets the Coat" — the object always goes on the negative terminal.'),
      ],
      examples: [
        ex('Sana wants to copper-plate an iron key. How should she set up the cell?', ['Key (to be plated) → cathode, negative terminal.', 'Copper plate → anode, positive terminal.', 'Electrolyte: copper sulphate solution.'], 'Key as cathode, copper as anode, copper sulphate solution'),
        ex('Why are food cans made of tin-plated iron and not zinc-plated iron?', ['Zinc is more reactive and can react with food.', 'Tin is less reactive and safe for food.'], 'Tin is less reactive, so it does not spoil the food'),
      ],
      practice: [
        tp('setup', (r) => {
          const [metal, salt, obj] = r.pick([
            ['copper', 'copper sulphate', 'iron spoon'], ['silver', 'silver nitrate', 'brass bangle'], ['nickel', 'nickel sulphate', 'steel tap'],
            ['zinc', 'zinc sulphate', 'iron nail'], ['tin', 'tin chloride', 'iron sheet'], ['chromium', 'chromium salt', 'cycle handle'],
          ] as [string, string, string][]);
          const ask = r.int(0, 2);
          const Q: [string, string, string[]][] = [
            [`To ${metal}-plate a ${obj}, what should be the CATHODE?`, `The ${obj}`, [`A ${metal} plate`, `${salt} solution`, 'A carbon rod only']],
            [`To ${metal}-plate a ${obj}, what should be the ANODE?`, `A ${metal} plate`, [`The ${obj}`, `${salt} solution`, 'A plastic rod']],
            [`To ${metal}-plate a ${obj}, which ELECTROLYTE should be used?`, `${salt} solution`, ['Distilled water', 'Sugar solution', 'Vegetable oil']],
          ];
          const [q, a, w] = Q[ask];
          return {
            type: 'mcq', prompt: q, ...choose(r, a, w),
            hints: ['The object to be coated goes on the negative terminal.', 'The coating metal is the anode; its salt is the electrolyte.'],
            mistakes: [{ when: 'wrong', explain: 'Remember: object = cathode (−), coating metal = anode (+), salt of the coating metal = electrolyte.' }],
            solution: [`Cathode: the ${obj}. Anode: a ${metal} plate. Electrolyte: ${salt} solution.`, `So the answer is: ${a}.`],
          };
        }),
        mcq('uses', 'Each plating metal is chosen for a reason.', [
          ['Taps and cycle handlebars are often plated with…', 'Chromium', ['Tin', 'Copper', 'Lead'], 'Shiny and scratch-resistant.', 'Chromium gives a hard shiny finish.'],
          ['Food cans are made of iron plated with…', 'Tin', ['Zinc', 'Chromium', 'Silver'], 'Less reactive than iron.', 'Tin does not react with food.'],
          ['Coating iron with zinc to prevent rusting is called…', 'Galvanisation', ['Vulcanisation', 'Carbonisation', 'Refining'], 'Galvanised iron buckets.', 'Zinc coat protects iron from rust.'],
          ['Before electroplating, the object must be…', 'Cleaned thoroughly', ['Painted', 'Heated red-hot', 'Oiled'], 'For the coat to stick.', 'Dirt and grease stop the metal layer from sticking.'],
          ['Why must plating factories dispose of waste solutions carefully?', 'The metal salts pollute water', ['They are valuable gold', 'They explode', 'They are pure water'], 'Environment.', 'Metal-salt wastes are harmful pollutants.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Some Natural Phenomena
// =====================================================================================
const ch10: USpec = {
  id: 'ts8.ps.ch10', subject: 'physics', title: 'Some Natural Phenomena', source: src(10),
  objectives: [
    {
      id: 'ts8.ps.charge.rubbing', title: 'Charging by rubbing; types of charge and how they interact', prereqs: [],
      intro: [
        h('A balloon that sticks to the wall'),
        photo('🎈', 'Rub a balloon on dry hair and it sticks to the wall and makes your hair stand up — it has been charged.'),
        p('Rub a plastic scale on dry hair and bring it near tiny bits of paper: they jump to it. Rubbing has given the scale an electric charge. Charge produced by rubbing stays on the object and does not flow, so it is called static electricity.'),
        p('There are two kinds of charge: positive (+) and negative (−). A glass rod rubbed with silk becomes positively charged. A plastic or ebonite rod rubbed with wool or fur becomes negatively charged. During rubbing, tiny charged particles (electrons) move from one object to the other, so both objects get charged — with opposite charges.'),
        h('How charges interact'),
        p('Like charges repel: two balloons rubbed on hair push each other apart. Unlike charges attract: a charged glass rod pulls a charged plastic straw. A charged object also attracts small uncharged objects like paper bits.'),
        def('Electroscope', 'A device to detect whether an object is charged. In a simple one, two thin aluminium foil strips hang from a metal clip. A charged object touching the clip gives both strips the same charge, so they repel and spread apart.'),
        def('Earthing', 'Transferring charge from an object to the Earth through a conductor. Touching a charged electroscope with your hand discharges it and the strips collapse. Buildings and appliances are earthed for safety.'),
        keys('Rubbing → static charge.', 'Glass + silk → glass positive; plastic + wool → plastic negative.', 'Like charges repel, unlike charges attract.', 'Repulsion is the sure test of charge.', 'Electroscope detects charge; earthing removes it.'),
        remember('Attraction can happen between a charged and an uncharged object, so only REPULSION proves both objects are charged.'),
      ],
      examples: [
        ex('Two straws are rubbed with the same polythene sheet and hung near each other. What happens and why?', ['Both get the same kind of charge.', 'Like charges repel.'], 'They move apart (repel)'),
        ex('A charged glass rod is brought near a charged plastic comb and they attract. What is the charge on the comb?', ['Glass rubbed with silk is positive.', 'Attraction between charged objects means unlike charges.'], 'Negative'),
      ],
      practice: [
        tp('interact', (r) => {
          const S = ['positive', 'negative'];
          const a = r.pick(S), b = r.pick(S);
          const [x, y] = r.pick([['glass rod', 'balloon'], ['plastic comb', 'straw'], ['ebonite rod', 'glass rod'], ['refill', 'balloon'], ['charged straw', 'charged comb']]);
          const ans = a === b ? 'They repel each other' : 'They attract each other';
          return {
            type: 'mcq', prompt: `A ${x} carrying a ${a} charge is brought near a ${y} carrying a ${b} charge. What happens?`,
            ...choose(r, ans, [a === b ? 'They attract each other' : 'They repel each other', 'Nothing happens', 'Both lose their charge at once']),
            hints: ['Compare the two charges: same or different?', 'Like charges repel; unlike charges attract.'],
            mistakes: [{ when: 'wrong', explain: `${a} and ${b} are ${a === b ? 'like' : 'unlike'} charges.` }],
            solution: [`${a} and ${b} are ${a === b ? 'like charges, which repel' : 'unlike charges, which attract'}.`, ans + '.'],
          };
        }),
        mcq('charge', 'Two kinds of charge; like repel, unlike attract.', [
          ['A glass rod rubbed with silk becomes…', 'Positively charged', ['Negatively charged', 'Magnetised', 'Uncharged'], 'Convention.', 'Glass rubbed with silk is taken as positive.'],
          ['A plastic comb rubbed with dry hair or wool becomes…', 'Negatively charged', ['Positively charged', 'Hot only', 'Magnetic'], 'Opposite of glass.', 'Plastic rubbed with wool is negative.'],
          ['Which is the sure test that an object is charged?', 'Repulsion with a known charged object', ['Attraction to paper bits only', 'It feels warm', 'It shines'], 'Uncharged objects can be attracted too.', 'Only two charged objects can repel.'],
          ['An electroscope is used to…', 'Detect whether an object is charged', ['Measure temperature', 'See distant stars', 'Measure sound'], 'Foil strips.', 'The strips diverge when charged.'],
          ['Transferring charge to the earth is called…', 'Earthing', ['Charging', 'Lightning', 'Rusting'], 'Through a conductor to the ground.', 'Earthing removes extra charge safely.'],
          ['Charges produced by rubbing are called static because they…', 'Stay on the object and do not flow', ['Move very fast in wires', 'Never form', 'Make sound'], 'Static = not moving.', 'Static charges stay where they are produced.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.charge.lightning', title: 'Lightning and lightning safety', prereqs: ['ts8.ps.charge.rubbing'],
      intro: [
        h('A giant spark in the sky'),
        photo('⛈️', 'Lightning is the same kind of spark as when you remove a woollen sweater in the dark — only billions of times bigger.'),
        p('During a thunderstorm, strong air currents move up and water droplets and ice move down, rubbing against each other. This separates charges: usually the upper part of the cloud becomes positive and the lower part negative. The ground below gets an opposite charge.'),
        p('When the charges build up enough, the air can no longer stop them. A huge spark jumps — between clouds or between a cloud and the Earth. This is lightning. It heats the air so suddenly that the air expands with a loud bang: thunder. We see the flash first because light is much faster than sound.'),
        h('Staying safe'),
        p('No place outside is fully safe during lightning. Go inside a house or a closed car or bus. If you are caught in the open: do not shelter under a tall tree; keep away from poles and metal objects; do not lie flat; squat low with your head between your knees and hands on knees. Avoid swimming and do not use corded phones or touch taps during a storm. Unplug TVs and computers.'),
        def('Lightning conductor', 'A metal rod fixed on top of a tall building, connected by a thick wire to a metal plate buried in the ground. It carries the lightning\'s charge safely into the Earth.'),
        keys('Rubbing of air, water and ice separates charges in clouds.', 'Lightning = huge electric discharge; thunder = sound of rapidly expanding air.', 'Shelter indoors or in a closed vehicle; never under a tall tree.', 'Lightning conductors protect tall buildings.'),
        remember('"When thunder roars, go indoors." Wait about 30 minutes after the last thunder before going out.'),
      ],
      examples: [
        ex('Why should you not stand under a tree during a thunderstorm?', ['Lightning tends to strike tall objects.', 'The tree can be struck and the charge can jump to you.'], 'Tall trees attract lightning strikes'),
        ex('How does a lightning conductor protect a building?', ['It is a metal rod higher than the building, connected to the earth.', 'Lightning strikes it and the charge flows harmlessly into the ground.'], 'It carries the charge safely to the earth'),
      ],
      practice: [
        tapT('tap-safe', 'Tap every SAFE action during a thunderstorm.', [
          ['Going inside a house', true], ['Staying inside a closed car', true], ['Squatting low in an open field with head between knees', true], ['Unplugging the TV', true],
          ['Standing under a tall tree', false], ['Holding an open umbrella with a metal rod in a field', false], ['Swimming in a pond', false], ['Lying flat on wet ground', false],
        ], ['Avoid tall objects, water and metal.', 'Indoors or in a closed vehicle is safest.'], 'Go indoors or into a closed vehicle; in the open, squat low; unplug appliances.'),
        mcq('light', 'Lightning is a huge electric discharge.', [
          ['Lightning is caused by…', 'Discharge between charged clouds or a cloud and the earth', ['Collision of two clouds making fire', 'Reflection of sunlight', 'Burning gas in the sky'], 'Charges build up.', 'Separated charges jump as a giant spark.'],
          ['We see lightning before we hear thunder because…', 'Light travels faster than sound', ['Thunder happens later', 'Sound travels faster', 'Our eyes are closer to the cloud'], 'Speeds.', 'Light reaches us almost instantly; sound takes longer.'],
          ['A lightning conductor is connected to…', 'A metal plate buried in the earth', ['The roof tank', 'A glass rod', 'The electric meter'], 'Charge must go to the ground.', 'Earthing carries charge safely away.'],
          ['Thunder is produced because…', 'Lightning heats the air, which expands suddenly', ['Clouds crash into each other', 'Rain hits the ground', 'The wind blows hard'], 'Sudden heating.', 'Rapid expansion of air makes the loud bang.'],
          ['Which is the safest place during a lightning storm?', 'Inside a building', ['Under a tall tree', 'On an open terrace', 'In a swimming pool'], 'Shelter.', 'A building protects you from strikes.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.quake', title: 'Earthquakes: causes and safety', prereqs: [],
      intro: [
        h('When the ground shakes'),
        photo('🏘️', 'Houses with strong frames and light roofs survive earthquakes far better than heavy, weak structures.'),
        p('An earthquake is a sudden shaking or trembling of the Earth that lasts for a very short time. It is caused by a disturbance deep inside the Earth\'s crust.'),
        p('The outermost layer of the Earth is broken into huge slabs called plates, which move very slowly. When plates rub, push or slide past each other, stress builds up; when the rocks suddenly give way, the energy is released as shock waves — an earthquake. Areas near plate boundaries (fault zones), such as the Himalayas, Kashmir, Gujarat\'s Rann of Kutch and the North-East, are more earthquake-prone. Volcanic eruptions and meteor impacts can also cause tremors.'),
        def('Seismograph', 'An instrument that records the shock waves of an earthquake.'),
        def('Richter scale', 'A scale that gives the magnitude of an earthquake from its recorded waves. Each step up is about 10 times bigger shaking and about 30 times more energy. Earthquakes above about 7 are very destructive.'),
        p('We cannot yet predict earthquakes. So we prepare. Build earthquake-resistant structures (light roofs, flexible frames, wooden or mud houses rather than heavy ones in high-risk areas). Fix cupboards and shelves to walls. During a quake indoors: DROP, COVER under a sturdy table, and HOLD ON; stay away from windows and tall furniture. Outdoors: move to an open space away from buildings, trees and power lines. In a car: stop and stay inside.'),
        keys('Cause: movement of Earth\'s plates releasing stored energy.', 'Seismograph records; Richter scale gives magnitude.', 'Prepare: earthquake-resistant buildings, fixed furniture.', 'During: drop, cover, hold on; outdoors go to open ground.'),
        remember('Do not use lifts during or right after an earthquake.'),
      ],
      examples: [
        ex('Why are earthquakes more common in the Himalayan region?', ['The Indian plate is pushing into the Eurasian plate there.', 'Stress builds up and is released suddenly.'], 'It lies on a plate boundary (fault zone)'),
        ex('Joseph is in class when an earthquake starts. What should he do?', ['Do not run out in panic.', 'Drop under a strong desk, cover his head and hold on until shaking stops.', 'Stay away from windows.'], 'Drop, cover and hold on under a sturdy desk'),
      ],
      practice: [
        orderT('drill', 'Put the earthquake safety drill (indoors) in the right order.', ['DROP to the floor', 'COVER your head under a sturdy table', 'HOLD ON until the shaking stops', 'Walk out calmly to an open area (no lifts)'], ['Get low first.', 'Leave only after the shaking stops.'], 'Drop → Cover → Hold on → leave calmly to open ground.'),
        mcq('quake', 'Earthquakes come from moving plates.', [
          ['Earthquakes are mainly caused by…', 'Movement of the Earth\'s plates', ['Heavy rain', 'Strong winds', 'Lightning'], 'Deep inside the crust.', 'Plates sliding and colliding release energy.'],
          ['The instrument that records earthquake waves is a…', 'Seismograph', ['Barometer', 'Thermometer', 'Electroscope'], 'Seismo = shaking.', 'A seismograph records seismic waves.'],
          ['The magnitude of an earthquake is expressed on the…', 'Richter scale', ['Celsius scale', 'Decibel scale', 'Beaufort scale'], 'Named after Charles Richter.', 'The Richter scale gives magnitude.'],
          ['If you are outdoors during an earthquake, you should…', 'Move to an open area away from buildings and wires', ['Stand under a bridge', 'Enter a tall building', 'Stand next to a wall'], 'Avoid falling objects.', 'Open ground is safest.'],
          ['Which region of India is highly earthquake-prone?', 'The Himalayan region', ['The Deccan plateau centre', 'The Thar desert interior', 'The Gangetic plains centre only'], 'Plate boundary.', 'The Himalayas lie on a colliding plate boundary.'],
          ['Which can earthquakes NOT do today?', 'Be predicted accurately in advance', ['Damage buildings', 'Cause tsunamis', 'Be recorded on a seismograph'], 'Prediction.', 'Scientists cannot yet predict the exact time of an earthquake.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Stars and Solar System
// =====================================================================================
const PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const ch11: USpec = {
  id: 'ts8.ps.ch11', subject: 'physics', title: 'Stars and Solar System', source: src(11),
  objectives: [
    {
      id: 'ts8.ps.sky.moon', title: 'Phases of the Moon and its surface', prereqs: [],
      intro: [
        h('Why does the Moon change shape?'),
        photo('🌙', 'From Amavasya (new moon) to Pournami (full moon) the bright part of the Moon grows night by night.'),
        p('The Moon does not make its own light. It shines because sunlight falls on it and is reflected to us. At any time, the half of the Moon facing the Sun is lit. As the Moon goes around the Earth (about once a month), we see different amounts of its lit half. These different shapes are the phases of the Moon.'),
        p('New moon: the Moon is between Earth and Sun, its lit side faces away — we cannot see it. Then a thin crescent appears (waxing crescent), then half (first quarter, about a week later), then more than half (waxing gibbous), then full moon about 15 days after new moon, when the Earth is between Sun and Moon. After that it shrinks (wanes) back through gibbous, last quarter and crescent to new moon. One full cycle takes about 29.5 days.'),
        p('The Moon takes the same time to spin once on its axis as to go around the Earth, so we always see the same face of the Moon.'),
        h('The Moon\'s surface'),
        p('The Moon has no air and no water, so there is no weather and no life, and no sound can travel. Its surface is dusty and barren, with many craters (made by meteorite impacts) and high mountains. Its gravity is about one-sixth of the Earth\'s. Neil Armstrong first stepped on the Moon on 20 July 1969. India\'s Chandrayaan-3 landed near the Moon\'s south pole in August 2023.'),
        keys('Moon shines by reflected sunlight.', 'Phases: new moon → crescent → first quarter → gibbous → full moon → back; about 29.5 days.', 'Same face always towards Earth.', 'No air, no water, craters; gravity one-sixth of Earth\'s.'),
        remember('Waxing = bright part growing (new → full). Waning = shrinking (full → new).'),
      ],
      examples: [
        ex('Why can\'t we see the Moon on a new moon night?', ['The Moon is between the Earth and the Sun.', 'Its sunlit half faces away from us.'], 'Its lit side faces away from the Earth'),
        ex('Full moon is on a Saturday. Roughly when is the next new moon?', ['Full moon to new moon is about half the cycle.', 'Half of 29.5 days ≈ 15 days.'], 'About 15 days later'),
      ],
      practice: [
        orderT('phases', 'Put the phases of the Moon in order, starting from new moon.', ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter'], ['The lit part grows until full moon.', 'After full moon it shrinks again.'], 'New → crescent → first quarter → gibbous → full → waning gibbous → last quarter.'),
        mcq('moon', 'The Moon reflects sunlight; its lit half faces the Sun.', [
          ['The Moon shines because it…', 'Reflects sunlight', ['Produces its own light', 'Burns gases', 'Reflects Earth\'s city lights only'], 'Not a star.', 'The Moon is lit by the Sun.'],
          ['The time from one new moon to the next is about…', '29.5 days', ['7 days', '365 days', '24 hours'], 'About a month.', 'A lunar cycle is about 29.5 days.'],
          ['Craters on the Moon were formed mainly by…', 'Meteorite impacts', ['Rivers', 'Wind', 'Earthquakes caused by rain'], 'No air to burn them up.', 'Meteorites strike the surface and form craters.'],
          ['On the Moon you cannot hear a friend shout because…', 'There is no air to carry sound', ['The Moon is too cold', 'Gravity is weak', 'Sound is reflected'], 'Sound needs a medium.', 'No atmosphere means no medium for sound.'],
          ['We always see the same side of the Moon because…', 'It spins once in the same time it takes to go around Earth', ['It does not spin at all', 'The Earth does not rotate', 'The far side is dark'], 'Equal periods.', 'Equal rotation and revolution periods keep one face towards us.'],
          ['At full moon, the…', 'Earth is between the Sun and the Moon', ['Moon is between the Sun and the Earth', 'Sun is between Earth and Moon', 'Moon has no light'], 'We see the whole lit face.', 'At full moon, Earth lies between Sun and Moon.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.sky.eclipse', title: 'Solar and lunar eclipses', prereqs: ['ts8.ps.sky.moon'],
      intro: [
        h('Shadows in space'),
        photo('☀️', 'During a total solar eclipse the sky darkens in the daytime and birds return to their nests.'),
        p('Light travels in straight lines, so the Earth and the Moon cast long shadows in space. An eclipse happens when one body falls into the shadow of another.'),
        def('Solar eclipse', 'When the Moon comes exactly between the Sun and the Earth, the Moon\'s shadow falls on the Earth and blocks the Sun from view. It can happen only on a new moon day.'),
        def('Lunar eclipse', 'When the Earth comes exactly between the Sun and the Moon, the Earth\'s shadow falls on the Moon. It can happen only on a full moon night.'),
        p('Why is there no eclipse every month? The Moon\'s path is tilted by about 5° to the Earth\'s path, so usually the three bodies are not exactly in one line.'),
        p('An eclipse is a natural shadow event, nothing to fear. But NEVER look at the Sun directly, even during an eclipse — it can permanently damage your eyes. Use certified solar viewing glasses or a pinhole projector. A lunar eclipse is safe to watch with bare eyes.'),
        keys('Solar eclipse: Sun – Moon – Earth in a line; new moon day.', 'Lunar eclipse: Sun – Earth – Moon in a line; full moon night.', 'Tilted orbit → not every month.', 'Never look directly at the Sun.'),
        remember('Solar eclipse: the MOON blocks the Sun. Lunar eclipse: the EARTH\'s shadow covers the Moon.'),
      ],
      examples: [
        ex('A lunar eclipse is announced. Which phase will the Moon be in that night?', ['A lunar eclipse needs Earth between Sun and Moon.', 'That alignment is the full moon.'], 'Full moon'),
        ex('Why should we not view a solar eclipse with bare eyes?', ['Even a thin edge of the Sun is very intense.', 'It can burn the retina and cause permanent damage.'], 'It can permanently damage the eyes'),
      ],
      practice: [
        tp('which', (r) => {
          const solar = r.next() < 0.5;
          const ask = r.int(0, 2);
          const name = solar ? 'solar' : 'lunar';
          const Q: [string, string, string[]][] = [
            [`In a ${name} eclipse, which body is in the MIDDLE?`, solar ? 'The Moon' : 'The Earth', solar ? ['The Earth', 'The Sun', 'Mars'] : ['The Moon', 'The Sun', 'Venus']],
            [`A ${name} eclipse can happen only on a…`, solar ? 'New moon day' : 'Full moon night', solar ? ['Full moon night', 'First quarter day', 'Any day'] : ['New moon day', 'Last quarter night', 'Any night']],
            [`During a ${name} eclipse, whose shadow falls on whom?`, solar ? 'The Moon\'s shadow falls on the Earth' : 'The Earth\'s shadow falls on the Moon', solar ? ['The Earth\'s shadow falls on the Moon', 'The Sun\'s shadow falls on the Earth', 'No shadow forms'] : ['The Moon\'s shadow falls on the Earth', 'The Sun\'s shadow falls on the Moon', 'No shadow forms']],
          ];
          const [q, a, w] = Q[ask];
          return {
            type: 'mcq', prompt: q, ...choose(r, a, w),
            hints: [solar ? 'Solar: the Sun is hidden from us.' : 'Lunar: the Moon is darkened.', 'The middle body casts the shadow.'],
            mistakes: [{ when: 'wrong', explain: solar ? 'In a solar eclipse the Moon is between Sun and Earth (new moon).' : 'In a lunar eclipse the Earth is between Sun and Moon (full moon).' }],
            solution: [solar ? 'Sun – Moon – Earth in a line.' : 'Sun – Earth – Moon in a line.', `Answer: ${a}.`],
          };
        }),
        mcq('eclipse', 'Straight-line shadows explain eclipses.', [
          ['Eclipses happen because…', 'Light travels in straight lines and bodies cast shadows', ['The Sun switches off', 'Demons swallow the Sun', 'Clouds cover the sky'], 'Shadows.', 'An eclipse is a shadow effect.'],
          ['Eclipses do not happen every month because…', 'The Moon\'s orbit is tilted about 5° to the Earth\'s', ['The Moon stops moving', 'The Sun is too far', 'The Earth is flat'], 'Not always in one line.', 'The tilt keeps them out of line most months.'],
          ['Which eclipse is safe to watch with bare eyes?', 'Lunar eclipse', ['Solar eclipse', 'Both', 'Neither'], 'Looking at the Sun is never safe.', 'A lunar eclipse involves only the dim Moon.'],
          ['A safe way to watch a solar eclipse is…', 'Using certified solar glasses or a pinhole projector', ['Looking directly at the Sun', 'Using ordinary sunglasses', 'Using binoculars without filters'], 'Protect your eyes.', 'Only proper filters or projection are safe.'],
          ['During a total lunar eclipse, the Moon often looks…', 'Coppery red', ['Bright white', 'Completely invisible always', 'Green'], 'Sunlight bent through Earth\'s air.', 'Red light bent by Earth\'s atmosphere reaches the Moon.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.sky.planets', title: 'Planets and other members of the solar system', prereqs: [],
      intro: [
        h('The Sun\'s family'),
        photo('⭐', 'The Sun is a star — a huge hot ball of gas. Other stars look tiny only because they are much farther away.'),
        p('The Sun and all the bodies that go around it make up the solar system. The Sun is a star that produces its own heat and light. Planets do not; they shine by reflecting sunlight. Planets revolve around the Sun in fixed paths called orbits and also spin on their own axes.'),
        p('In order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. (Memory aid: "My Very Educated Mother Just Served Us Noodles".) The first four are small and rocky (inner planets); the outer four are giant planets made mostly of gases, with rings around them.'),
        p('Some facts: Mercury is the smallest and nearest to the Sun. Venus is the hottest and brightest planet — seen as the morning or evening "star"; it spins in the opposite direction to most planets. Earth is the only planet known to support life. Mars is the red planet. Jupiter is the largest. Saturn has spectacular rings and is the least dense. Pluto was called a planet until 2006; it is now a dwarf planet.'),
        h('Other members'),
        p('Natural satellites (moons) revolve around planets — the Moon around Earth. Asteroids are rocky pieces mostly between Mars and Jupiter (the asteroid belt). Comets have icy heads and long glowing tails that point away from the Sun; Halley\'s comet returns about every 76 years. Meteors ("shooting stars") are small rocks that burn up in our atmosphere; pieces that reach the ground are meteorites. Artificial satellites like those launched by ISRO help in weather forecasting, communication and mapping.'),
        keys('Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 'Largest: Jupiter. Smallest and nearest: Mercury. Hottest and brightest: Venus.', 'Asteroid belt between Mars and Jupiter.', 'Comets: icy, tails away from Sun. Meteors burn in air.'),
        remember('Stars make their own light; planets and moons only reflect it.'),
      ],
      examples: [
        ex('Which is the fifth planet from the Sun, and what is special about it?', ['Count: Mercury, Venus, Earth, Mars, Jupiter.', 'Jupiter is the largest planet.'], 'Jupiter — the largest planet'),
        ex('Where is the asteroid belt?', ['Between the inner rocky planets and the outer giants.', 'Specifically, between Mars and Jupiter.'], 'Between the orbits of Mars and Jupiter'),
      ],
      practice: [
        orderT('order', 'Arrange the planets in order of distance from the Sun (nearest first).', PLANETS, ['My Very Educated Mother Just Served Us Noodles.', 'Earth is third; Jupiter is fifth.'], 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 2),
        tp('nth', (r) => {
          const i = r.int(0, 7);
          const ord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][i];
          const wrong = PLANETS.filter((_, k) => k !== i && Math.abs(k - i) <= 2);
          return {
            type: 'mcq', prompt: `Which planet is ${ord} from the Sun?`, ...choose(r, PLANETS[i], wrong),
            hints: ['Use the memory aid: My Very Educated Mother Just Served Us Noodles.', `Count ${i + 1} from Mercury.`],
            mistakes: [{ when: 'wrong', explain: `Count again: ${PLANETS.slice(0, i + 1).join(', ')}.` }],
            solution: [`Order: ${PLANETS.join(', ')}.`, `The ${ord} is ${PLANETS[i]}.`],
          };
        }),
        matchT('match', 'body to its feature', [
          ['Jupiter', 'Largest planet'], ['Mercury', 'Smallest planet, nearest the Sun'], ['Venus', 'Hottest and brightest planet'], ['Mars', 'The red planet'], ['Saturn', 'Famous rings, least dense'],
          ['Comet', 'Icy head with a tail pointing away from the Sun'], ['Meteor', 'Shooting star burning in our air'], ['Asteroid', 'Rocky body between Mars and Jupiter'],
        ], ['Start with the planets you know best.', 'Comets have tails; meteors burn up in the atmosphere.'], 5),
      ],
    },
    {
      id: 'ts8.ps.sky.earth', title: 'How people understood a spherical, rotating Earth', prereqs: ['ts8.ps.sky.planets'],
      intro: [
        h('How do we know the Earth is round?'),
        photo('🚢', 'Watch a ship sail away from the shore: the hull disappears first and the top of the mast last.'),
        p('Long before satellites, careful observers worked out that the Earth is a sphere.'),
        p('Clues: 1. A ship sailing away sinks below the horizon hull-first, which happens only on a curved surface. 2. During a lunar eclipse the Earth\'s shadow on the Moon is always curved — only a sphere casts a round shadow from every direction. 3. As you travel north or south, different stars become visible and the Pole Star\'s height in the sky changes. 4. Ships and aeroplanes can travel around the world and return to the start.'),
        p('Around 240 BCE, the Greek scholar Eratosthenes compared shadow angles at noon in two Egyptian cities and calculated the Earth\'s circumference quite accurately. In India, Aryabhata (born 476 CE) wrote in the Aryabhatiya that the Earth rotates on its axis, explaining why stars appear to move from east to west — just as trees appear to move backwards when we ride in a train.'),
        p('The Earth rotates once about every 24 hours, from west to east, causing day and night. That is why the Sun, Moon and stars appear to rise in the east and set in the west. It also revolves around the Sun once a year. Today, photographs from space confirm the round Earth.'),
        keys('Evidence: ship hull vanishes first; round shadow in lunar eclipse; changing stars with latitude; round-the-world travel.', 'Eratosthenes measured Earth\'s size; Aryabhata said the Earth rotates.', 'Rotation (west to east, ~24 h) → day and night, apparent motion of the sky.'),
        remember('The Sun does not really move across the sky — the Earth turns under it.'),
      ],
      examples: [
        ex('Why does the Sun seem to rise in the east?', ['The Earth rotates from west to east.', 'So the sky seems to turn from east to west.'], 'Because the Earth rotates from west to east'),
        ex('How does a lunar eclipse show the Earth is round?', ['The Earth\'s shadow on the Moon always has a curved edge.', 'Only a sphere casts a round shadow in every orientation.'], 'Its shadow on the Moon is always circular'),
      ],
      practice: [
        mcq('earth', 'Look for evidence of curvature and rotation.', [
          ['When a ship sails away, the part that disappears first is the…', 'Hull (bottom)', ['Top of the mast', 'Whole ship at once', 'Flag'], 'Curved surface.', 'The curved Earth hides the lower part first.'],
          ['Which Indian astronomer stated that the Earth rotates on its axis?', 'Aryabhata', ['Eratosthenes', 'Newton', 'Galileo'], 'Aryabhatiya.', 'Aryabhata explained the apparent motion of stars by Earth\'s rotation.'],
          ['Who first measured the Earth\'s circumference using shadows?', 'Eratosthenes', ['Aryabhata', 'Neil Armstrong', 'Copernicus'], 'A Greek scholar in Egypt.', 'He compared noon shadows in two cities.'],
          ['Day and night are caused by…', 'The Earth\'s rotation on its axis', ['The Earth\'s revolution around the Sun', 'The Moon blocking the Sun', 'Clouds'], 'Spinning once in 24 hours.', 'Rotation brings each place into and out of sunlight.'],
          ['The Earth rotates from…', 'West to east', ['East to west', 'North to south', 'South to north'], 'The Sun rises in the east.', 'West-to-east rotation makes the sky seem to move east to west.'],
          ['Which observation is evidence that the Earth is round?', 'The Earth\'s shadow on the Moon is always curved', ['The sky is blue', 'Rain falls down', 'Rivers flow to the sea'], 'Eclipse shadow.', 'Only a sphere always casts a round shadow.'],
        ]),
        tapT('tap-evidence', 'Tap every observation that shows the Earth is ROUND.', [
          ['Ships disappear hull-first over the horizon', true], ['Round shadow of Earth on the Moon during a lunar eclipse', true], ['Different stars are seen as you travel north or south', true], ['Photographs of Earth from space', true],
          ['The Sun is hot', false], ['The sky looks blue', false], ['Rain falls from clouds', false],
        ], ['Look for evidence of curvature.', 'Hot Sun, blue sky and rain say nothing about Earth\'s shape.'], 'Ship hulls, eclipse shadows, changing stars and space photos show a round Earth.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Graphs of Motion
// =====================================================================================
const pts = (v: number, n = 5): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [i, rd(v * i, 2)] as [number, number]);
const ch12: USpec = {
  id: 'ts8.ps.ch12', subject: 'physics', title: 'Graphs of Motion', source: src(12),
  objectives: [
    {
      id: 'ts8.ps.graph.table', title: 'Distance–time tables and graphs', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        h('A picture of a journey'),
        photo('⏱', 'Note the distance a cyclist has covered every few seconds and you can draw the whole ride as a line on paper.'),
        p('To study motion, we record the distance covered at different times in a table. A distance–time graph turns this table into a picture.'),
        p('How to draw it: 1. Take time on the horizontal x-axis and distance on the vertical y-axis. 2. Choose a scale that fits all the data (e.g. 1 cm = 1 s, 1 cm = 10 m). 3. Label the axes with the quantity and unit. 4. Plot each pair (time, distance) as a point. 5. Join the points.'),
        p('Reading the graph: to find the distance at a given time, go up from that time to the line, then across to the distance axis. To find when a distance was reached, go across from the distance, then down.'),
        def('Distance–time graph', 'A graph with time on the x-axis and distance travelled on the y-axis, showing how distance changes with time.'),
        keys('Time on x-axis, distance on y-axis.', 'Choose a suitable scale; label axes with units.', 'Plot points (t, d) and join them.', 'Read values by going up/across from the axes.'),
        remember('Time is the independent quantity — it always goes on the x-axis.'),
      ],
      examples: [
        ex('A car\'s table: 0 s → 0 m, 1 s → 15 m, 2 s → 30 m, 3 s → 45 m. What distance will it cover in 4 s if it keeps going the same way?', ['It covers 15 m every second.', '45 + 15 = 60 m'], '60 m', { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: [[0, 0], [1, 15], [2, 30], [3, 45]] }),
        ex('On a distance–time graph, the point (5 s, 40 m) is marked. What does it mean?', ['x-value is time, y-value is distance.', 'At 5 s the object had covered 40 m.'], 'After 5 s the object had travelled 40 m'),
      ],
      practice: [
        tp('read', (r) => {
          const v = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]);
          const t = r.int(1, 5);
          return {
            ...numQ(`The graph shows an object moving steadily. What distance had it covered after ${t} s?`, v * t, 'm',
              ['Go up from the time on the x-axis to the line.', `It covers ${v} m every second.`],
              [`From the graph, distance at ${t} s = ${v} × ${t} = ${v * t} m.`],
              [{ when: `${v} m`, explain: 'That is the distance covered in ONE second. Read the value at the asked time.' }]),
            visual: { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: pts(v) },
          };
        }),
        mcq('axes', 'Time goes across; distance goes up.', [
          ['In a distance–time graph, time is plotted on the…', 'x-axis (horizontal)', ['y-axis (vertical)', 'Both axes', 'Neither'], 'Independent quantity.', 'Time is on the horizontal axis.'],
          ['In a distance–time graph, distance is plotted on the…', 'y-axis (vertical)', ['x-axis', 'A separate graph', 'Diagonal line'], 'Dependent quantity.', 'Distance goes on the vertical axis.'],
          ['The point (3 s, 24 m) on a distance–time graph means…', 'After 3 s the object had covered 24 m', ['After 24 s it covered 3 m', 'Its speed is 3 m/s', 'It stopped at 24 m'], '(x, y) = (time, distance).', 'x is time, y is distance.'],
          ['Before plotting a graph we must first choose a suitable…', 'Scale', ['Colour', 'Pen', 'Speed'], 'All data must fit.', 'A scale makes all values fit on the paper.'],
          ['Axes of a graph should be labelled with…', 'The quantity and its unit', ['Only numbers', 'The date', 'Nothing'], 'e.g. "time (s)".', 'Labels make the graph readable.'],
        ]),
        orderT('steps', 'Put the steps for drawing a distance–time graph in order.', ['Make a table of time and distance', 'Draw and label the axes (time on x, distance on y)', 'Choose a suitable scale', 'Plot each (time, distance) point', 'Join the points'], ['You need data first.', 'Joining points is the last step.'], 'Table → axes → scale → plot → join.'),
      ],
    },
    {
      id: 'ts8.ps.graph.uniform', title: 'Uniform motion and rest on a graph: slope gives speed', prereqs: ['ts8.ps.graph.table'],
      activities: ['lab:motion'],
      intro: [
        h('Straight lines, steep or flat'),
        photo('🚗', 'Two cars on a highway at steady speeds draw two straight lines on a distance–time graph; the faster car\'s line is steeper.'),
        p('If an object covers equal distances in equal intervals of time, it is in uniform motion. Its distance–time graph is a straight line.'),
        def('Uniform motion', 'Motion in a straight line in which equal distances are covered in equal intervals of time, however small.'),
        p('The steepness (slope) of the line tells the speed: speed = distance ÷ time = rise ÷ run on the graph. A steeper line means more distance in the same time, i.e. a higher speed. On the same axes, the faster object\'s line is steeper.'),
        f('speed = distance / time = slope of the distance–time graph', 'speed equals distance over time, which is the slope'),
        xp({
          title: 'What if? Change distance and time', formula: 'v = d / t',
          res: ['v', 'Speed', 'm/s', 'd / t', 2],
          vars: [['d', 'Distance', 'm', 10, 1000, 10, 100], ['t', 'Time', 's', 1, 200, 1, 20]],
          notes: [['d', 'Covering more distance in the same time means a steeper line — higher speed.', 'Less distance in the same time means a gentler slope.'], ['t', 'Taking longer for the same distance makes the line flatter — lower speed.', 'Taking less time makes it steeper — faster.']],
          mistakes: [['Dividing time by distance', 'Speed is distance per unit time: d ÷ t.'], ['Thinking a higher line means a faster object', 'It is the STEEPNESS, not the height, that shows speed.']],
          real: 'A bus covering 100 m in 20 s is moving at 5 m/s (18 km/h).',
        }),
        h('Objects at rest'),
        p('If an object is not moving, its distance stays the same as time passes. The graph is a horizontal straight line parallel to the time axis. Its slope is zero, so its speed is zero.'),
        keys('Uniform motion → straight sloping line.', 'Slope = speed; steeper = faster.', 'At rest → horizontal line (slope 0).', 'speed = distance ÷ time (m/s).'),
        remember('Horizontal line = stopped, NOT moving at constant speed.'),
      ],
      examples: [
        ex('A distance–time graph is a straight line through (0, 0) and (4 s, 32 m). Find the speed.', ['Slope = rise ÷ run = 32 m ÷ 4 s', 'Speed = 8 m/s'], '8 m/s', { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: [[0, 0], [1, 8], [2, 16], [3, 24], [4, 32]] }),
        ex('From 3 s to 7 s the graph of a scooter is a flat line at 50 m. What is the scooter doing?', ['Distance does not change.', 'Slope = 0, so speed = 0.'], 'It is stationary (at rest) at 50 m', { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: [[0, 0], [3, 50], [5, 50], [7, 50]] }),
      ],
      practice: [
        tp('slope', (r) => {
          const v = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
          return {
            ...numQ('The distance–time graph of an object is a straight line, as shown. What is its speed?', v, 'm/s',
              ['Speed = slope = distance ÷ time.', `Pick a point: at 5 s the distance is ${5 * v} m.`],
              [`Speed = ${5 * v} m ÷ 5 s = ${v} m/s`, 'Straight line → uniform motion, so this speed is constant.'],
              [{ when: `${5 * v} m/s`, explain: 'You read the distance only. Divide it by the time.' }]),
            visual: { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: pts(v) },
          };
        }),
        tp('speed', (r) => {
          const v = r.pick([3, 4, 5, 6, 8, 10, 12, 15, 20, 25]);
          const t = r.pick([4, 5, 8, 10, 20, 30]);
          const n = who(r);
          return numQ(`${n} cycles at a uniform speed and covers ${v * t} m in ${t} s. What is the speed?`, v, 'm/s',
            ['speed = distance ÷ time', `${v * t} ÷ ${t}`],
            [`Speed = ${v * t} m ÷ ${t} s = ${v} m/s`],
            [{ when: `${rd(t / (v * t), 4)} m/s`, explain: 'You divided time by distance. Speed = distance ÷ time.' }]);
        }),
        mcq('shape', 'Straight sloping = uniform; flat = rest; steeper = faster.', [
          ['A horizontal line on a distance–time graph means the object is…', 'At rest', ['Moving fast', 'Speeding up', 'Moving backwards'], 'Distance not changing.', 'Constant distance means no motion.'],
          ['A straight sloping line on a distance–time graph shows…', 'Uniform motion', ['Non-uniform motion', 'Rest', 'Falling'], 'Equal distances in equal times.', 'Constant slope means constant speed.'],
          ['Two straight lines A and B start at the origin; A is steeper. So…', 'A is faster than B', ['B is faster than A', 'Both have the same speed', 'A is at rest'], 'Steepness is speed.', 'Greater slope means greater speed.'],
          ['The slope of a distance–time graph gives the…', 'Speed', ['Distance', 'Time', 'Mass'], 'Rise over run.', 'Distance ÷ time = speed.'],
          ['The speed of a stationary object is…', '0 m/s', ['1 m/s', 'Very large', 'Equal to the distance'], 'Flat line.', 'Slope zero → speed zero.'],
        ]),
      ],
    },
    {
      id: 'ts8.ps.graph.nonuniform', title: 'Non-uniform motion on a graph; average speed', prereqs: ['ts8.ps.graph.uniform'],
      activities: ['lab:motion'],
      intro: [
        h('Real journeys are rarely steady'),
        photo('🚲', 'Riding to school you speed up, slow down at a crossing and stop at the gate — that is non-uniform motion.'),
        p('If an object covers unequal distances in equal intervals of time, it is in non-uniform motion. Its distance–time graph is a curve, or a line made of pieces with different slopes.'),
        def('Non-uniform motion', 'Motion in which an object covers unequal distances in equal intervals of time.'),
        p('If the curve gets steeper with time, the object is speeding up. If it gets flatter, the object is slowing down. A flat piece in the middle means it stopped for a while.'),
        p('For non-uniform motion we use average speed: the total distance divided by the total time taken.'),
        f('average speed = total distance / total time', 'average speed equals total distance divided by total time'),
        xp({
          title: 'What if? A trip in two parts', formula: 'average speed = (d1 + d2) / (t1 + t2)',
          res: ['vavg', 'Average speed', 'm/s', '(d1 + d2) / (t1 + t2)', 2],
          vars: [['d1', 'Distance in part 1', 'm', 0, 1000, 10, 300], ['t1', 'Time for part 1', 's', 1, 300, 1, 60], ['d2', 'Distance in part 2', 'm', 0, 1000, 10, 200], ['t2', 'Time for part 2', 's', 1, 300, 1, 100]],
          notes: [['t2', 'A slower second part pulls the average speed down.', 'A quicker second part raises the average.'], ['d1', 'More distance in the same time raises the average speed.', 'Less distance lowers it.']],
          mistakes: [['Averaging the two speeds directly', 'Average speed is TOTAL distance ÷ TOTAL time, not (v1 + v2) ÷ 2, unless the times are equal.']],
          real: 'A bus that waits at stops has a lower average speed than its speedometer shows while moving.',
        }),
        keys('Non-uniform motion → curved or bent graph.', 'Getting steeper → speeding up; getting flatter → slowing down; flat → stopped.', 'Average speed = total distance ÷ total time.'),
        remember('Check the distances covered in each equal time interval: equal → uniform; unequal → non-uniform.'),
      ],
      examples: [
        ex('A scooter goes 0, 5, 20, 45, 80 m at 0, 1, 2, 3, 4 s. Is this uniform motion?', ['Distances in each second: 5, 15, 25, 35 m.', 'They are unequal and increasing.'], 'Non-uniform — the scooter is speeding up', { kind: 'line-graph', xLabel: 'time (s)', yLabel: 'distance (m)', points: [[0, 0], [1, 5], [2, 20], [3, 45], [4, 80]] }),
        ex('An auto travels 600 m in 60 s, waits 20 s, then travels 400 m in 40 s. Find its average speed.', ['Total distance = 600 + 0 + 400 = 1000 m', 'Total time = 60 + 20 + 40 = 120 s', 'Average speed = 1000 ÷ 120 ≈ 8.33 m/s'], '≈ 8.33 m/s'),
      ],
      practice: [
        tp('avg', (r) => {
          const d1 = r.pick([100, 200, 300, 400, 600]), t1 = r.pick([20, 40, 50, 60]);
          const d2 = r.pick([100, 150, 200, 300]), t2 = r.pick([20, 30, 50, 80]);
          const wait = r.pick([0, 10, 20, 30]);
          const avg = rd((d1 + d2) / (t1 + t2 + wait), 2);
          const n = who(r);
          return numQ(`${n} runs ${d1} m in ${t1} s${wait ? `, rests for ${wait} s,` : ','} then runs ${d2} m in ${t2} s. What is the average speed for the whole trip? (Round to 2 decimal places.)`, avg, 'm/s',
            ['Average speed = total distance ÷ total time.', wait ? 'Include the resting time in the total time.' : 'Add both distances and both times.'],
            [`Total distance = ${d1} + ${d2} = ${d1 + d2} m`, `Total time = ${t1}${wait ? ` + ${wait}` : ''} + ${t2} = ${t1 + t2 + wait} s`, `Average speed = ${d1 + d2} ÷ ${t1 + t2 + wait} ≈ ${avg} m/s`],
            wait ? [{ when: `${rd((d1 + d2) / (t1 + t2), 2)} m/s`, explain: 'You left out the resting time. The clock keeps running while resting.' }] : [], 0.02);
        }, 2),
        tp('kind', (r) => {
          const uniform = r.next() < 0.5;
          const step = r.pick([3, 4, 5, 6, 8, 10]);
          const d = uniform ? [0, 1, 2, 3, 4].map((k) => step * k) : [0, 1, 4, 9, 16].map((k) => step * k);
          const shape = r.next() < 0.5;
          const ans = uniform ? 'Uniform motion' : 'Non-uniform motion (speeding up)';
          return {
            type: 'mcq', prompt: shape ? 'Look at the distance–time graph. What kind of motion does it show?' : `Time (s): 0, 1, 2, 3, 4. Distance (m): ${d.join(', ')}. What kind of motion is this?`,
            ...(shape ? { visual: { kind: 'line-graph' as const, xLabel: 'time (s)', yLabel: 'distance (m)', points: d.map((y, i) => [i, y] as [number, number]) } } : {}),
            ...choose(r, ans, [uniform ? 'Non-uniform motion (speeding up)' : 'Uniform motion', 'At rest', 'Non-uniform motion (slowing down)']),
            hints: ['Find the distance covered in each second.', 'Equal → uniform; increasing → speeding up.'],
            mistakes: [{ when: 'wrong', explain: `Distances each second: ${d.slice(1).map((x, i) => x - d[i]).join(', ')} m.` }],
            solution: [`Distance in each second: ${d.slice(1).map((x, i) => x - d[i]).join(', ')} m.`, uniform ? 'Equal distances in equal times → uniform motion (straight line).' : 'Increasing distances → speeding up (curve getting steeper).'],
          };
        }),
        mcq('curve', 'Steeper = faster; flatter = slower; flat = stopped.', [
          ['A distance–time graph that curves upward (getting steeper) shows an object…', 'Speeding up', ['Slowing down', 'At rest', 'Moving at constant speed'], 'Slope is increasing.', 'Increasing slope means increasing speed.'],
          ['A distance–time graph that gets flatter with time shows an object…', 'Slowing down', ['Speeding up', 'At constant speed', 'Moving backwards'], 'Slope is decreasing.', 'Decreasing slope means decreasing speed.'],
          ['Average speed is…', 'Total distance ÷ total time', ['Highest speed ÷ 2', 'Total time ÷ total distance', 'Distance in the first second'], 'Whole trip.', 'Average speed uses totals.'],
          ['Unequal distances in equal time intervals means…', 'Non-uniform motion', ['Uniform motion', 'Rest', 'Zero speed'], 'Definition.', 'Unequal distances → non-uniform.'],
          ['A city bus moving between stops is an example of…', 'Non-uniform motion', ['Uniform motion', 'Rest', 'Circular motion only'], 'It stops and starts.', 'Its speed keeps changing.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12];
