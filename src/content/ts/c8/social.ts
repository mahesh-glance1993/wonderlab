// Telangana SCERT Class 8 — Social Studies (25 chapters incl. 11A/11B), organised in six themes:
// I Diversity on the Earth (1-6), II Production, Exchange and Livelihoods (7-9), III Political Systems and Governance (10-15),
// IV Social Organisation and Inequities (16-18), V Religion and Society (19-20), VI Culture and Communication (21-24).
// Original explanations aligned to the official chapter list (src/content/ts/books.ts, syllabus.json).
// One unit per chapter (ids ts8.ss.ch<n>); objectives ts8.ss.<topic>.<skill>. Templates use only the Rng they are given.
// Figures marked "about" or "illustrative" are rounded for teaching; teachers should check current official data.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, photo, explore, L, approx, choose, matching, ordering, tapAll,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

/** Source reference for a chapter of the SCERT Telangana Class VIII Social Studies book. */
const src = (n: number | string) => tsSrc(8, 'social', n);

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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Lock in the pairs you are sure of first, then reason out the rest.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** Order a fixed sequence (a process). */
const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, steps), hints,
  mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
  solution: [...steps.map((s, i) => `${i + 1}. ${s}`), why],
}), d);

/** Timeline: pick n events with DIFFERENT dates and put them in time order. Dates are sort keys (1947.08 = Aug 1947). */
type EV = [number, string, string];
const timelineT = (key: string, prompt: string, events: EV[], hints: string[], n = 4, d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const seen = new Set<number>();
  const pick: EV[] = [];
  for (const e of r.shuffle(events)) { if (pick.length < n && !seen.has(e[0])) { seen.add(e[0]); pick.push(e); } }
  pick.sort((a, b) => a[0] - b[0]);
  return {
    type: 'order', prompt, ...ordering(r, pick.map((e) => e[1])), hints,
    mistakes: [{ when: 'wrong', explain: 'Some events are out of time order. Recall the year of each event and arrange from earliest to latest.' }],
    solution: pick.map((e, i) => `${i + 1}. ${e[1]} — ${e[2]}`),
  };
}, d);

/** Tap every correct option; n options drawn from the pool, always at least one right and one wrong. */
const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = r.pick(pool.filter((x) => x[1])), no = r.pick(pool.filter((x) => !x[1]));
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option on its own. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join('; ')}.`, why],
  };
}, d);

/** Typed numeric answer. `rel` is the accepted relative error. */
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01, u?: string): QSpec => {
  const unit = u === '%' ? undefined : u; // '%' is not a grading unit: type the number only
  return {
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, false) : approx(ans, rel),
  hints, solution, mistakes,
  };
};

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

/** Bar graph block. */
const bars = (labels: string[], values: number[], unit: string, alt: string) => vis({ kind: 'bar-graph', labels, values, unit }, alt);

// =====================================================================================
// Chapter 1 — Reading and Analysis of Maps
// =====================================================================================
const ch1: USpec = {
  id: 'ts8.ss.ch1', subject: 'social', title: 'Reading and Analysis of Maps', source: src(1),
  objectives: [
    {
      id: 'ts8.ss.maps.history', title: 'Maps through the ages and thematic maps', prereqs: [],
      intro: [
        h('From clay tablets to Google Maps'),
        photo('🗺️', 'A map is a drawing of the Earth, or a part of it, on a flat surface, reduced to scale.'),
        p('When your family uses a phone map to find a wedding hall in Warangal, they are using an idea that is thousands of years old. People have always wanted to record where water, roads, villages and enemies were. Over time, maps became more accurate as people learnt to measure the Earth.'),
        stepsB(
          'About 600 BCE: a Babylonian clay tablet shows the world as a flat disc with Babylon at its centre.',
          'About 150 CE: Ptolemy, a Greek scholar in Alexandria, describes how to draw maps on a grid of latitudes and longitudes.',
          '1154 CE: the Arab geographer Al-Idrisi prepares a world map for the king of Sicily — with south at the top.',
          '1569 CE: Gerardus Mercator publishes a world map projection that sailors use for navigation.',
          '1767: the Survey of India is set up; from 1802 the Great Trigonometrical Survey measures India from a baseline near Madras (Chennai).',
          'Today: aerial photographs, satellites and GPS make very accurate digital maps.',
        ),
        def('Thematic map', 'A map that shows one particular theme or subject — such as rainfall, population, soils, crops or roads — over an area.'),
        def('Physical and political maps', 'A physical map shows natural features (mountains, rivers, plateaus); a political map shows countries, states, districts and their boundaries.'),
        p('A thematic map answers a single question well: Where does it rain most in Telangana? Where are the coal mines? Which districts grow cotton? By putting two thematic maps side by side, a geographer can discover links — for example, between black soil and cotton fields.'),
        keys('Maps reduce a large area to a small sheet using a scale.', 'Early maps were based on travellers’ stories; modern maps on measurement and satellites.', 'Physical maps show nature, political maps show boundaries, thematic maps show one theme.'),
        remember('Ptolemy (about 150 CE) used latitudes and longitudes; the Survey of India was founded in 1767.'),
        tip('Before reading any map, first read its title, then its legend (key), then its scale.'),
      ],
      examples: [
        ex('A map of Telangana shows only the average yearly rainfall in each district using shades of blue. What kind of map is it? Why?', ['It deals with only one subject — rainfall.', 'It does not mainly show mountains or boundaries.', 'A map that shows one theme is a thematic map.'], 'A thematic (rainfall) map'),
        ex('Arrange: Mercator’s map, Babylonian clay map, Ptolemy’s grid, Al-Idrisi’s map — oldest first.', ['Babylonian clay tablet — about 600 BCE.', 'Ptolemy — about 150 CE.', 'Al-Idrisi — 1154 CE.', 'Mercator — 1569 CE.'], 'Babylonian → Ptolemy → Al-Idrisi → Mercator'),
      ],
      practice: [
        timelineT('tl', 'Put these steps in the history of map-making in time order.', [
          [-600, 'Babylonian clay tablet map', 'about 600 BCE'], [150, 'Ptolemy describes maps on a latitude–longitude grid', 'about 150 CE'], [1154, 'Al-Idrisi’s world map for the king of Sicily', '1154'],
          [1569, 'Mercator’s world map for navigation', '1569'], [1767, 'Survey of India is set up', '1767'], [1802, 'Great Trigonometrical Survey begins near Madras', '1802'],
        ], ['Ancient Babylon is the oldest.', 'The Survey of India came in the British period.']),
        mcq('mcq', 'Ask: does the map show nature, boundaries, or one special theme?', [
          ['A map showing where cotton, rice and maize are grown in Telangana is a…', 'Thematic map', ['Political map', 'Physical map', 'Globe'], 'It shows one subject — crops.', 'A map that shows a single theme such as crops is a thematic map.'],
          ['A map that shows the boundaries of states and districts is a…', 'Political map', ['Physical map', 'Thematic rainfall map', 'Contour map'], 'Boundaries are drawn by people and governments.', 'Political maps show administrative boundaries.'],
          ['Who described drawing maps on a grid of latitudes and longitudes, about 150 CE?', 'Ptolemy', ['Mercator', 'Al-Idrisi', 'Lambton'], 'A Greek scholar of Alexandria.', 'Ptolemy’s Geography explained the use of a latitude–longitude grid.'],
          ['Al-Idrisi’s famous world map of 1154 had which direction at the top?', 'South', ['North', 'East', 'West'], 'It looks upside down to us.', 'Many Arab maps of the time placed south at the top.'],
          ['The Survey of India was established in…', '1767', ['1857', '1947', '1600'], 'It is one of the oldest survey departments in the world.', 'The Survey of India dates from 1767.'],
          ['Which technology makes today’s maps most accurate?', 'Satellites and GPS', ['Clay tablets', 'Travellers’ stories', 'Hand-drawn sketches only'], 'Think of your phone map.', 'Satellite images and GPS measure positions very precisely.'],
        ]),
        matchT('match', 'map type or maker to its description', [
          ['Physical map', 'Shows mountains, rivers and plateaus'], ['Political map', 'Shows states and boundaries'], ['Thematic map', 'Shows one subject such as rainfall'],
          ['Mercator', 'World map for sailors, 1569'], ['Ptolemy', 'Latitude–longitude grid, about 150 CE'], ['Atlas', 'A book of maps'],
        ], ['Physical = nature; political = boundaries.', 'Mercator helped navigators.']),
      ],
    },
    {
      id: 'ts8.ss.maps.symbols', title: 'Scale, conventional symbols and contour lines', prereqs: ['ts8.ss.maps.history'],
      intro: [
        h('The language of maps'),
        photo('🧭', 'Maps use a north arrow, a scale and a legend of symbols so that anyone can read them.'),
        p('A map is like a message written in a special language. Its alphabet is made of symbols and colours that people around the world agree on. These are called conventional symbols. Once you learn them you can read a map of Adilabad or Argentina.'),
        def('Scale', 'The ratio between a distance on the map and the real distance on the ground, e.g. 1 cm = 5 km.'),
        def('Conventional symbols', 'Standard signs, letters and colours used on maps: blue for water bodies, green for plains or forests, yellow/brown for plateaus and highlands, black for railways and settlements, red for roads.'),
        def('Contour line', 'A line on a map joining places of the same height above mean sea level.'),
        f('Real distance = map distance × scale value', 'real distance equals map distance times the scale value'),
        p('Contour lines tell us the shape of the land (relief). If the lines are close together, the slope is steep. If they are far apart, the slope is gentle. Circles getting smaller towards the centre with heights increasing show a hill. The fixed difference in height between two neighbouring contours is the contour interval.'),
        keys('Always check the scale before measuring distance.', 'Blue — water; green — lowland/forest; brown — highland.', 'Contours close together = steep; far apart = gentle.', 'Contour interval is the same throughout one map.'),
        remember('Contour lines never cross each other, because one place cannot have two heights.'),
        tip('To count climb: (top contour − bottom contour) ÷ contour interval = number of intervals crossed.'),
      ],
      examples: [
        ex('On a map with scale 1 cm = 4 km, Karimnagar and Peddapalli are 7 cm apart. What is the real distance?', ['Real distance = map distance × scale value.', '7 × 4 = 28 km.'], 'About 28 km'),
        ex('A trekker walks from the 300 m contour to the 450 m contour. The contour interval is 50 m. How many contour lines does she cross after the starting one?', ['Height gained = 450 − 300 = 150 m.', 'Intervals = 150 ÷ 50 = 3.', 'She crosses the 350, 400 and 450 m lines.'], '3 contour lines'),
      ],
      practice: [
        tp('scale', (r) => {
          const s = r.pick([2, 3, 4, 5, 10]);
          const d = r.pick([3, 4, 6, 7, 8, 9]);
          const pair = r.pick(['Hyderabad and Sangareddy', 'Warangal and Hanamkonda bus stand', 'two villages', 'Nizamabad and Armoor', 'Khammam and Kothagudem']);
          return numQ(`On a map with scale 1 cm = ${s} km, ${pair} are ${d} cm apart. What is the real distance in km?`, s * d, ['Real distance = map distance × scale value.', `Multiply ${d} by ${s}.`], [`${d} cm × ${s} km per cm = ${s * d} km`], [{ when: String(d + s), explain: 'You added. Each centimetre stands for the full scale distance, so multiply.' }], 0.001, 'km');
        }, 1),
        tp('contour', (r) => {
          const ci = r.pick([10, 20, 25, 50]);
          const lo = r.pick([100, 200, 300]);
          const k = r.pick([3, 4, 5, 6]);
          return numQ(`The contour interval of a map is ${ci} m. A path climbs from the ${lo} m contour to the ${lo + k * ci} m contour. How many contour intervals does it cross?`, k, ['Find the height difference first.', `Divide the height difference by ${ci}.`], [`Height difference = ${lo + k * ci} − ${lo} = ${k * ci} m`, `${k * ci} ÷ ${ci} = ${k} intervals`], [], 0.001);
        }, 2),
        mcq('mcq', 'Recall the agreed colours and what contour spacing tells you.', [
          ['On a map, rivers and lakes are normally coloured…', 'Blue', ['Brown', 'Red', 'Black'], 'Think of water.', 'Water bodies are shown in blue by convention.'],
          ['Contour lines drawn very close together show…', 'A steep slope', ['A gentle slope', 'A flat plain', 'A river'], 'Height changes fast over a short distance.', 'Close contours mean a big rise over a short distance — a steep slope.'],
          ['A contour line joins places of equal…', 'Height above sea level', ['Rainfall', 'Temperature', 'Population'], 'Lines of equal rainfall are isohyets.', 'Contours join points at the same height above mean sea level.'],
          ['Brown or yellow shading on a physical map usually shows…', 'Highlands and plateaus', ['Seas', 'Forests', 'Towns'], 'The Deccan plateau looks this colour.', 'Shades of yellow and brown are used for higher land.'],
          ['Why can contour lines never cross?', 'One place cannot have two different heights', ['Maps are too small', 'Surveyors forbid it', 'They are drawn in blue'], 'Think about what a crossing point would mean.', 'At a crossing point the land would have two heights at once, which is impossible.'],
          ['A scale of 1 cm = 10 km means 5 cm on the map shows…', '50 km', ['15 km', '2 km', '5 km'], 'Multiply.', '5 × 10 = 50 km.'],
        ]),
      ],
    },
    {
      id: 'ts8.ss.maps.atlas', title: 'Using an atlas: Telangana’s relief, rainfall and soil maps', prereqs: ['ts8.ss.maps.symbols'],
      intro: [
        h('Reading Telangana from the atlas'),
        photo('📚', 'An atlas is a book of maps — physical, political and thematic — with an index to find places.'),
        def('Atlas', 'A collection of maps bound together, usually with an index listing places with their latitude and longitude or grid square.'),
        p('Telangana lies on the Deccan plateau. A relief map shows most of the state between about 300 m and 600 m above sea level, sloping gently from the north-west towards the south-east, which is why the Godavari and Krishna flow eastwards to the Bay of Bengal. Hill ranges and higher land appear in the north (around Adilabad) and the Nallamala hills appear in the south (Nagarkurnool).'),
        p('A rainfall map shows that most rain comes from the south-west monsoon (June–September). The north and north-east (Adilabad, Komaram Bheem Asifabad, Mulugu, Bhadradri Kothagudem) receive more rain, roughly 1,000–1,200 mm or more, while the south and south-west (Mahabubnagar, Jogulamba Gadwal, Nalgonda) receive less, often 600–750 mm. The state average is roughly 900 mm a year (rounded figures).'),
        p('A soil map shows red soils (chalka) over large parts of the state, black cotton soils (regur) in districts such as Adilabad, Nizamabad and parts of Medak, and alluvial soils along the Godavari and Krishna valleys.'),
        bars(['North-east (e.g. Mulugu)', 'Centre (e.g. Hyderabad)', 'South (e.g. Gadwal)'], [1150, 800, 650], 'mm', 'Illustrative, rounded average yearly rainfall: higher in the north-east, lower in the south of Telangana.'),
        keys('Use the atlas index to find a place, then its grid square.', 'Telangana: plateau land, sloping to the south-east.', 'Rainfall decreases from north-east to south-west.', 'Red soils widespread; black soils in the north-west; alluvium along rivers.'),
        remember('Overlaying thematic maps reveals links: black soil + moderate rain → cotton; alluvium + canals → paddy.'),
        tip('When comparing two thematic maps, look for areas where the same colour pattern repeats.'),
      ],
      examples: [
        ex('Using a rainfall map, which would get more rain: Bhadradri Kothagudem or Jogulamba Gadwal? Why?', ['Rainfall in Telangana decreases from north-east to south-west.', 'Bhadradri Kothagudem is in the north-east, closer to the path of monsoon rains and forests.', 'Jogulamba Gadwal is in the dry south-west.'], 'Bhadradri Kothagudem'),
        ex('A soil map shows black soil around Adilabad; a crop map shows cotton there. What link can you make?', ['Black soil holds moisture for a long time.', 'Cotton grows well in moisture-retentive black soil.', 'So the overlay suggests black soil supports cotton cultivation.'], 'Black (regur) soil favours cotton'),
      ],
      practice: [
        mcq('mcq', 'Recall Telangana’s relief, rainfall and soil patterns.', [
          ['Telangana is part of which landform?', 'The Deccan plateau', ['The Indo-Gangetic plain', 'The Thar desert', 'The Himalayas'], 'It is old, hard, raised land in peninsular India.', 'Telangana lies on the Deccan plateau.'],
          ['Which part of Telangana generally receives the most rainfall?', 'The north and north-east', ['The south-west', 'The centre only', 'All parts get equal rain'], 'Think of the forests of Mulugu and Bhadradri.', 'Rainfall is higher in the north-east and decreases towards the south-west.'],
          ['Most of Telangana’s rain comes from the…', 'South-west monsoon (June–September)', ['Western disturbances', 'Winter snow', 'North-east monsoon only'], 'The kharif season begins with it.', 'The south-west monsoon brings most of the yearly rain.'],
          ['Black cotton soil (regur) is found mostly in…', 'North-western districts like Adilabad and Nizamabad', ['Along the coast', 'Only in Hyderabad city', 'The Himalayas'], 'Cotton is a major crop there.', 'Regur occurs mainly in the north-west of the state.'],
          ['Telangana’s major rivers flow towards the…', 'East, into the Bay of Bengal', ['West, into the Arabian Sea', 'North, into the Ganga', 'They do not flow out'], 'The plateau slopes south-east.', 'The Godavari and Krishna flow east to the Bay of Bengal.'],
          ['To find a place quickly in an atlas you use the…', 'Index', ['Cover page', 'Scale bar', 'North arrow'], 'It is at the back of the atlas.', 'The index lists places with page and grid reference.'],
        ]),
        matchT('match', 'Telangana map feature to the right description', [
          ['Red soil (chalka)', 'Widespread across the state'], ['Black soil (regur)', 'North-west; good for cotton'], ['Alluvial soil', 'Along Godavari and Krishna valleys'],
          ['North-east', 'Highest rainfall'], ['South-west', 'Lowest rainfall'], ['Nallamala hills', 'South, in Nagarkurnool'],
        ], ['Soils first, then rainfall.', 'Alluvium is carried by rivers.']),
        tapT('tap', 'Tap every statement that a thematic map of Telangana could show.', [
          ['Average yearly rainfall of each district', true], ['Distribution of soil types', true], ['Where coal is mined', true], ['Areas under cotton', true],
          ['The taste of food in each district', false], ['What people dreamt last night', false], ['Exact thoughts of farmers', false],
        ], ['A thematic map shows measurable facts about places.', 'Feelings and dreams cannot be mapped as data.'], 'Thematic maps show measurable features distributed over space.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Energy from the Sun
// =====================================================================================
const ch2: USpec = {
  id: 'ts8.ss.ch2', subject: 'social', title: 'Energy from the Sun', source: src(2),
  objectives: [
    {
      id: 'ts8.ss.sun.insolation', title: 'Sun’s rays on the Earth, heating of the atmosphere and heat balance', prereqs: [],
      intro: [
        h('Why is noon hotter than morning?'),
        photo('☀️', 'The Sun is the source of almost all energy on Earth — light, heat, winds and the food we eat.'),
        p('Stand outside at 8 a.m. and again at noon in May in Hyderabad. At noon the Sun is high and its rays fall almost straight down, so the same beam of energy falls on a small area and heats it strongly. In the morning the rays are slanting: the same energy spreads over a larger area and also passes through more air, so it heats less.'),
        def('Insolation', 'Incoming solar radiation — the energy from the Sun received at the Earth’s surface.'),
        def('Terrestrial radiation', 'Heat given back by the Earth’s surface as long-wave radiation; this is what mainly heats the air above.'),
        p('Of all the solar energy that reaches the top of the atmosphere, roughly 35 units out of 100 are reflected back to space by clouds, dust and snow; about 14 are absorbed by the atmosphere; and about 51 reach and heat the Earth’s surface (textbook rounded values). The warmed ground then heats the air from below.'),
        bars(['Reflected to space', 'Absorbed by atmosphere', 'Absorbed by surface'], [35, 14, 51], 'units of 100', 'Rounded textbook values: of 100 units of incoming solar energy, about 35 are reflected, 14 absorbed by air and 51 absorbed by the surface.'),
        def('Heat balance', 'Over a year, the Earth sends back to space as much energy as it receives, so its average temperature stays nearly steady.'),
        keys('Vertical rays heat more than slanting rays.', 'The air is heated mainly from below, by the warm ground.', 'About 35% reflected, 14% absorbed by air, 51% by surface (rounded).', 'Heat in = heat out over a year → heat balance.'),
        remember('The atmosphere is heated indirectly — the Sun heats the ground, the ground heats the air.'),
        tip('Torch test: shine a torch straight down and then at a slant. The slanting patch is bigger and dimmer — just like slanting sun rays.'),
      ],
      examples: [
        ex('Why is it usually hotter at 1–2 p.m. than at 12 noon, though the Sun is highest at noon?', ['At noon the ground receives the most insolation.', 'The ground keeps warming and keeps giving heat to the air for some time.', 'The air temperature peaks after the ground has passed on its heat, in the early afternoon.'], 'Because air is heated from the ground, with a time lag'),
        ex('If 100 units of solar energy arrive and 35 are reflected and 14 absorbed by the air, how many reach the surface?', ['100 − 35 − 14 = 51.'], '51 units'),
      ],
      practice: [
        tp('budget', (r) => {
          const refl = r.pick([30, 32, 34, 35]);
          const air = r.pick([14, 16, 18, 20]);
          return numQ(`Out of 100 units of incoming sunlight (illustrative), ${refl} units are reflected to space and ${air} units are absorbed by the atmosphere. How many units are absorbed by the Earth’s surface?`, 100 - refl - air, ['Everything not reflected or absorbed by air reaches the ground.', `Subtract ${refl} and ${air} from 100.`], [`100 − ${refl} − ${air} = ${100 - refl - air} units`], [{ when: String(100 - refl), explain: 'You forgot to subtract the part absorbed by the atmosphere.' }], 0.001);
        }, 2),
        mcq('mcq', 'Think about the angle of rays and how air gets heated.', [
          ['Vertical rays heat more than slanting rays because…', 'Their energy falls on a smaller area and passes through less air', ['They are faster', 'They come from a different Sun', 'They carry more water'], 'Same energy, smaller patch.', 'Concentrated energy over a small area raises temperature more.'],
          ['The atmosphere is mainly heated by…', 'Heat given off by the Earth’s surface', ['Direct sunlight passing through it', 'The Moon', 'Volcanoes'], 'The ground warms first.', 'Air absorbs little sunlight directly; it is heated by terrestrial radiation from below.'],
          ['Insolation means…', 'Incoming solar radiation', ['Insulating a house', 'Cold winds', 'Rainfall'], 'IN-coming SOL-ar…', 'Insolation is the solar energy received at the surface.'],
          ['Roughly what share of incoming sunlight is reflected back to space?', 'About 35%', ['About 90%', 'About 5%', 'None'], 'Clouds and snow act like mirrors.', 'About a third (around 35 units out of 100) is reflected.'],
          ['“Heat balance” of the Earth means…', 'The Earth loses as much heat as it gains over a year', ['The Earth only gains heat', 'Day and night are equal', 'All places have equal temperature'], 'Otherwise it would keep heating up.', 'Energy received equals energy returned over a year, keeping average temperature stable.'],
          ['Which surface reflects the most sunlight?', 'Fresh snow', ['Dark soil', 'A forest', 'A tarred road'], 'Light colours reflect.', 'White snow reflects most of the light falling on it.'],
        ]),
        tapT('tap', 'Tap every factor that makes a place receive MORE heat from the Sun.', [
          ['Sun’s rays falling vertically', true], ['Long hours of daylight', true], ['Clear, cloudless sky', true], ['Dark surface that absorbs light', true],
          ['Thick clouds', false], ['Slanting rays', false], ['Fresh snow cover', false],
        ], ['Think of angle, duration and what blocks or reflects light.', 'Clouds and snow reflect sunlight.'], 'More direct, longer, unblocked sunlight on a dark surface means more heating.'),
      ],
    },
    {
      id: 'ts8.ss.sun.landwater', title: 'Land–water contrast, recording temperature, maritime and continental climate', prereqs: ['ts8.ss.sun.insolation'],
      intro: [
        h('Why is Visakhapatnam milder than Nagpur?'),
        photo('🌅', 'Sea-side towns have a smaller difference between day and night temperatures than inland towns.'),
        p('Land heats up quickly and cools quickly. Water heats slowly and cools slowly, because sunlight passes deeper into water, water keeps moving and mixing, and water needs more heat to warm up. So places near the sea have mild temperatures, while places far inland face hot days and cold nights, hot summers and cold winters.'),
        def('Maritime (equable) climate', 'Climate of places near the sea, with a small range of temperature between day and night and between summer and winter.'),
        def('Continental (extreme) climate', 'Climate of places far from the sea, with a large range of temperature.'),
        def('Six’s maximum–minimum thermometer', 'A thermometer that records the highest and lowest temperatures reached in a day.'),
        f('Daily range = maximum − minimum;  Daily mean = (maximum + minimum) ÷ 2'),
        p('Weather stations record the maximum and minimum temperature every day. From these we calculate the daily range and the daily mean. Monthly and yearly averages are worked out from many daily means.'),
        keys('Land heats and cools fast; water slowly.', 'Coastal places: small range (maritime).', 'Interior places: large range (continental).', 'Range = max − min; mean = (max + min) ÷ 2.'),
        remember('Mumbai and Chennai have small temperature ranges; Delhi and Nagpur have large ones.'),
        tip('Feel a steel plate and a bucket of water left in the sun at noon — and again at night. The plate swings much more.'),
      ],
      examples: [
        ex('In Ramagundam one May day the maximum was 44 °C and the minimum 29 °C. Find the daily range and mean.', ['Range = 44 − 29 = 15 °C.', 'Mean = (44 + 29) ÷ 2 = 73 ÷ 2 = 36.5 °C.'], 'Range 15 °C; mean 36.5 °C'),
        ex('Why does a coastal city have cooler days and warmer nights than an inland city at the same latitude?', ['By day the land heats faster than the sea, so the cooler sea air (sea breeze) moderates the coast.', 'At night the sea keeps its heat longer, keeping the coast warmer.', 'So the range at the coast is small.'], 'The sea moderates temperature (maritime effect)'),
      ],
      practice: [
        tp('range', (r) => {
          const mx = r.pick([32, 35, 38, 41, 44, 46]);
          const mn = mx - r.pick([6, 9, 12, 14, 17]);
          const town = r.pick(['Adilabad', 'Ramagundam', 'Khammam', 'Nalgonda', 'Hyderabad', 'Mahabubnagar']);
          const askMean = r.next() < 0.5;
          if (askMean) return numQ(`${town} recorded a maximum of ${mx} °C and a minimum of ${mn} °C. What was the daily MEAN temperature (°C)?`, (mx + mn) / 2, ['Mean = (max + min) ÷ 2.', `Add ${mx} and ${mn}, then halve.`], [`(${mx} + ${mn}) ÷ 2 = ${mx + mn} ÷ 2 = ${(mx + mn) / 2} °C`], [{ when: String(mx - mn), explain: 'That is the RANGE (difference). The mean is the average.' }], 0.001, '°C');
          return numQ(`${town} recorded a maximum of ${mx} °C and a minimum of ${mn} °C. What was the daily RANGE of temperature (°C)?`, mx - mn, ['Range = max − min.', `Subtract ${mn} from ${mx}.`], [`${mx} − ${mn} = ${mx - mn} °C`], [{ when: String((mx + mn) / 2), explain: 'That is the mean. The range is the difference between max and min.' }], 0.001, '°C');
        }, 1),
        mcq('mcq', 'Land changes temperature fast; water slowly.', [
          ['Which heats up faster in sunlight?', 'Land', ['Sea water', 'Both equally', 'Neither'], 'Sand on a beach vs the sea.', 'Land absorbs heat in a thin top layer, so it heats quickly.'],
          ['A climate with a small temperature range is called…', 'Maritime (equable)', ['Continental (extreme)', 'Polar', 'Desert'], 'Mari = sea.', 'Places near the sea have an equable, maritime climate.'],
          ['Which city is likely to have the LARGEST yearly temperature range?', 'Delhi', ['Mumbai', 'Chennai', 'Kochi'], 'Which one is far from the sea?', 'Delhi is far inland and has a continental climate.'],
          ['The instrument that records the highest and lowest temperature of the day is…', 'Six’s maximum–minimum thermometer', ['Barometer', 'Rain gauge', 'Wind vane'], 'Named after James Six.', 'The Six’s thermometer marks both maximum and minimum.'],
          ['Why does water heat slowly?', 'Sunlight goes deeper and water keeps mixing, spreading the heat', ['Water is always cold', 'Water reflects all light', 'Fish absorb the heat'], 'Heat is shared through a thick layer.', 'Heat spreads through a deep, moving layer of water, so the surface warms slowly.'],
          ['Daily mean temperature is found by…', '(Maximum + minimum) ÷ 2', ['Maximum − minimum', 'Maximum × minimum', 'Only the noon reading'], 'An average of two numbers.', 'The daily mean is the average of max and min.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Maritime climate', 'Small range; near the sea'], ['Continental climate', 'Large range; far from sea'], ['Daily range', 'Maximum minus minimum'],
          ['Daily mean', 'Average of maximum and minimum'], ['Sea breeze', 'Cool wind from sea to land by day'], ['Land breeze', 'Wind from land to sea at night'],
        ], ['Range is a difference; mean is an average.', 'Breezes blow from cooler to warmer areas.']),
      ],
    },
    {
      id: 'ts8.ss.sun.height', title: 'Height and temperature, temperature inversion and temperature maps', prereqs: ['ts8.ss.sun.landwater'],
      intro: [
        h('Why are hill stations cool?'),
        photo('⛰️', 'Snow lies on high mountains even near the Equator, because air gets colder as we go higher.'),
        p('Ooty, Munnar and Shimla are cool in summer because they are high. The air near the ground is heated by the ground; higher up, the air is thinner and farther from that heat source. On average, temperature falls by about 6.5 °C for every 1,000 m of height. This is the normal lapse rate.'),
        f('Temperature at height ≈ ground temperature − 6.5 × (height in m ÷ 1000)'),
        xp({
          title: 'What if? Climbing a mountain', formula: 'T = T₀ − 6.5 × h ÷ 1000',
          res: ['T', 'Temperature at that height', '°C', 'T0 - 6.5 * h / 1000', 1],
          vars: [['T0', 'Temperature at sea level', '°C', 10, 45, 1, 32], ['h', 'Height above sea level', 'm', 0, 6000, 100, 2000]],
          notes: [['h', 'Going higher, the air is thinner and farther from the warm ground, so it is colder.', 'Coming down, you return to denser air heated by the ground, so it is warmer.'], ['T0', 'A hotter base means every height is warmer by the same amount.', 'A cooler base lowers the temperature at every height.']],
          mistakes: [['Adding 6.5 °C per 1,000 m', 'Temperature normally FALLS with height in the lower atmosphere.'], ['Using 6.5 °C per 100 m', 'The rate is per 1,000 m (1 km), not per 100 m.']],
          real: 'If it is 32 °C at the foot of a 2,000 m hill, it will be about 32 − 13 = 19 °C at the top.',
        }),
        def('Temperature inversion', 'A situation where a layer of cold air lies near the ground with warmer air above it — the reverse of normal. It happens on long, clear, calm winter nights and in valleys, where cold heavy air drains down slopes.'),
        def('Isotherm', 'A line on a map joining places with the same temperature. Temperature maps use isotherms or colour shades.'),
        keys('Normal lapse rate ≈ 6.5 °C per 1,000 m.', 'Inversion: cold air below, warm above — causes fog and traps smoke.', 'Isotherms join places of equal temperature.'),
        remember('Inversion is common on calm, clear winter nights; fog and smog in Delhi winters are linked to it.'),
        tip('Cold air is heavy and sinks into valleys — that is why fruit farmers plant orchards on slopes, not valley floors.'),
      ],
      examples: [
        ex('The temperature at the foot of a hill (sea level) is 30 °C. What is it at 3,000 m?', ['Fall = 6.5 × 3000 ÷ 1000 = 19.5 °C.', 'Temperature = 30 − 19.5 = 10.5 °C.'], 'About 10.5 °C'),
        ex('Why does smoke from a village hang low over the fields on a still December morning?', ['On a clear, calm winter night the ground loses heat fast and cools the air touching it.', 'Warmer air lies above — an inversion.', 'The cold layer cannot rise, so smoke and fog are trapped near the ground.'], 'A temperature inversion traps it'),
      ],
      practice: [
        tp('lapse', (r) => {
          const t0 = r.pick([25, 28, 30, 32, 35]);
          const hgt = r.pick([1000, 2000, 3000, 4000]);
          const drop = 6.5 * hgt / 1000;
          return numQ(`At sea level the temperature is ${t0} °C. Using a lapse rate of 6.5 °C per 1,000 m, what is the temperature at ${hgt} m (°C)?`, t0 - drop, ['Find how much it falls: 6.5 × (height ÷ 1000).', 'Subtract that from the sea-level temperature.'], [`Fall = 6.5 × ${hgt / 1000} = ${drop} °C`, `${t0} − ${drop} = ${t0 - drop} °C`], [{ when: String(t0 + drop), explain: 'Temperature falls with height — subtract, do not add.' }], 0.001, '°C');
        }, 2),
        mcq('mcq', 'Normally colder higher up; inversion is the reverse.', [
          ['On average, temperature falls by about how much for every 1,000 m of height?', '6.5 °C', ['1 °C', '20 °C', '65 °C'], 'It is called the normal lapse rate.', 'The average lapse rate is about 6.5 °C per km.'],
          ['In a temperature inversion…', 'Cold air lies below warmer air', ['Hot air lies near the ground', 'There is no air', 'It always rains'], 'Inversion = reversed.', 'Normally air cools upward; in inversion a cold layer sits below warmer air.'],
          ['Inversions are most common on…', 'Long, clear, calm winter nights', ['Cloudy windy summer afternoons', 'Rainy days at noon', 'Days of storms'], 'The ground cools fast when the sky is clear.', 'Clear skies and still air let the ground and nearby air cool strongly.'],
          ['A line joining places of equal temperature is an…', 'Isotherm', ['Isobar', 'Isohyet', 'Contour'], 'Therm = heat.', 'Isotherms join places of the same temperature.'],
          ['Why are hill stations cooler than plains?', 'Air is thinner and farther from the heated ground', ['They are nearer the Sun', 'They have no trees', 'They get more sunlight'], 'The ground heats the air.', 'Higher air is thinner and gets less heat from the ground.'],
          ['Fruit orchards in hilly areas are often planted on slopes because…', 'Cold air sinks into valley floors at night', ['Slopes are nearer the Sun', 'Valleys have no soil', 'Birds avoid slopes'], 'Cold air is heavy.', 'Cold air drains into valleys, causing frost there; slopes stay warmer.'],
        ]),
        matchT('match', 'map line to what it joins', [
          ['Isotherm', 'Equal temperature'], ['Isobar', 'Equal air pressure'], ['Isohyet', 'Equal rainfall'], ['Contour', 'Equal height'],
          ['Lapse rate', 'Fall of temperature with height'], ['Inversion', 'Warm air above cold air'],
        ], ['Therm = heat; baro = pressure; hyet = rain.', 'Contours are about height.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Earth Movements and Seasons
// =====================================================================================
const ch3: USpec = {
  id: 'ts8.ss.ch3', subject: 'social', title: 'Earth Movements and Seasons', source: src(3),
  objectives: [
    {
      id: 'ts8.ss.earth.rotation', title: 'The round Earth, its rotation and its tilted axis', prereqs: [],
      intro: [
        h('How do we know the Earth is round and spinning?'),
        photo('🌍', 'The Earth is a sphere, slightly flattened at the poles, spinning on an imaginary axis.'),
        p('Watch a ship sail away from a port: first its hull disappears below the horizon, then the mast. That happens only on a curved surface. Ships sailing around the world, the round shadow of the Earth on the Moon during a lunar eclipse, and photos from space all show the Earth is round.'),
        def('Rotation', 'The spinning of the Earth on its axis from west to east. One rotation takes about 24 hours (23 h 56 min) and causes day and night.'),
        def('Axis', 'An imaginary line through the North and South Poles about which the Earth spins. It is tilted about 23½° from the vertical, making an angle of 66½° with the plane of the Earth’s orbit.'),
        p('Because the Earth spins from west to east, the Sun appears to rise in the east and set in the west. The half facing the Sun has day; the other half has night. The line dividing them is the circle of illumination.'),
        keys('Evidence of a round Earth: ships’ hulls vanish first, eclipse shadow, voyages, space photos.', 'Rotation: west → east, about 24 h → day and night.', 'Axis tilt: 23½° from vertical, 66½° to the orbital plane.'),
        remember('Rotation causes day and night; revolution together with the tilt causes seasons.'),
        tip('Spin a globe anticlockwise when viewed from above the North Pole — that is the Earth’s direction (west to east).'),
      ],
      examples: [
        ex('If the Earth did not rotate, what would happen to day and night?', ['One side would face the Sun for a very long time and become extremely hot.', 'The other side would be in darkness and extremely cold.', 'Life as we know it would be very difficult.'], 'Very long days and nights, with extreme heat and cold'),
        ex('The Earth’s axis is tilted 23½° from the vertical. What angle does it make with the orbital plane?', ['A vertical line makes 90° with the plane.', '90 − 23½ = 66½°.'], '66½°'),
      ],
      practice: [
        mcq('mcq', 'Rotation = spin on axis; revolution = journey around the Sun.', [
          ['The Earth rotates from…', 'West to east', ['East to west', 'North to south', 'South to north'], 'The Sun seems to rise in the east.', 'Because the Earth spins west to east, the Sun appears to move east to west.'],
          ['Day and night are caused by…', 'Rotation of the Earth', ['Revolution of the Earth', 'Tilt alone', 'The Moon'], 'It happens every 24 hours.', 'Rotation brings each place into and out of sunlight daily.'],
          ['When a ship sails away, its hull disappears first because…', 'The Earth’s surface is curved', ['The sea is rough', 'Ships sink', 'The air is foggy'], 'A flat sea would show the whole ship shrinking.', 'The curve of the Earth hides the lower part first.'],
          ['The Earth’s axis is tilted from the vertical by about…', '23½°', ['66½°', '90°', '45°'], 'The same number as the Tropic of Cancer.', 'The axis is tilted about 23½° from the vertical.'],
          ['The line dividing day from night on the Earth is the…', 'Circle of illumination', ['Equator', 'Prime Meridian', 'Tropic of Cancer'], 'It separates the lit half from the dark half.', 'The circle of illumination divides day from night.'],
          ['One rotation of the Earth takes about…', '24 hours', ['365 days', '30 days', '12 hours'], 'One day.', 'The Earth completes one rotation in about 24 hours.'],
        ]),
        tapT('tap', 'Tap every piece of evidence that the Earth is round.', [
          ['A departing ship’s hull disappears before its mast', true], ['The Earth’s shadow on the Moon during a lunar eclipse is round', true], ['Photographs taken from space', true], ['Sailors have travelled all the way round it', true],
          ['The Sun is hot', false], ['Rivers flow downhill', false], ['Birds fly south in winter', false],
        ], ['Look for observations about shape.', 'Heat of the Sun says nothing about the Earth’s shape.'], 'Each true option directly reveals curvature.'),
        matchT('match', 'term to its meaning', [
          ['Rotation', 'Spinning on the axis'], ['Revolution', 'Moving around the Sun'], ['Axis', 'Imaginary line through the poles'],
          ['Circle of illumination', 'Divides day from night'], ['23½°', 'Tilt of the axis from vertical'], ['66½°', 'Angle of axis with the orbital plane'],
        ], ['Two angles add to 90°.', 'Rotation is the daily spin.']),
      ],
    },
    {
      id: 'ts8.ss.earth.seasons', title: 'Revolution of the Earth and changing seasons', prereqs: ['ts8.ss.earth.rotation'],
      intro: [
        h('Why is May hot and December cool in Telangana?'),
        photo('🌤️', 'Seasons change because the Earth’s tilted axis points the same way in space as it travels around the Sun.'),
        p('The Earth revolves around the Sun in about 365¼ days. Because its axis is tilted and always points the same way (towards the Pole Star), first the Northern Hemisphere leans towards the Sun, and six months later the Southern Hemisphere does. The hemisphere leaning towards the Sun gets more direct rays and longer days — summer.'),
        def('Revolution', 'The movement of the Earth in its orbit around the Sun, taking about 365¼ days.'),
        def('Leap year', 'Every fourth year, the four extra quarter-days are added as 29 February, making 366 days.'),
        stepsB(
          '21 March — equinox: the Sun is overhead at the Equator; day and night are nearly equal everywhere.',
          '21 June — summer solstice (north): the Sun is overhead at the Tropic of Cancer; longest day in the Northern Hemisphere.',
          '23 September — equinox: the Sun is again overhead at the Equator; day and night nearly equal.',
          '22 December — winter solstice (north): the Sun is overhead at the Tropic of Capricorn; shortest day in the Northern Hemisphere, summer in Australia.',
        ),
        keys('Revolution + tilt → seasons.', 'Solstices: 21 June and 22 December.', 'Equinoxes: 21 March and 23 September.', '¼ day × 4 years = 1 day → leap year.'),
        remember('When it is summer in India (June), it is winter in Australia and South Africa.'),
        tip('“June – Cancer; December – Capricorn”: the Sun is overhead at the tropic named for that month’s solstice.'),
      ],
      examples: [
        ex('On 21 June, which has the longer day — Hyderabad or Chennai — and why?', ['On 21 June the Northern Hemisphere leans towards the Sun.', 'Places farther north have longer days then.', 'Hyderabad (about 17°N) is north of Chennai (about 13°N).'], 'Hyderabad'),
        ex('Why do we have a leap year every four years?', ['A revolution takes about 365¼ days, but a calendar year has 365.', 'Every year ¼ day is left over.', '¼ × 4 = 1 day, added as 29 February.'], 'To add the four quarter-days as one extra day'),
      ],
      practice: [
        orderT('order', 'Arrange these positions of the Earth in order through the calendar year (January to December).', [
          'Equinox — Sun overhead at the Equator (21 March)', 'Summer solstice — Sun overhead at the Tropic of Cancer (21 June)',
          'Equinox — Sun overhead at the Equator (23 September)', 'Winter solstice — Sun overhead at the Tropic of Capricorn (22 December)',
        ], ['Start with March.', 'The two solstices are six months apart.'], 'March equinox → June solstice → September equinox → December solstice.'),
        mcq('mcq', 'Remember the four key dates and where the Sun is overhead.', [
          ['On 21 June the Sun is overhead at the…', 'Tropic of Cancer', ['Equator', 'Tropic of Capricorn', 'Arctic Circle'], 'Summer in the north.', 'At the June solstice the Sun is vertically above 23½°N.'],
          ['Day and night are nearly equal all over the world on…', '21 March and 23 September', ['21 June and 22 December', '1 January', '15 August'], 'These are the equinoxes.', 'At the equinoxes the Sun is overhead at the Equator.'],
          ['Seasons are caused by…', 'Revolution of the Earth with its tilted axis', ['Rotation alone', 'Distance from the Moon', 'Clouds'], 'Rotation gives day and night.', 'The tilt during revolution changes the angle of sunlight and the length of days.'],
          ['One revolution of the Earth takes about…', '365¼ days', ['24 hours', '30 days', '366½ days'], 'That leftover quarter matters.', 'A revolution takes about 365 days and 6 hours.'],
          ['On 22 December, the season in Australia is…', 'Summer', ['Winter', 'Monsoon', 'Spring'], 'Southern Hemisphere leans towards the Sun.', 'The Sun is overhead at the Tropic of Capricorn, so the south has summer.'],
          ['How many days does a leap year have?', '366', ['365', '364', '360'], 'An extra day in February.', 'A leap year adds 29 February.'],
        ]),
        tp('leap', (r) => {
          const yrs = r.pick([8, 12, 16, 20, 24, 40]);
          return numQ(`The Earth takes about 365¼ days for one revolution. Over ${yrs} years, how many extra days pile up from the quarter-days?`, yrs / 4, ['Each year leaves ¼ day.', `Multiply ${yrs} by ¼.`], [`${yrs} × ¼ = ${yrs / 4} days`, 'This is why every fourth year is a leap year.'], [{ when: String(yrs * 4), explain: 'Multiply by ¼ (divide by 4), not by 4.' }], 0.001);
        }, 1),
      ],
    },
    {
      id: 'ts8.ss.earth.belts', title: 'Temperature (heat) belts of the Earth', prereqs: ['ts8.ss.earth.seasons'],
      intro: [
        h('Three kinds of zones'),
        photo('🧭', 'The tropics and polar circles divide the Earth into heat zones.'),
        p('The Sun is overhead somewhere between the Tropic of Cancer and the Tropic of Capricorn at some time of the year. Beyond these tropics, the Sun is never overhead. Beyond the Arctic and Antarctic Circles, there are days when the Sun never sets and days when it never rises. These lines divide the Earth into heat zones.'),
        def('Torrid zone', 'The hot zone between the Tropic of Cancer (23½°N) and the Tropic of Capricorn (23½°S), where the noon Sun is overhead at least once a year.'),
        def('Temperate zones', 'Between 23½° and 66½° in each hemisphere; moderate temperatures, as the Sun is never overhead.'),
        def('Frigid zones', 'From 66½° to the poles (90°) in each hemisphere; very cold, with long polar days and nights.'),
        keys('Torrid: 23½°N–23½°S.', 'Temperate: 23½°–66½° N and S.', 'Frigid: 66½°–90° N and S.', 'Telangana (about 16°–19½°N) is in the torrid zone.'),
        remember('The Tropic of Cancer passes through India, so northern India is in the north temperate zone and the south in the torrid zone.'),
        tip('Torrid = scorching; frigid = frozen. The middle is “temperate” = moderate.'),
      ],
      examples: [
        ex('Hyderabad is at about 17½°N. Which heat zone is it in?', ['The torrid zone lies between 23½°N and 23½°S.', '17½°N is within that range.'], 'Torrid zone'),
        ex('London is at about 51½°N. Which zone?', ['It is north of 23½°N.', 'It is south of 66½°N.', 'So it is in the north temperate zone.'], 'North temperate zone'),
      ],
      practice: [
        tp('zone', (r) => {
          const pl = r.pick<[string, number, string]>([
            ['Hyderabad', 17.4, 'Torrid zone'], ['Chennai', 13, 'Torrid zone'], ['Singapore', 1.3, 'Torrid zone'], ['Delhi', 28.6, 'North temperate zone'],
            ['London', 51.5, 'North temperate zone'], ['Tokyo', 35.7, 'North temperate zone'], ['Tromsø (Norway)', 69.6, 'North frigid zone'], ['North Pole', 90, 'North frigid zone'],
          ]);
          return {
            type: 'mcq', prompt: `${pl[0]} is at about ${pl[1]}°N. In which heat zone does it lie?`,
            ...choose(r, pl[2], ['Torrid zone', 'North temperate zone', 'North frigid zone', 'South temperate zone'].filter((x) => x !== pl[2])),
            hints: ['Compare the latitude with 23½° and 66½°.', 'Below 23½° = torrid; 23½°–66½° = temperate; above 66½° = frigid.'],
            mistakes: [{ when: 'wrong', explain: 'Check which boundaries the latitude falls between.' }],
            solution: [`${pl[1]}°N → ${pl[2]}.`],
          };
        }, 1),
        mcq('mcq', 'Use the boundary latitudes 23½° and 66½°.', [
          ['The torrid zone lies between…', 'Tropic of Cancer and Tropic of Capricorn', ['Arctic Circle and North Pole', 'Equator and Arctic Circle', 'The two poles'], 'Where the Sun can be overhead.', 'The torrid zone is between 23½°N and 23½°S.'],
          ['The frigid zones begin at about…', '66½°', ['23½°', '45°', '10°'], 'The polar circles.', 'Beyond the Arctic and Antarctic Circles (66½°) are the frigid zones.'],
          ['In which zone is the noon Sun never overhead but temperatures moderate?', 'Temperate zone', ['Torrid zone', 'Frigid zone', 'Equatorial calm zone'], 'Between tropics and polar circles.', 'Temperate zones lie between 23½° and 66½°.'],
          ['Which zone receives the most heat?', 'Torrid zone', ['Temperate zone', 'Frigid zone', 'All equal'], 'Vertical rays.', 'The torrid zone gets the most direct sunlight.'],
          ['Telangana lies in the…', 'Torrid zone', ['North frigid zone', 'South temperate zone', 'North temperate zone'], 'It is south of 23½°N.', 'Telangana (about 16°–19½°N) is within the torrid zone.'],
        ]),
        matchT('match', 'line to its latitude', [
          ['Equator', '0°'], ['Tropic of Cancer', '23½°N'], ['Tropic of Capricorn', '23½°S'], ['Arctic Circle', '66½°N'], ['Antarctic Circle', '66½°S'], ['North Pole', '90°N'],
        ], ['Tropics at 23½°, polar circles at 66½°.', 'Cancer is north, Capricorn south.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — The Polar Regions
// =====================================================================================
const c4Events: EV[] = [
  [1800, 'European whalers and fur traders visit Arctic coasts regularly', '1800s'],
  [1900, 'Trading posts and missionaries spread; guns and metal tools come into use', 'early 1900s'],
  [1950, 'Many Inuit families settle in permanent government-built towns', '1950s–60s'],
  [1965, 'Snowmobiles begin to replace dog sledges', '1960s'],
  [1979, 'Greenland gets home rule', '1979'],
  [1999, 'Nunavut, an Inuit-majority territory, is created in Canada', '1999'],
];
const ch4: USpec = {
  id: 'ts8.ss.ch4', subject: 'social', title: 'The Polar Regions', source: src(4),
  objectives: [
    {
      id: 'ts8.ss.polar.tundra', title: 'Location of the polar regions; tundra seasons, plants and animals', prereqs: ['ts8.ss.earth.belts'],
      intro: [
        h('Lands of the midnight Sun'),
        photo('🧊', 'Polar regions lie beyond the Arctic and Antarctic Circles, where ice and snow last much of the year.'),
        p('The polar regions lie within the Arctic Circle (66½°N) and the Antarctic Circle (66½°S). The Arctic is a frozen ocean surrounded by the northern edges of North America, Europe and Asia. Antarctica is a continent covered with a thick ice sheet and has no native human population. The treeless lands around the Arctic Ocean are called the tundra.'),
        def('Tundra', 'Cold, treeless plain of the Arctic where the subsoil stays frozen and only mosses, lichens, grasses and dwarf shrubs grow.'),
        def('Permafrost', 'Ground that stays frozen all year; only the top layer thaws in summer.'),
        p('Winters are long and dark — near the poles the Sun may not rise for months (polar night). Summers are short and cool, but the Sun may not set for weeks (midnight Sun). In summer the top layer of soil thaws, water cannot drain into the frozen ground, and marshes, ponds and swarms of mosquitoes appear. Plants flower quickly in the few warm weeks.'),
        keys('Polar regions: beyond 66½° N and S.', 'Long dark winters, short bright summers.', 'Tundra plants: mosses, lichens, grasses, dwarf shrubs; no tall trees.', 'Animals: caribou/reindeer, musk ox, polar bear, arctic fox, seals, walrus.'),
        remember('Trees cannot grow in the tundra because of permafrost and a very short growing season.'),
        tip('Penguins live in the Antarctic; polar bears live in the Arctic — they never meet in the wild.'),
      ],
      examples: [
        ex('Why are there marshes in the tundra in summer even though rainfall is low?', ['Snow and the top soil thaw in summer.', 'The permafrost below does not let water soak in.', 'So water collects on the surface as marshes and ponds.'], 'Permafrost stops meltwater draining'),
        ex('Why can the Sun shine at midnight in northern Norway in June?', ['In June the North Pole is tilted towards the Sun.', 'Places north of the Arctic Circle stay in sunlight through the whole rotation.', 'So the Sun does not set.'], 'The tilt keeps the region in sunlight all day'),
      ],
      practice: [
        mcq('mcq', 'Think cold, treeless, frozen subsoil.', [
          ['The tundra is…', 'A cold, treeless plain of the Arctic', ['A hot desert', 'A tropical rainforest', 'A high plateau in India'], 'Few plants can survive.', 'Tundra lies around the Arctic Ocean and has no tall trees.'],
          ['Ground that remains frozen throughout the year is called…', 'Permafrost', ['Alluvium', 'Laterite', 'Humus'], 'Perma = permanent.', 'Permafrost is permanently frozen ground.'],
          ['Which plants grow in the tundra?', 'Mosses, lichens and dwarf shrubs', ['Teak and sal', 'Coconut palms', 'Bamboo forests'], 'Small, low plants.', 'Only small hardy plants can grow in the short summer.'],
          ['Which animal is NOT found in the Arctic tundra?', 'Tiger', ['Polar bear', 'Caribou', 'Arctic fox'], 'Which one lives in Indian forests?', 'Tigers live in warmer forests, including Kawal and Amrabad in Telangana.'],
          ['Antarctica differs from the Arctic because Antarctica is…', 'A continent covered with an ice sheet', ['An ocean', 'Hot and dry', 'Densely populated'], 'The Arctic is mainly an ocean.', 'Antarctica is land under ice; the Arctic is frozen ocean.'],
          ['The period when the Sun does not set for weeks is called the…', 'Midnight Sun', ['Polar night', 'Equinox', 'Monsoon'], 'It happens in summer.', 'In polar summer the Sun stays above the horizon at midnight.'],
        ]),
        matchT('match', 'polar term to its meaning', [
          ['Permafrost', 'Permanently frozen ground'], ['Midnight Sun', 'Sun visible at midnight in summer'], ['Polar night', 'Sun does not rise for weeks in winter'],
          ['Lichen', 'Tiny plant-like growth on rocks'], ['Caribou', 'Wild reindeer of North America'], ['Musk ox', 'Shaggy-haired grazing animal of the tundra'],
        ], ['Two terms are about the Sun.', 'Caribou and reindeer are the same species.']),
        tapT('tap', 'Tap every feature of the tundra.', [
          ['Long, cold winters', true], ['Short summers with marshes', true], ['Permafrost', true], ['Mosses and lichens', true],
          ['Tall evergreen trees', false], ['Heavy monsoon rain', false], ['Coconut farms', false],
        ], ['Think of cold and frozen ground.', 'Monsoons belong to tropical lands.'], 'The tundra is cold, treeless and frozen below the surface.'),
      ],
    },
    {
      id: 'ts8.ss.polar.inuit', title: 'Life of the Inuit: food, shelter, clothing and beliefs', prereqs: ['ts8.ss.polar.tundra'],
      intro: [
        h('Living well in the cold'),
        photo('🐟', 'Fish and sea animals were the main food of the Inuit, as almost nothing could be farmed.'),
        p('The Inuit are the native people of the Arctic coasts of Alaska, Canada and Greenland. Older books, including many textbooks, call them “Eskimos”, but they call themselves Inuit (“the people”), and that is the respectful name today. For thousands of years they lived by hunting and fishing, using great skill and knowledge of ice, animals and weather.'),
        def('Igloo', 'A dome-shaped shelter built of snow blocks, used mainly as a temporary home on winter hunting trips. Snow traps air and keeps the inside warmer than outside.'),
        def('Kayak and umiak', 'A kayak is a small one-person boat covered with skin; an umiak is a larger open skin boat for families and goods.'),
        p('Food came from seals, walrus, whales, fish, caribou and birds; meat and fat gave the energy needed in the cold, and raw meat provided vitamins where no vegetables grew. Clothing was made of caribou and seal skins — a hooded parka, trousers and boots (kamik) — often in two layers to trap warm air. In summer families lived in tents of skin (tupiq) and in winter in houses of stone, turf and whale bone, or snow igloos while travelling. Dog sledges carried them over ice.'),
        p('The Inuit believed that animals and natural forces have spirits that must be respected; hunters shared meat with the community and thanked the animal. Shamans (angakkuq) were believed to talk with spirits and heal the sick.'),
        keys('Food: seals, fish, whale, caribou — mainly meat and fat.', 'Shelter: igloo (winter trips), skin tent (summer), stone and turf houses.', 'Clothing: layered skins — parka and boots.', 'Transport: kayak, umiak, dog sledge.'),
        remember('“Inuit” is the people’s own name; “Eskimo” is an outsiders’ word many consider disrespectful.'),
        tip('Every part of an animal was used: meat for food, fat for lamps, skins for clothes and boats, bones for tools.'),
      ],
      examples: [
        ex('How does an igloo, made of snow, keep people warm?', ['Snow contains a lot of trapped air, which is a poor conductor of heat.', 'The dome shape and low entrance keep warm air inside.', 'Body heat and an oil lamp warm the inside.'], 'Trapped air in snow insulates the inside'),
        ex('Why did the Inuit eat mostly meat and fat?', ['Almost no crops grow in the Arctic.', 'Animals of sea and land were available.', 'Fat gives a lot of energy to survive the cold.'], 'Farming was impossible and fat gives energy'),
      ],
      practice: [
        mcq('mcq', 'Think of what the Arctic offers: ice, snow and animals.', [
          ['A small, one-person skin boat used by Inuit hunters is a…', 'Kayak', ['Umiak', 'Sledge', 'Igloo'], 'Today it is also a sport.', 'The kayak is a light one-person hunting boat.'],
          ['An igloo was mainly used as…', 'A temporary shelter on winter hunting trips', ['A summer house', 'A boat', 'A temple'], 'Built quickly from snow blocks.', 'Igloos were built as temporary winter shelters while travelling or hunting.'],
          ['Inuit clothes were made mainly from…', 'Caribou and seal skins', ['Cotton', 'Silk', 'Jute'], 'No plants for fibre.', 'Animal skins provided warm, waterproof clothing.'],
          ['The respectful name of the native people of the Arctic is…', 'Inuit', ['Eskimo', 'Bedouin', 'Maasai'], 'It means “the people”.', 'They call themselves Inuit.'],
          ['What did the Inuit burn in their lamps?', 'Seal and whale oil (fat)', ['Coal', 'Kerosene', 'Wood'], 'There are no trees in the tundra.', 'Animal fat was used as fuel for lamps.'],
          ['In Inuit belief, animals…', 'Have spirits that must be respected', ['Are to be wasted', 'Must never be eaten', 'Have no importance'], 'Hunters thanked the animal.', 'Inuit respected animal spirits and shared the catch.'],
        ]),
        matchT('match', 'Inuit word or object to its use', [
          ['Igloo', 'Snow shelter for winter trips'], ['Tupiq', 'Skin tent for summer'], ['Kayak', 'One-person skin boat'], ['Umiak', 'Large family skin boat'],
          ['Parka', 'Hooded skin jacket'], ['Sledge', 'Pulled by dogs over ice'],
        ], ['Two are boats, two are shelters.', 'The parka is clothing.']),
        tapT('tap', 'Tap every item that was a traditional source of FOOD for the Inuit.', [
          ['Seals', true], ['Fish', true], ['Caribou', true], ['Whales', true], ['Rice', false], ['Mangoes', false], ['Wheat bread', false],
        ], ['Nothing that needs farming.', 'Think of the sea and the tundra.'], 'Inuit food came from hunting and fishing, not farming.'),
      ],
    },
    {
      id: 'ts8.ss.polar.contact', title: 'Contact of the Inuit with the outside world', prereqs: ['ts8.ss.polar.inuit'],
      intro: [
        h('Old ways meet a new world'),
        photo('⛵', 'Whaling ships and traders brought the Arctic into contact with Europe and North America.'),
        p('From the 1800s European and American whalers and fur traders came to the Arctic. The Inuit traded furs for guns, metal knives, cloth, tea and sugar. Missionaries built churches and schools. Contact brought useful goods but also diseases such as measles and tuberculosis, against which the Inuit had no immunity, and many died.'),
        stepsB(
          '1800s: whalers and fur traders visit Arctic coasts.',
          'Early 1900s: trading posts, missionaries and schools spread; guns replace harpoons for many hunts.',
          '1950s–60s: governments move many families into permanent towns with houses, clinics and schools.',
          '1960s onwards: snowmobiles and motor boats replace many dog sledges and kayaks.',
          '1979: Greenland gets home rule (wider self-government from 2009).',
          '1999: Canada creates Nunavut, a territory with an Inuit majority and its own government.',
        ),
        p('Today many Inuit live in towns, use phones and the internet and work in jobs, while still hunting and keeping their language (Inuktitut) and art alive. Climate change is melting sea ice and making traditional hunting harder and more dangerous.'),
        keys('Trade brought guns, metal tools and new foods.', 'Diseases and loss of independence were heavy costs.', 'Settled towns, schools and snowmobiles changed daily life.', 'Inuit have won self-government: Greenland (1979) and Nunavut (1999).'),
        remember('Nunavut (“our land”) was created in Canada on 1 April 1999.'),
        tip('In an exam answer, show both sides of contact — benefits (tools, health care, schools) and losses (disease, culture, dependence).'),
      ],
      examples: [
        ex('Give one benefit and one harm of contact with outsiders for the Inuit.', ['Benefit: metal tools, guns and later medicines and schools made some tasks easier.', 'Harm: new diseases killed many people, and dependence on traders grew.'], 'Benefit: tools/medicine; harm: disease and dependence'),
        ex('How is climate change affecting Inuit life today?', ['Sea ice forms later and melts earlier.', 'Hunting on thin ice becomes dangerous and animals move.', 'Coastal villages face erosion.'], 'Melting ice threatens hunting, travel and homes'),
      ],
      practice: [
        timelineT('tl', 'Put these changes in Inuit life in time order.', c4Events, ['Whalers came first.', 'Self-government came at the end of the 20th century.']),
        mcq('mcq', 'Contact brought both new goods and new problems.', [
          ['Which was a harmful result of contact with outsiders?', 'New diseases like measles and tuberculosis', ['Metal knives', 'Schools', 'Clinics'], 'The Inuit had no immunity.', 'Diseases brought by outsiders caused many deaths.'],
          ['What largely replaced the dog sledge from the 1960s?', 'The snowmobile', ['The kayak', 'The igloo', 'The bicycle'], 'A motor vehicle for snow.', 'Snowmobiles became common for travel over snow.'],
          ['Nunavut is…', 'An Inuit-majority territory in Canada, created in 1999', ['A type of boat', 'A tundra plant', 'A Greenland city founded in 1800'], 'It means “our land”.', 'Nunavut was carved out of the Northwest Territories in 1999.'],
          ['What did fur traders give the Inuit in exchange for furs?', 'Guns, metal tools, cloth, tea and sugar', ['Land in Europe', 'Cars', 'Coal'], 'Trade goods.', 'Traders exchanged manufactured goods for furs.'],
          ['Why is climate change a special threat to the Inuit?', 'Melting sea ice makes hunting and travel dangerous', ['It turns the tundra into a desert', 'It brings monsoons', 'It increases polar bears'], 'Hunters travel on ice.', 'Thin, unstable ice disrupts hunting and travel.'],
        ]),
        tapT('tap', 'Tap every change that came to Inuit life AFTER contact with the outside world.', [
          ['Guns for hunting', true], ['Permanent towns with schools', true], ['Snowmobiles', true], ['Mobile phones', true],
          ['Hunting seals with harpoons', false], ['Building snow igloos on trips', false], ['Using kayaks for hunting', false],
        ], ['Traditional = before contact.', 'Harpoons and kayaks are traditional.'], 'Guns, towns, snowmobiles and phones came from outside contact.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Forests: Uses and Protection
// =====================================================================================
const c5Events: EV[] = [
  [1865, 'First Indian Forest Act gives the colonial government control over forests', '1865'],
  [1878, 'Indian Forest Act divides forests into reserved, protected and village forests', '1878'],
  [1927, 'Indian Forest Act, 1927 (still the basic forest law)', '1927'],
  [1940, 'Komaram Bheem dies fighting at Jodeghat for “Jal, Jangal, Zameen”', '1940'],
  [1980, 'Forest (Conservation) Act controls use of forest land for other purposes', '1980'],
  [2006, 'Forest Rights Act recognises rights of forest dwellers', '2006'],
  [2015, 'Telanganaku Haritha Haram tree-planting programme launched', '2015'],
];
const ch5: USpec = {
  id: 'ts8.ss.ch5', subject: 'social', title: 'Forests: Uses and Protection', source: src(5),
  objectives: [
    {
      id: 'ts8.ss.forest.types', title: 'Types of forests in India and where they grow', prereqs: [],
      intro: [
        h('Why are the Western Ghats green all year but Telangana’s forests bare in summer?'),
        photo('🌳', 'The kind of forest in a place depends mainly on how much rain it gets and how warm it is.'),
        def('Tropical evergreen forests', 'Dense, tall forests in areas with more than about 200 cm of rain (Western Ghats, North-East, Andaman). Trees do not shed all leaves at one time: rosewood, ebony, mahogany.'),
        def('Tropical deciduous (monsoon) forests', 'The most widespread forests of India, in areas with about 70–200 cm of rain. Trees shed leaves in the dry season: teak, sal, bamboo, sandalwood. Most of Telangana’s forests are of this type.'),
        def('Thorn forests and scrub', 'In dry areas with less than about 70 cm of rain (Rajasthan, dry parts of the Deccan): babul, khair, cactus.'),
        def('Mountain and mangrove forests', 'Mountain forests change with height (oak, pine, deodar). Mangroves grow in salty coastal swamps and deltas, like the Sundarbans and the Godavari–Krishna delta.'),
        p('India’s forest cover is about one-fifth (roughly 21–22%) of its land, according to recent Forest Survey of India reports. The National Forest Policy (1988) set a goal of one-third (33%) of land under forest or tree cover.'),
        f('Forest % = (forest area ÷ total area) × 100'),
        keys('Rain decides the forest type.', 'Evergreen > 200 cm; deciduous 70–200 cm; thorn < 70 cm.', 'Telangana: mainly dry and moist deciduous forests — teak, bamboo, tendu, mahua.', 'Goal: 33% of land under forest/tree cover.'),
        remember('Deciduous trees shed leaves in the dry season to save water.'),
        tip('Link: Western Ghats → evergreen; Telangana → deciduous; Rajasthan → thorn; Sundarbans → mangrove.'),
      ],
      examples: [
        ex('A district has 1,800 km² of forest out of a total area of 6,000 km². What percentage is forest?', ['Forest % = 1800 ÷ 6000 × 100.', '= 0.3 × 100 = 30%.'], '30%'),
        ex('Why do the teak forests of Adilabad look bare in April?', ['Teak forests are tropical deciduous.', 'In the dry summer, trees shed leaves to reduce water loss.', 'New leaves come with the monsoon rains.'], 'They are deciduous and shed leaves in the dry season'),
      ],
      practice: [
        tp('pct', (r) => {
          const tot = r.pick([4000, 5000, 6000, 8000, 10000]);
          const pc = r.pick([10, 15, 20, 25, 30, 35, 40]);
          const fa = (tot * pc) / 100;
          return numQ(`An area of ${tot.toLocaleString('en-IN')} km² has ${fa.toLocaleString('en-IN')} km² of forest (illustrative). What percentage of the area is forest?`, pc, ['Forest % = forest area ÷ total area × 100.', `Divide ${fa} by ${tot} and multiply by 100.`], [`${fa} ÷ ${tot} = ${pc / 100}`, `${pc / 100} × 100 = ${pc}%`], [], 0.005, '%');
        }, 2),
        mcq('mcq', 'Match the forest type with the amount of rain.', [
          ['The most widespread forests of India are…', 'Tropical deciduous (monsoon) forests', ['Tropical evergreen forests', 'Mangrove forests', 'Alpine forests'], 'They include teak and sal.', 'Deciduous forests cover the largest area in India.'],
          ['Teak and bamboo forests of Telangana are of which type?', 'Tropical deciduous', ['Tropical evergreen', 'Mangrove', 'Thorn'], 'They shed leaves in summer.', 'Telangana’s forests are mostly dry and moist deciduous.'],
          ['Forests that grow in salty coastal swamps are…', 'Mangrove forests', ['Thorn forests', 'Pine forests', 'Deciduous forests'], 'Sundarbans.', 'Mangroves can tolerate salt water.'],
          ['Tropical evergreen forests need rainfall of about…', 'More than 200 cm', ['Less than 50 cm', '70–100 cm', 'No rain'], 'Very wet areas.', 'Evergreen forests grow where rain is very heavy.'],
          ['The National Forest Policy of 1988 aims for forest/tree cover on…', 'One-third (33%) of the land', ['One-tenth', 'Half', 'All'], 'A third.', 'The target is 33% of geographical area.'],
          ['Babul, khair and cactus are typical of…', 'Thorn forests', ['Evergreen forests', 'Mangroves', 'Mountain forests'], 'Dry areas.', 'Thorn forests grow where rain is less than about 70 cm.'],
        ]),
        matchT('match', 'forest type to where it is found', [
          ['Tropical evergreen', 'Western Ghats, North-East'], ['Tropical deciduous', 'Telangana, central India'], ['Thorn forest', 'Rajasthan'],
          ['Mangrove', 'Sundarbans, river deltas'], ['Mountain forest', 'Himalayan slopes'], ['Alpine pasture', 'Above the tree line in the Himalayas'],
        ], ['Rain decreases from evergreen to thorn.', 'Mangroves need salty water.']),
      ],
    },
    {
      id: 'ts8.ss.forest.telangana', title: 'Status of forests in Telangana and greenery initiatives', prereqs: ['ts8.ss.forest.types'],
      intro: [
        h('Telangana’s green belt'),
        photo('🌿', 'Telangana’s forests cover roughly a quarter of the state, mostly along the Godavari valley and in the Nallamala hills.'),
        p('Telangana has a geographical area of about 1.12 lakh km². Its recorded forest area is roughly a quarter of this (about 24%, rounded). Forests are concentrated in the north and east — Adilabad, Komaram Bheem Asifabad, Nirmal, Mancherial, Jayashankar Bhupalpally, Mulugu and Bhadradri Kothagudem — and in the Nallamala hills of Nagarkurnool in the south.'),
        def('Protected areas', 'Tiger reserves, wildlife sanctuaries and national parks where forests and animals are specially protected — e.g. Kawal Tiger Reserve, Amrabad Tiger Reserve, Eturnagaram and Pakhal wildlife sanctuaries.'),
        def('Minor forest produce (NTFP)', 'Products other than timber: tendu (beedi) leaves, mahua flowers, honey, gum, tamarind, bamboo, medicinal plants — an important income for forest dwellers.'),
        p('Forests give timber, fuel, fodder and produce; they hold soil, recharge groundwater, reduce floods, store carbon and shelter wildlife. But they shrink due to clearing for farms, mining, dams, roads, illegal felling and fires.'),
        p('To increase green cover, the state launched Telanganaku Haritha Haram in 2015, planting crores of saplings in forests, along roads, in villages and in towns, with nurseries in villages. Success depends on saplings surviving, not just being planted.'),
        keys('Telangana: about 24% recorded forest area (rounded).', 'Forest-rich districts: Adilabad region, Mulugu, Bhadradri Kothagudem, Nagarkurnool.', 'Tiger reserves: Kawal and Amrabad.', 'Haritha Haram (2015): mass tree planting.'),
        remember('Planting is easy; protecting saplings until they grow is the real test.'),
        tip('Name at least one forest district, one tiger reserve and one forest product of Telangana in answers.'),
      ],
      examples: [
        ex('Telangana’s area is about 1,12,000 km² and its forest area about 27,000 km² (rounded). What is the forest percentage?', ['27,000 ÷ 1,12,000 ≈ 0.24.', '× 100 ≈ 24%.'], 'About 24%'),
        ex('A village plants 2,000 saplings and 1,500 survive after three years. What is the survival rate?', ['Survival rate = survived ÷ planted × 100.', '1500 ÷ 2000 × 100 = 75%.'], '75%'),
      ],
      practice: [
        tp('survive', (r) => {
          const planted = r.pick([400, 500, 800, 1000, 2000]);
          const pc = r.pick([50, 60, 70, 75, 80, 90]);
          const s = (planted * pc) / 100;
          const v = r.pick(['A school', 'A gram panchayat', 'A colony welfare association', 'An NSS unit']);
          return numQ(`${v} planted ${planted} saplings under a greenery drive. After two years ${s} were alive. What is the survival rate in %?`, pc, ['Survival rate = alive ÷ planted × 100.', `Divide ${s} by ${planted}, then × 100.`], [`${s} ÷ ${planted} × 100 = ${pc}%`], [{ when: String(100 - pc), explain: 'That is the percentage that died. The question asks for those that survived.' }], 0.005, '%');
        }, 2),
        mcq('mcq', 'Recall Telangana forest geography and programmes.', [
          ['Telangana’s greenery programme launched in 2015 is…', 'Telanganaku Haritha Haram', ['Mission Kakatiya', 'Rythu Bandhu', 'Mission Bhagiratha'], 'Haram = garland.', 'Haritha Haram means a green garland for Telangana.'],
          ['Which is a tiger reserve in Telangana?', 'Amrabad', ['Sundarbans', 'Corbett', 'Gir'], 'In the Nallamala hills.', 'Amrabad (Nallamala) and Kawal (Nirmal–Mancherial) are tiger reserves.'],
          ['Roughly what share of Telangana is recorded forest area?', 'About a quarter (about 24%)', ['About 2%', 'About 60%', 'About 90%'], 'Between one-fifth and one-third.', 'Recorded forest area is about 24% of the state (rounded).'],
          ['Tendu leaves are collected mainly to make…', 'Beedis', ['Paper', 'Cloth', 'Cooking oil'], 'A minor forest produce.', 'Tendu leaves are used for rolling beedis.'],
          ['Which district is among the most forested in Telangana?', 'Mulugu', ['Hyderabad', 'Medchal–Malkajgiri', 'Rangareddy'], 'Home of Eturnagaram sanctuary.', 'Mulugu and Bhadradri Kothagudem have large forest areas.'],
          ['Which is NOT a cause of forest loss?', 'Protecting saplings with tree guards', ['Clearing for farms', 'Mining', 'Forest fires'], 'One option helps forests.', 'Tree guards protect young trees; the rest reduce forests.'],
        ]),
        tapT('tap', 'Tap every benefit that forests provide.', [
          ['Hold soil and prevent erosion', true], ['Recharge groundwater', true], ['Give tendu leaves, honey and mahua', true], ['Shelter tigers and other wildlife', true],
          ['Increase floods', false], ['Make the soil salty', false], ['Raise air pollution', false],
        ], ['Think of soil, water, products, wildlife.', 'Forests reduce floods and pollution.'], 'Forests protect soil and water, provide produce and shelter wildlife.'),
      ],
    },
    {
      id: 'ts8.ss.forest.rights', title: 'Tribal people, forests and the Forest Rights Act, 2006', prereqs: ['ts8.ss.forest.telangana'],
      intro: [
        h('Who owns the forest?'),
        photo('🏹', 'For centuries, tribal communities have lived in and depended on forests for food, homes and culture.'),
        p('Gonds, Koyas, Kolams, Chenchus, Thotis and other Adivasi communities of Telangana have lived in forests for generations. They collect produce, graze cattle, practise farming (sometimes podu, a form of shifting cultivation) and worship at sacred groves. Their festivals, such as the Sammakka Saralamma Jatara at Medaram, are connected to the forest.'),
        p('Under British rule, Forest Acts (1865, 1878, 1927) made most forests government property. Tribal people suddenly became “encroachers” on their own land; they could be fined or evicted for collecting wood or farming. The Nizam’s government followed similar policies. In 1940 the Gond leader Komaram Bheem was killed at Jodeghat fighting for “Jal, Jangal, Zameen” (water, forest, land).'),
        def('Forest Rights Act, 2006', 'The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006. It recognises the rights of forest dwellers to the land they have been cultivating and to use and manage forest resources.'),
        keys('Individual rights: land under cultivation (up to 4 hectares) can be recognised in the dweller’s name.', 'Community rights: collecting minor forest produce, grazing, fishing, and protecting community forests.', 'The Gram Sabha starts the process of verifying claims.', 'The land cannot be sold or transferred to outsiders.'),
        stepsB('Forest dweller or community files a claim with the Gram Sabha.', 'The Forest Rights Committee verifies the claim on the ground.', 'The sub-divisional committee examines it.', 'The district-level committee gives the final approval and a title.'),
        remember('The FRA aims to correct a “historical injustice” done to forest dwellers while also giving them a role in protecting forests.'),
        tip('Remember the slogan linked with Komaram Bheem: “Jal, Jangal, Zameen”.'),
      ],
      examples: [
        ex('Why did colonial Forest Acts cause hardship to tribal people?', ['The Acts made forests government property.', 'Collecting wood, grazing and podu became illegal without permission.', 'Tribals lost access to their food, livelihood and land.'], 'They took away customary rights over forests'),
        ex('A Koya family has farmed 2 hectares of forest land for decades. How can the FRA help them?', ['They file a claim with the Gram Sabha.', 'After verification, the district committee can grant a title for the 2 hectares.', 'They cannot sell the land, but it is secure from eviction.'], 'They can get a recognised title to the land they cultivate'),
      ],
      practice: [
        timelineT('tl', 'Arrange these forest laws and events in time order.', c5Events, ['British Forest Acts came first.', 'The FRA came in the 21st century.']),
        mcq('mcq', 'The FRA recognises rights; colonial Acts took them away.', [
          ['The Forest Rights Act was passed in…', '2006', ['1878', '1927', '1980'], 'In the 21st century.', 'The Act was passed in December 2006.'],
          ['Under the FRA, who starts the process of verifying claims?', 'The Gram Sabha', ['The Supreme Court', 'A private company', 'The Reserve Bank'], 'The village assembly.', 'Claims are first taken up by the Gram Sabha.'],
          ['The slogan linked with Komaram Bheem is…', 'Jal, Jangal, Zameen', ['Do or Die', 'Jai Jawan Jai Kisan', 'Swaraj is my birthright'], 'Water, forest, land.', 'He fought for tribal rights to water, forest and land.'],
          ['Podu is…', 'A form of shifting cultivation in forest areas', ['A forest tax', 'A type of boat', 'A tiger reserve'], 'A farming practice.', 'Podu means clearing a patch, farming it and moving on.'],
          ['Which colonial law (still the basic one today) governs Indian forests?', 'Indian Forest Act, 1927', ['Forest Rights Act, 2006', 'RTI Act, 2005', 'Factories Act, 1948'], 'Before Independence.', 'The 1927 Act remains the main forest law.'],
          ['Which is a COMMUNITY right under the FRA?', 'Collecting minor forest produce', ['Selling forest land to outsiders', 'Felling all teak trees for sale', 'Building factories'], 'Something shared by the village.', 'Community rights include collecting and selling minor forest produce.'],
        ]),
        matchT('match', 'tribe, person or term to its description', [
          ['Gonds', 'Large tribe of the Adilabad region'], ['Koyas', 'Tribe of the Godavari valley; Medaram jatara'], ['Chenchus', 'Forest tribe of the Nallamala hills'],
          ['Komaram Bheem', 'Gond leader killed at Jodeghat, 1940'], ['Gram Sabha', 'Village assembly that verifies claims'], ['Podu', 'Shifting cultivation'],
        ], ['Chenchus live in the Nallamala.', 'Medaram jatara is linked to the Koyas.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Minerals and Mining
// =====================================================================================
const ch6: USpec = {
  id: 'ts8.ss.ch6', subject: 'social', title: 'Minerals and Mining', source: src(6),
  objectives: [
    {
      id: 'ts8.ss.min.resources', title: 'Renewable and non-renewable resources; important minerals', prereqs: [],
      intro: [
        h('What is inside your pencil, phone and bicycle?'),
        photo('🪨', 'Rocks contain minerals — iron for bicycles, bauxite for aluminium vessels, limestone for cement.'),
        def('Renewable resource', 'A resource that is replaced naturally in a short time — sunlight, wind, water, forests (if used carefully).'),
        def('Non-renewable resource', 'A resource that takes millions of years to form and gets used up — coal, petroleum, natural gas, metallic minerals.'),
        def('Mineral', 'A naturally occurring substance with a definite chemical composition, found in rocks. An ore is a rock from which a mineral can be extracted profitably.'),
        p('Metallic minerals give metals: iron ore (steel), bauxite (aluminium), copper, manganese. Non-metallic minerals include limestone (cement), mica (electrical insulation), gypsum and granite. Fuel minerals — coal, petroleum and natural gas — give energy. Since minerals are non-renewable, we must use them carefully, recycle metals and shift to renewable energy.'),
        keys('Renewable: sun, wind, water, forests.', 'Non-renewable: coal, oil, gas, metals.', 'Metallic, non-metallic and fuel minerals.', 'Recycle metals to save minerals.'),
        remember('Iron ore → steel; bauxite → aluminium; limestone → cement; coal → electricity.'),
        tip('Ask: “Can nature replace it within a human lifetime?” Yes → renewable.'),
      ],
      examples: [
        ex('Classify: coal, sunlight, bauxite, wind.', ['Sunlight and wind are replaced continuously → renewable.', 'Coal and bauxite take millions of years to form → non-renewable.'], 'Renewable: sunlight, wind; non-renewable: coal, bauxite'),
        ex('Why is recycling aluminium cans useful?', ['Aluminium comes from bauxite, a non-renewable ore.', 'Recycling reuses the metal, so less bauxite is mined.', 'It also saves a lot of electricity.'], 'It conserves bauxite and energy'),
      ],
      practice: [
        tapT('tap', 'Tap every NON-renewable resource.', [
          ['Coal', true], ['Petroleum', true], ['Iron ore', true], ['Natural gas', true], ['Bauxite', true],
          ['Sunlight', false], ['Wind', false], ['Flowing river water', false],
        ], ['Which took millions of years to form?', 'Sun and wind keep coming back.'], 'Fossil fuels and ores cannot be replaced in a human lifetime.'),
        matchT('match', 'mineral to its main use', [
          ['Iron ore', 'Steel'], ['Bauxite', 'Aluminium'], ['Limestone', 'Cement'], ['Coal', 'Thermal electricity'], ['Mica', 'Electrical insulation'], ['Granite', 'Building stone and slabs'],
        ], ['Cement factories need limestone.', 'Aluminium vessels come from bauxite.']),
        mcq('mcq', 'Renewable = replaced quickly by nature.', [
          ['Which is a renewable resource?', 'Solar energy', ['Coal', 'Petroleum', 'Copper ore'], 'It comes every day.', 'Sunlight is replenished daily.'],
          ['An ore is…', 'A rock from which a mineral can be extracted profitably', ['Any rock', 'A type of soil', 'A fuel made in factories'], 'Profitably is the key word.', 'Ores contain enough mineral to be worth mining.'],
          ['Aluminium is obtained from…', 'Bauxite', ['Mica', 'Limestone', 'Coal'], 'A reddish ore.', 'Bauxite is the main ore of aluminium.'],
          ['Coal, petroleum and natural gas are called…', 'Fossil fuels', ['Renewable fuels', 'Metallic minerals', 'Ores of iron'], 'Formed from ancient plants and animals.', 'They formed from buried remains over millions of years.'],
          ['Why should we conserve minerals?', 'They are non-renewable and will run out', ['They grow back quickly', 'They are useless', 'They are found everywhere in plenty'], 'Millions of years to form.', 'Minerals once used up cannot be replaced in our lifetime.'],
        ]),
      ],
    },
    {
      id: 'ts8.ss.min.telangana', title: 'Mineral resources of Telangana and who owns minerals', prereqs: ['ts8.ss.min.resources'],
      intro: [
        h('A mineral-rich state'),
        photo('⛰️', 'The Godavari valley holds the coal that powers many of South India’s thermal power stations.'),
        p('Telangana has rich deposits. Coal is found along the Godavari valley in Bhadradri Kothagudem, Mancherial, Peddapalli and Jayashankar Bhupalpally. Limestone, used by many cement factories, is found in Nalgonda, Suryapet, Adilabad and Mancherial districts. Iron ore occurs around Bayyaram (Mahabubabad). Fine granite is quarried in Karimnagar and Khammam and sent far and wide. Other minerals include dolomite, quartz and feldspar.'),
        def('Ownership of minerals', 'Minerals under the ground do not belong to whoever owns the land surface. They are owned by the government on behalf of the people. Companies (public or private) get a lease to mine and must pay royalty to the government.'),
        def('Royalty', 'A payment made by a mining company to the government for each tonne of mineral extracted.'),
        p('Because minerals belong to all citizens, including future generations, the government must make sure mining benefits local people, protects the environment, and restores the land after mining. Royalties help fund roads, schools and welfare, including in the mining areas.'),
        keys('Coal: Godavari valley districts.', 'Limestone → cement: Nalgonda, Suryapet, Mancherial.', 'Granite: Karimnagar, Khammam.', 'Minerals belong to the government (the people); companies take leases and pay royalty.'),
        remember('Owning a field does not make you the owner of the coal beneath it.'),
        tip('Map tip: draw the Godavari and mark the coal belt along it.'),
      ],
      examples: [
        ex('A company mines 50,000 tonnes of limestone; royalty is ₹80 per tonne (illustrative). How much royalty does it pay?', ['Royalty = tonnes × rate.', '50,000 × 80 = ₹40,00,000.'], '₹40 lakh'),
        ex('Why are many cement factories located in Nalgonda and Suryapet districts?', ['Cement needs large amounts of limestone.', 'These districts have limestone deposits.', 'Locating near the raw material cuts transport costs.'], 'They are near limestone deposits'),
      ],
      practice: [
        tp('royalty', (r) => {
          const t = r.pick([10000, 20000, 25000, 40000, 50000]);
          const rate = r.pick([50, 60, 80, 100, 120]);
          const min = r.pick(['limestone', 'granite', 'coal', 'dolomite']);
          return numQ(`A company extracts ${t.toLocaleString('en-IN')} tonnes of ${min}. The royalty rate is ₹${rate} per tonne (illustrative). How much royalty (in ₹) must it pay to the government?`, t * rate, ['Royalty = quantity × rate per tonne.', `Multiply ${t} by ${rate}.`], [`${t} × ${rate} = ₹${(t * rate).toLocaleString('en-IN')}`], [], 0.001);
        }, 2),
        mcq('mcq', 'Link each mineral to its Telangana district.', [
          ['Coal in Telangana is found mainly in the…', 'Godavari valley', ['Krishna delta', 'Nallamala hills only', 'Hyderabad city'], 'Kothagudem and Ramagundam areas.', 'The coal belt runs along the Godavari.'],
          ['Many cement factories are in Nalgonda/Suryapet because of…', 'Limestone deposits', ['Gold mines', 'Oil wells', 'Sea ports'], 'Main raw material of cement.', 'Cement is made from limestone.'],
          ['Who owns the minerals under the ground in India?', 'The government, on behalf of the people', ['Whoever owns the land surface', 'The mining company forever', 'Nobody'], 'Companies only take leases.', 'Mineral rights rest with the government; companies get leases.'],
          ['Royalty is…', 'A payment by a mining company to the government per tonne mined', ['A salary to miners', 'A tax on farmers', 'A type of ore'], 'Paid for using public minerals.', 'Royalty compensates the public for minerals extracted.'],
          ['Karimnagar and Khammam are known for…', 'Granite', ['Petroleum', 'Bauxite', 'Diamonds'], 'Shiny building slabs.', 'High-quality granite is quarried there.'],
          ['Iron ore deposits occur near…', 'Bayyaram (Mahabubabad)', ['Hyderabad', 'Medak town', 'Gadwal'], 'In the east of the state.', 'Bayyaram has known iron ore deposits.'],
        ]),
        matchT('match', 'mineral or term to its Telangana link', [
          ['Coal', 'Kothagudem, Ramagundam'], ['Limestone', 'Nalgonda, Suryapet'], ['Granite', 'Karimnagar'], ['Iron ore', 'Bayyaram'], ['Royalty', 'Paid to the government'], ['Lease', 'Permission to mine for a period'],
        ], ['Coal belt follows the Godavari.', 'Cement towns have limestone.']),
      ],
    },
    {
      id: 'ts8.ss.min.singareni', title: 'Singareni Collieries: mining process, safety, welfare and new trends', prereqs: ['ts8.ss.min.telangana'],
      intro: [
        h('Black diamonds of Telangana'),
        photo('🔦', 'Underground miners wear helmets with lamps; safety rules protect them from gas, dust and roof falls.'),
        p('Coal was found near Yellandu in 1871 by the Geological Survey of India. Mining began in the 1880s, and the Singareni Collieries Company Limited (SCCL) was formed in 1920. Today SCCL is a government company jointly owned by the Government of Telangana (51%) and the Government of India (49%). It runs underground and opencast mines in the Godavari valley and supplies coal to power stations, cement and other industries.'),
        def('Underground mine', 'Coal is reached through shafts or inclined tunnels and cut deep below the surface.'),
        def('Opencast mine', 'The soil and rock above the coal (overburden) is removed by huge machines and the coal is dug from an open pit.'),
        stepsB('Exploration: geologists drill to find coal and estimate the reserve.', 'Permissions and land acquisition, with compensation and rehabilitation for affected people.', 'Removing overburden (opencast) or sinking shafts (underground).', 'Extracting coal by blasting, cutting machines and loaders.', 'Transporting coal by conveyor, trucks and railway wagons.', 'Reclaiming land: filling pits, spreading soil and planting trees.'),
        p('Safety: ventilation fans remove dangerous gases like methane; gas detectors, roof supports, helmets, cap lamps, boots, rescue stations and training reduce accidents. Welfare: SCCL provides housing, hospitals, schools and pensions to workers.'),
        p('New trends: more mechanisation and opencast mining (fewer workers, more output), use of computers and remote sensing, solar power plants on mine land, and stricter environmental rules. Opencast mines cause dust, displacement of villages and loss of farmland, so rehabilitation and reclamation are important.'),
        keys('Coal found at Yellandu, 1871; SCCL formed 1920.', 'SCCL: Telangana 51%, Government of India 49%.', 'Underground vs opencast mining.', 'Safety: ventilation, gas detection, roof support, protective gear.'),
        remember('Opencast mining produces more coal per worker but disturbs more land.'),
        tip('In a “mining process” answer, always end with land reclamation.'),
      ],
      examples: [
        ex('Give two advantages and two problems of opencast mining compared with underground mining.', ['Advantages: no risk of roof falls or trapped gas; more output with machines.', 'Problems: large land area dug up and villages displaced; dust and water pollution.'], 'More output and safety, but more land damage and displacement'),
        ex('Why must underground mines have strong ventilation?', ['Coal seams release methane, which can explode.', 'Dust and heat also build up.', 'Fans bring fresh air and remove gases.'], 'To remove explosive gas and dust and supply fresh air'),
      ],
      practice: [
        orderT('order', 'Put the stages of a coal mining project in order.', ['Exploration and drilling to find coal', 'Permissions, land acquisition and rehabilitation', 'Removing overburden or sinking shafts', 'Extracting the coal', 'Transporting coal to users', 'Reclaiming and replanting the land'], ['You must find the coal before acquiring land.', 'Reclamation comes after mining.'], 'Find → permit → open up → extract → transport → reclaim.'),
        mcq('mcq', 'SCCL facts and mining safety.', [
          ['Coal was first discovered near Yellandu in…', '1871', ['1947', '1920', '2014'], 'In the 19th century.', 'The Geological Survey of India found coal at Yellandu in 1871.'],
          ['Singareni Collieries Company Limited is jointly owned by…', 'Government of Telangana (51%) and Government of India (49%)', ['A foreign company', 'Only private shareholders', 'The World Bank'], 'A public sector company.', 'SCCL is a state–central government company.'],
          ['In opencast mining, the material above the coal is called…', 'Overburden', ['Ore', 'Royalty', 'Seam gas'], 'It is a “burden” to remove.', 'Overburden is the soil and rock removed to expose coal.'],
          ['Why are gas detectors used in underground mines?', 'To detect explosive methane', ['To find gold', 'To measure rainfall', 'To count workers'], 'Coal seams release gas.', 'Methane can build up and explode.'],
          ['A new trend in SCCL is…', 'Building solar power plants on mine land', ['Banning all machines', 'Returning to hand tools only', 'Stopping all coal supply'], 'Renewable energy.', 'SCCL has set up solar plants on its land.'],
          ['Which is a welfare measure for mine workers?', 'Company hospitals and housing', ['Longer working hours', 'Removing helmets', 'Closing schools'], 'Welfare means well-being.', 'SCCL provides housing, hospitals and schools.'],
        ]),
        tapT('tap', 'Tap every SAFETY measure used in coal mines.', [
          ['Ventilation fans', true], ['Methane gas detectors', true], ['Roof supports', true], ['Helmets with cap lamps', true], ['Rescue stations and training', true],
          ['Smoking inside the mine', false], ['Working without boots', false], ['Ignoring gas alarms', false],
        ], ['Safety reduces risk of gas, falls and fire.', 'Any flame underground is dangerous.'], 'Ventilation, detection, support and protective gear keep miners safe.'),
      ],
    },
  ],
};


// =====================================================================================
// Chapter 7 — Money and Banking
// =====================================================================================
const c7Events: EV[] = [
  [-600, 'Punch-marked silver coins circulate in ancient India', 'about 6th century BCE'],
  [1770, 'Early paper notes issued by private banks such as Bank of Hindostan', 'about 1770'],
  [1861, 'Paper Currency Act: the Government of India issues notes', '1861'],
  [1935, 'Reserve Bank of India set up', '1 April 1935'],
  [1969, 'Fourteen major commercial banks nationalised', '1969'],
  [2016, 'UPI launched for instant mobile payments', '2016'],
];
const ch7: USpec = {
  id: 'ts8.ss.ch7', subject: 'social', title: 'Money and Banking', source: src(7),
  objectives: [
    {
      id: 'ts8.ss.money.barter', title: 'From barter to coins and paper money', prereqs: [],
      intro: [
        h('Why can’t we simply swap things?'),
        photo('🪙', 'Coins, notes and now digital money all do the same job: they are accepted by everyone in exchange for goods and services.'),
        p('Imagine a potter in a village who wants rice. Under barter he must find a farmer who has rice AND wants pots — at the same time. This is called the double coincidence of wants, and it is hard to find. Barter also has no common measure of value (how many pots for a goat?) and many goods cannot be divided or stored.'),
        def('Barter', 'Direct exchange of goods for goods without using money.'),
        def('Money', 'Anything generally accepted as a medium of exchange; it also measures value, stores value and allows payments later (deferred payments).'),
        stepsB('Barter: goods exchanged directly.', 'Commodity money: grain, cattle, salt or cowrie shells used for exchange.', 'Metal coins: punch-marked silver coins in India from about the 6th century BCE; later gold and copper coins of kings.', 'Paper money: notes promising payment; in British India the government issued notes from 1861; today the RBI issues notes (₹1 notes are issued by the Government of India).', 'Bank and digital money: cheques, cards, mobile payments.'),
        keys('Barter needs a double coincidence of wants.', 'Functions of money: medium of exchange, measure of value, store of value, standard of deferred payment.', 'India’s currency notes are issued by the Reserve Bank of India.', 'Paper money is valuable because the government guarantees it, not because of the paper.'),
        remember('The Reserve Bank of India, set up on 1 April 1935, is India’s central bank and issues currency notes.'),
        tip('Read any note: “I promise to pay the bearer…” signed by the RBI Governor — that promise is what gives it value.'),
      ],
      examples: [
        ex('A weaver wants vegetables, but the vegetable seller wants shoes, not cloth. What problem of barter is this?', ['The weaver wants what the seller has, but the seller does not want what the weaver has.', 'Both wants do not match at the same time.'], 'Lack of double coincidence of wants'),
        ex('How does money solve this problem?', ['The weaver sells cloth to anyone for money.', 'He uses the money to buy vegetables.', 'The seller uses the money to buy shoes.'], 'Money acts as a medium of exchange accepted by all'),
      ],
      practice: [
        timelineT('tl', 'Put these stages in the history of money in India in time order.', c7Events, ['Coins came long before paper.', 'Digital payments are the newest.']),
        mcq('mcq', 'Barter = goods for goods; money = what everyone accepts.', [
          ['The main difficulty of barter is…', 'Finding a double coincidence of wants', ['Too many coins', 'Bank charges', 'Inflation'], 'Both people must want each other’s goods.', 'In barter, wants must match on both sides at once.'],
          ['Who issues currency notes in India (except ₹1)?', 'The Reserve Bank of India', ['State Bank of India', 'Each state government', 'The Election Commission'], 'India’s central bank.', 'The RBI issues notes; ₹1 notes and coins come from the Government of India.'],
          ['Which is NOT a function of money?', 'Growing crops', ['Medium of exchange', 'Measure of value', 'Store of value'], 'Money is a tool for exchange.', 'Money helps exchange, measure and store value — it does not produce crops.'],
          ['Cowrie shells and cattle used as money are examples of…', 'Commodity money', ['Paper money', 'Digital money', 'Credit cards'], 'Goods used as money.', 'Useful goods accepted in exchange are called commodity money.'],
          ['The Reserve Bank of India was set up in…', '1935', ['1947', '1861', '1969'], 'Before Independence.', 'The RBI began operations on 1 April 1935.'],
          ['Why is a ₹500 note valuable though its paper is cheap?', 'It is guaranteed by the government/RBI and accepted by all', ['It is made of gold', 'It is very old', 'Banks print as many as they like'], 'Read the promise on the note.', 'Its value rests on legal guarantee and trust.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Barter', 'Exchanging goods for goods'], ['Commodity money', 'Goods like grain or shells used as money'], ['Medium of exchange', 'Accepted in payment by everyone'],
          ['Store of value', 'Money can be saved for later'], ['RBI', 'Issues currency notes'], ['Punch-marked coins', 'Early silver coins of ancient India'],
        ], ['Two terms are functions of money.', 'RBI is an institution.']),
      ],
    },
    {
      id: 'ts8.ss.money.banks', title: 'Commercial banks and types of deposit accounts', prereqs: ['ts8.ss.money.barter'],
      intro: [
        h('What does a bank do with your money?'),
        photo('🏢', 'Banks collect deposits from many people and lend to those who need money, earning interest in between.'),
        p('A commercial bank accepts deposits from the public and gives loans. It keeps only a part of deposits as cash for withdrawals and lends out most of the rest to farmers, shopkeepers, businesses and home buyers. The bank pays interest to depositors and charges a higher interest on loans; the difference is its main income.'),
        def('Savings account', 'For individuals to save; money can be withdrawn when needed; earns modest interest.'),
        def('Current account', 'For businesses that make many transactions daily; usually no interest; allows overdraft.'),
        def('Fixed (term) deposit', 'A lump sum kept for a fixed period (e.g. 1–5 years); earns higher interest; early withdrawal has a penalty.'),
        def('Recurring deposit', 'A fixed amount deposited every month for a period; earns interest like a fixed deposit.'),
        f('Simple interest = Principal × Rate × Time ÷ 100'),
        xp({
          title: 'What if? Growing a fixed deposit', formula: 'SI = P × R × T ÷ 100',
          res: ['SI', 'Simple interest earned', '₹', 'P * R * T / 100', 0],
          vars: [['P', 'Amount deposited', '₹', 1000, 100000, 1000, 10000], ['R', 'Interest rate per year', '%', 1, 10, 0.5, 6], ['T', 'Time', 'years', 1, 10, 1, 3]],
          notes: [['R', 'A higher rate earns more interest each year.', 'A lower rate earns less.'], ['T', 'Each extra year adds the same amount of simple interest.', 'Fewer years means less interest.']],
          mistakes: [['Forgetting to divide by 100', 'The rate is a percentage — 6% means 6 per 100.'], ['Using months as years', 'Convert months to years: 6 months = 0.5 year.']],
          real: '₹10,000 for 3 years at 6% earns ₹1,800 simple interest.',
        }),
        keys('Banks accept deposits and give loans.', 'Savings (individuals), current (businesses), fixed and recurring deposits.', 'Interest on loans > interest on deposits → bank’s income.'),
        remember('Your deposit is not lying idle in a locker — most of it is lent out to others.'),
        tip('“Fixed” deposits fix both time and rate; “recurring” deposits recur monthly.'),
      ],
      examples: [
        ex('Lakshmi keeps ₹20,000 in a fixed deposit at 7% per year for 2 years. Find the simple interest.', ['SI = P × R × T ÷ 100.', '= 20,000 × 7 × 2 ÷ 100 = ₹2,800.'], '₹2,800'),
        ex('A bank pays 5% on deposits and charges 10% on loans. It lends ₹1,00,000 of deposits for one year. What does it earn?', ['Interest from borrower = 10% of 1,00,000 = ₹10,000.', 'Interest to depositor = 5% of 1,00,000 = ₹5,000.', 'Difference = ₹5,000.'], '₹5,000'),
      ],
      practice: [
        tp('si', (r) => {
          const P = r.pick([5000, 10000, 20000, 25000, 50000]);
          const R = r.pick([4, 5, 6, 7, 8]);
          const T = r.pick([1, 2, 3, 4, 5]);
          const si = (P * R * T) / 100;
          const who = r.pick(['Ravi', 'Meena', 'Imran', 'Kavya', 'Joseph', 'Sita']);
          return numQ(`${who} puts ₹${P.toLocaleString('en-IN')} in a fixed deposit at ${R}% simple interest per year for ${T} year${T > 1 ? 's' : ''}. How much interest (₹) will it earn?`, si, ['SI = P × R × T ÷ 100.', `${P} × ${R} × ${T} ÷ 100`], [`SI = ${P} × ${R} × ${T} ÷ 100 = ₹${si.toLocaleString('en-IN')}`], [{ when: String(P * R * T), explain: 'Divide by 100 — the rate is a percentage.' }, { when: String(P + si), explain: 'That is the total amount. The question asks only for the interest.' }], 0.001);
        }, 2),
        mcq('mcq', 'Match each account to who uses it and why.', [
          ['A shopkeeper who deposits and withdraws many times a day needs a…', 'Current account', ['Fixed deposit', 'Recurring deposit', 'Locker'], 'For frequent business transactions.', 'Current accounts allow unlimited transactions.'],
          ['A student saving ₹500 every month for 2 years should open a…', 'Recurring deposit', ['Current account', 'Overdraft', 'Demand draft'], 'A fixed amount every month.', 'Recurring deposits take regular monthly instalments.'],
          ['Which deposit usually gives the highest interest?', 'Fixed deposit', ['Current account', 'Savings account', 'Cash at home'], 'Money is locked in for a period.', 'Banks pay more because they can lend it for longer.'],
          ['The main income of a bank comes from…', 'The difference between interest on loans and on deposits', ['Selling cheque books', 'Printing money', 'Government gifts'], 'It borrows at a lower rate and lends at a higher rate.', 'The interest gap is the bank’s main earning.'],
          ['Banks keep only a part of deposits as cash because…', 'Not all depositors withdraw at the same time', ['They lose the rest', 'The law forbids cash', 'They give the rest away'], 'Withdrawals are spread out.', 'Only a fraction is needed for daily withdrawals; the rest is lent.'],
        ]),
        matchT('match', 'account type to its feature', [
          ['Savings account', 'For individuals; modest interest'], ['Current account', 'For businesses; many transactions'], ['Fixed deposit', 'Lump sum for a fixed period'],
          ['Recurring deposit', 'Fixed amount every month'], ['Loan', 'Money lent by the bank with interest'], ['Interest', 'Payment for the use of money'],
        ], ['Fixed vs recurring: one lump sum vs monthly.', 'Current accounts suit traders.']),
      ],
    },
    {
      id: 'ts8.ss.money.payments', title: 'Cheques, demand drafts, loans and digital payments', prereqs: ['ts8.ss.money.banks'],
      intro: [
        h('Paying without cash'),
        photo('🔒', 'Digital payments are fast, but your PIN and OTP must stay secret.'),
        def('Cheque', 'A written order by an account holder (drawer) to the bank (drawee) to pay a stated amount to a person (payee). A cheque is valid for 3 months from its date.'),
        def('Demand draft (DD)', 'A prepaid instrument issued by a bank; it cannot bounce because the money is paid in advance — used for fees and applications.'),
        def('Loan and collateral', 'A loan is money lent by a bank to be repaid with interest. Collateral is an asset (land, gold, house) pledged as security.'),
        p('Banks give crop loans to farmers, education loans, housing loans and loans to self-help groups. Borrowing from banks is usually cheaper and fairer than borrowing from moneylenders who charge very high interest.'),
        p('Today internet banking, debit cards, RuPay cards and the Unified Payments Interface (UPI, launched in 2016) let people pay from a mobile phone in seconds — at a kirana shop, a bus stand or a vegetable cart. Digital payments are fast and leave a record, but they need care: never share your PIN, OTP or password; check the name before paying; and report fraud immediately to the bank and the cybercrime helpline 1930.'),
        keys('Cheque: drawer → drawee bank → payee; valid 3 months.', 'DD: prepaid, cannot bounce.', 'Collateral secures a loan.', 'UPI (2016) enables instant mobile payments.'),
        remember('Banks never ask for your OTP or PIN on the phone. Anyone who does is a fraudster.'),
        tip('A crossed cheque (two parallel lines at the top-left corner) can only be deposited into an account, which makes it safer.'),
      ],
      examples: [
        ex('Teja writes a cheque from his SBI account to pay ₹5,000 to Diya. Name the drawer, drawee and payee.', ['Drawer: the person who writes the cheque — Teja.', 'Drawee: the bank that pays — SBI.', 'Payee: the person who receives — Diya.'], 'Drawer Teja; drawee SBI; payee Diya'),
        ex('Why does a college ask for fees by demand draft rather than cheque?', ['A cheque can bounce if the account lacks money.', 'A DD is paid for in advance at the bank.', 'So the college is sure to receive the money.'], 'A DD cannot bounce'),
      ],
      practice: [
        mcq('mcq', 'Know the parts of a cheque and the rules of safe payment.', [
          ['The person who writes and signs a cheque is the…', 'Drawer', ['Drawee', 'Payee', 'Cashier'], 'They draw the money from their account.', 'The drawer is the account holder who issues the cheque.'],
          ['A cheque is normally valid for…', '3 months', ['3 days', '1 year', 'For ever'], 'Not too short, not too long.', 'Cheques are valid for three months from the date written.'],
          ['Which payment instrument cannot bounce?', 'Demand draft', ['Cheque', 'Promissory note', 'Post-dated cheque'], 'It is prepaid.', 'A DD is paid for in advance.'],
          ['An asset pledged to a bank as security for a loan is called…', 'Collateral', ['Interest', 'Deposit', 'Dividend'], 'Land or gold can serve as this.', 'Collateral protects the bank if the loan is not repaid.'],
          ['If someone calls claiming to be from your bank and asks for your OTP, you should…', 'Refuse and report it', ['Share it quickly', 'Share only half of it', 'Post it online'], 'Banks never ask for OTP.', 'Sharing an OTP lets fraudsters take your money.'],
          ['UPI, used to pay by mobile, was launched in…', '2016', ['1935', '1991', '2001'], 'A recent innovation.', 'UPI was launched in 2016.'],
        ]),
        tapT('tap', 'Tap every SAFE practice for digital payments.', [
          ['Keep your UPI PIN secret', true], ['Check the receiver’s name before paying', true], ['Report fraud quickly to the bank and helpline 1930', true], ['Use only official banking apps', true],
          ['Share your OTP with a caller who says he is from the bank', false], ['Write your PIN on the back of the card', false], ['Click unknown links promising prizes', false],
        ], ['Secrets stay secret.', 'Prizes from unknown links are traps.'], 'Protect PIN/OTP, verify, use official apps and report fraud.'),
        matchT('match', 'banking term to its meaning', [
          ['Drawer', 'Person who writes the cheque'], ['Drawee', 'Bank that pays the cheque'], ['Payee', 'Person who receives the money'],
          ['Demand draft', 'Prepaid bank instrument'], ['Collateral', 'Security for a loan'], ['UPI', 'Instant mobile payment system'],
        ], ['Drawer writes, payee receives.', 'Drawee is always a bank.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Impact of Technology on Livelihoods
// =====================================================================================
const c8Events: EV[] = [
  [1851, 'First electric telegraph line in India (Calcutta–Diamond Harbour)', '1851'],
  [1854, 'First cotton textile mill in Bombay', '1854'],
  [1882, 'Telephone exchanges open in Indian cities', '1882'],
  [1995, 'First mobile phone call in India', '1995'],
  [1998, 'HITEC City opens in Hyderabad', '1998'],
  [2013, 'Telegram service closed in India', '2013'],
];
const ch8: USpec = {
  id: 'ts8.ss.ch8', subject: 'social', title: 'Impact of Technology on Livelihoods', source: src(8),
  objectives: [
    {
      id: 'ts8.ss.tech.agri', title: 'Technological change in agriculture and its effect on workers', prereqs: [],
      intro: [
        h('One machine, many jobs'),
        photo('🚜', 'A combine harvester reaps, threshes and cleans grain in a single pass.'),
        p('Until a generation ago, harvesting paddy in a Telangana village meant weeks of work: men and women cut the crop with sickles, bundled it, threshed it on the threshing floor and winnowed it in the wind. Today a combine harvester can do all this in a few hours per acre.'),
        def('Combine harvester', 'A machine that reaps (cuts), threshes (separates grain) and winnows (cleans) the crop at once.'),
        def('Mechanisation', 'Replacing human and animal labour with machines such as tractors, harvesters, pumpsets and seed drills.'),
        p('Benefits: faster work, timely harvest before rain, less crop loss, less drudgery. Costs: fewer days of work for agricultural labourers, especially landless families and women; small farmers must hire machines; straw may be left in the field and burnt, polluting the air. Many labourers migrate to towns for work in construction or services.'),
        keys('Machines save time and reduce crop loss.', 'They reduce days of wage work for labourers.', 'Small farmers hire rather than own machines.', 'Migration to towns increases.'),
        remember('Technology changes who gets work, not only how fast work gets done.'),
        tip('Always give both sides — gainers and losers — when discussing technology.'),
      ],
      examples: [
        ex('Harvesting 10 acres by hand needs 20 labourers for 5 days. How many labour-days of work is that?', ['Labour-days = workers × days.', '20 × 5 = 100 labour-days.'], '100 labour-days'),
        ex('If a combine harvester does the same work with 2 workers in 1 day, how many labour-days are lost?', ['Machine labour-days = 2 × 1 = 2.', 'Lost = 100 − 2 = 98 labour-days.'], '98 labour-days lost (illustrative)'),
      ],
      practice: [
        tp('days', (r) => {
          const w = r.pick([10, 12, 15, 20, 25]);
          const d = r.pick([3, 4, 5, 6]);
          const wage = r.pick([300, 350, 400, 450]);
          return numQ(`Harvesting a farmer’s paddy by hand needs ${w} labourers for ${d} days at ₹${wage} a day (illustrative). If a combine harvester is used instead, how much wage income (₹) do the labourers lose in total?`, w * d * wage, ['Total wages = workers × days × daily wage.', `${w} × ${d} × ${wage}`], [`Labour-days = ${w} × ${d} = ${w * d}`, `Wages = ${w * d} × ₹${wage} = ₹${(w * d * wage).toLocaleString('en-IN')}`], [{ when: String(w * d), explain: 'That is labour-days. Multiply by the daily wage to get money.' }], 0.001);
        }, 2),
        mcq('mcq', 'Think of who gains and who loses from farm machines.', [
          ['A combine harvester…', 'Reaps, threshes and winnows in one operation', ['Only ploughs the field', 'Only sprays pesticide', 'Pumps water'], 'Combine = combines tasks.', 'It combines several harvest tasks.'],
          ['Who is MOST affected when harvesters replace manual harvesting?', 'Landless agricultural labourers', ['Big landowners', 'Harvester manufacturers', 'Bank managers'], 'Who earned wages from harvesting?', 'Labourers lose days of paid work.'],
          ['One benefit of mechanisation is…', 'Timely harvest with less crop loss', ['More jobs for every labourer', 'No need for fuel', 'Free machines for all'], 'Speed matters before rain.', 'Fast harvest reduces losses from weather.'],
          ['Burning crop straw left by harvesters causes…', 'Air pollution', ['More rainfall', 'Better soil always', 'Cheaper machines'], 'Smoke.', 'Stubble burning pollutes the air.'],
          ['Many farm labourers who lose work move to…', 'Towns for construction and service jobs', ['The polar regions', 'Forests to hunt', 'Nowhere; they stop working'], 'Migration.', 'Loss of farm work leads to migration in search of jobs.'],
        ]),
        tapT('tap', 'Tap every EFFECT of mechanisation in agriculture.', [
          ['Fewer days of wage work for labourers', true], ['Faster harvesting', true], ['Migration of workers to towns', true], ['Small farmers hire machines on rent', true],
          ['More need for bullocks', false], ['Harvest takes longer', false], ['More hand-sickles sold', false],
        ], ['Machines replace animals and hand tools.', 'Speed goes up.'], 'Machines speed up work but reduce wage work.'),
      ],
    },
    {
      id: 'ts8.ss.tech.industry', title: 'Technology and industry: textile mills, powerlooms and handlooms', prereqs: ['ts8.ss.tech.agri'],
      intro: [
        h('From the handloom to the powerloom'),
        photo('🎨', 'Pochampally, Gadwal and Narayanpet saris are famous handloom products of Telangana.'),
        p('For centuries Indian weavers made fine cloth on handlooms. In the 19th century cheap machine-made cloth from British mills flooded Indian markets and many weavers lost their livelihoods. The first cotton textile mill in India was set up in Bombay in 1854; mills later spread to Ahmedabad and other cities, including Hyderabad and Warangal (Azam Jahi Mills, 1934).'),
        def('Handloom', 'A loom worked by hand and feet; slow, skilled, used for traditional designs like Pochampally ikat.'),
        def('Powerloom', 'A loom run by electricity; many times faster than a handloom; common in small workshops, such as in Sircilla.'),
        p('After the 1980s many big mills closed because powerlooms in small units could produce cloth more cheaply. Powerloom towns like Sircilla grew, but workers face long hours, low wages and debt; in difficult times there have been many distress cases among weavers. Handloom weavers face competition from both; government support — cooperatives, GI tags (Pochampally Ikat received one), design help and marketing — helps them survive.'),
        keys('1854: first cotton mill in Bombay.', 'Powerlooms are cheaper and faster than handlooms.', 'Sircilla: powerloom centre; Pochampally, Gadwal, Narayanpet: handloom saris.', 'Support: cooperatives, GI tags, marketing.'),
        remember('Pochampally Ikat has a Geographical Indication (GI) tag, which protects its name and traditional design.'),
        tip('A handloom sari can take days; a powerloom can make many metres in an hour. That speed difference explains the price difference.'),
      ],
      examples: [
        ex('A handloom weaver makes 2 metres of cloth a day; a powerloom makes 40 metres a day. How many times faster is the powerloom?', ['40 ÷ 2 = 20.'], '20 times (illustrative)'),
        ex('Why did many handloom weavers lose work in the 19th century?', ['British mills produced cloth cheaply with machines.', 'This cheap cloth was sold in India.', 'Hand-woven cloth could not compete on price.'], 'Competition from cheap machine-made cloth'),
      ],
      practice: [
        tp('speed', (r) => {
          const hl = r.pick([2, 3, 4, 5]);
          const k = r.pick([8, 10, 12, 15, 20]);
          const pl = hl * k;
          return numQ(`A handloom weaver produces ${hl} metres of cloth a day; a powerloom produces ${pl} metres a day (illustrative). How many times more does the powerloom produce?`, k, ['Divide the powerloom output by the handloom output.', `${pl} ÷ ${hl}`], [`${pl} ÷ ${hl} = ${k} times`], [{ when: String(pl - hl), explain: 'That is the difference in metres. “How many times” means divide.' }], 0.001);
        }, 1),
        mcq('mcq', 'Link places and machines to their story.', [
          ['India’s first cotton textile mill was set up in Bombay in…', '1854', ['1947', '1757', '1991'], 'Mid-19th century.', 'The first mill started in Bombay in 1854.'],
          ['Sircilla in Telangana is known for…', 'Powerloom weaving', ['Coal mining', 'Tea gardens', 'Shipbuilding'], 'Electric looms.', 'Sircilla has thousands of powerlooms.'],
          ['Pochampally is famous for…', 'Ikat handloom saris', ['Steel plants', 'Cement', 'Software parks'], 'A tie-and-dye weaving style.', 'Pochampally Ikat is a GI-tagged handloom product.'],
          ['Why did many big textile mills close after the 1980s?', 'Powerlooms in small units produced cloth more cheaply', ['People stopped wearing clothes', 'Cotton disappeared', 'Handlooms became faster than mills'], 'Competition on cost.', 'Small powerloom units had lower costs.'],
          ['A GI tag helps handloom weavers by…', 'Protecting the name and design of a regional product', ['Doubling loom speed', 'Banning all mills', 'Giving free electricity'], 'GI = Geographical Indication.', 'Only genuine products from the region can use the name.'],
        ]),
        matchT('match', 'product, place or machine to its description', [
          ['Handloom', 'Worked by hand and feet'], ['Powerloom', 'Runs on electricity'], ['Sircilla', 'Powerloom town'], ['Pochampally', 'Ikat handloom saris'],
          ['Gadwal', 'Handloom saris with silk borders'], ['Bombay, 1854', 'First cotton mill'],
        ], ['Two are machines, three are places.', 'The mill came in the 19th century.']),
      ],
    },
    {
      id: 'ts8.ss.tech.services', title: 'Technology in the service sector and communication', prereqs: ['ts8.ss.tech.industry'],
      intro: [
        h('From telegrams to video calls'),
        photo('💡', 'Communication technology has created new jobs and ended some old ones.'),
        p('The service sector includes banking, transport, trade, health, education and information technology. Technology has changed it fast. Earlier, news of a wedding or a death reached relatives by post or telegram; now it reaches them in seconds by phone. Bank tellers, typists and telegraph operators have fewer jobs, while software engineers, call-centre workers, delivery riders and app-based drivers have many.'),
        stepsB('1851: first telegraph line in India (Calcutta–Diamond Harbour).', '1882: telephone exchanges open in Indian cities.', '1995: first mobile phone call in India.', '1998: HITEC City opens in Hyderabad; IT jobs grow rapidly.', '2013: the telegram service is closed.'),
        def('Gig work', 'Short-term, task-based work arranged through apps — such as food delivery or ride-hailing; flexible but often without job security or benefits.'),
        p('Hyderabad has become a major hub for information technology and related services, attracting workers from across India. But many new service jobs are informal and insecure, and people without digital skills can be left behind. Digital literacy and fair working conditions are important.'),
        keys('Technology creates some jobs and removes others.', 'Telegram (1851–2013) gave way to phones and the internet.', 'Hyderabad: IT hub since HITEC City (1998).', 'Gig work: flexible but insecure.'),
        remember('The Indian telegram service ended on 15 July 2013 after more than 160 years.'),
        tip('In answers, name one job that disappeared and one job that appeared because of technology.'),
      ],
      examples: [
        ex('Name two jobs that declined and two that grew due to communication technology.', ['Declined: telegraph operator, typist, STD booth owner.', 'Grew: software engineer, mobile repair technician, delivery rider.'], 'E.g. typist and telegraph operator declined; software engineer and delivery rider grew'),
        ex('Arrange: mobile phone call in India, first telegraph line, HITEC City, telegram closure.', ['First telegraph line — 1851.', 'Mobile call — 1995.', 'HITEC City — 1998.', 'Telegram closure — 2013.'], '1851 → 1995 → 1998 → 2013'),
      ],
      practice: [
        timelineT('tl', 'Put these communication and industry milestones in time order.', c8Events, ['The telegraph is the oldest.', 'The telegram service closed last.']),
        mcq('mcq', 'Technology reshapes service jobs.', [
          ['Which job has DECLINED because of mobile phones and the internet?', 'Telegraph operator', ['Software developer', 'App delivery rider', 'Mobile repair technician'], 'Telegrams ended in 2013.', 'Telegraph work vanished as telegrams were replaced.'],
          ['Gig work means…', 'Short-term task-based work through apps', ['Government permanent jobs', 'Farming one’s own land', 'Work in a coal mine'], 'Food delivery is an example.', 'Gig workers are paid per task, often without benefits.'],
          ['HITEC City in Hyderabad opened in…', '1998', ['1951', '1975', '2014'], 'Late 1990s.', 'HITEC City opened in 1998 and became an IT hub.'],
          ['Which is part of the service sector?', 'Banking', ['Mining coal', 'Growing paddy', 'Weaving cloth'], 'It provides a service, not a good.', 'Banking, transport, health and IT are services.'],
          ['A problem with many new service jobs is…', 'They are often informal and insecure', ['They need no electricity', 'They pay in grain', 'They are only for children'], 'No fixed contract.', 'Many lack job security and social benefits.'],
        ]),
        tapT('tap', 'Tap every job that GREW because of new communication technology.', [
          ['Software engineer', true], ['Call-centre worker', true], ['App-based delivery rider', true], ['Mobile phone repair technician', true],
          ['Telegraph operator', false], ['Typist on typewriters', false], ['Public telephone booth operator', false],
        ], ['Which jobs need smartphones and computers?', 'Typewriters and telegrams are old technology.'], 'New digital jobs grew; older communication jobs declined.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Public Health and the Government
// =====================================================================================
const ch9: USpec = {
  id: 'ts8.ss.ch9', subject: 'social', title: 'Public Health and the Government', source: src(9),
  objectives: [
    {
      id: 'ts8.ss.health.services', title: 'Public and private health services', prereqs: [],
      intro: [
        h('Where do people go when they fall ill?'),
        photo('🧑‍⚕️', 'Public health centres provide free or low-cost care; private hospitals charge fees.'),
        p('When Arjun’s grandmother had fever in their village, she went to the Primary Health Centre (PHC), where the doctor and medicines were free. When his uncle in Hyderabad needed an operation, the family chose a private hospital and paid a large bill. India has both public and private health services, and they differ in cost, reach and quality.'),
        def('Public health services', 'Hospitals and health centres run by the government, funded by taxes, giving free or low-cost care to all.'),
        def('Private health services', 'Clinics, hospitals, labs and pharmacies owned by individuals or companies that charge for services.'),
        stepsB('Sub-centre: for about 5,000 people (3,000 in hilly/tribal areas); ANM and health worker; vaccinations, mother and child care.', 'Primary Health Centre (PHC): for about 30,000 people (20,000 in hilly/tribal areas); a doctor, basic medicines and tests.', 'Community Health Centre (CHC): for about 1,20,000 people; specialists and beds.', 'District hospital and medical college hospitals: serious cases are referred here.'),
        p('Private services are often located in towns and cost more; public services reach villages but may face shortages of doctors, medicines and equipment. A strong public system matters most for the poor.'),
        keys('Public = government, tax-funded, free/low cost.', 'Private = fees; concentrated in cities.', 'Ladder: sub-centre → PHC → CHC → district hospital.', 'PHC norm: about 30,000 people (plains).'),
        remember('Population norms (plains): sub-centre 5,000; PHC 30,000; CHC 1,20,000.'),
        tip('To find how many PHCs an area needs: population ÷ 30,000 (plains) or ÷ 20,000 (tribal/hilly).'),
      ],
      examples: [
        ex('A mandal in the plains has 90,000 people. How many PHCs does it need by the norm?', ['Norm: 1 PHC per 30,000 in plains.', '90,000 ÷ 30,000 = 3.'], '3 PHCs'),
        ex('A tribal area has 60,000 people. How many PHCs?', ['Norm: 1 PHC per 20,000 in tribal/hilly areas.', '60,000 ÷ 20,000 = 3.'], '3 PHCs'),
      ],
      practice: [
        tp('phc', (r) => {
          const tribal = r.next() < 0.5;
          const norm = tribal ? 20000 : 30000;
          const k = r.pick([2, 3, 4, 5, 6]);
          const pop = norm * k;
          return numQ(`A ${tribal ? 'tribal (hilly)' : 'plains'} area has a population of ${pop.toLocaleString('en-IN')}. Using the norm of one PHC per ${norm.toLocaleString('en-IN')} people, how many PHCs are needed?`, k, ['Divide the population by the norm.', `${pop} ÷ ${norm}`], [`${pop.toLocaleString('en-IN')} ÷ ${norm.toLocaleString('en-IN')} = ${k} PHCs`], [], 0.001);
        }, 1),
        mcq('mcq', 'Public = government; private = paid by patient.', [
          ['A Primary Health Centre in the plains serves about…', '30,000 people', ['500 people', '5 lakh people', '50 people'], 'Bigger than a sub-centre.', 'The norm is one PHC per 30,000 (plains).'],
          ['Public health services are mainly funded by…', 'Taxes collected by the government', ['Patients’ fees only', 'Private companies’ profits', 'Foreign tourists'], 'Government money.', 'Taxes pay for public hospitals.'],
          ['A serious case from a PHC is usually referred to a…', 'CHC or district hospital', ['Sub-centre', 'Anganwadi', 'School'], 'Higher level of care.', 'Referral goes up the health ladder.'],
          ['One problem with private health care is…', 'High cost for poor families', ['It is always free', 'It exists only in villages', 'It has no doctors'], 'Bills can be large.', 'Private care can be expensive.'],
          ['The lowest level of the public health system is the…', 'Sub-centre', ['Medical college', 'District hospital', 'CHC'], 'Run by an ANM.', 'Sub-centres serve about 5,000 people.'],
        ]),
        matchT('match', 'health facility to its role', [
          ['Sub-centre', 'About 5,000 people; vaccination, mother–child care'], ['PHC', 'About 30,000 people; a doctor'], ['CHC', 'About 1,20,000 people; specialists'],
          ['District hospital', 'Serious cases referred here'], ['Private hospital', 'Charges fees'], ['Anganwadi', 'Nutrition and care for young children'],
        ], ['Population served rises up the ladder.', 'Private means fees.']),
      ],
    },
    {
      id: 'ts8.ss.health.equality', title: 'Health insurance and equality in healthcare', prereqs: ['ts8.ss.health.services'],
      intro: [
        h('Should treatment depend on how rich you are?'),
        photo('💊', 'A single hospital bill can push a poor family into debt.'),
        p('Health is a basic need. The Constitution asks the State to raise the level of nutrition and improve public health (Article 47), and courts have said the right to life (Article 21) includes the right to health. Yet many Indians pay for treatment from their own pockets (out-of-pocket expenditure). A big illness can force families to sell land or borrow at high interest.'),
        def('Health insurance', 'A scheme where people (or the government on their behalf) pay a small premium into a fund; when someone falls ill, the fund pays the hospital bill.'),
        p('Government schemes help: the Aarogyasri scheme (started in 2007 in undivided Andhra Pradesh and continued in Telangana) pays for serious treatments for poor families at listed hospitals; Ayushman Bharat – PM-JAY (2018) offers cover of up to ₹5 lakh per family per year. Insurance must be backed by enough public hospitals, doctors and medicines, or people will still be denied care.'),
        keys('Out-of-pocket health costs can cause poverty.', 'Insurance pools risk among many people.', 'Aarogyasri (2007) and PM-JAY (2018) cover poor families.', 'Equality: care by need, not by ability to pay.'),
        remember('PM-JAY provides cover of up to ₹5 lakh per family per year for listed treatments.'),
        tip('Insurance works because only a few of the many who pay fall seriously ill in a given year.'),
      ],
      examples: [
        ex('A family’s treatment costs ₹1,20,000; insurance covers 80%. How much does the family pay?', ['Covered = 80% of 1,20,000 = ₹96,000.', 'Family pays = 1,20,000 − 96,000 = ₹24,000.'], '₹24,000'),
        ex('Why is equal access to health care important for a democracy?', ['All citizens have an equal right to life.', 'If only the rich get treatment, inequality deepens.', 'Healthy citizens can work, learn and take part in public life.'], 'Because health is part of the right to life and equal citizenship'),
      ],
      practice: [
        tp('cover', (r) => {
          const bill = r.pick([50000, 80000, 100000, 120000, 200000]);
          const pc = r.pick([50, 60, 70, 75, 80, 90]);
          const pay = bill * (100 - pc) / 100;
          return numQ(`A hospital bill is ₹${bill.toLocaleString('en-IN')}. Health insurance covers ${pc}% of it (illustrative). How much (₹) must the family pay from its own pocket?`, pay, ['Find the uncovered percentage: 100 − covered.', `${100 - pc}% of ${bill}`], [`Uncovered = ${100 - pc}%`, `${100 - pc}% × ${bill} = ₹${pay.toLocaleString('en-IN')}`], [{ when: String(bill * pc / 100), explain: 'That is the amount insurance pays. The family pays the rest.' }], 0.001);
        }, 2),
        mcq('mcq', 'Insurance spreads the cost of illness across many people.', [
          ['Out-of-pocket health expenditure means…', 'Money families pay directly for treatment', ['Money paid by the government', 'Free medicines', 'Hospital profits'], 'From one’s own pocket.', 'It is spending by households at the time of treatment.'],
          ['Aarogyasri is a…', 'Government health insurance scheme for poor families', ['Private hospital chain', 'Tree-planting programme', 'Bank account'], 'Started in 2007.', 'Aarogyasri pays for serious treatments for eligible families.'],
          ['Ayushman Bharat – PM-JAY gives cover of up to…', '₹5 lakh per family per year', ['₹500 per person', '₹50 crore per village', 'Unlimited for everyone'], 'Launched in 2018.', 'PM-JAY offers up to ₹5 lakh per family per year.'],
          ['Courts have held that the right to health is part of…', 'The right to life (Article 21)', ['The right to vote', 'The right to property', 'Fundamental duties only'], 'The most basic right.', 'The Supreme Court has read health into Article 21.'],
          ['Health insurance works because…', 'Many pay small premiums and only a few need large payments', ['Hospitals give everything free', 'Nobody ever falls ill', 'Doctors pay patients'], 'Risk pooling.', 'The many share the cost of the few.'],
        ]),
        tapT('tap', 'Tap every step that makes healthcare MORE equal.', [
          ['Free medicines at government hospitals', true], ['Health insurance for poor families', true], ['More PHCs in remote villages', true], ['Enough doctors in public hospitals', true],
          ['Treatment only for those who can pay', false], ['Closing rural health centres', false], ['Charging high fees at PHCs', false],
        ], ['Equal access = cost should not block care.', 'Closing centres reduces access.'], 'Free services, insurance and more facilities widen access.'),
      ],
    },
    {
      id: 'ts8.ss.health.facilities', title: 'Basic public facilities, the government’s role and nutrition in Telangana and AP', prereqs: ['ts8.ss.health.equality'],
      intro: [
        h('Health begins at home and in the street'),
        photo('💧', 'Safe drinking water and sanitation prevent many diseases before a doctor is needed.'),
        p('Many illnesses — diarrhoea, typhoid, malaria, dengue — spread through unsafe water, open drains and garbage. So health depends on basic public facilities: safe drinking water, toilets and sanitation, drainage, garbage collection, electricity and public transport. These are public facilities because everyone needs them and private companies alone would not supply them to all at a fair price. Telangana’s Mission Bhagiratha, for example, aims to supply treated drinking water by pipeline to households.'),
        def('Malnutrition', 'Poor health from too little, too much or the wrong kind of food. Signs in children: stunting (short for age), wasting (thin for height), underweight; anaemia (low haemoglobin) is common in women and children.'),
        p('National Family Health Surveys (NFHS) show that in both Telangana and Andhra Pradesh roughly one in three children under five is stunted, and anaemia affects more than half of women and young children (rounded; check the latest NFHS report). Government programmes respond: Anganwadi centres under ICDS (started 1975) give nutritious food and health check-ups; the PM-POSHAN mid-day meal feeds school children; fortified rice and iron tablets fight anaemia.'),
        keys('Public facilities: water, sanitation, drainage, electricity, transport.', 'Governments must provide these to all, at affordable cost.', 'Malnutrition signs: stunting, wasting, underweight, anaemia.', 'Responses: Anganwadi (ICDS), mid-day meals, fortified food.'),
        remember('Prevention through clean water and nutrition is cheaper and kinder than treatment.'),
        tip('A survey % = (children with the problem ÷ children surveyed) × 100.'),
      ],
      examples: [
        ex('In a survey of 400 children (illustrative), 120 were stunted. What percentage is that?', ['120 ÷ 400 = 0.3.', '× 100 = 30%.'], '30%'),
        ex('Why should water supply be a public facility rather than left only to private sellers?', ['Everyone needs water to live, rich or poor.', 'Private sellers may charge high prices or ignore poor areas.', 'The government can supply all at affordable rates.'], 'Because water is essential for all and must be affordable'),
      ],
      practice: [
        tp('survey', (r) => {
          const n = r.pick([200, 250, 400, 500, 800]);
          const pc = r.pick([20, 25, 30, 35, 40]);
          const k = (n * pc) / 100;
          const cond = r.pick(['stunted', 'underweight', 'anaemic']);
          return numQ(`In a health survey of ${n} children in a mandal (illustrative), ${k} were found ${cond}. What percentage of the children were ${cond}?`, pc, ['Percentage = part ÷ total × 100.', `${k} ÷ ${n} × 100`], [`${k} ÷ ${n} = ${pc / 100}`, `× 100 = ${pc}%`], [], 0.005, '%');
        }, 1),
        mcq('mcq', 'Health needs water, sanitation and nutrition, not only hospitals.', [
          ['Stunting in a child means…', 'Being too short for his or her age', ['Being too heavy', 'Having fever', 'Being tall and thin'], 'A sign of long-term undernutrition.', 'Stunting reflects chronic undernutrition.'],
          ['Anganwadi centres are part of which programme?', 'ICDS (Integrated Child Development Services)', ['MGNREGA', 'RTI', 'UPI'], 'Started in 1975.', 'Anganwadis provide nutrition and pre-school care under ICDS.'],
          ['Why is water supply a public facility?', 'Everyone needs it and it must be affordable to all', ['Only rich people drink water', 'Water is not essential', 'Private sellers always supply free water'], 'Universal need.', 'Basic needs must be available to all.'],
          ['Which disease spreads mainly through dirty water?', 'Diarrhoea / typhoid', ['Diabetes', 'Short-sightedness', 'Broken bones'], 'Water-borne.', 'Contaminated water spreads diarrhoea and typhoid.'],
          ['Telangana’s scheme to supply treated drinking water by pipeline is…', 'Mission Bhagiratha', ['Haritha Haram', 'Mission Kakatiya', 'Aarogyasri'], 'Named after the sage who brought the Ganga down.', 'Mission Bhagiratha supplies piped drinking water.'],
          ['Anaemia is caused mainly by lack of…', 'Iron', ['Sunlight', 'Sleep', 'Salt'], 'Haemoglobin needs it.', 'Iron deficiency is the main cause of anaemia.'],
        ]),
        tapT('tap', 'Tap every basic PUBLIC facility.', [
          ['Safe drinking water supply', true], ['Drainage and sanitation', true], ['Garbage collection', true], ['Public transport', true], ['Street lighting', true],
          ['A private car', false], ['A family’s television set', false], ['Jewellery', false],
        ], ['Something everyone needs and shares.', 'Private possessions are not public facilities.'], 'Public facilities serve everyone and are provided or regulated by government.'),
      ],
    },
  ],
};


export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9];
