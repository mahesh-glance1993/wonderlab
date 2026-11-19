// Telangana SCERT Class 6 — Social Studies (21 chapters in 6 themes: I Diversity on the Earth, 1-5;
// II Production, Exchange and Livelihoods, 6-8; III Political Systems and Governance, 9-14;
// IV Social Organisation and Inequities, 15-16; V Religion and Society, 17-18; VI Culture and Communication, 19-21).
// Original teaching aligned to the official chapter list (src/content/ts/books.ts, syllabus.json).
// One unit per chapter (ids ts6.ss.ch<n>); objectives ts6.ss.<topic>.<skill>. Templates use only the Rng they are given.
// Figures marked "about" are rounded, well-established values; figures marked "illustrative" are made-up
// numbers used only to practise a method. Photo keys are checked against the picture index (emoji/index.json).
import {
  tp, ex, p, h, tip, def, keys, remember, photo, stepsB, vis, explore, L, approx, choose, matching, ordering, tapAll, NAMES,
  type USpec, type TSpec, type QSpec, type OSpec, type ExSpec,
} from '../../lib/kit';
import type { Block } from '../../../shared/content';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(6, 'social', n);
const who = (r: Rng) => r.pick(NAMES).en;

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, second hint, why the answer is right] */
type MQ = [string, string, string[], string, string];
/** MCQ drawn from a bank (give >= 5 entries). */
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1],
    mistakes: [{ when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}.`, why],
  };
}, d);

/** Match n random pairs from a pool (give >= n + 2 pairs for variety). */
const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Lock in the pairs you are surest about first, then think about the rest.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** Put a process in order: picks `n` steps from the (already correctly ordered) list each time. */
const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const idx = r.shuffle(steps.map((_, i) => i)).slice(0, Math.min(n, steps.length)).sort((a, b) => a - b);
  const pick = idx.map((i) => steps[i]);
  return {
    type: 'order', prompt, ...ordering(r, pick), hints,
    mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
    solution: [...pick.map((s, i) => `${i + 1}. ${s}`), why],
  };
}, d);

/** Timeline: n events with different dates, put in time order. Dates are sort keys (negative = BCE). */
type EV = [number, string, string];
const timelineT = (key: string, prompt: string, events: EV[], hints: string[], n = 4, d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const seen = new Set<number>();
  const pick: EV[] = [];
  for (const e of r.shuffle(events)) { if (pick.length < n && !seen.has(e[0])) { seen.add(e[0]); pick.push(e); } }
  pick.sort((a, b) => a[0] - b[0]);
  return {
    type: 'order', prompt, ...ordering(r, pick.map((e) => e[1])), hints,
    mistakes: [{ when: 'wrong', explain: 'Some events are out of time order. Remember: with BCE dates, the bigger number is the earlier date.' }],
    solution: pick.map((e, i) => `${i + 1}. ${e[1]} — ${e[2]}`),
  };
}, d);

/** Tap every correct option; n options drawn from the pool, always at least one right and one wrong. */
const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option on its own. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join('; ')}.`, why],
  };
}, d);

/** Typed numeric item (plain number; the unit is shown as a hint only). */
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.001, unitHint?: string): QSpec => ({
  type: 'typed', keypad: 'numeric', prompt, answer: approx(ans, rel), hints, solution,
  ...(unitHint ? { unitHint } : {}),
  mistakes: [{ when: 'wrong-value', explain: 'Re-check the method in the hints and redo the arithmetic step by step.' }, ...mistakes],
});

/** "How many years between two dates?" — dates as signed years (negative = BCE; there is no year 0). */
type YQ = [string, number, string, number];
const yearTxt = (y: number) => (y < 0 ? `${-y} BCE` : `${y} CE`);
const gap = (a: number, b: number) => (a < 0 && b > 0 ? b - a - 1 : b - a);
const yearsT = (key: string, bank: YQ[], d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const [a, ya, b, yb] = r.pick(bank);
  const ans = gap(ya, yb);
  const cross = ya < 0 && yb > 0, both = ya < 0 && yb < 0;
  const hint2 = cross ? `Add the years on each side of year 1: ${-ya} + ${yb}, then take away 1 because there is no year 0.`
    : both ? `Both dates are BCE: subtract the smaller number from the bigger: ${-ya} − ${-yb}.` : `${yb} − ${ya} = ?`;
  const sol = cross ? `${-ya} + ${yb} − 1 = ${ans} years` : both ? `${-ya} − ${-yb} = ${ans} years` : `${yb} − ${ya} = ${ans} years`;
  const wrong = cross ? Math.abs(yb + ya) : both ? -ya - yb : yb + ya;
  return numQ(`${a} in ${yearTxt(ya)}. ${b} in ${yearTxt(yb)}. About how many years passed between the two events?`, ans,
    [ya < 0 ? 'BCE years count DOWN towards year 1; CE years count UP from year 1.' : 'Subtract the earlier year from the later year.', hint2],
    [sol], wrong !== ans ? [{ when: String(wrong), explain: cross ? 'The dates are on opposite sides of year 1, so add the two numbers (and take away 1) instead of subtracting.' : 'To find the gap between two dates, subtract.' }] : [], 0.001, 'years');
}, d);

// ---------- "what if?" explorer helper ----------
type XV = [sym: string, name: string, unit: string, min: number, max: number, step: number, value: number];
interface XSpec { title: string; formula: string; res: [sym: string, name: string, unit: string, expr: string, decimals?: number]; vars: XV[]; notes: [string, string, string][]; mistakes: [string, string][]; real: string }
const xp = (o: XSpec): Block => {
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

/** Bar graph block. */
const bars = (labels: string[], values: number[], unit: string, alt: string): Block => vis({ kind: 'bar-graph', labels, values, unit }, alt);

/** Objective shorthand. */
const O = (id: string, title: string, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title, prereqs: [], intro, examples, practice });
/** Unit shorthand. */
const U = (n: number, title: string, objectives: OSpec[]): USpec => ({ id: `ts6.ss.ch${n}`, subject: 'social', title, source: src(n), objectives });

const DIRS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];


// =====================================================================================
// Theme I — Diversity on the Earth
// Chapter 1 — Reading and Making Maps
// =====================================================================================
const ch1 = U(1, 'Reading and Making Maps', [
  O('ts6.ss.maps.dir', 'Finding directions', [
    h('Which way is north?'),
    photo('🧭', 'A magnetic compass: its needle always settles pointing north–south, so travellers never lose their way.'),
    p('If a friend asks the way to your house, you might say "go straight, then turn left at the temple". That works only if you both stand at the same spot. Directions such as north, south, east and west work from anywhere, which is why maps use them.'),
    def('Cardinal directions', 'The four main directions: North, East, South and West.'),
    def('Intermediate directions', 'The four directions in between: North-East, South-East, South-West and North-West.'),
    p('The Sun helps us find directions without any instrument. It rises in the east in the morning and sets in the west in the evening. Stand with your right hand towards the rising Sun: you are facing north, your back is to the south and your left hand points west.'),
    stepsB('Clockwise from the top: North → North-East → East → South-East → South → South-West → West → North-West.', 'Opposite pairs: North ↔ South, East ↔ West, North-East ↔ South-West, North-West ↔ South-East.', 'A quarter turn (90°) moves you two steps on this circle; a half turn (180°) moves you four steps.'),
    keys('Four cardinal and four intermediate directions.', 'The Sun rises in the east and sets in the west.', 'A compass needle points north–south.'),
    remember('Most maps are drawn with north at the top. Look for the north arrow (N) to be sure.'),
    tip('Make a direction chart for your classroom: stick N, E, S and W cards on the four walls.'),
  ], [
    ex('Kiran faces the rising Sun in the morning. Which direction is behind him?', ['The Sun rises in the east, so he faces east.', 'The direction opposite east is west.'], 'West'),
    ex('Priya faces north and turns right by a quarter turn (90°). Which way does she face now?', ['Turning right means moving clockwise.', 'Clockwise from North, a quarter turn reaches East.'], 'East'),
  ], [
    tp('turn', (r) => {
      const s = r.int(0, 7), side = r.pick(['right', 'left']);
      const turn = r.pick([['a quarter turn (90°)', 2], ['a half turn (180°)', 4], ['an eighth of a turn (45°)', 1]] as [string, number][]);
      const end = (s + (side === 'right' ? turn[1] : -turn[1]) + 16) % 8;
      const wrongSide = (s + (side === 'right' ? -turn[1] : turn[1]) + 16) % 8;
      const name = who(r);
      return {
        type: 'mcq', prompt: `${name} faces ${DIRS[s]} and turns ${side} by ${turn[0]}. Which direction does ${name} face now?`,
        ...choose(r, DIRS[end], [DIRS[wrongSide], DIRS[(end + 1) % 8], DIRS[(end + 7) % 8], DIRS[s]]),
        hints: ['Picture the direction circle: N, NE, E, SE, S, SW, W, NW, going clockwise.', `Each 45° is one step. Move ${turn[1]} step(s) ${side === 'right' ? 'clockwise' : 'anticlockwise'}.`],
        mistakes: [{ when: 'wrong', explain: 'Check which way you turned: right is clockwise, left is anticlockwise.' }],
        solution: [`Start at ${DIRS[s]}.`, `Move ${turn[1]} step(s) ${side === 'right' ? 'clockwise' : 'anticlockwise'} on the circle.`, `You reach ${DIRS[end]}.`],
      };
    }, 2),
    mcq('sun', 'The Sun rises in the east and sets in the west.', [
      ['In the evening the Sun sets in the…', 'West', ['East', 'North', 'South'], 'It is opposite to where it rises.', 'The Sun rises in the east and sets in the west.'],
      ['You stand with your right hand towards the rising Sun. You are facing…', 'North', ['South', 'East', 'West'], 'Right hand = east.', 'With east on your right, you face north.'],
      ['The direction exactly between North and East is…', 'North-East', ['South-West', 'North-West', 'South-East'], 'Join the two names.', 'Intermediate directions are named by joining the neighbouring cardinal directions.'],
      ['Which is the opposite of South-East?', 'North-West', ['South-West', 'North-East', 'East'], 'Change both parts.', 'Opposite of south is north and opposite of east is west, so North-West.'],
      ['Which instrument shows directions using a magnetic needle?', 'A compass', ['A thermometer', 'A ruler', 'A globe'], 'Sailors carry it.', 'The magnetic needle of a compass points north–south.'],
      ['On most maps, north is at the…', 'Top', ['Bottom', 'Left side', 'Right side'], 'Look for the arrow marked N.', 'Maps are usually drawn with north at the top and show it with a north arrow.'],
    ]),
    matchT('opp', 'direction with its opposite', [
      ['North', 'South'], ['East', 'West'], ['North-East', 'South-West'], ['North-West', 'South-East'], ['South', 'North'], ['West', 'East'],
    ], ['Opposite directions are half a turn apart.', 'For intermediate directions, change both parts.']),
  ]),
  O('ts6.ss.maps.district', 'Reading a district political map', [
    h('Your district on a map'),
    photo('🗺️', 'A political map shows boundaries made by people: of countries, states, districts and mandals.'),
    p('A political map does not show hills or rivers in detail. Instead it shows how land is divided for governing it. Telangana is divided into districts (33 at present), each district into mandals, and each mandal into villages. Every district has a headquarters town where the main offices, such as the Collector’s office, are found.'),
    def('Political map', 'A map showing administrative boundaries — countries, states, districts, mandals — and important towns.'),
    def('District headquarters', 'The town from which a district is administered; on maps it is often shown with a special symbol such as a double circle or a star.'),
    def('Boundary', 'A line that marks where one area ends and the next begins; different dashed lines are used for state, district and mandal boundaries.'),
    stepsB('Read the title: which district or state is it?', 'Find the north arrow and the legend.', 'Locate the headquarters and your own mandal.', 'Name the neighbouring districts in each direction.'),
    keys('State → districts → mandals → villages.', 'Different lines show different boundaries.', 'Hyderabad is the capital of Telangana.'),
    remember('Political maps change when new districts or mandals are formed; physical features such as rivers do not.'),
    tip('Trace your district map on thin paper and mark your village, the headquarters and one river.'),
  ], [
    ex('On a district map, Town A is above Town B and the map has north at the top. In which direction is Town A from Town B?', ['North is at the top of the map.', 'Town A is above Town B, so it lies to the north.'], 'North'),
    ex('Arrange from largest to smallest: mandal, state, village, district.', ['A state is divided into districts.', 'A district is divided into mandals.', 'A mandal contains many villages.'], 'State → district → mandal → village'),
  ], [
    orderT('size', 'Arrange these units of administration from the LARGEST to the SMALLEST.', ['Country (India)', 'State (Telangana)', 'District', 'Mandal', 'Village'], ['India has many states; a state has many districts.', 'A mandal is bigger than a village.'], 'Each unit is divided into the next smaller one: country → state → district → mandal → village.'),
    mcq('read', 'Remember what a political map is for.', [
      ['A map showing district boundaries and headquarters is a…', 'Political map', ['Physical map', 'Rainfall map', 'Contour map'], 'Boundaries are drawn by governments.', 'Political maps show administrative boundaries.'],
      ['The capital of Telangana is…', 'Hyderabad', ['Warangal', 'Karimnagar', 'Khammam'], 'It is also the largest city.', 'Hyderabad is the capital city of Telangana.'],
      ['A district is divided into smaller units called…', 'Mandals', ['States', 'Countries', 'Continents'], 'Each has a Tahsildar’s office.', 'Each district in Telangana is divided into mandals.'],
      ['The town from which a district is governed is its…', 'Headquarters', ['Border', 'Legend', 'Scale'], 'The Collector’s office is there.', 'The district headquarters is the main administrative town.'],
      ['Which part of the map explains the special lines used for boundaries?', 'The legend', ['The title', 'The north arrow', 'The scale'], 'It is a box of symbols.', 'The legend (key) explains every symbol and line.'],
      ['If a map has north at the top, a town on the right-hand side of another town lies to its…', 'East', ['West', 'North', 'South'], 'Right side of a north-up map.', 'With north at the top, east is on the right.'],
    ]),
    tapT('pol', 'Tap the things you would expect to find on a district POLITICAL map.', [
      ['District boundary', true], ['Mandal boundaries', true], ['District headquarters town', true], ['Names of neighbouring districts', true], ['Main roads joining towns', true],
      ['Daily temperature', false], ['Heights of every hill', false], ['Number of birds in the forest', false],
    ], ['Political maps are about divisions made by people.', 'Weather and heights belong on other kinds of map.'], 'A political map shows boundaries, towns and the links between them.'),
  ]),
  O('ts6.ss.maps.scale', 'Map symbols and scale; making a map', [
    h('A big world on a small sheet'),
    photo('📏', 'A ruler and a scale let us turn centimetres on a map into kilometres on the ground.'),
    p('A map is much smaller than the land it shows, but every part is shrunk by the same amount. The scale tells us by how much. If the scale is 1 cm = 5 km, a road 3 cm long on the map is 15 km long on the ground.'),
    def('Scale', 'The relation between a distance on the map and the real distance on the ground, for example 1 cm = 5 km.'),
    def('Conventional symbols', 'Signs and colours that everyone agrees on: blue for water, green for forests and fields, black or red lines for roads and railways, a cross for a hospital.'),
    xp({
      title: 'What if? Changing the scale', formula: 'Real distance = map distance × km per cm',
      res: ['D', 'Real distance', 'km', 'm * s', 0],
      vars: [['m', 'Distance measured on the map', 'cm', 1, 20, 1, 4], ['s', 'Scale: km shown by 1 cm', 'km', 1, 50, 1, 5]],
      notes: [['m', 'A longer line on the map means a longer real journey.', 'A shorter line means the places are closer.'], ['s', 'Each centimetre now stands for more kilometres, so the same line means a longer journey.', 'Each centimetre stands for fewer kilometres — a more detailed map.']],
      mistakes: [['Adding map distance and scale', 'Each centimetre stands for the full scale value, so multiply.'], ['Forgetting the unit', 'The answer is a real distance, so write km.']],
      real: 'On a map where 1 cm = 5 km, a road that measures 4 cm is about 20 km long.',
    }),
    h('Making your own map'),
    stepsB('Walk around the place (your school) and note what is where.', 'Choose a scale, e.g. 1 cm = 10 m.', 'Mark north at the top.', 'Draw buildings, paths and the playground with simple symbols.', 'Add a title and a legend.'),
    keys('Scale, symbols, north arrow, title and legend make a complete map.', 'Real distance = map distance × scale value.', 'A rough sketch has no exact scale; a map uses one.'),
    remember('Blue = water, green = vegetation, brown = high land: these colours are used on maps all over the world.'),
  ], [
    ex('On a map, 1 cm = 10 km. Two towns are 6 cm apart. What is the real distance?', ['Each centimetre stands for 10 km.', '6 × 10 = 60 km.'], '60 km'),
    ex('A school map uses 1 cm = 5 m. The playground is 8 cm long on the map. How long is it really?', ['8 × 5 = 40.', 'The unit is metres, from the scale.'], '40 m'),
  ], [
    tp('scale', (r) => {
      const s = r.pick([2, 4, 5, 10, 20, 25]);
      const d = r.int(2, 9);
      const pair = r.pick(['two villages', 'the mandal office and the bus stand', 'two towns', 'the school and the railway station', 'two tanks']);
      return numQ(`On a map the scale is 1 cm = ${s} km. On the map, ${pair} are ${d} cm apart. What is the real distance in km?`, s * d,
        ['Each centimetre on the map stands for the scale value.', `Multiply ${d} by ${s}.`],
        [`Real distance = ${d} × ${s}`, `= ${s * d} km`], [{ when: String(s + d), explain: 'You added. Each centimetre stands for the same distance, so multiply.' }], 0.001, 'km');
    }, 2),
    matchT('sym', 'map colour or symbol with its meaning', [
      ['Blue', 'Rivers, tanks and seas'], ['Green', 'Forests and fields'], ['Brown', 'Hills and high land'], ['Red cross', 'Hospital'],
      ['Line with short cross-bars', 'Railway'], ['North arrow', 'Shows direction'], ['Legend', 'Explains all symbols'],
    ], ['Water is always blue.', 'Brown is used for higher land.']),
    tapT('parts', 'Tap the parts every good map should have.', [
      ['Title', true], ['North arrow', true], ['Scale', true], ['Legend (key)', true],
      ['A photograph of the map-maker', false], ['The price of the paper', false], ['A song', false],
    ], ['Think of what a stranger needs to read your map.', 'Name, direction, distance and meaning of symbols.'], 'A complete map has a title, north arrow, scale and legend.'),
  ]),
]);

// =====================================================================================
// Chapter 2 — Globe: A Model of the Earth
// =====================================================================================
const ch2 = U(2, 'Globe - A Model of the Earth', [
  O('ts6.ss.globe.shape', 'The shape of the Earth and the globe', [
    h('Is the Earth flat?'),
    photo('🌍', 'The Earth seen from space: a round planet, slightly flattened at the poles.'),
    p('Long ago many people thought the Earth was flat. Careful observers noticed clues that it is round: the hull of a ship disappears over the horizon before its mast, the Earth’s shadow on the Moon during a lunar eclipse is always curved, and travellers going steadily in one direction come back to where they started. Today photographs from space show it clearly.'),
    def('Globe', 'A small round model of the Earth that shows land and water in their true shapes and positions.'),
    def('Geoid', 'The true shape of the Earth: almost a sphere, a little flattened at the North and South Poles and bulging at the Equator.'),
    p('A globe turns on a slanting rod. The axis of the Earth is an imaginary line through the North Pole and the South Pole around which it spins. The globe’s rod is tilted because the real Earth’s axis is tilted by about 23½° from the upright.'),
    keys('The Earth is nearly round — a geoid.', 'A globe is the most accurate model of the whole Earth.', 'The axis joins the North and South Poles and is tilted.'),
    remember('A map is flat and easy to carry; a globe is round and shows shapes truly. Each has its use.'),
    tip('Shine a torch on a ball in a dark room and rotate it slowly: you will see day and night move around the “Earth”.'),
  ], [
    ex('Why does a ship’s mast stay visible after its hull has gone over the horizon?', ['The sea surface curves because the Earth is round.', 'The low hull goes behind the curve first; the tall mast is seen a little longer.'], 'Because the Earth’s surface is curved'),
    ex('Give one advantage of a globe and one of a map.', ['A globe shows true shapes, sizes and positions of continents.', 'A map can be folded, carried and drawn at large scale to show a small area in detail.'], 'Globe: true shapes; map: portable and detailed'),
  ], [
    mcq('mcq', 'Think about the evidence and the model.', [
      ['The true shape of the Earth is called a…', 'Geoid', ['Cube', 'Perfect circle', 'Flat disc'], 'Earth-shaped.', 'The Earth is nearly a sphere, flattened at the poles: a geoid.'],
      ['The imaginary line around which the Earth spins is its…', 'Axis', ['Equator', 'Orbit', 'Horizon'], 'It passes through both poles.', 'The axis joins the North and South Poles.'],
      ['Which gives the most correct picture of the whole Earth?', 'A globe', ['A map of India', 'A photograph of a village', 'A district map'], 'It is a round model.', 'Only a globe shows the whole Earth’s shapes and sizes truly.'],
      ['During a lunar eclipse the Earth’s shadow on the Moon is…', 'Curved', ['Square', 'Triangular', 'Straight'], 'Round objects cast round shadows.', 'A curved shadow every time shows the Earth is round.'],
      ['The Earth’s axis is tilted by about…', '23½°', ['90°', '0°', '45°'], 'A little more than 20°.', 'The axis leans about 23½° from the upright.'],
      ['The Earth is slightly flattened at the…', 'Poles', ['Equator', 'Tropic of Cancer', 'Prime Meridian'], 'Top and bottom.', 'The Earth bulges at the Equator and is flattened at the poles.'],
    ]),
    tapT('round', 'Tap every clue that shows the Earth is round.', [
      ['A ship’s hull disappears over the horizon before its mast', true], ['The Earth’s shadow on the Moon is always curved', true], ['Photographs taken from space', true], ['Travelling on in one direction brings you back to the start', true],
      ['The ground near my house looks flat', false], ['Rivers flow downhill', false], ['Birds fly in the sky', false],
    ], ['A clue must be different if the Earth were flat.', 'Local flat ground is too small to show the curve.'], 'Each correct clue only makes sense if the Earth’s surface curves.'),
    matchT('terms', 'word with its meaning', [
      ['Globe', 'Small round model of the Earth'], ['Axis', 'Imaginary line through the poles'], ['Geoid', 'Earth’s true shape'], ['North Pole', 'Northern end of the axis'], ['South Pole', 'Southern end of the axis'], ['Map', 'Flat drawing of the Earth or part of it'],
    ], ['The poles are the two ends of the axis.', 'A map is flat; a globe is round.']),
  ]),
  O('ts6.ss.globe.continents', 'Continents and oceans', [
    h('Land and water on the Earth'),
    photo('🚢', 'Ships cross the oceans, which cover most of the Earth’s surface.'),
    p('Turn a globe slowly and you will see far more blue than any other colour. About 71% of the Earth’s surface is water and only about 29% is land. The large masses of land are called continents and the huge bodies of salt water are called oceans.'),
    def('Continent', 'A very large, continuous mass of land. There are seven: Asia, Africa, North America, South America, Antarctica, Europe and Australia.'),
    def('Ocean', 'A huge body of salt water. There are five: Pacific, Atlantic, Indian, Southern and Arctic.'),
    bars(['Asia', 'Africa', 'N. America', 'S. America', 'Antarctica', 'Europe', 'Australia'], [44, 30, 24, 18, 14, 10, 8], 'million km²', 'About areas of the seven continents, largest to smallest (rounded).'),
    keys('Seven continents; Asia is the largest, Australia the smallest.', 'Five oceans; the Pacific is the largest and deepest.', 'India is in Asia, with the Indian Ocean to its south.'),
    remember('Antarctica, around the South Pole, is covered by thick ice and has no permanent population.'),
    tip('Make up a sentence to remember the oceans from largest to smallest: “Please Always Invite Some Aunts” — Pacific, Atlantic, Indian, Southern, Arctic.'),
  ], [
    ex('In which continent is India, and which ocean washes its southern coast?', ['India is in the southern part of Asia.', 'The ocean named after our country lies to its south.'], 'Asia; the Indian Ocean'),
    ex('If 71% of the Earth’s surface is water, what percentage is land?', ['Whole surface = 100%.', '100 − 71 = 29.'], 'About 29%'),
  ], [
    mcq('mcq', 'Seven continents, five oceans.', [
      ['The largest continent is…', 'Asia', ['Africa', 'Europe', 'Australia'], 'India is part of it.', 'Asia is the largest continent in both area and population.'],
      ['The largest ocean is the…', 'Pacific Ocean', ['Indian Ocean', 'Atlantic Ocean', 'Arctic Ocean'], 'It lies between Asia and the Americas.', 'The Pacific is the largest and deepest ocean.'],
      ['Which continent is covered almost entirely by ice?', 'Antarctica', ['Australia', 'Europe', 'Africa'], 'Around the South Pole.', 'Antarctica lies around the South Pole under thick ice.'],
      ['The smallest continent is…', 'Australia', ['Europe', 'Antarctica', 'South America'], 'It is sometimes called the island continent.', 'Australia is the smallest continent.'],
      ['The ocean around the North Pole is the…', 'Arctic Ocean', ['Southern Ocean', 'Pacific Ocean', 'Indian Ocean'], 'It is the smallest ocean.', 'The Arctic Ocean surrounds the North Pole.'],
      ['Roughly what part of the Earth’s surface is water?', 'About 71%', ['About 29%', 'About 50%', 'About 10%'], 'Much more than half.', 'About 71% of the surface is water.'],
    ]),
    orderT('size', 'Arrange these continents from LARGEST to SMALLEST.', ['Asia', 'Africa', 'North America', 'South America', 'Antarctica', 'Europe', 'Australia'], ['Asia is first.', 'Australia is last.'], 'By area: Asia, Africa, North America, South America, Antarctica, Europe, Australia.'),
    tp('pct', (r) => {
      const w = r.pick([71, 70, 72]);
      const total = r.pick([100, 200, 500, 1000]);
      return numQ(`Imagine the Earth’s surface divided into ${total} equal squares. If about ${w}% of the surface is water, about how many squares would be LAND?`, total * (100 - w) / 100,
        ['Land % = 100 − water %.', `Find ${100 - w}% of ${total}.`],
        [`Land = 100 − ${w} = ${100 - w}%`, `${100 - w}% of ${total} = ${total * (100 - w) / 100}`], [{ when: String(total * w / 100), explain: 'That is the water part. The question asks for land.' }], 0.001, 'squares');
    }, 2),
  ]),
  O('ts6.ss.globe.lines', 'Lines on the globe: latitudes, longitudes and time', [
    h('A net of lines to find any place'),
    photo('🕰️', 'Lines of longitude help us work out the time in different places on the Earth.'),
    p('Imaginary lines drawn on the globe form a grid, like the lines in a notebook, so we can give any place an exact address.'),
    def('Equator', 'The imaginary line around the middle of the Earth, halfway between the poles. It is 0° latitude and divides the Earth into the Northern and Southern Hemispheres.'),
    def('Latitudes (parallels)', 'Circles drawn parallel to the Equator, numbered from 0° at the Equator to 90° N and 90° S at the poles. They get smaller towards the poles.'),
    def('Longitudes (meridians)', 'Half-circles joining the North and South Poles. The Prime Meridian (0°) passes through Greenwich near London; others go up to 180° east and 180° west.'),
    stepsB('Tropic of Cancer: 23½° N (it passes through the middle of India).', 'Tropic of Capricorn: 23½° S.', 'Arctic Circle: 66½° N; Antarctic Circle: 66½° S.', 'The Prime Meridian and the 180° line divide the Earth into Eastern and Western Hemispheres.'),
    h('Longitude and time'),
    p('The Earth turns once (360°) in 24 hours. So in 1 hour it turns 360 ÷ 24 = 15°, and 1° takes 4 minutes. Places to the east see the Sun earlier, so their clocks are ahead. India uses one time for the whole country, based on 82½° E, which is 5½ hours ahead of Greenwich.'),
    xp({
      title: 'What if? Time difference between two places', formula: 'Time difference (minutes) = difference in longitude × 4',
      res: ['T', 'Time difference', 'minutes', 'd * 4', 0],
      vars: [['d', 'Difference in longitude', '°', 1, 180, 1, 15]],
      notes: [['d', 'Places farther apart east–west have a bigger time difference: 4 more minutes for each degree.', 'Places closer in longitude have nearly the same time.']],
      mistakes: [['Using latitude', 'Time depends on longitude (east–west), not latitude.'], ['Multiplying by 15', '15° is one hour; each single degree is 4 minutes.']],
      real: '82½° × 4 = 330 minutes = 5½ hours: that is why Indian time is 5½ hours ahead of Greenwich.',
    }),
    keys('Equator 0°; latitudes up to 90° N/S.', 'Prime Meridian 0° at Greenwich; longitudes up to 180° E/W.', '15° = 1 hour; 1° = 4 minutes.'),
    remember('Latitude tells how far north or south; longitude tells how far east or west.'),
  ], [
    ex('Two places differ by 30° of longitude. What is the time difference?', ['1° = 4 minutes.', '30 × 4 = 120 minutes.', '120 minutes = 2 hours.'], '2 hours'),
    ex('It is 12 noon at Greenwich (0°). Is the time at a place on 45° E earlier or later? By how much?', ['Places to the east are ahead.', '45 × 4 = 180 minutes = 3 hours.'], 'Later: 3 p.m.'),
  ], [
    tp('time', (r) => {
      const d = r.pick([5, 10, 15, 20, 25, 30, 45, 60, 75, 90]);
      return numQ(`Two places are ${d}° apart in longitude. What is the difference in their local times, in minutes?`, d * 4,
        ['The Earth turns 1° every 4 minutes.', `Multiply ${d} by 4.`],
        [`${d} × 4 = ${d * 4} minutes`, d * 4 >= 60 ? `= ${Math.floor(d * 4 / 60)} h ${d * 4 % 60} min` : 'That is less than one hour.'],
        [{ when: String(d * 15), explain: '15° make one hour; each degree is 4 minutes, so multiply by 4, not 15.' }], 0.001, 'minutes');
    }, 2),
    mcq('mcq', 'Latitudes measure north–south; longitudes join the poles.', [
      ['The Equator is at…', '0° latitude', ['90° latitude', '0° longitude', '180° longitude'], 'It is the starting line for latitudes.', 'The Equator is 0° latitude.'],
      ['The Prime Meridian passes through…', 'Greenwich, near London', ['New Delhi', 'Hyderabad', 'The North Pole only'], 'An observatory in England.', 'The 0° longitude passes through Greenwich.'],
      ['Which line of latitude passes through India?', 'Tropic of Cancer', ['Tropic of Capricorn', 'Arctic Circle', 'Antarctic Circle'], '23½° North.', 'The Tropic of Cancer (23½° N) crosses the middle of India.'],
      ['Lines joining the North Pole and the South Pole are…', 'Longitudes (meridians)', ['Latitudes', 'Contours', 'Tropics'], 'They all meet at the poles.', 'Meridians run from pole to pole.'],
      ['How many degrees does the Earth turn in one hour?', '15°', ['4°', '24°', '360°'], '360 ÷ 24.', '360° ÷ 24 hours = 15° per hour.'],
      ['The North Pole is at latitude…', '90° N', ['0°', '23½° N', '66½° N'], 'The farthest north.', 'Latitudes end at 90° at each pole.'],
    ]),
    matchT('lines', 'line on the globe with its value', [
      ['Equator', '0° latitude'], ['Tropic of Cancer', '23½° N'], ['Tropic of Capricorn', '23½° S'], ['Arctic Circle', '66½° N'], ['Prime Meridian', '0° longitude'], ['North Pole', '90° N'], ['Indian Standard Time meridian', '82½° E'],
    ], ['Tropics are 23½° from the Equator.', 'The Arctic Circle is 66½° N.']),
  ]),
]);


// =====================================================================================
// Chapter 3 — Land Forms (Part A); Penamakuru — A Village in the Krishna Delta (Part B)
// =====================================================================================
const ch3 = U(3, 'Land Forms (Part A); Penamakuru - A Village in the Krishna Delta (Part B)', [
  O('ts6.ss.land.forms', 'Landforms: mountains, plateaus, plains and deltas', [
    h('The many shapes of land'),
    photo('🏞️', 'Hills, valleys, plains and rivers: the surface of the Earth is never the same everywhere.'),
    p('Travel from Hyderabad to the coast at Machilipatnam and you will notice the land changing. Around Hyderabad there are rocky hillocks and uneven high ground. As you go east the land becomes lower and flatter, and near the sea it is almost perfectly level, green with paddy fields and criss-crossed by canals. Each of these shapes of land is called a landform.'),
    def('Mountain', 'Land that rises steeply far above its surroundings, with a narrow top (peak). Example: the Himalayas.'),
    def('Plateau', 'A large area of raised land that is fairly flat on top, often with steep sides. Example: the Deccan Plateau, on which Telangana lies.'),
    def('Plain', 'A wide stretch of low, flat land, usually made by rivers depositing soil. Example: the Ganga plains.'),
    def('Delta', 'A low, flat, fan- or triangle-shaped land formed at a river’s mouth where the river slows down, splits into branches and drops the fine soil (silt) it carries.'),
    stepsB('A river flows fast in the hills and carries sand and silt.', 'On the plains it slows down and starts to drop the load.', 'Near the sea it moves very slowly and splits into many branches (distributaries).', 'Layers of silt build up new land: a delta.'),
    keys('Mountains: high and steep; plateaus: high and flat-topped; plains: low and flat.', 'Deltas form at river mouths from deposited silt.', 'The Krishna and Godavari form deltas on the Bay of Bengal coast.'),
    remember('Delta soils are fertile because the river brings fresh silt every flood season.'),
  ], [
    ex('Telangana is high land with a fairly flat top, about 300–600 m above sea level. Which landform is it?', ['It is raised land, not steep peaks.', 'Its top is fairly level over a wide area.'], 'A plateau (the Deccan Plateau)'),
    ex('Why are deltas usually found where rivers meet the sea and not in the hills?', ['In the hills a river flows fast and carries its load away.', 'Near the sea it slows down and drops its silt.', 'The dropped silt builds up low flat land.'], 'Because the river slows down and deposits silt at its mouth'),
  ], [
    mcq('mcq', 'Compare height, slope and shape of the top.', [
      ['A wide, high land with a flat top is a…', 'Plateau', ['Plain', 'Delta', 'Valley'], 'Like a table.', 'A plateau is raised land with a fairly flat top.'],
      ['The fan-shaped land at a river’s mouth is a…', 'Delta', ['Plateau', 'Peak', 'Hill'], 'Made of silt.', 'A delta forms where a river deposits silt at its mouth.'],
      ['Telangana lies on the…', 'Deccan Plateau', ['Ganga plains', 'Thar desert', 'Himalayas'], 'Old raised land of south India.', 'Telangana is part of the Deccan Plateau.'],
      ['Branches into which a river splits near the sea are called…', 'Distributaries', ['Tributaries', 'Peaks', 'Plateaus'], 'They distribute the water.', 'Distributaries carry water away from the main river towards the sea.'],
      ['Why are delta soils very fertile?', 'Rivers bring fresh silt every year', ['They are rocky', 'They are high above sea level', 'They have no water'], 'Think of floods.', 'Each flood season adds a new layer of fine fertile silt.'],
      ['Which landform rises steeply with a narrow top?', 'Mountain', ['Plain', 'Plateau', 'Delta'], 'Think of a peak.', 'Mountains rise steeply to peaks.'],
    ]),
    orderT('delta', 'Put the steps in the making of a delta in order.', ['The river flows fast in the hills carrying sand and silt', 'It slows down on the plains', 'Near the sea it splits into branches', 'Silt settles layer by layer', 'New flat land — a delta — is formed'], ['Start in the hills.', 'The delta is the result, so it is last.'], 'Fast flow carries the load; slow flow near the sea drops it and builds a delta.'),
    matchT('forms', 'landform with its example', [
      ['Mountain', 'Himalayas'], ['Plateau', 'Deccan'], ['Plain', 'Ganga plains'], ['Delta', 'Krishna–Godavari mouths'], ['Hill', 'A small rise like Ananthagiri hills'], ['Valley', 'Low land between hills where a river flows'],
    ], ['Telangana is on a plateau.', 'Deltas are at river mouths.']),
  ]),
  O('ts6.ss.land.delta', 'Penamakuru: soil, water and irrigation in the delta', [
    h('A village surrounded by canals'),
    photo('🌾', 'Paddy fields in a delta village, green and flooded with canal water.'),
    p('Penamakuru is a village in the Krishna delta in Andhra Pradesh. The land is flat and low, the soil is deep, dark and soft (alluvial soil), and water is everywhere: canals, channels and drains run between the fields. Rainfall here is moderate, but farmers do not depend only on rain because canals bring river water to every field.'),
    def('Alluvial soil', 'Fine, fertile soil laid down by rivers. It holds water well and is easy to plough.'),
    def('Canal irrigation', 'Bringing river water to fields through man-made channels. In the Krishna delta, a barrage across the river at Vijayawada (the Prakasam Barrage) raises the water level and sends it into canals.'),
    p('Because water is available for most of the year, farmers can grow two or even three crops on the same land: paddy in the rainy (kharif) season, another crop of paddy or pulses such as black gram in the winter (rabi) season, and sugarcane, bananas, coconuts and vegetables on other plots. Some low fields have been turned into ponds for fish and prawn farming.'),
    keys('Flat land + fertile alluvium + canal water = rich farming.', 'Two or three crops a year are possible.', 'Main crops: paddy, sugarcane, banana, coconut, pulses, vegetables.'),
    remember('Too much water can also be a problem: drains are needed so that fields do not stay waterlogged after heavy rain or cyclones.'),
    tip('Compare: a field watered only by rain can usually grow one crop a year; a canal-fed field can grow two or three.'),
  ], [
    ex('Why can Penamakuru’s farmers grow more than one crop each year?', ['Canals bring river water for most of the year.', 'So farmers need not wait for rain.', 'The fertile alluvial soil supports crop after crop.'], 'Assured canal water and fertile alluvial soil'),
    ex('A farmer grows 2 crops a year on 3 acres. How many “crop-acres” does he harvest in a year?', ['Each acre is cropped twice.', '3 × 2 = 6.'], '6 crop-acres'),
  ], [
    tp('crops', (r) => {
      const ac = r.int(2, 9), c = r.pick([2, 3]);
      const n = who(r);
      return numQ(`${n}’s family has ${ac} acres of canal-irrigated land in a delta village and grows ${c} crops a year on all of it. How many acres of crop do they raise in a year (counting each crop separately)?`, ac * c,
        ['Each acre is used once for every crop.', `Multiply ${ac} acres by ${c} crops.`], [`${ac} × ${c} = ${ac * c} acres of crop in the year`], [{ when: String(ac + c), explain: 'You added. Each of the acres is cropped every season, so multiply.' }], 0.001, 'acres');
    }, 2),
    mcq('mcq', 'Think of soil, water and crops in a delta.', [
      ['The soil of the Krishna delta is mainly…', 'Alluvial soil', ['Sandy desert soil', 'Rocky hill soil', 'Snow-covered soil'], 'Laid down by the river.', 'Rivers deposit fine alluvial soil in deltas.'],
      ['How do most delta fields get water?', 'Through canals from the river', ['Only from deep bore wells', 'From melting snow', 'They need no water'], 'A barrage feeds them.', 'Canals carry river water to the fields.'],
      ['The main crop of Penamakuru is…', 'Paddy', ['Tea', 'Apples', 'Wheat only'], 'It needs a lot of water.', 'With plenty of canal water, paddy is the main crop.'],
      ['The Prakasam Barrage is across the river…', 'Krishna, at Vijayawada', ['Godavari, at Bhadrachalam', 'Musi, at Hyderabad', 'Ganga, at Patna'], 'It feeds the Krishna delta canals.', 'The barrage at Vijayawada raises the Krishna’s water into canals.'],
      ['Why do delta villages also need drains?', 'To remove extra water after heavy rain', ['To bring sea water in', 'To dry up the river', 'To water the hills'], 'Too much water harms crops.', 'Drains stop the low fields from staying waterlogged.'],
      ['Ponds for fish and prawns in the delta are called…', 'Aquaculture ponds', ['Bore wells', 'Check dams', 'Terraces'], 'Aqua = water.', 'Rearing fish and prawns in ponds is aquaculture.'],
    ]),
    tapT('tap', 'Tap the features of a delta village like Penamakuru.', [
      ['Flat, low land', true], ['Fertile alluvial soil', true], ['Canals and drains between fields', true], ['Two or three crops a year', true], ['Paddy, banana and coconut', true],
      ['Steep rocky slopes', false], ['Snow in winter', false], ['Hardly any surface water', false],
    ], ['Picture flooded paddy fields and canals.', 'Steep slopes belong to hills.'], 'A delta is flat, fertile and well watered.'),
  ]),
  O('ts6.ss.land.live', 'Land, tenancy, livelihoods and markets in the delta', [
    h('Who owns the land, who works on it?'),
    photo('🧑‍🌾', 'Farmers and farm workers together grow the crops of the delta.'),
    p('In a delta village, not everyone owns land. A few families own large farms, many own a small plot, and many own none at all. Land is so valuable that some owners do not farm it themselves: they rent it out to others. People who own no land work in other people’s fields for wages.'),
    def('Tenant farmer', 'A farmer who cultivates land owned by someone else and pays rent — in cash or as a fixed number of bags of grain per acre — to the owner.'),
    def('Agricultural labourer', 'A person who works on others’ fields for daily wages: transplanting, weeding, harvesting.'),
    p('Tenants carry big risks. They pay for seeds, fertilisers and labour and must give the fixed rent even if floods or pests spoil the crop. Machines such as harvesters now do some work quickly, which reduces the number of days of work for labourers. Many young people look for jobs in towns as well.'),
    h('Selling the harvest'),
    p('Paddy is sold to traders or rice mills, or at government procurement centres; bananas and coconuts go to traders who carry them to cities. Prawns and fish are packed in ice and sent long distances, even abroad. Shops in the village sell fertiliser, seeds and daily goods.'),
    keys('Big landowners, small farmers, tenants and landless labourers live side by side.', 'Tenants pay a fixed rent and carry the risk of crop loss.', 'Machines change the work available to labourers.'),
    remember('The same rich land supports very different lives depending on whether a family owns land, rents it or works for wages.'),
  ], [
    ex('A tenant agrees to pay 12 bags of paddy per acre as rent and farms 4 acres. How many bags must he give the owner?', ['Rent per acre × acres.', '12 × 4 = 48.'], '48 bags'),
    ex('Why does a flood hurt a tenant more than the landowner?', ['The tenant has spent money on seeds, fertiliser and labour.', 'He still owes the fixed rent.', 'The owner receives rent; the tenant loses both his crop and his costs.'], 'The tenant bears the cost and still owes rent'),
  ], [
    tp('rent', (r) => {
      const per = r.pick([8, 10, 12, 15, 18]), ac = r.int(2, 6);
      return numQ(`(Illustrative) A tenant farmer rents ${ac} acres and has agreed to pay ${per} bags of paddy per acre as rent. How many bags of paddy must he pay in all?`, per * ac,
        ['Rent is the same for each acre.', `${per} × ${ac}`], [`${per} bags × ${ac} acres = ${per * ac} bags`], [{ when: String(per + ac), explain: 'You added. The rent is paid for each acre, so multiply.' }], 0.001, 'bags');
    }, 2),
    matchT('who', 'person in the village with their situation', [
      ['Big landowner', 'Owns many acres, may rent some out'], ['Small farmer', 'Owns and farms a small plot'], ['Tenant farmer', 'Farms another’s land and pays rent'], ['Agricultural labourer', 'Owns no land, works for daily wages'], ['Rice mill owner', 'Buys paddy and turns it into rice'], ['Trader', 'Buys produce and sells it in towns'],
    ], ['Ask: does the person own land, rent it or work for wages?', 'Mill owners and traders buy the harvest.']),
    mcq('mcq', 'Think about risk and income.', [
      ['A person who farms someone else’s land for rent is a…', 'Tenant farmer', ['Landlord', 'Trader', 'Mill owner'], 'He does not own the land.', 'A tenant cultivates rented land.'],
      ['Agricultural labourers earn mainly by…', 'Daily wages for farm work', ['Collecting rent', 'Selling land', 'Running mills'], 'They own no land.', 'They are paid wages for the days they work.'],
      ['If floods destroy the crop, a tenant who pays fixed rent…', 'Still has to pay the rent', ['Pays nothing', 'Gets the land free', 'Becomes the owner'], 'Fixed means it does not change.', 'Fixed rent must be paid whatever the harvest.'],
      ['Harvesting machines mostly reduce…', 'The days of work for labourers', ['The size of fields', 'The rainfall', 'The number of canals'], 'Machines do the work faster.', 'Machines finish work quickly, so fewer labour days are needed.'],
      ['Where is paddy from the village often sold?', 'To rice mills, traders or procurement centres', ['Only in the farmer’s house', 'It is never sold', 'Only abroad'], 'Who turns paddy into rice?', 'Mills, traders and government centres buy the paddy.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 4 — Dokur: A Village on the Plateau
// =====================================================================================
const ch4 = U(4, 'Dokur - A Village on the Plateau', [
  O('ts6.ss.dokur.plateau', 'The Deccan Plateau: land and rocks', [
    h('Life on high, rocky land'),
    photo('🪨', 'Huge rounded granite boulders are a common sight on the Telangana plateau.'),
    p('Dokur is a village in Mahabubnagar district of Telangana. Unlike the flat, wet delta, the land here is uneven: small hills, piles of giant boulders, rocky patches and gentle slopes. This is the Deccan Plateau, among the oldest land in India, made of hard rocks such as granite.'),
    def('Deccan Plateau', 'The large plateau of peninsular India, lying between the Western and Eastern Ghats. Most of Telangana lies on it at about 300–600 m above sea level.'),
    p('Because the plateau slopes gently from west to east, the big rivers — the Godavari and the Krishna — flow east to the Bay of Bengal. But many villages like Dokur are far from these rivers and are on higher ground, so river water does not reach them easily.'),
    keys('Plateau land: uneven, rocky, old and hard.', 'It slopes from west to east, so rivers flow east.', 'Many plateau villages are far from big rivers.'),
    remember('Hard rock lets little rainwater soak in, so water is scarce on much of the plateau.'),
    tip('Compare the two villages: Penamakuru (low, flat, wet delta) and Dokur (high, rocky, dry plateau).'),
  ], [
    ex('Why do the Godavari and the Krishna flow towards the east?', ['The Deccan Plateau is higher in the west.', 'It slopes gently down towards the east.', 'Water flows downhill.'], 'Because the plateau slopes from west to east'),
    ex('Give two ways Dokur’s land differs from Penamakuru’s.', ['Dokur is high and uneven; Penamakuru is low and flat.', 'Dokur has rocky red soil and little water; Penamakuru has alluvial soil and canals.'], 'Height/shape and soil/water'),
  ], [
    mcq('mcq', 'Plateau = high, hard, uneven.', [
      ['Dokur is in which district of Telangana?', 'Mahabubnagar', ['Hyderabad', 'Adilabad', 'Khammam'], 'A district in southern Telangana.', 'Dokur is a plateau village in Mahabubnagar district.'],
      ['The rock commonly seen as huge boulders in Telangana is…', 'Granite', ['Marble', 'Coal', 'Sandstone only'], 'Hard, grey and speckled.', 'Telangana’s boulders are mostly ancient granite.'],
      ['Most of Telangana lies at about…', '300–600 m above sea level', ['0–10 m', '3,000–5,000 m', 'Below sea level'], 'Hyderabad is about 500 m.', 'The Telangana plateau is mostly 300–600 m high.'],
      ['The Deccan Plateau slopes towards the…', 'East', ['West', 'North', 'It is perfectly flat'], 'Where do our rivers end?', 'It slopes east, which is why the rivers flow to the Bay of Bengal.'],
      ['Why does water not easily reach Dokur’s fields from big rivers?', 'The village is on higher ground far from the rivers', ['There are no rivers in India', 'River water is salty', 'Rivers flow uphill'], 'Water does not climb.', 'River water cannot flow up to high, distant villages without big projects.'],
    ]),
    tapT('cmp', 'Tap the features that describe DOKUR (the plateau village), not Penamakuru (the delta village).', [
      ['Rocky, uneven high land', true], ['Red soil and boulders', true], ['Depends on rain, wells and bore wells', true], ['Dry-land crops like jowar', true],
      ['Flat, low land with canals', false], ['Fresh alluvial soil from floods', false], ['Two or three crops a year with canal water', false],
    ], ['Delta = wet and flat.', 'Plateau = dry and rocky.'], 'Dokur is high, rocky and dry; canals and alluvium belong to the delta.'),
    tapT('tap', 'Tap the features of the Deccan Plateau.', [
      ['Hard, ancient rocks', true], ['Uneven land with hillocks', true], ['Slopes gently to the east', true], ['Granite boulders', true],
      ['Fresh river silt every year', false], ['Snow-capped peaks', false], ['Land below sea level', false],
    ], ['Think of the land around Hyderabad.', 'Fresh silt belongs to deltas.'], 'The plateau is old, hard, uneven land sloping east.'),
  ]),
  O('ts6.ss.dokur.water', 'Rainfall, soils, wells and bore wells', [
    h('Every drop counts'),
    photo('💧', 'On the dry plateau, water from wells and tanks decides what can be grown.'),
    p('Dokur gets most of its rain from the south-west monsoon between June and September, and only about 600–700 mm in a year — much less than the north-east of Telangana. Some years the rains fail. The soil is mostly red soil (chalka): light, often sandy, it dries quickly and does not hold much water. In some low patches there is black soil, which holds moisture longer.'),
    def('Tank (cheruvu)', 'A pond made by building an earthen wall (bund) across a slope to store rainwater; it irrigates fields below and recharges wells.'),
    def('Groundwater', 'Water stored underground in cracks and spaces in rocks, reached by wells and bore wells.'),
    def('Bore well', 'A narrow, deep hole drilled by machine to pump up groundwater from deep inside rocks.'),
    p('Earlier, farmers used open wells and tanks. Later many drilled bore wells with electric pumps. When too many bore wells pump water faster than rain can refill the ground, the water table falls: wells dry up and bore wells must go deeper and deeper. This costs money and some farmers fall into debt when a bore well fails.'),
    bars(['Earlier', 'Some years later', 'Now'], [30, 90, 200], 'm deep', 'Illustrative: bore wells have to be drilled deeper as the groundwater level falls.'),
    keys('Low, uncertain rainfall; red soils dry quickly.', 'Tanks store rain and recharge groundwater.', 'Overuse of bore wells lowers the water table.'),
    remember('Restoring old tanks and harvesting rain helps refill groundwater for everyone.'),
  ], [
    ex('A bore well was 60 m deep. Five years later water is found only at 150 m. How much deeper is the water now?', ['150 − 60 = 90.'], '90 m deeper'),
    ex('Why do bore wells in a village dry up when many new ones are drilled?', ['All of them draw from the same underground store.', 'Rain refills it only a little each year.', 'If more is taken out than goes in, the level falls.'], 'Too much water is pumped out compared with what rain puts back'),
  ], [
    tp('deep', (r) => {
      const a = r.pick([40, 50, 60, 80, 100]), b = a + r.pick([30, 50, 70, 90, 120]);
      return numQ(`(Illustrative) In a plateau village the groundwater was once reached at ${a} m. Now bore wells find water only at ${b} m. By how many metres has the water level fallen?`, b - a,
        ['Find the difference between the two depths.', `${b} − ${a}`], [`${b} − ${a} = ${b - a} m`], [{ when: String(a + b), explain: 'You added. The fall is the difference between the depths, so subtract.' }], 0.001, 'm');
    }, 2),
    mcq('mcq', 'Think of how water reaches plateau fields.', [
      ['Dokur’s rainfall is…', 'Low and uncertain', ['Very heavy all year', 'Snowfall', 'Always the same'], 'About 600–700 mm a year.', 'The southern plateau gets low and uncertain rainfall.'],
      ['Red soil (chalka) is…', 'Light and dries quickly', ['Very sticky and holds water for months', 'Made of river silt', 'Salty sea soil'], 'It cannot hold much water.', 'Red soils are light and lose moisture quickly.'],
      ['A cheruvu is a…', 'Village tank storing rainwater', ['Kind of soil', 'Crop', 'Bore well pump'], 'It has an earthen bund.', 'A cheruvu is a tank that stores runoff.'],
      ['When too many bore wells pump water, the water table…', 'Falls', ['Rises', 'Stays the same', 'Turns salty at once'], 'More taken out than put back.', 'Overpumping lowers the groundwater level.'],
      ['Which helps to recharge groundwater?', 'Restoring tanks and harvesting rainwater', ['Drilling more bore wells', 'Cutting trees', 'Covering soil with concrete'], 'Help rain soak in.', 'Tanks and rain pits let water soak back into the ground.'],
      ['Most rain in Telangana falls between…', 'June and September', ['December and February', 'March and April', 'Every day equally'], 'The south-west monsoon.', 'The south-west monsoon brings rain from June to September.'],
    ]),
    tapT('tap', 'Tap the actions that save or recharge water in a plateau village.', [
      ['Desilting the village tank', true], ['Digging rainwater pits', true], ['Drip irrigation', true], ['Growing crops that need less water', true],
      ['Pumping bore wells all day and night', false], ['Letting rainwater run off the fields', false], ['Cutting trees on the slopes', false],
    ], ['Help water soak in and use less of it.', 'Run-off and overpumping waste water.'], 'Storing rain, recharging the ground and using less water protect the water table.'),
  ]),
  O('ts6.ss.dokur.life', 'Crops, livelihoods and settlement in Dokur', [
    h('Making a living on dry land'),
    photo('🌽', 'Dry-land crops such as maize, jowar and groundnut suit the plateau.'),
    p('With little water, Dokur’s farmers grow crops that can survive dry spells: jowar, maize, red gram, groundnut and castor, mostly in the rainy season. Where a well or bore well gives water, they grow paddy or vegetables. Most families also keep cattle, buffaloes, sheep or goats.'),
    def('Dry-land farming', 'Growing crops using only rainfall, choosing crops that need little water.'),
    def('Migration', 'Moving to another place for work, for a season or for good.'),
    p('Farm work in a dry village lasts only a few months. In the dry season many people go to towns such as Hyderabad or Mumbai to work in construction and return for sowing. Government work programmes, such as the rural employment guarantee scheme, also give some days of paid work near home.'),
    p('Dokur’s houses are built close together in one cluster, near the tank and the temple, with fields spread around. This kind of compact village is common where water sources are few.'),
    keys('Dry crops: jowar, maize, groundnut, red gram, castor.', 'Livestock is an important extra income.', 'Seasonal migration for work is common.'),
    remember('Plateau farmers depend on rain, wells and tanks; delta farmers depend on canals.'),
  ], [
    ex('Why do many people from Dokur go to cities after the harvest?', ['Without irrigation there is little farm work in the dry season.', 'Cities offer construction and other jobs.', 'They return for sowing when the rains come.'], 'To find work in the dry season'),
    ex('Which crop would a Dokur farmer without a bore well choose: paddy or jowar? Why?', ['Paddy needs standing water for months.', 'Jowar needs much less water.'], 'Jowar, because it needs little water'),
  ], [
    tp('days', (r) => {
      const farm = r.pick([90, 100, 120, 150]), mig = r.pick([60, 90, 120, 150]);
      const n = who(r);
      return numQ(`(Illustrative) ${n}’s father gets ${farm} days of farm work in Dokur each year and ${mig} days of building work in Hyderabad. How many days of paid work does he get in all?`, farm + mig,
        ['Add the two kinds of work.', `${farm} + ${mig}`], [`${farm} + ${mig} = ${farm + mig} days`], [], 0.001, 'days');
    }, 1),
    tapT('dry', 'Tap the crops suited to dry-land farming on the plateau.', [
      ['Jowar', true], ['Maize', true], ['Groundnut', true], ['Red gram', true], ['Castor', true],
      ['Paddy without any irrigation', false], ['Sugarcane without any irrigation', false], ['Tea', false],
    ], ['Choose crops that need little water.', 'Paddy and sugarcane are thirsty crops.'], 'Millets, pulses and oilseeds survive with little rain.'),
    mcq('mcq', 'Think about water and work.', [
      ['Seasonal migration means…', 'Going away for work for part of the year', ['Moving house every day', 'Never leaving the village', 'Buying land in a city'], 'People return for sowing.', 'Families go for work in the dry season and come back.'],
      ['Besides crops, plateau families earn from…', 'Cattle, sheep and goats', ['Fishing in the sea', 'Tea gardens', 'Snow sports'], 'Animals graze on the slopes.', 'Livestock gives milk, wool, meat and income.'],
      ['Dokur’s houses are…', 'Built close together in one cluster', ['Scattered one per hill', 'On boats', 'Underground'], 'Near the tank and the temple.', 'A compact village grows around its few water sources.'],
      ['Where water is available from a bore well, a farmer may grow…', 'Paddy or vegetables', ['Only castor', 'Only grass', 'Nothing'], 'Irrigation allows thirstier crops.', 'Assured water makes paddy and vegetables possible.'],
      ['Which government programme gives paid work in villages?', 'The rural employment guarantee scheme', ['The railway timetable', 'The census', 'The weather report'], 'It guarantees days of work.', 'It provides wage work near home.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 5 — Penugolu: A Village on the Hills
// =====================================================================================
const ch5 = U(5, 'Penugolu - A Village on the Hills', [
  O('ts6.ss.hills.ghats', 'The Eastern Ghats and forested hills', [
    h('A village among forests and hills'),
    photo('🌳', 'Thick forests of teak and other trees cover the hills of north-eastern Telangana.'),
    p('Penugolu is a small Koya village in the hills and forests near the Godavari, in north-eastern Telangana. To reach it you leave the bus at the road and walk along a forest path, cross streams and climb. The hills here are part of the broken chain of the Eastern Ghats.'),
    def('Eastern Ghats', 'A broken chain of hills along the eastern side of peninsular India, cut through by rivers such as the Godavari and the Krishna.'),
    def('Western Ghats', 'A long, continuous, higher range along the west coast of India; it receives heavy rain.'),
    p('These hills get more rain than the south of Telangana, and are covered by mixed deciduous forests of teak, bamboo, mahua (ippa), tendu and many other trees. Wild animals such as deer, wild boar and peacocks live there. Streams flow down the slopes into the Godavari.'),
    keys('The Eastern Ghats are broken by rivers; the Western Ghats are continuous.', 'North-eastern Telangana has hills, forests and higher rainfall.', 'Koya and other Adivasi communities live in these forests.'),
    remember('Forests protect soil from being washed away and keep streams flowing.'),
  ], [
    ex('How are the Eastern Ghats different from the Western Ghats?', ['The Western Ghats are higher and run without a break along the west coast.', 'The Eastern Ghats are lower and broken into pieces by large rivers.'], 'Eastern Ghats: lower and broken; Western Ghats: higher and continuous'),
    ex('Give two differences between Penugolu and Dokur.', ['Penugolu is on forested hills; Dokur is on open, rocky plateau.', 'Penugolu gets more rain; Dokur is dry.'], 'Forest hills and more rain vs. dry, open plateau'),
  ], [
    mcq('mcq', 'Hills, forests and rain.', [
      ['The Eastern Ghats are…', 'A broken chain of hills', ['A continuous high range', 'A desert', 'A delta'], 'Rivers cut through them.', 'The Godavari and Krishna cut the Eastern Ghats into separate hill groups.'],
      ['Which tree’s flowers (ippa) are collected by Adivasi families?', 'Mahua', ['Coconut', 'Apple', 'Pine'], 'Its Telugu name is ippa.', 'Mahua (ippa) flowers are gathered and sold or used.'],
      ['Penugolu’s people are mostly…', 'Koya Adivasis', ['Fishermen of the coast', 'Desert herders', 'City factory workers'], 'A tribal community of the Godavari forests.', 'The Koyas are a major Adivasi community of these forests.'],
      ['Compared with Dokur, Penugolu gets…', 'More rainfall', ['Less rainfall', 'Snowfall', 'No rain at all'], 'Think of the thick forests.', 'North-eastern Telangana receives more rain.'],
      ['Which river flows near the forests of Penugolu?', 'Godavari', ['Ganga', 'Narmada', 'Kaveri'], 'The largest river of Telangana.', 'The Godavari flows through north-eastern Telangana.'],
    ]),
    matchT('three', 'village with its setting', [
      ['Penamakuru', 'Krishna delta — flat, canals'], ['Dokur', 'Plateau — dry, rocky'], ['Penugolu', 'Hills — forests, streams'], ['Western Ghats', 'High, continuous range on the west coast'], ['Eastern Ghats', 'Low, broken hills on the east'], ['Deccan Plateau', 'High flat land between the Ghats'],
    ], ['Delta, plateau, hills — one each.', 'The Ghats are on either side of the plateau.']),
    tapT('tap', 'Tap what you would see around a hill village like Penugolu.', [
      ['Teak and bamboo forests', true], ['Streams flowing down slopes', true], ['Forest paths', true], ['Mahua and tendu trees', true],
      ['Canals between paddy fields to the horizon', false], ['Sand dunes', false], ['Snow-covered peaks', false],
    ], ['Think of forests in the Godavari valley.', 'Canals belong to the delta.'], 'Hill villages are surrounded by forests and streams.'),
  ]),
  O('ts6.ss.hills.podu', 'Podu cultivation and forest produce', [
    h('Farming on forest slopes'),
    photo('🍯', 'Honey, gum, tamarind and mahua flowers are some of the forest products that Adivasi families collect.'),
    p('On steep hill slopes there is little flat land for fields. Traditionally the Koyas practised podu — a form of shifting cultivation. A patch of forest is cleared and the dry plants are burnt; the ash makes the soil richer. Crops such as jowar, millets, pulses and vegetables are sown with the first rains. After two or three years the soil loses its fertility, so the patch is left to grow back into forest and a new patch is cleared.'),
    def('Podu (shifting cultivation)', 'Clearing and burning a patch of forest, growing crops on it for a few years, then moving to another patch and letting the old one recover.'),
    def('Non-timber forest produce (NTFP)', 'Things collected from the forest other than wood: tendu leaves (for beedis), mahua flowers and seeds, honey, gum, tamarind, broom grass, medicinal plants.'),
    p('Collecting forest produce is an important source of income. Families sell it to traders or to the Girijan Cooperative Corporation (GCC), a government cooperative that buys forest produce at fixed prices and runs shops selling daily needs in tribal areas.'),
    keys('Podu: clear → burn → sow → harvest for a few years → leave fallow → move.', 'NTFP: tendu, mahua, honey, gum, tamarind, broom grass.', 'GCC buys forest produce at fair prices.'),
    remember('When populations grow and forests shrink, the fallow period becomes too short for the forest to recover — this is why podu has become a debated issue.'),
  ], [
    ex('Why do podu farmers move to a new patch after a few years?', ['Ash adds nutrients at first.', 'After two or three years the soil loses fertility.', 'Leaving it fallow lets the forest and soil recover.'], 'Because the soil loses fertility'),
    ex('A family sells 12 kg of honey at ₹300 per kg to the GCC. How much do they earn?', ['12 × 300 = 3,600.'], '₹3,600'),
  ], [
    orderT('podu', 'Put the steps of podu cultivation in order.', ['Choose a forest patch on a slope', 'Cut the bushes and small trees', 'Burn the dry plants; ash enriches the soil', 'Sow seeds when the rains begin', 'Harvest for two or three years', 'Leave the patch to grow back and move on'], ['Clearing comes before burning.', 'Leaving it fallow is last.'], 'Podu clears, burns, cultivates for a few years, then lets the land rest.'),
    tp('ntfp', (r) => {
      const [item, unit, lo, hi] = r.pick([['honey', 'kg', 250, 400], ['tamarind', 'kg', 30, 60], ['mahua flowers', 'kg', 20, 40], ['gum', 'kg', 100, 200], ['broom grass', 'bundle', 40, 80]] as [string, string, number, number][]);
      const price = r.int(lo / 10, hi / 10) * 10, qty = r.int(5, 20);
      return numQ(`(Illustrative) A Koya family sells ${qty} ${unit}${qty > 1 ? 's' : ''} of ${item} to the cooperative at ₹${price} per ${unit}. How many rupees do they earn?`, qty * price,
        ['Earnings = quantity × price per unit.', `${qty} × ${price}`], [`${qty} × ₹${price} = ₹${(qty * price).toLocaleString('en-IN')}`], [{ when: String(qty + price), explain: 'You added. Each unit earns the price, so multiply.' }], 0.001, '₹');
    }, 2),
    tapT('tap', 'Tap the items that are non-timber forest produce.', [
      ['Tendu leaves', true], ['Honey', true], ['Mahua flowers', true], ['Tamarind', true], ['Gum', true], ['Broom grass', true],
      ['Teak logs', false], ['Factory-made plastic', false], ['Cement', false],
    ], ['NTFP is anything from the forest except timber.', 'Logs are timber.'], 'NTFP are forest gifts other than wood: leaves, flowers, fruits, honey, gum, grass.'),
  ]),
  O('ts6.ss.hills.koya', 'Koya life: houses, customs and the future', [
    h('Living with the forest'),
    photo('🥁', 'Drums and dances are part of Koya festivals and celebrations.'),
    p('Koya houses are built with materials from the forest: walls of bamboo or wooden poles plastered with mud, and roofs of grass or palm leaves, or tiles today. A house has space for storing grain and keeping animals. Villages are small and scattered over the hills, close to water and fields.'),
    p('The Koyas have their own language, also called Koya, and rich customs. They celebrate festivals linked to the forest and farming, such as when new mahua flowers or new crops are first eaten. The Sammakka–Saralamma Jatara at Medaram in Mulugu district, held once in two years, honours two brave women of Koya tradition and draws huge crowds of people from many communities.'),
    def('Adivasi', 'Original dwellers; the communities, often living in forests and hills, who are recognised as Scheduled Tribes in India’s Constitution.'),
    h('Changes and the future'),
    p('Roads, schools (including residential ashram schools), health centres and mobile phones have reached many hill villages. Laws now recognise the right of forest-dwelling families to land they have cultivated for generations and to collect forest produce. At the same time, people discuss how to protect forests, keep their language and culture alive and earn better incomes.'),
    keys('Houses of bamboo, poles, mud and thatch.', 'Own language (Koya), forest and farming festivals.', 'Medaram Jatara, every two years, is a great Koya festival.', 'New schools, roads and forest rights bring change.'),
    remember('Every community has knowledge worth respecting — the Koyas know hundreds of forest plants and their uses.'),
  ], [
    ex('Why are Koya houses made of bamboo, wood, mud and grass?', ['These materials are found in the forest nearby.', 'They are cheap, cool in summer and easy to repair.'], 'Because they are local forest materials suited to the climate'),
    ex('The Medaram Jatara is held once every two years. If one was held in 2024, when are the next two?', ['Add 2 years: 2026.', 'Add 2 more: 2028.'], '2026 and 2028'),
  ], [
    tp('jatara', (r) => {
      const y = r.pick([2016, 2018, 2020, 2022, 2024]), k = r.int(1, 4);
      return numQ(`The Sammakka–Saralamma Jatara is held once every two years. If it was held in ${y}, in which year will it be held ${k === 1 ? 'next' : `for the ${['', '', 'second', 'third', 'fourth'][k]} time after that`}?`, y + 2 * k,
        ['It comes every 2 years.', `Add 2 × ${k} = ${2 * k} years to ${y}.`], [`${y} + ${2 * k} = ${y + 2 * k}`], [{ when: String(y + k), explain: 'The jatara comes every TWO years, so add 2 for each time.' }], 0.0001, 'year');
    }, 2),
    mcq('mcq', 'Think about Koya homes, customs and changes.', [
      ['The language of the Koyas is called…', 'Koya', ['Sanskrit', 'Urdu', 'Bengali'], 'Same as the community’s name.', 'The Koyas speak their own language, Koya.'],
      ['The Sammakka–Saralamma Jatara is held at…', 'Medaram', ['Hyderabad', 'Vijayawada', 'Delhi'], 'In Mulugu district.', 'The jatara takes place at Medaram, Mulugu district.'],
      ['Residential schools for tribal children are called…', 'Ashram schools', ['Rythu Bazaars', 'Gram sabhas', 'Market yards'], 'Children stay there.', 'Ashram schools are residential schools in tribal areas.'],
      ['Traditional Koya roofs are made of…', 'Grass or palm leaves', ['Glass', 'Steel sheets only', 'Marble'], 'Forest materials.', 'Thatch from grass or leaves is traditional.'],
      ['The word Adivasi means…', 'Original dwellers', ['City people', 'Traders', 'Kings'], 'Adi = first.', 'Adivasi means the original inhabitants.'],
    ]),
    tapT('change', 'Tap the CHANGES that have reached many hill villages in recent years.', [
      ['Roads and buses', true], ['Schools and ashram schools', true], ['Health centres', true], ['Mobile phones', true], ['Rights to cultivated forest land', true],
      ['The Godavari river disappeared', false], ['People stopped all festivals', false], ['Forests turned into deserts overnight', false],
    ], ['Think of facilities from outside.', 'Rivers and festivals did not vanish.'], 'Roads, schools, health care, phones and forest rights are recent changes.'),
  ]),
]);


// =====================================================================================
// Theme II — Production, Exchange and Livelihoods
// Chapter 6 — From Gathering Food to Growing Food: The Earliest People
// =====================================================================================
const ch6 = U(6, 'From Gathering Food to Growing Food - The Earliest People', [
  O('ts6.ss.early.hunt', 'Hunter-gatherers: tools, fire, nomadic life and rock paintings', [
    h('Life before farming'),
    photo('🏹', 'Early people hunted with spears and, much later, with bows and stone-tipped arrows.'),
    p('For most of human history people did not grow food at all. Small groups moved from place to place, gathering fruits, roots, seeds, honey and leaves, catching fish and hunting animals. Because they followed the seasons, the animals and the water, they did not build permanent homes. Such people are called hunter-gatherers.'),
    def('Hunter-gatherers', 'People who get their food by gathering wild plants and hunting animals rather than by farming.'),
    def('Nomadic', 'Moving from place to place instead of living in one settled place.'),
    def('Palaeolithic (Old Stone) Age', 'The very long period, from about 2 million years ago to about 12,000 years ago, when people used roughly chipped stone tools.'),
    p('They made tools by striking one stone against another to get sharp edges: hand axes, choppers, scrapers and points. Later they made tiny stone blades called microliths, fitted to wooden or bone handles. The control of fire was a great discovery: fire gave warmth and light, kept wild animals away and was used to cook food.'),
    p('Early people also painted. In rock shelters at Bhimbetka in Madhya Pradesh, and at Pandavula Gutta in Jayashankar Bhupalpally district of Telangana, there are paintings of animals, hunters and dancers made with colours from minerals.'),
    keys('Food came from gathering and hunting.', 'Life was nomadic; caves and rock shelters were used.', 'Stone tools and fire were key discoveries.', 'Rock paintings tell us about their lives.'),
    remember('Early people knew their surroundings in great detail: which plants were safe to eat and when animals moved.'),
  ], [
    ex('Why did hunter-gatherers keep moving from place to place?', ['Plants and fruits in one area got used up.', 'Animals moved with the seasons and in search of water.', 'So people moved to find food and water.'], 'To follow food and water'),
    ex('Give three uses of fire for early people.', ['Warmth in cold weather and light at night.', 'Scaring away wild animals.', 'Cooking food, which made it softer and safer.'], 'Warmth/light, protection, cooking'),
  ], [
    mcq('mcq', 'Think about how people lived before farming.', [
      ['People who lived by collecting wild food and hunting are called…', 'Hunter-gatherers', ['Farmers', 'Traders', 'Potters'], 'They did not grow food.', 'Hunter-gatherers gathered and hunted for food.'],
      ['Nomadic means…', 'Moving from place to place', ['Living in big cities', 'Growing crops', 'Building temples'], 'No permanent home.', 'Nomads move in search of food and water.'],
      ['Tiny stone blades fixed to handles are called…', 'Microliths', ['Megaliths', 'Coins', 'Seals'], 'Micro = small.', 'Microliths are very small stone tools.'],
      ['Rock paintings in Telangana are found at…', 'Pandavula Gutta', ['Charminar', 'Golconda', 'Hussain Sagar'], 'In Jayashankar Bhupalpally district.', 'Pandavula Gutta has ancient rock paintings.'],
      ['Which famous rock-shelter site is in Madhya Pradesh?', 'Bhimbetka', ['Mohenjo-daro', 'Sanchi', 'Hampi'], 'It has hundreds of painted shelters.', 'Bhimbetka is famous for prehistoric rock paintings.'],
      ['The Old Stone Age is also called the…', 'Palaeolithic Age', ['Neolithic Age', 'Iron Age', 'Modern Age'], 'Palaeo = old, lithic = stone.', 'Palaeolithic means Old Stone Age.'],
    ]),
    tapT('fire', 'Tap the ways in which fire helped early people.', [
      ['Warmth in cold nights', true], ['Light in dark caves', true], ['Scaring away wild animals', true], ['Cooking meat and roots', true],
      ['Sending messages by phone', false], ['Driving tractors', false], ['Writing books', false],
    ], ['Think only of what fire itself can do.', 'Phones and tractors came much later.'], 'Fire gave warmth, light, safety and cooked food.'),
    matchT('tools', 'early tool or find with its use or meaning', [
      ['Hand axe', 'Cutting and digging'], ['Scraper', 'Cleaning animal skins'], ['Microlith', 'Tiny blade set in a handle'], ['Rock painting', 'Picture of hunts and animals'], ['Fire', 'Cooking and warmth'], ['Rock shelter', 'Natural shelter under a rock'],
    ], ['Tools were made by chipping stone.', 'Paintings record their life.']),
  ]),
  O('ts6.ss.early.grow', 'From gathering to growing: domestication and settled life', [
    h('A great change: growing food'),
    photo('🌾', 'Wild grasses such as wheat and barley were among the first plants to be grown as crops.'),
    p('About 12,000 years ago the climate of the world became warmer. Grasslands spread and wild grasses with edible grains grew in many places. People who gathered these grains noticed that seeds dropped on the ground sprouted into new plants. Slowly they began to sow seeds on purpose and look after the plants. This was the beginning of farming.'),
    def('Domestication', 'Taming wild animals and selecting and growing wild plants under human care, so that they become useful to people.'),
    p('The dog was probably the first animal to be tamed; it helped in hunting and guarding. Later sheep, goats, cattle and pigs were domesticated. Herds were a store of food — milk and meat — that could be used when needed.'),
    p('Farming made people stay in one place to look after crops, so they built houses and villages: this is settled life. They made clay pots to store grain and cook, began spinning and weaving, and used grinding stones to make flour.'),
    stepsB('Gathering wild grain', 'Noticing seeds sprout', 'Sowing seeds on purpose', 'Caring for crops and herds', 'Staying in one place — villages, pots, stores of grain'),
    keys('Farming began about 12,000–10,000 years ago.', 'The dog was the first tamed animal; then sheep, goats and cattle.', 'Farming led to settled villages, pottery and weaving.'),
    remember('Farmers had to stay to watch crops grow, water them and protect them from animals and birds — so they settled down.'),
  ], [
    ex('Why did farming make people settle in one place?', ['Crops take months to grow.', 'They need watering, weeding and protection.', 'So farmers stayed near their fields and built houses.'], 'They had to look after crops until harvest'),
    ex('Why did early farmers need pots?', ['Grain had to be stored till the next harvest.', 'Food had to be cooked, and water carried.'], 'For storing grain, cooking and carrying water'),
  ], [
    orderT('steps', 'Put these steps in the change from gathering to farming in order.', ['People gather wild grains', 'They notice dropped seeds sprouting', 'They sow seeds on purpose', 'They look after crops and tame animals', 'They settle in villages near their fields'], ['Gathering came first.', 'Settled villages came after farming.'], 'Gathering led to observation, then sowing, caring for crops and herds, and finally settled life.'),
    mcq('mcq', 'Domestication and settled life.', [
      ['The first animal to be tamed was probably the…', 'Dog', ['Horse', 'Elephant', 'Camel'], 'It helped in hunting.', 'Dogs were tamed first and helped in hunting and guarding.'],
      ['Taming animals and growing plants under human care is called…', 'Domestication', ['Migration', 'Irrigation', 'Mining'], 'Domus = home.', 'Domestication brings plants and animals under human care.'],
      ['Farming probably began about…', '12,000–10,000 years ago', ['100 years ago', '1,000 years ago', '1 million years ago'], 'After the climate became warmer.', 'Farming began after the last Ice Age, about 12,000–10,000 years ago.'],
      ['Which new craft was needed to store grain?', 'Pottery', ['Car making', 'Printing', 'Glass windows'], 'Made from clay.', 'Clay pots stored grain and water.'],
      ['Herds of animals were useful to early farmers because they gave…', 'Milk, meat and skins', ['Electricity', 'Plastic', 'Petrol'], 'Animals were a moving food store.', 'Animals provided food and materials when needed.'],
    ]),
    tapT('tap', 'Tap the changes that came with settled farming life.', [
      ['Houses and villages', true], ['Clay pots for storage', true], ['Spinning and weaving', true], ['Grinding stones for flour', true], ['Herds of goats and cattle', true],
      ['Moving every few days', false], ['Depending only on hunting', false], ['Living with no shelter at all', false],
    ], ['Settled life means staying in one place.', 'Moving all the time belongs to the older way of life.'], 'Farming brought villages, storage, crafts and herds.'),
  ]),
  O('ts6.ss.early.neo', 'The Neolithic period: polished tools and early villages', [
    h('The New Stone Age'),
    photo('🪨', 'Neolithic people ground and polished stone to make smooth, sharp axes.'),
    p('Archaeologists call the time of early farming the Neolithic or New Stone Age. Its tools were made in a new way: stones were ground and polished to make smooth, strong axes for cutting trees and clearing land. People also used bone tools, grinding stones and pots.'),
    def('Neolithic Age', 'The New Stone Age, the period of early farming villages, when people used ground and polished stone tools.'),
    def('Archaeologist', 'A person who studies the past by digging up and examining things people left behind: tools, pots, bones, houses.'),
    stepsB('Mehrgarh (in present-day Pakistan, near the Bolan Pass): one of the earliest farming villages, about 9,000 years ago (about 7000 BCE); people grew wheat and barley and kept sheep and goats.', 'Burzahom (Kashmir): people lived in pit houses dug into the ground to keep warm.', 'Chirand (Bihar): Neolithic tools of bone have been found.', 'South India (Karnataka, Telangana, Andhra Pradesh): ash mounds show where cattle pens were burnt; people kept herds of cattle.'),
    keys('Neolithic = polished stone tools + farming + villages.', 'Mehrgarh: wheat, barley, sheep and goats.', 'Burzahom: pit houses.', 'Deccan: cattle-keeping and ash mounds.'),
    remember('BCE dates count backwards: 7000 BCE is older than 5000 BCE.'),
  ], [
    ex('What is the difference between a Palaeolithic and a Neolithic stone tool?', ['Palaeolithic tools were made by chipping, so they were rough.', 'Neolithic tools were ground and polished, so they were smooth and strong.'], 'Chipped and rough vs. ground and polished'),
    ex('Mehrgarh was settled about 7000 BCE. How many years before 2000 CE is that?', ['From 7000 BCE to year 1 is about 7000 years.', 'From year 1 to 2000 CE is about 2000 years.', '7000 + 2000 − 1 = 8,999 ≈ 9,000 years.'], 'About 9,000 years'),
  ], [
    timelineT('tl', 'Put these stages of early human life in time order (oldest first).', [
      [-2000000, 'People make the first chipped stone tools', 'about 2 million years ago'], [-10000, 'Climate warms; grasslands spread', 'about 12,000 years ago'],
      [-7000, 'Farming village at Mehrgarh', 'about 7000 BCE'], [-2600, 'Large cities of the Harappan civilisation', 'about 2600 BCE'], [-9000, 'People in some regions begin to grow grain and tame animals', 'about 11,000 years ago'],
    ], ['Chipped stone tools are the oldest.', 'Cities came after villages.']),
    matchT('sites', 'Neolithic site with what was found there', [
      ['Mehrgarh', 'Early wheat, barley, sheep and goats'], ['Burzahom', 'Pit houses dug into the ground'], ['Chirand', 'Bone tools'], ['Deccan ash mounds', 'Burnt cattle pens of herders'], ['Bhimbetka', 'Rock shelters with paintings'],
    ], ['Burzahom is in cold Kashmir.', 'Ash mounds are in the Deccan.']),
    mcq('mcq', 'Neolithic means New Stone Age.', [
      ['Neolithic tools were made by…', 'Grinding and polishing stone', ['Melting iron', 'Chipping only', 'Moulding plastic'], 'They were smooth.', 'Neolithic tools were ground and polished.'],
      ['A person who studies the past by digging up remains is an…', 'Archaeologist', ['Astronaut', 'Architect', 'Astrologer'], 'Archaeo = ancient.', 'Archaeologists study objects people left behind.'],
      ['People at Burzahom lived in…', 'Pit houses', ['Tree houses', 'Tents of plastic', 'Tall towers'], 'Dug into the ground.', 'Pit houses kept people warm in cold Kashmir.'],
      ['At Mehrgarh, people grew…', 'Wheat and barley', ['Tea and coffee', 'Rubber', 'Potatoes and tomatoes'], 'Early grains.', 'Wheat and barley were among the first crops there.'],
      ['Which is the OLDER date?', '7000 BCE', ['5000 BCE', '2000 BCE', '500 CE'], 'BCE counts backwards.', 'The bigger BCE number is further back in time.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 7 — Agriculture in Our Times
// =====================================================================================
const ch7 = U(7, 'Agriculture in Our Times', [
  O('ts6.ss.agri.farmers', 'Small and big farmers', [
    h('Not all farmers are the same'),
    photo('🚜', 'Big farmers may own tractors; small farmers often hire them or use bullocks.'),
    p('In a village you will find farmers with very different amounts of land. Some own 20 acres or more, a tractor and a bore well. Many own only one or two acres. Most farmers in India are small or marginal farmers.'),
    def('Marginal farmer', 'A farmer who owns less than 1 hectare (about 2½ acres) of land.'),
    def('Small farmer', 'A farmer who owns 1 to 2 hectares (about 2½ to 5 acres).'),
    def('Big (large) farmer', 'A farmer who owns many hectares, often hires workers and machines and sells most of the harvest.'),
    p('A small farmer’s family usually does all the work itself. To buy seeds, fertiliser and pesticides they often need a loan before sowing. If the crop fails or prices fall, it is hard to repay. A big farmer can afford irrigation, machines and storage, can wait to sell when prices are better and can get bank loans more easily.'),
    keys('Most Indian farmers have small plots.', 'Small farmers depend on family labour and loans.', 'Big farmers use machines, hired labour and storage.'),
    remember('1 hectare = about 2.47 acres. 1 acre = 100 guntas (a unit used in Telangana).'),
  ], [
    ex('A farmer owns 1.5 hectares. Is she a marginal, small or big farmer?', ['Marginal: below 1 hectare.', 'Small: 1 to 2 hectares.', '1.5 lies between 1 and 2.'], 'A small farmer'),
    ex('Why can a big farmer often sell at a better price than a small farmer?', ['He has storage and money to wait.', 'A small farmer must sell at once to repay loans.', 'Prices are usually lowest just after harvest.'], 'He can store the crop and wait for better prices'),
  ], [
    tp('class', (r) => {
      const ha = r.pick([0.4, 0.6, 0.8, 1.2, 1.5, 1.8, 3, 5, 8]);
      const kind = ha < 1 ? 'Marginal farmer' : ha <= 2 ? 'Small farmer' : 'Big (medium or large) farmer';
      const n = who(r);
      return {
        type: 'mcq', prompt: `${n}’s family owns ${ha} hectares of land. Which group do they belong to?`,
        ...choose(r, kind, ['Marginal farmer', 'Small farmer', 'Big (medium or large) farmer', 'Landless labourer'].filter((x) => x !== kind)),
        hints: ['Marginal: less than 1 ha. Small: 1–2 ha. Above 2 ha: medium or large.', `Where does ${ha} ha fit?`],
        mistakes: [{ when: 'wrong', explain: 'Compare the land with the limits 1 ha and 2 ha.' }],
        solution: [`${ha} ha is ${ha < 1 ? 'less than 1 ha' : ha <= 2 ? 'between 1 and 2 ha' : 'more than 2 ha'}.`, `So they are: ${kind}.`],
      };
    }, 2),
    mcq('mcq', 'Compare the resources of small and big farmers.', [
      ['Most farmers in India are…', 'Small and marginal farmers', ['Big farmers with tractors', 'Plantation owners', 'Factory owners'], 'Most own only a few acres.', 'A large majority of Indian farmers have small plots.'],
      ['Why does a small farmer often take a loan before sowing?', 'To buy seeds, fertiliser and pesticides', ['To buy a car', 'To build a palace', 'To pay school fees for ten years'], 'Farming has costs before income.', 'Inputs must be bought months before the harvest is sold.'],
      ['Who mostly does the work on a small farm?', 'The farmer’s own family', ['Hundreds of hired workers', 'Robots', 'No one'], 'Small farms cannot pay many wages.', 'Family labour runs small farms.'],
      ['A marginal farmer owns land of less than…', '1 hectare', ['10 hectares', '100 hectares', '5 hectares'], 'About 2½ acres.', 'Marginal holdings are below 1 hectare.'],
      ['Which can a big farmer afford more easily?', 'A tractor and a bore well', ['Nothing at all', 'Only hand tools', 'Only bullocks'], 'More land, more income.', 'Bigger farms can invest in machines and irrigation.'],
    ]),
    tp('acres', (r) => {
      const ha = r.pick([1, 2, 3, 4, 5]);
      return numQ(`1 hectare is about 2.5 acres. About how many acres is ${ha} hectare${ha > 1 ? 's' : ''}?`, ha * 2.5,
        ['Multiply hectares by 2.5.', `${ha} × 2.5`], [`${ha} × 2.5 = ${ha * 2.5} acres`], [{ when: String(ha / 2.5), explain: 'You divided. An acre is smaller than a hectare, so there are MORE acres: multiply.' }], 0.02, 'acres');
    }, 1),
  ]),
  O('ts6.ss.agri.contract', 'Contract farming', [
    h('Selling the crop before sowing it'),
    photo('🥒', 'Vegetables such as gherkins (small cucumbers) are often grown under contract for companies.'),
    p('In contract farming, a company signs an agreement with farmers before the crop is sown. The company promises to buy the whole crop at a fixed price and often supplies seeds, fertiliser and advice. The farmer promises to grow the crop in the way the company wants and to sell only to that company.'),
    def('Contract farming', 'An agreement made before sowing in which a buyer (usually a company) agrees to buy a farmer’s crop at a fixed price, often supplying inputs and advice.'),
    h('Two sides of the bargain'),
    stepsB('Possible gains for the farmer: a sure buyer, a known price, seeds and expert advice, sometimes higher income.', 'Possible risks for the farmer: the company may reject produce for small defects, delay payment, or set strict rules; the farmer may depend on a single buyer.', 'Gains for the company: a steady supply of crops of the quality it needs.'),
    p('In Telangana, contract farming is common for seed production (for example of cotton, maize and paddy seeds), for some vegetables, and for poultry. Whether it helps depends on fair agreements that both sides understand and keep.'),
    keys('Agreement before sowing, fixed price, single buyer.', 'Benefits: assured market, inputs, advice.', 'Risks: rejection, delayed payment, dependence.'),
    remember('A good contract is written clearly, in a language the farmer understands, before the farmer spends money.'),
  ], [
    ex('A company agrees to buy gherkins at ₹20 per kg. A farmer harvests 2,000 kg, but 100 kg are rejected for poor shape. How much is he paid?', ['Accepted produce = 2,000 − 100 = 1,900 kg.', '1,900 × 20 = ₹38,000.'], '₹38,000'),
    ex('Give one advantage and one risk of contract farming for a small farmer.', ['Advantage: he knows he can sell the crop and at what price.', 'Risk: if the company rejects part of the crop, he loses that income.'], 'Sure market vs. risk of rejection'),
  ], [
    tp('pay', (r) => {
      const price = r.pick([15, 18, 20, 25, 30]), kg = r.pick([1000, 1500, 2000, 2500, 3000]), rej = r.pick([50, 100, 150, 200]);
      return numQ(`(Illustrative) Under a contract a company buys a vegetable at ₹${price} per kg. A farmer harvests ${kg.toLocaleString('en-IN')} kg, but ${rej} kg are rejected. How many rupees is the farmer paid?`, (kg - rej) * price,
        ['First find the accepted quantity.', `(${kg} − ${rej}) × ${price}`], [`Accepted = ${kg} − ${rej} = ${kg - rej} kg`, `Payment = ${kg - rej} × ₹${price} = ₹${((kg - rej) * price).toLocaleString('en-IN')}`],
        [{ when: String(kg * price), explain: 'You forgot to take away the rejected produce first.' }], 0.001, '₹');
    }, 2),
    tapT('tap', 'Tap the statements that are TRUE about contract farming.', [
      ['The agreement is made before sowing', true], ['The price is fixed in advance', true], ['The company often supplies seeds and advice', true], ['The company may reject produce that does not meet its standards', true],
      ['The farmer can sell to anyone he likes at harvest', false], ['There are never any risks for the farmer', false], ['The price is decided only after the harvest', false],
    ], ['Contract = agreement made in advance.', 'Think of both benefits and risks.'], 'Contract farming fixes the buyer and price before sowing; it has benefits and risks.'),
    mcq('mcq', 'Who agrees to what?', [
      ['In contract farming the crop is usually sold to…', 'The company that signed the contract', ['Any trader at all', 'No one', 'Foreign tourists'], 'Single buyer.', 'The farmer agrees to sell to the contracting company.'],
      ['Which is a common contract-farming activity in Telangana?', 'Seed production', ['Fishing in the sea', 'Tea gardens', 'Coal mining'], 'Companies need pure seeds.', 'Seed production for cotton, maize and paddy is often done under contract.'],
      ['A risk for farmers under contract is…', 'Rejection of produce or late payment', ['Getting free seeds', 'Knowing the price early', 'Getting advice'], 'Think of what can go wrong.', 'Companies may reject produce or pay late.'],
      ['A benefit for the company is…', 'A steady supply of the quality it needs', ['Paying nothing', 'Owning the farmer’s land', 'Avoiding all rules'], 'Factories need regular supplies.', 'The company gets assured, standard produce.'],
      ['Before signing a contract a farmer should…', 'Understand every condition clearly', ['Sign without reading', 'Spend all money first', 'Burn the paper'], 'Know what you agree to.', 'A clear understanding protects the farmer.'],
    ]),
  ]),
  O('ts6.ss.agri.ts', 'Agriculture in Telangana', [
    h('What Telangana grows'),
    photo('🌶️', 'Telangana’s fields grow paddy, cotton, maize, pulses, chillies and turmeric.'),
    p('Farming is the main livelihood of a large part of Telangana’s people. There are two main seasons. The kharif (vanakalam) season begins with the south-west monsoon in June; the rabi (yasangi) season is in winter and depends on stored water from tanks, projects and bore wells.'),
    def('Kharif (vanakalam)', 'The rainy-season crop, sown June–July and harvested September–October.'),
    def('Rabi (yasangi)', 'The winter crop, sown October–December and harvested by March–April.'),
    stepsB('Paddy: the largest crop by area, grown wherever water is available.', 'Cotton: a major commercial crop on black soils (for example in Adilabad, Nalgonda, Warangal).', 'Maize, jowar and red gram: important dry-land crops.', 'Chillies (Khammam, Warangal) and turmeric (Nizamabad) are well-known spice crops.', 'Mango orchards, vegetables and oil palm are also grown.'),
    p('Water comes from tanks (many restored in recent years), bore wells and canals from irrigation projects on the Godavari and Krishna. The state and central governments support farmers through investment support per acre, crop insurance, free or subsidised electricity for farm pumps and purchase of paddy at procurement centres.'),
    keys('Two seasons: vanakalam (kharif) and yasangi (rabi).', 'Major crops: paddy, cotton, maize, red gram, chillies, turmeric.', 'Irrigation: tanks, bore wells and project canals.'),
    remember('Nizamabad is famous for turmeric, Khammam and Warangal for chillies.'),
  ], [
    ex('A crop is sown in November and harvested in March. Which season is it?', ['Kharif is sown with the June rains.', 'November sowing and March harvest is the winter season.'], 'Rabi (yasangi)'),
    ex('Why is cotton grown widely in Adilabad?', ['Adilabad has black soil.', 'Black soil holds moisture, which cotton needs.'], 'Because of moisture-holding black soil'),
  ], [
    matchT('crop', 'crop with the place or fact it is known for', [
      ['Turmeric', 'Nizamabad'], ['Chillies', 'Khammam and Warangal'], ['Cotton', 'Black soils of Adilabad'], ['Paddy', 'Largest crop where water is available'], ['Red gram', 'A dry-land pulse'], ['Mango', 'Orchards in many districts'],
    ], ['Spices: turmeric and chillies.', 'Cotton loves black soil.']),
    mcq('mcq', 'Seasons and crops of Telangana.', [
      ['The kharif season in Telangana is called…', 'Vanakalam', ['Yasangi', 'Summer holidays', 'Sankranti'], 'The rainy season.', 'Kharif is vanakalam, the monsoon season.'],
      ['The rabi season is called…', 'Yasangi', ['Vanakalam', 'Bonalu', 'Bathukamma'], 'The winter crop.', 'Rabi is yasangi, the winter crop.'],
      ['Kharif crops are sown in…', 'June–July', ['December', 'March', 'Any month without rain'], 'With the monsoon.', 'Kharif sowing starts with the June rains.'],
      ['Which district is famous for turmeric?', 'Nizamabad', ['Hyderabad', 'Mulugu', 'Medchal'], 'There is a big turmeric market there.', 'Nizamabad is known for turmeric.'],
      ['Which is the largest crop by area in Telangana?', 'Paddy', ['Tea', 'Coffee', 'Apple'], 'Grown in both seasons where water is available.', 'Paddy covers the largest area.'],
      ['Rabi crops depend mostly on…', 'Water stored in tanks, projects and bore wells', ['Heavy winter rain', 'Snowmelt', 'Sea water'], 'Winter is dry in Telangana.', 'Little rain falls in winter, so stored water is used.'],
    ]),
    tp('season', (r) => {
      const [crop, sow, harv, season] = r.pick([
        ['maize', 'June', 'September', 'Kharif (vanakalam)'], ['paddy', 'July', 'October', 'Kharif (vanakalam)'], ['cotton', 'June', 'November–January (picking)', 'Kharif (vanakalam)'],
        ['groundnut', 'November', 'March', 'Rabi (yasangi)'], ['Bengal gram', 'October', 'February', 'Rabi (yasangi)'], ['paddy', 'December', 'April', 'Rabi (yasangi)'],
      ] as [string, string, string, string][]);
      return {
        type: 'mcq', prompt: `A farmer sows ${crop} in ${sow} and harvests it in ${harv}. Which season’s crop is this?`,
        ...choose(r, season, [season.startsWith('K') ? 'Rabi (yasangi)' : 'Kharif (vanakalam)', 'Neither — no crops grow then']),
        hints: ['Kharif starts with the June monsoon; rabi is sown after the rains, in winter.', `Look at the sowing month: ${sow}.`],
        mistakes: [{ when: 'wrong', explain: 'Use the sowing month: June–July = kharif; October–December = rabi.' }],
        solution: [`Sown in ${sow}.`, `So it is a ${season} crop.`],
      };
    }, 1),
  ]),
]);

// =====================================================================================
// Chapter 8 — Trade in Agricultural Produce (Parts A and B)
// =====================================================================================
const ch8 = U(8, 'Trade in Agricultural Produce (Parts A and B)', [
  O('ts6.ss.trade.local', 'Street vendors, weekly santha and Rythu Bazaar', [
    h('How vegetables reach your kitchen'),
    photo('🛒', 'Vegetable sellers, carts and markets link farmers with families in towns.'),
    p('The tomatoes in your kitchen may have travelled from a farm through several hands. A street vendor buys vegetables early in the morning at a wholesale market, loads them on a push-cart and sells them street by street. Her profit is the difference between the price she sells at and the price she paid, minus costs like transport.'),
    def('Weekly santha (shandy)', 'A market held on a fixed day of the week in a village or small town, where farmers, traders and craftspeople sell everything from vegetables to cattle and pots.'),
    def('Rythu Bazaar', 'A farmers’ market set up by the government (from 1999) where farmers sell directly to buyers, without middlemen, at prices fixed daily by officials a little above wholesale.'),
    p('In a Rythu Bazaar the farmer gets more than he would from a trader, and buyers pay less than in ordinary shops, because no middleman takes a share. Farmers need an identity card to sell there, and space, weighing scales and shelters are provided.'),
    keys('Street vendors buy wholesale and sell retail.', 'The weekly santha brings many sellers to one place on one day.', 'Rythu Bazaars cut out middlemen.'),
    remember('Profit = selling price − cost price (− other costs).'),
  ], [
    ex('A vendor buys 20 kg of tomatoes at ₹15 per kg and sells them all at ₹20 per kg. What is her profit?', ['Cost = 20 × 15 = ₹300.', 'Sales = 20 × 20 = ₹400.', 'Profit = 400 − 300 = ₹100.'], '₹100'),
    ex('Why are prices in a Rythu Bazaar lower for buyers but better for farmers?', ['Farmers sell directly to buyers.', 'The share that a middleman would take is divided between the farmer and the buyer.'], 'No middleman’s margin'),
  ], [
    tp('profit', (r) => {
      const kg = r.pick([10, 20, 25, 30, 40]), cp = r.pick([10, 12, 15, 20, 25]), m = r.pick([3, 5, 8, 10]);
      const what = r.pick(['tomatoes', 'onions', 'brinjals', 'potatoes', 'bananas']);
      const n = who(r);
      return numQ(`(Illustrative) ${n}, a street vendor, buys ${kg} kg of ${what} at ₹${cp} per kg and sells all of it at ₹${cp + m} per kg. What is the profit in rupees?`, kg * m,
        ['Profit per kg = selling price − buying price.', `(${cp + m} − ${cp}) × ${kg}`], [`Profit per kg = ₹${m}`, `Total profit = ${m} × ${kg} = ₹${kg * m}`],
        [{ when: String(kg * (cp + m)), explain: 'That is the total sales. Subtract what she paid to find profit.' }], 0.001, '₹');
    }, 2),
    mcq('mcq', 'Who sells where?', [
      ['A market held on a fixed day each week is a…', 'Santha (shandy)', ['Rythu Bazaar', 'Shopping mall', 'Bank'], 'Weekly.', 'The weekly santha meets on a fixed day.'],
      ['In a Rythu Bazaar farmers sell…', 'Directly to buyers', ['Only to companies', 'Only to foreign countries', 'Nothing'], 'No middlemen.', 'Rythu Bazaars cut out middlemen.'],
      ['Rythu Bazaars were started in the year…', '1999', ['1947', '1857', '2020'], 'Near the end of the 20th century.', 'The first Rythu Bazaars opened in 1999.'],
      ['A street vendor usually buys her vegetables…', 'From a wholesale market early in the morning', ['From the moon', 'Only from her own garden', 'From a bank'], 'She buys in bulk.', 'Vendors buy in bulk at wholesale markets.'],
      ['Who fixes the prices in a Rythu Bazaar each day?', 'Officials running the bazaar', ['Each buyer', 'Film stars', 'Nobody'], 'Prices are displayed on a board.', 'Officials fix daily prices a little above wholesale.'],
    ]),
    tapT('tap', 'Tap the things you might find at a weekly santha.', [
      ['Vegetables and fruits', true], ['Pots and baskets', true], ['Cattle and goats', true], ['Clothes and bangles', true], ['Dried fish and spices', true],
      ['Aeroplanes', false], ['Railway engines', false], ['Ships', false],
    ], ['Think of things farmers and craftspeople make or need.', 'Big vehicles are not sold there.'], 'A santha sells everyday goods, produce and animals.'),
  ]),
  O('ts6.ss.trade.yard', 'Market yards and the minimum support price', [
    h('Selling a whole harvest'),
    photo('⚖', 'In a market yard produce is weighed and sold by open auction.'),
    p('A farmer with 40 bags of paddy, cotton or chillies cannot sell them on the street. He takes them to a market yard run by an Agricultural Market Committee. There, traders inspect the produce and bid in an open auction; the highest bidder buys. Commission agents help arrange the sale and take a fee.'),
    def('Market yard', 'A regulated market where farm produce is weighed, graded and sold by open auction under the rules of an Agricultural Market Committee.'),
    def('Minimum support price (MSP)', 'A price announced by the Government of India before sowing for certain crops; if market prices fall below it, government agencies are meant to buy the crop at this price.'),
    p('MSP protects farmers from a crash in prices after a big harvest. For paddy, the state sets up procurement centres in villages where farmers can sell at the MSP. Not every farmer can always sell at MSP, though — the crop must meet quality standards (for example, moisture limits), and centres may be far away.'),
    keys('Market yards use open auctions with weighing and grading.', 'Commission agents arrange sales for a fee.', 'MSP is announced before sowing for major crops.'),
    remember('Amount received = quantity × price per unit.'),
  ], [
    ex('A farmer sells 30 quintals of paddy at an MSP of ₹2,300 per quintal (illustrative). How much does he receive?', ['30 × 2,300 = 69,000.'], '₹69,000'),
    ex('Why does the government announce MSP before sowing and not after harvest?', ['Farmers decide what to sow based on expected prices.', 'Knowing a minimum price in advance reduces their risk.'], 'So farmers can plan with a known minimum price'),
  ], [
    tp('msp', (r) => {
      const q = r.pick([10, 15, 20, 25, 30, 40]), price = r.pick([2000, 2200, 2300, 2400, 2500]);
      return numQ(`(Illustrative) A farmer sells ${q} quintals of paddy at a procurement centre at ₹${price.toLocaleString('en-IN')} per quintal. How many rupees does he receive?`, q * price,
        ['Amount = quantity × price per quintal.', `${q} × ${price}`], [`${q} × ₹${price.toLocaleString('en-IN')} = ₹${(q * price).toLocaleString('en-IN')}`], [{ when: String(q + price), explain: 'You added. Each quintal earns the price, so multiply.' }], 0.001, '₹');
    }, 2),
    mcq('mcq', 'Market yards and MSP.', [
      ['In a market yard produce is usually sold by…', 'Open auction', ['Lottery', 'Barter', 'Secret letters'], 'Traders bid.', 'The highest bid in an open auction wins.'],
      ['MSP is announced by…', 'The Government of India', ['Each trader', 'The village shopkeeper', 'Foreign banks'], 'It applies across the country.', 'The central government announces MSP for major crops.'],
      ['MSP is announced…', 'Before sowing', ['After the crop is sold', 'Every hour', 'Only in drought'], 'To help farmers plan.', 'Announcing early helps farmers choose crops.'],
      ['A commission agent in a market yard…', 'Arranges sales for a fee', ['Grows the crop', 'Makes the rain', 'Sets the MSP'], 'He is paid a commission.', 'Agents arrange sales and charge a commission.'],
      ['Market yards are run by…', 'Agricultural Market Committees', ['School committees', 'Film clubs', 'Railway stations'], 'They regulate sales.', 'Agricultural Market Committees manage market yards.'],
    ]),
    orderT('yard', 'Put the steps of selling at a market yard in order.', ['Farmer brings the produce to the yard', 'Produce is weighed and graded', 'Traders inspect and bid in an open auction', 'The highest bidder buys', 'Farmer receives payment'], ['Weighing comes before the auction.', 'Payment is last.'], 'Bring, weigh, auction, sell, get paid.'),
  ]),
  O('ts6.ss.trade.debt', 'Selling to millers and brokers; indebtedness', [
    h('When a loan decides the price'),
    photo('🪙', 'Money borrowed before sowing must be repaid after harvest, often with high interest.'),
    p('Many small farmers borrow money before sowing from a trader, broker or miller instead of a bank. Banks need papers and land records, and may be far away; the trader lends quickly. But often there is a condition: the farmer must sell his crop to the same lender after harvest, at the price the lender sets, which is usually lower than the market price. The interest on such loans is also high.'),
    def('Broker (middleman)', 'A person who buys produce from farmers and sells it to big traders or mills, earning from the difference in price.'),
    def('Indebtedness', 'Being in debt — owing money that one finds hard to repay.'),
    p('If the harvest is poor, the farmer cannot repay everything; the remaining debt and its interest grow, and he borrows again next season. This is how many small farmers are trapped in debt. Bank loans, crop loans through cooperative societies, crop insurance and MSP purchases are ways to reduce this problem.'),
    keys('Informal loans come with high interest and selling conditions.', 'Tied selling lowers the price farmers get.', 'Bank and cooperative loans, insurance and MSP help reduce debt.'),
    remember('Simple interest = principal × rate × time ÷ 100.'),
  ], [
    ex('A farmer borrows ₹20,000 at 3% per month for 6 months. What interest must he pay?', ['Interest per month = 3% of 20,000 = ₹600.', '6 months × 600 = ₹3,600.'], '₹3,600'),
    ex('A miller lends money on the condition that the farmer sells paddy to him at ₹1,900 per quintal, while the market price is ₹2,200. How much does the farmer lose on 20 quintals?', ['Loss per quintal = 2,200 − 1,900 = ₹300.', '20 × 300 = ₹6,000.'], '₹6,000'),
  ], [
    tp('interest', (r) => {
      const P = r.pick([10000, 15000, 20000, 25000, 30000]), rate = r.pick([2, 3, 4]), m = r.pick([4, 5, 6, 8]);
      const I = P * rate * m / 100;
      return numQ(`(Illustrative) A farmer borrows ₹${P.toLocaleString('en-IN')} from a trader at ${rate}% interest per MONTH. How much interest does he owe after ${m} months?`, I,
        ['Interest for one month = rate% of the loan.', `${rate}% of ${P} = ${P * rate / 100}; multiply by ${m}.`], [`One month: ${rate}% of ₹${P.toLocaleString('en-IN')} = ₹${(P * rate / 100).toLocaleString('en-IN')}`, `${m} months: ₹${I.toLocaleString('en-IN')}`],
        [{ when: String(P * rate / 100), explain: 'That is the interest for one month only. Multiply by the number of months.' }], 0.001, '₹');
    }, 3),
    tp('loss', (r) => {
      const mkt = r.pick([2100, 2200, 2300, 2400]), low = mkt - r.pick([200, 250, 300, 400]), q = r.pick([10, 15, 20, 25, 30]);
      return numQ(`(Illustrative) A farmer must sell paddy to the trader who lent him money, at ₹${low.toLocaleString('en-IN')} per quintal. The market price is ₹${mkt.toLocaleString('en-IN')}. How many rupees does he lose on ${q} quintals?`, (mkt - low) * q,
        ['Find the loss on one quintal first.', `(${mkt} − ${low}) × ${q}`], [`Loss per quintal = ₹${mkt - low}`, `Total = ${mkt - low} × ${q} = ₹${((mkt - low) * q).toLocaleString('en-IN')}`], [], 0.001, '₹');
    }, 2),
    tapT('help', 'Tap the measures that can help a small farmer avoid a debt trap.', [
      ['Low-interest crop loans from banks or cooperatives', true], ['Crop insurance', true], ['Selling at MSP at procurement centres', true], ['Keeping records of loans and repayments', true],
      ['Borrowing at very high interest every season', false], ['Agreeing to sell at any price the lender sets', false], ['Ignoring the loan papers', false],
    ], ['Lower interest and fair prices help.', 'Tied sales and high interest hurt.'], 'Cheaper credit, insurance and fair prices reduce indebtedness.'),
  ]),
]);


// =====================================================================================
// Theme III — Political Systems and Governance
// Chapter 9 — Community Decision Making in a Tribe
// =====================================================================================
const ch9 = U(9, 'Community Decision Making in a Tribe', [
  O('ts6.ss.tribe.society', 'Tribal societies', [
    h('Communities with their own ways'),
    photo('🏘️', 'A small village where every family knows every other family.'),
    p('Long before there were kings, states or elected governments, people lived in communities that managed their own affairs. Many Adivasi (tribal) communities in India still have strong traditions of deciding things together. In Telangana, the Gonds, Koyas, Kolams, Thotis, Chenchus and Lambadas are some such communities.'),
    def('Tribe', 'A community whose members see themselves as related by common ancestors, share a language, customs and beliefs, and often live together in a particular region.'),
    p('In a traditional tribal society there were no very rich or very poor families, land and forest were often used in common, and people helped one another in sowing, harvesting and building houses. Rules were not written down but were remembered and passed on by the elders.'),
    keys('A tribe shares ancestry, language, customs and beliefs.', 'Land and forests were often used in common.', 'Unwritten customs guided behaviour.'),
    remember('The Gonds of Adilabad are one of the largest Adivasi communities of Telangana.'),
  ], [
    ex('Name two features that the members of a tribe share.', ['They believe they come from common ancestors.', 'They share a language and customs.'], 'Common ancestors and a shared language/customs'),
    ex('Why were rules in traditional tribal society not written down?', ['Many communities had no script for their language.', 'Rules were remembered and taught by elders through practice and stories.'], 'They were passed down orally by elders'),
  ], [
    mcq('mcq', 'Think about what binds a tribal community.', [
      ['Members of a tribe believe they share…', 'Common ancestors', ['The same bank account', 'The same factory', 'One big city'], 'They are like one big family.', 'A tribe sees itself as descended from common ancestors.'],
      ['Which of these is an Adivasi community of Telangana?', 'Gonds', ['Vikings', 'Mongols', 'Aztecs'], 'Many live in Adilabad.', 'The Gonds are a major Adivasi community of Telangana.'],
      ['In traditional tribal society, forests and grazing land were often…', 'Used in common', ['Owned by one company', 'Fenced off from everyone', 'Sold every week'], 'Shared by the community.', 'Common resources were shared by all.'],
      ['Customs of a tribe were mainly passed on by…', 'Elders, by word of mouth', ['Newspapers', 'Television', 'Government books'], 'Oral tradition.', 'Elders taught the customs orally.'],
      ['Helping one another in sowing and house-building shows…', 'Cooperation', ['Competition', 'Rivalry', 'Isolation'], 'Working together.', 'Tribal life values mutual help.'],
    ]),
    tapT('tap', 'Tap the features of a traditional tribal community.', [
      ['A shared language and customs', true], ['Belief in common ancestors', true], ['Common use of forests and grazing land', true], ['Mutual help in farm work', true], ['Elders guiding the community', true],
      ['Written laws made by a parliament', false], ['Huge differences between rich and poor families', false], ['Rule by a foreign company', false],
    ], ['Think of a close community in the forest.', 'Parliament and written laws came much later.'], 'Tribes share ancestry, language and customs, and cooperate under elders’ guidance.'),
    matchT('tribes', 'community with where many of its people live', [
      ['Gonds', 'Adilabad and nearby districts'], ['Koyas', 'Godavari valley forests'], ['Chenchus', 'Nallamala forests'], ['Kolams', 'Hills of Adilabad'], ['Lambadas', 'Thandas (hamlets) across Telangana'],
    ], ['Chenchus live in the southern Nallamala hills.', 'Lambada hamlets are called thandas.']),
  ]),
  O('ts6.ss.tribe.gond', 'The Gond panch and patla', [
    h('A village council of elders'),
    photo('👴', 'Respected elders sit together in the village council to settle matters.'),
    p('In a traditional Gond village, important matters are decided by the panch — a council of the elders of the village. It is led by the village headman, called the patla (or patel). The post of patla is often passed down within a family, but he must act according to the wishes of the panch and the customs of the community.'),
    def('Panch', 'The council of village elders that discusses and decides community matters.'),
    def('Patla (patel)', 'The headman of a Gond village who presides over the panch and represents the village.'),
    p('Other people help the panch: a priest (devari) looks after religious rites, and a messenger carries news and calls people to meetings. The panch meets in an open place, often under a big tree, where everyone can listen.'),
    stepsB('A problem is brought to the patla.', 'The messenger calls the panch and the people involved.', 'Everyone concerned is heard.', 'The elders discuss until they agree.', 'The decision is announced and everyone is expected to follow it.'),
    keys('The panch is a council of elders; the patla is its head.', 'Meetings are open and held in a public place.', 'Decisions follow custom and agreement.'),
    remember('The patla cannot act alone: he follows the advice of the panch.'),
  ], [
    ex('Who presides over a Gond panch?', ['The panch is the council of elders.', 'Its leader is the village headman.'], 'The patla (headman)'),
    ex('Why does the panch meet in an open place?', ['So everyone in the village can listen.', 'An open meeting makes the decision fair and known to all.'], 'To keep decisions open and fair'),
  ], [
    orderT('steps', 'Put the steps of a Gond panch meeting in order.', ['A problem is brought to the patla', 'The messenger calls the elders and the people involved', 'Both sides explain their case', 'The elders discuss and reach agreement', 'The decision is announced to all'], ['Calling the meeting comes before hearing.', 'The announcement is last.'], 'Raise the problem, call the panch, hear both sides, agree, announce.'),
    mcq('mcq', 'Panch = council; patla = headman.', [
      ['The council of elders in a Gond village is called the…', 'Panch', ['Parliament', 'Cabinet', 'Court of law'], 'Five or more elders.', 'The panch is the village council of elders.'],
      ['The Gond village headman is called the…', 'Patla', ['Mayor', 'Collector', 'Governor'], 'Also spelt patel.', 'The patla presides over the panch.'],
      ['The devari in a Gond village is the…', 'Priest who performs rites', ['Tax collector', 'Army general', 'Teacher'], 'Linked with religion.', 'The devari conducts religious ceremonies.'],
      ['The patla takes decisions…', 'With the advice of the panch', ['Entirely alone', 'By tossing a coin', 'Only on paper'], 'He is not a king.', 'He follows the council’s advice and custom.'],
      ['Panch meetings are usually held…', 'In an open public place', ['In secret at night', 'In a foreign country', 'Only online'], 'Under a big tree.', 'Open meetings let everyone listen.'],
    ]),
    matchT('roles', 'person or group with their role', [
      ['Patla', 'Headman who presides'], ['Panch', 'Council of elders'], ['Devari', 'Village priest'], ['Messenger', 'Calls people to meetings'], ['Villagers', 'Listen and follow decisions'],
    ], ['Patla leads; panch decides together.', 'The devari is linked with worship.']),
  ]),
  O('ts6.ss.tribe.decide', 'How the community decides: consensus and justice', [
    h('Deciding together'),
    photo('🗣️', 'In a village meeting everyone concerned gets a chance to speak.'),
    p('The panch handles many kinds of matters: the dates of festivals and sowing, sharing of forest produce, quarrels over land or cattle, marriages and family disputes, and breaking of customs. It tries to reach a decision that everyone accepts, rather than voting.'),
    def('Consensus', 'Agreement reached by discussion in which everyone accepts the final decision, even if it was not their first choice.'),
    p('Punishments were usually a fine, often paid as a feast for the village, an apology or making good the loss. The aim was to restore peace in the community rather than to punish harshly. Today Gond villages also have elected gram panchayats and courts, but in many places the traditional panch still settles everyday matters, and special laws for Adivasi areas give the gram sabha an important role.'),
    keys('The panch decides festivals, disputes and use of resources.', 'Decisions are by consensus, not voting.', 'Aim: restore peace and harmony.'),
    remember('Consensus takes longer than voting but keeps the whole community together.'),
  ], [
    ex('How is a decision by consensus different from a decision by voting?', ['In voting, the majority wins and the rest must accept.', 'In consensus, people discuss until everyone can accept the decision.'], 'Consensus seeks agreement of all; voting follows the majority'),
    ex('Two families quarrel because one family’s cattle grazed the other’s crop. What would the panch probably do?', ['Hear both families.', 'Decide the loss caused.', 'Ask the owner of the cattle to make good the loss or pay a fine, and reconcile the families.'], 'Compensation and reconciliation'),
  ], [
    tapT('tap', 'Tap the matters a traditional Gond panch would usually decide.', [
      ['The date of a village festival', true], ['A quarrel over cattle damaging crops', true], ['How to share forest produce', true], ['A family dispute', true],
      ['India’s foreign policy', false], ['The price of petrol', false], ['Railway timetables', false],
    ], ['Think of everyday village matters.', 'National matters are for other governments.'], 'The panch decides local matters of the community.'),
    mcq('mcq', 'Consensus and community justice.', [
      ['Agreement reached by discussion that everyone accepts is called…', 'Consensus', ['Majority vote', 'Dictatorship', 'Auction'], 'Con = together.', 'Consensus means agreement of all after discussion.'],
      ['The main aim of the panch’s decisions was to…', 'Restore peace in the community', ['Punish as harshly as possible', 'Make the patla rich', 'Divide the village'], 'Harmony.', 'Decisions tried to restore harmony.'],
      ['A common traditional punishment was…', 'A fine, sometimes paid as a feast for the village', ['Prison for life', 'Exile to another country', 'No punishment ever'], 'The village shares it.', 'Fines and feasts restored relations.'],
      ['Today, besides the traditional panch, Gond villages also have…', 'Elected gram panchayats', ['Kings', 'Emperors', 'No government at all'], 'Elected every five years.', 'Elected panchayats now work alongside traditions.'],
      ['Compared with voting, consensus usually…', 'Takes longer but keeps everyone together', ['Is faster but divides people', 'Needs no discussion', 'Excludes elders'], 'Discussion takes time.', 'Reaching full agreement needs patient discussion.'],
    ]),
    matchT('cmp', 'way of deciding with its description', [
      ['Consensus', 'Discuss until everyone agrees'], ['Majority vote', 'The side with more votes wins'], ['Dictatorship', 'One person decides for all'], ['Fine', 'Payment for breaking a custom'], ['Patla', 'Presides over the council'],
    ], ['Consensus = everyone agrees.', 'Dictatorship = one person.']),
  ]),
]);

// =====================================================================================
// Chapter 10 — Emergence of Kingdoms and Republics
// =====================================================================================
const ch10 = U(10, 'Emergence of Kingdoms and Republics', [
  O('ts6.ss.kingdoms.ganga', 'Janapadas and mahajanapadas of the Ganga valley', [
    h('From tribes to kingdoms'),
    photo('👑', 'About 2,500 years ago powerful kings ruled large kingdoms in the Ganga valley.'),
    p('About 3,000 years ago many groups in north India settled down as farmers. The land where a group (jana) settled came to be called a janapada. Using iron axes people cleared the thick forests of the Ganga valley, and iron ploughshares helped them grow much more grain. With extra food came more people, towns, crafts and trade.'),
    def('Janapada', 'The land where a jana (people or tribe) set foot and settled.'),
    def('Mahajanapada', 'A large and powerful janapada. By about 600 BCE there were sixteen of them, most of them ruled by kings.'),
    stepsB('Magadha (south Bihar): rich farmland, iron mines, elephants from the forests and rivers for transport — it became the most powerful.', 'Its capital was first Rajagriha (Rajgir), later Pataliputra (Patna).', 'Strong kings of Magadha included Bimbisara and Ajatashatru.', 'Assaka (Asmaka), on the Godavari, was the only mahajanapada south of the Vindhya mountains — parts of present-day Telangana and Maharashtra.'),
    keys('Jana → janapada → mahajanapada.', 'Iron tools helped clear forests and grow more food.', 'Sixteen mahajanapadas by about 600 BCE; Magadha became the strongest.', 'Assaka lay on the Godavari, in the Deccan.'),
    remember('Mahajanapada capitals were often fortified with huge walls of wood, brick or stone.'),
  ], [
    ex('Give three reasons why Magadha became powerful.', ['Fertile land near the Ganga gave plenty of food.', 'Iron mines gave tools and weapons.', 'Forests gave elephants for the army; rivers helped transport.'], 'Fertile land, iron, elephants and rivers'),
    ex('Which mahajanapada was located in the Deccan?', ['Most mahajanapadas were in the Ganga valley.', 'Only one lay south of the Vindhyas, on the Godavari.'], 'Assaka (Asmaka)'),
  ], [
    mcq('mcq', 'Jana → janapada → mahajanapada.', [
      ['How many mahajanapadas were there around 600 BCE?', 'Sixteen', ['Four', 'Thirty-three', 'One hundred'], 'Buddhist and Jaina books list them.', 'Sixteen mahajanapadas are mentioned.'],
      ['Which mahajanapada became the most powerful?', 'Magadha', ['Assaka', 'Vajji', 'Gandhara'], 'In south Bihar.', 'Magadha grew into the strongest kingdom.'],
      ['The later capital of Magadha was…', 'Pataliputra', ['Hyderabad', 'Delhi', 'Madurai'], 'Today’s Patna.', 'Pataliputra (Patna) became Magadha’s capital.'],
      ['Which metal helped clear forests and plough land?', 'Iron', ['Gold', 'Silver', 'Aluminium'], 'Axes and ploughshares.', 'Iron tools made clearing and farming easier.'],
      ['The only mahajanapada south of the Vindhyas was…', 'Assaka', ['Magadha', 'Kosala', 'Kashi'], 'On the Godavari.', 'Assaka lay in the Godavari region.'],
      ['Janapada means…', 'The land where a people settled', ['A temple', 'A coin', 'A river'], 'Jana + pada.', 'It is the land where a jana set foot.'],
    ]),
    matchT('mj', 'mahajanapada or place with its fact', [
      ['Magadha', 'Most powerful mahajanapada'], ['Rajagriha', 'First capital of Magadha'], ['Pataliputra', 'Later capital (Patna)'], ['Assaka', 'On the Godavari, in the Deccan'], ['Vajji', 'A gana with capital Vaishali'], ['Bimbisara', 'A strong king of Magadha'],
    ], ['Magadha had two capitals.', 'Vajji was a gana.']),
    tapT('tap', 'Tap the reasons Magadha grew strong.', [
      ['Fertile land along the Ganga', true], ['Iron ore mines nearby', true], ['Elephants from the forests', true], ['Rivers for transport', true],
      ['Snow-covered mountains all around', false], ['A desert with no water', false], ['No farming at all', false],
    ], ['Think of food, metal, army and transport.', 'Deserts and snow would not help.'], 'Food, iron, elephants and rivers made Magadha powerful.'),
  ]),
  O('ts6.ss.kingdoms.army', 'Kingdom, army and taxes', [
    h('How kings paid for their power'),
    photo('🐘', 'Kings kept large armies of foot soldiers, horsemen, chariots and war elephants.'),
    p('The kings of the mahajanapadas built forts and kept large armies that were paid regular salaries. To pay soldiers and officials, kings needed money, so they collected regular taxes. This was something new: earlier chiefs had depended on occasional gifts.'),
    def('Bhaga', 'The tax on crops, usually fixed at about one-sixth (1/6) of what was produced.'),
    stepsB('Farmers paid bhaga, about 1/6 of the harvest.', 'Craftspersons paid taxes in the form of labour — for example a day’s work every month for the king.', 'Herders paid in animals and animal produce.', 'Traders paid taxes on goods bought and sold.', 'Hunters and gatherers gave forest produce.'),
    p('Kings also appointed officials to collect taxes, keep accounts and look after forts. Big armies, forts and officials made the king much more powerful than a tribal chief — but they also made heavy demands on ordinary people.'),
    keys('Kings kept forts, armies and officials.', 'Bhaga was about 1/6 of crops.', 'Craftspeople, herders, traders and hunters also paid taxes.'),
    remember('One-sixth of a harvest: divide the harvest into 6 equal parts — the king takes 1.'),
  ], [
    ex('A farmer harvests 60 bags of grain. If the bhaga is 1/6, how many bags go to the king?', ['60 ÷ 6 = 10.'], '10 bags'),
    ex('Why did the new kings need regular taxes?', ['They had large armies paid regular salaries.', 'They had officials and forts to maintain.', 'Occasional gifts were not enough.'], 'To pay armies, officials and build forts'),
  ], [
    tp('bhaga', (r) => {
      const k = r.int(3, 20), total = 6 * k;
      const crop = r.pick(['rice', 'wheat', 'barley', 'millet']);
      const n = r.pick(['A farmer', 'A farming family', 'A village farmer']);
      return numQ(`${n} harvests ${total} bags of ${crop}. If the king’s tax (bhaga) is one-sixth of the harvest, how many bags must be paid?`, k,
        ['One-sixth means divide by 6.', `${total} ÷ 6`], [`${total} ÷ 6 = ${k} bags`, `The farmer keeps ${total - k} bags.`],
        [{ when: String(total - k), explain: 'That is what the farmer keeps. The tax is the one-sixth part.' }, { when: String(total * 6), explain: 'One-sixth means divide by 6, not multiply.' }], 0.001, 'bags');
    }, 2),
    matchT('tax', 'person with how they paid tax', [
      ['Farmer', 'About 1/6 of the crop (bhaga)'], ['Craftsperson', 'A day’s labour for the king'], ['Herder', 'Animals and animal produce'], ['Trader', 'Tax on goods bought and sold'], ['Hunter-gatherer', 'Forest produce'],
    ], ['Bhaga is for farmers.', 'Craftspeople often paid in labour.']),
    mcq('mcq', 'Armies, forts and taxes.', [
      ['The tax on crops was called…', 'Bhaga', ['Salary', 'Rent', 'Fee'], 'It means a share.', 'Bhaga was the king’s share of crops.'],
      ['Bhaga was usually about…', 'One-sixth of the crop', ['Half of the crop', 'All of the crop', 'One-hundredth of the crop'], '1 out of 6 parts.', 'The usual rate was 1/6.'],
      ['Soldiers in the new armies were…', 'Paid regular salaries', ['Never paid', 'Paid only in songs', 'Only volunteers'], 'Hence the need for taxes.', 'Regular pay needed regular taxes.'],
      ['Why did kings build huge walls around capitals?', 'For protection from attacks and to show power', ['To keep rivers out', 'For decoration only', 'To stop rain'], 'Forts.', 'Fortifications protected and impressed.'],
      ['Craftspersons often paid tax as…', 'Labour, e.g. a day’s work a month', ['Gold only', 'Elephants', 'Land'], 'They gave their work.', 'Craftspeople often paid in labour.'],
    ]),
  ]),
  O('ts6.ss.kingdoms.vajji', 'The Vajji gana: an early republic', [
    h('Many rulers instead of one king'),
    photo('🗣️', 'In a gana, decisions were discussed in an assembly rather than made by one king.'),
    p('Not every mahajanapada had a king. The Vajjis, with their capital at Vaishali (in Bihar), had a different kind of government called a gana or sangha. Many men, each called a raja, met together in an assembly. They discussed matters and took decisions together — about war, peace, taxes and justice.'),
    def('Gana (sangha)', 'A form of government in which power was shared by a group of rulers who met in an assembly, instead of a single hereditary king.'),
    p('The Buddha belonged to a gana (the Shakyas) and is said to have praised the Vajjis: as long as they met often, discussed together and respected their elders and customs, they would prosper. But the gana was not open to everyone: women, slaves and labourers (dasas and kammakaras) could not take part in the assemblies.'),
    p('Magadha’s kings tried to conquer the Vajjis. Ajatashatru of Magadha finally defeated them, but some ganas lasted for many centuries more.'),
    keys('Vajji gana: capital Vaishali; many rajas met in an assembly.', 'Decisions by discussion.', 'Women, slaves and labourers were excluded.', 'Conquered by Ajatashatru of Magadha.'),
    remember('A gana is an early example of shared rule, but it was not a democracy as we know it today, because many people could not take part.'),
  ], [
    ex('How was the Vajji gana different from Magadha?', ['Magadha was ruled by one king whose son usually succeeded him.', 'The Vajji gana was ruled by many rajas meeting in an assembly.'], 'One king vs. a group deciding together'),
    ex('Why can we not call the Vajji gana a full democracy?', ['In a democracy all adult citizens take part.', 'In the gana, women, slaves and labourers could not participate.'], 'Because many people were excluded'),
  ], [
    mcq('mcq', 'Gana = shared rule in an assembly.', [
      ['The capital of the Vajji gana was…', 'Vaishali', ['Pataliputra', 'Rajagriha', 'Ujjain'], 'In north Bihar.', 'Vaishali was the Vajji capital.'],
      ['In a gana, decisions were taken by…', 'Many rajas in an assembly', ['One king alone', 'Foreign rulers', 'Lottery'], 'Shared rule.', 'Rajas discussed and decided together.'],
      ['Who could NOT take part in the gana’s assembly?', 'Women, slaves and labourers', ['The rajas', 'Elder rajas', 'Members of the assembly'], 'Not everyone was included.', 'Women, dasas and kammakaras were excluded.'],
      ['Which king of Magadha defeated the Vajjis?', 'Ajatashatru', ['Ashoka', 'Kanishka', 'Samudragupta'], 'Son of Bimbisara.', 'Ajatashatru conquered the Vajjis.'],
      ['The Buddha belonged to which gana?', 'The Shakyas', ['The Mauryas', 'The Guptas', 'The Kushanas'], 'Shakyamuni.', 'The Buddha was a Shakya.'],
    ]),
    tapT('tap', 'Tap the statements that describe the Vajji gana.', [
      ['Power was shared by many rajas', true], ['Matters were discussed in an assembly', true], ['Its capital was Vaishali', true], ['Women and slaves could not take part', true],
      ['One king ruled and passed the throne to his son', false], ['Every adult citizen could vote', false], ['It was in the Deccan', false],
    ], ['Gana = many rulers, an assembly.', 'It was not a full democracy.'], 'The gana shared power among rajas meeting in an assembly, but excluded many.'),
    matchT('cmp', 'feature with the type of state', [
      ['Ruled by one hereditary king', 'Monarchy, like Magadha'], ['Ruled by an assembly of rajas', 'Gana, like the Vajjis'], ['All adults vote for leaders', 'Modern democracy'], ['Capital at Vaishali', 'Vajji gana'], ['Capital at Rajagriha', 'Magadha'],
    ], ['Magadha had kings.', 'Vajji had an assembly.']),
  ]),
]);

// =====================================================================================
// Chapter 11 — First Empires
// =====================================================================================
const ch11 = U(11, 'First Empires', [
  O('ts6.ss.empire.maurya', 'The Mauryan empire', [
    h('India’s first great empire'),
    photo('👑', 'The Mauryan rulers controlled a vast area from Afghanistan to Karnataka.'),
    p('About 2,300 years ago Chandragupta Maurya, helped by a wise adviser named Chanakya (also called Kautilya), took over Magadha and built the first large empire in India. An empire is much bigger than a kingdom: it includes many regions with different peoples, ruled from one centre.'),
    def('Empire', 'A large state formed when one ruler brings many kingdoms or regions under his control.'),
    stepsB('Capital: Pataliputra, a huge city with wooden walls and many gates.', 'Provincial capitals: Taxila (north-west), Ujjain (west), Tosali (Kalinga) and Suvarnagiri (south).', 'Areas around the capital were ruled directly; distant areas through governors, often princes.', 'Officials collected taxes, punished wrongdoers and checked roads and markets.'),
    p('We know about the Mauryas from the Arthashastra — a book on statecraft linked with Chanakya — and from the accounts of Megasthenes, an ambassador from the Greek ruler of West Asia who lived at Pataliputra, and from Ashoka’s inscriptions.'),
    keys('Founder: Chandragupta Maurya (about 321 BCE), with Chanakya.', 'Capital: Pataliputra.', 'Sources: Arthashastra, Megasthenes’ Indica, Ashoka’s inscriptions.'),
    remember('An empire rules many different regions, so it needs officials, roads and a large army.'),
  ], [
    ex('How is an empire different from a kingdom?', ['A kingdom usually covers one region.', 'An empire includes many regions and peoples under one ruler.'], 'An empire is larger and rules many regions'),
    ex('Name two sources for Mauryan history.', ['The Arthashastra of Kautilya on how to govern.', 'Megasthenes’ account of Pataliputra.'], 'Arthashastra and Megasthenes (also Ashoka’s inscriptions)'),
  ], [
    mcq('mcq', 'Chandragupta, Chanakya, Pataliputra.', [
      ['Who founded the Mauryan empire?', 'Chandragupta Maurya', ['Ashoka', 'Samudragupta', 'Kanishka'], 'Helped by Chanakya.', 'Chandragupta Maurya founded it around 321 BCE.'],
      ['Chanakya is linked with the book…', 'Arthashastra', ['Ramayana', 'Indica', 'Jataka'], 'A book on statecraft.', 'The Arthashastra deals with how to govern.'],
      ['Megasthenes was…', 'A Greek ambassador at Pataliputra', ['A Mauryan king', 'A Buddhist monk', 'A Gupta poet'], 'He wrote the Indica.', 'He described the Mauryan capital.'],
      ['The Mauryan capital was…', 'Pataliputra', ['Vaishali', 'Taxila', 'Kotilingala'], 'Today’s Patna.', 'Pataliputra was the capital.'],
      ['Distant provinces were usually ruled by…', 'Governors, often princes', ['Nobody', 'Foreign kings', 'Village children'], 'The emperor appointed them.', 'Princes served as governors of provinces.'],
      ['Which was a Mauryan provincial capital in the north-west?', 'Taxila', ['Ujjain', 'Tosali', 'Suvarnagiri'], 'Famous for learning.', 'Taxila was the north-western centre.'],
    ]),
    matchT('places', 'Mauryan centre with its region', [
      ['Pataliputra', 'Capital of the empire'], ['Taxila', 'North-west province'], ['Ujjain', 'Western province'], ['Tosali', 'Kalinga (Odisha)'], ['Suvarnagiri', 'Southern province (Karnataka)'],
    ], ['Tosali was in Kalinga.', 'Suvarnagiri means “golden mountain”.']),
    tapT('tap', 'Tap the sources that tell us about the Mauryas.', [
      ['The Arthashastra', true], ['Megasthenes’ Indica', true], ['Ashoka’s rock and pillar inscriptions', true], ['Coins and remains of Pataliputra', true],
      ['Television news reports', false], ['A modern film', false], ['A newspaper from 1950', false],
    ], ['Sources must come from that time or close to it.', 'Modern media are not original sources.'], 'Books, foreign accounts, inscriptions and archaeology are sources.'),
  ]),
  O('ts6.ss.empire.ashoka', 'Ashoka and his dhamma', [
    h('A king who gave up war'),
    photo('🕊️', 'After the Kalinga war Ashoka chose the path of peace and dhamma.'),
    p('Ashoka, Chandragupta’s grandson, is the best-known Mauryan ruler. About eight years after becoming king he fought a war to conquer Kalinga (in present-day Odisha), around 261 BCE. Thousands were killed, wounded or taken captive. Seeing this suffering, Ashoka was filled with sorrow and decided never to fight a war of conquest again.'),
    def('Dhamma', 'Ashoka’s message of good conduct for all: respect elders and teachers, be kind to servants and slaves, respect all religions, do not harm living beings, and live peacefully.'),
    p('Ashoka spread his message through inscriptions carved on rocks and pillars, written mostly in the Prakrit language in the Brahmi script. Officials called dhamma mahamattas travelled to teach it. He built roads, wells and rest-houses and arranged medical care for people and animals. The lion capital of his pillar at Sarnath is India’s national emblem, and the wheel on it appears on our national flag.'),
    keys('Kalinga war, about 261 BCE, changed Ashoka.', 'Dhamma: kindness, tolerance, non-violence, respect.', 'Inscriptions in Prakrit, Brahmi script.', 'Sarnath lion capital = national emblem.'),
    remember('Ashoka’s dhamma was not a new religion; it was a set of values meant for people of all faiths.'),
  ], [
    ex('Why did Ashoka give up war?', ['The Kalinga war caused enormous death and suffering.', 'He was filled with regret.', 'He decided to rule through dhamma instead.'], 'Because of the suffering caused by the Kalinga war'),
    ex('Chandragupta founded the empire in about 321 BCE; the Kalinga war was in about 261 BCE. How many years apart?', ['Both are BCE: subtract the smaller number from the bigger.', '321 − 261 = 60.'], 'About 60 years'),
  ], [
    yearsT('gap', [
      ['Chandragupta Maurya founded the empire', -321, 'Ashoka fought the Kalinga war', -261],
      ['Ashoka fought the Kalinga war', -261, 'Gautamiputra Satakarni ruled the Satavahanas (approximate start)', 106],
      ['Chandragupta Maurya founded the empire', -321, 'Chandragupta I began the Gupta era', 320],
      ['Ashoka fought the Kalinga war', -261, 'Kanishka began his rule (about)', 78],
      ['Kanishka began his rule (about)', 78, 'Chandragupta I began the Gupta era', 320],
      ['The Buddha is said to have attained enlightenment (about)', -528, 'Ashoka fought the Kalinga war', -261],
    ]),
    mcq('mcq', 'Kalinga, dhamma and inscriptions.', [
      ['Ashoka’s war that changed his life was fought against…', 'Kalinga', ['Magadha', 'Assaka', 'Gandhara'], 'Present-day Odisha.', 'The Kalinga war led to his change of heart.'],
      ['Ashoka’s inscriptions were mostly in…', 'Prakrit, in the Brahmi script', ['English', 'Modern Hindi', 'Latin'], 'Language of ordinary people then.', 'Most edicts use Prakrit written in Brahmi.'],
      ['India’s national emblem comes from Ashoka’s pillar at…', 'Sarnath', ['Delhi', 'Hyderabad', 'Mumbai'], 'Near Varanasi.', 'The Sarnath lion capital is our emblem.'],
      ['Officials who spread dhamma were called…', 'Dhamma mahamattas', ['Patlas', 'Sarpanches', 'Mayors'], 'Special officers.', 'Dhamma mahamattas taught the message.'],
      ['Which is part of Ashoka’s dhamma?', 'Respect for all religions', ['Conquering more lands by war', 'Harming animals for sport', 'Disrespecting elders'], 'Tolerance.', 'Dhamma taught tolerance and kindness.'],
      ['The wheel on our national flag comes from…', 'Ashoka’s pillar', ['A bullock cart', 'A temple chariot', 'A potter’s wheel'], 'It has 24 spokes.', 'The Ashoka Chakra comes from his pillar capital.'],
    ]),
    tapT('tap', 'Tap the things Ashoka did to spread dhamma and help people.', [
      ['Carved messages on rocks and pillars', true], ['Sent officials to teach dhamma', true], ['Built roads, wells and rest-houses', true], ['Arranged medical care for people and animals', true],
      ['Started many new wars of conquest', false], ['Banned all religions except one', false], ['Stopped people from travelling', false],
    ], ['Think of peace, welfare and teaching.', 'He gave up wars of conquest.'], 'Ashoka spread dhamma through inscriptions, officials and welfare work.'),
  ]),
  O('ts6.ss.empire.others', 'Other early empires: Satavahanas, Kushanas and Guptas', [
    h('After the Mauryas'),
    photo('🪙', 'Coins with kings’ names and pictures help historians trace early empires.'),
    p('The Mauryan empire broke up about 50 years after Ashoka. New powers rose in different parts of India.'),
    def('Satavahanas', 'A dynasty that ruled the Deccan, including Telangana, from about the 1st century BCE to the 3rd century CE. Early centres were in Telangana (such as Kotilingala and Dhulikatta in Karimnagar region); later capitals were Pratishthana (Paithan) and Dhanyakataka (Amaravati). Gautamiputra Satakarni was their most famous ruler.'),
    def('Kushanas', 'Rulers of a large empire from Central Asia to north-west India around 2,000 years ago; Kanishka was their best-known king. They controlled part of the Silk Route and supported Buddhism.'),
    def('Guptas', 'A dynasty that ruled a large part of north India from about 320 CE. Samudragupta’s conquests were praised in a long inscription (prashasti) on a pillar at Prayagraj; Chandragupta II was a patron of poets such as Kalidasa.'),
    stepsB('Mauryas: about 321 BCE onwards (Pataliputra).', 'Satavahanas: about 1st century BCE – 3rd century CE (Deccan).', 'Kushanas: about 1st–3rd century CE (north-west and Central Asia).', 'Guptas: from about 320 CE (north India).'),
    keys('Satavahanas ruled the Deccan; early centres in Telangana.', 'Kushanas: Kanishka, Silk Route, Buddhism.', 'Guptas: Samudragupta, Chandragupta II, Kalidasa.'),
    remember('Kotilingala in Jagtial district has yielded some of the earliest Satavahana coins.'),
  ], [
    ex('Which early dynasty ruled over Telangana and the Deccan after the Mauryas?', ['The Mauryas declined after Ashoka.', 'In the Deccan, the Satavahanas rose to power.'], 'The Satavahanas'),
    ex('Arrange in time order: Guptas, Mauryas, Satavahanas.', ['Mauryas — from about 321 BCE.', 'Satavahanas — from about the 1st century BCE.', 'Guptas — from about 320 CE.'], 'Mauryas → Satavahanas → Guptas'),
  ], [
    timelineT('tl', 'Put these early empires in time order (earliest first).', [
      [-321, 'Chandragupta Maurya founds the Mauryan empire', 'about 321 BCE'], [-261, 'Ashoka’s Kalinga war', 'about 261 BCE'],
      [-100, 'Satavahanas rise in the Deccan', 'about 1st century BCE'], [78, 'Kanishka’s rule begins (Kushanas)', 'about 78 CE'], [320, 'Gupta rule begins', 'about 320 CE'], [380, 'Chandragupta II rules the Guptas', 'about 380 CE'],
    ], ['The Mauryas come first.', 'The Guptas are the latest here.']),
    matchT('who', 'dynasty or ruler with its fact', [
      ['Satavahanas', 'Ruled the Deccan; early centres in Telangana'], ['Gautamiputra Satakarni', 'Famous Satavahana king'], ['Kanishka', 'Kushana king who supported Buddhism'], ['Samudragupta', 'Gupta conqueror praised in the Prayagraj inscription'], ['Kalidasa', 'Poet at the time of the Guptas'], ['Kotilingala', 'Site of early Satavahana coins'],
    ], ['Kushanas = Kanishka.', 'Satavahanas = Deccan.']),
    mcq('mcq', 'Who ruled where?', [
      ['Which dynasty ruled the Deccan after the Mauryas?', 'Satavahanas', ['Guptas', 'Kushanas', 'Mughals'], 'Early centres in Karimnagar region.', 'The Satavahanas ruled the Deccan.'],
      ['Kanishka belonged to the…', 'Kushana dynasty', ['Maurya dynasty', 'Gupta dynasty', 'Satavahana dynasty'], 'From Central Asia.', 'Kanishka was the best-known Kushana ruler.'],
      ['The Gupta period began in about…', '320 CE', ['321 BCE', '1947 CE', '600 BCE'], 'Fourth century CE.', 'Gupta rule began around 320 CE.'],
      ['Samudragupta’s conquests are described in an inscription at…', 'Prayagraj', ['Sarnath', 'Hyderabad', 'Madurai'], 'On an older Ashokan pillar.', 'The Prayagraj pillar carries his prashasti.'],
      ['A later Satavahana capital on the Krishna was…', 'Dhanyakataka (Amaravati)', ['Pataliputra', 'Vaishali', 'Taxila'], 'Famous for a great stupa.', 'Dhanyakataka was near Amaravati.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 12 — Democratic Government
// =====================================================================================
const ch12 = U(12, 'Democratic Government', [
  O('ts6.ss.govt.what', 'What governments do', [
    h('Why do we need a government?'),
    photo('🏢', 'Government offices run services such as schools, hospitals, water supply and roads.'),
    p('Think of the things you used today: the road to school, water from the tap, the school building and textbooks, the ration shop, a hospital nearby. Many of these are provided or regulated by the government. A government makes decisions and rules for everyone in a country or state and makes sure they are followed.'),
    def('Government', 'The group of people and institutions that make and carry out laws and decisions for a country, a state or a local area.'),
    def('Law', 'A rule made by the government that applies to everyone and can be enforced.'),
    stepsB('Makes laws and enforces them (police, courts).', 'Protects the country’s borders and keeps peace.', 'Provides services: schools, hospitals, roads, water, electricity.', 'Helps people in need: pensions, ration, support in floods and droughts.', 'Collects taxes to pay for all this.'),
    keys('Governments make laws and decisions for all.', 'They provide services and protect people.', 'Taxes pay for government work.'),
    remember('Courts settle disputes and check that laws are followed — even by the government.'),
  ], [
    ex('A cyclone damages many houses in a district. What might the government do?', ['Rescue people and open relief camps.', 'Provide food, water and medical help.', 'Give money to rebuild houses and restore roads and power.'], 'Rescue, relief and rebuilding'),
    ex('Where does the government get money to build schools and roads?', ['People and businesses pay taxes.', 'Taxes are used for public services.'], 'From taxes'),
  ], [
    tapT('tap', 'Tap the jobs that a government does.', [
      ['Makes laws', true], ['Runs schools and hospitals', true], ['Builds roads and supplies water', true], ['Protects the borders', true], ['Collects taxes', true],
      ['Decides what you eat for breakfast', false], ['Chooses your friends', false], ['Picks your favourite colour', false],
    ], ['Think of things done for everyone together.', 'Personal choices are yours.'], 'Governments handle laws, services, security and taxes.'),
    mcq('mcq', 'What and why of government.', [
      ['A rule made by the government that applies to everyone is a…', 'Law', ['Hobby', 'Habit', 'Game'], 'It can be enforced.', 'Laws apply to all and are enforced.'],
      ['Disputes between people are settled by…', 'Courts', ['Shops', 'Cinemas', 'Sports clubs'], 'Judges.', 'Courts decide disputes according to law.'],
      ['Government services are mainly paid for by…', 'Taxes', ['Lottery prizes only', 'Gifts from film stars', 'Nothing'], 'People and businesses pay them.', 'Taxes fund public services.'],
      ['Who protects India’s borders?', 'The armed forces', ['Farmers', 'Shopkeepers', 'Students'], 'Army, navy, air force.', 'The armed forces defend the country.'],
      ['Ration shops that supply rice at low prices are part of…', 'Government help for people in need', ['Private business only', 'A sports scheme', 'Foreign aid only'], 'Public distribution system.', 'The government runs the ration system.'],
    ]),
    matchT('who', 'need with the government service that meets it', [
      ['Sick person', 'Government hospital'], ['Child wanting to learn', 'Government school'], ['Thirsty village', 'Drinking water scheme'], ['Theft complaint', 'Police station'], ['Dispute over land', 'Court'], ['Family in poverty', 'Ration card and pensions'],
    ], ['Match each need with the right office.', 'Courts settle disputes.']),
  ]),
  O('ts6.ss.govt.types', 'Types of government', [
    h('Who holds power?'),
    photo('👑', 'In a monarchy, power passes within the royal family.'),
    p('Governments differ in who holds power and how they get it. In a monarchy a king or queen rules and the throne passes to a family member. In a dictatorship one person or a small group takes power, often by force, and people cannot question or remove them. In a democracy the people choose their rulers in elections and can change them.'),
    def('Monarchy', 'Rule by a king or queen whose position is inherited.'),
    def('Dictatorship', 'Rule by one person or group who holds all power without the people’s consent and does not allow free elections or criticism.'),
    def('Democracy', 'Government by the people: citizens elect representatives, who must answer to them, and can replace them in the next election.'),
    p('Today some countries keep a king or queen only as a ceremonial head, while elected leaders actually govern — these are called constitutional monarchies, like the United Kingdom. India became a democratic republic in 1950, when its Constitution came into force; our head of state, the President, is elected, not born to the post.'),
    keys('Monarchy: inherited ruler.', 'Dictatorship: power without consent.', 'Democracy: elected, accountable rulers.'),
    remember('India is a democratic republic: no position of power is inherited.'),
  ], [
    ex('In a country, the ruler’s son becomes ruler after him. What type of government is this?', ['Power passes within a family.', 'That is the mark of a monarchy.'], 'Monarchy'),
    ex('Why is it hard to remove a dictator?', ['A dictator holds all power and controls the army and police.', 'There are no free elections, and criticism is punished.'], 'There are no free elections and opposition is not allowed'),
  ], [
    tp('which', (r) => {
      const bank: [string, string][] = [
        ['The ruler’s eldest child becomes the next ruler.', 'Monarchy'], ['A general seizes power with the army and bans elections.', 'Dictatorship'], ['Citizens vote every five years to choose who will govern.', 'Democracy'],
        ['Newspapers are not allowed to criticise the single ruler.', 'Dictatorship'], ['A queen inherits the throne from her father.', 'Monarchy'], ['People can vote out a government they are unhappy with.', 'Democracy'],
        ['Many parties compete in free elections.', 'Democracy'], ['One person rules for life and no one may oppose him.', 'Dictatorship'],
      ];
      const [s, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Which type of government does this describe? “${s}”`, ...choose(r, a, ['Monarchy', 'Dictatorship', 'Democracy'].filter((x) => x !== a)),
        hints: ['Ask: how did the ruler get power — by birth, by force, or by the people’s vote?', 'Can the people remove the ruler?'],
        mistakes: [{ when: 'wrong', explain: 'Birth = monarchy; force without consent = dictatorship; election by the people = democracy.' }],
        solution: [`“${s}”`, `This is a sign of ${a.toLowerCase()}.`],
      };
    }, 1),
    mcq('mcq', 'Birth, force or vote?', [
      ['India became a republic in…', '1950', ['1947', '1857', '1999'], 'When the Constitution came into force.', 'The Constitution took effect on 26 January 1950.'],
      ['In a democracy, rulers are chosen by…', 'The people, through elections', ['Birth', 'Force', 'Lottery'], 'Vote.', 'Elections let people choose and change rulers.'],
      ['A country with a king as a ceremonial head but elected leaders who govern is a…', 'Constitutional monarchy', ['Dictatorship', 'Gana', 'Tribe'], 'Like the United Kingdom.', 'The monarch has a ceremonial role only.'],
      ['India’s head of state is the…', 'President', ['King', 'Emperor', 'Dictator'], 'Elected, not born to the post.', 'The President is India’s elected head of state.'],
      ['Which is a sign of dictatorship?', 'No free elections or criticism allowed', ['Free and regular elections', 'Many political parties', 'A free press'], 'Power without consent.', 'Dictators do not allow opposition.'],
    ]),
    matchT('types', 'type of government with its key feature', [
      ['Monarchy', 'Ruler by birth'], ['Dictatorship', 'Ruler by force, no free elections'], ['Democracy', 'Rulers elected by the people'], ['Republic', 'Head of state is not hereditary'], ['Constitutional monarchy', 'King or queen with only a ceremonial role'],
    ], ['Democracy = elections.', 'Republic = no hereditary head.']),
  ]),
  O('ts6.ss.govt.levels', 'Democratic government and its levels', [
    h('Government by the people'),
    photo('🙋', 'In a democracy every adult citizen has the right to vote and to speak out.'),
    p('In India, every citizen aged 18 years or more can vote, whatever their religion, caste, gender, wealth or education. This is called universal adult franchise. Voters elect representatives, who make laws and decisions on their behalf. If people are unhappy, they can vote for someone else at the next election, which is normally held every five years.'),
    def('Universal adult franchise', 'The right of all adult citizens (18 years and above in India) to vote, without discrimination.'),
    def('Representative', 'A person elected by the people to speak and decide for them, such as an MLA or an MP.'),
    stepsB('Local level: gram panchayats in villages, municipalities in towns — look after water, streets, sanitation.', 'State level: the Legislative Assembly (MLAs) and the state government at Hyderabad — look after police, state roads, agriculture, schools.', 'Union (national) level: Parliament (MPs) and the Union government at New Delhi — look after defence, railways, currency, foreign relations.'),
    p('Telangana elects 119 MLAs to its Legislative Assembly and 17 MPs to the Lok Sabha. Besides voting, citizens take part in democracy by discussing issues, writing to newspapers, joining peaceful protests and attending gram sabha meetings.'),
    keys('All citizens aged 18+ can vote.', 'Three levels: local, state, union.', 'Elections usually every 5 years.'),
    remember('Democracy also means respecting others’ views and the rights of minorities, not just voting.'),
  ], [
    ex('Kavya turned 18 in March. Her brother is 16. Who can vote in elections this year?', ['The voting age in India is 18.', 'Kavya is 18; her brother is not yet 18.'], 'Kavya only'),
    ex('Which level of government would you approach about a broken street light in your village?', ['Street lights are a local matter.', 'In a village, the gram panchayat looks after them.'], 'The local level — the gram panchayat'),
  ], [
    tp('vote', (r) => {
      const born = r.int(2000, 2012), year = r.pick([2024, 2026, 2028, 2029]);
      const age = year - born, can = age >= 18;
      const n = who(r);
      return {
        type: 'mcq', prompt: `${n} was born in January ${born}. Will ${n} be old enough to vote in an election held in December ${year}?`,
        ...choose(r, can ? `Yes — ${n} will be ${age}` : `No — ${n} will be only ${age}`, [can ? `No — ${n} will be only ${age}` : `Yes — ${n} will be ${age}`]),
        hints: ['The voting age in India is 18.', `Age in December ${year} = ${year} − ${born}.`],
        mistakes: [{ when: 'wrong', explain: `Work out the age: ${year} − ${born} = ${age}, then compare it with 18.` }],
        solution: [`${year} − ${born} = ${age} years old.`, can ? `${age} ≥ 18, so ${n} can vote.` : `${age} is less than 18, so ${n} cannot vote yet.`],
      };
    }, 1),
    matchT('lvl', 'task with the level of government that handles it', [
      ['Village drinking water and street lights', 'Gram panchayat (local)'], ['Town drainage and garbage', 'Municipality (local)'], ['State police and state highways', 'State government'], ['Defence of the country', 'Union government'], ['Railways and currency notes', 'Union government (Parliament)'], ['Laws made by MLAs', 'State Legislative Assembly'],
    ], ['Nearby daily needs = local.', 'Whole-country matters = union.'], 4, 2),
    mcq('mcq', 'Universal adult franchise and representatives.', [
      ['The voting age in India is…', '18 years', ['21 years', '16 years', '25 years'], 'Lowered from 21 in 1989.', 'Citizens aged 18 or above can vote.'],
      ['Members elected to the State Legislative Assembly are called…', 'MLAs', ['MPs', 'Sarpanches', 'Mayors'], 'Member of Legislative Assembly.', 'MLAs are elected to the state assembly.'],
      ['How many MLAs does Telangana elect?', '119', ['543', '17', '33'], 'Assembly constituencies.', 'Telangana’s assembly has 119 elected seats.'],
      ['Elections to Parliament and the Assembly are normally held every…', '5 years', ['1 year', '10 years', '20 years'], 'A fixed term.', 'Their normal term is five years.'],
      ['Universal adult franchise means…', 'Every adult citizen can vote', ['Only rich people vote', 'Only men vote', 'Only educated people vote'], 'Universal = all.', 'All adult citizens vote without discrimination.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 13 — Village Panchayats
// =====================================================================================
const ch13 = U(13, 'Village Panchayats', [
  O('ts6.ss.pr.sabha', 'Gram sabha and the formation of a gram panchayat', [
    h('Democracy in the village'),
    photo('🏘️', 'Each village or group of villages elects its own gram panchayat.'),
    p('Many decisions that affect a village — where to lay a drain, which street needs a light, who should get a house under a scheme — are best made in the village itself. For this India has panchayati raj: elected local governments in rural areas. A constitutional amendment (the 73rd, in force from 1993) made them compulsory everywhere, with elections every five years.'),
    def('Gram sabha', 'The meeting of all adults in the village whose names are on the voters’ list. It discusses village plans and the panchayat’s work and accounts.'),
    def('Gram panchayat', 'The elected council of a village (or group of villages) that runs local affairs.'),
    stepsB('The village is divided into wards based on population.', 'Voters of each ward elect a ward member.', 'All voters of the village directly elect the sarpanch.', 'The ward members elect an upa-sarpanch from among themselves.', 'Seats are reserved for women (half in Telangana), Scheduled Castes, Scheduled Tribes and Backward Classes.'),
    keys('Gram sabha = all village voters.', 'Gram panchayat = elected council; term 5 years.', 'Wards elect ward members; voters elect the sarpanch.', 'Reservation ensures women and weaker sections are represented.'),
    remember('The gram sabha is the foundation: it can question the panchayat and must approve village plans.'),
  ], [
    ex('Who are the members of a gram sabha?', ['Every adult whose name is on the village voters’ list.', 'So all voters of the village.'], 'All adult voters of the village'),
    ex('A gram panchayat has 10 wards. If half the seats are reserved for women, how many wards will have women members?', ['Half of 10 = 5.'], '5 wards'),
  ], [
    tp('res', (r) => {
      const w = r.pick([6, 8, 10, 12, 14, 16, 18, 20]);
      return numQ(`A gram panchayat in Telangana has ${w} wards. Half of the seats are reserved for women. How many seats are reserved for women?`, w / 2,
        ['Half means divide by 2.', `${w} ÷ 2`], [`${w} ÷ 2 = ${w / 2} seats`], [{ when: String(w * 2), explain: 'Half means divide by 2, not multiply.' }], 0.001, 'seats');
    }, 1),
    orderT('form', 'Put the steps in forming a gram panchayat in order.', ['The village is divided into wards', 'Seats are reserved for women, SC, ST and BC by rotation', 'Voters elect ward members and the sarpanch', 'Ward members elect the upa-sarpanch', 'The panchayat starts its five-year term'], ['Wards are drawn first.', 'The upa-sarpanch is chosen after the election.'], 'Make wards, reserve seats, elect, choose the upa-sarpanch, begin the term.'),
    mcq('mcq', 'Gram sabha and gram panchayat.', [
      ['The gram sabha consists of…', 'All adult voters of the village', ['Only the sarpanch', 'Only ward members', 'Only government officers'], 'Everyone on the voters’ list.', 'All village voters form the gram sabha.'],
      ['The sarpanch is elected by…', 'All the voters of the village directly', ['Only ward members', 'The Collector', 'The Chief Minister'], 'Direct election.', 'In Telangana villagers directly elect the sarpanch.'],
      ['The upa-sarpanch is elected by…', 'The ward members', ['All voters directly', 'The MLA', 'The President'], 'From among themselves.', 'Ward members choose the upa-sarpanch.'],
      ['A gram panchayat’s term is…', '5 years', ['1 year', '10 years', 'For life'], 'Like other elected bodies.', 'Panchayat elections are held every five years.'],
      ['Panchayati raj was made compulsory everywhere by the…', '73rd Constitutional Amendment', ['Indian Railways Act', 'Ration Card rule', 'School timetable'], 'In force from 1993.', 'The 73rd Amendment made panchayats a constitutional body.'],
    ]),
  ]),
  O('ts6.ss.pr.sarpanch', 'Sarpanch, upa-sarpanch, functions and funds', [
    h('Running the village'),
    photo('💧', 'Safe drinking water is one of the most important duties of a gram panchayat.'),
    p('The sarpanch presides over panchayat meetings and leads its work; the upa-sarpanch helps and takes over when the sarpanch is absent. A panchayat secretary, a government employee, keeps records and accounts and carries out decisions.'),
    stepsB('Supply drinking water and maintain taps and tanks.', 'Keep the village clean: drains, garbage, sanitation.', 'Lay and repair village roads; fix street lights.', 'Register births and deaths; maintain village records.', 'Look after markets, fairs, tree planting, play areas and burial grounds.', 'Help choose beneficiaries for government schemes.'),
    def('Panchayat funds', 'Money the panchayat gets from local taxes (house tax, water charges, fees from markets and shops) and grants from the state and central governments.'),
    p('Every rupee spent must be recorded, and the accounts are placed before the gram sabha. When villagers ask questions about the work and spending, the panchayat becomes more honest and effective.'),
    bars(['Grants from government', 'House tax', 'Water charges', 'Market fees'], [70, 15, 10, 5], '% of income', 'Illustrative: a village panchayat’s income often comes mostly from government grants, with smaller amounts from local taxes and fees.'),
    keys('Sarpanch leads; upa-sarpanch assists; secretary keeps records.', 'Functions: water, sanitation, roads, lights, records.', 'Funds: local taxes and fees + government grants.'),
    remember('Accounts must be shown to the gram sabha — this keeps the panchayat accountable.'),
  ], [
    ex('A panchayat collects ₹3,00,000 in house tax and gets ₹12,00,000 in grants. What is its total income?', ['3,00,000 + 12,00,000 = 15,00,000.'], '₹15,00,000'),
    ex('Who keeps the records and accounts of the gram panchayat?', ['Elected members decide.', 'A government employee keeps the records and accounts.'], 'The panchayat secretary'),
  ], [
    tp('budget', (r) => {
      const tax = r.pick([2, 3, 4, 5]) * 100000, grant = r.pick([8, 10, 12, 15, 20]) * 100000;
      const total = tax + grant;
      return numQ(`(Illustrative) A gram panchayat collects ₹${tax.toLocaleString('en-IN')} from house tax and fees and receives ₹${grant.toLocaleString('en-IN')} as grants. What is its total income in rupees?`, total,
        ['Total income = own income + grants.', `${tax} + ${grant}`], [`₹${tax.toLocaleString('en-IN')} + ₹${grant.toLocaleString('en-IN')} = ₹${total.toLocaleString('en-IN')}`], [{ when: String(grant - tax), explain: 'You subtracted. Both are income, so add them.' }], 0.001, '₹');
    }, 2),
    tapT('tap', 'Tap the duties of a gram panchayat.', [
      ['Supplying drinking water', true], ['Cleaning drains', true], ['Repairing village roads', true], ['Registering births and deaths', true], ['Maintaining street lights', true],
      ['Printing currency notes', false], ['Running the Indian Army', false], ['Making laws for the whole country', false],
    ], ['Think of daily needs of the village.', 'Currency and the army are national matters.'], 'Panchayats handle local services like water, sanitation, roads, lights and records.'),
    matchT('who', 'person or source with its role in the panchayat', [
      ['Sarpanch', 'Presides over meetings and leads'], ['Upa-sarpanch', 'Assists and acts when the sarpanch is absent'], ['Panchayat secretary', 'Keeps records and accounts'], ['Ward member', 'Represents one ward'], ['House tax', 'Panchayat’s own income'], ['Grants', 'Money from state and central governments'],
    ], ['The secretary is a government employee.', 'Grants come from higher governments.']),
  ]),
  O('ts6.ss.pr.mandal', 'Mandal parishad and zilla parishad', [
    h('Three tiers of rural government'),
    photo('🏢', 'Mandal and district offices coordinate the work of many villages.'),
    p('Some work is too big for one village: a road linking several villages, a high school, a large tank. So panchayati raj in Telangana has three tiers.'),
    stepsB('Village level: gram panchayat — headed by the sarpanch.', 'Mandal level: mandal parishad — made of MPTC members (Mandal Parishad Territorial Constituency members) elected by voters; they elect a mandal parishad president (MPP). The MPDO is the official in charge.', 'District level: zilla parishad — made of ZPTC members (Zilla Parishad Territorial Constituency members), one from each mandal; they elect a chairperson. A Chief Executive Officer (CEO) is the official in charge.'),
    def('MPTC', 'Member of a Mandal Parishad Territorial Constituency, elected by the voters of that area to the mandal parishad.'),
    def('ZPTC', 'Member of a Zilla Parishad Territorial Constituency, elected by the voters of a whole mandal to the zilla parishad.'),
    p('The mandal parishad prepares plans for the mandal and supervises schools, health centres and works across villages. The zilla parishad plans for the whole rural district and distributes funds. MLAs and MPs of the area may also attend their meetings.'),
    keys('Three tiers: gram panchayat → mandal parishad → zilla parishad.', 'MPTCs elect the MPP; ZPTCs elect the ZP chairperson.', 'Officials: panchayat secretary, MPDO, CEO.'),
    remember('Village → mandal → district: each tier handles work too big for the one below.'),
  ], [
    ex('Which tier would plan a road linking ten villages in one mandal?', ['It is too big for one gram panchayat.', 'It lies within one mandal.'], 'The mandal parishad'),
    ex('Who elects the zilla parishad chairperson?', ['ZPTC members are elected by the voters, one per mandal.', 'They elect the chairperson from among themselves.'], 'The ZPTC members'),
  ], [
    orderT('tiers', 'Arrange the panchayati raj tiers from the SMALLEST area to the LARGEST.', ['Gram panchayat (village)', 'Mandal parishad (mandal)', 'Zilla parishad (district)'], ['The village is the smallest.', 'The district is the largest.'], 'Village → mandal → district.', 3),
    tp('tier', (r) => {
      const [p0, t] = r.pick([['a sarpanch', 'Gram panchayat'], ['an MPTC member', 'Mandal parishad'], ['the MPP (mandal parishad president)', 'Mandal parishad'], ['a ZPTC member', 'Zilla parishad'], ['the ZP chairperson', 'Zilla parishad'], ['a ward member of a village', 'Gram panchayat'], ['the MPDO', 'Mandal parishad'], ['the CEO of the zilla parishad', 'Zilla parishad']] as [string, string][]);
      return {
        type: 'mcq', prompt: `To which tier of panchayati raj does ${p0} belong?`, ...choose(r, t, ['Gram panchayat', 'Mandal parishad', 'Zilla parishad'].filter((x) => x !== t)),
        hints: ['MP… and MPTC belong to the mandal; ZP… and ZPTC to the district.', 'Sarpanch and ward members belong to the village.'],
        mistakes: [{ when: 'wrong', explain: 'Look at the letters: M = mandal, Z = zilla (district); sarpanch and ward members are village level.' }],
        solution: [`${p0[0].toUpperCase()}${p0.slice(1)} belongs to the ${t.toLowerCase()}.`],
      };
    }, 1),
    mcq('mcq', 'Three tiers.', [
      ['The middle tier of panchayati raj in Telangana is the…', 'Mandal parishad', ['Zilla parishad', 'Gram sabha', 'Parliament'], 'Between village and district.', 'The mandal parishad is the middle tier.'],
      ['ZPTC members are elected to the…', 'Zilla parishad', ['Gram panchayat', 'Lok Sabha', 'Municipal corporation'], 'Z for zilla (district).', 'ZPTCs sit in the zilla parishad.'],
      ['The official in charge at the mandal level is the…', 'MPDO', ['Sarpanch', 'Mayor', 'Governor'], 'Mandal Parishad Development Officer.', 'The MPDO runs the mandal parishad office.'],
      ['The zilla parishad chairperson is elected by…', 'ZPTC members', ['Sarpanches only', 'The Prime Minister', 'Shopkeepers'], 'From among themselves.', 'ZPTC members elect their chairperson.'],
      ['A high school serving many villages would be supervised mainly by the…', 'Mandal parishad or zilla parishad', ['Ward member alone', 'Gram sabha of one village only', 'A private shop'], 'Bigger than one village.', 'Higher tiers handle work spanning many villages.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 14 — Local Self-Government in Urban Areas
// =====================================================================================
const ch14 = U(14, 'Local Self-Government in Urban Areas', [
  O('ts6.ss.urban.form', 'Formation of municipalities and corporations', [
    h('Who runs a town?'),
    photo('🏢', 'Towns and cities have their own elected local governments.'),
    p('Towns have problems villages rarely face: crowded streets, heavy traffic, huge amounts of garbage, underground drainage and water supply to thousands of houses. To manage these, urban areas have their own local governments, which were given a constitutional status by the 74th Amendment (in force from 1993).'),
    def('Municipality', 'The elected local government of a town.'),
    def('Municipal corporation', 'The elected local government of a large city, such as the Greater Hyderabad Municipal Corporation (GHMC) or the Greater Warangal Municipal Corporation.'),
    p('Whether a place has a municipality or a corporation depends mainly on its population and income. Small towns have municipalities; big cities have corporations. Elections are held every five years, with reservations for women, SCs, STs and BCs.'),
    keys('Urban local bodies: municipalities (towns) and municipal corporations (cities).', 'Based mainly on population.', '74th Amendment; elections every 5 years.'),
    remember('Hyderabad’s civic body is the GHMC — one of the largest municipal corporations in India.'),
  ], [
    ex('Why can’t a big city be run by a body like a gram panchayat?', ['A city has lakhs of people.', 'It needs large systems for water, drainage, roads, traffic and garbage.', 'It needs a bigger body with more staff and funds.'], 'Its problems and population are too large'),
    ex('Which local body governs Hyderabad?', ['Hyderabad is a very large city.', 'Large cities have municipal corporations.'], 'The Greater Hyderabad Municipal Corporation (GHMC)'),
  ], [
    mcq('mcq', 'Town = municipality; city = corporation.', [
      ['The local government of a large city is a…', 'Municipal corporation', ['Gram panchayat', 'Mandal parishad', 'Zilla parishad'], 'Like GHMC.', 'Large cities have municipal corporations.'],
      ['The local government of a town is a…', 'Municipality', ['Parliament', 'Gram sabha', 'High Court'], 'Smaller than a corporation.', 'Towns are run by municipalities.'],
      ['Urban local bodies got constitutional status through the…', '74th Amendment', ['73rd Amendment', '1st Amendment', '100th Amendment'], 'The 73rd was for panchayats.', 'The 74th Amendment covers urban local bodies.'],
      ['GHMC stands for…', 'Greater Hyderabad Municipal Corporation', ['Great Hall of Municipal Clerks', 'Government Health Medical Centre', 'Gram Hyderabad Mandal Council'], 'Hyderabad’s civic body.', 'GHMC is Hyderabad’s municipal corporation.'],
      ['Whether a town has a municipality or corporation depends mainly on its…', 'Population', ['Number of temples', 'Colour of buildings', 'Rainfall'], 'Size matters.', 'Bigger populations get corporations.'],
    ]),
    tapT('tap', 'Tap problems that urban local governments especially have to handle.', [
      ['Collecting huge amounts of garbage', true], ['Underground drainage', true], ['Piped water to thousands of houses', true], ['Traffic and parking', true], ['Street lights on busy roads', true],
      ['Deciding India’s defence policy', false], ['Printing currency', false], ['Running the Indian Railways', false],
    ], ['Think of crowded city life.', 'National matters belong to the Union government.'], 'Cities need large systems for water, drainage, garbage, traffic and lighting.'),
    matchT('body', 'place with its local government', [
      ['A village', 'Gram panchayat'], ['A small town', 'Municipality'], ['A large city like Hyderabad', 'Municipal corporation'], ['A mandal (rural)', 'Mandal parishad'], ['Rural part of a district', 'Zilla parishad'],
    ], ['Rural bodies: panchayat, mandal, zilla.', 'Urban bodies: municipality, corporation.']),
  ]),
  O('ts6.ss.urban.ward', 'Wards, councillors, chairperson and commissioner', [
    h('Representing every street'),
    photo('🙋', 'Citizens bring their problems to their ward councillor or corporator.'),
    p('A town is divided into wards. The voters of each ward elect a ward member — called a councillor in a municipality and a corporator in a corporation. The elected members together form the council. In a municipality they choose a chairperson; in a corporation, a mayor. Both have a deputy.'),
    def('Councillor / corporator', 'The elected representative of a ward in a municipality / corporation.'),
    def('Commissioner', 'A government officer appointed to carry out the council’s decisions and manage the staff of the municipality or corporation.'),
    p('The council decides; the commissioner and staff carry out the decisions. Committees of members look after subjects such as water supply, health and town planning. Citizens can meet their councillor, attend ward meetings and complain through phone helplines and apps.'),
    keys('Town → wards → councillors (or corporators).', 'Chairperson (municipality) or mayor (corporation) heads the council.', 'Commissioner = officer who implements.'),
    remember('Elected members decide; appointed officials carry out the decisions.'),
  ], [
    ex('Who heads the council of a municipal corporation?', ['Corporators are elected from wards.', 'They choose a mayor to head the council.'], 'The mayor'),
    ex('A garbage pile has not been cleared on your street for a week. Whom could you approach?', ['Your ward councillor/corporator, who represents your street.', 'Or the municipal office / commissioner through a complaint.'], 'The ward councillor or the municipal office'),
  ], [
    matchT('roles', 'person with their role in urban local government', [
      ['Councillor', 'Elected member of a ward in a municipality'], ['Corporator', 'Elected member of a ward in a corporation'], ['Chairperson', 'Head of a municipal council'], ['Mayor', 'Head of a municipal corporation council'], ['Commissioner', 'Officer who carries out decisions'], ['Voters of a ward', 'Elect their ward member'],
    ], ['Municipality: councillor, chairperson.', 'Corporation: corporator, mayor.']),
    mcq('mcq', 'Who decides, who implements?', [
      ['The head of a municipal corporation’s council is the…', 'Mayor', ['Sarpanch', 'Collector', 'MPP'], 'In cities.', 'The mayor heads the corporation council.'],
      ['The head of a municipality’s council is the…', 'Chairperson', ['Mayor', 'Sarpanch', 'Governor'], 'In towns.', 'A municipality is headed by a chairperson.'],
      ['The officer who implements council decisions is the…', 'Commissioner', ['Councillor', 'Voter', 'Mayor'], 'Appointed, not elected.', 'The commissioner manages the staff.'],
      ['A town is divided into…', 'Wards', ['Mandals', 'States', 'Continents'], 'Each elects one member.', 'Wards elect councillors or corporators.'],
      ['Ward members are elected for…', '5 years', ['1 year', 'Life', '50 years'], 'Same as other local bodies.', 'Urban local elections are held every five years.'],
    ]),
    tp('wards', (r) => {
      const wards = r.pick([20, 24, 28, 30, 36, 40]), pop = wards * r.pick([2000, 2500, 3000]);
      return numQ(`(Illustrative) A town of ${pop.toLocaleString('en-IN')} people is divided into ${wards} wards with equal population. About how many people live in each ward?`, pop / wards,
        ['Divide the population equally among the wards.', `${pop} ÷ ${wards}`], [`${pop.toLocaleString('en-IN')} ÷ ${wards} = ${(pop / wards).toLocaleString('en-IN')} people per ward`], [{ when: String(pop * wards), explain: 'Dividing among wards means divide, not multiply.' }], 0.001, 'people');
    }, 2),
  ]),
  O('ts6.ss.urban.funds', 'Municipal funds and services: the Vemulawada example', [
    h('Paying for a clean, working town'),
    photo('🛕', 'Temple towns like Vemulawada receive large numbers of pilgrims, which adds to the work of the municipality.'),
    p('A municipality earns money from property (house) tax, water charges, trade licence fees, advertisement fees, rents from its shops and markets, and grants from the state and central governments. It spends on water supply, drainage, roads, street lights, garbage collection, parks, markets, birth and death registration and town planning.'),
    def('Property tax', 'A yearly tax paid by owners of houses and buildings to the municipality, usually its biggest own source of income.'),
    p('Vemulawada, in Rajanna Sircilla district, is a municipality known for the Sri Raja Rajeshwara Swamy temple. On festival days lakhs of pilgrims come, so the town must arrange extra drinking water, toilets, cleaning, parking and lighting. This shows how a town’s special situation shapes what its local government must do and spend.'),
    bars(['Water supply', 'Sanitation & garbage', 'Roads & lights', 'Staff & others'], [30, 30, 25, 15], '% of spending', 'Illustrative: how a town’s municipal budget might be divided.'),
    keys('Income: property tax, water charges, fees, rents, grants.', 'Spending: water, sanitation, roads, lights, parks, records.', 'Special towns (pilgrim towns) need extra services.'),
    remember('Paying property tax on time helps the town provide better services.'),
  ], [
    ex('A municipality’s budget is ₹20 crore and 30% is spent on water supply. How much is that?', ['30% of 20 = 30/100 × 20 = 6.'], '₹6 crore'),
    ex('Why does Vemulawada municipality need to spend extra on sanitation during festivals?', ['Lakhs of pilgrims visit at once.', 'They need toilets, drinking water and clean streets.', 'More waste must be removed quickly.'], 'Because of the huge number of pilgrims'),
  ], [
    tp('pct', (r) => {
      const total = r.pick([10, 20, 30, 40, 50]), pc = r.pick([10, 20, 25, 30, 40]);
      const item = r.pick(['water supply', 'sanitation and garbage', 'roads and street lights', 'parks and markets']);
      return numQ(`(Illustrative) A municipality’s yearly budget is ₹${total} crore. It plans to spend ${pc}% on ${item}. How many crore rupees is that?`, total * pc / 100,
        ['Percentage means “out of 100”.', `${pc}/100 × ${total}`], [`${pc}% of ₹${total} crore = ${pc} × ${total} ÷ 100 = ₹${total * pc / 100} crore`], [{ when: String(total * pc), explain: 'Remember to divide by 100 when finding a percentage.' }], 0.001, '₹ crore');
    }, 3),
    tapT('income', 'Tap the sources of INCOME for a municipality.', [
      ['Property (house) tax', true], ['Water charges', true], ['Trade licence fees', true], ['Advertisement fees', true], ['Grants from state and central governments', true],
      ['Salaries of sanitation workers', false], ['Cost of street lights', false], ['Building new roads', false],
    ], ['Income = money coming in.', 'Salaries and construction are spending.'], 'Taxes, charges, fees and grants bring money in; services cost money.'),
    mcq('mcq', 'Funds and the Vemulawada example.', [
      ['The biggest own source of income for most municipalities is…', 'Property tax', ['Income tax', 'Customs duty', 'Railway fares'], 'Paid by house owners.', 'Property tax is the main local tax.'],
      ['Vemulawada is in which district?', 'Rajanna Sircilla', ['Hyderabad', 'Khammam', 'Nalgonda'], 'Named after the temple deity.', 'Vemulawada is in Rajanna Sircilla district.'],
      ['Vemulawada is famous for the…', 'Sri Raja Rajeshwara Swamy temple', ['Charminar', 'Golconda fort', 'Ramappa temple'], 'A Shiva temple.', 'The Raja Rajeshwara temple draws lakhs of pilgrims.'],
      ['During big festivals a temple town must especially arrange…', 'Drinking water, toilets and cleaning', ['Snow clearing', 'Ship repairs', 'Airports'], 'Crowds need basic services.', 'Large crowds need water, sanitation and cleanliness.'],
      ['Which is a SERVICE provided by a municipality?', 'Garbage collection', ['Printing passports', 'Running the army', 'Making national laws'], 'A local task.', 'Garbage collection is a municipal service.'],
    ]),
  ]),
]);


// =====================================================================================
// Theme IV — Social Organisation and Inequities
// Chapter 15 — Diversity in Our Society
// =====================================================================================
const ch15 = U(15, 'Diversity in Our Society', [
  O('ts6.ss.div.neigh', 'Diversity in our neighbourhood', [
    h('Look around you'),
    photo('🧑‍🏫', 'A classroom in Telangana may have children who speak Telugu, Urdu, Lambadi, Hindi or Gondi at home.'),
    p('Make a list of the children in your class. Some may speak Telugu at home, others Urdu, Lambadi, Hindi, Marathi or Gondi. Some eat rice and pappu every day, others roti; some celebrate Bathukamma and Bonalu, others Ramzan, Christmas or Sankranti, and many join in each other’s festivals. Families earn their living in different ways — farming, weaving, running shops, driving autos, teaching, working in offices. This variety is called diversity.'),
    def('Diversity', 'Differences among people — in language, religion, food, dress, festivals, occupations and ways of life — living together in one place.'),
    p('Hyderabad is a good example: its old city has mosques, temples and churches close together; Telugu and Urdu are both spoken widely; foods like biryani, haleem, pesarattu and jonna rotte are enjoyed by everyone. People from all over India and the world live and work there.'),
    keys('Diversity: many languages, religions, foods, dresses, festivals and jobs.', 'Neighbours often share each other’s festivals and food.', 'Diversity makes life richer and more interesting.'),
    remember('Being different is not being unequal — every person deserves the same respect.'),
  ], [
    ex('List three kinds of diversity you might find in one Telangana classroom.', ['Language spoken at home (Telugu, Urdu, Lambadi…).', 'Festivals celebrated (Bathukamma, Ramzan, Christmas…).', 'Food eaten at home (rice, roti, jonna rotte…).'], 'Language, festivals and food (also religion, dress, occupations)'),
    ex('Why are both Telugu and Urdu widely spoken in Hyderabad?', ['Telugu is the main language of Telangana.', 'Urdu developed and spread in the Deccan over centuries and was a language of the old Hyderabad state.'], 'Because of the region’s long shared history'),
  ], [
    tapT('tap', 'Tap the examples of DIVERSITY.', [
      ['Children speak different languages at home', true], ['Families follow different religions', true], ['People wear different kinds of clothes', true], ['Neighbours have different occupations', true], ['Different foods are cooked at home', true],
      ['Everyone has the same name', false], ['All people eat exactly the same meal every day', false], ['Every family celebrates only one identical festival', false],
    ], ['Diversity means differences.', 'Sameness is not diversity.'], 'Differences in language, religion, dress, work and food are diversity.'),
    mcq('mcq', 'Diversity close to home.', [
      ['Bathukamma is a festival of…', 'Flowers, celebrated by women in Telangana', ['Kites in Gujarat', 'Boats in Kerala', 'Snow in Kashmir'], 'Flowers are stacked like a tower.', 'Bathukamma is Telangana’s flower festival.'],
      ['Which language is spoken by the Lambada community?', 'Lambadi (Gor boli)', ['Tamil', 'Bengali', 'French'], 'Spoken in thandas.', 'Lambadas speak Lambadi.'],
      ['Diversity means…', 'Differences among people living together', ['Everyone being the same', 'Fighting with neighbours', 'Living alone'], 'Variety.', 'Diversity is variety in ways of life.'],
      ['Being different from others means…', 'We deserve equal respect all the same', ['Some people are better', 'We cannot be friends', 'We must stay apart'], 'Different ≠ unequal.', 'Differences do not make anyone less equal.'],
      ['Which two languages are both widely spoken in Hyderabad?', 'Telugu and Urdu', ['Tamil and Malayalam', 'Punjabi and Kashmiri', 'Assamese and Odia'], 'Deccan history.', 'Telugu and Urdu are both widely spoken.'],
    ]),
    matchT('fest', 'festival with the community or region that celebrates it most', [
      ['Bathukamma', 'Women of Telangana'], ['Bonalu', 'Telangana, offering to goddess Mahankali'], ['Ramzan (Eid ul-Fitr)', 'Muslims, after a month of fasting'], ['Christmas', 'Christians, birth of Jesus'], ['Sankranti', 'Harvest festival in January'], ['Teej', 'Lambada communities'],
    ], ['Bathukamma and Bonalu are Telangana festivals.', 'Sankranti marks the harvest.']),
  ]),
  O('ts6.ss.div.india', 'Diversity across India', [
    h('One country, many ways of life'),
    photo('🌍', 'India stretches from snowy mountains to tropical coasts, and its people’s ways of life are equally varied.'),
    p('India’s geography is very varied — the cold Himalayas, the dry Thar desert, the wet north-east, the long coasts and the Deccan plateau. People’s food, dress, houses and work have grown to suit these places. Coconut is used in cooking in Kerala; wheat is the main grain in Punjab; rice is eaten in Bengal and Telangana; warm woollen clothes are worn in Ladakh.'),
    def('Scheduled languages', 'The languages listed in the Eighth Schedule of the Constitution — 22 at present, including Telugu, Urdu, Hindi, Tamil, Bengali and Santali.'),
    p('Indians follow many religions — Hinduism, Islam, Christianity, Sikhism, Buddhism, Jainism and others — and many Adivasi faiths. Hundreds of languages and dialects are spoken. History also added diversity: traders, travellers and rulers from many lands brought new foods, words, music and buildings.'),
    keys('Geography shapes food, clothes and houses.', '22 scheduled languages; hundreds of others.', 'Many religions and festivals.', 'History mixed many cultures together.'),
    remember('Telugu is one of India’s classical languages, with a long literary history.'),
  ], [
    ex('Why do people in Ladakh wear thick woollen clothes while people in Chennai wear light cotton?', ['Ladakh is high in the mountains and very cold.', 'Chennai is on a hot, humid coast.', 'Clothes suit the climate.'], 'Because of the difference in climate'),
    ex('How many languages are in the Eighth Schedule of the Constitution?', ['The Eighth Schedule lists the scheduled languages.', 'There are 22 at present.'], '22'),
  ], [
    matchT('geo', 'place with a way of life suited to it', [
      ['Ladakh (cold mountains)', 'Thick woollen clothes'], ['Kerala (coast)', 'Coconut in cooking, fishing'], ['Punjab (plains)', 'Wheat as the main grain'], ['Rajasthan (desert)', 'Camels, thick-walled houses'], ['Assam (wet north-east)', 'Houses on stilts, tea gardens'], ['Telangana (plateau)', 'Rice, jowar and tank irrigation'],
    ], ['Climate decides clothes and houses.', 'The coast gives coconuts and fish.']),
    mcq('mcq', 'Many languages, religions and landscapes.', [
      ['How many scheduled languages does India have at present?', '22', ['2', '12', '200'], 'Eighth Schedule.', 'The Eighth Schedule lists 22 languages.'],
      ['The main grain in Punjab is…', 'Wheat', ['Coconut', 'Tapioca', 'Ragi only'], 'Roti.', 'Wheat grows well in the Punjab plains.'],
      ['Which is NOT a reason for India’s diversity?', 'Everyone living in the same climate', ['Varied geography', 'Long history of contact', 'Many religions'], 'India has many climates.', 'India’s climates are varied, not the same.'],
      ['Telugu is recognised as a…', 'Classical language', ['Foreign language', 'Dead language', 'Code language'], 'Long literary history.', 'Telugu has classical language status.'],
      ['Houses on stilts are common in…', 'Flood-prone wet areas like Assam', ['The Thar desert', 'Ladakh', 'Delhi'], 'Keeps homes above water.', 'Stilt houses stay dry during floods.'],
    ]),
    tapT('rel', 'Tap the religions followed by people in India.', [
      ['Hinduism', true], ['Islam', true], ['Christianity', true], ['Sikhism', true], ['Buddhism', true], ['Jainism', true],
      ['Cricket', false], ['Mathematics', false], ['Monsoon', false],
    ], ['Pick only religions.', 'A sport or a subject is not a religion.'], 'India is home to many religions.', 6),
  ]),
  O('ts6.ss.div.unity', 'Unity in diversity', [
    h('Different, yet together'),
    photo('🚩', 'The national flag belongs to every Indian, whatever their language or religion.'),
    p('With so many differences, what holds Indians together? During the freedom struggle people of every region, language and religion fought together against British rule. After independence the Constitution gave every citizen equal rights and freedom of religion and expression. National symbols — the flag, the anthem, the emblem — belong to all.'),
    def('Unity in diversity', 'Living together peacefully and feeling one as a nation while keeping and respecting our differences.'),
    def('Stereotype', 'A fixed idea that all people of a group are the same, e.g. “people from that place are lazy”. Stereotypes are unfair because every person is different.'),
    def('Prejudice', 'Judging people negatively, before knowing them, only because they belong to a certain group.'),
    p('Unity does not mean everyone must become the same. It means respecting other people’s ways, sharing festivals, learning a little of another language and standing up against unfair treatment. Prejudice and stereotypes break unity; friendship and fairness build it.'),
    keys('The freedom struggle united people of all backgrounds.', 'The Constitution gives equal rights to all.', 'Stereotypes and prejudice harm unity.'),
    remember('Unity in diversity is like a garland: many different flowers on one thread.'),
  ], [
    ex('Your classmate says, “Children from that village are not good at studies.” What is wrong with this?', ['It judges a whole group by one fixed idea — a stereotype.', 'Every child is different; it is unfair and untrue.'], 'It is a stereotype / prejudice'),
    ex('Give two ways students can build unity in a school.', ['Celebrate each other’s festivals together.', 'Make friends across languages and religions; stop unfair teasing.'], 'Sharing festivals; friendship and fairness'),
  ], [
    tapT('build', 'Tap the actions that BUILD unity in diversity.', [
      ['Wishing friends on their festivals', true], ['Learning a few words of a classmate’s language', true], ['Including everyone in games', true], ['Speaking up when someone is teased for their background', true],
      ['Making fun of someone’s accent', false], ['Believing a stereotype without checking', false], ['Refusing to sit with children of another religion', false],
    ], ['Unity grows from respect and friendship.', 'Mockery and prejudice break it.'], 'Respect, inclusion and fairness build unity.'),
    mcq('mcq', 'Unity, stereotypes, prejudice.', [
      ['A fixed idea that all people of a group are the same is a…', 'Stereotype', ['Fact', 'Law', 'Festival'], 'It ignores individuals.', 'A stereotype treats a whole group as identical.'],
      ['Judging someone negatively before knowing them is…', 'Prejudice', ['Unity', 'Respect', 'Friendship'], 'Pre-judging.', 'Prejudice means judging beforehand.'],
      ['Unity in diversity means…', 'Living together while respecting differences', ['Everyone becoming the same', 'Living apart', 'Having one language only'], 'Many flowers, one garland.', 'We stay united while keeping our differences.'],
      ['Which gives every Indian citizen equal rights?', 'The Constitution', ['A film', 'A shopkeeper', 'A cricket team'], 'In force since 1950.', 'The Constitution guarantees equal rights.'],
      ['During the freedom struggle, people of different regions and religions…', 'Fought together for independence', ['Never met', 'Fought only each other', 'Stayed silent'], 'A shared goal.', 'The freedom struggle united Indians.'],
    ]),
    matchT('sym', 'national symbol with what it is', [
      ['National flag', 'Tricolour with the Ashoka Chakra'], ['National anthem', 'Jana Gana Mana'], ['National emblem', 'Lion capital of Sarnath'], ['National song', 'Vande Mataram'], ['National animal', 'Tiger'], ['National bird', 'Peacock'],
    ], ['The emblem comes from Ashoka’s pillar.', 'The anthem was written by Rabindranath Tagore.']),
  ]),
]);

// =====================================================================================
// Chapter 16 — Towards Gender Equality
// =====================================================================================
const ch16 = U(16, 'Towards Gender Equality', [
  O('ts6.ss.gender.grow', 'Growing up as boys and girls', [
    h('Who decides what boys and girls should do?'),
    photo('👧', 'Girls and boys have the same right to learn, play and dream.'),
    p('From a young age children hear messages like “boys don’t cry”, “girls should not play cricket”, or “cooking is a girl’s job”. Boys are often given cars and bats, girls dolls and kitchen sets. These ideas are not part of nature; they are learnt from family, society, films and advertisements.'),
    def('Gender', 'The roles, behaviour and expectations that a society attaches to being a boy or a girl, a man or a woman. Unlike biological sex, gender roles are learnt and can change.'),
    def('Gender stereotype', 'A fixed idea about what boys or girls “should” like or do, such as “girls are weak at maths” or “boys don’t do housework”.'),
    p('Such stereotypes limit both girls and boys. A girl who loves science may be discouraged; a boy who enjoys cooking or dance may be teased. Today women fly fighter planes, run companies and lead governments; men cook, care for children and work as nurses. Talents do not depend on whether one is a boy or a girl.'),
    keys('Gender roles are learnt, not natural.', 'Stereotypes limit both boys and girls.', 'Anyone can do any work with interest and training.'),
    remember('Sharing housework equally at home is one of the simplest steps towards gender equality.'),
  ], [
    ex('Is “girls cannot become engineers” a fact or a stereotype? Why?', ['Many women are successful engineers.', 'Ability depends on interest and learning, not on being a girl.'], 'A stereotype'),
    ex('Give an example of a gender stereotype about boys.', ['“Boys should not cry” or “boys don’t do housework”.', 'These ideas stop boys from showing feelings or sharing work.'], '“Boys don’t cry” (or similar)'),
  ], [
    tp('fs', (r) => {
      const bank: [string, boolean][] = [
        ['Girls are naturally bad at maths.', false], ['Only men can be pilots.', false], ['Boys should never cry.', false], ['Cooking is only for women.', false], ['Women cannot be leaders.', false],
        ['Both boys and girls can learn to cook.', true], ['Women in India have the right to vote.', true], ['Girls and boys have an equal right to education.', true], ['Many women work as doctors, scientists and pilots.', true],
      ];
      const [s, ok] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Is this statement a FACT or a gender STEREOTYPE? “${s}”`, ...choose(r, ok ? 'Fact' : 'Stereotype', [ok ? 'Stereotype' : 'Fact']),
        hints: ['A stereotype is a fixed, unfair idea about what boys or girls can do.', 'Ask: are there real people who prove this wrong?'],
        mistakes: [{ when: 'wrong', explain: ok ? 'This is true for everyone — it is a fact.' : 'Many real people prove this wrong, so it is a stereotype.' }],
        solution: [ok ? 'This is a fact.' : 'This is a stereotype: it is a fixed idea that real people prove wrong.'],
      };
    }, 1),
    tapT('tap', 'Tap the actions that challenge gender stereotypes.', [
      ['Boys and girls sharing housework equally', true], ['Girls playing cricket and football', true], ['Boys learning to cook', true], ['Encouraging girls to study science', true],
      ['Telling a boy he cannot cry', false], ['Stopping a girl from going to school', false], ['Giving only boys the bat', false],
    ], ['Which actions give both equal chances?', 'Limiting someone because of gender keeps stereotypes alive.'], 'Equal chances and shared work challenge stereotypes.'),
    mcq('mcq', 'Gender is learnt.', [
      ['Gender roles are…', 'Learnt from society and can change', ['Fixed by nature forever', 'The same in every country and time', 'Decided at random'], 'They differ across places and times.', 'Gender roles are social and changeable.'],
      ['Which is a gender stereotype?', '“Girls should not play cricket”', ['“Girls and boys can both play cricket”', '“Exercise is good for health”', '“Cricket uses a bat”'], 'A fixed, unfair idea.', 'Saying girls should not play is a stereotype.'],
      ['Stereotypes harm…', 'Both girls and boys', ['Only girls', 'Only boys', 'No one'], 'Think of “boys don’t cry”.', 'Stereotypes limit everyone.'],
      ['Where do children learn gender ideas?', 'Family, school, films and advertisements', ['Only from textbooks of maths', 'From birth certificates', 'From the weather'], 'Surroundings.', 'Society teaches gender roles.'],
      ['Who can be a nurse, pilot or scientist?', 'Anyone, with interest and training', ['Only men', 'Only women', 'No one'], 'Talent has no gender.', 'Careers are open to all.'],
    ]),
  ]),
  O('ts6.ss.gender.data', 'Sex ratio, literacy, property and employment', [
    h('What the numbers tell us'),
    photo('📝', 'The Census counts every person in India once in ten years and gives us facts about women and men.'),
    def('Sex ratio', 'The number of females for every 1,000 males in a population.'),
    p('In the 2011 Census, India’s sex ratio was about 943 females per 1,000 males; Telangana’s was about 988. The child sex ratio (0–6 years) of India was even lower, about 919, showing that girls are sometimes not valued equally — even though it is a crime to find out the sex of a baby before birth in order to end a pregnancy.'),
    bars(['Men (India, 2011)', 'Women (India, 2011)'], [82, 65], '% literate', 'About literacy rates in India in the 2011 Census: about 82% for men and 65% for women (rounded).'),
    p('Literacy among women has risen fast but is still lower than among men. In property, a 2005 change in the law gave daughters the same right as sons to inherit family property in Hindu families. Fewer women than men work in paid jobs, and women are often paid less for similar work, although the law says equal pay must be given for equal work.'),
    keys('Sex ratio = females per 1,000 males.', 'India 2011: about 943; Telangana: about 988; child sex ratio: about 919.', 'Literacy 2011: men about 82%, women about 65%.', 'Daughters have equal rights to family property (2005 law).'),
    remember('Sex ratio = (number of females ÷ number of males) × 1,000.'),
  ], [
    ex('A village has 500 men and 470 women. What is its sex ratio?', ['Sex ratio = females ÷ males × 1,000.', '470 ÷ 500 × 1,000 = 940.'], '940 females per 1,000 males'),
    ex('Why is a falling child sex ratio worrying?', ['It means fewer girls than expected are being born or surviving.', 'It shows that girls are not valued equally.'], 'It shows discrimination against girls'),
  ], [
    tp('ratio', (r) => {
      const m = r.pick([200, 400, 500, 800, 1000, 2000]), sr = r.pick([900, 920, 940, 950, 980, 1000, 1010]);
      const f = m * sr / 1000;
      return numQ(`(Illustrative) A village has ${m.toLocaleString('en-IN')} males and ${f.toLocaleString('en-IN')} females. What is its sex ratio (females per 1,000 males)?`, sr,
        ['Sex ratio = females ÷ males × 1,000.', `${f} ÷ ${m} × 1000`], [`${f} ÷ ${m} = ${sr / 1000}`, `× 1,000 = ${sr} females per 1,000 males`],
        [{ when: String(Math.round(m / f * 1000)), explain: 'You divided males by females. Sex ratio is females per 1,000 males.' }], 0.001, 'per 1,000 males');
    }, 2),
    mcq('mcq', 'Census facts about women and men.', [
      ['Sex ratio means the number of…', 'Females per 1,000 males', ['Males per 1,000 females', 'Children per family', 'Schools per village'], 'Females are counted per 1,000 males.', 'Sex ratio compares females to 1,000 males.'],
      ['India’s sex ratio in the 2011 Census was about…', '943', ['1,100', '500', '1,000 exactly'], 'Less than 1,000.', 'It was about 943 females per 1,000 males.'],
      ['Telangana’s sex ratio in 2011 was about…', '988', ['850', '1,200', '700'], 'Higher than India’s.', 'Telangana’s ratio was about 988.'],
      ['In 2011, female literacy in India was about…', '65%', ['95%', '20%', '100%'], 'Lower than male literacy (82%).', 'About 65% of women were literate.'],
      ['Since 2005, in Hindu families daughters inherit family property…', 'Equally with sons', ['Not at all', 'Only if there are no sons', 'Only jewellery'], 'Equal rights.', 'The 2005 law gave daughters equal inheritance rights.'],
      ['The law says that men and women doing the same work should get…', 'Equal pay', ['Different pay', 'No pay', 'Pay only for men'], 'Equal work, equal pay.', 'Equal remuneration is the law.'],
    ]),
    tapT('tap', 'Tap the statements that show gender INEQUALITY still exists.', [
      ['Female literacy is lower than male literacy', true], ['The child sex ratio is below 1,000', true], ['Women are often paid less for similar work', true], ['Fewer women than men have paid jobs', true],
      ['Women and men both have the right to vote', false], ['Daughters can inherit family property', false], ['Girls can study in any school', false],
    ], ['Which statements show a gap between women and men?', 'Equal rights are not inequality.'], 'Gaps in literacy, sex ratio, pay and jobs show inequality.'),
  ]),
  O('ts6.ss.gender.work', 'Unrecognised work of women and changes today', [
    h('Work that is not counted'),
    photo('🧺', 'Cooking, cleaning, washing, fetching water and caring for family members take many hours every day.'),
    p('Ask the women in your family how their day goes. Many wake up before everyone else to fetch water, sweep, cook and send children to school, then work in the fields or at a job, and come home to more cooking and caring. Because this housework is unpaid, it is often not counted as “work” at all.'),
    def('Unpaid (unrecognised) work', 'Work done at home and for the family — cooking, cleaning, caring for children, the sick and the old, fetching water and fuel — for which no wages are paid.'),
    def('Double burden', 'When a woman does paid work outside and still does most of the housework at home.'),
    h('Things are changing'),
    stepsB('Half the seats in panchayats and municipalities in Telangana are reserved for women.', 'Women’s self-help groups (SHGs) save together, take loans and start small businesses.', 'Schemes for girls’ education — residential schools, scholarships, bicycles — keep more girls in school.', 'Women are now pilots, police officers, scientists, sportspersons and leaders.'),
    keys('Housework and care work are real work, though unpaid.', 'Many women carry a double burden.', 'Reservation, SHGs and education are bringing change.'),
    remember('If housework were paid for, it would be worth a very large amount — it keeps every family running.'),
  ], [
    ex('A mother spends 2 hours fetching water, 3 hours cooking and 2 hours cleaning each day. How many hours of unpaid work is that?', ['2 + 3 + 2 = 7 hours.'], '7 hours a day'),
    ex('What is a self-help group?', ['A small group of women who save money together regularly.', 'They lend to members and can get bank loans to start small businesses.'], 'A savings-and-credit group of women'),
  ], [
    tp('hours', (r) => {
      const a = r.int(1, 3), b = r.int(2, 4), c = r.int(1, 3), d = r.int(1, 2);
      return numQ(`(Illustrative) In one day a woman spends ${a} h fetching water, ${b} h cooking, ${c} h cleaning and washing, and ${d} h caring for an elderly relative. How many hours of unpaid work is that in a week (7 days)?`, (a + b + c + d) * 7,
        ['First add the hours for one day.', `(${a} + ${b} + ${c} + ${d}) × 7`], [`One day: ${a + b + c + d} hours`, `One week: ${a + b + c + d} × 7 = ${(a + b + c + d) * 7} hours`],
        [{ when: String(a + b + c + d), explain: 'That is for one day. Multiply by 7 for a week.' }], 0.001, 'hours');
    }, 2),
    tapT('unpaid', 'Tap the examples of UNPAID work done at home.', [
      ['Cooking for the family', true], ['Caring for a sick grandparent', true], ['Fetching water', true], ['Washing clothes', true], ['Helping children with homework', true],
      ['A teacher’s salaried job', false], ['A shopkeeper selling goods', false], ['A paid driver driving a bus', false],
    ], ['Unpaid = no wages.', 'Salaried and business work is paid.'], 'Housework and care work are unpaid.'),
    mcq('mcq', 'Recognising women’s work and change.', [
      ['When a woman does paid work and most of the housework too, it is called…', 'A double burden', ['A holiday', 'Unemployment', 'A bonus'], 'Two loads.', 'She carries two loads of work.'],
      ['What share of panchayat seats is reserved for women in Telangana?', 'Half (50%)', ['One-tenth', 'None', 'All'], 'Equal representation.', 'Half the seats are reserved for women.'],
      ['Groups of women who save together and take loans are…', 'Self-help groups', ['Cricket teams', 'Gram sabhas', 'Market yards'], 'SHGs.', 'Self-help groups help women earn and save.'],
      ['Housework is often not counted as work because…', 'It is unpaid', ['It is easy', 'It takes no time', 'Nobody does it'], 'No wages.', 'Because no wages are paid, it is overlooked.'],
      ['Which helps keep more girls in school?', 'Scholarships, residential schools and bicycles', ['Early marriage', 'Long walks with no transport', 'Making them do all housework'], 'Support for education.', 'Such schemes help girls continue studies.'],
    ]),
  ]),
]);

// =====================================================================================
// Theme V — Religion and Society
// Chapter 17 — Religion and Society in Early Times
// =====================================================================================
const ch17 = U(17, 'Religion and Society in Early Times', [
  O('ts6.ss.rel.early', 'Beliefs of hunter-gatherers and early farmers', [
    h('Wonder and worship'),
    photo('☀️', 'The Sun, rain, rivers and animals were powerful forces in the lives of early people.'),
    p('Early people depended completely on nature. The Sun gave warmth, rain made plants grow, animals gave food, while storms, floods and disease could destroy them. They began to see these forces as powers to be honoured and pleased. We learn about their beliefs from burials, paintings and figurines.'),
    p('Hunter-gatherers sometimes buried the dead with tools, ornaments and food, suggesting they believed in some life after death. Rock paintings show hunting and dancing scenes that may have been part of rituals.'),
    p('Early farmers worried most about rain, fertile soil, healthy animals and children. Many made clay figurines of a mother goddess, a symbol of fertility and life. In the Deccan, including Telangana, people later built megaliths — burials marked by circles of big stones — and placed pots, iron tools and weapons with the dead.'),
    def('Megalith', 'A burial or monument made of very large stones; in South India often a stone circle around a grave.'),
    def('Mother goddess', 'A female deity linked with fertility, birth and the earth’s productivity, worshipped by many early farming communities.'),
    keys('Nature worship: Sun, rain, earth, rivers, animals.', 'Burials with goods suggest belief in life after death.', 'Farmers worshipped a mother goddess for fertility.', 'Megalithic stone-circle burials are found in Telangana.'),
    remember('Historians infer beliefs from objects, so their conclusions are careful guesses based on evidence.'),
  ], [
    ex('What can we infer when a grave contains pots of food and tools?', ['The living placed useful things with the dead.', 'They probably believed the dead would need them in another life.'], 'A belief in life after death'),
    ex('Why might early farmers worship a mother goddess?', ['They wanted good harvests, healthy animals and children.', 'The mother goddess was a symbol of fertility and life.'], 'For fertility and good harvests'),
  ], [
    mcq('mcq', 'Evidence from burials, paintings and figurines.', [
      ['Burying tools and food with the dead suggests a belief in…', 'Life after death', ['Money', 'Machines', 'Electricity'], 'Why give things to the dead?', 'Goods for the dead suggest belief in an afterlife.'],
      ['Early farmers made clay figurines of a…', 'Mother goddess', ['Car', 'Computer', 'Railway engine'], 'A symbol of fertility.', 'Mother goddess figurines are common finds.'],
      ['A burial marked by a circle of large stones is a…', 'Megalith', ['Microlith', 'Stupa', 'Temple'], 'Mega = big.', 'Megaliths are big-stone burials.'],
      ['Early people honoured forces of nature because…', 'Their lives depended on them', ['They had read about them', 'They were bored', 'Governments told them'], 'Rain, Sun, animals.', 'Survival depended on nature.'],
      ['How do historians learn about early beliefs?', 'From burials, paintings and figurines', ['From newspapers of that time', 'From television', 'From phone records'], 'No writing then.', 'Material remains are the evidence.'],
    ]),
    tapT('tap', 'Tap the evidence that tells us about the beliefs of early people.', [
      ['Graves with pots and tools', true], ['Rock paintings of dances', true], ['Clay figurines of a mother goddess', true], ['Megalithic stone circles', true],
      ['Their written diaries', false], ['Their photographs', false], ['Their radio programmes', false],
    ], ['There was no writing then.', 'Use objects that have survived.'], 'Burials, paintings, figurines and megaliths are our evidence.'),
    matchT('belief', 'find or belief with what it suggests', [
      ['Grave goods', 'Belief in life after death'], ['Mother goddess figurine', 'Prayer for fertility'], ['Rock painting of a dance', 'Possible ritual or celebration'], ['Stone circle burial', 'Megalithic culture'], ['Worship of the Sun and rain', 'Dependence on nature'],
    ], ['Objects are clues to beliefs.', 'Megaliths are big-stone graves.']),
  ]),
  O('ts6.ss.rel.indus', 'Religion in the Indus civilisation', [
    h('Clues from the Harappan cities'),
    photo('🔬', 'Archaeologists study seals, figurines and buildings to understand Harappan beliefs.'),
    p('The Harappan (Indus) civilisation flourished about 4,600–3,900 years ago (about 2600–1900 BCE). Its script has not been deciphered, so we cannot read what people wrote about their gods. We must guess carefully from objects.'),
    stepsB('Many terracotta figurines of women have been found — possibly a mother goddess.', 'A seal shows a figure seated in a yoga-like posture surrounded by animals; some scholars call it a “proto-Shiva” or Pashupati, but this is not certain.', 'Animals such as the bull and the unicorn-like creature appear on seals; trees such as the peepal seem to have been sacred.', 'Fire altars have been found at Kalibangan and Lothal.', 'The Great Bath at Mohenjo-daro may have been used for ritual bathing.'),
    def('Seal', 'A small carved piece of stone used to stamp a mark on clay; Harappan seals show animals, figures and signs of their script.'),
    keys('Script undeciphered — beliefs are inferred.', 'Mother goddess figurines, the “Pashupati” seal, sacred animals and trees.', 'Fire altars (Kalibangan, Lothal) and the Great Bath.'),
    remember('When historians say “possibly” or “may have been”, it is because the evidence allows more than one explanation.'),
  ], [
    ex('Why do we know less about Harappan religion than about Vedic religion?', ['Harappan script cannot be read yet.', 'Vedic hymns were passed down and can be read today.', 'So Harappan beliefs must be guessed from objects.'], 'The Harappan script is undeciphered'),
    ex('What might the Great Bath have been used for?', ['It is a large, carefully waterproofed tank with steps.', 'It may have been used for ritual (sacred) bathing.'], 'Possibly ritual bathing'),
  ], [
    mcq('mcq', 'Harappan clues.', [
      ['The Harappan script…', 'Has not been deciphered', ['Is easy to read', 'Is the same as Telugu', 'Was written on paper'], 'Nobody can read it yet.', 'Scholars have not yet deciphered it.'],
      ['Fire altars have been found at…', 'Kalibangan and Lothal', ['Hyderabad and Warangal', 'Delhi and Agra', 'Madurai and Kochi'], 'Harappan sites in Rajasthan and Gujarat.', 'Fire altars were found at Kalibangan and Lothal.'],
      ['The Great Bath is at…', 'Mohenjo-daro', ['Sanchi', 'Ajanta', 'Pataliputra'], 'A big Harappan city.', 'The Great Bath is in Mohenjo-daro.'],
      ['Which tree seems to have been sacred to the Harappans?', 'Peepal', ['Apple', 'Pine', 'Coconut'], 'It appears on seals.', 'Peepal leaves appear on seals and pottery.'],
      ['The Harappan civilisation flourished about…', '2600–1900 BCE', ['1600–1900 CE', '500–700 CE', '1947 CE'], 'More than 4,000 years ago.', 'Its mature phase was about 2600–1900 BCE.'],
    ]),
    tapT('tap', 'Tap the finds that give clues about Harappan religion.', [
      ['Terracotta female figurines', true], ['A seal with a seated figure among animals', true], ['Fire altars', true], ['The Great Bath', true], ['Seals showing sacred animals', true],
      ['Temples with tall towers like today’s', false], ['Printed holy books', false], ['Church bells', false],
    ], ['Think of Harappan objects.', 'Printed books and towers came much later.'], 'Figurines, seals, fire altars and the Great Bath are clues.'),
    tp('years', (r) => {
      const [label, y] = r.pick([['the mature Harappan cities began', 2600], ['the Great Bath was in use (about)', 2500], ['Harappan cities began to decline', 1900], ['Lothal’s dockyard was in use (about)', 2400], ['Kalibangan was a busy town (about)', 2300]] as [string, number][]);
      const now = 2026;
      return numQ(`About ${y} BCE, ${label}. About how many years ago is that from ${now} CE?`, y + now - 1,
        ['From that BCE year to year 1 CE is about that many years; then add the CE years.', `${y} + ${now} − 1 (there is no year 0)`], [`${y} + ${now} − 1 = ${y + now - 1} years ago`],
        [{ when: String(now - y), explain: 'BCE and CE are on opposite sides of year 1, so ADD the numbers.' }], 0.001, 'years');
    }, 2),
  ]),
  O('ts6.ss.rel.vedic', 'Vedic religion, new questions and the parivrajakas', [
    h('Hymns, sacrifices and seekers'),
    photo('🔥', 'In a Vedic yajna, offerings were made into a sacred fire.'),
    p('The Rigveda, the oldest of the Vedas, is a collection of over a thousand hymns, composed perhaps about 3,500 years ago and passed on orally for centuries. The hymns praise gods such as Agni (fire), Indra (a warrior god of rain and storms), Varuna (keeper of cosmic order), Surya (the Sun) and Soma. People asked these gods for cattle, children, health and victory.'),
    def('Yajna', 'A Vedic sacrifice in which offerings of milk, ghee, grain and sometimes animals were made into a sacred fire while priests chanted hymns.'),
    p('Later some thinkers began to ask deeper questions: What happens after death? What is the self (atman)? What is the ultimate reality (brahman)? These discussions are recorded in the Upanishads. Some people even left their homes to search for answers.'),
    def('Parivrajaka', 'A wandering seeker who gave up home and family to search for truth, living on alms and travelling from place to place.'),
    p('Among these seekers were Vardhamana Mahavira, who taught non-violence (ahimsa) towards all living beings and became the great teacher of Jainism, and Siddhartha Gautama, who became the Buddha (the enlightened one) and taught a middle path of right living, kindness and freedom from desire. Both taught in the language of ordinary people, Prakrit, so everyone could understand.'),
    keys('Rigveda: hymns to Agni, Indra, Varuna, Surya.', 'Yajnas: offerings into fire.', 'Upanishads: questions about atman and brahman.', 'Parivrajakas, including Mahavira and the Buddha, sought truth.'),
    remember('Mahavira and the Buddha both lived about 2,500 years ago and taught in Prakrit.'),
  ], [
    ex('Which Vedic god was linked with fire?', ['Agni means fire.', 'Offerings in yajnas were made through Agni.'], 'Agni'),
    ex('How was a parivrajaka different from a Vedic priest?', ['A priest performed yajnas for people and lived in society.', 'A parivrajaka left home and wandered, seeking truth through thought and simple living.'], 'A wandering seeker vs. a ritual specialist'),
  ], [
    matchT('gods', 'Vedic deity or term with its meaning', [
      ['Agni', 'God of fire'], ['Indra', 'Warrior god of rain and storms'], ['Varuna', 'Keeper of cosmic order'], ['Surya', 'The Sun'], ['Yajna', 'Sacrifice into the sacred fire'], ['Upanishads', 'Texts discussing atman and brahman'],
    ], ['Agni = fire.', 'Upanishads ask deep questions.']),
    mcq('mcq', 'Vedas, Upanishads and seekers.', [
      ['The oldest of the Vedas is the…', 'Rigveda', ['Atharvaveda', 'Samaveda', 'Yajurveda'], 'A collection of hymns.', 'The Rigveda is the oldest.'],
      ['A wandering seeker who left home to find truth was called a…', 'Parivrajaka', ['Raja', 'Sarpanch', 'Patla'], 'Pari + vraj = to wander around.', 'Parivrajakas wandered in search of truth.'],
      ['The teacher of Jainism who preached ahimsa was…', 'Vardhamana Mahavira', ['Ashoka', 'Chandragupta', 'Kalidasa'], 'He lived about 2,500 years ago.', 'Mahavira taught non-violence.'],
      ['The Buddha taught in…', 'Prakrit, the language of ordinary people', ['English', 'Latin', 'Persian'], 'So everyone could understand.', 'He used Prakrit to reach common people.'],
      ['The Upanishads discuss…', 'Atman (self) and brahman (ultimate reality)', ['Cricket rules', 'Crop prices', 'Railway lines'], 'Deep questions.', 'They explore the self and reality.'],
      ['The word Buddha means…', 'The enlightened one', ['The king', 'The warrior', 'The trader'], 'He gained understanding.', 'Buddha means one who is awakened.'],
    ]),
    tapT('tap', 'Tap the deeper questions asked by thinkers of the Upanishads and by parivrajakas.', [
      ['What happens after death?', true], ['What is the true self?', true], ['Why is there suffering?', true], ['What is the ultimate reality?', true],
      ['What is the price of a mobile phone?', false], ['Which team won the match?', false], ['How fast is a train?', false],
    ], ['They asked about life, death and truth.', 'Prices and sports are not such questions.'], 'They asked about death, self, suffering and reality.'),
  ]),
]);

// =====================================================================================
// Chapter 18 — Devotion and Love towards God
// =====================================================================================
const ch18 = U(18, 'Devotion and Love towards God', [
  O('ts6.ss.dev.hindu', 'Devotion in the Hindu tradition', [
    h('Bhakti: a personal bond with God'),
    photo('🪔', 'Lamps lit in homes and temples are a sign of devotion.'),
    p('Over time many people felt that God could be reached not only through rituals but through love and devotion. This path is called bhakti. Devotees worship a chosen form of God — such as Vishnu (often as Rama or Krishna), Shiva, or the Goddess (Devi) — with prayer, songs, offerings and visits to temples. The Bhagavad Gita speaks of bhakti as a way to God open to all.'),
    def('Bhakti', 'Loving devotion to God, in which the devotee feels a personal relationship with the deity.'),
    p('In South India the Alvars (devotees of Vishnu) and Nayanars (devotees of Shiva), coming from many backgrounds, sang moving songs in Tamil. In the Telugu lands, poets like Pothana retold the Bhagavatam in Telugu, and Bhakta Ramadasu sang kirtanas to Rama at Bhadrachalam. Village goddesses are worshipped at festivals such as Bonalu, and Bathukamma celebrates the goddess with flowers.'),
    keys('Bhakti = love and devotion to a personal God.', 'Vishnu, Shiva and Devi are widely worshipped.', 'Alvars, Nayanars, Pothana and Ramadasu spread devotion through song.'),
    remember('Bhakti saints taught that sincere devotion matters more than birth or wealth.'),
  ], [
    ex('What is bhakti?', ['It is a path to God through love and devotion.', 'The devotee feels a personal bond with God.'], 'Loving devotion to God'),
    ex('Name a Telugu devotional poet and his work.', ['Pothana retold the Bhagavatam in Telugu.', 'Bhakta Ramadasu composed kirtanas to Rama at Bhadrachalam.'], 'Pothana (Bhagavatam) or Ramadasu (kirtanas)'),
  ], [
    matchT('who', 'devotee or term with its description', [
      ['Bhakti', 'Loving devotion to God'], ['Alvars', 'Tamil devotees of Vishnu'], ['Nayanars', 'Tamil devotees of Shiva'], ['Pothana', 'Retold the Bhagavatam in Telugu'], ['Bhakta Ramadasu', 'Sang to Rama at Bhadrachalam'], ['Bonalu', 'Festival honouring the goddess'],
    ], ['Alvars–Vishnu, Nayanars–Shiva.', 'Ramadasu is linked with Bhadrachalam.']),
    mcq('mcq', 'The bhakti path.', [
      ['Bhakti means…', 'Loving devotion to God', ['A tax', 'A war', 'A market'], 'Love for God.', 'Bhakti is devotion.'],
      ['Which text speaks of bhakti as a path open to all?', 'The Bhagavad Gita', ['The Arthashastra', 'The Indica', 'The Jatakas'], 'Part of the Mahabharata.', 'The Gita describes the path of devotion.'],
      ['Devotees of Shiva in the Tamil land were called…', 'Nayanars', ['Alvars', 'Parivrajakas', 'Patlas'], 'Not the Alvars.', 'The Nayanars sang in praise of Shiva.'],
      ['Bhakta Ramadasu is linked with the temple at…', 'Bhadrachalam', ['Sanchi', 'Madurai', 'Puri'], 'On the Godavari.', 'He built and sang at the Bhadrachalam temple.'],
      ['Bhakti saints taught that what matters most is…', 'Sincere devotion', ['Birth in a rich family', 'Expensive gifts', 'Knowing many languages'], 'Love, not status.', 'They valued sincere devotion over status.'],
    ]),
    tapT('tap', 'Tap the ways devotees express bhakti.', [
      ['Singing devotional songs', true], ['Praying at home or in a temple', true], ['Making simple offerings of flowers or lamps', true], ['Celebrating festivals together', true],
      ['Insulting other people’s beliefs', false], ['Harming animals for fun', false], ['Cheating in the market', false],
    ], ['Devotion is expressed with love and respect.', 'Harm and disrespect are not devotion.'], 'Songs, prayer, offerings and festivals express devotion.'),
  ]),
  O('ts6.ss.dev.christ', 'Christianity: love and service', [
    h('The teachings of Jesus'),
    photo('🕯️', 'Candles are lit in churches during prayer, especially at Christmas.'),
    p('Christianity is based on the life and teachings of Jesus Christ, who lived about 2,000 years ago in Palestine (West Asia). He was born in Bethlehem. Jesus taught that God is a loving Father of all, and that people should love God and love their neighbours as themselves — even their enemies — forgive others and help the poor, sick and lonely.'),
    def('Bible', 'The holy book of Christians. Its New Testament tells of the life and teachings of Jesus.'),
    def('Church', 'A place where Christians gather for prayer and worship; also the community of believers.'),
    p('Christians celebrate Christmas (the birth of Jesus), Good Friday (his crucifixion) and Easter (his resurrection). By tradition, Christianity reached the Kerala coast very early, and it spread more widely in India in later centuries. The Medak Cathedral in Telangana is one of the largest churches in Asia. Christian missions have also run many schools and hospitals.'),
    keys('Founded on the life and teachings of Jesus Christ.', 'Message: love God, love your neighbour, forgive, serve.', 'Holy book: Bible; festivals: Christmas, Good Friday, Easter.'),
    remember('The Medak Cathedral in Telangana is famous for its stained-glass windows.'),
  ], [
    ex('State two teachings of Jesus.', ['Love your neighbour as yourself.', 'Forgive others and help those in need.'], 'Love and forgiveness (and service)'),
    ex('What do Christmas and Easter celebrate?', ['Christmas celebrates the birth of Jesus.', 'Easter celebrates his resurrection.'], 'Birth and resurrection of Jesus'),
  ], [
    mcq('mcq', 'Jesus, the Bible and festivals.', [
      ['The holy book of Christians is the…', 'Bible', ['Quran', 'Rigveda', 'Guru Granth Sahib'], 'It has the New Testament.', 'The Bible is the Christian holy book.'],
      ['Jesus was born in…', 'Bethlehem', ['Mecca', 'Varanasi', 'Rome'], 'In West Asia.', 'Christian tradition says Jesus was born in Bethlehem.'],
      ['Christmas celebrates…', 'The birth of Jesus', ['The harvest', 'A new year in April', 'A king’s coronation'], '25 December.', 'Christmas marks Jesus’ birth.'],
      ['A central teaching of Jesus was…', 'Love your neighbour as yourself', ['Fight your neighbour', 'Ignore the poor', 'Never forgive'], 'Love and kindness.', 'Jesus taught love for all.'],
      ['A famous large church in Telangana is the…', 'Medak Cathedral', ['Charminar', 'Golconda', 'Thousand Pillar Temple'], 'In Medak district.', 'The Medak Cathedral is famous for its size and windows.'],
    ]),
    matchT('terms', 'word with its meaning in Christianity', [
      ['Bible', 'Holy book'], ['Church', 'Place of worship'], ['Christmas', 'Birth of Jesus'], ['Good Friday', 'Crucifixion of Jesus'], ['Easter', 'Resurrection of Jesus'], ['Forgiveness', 'Letting go of anger against those who hurt us'],
    ], ['Christmas is in December.', 'Easter comes after Good Friday.']),
    tapT('tap', 'Tap the teachings associated with Jesus.', [
      ['Love your neighbour', true], ['Forgive others', true], ['Help the poor and the sick', true], ['God loves all people', true],
      ['Hate your enemies', false], ['Only the rich deserve help', false], ['Revenge is good', false],
    ], ['Think of love, forgiveness and service.', 'Hatred and revenge go against his teaching.'], 'Jesus taught love, forgiveness and service.'),
  ]),
  O('ts6.ss.dev.islam', 'Islam, and belief in one supreme God', [
    h('Submission to the will of Allah'),
    photo('🌙', 'The crescent moon marks the start of the month of Ramzan and the festival of Eid.'),
    p('Islam was preached by the Prophet Muhammad, who was born in Mecca (in Arabia) in about 570 CE. Islam means submission to the will of God, who in Arabic is called Allah. Muslims believe in one God and that Muhammad is His messenger. Their holy book is the Quran.'),
    stepsB('Shahada: declaring faith in one God and in the Prophet.', 'Salah (namaz): praying five times a day.', 'Zakat: giving a share of one’s wealth to the needy.', 'Sawm (roza): fasting from dawn to sunset during the month of Ramzan.', 'Hajj: pilgrimage to Mecca, at least once in life, for those who can afford it.'),
    def('Mosque (masjid)', 'A place where Muslims gather for prayer; the Mecca Masjid in Hyderabad is one of the largest in India.'),
    h('One supreme God'),
    p('Many traditions share the idea of one supreme God who is merciful and loves all creation, and teach honesty, compassion, charity and respect for others. Saints of the bhakti and Sufi traditions in India brought people of different faiths together through songs of love for God. Respecting every religion is a value of our Constitution.'),
    keys('Prophet Muhammad, Mecca, about 570 CE; holy book: the Quran.', 'Five pillars: faith, prayer, charity, fasting, pilgrimage.', 'Eid ul-Fitr ends the Ramzan fast; Eid ul-Adha recalls sacrifice and sharing.', 'Many faiths share belief in a merciful supreme God and values of compassion.'),
    remember('Compassion, charity and honesty are taught by all major religions.'),
  ], [
    ex('Name the five pillars of Islam.', ['Shahada (faith), salah (prayer), zakat (charity), sawm (fasting), hajj (pilgrimage).'], 'Faith, prayer, charity, fasting, pilgrimage'),
    ex('Give one value shared by Hindu bhakti, Christianity and Islam.', ['Bhakti teaches love for God and all beings.', 'Jesus taught love for neighbours.', 'Islam teaches charity (zakat) and mercy.'], 'Compassion / love for others'),
  ], [
    matchT('pillars', 'pillar of Islam with its meaning', [
      ['Shahada', 'Declaring faith in one God'], ['Salah', 'Praying five times a day'], ['Zakat', 'Giving to the needy'], ['Sawm', 'Fasting in Ramzan'], ['Hajj', 'Pilgrimage to Mecca'],
    ], ['Zakat is charity.', 'Sawm is fasting.']),
    mcq('mcq', 'Islam and shared values.', [
      ['The holy book of Islam is the…', 'Quran', ['Bible', 'Rigveda', 'Tripitaka'], 'Revealed to the Prophet Muhammad.', 'The Quran is the Muslim holy book.'],
      ['The Prophet Muhammad was born in…', 'Mecca', ['Medak', 'Bethlehem', 'Lumbini'], 'In Arabia.', 'He was born in Mecca around 570 CE.'],
      ['Eid ul-Fitr marks…', 'The end of the Ramzan fast', ['The harvest of paddy', 'The birth of Jesus', 'The new moon of Diwali'], 'After a month of fasting.', 'Eid ul-Fitr celebrates the end of Ramzan.'],
      ['Islam means…', 'Submission to the will of God', ['A kind of food', 'A place', 'A war'], 'Arabic word.', 'Islam means surrender to God’s will.'],
      ['A large historic mosque in Hyderabad is the…', 'Mecca Masjid', ['Medak Cathedral', 'Birla Mandir', 'Golconda Fort'], 'Near Charminar.', 'The Mecca Masjid is near Charminar.'],
      ['Which value is taught by all major religions?', 'Compassion for others', ['Cheating', 'Hatred', 'Greed'], 'Kindness.', 'All major faiths teach compassion.'],
    ]),
    tp('which', (r) => {
      const bank: [string, string][] = [
        ['Quran', 'Islam'], ['Bible', 'Christianity'], ['Bhagavad Gita', 'Hinduism'], ['Church', 'Christianity'], ['Mosque', 'Islam'], ['Temple', 'Hinduism'],
        ['Easter', 'Christianity'], ['Eid ul-Fitr', 'Islam'], ['Bonalu', 'Hinduism'], ['Zakat', 'Islam'], ['Alvars and Nayanars', 'Hinduism'], ['Christmas', 'Christianity'],
      ];
      const [x, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `“${x}” is most closely connected with which religion?`, ...choose(r, a, ['Hinduism', 'Christianity', 'Islam'].filter((y) => y !== a)),
        hints: ['Recall holy books, places of worship and festivals of each religion.', 'Quran/mosque/Eid — Islam; Bible/church/Christmas — Christianity; Gita/temple/Bonalu — Hinduism.'],
        mistakes: [{ when: 'wrong', explain: 'Match the book, place or festival with the religion it belongs to.' }],
        solution: [`${x} belongs to ${a}.`],
      };
    }, 1),
  ]),
]);

// =====================================================================================
// Theme VI — Culture and Communication
// Chapter 19 — Language, Script and Scriptures
// =====================================================================================
const ch19 = U(19, 'Language, Script and Scriptures', [
  O('ts6.ss.lang.script', 'Language and script', [
    h('Speaking and writing are different'),
    photo('🔤', 'A script is a set of signs used to write down a language.'),
    p('A language is what we speak; a script is how we write it. One language can be written in different scripts (Sanskrit is written in Devanagari and was once written in many regional scripts), and one script can be used for several languages (Devanagari is used for Hindi, Marathi and Sanskrit).'),
    def('Language', 'A system of words and rules that people use to speak and communicate.'),
    def('Script', 'A set of written signs (letters) used to write a language.'),
    p('People spoke for thousands of years before writing. In India, the earliest readable writing is in the Brahmi script, used in Ashoka’s inscriptions (about 2,250 years ago). Almost all Indian scripts — Telugu, Kannada, Tamil, Devanagari, Bengali and others — slowly developed from Brahmi, which was written from left to right. In the north-west, the Kharosthi script was written from right to left.'),
    stepsB('Brahmi (Ashoka’s time) — the mother of most Indian scripts.', 'Over centuries letter shapes changed region by region.', 'The Telugu–Kannada script developed in the Deccan; later Telugu and Kannada scripts separated.', 'Today’s Telugu letters, with their rounded shapes, grew out of this long history.'),
    keys('Language = speech; script = writing system.', 'Brahmi: oldest readable Indian script; written left to right.', 'Most Indian scripts, including Telugu, come from Brahmi.', 'Kharosthi was written right to left.'),
    remember('The Harappan script is older than Brahmi, but it still cannot be read.'),
  ], [
    ex('Hindi and Marathi are different languages. What do they share?', ['Both are written in the same script.', 'That script is Devanagari.'], 'The Devanagari script'),
    ex('From which ancient script did the Telugu script develop?', ['Most Indian scripts grew from one ancient script used by Ashoka.'], 'Brahmi'),
  ], [
    mcq('mcq', 'Speech vs. writing.', [
      ['A set of signs used to write a language is a…', 'Script', ['Dialect', 'Song', 'Map'], 'Letters.', 'A script is a writing system.'],
      ['Most Indian scripts developed from…', 'Brahmi', ['Roman', 'Greek', 'Chinese'], 'Used in Ashoka’s inscriptions.', 'Brahmi is the ancestor of most Indian scripts.'],
      ['Which script was written from right to left?', 'Kharosthi', ['Brahmi', 'Telugu', 'Devanagari'], 'Used in the north-west.', 'Kharosthi ran right to left.'],
      ['Hindi, Marathi and Sanskrit are commonly written in…', 'Devanagari', ['Telugu script', 'Kharosthi', 'Tamil script'], 'One script, many languages.', 'They share the Devanagari script.'],
      ['Ashoka’s inscriptions were mostly written in…', 'Brahmi script', ['English letters', 'Telugu script', 'Urdu script'], 'About 2,250 years ago.', 'Ashoka used Brahmi in most inscriptions.'],
      ['Which statement is true?', 'One language can be written in more than one script', ['A language can never be written', 'Every language has its own unique script', 'Scripts came before speech'], 'Think of Sanskrit.', 'Sanskrit, for example, has been written in many scripts.'],
    ]),
    tapT('tap', 'Tap the scripts that developed from Brahmi.', [
      ['Telugu', true], ['Kannada', true], ['Tamil', true], ['Devanagari', true], ['Bengali', true],
      ['Roman (English letters)', false], ['Chinese characters', false], ['Arabic script', false],
    ], ['Indian scripts share Brahmi as ancestor.', 'Scripts from other regions of the world have different origins.'], 'Most Indian scripts descend from Brahmi.'),
    matchT('lang', 'language with a script commonly used for it', [
      ['Telugu', 'Telugu script'], ['Hindi', 'Devanagari'], ['Urdu', 'Perso-Arabic (Nastaliq) script'], ['English', 'Roman script'], ['Tamil', 'Tamil script'], ['Ashoka’s Prakrit', 'Brahmi'],
    ], ['Urdu is written right to left.', 'English uses Roman letters.']),
  ]),
  O('ts6.ss.lang.texts', 'Vedas, epics and Jataka stories', [
    h('Great texts of early India'),
    photo('📜', 'Ancient texts were first passed on by memory and later written on palm leaves and birch bark.'),
    p('Many early texts were passed down orally for hundreds of years. Students learnt them by heart from teachers, with special methods to make sure not a syllable changed. Much later they were written on palm leaves (in the south) or birch bark (in the north).'),
    def('Vedas', 'Four collections of sacred hymns, prayers and rituals in early Sanskrit: the Rigveda, Samaveda, Yajurveda and Atharvaveda.'),
    def('Epic', 'A long poem telling the story of heroes and great events. India’s two great epics are the Ramayana and the Mahabharata.'),
    stepsB('Ramayana — composed by Valmiki: the story of Rama, Sita and Lakshmana, and the fight against Ravana.', 'Mahabharata — attributed to Vyasa: the conflict between the Pandavas and Kauravas; it contains the Bhagavad Gita.', 'Jataka stories — stories of the previous lives of the Buddha, in which he often appears as an animal or person showing kindness and wisdom; written in Pali.', 'These stories were retold in many languages, including Telugu (for example, the Andhra Mahabharatam begun by Nannaya).'),
    keys('Four Vedas; passed on orally.', 'Ramayana (Valmiki) and Mahabharata (Vyasa).', 'Jatakas: Buddha’s previous lives, in Pali.', 'Epics were retold in every Indian language.'),
    remember('The Mahabharata is one of the longest poems in the world.'),
  ], [
    ex('Name the four Vedas.', ['Rigveda, Samaveda, Yajurveda and Atharvaveda.'], 'Rig, Sama, Yajur, Atharva'),
    ex('What are Jataka tales?', ['Stories of the Buddha’s earlier lives.', 'They teach values such as kindness, honesty and wisdom.'], 'Stories of the previous lives of the Buddha'),
  ], [
    matchT('text', 'text with its author or description', [
      ['Ramayana', 'Valmiki'], ['Mahabharata', 'Vyasa'], ['Jatakas', 'Previous lives of the Buddha'], ['Rigveda', 'Oldest Veda'], ['Bhagavad Gita', 'Part of the Mahabharata'], ['Andhra Mahabharatam', 'Begun by Nannaya in Telugu'],
    ], ['Valmiki wrote the Ramayana.', 'The Gita is inside the Mahabharata.']),
    mcq('mcq', 'Vedas, epics, Jatakas.', [
      ['How many Vedas are there?', 'Four', ['Two', 'Seven', 'Ten'], 'Rig, Sama, Yajur, Atharva.', 'There are four Vedas.'],
      ['The Ramayana was composed by…', 'Valmiki', ['Vyasa', 'Kalidasa', 'Pothana'], 'An ancient sage-poet.', 'Valmiki is the author of the Ramayana.'],
      ['Jataka stories were written in…', 'Pali', ['English', 'Telugu only', 'Persian'], 'Language of early Buddhist texts.', 'The Jatakas are in Pali.'],
      ['Early texts were first preserved by…', 'Memorising and reciting', ['Printing presses', 'Computers', 'Typewriters'], 'Oral tradition.', 'They were passed on orally.'],
      ['In the south, texts were later written on…', 'Palm leaves', ['Plastic sheets', 'Glass', 'Steel plates'], 'Dried leaves.', 'Palm-leaf manuscripts were common in the south.'],
    ]),
    tapT('tap', 'Tap the ways in which early texts were preserved.', [
      ['Learning by heart from teachers', true], ['Reciting with special methods to avoid errors', true], ['Writing on palm leaves', true], ['Writing on birch bark', true],
      ['Saving on computers', false], ['Printing in newspapers', false], ['Recording on mobile phones', false],
    ], ['There were no machines then.', 'Memory and hand-writing were used.'], 'Oral learning and hand-written manuscripts preserved texts.'),
  ]),
  O('ts6.ss.lang.sci', 'Sangam literature and early books on medicine and astronomy', [
    h('Poetry, healing and the stars'),
    photo('⭐', 'Early Indian astronomers studied the movements of the Sun, Moon and planets.'),
    p('About 2,000 years ago, Tamil poets composed beautiful poems about love, nature, kings and war. Tradition says they were presented at assemblies (sangams) of poets in Madurai, so this is called Sangam literature. It also tells us about trade, towns and daily life in the south.'),
    def('Sangam literature', 'Early Tamil poems, about 2,000 years old, said to have been composed and collected in assemblies of poets at Madurai.'),
    stepsB('Charaka Samhita — a book on medicine: diseases, diet, herbs and healthy living.', 'Sushruta Samhita — a book on surgery describing many operations and instruments.', 'Aryabhata (born 476 CE) wrote the Aryabhatiya (499 CE): he explained that the Earth rotates on its axis and that eclipses are caused by shadows of the Earth and Moon.', 'Indian mathematicians developed the decimal place-value system with zero, later used across the world.', 'Varahamihira wrote on astronomy, weather and plants (Brihat Samhita).'),
    keys('Sangam: Tamil poems from Madurai, about 2,000 years old.', 'Charaka — medicine; Sushruta — surgery.', 'Aryabhata — Earth rotates; eclipses explained (499 CE).', 'Zero and place value developed in India.'),
    remember('India’s first satellite (1975) was named Aryabhata in honour of the astronomer.'),
  ], [
    ex('What did Aryabhata say about day and night?', ['He said the Earth rotates on its axis.', 'This rotation causes day and night, though the sky seems to move.'], 'The Earth’s rotation causes day and night'),
    ex('Aryabhata wrote the Aryabhatiya in 499 CE. How many years before 2026 is that?', ['2026 − 499 = 1527.'], '1,527 years'),
  ], [
    matchT('who', 'scholar or work with its subject', [
      ['Charaka Samhita', 'Medicine'], ['Sushruta Samhita', 'Surgery'], ['Aryabhatiya', 'Astronomy and mathematics'], ['Sangam poems', 'Tamil poetry from Madurai'], ['Varahamihira', 'Astronomy, weather and plants'], ['Zero and place value', 'Indian mathematics'],
    ], ['Sushruta was a surgeon.', 'Aryabhata studied the sky.']),
    mcq('mcq', 'Poetry and science.', [
      ['Sangam literature is in which language?', 'Tamil', ['Telugu', 'Sanskrit', 'Pali'], 'Assemblies at Madurai.', 'Sangam poems are in Tamil.'],
      ['Who wrote a famous book on surgery?', 'Sushruta', ['Charaka', 'Kalidasa', 'Valmiki'], 'Samhita on operations.', 'The Sushruta Samhita deals with surgery.'],
      ['Aryabhata explained that…', 'The Earth rotates on its axis', ['The Earth is flat', 'The Sun goes round the Earth daily', 'Eclipses are caused by demons'], 'Causes day and night.', 'He said the Earth rotates.'],
      ['The Charaka Samhita is about…', 'Medicine', ['War', 'Farming taxes', 'Poetry of love'], 'Diseases and herbs.', 'It is a classic of Indian medicine.'],
      ['Which important idea in mathematics developed in India?', 'Zero and the decimal place-value system', ['The telephone', 'Printing', 'Steam engines'], 'Used every day in counting.', 'Zero and place value spread from India.'],
      ['India’s first satellite was named after…', 'Aryabhata', ['Ashoka', 'Kanishka', 'Charaka'], 'Launched in 1975.', 'It honoured the astronomer Aryabhata.'],
    ]),
    tp('gap', (r) => {
      const [what, y] = r.pick([['Aryabhata wrote the Aryabhatiya', 499], ['Aryabhata was born', 476], ['Varahamihira was active (about)', 550], ['India launched the Aryabhata satellite', 1975], ['Brahmagupta wrote about zero (about)', 628]] as [string, number][]);
      const now = r.pick([2025, 2026, 2030]);
      return numQ(`${what} in ${y} CE. How many years is that before ${now}?`, now - y,
        ['Both years are CE, so subtract.', `${now} − ${y}`], [`${now} − ${y} = ${now - y} years`], [{ when: String(now + y), explain: 'Both are CE years, so subtract, do not add.' }], 0.001, 'years');
    }, 1),
  ]),
]);

// =====================================================================================
// Chapter 20 — Sculptures and Buildings
// =====================================================================================
const ch20 = U(20, 'Sculptures and Buildings', [
  O('ts6.ss.art.harappa', 'Harappan cities', [
    h('Planned cities of 4,500 years ago'),
    photo('🧱', 'Harappan builders used baked bricks of standard sizes for houses, drains and walls.'),
    p('Harappa and Mohenjo-daro (now in Pakistan), and Dholavira, Lothal and Kalibangan (now in India) were among the cities of the Harappan civilisation, which flourished about 2600–1900 BCE. They were carefully planned.'),
    stepsB('Streets were straight and crossed at right angles, dividing the city into blocks.', 'Covered drains ran along the streets; house drains joined them.', 'Houses of baked bricks were one or two storeys high, built around courtyards, many with wells and bathrooms.', 'A raised part, the citadel, had special buildings such as the Great Bath and a large storehouse (granary).', 'Lothal had a dockyard for boats; Dholavira had large water reservoirs cut in rock.'),
    def('Citadel', 'The higher, walled western part of a Harappan city, with important public buildings.'),
    p('Harappan craftspeople made beautiful seals, beads, pottery, a bronze “dancing girl” and a stone figure often called the “priest-king”. Their bricks were made in a fixed ratio of length, width and thickness (about 4 : 2 : 1) in many cities, which shows careful standards.'),
    keys('Grid streets, covered drains, baked bricks.', 'Citadel with Great Bath and granary.', 'Lothal dockyard; Dholavira reservoirs.', 'Seals, beads, bronze dancing girl.'),
    remember('Few ancient cities in the world had drainage as good as the Harappan cities.'),
  ], [
    ex('A Harappan brick is 28 cm long in the ratio 4 : 2 : 1 (length : width : thickness). What are its width and thickness?', ['Length 4 parts = 28 cm, so 1 part = 7 cm.', 'Width = 2 parts = 14 cm; thickness = 1 part = 7 cm.'], 'Width 14 cm, thickness 7 cm'),
    ex('What shows that Harappan cities were planned?', ['Streets met at right angles in a grid.', 'Drains were covered and connected.', 'Bricks were of standard sizes.'], 'Grid streets, connected drains and standard bricks'),
  ], [
    tp('brick', (r) => {
      const part = r.pick([5, 6, 7, 8, 9, 10]);
      const ask = r.pick(['width', 'thickness']);
      const ans = ask === 'width' ? 2 * part : part;
      return numQ(`A Harappan brick has length : width : thickness = 4 : 2 : 1. If its length is ${4 * part} cm, what is its ${ask} in cm?`, ans,
        ['Find the size of 1 part: length ÷ 4.', `1 part = ${4 * part} ÷ 4 = ${part} cm; the ${ask} is ${ask === 'width' ? '2 parts' : '1 part'}.`], [`1 part = ${part} cm`, `${ask[0].toUpperCase()}${ask.slice(1)} = ${ask === 'width' ? `2 × ${part} = ` : ''}${ans} cm`],
        [{ when: String(ask === 'width' ? part : 2 * part), explain: 'Check which part you need: width = 2 parts, thickness = 1 part.' }], 0.001, 'cm');
    }, 2),
    matchT('site', 'Harappan site or feature with its fact', [
      ['Mohenjo-daro', 'The Great Bath'], ['Lothal', 'Dockyard for boats'], ['Dholavira', 'Rock-cut water reservoirs'], ['Kalibangan', 'Fire altars'], ['Citadel', 'Raised, walled part of the city'], ['Bronze dancing girl', 'Famous Harappan metal figure'],
    ], ['Lothal is on the Gujarat coast.', 'The Great Bath is at Mohenjo-daro.']),
    tapT('tap', 'Tap the features of Harappan towns.', [
      ['Straight streets at right angles', true], ['Covered drains', true], ['Baked bricks of standard size', true], ['Houses around courtyards', true], ['A raised citadel', true],
      ['Iron bridges', false], ['Glass skyscrapers', false], ['Electric street lights', false],
    ], ['Think of planning with bricks and drains.', 'Iron, glass towers and electricity came much later.'], 'Harappan towns had grid streets, drains, standard bricks, courtyards and citadels.'),
  ]),
  O('ts6.ss.art.stupa', 'Buddhist stupas and viharas', [
    h('Mounds of peace'),
    photo('🛕', 'Monuments built over sacred relics became centres of worship and pilgrimage.'),
    p('After the Buddha’s death, his relics (bits of bone, ash or objects he used) were placed in caskets and buried under large hemispherical mounds called stupas. Later, relics of important monks were also enshrined. Ashoka is said to have built many stupas.'),
    def('Stupa', 'A dome-shaped mound built over relics of the Buddha or a great monk; devotees walk around it in respect.'),
    stepsB('Anda — the dome, solid inside, containing the relic casket.', 'Harmika — a small railed box on top of the dome.', 'Chhatra — umbrellas above the harmika, a sign of honour.', 'Pradakshina patha — a path around the stupa for walking clockwise.', 'Vedika and toranas — railing around the path and carved gateways.'),
    def('Vihara', 'A monastery where Buddhist monks lived, studied and prayed, with small rooms around a courtyard.'),
    p('Famous stupas stand at Sanchi (Madhya Pradesh) with richly carved gateways, and at Amaravati (Andhra Pradesh). Telangana has many Buddhist sites from the Satavahana period and after: Nelakondapalli (Khammam), Phanigiri (Suryapet), Dhulikatta (Peddapalli), Gajulabanda and others, with stupas, viharas and beautiful carvings.'),
    keys('Stupa: relics under a dome; parts — anda, harmika, chhatra, pradakshina path, railing, toranas.', 'Vihara: monks’ monastery.', 'Sanchi, Amaravati; in Telangana: Phanigiri, Nelakondapalli, Dhulikatta.'),
    remember('Devotees walk around a stupa clockwise, keeping it on their right side, as a mark of respect.'),
  ], [
    ex('What is kept inside a stupa?', ['A casket with relics of the Buddha or a great monk.', 'It is placed inside the solid dome (anda).'], 'Relics in a casket'),
    ex('Name two Buddhist sites in Telangana.', ['Phanigiri in Suryapet district.', 'Nelakondapalli in Khammam district.'], 'Phanigiri and Nelakondapalli (also Dhulikatta)'),
  ], [
    matchT('parts', 'part of a stupa with its description', [
      ['Anda', 'The dome containing the relics'], ['Harmika', 'Railed box on top of the dome'], ['Chhatra', 'Umbrella above, a sign of honour'], ['Pradakshina patha', 'Path for walking around'], ['Torana', 'Carved gateway'], ['Vedika', 'Railing around the stupa'],
    ], ['Anda = egg-shaped dome.', 'Toranas are gateways.']),
    mcq('mcq', 'Stupas and viharas.', [
      ['A stupa is built over…', 'Relics of the Buddha or a great monk', ['A river', 'A king’s palace', 'A market'], 'Sacred remains.', 'Stupas enshrine relics.'],
      ['A vihara is a…', 'Monastery where monks lived', ['Kind of coin', 'Royal palace', 'Market yard'], 'Monks’ home.', 'Viharas housed monks.'],
      ['Which stupa is famous for its carved gateways?', 'Sanchi', ['Charminar', 'Golconda', 'Qutb Minar'], 'In Madhya Pradesh.', 'Sanchi’s toranas are famous.'],
      ['Phanigiri, a Buddhist site, is in which district of Telangana?', 'Suryapet', ['Adilabad', 'Hyderabad', 'Nizamabad'], 'South-eastern Telangana.', 'Phanigiri is in Suryapet district.'],
      ['Devotees walk around a stupa…', 'Clockwise', ['Anticlockwise', 'Never', 'Backwards'], 'Keeping it on their right.', 'Circumambulation is clockwise.'],
    ]),
    tapT('tap', 'Tap the Buddhist sites found in Telangana.', [
      ['Phanigiri', true], ['Nelakondapalli', true], ['Dhulikatta', true], ['Gajulabanda', true],
      ['Sanchi', false], ['Mohenjo-daro', false], ['Ajanta', false],
    ], ['Three wrong options are outside Telangana.', 'Sanchi is in Madhya Pradesh, Ajanta in Maharashtra.'], 'Phanigiri, Nelakondapalli, Dhulikatta and Gajulabanda are in Telangana.', 5),
  ]),
  O('ts6.ss.art.cave', 'Rock-cut chaityas and early temples', [
    h('Halls carved from mountains'),
    photo('⛰️', 'Whole prayer halls and monasteries were carved into hillsides of rock.'),
    p('In the hills of western India, monks and craftspeople carved entire halls out of solid rock. A chaitya is a prayer hall with a small stupa at the far end, rows of pillars and an arched roof; viharas were carved nearby for monks to live in. Famous examples are at Karle and Bhaja and at Ajanta (Maharashtra), whose caves also have wonderful wall paintings.'),
    def('Chaitya', 'A Buddhist prayer hall, often rock-cut, with a stupa at one end and pillars along the sides.'),
    p('About 1,600 years ago, in the Gupta period, the first free-standing stone and brick temples were built to house images of gods. The Dashavatara temple at Deogarh and the brick temple at Bhitargaon are early examples. Later, Pallava kings carved monolithic temples (rathas) at Mahabalipuram, near Chennai.'),
    stepsB('Garbhagriha — the small inner room where the main image is kept.', 'Shikhara — the tower built above the garbhagriha.', 'Mandapa — a hall where people gather.', 'Pradakshina path — a path around the shrine.'),
    keys('Chaityas: rock-cut prayer halls (Karle, Bhaja, Ajanta).', 'Early temples: Deogarh, Bhitargaon (Gupta period).', 'Temple parts: garbhagriha, shikhara, mandapa.', 'Mahabalipuram: Pallava rathas carved from single rocks.'),
    remember('Carving a hall out of rock means removing stone, not adding it — a mistake could not be undone.'),
  ], [
    ex('What is the difference between a chaitya and a vihara?', ['A chaitya is a prayer hall with a stupa inside.', 'A vihara is where monks live.'], 'Chaitya = prayer hall; vihara = living quarters'),
    ex('Which part of a temple holds the main image?', ['The innermost room.', 'It is called the garbhagriha (womb-house).'], 'The garbhagriha'),
  ], [
    matchT('parts', 'building part or site with its description', [
      ['Chaitya', 'Rock-cut prayer hall with a stupa'], ['Garbhagriha', 'Inner room with the main image'], ['Shikhara', 'Tower over the shrine'], ['Mandapa', 'Hall for gathering'], ['Ajanta', 'Caves with famous paintings'], ['Mahabalipuram', 'Pallava rathas carved from rock'],
    ], ['Garbha = womb, griha = house.', 'Ajanta is known for paintings.']),
    orderT('time', 'Arrange these in time order (earliest first).', ['Harappan cities with planned drains', 'Ashoka builds stupas', 'Rock-cut chaityas such as Karle', 'Gupta-period temple at Deogarh', 'Pallava rathas at Mahabalipuram'], ['Harappan cities are the oldest.', 'Mahabalipuram (7th century CE) is the latest here.'], 'Harappan (c. 2500 BCE) → Ashoka (3rd c. BCE) → Karle (about 1st c. BCE–1st c. CE) → Deogarh (about 5th–6th c. CE) → Mahabalipuram (7th c. CE).'),
    mcq('mcq', 'Rock-cut halls and early temples.', [
      ['A rock-cut Buddhist prayer hall is called a…', 'Chaitya', ['Vihara', 'Citadel', 'Granary'], 'It has a stupa inside.', 'Chaityas are prayer halls.'],
      ['Ajanta is famous for its…', 'Wall paintings', ['Dockyard', 'Great Bath', 'Iron pillar'], 'Inside the caves.', 'Ajanta’s cave paintings are world famous.'],
      ['The tower over a temple’s shrine is the…', 'Shikhara', ['Mandapa', 'Anda', 'Harmika'], 'It rises high.', 'The shikhara crowns the shrine.'],
      ['The Dashavatara temple at Deogarh belongs to the…', 'Gupta period', ['Harappan period', 'Mauryan period', 'Modern period'], 'About 1,500 years ago.', 'It is an early Gupta-period temple.'],
      ['The rathas at Mahabalipuram were carved by the…', 'Pallavas', ['Mauryas', 'Kushanas', 'Harappans'], 'Near Chennai.', 'Pallava kings carved them from single rocks.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 21 — Greenery in Telangana
// =====================================================================================
const ch21 = U(21, 'Greenery in Telangana', [
  O('ts6.ss.green.forest', 'Forests and greenery in Telangana', [
    h('The green wealth of Telangana'),
    photo('🐅', 'Tigers live in the protected forests of Kawal and Amrabad in Telangana.'),
    p('About a quarter of Telangana’s area (roughly 24%) is recorded as forest land. Most forests are tropical dry deciduous — the trees shed their leaves in the hot, dry summer. In the wetter north-east, along the Godavari, the forests are thicker (moist deciduous). Teak, nallamaddi, bamboo, tendu, ippa (mahua), sandalwood and many medicinal plants grow there.'),
    def('Deciduous forest', 'A forest whose trees shed their leaves in one season (in Telangana, the dry summer) to save water.'),
    stepsB('Kawal Tiger Reserve — Nirmal and Mancherial districts, on the Godavari.', 'Amrabad Tiger Reserve — Nallamala hills, Nagarkurnool and Nalgonda districts.', 'Eturnagaram and Pakhal Wildlife Sanctuaries — Mulugu and nearby districts.', 'State symbols: tree — Jammi; flower — Tangedu; bird — Palapitta (Indian roller); animal — Jinka (spotted deer).'),
    p('Forests give us oxygen, rain, clean water, soil protection, wood, fruits, medicines and homes for animals; they support Adivasi livelihoods. Cutting forests leads to soil erosion, less groundwater, hotter towns and loss of wildlife.'),
    keys('About 24% of Telangana is forest land (recorded area).', 'Mostly dry deciduous; moister in the north-east.', 'Tiger reserves: Kawal and Amrabad.', 'State tree Jammi, flower Tangedu, bird Palapitta, animal Jinka.'),
    remember('Forests are like a sponge: they soak rainwater into the ground and release it slowly to streams and wells.'),
  ], [
    ex('Telangana covers about 1,12,000 km². If about 24% is forest, roughly how much is forest land?', ['24% of 1,12,000 = 24 × 1,12,000 ÷ 100.', '= 26,880 km².'], 'About 27,000 km²'),
    ex('Why do trees in Telangana’s forests shed their leaves in summer?', ['Summers are hot and dry.', 'Shedding leaves reduces water loss.'], 'To save water in the dry season'),
  ], [
    tp('pct', (r) => {
      const area = r.pick([1000, 2000, 5000, 7000, 8000]), pc = r.pick([10, 15, 20, 25, 30, 40]);
      const place = r.pick(['A district', 'A mandal', 'An imaginary region']);
      return numQ(`(Illustrative) ${place} has an area of ${area.toLocaleString('en-IN')} km². ${pc}% of it is forest. How many km² is forest?`, area * pc / 100,
        ['Find the percentage: pc/100 × area.', `${pc} × ${area} ÷ 100`], [`${pc}% of ${area.toLocaleString('en-IN')} = ${pc} × ${area} ÷ 100 = ${(area * pc / 100).toLocaleString('en-IN')} km²`], [{ when: String(area * pc), explain: 'Divide by 100 when finding a percentage.' }], 0.001, 'km²');
    }, 2),
    matchT('sym', 'Telangana state symbol or reserve with its name', [
      ['State tree', 'Jammi'], ['State flower', 'Tangedu'], ['State bird', 'Palapitta (Indian roller)'], ['State animal', 'Jinka (spotted deer)'], ['Tiger reserve on the Godavari', 'Kawal'], ['Tiger reserve in the Nallamala', 'Amrabad'],
    ], ['Tangedu flowers are used in Bathukamma.', 'Amrabad is in the south, Kawal in the north.']),
    mcq('mcq', 'Telangana’s forests.', [
      ['Most of Telangana’s forests are…', 'Tropical dry deciduous', ['Evergreen rainforests', 'Snow forests', 'Mangroves'], 'Leaves fall in summer.', 'Dry deciduous forests dominate.'],
      ['Roughly what share of Telangana’s area is recorded forest land?', 'About 24%', ['About 70%', 'About 2%', 'About 90%'], 'About a quarter.', 'Recorded forest is about 24% of the area.'],
      ['Amrabad Tiger Reserve is in the…', 'Nallamala hills', ['Himalayas', 'Thar desert', 'Western Ghats'], 'Southern Telangana.', 'Amrabad lies in the Nallamala hills.'],
      ['Which is NOT a benefit of forests?', 'Causing soil erosion', ['Bringing rain and clean water', 'Giving medicines', 'Homes for wildlife'], 'Forests prevent erosion.', 'Forests protect soil — cutting them causes erosion.'],
      ['Telangana’s state bird is the…', 'Palapitta (Indian roller)', ['Peacock', 'Parrot', 'Crow'], 'Seen at Dasara.', 'The Palapitta is the state bird.'],
    ]),
  ]),
  O('ts6.ss.green.haritha', 'Greening programmes and our role', [
    h('Planting for the future'),
    photo('🌱', 'A sapling planted today becomes a shady tree for the next generation.'),
    p('To increase green cover, the Government of Telangana began the Telanganaku Haritha Haram (“green garland for Telangana”) programme in 2015. Crores of saplings were raised in nurseries — many villages have their own nursery — and planted along roads, canal bunds, in schools, offices, forests and village common lands. Urban forest parks and village “nature parks” (palle prakruthi vanams) were developed.'),
    def('Afforestation', 'Planting trees on land that has no trees or has lost its forest cover.'),
    def('Survival rate', 'The percentage of planted saplings that are still alive after a period such as one year.'),
    p('Planting is only the first step. Saplings need watering, protection from cattle with tree guards, and care for two or three years. Choosing native trees suited to the local soil and rainfall — neem, ravi (peepal), marri (banyan), kanuga, chinta (tamarind), jammi — gives better survival and helps birds and insects.'),
    keys('Haritha Haram began in 2015 to increase green cover.', 'Nurseries, avenue planting, urban forest parks, village nature parks.', 'Care after planting decides survival.', 'Native species survive better.'),
    remember('Survival rate = (saplings alive ÷ saplings planted) × 100.'),
  ], [
    ex('A school planted 200 saplings; 170 survived after a year. What is the survival rate?', ['170 ÷ 200 × 100 = 85.'], '85%'),
    ex('Why are native trees like neem and tamarind good choices?', ['They are suited to local soil and rainfall.', 'They need less care and support local birds and insects.'], 'They survive better and support local wildlife'),
  ], [
    tp('survive', (r) => {
      const planted = r.pick([100, 200, 400, 500, 1000]), pc = r.pick([60, 70, 75, 80, 85, 90, 95]);
      const alive = planted * pc / 100;
      const n = r.pick(['A school eco-club', 'A gram panchayat', 'A colony welfare association', 'A youth club', 'A municipality']);
      return numQ(`(Illustrative) ${n} planted ${planted} saplings. After one year, ${alive} are alive. What is the survival rate in per cent?`, pc,
        ['Survival rate = alive ÷ planted × 100.', `${alive} ÷ ${planted} × 100`], [`${alive} ÷ ${planted} = ${pc / 100}`, `× 100 = ${pc}%`],
        [{ when: String(planted - alive), explain: 'That is the number of saplings that died. Find what percentage survived.' }], 0.001, '%');
    }, 2),
    orderT('care', 'Put the steps of growing a tree in order.', ['Collect seeds of a native tree', 'Raise seedlings in a nursery', 'Dig a pit and plant the sapling at the start of the rains', 'Put a tree guard against cattle', 'Water and care for it for two to three years'], ['Nursery comes before planting.', 'Care continues for years.'], 'Seeds → nursery → plant in the rains → protect → care.'),
    tapT('tap', 'Tap the actions that help a planted sapling survive.', [
      ['Watering it regularly in the dry season', true], ['Putting a tree guard around it', true], ['Choosing a native species', true], ['Planting at the start of the rainy season', true], ['Adding mulch to keep the soil moist', true],
      ['Letting goats graze around it', false], ['Planting in peak summer and forgetting it', false], ['Pouring waste oil at its roots', false],
    ], ['Think of water, protection and timing.', 'Goats and neglect kill saplings.'], 'Water, protection, right timing and native species improve survival.'),
  ]),
  O('ts6.ss.green.people', 'Environmentalists: the Forest Man of India and Vanajeevi Ramaiah', [
    h('One person can make a forest'),
    photo('🌳', 'Patient tree-planting by individuals has created whole forests.'),
    p('Jadav Payeng of Majuli island in Assam is known as the “Forest Man of India”. From 1979, as a teenager, he began planting bamboo and then other trees on a bare sandbar of the Brahmaputra river. Over decades he created a forest of several hundred hectares, now called the Molai forest, where birds, deer, rhinos, tigers and elephants are seen. He received the Padma Shri in 2015.'),
    p('Daripalli Ramaiah of Khammam district in Telangana became known as “Vanajeevi” (one who lives for the forest) or “Chetla Ramaiah”. For decades he carried seeds and saplings wherever he went, planting them along roads and on empty land; he is said to have planted more than a crore of trees. He wore a placard asking people to save trees. He received the Padma Shri in 2017.'),
    def('Environmentalist', 'A person who works to protect the natural environment — forests, water, air, soil and wildlife.'),
    keys('Jadav Payeng — Forest Man of India; Molai forest on Majuli, Assam; Padma Shri 2015.', 'Vanajeevi Daripalli Ramaiah — Khammam; planted over a crore trees; Padma Shri 2017.', 'Small, steady actions add up to big change.'),
    remember('You do not need to be famous to help: plant one tree and care for it until it stands on its own.'),
  ], [
    ex('Why is Jadav Payeng called the “Forest Man of India”?', ['He planted trees on a bare sandbar for decades.', 'His work created a large forest that is now home to many animals.'], 'He created a whole forest by himself'),
    ex('Jadav Payeng began planting in 1979. How many years had he been planting by 2015, when he received the Padma Shri?', ['2015 − 1979 = 36.'], '36 years'),
  ], [
    matchT('who', 'person or place with the right fact', [
      ['Jadav Payeng', 'Forest Man of India'], ['Molai forest', 'Grown on Majuli island, Assam'], ['Daripalli Ramaiah', 'Vanajeevi of Khammam'], ['Padma Shri 2017', 'Awarded to Vanajeevi Ramaiah'], ['Padma Shri 2015', 'Awarded to Jadav Payeng'], ['Brahmaputra', 'River around Majuli island'],
    ], ['Payeng is from Assam.', 'Ramaiah is from Khammam in Telangana.']),
    tp('years', (r) => {
      const [what, a, b] = r.pick([
        ['Jadav Payeng began planting in 1979 and received the Padma Shri in 2015. How many years after he began did he receive it?', 1979, 2015],
        ['Haritha Haram began in 2015. How many years had it been running by 2025?', 2015, 2025],
        ['Jadav Payeng began planting in 1979. How many years of planting had he completed by 2000?', 1979, 2000],
        ['Vanajeevi Ramaiah received the Padma Shri in 2017. How many years ago was that, counted from 2026?', 2017, 2026],
        ['Jadav Payeng received the Padma Shri in 2015 and Vanajeevi Ramaiah in 2017. How many years apart were the two awards?', 2015, 2017],
        ['Haritha Haram began in 2015. How many years will have passed by 2030?', 2015, 2030],
      ] as [string, number, number][]);
      return numQ(what, b - a,
        ['Subtract the earlier year from the later year.', `${b} − ${a}`], [`${b} − ${a} = ${b - a} years`], [{ when: String(a + b), explain: 'To find the gap between two years, subtract.' }], 0.001, 'years');
    }, 1),
    tapT('tap', 'Tap the things a Class 6 student can do to keep Telangana green.', [
      ['Plant a sapling and water it regularly', true], ['Join or start a school eco-club', true], ['Use both sides of paper', true], ['Collect seeds of native trees for a nursery', true], ['Tell family members not to burn dry leaves', true],
      ['Break branches to make sticks for fun', false], ['Cut a tree to make space for parking', false], ['Throw plastic in a forest', false],
    ], ['Think of small, regular actions.', 'Breaking, cutting and littering harm greenery.'], 'Planting, caring, saving paper and spreading awareness keep the state green.'),
  ]),
]);

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21];
