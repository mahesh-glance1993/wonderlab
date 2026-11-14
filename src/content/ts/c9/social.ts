// Telangana SCERT Class 9 — Social Studies (22 chapters: Part I Natural Realms of the Earth & Economy, 1-11;
// Part II World from Medieval to Modern Times, 12-22). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). Figures marked "about" are rounded, well-established values;
// figures marked "illustrative" are made-up numbers used only to practise a method.
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, vis, stepsB, L, approx, choose, matching, ordering, tapAll, rd, inr, NAMES,
  type USpec, type TSpec, type QSpec, type OSpec, type ExSpec,
} from '../../lib/kit';
import type { Block } from '../../../shared/content';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(9, 'social', n);
const who = (r: Rng) => r.pick(NAMES).en;
const TOWNS = ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Adilabad', 'Mahabubnagar', 'Siddipet', 'Suryapet'];

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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched — check each left item on its own, starting with the one you are surest about.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** Ordering by date / sequence: picks `n` items from the (already correctly ordered) list each time. */
const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const idx = r.shuffle(steps.map((_, i) => i)).slice(0, Math.min(n, steps.length)).sort((a, b) => a - b);
  const pick = idx.map((i) => steps[i]);
  return {
    type: 'order', prompt, ...ordering(r, pick), hints,
    mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
    solution: [...pick.map((s, i) => `${i + 1}. ${s}`), why],
  };
}, d);

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

/** Typed numeric item (plain number; the unit is shown as a hint only). */
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01, unitHint?: string): QSpec => ({
  type: 'typed', keypad: 'numeric', prompt, answer: approx(ans, rel), hints, solution,
  ...(unitHint ? { unitHint } : {}),
  mistakes: [{ when: 'wrong-value', explain: 'Re-check the method in the hints and redo the arithmetic step by step.' }, ...mistakes],
});

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

/** Objective shorthand. */
const O = (id: string, title: string, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title, prereqs: [], intro, examples, practice });
/** Unit shorthand. */
const U = (n: number, title: string, objectives: OSpec[]): USpec => ({ id: `ts9.ss.ch${n}`, subject: 'social', title, source: src(n), objectives });

// =====================================================================================
// Chapter 1 — Our Earth
// =====================================================================================
const ch1 = U(1, 'Our Earth', [
  O('ts9.ss.earth.universe', 'The universe, the Sun and the Earth as a planet', [
    h('Our address in space'),
    photo('🌍', 'The Earth seen from space: a blue planet, because about 71% of its surface is covered by water.'),
    p('Write your full address and keep going: house, street, Hyderabad, Telangana, India, Asia, Earth, Solar System, Milky Way galaxy, universe. Each step is a much bigger home.'),
    p('Scientists think the universe began about 13.8 billion years ago in the Big Bang, when everything was packed into a tiny, extremely hot point and then began expanding. Stars group into galaxies; our Sun is one of billions of stars in the Milky Way.'),
    def('Solar System', 'The Sun and everything held by its gravity: eight planets, their moons, dwarf planets, asteroids and comets.'),
    def('Light year', 'The distance light travels in one year (about 9.46 trillion km). It measures distance, not time.'),
    h('How the Earth formed and changed'),
    stepsB(
      'About 4.6 billion years ago: a cloud of gas and dust collapses; the Sun forms at its centre.',
      'Dust and rock clump together to form the planets, including a hot, molten Earth.',
      'Heavy materials (iron, nickel) sink to the centre; lighter rock floats up and cools into a crust.',
      'Gases from volcanoes form an early atmosphere; water vapour cools and falls as rain, filling the oceans.',
      'Simple life appears in the oceans; over very long periods, tiny organisms and later plants add oxygen to the air.',
    ),
    p('The Earth is special because it is at the right distance from the Sun (about 150 million km) — not too hot, not too cold — so water can stay liquid. It has an atmosphere that protects life and keeps temperatures steady.'),
    keys('Universe → galaxies → stars → planets.', 'Earth formed about 4.6 billion years ago.', 'Liquid water + atmosphere + right distance from the Sun make life possible.'),
    remember('Sunlight takes about 8 minutes 20 seconds to reach the Earth.'),
  ], [
    ex('Why is a light year a unit of distance, not time?', ['A light year is how far light travels in one year.', '"How far" is a distance.', 'It is used because distances between stars are too large for kilometres to be handy.'], 'It measures the distance light covers in one year.'),
    ex('Put in order: Earth forms; oceans form; the Sun forms; life appears.', ['The Sun forms first at the centre of the collapsing cloud.', 'Then the Earth forms from clumping rock and dust.', 'It cools, rain fills the oceans, and life starts in the water.'], 'Sun forms → Earth forms → oceans form → life appears'),
  ], [
    mcq('facts', 'Think about what makes Earth different from its neighbours.', [
      ['About how old is the Earth?', 'About 4.6 billion years', ['About 4,600 years', 'About 13.8 billion years', 'About 46 million years'], '13.8 billion is the age of the universe, not the Earth.', 'Rocks and meteorites show the Earth formed about 4.6 billion years ago.'],
      ['Why can liquid water exist on Earth?', 'It is at a suitable distance from the Sun', ['It is the largest planet', 'It has no atmosphere', 'It is the closest planet to the Sun'], 'Too close = water boils; too far = water freezes.', 'Earth\'s distance from the Sun keeps most water in liquid form.'],
      ['A light year measures…', 'distance', ['time', 'brightness', 'speed'], 'It is how FAR light goes in a year.', 'A light year is a unit of distance used for space.'],
      ['Our Sun belongs to which galaxy?', 'The Milky Way', ['Andromeda', 'The Solar galaxy', 'The Big Bang galaxy'], 'You can see a band of it across a dark night sky.', 'The Sun is one of billions of stars in the Milky Way.'],
      ['Why does the Earth look blue from space?', 'About 71% of its surface is covered by water', ['Its atmosphere is made of blue gas only', 'Its crust is blue rock', 'The Sun is blue'], 'Most of the surface is ocean.', 'Water covers about 71% of the surface, so the planet looks blue.'],
    ]),
    orderT('evolve', 'Put the stages of the Earth\'s early history in order (earliest first).', [
      'A cloud of gas and dust collapses and the Sun forms',
      'Rock and dust clump into a hot, molten Earth',
      'Heavy iron sinks to the centre; a crust cools on top',
      'Rain from cooling water vapour fills the oceans',
      'Simple life appears in the oceans',
    ], ['The Sun had to exist before the planets around it.', 'Oceans need a cool crust to rest on.'], 'Sun → molten Earth → layers and crust → oceans → life.'),
    matchT('terms', 'term with its meaning', [
      ['Galaxy', 'A huge group of billions of stars'], ['Solar System', 'The Sun and everything held by its gravity'], ['Light year', 'Distance light travels in a year'],
      ['Big Bang', 'The expansion that began the universe'], ['Planet', 'A large body that orbits a star'], ['Moon', 'A natural satellite orbiting a planet'],
    ], ['Start with the biggest thing (galaxy) and work down.', 'A light year is a distance.']),
  ]),
  O('ts9.ss.earth.interior', 'Inside the Earth and the movements of its crust', [
    h('Layers like an egg'),
    p('Think of a boiled egg: thin shell, white, yolk. The Earth also has layers. Nobody has drilled through the crust — the deepest hole is only about 12 km — so scientists study earthquake waves, which change speed and direction in different materials.'),
    def('Crust', 'The thin outer rocky layer: about 5 km thick under oceans and about 30–70 km under continents. Continental crust is rich in silica and aluminium (SIAL); oceanic crust in silica and magnesium (SIMA).'),
    def('Mantle', 'The thick layer below the crust, down to about 2,900 km. Its upper part is partly molten and flows very slowly.'),
    def('Core', 'The centre, made mostly of iron and nickel (NIFE). The outer core (about 2,900–5,100 km deep) is liquid; the inner core (to about 6,371 km) is solid because of enormous pressure.'),
    vis({ kind: 'bar-graph', labels: ['Crust', 'Mantle', 'Outer core', 'Inner core'], values: [35, 2865, 2200, 1271], unit: 'km thick (about)' }, 'Approximate thickness of each layer; the crust is tiny compared with the rest.'),
    h('Forces that move the crust'),
    def('Endogenic forces', 'Forces from inside the Earth (heat, pressure) that cause folding, faulting, earthquakes and volcanoes. Slow ones build mountains; sudden ones shake the land.'),
    def('Exogenic forces', 'Forces on the surface — running water, wind, ice, waves — that wear down and rebuild landforms.'),
    keys('Crust → mantle → outer core (liquid) → inner core (solid).', 'Earthquake waves are our "X-ray" of the interior.', 'Inner forces build up land; outer forces wear it down.'),
    remember('Radius of the Earth ≈ 6,371 km. Mantle reaches ≈ 2,900 km deep.'),
  ], [
    ex('Why is the inner core solid even though it is hotter than the outer core?', ['Temperature tries to melt the iron.', 'But pressure at the centre is enormous.', 'High pressure squeezes atoms together and keeps them solid.'], 'Huge pressure keeps it solid.'),
    ex('Is a river cutting a valley an endogenic or exogenic force?', ['The river works on the surface.', 'Its energy comes from flowing water and gravity, not the interior.'], 'Exogenic'),
  ], [
    mcq('layers', 'Remember the egg model and NIFE.', [
      ['Which layer of the Earth is liquid?', 'Outer core', ['Inner core', 'Crust', 'Lithosphere'], 'Earthquake S-waves cannot pass through it.', 'S-waves do not travel through the outer core, showing that it is liquid.'],
      ['The core is made mostly of…', 'iron and nickel', ['silica and aluminium', 'granite and basalt', 'water and gas'], 'NIFE = Ni + Fe.', 'The core is mainly nickel (Ni) and iron (Fe).'],
      ['Where is the crust thinnest?', 'Under the oceans', ['Under the Himalayas', 'Under the Deccan Plateau', 'It is the same everywhere'], 'Oceanic crust is about 5 km.', 'Oceanic crust is only about 5 km thick; continental crust is much thicker.'],
      ['How do scientists learn about the deep interior?', 'By studying earthquake waves', ['By drilling to the core', 'By sending people down mines', 'By looking at the Moon'], 'The deepest drill hole is only about 12 km.', 'Earthquake waves change speed and direction in different layers.'],
      ['Folding of rocks to form mountains is caused by…', 'endogenic forces', ['exogenic forces', 'ocean waves', 'wind'], 'Mountain-building comes from below.', 'Pressure from inside the Earth folds rock layers; that is an endogenic force.'],
    ]),
    tapT('endo', 'Tap the ENDOGENIC (inside-the-Earth) processes.', [
      ['Earthquake', true], ['Volcanic eruption', true], ['Folding of rock layers', true], ['Faulting (cracking and sliding)', true],
      ['A river cutting a gorge', false], ['Wind forming sand dunes', false], ['Waves carving a sea cave', false], ['A glacier carving a valley', false],
    ], ['Ask: does the energy come from heat inside the Earth?', 'Rivers, wind, waves and ice work on the surface.'], 'Earthquakes, volcanoes, folding and faulting are driven by internal heat and pressure.'),
    orderT('depth', 'Order the layers from the surface to the centre.', ['Crust', 'Upper mantle', 'Lower mantle', 'Outer core', 'Inner core'], ['The thin rocky skin comes first.', 'The solid centre comes last.'], 'Crust → mantle → outer core → inner core.'),
  ]),
  O('ts9.ss.earth.grid', 'Latitudes, longitudes and time', [
    h('The Earth\'s grid'),
    photo('🗺️', 'On a map, horizontal lines are latitudes and vertical lines are longitudes. Together they give every place an exact address.'),
    def('Latitude', 'Angular distance north or south of the Equator (0°), up to 90°N and 90°S. Lines of latitude (parallels) run east–west.'),
    def('Longitude', 'Angular distance east or west of the Prime Meridian (0°, through Greenwich, London), up to 180°E and 180°W. Meridians run from pole to pole.'),
    p('Hyderabad is at about 17.4°N, 78.5°E. Telangana lies roughly between 15°50\'N–19°55\'N and 77°15\'E–81°45\'E. The Tropic of Cancer (23½°N) passes through the middle of India, north of Telangana.'),
    h('Longitude and time'),
    p('The Earth turns 360° in 24 hours, so it turns 15° every hour, or 1° every 4 minutes. Places to the east see the Sun first, so their clocks are ahead.'),
    f('Time difference (minutes) = 4 × difference in longitude (degrees)', 'four minutes for every degree'),
    p('India uses one standard time, Indian Standard Time (IST), fixed on the 82°30\'E meridian. Greenwich is at 0°, so IST is 82.5 × 4 = 330 minutes = 5 hours 30 minutes ahead of Greenwich Mean Time.'),
    xp({
      title: 'What if? Change the longitude difference', formula: 'T = 4 × d',
      res: ['T', 'Time difference', 'min', '4 * d', 0],
      vars: [['d', 'Difference in longitude', '°', 0, 180, 0.5, 82.5]],
      notes: [['d', 'Places farther apart in longitude have a bigger time difference: 4 more minutes per degree.', 'Places closer in longitude have nearly the same local time.']],
      mistakes: [['Using latitude for time', 'Time depends on longitude (east–west), not latitude.'], ['Subtracting for a place to the east', 'East is AHEAD: add the time difference when moving east.']],
      real: 'At 82.5°, the difference is 330 minutes — exactly why IST is GMT + 5:30.',
    }),
    keys('Latitudes: 0°–90° N/S; longitudes: 0°–180° E/W.', '15° = 1 hour; 1° = 4 minutes.', 'East is ahead, west is behind.'),
    remember('IST meridian: 82°30\'E. IST = GMT + 5 h 30 min.'),
  ], [
    ex('When it is 12:00 noon at Greenwich (0°), what is the local time at a place on 30°E?', ['Difference = 30°', 'Time difference = 30 × 4 = 120 minutes = 2 hours', 'The place is east, so it is ahead: 12:00 + 2 h'], '2:00 p.m.'),
    ex('Show that IST is 5 hours 30 minutes ahead of GMT.', ['IST meridian = 82.5°E', '82.5 × 4 = 330 minutes', '330 minutes = 5 h 30 min, ahead because India is east'], 'IST = GMT + 5:30'),
  ], [
    tp('time-diff', (r) => {
      const d = r.pick([15, 30, 45, 60, 75, 90, 22.5, 37.5, 52.5, 82.5, 105, 120]);
      return numQ(`Two places are ${d}° apart in longitude. What is the difference in their local times, in minutes?`, 4 * d,
        ['The Earth turns 1° every 4 minutes.', `Multiply ${d} by 4.`],
        [`Time difference = 4 × ${d}`, `= ${4 * d} minutes`], [{ when: String(d / 15), explain: 'That is the answer in HOURS. The question asks for minutes: multiply the degrees by 4.' }], 0.001, 'minutes');
    }, 2),
    tp('local-time', (r) => {
      const d = r.pick([15, 30, 45, 60, 75, 90]);
      const east = r.next() < 0.5;
      const hrs = d / 15;
      const t = east ? 12 + hrs : 12 - hrs;
      const lab = (x: number) => (x === 12 ? '12:00 noon' : x > 12 ? `${x - 12}:00 p.m.` : `${x}:00 a.m.`);
      return {
        type: 'mcq', prompt: `It is 12:00 noon at Greenwich (0°). What is the local time at a place ${d}°${east ? 'E' : 'W'}?`,
        ...choose(r, lab(t), [lab(east ? 12 - hrs : 12 + hrs), lab(12), lab(east ? t + 1 : t - 1)]),
        hints: ['15° of longitude = 1 hour.', 'East of Greenwich is ahead (later); west is behind (earlier).'],
        mistakes: [{ when: 'wrong', explain: 'Check the direction: places to the EAST see the Sun first, so their clocks are ahead.' }],
        solution: [`${d}° ÷ 15 = ${hrs} hour(s)`, `${east ? 'East, so add' : 'West, so subtract'}: ${lab(t)}`],
      };
    }, 2),
    mcq('grid', 'Latitudes go across (like rungs of a ladder); longitudes go pole to pole.', [
      ['What is the latitude of the Equator?', '0°', ['90°', '23½°', '180°'], 'It is the starting line for latitudes.', 'The Equator is the 0° line of latitude.'],
      ['The Prime Meridian passes through…', 'Greenwich, London', ['Hyderabad', 'Delhi', 'the Equator only'], 'It is 0° longitude.', 'The 0° meridian passes through Greenwich near London.'],
      ['Indian Standard Time is based on which meridian?', '82°30\'E', ['0°', '78°30\'E', '90°E'], 'It passes near Prayagraj (Allahabad).', 'IST uses the 82°30\'E meridian, roughly through the middle of India.'],
      ['Which line passes through the middle of India?', 'Tropic of Cancer', ['Equator', 'Tropic of Capricorn', 'Arctic Circle'], 'It is at 23½°N.', 'The Tropic of Cancer (23½°N) crosses India from Gujarat to Mizoram.'],
      ['Hyderabad\'s latitude is about 17°N. This means it is…', 'north of the Equator', ['south of the Equator', 'on the Prime Meridian', 'on the Tropic of Cancer'], 'N means north.', '17°N means 17 degrees north of the Equator.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 2 — Lithosphere
// =====================================================================================
const ch2 = U(2, 'The Natural Realms of the Earth - Lithosphere', [
  O('ts9.ss.litho.landforms', 'Landforms: mountains, plateaus and plains', [
    h('The shape of the land'),
    photo('⛰️', 'Mountains rise steeply with peaks; plateaus are high but flat-topped; plains are low and flat.'),
    def('Lithosphere', 'The rigid outer shell of the Earth — the crust plus the top of the mantle.'),
    def('Mountain', 'Land that rises steeply well above its surroundings, usually with a narrow peak. Example: the Himalayas.'),
    def('Plateau', 'A raised area of land with a fairly flat top and at least one steep side — a "table-land". Example: the Deccan Plateau, on which Telangana stands.'),
    def('Plain', 'A broad, low, flat area, usually built by rivers depositing silt. Example: the Indo-Gangetic plain.'),
    p('Landforms decide where people live. Plains have fertile soil and easy transport, so they are crowded. Plateaus like Telangana\'s are rich in minerals (coal mined by Singareni, limestone) and have rocky ground with many tanks and lakes. Mountains have fewer people but supply rivers, forests and tourism.'),
    keys('Three main landforms: mountains, plateaus, plains.', 'Telangana lies on the Deccan Plateau.', 'Plains are densely populated because of fertile soil.'),
    remember('Fold mountains (Himalayas) are young; the Aravallis are among the oldest fold mountains in the world.'),
  ], [
    ex('Why are many of India\'s big cities on plains or coasts?', ['Plains have flat land and fertile soil for farming.', 'Roads and railways are easier to build.', 'Rivers and the sea supply water and trade routes.'], 'Flat, fertile land with water and easy transport'),
    ex('Classify the land around Hyderabad.', ['It is high land (about 500 m above sea level) but broadly flat with rocky hillocks.', 'It is part of the Deccan Plateau.'], 'Plateau'),
  ], [
    mcq('kinds', 'Mountain = peak; plateau = flat top up high; plain = low and flat.', [
      ['Telangana is located on which landform?', 'The Deccan Plateau', ['The Indo-Gangetic plain', 'The Himalayas', 'The Thar desert'], 'It is high, flat-topped land in the south.', 'Telangana lies on the Deccan Plateau.'],
      ['A "table-land" is another name for a…', 'plateau', ['plain', 'valley', 'delta'], 'Like a table — raised and flat.', 'A plateau is raised land with a flat top.'],
      ['Why are plains usually densely populated?', 'Fertile soil and easy transport', ['They are very cold', 'They have many volcanoes', 'They are rich only in coal'], 'Think of farming and roads.', 'Flat, fertile land supports farming, cities and transport.'],
      ['Plains are mostly formed by…', 'rivers depositing silt', ['volcanoes erupting', 'glaciers only', 'earthquakes'], 'Think of the Ganga carrying mud.', 'Rivers bring fine silt and spread it over wide flat areas.'],
    ]),
    matchT('examples', 'landform with an Indian example', [
      ['Young fold mountains', 'Himalayas'], ['Plateau', 'Deccan'], ['Plain', 'Indo-Gangetic plain'], ['Old fold mountains', 'Aravallis'], ['Delta', 'Sundarbans (Ganga–Brahmaputra)'],
    ], ['Telangana is on the Deccan.', 'The youngest, highest mountains are in the north.']),
    tapT('plateau', 'Tap the features that describe a PLATEAU.', [
      ['Raised above the surrounding land', true], ['Fairly flat top', true], ['Often rich in minerals', true], ['Very low and flat, near sea level', false], ['Sharp, narrow peaks', false], ['Built mainly by river silt', false],
    ], ['Think of the Deccan.', 'A plateau is high AND flat.'], 'Plateaus are raised, flat-topped and often rich in minerals.'),
  ]),
  O('ts9.ss.litho.plates', 'Moving plates, earthquakes and volcanoes', [
    h('A cracked shell that moves'),
    p('In 1912, Alfred Wegener noticed that the coasts of South America and Africa fit like jigsaw pieces. He suggested that all continents were once joined in one supercontinent, Pangaea, which slowly drifted apart. Later, scientists explained HOW: the lithosphere is broken into plates that move over the soft upper mantle.'),
    def('Plate tectonics', 'The theory that the lithosphere is divided into large plates that move a few centimetres a year, driven by heat currents in the mantle.'),
    stepsB('Divergent boundary: plates move apart; magma rises and makes new crust (mid-ocean ridges).', 'Convergent boundary: plates push together; one may sink under the other, or both crumple into fold mountains.', 'Transform boundary: plates slide past each other, causing earthquakes.'),
    p('The Indian Plate is moving north and pushing into the Eurasian Plate. This collision crumpled rock into the Himalayas, which are still rising slowly — and it is why the Himalayan region has frequent earthquakes.'),
    def('Pacific Ring of Fire', 'A horseshoe-shaped belt around the Pacific Ocean where plates meet. It has about three-quarters of the world\'s active volcanoes and most of its earthquakes (Japan, Indonesia, Chile).'),
    keys('Slow movements: folding, faulting, mountain building.', 'Sudden movements: earthquakes, volcanic eruptions.', 'Most earthquakes and volcanoes occur along plate boundaries.'),
    remember('Wegener — continental drift, 1912. Pangaea = "all land".'),
  ], [
    ex('Why does Japan have many earthquakes but Telangana very few?', ['Japan lies on the Ring of Fire, where several plates meet.', 'Telangana lies in the stable middle of the Indian Plate, far from boundaries.'], 'Japan is on plate boundaries; Telangana is not.'),
    ex('What kind of boundary formed the Himalayas?', ['The Indian Plate moves north into the Eurasian Plate.', 'Plates moving together = convergent.', 'The crust crumpled and folded upwards.'], 'Convergent boundary (collision)'),
  ], [
    mcq('plates', 'Plates move apart, together, or past each other.', [
      ['Who proposed the theory of continental drift?', 'Alfred Wegener', ['Isaac Newton', 'Charles Darwin', 'James Watt'], 'A German scientist, 1912.', 'Alfred Wegener proposed continental drift in 1912.'],
      ['The supercontinent that once included all land was called…', 'Pangaea', ['Panthalassa', 'Eurasia', 'Atlantis'], 'Its name means "all land".', 'Pangaea means "all lands".'],
      ['The Himalayas formed because…', 'the Indian Plate collided with the Eurasian Plate', ['a volcano erupted', 'glaciers piled up ice', 'the ocean floor sank'], 'Think "convergent".', 'The collision folded and pushed rock upwards.'],
      ['The Pacific Ring of Fire is known for…', 'many volcanoes and earthquakes', ['deserts', 'coral reefs only', 'having no plate boundaries'], 'Plates meet all around the Pacific.', 'Most of the world\'s active volcanoes and earthquakes lie around the Pacific.'],
      ['At a divergent boundary, plates…', 'move apart and new crust forms', ['crash and form mountains', 'slide past sideways', 'stop moving'], 'Diverge = go apart.', 'Magma rises into the gap and forms new crust, as at mid-ocean ridges.'],
    ]),
    matchT('bounds', 'boundary type with what happens there', [
      ['Divergent', 'Plates move apart; new crust forms'], ['Convergent', 'Plates collide; mountains or trenches form'], ['Transform', 'Plates slide past each other'], ['Hot spot', 'Magma rises through the middle of a plate'],
    ], ['Diverge = apart, converge = come together.', 'Transform = slide sideways.'], 4),
    tapT('sudden', 'Tap the SUDDEN earth movements.', [
      ['Earthquake', true], ['Volcanic eruption', true], ['Tsunami caused by an undersea quake', true], ['Rise of the Himalayas', false], ['Continental drift', false], ['Slow folding of rock layers', false],
    ], ['Sudden = happens in seconds or hours.', 'Mountain building takes millions of years.'], 'Earthquakes, eruptions and tsunamis happen suddenly; drift and folding are slow.'),
  ]),
  O('ts9.ss.litho.external', 'External processes: water, ice, waves, wind and humans', [
    h('Sculptors of the land'),
    p('While inner forces push land up, outside agents wear it down. First, rock breaks apart in place (weathering). Then the pieces are carried away (erosion) and dropped somewhere else (deposition).'),
    def('Weathering', 'Breaking of rock in place by heat, frost, water, chemicals or plant roots.'),
    def('Erosion', 'Wearing away and carrying of rock material by water, ice, wind or waves.'),
    stepsB('River (upper course): cuts V-shaped valleys and waterfalls.', 'River (middle course): winds in meanders; cut-off loops become ox-bow lakes.', 'River (lower course): drops silt to form floodplains and deltas (for example, the Godavari and Krishna deltas).'),
    p('Glaciers grind U-shaped valleys and leave piles of rock called moraines. Waves carve sea cliffs, caves, arches and stacks, and build beaches. Wind blasts mushroom rocks and piles sand into dunes. Plant roots split rocks but also hold soil together. Humans now move huge amounts of earth by mining, quarrying and building.'),
    keys('Weathering → erosion → deposition.', 'River: V-valley, meander, ox-bow lake, delta.', 'Glacier: U-valley, moraine. Wind: dunes, mushroom rocks. Waves: cliffs, arches, stacks.'),
    remember('Borra Caves (Andhra Pradesh) were carved by water slowly dissolving limestone.'),
  ], [
    ex('Name the agent: a valley shaped like the letter U high in the Himalayas.', ['Rivers cut narrow V-shapes.', 'Glaciers are wide and heavy and grind a broad, flat-floored valley.'], 'A glacier'),
    ex('How does an ox-bow lake form?', ['A river bends in a large loop (meander).', 'During a flood it cuts straight across the narrow neck.', 'The old loop is left behind as a curved lake.'], 'From a meander cut off by the river'),
  ], [
    matchT('agents', 'landform with the agent that made it', [
      ['V-shaped valley', 'River'], ['U-shaped valley', 'Glacier'], ['Sand dune', 'Wind'], ['Sea arch', 'Sea waves'],
    ], ['Ice makes U-shapes; rivers make V-shapes.', 'Coastal features are carved by waves.'], 4, 2),
    mcq('process', 'Weathering breaks in place; erosion carries away.', [
      ['Rock breaking apart where it is, without being moved, is called…', 'weathering', ['erosion', 'deposition', 'faulting'], 'It stays in place.', 'Weathering breaks rock in place; erosion moves it.'],
      ['Where does a river build a delta?', 'At its mouth, where it meets the sea', ['At its source in the mountains', 'At a waterfall', 'In a V-shaped valley'], 'The river slows down and drops silt.', 'At the mouth the river slows and deposits silt in a fan.'],
      ['A curved lake left by a meander is called…', 'an ox-bow lake', ['a glacial lake', 'a crater lake', 'a lagoon'], 'It is shaped like the U-yoke on an ox.', 'When a meander is cut off, the old loop forms an ox-bow lake.'],
      ['Which is an example of humans acting as an agent of change?', 'Quarrying granite for construction', ['Waves eroding a cliff', 'Wind forming dunes', 'Frost cracking rock'], 'Who uses machines?', 'Quarrying and mining move huge amounts of rock.'],
      ['Moraines are deposits made by…', 'glaciers', ['wind', 'sea waves', 'volcanoes'], 'Think of ice dragging rocks.', 'Glaciers drop the rocks they carry as moraines.'],
    ]),
    orderT('river', 'Order the river features from the source (mountains) to the mouth (sea).', ['Waterfall and V-shaped valley', 'Meanders', 'Ox-bow lake on a wide floodplain', 'Delta'], ['Steep and fast first; slow and flat last.', 'Deposition happens most at the end.'], 'Upper course cuts; middle course winds; lower course deposits.'),
  ]),
]);

// =====================================================================================
// Chapter 3 — Hydrosphere
// =====================================================================================
const ch3 = U(3, 'Hydrosphere', [
  O('ts9.ss.hydro.cycle', 'The water cycle and sources of water', [
    h('The same water, again and again'),
    photo('💧', 'The water in your glass may once have been part of a cloud over the Bay of Bengal, or ice in Antarctica.'),
    p('Earth has a fixed amount of water. It keeps moving between the oceans, air, land and living things. This endless journey is the hydrological (water) cycle, powered by the Sun\'s heat and by gravity.'),
    stepsB('Evaporation: the Sun heats oceans, lakes and rivers; water turns into vapour.', 'Transpiration: plants release water vapour through their leaves.', 'Condensation: vapour rises, cools and forms tiny droplets — clouds.', 'Precipitation: droplets join and fall as rain, snow or hail.', 'Run-off and infiltration: water flows into streams and rivers or soaks into the ground as groundwater, and finally returns to the sea.'),
    vis({ kind: 'bar-graph', labels: ['Oceans (salt)', 'Ice and glaciers', 'Groundwater', 'Lakes, rivers, air'], values: [97, 2, 0.7, 0.3], unit: '% of all water (about)' }, 'Approximate distribution of Earth\'s water: almost all is salty ocean water; very little is fresh water we can easily use.'),
    p('Only about 3% of Earth\'s water is fresh, and most of that is locked in ice. People in Telangana depend on rivers (Godavari, Krishna), reservoirs and village tanks (like the old Kakatiya-era chain tanks), and borewells that tap groundwater.'),
    keys('Cycle: evaporation → condensation → precipitation → run-off / infiltration.', 'About 97% of water is salty; about 3% is fresh.', 'Groundwater must be recharged — over-pumping lowers the water table.'),
    remember('Mission Kakatiya (from 2015) restored many old village tanks in Telangana.'),
  ], [
    ex('Why do borewells in some villages dry up in summer?', ['Water is pumped out faster than rain soaks back in.', 'The water table falls below the bottom of the borewell.'], 'Over-pumping lowers the water table faster than it is recharged.'),
    ex('Out of 100 litres of all Earth\'s water, about how much is fresh water?', ['About 97% is ocean water.', '100 − 97 = 3'], 'About 3 litres'),
  ], [
    orderT('cycle', 'Put the stages of the water cycle in order, starting from the sea.', ['Evaporation from the sea', 'Water vapour rises and cools', 'Condensation into clouds', 'Precipitation as rain', 'Run-off back to rivers and the sea'], ['Water has to become vapour before clouds can form.', 'Rain comes after clouds.'], 'Evaporation → cooling → condensation → precipitation → run-off.', 5),
    mcq('sources', 'Remember the 97% : 3% split.', [
      ['About what share of Earth\'s water is fresh water?', 'About 3%', ['About 30%', 'About 50%', 'About 97%'], 'Most of the water is in the oceans.', 'About 97% is salty ocean water, leaving only about 3% fresh.'],
      ['Where is most of Earth\'s FRESH water stored?', 'In ice caps and glaciers', ['In rivers', 'In lakes', 'In the clouds'], 'Think of Antarctica and Greenland.', 'Ice sheets and glaciers hold most of the fresh water.'],
      ['Water vapour released by plants\' leaves is called…', 'transpiration', ['condensation', 'infiltration', 'precipitation'], 'It is like plants "sweating".', 'Transpiration is water loss from leaves.'],
      ['Water soaking into the ground is called…', 'infiltration', ['evaporation', 'run-off', 'condensation'], 'It goes IN to the soil.', 'Infiltration recharges groundwater.'],
      ['What powers the water cycle?', 'The Sun\'s heat and gravity', ['The Moon only', 'Earthquakes', 'Wind only'], 'Heat lifts water up; something pulls it down.', 'Solar heat evaporates water; gravity brings it back down.'],
    ]),
    tapT('fresh', 'Tap the sources of FRESH water.', [
      ['Godavari river', true], ['A village tank', true], ['Groundwater from a borewell', true], ['Himalayan glaciers', true], ['Bay of Bengal', false], ['Arabian Sea', false], ['Pacific Ocean', false],
    ], ['Seas and oceans are salty.', 'Rivers, tanks, glaciers and groundwater are fresh.'], 'Rivers, tanks, groundwater and glaciers hold fresh water; seas and oceans are salty.'),
  ]),
  O('ts9.ss.hydro.oceans', 'Oceans: relief of the ocean floor, salinity, temperature and currents', [
    h('Under the sea'),
    p('If you could drain the ocean, you would see mountains, plains and deep trenches — just like on land.'),
    stepsB('Continental shelf: gently sloping, shallow edge of a continent (up to about 200 m deep). Rich fishing grounds and oil (Mumbai High).', 'Continental slope: steep drop from the shelf into the deep ocean.', 'Continental rise: sediments piled at the foot of the slope.', 'Abyssal (deep-sea) plain: vast, flat floor about 3,000–6,000 m deep.', 'Mid-ocean ridges and trenches: undersea mountain chains, and very deep narrow trenches such as the Mariana Trench (about 11 km deep).'),
    def('Salinity', 'The amount of dissolved salt in sea water, usually stated in grams of salt per 1,000 g of water (parts per thousand, ‰). The average is about 35 ‰.'),
    p('Salinity is higher where evaporation is strong and little fresh water enters (Red Sea, Dead Sea) and lower where big rivers or melting ice add fresh water. Ocean temperature falls with depth and from the Equator towards the poles.'),
    def('Ocean current', 'A large, steady stream of water moving in a definite direction. Warm currents flow from the Equator towards the poles (Gulf Stream); cold currents flow from the poles towards the Equator (Labrador, Humboldt/Peru current).'),
    f('Salinity (‰) = grams of salt ÷ grams of sea water × 1000', 'salt per thousand'),
    keys('Shelf → slope → rise → abyssal plain → trenches.', 'Average salinity ≈ 35 ‰.', 'Warm currents warm coasts; cold currents cool them and often create rich fishing.'),
    remember('Mariana Trench (Pacific) — deepest place on Earth, about 11 km.'),
  ], [
    ex('A 2,000 g sample of sea water contains 70 g of salt. Find its salinity.', ['Salinity = salt ÷ water × 1000', '= 70 ÷ 2000 × 1000', '= 35 ‰'], '35 ‰ (the ocean average)'),
    ex('Why is the Red Sea saltier than the Bay of Bengal?', ['The Red Sea is in a hot, dry region with strong evaporation and few rivers.', 'The Bay of Bengal receives huge fresh-water flows from the Ganga, Brahmaputra, Godavari and Krishna.'], 'More evaporation and less fresh-water inflow'),
  ], [
    tp('salinity', (r) => {
      const s = r.pick([30, 32, 35, 36, 38, 40, 25, 28]);
      const w = r.pick([1000, 2000, 500, 4000]);
      const salt = (s * w) / 1000;
      return numQ(`A ${w} g sample of sea water contains ${salt} g of dissolved salt. What is its salinity in parts per thousand (‰)?`, s,
        ['Salinity = grams of salt per 1,000 g of water.', `Work out ${salt} ÷ ${w} × 1000.`],
        [`Salinity = ${salt} ÷ ${w} × 1000`, `= ${s} ‰`], [{ when: String(rd((salt / w) * 100, 2)), explain: 'That is a percentage (per hundred). Salinity is given per THOUSAND, so multiply by 1000.' }], 0.001, '‰');
    }, 2),
    orderT('relief', 'Order the parts of the ocean floor moving away from the coast into the deep ocean.', ['Continental shelf', 'Continental slope', 'Continental rise', 'Abyssal plain'], ['The shallow shelf comes first.', 'The flat deep floor is far out.'], 'Shelf → slope → rise → abyssal plain.'),
    mcq('ocean', 'Think about evaporation, rivers and direction of flow.', [
      ['The average salinity of the oceans is about…', '35 ‰', ['3.5 ‰', '350 ‰', '0 ‰'], 'About 35 g of salt in 1 kg of sea water.', 'Average salinity is about 35 parts per thousand.'],
      ['The deepest known place on Earth is in the…', 'Mariana Trench', ['Bay of Bengal', 'Continental shelf off Mumbai', 'Mid-Atlantic Ridge'], 'It is in the western Pacific.', 'The Mariana Trench is about 11 km deep.'],
      ['Mumbai High oil field lies on the…', 'continental shelf', ['abyssal plain', 'ocean trench', 'mid-ocean ridge'], 'It is shallow water near the coast.', 'Shallow continental shelves often contain oil and gas.'],
      ['Cold currents usually flow…', 'from the poles towards the Equator', ['from the Equator towards the poles', 'only in rivers', 'straight down to the sea floor'], 'Cold water comes from cold places.', 'Cold currents carry cold polar water towards the Equator.'],
      ['Salinity is LOWER where…', 'large rivers bring in fresh water', ['evaporation is very high', 'it is hot and dry', 'there are no rivers'], 'Fresh water dilutes salt.', 'River water dilutes sea water and lowers its salinity.'],
    ]),
  ]),
  O('ts9.ss.hydro.resource', 'The ocean as a resource', [
    h('What the oceans give us'),
    photo('🐟', 'Fishing supports millions of families along India\'s long coastline.'),
    p('Oceans give us food (fish, prawns, seaweed), salt, oil and natural gas, minerals (manganese nodules on the deep sea floor), energy from tides and waves, and cheap transport — most international trade travels by ship. Oceans also absorb heat and carbon dioxide, which helps control climate.'),
    def('Exclusive Economic Zone (EEZ)', 'The sea area up to 200 nautical miles from a country\'s coast where it has special rights over fishing, oil and minerals.'),
    p('These resources need protection: over-fishing, oil spills, plastic waste and untreated sewage harm ocean life. Coral reefs and mangroves protect coasts from storms and need conservation.'),
    keys('Food, salt, oil and gas, minerals, energy, transport.', 'EEZ = 200 nautical miles.', 'Over-fishing and pollution threaten ocean resources.'),
    remember('India\'s coastline is about 7,500 km long (including islands).'),
  ], [
    ex('Telangana has no coastline. How does it still benefit from the ocean?', ['Goods from Telangana (for example pharmaceuticals and rice) are exported through ports such as Visakhapatnam and Chennai.', 'Monsoon rain that waters Telangana\'s crops comes from moisture evaporated from the oceans.'], 'Trade through ports and monsoon rainfall'),
    ex('Is offshore oil a renewable ocean resource?', ['Oil formed over millions of years.', 'Once used it cannot be replaced in human time.'], 'No — it is non-renewable.'),
  ], [
    tapT('res', 'Tap the resources we get from the oceans.', [
      ['Fish and prawns', true], ['Salt', true], ['Oil and natural gas', true], ['Tidal energy', true], ['Coal from Singareni', false], ['Teak wood', false], ['Cotton', false],
    ], ['Think about what lies in or under sea water.', 'Coal at Singareni is mined on land.'], 'Fish, salt, oil, gas and tidal energy come from the sea.'),
    mcq('use', 'Some resources renew, some do not.', [
      ['The EEZ of a country extends up to…', '200 nautical miles from its coast', ['2 nautical miles', '12 km', 'the middle of the ocean'], 'It is much wider than territorial waters (12 nautical miles).', 'A country has economic rights up to 200 nautical miles from its coast.'],
      ['Which ocean resource is renewable if managed well?', 'Fish', ['Offshore oil', 'Natural gas', 'Manganese nodules'], 'Living things can reproduce.', 'Fish populations can recover if we do not over-fish.'],
      ['Which is a major threat to ocean life?', 'Plastic waste and oil spills', ['Tides', 'Waves', 'Salinity'], 'Think of human-made harm.', 'Plastics and oil spills poison and trap sea creatures.'],
      ['Most international trade travels by…', 'ship', ['air', 'road', 'pipeline'], 'Heavy goods cost least to carry by sea.', 'Shipping is the cheapest way to move heavy goods long distances.'],
    ]),
    matchT('resource', 'ocean resource with its use', [
      ['Salt pans', 'Common salt for food'], ['Offshore rigs', 'Oil and natural gas'], ['Fishing boats', 'Fish and prawns'], ['Tidal power plants', 'Electricity'], ['Ports', 'Trade and transport'],
    ], ['Match each place or tool to what it produces.', 'Rigs drill; pans evaporate.']),
  ]),
]);

// =====================================================================================
// Chapter 4 — Atmosphere
// =====================================================================================
const ch4 = U(4, 'Atmosphere', [
  O('ts9.ss.atmo.structure', 'Composition and layers of the atmosphere', [
    h('A blanket of air'),
    p('The atmosphere is a layer of gases held around the Earth by gravity. It gives us oxygen to breathe, blocks harmful ultraviolet rays, burns up most meteors, and keeps the planet warm at night.'),
    vis({ kind: 'bar-graph', labels: ['Nitrogen', 'Oxygen', 'Argon', 'Others incl. CO₂'], values: [78, 21, 0.93, 0.07], unit: '% of dry air (about)' }, 'Approximate composition of dry air.'),
    stepsB('Troposphere (0 to about 8 km at the poles and 18 km at the Equator): all weather happens here; temperature falls with height.', 'Stratosphere (to about 50 km): contains the ozone layer, which absorbs ultraviolet rays; calm air suits jet aircraft.', 'Mesosphere (to about 80–85 km): coldest layer; meteors burn up here.', 'Thermosphere (to about 400–600 km): very thin, very hot air; the ionosphere reflects radio waves.', 'Exosphere: outermost layer, fading into space.'),
    def('Normal lapse rate', 'In the troposphere, temperature falls by about 6.5 °C for every 1 km of height.'),
    f('Temperature at height h = ground temperature − 6.5 × h (h in km)', 'six point five degrees per kilometre'),
    xp({
      title: 'What if? Climb higher', formula: 'T = T₀ − 6.5 × h',
      res: ['T', 'Temperature at height', '°C', 'T0 - 6.5 * h', 1],
      vars: [['T0', 'Temperature at the ground', '°C', 0, 45, 1, 30], ['h', 'Height above ground', 'km', 0, 10, 0.5, 2]],
      notes: [['h', 'Going higher means air is farther from the warm ground, so it is colder: 6.5 °C less per km.', 'Coming down brings you closer to the warm ground, so it gets warmer.']],
      mistakes: [['Adding 6.5 for each km', 'Temperature FALLS with height in the troposphere — subtract.'], ['Using metres instead of km', 'The rate is per kilometre: 500 m is 0.5 km.']],
      real: 'This is why hill stations like Ooty or Araku are cooler than the plains below them.',
    }),
    keys('Nitrogen ≈ 78%, oxygen ≈ 21%.', 'Layers: troposphere, stratosphere, mesosphere, thermosphere, exosphere.', 'Ozone layer is in the stratosphere.'),
    remember('Normal lapse rate ≈ 6.5 °C per km.'),
  ], [
    ex('The ground temperature in Hyderabad is 32 °C. What is the temperature about 2 km above it?', ['Fall = 6.5 × 2 = 13 °C', '32 − 13 = 19 °C'], 'About 19 °C'),
    ex('Why do long-distance planes fly in the lower stratosphere?', ['The troposphere has clouds, storms and bumpy air.', 'The lower stratosphere is calm and dry.'], 'Calm air with no weather'),
  ], [
    tp('lapse', (r) => {
      const t0 = r.pick([25, 28, 30, 32, 35, 38, 40]);
      const hk = r.pick([1, 2, 3, 4, 0.5, 1.5]);
      const t = rd(t0 - 6.5 * hk, 2);
      return numQ(`The temperature at ground level is ${t0} °C. Using the normal lapse rate, what is the temperature ${hk} km above the ground (in °C)?`, t,
        ['Temperature falls about 6.5 °C for every km of height.', `Subtract 6.5 × ${hk} from ${t0}.`],
        [`Fall = 6.5 × ${hk} = ${rd(6.5 * hk, 2)} °C`, `${t0} − ${rd(6.5 * hk, 2)} = ${t} °C`], [{ when: String(rd(t0 + 6.5 * hk, 2)), explain: 'You added. Air gets COLDER as you go up in the troposphere.' }], 0.001, '°C');
    }, 2),
    orderT('layers', 'Order the layers of the atmosphere from the ground upward.', ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere', 'Exosphere'], ['Weather happens in the lowest layer.', 'The ozone layer is in the second layer.'], 'Tropo → strato → meso → thermo → exo.', 4),
    mcq('air', 'Nitrogen is the biggest share; ozone sits in the stratosphere.', [
      ['Which gas makes up the largest share of the air?', 'Nitrogen', ['Oxygen', 'Carbon dioxide', 'Argon'], 'About 78%.', 'Nitrogen is about 78% of dry air.'],
      ['The ozone layer is found in the…', 'stratosphere', ['troposphere', 'mesosphere', 'exosphere'], 'It is above the weather layer.', 'Ozone in the stratosphere absorbs harmful ultraviolet rays.'],
      ['In which layer do clouds, rain and storms occur?', 'Troposphere', ['Stratosphere', 'Thermosphere', 'Exosphere'], '"Tropo" means turning or changing.', 'Almost all weather happens in the troposphere.'],
      ['Meteors mostly burn up in the…', 'mesosphere', ['troposphere', 'stratosphere', 'ozone layer'], 'It is the layer above the stratosphere.', 'Friction with air in the mesosphere burns up most meteors.'],
      ['Radio waves are reflected back to Earth by the…', 'ionosphere (in the thermosphere)', ['ozone layer', 'troposphere', 'clouds'], 'It contains charged particles (ions).', 'The ionosphere reflects radio waves, helping long-distance radio.'],
    ]),
  ]),
  O('ts9.ss.atmo.winds', 'Pressure belts, planetary winds and local winds', [
    h('Why does wind blow?'),
    p('Warm air expands, becomes light and rises, leaving LOW pressure below. Cool air is heavy and sinks, making HIGH pressure. Air always moves from high pressure to low pressure — that moving air is wind.'),
    stepsB('Equatorial low (around 0°): strong heating, rising air, calm "doldrums".', 'Subtropical highs (around 30° N and S): air sinks — many hot deserts lie here.', 'Subpolar lows (around 60° N and S): air rises where warm and cold air meet.', 'Polar highs (90° N and S): very cold, heavy, sinking air.'),
    def('Planetary winds', 'Winds that blow all year between the pressure belts: trade winds (subtropical high → equatorial low), westerlies (subtropical high → subpolar low), polar easterlies (polar high → subpolar low).'),
    def('Coriolis effect', 'Because the Earth spins, moving winds are deflected — to the right in the Northern Hemisphere and to the left in the Southern Hemisphere.'),
    def('Local winds', 'Winds of a small area for a short season, such as the Loo (hot, dry summer wind of north India), the Chinook (warm wind of the Rockies) and the Foehn (warm wind of the Alps).'),
    keys('Wind blows from HIGH to LOW pressure.', 'Belts: equatorial low, subtropical high, subpolar low, polar high.', 'Winds turn right in the north, left in the south (Coriolis).'),
    remember('Trade winds 30° → 0°; westerlies 30° → 60°; polar easterlies 90° → 60°.'),
  ], [
    ex('Why are big hot deserts like the Sahara found near 30°N?', ['Air sinks at the subtropical high-pressure belt.', 'Sinking air warms and dries out, so clouds rarely form.'], 'Sinking dry air at the subtropical high'),
    ex('Which way does a wind blowing from 30°N towards the Equator turn?', ['It is in the Northern Hemisphere.', 'The Coriolis effect turns it to the right.', 'So it blows from the north-east: the north-east trade winds.'], 'To the right — it becomes the north-east trade wind.'),
  ], [
    matchT('belts', 'wind with where it blows', [
      ['Trade winds', 'From 30° towards the Equator'], ['Westerlies', 'From 30° towards 60°'], ['Polar easterlies', 'From the poles towards 60°'], ['Loo', 'Hot, dry summer wind of north India'], ['Chinook', 'Warm wind down the Rocky Mountains'],
    ], ['Planetary winds go from high-pressure belts to low-pressure belts.', 'Local winds have special names.'], 4, 2),
    mcq('press', 'Warm air rises (low pressure); cool air sinks (high pressure).', [
      ['Wind always blows from…', 'high pressure to low pressure', ['low pressure to high pressure', 'east to west only', 'the poles to the Moon'], 'Like air rushing out of a pumped-up tyre.', 'Air flows from where it is crowded (high pressure) to where it is less (low pressure).'],
      ['In the Northern Hemisphere, winds are deflected to the…', 'right', ['left', 'upwards', 'they are not deflected'], 'Coriolis: right in the north.', 'Earth\'s rotation turns winds to the right in the Northern Hemisphere.'],
      ['The equatorial low-pressure belt is also called the…', 'doldrums', ['horse latitudes', 'roaring forties', 'jet stream'], 'Sailing ships got stuck here with no wind.', 'Rising air at the Equator leaves calm "doldrums" near the surface.'],
      ['Which is a LOCAL wind?', 'Loo', ['Trade wind', 'Westerly', 'Polar easterly'], 'It blows only in one region in one season.', 'The Loo is a hot, dry local wind in north India in May–June.'],
    ]),
    orderT('belts-order', 'Order the pressure belts from the Equator to the North Pole.', ['Equatorial low', 'Subtropical high', 'Subpolar low', 'Polar high'], ['Lows and highs alternate.', 'It is coldest and heaviest at the pole.'], 'Low (0°) → high (30°) → low (60°) → high (90°).'),
  ]),
  O('ts9.ss.atmo.weather', 'Weather, climate, humidity and rainfall', [
    h('Today vs every year'),
    photo('🌧️', 'Monsoon clouds over the Deccan: moist winds from the sea bring Telangana most of its rain between June and September.'),
    def('Weather', 'The condition of the atmosphere at a place for a short time — today\'s temperature, rain, wind and humidity.'),
    def('Climate', 'The average weather of a place over a long period (about 30 years or more).'),
    def('Relative humidity', 'How much water vapour the air holds compared with the most it could hold at that temperature, written as a percentage.'),
    f('Relative humidity (%) = actual vapour ÷ vapour the air can hold × 100', 'actual over capacity times one hundred'),
    p('When moist air cools to its dew point, vapour condenses into dew, fog, mist or clouds. Precipitation can fall as rain, drizzle, snow, sleet or hail.'),
    stepsB('Convectional rain: strong heating makes moist air rise quickly; afternoon thunderstorms (common near the Equator and in Indian summer).', 'Orographic (relief) rain: moist wind is forced up a mountain; the windward side gets heavy rain, the leeward side is a dry "rain shadow".', 'Cyclonic (frontal) rain: warm air rises over cold air in a cyclone or along a front.'),
    xp({
      title: 'What if? Change the moisture in the air', formula: 'RH = a ÷ c × 100',
      res: ['RH', 'Relative humidity', '%', 'a / c * 100', 0],
      vars: [['a', 'Water vapour actually present', 'g/m³', 0, 30, 1, 12], ['c', 'Most vapour the air can hold', 'g/m³', 5, 30, 1, 24]],
      notes: [['a', 'More vapour in the same air makes it feel sticky; RH rises.', 'Drier air: RH falls and sweat evaporates quickly.'], ['c', 'Warmer air can hold more vapour, so with the same moisture RH falls.', 'Cooler air holds less; RH rises and dew or fog may form.']],
      mistakes: [['Thinking RH can be above 100%', 'At 100% the air is saturated; extra vapour condenses as dew, fog or cloud.']],
      real: 'Early mornings are cooler, so RH is higher — that is when dew forms on grass.',
    }),
    keys('Weather = short term; climate = long-term average.', 'Three rain types: convectional, orographic, cyclonic.', 'Leeward side of mountains is a rain shadow.'),
    remember('Mumbai (windward side of the Western Ghats) is very wet; Pune (leeward) is much drier — a rain shadow.'),
  ], [
    ex('Air holds 15 g of vapour per m³ but could hold 20 g. Find the relative humidity.', ['RH = 15 ÷ 20 × 100', '= 75%'], '75%'),
    ex('Is "Hyderabad usually has hot summers and mild winters" weather or climate?', ['It describes the usual pattern over many years.', 'Weather would describe one particular day.'], 'Climate'),
  ], [
    tp('rh', (r) => {
      const c = r.pick([10, 20, 25, 40, 50]);
      const pct = r.pick([20, 40, 50, 60, 80, 30, 90]);
      const a = (c * pct) / 100;
      return numQ(`Air at a certain temperature can hold ${c} g of water vapour per m³. It actually holds ${a} g per m³. What is its relative humidity (%)?`, pct,
        ['RH = actual vapour ÷ maximum vapour × 100.', `Work out ${a} ÷ ${c} × 100.`],
        [`RH = ${a} ÷ ${c} × 100`, `= ${pct}%`], [{ when: String(rd(c / a * 100, 1)), explain: 'You divided the wrong way round. Put the ACTUAL vapour on top.' }], 0.001, '%');
    }, 2),
    matchT('rain', 'type of rainfall with how it forms', [
      ['Convectional', 'Strong heating makes moist air rise quickly'], ['Orographic', 'Moist wind is forced up a mountain'], ['Cyclonic', 'Warm air rises over cold air in a low-pressure system'], ['Rain shadow', 'Dry leeward side of a mountain'],
    ], ['"Oro" means mountain.', 'Convection = rising because of heat.']),
    mcq('wc', 'Weather is today; climate is the long-term average.', [
      ['"It is raining heavily in Warangal this afternoon" describes…', 'weather', ['climate', 'relief', 'latitude'], 'It is about one afternoon.', 'A short-term condition is weather.'],
      ['Climate is the average weather over about…', '30 years or more', ['one day', 'one week', 'one month'], 'It is a long-term pattern.', 'Climate is worked out from about 30 years of records.'],
      ['Which side of a mountain gets the heavier rain?', 'The windward side', ['The leeward side', 'Neither side', 'Only the summit'], 'Moist air cools as it is pushed up.', 'Rising air on the windward side cools and drops its moisture.'],
      ['Small balls of ice that fall during thunderstorms are…', 'hail', ['dew', 'fog', 'drizzle'], 'They can damage crops and car roofs.', 'Hailstones form inside tall thunderstorm clouds.'],
      ['Dew forms when air cools to its…', 'dew point', ['boiling point', 'freezing point of iron', 'lapse rate'], 'Point at which vapour condenses.', 'At the dew point the air is saturated and vapour condenses.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 5 — Biosphere
// =====================================================================================
const ch5 = U(5, 'Biosphere', [
  O('ts9.ss.bio.vegetation', 'Natural vegetation: forests and grasslands', [
    h('Plants follow the rain and temperature'),
    photo('🌳', 'Teak forests of Adilabad and Bhadradri Kothagudem are tropical deciduous forests: trees shed their leaves in the dry season.'),
    def('Biosphere', 'The narrow zone of land, water and air where life exists, and all the living things in it.'),
    def('Natural vegetation', 'Plants that grow on their own without people planting them, shaped by rainfall, temperature and soil.'),
    stepsB('Tropical evergreen forests: heavy rain (over about 200 cm), tall dense trees that stay green all year — Western Ghats, Andaman, Amazon.', 'Tropical deciduous (monsoon) forests: moderate rain; trees shed leaves in the dry season — teak, sal, bamboo; most of Telangana\'s forests.', 'Thorn forests and scrub: low rain — babul, cactus, kikar.', 'Mangrove forests: salty tidal coasts and deltas — Sundarbans, Godavari–Krishna delta mangroves.', 'Temperate and coniferous forests: cool regions — pine, fir, deodar on the Himalayan slopes; the taiga of Siberia and Canada.'),
    def('Grassland', 'A region where grasses dominate because rain is too little for dense forests. Tropical grasslands are the savannas; temperate grasslands have regional names.'),
    keys('Rainfall decides forest type: evergreen > deciduous > thorn.', 'Telangana: mostly tropical dry deciduous forest.', 'Temperate grasslands: prairies, pampas, steppes, veld, downs.'),
    remember('Savanna (Africa) — tropical; Prairies (N. America), Pampas (Argentina), Steppes (Eurasia), Veld (S. Africa), Downs (Australia) — temperate.'),
  ], [
    ex('Why do teak trees in Telangana shed their leaves in summer?', ['Telangana gets rain mainly in the monsoon months.', 'In the long dry season, shedding leaves reduces water loss by transpiration.'], 'To save water during the dry season'),
    ex('Which forest type grows where rivers meet the sea in salty, muddy water?', ['Only trees with special breathing roots survive in salty, tidal mud.', 'These are mangroves.'], 'Mangrove forest'),
  ], [
    matchT('grass', 'grassland with its region', [
      ['Prairies', 'North America'], ['Pampas', 'Argentina'], ['Steppes', 'Central Asia and Eastern Europe'], ['Veld', 'South Africa'], ['Downs', 'Australia'], ['Savanna', 'Tropical Africa'],
    ], ['The Pampas are in South America.', 'The Downs are in Australia.']),
    mcq('forest', 'More rain → taller, greener forests.', [
      ['Most of Telangana\'s forests are…', 'tropical deciduous', ['tropical evergreen', 'coniferous', 'mangrove'], 'Teak sheds its leaves in the dry season.', 'Telangana\'s teak and bamboo forests are tropical (dry) deciduous.'],
      ['Tropical evergreen forests need…', 'heavy rainfall all through the year', ['very little rain', 'snow every winter', 'salty water'], 'Ever-green = never dry.', 'Heavy rainfall keeps these forests green all year.'],
      ['Sundarbans are famous for…', 'mangrove forests', ['coniferous forests', 'thorn forests', 'grasslands'], 'They grow in the Ganga–Brahmaputra delta.', 'The Sundarbans are the world\'s largest mangrove forest.'],
      ['Pine and deodar trees grow in…', 'cool Himalayan slopes', ['the Thar desert', 'the Sundarbans', 'the Deccan plains'], 'Cone-bearing trees like cold places.', 'Coniferous trees grow in cool temperate and mountain regions.'],
    ]),
    orderT('rainorder', 'Order the forest types from the WETTEST to the DRIEST conditions.', ['Tropical evergreen', 'Tropical deciduous', 'Thorn forest and scrub', 'Desert vegetation'], ['Evergreen needs the most rain.', 'Thorny plants survive in dry places.'], 'Rainfall decreases: evergreen → deciduous → thorn → desert.'),
  ]),
  O('ts9.ss.bio.environment', 'Human society and the environment: pollution and depletion', [
    h('Using without using up'),
    p('Humans take wood, water, soil and minerals from the biosphere and give back smoke, sewage and plastic. When we take faster than nature can renew, or dump more than it can absorb, the environment is damaged.'),
    def('Pollutant', 'A substance that harms air, water or soil — smoke, vehicle exhaust, untreated sewage, chemical fertilisers, pesticides, plastic.'),
    def('Resource depletion', 'Using up a resource faster than it is renewed — cutting forests, over-pumping groundwater, over-fishing, mining.'),
    p('Examples close to home: lakes in Hyderabad have suffered from sewage and encroachment; heavy pesticide use harms soil and water; rapid cutting of forests reduces rainfall absorption and wildlife habitats.'),
    stepsB('Reduce use of plastic and energy.', 'Reuse and recycle materials.', 'Plant and protect trees (Telangana\'s Haritha Haram programme planted crores of saplings).', 'Treat sewage and industrial waste before releasing it.', 'Use water carefully and harvest rainwater.'),
    keys('Pollution = adding harmful substances.', 'Depletion = using resources faster than they renew.', 'Sustainable development: meet today\'s needs without harming the future.'),
    remember('Sustainable development: development that meets present needs without compromising the needs of future generations.'),
  ], [
    ex('Classify: a factory releases untreated waste into the Musi river.', ['A harmful substance is being added to water.', 'That is pollution (water pollution).'], 'Water pollution'),
    ex('Classify: groundwater is pumped so fast that the water table falls every year.', ['Nothing harmful is added; a resource is being used up.', 'That is depletion.'], 'Resource depletion'),
  ], [
    tapT('pollute', 'Tap the actions that POLLUTE the environment.', [
      ['Burning plastic waste', true], ['Releasing untreated sewage into a lake', true], ['Overusing chemical pesticides', true], ['Vehicle exhaust from old engines', true],
      ['Rainwater harvesting', false], ['Planting trees', false], ['Using a cloth bag', false], ['Composting kitchen waste', false],
    ], ['Pollution adds something harmful.', 'Harvesting, planting and composting help.'], 'Burning plastic, sewage, excess pesticides and exhaust add harmful substances.'),
    mcq('sust', 'Pollution adds harm; depletion uses up.', [
      ['Over-pumping of groundwater is an example of…', 'resource depletion', ['air pollution', 'noise pollution', 'afforestation'], 'Something is being used up.', 'Taking water faster than rain recharges it depletes the resource.'],
      ['Sustainable development means…', 'meeting today\'s needs without harming future generations', ['using all resources quickly', 'stopping all industries', 'only planting trees'], 'Think about your grandchildren too.', 'It balances present needs and future needs.'],
      ['Which is a renewable resource?', 'Solar energy', ['Coal', 'Petroleum', 'Iron ore'], 'It is replaced every day.', 'Sunlight is replenished continuously.'],
      ['Haritha Haram in Telangana is a programme for…', 'planting trees and increasing green cover', ['building dams', 'mining coal', 'road widening'], 'Haritha means green.', 'It aims to increase tree cover across the state.'],
    ]),
    matchT('poll', 'pollutant with what it mainly pollutes', [
      ['Vehicle exhaust', 'Air'], ['Untreated sewage', 'Water'], ['Excess chemical fertiliser', 'Soil'], ['Loudspeakers at high volume', 'Noise (sound)'],
    ], ['Smoke goes into the air.', 'Fertiliser goes onto fields.']),
  ]),
  O('ts9.ss.bio.kyoto', 'Climate change and the Kyoto Protocol', [
    h('A warming planet'),
    p('Burning coal, oil and gas releases carbon dioxide. Together with methane and other greenhouse gases, it traps heat in the atmosphere. The result is global warming: rising temperatures, melting glaciers, rising seas and more extreme weather.'),
    def('Greenhouse effect', 'Natural trapping of heat by gases such as carbon dioxide and water vapour. Without it Earth would be frozen; too much of it overheats the planet.'),
    def('Kyoto Protocol', 'An international agreement adopted in 1997 at Kyoto, Japan, under the UN Framework Convention on Climate Change. It set binding targets for developed (industrialised) countries to cut greenhouse-gas emissions.'),
    stepsB('1992: UN Framework Convention on Climate Change agreed at the Earth Summit, Rio de Janeiro.', '1997: Kyoto Protocol adopted.', '2002: India ratified (approved) the Kyoto Protocol.', '2005: Kyoto Protocol came into force.', '2015: Paris Agreement — nearly every country set its own targets to limit warming.'),
    p('Kyoto followed the idea of "common but differentiated responsibilities": developed countries, which had released most past emissions, had to cut first; developing countries such as India had no binding cuts but could join clean projects.'),
    keys('Greenhouse gases: CO₂, methane, nitrous oxide.', 'Kyoto 1997, in force 2005; Paris Agreement 2015.', 'Developed countries had binding targets under Kyoto.'),
    remember('Kyoto Protocol — adopted 1997, in force 2005.'),
  ], [
    ex('Why did Kyoto put binding targets mainly on developed countries?', ['They had industrialised first and released most of the greenhouse gases already in the air.', 'Developing countries still needed to grow to reduce poverty.'], 'Because of their larger historical share of emissions'),
    ex('Order: Paris Agreement, Kyoto adopted, Earth Summit, Kyoto in force.', ['Earth Summit 1992', 'Kyoto adopted 1997', 'Kyoto in force 2005', 'Paris Agreement 2015'], 'Earth Summit → Kyoto adopted → in force → Paris'),
  ], [
    orderT('kyoto', 'Order these climate milestones by date (earliest first).', ['Earth Summit at Rio (1992)', 'Kyoto Protocol adopted (1997)', 'India ratifies Kyoto (2002)', 'Kyoto Protocol comes into force (2005)', 'Paris Agreement (2015)'], ['Rio came first.', 'Paris is the most recent.'], '1992 → 1997 → 2002 → 2005 → 2015.'),
    mcq('climate', 'Kyoto is in Japan; it was about greenhouse gases.', [
      ['The Kyoto Protocol was adopted in…', '1997', ['1947', '1992', '2015'], 'It was named after a Japanese city.', 'It was adopted in December 1997.'],
      ['The Kyoto Protocol aimed to reduce…', 'greenhouse-gas emissions', ['population growth', 'import taxes', 'ocean salinity'], 'Think global warming.', 'It set targets to cut gases that trap heat.'],
      ['Which gas is the main greenhouse gas from burning fuels?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Argon'], 'Burning carbon makes it.', 'Burning coal, oil and gas releases carbon dioxide.'],
      ['Which agreement of 2015 asked nearly all countries to set their own climate targets?', 'Paris Agreement', ['Kyoto Protocol', 'Treaty of Versailles', 'Montreal Protocol'], 'Named after a European capital.', 'Under the Paris Agreement each country sets national targets.'],
    ]),
    tapT('effects', 'Tap the likely effects of global warming.', [
      ['Melting glaciers', true], ['Rising sea levels', true], ['More frequent heatwaves', true], ['More extreme rainfall events', true], ['A thicker ozone layer', false], ['Colder summers everywhere', false],
    ], ['Warming means more heat energy in the system.', 'The ozone layer is a separate issue.'], 'Warming melts ice, raises seas and intensifies heatwaves and heavy rain.'),
  ]),
]);

// =====================================================================================
// Chapter 6 — Agriculture in India
// =====================================================================================
const ch6 = U(6, 'Agriculture in India', [
  O('ts9.ss.agri.types', 'Types of farming, cropping seasons and major crops', [
    h('Many ways to farm'),
    photo('🌾', 'Paddy fields in Telangana: rice is grown in both the kharif and rabi seasons where irrigation is available.'),
    def('Subsistence farming', 'Growing crops mainly to feed one\'s own family, on small plots with simple tools.'),
    def('Commercial farming', 'Growing crops mainly for sale, often with machines, fertilisers and high-yielding seeds.'),
    def('Plantation farming', 'A single crop such as tea, coffee or rubber grown on a large estate, with processing nearby.'),
    def('Shifting cultivation', 'Clearing a forest patch, farming it for a few years, then moving on. In Telangana\'s tribal areas it is called podu.'),
    stepsB('Kharif: sown with the monsoon (June–July), harvested September–October — rice, maize, cotton, jowar, red gram, soybean.', 'Rabi: sown in winter (October–November), harvested March–April — wheat, gram, mustard, and irrigated rabi paddy.', 'Zaid: short summer season between rabi and kharif — watermelon, cucumber, vegetables, fodder.'),
    def('Food crops and non-food crops', 'Food crops: rice, wheat, millets (jowar, bajra, ragi), pulses. Non-food (commercial) crops: cotton, jute, rubber, tobacco. Sugarcane, oilseeds, tea and coffee are cash crops that are processed before we consume them.'),
    keys('Seasons: kharif (monsoon), rabi (winter), zaid (summer).', 'Telangana major crops: paddy, cotton, maize, red gram, turmeric.', 'Podu = shifting cultivation in Telangana.'),
    remember('Kharif — monsoon sowing; Rabi — winter sowing.'),
  ], [
    ex('A farmer near Nizamabad sows maize in July and harvests in October. Which season?', ['Sown with the monsoon (July).', 'Harvested in autumn (October).'], 'Kharif'),
    ex('Is a tea estate in Assam subsistence or plantation farming?', ['It grows one crop on a big estate.', 'The crop is sold, often exported, after processing.'], 'Plantation farming'),
  ], [
    tp('season', (r) => {
      const bank: [string, string][] = [['Rice (monsoon crop)', 'Kharif'], ['Cotton', 'Kharif'], ['Maize (monsoon sowing)', 'Kharif'], ['Jowar (monsoon sowing)', 'Kharif'], ['Red gram', 'Kharif'], ['Wheat', 'Rabi'], ['Gram (chickpea)', 'Rabi'], ['Mustard', 'Rabi'], ['Watermelon', 'Zaid'], ['Cucumber', 'Zaid']];
      const [crop, s] = r.pick(bank);
      return {
        type: 'mcq', prompt: `In which cropping season is ${crop} mainly grown in India?`, ...choose(r, s, ['Kharif', 'Rabi', 'Zaid'].filter((x) => x !== s)),
        hints: ['Kharif = sown at the start of the monsoon; rabi = sown in winter; zaid = short summer season.', 'Wheat needs cool winters; cotton and rice need monsoon rain.'],
        mistakes: [{ when: 'wrong', explain: `${crop} is a ${s} crop. Think of the weather it needs when it is sown.` }],
        solution: [`${crop} → ${s}.`],
      };
    }),
    matchT('ftype', 'type of farming with its description', [
      ['Subsistence', 'Grown mainly to feed the farmer\'s family'], ['Commercial', 'Grown mainly for sale in markets'], ['Plantation', 'Single crop on a large estate (tea, rubber)'], ['Shifting (podu)', 'Clear a forest patch, farm, then move'], ['Mixed farming', 'Crops and livestock together'],
    ], ['Plantation = estate crops like tea.', 'Podu is the Telangana name for shifting cultivation.']),
    tapT('food', 'Tap the FOOD crops.', [
      ['Rice', true], ['Wheat', true], ['Jowar', true], ['Red gram', true], ['Cotton', false], ['Jute', false], ['Rubber', false],
    ], ['Food crops are eaten as grain or pulses.', 'Cotton, jute and rubber are fibres or industrial raw materials.'], 'Cereals, millets and pulses are food crops; cotton, jute and rubber are non-food.'),
  ]),
  O('ts9.ss.agri.phases', 'Small farmers, irrigation, dams and the Green Revolution', [
    h('Farmers and their problems'),
    p('Most Indian farmers are small or marginal: they own less than 2 hectares. With little land, they have little to sell, find it hard to buy machines, and often borrow money for seeds and fertilisers. They also depend heavily on the monsoon — a late or weak monsoon can ruin a whole crop.'),
    vis({ kind: 'bar-graph', labels: ['Marginal (<1 ha)', 'Small (1–2 ha)', 'Others (>2 ha)'], values: [68, 18, 14], unit: '% of land holdings (about, Agriculture Census 2015-16)' }, 'About 86% of farm holdings in India are small or marginal (approximate shares).'),
    stepsB('1950s–60s: big multipurpose dams for irrigation and power — Bhakra Nangal (Sutlej), Nagarjuna Sagar (Krishna, on the Telangana–Andhra border).', 'Mid-1960s: Green Revolution — high-yielding variety (HYV) seeds of wheat and rice with fertilisers, irrigation and pesticides; first in Punjab, Haryana and western Uttar Pradesh.', '1991 onwards: economic reforms (post-reform period) — more market links, but subsidies and public investment in farming grew slowly; farm distress in many regions.', 'Recent decades: lift irrigation and tank restoration in Telangana (e.g. Kaleshwaram project, Mission Kakatiya).'),
    p('The Green Revolution made India self-sufficient in food grains, but its benefits went mostly to irrigated regions and larger farmers, and heavy chemical use later harmed soil and water.'),
    keys('About 86% of holdings are small or marginal (under 2 ha).', 'Green Revolution: HYV seeds + fertiliser + irrigation (mid-1960s).', 'Dams provide irrigation but also displace people.'),
    remember('Scientists linked to India\'s Green Revolution: M.S. Swaminathan (India) and Norman Borlaug (high-yield wheat).'),
  ], [
    ex('Why does a weak monsoon hurt a small farmer in Mahabubnagar more than a big farmer in irrigated Punjab?', ['The small farmer depends on rain because he has no assured irrigation.', 'He has no savings or extra land to absorb the loss.'], 'Dependence on rain and little financial cushion'),
    ex('Which inputs together made up the Green Revolution package?', ['High-yielding variety seeds', 'Chemical fertilisers', 'Assured irrigation', 'Pesticides'], 'HYV seeds, fertilisers, irrigation and pesticides'),
  ], [
    orderT('phases', 'Order these phases of Indian agriculture by time.', ['Building of large multipurpose dams (1950s)', 'Green Revolution with HYV seeds (mid-1960s)', 'Economic reforms begin (1991)', 'Mission Kakatiya restores Telangana tanks (2015)'], ['Dams came soon after Independence.', 'Reforms began in 1991.'], '1950s dams → 1960s Green Revolution → 1991 reforms → 2015 Mission Kakatiya.'),
    mcq('green', 'HYV = high-yielding variety.', [
      ['The Green Revolution first succeeded mainly with…', 'wheat (and later rice)', ['cotton', 'tea', 'jute'], 'Think of Punjab\'s fields.', 'HYV wheat gave the first big jump, followed by rice.'],
      ['A marginal farmer owns less than…', '1 hectare', ['10 hectares', '100 hectares', '1 square kilometre'], 'Small is 1–2 ha.', 'Marginal holdings are below 1 ha; small are 1–2 ha.'],
      ['Nagarjuna Sagar dam is built on the river…', 'Krishna', ['Godavari', 'Sutlej', 'Ganga'], 'It lies on the Telangana–Andhra Pradesh border.', 'Nagarjuna Sagar is on the Krishna.'],
      ['One problem caused later by the Green Revolution was…', 'soil damage from heavy chemical use', ['food shortage', 'fewer tube wells', 'less irrigation'], 'Too much of a good thing.', 'Overuse of fertilisers and pesticides harmed soil and water.'],
      ['Most Indian farmers are…', 'small and marginal', ['large landowners', 'plantation owners', 'foreign companies'], 'Holdings under 2 hectares.', 'About 86% of holdings are under 2 hectares.'],
    ]),
    tapT('green-in', 'Tap the parts of the Green Revolution "package".', [
      ['High-yielding variety seeds', true], ['Chemical fertilisers', true], ['Assured irrigation', true], ['Pesticides', true], ['Bullock carts only', false], ['Shifting cultivation', false],
    ], ['The new seeds needed lots of water and nutrients.', 'Old methods were replaced, not added.'], 'HYV seeds worked only together with fertilisers, irrigation and pesticides.'),
  ]),
  O('ts9.ss.agri.dryland', 'Dryland farming, fertiliser problems, organic farming and farm trade', [
    h('Farming with little water'),
    def('Dryland (rainfed) agriculture', 'Farming that depends only on rain, with no assured irrigation. Roughly half of India\'s cultivated area is rainfed, including much of Telangana.'),
    p('Dryland farmers grow hardy crops — millets (jowar, bajra, ragi), pulses, oilseeds and cotton. Practices that help: farm ponds, contour bunds to hold rain, mulching, mixed cropping, drought-tolerant seeds.'),
    def('Fertiliser imbalance', 'Using too much urea (nitrogen) compared with phosphorus and potassium. The often-recommended ratio N : P : K is about 4 : 2 : 1; imbalance lowers soil health and yields over time.'),
    def('Organic farming', 'Farming without synthetic fertilisers and pesticides, using compost, green manure, crop rotation and natural pest control. Sikkim was declared a fully organic state in 2016.'),
    p('Farm trade: farmers sell in regulated markets (agricultural market yards), to traders or directly. The government announces Minimum Support Prices (MSP) for many crops and buys some grain for the Public Distribution System. India also exports rice, spices, cotton and more.'),
    keys('Rainfed areas grow millets, pulses, oilseeds.', 'Balanced N:P:K ≈ 4:2:1.', 'Organic farming uses compost and natural pest control.'),
    remember('MSP = Minimum Support Price, announced by the government before the sowing season.'),
  ], [
    ex('A farmer used 120 kg of nitrogen. Using N : P : K = 4 : 2 : 1, how much phosphorus and potassium would balance it?', ['4 parts = 120 kg, so 1 part = 30 kg', 'P = 2 parts = 60 kg', 'K = 1 part = 30 kg'], 'P = 60 kg, K = 30 kg'),
    ex('Why are millets suitable for dryland farming in Telangana?', ['They need little water.', 'They tolerate heat and poor soils.', 'They mature quickly.'], 'They are drought-hardy and need little water.'),
  ], [
    tp('npk', (r) => {
      const part = r.pick([10, 15, 20, 25, 30, 40]);
      const ask = r.pick(['P', 'K'] as const);
      const n = 4 * part;
      const ans = ask === 'P' ? 2 * part : part;
      return numQ(`Using the ratio N : P : K = 4 : 2 : 1, a farmer applies ${n} kg of nitrogen (N). How many kg of ${ask === 'P' ? 'phosphorus (P)' : 'potassium (K)'} balance it?`, ans,
        ['Find the size of one part: N is 4 parts.', `One part = ${n} ÷ 4. ${ask} is ${ask === 'P' ? '2 parts' : '1 part'}.`],
        [`1 part = ${n} ÷ 4 = ${part} kg`, `${ask} = ${ask === 'P' ? 2 : 1} × ${part} = ${ans} kg`], [{ when: String(n), explain: 'That is the nitrogen amount. Divide by 4 to get one part first.' }], 0.001, 'kg');
    }, 2),
    mcq('dry', 'Rainfed = depends on rain only.', [
      ['Which crop is best suited to dryland farming?', 'Jowar (sorghum)', ['Sugarcane', 'Paddy', 'Banana'], 'It needs little water.', 'Millets like jowar survive with little rainfall.'],
      ['Organic farming avoids…', 'synthetic fertilisers and pesticides', ['compost', 'crop rotation', 'green manure'], 'It uses natural inputs.', 'Organic farming uses compost and natural pest control instead of chemicals.'],
      ['Which state was declared fully organic in 2016?', 'Sikkim', ['Punjab', 'Telangana', 'Gujarat'], 'A small Himalayan state.', 'Sikkim converted all its farmland to organic.'],
      ['MSP stands for…', 'Minimum Support Price', ['Maximum Selling Price', 'Market Sales Point', 'Monsoon Supply Plan'], 'It is a floor price for crops.', 'MSP is the price at which the government offers to buy certain crops.'],
      ['Overuse of urea mainly adds too much…', 'nitrogen', ['phosphorus', 'potassium', 'calcium'], 'Urea is a nitrogen fertiliser.', 'Urea supplies nitrogen; excess upsets the N:P:K balance.'],
    ]),
    tapT('save', 'Tap the practices that help dryland farmers save water and soil.', [
      ['Farm ponds', true], ['Contour bunds', true], ['Mulching', true], ['Drought-tolerant seeds', true], ['Flood-irrigating paddy in summer', false], ['Burning crop stubble', false],
    ], ['Which methods keep rain in the field?', 'Flooding uses a lot of water.'], 'Ponds, bunds, mulching and hardy seeds conserve water and soil.'),
  ]),
]);

// =====================================================================================
// Chapter 7 — Industries in India
// =====================================================================================
const ch7 = U(7, 'Industries in India', [
  O('ts9.ss.ind.location', 'What factories need and where they are located', [
    h('Why is a factory where it is?'),
    photo('🏢', 'Industrial estates around Hyderabad — pharma units at Jeedimetla and Pashamylaram, IT parks at HITEC City.'),
    p('A factory turns raw materials into finished goods. To run, it needs raw materials, power, water, workers, money (capital), transport and a market. Owners choose locations that keep these costs low.'),
    stepsB('Raw materials: heavy, weight-losing materials pull factories close to them (steel plants near iron ore and coal; sugar mills near cane fields).', 'Power and water: thermal plants, textile and chemical units need plenty.', 'Labour: skilled workers (IT, pharma) or many workers (textiles).', 'Market and transport: ports, highways and railways reduce costs.', 'Government policy: industrial estates, tax concessions and single-window approvals (Telangana\'s TS-iPASS, 2014).'),
    def('Agglomeration', 'The tendency of related industries to cluster together to share skilled workers, suppliers and services — like pharma around Hyderabad or automobiles around Chennai.'),
    keys('Factors: raw material, power, water, labour, capital, transport, market, policy.', 'Weight-losing raw materials pull industry close to the source.', 'Clusters share workers and suppliers.'),
    remember('Hyderabad is often called the "bulk drug capital of India" for its pharmaceutical cluster.'),
  ], [
    ex('Why are sugar mills built close to sugarcane fields?', ['Cane is bulky and loses sugar soon after cutting.', 'Carrying it far is costly and wasteful.'], 'To process cane quickly and cheaply near the source'),
    ex('Why have so many software firms set up in Hyderabad?', ['Skilled graduates are available.', 'IT parks and good connectivity were built (HITEC City, airport).', 'Government support and clustering of firms.'], 'Skilled labour, infrastructure, policy and clustering'),
  ], [
    tapT('needs', 'Tap the things almost every factory needs.', [
      ['Raw materials', true], ['Power (electricity)', true], ['Workers', true], ['Transport', true], ['Capital (money)', true], ['A coastline', false], ['Snowfall', false],
    ], ['Think of inputs, workers and getting goods out.', 'Not every factory is on the coast.'], 'Raw materials, power, workers, transport and capital are general needs.'),
    mcq('loc', 'Heavy raw materials pull factories towards them.', [
      ['Iron and steel plants are usually close to…', 'iron ore and coal deposits', ['tea gardens', 'beaches', 'grasslands'], 'They use heavy raw materials.', 'Iron ore and coal are bulky, so steel plants are located near them.'],
      ['A cluster of related industries in one area is called…', 'agglomeration', ['dispersion', 'decentralisation', 'deforestation'], 'It means gathering together.', 'Firms cluster to share workers, suppliers and services.'],
      ['TS-iPASS is a Telangana scheme for…', 'quick single-window approvals for industries', ['planting trees', 'school admissions', 'river linking'], 'It speeds up permissions.', 'TS-iPASS gives time-bound approvals for setting up industries.'],
      ['Which factor matters most for a software company?', 'Skilled workers', ['Iron ore', 'Sugarcane', 'Coal'], 'It needs brains, not bulky inputs.', 'IT firms need skilled people and good connectivity.'],
    ]),
    matchT('needs-m', 'industry with its key locational factor', [
      ['Sugar mill', 'Near sugarcane fields'], ['Steel plant', 'Near iron ore and coal'], ['Software park', 'Skilled graduates'], ['Cement factory', 'Near limestone'], ['Fish processing', 'Near the coast'],
    ], ['Each industry follows its most important input.', 'Cement needs limestone.']),
  ]),
  O('ts9.ss.ind.kinds', 'Agro-based, mineral-based, automobile and IT industries', [
    h('Classifying industries'),
    def('Agro-based industries', 'Use farm products as raw materials: cotton textiles, jute, sugar, edible oil, food processing.'),
    def('Mineral-based industries', 'Use minerals: iron and steel, aluminium, cement, chemicals.'),
    p('The first successful modern cotton mill in India opened in Bombay (Mumbai) in 1854. Tata Iron and Steel Company began at Jamshedpur in 1907. Today Chennai, Pune and the Gurugram–Manesar area are big automobile hubs, while Bengaluru, Hyderabad, Pune and Chennai lead in IT. Telangana has cement plants around Nalgonda–Suryapet (limestone), and coal from Singareni powers thermal plants.'),
    def('Information Technology (IT) industry', 'Develops software and digital services; it needs skilled people, internet links and reliable power rather than heavy raw materials.'),
    keys('Agro-based: cotton, jute, sugar, food processing.', 'Mineral-based: steel, aluminium, cement.', 'IT and electronics depend on skills and connectivity.'),
    remember('1854: first cotton mill in Bombay. 1907: TISCO, Jamshedpur.'),
  ], [
    ex('Classify a cement factory near Suryapet.', ['Cement is made from limestone, a mineral.'], 'Mineral-based industry'),
    ex('Classify a rice mill in Miryalaguda.', ['It processes paddy, a farm product.'], 'Agro-based industry'),
  ], [
    tp('classify', (r) => {
      const bank: [string, string][] = [['Cotton textile mill', 'Agro-based'], ['Sugar mill', 'Agro-based'], ['Jute mill', 'Agro-based'], ['Rice mill', 'Agro-based'], ['Edible oil mill', 'Agro-based'], ['Iron and steel plant', 'Mineral-based'], ['Cement factory', 'Mineral-based'], ['Aluminium smelter', 'Mineral-based'], ['Software company', 'Knowledge/IT-based'], ['Mobile app developer', 'Knowledge/IT-based']];
      const [ind, c] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Classify the industry: ${ind}.`, ...choose(r, c, ['Agro-based', 'Mineral-based', 'Knowledge/IT-based'].filter((x) => x !== c)),
        hints: ['Ask: what is its main raw material?', 'Farm product → agro; mineral → mineral-based; skills and data → IT.'],
        mistakes: [{ when: 'wrong', explain: `A ${ind.toLowerCase()} is ${c}. Look at its main input.` }],
        solution: [`${ind} → ${c}.`],
      };
    }),
    matchT('hubs', 'industry with a major centre', [
      ['Automobiles', 'Chennai'], ['Iron and steel (TISCO)', 'Jamshedpur'], ['Pharmaceuticals', 'Hyderabad'], ['Jute', 'Kolkata region (Hooghly)'], ['First cotton mill (1854)', 'Mumbai'],
    ], ['Chennai is sometimes called the "Detroit of Asia".', 'Jute grows in the Ganga–Brahmaputra delta.']),
    orderT('ind-dates', 'Order these industrial milestones by date.', ['First cotton mill in Bombay (1854)', 'TISCO starts at Jamshedpur (1907)', 'Industrial Policy Resolution (1956)', 'New Industrial Policy (1991)', 'HITEC City opens in Hyderabad (1998)'], ['Cotton mills came before steel.', 'Liberalisation came in 1991.'], '1854 → 1907 → 1956 → 1991 → 1998.'),
  ]),
  O('ts9.ss.ind.policy', 'Government, industrial policy and the impact of industrialisation', [
    h('The role of government'),
    stepsB('1951 onwards: Five-Year Plans; the state builds heavy industries — steel plants, BHEL, power projects.', '1956: Industrial Policy Resolution — key industries reserved for the public sector; private firms need licences.', '1991: New Industrial Policy — liberalisation (most licences removed), privatisation (more room for private firms) and globalisation (foreign investment and trade welcomed): "LPG reforms".'),
    p('After 1991, industry and services grew faster, but some small firms struggled against competition, and many jobs became informal or contractual.'),
    h('Impact of industrialisation'),
    p('Industries create jobs, goods and taxes and drive urbanisation. But they can also pollute air (smoke), water (effluents), land (solid waste) and create noise and heat. The 1984 Bhopal gas tragedy, when poisonous gas leaked from a pesticide factory, showed how deadly industrial accidents can be.'),
    keys('1956 policy: public sector leads.', '1991 New Industrial Policy: Liberalisation, Privatisation, Globalisation.', 'Benefits: jobs, goods, growth. Costs: pollution, displacement, accidents.'),
    remember('LPG = Liberalisation, Privatisation, Globalisation (1991). Bhopal gas tragedy: December 1984.'),
  ], [
    ex('Which part of LPG lets a foreign car company build a factory in India?', ['Allowing foreign investment and trade connects India to world markets.'], 'Globalisation'),
    ex('Give one benefit and one cost of a new chemical factory near a village.', ['Benefit: jobs and income for local people.', 'Cost: possible water and air pollution if waste is not treated.'], 'Jobs vs pollution — it needs regulation.'),
  ], [
    matchT('lpg', 'reform with its meaning', [
      ['Liberalisation', 'Removing licences and controls on business'], ['Privatisation', 'Bigger role for private firms; selling some public-sector shares'], ['Globalisation', 'Opening the economy to foreign trade and investment'], ['Public sector', 'Industries owned by the government'],
    ], ['Liberal = free from controls.', 'Global = world.']),
    mcq('pol', 'Remember 1956 (public sector) and 1991 (LPG).', [
      ['The New Industrial Policy that removed most licences was introduced in…', '1991', ['1947', '1956', '2014'], 'It is linked to LPG reforms.', 'The 1991 policy liberalised industry.'],
      ['BHEL is an example of…', 'a public-sector enterprise', ['a cottage industry', 'a foreign company', 'an agro-based industry'], 'It is owned by the Government of India.', 'BHEL is a central public-sector company.'],
      ['The Bhopal gas tragedy (1984) was caused by…', 'a poisonous gas leak from a pesticide factory', ['an earthquake', 'a flood', 'a forest fire'], 'An industrial accident.', 'Toxic gas leaked from a factory, killing thousands.'],
      ['Which is a harmful effect of industrialisation?', 'Air and water pollution', ['More employment', 'More goods', 'More tax revenue'], 'Look for a cost, not a benefit.', 'Smoke and effluents pollute air and water.'],
    ]),
    tapT('impact', 'Tap the NEGATIVE impacts of unplanned industrialisation.', [
      ['Untreated effluents in rivers', true], ['Smoke and smog in cities', true], ['Industrial accidents', true], ['Slums due to unplanned migration', true], ['New jobs for youth', false], ['Cheaper manufactured goods', false],
    ], ['Negative = harm.', 'Jobs and goods are benefits.'], 'Pollution, accidents and slums are costs of unplanned industrial growth.'),
  ]),
]);

// =====================================================================================
// Chapter 8 — Service Activities in India
// =====================================================================================
const ch8 = U(8, 'Service Activities in India', [
  O('ts9.ss.serv.what', 'What service activities are and why they matter', [
    h('Not goods, but services'),
    photo('🧑‍⚕️', 'Doctors, teachers, bus drivers, bankers and software engineers all provide services, not physical goods.'),
    def('Service (tertiary) sector', 'Activities that do not produce goods directly but support people and the other sectors — transport, trade, banking, insurance, health, education, communication, IT, tourism, government administration.'),
    p('Economists divide activities into three sectors: primary (taking from nature — farming, fishing, mining), secondary (making goods — factories, construction) and tertiary (services). As countries develop, the service sector usually grows.'),
    vis({ kind: 'bar-graph', labels: ['Primary', 'Secondary', 'Tertiary (services)'], values: [18, 28, 54], unit: '% of India\'s output (about, recent years)' }, 'Approximate share of each sector in India\'s total output: services are now more than half.'),
    p('Services earn more than half of India\'s output, but employ a smaller share of workers than agriculture. Technology — computers, internet, mobile phones — has made many services exportable: Indian software and IT-enabled services are sold all over the world.'),
    keys('Three sectors: primary, secondary, tertiary.', 'Services ≈ more than half of India\'s output.', 'IT and software are major service exports.'),
    remember('Tertiary = services. A farmer is primary, a weaver in a mill is secondary, a teacher is tertiary.'),
  ], [
    ex('Classify: a truck driver carrying tomatoes from Medak to Hyderabad.', ['The driver produces no goods.', 'Transport is a service.'], 'Tertiary (service) sector'),
    ex('Why do services make up a bigger share of output than of jobs?', ['Many service jobs (IT, banking) have high output per worker.', 'Agriculture still employs a large share of workers but with low output per worker.'], 'Service workers produce more value per person on average.'),
  ], [
    tp('sector', (r) => {
      const bank: [string, string][] = [['A farmer growing cotton', 'Primary'], ['A fisherman in the Godavari', 'Primary'], ['A coal miner at Singareni', 'Primary'], ['A worker in a cement factory', 'Secondary'], ['A mason building a house', 'Secondary'], ['A weaver in a textile mill', 'Secondary'], ['A school teacher', 'Tertiary'], ['A bank cashier', 'Tertiary'], ['A bus conductor', 'Tertiary'], ['A software engineer', 'Tertiary'], ['A nurse', 'Tertiary']];
      const [job, s] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Which sector does this belong to? ${job}.`, ...choose(r, s, ['Primary', 'Secondary', 'Tertiary'].filter((x) => x !== s)),
        hints: ['Primary takes from nature; secondary makes goods; tertiary provides services.', 'Ask: is something grown/extracted, manufactured, or is a service given?'],
        mistakes: [{ when: 'wrong', explain: `${job} is ${s}. Check what the person actually produces.` }],
        solution: [`${job} → ${s} sector.`],
      };
    }),
    mcq('imp', 'Services support everyone else.', [
      ['Which is NOT a service activity?', 'Manufacturing cement', ['Banking', 'Teaching', 'Transport'], 'Which one makes a physical good?', 'Making cement is secondary (manufacturing).'],
      ['In India today, the service sector produces about…', 'more than half of total output', ['less than 10% of output', 'exactly a quarter of output', 'nothing that can be exported'], 'It is the largest sector by output.', 'Services contribute over half of India\'s output.'],
      ['Which technology made software exports possible?', 'Computers and the internet', ['Steam engines', 'Bullock carts', 'Hand looms'], 'Software travels over networks.', 'Fast internet lets services be delivered across the world.'],
      ['Why does a farmer also need the service sector?', 'To transport, store, finance and sell the crop', ['To grow the seeds', 'To make rain', 'To build soil'], 'Think of trucks, banks and markets.', 'Transport, cold storage, credit and trade are services.'],
    ]),
    matchT('sec', 'sector with its example', [
      ['Primary', 'Mining coal'], ['Secondary', 'Making cars'], ['Tertiary', 'Running a hospital'], ['Quaternary (knowledge)', 'Research and data analysis'],
    ], ['Primary = nature.', 'Tertiary = services like health.']),
  ]),
  O('ts9.ss.serv.outsourcing', 'Outsourcing, IT exports and low-income service work', [
    h('Two faces of the service sector'),
    def('Outsourcing', 'When a company gets some of its work done by another firm, often in another country — for example, a US bank\'s customer support or accounts handled from Hyderabad or Bengaluru.'),
    p('India gained from outsourcing because it has many English-speaking graduates, lower costs and a time difference that allows round-the-clock work. This created well-paid jobs in IT and business process outsourcing (BPO).'),
    p('But most service workers in India are not software engineers. Street vendors, domestic workers, security guards, delivery riders, auto drivers and small shopkeepers do low-income service work, often without job security, pension or health insurance. This is called informal (unorganised) employment.'),
    keys('Outsourcing brought IT and BPO jobs to Indian cities.', 'Many service jobs are informal and low paid.', 'Both kinds of service work are counted in the tertiary sector.'),
    remember('Formal (organised) jobs: regular salary, written contract, benefits. Informal (unorganised): no fixed contract or social security.'),
  ], [
    ex('Why can a London company outsource customer calls to Hyderabad?', ['Phone and internet connections are fast and cheap.', 'Skilled English-speaking workers are available.', 'Costs are lower.'], 'Technology + skilled workers + lower cost'),
    ex('A food-delivery rider earns per order with no fixed salary or insurance. Formal or informal?', ['No contract-based fixed salary.', 'No social security benefits.'], 'Informal'),
  ], [
    tapT('informal', 'Tap the jobs that are usually INFORMAL (unorganised) service work.', [
      ['Street vegetable vendor', true], ['Domestic worker', true], ['Auto-rickshaw driver (self-employed)', true], ['Daily-wage loader at a market', true], ['Permanent government school teacher', false], ['Salaried bank officer', false],
    ], ['Informal = no written contract or benefits.', 'Government and bank jobs usually have contracts and pensions.'], 'Vendors, domestic workers, self-employed drivers and daily-wage loaders are usually informal.'),
    mcq('out', 'Outsourcing = sending work to another firm.', [
      ['A US company having its accounts prepared by a firm in Hyderabad is an example of…', 'outsourcing', ['import of goods', 'subsistence farming', 'privatisation'], 'Work is sent out to another company.', 'Getting work done by an outside firm is outsourcing.'],
      ['Which helped India most in winning outsourcing work?', 'English-speaking skilled graduates at lower cost', ['Large coal reserves', 'Cold climate', 'Many rivers'], 'Services need people and communication.', 'Skills, language and lower costs attracted outsourced work.'],
      ['Which is a feature of informal employment?', 'No job security or social security', ['Pension after retirement', 'Paid holidays guaranteed', 'Written contract'], 'Think of a daily-wage worker.', 'Informal workers usually lack contracts, pensions and insurance.'],
      ['BPO stands for…', 'Business Process Outsourcing', ['Basic Production Output', 'Bank Payment Order', 'Business Price Office'], 'It is about processes like billing and customer care.', 'BPO firms handle business processes for other companies.'],
    ]),
    matchT('terms', 'term with its meaning', [
      ['Outsourcing', 'Getting work done by an outside firm'], ['Formal job', 'Written contract with benefits'], ['Informal job', 'No contract or social security'], ['IT exports', 'Software and digital services sold abroad'],
    ], ['Formal = written rules.', 'Exports are sold abroad.']),
  ]),
  O('ts9.ss.serv.cases', 'Case studies: FDI in retail and skills in the health sector', [
    h('Two debates'),
    def('Foreign Direct Investment (FDI)', 'Money invested by a foreign company to set up or buy a business in another country.'),
    p('Retail means selling goods to final buyers — from the kirana shop to a big supermarket. India allows foreign investment in single-brand retail fully and in multi-brand retail only partly and with conditions, while e-commerce rules keep changing. Supporters say big retailers bring investment, cold chains and lower prices and help farmers sell directly. Critics worry that millions of small shopkeepers and traders may lose business. Good policy tries to balance both.'),
    p('In health, India needs many more trained nurses, paramedics, lab technicians and doctors, especially in villages. Skill training creates jobs and better care. Trained Indian nurses and doctors also work abroad — earning income but sometimes leaving local shortages.'),
    keys('FDI = foreign company investing directly in a business.', 'Retail FDI: possible benefits (investment, supply chains) and risks (small traders).', 'Health services need more skilled workers, especially in rural areas.'),
    remember('Retail = selling to final consumers; wholesale = selling in bulk to shopkeepers.'),
  ], [
    ex('Give one argument for and one against large foreign supermarkets in India.', ['For: investment, cold storage, possibly lower prices and better prices for farmers.', 'Against: small kirana shops and traders may lose customers.'], 'Benefits to buyers and farmers vs risk to small traders'),
    ex('Why is training more rural nurses important?', ['Many villages have too few health workers.', 'Trained nurses provide care close to home and create jobs.'], 'Better rural health care and employment'),
  ], [
    mcq('fdi', 'FDI = foreign money into business; retail = selling to final buyers.', [
      ['A foreign company opening its own stores in India is an example of…', 'foreign direct investment', ['outsourcing', 'subsistence farming', 'a tax'], 'Investment from abroad into a business here.', 'Setting up a business directly is FDI.'],
      ['Retail trade means selling goods…', 'to final consumers', ['only to other countries', 'only to factories', 'only to the government'], 'Think of a kirana shop.', 'Retailers sell to the people who use the goods.'],
      ['A main worry about large retail chains is that…', 'small shopkeepers may lose business', ['farmers will stop farming completely', 'prices will always be higher', 'there will be no goods'], 'Who competes with big stores?', 'Small traders may find it hard to compete.'],
      ['Which health worker shortage is serious in Indian villages?', 'Nurses and paramedics', ['Software engineers', 'Pilots', 'Bankers'], 'Think of primary health centres.', 'Rural health centres need many more trained nurses and paramedics.'],
    ]),
    tapT('for', 'Tap the arguments IN FAVOUR of FDI in retail.', [
      ['Brings investment in cold storage', true], ['May give farmers better prices by buying directly', true], ['Creates jobs in organised retail', true], ['Small kirana shops may close', false], ['Profits may go abroad', false],
    ], ['"In favour" means benefits.', 'Closing shops is a concern, not a benefit.'], 'Investment, better farm prices and organised jobs are arguments for.'),
    matchT('hl', 'health worker with their main role', [
      ['Nurse', 'Patient care and medicines on the ward'], ['Lab technician', 'Testing blood and samples'], ['Pharmacist', 'Dispensing medicines correctly'], ['ASHA worker', 'Village health volunteer linking families to services'],
    ], ['ASHA workers work in villages.', 'Lab technicians test samples.']),
  ]),
]);

// =====================================================================================
// Chapter 9 — Credit in the Financial System
// =====================================================================================
const ch9 = U(9, 'Credit in the Financial System', [
  O('ts9.ss.credit.banks', 'Bank deposits, loans and interest', [
    h('How a bank works'),
    photo('🪙', 'A bank collects the savings of many people and lends them to those who need money.'),
    p('People deposit spare money in banks to keep it safe and earn interest. Banks keep only a small part as cash reserve, because on any day only a few depositors withdraw money. The rest is lent to farmers, traders, students and businesses.'),
    def('Deposit', 'Money placed in a bank account. Savings accounts can be withdrawn on demand; fixed deposits are kept for a fixed period at a higher interest rate.'),
    def('Loan (credit)', 'Money borrowed with an agreement to repay it, with interest, by a certain date.'),
    def('Interest', 'The extra amount paid for using someone else\'s money. Banks charge a higher rate on loans than they pay on deposits; the difference is their main income.'),
    f('Simple interest = P × R × T ÷ 100', 'principal times rate times time over one hundred'),
    xp({
      title: 'What if? Change the loan, rate or time', formula: 'I = P × R × T ÷ 100',
      res: ['I', 'Simple interest', '₹', 'P * R * T / 100', 0],
      vars: [['P', 'Principal (amount borrowed)', '₹', 1000, 100000, 1000, 20000], ['R', 'Rate of interest per year', '%', 1, 36, 1, 10], ['T', 'Time', 'years', 1, 5, 1, 2]],
      notes: [['R', 'A higher rate means paying more for the same loan — informal moneylenders often charge very high rates.', 'A lower rate makes borrowing cheaper.'], ['T', 'Borrowing for longer means more interest.', 'Repaying sooner saves interest.']],
      mistakes: [['Forgetting to divide by 100', 'The rate is a percentage: 10% means 10 out of every 100.'], ['Using a monthly rate as yearly', '3% per month is 36% per year!']],
      real: 'A ₹20,000 loan at 10% for 2 years costs ₹4,000 interest; at 36% (a typical moneylender rate) it costs ₹14,400.',
    }),
    keys('Banks lend deposits to borrowers.', 'Loan rate > deposit rate; the gap is the bank\'s income.', 'SI = P × R × T ÷ 100.'),
    remember('A bank is a middleman between savers (depositors) and borrowers.'),
  ], [
    ex('Kavya borrows ₹10,000 from a bank at 9% simple interest for 2 years. How much interest does she pay?', ['I = P × R × T ÷ 100', '= 10,000 × 9 × 2 ÷ 100', '= ₹1,800'], '₹1,800'),
    ex('A bank pays 6% on deposits and charges 11% on loans. What is its margin per ₹100 lent for a year?', ['Earns ₹11 from the borrower.', 'Pays ₹6 to the depositor.', '11 − 6 = 5'], '₹5 per ₹100 per year'),
  ], [
    tp('si', (r) => {
      const P = r.pick([5000, 10000, 20000, 25000, 40000, 50000]);
      const R = r.pick([6, 8, 9, 10, 12, 24]);
      const T = r.pick([1, 2, 3]);
      const I = (P * R * T) / 100;
      return numQ(`${who(r)} borrows ${inr(P)} at ${R}% simple interest per year for ${T} year${T > 1 ? 's' : ''}. How much interest (in ₹) is paid?`, I,
        ['Simple interest = P × R × T ÷ 100.', `Multiply ${P} × ${R} × ${T}, then divide by 100.`],
        [`I = ${P} × ${R} × ${T} ÷ 100`, `I = ${inr(I)}`], [{ when: String(P + I), explain: 'That is the total amount to repay (principal + interest). The question asks only for the interest.' }], 0.001, '₹');
    }, 2),
    mcq('bank', 'A bank is a middleman between savers and borrowers.', [
      ['Why do banks keep only a small part of deposits as cash?', 'Only a few depositors withdraw money on any one day', ['Cash is illegal', 'They give all money to the government', 'Depositors never withdraw'], 'Think about how many people visit the bank each day.', 'Because withdrawals are small on a given day, banks lend most deposits.'],
      ['The main source of income for banks is…', 'the difference between interest on loans and on deposits', ['selling gold', 'printing money', 'collecting taxes'], 'They charge more than they pay.', 'Banks charge a higher rate on loans than they pay depositors.'],
      ['Which deposit usually pays a higher interest rate?', 'Fixed deposit', ['Savings account', 'Cash in a locker', 'Current account'], 'Money locked in for a fixed time.', 'Fixed deposits pay more because money stays for a set period.'],
      ['Who prints currency notes and regulates banks in India?', 'Reserve Bank of India', ['State Bank of India', 'Ministry of Agriculture', 'Gram panchayat'], 'It is India\'s central bank.', 'The RBI issues currency and supervises banks.'],
    ]),
    orderT('flow', 'Put the steps of bank lending in order.', ['Savers deposit money in the bank', 'The bank keeps a small cash reserve', 'The bank lends the rest to borrowers', 'Borrowers repay the loan with interest', 'The bank pays interest to depositors'], ['Money must come in before it can go out.', 'Interest is paid after it is earned.'], 'Deposits → reserve → loans → repayment → interest to savers.', 4),
  ]),
  O('ts9.ss.credit.sources', 'Why people need credit: terms, collateral, formal and informal sources', [
    h('Borrowing to produce, borrowing to survive'),
    p('A cotton farmer near Adilabad needs money in June for seeds, fertiliser and labour, but gets paid only after harvest in November. A small trader needs money to buy stock before festival sales. Credit fills this gap. If the crop succeeds, credit helps; if it fails, the farmer may fall into a debt trap.'),
    def('Terms of credit', 'The conditions of a loan: interest rate, collateral, documents needed and the mode and period of repayment.'),
    def('Collateral', 'An asset the borrower owns (land, house, gold, vehicle) that is pledged to the lender as a guarantee. If the loan is not repaid, the lender can sell it.'),
    def('Formal sources', 'Banks and co-operative societies, regulated by the Reserve Bank of India — lower interest, need documents and often collateral.'),
    def('Informal sources', 'Moneylenders, traders, landlords, relatives and friends — easy to get but often at very high interest, with no rules to protect the borrower.'),
    keys('Credit = loan; it can help or trap.', 'Terms: interest, collateral, documents, repayment.', 'Formal = cheaper and regulated; informal = costly and unregulated.'),
    remember('Poorer households depend more on informal credit because they lack collateral and documents.'),
  ], [
    ex('Why does a landless labourer find it hard to get a bank loan?', ['Banks usually ask for collateral and documents.', 'The labourer has no land or property to pledge.'], 'No collateral'),
    ex('Compare: ₹10,000 for 1 year from a bank at 9% vs a moneylender at 3% per month.', ['Bank: 10,000 × 9 × 1 ÷ 100 = ₹900', 'Moneylender: 3% per month = 36% per year → ₹3,600', 'Difference = ₹2,700'], 'The moneylender costs ₹2,700 more.'),
  ], [
    tp('compare', (r) => {
      const P = r.pick([5000, 10000, 20000]);
      const m = r.pick([2, 3, 4, 5]);
      const b = r.pick([8, 9, 10, 12]);
      const diff = (P * (12 * m - b)) / 100;
      return numQ(`A loan of ${inr(P)} for one year: a bank charges ${b}% per year; a moneylender charges ${m}% per MONTH. How much more interest (₹) does the moneylender take?`, diff,
        ['Convert the monthly rate to a yearly rate: multiply by 12.', `Moneylender = ${12 * m}% a year. Find both interests and subtract.`],
        [`Bank: ${P} × ${b} ÷ 100 = ${inr((P * b) / 100)}`, `Moneylender: ${P} × ${12 * m} ÷ 100 = ${inr((P * 12 * m) / 100)}`, `Difference = ${inr(diff)}`],
        [{ when: String((P * (m - b)) / 100), explain: 'The moneylender\'s rate is per MONTH. Multiply by 12 before comparing.' }], 0.001, '₹');
    }, 3),
    tapT('formal', 'Tap the FORMAL sources of credit.', [
      ['A commercial bank', true], ['A co-operative bank', true], ['A regional rural bank', true], ['A village moneylender', false], ['A shopkeeper giving goods on credit', false], ['A landlord', false],
    ], ['Formal sources are registered and regulated by the RBI.', 'Moneylenders, traders and landlords are informal.'], 'Banks and co-operatives are formal; moneylenders, traders and landlords are informal.'),
    mcq('terms', 'Collateral is something you pledge.', [
      ['Which of these can be used as collateral?', 'A house or land', ['A friend\'s promise', 'A school certificate', 'A ration card only'], 'It must be an asset the lender can sell.', 'Property such as land or a house is common collateral.'],
      ['A debt trap happens when…', 'a borrower cannot repay and must borrow again to repay old loans', ['a bank gives no loans', 'interest rates are zero', 'a farmer has a bumper harvest'], 'Think of a crop failure.', 'Failure to repay forces new borrowing, and debt keeps growing.'],
      ['Which is NOT a term of credit?', 'The borrower\'s favourite colour', ['Interest rate', 'Collateral', 'Repayment period'], 'Terms are loan conditions.', 'Interest, collateral, documents and repayment are the terms.'],
      ['Why do informal lenders often charge more?', 'They are not regulated and borrowers have few alternatives', ['The RBI tells them to', 'They pay higher taxes', 'They have no risk'], 'Who controls their rates?', 'Without regulation, lenders can charge very high interest.'],
    ]),
  ]),
  O('ts9.ss.credit.shg', 'Self Help Groups and financial literacy', [
    h('Small savings, big strength'),
    photo('👩', 'Women\'s Self Help Groups in Telangana villages save together, lend to members and run small enterprises.'),
    def('Self Help Group (SHG)', 'A group of about 10–20 people, usually women from the same area, who save regularly, lend from the pooled savings to members, and can get bank loans as a group without collateral.'),
    stepsB('Members meet regularly and save a small fixed amount (say ₹100 a month).', 'Savings are pooled; members borrow from the group at a reasonable interest rate.', 'After the group shows regular saving and repayment for some months, a bank lends to the group.', 'Members use loans for buffaloes, tailoring, small shops, or to free themselves from moneylenders.', 'The group decides together and members are responsible for each other\'s repayment.'),
    def('Financial literacy', 'The knowledge to manage money well: budgeting, saving, comparing interest rates, using banks and digital payments safely, and avoiding fraud.'),
    p('Safe habits: never share your OTP, PIN or password; check interest rates before borrowing; save before spending; keep a record of income and expenses. Jan Dhan accounts (from 2014) brought crores of people into the banking system.'),
    keys('SHG: save together, lend to members, get bank loans as a group.', 'SHGs reduce dependence on moneylenders and empower women.', 'Never share OTP or PIN.'),
    remember('Group responsibility replaces collateral in SHG lending.'),
  ], [
    ex('An SHG has 15 members; each saves ₹200 a month. How much do they save in 6 months?', ['Per month: 15 × 200 = ₹3,000', '6 months: 3,000 × 6 = ₹18,000'], '₹18,000'),
    ex('Someone calls claiming to be from your bank and asks for your OTP. What should you do?', ['Banks never ask for an OTP or PIN on a call.', 'Refuse, hang up and report to the bank.'], 'Never share it; report the call.'),
  ], [
    tp('shg-save', (r) => {
      const n = r.pick([10, 12, 15, 18, 20]);
      const s = r.pick([50, 100, 150, 200, 250]);
      const m = r.pick([6, 10, 12]);
      return numQ(`A Self Help Group in ${r.pick(TOWNS)} district has ${n} members. Each saves ${inr(s)} every month. What are the group's total savings after ${m} months (₹)?`, n * s * m,
        ['First find the saving for one month for the whole group.', `${n} × ${s}, then multiply by ${m}.`],
        [`One month: ${n} × ${s} = ${inr(n * s)}`, `${m} months: ${inr(n * s)} × ${m} = ${inr(n * s * m)}`], [{ when: String(n * s), explain: 'That is only one month. Multiply by the number of months.' }], 0.001, '₹');
    }),
    mcq('shg', 'SHG = save together, borrow together.', [
      ['How do SHGs get bank loans without collateral?', 'The group takes joint responsibility for repayment', ['They pledge government land', 'Banks never lend to them', 'They pay no interest'], 'Group pressure and trust.', 'Collective responsibility acts as a guarantee.'],
      ['A typical SHG has about…', '10–20 members', ['2 members', '500 members', 'only one member'], 'Small enough to meet regularly.', 'SHGs are small groups of around 10–20 people.'],
      ['Which is a safe financial habit?', 'Never sharing your OTP or PIN', ['Telling your PIN to a caller from the "bank"', 'Borrowing without checking the rate', 'Spending before saving'], 'Think about fraud.', 'Your OTP and PIN must stay secret.'],
      ['One major benefit of SHGs for rural women is…', 'less dependence on moneylenders and more say in decisions', ['no need to save', 'free money from the government', 'higher interest to moneylenders'], 'They become organised borrowers.', 'SHGs give access to cheaper credit and build confidence.'],
    ]),
    orderT('shg-steps', 'Put the steps in the life of an SHG in order.', ['Women form a group and meet regularly', 'Members save a fixed amount each month', 'Members borrow from the pooled savings', 'After regular saving, the bank gives the group a loan', 'Members use loans for small businesses and repay'], ['Saving comes before lending.', 'Bank loans come after the group proves itself.'], 'Form → save → internal lending → bank loan → enterprise and repayment.'),
  ]),
]);

// =====================================================================================
// Chapter 10 — Prices and Cost of Living
// =====================================================================================
const ch10 = U(10, 'Prices and Cost of Living', [
  O('ts9.ss.price.budget', 'The family budget and how price changes affect it', [
    h('Where does the money go?'),
    photo('🛒', 'A weekly shopping basket: rice, dal, oil, vegetables, milk, soap — the cost of living is the cost of such a basket plus rent, travel, school and health.'),
    def('Family budget', 'A plan of a family\'s expected income and spending for a month or a year.'),
    def('Cost of living', 'The money a family needs to maintain its usual standard of living — food, clothing, housing, fuel, transport, education and health.'),
    p('If prices rise but income stays the same, a family can buy less with the same money. Poorer families spend a large share of their income on food, so a rise in food prices hurts them most. Families respond by cutting other spending, borrowing, or working longer hours.'),
    f('Share of spending (%) = amount spent on an item ÷ total spending × 100', 'part over whole times one hundred'),
    keys('Budget = planned income and spending.', 'Rising prices reduce what the same money can buy.', 'Poorer families spend a bigger share on food.'),
    remember('Real income = what your money can actually buy.'),
  ], [
    ex('A family spends ₹6,000 of its ₹15,000 monthly budget on food. What percentage is that?', ['6,000 ÷ 15,000 × 100', '= 40%'], '40%'),
    ex('Rice was ₹40/kg and is now ₹50/kg. A family buys 20 kg a month. How much more does it spend?', ['Old: 20 × 40 = ₹800', 'New: 20 × 50 = ₹1,000', 'Extra = ₹200'], '₹200 more each month'),
  ], [
    tp('share', (r) => {
      const total = r.pick([10000, 12000, 15000, 20000, 25000]);
      const pct = r.pick([20, 25, 30, 40, 45, 50]);
      const food = (total * pct) / 100;
      return numQ(`${who(r)}'s family spends ${inr(food)} on food out of a total monthly spending of ${inr(total)}. What percentage is spent on food?`, pct,
        ['Share = part ÷ whole × 100.', `${food} ÷ ${total} × 100.`],
        [`${food} ÷ ${total} = ${pct / 100}`, `× 100 = ${pct}%`], [{ when: String(pct / 100), explain: 'Multiply by 100 to turn the fraction into a percentage.' }], 0.001, '%');
    }),
    tp('extra', (r) => {
      const item = r.pick([['rice', 'kg'], ['dal', 'kg'], ['milk', 'litre'], ['cooking oil', 'litre']] as const);
      const q = r.pick([5, 10, 15, 20, 30]);
      const old = r.pick([40, 50, 60, 100, 120]);
      const up = r.pick([5, 10, 15, 20]);
      return numQ(`The price of ${item[0]} rises from ₹${old} to ₹${old + up} per ${item[1]}. A family buys ${q} ${item[1] === 'kg' ? 'kg' : 'litres'} a month. How much more (₹) must it spend each month?`, q * up,
        ['Find the rise per unit first.', `Rise = ₹${up} per ${item[1]}; multiply by ${q}.`],
        [`Rise per ${item[1]} = ${old + up} − ${old} = ₹${up}`, `Extra = ${q} × ${up} = ${inr(q * up)}`], [{ when: String(q * (old + up)), explain: 'That is the new total bill. The question asks for the EXTRA amount.' }], 0.001, '₹');
    }),
    mcq('budget', 'Ask: what share of income goes on food?', [
      ['When prices rise and income stays the same, a family\'s real income…', 'falls', ['rises', 'stays the same', 'doubles'], 'Can it buy more or less?', 'The same money buys fewer goods, so real income falls.'],
      ['Which families are hit hardest by a rise in food prices?', 'Poorer families', ['Richer families', 'Families who grow no food and earn a lot', 'Nobody'], 'Who spends the largest share on food?', 'Poor families spend a larger share of income on food.'],
      ['A family budget lists…', 'expected income and spending', ['only the price of gold', 'the government\'s taxes', 'only savings'], 'It is a plan.', 'A budget plans income against spending.'],
      ['Which is part of the cost of living?', 'Rent, food, transport and school fees', ['Only luxury cars', 'Only taxes paid by companies', 'Only exports'], 'Everyday needs.', 'The cost of living includes all regular household needs.'],
    ]),
  ]),
  O('ts9.ss.price.cpi', 'Measuring inflation: price index numbers and the CPI', [
    h('One number for many prices'),
    def('Inflation', 'A general and sustained rise in the price level. Money loses purchasing power.'),
    def('Price index', 'A number that compares the cost of a fixed basket of goods with its cost in a base year, which is given the value 100.'),
    def('Consumer Price Index (CPI)', 'A price index based on the basket of goods and services bought by households. India\'s official CPI (Combined) uses 2012 as its base year.'),
    f('CPI = cost of basket in current year ÷ cost of basket in base year × 100', 'current cost over base cost times one hundred'),
    f('Inflation rate (%) = (new index − old index) ÷ old index × 100', 'change over old times one hundred'),
    stepsB('Choose a base year and a basket of goods families typically buy (with quantities).', 'Find the cost of the basket in the base year.', 'Find the cost of the SAME basket in the current year at current prices.', 'Divide current cost by base cost and multiply by 100.', 'Compare index numbers to get the rate of inflation.'),
    vis({ kind: 'line-graph', xLabel: 'Year (illustrative)', yLabel: 'Price index', points: [[0, 100], [1, 105], [2, 110], [3, 118], [4, 124], [5, 130]] }, 'An illustrative CPI rising from 100 in the base year to 130 after five years.'),
    xp({
      title: 'What if? Change the basket costs', formula: 'CPI = C₁ ÷ C₀ × 100',
      res: ['CPI', 'Consumer price index', '', 'C1 / C0 * 100', 1],
      vars: [['C0', 'Cost of basket in base year', '₹', 500, 5000, 50, 2000], ['C1', 'Cost of same basket now', '₹', 500, 8000, 50, 2500]],
      notes: [['C1', 'The basket now costs more: the index rises above 100, showing inflation.', 'The basket costs less now: index below 100 means prices fell (deflation).'], ['C0', 'A costlier base-year basket makes today\'s index smaller.', 'A cheaper base-year basket makes today\'s index larger.']],
      mistakes: [['Dividing base by current', 'Current cost goes on TOP; the base year is always the 100 reference.'], ['Changing the basket between years', 'The index compares the SAME basket, otherwise you measure buying habits, not prices.']],
      real: 'If CPI goes from 100 to 125, the same shopping that cost ₹2,000 now costs ₹2,500.',
    }),
    keys('Base year index = 100.', 'CPI tracks the cost of a household basket.', 'Inflation rate = % change in the index.'),
    remember('Wholesale Price Index (WPI) tracks wholesale prices; CPI tracks retail prices paid by consumers.'),
  ], [
    ex('A basket cost ₹2,000 in the base year and ₹2,600 now. Find the CPI.', ['CPI = 2,600 ÷ 2,000 × 100', '= 130'], 'CPI = 130'),
    ex('CPI rose from 120 to 126. Find the inflation rate.', ['Change = 126 − 120 = 6', '6 ÷ 120 × 100 = 5%'], '5%'),
  ], [
    tp('cpi', (r) => {
      const base = r.pick([1000, 2000, 2500, 4000, 5000]);
      const idx = r.pick([105, 110, 115, 120, 125, 130, 140, 150]);
      const cur = (base * idx) / 100;
      return numQ(`A family's basket of goods cost ${inr(base)} in the base year and costs ${inr(cur)} in the current year. What is the price index for the current year?`, idx,
        ['Index = current cost ÷ base cost × 100.', `${cur} ÷ ${base} × 100.`],
        [`${cur} ÷ ${base} = ${idx / 100}`, `× 100 = ${idx}`], [{ when: String(rd((base / cur) * 100, 2)), explain: 'Put the CURRENT cost on top — the base year must come out as 100.' }], 0.001);
    }, 2),
    tp('infl', (r) => {
      const old = r.pick([100, 120, 150, 160, 200, 250]);
      const rate = r.pick([2, 4, 5, 6, 8, 10]);
      const nw = rd(old * (1 + rate / 100), 2);
      return numQ(`The CPI was ${old} last year and is ${nw} this year. What is the rate of inflation (%)?`, rate,
        ['Inflation rate = (new − old) ÷ old × 100.', `Change = ${rd(nw - old, 2)}; divide by ${old}.`],
        [`Change = ${nw} − ${old} = ${rd(nw - old, 2)}`, `${rd(nw - old, 2)} ÷ ${old} × 100 = ${rate}%`], [{ when: String(rd(nw - old, 2)), explain: 'That is the change in index POINTS. Divide by the old index and multiply by 100 to get a percentage.' }], 0.001, '%');
    }, 3),
    orderT('cpi-steps', 'Put the steps of constructing a price index in order.', ['Choose a base year and a basket of goods', 'Find the basket\'s cost in the base year', 'Find the same basket\'s cost in the current year', 'Divide current cost by base cost and multiply by 100'], ['You need a basket before you can price it.', 'The division comes last.'], 'Basket → base-year cost → current cost → index.'),
  ]),
  O('ts9.ss.price.govt', 'The role of government in regulating prices', [
    h('Keeping essentials affordable'),
    p('Sharp price rises hurt the poor most, so governments try to keep prices of essentials stable.'),
    stepsB('Public Distribution System (PDS): ration shops supply rice, wheat and other items at low prices to eligible families (National Food Security Act, 2013).', 'Minimum Support Price (MSP) and government buying: protect farmers and build buffer stocks of grain.', 'Buffer stocks: release grain into the market when prices rise.', 'Essential Commodities Act (1955): action against hoarding and black-marketing.', 'Monetary policy: the Reserve Bank of India changes interest rates to control inflation.', 'Import or export changes: e.g. allowing imports of onions or pulses when local supply is short.'),
    def('Hoarding', 'Storing large quantities of goods to create scarcity and sell later at higher prices — illegal for essential commodities.'),
    keys('PDS ration shops supply essentials at subsidised prices.', 'Buffer stocks smooth out price swings.', 'RBI uses interest rates to fight inflation.'),
    remember('Food Corporation of India (FCI) buys and stores grain for the PDS and buffer stocks.'),
  ], [
    ex('Onion prices shoot up after floods destroy crops. Name two government actions.', ['Release stocks or allow imports to increase supply.', 'Act against hoarders under the Essential Commodities Act.'], 'Increase supply and stop hoarding'),
    ex('Why does the RBI raise interest rates when inflation is high?', ['Loans become costlier, so people and firms borrow and spend less.', 'Lower demand eases pressure on prices.'], 'To reduce spending and cool prices'),
  ], [
    mcq('gov', 'Government can raise supply, stop hoarding and cool demand.', [
      ['Ration shops are part of the…', 'Public Distribution System', ['Stock market', 'Goods and Services Tax', 'Census'], 'They sell essentials cheaply to eligible families.', 'Fair-price (ration) shops form the PDS.'],
      ['Storing goods to create scarcity and raise prices is called…', 'hoarding', ['rationing', 'saving', 'exporting'], 'It is illegal for essential goods.', 'Hoarding creates artificial shortages.'],
      ['Which institution uses interest rates to control inflation?', 'Reserve Bank of India', ['Election Commission', 'Gram panchayat', 'Food Corporation of India'], 'India\'s central bank.', 'The RBI\'s monetary policy targets inflation.'],
      ['Buffer stocks of grain are used to…', 'release grain when prices rise', ['export all grain', 'feed only animals', 'make fertiliser'], 'A "buffer" absorbs shocks.', 'Stocks are released to increase supply and calm prices.'],
    ]),
    matchT('tools', 'government measure with its purpose', [
      ['PDS ration shops', 'Cheap essentials for eligible families'], ['Minimum Support Price', 'Assured price for farmers\' crops'], ['Essential Commodities Act', 'Action against hoarding'], ['Higher RBI interest rates', 'Reduce demand to control inflation'], ['Allowing imports', 'Increase supply when local crops fail'],
    ], ['MSP helps farmers; PDS helps consumers.', 'The RBI works through interest rates.']),
    tapT('help', 'Tap the measures that help CONTROL rising prices.', [
      ['Releasing buffer stocks', true], ['Raids on hoarders', true], ['Allowing imports of a scarce item', true], ['RBI raising interest rates', true], ['Encouraging hoarding', false], ['Destroying stored grain', false],
    ], ['Prices fall when supply rises or demand cools.', 'Hoarding reduces supply.'], 'Releasing stocks, stopping hoarding, imports and tighter money all fight inflation.'),
  ]),
]);

// =====================================================================================
// Chapter 11 — The Government Budget and Taxation
// =====================================================================================
const ch11 = U(11, 'The Government Budget and Taxation', [
  O('ts9.ss.budget.role', 'Role of government, expenditure and subsidies', [
    h('What the government spends on'),
    photo('🏫', 'Government schools, hospitals, roads, police and pensions are all paid for from the government budget.'),
    p('Some things are needed by everyone but are hard to sell individually — national defence, police, courts, street lights, roads. Others are important for fairness — schools, hospitals, food security, pensions. The government provides these using money it collects, mainly taxes.'),
    def('Government budget', 'A yearly statement of the government\'s expected income (receipts) and spending (expenditure). The Union Budget is presented in Parliament, usually on 1 February, for the financial year April–March.'),
    def('Revenue expenditure', 'Spending on running services: salaries, pensions, interest payments, subsidies.'),
    def('Capital expenditure', 'Spending that creates assets: roads, dams, schools, hospitals, railway lines.'),
    def('Subsidy', 'Money the government pays so that people can buy something below its full cost — fertiliser, food grains, cooking gas, electricity for farms.'),
    keys('Budget = receipts + expenditure plan for a year.', 'Revenue spending runs services; capital spending builds assets.', 'Subsidies lower prices for users.'),
    remember('Financial year in India: 1 April to 31 March. Union Budget — usually 1 February.'),
  ], [
    ex('Classify: building a new flyover in Hyderabad.', ['It creates a long-lasting asset.'], 'Capital expenditure'),
    ex('Classify: paying salaries of government teachers.', ['It runs an existing service; no new asset is created.'], 'Revenue expenditure'),
  ], [
    tp('rev-cap', (r) => {
      const bank: [string, string][] = [['Building a new dam', 'Capital expenditure'], ['Constructing a hospital building', 'Capital expenditure'], ['Laying a new railway line', 'Capital expenditure'], ['Building school classrooms', 'Capital expenditure'], ['Paying teachers\' salaries', 'Revenue expenditure'], ['Paying pensions', 'Revenue expenditure'], ['Interest on government loans', 'Revenue expenditure'], ['Fertiliser subsidy', 'Revenue expenditure']];
      const [it, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Classify this government spending: ${it}.`, ...choose(r, a, [a === 'Capital expenditure' ? 'Revenue expenditure' : 'Capital expenditure']),
        hints: ['Does it create a long-lasting asset?', 'Assets → capital; running costs → revenue.'],
        mistakes: [{ when: 'wrong', explain: `${it} is ${a.toLowerCase()}. Ask whether a new asset is created.` }],
        solution: [`${it} → ${a}.`],
      };
    }),
    mcq('role', 'Think about what markets alone cannot provide well.', [
      ['Why does the government provide defence and police?', 'Everyone needs them but they cannot easily be sold to individuals', ['Private firms are banned from all business', 'They earn huge profits', 'They are not needed'], 'Can you buy "your share" of an army?', 'These are public goods that the government must provide.'],
      ['A subsidy on fertiliser means…', 'farmers pay less than the full cost', ['farmers pay a higher tax', 'fertiliser is banned', 'only big farmers can buy it'], 'The government pays part of the price.', 'The government covers part of the cost so the price is lower.'],
      ['The Union Budget is usually presented on…', '1 February', ['15 August', '26 January', '1 April'], 'Before the financial year begins.', 'Since 2017 the Union Budget has been presented on 1 February.'],
      ['India\'s financial year runs from…', '1 April to 31 March', ['1 January to 31 December', '1 June to 31 May', '15 August to 14 August'], 'It starts in April.', 'The financial year is April to March.'],
    ]),
    tapT('subs', 'Tap the items that are SUBSIDIES.', [
      ['Cheap rice through ration shops', true], ['Lower-priced fertiliser for farmers', true], ['Free or cheap electricity for farm pumps', true], ['Income tax', false], ['GST on a phone', false], ['Toll on a highway', false],
    ], ['Subsidies lower the price you pay.', 'Taxes and tolls are what people PAY.'], 'Cheap ration rice, fertiliser and farm power are subsidies; taxes and tolls are not.'),
  ]),
  O('ts9.ss.budget.taxes', 'Direct and indirect taxes; collection and evasion', [
    h('Where the money comes from'),
    def('Tax', 'A compulsory payment to the government. It is not a price for a particular service; it pays for public services in general.'),
    def('Direct tax', 'A tax paid directly to the government by the person on whom it is imposed — income tax, corporation tax on company profits.'),
    def('Indirect tax', 'A tax collected through the price of goods and services; the seller collects it and passes it on — GST, customs duty.'),
    p('Direct taxes are usually progressive: people with higher incomes pay a higher share. Indirect taxes are paid by everyone who buys the item, rich or poor, so they can weigh more heavily on the poor.'),
    def('Tax evasion', 'Illegally avoiding tax — hiding income, not giving bills, under-reporting sales. It reduces money for schools and hospitals and is a punishable offence.'),
    keys('Direct: income tax, corporation tax.', 'Indirect: GST, customs.', 'Always ask for a bill — it helps tax reach the government.'),
    remember('Progressive tax: higher income → higher rate.'),
  ], [
    ex('Is the GST on a school bag a direct or an indirect tax?', ['The shop collects it in the price and pays it to the government.', 'The buyer pays it indirectly.'], 'Indirect tax'),
    ex('Why does refusing a bill to "save money" hurt society?', ['The seller may not report the sale, so tax is evaded.', 'The government gets less money for public services.'], 'It enables tax evasion.'),
  ], [
    tp('dir-ind', (r) => {
      const bank: [string, string][] = [['Income tax', 'Direct tax'], ['Corporation tax on company profits', 'Direct tax'], ['Goods and Services Tax (GST)', 'Indirect tax'], ['Customs duty on imports', 'Indirect tax'], ['Tax included in the price of a mobile phone', 'Indirect tax'], ['Tax paid on one\'s own salary', 'Direct tax']];
      const [t, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Is this a direct or an indirect tax? ${t}.`, ...choose(r, a, [a === 'Direct tax' ? 'Indirect tax' : 'Direct tax']),
        hints: ['Direct = paid by the person it is imposed on.', 'Indirect = collected through the price of goods.'],
        mistakes: [{ when: 'wrong', explain: `${t} is a ${a.toLowerCase()}.` }],
        solution: [`${t} → ${a}.`],
      };
    }),
    mcq('tax', 'Taxes are compulsory; evasion is illegal.', [
      ['A progressive tax means…', 'higher incomes pay a higher rate', ['everyone pays the same amount', 'the poor pay more', 'only companies pay'], 'It rises with income.', 'Progressive taxes take a larger share from higher incomes.'],
      ['Which is an example of tax evasion?', 'Hiding income from the tax department', ['Paying GST on a purchase', 'Filing an income tax return', 'Asking for a bill'], 'It is illegal.', 'Concealing income to avoid tax is evasion.'],
      ['Why can indirect taxes burden the poor more?', 'Everyone pays the same tax on an item regardless of income', ['The poor pay no indirect tax', 'Only the rich buy goods', 'They are refunded to the rich'], 'Same tax, different incomes.', 'The same tax takes a bigger share of a small income.'],
      ['Taxes are mainly used to…', 'pay for public services like schools, roads and health', ['make the government a profit', 'pay shopkeepers', 'buy foreign goods only'], 'Think of the budget.', 'Tax money funds public services.'],
    ]),
    matchT('taxm', 'term with its meaning', [
      ['Direct tax', 'Paid by the person it is imposed on'], ['Indirect tax', 'Collected through the price of goods'], ['Tax evasion', 'Illegally avoiding tax'], ['Progressive tax', 'Higher income, higher rate'],
    ], ['Evasion is illegal.', 'Direct vs indirect depends on who pays the government.']),
  ]),
  O('ts9.ss.budget.gst', 'Goods and Services Tax (GST)', [
    h('One nation, one tax'),
    p('Before GST, goods faced many separate central and state taxes — excise, VAT, service tax, entry tax — with checkposts at state borders. On 1 July 2017, India replaced most of these with a single Goods and Services Tax.'),
    def('GST', 'A destination-based indirect tax on the supply of goods and services. Rates are fixed by the GST Council, which includes the Union Finance Minister and finance ministers of the states.'),
    def('CGST and SGST', 'For a sale within a state, GST is split equally between the Centre (Central GST) and the state (State GST). For sales between states, Integrated GST (IGST) is charged.'),
    f('GST amount = price before tax × GST rate ÷ 100', 'price times rate over one hundred'),
    xp({
      title: 'What if? Change the price or the rate', formula: 'G = P × r ÷ 100',
      res: ['G', 'GST amount', '₹', 'P * r / 100', 2],
      vars: [['P', 'Price before tax', '₹', 100, 50000, 100, 2000], ['r', 'GST rate (illustrative)', '%', 0, 40, 1, 18]],
      notes: [['r', 'A higher rate adds more tax to the same price.', 'Lower rates (or exemptions) are used for essential items.'], ['P', 'Costlier items carry more GST at the same rate.', 'Cheaper items carry less GST.']],
      mistakes: [['Adding the rate as rupees', '18% of ₹2,000 is ₹360, not ₹18.'], ['Splitting IGST into CGST + SGST', 'IGST is for sales between states; CGST + SGST are for sales within a state.']],
      real: 'Within Telangana, ₹360 GST on a ₹2,000 item at 18% is split ₹180 CGST + ₹180 SGST.',
    }),
    keys('GST from 1 July 2017.', 'Within a state: CGST + SGST (equal halves). Between states: IGST.', 'Rates are decided by the GST Council and are revised from time to time.'),
    remember('Rates used in the practice questions are for practice only; actual GST rates are revised by the GST Council.'),
  ], [
    ex('A shirt costs ₹1,000 before tax and GST is 5% (illustrative). What does the buyer pay?', ['GST = 1,000 × 5 ÷ 100 = ₹50', 'Total = 1,000 + 50 = ₹1,050'], '₹1,050'),
    ex('A ₹10,000 sale within Telangana at 18% GST (illustrative). Find CGST and SGST.', ['GST = 10,000 × 18 ÷ 100 = ₹1,800', 'Split equally: CGST ₹900, SGST ₹900'], 'CGST ₹900 + SGST ₹900'),
  ], [
    tp('gst', (r) => {
      const P = r.pick([500, 1000, 2000, 2500, 4000, 5000, 12000]);
      const rate = r.pick([5, 12, 18, 28]);
      const g = (P * rate) / 100;
      const total = r.next() < 0.5;
      const ans = total ? P + g : g;
      return numQ(`An item costs ${inr(P)} before tax. GST is charged at ${rate}% (illustrative rate). ${total ? 'What is the total price the buyer pays (₹)?' : 'How much GST (₹) is charged?'}`, ans,
        ['GST = price × rate ÷ 100.', total ? 'Then add the GST to the price.' : `${P} × ${rate} ÷ 100.`],
        [`GST = ${P} × ${rate} ÷ 100 = ${inr(g)}`, ...(total ? [`Total = ${P} + ${g} = ${inr(P + g)}`] : [])],
        [{ when: String(total ? g : P + g), explain: total ? 'That is only the tax. Add it to the price for the total.' : 'That is the total price. The question asks only for the tax.' }], 0.001, '₹');
    }, 2),
    tp('cgst', (r) => {
      const P = r.pick([1000, 2000, 4000, 5000, 10000]);
      const rate = r.pick([5, 12, 18, 28]);
      const half = (P * rate) / 200;
      return numQ(`A shop in ${r.pick(TOWNS)} sells goods worth ${inr(P)} to a buyer in the same state at ${rate}% GST (illustrative). How much is the State GST (SGST) part (₹)?`, half,
        ['Within a state, GST is split equally into CGST and SGST.', `Find ${rate}% of ${P}, then halve it.`],
        [`GST = ${P} × ${rate} ÷ 100 = ${inr(2 * half)}`, `SGST = half = ${inr(half)}`], [{ when: String(2 * half), explain: 'That is the whole GST. SGST is only half of it.' }], 0.001, '₹');
    }, 3),
    mcq('gstq', 'GST began on 1 July 2017.', [
      ['GST was introduced in India on…', '1 July 2017', ['1 April 1991', '26 January 1950', '1 February 2020'], 'It was launched at a midnight session of Parliament.', 'GST came into force on 1 July 2017.'],
      ['Who decides GST rates?', 'The GST Council', ['The Supreme Court', 'Each shopkeeper', 'The Election Commission'], 'It includes Union and state finance ministers.', 'The GST Council recommends rates and rules.'],
      ['For a sale from Telangana to Karnataka, which GST applies?', 'IGST', ['CGST + SGST', 'No tax', 'Only customs duty'], 'It is an inter-state sale.', 'Integrated GST applies to sales between states.'],
      ['GST is an example of…', 'an indirect tax', ['a direct tax', 'a subsidy', 'a loan'], 'It is collected through prices.', 'GST is collected by sellers through prices.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 12 — Democratic and Nationalist Revolutions
// =====================================================================================
const ch12 = U(12, 'Democratic and Nationalist Revolutions: 17th, 18th & 19th Centuries', [
  O('ts9.ss.rev.england', 'Changes that made the modern world; England\'s Civil War and Glorious Revolution', [
    h('New ideas shake old powers'),
    photo('📜', 'Printed books and pamphlets spread new ideas about rights and government faster than ever before.'),
    p('Between about 1450 and 1700, Europe changed fast. The printing press (Gutenberg, around 1450) made books cheap. The Renaissance revived learning and art; the Reformation (from 1517) challenged the Church\'s authority; scientists like Galileo and Newton showed that nature follows laws that can be tested. Trade and overseas voyages made merchants rich and confident. People began to ask: why should a king have unlimited power?'),
    def('Absolute monarchy', 'Rule by a king or queen whose power is not limited by any law or parliament ("divine right of kings").'),
    stepsB('1642–1651: English Civil War between supporters of King Charles I and Parliament.', '1649: Charles I is tried and executed; England becomes a republic (Commonwealth) led by Oliver Cromwell.', '1660: monarchy restored under Charles II.', '1688: Glorious Revolution — James II is replaced, without major bloodshed in England, by William and Mary.', '1689: Bill of Rights — the monarch cannot make laws, levy taxes or keep an army in peacetime without Parliament\'s consent.'),
    def('Constitutional monarchy', 'A system where the king or queen reigns but power is limited by law and exercised through an elected parliament — as in Britain after 1689.'),
    keys('Printing, Renaissance, Reformation and science changed ways of thinking.', '1649: Charles I executed. 1688: Glorious Revolution.', '1689 Bill of Rights made Parliament supreme.'),
    remember('1688 — Glorious Revolution; 1689 — Bill of Rights.'),
  ], [
    ex('Why is the 1688 revolution called "Glorious"?', ['Power passed from James II to William and Mary with little bloodshed in England.', 'It established that Parliament, not the king alone, holds supreme power.'], 'A largely bloodless change that made Parliament supreme'),
    ex('How did the printing press help political change?', ['Books and pamphlets became cheap.', 'Ideas about rights and government reached many more people.'], 'It spread new ideas widely and quickly.'),
  ], [
    orderT('eng', 'Order these events in English history by date.', ['English Civil War begins (1642)', 'Charles I executed (1649)', 'Monarchy restored (1660)', 'Glorious Revolution (1688)', 'Bill of Rights (1689)'], ['The Civil War came before the execution.', 'The Bill of Rights followed the Glorious Revolution.'], '1642 → 1649 → 1660 → 1688 → 1689.'),
    mcq('engq', 'Parliament vs the king.', [
      ['Which king was executed in 1649?', 'Charles I', ['James II', 'William III', 'Henry VIII'], 'He fought Parliament in the Civil War.', 'Charles I was tried and executed in 1649.'],
      ['Who led England as a republic after 1649?', 'Oliver Cromwell', ['Napoleon', 'Bismarck', 'George Washington'], 'He led the Parliament\'s army.', 'Cromwell led the Commonwealth.'],
      ['The Bill of Rights (1689) said the monarch could not…', 'levy taxes without Parliament\'s consent', ['wear a crown', 'live in London', 'have children'], 'It limited royal power over money.', 'Taxes and laws needed Parliament\'s consent.'],
      ['Who invented the movable-type printing press in Europe around 1450?', 'Johannes Gutenberg', ['Isaac Newton', 'Martin Luther', 'James Watt'], 'A German goldsmith.', 'Gutenberg\'s press made books cheap.'],
      ['The idea that kings get power directly from God is called…', 'divine right of kings', ['popular sovereignty', 'separation of powers', 'universal franchise'], 'Divine = from God.', 'Absolute monarchs claimed a divine right to rule.'],
    ]),
    matchT('ideas', 'change with what it did', [
      ['Printing press', 'Made books cheap and spread ideas'], ['Reformation', 'Challenged the authority of the Church'], ['Scientific Revolution', 'Explained nature through experiments'], ['Bill of Rights', 'Limited the power of the monarch'],
    ], ['Science = experiments.', 'Reformation began with Martin Luther in 1517.']),
  ]),
  O('ts9.ss.rev.america-france', 'American Independence, the French Revolution and Napoleon', [
    h('No taxation without representation'),
    p('Britain\'s thirteen colonies in North America paid taxes to a Parliament in which they had no members. "No taxation without representation" became their slogan.'),
    stepsB('1773: Boston Tea Party — colonists dump taxed British tea into the harbour.', '1775: war between the colonies and Britain begins.', '4 July 1776: Declaration of Independence — "all men are created equal" with rights to life, liberty and the pursuit of happiness.', '1783: Treaty of Paris — Britain recognises the United States.', '1787: US Constitution — an elected president, Congress and courts; George Washington becomes the first president (1789).'),
    h('Liberty, Equality, Fraternity'),
    p('In France, the clergy (First Estate) and nobles (Second Estate) paid few taxes, while the Third Estate — peasants, workers and the middle class — carried the burden. Thinkers such as Rousseau, Voltaire and Montesquieu argued for equality, reason and separation of powers.'),
    stepsB('May 1789: Estates-General meets; the Third Estate forms the National Assembly.', '14 July 1789: Storming of the Bastille prison in Paris.', 'August 1789: Declaration of the Rights of Man and of the Citizen.', '1792–93: France becomes a republic; King Louis XVI is executed (1793); Reign of Terror (1793–94).', '1799: Napoleon Bonaparte seizes power; 1804: crowns himself emperor and issues the Napoleonic Code (equality before law).', '1815: Napoleon defeated at Waterloo; Congress of Vienna restores old monarchies.'),
    keys('USA: 1776 Declaration, 1783 recognition, 1787 Constitution.', 'France: 1789 Bastille and Rights of Man; 1793 king executed; 1799–1815 Napoleon.', 'Ideas: liberty, equality, popular sovereignty.'),
    remember('14 July 1789 — Storming of the Bastille. 4 July 1776 — American Declaration of Independence.'),
  ], [
    ex('What did "No taxation without representation" mean?', ['The colonists paid taxes to Britain.', 'They had no elected members in the British Parliament.', 'They argued that only their own representatives could tax them.'], 'Taxes need the consent of elected representatives.'),
    ex('Napoleon ended the republic and became emperor. Why do historians still say he spread revolutionary ideas?', ['His Napoleonic Code gave equality before law and abolished feudal privileges.', 'His armies carried these laws to many conquered lands.'], 'Through the Napoleonic Code and legal reforms'),
  ], [
    orderT('rev-dates', 'Order these revolutionary events by date.', ['Boston Tea Party (1773)', 'American Declaration of Independence (1776)', 'Storming of the Bastille (1789)', 'Execution of Louis XVI (1793)', 'Napoleon crowned emperor (1804)', 'Battle of Waterloo (1815)'], ['America\'s revolution came first.', 'Waterloo ended Napoleon\'s rule.'], '1773 → 1776 → 1789 → 1793 → 1804 → 1815.', 5, 2),
    mcq('frq', 'Third Estate = common people.', [
      ['Which group paid most taxes in pre-revolutionary France?', 'The Third Estate', ['The clergy', 'The nobility', 'The king\'s family'], 'Peasants, workers and middle class.', 'The Third Estate carried most of the tax burden.'],
      ['The motto of the French Revolution was…', 'Liberty, Equality, Fraternity', ['Blood and Iron', 'No taxation without representation', 'Peace, Land, Bread'], 'Three words about freedom and brotherhood.', 'Liberté, égalité, fraternité.'],
      ['Who wrote "The Social Contract", arguing that power comes from the people?', 'Rousseau', ['Napoleon', 'Louis XVI', 'Bismarck'], 'A French-speaking philosopher.', 'Jean-Jacques Rousseau argued for popular sovereignty.'],
      ['The Treaty of Paris (1783)…', 'recognised the independence of the USA', ['ended Napoleon\'s rule', 'unified Germany', 'began the French Revolution'], 'It ended the American war.', 'Britain recognised the United States in 1783.'],
      ['Napoleon was finally defeated at…', 'Waterloo (1815)', ['the Bastille', 'Boston', 'Versailles (1871)'], 'A battle in present-day Belgium.', 'Napoleon was defeated at Waterloo in 1815.'],
    ]),
    matchT('people', 'person with their role', [
      ['George Washington', 'First President of the USA'], ['Louis XVI', 'French king executed in 1793'], ['Napoleon Bonaparte', 'Emperor who issued a law code (1804)'], ['Montesquieu', 'Argued for separation of powers'], ['Rousseau', 'Wrote "The Social Contract"'],
    ], ['Montesquieu = separation of powers.', 'Washington led the American side.']),
  ]),
  O('ts9.ss.rev.unification', 'Unification of Italy and Germany', [
    h('Nations from many states'),
    p('In 1815, Italy and Germany were not single countries. Italy was split into several kingdoms and states, some under Austrian control; the German-speaking lands were divided into dozens of states. Nationalism — the idea that people sharing language and culture should form one nation — drove unification.'),
    stepsB('1831: Giuseppe Mazzini founds "Young Italy" to spread the idea of a united republic.', '1850s: Count Cavour, prime minister of Piedmont-Sardinia, uses diplomacy and alliances (with France) against Austria.', '1860: Giuseppe Garibaldi and his "Red Shirts" conquer Sicily and Naples and hand them to the king.', '1861: Kingdom of Italy proclaimed under Victor Emmanuel II.', '1870–71: Rome joins and becomes the capital.'),
    stepsB('1862: Otto von Bismarck becomes chief minister of Prussia — policy of "blood and iron".', '1864: war with Denmark.', '1866: war with Austria.', '1870–71: war with France.', '18 January 1871: German Empire proclaimed in the Hall of Mirrors at Versailles; Wilhelm I becomes Kaiser.'),
    keys('Italy: Mazzini (ideas), Cavour (diplomacy), Garibaldi (fighting), Victor Emmanuel II (king).', 'Germany: Bismarck, three wars, empire in 1871.', 'Nationalism united some peoples but also led to rivalries and wars.'),
    remember('Italy united 1861 (Rome 1871). Germany united 1871.'),
  ], [
    ex('Match the role: who was the "brain", "heart" and "sword" of Italian unification?', ['Mazzini inspired people — the heart/soul.', 'Cavour planned through diplomacy — the brain.', 'Garibaldi fought — the sword.'], 'Cavour = brain, Mazzini = heart, Garibaldi = sword'),
    ex('What did Bismarck mean by "blood and iron"?', ['He believed speeches and votes would not unite Germany.', 'Unity would come through military strength and war.'], 'Unification by military power'),
  ], [
    matchT('unif', 'person with their role in unification', [
      ['Mazzini', 'Founded Young Italy (1831)'], ['Cavour', 'Prime minister of Piedmont; diplomacy'], ['Garibaldi', 'Led the Red Shirts'], ['Victor Emmanuel II', 'First king of united Italy'], ['Bismarck', 'Prussian minister; "blood and iron"'], ['Wilhelm I', 'First German Kaiser (1871)'],
    ], ['Garibaldi = Red Shirts.', 'Bismarck and Wilhelm I are German.']),
    orderT('germ', 'Order the steps of German unification.', ['Bismarck becomes Prussia\'s chief minister (1862)', 'War with Denmark (1864)', 'War with Austria (1866)', 'War with France (1870–71)', 'German Empire proclaimed at Versailles (1871)'], ['Three wars, in the order Denmark, Austria, France.', 'The empire came last.'], '1862 → 1864 → 1866 → 1870–71 → 1871.'),
    mcq('uq', 'Nationalism = one people, one nation.', [
      ['The German Empire was proclaimed in 1871 at…', 'the Hall of Mirrors, Versailles', ['Rome', 'Vienna', 'London'], 'A palace near Paris, after defeating France.', 'It was proclaimed at Versailles after victory over France.'],
      ['"Young Italy" was founded by…', 'Giuseppe Mazzini', ['Garibaldi', 'Cavour', 'Bismarck'], 'He spread ideas of a united republic.', 'Mazzini founded Young Italy in 1831.'],
      ['Nationalism is the belief that…', 'people sharing language and culture should form one nation', ['kings rule by divine right', 'there should be no governments', 'colonies should be expanded'], 'Nation + -ism.', 'Nationalists wanted a state for each nation.'],
      ['The Kingdom of Italy was proclaimed in…', '1861', ['1789', '1815', '1947'], 'Before Rome joined.', 'Italy was proclaimed a kingdom in 1861.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 13 — Industrialisation and Social Change
// =====================================================================================
const ch13 = U(13, 'Industrialisation and Social Change', [
  O('ts9.ss.indus.why', 'Why Britain industrialised first', [
    h('From hand to machine'),
    def('Industrial Revolution', 'The change, beginning in Britain in the late 1700s, from making goods by hand at home to making them by machines in factories, powered first by water and then by steam.'),
    stepsB('Coal and iron ore lay close together, giving fuel and metal for machines.', 'Overseas trade and colonies supplied raw cotton and markets — and capital (money) to invest.', 'Changes in farming (enclosures, better methods) grew more food with fewer workers, pushing people to towns.', 'Banks and a stable government protected property and trade.', 'Rivers, canals and ports made transport cheap; inventors were rewarded by patents.'),
    p('India\'s handloom cloth had been prized across the world. As British machine-made cloth became cheaper, it was sold in India too, and many Indian weavers lost their livelihoods.'),
    keys('Coal + iron + capital + markets + labour + stable government.', 'Factories replaced the domestic system.', 'Britain\'s colonies, including India, supplied raw materials and markets.'),
    remember('Industrial Revolution began in Britain in the second half of the 18th century (around 1750–1850).'),
  ], [
    ex('Why did farm changes help industry?', ['Enclosures and better methods needed fewer farm workers.', 'Displaced workers moved to towns and became factory labour.', 'More food fed the growing towns.'], 'They supplied labour and food for factory towns.'),
    ex('How did colonies help Britain industrialise?', ['They supplied raw materials such as cotton.', 'They were markets for finished goods.', 'Trade profits provided capital.'], 'Raw materials, markets and capital'),
  ], [
    tapT('why', 'Tap the reasons why Britain industrialised first.', [
      ['Coal and iron deposits close together', true], ['Capital from trade and colonies', true], ['Large markets in its colonies', true], ['Stable government and banks', true], ['No rivers or ports', false], ['A ban on all inventions', false],
    ], ['Think of resources, money, markets and stability.', 'Rivers and patents helped, not hindered.'], 'Resources, capital, markets and stability made Britain first.'),
    mcq('whyq', 'Machines + factories + steam.', [
      ['Before factories, cloth was mostly made…', 'by hand at home (domestic system)', ['in steel plants', 'by computers', 'in ships'], 'Families spun and wove at home.', 'The domestic system came before factories.'],
      ['The Industrial Revolution began in…', 'Britain', ['India', 'China', 'Brazil'], 'In the late 1700s.', 'It started in Britain and spread to other countries.'],
      ['How did British factories affect Indian handloom weavers?', 'Cheap machine cloth took away their markets', ['They became richer', 'They were unaffected', 'They all moved to Britain'], 'Machine cloth was cheaper.', 'Many Indian weavers lost their work.'],
      ['Enclosure of common land in Britain led to…', 'many villagers moving to towns for work', ['more forests', 'fewer towns', 'less food'], 'Think about who lost access to land.', 'Displaced rural workers became factory labour.'],
    ]),
    matchT('factor', 'factor with how it helped', [
      ['Coal', 'Fuel for steam engines'], ['Iron', 'Material for machines and rails'], ['Colonies', 'Raw cotton and markets'], ['Banks', 'Loans for new factories'],
    ], ['Steam engines burn coal.', 'Banks provide capital.']),
  ]),
  O('ts9.ss.indus.inventions', 'Inventions: cotton, coal and iron, steam and transport', [
    h('One invention leads to another'),
    stepsB('1709: Abraham Darby smelts iron using coke (from coal) instead of charcoal.', '1733: John Kay\'s flying shuttle speeds up weaving — now spinners can\'t keep up.', 'About 1764: James Hargreaves\' spinning jenny spins several threads at once.', '1769: Richard Arkwright\'s water frame — strong thread, water-powered mills. James Watt patents his improved steam engine.', '1779: Samuel Crompton\'s spinning mule.', '1785: Edmund Cartwright\'s power loom.', '1825: Stockton–Darlington railway; 1830: Liverpool–Manchester railway with George Stephenson\'s locomotives.'),
    p('Canals (such as the Bridgewater Canal, 1761) and then railways carried coal and goods cheaply. Steam power freed factories from rivers, so they could be built in towns near coal and workers.'),
    keys('Textiles: flying shuttle → jenny → water frame → mule → power loom.', 'Watt\'s steam engine powered factories, then trains and ships.', 'Railways from 1825–30 transformed transport.'),
    remember('India\'s first passenger train: Bombay to Thane, 16 April 1853.'),
  ], [
    ex('Why did the flying shuttle lead to inventions in spinning?', ['Weavers could now weave much faster.', 'Spinners could not produce thread fast enough.', 'Inventors created the jenny and water frame to catch up.'], 'It created a thread shortage that spinning machines solved.'),
    ex('Why could factories move away from rivers after about 1780?', ['Early mills used water wheels and needed fast rivers.', 'Watt\'s steam engine gave power anywhere coal could reach.'], 'Steam engines replaced water power.'),
  ], [
    orderT('inv', 'Order these inventions by date.', ['Coke smelting of iron — Darby (1709)', 'Flying shuttle — Kay (1733)', 'Spinning jenny — Hargreaves (about 1764)', 'Water frame — Arkwright (1769)', 'Power loom — Cartwright (1785)', 'Liverpool–Manchester railway (1830)'], ['Iron smelting came very early.', 'Railways came last.'], '1709 → 1733 → 1764 → 1769 → 1785 → 1830.', 5, 2),
    matchT('invm', 'inventor with invention', [
      ['John Kay', 'Flying shuttle'], ['James Hargreaves', 'Spinning jenny'], ['Richard Arkwright', 'Water frame'], ['Edmund Cartwright', 'Power loom'], ['James Watt', 'Improved steam engine'], ['George Stephenson', 'Railway locomotives'],
    ], ['Watt = steam.', 'Stephenson = trains.']),
    mcq('invq', 'Follow the chain: weaving → spinning → power.', [
      ['Who improved the steam engine, making it efficient for factories?', 'James Watt', ['John Kay', 'Napoleon', 'Robert Owen'], 'The unit of power is named after him.', 'Watt\'s improvements (patented 1769) made steam power practical.'],
      ['The first railway line in India ran between…', 'Bombay and Thane (1853)', ['Hyderabad and Warangal (1900)', 'Delhi and Agra (1947)', 'Madras and Calcutta (1820)'], 'It ran in 1853.', 'India\'s first passenger train ran from Bombay to Thane in 1853.'],
      ['Coke is made from…', 'coal', ['wood', 'cotton', 'iron ore'], 'Darby used it to smelt iron.', 'Coke is coal heated without air.'],
      ['The spinning jenny was invented by…', 'James Hargreaves', ['Richard Arkwright', 'George Stephenson', 'Edmund Cartwright'], 'Around 1764.', 'Hargreaves\' jenny spun several threads at once.'],
    ]),
  ]),
  O('ts9.ss.indus.workers', 'Workers, women and children; industrialisation elsewhere', [
    h('The human cost'),
    photo('🧱', 'Fast-growing factory towns were crowded, smoky and unhealthy, with little clean water.'),
    p('Factory workers often worked 12–16 hours a day in dangerous conditions for low wages. Women and children were employed because they could be paid less; children as young as 6 or 7 worked in mills and mines. Towns like Manchester grew so fast that housing, drains and clean water could not keep up, and diseases like cholera spread.'),
    stepsB('1833: Factory Act — children under 9 banned from textile mills; hours limited for older children; inspectors appointed.', '1842: Mines Act — women, and boys under 10, banned from working underground.', '1847: Ten Hours Act — limited working hours for women and young people in textile mills.'),
    p('Industrialisation then spread: Belgium, France, Germany and the USA in the 19th century; Japan after the Meiji Restoration (1868), with strong government support. In India, the first successful cotton mill opened in Bombay in 1854 and the first jute mill near Calcutta (Rishra) in 1855.'),
    keys('Long hours, low wages, child labour, unhealthy towns.', 'Factory Acts gradually limited child labour and hours.', 'Industry spread to Europe, USA, Japan and India.'),
    remember('1833 Factory Act; 1842 Mines Act. Japan industrialised after 1868 (Meiji).'),
  ], [
    ex('Why did mill owners employ children?', ['Children could be paid much less.', 'Small hands could mend threads and crawl under machines.'], 'Cheap labour and small size'),
    ex('How was Japan\'s industrialisation different from Britain\'s?', ['Britain\'s was led mainly by private entrepreneurs over a long time.', 'Japan\'s government actively planned and supported industry after 1868.'], 'Japan\'s was government-led and rapid.'),
  ], [
    orderT('acts', 'Order these by date.', ['Factory Act limits child labour (1833)', 'Mines Act bans women underground (1842)', 'First cotton mill in Bombay (1854)', 'Meiji Restoration in Japan (1868)'], ['British Factory Acts came first.', 'Japan came later.'], '1833 → 1842 → 1854 → 1868.'),
    mcq('wq', 'Think of hours, wages and safety.', [
      ['The Factory Act of 1833 mainly…', 'restricted child labour in textile mills', ['abolished all factories', 'gave women the vote', 'built railways'], 'It protected children.', 'It banned children under 9 from textile mills.'],
      ['Why did cholera spread in factory towns?', 'Overcrowding and dirty water', ['Too many parks', 'Too much clean water', 'Cold weather only'], 'Think of drains and drinking water.', 'Crowded housing and contaminated water spread disease.'],
      ['Japan industrialised rapidly after the…', 'Meiji Restoration (1868)', ['French Revolution', 'Glorious Revolution', 'Boston Tea Party'], 'A change of government in Japan.', 'Meiji Japan modernised with state support.'],
      ['Typical working hours in early factories were…', '12–16 hours a day', ['4 hours a day', '6 hours a week', '8 hours a week'], 'Very long.', 'Workers often laboured 12 to 16 hours daily.'],
    ]),
    tapT('cond', 'Tap the conditions faced by early factory workers.', [
      ['Very long working hours', true], ['Low wages', true], ['Dangerous machines', true], ['Child labour', true], ['Paid annual holidays', false], ['Health insurance', false],
    ], ['Benefits like insurance came much later.', 'Think of the 1800s.'], 'Long hours, low wages, danger and child labour were common.'),
  ]),
]);

// =====================================================================================
// Chapter 14 — Social Protest Movements
// =====================================================================================
const ch14 = U(14, 'Social Protest Movements', [
  O('ts9.ss.protest.workers', 'Early workers\' movements and Luddism', [
    h('Workers organise'),
    p('Factory workers had no vote and little legal protection. They started to protest and organise to demand better wages and conditions.'),
    stepsB('1799–1800: Combination Acts ban workers from forming unions.', '1811–1816: Luddite protests — textile workers break new machines that threaten their jobs.', '1819: Peterloo — soldiers charge a peaceful crowd demanding reform in Manchester; many killed and injured.', '1824: Combination Acts repealed; unions become legal, though with limits.', '1834: Tolpuddle Martyrs — farm labourers transported to Australia for forming a union; public protest wins their release.', '1838–1848: Chartist movement demands votes for all men, secret ballot and more.'),
    def('Luddites', 'Groups of skilled textile workers (1811–1816) who broke machines they believed were destroying their livelihoods. They took the name of a legendary leader, "Ned Ludd".'),
    def('Trade union', 'An organisation of workers that bargains collectively with employers for wages, hours and safety.'),
    keys('Unions were first banned, then legalised (1824).', 'Luddites broke machines; Chartists demanded political rights.', 'Collective action won better laws over time.'),
    remember('People\'s Charter (1838) demanded: vote for all men over 21, secret ballot, no property qualification for MPs, payment of MPs, equal constituencies, annual parliaments.'),
  ], [
    ex('Why did Luddites attack machines rather than factory owners?', ['New machines replaced skilled workers or cut their wages.', 'Breaking machines was a direct way to protect jobs and pressure employers.'], 'Machines were seen as the immediate threat to their livelihood.'),
    ex('Why did the Chartists demand a secret ballot?', ['With open voting, employers and landlords could punish people who voted against them.', 'A secret ballot protects voters\' freedom.'], 'To vote without fear of pressure'),
  ], [
    orderT('wdates', 'Order these events by date.', ['Combination Acts ban unions (1799–1800)', 'Luddite machine-breaking (1811–1816)', 'Peterloo (1819)', 'Unions legalised (1824)', 'Tolpuddle Martyrs (1834)', 'People\'s Charter (1838)'], ['Unions were banned before they were legalised.', 'Chartism came last.'], '1799 → 1811 → 1819 → 1824 → 1834 → 1838.', 5, 2),
    mcq('lud', 'Luddites broke machines; Chartists wanted votes.', [
      ['The Luddites protested by…', 'breaking machines', ['writing novels', 'forming political parties abroad', 'buying factories'], 'Named after "Ned Ludd".', 'They broke machines they saw as threats to their jobs.'],
      ['The Combination Acts…', 'banned workers from forming unions', ['gave all men the vote', 'ended child labour', 'built canals'], 'Combination = joining together.', 'They made unions illegal until 1824.'],
      ['Which was a demand of the Chartists?', 'A secret ballot', ['Return of absolute monarchy', 'Ban on all machines', 'Higher taxes on workers'], 'They wanted political rights.', 'The Charter demanded a secret ballot and votes for all men.'],
      ['A trade union is…', 'an organisation of workers bargaining together', ['a factory owners\' club', 'a government tax office', 'a type of machine'], 'Workers acting collectively.', 'Unions bargain collectively for better conditions.'],
    ]),
    matchT('terms', 'term with its meaning', [
      ['Luddites', 'Machine-breaking textile workers'], ['Chartists', 'Demanded votes for all men'], ['Trade union', 'Workers bargaining collectively'], ['Peterloo', 'Attack on a peaceful reform meeting (1819)'],
    ], ['Chartists → People\'s Charter.', 'Peterloo happened in Manchester.']),
  ]),
  O('ts9.ss.protest.socialism', 'Socialism', [
    h('Who should own factories?'),
    p('Industrialisation created great wealth but also great inequality. Some thinkers argued that the problem lay in private ownership of factories and land, and proposed socialism.'),
    def('Socialism', 'The idea that the means of production (land, factories, mines) should be owned or controlled by society as a whole, so that wealth is shared more equally.'),
    def('Capitalism', 'An economic system where the means of production are privately owned and run for profit in markets.'),
    stepsB('Early 1800s: Robert Owen runs a model mill town at New Lanark (Scotland) with better housing, schools and shorter hours, and sets up co-operatives.', '1848: Karl Marx and Friedrich Engels publish "The Communist Manifesto": history is a story of class struggle; workers should unite.', '1867: Marx publishes the first volume of "Das Kapital".', 'Late 1800s: socialist and labour parties grow in Europe; many push for reforms through elections.', '1917: Russian Revolution creates the first socialist state.'),
    p('Different socialists had different methods: some wanted gradual reform through elections and laws; others wanted revolution. Many modern democracies, including India, mix markets with public welfare — a mixed economy.'),
    keys('Socialism: social ownership, more equality.', 'Owen: co-operatives; Marx & Engels: class struggle (1848).', 'India adopted a mixed economy.'),
    remember('"The Communist Manifesto" — 1848, Marx and Engels.'),
  ], [
    ex('How was Robert Owen\'s approach different from Marx\'s?', ['Owen tried to show a better way by running model communities and co-operatives.', 'Marx argued that class struggle and workers\' revolution would change society.'], 'Reform by example vs revolution through class struggle'),
    ex('Is a state-owned railway a feature of socialism or capitalism?', ['It is owned by the public, not private shareholders.'], 'A socialist (public-ownership) feature, found in mixed economies like India\'s.'),
  ], [
    mcq('soc', 'Socialism = shared ownership; capitalism = private ownership.', [
      ['"The Communist Manifesto" (1848) was written by…', 'Karl Marx and Friedrich Engels', ['Robert Owen alone', 'Adam Smith', 'Napoleon'], 'Two German thinkers.', 'Marx and Engels published it in 1848.'],
      ['Robert Owen is known for…', 'a model community and co-operatives at New Lanark', ['inventing the steam engine', 'unifying Italy', 'the Boston Tea Party'], 'A Scottish mill town.', 'Owen improved conditions at New Lanark.'],
      ['Under capitalism, factories are mostly…', 'privately owned and run for profit', ['owned by all citizens equally', 'banned', 'run by the Church'], 'Private ownership.', 'Capitalism is based on private ownership and markets.'],
      ['India\'s economy is often described as…', 'a mixed economy', ['purely capitalist', 'purely socialist', 'feudal'], 'Both public and private sectors.', 'India combines public and private sectors.'],
    ]),
    matchT('socm', 'thinker or idea with its description', [
      ['Robert Owen', 'Co-operatives and model mill town'], ['Karl Marx', 'Class struggle; "Das Kapital"'], ['Socialism', 'Social ownership of means of production'], ['Capitalism', 'Private ownership for profit'], ['Mixed economy', 'Public and private sectors together'],
    ], ['Owen → New Lanark.', 'Mixed = both.']),
    orderT('socdates', 'Order these events by date.', ['Robert Owen at New Lanark (early 1800s)', 'Communist Manifesto (1848)', 'Das Kapital, volume 1 (1867)', 'Russian Revolution (1917)'], ['Owen was earliest.', 'The Russian Revolution came in the 20th century.'], 'Owen → 1848 → 1867 → 1917.'),
  ]),
  O('ts9.ss.protest.women', 'The women\'s movement', [
    h('Equal rights for women'),
    photo('👩', 'Women campaigned for decades for the right to vote, to study, to own property and to work on equal terms.'),
    p('In the 1800s, women in most countries could not vote, often could not own property after marriage, and had little access to higher education. The women\'s movement fought these inequalities.'),
    stepsB('1792: Mary Wollstonecraft writes "A Vindication of the Rights of Woman", demanding education and equality.', '1848: Seneca Falls Convention (USA) demands women\'s rights, including the vote. In India, Savitribai and Jyotirao Phule open a school for girls in Pune.', '1893: New Zealand becomes the first country to give women the vote in national elections.', '1903: Emmeline Pankhurst founds the Women\'s Social and Political Union; "suffragettes" campaign in Britain.', '1918/1928: British women over 30 get the vote (1918); equal voting age with men (1928). 1920: US 19th Amendment.', '1950: India\'s Constitution gives all adults, men and women, the vote from the start.'),
    def('Suffrage', 'The right to vote. Suffragists/suffragettes campaigned for women\'s suffrage.'),
    keys('Demands: vote, education, property, equal pay.', 'NZ 1893 first; Britain 1918/1928; USA 1920.', 'India gave universal adult franchise in 1950.'),
    remember('Savitribai Phule — one of India\'s first women teachers; girls\' school in Pune, 1848.'),
  ], [
    ex('How was India different from Britain on women\'s voting rights?', ['Britain gave women the vote gradually (1918, then equal in 1928) after long struggle.', 'India\'s Constitution gave every adult the vote from 1950, with no gender difference.'], 'India granted universal adult franchise at once in 1950.'),
    ex('Why was education a key demand of the women\'s movement?', ['Without education, women were kept out of professions and public life.', 'Education gives independence and the confidence to claim other rights.'], 'Education opens the door to other rights.'),
  ], [
    orderT('wdates', 'Order these milestones by date.', ['Wollstonecraft\'s "Vindication" (1792)', 'Seneca Falls Convention (1848)', 'New Zealand women vote (1893)', 'WSPU founded by Pankhurst (1903)', 'US 19th Amendment (1920)', 'Indian Constitution: universal adult franchise (1950)'], ['The book came first.', 'India\'s Constitution came last.'], '1792 → 1848 → 1893 → 1903 → 1920 → 1950.', 5, 2),
    matchT('wom', 'person or event with its description', [
      ['Mary Wollstonecraft', '"A Vindication of the Rights of Woman"'], ['Emmeline Pankhurst', 'Led the suffragettes in Britain'], ['Savitribai Phule', 'Girls\' school in Pune, 1848'], ['Seneca Falls', 'US women\'s rights convention, 1848'], ['New Zealand', 'First country with women\'s national vote'],
    ], ['Phule worked in India.', 'Pankhurst → suffragettes.']),
    mcq('wq', 'Suffrage = the right to vote.', [
      ['"Suffrage" means…', 'the right to vote', ['the right to work', 'a type of tax', 'a factory law'], 'Suffragettes wanted it.', 'Suffrage is the right to vote.'],
      ['The first country to give women the national vote was…', 'New Zealand (1893)', ['Britain (1928)', 'USA (1920)', 'France (1789)'], 'An island nation in the Pacific.', 'New Zealand gave women the vote in 1893.'],
      ['Indian women got the right to vote…', 'from 1950, through universal adult franchise', ['only in 2000', 'never', 'only if they owned land'], 'The Constitution came into force in 1950.', 'The Constitution gave all adults the vote equally.'],
      ['Savitribai Phule is remembered for…', 'girls\' education and social reform', ['inventing a loom', 'leading the Chartists', 'writing the Bill of Rights'], 'She was a teacher.', 'She opened schools for girls with Jyotirao Phule.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 15 — Colonialism in Latin America, Asia and Africa
// =====================================================================================
const ch15 = U(15, 'Colonialism in Latin America, Asia and Africa', [
  O('ts9.ss.colon.americas', 'European expansion and colonies in the Americas', [
    h('Ships, guns and germs'),
    photo('🚢', 'Ocean-going sailing ships, the compass and better maps let European sailors cross oceans from the late 1400s.'),
    def('Colonialism', 'Control by one country over another land and its people, usually to exploit its resources, labour and markets.'),
    stepsB('1492: Christopher Columbus, sailing for Spain, reaches the Caribbean islands.', '1494: Treaty of Tordesillas divides newly found lands between Spain and Portugal.', '1498: Vasco da Gama reaches Calicut in India by sea around Africa.', '1519–1521: Hernán Cortés conquers the Aztec Empire (Mexico).', '1532–1533: Francisco Pizarro conquers the Inca Empire (Peru).'),
    p('Native American peoples died in huge numbers from war and especially from European diseases like smallpox, to which they had no immunity. Europeans set up mines (silver) and plantations (sugar), and brought millions of enslaved Africans across the Atlantic to work them.'),
    def('Latin America', 'The lands of Central and South America and the Caribbean colonised by Spain and Portugal, whose languages (Spanish, Portuguese) come from Latin.'),
    keys('1492 Columbus; 1498 Vasco da Gama.', 'Spain and Portugal conquered Aztecs and Incas.', 'Disease, mines, plantations and the slave trade.'),
    remember('Brazil speaks Portuguese; most of the rest of Latin America speaks Spanish.'),
  ], [
    ex('Why is the region called "Latin" America?', ['It was colonised mainly by Spain and Portugal.', 'Spanish and Portuguese developed from Latin.'], 'Because its main languages come from Latin.'),
    ex('Why did so many Native Americans die after 1492?', ['Europeans brought diseases like smallpox.', 'Native peoples had no immunity.', 'War and forced labour added to the deaths.'], 'Mainly new diseases, plus war and forced labour'),
  ], [
    orderT('expl', 'Order these events by date.', ['Columbus reaches the Caribbean (1492)', 'Treaty of Tordesillas (1494)', 'Vasco da Gama reaches Calicut (1498)', 'Cortés conquers the Aztecs (1519–21)', 'Pizarro conquers the Incas (1532–33)'], ['Columbus came first.', 'The Incas were conquered after the Aztecs.'], '1492 → 1494 → 1498 → 1519 → 1532.'),
    matchT('expm', 'explorer or conqueror with the event', [
      ['Columbus', 'Reached the Caribbean in 1492'], ['Vasco da Gama', 'Sea route to India, 1498'], ['Cortés', 'Conquered the Aztecs'], ['Pizarro', 'Conquered the Incas'],
    ], ['Aztecs → Mexico; Incas → Peru.', 'Da Gama reached Calicut.']),
    mcq('amq', 'Spain and Portugal led the first wave.', [
      ['Which country colonised Brazil?', 'Portugal', ['Spain', 'Britain', 'France'], 'Brazilians speak Portuguese.', 'Brazil was a Portuguese colony.'],
      ['The main cause of deaths among Native Americans was…', 'European diseases like smallpox', ['earthquakes', 'famine caused by drought only', 'volcanoes'], 'They had no immunity.', 'New diseases killed the largest numbers.'],
      ['Why were enslaved Africans taken to the Americas?', 'To work on plantations and in mines', ['To become rulers', 'To study at universities', 'To build railways in 1500'], 'Think of sugar plantations.', 'Colonists forced enslaved Africans to work plantations and mines.'],
      ['Colonialism means…', 'one country controlling another land and its people', ['countries trading equally', 'two nations merging by choice', 'a country with no government'], 'Control and exploitation.', 'Colonialism is control of a territory by a foreign power.'],
    ]),
  ]),
  O('ts9.ss.colon.asia', 'Colonialism in Asia and China', [
    h('Trading companies become rulers'),
    p('In Asia, Europeans first came as traders, through chartered companies. Over time they used force and local rivalries to take control.'),
    stepsB('1600: English East India Company founded.', '1602: Dutch East India Company (VOC) founded; later controls the Indonesian spice islands.', '1757: Battle of Plassey — the English Company gains control over Bengal.', '1839–1842: First Opium War — Britain defeats China, which tried to stop the opium trade.', '1842: Treaty of Nanjing — China opens ports and gives Hong Kong to Britain.', '1856–1860: Second Opium War; more concessions forced on China.'),
    p('China was never fully made a colony, but foreign powers carved out "spheres of influence" and forced unequal treaties. In India, Company rule gave way to direct rule by the British Crown in 1858.'),
    def('Unequal treaty', 'A treaty forced on a weaker country that gave privileges to foreign powers, such as trading ports and foreigners being tried by their own courts.'),
    keys('Companies: English (1600), Dutch (1602).', 'Opium Wars forced China to open up.', 'India came under the Crown in 1858.'),
    remember('Treaty of Nanjing (1842): Hong Kong ceded to Britain.'),
  ], [
    ex('Why did Britain go to war with China in 1839?', ['British traders sold opium (grown in India) to China.', 'China tried to stop the trade and destroyed opium stocks.', 'Britain went to war to protect this trade.'], 'To force China to keep allowing the opium trade'),
    ex('How was China\'s experience different from India\'s?', ['India came under direct British rule.', 'China kept its own government but was forced into unequal treaties and spheres of influence.'], 'China was semi-colonial, not a full colony.'),
  ], [
    orderT('asia', 'Order these events by date.', ['English East India Company founded (1600)', 'Dutch VOC founded (1602)', 'Battle of Plassey (1757)', 'Treaty of Nanjing (1842)', 'Indian rule passes to the British Crown (1858)'], ['The companies came first.', 'Crown rule followed the 1857 revolt.'], '1600 → 1602 → 1757 → 1842 → 1858.'),
    mcq('asq', 'Trade first, then rule.', [
      ['The Opium Wars were fought between Britain and…', 'China', ['Japan', 'India', 'Indonesia'], 'Over the opium trade.', 'Britain fought China in 1839–42 and 1856–60.'],
      ['Which European power controlled most of Indonesia?', 'The Netherlands (Dutch)', ['Britain', 'Spain', 'Portugal'], 'The VOC was Dutch.', 'The Dutch controlled the East Indies.'],
      ['Hong Kong was ceded to Britain by the…', 'Treaty of Nanjing (1842)', ['Treaty of Paris (1783)', 'Treaty of Versailles', 'Bill of Rights'], 'After the First Opium War.', 'The Treaty of Nanjing gave Hong Kong to Britain.'],
      ['An unequal treaty is one that…', 'is forced on a weaker country and favours foreign powers', ['benefits both sides equally', 'is signed only by kings', 'ends all trade'], 'Unequal = one-sided.', 'Such treaties gave privileges to foreign powers.'],
    ]),
    matchT('asm', 'power with its main Asian colony or sphere', [
      ['Britain', 'India'], ['Netherlands', 'Indonesia'], ['France', 'Indo-China (Vietnam, Laos, Cambodia)'], ['Spain (later USA)', 'Philippines'],
    ], ['The Dutch held the spice islands.', 'France ruled Indo-China.']),
  ]),
  O('ts9.ss.colon.africa', 'Colonialism in Africa: the Congo and South Africa', [
    h('The scramble for Africa'),
    p('Until about 1870, Europeans held mainly coastal trading posts in Africa. Then, in a "scramble", they divided almost the whole continent. At the Berlin Conference (1884–85), European powers set rules for claiming African land — without any Africans present. By 1914 only Ethiopia and Liberia remained independent.'),
    h('Case study: Congo'),
    p('King Leopold II of Belgium ruled the Congo Free State (1885–1908) as his personal property. Villagers were forced to collect wild rubber; those who failed faced brutal punishments. Millions died. After international protest, Belgium took over the colony in 1908. Congo became independent in 1960 under Prime Minister Patrice Lumumba.'),
    h('Case study: South Africa'),
    stepsB('1652: Dutch settle at the Cape; their descendants are called Boers (Afrikaners).', '1867 and 1886: diamonds and then gold discovered; mining brings British expansion and migrant African labour.', '1899–1902: Boer War between Britain and the Boer republics.', '1910: Union of South Africa formed under white minority rule.', '1948: Apartheid — strict racial segregation made law.', '1990: Nelson Mandela freed after 27 years in prison; 1994: first democratic elections, Mandela becomes president.'),
    keys('Berlin Conference 1884–85 divided Africa.', 'Congo: forced rubber collection under Leopold II.', 'South Africa: apartheid 1948–1994; Mandela president 1994.'),
    remember('Gandhiji lived in South Africa 1893–1914 and first developed Satyagraha there.'),
  ], [
    ex('Why are many African borders straight lines?', ['European powers drew them on maps at conferences like Berlin (1884–85).', 'They often ignored where African peoples actually lived.'], 'They were drawn by colonisers, not by local communities.'),
    ex('What was apartheid?', ['A system of laws from 1948 separating people by race.', 'Black South Africans were denied votes and equal rights.', 'It ended with democratic elections in 1994.'], 'Legal racial segregation (1948–1994)'),
  ], [
    orderT('sa', 'Order these South African events by date.', ['Dutch settle at the Cape (1652)', 'Gold discovered (1886)', 'Boer War (1899–1902)', 'Union of South Africa (1910)', 'Apartheid laws (1948)', 'First democratic elections (1994)'], ['The Dutch came first.', 'Democracy came at the end.'], '1652 → 1886 → 1899 → 1910 → 1948 → 1994.', 5, 2),
    mcq('afq', 'Berlin 1884–85; Congo and rubber; apartheid.', [
      ['Which two African countries remained independent by 1914?', 'Ethiopia and Liberia', ['Congo and Kenya', 'Egypt and Nigeria', 'South Africa and Ghana'], 'One defeated Italy in 1896.', 'Only Ethiopia and Liberia stayed independent.'],
      ['The Congo Free State was the personal property of…', 'King Leopold II of Belgium', ['Queen Victoria', 'Napoleon', 'Bismarck'], 'A Belgian king.', 'Leopold II ruled it personally from 1885 to 1908.'],
      ['Apartheid in South Africa meant…', 'legal racial segregation', ['equal rights for all', 'free trade', 'a mining technique'], 'Apart = separate.', 'Apartheid separated people by race by law.'],
      ['Nelson Mandela became president of South Africa in…', '1994', ['1948', '1910', '1960'], 'After the first democratic elections.', 'Mandela became president in 1994.'],
      ['The Berlin Conference (1884–85)…', 'set rules for Europeans to divide Africa', ['freed all African colonies', 'ended the slave trade in 1600', 'unified Germany'], 'No Africans were present.', 'It regulated the European scramble for Africa.'],
    ]),
    matchT('afm', 'term with its meaning', [
      ['Boers', 'Descendants of Dutch settlers in South Africa'], ['Apartheid', 'Racial segregation by law'], ['Scramble for Africa', 'Rapid European division of Africa'], ['Patrice Lumumba', 'First prime minister of independent Congo'],
    ], ['Boers = Afrikaners.', 'Lumumba led Congo in 1960.']),
  ]),
]);

// =====================================================================================
// Chapter 16 — Impact of Colonialism in India
// =====================================================================================
const ch16 = U(16, 'Impact of Colonialism in India', [
  O('ts9.ss.colind.forests', 'Forests under British rule', [
    h('Who owns the forest?'),
    photo('🌳', 'For Adivasi communities, forests gave food, fuel, medicine, grazing and land for podu (shifting) cultivation.'),
    p('Before British rule, forest communities used forests according to their own customs. The British needed timber for railway sleepers and ships, and wanted revenue. So they took control of forests.'),
    stepsB('1864: Forest Department set up (Dietrich Brandis as the first Inspector General of Forests).', '1865: First Indian Forest Act.', '1878: Forest Act divides forests into reserved, protected and village forests — the best become "reserved", where people cannot cut wood, graze or farm.', '1927: Indian Forest Act tightens control further.'),
    p('Shifting cultivation was restricted, grazing and collecting forest produce needed permission, and forest guards often harassed villagers. Forest communities lost access to the resources they had depended on for generations.'),
    keys('British wanted timber (railways, ships) and revenue.', 'Reserved forests closed to local use.', 'Adivasis lost customary rights.'),
    remember('Forest Rights Act (2006) later recognised some rights of forest-dwelling communities.'),
  ], [
    ex('Why did railways increase demand for forests?', ['Each kilometre of track needed many wooden sleepers.', 'Steam engines also burned wood in early years.'], 'Sleepers and fuel needed huge amounts of timber.'),
    ex('What could villagers NOT do in a reserved forest?', ['Cut wood, graze cattle, collect produce freely or practise podu.'], 'Use it without official permission'),
  ], [
    orderT('fdates', 'Order these forest laws and steps by date.', ['Forest Department set up (1864)', 'First Indian Forest Act (1865)', 'Forest Act creates reserved forests (1878)', 'Indian Forest Act (1927)', 'Forest Rights Act (2006)'], ['The department came first.', 'The Forest Rights Act is after Independence.'], '1864 → 1865 → 1878 → 1927 → 2006.'),
    mcq('fq', 'The British wanted timber and revenue.', [
      ['Why did the British want control over Indian forests?', 'Timber for railways and ships, and revenue', ['To give land to Adivasis', 'To create tourism', 'To grow rice in forests'], 'Think of railway sleepers.', 'Forests supplied timber and income to the colonial state.'],
      ['In reserved forests, local people…', 'could not freely cut wood, graze or farm', ['were given full ownership', 'paid no tax ever', 'were encouraged to practise podu'], 'Reserved = kept for the government.', 'Customary use was banned in reserved forests.'],
      ['The first Inspector General of Forests in India was…', 'Dietrich Brandis', ['Robert Clive', 'Lord Dalhousie', 'James Watt'], 'A German forester.', 'Brandis headed the Forest Department from 1864.'],
      ['Podu is…', 'shifting cultivation practised by forest communities', ['a type of railway', 'a forest tax', 'a British law'], 'Telangana term.', 'Podu is shifting cultivation in forests.'],
    ]),
    tapT('lost', 'Tap the things Adivasis lost under colonial forest laws.', [
      ['Free collection of firewood', true], ['Grazing rights', true], ['Freedom to practise shifting cultivation', true], ['Access to forest produce like mahua', true], ['Railway jobs for all', false], ['New ownership deeds for their land', false],
    ], ['Laws took away customary rights.', 'They did not receive ownership.'], 'Customary rights to wood, grazing, podu and produce were curtailed.'),
  ]),
  O('ts9.ss.colind.revolts', 'Adivasi revolts: Santhal, Birsa Munda, Kumaon, Alluri Seetha Rama Raju, Komaram Bheem', [
    h('Jal, Jangal, Zameen'),
    p('Forest communities resisted the loss of their land and forests, the oppression of moneylenders and officials, and forced labour.'),
    stepsB('1855–56: Santhal Hul (rebellion) in the Rajmahal hills, led by brothers Sidhu and Kanhu Murmu, against moneylenders, landlords and Company officials.', '1899–1900: Ulgulan ("great tumult") of the Mundas led by Birsa Munda in the Ranchi region; Birsa died in Ranchi jail in 1900.', '1910s–1921: In Kumaon (Uttarakhand), villagers protested forest restrictions and forced porterage (coolie begar), sometimes by setting fire to reserved forests.', '1922–1924: Rampa Rebellion led by Alluri Seetha Rama Raju in the Godavari–Visakhapatnam agency hills; he was killed in 1924.', '1930s–1940: Komaram Bheem led the Gonds of Jodeghat (Adilabad region, now Komaram Bheem Asifabad district) against the Nizam\'s officials, with the slogan "Jal, Jangal, Zameen" (water, forest, land); he was killed in 1940.'),
    keys('Causes: loss of forests and land, moneylenders, forced labour, harassment.', 'Leaders: Sidhu–Kanhu, Birsa Munda, Alluri Seetha Rama Raju, Komaram Bheem.', 'Komaram Bheem — Telangana\'s Gond hero, "Jal, Jangal, Zameen".'),
    remember('Komaram Bheem\'s death anniversary is remembered in Jodeghat each year on Aswayuja Pournami.'),
  ], [
    ex('What did "Jal, Jangal, Zameen" mean for Komaram Bheem\'s movement?', ['Jal = water, Jangal = forest, Zameen = land.', 'The Gonds demanded the right to use the resources their lives depended on.'], 'Rights of tribal people over water, forest and land'),
    ex('What common causes link the Santhal Hul and the Rampa Rebellion?', ['Loss of control over land and forests.', 'Exploitation by outsiders and officials.', 'Restrictions on traditional livelihoods.'], 'Loss of forest rights and exploitation'),
  ], [
    matchT('lead', 'leader with the movement', [
      ['Sidhu and Kanhu Murmu', 'Santhal Hul (1855–56)'], ['Birsa Munda', 'Ulgulan (1899–1900)'], ['Alluri Seetha Rama Raju', 'Rampa Rebellion (1922–24)'], ['Komaram Bheem', 'Gond struggle at Jodeghat'],
    ], ['Komaram Bheem is from the Adilabad region.', 'Birsa Munda led the Mundas.']),
    orderT('revd', 'Order these Adivasi movements by date.', ['Santhal Hul (1855–56)', 'Birsa Munda\'s Ulgulan (1899–1900)', 'Rampa Rebellion (1922–24)', 'Komaram Bheem\'s struggle (ends 1940)'], ['The Santhal Hul was in the 1850s.', 'Komaram Bheem was killed in 1940.'], '1855 → 1899 → 1922 → 1940.'),
    mcq('revq', 'Each leader belongs to a region.', [
      ['Komaram Bheem led the…', 'Gonds of the Adilabad region', ['Santhals of Rajmahal', 'Mundas of Ranchi', 'Kumaonis of Uttarakhand'], 'Jodeghat is in Telangana.', 'He led the Gonds against the Nizam\'s officials.'],
      ['The Rampa Rebellion was led by…', 'Alluri Seetha Rama Raju', ['Birsa Munda', 'Sidhu Murmu', 'Komaram Bheem'], 'In the Godavari agency hills.', 'Alluri Seetha Rama Raju led it in 1922–24.'],
      ['Birsa Munda\'s movement is called…', 'Ulgulan', ['Hul', 'Satyagraha', 'Swadeshi'], 'It means "great tumult".', 'The Munda Ulgulan took place in 1899–1900.'],
      ['A main cause of tribal revolts was…', 'loss of rights over forests and land', ['too many railways for tribals', 'free education', 'high crop prices'], 'Think "Jal, Jangal, Zameen".', 'Forest laws, moneylenders and land loss caused unrest.'],
    ]),
  ]),
  O('ts9.ss.colind.labour', 'British industrial policy, Indian industry and labourers', [
    h('Raw materials out, goods in'),
    p('British policy treated India as a supplier of raw materials (cotton, indigo, jute) and a market for British factory goods. Railways (from 1853) mostly connected inland areas to ports. Machine-made cloth from Britain entered India with low duties, while Indian goods faced high duties in Britain. Many artisans lost their livelihoods — a process called de-industrialisation.'),
    p('Still, Indian industries grew slowly: cotton mills in Bombay and Ahmedabad, jute mills in Bengal, Tata\'s steel works at Jamshedpur (1907). The First World War (1914–18) reduced imports and helped Indian mills expand.'),
    h('Labourers and their struggles'),
    p('Mill and mine workers faced long hours, low wages and unsafe conditions. Plantation workers in Assam were recruited under contracts that made it very hard to leave.'),
    stepsB('1881: first Factories Act (limited child labour).', '1918: Madras Labour Union, one of India\'s first trade unions (B.P. Wadia).', '1920: All India Trade Union Congress (AITUC) founded; Lala Lajpat Rai its first president.', '1926: Trade Unions Act allows registration of unions.', '1948: Factories Act (after Independence) — stronger rules on hours, safety and welfare.'),
    keys('India: raw materials out, British goods in → de-industrialisation.', 'Indian industry grew in cotton, jute, steel.', 'Workers organised: AITUC 1920, Trade Unions Act 1926.'),
    remember('AITUC founded 1920 — first all-India trade union federation.'),
  ], [
    ex('What is de-industrialisation?', ['Indian handicraft and handloom industries declined.', 'Cheap British machine goods replaced them.', 'Artisans moved to agriculture, increasing pressure on land.'], 'Decline of traditional Indian industries under colonial rule'),
    ex('Why did the First World War help Indian mills?', ['British factories were busy with war production and shipping was disrupted.', 'Imports fell, so Indian mills filled the demand.'], 'Fewer imports, more demand for Indian goods'),
  ], [
    orderT('labd', 'Order these by date.', ['First railway in India (1853)', 'First Factories Act (1881)', 'TISCO founded at Jamshedpur (1907)', 'AITUC founded (1920)', 'Trade Unions Act (1926)'], ['Railways came first.', 'Unions were legalised after AITUC formed.'], '1853 → 1881 → 1907 → 1920 → 1926.'),
    mcq('labq', 'Raw materials out, goods in.', [
      ['Under colonial policy, India mainly exported…', 'raw materials like cotton and jute', ['steam engines', 'British cloth', 'computers'], 'Britain needed inputs for its factories.', 'India supplied raw materials to British industry.'],
      ['The first president of AITUC was…', 'Lala Lajpat Rai', ['Jawaharlal Nehru', 'B.R. Ambedkar', 'Birsa Munda'], 'A leader from Punjab.', 'Lala Lajpat Rai presided over AITUC in 1920.'],
      ['De-industrialisation in colonial India means…', 'decline of traditional crafts and handlooms', ['growth of steel plants', 'building more railways', 'banning all trade'], 'Artisans lost work.', 'Traditional industries declined under competition from British goods.'],
      ['Most colonial railway lines were built to…', 'link inland areas with ports', ['connect villages to schools', 'carry tourists only', 'cross into China'], 'Think of exports.', 'Railways carried raw materials to ports for export.'],
    ]),
    tapT('labour', 'Tap the problems faced by Indian industrial workers in the colonial period.', [
      ['Long working hours', true], ['Low wages', true], ['Unsafe working conditions', true], ['Little legal protection', true], ['Paid pensions for all', false], ['Eight-hour day guaranteed from 1853', false],
    ], ['Protections came only slowly.', 'Pensions were not common.'], 'Long hours, low pay, danger and weak laws were common.'),
  ]),
]);

// =====================================================================================
// Chapter 17 — Expansion of Democracy
// =====================================================================================
const ch17 = U(17, 'Expansion of Democracy', [
  O('ts9.ss.demo.libya', 'Case study: Libya', [
    h('From colony to one-man rule'),
    p('Libya is a North African country, mostly desert, with large oil reserves. Its story shows how hard it can be to build democracy after colonial rule and dictatorship.'),
    stepsB('1911: Italy invades and colonises Libya, then under Ottoman rule.', '1951: Libya becomes independent as a kingdom under King Idris.', '1959: large oil reserves are discovered.', '1969: Colonel Muammar Gaddafi seizes power in a military coup and rules for over four decades without free elections or opposition parties.', '2011: popular uprising (during the "Arab Spring"); Gaddafi\'s rule ends and he is killed in October 2011.', 'After 2011: rival armed groups and governments compete for power; building stable democratic institutions has proved difficult.'),
    p('Under Gaddafi, oil money paid for some welfare, roads and schools, but citizens had no freedom to criticise the government, form parties or choose their rulers.'),
    keys('Colony (Italy) → kingdom (1951) → dictatorship (1969–2011).', 'Oil wealth does not guarantee freedom.', 'Ending a dictatorship does not automatically create democracy.'),
    remember('Gaddafi ruled Libya from 1969 to 2011.'),
  ], [
    ex('Why was Gaddafi\'s Libya not a democracy even though it built schools and roads?', ['Democracy is about how rulers are chosen and whether people are free.', 'Libyans could not vote him out or criticise him freely.'], 'There were no free elections or political freedoms.'),
    ex('What lesson does post-2011 Libya teach?', ['Removing a dictator is only a first step.', 'Democracy also needs institutions: constitution, elections, courts, a unified government.'], 'Democracy needs strong institutions, not just the fall of a ruler.'),
  ], [
    orderT('lib', 'Order the events in Libya\'s history.', ['Italy colonises Libya (1911)', 'Independence under King Idris (1951)', 'Oil discovered (1959)', 'Gaddafi seizes power (1969)', 'Uprising ends Gaddafi\'s rule (2011)'], ['Colonisation came first.', 'Gaddafi ruled until 2011.'], '1911 → 1951 → 1959 → 1969 → 2011.'),
    mcq('libq', 'Coup = seizing power by force.', [
      ['Which country colonised Libya in 1911?', 'Italy', ['Britain', 'France', 'Spain'], 'A European country across the Mediterranean.', 'Italy invaded Libya in 1911.'],
      ['Gaddafi came to power through…', 'a military coup', ['a free election', 'inheritance as king', 'a referendum by women'], 'Not through votes.', 'He seized power in a 1969 coup.'],
      ['Libya\'s main natural resource is…', 'oil', ['coal', 'tea', 'rubber'], 'Discovered in 1959.', 'Oil is Libya\'s main source of wealth.'],
      ['The wave of protests across Arab countries in 2011 is called…', 'the Arab Spring', ['the Glorious Revolution', 'the Green Revolution', 'the Renaissance'], 'A season name.', 'The 2011 uprisings are known as the Arab Spring.'],
    ]),
    tapT('dict', 'Tap the features of Libya under Gaddafi.', [
      ['No free elections', true], ['No opposition parties allowed', true], ['Power held by one ruler for decades', true], ['Restrictions on criticising the government', true], ['Independent opposition newspapers flourished', false], ['Rulers changed every five years by vote', false],
    ], ['Think: could people choose or criticise their ruler?', 'Free media and elections are democratic features.'], 'One-man rule, no elections, no parties, no free criticism.'),
  ]),
  O('ts9.ss.demo.myanmar', 'Case study: Myanmar', [
    h('A long struggle'),
    p('Myanmar (formerly Burma), India\'s eastern neighbour, has seen long periods of military rule.'),
    stepsB('1824–1885: Britain conquers Burma; it is governed as part of British India until 1937.', '1947: independence leader General Aung San is assassinated.', '4 January 1948: Burma becomes independent.', '1962: military coup led by General Ne Win.', '1988: mass pro-democracy protests are crushed.', '1990: the National League for Democracy (NLD), led by Aung San Suu Kyi, wins elections, but the military refuses to hand over power; she spends many years under house arrest and receives the Nobel Peace Prize (1991).', '2015: NLD wins elections and forms a government sharing power with the military.', '1 February 2021: military seizes power again in a coup.'),
    keys('Military rule for most years since 1962.', 'Elections (1990) ignored by the army.', 'Coup again in 2021 — democracy can be reversed.'),
    remember('Aung San Suu Kyi — Nobel Peace Prize 1991.'),
  ], [
    ex('In 1990 the NLD won the election but did not govern. What does this show?', ['Elections matter only if the results are respected.', 'The army kept real power.'], 'Democracy needs rulers to accept election results.'),
    ex('Compare Libya and Myanmar.', ['Both had long periods of rule without free choice.', 'Libya: one ruler (Gaddafi). Myanmar: the military as an institution.'], 'Both lacked democracy; Libya had one-man rule, Myanmar military rule.'),
  ], [
    orderT('mya', 'Order these events in Myanmar\'s history.', ['Independence (1948)', 'Military coup by Ne Win (1962)', 'Pro-democracy protests crushed (1988)', 'NLD wins elections but is denied power (1990)', 'NLD wins elections and forms government (2015)', 'Military coup (2021)'], ['Independence came first.', 'The most recent coup was 2021.'], '1948 → 1962 → 1988 → 1990 → 2015 → 2021.', 5, 2),
    mcq('myq', 'Myanmar = formerly Burma.', [
      ['Myanmar was earlier called…', 'Burma', ['Ceylon', 'Siam', 'Persia'], 'Its capital was Rangoon (Yangon).', 'Myanmar was known as Burma.'],
      ['Which party won the 1990 elections in Myanmar?', 'National League for Democracy', ['The military party', 'Indian National Congress', 'Communist Party of China'], 'Led by Aung San Suu Kyi.', 'The NLD won, but the army refused to transfer power.'],
      ['Aung San Suu Kyi won the Nobel Peace Prize in…', '1991', ['1948', '1962', '2021'], 'While under house arrest.', 'She received it in 1991.'],
      ['In February 2021 Myanmar\'s military…', 'seized power in a coup', ['held free elections', 'joined India', 'abolished the army'], 'Democracy was reversed.', 'The army took power again on 1 February 2021.'],
    ]),
    matchT('mym', 'person or term with its description', [
      ['Aung San', 'Independence leader assassinated in 1947'], ['Aung San Suu Kyi', 'NLD leader, Nobel Peace Prize 1991'], ['Ne Win', 'General who led the 1962 coup'], ['NLD', 'Pro-democracy party'],
    ], ['Suu Kyi is Aung San\'s daughter.', 'Ne Win was a general.']),
  ]),
  O('ts9.ss.demo.features', 'Features of democracy and dictatorship; the march of democracy', [
    h('Who rules, and how?'),
    def('Democracy', 'A form of government in which rulers are elected by the people, elections are free and fair and held regularly, every adult has one vote of equal value, and rulers work within limits set by the constitution and law, respecting citizens\' rights.'),
    def('Dictatorship', 'Rule by one person or a small group (such as the army) who are not chosen by the people and cannot be removed by them, often suppressing opposition.'),
    stepsB('17th–18th centuries: Britain limits royal power (1689); the USA (1776) and France (1789) proclaim popular rights — but votes are limited to some men.', '19th–early 20th century: voting rights slowly expand to all men and then women.', 'After 1945: colonies in Asia and Africa become independent; India (1947) adopts universal adult franchise (1950).', 'Late 1980s–1990s: democracy spreads to Eastern Europe, Latin America and parts of Africa after the Cold War.', 'Today: more countries hold elections than ever, but some backslide through coups or unfair elections.'),
    keys('Democracy: elected rulers, free and fair elections, one person one vote, rule of law, rights.', 'Dictatorship: rulers not chosen or removable by the people.', 'Democracy has expanded in waves but can also be reversed.'),
    remember('Universal adult franchise: every adult citizen (in India, 18 years and above since 1989) can vote.'),
  ], [
    ex('A country holds elections, but opposition leaders are jailed and votes are counted secretly by the ruling party. Is it a democracy?', ['Elections must be free and fair with real choice.', 'Jailing opponents and rigging counts removes that choice.'], 'No — elections alone are not enough.'),
    ex('Why is "one person, one vote, one value" important?', ['Every citizen counts equally, whatever their wealth, caste, religion or gender.', 'This is political equality.'], 'It guarantees political equality.'),
  ], [
    tp('demo-dict', (r) => {
      const bank: [string, string][] = [['Rulers are chosen in regular, free and fair elections', 'Democracy'], ['Every adult has one vote of equal value', 'Democracy'], ['Opposition parties can campaign freely', 'Democracy'], ['Courts can check the government', 'Democracy'], ['The army chief rules and cannot be voted out', 'Dictatorship'], ['Criticising the ruler leads to jail', 'Dictatorship'], ['Only one party is allowed', 'Dictatorship'], ['Election results are ignored by those in power', 'Dictatorship']];
      const [s, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Is this a feature of democracy or dictatorship? "${s}"`, ...choose(r, a, [a === 'Democracy' ? 'Dictatorship' : 'Democracy']),
        hints: ['Ask: can the people choose and remove their rulers?', 'Ask: are citizens free to disagree?'],
        mistakes: [{ when: 'wrong', explain: `This describes ${a.toLowerCase()}.` }], solution: [`"${s}" → ${a}.`],
      };
    }),
    orderT('march', 'Order these steps in the march of democracy.', ['Bill of Rights limits the English monarch (1689)', 'American Declaration of Independence (1776)', 'French Declaration of the Rights of Man (1789)', 'India adopts universal adult franchise (1950)', 'Democracy spreads in Eastern Europe (around 1990)'], ['Britain first.', 'Eastern Europe after the Cold War.'], '1689 → 1776 → 1789 → 1950 → 1990.'),
    tapT('dfeat', 'Tap the essential features of democracy.', [
      ['Free and fair elections', true], ['One person, one vote, one value', true], ['Rule of law', true], ['Respect for rights of citizens', true], ['Rulers who cannot be removed', false], ['Ban on opposition parties', false],
    ], ['Can people choose and change rulers?', 'Bans on opposition belong to dictatorships.'], 'Free elections, equal votes, rule of law and rights are democratic features.'),
  ]),
]);

// =====================================================================================
// Chapter 18 — Democracy: An Evolving Idea
// =====================================================================================
const ch18 = U(18, 'Democracy: An Evolving Idea', [
  O('ts9.ss.evolve.responsible', 'Responsible government, equality and respect for law and minorities', [
    h('More than voting'),
    p('Democracy did not appear complete. Over time people added ideas to it: that the government must answer to the people, that all are equal before the law, and that the majority must respect minorities.'),
    def('Responsible government', 'A government that is answerable to the elected legislature and, through it, to the people. In India, the Council of Ministers is collectively responsible to the Lok Sabha and must resign if it loses majority support.'),
    def('Rule of law', 'Everyone, including the most powerful leaders, is subject to the same laws, applied by independent courts.'),
    def('Minority opinion', 'Views held by fewer people. In a democracy, minorities can speak, organise and try to become the majority; the majority must not take away their rights.'),
    p('Democratic tools that keep governments responsible: question hour and debates in the legislature, a free press, courts, the Right to Information (RTI) Act 2005, and regular elections.'),
    keys('Government answers to legislature and people.', 'Equality before law; no one is above the law.', 'Majority rule with minority rights.'),
    remember('Article 14: equality before law and equal protection of laws.'),
  ], [
    ex('A minister ignores questions in the Assembly and refuses to explain spending. Which democratic idea is weakened?', ['Ministers must answer to the elected legislature.'], 'Responsible government (accountability)'),
    ex('Why should a majority not ban a minority community\'s festival?', ['Democracy protects the rights of all citizens.', 'Majority rule does not mean majority tyranny.'], 'Minority rights must be respected.'),
  ], [
    mcq('resp', 'Accountability, equality, rights.', [
      ['In India, the Council of Ministers is collectively responsible to the…', 'Lok Sabha', ['Supreme Court', 'President alone', 'Rajya Sabha only'], 'The directly elected house.', 'The ministry must keep the confidence of the Lok Sabha.'],
      ['"No one is above the law" describes…', 'the rule of law', ['dictatorship', 'monarchy', 'majoritarianism'], 'Equal laws for all.', 'Rule of law applies equally to everyone.'],
      ['Which Act helps citizens ask the government for information?', 'Right to Information Act, 2005', ['Dowry Prohibition Act, 1961', 'Indian Forest Act, 1878', 'Factories Act, 1881'], 'RTI.', 'The RTI Act lets citizens seek information from public offices.'],
      ['A democracy protects minorities because…', 'all citizens have equal rights, not just the majority', ['minorities always win elections', 'the majority has no rights', 'minorities do not vote'], 'Majority rule ≠ majority tyranny.', 'Rights belong to every citizen.'],
    ]),
    tapT('acct', 'Tap the tools that keep a government accountable.', [
      ['Question hour in the legislature', true], ['A free press', true], ['Independent courts', true], ['Right to Information requests', true], ['Banning newspapers', false], ['Postponing elections indefinitely', false],
    ], ['Accountability means answering questions.', 'Bans and postponements reduce accountability.'], 'Legislative questions, free press, courts and RTI hold governments to account.'),
    matchT('idea', 'idea with its meaning', [
      ['Responsible government', 'Ministers answer to the elected legislature'], ['Rule of law', 'Same laws for everyone'], ['Minority rights', 'Protection for groups with fewer members'], ['Free press', 'Media can report and criticise'],
    ], ['Responsible = answerable.', 'Rule of law = equality before law.']),
  ]),
  O('ts9.ss.evolve.srilanka-belgium', 'Majoritarian vs inclusive democracy: Sri Lanka and Belgium', [
    h('Two countries, two choices'),
    vis({ kind: 'bar-graph', labels: ['Dutch-speaking', 'French-speaking', 'German-speaking'], values: [59, 40, 1], unit: '% of Belgium\'s population (about)' }, 'Approximate language groups in Belgium.'),
    p('Belgium is a small European country. About 59% speak Dutch (in Flanders), about 40% French (in Wallonia) and about 1% German. In the capital, Brussels, the French speakers are a majority. Tensions grew in the 1950s–60s.'),
    p('Between 1970 and 1993 Belgium amended its constitution four times and created an inclusive (accommodating) system: equal numbers of Dutch- and French-speaking ministers in the central government, strong regional governments, a separate government for Brussels with equal representation, and "community governments" for each language group on culture, education and language.'),
    p('Sri Lanka became independent in 1948. The Sinhala-speaking community is the majority (about three-quarters); Tamil speakers (Sri Lankan Tamils and Indian-origin Tamils) form the largest minority. Governments followed majoritarian policies.'),
    stepsB('1956: an Act makes Sinhala the only official language.', 'Later policies favour Sinhala applicants for university places and government jobs; the constitution gives Buddhism a special place.', 'Tamil parties demand recognition of Tamil, regional autonomy and equal opportunities; distrust grows.', '1983–2009: a long civil war causes heavy loss of life and damage.'),
    def('Majoritarianism', 'The belief that the majority community should rule in whatever way it wants, ignoring the wishes and needs of the minority.'),
    def('Power sharing', 'Dividing power among different communities, regions and organs of government so that every group has a stake in the system.'),
    keys('Belgium: power sharing → unity.', 'Sri Lanka: majoritarianism → alienation and conflict.', 'Inclusive democracy accommodates diversity.'),
    remember('Belgium: 4 constitutional amendments, 1970–1993. Sri Lanka: Sinhala-only Act 1956; civil war 1983–2009.'),
  ], [
    ex('Why did Belgium give equal numbers of Dutch and French ministers even though Dutch speakers are the majority?', ['So that neither community could take decisions alone.', 'This built trust and kept the country together.'], 'To share power and prevent domination by one group'),
    ex('What did the 1956 Act in Sri Lanka lead to?', ['Tamil speakers felt excluded from jobs and government.', 'Their alienation grew into demands for autonomy and, eventually, conflict.'], 'Alienation of the Tamil minority'),
  ], [
    mcq('sbq', 'Belgium shared power; Sri Lanka followed majoritarianism.', [
      ['The majority language group in Belgium is…', 'Dutch-speaking', ['French-speaking', 'German-speaking', 'English-speaking'], 'About 59%.', 'Dutch speakers form about 59% of Belgium\'s people.'],
      ['In 1956, Sri Lanka made which language the only official language?', 'Sinhala', ['Tamil', 'English', 'Hindi'], 'The majority community\'s language.', 'The 1956 Act recognised Sinhala as the only official language.'],
      ['Belgium amended its constitution four times between…', '1970 and 1993', ['1948 and 1956', '1983 and 2009', '1789 and 1815'], 'Over two decades.', 'Four amendments between 1970 and 1993 created power sharing.'],
      ['Majoritarianism means…', 'the majority community rules ignoring minorities', ['power is shared equally', 'there are no elections', 'minorities always rule'], 'Majority-ism.', 'Majoritarianism disregards minority interests.'],
      ['Brussels has a separate government in which…', 'both language communities have equal representation', ['only Dutch speakers sit', 'only German speakers sit', 'there is no government'], 'Inclusive design.', 'Brussels\' government gives both communities equal representation.'],
    ]),
    tapT('belg', 'Tap the features of the Belgian (inclusive) model.', [
      ['Equal numbers of Dutch- and French-speaking central ministers', true], ['Strong regional governments', true], ['Community governments for each language group', true], ['Equal representation in the Brussels government', true], ['One official language only', false], ['Jobs reserved for one community', false],
    ], ['Inclusive = everyone gets a share.', '"One language only" was Sri Lanka\'s approach.'], 'Equal ministers, strong regions, community governments and equal Brussels representation.'),
    orderT('slorder', 'Order these events in Sri Lanka.', ['Independence (1948)', 'Sinhala-only Act (1956)', 'Civil war begins (1983)', 'Civil war ends (2009)'], ['Independence first.', 'The war lasted until 2009.'], '1948 → 1956 → 1983 → 2009.'),
  ]),
  O('ts9.ss.evolve.dignity', 'Dignity and freedom of citizens', [
    h('Democracy and human dignity'),
    photo('🙋', 'Every citizen — rich or poor, of any caste, gender or religion — has the same dignity and the right to be heard.'),
    p('A democracy is better than other forms of government partly because it respects the dignity of every individual. It allows people to correct their own mistakes through debate and elections, and gives a voice to groups who were long ignored — women, Dalits, Adivasis, minorities.'),
    def('Dignity', 'The worth and respect every person deserves simply because they are human.'),
    p('Democracy is not perfect: decisions can be slow, there can be corruption, and inequalities remain. But it provides peaceful ways to raise grievances — elections, courts, protests, petitions, media — that other systems do not.'),
    keys('Democracy enhances dignity of citizens.', 'It allows correction of mistakes through elections and debate.', 'It gives voice to the weak and marginalised.'),
    remember('Indian Constitution, Preamble: "…FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation."'),
  ], [
    ex('Give one example of how Indian democracy promoted dignity of women.', ['Reservation of seats for women in panchayats and municipalities (73rd and 74th Amendments, 1992).', 'Women became sarpanches and councillors in large numbers.'], 'Reserved seats for women in local bodies'),
    ex('Why is the ability to correct mistakes an advantage of democracy?', ['Bad policies can be criticised openly.', 'Voters can change the government at the next election.'], 'Peaceful change through debate and elections'),
  ], [
    mcq('dig', 'Dignity = respect owed to every person.', [
      ['The Preamble speaks of fraternity assuring…', 'the dignity of the individual', ['the wealth of the rich', 'the power of the army', 'the rule of kings'], 'Fraternity = brotherhood.', 'The Preamble links fraternity with the dignity of the individual.'],
      ['Which is an advantage of democracy?', 'It allows mistakes to be corrected peacefully', ['Decisions are always instant', 'There is never any disagreement', 'Rulers cannot be changed'], 'Think of elections.', 'Elections and debate let societies change course peacefully.'],
      ['Reservation of seats for women in panchayats came through the…', '73rd Amendment (1992)', ['Bill of Rights (1689)', 'Forest Act (1878)', 'Sinhala-only Act (1956)'], 'Panchayati Raj amendment.', 'The 73rd Amendment reserved seats for women in panchayats.'],
      ['Which is a peaceful way for citizens to raise a grievance?', 'Filing a petition or approaching the courts', ['Burning public buses', 'Attacking officials', 'Hoarding food'], 'Democratic, non-violent methods.', 'Petitions, courts, media and elections are peaceful channels.'],
    ]),
    tapT('voice', 'Tap the democratic ways citizens can make their voice heard.', [
      ['Voting in elections', true], ['Writing to newspapers', true], ['Peaceful protest', true], ['Filing an RTI application', true], ['Using violence', false], ['Threatening opponents', false],
    ], ['Democratic methods are peaceful.', 'Violence denies others\' dignity.'], 'Voting, writing, peaceful protest and RTI are democratic channels.'),
    matchT('dm', 'term with its meaning', [
      ['Dignity', 'Respect owed to every person'], ['Fraternity', 'Sense of brotherhood among citizens'], ['Petition', 'A formal written request to authorities'], ['Election', 'Choosing representatives by voting'],
    ], ['Fraternity = brotherhood.', 'A petition is a written request.']),
  ]),
]);

// =====================================================================================
// Chapter 19 — Human Rights and Fundamental Rights
// =====================================================================================
const ch19 = U(19, 'Human Rights and Fundamental Rights', [
  O('ts9.ss.rights.fr', 'What rights are; Fundamental Rights in the Constitution', [
    h('Claims that society accepts'),
    def('Right', 'A reasonable claim of a person that is recognised by society and protected by law.'),
    def('Human rights', 'Rights every human being has simply by being human. The UN adopted the Universal Declaration of Human Rights on 10 December 1948 (now Human Rights Day).'),
    p('Part III of the Indian Constitution (Articles 12–35) lists Fundamental Rights. They are "fundamental" because they are basic to a dignified life and are protected by the courts.'),
    stepsB('Right to Equality (Articles 14–18): equality before law; no discrimination on grounds of religion, race, caste, sex or place of birth; equal opportunity in public jobs; abolition of untouchability; abolition of titles.', 'Right to Freedom (Articles 19–22): speech and expression, assembly, association, movement, residence, profession; protection of life and personal liberty (Art. 21); right to education for children 6–14 (Art. 21A).', 'Right against Exploitation (Articles 23–24): bans human trafficking, forced labour (begar) and employment of children under 14 in factories, mines and hazardous work.', 'Right to Freedom of Religion (Articles 25–28): freedom to profess, practise and propagate religion.', 'Cultural and Educational Rights (Articles 29–30): minorities can conserve their culture and set up educational institutions.', 'Right to Constitutional Remedies (Article 32): approach the Supreme Court to enforce these rights.'),
    keys('Six Fundamental Rights today.', 'Right to Property was removed as a Fundamental Right in 1978 (44th Amendment); it is now a legal right (Art. 300A).', 'Courts protect Fundamental Rights.'),
    remember('UDHR: 10 December 1948. Fundamental Rights: Part III, Articles 12–35.'),
  ], [
    ex('A hotel refuses entry to someone because of their caste. Which right is violated?', ['Discrimination on grounds of caste in public places is banned (Article 15).'], 'Right to Equality'),
    ex('A 12-year-old is made to work in a firecracker factory. Which right is violated?', ['Children under 14 cannot be employed in hazardous work (Article 24).'], 'Right against Exploitation'),
  ], [
    tp('which-right', (r) => {
      const bank: [string, string][] = [
        ['A temple or public well is closed to people of a certain caste', 'Right to Equality'], ['Government jobs are denied to someone because she is a woman', 'Right to Equality'],
        ['A journalist is jailed for a fair news report', 'Right to Freedom'], ['A citizen is stopped from moving to another state to work', 'Right to Freedom'],
        ['A child under 14 works in a mine', 'Right against Exploitation'], ['Labourers are forced to work without wages', 'Right against Exploitation'],
        ['A person is forced to give up their religious practice', 'Right to Freedom of Religion'], ['A minority community is stopped from running its own school', 'Cultural and Educational Rights'],
      ];
      const [s, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `Which Fundamental Right is violated? ${s}.`, ...choose(r, a, ['Right to Equality', 'Right to Freedom', 'Right against Exploitation', 'Right to Freedom of Religion', 'Cultural and Educational Rights'].filter((x) => x !== a)),
        hints: ['Discrimination → equality; speech/movement → freedom; forced or child labour → exploitation.', 'Religion and minority institutions have their own rights.'],
        mistakes: [{ when: 'wrong', explain: `This violates the ${a}.` }], solution: [`${s} → ${a}.`],
      };
    }, 2),
    matchT('art', 'article with its content', [
      ['Article 14', 'Equality before law'], ['Article 17', 'Abolition of untouchability'], ['Article 21', 'Protection of life and personal liberty'], ['Article 21A', 'Free education for children 6–14'], ['Article 24', 'No child labour in hazardous work'], ['Article 32', 'Right to Constitutional Remedies'],
    ], ['Article 32 is about going to the Supreme Court.', '21A was added for education.']),
    mcq('frq', 'Part III = Fundamental Rights.', [
      ['The Universal Declaration of Human Rights was adopted on…', '10 December 1948', ['26 January 1950', '15 August 1947', '1 July 2017'], 'Now Human Rights Day.', 'The UN adopted the UDHR on 10 December 1948.'],
      ['Which right is NO LONGER a Fundamental Right?', 'Right to Property', ['Right to Equality', 'Right to Freedom of Religion', 'Right to Constitutional Remedies'], 'Changed by the 44th Amendment, 1978.', 'Property became a legal right under Article 300A.'],
      ['Fundamental Rights are listed in which Part of the Constitution?', 'Part III', ['Part I', 'Part IV', 'Part IVA'], 'Articles 12–35.', 'Part III contains Fundamental Rights.'],
      ['Abolition of untouchability is part of the…', 'Right to Equality', ['Right to Freedom', 'Right to Freedom of Religion', 'Right against Exploitation'], 'Article 17.', 'Article 17, under the Right to Equality, abolishes untouchability.'],
    ]),
  ]),
  O('ts9.ss.rights.remedies', 'Constitutional remedies, PIL and Human Rights Commissions', [
    h('If a right is violated'),
    p('A right is meaningful only if there is a way to enforce it. Article 32 lets any person go directly to the Supreme Court; High Courts can also act under Article 226. Dr B.R. Ambedkar called Article 32 the "heart and soul" of the Constitution.'),
    def('Writ', 'A formal order of a court. Examples: Habeas Corpus (produce a detained person before the court), Mandamus (order an official to do their duty), Prohibition, Certiorari and Quo Warranto.'),
    def('Public Interest Litigation (PIL)', 'A case filed in the public interest by any person or group on behalf of people who cannot approach the court themselves — even by a letter. Courts expanded PIL from around 1980.'),
    def('National Human Rights Commission (NHRC)', 'An independent body set up in 1993 under the Protection of Human Rights Act to inquire into violations of human rights. States have State Human Rights Commissions, such as Telangana\'s.'),
    p('The NHRC can investigate complaints, visit jails, recommend compensation and action, and spread awareness. It cannot itself punish offenders — it recommends to the government and can approach courts.'),
    keys('Article 32: Supreme Court; Article 226: High Courts.', 'Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto.', 'PIL: public-spirited people can approach courts for others.', 'NHRC since 1993.'),
    remember('Habeas Corpus = "you may have the body" — produce the detained person before the court.'),
  ], [
    ex('Ravi\'s brother is detained by police without being produced before a magistrate. Which writ can help?', ['The court can order that the detained person be produced and the legality of detention examined.'], 'Habeas Corpus'),
    ex('Bonded labourers in a quarry cannot afford a lawyer. How can their case reach court?', ['Any public-spirited person or group can file a PIL on their behalf.'], 'Through Public Interest Litigation'),
  ], [
    matchT('writ', 'writ with its purpose', [
      ['Habeas Corpus', 'Produce a detained person before the court'], ['Mandamus', 'Order an official to perform their duty'], ['Quo Warranto', 'Ask by what authority someone holds a public office'], ['Prohibition', 'Stop a lower court from exceeding its powers'], ['Certiorari', 'Transfer or quash an order of a lower court'],
    ], ['Habeas Corpus is about detention.', 'Mandamus = "we command".'], 4, 2),
    mcq('remq', 'Article 32 is the remedy right.', [
      ['Dr Ambedkar called which article the "heart and soul" of the Constitution?', 'Article 32', ['Article 14', 'Article 370', 'Article 51A'], 'Right to Constitutional Remedies.', 'Article 32 lets people go to the Supreme Court to enforce rights.'],
      ['The NHRC was set up in…', '1993', ['1950', '1976', '2005'], 'Under the Protection of Human Rights Act.', 'The NHRC was established in 1993.'],
      ['Which is TRUE about PIL?', 'Anyone can file it for people who cannot approach court', ['Only the victim can file it', 'It needs a big fee', 'It is only for companies'], 'Public interest.', 'PIL lets public-spirited persons act for others.'],
      ['The NHRC can…', 'investigate complaints and recommend action', ['directly punish offenders with jail', 'make laws', 'conduct elections'], 'It is a recommending body.', 'It investigates and recommends; courts and governments act.'],
    ]),
    tapT('rem', 'Tap the bodies or tools that protect rights in India.', [
      ['Supreme Court', true], ['High Courts', true], ['National Human Rights Commission', true], ['Public Interest Litigation', true], ['Hoarding', false], ['Censorship of courts', false],
    ], ['Think of courts and commissions.', 'Hoarding is a crime, not a protection.'], 'Courts, NHRC and PIL protect rights.'),
  ]),
  O('ts9.ss.rights.duties', 'Violations of human rights and Fundamental Duties', [
    h('Rights come with duties'),
    p('Human rights are violated when people face custodial violence, bonded or child labour, trafficking, discrimination by caste or gender, or denial of education and health care. Awareness, courts, commissions, media and active citizens all help prevent violations.'),
    def('Fundamental Duties', 'Duties of every citizen listed in Article 51A (Part IVA), added by the 42nd Amendment in 1976 on the recommendation of the Swaran Singh Committee. There are now 11; the 11th (parents to provide education to children aged 6–14) was added in 2002.'),
    stepsB('Respect the Constitution, the National Flag and the National Anthem.', 'Cherish the ideals of the freedom struggle; uphold the unity and integrity of India.', 'Promote harmony and brotherhood; renounce practices derogatory to the dignity of women.', 'Protect the natural environment — forests, lakes, rivers, wildlife — and have compassion for living creatures.', 'Develop scientific temper and the spirit of inquiry; safeguard public property and abjure violence.', 'Parents/guardians: provide opportunities for education to children aged 6–14.'),
    keys('Duties: Article 51A, Part IVA.', 'Added 1976 (42nd Amendment); 11th duty added 2002.', 'Duties are not enforceable by courts like rights, but guide citizens.'),
    remember('Fundamental Duties — Article 51A; originally 10, now 11.'),
  ], [
    ex('Which Fundamental Duty does a student follow by not damaging a government bus?', ['Safeguarding public property is a Fundamental Duty.'], 'Safeguard public property'),
    ex('How do rights and duties go together?', ['My right to a clean environment depends on everyone\'s duty to protect it.', 'Rights of one person are protected when others perform their duties.'], 'One person\'s right is another\'s duty.'),
  ], [
    orderT('rdates', 'Order these by date.', ['Universal Declaration of Human Rights (1948)', 'Constitution comes into force (1950)', 'Fundamental Duties added (1976)', 'NHRC set up (1993)', '11th Fundamental Duty added (2002)'], ['The UDHR came before India\'s Constitution.', 'The education duty was added last.'], '1948 → 1950 → 1976 → 1993 → 2002.'),
    tapT('dut', 'Tap the items that ARE Fundamental Duties.', [
      ['Respect the National Flag and Anthem', true], ['Protect the natural environment', true], ['Develop scientific temper', true], ['Safeguard public property', true], ['Vote for a particular party', false], ['Pay a specific fee to the panchayat', false],
    ], ['Duties are general responsibilities in Article 51A.', 'Voting choice is free.'], 'Respecting national symbols, protecting the environment, scientific temper and protecting public property are duties.'),
    mcq('dutq', 'Article 51A; 42nd Amendment, 1976.', [
      ['Fundamental Duties were added by the…', '42nd Amendment (1976)', ['1st Amendment (1951)', '73rd Amendment (1992)', '44th Amendment (1978)'], 'During 1976.', 'The 42nd Amendment added Part IVA.'],
      ['How many Fundamental Duties are there now?', '11', ['6', '10', '22'], 'One was added in 2002.', 'There were 10 in 1976; the 11th was added in 2002.'],
      ['The 11th duty concerns…', 'parents providing education to children 6–14', ['paying taxes on time', 'joining the army', 'voting compulsorily'], 'Linked to Article 21A.', 'Parents and guardians must provide educational opportunities.'],
      ['Which is a human rights violation?', 'Keeping workers as bonded labourers', ['Paying fair wages', 'Sending children to school', 'Free legal aid'], 'Forced work for a debt.', 'Bonded labour denies freedom and dignity.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 20 — Women Protection Acts
// =====================================================================================
const ch20 = U(20, 'Women Protection Acts', [
  O('ts9.ss.law.children', 'Children\'s rights, child marriage and the POCSO Act', [
    h('Every child deserves protection'),
    photo('🏫', 'Every child has the right to education, health, play and protection from harm.'),
    p('India ratified the UN Convention on the Rights of the Child (adopted 1989) in 1992. Children have rights to survival, development, protection and participation.'),
    def('Prohibition of Child Marriage Act, 2006', 'Sets the legal age of marriage at 18 for girls and 21 for boys. A child marriage can be declared void at the request of the child; adults who perform, arrange or promote a child marriage can be punished. Child Marriage Prohibition Officers act to prevent such marriages.'),
    def('POCSO Act, 2012', 'The Protection of Children from Sexual Offences Act protects all children under 18 — girls and boys — from sexual abuse. It requires child-friendly procedures, special courts, and makes reporting of offences mandatory.'),
    p('If a child is in danger or a child marriage is being arranged, help is available: Childline 1098, emergency 112, police, school teachers and Child Welfare Committees. Speaking up is not wrong; it protects children.'),
    keys('Marriage age: 18 (girls), 21 (boys).', 'POCSO 2012 protects all children under 18.', 'Helplines: 1098 (Childline), 112 (emergency).'),
    remember('A "child" under POCSO = any person below 18 years.'),
  ], [
    ex('A 16-year-old girl\'s marriage is being arranged. What does the law say?', ['The legal minimum age for a girl is 18.', 'This would be a child marriage, punishable under the 2006 Act.', 'Anyone can inform Childline (1098) or the police.'], 'It is illegal; it can be stopped and reported.'),
    ex('Does POCSO protect boys too?', ['POCSO is gender-neutral.', 'It covers every person below 18.'], 'Yes — all children under 18.'),
  ], [
    mcq('cm', 'Remember 18 and 21; POCSO 2012.', [
      ['Under the 2006 Act, the minimum legal age of marriage for girls is…', '18 years', ['16 years', '14 years', '21 years'], 'Boys: 21.', 'Girls must be at least 18 years old.'],
      ['Under the 2006 Act, the minimum legal age of marriage for boys is…', '21 years', ['18 years', '16 years', '25 years'], 'Girls: 18.', 'Boys must be at least 21 years old.'],
      ['POCSO was enacted in…', '2012', ['1961', '2005', '1956'], 'Protection of Children from Sexual Offences.', 'The POCSO Act was passed in 2012.'],
      ['The Childline helpline number is…', '1098', ['100', '181', '101'], 'A four-digit number for children.', 'Childline 1098 helps children in need.'],
      ['POCSO protects…', 'all children under 18, girls and boys', ['only girls under 12', 'only adults', 'only boys'], 'It is gender-neutral.', 'POCSO covers every child below 18.'],
    ]),
    matchT('chm', 'law or helpline with its purpose', [
      ['Prohibition of Child Marriage Act, 2006', 'Prevents marriage below 18 (girls) / 21 (boys)'], ['POCSO Act, 2012', 'Protects children from sexual offences'], ['1098', 'Childline helpline'], ['RTE Act, 2009', 'Free and compulsory education, 6–14 years'],
    ], ['RTE = Right to Education.', '1098 is for children.']),
    tapT('help', 'Tap the people or services a child in danger can approach.', [
      ['Childline 1098', true], ['A trusted teacher', true], ['Police / emergency 112', true], ['Child Welfare Committee', true], ['A stranger met online', false], ['Keeping quiet out of fear', false],
    ], ['Trusted adults and official helplines.', 'Silence and strangers online are not safe options.'], 'Childline, teachers, police and Child Welfare Committees can help.'),
  ]),
  O('ts9.ss.law.women', 'Laws against trafficking, dowry and domestic violence', [
    h('Laws that protect women'),
    def('Immoral Traffic (Prevention) Act, 1956', 'Punishes trafficking — buying, selling or forcing women and children into commercial sexual exploitation — and provides for rescue and rehabilitation of victims.'),
    def('Dowry Prohibition Act, 1961', 'Makes giving, taking or demanding dowry an offence. Demanding dowry is also punishable. Dowry harassment and dowry deaths are serious crimes under criminal law.'),
    def('Protection of Women from Domestic Violence Act, 2005', 'Protects women from physical, sexual, verbal/emotional and economic abuse by family members. Protection Officers help women get protection orders, residence orders (right to stay in the shared home), monetary relief and custody orders from a magistrate.'),
    p('Help is available through the Women Helpline (181), emergency 112, police, Protection Officers and One Stop Centres (Sakhi Centres). In Telangana, SHE Teams of the police work against harassment of women in public places.'),
    keys('1956: trafficking law. 1961: dowry law. 2005: domestic violence law.', 'Domestic violence includes physical, sexual, emotional and economic abuse.', 'Helplines: 181 (women), 112 (emergency).'),
    remember('Dowry Prohibition Act — 1961. Domestic Violence Act — 2005 (in force 2006).'),
  ], [
    ex('A husband\'s family demands a motorbike from the bride\'s parents after marriage. Is this legal?', ['Demanding dowry, before or after marriage, is an offence under the 1961 Act.'], 'No — it is a punishable dowry demand.'),
    ex('A woman is not physically hurt but her husband takes away all her earnings and stops her from working. Is it domestic violence?', ['The 2005 Act includes economic abuse.', 'Denying a woman access to money or resources is covered.'], 'Yes — economic abuse.'),
  ], [
    matchT('acts', 'law with its year', [
      ['Immoral Traffic (Prevention) Act', '1956'], ['Dowry Prohibition Act', '1961'], ['Protection of Women from Domestic Violence Act', '2005'], ['Prohibition of Child Marriage Act', '2006'], ['POCSO Act', '2012'],
    ], ['Dowry Act is from 1961.', 'POCSO is the most recent.']),
    tapT('dv', 'Tap the forms of abuse covered by the Domestic Violence Act, 2005.', [
      ['Physical abuse', true], ['Sexual abuse', true], ['Verbal and emotional abuse', true], ['Economic abuse', true], ['Disagreement about a TV programme', false], ['Asking someone to share household chores', false],
    ], ['The Act is broad: four types of abuse.', 'Ordinary disagreements are not abuse.'], 'Physical, sexual, verbal/emotional and economic abuse are covered.'),
    mcq('wq', 'Trafficking 1956; dowry 1961; domestic violence 2005.', [
      ['Giving or taking dowry is an offence under the…', 'Dowry Prohibition Act, 1961', ['POCSO Act, 2012', 'Indian Forest Act, 1878', 'Trade Unions Act, 1926'], 'Passed in 1961.', 'The Dowry Prohibition Act bans giving, taking and demanding dowry.'],
      ['Who helps a woman obtain protection orders under the 2005 Act?', 'A Protection Officer', ['A tax officer', 'A forest guard', 'A bank cashier'], 'An official appointed under the Act.', 'Protection Officers assist women in approaching the magistrate.'],
      ['The Women Helpline number is…', '181', ['1098', '101', '108'], 'Different from Childline.', '181 is the women helpline.'],
      ['SHE Teams in Telangana work to…', 'prevent harassment of women in public places', ['collect taxes', 'build roads', 'run schools'], 'A police initiative.', 'SHE Teams act against eve-teasing and harassment.'],
    ]),
  ]),
  O('ts9.ss.law.lokadalat', 'Lok Adalat and free legal aid', [
    h('Justice that is quick and free'),
    p('Courts can be slow and costly. To make justice accessible, Article 39A of the Constitution directs the State to provide free legal aid, and the Legal Services Authorities Act, 1987 set up legal services authorities at national (NALSA), state, district and taluk levels.'),
    def('Lok Adalat', '"People\'s court" where disputes are settled by compromise with the help of a judicial officer and members such as lawyers or social workers. There is no court fee (fees already paid are refunded), and the award is final and binding — no appeal lies against it.'),
    def('Free legal aid', 'A free lawyer and legal advice for eligible people — women, children, SC/ST persons, victims of trafficking, persons with disabilities, industrial workmen, people in custody, and those with low incomes.'),
    stepsB('Approach the District Legal Services Authority (DLSA) or the taluk legal services committee.', 'Apply for free legal aid or ask for the case to be referred to a Lok Adalat.', 'Both parties discuss the dispute with the Lok Adalat members.', 'If they agree, an award is passed; it is binding like a court decree.'),
    keys('Article 39A: free legal aid.', 'Legal Services Authorities Act, 1987 — NALSA, SLSA, DLSA.', 'Lok Adalat: no fee, quick, compromise-based, no appeal.'),
    remember('Women and children are eligible for free legal aid regardless of income.'),
  ], [
    ex('Why is there no appeal against a Lok Adalat award?', ['The settlement is reached by agreement of both parties.', 'Since both agreed, the award is final.'], 'Because it is based on mutual consent.'),
    ex('Lakshmi, a domestic worker, needs a lawyer but cannot pay. Where can she go?', ['She is eligible as a woman.', 'She can apply at the District Legal Services Authority.'], 'District Legal Services Authority for free legal aid'),
  ], [
    mcq('lok', 'Lok Adalat = people\'s court.', [
      ['Which Article of the Constitution directs free legal aid?', 'Article 39A', ['Article 14', 'Article 51A', 'Article 32'], 'A Directive Principle.', 'Article 39A provides for equal justice and free legal aid.'],
      ['The Legal Services Authorities Act was passed in…', '1987', ['1950', '1961', '2012'], 'It set up NALSA.', 'The Act of 1987 created legal services authorities.'],
      ['A Lok Adalat award is…', 'final and binding, with no appeal', ['only a suggestion', 'always appealed in the Supreme Court', 'valid for one month'], 'Based on agreement.', 'Awards are final because both sides agreed.'],
      ['Court fees in a Lok Adalat are…', 'not charged (fees already paid are refunded)', ['doubled', 'paid by the loser', 'paid in gold'], 'It is meant to be affordable.', 'There is no fee in Lok Adalats.'],
    ]),
    orderT('lokorder', 'Put the steps of settling a dispute in a Lok Adalat in order.', ['Approach the legal services authority', 'Case is referred to a Lok Adalat', 'Parties discuss with Lok Adalat members', 'Compromise reached and award passed'], ['You must ask before a hearing is arranged.', 'The award comes after agreement.'], 'Approach → refer → discuss → award.'),
    tapT('elig', 'Tap the people eligible for free legal aid.', [
      ['Women', true], ['Children', true], ['Victims of trafficking', true], ['Persons with disabilities', true], ['Persons in custody', true], ['A large company', false],
    ], ['The aim is to help those who might otherwise be denied justice.', 'Large companies can afford lawyers.'], 'Women, children, trafficking victims, persons with disabilities and those in custody are eligible.'),
  ]),
]);

// =====================================================================================
// Chapter 21 — Disaster Management
// =====================================================================================
const ch21 = U(21, 'Disaster Management', [
  O('ts9.ss.dm.accidents', 'Human-induced disasters: road, rail and air accidents', [
    h('Disasters we can prevent'),
    photo('🚆', 'Most transport accidents are caused by human error — and can be prevented by following safety rules.'),
    def('Human-induced disaster', 'A disaster caused mainly by human action or negligence — road, rail and air accidents, fires, industrial accidents, stampedes, terrorist attacks.'),
    p('Road accidents kill well over a lakh people in India every year. Main causes: over-speeding, drunken driving, not wearing helmets or seat belts, using mobile phones while driving, jumping signals, overloading, poor roads and poorly maintained vehicles.'),
    p('Rail safety: never cross tracks except at proper crossings, do not lean out of doors, do not carry inflammable materials, and pull the emergency chain only in real emergencies. Air safety: follow crew instructions, wear seat belts, learn where the exits are.'),
    stepsB('Call for help: 108 (ambulance), 112 (emergency), 100 (police).', 'Make the scene safe: switch on hazard lights, warn other traffic.', 'Do not move an injured person unnecessarily (possible spine injury) unless there is fire or danger.', 'Give first aid if trained: stop bleeding with pressure.', 'Help without fear: the Good Samaritan law protects people who help accident victims from harassment.'),
    keys('Most transport accidents are caused by human error.', 'Speed, alcohol, phones, no helmet/seat belt are key risks.', 'Golden hour: quick help in the first hour saves lives.'),
    remember('Golden hour: the first hour after a serious injury, when medical help is most effective.'),
  ], [
    ex('Why is a helmet so important for a two-wheeler rider?', ['In a fall, head injuries cause the most deaths.', 'A helmet absorbs the shock and protects the skull and brain.'], 'It greatly reduces the risk of fatal head injury.'),
    ex('You see an accident on the highway. What should you do first?', ['Stay safe yourself.', 'Call 108/112 at once.', 'Warn oncoming traffic and help without moving the injured unnecessarily.'], 'Ensure safety and call for help immediately.'),
  ], [
    tapT('cause', 'Tap the common CAUSES of road accidents.', [
      ['Over-speeding', true], ['Drunken driving', true], ['Using a mobile phone while driving', true], ['Jumping red lights', true], ['Wearing a seat belt', false], ['Following lane discipline', false],
    ], ['Causes are unsafe behaviours.', 'Seat belts and lane discipline prevent harm.'], 'Speeding, drunk driving, phone use and signal-jumping cause accidents.'),
    mcq('acc', 'Human-induced = caused by people.', [
      ['The ambulance emergency number in many states including Telangana is…', '108', ['1098', '181', '101'], 'Three digits starting with 10.', '108 is the ambulance number.'],
      ['The "golden hour" refers to…', 'the first hour after a serious injury', ['the hour before sunset', 'school lunch time', 'peak traffic time'], 'Fast treatment saves lives.', 'Treatment within the first hour greatly improves survival.'],
      ['Which is a human-induced disaster?', 'A train accident due to signal failure caused by negligence', ['An earthquake', 'A cyclone', 'A tsunami'], 'Caused by people.', 'Negligence-caused accidents are human-induced.'],
      ['The Good Samaritan law protects…', 'people who help accident victims', ['drivers who flee', 'vehicle thieves', 'drunk drivers'], 'Encouraging bystanders to help.', 'Helpers are protected from harassment by police or hospitals.'],
    ]),
    orderT('first', 'Order what to do at an accident scene.', ['Make sure you are safe', 'Call 108 or 112', 'Warn other traffic', 'Give basic first aid if trained', 'Stay until help arrives'], ['Your safety comes first.', 'Calling for help is urgent.'], 'Safety → call → warn → first aid → wait.'),
  ]),
  O('ts9.ss.dm.fire', 'Fire accidents: dos and don\'ts', [
    h('Fire spreads fast'),
    photo('🔥', 'Fire needs fuel, heat and oxygen. Remove any one and the fire goes out.'),
    def('Fire triangle', 'Fire needs three things together: fuel, heat and oxygen. Fire-fighting works by removing one of them — water cools (removes heat), sand or a blanket smothers (removes oxygen), clearing material removes fuel.'),
    p('Causes: electrical short circuits, leaking gas cylinders, firecrackers, careless smoking, unattended lamps or stoves, and stored inflammable materials. Smoke is often more deadly than flames.'),
    stepsB('Raise the alarm and call 101 (fire) or 112.', 'Get out quickly by the nearest safe exit; never use a lift during a fire.', 'Crawl low under smoke, where the air is cleaner; cover nose and mouth with a wet cloth.', 'Feel doors with the back of your hand before opening; if hot, use another exit.', 'If clothes catch fire: STOP, DROP and ROLL.', 'Once out, stay out and go to the assembly point.'),
    tip('Never pour water on an electrical fire or burning oil — switch off power, use sand or the right extinguisher, or cover an oil pan with a lid.'),
    keys('Fuel + heat + oxygen = fire.', 'Call 101; use stairs, not lifts.', 'Stop, drop and roll.'),
    remember('Fire service number: 101.'),
  ], [
    ex('Why should you crawl low in a smoke-filled room?', ['Hot smoke rises.', 'Cleaner, cooler air stays near the floor.'], 'The air near the floor has less smoke.'),
    ex('Oil in a pan catches fire. What should you do?', ['Do not pour water — it splashes burning oil.', 'Turn off the stove and cover the pan with a lid to cut off oxygen.'], 'Turn off the heat and cover with a lid.'),
  ], [
    tapT('do', 'Tap the correct actions during a fire.', [
      ['Use the stairs, not the lift', true], ['Crawl low under smoke', true], ['Stop, drop and roll if clothes catch fire', true], ['Call 101', true], ['Go back inside to collect belongings', false], ['Pour water on an electrical fire', false], ['Open a hot door quickly', false],
    ], ['Getting out safely comes first.', 'Water and electricity are a dangerous mix.'], 'Stairs, crawling low, stop-drop-roll and calling 101 are correct.'),
    mcq('fq', 'Remove fuel, heat or oxygen.', [
      ['A fire needs fuel, heat and…', 'oxygen', ['nitrogen', 'water', 'carbon dioxide'], 'The air we breathe.', 'Oxygen is the third side of the fire triangle.'],
      ['Covering a burning pan with a lid works by…', 'cutting off oxygen', ['adding fuel', 'adding heat', 'adding water'], 'Smothering.', 'Without oxygen, the fire goes out.'],
      ['The fire service number in India is…', '101', ['100', '108', '1098'], 'One-zero-one.', '101 is the fire emergency number.'],
      ['Why should lifts not be used during a fire?', 'Power may fail and the shaft can fill with smoke', ['Lifts are too slow always', 'Lifts are only for goods', 'It is not allowed on Sundays'], 'Trapped between floors.', 'Lifts can stop or carry you into smoke.'],
    ]),
    orderT('fireorder', 'Order the steps for escaping a building fire.', ['Raise the alarm', 'Leave by the nearest safe exit using the stairs', 'Crawl low under smoke', 'Gather at the assembly point and stay out'], ['Alarm first.', 'Never go back in.'], 'Alarm → stairs exit → crawl under smoke → assembly point.'),
  ]),
  O('ts9.ss.dm.terror', 'The threat of terrorism and public safety', [
    h('Staying alert, staying calm'),
    def('Terrorism', 'The use or threat of violence against civilians to spread fear and pursue political, ideological or other aims.'),
    p('Terrorism harms people of every community. It aims to create fear and divide society. Citizens can help security agencies by staying alert and calm, without spreading rumours or suspicion against any community.'),
    stepsB('Notice: an unattended bag, box or vehicle in a crowded place.', 'Do not touch, open or move it.', 'Move people away calmly.', 'Inform the police (100 / 112) or security staff immediately.', 'Follow instructions from authorities; do not spread unverified messages on social media.'),
    p('Disaster management in India is coordinated by the National Disaster Management Authority (NDMA), set up under the Disaster Management Act, 2005, along with state and district authorities and the National Disaster Response Force (NDRF).'),
    keys('Do not touch suspicious objects; report them.', 'Stay calm; avoid rumours.', 'NDMA (2005 Act) coordinates disaster management.'),
    remember('Police: 100. All emergencies: 112.'),
  ], [
    ex('You notice an unattended bag at a bus station. What do you do?', ['Do not touch it.', 'Move away and tell others calmly.', 'Inform security or call 100/112.'], 'Don\'t touch; move away; report.'),
    ex('Why should we not forward unverified messages after an attack?', ['Rumours spread panic.', 'They can wrongly blame communities and cause violence.'], 'They spread fear and can harm innocent people.'),
  ], [
    orderT('susp', 'Order the steps on seeing a suspicious unattended object.', ['Do not touch or open it', 'Move yourself and others away calmly', 'Inform police or security staff', 'Follow instructions from the authorities'], ['Never touch it.', 'Authorities take over at the end.'], 'Don\'t touch → move away → report → follow instructions.'),
    mcq('tq', 'Alert, calm, report.', [
      ['The National Disaster Management Authority was set up under the…', 'Disaster Management Act, 2005', ['Indian Forest Act, 1878', 'POCSO Act, 2012', 'Dowry Prohibition Act, 1961'], 'NDMA.', 'The NDMA was set up under the Disaster Management Act, 2005.'],
      ['The single emergency number across India is…', '112', ['181', '1098', '101'], 'Works for police, fire and ambulance.', '112 is the all-in-one emergency number.'],
      ['Terrorism aims mainly to…', 'spread fear among people', ['build roads', 'improve schools', 'increase trade'], 'Terror = fear.', 'It uses violence to create fear.'],
      ['After an incident, a responsible citizen should…', 'rely on official information and avoid spreading rumours', ['forward every message received', 'blame a community', 'crowd around the site'], 'Rumours cause panic.', 'Official information prevents panic and harm.'],
    ]),
    tapT('safe', 'Tap the RESPONSIBLE actions in a security emergency.', [
      ['Reporting unattended objects', true], ['Following police instructions', true], ['Helping others move away calmly', true], ['Opening a suspicious bag', false], ['Spreading unverified rumours', false], ['Crowding around to take videos', false],
    ], ['Report, don\'t touch.', 'Crowds and rumours make things worse.'], 'Report, follow instructions and help others calmly.'),
  ]),
]);

// =====================================================================================
// Chapter 22 — Traffic Education
// =====================================================================================
const ch22 = U(22, 'Traffic Education', [
  O('ts9.ss.traffic.licence', 'Traffic, licences, registration and drunken driving', [
    h('Why traffic education?'),
    photo('🚗', 'Roads are shared by pedestrians, cyclists, two-wheelers, autos, buses and trucks — rules keep everyone safe.'),
    p('As vehicles multiply, roads get crowded and accidents rise. Traffic education teaches the rules and the attitude — patience, care, respect for others — that save lives.'),
    def('Driving licence', 'Official permission to drive a particular class of vehicle, issued by the Regional Transport Office (RTA/RTO) after a test. First a learner\'s licence, then a permanent licence after a driving test.'),
    p('Under the Motor Vehicles Act, 1988: a person aged 16 may get a licence for a gearless two-wheeler up to 50 cc with a parent\'s consent; 18 years for other motor vehicles such as cars and geared motorcycles; transport (commercial) vehicles have additional requirements. Driving without a licence is an offence — and parents can be held responsible if a minor drives.'),
    def('Vehicle registration', 'Every motor vehicle must be registered with the transport authority and display a registration number plate. Telangana vehicles carry the state code "TG" (earlier "TS").'),
    def('Drunken driving', 'Driving with more than 30 mg of alcohol per 100 ml of blood (as measured by a breath analyser) is an offence under Section 185 of the Motor Vehicles Act, with fines and possible imprisonment, and the licence can be suspended.'),
    keys('Learner\'s licence → driving test → permanent licence.', 'Age: 16 (gearless ≤ 50 cc, with consent), 18 (cars, motorcycles).', 'Drunken driving: limit 30 mg per 100 ml of blood.'),
    remember('Documents to carry: driving licence, registration certificate (RC), insurance and pollution-under-control (PUC) certificate.'),
  ], [
    ex('Arjun is 15 and wants to ride his father\'s scooter to school. Is it allowed?', ['The minimum age is 16 even for gearless vehicles up to 50 cc, and he would need a licence.', 'A typical scooter is above 50 cc, needing age 18.'], 'No — he is too young and has no licence.'),
    ex('Why is alcohol dangerous for drivers?', ['It slows reaction time and blurs judgment.', 'It gives false confidence, leading to speeding.'], 'It slows reactions and impairs judgment.'),
  ], [
    mcq('lic', 'Learner first, then permanent.', [
      ['A driving licence is issued by the…', 'Regional Transport Office (RTA)', ['Gram panchayat', 'Post office', 'School'], 'The transport department.', 'Licences are issued by the transport authority after a test.'],
      ['The minimum age for a car driving licence is…', '18 years', ['14 years', '16 years', '25 years'], 'Adult age.', 'You must be 18 for a car licence.'],
      ['The legal blood-alcohol limit for drivers in India is…', '30 mg per 100 ml of blood', ['300 mg per 100 ml', 'any amount is fine', '3 g per ml'], 'A small number.', 'Above 30 mg per 100 ml is an offence under Section 185.'],
      ['Which document shows a vehicle is registered?', 'Registration Certificate (RC)', ['Ration card', 'School ID', 'Bus ticket'], 'RC.', 'The RC proves registration.'],
      ['Before a permanent licence you must first get a…', 'learner\'s licence', ['passport', 'PAN card', 'voter ID'], 'You learn first.', 'A learner\'s licence allows supervised practice.'],
    ]),
    tapT('docs', 'Tap the documents a driver should carry.', [
      ['Driving licence', true], ['Registration certificate', true], ['Insurance certificate', true], ['Pollution-under-control (PUC) certificate', true], ['School report card', false], ['Electricity bill', false],
    ], ['Documents about the driver and the vehicle.', 'Report cards are not required.'], 'Licence, RC, insurance and PUC.'),
    tp('react', (r) => {
      const v = r.pick([36, 54, 72, 90, 108]);
      const t = r.pick([1, 1.5, 2, 3]);
      const d = rd((v / 3.6) * t, 2);
      return numQ(`A driver going at ${v} km/h takes ${t} s to react before braking (alcohol can make this longer). How many metres does the vehicle travel during the reaction time?`, d,
        ['Convert km/h to m/s by dividing by 3.6.', `Distance = speed (m/s) × time (s) = (${v} ÷ 3.6) × ${t}.`],
        [`${v} km/h = ${rd(v / 3.6, 2)} m/s`, `Distance = ${rd(v / 3.6, 2)} × ${t} = ${d} m`], [{ when: String(v * t), explain: 'Convert km/h to m/s first (divide by 3.6).' }], 0.01, 'm');
    }, 3),
  ]),
  O('ts9.ss.traffic.signs', 'Traffic signs, signals and road markings', [
    h('The language of the road'),
    stepsB('Mandatory (regulatory) signs — mostly circular with a red border: must be obeyed — No Entry, Speed Limit, No Parking, No U-turn, Stop (octagonal).', 'Cautionary (warning) signs — triangular with a red border: warn of hazards — School Ahead, Sharp Curve, Pedestrian Crossing, Speed Breaker.', 'Informatory signs — usually rectangular (often blue or green): give information — Hospital, Petrol Pump, Parking, direction boards.'),
    stepsB('Red light: stop behind the stop line.', 'Amber (yellow): get ready to stop; do not try to "beat" it.', 'Green: go if the way is clear, giving way to pedestrians already crossing.', 'Flashing amber: slow down and proceed with caution.'),
    def('Road markings', 'Lines painted on roads: a broken white centre line may be crossed when safe; a continuous (solid) line must not be crossed; double yellow lines mean no overtaking; zebra stripes mark a pedestrian crossing; a stop line shows where to stop at a signal.'),
    keys('Circle = order; triangle = warning; rectangle = information.', 'Red stop, amber prepare, green go with care.', 'Solid line: do not cross; zebra: pedestrians first.'),
    remember('STOP sign is octagonal (eight-sided) — the only sign with that shape.'),
  ], [
    ex('A triangular sign with a picture of children appears ahead. What should a driver do?', ['Triangles are cautionary signs.', 'It warns of a school zone.', 'Slow down and watch for children.'], 'Slow down — school ahead.'),
    ex('The light turns amber as you approach. What should you do?', ['Amber means prepare to stop.', 'If you can stop safely before the line, stop.'], 'Prepare to stop; do not speed up.'),
  ], [
    tp('sign', (r) => {
      const bank: [string, string][] = [['No Entry', 'Mandatory'], ['Speed limit 40', 'Mandatory'], ['No Parking', 'Mandatory'], ['No U-turn', 'Mandatory'], ['School Ahead', 'Cautionary'], ['Sharp Curve', 'Cautionary'], ['Speed Breaker', 'Cautionary'], ['Pedestrian Crossing ahead', 'Cautionary'], ['Hospital', 'Informatory'], ['Petrol Pump', 'Informatory'], ['Parking area', 'Informatory']];
      const [s, a] = r.pick(bank);
      return {
        type: 'mcq', prompt: `What type of road sign is "${s}"?`, ...choose(r, a, ['Mandatory', 'Cautionary', 'Informatory'].filter((x) => x !== a)),
        hints: ['Mandatory = must obey (circle). Cautionary = warns (triangle). Informatory = informs (rectangle).', 'Does it order, warn or inform?'],
        mistakes: [{ when: 'wrong', explain: `"${s}" is ${a.toLowerCase()}.` }], solution: [`${s} → ${a} sign.`],
      };
    }),
    matchT('mark', 'signal or marking with its meaning', [
      ['Red light', 'Stop behind the stop line'], ['Amber light', 'Prepare to stop'], ['Green light', 'Go if the way is clear'], ['Solid white line', 'Do not cross'], ['Broken white line', 'May cross when safe'], ['Zebra crossing', 'Pedestrians cross here'],
    ], ['Solid = do not cross.', 'Amber is a warning to stop.']),
    mcq('shape', 'Circle orders; triangle warns; rectangle informs.', [
      ['Cautionary signs are usually…', 'triangular', ['circular', 'rectangular', 'octagonal'], 'Like a warning arrow pointing up.', 'Warning signs are triangles with a red border.'],
      ['Which sign is octagonal?', 'STOP', ['Hospital', 'School Ahead', 'No Parking'], 'Eight sides.', 'Only the STOP sign is octagonal.'],
      ['Double yellow centre lines mean…', 'no overtaking', ['parking allowed', 'U-turn allowed', 'speed up'], 'Strict marking.', 'Double yellow lines prohibit overtaking.'],
      ['Mandatory signs are mostly…', 'circular', ['triangular', 'rectangular', 'star-shaped'], 'They give orders.', 'Most mandatory signs are circles.'],
    ]),
  ]),
  O('ts9.ss.traffic.pedestrian', 'Road safety and rules for pedestrians', [
    h('Everyone is a pedestrian'),
    photo('🧒', 'Use zebra crossings and footpaths; look both ways before crossing.'),
    stepsB('Walk on the footpath. Where there is none, walk on the right side of the road, facing oncoming traffic.', 'Cross only at zebra crossings, subways, foot-over-bridges or signals.', 'Stop at the kerb; look right, look left, look right again; listen.', 'Cross in a straight line when the road is clear; keep looking while crossing; do not run.', 'Never use a mobile phone or headphones while crossing.', 'At night, wear light-coloured or reflective clothing.'),
    p('Road safety for all: wear a helmet (rider and pillion) on two-wheelers, wear seat belts in cars, children below the prescribed age in proper restraints, never drive drunk, follow speed limits, and give way to ambulances and fire engines.'),
    keys('Footpath first; if none, walk facing traffic.', 'Cross at zebra crossings; look right-left-right.', 'Helmets and seat belts save lives.'),
    remember('In India vehicles keep to the LEFT, so look RIGHT first when crossing.'),
  ], [
    ex('Why should you walk facing oncoming traffic on a road without a footpath?', ['You can see vehicles coming towards you.', 'You can step aside in time.'], 'To see and avoid approaching vehicles.'),
    ex('Why look right first when crossing a road in India?', ['Vehicles drive on the left.', 'The nearest lane of traffic comes from your right.'], 'The nearest traffic comes from the right.'),
  ], [
    orderT('cross', 'Order the steps for crossing a road safely.', ['Find a zebra crossing or signal', 'Stop at the kerb', 'Look right, left and right again', 'Cross straight when the road is clear, without running'], ['Choose the place first.', 'Look before you step.'], 'Find crossing → stop → look R-L-R → cross.'),
    tapT('ped', 'Tap the SAFE pedestrian behaviours.', [
      ['Using the zebra crossing', true], ['Walking facing traffic where there is no footpath', true], ['Using a foot-over-bridge', true], ['Wearing light colours at night', true], ['Crossing while texting', false], ['Running between moving vehicles', false], ['Jumping over the road divider', false],
    ], ['Safe = visible, alert, at proper crossings.', 'Phones and running are dangerous.'], 'Zebra crossings, facing traffic, foot-bridges and visible clothing are safe.'),
    mcq('rs', 'Keep left drive; look right first.', [
      ['Where there is no footpath, pedestrians should walk…', 'on the right side, facing oncoming traffic', ['in the middle of the road', 'on the left with their backs to traffic', 'on the divider'], 'You should see vehicles coming.', 'Facing traffic lets you react in time.'],
      ['On a two-wheeler, who must wear a helmet?', 'Both the rider and the pillion rider', ['Only the rider', 'Only the pillion', 'Nobody in the city'], 'Head injuries affect both.', 'Rider and pillion must both wear helmets.'],
      ['When an ambulance with a siren approaches, you should…', 'give way and move aside safely', ['race it', 'block it', 'stop in the middle of the road'], 'It may be carrying a critical patient.', 'Always give way to emergency vehicles.'],
      ['Which is the safest place to cross a busy road?', 'A zebra crossing at a signal', ['Between parked buses', 'At a sharp bend', 'Over the divider'], 'Marked for pedestrians.', 'Zebra crossings and signals give pedestrians priority.'],
    ]),
  ]),
]);

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21, ch22];
