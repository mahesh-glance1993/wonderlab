// Telangana SCERT Class 7 — Social Studies (22 chapters in 6 themes: I Diversity on the Earth, 1-6;
// II Production, Exchange and Livelihoods, 7-10; III Political Systems and Governance, 11-17;
// IV Social Organisation and Inequities, 18-19; V Religion and Society, 20-21; VI Culture and Communication, 22).
// Original teaching aligned to the official chapter list (src/content/ts/books.ts, syllabus.json).
// Figures marked "about" are rounded, well-established values; figures marked "illustrative" are made-up
// numbers used only to practise a method.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, stepsB, approx, choose, matching, ordering, tapAll, NAMES,
  type USpec, type TSpec, type QSpec, type OSpec, type ExSpec,
} from '../../lib/kit';
import type { Block } from '../../../shared/content';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(7, 'social', n);
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Check each left item on its own, starting with the one you are surest about.' }],
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
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.001, unitHint?: string): QSpec => ({
  type: 'typed', keypad: 'numeric', prompt, answer: approx(ans, rel), hints, solution,
  ...(unitHint ? { unitHint } : {}),
  mistakes: [{ when: 'wrong-value', explain: 'Re-check the method in the hints and redo the arithmetic step by step.' }, ...mistakes],
});

/** "How many years passed between event A and event B?" from a bank of [event A, year A, event B, year B]. */
type YQ = [string, number, string, number];
const yearsT = (key: string, bank: YQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [a, ya, b, yb] = r.pick(bank);
  return numQ(`${a} in ${ya}. ${b} in ${yb}. How many years passed between the two events?`, yb - ya,
    ['Subtract the earlier year from the later year.', `${yb} − ${ya} = ?`],
    [`Later year − earlier year = ${yb} − ${ya}`, `= ${yb - ya} years`],
    [{ when: String(yb + ya), explain: 'You added the years. To find the gap between two dates, subtract.' }], 0.001, 'years');
}, d);

/** Objective shorthand. */
const O = (id: string, title: string, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title, prereqs: [], intro, examples, practice });
/** Unit shorthand. */
const U = (n: number, title: string, objectives: OSpec[]): USpec => ({ id: `ts7.ss.ch${n}`, subject: 'social', title, source: src(n), objectives });

// =====================================================================================
// Theme I — Diversity on the Earth
// Chapter 1 — Reading Maps of Different Kinds
// =====================================================================================
const ch1 = U(1, 'Reading Maps of Different Kinds', [
  O('ts7.ss.maps.symbols', 'Map symbols and scale', [
    h('A map is a picture with a key'),
    photo('🗺️', 'A map shows a big area on a small sheet of paper, using symbols, colours and a scale.'),
    p('Imagine drawing your route from home to school for a new friend. You cannot draw every tree and shop, so you use small marks: a dot for the temple, a line for the road, a shaded patch for the playground. That is exactly what map-makers do.'),
    def('Point symbol', 'A dot, star or small sign that marks one place, such as a town, a temple, a post office or a railway station.'),
    def('Line symbol', 'A line that shows something long and narrow: a road, a railway, a river, a canal or a state boundary.'),
    def('Area symbol', 'A colour or pattern that covers a whole region: a forest, a lake, farmland or a city area.'),
    def('Legend (key)', 'The box on a map that explains what each symbol and colour means.'),
    h('Scale: shrinking the world'),
    p('A map is far smaller than the real land. The scale tells you how much smaller. If a map says "1 cm = 10 km", then 1 cm on paper stands for 10 km on the ground.'),
    stepsB('Measure the distance on the map with a ruler (in cm).', 'Read the scale (for example 1 cm = 10 km).', 'Multiply: map distance × km per cm.', 'Write the real distance with its unit.'),
    keys('Point, line and area symbols.', 'The legend explains the symbols.', 'Real distance = map distance × scale value.'),
    remember('Every good map has a title, a direction arrow (north), a scale and a legend.'),
  ], [
    ex('On a map, 1 cm = 20 km. Hyderabad and a nearby town are 4 cm apart. How far apart are they really?', ['Map distance = 4 cm.', 'Each cm stands for 20 km.', '4 × 20 = 80 km.'], '80 km'),
    ex('Is a river shown with a point, line or area symbol? What about a forest?', ['A river is long and narrow, so a line is used.', 'A forest spreads over a region, so it is coloured as an area (usually green).'], 'River: line symbol; forest: area symbol'),
  ], [
    tp('scale', (r) => {
      const s = r.pick([5, 10, 20, 25, 50, 100]);
      const d = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
      return numQ(`On a map the scale is 1 cm = ${s} km. Two towns are ${d} cm apart on the map. What is the real distance in km?`, s * d,
        ['Each centimetre on the map stands for the scale value.', `Multiply ${d} by ${s}.`],
        [`Real distance = ${d} × ${s}`, `= ${s * d} km`], [{ when: String(s + d), explain: 'You added. Each of the centimetres stands for the same distance, so multiply.' }], 0.001, 'km');
    }, 2),
    tapT('line', 'Tap the features usually shown with a LINE symbol.', [
      ['River', true], ['Railway track', true], ['National highway', true], ['State boundary', true], ['Canal', true],
      ['Post office', false], ['Forest', false], ['Lake', false], ['Bus station', false], ['Temple', false],
    ], ['Line symbols are for long, narrow features.', 'Single places are points; spread-out regions are areas.'], 'Rivers, roads, railways, canals and boundaries are long and narrow, so they are drawn as lines.'),
    mcq('legend', 'Think about what each part of a map does.', [
      ['Which part of a map explains what its symbols mean?', 'The legend (key)', ['The scale', 'The title', 'The north arrow'], 'It is often a small box in a corner.', 'The legend lists each symbol and colour with its meaning.'],
      ['A dot marking a railway station is a…', 'point symbol', ['line symbol', 'area symbol', 'scale'], 'It marks one single place.', 'A single place is shown by a point symbol.'],
      ['A large green patch on a map most likely shows…', 'a forest', ['a road', 'a temple', 'a railway line'], 'Green colours a region.', 'Forests cover an area, so they are shown with an area symbol, usually green.'],
      ['Why do maps need a scale?', 'To show how map distances compare with real distances', ['To show where north is', 'To make the map colourful', 'To list the symbols'], 'A map is much smaller than real land.', 'The scale tells us how many km on the ground each cm on paper represents.'],
      ['Which feature helps you find directions on a map?', 'The north arrow', ['The legend', 'The scale', 'The title'], 'It usually points to the top of the map.', 'The north arrow shows which way is north, so you can work out the other directions.'],
    ]),
  ]),
  O('ts7.ss.maps.height', 'Physical maps, height and mean sea level', [
    h('Showing hills and plains on flat paper'),
    photo('⛰️', 'Physical maps show which land is high (hills, plateaus, mountains) and which is low (plains, coasts).'),
    p('A political map shows countries, states and towns. A physical map shows the shape of the land itself: mountains, plateaus, plains, rivers and seas. Most of Telangana is part of the Deccan Plateau, so on a physical map it is coloured in shades for medium heights.'),
    def('Mean sea level', 'The average level of the sea surface, worked out from many readings of high and low tide. Heights of land are measured from it, so it counts as 0 metres.'),
    def('Height (altitude)', 'How far a place is above mean sea level, written in metres. Hyderabad is about 500 m above sea level.'),
    h('Colours on a physical map'),
    stepsB('Blue: water bodies (darker blue = deeper sea).', 'Green: low land such as plains and coastal areas.', 'Yellow / light brown: higher land such as plateaus.', 'Dark brown: highlands and mountains.', 'White: snow-covered peaks.'),
    tip('Why measure from the sea? Land everywhere is at different heights, but the sea surface is nearly the same level all round the world, so it makes a fair starting point.'),
    keys('Physical maps show landforms; political maps show boundaries.', 'Height is measured from mean sea level.', 'Green = low, brown = high, blue = water.'),
    remember('Mount Everest is about 8,849 m above mean sea level, the highest point on Earth.'),
  ], [
    ex('A hill top is 650 m above sea level and the valley below it is 420 m above sea level. How much higher is the hill top?', ['Both heights are measured from the same base, mean sea level.', 'Difference = 650 − 420 = 230 m.'], '230 m higher'),
    ex('On a physical map, the coast of Andhra Pradesh is green while western Telangana is light brown. What does this tell you?', ['Green means low land.', 'Light brown means higher land.', 'So Telangana is higher, on the Deccan Plateau, and the coast is low plain.'], 'The coast is low; Telangana is higher plateau land.'),
  ], [
    tp('diff', (r) => {
      const a = r.int(6, 18) * 50, b = r.int(1, 5) * 50;
      const hi = a + b;
      return numQ(`Place A is ${hi} m above mean sea level and place B is ${a} m above mean sea level. How many metres higher is A than B?`, b,
        ['Both heights start from the same zero: mean sea level.', 'Subtract the smaller height from the larger.'],
        [`${hi} − ${a} = ${b} m`], [{ when: String(hi + a), explain: 'You added. The difference in height is found by subtracting.' }], 0.001, 'm');
    }, 2),
    matchT('colour', 'map colour with what it shows', [
      ['Blue', 'Water: seas, lakes, rivers'], ['Green', 'Low plains'], ['Yellow / light brown', 'Plateaus'], ['Dark brown', 'Mountains'], ['White', 'Snow-covered peaks'],
    ], ['Water is blue on almost every map.', 'Colours get browner as the land gets higher.']),
    mcq('msl', 'Heights are measured from the sea.', [
      ['Heights of places are measured from…', 'mean sea level', ['the centre of the Earth', 'the nearest river', 'the top of the nearest hill'], 'It is taken as 0 m.', 'Mean sea level, the average level of the sea, is the starting point (0 m).'],
      ['Which map would best show the Deccan Plateau and the Godavari valley?', 'A physical map', ['A political map', 'A road map', 'A population map'], 'Landforms are shown on this type.', 'Physical maps show the shape of the land.'],
      ['Mean sea level is worked out by…', 'averaging the sea level over many high and low tides', ['measuring the deepest ocean point', 'measuring the highest wave', 'measuring the river level'], 'The sea rises and falls with tides.', 'Because tides change the sea level, an average is taken.'],
      ['Hyderabad is about 500 m above sea level. This number tells us its…', 'altitude (height)', ['distance from Delhi', 'rainfall', 'temperature'], 'Metres above the sea.', 'Altitude means height above mean sea level.'],
      ['A political map mainly shows…', 'countries, states, districts and towns', ['mountains and plains', 'rainfall', 'ocean depths'], 'Think of boundaries.', 'Political maps show boundaries and places made by people.'],
    ]),
  ]),
  O('ts7.ss.maps.contour', 'Contour lines and uses of height maps', [
    h('Lines that join equal heights'),
    p('Imagine pouring water slowly into a pot that holds a clay hill. Every 10 cm of water, you draw a line around the hill where the water touches it. Looking down from above, you see rings. These rings are contour lines.'),
    def('Contour line', 'A line on a map joining places that are at the same height above mean sea level.'),
    def('Contour interval', 'The difference in height between two neighbouring contour lines, for example 20 m.'),
    stepsB('Contour lines close together → the land rises quickly: a steep slope.', 'Contour lines far apart → the land rises slowly: a gentle slope.', 'Circles getting smaller with higher numbers → a hill or peak.', 'Lines that never cross each other, because one place cannot have two heights.'),
    h('Who uses height maps?'),
    p('Engineers use them to plan roads and railways that avoid steep climbs. Farmers and irrigation planners see which way water will flow, where to build a tank bund or a canal. Trekkers and the army use them to find safe routes. Builders check where land may flood.'),
    keys('Contours join points of equal height.', 'Close lines = steep; wide spacing = gentle.', 'Contours never cross.'),
    remember('Water always flows from higher contours to lower contours, at right angles to the lines.'),
  ], [
    ex('Contour lines on one side of a hill are packed close together; on the other side they are far apart. Which side is easier to climb?', ['Close lines mean height changes over a short distance: steep.', 'Far-apart lines mean a gentle slope.'], 'The side with far-apart lines.'),
    ex('Contours on a hill are marked 100 m, 120 m, 140 m and 160 m. What is the contour interval?', ['Each line is 20 m higher than the one before.', '120 − 100 = 20.'], '20 m'),
  ], [
    mcq('read', 'Close = steep; far = gentle.', [
      ['What does a contour line join?', 'Places of equal height', ['Places of equal rainfall', 'Places with equal population', 'Towns on the same road'], 'Think of the water-level rings.', 'A contour joins all points that are at the same height above sea level.'],
      ['Contour lines very close together show…', 'a steep slope', ['a gentle slope', 'flat land', 'a river'], 'Height changes over a small distance.', 'Height rising quickly over a short distance makes a steep slope.'],
      ['Why can two contour lines never cross?', 'One spot cannot have two different heights', ['Map makers forbid it', 'They are drawn in different colours', 'They show different rivers'], 'Each line is one height.', 'A crossing point would have two heights at once, which is impossible.'],
      ['A set of closed circles with the highest number in the middle shows…', 'a hill', ['a valley with a lake', 'a straight road', 'a coastline'], 'Heights increase towards the centre.', 'Rings rising towards the centre are a hill or peak.'],
      ['Contours 0 m, 50 m, 100 m, 150 m have an interval of…', '50 m', ['150 m', '100 m', '25 m'], 'Subtract neighbouring values.', '50 − 0 = 50 m between each line.'],
    ]),
    tp('interval', (r) => {
      const iv = r.pick([10, 20, 25, 50, 100]);
      const base = r.int(1, 8) * 100;
      const vals = [0, 1, 2, 3].map((k) => base + k * iv);
      return numQ(`Neighbouring contour lines on a hill are marked ${vals.join(' m, ')} m. What is the contour interval in metres?`, iv,
        ['The interval is the height difference between neighbouring lines.', `${vals[1]} − ${vals[0]} = ?`],
        [`${vals[1]} − ${vals[0]} = ${iv} m`, 'Check: every step is the same.'], [], 0.001, 'm');
    }, 2),
    tapT('uses', 'Tap the people who would find a contour (height) map useful.', [
      ['An engineer planning a mountain railway', true], ['A farmer deciding where to build a field bund', true], ['A trekker choosing a safe route', true], ['An irrigation officer planning a canal', true],
      ['A shopkeeper counting coins', false], ['A singer practising a song', false], ['A tailor measuring cloth', false],
    ], ['Who needs to know about slopes and heights?', 'Water flow and steep climbs matter to them.'], 'Anyone planning routes, canals, tanks or farms on sloping land needs to know heights and slopes.'),
  ]),
]);

// =====================================================================================
// Chapter 2 — Rain and Rivers
// =====================================================================================
const ch2 = U(2, 'Rain and Rivers', [
  O('ts7.ss.rain.cycle', 'How rain forms; winds and the monsoon', [
    h('Where does rain come from?'),
    photo('🌧️', 'Monsoon clouds bring most of Telangana\'s rain between June and September.'),
    p('Leave a wet cloth in the sun and it dries. The water has not vanished; it has become invisible water vapour in the air. The Sun does this to seas, lakes, rivers and even leaves every day.'),
    stepsB('Evaporation: the Sun heats water; it turns into water vapour and rises.', 'Cooling: the rising air gets cooler higher up.', 'Condensation: vapour turns into tiny droplets around dust particles, forming clouds.', 'Precipitation: droplets join into bigger drops and fall as rain (or hail or snow).', 'Run-off and storage: rain flows into streams, rivers, tanks and soaks into the ground, then the cycle repeats.'),
    def('Wind', 'Moving air. Air moves from areas of high pressure (cooler, heavier air) to areas of low pressure (warmer, lighter air).'),
    def('Monsoon', 'Seasonal winds that change direction. From June to September, the south-west monsoon winds blow from the Indian Ocean over India and bring rain.'),
    p('The south-west monsoon gives Telangana most of its yearly rain. From October to December the north-east (retreating) monsoon brings some rain, especially to south-eastern India. Rain falling on a hillside facing the wind is heavier than on the far side.'),
    keys('Evaporation → condensation → precipitation.', 'Winds blow from high to low pressure.', 'Telangana\'s main rain: south-west monsoon, June–September.'),
    remember('Clouds are not water vapour; they are tiny drops of liquid water (or ice) that formed when vapour cooled.'),
  ], [
    ex('Why does a cold glass of water get wet on the outside on a humid day?', ['Air around the glass contains water vapour.', 'The cold glass cools that air.', 'Vapour condenses into droplets on the glass, just like cloud formation.'], 'Condensation of water vapour from the air.'),
    ex('Why is June to September the main farming season (vanakalam) in Telangana?', ['The south-west monsoon brings most of the year\'s rain in these months.', 'Farmers sow crops like paddy, cotton and maize to use this rain.'], 'Because the south-west monsoon brings rain then.'),
  ], [
    orderT('cycle', 'Put the stages of the water cycle in order.', ['Water is heated by the Sun', 'Water evaporates as vapour', 'Vapour rises and cools', 'Vapour condenses into cloud droplets', 'Droplets grow and fall as rain'], ['Heat comes first.', 'Rain falls only after drops have grown.'], 'Heat → evaporation → cooling → condensation → rain.'),
    mcq('wind', 'Air moves from high to low pressure.', [
      ['Winds blow from…', 'high pressure to low pressure', ['low pressure to high pressure', 'cold land to the Moon', 'the ground straight up only'], 'Heavy air pushes into light-air areas.', 'Air always moves from high-pressure to low-pressure areas.'],
      ['Which winds bring most of Telangana\'s rain?', 'The south-west monsoon winds', ['The north-east trade winds in summer', 'Desert winds from the Thar', 'Winds from the Himalayas'], 'Months: June to September.', 'The south-west monsoon brings most of the year\'s rain.'],
      ['Clouds are made of…', 'tiny drops of water or ice', ['smoke', 'water vapour gas only', 'dust only'], 'Vapour is invisible.', 'Clouds form when vapour condenses into tiny droplets.'],
      ['Changing water into vapour is called…', 'evaporation', ['condensation', 'precipitation', 'irrigation'], 'Think of a drying cloth.', 'Evaporation turns liquid water into vapour.'],
      ['The "retreating" monsoon blows mostly in…', 'October to December', ['January to March', 'April to May', 'June to September'], 'It comes after the main monsoon.', 'The north-east (retreating) monsoon comes from October to December.'],
    ]),
    matchT('terms', 'word with its meaning', [
      ['Evaporation', 'Water turning into vapour'], ['Condensation', 'Vapour turning into droplets'], ['Precipitation', 'Water falling from clouds'], ['Monsoon', 'Seasonal winds that change direction'], ['Run-off', 'Rain water flowing over the land into streams'],
    ], ['Evaporation and condensation are opposites.', 'Precipitation is rain, hail or snow.']),
  ]),
  O('ts7.ss.rain.telangana', 'Rainfall in Telangana and the rain gauge', [
    h('Measuring rain'),
    photo('💧', 'A rain gauge collects rain so we can measure how deep it would be if none flowed away.'),
    def('Rain gauge', 'An instrument with a funnel on top of a measuring jar or cylinder. The rain collected is measured in millimetres (mm) every day at a fixed time.'),
    p('If 25 mm of rain falls, it means that if no water soaked in, ran off or dried, the ground would be covered by water 25 mm deep. Daily readings are added to get monthly and yearly totals.'),
    h('Rain across Telangana'),
    p('Telangana receives about 900 mm of rain in a normal year, most of it from the south-west monsoon. Northern districts such as Adilabad, Komaram Bheem Asifabad and Bhadradri Kothagudem usually get more rain; southern districts such as Mahabubnagar, Jogulamba Gadwal and Nalgonda usually get less and are more drought-prone.'),
    stepsB('Read the rain gauge every morning at the same time.', 'Write the reading in mm.', 'Empty the jar.', 'Add up the readings for the month or year.', 'Average = total ÷ number of years, to compare places fairly.'),
    keys('Rainfall is measured in mm with a rain gauge.', 'Telangana: about 900 mm a year (normal), mostly June–September.', 'North gets more rain than the south of the state.'),
    remember('Rain that comes all at once can cause floods; rain that fails can cause drought. Both matter to farmers.'),
  ], [
    ex('A school rain gauge records 12 mm, 0 mm, 30 mm and 18 mm on four days. What is the total rainfall?', ['Add the readings: 12 + 0 + 30 + 18.', '= 60 mm.'], '60 mm'),
    ex('A district got 800 mm, 950 mm and 1,100 mm in three years. What is the average yearly rainfall?', ['Total = 800 + 950 + 1,100 = 2,850 mm.', 'Average = 2,850 ÷ 3 = 950 mm.'], '950 mm'),
  ], [
    tp('total', (r) => {
      const days = [0, 1, 2, 3].map(() => r.int(0, 12) * 5);
      const t = days.reduce((a, b) => a + b, 0);
      return numQ(`${who(r)}'s school rain gauge recorded ${days.join(' mm, ')} mm on four days (illustrative). What was the total rainfall in mm?`, t,
        ['Daily readings are added to get the total.', 'Add the four numbers.'], [`${days.join(' + ')} = ${t} mm`], [], 0.001, 'mm');
    }, 1),
    tp('avg', (r) => {
      const a = r.int(14, 24) * 50, b = r.int(14, 24) * 50, c0 = r.int(14, 24) * 50;
      const s = a + b + c0;
      const c = c0 + ((3 - (s % 150) / 50) % 3) * 50; // make total divisible by 3 nicely
      const t = a + b + c;
      return numQ(`A mandal recorded ${a} mm, ${b} mm and ${c} mm of rain in three years (illustrative). What is the average yearly rainfall in mm?`, t / 3,
        ['Average = total ÷ number of years.', `First add: ${a} + ${b} + ${c}.`], [`Total = ${t} mm`, `Average = ${t} ÷ 3 = ${t / 3} mm`],
        [{ when: String(t), explain: 'That is the total. Divide by 3 to get the average for one year.' }], 0.001, 'mm');
    }, 2),
    mcq('gauge', 'Rain is measured as a depth.', [
      ['Rainfall is measured with a…', 'rain gauge', ['thermometer', 'barometer', 'wind vane'], 'It has a funnel and a jar.', 'A rain gauge collects and measures rain.'],
      ['Rainfall is usually recorded in…', 'millimetres (mm)', ['litres per person', 'degrees Celsius', 'kilograms'], 'It is a depth.', 'Rain is measured as a depth of water in mm.'],
      ['About how much rain does Telangana receive in a normal year?', 'About 900 mm', ['About 90 mm', 'About 9,000 mm', 'About 3,000 mm'], 'Less than one metre.', 'The normal yearly rainfall of Telangana is about 900 mm.'],
      ['Which part of Telangana generally gets MORE rain?', 'The northern districts such as Adilabad', ['The southern districts such as Mahabubnagar', 'All parts get exactly the same', 'Only Hyderabad city'], 'Think of the forests of the north.', 'Northern Telangana usually receives more rain than the south.'],
      ['Why is the rain gauge read at the same time each day?', 'So each reading covers exactly 24 hours', ['Because rain only falls in the morning', 'To keep the jar warm', 'Because the funnel closes at night'], 'Fair comparisons need equal periods.', 'Fixed times make every reading a full day\'s rainfall.'],
    ]),
  ]),
  O('ts7.ss.rain.rivers', 'Rivers, flood plains, floods, soil erosion and cyclones', [
    h('The journey of a river'),
    photo('🏞️', 'The Godavari and Krishna are the two big rivers of Telangana; both flow east into the Bay of Bengal.'),
    p('Rain on the hills collects into small streams. Streams join to form a river. The point where a river begins is its source; where it meets the sea is its mouth. Rivers that join a bigger river are tributaries. The Manjira joins the Godavari; the Musi joins the Krishna.'),
    def('Flood plain', 'The flat land on both sides of a river that gets covered with water during floods. Floods leave behind fine fertile silt, so flood plains are good for farming.'),
    def('Soil erosion', 'The washing or blowing away of the top fertile soil by water or wind, often faster where trees have been cut.'),
    h('Living with floods and cyclones'),
    stepsB('Plant trees and grass on slopes: roots hold the soil.', 'Build contour bunds and terraces on slopes so water slows down.', 'Build check dams across streams to slow water and let it soak in.', 'Do not build houses on flood plains and river beds.', 'Listen to cyclone and flood warnings; move to cyclone shelters or higher ground; keep drinking water, torches and medicines ready.'),
    p('Cyclones form over warm seas such as the Bay of Bengal. They bring very strong winds and heavy rain, mostly to coastal states, but their rain can also flood rivers inland.'),
    keys('Source → tributaries join → mouth.', 'Flood plains are fertile but risky.', 'Trees, bunds and check dams reduce erosion.'),
    remember('The Godavari is the longest river of peninsular India; it enters Telangana in Nizamabad district.'),
  ], [
    ex('Why do farmers like flood plains even though floods are dangerous?', ['Floods spread fine silt on the land.', 'Silt is fertile and the land is flat and near water.'], 'The soil is fertile and water is close by.'),
    ex('A hill slope has lost its trees. What will happen to the soil in heavy rain, and how can it be stopped?', ['Without roots, nothing holds the soil.', 'Rain washes the topsoil away (erosion).', 'Planting trees and building contour bunds slows the water.'], 'The soil erodes; replant trees and build bunds.'),
  ], [
    matchT('river', 'river word with its meaning', [
      ['Source', 'Where a river begins'], ['Mouth', 'Where a river meets the sea'], ['Tributary', 'A smaller river that joins a bigger one'], ['Flood plain', 'Flat land beside a river covered in floods'], ['Check dam', 'A small wall across a stream to slow water'], ['Silt', 'Fine fertile soil left by floods'],
    ], ['Start with where a river begins and ends.', 'Silt is left behind after floods.']),
    tapT('erosion', 'Tap the actions that REDUCE soil erosion.', [
      ['Planting trees on slopes', true], ['Building contour bunds', true], ['Building check dams', true], ['Growing grass cover', true],
      ['Cutting down forests', false], ['Overgrazing by cattle', false], ['Ploughing straight up and down a slope', false],
    ], ['Ask: does it slow down water or hold the soil?', 'Bare land loses soil fastest.'], 'Trees, grass, bunds and check dams hold soil and slow water; cutting forests and overgrazing expose the soil.'),
    mcq('flood', 'Think about safety and rivers of Telangana.', [
      ['Which river joins the Krishna and flows through Hyderabad?', 'Musi', ['Manjira', 'Pranahita', 'Ganga'], 'It flows past the old city.', 'The Musi flows through Hyderabad and joins the Krishna.'],
      ['Cyclones that affect our region usually form over…', 'the Bay of Bengal', ['the Thar Desert', 'the Himalayas', 'the Deccan Plateau'], 'They need warm sea water.', 'Cyclones form over warm seas; ours come mainly from the Bay of Bengal.'],
      ['During a cyclone warning, the safest action is to…', 'move to a cyclone shelter or higher ground', ['go to the beach to watch', 'cross a flooded stream', 'stand under a big tree'], 'Strong winds and floods are dangerous.', 'Shelters and higher ground protect people from wind and floods.'],
      ['Why is building houses on a river bed risky?', 'Floods can wash them away', ['The soil is too hard', 'There is no sunlight', 'Rivers are noisy'], 'Rivers rise in heavy rain.', 'River beds and flood plains get covered in floods.'],
      ['Into which sea do the Godavari and Krishna flow?', 'The Bay of Bengal', ['The Arabian Sea', 'The Mediterranean Sea', 'The Red Sea'], 'They flow eastward.', 'Both rivers flow east and empty into the Bay of Bengal.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 3 — Tanks and Ground Water
// =====================================================================================
const ch3 = U(3, 'Tanks and Ground Water', [
  O('ts7.ss.tanks.cheruvu', 'Tanks (cheruvulu) and Mission Kakatiya', [
    h('Telangana, the land of tanks'),
    photo('💧', 'A village tank (cheruvu) stores monsoon rain for drinking, cattle, fishing and irrigation.'),
    p('Telangana has few big rivers flowing near most villages, and rain falls only for a few months. So for hundreds of years people built tanks (cheruvulu, kuntalu) to catch and store rain water. The Kakatiya kings encouraged tank-building; Ramappa, Pakhal and Laknavaram lakes are famous examples.'),
    stepsB('Choose a low place where rain water naturally collects.', 'Build an earthen bund (katta) across the slope to hold water.', 'Make a sluice (thoomu) to let water out to the fields in a controlled way.', 'Make a surplus weir (alugu / matthadi) so extra water flows out safely without breaking the bund.', 'Link tanks in a chain so the overflow of one fills the next.'),
    p('Over time many tanks declined: silt filled them, feeder channels were blocked or built over, and people depended more on borewells. In 2015 the Telangana government began Mission Kakatiya to restore tanks by removing silt, repairing bunds and sluices and clearing feeder channels. The removed silt was spread on fields as fertile soil.'),
    keys('Tanks store rain for a dry land.', 'Parts: bund, sluice, surplus weir, feeder channel.', 'Mission Kakatiya (2015) restores tanks.'),
    remember('Chain tanks: the overflow of a higher tank fills the next tank lower down.'),
  ], [
    ex('Why does a tank need a surplus weir?', ['In heavy rain the tank can overfill.', 'Water could flow over the bund and break it.', 'The weir lets the extra water flow out safely.'], 'To let extra water out so the bund does not breach.'),
    ex('Why did removing silt help both the tank and the farmer?', ['Silt made the tank shallow, so it stored less water.', 'Removing it increased storage.', 'Silt is fertile, so spreading it on fields improved the soil.'], 'More storage in the tank and richer soil in fields.'),
  ], [
    matchT('parts', 'part of a tank with its job', [
      ['Bund (katta)', 'Earthen wall that holds the water'], ['Sluice (thoomu)', 'Opening that lets water out to fields'], ['Surplus weir (alugu)', 'Lets extra water out safely'], ['Feeder channel', 'Brings rain water into the tank'], ['Tank bed', 'The floor where water and silt collect'],
    ], ['Think of the tank as a bowl with a gate and a safety overflow.', 'The bund is the wall.']),
    orderT('build', 'Order the steps in building a village tank.', ['Find a low place where water collects', 'Build the earthen bund', 'Fix the sluice for irrigation', 'Make the surplus weir', 'Link it to the next tank in the chain'], ['You need a site before a wall.', 'Linking to other tanks comes last.'], 'Site → bund → sluice → surplus weir → chain link.'),
    mcq('decline', 'Think about silt and Mission Kakatiya.', [
      ['Mission Kakatiya was started to…', 'restore village tanks', ['build new airports', 'dig deep borewells', 'build big factories'], 'Named after the tank-building kings.', 'Mission Kakatiya restores tanks by desilting and repairing them.'],
      ['Which is a reason many tanks declined?', 'Silt filled them and feeder channels were blocked', ['Too much rain every year', 'Tanks were made of gold', 'Fish drank all the water'], 'A shallow tank stores less.', 'Siltation and blocked channels reduced tank storage.'],
      ['Why were tanks especially important in Telangana?', 'Rain falls only for a few months and big rivers are far from most villages', ['It snows every winter', 'The state is next to the sea', 'There is no farming'], 'Water must be stored for the dry months.', 'Tanks store monsoon rain for use through the year.'],
      ['Which famous lake was built in the Kakatiya period?', 'Ramappa lake', ['Hussain Sagar', 'Osman Sagar', 'Chilika lake'], 'It is near the Ramappa temple.', 'Ramappa, Pakhal and Laknavaram lakes date from the Kakatiya period.'],
      ['Mission Kakatiya began in…', '2015', ['1947', '1956', '1991'], 'Soon after Telangana became a state (2014).', 'The programme began in 2015.'],
    ]),
  ]),
  O('ts7.ss.tanks.fishing', 'Fishing in tanks and fishermen\'s cooperatives', [
    h('Fish from the village tank'),
    photo('🐟', 'Fish such as rohu, catla and murrel are raised in tanks and sold in local markets.'),
    p('A tank gives more than water. When it is full after the monsoon, fish seedlings (fingerlings) are released into it. A few months later, as the water level drops, fishermen catch the grown fish. Communities such as the Gangaputras and Mudirajus have traditionally done this work.'),
    def('Cooperative society', 'A group of people who join together, pool their money and work, and share the benefits fairly among members.'),
    stepsB('Members of the fishermen\'s cooperative get the right to fish in the tank.', 'They buy fish seedlings, often with government support.', 'Seedlings are released when the tank fills.', 'Members guard and harvest the fish together.', 'Fish are sold and income is shared among members.'),
    p('Conflicts can arise: farmers want tank water released for crops, while fishermen want enough water to remain for the fish. Village meetings and rules help share the tank fairly.'),
    keys('Tanks support fishing as well as irrigation.', 'Cooperatives pool money and share profits.', 'Sharing water needs fair rules.'),
    remember('A cooperative is owned and run by its members, not by one owner.'),
  ], [
    ex('Why do fishermen release seedlings soon after the monsoon?', ['The tank is full after the rains.', 'Fish have months of water to grow in before the tank shrinks.'], 'Because the tank has the most water then.'),
    ex('How does a cooperative help a poor fisherman?', ['He alone may not afford seedlings or nets.', 'In a cooperative members pool money and share costs.', 'Profits are shared, and members can get loans and government help.'], 'Shared costs, fair share of income and easier access to support.'),
  ], [
    orderT('fish', 'Order the steps of fishing in a village tank.', ['The tank fills with monsoon rain', 'Fish seedlings are released', 'Fish grow for several months', 'Water level drops and fish are caught', 'Fish are sold and income is shared'], ['Water must come before fish.', 'Selling comes after catching.'], 'Fill → seedlings → growth → catch → sale and sharing.'),
    mcq('coop', 'A cooperative is owned by members.', [
      ['A cooperative society is…', 'a group that pools resources and shares benefits among members', ['a company owned by one rich person', 'a government office', 'a bank for foreigners'], 'Co-operate = work together.', 'Members pool money and work and share the gains.'],
      ['Small fish released into a tank are called…', 'fingerlings (seedlings)', ['catlas', 'nets', 'sluices'], 'They are finger-sized.', 'Young fish released into tanks are fingerlings.'],
      ['Why might farmers and fishermen disagree about a tank?', 'Farmers want water released for crops, fishermen want water kept for fish', ['Both want to drain it completely', 'Neither uses the tank', 'Fish eat crops'], 'Both depend on the same water.', 'Releasing water helps crops but leaves less water for the fish.'],
      ['Which of these is a fish commonly raised in Telangana tanks?', 'Rohu', ['Tuna', 'Salmon', 'Shark'], 'A freshwater carp.', 'Rohu, catla and murrel are common freshwater fish of tanks.'],
    ]),
    tapT('benefit', 'Tap the ways a village tank benefits people.', [
      ['Irrigation for crops', true], ['Drinking water for cattle', true], ['Fishing and income', true], ['Recharging groundwater', true], ['Silt that enriches fields', true],
      ['Producing petrol', false], ['Making iron ore', false],
    ], ['A tank stores water, fish and silt.', 'It cannot make minerals or fuel.'], 'Tanks give irrigation, water for animals, fish, groundwater recharge and fertile silt.'),
  ]),
  O('ts7.ss.tanks.ground', 'Groundwater: water table, recharge, quality and use', [
    h('The hidden water under our feet'),
    p('When rain falls, some soaks into the soil and moves down through cracks and spaces in rocks. It collects there as groundwater. Wells and borewells reach this water.'),
    def('Water table', 'The upper level of the soaked (saturated) zone under the ground. Below it, all spaces in the rock are filled with water.'),
    def('Aquifer', 'A layer of rock or sand with spaces and cracks that can store and give groundwater.'),
    def('Recharge', 'The refilling of groundwater by rain and water from tanks, rivers and fields soaking into the ground.'),
    p('Much of Telangana has hard rocks like granite. Water can be stored only in their cracks and weathered upper layers, so aquifers are thin and wells can dry up quickly when too many borewells pump water.'),
    stepsB('Rain soaks into the soil.', 'Water seeps down through cracks in rocks.', 'It fills the aquifer below the water table.', 'Wells and borewells pump it up.', 'If pumping is more than recharge, the water table falls.'),
    p('Groundwater quality matters too. In some areas, for example parts of Nalgonda district, groundwater had too much fluoride, which damages teeth and bones (fluorosis). Safe piped drinking water from surface sources is one solution.'),
    keys('Water table = top of the saturated zone.', 'Recharge with tanks, check dams and recharge pits.', 'Too much pumping makes the water table fall.'),
    remember('Use more than you recharge and the well dries; recharge more than you use and the water table rises.'),
  ], [
    ex('Why does the water level in a borewell drop in summer?', ['There is no rain to recharge the ground.', 'Pumping for crops and homes continues.', 'Use is greater than recharge, so the water table falls.'], 'Less recharge and more pumping lower the water table.'),
    ex('A village built a recharge pit next to its borewell. How does this help?', ['Rain water flowing over the land collects in the pit.', 'It soaks down into the aquifer.', 'The water table near the borewell rises.'], 'It increases recharge, so the borewell gets more water.'),
  ], [
    tapT('recharge', 'Tap the actions that help RECHARGE groundwater.', [
      ['Building check dams', true], ['Making rooftop rainwater pits', true], ['Desilting and filling village tanks', true], ['Planting trees', true],
      ['Covering all open ground with concrete', false], ['Digging many more borewells', false], ['Wasting water from open taps', false],
    ], ['Recharge means helping water soak in.', 'More pumping or sealing the ground does the opposite.'], 'Check dams, recharge pits, full tanks and trees help water soak into the ground.'),
    mcq('gw', 'Think of water soaking down into rock.', [
      ['The water table is…', 'the top level of the saturated zone underground', ['a table used to measure water', 'the bottom of the sea', 'a list of water prices'], 'Below it, rock spaces are full of water.', 'The water table is the upper surface of underground water.'],
      ['A rock layer that can store and give groundwater is an…', 'aquifer', ['atmosphere', 'archipelago', 'aqueduct'], 'Aqua = water.', 'An aquifer stores groundwater in its spaces and cracks.'],
      ['Too much fluoride in drinking water can cause…', 'fluorosis, damaging teeth and bones', ['stronger eyesight', 'more rain', 'faster plant growth'], 'This was a problem in parts of Nalgonda.', 'Excess fluoride causes fluorosis.'],
      ['Why do wells in hard-rock areas of Telangana dry up easily?', 'Water is stored only in cracks and thin weathered layers', ['The rocks are too soft', 'It rains every day', 'The sea is too close'], 'Granite has few spaces.', 'Hard rocks hold little water, so aquifers are thin.'],
      ['If pumping is more than recharge, the water table will…', 'fall', ['rise', 'stay the same', 'turn into a river'], 'Taking out more than goes in.', 'Over-use lowers the water table.'],
    ]),
    orderT('path', 'Order the journey of rain water to a borewell.', ['Rain falls on the land', 'Water soaks into the soil', 'Water seeps down through rock cracks', 'Water collects in the aquifer', 'A borewell pumps it up'], ['Start in the sky.', 'Pumping is the last step.'], 'Rain → soil → cracks → aquifer → borewell.'),
  ]),
]);

// =====================================================================================
// Chapter 4 — Oceans and Fishing
// =====================================================================================
const ch4 = U(4, 'Oceans and Fishing', [
  O('ts7.ss.ocean.relief', 'Ocean floor relief; waves, currents and tides', [
    h('The land under the sea'),
    photo('🌍', 'About 71% of the Earth\'s surface is covered by oceans.'),
    p('If you could drain the ocean, you would see mountains, plains and deep trenches, just like on land.'),
    stepsB('Continental shelf: the shallow, gently sloping edge of a continent under the sea; rich in fish.', 'Continental slope: a steep drop from the shelf into deep water.', 'Deep sea plain: a wide, flat ocean floor a few thousand metres deep.', 'Ocean trench: a long, narrow, very deep valley; the Mariana Trench in the Pacific is about 11 km deep.'),
    h('Moving water'),
    def('Waves', 'Rise and fall of the sea surface, mostly caused by wind blowing over the water.'),
    def('Ocean currents', 'Huge streams of water flowing in a fixed direction in the oceans. Warm currents flow from the equator towards the poles; cold currents flow towards the equator.'),
    def('Tides', 'The regular rise (high tide) and fall (low tide) of the sea level, caused mainly by the pull of the Moon (and Sun). Most coasts get two high tides and two low tides each day.'),
    keys('Shelf → slope → deep sea plain → trench.', 'Wind makes waves; currents are ocean rivers.', 'The Moon\'s pull causes tides.'),
    remember('Fishing is richest on the continental shelf, where shallow water lets sunlight in and plankton grow.'),
  ], [
    ex('Why are fishing boats more common on the continental shelf than over deep trenches?', ['The shelf is shallow, so sunlight reaches deep.', 'Plankton grow well, and fish feed on plankton.', 'Boats can also reach the shelf easily from the coast.'], 'The shallow shelf has plenty of fish and is close to the coast.'),
    ex('Fishermen leave the shore at high tide. Why?', ['At high tide the water is deeper near the shore.', 'Boats can move out without getting stuck on sand.'], 'Deeper water near the shore makes launching easier.'),
  ], [
    orderT('relief', 'Order the ocean floor features from the coast outwards into the deep sea.', ['Coast', 'Continental shelf', 'Continental slope', 'Deep sea plain', 'Ocean trench'], ['Shallow comes first.', 'The deepest feature comes last.'], 'Coast → shelf → slope → deep plain → trench.'),
    matchT('move', 'ocean feature with its cause or meaning', [
      ['Waves', 'Mainly caused by wind'], ['Tides', 'Mainly caused by the pull of the Moon'], ['Warm current', 'Flows from the equator towards the poles'], ['Cold current', 'Flows from the poles towards the equator'], ['Mariana Trench', 'Deepest part of the ocean, about 11 km'],
    ], ['Tides follow the Moon.', 'Warm water comes from near the equator.']),
    mcq('ocean', 'Recall shelf, slope, waves and tides.', [
      ['Tides are caused mainly by…', 'the pull of the Moon', ['wind', 'earthquakes', 'ships'], 'They rise and fall twice a day.', 'The Moon\'s gravity pulls on ocean water, causing tides.'],
      ['The shallow sea floor near the coast is the…', 'continental shelf', ['ocean trench', 'deep sea plain', 'mid-ocean ridge'], 'It is a shelf, like a ledge.', 'The continental shelf is the shallow edge of a continent.'],
      ['About how much of the Earth\'s surface is ocean?', 'About 71%', ['About 10%', 'About 50%', 'About 95%'], 'More than two-thirds.', 'Oceans cover about 71% of the surface.'],
      ['Most waves are made by…', 'wind blowing over the water', ['the Moon', 'fish swimming', 'rivers'], 'Stronger wind, bigger waves.', 'Wind transfers energy to the water surface.'],
      ['How many high tides do most coasts get in a day?', 'Two', ['One', 'Four', 'None'], 'About 12 hours apart.', 'Most coasts get two high tides and two low tides daily.'],
    ]),
  ]),
  O('ts7.ss.ocean.village', 'A fishing village on the coastal plains', [
    h('Life by the sea'),
    photo('⛵', 'Fishing boats along the east coast of India, from small catamarans to motor boats.'),
    p('Telangana has no coast, but much of the fish sold here comes from coastal villages of Andhra Pradesh and other states. Let us visit an imaginary fishing village on the east coast.'),
    def('Catamaran (teppa)', 'A traditional boat made by tying logs together; light and hard to sink.'),
    def('Trawler', 'A large motor boat that drags a big bag-shaped net along the sea to catch many fish.'),
    stepsB('Before dawn: fishermen check nets and boats and set out with the land breeze.', 'At sea: they spread nets (gill nets, drag nets, cast nets) where fish are found.', 'Afternoon: they return with the sea breeze; women and traders gather at the shore.', 'Fish are auctioned, dried, salted or packed in ice for markets.', 'Evening: nets are mended and dried for the next day.'),
    p('Small fishermen face problems: big trawlers catch huge amounts and damage the sea bed, fish catches fall when there is over-fishing, storms and cyclones are dangerous, and middlemen may pay low prices. A ban on fishing for about two months each year (during the breeding season) helps fish stocks recover.'),
    keys('Boats: catamaran, country boat, motor boat, trawler.', 'Nets: gill net, drag net, cast net.', 'Over-fishing and trawlers threaten small fishermen.'),
    remember('The fishing ban in the breeding season helps fish multiply so there are fish for the future.'),
  ], [
    ex('Why do fishermen go out before dawn and return in the afternoon?', ['In the early morning a land breeze blows from land to sea, helping boats go out.', 'By afternoon the sea breeze blows towards land, helping boats return.'], 'They use the land breeze to go out and the sea breeze to come back.'),
    ex('Why does the government ban fishing for about two months a year?', ['That is the breeding season.', 'Fish need time to lay eggs and grow.', 'Without the ban, fish numbers would fall sharply.'], 'To protect breeding fish so stocks recover.'),
  ], [
    orderT('day', 'Order a fisherman\'s day.', ['Check nets and boats before dawn', 'Sail out with the land breeze', 'Spread nets and catch fish', 'Return with the sea breeze', 'Sell or auction the catch', 'Mend and dry nets'], ['Preparation comes first.', 'Mending nets is the last job.'], 'Prepare → sail out → fish → return → sell → mend nets.'),
    mcq('boats', 'Think of small and big fishing boats.', [
      ['A boat made of logs tied together is a…', 'catamaran (teppa)', ['trawler', 'submarine', 'steamer'], 'Traditional and simple.', 'Catamarans are made of tied logs.'],
      ['Why are trawlers a problem for small fishermen?', 'They catch very large amounts and can damage the sea bed', ['They are too small', 'They catch no fish', 'They only sail on rivers'], 'Big nets dragged along the floor.', 'Trawlers over-fish and harm breeding grounds.'],
      ['The fishing ban each year is timed for the…', 'fish breeding season', ['festival season', 'school exams', 'mango season'], 'Let the fish multiply.', 'Stopping fishing while fish breed lets stocks recover.'],
      ['Fish are packed in ice to…', 'keep them fresh for distant markets', ['make them heavier', 'change their colour', 'make them grow'], 'Fish spoil quickly.', 'Ice slows spoiling during transport.'],
    ]),
    tapT('problems', 'Tap the problems faced by small coastal fishermen.', [
      ['Over-fishing by large trawlers', true], ['Cyclones and storms at sea', true], ['Low prices from middlemen', true], ['Falling fish catches', true],
      ['Too much snow on the beach', false], ['Fish growing on trees', false],
    ], ['Think of competition, weather and markets.', 'Ignore impossible options.'], 'Trawlers, storms, middlemen and falling catches all hurt small fishermen.'),
  ]),
  O('ts7.ss.ocean.coastlife', 'Agriculture, salinity, drinking water and social life on the coast', [
    h('Salt in the soil and water'),
    p('Coastal villages are not only about fishing. On coastal plains farmers grow paddy, coconut and cashew. But living near the sea brings a special problem: salt.'),
    def('Salinity', 'The amount of salt dissolved in water or soil. Sea water is salty; too much salt in soil or wells makes crops wilt and water undrinkable.'),
    stepsB('Sea water enters creeks and fields at high tide or during cyclones.', 'When too much groundwater is pumped near the coast, sea water seeps into the aquifer.', 'Wells become salty (saline).', 'Crops suffer and people must fetch drinking water from far away or depend on tankers or pipelines.'),
    p('Aquaculture (shrimp and fish farming in ponds) earns money but can make nearby land more salty if pond water is not managed well. Mangrove forests along creeks protect coasts from storm waves and are nurseries for fish.'),
    h('Social life'),
    p('Fishing families often live close together near the shore. Men usually go to sea, while women dry, sell and process fish. Village elders and community councils help settle disputes over fishing areas. Festivals for the sea goddess are common along the east coast.'),
    keys('Coastal farms: paddy, coconut, cashew.', 'Over-pumping lets sea water into wells (salinity).', 'Mangroves protect the coast.'),
    remember('Fresh water floats on top of salty groundwater near the coast; pumping too hard pulls salt water in.'),
  ], [
    ex('A coastal village dug many deep borewells. Soon the water tasted salty. Why?', ['Pumping lowered the fresh groundwater level.', 'Sea water from the side pushed into the aquifer.', 'The wells began drawing salty water.'], 'Over-pumping let sea water seep into the aquifer.'),
    ex('Why are mangroves called the coast\'s guards?', ['Their tangled roots slow down storm waves.', 'They hold soil and stop erosion.', 'Young fish shelter among the roots.'], 'They protect the coast and breed fish.'),
  ], [
    mcq('salt', 'Salt and fresh water near the sea.', [
      ['Salinity means…', 'the amount of salt dissolved in water or soil', ['the height of waves', 'the number of fish', 'the speed of wind'], 'Saline = salty.', 'Salinity measures dissolved salt.'],
      ['Why do coastal wells become salty when too much water is pumped?', 'Sea water seeps into the aquifer', ['Rain is salty', 'Fish add salt', 'Coconuts make it salty'], 'Fresh water level falls.', 'Over-pumping lets sea water move into the fresh-water layer.'],
      ['Which forests protect coasts from storm waves?', 'Mangroves', ['Pine forests', 'Deserts', 'Grasslands'], 'They grow in salty creeks.', 'Mangrove roots slow waves and protect the shore.'],
      ['Which crop is common on the coastal plains?', 'Coconut', ['Apple', 'Tea', 'Saffron'], 'It likes warm, humid coasts.', 'Coconut grows well on warm coastal plains.'],
    ]),
    tapT('coast', 'Tap the TRUE statements about coastal life.', [
      ['Women often dry and sell fish', true], ['Cyclones can push sea water onto fields', true], ['Mangroves are nurseries for fish', true], ['Shrimp ponds can increase salinity if badly managed', true],
      ['Sea water is good for watering paddy', false], ['Coastal people never face drinking-water problems', false],
    ], ['Salt harms crops and wells.', 'Think about the roles of women and mangroves.'], 'Fish processing, cyclone salinity, mangroves as nurseries and careless aquaculture are real features of coastal life.'),
    matchT('coastw', 'coastal word with its meaning', [
      ['Aquaculture', 'Raising fish or shrimp in ponds'], ['Mangroves', 'Salt-tolerant forests along creeks'], ['Saline well', 'A well with salty water'], ['Creek', 'A narrow inlet of the sea'], ['Auction', 'Selling to the highest bidder'],
    ], ['Aqua = water; culture = growing.', 'An auction has bidders.']),
  ]),
]);

// =====================================================================================
// Chapter 5 — Europe
// =====================================================================================
const ch5 = U(5, 'Europe', [
  O('ts7.ss.europe.land', 'Location and landforms of Europe', [
    h('A small, crowded continent'),
    photo('🗺️', 'Europe lies north-west of Asia; together they form one huge landmass called Eurasia.'),
    p('Europe is the second smallest continent but has many countries. It is joined to Asia; the Ural Mountains, the Ural River, the Caspian Sea and the Caucasus Mountains are taken as its eastern boundary. The Atlantic Ocean lies to the west, the Arctic Ocean to the north and the Mediterranean Sea to the south.'),
    stepsB('North-west highlands: old, worn-down mountains of Norway and Scotland.', 'Great European Plain: a huge, fertile lowland from France to Russia.', 'Central uplands: plateaus and low hills in Germany and France.', 'Alpine mountains in the south: the Alps, Pyrenees, Apennines, Carpathians and Caucasus.'),
    p('Big rivers flow across the plain: the Volga (Europe\'s longest, into the Caspian Sea), the Danube (flows through many countries into the Black Sea) and the Rhine (a busy waterway to the North Sea).'),
    h('Peninsulas, islands, bays and gulfs'),
    p('Europe\'s coastline is very broken, with many peninsulas: Scandinavian (Norway, Sweden), Iberian (Spain, Portugal), Italian (shaped like a boot) and Balkan. Islands include Great Britain, Ireland, Iceland and Sicily. The Bay of Biscay and the Gulf of Bothnia are important water bodies. A broken coast gives many natural harbours, which helped Europeans become sailors and traders.'),
    keys('Boundary with Asia: Urals, Caspian, Caucasus.', 'Plain in the middle; Alps in the south.', 'Peninsulas: Scandinavian, Iberian, Italian, Balkan.'),
    remember('The Volga is the longest river of Europe; the Danube flows through the most countries.'),
  ], [
    ex('Why did Europe\'s broken coastline help sea trade?', ['Many peninsulas and bays create sheltered natural harbours.', 'Most places are not far from the sea.', 'People learnt to build ships and sail.'], 'Many natural harbours and closeness to the sea.'),
    ex('Which mountains separate Europe from Asia?', ['Look at the east of Europe.', 'The Ural Mountains run north to south there.'], 'The Ural Mountains'),
  ], [
    matchT('pen', 'peninsula with its countries', [
      ['Scandinavian peninsula', 'Norway and Sweden'], ['Iberian peninsula', 'Spain and Portugal'], ['Italian peninsula', 'Italy (boot-shaped)'], ['Balkan peninsula', 'Greece and its neighbours'], ['Jutland peninsula', 'Denmark'],
    ], ['Iberia is the old name of Spain and Portugal.', 'Italy looks like a boot.']),
    mcq('eu', 'Picture Europe on the map.', [
      ['Which river is the longest in Europe?', 'Volga', ['Thames', 'Rhine', 'Seine'], 'It flows into the Caspian Sea.', 'The Volga is Europe\'s longest river.'],
      ['Which mountain range lies in southern Europe, across Switzerland, Austria and Italy?', 'The Alps', ['The Urals', 'The Himalayas', 'The Andes'], 'Famous for snowy peaks and skiing.', 'The Alps are the main young fold mountains of Europe.'],
      ['The large lowland from France to Russia is the…', 'Great European Plain', ['Deccan Plateau', 'Sahara', 'Great Rift Valley'], 'It is very fertile farmland.', 'The Great European Plain stretches across northern Europe.'],
      ['Which sea lies to the south of Europe?', 'The Mediterranean Sea', ['The Arabian Sea', 'The Bay of Bengal', 'The Caribbean Sea'], 'Between Europe and Africa.', 'The Mediterranean separates southern Europe from Africa.'],
      ['Which of these is an island of Europe?', 'Iceland', ['Sri Lanka', 'Madagascar', 'Java'], 'It is in the North Atlantic.', 'Iceland, Great Britain and Ireland are European islands.'],
    ]),
    tapT('rivers', 'Tap the rivers of EUROPE.', [
      ['Volga', true], ['Danube', true], ['Rhine', true], ['Thames', true],
      ['Godavari', false], ['Nile', false], ['Amazon', false], ['Congo', false],
    ], ['Two of the wrong ones are African; one is Indian; one is South American.', 'The Thames flows through London.'], 'Volga, Danube, Rhine and Thames are European rivers.'),
  ]),
  O('ts7.ss.europe.climate', 'Climate of Europe: westerlies, warm currents and the Mediterranean', [
    h('Why is London warmer than places at the same latitude in Canada?'),
    photo('🌬️', 'Westerly winds blowing off the Atlantic bring mild, moist air to western Europe.'),
    def('Westerlies', 'Winds that blow from the west (from the Atlantic Ocean) over Europe throughout the year. They bring rain and moderate the temperature.'),
    def('North Atlantic Drift', 'A warm ocean current that flows from the Gulf of Mexico across the Atlantic to the coasts of north-western Europe, keeping them warmer in winter and ports ice-free.'),
    stepsB('Western Europe (e.g. Britain, France): mild winters, cool summers, rain all year from the westerlies.', 'Eastern Europe (e.g. Russia): far from the sea, so very cold winters and warm summers; less rain.', 'Northern Europe: long, cold winters; short summers.', 'Mediterranean lands (Italy, Spain, Greece): hot, dry summers and mild, rainy winters.'),
    p('In the Mediterranean region, farmers grow olives, grapes (for raisins and wine), citrus fruits like oranges, and figs, which can survive the dry summer.'),
    keys('Westerlies + warm North Atlantic Drift = mild west.', 'Further east = more extreme (continental) climate.', 'Mediterranean: rain in winter, dry summer.'),
    remember('In Telangana it rains in summer (monsoon); in Mediterranean lands it rains in winter. Opposite seasons for rain!'),
  ], [
    ex('Why does Norway\'s coast have ice-free ports even though it is far north?', ['The warm North Atlantic Drift flows along it.', 'Warm water keeps the sea from freezing.'], 'Because of the warm North Atlantic Drift.'),
    ex('Moscow and Dublin are at similar latitudes, but Moscow is much colder in winter. Why?', ['Dublin is near the Atlantic, warmed by westerlies and the warm current.', 'Moscow is deep inside the continent, far from the sea\'s influence.'], 'Moscow is far from the sea; Dublin is close to it.'),
  ], [
    mcq('cl', 'Remember: wind from the ocean, warm current, distance from sea.', [
      ['Which winds bring rain to western Europe all year?', 'The westerlies', ['The monsoons', 'The trade winds', 'The loo'], 'They blow from the Atlantic.', 'The westerlies carry moist Atlantic air over Europe.'],
      ['The warm current that keeps north-western Europe mild is the…', 'North Atlantic Drift', ['Labrador current', 'Peru current', 'Benguela current'], 'It begins as the Gulf Stream.', 'The North Atlantic Drift brings warm water to Europe\'s west coast.'],
      ['Mediterranean climate has…', 'hot dry summers and mild rainy winters', ['rain all year and cold summers', 'snow all year', 'monsoon rain in summer'], 'Rain comes in winter.', 'Mediterranean lands get winter rain and dry summers.'],
      ['Which crop is typical of Mediterranean lands?', 'Olives', ['Jute', 'Tea', 'Rubber'], 'It survives dry summers.', 'Olives, grapes and citrus fruits suit the Mediterranean climate.'],
      ['Why are eastern European winters colder than western ones?', 'They are far from the moderating effect of the sea', ['They are closer to the equator', 'They have more ocean currents', 'They get the monsoon'], 'Distance from the sea matters.', 'Inland places have more extreme temperatures.'],
    ]),
    matchT('reg', 'region with its climate', [
      ['Western Europe', 'Mild winters, cool summers, rain all year'], ['Eastern Europe', 'Very cold winters, warm summers'], ['Mediterranean lands', 'Hot dry summers, mild wet winters'], ['Far north (Arctic)', 'Long, freezing winters'],
    ], ['The sea makes the west mild.', 'The Mediterranean has winter rain.']),
    tapT('med', 'Tap the crops that suit the Mediterranean climate.', [
      ['Olives', true], ['Grapes', true], ['Oranges', true], ['Figs', true],
      ['Rice needing summer floods', false], ['Tea', false], ['Jute', false],
    ], ['Summer is dry, so crops must survive drought.', 'Rice, tea and jute need lots of summer rain.'], 'Olives, grapes, oranges and figs survive dry summers.'),
  ]),
  O('ts7.ss.europe.agri', 'Agriculture, the agricultural revolution and new sea routes', [
    h('Changes on European farms'),
    p('Around 1700 most European farmers grew crops on open strips of land and left one field empty (fallow) each year to regain fertility. From the 1700s, especially in Britain, farming changed so much that it is called the agricultural revolution.'),
    stepsB('Crop rotation: growing turnips and clover in turn with wheat and barley, so no field needed to be left empty.', 'Enclosures: open fields and common lands were fenced into large private farms.', 'New tools: the seed drill (Jethro Tull) sowed seeds in neat rows.', 'Better breeding of cattle and sheep.', 'More food was produced with fewer workers; many small farmers lost land and moved to towns to work in factories.'),
    p('Today Europe has highly mechanised farms: wheat, barley, potatoes and sugar beet on the plains, dairy farming in the wet west, and fruits in the Mediterranean.'),
    h('Discovery of sea routes'),
    p('Europeans wanted Indian and Asian spices, cotton and silk, but the land routes were controlled by others. So they searched for sea routes. Columbus sailed west in 1492 and reached the Americas. Vasco da Gama sailed around Africa\'s southern tip and reached Calicut (Kozhikode) in India in 1498. These voyages led to trade, and later to European colonies in Asia, Africa and the Americas.'),
    keys('Agricultural revolution: rotation, enclosures, seed drill.', 'Columbus 1492; Vasco da Gama reached India 1498.', 'Sea routes led to trade and colonies.'),
    remember('Vasco da Gama\'s route went round the Cape of Good Hope at the southern tip of Africa.'),
  ], [
    ex('How did crop rotation increase food production?', ['Earlier one field lay empty each year.', 'Clover and turnips restored the soil and fed animals.', 'All fields could now be used every year.'], 'No land was left fallow, so more was grown.'),
    ex('How many years after Columbus\'s voyage did Vasco da Gama reach India?', ['Columbus: 1492.', 'Vasco da Gama: 1498.', '1498 − 1492 = 6.'], '6 years'),
  ], [
    orderT('route', 'Order Vasco da Gama\'s voyage from Portugal to India.', ['Leaves Lisbon in Portugal', 'Sails south along the west coast of Africa', 'Rounds the Cape of Good Hope', 'Sails up the east coast of Africa', 'Crosses the Arabian Sea to Calicut'], ['He went round Africa.', 'India is the final stop.'], 'Lisbon → west Africa → Cape of Good Hope → east Africa → Calicut.'),
    mcq('agrev', 'Think of new methods in British farming.', [
      ['Which change meant fields no longer had to be left empty?', 'Crop rotation with turnips and clover', ['Using bullock carts', 'Planting only wheat every year', 'Burning forests'], 'These crops restored the soil.', 'Rotation with soil-restoring crops ended the need for fallow land.'],
      ['Who invented the seed drill?', 'Jethro Tull', ['James Watt', 'Columbus', 'Vasco da Gama'], 'An English farmer.', 'Jethro Tull\'s seed drill sowed seeds in rows.'],
      ['Enclosures meant…', 'fencing open and common land into private farms', ['opening all farms to everyone', 'closing all farms', 'building cities on farms'], 'Enclose = fence in.', 'Large private farms replaced open strips and commons.'],
      ['Vasco da Gama reached India at…', 'Calicut (Kozhikode)', ['Hyderabad', 'Kolkata', 'Delhi'], 'A port on the Malabar coast.', 'He landed at Calicut in 1498.'],
      ['Why did Europeans look for sea routes to Asia?', 'To trade directly in spices, cotton and silk', ['To find snow', 'To escape the westerlies', 'To build railways'], 'Spices were very valuable.', 'Direct sea routes gave them trade without middlemen on land routes.'],
    ]),
    yearsT('yrs', [
      ['Columbus reached the Americas', 1492, 'Vasco da Gama reached Calicut', 1498],
      ['Vasco da Gama reached Calicut', 1498, 'the English East India Company was formed', 1600],
      ['Jethro Tull developed his seed drill', 1701, 'James Watt patented his improved steam engine', 1769],
      ['Columbus reached the Americas', 1492, 'the English East India Company was formed', 1600],
      ['Vasco da Gama reached Calicut', 1498, 'the Battle of Plassey was fought', 1757],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 6 — Africa
// =====================================================================================
const ch6 = U(6, 'Africa', [
  O('ts7.ss.africa.land', 'Africa: a vast plateau, its climate and rainfall regions', [
    h('The plateau continent'),
    photo('🦒', 'Savanna grasslands of Africa are home to giraffes, zebras, elephants and lions.'),
    p('Africa is the second largest continent. Most of it is a high plateau with narrow coastal plains. The Equator passes almost through its middle, so the climate zones on either side are like mirror images.'),
    stepsB('Equatorial region (Congo basin): hot and rainy all year; dense tropical rainforests.', 'Savanna on both sides: tall grass with scattered trees; a wet season and a dry season.', 'Hot deserts: the Sahara in the north (the world\'s largest hot desert) and the Kalahari in the south; very little rain.', 'Mediterranean strips at the far north and far south tips: dry summers, winter rain.'),
    p('Great rivers: the Nile (the world\'s longest river, flowing north into the Mediterranean), the Congo, the Niger and the Zambezi (with the Victoria Falls). The Great Rift Valley in the east has deep lakes such as Lake Tanganyika. Mount Kilimanjaro is Africa\'s highest peak.'),
    keys('Africa is mostly plateau.', 'Equator in the middle: rainforest → savanna → desert on both sides.', 'Nile: longest river; Sahara: largest hot desert.'),
    remember('The Equator, the Tropic of Cancer and the Tropic of Capricorn all pass through Africa.'),
  ], [
    ex('Why do rivers in Africa have many waterfalls?', ['Most of Africa is a high plateau.', 'Rivers drop steeply from the plateau edge to the coastal plains.'], 'They fall from the high plateau to the low coast.'),
    ex('Moving north from the Congo basin to the Sahara, which regions do you cross?', ['Start at the equatorial rainforest.', 'Then savanna grassland.', 'Then the dry Sahara desert.'], 'Rainforest → savanna → desert'),
  ], [
    orderT('zones', 'Order the regions from the Equator northwards in Africa.', ['Equatorial rainforest', 'Savanna grassland', 'Sahara desert', 'Mediterranean coast'], ['Rain decreases as you go away from the Equator.', 'The Mediterranean strip is at the very north.'], 'Rainforest → savanna → Sahara → Mediterranean coast.', 4),
    mcq('af', 'Picture the map of Africa.', [
      ['Which is the world\'s longest river?', 'The Nile', ['The Congo', 'The Niger', 'The Zambezi'], 'It flows north into the Mediterranean.', 'The Nile is the longest river in the world.'],
      ['The largest hot desert in the world is the…', 'Sahara', ['Kalahari', 'Thar', 'Gobi'], 'It covers much of North Africa.', 'The Sahara is the world\'s largest hot desert.'],
      ['Which region has rain all year and dense forests?', 'The equatorial region (Congo basin)', ['The Sahara', 'The Kalahari', 'The Mediterranean coast'], 'Near the Equator.', 'The equatorial Congo basin is hot and wet all year.'],
      ['Most of Africa is…', 'a plateau', ['below sea level', 'covered with ice', 'a narrow island'], 'Its rivers have many waterfalls.', 'Africa is largely a high plateau.'],
      ['Africa\'s highest mountain is…', 'Kilimanjaro', ['Everest', 'Alps', 'Atlas'], 'In Tanzania, near the Equator, with snow on top.', 'Mount Kilimanjaro is the highest peak in Africa.'],
    ]),
    matchT('feat', 'feature with its description', [
      ['Sahara', 'Largest hot desert'], ['Kalahari', 'Desert in southern Africa'], ['Nile', 'World\'s longest river'], ['Congo basin', 'Equatorial rainforest'], ['Savanna', 'Tall grassland with scattered trees'], ['Victoria Falls', 'Famous waterfall on the Zambezi'],
    ], ['One desert is north, one is south.', 'The Zambezi has the waterfall.']),
  ]),
  O('ts7.ss.africa.people', 'People of Africa and the slave trade', [
    h('Many peoples, many ways of life'),
    p('Africa is home to hundreds of peoples speaking over a thousand languages. Ancient Egypt on the Nile built pyramids; kingdoms like Ghana, Mali and Great Zimbabwe were rich in gold and trade. People lived as farmers, herders (like the Maasai with their cattle), hunters and gatherers (like the San of the Kalahari) and traders.'),
    h('The Atlantic slave trade'),
    p('From the 1500s to the 1800s, European traders bought and captured millions of Africans and shipped them across the Atlantic Ocean to work as slaves on plantations of sugar, cotton and tobacco in the Americas.'),
    stepsB('European ships sailed to West Africa with cloth, guns and other goods.', 'These were exchanged for captured Africans.', 'Captives were chained in crowded ships across the Atlantic (the "Middle Passage"); many died.', 'In the Americas they were sold to plantation owners and forced to work without pay.', 'Sugar, cotton and tobacco from the plantations were shipped back to Europe and sold for profit.'),
    p('This "triangular trade" made European traders rich but caused terrible suffering and took away millions of young people from Africa. People in Africa and the Americas resisted, and reformers campaigned until the slave trade and slavery were abolished in the 1800s.'),
    keys('Africa has a long history of great kingdoms.', 'Atlantic slave trade: 1500s–1800s.', 'Triangle: Europe → Africa → Americas → Europe.'),
    remember('Slavery treated human beings as property. It is a crime against humanity and is banned everywhere today.'),
  ], [
    ex('Why is the slave trade called the triangular trade?', ['Ships went Europe → West Africa (goods for captives).', 'Then Africa → Americas (captives sold).', 'Then Americas → Europe (sugar, cotton, tobacco).', 'Three sides make a triangle.'], 'Its route had three legs forming a triangle.'),
    ex('How did the slave trade harm Africa itself?', ['Millions of young, strong people were taken away.', 'Wars to capture people increased.', 'Farming, crafts and families suffered.'], 'It robbed Africa of its people and caused wars and suffering.'),
  ], [
    orderT('tri', 'Order the stages of the triangular trade.', ['Ships leave Europe with cloth and guns', 'Goods are exchanged for captives in West Africa', 'Captives are shipped across the Atlantic', 'Captives are sold to plantation owners in the Americas', 'Sugar, cotton and tobacco are shipped to Europe'], ['It begins and ends in Europe.', 'The sea crossing comes before the sale.'], 'Europe → Africa → Atlantic crossing → Americas → back to Europe.'),
    mcq('slave', 'Think about who profited and who suffered.', [
      ['Enslaved Africans were mostly taken to work on…', 'plantations in the Americas', ['factories in Africa', 'tea gardens in India', 'farms in Iceland'], 'Sugar, cotton, tobacco.', 'They were forced to work on American plantations.'],
      ['The Atlantic slave trade lasted roughly from…', 'the 1500s to the 1800s', ['the 100s to the 300s', 'the 1950s to the 2000s', 'only one year'], 'About three centuries.', 'It ran from the 1500s until it was abolished in the 1800s.'],
      ['The Maasai of East Africa are known as…', 'cattle herders', ['deep-sea fishermen', 'factory workers', 'desert miners'], 'Their wealth is counted in cattle.', 'The Maasai are herders.'],
      ['Which ancient civilisation built pyramids beside the Nile?', 'Egypt', ['Mali', 'Kalahari', 'Congo'], 'Pharaohs ruled it.', 'Ancient Egypt built the pyramids.'],
      ['The sea crossing of enslaved people was called the…', 'Middle Passage', ['Silk Road', 'Grand Trunk Road', 'Cape Route'], 'The middle leg of the triangle.', 'The Atlantic crossing was the Middle Passage.'],
    ]),
    tapT('true', 'Tap the TRUE statements.', [
      ['Africa had rich kingdoms like Mali and Great Zimbabwe', true], ['Millions of Africans died or suffered in the slave trade', true], ['Slavery is banned everywhere today', true], ['Africans resisted slavery', true],
      ['Africa had no history before Europeans came', false], ['Enslaved people were paid good wages', false],
    ], ['Africa\'s history is long and rich.', 'Slaves were not paid.'], 'African kingdoms, the suffering of the slave trade, resistance and its abolition are all facts.'),
  ]),
  O('ts7.ss.africa.colonies', 'European colonies, plantations in Nigeria and independent Africa', [
    h('Africa divided'),
    p('In the late 1800s European powers rushed to grab African land. At the Berlin Conference (1884–85) they divided Africa among themselves, drawing straight-line borders without asking Africans. By 1914 almost all of Africa except Ethiopia and Liberia was under European rule.'),
    def('Colony', 'A region ruled by a foreign country that takes its resources and controls its government.'),
    def('Plantation', 'A large estate growing one cash crop for sale abroad, using many workers.'),
    h('Plantations in Nigeria'),
    p('In Nigeria (a British colony) farmers were pushed to grow cocoa, oil palm, groundnuts and rubber for export to Europe, instead of food crops. Africans earned little; profits went to European companies. Mines took gold, copper and diamonds elsewhere in Africa.'),
    stepsB('Late 1800s: Europeans take control of most of Africa.', 'Colonial rule: cash crops, mines, forced labour, taxes.', 'Africans form freedom movements after the Second World War.', 'Ghana becomes independent in 1957, the first in sub-Saharan Africa.', 'Most African countries become free in the 1960s; apartheid in South Africa ends in 1994 with Nelson Mandela as president.'),
    p('Independent African countries face challenges such as poverty and borders that cut across communities, but they also have growing cities, young populations and rich resources.'),
    keys('Berlin Conference 1884–85 divided Africa.', 'Nigeria: cocoa, palm oil, groundnuts for export.', 'Ghana free in 1957; most nations in the 1960s.'),
    remember('Like India, Africa won freedom from European rule in the 20th century.'),
  ], [
    ex('Why did colonial plantations in Nigeria grow cocoa instead of food crops?', ['Europeans wanted cocoa and palm oil for their factories and markets.', 'Colonial rulers pushed farmers to grow export crops.'], 'To supply European industries and earn profits for Europeans.'),
    ex('How many years after the Berlin Conference (1884) did Ghana become independent (1957)?', ['1957 − 1884.', '= 73.'], '73 years'),
  ], [
    orderT('col', 'Order these events in African history.', ['The Atlantic slave trade begins', 'Berlin Conference divides Africa', 'Ghana becomes independent', 'Many African countries become free in the 1960s', 'Apartheid ends in South Africa'], ['Slave trade began in the 1500s.', 'Apartheid ended in 1994.'], 'Slave trade → Berlin Conference → Ghana 1957 → 1960s freedom → end of apartheid 1994.'),
    mcq('colq', 'Think of colonial rule and freedom.', [
      ['At the Berlin Conference (1884–85), European powers…', 'divided Africa among themselves', ['gave Africa independence', 'ended the slave trade', 'built the Suez Canal'], 'They drew borders on maps.', 'European powers split Africa between them.'],
      ['Which crop was grown on plantations in colonial Nigeria for export?', 'Cocoa', ['Wheat', 'Apples', 'Saffron'], 'Used to make chocolate.', 'Cocoa, palm oil and groundnuts were export crops.'],
      ['Which was the first sub-Saharan African country to become independent (1957)?', 'Ghana', ['Nigeria', 'Kenya', 'South Africa'], 'It was once called the Gold Coast.', 'Ghana became free in 1957.'],
      ['Which two African countries stayed free of colonial rule by 1914?', 'Ethiopia and Liberia', ['Nigeria and Kenya', 'Egypt and Ghana', 'Congo and Angola'], 'One defeated Italy in 1896.', 'Ethiopia and Liberia remained independent.'],
      ['Who became South Africa\'s president when apartheid ended in 1994?', 'Nelson Mandela', ['Mahatma Gandhi', 'Kwame Nkrumah', 'Vasco da Gama'], 'He had spent 27 years in prison.', 'Nelson Mandela led the struggle against apartheid.'],
    ]),
    yearsT('yrs', [
      ['The Berlin Conference began dividing Africa', 1884, 'Ghana became independent', 1957],
      ['Ghana became independent', 1957, 'apartheid ended in South Africa', 1994],
      ['India became independent', 1947, 'Ghana became independent', 1957],
      ['Vasco da Gama sailed round Africa', 1498, 'the Berlin Conference began', 1884],
      ['Nigeria became independent', 1960, 'apartheid ended in South Africa', 1994],
    ]),
  ]),
]);

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6];
