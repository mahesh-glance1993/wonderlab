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

// =====================================================================================
// Theme II — Production, Exchange and Livelihoods
// Chapter 7 — Handicrafts and Handlooms
// =====================================================================================
const ch7 = U(7, 'Handicrafts and Handlooms', [
  O('ts7.ss.craft.basket', 'Basket makers: a handicraft in the city', [
    h('Skilled hands, small earnings'),
    photo('🧺', 'Bamboo baskets, mats and winnowing fans are made by hand in many towns of Telangana.'),
    p('In a basti (slum) of a Telangana town, a family of basket makers sits outside their small house splitting bamboo. Communities like the Medari have practised this craft for generations, making baskets, mats, winnowing fans (chata), flower baskets and bird cages.'),
    def('Handicraft', 'An article made mainly by hand, with simple tools, by skilled craftspeople, usually at home or in a small workshop.'),
    stepsB('Buy bamboo from the forest department depot or a trader.', 'Split the bamboo into thin strips with a knife.', 'Soak and smooth the strips so they bend without breaking.', 'Weave the strips into baskets and mats; some are dyed in colours.', 'Sell to shopkeepers, at weekly markets (santa) or to traders who supply cities.'),
    p('Problems: bamboo has become costly and hard to get; cheap plastic baskets and buckets compete with bamboo goods; traders pay low prices; the family has little space, no savings and often borrows money at high interest. Whole families, including children, work long hours.'),
    keys('Handicrafts are made by hand with simple tools.', 'Bamboo is the main raw material for basket makers.', 'Problems: raw material cost, plastic competition, low prices, debt.'),
    remember('Buying handmade bamboo products instead of plastic supports craftspeople and is better for the environment.'),
  ], [
    ex('Why have earnings of basket makers fallen?', ['Bamboo costs more and is harder to get.', 'Plastic goods are cheap and long-lasting, so fewer people buy bamboo baskets.', 'Traders keep a large share of the price.'], 'Costly raw material, plastic competition and low prices from traders.'),
    ex('How could a basket makers\' cooperative help?', ['Members together can buy bamboo in bulk at lower prices.', 'They can sell directly at exhibitions or online, cutting out middlemen.', 'They can get bank loans instead of costly private loans.'], 'Cheaper raw material, better prices and easier credit.'),
  ], [
    orderT('steps', 'Order the steps in making a bamboo basket.', ['Buy bamboo from a depot or trader', 'Split bamboo into thin strips', 'Soak and smooth the strips', 'Weave the basket', 'Sell it at the market'], ['You need bamboo before you can split it.', 'Selling is last.'], 'Buy → split → soak → weave → sell.'),
    mcq('bas', 'Think of the craft and its problems.', [
      ['The main raw material of basket makers is…', 'bamboo', ['cotton', 'iron', 'plastic'], 'It is split into strips.', 'Basket makers split and weave bamboo.'],
      ['Which is a major competitor of bamboo baskets today?', 'Cheap plastic goods', ['Silk saris', 'Iron ploughs', 'Clay pots only'], 'Buckets and tubs in bright colours.', 'Plastic baskets and tubs are cheaper and replace bamboo goods.'],
      ['A handicraft is an item made…', 'mainly by hand with simple tools', ['entirely by big machines', 'only in foreign countries', 'only by the government'], 'Hand + craft.', 'Handicrafts rely on skilled hand work.'],
      ['Why do many basket-making families fall into debt?', 'Low earnings force them to borrow at high interest', ['They earn too much', 'Banks give them free money', 'They never buy raw material'], 'Little savings, irregular income.', 'With low and irregular earnings they borrow from moneylenders.'],
    ]),
    tapT('prob', 'Tap the problems faced by urban basket makers.', [
      ['Bamboo is costly and scarce', true], ['Competition from plastic goods', true], ['Low prices paid by traders', true], ['Crowded living space', true], ['Borrowing at high interest', true],
      ['Too many orders from abroad', false], ['Free bamboo delivered every day', false],
    ], ['Think of raw material, market and living conditions.', 'Two options are the opposite of reality.'], 'Raw-material costs, plastic, low prices, crowding and debt are real problems.'),
  ]),
  O('ts7.ss.craft.pochampally', 'Handloom weavers of Pochampally: dyeing, warp and weft', [
    h('The famous ikat of Pochampally'),
    photo('🎨', 'Pochampally ikat saris are known for bold geometric patterns made by tie-and-dye before weaving.'),
    p('Bhoodan Pochampally, in Yadadri Bhuvanagiri district, is famous for ikat (tie-and-dye) saris and fabrics in cotton and silk. Pochampally ikat has a Geographical Indication (GI) tag, which means only genuine products from this area can use the name. Koyalagudem, Puttapaka and other villages nearby are also weaving centres.'),
    def('Warp', 'The threads stretched lengthwise on the loom.'),
    def('Weft', 'The threads that go across, over and under the warp threads, to make cloth.'),
    def('Ikat (tie-and-dye)', 'A method in which bundles of yarn are tied tightly in places and then dyed. The tied parts stay undyed, so the pattern is already in the yarn before it is woven.'),
    stepsB('Buy cotton or silk yarn and wash (degum) it.', 'Draw the design and tie parts of the yarn with rubber or thread.', 'Dip the yarn in dye; untie and retie for more colours.', 'Wind the dyed yarn onto bobbins; set up the warp on the loom.', 'Weave the weft across the warp on a pit loom; the pattern appears.', 'Fold and sell the finished saris.'),
    keys('Pochampally ikat: tie-and-dye before weaving.', 'Warp = lengthwise; weft = across.', 'Pochampally ikat has a GI tag.'),
    remember('In ikat, the yarn is patterned BEFORE weaving; in block printing, finished cloth is printed AFTER weaving.'),
  ], [
    ex('In weaving, which threads are fixed on the loom first: warp or weft?', ['The loom holds long threads stretched tight.', 'These lengthwise threads are the warp.', 'The weft is passed across them afterwards.'], 'The warp'),
    ex('Why does tying the yarn before dyeing create a pattern?', ['Dye cannot enter the tightly tied parts.', 'Those parts keep their old colour.', 'When woven, the coloured and uncoloured parts line up to form designs.'], 'Tied parts resist dye, leaving a design in the yarn.'),
  ], [
    orderT('ikat', 'Order the steps of making a Pochampally ikat sari.', ['Wash the yarn', 'Tie parts of the yarn according to the design', 'Dye the yarn', 'Set up the warp on the loom', 'Weave the weft across the warp'], ['Tying comes before dyeing.', 'Weaving is last.'], 'Wash → tie → dye → set warp → weave.'),
    matchT('weave', 'weaving word with its meaning', [
      ['Warp', 'Lengthwise threads on the loom'], ['Weft', 'Threads passed across the warp'], ['Ikat', 'Tie-and-dye of yarn before weaving'], ['Pit loom', 'Hand loom set over a pit for the weaver\'s legs'], ['GI tag', 'Label showing a product comes from a specific place'],
    ], ['Warp goes the long way.', 'GI = Geographical Indication.']),
    mcq('poch', 'Think of Pochampally and ikat.', [
      ['Pochampally is in which district of Telangana?', 'Yadadri Bhuvanagiri', ['Adilabad', 'Khammam', 'Nizamabad'], 'Close to Hyderabad, on the east side.', 'Bhoodan Pochampally is in Yadadri Bhuvanagiri district.'],
      ['In ikat weaving, the pattern is made…', 'by tying and dyeing the yarn before weaving', ['by printing on finished cloth', 'by painting with a brush after weaving', 'by machine embroidery'], 'The design is in the yarn.', 'Ikat yarn is tie-dyed before weaving.'],
      ['The threads passed across the loom are the…', 'weft', ['warp', 'bobbin', 'pit'], 'W-e-f-t goes left-right.', 'Weft threads cross over and under the warp.'],
      ['A GI tag on Pochampally ikat means…', 'only genuine products from this region can use the name', ['it is made in a factory abroad', 'it is free of cost', 'it is made of plastic'], 'G = geography.', 'A Geographical Indication protects products linked to a place.'],
      ['Why is the village called "Bhoodan" Pochampally?', 'The Bhoodan (land gift) movement of Vinoba Bhave began here in 1951', ['It grows only bhoodan rice', 'A king named Bhoodan built it', 'It is on the Bhoodan river'], 'Bhoodan = gift of land.', 'Vinoba Bhave received the first land gift here in 1951.'],
    ]),
  ]),
  O('ts7.ss.craft.coop', 'Problems of weavers and weavers\' cooperatives', [
    h('Why is weaving hard to live on?'),
    p('A handloom sari may take a weaver several days. Yet weavers often earn little. Many work for a master weaver or trader who gives them yarn and pays them a wage for each piece.'),
    stepsB('Yarn and dye prices go up, but sari prices do not rise as much.', 'Power looms and mills make similar-looking cloth faster and cheaper.', 'Master weavers and traders take a large share of the profit.', 'Weavers lack money to buy yarn, so they borrow and fall into debt.', 'Young people leave weaving for other jobs, and skills may be lost.'),
    def('Weavers\' cooperative society', 'A society owned by weavers themselves. It buys yarn in bulk, gives it to members, collects the cloth, sells it (for example through government handloom shops) and shares the profits.'),
    p('The government supports handloom weavers through cooperatives, the handloom marketing body (TGCO, earlier APCO), subsidies on yarn, health insurance, exhibitions and schemes such as savings and thrift funds. Sales through government outlets, exhibitions and online platforms help weavers reach customers directly.'),
    keys('Weavers face costly yarn, power-loom competition and middlemen.', 'Cooperatives are owned by weavers and share profits.', 'Government aid: subsidies, marketing, insurance.'),
    remember('Wearing handloom supports lakhs of weaver families. 7 August is celebrated as National Handloom Day.'),
  ], [
    ex('How is a weaver working for a master weaver different from one in a cooperative?', ['A master weaver supplies yarn and pays a fixed wage per piece; he keeps the profit.', 'In a cooperative, weavers are the owners; profits are shared among them.'], 'In a cooperative the weavers share the profit; with a master weaver they get only wages.'),
    ex('Why can a power loom sell cloth more cheaply than a handloom?', ['A power loom runs on electricity and weaves much faster.', 'More cloth in less time means lower cost per metre.'], 'It produces far more cloth in less time.'),
  ], [
    tapT('weav', 'Tap the problems of handloom weavers.', [
      ['Rising price of yarn', true], ['Competition from power looms', true], ['Middlemen taking most of the profit', true], ['Debt to buy raw material', true],
      ['Too much free yarn from traders', false], ['Handloom saris cost nothing to make', false],
    ], ['Think: raw material, competition, middlemen, money.', 'Two options are clearly false.'], 'Yarn prices, power-loom competition, middlemen and debt hurt weavers.'),
    mcq('coopq', 'A cooperative is owned by its members.', [
      ['A weavers\' cooperative is owned by…', 'the weavers who are its members', ['one rich trader', 'a foreign company', 'the bank'], 'Co-operate.', 'Members own and run the cooperative.'],
      ['National Handloom Day is celebrated on…', '7 August', ['15 August', '2 October', '26 January'], 'It recalls the Swadeshi movement of 1905.', '7 August is National Handloom Day.'],
      ['How does a cooperative get yarn more cheaply?', 'By buying in bulk for all members', ['By stealing it', 'By making it from plastic', 'By paying more per kilo'], 'Big orders get lower prices.', 'Bulk buying lowers the price for each member.'],
      ['Why are young people in weaving families leaving the craft?', 'Earnings are low and uncertain', ['Weaving is banned', 'There is no cotton in India', 'Looms are too small'], 'They look for steadier jobs.', 'Low, uncertain earnings push youth to other work.'],
    ]),
    matchT('who', 'person or body with their role', [
      ['Weaver', 'Weaves cloth on the loom'], ['Master weaver', 'Gives yarn and pays wages per piece'], ['Cooperative society', 'Owned by weavers; shares profits'], ['Government handloom outlet', 'Sells handloom cloth to customers'], ['Dyer', 'Colours the yarn'],
    ], ['Who owns what?', 'The outlet is a shop.']),
  ]),
]);

// =====================================================================================
// Chapter 8 — Industrial Revolution
// =====================================================================================
const ch8 = U(8, 'Industrial Revolution', [
  O('ts7.ss.indrev.begin', 'The beginning of the Industrial Revolution (1750–1850)', [
    h('From hand to machine'),
    photo('⚙️', 'Machines driven by water wheels and steam engines changed how goods were made.'),
    p('Before 1750, cloth in Britain was spun and woven by hand at home. Between about 1750 and 1850, new machines and new sources of power changed production so much that historians call it the Industrial Revolution. It began in Britain and spread to Europe, America and the world.'),
    stepsB('1764: James Hargreaves\' spinning jenny lets one worker spin many threads at once.', '1769: Richard Arkwright\'s water frame spins strong thread using water power.', '1769: James Watt patents an improved steam engine that wastes far less fuel.', '1785: Edmund Cartwright\'s power loom weaves cloth by machine.', '1800s: steam engines run factories, railways and ships.'),
    def('Steam engine', 'A machine that burns fuel (coal) to boil water; the steam pushes a piston to produce motion. James Watt\'s improvements made it efficient enough to drive factory machines.'),
    p('Why Britain? It had coal and iron close together, money from trade and colonies (including India), a large market abroad, rivers and ports, and inventors and investors willing to try new methods.'),
    keys('Industrial Revolution: about 1750–1850, began in Britain.', 'Key machines: spinning jenny, water frame, power loom, steam engine.', 'James Watt improved the steam engine.'),
    remember('The Industrial Revolution changed not just machines but where people lived and how they worked.'),
  ], [
    ex('Why was James Watt\'s steam engine so important?', ['Earlier engines wasted a lot of fuel.', 'Watt\'s engine used much less coal for the same work.', 'Factories could now be built anywhere, not only beside rivers.'], 'It made steam power efficient, freeing factories from rivers.'),
    ex('How many years passed between the spinning jenny (1764) and the power loom (1785)?', ['1785 − 1764 = 21.'], '21 years'),
  ], [
    orderT('inv', 'Order these inventions by date (earliest first).', ['Spinning jenny (1764)', 'Watt\'s improved steam engine patent (1769)', 'Power loom (1785)', 'Stephenson\'s Rocket locomotive (1829)', 'First passenger train in India (1853)'], ['Spinning came before weaving machines.', 'Railways came last.'], 'Jenny 1764 → Watt 1769 → power loom 1785 → Rocket 1829 → India\'s train 1853.'),
    matchT('inventor', 'inventor with the invention', [
      ['James Hargreaves', 'Spinning jenny'], ['Richard Arkwright', 'Water frame'], ['James Watt', 'Improved steam engine'], ['Edmund Cartwright', 'Power loom'], ['George Stephenson', 'Rocket locomotive'],
    ], ['Watt is linked to steam.', 'Stephenson built locomotives.']),
    mcq('why', 'Think of resources and money.', [
      ['The Industrial Revolution began in…', 'Britain', ['India', 'China', 'Brazil'], 'It had coal and iron.', 'It began in Britain around 1750.'],
      ['Which TWO resources helped Britain most?', 'Coal and iron', ['Gold and silver', 'Cotton and jute grown in Britain', 'Tea and coffee'], 'Fuel and metal for machines.', 'Coal fuelled engines; iron built machines.'],
      ['The spinning jenny allowed one worker to…', 'spin many threads at once', ['weave silk by hand', 'run a railway', 'mine coal'], 'Many spindles on one machine.', 'It multiplied a spinner\'s output.'],
      ['Steam engines made factories free from rivers because…', 'they did not need water wheels for power', ['they floated', 'they used wind', 'they needed no fuel'], 'Before steam, mills used water power.', 'Steam power could be produced anywhere coal reached.'],
    ]),
  ]),
  O('ts7.ss.indrev.factory', 'The factory system and child workers', [
    h('Life in the factory'),
    p('Before factories, spinners and weavers worked at home, at their own pace, with family. In the factory system, hundreds of workers gathered in one building with big machines owned by a factory owner, and worked to the factory clock.'),
    def('Factory system', 'A way of producing goods in which workers come to a large building, use machines owned by an employer and are paid wages for fixed hours.'),
    stepsB('Workers lose control over tools and time; the bell and the clock set the day.', 'Working days of 12–16 hours, six days a week, were common.', 'Workplaces were noisy, dusty and dangerous; accidents with machines were frequent.', 'Towns like Manchester grew fast; workers lived in crowded, dirty slums.', 'Children as young as 6–8 worked in mills and mines because they were paid less and could crawl under machines.'),
    p('Reformers, writers and workers protested. Britain passed Factory Acts (for example in 1833) that banned work by very young children and limited hours for older children. Workers formed trade unions to demand better wages and conditions. Today, child labour is banned in India too, and every child has the right to free education up to age 14.'),
    keys('Factory: machines, wages, fixed hours, owner controls.', 'Child labour was common in early factories.', 'Factory Acts and trade unions improved conditions.'),
    remember('In India, the Right to Education Act (2009) makes education free and compulsory for children aged 6–14.'),
  ], [
    ex('Why did factory owners employ children?', ['Children were paid much lower wages.', 'They were small enough to crawl under machines to fix threads.', 'They could not easily protest.'], 'Cheap wages and small size; this was exploitation.'),
    ex('How did the factory system change a weaver\'s control over work?', ['At home a weaver chose hours and used his own loom.', 'In a factory the owner owned the machines and fixed the hours.'], 'He lost control of tools and time and became a wage worker.'),
  ], [
    tapT('fact', 'Tap the features of early factories.', [
      ['Long working hours of 12–16 hours', true], ['Machines owned by the factory owner', true], ['Children working in mills', true], ['Workers paid wages', true], ['Frequent accidents', true],
      ['Workers chose their own hours', false], ['Weekly holidays of four days', false],
    ], ['Think of the clock, the owner and the children.', 'Workers had little choice.'], 'Long hours, owner-owned machines, child workers, wages and accidents marked early factories.'),
    mcq('child', 'Think about how conditions were improved.', [
      ['Why were children employed in early factories?', 'They were paid less and could fit under machines', ['They were better educated', 'They were stronger than adults', 'The law required it'], 'Cheap and small.', 'Owners exploited children for cheap labour.'],
      ['Laws passed in Britain to improve factory conditions were called…', 'Factory Acts', ['Navigation Acts', 'Corn Laws', 'Stamp Acts'], 'Acts about factories.', 'The Factory Acts limited child labour and hours.'],
      ['Workers formed ___ to demand better wages.', 'trade unions', ['stock markets', 'armies', 'colonies'], 'Unity is strength.', 'Trade unions bargain together for workers.'],
      ['In India, education is free and compulsory for children aged…', '6 to 14', ['1 to 3', '18 to 25', '15 to 21'], 'Right to Education Act, 2009.', 'The RTE Act covers children aged 6–14.'],
      ['Which British town grew into a big cotton-mill city?', 'Manchester', ['Delhi', 'Paris', 'Calicut'], 'Nicknamed "Cottonopolis".', 'Manchester became the centre of cotton mills.'],
    ]),
    matchT('then', 'before factories with after factories', [
      ['Work at home', 'Work in a large mill'], ['Own tools', 'Machines owned by employer'], ['Own pace', 'Fixed hours by the factory bell'], ['Family workshop', 'Hundreds of strangers together'], ['Hand power', 'Steam power'],
    ], ['Each pair is a "before → after" change.', 'Think of who owns tools.']),
  ]),
  O('ts7.ss.indrev.energy', 'Energy, transport revolution and trade', [
    h('Coal, iron, rails and ships'),
    photo('🚆', 'Steam railways carried coal, cotton and people faster than ever before.'),
    p('Machines needed power and metal. Coal mining grew to feed steam engines; better methods of making iron and later steel (using coke from coal) gave strong metal for machines, bridges and rails.'),
    stepsB('Canals were dug to carry heavy coal cheaply (late 1700s).', '1825: the first public steam railway, Stockton to Darlington, opens in England.', '1829: Stephenson\'s Rocket wins a locomotive trial.', 'Steamships cross oceans faster and on schedule.', '1853: India\'s first passenger train runs from Bombay (Mumbai) to Thane.'),
    p('Faster transport meant raw materials could reach factories and finished goods reach markets cheaply. Britain imported raw cotton (from India and America) and sold machine-made cloth back to the world, including India. This hurt Indian handloom weavers, whose cloth could not compete in price.'),
    keys('Coal = power; iron and steel = machines and rails.', 'Railways from 1825; India\'s first train 1853.', 'Trade: raw cotton in, cheap cloth out.'),
    remember('The Industrial Revolution made Britain the "workshop of the world" but ruined many Indian handloom weavers.'),
  ], [
    ex('Why did railways help factory owners?', ['Railways carried coal and raw cotton to factories cheaply and quickly.', 'They carried finished goods to ports and markets.', 'Costs fell and sales grew.'], 'Cheaper, faster movement of raw materials and goods.'),
    ex('How did British industry affect Indian handloom weavers?', ['Machine-made cloth from Britain was cheaper.', 'It flooded Indian markets.', 'Indian weavers lost buyers and many lost their livelihood.'], 'Cheap British cloth ruined many Indian weavers.'),
  ], [
    orderT('trans', 'Order these transport milestones.', ['Canals dug to carry coal', 'Stockton–Darlington railway opens', 'Stephenson\'s Rocket wins its trial', 'First passenger train in India'], ['Canals came before railways.', 'India\'s train came in 1853.'], 'Canals → 1825 railway → 1829 Rocket → 1853 Indian train.', 4),
    mcq('en', 'Coal, iron, rails and trade.', [
      ['India\'s first passenger train (1853) ran from…', 'Bombay to Thane', ['Hyderabad to Warangal', 'Delhi to Agra', 'Madras to Calicut'], 'On the west coast.', 'The first train ran from Bombay to Thane in 1853.'],
      ['Which fuel powered steam engines?', 'Coal', ['Petrol', 'Solar energy', 'Uranium'], 'Dug from mines.', 'Coal was burnt to make steam.'],
      ['Britain bought raw cotton from India and sold back…', 'machine-made cloth', ['raw cotton', 'tea leaves', 'iron ore'], 'Finished goods.', 'Britain exported factory cloth to India.'],
      ['The first public steam railway opened in…', '1825', ['1725', '1925', '1857'], 'Stockton to Darlington.', 'It opened in 1825.'],
    ]),
    yearsT('yrs', [
      ['The Stockton–Darlington railway opened', 1825, 'India\'s first passenger train ran', 1853],
      ['James Watt patented his steam engine', 1769, 'the Stockton–Darlington railway opened', 1825],
      ['The spinning jenny was invented', 1764, 'the power loom was invented', 1785],
      ['The Rocket locomotive won its trial', 1829, 'India\'s first passenger train ran', 1853],
      ['Britain passed an important Factory Act', 1833, 'India\'s first passenger train ran', 1853],
    ], 2),
  ]),
]);

// =====================================================================================
// Chapter 9 — Production in a Factory: A Paper Mill
// =====================================================================================
const ch9 = U(9, 'Production in a Factory - A Paper Mill', [
  O('ts7.ss.paper.raw', 'Raw materials and paper mills', [
    h('What is paper made of?'),
    photo('📄', 'Paper is made from plant fibres pressed together into thin sheets.'),
    p('Paper is made of cellulose fibres from plants. In India, paper mills use wood and bamboo from forests and plantations (eucalyptus, subabul), agricultural waste such as bagasse (sugarcane waste) and rice or wheat straw, and recycled waste paper.'),
    p('Telangana has a historic paper mill at Kagaznagar (kagaz means paper) in Komaram Bheem Asifabad district, started in the 1930s close to the bamboo forests of the Godavari valley. Paper mills are usually set up near raw materials and plenty of water, because papermaking uses a lot of water.'),
    def('Raw material', 'The basic material from which a product is made, for example bamboo for paper or cotton for cloth.'),
    stepsB('Raw materials: wood, bamboo, bagasse, straw, waste paper.', 'Water: large amounts for pulping and washing.', 'Power: electricity and steam from coal or biomass boilers.', 'Chemicals: for cooking and bleaching pulp.', 'Workers, machines and money (capital).'),
    keys('Paper comes from plant fibres (cellulose).', 'Raw materials: bamboo, wood, bagasse, straw, waste paper.', 'Mills need forests (or farms) and water nearby.'),
    remember('Recycling one tonne of paper saves many trees and a great deal of water.'),
  ], [
    ex('Why was the paper mill at Kagaznagar set up in northern Telangana?', ['Bamboo forests were close by.', 'Rivers supplied the large amounts of water needed.', 'Coal from the Godavari valley gave fuel.'], 'Close to bamboo, water and coal.'),
    ex('Why do some mills use bagasse?', ['Bagasse is the leftover fibre after crushing sugarcane.', 'It is cheap and would otherwise be waste.', 'Using it saves trees.'], 'It is cheap farm waste and saves forests.'),
  ], [
    tapT('raw', 'Tap the raw materials used for making paper.', [
      ['Bamboo', true], ['Eucalyptus wood', true], ['Bagasse (sugarcane waste)', true], ['Waste paper', true], ['Rice straw', true],
      ['Iron ore', false], ['Sand', false], ['Crude oil', false],
    ], ['Paper is made of plant fibres.', 'Minerals and oil are not used as the main material.'], 'Plant fibres from bamboo, wood, bagasse, straw and waste paper make paper.'),
    mcq('mill', 'Think about location and needs of a mill.', [
      ['Kagaznagar paper mill is in which district?', 'Komaram Bheem Asifabad', ['Hyderabad', 'Nalgonda', 'Mahabubnagar'], 'Northern Telangana, near forests.', 'Kagaznagar is in Komaram Bheem Asifabad district.'],
      ['"Kagaz" in Kagaznagar means…', 'paper', ['coal', 'river', 'forest'], 'The town is named after its mill.', 'Kagaz means paper.'],
      ['Paper is mainly made of which substance from plants?', 'Cellulose fibres', ['Starch', 'Protein', 'Rubber'], 'Plant cell walls.', 'Cellulose fibres bind together to form paper.'],
      ['Why are paper mills built near rivers?', 'They need large amounts of water', ['To float the paper home', 'To catch fish', 'Rivers make paper white'], 'Pulping and washing.', 'Papermaking uses huge volumes of water.'],
    ]),
    matchT('need', 'factory need with an example', [
      ['Raw material', 'Bamboo'], ['Power', 'Electricity and steam'], ['Chemical', 'Bleach for whitening pulp'], ['Capital', 'Money to buy machines'], ['Labour', 'Workers in shifts'],
    ], ['Capital means money and machines.', 'Labour means people.']),
  ]),
  O('ts7.ss.paper.process', 'The process of paper-making', [
    h('From bamboo to a notebook page'),
    p('A paper mill is a long chain of machines. Raw material goes in at one end; huge rolls of paper come out at the other.'),
    stepsB('Debarking and chipping: logs and bamboo are cleaned and cut into small chips.', 'Cooking (pulping): chips are boiled with chemicals in a digester to separate the fibres into pulp.', 'Washing and screening: dirt and knots are removed.', 'Bleaching: pulp is whitened.', 'Sheet forming: watery pulp is spread on a moving wire mesh; water drains away and fibres mat together.', 'Pressing and drying: rollers squeeze water out; steam-heated cylinders dry the sheet.', 'Calendering, reeling and cutting: smooth rollers polish the paper; it is wound into reels and cut into sheets.'),
    tip('You can make paper at home: soak torn newspaper, mash it into pulp, spread it thinly on a mesh, press out water and let it dry.'),
    keys('Chips → pulp → wash → bleach → sheet on wire → press → dry → roll.', 'The digester cooks chips into pulp.', 'Most of the mill\'s water is used in pulping and sheet forming.'),
    remember('Pulp entering the paper machine is over 95% water; drying removes almost all of it.'),
  ], [
    ex('What happens in the digester?', ['Chips are cooked with chemicals under heat.', 'The glue (lignin) holding the fibres breaks down.', 'The fibres separate to form pulp.'], 'Chips are cooked into pulp.'),
    ex('Why is the pulp spread on a moving wire mesh?', ['Water drains through the holes.', 'Fibres stay on top and lock together.', 'This forms a continuous wet sheet.'], 'To drain water and form a sheet of fibres.'),
  ], [
    orderT('proc', 'Order the steps of making paper in a mill.', ['Cut wood or bamboo into chips', 'Cook chips into pulp in the digester', 'Wash and bleach the pulp', 'Spread pulp on a wire mesh to form a sheet', 'Press and dry the sheet', 'Roll and cut the paper'], ['Pulp must exist before a sheet.', 'Cutting is last.'], 'Chips → pulp → wash/bleach → sheet → press/dry → roll/cut.'),
    mcq('pq', 'Follow the chain of the paper machine.', [
      ['Chips are cooked into pulp in the…', 'digester', ['calender', 'reel', 'wire mesh'], 'It "digests" wood.', 'The digester cooks chips with chemicals.'],
      ['Bleaching is done to…', 'make the pulp white', ['make it heavier', 'add bamboo', 'cut it into sheets'], 'Notebook paper is white.', 'Bleaching whitens the pulp.'],
      ['Smooth rollers that polish the dried paper are called…', 'calenders', ['digesters', 'chippers', 'sluices'], 'Similar to ironing.', 'Calendering gives paper a smooth finish.'],
      ['Wet sheets are dried by…', 'steam-heated cylinders', ['leaving them in rain', 'freezing them', 'dipping in dye'], 'Heat removes water.', 'Hot cylinders evaporate the remaining water.'],
    ]),
    matchT('stage', 'stage with what happens', [
      ['Chipping', 'Wood cut into small pieces'], ['Pulping', 'Fibres separated by cooking'], ['Bleaching', 'Pulp whitened'], ['Sheet forming', 'Pulp spread on moving mesh'], ['Drying', 'Water removed on hot cylinders'], ['Reeling', 'Paper wound into big rolls'],
    ], ['Follow the process in order.', 'Reeling is the final roll.']),
  ]),
  O('ts7.ss.paper.work', 'Shifts, ownership, selling paper and pollution', [
    h('A mill that never sleeps'),
    p('Big machines in a paper mill run day and night, because stopping and restarting them wastes time and material. So workers work in shifts, usually three shifts of 8 hours each.'),
    def('Shift', 'A fixed period of work, for example 6 a.m.–2 p.m., 2 p.m.–10 p.m. and 10 p.m.–6 a.m. Workers rotate between shifts.'),
    p('Workers include permanent workers with fixed pay, benefits and job security, and contract or casual workers who are hired for short periods with less security. Engineers, chemists, machine operators, loaders and office staff all work together.'),
    def('Ownership', 'A mill may be private (owned by a company and its shareholders), public sector (owned by the government) or cooperative. Owners invest capital and take the profit or bear the loss.'),
    h('Selling and pollution'),
    p('Paper is sold to wholesalers, printers, publishers and the government (for textbooks). Prices depend on cost of raw material, power and demand.'),
    stepsB('Waste water with chemicals can pollute rivers and kill fish.', 'Smoke from boilers pollutes air.', 'Bad smells affect nearby villages.', 'Solutions: effluent treatment plants, recycling water, cleaner chemicals, planting trees, recycling paper.'),
    keys('Mills run 24 hours in three 8-hour shifts.', 'Permanent vs contract workers.', 'Pollution must be treated before release.'),
    remember('An effluent treatment plant cleans waste water before it goes back into a river.'),
  ], [
    ex('If a mill runs 24 hours a day in equal shifts of 8 hours, how many shifts are there?', ['24 ÷ 8 = 3.'], '3 shifts'),
    ex('Why might a contract worker worry more than a permanent worker?', ['A contract worker can lose the job when the contract ends.', 'He may not get pension, leave or medical benefits.'], 'Less job security and fewer benefits.'),
  ], [
    tp('shift', (r) => {
      const hrs = r.pick([6, 8, 12]);
      const days = r.pick([1, 2, 3, 7]);
      const ans = (24 / hrs) * days;
      return numQ(`A paper mill runs non-stop for ${days} day${days > 1 ? 's' : ''}. Each shift is ${hrs} hours long. How many shifts are worked in total?`, ans,
        [`First find shifts per day: 24 ÷ ${hrs}.`, `Then multiply by ${days}.`], [`Shifts per day = 24 ÷ ${hrs} = ${24 / hrs}`, `Total = ${24 / hrs} × ${days} = ${ans}`], [], 0.001, 'shifts');
    }, 2),
    tapT('poll', 'Tap the ways to reduce pollution from a paper mill.', [
      ['Treating waste water in an effluent treatment plant', true], ['Recycling water inside the mill', true], ['Using more recycled paper as raw material', true], ['Planting trees around the mill', true],
      ['Releasing chemicals directly into the river', false], ['Burning waste in the open', false],
    ], ['Clean before release.', 'Two options make pollution worse.'], 'Treatment, recycling and greenery reduce pollution.'),
    mcq('own', 'Think about workers, owners and buyers.', [
      ['Why do paper mills work in shifts?', 'The machines run day and night without stopping', ['Workers like night work', 'Paper is made only at night', 'It is required by the school'], 'Restarting wastes material.', 'Continuous machines need workers round the clock.'],
      ['A mill owned by the government is in the…', 'public sector', ['private sector', 'cooperative sector', 'informal sector'], 'Public = government.', 'Government-owned enterprises are public sector.'],
      ['A worker with job security, fixed pay and benefits is a…', 'permanent worker', ['casual worker', 'daily wage labourer', 'contract worker'], 'Permanent = lasting.', 'Permanent workers have security and benefits.'],
      ['Who buys large amounts of paper to print school textbooks?', 'The government', ['Fishermen', 'Weavers', 'Farmers'], 'Free textbooks for students.', 'Governments buy paper to print textbooks.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 10 — Importance of Transport System
// =====================================================================================
const ch10 = U(10, 'Importance of Transport System', [
  O('ts7.ss.trans.modes', 'Road, rail, air and water transport in Telangana', [
    h('How Telangana moves'),
    photo('🚌', 'TGSRTC buses link almost every village of Telangana with towns and cities.'),
    p('Transport means moving people and goods from one place to another. Telangana is a land-locked state, so it depends mainly on roads, railways and air.'),
    stepsB('Roads: national highways like NH 44 (Srinagar to Kanyakumari) pass through Hyderabad; state highways and village roads connect mandals. TGSRTC runs public buses; the Outer Ring Road circles Hyderabad.', 'Railways: Secunderabad is the headquarters of the South Central Railway. Trains carry coal from Singareni mines, cement, food grains and passengers.', 'Air: Rajiv Gandhi International Airport at Shamshabad, Hyderabad, connects Telangana to India and the world.', 'Urban: Hyderabad Metro Rail and MMTS local trains carry daily commuters.', 'Water: no sea coast; only small ferries and boats on rivers and reservoirs.'),
    def('Land-locked', 'A region with no sea coast.'),
    keys('Road, rail and air are the main modes in Telangana.', 'Secunderabad: HQ of South Central Railway.', 'RGIA at Shamshabad; Hyderabad Metro.'),
    remember('Roads reach every village; railways are cheaper for heavy goods over long distances; air is fastest but costliest.'),
  ], [
    ex('Which transport would you choose to send 3,000 tonnes of coal from Singareni to a power plant 300 km away? Why?', ['Coal is heavy and bulky.', 'Railways carry large loads cheaply over long distances.'], 'Rail, because it is cheapest for heavy loads over long distances.'),
    ex('Why does Telangana not have sea ports?', ['Telangana has no coastline.', 'It is a land-locked state.'], 'It is land-locked.'),
  ], [
    matchT('mode', 'place or service with its transport', [
      ['Shamshabad', 'Rajiv Gandhi International Airport'], ['Secunderabad', 'HQ of South Central Railway'], ['TGSRTC', 'Public bus service'], ['NH 44', 'National highway through Hyderabad'], ['Hyderabad Metro', 'Urban rail for commuters'], ['Singareni', 'Coal carried by goods trains'],
    ], ['The airport is south of the city.', 'Coal goes by rail.']),
    mcq('m', 'Think about cost, speed and load.', [
      ['Which is the fastest mode of transport?', 'Air', ['Road', 'Rail', 'Bullock cart'], 'But also the costliest.', 'Aeroplanes are the fastest.'],
      ['Which is cheapest for heavy goods over long distances in Telangana?', 'Railways', ['Air', 'Auto-rickshaw', 'Motorcycle'], 'Goods trains carry many wagons.', 'Rail is cheapest for bulk goods over long distances.'],
      ['Telangana has no sea ports because it is…', 'land-locked', ['an island', 'covered in ice', 'too small'], 'No coastline.', 'A land-locked state has no sea coast.'],
      ['Which mode reaches almost every village?', 'Road', ['Air', 'Ship', 'Metro'], 'Buses and autos.', 'Roads connect nearly every village.'],
      ['The ring road around Hyderabad is called the…', 'Outer Ring Road', ['Grand Trunk Road', 'Silk Road', 'Golden Quadrilateral only'], 'It circles the city.', 'The Outer Ring Road encircles Hyderabad.'],
    ]),
    tapT('rail', 'Tap goods commonly moved by goods trains in Telangana.', [
      ['Coal from Singareni', true], ['Cement', true], ['Food grains', true], ['Fertilisers', true],
      ['Fresh flowers to a temple next door', false], ['A letter to a neighbour', false],
    ], ['Rail is good for heavy, bulk goods.', 'Small, nearby items go by road or hand.'], 'Coal, cement, grains and fertilisers are bulky goods moved by rail.'),
  ]),
  O('ts7.ss.trans.economy', 'Transport in production, sale and employment', [
    h('Transport links every step'),
    p('Think about a cotton shirt. Cotton seeds and fertilisers reach the farmer; cotton bales go to a ginning mill; yarn goes to a weaving or garment factory; shirts go to shops in towns. Every arrow in this chain is transport.'),
    stepsB('Inputs reach farms and factories: seeds, fertiliser, raw materials, fuel.', 'Products move from farm to market yards (e.g. Warangal\'s Enumamula market for cotton and chillies).', 'Factories send goods to wholesalers and retailers.', 'Perishables (milk, vegetables, fish, flowers) need fast transport, often in refrigerated vans.', 'Exports go by road or rail to sea ports and by air from Hyderabad.'),
    h('Jobs in transport'),
    p('Transport employs drivers, conductors, loaders, mechanics, railway staff, pilots, cabin crew, airport workers, traffic police, petrol pump staff, and people who build roads and vehicles. Auto-rickshaw and delivery drivers are a big part of city employment.'),
    keys('Transport links inputs, production and markets.', 'Perishables need fast transport.', 'Transport creates many jobs.'),
    remember('Without good roads, farmers sell to the nearest trader at a low price; with roads, they can reach better markets.'),
  ], [
    ex('Why do vegetables from Rangareddy reach Hyderabad markets early each morning?', ['Vegetables spoil quickly (perishable).', 'Trucks and autos bring them overnight to be fresh for buyers.'], 'They are perishable, so fast transport brings them fresh.'),
    ex('Name three jobs created by an RTC bus depot.', ['Drivers drive the buses.', 'Conductors issue tickets.', 'Mechanics repair the buses.'], 'Driver, conductor, mechanic.'),
  ], [
    orderT('chain', 'Order the journey of cotton from farm to shirt shop.', ['Farmer grows cotton', 'Cotton taken to a market yard', 'Ginning mill removes seeds', 'Yarn and cloth made in a mill', 'Shirts sent to shops'], ['The farm comes first.', 'The shop is last.'], 'Farm → market → ginning → mill → shop, each linked by transport.'),
    tapT('jobs', 'Tap the jobs that are part of the transport sector.', [
      ['Bus driver', true], ['Railway station master', true], ['Pilot', true], ['Truck loader', true], ['Auto-rickshaw driver', true],
      ['Potter', false], ['School teacher', false], ['Weaver', false],
    ], ['Does the job move people or goods?', 'Potters and weavers make goods.'], 'Drivers, station masters, pilots and loaders work in transport.'),
    mcq('ec', 'Transport links production and sale.', [
      ['Goods that spoil quickly are called…', 'perishable goods', ['durable goods', 'capital goods', 'raw goods'], 'Milk, vegetables, fish.', 'Perishables must reach buyers fast.'],
      ['Enumamula market in Warangal is famous for…', 'cotton and chillies', ['fish', 'gold', 'aeroplanes'], 'A big agricultural market yard.', 'It is a major cotton and chilli market.'],
      ['How do good roads help farmers?', 'They can reach bigger markets and get better prices', ['Crops grow taller', 'Rain falls more', 'Tractors become free'], 'Access to markets.', 'Roads let farmers sell beyond the local trader.'],
      ['Refrigerated vans are used to carry…', 'milk and fish', ['bricks', 'coal', 'iron rods'], 'Keep cold.', 'Perishables need cooling.'],
    ]),
  ]),
  O('ts7.ss.trans.safety', 'Congestion, pollution and road safety', [
    h('Too many vehicles'),
    p('Hyderabad\'s vehicles have multiplied many times in a few decades. Roads cannot grow as fast, so traffic jams (congestion) waste time and fuel.'),
    stepsB('Congestion: too many vehicles, narrow roads, wrong parking, few public buses.', 'Air pollution: smoke from petrol and diesel causes breathing problems.', 'Noise pollution: honking and engines disturb people.', 'Accidents: speeding, drunk driving, no helmets or seat belts, jumping signals.'),
    h('Solutions'),
    p('Use public transport (buses, Metro, MMTS), walk or cycle for short trips, share rides, use electric vehicles, maintain vehicles to reduce smoke, and follow traffic rules. Children should never drive vehicles; a licence is given only to adults (18+, or 16+ for gearless low-power two-wheelers).'),
    stepsB('Red: stop.', 'Amber (yellow): get ready / slow down.', 'Green: go, carefully.', 'Use zebra crossings; look right, left and right again.', 'Wear a helmet on two-wheelers and a seat belt in cars.'),
    keys('Congestion, pollution and accidents are transport problems.', 'Public transport reduces all three.', 'Follow signals, helmets and seat belts.'),
    remember('One full bus can replace dozens of cars on the road.'),
  ], [
    ex('How does one Metro train reduce pollution?', ['It carries hundreds of passengers at once.', 'It runs on electricity, not petrol or diesel.', 'Fewer cars and bikes mean less smoke.'], 'It replaces many private vehicles and uses electricity.'),
    ex('Ravi\'s 15-year-old friend wants to ride his father\'s motorbike to school. What should Ravi say?', ['Riding without a licence is illegal.', 'He is too young to get a licence for a motorbike.', 'It is dangerous for himself and others.'], 'He must not ride; it is unsafe and against the law.'),
  ], [
    tapT('fix', 'Tap the actions that reduce congestion and pollution.', [
      ['Travelling by Metro or bus', true], ['Cycling for short trips', true], ['Sharing rides', true], ['Keeping vehicles serviced', true], ['Using electric vehicles', true],
      ['Each family member using a separate car', false], ['Parking on the road', false], ['Honking continuously', false],
    ], ['Fewer vehicles = less traffic and smoke.', 'Wrong parking narrows roads.'], 'Public transport, cycling, sharing, servicing and EVs reduce traffic and smoke.'),
    orderT('sig', 'Order the traffic signal lights as they change from "stop" back to "stop".', ['Red: stop', 'Green: go', 'Amber: slow down and get ready to stop', 'Red: stop'], ['After red comes green.', 'Amber warns before red.'], 'Red → green → amber → red.', 4),
    mcq('safe', 'Rules that save lives.', [
      ['Amber (yellow) light means…', 'slow down and prepare to stop', ['speed up', 'park', 'honk'], 'It warns of red.', 'Amber warns that the light is about to turn red.'],
      ['On a two-wheeler, safety requires…', 'a helmet for the rider and pillion', ['a seat belt only', 'loud music', 'three riders'], 'Head protection.', 'Helmets protect heads in crashes.'],
      ['Congestion means…', 'traffic jams caused by too many vehicles', ['clean air', 'empty roads', 'a type of fuel'], 'Roads are crowded.', 'Congestion is overcrowding of roads.'],
      ['Where should pedestrians cross the road?', 'At a zebra crossing', ['Between moving buses', 'Over the divider', 'At a sharp bend'], 'Black and white stripes.', 'Zebra crossings are made for pedestrians.'],
    ]),
  ]),
]);

// =====================================================================================
// Theme III — Political Systems and Governance
// Chapter 11 — New Kings and Kingdoms
// =====================================================================================
const ch11 = U(11, 'New Kings and Kingdoms', [
  O('ts7.ss.kings.new', 'New dynasties, prashastis and land grants', [
    h('From officers to kings'),
    photo('📜', 'Copper-plate land grants and stone inscriptions tell us about kings of 700–1200 CE.'),
    p('Between about 700 and 1200 CE many new ruling families rose in India. Often they began as samantas (powerful landlords or subordinate chiefs) who served a bigger king. When they grew strong, they declared themselves maharajas. For example, Dantidurga, a Rashtrakuta chief, overthrew his Chalukya overlords in the mid-700s; the Rashtrakutas then ruled much of the Deccan.'),
    def('Samanta', 'A subordinate chief or landlord who served an overlord with soldiers and gifts, and could rise to become a king himself.'),
    def('Prashasti', 'A poem in praise of a king, written by learned Brahmanas and carved on stone or copper. It shows the king as brave and generous, so it may exaggerate.'),
    def('Land grant', 'A gift of land by a king, often to Brahmanas or temples, recorded on copper plates. It tells us about villages, taxes and boundaries.'),
    stepsB('A chief serves an overlord and gathers soldiers and land.', 'He grows powerful and declares independence.', 'He takes grand titles such as maharajadhiraja.', 'Poets write prashastis praising him.', 'He grants land to Brahmanas and temples to win support.'),
    keys('Many new dynasties rose 700–1200 CE.', 'Samantas often became kings.', 'Prashastis praise kings; copper plates record land grants.'),
    remember('Read a prashasti carefully: it shows what the king wanted people to believe about him.'),
  ], [
    ex('Why should historians be careful when using prashastis?', ['They were written to praise the king.', 'They may exaggerate victories or hide defeats.', 'So historians check them against other sources.'], 'They are biased praise and may exaggerate.'),
    ex('Why did kings give land to Brahmanas and temples?', ['It showed the king as generous and religious.', 'Brahmanas supported the king\'s right to rule.', 'Temples became centres that helped settle and farm new areas.'], 'To gain religious support and legitimacy.'),
  ], [
    orderT('rise', 'Order the steps by which a samanta became a king.', ['Serves an overlord as a chief', 'Builds up soldiers and land', 'Declares independence', 'Takes the title maharajadhiraja', 'Poets praise him in a prashasti'], ['Service comes before rebellion.', 'Praise follows the new title.'], 'Serve → grow strong → break free → take titles → be praised.'),
    matchT('src', 'term with its meaning', [
      ['Prashasti', 'Poem praising a king'], ['Samanta', 'Subordinate chief or landlord'], ['Copper plate', 'Record of a land grant'], ['Maharajadhiraja', 'Great king, king of kings'], ['Dantidurga', 'Rashtrakuta chief who became king'],
    ], ['A prashasti is praise.', 'Copper plates record grants.']),
    mcq('nk', 'Think about who wrote what and why.', [
      ['A prashasti was written mainly to…', 'praise the king', ['criticise the king', 'record rainfall', 'teach mathematics'], 'It glorifies the ruler.', 'Prashastis praise kings.'],
      ['Land grants were usually recorded on…', 'copper plates', ['palm leaves only', 'cloth', 'clay pots'], 'Metal lasts long.', 'Copper plates recorded land grants.'],
      ['Who founded Rashtrakuta power by overthrowing the Chalukyas?', 'Dantidurga', ['Rajaraja Chola', 'Mahmud of Ghazni', 'Prithviraj Chauhan'], 'Mid-700s, in the Deccan.', 'Dantidurga overthrew his Chalukya overlords.'],
      ['Between about 700 and 1200 CE, many new kingdoms were founded by…', 'samantas who became powerful', ['European traders', 'the British', 'the Mughals'], 'Local chiefs rose up.', 'Powerful samantas often became kings.'],
    ]),
  ]),
  O('ts7.ss.kings.war', 'Administration and warfare for wealth', [
    h('Ruling and raiding'),
    p('These kings collected revenue (taxes) from peasants, traders and artisans. Resources were gathered with the help of samantas and local village assemblies. Officials were often chosen from powerful families, and posts were sometimes hereditary.'),
    p('Kings fought for land and wealth. Kanauj in the Ganga valley was a prize city. For a long time three dynasties, the Gurjara-Pratiharas, the Rashtrakutas and the Palas, fought over Kanauj: this is called the tripartite struggle.'),
    def('Tripartite struggle', 'The long three-way fight among the Gurjara-Pratiharas, Rashtrakutas and Palas for control of Kanauj.'),
    p('Temples were rich, so attacking a rival\'s temple showed power and gave plunder. Mahmud of Ghazni (in Afghanistan) raided the subcontinent about 17 times between 1000 and 1025 CE, attacking rich temples including Somnath in Gujarat, and carried away wealth to build his capital. In the north, the Chahamanas (Chauhans) ruled around Delhi and Ajmer. Prithviraja III defeated Sultan Muhammad Ghori at Tarain in 1191 but lost to him there in 1192.'),
    keys('Revenue came from peasants, traders and artisans.', 'Tripartite struggle for Kanauj.', 'Mahmud of Ghazni: 17 raids (1000–1025); Prithviraj Chauhan: Tarain 1191 and 1192.'),
    remember('Temples were attacked by many rulers of different faiths, mainly because they were symbols of a king\'s power and stores of wealth.'),
  ], [
    ex('Why did the Pratiharas, Rashtrakutas and Palas all want Kanauj?', ['Kanauj was a rich city in the fertile Ganga valley.', 'Controlling it brought wealth and prestige.'], 'For its wealth and importance.'),
    ex('How many years after Mahmud of Ghazni\'s last raid (1025) was the second Battle of Tarain (1192)?', ['1192 − 1025 = 167.'], '167 years'),
  ], [
    matchT('who', 'ruler or dynasty with the fact', [
      ['Mahmud of Ghazni', 'Raided about 17 times, including Somnath'], ['Prithviraja III', 'Chahamana king who fought at Tarain'], ['Gurjara-Pratiharas', 'One side of the tripartite struggle'], ['Palas', 'Dynasty of Bengal in the tripartite struggle'], ['Muhammad Ghori', 'Defeated Prithviraja in 1192'],
    ], ['Somnath is in Gujarat.', 'Tarain was fought twice.']),
    mcq('w', 'Think of Kanauj, Ghazni and Tarain.', [
      ['The tripartite struggle was fought over which city?', 'Kanauj', ['Hyderabad', 'Thanjavur', 'Warangal'], 'In the Ganga valley.', 'Three dynasties fought for Kanauj.'],
      ['Mahmud of Ghazni attacked the temple at…', 'Somnath', ['Ramappa', 'Thanjavur', 'Hampi'], 'In Gujarat, 1025.', 'He raided Somnath in 1025.'],
      ['Who won the first Battle of Tarain (1191)?', 'Prithviraja III', ['Muhammad Ghori', 'Mahmud of Ghazni', 'Rajendra Chola'], 'He lost the second one.', 'Prithviraja won in 1191 but lost in 1192.'],
      ['Why were temples targeted in wars?', 'They were rich and symbols of a king\'s power', ['They were empty', 'They were made of gold only', 'They were armies'], 'Wealth and prestige.', 'Temples held wealth and represented royal power.'],
      ['Kings collected revenue mainly from…', 'peasants, traders and artisans', ['foreign countries only', 'the sea', 'nobody'], 'People who produced and traded.', 'Taxes came from producers and traders.'],
    ]),
    yearsT('yrs', [
      ['Mahmud of Ghazni began his raids', 1000, 'he attacked Somnath', 1025],
      ['The first Battle of Tarain was fought', 1191, 'the second Battle of Tarain was fought', 1192],
      ['Mahmud attacked Somnath', 1025, 'the second Battle of Tarain was fought', 1192],
      ['Rajaraja Chola became king', 985, 'Mahmud attacked Somnath', 1025],
      ['Mahmud of Ghazni began his raids', 1000, 'the first Battle of Tarain was fought', 1191],
    ]),
  ]),
  O('ts7.ss.kings.cholas', 'The Cholas: temples, bronzes, agriculture and administration', [
    h('The great Cholas of the Kaveri delta'),
    photo('🛕', 'The Brihadeshvara (Rajarajeshvara) temple at Thanjavur, built by Rajaraja I.'),
    p('Around 850 CE Vijayalaya captured the Kaveri delta and founded the Chola kingdom with Thanjavur as capital. Rajaraja I (became king in 985) and his son Rajendra I made it the strongest power in the south. Rajendra I sent armies to the Ganga valley, Sri Lanka and even South-East Asia with a navy, and built Gangaikonda Cholapuram.'),
    stepsB('Temples: huge stone temples like Thanjavur and Gangaikonda Cholapuram were centres of worship, crafts, music, dance and economy; they owned land.', 'Bronzes: Chola craftspeople made beautiful bronze images, especially Nataraja (Shiva as lord of dance), using the lost-wax method.', 'Agriculture: they built embankments, canals, wells and tanks to irrigate the fertile Kaveri delta for rice.', 'Administration: settlements of peasants (ur) grouped into nadu; Brahmana villages had a sabha; merchants had a nagaram.'),
    p('Inscriptions at Uttaramerur describe how members of the sabha were chosen by lottery from those who owned land, had houses, were 35–70 years old and knew the Vedas, and served in committees for irrigation, gardens and temples.'),
    keys('Chola kingdom: Vijayalaya; Rajaraja I; Rajendra I.', 'Thanjavur temple; bronze Nataraja.', 'Ur, nadu, sabha; Uttaramerur inscriptions.'),
    remember('The lost-wax method: a wax model is coated in clay, heated so wax melts out, then molten bronze is poured into the mould.'),
  ], [
    ex('How was a Chola bronze image made by the lost-wax method?', ['Make a wax model and cover it with clay.', 'Heat it: the wax melts and flows out, leaving a hollow mould.', 'Pour in molten metal; break the clay when cool.'], 'Wax model → clay coat → melt wax → pour bronze → break mould.'),
    ex('Why did Chola rulers build canals and tanks in the Kaveri delta?', ['Rice needs a lot of water.', 'Irrigation allowed farming through more of the year.', 'More crops meant more revenue.'], 'To irrigate rice fields and increase production and revenue.'),
  ], [
    orderT('wax', 'Order the steps of the lost-wax method.', ['Make a wax model', 'Cover it with clay', 'Heat it so the wax melts out', 'Pour molten bronze into the mould', 'Break the clay to reveal the image'], ['The wax model comes first.', 'Breaking the mould is last.'], 'Wax → clay → melt → pour → break.'),
    matchT('chola', 'Chola term with its meaning', [
      ['Ur', 'Settlement of peasants'], ['Nadu', 'Group of villages'], ['Sabha', 'Assembly of a Brahmana village'], ['Nagaram', 'Organisation of merchants'], ['Nataraja', 'Bronze image of Shiva as lord of dance'], ['Uttaramerur', 'Inscriptions on how the sabha was chosen'],
    ], ['Sabha is an assembly.', 'Nataraja dances.']),
    mcq('ch', 'Think of Thanjavur and the Kaveri.', [
      ['Who built the Brihadeshvara temple at Thanjavur?', 'Rajaraja I', ['Vijayalaya', 'Mahmud of Ghazni', 'Krishnadevaraya'], 'He became king in 985.', 'Rajaraja I built the Thanjavur temple.'],
      ['The Chola heartland was the delta of which river?', 'Kaveri', ['Godavari', 'Ganga', 'Narmada'], 'In Tamil Nadu.', 'The Cholas were based in the Kaveri delta.'],
      ['Which Chola king sent a navy to South-East Asia?', 'Rajendra I', ['Vijayalaya', 'Dantidurga', 'Prithviraja'], 'He built Gangaikonda Cholapuram.', 'Rajendra I led naval expeditions.'],
      ['Chola bronzes were made using the…', 'lost-wax method', ['potter\'s wheel', 'printing press', 'loom'], 'Wax melts away.', 'The lost-wax casting method was used.'],
      ['Members of the sabha at Uttaramerur were chosen by…', 'lottery from eligible people', ['war', 'birth only', 'the British'], 'Names on palm leaves in a pot.', 'Inscriptions describe selection by lot.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 12 — The Kakatiyas: Emergence of a Regional Kingdom
// =====================================================================================
const ch12 = U(12, 'The Kakatiyas - Emergence of a Regional Kingdom', [
  O('ts7.ss.kakatiya.rulers', 'Important Kakatiya rulers and Rudrama Devi', [
    h('From Hanumakonda to Orugallu'),
    photo('🛕', 'The Kakatiya Kala Thoranam (gateway) at Warangal is now part of the Telangana state emblem.'),
    p('The Kakatiyas began as samantas of the Western Chalukyas of Kalyani. In the 12th century they became independent and ruled most of the Telugu lands for about 200 years. Their first capital was Hanumakonda; later they built Orugallu (Warangal) with strong stone and mud fort walls.'),
    stepsB('Prola II: made the Kakatiyas powerful in the early 1100s.', 'Rudradeva (Prataparudra I): declared independence; built the Thousand Pillar Temple at Hanumakonda (1163).', 'Ganapatideva (ruled about 1199–1262): united the Telugu-speaking areas, built tanks, encouraged trade through Motupalli port; moved the capital to Orugallu.', 'Rudrama Devi (about 1262–1289): Ganapatideva\'s daughter; ruled as a powerful queen, defeated rivals, and was praised by the Venetian traveller Marco Polo.', 'Prataparudra II: the last Kakatiya king; defeated by the Delhi Sultanate in 1323.'),
    p('Rudrama Devi took the title "Rudradeva Maharaja" and dressed in male royal clothes to rule in a world that did not easily accept a woman ruler. Some nobles rebelled, but she defeated them and the Yadavas of Devagiri.'),
    keys('Capitals: Hanumakonda → Orugallu (Warangal).', 'Ganapatideva: longest reign; Rudrama Devi: famous queen.', 'Prataparudra II: last king (1323).'),
    remember('Marco Polo visited the Kakatiya port of Motupalli and praised Rudrama Devi\'s just rule.'),
  ], [
    ex('Why is Rudrama Devi remembered as a special ruler?', ['She was one of the very few women to rule a big Indian kingdom.', 'She defeated rebels and invaders.', 'A foreign traveller, Marco Polo, praised her rule.'], 'A strong woman ruler praised even by foreign visitors.'),
    ex('About how long did Ganapatideva rule (1199–1262)?', ['1262 − 1199 = 63.'], 'About 63 years'),
  ], [
    orderT('rul', 'Order these Kakatiya rulers from earliest to latest.', ['Prola II', 'Rudradeva', 'Ganapatideva', 'Rudrama Devi', 'Prataparudra II'], ['Rudrama Devi was Ganapatideva\'s daughter.', 'Prataparudra II was the last.'], 'Prola II → Rudradeva → Ganapatideva → Rudrama Devi → Prataparudra II.'),
    mcq('kk', 'Think of Warangal and its rulers.', [
      ['The later capital of the Kakatiyas was…', 'Orugallu (Warangal)', ['Hampi', 'Golconda', 'Thanjavur'], 'Famous for its Kala Thoranam.', 'The Kakatiyas moved their capital to Orugallu.'],
      ['Which foreign traveller praised Rudrama Devi?', 'Marco Polo', ['Vasco da Gama', 'Ibn Battuta', 'Columbus'], 'He came from Venice.', 'Marco Polo praised her rule.'],
      ['Who built the Thousand Pillar Temple at Hanumakonda?', 'Rudradeva', ['Rudrama Devi', 'Krishnadevaraya', 'Akbar'], 'It was built in 1163.', 'Rudradeva built it in 1163.'],
      ['The last Kakatiya king was…', 'Prataparudra II', ['Ganapatideva', 'Prola II', 'Rudradeva'], 'Defeated in 1323.', 'Prataparudra II was defeated by the Delhi Sultanate in 1323.'],
      ['Which Kakatiya ruler ruled the longest and united the Telugu lands?', 'Ganapatideva', ['Rudrama Devi', 'Prataparudra II', 'Beta I'], 'About 63 years.', 'Ganapatideva ruled about 1199–1262.'],
    ]),
    yearsT('yrs', [
      ['Rudradeva built the Thousand Pillar Temple', 1163, 'Ganapatideva became king', 1199],
      ['Ganapatideva became king', 1199, 'Rudrama Devi began to rule', 1262],
      ['Rudrama Devi began to rule', 1262, 'the Kakatiya kingdom fell', 1323],
      ['The Ramappa temple was built', 1213, 'Ramappa became a UNESCO World Heritage Site', 2021],
      ['The Thousand Pillar Temple was built', 1163, 'the Kakatiya kingdom fell', 1323],
    ]),
  ]),
  O('ts7.ss.kakatiya.nayankara', 'The Nayankara system', [
    h('Land for soldiers'),
    p('How did the Kakatiyas keep a large army without paying every soldier in cash? They used the nayankara system.'),
    def('Nayaka', 'A military chief or commander who received the right to collect revenue from some villages in return for maintaining soldiers and serving the king.'),
    def('Nayankara system', 'A system in which nayakas were given land (or revenue rights over villages) on the condition that they kept a fixed number of soldiers, horses and elephants for the king and sent a share of revenue.'),
    stepsB('The king assigns villages to a nayaka.', 'The nayaka collects revenue from those villages.', 'He uses part of it to keep soldiers, horses and elephants ready.', 'He sends a share to the king and fights for him in wars.', 'If he disobeys, the king can take back the villages.'),
    p('The system helped the Kakatiyas defend a large kingdom and expand cultivation, because nayakas built tanks and settled new villages. Many nayakas came from farming communities, so people of different backgrounds rose in power. The later Vijayanagara kings used a similar system (amaranayakas).'),
    keys('Nayakas got villages in return for keeping troops.', 'The king could take back the land.', 'Nayakas also developed agriculture and tanks.'),
    remember('Nayankara = land in exchange for military service.'),
  ], [
    ex('Why did the king prefer the nayankara system to paying soldiers in cash?', ['Cash was scarce and hard to collect centrally.', 'Giving revenue rights made nayakas responsible for paying and keeping troops.', 'The king got an army ready for war.'], 'It provided an army without the king paying salaries directly.'),
    ex('What could happen if a nayaka stopped sending troops?', ['The grant depended on service.', 'The king could cancel it and give the villages to someone else.'], 'He could lose his villages.'),
  ], [
    orderT('nay', 'Order how the nayankara system worked.', ['The king assigns villages to a nayaka', 'The nayaka collects revenue from the villages', 'He maintains soldiers, horses and elephants', 'He sends a share to the king and fights in wars'], ['Land is given first.', 'Service in war comes last.'], 'Grant → collect revenue → keep army → serve the king.', 4),
    mcq('nq', 'Land in return for service.', [
      ['Under the nayankara system, nayakas received…', 'revenue rights over villages in return for keeping soldiers', ['salaries from Delhi', 'nothing at all', 'factories'], 'Land for service.', 'Nayakas got villages for maintaining troops.'],
      ['A nayaka was mainly a…', 'military chief', ['priest', 'merchant', 'weaver'], 'He led soldiers.', 'Nayakas were military commanders.'],
      ['A similar system in Vijayanagara was called the…', 'amaranayaka system', ['zabt system', 'subsidiary alliance', 'factory system'], 'Also used nayakas.', 'Vijayanagara had amaranayakas.'],
      ['How did nayakas help agriculture?', 'They built tanks and settled new villages', ['They banned farming', 'They burnt villages', 'They only collected taxes'], 'More farms = more revenue.', 'Nayakas built tanks and expanded cultivation.'],
    ]),
    tapT('feat', 'Tap the TRUE features of the nayankara system.', [
      ['Nayakas kept soldiers for the king', true], ['Nayakas collected revenue from assigned villages', true], ['The king could take back the villages', true], ['A share of revenue went to the king', true],
      ['Nayakas owned the land forever no matter what', false], ['Soldiers were paid by the British', false],
    ], ['The grant depended on loyal service.', 'The British came centuries later.'], 'The grant was conditional on service, with revenue shared.'),
  ]),
  O('ts7.ss.kakatiya.economy', 'Agriculture, temples, trade and the end of the Kakatiyas', [
    h('Tanks, temples and trade'),
    photo('💧', 'Kakatiya tanks such as Ramappa, Pakhal and Laknavaram still irrigate fields today.'),
    p('The Kakatiyas encouraged people to clear forests and farm. Kings, queens, nayakas and rich merchants built thousands of tanks, giving water for paddy, sugarcane and other crops. Building a tank was considered a meritorious act.'),
    p('Temples were built in the Kakatiya style with star-shaped platforms, finely carved black basalt pillars and sculptures. The Ramappa (Rudreshwara) temple at Palampet, built in 1213 by the general Recherla Rudra, is a UNESCO World Heritage Site (since 2021); its tower is made of light bricks that float in water. Other examples: the Thousand Pillar Temple and the Warangal fort gateways.'),
    p('Trade flourished. Merchant guilds traded in cloth, diamonds (from Golconda region mines), and spices. Motupalli on the east coast was an important port; foreign merchants were given protection by Ganapatideva\'s inscription there.'),
    h('The end'),
    p('The Delhi Sultanate attacked Warangal several times. In 1323, an army led by Ulugh Khan (later Muhammad bin Tughlaq) captured Warangal and Prataparudra II. The Kakatiya kingdom ended, but its nayakas such as the Musunuri Nayakas soon fought back and freed parts of Telangana.'),
    keys('Kakatiyas built thousands of tanks.', 'Ramappa temple (1213): UNESCO site, floating bricks.', 'Port of Motupalli; kingdom fell in 1323.'),
    remember('The Kakatiya Kala Thoranam and the Ramappa temple are symbols of Telangana\'s heritage.'),
  ], [
    ex('Why are the bricks of the Ramappa temple tower special?', ['They are very light and porous.', 'They float on water.', 'Lighter bricks reduce weight on the walls.'], 'They are so light they float on water.'),
    ex('How did tanks help the Kakatiya economy?', ['Stored water irrigated more land.', 'More crops meant more food and more revenue.', 'New villages grew around tanks.'], 'They increased farming and revenue.'),
  ], [
    matchT('kk', 'Kakatiya heritage with its fact', [
      ['Ramappa temple', 'UNESCO World Heritage Site with floating bricks'], ['Thousand Pillar Temple', 'Built by Rudradeva at Hanumakonda'], ['Motupalli', 'Kakatiya sea port'], ['Pakhal lake', 'Large Kakatiya tank'], ['Kala Thoranam', 'Stone gateway at Warangal fort'],
    ], ['Ramappa is the UNESCO site.', 'Motupalli is on the coast.']),
    mcq('econ', 'Tanks, temples, trade.', [
      ['The Ramappa temple was built by…', 'Recherla Rudra, a Kakatiya general', ['Akbar', 'Rajaraja Chola', 'Krishnadevaraya'], 'In 1213, at Palampet.', 'General Recherla Rudra built it in 1213.'],
      ['Ramappa became a UNESCO World Heritage Site in…', '2021', ['1947', '1213', '1999'], 'Recently.', 'It was inscribed in 2021.'],
      ['Which port helped Kakatiya trade?', 'Motupalli', ['Calicut', 'Surat', 'Mumbai'], 'On the east coast.', 'Motupalli was the Kakatiya port.'],
      ['Who captured Warangal in 1323?', 'An army of the Delhi Sultanate under Ulugh Khan', ['The British', 'The Mughals under Akbar', 'The Cholas'], 'Later known as Muhammad bin Tughlaq.', 'Ulugh Khan of the Tughlaq dynasty took Warangal.'],
    ]),
    tapT('tank', 'Tap the tanks/lakes built in the Kakatiya period.', [
      ['Ramappa lake', true], ['Pakhal lake', true], ['Laknavaram lake', true], ['Ghanapur lake', true],
      ['Hussain Sagar', false], ['Osman Sagar', false],
    ], ['Hussain Sagar was built under the Qutb Shahis.', 'Osman Sagar was built under the Nizams.'], 'Ramappa, Pakhal, Laknavaram and Ghanapur lakes are Kakatiya tanks.'),
  ]),
]);

// =====================================================================================
// Chapter 13 — The Kings of Vijayanagara
// =====================================================================================
const ch13 = U(13, 'The Kings of Vijayanagara', [
  O('ts7.ss.vijay.city', 'Sources and the city of Vijayanagara', [
    h('The city of victory'),
    photo('🛕', 'The ruins of Hampi, on the Tungabhadra river in Karnataka, were once the capital Vijayanagara.'),
    p('In 1336, two brothers, Harihara and Bukka, founded the Vijayanagara kingdom on the banks of the Tungabhadra. Four dynasties ruled it: Sangama, Saluva, Tuluva and Aravidu. Its capital, Vijayanagara ("city of victory"), is today the village of Hampi, a UNESCO World Heritage Site.'),
    def('Sources', 'The materials from which historians learn about the past: inscriptions, coins, buildings and ruins, literature, and accounts of travellers.'),
    p('Foreign travellers left vivid descriptions: Niccolo de Conti from Italy, Abdur Razzaq from Persia, and Domingo Paes and Fernao Nuniz from Portugal. They wrote about huge markets selling diamonds, pearls, silk and horses, about festivals like Mahanavami, and about the strong walls of the city.'),
    stepsB('Several rings of massive stone walls protected the city.', 'The royal centre had palaces, the Mahanavami platform and the Lotus Mahal.', 'The sacred centre had temples like Virupaksha and Vitthala (with its stone chariot and musical pillars).', 'Canals and tanks brought water from the Tungabhadra for gardens and fields.', 'Busy bazaars sold gems, cloth and horses brought by sea from Arabia and Persia.'),
    keys('Founded 1336 by Harihara and Bukka.', 'Dynasties: Sangama, Saluva, Tuluva, Aravidu.', 'Travellers: Conti, Abdur Razzaq, Paes, Nuniz.'),
    remember('Vijayanagara was defeated at the Battle of Talikota (Rakshasi-Tangadi) in 1565 by an alliance of Deccan Sultanates, and the city was destroyed.'),
  ], [
    ex('Why are travellers\' accounts useful but not perfect sources?', ['They describe what visitors saw: markets, festivals, buildings.', 'But visitors may misunderstand customs or exaggerate.', 'So historians compare them with inscriptions and ruins.'], 'They give vivid details but must be checked against other sources.'),
    ex('How many years did Vijayanagara last from its founding (1336) to the Battle of Talikota (1565)?', ['1565 − 1336 = 229.'], '229 years'),
  ], [
    orderT('dyn', 'Order the Vijayanagara dynasties.', ['Sangama', 'Saluva', 'Tuluva', 'Aravidu'], ['Harihara and Bukka were Sangamas.', 'Krishnadevaraya was a Tuluva; Aravidu came last.'], 'Sangama → Saluva → Tuluva → Aravidu.', 4),
    matchT('trav', 'traveller with his homeland', [
      ['Niccolo de Conti', 'Italy'], ['Abdur Razzaq', 'Persia'], ['Domingo Paes', 'Portugal'], ['Marco Polo', 'Venice (visited the Kakatiya kingdom)'], ['Fernao Nuniz', 'Portugal, a horse trader'],
    ], ['Abdur Razzaq was an ambassador from Persia.', 'Paes and Nuniz were Portuguese.']),
    mcq('vc', 'Think of Hampi and its founders.', [
      ['Vijayanagara was founded in 1336 by…', 'Harihara and Bukka', ['Krishnadevaraya', 'Babur', 'Rudrama Devi'], 'Two brothers.', 'Harihara and Bukka founded it.'],
      ['The ruins of Vijayanagara are at…', 'Hampi', ['Warangal', 'Thanjavur', 'Golconda'], 'On the Tungabhadra.', 'The capital is now Hampi.'],
      ['Vijayanagara was defeated in 1565 at the Battle of…', 'Talikota', ['Panipat', 'Plassey', 'Tarain'], 'Also called Rakshasi-Tangadi.', 'The Deccan Sultanates won at Talikota.'],
      ['Which temple has a famous stone chariot?', 'Vitthala temple', ['Thousand Pillar Temple', 'Brihadeshvara temple', 'Somnath'], 'At Hampi.', 'The stone chariot stands in the Vitthala temple complex.'],
      ['Vijayanagara stood on the banks of the river…', 'Tungabhadra', ['Godavari', 'Musi', 'Kaveri'], 'A tributary of the Krishna.', 'The city was on the Tungabhadra.'],
    ]),
  ]),
  O('ts7.ss.vijay.krishna', 'Armies, amaranayakas and Krishnadevaraya', [
    h('Horses, forts and nayakas'),
    p('Vijayanagara fought constant wars with the Bahmani kingdom and later the Deccan Sultanates over the fertile Raichur doab (land between the Krishna and Tungabhadra). Cavalry was vital, so kings imported fine horses from Arabia and Central Asia through west-coast ports, first from Arab and later Portuguese traders.'),
    def('Amaranayaka', 'A military commander who was given an area (amaram) to govern and collect taxes from, in return for keeping a fixed number of horses, elephants and soldiers for the king and sending tribute. Similar to the Kakatiya nayankara system.'),
    h('Krishnadevaraya (ruled 1509–1529)'),
    stepsB('The greatest Tuluva king; won the Raichur doab (1520) and defeated the Gajapatis of Odisha.', 'Built temples and added grand gateways (raya gopurams) to temples.', 'Founded the town of Nagalapuram and built tanks and canals.', 'A scholar-king: wrote "Amuktamalyada" in Telugu; called "Andhra Bhoja".', 'His court had eight great Telugu poets, the Ashtadiggajas, including Allasani Peddana.'),
    keys('Amaranayakas kept armies in return for territory.', 'Horses imported from Arabia and Central Asia.', 'Krishnadevaraya: 1509–1529, Amuktamalyada, Ashtadiggajas.'),
    remember('"Desa bhashalandu Telugu lessa" ("Telugu is the best of the country\'s languages") is a line from Krishnadevaraya\'s Amuktamalyada.'),
  ], [
    ex('Why were horse traders so important to Vijayanagara?', ['Wars were won with cavalry.', 'Good war horses were not bred in South India.', 'So kings imported them through ports and valued horse traders.'], 'Cavalry needed imported horses.'),
    ex('How long did Krishnadevaraya rule (1509–1529)?', ['1529 − 1509 = 20.'], '20 years'),
  ], [
    mcq('kd', 'Recall Krishnadevaraya and the army.', [
      ['Krishnadevaraya wrote the Telugu work…', 'Amuktamalyada', ['Ramcharitmanas', 'Akbarnama', 'Arthashastra'], 'About the saint Andal.', 'He wrote Amuktamalyada.'],
      ['The eight great poets of Krishnadevaraya\'s court were the…', 'Ashtadiggajas', ['Navaratnas', 'Nayanars', 'Alvars'], 'Ashta = eight.', 'They were called the Ashtadiggajas.'],
      ['Amaranayakas were…', 'military commanders given territory to govern', ['foreign travellers', 'temple priests', 'British officers'], 'Like Kakatiya nayakas.', 'Amaranayakas kept troops in return for land.'],
      ['The land between the Krishna and Tungabhadra was called the…', 'Raichur doab', ['Ganga doab', 'Deccan plateau', 'Kaveri delta'], 'Doab = land between two rivers.', 'The Raichur doab was much fought over.'],
      ['Krishnadevaraya belonged to which dynasty?', 'Tuluva', ['Sangama', 'Aravidu', 'Kakatiya'], 'The third dynasty.', 'He was the greatest Tuluva ruler.'],
    ]),
    tapT('kdf', 'Tap the facts about Krishnadevaraya.', [
      ['He wrote Amuktamalyada in Telugu', true], ['He ruled from 1509 to 1529', true], ['He added raya gopurams to temples', true], ['He was called Andhra Bhoja', true],
      ['He founded Hyderabad', false], ['He was a Mughal emperor', false],
    ], ['He was a Vijayanagara king and a poet.', 'Hyderabad was founded by a Qutb Shahi king.'], 'Amuktamalyada, 1509–1529, raya gopurams and the title Andhra Bhoja belong to him.'),
    yearsT('yrs', [
      ['Vijayanagara was founded', 1336, 'Krishnadevaraya became king', 1509],
      ['Krishnadevaraya became king', 1509, 'he died', 1529],
      ['Krishnadevaraya won the Raichur doab', 1520, 'Vijayanagara lost the Battle of Talikota', 1565],
      ['Vijayanagara was founded', 1336, 'it lost the Battle of Talikota', 1565],
      ['Krishnadevaraya died', 1529, 'Vijayanagara lost the Battle of Talikota', 1565],
    ]),
  ]),
  O('ts7.ss.vijay.qutb', 'The Qutb Shahis of Golconda (1512–1687)', [
    h('Golconda and the birth of Hyderabad'),
    photo('🏢', 'The Charminar, built in 1591, stands at the heart of old Hyderabad.'),
    p('When the Bahmani kingdom broke up, Sultan Quli, its governor at Golconda, became independent in about 1512 and founded the Qutb Shahi dynasty. It ruled most of today\'s Telangana and coastal Andhra until 1687.'),
    stepsB('Sultan Quli Qutb Shah strengthened the Golconda fort.', 'Ibrahim Qutb Shah (1550–1580) patronised Telugu poets, who called him "Malki Bharam"; Hussain Sagar lake was built in his time (1563).', 'Muhammad Quli Qutb Shah founded Hyderabad in 1591 on the Musi river and built the Charminar; he wrote poems in Dakhni Urdu and Telugu.', 'The kingdom grew rich from diamonds (Kollur mines; the Koh-i-Noor is believed to be from this region), textiles and trade through Masulipatnam port.', 'In 1687 the Mughal emperor Aurangzeb captured Golconda after a long siege; Abul Hasan Tana Shah was the last king.'),
    p('The Qutb Shahis ruled over a mixed population. Telugu and Persian were both used in administration, and ministers such as Madanna and Akkanna served Tana Shah. The Qutb Shahi tombs at Ibrahim Bagh are a fine example of their architecture.'),
    keys('Qutb Shahis: 1512–1687, capital Golconda.', 'Muhammad Quli Qutb Shah founded Hyderabad (1591).', 'Aurangzeb conquered Golconda in 1687.'),
    remember('Golconda was famous for diamonds; its fort has acoustics so a clap at the gate can be heard at the top.'),
  ], [
    ex('Why was Golconda so rich?', ['Diamonds from nearby mines.', 'Fine textiles exported through Masulipatnam.', 'Control of fertile Telangana lands.'], 'Diamonds, textiles and trade.'),
    ex('How many years after Hyderabad was founded (1591) did the Mughals capture Golconda (1687)?', ['1687 − 1591 = 96.'], '96 years'),
  ], [
    orderT('qs', 'Order these Qutb Shahi events.', ['Sultan Quli becomes independent at Golconda', 'Hussain Sagar lake is built', 'Muhammad Quli founds Hyderabad and builds Charminar', 'Aurangzeb captures Golconda'], ['Independence came first (about 1512).', 'The Mughal conquest (1687) was last.'], 'c.1512 → 1563 → 1591 → 1687.', 4),
    mcq('q', 'Think of Golconda and Hyderabad.', [
      ['Who founded Hyderabad?', 'Muhammad Quli Qutb Shah', ['Krishnadevaraya', 'Akbar', 'Rudrama Devi'], 'In 1591.', 'Muhammad Quli Qutb Shah founded Hyderabad in 1591.'],
      ['The Charminar was built in…', '1591', ['1336', '1857', '1947'], 'Same year as the city\'s founding.', 'Charminar dates from 1591.'],
      ['Which Qutb Shahi ruler was called "Malki Bharam" by Telugu poets?', 'Ibrahim Qutb Shah', ['Tana Shah', 'Sultan Quli', 'Aurangzeb'], 'He patronised Telugu.', 'Ibrahim Qutb Shah was praised as Malki Bharam.'],
      ['Golconda was captured in 1687 by…', 'Aurangzeb', ['Akbar', 'Babur', 'the British'], 'A Mughal emperor.', 'Aurangzeb took Golconda in 1687.'],
      ['The Qutb Shahis\' main sea port was…', 'Masulipatnam', ['Calicut', 'Surat', 'Kolkata'], 'On the Andhra coast.', 'Masulipatnam (Machilipatnam) was their port.'],
    ]),
    matchT('qm', 'Qutb Shahi person or place with its fact', [
      ['Sultan Quli', 'Founder of the dynasty'], ['Muhammad Quli Qutb Shah', 'Founded Hyderabad in 1591'], ['Tana Shah', 'Last Qutb Shahi king'], ['Madanna and Akkanna', 'Ministers of Tana Shah'], ['Golconda', 'Fort capital famous for diamonds'],
    ], ['Tana Shah was the last.', 'Madanna and Akkanna were ministers.']),
  ]),
]);

// =====================================================================================
// Chapter 14 — Mughal Empire
// =====================================================================================
const ch14 = U(14, 'Mughal Empire', [
  O('ts7.ss.mughal.who', 'Who were the Mughals; relations with other rulers', [
    h('An empire from Kabul to the Deccan'),
    p('The Mughals were descended from two great rulers of Central Asia: Genghis Khan (through the mother\'s side) and Timur (through the father\'s side). Babur, ruler of Kabul, defeated Ibrahim Lodi at the first Battle of Panipat in 1526 and founded the Mughal Empire in India.'),
    stepsB('Babur (1526–1530): won Panipat (1526) using cannons and cavalry tactics.', 'Humayun (1530–1540, 1555–1556): lost to Sher Shah Sur, fled to Persia, regained Delhi.', 'Akbar (1556–1605): expanded the empire and built a strong administration.', 'Jahangir (1605–1627) and Shah Jahan (1627–1658): rich courts; Shah Jahan built the Taj Mahal.', 'Aurangzeb (1658–1707): largest empire, including the Deccan and Golconda; long wars.'),
    p('The Mughals dealt with other rulers in two ways. Those who refused to accept their authority were fought. Many, especially Rajput rulers, accepted Mughal rule and became mansabdars; some married their daughters into the Mughal family. The Sisodiya Rajputs of Mewar resisted for a long time; Rana Pratap fought Akbar at Haldighati (1576). The Marathas under Shivaji challenged Aurangzeb.'),
    keys('Babur won Panipat 1526.', 'Six great Mughals: Babur → Aurangzeb.', 'Alliances with Rajputs; resistance from Mewar and Marathas.'),
    remember('After Aurangzeb\'s death in 1707 the empire weakened and regional states rose.'),
  ], [
    ex('Why did many Rajput rulers become allies of the Mughals?', ['The Mughals were powerful.', 'Allies kept their kingdoms and got high ranks (mansabs).', 'Marriage alliances created family ties.'], 'They kept their lands and gained high positions.'),
    ex('How long did Akbar rule (1556–1605)?', ['1605 − 1556 = 49.'], '49 years'),
  ], [
    orderT('emp', 'Order the Mughal emperors.', ['Babur', 'Humayun', 'Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb'], ['Akbar was Humayun\'s son.', 'Aurangzeb was the last of the great Mughals.'], 'Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb.'),
    mcq('m', 'Think of Panipat and the emperors.', [
      ['Babur founded the Mughal Empire after the first Battle of Panipat in…', '1526', ['1556', '1192', '1757'], 'He defeated Ibrahim Lodi.', 'The first Battle of Panipat was in 1526.'],
      ['Which emperor built the Taj Mahal?', 'Shah Jahan', ['Akbar', 'Babur', 'Aurangzeb'], 'For his wife Mumtaz Mahal.', 'Shah Jahan built the Taj Mahal.'],
      ['Rana Pratap of Mewar fought Akbar at…', 'Haldighati', ['Tarain', 'Talikota', 'Plassey'], 'In 1576.', 'The Battle of Haldighati was in 1576.'],
      ['Which emperor lost his throne to Sher Shah Sur and later regained it?', 'Humayun', ['Akbar', 'Jahangir', 'Babur'], 'He fled to Persia.', 'Humayun lost to Sher Shah and returned in 1555.'],
      ['Who challenged Aurangzeb in the Deccan?', 'Shivaji and the Marathas', ['Rudrama Devi', 'Rajaraja Chola', 'Mahmud of Ghazni'], 'Maratha leader.', 'Shivaji built a Maratha kingdom against the Mughals.'],
    ]),
    yearsT('yrs', [
      ['Babur won the first Battle of Panipat', 1526, 'Akbar became emperor', 1556],
      ['Akbar became emperor', 1556, 'Akbar died', 1605],
      ['Akbar died', 1605, 'Aurangzeb died', 1707],
      ['Babur won the first Battle of Panipat', 1526, 'Aurangzeb captured Golconda', 1687],
      ['Shah Jahan became emperor', 1627, 'Aurangzeb became emperor', 1658],
    ]),
  ]),
  O('ts7.ss.mughal.admin', 'Mansabdars, jagirdars, zabt and Akbar\'s sulh-i kul', [
    h('Running a huge empire'),
    def('Mansabdar', 'An officer holding a mansab (rank). The rank had two numbers: zat (personal rank and salary) and sawar (number of cavalrymen he had to keep).'),
    def('Jagir', 'Revenue from a piece of land assigned to a mansabdar instead of a cash salary. He was a jagirdar, but did not live there or own the land; his agents collected revenue, and jagirs were transferred often.'),
    def('Zabt', 'Akbar\'s revenue system, worked out by his minister Todar Mal: land was measured, average crop yields and prices over 10 years were studied, and a fixed tax in cash was set for each crop.'),
    p('Zamindars were local landholders and village headmen who collected revenue for the empire and kept a share. They were powerful locally and sometimes rebelled when demands were too high.'),
    h('Sulh-i kul: peace with all'),
    p('Akbar ruled over people of many faiths. He held discussions in the Ibadat Khana at Fatehpur Sikri with scholars of many religions. He abolished the jizya tax on non-Muslims and the pilgrim tax. His idea of sulh-i kul ("universal peace") meant that all religions were to be respected and officials should treat everyone fairly. Abul Fazl wrote his history, the Akbarnama.'),
    keys('Mansab = rank (zat + sawar).', 'Jagir = assigned revenue, not ownership.', 'Zabt (Todar Mal); sulh-i kul (Akbar).'),
    remember('Sulh-i kul = peace with all; Akbar abolished jizya in 1564.'),
  ], [
    ex('A mansabdar has a rank of 5,000 zat and 3,000 sawar. What does each number tell us?', ['Zat 5,000 decides his status and salary.', 'Sawar 3,000 is the number of horsemen he must keep.'], 'Zat: personal rank/pay; sawar: cavalry to maintain.'),
    ex('Why were jagirs transferred every few years?', ['So that mansabdars did not become too powerful in one area.', 'They could not build up local support to rebel.'], 'To keep mansabdars loyal and prevent local power bases.'),
  ], [
    matchT('t', 'Mughal term with its meaning', [
      ['Mansab', 'Rank of an officer'], ['Zat', 'Personal rank and salary'], ['Sawar', 'Number of cavalrymen to keep'], ['Jagir', 'Assigned land revenue'], ['Zabt', 'Revenue system based on measured land'], ['Sulh-i kul', 'Peace with all'],
    ], ['Sawar sounds like "rider".', 'Sulh = peace.']),
    mcq('ad', 'Think of Akbar\'s policies.', [
      ['Who designed Akbar\'s zabt revenue system?', 'Todar Mal', ['Abul Fazl', 'Birbal', 'Tansen'], 'Akbar\'s finance minister.', 'Raja Todar Mal designed zabt.'],
      ['Akbar held religious discussions in the…', 'Ibadat Khana at Fatehpur Sikri', ['Red Fort at Delhi', 'Golconda fort', 'Taj Mahal'], 'House of worship.', 'Discussions took place in the Ibadat Khana.'],
      ['Sulh-i kul means…', 'peace with all', ['war with all', 'tax on all', 'land for all'], 'Universal peace.', 'Sulh-i kul means universal peace.'],
      ['Which tax did Akbar abolish?', 'Jizya', ['Zabt', 'Land revenue', 'Customs duty'], 'Tax on non-Muslims.', 'Akbar abolished the jizya in 1564.'],
      ['Who wrote the Akbarnama?', 'Abul Fazl', ['Todar Mal', 'Babur', 'Kabir'], 'Akbar\'s friend and courtier.', 'Abul Fazl wrote the Akbarnama.'],
    ]),
    tapT('jag', 'Tap the TRUE statements about jagirdars.', [
      ['They were mansabdars paid through assigned revenue', true], ['Their jagirs were transferred often', true], ['Their agents collected revenue', true],
      ['They owned the land forever', false], ['They always lived in their jagirs', false], ['They were peasants', false],
    ], ['A jagir was revenue, not ownership.', 'Transfers prevented local power.'], 'Jagirdars received revenue rights, not ownership, and were transferred often.'),
  ]),
  O('ts7.ss.mughal.later', 'The 17th century; Sardar Sarvai Papanna; the Asaf Jahis of Hyderabad', [
    h('Strains in the empire'),
    p('In the 17th century the empire reached its largest size under Aurangzeb, but long Deccan wars drained money. The number of mansabdars grew, jagirs fell short, and peasants were burdened with high revenue demands. Rebellions broke out among Marathas, Jats, Sikhs and others.'),
    h('Sardar Sarvai Papanna'),
    p('Sarvai Papanna (Papadu) Goud, from a toddy-tapper family of Tarikonda near Jangaon, gathered a band of ordinary people in the late 1600s and early 1700s. He built a fort at Khilashapur, captured Mughal forts and even Warangal for a time, and challenged Mughal officials and local zamindars. He was finally captured and killed (around 1710). Folk songs (ballads) in Telangana still celebrate him as a hero of the common people.'),
    h('The Asaf Jahis of Hyderabad'),
    stepsB('1707: Aurangzeb dies; the Mughal centre weakens.', '1713: Mir Qamaruddin is made Mughal governor of the Deccan; given the title Nizam-ul-Mulk.', '1724: he defeats a rival at Shakarkheda and becomes practically independent; founds the Asaf Jahi dynasty as Asaf Jah I.', 'Hyderabad becomes the capital; the rulers are called Nizams.', '1948: Hyderabad State joins the Indian Union.'),
    keys('17th century: biggest empire but rising strain.', 'Sarvai Papanna: a people\'s rebel of Telangana.', 'Asaf Jah I founded Asaf Jahi rule (1724); Nizams ruled till 1948.'),
    remember('The seven Asaf Jahi Nizams ruled Hyderabad from 1724 to 1948.'),
  ], [
    ex('Why is Sarvai Papanna remembered in folk songs?', ['He came from an ordinary family, not royalty.', 'He fought powerful Mughal officials and zamindars.', 'People saw him as a hero of the common folk.'], 'He was a commoner who challenged the powerful.'),
    ex('How many years did the Asaf Jahis rule Hyderabad (1724–1948)?', ['1948 − 1724 = 224.'], '224 years'),
  ], [
    orderT('asaf', 'Order these events.', ['Golconda is captured by Aurangzeb', 'Aurangzeb dies', 'Nizam-ul-Mulk becomes independent as Asaf Jah I', 'Hyderabad State joins the Indian Union'], ['Golconda fell in 1687.', 'The merger was in 1948.'], '1687 → 1707 → 1724 → 1948.', 4),
    mcq('pap', 'Think of Telangana in the 1700s.', [
      ['Sarvai Papanna built his fort at…', 'Khilashapur', ['Golconda', 'Hampi', 'Thanjavur'], 'Near Jangaon.', 'His fort was at Khilashapur.'],
      ['The founder of the Asaf Jahi dynasty was…', 'Mir Qamaruddin (Nizam-ul-Mulk, Asaf Jah I)', ['Muhammad Quli Qutb Shah', 'Aurangzeb', 'Tana Shah'], 'Mughal governor of the Deccan.', 'Nizam-ul-Mulk became Asaf Jah I in 1724.'],
      ['Asaf Jahi rulers were called…', 'Nizams', ['Rajas', 'Peshwas', 'Nawabs of Bengal'], 'From Nizam-ul-Mulk.', 'They were the Nizams of Hyderabad.'],
      ['Why did the Mughal Empire weaken in the late 1600s?', 'Long Deccan wars, shortage of jagirs and peasant revolts', ['There were no wars', 'Taxes were abolished', 'The British ruled it already'], 'Money and land ran short.', 'Costly wars and a jagir crisis weakened it.'],
      ['Sarvai Papanna came from a family of…', 'toddy tappers', ['kings', 'Mughal nobles', 'Portuguese traders'], 'Goud community.', 'He was from a toddy-tapper (Goud) family.'],
    ]),
    yearsT('yrs', [
      ['Aurangzeb died', 1707, 'Asaf Jah I became independent', 1724],
      ['Asaf Jah I became independent', 1724, 'Hyderabad joined the Indian Union', 1948],
      ['Golconda was captured by the Mughals', 1687, 'Asaf Jah I became independent', 1724],
      ['Hyderabad was founded', 1591, 'Asaf Jah I became independent', 1724],
      ['Aurangzeb captured Golconda', 1687, 'Aurangzeb died', 1707],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 15 — Establishment of the British Empire in India
// =====================================================================================
const ch15 = U(15, 'Establishment of the British Empire in India', [
  O('ts7.ss.british.company', 'The East India Company: mercantilism and armed traders', [
    h('Traders with guns'),
    p('In 1600 Queen Elizabeth I gave the English East India Company a charter: the sole right to trade with the East. The Portuguese, Dutch and French also came. They competed fiercely, and their ships carried guns and soldiers.'),
    def('Mercantilism', 'An economic idea of 16th–18th century Europe: a country becomes rich by exporting more than it imports and collecting gold and silver; colonies should supply cheap raw materials and buy its finished goods.'),
    stepsB('The Company set up "factories" (trading posts) at Surat (1613), Madras (Fort St George, 1639), Bombay and Calcutta (1690s).', 'It bought cotton and silk cloth, indigo, pepper and saltpetre to sell in Europe.', 'It fortified its posts and hired Indian soldiers (sepoys).', 'Trade disputes with rulers turned into wars.', '1757: at the Battle of Plassey, Robert Clive defeated Siraj-ud-Daulah, Nawab of Bengal, helped by the treachery of Mir Jafar.', '1764: the Battle of Buxar; the next year the Company got the diwani (right to collect revenue) of Bengal.'),
    keys('EIC charter: 1600.', 'Mercantilism: export more, import less, collect gold.', 'Plassey 1757; Buxar 1764; diwani 1765.'),
    remember('With Bengal\'s revenue the Company paid for its army and its trade, turning traders into rulers.'),
  ], [
    ex('Why did European trading companies keep armies?', ['They competed with each other and sometimes fought.', 'They wanted to protect forts and force favourable trade terms.'], 'To fight rivals and protect and expand trade.'),
    ex('How many years after its charter (1600) did the Company win at Plassey (1757)?', ['1757 − 1600 = 157.'], '157 years'),
  ], [
    orderT('eic', 'Order these events.', ['East India Company gets its charter', 'A factory is set up at Surat', 'Battle of Plassey', 'Battle of Buxar', 'Company gets the diwani of Bengal'], ['The charter came first (1600).', 'The diwani followed Buxar.'], '1600 → 1613 → 1757 → 1764 → 1765.'),
    mcq('c', 'Think of Plassey and mercantilism.', [
      ['The Battle of Plassey (1757) was won by…', 'Robert Clive of the East India Company', ['Siraj-ud-Daulah', 'Tipu Sultan', 'Akbar'], 'Mir Jafar betrayed the Nawab.', 'Clive defeated Siraj-ud-Daulah.'],
      ['Mercantilism says a country becomes rich by…', 'exporting more than it imports and collecting gold and silver', ['importing everything', 'giving away its gold', 'stopping all trade'], 'Gold flows in.', 'Mercantilists wanted a surplus of exports.'],
      ['The "diwani" given to the Company in 1765 was the right to…', 'collect revenue in Bengal', ['build temples', 'print books', 'sail to China'], 'Diwan = revenue officer.', 'The diwani was the right to collect land revenue.'],
      ['Indian soldiers in the Company\'s army were called…', 'sepoys', ['mansabdars', 'nayakas', 'zamindars'], 'From the Persian sipahi.', 'Sepoys were Indian soldiers of the Company.'],
      ['Which queen granted the East India Company its charter?', 'Elizabeth I', ['Victoria', 'Mary', 'Anne'], 'In 1600.', 'Queen Elizabeth I issued the charter in 1600.'],
    ]),
    matchT('m', 'item with what it is', [
      ['Surat', 'Early English factory (trading post)'], ['Plassey', 'Battle of 1757'], ['Buxar', 'Battle of 1764'], ['Saltpetre', 'Used to make gunpowder'], ['Charter', 'Royal permission to trade'],
    ], ['Two are battles.', 'Saltpetre is a chemical.']),
  ]),
  O('ts7.ss.british.rule', 'Interference in Indian kingdoms and the Revolt of 1857', [
    h('From allies to masters'),
    def('Subsidiary Alliance', 'A system introduced by Lord Wellesley (1798): an Indian ruler had to keep a Company army in his state and pay for it, could not keep his own army or make alliances without British permission, and had a British Resident at his court. The Nizam of Hyderabad was the first to accept it (1798).'),
    def('Doctrine of Lapse', 'Lord Dalhousie\'s policy: if a ruler died without a natural-born son, his kingdom "lapsed" to the Company. Satara, Jhansi and Nagpur were taken this way. Awadh was annexed in 1856 on the charge of misrule.'),
    h('The Revolt of 1857'),
    stepsB('Sepoys were angry about low pay, service overseas and rumours that new cartridges were greased with cow and pig fat.', 'Peasants and rulers were angry about high taxes and lost kingdoms.', '10 May 1857: sepoys at Meerut rebel and march to Delhi.', 'They proclaim the old Mughal emperor Bahadur Shah Zafar their leader.', 'The revolt spreads: Rani Lakshmibai (Jhansi), Nana Saheb (Kanpur), Begum Hazrat Mahal (Lucknow), Kunwar Singh (Bihar), Tantia Tope.', 'By 1858 the British recapture Delhi and crush the revolt with great force.'),
    keys('Subsidiary Alliance (1798): Nizam first.', 'Doctrine of Lapse: Jhansi, Satara, Nagpur.', 'Revolt began at Meerut, 10 May 1857.'),
    remember('Bahadur Shah Zafar was exiled to Rangoon (Yangon), and the Mughal dynasty ended.'),
  ], [
    ex('Why did Rani Lakshmibai fight the British?', ['Her husband died; their adopted son was not accepted as heir.', 'Under the Doctrine of Lapse, Jhansi was annexed.', 'She fought to defend her kingdom.'], 'Jhansi was taken under the Doctrine of Lapse.'),
    ex('How did the Subsidiary Alliance weaken Indian rulers?', ['They had to disband their own armies.', 'They paid for British troops.', 'A British Resident controlled their decisions.'], 'They lost military power and independence.'),
  ], [
    matchT('leaders', 'leader of 1857 with the place', [
      ['Rani Lakshmibai', 'Jhansi'], ['Nana Saheb', 'Kanpur'], ['Begum Hazrat Mahal', 'Lucknow'], ['Kunwar Singh', 'Bihar'], ['Bahadur Shah Zafar', 'Delhi'],
    ], ['The emperor was in Delhi.', 'Lucknow was the capital of Awadh.']),
    mcq('r', 'Policies and the revolt.', [
      ['Who introduced the Subsidiary Alliance?', 'Lord Wellesley', ['Lord Dalhousie', 'Robert Clive', 'Lord Curzon'], '1798.', 'Wellesley introduced it in 1798.'],
      ['Which ruler first accepted the Subsidiary Alliance?', 'The Nizam of Hyderabad', ['Tipu Sultan', 'Rani Lakshmibai', 'Ranjit Singh'], 'In 1798.', 'The Nizam accepted it first.'],
      ['The Revolt of 1857 began at…', 'Meerut', ['Hyderabad', 'Madras', 'Bombay'], 'On 10 May.', 'Sepoys rebelled at Meerut on 10 May 1857.'],
      ['The rebels declared which person their leader?', 'Bahadur Shah Zafar', ['Lord Dalhousie', 'Akbar', 'Shivaji'], 'The last Mughal emperor.', 'Bahadur Shah Zafar was proclaimed leader.'],
      ['The Doctrine of Lapse took over kingdoms when…', 'a ruler died without a natural-born son', ['a ruler won a war', 'it rained too little', 'trade grew'], 'Adopted sons not accepted.', 'Kingdoms "lapsed" without a natural heir.'],
    ]),
    tapT('cause', 'Tap the causes of the Revolt of 1857.', [
      ['Rumours of greased cartridges', true], ['Annexation of kingdoms like Jhansi and Awadh', true], ['High land revenue on peasants', true], ['Low pay and poor treatment of sepoys', true],
      ['The building of the Charminar', false], ['The Battle of Tarain', false],
    ], ['Think of sepoys, rulers and peasants.', 'Two options are from other centuries.'], 'Cartridges, annexations, taxes and sepoy grievances caused the revolt.'),
  ]),
  O('ts7.ss.british.after', 'After the revolt; Hyderabad State and the British', [
    h('Rule by the Crown'),
    stepsB('1858: the British Parliament ends Company rule; India is ruled directly by the British Crown.', 'A Viceroy rules on behalf of the Crown; a Secretary of State in London oversees India.', 'Queen Victoria\'s Proclamation (1858) promises not to annex more princely states and to respect religious customs.', 'The army is reorganised: more British soldiers, fewer Indians from regions that rebelled.', 'Princely states such as Hyderabad continue under their rulers, but under British supervision.'),
    h('Hyderabad in 1857'),
    p('The Nizam and his chief minister Salar Jung I stayed loyal to the British. But in July 1857, Turrebaz Khan and Moulvi Allauddin led a band of rebels in an attack on the British Residency in Hyderabad. The attack failed; Turrebaz Khan was later captured and killed. Rebels also rose in places like Aurangabad and among Rohillas in the districts.'),
    p('After 1857 the British rewarded the Nizam with titles and returned some districts. A British Resident stayed at Hyderabad, and British troops were stationed at the Secunderabad cantonment. Salar Jung I modernised the state\'s administration, revenue, courts and education.'),
    keys('1858: Crown rule; Viceroy.', 'Queen\'s Proclamation: no more annexations.', 'Hyderabad 1857: Turrebaz Khan attacked the Residency.'),
    remember('Koti Women\'s College in Hyderabad occupies the old British Residency building, where Turrebaz Khan\'s attack took place.'),
  ], [
    ex('Why did the British stop annexing princely states after 1858?', ['Annexations had angered rulers and helped cause the revolt.', 'Loyal princes had helped the British.', 'So the Crown promised to protect their thrones.'], 'To keep loyal princes on their side and avoid another revolt.'),
    ex('Who ruled India after 1858, and through whom?', ['The British Crown and Parliament.', 'Through the Viceroy in India and the Secretary of State in London.'], 'The British Crown, through the Viceroy.'),
  ], [
    orderT('aft', 'Order these events.', ['Revolt begins at Meerut', 'Turrebaz Khan attacks the Residency in Hyderabad', 'British recapture Delhi', 'Queen Victoria\'s Proclamation'], ['Meerut was May 1857; Hyderabad was July 1857.', 'The Proclamation came in 1858.'], 'Meerut → Hyderabad attack → Delhi recaptured → Proclamation.', 4),
    mcq('h', 'Hyderabad and the British after 1857.', [
      ['Who led the attack on the British Residency at Hyderabad in 1857?', 'Turrebaz Khan', ['Salar Jung I', 'Rani Lakshmibai', 'Robert Clive'], 'With Moulvi Allauddin.', 'Turrebaz Khan led the attack in July 1857.'],
      ['After 1858 India was ruled directly by…', 'the British Crown', ['the East India Company', 'the Mughal emperor', 'the Nizam'], 'Company rule ended.', 'The Crown took over in 1858.'],
      ['Who was the Nizam\'s chief minister who modernised Hyderabad\'s administration?', 'Salar Jung I', ['Todar Mal', 'Abul Fazl', 'Madanna'], 'His family collection became a famous museum.', 'Salar Jung I carried out reforms.'],
      ['The Queen\'s Proclamation (1858) promised to…', 'stop annexing princely states and respect religious customs', ['abolish all taxes', 'leave India immediately', 'make the Nizam emperor'], 'Reassure princes and people.', 'It promised no further annexations.'],
      ['British troops near Hyderabad were stationed at…', 'Secunderabad cantonment', ['Golconda only', 'Warangal fort', 'Hampi'], 'A twin city of Hyderabad.', 'The Secunderabad cantonment housed British troops.'],
    ]),
    tapT('crown', 'Tap the changes made by the British after 1857.', [
      ['Company rule ended; the Crown took over', true], ['A Viceroy was appointed', true], ['Annexation of princely states stopped', true], ['The army was reorganised', true],
      ['India became independent', false], ['The Mughal emperor got more power', false],
    ], ['Independence came in 1947.', 'The Mughal emperor was exiled.'], 'Crown rule, the Viceroy, no annexations and army changes followed 1857.'),
  ]),
]);

// =====================================================================================
// Chapter 16 — Making of Laws in the State Assembly
// =====================================================================================
const ch16 = U(16, 'Making of Laws in the State Assembly', [
  O('ts7.ss.assembly.mla', 'The Legislative Assembly and election of MLAs', [
    h('Who makes laws for Telangana?'),
    photo('🏢', 'The Telangana Legislative Assembly meets in Hyderabad.'),
    p('India is a federal country: some matters are decided by the Union (central) government and some by state governments. Laws for the state on subjects like police, agriculture, health and local government are made by the state legislature.'),
    def('Legislative Assembly (Vidhan Sabha)', 'The house of elected representatives of a state. Telangana\'s Assembly has 119 elected members (MLAs).'),
    def('Constituency', 'An area whose voters elect one representative. Telangana is divided into 119 Assembly constituencies.'),
    stepsB('The Election Commission announces the election.', 'Candidates of parties and independents file nominations.', 'Campaigning: meetings, posters, door-to-door visits.', 'Voting day: every citizen aged 18 or above votes secretly using an EVM.', 'Counting: the candidate with the most votes in each constituency becomes the MLA for 5 years.'),
    p('To be an MLA, a person must be a citizen of India and at least 25 years old. Some constituencies are reserved so that only candidates from Scheduled Castes (SC) or Scheduled Tribes (ST) can contest, ensuring that these communities are represented. All voters of that area still vote.'),
    keys('Telangana Assembly: 119 MLAs.', 'Voting age 18; MLA age 25; term 5 years.', 'Reserved constituencies for SC and ST.'),
    remember('In a reserved constituency, only SC (or ST) candidates can stand, but everyone in the constituency votes.'),
  ], [
    ex('Why are some constituencies reserved for SC and ST candidates?', ['These communities faced discrimination and were under-represented.', 'Reservation ensures they have a voice in law-making.'], 'To ensure fair representation for SC and ST communities.'),
    ex('In a constituency, candidate A gets 52,000 votes, B gets 47,000 and C gets 8,000. Who wins?', ['The candidate with the most votes wins (even without more than half of all votes).', '52,000 is the highest.'], 'Candidate A'),
  ], [
    orderT('elect', 'Order the steps of an Assembly election.', ['Election is announced', 'Candidates file nominations', 'Campaigning', 'Voting by secret ballot on EVMs', 'Counting and declaration of results'], ['Candidates must register before campaigning.', 'Results come last.'], 'Announcement → nominations → campaign → voting → counting.'),
    mcq('mla', 'Numbers and rules of the Assembly.', [
      ['How many elected members does the Telangana Legislative Assembly have?', '119', ['294', '543', '40'], 'Same as the number of constituencies.', 'Telangana has 119 Assembly constituencies.'],
      ['The minimum age to become an MLA is…', '25 years', ['18 years', '21 years', '35 years'], 'Older than the voting age.', 'An MLA must be at least 25.'],
      ['The minimum voting age in India is…', '18 years', ['16 years', '21 years', '25 years'], 'Since 1989.', 'Citizens aged 18 and above can vote.'],
      ['An MLA is normally elected for…', '5 years', ['2 years', '10 years', 'life'], 'Same as the Lok Sabha.', 'The Assembly\'s term is 5 years.'],
      ['Who conducts elections in India?', 'The Election Commission', ['The Chief Minister', 'The District Collector alone', 'Political parties'], 'An independent body.', 'The Election Commission conducts elections.'],
    ]),
    tp('vote', (r) => {
      const a = r.int(40, 70) * 1000, b = r.int(20, 39) * 1000, c = r.int(2, 15) * 1000;
      return numQ(`In an Assembly constituency (illustrative), the winner got ${a.toLocaleString('en-IN')} votes and the runner-up got ${b.toLocaleString('en-IN')} votes; a third candidate got ${c.toLocaleString('en-IN')}. By how many votes did the winner win (the margin)?`, a - b,
        ['Margin = winner\'s votes − runner-up\'s votes.', 'Ignore the third candidate.'], [`${a} − ${b} = ${a - b}`], [{ when: String(a - b - c), explain: 'Do not subtract the third candidate. The margin compares only the top two.' }], 0.001, 'votes');
    }, 2),
  ]),
  O('ts7.ss.assembly.govt', 'Forming the government: Chief Minister and Council of Ministers', [
    h('Majority makes the government'),
    p('After the election, the party (or group of parties) that has a majority of MLAs forms the government. In Telangana, a majority means at least 60 of the 119 MLAs.'),
    stepsB('The majority party elects its leader.', 'The Governor invites that leader to become Chief Minister (CM).', 'The CM chooses ministers; the Governor appoints them.', 'Each minister heads departments such as education, health or agriculture.', 'The government must keep the support of the majority in the Assembly; MLAs who are not in the government form the opposition.'),
    def('Governor', 'The constitutional head of the state, appointed by the President of India. The Governor acts mostly on the advice of the Council of Ministers.'),
    def('Council of Ministers', 'The CM and ministers who run the government departments and are together responsible to the Assembly.'),
    def('Opposition', 'MLAs not in the government. They ask questions, criticise policies and keep the government accountable.'),
    keys('Majority in Telangana: 60 of 119.', 'Governor appoints the CM and ministers.', 'Opposition keeps the government accountable.'),
    remember('The Governor is the formal head; the Chief Minister is the real head of the state government.'),
  ], [
    ex('Party X wins 64 seats, Party Y 40 and others 15 in Telangana. Who forms the government?', ['Majority = 60 of 119.', '64 ≥ 60.', 'Party X has a majority.'], 'Party X'),
    ex('Why is the opposition important in a democracy?', ['It questions the government in the Assembly.', 'It points out mistakes and suggests alternatives.', 'This keeps the government careful and accountable.'], 'It keeps the government accountable.'),
  ], [
    tp('maj', (r) => {
      const total = r.pick([119, 175, 224, 234, 288, 403]);
      const maj = Math.floor(total / 2) + 1;
      return numQ(`A state assembly has ${total} seats. What is the smallest number of seats a party needs for a majority (more than half)?`, maj,
        [`Half of ${total} is ${total / 2}.`, 'A majority must be MORE than half, so take the next whole number.'],
        [`${total} ÷ 2 = ${total / 2}`, `More than half → ${maj} seats`], [{ when: String(total / 2), explain: 'Exactly half is not a majority; you need more than half.' }], 0.001, 'seats');
    }, 2),
    mcq('gov', 'Who does what in the state government.', [
      ['Who appoints the Chief Minister?', 'The Governor', ['The President directly', 'The Prime Minister', 'The Collector'], 'The formal head of the state.', 'The Governor invites and appoints the majority leader as CM.'],
      ['Who appoints the Governor?', 'The President of India', ['The Chief Minister', 'The voters', 'The Speaker'], 'From the Union level.', 'The President appoints the Governor.'],
      ['MLAs who are not part of the ruling party or alliance form the…', 'opposition', ['cabinet', 'judiciary', 'Election Commission'], 'They oppose and question.', 'They are the opposition.'],
      ['The real head of a state government is the…', 'Chief Minister', ['Governor', 'Speaker', 'Collector'], 'Leader of the majority.', 'The CM leads the government.'],
    ]),
    orderT('form', 'Order how a state government is formed.', ['Election results are declared', 'The majority party elects its leader', 'The Governor appoints the leader as Chief Minister', 'Ministers are appointed and given departments'], ['Results first.', 'Departments are given last.'], 'Results → leader chosen → CM appointed → ministers.', 4),
  ]),
  O('ts7.ss.assembly.laws', 'The Legislative Council and how laws are made', [
    h('Two houses in Telangana'),
    def('Legislative Council (Vidhan Parishad)', 'The upper house in some states, including Telangana (40 members). Members (MLCs) are elected by MLAs, local bodies, graduates and teachers, and some are nominated by the Governor. It is permanent; one-third retire every two years; members serve 6 years and must be at least 30.'),
    h('From bill to law'),
    stepsB('A minister (or a member) introduces a bill (proposed law) in the Assembly.', 'It is read and debated; members may suggest changes; it may go to a committee.', 'The Assembly votes; if a majority agrees, the bill is passed.', 'It goes to the Legislative Council, which can discuss and suggest changes but cannot stop it for long.', 'The Governor gives assent (signature); the bill becomes an Act (law).'),
    p('The Assembly also passes the budget: the government\'s plan of income and spending for the year. Members ask questions in Question Hour to hold ministers to account. People and the media can influence laws by raising issues, protesting peacefully, and giving suggestions.'),
    keys('Telangana has two houses: Assembly (119) and Council (40).', 'Bill → debate → vote → Council → Governor\'s assent → Act.', 'The Assembly passes the budget.'),
    remember('A bill becomes a law only after the Governor signs it.'),
  ], [
    ex('A bill to protect village tanks is passed by the Assembly. What happens next?', ['It goes to the Legislative Council for discussion.', 'Then to the Governor for assent.', 'After assent it becomes an Act.'], 'Council discussion, then the Governor\'s assent.'),
    ex('How is an MLC different from an MLA?', ['MLAs are directly elected by voters for 5 years.', 'MLCs are mostly indirectly elected or nominated, for 6 years.'], 'MLAs: direct, 5 years; MLCs: mostly indirect, 6 years.'),
  ], [
    orderT('bill', 'Order the steps by which a bill becomes a law in Telangana.', ['Bill introduced in the Assembly', 'Debate and discussion', 'Vote in the Assembly', 'Discussion in the Legislative Council', 'Governor gives assent'], ['Introduction comes first.', 'The Governor signs last.'], 'Introduce → debate → vote → Council → assent.'),
    matchT('two', 'item with Assembly or Council fact', [
      ['Legislative Assembly', '119 members directly elected'], ['Legislative Council', '40 members, mostly indirectly elected'], ['MLA term', '5 years'], ['MLC term', '6 years'], ['Governor\'s assent', 'Turns a bill into an Act'], ['Budget', 'Plan of yearly income and spending'],
    ], ['Assembly is directly elected.', 'Council members serve longer.']),
    mcq('law', 'Bills and houses.', [
      ['A proposed law is called a…', 'bill', ['budget', 'verdict', 'charter'], 'It becomes an Act later.', 'A bill is a draft law.'],
      ['How many members does the Telangana Legislative Council have?', '40', ['119', '17', '250'], 'Smaller than the Assembly.', 'The Council has 40 members.'],
      ['The minimum age for an MLC is…', '30 years', ['18 years', '25 years', '40 years'], 'Older than for an MLA.', 'An MLC must be at least 30.'],
      ['The time in the Assembly when members question ministers is…', 'Question Hour', ['Zero budget', 'Recess', 'Polling'], 'Usually the first hour.', 'Question Hour holds ministers accountable.'],
    ]),
  ]),
]);

// =====================================================================================
// Chapter 17 — Implementation of Laws in the District
// =====================================================================================
const ch17 = U(17, 'Implementation of Laws in the District', [
  O('ts7.ss.district.collector', 'The District Collector and Magistrate', [
    h('The head of the district'),
    p('Laws are made in Hyderabad, but they must work in every village. Telangana has 33 districts. In each district, the government\'s work is led by the District Collector.'),
    def('District Collector', 'An IAS officer who heads the district administration: collects land revenue, maintains land records, oversees development schemes, elections, relief during floods or droughts, and coordinates all departments.'),
    def('District Magistrate', 'The Collector also works as District Magistrate, responsible for law and order along with the Superintendent of Police; can issue prohibitory orders in emergencies.'),
    stepsB('Revenue: land revenue and land records.', 'Law and order: with the police.', 'Development: schools, health, roads, welfare schemes.', 'Disaster management: floods, droughts, epidemics.', 'Elections: as District Election Officer.'),
    p('The Collector holds weekly grievance days (Prajavani) where citizens can bring complaints directly. Collectors work with district officers of each department (education, health, agriculture) and with elected local bodies such as the Zilla Parishad.'),
    keys('Telangana: 33 districts.', 'Collector: revenue, development, disaster, elections.', 'Also District Magistrate for law and order.'),
    remember('The Collector is appointed by the government, not elected. MLAs and MPs are elected.'),
  ], [
    ex('A flood hits villages near the Godavari. What would the Collector do?', ['Coordinate rescue with police, fire services and disaster teams.', 'Open relief camps with food, water and medicines.', 'Assess losses and arrange compensation.'], 'Lead rescue, relief and compensation.'),
    ex('Why is the Collector called the "Collector"?', ['The post began under British rule.', 'The main job then was to collect land revenue.'], 'Because the original duty was collecting land revenue.'),
  ], [
    tapT('duties', 'Tap the duties of a District Collector.', [
      ['Maintaining land records', true], ['Organising flood relief', true], ['Conducting elections in the district', true], ['Overseeing welfare schemes', true], ['Hearing public grievances', true],
      ['Passing laws in the Assembly', false], ['Judging criminal cases in the High Court', false],
    ], ['Laws are made by MLAs.', 'High Court judges decide appeals.'], 'Land records, relief, elections, schemes and grievances are the Collector\'s work.'),
    mcq('col', 'The Collector heads the district.', [
      ['How many districts does Telangana have?', '33', ['10', '23', '119'], 'Reorganised in 2016 and later.', 'Telangana has 33 districts.'],
      ['The District Collector is usually an officer of the…', 'IAS (Indian Administrative Service)', ['Indian Army', 'Election Commission only', 'High Court'], 'Selected by exam.', 'Collectors are IAS officers.'],
      ['The Collector\'s weekly grievance day in Telangana is called…', 'Prajavani', ['Gram Sabha', 'Question Hour', 'Mission Kakatiya'], 'Voice of the people.', 'Prajavani lets citizens bring complaints.'],
      ['As District Magistrate, the Collector is responsible for…', 'law and order', ['writing textbooks', 'running railways', 'printing money'], 'With the police.', 'The DM maintains law and order.'],
    ]),
    matchT('who', 'official with their level', [
      ['District Collector', 'Head of the district'], ['Revenue Divisional Officer', 'Head of a revenue division'], ['Tahsildar', 'Head of a mandal'], ['Superintendent of Police', 'Head of district police'], ['Zilla Parishad Chairperson', 'Elected head of district local body'],
    ], ['From biggest area to smaller ones.', 'Police and elected bodies are separate.']),
  ]),
  O('ts7.ss.district.tahsildar', 'The Tahsildar (MRO) and village revenue officers', [
    h('Government at the mandal and village'),
    p('Each district is divided into revenue divisions, and each division into mandals. The mandal revenue office (tahsil office) is where most people go for certificates and land matters.'),
    def('Tahsildar (Mandal Revenue Officer, MRO)', 'The officer who heads the mandal revenue office: maintains land records, issues certificates (caste, income, residence), registers some transactions, and handles relief and welfare at the mandal level.'),
    stepsB('A farmer applies for a correction in land records at the tahsil office.', 'Village-level revenue staff check the field and records.', 'The Revenue Inspector verifies and reports.', 'The Tahsildar examines the report and orders the correction.', 'The record (now often online, for example on the Dharani portal) is updated.'),
    p('Village revenue officers and assistants have traditionally kept village land accounts, collected information on crops, helped during disasters and reported births, deaths and problems to the Tahsildar. Telangana has reorganised village-level revenue posts in recent years, and many land services are now online.'),
    keys('District → revenue division → mandal → village.', 'Tahsildar/MRO: land records and certificates.', 'Village revenue staff keep local records.'),
    remember('Income, caste and residence certificates needed for scholarships are issued by the Tahsildar\'s office.'),
  ], [
    ex('Sita needs an income certificate for a scholarship. Where should she apply?', ['Income certificates are revenue documents.', 'They are issued at the mandal level.'], 'At the Tahsildar (MRO) office, or online through Mee Seva.'),
    ex('Order the administrative units from largest to smallest.', ['State → district → revenue division → mandal → village.'], 'State, district, division, mandal, village'),
  ], [
    orderT('units', 'Order the units from largest to smallest.', ['State', 'District', 'Revenue division', 'Mandal', 'Village'], ['A state contains districts.', 'The village is the smallest.'], 'State → district → division → mandal → village.'),
    mcq('tah', 'Mandal-level administration.', [
      ['The officer heading the mandal revenue office is the…', 'Tahsildar (MRO)', ['Collector', 'Governor', 'Sarpanch'], 'Also called Mandal Revenue Officer.', 'The Tahsildar heads the mandal revenue office.'],
      ['Which certificate is issued by the Tahsildar\'s office?', 'Income certificate', ['Driving licence', 'Passport', 'Degree certificate'], 'Used for scholarships.', 'Income, caste and residence certificates come from the tahsil office.'],
      ['Telangana\'s online land records portal is called…', 'Dharani', ['Prajavani', 'Mission Bhagiratha', 'Aadhaar'], 'For land records.', 'Dharani is the land records portal.'],
      ['Who verifies field details before the Tahsildar orders a land record change?', 'Revenue Inspector and village revenue staff', ['The Chief Minister', 'The Governor', 'A school teacher'], 'Field checking.', 'Field staff verify and report to the Tahsildar.'],
    ]),
    tapT('cert', 'Tap documents usually obtained through the mandal revenue office (or Mee Seva).', [
      ['Income certificate', true], ['Caste certificate', true], ['Residence certificate', true], ['Land record extract', true],
      ['Passport', false], ['School marks memo', false],
    ], ['Revenue office = land and certificates.', 'Passports come from the Passport Office.'], 'Income, caste, residence certificates and land records are revenue documents.'),
  ]),
  O('ts7.ss.district.walta', 'How laws are implemented: the Water, Land and Trees Act 2002', [
    h('A law in action'),
    p('In the early 2000s groundwater levels in many places were falling fast because of too many borewells, and trees were being cut. So the then Andhra Pradesh Assembly passed the Water, Land and Trees Act, 2002 (WALTA). It continues to apply in Telangana.'),
    stepsB('Borewells: new wells and borewells need registration/permission; drilling near public drinking-water sources is restricted.', 'Over-exploited areas: in areas where groundwater is over-used, new borewells can be banned.', 'Sand and soil: removing sand from rivers needs permission.', 'Trees: cutting trees needs permission, and planting is required in return.', 'Rainwater harvesting: buildings must have recharge structures.'),
    p('Implementation needs the whole chain: the state notifies rules; the Collector heads the district authority; the Tahsildar and village staff receive applications and inspect; groundwater officials measure water levels; police help stop illegal drilling and sand mining. Citizens can complain if they see violations.'),
    keys('WALTA 2002 protects water, land and trees.', 'Borewells, sand mining and tree felling need permission.', 'Collector, Tahsildar, officials and citizens implement it.'),
    remember('A law is only useful when officials enforce it and citizens support it.'),
  ], [
    ex('A farmer wants to drill a borewell next to the village drinking-water well. What would the law say?', ['WALTA restricts drilling close to public drinking-water sources.', 'His borewell could dry up the village well.', 'Permission would likely be refused.'], 'He would not get permission; it would harm the drinking-water source.'),
    ex('How does WALTA connect to the Collector?', ['The Collector heads the district authority under the Act.', 'Orders, bans and inspections in the district are coordinated by the Collector\'s office.'], 'The Collector leads its implementation in the district.'),
  ], [
    tapT('walta', 'Tap the activities that need permission under WALTA.', [
      ['Drilling a new borewell', true], ['Cutting down trees', true], ['Removing sand from a river bed', true],
      ['Planting a tree in your yard', false], ['Building a rainwater pit', false], ['Drinking water from a tap', false],
    ], ['The law controls actions that harm water, land and trees.', 'Planting and recharge are encouraged, not restricted.'], 'Borewells, tree felling and sand removal need permission.'),
    orderT('impl', 'Order how a law like WALTA reaches a village.', ['The Assembly passes the Act', 'The Governor gives assent', 'The government notifies rules', 'The Collector directs district officials', 'The Tahsildar and village staff inspect and act'], ['Laws are passed before rules are made.', 'Village action is last.'], 'Pass → assent → rules → Collector → mandal and village.'),
    mcq('wq', 'Purpose of WALTA.', [
      ['WALTA stands for…', 'Water, Land and Trees Act', ['World Agriculture and Land Tax Act', 'Women and Labour Act', 'Water and Lake Tourism Act'], 'Three natural resources.', 'WALTA = Water, Land and Trees Act, 2002.'],
      ['Why was WALTA passed?', 'Groundwater levels were falling and trees were being cut', ['There was too much rain', 'To build more factories', 'To stop farming'], 'Protect resources.', 'It aimed to save water, land and trees.'],
      ['Which building feature does WALTA encourage?', 'Rainwater harvesting structures', ['Open drains into rivers', 'Concrete over all ground', 'Extra borewells'], 'Recharge groundwater.', 'Rainwater harvesting recharges groundwater.'],
      ['If you see illegal sand mining from a river, you can…', 'complain to the Tahsildar or Collector', ['ignore it always', 'join in', 'complain to the airport'], 'Citizens help enforcement.', 'Officials act on citizens\' complaints.'],
    ]),
  ]),
]);

// =====================================================================================
// Theme IV — Social Organisation and Inequities
// Chapter 18 — Caste Discrimination and the Struggle for Equalities
// =====================================================================================
const ch18 = U(18, 'Caste Discrimination and the Struggle for Equalities', [
  O('ts7.ss.caste.ambedkar', 'Dr B.R. Ambedkar and discrimination in schools', [
    h('A thirsty boy at school'),
    p('Bhimrao Ambedkar was born in 1891 at Mhow (now in Madhya Pradesh) in the Mahar community, which was treated as "untouchable". At school he and his brother had to sit on a gunny sack they brought from home, apart from other children. When thirsty, he could drink only if the peon poured water into his hands from a height; if the peon was absent, he went thirsty.'),
    def('Untouchability', 'The cruel practice of treating some castes as "impure", refusing to touch them, share water, food, temples or schools with them. It is a crime in India today.'),
    def('Discrimination', 'Treating a person or group unfairly because of who they are, such as caste, religion, gender or disability.'),
    stepsB('1891: born at Mhow.', 'Studied despite humiliation; earned degrees from Columbia University (USA) and the London School of Economics.', '1927: led the Mahad Satyagraha so that Dalits could draw water from a public tank.', 'Founded organisations and newspapers to fight caste discrimination.', '1947–1949: chaired the Drafting Committee of the Indian Constitution.', '1956: died; honoured with the Bharat Ratna in 1990.'),
    keys('Ambedkar faced untouchability even in school.', 'He became a great scholar and leader.', 'He chaired the Constitution\'s Drafting Committee.'),
    remember('Ambedkar\'s message: "Educate, Agitate, Organise."'),
  ], [
    ex('What did the Mahad Satyagraha (1927) demand?', ['Dalits were not allowed to take water from the public Chavdar tank at Mahad.', 'Ambedkar led people to drink water from it.', 'It asserted the equal right to public resources.'], 'Equal right of Dalits to use public water.'),
    ex('How was young Bhimrao discriminated against at school?', ['He had to sit separately on a sack.', 'He could not touch the water tap and depended on a peon to get water.'], 'Separate seating and denial of water.'),
  ], [
    orderT('life', 'Order the events of Dr Ambedkar\'s life.', ['Born at Mhow', 'Studied in the USA and London', 'Led the Mahad Satyagraha', 'Chaired the Constitution Drafting Committee', 'Awarded the Bharat Ratna'], ['Education came before the movements.', 'The Bharat Ratna was given after his death (1990).'], '1891 → studies → 1927 → 1947–49 → 1990.'),
    mcq('amb', 'Recall Ambedkar\'s life.', [
      ['Dr Ambedkar was chairman of the…', 'Drafting Committee of the Constitution', ['Election Commission', 'East India Company', 'Planning Commission'], 'He is called the architect of the Constitution.', 'He chaired the Drafting Committee.'],
      ['The Mahad Satyagraha (1927) was about…', 'the right to draw water from a public tank', ['salt tax', 'land revenue', 'cotton trade'], 'Chavdar tank.', 'It asserted Dalits\' right to public water.'],
      ['Ambedkar\'s famous message was…', 'Educate, Agitate, Organise', ['Do or Die', 'Jai Jawan Jai Kisan', 'Quit India'], 'Three action words.', '"Educate, Agitate, Organise" was his call.'],
      ['Ambedkar was born in…', '1891', ['1857', '1947', '1920'], 'Late 19th century.', 'He was born on 14 April 1891.'],
      ['Treating some people as "impure" and refusing to touch them is called…', 'untouchability', ['cooperation', 'democracy', 'secularism'], 'Banned by Article 17.', 'Untouchability is now a crime.'],
    ]),
    tapT('disc', 'Tap examples of discrimination.', [
      ['Making a child sit separately because of caste', true], ['Refusing water from a common tap to some people', true], ['Not letting someone enter a temple because of caste', true], ['Paying a woman less for the same work', true],
      ['Giving every student the same textbook', false], ['Letting everyone drink from the same tap', false],
    ], ['Discrimination = unfair treatment because of who someone is.', 'Equal treatment is not discrimination.'], 'Separate seating, denial of water or temple entry and unequal pay are discrimination.'),
  ]),
  O('ts7.ss.caste.origins', 'Origins of the caste system and striving for equality', [
    h('How did caste begin?'),
    p('In ancient times, society was described in terms of four varnas: Brahmanas, Kshatriyas, Vaishyas and Shudras. Over centuries many jatis (castes) grew, often linked to occupations, and were arranged in a ranking. Birth decided caste; marriage outside one\'s caste was discouraged; some groups were treated as "untouchable". These rules gave privileges to some and denied rights, education and dignity to others.'),
    p('Many people questioned this. Buddha and Mahavira rejected birth-based superiority; bhakti saints said all are equal before God. In modern times reformers fought caste:'),
    stepsB('Jyotirao Phule (Maharashtra) started schools for girls and lower castes (from 1848) and wrote "Gulamgiri" (Slavery).', 'Narayana Guru (Kerala): "One caste, one religion, one God for humankind."', 'Periyar E.V. Ramasamy (Tamil Nadu) led the Self-Respect Movement.', 'B.S. Venkatrao of Hyderabad (1896–1953), called the "Ambedkar of Hyderabad", worked for Adi-Hindu (Dalit) education and rights, ran hostels and schools, and became a minister in Hyderabad State.', 'Bhagya Reddy Varma (1888–1939) of Hyderabad led the Adi-Hindu movement and started many schools for Dalit children.'),
    keys('Caste: birth-based, ranked groups.', 'Reformers: Phule, Narayana Guru, Periyar, Ambedkar.', 'Hyderabad: B.S. Venkatrao and Bhagya Reddy Varma.'),
    remember('Equality means every person has the same dignity and rights, whatever their birth.'),
  ], [
    ex('Why did reformers like Bhagya Reddy Varma focus on schools?', ['Lower castes had been denied education.', 'Education gives jobs, confidence and the power to claim rights.'], 'Education was key to dignity and equality.'),
    ex('What does Narayana Guru\'s slogan "One caste, one religion, one God for humankind" teach?', ['All humans belong to one family.', 'Divisions by caste are man-made and unfair.'], 'All people are equal.'),
  ], [
    matchT('ref', 'reformer with their work', [
      ['Jyotirao Phule', 'Schools for girls and lower castes; wrote Gulamgiri'], ['Narayana Guru', 'One caste, one religion, one God'], ['Periyar', 'Self-Respect Movement'], ['B.S. Venkatrao', '"Ambedkar of Hyderabad"'], ['Bhagya Reddy Varma', 'Adi-Hindu movement and schools in Hyderabad'],
    ], ['Two of them worked in Hyderabad.', 'Periyar was from Tamil Nadu.']),
    mcq('or', 'Caste and those who fought it.', [
      ['Who was called the "Ambedkar of Hyderabad"?', 'B.S. Venkatrao', ['Salar Jung I', 'Turrebaz Khan', 'Todar Mal'], 'He worked for Adi-Hindu rights.', 'B.S. Venkatrao earned this title.'],
      ['Which reformer wrote "Gulamgiri"?', 'Jyotirao Phule', ['Periyar', 'Kabir', 'Basavanna'], 'Gulamgiri means slavery.', 'Phule wrote Gulamgiri (1873).'],
      ['In the caste system, a person\'s caste was decided by…', 'birth', ['merit', 'election', 'wealth only'], 'It was inherited.', 'Caste was fixed by birth.'],
      ['The Self-Respect Movement was led by…', 'Periyar E.V. Ramasamy', ['Narayana Guru', 'Gandhi', 'Akbar'], 'Tamil Nadu.', 'Periyar started it in 1925.'],
    ]),
    tapT('eq', 'Tap the people who opposed birth-based inequality.', [
      ['Buddha', true], ['Jyotirao Phule', true], ['Bhagya Reddy Varma', true], ['Narayana Guru', true], ['Dr B.R. Ambedkar', true],
      ['Mahmud of Ghazni', false], ['Robert Clive', false],
    ], ['Think of reformers and teachers of equality.', 'A raider and a Company officer are not reformers.'], 'Buddha, Phule, Bhagya Reddy Varma, Narayana Guru and Ambedkar opposed caste inequality.'),
  ]),
  O('ts7.ss.caste.equality', 'Equality after independence', [
    h('The Constitution promises equality'),
    p('Independent India\'s Constitution (in force from 26 January 1950) made equality a fundamental right.'),
    stepsB('Article 14: equality before the law for everyone.', 'Article 15: no discrimination on grounds of religion, race, caste, sex or place of birth; public places like wells, tanks, shops and roads are open to all.', 'Article 17: untouchability is abolished and its practice is a punishable offence.', 'Reservation (affirmative action): seats in education, government jobs, and legislatures for SC, ST and backward classes, to make up for long denial of opportunity.', 'Laws: Protection of Civil Rights Act (1955); SC and ST (Prevention of Atrocities) Act (1989).'),
    p('Laws alone are not enough. Discrimination still happens in some places, in housing, marriage, temples and jobs. Change needs education, awareness and each of us treating everyone with respect. Residential schools and scholarships in Telangana help many SC, ST and BC children study.'),
    keys('Articles 14, 15, 17 guarantee equality and abolish untouchability.', 'Reservations give fair opportunities.', 'Laws punish atrocities, but attitudes must also change.'),
    remember('Article 17 abolished untouchability. Practising it is a crime.'),
  ], [
    ex('Why does the Constitution allow reservation if it promises equality?', ['Some groups were denied education and jobs for centuries.', 'Treating unequal people "the same" keeps them behind.', 'Reservation gives them a fair chance to catch up.'], 'To give a fair chance to groups denied opportunity for centuries.'),
    ex('A hotel refuses to serve a person because of caste. Which Article is broken?', ['Article 15 bans discrimination by caste in public places like shops and hotels.', 'Article 17 also bans untouchability.'], 'Article 15 (and Article 17).'),
  ], [
    matchT('art', 'Constitutional provision with its meaning', [
      ['Article 14', 'Equality before the law'], ['Article 15', 'No discrimination in public places'], ['Article 17', 'Untouchability abolished'], ['Reservation', 'Seats in education and jobs for disadvantaged groups'], ['Atrocities Act 1989', 'Punishes crimes against SC and ST'],
    ], ['17 is about untouchability.', '14 is the general equality article.']),
    mcq('eqa', 'Equality in the Constitution.', [
      ['Which Article abolishes untouchability?', 'Article 17', ['Article 14', 'Article 21', 'Article 370'], 'Seventeen.', 'Article 17 abolishes untouchability.'],
      ['The Indian Constitution came into force on…', '26 January 1950', ['15 August 1947', '2 October 1869', '26 November 1949'], 'Republic Day.', 'It took effect on 26 January 1950.'],
      ['Reservation aims to…', 'give fair opportunities to groups denied them for centuries', ['punish all students', 'stop education', 'favour the rich'], 'Catching up.', 'Reservation is a form of affirmative action.'],
      ['Which law (1989) punishes atrocities against SC and ST people?', 'SC and ST (Prevention of Atrocities) Act', ['WALTA', 'Factory Act', 'Right to Education Act'], 'Prevention of crimes.', 'The 1989 Act protects SC and ST people.'],
    ]),
    tapT('stillq', 'Tap the actions that help end caste discrimination.', [
      ['Sitting and eating together with all classmates', true], ['Reporting untouchability to authorities', true], ['Respecting everyone\'s dignity', true], ['Supporting education for all children', true],
      ['Keeping separate cups for some people', false], ['Refusing to play with a child because of caste', false],
    ], ['Inclusion ends discrimination.', 'Separation and exclusion continue it.'], 'Sharing, reporting, respect and education help end discrimination.'),
  ]),
]);

// =====================================================================================
// Chapter 19 — Livelihood and Struggles of Urban Workers
// =====================================================================================
const ch19 = U(19, 'Livelihood and Struggles of Urban Workers', [
  O('ts7.ss.workers.factory', 'Permanent factory workers and trade unions', [
    h('A secure job'),
    p('Imagine two workers in the same factory near Hyderabad. Ramesh is a permanent worker: he has an appointment letter, a fixed monthly salary, paid leave, provident fund (PF) savings, health insurance (ESI) and cannot be removed without proper reason. Suresh is a contract worker hired through a contractor: he is paid by the day, gets no paid leave and can be sent away any time.'),
    def('Formal (organised) sector', 'Workplaces registered with the government, where labour laws on wages, hours, safety and benefits apply.'),
    def('Trade union', 'An association of workers that bargains together with the employer for fair wages, safe conditions and job security.'),
    stepsB('Workers join a union and elect leaders.', 'The union presents demands (wages, safety, bonus).', 'Talks (collective bargaining) with management.', 'If talks fail: peaceful protests or strikes, as allowed by law.', 'An agreement is signed; conflicts can also go to labour officers or courts.'),
    p('Labour laws set an 8-hour working day, overtime pay, minimum wages, safety rules and benefits. 1 May is celebrated as May Day (International Workers\' Day).'),
    keys('Permanent workers: fixed pay, leave, PF, ESI, job security.', 'Contract workers lack many benefits.', 'Unions bargain collectively for workers.'),
    remember('One worker alone has little power; workers together in a union can bargain.'),
  ], [
    ex('List two differences between a permanent and a contract worker.', ['Permanent: monthly salary, benefits like PF and leave.', 'Contract: daily wage, few benefits, can be removed easily.'], 'Security of job and benefits.'),
    ex('Why are trade unions useful to workers?', ['A single worker cannot easily argue with a big company.', 'United workers can bargain for better wages and safety.'], 'Collective strength in bargaining.'),
  ], [
    orderT('union', 'Order how a trade union raises a demand.', ['Workers form or join a union', 'The union lists demands', 'Union talks with the management', 'If talks fail, peaceful protest', 'An agreement is signed'], ['The union must exist first.', 'Agreement is the goal.'], 'Join → demands → talks → protest if needed → agreement.'),
    matchT('ben', 'benefit with its meaning', [
      ['Provident Fund (PF)', 'Savings for retirement from salary and employer'], ['ESI', 'Health insurance for workers'], ['Paid leave', 'Days off with salary'], ['Minimum wage', 'Lowest pay allowed by law'], ['Overtime', 'Extra pay for extra hours'],
    ], ['PF is for the future.', 'ESI is for health.']),
    mcq('perm', 'Permanent vs contract.', [
      ['Which worker has the most job security?', 'A permanent worker', ['A daily wage worker', 'A contract worker', 'A casual worker'], 'Appointment letter.', 'Permanent workers cannot be removed without reason.'],
      ['May Day (1 May) is celebrated as…', 'International Workers\' Day', ['Teachers\' Day', 'Republic Day', 'Handloom Day'], 'For workers\' rights.', 'May Day honours workers.'],
      ['Labour laws usually fix a working day of…', '8 hours', ['16 hours', '2 hours', '24 hours'], 'The workers\' movement fought for it.', 'The 8-hour day is standard.'],
      ['When a union and management negotiate together, it is called…', 'collective bargaining', ['auction', 'election', 'taxation'], 'Collective = together.', 'Collective bargaining is negotiation by the group.'],
    ]),
  ]),
  O('ts7.ss.workers.informal', 'Construction sites, brick kilns and informal work', [
    h('Work without security'),
    photo('🧱', 'Brick kilns and construction sites employ many seasonal migrant workers.'),
    p('Most workers in Indian cities are in the informal (unorganised) sector: construction labourers, brick kiln workers, street vendors, domestic workers, auto drivers, porters and many others.'),
    def('Informal sector', 'Small, often unregistered work where labour laws are poorly followed: no fixed pay, no paid leave, no social security, and the job can end any day.'),
    stepsB('Construction workers gather at labour addas (street corners) early morning hoping to be hired for the day.', 'Many are migrants from villages in Telangana and other states, coming after crop failure or debt.', 'Brick kiln workers often come as whole families for 6–8 months, paid an advance that ties them to the kiln owner.', 'Working conditions: heavy loads, heat, dust, few safety measures, temporary shelters.', 'Children may miss school when families migrate.'),
    def('Bonded labour', 'Forced labour in which a worker must keep working to repay a loan or advance. It is illegal in India (abolished in 1976).'),
    p('The government has set up a Building and Other Construction Workers Welfare Board, which registers workers and gives benefits like accident insurance and help for children\'s education. Seasonal hostels and worksite schools help migrant children continue learning.'),
    keys('Most urban workers are in the informal sector.', 'Construction and brick kilns rely on migrants.', 'Bonded labour is illegal; welfare boards give some protection.'),
    remember('Bonded labour was abolished by law in 1976.'),
  ], [
    ex('Why do brick kiln families get trapped?', ['They take an advance before the season.', 'Low wages make it hard to repay.', 'They must keep working for the same owner; this can become bonded labour.'], 'Advances and low wages trap them in debt.'),
    ex('Why do construction workers wait at labour addas?', ['They have no permanent employer.', 'Contractors come to hire workers day by day.'], 'They are hired daily with no fixed job.'),
  ], [
    tapT('inf', 'Tap the workers who are usually in the INFORMAL sector.', [
      ['Construction labourer', true], ['Street vendor', true], ['Domestic worker', true], ['Brick kiln worker', true], ['Head-load porter', true],
      ['Permanent bank officer', false], ['Government school teacher', false],
    ], ['Informal = no fixed job security or benefits.', 'Government and bank jobs are formal.'], 'Labourers, vendors, domestic and kiln workers and porters are usually informal.'),
    mcq('bk', 'Migrants, kilns and sites.', [
      ['Forced work to repay a loan is called…', 'bonded labour', ['collective bargaining', 'overtime', 'pension'], 'Bound by debt.', 'Bonded labour is forced work against debt; it is illegal.'],
      ['Bonded labour was abolished in India in…', '1976', ['1857', '1947', '2009'], 'An Act of the 1970s.', 'The Bonded Labour System (Abolition) Act was passed in 1976.'],
      ['Why do many villagers migrate to cities for construction work?', 'Crop failure, debt and lack of work in villages', ['Cities have no jobs', 'They are paid in gold', 'Villages are too crowded with factories'], 'Push factors.', 'Rural distress pushes people to migrate.'],
      ['Which board helps registered construction workers?', 'The Building and Other Construction Workers Welfare Board', ['The Election Commission', 'The Railway Board', 'The Cricket Board'], 'Welfare for builders.', 'This board gives insurance and education help.'],
    ]),
    matchT('wk', 'term with its meaning', [
      ['Labour adda', 'Place where daily workers wait to be hired'], ['Advance', 'Money paid before work begins'], ['Migrant worker', 'Worker who moves from home to find work'], ['Informal sector', 'Work without job security or benefits'], ['Worksite school', 'School for children of migrant workers'],
    ], ['Adda is a gathering place.', 'Migrants move.']),
  ]),
  O('ts7.ss.workers.global', 'Workers\' rights as a global concern; SEWA', [
    h('Workers everywhere'),
    p('Today many goods are made in one country and sold in another. Clothes sold in Europe may be stitched in Bangladesh or Tiruppur. So the rights of workers are a global concern.'),
    def('International Labour Organization (ILO)', 'A United Nations agency (founded 1919) that sets international standards for workers: fair wages, safe workplaces, no child labour, no forced labour, and freedom to form unions.'),
    p('When factories ignore safety, disasters happen, like the collapse of the Rana Plaza garment building in Bangladesh (2013), which killed over 1,100 workers. Afterwards, global brands were pressed to check safety in factories that supplied them.'),
    h('SEWA: women organise'),
    p('In 1972, Ela Bhatt founded SEWA (Self Employed Women\'s Association) in Ahmedabad. Its members are poor women who work for themselves: vendors, home-based workers (stitching, rolling beedis or agarbatti), head-loaders and waste-pickers.'),
    stepsB('Organise women workers into a union.', 'Start a cooperative bank so women can save and borrow at fair rates.', 'Form cooperatives to sell products and get fair prices.', 'Provide health care, child care, insurance and training.', 'Fight for vendors\' rights to sell in public places.'),
    keys('ILO (1919) sets global labour standards.', 'Rana Plaza (2013) showed the cost of unsafe work.', 'SEWA (Ela Bhatt, 1972) organises self-employed women.'),
    remember('SEWA shows that even informal workers can organise and win rights.'),
  ], [
    ex('Why should a shopper in Europe care about a garment worker in Asia?', ['The shirt they buy may have been made in unsafe conditions.', 'Buyers and brands can demand fair and safe work.'], 'Their purchases are linked to that worker\'s conditions.'),
    ex('How did SEWA\'s bank help women vendors?', ['They had been borrowing from moneylenders at very high interest.', 'SEWA bank gave loans at fair rates and let them save safely.'], 'Fair loans and safe savings.'),
  ], [
    mcq('sewa', 'ILO and SEWA.', [
      ['SEWA was founded by…', 'Ela Bhatt', ['Ambedkar', 'Phule', 'Ela Gandhi'], 'In Ahmedabad, 1972.', 'Ela Bhatt founded SEWA.'],
      ['SEWA stands for…', 'Self Employed Women\'s Association', ['Social Equality Workers\' Assembly', 'State Electricity Water Authority', 'South East Workers\' Association'], 'Its members work for themselves.', 'SEWA = Self Employed Women\'s Association.'],
      ['The International Labour Organization was founded in…', '1919', ['1947', '1972', '2013'], 'After the First World War.', 'The ILO was set up in 1919.'],
      ['The Rana Plaza collapse (2013) happened in…', 'Bangladesh', ['India', 'Britain', 'Nigeria'], 'A garment factory building.', 'It was in Bangladesh.'],
      ['Which of these is an ILO standard?', 'No child labour', ['16-hour days', 'No unions allowed', 'Unpaid work'], 'Protecting workers.', 'The ILO opposes child labour.'],
    ]),
    tapT('sw', 'Tap the services SEWA provides to its members.', [
      ['A cooperative bank', true], ['Child care', true], ['Health insurance', true], ['Training and marketing help', true],
      ['Free cars for every member', false], ['Selling weapons', false],
    ], ['Think of savings, health and livelihood.', 'Two options are absurd.'], 'Banking, child care, insurance and training are SEWA services.'),
    orderT('sewao', 'Order these events about workers\' rights.', ['ILO is founded', 'India becomes independent', 'SEWA is founded', 'Bonded labour is abolished in India', 'Rana Plaza collapses'], ['ILO 1919; India 1947.', 'SEWA 1972, bonded labour abolition 1976, Rana Plaza 2013.'], '1919 → 1947 → 1972 → 1976 → 2013.'),
  ]),
]);

// =====================================================================================
// Theme V — Religion and Society
// Chapter 20 — Folk-Religion
// =====================================================================================
const ch20 = U(20, 'Folk - Religion', [
  O('ts7.ss.folk.deities', 'Folk deities of Telangana', [
    h('Goddesses of the village'),
    photo('🪔', 'Village goddesses are worshipped with lamps, turmeric, neem leaves and offerings.'),
    p('Almost every village in Telangana has its own guardian goddess, often a simple stone smeared with turmeric and kumkum under a tree or in a small shrine. People believe she protects the village from disease, drought and danger. Priests are often from the village communities themselves, not only Brahmanas.'),
    stepsB('Pochamma: worshipped to protect from diseases such as smallpox and fever; women offer bonam to her.', 'Maisamma: guardian of village boundaries, tanks and fields; her shrine often stands at the village edge or tank bund.', 'Gangamma: goddess of water; worshipped by fishing and farming communities near tanks and rivers.', 'Yellamma (Renuka): widely worshipped goddess; the Balkampet Yellamma temple in Hyderabad is famous.', 'Potharaju: the brother and guardian of the goddesses; in Bonalu he leads processions with a whip, painted with turmeric.', 'Beerappa: deity of the Kuruma (shepherd) community; festivals with drumming (dappu) and stories (Beerappa katha).'),
    keys('Village goddesses protect from disease, drought and danger.', 'Pochamma, Maisamma, Gangamma, Yellamma, Potharaju, Beerappa.', 'Priests often come from local communities.'),
    remember('Folk religion is the faith of ordinary people, closely tied to their land, water, cattle and health.'),
  ], [
    ex('Why are many Maisamma shrines found at village boundaries or tank bunds?', ['People believe she guards the village, fields and tank.', 'Her shrine at the edge "protects" those entering the village.'], 'She is a guardian of boundaries, tanks and fields.'),
    ex('Which deity is specially worshipped by Kuruma shepherds?', ['Kurumas are a shepherd community.', 'Their deity is Beerappa.'], 'Beerappa'),
  ], [
    matchT('dei', 'deity with what people seek from them', [
      ['Pochamma', 'Protection from diseases'], ['Maisamma', 'Guardian of village boundaries and tanks'], ['Gangamma', 'Goddess of water'], ['Potharaju', 'Brother and guardian of the goddesses'], ['Beerappa', 'Deity of the Kuruma shepherds'], ['Yellamma', 'Goddess worshipped at Balkampet'],
    ], ['Ganga = water.', 'Potharaju leads Bonalu processions.']),
    mcq('fd', 'Folk deities of Telangana.', [
      ['Folk deities are mostly worshipped to…', 'protect the village from disease and danger', ['win elections', 'build factories', 'travel abroad'], 'Village guardians.', 'They are protectors of village life.'],
      ['Who leads Bonalu processions, carrying a whip?', 'Potharaju', ['Pochamma', 'Beerappa', 'Gangamma'], 'Painted with turmeric.', 'Potharaju dances ahead of the procession.'],
      ['Balkampet in Hyderabad has a famous temple of…', 'Yellamma', ['Beerappa', 'Rudrama Devi', 'Basavanna'], 'Renuka.', 'Balkampet Yellamma temple is famous.'],
      ['The Kuruma community traditionally worships…', 'Beerappa', ['Maisamma only', 'Nataraja', 'Vitthala'], 'Shepherds\' deity.', 'Beerappa is the Kuruma deity.'],
    ]),
    tapT('feat', 'Tap the features of folk religion in Telangana villages.', [
      ['Goddesses shown as simple stones with turmeric', true], ['Shrines under trees or at village edges', true], ['Priests from local communities', true], ['Offerings of food, neem and turmeric', true],
      ['Only huge stone temples built by emperors', false], ['Worship allowed only in a foreign language', false],
    ], ['Folk religion is simple and local.', 'Royal temples are a different tradition.'], 'Simple stones, local shrines, local priests and offerings mark folk religion.'),
  ]),
  O('ts7.ss.folk.festivals', 'Community worship: Bonalu, Peerila Panduga, Urs and Jahangir Peer Dargah', [
    h('Festivals that bring everyone together'),
    p('Folk festivals in Telangana are community events: the whole village or neighbourhood joins, whatever their caste or religion.'),
    stepsB('Bonalu: in the month of Ashada (July–August), women carry decorated pots (bonam) of rice cooked with milk and jaggery on their heads to offer to Mahakali / Yellamma / Pochamma. Celebrated at Golconda, Secunderabad (Ujjaini Mahankali) and Lal Darwaza. It is an official state festival of Telangana.', 'Peerila Panduga (Moharram): peerlu (metal hand-shaped standards) are installed and carried in processions; in many villages Hindus and Muslims together take part, walk on fire pits and offer jaggery.', 'Urs: the death anniversary of a Sufi saint, celebrated at his dargah with qawwali, a sandal (sandalwood paste) procession and fairs; people of all faiths attend.', 'Jahangir Peer Dargah (near Kothur, Ranga Reddy/Mahabubnagar region): shrine of two Sufi brothers; Hindus and Muslims come to make vows and offer thanks.'),
    keys('Bonalu: Ashada month; women carry bonam pots.', 'Peerila Panduga: shared by Hindus and Muslims.', 'Urs at dargahs; Jahangir Peer Dargah draws all faiths.'),
    remember('Bonalu was declared an official state festival of Telangana in 2014.'),
  ], [
    ex('What is a "bonam"?', ['A pot of rice cooked with milk and jaggery (and sometimes curd).', 'Women carry it on their heads to offer to the goddess.'], 'A pot of food offered to the goddess.'),
    ex('Why are Peerila Panduga and Urs good examples of shared culture?', ['People of different religions take part together.', 'They share processions, music, vows and food.'], 'Hindus and Muslims celebrate them together.'),
  ], [
    matchT('fest', 'festival or place with its description', [
      ['Bonalu', 'Women carry pots of food to the goddess'], ['Peerila Panduga', 'Processions of peerlu during Moharram'], ['Urs', 'Death anniversary of a Sufi saint'], ['Jahangir Peer Dargah', 'Shrine visited by people of all faiths'], ['Ashada', 'Month in which Bonalu is celebrated'],
    ], ['Bonam is a pot.', 'Urs is held at a dargah.']),
    mcq('bon', 'Shared festivals.', [
      ['Bonalu is celebrated in the month of…', 'Ashada', ['Chaitra', 'Kartika', 'Magha'], 'July–August.', 'Bonalu is held in Ashada.'],
      ['In Bonalu, the bonam is carried by…', 'women', ['only priests', 'only kings', 'only children'], 'On their heads.', 'Women carry the bonam pots.'],
      ['Peerlu are carried during…', 'Moharram (Peerila Panduga)', ['Diwali', 'Christmas', 'Sankranti'], 'Hand-shaped standards.', 'Peerlu are part of Moharram processions.'],
      ['An Urs celebrates…', 'the death anniversary of a Sufi saint', ['a king\'s coronation', 'a harvest of cotton', 'the new year'], 'Held at a dargah.', 'Urs marks the saint\'s union with God.'],
      ['Bonalu became an official state festival of Telangana in…', '2014', ['1947', '1956', '1999'], 'The year Telangana was formed.', 'It was declared a state festival in 2014.'],
    ]),
    tapT('share', 'Tap the festivals/places where people of different religions commonly take part together in Telangana.', [
      ['Peerila Panduga', true], ['Urs at dargahs', true], ['Jahangir Peer Dargah', true], ['Bonalu (people of many communities join)', true],
      ['A private family puja closed to outsiders', false], ['A meeting only for one caste\'s elders', false],
    ], ['Look for public, community events.', 'Closed, private events are not shared.'], 'Peerila Panduga, Urs, Jahangir Peer and Bonalu bring people together.'),
  ]),
  O('ts7.ss.folk.antiquity', 'Antiquity of folk traditions and mixing with other traditions', [
    h('Very old, always changing'),
    p('Worship of mother goddesses is very old. Clay female figurines found at ancient sites, including those of the Harappan civilisation, suggest that people worshipped mother goddesses thousands of years ago. Stone circles, memorial stones (hero stones) and sacred trees are also ancient forms of worship.'),
    stepsB('Ancient: mother goddess figurines, sacred trees, snakes and stones.', 'Over time: local goddesses are linked to big traditions, for example Yellamma identified with Renuka, mother of Parashurama.', 'Village deities get temples, and big temples adopt local festivals.', 'Sufi saints\' dargahs and Moharram enter village life, mixing with local customs like fire-walking and vows.', 'Today: folk festivals are celebrated in cities too, with new forms like decorated floats and music.'),
    def('Syncretism (mixing of traditions)', 'When beliefs and practices of different religions or cultures blend, so that people share rituals, festivals and places of worship.'),
    p('Folk traditions are kept alive by oral stories, songs and performances: Oggu katha (Kuruma and Yadava storytellers), Sharada kathalu, Burra katha and the Gusadi dance of the Raj Gonds during Dandari festival.'),
    keys('Mother goddess worship is thousands of years old.', 'Folk and "big" traditions mixed over time.', 'Oral traditions keep folk religion alive.'),
    remember('Mixing of traditions is why Hindus visit dargahs and Muslims join Bonalu in many places of Telangana.'),
  ], [
    ex('How do historians know mother goddess worship is very old?', ['Archaeologists found clay female figurines at ancient sites.', 'They seem to have been used in worship.'], 'From ancient figurines found in excavations.'),
    ex('How is Yellamma an example of mixing traditions?', ['She began as a local folk goddess.', 'Later she was identified with Renuka from the Puranas.'], 'A folk goddess was linked to a Puranic figure.'),
  ], [
    mcq('ant', 'Old traditions and mixing.', [
      ['Clay female figurines from ancient sites suggest the worship of…', 'mother goddesses', ['kings', 'machines', 'planets only'], 'Very old belief.', 'They suggest mother goddess worship.'],
      ['Yellamma is identified in the Puranas with…', 'Renuka', ['Sita', 'Rudrama Devi', 'Mumtaz Mahal'], 'Mother of Parashurama.', 'Yellamma is linked to Renuka.'],
      ['Oggu katha is performed by storytellers of the…', 'Kuruma and Yadava communities', ['Mughal court', 'British army', 'Portuguese traders'], 'With a small drum (oggu).', 'Oggu katha belongs to Kuruma and Yadava storytellers.'],
      ['The Gusadi dance is performed by the…', 'Raj Gonds during Dandari', ['Cholas', 'Kakatiyas at court', 'Mughals'], 'Adilabad tribes.', 'Raj Gonds perform Gusadi during Dandari.'],
      ['Mixing of beliefs and rituals from different traditions is called…', 'syncretism', ['mercantilism', 'nayankara', 'zabt'], 'Blending.', 'Syncretism means blending traditions.'],
    ]),
    orderT('mix', 'Order how a village goddess tradition grows over time.', ['A sacred stone under a tree is worshipped', 'The goddess gets a small shrine', 'She is linked to a Puranic goddess', 'A bigger temple and annual festival develop'], ['Simple forms come first.', 'A big festival comes later.'], 'Stone → shrine → linked to Puranas → temple and festival.', 4),
    matchT('oral', 'tradition with its description', [
      ['Oggu katha', 'Story-singing with a small drum by Kurumas and Yadavas'], ['Burra katha', 'Story told with a drum shaped like a skull (burra)'], ['Gusadi', 'Dance of the Raj Gonds with peacock-feather headgear'], ['Hero stone', 'Memorial stone for a fallen warrior'], ['Sacred grove', 'Patch of forest protected for a deity'],
    ], ['Gusadi dancers wear peacock feathers.', 'Hero stones honour warriors.']),
  ]),
]);

// =====================================================================================
// Chapter 21 — Devotional Paths to the Divine
// =====================================================================================
const ch21 = U(21, 'Devotional Paths to the Divine', [
  O('ts7.ss.bhakti.basava', 'Philosophy and Bhakti; Basavanna\'s Virashaivism; saints of Maharashtra', [
    h('Loving God directly'),
    p('Bhakti means loving devotion to God. Bhakti saints taught that anyone, of any caste or gender, can reach God through sincere love, without costly rituals. They composed songs in people\'s own languages (Tamil, Kannada, Marathi, Telugu, Hindi), not only Sanskrit. Earlier, in Tamil Nadu (6th–9th centuries), the Nayanars (devotees of Shiva) and Alvars (devotees of Vishnu) had spread bhakti.'),
    h('Basavanna and the Virashaivas'),
    p('In the 12th century in Karnataka, Basavanna (Basaveshwara), a minister at the Kalachuri court in Kalyana, started the Virashaiva (Lingayat) movement with Allama Prabhu and Akkamahadevi. They opposed caste, ritual and the idea of impurity, and wore a small linga. Their teachings were short, powerful Kannada poems called vachanas. Basavanna\'s Anubhava Mantapa was a hall where people of all castes, including women, discussed spiritual questions.'),
    h('Saints of Maharashtra'),
    stepsB('Jnaneshwar (13th century): wrote the Jnaneshwari, a Marathi explanation of the Bhagavad Gita.', 'Namdev: a tailor-saint whose songs are also in the Guru Granth Sahib.', 'Eknath (16th century).', 'Tukaram (17th century): famous for his abhangs (devotional songs).', 'They worshipped Vitthala (Vithoba) at Pandharpur; the annual pilgrimage (wari) still continues.'),
    keys('Bhakti: love of God open to all.', 'Basavanna: Virashaivism, vachanas, Anubhava Mantapa.', 'Maharashtra saints: Jnaneshwar, Namdev, Eknath, Tukaram; Vitthala at Pandharpur.'),
    remember('Bhakti saints used the language of the people, so their songs spread to every village.'),
  ], [
    ex('Why did bhakti saints sing in local languages?', ['Ordinary people did not know Sanskrit.', 'Local languages carried the message to everyone.'], 'So that common people could understand and join.'),
    ex('What was special about Basavanna\'s Anubhava Mantapa?', ['People of all castes met there.', 'Women also took part in discussions.'], 'It was open to all castes and to women.'),
  ], [
    matchT('saint', 'saint with their fact', [
      ['Basavanna', 'Founded Virashaivism; vachanas'], ['Akkamahadevi', 'Woman Virashaiva poet'], ['Jnaneshwar', 'Wrote the Jnaneshwari'], ['Tukaram', 'Composed abhangs'], ['Namdev', 'Tailor-saint of Maharashtra'],
    ], ['Vachanas are Kannada.', 'Abhangs are Marathi.']),
    mcq('bh', 'Bhakti and its saints.', [
      ['Basavanna\'s followers are known as…', 'Virashaivas (Lingayats)', ['Sufis', 'Nathpanthis', 'Alvars'], 'They wear a small linga.', 'His followers are Virashaivas or Lingayats.'],
      ['Virashaiva teachings were written as…', 'vachanas in Kannada', ['abhangs in Marathi', 'dohas in Hindi', 'ghazals in Persian'], 'Short sayings.', 'Vachanas are Kannada poems.'],
      ['The saints of Maharashtra worshipped Vitthala at…', 'Pandharpur', ['Hampi', 'Ajmer', 'Varanasi'], 'Annual wari pilgrimage.', 'Vitthala\'s temple is at Pandharpur.'],
      ['Bhakti means…', 'loving devotion to God', ['war', 'trade', 'tax collection'], 'Devotion.', 'Bhakti is loving devotion.'],
      ['The Nayanars were devotees of…', 'Shiva', ['Vishnu', 'Vitthala', 'Buddha'], 'Alvars were for Vishnu.', 'Nayanars worshipped Shiva.'],
    ]),
    tapT('bht', 'Tap the teachings common to bhakti saints.', [
      ['God can be reached through sincere love', true], ['All castes are equal before God', true], ['Songs in people\'s own languages', true], ['Costly rituals are not necessary', true],
      ['Only kings can worship', false], ['Only Sanskrit prayers count', false],
    ], ['Bhakti was open to all.', 'Exclusion goes against bhakti.'], 'Love, equality, local languages and simple worship are bhakti teachings.'),
  ]),
  O('ts7.ss.bhakti.sufi', 'Nathpanthis, Siddhas and Yogis; Islam and Sufism', [
    h('Other paths'),
    p('Nathpanthis, Siddhas and Yogis rejected rituals and the caste order. They believed the way to God was through meditation and training of the body and mind (yoga). Many came from groups considered "low" in society and were popular among ordinary people.'),
    h('Islam and Sufism'),
    p('Islam teaches that there is one God (Allah) and that Prophet Muhammad is His messenger. Muslims follow the Quran. Islam reached India through traders on the west coast from the 7th century and later with the Turkish rulers.'),
    def('Sufis', 'Muslim mystics who sought union with God through love and devotion, like a lover seeking the beloved. They rejected outward show and taught compassion to all.'),
    stepsB('A Sufi master (pir or shaikh) guided disciples (murids) in a khanqah (hospice).', 'They used poetry, music (qawwali) and dance (sama) to express love for God.', 'Khanqahs were open to all; free kitchens fed the poor.', 'After the master\'s death his tomb (dargah) became a place of pilgrimage.', 'Famous Chishti saints: Khwaja Muinuddin Chishti (Ajmer), Nizamuddin Auliya (Delhi).'),
    keys('Nathpanthis/Siddhas/Yogis: yoga and meditation, no rituals.', 'Sufis: Muslim mystics; love of God.', 'Khanqah, qawwali, dargah; Ajmer and Delhi.'),
    remember('Hazrat Nizamuddin\'s disciple Amir Khusrau was a great poet and musician.'),
  ], [
    ex('Why did people of all faiths visit Sufi dargahs?', ['Sufis taught love and compassion for everyone.', 'Their khanqahs fed the poor and were open to all.', 'People believed the saints\' blessings helped them.'], 'Sufis were open, kind and seen as holy by all.'),
    ex('How was the Nathpanthi path different from temple ritual?', ['They did not depend on priests or temple rituals.', 'They used yoga and meditation to seek truth.'], 'Inner discipline instead of external rituals.'),
  ], [
    matchT('suf', 'Sufi term with its meaning', [
      ['Khanqah', 'Hospice where a Sufi master lived'], ['Dargah', 'Tomb of a Sufi saint'], ['Qawwali', 'Devotional singing'], ['Pir', 'Sufi master'], ['Murid', 'Disciple'], ['Urs', 'Death anniversary of a saint'],
    ], ['Dargah is a tomb.', 'Pir teaches; murid learns.']),
    mcq('sf', 'Sufis and yogis.', [
      ['The dargah of Khwaja Muinuddin Chishti is at…', 'Ajmer', ['Delhi', 'Hyderabad', 'Pandharpur'], 'In Rajasthan.', 'His dargah is in Ajmer.'],
      ['Sufis sought God through…', 'love and devotion', ['war', 'wealth', 'magic tricks'], 'Like a lover and beloved.', 'Sufis emphasised love of God.'],
      ['Nathpanthis and yogis believed in…', 'meditation and training of body and mind', ['animal sacrifice', 'caste rules', 'temple taxes'], 'Yoga.', 'They used yoga and meditation.'],
      ['Who was Amir Khusrau?', 'Poet and musician, disciple of Nizamuddin Auliya', ['A Mughal emperor', 'A Kakatiya king', 'A Portuguese traveller'], 'Delhi, 13th–14th century.', 'Khusrau was Nizamuddin\'s famous disciple.'],
    ]),
    tapT('sfx', 'Tap the TRUE statements about Sufis.', [
      ['They were Muslim mystics', true], ['They used music and poetry in worship', true], ['Their khanqahs often fed the poor', true], ['People of many faiths visited them', true],
      ['They demanded expensive rituals', false], ['They fought only for land', false],
    ], ['Sufis valued love and simplicity.', 'They rejected show and wealth.'], 'Mysticism, music, charity and openness marked the Sufis.'),
  ]),
  O('ts7.ss.bhakti.kabir', 'Kabir and Guru Nanak', [
    h('Kabir: a weaver-poet'),
    p('Kabir lived in Varanasi in the 15th–16th centuries. He was raised in a family of Muslim weavers (julahas). He rejected both Hindu and Muslim ritualism, idol worship and caste. He believed in one formless God, whom he called by many names: Rama, Hari, Allah, Khuda. His sayings (dohas and sakhis) in simple Hindi are still sung today.'),
    h('Guru Nanak and Sikhism'),
    stepsB('1469: Guru Nanak is born at Talwandi (Nankana Sahib, now in Pakistan).', 'He travels widely, meeting holy people of all faiths.', 'He settles at Kartarpur on the Ravi river, where a community gathers.', 'Teachings: one God (Ek Onkar); remember God\'s name (nam japna), honest work (kirat karna), sharing with others (vand chhakna); equality of all.', 'Langar: a common kitchen where everyone eats together regardless of caste, religion or status.', '1539: dies; his successors are the Sikh Gurus. In 1604 Guru Arjan compiles the Adi Granth, which includes Kabir\'s and Namdev\'s verses.'),
    keys('Kabir: one formless God; against ritual and caste.', 'Guru Nanak (1469–1539): nam, kirat, vand; langar.', 'Guru Granth Sahib includes Kabir and Namdev.'),
    remember('Guru Nanak\'s three principles: nam japna, kirat karna, vand chhakna.'),
  ], [
    ex('What does the langar teach?', ['Everyone sits together on the floor and eats the same food.', 'Caste, religion and wealth do not matter there.'], 'Equality and sharing.'),
    ex('How many years did Guru Nanak live (1469–1539)?', ['1539 − 1469 = 70.'], '70 years'),
  ], [
    mcq('kn', 'Kabir and Guru Nanak.', [
      ['Kabir lived mainly in…', 'Varanasi', ['Hyderabad', 'Kartarpur', 'Ajmer'], 'On the Ganga.', 'Kabir lived in Varanasi (Benares).'],
      ['Kabir\'s family worked as…', 'weavers', ['kings', 'soldiers', 'priests'], 'Julahas.', 'He was raised among Muslim weavers.'],
      ['Guru Nanak was born in…', '1469', ['1526', '1891', '1336'], 'At Talwandi.', 'Guru Nanak was born in 1469.'],
      ['A common kitchen where all eat together is a…', 'langar', ['khanqah', 'mandapa', 'jagir'], 'In every gurdwara.', 'The langar serves everyone equally.'],
      ['Guru Nanak settled at…', 'Kartarpur', ['Pandharpur', 'Hampi', 'Warangal'], 'On the Ravi.', 'He set up a community at Kartarpur.'],
    ]),
    matchT('nanak', 'Guru Nanak\'s teaching with its meaning', [
      ['Nam japna', 'Remembering God\'s name'], ['Kirat karna', 'Earning by honest work'], ['Vand chhakna', 'Sharing with others'], ['Langar', 'Community kitchen for all'], ['Ek Onkar', 'There is one God'],
    ], ['Vand = share.', 'Kirat = work.']),
    yearsT('yrs', [
      ['Guru Nanak was born', 1469, 'Guru Nanak died', 1539],
      ['Guru Nanak was born', 1469, 'the Adi Granth was compiled', 1604],
      ['Basavanna began his work (about)', 1160, 'Guru Nanak was born', 1469],
      ['Guru Nanak died', 1539, 'the Adi Granth was compiled', 1604],
      ['Babur won at Panipat', 1526, 'Guru Nanak died', 1539],
    ]),
  ]),
]);

// =====================================================================================
// Theme VI — Culture and Communication
// Chapter 22 — Rulers and Buildings
// =====================================================================================
const ch22 = U(22, 'Rulers and Buildings', [
  O('ts7.ss.build.temple', 'Engineering skills and temple construction', [
    h('How were great temples built?'),
    photo('🛕', 'The Ramappa temple near Mulugu shows the skill of Kakatiya builders.'),
    p('Between the 8th and 18th centuries, kings built temples, mosques, tanks, forts, palaces and tombs. Big buildings showed a ruler\'s power, wealth and devotion, and gave work to thousands of masons, sculptors and labourers.'),
    def('Trabeate (post and lintel)', 'A method in which a horizontal beam (lintel) is laid across two vertical pillars. Used in early Indian temples.'),
    def('Arch', 'A curved structure in which the weight above is carried down to the sides by a keystone at the top. It became common in India after the 12th century.'),
    stepsB('Garbhagriha: the small inner sanctum housing the main deity.', 'Mandapa: a pillared hall where people gather.', 'Shikhara (north) or vimana (south): the tower over the sanctum.', 'Pradakshina path: a path to walk around the deity.', 'Gopuram: a tall gateway tower (especially in later southern temples).'),
    p('Building an 11th-century temple like Thanjavur\'s was a huge project: granite blocks were quarried, carried on rollers and ramps, carved and fitted without cement. The top stone of the Thanjavur vimana weighs about 80 tonnes and is believed to have been raised up a long earthen ramp. Kakatiya builders used a "sandbox" foundation (filling pits with sand) to protect temples from earthquakes and made floating bricks for the Ramappa tower.'),
    keys('Parts: garbhagriha, mandapa, shikhara/vimana, gopuram.', 'Trabeate vs arch.', 'Engineering: ramps, rollers, sandbox foundations.'),
    remember('The Thanjavur temple tower is about 66 m high and was the tallest in India when it was built (about 1010 CE).'),
  ], [
    ex('How does an arch carry weight differently from a lintel?', ['A lintel is a flat beam; it can crack if the gap is wide.', 'An arch pushes the weight sideways and down along its curve.', 'So arches can span wider openings.'], 'The arch spreads the weight to the sides, spanning wider gaps.'),
    ex('Why did the Kakatiyas use sandbox foundations?', ['Sand absorbs the shocks of earthquakes.', 'The temple above is protected from cracking.'], 'To protect temples from earthquake damage.'),
  ], [
    matchT('part', 'temple part with its meaning', [
      ['Garbhagriha', 'Inner sanctum with the main deity'], ['Mandapa', 'Pillared hall for gathering'], ['Shikhara', 'Tower over the sanctum (north)'], ['Vimana', 'Tower over the sanctum (south)'], ['Gopuram', 'Tall gateway tower'],
    ], ['Garbha = womb, the innermost place.', 'Gopuram is the gateway.']),
    mcq('eng', 'Engineering of temples.', [
      ['A horizontal beam placed across two pillars is…', 'trabeate (post and lintel)', ['an arch', 'a dome', 'a minaret'], 'Flat beam.', 'Post-and-lintel is the trabeate style.'],
      ['The innermost sanctum of a temple is the…', 'garbhagriha', ['mandapa', 'gopuram', 'courtyard'], 'Where the main deity is.', 'The garbhagriha houses the main deity.'],
      ['Ramappa temple\'s tower used…', 'light bricks that float in water', ['plastic sheets', 'steel girders', 'glass blocks'], 'Very porous.', 'Floating bricks reduced the load.'],
      ['The Thanjavur temple was completed around…', '1010 CE', ['1591 CE', '1857 CE', '300 BCE'], 'Under Rajaraja I.', 'It was completed about 1010 CE.'],
    ]),
    tapT('work', 'Tap the people who were needed to build a large temple.', [
      ['Stone quarry workers', true], ['Sculptors', true], ['Architects', true], ['Labourers to haul stone', true], ['Elephants and bullock teams', true],
      ['Railway engineers with trains', false], ['Electric crane operators', false],
    ], ['Think of the 11th century: no machines.', 'Railways and electricity came much later.'], 'Quarrymen, sculptors, architects, labourers and animals built temples.'),
  ]),
  O('ts7.ss.build.styles', 'New building styles: temples, mosques and tanks; why temples were destroyed', [
    h('New ideas in stone'),
    p('From the 12th century, rulers of the Delhi Sultanate brought the arch, the dome, minarets and the use of lime mortar. Indian craftsmen combined these with local skills, carving and designs, creating new styles.'),
    stepsB('Qutb Minar (Delhi): begun about 1199 by Qutbuddin Aibak, completed by Iltutmish; about 73 m tall, decorated with carved inscriptions.', 'Mosques: a large courtyard, a prayer hall facing Mecca (west in India), a mihrab (niche) and often domes and minarets. Example: the Mecca Masjid in Hyderabad (begun by the Qutb Shahis, completed under Aurangzeb).', 'Tanks and reservoirs: rulers built tanks for water, like the Hauz Khas tank in Delhi (built by Alauddin Khalji) and Hussain Sagar in Hyderabad; Kakatiya tanks in Telangana.'),
    h('Why were temples destroyed?'),
    p('Temples were symbols of a king\'s power and were very rich. When one king defeated another, he often attacked the rival\'s royal temple to show the rival\'s god and king had lost, and took its wealth. Hindu kings did this too: for example, Rajendra Chola took images from rulers he defeated, and some rulers destroyed rivals\' temples. Turkish rulers such as Mahmud of Ghazni also attacked temples. At the same time, many rulers of all faiths built and protected places of worship of their subjects.'),
    keys('New features: arch, dome, minaret, lime mortar.', 'Qutb Minar; Mecca Masjid; Hauz Khas and other tanks.', 'Temples were attacked mainly as symbols of power and wealth.'),
    remember('Buildings tell us about rulers\' power, religious life and the technology of their times.'),
  ], [
    ex('Why did a victorious king attack his rival\'s royal temple?', ['The temple was a symbol of the rival king\'s power and his link to the deity.', 'It also held great wealth.', 'Attacking it showed his own superiority.'], 'To show power and take wealth.'),
    ex('Name two new building features introduced after the 12th century.', ['The true arch, with a keystone.', 'The dome.'], 'The arch and the dome.'),
  ], [
    mcq('ns', 'New styles and reasons.', [
      ['Who began building the Qutb Minar?', 'Qutbuddin Aibak', ['Akbar', 'Krishnadevaraya', 'Rajaraja I'], 'About 1199.', 'Qutbuddin Aibak began it; Iltutmish completed it.'],
      ['The Mecca Masjid is in…', 'Hyderabad', ['Delhi', 'Ajmer', 'Thanjavur'], 'Near the Charminar.', 'Mecca Masjid stands in old Hyderabad.'],
      ['In India, the prayer hall of a mosque faces…', 'west, towards Mecca', ['east', 'north', 'south'], 'Mecca is to the west of India.', 'Muslims pray facing Mecca, which is west of India.'],
      ['Which feature became common in Indian buildings after the 12th century?', 'The true arch', ['The post and lintel', 'The thatched roof', 'The cave'], 'With a keystone.', 'Arches and domes became common.'],
      ['Why were temples often attacked in wars?', 'They were symbols of royal power and held wealth', ['They were empty', 'They were forts only', 'They were always made of gold'], 'Power and riches.', 'Royal temples displayed power and stored wealth.'],
    ]),
    matchT('bld', 'building with its builder or fact', [
      ['Qutb Minar', 'Begun by Qutbuddin Aibak'], ['Hauz Khas', 'Tank built by Alauddin Khalji'], ['Mecca Masjid', 'Mosque in Hyderabad'], ['Hussain Sagar', 'Lake built under the Qutb Shahis'], ['Brihadeshvara temple', 'Built by Rajaraja Chola'],
    ], ['Hauz = tank.', 'Brihadeshvara is in Thanjavur.']),
    tapT('newf', 'Tap the features of mosques.', [
      ['Prayer hall facing Mecca', true], ['Mihrab (niche)', true], ['Courtyard', true], ['Minarets', true],
      ['Garbhagriha with an idol', false], ['Gopuram gateway with sculptures of gods', false],
    ], ['Mosques have no idols.', 'Gopurams belong to temples.'], 'Prayer hall, mihrab, courtyard and minarets are mosque features.'),
  ]),
  O('ts7.ss.build.vijay', 'Vijayanagara style; gardens, tombs and forts', [
    h('Grand gateways and gardens'),
    p('Vijayanagara builders added tall raya gopurams (royal gateways) that could be seen from far away, large pillared mandapas with carved horses and mythical animals, and temple chariot streets. The Vitthala temple at Hampi has a stone chariot and "musical pillars" that ring when tapped. The Lotus Mahal and elephant stables show a mix of Indian and Islamic styles (arches and domes).'),
    def('Charbagh', 'A garden divided into four parts by water channels and walkways, introduced by the Mughals (Babur loved gardens).'),
    stepsB('Gardens: Mughal charbaghs at Kashmir (Shalimar Bagh), Agra and Lahore.', 'Tombs: Humayun\'s tomb in Delhi (with a charbagh, high dome and double dome); the Taj Mahal at Agra built by Shah Jahan for Mumtaz Mahal; the Qutb Shahi tombs at Hyderabad.', 'Forts: Golconda fort (with acoustic signalling), Red Fort in Delhi (Shah Jahan), Agra fort (Akbar), Warangal fort (Kakatiyas), Bhongir fort.', 'Palaces: Chowmahalla Palace and Falaknuma Palace of the Nizams in Hyderabad.'),
    keys('Vijayanagara: raya gopurams, mandapas, Vitthala temple.', 'Mughal: charbagh gardens, Humayun\'s tomb, Taj Mahal, Red Fort.', 'Hyderabad: Golconda fort, Qutb Shahi tombs, Chowmahalla.'),
    remember('The Taj Mahal took about 20 years and thousands of workers to build (completed around 1653).'),
  ], [
    ex('Why did Vijayanagara kings build very tall gopurams?', ['They were visible from far away.', 'They announced the power and wealth of the king.'], 'To display royal power from a distance.'),
    ex('What is a charbagh, and where can you see one?', ['A garden divided into four parts by water channels.', 'Humayun\'s tomb and the Taj Mahal have charbaghs.'], 'A four-part Mughal garden, e.g. at Humayun\'s tomb.'),
  ], [
    matchT('mon', 'monument with its place or builder', [
      ['Taj Mahal', 'Agra, built by Shah Jahan'], ['Humayun\'s tomb', 'Delhi, with a charbagh'], ['Vitthala temple', 'Hampi, with a stone chariot'], ['Golconda fort', 'Hyderabad, Qutb Shahi stronghold'], ['Chowmahalla Palace', 'Palace of the Nizams'], ['Red Fort', 'Delhi, built by Shah Jahan'],
    ], ['Two are in Hyderabad.', 'The stone chariot is at Hampi.']),
    mcq('vs', 'Gardens, tombs and forts.', [
      ['A garden divided into four parts by water channels is a…', 'charbagh', ['mandapa', 'khanqah', 'gopuram'], 'Char = four.', 'A charbagh has four parts.'],
      ['The Taj Mahal was built by…', 'Shah Jahan', ['Akbar', 'Babur', 'Krishnadevaraya'], 'For Mumtaz Mahal.', 'Shah Jahan built it for his wife.'],
      ['Tall royal gateways of Vijayanagara temples are called…', 'raya gopurams', ['minarets', 'charbaghs', 'stupas'], 'Raya = king.', 'Raya gopurams are royal gateways.'],
      ['Which temple at Hampi has musical pillars?', 'Vitthala temple', ['Thousand Pillar Temple', 'Ramappa', 'Somnath'], 'It also has the stone chariot.', 'The Vitthala temple has musical pillars.'],
      ['The Qutb Shahi tombs are in…', 'Hyderabad', ['Agra', 'Delhi', 'Hampi'], 'Near Golconda.', 'They are at Ibrahim Bagh near Golconda.'],
    ]),
    orderT('time', 'Order these buildings by the time they were built (earliest first).', ['Brihadeshvara temple, Thanjavur', 'Ramappa temple', 'Vitthala temple, Hampi', 'Charminar', 'Taj Mahal'], ['Thanjavur (c.1010) and Ramappa (1213) are earliest.', 'Charminar (1591) is before the Taj (1653).'], 'c.1010 → 1213 → 1500s → 1591 → 1653.'),
  ]),
]);

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21, ch22];
