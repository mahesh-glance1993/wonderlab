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


// =====================================================================================
// Chapter 10 — Landlords and Tenants under the British and the Nizam
// =====================================================================================
const c10Events: EV[] = [
  [1765, 'East India Company gets the Diwani (revenue rights) of Bengal', '1765'],
  [1793, 'Permanent Settlement introduced in Bengal by Lord Cornwallis', '1793'],
  [1820, 'Ryotwari system extended in Madras Presidency under Thomas Munro', 'about 1820'],
  [1859, 'Indigo revolt by peasants in Bengal', '1859–60'],
  [1875, 'Deccan riots against moneylenders', '1875'],
];
const ch10: USpec = {
  id: 'ts8.ss.ch10', subject: 'social', title: 'Landlords and Tenants under the British and the Nizam', source: src(10),
  objectives: [
    {
      id: 'ts8.ss.land.settlements', title: 'Permanent Settlement and the Ryotwari system', prereqs: [],
      intro: [
        h('Who should pay the land tax?'),
        photo('🌾', 'Under colonial rule, land revenue was the biggest source of income for the government.'),
        p('After 1765, the East India Company collected land revenue in Bengal. It wanted a steady, large income. Two main systems were tried in different regions.'),
        def('Permanent Settlement (Zamindari system)', 'Introduced in Bengal in 1793 by Lord Cornwallis. Zamindars were made owners of land and had to pay a fixed revenue to the Company for ever. If they failed to pay on time (by sunset of the due date), their estates were auctioned.'),
        def('Ryotwari system', 'Introduced in parts of Madras and Bombay Presidencies (developed by Alexander Read and Thomas Munro, about 1820). Revenue was settled directly with the ryot (cultivator), who was recognised as owner; the rate was revised periodically, often every 30 years.'),
        p('Under the Permanent Settlement, revenue was fixed very high; zamindars squeezed tenants with high rents and evictions, while many old zamindars lost estates in auctions. Under Ryotwari, there was no middleman, but revenue was often set too high and had to be paid in cash, even in years of drought, pushing ryots into debt.'),
        keys('1793: Permanent Settlement — zamindars, fixed revenue, Bengal.', 'Ryotwari: direct with cultivators — Madras, Bombay; revised periodically.', 'Both demanded high revenue in cash.', 'Peasants and tenants suffered in both.'),
        remember('Cornwallis → Permanent Settlement (1793); Munro → Ryotwari (Madras).'),
        tip('Zamindari has a middleman (zamindar); Ryotwari has none — revenue goes straight from ryot to government.'),
      ],
      examples: [
        ex('Who paid revenue to the government under (a) Permanent Settlement and (b) Ryotwari?', ['(a) The zamindar, who collected rent from tenants.', '(b) The ryot himself, directly.'], 'Zamindar under Permanent Settlement; ryot under Ryotwari'),
        ex('Why did the Company like the Permanent Settlement at first?', ['It guaranteed a fixed income every year.', 'Collection became the zamindar’s job.', 'The Company hoped zamindars would invest in land.'], 'Fixed, assured revenue with less effort'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of colonial land revenue in order.', c10Events, ['The Diwani came before any settlement.', 'Riots came after the systems caused hardship.']),
        mcq('mcq', 'Zamindari = middleman; Ryotwari = direct with cultivator.', [
          ['The Permanent Settlement was introduced in…', '1793', ['1857', '1820', '1947'], 'By Lord Cornwallis.', 'It was introduced in Bengal in 1793.'],
          ['Under the Ryotwari system, revenue was collected from…', 'The ryot (cultivator) directly', ['The zamindar', 'The village temple', 'Traders'], 'No middleman.', 'Ryotwari dealt directly with cultivators.'],
          ['The Ryotwari system is associated with…', 'Thomas Munro', ['Lord Cornwallis', 'Lord Curzon', 'Lord Dalhousie'], 'Governor of Madras.', 'Munro developed and extended Ryotwari in Madras.'],
          ['Under the Permanent Settlement, if a zamindar failed to pay on time…', 'His estate could be auctioned', ['He got a reward', 'Revenue was cancelled', 'Tenants paid nothing'], 'The “sunset law”.', 'Estates of defaulting zamindars were sold.'],
          ['A common problem in both systems was…', 'High revenue demanded in cash, causing debt', ['Too little revenue', 'No role for money', 'Free land for all'], 'Even in drought years.', 'Cash demands pushed peasants towards moneylenders.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Zamindar', 'Landlord who paid fixed revenue'], ['Ryot', 'Cultivator'], ['Permanent Settlement', 'Fixed revenue for ever, 1793'],
          ['Ryotwari', 'Direct settlement with cultivators'], ['Diwani', 'Right to collect revenue'], ['Tenant', 'Farmer who cultivates another’s land for rent'],
        ], ['Ryot = cultivator.', 'Diwani was granted in 1765.']),
      ],
    },
    {
      id: 'ts8.ss.land.commercial', title: 'Commercialisation of agriculture and moneylenders', prereqs: ['ts8.ss.land.settlements'],
      intro: [
        h('Growing crops for the market, not the family'),
        photo('🪙', 'Revenue had to be paid in cash, so peasants had to sell crops — or borrow.'),
        def('Commercialisation of agriculture', 'Growing crops mainly for sale in the market (cash crops) rather than for the family’s own food.'),
        p('British policies encouraged cash crops such as cotton, indigo, jute, groundnut and tobacco, which were needed by factories in Britain. Peasants needed cash to pay revenue on fixed dates. Prices of cash crops rose and fell with world markets; when they crashed, peasants could not repay loans.'),
        p('Moneylenders (sahukars) lent at very high interest, often keeping accounts the peasant could not read. Land given as security was taken over when loans were not repaid. Land slowly passed from cultivators to moneylenders and landlords. Anger broke out in revolts like the Indigo revolt (1859–60) in Bengal and the Deccan riots (1875) in Maharashtra.'),
        keys('Cash crops for the market: cotton, indigo, jute.', 'Revenue in cash → borrowing.', 'High interest → loss of land to moneylenders.', 'Revolts: Indigo (1859–60), Deccan riots (1875).'),
        remember('Debt trap: low price → loan → high interest → land lost.'),
        tip('Compound interest at high rates doubles a debt very quickly — that is why loans became traps.'),
      ],
      examples: [
        ex('A peasant borrows ₹100 at 25% simple interest per year. How much does he owe after 4 years?', ['Interest = 100 × 25 × 4 ÷ 100 = ₹100.', 'Total = 100 + 100 = ₹200.'], '₹200 — the debt has doubled'),
        ex('Why did cash-crop farmers suffer when world prices fell?', ['Their income depended on selling the crop.', 'Revenue and loan payments stayed fixed.', 'So they borrowed more and lost land.'], 'Fixed payments with falling income led to debt'),
      ],
      practice: [
        tp('debt', (r) => {
          const P = r.pick([100, 200, 500, 1000]);
          const R = r.pick([20, 25, 30, 40, 50]);
          const T = r.pick([2, 3, 4]);
          const tot = P + (P * R * T) / 100;
          return numQ(`A peasant borrowed ₹${P} from a moneylender at ${R}% simple interest per year. How much (₹) does he owe in total after ${T} years?`, tot, ['Interest = P × R × T ÷ 100.', 'Total owed = principal + interest.'], [`Interest = ${P} × ${R} × ${T} ÷ 100 = ₹${(P * R * T) / 100}`, `Total = ${P} + ${(P * R * T) / 100} = ₹${tot}`], [{ when: String((P * R * T) / 100), explain: 'That is only the interest. Add the amount borrowed.' }], 0.001);
        }, 2),
        mcq('mcq', 'Cash demands + high interest = debt trap.', [
          ['Commercialisation of agriculture means…', 'Growing crops mainly for sale', ['Growing only for the family', 'Stopping farming', 'Farming by machines only'], 'Market-oriented farming.', 'Cash crops are grown for sale.'],
          ['Which was a cash crop encouraged by the British?', 'Indigo', ['Ragi for home', 'Millets for the family', 'Kitchen herbs'], 'Used as blue dye.', 'Indigo, cotton and jute were grown for export.'],
          ['Why did peasants borrow from moneylenders?', 'To pay revenue in cash on fixed dates', ['To buy cars', 'For school fees only', 'To pay the Election Commission'], 'Revenue in cash.', 'Cash demands forced borrowing.'],
          ['The Deccan riots of 1875 were directed against…', 'Moneylenders', ['Factory owners', 'Tribal chiefs', 'Railway workers'], 'Peasants burnt account books.', 'Peasants attacked moneylenders and their bonds.'],
          ['When peasants could not repay loans…', 'Their land passed to moneylenders', ['The loans were forgiven', 'They got higher prices', 'The government paid'], 'Land was the security.', 'Mortgaged land was taken over.'],
        ]),
        orderT('order', 'Put the steps of the peasant debt trap in order.', ['Revenue must be paid in cash on a fixed date', 'Crop prices fall and income is short', 'Peasant borrows from a moneylender at high interest', 'Debt grows faster than income', 'Land pledged as security is taken over'], ['It starts with the cash demand.', 'Losing land is the last step.'], 'Cash demand → low income → loan → growing debt → land lost.'),
      ],
    },
    {
      id: 'ts8.ss.land.nizam', title: 'Zamindars, Doras and peasants in Hyderabad State', prereqs: ['ts8.ss.land.commercial'],
      intro: [
        h('Land and power in the Nizam’s dominions'),
        photo('👑', 'In Hyderabad State, land, power and status were concentrated in a few hands.'),
        p('In the Nizam’s Hyderabad State, land was held under different tenures. Roughly 60% was diwani or khalsa land, where the government collected revenue directly; roughly 30% was given as jagirs to nobles (jagirdars, paigahs, samsthans) who collected revenue for themselves; and about 10% was sarf-e-khas, the Nizam’s personal estate whose income went to the royal family (approximate shares).'),
        def('Dora / Deshmukh', 'Powerful village landlords in Telangana who held large lands and acted as revenue collectors and local rulers; peasants addressed them as “Dora” (master).'),
        def('Vetti', 'Forced, unpaid labour that lower castes and poor peasants had to perform for landlords and officials.'),
        def('Bhagela', 'A bonded labourer who worked for a landlord to repay a loan, sometimes for life.'),
        p('Doras collected high rents, took illegal levies, seized land of indebted peasants and forced people into vetti — carrying loads, working fields, serving at weddings. Dalits and tribals suffered most. This oppression later fuelled the Telangana armed struggle (1946–51).'),
        bars(['Diwani/Khalsa', 'Jagir', 'Sarf-e-khas'], [60, 30, 10], '%', 'Approximate shares of land in Hyderabad State by tenure: about 60% diwani/khalsa, 30% jagir, 10% sarf-e-khas (rounded).'),
        keys('Khalsa (~60%), jagir (~30%), sarf-e-khas (~10%) — approximate.', 'Doras/deshmukhs dominated villages.', 'Vetti = forced labour; bhagela = bonded labourer.', 'Oppression led to peasant resistance.'),
        remember('Sarf-e-khas was the Nizam’s personal estate.'),
        tip('Remember “Vetti” as “work without wage”.'),
      ],
      examples: [
        ex('Hyderabad State had about 82,000 square miles of land (rounded). If 30% was under jagirs, roughly how many square miles was that?', ['30% of 82,000 = 0.3 × 82,000.', '= 24,600 square miles.'], 'About 24,600 square miles'),
        ex('Why was vetti especially unjust?', ['People were forced to work without pay.', 'It fell mostly on Dalits and poor peasants.', 'Refusal led to punishment, so they had no freedom of choice.'], 'It was forced, unpaid and caste-based'),
      ],
      practice: [
        mcq('mcq', 'Recall the land tenures and terms of Hyderabad State.', [
          ['Sarf-e-khas land was…', 'The Nizam’s personal estate', ['Land given to temples', 'Forest land', 'Land of tenants'], 'Its income went to the royal family.', 'Sarf-e-khas revenues belonged to the Nizam.'],
          ['Vetti meant…', 'Forced unpaid labour', ['A type of crop', 'A land tax in cash', 'A festival'], 'Work without wages.', 'Vetti was compulsory free labour for landlords and officials.'],
          ['A bhagela was a…', 'Bonded labourer working to repay a debt', ['Royal minister', 'Moneylender', 'Village priest'], 'Bound to the landlord.', 'Bhagelas were bonded to landlords, often for life.'],
          ['Roughly what share of Hyderabad State land was under jagirs?', 'About 30%', ['About 90%', 'About 2%', 'About 60%'], 'Less than khalsa.', 'Jagirs covered roughly 30% of the land (approximate).'],
          ['Land where the government collected revenue directly was called…', 'Diwani or khalsa', ['Jagir', 'Sarf-e-khas', 'Inam to temples'], 'The largest share.', 'Khalsa/diwani land was under direct government revenue collection.'],
          ['The oppression by doras later led to…', 'The Telangana armed struggle (1946–51)', ['The Permanent Settlement', 'The Green Revolution', 'The Salt March'], 'A peasant movement.', 'Anger at doras fuelled the struggle of 1946–51.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Dora', 'Powerful village landlord'], ['Vetti', 'Forced unpaid labour'], ['Bhagela', 'Bonded labourer'], ['Jagir', 'Land granted to nobles'],
          ['Khalsa', 'Land under direct government revenue'], ['Sarf-e-khas', 'Nizam’s personal estate'],
        ], ['Three are types of land.', 'Vetti and bhagela are kinds of unfree labour.']),
        tp('share', (r) => {
          const tot = r.pick([80000, 82000, 82500]);
          const [name, pc] = r.pick<[string, number]>([['jagir', 30], ['khalsa (diwani)', 60], ['sarf-e-khas', 10]]);
          const ans = (tot * pc) / 100;
          return numQ(`Take Hyderabad State’s area as about ${tot.toLocaleString('en-IN')} square miles (rounded). If about ${pc}% was ${name} land, roughly how many square miles was that?`, ans, ['Find the percentage of the total.', `${pc} ÷ 100 × ${tot}`], [`${pc}% of ${tot} = ${ans.toLocaleString('en-IN')} square miles`], [], 0.005);
        }, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11A — National Movement: The Early Phase 1885–1919
// =====================================================================================
const c11aEvents: EV[] = [
  [1876, 'Indian Association founded in Calcutta', '1876'],
  [1885, 'Indian National Congress founded at Bombay', 'December 1885'],
  [1905, 'Partition of Bengal; Swadeshi movement begins', '1905'],
  [1906, 'All India Muslim League founded at Dhaka', '1906'],
  [1907, 'Congress splits at Surat into Moderates and Extremists', '1907'],
  [1911, 'Partition of Bengal annulled', '1911'],
  [1914, 'First World War begins', '1914'],
  [1916, 'Home Rule Leagues and the Lucknow Pact', '1916'],
];
const ch11a: USpec = {
  id: 'ts8.ss.ch11a', subject: 'social', title: 'National Movement – The Early Phase 1885–1919', source: src('11A'),
  objectives: [
    {
      id: 'ts8.ss.nm1.congress', title: 'Early associations and the Moderates of the Indian National Congress', prereqs: [],
      intro: [
        h('Educated Indians begin to organise'),
        photo('📜', 'Petitions, speeches and newspapers were the early tools of Indian nationalists.'),
        p('By the second half of the 19th century, educated Indians began to discuss how British rule affected India. They formed associations: the British Indian Association (1851), the Poona Sarvajanik Sabha (1870), the Indian Association of Calcutta (1876) led by Surendranath Banerjea, and the Madras Mahajana Sabha (1884).'),
        p('In December 1885, 72 delegates met in Bombay and founded the Indian National Congress, with W. C. Bonnerjee as president. A retired British official, A. O. Hume, helped organise it.'),
        def('Moderates', 'Early Congress leaders such as Dadabhai Naoroji, Pherozeshah Mehta, Gopal Krishna Gokhale and Surendranath Banerjea, who believed in petitions, speeches and constitutional methods to win reforms.'),
        def('Drain theory', 'Dadabhai Naoroji’s argument that British rule drained India’s wealth to Britain through salaries, pensions, profits and trade.'),
        p('Moderates demanded more Indians in councils and in the civil services, lower land revenue, less military spending and protection for Indian industry. They exposed the economic effects of colonial rule and built national awareness, though they won only limited reforms.'),
        keys('Early associations: 1851, 1870, 1876, 1884.', 'INC founded December 1885, Bombay, 72 delegates.', 'Moderates: petitions and constitutional methods.', 'Naoroji’s drain theory.'),
        remember('W. C. Bonnerjee was the first president of the Congress (1885).'),
        tip('Moderates = “prayers, petitions, protests” within the law.'),
      ],
      examples: [
        ex('Name two demands of the Moderates.', ['More Indian representation in legislative councils.', 'Holding civil service examinations in India too and reducing land revenue.'], 'E.g. more Indians in councils; lower revenue'),
        ex('What did Dadabhai Naoroji mean by the “drain of wealth”?', ['India’s wealth went to Britain as salaries, pensions, interest and profits.', 'Nothing equal came back to India.', 'So India grew poorer.'], 'An unreturned outflow of Indian wealth to Britain'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of the early national movement in order.', c11aEvents, ['The Indian Association came before the Congress.', 'The Surat split came after the Swadeshi movement began.']),
        mcq('mcq', 'Moderates worked through constitutional methods.', [
          ['The Indian National Congress was founded in…', '1885', ['1857', '1905', '1920'], 'At Bombay in December.', 'The INC was founded in December 1885.'],
          ['The first president of the Congress was…', 'W. C. Bonnerjee', ['Mahatma Gandhi', 'Bal Gangadhar Tilak', 'Jawaharlal Nehru'], 'A Bengali lawyer.', 'W. C. Bonnerjee presided over the first session.'],
          ['The “drain of wealth” theory was put forward by…', 'Dadabhai Naoroji', ['Lala Lajpat Rai', 'Lord Curzon', 'Annie Besant'], 'The “Grand Old Man of India”.', 'Naoroji explained the drain of wealth.'],
          ['The Moderates mainly used…', 'Petitions, meetings and speeches', ['Armed attacks', 'Boycott and strikes only', 'Non-cooperation'], 'Constitutional methods.', 'Moderates believed in persuasion within the law.'],
          ['The Indian Association (1876) was led by…', 'Surendranath Banerjea', ['Dayanand Saraswati', 'Sir Syed Ahmad Khan', 'Bipin Chandra Pal'], 'A Calcutta leader.', 'Banerjea founded the Indian Association.'],
        ]),
        matchT('match', 'leader or body to its description', [
          ['Dadabhai Naoroji', 'Drain theory'], ['W. C. Bonnerjee', 'First Congress president'], ['A. O. Hume', 'Retired official who helped found the Congress'],
          ['G. K. Gokhale', 'Moderate leader; Gandhi’s political guru'], ['Indian Association', 'Founded 1876 in Calcutta'], ['Madras Mahajana Sabha', 'Founded 1884'],
        ], ['Two are organisations.', 'Gandhi called Gokhale his guru.']),
      ],
    },
    {
      id: 'ts8.ss.nm1.swadeshi', title: 'The Swadeshi movement; Moderates and Extremists', prereqs: ['ts8.ss.nm1.congress'],
      intro: [
        h('Bengal is divided — India protests'),
        photo('🚩', 'In 1905 people across India took the Swadeshi pledge to use Indian-made goods.'),
        p('In 1905 the Viceroy Lord Curzon partitioned Bengal, saying it was too large to govern. Indians saw it as a move to divide Hindus and Muslims and weaken the nationalist movement in Bengal. The partition came into effect on 16 October 1905, which people observed as a day of mourning.'),
        def('Swadeshi and boycott', 'Swadeshi means “of one’s own country” — using Indian-made goods. Boycott meant refusing British goods, schools, courts and titles; foreign cloth was burnt in bonfires.'),
        def('Extremists', 'Leaders such as Bal Gangadhar Tilak, Lala Lajpat Rai and Bipin Chandra Pal (“Lal–Bal–Pal”) who demanded Swaraj (self-rule) and used mass action like boycott. Tilak declared “Swaraj is my birthright and I shall have it.”'),
        p('The movement spread to Andhra: Bipin Chandra Pal’s speeches at Rajahmundry and other towns in 1907 inspired the Vande Mataram movement there. National schools, Swadeshi stores and industries started. Differences over methods split the Congress at Surat in 1907. The Muslim League was formed in 1906, and the Morley–Minto Reforms (1909) introduced separate electorates for Muslims. The partition of Bengal was annulled in 1911.'),
        keys('1905: Partition of Bengal by Curzon → Swadeshi.', 'Boycott of foreign goods; national education.', 'Lal–Bal–Pal: Extremists demanding Swaraj.', '1907 Surat split; 1909 separate electorates; 1911 partition annulled.'),
        remember('“Swaraj is my birthright and I shall have it” — Bal Gangadhar Tilak.'),
        tip('Moderates asked for reforms; Extremists demanded Swaraj through mass action.'),
      ],
      examples: [
        ex('How did the Moderates and Extremists differ in methods?', ['Moderates: petitions, appeals to British fairness, gradual reforms.', 'Extremists: self-reliance, boycott, mass participation, demand for Swaraj.'], 'Petitions vs mass action and Swaraj'),
        ex('Why did Indians oppose the partition of Bengal?', ['It divided a single Bengali-speaking people.', 'It was seen as an attempt to divide Hindus and Muslims.', 'It aimed to weaken nationalism in Bengal.'], 'They saw it as “divide and rule”'),
      ],
      practice: [
        mcq('mcq', 'Swadeshi began with the partition of Bengal.', [
          ['The partition of Bengal was announced by…', 'Lord Curzon', ['Lord Ripon', 'Lord Mountbatten', 'Lord Cornwallis'], 'Viceroy 1899–1905.', 'Curzon partitioned Bengal in 1905.'],
          ['Swadeshi means…', 'Using goods made in one’s own country', ['Using foreign goods', 'Paying taxes', 'Joining the army'], 'Swa = own; desh = country.', 'Swadeshi promoted Indian-made goods.'],
          ['“Lal–Bal–Pal” refers to…', 'Lajpat Rai, Tilak and Bipin Chandra Pal', ['Three British viceroys', 'Three rivers', 'Three Moderate leaders'], 'Extremist leaders.', 'They led the Extremist wing.'],
          ['The Congress split into Moderates and Extremists at…', 'Surat, 1907', ['Lahore, 1929', 'Lucknow, 1916', 'Bombay, 1885'], 'Two years after the partition.', 'The split happened at the Surat session in 1907.'],
          ['The partition of Bengal was cancelled in…', '1911', ['1905', '1919', '1947'], 'Announced at the Delhi Durbar.', 'It was annulled in 1911.'],
          ['Separate electorates for Muslims were introduced by…', 'The Morley–Minto Reforms of 1909', ['The Rowlatt Act', 'The Permanent Settlement', 'The Lucknow Pact'], 'Also called the Indian Councils Act 1909.', 'The 1909 reforms created separate electorates.'],
        ]),
        tapT('tap', 'Tap every method used in the Swadeshi movement.', [
          ['Boycott of British cloth', true], ['Bonfires of foreign goods', true], ['Setting up national schools', true], ['Opening Swadeshi stores and industries', true],
          ['Joining the British army in large numbers', false], ['Buying more Manchester cloth', false], ['Accepting British titles eagerly', false],
        ], ['Swadeshi = Indian goods; boycott = refuse British.', 'Buying Manchester cloth helped British mills.'], 'Swadeshi combined boycott with building Indian institutions.'),
        matchT('match', 'leader or event to its description', [
          ['Bal Gangadhar Tilak', '“Swaraj is my birthright”'], ['Lord Curzon', 'Partitioned Bengal, 1905'], ['Bipin Chandra Pal', 'Speeches in Andhra, 1907'],
          ['Surat, 1907', 'Congress split'], ['1906', 'Muslim League founded'], ['1911', 'Partition annulled'],
        ], ['Pal toured Rajahmundry.', 'Tilak is linked with Swaraj.']),
      ],
    },
    {
      id: 'ts8.ss.nm1.ww1', title: 'The First World War and its impact on India', prereqs: ['ts8.ss.nm1.swadeshi'],
      intro: [
        h('A war far away changes India'),
        photo('🗡️', 'More than a million Indian soldiers served overseas in the First World War (1914–18).'),
        p('When the First World War broke out in 1914, Britain drew India into it. More than a million Indian soldiers served in Europe, West Asia and Africa, and tens of thousands died. India contributed money, food and materials.'),
        p('At home, taxes and prices rose sharply, there were forced recruitments in some villages, and shortages hurt the poor. Yet Indian industries such as textiles and steel grew because imports fell. Nationalists expected Britain to reward India’s help with self-government.'),
        def('Home Rule Movement', 'Started in 1916 by Bal Gangadhar Tilak (April) and Annie Besant (September), demanding self-government within the British Empire, like Australia and Canada.'),
        def('Lucknow Pact (1916)', 'An agreement between the Congress and the Muslim League to make joint demands for self-government; the Moderates and Extremists also reunited that year.'),
        p('In 1917 the British Secretary of State Montagu announced that the goal was “responsible government” in India, gradually. Mahatma Gandhi returned from South Africa in January 1915 and began local struggles in Champaran (1917) and Kheda (1918). By 1919 Indians were impatient — the stage was set for mass movements.'),
        keys('Over a million Indians served in WWI.', 'Prices and taxes rose; industries grew.', 'Home Rule Leagues 1916 (Tilak, Besant).', 'Lucknow Pact 1916; Montagu Declaration 1917.'),
        remember('Annie Besant, an Irish woman, led a Home Rule League from Madras.'),
        tip('War impacts: economic (prices, taxes), political (Home Rule, unity), social (soldiers’ new experiences).'),
      ],
      examples: [
        ex('Give two economic effects of the First World War on India.', ['Prices of essential goods rose sharply.', 'Taxes and war loans increased.', 'Indian industries grew as imports fell.'], 'Rising prices and taxes; growth of Indian industry'),
        ex('Why was the Lucknow Pact important?', ['The Congress and the Muslim League made joint demands.', 'Moderates and Extremists also came together.', 'It showed national unity against British rule.'], 'It united the Congress and the League in joint demands'),
      ],
      practice: [
        mcq('mcq', 'The war years: 1914–18.', [
          ['The Home Rule Leagues were started in 1916 by…', 'Tilak and Annie Besant', ['Gandhi and Nehru', 'Curzon and Minto', 'Naoroji and Hume'], 'One Indian, one Irish.', 'Tilak and Besant led the two Home Rule Leagues.'],
          ['The Lucknow Pact (1916) was between…', 'The Congress and the Muslim League', ['Britain and Germany', 'Two princely states', 'The Nizam and the British'], 'Joint demands.', 'The Congress and League agreed on joint demands.'],
          ['An economic effect of WWI on India was…', 'A sharp rise in prices', ['Fall in taxes', 'End of all industry', 'Free food for all'], 'War costs money.', 'Wartime demand and shortages raised prices.'],
          ['Gandhi returned to India from South Africa in…', '1915', ['1885', '1905', '1930'], 'During the war.', 'Gandhi returned in January 1915.'],
          ['The First World War lasted from…', '1914 to 1918', ['1939 to 1945', '1905 to 1911', '1857 to 1858'], 'Four years.', 'WWI was fought from 1914 to 1918.'],
        ]),
        timelineT('tl', 'Arrange these events in order.', [
          [1905, 'Partition of Bengal', '1905'], [1914, 'First World War begins', '1914'], [1915, 'Gandhi returns to India', '1915'],
          [1916, 'Home Rule Leagues and Lucknow Pact', '1916'], [1917, 'Champaran Satyagraha', '1917'], [1918, 'First World War ends', '1918'],
        ], ['Bengal came before the war.', 'Champaran came the year after the Lucknow Pact.']),
        tapT('tap', 'Tap every effect of the First World War on India.', [
          ['Rise in prices of essential goods', true], ['Higher taxes and war loans', true], ['Growth of some Indian industries', true], ['Demand for Home Rule', true],
          ['Immediate independence for India', false], ['Fall in prices of food', false], ['End of British rule in 1918', false],
        ], ['Independence came only in 1947.', 'War made goods scarcer.'], 'The war raised prices and taxes, helped some industries and strengthened demands for self-rule.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11B — National Movement: The Last Phase 1919–1947
// =====================================================================================
const c11bEvents: EV[] = [
  [1917, 'Champaran Satyagraha', '1917'],
  [1919.03, 'Rowlatt Act passed', 'March 1919'],
  [1919.04, 'Jallianwala Bagh massacre at Amritsar', '13 April 1919'],
  [1920, 'Non-Cooperation and Khilafat movements launched', '1920'],
  [1922, 'Chauri Chaura incident; Non-Cooperation withdrawn', 'February 1922'],
  [1928, 'Simon Commission boycotted', '1928'],
  [1929, 'Lahore Congress demands Purna Swaraj', 'December 1929'],
  [1930, 'Dandi March (Salt Satyagraha)', 'March–April 1930'],
  [1942, 'Quit India Movement', 'August 1942'],
  [1943, 'Subhas Chandra Bose leads the INA; Azad Hind government', '1943'],
  [1946, 'Royal Indian Navy mutiny; Cabinet Mission', '1946'],
  [1947, 'Independence and Partition', '15 August 1947'],
];
const ch11b: USpec = {
  id: 'ts8.ss.ch11b', subject: 'social', title: 'National Movement – The Last Phase 1919–1947', source: src('11B'),
  objectives: [
    {
      id: 'ts8.ss.nm2.gandhi', title: 'Gandhi, the Rowlatt Act, Jallianwala Bagh, Khilafat and Non-Cooperation (1919–1929)', prereqs: ['ts8.ss.nm1.ww1'],
      intro: [
        h('A new kind of leader'),
        photo('🙏', 'Gandhi’s satyagraha — non-violent resistance based on truth — drew millions of ordinary people into the freedom struggle.'),
        def('Satyagraha', 'Gandhi’s method of non-violent resistance: opposing injustice through truth, peaceful protest and willingness to suffer, without hatred.'),
        stepsB(
          '1917–18: Gandhi leads satyagrahas for indigo farmers in Champaran, peasants in Kheda and mill workers in Ahmedabad.',
          'March 1919: the Rowlatt Act allows imprisonment without trial; Gandhi calls a nationwide hartal.',
          '13 April 1919: General Dyer’s troops fire on a peaceful crowd at Jallianwala Bagh, Amritsar; hundreds are killed.',
          '1920: the Khilafat movement (for the Caliph of Turkey) joins hands with the Non-Cooperation Movement — boycott of schools, courts, councils, foreign cloth and titles.',
          'February 1922: a crowd burns a police station at Chauri Chaura; Gandhi withdraws the movement because it turned violent.',
          '1923–29: Swaraj Party enters councils; Simon Commission (1928) boycotted with “Simon Go Back”; Lahore Congress (December 1929) declares Purna Swaraj (complete independence) as the goal.',
        ),
        p('In Andhra, Alluri Sitarama Raju led the Rampa rebellion (1922–24) of tribal people against forest laws and exploitation. In many places, peasants, students, women and workers joined the movement for the first time.'),
        keys('Rowlatt Act and Jallianwala Bagh (1919) angered the nation.', 'Non-Cooperation + Khilafat (1920) — first mass movement.', 'Chauri Chaura (1922) → movement withdrawn.', 'Lahore 1929: Purna Swaraj; 26 January 1930 celebrated as Independence Day.'),
        remember('26 January was chosen as Republic Day in 1950 to honour the Purna Swaraj pledge of 26 January 1930.'),
        tip('Non-cooperation = withdraw cooperation from the British government (schools, courts, councils, goods, titles).'),
      ],
      examples: [
        ex('Why did Gandhi withdraw the Non-Cooperation Movement in 1922?', ['At Chauri Chaura a crowd set fire to a police station, killing policemen.', 'Gandhi believed the movement must be strictly non-violent.', 'He felt people were not yet ready, so he stopped it.'], 'Because of the violence at Chauri Chaura'),
        ex('Why did the Rowlatt Act anger Indians?', ['It allowed people to be arrested and jailed without trial.', 'This came right after Indians had helped Britain in the war.', 'It was seen as a “black act” against civil liberties.'], 'It allowed imprisonment without trial'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1917–1929 in time order.', c11bEvents.slice(0, 7), ['Champaran came first.', 'The massacre followed the Act by about a month.']),
        mcq('mcq', 'Key events 1919–1929.', [
          ['The Jallianwala Bagh massacre took place on…', '13 April 1919', ['15 August 1947', '26 January 1930', '9 August 1942'], 'Baisakhi day in Amritsar.', 'General Dyer ordered firing on 13 April 1919.'],
          ['The Rowlatt Act allowed the government to…', 'Imprison people without trial', ['Give voting rights to all', 'Abolish land revenue', 'Free all prisoners'], 'Called a “black act”.', 'It permitted detention without trial.'],
          ['The Non-Cooperation Movement was withdrawn after…', 'Chauri Chaura (1922)', ['Dandi March', 'Quit India', 'Simon Commission'], 'Violence broke out.', 'Gandhi withdrew it after the Chauri Chaura violence.'],
          ['“Purna Swaraj” was declared the goal at the…', 'Lahore Congress, 1929', ['Surat Congress, 1907', 'Bombay Congress, 1885', 'Lucknow Congress, 1916'], 'On the bank of the Ravi.', 'The Lahore session under Nehru adopted complete independence.'],
          ['The Simon Commission was boycotted because…', 'It had no Indian member', ['It was too large', 'It was led by Gandhi', 'It gave independence'], '“Simon Go Back”.', 'An all-British commission to decide India’s future was unacceptable.'],
          ['The Rampa rebellion in Andhra (1922–24) was led by…', 'Alluri Sitarama Raju', ['Komaram Bheem', 'Tanguturi Prakasam', 'Potti Sriramulu'], 'A tribal uprising.', 'Alluri Sitarama Raju led the Rampa rebellion.'],
        ]),
        matchT('match', 'event to its description', [
          ['Champaran, 1917', 'Satyagraha for indigo farmers'], ['Rowlatt Act, 1919', 'Arrest without trial'], ['Jallianwala Bagh', 'Firing by General Dyer'],
          ['Khilafat', 'Support for the Caliph of Turkey'], ['Chauri Chaura', 'Violence that ended Non-Cooperation'], ['Lahore, 1929', 'Purna Swaraj resolution'],
        ], ['Start with places you know.', 'Khilafat is linked to Turkey.']),
      ],
    },
    {
      id: 'ts8.ss.nm2.mass', title: 'Civil Disobedience (Salt Satyagraha) and Quit India', prereqs: ['ts8.ss.nm2.gandhi'],
      intro: [
        h('A handful of salt shakes an empire'),
        photo('🌅', 'Salt was used by every family — so a tax on it touched everyone.'),
        p('Salt is needed by every person, rich or poor, and the British held a monopoly over making it and taxed it. Gandhi chose salt as a symbol. On 12 March 1930 he set out from Sabarmati Ashram with 78 followers and walked about 385 km (240 miles) in 24 days to Dandi on the Gujarat coast. On 6 April 1930 he picked up natural salt, breaking the Salt Law.'),
        def('Civil Disobedience', 'Deliberately and peacefully breaking unjust laws and accepting the punishment, to force the government to change.'),
        p('Across India people made salt, boycotted foreign cloth and liquor shops, and refused to pay taxes. Women took part in huge numbers. Over 90,000 people were arrested. The Gandhi–Irwin Pact (1931) and the Round Table Conferences in London (1930–32) followed.'),
        def('Quit India Movement', 'Launched on 8 August 1942 at Bombay, demanding that the British leave India immediately. Gandhi gave the call “Do or Die”. Leaders were arrested at once, but people continued with strikes, protests and underground activity.'),
        keys('Dandi March: 12 March–6 April 1930, about 385 km.', 'Civil Disobedience: breaking unjust laws non-violently.', 'Quit India: 8 August 1942, “Do or Die”.', 'Mass participation of women, peasants, students.'),
        remember('9 August is observed as August Kranti Day, marking the start of Quit India.'),
        tip('Speed check: 385 km ÷ 24 days ≈ 16 km a day — at the age of 60!'),
      ],
      examples: [
        ex('Gandhi walked about 385 km in 24 days. What was his average distance per day?', ['Average = distance ÷ days.', '385 ÷ 24 ≈ 16 km per day.'], 'About 16 km per day'),
        ex('Why was salt a clever symbol for a national movement?', ['Every person uses salt, so the tax hurt everyone, especially the poor.', 'Making salt was simple and anyone could break the law.', 'It united people across regions, classes and religions.'], 'It touched everyone and anyone could join'),
      ],
      practice: [
        tp('rate', (r) => {
          const [d, days] = r.pick<[number, number]>([[385, 24], [240, 24], [390, 24], [360, 24], [384, 24]]);
          const isMiles = d === 240;
          return numQ(`The Dandi March covered about ${d} ${isMiles ? 'miles' : 'km'} in ${days} days. What was the average distance walked per day (${isMiles ? 'miles' : 'km'})? Round to 1 decimal place.`, Math.round((d / days) * 10) / 10, ['Average per day = total distance ÷ number of days.', `${d} ÷ ${days}`], [`${d} ÷ ${days} = ${Math.round((d / days) * 10) / 10}`], [], 0.01);
        }, 1),
        mcq('mcq', 'Salt Satyagraha 1930; Quit India 1942.', [
          ['The Dandi March began on…', '12 March 1930', ['8 August 1942', '13 April 1919', '15 August 1947'], 'From Sabarmati Ashram.', 'Gandhi set out on 12 March 1930.'],
          ['“Do or Die” was the call given during the…', 'Quit India Movement', ['Non-Cooperation Movement', 'Swadeshi Movement', 'Khilafat Movement'], '1942.', 'Gandhi gave this call on 8 August 1942.'],
          ['Civil Disobedience means…', 'Peacefully breaking unjust laws', ['Violent revolt', 'Obeying all laws', 'Leaving the country'], 'Disobey — but civilly.', 'People broke unjust laws non-violently and accepted punishment.'],
          ['Why did Gandhi choose salt?', 'Everyone used it and the tax hurt the poor', ['Salt was a luxury', 'Only the rich used salt', 'Salt was untaxed'], 'A universal need.', 'The salt tax affected every household.'],
          ['The Quit India Movement was launched in…', '1942', ['1930', '1920', '1947'], 'During the Second World War.', 'It began on 8 August 1942.'],
          ['Which pact followed the Civil Disobedience Movement in 1931?', 'Gandhi–Irwin Pact', ['Lucknow Pact', 'Poona Pact', 'Standstill Agreement'], 'Named after the Viceroy.', 'Gandhi and Viceroy Irwin signed a pact in 1931.'],
        ]),
        tapT('tap', 'Tap every action that was part of the Civil Disobedience Movement.', [
          ['Making salt from sea water', true], ['Picketing liquor and foreign-cloth shops', true], ['Refusing to pay certain taxes', true], ['Women leading protests', true],
          ['Burning a police station at Chauri Chaura', false], ['Joining the Simon Commission', false], ['Signing the Lucknow Pact', false],
        ], ['Civil Disobedience began in 1930.', 'Chauri Chaura was 1922.'], 'Salt-making, picketing and tax refusal were non-violent acts of civil disobedience.'),
      ],
    },
    {
      id: 'ts8.ss.nm2.independence', title: 'Subhas Chandra Bose and the INA; independence and partition', prereqs: ['ts8.ss.nm2.mass'],
      intro: [
        h('The final years'),
        photo('🚩', 'On 15 August 1947 the tricolour was raised as India became independent.'),
        p('Subhas Chandra Bose was elected Congress president in 1938 and 1939 but differed with Gandhi and formed the Forward Bloc. During the Second World War he escaped from India (1941) and in 1943 took charge of the Indian National Army (INA) in Southeast Asia, formed from Indian soldiers taken prisoner by Japan and Indians living there. He set up the Azad Hind government in Singapore in October 1943 and gave the slogans “Delhi Chalo” and “Give me blood and I will give you freedom.” The INA had a women’s regiment named after Rani Lakshmibai.'),
        p('The INA could not win militarily, but the trials of INA officers at the Red Fort (1945–46) stirred the whole country. In February 1946 sailors of the Royal Indian Navy revolted in Bombay. Britain, weakened by war, sent the Cabinet Mission (1946). The Muslim League demanded a separate Pakistan; communal violence spread, beginning with Direct Action Day (16 August 1946).'),
        def('Partition', 'The division of British India into India and Pakistan in August 1947, based on the Mountbatten Plan of 3 June 1947.'),
        p('India became independent on 15 August 1947. Partition was accompanied by terrible violence: an estimated 10–15 million people were displaced and several hundred thousand (some estimates up to a million) were killed. Gandhi worked for peace in Noakhali and Calcutta; he was assassinated on 30 January 1948.'),
        keys('Bose: Forward Bloc (1939), INA and Azad Hind government (1943).', 'INA trials and RIN mutiny (1945–46) shook British rule.', 'Mountbatten Plan 3 June 1947 → Partition.', '15 August 1947: independence, with great human suffering.'),
        remember('“Jai Hind” became a popular greeting through the INA.'),
        tip('Remember the joy and the tragedy of 1947 together — independence and partition.'),
      ],
      examples: [
        ex('Why did the INA trials of 1945–46 matter, even though the INA lost militarily?', ['People across religions and regions supported the accused officers.', 'It showed that the loyalty of Indian soldiers to the British could no longer be counted on.', 'This pushed Britain to leave sooner.'], 'They united public opinion and shook British confidence in the army'),
        ex('Arrange: Quit India, Azad Hind government, Mountbatten Plan, RIN mutiny.', ['Quit India — 1942.', 'Azad Hind government — 1943.', 'RIN mutiny — February 1946.', 'Mountbatten Plan — 3 June 1947.'], '1942 → 1943 → 1946 → 1947'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1929–1947 in time order.', c11bEvents.slice(6), ['Purna Swaraj came first.', 'Independence came last.'], 4, 2),
        mcq('mcq', 'Bose, the INA and the road to 1947.', [
          ['The Azad Hind government was proclaimed by Bose in…', 'Singapore, 1943', ['Delhi, 1947', 'Lahore, 1929', 'London, 1931'], 'In Southeast Asia during WWII.', 'Bose proclaimed it in Singapore in October 1943.'],
          ['“Delhi Chalo” was the slogan of…', 'Subhas Chandra Bose and the INA', ['Bal Gangadhar Tilak', 'Dadabhai Naoroji', 'Lord Mountbatten'], 'March to Delhi.', 'Bose urged the INA to march to Delhi.'],
          ['The women’s regiment of the INA was named after…', 'Rani Lakshmibai', ['Sarojini Naidu', 'Annie Besant', 'Kasturba Gandhi'], 'The Rani of Jhansi.', 'It was the Rani of Jhansi Regiment.'],
          ['The plan that divided British India was announced on…', '3 June 1947', ['15 August 1947', '26 January 1950', '8 August 1942'], 'Named after the last Viceroy.', 'The Mountbatten Plan was announced on 3 June 1947.'],
          ['Bose formed the Forward Bloc in…', '1939', ['1919', '1947', '1885'], 'After resigning as Congress president.', 'He formed the Forward Bloc in 1939.'],
          ['Gandhi was assassinated on…', '30 January 1948', ['15 August 1947', '2 October 1948', '26 January 1950'], 'Observed as Martyrs’ Day.', 'Gandhi was killed on 30 January 1948.'],
        ]),
        matchT('match', 'person or event to its description', [
          ['Subhas Chandra Bose', 'Led the INA'], ['INA trials', 'Held at the Red Fort, 1945–46'], ['RIN mutiny', 'Revolt of naval ratings, Bombay 1946'],
          ['Mountbatten Plan', 'Partition plan, 3 June 1947'], ['Direct Action Day', '16 August 1946'], ['15 August 1947', 'Independence Day'],
        ], ['Two are military events.', 'Partition plan came before independence.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Freedom Movement in Hyderabad State
// =====================================================================================
const c12Events: EV[] = [
  [1724, 'Asaf Jahi (Nizam) dynasty established in Hyderabad', '1724'],
  [1857, 'Attack on the British Residency at Hyderabad led by Turrebaz Khan', 'July 1857'],
  [1901, 'Sri Krishnadevaraya Andhra Bhasha Nilayam library founded in Hyderabad', '1901'],
  [1911, 'Mir Osman Ali Khan becomes the last Nizam', '1911'],
  [1921, 'Andhra Jana Sangham formed', '1921'],
  [1930, 'First Andhra Maha Sabha conference at Jogipet', '1930'],
  [1938, 'Hyderabad State Congress formed and banned; satyagraha', '1938'],
  [1946, 'Telangana armed struggle begins', '1946'],
  [1948, 'Police Action; Hyderabad joins India', 'September 1948'],
  [1951, 'Armed struggle withdrawn', '1951'],
];
const ch12: USpec = {
  id: 'ts8.ss.ch12', subject: 'social', title: 'Freedom Movement in Hyderabad State', source: src(12),
  objectives: [
    {
      id: 'ts8.ss.hyd.early', title: 'Early nationalism, the feudal system, language, religion and the last Nizam', prereqs: ['ts8.ss.land.nizam'],
      intro: [
        h('A princely state under the Nizams'),
        photo('👑', 'Hyderabad was the largest princely state in India, ruled by the Asaf Jahi Nizams from 1724 to 1948.'),
        p('Hyderabad State included today’s Telangana and parts of Maharashtra (Marathwada) and Karnataka. It was a princely state: the Nizam ruled internally but accepted British supremacy (through the Subsidiary Alliance of 1798). In 1857, Turrebaz Khan led an attack on the British Residency in Hyderabad — an early sign of resistance.'),
        p('The state was feudal: jagirdars, deshmukhs and doras held power over villages. Most people spoke Telugu, Marathi or Kannada, but Urdu was the language of administration and of Osmania University (founded 1918). The ruler and most nobles were Muslim, while most of the population was Hindu; the large majority of people of all religions were poor peasants. There were few civil liberties — meetings, newspapers and associations needed permission and were often banned.'),
        def('Princely state', 'A state ruled by an Indian king (raja or nawab) under British supremacy, not directly by the British.'),
        p('Mir Osman Ali Khan, the seventh and last Nizam, ruled from 1911 to 1948. His reign saw the building of Osmania University, the High Court, Osmania Hospital and the Osman Sagar and Himayat Sagar reservoirs; but political rights were denied, and he wanted to remain independent of India in 1947.'),
        keys('Asaf Jahi dynasty: 1724–1948.', 'Feudal land system: jagirdars, deshmukhs, doras.', 'Urdu as official language; most people spoke Telugu, Marathi or Kannada.', 'Last Nizam: Mir Osman Ali Khan (1911–1948).'),
        remember('Osmania University, founded in 1918, taught in Urdu.'),
        tip('A balanced answer mentions both the Nizam’s modern public works and the lack of democratic rights.'),
      ],
      examples: [
        ex('Why did language become a political issue in Hyderabad State?', ['Most people spoke Telugu, Marathi or Kannada.', 'Administration and higher education used Urdu.', 'People wanted to use and develop their own languages, so language movements began.'], 'People’s languages were not used in administration and education'),
        ex('Give two achievements and one limitation of Mir Osman Ali Khan’s rule.', ['Achievements: Osmania University (1918); reservoirs like Osman Sagar; hospitals and High Court.', 'Limitation: denial of civil liberties and democratic rights.'], 'Public works vs lack of democracy'),
      ],
      practice: [
        mcq('mcq', 'Recall the nature of the Nizam’s rule.', [
          ['The Asaf Jahi dynasty ruled Hyderabad from…', '1724 to 1948', ['1857 to 1947', '1600 to 1700', '1947 to 1956'], 'Founded by Nizam-ul-Mulk.', 'The Asaf Jahis ruled from 1724 until 1948.'],
          ['The last Nizam of Hyderabad was…', 'Mir Osman Ali Khan', ['Nizam-ul-Mulk', 'Tipu Sultan', 'Salar Jung I'], 'Ruled 1911–1948.', 'Mir Osman Ali Khan was the seventh and last Nizam.'],
          ['Osmania University, founded in 1918, taught in…', 'Urdu', ['Telugu only', 'Sanskrit', 'French'], 'The official language of the state.', 'It was a pioneering Urdu-medium university.'],
          ['In 1857 the British Residency in Hyderabad was attacked under the leadership of…', 'Turrebaz Khan', ['Komaram Bheem', 'Suravaram Pratapa Reddy', 'Swami Ramananda Tirtha'], 'A Rohilla leader.', 'Turrebaz Khan led the attack in July 1857.'],
          ['A princely state was…', 'Ruled by an Indian ruler under British supremacy', ['Ruled directly by the British Parliament', 'A colony of France', 'A state with an elected government'], 'Indirect rule.', 'Princely rulers had internal control but accepted British paramountcy.'],
        ]),
        timelineT('tl', 'Arrange these events in Hyderabad’s history in order.', c12Events, ['The dynasty began in the 18th century.', 'The armed struggle came after the State Congress.']),
        tapT('tap', 'Tap every feature of Hyderabad State before 1948.', [
          ['Urdu as the official language', true], ['Powerful jagirdars and deshmukhs', true], ['Restrictions on meetings and newspapers', true], ['A ruler under British supremacy', true],
          ['Elected state government by universal vote', false], ['Telugu as the sole language of administration', false], ['Directly ruled by the British Parliament', false],
        ], ['Think feudal and princely.', 'There was no universal adult franchise.'], 'Hyderabad was a feudal princely state with Urdu administration and limited liberties.'),
      ],
    },
    {
      id: 'ts8.ss.hyd.orgs', title: 'Andhra Jana Sangham, the library movement, Andhra Maha Sabha and the State Congress', prereqs: ['ts8.ss.hyd.early'],
      intro: [
        h('Libraries, language and political awakening'),
        photo('📚', 'Libraries and reading rooms were the first centres of awakening in Telangana.'),
        p('Since political meetings were restricted, Telugu people first organised around language and culture. The Sri Krishnadevaraya Andhra Bhasha Nilayam was founded in Hyderabad in 1901, followed by the Rajaraja Narendra Andhra Bhasha Nilayam at Hanamkonda (1904) and many village libraries. These became places to read newspapers, discuss ideas and meet.'),
        def('Andhra Jana Sangham (1921)', 'Formed after a Telugu speaker was jeered at a social conference in Hyderabad for speaking in Telugu. Leaders such as Madapati Hanumantha Rao promoted Telugu language, libraries, schools and the people’s grievances.'),
        def('Andhra Maha Sabha (1930)', 'Grew out of the Jana Sangham; its first conference was held at Jogipet in 1930 under Suravaram Pratapa Reddy. Over time it took up peasant issues — vetti, illegal levies and land — and later became the main platform of the peasant movement.'),
        def('Hyderabad State Congress (1938)', 'Formed to demand responsible government; banned immediately, it launched satyagraha. Swami Ramananda Tirtha was a leading figure.'),
        p('Women’s organisations, Arya Samaj and student groups (such as the Vande Mataram protests at Osmania University in 1938) also spread awareness. Golconda Patrika (1926), edited by Suravaram Pratapa Reddy, and other journals gave voice to the people.'),
        keys('Libraries from 1901: first centres of awakening.', 'Andhra Jana Sangham 1921 — Madapati Hanumantha Rao.', 'Andhra Maha Sabha 1930, Jogipet — Suravaram Pratapa Reddy.', 'State Congress 1938 — Swami Ramananda Tirtha.'),
        remember('Madapati Hanumantha Rao is remembered as “Andhra Pitamaha” for his role in Telangana’s awakening.'),
        tip('Sequence: library → Jana Sangham → Maha Sabha → State Congress — from culture to politics.'),
      ],
      examples: [
        ex('Why did the awakening in Telangana begin with libraries and language societies?', ['Political meetings were restricted by the Nizam’s government.', 'Libraries and language societies were allowed more easily.', 'They became places to share news and ideas, preparing people for politics.'], 'Because political activity was restricted, culture became the first platform'),
        ex('Arrange: State Congress, Andhra Maha Sabha, Andhra Jana Sangham, Krishnadevaraya Bhasha Nilayam.', ['Bhasha Nilayam — 1901.', 'Jana Sangham — 1921.', 'Maha Sabha — 1930.', 'State Congress — 1938.'], '1901 → 1921 → 1930 → 1938'),
      ],
      practice: [
        timelineT('tl', 'Arrange these organisations in the order they were formed.', [
          [1901, 'Sri Krishnadevaraya Andhra Bhasha Nilayam', '1901'], [1904, 'Rajaraja Narendra Andhra Bhasha Nilayam, Hanamkonda', '1904'], [1921, 'Andhra Jana Sangham', '1921'],
          [1926, 'Golconda Patrika started', '1926'], [1930, 'Andhra Maha Sabha (Jogipet conference)', '1930'], [1938, 'Hyderabad State Congress', '1938'],
        ], ['Libraries came first.', 'The State Congress came last.']),
        mcq('mcq', 'Link each organisation with its leader and year.', [
          ['The first conference of the Andhra Maha Sabha was held at…', 'Jogipet (1930)', ['Bombay (1885)', 'Surat (1907)', 'Warangal (1948)'], 'In Medak district.', 'It met at Jogipet in 1930 under Suravaram Pratapa Reddy.'],
          ['Who is called “Andhra Pitamaha”?', 'Madapati Hanumantha Rao', ['Suravaram Pratapa Reddy', 'Swami Ramananda Tirtha', 'Burgula Ramakrishna Rao'], 'A leader of the Andhra Jana Sangham.', 'Madapati Hanumantha Rao earned this title.'],
          ['The Hyderabad State Congress was formed in…', '1938', ['1921', '1901', '1948'], 'It was banned at once.', 'It was formed in 1938 and launched satyagraha.'],
          ['Golconda Patrika was edited by…', 'Suravaram Pratapa Reddy', ['Bal Gangadhar Tilak', 'Swami Ramananda Tirtha', 'Kandukuri Veeresalingam'], 'Also presided over Jogipet.', 'Suravaram Pratapa Reddy edited Golconda Patrika.'],
          ['The first Telugu library in Hyderabad (1901) was…', 'Sri Krishnadevaraya Andhra Bhasha Nilayam', ['Osmania University Library', 'Salar Jung Museum', 'State Central Library'], 'Named after a great Vijayanagara king.', 'It was founded in 1901.'],
        ]),
        matchT('match', 'leader or organisation to its description', [
          ['Madapati Hanumantha Rao', 'Andhra Jana Sangham; “Andhra Pitamaha”'], ['Suravaram Pratapa Reddy', 'Golconda Patrika; Jogipet conference'], ['Swami Ramananda Tirtha', 'Leader of the State Congress'],
          ['Andhra Jana Sangham', 'Formed 1921'], ['Andhra Maha Sabha', 'Took up peasant issues from 1930'], ['Library movement', 'Started with a Telugu library in 1901'],
        ], ['Three people, three organisations.', 'Jogipet is linked with the Maha Sabha.']),
      ],
    },
    {
      id: 'ts8.ss.hyd.struggle', title: 'The Telangana armed struggle, women in the struggle and the merger with India', prereqs: ['ts8.ss.hyd.orgs'],
      intro: [
        h('Peasants rise against the doras'),
        photo('🌾', 'The struggle was about land, freedom from vetti and an end to feudal oppression.'),
        p('By the 1940s, the Andhra Maha Sabha, with communist leadership in many areas, organised peasants against vetti, illegal levies and eviction. On 4 July 1946, Doddi Komaraiah was killed by the men of a landlord in Kadavendi (Jangaon); his death sparked the armed struggle. Chakali Ilamma (Ailamma), a washerwoman of Palakurthi, had already resisted the deshmukh who tried to seize her harvest and land. Village committees (sanghams) took over land of big landlords and distributed it among the poor; vetti was abolished in these villages.'),
        def('Razakars', 'An armed militia led by Qasim Razvi that supported the Nizam’s plan to stay independent and attacked villagers and opponents in 1947–48.'),
        p('Women played major roles — as fighters, couriers and organisers. Mallu Swarajyam, Arutla Kamala Devi, Chityala Ilamma and many others are remembered. After independence the Nizam signed a Standstill Agreement (November 1947) but did not join India. Violence by Razakars grew. On 13 September 1948 the Indian Army entered the state (“Operation Polo”, the Police Action); on 17 September 1948 the Nizam’s forces surrendered and Hyderabad became part of India.'),
        stepsB('4 July 1946: death of Doddi Komaraiah; armed struggle begins.', 'November 1947: Standstill Agreement with India.', '13–17 September 1948: Police Action; Hyderabad joins India on 17 September.', '1949: Hyderabad Jagirdari Abolition Regulation.', '1951: the armed struggle is withdrawn.', '1952: first elected government under Burgula Ramakrishna Rao.', '1 November 1956: Telangana region merged into Andhra Pradesh.'),
        keys('Armed struggle 1946–51 against doras, vetti and the Nizam’s rule.', 'Doddi Komaraiah and Chakali Ilamma: symbols of resistance.', 'Women fighters: Mallu Swarajyam, Arutla Kamala Devi.', '17 September 1948: Hyderabad becomes part of India.'),
        remember('17 September is observed in Telangana as the day Hyderabad State joined the Indian Union.'),
        tip('Write about the struggle with care: it was a peasant movement for land and dignity, and also a complex period of violence on several sides.'),
      ],
      examples: [
        ex('Why is Chakali Ilamma remembered?', ['She was a washerwoman of Palakurthi who refused to give up her land and harvest to a powerful deshmukh.', 'With the Sangham’s help she resisted.', 'She became a symbol of courage of ordinary people, especially women and backward castes.'], 'For resisting a powerful landlord — a symbol of courage'),
        ex('What was the Police Action of 1948?', ['The Nizam had not joined India and Razakar violence was growing.', 'The Indian Army moved into Hyderabad on 13 September 1948.', 'The Nizam’s forces surrendered on 17 September, and Hyderabad joined India.'], 'Indian military operation that brought Hyderabad into India'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events of 1946–1956 in time order.', [
          [1946, 'Doddi Komaraiah killed; armed struggle begins', '4 July 1946'], [1947, 'Standstill Agreement with India', 'November 1947'],
          [1948, 'Police Action; Hyderabad joins India', '17 September 1948'], [1951, 'Armed struggle withdrawn', '1951'],
          [1952, 'First elected government (Burgula Ramakrishna Rao)', '1952'], [1956, 'Telangana merged into Andhra Pradesh', '1 November 1956'],
        ], ['The struggle began before independence.', 'Andhra Pradesh was formed in 1956.']),
        mcq('mcq', 'Key people and dates of 1946–48.', [
          ['The armed struggle was sparked by the death of…', 'Doddi Komaraiah (1946)', ['Komaram Bheem (1940)', 'Turrebaz Khan (1857)', 'Alluri Sitarama Raju (1924)'], 'At Kadavendi.', 'Doddi Komaraiah was killed on 4 July 1946.'],
          ['Hyderabad became part of India on…', '17 September 1948', ['15 August 1947', '26 January 1950', '1 November 1956'], 'After the Police Action.', 'The Nizam’s forces surrendered on 17 September 1948.'],
          ['The Razakars were led by…', 'Qasim Razvi', ['Swami Ramananda Tirtha', 'Ravi Narayan Reddy', 'Mallu Swarajyam'], 'A militia leader.', 'Qasim Razvi led the Razakars.'],
          ['Which woman is remembered for resisting a deshmukh in Palakurthi?', 'Chakali Ilamma', ['Sarojini Naidu', 'Rani Lakshmibai', 'Annie Besant'], 'A washerwoman.', 'Chakali Ilamma resisted the deshmukh’s attempt to seize her land.'],
          ['The military operation of September 1948 is known as…', 'Operation Polo (Police Action)', ['Operation Blue Star', 'Quit India', 'Operation Flood'], 'Named after a sport.', 'Operation Polo integrated Hyderabad into India.'],
          ['One major demand of the peasant struggle was…', 'An end to vetti and land for the tiller', ['More taxes', 'Return of the British', 'Abolition of schools'], 'Forced labour.', 'Peasants fought against vetti and for land.'],
        ]),
        matchT('match', 'person to the role', [
          ['Doddi Komaraiah', 'Martyr whose death began the struggle'], ['Chakali Ilamma', 'Washerwoman who resisted a deshmukh'], ['Mallu Swarajyam', 'Woman fighter in the struggle'],
          ['Qasim Razvi', 'Leader of the Razakars'], ['Burgula Ramakrishna Rao', 'First elected Chief Minister of Hyderabad State'], ['Mir Osman Ali Khan', 'Last Nizam'],
        ], ['One led a militia.', 'Burgula took office in 1952.']),
      ],
    },
  ],
};


// =====================================================================================
// Chapter 13 — The Indian Constitution
// =====================================================================================
const c13Events: EV[] = [
  [1946.12, 'Constituent Assembly meets for the first time', '9 December 1946'],
  [1947.08, 'Drafting Committee set up under Dr B. R. Ambedkar', '29 August 1947'],
  [1949, 'Constitution adopted', '26 November 1949'],
  [1950, 'Constitution comes into force; India becomes a republic', '26 January 1950'],
  [1952, 'First general elections completed', '1951–52'],
  [1976, '42nd Amendment adds “socialist” and “secular” to the Preamble', '1976'],
];
const ch13: USpec = {
  id: 'ts8.ss.ch13', subject: 'social', title: 'The Indian Constitution', source: src(13),
  objectives: [
    {
      id: 'ts8.ss.const.making', title: 'Making of the Constitution and the Constituent Assembly', prereqs: ['ts8.ss.nm2.independence'],
      intro: [
        h('Writing the rule book of a new nation'),
        photo('📖', 'The Constitution of India is one of the longest written constitutions in the world.'),
        def('Constitution', 'The basic law of a country that sets out how the government is formed, what powers it has, and what rights citizens enjoy. All other laws must follow it.'),
        def('Constituent Assembly', 'The body of elected representatives that drafted India’s Constitution. Its members were elected mainly by the provincial assemblies in 1946; after partition it had 299 members, including 15 women.'),
        stepsB('9 December 1946: the Constituent Assembly meets for the first time; Dr Rajendra Prasad is later elected its president.', '29 August 1947: a Drafting Committee is formed with Dr B. R. Ambedkar as chairman.', 'The draft is debated clause by clause for nearly three years.', '26 November 1949: the Constitution is adopted (now observed as Constitution Day).', '26 January 1950: it comes into force; India becomes a republic.'),
        p('The Assembly took 2 years, 11 months and 18 days. Members came from different regions, religions, castes and political views — for example, Ambedkar, Nehru, Patel, Maulana Azad, Sarojini Naidu, Hansa Mehta and Durgabai Deshmukh (who was from Andhra). They studied constitutions of other countries but shaped them for Indian conditions.'),
        keys('Assembly first met 9 Dec 1946.', 'Ambedkar chaired the Drafting Committee.', 'Adopted 26 Nov 1949; in force 26 Jan 1950.', 'Took about 3 years of debate.'),
        remember('Dr B. R. Ambedkar is called the chief architect of the Indian Constitution.'),
        tip('26 November → Constitution Day; 26 January → Republic Day.'),
      ],
      examples: [
        ex('Why was 26 January chosen as the date for the Constitution to come into force?', ['On 26 January 1930 the Congress had celebrated Purna Swaraj Day.', 'Choosing it honoured that pledge.'], 'To honour the Purna Swaraj pledge of 26 January 1930'),
        ex('How long did the Assembly take to make the Constitution?', ['From 9 December 1946 to 26 November 1949.', 'About 2 years, 11 months and 18 days.'], 'Nearly three years'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events in the making of the Constitution in order.', c13Events, ['The Assembly met before the Drafting Committee was set up.', 'Adoption came before it came into force.']),
        mcq('mcq', 'Remember the key people and dates.', [
          ['The chairman of the Drafting Committee was…', 'Dr B. R. Ambedkar', ['Dr Rajendra Prasad', 'Jawaharlal Nehru', 'Sardar Patel'], 'Chief architect of the Constitution.', 'Ambedkar chaired the Drafting Committee.'],
          ['The President of the Constituent Assembly was…', 'Dr Rajendra Prasad', ['Dr B. R. Ambedkar', 'Mahatma Gandhi', 'Lord Mountbatten'], 'Later India’s first President.', 'Rajendra Prasad presided over the Assembly.'],
          ['The Constitution came into force on…', '26 January 1950', ['15 August 1947', '26 November 1949', '9 December 1946'], 'Republic Day.', 'It came into force on 26 January 1950.'],
          ['Constitution Day is observed on…', '26 November', ['26 January', '2 October', '14 November'], 'The day of adoption.', 'The Constitution was adopted on 26 November 1949.'],
          ['A constitution is…', 'The basic law that all other laws must follow', ['A list of festivals', 'A school timetable', 'A tax receipt'], 'The highest law.', 'The constitution is the supreme law of the land.'],
          ['The Constituent Assembly first met on…', '9 December 1946', ['15 August 1947', '26 January 1950', '1 November 1956'], 'Before independence.', 'It met first on 9 December 1946.'],
        ]),
        matchT('match', 'person or date to its role', [
          ['B. R. Ambedkar', 'Chairman, Drafting Committee'], ['Rajendra Prasad', 'President of the Assembly'], ['Durgabai Deshmukh', 'Woman member from Andhra'],
          ['26 November 1949', 'Constitution adopted'], ['26 January 1950', 'Constitution in force'], ['9 December 1946', 'First meeting'],
        ], ['Two people led, one was a member.', 'Adoption came before enforcement.']),
      ],
    },
    {
      id: 'ts8.ss.const.preamble', title: 'The dream and the promise: values in the Preamble', prereqs: ['ts8.ss.const.making'],
      intro: [
        h('The Constitution’s first page'),
        photo('⚖', 'The Preamble sums up the values the Constitution promises every citizen.'),
        p('The Preamble begins “We, the People of India” — showing that the Constitution draws its authority from the people. It declares India to be a Sovereign, Socialist, Secular, Democratic Republic, and promises its citizens Justice, Liberty, Equality and Fraternity.'),
        def('Sovereign', 'India makes its own decisions; no outside power controls it.'),
        def('Socialist', 'The State works to reduce inequalities of wealth and income.'),
        def('Secular', 'The State has no official religion and treats all religions with equal respect; citizens are free to follow any religion.'),
        def('Democratic Republic', 'Government by elected representatives; the head of state (President) is elected, not hereditary.'),
        p('Justice — social, economic and political. Liberty of thought, expression, belief, faith and worship. Equality of status and opportunity. Fraternity — a sense of brotherhood assuring the dignity of the individual and the unity and integrity of the nation. The words “socialist” and “secular” (and “integrity”) were added by the 42nd Amendment in 1976, though these ideas were already present in the Constitution.'),
        keys('“We, the People of India” — power comes from the people.', 'Sovereign, Socialist, Secular, Democratic, Republic.', 'Justice, Liberty, Equality, Fraternity.', '42nd Amendment (1976) added “socialist”, “secular”, “integrity”.'),
        remember('Republic = elected head of state, not a king or queen.'),
        tip('Order of the five words: S-S-S-D-R (Sovereign, Socialist, Secular, Democratic, Republic).'),
      ],
      examples: [
        ex('A girl in a village gets the same chance to sit the Group-I exam as a boy in Hyderabad. Which Preamble value is this?', ['Both get the same opportunity regardless of gender or place.', 'This is equality of opportunity.'], 'Equality'),
        ex('Why is India called a republic, though the UK is also a democracy?', ['In India the head of state, the President, is elected.', 'In the UK the head of state is a hereditary monarch.'], 'Because India’s head of state is elected'),
      ],
      practice: [
        tp('value', (r) => {
          const [sit, val, why] = r.pick<[string, string, string]>([
            ['Every adult citizen can vote, whatever their religion, caste or wealth.', 'Equality', 'All citizens have equal political status.'],
            ['A writer can criticise the government in a newspaper article.', 'Liberty', 'Liberty includes freedom of thought and expression.'],
            ['The State provides reservations and scholarships to help historically disadvantaged groups.', 'Justice', 'Social justice means removing old disadvantages.'],
            ['People of different religions celebrate each other’s festivals and help in times of flood.', 'Fraternity', 'Fraternity means a sense of brotherhood among all.'],
            ['India decides its own foreign policy without any outside power controlling it.', 'Sovereignty', 'Sovereign means independent in decision-making.'],
            ['The government does not declare any religion as the official religion of the State.', 'Secularism', 'A secular State has no official religion.'],
          ]);
          return {
            type: 'mcq', prompt: `Which Preamble value does this show? “${sit}”`,
            ...choose(r, val, ['Equality', 'Liberty', 'Justice', 'Fraternity', 'Sovereignty', 'Secularism'].filter((x) => x !== val)),
            hints: ['Read the situation: is it about freedom, fairness, sameness, brotherhood, independence or religion?', 'Match the key idea to one value.'],
            mistakes: [{ when: 'wrong', explain: `Not quite. ${why}` }],
            solution: [`${val}.`, why],
          };
        }, 2),
        mcq('mcq', 'Recall the words and promises of the Preamble.', [
          ['The Preamble begins with the words…', '“We, the People of India”', ['“We, the Parliament”', '“By order of the King”', '“The Supreme Court declares”'], 'Authority comes from the people.', 'The opening words show that the people are the source of power.'],
          ['Which words were added to the Preamble in 1976?', 'Socialist and secular', ['Sovereign and democratic', 'Justice and liberty', 'Republic and equality'], '42nd Amendment.', 'The 42nd Amendment added “socialist” and “secular” (and “integrity”).'],
          ['“Republic” means…', 'The head of state is elected', ['There is a king', 'There are no elections', 'The army rules'], 'Not hereditary.', 'India’s President is elected.'],
          ['Fraternity means…', 'A sense of brotherhood among all citizens', ['Freedom of speech', 'Equal wages', 'An official religion'], 'Brotherhood.', 'Fraternity assures dignity and unity.'],
          ['“Sovereign” means India…', 'Takes its own decisions without outside control', ['Has a king', 'Is part of the British Empire', 'Has one religion'], 'Independent.', 'A sovereign state is fully independent.'],
        ]),
        matchT('match', 'Preamble word to its meaning', [
          ['Sovereign', 'Free from outside control'], ['Socialist', 'Reducing inequality of wealth'], ['Secular', 'No official State religion'], ['Democratic', 'Government by elected representatives'],
          ['Republic', 'Elected head of state'], ['Fraternity', 'Brotherhood among citizens'],
        ], ['Republic is about the head of state.', 'Secular is about religion.']),
      ],
    },
    {
      id: 'ts8.ss.const.systems', title: 'Systems of government: parliamentary, federal and separation of powers', prereqs: ['ts8.ss.const.preamble'],
      intro: [
        h('How is power arranged?'),
        photo('🏢', 'Power in India is shared between the Union and the States, and among legislature, executive and judiciary.'),
        def('Parliamentary system', 'The executive (Prime Minister and ministers) comes from the legislature and is responsible to it; it stays in power only while it has majority support in the Lok Sabha. India and the UK follow this system.'),
        def('Presidential system', 'The executive head (President) is directly elected and separate from the legislature, for a fixed term — e.g. the USA.'),
        def('Federal system', 'Power is divided between a central government and state governments, each with its own area of authority. India is a federation (“Union of States”) with a strong centre.'),
        p('The Constitution divides subjects into three lists: the Union List (defence, foreign affairs, railways, currency) for Parliament; the State List (police, agriculture, public health) for State legislatures; and the Concurrent List (education, forests, marriage) where both can make laws — the Union law prevails in case of conflict. Local governments (panchayats, municipalities) form a third tier.'),
        def('Separation of powers', 'Dividing government work among the legislature (makes laws), executive (carries them out) and judiciary (interprets laws and settles disputes), so that no one organ becomes too powerful.'),
        keys('India: parliamentary, federal with a strong centre.', 'Union, State and Concurrent Lists.', 'Three organs: legislature, executive, judiciary.', 'Third tier: panchayats and municipalities.'),
        remember('Concurrent List subjects such as education can be legislated by both Union and States; Union law prevails in conflict.'),
        tip('Ask: “Whose job is it?” — national defence → Union; police → State; education → both.'),
      ],
      examples: [
        ex('Which list does each belong to: defence, police, education?', ['Defence — Union List.', 'Police — State List.', 'Education — Concurrent List.'], 'Union; State; Concurrent'),
        ex('How is India’s system different from the USA’s presidential system?', ['In India, the PM and ministers are members of Parliament and responsible to the Lok Sabha.', 'In the USA, the President is elected separately and is not a member of Congress.'], 'India’s executive comes from and answers to the legislature'),
      ],
      practice: [
        tp('list', (r) => {
          const [subj, lst] = r.pick<[string, string]>([
            ['Defence', 'Union List'], ['Foreign affairs', 'Union List'], ['Railways', 'Union List'], ['Currency', 'Union List'],
            ['Police', 'State List'], ['Agriculture', 'State List'], ['Public health and hospitals', 'State List'],
            ['Education', 'Concurrent List'], ['Forests', 'Concurrent List'], ['Marriage and divorce', 'Concurrent List'],
          ]);
          return {
            type: 'mcq', prompt: `In which list of the Constitution is “${subj}” placed?`,
            ...choose(r, lst, ['Union List', 'State List', 'Concurrent List'].filter((x) => x !== lst)),
            hints: ['Union = national matters; State = local matters; Concurrent = shared.', 'Ask: does it need one policy for the whole country, or local handling, or both?'],
            mistakes: [{ when: 'wrong', explain: `“${subj}” is in the ${lst}.` }],
            solution: [`${subj} → ${lst}.`],
          };
        }, 1),
        mcq('mcq', 'Know the features of India’s system.', [
          ['In a parliamentary system the executive is responsible to…', 'The legislature', ['The judiciary', 'The army', 'Foreign governments'], 'It needs majority support.', 'Ministers must keep the confidence of the Lok Sabha.'],
          ['India is described in the Constitution as a…', 'Union of States', ['Confederation of kings', 'Unitary empire', 'City-state'], 'Article 1.', 'Article 1 says “India, that is Bharat, shall be a Union of States.”'],
          ['Which organ interprets laws and settles disputes?', 'Judiciary', ['Legislature', 'Executive', 'Election Commission'], 'Courts.', 'The judiciary interprets the Constitution and laws.'],
          ['If Union and State laws on a Concurrent subject conflict…', 'The Union law prevails', ['The State law prevails', 'Both are cancelled', 'The President decides by lottery'], 'Strong centre.', 'Union law prevails on Concurrent subjects.'],
          ['Which country follows a presidential system?', 'USA', ['India', 'United Kingdom', 'Japan'], 'Its President is separately elected.', 'The USA has a presidential system.'],
        ]),
        matchT('match', 'organ or list to its function', [
          ['Legislature', 'Makes laws'], ['Executive', 'Implements laws'], ['Judiciary', 'Interprets laws'], ['Union List', 'Defence, railways'], ['State List', 'Police, agriculture'], ['Concurrent List', 'Education, forests'],
        ], ['Three organs, three lists.', 'Concurrent = shared.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 14 — Parliament and Central Government
// =====================================================================================
const ch14: USpec = {
  id: 'ts8.ss.ch14', subject: 'social', title: 'Parliament and Central Government', source: src(14),
  objectives: [
    {
      id: 'ts8.ss.parl.houses', title: 'Role and houses of Parliament and their powers', prereqs: ['ts8.ss.const.systems'],
      intro: [
        h('The nation’s law-making body'),
        photo('🏢', 'Parliament consists of the President, the Lok Sabha and the Rajya Sabha.'),
        def('Lok Sabha (House of the People)', 'The lower house, directly elected by the people for 5 years. It has 543 elected members (one per constituency). Telangana elects 17 members.'),
        def('Rajya Sabha (Council of States)', 'The upper house, a permanent body; members are elected by State legislative assemblies for 6 years, and one-third retire every 2 years. Up to 250 members, including 12 nominated by the President for expertise in art, literature, science and social service. Telangana has 7 seats.'),
        p('Parliament makes laws, controls the government (through questions, debates and no-confidence motions), passes the budget and can amend the Constitution. A bill must be passed by both houses and signed by the President to become law. Money bills can be introduced only in the Lok Sabha; the Rajya Sabha can only suggest changes and must return them within 14 days. The government (Council of Ministers) is responsible to the Lok Sabha.'),
        keys('Lok Sabha: 543 elected, 5 years, directly elected.', 'Rajya Sabha: up to 250, permanent, 6-year terms, 12 nominated.', 'Money bills only in Lok Sabha.', 'Telangana: 17 Lok Sabha, 7 Rajya Sabha seats.'),
        remember('Minimum age: 25 years for Lok Sabha, 30 years for Rajya Sabha.'),
        tip('Lok = people (directly elected); Rajya = states (elected by MLAs).'),
      ],
      examples: [
        ex('How many members are needed for a majority in a Lok Sabha of 543?', ['Majority = more than half.', '543 ÷ 2 = 271.5.', 'So at least 272 members.'], '272'),
        ex('Why is the Rajya Sabha called a permanent house?', ['It is never dissolved as a whole.', 'Only one-third of members retire every two years.'], 'Because it is never dissolved as a whole'),
      ],
      practice: [
        tp('majority', (r) => {
          const n = r.pick([543, 545, 250, 245, 119, 175, 40]);
          const house = n === 119 ? 'Telangana Legislative Assembly (119 seats)' : n === 175 ? 'a state assembly of 175 seats' : n === 40 ? 'Telangana Legislative Council (40 seats)' : `a house of ${n} members`;
          const maj = Math.floor(n / 2) + 1;
          return numQ(`What is the smallest number of members that forms a simple majority (more than half) in ${house}?`, maj, ['More than half means half, then the next whole number above it.', `${n} ÷ 2 = ${n / 2}`], [`${n} ÷ 2 = ${n / 2}`, `Majority = ${maj}`], [{ when: String(n / 2), explain: 'Exactly half is not a majority — you need more than half.' }], 0.0001);
        }, 2),
        mcq('mcq', 'Lok Sabha = people; Rajya Sabha = states.', [
          ['Members of the Lok Sabha are elected…', 'Directly by the people', ['By MLAs', 'By the President', 'By the Supreme Court'], 'One per constituency.', 'Lok Sabha members are directly elected.'],
          ['A Rajya Sabha member’s term is…', '6 years', ['5 years', '4 years', 'Lifelong'], 'One-third retire every 2 years.', 'Each member serves 6 years.'],
          ['Money bills can be introduced only in…', 'The Lok Sabha', ['The Rajya Sabha', 'The Supreme Court', 'State assemblies'], 'The house of the people controls money.', 'Only the Lok Sabha can introduce money bills.'],
          ['How many Lok Sabha seats does Telangana have?', '17', ['42', '25', '7'], 'Undivided AP had 42.', 'Telangana elects 17 Lok Sabha members.'],
          ['The President can nominate how many members to the Rajya Sabha?', '12', ['2', '25', '50'], 'For art, science, literature, social service.', 'Twelve members are nominated.'],
          ['Minimum age to become a Lok Sabha member is…', '25 years', ['18 years', '30 years', '35 years'], 'Rajya Sabha is 30.', 'Lok Sabha candidates must be at least 25.'],
        ]),
        matchT('match', 'feature to the right house', [
          ['Directly elected by the people', 'Lok Sabha'], ['Elected by state MLAs', 'Rajya Sabha'], ['Term of 5 years unless dissolved', 'Lok Sabha'],
          ['Permanent house; one-third retire every 2 years', 'Rajya Sabha'], ['Money bills introduced here', 'Lok Sabha'], ['12 members nominated', 'Rajya Sabha'],
        ], ['Lok = people.', 'Rajya = states.']),
      ],
    },
    {
      id: 'ts8.ss.parl.elections', title: 'Lok Sabha elections and the challenges of free and fair elections', prereqs: ['ts8.ss.parl.houses'],
      intro: [
        h('One person, one vote, one value'),
        photo('🗣️', 'Every citizen aged 18 or above can vote, whatever their religion, caste, gender, wealth or education.'),
        def('Universal adult franchise', 'The right of every adult citizen to vote. In India the voting age was lowered from 21 to 18 by the 61st Amendment (1988).'),
        def('Election Commission of India', 'An independent constitutional body (set up 25 January 1950 — National Voters’ Day) that prepares voter lists, conducts elections and enforces the Model Code of Conduct.'),
        stepsB('Delimitation of constituencies and preparation of the voters’ list.', 'Announcement of the schedule; the Model Code of Conduct comes into force.', 'Filing and scrutiny of nominations; withdrawal deadline.', 'Campaigning ends 48 hours before polling.', 'Polling with EVMs and VVPAT; inked finger.', 'Counting and declaration of results; the winner is the candidate with the most votes (first past the post).'),
        p('Challenges: use of money and gifts to buy votes, criminal candidates, booth capturing in the past, fake news on social media, appeals to caste and religion, and low turnout in some areas. Reforms include EVMs, VVPAT slips, photo ID cards, candidates’ declaration of assets and criminal cases, and the NOTA (“None of the Above”) option added in 2013.'),
        f('Turnout % = votes cast ÷ total voters × 100'),
        keys('Voting age 18 (since 1988).', 'Election Commission: independent; conducts elections.', 'First past the post: most votes wins.', 'Challenges: money power, criminals, fake news.'),
        remember('NOTA lets a voter reject all candidates, but the candidate with the most votes still wins.'),
        tip('Turnout and vote-share are percentages: part ÷ whole × 100.'),
      ],
      examples: [
        ex('A constituency has 15,00,000 voters and 9,75,000 voted. What is the turnout?', ['9,75,000 ÷ 15,00,000 = 0.65.', '× 100 = 65%.'], '65%'),
        ex('Candidates A, B, C get 4,20,000; 3,90,000; 1,50,000 votes. Who wins and by what margin?', ['Highest is A with 4,20,000.', 'Margin = 4,20,000 − 3,90,000 = 30,000.'], 'A wins by 30,000 votes'),
      ],
      practice: [
        tp('turnout', (r) => {
          const tot = r.pick([1000000, 1200000, 1500000, 1600000, 2000000]);
          const pc = r.pick([55, 60, 62, 65, 70, 75]);
          const cast = (tot * pc) / 100;
          return numQ(`A Lok Sabha constituency has ${tot.toLocaleString('en-IN')} registered voters, and ${cast.toLocaleString('en-IN')} votes were cast. What was the voter turnout (%)?`, pc, ['Turnout = votes cast ÷ total voters × 100.', `${cast} ÷ ${tot} × 100`], [`${cast.toLocaleString('en-IN')} ÷ ${tot.toLocaleString('en-IN')} × 100 = ${pc}%`], [{ when: String(100 - pc), explain: 'That is the percentage who did NOT vote.' }], 0.005, '%');
        }, 1),
        tp('margin', (r) => {
          const a = r.pick([420000, 455000, 510000, 380000]);
          const d = r.pick([12000, 25000, 30000, 48000, 75000]);
          const c = r.pick([90000, 150000, 120000]);
          return numQ(`In a constituency, candidate P got ${a.toLocaleString('en-IN')} votes, Q got ${(a - d).toLocaleString('en-IN')} and R got ${c.toLocaleString('en-IN')}. By how many votes did the winner win?`, d, ['The winner has the most votes; margin = winner − runner-up.', 'Ignore the third candidate.'], [`P wins; margin = ${a} − ${a - d} = ${d.toLocaleString('en-IN')}`], [{ when: String(a - c), explain: 'Compare with the runner-up (second place), not the last candidate.' }], 0.0001);
        }, 2),
        mcq('mcq', 'Elections must be free and fair.', [
          ['The voting age in India is…', '18 years', ['21 years', '25 years', '16 years'], 'Lowered in 1988.', 'The 61st Amendment reduced it from 21 to 18.'],
          ['Elections in India are conducted by…', 'The Election Commission of India', ['The Prime Minister', 'The Supreme Court', 'Political parties'], 'An independent body.', 'The Election Commission conducts elections.'],
          ['NOTA was introduced in…', '2013', ['1950', '1988', '2000'], 'After a Supreme Court judgment.', 'NOTA was added in 2013.'],
          ['The Model Code of Conduct applies from…', 'The announcement of elections', ['Counting day', 'Five years before', 'Only after results'], 'It guides parties during elections.', 'It comes into force when the schedule is announced.'],
          ['Which is a challenge to free and fair elections?', 'Distributing money and gifts to voters', ['Using EVMs', 'Secret ballot', 'Photo voter ID cards'], 'Buying votes.', 'Money power distorts free choice.'],
        ]),
      ],
    },
    {
      id: 'ts8.ss.parl.executive', title: 'President, Vice-President, Prime Minister and Council of Ministers', prereqs: ['ts8.ss.parl.elections'],
      intro: [
        h('Who runs the Union government?'),
        photo('🚩', 'The President is the head of state; the Prime Minister heads the government.'),
        def('President', 'The head of state and supreme commander of the armed forces, elected for 5 years by an electoral college of elected MPs and elected MLAs of the States (and Delhi and Puducherry). Must be at least 35. Acts on the advice of the Council of Ministers.'),
        def('Vice-President', 'Elected by members of both houses of Parliament for 5 years; is the ex-officio Chairman of the Rajya Sabha and acts as President when needed.'),
        def('Prime Minister', 'Appointed by the President — normally the leader of the party or coalition with a majority in the Lok Sabha. Heads the Council of Ministers and is the real executive head.'),
        p('The Council of Ministers includes Cabinet Ministers (heads of important ministries), Ministers of State and Deputy Ministers. Its total size cannot exceed 15% of the Lok Sabha’s strength (91st Amendment, 2003). Ministers are collectively responsible to the Lok Sabha: if the Lok Sabha passes a no-confidence motion, the whole Council must resign.'),
        keys('President: elected indirectly; nominal head; acts on ministers’ advice.', 'Vice-President: Chairman of Rajya Sabha.', 'PM: leader of Lok Sabha majority; real head.', 'Council of Ministers ≤ 15% of Lok Sabha; collectively responsible.'),
        remember('Collective responsibility: the ministers “sink or swim together” in the Lok Sabha.'),
        tip('Formal powers → President; real decisions → PM and Cabinet.'),
      ],
      examples: [
        ex('What is the maximum size of the Council of Ministers if the Lok Sabha has 543 members?', ['15% of 543 = 0.15 × 543 = 81.45.', 'It cannot exceed this, so at most 81.'], 'At most 81 ministers'),
        ex('Why is the Prime Minister called the real executive?', ['The President must act on the advice of the Council of Ministers led by the PM.', 'The PM decides policies and allocates ministries.'], 'Because real decisions are made by the PM and Cabinet'),
      ],
      practice: [
        mcq('mcq', 'Head of state vs head of government.', [
          ['The President of India is elected by…', 'Elected MPs and elected MLAs (electoral college)', ['All citizens directly', 'The Prime Minister alone', 'The Supreme Court'], 'Indirect election.', 'An electoral college of elected legislators elects the President.'],
          ['The ex-officio Chairman of the Rajya Sabha is the…', 'Vice-President', ['President', 'Prime Minister', 'Speaker'], 'Second highest office.', 'The Vice-President chairs the Rajya Sabha.'],
          ['The Prime Minister is usually…', 'The leader of the majority in the Lok Sabha', ['The oldest MP', 'Chosen by lottery', 'Nominated by the Chief Justice'], 'Needs majority support.', 'The President appoints the majority leader as PM.'],
          ['The Council of Ministers is collectively responsible to…', 'The Lok Sabha', ['The Rajya Sabha', 'The President only', 'The Supreme Court'], 'No-confidence motion.', 'If the Lok Sabha withdraws support, all ministers resign.'],
          ['Minimum age to be President is…', '35 years', ['25 years', '30 years', '18 years'], 'Older than for MPs.', 'A presidential candidate must be at least 35.'],
          ['The supreme commander of India’s armed forces is the…', 'President', ['Prime Minister', 'Defence Minister', 'Army Chief'], 'Formal head of state.', 'The President is the supreme commander.'],
        ]),
        tp('cap', (r) => {
          const n = r.pick([543, 545, 500, 520, 540]);
          const cap = Math.floor(n * 0.15);
          return numQ(`The total number of ministers cannot exceed 15% of the Lok Sabha’s strength. If the Lok Sabha has ${n} members, what is the largest whole number of ministers allowed?`, cap, ['Find 15% of the strength.', 'Round DOWN — the limit cannot be exceeded.'], [`15% of ${n} = ${(n * 0.15).toFixed(2)}`, `Largest whole number not exceeding it = ${cap}`], [{ when: String(cap + 1), explain: 'Rounding up would exceed the 15% limit.' }], 0.0001);
        }, 2),
        matchT('match', 'office to its description', [
          ['President', 'Head of state; elected by electoral college'], ['Vice-President', 'Chairman of the Rajya Sabha'], ['Prime Minister', 'Head of government'],
          ['Cabinet Minister', 'Heads an important ministry'], ['Speaker', 'Presides over the Lok Sabha'], ['Council of Ministers', 'Collectively responsible to Lok Sabha'],
        ], ['Speaker = Lok Sabha; Chairman = Rajya Sabha.', 'PM heads the government.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 15 — Law and Justice: A Case Study
// =====================================================================================
const ch15: USpec = {
  id: 'ts8.ss.ch15', subject: 'social', title: 'Law and Justice – A Case Study', source: src(15),
  objectives: [
    {
      id: 'ts8.ss.law.fir', title: 'Filing a case: the FIR and the role of the police', prereqs: [],
      intro: [
        h('Something is stolen — what next?'),
        photo('📄', 'An FIR is the first written record of a crime, and it starts the police investigation.'),
        p('Suppose Sana’s bicycle is stolen outside her school in Nalgonda. Her family goes to the police station to report it. The officer must write down what they say in a First Information Report.'),
        def('FIR (First Information Report)', 'The written report of a cognizable offence (a serious crime such as theft, assault or murder) recorded at a police station. It must be read back to the informant, signed, and a free copy given to them.'),
        def('Zero FIR', 'An FIR that can be filed at any police station, regardless of where the crime happened; it is then transferred to the right station.'),
        stepsB('A complaint is given at the police station (orally or in writing).', 'The police register the FIR and give a free copy to the informant.', 'The police investigate: visit the place, collect evidence, record statements, may arrest suspects.', 'An arrested person must be produced before a magistrate within 24 hours.', 'The police file a charge sheet in court if there is enough evidence.', 'The court conducts the trial.'),
        p('The police must not refuse to register an FIR for a cognizable offence; if they do, the complaint can be sent to the Superintendent of Police or a magistrate. The police must not torture or beat suspects; Supreme Court guidelines (D. K. Basu case, 1997) set rules on arrest. Telangana has women’s help services (SHE teams) and the emergency number 100/112.'),
        keys('FIR: first written record of a serious crime.', 'Free copy to the informant; Zero FIR possible.', 'Arrested person before a magistrate within 24 hours.', 'Police investigate and file a charge sheet.'),
        remember('An arrested person has the right to know the reason for arrest and to consult a lawyer (Article 22).'),
        tip('Order to remember: complaint → FIR → investigation → charge sheet → trial.'),
      ],
      examples: [
        ex('The police officer refuses to register Imran’s complaint of theft. What can Imran do?', ['Theft is a cognizable offence; the police must register an FIR.', 'He can send a written complaint to the Superintendent of Police.', 'He can also approach a magistrate.'], 'Approach the SP or a magistrate'),
        ex('A person is arrested at 6 p.m. on Monday. By when must he be produced before a magistrate?', ['The limit is 24 hours (excluding travel time).', '6 p.m. Monday + 24 hours = 6 p.m. Tuesday.'], 'By about 6 p.m. on Tuesday'),
      ],
      practice: [
        orderT('order', 'Put the steps of a criminal case in order.', ['Complaint given at the police station', 'FIR registered and copy given', 'Police investigate and collect evidence', 'Charge sheet filed in court', 'Trial in court', 'Judgment delivered'], ['The FIR comes right after the complaint.', 'Judgment comes last.'], 'Complaint → FIR → investigation → charge sheet → trial → judgment.'),
        mcq('mcq', 'FIR = first written record; police must register it.', [
          ['FIR stands for…', 'First Information Report', ['Final Investigation Result', 'First Inquiry Request', 'Federal Investigation Report'], 'It is the first record.', 'FIR = First Information Report.'],
          ['An arrested person must be produced before a magistrate within…', '24 hours', ['7 days', '1 hour', '1 month'], 'Article 22.', 'The Constitution requires production within 24 hours.'],
          ['A Zero FIR can be filed…', 'At any police station', ['Only at the station where the crime took place', 'Only in Delhi', 'Only online'], 'Then transferred.', 'Any station must register it and transfer it.'],
          ['After investigation, if there is evidence, the police file a…', 'Charge sheet', ['Bail bond', 'Ration card', 'Will'], 'It lists the charges.', 'The charge sheet is submitted to the court.'],
          ['Is the informant entitled to a copy of the FIR?', 'Yes, free of cost', ['Only for a fee', 'No, never', 'Only after the trial'], 'It is a right.', 'A free copy must be given.'],
        ]),
        tapT('tap', 'Tap every RIGHT of a person who is arrested.', [
          ['To be told the reason for arrest', true], ['To consult a lawyer', true], ['To be produced before a magistrate within 24 hours', true], ['Not to be tortured', true],
          ['To be kept in police custody for months without a court order', false], ['To be beaten to force a confession', false], ['To be denied any meeting with family', false],
        ], ['Rights protect against misuse of power.', 'Torture is illegal.'], 'Article 22 and Supreme Court guidelines protect arrested persons.'),
      ],
    },
    {
      id: 'ts8.ss.law.civil', title: 'Civil and criminal law; bail and the public prosecutor', prereqs: ['ts8.ss.law.fir'],
      intro: [
        h('Two kinds of cases'),
        photo('⚖', 'Courts decide both private disputes and crimes against society.'),
        def('Criminal law', 'Deals with acts treated as offences against society — theft, assault, murder, dowry harassment. The case is usually begun by an FIR; the State prosecutes; punishment can be jail or fine.'),
        def('Civil law', 'Deals with disputes about rights of individuals — property, rent, divorce, contracts. The affected person files a petition in court; the court gives relief such as compensation or an order.'),
        def('Bail', 'Temporary release of an accused person from custody, on a promise (often backed by money or surety) to appear in court when required. Bail is the rule and jail the exception in most cases.'),
        def('Public prosecutor', 'A lawyer appointed by the State who presents the case against the accused in criminal cases on behalf of the State. The prosecutor must act fairly and present all facts, not just win.'),
        p('The accused is represented by a defence lawyer. If he or she cannot afford one, the State must provide free legal aid (Article 39A; Legal Services Authorities Act, 1987).'),
        keys('Criminal: offence against society; State prosecutes; punishment.', 'Civil: dispute about rights; relief/compensation.', 'Bail: temporary release with conditions.', 'Free legal aid for those who cannot afford a lawyer.'),
        remember('In criminal cases, the case is in the name of the State — e.g. “State vs …”.'),
        tip('Ask: “Has a crime been committed?” → criminal. “Is it a dispute about rights or money?” → civil.'),
      ],
      examples: [
        ex('A tenant refuses to vacate a house after the rent agreement ends. Civil or criminal?', ['It is a dispute about property rights between two parties.', 'No crime against society is involved.'], 'Civil case'),
        ex('A man steals a mobile phone. Who files the case and who prosecutes?', ['Theft is a crime; an FIR is filed with the police.', 'The public prosecutor presents the case for the State.'], 'Criminal case — police FIR; State prosecutes'),
      ],
      practice: [
        tp('kind', (r) => {
          const [c, k] = r.pick<[string, string]>([
            ['A shopkeeper is robbed at knifepoint.', 'Criminal'], ['Two brothers disagree about dividing their father’s land.', 'Civil'],
            ['A man demands dowry and harasses his wife.', 'Criminal'], ['A tenant does not pay rent for six months.', 'Civil'],
            ['A builder fails to hand over a flat as per the contract.', 'Civil'], ['Someone breaks into a house and steals jewellery.', 'Criminal'],
            ['A couple applies for divorce.', 'Civil'], ['A driver deliberately runs over a person after a quarrel.', 'Criminal'],
          ]);
          return {
            type: 'mcq', prompt: `Is this a civil or a criminal case? “${c}”`, ...choose(r, `${k} case`, [k === 'Civil' ? 'Criminal case' : 'Civil case', 'Not a legal matter']),
            hints: ['Is it a crime against society, or a dispute about rights between people?', 'Violence, theft and harassment are crimes.'],
            mistakes: [{ when: 'wrong', explain: k === 'Civil' ? 'This is a dispute about rights or property — a civil matter.' : 'This is an offence against society — a criminal matter.' }],
            solution: [`${k} case.`],
          };
        }, 1),
        mcq('mcq', 'Who does what in court?', [
          ['In a criminal case, the case against the accused is presented by the…', 'Public prosecutor', ['Defence lawyer', 'Judge', 'Accused'], 'Appointed by the State.', 'The public prosecutor represents the State.'],
          ['Bail means…', 'Temporary release of the accused with conditions', ['Final acquittal', 'A punishment', 'A type of FIR'], 'Released until trial.', 'Bail lets the accused stay out of jail during the case, on conditions.'],
          ['A civil case usually seeks…', 'Relief such as compensation or an order', ['Imprisonment of the accused', 'Death penalty', 'A charge sheet'], 'Not punishment.', 'Civil courts give relief to the wronged party.'],
          ['A poor accused person who cannot afford a lawyer is entitled to…', 'Free legal aid from the State', ['No defence', 'Defence by the police', 'Defence by the prosecutor'], 'Article 39A.', 'The State provides free legal aid.'],
          ['A criminal case begins usually with…', 'An FIR at the police station', ['A petition about rent', 'A property deed', 'A marriage certificate'], 'Police record.', 'Criminal cases usually start with an FIR.'],
        ]),
        matchT('match', 'person or term to its role', [
          ['Public prosecutor', 'Argues for the State'], ['Defence lawyer', 'Argues for the accused'], ['Judge', 'Decides the case impartially'], ['Bail', 'Temporary release'],
          ['Civil case', 'Dispute over rights or property'], ['Criminal case', 'Offence against society'],
        ], ['Two lawyers on opposite sides.', 'The judge is neutral.']),
      ],
    },
    {
      id: 'ts8.ss.law.trial', title: 'Fair trial, the judge’s role, separation of powers and the appeal system', prereqs: ['ts8.ss.law.civil'],
      intro: [
        h('Innocent until proven guilty'),
        photo('⚖', 'A fair trial protects the innocent and gives justice to victims.'),
        def('Fair trial', 'A trial held openly in court, where the accused is presumed innocent until proven guilty, has a lawyer, can cross-examine witnesses, is told the charges and is judged by an impartial judge. It is part of the right to life and personal liberty (Article 21).'),
        p('The judge listens to both sides, examines evidence and decides according to law — not according to public pressure. Judges are independent: they cannot be removed easily, and the legislature and executive must not interfere. This separation of powers keeps the courts free to check even the government.'),
        def('Appellate system', 'A person not satisfied with a court’s decision can appeal to a higher court. The levels are: subordinate courts (civil courts, magistrate courts) → District and Sessions Court → High Court of the State → Supreme Court of India.'),
        p('The Supreme Court, in New Delhi (started 28 January 1950), is the highest court. The High Court for the State of Telangana at Hyderabad began functioning on 1 January 2019. Lok Adalats help settle many disputes quickly by agreement.'),
        keys('Fair trial: open, presumption of innocence, lawyer, impartial judge.', 'Independent judiciary; separation of powers.', 'Appeal ladder: lower courts → District/Sessions → High Court → Supreme Court.', 'Telangana High Court functioning since 1 January 2019.'),
        remember('The burden of proof is on the prosecution; the accused does not have to prove innocence.'),
        tip('Remember the ladder from the bottom: “Subordinate – Sessions – High – Supreme”.'),
      ],
      examples: [
        ex('A Sessions Court in Warangal convicts a person, who believes the decision is wrong. Where can he appeal next?', ['The next higher court above the Sessions Court is the High Court of the State.', 'So he appeals to the Telangana High Court.'], 'The High Court for the State of Telangana'),
        ex('Why must judges be independent of the government?', ['The government itself may be a party in a case.', 'If judges feared the government, they could not decide fairly.', 'Independence protects citizens’ rights.'], 'So that they can decide fairly even against the government'),
      ],
      practice: [
        orderT('order', 'Arrange the courts from LOWEST to HIGHEST.', ['Subordinate (magistrate/civil) court', 'District and Sessions Court', 'High Court of the State', 'Supreme Court of India'], ['Start with the court nearest to the people.', 'The Supreme Court is at the top.'], 'Subordinate → District/Sessions → High Court → Supreme Court.'),
        mcq('mcq', 'Fair trial and appeals.', [
          ['“Presumption of innocence” means…', 'The accused is treated as innocent until proved guilty', ['The accused is guilty until proved innocent', 'The police decide guilt', 'No trial is needed'], 'Burden of proof is on the prosecution.', 'Guilt must be proved; innocence is assumed.'],
          ['The highest court of appeal in India is the…', 'Supreme Court', ['High Court', 'Sessions Court', 'Lok Adalat'], 'In New Delhi.', 'The Supreme Court is the apex court.'],
          ['The High Court for the State of Telangana began functioning on…', '1 January 2019', ['2 June 2014', '26 January 1950', '17 September 1948'], 'Some years after the state was formed.', 'A separate High Court started on 1 January 2019.'],
          ['Separation of powers means…', 'Legislature, executive and judiciary have separate functions', ['Courts make all laws', 'Police judge cases', 'The President runs courts'], 'Three organs.', 'Each organ checks the others.'],
          ['Which is NOT part of a fair trial?', 'Forcing a confession by beating', ['Open court hearing', 'Right to a lawyer', 'Cross-examining witnesses'], 'Torture is illegal.', 'Forced confessions violate the right to a fair trial.'],
        ]),
        tapT('tap', 'Tap every feature of a FAIR trial.', [
          ['Trial held in open court', true], ['Accused has a lawyer', true], ['Accused can question witnesses', true], ['Judge is impartial', true], ['Accused is told the charges', true],
          ['Judge decides based on public anger', false], ['Accused not allowed to speak', false], ['Secret trial without the accused', false],
        ], ['Fairness for both sides.', 'Public anger is not evidence.'], 'Openness, representation, information and impartiality make a trial fair.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 16 — Abolition of Zamindari System
// =====================================================================================
const ch16: USpec = {
  id: 'ts8.ss.ch16', subject: 'social', title: 'Abolition of Zamindari System', source: src(16),
  objectives: [
    {
      id: 'ts8.ss.zam.poverty', title: 'Rural poverty at independence', prereqs: ['ts8.ss.land.nizam'],
      intro: [
        h('A poor countryside in 1947'),
        photo('🌾', 'At independence most Indians lived in villages and depended on agriculture.'),
        p('In 1947 about 80% of Indians lived in villages, and most depended on farming. Yet much of the land was owned by a small number of zamindars, jagirdars and big landlords. Most villagers were tenants, sharecroppers or landless labourers. Rents were high, tenants could be evicted at will, debts were heavy, and much labour was forced or bonded. Yields were low because those who tilled the land had no incentive or money to improve it.'),
        def('Tenant', 'A farmer who cultivates land owned by someone else and pays rent in cash or a share of the crop.'),
        def('Sharecropper', 'A tenant who pays the landlord a share (often half or more) of the harvest as rent.'),
        def('Land to the tiller', 'The idea that land should belong to those who actually cultivate it.'),
        p('Leaders of the national movement and peasant movements, including the Telangana struggle, demanded land reforms. After independence, governments took up three main steps: abolishing intermediaries (zamindars and jagirdars), protecting tenants, and fixing ceilings on landholding to redistribute surplus land.'),
        keys('Most Indians were villagers in 1947.', 'Land concentrated in few hands; many landless.', 'High rents, eviction, debt, forced labour.', 'Land reforms: abolish intermediaries, protect tenants, ceilings.'),
        remember('“Land to the tiller” was the guiding idea of land reforms.'),
        tip('Link: Chapter 10 (how the system arose) → Chapter 16 (how it was dismantled).'),
      ],
      examples: [
        ex('A sharecropper harvests 40 quintals of paddy and must give half to the landlord. How much does he keep?', ['Half of 40 = 20.', 'He keeps 40 − 20 = 20 quintals — from which he must pay costs of seeds and labour.'], '20 quintals'),
        ex('Why did low yields go with tenancy?', ['Tenants could be evicted any time.', 'Much of any extra produce went to the landlord as rent.', 'So tenants had little reason or money to invest in land.'], 'Insecure tenants had no incentive to invest'),
      ],
      practice: [
        tp('share', (r) => {
          const q = r.pick([20, 30, 40, 50, 60]);
          const [fr, num] = r.pick<[string, number]>([['half', 0.5], ['two-thirds', 2 / 3], ['three-fifths', 0.6]]);
          const keep = Math.round(q * (1 - num) * 100) / 100;
          return numQ(`A sharecropper harvests ${q} quintals of grain and must give ${fr} to the landlord as rent. How many quintals does he keep? (Round to 2 decimals if needed.)`, keep, [`Find ${fr} of ${q} first.`, 'Subtract that from the total.'], [`Landlord’s share = ${fr} × ${q} = ${Math.round(q * num * 100) / 100}`, `Kept = ${q} − ${Math.round(q * num * 100) / 100} = ${keep} quintals`], [{ when: String(Math.round(q * num * 100) / 100), explain: 'That is the landlord’s share. Subtract it from the harvest.' }], 0.01);
        }, 2),
        mcq('mcq', 'Rural India in 1947.', [
          ['At independence, about what share of Indians lived in villages?', 'About 80%', ['About 20%', 'About 50%', 'About 5%'], 'A large majority.', 'Roughly four out of five Indians lived in villages.'],
          ['A sharecropper pays rent as…', 'A share of the harvest', ['A fixed monthly salary', 'A bank cheque only', 'Nothing'], 'Share-cropper.', 'Sharecroppers give part of the crop to the landowner.'],
          ['“Land to the tiller” means…', 'Land should belong to those who cultivate it', ['Land belongs to the king', 'Land should be left fallow', 'Tillers must pay more rent'], 'The farmer who ploughs.', 'Cultivators should own the land.'],
          ['Why were yields low under the zamindari system?', 'Tenants were insecure and had no incentive to invest', ['The soil was too fertile', 'There were too many tractors', 'Rents were zero'], 'Eviction and high rent.', 'Insecure tenants could not and would not improve land.'],
          ['Which was NOT a feature of rural poverty in 1947?', 'Widespread ownership of land by labourers', ['High rents', 'Heavy debt', 'Forced labour'], 'One option is the opposite of reality.', 'Labourers mostly owned no land.'],
        ]),
        tapT('tap', 'Tap every problem faced by tenants and labourers at independence.', [
          ['Eviction at the landlord’s will', true], ['High rents', true], ['Heavy debts to moneylenders', true], ['Forced or bonded labour', true],
          ['Guaranteed ownership of land', false], ['Free crop insurance', false], ['Too much land per family', false],
        ], ['Think of insecurity and poverty.', 'Ownership and insurance came later, if at all.'], 'Tenants faced insecurity, high rent, debt and forced labour.'),
      ],
    },
    {
      id: 'ts8.ss.zam.abolition', title: 'Abolition of zamindari and jagirdari, especially in Telangana', prereqs: ['ts8.ss.zam.poverty'],
      intro: [
        h('Removing the middlemen'),
        photo('📜', 'Laws passed after independence ended the rights of zamindars and jagirdars.'),
        def('Intermediary', 'A person (zamindar, jagirdar, inamdar) standing between the cultivator and the government, collecting rent for himself.'),
        p('Between 1948 and the mid-1950s, states passed laws abolishing intermediaries: for example, the Madras Estates (Abolition and Conversion into Ryotwari) Act, 1948, and the Uttar Pradesh Zamindari Abolition Act, 1950. Zamindars were paid compensation; the land came under the government, and cultivators began paying revenue directly.'),
        p('In Hyderabad State, the Jagirdari Abolition Regulation of 1949 ended jagirs (and sarf-e-khas lands were taken over by the state). The Hyderabad Tenancy and Agricultural Lands Act, 1950, gave “protected tenants” security against eviction and the right to buy the land they tilled. Vetti and bhagela were made illegal.'),
        p('Results were mixed: intermediaries lost their legal power, and many tenants gained security or ownership. But big landlords often kept large areas by claiming “personal cultivation”, transferring land to relatives (benami), or evicting tenants before the laws came into force. So inequality in land ownership remained.'),
        keys('Intermediaries abolished: Madras 1948, UP 1950, Hyderabad jagirs 1949.', 'Hyderabad Tenancy Act 1950: protected tenants.', 'Compensation paid to zamindars.', 'Loopholes: personal cultivation, benami transfers.'),
        remember('Hyderabad’s jagirs were abolished in 1949 — soon after the state joined India.'),
        tip('Give one success and one limitation in any answer on land reform.'),
      ],
      examples: [
        ex('Give two ways landlords escaped land reform laws.', ['Claiming the land was under “personal cultivation”.', 'Transferring land in the names of relatives or servants (benami).', 'Evicting tenants before the law applied.'], 'Personal cultivation claims and benami transfers'),
        ex('What did the Hyderabad Tenancy Act of 1950 do for tenants?', ['Recognised many as “protected tenants” who could not be evicted easily.', 'Gave them a right to buy the land they cultivated.'], 'Security of tenure and a right to purchase'),
      ],
      practice: [
        timelineT('tl', 'Arrange these land reform steps in order.', [
          [1948, 'Madras Estates Abolition Act', '1948'], [1949, 'Hyderabad Jagirdari Abolition Regulation', '1949'], [1950, 'Hyderabad Tenancy and Agricultural Lands Act; UP Zamindari Abolition Act', '1950'],
          [1951, 'Bhoodan movement begins at Pochampalli', '1951'], [1973, 'Andhra Pradesh Land Ceiling Act', '1973'],
        ], ['Abolition of intermediaries came first.', 'Ceiling laws came later.']),
        mcq('mcq', 'Abolition of intermediaries — successes and gaps.', [
          ['An intermediary in land revenue was…', 'A zamindar or jagirdar between cultivator and government', ['A tractor dealer', 'A bank', 'A judge'], 'Middleman.', 'Intermediaries collected rent between the State and the cultivator.'],
          ['Jagirs in Hyderabad State were abolished in…', '1949', ['1793', '1969', '2006'], 'Soon after 1948.', 'The Jagirdari Abolition Regulation was issued in 1949.'],
          ['“Benami” transfer means…', 'Transferring land in another person’s name to hide ownership', ['Selling land openly', 'Donating land to Bhoodan', 'Paying land revenue'], 'Without (real) name.', 'Benami deals hid real ownership to escape laws.'],
          ['The Hyderabad Tenancy Act (1950) gave “protected tenants”…', 'Security from eviction and a right to buy land', ['Free tractors', 'Jagirs', 'Exemption from all taxes'], 'Protection.', 'Protected tenants got security of tenure.'],
          ['A limitation of zamindari abolition was…', 'Landlords kept land through personal cultivation and benami', ['Tenants got too much land', 'Zamindars got no compensation at all', 'It was never passed anywhere'], 'Loopholes.', 'Loopholes let landlords keep large areas.'],
        ]),
        matchT('match', 'law or term to its meaning', [
          ['Jagirdari Abolition (1949)', 'Ended jagirs in Hyderabad'], ['Tenancy Act (1950)', 'Protected tenants in Hyderabad'], ['Intermediary', 'Middleman collecting rent'],
          ['Benami', 'Land held in a false name'], ['Personal cultivation', 'Loophole to keep land'], ['Compensation', 'Payment to former zamindars'],
        ], ['Two are laws.', 'Benami hides the owner.']),
      ],
    },
    {
      id: 'ts8.ss.zam.ceiling', title: 'Land ceiling laws and the Bhoodan movement', prereqs: ['ts8.ss.zam.abolition'],
      intro: [
        h('How much land is too much?'),
        photo('🙏', 'Vinoba Bhave walked village to village asking landowners to gift land to the landless.'),
        def('Land ceiling', 'A legal maximum on the amount of land a family can own. Land above the ceiling (surplus land) is taken by the government and distributed to the landless.'),
        p('Ceiling laws were passed by states in the 1960s and 1970s. In Andhra Pradesh (including Telangana) the Land Reforms (Ceiling on Agricultural Holdings) Act, 1973, fixed ceilings depending on the quality of land — lower for irrigated, fertile land and higher for dry land. Surplus land was distributed to landless Dalit, tribal and backward-class families. Implementation was slow and often weakened by false records and court cases.'),
        def('Bhoodan (land gift) movement', 'Started by Acharya Vinoba Bhave at Pochampalli (Nalgonda district, now Yadadri Bhuvanagiri) on 18 April 1951, when landowner Vedire Ramachandra Reddy offered 100 acres for landless Dalit families. Vinoba then walked across India asking for land gifts.'),
        p('Lakhs of acres were pledged; but much donated land was rocky or disputed, and only part was actually distributed. Still, Bhoodan showed a peaceful, moral way to address inequality. The village is now known as Bhoodan Pochampally.'),
        f('Surplus land = land owned − ceiling limit'),
        keys('Ceiling: maximum land per family; surplus redistributed.', 'AP Ceiling Act, 1973.', 'Bhoodan: 18 April 1951, Pochampalli, Vinoba Bhave.', 'Results: mixed; much land poor quality or not distributed.'),
        remember('Bhoodan began in Telangana — at Pochampalli, on 18 April 1951.'),
        tip('Surplus = owned − ceiling; if owned is below the ceiling, surplus is zero.'),
      ],
      examples: [
        ex('A family owns 75 acres of dry land; the ceiling is 54 acres (illustrative). What is the surplus?', ['Surplus = 75 − 54 = 21 acres.'], '21 acres'),
        ex('If 21 surplus acres are divided equally among 7 landless families, how much does each get?', ['21 ÷ 7 = 3 acres.'], '3 acres each'),
      ],
      practice: [
        tp('surplus', (r) => {
          const ceil = r.pick([18, 27, 36, 54]);
          const fam = r.pick([3, 4, 5, 6]);
          const each = r.pick([1, 2, 3]);
          const own = ceil + fam * each;
          return numQ(`A landowner holds ${own} acres. The ceiling for this type of land is ${ceil} acres (illustrative). The surplus is shared equally among ${fam} landless families. How many acres does each family get?`, each, ['First find the surplus: owned − ceiling.', `Then divide the surplus by ${fam}.`], [`Surplus = ${own} − ${ceil} = ${fam * each} acres`, `Each = ${fam * each} ÷ ${fam} = ${each} acres`], [{ when: String(fam * each), explain: 'That is the total surplus. Divide it among the families.' }], 0.001);
        }, 2),
        mcq('mcq', 'Ceiling = limit; Bhoodan = gift.', [
          ['The Bhoodan movement began at…', 'Pochampalli, Telangana (1951)', ['Champaran, Bihar (1917)', 'Dandi, Gujarat (1930)', 'Jogipet (1930)'], 'Now called Bhoodan Pochampally.', 'Vinoba Bhave received the first land gift at Pochampalli on 18 April 1951.'],
          ['Bhoodan was started by…', 'Acharya Vinoba Bhave', ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr B. R. Ambedkar'], 'A follower of Gandhi.', 'Vinoba Bhave led Bhoodan.'],
          ['The first land gift at Pochampalli was by…', 'Vedire Ramachandra Reddy', ['Suravaram Pratapa Reddy', 'Burgula Ramakrishna Rao', 'Komaram Bheem'], 'A local landowner.', 'Vedire Ramachandra Reddy offered 100 acres.'],
          ['A land ceiling law fixes…', 'The maximum land a family can own', ['The minimum wage', 'The price of crops', 'Rainfall'], 'Ceiling = upper limit.', 'Land above the ceiling is surplus.'],
          ['Why was the ceiling lower for irrigated land?', 'Irrigated land produces more, so less is needed for a living', ['Irrigated land is cheaper', 'It is harder to farm', 'Government owns all irrigated land'], 'Productivity.', 'Ceilings were linked to land quality.'],
          ['A weakness of Bhoodan was that…', 'Much donated land was poor quality or never distributed', ['No land was ever donated', 'It used violence', 'It happened only in cities'], 'Pledges vs actual distribution.', 'A good part of pledged land was unusable or undistributed.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Land ceiling', 'Maximum land a family may own'], ['Surplus land', 'Land above the ceiling'], ['Bhoodan', 'Voluntary gift of land'],
          ['Vinoba Bhave', 'Leader of Bhoodan'], ['Pochampalli', 'Where Bhoodan began'], ['1973', 'AP Land Ceiling Act'],
        ], ['Surplus is above the ceiling.', 'Bhoodan began in Telangana.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 17 — Understanding Poverty
// =====================================================================================
const ch17: USpec = {
  id: 'ts8.ss.ch17', subject: 'social', title: 'Understanding Poverty', source: src(17),
  objectives: [
    {
      id: 'ts8.ss.pov.hunger', title: 'Rural distress, poverty as chronic hunger and food inequality', prereqs: [],
      intro: [
        h('What does it mean to be poor?'),
        photo('🥄', 'For many families poverty means not having enough to eat every day.'),
        p('Poverty is not just low income. It means not having enough food, a safe house, clean water, health care and education, and having little security. Chronic hunger means regularly eating too little; seasonal hunger appears in lean months when there is no farm work.'),
        def('Calorie norm', 'Older Indian poverty estimates used an energy requirement of about 2,400 kilocalories per person per day in rural areas and 2,100 in urban areas (rural work being more physically demanding).'),
        def('Food inequality', 'Some households eat plenty while others go hungry, even when the country produces enough food.'),
        p('Rural distress — crop failure, drought, debt, low prices and lack of jobs — pushes families into hunger and migration. Studies show that poorer households spend a large share of income on food and still eat less nutritious food (fewer pulses, milk, vegetables). India produces enough grain overall; hunger is mainly a problem of access — people lacking the money or means to buy food.'),
        keys('Poverty = lack of income, food, health, education, security.', 'Calorie norms: about 2,400 (rural), 2,100 (urban) kcal.', 'Hunger is mainly about access, not total production.', 'Poor families spend most income on food.'),
        remember('Food security means availability, access and absorption (nutrition) of food for all at all times.'),
        tip('Calorie gap = norm − actual intake.'),
      ],
      examples: [
        ex('A labourer in a village eats about 1,900 kcal a day. How far below the rural norm (2,400) is he?', ['Gap = 2,400 − 1,900 = 500 kcal.'], '500 kcal per day'),
        ex('A family earns ₹8,000 a month and spends ₹5,200 on food. What share of income goes on food?', ['5,200 ÷ 8,000 = 0.65.', '× 100 = 65%.'], '65%'),
      ],
      practice: [
        tp('gap', (r) => {
          const rural = r.next() < 0.5;
          const norm = rural ? 2400 : 2100;
          const eat = norm - r.pick([200, 300, 400, 500, 600, 700]);
          return numQ(`A person in a${rural ? ' village' : 'n urban slum'} eats about ${eat} kcal a day. Using the old norm of ${norm} kcal for ${rural ? 'rural' : 'urban'} areas, how many kcal short is he/she each day?`, norm - eat, ['Shortfall = norm − actual intake.', `${norm} − ${eat}`], [`${norm} − ${eat} = ${norm - eat} kcal`], [], 0.001);
        }, 1),
        tp('foodshare', (r) => {
          const inc = r.pick([6000, 8000, 10000, 12000, 20000]);
          const pc = r.pick([40, 50, 55, 60, 65, 70]);
          const food = (inc * pc) / 100;
          return numQ(`A household earns ₹${inc.toLocaleString('en-IN')} a month and spends ₹${food.toLocaleString('en-IN')} on food. What percentage of its income goes on food?`, pc, ['Share = food spending ÷ income × 100.', `${food} ÷ ${inc} × 100`], [`${food} ÷ ${inc} × 100 = ${pc}%`], [], 0.005, '%');
        }, 2),
        mcq('mcq', 'Poverty and hunger are about access and security.', [
          ['Chronic hunger means…', 'Regularly eating less than needed', ['Fasting for a festival', 'Eating too much', 'Skipping one meal once'], 'Chronic = long-lasting.', 'Chronic hunger is persistent inadequate food intake.'],
          ['The old rural calorie norm used in India was about…', '2,400 kcal per day', ['1,000 kcal per day', '5,000 kcal per day', '2,100 kcal per day'], 'Urban was 2,100.', 'Rural norm: about 2,400 kcal.'],
          ['Why can people go hungry even when a country produces enough grain?', 'They lack money or means to access food', ['Grain is invisible', 'Everyone is on a diet', 'Grain cannot be cooked'], 'Access.', 'Hunger is mainly about inability to buy or obtain food.'],
          ['Seasonal hunger usually occurs…', 'In lean months when there is no farm work', ['At harvest time', 'On festival days only', 'Never in villages'], 'No work, no wage.', 'Lean seasons bring loss of income and hunger.'],
          ['Which is a sign of rural distress?', 'Farmers migrating after crop failure and debt', ['Bumper harvest with good prices', 'Rising rural wages for all', 'More jobs in villages'], 'Distress = trouble.', 'Crop failure and debt force migration.'],
        ]),
      ],
    },
    {
      id: 'ts8.ss.pov.mgnrega', title: 'Agriculture and other livelihoods; MGNREGA and social audit', prereqs: ['ts8.ss.pov.hunger'],
      intro: [
        h('A legal guarantee of work'),
        photo('🧑‍🌾', 'MGNREGA work includes digging ponds, building field bunds and rural roads.'),
        p('Most rural families depend on agriculture, but farm work is seasonal and many are landless. Other options include animal husbandry, fishing, small shops, crafts, construction and migration to cities. To give security in lean seasons, Parliament passed the Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) in 2005; it was first implemented on 2 February 2006, launched at Bandlapalli in Anantapur district (Andhra Pradesh).'),
        def('MGNREGA', 'A law that guarantees at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.'),
        keys('Work within 15 days of applying, otherwise an unemployment allowance.', 'Work within 5 km of home, or extra travel allowance.', 'At least one-third of beneficiaries should be women.', 'Equal wages for men and women; wages paid into bank/post office accounts.', 'Works: water conservation, ponds, bunds, plantations, rural connectivity.'),
        def('Social audit', 'A public check of a government scheme by the people themselves: records (muster rolls, payments) are read out in the Gram Sabha and verified, so that fraud can be exposed. Undivided Andhra Pradesh set up a pioneering social audit system, which Telangana continues.'),
        f('Household earnings = days of work × daily wage'),
        remember('MGNREGA is a legal right — people can demand work, not just wait for it.'),
        tip('100 days per household per year, not per person.'),
      ],
      examples: [
        ex('A household gets 100 days of MGNREGA work at ₹300 a day (illustrative). How much does it earn?', ['100 × 300 = ₹30,000.'], '₹30,000'),
        ex('In a social audit, a muster roll shows wages paid to a person who had migrated to Mumbai. What does this reveal?', ['The person could not have worked in the village then.', 'Wages were drawn falsely in his name.', 'The audit has exposed fraud, which must be recovered.'], 'Fraud — a fake entry in the muster roll'),
      ],
      practice: [
        tp('earn', (r) => {
          const days = r.pick([40, 50, 60, 75, 80, 100]);
          const wage = r.pick([250, 272, 300, 320, 350]);
          return numQ(`A rural household got ${days} days of MGNREGA work at ₹${wage} per day (illustrative). How much (₹) did it earn?`, days * wage, ['Earnings = days × daily wage.', `${days} × ${wage}`], [`${days} × ${wage} = ₹${(days * wage).toLocaleString('en-IN')}`], [], 0.001);
        }, 1),
        mcq('mcq', 'Know MGNREGA’s guarantees.', [
          ['MGNREGA guarantees how many days of work per household per year?', 'At least 100', ['30', '365', '10'], 'A hundred.', 'At least 100 days of wage work per household.'],
          ['If work is not given within 15 days of applying…', 'An unemployment allowance must be paid', ['Nothing happens', 'The family is fined', 'The application is cancelled for ever'], 'It is a legal right.', 'The State must pay an unemployment allowance.'],
          ['MGNREGA work should be provided within…', '5 km of the worker’s home', ['50 km', '500 km', 'Another state'], 'Close to home.', 'Work is to be given within 5 km, else extra allowance.'],
          ['What share of MGNREGA beneficiaries should be women?', 'At least one-third', ['None', 'At most one-tenth', 'Exactly half always'], 'One in three.', 'At least one-third must be women.'],
          ['A social audit means…', 'People publicly verifying records of a scheme', ['An income tax raid', 'A private company’s accounts', 'A police inquiry'], 'Done in the Gram Sabha.', 'Social audits let villagers check spending and expose fraud.'],
          ['MGNREGA was first launched in 2006 at…', 'Bandlapalli, Anantapur (AP)', ['Pochampalli', 'Champaran', 'Jogipet'], 'In Andhra Pradesh.', 'The PM launched it at Bandlapalli on 2 February 2006.'],
        ]),
        tapT('tap', 'Tap every feature of MGNREGA.', [
          ['100 days of work per household per year', true], ['Equal wages for men and women', true], ['Work within 5 km', true], ['Social audit of works', true], ['Unemployment allowance if work is not given', true],
          ['Only for urban residents', false], ['Wages paid only in grain', false], ['Only skilled engineering jobs', false],
        ], ['It is a rural, unskilled-work guarantee.', 'Wages go to bank/post office accounts.'], 'MGNREGA guarantees rural unskilled work with fairness and transparency safeguards.'),
      ],
    },
    {
      id: 'ts8.ss.pov.pds', title: 'Access to affordable food: the Public Distribution System', prereqs: ['ts8.ss.pov.mgnrega'],
      intro: [
        h('The ration shop'),
        photo('🏪', 'Fair price (ration) shops supply rice, wheat and other items at low or no cost to eligible families.'),
        def('Public Distribution System (PDS)', 'A government system that buys food grains from farmers (through the Food Corporation of India and state agencies), stores them, and distributes them through fair price shops to ration card holders at low prices.'),
        def('National Food Security Act, 2013', 'Makes subsidised food a legal right: priority households get 5 kg of grain per person per month; the poorest (Antyodaya Anna Yojana) households get 35 kg per household per month. Since 2023 this grain is provided free under the PM Garib Kalyan Anna Yojana.'),
        p('The PDS protects poor families from hunger and price rises and also gives farmers a market through minimum support prices. Problems include leakage (grain sold in the open market), exclusion of genuinely poor families, poor-quality grain and long queues. Reforms include computerised ration cards, Aadhaar-based biometric authentication, ePoS machines at shops, and “One Nation One Ration Card” so that migrant workers can draw rations anywhere. Telangana also supplies fine rice to schools and hostels.'),
        f('Monthly entitlement (priority household) = members × 5 kg'),
        keys('Procure → store → distribute through fair price shops.', 'NFSA 2013: 5 kg per person; AAY 35 kg per household.', 'Problems: leakage, exclusion, quality.', 'Reforms: ePoS, biometrics, portability.'),
        remember('NFSA covers up to 75% of rural and 50% of urban population.'),
        tip('Per person for priority households; per household for Antyodaya.'),
      ],
      examples: [
        ex('A priority household has 6 members. How much grain is it entitled to per month under NFSA?', ['5 kg × 6 = 30 kg.'], '30 kg'),
        ex('An Antyodaya household has 3 members. How much grain does it get?', ['Antyodaya entitlement is per household, not per person.', 'So it gets 35 kg.'], '35 kg'),
      ],
      practice: [
        tp('ration', (r) => {
          const n = r.pick([2, 3, 4, 5, 6, 7]);
          const aay = r.next() < 0.3;
          if (aay) return numQ(`An Antyodaya (AAY) household has ${n} members. How many kg of grain is it entitled to per month under NFSA?`, 35, ['For AAY households the entitlement is per HOUSEHOLD.', 'It is a fixed 35 kg.'], ['AAY households get 35 kg per month, whatever their size.'], [{ when: String(n * 5), explain: 'The 5 kg per person rule is for priority households. AAY households get 35 kg per household.' }], 0.001, 'kg');
          return numQ(`A priority household has ${n} members. How many kg of grain is it entitled to per month under NFSA (5 kg per person)?`, n * 5, ['Entitlement = members × 5 kg.', `${n} × 5`], [`${n} × 5 = ${n * 5} kg`], [{ when: '35', explain: '35 kg per household applies to Antyodaya households only.' }], 0.001, 'kg');
        }, 1),
        mcq('mcq', 'PDS and NFSA basics.', [
          ['The National Food Security Act was passed in…', '2013', ['2005', '1975', '2019'], 'Food became a legal right.', 'NFSA was enacted in 2013.'],
          ['Under NFSA, a priority household gets…', '5 kg of grain per person per month', ['35 kg per person per month', '1 kg per household per year', 'No grain'], 'Per person.', 'Priority households get 5 kg per person per month.'],
          ['“One Nation One Ration Card” mainly helps…', 'Migrant workers draw rations anywhere in India', ['Farmers sell abroad', 'Shops raise prices', 'Banks give loans'], 'Portability.', 'It lets ration cards work across states.'],
          ['Leakage in the PDS means…', 'Grain meant for the poor is diverted to the open market', ['Rain entering godowns', 'Free grain to all', 'Shops closing early'], 'Diversion.', 'Leakage is illegal diversion of PDS grain.'],
          ['ePoS machines and biometrics in ration shops aim to…', 'Ensure the right person gets the right quantity', ['Raise grain prices', 'Close ration shops', 'Replace farmers'], 'Authentication.', 'They reduce fraud and leakage.'],
        ]),
        orderT('order', 'Put the steps of the PDS supply chain in order.', ['Farmers sell grain at minimum support price', 'FCI and state agencies procure the grain', 'Grain is stored in godowns', 'Grain is transported to fair price shops', 'Ration card holders buy or receive grain'], ['It starts with farmers.', 'Families receive grain at the end.'], 'Farmer → procurement → storage → fair price shop → household.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 18 — Rights Approach to Development
// =====================================================================================
const ch18: USpec = {
  id: 'ts8.ss.ch18', subject: 'social', title: 'Rights Approach to Development', source: src(18),
  objectives: [
    {
      id: 'ts8.ss.rights.human', title: 'The idea of human rights', prereqs: ['ts8.ss.const.preamble'],
      intro: [
        h('Rights every human being has'),
        photo('🌍', 'Human rights belong to every person simply because they are human.'),
        def('Human rights', 'Basic rights and freedoms that belong to every person — such as the right to life, liberty, equality, dignity, food, education and freedom from torture and discrimination.'),
        p('After the horrors of the Second World War, the United Nations adopted the Universal Declaration of Human Rights (UDHR) on 10 December 1948. That date is celebrated as Human Rights Day. India’s Constitution includes many of these as Fundamental Rights (Part III) — equality, freedoms, protection against exploitation, freedom of religion, cultural and educational rights, and the right to constitutional remedies — and others as Directive Principles.'),
        def('Rights-based approach to development', 'Seeing food, work, education, information and health as rights that people can claim, not as charity given at the government’s will. Laws like MGNREGA, RTI, RTE and NFSA follow this approach.'),
        p('India set up the National Human Rights Commission (NHRC) in 1993 under the Protection of Human Rights Act; states have State Human Rights Commissions, including in Telangana. They inquire into complaints of rights violations such as custodial torture.'),
        keys('UDHR: 10 December 1948 (Human Rights Day).', 'Fundamental Rights in Part III of the Constitution.', 'NHRC set up in 1993.', 'Rights approach: entitlements, not charity.'),
        remember('Article 32 — the right to go to the Supreme Court to protect Fundamental Rights — was called by Ambedkar the “heart and soul” of the Constitution.'),
        tip('Charity can be withdrawn; a right can be claimed in court.'),
      ],
      examples: [
        ex('How is a right different from charity?', ['Charity depends on the goodwill of the giver and can stop any time.', 'A right is guaranteed by law; if denied, a person can complain or go to court.'], 'A right can be claimed and enforced; charity cannot'),
        ex('Give two examples of laws that follow the rights approach.', ['MGNREGA — right to work.', 'RTE Act — right to education.', 'RTI Act — right to information.'], 'E.g. MGNREGA and RTE'),
      ],
      practice: [
        mcq('mcq', 'Human rights are universal and enforceable.', [
          ['The Universal Declaration of Human Rights was adopted on…', '10 December 1948', ['15 August 1947', '26 January 1950', '12 October 2005'], 'Human Rights Day.', 'The UN adopted the UDHR on 10 December 1948.'],
          ['India’s National Human Rights Commission was set up in…', '1993', ['1947', '1975', '2009'], 'Protection of Human Rights Act.', 'The NHRC was established in 1993.'],
          ['Fundamental Rights are in which part of the Constitution?', 'Part III', ['Part I', 'Part IV', 'Schedule 7'], 'Part IV has Directive Principles.', 'Part III lists Fundamental Rights.'],
          ['A rights-based approach treats education as…', 'An entitlement people can claim', ['A favour from officials', 'A luxury for the rich', 'Optional for the State'], 'Not charity.', 'Rights can be demanded and enforced.'],
          ['Which is a human right?', 'Freedom from torture', ['Right to own a car', 'Right to a government job for everyone', 'Right to free cinema tickets'], 'Basic dignity.', 'Freedom from torture is a basic human right.'],
        ]),
        tapT('tap', 'Tap every item that is a recognised human right.', [
          ['Right to life', true], ['Freedom of expression', true], ['Right to equality before law', true], ['Right to education', true], ['Freedom from slavery', true],
          ['Right to win every election', false], ['Right to a free car', false], ['Right to never pay any tax', false],
        ], ['Basic needs and freedoms of all humans.', 'Luxuries are not rights.'], 'Human rights protect basic freedoms and needs of every person.'),
        matchT('match', 'law or institution to the right it protects', [
          ['MGNREGA', 'Right to work'], ['RTI Act', 'Right to information'], ['RTE Act', 'Right to education'], ['NFSA', 'Right to food'],
          ['NHRC', 'Inquires into human rights violations'], ['Article 32', 'Right to approach the Supreme Court'],
        ], ['Each law names its right.', 'NHRC is a commission.']),
      ],
    },
    {
      id: 'ts8.ss.rights.rti', title: 'The Right to Information: the movement and the Act', prereqs: ['ts8.ss.rights.human'],
      intro: [
        h('Information is power'),
        photo('📄', 'Under the RTI Act, any citizen can ask a public authority for information by paying a small fee.'),
        p('In the early 1990s, the Mazdoor Kisan Shakti Sangathan (MKSS) in rural Rajasthan, led by Aruna Roy, Nikhil Dey and Shankar Singh, demanded copies of muster rolls and bills of public works. At public hearings (jan sunwais), villagers found wages paid to dead people and works never done. The slogan was “Hamara paisa, hamara hisaab” (our money, our accounts). This grew into a national movement, leading to the Right to Information Act, 2005, which came into force on 12 October 2005.'),
        def('Public Information Officer (PIO)', 'An officer in every public authority who receives RTI applications and must give information.'),
        keys('Any citizen can apply; no need to give reasons.', 'Fee ₹10 (Central/most States); BPL card holders exempt.', 'Reply within 30 days; within 48 hours if life or liberty is involved.', 'First appeal to a senior officer; second appeal to the Information Commission.', 'Some information (national security, privacy) is exempt.'),
        p('RTI has helped people trace pensions, ration entitlements, scholarship payments and road works. It increases transparency and accountability. Activists who use it must sometimes be protected from threats.'),
        remember('“Hamara paisa, hamara hisaab” — our money, our accounts — was the MKSS slogan.'),
        tip('Deadlines: 30 days normally; 48 hours for life and liberty.'),
      ],
      examples: [
        ex('Priya applied for her scholarship 6 months ago but hasn’t received it. How can RTI help?', ['She files an RTI application with the PIO of the education/welfare office, paying ₹10.', 'She asks for the status of her application and the reasons for delay.', 'The office must reply within 30 days, which usually speeds up action.'], 'File an RTI to get the status and reasons'),
        ex('An RTI application was received on 1 March. By when must the reply be given?', ['30 days from 1 March.', 'That is 31 March.'], 'By 31 March'),
      ],
      practice: [
        tp('deadline', (r) => {
          const life = r.next() < 0.3;
          if (life) return numQ('An RTI request concerns a person’s life or liberty (e.g. someone missing in custody). Within how many HOURS must the information be given?', 48, ['There is a special shorter deadline for urgent cases.', 'It is two days.'], ['Information about life or liberty must be given within 48 hours.'], [{ when: '30', explain: '30 days is the normal limit. For life or liberty it is 48 hours.' }], 0.001, 'h');
          const d = r.pick([1, 2, 5, 10, 15]);
          return numQ(`An RTI application reached the PIO on ${d} April. By what date in May must the reply be given at the latest? (Type the day of May; April has 30 days and the limit is 30 days.)`, d, ['Add 30 days to the date of receipt.', 'April has 30 days, so 30 days later is the same date in May.'], [`${d} April + 30 days = ${d} May`], [], 0.001);
        }, 2),
        mcq('mcq', 'The RTI movement and Act.', [
          ['The RTI Act came into force on…', '12 October 2005', ['26 January 1950', '1 April 2010', '2 February 2006'], 'In 2005.', 'It came into force on 12 October 2005.'],
          ['The RTI movement began with the work of…', 'MKSS in Rajasthan', ['Andhra Maha Sabha', 'Indian National Army', 'Brahmo Samaj'], 'Public hearings in villages.', 'The Mazdoor Kisan Shakti Sangathan led the early campaign.'],
          ['The normal time limit for a reply under RTI is…', '30 days', ['3 days', '1 year', 'No limit'], 'One month.', 'Public authorities must reply within 30 days.'],
          ['If a PIO does not reply, the applicant can…', 'File an appeal, finally to the Information Commission', ['Do nothing', 'Go to the police only', 'Pay a bribe'], 'Two appeals.', 'First appeal to a senior officer; second appeal to the Information Commission.'],
          ['Jan sunwai means…', 'A public hearing', ['A secret meeting', 'A court trial', 'A tax'], 'Jan = people; sunwai = hearing.', 'At jan sunwais, records were read out in public.'],
          ['Who is exempt from paying the RTI fee?', 'Below-poverty-line card holders', ['Rich businessmen', 'Foreign tourists', 'Nobody'], 'To ensure access for the poor.', 'BPL applicants do not pay the fee.'],
        ]),
        orderT('order', 'Put the RTI process in order.', ['Write the questions and pay the ₹10 fee', 'Submit the application to the Public Information Officer', 'PIO replies within 30 days', 'If unsatisfied, file a first appeal', 'If still unsatisfied, file a second appeal to the Information Commission'], ['Application first.', 'The Information Commission is the last step.'], 'Apply → PIO → reply → first appeal → second appeal.'),
      ],
    },
    {
      id: 'ts8.ss.rights.rte', title: 'The Right to Education Act, 2009', prereqs: ['ts8.ss.rights.rti'],
      intro: [
        h('Every child in school'),
        photo('🏫', 'Every child aged 6 to 14 has a fundamental right to free and compulsory education.'),
        p('The 86th Constitutional Amendment (2002) added Article 21A, making education a Fundamental Right for children aged 6–14. The Right of Children to Free and Compulsory Education (RTE) Act, 2009, came into force on 1 April 2010 to make this right real.'),
        keys('Free and compulsory education for all children aged 6–14 in a neighbourhood school.', 'No capitation fee and no screening tests for admission.', '25% of entry-level seats in private unaided schools reserved for children from disadvantaged and weaker sections.', 'Pupil–teacher ratio: 30:1 (primary), 35:1 (upper primary).', 'No physical punishment or mental harassment.', 'School Management Committees with parents.'),
        def('Pupil–teacher ratio (PTR)', 'The number of students per teacher. Fewer students per teacher allows more attention to each child.'),
        p('RTE has raised enrolment and improved school facilities. Challenges remain: learning levels, teacher shortages, dropouts after Class 8, and children in child labour. Telangana runs residential schools (gurukuls) for SC, ST, BC and minority children to widen access.'),
        f('Teachers needed = number of students ÷ pupil–teacher ratio (round up)'),
        remember('Article 21A + RTE Act 2009 → education is a right for every child aged 6 to 14.'),
        tip('If the division gives a decimal, round UP — you cannot have part of a teacher, and the ratio must not be exceeded.'),
      ],
      examples: [
        ex('A primary school has 210 pupils. Using the 30:1 norm, how many teachers are needed?', ['210 ÷ 30 = 7.'], '7 teachers'),
        ex('A private school has 80 seats in Class 1. How many must be reserved under RTE for disadvantaged children?', ['25% of 80 = 20.'], '20 seats'),
      ],
      practice: [
        tp('ptr', (r) => {
          const upper = r.next() < 0.5;
          const ratio = upper ? 35 : 30;
          const n = r.pick([150, 175, 200, 245, 260, 300, 330]);
          const t = Math.ceil(n / ratio);
          return numQ(`An ${upper ? 'upper primary' : 'primary'} school has ${n} pupils. Under the RTE norm of ${ratio}:1, what is the minimum number of teachers needed?`, t, ['Teachers = pupils ÷ ratio.', 'If the answer is not a whole number, round UP.'], [`${n} ÷ ${ratio} = ${(n / ratio).toFixed(2)}`, `Round up → ${t} teachers`], n % ratio !== 0 ? [{ when: String(Math.floor(n / ratio)), explain: 'Rounding down would leave more than the allowed pupils per teacher. Round up.' }] : [], 0.0001);
        }, 2),
        tp('quota', (r) => {
          const seats = r.pick([40, 60, 80, 100, 120]);
          return numQ(`A private unaided school has ${seats} seats in its entry class. How many must be reserved for children from disadvantaged and weaker sections under the RTE Act?`, seats / 4, ['The RTE quota is 25%.', `25% of ${seats} = ${seats} ÷ 4`], [`${seats} × 25 ÷ 100 = ${seats / 4} seats`], [], 0.001);
        }, 1),
        mcq('mcq', 'RTE basics.', [
          ['The RTE Act covers children aged…', '6 to 14 years', ['3 to 18 years', '0 to 6 years', '14 to 18 years'], 'Classes 1 to 8.', 'It guarantees education for ages 6–14.'],
          ['Article 21A was added by the…', '86th Amendment (2002)', ['42nd Amendment (1976)', '61st Amendment (1988)', '1st Amendment (1951)'], 'In 2002.', 'The 86th Amendment made education a Fundamental Right.'],
          ['Under RTE, private unaided schools must reserve…', '25% of entry-level seats for disadvantaged children', ['50% for staff children', 'No seats', '10% for toppers'], 'One quarter.', 'A quarter of entry seats are reserved.'],
          ['Which is banned under the RTE Act?', 'Physical punishment of children', ['Mid-day meals', 'Free textbooks', 'Parent committees'], 'Children’s dignity.', 'Corporal punishment and harassment are prohibited.'],
          ['The RTE Act came into force on…', '1 April 2010', ['12 October 2005', '26 January 1950', '1 June 2014'], 'The year after it was passed.', 'It was passed in 2009 and in force from 1 April 2010.'],
        ]),
      ],
    },
  ],
};


// =====================================================================================
// Chapter 19 — Social and Religious Reform Movements
// =====================================================================================
const c19Events: EV[] = [
  [1828, 'Raja Rammohun Roy founds the Brahmo Sabha (Brahmo Samaj)', '1828'],
  [1829, 'Sati abolished by law', '1829'],
  [1848, 'Savitribai and Jyotirao Phule start a girls’ school in Pune', '1848'],
  [1856, 'Widow Remarriage Act passed', '1856'],
  [1873, 'Jyotirao Phule founds the Satyashodhak Samaj', '1873'],
  [1875, 'Arya Samaj founded; Muhammadan Anglo-Oriental College founded at Aligarh', '1875'],
  [1881, 'Kandukuri Veeresalingam arranges a widow remarriage in Rajahmundry', '1881'],
  [1903, 'SNDP Yogam founded in Kerala with Sree Narayana Guru’s blessings', '1903'],
  [1906, 'Bhagya Reddy Varma forms the Jagan Mitra Mandali in Hyderabad', '1906'],
  [1927, 'Ambedkar leads the Mahad Satyagraha', '1927'],
  [1929, 'Child Marriage Restraint (Sarda) Act', '1929'],
];
const ch19: USpec = {
  id: 'ts8.ss.ch19', subject: 'social', title: 'Social and Religious Reform Movements', source: src(19),
  objectives: [
    {
      id: 'ts8.ss.reform.samaj', title: 'Brahmo Samaj, Arya Samaj and reform among Muslims', prereqs: [],
      intro: [
        h('Questioning old customs'),
        photo('📖', 'Reformers used reason, scriptures and modern education to challenge harmful practices.'),
        p('In the 19th century, educated Indians began to question practices such as sati, child marriage, the ban on widow remarriage, caste discrimination and idol worship. They argued using reason and their own reading of scriptures, and spread ideas through newspapers, schools and associations.'),
        def('Brahmo Samaj', 'Founded by Raja Rammohun Roy in 1828 (as the Brahmo Sabha) in Calcutta. It worshipped one formless God, opposed idol worship, caste and sati, and supported women’s education. Rammohun Roy’s campaign helped bring the law abolishing sati in 1829.'),
        def('Arya Samaj', 'Founded by Swami Dayanand Saraswati in 1875 in Bombay. Its slogan was “Go back to the Vedas”; it opposed idol worship, child marriage and caste discrimination, and set up DAV schools. It was active in Hyderabad State too.'),
        def('Aligarh Movement', 'Led by Sir Syed Ahmad Khan, who founded the Muhammadan Anglo-Oriental College at Aligarh in 1875 (later Aligarh Muslim University) to spread modern, scientific education among Muslims.'),
        p('Other reformers included Ishwar Chandra Vidyasagar (Widow Remarriage Act, 1856) and, in the Telugu region, Kandukuri Veeresalingam, who arranged widow remarriages from 1881 and started schools for girls. Among Muslims, the Ahmadiyya movement and leaders like Mumtaz Ali (who wrote on women’s rights) also called for reform.'),
        keys('Brahmo Samaj 1828 — Rammohun Roy — against sati.', 'Arya Samaj 1875 — Dayanand Saraswati — “Back to the Vedas”.', 'Aligarh, 1875 — Sir Syed Ahmad Khan — modern education.', 'Vidyasagar and Veeresalingam — widow remarriage.'),
        remember('Kandukuri Veeresalingam is called the father of the Telugu renaissance.'),
        tip('Pair each reformer with one cause: Roy–sati, Vidyasagar–widows, Sir Syed–education, Dayanand–Vedas.'),
      ],
      examples: [
        ex('How did Rammohun Roy argue against sati?', ['He showed that ancient texts did not require sati.', 'He argued from reason and humanity that it was cruel.', 'He petitioned the government, and sati was banned in 1829.'], 'With scriptures, reason and petitions — leading to the 1829 ban'),
        ex('Why did Sir Syed Ahmad Khan stress modern education?', ['He felt Muslims were falling behind in jobs and public life.', 'Modern science and English education would help them progress.', 'So he founded the MAO College in 1875.'], 'To help Muslims progress through scientific education'),
      ],
      practice: [
        timelineT('tl', 'Arrange these reform events in time order.', c19Events.slice(0, 7), ['The Brahmo Sabha came first.', 'Veeresalingam’s widow remarriage was in 1881.']),
        mcq('mcq', 'Match reformers with their organisations and causes.', [
          ['The Brahmo Samaj was founded by…', 'Raja Rammohun Roy', ['Swami Dayanand Saraswati', 'Sir Syed Ahmad Khan', 'Jyotirao Phule'], 'He fought sati.', 'Rammohun Roy founded the Brahmo Sabha in 1828.'],
          ['“Go back to the Vedas” was the call of the…', 'Arya Samaj', ['Brahmo Samaj', 'Aligarh Movement', 'Satyashodhak Samaj'], 'Founded by Dayanand Saraswati.', 'The Arya Samaj looked to the Vedas.'],
          ['Sir Syed Ahmad Khan founded the MAO College at…', 'Aligarh', ['Calcutta', 'Pune', 'Hyderabad'], 'Later a famous university.', 'MAO College at Aligarh (1875) became Aligarh Muslim University.'],
          ['Sati was abolished by law in…', '1829', ['1856', '1947', '1775'], 'Under Lord William Bentinck.', 'Sati was banned in 1829.'],
          ['Who arranged widow remarriages in Rajahmundry from 1881?', 'Kandukuri Veeresalingam', ['Bhagya Reddy Varma', 'Sree Narayana Guru', 'Swami Vivekananda'], 'Father of the Telugu renaissance.', 'Veeresalingam championed widow remarriage in Andhra.'],
          ['The Widow Remarriage Act (1856) owed much to…', 'Ishwar Chandra Vidyasagar', ['Bal Gangadhar Tilak', 'Lord Curzon', 'Annie Besant'], 'A Bengali scholar.', 'Vidyasagar campaigned for the 1856 Act.'],
        ]),
        matchT('match', 'reformer to the cause or organisation', [
          ['Rammohun Roy', 'Brahmo Samaj; against sati'], ['Dayanand Saraswati', 'Arya Samaj'], ['Sir Syed Ahmad Khan', 'Aligarh, modern education'],
          ['Vidyasagar', 'Widow Remarriage Act, 1856'], ['Veeresalingam', 'Telugu social reform; widow remarriage'], ['Mumtaz Ali', 'Wrote for Muslim women’s rights'],
        ], ['Roy and sati go together.', 'Veeresalingam worked in the Telugu region.']),
      ],
    },
    {
      id: 'ts8.ss.reform.women', title: 'Reform and women; reform in the Nizam’s dominions', prereqs: ['ts8.ss.reform.samaj'],
      intro: [
        h('Opening doors for women'),
        photo('👩', 'Women reformers fought for education, widows’ rights and an end to child marriage.'),
        p('Reformers believed that society could not progress if half its members were kept uneducated and powerless. Savitribai Phule and Jyotirao Phule opened a school for girls in Pune in 1848; Savitribai became one of India’s first women teachers and faced abuse for it. Pandita Ramabai set up the Sharada Sadan for widows. Tarabai Shinde wrote “Stri Purush Tulana” (1882) comparing the treatment of men and women. Laws followed, such as the Child Marriage Restraint (Sarda) Act of 1929.'),
        p('In the Nizam’s dominions too, reform grew. Girls’ schools were opened in Hyderabad, such as the Mahbubia Girls’ School (1907). Sarojini Naidu of Hyderabad became a celebrated poet and national leader. Telugu women’s associations (Andhra Mahila Sabhas) held conferences; reformers campaigned against child marriage and for widows’ education. The Arya Samaj, Brahmo Samaj and Muslim reformers worked in Hyderabad, and the Telugu library movement helped spread new ideas.'),
        def('Child marriage', 'Marriage of children below the legal age. Today the legal minimum age is 18 for women and 21 for men (Prohibition of Child Marriage Act, 2006).'),
        keys('Savitribai Phule: girls’ school 1848, first woman teacher.', 'Sarda Act 1929 against child marriage.', 'Hyderabad: girls’ schools, women’s associations, Sarojini Naidu.', 'Education was the key to women’s progress.'),
        remember('Savitribai Phule’s birthday, 3 January, is observed in Maharashtra as Balika Din (Girls’ Day).'),
        tip('In answers on women’s reform, include education, widow remarriage and child marriage.'),
      ],
      examples: [
        ex('Why did Savitribai Phule face hostility for teaching girls?', ['Many people believed girls should not be educated.', 'Caste orthodoxy also opposed her teaching girls of all castes.', 'People threw mud and stones at her, but she continued.'], 'Because educating girls challenged social customs'),
        ex('Name two ways reform reached women in Hyderabad State.', ['Girls’ schools such as Mahbubia Girls’ School were started.', 'Women’s associations and conferences discussed child marriage and education.'], 'Girls’ schools and women’s associations'),
      ],
      practice: [
        mcq('mcq', 'Women’s reform: people, places, laws.', [
          ['India’s first girls’ school started by the Phules was in…', 'Pune, 1848', ['Calcutta, 1828', 'Hyderabad, 1907', 'Aligarh, 1875'], 'In Maharashtra.', 'Savitribai and Jyotirao Phule started it in Pune in 1848.'],
          ['The Child Marriage Restraint Act (1929) is also known as the…', 'Sarda Act', ['Rowlatt Act', 'Ilbert Bill', 'Vernacular Press Act'], 'Named after Har Bilas Sarda.', 'It is popularly called the Sarda Act.'],
          ['Sarojini Naidu, from Hyderabad, was famous as a…', 'Poet and freedom fighter', ['Cricketer', 'Scientist', 'Film director'], '“Nightingale of India”.', 'She was a poet and a leader of the national movement.'],
          ['“Stri Purush Tulana” (1882) was written by…', 'Tarabai Shinde', ['Pandita Ramabai', 'Savitribai Phule', 'Annie Besant'], 'A comparison of men and women.', 'Tarabai Shinde wrote it.'],
          ['Today’s legal minimum age of marriage for women in India is…', '18 years', ['14 years', '16 years', '25 years'], 'Same as the voting age.', 'It is 18 for women and 21 for men.'],
        ]),
        tapT('tap', 'Tap every reform that improved the lives of women.', [
          ['Opening schools for girls', true], ['Allowing widow remarriage', true], ['Banning sati', true], ['Raising the age of marriage', true],
          ['Banning girls from schools', false], ['Encouraging child marriage', false], ['Forcing widows to shave their heads', false],
        ], ['Reforms expanded rights and choices.', 'Some options describe the old customs.'], 'Education, widow remarriage and laws against sati and child marriage helped women.'),
        matchT('match', 'person to the contribution', [
          ['Savitribai Phule', 'Among the first women teachers'], ['Pandita Ramabai', 'Sharada Sadan for widows'], ['Tarabai Shinde', 'Stri Purush Tulana'],
          ['Sarojini Naidu', 'Poet-leader from Hyderabad'], ['Har Bilas Sarda', 'Law against child marriage'], ['Vidyasagar', 'Widow Remarriage Act'],
        ], ['Two worked with widows.', 'Sarda’s name is on a law.']),
      ],
    },
    {
      id: 'ts8.ss.reform.caste', title: 'Anti-caste reformers; women and Dalits in the freedom movement', prereqs: ['ts8.ss.reform.women'],
      intro: [
        h('Equality for all castes'),
        photo('📜', 'Anti-caste reformers demanded dignity, education and equal rights for those oppressed by caste.'),
        def('Jyotirao Phule', 'Founded the Satyashodhak Samaj (Society of Truth Seekers) in 1873 and wrote “Gulamgiri” (Slavery). He opposed caste hierarchy and worked for education of lower castes and women.'),
        def('Sree Narayana Guru', 'A reformer of Kerala who preached “One caste, one religion, one God for man”, built temples open to all and promoted education; the SNDP Yogam (1903) carried his work forward.'),
        def('Dr B. R. Ambedkar', 'Born into a Dalit family, he became a scholar and lawyer. He led the Mahad Satyagraha (1927) for the right to use a public water tank, fought for political rights (Poona Pact, 1932), and later chaired the Drafting Committee of the Constitution, which abolished untouchability (Article 17).'),
        def('Bhagya Reddy Varma', 'A Dalit reformer of Hyderabad (1888–1939) who founded the Jagan Mitra Mandali (1906), led the Adi-Hindu movement, ran many schools for Dalit children and campaigned against the devadasi system and untouchability.'),
        p('Women and Dalits also joined the freedom movement — in satyagrahas, picketing, and jail-going. Leaders like Sarojini Naidu, Aruna Asaf Ali and Durgabai Deshmukh, and Dalit leaders and workers, made the movement more inclusive. Ambedkar argued that political freedom must come with social equality.'),
        keys('Phule: Satyashodhak Samaj 1873; Gulamgiri.', 'Sree Narayana Guru: “One caste, one religion, one God”.', 'Ambedkar: Mahad 1927; Constitution; Article 17.', 'Bhagya Reddy Varma: Hyderabad, Jagan Mitra Mandali 1906, Adi-Hindu movement.'),
        remember('Article 17 of the Constitution abolishes untouchability and makes its practice an offence.'),
        tip('Remember a Telangana reformer: Bhagya Reddy Varma, the Adi-Hindu movement.'),
      ],
      examples: [
        ex('What was the Mahad Satyagraha about?', ['In 1927 at Mahad (Maharashtra), Dalits were not allowed to draw water from a public tank.', 'Ambedkar led thousands to drink water from it.', 'It asserted equal rights to public resources.'], 'The right of Dalits to use a public water tank'),
        ex('How did Bhagya Reddy Varma work for Dalits in Hyderabad?', ['He founded the Jagan Mitra Mandali (1906) and led the Adi-Hindu movement.', 'He started schools for Dalit children.', 'He campaigned against untouchability and the devadasi system.'], 'Through organisations, schools and campaigns against discrimination'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events in order.', c19Events.slice(4), ['Phule’s Samaj (1873) came just before the Arya Samaj (1875).', 'Mahad came in the 1920s.']),
        mcq('mcq', 'Anti-caste reformers and their work.', [
          ['“Gulamgiri” was written by…', 'Jyotirao Phule', ['B. R. Ambedkar', 'Sree Narayana Guru', 'Rammohun Roy'], 'Founder of the Satyashodhak Samaj.', 'Phule wrote Gulamgiri in 1873.'],
          ['“One caste, one religion, one God for man” was the message of…', 'Sree Narayana Guru', ['Swami Dayanand', 'Sir Syed Ahmad Khan', 'Mahatma Gandhi'], 'A Kerala reformer.', 'Sree Narayana Guru preached this message.'],
          ['The Mahad Satyagraha (1927) was led by…', 'Dr B. R. Ambedkar', ['Jyotirao Phule', 'Bhagya Reddy Varma', 'Vinoba Bhave'], 'Water tank.', 'Ambedkar led it for access to a public tank.'],
          ['Bhagya Reddy Varma worked mainly in…', 'Hyderabad', ['Kerala', 'Bengal', 'Punjab'], 'Adi-Hindu movement.', 'He was a Dalit reformer of Hyderabad.'],
          ['Which Article abolishes untouchability?', 'Article 17', ['Article 21', 'Article 32', 'Article 370'], 'In Part III.', 'Article 17 abolishes untouchability.'],
          ['The Satyashodhak Samaj was founded in…', '1873', ['1828', '1906', '1947'], 'Society of Truth Seekers.', 'Phule founded it in 1873.'],
        ]),
        matchT('match', 'reformer to the contribution', [
          ['Jyotirao Phule', 'Satyashodhak Samaj'], ['Sree Narayana Guru', 'Temples and education for all in Kerala'], ['B. R. Ambedkar', 'Mahad Satyagraha; Constitution'],
          ['Bhagya Reddy Varma', 'Adi-Hindu movement in Hyderabad'], ['Aruna Asaf Ali', 'Hoisted the flag in Bombay, Quit India 1942'], ['Durgabai Deshmukh', 'Freedom fighter and Constituent Assembly member'],
        ], ['One reformer worked in Hyderabad.', 'Two women freedom fighters.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 20 — Understanding Secularism
// =====================================================================================
const ch20: USpec = {
  id: 'ts8.ss.ch20', subject: 'social', title: 'Understanding Secularism', source: src(20),
  objectives: [
    {
      id: 'ts8.ss.sec.meaning', title: 'What is secularism?', prereqs: ['ts8.ss.const.preamble'],
      intro: [
        h('A State for all faiths'),
        photo('🕊️', 'In a secular State, people of every religion — and of none — are equal citizens.'),
        p('India is home to Hindus, Muslims, Christians, Sikhs, Buddhists, Jains, Parsis, Jews, tribal faiths and people who follow no religion. In Telangana, people of many faiths celebrate Bonalu, Bathukamma, Ramzan, Christmas and Sammakka Saralamma together. A diverse country needs a way to treat all equally.'),
        def('Secularism', 'The separation of religion from the power of the State: the State has no official religion, does not favour or discriminate against any religion, and protects every person’s freedom to follow, practise and propagate any religion — or none.'),
        p('The Constitution guarantees: equality before law (Article 14), no discrimination on grounds of religion (Article 15), freedom of conscience and religion (Article 25), freedom to manage religious affairs (Article 26), no tax for promoting a particular religion (Article 27), and no religious instruction in fully State-funded schools (Article 28).'),
        keys('No official State religion.', 'Equal treatment of all religions.', 'Freedom to follow any religion or none.', 'Articles 25–28 on freedom of religion.'),
        remember('Secularism does not mean being against religion; it means the State keeps an equal and principled distance from all religions.'),
        tip('Test: Is the State favouring or punishing anyone because of religion? If yes, that is not secular.'),
      ],
      examples: [
        ex('A government school prayer requires all students to follow the rituals of one religion. Is this consistent with secularism?', ['Fully State-funded schools cannot impose religious instruction (Article 28).', 'Forcing one religion’s rituals favours that religion.'], 'No — it violates secular principles'),
        ex('A citizen chooses to follow no religion. Can the State penalise him?', ['Freedom of conscience includes the freedom to follow no religion.', 'The State cannot discriminate on grounds of religion.'], 'No — he is an equal citizen'),
      ],
      practice: [
        tp('judge', (r) => {
          const [s, ok, why] = r.pick<[string, boolean, string]>([
            ['A government office gives jobs only to people of one religion.', false, 'The State cannot discriminate on grounds of religion (Articles 15 and 16).'],
            ['A student is allowed to wear a religious symbol while following the school uniform otherwise.', true, 'Respecting individual religious practice is part of religious freedom.'],
            ['The government declares one religion as the official State religion.', false, 'India has no official State religion.'],
            ['The government bans untouchability even in temples.', true, 'The State may intervene in religion to protect equality and dignity.'],
            ['People of all faiths are free to build their own places of worship following the law.', true, 'Freedom to practise religion applies to all equally.'],
            ['A citizen is denied a ration card because of his religion.', false, 'Public benefits cannot depend on religion.'],
          ]);
          const ans = ok ? 'Consistent with secularism' : 'Not consistent with secularism';
          return {
            type: 'mcq', prompt: `Is this consistent with Indian secularism? “${s}”`, ...choose(r, ans, [ok ? 'Not consistent with secularism' : 'Consistent with secularism', 'Secularism has nothing to say about this']),
            hints: ['Ask: is anyone favoured or harmed because of religion?', 'The State may act to protect equality even within religion.'],
            mistakes: [{ when: 'wrong', explain: why }], solution: [ans + '.', why],
          };
        }, 2),
        mcq('mcq', 'Secularism = State neutrality + religious freedom.', [
          ['Secularism means…', 'The State has no official religion and treats all equally', ['Banning all religions', 'One religion for all citizens', 'Religious leaders run the government'], 'Separation of religion and State power.', 'A secular State is neutral among religions.'],
          ['Freedom of conscience and religion is guaranteed by…', 'Article 25', ['Article 17', 'Article 21A', 'Article 370'], 'Part of Articles 25–28.', 'Article 25 gives freedom of conscience and religion.'],
          ['Religious instruction in fully State-funded schools is…', 'Not allowed (Article 28)', ['Compulsory', 'Allowed for one religion only', 'Decided by each teacher'], 'State schools must be neutral.', 'Article 28 forbids it.'],
          ['Can a person in India follow no religion?', 'Yes — that is part of freedom of conscience', ['No, everyone must choose one', 'Only with permission', 'Only after 60'], 'Conscience.', 'Freedom of conscience includes non-belief.'],
          ['Which festival list shows Telangana’s diversity?', 'Bathukamma, Ramzan, Christmas, Bonalu', ['Only Bathukamma', 'Only Christmas', 'None'], 'Many faiths.', 'People of many faiths celebrate together.'],
        ]),
        matchT('match', 'Article to what it guarantees', [
          ['Article 14', 'Equality before law'], ['Article 15', 'No discrimination on grounds of religion'], ['Article 25', 'Freedom of conscience and religion'],
          ['Article 26', 'Freedom to manage religious affairs'], ['Article 27', 'No tax to promote a particular religion'], ['Article 28', 'No religious instruction in State schools'],
        ], ['14 and 15 are about equality.', '25 to 28 are about religion.']),
      ],
    },
    {
      id: 'ts8.ss.sec.why', title: 'Why separate religion from the State?', prereqs: ['ts8.ss.sec.meaning'],
      intro: [
        h('Protecting everyone from domination'),
        photo('⚖', 'Separating religion from State power protects both minorities and individuals.'),
        p('If a State became tied to one religion, members of other religions might be treated as second-class citizens — denied jobs, punished for their beliefs or forced to convert. History offers examples: religious persecution in Europe, and discrimination against minorities in many countries. Democracy is not just rule of the majority; it must protect the rights of minorities too.'),
        def('Tyranny of the majority', 'When a majority uses its numbers to deny the rights of minorities. Secularism guards against this.'),
        p('Separation also protects freedom within a religion: individuals should be free to interpret their faith, to change it, or to leave it, without being forced by religious groups using State power. And it protects religion itself from being used for political ends.'),
        keys('Prevents domination of one religion over others.', 'Protects minorities from discrimination.', 'Protects individual freedom within religions.', 'Prevents misuse of religion for politics.'),
        remember('Democracy = majority rule + protection of minority rights.'),
        tip('Give three reasons: protect minorities, protect individuals, keep the State fair to all.'),
      ],
      examples: [
        ex('Why is secularism especially important in a diverse country like India?', ['India has people of many religions and none.', 'If the State favoured one, others would feel excluded and conflict could grow.', 'Equal treatment keeps unity and protects rights.'], 'To keep unity and protect the rights of all'),
        ex('How does separation protect an individual inside a religious community?', ['Without it, a powerful group might use State power to force rules on members.', 'Secularism lets each person interpret or leave their religion freely.'], 'It stops religious groups using State power to coerce members'),
      ],
      practice: [
        mcq('mcq', 'Why secularism matters.', [
          ['“Tyranny of the majority” means…', 'A majority using its power to deny minorities’ rights', ['Minorities ruling the majority', 'An army ruling the country', 'A fair election'], 'Numbers used unfairly.', 'Secularism protects against this.'],
          ['One reason to separate religion from the State is…', 'To prevent one religion dominating others', ['To ban festivals', 'To make one religion official', 'To stop people praying'], 'Equality.', 'Separation prevents domination.'],
          ['Secularism protects individuals by…', 'Letting them interpret, change or leave their religion freely', ['Forcing them to join a religion', 'Banning all beliefs', 'Making temples government offices'], 'Freedom within religion.', 'The State cannot help any group coerce its members.'],
          ['Democracy means majority rule along with…', 'Protection of minority rights', ['Rule by one religion', 'No elections', 'Rule by the army'], 'Not majority alone.', 'Rights of minorities must be protected.'],
          ['Which situation shows the danger secularism prevents?', 'A government denying jobs to people of a minority faith', ['A family celebrating a festival', 'A student visiting a temple, mosque and church', 'People choosing their own religion'], 'Discrimination by the State.', 'Denying jobs on religious grounds is State discrimination.'],
        ]),
        tapT('tap', 'Tap every GOOD reason for separating religion from State power.', [
          ['To protect religious minorities from discrimination', true], ['To protect individual freedom of belief', true], ['To stop religion being misused for political power', true], ['To keep the State fair to all citizens', true],
          ['To ban all religious festivals', false], ['To force everyone to become non-religious', false], ['To give one religion special powers', false],
        ], ['Secularism is not anti-religion.', 'It is about fairness and freedom.'], 'Secularism protects minorities, individuals and fairness.'),
        orderT('order', 'Arrange the argument for secularism logically.', ['India has people of many faiths and of none', 'If the State favours one faith, others may face discrimination', 'Discrimination violates equal citizenship and causes conflict', 'So the State must keep a principled distance from all religions'], ['Start with the fact of diversity.', 'End with the conclusion.'], 'Diversity → risk of favouritism → harm → need for secularism.'),
      ],
    },
    {
      id: 'ts8.ss.sec.indian', title: 'Indian secularism', prereqs: ['ts8.ss.sec.why'],
      intro: [
        h('India’s own model'),
        photo('🛕', 'Indian secularism respects all religions while allowing the State to act for equality and reform.'),
        p('In some countries, such as the USA and France, there is a strict wall between religion and State: the State does not interfere in religion at all, and religion does not influence the State (France’s laïcité even limits religious symbols in public schools). Indian secularism is different.'),
        def('Principled distance', 'The Indian State keeps a distance from all religions but may intervene in religious matters to uphold the Constitution’s values — equality, dignity and freedom — for example, abolishing untouchability and allowing temple entry for all castes.'),
        p('The Indian State also supports religions equally in some ways: it can give aid to educational institutions run by religious communities, and respects personal laws. It does not mean the State has no contact with religion; it means fairness and equal respect (sarva dharma samabhava) along with the power to reform discriminatory practices. The word “secular” was added to the Preamble in 1976, but secular values were present from 1950.'),
        keys('USA/France: strict separation.', 'India: principled distance; equal respect; State may intervene for equality.', 'Example: abolition of untouchability, temple-entry laws.', '“Secular” added to Preamble in 1976.'),
        remember('Indian secularism = equal respect for all religions + intervention to protect rights.'),
        tip('Contrast: “wall of separation” (USA) vs “principled distance” (India).'),
      ],
      examples: [
        ex('The law allows Dalits to enter all public temples. Does this violate secularism?', ['The State is intervening in a religious practice.', 'But it does so to uphold equality and end untouchability (Article 17).', 'Indian secularism allows such principled intervention.'], 'No — it fits India’s model of principled distance'),
        ex('How is Indian secularism different from the American model?', ['In the USA, the State and religion strictly stay out of each other’s affairs.', 'In India, the State may intervene to reform religious practices that violate rights, and may support all religions equally.'], 'India allows principled intervention; the USA keeps a strict wall'),
      ],
      practice: [
        mcq('mcq', 'Principled distance is the key idea.', [
          ['Indian secularism is best described as…', 'Principled distance and equal respect for all religions', ['A strict wall with no contact ever', 'Rule by one religion', 'Hostility to religion'], 'The State may intervene for equality.', 'India follows principled distance.'],
          ['An example of the Indian State intervening in religion for equality is…', 'Abolishing untouchability', ['Choosing an official religion', 'Banning all prayers', 'Closing all temples'], 'Article 17.', 'The State abolished untouchability, including in religious places.'],
          ['Which country follows a strict separation of religion and State?', 'France', ['India', 'Saudi Arabia', 'Vatican City'], 'Laïcité.', 'France keeps a strict separation.'],
          ['“Sarva dharma samabhava” means…', 'Equal respect for all religions', ['One religion above all', 'No religion allowed', 'Religion controls the State'], 'Sama = equal.', 'It means equal regard for all faiths.'],
          ['The word “secular” was added to the Preamble in…', '1976', ['1950', '1947', '2002'], '42nd Amendment.', 'It was added by the 42nd Amendment in 1976.'],
        ]),
        matchT('match', 'model or example to its description', [
          ['USA', 'Wall of separation'], ['France', 'Laïcité — strict public neutrality'], ['India', 'Principled distance'],
          ['Temple-entry laws', 'Intervention for equality'], ['Article 17', 'Abolition of untouchability'], ['42nd Amendment', 'Added “secular” to the Preamble'],
        ], ['Three countries, three models.', 'Article 17 is about untouchability.']),
        tapT('tap', 'Tap every feature of INDIAN secularism.', [
          ['No official State religion', true], ['Equal respect for all religions', true], ['State may reform discriminatory religious practices', true], ['Freedom to practise and propagate religion', true],
          ['State promotes one religion', false], ['State bans all religious practice', false], ['Religious leaders make the country’s laws', false],
        ], ['Equal respect + reform for rights.', 'Neither theocracy nor hostility.'], 'Indian secularism is neutral, respectful of all faiths and committed to equality.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 21 — Performing Arts and Artistes in Modern Times
// =====================================================================================
const ch21: USpec = {
  id: 'ts8.ss.ch21', subject: 'social', title: 'Performing Arts and Artistes in Modern Times', source: src(21),
  objectives: [
    {
      id: 'ts8.ss.arts.folk', title: 'Folk and classical dance forms of Telangana and the Telugu region', prereqs: [],
      intro: [
        h('Dance in every village'),
        photo('🥁', 'Drums, songs and dance accompany festivals, harvests and worship across Telangana.'),
        def('Yakshaganam', 'A traditional dance-drama with songs and dialogue telling stories from epics and puranas, performed through the night in villages by travelling troupes.'),
        def('Gusadi', 'A dance of the Raj Gond tribe of Adilabad performed during the Dandari festival around Deepavali; dancers wear huge headgear of peacock feathers and decorate their bodies.'),
        def('Lambadi dance', 'A dance of the Lambada (Banjara) community, performed by women in colourful embroidered clothes with mirrors, bangles and jewellery, often at festivals like Teej.'),
        def('Kuchipudi', 'A classical dance form named after the village of Kuchipudi (Krishna district, Andhra Pradesh), shaped by Siddhendra Yogi; earlier performed by male Brahmin troupes as dance-drama, it is now performed widely by women and men.'),
        p('Other Telangana forms include Perini Sivatandavam (a vigorous warrior dance of the Kakatiya period, revived in modern times by Nataraja Ramakrishna), Oggu Katha (storytelling by Kuruma devotees of Mallanna), Bathukamma and Kolatam (women’s group dances with songs and sticks), and Dappu and Chindu performances.'),
        keys('Gusadi — Raj Gonds of Adilabad, Dandari festival.', 'Lambadi — Banjara women, mirror-work costumes.', 'Kuchipudi — classical, from Kuchipudi village.', 'Perini — Kakatiya warrior dance, revived by Nataraja Ramakrishna.'),
        remember('Kuchipudi is one of India’s recognised classical dance forms; Perini was revived from Kakatiya temple sculptures.'),
        tip('Link each dance with a community or place.'),
      ],
      examples: [
        ex('How are folk dances different from classical dances?', ['Folk dances belong to communities and are learned informally, often at festivals.', 'Classical dances follow detailed texts and rules and are learned through long training.'], 'Folk = community tradition; classical = codified and formally trained'),
        ex('Why is Perini called a warrior dance?', ['It was performed by soldiers before battle in the Kakatiya period.', 'Its vigorous movements were meant to invoke Shiva’s energy.'], 'It was danced by warriors to prepare for battle'),
      ],
      practice: [
        matchT('match', 'dance form to its community or origin', [
          ['Gusadi', 'Raj Gonds of Adilabad'], ['Lambadi', 'Banjara women'], ['Kuchipudi', 'Village in Krishna district'], ['Perini Sivatandavam', 'Kakatiya warrior dance'],
          ['Oggu Katha', 'Storytelling by Kuruma devotees'], ['Yakshaganam', 'All-night dance-drama of epics'],
        ], ['Gusadi has peacock-feather headgear.', 'Perini goes back to the Kakatiyas.']),
        mcq('mcq', 'Link dance, community and festival.', [
          ['Gusadi is performed during the…', 'Dandari festival', ['Sankranti kite festival', 'Christmas', 'Holi'], 'Around Deepavali in Adilabad.', 'Raj Gonds perform Gusadi during Dandari.'],
          ['Kuchipudi takes its name from…', 'A village in Krishna district', ['A river in Telangana', 'A king of Golconda', 'A British officer'], 'A place name.', 'It is named after Kuchipudi village.'],
          ['Perini Sivatandavam was revived by…', 'Nataraja Ramakrishna', ['Rukmini Devi Arundale', 'Siddhendra Yogi', 'Uday Shankar'], 'He studied temple sculptures.', 'Nataraja Ramakrishna revived Perini.'],
          ['Lambadi dancers wear…', 'Colourful clothes with mirrors and heavy jewellery', ['Plain white robes only', 'Raincoats', 'School uniforms'], 'Banjara embroidery.', 'Mirror-work costumes are typical.'],
          ['Yakshaganam is a…', 'Dance-drama based on epics and puranas', ['Kind of drum', 'Board game', 'Type of boat'], 'Performed through the night.', 'It combines dance, song and dialogue.'],
        ]),
        tapT('tap', 'Tap every FOLK or tribal performing art of Telangana.', [
          ['Gusadi', true], ['Lambadi', true], ['Oggu Katha', true], ['Kolatam', true], ['Bathukamma songs and dance', true],
          ['Kathakali of Kerala', false], ['Ballet of Russia', false], ['Flamenco of Spain', false],
        ], ['Look for Telangana communities.', 'Kathakali, ballet and flamenco are from elsewhere.'], 'Gusadi, Lambadi, Oggu Katha, Kolatam and Bathukamma are Telangana traditions.'),
      ],
    },
    {
      id: 'ts8.ss.arts.burra', title: 'Burrakatha and puppetry (tholubommalata) in modern times', prereqs: ['ts8.ss.arts.folk'],
      intro: [
        h('Stories that travel'),
        photo('🎵', 'A burrakatha troupe uses a drone instrument, drums and lively talk to tell a story.'),
        def('Burrakatha', 'A Telugu storytelling form performed by a team of three: the main narrator plays a tambura (with a hollow, skull-shaped “burra”) and sings, while two companions play small drums (dakki) and add humour and political comment.'),
        p('In the 1940s burrakatha was used to spread nationalist and social messages; troupes performed stories of freedom fighters and peasants’ struggles. Sunkara Satyanarayana wrote famous burrakathas, and Shaik Nazar was a celebrated performer. Later it was used for awareness campaigns on literacy, health and elections.'),
        def('Tholu bommalata', 'Leather puppetry: large, colourful, translucent puppets made from animal hide are moved behind a lit cloth screen, while singers narrate stories from the Ramayana and Mahabharata. Artisans of Nimmalakunta (Anantapur, Andhra Pradesh) are famous for these puppets.'),
        p('With cinema, television and mobile phones, audiences for burrakatha and puppetry shrank and many artistes lost their livelihoods. Their children often took other jobs. Revival efforts include government pensions for artistes, festivals, training workshops, and puppeteers making lamps, wall hangings and other craft items from leather for sale.'),
        keys('Burrakatha: three performers, tambura and drums, songs and humour.', 'Used for nationalist and social messages from the 1940s.', 'Tholu bommalata: leather shadow puppets; Nimmalakunta.', 'Decline due to cinema and TV; revival through support and crafts.'),
        remember('“Burra” refers to the hollow, skull-shaped part of the tambura used in burrakatha.'),
        tip('When asked why folk arts declined, mention new entertainment media and loss of patronage.'),
      ],
      examples: [
        ex('Why did burrakatha become popular in the freedom movement?', ['It was easy to understand, entertaining and could be performed anywhere.', 'It told stories of heroes and injustice in people’s own language.', 'So it spread political awareness among villagers.'], 'It carried nationalist messages to ordinary people in their language'),
        ex('How have tholu bommalata artisans adapted to changing times?', ['Fewer shows are booked now.', 'They make leather lamp shades, wall hangings and decorative items.', 'They perform at festivals and workshops with government and NGO support.'], 'By making leather crafts and performing at festivals'),
      ],
      practice: [
        mcq('mcq', 'Burrakatha and tholu bommalata.', [
          ['A burrakatha troupe usually has…', 'Three performers', ['One performer', 'Twenty dancers', 'Only puppets'], 'A narrator and two companions.', 'The main singer is supported by two drummers.'],
          ['Tholu bommalata puppets are made of…', 'Leather', ['Clay', 'Plastic', 'Glass'], 'Tholu = skin.', 'They are made from treated animal hide.'],
          ['Nimmalakunta is famous for…', 'Leather puppets', ['Coal mines', 'Silk saris', 'Tiger reserve'], 'In Anantapur district.', 'Its artisans make leather puppets and crafts.'],
          ['A main reason for the decline of burrakatha was…', 'Cinema, television and new media', ['Lack of stories', 'Ban by law', 'Shortage of drums'], 'New entertainment.', 'Audiences moved to cinema and TV.'],
          ['During the 1940s burrakatha was used to…', 'Spread nationalist and social messages', ['Sell soap', 'Teach mathematics only', 'Celebrate the British Empire'], 'Political awareness.', 'Troupes told stories of struggle and freedom.'],
        ]),
        tapT('tap', 'Tap every way to help traditional performing artistes survive.', [
          ['Pensions for elderly artistes', true], ['Festivals and stage opportunities', true], ['Training young learners', true], ['Selling crafts made by artisans', true],
          ['Banning folk performances', false], ['Ignoring their work in schools', false], ['Replacing them with recorded music only', false],
        ], ['Support = income, audience, learners.', 'Bans and neglect harm them.'], 'Income, audiences and new learners keep arts alive.'),
        matchT('match', 'term to its meaning', [
          ['Burra', 'Hollow part of the tambura'], ['Dakki', 'Small drum in burrakatha'], ['Tholu bommalata', 'Leather shadow-puppet play'],
          ['Screen and lamp', 'Used to show shadow puppets'], ['Sunkara Satyanarayana', 'Wrote famous burrakathas'], ['Nimmalakunta', 'Village of puppet-makers'],
        ], ['Two instruments.', 'Shadow puppets need light.']),
      ],
    },
    {
      id: 'ts8.ss.arts.bharat', title: 'Decline and revival of Bharatanatyam', prereqs: ['ts8.ss.arts.burra'],
      intro: [
        h('From temple to stage'),
        photo('🎨', 'Bharatanatyam today is performed on stages across India and the world.'),
        p('The dance now called Bharatanatyam was earlier known as Sadir or Dasi Attam. It was performed mainly by devadasis — women dedicated to temples — and supported by temples and royal courts. In colonial times, temple and court patronage declined, and the devadasi system came to be linked with exploitation of women. From the 1890s an anti-nautch campaign by social reformers sought to end dedication of girls to temples and the dances associated with it.'),
        def('Devadasi system', 'A practice of dedicating girls to temple deities; though they were often skilled artists, many faced exploitation. It was outlawed by laws such as the Madras Devadasis (Prevention of Dedication) Act, 1947.'),
        p('In the 1930s, the dance was revived and renamed Bharatanatyam. E. Krishna Iyer promoted it publicly; Rukmini Devi Arundale learned it and founded Kalakshetra (1936) in Madras, presenting it on stage with new costumes and themes. T. Balasaraswati, from a hereditary devadasi family of musicians and dancers, kept the traditional style alive and won world fame. The revival raised the dance’s status, but also shifted it from hereditary communities to the urban middle classes.'),
        keys('Earlier names: Sadir, Dasi Attam.', 'Anti-nautch campaign from the 1890s; devadasi dedication banned (Madras Act, 1947).', 'Revival in the 1930s: E. Krishna Iyer, Rukmini Devi (Kalakshetra 1936), Balasaraswati.', 'Revival changed who danced and where.'),
        remember('Rukmini Devi Arundale founded Kalakshetra in 1936.'),
        tip('A balanced answer notes both the revival and the loss suffered by hereditary dance communities.'),
      ],
      examples: [
        ex('Why did Sadir decline in the late 19th century?', ['Royal and temple patronage weakened under colonial rule.', 'The anti-nautch campaign linked the dance with the exploitation of devadasis.', 'So public performances were discouraged.'], 'Loss of patronage and the anti-nautch campaign'),
        ex('Give one gain and one loss of the Bharatanatyam revival.', ['Gain: the dance won respect and spread worldwide through schools like Kalakshetra.', 'Loss: hereditary devadasi families lost their traditional place and livelihood.'], 'Wider respect vs loss for hereditary artistes'),
      ],
      practice: [
        timelineT('tl', 'Arrange these events in the story of Bharatanatyam.', [
          [1892, 'Anti-nautch campaign begins', '1890s'], [1930, 'E. Krishna Iyer promotes the dance publicly', '1930s'], [1936, 'Rukmini Devi founds Kalakshetra', '1936'],
          [1947, 'Madras Devadasis (Prevention of Dedication) Act', '1947'], [1977, 'Balasaraswati awarded the Padma Vibhushan', '1977'],
        ], ['The campaign against the old form came first.', 'Kalakshetra came in the 1930s.']),
        mcq('mcq', 'Decline and revival.', [
          ['Before the 1930s Bharatanatyam was called…', 'Sadir or Dasi Attam', ['Kathak', 'Odissi', 'Yakshaganam'], 'Performed by devadasis.', 'It was known as Sadir.'],
          ['Kalakshetra was founded in 1936 by…', 'Rukmini Devi Arundale', ['T. Balasaraswati', 'E. Krishna Iyer', 'Siddhendra Yogi'], 'In Madras.', 'Rukmini Devi founded Kalakshetra.'],
          ['T. Balasaraswati was important because she…', 'Preserved the traditional style from a hereditary family', ['Banned the dance', 'Founded the Arya Samaj', 'Invented Kuchipudi'], 'From a devadasi family.', 'She kept the hereditary style alive and won world fame.'],
          ['The anti-nautch campaign aimed to…', 'End the dedication of girls to temples and the related dances', ['Promote cinema', 'Build temples', 'Teach cricket'], 'Reform campaign.', 'Reformers opposed the devadasi system.'],
          ['The dedication of devadasis was banned in Madras in…', '1947', ['1829', '1856', '1990'], 'The year of independence.', 'The Madras Devadasis Act was passed in 1947.'],
        ]),
        matchT('match', 'person or term to its role', [
          ['Sadir', 'Earlier name of Bharatanatyam'], ['Devadasi', 'Woman dedicated to a temple'], ['Rukmini Devi Arundale', 'Founded Kalakshetra'],
          ['E. Krishna Iyer', 'Promoted the dance in the 1930s'], ['T. Balasaraswati', 'Hereditary artist of world fame'], ['Anti-nautch', 'Campaign against temple dance practices'],
        ], ['Kalakshetra’s founder was a woman.', 'Sadir is a name, not a person.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 22 — Film and Print Media
// =====================================================================================
const c22Events: EV[] = [
  [1556, 'First printing press in India set up in Goa', '1556'],
  [1780, 'Hicky’s Bengal Gazette, the first newspaper in India', '1780'],
  [1878, 'Vernacular Press Act restricts Indian-language newspapers', '1878'],
  [1896, 'Lumière brothers’ film show in Bombay', '1896'],
  [1913, 'Raja Harishchandra, first Indian feature film', '1913'],
  [1926, 'Golconda Patrika started in Hyderabad', '1926'],
  [1931, 'Alam Ara, first Indian sound film', '1931'],
];
const ch22: USpec = {
  id: 'ts8.ss.ch22', subject: 'social', title: 'Film and Print Media', source: src(22),
  objectives: [
    {
      id: 'ts8.ss.media.cinema', title: 'Evolution of cinema in India', prereqs: [],
      intro: [
        h('Moving pictures arrive'),
        photo('💡', 'Indian cinema grew from silent films to one of the largest film industries in the world.'),
        p('On 7 July 1896, the Lumière brothers’ moving pictures were shown in Bombay — the first film show in India. In 1913 Dadasaheb Phalke made Raja Harishchandra, the first full-length Indian feature film; it was silent, and men played women’s roles. In 1931 Alam Ara became the first Indian sound film (talkie). Soon after, Telugu sound films appeared, beginning with Bhakta Prahlada (1931–32), directed by H. M. Reddy.'),
        stepsB('1896: first film show in Bombay.', '1913: Raja Harishchandra — first Indian feature film (silent).', '1931: Alam Ara — first Indian talkie.', '1931–32: Bhakta Prahlada — first Telugu talkie.', 'From the 1950s: colour films; later television, video, digital cinema and streaming.'),
        p('Early films took stories from mythology because audiences knew them. Later, films took up social themes, romance, action and comedy. India now makes more films than almost any other country, in many languages; the Telugu film industry, centred in Hyderabad, is among the largest. The Dadasaheb Phalke Award (from 1969) is India’s highest award in cinema.'),
        keys('1896 first show; 1913 first feature; 1931 first talkie.', 'Dadasaheb Phalke: father of Indian cinema.', 'Bhakta Prahlada: first Telugu talkie.', 'Hyderabad: a major film-making centre.'),
        remember('Dadasaheb Phalke is called the father of Indian cinema.'),
        tip('Silent → sound → colour → digital: the four big steps.'),
      ],
      examples: [
        ex('How many years passed between the first Indian feature film and the first Indian talkie?', ['First feature: 1913.', 'First talkie: 1931.', '1931 − 1913 = 18 years.'], '18 years'),
        ex('Why did early Indian films choose mythological stories?', ['Audiences already knew the stories, so silent films were easy to follow.', 'They had religious and cultural appeal.'], 'Familiar stories made silent films easy to understand'),
      ],
      practice: [
        timelineT('tl', 'Arrange these milestones of print and film in time order.', c22Events, ['Printing came centuries before film.', 'The silent feature came before the talkie.']),
        mcq('mcq', 'Firsts of Indian cinema.', [
          ['The first Indian feature film was…', 'Raja Harishchandra (1913)', ['Alam Ara (1931)', 'Bhakta Prahlada (1932)', 'Mother India (1957)'], 'Made by Phalke.', 'Raja Harishchandra (1913) was the first.'],
          ['The first Indian talkie was…', 'Alam Ara (1931)', ['Raja Harishchandra', 'Malapilla', 'Sholay'], '“Talkie” = with sound.', 'Alam Ara was the first sound film.'],
          ['The first Telugu talkie was…', 'Bhakta Prahlada', ['Alam Ara', 'Mayabazar', 'Raja Harishchandra'], 'Directed by H. M. Reddy.', 'Bhakta Prahlada was the first Telugu talkie.'],
          ['India’s highest award in cinema is the…', 'Dadasaheb Phalke Award', ['Bharat Ratna', 'Arjuna Award', 'Jnanpith Award'], 'Named after the father of Indian cinema.', 'The Phalke Award was instituted in 1969.'],
          ['The first film show in India was held in…', 'Bombay, 1896', ['Hyderabad, 1913', 'Madras, 1931', 'Delhi, 1947'], 'By the Lumière brothers.', 'It was held on 7 July 1896.'],
        ]),
        tp('gap', (r) => {
          const pairs: [string, number, string, number][] = [
            ['the first film show in India', 1896, 'the first Indian feature film', 1913], ['the first Indian feature film', 1913, 'the first Indian talkie', 1931],
            ['the first film show in India', 1896, 'the first Indian talkie', 1931], ['the first Indian talkie', 1931, 'independence', 1947], ['the first Indian feature film', 1913, 'the first Dadasaheb Phalke Award', 1969],
          ];
          const [a, ya, b, yb] = r.pick(pairs);
          return numQ(`${a[0].toUpperCase() + a.slice(1)} was in ${ya}; ${b} was in ${yb}. How many years apart were they?`, yb - ya, ['Subtract the earlier year from the later year.', `${yb} − ${ya}`], [`${yb} − ${ya} = ${yb - ya} years`], [], 0.0001);
        }, 1),
      ],
    },
    {
      id: 'ts8.ss.media.industry', title: 'Cinema and the freedom movement; the film industry', prereqs: ['ts8.ss.media.cinema'],
      intro: [
        h('Films with a message'),
        photo('🎵', 'Films spread ideas of reform and freedom despite colonial censorship.'),
        p('The British censored films that showed nationalist ideas. Filmmakers used stories, songs and symbols to carry messages indirectly — Gandhi’s photo on a wall, a song about the motherland, or a character spinning the charkha. Telugu films such as Malapilla (1938), directed by Gudavalli Ramabrahmam, attacked untouchability; others supported widow remarriage and opposed dowry.'),
        def('Censorship', 'Official control over what can be shown or published. The Indian Cinematograph Act (1918) set up censorship of films in British India; today the Central Board of Film Certification (CBFC) certifies films.'),
        p('Today film is a large industry: producers, directors, actors, writers, musicians, technicians, studios, distributors and cinema halls employ lakhs of people. Hyderabad has major studios, including Ramoji Film City (opened 1996), one of the largest film studio complexes in the world. Films also face problems: piracy, high costs, and concerns about stereotypes and violence. Many films today are watched on streaming platforms.'),
        keys('Colonial censorship; indirect nationalist messages.', 'Malapilla (1938): against untouchability.', 'CBFC certifies films today.', 'Hyderabad: Ramoji Film City; large Telugu film industry.'),
        remember('Malapilla (1938) is remembered as a bold Telugu social reform film.'),
        tip('Name one Telugu film with a social message and one way filmmakers avoided censorship.'),
      ],
      examples: [
        ex('How did filmmakers avoid British censorship?', ['They used myths and historical stories with hidden meanings.', 'They used symbols like the charkha, the tricolour or Gandhi’s picture.', 'They used patriotic songs.'], 'Through symbols, songs and mythological stories'),
        ex('Give two kinds of jobs created by the film industry.', ['Creative jobs: actors, writers, musicians, directors.', 'Technical and business jobs: camera operators, editors, distributors, cinema hall staff.'], 'Creative and technical jobs'),
      ],
      practice: [
        mcq('mcq', 'Cinema, censorship and industry.', [
          ['Malapilla (1938) dealt with…', 'Untouchability', ['Space travel', 'Cricket', 'The First World War'], 'A social reform film.', 'Malapilla attacked untouchability.'],
          ['Films in India today are certified by…', 'The Central Board of Film Certification', ['The Election Commission', 'The RBI', 'The Supreme Court'], 'CBFC.', 'The CBFC certifies films for exhibition.'],
          ['Ramoji Film City is in…', 'Hyderabad', ['Mumbai', 'Chennai', 'Kolkata'], 'In Telangana.', 'Ramoji Film City is near Hyderabad.'],
          ['During British rule, nationalist messages in films were often shown through…', 'Symbols like the charkha and patriotic songs', ['Open calls for armed revolt', 'English subtitles only', 'Silent black screens'], 'Indirect methods.', 'Symbols and songs escaped censors.'],
          ['A problem faced by the film industry today is…', 'Piracy', ['Too few languages', 'No audiences at all', 'Ban on all music'], 'Illegal copies.', 'Piracy reduces income for filmmakers.'],
        ]),
        tapT('tap', 'Tap every job that is part of the film industry.', [
          ['Cinematographer', true], ['Music director', true], ['Film editor', true], ['Distributor', true], ['Script writer', true],
          ['Coal miner', false], ['Paddy farmer', false], ['Bank cashier', false],
        ], ['Think of who makes, finishes and sells a film.', 'Mining and farming are other sectors.'], 'Film needs creative, technical and business workers.'),
        matchT('match', 'item to its description', [
          ['Malapilla', '1938 Telugu film against untouchability'], ['Gudavalli Ramabrahmam', 'Director of Malapilla'], ['CBFC', 'Certifies films'],
          ['Ramoji Film City', 'Studio complex in Hyderabad'], ['Cinematograph Act, 1918', 'Started film censorship in British India'], ['Piracy', 'Illegal copying of films'],
        ], ['One film and its director.', 'Two are about censorship.']),
      ],
    },
    {
      id: 'ts8.ss.media.print', title: 'Print media and newspapers in cultural awakening', prereqs: ['ts8.ss.media.cinema'],
      intro: [
        h('The power of the printed word'),
        photo('📄', 'Newspapers spread news, debate and nationalist ideas across India.'),
        p('Portuguese missionaries set up the first printing press in India in Goa in 1556. In 1780 James Augustus Hicky started Hicky’s Bengal Gazette, the first newspaper in India. In the 19th century, Indians started newspapers in English and Indian languages: Rammohun Roy’s journals, Amrita Bazar Patrika (1868), The Hindu (1878) and Tilak’s Kesari (1881). The British passed the Vernacular Press Act (1878) to control Indian-language papers, but the press kept growing.'),
        p('In the Telugu region, Krishna Patrika (1902), Andhra Patrika (1908, started by Kasinathuni Nageswara Rao) and others promoted nationalism and reform. In Hyderabad State, Suravaram Pratapa Reddy’s Golconda Patrika (1926) gave voice to Telugu people despite restrictions; Urdu papers like Imroz and Shoebullah Khan’s Rayyat also spoke against oppression — Shoebullah Khan was killed in 1948 for his writing.'),
        def('Freedom of the press', 'The freedom to publish news and opinions without government control; in India it is part of the freedom of speech and expression (Article 19(1)(a)).'),
        keys('1556 first press (Goa); 1780 first newspaper (Hicky).', 'Kesari, Amrita Bazar Patrika, The Hindu spread nationalism.', 'Vernacular Press Act 1878 tried to silence Indian papers.', 'Andhra Patrika (1908), Golconda Patrika (1926).'),
        remember('Shoebullah Khan, a Hyderabad journalist, gave his life in 1948 for press freedom.'),
        tip('Print helped awakening in three ways: spreading news, debating reform, uniting people.'),
      ],
      examples: [
        ex('How did newspapers help the national movement?', ['They spread news of events across the country quickly.', 'They criticised unjust laws and exposed the drain of wealth.', 'They built a shared national feeling among readers.'], 'By informing, criticising and uniting people'),
        ex('Why did the British pass the Vernacular Press Act in 1878?', ['Indian-language papers reached ordinary people and criticised government policies.', 'The British wanted to control and punish such criticism.'], 'To control criticism in Indian-language papers'),
      ],
      practice: [
        mcq('mcq', 'Print milestones and Telugu papers.', [
          ['The first newspaper in India was…', 'Hicky’s Bengal Gazette (1780)', ['Kesari (1881)', 'The Hindu (1878)', 'Andhra Patrika (1908)'], 'Started by an Englishman.', 'Hicky’s Bengal Gazette was first, in 1780.'],
          ['The first printing press in India was set up in…', 'Goa, 1556', ['Calcutta, 1780', 'Hyderabad, 1926', 'Madras, 1878'], 'By Portuguese missionaries.', 'It was set up in Goa in 1556.'],
          ['Golconda Patrika was started in 1926 by…', 'Suravaram Pratapa Reddy', ['Bal Gangadhar Tilak', 'Kasinathuni Nageswara Rao', 'James Hicky'], 'A Telangana leader.', 'Suravaram Pratapa Reddy edited it.'],
          ['Kesari was the newspaper of…', 'Bal Gangadhar Tilak', ['Gandhi', 'Nehru', 'Rammohun Roy'], 'Marathi paper of 1881.', 'Tilak ran Kesari.'],
          ['The Vernacular Press Act (1878) aimed to…', 'Control Indian-language newspapers', ['Promote all newspapers', 'Start Hicky’s Gazette', 'Free all journalists'], 'Restriction.', 'It curbed criticism in Indian languages.'],
          ['Andhra Patrika (1908) was started by…', 'Kasinathuni Nageswara Rao', ['Suravaram Pratapa Reddy', 'Shoebullah Khan', 'Kandukuri Veeresalingam'], 'A nationalist publisher.', 'Kasinathuni Nageswara Rao founded it.'],
        ]),
        matchT('match', 'newspaper to its founder', [
          ['Hicky’s Bengal Gazette', 'James Augustus Hicky'], ['Kesari', 'Bal Gangadhar Tilak'], ['Andhra Patrika', 'Kasinathuni Nageswara Rao'],
          ['Golconda Patrika', 'Suravaram Pratapa Reddy'], ['Rayyat', 'Shoebullah Khan (journalist)'], ['Sambad Kaumudi', 'Rammohun Roy'],
        ], ['Two are Telugu papers.', 'Tilak wrote in Marathi.']),
        tapT('tap', 'Tap every way newspapers helped cultural and national awakening.', [
          ['Spreading news across regions', true], ['Debating social reforms', true], ['Criticising unjust laws', true], ['Encouraging Indian languages and literature', true],
          ['Supporting the Vernacular Press Act', false], ['Hiding news of Jallianwala Bagh', false], ['Stopping people from reading', false],
        ], ['Print spreads information and debate.', 'Censorship was the British response.'], 'Newspapers informed, debated and built unity.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 23 — Sports: Nationalism and Commerce
// =====================================================================================
const c23Events: EV[] = [
  [1792, 'Calcutta Cricket Club formed', '1792'],
  [1848, 'Parsis form the Oriental Cricket Club in Bombay', '1848'],
  [1911, 'Mohun Bagan wins the IFA Shield against a British team', '1911'],
  [1928, 'BCCI formed; India wins first Olympic hockey gold', '1928'],
  [1932, 'India plays its first Test match at Lord’s', '1932'],
  [1983, 'India wins the Cricket World Cup', '1983'],
  [2008, 'Indian Premier League begins', '2008'],
];
const ch23: USpec = {
  id: 'ts8.ss.ch23', subject: 'social', title: 'Sports: Nationalism and Commerce', source: src(23),
  objectives: [
    {
      id: 'ts8.ss.sport.cricket', title: 'Why we play; the history of cricket in India', prereqs: [],
      intro: [
        h('More than a game'),
        photo('🏅', 'Cricket came to India with the British and became the country’s most popular sport.'),
        p('We play for fun, fitness, friendship and to test our skills. Games also teach teamwork, discipline and fair play. But sports also carry deeper meanings — of community, nation and money.'),
        p('Cricket came to India with the British. The Calcutta Cricket Club was formed in 1792. The Parsis of Bombay were the first Indians to play seriously, forming the Oriental Cricket Club in 1848 and touring England in 1886. Teams were organised by community — Europeans, Parsis, Hindus and Muslims — in the Bombay Quadrangular tournament (from 1912; later Pentangular with “The Rest”).'),
        stepsB('1792: Calcutta Cricket Club.', '1848: Parsis’ Oriental Cricket Club.', '1928: Board of Control for Cricket in India (BCCI) formed.', '1932: India’s first Test match, at Lord’s, under C. K. Nayudu.', '1934: Ranji Trophy begins — teams by region, not community.'),
        keys('Cricket arrived with the British.', 'Parsis were the first Indian cricketers.', 'Quadrangular/Pentangular: community-based teams.', 'Ranji Trophy (1934): regional teams.'),
        remember('C. K. Nayudu captained India in its first Test at Lord’s in 1932.'),
        tip('Notice the shift: teams by community → teams by region → a national team.'),
      ],
      examples: [
        ex('Why was organising teams by community criticised?', ['It divided players by religion and community.', 'Nationalists felt it went against national unity.', 'Regional teams like the Ranji Trophy were seen as better.'], 'It divided people by religion instead of uniting them'),
        ex('How many years after the Parsis’ club (1848) did India play its first Test (1932)?', ['1932 − 1848 = 84 years.'], '84 years'),
      ],
      practice: [
        timelineT('tl', 'Arrange these sports events in time order.', c23Events, ['The Calcutta club is the oldest.', 'IPL is the newest.']),
        mcq('mcq', 'Cricket’s Indian history.', [
          ['The first Indians to play cricket seriously were the…', 'Parsis of Bombay', ['Gonds of Adilabad', 'Sikhs of Punjab', 'Inuit'], 'Oriental Cricket Club, 1848.', 'Parsis formed the first Indian cricket club.'],
          ['India played its first Test match in…', '1932', ['1911', '1947', '1983'], 'At Lord’s.', 'India’s first Test was in 1932.'],
          ['India’s first Test captain was…', 'C. K. Nayudu', ['Kapil Dev', 'Ranjitsinhji', 'Sunil Gavaskar'], 'From the 1930s.', 'C. K. Nayudu led India at Lord’s.'],
          ['The Ranji Trophy organised teams by…', 'Region (state/zone)', ['Religion', 'Caste', 'Language only'], 'Started 1934.', 'It replaced community teams with regional teams.'],
          ['The BCCI was formed in…', '1928', ['1792', '1983', '2008'], 'Before India’s first Test.', 'The BCCI was set up in 1928.'],
        ]),
        tapT('tap', 'Tap every good reason why people play sports.', [
          ['Fitness and health', true], ['Fun and friendship', true], ['Learning teamwork and discipline', true], ['Testing and improving skills', true],
          ['To insult opponents', false], ['To avoid all exercise', false], ['To cheat for victory', false],
        ], ['Think of body, mind and friendship.', 'Fair play is part of sport.'], 'Sport builds health, friendship, teamwork and skill.'),
      ],
    },
    {
      id: 'ts8.ss.sport.colonial', title: 'Gandhi and colonial sports; sport and nationalism', prereqs: ['ts8.ss.sport.cricket'],
      intro: [
        h('Beating the rulers at their own game'),
        photo('⚽', 'In 1911 Mohun Bagan’s barefoot players beat a British army team — a moment of national pride.'),
        p('The British saw sports like cricket as a way to teach “manly” values and loyalty to the empire. But Indians turned these games into a source of national pride. In 1911 Mohun Bagan, playing barefoot, defeated the East Yorkshire Regiment to win the IFA Shield football tournament in Calcutta. The Indian hockey team won Olympic gold in 1928, 1932 and 1936, with Dhyan Chand as its star.'),
        p('Gandhi was not much interested in cricket, but he valued simple physical exercise and Indian games that needed no costly equipment. In 1940 he criticised the communal Pentangular tournament, saying sport should not divide people by religion. Nationalist critics argued that competition between communities harmed unity; the Pentangular ended in 1946.'),
        def('Sports nationalism', 'Using success in sports to build national pride and unity.'),
        keys('British used sports to spread colonial values.', 'Mohun Bagan 1911: famous victory over a British team.', 'Hockey golds 1928, 1932, 1936; Dhyan Chand.', 'Gandhi criticised the communal Pentangular (1940).'),
        remember('National Sports Day in India (29 August) marks the birthday of hockey legend Dhyan Chand.'),
        tip('In colonial India, defeating a British team on the field felt like a small victory over colonial rule.'),
      ],
      examples: [
        ex('Why was Mohun Bagan’s 1911 victory celebrated across India?', ['Indian players, many barefoot, beat a British army team.', 'It showed Indians could match the rulers.', 'It became a symbol of national pride.'], 'It proved Indians could beat the rulers — a source of pride'),
        ex('Why did Gandhi criticise the Pentangular tournament?', ['Teams were based on religious communities.', 'He felt this encouraged division instead of unity.'], 'Because it divided teams by religion'),
      ],
      practice: [
        mcq('mcq', 'Sport and nationalism.', [
          ['In 1911 Mohun Bagan won the IFA Shield by defeating…', 'A British regimental team', ['Pakistan', 'Australia', 'A Parsi team'], 'East Yorkshire Regiment.', 'They beat the East Yorkshire Regiment.'],
          ['India won Olympic hockey gold in 1928, 1932 and…', '1936', ['1948 only', '1952 only', '1911'], 'Three in a row before WWII.', 'India won in 1928, 1932 and 1936.'],
          ['National Sports Day (29 August) honours…', 'Dhyan Chand', ['C. K. Nayudu', 'Mahatma Gandhi', 'Sachin Tendulkar'], 'Hockey wizard.', 'It marks Dhyan Chand’s birthday.'],
          ['Gandhi criticised the Pentangular tournament because…', 'It divided teams by religion', ['It was too long', 'It used a red ball', 'It had no spectators'], 'Unity.', 'Community-based teams went against unity.'],
          ['The British promoted sports in India partly to…', 'Spread values they believed made loyal subjects', ['Make India independent', 'Ban Indian games', 'Teach Sanskrit'], 'Colonial values.', 'Sports were seen as building discipline and loyalty.'],
        ]),
        matchT('match', 'person or event to its significance', [
          ['Mohun Bagan, 1911', 'Beat a British team'], ['Dhyan Chand', 'Hockey legend'], ['Gandhi, 1940', 'Criticised communal cricket'],
          ['Pentangular', 'Community-based cricket tournament'], ['1928 Olympics', 'First hockey gold'], ['29 August', 'National Sports Day'],
        ], ['Dhyan Chand’s birthday is Sports Day.', 'Mohun Bagan played football.']),
        tapT('tap', 'Tap every sports moment that boosted national pride before 1947.', [
          ['Mohun Bagan’s IFA Shield win in 1911', true], ['Hockey gold at the 1928 Olympics', true], ['Hockey gold at the 1936 Olympics', true], ['India’s first Test at Lord’s in 1932', true],
          ['IPL begins in 2008', false], ['World Cup win in 1983', false], ['World Cup win in 2011', false],
        ], ['Before 1947 only.', '1983, 2008 and 2011 are after independence.'], 'Pre-1947 sporting successes built national pride.'),
      ],
    },
    {
      id: 'ts8.ss.sport.commerce', title: 'Commerce, media and cricket today', prereqs: ['ts8.ss.sport.colonial'],
      intro: [
        h('Sport as big business'),
        photo('🏆', 'Television, sponsors and leagues have made cricket a multi-crore business.'),
        p('India’s World Cup victory in 1983 under Kapil Dev made cricket hugely popular. Colour television spread in the 1980s, and live telecasts brought matches into homes. Companies began to pay large sums to sponsor teams and advertise during matches. Television rights became the biggest source of money for cricket boards. In 2008 the Indian Premier League (IPL) began, with franchise teams owned by companies, player auctions and short T20 matches designed for TV audiences.'),
        def('Commercialisation of sport', 'When money from sponsors, advertising, broadcasting rights and ticket sales becomes central to how a sport is organised.'),
        p('Benefits: higher earnings for players, better facilities, jobs in media and events. Concerns: other sports get much less money and attention; match-fixing and betting scandals; too many matches; and young people may see sport only as entertainment. Players from Telangana have shone in many sports — P. V. Sindhu (Olympic silver 2016, bronze 2020 Games), Saina Nehwal (Olympic bronze 2012), Mithali Raj (cricket), Nikhat Zareen (world boxing champion 2022) — showing the value of support for sports beyond cricket.'),
        keys('1983 World Cup win boosted cricket’s popularity.', 'TV rights and sponsorship drive cricket’s money.', 'IPL (2008): franchises, auctions, T20.', 'Concern: neglect of other sports; scandals.'),
        remember('India won the Cricket World Cup in 1983 and 2011.'),
        tip('A balanced answer weighs the benefits of money in sport against its problems.'),
      ],
      examples: [
        ex('How did television change cricket?', ['Live telecasts brought matches to millions of homes.', 'Advertisers paid to reach these viewers.', 'TV rights became the main income of boards; formats like T20 suited TV.'], 'It brought huge audiences and money, and shaped new formats'),
        ex('Why do some people worry about the commercialisation of cricket?', ['Other sports get little sponsorship.', 'Money can lead to betting and fixing.', 'Players face too many matches.'], 'Neglect of other sports, scandals, overload'),
      ],
      practice: [
        mcq('mcq', 'Money, media and sport today.', [
          ['India first won the Cricket World Cup in…', '1983', ['1975', '2011', '1932'], 'Captain Kapil Dev.', 'India won in 1983 under Kapil Dev.'],
          ['The Indian Premier League began in…', '2008', ['1983', '1996', '2014'], 'T20 franchise league.', 'IPL started in 2008.'],
          ['The biggest source of money for cricket boards today is…', 'Television/broadcasting rights', ['Selling bats', 'Government taxes', 'Players’ fees'], 'Media.', 'Broadcast rights bring in the most money.'],
          ['P. V. Sindhu of Hyderabad won Olympic medals in…', 'Badminton', ['Boxing', 'Wrestling', 'Hockey'], 'Silver at Rio 2016.', 'Sindhu is a badminton champion.'],
          ['Nikhat Zareen, from Nizamabad, became a world champion in…', 'Boxing', ['Chess', 'Cricket', 'Swimming'], '2022.', 'She won the women’s world boxing title in 2022.'],
          ['A concern about commercialisation of sport is…', 'Other sports get far less money and attention', ['Players earn nothing', 'Nobody watches cricket', 'There is no advertising'], 'Imbalance.', 'Money concentrates on cricket.'],
        ]),
        matchT('match', 'player or event to the achievement', [
          ['Kapil Dev', 'Captain of the 1983 World Cup team'], ['P. V. Sindhu', 'Olympic silver in badminton, 2016'], ['Saina Nehwal', 'Olympic bronze in badminton, 2012'],
          ['Mithali Raj', 'Leading women’s cricketer'], ['Nikhat Zareen', 'World boxing champion, 2022'], ['IPL', 'T20 franchise league from 2008'],
        ], ['Two badminton players with different medals.', 'IPL is a league.']),
        tapT('tap', 'Tap every source of money in modern cricket.', [
          ['Television and streaming rights', true], ['Sponsorship by companies', true], ['Ticket sales', true], ['Advertising during matches', true], ['Sale of team merchandise', true],
          ['Land revenue from farmers', false], ['Royalty on coal', false], ['Railway fares', false],
        ], ['Think of media, companies and fans.', 'Taxes and fares are unrelated.'], 'Media rights, sponsors, tickets, ads and merchandise fund modern cricket.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 24 — Disaster Management
// =====================================================================================
const ch24: USpec = {
  id: 'ts8.ss.ch24', subject: 'social', title: 'Disaster Management', source: src(24),
  objectives: [
    {
      id: 'ts8.ss.dis.types', title: 'Types of disasters and what disaster management means', prereqs: [],
      intro: [
        h('When hazards become disasters'),
        photo('⚠️', 'Preparedness can turn a deadly disaster into a manageable emergency.'),
        def('Hazard', 'A natural or human-made event that can cause harm — e.g. a cyclone, flood, earthquake, fire or gas leak.'),
        def('Disaster', 'A serious disruption when a hazard strikes a vulnerable community, causing loss of life, property and livelihoods beyond the community’s ability to cope.'),
        p('Natural disasters include floods, droughts, cyclones, earthquakes, tsunamis, landslides and heat waves. Human-made disasters include industrial accidents (like the Bhopal gas tragedy of December 1984), fires, building collapses and road and rail accidents. Telangana faces droughts, heat waves and urban floods (such as the Hyderabad floods of October 2020).'),
        def('Disaster management cycle', 'Mitigation (reducing risk), preparedness (plans, drills, warnings), response (rescue and relief) and recovery (rebuilding, better than before).'),
        p('India passed the Disaster Management Act in 2005, creating the National Disaster Management Authority (NDMA), chaired by the Prime Minister, and State and District authorities. The National Disaster Response Force (NDRF) has trained rescue battalions. The emergency number 112 connects to police, fire and ambulance services.'),
        keys('Hazard + vulnerability → disaster.', 'Natural and human-made disasters.', 'Cycle: mitigation → preparedness → response → recovery.', 'DM Act 2005; NDMA (PM chairs); NDRF.'),
        remember('The NDMA is chaired by the Prime Minister; State authorities by Chief Ministers.'),
        tip('Before = mitigation and preparedness; during = response; after = recovery.'),
      ],
      examples: [
        ex('Classify: cyclone, gas leak from a factory, earthquake, building collapse.', ['Natural: cyclone, earthquake.', 'Human-made: gas leak, building collapse.'], 'Natural: cyclone, earthquake; human-made: gas leak, building collapse'),
        ex('Give one action for each phase of the disaster cycle for floods.', ['Mitigation: build embankments, keep drains clear.', 'Preparedness: flood warnings and evacuation drills.', 'Response: rescue by boats, relief camps.', 'Recovery: repair homes and roads, compensation.'], 'Embankments; warnings; rescue; rebuilding'),
      ],
      practice: [
        tp('classify', (r) => {
          const [e, k] = r.pick<[string, string]>([
            ['Cyclone', 'Natural'], ['Earthquake', 'Natural'], ['Drought', 'Natural'], ['Landslide after heavy rain', 'Natural'], ['Heat wave', 'Natural'],
            ['Gas leak from a factory', 'Human-made'], ['Fire in a crowded market', 'Human-made'], ['Collapse of a badly built building', 'Human-made'], ['Train accident', 'Human-made'],
          ]);
          return {
            type: 'mcq', prompt: `Is this mainly a natural or a human-made disaster? “${e}”`, ...choose(r, k, [k === 'Natural' ? 'Human-made' : 'Natural']),
            hints: ['Ask: did it start from a natural process or from human activity?', 'Factories, buildings and vehicles are human-made.'],
            mistakes: [{ when: 'wrong', explain: `${e} is a ${k.toLowerCase()} disaster.` }], solution: [`${e} → ${k}.`],
          };
        }, 1),
        orderT('order', 'Put the phases of the disaster management cycle in order, starting before a disaster.', ['Mitigation — reduce risk', 'Preparedness — plans, drills, warnings', 'Response — rescue and relief', 'Recovery — rebuild better'], ['Reducing risk comes first.', 'Rebuilding is last.'], 'Mitigation → preparedness → response → recovery.'),
        mcq('mcq', 'Hazards, disasters and institutions.', [
          ['The Disaster Management Act was passed in…', '2005', ['1984', '1947', '2014'], 'After the 2004 tsunami.', 'It was enacted in 2005.'],
          ['The NDMA is chaired by the…', 'Prime Minister', ['President', 'Chief Justice', 'Army Chief'], 'Head of government.', 'The PM chairs the NDMA.'],
          ['The Bhopal gas tragedy (1984) is an example of a…', 'Human-made disaster', ['Natural disaster', 'Drought', 'Tsunami'], 'Industrial accident.', 'It was caused by a gas leak from a factory.'],
          ['A hazard becomes a disaster when…', 'It strikes a vulnerable community beyond its capacity to cope', ['It is predicted', 'It happens in the ocean far away', 'Nobody lives nearby'], 'Vulnerability matters.', 'Disasters result from hazards meeting vulnerability.'],
          ['India’s single emergency helpline number is…', '112', ['100100', '1930', '1800'], 'Police, fire, ambulance.', '112 is the integrated emergency number.'],
        ]),
      ],
    },
    {
      id: 'ts8.ss.dis.tsunami', title: 'Tsunami: before, during and after', prereqs: ['ts8.ss.dis.types'],
      intro: [
        h('The wave of 26 December 2004'),
        photo('⛵', 'A tsunami is a series of huge sea waves caused by an undersea earthquake.'),
        p('On 26 December 2004 a massive undersea earthquake (magnitude about 9.1) struck off Sumatra in Indonesia. It produced a tsunami that hit coasts across the Indian Ocean. In India, Tamil Nadu, Andhra Pradesh, Kerala, Puducherry and the Andaman and Nicobar Islands were badly affected; more than 10,000 people died in India alone and over two lakh across the region.'),
        def('Tsunami', 'A series of very long, fast sea waves caused by an undersea earthquake, volcano or landslide. In deep water they travel as fast as a jet plane; near the coast they slow down and rise very high.'),
        keys('Before: know warning signs (strong earthquake near coast, sudden fall of sea level); know evacuation routes; keep an emergency kit.', 'During: move quickly to high ground or upper floors of strong buildings; never go to the beach to watch; stay away until officials say it is safe — more waves may come.', 'After: help the injured, avoid damaged buildings and power lines, drink safe water, follow official information.'),
        p('After 2004, India set up the Indian Tsunami Early Warning Centre at INCOIS, Hyderabad (operational from 2007), which monitors earthquakes and sea levels and can issue warnings within minutes. Coastal villages hold drills; mangroves and coastal forests, which reduce wave impact, are being protected.'),
        f('Travel time = distance ÷ speed'),
        remember('If the sea suddenly pulls back far from the shore, run to high ground — a tsunami may be coming.'),
        tip('The tsunami warning centre for the Indian Ocean is in Hyderabad (INCOIS) — a Telangana link.'),
      ],
      examples: [
        ex('A tsunami travels at 600 km/h. How long will it take to reach a coast 1,500 km away?', ['Time = distance ÷ speed.', '1500 ÷ 600 = 2.5 hours.'], '2.5 hours (2 h 30 min)'),
        ex('Why is it dangerous to return to the beach after the first wave?', ['A tsunami is a series of waves.', 'Later waves can be bigger than the first.', 'People returning can be caught by them.'], 'More, possibly bigger, waves can follow'),
      ],
      practice: [
        tp('time', (r) => {
          const v = r.pick([500, 600, 700, 800]);
          const t = r.pick([1, 1.5, 2, 2.5, 3]);
          const d = v * t;
          return numQ(`A tsunami wave travels across the deep ocean at about ${v} km/h. How many hours will it take to reach a coast ${d.toLocaleString('en-IN')} km away?`, t, ['Time = distance ÷ speed.', `${d} ÷ ${v}`], [`${d} ÷ ${v} = ${t} hours`], [{ when: String(d * v), explain: 'Divide distance by speed — do not multiply.' }], 0.001, 'h');
        }, 2),
        mcq('mcq', 'Tsunami facts and safe actions.', [
          ['The Indian Ocean tsunami struck on…', '26 December 2004', ['26 January 2001', '15 August 2004', '1 January 2000'], 'The day after Christmas.', 'It struck on 26 December 2004.'],
          ['India’s Tsunami Early Warning Centre is located at…', 'INCOIS, Hyderabad', ['Mumbai', 'Delhi', 'Port Blair'], 'In Telangana.', 'INCOIS in Hyderabad runs the warning centre.'],
          ['A tsunami is usually caused by…', 'An undersea earthquake', ['Strong winds', 'Heavy rain', 'The Moon’s light'], 'Movement of the sea floor.', 'Undersea earthquakes displace huge volumes of water.'],
          ['During a tsunami warning you should…', 'Move quickly to high ground', ['Go to the beach to watch', 'Stay in a boat near the shore', 'Wait for the second wave'], 'Height is safety.', 'Evacuate inland or uphill immediately.'],
          ['A natural warning sign of a tsunami is…', 'The sea suddenly pulling back from the shore', ['A rainbow', 'Cool breeze', 'Clouds at sunset'], 'The water retreats first.', 'A sudden drop in sea level can mean a tsunami is coming.'],
          ['Which natural barrier reduces tsunami damage?', 'Mangrove forests', ['Desert dunes far inland', 'Glaciers', 'Ice sheets'], 'Coastal trees.', 'Mangroves absorb wave energy.'],
        ]),
        tp('phase', (r) => {
          const [a, ph] = r.pick<[string, string]>([
            ['Learning evacuation routes in a coastal village', 'Before'], ['Preparing an emergency kit', 'Before'], ['Taking part in a tsunami drill', 'Before'],
            ['Running to high ground when warned', 'During'], ['Moving to the upper floor of a strong concrete building', 'During'],
            ['Helping injured neighbours and staying away from broken power lines', 'After'], ['Drinking only safe, boiled water in relief camps', 'After'], ['Rebuilding houses farther from the shore', 'After'],
          ]);
          return {
            type: 'mcq', prompt: `Is this an action for BEFORE, DURING or AFTER a tsunami? “${a}”`, ...choose(r, ph, ['Before', 'During', 'After'].filter((x) => x !== ph)),
            hints: ['Preparation happens before; escape happens during; care and rebuilding after.', 'Think about when the action would be done.'],
            mistakes: [{ when: 'wrong', explain: `This is an action for ${ph.toLowerCase()} a tsunami.` }], solution: [`${a} → ${ph}.`],
          };
        }, 1),
      ],
    },
    {
      id: 'ts8.ss.dis.drought', title: 'Drought: impact, coping, rainwater harvesting and watershed development', prereqs: ['ts8.ss.dis.types'],
      intro: [
        h('When the rains fail'),
        photo('☀️', 'Drought is a slow disaster that spreads over months, hurting farms, cattle and drinking water.'),
        def('Drought', 'A long period of much lower rainfall than normal that causes shortage of water. Meteorological drought (rain deficiency), hydrological drought (rivers, tanks, groundwater dry up) and agricultural drought (crops fail due to lack of soil moisture) often follow one another.'),
        p('In Telangana, parts of the south and west (like Mahabubnagar and Nalgonda regions) are drought-prone. Impacts include crop failure, debt, fodder shortage, drinking water scarcity, migration and health problems. Coping includes drought-resistant crops (millets, pulses), drip and sprinkler irrigation, fodder banks, employment through MGNREGA, and saving water.'),
        def('Rainwater harvesting', 'Collecting and storing rain from rooftops, fields and catchments in tanks, ponds or recharge pits so it can be used later or can recharge groundwater.'),
        def('Watershed development', 'Treating a whole catchment area (from ridge to valley) with contour bunds, check dams, farm ponds, trenches and tree planting so that rain is held, soil is saved and groundwater rises.'),
        p('Telangana’s Mission Kakatiya (from 2015) restored thousands of village tanks — many first built in the Kakatiya period — by removing silt to increase storage. Ralegan Siddhi (Maharashtra) and Hiware Bazar are famous examples of villages transformed by watershed work.'),
        f('Rain volume (litres) = roof area (m²) × rainfall (mm)'),
        keys('Drought types: meteorological, hydrological, agricultural.', 'Impacts: crop loss, debt, water scarcity, migration.', 'Rainwater harvesting and watershed development hold water where it falls.', 'Mission Kakatiya: restoring village tanks.'),
        remember('1 mm of rain on 1 m² of roof = 1 litre of water.'),
        tip('“Catch the rain where it falls, when it falls.”'),
      ],
      examples: [
        ex('A school roof is 200 m² and the yearly rainfall is 800 mm. How much rainwater falls on it?', ['Litres = area × rainfall in mm.', '200 × 800 = 1,60,000 litres.'], '1,60,000 litres'),
        ex('If only 80% of it can be collected, how much is harvested?', ['80% of 1,60,000 = 1,28,000 litres.'], '1,28,000 litres'),
      ],
      practice: [
        tp('harvest', (r) => {
          const a = r.pick([50, 80, 100, 120, 150, 200]);
          const mm = r.pick([600, 700, 800, 900, 1000]);
          return numQ(`A house roof has an area of ${a} m². The yearly rainfall is ${mm} mm. How many litres of rain fall on the roof in a year? (1 mm on 1 m² = 1 litre)`, a * mm, ['Litres = roof area × rainfall in mm.', `${a} × ${mm}`], [`${a} × ${mm} = ${(a * mm).toLocaleString('en-IN')} litres`], [{ when: String(a * mm / 1000), explain: 'That is in cubic metres. The question asks for litres.' }], 0.001);
        }, 2),
        mcq('mcq', 'Drought and water conservation.', [
          ['Agricultural drought means…', 'Crops fail due to lack of soil moisture', ['Too much rain', 'A tsunami', 'A cyclone over the sea'], 'Related to crops.', 'It is when soil moisture is too low for crops.'],
          ['Mission Kakatiya in Telangana aimed to…', 'Restore village tanks', ['Plant trees on roads', 'Build airports', 'Supply electricity'], 'Named after a dynasty that built tanks.', 'It desilted and restored minor irrigation tanks.'],
          ['Watershed development treats…', 'An entire catchment from ridge to valley', ['Only a single house', 'Only rivers in cities', 'Only the sea coast'], 'Whole area that drains to one point.', 'It works on the whole catchment.'],
          ['Which crops suit drought-prone areas?', 'Millets and pulses', ['Sugarcane and paddy', 'Rubber', 'Tea'], 'Need less water.', 'Millets and pulses need much less water.'],
          ['1 mm of rain on 1 m² of roof gives…', '1 litre', ['1 cubic metre', '10 litres', '1 millilitre'], 'Simple rule.', '1 mm × 1 m² = 0.001 m³ = 1 litre.'],
        ]),
        tapT('tap', 'Tap every measure that helps a village cope with drought.', [
          ['Rainwater harvesting pits', true], ['Desilting old tanks', true], ['Check dams and contour bunds', true], ['Drip irrigation', true], ['Growing millets', true],
          ['Cutting down forests on hill slopes', false], ['Growing water-hungry crops everywhere', false], ['Wasting water from leaking pipes', false],
        ], ['Save water and grow less thirsty crops.', 'Deforestation increases run-off.'], 'Harvesting, storing and saving water, and suitable crops, reduce drought impact.'),
      ],
    },
  ],
};


export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11a, ch11b, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21, ch22, ch23, ch24];
