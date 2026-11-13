// Telangana SCERT Class 10 — Social Studies (21 chapters): Part I Resources, Development and Equity (geography and
// economics, ch 1-11) and Part II Contemporary World and India (history and political science, ch 12-21).
// Original explanations aligned to the official chapter list (src/content/ts/books.ts, syllabus.json).
// One unit per chapter (ids ts10.ss.ch<n>); objectives ts10.ss.<topic>.<skill>. Templates use only the Rng they are given.
import {
  tp, ex, p, h, tip, f, vis, stepsB, def, keys, remember, photo, explore, L, approx, choose, matching, ordering, tapAll, rd, inr,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import { tsSrc } from '../books';

/** Source reference for a chapter of the SCERT Telangana Class X Social Studies book. */
const src = (n: number) => tsSrc(10, 'social', n);

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, second hint, why the answer is right] */
type MQ = [string, string, string[], string, string];
/** MCQ drawn from a bank (give >= 5 entries). Hints: hint0 (general) → bank hint (specific). */
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

/** Timeline: pick n events with DIFFERENT dates from the pool and put them in time order. Dates are sort keys (e.g. 1947.08 for Aug 1947). */
const timelineT = (key: string, prompt: string, events: [number, string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const seen = new Set<number>();
  const pick: [number, string, string][] = [];
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

/** Typed numeric answer (no unit unless given). `rel` is the accepted relative error. */
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01, unit?: string): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, false) : approx(ans, rel),
  hints, solution, mistakes,
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

/** Bar graph block. */
const bars = (labels: string[], values: number[], unit: string, alt: string) => vis({ kind: 'bar-graph', labels, values, unit }, alt);
/** Line graph block. */
const line = (xLabel: string, yLabel: string, points: [number, number][], alt: string) => vis({ kind: 'line-graph', xLabel, yLabel, points }, alt);

// =====================================================================================
// Chapter 1 — India: Relief Features
// =====================================================================================
/** [place, longitude in degrees east] for time-difference questions (rounded, illustrative) */
const C1_LONG: [string, number][] = [
  ['Dwarka (Gujarat)', 69], ['Mumbai', 73], ['Hyderabad', 78.5], ['Nagpur', 79], ['Chennai', 80.25], ['Kolkata', 88.5],
  ['Guwahati', 91.75], ['Imphal', 94], ['Itanagar', 93.5], ['Kohima', 94],
];

const ch1: USpec = {
  id: 'ts10.ss.ch1', subject: 'social', title: 'India: Relief Features', source: src(1),
  objectives: [
    {
      id: 'ts10.ss.relief.location', title: 'Where India lies on the globe: latitude, longitude, size and time', prereqs: [],
      intro: [
        h('Why does the sun rise earlier in Arunachal than in Gujarat?'),
        photo('🌅', 'Sunrise in Arunachal Pradesh comes almost two hours before sunrise in western Gujarat, though both use the same clock time (IST).'),
        p('If you call a cousin in Kohima at 6 a.m. in winter, it is already bright there while Hyderabad is still dark. Both places are in the same country, so why the difference? The answer lies in India\'s location on the globe — its latitudes and longitudes.'),
        def('Latitude', 'Imaginary lines running east–west, measured in degrees north or south of the Equator. They tell us how far north or south a place is, and so roughly how hot it is.'),
        def('Longitude', 'Imaginary lines running north–south from pole to pole, measured in degrees east or west of Greenwich (0°). They decide local time.'),
        p('The Indian mainland stretches from about 8°4′N to 37°6′N and from about 68°7′E to 97°25′E. The whole of India lies in the Northern and Eastern hemispheres. The Tropic of Cancer (23½°N) cuts across the middle of the country, passing through eight states including Gujarat, Madhya Pradesh, Chhattisgarh and West Bengal.'),
        p('India covers about 3.28 million square kilometres — roughly 2.4% of the world\'s land area — and is the seventh largest country in the world. From Kashmir to Kanyakumari it is about 3,214 km long; from Gujarat to Arunachal Pradesh about 2,933 km wide.'),
        h('One country, one clock'),
        p('The Earth turns 360° in 24 hours, so each degree of longitude makes a difference of 4 minutes in local (sun) time. India spans almost 30° of longitude, which means about 2 hours of difference between its eastern and western ends. To avoid confusion, India uses one Indian Standard Time (IST), based on the 82°30′E longitude, which passes near Mirzapur in Uttar Pradesh. IST is 5 hours 30 minutes ahead of Greenwich Mean Time.'),
        f('Time difference (minutes) = difference in longitude (degrees) × 4', 'time difference equals longitude difference times four minutes'),
        xp({
          title: 'What if? Two places far apart in longitude', formula: 'T = (L₂ − L₁) × 4 min',
          res: ['T', 'Difference in local sun time', 'min', '(E - W) * 4', 0],
          vars: [['E', 'Longitude of the eastern place', '°E', 70, 98, 0.5, 97], ['W', 'Longitude of the western place', '°E', 68, 90, 0.5, 68]],
          notes: [
            ['E', 'The eastern place moves farther east, so the sun reaches it even earlier: the gap widens by 4 minutes for every degree.', 'The eastern place moves closer in longitude to the western one, so the gap in sunrise time shrinks.'],
            ['W', 'The western place moves east, closer to the other place, so their local times get closer.', 'The western place moves farther west, so the sun reaches it even later and the gap grows.'],
          ],
          mistakes: [
            ['Using 4 hours per degree', 'The Earth turns 360° in 24 hours = 1,440 minutes, so 1° takes 1,440 ÷ 360 = 4 MINUTES, not hours.'],
            ['Thinking latitude changes the clock time', 'Places on the same longitude have the same sun time whatever their latitude; latitude affects climate, longitude affects time.'],
          ],
          real: 'Dwarka (about 69°E) and Kohima (about 94°E) are about 25° apart, so the sun rises there about 100 minutes apart — yet both follow IST.',
        }),
        h('A strategic location'),
        p('India sits at the head of the Indian Ocean, between West Asia and East Asia. The Deccan peninsula juts into the ocean, so sea routes from Europe and Africa to East Asia pass close to India. That is why ports on both coasts have traded with the world for over 2,000 years.'),
        keys('Mainland India: about 8°4′N–37°6′N and 68°7′E–97°25′E.', 'The Tropic of Cancer divides India into roughly equal halves.', 'Area about 3.28 million km², 7th largest country, about 2.4% of world land.', '1° of longitude = 4 minutes of time; IST is based on 82°30′E.'),
        remember('IST = GMT + 5 h 30 min. The Standard Meridian of India is 82°30′E (near Mirzapur).'),
        tip('Latitude → climate. Longitude → time. Say it twice before an exam.'),
      ],
      examples: [
        ex('Hyderabad is at about 78.5°E. How far is its local sun time behind IST (82.5°E)?', ['Difference in longitude = 82.5 − 78.5 = 4°', 'Time difference = 4 × 4 = 16 minutes', 'Hyderabad is WEST of the Standard Meridian, so the sun reaches it later.'], 'About 16 minutes behind IST'),
        ex('Explain why India chose one standard meridian instead of using local time for every city.', ['India spans about 30° of longitude → about 2 hours of local-time difference.', 'Trains, offices, radio and TV need one common clock across the country.', 'So one central meridian (82°30′E) was chosen, and every place follows IST.'], 'One common time (IST) avoids confusion across a country 2 hours wide in sun time'),
      ],
      practice: [
        tp('time', (r) => {
          const [a, b] = r.shuffle(C1_LONG).slice(0, 2);
          if (a[1] === b[1]) return numQ(`${a[0]} is at about ${a[1]}°E. How many minutes ahead of Greenwich (0°) is its local sun time? (number of minutes)`, a[1] * 4, ['Each degree of longitude = 4 minutes.', `Multiply ${a[1]} by 4.`], [`${a[1]} × 4 = ${a[1] * 4} minutes`], [], 0.005, 'min');
          const [east, west] = a[1] > b[1] ? [a, b] : [b, a];
          const d = rd(east[1] - west[1], 2);
          return numQ(`${east[0]} is at about ${east[1]}°E and ${west[0]} at about ${west[1]}°E. By how many minutes does local sun time differ between them?`, rd(d * 4, 2), ['First find the difference in longitude.', `Then multiply ${d}° by 4 minutes per degree.`], [`Difference = ${east[1]} − ${west[1]} = ${d}°`, `Time = ${d} × 4 = ${rd(d * 4, 2)} minutes`, `${east[0]} sees the sun earlier because it is farther east.`], [{ when: String(rd(d * 4 * 60, 2)), explain: 'You multiplied by 4 hours (240 min). It is 4 MINUTES per degree.' }, { when: String(d), explain: 'That is the difference in degrees — now multiply by 4 to get minutes.' }], 0.005, 'min');
        }, 2),
        mcq('facts', 'Picture India on a globe: north of the Equator, east of Greenwich.', [
          ['Which important latitude passes through the middle of India?', 'Tropic of Cancer (23½°N)', ['Equator (0°)', 'Tropic of Capricorn (23½°S)', 'Arctic Circle (66½°N)'], 'It also passes through Gujarat and West Bengal.', 'The Tropic of Cancer cuts India into two roughly equal halves.'],
          ['On which longitude is Indian Standard Time based?', '82°30′E', ['78°E', '68°7′E', '97°25′E'], 'It passes near Mirzapur in Uttar Pradesh.', 'The Standard Meridian of India is 82°30′E, roughly in the middle of India\'s east–west extent.'],
          ['India\'s area of about 3.28 million km² makes it the world\'s…', '7th largest country', ['2nd largest country', '3rd largest country', '12th largest country'], 'Russia, Canada, USA, China, Brazil and Australia are larger.', 'Six countries are bigger, so India ranks seventh.'],
          ['How much local time difference does 1° of longitude make?', '4 minutes', ['1 hour', '15 minutes', '4 hours'], '360° are covered in 24 hours.', '24 × 60 = 1,440 minutes ÷ 360° = 4 minutes per degree.'],
          ['IST is ahead of Greenwich Mean Time by…', '5 hours 30 minutes', ['5 hours', '6 hours 30 minutes', '4 hours 30 minutes'], '82.5 × 4 minutes = ?', '82.5° × 4 = 330 minutes = 5 h 30 min.'],
          ['India lies entirely in which hemispheres?', 'Northern and Eastern', ['Southern and Eastern', 'Northern and Western', 'Southern and Western'], 'North of the Equator, east of Greenwich.', 'All of India is north of 0° latitude and east of 0° longitude.'],
        ]),
        tapT('tap', 'Tap every statement that is TRUE about India\'s location.', [
          ['The Tropic of Cancer passes through India', true], ['India is about 2.4% of the world\'s land area', true], ['The sun rises in Arunachal Pradesh about 2 hours before western Gujarat', true],
          ['India\'s Standard Meridian is 82°30′E', true], ['The Equator passes through Kanyakumari', false], ['Latitude decides local time', false], ['India lies in the Western Hemisphere', false],
        ], ['Latitude → climate; longitude → time.', 'Kanyakumari is at about 8°N, not 0°.'], 'India lies north of the Equator and east of Greenwich; the Tropic of Cancer runs through its middle.'),
      ],
    },
    {
      id: 'ts10.ss.relief.geology', title: 'How India\'s landforms were made: plates, Gondwana and the Himalayas', prereqs: ['ts10.ss.relief.location'],
      intro: [
        h('India was once next to Africa and Antarctica'),
        photo('🌍', 'The continents rest on huge moving plates. Over millions of years, the Indian plate travelled thousands of kilometres north.'),
        p('The rocks under your school are not still. The Earth\'s outer shell is broken into giant slabs called plates that move a few centimetres a year — about as fast as your fingernails grow. Over hundreds of millions of years, these slow movements built India\'s mountains, plains and plateaus.'),
        def('Plate tectonics', 'The theory that the Earth\'s crust is made of large plates floating on a softer layer below; their movements cause earthquakes, volcanoes and mountain building.'),
        def('Gondwana land', 'The ancient southern super-continent that included present-day India, Africa, South America, Australia and Antarctica.'),
        def('Tethys Sea', 'A long, shallow sea that lay between Gondwana and the northern land mass (Angaraland/Eurasia). Its sediments were later pushed up to form the Himalayas.'),
        h('The story in steps'),
        stepsB(
          'Over 200 million years ago, India was part of Gondwana land in the southern hemisphere.',
          'Gondwana broke apart; the Indian plate separated and began drifting north.',
          'Rivers kept depositing sediments into the Tethys Sea lying between India and Eurasia.',
          'The Indian plate collided with the Eurasian plate. The sediments of the Tethys were folded and pushed up — the Himalayas rose.',
          'A deep depression (trough) formed south of the rising mountains. Rivers from the Himalayas and the peninsula filled it with alluvium — this became the Indo-Gangetic plain.',
          'The Indian plate is still pushing north, so the Himalayas are still rising slowly and the region has earthquakes.',
        ),
        p('So the three big relief divisions have different ages. The Peninsular plateau is a block of very old, hard rock from Gondwana — among the oldest land in India. The Himalayas are young fold mountains. The northern plains are the youngest, made of recent river deposits.'),
        keys('Plates move slowly; their collisions build mountains.', 'India split from Gondwana and moved north.', 'Himalayas = folded Tethys sediments; young and still rising.', 'Peninsular plateau = oldest, hard rocks; northern plains = youngest, alluvium.'),
        remember('Oldest → youngest: Peninsular plateau → Himalayas → Indo-Gangetic plains.'),
        tip('Think of pushing a tablecloth across a table into a wall: the cloth crumples into folds. The Tethys sediments crumpled the same way.'),
      ],
      examples: [
        ex('Why do the Himalayas have fossils of sea animals high up on their slopes?', ['The rocks of the Himalayas were once sediments on the floor of the Tethys Sea.', 'Sea creatures died and were buried in those sediments.', 'When the Indian plate pushed into Eurasia, the sea-floor layers were folded and lifted thousands of metres.'], 'The mountains were raised from the old Tethys sea-floor, carrying marine fossils with them'),
        ex('Arrange the formation of the Himalayas, the Peninsular plateau and the northern plains from oldest to youngest, with reasons.', ['Peninsular plateau: a part of Gondwana land — the oldest.', 'Himalayas: formed when the Indian plate collided with Eurasia — much later.', 'Northern plains: filled in the trough in front of the Himalayas by river deposits — after the mountains rose.'], 'Plateau → Himalayas → plains'),
      ],
      practice: [
        orderT('order', 'Put these stages in the making of India\'s relief in the correct order.', [
          'India is part of Gondwana land', 'The Indian plate breaks away and drifts north', 'Sediments collect in the Tethys Sea', 'Collision with the Eurasian plate folds the sediments into the Himalayas', 'Rivers fill the trough south of the Himalayas, forming the northern plains',
        ], ['Start with the super-continent.', 'The plains could only form after the mountains (and the trough) existed.'], 'Gondwana → drift → Tethys sediments → collision and folding → plains filled by rivers.'),
        mcq('concept', 'Remember: plateau oldest, mountains young, plains youngest.', [
          ['The Himalayas were formed mainly from…', 'Sediments of the Tethys Sea folded by plate collision', ['Lava from volcanoes', 'Wind-blown sand', 'Glacier ice'], 'Think of the sea that lay between India and Eurasia.', 'Collision of the Indian and Eurasian plates folded the Tethys sediments into fold mountains.'],
          ['Which is the oldest landmass of India?', 'The Peninsular plateau', ['The Himalayas', 'The Indo-Gangetic plain', 'The Andaman Islands'], 'It was part of Gondwana land.', 'The plateau is made of ancient crystalline rocks from Gondwana.'],
          ['The Indo-Gangetic plain was formed by…', 'River deposits filling a depression south of the Himalayas', ['Folding of rocks', 'Volcanic lava flows', 'Coral growth'], 'Alluvium is carried by rivers.', 'Himalayan and peninsular rivers deposited alluvium in the trough.'],
          ['Gondwana land included India and…', 'Africa, South America, Australia and Antarctica', ['Europe and North America', 'Only Sri Lanka', 'Siberia and China'], 'It was a southern super-continent.', 'Gondwana was the southern part of the ancient super-continent.'],
          ['Why are earthquakes common in the Himalayan region?', 'The Indian plate is still pushing against the Eurasian plate', ['The region gets heavy rain', 'The mountains are made of soft soil', 'Glaciers are melting'], 'The plates have not stopped moving.', 'Ongoing plate collision builds stress that is released as earthquakes.'],
          ['Plates move roughly as fast as…', 'Your fingernails grow (a few cm a year)', ['A car on a highway', 'A walking person', 'A river current'], 'Very, very slow.', 'Plates move a few centimetres a year, but over millions of years that adds up to thousands of km.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Gondwana', 'Ancient southern super-continent'], ['Tethys', 'Sea between India and Eurasia'], ['Plate', 'Huge moving slab of the Earth\'s crust'],
          ['Alluvium', 'Fine soil deposited by rivers'], ['Fold mountains', 'Mountains formed by crumpling of rock layers'], ['Eurasian plate', 'Northern plate that India collided with'],
        ], ['Start with the two names: Gondwana is land, Tethys is sea.', 'Alluvium is what rivers leave behind.']),
      ],
    },
    {
      id: 'ts10.ss.relief.himalaya-plains', title: 'The Himalayas and the Indo-Gangetic plains', prereqs: ['ts10.ss.relief.geology'],
      intro: [
        h('The wall in the north and the food bowl below it'),
        photo('⛰️', 'The Himalayas — the youngest and highest fold mountains in the world, stretching about 2,400 km from Kashmir to Arunachal Pradesh.'),
        p('Look at a physical map of India: a thick brown wall in the north, then a wide green band below it. The wall is the Himalayas; the green band is the Indo-Gangetic plain, where more than a third of Indians live. These two are partners — the mountains feed the plains with water and soil.'),
        h('Three parallel ranges'),
        def('Himadri (Greater Himalaya)', 'The northernmost and highest range, average height about 6,000 m, with peaks like Mount Everest and Kanchenjunga. Snow-covered all year; source of many glaciers.'),
        def('Himachal (Lesser Himalaya)', 'The middle range, mostly 3,700–4,500 m high, with famous hill stations such as Shimla, Mussoorie and Darjeeling and valleys like Kashmir and Kangra.'),
        def('Shiwaliks (Outer Himalaya)', 'The outermost, lowest range (about 900–1,100 m), made of loose sediments. Flat valleys between the Shiwaliks and Himachal are called duns, e.g. Dehradun.'),
        bars(['Shiwaliks', 'Himachal', 'Himadri', 'Mt Everest'], [1000, 4000, 6000, 8849], 'm', 'Approximate heights: Shiwaliks about 1,000 m, Himachal about 4,000 m, Himadri about 6,000 m average, Mount Everest 8,849 m (8,848.86 m measured in 2020).'),
        p('The Himalayas protect India from the freezing winds of Central Asia, block the monsoon winds so they shed rain on the plains, and are the source of perennial (year-round) rivers like the Ganga, Indus and Brahmaputra, which get water from melting snow and glaciers.'),
        h('The Indo-Gangetic plain'),
        p('Between the Himalayas and the peninsula lies a vast flat plain formed by three river systems — the Indus, the Ganga and the Brahmaputra. It is made of alluvium, deep fertile soil carried down by rivers, and it is one of the most intensively farmed and densely populated regions on Earth.'),
        def('Bhabar', 'A narrow belt of pebbles and boulders at the foot of the Shiwaliks, where streams disappear underground.'),
        def('Terai', 'A wet, marshy, once-forested belt south of the bhabar where the streams come up again.'),
        def('Bhangar', 'Older alluvium on higher ground, above flood level; contains lime nodules (kankar).'),
        def('Khadar', 'Newer, finer alluvium of the flood plains, renewed almost every year — very fertile.'),
        keys('Himalayas: Himadri (highest) → Himachal → Shiwaliks (lowest), north to south.', 'They block cold winds, cause monsoon rain and feed perennial rivers.', 'Plains: alluvial, flat, fertile, densely populated.', 'Bhabar → terai → bhangar/khadar as you move away from the hills.'),
        remember('Mount Everest (8,848.86 m, re-measured in 2020) is the highest peak in the world; Kanchenjunga (8,586 m) is the highest peak in India.'),
        tip('Memory hook: Bhangar is high and old, like a fort on a hill; Khadar is in the river\'s "khud" (low bed), getting new silt every flood.'),
      ],
      examples: [
        ex('A farmer near Patna gets fresh, fertile soil on his field almost every year after the floods. Is his land khadar or bhangar? Explain.', ['Fresh alluvium is deposited every year only on flood plains.', 'Flood plains are made of new alluvium — khadar.', 'Bhangar is old alluvium on higher land that floods do not reach.'], 'Khadar — new alluvium renewed by floods'),
        ex('Explain two ways the Himalayas help farmers in the Ganga plain.', ['Snow and glaciers melt in summer, keeping rivers like the Ganga flowing all year (perennial) for irrigation.', 'Rivers carry fine silt from the mountains and spread it as fertile alluvium.', 'The mountains also stop the monsoon winds, causing rain over the plain.'], 'Perennial water, fertile alluvium and monsoon rain'),
      ],
      practice: [
        mcq('ranges', 'Go from north (highest) to south (lowest).', [
          ['Which Himalayan range has the highest peaks and permanent snow?', 'Himadri (Greater Himalaya)', ['Himachal', 'Shiwaliks', 'Aravalli'], 'It is the northernmost range.', 'Himadri averages about 6,000 m and contains Everest and Kanchenjunga.'],
          ['Shimla and Mussoorie are hill stations in the…', 'Himachal (Lesser Himalaya)', ['Himadri', 'Shiwaliks', 'Western Ghats'], 'The middle range.', 'Most famous hill stations are in the Himachal range.'],
          ['Dehradun lies in a flat valley called a…', 'Dun', ['Doab', 'Delta', 'Kayal'], 'These valleys lie between the Shiwaliks and the Himachal.', 'Longitudinal valleys between Himachal and Shiwaliks are called duns.'],
          ['The outermost, lowest range of the Himalayas is the…', 'Shiwaliks', ['Himadri', 'Himachal', 'Karakoram'], 'It is made of loose sediments.', 'The Shiwaliks are the youngest and lowest range, about 900–1,100 m.'],
          ['Why are the Ganga and Brahmaputra perennial rivers?', 'They are fed by snow and glaciers as well as rain', ['They flow through deserts', 'They are short rivers', 'They are fed only by groundwater'], 'Where do they start?', 'Himalayan rivers get melt-water in summer and rain in the monsoon, so they flow all year.'],
          ['The highest peak located in India is…', 'Kanchenjunga', ['Mount Everest', 'Anamudi', 'Nanda Devi'], 'Everest is in Nepal–China.', 'Kanchenjunga (8,586 m) on the Sikkim–Nepal border is the highest peak in India.'],
        ]),
        matchT('plains', 'belt of the northern plains to its feature', [
          ['Bhabar', 'Pebbles; streams disappear underground'], ['Terai', 'Marshy belt where streams re-emerge'], ['Bhangar', 'Old alluvium above flood level'],
          ['Khadar', 'New alluvium renewed by floods'], ['Duns', 'Flat valleys between Shiwaliks and Himachal'], ['Doab', 'Land between two rivers, e.g. Ganga–Yamuna'],
        ], ['Bhabar is nearest the hills; khadar is on the flood plain.', 'Doab literally means "two waters".']),
        tapT('tap', 'Tap every way the Himalayas benefit India.', [
          ['They block freezing winds from Central Asia', true], ['They make monsoon winds shed rain over the plains', true], ['They feed perennial rivers with melt-water', true],
          ['Their forests and hill stations support tourism', true], ['They create the Thar desert', false], ['They supply the coral islands of Lakshadweep', false], ['They make the Deccan plateau rocky', false],
        ], ['Think of wind, rain and water.', 'The Thar desert is in the west, far from the Himalayas.'], 'The Himalayas act as a climatic barrier, a rain-maker and a water tower.'),
      ],
    },
    {
      id: 'ts10.ss.relief.plateau', title: 'The Peninsular plateau and the Deccan (where Telangana stands)', prereqs: ['ts10.ss.relief.geology'],
      intro: [
        h('You are standing on one of the oldest lands on Earth'),
        photo('🪨', 'The rounded granite boulders around Hyderabad and across Telangana are made of rocks more than 2,500 million years old — part of the Deccan plateau.'),
        p('Drive from Hyderabad towards Warangal and you will see huge rounded boulders balanced on each other. These are granite rocks of the Peninsular plateau, a table-land of old, hard crystalline rocks. Unlike the folded Himalayas, this block has been worn down by wind and water for millions of years, so its hills are low and rounded.'),
        def('Plateau', 'A raised area of land with a fairly flat top, higher than the surrounding land.'),
        h('Two parts of the plateau'),
        p('The Narmada river divides the plateau. North of it are the Central Highlands; south of it is the Deccan plateau.'),
        def('Central Highlands', 'The northern part, bounded by the Aravalli hills in the west and including the Malwa plateau, Bundelkhand, Baghelkhand and the Chotanagpur plateau. Rivers here (Chambal, Betwa, Son) flow north-east to join the Ganga–Yamuna.'),
        def('Aravalli range', 'Among the oldest fold mountains in the world, now worn down to low hills, running from Gujarat to Delhi.'),
        def('Deccan plateau', 'The triangular plateau south of the Narmada, higher in the west and sloping gently east. Most of Telangana lies on it.'),
        p('The Deccan is edged by two ranges of hills. The Western Ghats (Sahyadri) run parallel to the west coast; they are continuous and higher, about 900–1,600 m on average, and catch heavy monsoon rain. The Eastern Ghats are lower and broken into pieces, because big east-flowing rivers — the Mahanadi, Godavari, Krishna and Kaveri — cut through them on their way to the Bay of Bengal. That is also why Telangana\'s rivers, the Godavari and the Krishna, flow eastwards.'),
        p('Anamudi (2,695 m) in the Anaimalai hills of Kerala is the highest peak of peninsular India. The north-western Deccan is covered by the Deccan Traps, layers of volcanic basalt that weathered into fertile black soil — excellent for cotton.'),
        keys('The Narmada divides the plateau into Central Highlands (north) and the Deccan (south).', 'Deccan slopes from west to east, so most peninsular rivers flow east.', 'Western Ghats: continuous, high; Eastern Ghats: broken, low.', 'Black soil of the Deccan Traps is good for cotton.'),
        remember('Highest peak of South India: Anamudi (2,695 m). Aravalli = one of the oldest fold mountains in the world.'),
        tip('Remember the slope: the Deccan is a table tilted towards the east — water runs towards the Bay of Bengal.'),
      ],
      examples: [
        ex('Why do the Godavari and Krishna flow east, though they rise in the Western Ghats close to the Arabian Sea?', ['The Deccan plateau is higher in the west and slopes gently to the east.', 'Water follows the slope.', 'So rivers rising in the Western Ghats cross the plateau and enter the Bay of Bengal.'], 'Because the Deccan plateau tilts towards the east'),
        ex('Compare the Western and Eastern Ghats on two points.', ['Continuity: Western Ghats are continuous; Eastern Ghats are broken by rivers.', 'Height: Western Ghats are higher (about 900–1,600 m); Eastern Ghats are lower.', 'Rainfall: Western Ghats face the monsoon winds and get heavy rain.'], 'Western Ghats: continuous and higher; Eastern Ghats: discontinuous and lower'),
      ],
      practice: [
        mcq('plateau', 'Recall the Narmada divide and the west-to-east tilt.', [
          ['Which river divides the Peninsular plateau into the Central Highlands and the Deccan?', 'Narmada', ['Godavari', 'Krishna', 'Ganga'], 'It flows west into the Arabian Sea.', 'The Narmada rift separates the Central Highlands (north) from the Deccan (south).'],
          ['The highest peak of peninsular India is…', 'Anamudi', ['Kanchenjunga', 'Mahendragiri', 'Mount Abu'], 'It is in the Anaimalai hills of Kerala.', 'Anamudi (2,695 m) is the highest peak south of the Himalayas.'],
          ['Why are the Eastern Ghats discontinuous?', 'Big east-flowing rivers have cut through them', ['They are made of sand', 'Glaciers wore them down', 'They were never uplifted'], 'Think of the Godavari and Krishna.', 'Rivers like the Mahanadi, Godavari, Krishna and Kaveri break the Eastern Ghats into separate hills.'],
          ['Black soil of the Deccan was formed from…', 'Volcanic basalt (Deccan Traps)', ['River alluvium', 'Desert sand', 'Coral'], 'Traps are layers of lava.', 'Weathered basalt lava produces black cotton soil.'],
          ['Which are among the oldest fold mountains in the world?', 'Aravalli', ['Himalaya', 'Shiwaliks', 'Western Ghats'], 'They lie on the western edge of the Central Highlands.', 'The Aravallis are ancient fold mountains, now worn down to low hills.'],
          ['Most of Telangana lies on the…', 'Deccan plateau', ['Indo-Gangetic plain', 'Thar desert', 'Malabar coast'], 'South of the Narmada.', 'Telangana is part of the eastern Deccan plateau.'],
        ]),
        matchT('match', 'feature to its description', [
          ['Western Ghats', 'Continuous, high, heavy rain on west slopes'], ['Eastern Ghats', 'Low, broken by rivers'], ['Aravalli', 'Ancient worn-down fold mountains'],
          ['Deccan Traps', 'Layers of volcanic basalt'], ['Malwa plateau', 'Part of the Central Highlands'], ['Anamudi', 'Highest peak of South India'], ['Chotanagpur plateau', 'Mineral-rich north-eastern part of the plateau'],
        ], ['Start with the two Ghats.', 'Traps = lava layers.']),
        tapT('tap', 'Tap every TRUE statement about the Deccan plateau.', [
          ['It is higher in the west and slopes east', true], ['It is triangular in shape', true], ['Its north-west has black soil from basalt', true], ['Telangana lies on it', true],
          ['It is younger than the Himalayas', false], ['Its rivers mostly flow into the Arabian Sea', false], ['It is made of fresh river alluvium', false],
        ], ['Think about age, slope and soil.', 'Only a few rivers such as the Narmada and Tapi flow west.'], 'The Deccan is old, triangular, tilted to the east and has black soil in the north-west.'),
      ],
    },
    {
      id: 'ts10.ss.relief.desert-coast', title: 'The Thar desert, coastal plains and islands', prereqs: ['ts10.ss.relief.location'],
      intro: [
        h('Sand dunes, backwaters and coral reefs — all in one country'),
        photo('🐪', 'Camels are suited to the Thar desert of Rajasthan, where rainfall is very low and sand dunes shift with the wind.'),
        p('India\'s relief does not end with mountains, plains and plateaus. To the west lies a desert; around the peninsula run narrow coastal plains; and far out in the sea lie two groups of islands.'),
        h('The Thar (Great Indian) Desert'),
        p('West of the Aravalli hills lies the Thar desert, mostly in Rajasthan. It receives very little rain (generally under about 250 mm a year, much less in the far west), so vegetation is thin — thorny bushes and grasses. Sand dunes called barchans (crescent-shaped) are common. The Luni is the only large river, and it flows only in the rainy season.'),
        h('The coastal plains'),
        def('Western coastal plain', 'A narrow strip between the Western Ghats and the Arabian Sea. From north to south: the Konkan (Mumbai–Goa), the Kanara (Karnataka) and the Malabar coast (Kerala), which has backwaters (kayals).'),
        def('Eastern coastal plain', 'A wider plain along the Bay of Bengal. The northern part is the Northern Circars (Odisha and Andhra Pradesh); the southern part is the Coromandel coast (Tamil Nadu). Large deltas of the Mahanadi, Godavari, Krishna and Kaveri make it very fertile for rice.'),
        p('Rivers on the west coast are short and fast, so they form estuaries rather than deltas. The east coast is flatter, and slow, heavy-laden rivers drop their silt to build deltas. The Chilika lake in Odisha is the largest salt-water lagoon in India.'),
        h('The islands'),
        photo('🌴', 'Palm-fringed coral islands of Lakshadweep in the Arabian Sea.'),
        def('Lakshadweep', 'A group of small coral islands in the Arabian Sea, off the Kerala coast. Kavaratti is the administrative headquarters.'),
        def('Andaman and Nicobar Islands', 'A long chain of islands in the Bay of Bengal, believed to be the raised peaks of an undersea mountain range. Port Blair (Sri Vijaya Puram) is the capital. Barren Island here is India\'s only active volcano.'),
        keys('Thar: west of the Aravallis, very low rainfall, barchans, the Luni river.', 'West coast: narrow — Konkan, Kanara, Malabar; estuaries.', 'East coast: wide — Northern Circars, Coromandel; deltas.', 'Lakshadweep: coral, Arabian Sea. Andaman & Nicobar: mountain peaks, Bay of Bengal, active volcano.'),
        remember('India\'s only active volcano: Barren Island (Andaman). Largest salt-water lake: Chilika (Odisha).'),
        tip('East coast = Deltas (both start with a sound like "D" in "Delta East"); West coast = Estuaries.'),
      ],
      examples: [
        ex('Why does the east coast have big deltas while the west coast has estuaries?', ['East-flowing rivers (Godavari, Krishna, etc.) are long and cross a gentle slope, so they slow down and drop silt at their mouths → deltas.', 'West-flowing rivers are short and rush down the steep Western Ghats; the coast is narrow, so they carry silt out to sea → estuaries.'], 'Gentle slope and long rivers in the east build deltas; short, swift rivers in the west form estuaries'),
        ex('A tourist visits Kavaratti and sees coral reefs. Which island group is she in and how were these islands formed?', ['Kavaratti is the headquarters of Lakshadweep.', 'These islands were built by tiny sea animals called coral polyps, whose skeletons pile up into reefs.'], 'Lakshadweep — coral islands in the Arabian Sea'),
      ],
      practice: [
        matchT('match', 'place to its region', [
          ['Konkan', 'Western coastal plain (Mumbai–Goa)'], ['Malabar', 'Kerala coast with backwaters'], ['Coromandel', 'Tamil Nadu coast'], ['Northern Circars', 'Odisha–Andhra coast'],
          ['Kavaratti', 'Lakshadweep'], ['Port Blair', 'Andaman and Nicobar Islands'], ['Luni', 'River of the Thar desert'], ['Chilika', 'Salt-water lagoon in Odisha'],
        ], ['West coast: Konkan → Kanara → Malabar from north to south.', 'Kavaratti is in the Arabian Sea; Port Blair in the Bay of Bengal.']),
        mcq('mcq', 'Compare west and east; desert and islands.', [
          ['India\'s only active volcano is on…', 'Barren Island', ['Kavaratti', 'Minicoy', 'Rameswaram'], 'It is in the Andaman Sea.', 'Barren Island in the Andaman group is India\'s only active volcano.'],
          ['The Lakshadweep islands are made of…', 'Coral', ['Volcanic lava', 'River silt', 'Granite'], 'Built by tiny sea animals.', 'Coral polyps built these low islands.'],
          ['Which coastal plain is wider and has large deltas?', 'Eastern coastal plain', ['Western coastal plain', 'Konkan coast', 'Malabar coast'], 'Godavari and Krishna end there.', 'Long east-flowing rivers build deltas on the wide eastern plain.'],
          ['Crescent-shaped sand dunes in the Thar desert are called…', 'Barchans', ['Kayals', 'Duns', 'Doabs'], 'They are shaped like a new moon.', 'Barchans are crescent dunes formed by wind.'],
          ['The Thar desert lies…', 'West of the Aravalli hills', ['East of the Western Ghats', 'South of the Narmada', 'In the Northern Circars'], 'The Aravallis do not stop dry winds.', 'The Thar lies to the west (leeward side) of the Aravallis.'],
          ['Backwaters (kayals) are a feature of the…', 'Malabar coast', ['Coromandel coast', 'Konkan coast', 'Thar desert'], 'Think of Kerala boat-rides.', 'The Malabar coast of Kerala has lagoons and backwaters.'],
        ]),
        tapT('tap', 'Tap every feature found on the EASTERN coastal plain.', [
          ['Godavari delta', true], ['Krishna delta', true], ['Chilika lake', true], ['Coromandel coast', true],
          ['Malabar backwaters', false], ['Konkan coast', false], ['Lakshadweep islands', false],
        ], ['East = Bay of Bengal side.', 'Konkan and Malabar are on the Arabian Sea side.'], 'Deltas, Chilika and the Coromandel coast are in the east; Konkan, Malabar and Lakshadweep are on the west.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Ideas of Development
// =====================================================================================
/** illustrative monthly incomes (₹ thousand) of five families in two villages with the same average */
const C2_SETS: { a: number[]; b: number[] }[] = [
  { a: [10, 11, 12, 13, 14], b: [2, 3, 4, 5, 46] },
  { a: [8, 9, 10, 11, 12], b: [1, 2, 3, 4, 40] },
  { a: [14, 15, 16, 17, 18], b: [3, 4, 5, 6, 62] },
  { a: [18, 19, 20, 21, 22], b: [4, 5, 6, 7, 78] },
  { a: [6, 7, 8, 9, 10], b: [1, 1, 2, 2, 34] },
  { a: [20, 22, 24, 26, 28], b: [5, 5, 6, 8, 96] },
];

const ch2: USpec = {
  id: 'ts10.ss.ch2', subject: 'social', title: 'Ideas of Development', source: src(2),
  objectives: [
    {
      id: 'ts10.ss.dev.goals', title: 'Different people, different goals of development', prereqs: [],
      intro: [
        h('What does "development" mean to you?'),
        photo('🧑‍🌾', 'For a farmer in Nalgonda, development may mean assured irrigation water and a fair price for paddy. For a student in Hyderabad, it may mean a good college and a job.'),
        p('Ask five people what "development" means and you will get five answers. A landless labourer wants more days of work and better wages. A girl from a rich family wants the same freedom as her brother to study and choose a career. A shopkeeper wants a good road so customers can reach the market. People want different things because their lives and needs are different.'),
        def('Development', 'Progress towards a better life — more income, but also security, equal treatment, freedom, good health, education and a safe environment.'),
        p('Development goals are not only about money. Many important things — respect, safety, a clean environment, equal treatment of women, freedom from discrimination — cannot be bought in a shop. A person may earn well but still feel insecure if the neighbourhood is unsafe.'),
        h('When goals clash'),
        p('One person\'s development can be another\'s loss. Suppose a big dam is planned on a river. Industries and farmers downstream want it for electricity and irrigation. But people living in the villages and forests that will be flooded may lose their land, homes and way of life. A good development plan listens to all of them and looks for fair solutions such as proper resettlement.'),
        stepsB(
          'Identify the people affected by a project (who gains, who loses).',
          'List the goals of each group — income, land, water, safety, culture.',
          'Note where goals conflict (for example, electricity vs. loss of homes).',
          'Look for fair alternatives: resettlement, compensation, smaller projects, sharing benefits.',
        ),
        h('National development'),
        p('Countries also set development goals: more jobs, better health and schools, less poverty, fair sharing of resources and protecting nature for future generations. Different ideas about how to reach these goals are debated in elections and in Parliament.'),
        keys('Development means different things to different people.', 'People seek both income and non-material goals (security, dignity, equality, freedom).', 'Goals can conflict; what is development for one may be destructive for another.', 'National development must think of fairness and the future.'),
        remember('Exam point: "Development is not only about income." Give examples of non-material goals: equal treatment, freedom, security, respect, clean environment.'),
        tip('In answers, always name the person and their goal: "A landless labourer wants more days of work".'),
      ],
      examples: [
        ex('A new factory is planned near a village in Sangareddy district. Name one group that may support it and one that may oppose it, with reasons.', ['Support: young people looking for jobs — the factory brings employment and income.', 'Oppose: farmers near the site — they may lose land, and the factory could pollute water and air.', 'A fair plan would discuss compensation, pollution control and local hiring.'], 'Job-seekers may support it; farmers worried about land and pollution may oppose it'),
        ex('Priya\'s family earns enough, yet she says her family is "not developed" because she is not allowed to study further. Explain her point.', ['Her family\'s income is fine, so the material need is met.', 'But she lacks freedom and equal opportunity compared with boys.', 'Development includes non-material goals like equality and freedom.'], 'Development also needs equality and freedom, not just income'),
      ],
      practice: [
        mcq('goals', 'Think about what that particular person most lacks in life.', [
          ['What would a landless rural labourer most likely want as a development goal?', 'More days of work and better wages', ['A new airport', 'Lower taxes on cars', 'More shopping malls'], 'He depends on daily wage work.', 'With no land of his own, regular work and fair wages matter most.'],
          ['Which of these is a NON-material development goal?', 'Being treated with dignity and equality', ['Higher monthly income', 'A bigger house', 'A new motorbike'], 'It cannot be bought with money.', 'Dignity and equality are not goods you can buy, yet they matter for a good life.'],
          ['A dam may be "development" for industrialists but not for…', 'People whose villages will be submerged', ['Electricity users in cities', 'Farmers getting canal water', 'Engineers building the dam'], 'Who loses land and homes?', 'Displaced families lose land, homes and livelihoods — their goals conflict with those who benefit.'],
          ['An urban girl from a rich family is most likely to want…', 'As much freedom as her brother to decide her future', ['More days of farm work', 'Irrigation canals', 'Higher prices for paddy'], 'Her income needs are met.', 'Her main goal is equal freedom and opportunity.'],
          ['Why do different people have different development goals?', 'Their life situations and needs are different', ['Only rich people have goals', 'The government decides everyone\'s goals', 'Goals depend only on age'], 'Compare a farmer with a student.', 'People\'s goals come from their circumstances — what they have and what they lack.'],
          ['Which is the best example of a CONFLICTING development goal?', 'More electricity from a dam vs. tribal families losing forest land', ['Better schools and better hospitals', 'Clean water and good health', 'More jobs and higher income'], 'One goal must hurt another group.', 'The dam\'s benefit for some means loss for others — the goals clash.'],
        ]),
        matchT('match', 'person to their likely development goal', [
          ['Landless labourer', 'More days of work and better wages'], ['Prosperous farmer', 'Assured irrigation and higher crop prices'], ['Girl in a city', 'Freedom and equal opportunity to study and work'],
          ['Adivasi family in a forest', 'Secure rights to forest land and resources'], ['Fisherfolk on the coast', 'Safe seas and protection of fish stocks'], ['Unemployed graduate', 'A job matching their education'],
        ], ['Ask what each person lacks most.', 'The forest family\'s life depends on forest land.']),
        orderT('order', 'Put the steps of judging a development project fairly in order.', [
          'Identify everyone the project affects', 'List each group\'s goals', 'Find where goals conflict', 'Look for fair alternatives and compensation',
        ], ['You cannot list goals before you know who is affected.', 'Solutions come last.'], 'Identify people → list goals → see conflicts → find fair alternatives.'),
      ],
    },
    {
      id: 'ts10.ss.dev.income', title: 'Income as a measure: average (per capita) income and its limits', prereqs: ['ts10.ss.dev.goals'],
      intro: [
        h('How do we compare two countries?'),
        photo('🪙', 'Income is the most common yardstick for comparing development — but it hides how the money is shared.'),
        p('To compare countries, people first look at income. But a big country will always have a bigger total income than a small one, even if its people are poorer. India\'s total income is far larger than Norway\'s, yet an average Norwegian earns much more. So we divide total income by population to get the income of an average person.'),
        def('Per capita (average) income', 'The total income of a country divided by its total population. It tells us how much income there is, on average, per person.'),
        f('Per capita income = National income ÷ Population', 'per capita income equals national income divided by population'),
        xp({
          title: 'What if? National income and population change', formula: 'PCI = NI ÷ P',
          res: ['PCI', 'Per capita income', '₹', 'NI * 100000 / P', 0],
          vars: [['NI', 'National income', '₹ lakh crore', 50, 400, 10, 200], ['P', 'Population', 'crore', 50, 160, 1, 140]],
          notes: [
            ['NI', 'More total income is shared among the same people, so the average person\'s share grows.', 'Less total income for the same number of people means a smaller average share.'],
            ['P', 'The same income is now divided among more people, so each person\'s average share falls. Income must grow faster than population for people to become better off.', 'Fewer people share the same income, so the average rises.'],
          ],
          mistakes: [
            ['Comparing total income of countries', 'A large country can have a big total income but a low income per person. Always divide by population.'],
            ['Thinking per capita income shows how money is shared', 'It is only an average: a few very rich people can pull it up while most remain poor.'],
          ],
          real: 'If India\'s national income rises 6% in a year but population rises about 1%, per capita income rises by roughly 5%.',
        }),
        h('Averages can hide inequality'),
        p('Imagine two villages, each with five families and the same average income of ₹12,000 a month. In village A every family earns between ₹10,000 and ₹14,000. In village B four families earn under ₹6,000 while one family earns ₹46,000. The average is the same, but life in village B is very unequal. So we must also ask how income is distributed.'),
        bars(['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5'], [10, 11, 12, 13, 14, 2, 3, 4, 5, 46], '₹ thousand', 'Illustrative monthly incomes: village A families earn 10–14 thousand; village B families earn 2, 3, 4, 5 and 46 thousand. Both averages are 12 thousand.'),
        p('The World Bank groups countries as high, middle or low income using gross national income per person; the cut-off values are revised every year. India is in the lower-middle income group.'),
        keys('Per capita income = total income ÷ population.', 'It allows fair comparison between countries of different sizes.', 'It is an average and hides inequality.', 'Income alone does not show health, education or freedom.'),
        remember('Per capita income is also called average income. The World Bank uses it to classify countries; India is a lower-middle income country.'),
        tip('When a question gives a table of incomes, always check both the average AND the spread (gap between highest and lowest).'),
      ],
      examples: [
        ex('Country X has a national income of ₹30 lakh crore and a population of 10 crore. Find its per capita income.', ['Per capita income = national income ÷ population', '₹30 lakh crore = ₹30,00,000 crore', '₹30,00,000 crore ÷ 10 crore = ₹3,00,000'], '₹3,00,000 per person per year'),
        ex('Village A incomes (₹ thousand): 10, 11, 12, 13, 14. Village B: 2, 3, 4, 5, 46. Where would you prefer to live, and why?', ['Average A = 60 ÷ 5 = 12; average B = 60 ÷ 5 = 12 — the same.', 'In A incomes are close together; in B four families are poor and one is rich.', 'Unless you are sure to be the rich family, A is safer and fairer.'], 'Village A — equal average but far more equal distribution'),
      ],
      practice: [
        tp('avg', (r) => {
          const s = r.pick(C2_SETS);
          const which = r.pick(['a', 'b'] as const);
          const arr = s[which];
          const avg = arr.reduce((x, y) => x + y, 0) / arr.length;
          return numQ(`Five families in a village earn ₹${arr.join(' thousand, ₹')} thousand a month. What is the average (per capita family) income in ₹ thousand?`, avg, ['Add all five incomes.', `Divide the total by 5.`], [`Total = ${arr.join(' + ')} = ${avg * 5}`, `Average = ${avg * 5} ÷ 5 = ${avg} thousand`, which === 'b' ? 'Notice how one rich family pulls the average up — most families earn far less than the average.' : 'Here incomes are close to the average, so the average describes the village well.'], [{ when: String(avg * 5), explain: 'That is the total. Divide by the number of families (5).' }]);
        }),
        tp('pci', (r) => {
          const pop = r.pick([5, 8, 10, 20, 25, 40, 50]);
          const pci = r.pick([40, 60, 75, 80, 120, 150, 200]) * 1000;
          const ni = (pci * pop) / 100000; // lakh crore
          return numQ(`A country's national income is ₹${ni} lakh crore and its population is ${pop} crore. Find the per capita income in rupees.`, pci, ['Per capita income = national income ÷ population.', '1 lakh crore ÷ 1 crore = 1 lakh. So divide the numbers and multiply by 1,00,000.'], [`₹${ni} lakh crore ÷ ${pop} crore = ${rd(ni / pop, 4)} lakh`, `= ${inr(pci)} per person`], [{ when: String(rd(ni / pop, 4)), explain: 'That is in lakh rupees. Convert to rupees by multiplying by 1,00,000.' }], 0.005, '₹');
        }, 2),
        mcq('limits', 'An average tells you the middle of the data, not how it is spread.', [
          ['Why do we use per capita income rather than total income to compare countries?', 'Countries have different populations', ['Total income is secret', 'Per capita income includes health', 'Total income is always smaller'], 'A big country has a big total.', 'Dividing by population lets us compare countries of different sizes fairly.'],
          ['What is the main weakness of per capita income as a measure?', 'It hides how income is distributed among people', ['It is too hard to calculate', 'It is always increasing', 'It counts only farmers'], 'Think of village B.', 'An average can look good even if most people are poor.'],
          ['Which organisation classifies countries as high, middle or low income?', 'The World Bank', ['UNDP', 'WTO', 'Reserve Bank of India'], 'It is a global development bank.', 'The World Bank uses income per person to group countries.'],
          ['If population grows faster than national income, per capita income will…', 'Fall', ['Rise', 'Stay the same', 'Double'], 'More people share the income.', 'Income ÷ population falls when the denominator grows faster.'],
          ['India is classified by the World Bank as a…', 'Lower-middle income country', ['High income country', 'Low income country', 'Upper-high income country'], 'India is in the middle group.', 'India falls in the lower-middle income group.'],
          ['Per capita income is another name for…', 'Average income', ['Total income', 'Minimum wage', 'Tax collected'], '"Per capita" means "per head".', 'It is the average income per person.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.dev.public', title: 'Public facilities: why money alone cannot buy development', prereqs: ['ts10.ss.dev.income'],
      intro: [
        h('Some things you cannot buy for yourself'),
        photo('🏫', 'A government school, a primary health centre and a ration shop are public facilities shared by everyone in the village.'),
        p('Your family\'s income can buy food, clothes and a phone. But can it buy clean air for your whole street? Or a hospital in your mandal? Or protection from infectious disease? Usually not. These things are best provided collectively — for everyone together — by the government and the community.'),
        def('Public facilities', 'Services provided collectively for all, such as schools, hospitals, safe drinking water, roads, electricity, public transport and the Public Distribution System (PDS).'),
        p('This is why two places with similar income can have very different quality of life. States that invested early in health centres, schools and fair-price shops have lower infant mortality and higher literacy than richer states that invested less. Kerala is a well-known example: its average income is not the highest, but its long-standing investment in basic health and education gives it one of India\'s lowest infant mortality rates and highest literacy rates.'),
        def('Infant mortality rate (IMR)', 'The number of children who die before the age of one year, per 1,000 live births in a year.'),
        def('Literacy rate', 'The percentage of people aged 7 years and above who can read and write with understanding.'),
        def('Net attendance ratio', 'The percentage of children of a given age group (e.g. 14–15 years) who are actually attending school.'),
        bars(['State P', 'State Q'], [1.8, 1.2], '₹ lakh per capita', 'Illustrative: State P has higher per capita income (1.8 lakh) than State Q (1.2 lakh)…'),
        bars(['State P', 'State Q'], [30, 8], 'IMR per 1,000', '…but State Q, which invested in health centres and schools, has a much lower infant mortality rate (8 vs 30). Illustrative figures.'),
        keys('Money cannot buy many things that matter — they must be provided publicly.', 'Public facilities: schools, health care, water, PDS, transport.', 'States with good public facilities can have better health and education than richer states.', 'Indicators: IMR, literacy rate, net attendance ratio.'),
        remember('IMR is counted per 1,000 live births, for babies who die before their first birthday.'),
        tip('A high IMR is BAD (more infant deaths); a high literacy rate is GOOD. Read the label before comparing.'),
      ],
      examples: [
        ex('State P has higher per capita income than State Q, but State Q has lower infant mortality and higher literacy. Which state is better off? Explain.', ['Per capita income favours P.', 'But IMR and literacy show State Q\'s people are healthier and better educated.', 'These come from public facilities such as health centres, schools and PDS.'], 'State Q is better off in human terms because of better public facilities'),
        ex('Why is it cheaper and more effective for the government to provide clean drinking water to a village than for each family to buy it?', ['Building one water scheme for all costs less per family than every family buying bottled water or digging a bore well.', 'Clean water for everyone stops diseases from spreading — even to families who could afford their own.', 'It is fair: poor families get the same safe water.'], 'Collective provision is cheaper, protects everyone\'s health and is fair'),
      ],
      practice: [
        tapT('tap', 'Tap every item that is a PUBLIC facility.', [
          ['Government primary health centre', true], ['Ration shop under PDS', true], ['Government school', true], ['Public bus service', true], ['Village drinking-water scheme', true],
          ['A family\'s private car', false], ['A mobile phone you bought', false], ['Your own house', false],
        ], ['Is it shared by everyone and provided collectively?', 'Things you buy for yourself are private.'], 'Public facilities are provided collectively for all; private goods belong to individuals.'),
        mcq('ind', 'Read each indicator carefully: is a high value good or bad?', [
          ['Infant mortality rate measures deaths of children below…', '1 year per 1,000 live births', ['5 years per 100 children', '1 year per 100 births', '10 years per 1,000 people'], 'Infant = baby under one.', 'IMR counts deaths before age 1 per 1,000 live births.'],
          ['A state has low per capita income but very low infant mortality. The most likely reason is…', 'Good public health care and education', ['Very high taxes', 'Fewer people in cities', 'More private cars'], 'What lowers infant deaths?', 'Health centres, nutrition and educated mothers reduce infant deaths.'],
          ['Literacy rate is calculated for people aged…', '7 years and above', ['All ages', '18 years and above', '5–14 years only'], 'Very young children are not counted.', 'Literacy rate covers the population aged 7 and above.'],
          ['Net attendance ratio tells us…', 'What percentage of children of an age group attend school', ['How many schools exist', 'How many teachers are trained', 'How many adults can read'], 'Attendance = being in school.', 'It is the share of children of that age actually attending school.'],
          ['Which is the best argument for public facilities?', 'Some needs, like disease control, are cheaper and better met collectively', ['Rich people do not need them', 'Private goods are always bad', 'They raise per capita income directly'], 'Think about clean water or vaccination.', 'Collective provision is cheaper per person and protects everyone.'],
          ['Kerala is often cited because…', 'It has low infant mortality and high literacy thanks to basic health and education', ['It has the highest per capita income in India', 'It has the largest area', 'It has the most factories'], 'It shows that income is not everything.', 'Long-term investment in public health and schools gave Kerala good human indicators.'],
        ]),
        matchT('match', 'indicator to what it measures', [
          ['Infant mortality rate', 'Babies dying before age 1, per 1,000 live births'], ['Literacy rate', '% of people aged 7+ who can read and write'], ['Net attendance ratio', '% of children of an age group attending school'],
          ['Per capita income', 'Total income ÷ population'], ['Life expectancy', 'Average years a newborn is expected to live'],
        ], ['IMR is about babies.', 'Per capita income is an average.']),
      ],
    },
    {
      id: 'ts10.ss.dev.hdi', title: 'The Human Development Index and sustainable development', prereqs: ['ts10.ss.dev.public'],
      intro: [
        h('Ranking countries by how people live, not just what they earn'),
        photo('🌍', 'Every year the UNDP compares nearly 190 countries on health, education and income in its Human Development Report.'),
        p('Since 1990, the United Nations Development Programme (UNDP) has published a Human Development Report. Its idea is simple: the real wealth of a nation is its people. So it measures how long people live, how much they learn, and the income they have to live a decent life.'),
        def('Human Development Index (HDI)', 'A summary score between 0 and 1 that combines three dimensions: a long and healthy life (life expectancy at birth), knowledge (mean and expected years of schooling) and a decent standard of living (gross national income per person).'),
        stepsB(
          'Health: measure life expectancy at birth.',
          'Education: measure mean years of schooling of adults and expected years of schooling of children.',
          'Standard of living: measure gross national income per person (adjusted for prices).',
          'Convert each into an index between 0 and 1 and combine them into one HDI score.',
          'Rank the countries: the higher the HDI, the higher the human development.',
        ),
        p('In recent reports India has ranked roughly 130th out of about 190 countries, in the "medium human development" group. Some neighbours with lower income per person, such as Sri Lanka, rank higher because of better health and education, which shows again that income is not everything.'),
        h('Development that lasts'),
        def('Sustainable development', 'Development that meets the needs of the present generation without reducing the ability of future generations to meet their own needs.'),
        p('Groundwater is a warning example. In many parts of India, including dry parts of Telangana, bore wells pump out more water than rain puts back. Farmers earn more today, but the water table falls, wells dry up, and future farmers suffer. Development that destroys its own base cannot continue.'),
        keys('HDR is published by UNDP since 1990.', 'HDI = health + education + income, each scored 0–1.', 'India is in the medium human development group (around 130th in recent reports).', 'Sustainable development protects resources for future generations.'),
        remember('Three dimensions of HDI: long and healthy life, knowledge, decent standard of living. Published by UNDP.'),
        tip('HDI dimensions — "Live long, Learn, Earn".'),
      ],
      examples: [
        ex('Country A has higher income per person than Country B, but B ranks higher on HDI. How is that possible?', ['HDI uses three dimensions, not just income.', 'B must have higher life expectancy and/or more years of schooling.', 'Better health and education can outweigh lower income in the index.'], 'B does better on health and education, which count equally with income in HDI'),
        ex('Farmers in a dry mandal deepen bore wells every year to grow water-hungry crops. Is this sustainable development?', ['Today: more irrigation and income.', 'But extraction is greater than recharge, so the water table falls.', 'Future generations will have little groundwater.'], 'No — it uses up groundwater faster than it is replaced, harming future generations'),
      ],
      practice: [
        mcq('hdi', 'Recall: who publishes it and what goes into it.', [
          ['Who publishes the Human Development Report?', 'UNDP', ['World Bank', 'WTO', 'IMF'], 'It is a UN body.', 'The United Nations Development Programme publishes the HDR (since 1990).'],
          ['Which is NOT one of the three dimensions of HDI?', 'Number of factories', ['Life expectancy', 'Years of schooling', 'Income per person'], 'Live long, learn, earn.', 'HDI combines health, education and income only.'],
          ['HDI values lie between…', '0 and 1', ['0 and 100', '1 and 10', '−1 and +1'], 'It is an index.', 'Each dimension and the final HDI are scored from 0 to 1.'],
          ['In recent Human Development Reports India is placed in the…', 'Medium human development group', ['Very high human development group', 'Low human development group', 'It is not ranked'], 'India ranks around 130th.', 'India is in the medium human development category.'],
          ['Sustainable development means…', 'Meeting present needs without harming future generations\' ability to meet theirs', ['Using all resources as fast as possible', 'Stopping all development', 'Only planting trees'], 'Think about groundwater for your grandchildren.', 'It balances present needs with future needs.'],
          ['Why can Sri Lanka rank above India on HDI?', 'Its people have better health and education indicators', ['It has a bigger population', 'It has more land', 'It exports more rice'], 'HDI is not only income.', 'Better life expectancy and schooling raise Sri Lanka\'s HDI.'],
        ]),
        orderT('order', 'Put the steps of calculating HDI in order.', [
          'Measure life expectancy at birth', 'Measure years of schooling', 'Measure gross national income per person', 'Convert each into an index between 0 and 1', 'Combine into one HDI value and rank countries',
        ], ['First collect the three measurements.', 'Ranking is the final step.'], 'Measure health, education and income → convert to 0–1 indices → combine and rank.'),
        tapT('tap', 'Tap every example of SUSTAINABLE use of resources.', [
          ['Rainwater harvesting in houses', true], ['Drip irrigation that saves water', true], ['Replanting trees after cutting', true], ['Solar power for homes', true],
          ['Pumping groundwater faster than rain recharges it', false], ['Dumping factory waste into a river', false], ['Burning crop stubble every year', false],
        ], ['Will the resource still be there for your grandchildren?', 'Over-pumping lowers the water table.'], 'Sustainable actions conserve or renew resources; the others use them up or pollute them.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Production and Employment
// =====================================================================================
const C3_CHAINS: { a: string; b: string; c: string; v: [number, number, number] }[] = [
  { a: 'A farmer sells cotton to a spinning mill for', b: 'The mill sells yarn to a weaver for', c: 'The weaver sells cloth to customers for', v: [100, 150, 220] },
  { a: 'A farmer sells wheat to a flour mill for', b: 'The mill sells flour to a baker for', c: 'The baker sells bread to customers for', v: [60, 90, 140] },
  { a: 'A farmer sells sugarcane to a sugar factory for', b: 'The factory sells sugar to a sweet shop for', c: 'The sweet shop sells sweets to customers for', v: [80, 130, 250] },
  { a: 'A miner sells iron ore to a steel plant for', b: 'The plant sells steel to a cycle maker for', c: 'The cycle maker sells cycles to customers for', v: [200, 450, 700] },
  { a: 'A farmer sells paddy to a rice mill for', b: 'The mill sells rice to a hotel for', c: 'The hotel sells meals to customers for', v: [50, 80, 180] },
  { a: 'A forest worker sells bamboo to a basket maker for', b: 'The basket maker sells baskets to a trader for', c: 'The trader sells them to customers for', v: [30, 90, 120] },
];
/** [sector, its output, total GDP] — illustrative ₹ lakh crore */
const C3_SHARES: [string, number, number][] = [
  ['services (tertiary)', 110, 200], ['agriculture (primary)', 36, 200], ['industry (secondary)', 54, 200], ['services (tertiary)', 165, 300],
  ['agriculture (primary)', 45, 250], ['industry (secondary)', 70, 250], ['services (tertiary)', 132, 240], ['agriculture (primary)', 27, 150],
];

const ch3: USpec = {
  id: 'ts10.ss.ch3', subject: 'social', title: 'Production and Employment', source: src(3),
  objectives: [
    {
      id: 'ts10.ss.prod.sectors', title: 'Three sectors of the economy: primary, secondary, tertiary', prereqs: [],
      intro: [
        h('From paddy field to plate'),
        photo('🌾', 'Paddy grown in the Godavari and Krishna basins is a primary product. Milled rice is a secondary product. The truck, the shop and the bank loan are tertiary services.'),
        p('Think of the rice on your plate. A farmer in Karimnagar grew the paddy. A rice mill turned it into polished rice. A lorry carried the rice to Hyderabad, a wholesale trader sold it, and a kirana shop near your house sold it to your family. Each of these people did a different kind of work. Economists group all such activities into three sectors.'),
        def('Primary sector', 'Activities that use natural resources directly: agriculture, dairy, fishing, forestry, mining. Also called the agriculture and related sector.'),
        def('Secondary sector', 'Activities that change natural products into other forms through manufacturing: rice mills, textile factories, steel plants, brick kilns, construction. Also called the industrial sector.'),
        def('Tertiary sector', 'Activities that do not produce goods themselves but provide services that help the other sectors: transport, trade, banking, communication, teaching, health care, IT. Also called the service sector.'),
        p('The sectors depend on each other. A farmer needs fertiliser made in a factory (secondary) and a bank loan (tertiary). A factory needs raw materials (primary) and transport to markets (tertiary).'),
        keys('Primary: directly from nature.', 'Secondary: manufacturing — changing one form into another.', 'Tertiary: services that support production and people.', 'The three sectors are interdependent.'),
        remember('Tertiary sector = service sector. Example: a software engineer in HITEC City and a bus conductor are both in the tertiary sector.'),
        tip('Ask: "Is something grown or dug? (primary) Is something made? (secondary) Is a service given? (tertiary)"'),
      ],
      examples: [
        ex('Classify: (a) a fisherman in Kakinada, (b) a worker in a cement factory in Nalgonda, (c) a teacher in a government school.', ['(a) Catches fish directly from nature → primary.', '(b) Turns limestone into cement → secondary.', '(c) Provides education, a service → tertiary.'], '(a) primary, (b) secondary, (c) tertiary'),
        ex('Show how the three sectors depend on each other using cotton.', ['Primary: a farmer grows cotton.', 'Secondary: a mill spins it into yarn and weaves cloth.', 'Tertiary: trucks, traders and banks move, sell and finance the cloth.', 'Without the farmer, no raw material; without transport, no market.'], 'Cotton passes from primary to secondary to tertiary, each needing the others'),
      ],
      practice: [
        matchT('match', 'activity to its sector', [
          ['Growing paddy', 'Primary'], ['Mining coal at Singareni', 'Primary'], ['Making cement', 'Secondary'], ['Weaving cloth in a mill', 'Secondary'],
          ['Driving a bus', 'Tertiary'], ['Teaching in a school', 'Tertiary'], ['Banking', 'Tertiary'], ['Catching fish', 'Primary'],
        ], ['Grown or dug → primary; made → secondary; service → tertiary.', 'Mining is taken straight from nature.']),
        tapT('tap', 'Tap every activity that belongs to the TERTIARY (service) sector.', [
          ['Courier delivery', true], ['Working in a bank', true], ['Doctor in a hospital', true], ['Software services', true], ['Selling vegetables in a market', true],
          ['Rearing goats', false], ['Making bricks', false], ['Building a house', false], ['Growing cotton', false],
        ], ['A service does not produce a physical good itself.', 'Construction and brick-making are secondary.'], 'Transport, trade, banking, health and IT are services; farming is primary; brick-making and construction are secondary.'),
        mcq('mcq', 'Decide whether it is grown/dug, made, or a service.', [
          ['Which sector is also called the industrial sector?', 'Secondary', ['Primary', 'Tertiary', 'Organised'], 'Manufacturing happens here.', 'The secondary sector covers manufacturing and construction.'],
          ['Dairy farming belongs to the…', 'Primary sector', ['Secondary sector', 'Tertiary sector', 'Unorganised sector only'], 'Milk comes from animals directly.', 'Animal rearing is a primary activity.'],
          ['A sugar factory in Medak belongs to the…', 'Secondary sector', ['Primary sector', 'Tertiary sector', 'Public facility sector'], 'Sugarcane is turned into sugar.', 'Processing a raw material into a new product is manufacturing.'],
          ['Why is the tertiary sector called the service sector?', 'It provides services rather than goods', ['It is run only by the government', 'It produces raw materials', 'It employs most people in India'], 'Teachers, doctors, drivers.', 'Its activities are services that support production and people.'],
          ['Which pair shows dependence of the primary on the tertiary sector?', 'A farmer taking a bank loan to buy seeds', ['A mill buying cotton', 'A factory making fertiliser', 'A miner digging coal'], 'Banks are services.', 'The farmer (primary) uses a banking service (tertiary).'],
          ['Construction of a building is in the…', 'Secondary sector', ['Primary sector', 'Tertiary sector', 'None of these'], 'Something is being made.', 'Construction is grouped with manufacturing in the secondary sector.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.prod.gdp', title: 'GDP: counting final goods and value added', prereqs: ['ts10.ss.prod.sectors'],
      intro: [
        h('How do we add up a whole country\'s production?'),
        photo('🛒', 'Only the final bread you buy is counted in GDP — not the wheat and flour again, because their value is already inside the price of the bread.'),
        p('Every year India produces crores of goods and services: rice, cement, cycles, haircuts, bus rides, bank loans. To measure total production we cannot add kilograms of rice to bus rides, so we add up their money values. But we must be careful not to count anything twice.'),
        def('Intermediate goods', 'Goods used up in making other goods, e.g. wheat sold to a flour mill, or flour sold to a baker.'),
        def('Final goods', 'Goods and services that reach the final user, e.g. bread bought by a family.'),
        def('Gross Domestic Product (GDP)', 'The value of all final goods and services produced within a country during a particular year.'),
        h('The double-counting trap'),
        p('Suppose a farmer sells wheat for ₹60 to a mill, the mill sells flour for ₹90 to a baker, and the baker sells bread for ₹140. If we added 60 + 90 + 140 = ₹290, we would count the wheat three times (it is inside the flour and inside the bread). The correct value of production is the final price: ₹140.'),
        def('Value added', 'The value a producer adds = value of output − value of inputs bought from others. Adding up the value added at every stage also gives GDP.'),
        stepsB(
          'Farmer: value added = ₹60 − ₹0 = ₹60.',
          'Mill: value added = ₹90 − ₹60 = ₹30.',
          'Baker: value added = ₹140 − ₹90 = ₹50.',
          'Total value added = 60 + 30 + 50 = ₹140 = value of the final good.',
        ),
        p('In India, GDP is estimated by a central government ministry (the Ministry of Statistics and Programme Implementation, through the National Statistical Office) with the help of state governments, which collect data on production in each sector.'),
        f('Sector share (%) = Sector output ÷ GDP × 100', 'sector share equals sector output divided by GDP times one hundred'),
        xp({
          title: 'What if? One sector grows faster than the rest', formula: 'Share = S ÷ (S + R) × 100',
          res: ['Share', 'Share of the sector in GDP', '%', 'S / (S + R) * 100', 1],
          vars: [['S', 'Output of the service sector', '₹ lakh crore', 10, 300, 5, 110], ['R', 'Output of all other sectors', '₹ lakh crore', 10, 300, 5, 90]],
          notes: [
            ['S', 'Services grow while other sectors stay the same, so services make up a bigger slice of GDP.', 'Services shrink, so their slice of the GDP pie becomes smaller.'],
            ['R', 'Agriculture and industry grow, so the services slice becomes relatively smaller even though services did not shrink.', 'The other sectors produce less, so services form a bigger part of the total.'],
          ],
          mistakes: [
            ['Thinking a falling share means falling output', 'A share can fall even when output rises — if the other sectors grow faster.'],
            ['Adding intermediate goods into GDP', 'Only final goods (or value added) are counted; otherwise inputs are counted twice.'],
          ],
          real: 'In recent years, services have made up more than half of India\'s GDP, though agriculture still employs the largest number of workers.',
        }),
        keys('GDP = value of final goods and services produced in a country in a year.', 'Count only final goods, or add up value added at each stage.', 'Adding intermediate goods causes double counting.', 'Sector share = sector output ÷ GDP × 100.'),
        remember('GDP counts FINAL goods and services only. Value added = output − intermediate inputs.'),
        tip('Quick check: the sum of value added at all stages must equal the final selling price.'),
      ],
      examples: [
        ex('A farmer sells cotton for ₹100 to a mill; the mill sells yarn for ₹150 to a weaver; the weaver sells cloth for ₹220. What is the contribution to GDP?', ['Final good: cloth worth ₹220.', 'Check with value added: 100 + (150 − 100) + (220 − 150) = 100 + 50 + 70 = 220.'], '₹220'),
        ex('In a year, services produce ₹110 lakh crore of a GDP of ₹200 lakh crore. Find the share of services.', ['Share = 110 ÷ 200 × 100', '= 0.55 × 100 = 55%'], '55% of GDP'),
      ],
      practice: [
        tp('va', (r) => {
          const c = r.pick(C3_CHAINS);
          const [x, y, z] = c.v.map((v) => v * r.pick([1, 2, 3]));
          const ask = r.pick(['gdp', 'mid', 'last'] as const);
          const story = `${c.a} ₹${x}. ${c.b} ₹${y}. ${c.c} ₹${z}.`;
          if (ask === 'gdp') return numQ(`${story} How much does this chain add to GDP (in ₹)?`, z, ['Count only the final good sold to customers.', 'Or add the value added at each stage.'], [`Final good value = ₹${z}`, `Check: ${x} + ${y - x} + ${z - y} = ${z}`], [{ when: String(x + y + z), explain: 'You added intermediate goods too — that is double counting.' }]);
          if (ask === 'mid') return numQ(`${story} What is the value added by the middle producer (in ₹)?`, y - x, ['Value added = value of output − value of inputs bought.', `${y} − ${x}`], [`Value added = ${y} − ${x} = ₹${y - x}`], [{ when: String(y), explain: 'That is the selling price. Subtract what the producer paid for inputs.' }]);
          return numQ(`${story} What is the value added by the last seller (in ₹)?`, z - y, ['Value added = output − inputs bought.', `${z} − ${y}`], [`Value added = ${z} − ${y} = ₹${z - y}`], [{ when: String(z), explain: 'Subtract the cost of the input (₹' + y + ').' }]);
        }, 2),
        tp('share', (r) => {
          const [s, out, gdp] = r.pick(C3_SHARES);
          const sh = rd((out / gdp) * 100, 1);
          return numQ(`Illustrative data: ${s} produced ₹${out} lakh crore out of a GDP of ₹${gdp} lakh crore. What is its share of GDP? (number only, no % sign)`, sh, ['Share = sector output ÷ GDP × 100.', `${out} ÷ ${gdp} × 100`], [`${out} ÷ ${gdp} = ${rd(out / gdp, 4)}`, `× 100 = ${sh}%`], [{ when: String(rd(out / gdp, 4)), explain: 'Multiply by 100 to turn the fraction into a percentage.' }]);
        }),
        mcq('gdp', 'Final goods only — no double counting.', [
          ['GDP is the value of…', 'All final goods and services produced in a country in a year', ['All goods sold in a year including inputs', 'Only goods exported', 'Only agricultural output'], 'Intermediate goods are excluded.', 'GDP counts final goods and services produced within the country during the year.'],
          ['Why are intermediate goods not counted separately in GDP?', 'Their value is already included in the final goods', ['They are too cheap', 'They are produced abroad', 'They are not taxed'], 'Wheat is inside the bread.', 'Counting them again would be double counting.'],
          ['Which is a final good?', 'A bicycle bought by a family', ['Steel bought by a cycle factory', 'Flour bought by a baker', 'Cotton bought by a mill'], 'Who is the user?', 'The family is the final user; the others are inputs for further production.'],
          ['Value added by a baker who buys flour for ₹90 and sells bread for ₹140 is…', '₹50', ['₹140', '₹90', '₹230'], 'Output − input.', '140 − 90 = ₹50.'],
          ['In India, GDP is estimated by…', 'A central government ministry with data from the states', ['The World Bank alone', 'Each village panchayat separately', 'Private banks'], 'It is the Ministry of Statistics.', 'The Ministry of Statistics (through the NSO) estimates GDP with state data.'],
          ['If the share of agriculture in GDP falls, it must mean…', 'Agriculture grew more slowly than the other sectors (or shrank)', ['Agriculture production definitely fell', 'Farmers stopped working', 'GDP fell'], 'A share is a fraction of the total.', 'A share falls when the sector grows slower than the total.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.prod.change', title: 'Changing importance of sectors: output vs employment', prereqs: ['ts10.ss.prod.gdp'],
      intro: [
        h('More output from services, more workers on farms'),
        photo('🏢', 'IT offices in Hyderabad are part of the fast-growing service sector, while most rural families still depend on farming.'),
        p('In the history of developed countries, farming came first, then factories grew, and later services became the biggest part of the economy. India has followed a different path. The service sector has grown fastest and now produces more than half of India\'s GDP. But the share of workers has not shifted as much: agriculture and related activities still employ the largest group of India\'s workers, though their share of output is small.'),
        bars(['Primary', 'Secondary', 'Tertiary'], [18, 27, 55], '% of GDP (approx.)', 'Approximate recent shares of India\'s GDP: primary about 18%, secondary about 27%, tertiary about 55%. Rounded figures for illustration.'),
        bars(['Primary', 'Secondary', 'Tertiary'], [45, 25, 30], '% of workers (approx.)', 'Approximate recent shares of India\'s workers: primary about 45%, secondary about 25%, tertiary about 30%. Rounded figures for illustration.'),
        p('Why has the service sector grown? Basic services like schools, hospitals, transport and banks are needed everywhere. As farming and industry grow, they need more transport, storage and trade. As incomes rise, people spend more on eating out, tourism, private schools and hospitals. New services based on information technology have also expanded rapidly.'),
        def('Underemployment / disguised unemployment', 'A situation where more people are working than are actually needed, so each works below their potential. If some are removed, total output does not fall. Common in family farming.'),
        p('Example: five members of a family work on a two-acre plot that really needs only three. Two of them are disguisedly unemployed — they appear to be working but add nothing to output. If they found jobs elsewhere, the family\'s income would rise. To create such jobs, governments have tried schemes like the Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA, 2005), which guarantees up to 100 days of paid work a year to rural households that ask for it.'),
        keys('Tertiary sector now produces the largest share of India\'s GDP.', 'Primary sector still employs the largest share of workers.', 'Disguised unemployment: more workers than needed, mostly in agriculture.', 'Jobs in other sectors and rural employment schemes can absorb surplus workers.'),
        remember('MGNREGA (2005): up to 100 days of guaranteed wage employment per year for every rural household that demands work.'),
        tip('Exam favourite: "The shift in output has not been matched by a shift in employment."'),
      ],
      examples: [
        ex('Use the approximate figures: primary sector ≈ 18% of GDP but ≈ 45% of workers. What does this tell us about incomes in farming?', ['Nearly half the workers share less than one-fifth of the output.', 'So output (and income) per worker in the primary sector is much lower than in other sectors.', 'There may also be disguised unemployment on farms.'], 'Farm workers earn much less on average; many are underemployed'),
        ex('Ravi\'s family of 6 works on a 3-acre plot that needs only 4 workers. Two cousins move to Hyderabad for construction jobs. What happens to the farm output and the family\'s income?', ['The farm needed only 4 workers, so output stays the same.', 'The 2 cousins now earn wages in the city.', 'Family income rises — the 2 were disguisedly unemployed before.'], 'Farm output is unchanged and total family income increases'),
      ],
      practice: [
        mcq('mcq', 'Compare output share with employment share.', [
          ['Which sector produces the largest share of India\'s GDP today?', 'Tertiary', ['Primary', 'Secondary', 'All three equally'], 'IT, trade, transport, banking.', 'Services contribute more than half of India\'s GDP.'],
          ['Which sector still employs the largest share of India\'s workers?', 'Primary', ['Tertiary', 'Secondary', 'Organised'], 'Think of villages.', 'Agriculture and allied activities still employ the largest group of workers.'],
          ['Disguised unemployment means…', 'More people working than needed, so removing some does not reduce output', ['People with no work at all', 'People working only at night', 'People working abroad'], 'They appear to be working.', 'The extra workers add nothing to output.'],
          ['Which is a reason for the growth of the service sector?', 'Rising incomes increase demand for services like tourism and private schools', ['Fewer people need transport', 'Farming no longer needs banks', 'Factories have closed'], 'What do people spend extra income on?', 'As incomes rise, demand for many services grows.'],
          ['MGNREGA guarantees up to how many days of work a year per rural household?', '100 days', ['50 days', '200 days', '365 days'], 'A round number.', 'The Act guarantees up to 100 days of wage employment.'],
          ['In which year was MGNREGA (originally NREGA) passed?', '2005', ['1991', '1947', '2013'], 'Mid-2000s.', 'The National Rural Employment Guarantee Act was passed in 2005.'],
        ]),
        tp('disg', (r) => {
          const need = r.int(2, 5), have = need + r.int(1, 4);
          return numQ(`A family of ${have} members works on a small farm that needs only ${need} workers. How many members are disguisedly unemployed?`, have - need, ['Who could leave without reducing output?', `${have} − ${need}`], [`${have} − ${need} = ${have - need} members`, 'They appear busy, but output would not fall if they left.'], [{ when: String(have), explain: 'Not everyone — only the members beyond what the farm needs.' }]);
        }),
        tapT('tap', 'Tap every TRUE statement about India\'s sectors.', [
          ['Services contribute more than half of GDP', true], ['Agriculture employs the largest share of workers', true], ['Disguised unemployment is common in agriculture', true], ['Output per worker is lowest in the primary sector', true],
          ['Agriculture produces the largest share of GDP', false], ['Most workers are in IT companies', false], ['Employment has shifted to services as fast as output', false],
        ], ['Output shifted to services; employment did not shift as fast.', 'Compare the two bar graphs.'], 'Services lead in output, agriculture in employment, and output per farm worker is low.'),
      ],
    },
    {
      id: 'ts10.ss.prod.organised', title: 'Organised and unorganised employment', prereqs: ['ts10.ss.prod.change'],
      intro: [
        h('Two workers, two very different lives'),
        photo('🧱', 'A construction labourer paid daily wages in cash, with no leave or safety rules, works in the unorganised sector.'),
        p('Kavya is a clerk in a government office: fixed hours, a monthly salary, paid leave, provident fund and a pension. Ramesh carries bricks at a building site in Hyderabad: he is paid by the day, gets no pay when it rains or when he is sick, and can be sent away without notice. Both work hard. The difference is that Kavya works in the organised sector and Ramesh in the unorganised sector.'),
        def('Organised sector', 'Enterprises registered with the government that follow rules and laws on wages, working hours, leave, safety and social security. Jobs are regular and secure.'),
        def('Unorganised sector', 'Small, scattered units, largely outside government control. Rules exist but are often not followed; jobs are low-paid, irregular and without paid leave, provident fund or job security.'),
        p('A very large majority of India\'s workers — often estimated at around 90% — are in the unorganised sector: small farmers, agricultural labourers, street vendors, domestic workers, construction workers, home-based workers such as beedi rollers and weavers.'),
        h('Protecting unorganised workers'),
        stepsB(
          'Fix and enforce minimum wages for all workers.',
          'Provide social security: health insurance, pensions, accident cover.',
          'Give small farmers cheap credit, seeds, irrigation and fair prices.',
          'Register workers (e.g. on national portals for unorganised workers) so they can reach welfare schemes.',
          'Help small producers with credit and markets so they can grow.',
        ),
        keys('Organised: registered, follows labour laws, secure jobs with benefits.', 'Unorganised: small units, irregular low-paid work, little protection.', 'Most Indian workers are in the unorganised sector.', 'They need minimum wages, social security and support for small producers.'),
        remember('Benefits in organised jobs: fixed hours, paid leave, overtime pay, provident fund, medical benefits, pension, safety rules.'),
        tip('Test question: "Can the worker be sent away without notice?" If yes, it is probably unorganised.'),
      ],
      examples: [
        ex('Classify: (a) a nurse in a government hospital, (b) a vegetable vendor on a footpath, (c) a worker in a registered car factory, (d) a domestic help. Explain.', ['(a) Organised — regular salary, leave and benefits.', '(b) Unorganised — self-employed, no protection.', '(c) Organised — registered unit following labour laws.', '(d) Unorganised — informal, often no fixed wage or leave.'], '(a) and (c) organised; (b) and (d) unorganised'),
        ex('Why do workers in the unorganised sector need protection? Give two reasons.', ['Their jobs are irregular and they can be dismissed any time, so incomes are uncertain.', 'They get no paid leave, medical benefits or pension, so illness or old age can push families into poverty.', 'Many are from poor and marginalised groups who have little bargaining power.'], 'Insecure jobs and no social security make them vulnerable'),
      ],
      practice: [
        tapT('tap', 'Tap every feature of ORGANISED sector jobs.', [
          ['Paid leave', true], ['Provident fund', true], ['Fixed working hours', true], ['Medical benefits', true], ['Registered with the government', true],
          ['Can be dismissed without notice', false], ['Daily cash wages with no records', false], ['No pay on sick days', false],
        ], ['Think of a government office job.', 'Insecurity belongs to the unorganised sector.'], 'Organised jobs are registered and give leave, benefits and security.'),
        matchT('match', 'worker to their sector', [
          ['Bank officer', 'Organised'], ['Railway employee', 'Organised'], ['Teacher in a government school', 'Organised'], ['Street vendor', 'Unorganised'],
          ['Daily-wage construction worker', 'Unorganised'], ['Beedi roller working at home', 'Unorganised'], ['Agricultural labourer', 'Unorganised'],
        ], ['Does the worker get paid leave and a pension?', 'Home-based and daily-wage work is mostly unorganised.']),
        mcq('mcq', 'Organised = registered and protected.', [
          ['Roughly what share of Indian workers are in the unorganised sector?', 'About 90%', ['About 10%', 'About 50%', 'About 25%'], 'A very large majority.', 'Around nine in ten workers are in the unorganised sector.'],
          ['Which is a typical problem of unorganised sector workers?', 'No job security and no paid leave', ['Too many holidays', 'High fixed salaries', 'Compulsory pension'], 'Think of a daily-wage labourer.', 'Unorganised work is irregular and unprotected.'],
          ['An enterprise registered with the government and following labour laws is in the…', 'Organised sector', ['Unorganised sector', 'Primary sector', 'Informal sector'], 'Registered = organised.', 'Registration and following rules are the mark of the organised sector.'],
          ['Which step would best protect unorganised workers?', 'Enforcing minimum wages and providing social security', ['Closing small businesses', 'Banning daily wages', 'Reducing schools'], 'What do they lack?', 'Minimum wages and social security give them basic protection.'],
          ['A small farmer in the unorganised sector most needs…', 'Cheap credit, seeds, irrigation and fair prices', ['A provident fund from a factory', 'Overtime pay', 'Air-conditioned offices'], 'Think of farm inputs and markets.', 'Support with inputs and markets helps small farmers earn a stable income.'],
          ['Which job is in the organised sector?', 'Clerk in a registered company with PF and leave', ['Domestic help paid in cash', 'Rickshaw puller', 'Seasonal farm labourer'], 'Look for benefits.', 'PF and paid leave show organised employment.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Climate of India
// =====================================================================================
/** [place, height in metres] for lapse-rate questions (heights rounded) */
const c4Hills: [string, number][] = [
  ['Ooty (Udhagamandalam)', 2200], ['Shimla', 2200], ['Darjeeling', 2000], ['Kodaikanal', 2100], ['Munnar', 1500], ['Mahabaleshwar', 1350],
  ['Mount Abu', 1200], ['Ananthagiri hills (Vikarabad)', 700], ['Araku valley', 900], ['Nainital', 2000],
];

const ch4: USpec = {
  id: 'ts10.ss.ch4', subject: 'social', title: 'Climate of India', source: src(4),
  objectives: [
    {
      id: 'ts10.ss.climate.weather-factors', title: 'Weather, climate and the factors that shape climate', prereqs: [],
      intro: [
        h('Today\'s weather is not the same as Telangana\'s climate'),
        photo('🌤️', 'A cloudy morning in Hyderabad is "weather". "Hot summers, a rainy June–September and mild winters" is Telangana\'s climate.'),
        p('In May your mother may say, "It is 44 °C today, stay indoors." That is weather — the condition of the air on one day at one place. But when your textbook says "Telangana has a hot, semi-arid tropical climate", it is describing the average pattern over many years. Weather changes by the hour; climate is what you expect over a lifetime.'),
        def('Weather', 'The state of the atmosphere — temperature, rainfall, humidity, wind, cloud — at a particular place and time.'),
        def('Climate', 'The average weather conditions of a large area over a long period, usually 30 years or more.'),
        h('Why is Shimla cool and Chennai warm?'),
        p('Many factors together decide the climate of a place. Learn them with the word LADWOR: Latitude, Altitude, Distance from the sea, Winds, Ocean currents and Relief.'),
        def('Latitude', 'Places near the Equator receive more direct sunlight and are hotter. South India is closer to the Equator than Kashmir, so it is warmer all year.'),
        def('Altitude', 'Temperature falls by about 6.5 °C for every 1,000 m (1 km) of height. This is the normal lapse rate. That is why hill stations are cool.'),
        def('Continentality', 'Places far from the sea have very hot summers and very cold winters (an extreme climate). Coastal places like Mumbai have a moderate (equable) climate because the sea heats and cools slowly.'),
        def('Relief', 'Mountains block or lift winds. The Western Ghats force moist winds up so the windward side gets heavy rain while the leeward side (much of the Deccan) stays dry — a rain-shadow area.'),
        def('Jet streams', 'Fast narrow belts of wind high in the atmosphere (about 12 km up). Their shifting position influences the arrival of the monsoon and winter rain in north India.'),
        f('Temperature at height = temperature at sea level − 6.5 × height (km)', 'temperature drops six point five degrees for every kilometre of height'),
        xp({
          title: 'What if? Climb a hill', formula: 'T = T₀ − 6.5 × H',
          res: ['T', 'Temperature at the hill top', '°C', 'T0 - 6.5 * H', 1],
          vars: [['T0', 'Temperature at sea level', '°C', 15, 45, 0.5, 35], ['H', 'Height above sea level', 'km', 0, 3, 0.1, 2]],
          notes: [
            ['T0', 'The whole column of air starts warmer, so the hill top is warmer by the same amount.', 'A cooler day at sea level makes the hill top equally cooler.'],
            ['H', 'Every extra kilometre of height takes away about 6.5 °C, because air higher up is thinner and holds less heat.', 'Coming down, the air gets thicker and warmer — about 6.5 °C for every kilometre.'],
          ],
          mistakes: [
            ['Using 6.5 °C per 100 m', 'The normal lapse rate is 6.5 °C per 1,000 m (1 km). Per 100 m it is only 0.65 °C.'],
            ['Thinking hill tops are warmer because they are closer to the sun', 'A few km is nothing compared with 150 million km to the sun. The air is heated from the ground, and thinner air higher up holds less heat.'],
          ],
          real: 'When Chennai (at sea level) swelters at 38 °C, Ooty at about 2.2 km is roughly 38 − 14 = 24 °C — which is why it became a summer retreat.',
        }),
        keys('Weather = short-term; climate = long-term average.', 'Factors: latitude, altitude, distance from sea, winds, ocean currents, relief.', 'Normal lapse rate: about 6.5 °C per km.', 'Coasts are equable; interiors (like much of Telangana) have extremes.'),
        remember('The normal lapse rate is 6.5 °C per 1,000 m. India has a "tropical monsoon" type of climate.'),
        tip('LADWOR: Latitude, Altitude, Distance from sea, Winds, Ocean currents, Relief.'),
      ],
      examples: [
        ex('Hyderabad (about 500 m high) and Visakhapatnam (on the coast) are at similar latitudes. Why does Hyderabad have a larger difference between summer and winter temperatures?', ['Both are at similar latitudes, so latitude is not the reason.', 'Visakhapatnam is next to the sea; water heats and cools slowly, keeping the coast moderate.', 'Hyderabad is far inland (continentality), so it heats up fast in summer and cools more in winter.'], 'Distance from the sea: Hyderabad has a more continental (extreme) climate'),
        ex('The sea-level temperature near Kodaikanal is 32 °C. Kodaikanal is about 2.1 km high. Estimate its temperature.', ['Fall in temperature = 6.5 × 2.1 = 13.65 °C', 'Temperature at top = 32 − 13.65 = 18.35 °C'], 'About 18 °C'),
      ],
      practice: [
        tp('lapse', (r) => {
          const [place, m] = r.pick(c4Hills);
          const t0 = r.pick([28, 30, 32, 34, 36, 38, 40]);
          const km = m / 1000;
          const ans = rd(t0 - 6.5 * km, 2);
          return numQ(`On a summer day it is ${t0} °C at sea level nearby. ${place} is about ${m} m high. Using the normal lapse rate (6.5 °C per km), estimate the temperature at ${place} in °C.`, ans,
            ['Convert metres to km: divide by 1,000.', `Fall = 6.5 × ${km}. Subtract it from ${t0}.`],
            [`Height = ${m} m = ${km} km`, `Fall in temperature = 6.5 × ${km} = ${rd(6.5 * km, 2)} °C`, `Temperature = ${t0} − ${rd(6.5 * km, 2)} = ${ans} °C`],
            [{ when: String(rd(t0 - 0.65 * km, 2)), explain: 'You used 0.65 °C per km. The lapse rate is 6.5 °C per km.' }, { when: String(rd(t0 + 6.5 * km, 2)), explain: 'Temperature FALLS as you go up — subtract, do not add.' }], 0.01);
        }, 2),
        mcq('concept', 'Separate one-day conditions (weather) from long-term patterns (climate), then think LADWOR.', [
          ['"It rained 40 mm in Warangal yesterday." This describes…', 'Weather', ['Climate', 'Relief', 'Latitude'], 'Is it one day or 30 years?', 'A single day\'s rainfall at one place is weather.'],
          ['Why is Mumbai\'s climate more moderate than Delhi\'s?', 'Mumbai is on the coast; the sea moderates temperature', ['Mumbai is at a higher altitude', 'Mumbai is farther north', 'Mumbai has no monsoon'], 'Think of distance from the sea.', 'Sea water heats and cools slowly, so coastal places have an equable climate.'],
          ['The leeward side of the Western Ghats gets little rain because it lies in a…', 'Rain-shadow area', ['Monsoon trough', 'Jet stream', 'Delta'], 'The winds have already dropped their moisture.', 'Winds lose moisture on the windward slope and descend dry on the leeward side.'],
          ['Hill stations are cool mainly because of…', 'Altitude', ['Latitude', 'Ocean currents', 'Continentality'], 'Height above sea level.', 'Temperature falls about 6.5 °C for every km of height.'],
          ['Fast-moving narrow air currents in the upper atmosphere are called…', 'Jet streams', ['Trade winds', 'Loo', 'Cyclones'], 'They blow about 12 km up.', 'Jet streams are high-level winds that affect the monsoon and western disturbances.'],
          ['Which of these describes climate?', 'Telangana gets most of its rain from June to September', ['It is cloudy in Nalgonda this morning', 'A hailstorm hit Siddipet today', 'The wind is strong right now'], 'Look for a long-term pattern.', 'A seasonal pattern repeated every year is climate.'],
        ]),
        matchT('factors', 'climate factor to its effect', [
          ['Latitude', 'Places nearer the Equator are hotter'], ['Altitude', 'About 6.5 °C cooler per km of height'], ['Distance from sea', 'Interior places have extreme temperatures'],
          ['Relief', 'Mountains create rain-shadow areas'], ['Jet streams', 'High-level winds that steer weather systems'], ['Ocean currents', 'Warm or cold water changes coastal temperatures'],
        ], ['Start with altitude and latitude.', 'Relief means the shape of the land — mountains.']),
      ],
    },
    {
      id: 'ts10.ss.climate.monsoon', title: 'The monsoon and India\'s four seasons', prereqs: ['ts10.ss.climate.weather-factors'],
      intro: [
        h('The wind that feeds a billion people'),
        photo('🌧️', 'The first monsoon showers in June bring relief from the heat and signal the start of the kharif sowing season.'),
        p('Every farmer in Telangana watches the sky in June. When the monsoon arrives, paddy nurseries are prepared, cotton is sown, and tanks start filling. About three-quarters of India\'s yearly rain falls in just four months — June to September. Understanding the monsoon is understanding Indian farming.'),
        def('Monsoon', 'A seasonal reversal of wind direction. In summer, moist winds blow from the sea to the land (south-west monsoon); in winter, dry winds blow from the land to the sea (north-east monsoon).'),
        h('How the south-west monsoon works'),
        stepsB(
          'In summer the land, especially north-west India, heats up much faster than the Indian Ocean.',
          'Hot air over the land rises, creating a large low-pressure area.',
          'Air over the cooler ocean is at higher pressure; it moves towards the land.',
          'Crossing the Equator, these south-east trade winds turn and blow from the south-west, picking up moisture over the ocean.',
          'They strike the Western Ghats and the north-east hills, rise, cool and drop heavy rain. Onset over Kerala is usually around 1 June.',
          'By mid-July the monsoon covers almost all of India; from September it starts withdrawing as the land cools.',
        ),
        h('Four seasons'),
        def('Cold weather season (December–February)', 'Clear skies, low temperatures in the north; some winter rain in Punjab–Haryana from western disturbances.'),
        def('Hot weather season (March–May)', 'Temperatures rise; hot dry wind called "loo" blows over north India; pre-monsoon showers such as mango showers in Kerala and Karnataka.'),
        def('South-west monsoon season (June–September)', 'Most of India gets its main rainfall; breaks in the monsoon can cause dry spells.'),
        def('Retreating monsoon (October–November)', 'Winds reverse; the Tamil Nadu coast gets rain from the north-east monsoon; cyclones form in the Bay of Bengal.'),
        bars(['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'], [10, 15, 30, 170, 165, 25], 'mm', 'Illustrative monthly rainfall for a place on the Deccan like Hyderabad: very little in winter and summer, most in July–September.'),
        p('Rain is uneven: Mawsynram in Meghalaya is among the wettest places on Earth, while western Rajasthan gets very little. Much of Telangana is semi-arid, so a weak or late monsoon quickly causes drought.'),
        keys('Monsoon = seasonal reversal of winds.', 'Differential heating of land and sea drives it.', 'Four seasons: cold, hot, SW monsoon, retreating monsoon.', 'Rainfall is seasonal, uneven and uncertain.'),
        remember('Onset over Kerala ≈ 1 June. Tamil Nadu gets much of its rain in October–November from the north-east (retreating) monsoon.'),
        tip('Land heats fast, sea heats slow → low pressure on land → sea wind blows in with rain.'),
      ],
      examples: [
        ex('Why does Chennai get heavy rain in November when most of India is dry?', ['In October–November the winds reverse and blow from the north-east, from land towards sea.', 'Crossing the Bay of Bengal, they pick up moisture.', 'They hit the Tamil Nadu (Coromandel) coast and bring rain; cyclones from the Bay add more.'], 'The retreating / north-east monsoon brings rain to the Tamil Nadu coast'),
        ex('A Telangana farmer delays sowing cotton because the monsoon is two weeks late. Explain the link.', ['Most of Telangana\'s crops are rain-fed.', 'Seeds need moist soil to germinate.', 'A late monsoon means dry soil, so sowing must wait or the seed may fail.'], 'Kharif sowing depends on the arrival of the south-west monsoon'),
      ],
      practice: [
        orderT('mechanism', 'Arrange the steps that produce the south-west monsoon.', [
          'Land heats faster than the ocean in summer', 'A low-pressure area forms over north-west India', 'Moist winds move from the high-pressure ocean towards the land',
          'Winds cross the Equator and blow from the south-west', 'Winds rise over the Western Ghats and shed heavy rain',
        ], ['Everything starts with unequal heating.', 'Rain comes last, when the winds are forced up.'], 'Heating → low pressure → winds move in → deflected to south-west → rain on hills.'),
        mcq('seasons', 'Match the months to the season first.', [
          ['The hot, dry wind that blows over north India in May–June is called…', 'Loo', ['Mango shower', 'Kalbaisakhi', 'Western disturbance'], 'It is hot and dusty.', 'The loo is a hot dry wind of the hot-weather season.'],
          ['Pre-monsoon showers that help mangoes ripen in Kerala and Karnataka are called…', 'Mango showers', ['Loo', 'Retreating monsoon', 'Jet streams'], 'The name is in the fruit.', 'Mango showers fall in April–May just before the monsoon.'],
          ['Which months make up the south-west monsoon season?', 'June to September', ['December to February', 'March to May', 'October to November'], 'Telangana\'s main rains.', 'The SW monsoon brings most of India\'s rain in June–September.'],
          ['The monsoon usually reaches Kerala around…', '1 June', ['15 March', '1 September', '25 December'], 'It is the start of the rainy season.', 'Normal onset over Kerala is about 1 June.'],
          ['Winter rain in Punjab and Haryana comes from…', 'Western disturbances', ['The south-west monsoon', 'Mango showers', 'The loo'], 'They come from the Mediterranean side.', 'Western disturbances bring winter rain that helps the rabi wheat crop.'],
          ['Tamil Nadu receives much of its rain during…', 'October–November (north-east monsoon)', ['June–July', 'March–April', 'January–February'], 'It is on the east coast.', 'The retreating / NE monsoon brings rain to the Coromandel coast.'],
        ]),
        tapT('tap', 'Tap every TRUE statement about India\'s monsoon rainfall.', [
          ['It is seasonal — most rain falls in four months', true], ['It is unevenly spread across the country', true], ['It can arrive late or break for weeks', true], ['It is caused by unequal heating of land and sea', true],
          ['It falls evenly every month of the year', false], ['It comes mainly from winds blowing off the Himalayas', false], ['Rajasthan gets more rain than Meghalaya', false],
        ], ['Think: seasonal, uneven, uncertain.', 'Mawsynram in Meghalaya is one of the wettest places on Earth.'], 'Monsoon rain is seasonal, uneven and uncertain, driven by differential heating.'),
      ],
    },
    {
      id: 'ts10.ss.climate.change', title: 'Global warming, climate change and their impact on India', prereqs: ['ts10.ss.climate.monsoon'],
      intro: [
        h('Why do older people say summers were cooler when they were young?'),
        photo('☀️', 'Heat waves in April–May are becoming longer and more frequent in many parts of India, including Telangana.'),
        p('Ask your grandparents about summers in Hyderabad. Many will say the heat now feels harsher. Scientists measure this carefully: the average temperature of the Earth has risen by more than 1 °C since the late 1800s. This long-term rise is called global warming, and the changes it brings to rainfall, storms and seasons are called climate change.'),
        def('Greenhouse effect', 'Gases such as carbon dioxide, methane and water vapour trap some of the heat given off by the Earth, keeping it warm enough for life — like the glass of a greenhouse.'),
        def('Global warming', 'The rise in the Earth\'s average temperature caused mainly by extra greenhouse gases released by human activities.'),
        h('How humans are adding to the problem'),
        stepsB(
          'We burn coal, petrol, diesel and gas for electricity, factories and vehicles, releasing carbon dioxide.',
          'Forests that absorb carbon dioxide are cut down.',
          'Rice fields, cattle and landfills release methane.',
          'Greenhouse gases build up and trap more heat.',
          'The average temperature rises, changing rainfall patterns, melting ice and raising sea levels.',
        ),
        h('What it means for India'),
        p('India is especially sensitive because so many people depend on rain-fed farming and live along long coastlines. Expected or already-observed effects include: more intense heat waves; more erratic monsoon rain with heavy downpours and longer dry spells; melting Himalayan glaciers that feed the Ganga and Indus; rising sea levels threatening low coasts and islands; and stronger cyclones.'),
        p('Countries are working together through agreements such as the Kyoto Protocol (1997) and the Paris Agreement (2015), which aim to keep warming well below 2 °C. Every household can help too: saving electricity, using public transport, planting trees and reducing waste.'),
        keys('The greenhouse effect is natural; extra greenhouse gases cause global warming.', 'Main human causes: burning fossil fuels, deforestation, methane emissions.', 'Impacts on India: heat waves, erratic monsoon, glacier melt, sea-level rise.', 'Responses: international agreements plus local actions.'),
        remember('Main greenhouse gases: carbon dioxide (CO₂), methane (CH₄), nitrous oxide and water vapour. Paris Agreement: 2015.'),
        tip('Natural greenhouse effect = a blanket that keeps us alive. Global warming = adding too many blankets.'),
      ],
      examples: [
        ex('Explain how melting Himalayan glaciers could affect farmers in the Ganga plain.', ['Glaciers feed the Ganga with melt-water in the dry summer.', 'Faster melting first increases floods.', 'As glaciers shrink, summer flow may fall, reducing irrigation water.'], 'First more floods, later less summer water for irrigation'),
        ex('Classify each as a cause or an effect of global warming: (a) burning coal in power plants, (b) rising sea level, (c) cutting forests, (d) stronger heat waves.', ['Causes add greenhouse gases or remove carbon sinks: (a), (c).', 'Effects are the results of a warmer Earth: (b), (d).'], 'Causes: a, c. Effects: b, d'),
      ],
      practice: [
        tapT('causes', 'Tap every human activity that ADDS to global warming.', [
          ['Burning coal to make electricity', true], ['Clearing forests', true], ['Driving petrol and diesel vehicles', true], ['Methane from landfills', true],
          ['Planting trees', false], ['Using solar panels', false], ['Walking or cycling to school', false],
        ], ['Does the activity release greenhouse gases or remove trees?', 'Trees absorb CO₂, so planting them helps.'], 'Fossil-fuel burning, deforestation and methane sources add to warming; trees and clean energy reduce it.'),
        mcq('impact', 'Think about rain, ice, sea and heat.', [
          ['Which gas is the largest contributor to human-caused global warming?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Helium'], 'It comes from burning fuels.', 'CO₂ from burning fossil fuels is the main greenhouse gas added by humans.'],
          ['A likely impact of global warming on India\'s coasts is…', 'Rising sea level flooding low-lying areas', ['Coasts becoming colder', 'More coral islands forming quickly', 'The sea retreating far away'], 'Warm water expands and ice melts.', 'Thermal expansion and melting ice raise sea levels.'],
          ['Why does India\'s farming suffer when the monsoon becomes erratic?', 'Much farming is rain-fed and depends on timely rain', ['Crops grow only in winter', 'India has no rivers', 'Farmers use only groundwater'], 'Telangana\'s cotton is sown with the first rains.', 'Rain-fed crops fail if rain is late, too heavy or stops for weeks.'],
          ['The natural greenhouse effect is…', 'Necessary to keep the Earth warm enough for life', ['Harmful in every way', 'Caused only by factories', 'The same as the ozone hole'], 'Without it the Earth would be frozen.', 'Natural greenhouse gases keep the Earth about 33 °C warmer than it would otherwise be.'],
          ['The international climate agreement signed in 2015 is the…', 'Paris Agreement', ['Kyoto Protocol', 'Treaty of Versailles', 'Simla Agreement'], 'Named after a European capital.', 'The Paris Agreement (2015) aims to keep warming well below 2 °C.'],
          ['Which is an example of climate change rather than weather?', 'More frequent heat waves over several decades', ['A hot afternoon today', 'A thunderstorm last night', 'Fog this morning'], 'Look for a long-term trend.', 'Climate change is a long-term shift in average conditions.'],
        ]),
        orderT('chain', 'Arrange this cause-and-effect chain of global warming.', [
          'Fossil fuels are burned', 'Carbon dioxide builds up in the atmosphere', 'More heat is trapped near the Earth', 'Average temperature rises', 'Glaciers melt and sea level rises',
        ], ['Start with the human activity.', 'Melting ice is a consequence of a warmer Earth.'], 'Burning → more CO₂ → more heat trapped → warmer Earth → melting ice and rising seas.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Indian Rivers and Water Resources
// =====================================================================================
const ch5: USpec = {
  id: 'ts10.ss.ch5', subject: 'social', title: 'Indian Rivers and Water Resources', source: src(5),
  objectives: [
    {
      id: 'ts10.ss.rivers.systems', title: 'Himalayan and Peninsular river systems', prereqs: [],
      intro: [
        h('Two kinds of rivers: snow-fed and rain-fed'),
        photo('🏞️', 'The Godavari at Bhadrachalam flows full in the monsoon but shrinks in summer — a typical rain-fed peninsular river.'),
        p('Stand on the Godavari bridge at Bhadrachalam in August and you see a wide, brown, rushing river. Come back in May and much of the bed is sand. Now think of the Ganga at Varanasi, which flows strongly even in May. Why the difference? The Ganga is fed by Himalayan snow; the Godavari depends on rain.'),
        def('Drainage basin', 'The whole area drained by a river and its tributaries.'),
        def('Water divide', 'High land, like a ridge, that separates two drainage basins.'),
        def('Perennial river', 'A river that flows throughout the year.'),
        h('Himalayan rivers'),
        p('The Indus, Ganga and Brahmaputra systems rise in the Himalayas. They are fed by both rain and melting snow and glaciers, so they are perennial. They are long, carry huge amounts of silt, and in the plains they wander in loops (meanders) and build large deltas — the Ganga–Brahmaputra delta (the Sundarbans) is the largest in the world.'),
        def('Indus', 'Rises in Tibet near Lake Mansarovar; flows through Ladakh into Pakistan; tributaries Jhelum, Chenab, Ravi, Beas and Sutlej.'),
        def('Ganga', 'Begins as the Bhagirathi from the Gangotri glacier; joins the Alaknanda at Devprayag. Main tributaries include the Yamuna, Ghaghara, Gandak, Kosi and Son.'),
        def('Brahmaputra', 'Rises in Tibet (where it is called the Tsangpo), enters India in Arunachal Pradesh and flows through Assam into Bangladesh.'),
        h('Peninsular rivers'),
        p('These rivers rise on the plateau, mostly in the Western Ghats. They depend only on rain, so many shrink in summer. They flow in fixed, shallow valleys over hard rock. Most flow east into the Bay of Bengal and form deltas: the Mahanadi, Godavari, Krishna and Kaveri. The Narmada and Tapi flow west through rift valleys and form estuaries.'),
        def('Godavari', 'The largest peninsular river (about 1,465 km), often called the "Dakshin Ganga". Rises at Trimbakeshwar near Nashik in Maharashtra and flows through Telangana and Andhra Pradesh.'),
        def('Krishna', 'Rises near Mahabaleshwar in Maharashtra; tributaries include the Bhima and Tungabhadra; flows along southern Telangana.'),
        bars(['Ganga', 'Godavari', 'Krishna', 'Narmada', 'Kaveri'], [2525, 1465, 1400, 1312, 800], 'km', 'Approximate river lengths in km (rounded; different sources give slightly different values).'),
        keys('Himalayan rivers: snow + rain fed, perennial, long, meandering, big deltas.', 'Peninsular rivers: rain-fed, seasonal, shorter, fixed courses.', 'Most peninsular rivers flow east; Narmada and Tapi flow west.', 'Godavari is the largest peninsular river.'),
        remember('Ganga source: Gangotri glacier (as Bhagirathi). Godavari source: Trimbakeshwar (Nashik). Krishna source: near Mahabaleshwar. Narmada source: Amarkantak.'),
        tip('Snow-fed → flows all year. Rain-fed → full in monsoon, thin in summer.'),
      ],
      examples: [
        ex('Give two reasons why the Ganga is perennial but the Krishna is not.', ['The Ganga gets water from melting Himalayan snow and glaciers in summer plus monsoon rain.', 'The Krishna rises on the plateau with no snow, so it depends only on monsoon rain.', 'When rain stops, the Krishna\'s flow falls sharply.'], 'Snow-fed versus rain-fed'),
        ex('Why do the Narmada and Tapi form estuaries instead of deltas?', ['They flow west through narrow rift valleys with steep slopes.', 'They carry less silt and flow fast into the sea.', 'The sea currents carry away what silt they bring.'], 'Fast flow through rift valleys and little silt → estuaries'),
      ],
      practice: [
        matchT('origin', 'river to its source', [
          ['Ganga (Bhagirathi)', 'Gangotri glacier'], ['Godavari', 'Trimbakeshwar, Nashik'], ['Krishna', 'Near Mahabaleshwar'], ['Narmada', 'Amarkantak'],
          ['Brahmaputra', 'Tibet (as the Tsangpo)'], ['Indus', 'Tibet, near Lake Mansarovar'], ['Kaveri', 'Brahmagiri hills (Talakaveri), Karnataka'],
        ], ['Peninsular rivers rise on the plateau; Himalayan rivers in the mountains or Tibet.', 'Godavari and Krishna both start in Maharashtra.']),
        mcq('compare', 'Ask: snow-fed or rain-fed? east-flowing or west-flowing?', [
          ['Which is the largest river of peninsular India?', 'Godavari', ['Krishna', 'Kaveri', 'Mahanadi'], 'Called Dakshin Ganga.', 'The Godavari, about 1,465 km, is the longest peninsular river.'],
          ['Which of these is a west-flowing river?', 'Narmada', ['Godavari', 'Krishna', 'Mahanadi'], 'It flows through a rift valley into the Arabian Sea.', 'The Narmada and Tapi flow west and form estuaries.'],
          ['Himalayan rivers are perennial because they are fed by…', 'Rain and melting snow', ['Only rain', 'Only groundwater', 'Sea water'], 'Think of glaciers.', 'Melt-water keeps them flowing in summer.'],
          ['High ground separating two river basins is called a…', 'Water divide', ['Delta', 'Meander', 'Tributary'], 'It divides the water flow.', 'A water divide separates the drainage of two basins.'],
          ['The Bhagirathi and Alaknanda join at Devprayag to form the…', 'Ganga', ['Yamuna', 'Godavari', 'Brahmaputra'], 'It is India\'s most sacred river.', 'Below Devprayag the river is called the Ganga.'],
          ['Peninsular rivers mostly have…', 'Fixed, shallow valleys and seasonal flow', ['Many meanders and year-round flow', 'Glacier sources', 'No tributaries'], 'Hard rock, rain-fed.', 'Old hard rocks keep their courses fixed; rain-feeding makes flow seasonal.'],
        ]),
        tapT('himalayan', 'Tap every feature of HIMALAYAN rivers.', [
          ['Perennial flow', true], ['Fed by snow and glaciers', true], ['Form meanders in the plains', true], ['Carry a lot of silt', true],
          ['Depend only on rainfall', false], ['Rise in the Western Ghats', false], ['Mostly dry up in summer', false],
        ], ['Think of the Ganga, not the Godavari.', 'Western Ghats are the source of peninsular rivers.'], 'Himalayan rivers are perennial, snow-fed, silt-laden and meandering.'),
      ],
    },
    {
      id: 'ts10.ss.rivers.tungabhadra', title: 'Case study: sharing water in the Tungabhadra basin', prereqs: ['ts10.ss.rivers.systems'],
      intro: [
        h('One river, many users'),
        photo('💧', 'Water released from the Tungabhadra dam is shared between farms, towns and factories in more than one state.'),
        p('The Tungabhadra is formed when two rivers, the Tunga and the Bhadra, meet at Koodli in Karnataka. It flows north-east and joins the Krishna near Alampur in Telangana\'s Jogulamba Gadwal district. Its basin covers parts of Karnataka, Andhra Pradesh and Telangana — so its water must be shared.'),
        def('River basin', 'The whole area from which rainwater drains into one river and its tributaries.'),
        def('Upstream and downstream', 'Upstream users are nearer the source; downstream users are nearer the mouth. What upstream users take or pollute affects everyone downstream.'),
        h('Who uses the water?'),
        p('Farmers use the most water, especially for crops like paddy and sugarcane through canals from the Tungabhadra dam at Hosapete (Hospet). Towns need drinking water. Industries — for example steel plants and mines in the Ballari area — need water and also release waste. Each new user means less for others.'),
        stepsB(
          'Rain falls in the Western Ghats in the upper basin.',
          'Tunga and Bhadra rivers carry it down and join to form the Tungabhadra.',
          'The Tungabhadra dam stores water; canals carry it to fields on both sides.',
          'Towns and industries draw water; some of it returns as polluted waste water.',
          'Downstream users, including those in Telangana and Andhra Pradesh, receive what is left.',
        ),
        h('Problems that arise'),
        p('Silt from deforested slopes and mining fills the reservoir, so it stores less. Over-irrigation in some areas causes waterlogging and salty soils. Farmers at the tail end of canals often get too little water. Industrial waste can pollute water for people downstream. Disputes between states over sharing are settled through tribunals and agreements.'),
        keys('Tungabhadra = Tunga + Bhadra; joins the Krishna in Telangana.', 'Users: agriculture (largest), towns, industry.', 'Problems: siltation, waterlogging, pollution, unequal sharing (tail-end farmers).', 'What happens upstream affects everyone downstream.'),
        remember('Tungabhadra dam is at Hosapete (Hospet), Karnataka. The Tungabhadra is a tributary of the Krishna.'),
        tip('Upstream decisions → downstream consequences. Always ask: who is downstream?'),
      ],
      examples: [
        ex('A farmer at the end of a long canal gets water only once a week, while farmers near the dam flood their fields. Explain the problem and suggest one solution.', ['Head-end farmers take more than their share because water reaches them first.', 'Tail-end farmers get little, so their crops suffer.', 'Solution: fixed rotation of water (turns), water-user associations, and switching head-end fields to less thirsty crops or drip irrigation.'], 'Unequal distribution along the canal; fix with fair rotation and efficient irrigation'),
        ex('How can mining in the upper Tungabhadra basin reduce water available to farmers far downstream?', ['Mining removes vegetation and loosens soil.', 'Rain washes the soil into the river as silt.', 'Silt settles in the reservoir and reduces its storage capacity.', 'Less stored water means less for canals downstream.'], 'Mining → erosion → siltation → smaller reservoir → less water'),
      ],
      practice: [
        orderT('flow', 'Arrange the journey of water through the Tungabhadra basin.', [
          'Monsoon rain falls in the Western Ghats', 'Tunga and Bhadra rivers join at Koodli', 'Water is stored in the Tungabhadra dam at Hosapete', 'Canals carry water to fields and towns', 'The river joins the Krishna near Alampur',
        ], ['Start with rain at the source.', 'The confluence with the Krishna is the end.'], 'Rain → Tunga + Bhadra join → dam → canals → joins the Krishna.'),
        mcq('basin', 'Think of the river as one shared resource.', [
          ['The Tungabhadra is a tributary of the…', 'Krishna', ['Godavari', 'Kaveri', 'Narmada'], 'It joins near Alampur.', 'The Tungabhadra joins the Krishna in Telangana.'],
          ['Which sector uses the most water in the Tungabhadra basin?', 'Agriculture', ['Industry', 'Households', 'Tourism'], 'Paddy and sugarcane need a lot.', 'Irrigation takes the largest share of river water in India.'],
          ['Waterlogging and salty soil in canal areas are mainly caused by…', 'Over-irrigation', ['Too little rain', 'Coral growth', 'Deforestation in Tibet'], 'Too much water on the field.', 'Excess irrigation raises the water table and brings salts up.'],
          ['Siltation of a reservoir means…', 'Soil settles at the bottom and reduces storage', ['Water becomes salty', 'Fish multiply', 'The dam becomes taller'], 'Silt is fine soil.', 'Silt fills the reservoir so it holds less water.'],
          ['A tail-end farmer is one who…', 'Is at the far end of a canal and often gets less water', ['Lives near the dam', 'Owns a factory', 'Grows only vegetables'], 'Think of the end of the canal.', 'Water is used up before it reaches the tail end.'],
          ['Why is river water a matter for more than one state?', 'A river basin often crosses state boundaries', ['Each state owns separate rain', 'Rivers flow only in one state', 'The Centre makes all rain'], 'Look at the Tungabhadra map.', 'The basin spreads across Karnataka, Andhra Pradesh and Telangana.'],
        ]),
        tapT('problems', 'Tap every problem seen in the Tungabhadra basin.', [
          ['Siltation of the reservoir', true], ['Waterlogging and salinity', true], ['Industrial pollution', true], ['Unequal sharing between head and tail ends', true],
          ['Glacier melt flooding', false], ['Coral bleaching', false], ['Sand dunes covering the dam', false],
        ], ['This is a rain-fed plateau river.', 'Glaciers and coral are not part of this basin.'], 'Siltation, waterlogging, pollution and unequal sharing are the key problems.'),
      ],
    },
    {
      id: 'ts10.ss.rivers.commons', title: 'Water as a common pool resource: fair and sustainable use', prereqs: ['ts10.ss.rivers.tungabhadra'],
      intro: [
        h('Whose water is it?'),
        photo('🪣', 'In many Telangana villages, the tank and the community well were looked after together for centuries.'),
        p('The groundwater under your village does not belong to the person who drills the deepest borewell — but if one farmer pumps day and night, his neighbours\' wells dry up. Rivers, tanks and groundwater are shared by everyone. Such resources need rules, or they get overused.'),
        def('Common pool resource', 'A resource that many people can use, from which it is hard to exclude anyone, and where one person\'s use reduces what is left for others — such as groundwater, a village tank or a river.'),
        def('Equitable use', 'Sharing a resource fairly, so that every user — including the poor, tail-end farmers and future generations — gets a reasonable share.'),
        p('A simple way to see the pressure on water is to divide the water available by the number of people. When population grows but water stays the same, each person\'s share shrinks. Experts often treat less than about 1,700 cubic metres per person per year as water stress.'),
        f('Water per person = total usable water ÷ population', 'water available per person equals total water divided by population'),
        xp({
          title: 'What if? More people, same water', formula: 'W = V ÷ P',
          res: ['W', 'Water available per person per year', 'm³', 'V * 1000 / P', 0],
          vars: [['V', 'Water available in the region', 'million m³', 100, 5000, 50, 1500], ['P', 'Population', 'thousand people', 100, 5000, 50, 1000]],
          notes: [
            ['V', 'More water (a wetter year, better storage, recharged groundwater) means a bigger share for everyone.', 'A drought or a silted reservoir cuts the total, so every person gets less.'],
            ['P', 'The same water is divided among more people, so each share shrinks.', 'Fewer people sharing the same water means a bigger share each.'],
          ],
          mistakes: [
            ['Thinking more people automatically means more water', 'Population does not create water; it only divides the same water into smaller shares.'],
            ['Ignoring units', 'Here V is in millions of m³ and P in thousands of people: W = V × 1,000,000 ÷ (P × 1,000) = V × 1,000 ÷ P m³ per person.'],
          ],
          real: 'Illustrative: a region with 1,500 million m³ of usable water and 10 lakh people has 1,500 m³ per person — already below the 1,700 m³ stress line.',
        }),
        h('Ways to share water fairly'),
        stepsB(
          'Measure how much water there is (rainfall, tanks, groundwater).',
          'Agree on priorities: drinking water first, then livelihoods.',
          'Fix fair shares and turns, for example through water-user associations.',
          'Use water efficiently: drip and sprinkler irrigation, less thirsty crops.',
          'Recharge: restore tanks, check dams and percolation pits (Telangana\'s Mission Kakatiya restored many old village tanks).',
        ),
        keys('Rivers, tanks and groundwater are common pool resources.', 'Without rules, each user takes more and everyone loses.', 'Water per person = water ÷ population.', 'Fair use: priorities, shares, efficiency and recharge.'),
        remember('Drinking water has the first claim. Below about 1,700 m³ per person per year is considered water stress.'),
        tip('A common resource is like a shared plate of food at a function — if everyone grabs, the last ones get nothing.'),
      ],
      examples: [
        ex('A village has 3,000 thousand m³ (3 million m³) of usable water a year and 2,000 people. How much water is there per person?', ['Water per person = total water ÷ population', '= 3,000,000 m³ ÷ 2,000', '= 1,500 m³ per person per year'], '1,500 m³ per person per year'),
        ex('Two farmers share an aquifer. Farmer A drills a deeper borewell and pumps all day. Explain what happens and why rules are needed.', ['The aquifer is a common pool: both draw from the same underground water.', 'A\'s heavy pumping lowers the water table.', 'B\'s shallower well dries up; soon A must drill deeper too.', 'Rules (limits, spacing of wells, recharge) protect everyone.'], 'Overuse by one user harms all; agreed rules are needed'),
      ],
      practice: [
        tp('perperson', (r) => {
          const pop = r.pick([2000, 2500, 4000, 5000, 8000, 10000]);
          const per = r.pick([500, 800, 1000, 1200, 1500, 2000]);
          const total = pop * per;
          return numQ(`An illustrative village has ${total.toLocaleString('en-IN')} m³ of usable water a year and ${pop.toLocaleString('en-IN')} people. How many m³ of water is available per person per year?`, per,
            ['Water per person = total water ÷ population.', `Divide ${total.toLocaleString('en-IN')} by ${pop.toLocaleString('en-IN')}.`],
            [`${total.toLocaleString('en-IN')} ÷ ${pop.toLocaleString('en-IN')} = ${per} m³ per person`, per < 1700 ? 'This is below 1,700 m³, so the village faces water stress.' : 'This is above the 1,700 m³ stress line.'],
            [{ when: String(total * pop), explain: 'You multiplied. Share per person means dividing the total by the number of people.' }], 0.001);
        }),
        mcq('commons', 'A common pool resource is shared, hard to fence off, and gets used up.', [
          ['Which of these is a common pool resource?', 'Groundwater under a village', ['A farmer\'s private tractor', 'A shopkeeper\'s stock', 'A family\'s television'], 'Can one user\'s use reduce what others get, and is it hard to keep others out?', 'Groundwater is shared; one person\'s heavy pumping reduces water for all.'],
          ['What should get the first claim on scarce water?', 'Drinking water', ['Car washing', 'Swimming pools', 'Golf courses'], 'Think of survival.', 'Drinking and basic needs come first in fair water use.'],
          ['Which method saves water on farms?', 'Drip irrigation', ['Flooding fields daily', 'Growing more sugarcane', 'Digging deeper borewells'], 'Water given drop by drop at the roots.', 'Drip irrigation delivers water directly to roots with little waste.'],
          ['Restoring village tanks helps mainly by…', 'Storing rainwater and recharging groundwater', ['Reducing rainfall', 'Increasing silt', 'Making rivers flow west'], 'Tanks hold monsoon water.', 'Desilted tanks store more water and let it seep into the ground.'],
          ['If population doubles but usable water stays the same, water per person…', 'Halves', ['Doubles', 'Stays the same', 'Becomes zero'], 'W = V ÷ P', 'The same water is divided among twice as many people.'],
          ['Equitable use of water means…', 'Fair shares for all users, including the poor and future generations', ['Whoever pumps most gets most', 'Only big farmers get water', 'Only cities get water'], 'Equitable = fair.', 'Equity means everyone gets a reasonable share.'],
        ]),
        tapT('fair', 'Tap every practice that supports FAIR and sustainable use of water.', [
          ['Water-user associations fixing turns', true], ['Recharge pits and check dams', true], ['Drip and sprinkler irrigation', true], ['Priority for drinking water', true],
          ['Unlimited borewells by whoever can pay', false], ['Dumping factory waste into rivers', false], ['Flooding fields with more water than needed', false],
        ], ['Does it share water fairly or save/recharge it?', 'Pollution and over-pumping harm others.'], 'Fair rules, efficiency and recharge support sustainable use.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — The Population
// =====================================================================================
/** Census population of India in crore (rounded, well-established Census totals) */
const c6Pop: [number, number][] = [[1951, 36.1], [1961, 43.9], [1971, 54.8], [1981, 68.3], [1991, 84.6], [2001, 102.9], [2011, 121.1]];

const ch6: USpec = {
  id: 'ts10.ss.ch6', subject: 'social', title: 'The Population', source: src(6),
  objectives: [
    {
      id: 'ts10.ss.population.census', title: 'The Census and India\'s population size and density', prereqs: [],
      intro: [
        h('Counting 121 crore people'),
        photo('📝', 'Every ten years, Census enumerators visit every house in India and record details of every person living there.'),
        p('Imagine counting every person in India — in cities, villages, forests, hills and islands — within a few weeks. That is the Census. Its numbers decide how many schools, hospitals and ration shops are needed, how many seats each state gets, and how welfare money is planned.'),
        def('Census', 'An official count of all people in a country, together with details such as age, sex, literacy, occupation and housing. In India it is held every ten years.'),
        p('India\'s first complete, synchronous Census was in 1881, and it has been held every ten years since. The 2011 Census counted about 121 crore (1,210.9 million) people — about 17.5% of the world\'s population on only about 2.4% of the world\'s land. Telangana\'s area had about 3.5 crore people in 2011.'),
        line('Census year', 'Population (crore)', c6Pop, 'India\'s population by Census: 36.1 crore (1951), 43.9 (1961), 54.8 (1971), 68.3 (1981), 84.6 (1991), 102.9 (2001), 121.1 crore (2011).'),
        def('Population density', 'The number of people living per square kilometre of land. Density = population ÷ area.'),
        p('In 2011 India\'s average density was 382 persons per km². But people are not spread evenly: the fertile Ganga plains, coasts and big cities are crowded, while deserts, high mountains and thick forests have very few people.'),
        f('Density = Population ÷ Area (persons per km²)', 'density equals population divided by area'),
        xp({
          title: 'What if? Change the people or the land', formula: 'D = P ÷ A',
          res: ['D', 'Population density', 'persons/km²', 'P * 1000 / A', 0],
          vars: [['P', 'Population', 'thousand', 100, 20000, 100, 3500], ['A', 'Area', 'km²', 500, 200000, 500, 10000]],
          notes: [
            ['P', 'More people on the same land means more people per square kilometre.', 'Fewer people on the same land means more space each — lower density.'],
            ['A', 'The same people spread over a bigger area are less crowded.', 'The same people squeezed into a smaller area are more crowded.'],
          ],
          mistakes: [
            ['Dividing area by population', 'Density is people per km², so people go on top: P ÷ A.'],
            ['Thinking high density always means poverty', 'Density only measures crowding. Rich places (like big cities) can be very dense too.'],
          ],
          real: 'Illustrative: about 35 lakh people living on 10,000 km² gives 350 persons/km² — close to India\'s 2011 average of 382.',
        }),
        keys('Census: every 10 years; first complete one in 1881.', '2011: about 121 crore people, 17.5% of the world on 2.4% of the land.', 'Density = population ÷ area; India 2011: 382 per km².', 'Plains, coasts and cities are dense; deserts, mountains and forests are sparse.'),
        remember('Census 2011: population 121.09 crore; density 382/km²; India is the most populous country in the world (it passed China around 2023).'),
        tip('Density is about crowding, not about size: a small state can be denser than a big one.'),
      ],
      examples: [
        ex('A district has a population of 25 lakh and an area of 5,000 km². Find its density.', ['Population = 25,00,000', 'Density = 25,00,000 ÷ 5,000', '= 500 persons per km²'], '500 persons per km²'),
        ex('Why is the Ganga plain much more densely populated than Arunachal Pradesh?', ['The plain is flat with fertile alluvial soil and plenty of water — good for farming.', 'Transport and cities are easy to build on flat land.', 'Arunachal is mountainous and forested, with steep slopes and few roads.'], 'Flat, fertile, well-watered land supports many more people'),
      ],
      practice: [
        tp('density', (r) => {
          const area = r.pick([2000, 2500, 4000, 5000, 8000, 10000]);
          const d = r.pick([150, 250, 300, 400, 500, 750, 1200]);
          const pop = area * d;
          const place = r.pick(['An illustrative district', 'A hypothetical district', 'A sample region']);
          return numQ(`${place} has a population of ${pop.toLocaleString('en-IN')} and an area of ${area.toLocaleString('en-IN')} km². What is its population density (persons per km²)?`, d,
            ['Density = population ÷ area.', `Divide ${pop.toLocaleString('en-IN')} by ${area.toLocaleString('en-IN')}.`],
            [`Density = ${pop.toLocaleString('en-IN')} ÷ ${area.toLocaleString('en-IN')} = ${d} persons per km²`],
            [{ when: String(rd(area / pop, 6)), explain: 'You divided area by population. Put people on top: population ÷ area.' }], 0.001);
        }, 1),
        mcq('census', 'Recall the Census 2011 headline numbers.', [
          ['How often is the Census held in India?', 'Every 10 years', ['Every 5 years', 'Every year', 'Every 20 years'], 'The last two were 2001 and 2011.', 'India conducts its Census once every decade.'],
          ['India\'s population in the 2011 Census was about…', '121 crore', ['100 crore', '135 crore', '85 crore'], 'Just over one hundred and twenty crore.', 'Census 2011 counted about 121.09 crore people.'],
          ['India\'s population density in 2011 was…', '382 persons per km²', ['38 persons per km²', '1,000 persons per km²', '120 persons per km²'], 'A three-digit number in the 300s.', 'Census 2011 density was 382 persons per km².'],
          ['India has about what share of the world\'s population?', 'About 17.5%', ['About 2.4%', 'About 50%', 'About 5%'], '2.4% is its share of land.', 'India has about 17.5% of the world\'s people on about 2.4% of its land.'],
          ['The first complete, synchronous Census of India was held in…', '1881', ['1947', '1951', '1921'], 'It was during British rule.', 'Since 1881 the Census has been held every ten years.'],
          ['Which region is likely to have the LOWEST population density?', 'The Thar desert', ['The Ganga plain', 'The Kerala coast', 'Hyderabad city'], 'Think about water and farming.', 'Deserts have little water and farming, so few people live there.'],
        ]),
        tapT('dense', 'Tap every region that generally has HIGH population density.', [
          ['Ganga plain', true], ['Kerala coast', true], ['Big cities like Hyderabad', true], ['River deltas like the Godavari delta', true],
          ['Thar desert', false], ['High Himalayas', false], ['Dense forests of Arunachal Pradesh', false],
        ], ['Where is land flat, fertile and well-watered?', 'Deserts and high mountains are sparse.'], 'Plains, coasts, deltas and cities are dense; deserts, mountains and forests are sparse.'),
      ],
    },
    {
      id: 'ts10.ss.population.growth', title: 'Population change: birth rate, death rate, migration and growth', prereqs: ['ts10.ss.population.census'],
      intro: [
        h('Why did India\'s population grow so fast after 1951?'),
        photo('👶', 'Better health care meant more babies survived and people lived longer — which made the population grow quickly.'),
        p('Between 1951 and 2011 India\'s population more than tripled, from about 36 crore to 121 crore. Was it because families suddenly had more children? Not really. The main reason was that far fewer people died young, thanks to vaccines, clean water, better food and hospitals.'),
        def('Birth rate', 'The number of live births per 1,000 people in a year.'),
        def('Death rate', 'The number of deaths per 1,000 people in a year.'),
        def('Natural growth rate', 'Birth rate minus death rate. It tells how fast the population is growing on its own, without migration.'),
        def('Migration', 'Movement of people into or out of an area. In-migration adds to the population; out-migration reduces it.'),
        f('Natural growth rate (per 1,000) = birth rate − death rate', 'growth rate equals birth rate minus death rate'),
        xp({
          title: 'What if? Births and deaths change', formula: 'G = B − D (per 1,000 people)',
          res: ['G', 'Natural growth rate', 'per 1,000', 'B - D', 1],
          vars: [['B', 'Birth rate', 'per 1,000', 10, 45, 0.5, 20], ['D', 'Death rate', 'per 1,000', 5, 30, 0.5, 7]],
          notes: [
            ['B', 'More births per 1,000 people add directly to growth.', 'Fewer births — for example, as more girls study longer and marry later — slow growth.'],
            ['D', 'More deaths (famine, epidemics) cut growth.', 'Fewer deaths (vaccines, clean water) speed up growth even if births stay the same.'],
          ],
          mistakes: [
            ['Adding birth and death rates', 'Deaths remove people, so they are subtracted: G = B − D.'],
            ['Reading 15 per 1,000 as 15%', '15 per 1,000 is 1.5%. Divide by 10 to change "per 1,000" into a percentage.'],
          ],
          real: 'Around 1951 India had very roughly 40 births and 27 deaths per 1,000 (growth ≈ 13). By about 2011 roughly 22 births and 7 deaths per 1,000 (growth ≈ 15) — growth stayed high because deaths fell faster than births.',
        }),
        h('Stages of India\'s population growth'),
        stepsB(
          '1901–1921: stagnant population — high births AND high deaths (famines, epidemics like the 1918 influenza).',
          '1921–1951: steady growth — death rate begins to fall with better health and food supply.',
          '1951–1981: population explosion — death rate falls sharply, birth rate stays high.',
          '1981 onwards: growth still high but slowing — birth rate falls as education, especially of girls, and family planning spread.',
        ),
        p('The decadal growth rate of India was about 17.7% between 2001 and 2011 — the slowest since independence at that time. Southern states such as Kerala, Tamil Nadu and Andhra Pradesh/Telangana have lower birth rates than many northern states.'),
        keys('Growth = births − deaths (+ in-migration − out-migration).', 'After 1951, deaths fell faster than births → rapid growth.', 'Since 1981, birth rates have been falling, so growth is slowing.', '2001–2011 decadal growth: about 17.7%.'),
        remember('1921 is called the "year of the great divide" — after it, India\'s population grew every decade.'),
        tip('A falling death rate is good news that, for a while, makes the population grow faster.'),
      ],
      examples: [
        ex('A state has a birth rate of 18 per 1,000 and a death rate of 6 per 1,000. Find the natural growth rate per 1,000 and as a percentage.', ['G = 18 − 6 = 12 per 1,000', '12 per 1,000 = 12 ÷ 10 = 1.2%'], '12 per 1,000 = 1.2% per year'),
        ex('India\'s population was 102.9 crore in 2001 and 121.1 crore in 2011. Find the decadal growth rate.', ['Increase = 121.1 − 102.9 = 18.2 crore', 'Growth rate = 18.2 ÷ 102.9 × 100', '≈ 17.7%'], 'About 17.7%'),
      ],
      practice: [
        tp('rate', (r) => {
          const b = r.pick([14, 16, 18, 20, 22, 25, 28, 30, 35]);
          const d = r.pick([5, 6, 7, 8, 9, 10, 12]);
          const pct = r.next() < 0.4;
          const g = b - d;
          if (pct) return numQ(`An illustrative region has a birth rate of ${b} and a death rate of ${d} per 1,000 people. What is its natural growth rate as a PERCENTAGE? (number only, no % sign)`, rd(g / 10, 2),
            ['First find births − deaths per 1,000.', `Then divide ${g} per 1,000 by 10 to get a percentage.`],
            [`Growth = ${b} − ${d} = ${g} per 1,000`, `${g} per 1,000 = ${rd(g / 10, 2)}%`],
            [{ when: String(g), explain: 'That is per 1,000. Divide by 10 to change it into a percentage.' }, { when: String(b + d), explain: 'Deaths must be subtracted, not added.' }], 0.001);
          return numQ(`An illustrative region has a birth rate of ${b} per 1,000 and a death rate of ${d} per 1,000. What is the natural growth rate per 1,000?`, g,
            ['Growth = birth rate − death rate.', `${b} − ${d} = ?`],
            [`Natural growth rate = ${b} − ${d} = ${g} per 1,000`],
            [{ when: String(b + d), explain: 'Deaths remove people, so subtract the death rate.' }], 0.001);
        }),
        tp('decadal', (r) => {
          const i = r.int(0, c6Pop.length - 2);
          const [y1, p1] = c6Pop[i];
          const [y2, p2] = c6Pop[i + 1];
          const g = rd(((p2 - p1) / p1) * 100, 1);
          return numQ(`India's population was ${p1} crore in ${y1} and ${p2} crore in ${y2} (Census, rounded). Find the decadal growth rate in percent, to one decimal place. (number only, no % sign)`, g,
            ['Increase = later − earlier. Then divide by the EARLIER population.', `(${p2} − ${p1}) ÷ ${p1} × 100`],
            [`Increase = ${p2} − ${p1} = ${rd(p2 - p1, 1)} crore`, `Growth rate = ${rd(p2 - p1, 1)} ÷ ${p1} × 100 ≈ ${g}%`],
            [{ when: String(rd(((p2 - p1) / p2) * 100, 1)), explain: 'Divide by the EARLIER (starting) population, not the later one.' }], 0.01);
        }, 2),
        mcq('stages', 'Compare how births and deaths changed over time.', [
          ['India\'s population grew fastest after 1951 mainly because…', 'The death rate fell sharply while the birth rate stayed high', ['The birth rate suddenly doubled', 'Many people migrated into India from Europe', 'The death rate rose'], 'Think of vaccines and hospitals.', 'Falling deaths with high births widened the gap.'],
          ['Natural growth rate equals…', 'Birth rate minus death rate', ['Birth rate plus death rate', 'Death rate minus birth rate', 'Population divided by area'], 'Births add, deaths subtract.', 'G = B − D.'],
          ['Which year is called the "year of the great divide" in India\'s population history?', '1921', ['1947', '1951', '1981'], 'After it, growth never stopped.', 'From 1921 onwards the population has grown every decade.'],
          ['India\'s decadal growth rate in 2001–2011 was about…', '17.7%', ['1.77%', '35%', '50%'], 'Between 102.9 and 121.1 crore.', '(121.1 − 102.9) ÷ 102.9 × 100 ≈ 17.7%.'],
          ['A falling birth rate is most closely linked to…', 'Education of girls and family planning', ['More famines', 'Fewer hospitals', 'Less rainfall'], 'Who decides family size?', 'Educated women tend to marry later and have fewer children.'],
          ['Besides births and deaths, a region\'s population also changes because of…', 'Migration', ['Latitude', 'Rainfall', 'Altitude'], 'People move in and out.', 'In-migration adds and out-migration reduces population.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.population.composition', title: 'Age and sex composition and literacy', prereqs: ['ts10.ss.population.census'],
      intro: [
        h('Not just how many, but who'),
        photo('👨', 'A population is made of children, working-age adults and elderly people; of females and males; of those who can read and those who cannot.'),
        p('Two villages may each have 1,000 people. In one, half are children; in the other, most are elderly. The first needs schools; the second needs health care and pensions. That is why planners study the composition of the population — its make-up by age, sex and literacy.'),
        h('Age composition'),
        def('Age groups', 'Children (0–14 years), working age (15–59 years) and aged (60 years and above).'),
        def('Dependency', 'Children and the aged mostly depend on the working-age group for support. A large working-age population can be an advantage (a "demographic dividend") if they have education and jobs.'),
        h('Sex composition'),
        def('Sex ratio', 'The number of females per 1,000 males in a population.'),
        f('Sex ratio = (number of females ÷ number of males) × 1,000', 'sex ratio equals females divided by males times one thousand'),
        p('India\'s sex ratio in 2011 was 943, and the child sex ratio (0–6 years) was only 919, showing discrimination against girls. Kerala had more females than males (1,084). Telangana\'s figure was close to 988. A low sex ratio reflects problems such as sex-selective practices, neglect of girls\' health, and early marriage.'),
        h('Literacy'),
        def('Literacy rate', 'The percentage of people aged 7 years and above who can read and write with understanding in any language.'),
        f('Literacy rate = (literates aged 7+ ÷ population aged 7+) × 100', 'literacy rate equals literates divided by population aged seven plus times one hundred'),
        bars(['Total', 'Males', 'Females'], [74.04, 82.14, 65.46], '%', 'Literacy in India, Census 2011: total 74.04%, males 82.14%, females 65.46% — a gender gap of about 17 percentage points.'),
        xp({
          title: 'What if? Count females and males', formula: 'SR = F ÷ M × 1,000',
          res: ['SR', 'Sex ratio', 'females per 1,000 males', 'F / M * 1000', 0],
          vars: [['F', 'Number of females', 'thousand', 400, 600, 1, 485], ['M', 'Number of males', 'thousand', 400, 600, 1, 515]],
          notes: [
            ['F', 'More females for the same number of males pushes the ratio up towards (or above) 1,000.', 'Fewer females for the same males lowers the ratio — a warning sign of discrimination.'],
            ['M', 'More males for the same females lowers the ratio.', 'Fewer males (for example when men migrate away for work) raises the ratio.'],
          ],
          mistakes: [
            ['Calculating males per 1,000 females', 'In India the sex ratio is FEMALES per 1,000 males: F ÷ M × 1,000.'],
            ['Writing the sex ratio as a percentage', 'It is "per 1,000 males", not "per 100".'],
          ],
          real: 'Districts from which many men migrate for work (for example to the Gulf) can show sex ratios above 1,000 even when girls are not favoured — always look at the reason behind a number.',
        }),
        keys('Age groups: 0–14, 15–59, 60+.', 'Sex ratio = females per 1,000 males; India 2011: 943; child sex ratio 919.', 'Literacy: people 7+ who can read and write; India 2011: 74.04%.', 'Big gender gap in literacy: 82.14% (males) vs 65.46% (females).'),
        remember('Census 2011: sex ratio 943; literacy 74.04%. Kerala had the highest sex ratio (1,084) and highest literacy among states.'),
        tip('Sex ratio below 1,000 → fewer females than males. Above 1,000 → more females.'),
      ],
      examples: [
        ex('A village has 2,400 males and 2,280 females. Find the sex ratio.', ['Sex ratio = females ÷ males × 1,000', '= 2,280 ÷ 2,400 × 1,000', '= 950'], '950 females per 1,000 males'),
        ex('In a town, 36,000 of the 45,000 people aged 7 and above can read and write. Find the literacy rate.', ['Literacy rate = literates ÷ population aged 7+ × 100', '= 36,000 ÷ 45,000 × 100', '= 80%'], '80%'),
      ],
      practice: [
        tp('sexratio', (r) => {
          const m = r.pick([1000, 2000, 2500, 4000, 5000, 8000]);
          const sr = r.pick([900, 920, 940, 950, 980, 1000, 1020, 1050]);
          const fem = (m * sr) / 1000;
          return numQ(`An illustrative village has ${m.toLocaleString('en-IN')} males and ${fem.toLocaleString('en-IN')} females. What is its sex ratio (females per 1,000 males)?`, sr,
            ['Sex ratio = females ÷ males × 1,000.', `${fem} ÷ ${m} × 1,000`],
            [`Sex ratio = ${fem.toLocaleString('en-IN')} ÷ ${m.toLocaleString('en-IN')} × 1,000 = ${sr}`, sr < 1000 ? 'Below 1,000: fewer females than males.' : sr === 1000 ? 'Exactly 1,000: equal numbers.' : 'Above 1,000: more females than males.'],
            [{ when: String(rd((m / fem) * 1000, 0)), explain: 'You calculated males per 1,000 females. India uses FEMALES per 1,000 males.' }], 0.002);
        }),
        tp('literacy', (r) => {
          const pop = r.pick([2000, 4000, 5000, 8000, 10000, 20000]);
          const rate = r.pick([55, 60, 66, 70, 74, 80, 85, 90]);
          const lit = (pop * rate) / 100;
          return numQ(`In an illustrative mandal, ${lit.toLocaleString('en-IN')} out of ${pop.toLocaleString('en-IN')} people aged 7 years and above can read and write. What is the literacy rate? (number only, no % sign)`, rate,
            ['Literacy rate = literates ÷ population aged 7+ × 100.', `${lit} ÷ ${pop} × 100`],
            [`${lit.toLocaleString('en-IN')} ÷ ${pop.toLocaleString('en-IN')} × 100 = ${rate}%`],
            [{ when: String(rate / 100), explain: 'Multiply by 100 to turn the fraction into a percentage (and type the number without %).' }], 0.002);
        }),
        mcq('comp', 'Recall the Census 2011 composition figures.', [
          ['India\'s sex ratio in the 2011 Census was…', '943', ['1,000', '919', '1,084'], '919 is the CHILD sex ratio.', 'Census 2011 recorded 943 females per 1,000 males.'],
          ['Which state had the highest sex ratio in 2011?', 'Kerala', ['Haryana', 'Punjab', 'Delhi'], 'It is also the most literate state.', 'Kerala had 1,084 females per 1,000 males.'],
          ['India\'s literacy rate in 2011 was…', '74.04%', ['65.46%', '82.14%', '52.2%'], 'Between the female and male rates.', 'Total literacy was 74.04% (males 82.14%, females 65.46%).'],
          ['Literacy is counted for people aged…', '7 years and above', ['All ages', '15 years and above', '18 years and above'], 'Very young children are excluded.', 'The Census counts literacy for those aged 7+.'],
          ['The working-age group in India\'s Census is…', '15–59 years', ['0–14 years', '60 years and above', '7–18 years'], 'Between children and the aged.', 'Ages 15–59 form the working-age population.'],
          ['A child sex ratio of 919 (in 2011) shows…', 'Fewer girls than boys being born or surviving', ['More girls than boys', 'Equal numbers', 'High literacy'], 'Below 1,000.', 'It points to discrimination against girls.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Settlements - Migrations
// =====================================================================================
const ch7: USpec = {
  id: 'ts10.ss.ch7', subject: 'social', title: 'Settlements - Migrations', source: src(7),
  objectives: [
    {
      id: 'ts10.ss.settle.types', title: 'Types of settlements and why people settle where they do', prereqs: [],
      intro: [
        h('Why is your village where it is?'),
        photo('🏘️', 'A cluster of houses around a village tank — a typical compact settlement on the Telangana plateau.'),
        p('Most old villages in Telangana stand near a tank, a stream or a well, on slightly higher ground safe from floods, close to fields. People choose a place to live for good reasons: water, fertile land, safety and connection to others. The place where people build homes and live together is a settlement.'),
        def('Settlement', 'A place where people live, build houses and carry out their activities — from a few huts to a megacity.'),
        def('Site', 'The actual land on which a settlement is built and its local features (water, slope, soil, safety).'),
        def('Situation', 'The location of a settlement in relation to the surrounding area — roads, rivers, other towns.'),
        h('Rural settlements by pattern'),
        def('Compact (clustered)', 'Houses built close together in one cluster; common in fertile plains and on the Deccan where water sources are limited and people want security.'),
        def('Semi-compact', 'A cluster with some houses spreading outwards, often as a village grows.'),
        def('Hamleted', 'A village broken into several small units (palli, padu, tanda) at some distance from each other, sharing one name — common in parts of the Ganga plain and in tribal areas.'),
        def('Dispersed (scattered)', 'Isolated houses spread far apart, as in hilly, forested or desert areas where farmland or water is scattered.'),
        h('Rural and urban'),
        p('Rural settlements are villages where most people work in farming and related activities. Urban settlements are towns and cities where most people work in manufacturing, trade and services. In the Census, a place is a "statutory town" if it has a municipality or corporation; a "census town" must have at least 5,000 people, a density of at least 400 per km², and at least 75% of male workers in non-farm work.'),
        keys('Settlements grow where there is water, good land and safety.', 'Rural patterns: compact, semi-compact, hamleted, dispersed.', 'Rural = mostly farm work; urban = mostly non-farm work.', 'Census town: 5,000+ people, density 400+/km², 75%+ male workers in non-farm jobs.'),
        remember('Census town criteria: population ≥ 5,000; density ≥ 400 per km²; ≥ 75% of male main workers in non-agricultural work.'),
        tip('Water decides the site of most old settlements — look for the tank, river or well.'),
      ],
      examples: [
        ex('A tribal area in the Adilabad forests has houses scattered across the hill slopes, each near its own field. What type of settlement is this and why?', ['Houses are isolated and far apart → dispersed settlement.', 'Hilly, forested land means farmable patches are small and scattered.', 'Families live near their own fields.'], 'Dispersed settlement, because of scattered farmland on hilly, forested land'),
        ex('A place has 12,000 people, density 900 per km², and 85% of male workers in non-farm jobs, but no municipality. Is it a census town?', ['Population 12,000 ≥ 5,000 ✓', 'Density 900 ≥ 400 ✓', 'Non-farm male workers 85% ≥ 75% ✓', 'All three conditions are met.'], 'Yes, it qualifies as a census town'),
      ],
      practice: [
        matchT('types', 'settlement type to its description', [
          ['Compact', 'Houses close together in one cluster'], ['Semi-compact', 'A cluster with houses spreading outward'], ['Hamleted', 'Several small units sharing one village name'],
          ['Dispersed', 'Isolated houses spread far apart'], ['Site', 'The actual land a settlement is built on'], ['Situation', 'Position in relation to surroundings'],
        ], ['Compact and dispersed are opposites.', 'Site is the ground; situation is the neighbourhood.']),
        mcq('settle', 'Water, land and safety decide where people settle.', [
          ['The most important factor in choosing the site of an old village was usually…', 'Availability of water', ['Nearness to an airport', 'A cinema hall', 'A railway station'], 'Think of the village tank.', 'People need water for drinking and farming, so most old villages lie near a water source.'],
          ['Dispersed settlements are common in…', 'Hilly and forested areas', ['Fertile river plains', 'City centres', 'Industrial estates'], 'Where farmland is scattered.', 'Rugged terrain scatters farms and houses.'],
          ['Which is a requirement for a census town?', 'At least 5,000 people', ['At least 1 lakh people', 'A seaport', 'An airport'], 'The smallest threshold.', 'Census towns need 5,000+ people, density 400+ and 75%+ male non-farm workers.'],
          ['In urban settlements most people work in…', 'Manufacturing, trade and services', ['Farming', 'Fishing only', 'Forest gathering'], 'Non-farm activities.', 'Urban areas are defined by non-agricultural work.'],
          ['Tandas in Telangana are small hamlets associated with which community?', 'The Lambada (Banjara) community', ['Fishermen of the Konkan', 'Kashmiri shepherds', 'Island dwellers'], 'Known for colourful embroidery.', 'Tandas are Lambada hamlets, often a distance from the main village.'],
          ['"Situation" of a settlement refers to…', 'Its location relative to roads, rivers and other places', ['The type of soil under it', 'The number of houses', 'Its age'], 'Not the ground itself.', 'Situation is about relationships with the surroundings.'],
        ]),
        tapT('census', 'Tap every condition a CENSUS TOWN must meet.', [
          ['Population of at least 5,000', true], ['Density of at least 400 persons per km²', true], ['At least 75% of male main workers in non-farm work', true],
          ['Must have an airport', false], ['Must have a municipal corporation', false], ['Must be a district headquarters', false], ['Population of at least 10 lakh', false],
        ], ['There are exactly three conditions.', 'Having a municipality makes it a STATUTORY town, not a census town.'], 'Census towns: 5,000+ people, 400+/km², 75%+ male non-farm workers.'),
      ],
    },
    {
      id: 'ts10.ss.settle.urban', title: 'Urbanisation in India and the aerotropolis', prereqs: ['ts10.ss.settle.types'],
      intro: [
        h('Hyderabad keeps growing outward'),
        photo('🏢', 'High-rise offices in Hyderabad\'s HITEC City area — farmland a few decades ago, now part of a metropolitan region.'),
        p('Places like Gachibowli, Kondapur and Shamshabad were mostly villages and rocky scrubland in the 1980s. Today they are full of offices, apartments and malls. This spread of cities, and the movement of people from villages to towns, is urbanisation.'),
        def('Urbanisation', 'The increase in the share of a country\'s population living in towns and cities.'),
        f('Level of urbanisation (%) = urban population ÷ total population × 100', 'urbanisation equals urban population divided by total population times one hundred'),
        p('In 2011, about 31.16% of Indians (about 37.7 crore people) lived in urban areas, up from about 17% in 1951. Cities with over 10 lakh (1 million) people are called million-plus or metropolitan cities; in 2011 Greater Mumbai, Delhi and Kolkata were the largest urban agglomerations, and Hyderabad was among the top ten.'),
        bars(['1951', '1971', '1991', '2011'], [17.3, 19.9, 25.7, 31.2], '%', 'Share of India\'s population living in urban areas by Census (rounded): about 17% in 1951 to about 31% in 2011.'),
        def('Urban agglomeration', 'A continuous urban spread made of a town and its adjoining outgrowths, or two or more towns joined together.'),
        def('Aerotropolis', 'A city or urban region planned around a major airport, with logistics parks, hotels, offices and industries that depend on fast air connections. The area around Rajiv Gandhi International Airport at Shamshabad is often given as an example of this kind of growth.'),
        xp({
          title: 'What if? Towns grow faster than villages', formula: 'U% = Urban ÷ Total × 100',
          res: ['U', 'Level of urbanisation', '%', 'Ur / (Ur + Ru) * 100', 1],
          vars: [['Ur', 'Urban population', 'crore', 5, 80, 0.5, 37.7], ['Ru', 'Rural population', 'crore', 40, 100, 0.5, 83.4]],
          notes: [
            ['Ur', 'More people in towns raises the urban share — the country becomes more urbanised.', 'Fewer town dwellers lowers the urban share.'],
            ['Ru', 'If villages grow, the urban share falls even if towns do not shrink — the share depends on both.', 'If rural population falls (people move to towns), the urban share rises.'],
          ],
          mistakes: [
            ['Dividing urban by rural instead of by total', 'Urbanisation is a share of the TOTAL population: urban ÷ (urban + rural).'],
            ['Thinking a growing city always means a higher urban percentage', 'If the rural population grows even faster, the urban share can stay the same or fall.'],
          ],
          real: 'Census 2011: about 37.7 crore urban and 83.4 crore rural people → 37.7 ÷ 121.1 × 100 ≈ 31.1%.',
        }),
        h('Problems of rapid urbanisation'),
        p('Cities attract jobs, but rapid growth brings slums, traffic jams, shortage of drinking water, flooding when lakes are built over, air pollution and pressure on schools and hospitals. Planned growth — public transport like the Hyderabad Metro, affordable housing, protecting lakes — helps cities stay liveable.'),
        keys('Urbanisation = rising share of people in towns.', '2011: about 31.16% urban (about 37.7 crore people).', 'Million-plus cities: over 10 lakh people.', 'Aerotropolis: growth planned around a major airport.'),
        remember('Census 2011 urban share: 31.16%. Largest urban agglomeration in 2011: Greater Mumbai.'),
        tip('Urbanisation is a percentage, not a headcount — always divide by the total.'),
      ],
      examples: [
        ex('A district has 18 lakh urban and 42 lakh rural people. What is its level of urbanisation?', ['Total = 18 + 42 = 60 lakh', 'Urbanisation = 18 ÷ 60 × 100', '= 30%'], '30%'),
        ex('Why do businesses such as courier companies, pharmaceutical exporters and hotels set up near a big airport like Shamshabad?', ['They need quick air connections for people and time-sensitive goods.', 'Being close saves travel time and cost.', 'Together they create jobs, housing and roads → a city grows around the airport (aerotropolis).'], 'Fast air access attracts linked businesses, and a city grows around the airport'),
      ],
      practice: [
        tp('urbanpct', (r) => {
          const tot = r.pick([20, 25, 40, 50, 60, 80, 100]);
          const pct = r.pick([20, 25, 30, 35, 40, 45, 60]);
          const u = (tot * pct) / 100;
          const ru = tot - u;
          return numQ(`An illustrative district has ${u} lakh urban people and ${ru} lakh rural people. What is its level of urbanisation? (number only, no % sign)`, pct,
            ['Total = urban + rural.', `Urbanisation = ${u} ÷ ${tot} × 100.`],
            [`Total = ${u} + ${ru} = ${tot} lakh`, `Urbanisation = ${u} ÷ ${tot} × 100 = ${pct}%`],
            [{ when: String(rd((u / ru) * 100, 2)), explain: 'You divided by the rural population. Divide by the TOTAL (urban + rural).' }], 0.002);
        }),
        mcq('urban', 'Remember 31.16% and the meaning of agglomeration and aerotropolis.', [
          ['According to Census 2011, about what share of Indians lived in urban areas?', 'About 31%', ['About 10%', 'About 50%', 'About 70%'], 'Roughly one in three.', 'Census 2011 urban share was 31.16%.'],
          ['A city planned and growing around a major airport is called an…', 'Aerotropolis', ['Agglomeration', 'Megalopolis', 'Hamlet'], 'Aero = air.', 'An aerotropolis grows around airport-linked businesses.'],
          ['A million-plus city has a population of more than…', '10 lakh', ['1 lakh', '1 crore', '50,000'], 'One million.', 'One million = 10 lakh.'],
          ['Which is a problem caused by rapid, unplanned urbanisation?', 'Growth of slums and traffic congestion', ['More forests in the city', 'Less demand for water', 'Fewer jobs'], 'Too many people, too fast.', 'Housing and transport cannot keep pace, causing slums and jams.'],
          ['An urban agglomeration is…', 'A town together with its adjoining outgrowths or joined towns', ['A group of villages far apart', 'A forest settlement', 'An island chain'], 'Continuous urban spread.', 'It is a continuous built-up urban area.'],
          ['Building over lakes in a growing city often leads to…', 'Urban flooding during heavy rain', ['More drinking water', 'Cooler summers', 'Less traffic'], 'Where does rainwater go?', 'Lakes absorbed rainwater; without them, streets flood.'],
        ]),
        tapT('problems', 'Tap every problem linked with rapid urbanisation.', [
          ['Slums and lack of affordable housing', true], ['Traffic congestion', true], ['Air pollution', true], ['Shortage of drinking water', true],
          ['Shortage of farmland in the Thar desert', false], ['Too few people in cities', false], ['Coral reef formation', false],
        ], ['Think of a crowded city.', 'Problems come from too many people too quickly.'], 'Slums, traffic, pollution and water shortage are typical urban problems.'),
      ],
    },
    {
      id: 'ts10.ss.settle.migration', title: 'Migration: types, causes and impacts', prereqs: ['ts10.ss.settle.types'],
      intro: [
        h('Who in your family has moved?'),
        photo('🚆', 'Every year lakhs of workers travel by train to cities for construction, factory and service jobs.'),
        p('Think of your own family: perhaps a grandfather moved from a village to Hyderabad for a job, an aunt moved after marriage, or a cousin works in the Gulf. Almost every Indian family has a migration story.'),
        def('Migration', 'The movement of people from one place to another to live, either for a short time or permanently.'),
        h('Types of migration'),
        def('Internal migration', 'Movement within the country: rural to rural, rural to urban, urban to urban, urban to rural.'),
        def('International migration', 'Movement from one country to another, such as workers from Telangana going to Gulf countries.'),
        def('Seasonal migration', 'Moving for part of the year, for example to work in brick kilns or sugarcane harvesting after the local crop season ends.'),
        p('In India, the largest stream of internal migration is rural to rural, and women form the majority of these migrants, mainly because of marriage. Among men, the main reason is work.'),
        h('Push and pull'),
        def('Push factors', 'Problems that force people to leave: lack of work, drought, crop failure, debt, poor services, conflict.'),
        def('Pull factors', 'Attractions that draw people to a place: jobs, higher wages, schools, hospitals, city life.'),
        stepsB(
          'Drought or crop failure in the home village (push).',
          'News of construction jobs in a city through relatives or contractors (pull).',
          'The worker travels, often alone, leaving family behind.',
          'He or she works, saves and sends money home (remittances).',
          'Money is used for the family\'s food, schooling, house repair or repaying debts.',
        ),
        h('Impacts'),
        p('On the place they leave: money sent home improves living standards, but villages may lose young workers, and women and the elderly carry more responsibility. On the place they reach: migrants provide labour that builds cities, but crowding, slums and poor working conditions can result. Migrants themselves often face low pay, lack of housing, language barriers and difficulty getting ration cards or schooling for children in the new place.'),
        keys('Types: internal (rural–rural largest) and international; permanent and seasonal.', 'Women migrate mostly for marriage; men mostly for work.', 'Push factors drive people out; pull factors draw them in.', 'Impacts: remittances and labour supply, but also hardship and crowding.'),
        remember('Largest stream of internal migration in India: rural to rural. Main reason for female migration: marriage.'),
        tip('Push = problems at home. Pull = promises elsewhere.'),
      ],
      examples: [
        ex('Classify as push or pull: (a) repeated drought in a village, (b) higher wages in a city, (c) better hospitals in a town, (d) heavy debt.', ['Push factors are problems at the origin: (a) drought, (d) debt.', 'Pull factors are attractions at the destination: (b) wages, (c) hospitals.'], 'Push: a, d. Pull: b, c'),
        ex('A worker from Nizamabad district works in Dubai and sends money home every month. Name the type of migration and one positive and one negative impact on his family.', ['Moving to another country → international migration (for work).', 'Positive: remittances pay for children\'s education and house construction.', 'Negative: the family lives apart for years; the wife and parents handle all responsibilities alone.'], 'International labour migration; remittances (+), family separation (−)'),
      ],
      practice: [
        tapT('push', 'Tap every PUSH factor (a reason that forces people to leave).', [
          ['Drought and crop failure', true], ['Unemployment in the village', true], ['Heavy debt', true], ['Lack of schools and hospitals', true],
          ['Higher wages in the city', false], ['Better colleges in a town', false], ['Job offers from a construction company', false],
        ], ['Push factors are problems at the place of origin.', 'Wages and colleges elsewhere are attractions — pull factors.'], 'Push factors are problems at home; pull factors are attractions elsewhere.'),
        mcq('types', 'Ask: within India or abroad? for good or for a season?', [
          ['A farm labourer goes to work in brick kilns for six months each year after the harvest. This is…', 'Seasonal migration', ['International migration', 'Permanent urban migration', 'Natural growth'], 'He returns every year.', 'Moving for part of the year is seasonal migration.'],
          ['The largest stream of internal migration in India is…', 'Rural to rural', ['Urban to urban', 'Urban to rural', 'Rural to foreign countries'], 'Think of marriage.', 'Most migrants move between villages, especially women after marriage.'],
          ['The main reason for migration among women in India is…', 'Marriage', ['Studies abroad', 'Military service', 'Retirement'], 'Women usually move to the husband\'s home.', 'Marriage-related moves account for most female migration.'],
          ['Money sent home by migrants is called…', 'Remittances', ['Subsidies', 'Taxes', 'Dividends'], 'It is "remitted".', 'Remittances are transfers of earnings to families at home.'],
          ['Workers from Telangana going to Gulf countries is an example of…', 'International migration', ['Rural to rural migration', 'Seasonal internal migration', 'Urbanisation'], 'They cross national borders.', 'Moving to another country is international migration.'],
          ['Which is a problem migrants often face in big cities?', 'Lack of proper housing and low wages', ['Too many holidays', 'Free housing everywhere', 'Too few jobs for employers to fill'], 'Think of slums.', 'Many migrants live in slums and work in insecure, low-paid jobs.'],
        ]),
        orderT('chain', 'Arrange this migration story in order.', [
          'Drought ruins the crop in the village', 'A relative tells of construction jobs in the city', 'The worker travels to the city', 'He earns wages and saves part of them', 'He sends money home for his children\'s schooling',
        ], ['The push factor comes first.', 'Remittances come after earning.'], 'Push factor → information (pull) → move → earn → remit.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Rampur: A Village Economy (story village; all numbers illustrative)
// =====================================================================================
const c8Crops: [string, number, number][] = [
  // [crop, illustrative yield in quintals per acre, illustrative price in ₹ per quintal]
  ['paddy', 20, 2000], ['cotton', 8, 6000], ['maize', 25, 1800], ['groundnut', 8, 5000], ['jowar', 10, 3000], ['red gram', 5, 6000],
];

const ch8: USpec = {
  id: 'ts10.ss.ch8', subject: 'social', title: 'Rampur: A Village Economy', source: src(8),
  objectives: [
    {
      id: 'ts10.ss.rampur.land', title: 'Land and natural resources: making more from fixed land', prereqs: [],
      intro: [
        h('A story village to understand every village'),
        photo('🌾', 'Paddy fields in a Telangana village. Land, water, work and money together decide how much a village can produce.'),
        p('Rampur is an imaginary village used to understand how a real village economy works. Its people grow crops, keep cattle, run shops and drive autos. By following them we can see the four things every production needs: land, labour, capital and the knowledge to combine them.'),
        def('Factors of production', 'The things needed to produce goods and services: land (and other natural resources), labour, physical capital (tools, machines, money for inputs) and human capital (knowledge and enterprise).'),
        p('Land is the main natural resource of a village, and its area is fixed — Rampur cannot create new farmland. To grow more, farmers must produce more from the same land.'),
        def('Multiple cropping', 'Growing more than one crop on the same field in a year — for example paddy in the kharif season and maize or groundnut in the rabi season. It is possible only where there is irrigation.'),
        def('Modern farming methods', 'High-yielding variety (HYV) seeds, chemical fertilisers, pesticides, tube-well and canal irrigation and machines such as tractors and threshers — the package spread by the Green Revolution from the late 1960s.'),
        p('These methods raised yields greatly, but they also brought problems: overuse of chemical fertilisers can damage soil fertility, and too many borewells lower the groundwater table. A good village economy must look after its natural resources, not just use them.'),
        f('Farm income = (area × yield × price) − costs', 'farm income equals area times yield times price minus costs'),
        xp({
          title: 'What if? A Rampur farmer\'s season (illustrative numbers)', formula: 'Income = A × Y × P − C',
          res: ['I', 'Net farm income for the season', '₹', 'A * Y * P - C', 0],
          vars: [['A', 'Area cultivated', 'acres', 0.5, 10, 0.5, 2], ['Y', 'Yield', 'quintals per acre', 5, 30, 1, 20], ['P', 'Price', '₹ per quintal', 1000, 7000, 100, 2000], ['C', 'Total cost of cultivation', '₹', 5000, 150000, 1000, 40000]],
          notes: [
            ['A', 'More land under the crop means more output to sell — the biggest advantage of large farmers.', 'A small farmer with less land has less to sell, even with the same yield.'],
            ['Y', 'Better seeds, irrigation and fertilisers raise yield and income.', 'A drought or pest attack cuts yield and income — sometimes below costs.'],
            ['P', 'A higher market price raises income for the same harvest.', 'If prices crash at harvest time, the farmer can lose money despite a good crop.'],
            ['C', 'Higher costs (seeds, fertiliser, hired labour, interest on loans) eat into income.', 'Lower costs leave more for the family.'],
          ],
          mistakes: [
            ['Treating the sale value as income', 'Sale value is not income: the costs of seeds, fertiliser, labour and loan interest must be subtracted.'],
            ['Forgetting that income can be negative', 'If costs are higher than sales (bad yield or price), the farmer makes a loss and may fall into debt.'],
          ],
          real: 'Illustrative: 2 acres × 20 quintals × ₹2,000 = ₹80,000 sales; minus ₹40,000 costs leaves ₹40,000 for a whole season\'s work by the family.',
        }),
        keys('Land is fixed; production rises through multiple cropping and modern methods.', 'Irrigation makes multiple cropping possible.', 'Modern methods raise yields but can harm soil and groundwater.', 'Net income = sales − costs.'),
        remember('Four factors of production: land, labour, physical capital, human capital. Green Revolution: late 1960s, HYV seeds + irrigation + fertilisers.'),
        tip('Ask "Is it sales or income?" — income is what remains after costs.'),
      ],
      examples: [
        ex('An illustrative Rampur farmer grows paddy on 3 acres. Yield is 20 quintals/acre and the price is ₹2,000/quintal. Costs are ₹60,000. Find the net income.', ['Output = 3 × 20 = 60 quintals', 'Sales = 60 × 2,000 = ₹1,20,000', 'Net income = 1,20,000 − 60,000 = ₹60,000'], '₹60,000'),
        ex('Rampur gets canal water for the whole year from a new project. How can the same land now produce more?', ['With assured water, farmers can grow a second (rabi) crop and sometimes a third.', 'This is multiple cropping — more output from the same fixed land.', 'They may also switch to HYV seeds that need regular water.'], 'Through multiple cropping and modern methods made possible by irrigation'),
      ],
      practice: [
        tp('income', (r) => {
          const [crop, y, pr] = r.pick(c8Crops);
          const a = r.pick([1, 2, 3, 4, 5]);
          const sales = a * y * pr;
          const cost = Math.round((sales * r.pick([40, 50, 60, 70])) / 100);
          const inc = sales - cost;
          return numQ(`Illustrative example: a Rampur farmer grows ${crop} on ${a} acre${a > 1 ? 's' : ''}. Yield is ${y} quintals per acre, the price is ₹${pr.toLocaleString('en-IN')} per quintal and total costs are ₹${cost.toLocaleString('en-IN')}. What is the net income in rupees?`, inc,
            ['Sales = area × yield × price.', 'Net income = sales − costs.'],
            [`Output = ${a} × ${y} = ${a * y} quintals`, `Sales = ${a * y} × ${pr.toLocaleString('en-IN')} = ${inr(sales)}`, `Net income = ${inr(sales)} − ${inr(cost)} = ${inr(inc)}`],
            [{ when: String(sales), explain: 'That is the sale value. Subtract the costs to get net income.' }], 0.001);
        }, 2),
        mcq('land', 'Land is fixed — think about how output can still grow.', [
          ['Growing more than one crop on the same land in a year is called…', 'Multiple cropping', ['Mixed farming', 'Shifting cultivation', 'Plantation'], 'Multiple = many times a year.', 'Multiple cropping uses the same field more than once a year.'],
          ['What makes multiple cropping possible?', 'Assured irrigation', ['More cattle', 'Bigger houses', 'Less sunshine'], 'The second crop grows outside the rainy season.', 'Without irrigation, a rabi crop cannot be grown in dry areas.'],
          ['Which was a key part of the Green Revolution?', 'High-yielding variety seeds', ['Shifting cultivation', 'Bullock carts', 'Organic manure only'], 'HYV.', 'HYV seeds with irrigation and fertilisers raised yields from the late 1960s.'],
          ['A long-term harm of overusing chemical fertilisers is…', 'Loss of soil fertility', ['More groundwater', 'Cheaper seeds', 'Higher rainfall'], 'Soil health.', 'Excess chemicals can damage soil organisms and structure.'],
          ['Why is land called a fixed factor in a village?', 'The area of farmland cannot be increased much', ['It moves every year', 'It can be bought from the city', 'It grows with population'], 'You cannot make new land.', 'The village area is fixed; output must come from better use of it.'],
          ['Which is NOT a factor of production?', 'A holiday', ['Land', 'Labour', 'Capital'], 'Factors are inputs used to produce.', 'Land, labour, physical and human capital are the factors of production.'],
        ]),
        tapT('modern', 'Tap every item that is part of MODERN farming methods.', [
          ['HYV seeds', true], ['Chemical fertilisers', true], ['Tube-well irrigation', true], ['Tractors and threshers', true],
          ['Wooden plough only', false], ['Relying only on rain', false], ['Traditional seeds saved at home only', false],
        ], ['Think of the Green Revolution package.', 'Rain-only farming is traditional.'], 'HYV seeds, fertilisers, irrigation and machines make up modern methods.'),
      ],
    },
    {
      id: 'ts10.ss.rampur.distribution', title: 'Who owns the land? Land distribution in Rampur', prereqs: ['ts10.ss.rampur.land'],
      intro: [
        h('Same village, very different lives'),
        photo('🧑‍🌾', 'A small farmer works his own one-acre plot with family help, while a large farmer hires many labourers.'),
        p('Walk through Rampur and you will meet three kinds of families: large farmers with many acres and tractors; small farmers with one or two acres; and landless families who own no farmland at all and work on others\' fields. How land is shared decides who can earn a good living.'),
        def('Small farmer', 'A farmer with a small plot (in India usually under about 2 hectares). Most Indian farmers are small or marginal.'),
        def('Landless labourer', 'A person who owns no farmland and earns by working on others\' fields for wages.'),
        bars(['Landless families', 'Small farmers', 'Medium & large farmers'], [150, 240, 60], 'families', 'Illustrative Rampur: 450 families — 150 landless, 240 small farmers and only 60 medium and large farmers.'),
        bars(['Small farmers', 'Medium & large farmers'], [25, 75], '% of land', 'Illustrative Rampur: the 240 small farmers together own only 25% of the land; the 60 medium and large farmers own 75%.'),
        p('This illustrative picture is like many real Indian villages: a few families own most of the land, while many own little or none. Small farmers often have just enough to feed the family and must borrow for seeds and fertiliser. Landless families depend completely on wage work, which is seasonal.'),
        def('Land reform', 'Government measures to make land ownership fairer — for example fixing a ceiling (maximum) on how much land one family can own and giving the surplus to the landless, and protecting tenants.'),
        keys('Most families are small farmers or landless.', 'A small number of large farmers own most of the land (illustrative Rampur: 13% of families own 75% of land).', 'Unequal land means unequal income and power.', 'Land reforms try to reduce this inequality.'),
        remember('Most Indian farmers are small and marginal. Land ceiling = the maximum land a family may legally own.'),
        tip('Count both ways: what share of FAMILIES, and what share of LAND they hold.'),
      ],
      examples: [
        ex('In illustrative Rampur, 60 out of 450 families own 75% of the land. What percentage of families is this, and what does it show?', ['60 ÷ 450 × 100 ≈ 13.3%', 'So about 13% of families own 75% of the land.', 'Land is very unequally distributed.'], 'About 13% of families own three-quarters of the land — high inequality'),
        ex('Why does a small farmer with 1 acre often borrow every season while a large farmer does not?', ['The small farmer\'s harvest just feeds the family; little is left to sell or save.', 'He needs cash for seeds, fertiliser and pesticides before the harvest.', 'A large farmer sells a big surplus and can save money for the next season.'], 'Small farmers lack surplus to save, so they borrow for inputs'),
      ],
      practice: [
        tp('share', (r) => {
          const total = r.pick([300, 400, 450, 500, 600]);
          const pct = r.pick([10, 12, 15, 20, 25]);
          const large = (total * pct) / 100;
          return numQ(`In an illustrative village of ${total} families, ${large} families are medium and large farmers. What percentage of families is that? (number only, no % sign)`, pct,
            ['Percentage = part ÷ whole × 100.', `${large} ÷ ${total} × 100`],
            [`${large} ÷ ${total} × 100 = ${pct}%`, 'Compare this small share of families with the large share of land they usually own.'],
            [{ when: String(rd(large / total, 4)), explain: 'Multiply by 100 to get the percentage (type the number without %).' }], 0.002);
        }),
        mcq('dist', 'Think about who owns how much.', [
          ['In most Indian villages, the majority of farmers are…', 'Small and marginal farmers', ['Large landowners', 'Plantation companies', 'Government officers'], 'Many families, little land each.', 'Most farm households own small plots.'],
          ['A landless labourer earns mainly from…', 'Wages for working on others\' fields', ['Renting out land', 'Selling crops from own land', 'Running a factory'], 'He owns no land.', 'Without land, wage work is the main income.'],
          ['A land ceiling law…', 'Fixes the maximum land one family can own', ['Fixes the minimum wage', 'Bans farming', 'Raises rents'], 'Ceiling = upper limit.', 'Ceiling laws limit holdings so surplus land can go to the landless.'],
          ['Why do small farmers often fall into debt?', 'They must borrow for inputs and have little surplus', ['They own too much land', 'They never use seeds', 'They are paid by the government'], 'Small harvest, high input costs.', 'Little surplus forces them to borrow before each season.'],
          ['In illustrative Rampur, 60 of 450 families own 75% of land. This shows…', 'Unequal distribution of land', ['Equal distribution of land', 'No farming in the village', 'All families are landless'], 'Few families, most land.', 'A small group owns most of the land.'],
          ['Which is an aim of land reforms?', 'Giving land to the landless and protecting tenants', ['Making large farms larger', 'Ending all farming', 'Raising land prices'], 'Reform = making fairer.', 'Land reforms try to make ownership fairer.'],
        ]),
        matchT('who', 'Rampur villager to their situation', [
          ['Large farmer', 'Owns many acres and hires labourers'], ['Small farmer', 'Works a small plot with family labour'], ['Landless labourer', 'Owns no land; works for wages'],
          ['Tenant farmer', 'Cultivates land rented from an owner'], ['Moneylender', 'Lends money, often at high interest'], ['Shopkeeper', 'Sells daily goods in the village'],
        ], ['Start with the three kinds of farm families.', 'A tenant pays rent for the land he farms.']),
      ],
    },
    {
      id: 'ts10.ss.rampur.labour-capital', title: 'Labour and capital: wages, tools and loans', prereqs: ['ts10.ss.rampur.land'],
      intro: [
        h('Hands and money'),
        photo('🚜', 'A tractor is fixed capital: bought once, used for many years.'),
        p('Land alone grows nothing. Someone must plough, sow, weed and harvest — that is labour. And someone must pay for seeds, fertiliser, a pump set or a tractor — that is capital. In Rampur, labour is plentiful but capital is scarce, especially for small farmers.'),
        h('Labour'),
        p('Small farmers work their own fields with family members. Medium and large farmers hire farm labourers. Because there are many landless people competing for work, wages are often below the official minimum wage, and work is available only in the busy sowing and harvesting seasons. Many labourers are paid daily, in cash or sometimes in kind (grain).'),
        def('Minimum wage', 'The lowest wage per day that the government says must be paid for a type of work.'),
        h('Capital'),
        def('Fixed capital', 'Tools, machines and buildings used again and again over many years: ploughs, tractors, pump sets, tube wells, sheds.'),
        def('Working capital', 'Raw materials and money used up in one production cycle: seeds, fertilisers, pesticides, cash to pay wages.'),
        p('Large farmers usually use their own savings from selling surplus crops. Small farmers borrow — from large farmers, traders or moneylenders, often at very high interest, or from banks and cooperatives at lower interest. If the crop fails, a loan can trap a family in debt.'),
        stepsB(
          'Before sowing, a small farmer needs cash for seeds and fertiliser.',
          'He borrows from a moneylender or trader at high interest.',
          'He may agree to sell his crop to the same trader at a lower price.',
          'At harvest, he repays the loan with interest.',
          'If the crop fails, the loan grows — and he must borrow again next season.',
        ),
        keys('Labour: family labour on small farms, hired labour on large farms.', 'Wages are often low and work is seasonal.', 'Fixed capital lasts many years; working capital is used up in one cycle.', 'Small farmers borrow, often at high interest; banks and cooperatives offer cheaper credit.'),
        remember('Fixed capital: tools, machines, buildings. Working capital: seeds, fertilisers, money for wages.'),
        tip('Ask "Is it used up this season?" Yes → working capital. No → fixed capital.'),
      ],
      examples: [
        ex('Classify as fixed or working capital: tractor, seeds, pump set, fertiliser, cash for wages, cattle shed.', ['Used for many years: tractor, pump set, cattle shed → fixed.', 'Used up in one season: seeds, fertiliser, cash for wages → working.'], 'Fixed: tractor, pump set, shed. Working: seeds, fertiliser, cash for wages'),
        ex('A labourer works 25 days in a month at an illustrative wage of ₹300 per day but gets no work for the next two months. What is his average monthly income over these three months?', ['Earnings in the busy month = 25 × 300 = ₹7,500', 'Earnings in the next two months = ₹0', 'Average = 7,500 ÷ 3 = ₹2,500 per month'], '₹2,500 per month — seasonal work keeps incomes low'),
      ],
      practice: [
        tp('wages', (r) => {
          const days = r.pick([12, 15, 18, 20, 22, 25]);
          const wage = r.pick([250, 300, 350, 400, 450]);
          return numQ(`Illustrative example: a farm labourer in Rampur gets work for ${days} days in a month at ₹${wage} per day. How much does he earn that month (₹)?`, days * wage,
            ['Monthly earnings = days worked × daily wage.', `${days} × ${wage}`],
            [`${days} × ₹${wage} = ${inr(days * wage)}`, 'Work is seasonal, so in slack months he may earn much less.'],
            [{ when: String(30 * wage), explain: 'He does not get work every day — use the number of days he actually worked.' }], 0.001);
        }),
        tapT('fixed', 'Tap every item that is FIXED capital.', [
          ['Tractor', true], ['Pump set', true], ['Tube well', true], ['Cattle shed', true],
          ['Seeds', false], ['Fertiliser', false], ['Cash for paying wages', false],
        ], ['Fixed capital lasts many seasons.', 'Seeds and fertiliser are used up in one season.'], 'Tools, machines and buildings are fixed; seeds, fertiliser and cash are working capital.'),
        mcq('credit', 'Think about who has savings and who must borrow.', [
          ['Where do large farmers mostly get capital for the next season?', 'Their own savings from selling surplus', ['Moneylenders at high interest', 'Free from traders', 'Labourers\' wages'], 'They have a big surplus.', 'Large farmers sell surplus crops and save.'],
          ['Why are wages of farm labourers in Rampur often low?', 'Many landless people compete for limited work', ['There are too few workers', 'The government pays them', 'Farming needs no labour'], 'Supply of workers is high.', 'Heavy competition for few jobs keeps wages down.'],
          ['Seeds and fertilisers are examples of…', 'Working capital', ['Fixed capital', 'Land', 'Human capital'], 'Used up in one season.', 'Inputs used up in one cycle are working capital.'],
          ['Borrowing from a trader who then buys the crop at a low price…', 'Reduces the small farmer\'s earnings', ['Increases his earnings', 'Has no effect', 'Is the same as a bank loan'], 'He loses on both interest and price.', 'He pays interest AND gets a lower price for his crop.'],
          ['A cheaper source of credit for farmers than moneylenders is…', 'Banks and cooperative societies', ['Pawn shops at 5% a month', 'Big landlords', 'Private traders'], 'Formal sources.', 'Banks and cooperatives charge lower, regulated interest.'],
          ['On a small farm, most of the work is done by…', 'The farmer\'s own family', ['Hired machines only', 'Government workers', 'Factory workers'], 'Small plot, little money.', 'Small farmers rely on family labour.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.rampur.nonfarm', title: 'Non-farm activities: dairy, shops, small industry and transport', prereqs: ['ts10.ss.rampur.land'],
      intro: [
        h('Not everyone in a village is a farmer'),
        photo('🛺', 'Autorickshaws carry people and goods between villages and the mandal town — a common non-farm livelihood.'),
        p('In Rampur, many families earn part or all of their income outside farming. Some keep buffaloes and sell milk, some run small shops, some make goods at home, and some drive autos or tractors for hire. As land is limited, these non-farm activities are important for absorbing workers and raising incomes.'),
        def('Non-farm activity', 'Any work in a village other than crop farming, such as dairy, small-scale manufacturing, trade, transport and services.'),
        h('Main non-farm activities'),
        def('Dairy', 'Keeping buffaloes or cows and selling milk to a village collection centre or cooperative. Many small and landless families depend on it.'),
        def('Small-scale manufacturing', 'Making things at home or in small workshops with family labour: jaggery making, pottery, weaving, carpentry, making leaf plates.'),
        def('Shopkeepers (trade)', 'Buying goods such as rice, sugar, soap, oil and stationery from wholesale markets in towns and selling them in the village.'),
        def('Transport', 'Running autorickshaws, tractor trolleys, jeeps or bullock carts to carry people, milk and produce to nearby towns.'),
        stepsB(
          'A landless family takes a small loan from a self-help group.',
          'It buys a buffalo and grows fodder or buys it.',
          'Milk is sold every day to the village milk centre.',
          'The centre sends milk by vehicle to a dairy in the town.',
          'Daily milk income helps repay the loan and meet household needs.',
        ),
        p('Non-farm work grows when villages have good roads, electricity, cheap credit and access to markets. Self-help groups (SHGs), common among women in Telangana, help many families start such activities.'),
        keys('Non-farm work: dairy, small manufacturing, trade, transport, services.', 'It gives work to people with little or no land.', 'It needs credit, roads, electricity and markets.', 'SHGs help families start small businesses.'),
        remember('About two-thirds of Indians lived in villages in 2011 and most still depend on farming — so non-farm jobs in villages are very important.'),
        tip('Ask: what does this person sell — a crop (farm) or something else (non-farm)?'),
      ],
      examples: [
        ex('List three things needed for a Rampur woman to start a small shop and say why each matters.', ['Capital (savings or an SHG loan) to buy the first stock.', 'Access to a wholesale market in town to buy goods cheaply.', 'Customers with some cash income in the village.'], 'Capital, access to a wholesale market and enough local customers'),
        ex('Illustrative: a family sells 6 litres of milk a day at ₹40 per litre. Feed costs ₹90 a day. What is its net daily income from dairy?', ['Sales = 6 × 40 = ₹240', 'Net = 240 − 90 = ₹150 per day'], '₹150 per day'),
      ],
      practice: [
        tp('dairy', (r) => {
          const l = r.pick([4, 5, 6, 8, 10, 12]);
          const pr = r.pick([35, 40, 45, 50]);
          const c = r.pick([60, 80, 100, 120]);
          const net = l * pr - c;
          return numQ(`Illustrative example: a Rampur family sells ${l} litres of milk a day at ₹${pr} per litre and spends ₹${c} a day on fodder. What is its net daily income from dairy (₹)?`, net,
            ['Sales = litres × price.', 'Net income = sales − fodder cost.'],
            [`Sales = ${l} × ${pr} = ₹${l * pr}`, `Net = ₹${l * pr} − ₹${c} = ₹${net}`],
            [{ when: String(l * pr), explain: 'That is the sales. Subtract the fodder cost.' }], 0.001);
        }),
        matchT('match', 'activity to an example', [
          ['Dairy', 'Selling buffalo milk to the village centre'], ['Small-scale manufacturing', 'Making jaggery in a home unit'], ['Trade', 'Running a kirana shop'],
          ['Transport', 'Driving an auto to the mandal town'], ['Services', 'Running a mobile repair shop'], ['Farming', 'Growing paddy in the kharif season'],
        ], ['Farming is the only farm activity here.', 'Trade means buying and selling goods.']),
        mcq('nonfarm', 'Non-farm means anything except growing crops.', [
          ['Which is a NON-farm activity?', 'Running an autorickshaw', ['Sowing cotton', 'Harvesting paddy', 'Weeding a field'], 'Not growing crops.', 'Transport is a non-farm activity.'],
          ['Why are non-farm activities important in villages?', 'Land is limited and cannot employ everyone', ['Farming has stopped everywhere', 'Villages have no land', 'They need no money'], 'Fixed land, growing population.', 'Non-farm work absorbs people for whom there is no farm work.'],
          ['Small village shopkeepers usually buy their goods from…', 'Wholesale markets in nearby towns', ['Other villagers\' fields', 'Foreign countries directly', 'The village school'], 'They resell in the village.', 'They buy in bulk from town wholesalers.'],
          ['Self-help groups mainly help villagers by…', 'Providing small loans from members\' pooled savings', ['Building airports', 'Fixing crop prices', 'Running railways'], 'Members save together.', 'SHGs pool savings and lend to members at reasonable interest.'],
          ['Which is most needed for non-farm work to grow in a village?', 'Good roads, electricity and access to markets', ['More moneylenders', 'Fewer schools', 'Less credit'], 'How will goods reach buyers?', 'Infrastructure and markets let non-farm businesses sell.'],
          ['Making pottery at home with family labour is an example of…', 'Small-scale manufacturing', ['Large-scale industry', 'Dairy', 'Transport'], 'Small unit, simple tools.', 'Home-based production is small-scale manufacturing.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Globalisation
// =====================================================================================
const C9_GOODS: [string, number][] = [['toy car', 200], ['mobile charger', 400], ['pair of shoes', 1500], ['wrist watch', 800], ['bag of apples', 500], ['school bag', 600], ['electric fan', 1200]];

const ch9: USpec = {
  id: 'ts10.ss.ch9', subject: 'social', title: 'Globalisation', source: src(9),
  objectives: [
    {
      id: 'ts10.ss.glob.mnc', title: 'Multinational companies and the interlinking of production', prereqs: [],
      intro: [
        h('Whose phone is in your pocket?'),
        photo('⚙️', 'A single phone may be designed in one country, use chips from another, be assembled in India and sold all over the world.'),
        p('Look at the things around you: a phone, a pair of sports shoes, a packet of biscuits. Many are made by companies that work in many countries at once. The design may be done in the USA, parts made in Taiwan or China, assembly done in India, and customer support given from Hyderabad. Production is spread across the world and linked together.'),
        def('Multinational corporation (MNC)', 'A company that owns or controls production in more than one country.'),
        def('Investment', 'Money spent on assets such as land, buildings, machines and equipment. When an MNC makes such investment in another country it is called foreign investment.'),
        p('MNCs set up production where it is cheapest and close to markets. They look for skilled workers at low cost, a big market, good roads, ports and power, and government policies that welcome them.'),
        h('Three ways MNCs spread production'),
        stepsB(
          'Joint production with local companies: the MNC brings money and new technology; the local firm knows the market. (For example, a foreign car company came to India in the mid-1990s in partnership with an Indian company and built a plant near Chennai.)',
          'Buying up local companies: a rich MNC buys an Indian company and its brand, then expands it.',
          'Placing orders with small producers: big brands order garments, shoes or sports goods from small factories, which make them under the brand\'s name; the brand sets price, quality and delivery dates.',
        ),
        p('In this way, production in many countries becomes interlinked. A company that controls production in several countries can shift work from one place to another when costs change.'),
        keys('MNCs own or control production in more than one country.', 'They choose places with cheap skilled labour, markets and good infrastructure.', 'Ways: joint production, buying local firms, orders to small producers.', 'Result: production across countries becomes linked.'),
        remember('MNC = Multinational Corporation. Foreign investment = investment made by MNCs in another country.'),
        tip('When a question asks "how do MNCs control production?", list the three ways with one example each.'),
      ],
      examples: [
        ex('Why would an MNC set up a call centre in Hyderabad rather than in its home country?', ['Hyderabad has many English-speaking, educated young people.', 'Wages are lower than in developed countries.', 'Good telecom connectivity and government support make it easy to work with customers abroad.'], 'Cheaper skilled workers, good infrastructure and supportive policies'),
        ex('A big garment brand orders shirts from a small factory in Tiruppur. Who controls the production and how?', ['The brand decides design, quality, price and delivery date.', 'The small factory produces under those terms.', 'The brand sells the shirts abroad under its own name at a much higher price.'], 'The MNC brand controls production through orders and terms, without owning the factory'),
      ],
      practice: [
        mcq('mnc', 'Think about who owns or controls production, and where.', [
          ['An MNC is a company that…', 'Owns or controls production in more than one country', ['Sells only in its home country', 'Is owned by the government', 'Only exports raw materials'], 'Multi-national = many nations.', 'MNCs spread production across several countries.'],
          ['Which factor attracts MNCs to a country?', 'Skilled workers at low cost and a large market', ['High taxes on foreign firms', 'Poor roads and ports', 'Frequent power cuts'], 'What lowers costs and raises sales?', 'Cheap skilled labour, markets and good infrastructure attract MNCs.'],
          ['When an MNC buys an Indian company, this is an example of…', 'Spreading production by buying local firms', ['Placing orders with small producers', 'Trade barriers', 'Public distribution'], 'Ownership changes hands.', 'Buying local firms is one way MNCs expand.'],
          ['Money spent by an MNC on buildings and machines in another country is called…', 'Foreign investment', ['Foreign trade', 'Tariff', 'Subsidy'], 'Investment = assets.', 'Investment by MNCs abroad is foreign investment.'],
          ['A sports brand orders footballs from small units in Jalandhar. The brand controls…', 'Price, quality and delivery', ['Nothing at all', 'Only the workers\' wages', 'Only the raw materials'], 'Who sets the terms?', 'The brand fixes the terms; small units must meet them.'],
          ['In joint production, the MNC usually brings…', 'Money and new technology', ['Only land', 'Only workers', 'Only customers'], 'The local partner knows the market.', 'MNCs provide capital and technology; local firms provide local knowledge.'],
        ]),
        matchT('match', 'way of spreading production to its example', [
          ['Joint production', 'Foreign car firm and Indian partner build a plant together'], ['Buying local firms', 'An MNC purchases an Indian food brand'], ['Orders to small producers', 'A brand buys shirts made by small factories'],
          ['Foreign investment', 'MNC builds a new factory in India'], ['Interlinked production', 'Parts made in one country, assembled in another'],
        ], ['Look for the key verb: build together, purchase, order.', 'Interlinked = spread across countries.']),
        tapT('tap', 'Tap every factor that attracts an MNC to set up production in a place.', [
          ['Skilled workers at low wages', true], ['Large market nearby', true], ['Good roads, ports and power', true], ['Government policies welcoming investment', true],
          ['Frequent strikes and power cuts', false], ['Very high import and export restrictions', false], ['No trained workers', false],
        ], ['MNCs want low costs and big sales.', 'Problems raise costs.'], 'MNCs choose places with cheap skilled labour, markets, infrastructure and supportive policies.'),
      ],
    },
    {
      id: 'ts10.ss.glob.trade', title: 'Foreign trade, technology and trade liberalisation', prereqs: ['ts10.ss.glob.mnc'],
      intro: [
        h('Why are there foreign toys in a Hyderabad shop?'),
        photo('🚢', 'Container ships carry goods cheaply between ports across the world — one reason foreign goods reach Indian markets.'),
        p('For centuries, traders carried spices, cotton and silk across seas. Foreign trade lets producers sell beyond their own country and lets buyers choose from goods made elsewhere. When toys made abroad arrive in Indian shops at low prices, Indian toy makers must compete with them. Markets in different countries become connected.'),
        def('Foreign trade', 'Buying and selling of goods and services between countries. It connects markets in different countries.'),
        def('Globalisation', 'The process of rapid integration or interconnection between countries through trade, investment, technology and movement of people.'),
        h('Technology made it possible'),
        p('Faster and cheaper transport (containers, air cargo) and especially information and communication technology — computers, the internet, mobile phones, satellites — let companies coordinate work across continents instantly. A design made in London can be edited in Hyderabad the same night.'),
        h('Removing barriers'),
        def('Trade barrier', 'A restriction on foreign trade, such as a tax on imports (tariff) or a limit on the quantity that can be imported.'),
        def('Liberalisation', 'Removing barriers or restrictions set by the government on trade and investment.'),
        p('After independence, India protected its young industries with high trade barriers. In 1991, India began major economic reforms and removed many barriers on foreign trade and investment, so that Indian producers would compete with the world and improve quality.'),
        f('Price in India = Foreign price × (1 + tariff ÷ 100)', 'price in India equals foreign price times one plus tariff over one hundred'),
        xp({
          title: 'What if? The government changes the import tariff', formula: 'P = W × (1 + t/100)',
          res: ['P', 'Price of the imported good in India', '₹', 'W * (1 + t / 100)', 0],
          vars: [['W', 'Price of the good abroad (converted to ₹)', '₹', 50, 2000, 10, 400], ['t', 'Import tariff', '%', 0, 150, 5, 40]],
          notes: [
            ['t', 'A higher tax on imports makes foreign goods dearer, which protects local producers but reduces choice for buyers.', 'A lower tariff makes imports cheaper: buyers gain, but local producers face tougher competition.'],
            ['W', 'If the good costs more abroad, its price in India rises proportionally.', 'If the good becomes cheaper abroad, it becomes cheaper in India too.'],
          ],
          mistakes: [
            ['Adding the tariff percentage as rupees', 'A 40% tariff on ₹400 is ₹160, not ₹40. Find the percentage of the price.'],
            ['Thinking a tariff is paid by the foreign country', 'The import tax is collected at the border and ends up in the price paid by Indian buyers.'],
          ],
          real: 'If India cuts the tariff on imported toys, toy prices fall for buyers, but small toy makers may lose sales.',
        }),
        keys('Foreign trade connects markets across countries.', 'Cheaper transport and IT speeded up globalisation.', 'Trade barriers: tariffs and quotas; liberalisation removes them.', 'India liberalised trade and investment from 1991.'),
        remember('1991: India\'s new economic policy — liberalisation of trade and investment.'),
        tip('Liberalisation = "freeing" trade; a tariff = a "toll" on imports.'),
      ],
      examples: [
        ex('A toy costs ₹300 abroad. India puts a 50% tariff on toy imports. What will it cost in India (ignoring transport)?', ['Tariff = 50% of 300 = ₹150', 'Price in India = 300 + 150 = ₹450', 'Or: 300 × 1.5 = ₹450'], '₹450'),
        ex('How did information technology help a company in the USA get its accounts done by a firm in Hyderabad?', ['The documents are scanned and sent over the internet in minutes.', 'Workers in Hyderabad process them while it is night in the USA.', 'Results are emailed back by morning, saving time and money.'], 'The internet made instant, cheap communication possible, so services could be done from far away'),
      ],
      practice: [
        tp('tariff', (r) => {
          const [g, w] = r.pick(C9_GOODS);
          const t = r.pick([10, 20, 25, 40, 50, 60, 100]);
          const pr = rd(w * (1 + t / 100), 2);
          return numQ(`A ${g} costs ₹${w} abroad. India charges an import tariff of ${t}%. What is its price in India in ₹ (ignore transport)?`, pr, ['First find the tariff: t% of the foreign price.', `Tariff = ${t}/100 × ${w}; then add it to ${w}.`], [`Tariff = ${t}% of ${w} = ₹${rd((w * t) / 100, 2)}`, `Price = ${w} + ${rd((w * t) / 100, 2)} = ₹${pr}`], [{ when: String(w + t), explain: `The tariff is ${t} PERCENT of the price, not ₹${t}.` }, { when: String(rd((w * t) / 100, 2)), explain: 'That is just the tax. Add it to the foreign price.' }], 0.005, '₹');
        }),
        mcq('mcq', 'Think: barriers restrict, liberalisation removes.', [
          ['A tax on imports is called a…', 'Tariff', ['Subsidy', 'Quota', 'Dividend'], 'It is a type of trade barrier.', 'A tariff is a tax on imported goods.'],
          ['Removing government restrictions on trade and investment is called…', 'Liberalisation', ['Nationalisation', 'Protection', 'Rationing'], 'It "frees" trade.', 'Liberalisation removes barriers.'],
          ['In which year did India begin its major economic reforms?', '1991', ['1947', '1969', '2005'], 'Early 1990s.', 'India began liberalisation in 1991.'],
          ['Why did India put trade barriers after independence?', 'To protect young Indian industries from foreign competition', ['To stop all exports', 'Because the WTO forced it', 'To raise the price of food grains'], 'Industries were just starting.', 'Barriers protected infant domestic industries.'],
          ['Which technology most helped the spread of services across countries?', 'Information and communication technology (internet, telecom)', ['Bullock carts', 'Steam engines', 'Hand looms'], 'Think of emails and video calls.', 'IT lets services be produced and delivered from far away.'],
          ['Foreign trade results in…', 'Connecting markets in different countries', ['Closing all local markets', 'Stopping competition', 'Higher prices everywhere'], 'Buyers get more choice.', 'Foreign trade integrates markets across countries.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Tariff', 'Tax on imports'], ['Quota', 'Limit on quantity imported'], ['Liberalisation', 'Removing trade barriers'], ['Foreign trade', 'Buying and selling between countries'],
          ['Globalisation', 'Rapid integration of countries'], ['Container', 'Large box that makes shipping cheaper'],
        ], ['Tariff and quota are both barriers.', 'Globalisation is the overall process.']),
      ],
    },
    {
      id: 'ts10.ss.glob.wto', title: 'The WTO and global governance of trade', prereqs: ['ts10.ss.glob.trade'],
      intro: [
        h('Who makes the rules for world trade?'),
        photo('🌍', 'The World Trade Organisation has about 164 member countries that agree on rules for trade between them.'),
        p('If every country made its own rules, trade would be chaotic. After the Second World War, countries signed the General Agreement on Tariffs and Trade (GATT, 1947–48) to reduce trade barriers. In 1995 GATT was replaced by a permanent organisation — the World Trade Organisation (WTO), based in Geneva.'),
        def('World Trade Organisation (WTO)', 'An international organisation, set up in 1995, that makes and enforces rules for trade between its member countries and settles trade disputes.'),
        p('The WTO aims to liberalise trade: members should reduce tariffs and treat each other\'s goods fairly. India is a founding member. But many people ask whether the rules are fair.'),
        h('Is the playing field level?'),
        p('Developing countries have been pushed to cut trade barriers. Yet some developed countries continue to give large subsidies to their own farmers. Subsidised farm products can be sold cheaply in world markets, and farmers in poorer countries find it hard to compete. Developing countries, including India, have argued at the WTO for fairer rules, protection of food security and the right to support small farmers.'),
        def('Subsidy', 'Money or support given by a government to producers to lower their costs.'),
        stepsB('1947–48: GATT signed by 23 countries to cut tariffs after the Second World War.', '1986–1994: the Uruguay Round of talks extends trade rules to services, farming and intellectual property.', '1 January 1995: the WTO begins work in Geneva; India is a founding member.', '2001: the Doha round of talks begins, focusing on the needs of developing countries.'),
        keys('GATT (1947–48) → WTO (1995).', 'WTO: rules for trade, dispute settlement, liberalisation.', 'India is a founding member.', 'Debate: developed countries\' farm subsidies vs. demands of developing countries for fair rules.'),
        remember('WTO was set up on 1 January 1995; its headquarters is in Geneva, Switzerland.'),
        tip('In fairness questions, give one point from the developed-country view (open markets) and one from the developing-country view (food security, small farmers).'),
      ],
      examples: [
        ex('An American farmer receives a large subsidy and sells cotton cheaply in the world market. How does this affect a cotton farmer in Adilabad?', ['The subsidy lowers the American farmer\'s costs.', 'Cheap cotton lowers world prices.', 'The Adilabad farmer, with no such support, gets lower prices and may make a loss.'], 'He faces unfair competition and lower prices'),
        ex('Give one argument for and one against the WTO\'s push to cut trade barriers.', ['For: lower barriers give consumers cheaper, varied goods and push producers to improve quality.', 'Against: poorer countries\' small producers may be wiped out, while rich countries keep their own subsidies.'], 'It can widen choice and efficiency, but the rules may favour rich countries'),
      ],
      practice: [
        mcq('mcq', 'Recall the year, the city and the aim.', [
          ['The WTO was established in…', '1995', ['1947', '1991', '1919'], 'It replaced GATT.', 'The WTO began on 1 January 1995.'],
          ['The WTO\'s headquarters is in…', 'Geneva', ['New York', 'Washington', 'Paris'], 'A Swiss city.', 'The WTO is based in Geneva, Switzerland.'],
          ['The main aim of the WTO is to…', 'Liberalise international trade through agreed rules', ['Lend money to poor countries', 'Run the United Nations', 'Fix the price of oil'], 'It is about trade.', 'WTO sets and enforces trade rules and promotes freer trade.'],
          ['Which agreement came before the WTO?', 'GATT', ['NATO', 'SAARC', 'OPEC'], 'General Agreement on …', 'GATT (General Agreement on Tariffs and Trade) preceded the WTO.'],
          ['Why do developing countries say WTO rules are unfair?', 'Developed countries still give large subsidies to their own farmers', ['Developing countries have no exports', 'The WTO bans all trade', 'Only developing countries pay tariffs'], 'Think about farm support.', 'Rich-country subsidies make it hard for poor farmers to compete.'],
          ['Settling disputes between member countries over trade is done by…', 'The WTO', ['The World Health Organisation', 'Interpol', 'The UN Security Council'], 'It is a trade body.', 'The WTO has a dispute-settlement system.'],
        ]),
        orderT('order', 'Put these steps of a typical trade dispute at the WTO in order.', [
          'Country A puts a high barrier on goods from Country B', 'Country B complains that the barrier breaks WTO rules', 'A WTO panel examines the complaint', 'The panel gives its ruling', 'The losing country is asked to change its policy',
        ], ['The barrier comes first, the complaint next.', 'Changing the policy is the outcome.'], 'Barrier → complaint → panel examination → ruling → policy change.'),
        tapT('tap', 'Tap every TRUE statement about the WTO.', [
          ['It was set up in 1995', true], ['India is a member', true], ['It makes rules for international trade', true], ['It settles trade disputes', true],
          ['It replaced the United Nations', false], ['It gives loans to farmers', false], ['It has its headquarters in New Delhi', false],
        ], ['WTO deals only with trade.', 'Geneva, not New Delhi.'], 'The WTO (1995, Geneva) makes trade rules and settles disputes; India is a member.'),
      ],
    },
    {
      id: 'ts10.ss.glob.impact', title: 'Impact of globalisation on India and the struggle for fair globalisation', prereqs: ['ts10.ss.glob.wto'],
      intro: [
        h('Winners and losers'),
        photo('🏢', 'Hyderabad\'s IT and pharmaceutical companies have grown by serving customers all over the world.'),
        p('Globalisation has affected Indians very differently. Shoppers in cities have more choice — many brands of phones, cars and clothes, often of better quality and lower price. Indian companies have gained too: some have become multinationals themselves, buying companies abroad. IT and pharmaceutical firms in Hyderabad and Bengaluru export services and medicines worldwide, creating many jobs.'),
        p('But small producers have faced tough competition. Makers of batteries, plastics, toys, tyres and dairy products have shut down or lost business when cheaper imports arrived. Many workers now have "flexible" jobs: short contracts, long hours and no security, because employers want to cut costs to compete globally.'),
        def('Fair globalisation', 'Globalisation that creates opportunities for all and makes sure its benefits are better shared, with protection for workers and small producers.'),
        stepsB(
          'Government ensures labour laws are followed so workers get their rights.',
          'Support small producers with credit, technology and markets until they can compete.',
          'Use trade barriers carefully where needed to protect livelihoods.',
          'Negotiate at the WTO for fairer rules.',
          'People\'s organisations and unions raise their voice for fair treatment.',
        ),
        keys('Benefits: more choice for consumers, new jobs, Indian firms going global, foreign investment.', 'Costs: small producers hit by competition, insecure "flexible" jobs.', 'Benefits have reached mainly the well-off and skilled.', 'Fair globalisation needs government policy and people\'s action.'),
        remember('Globalisation has not benefited everyone equally — educated, skilled and well-off people gained most.'),
        tip('A balanced answer gives at least two benefits AND two problems.'),
      ],
      examples: [
        ex('A small toy maker in Kondapalli finds his sales falling after cheap imported toys arrive. Explain why and suggest one remedy.', ['Imported toys may be cheaper because of large-scale production abroad.', 'Buyers shift to the cheaper toys, so his sales fall.', 'Remedy: government credit, design support and marketing (or careful use of tariffs) to help local artisans compete.'], 'Competition from cheap imports; support with credit, design and markets'),
        ex('Why do some garment exporters employ workers only on short contracts?', ['Global buyers demand low prices and quick delivery.', 'To cut costs, exporters avoid permanent jobs and benefits.', 'Workers lose security, paid leave and fair wages.'], 'To cut costs under global competition, at the expense of job security'),
      ],
      practice: [
        tapT('tap', 'Tap every BENEFIT of globalisation for India.', [
          ['More variety of goods for consumers', true], ['New jobs in IT and services', true], ['Some Indian companies became multinationals', true], ['Foreign investment in new industries', true],
          ['Small toy makers losing business', false], ['Insecure short-term contracts for workers', false], ['Closure of small battery units', false],
        ], ['Benefits help consumers, workers or firms gain.', 'Closures and insecure jobs are costs.'], 'Choice, jobs, global Indian firms and investment are benefits; closures and insecurity are costs.'),
        mcq('mcq', 'Weigh both sides: who gains, who loses?', [
          ['Who has benefited MOST from globalisation in India?', 'Well-off, educated and skilled people', ['Small farmers everywhere', 'Small toy makers', 'Daily-wage labourers'], 'Who can use new opportunities?', 'Skilled and well-off people captured most of the gains.'],
          ['"Flexible" labour laws in practice often mean…', 'Short contracts, long hours and less job security', ['More paid holidays', 'Guaranteed pensions', 'Shorter working days'], 'Employers want to cut costs.', 'Workers are hired and fired more easily with fewer benefits.'],
          ['Which industry in India was hit hard by competition from imports?', 'Small-scale toys and batteries', ['Software services', 'Pharmaceutical exports', 'Mobile services'], 'Small units with old technology.', 'Small producers of toys, batteries, tyres and dairy faced severe competition.'],
          ['Fair globalisation means…', 'Opportunities for all and fairer sharing of benefits', ['Stopping all trade', 'Only MNCs should gain', 'Banning technology'], 'It is about fairness.', 'Fair globalisation spreads benefits and protects the weak.'],
          ['Which step can government take for fair globalisation?', 'Enforce labour laws and support small producers', ['Remove all labour laws', 'Ban Indian exports', 'Close schools'], 'Protect workers and small firms.', 'Enforcing rights and supporting small producers make globalisation fairer.'],
          ['An example of an Indian company going global is…', 'An Indian company buying a firm abroad', ['A village shop selling local vegetables', 'A kirana store opening a new branch nearby', 'A farmer buying seeds'], 'Global = in many countries.', 'Some Indian firms have bought companies abroad and become MNCs.'],
        ]),
        matchT('match', 'group to how globalisation affected it', [
          ['Urban consumers', 'More choice and often lower prices'], ['IT professionals', 'New well-paid jobs'], ['Small toy makers', 'Lost sales to cheap imports'],
          ['Garment workers', 'Insecure short-term contracts'], ['Large Indian companies', 'Expanded abroad, some became MNCs'],
        ], ['Some groups gained, others lost.', 'Workers felt the pressure of cost-cutting.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Food Security
// =====================================================================================
const ch10: USpec = {
  id: 'ts10.ss.ch10', subject: 'social', title: 'Food Security', source: src(10),
  objectives: [
    {
      id: 'ts10.ss.food.availability', title: 'Availability of foodgrains: production, buffer stock and MSP', prereqs: [],
      intro: [
        h('Enough food for everyone — from where?'),
        photo('🌾', 'Paddy fields in the Godavari and Krishna command areas help make Telangana one of India\'s large rice-producing states.'),
        p('A country is food secure only if there is enough food, if everyone can reach it, and if everyone can afford it. In the 1960s India depended on food imports and faced shortages. Then came the Green Revolution — high-yielding seeds, fertilisers, irrigation and assured prices — and wheat and rice production jumped. Today India produces over 300 million tonnes of foodgrains a year and is among the world\'s biggest producers of rice and wheat.'),
        def('Food security', 'A situation when all people, at all times, have enough food that is available, accessible and affordable for an active and healthy life.'),
        def('Minimum Support Price (MSP)', 'A price announced by the government before the sowing season at which it promises to buy certain crops from farmers, so that they are protected from a crash in prices.'),
        def('Buffer stock', 'The stock of foodgrains (mainly wheat and rice) bought by the government through the Food Corporation of India (FCI) and stored to use in times of shortage and for the PDS.'),
        stepsB(
          'Government announces the MSP for paddy and wheat.',
          'FCI and state agencies buy grain from farmers at MSP in surplus areas.',
          'The grain is stored in godowns as buffer stock.',
          'It is distributed through ration shops (PDS) and released in times of shortage.',
        ),
        h('How much food per person?'),
        p('Production alone does not tell us whether people have enough. Divide by population and by 365 days to get the grain available per person per day. Not all of it reaches plates — some is used as seed or feed, and some is wasted.'),
        f('Availability per person per day (g) = Production ÷ (Population × 365)', 'grams per person per day equals production divided by population times 365'),
        xp({
          title: 'What if? Production and population change', formula: 'A = Q × 10¹² ÷ (P × 10⁷ × 365)',
          res: ['A', 'Foodgrain available per person per day', 'g', 'Q * 1000000000000 / (P * 10000000 * 365)', 0],
          vars: [['Q', 'Foodgrain production', 'million tonnes', 50, 400, 5, 300], ['P', 'Population', 'crore', 30, 160, 1, 140]],
          notes: [
            ['Q', 'More grain for the same number of people means more for each person every day.', 'A bad monsoon year cuts production, so each person\'s share falls unless buffer stocks are released.'],
            ['P', 'More mouths share the same grain, so each person gets less. Production must keep pace with population.', 'Fewer people sharing the grain means a bigger share each.'],
          ],
          mistakes: [
            ['Forgetting to divide by 365', 'Annual production must be divided by 365 to find the daily amount.'],
            ['Assuming everyone gets the average', 'Availability is an average; poor families may still not be able to buy enough — that is the problem of access.'],
          ],
          real: 'Around 1950 India produced about 50 million tonnes for about 36 crore people — roughly 380 g per person per day. Production has grown much faster since.',
        }),
        keys('Food security = availability + accessibility + affordability.', 'Green Revolution (1960s) raised wheat and rice output.', 'MSP protects farmers; FCI buys and stores the buffer stock.', 'Per-person availability = production ÷ (population × 365).'),
        remember('FCI: Food Corporation of India (set up in 1965) procures and stores grain. MSP is announced before sowing.'),
        tip('Three As of food security: Available, Accessible, Affordable.'),
      ],
      examples: [
        ex('If India produces 330 million tonnes of foodgrains and has 140 crore people, about how much grain is available per person per day?', ['330 million tonnes = 330 × 10¹² g', '140 crore = 1.4 × 10⁹ people', 'Per day: 330 × 10¹² ÷ (1.4 × 10⁹ × 365) ≈ 646 g'], 'About 646 g per person per day (an average; not all is eaten as food)'),
        ex('Why does the government buy grain at MSP and keep a buffer stock?', ['MSP: farmers get a fair, assured price even when markets fall, so they keep growing food.', 'Buffer stock: grain is available for ration shops and for droughts or floods.'], 'To protect farmers\' income and to have grain for the poor and for emergencies'),
      ],
      practice: [
        tp('avail', (r) => {
          const q = r.pick([150, 200, 250, 300, 330, 365]);
          const pop = r.pick([50, 80, 100, 125, 140]);
          const a = rd((q * 1e12) / (pop * 1e7 * 365), 0);
          return numQ(`Illustrative: a country produces ${q} million tonnes of foodgrains a year for ${pop} crore people. About how many grams are available per person per day? (round to the nearest gram)`, a, ['Convert: 1 million tonnes = 10¹² g; 1 crore = 10⁷ people.', `Grams per day = ${q} × 10¹² ÷ (${pop} × 10⁷ × 365)`], [`Per person per year = ${q} × 10¹² ÷ ${pop} × 10⁷ = ${rd((q * 1e12) / (pop * 1e7), 0)} g`, `Per day = ÷ 365 ≈ ${a} g`], [{ when: String(rd((q * 1e12) / (pop * 1e7), 0)), explain: 'That is per year. Divide by 365 for per day.' }], 0.01);
        }, 2),
        mcq('mcq', 'Recall MSP, FCI and buffer stock.', [
          ['Food security means food is…', 'Available, accessible and affordable to all at all times', ['Grown only by the government', 'Imported from abroad', 'Free for everyone'], 'Three As.', 'All three conditions must hold for all people at all times.'],
          ['The price at which the government promises to buy crops from farmers is the…', 'Minimum Support Price', ['Issue price', 'Market price', 'Maximum retail price'], 'It "supports" farmers.', 'MSP gives farmers an assured minimum price.'],
          ['Grain stored by the government for emergencies and the PDS is the…', 'Buffer stock', ['Seed bank', 'Export stock', 'Reserve currency'], 'It acts as a cushion.', 'The buffer stock protects against shortages.'],
          ['Which organisation buys and stores foodgrains for the government?', 'Food Corporation of India', ['World Trade Organisation', 'Reserve Bank of India', 'NABARD'], 'FCI.', 'The FCI procures grain and maintains buffer stocks.'],
          ['The Green Revolution of the 1960s mainly increased production of…', 'Wheat and rice', ['Pulses and oilseeds', 'Tea and coffee', 'Cotton and jute'], 'Two cereals.', 'High-yielding varieties boosted wheat and rice.'],
          ['If population grows faster than foodgrain production, per-person availability…', 'Falls', ['Rises', 'Stays the same', 'Doubles'], 'More people share the grain.', 'Availability per person = production ÷ population falls.'],
        ]),
        orderT('order', 'Put the journey of grain from farm to ration shop in order.', [
          'Government announces MSP before sowing', 'Farmer harvests and sells paddy at MSP', 'FCI / state agency stores it in godowns', 'Grain is allotted to states for PDS', 'Ration shop sells it to cardholders',
        ], ['MSP comes before sowing.', 'The ration shop is the last link.'], 'MSP → harvest and procurement → storage → allotment → ration shop.'),
      ],
    },
    {
      id: 'ts10.ss.food.access', title: 'Access to food: PDS, ration cards and food schemes', prereqs: ['ts10.ss.food.availability'],
      intro: [
        h('The ration shop at the end of your street'),
        photo('🏪', 'A fair price (ration) shop sells rice, wheat and some other items at low prices to families with ration cards.'),
        p('Even when godowns are full, a poor family may go hungry if it cannot afford food. That is the problem of access. India\'s answer is the Public Distribution System (PDS): a network of over five lakh fair price shops that sell foodgrains at low or no cost to eligible families.'),
        def('Public Distribution System (PDS)', 'The system through which the government distributes foodgrains procured by FCI to people through ration (fair price) shops at subsidised prices.'),
        def('Ration card', 'A card issued by the state government that identifies a family\'s eligibility and allows it to buy grain from the ration shop.'),
        def('National Food Security Act (NFSA), 2013', 'A law that gives a legal right to subsidised foodgrains to up to 75% of the rural and 50% of the urban population — 5 kg per person per month for priority households, and 35 kg per household per month for the poorest (Antyodaya) families.'),
        stepsB('1960s: Green Revolution raises wheat and rice production.', '1965: Food Corporation of India set up.', '1997: Targeted PDS gives more grain to poor families.', '2000: Antyodaya Anna Yojana for the poorest households.', '2013: National Food Security Act makes subsidised grain a legal right.'),
        h('Other food schemes'),
        p('Children get hot cooked meals at school under the mid-day meal programme (now PM POSHAN). Anganwadi centres under ICDS give nutrition to young children, pregnant women and nursing mothers. Telangana also distributes rice to card-holding families through its ration shops.'),
        h('Problems and fixes'),
        p('PDS has faced problems: poor-quality grain, shops opening irregularly, leakage of grain to the open market, and eligible families left out. Reforms such as linking ration cards to biometric identification, computerised records and "One Nation One Ration Card" (buy your ration anywhere in India) aim to make it fairer, especially for migrant workers.'),
        keys('Access means people can obtain and afford food.', 'PDS distributes subsidised grain through fair price shops.', 'NFSA 2013 made food a legal right for a large part of the population.', 'Mid-day meals and anganwadis support children and mothers.'),
        remember('NFSA 2013: 5 kg grain per person per month (priority households); 35 kg per household per month (Antyodaya Anna Yojana).'),
        tip('PDS answers should mention one strength (reaches the poor, stabilises prices) and one weakness (leakage, quality).'),
      ],
      examples: [
        ex('A priority household under NFSA has 6 members. How much grain is it entitled to per month?', ['Priority households get 5 kg per person per month.', '6 × 5 = 30 kg'], '30 kg per month'),
        ex('Imran migrates from Bihar to work in Hyderabad. How does "One Nation One Ration Card" help him?', ['Earlier he could only use his ration card in his home state.', 'Now his card is portable: he can buy his entitled grain at a ration shop in Hyderabad.', 'His family back home can also draw their share.'], 'He can get subsidised grain wherever he works'),
      ],
      practice: [
        tp('nfsa', (r) => {
          const n = r.int(2, 9);
          const aay = r.next() < 0.3;
          if (aay) return numQ(`An Antyodaya (AAY) family of ${n} members gets its NFSA entitlement for 3 months. How many kg of grain is that?`, 105, ['AAY families get a fixed amount per HOUSEHOLD, not per person.', '35 kg per month × 3 months.'], ['35 kg per household per month', '35 × 3 = 105 kg (family size does not matter for AAY)'], [{ when: String(n * 5 * 3), explain: 'That uses the per-person rule. AAY households get a fixed 35 kg per month.' }]);
          return numQ(`A priority household of ${n} members gets 5 kg per person per month under NFSA. How many kg does it get in a month?`, n * 5, ['Multiply the number of members by 5 kg.', `${n} × 5`], [`${n} × 5 = ${n * 5} kg per month`], [{ when: '35', explain: '35 kg is for Antyodaya households. Priority households get 5 kg per person.' }]);
        }),
        mcq('mcq', 'PDS is about access and affordability.', [
          ['The PDS distributes grain through…', 'Fair price (ration) shops', ['Supermarkets only', 'Exports', 'Private traders at market price'], 'Subsidised shops.', 'Ration shops sell grain at subsidised prices.'],
          ['The National Food Security Act was passed in…', '2013', ['1965', '2000', '1991'], 'Early 2010s.', 'NFSA became law in 2013.'],
          ['Antyodaya Anna Yojana (2000) targets…', 'The poorest of the poor households', ['Large farmers', 'Government employees', 'Exporters'], 'Antyodaya = rise of the last person.', 'AAY gives highly subsidised grain to the poorest families.'],
          ['Which is a common problem of PDS?', 'Leakage of grain to the open market', ['Too few godowns are needed', 'Grain is too cheap for farmers to grow', 'It only works in cities'], 'Grain goes missing.', 'Diversion of PDS grain to the open market has been a major problem.'],
          ['"One Nation One Ration Card" mainly helps…', 'Migrant workers get rations wherever they live', ['Exporters sell abroad', 'Farmers get MSP', 'Shops raise prices'], 'Portability.', 'It lets cardholders draw rations in any state.'],
          ['Hot cooked meals for children in government schools come under…', 'Mid-day meal / PM POSHAN', ['MGNREGA', 'MSP', 'WTO'], 'Served at school.', 'The mid-day meal programme (PM POSHAN) feeds schoolchildren.'],
        ]),
        matchT('match', 'scheme to what it provides', [
          ['PDS', 'Subsidised grain through ration shops'], ['NFSA 2013', 'Legal right to subsidised foodgrains'], ['Antyodaya Anna Yojana', '35 kg per month for the poorest households'],
          ['Mid-day meal (PM POSHAN)', 'Hot meals for schoolchildren'], ['ICDS anganwadi', 'Nutrition for young children and mothers'], ['MSP', 'Assured price for farmers'],
        ], ['Schemes for children: school vs. anganwadi.', 'MSP is for farmers, not consumers.']),
      ],
    },
    {
      id: 'ts10.ss.food.nutrition', title: 'Nutrition status: calories, malnutrition and a balanced diet', prereqs: ['ts10.ss.food.access'],
      intro: [
        h('Full stomach, empty plate of nutrients'),
        photo('🥛', 'Milk, pulses, eggs, vegetables and fruit add protein, vitamins and minerals to a rice-based diet.'),
        p('Food security is not only about filling the stomach. A child who eats only rice may not feel hungry but may still lack protein, iron and vitamins. That child may grow up shorter, fall ill more often and find it hard to concentrate in class.'),
        def('Calorie', 'A unit of energy that food gives the body.'),
        def('Calorie norm', 'The energy an average person needs per day. India has long used about 2,400 calories per person per day in rural areas and 2,100 in urban areas as the measure for food poverty.'),
        def('Malnutrition', 'A condition caused by eating too little, too much, or the wrong kinds of food, so that the body does not get the nutrients it needs.'),
        p('Health surveys such as the National Family Health Survey (NFHS) measure children\'s nutrition by checking weight and height.'),
        def('Stunting', 'Being too short for one\'s age — a sign of long-term undernutrition.'),
        def('Wasting', 'Being too thin for one\'s height — a sign of recent, acute undernutrition.'),
        def('Anaemia', 'Too little haemoglobin in the blood, often caused by lack of iron; it causes tiredness and weakness. It is common among women and children in India.'),
        p('Over the years, Indians have been eating less of coarse grains like jowar and ragi and pulses, partly because PDS mostly supplies rice and wheat. Millets are nutritious and need less water, so many states, including Telangana, now encourage them again. 2023 was declared the International Year of Millets by the UN on India\'s proposal.'),
        bars(['Cereals', 'Pulses', 'Milk', 'Vegetables & fruit', 'Oils & fats'], [45, 10, 15, 20, 10], '% of plate', 'An illustrative balanced plate: cereals about half, with pulses, milk, vegetables and fruit and some fats.'),
        keys('Nutrition, not just calories, decides health.', 'Calorie norms: about 2,400 (rural) and 2,100 (urban) per person per day.', 'Stunting = short for age; wasting = thin for height; anaemia = lack of iron.', 'A diverse diet with pulses, millets, milk, vegetables and fruit prevents malnutrition.'),
        remember('Stunting = low height-for-age (long-term). Wasting = low weight-for-height (short-term). 2023 = International Year of Millets.'),
        tip('Remember: Stunting — Short; Wasting — Weight.'),
      ],
      examples: [
        ex('A rural adult eats food giving 1,950 calories a day. Using the rural norm, how many calories short is he?', ['Rural norm = 2,400 calories', 'Shortfall = 2,400 − 1,950 = 450 calories'], '450 calories per day short of the norm'),
        ex('A 5-year-old\'s height is normal for her age but she is very thin for her height. Is she stunted or wasted? What does that suggest?', ['Height for age is normal → not stunted.', 'Weight for height is low → wasted.', 'Wasting shows recent undernutrition, e.g. after illness or a food shortage.'], 'Wasted — a sign of recent undernutrition'),
      ],
      practice: [
        tp('cal', (r) => {
          const rural = r.next() < 0.5;
          const norm = rural ? 2400 : 2100;
          const eat = norm - r.pick([150, 200, 250, 300, 400, 500, 600]);
          return numQ(`An ${rural ? 'adult in a village' : 'adult in a city'} gets ${eat} calories a day. Using the ${rural ? 'rural' : 'urban'} norm, how many calories short is the diet?`, norm - eat, [`The ${rural ? 'rural' : 'urban'} norm is ${norm} calories.`, `Subtract ${eat} from ${norm}.`], [`${norm} − ${eat} = ${norm - eat} calories`], [{ when: String((rural ? 2100 : 2400) - eat), explain: `You used the ${rural ? 'urban' : 'rural'} norm. This person lives in a ${rural ? 'village' : 'city'}.` }]);
        }),
        matchT('match', 'term to its meaning', [
          ['Stunting', 'Too short for age'], ['Wasting', 'Too thin for height'], ['Anaemia', 'Lack of haemoglobin, often from low iron'], ['Calorie', 'Unit of energy from food'],
          ['Malnutrition', 'Body not getting the nutrients it needs'], ['Millets', 'Nutritious grains like jowar and ragi'],
        ], ['Stunting and Short both start with S-h sounds.', 'Anaemia is about blood.']),
        mcq('mcq', 'Think of energy vs. nutrients.', [
          ['The calorie norm long used for rural India is about…', '2,400 calories per person per day', ['2,100', '1,500', '3,500'], 'Higher than urban.', 'Rural people do more physical work, so the norm is 2,400.'],
          ['Which survey measures nutrition of children in India?', 'National Family Health Survey', ['Census of Agriculture', 'Economic Survey of trade', 'Electoral roll'], 'NFHS.', 'NFHS collects data on health and nutrition.'],
          ['Anaemia is mainly caused by lack of…', 'Iron', ['Calcium', 'Vitamin C only', 'Salt'], 'Haemoglobin needs it.', 'Iron deficiency is the main cause of anaemia.'],
          ['Why are millets being encouraged again?', 'They are nutritious and need less water', ['They are imported cheaply', 'They grow only in cities', 'They have no nutrients'], 'Good for dry regions.', 'Millets give good nutrition and suit dry areas like much of Telangana.'],
          ['A person can be well-fed in calories yet malnourished because…', 'The diet may lack protein, vitamins and minerals', ['Calories are bad', 'Rice has no energy', 'Water has calories'], 'Variety matters.', 'Malnutrition includes lack of nutrients, not just energy.'],
          ['Which year was declared the International Year of Millets?', '2023', ['2013', '2000', '1991'], 'Recent year.', 'The UN declared 2023 the International Year of Millets.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Sustainable Development with Equity
// =====================================================================================
const ch11: USpec = {
  id: 'ts10.ss.ch11', subject: 'social', title: 'Sustainable Development with Equity', source: src(11),
  objectives: [
    {
      id: 'ts10.ss.sus.environment', title: 'Environment and development: when growth uses up nature', prereqs: [],
      intro: [
        h('The bore well that kept going deeper'),
        photo('💧', 'Groundwater pumped from bore wells irrigates much of Telangana\'s farmland. When pumping exceeds recharge, the water table falls.'),
        p('Twenty years ago, a farmer in a dry mandal could find water at 50 feet. Today he may have to drill 300 feet or more, and some wells have failed. This is a story told in many villages. Development — more crops, more factories, more cities — depends on nature: water, soil, forests, clean air, fish in the sea. If we use these faster than they renew, development itself becomes impossible.'),
        def('Environment', 'The natural surroundings — land, water, air, forests, animals — on which all life and economic activity depend.'),
        def('Renewable resource', 'A resource that nature replenishes, like groundwater or forests — but only if we do not use it faster than it is renewed.'),
        def('Non-renewable resource', 'A resource that is used up and cannot be replaced in human time, like coal, oil and minerals.'),
        p('Examples of environmental damage from development: falling water tables from over-pumping; rivers polluted by untreated sewage and industrial waste near cities; forests cleared for mines and dams; soil made salty or poisoned by excess fertilisers and pesticides; over-fishing that empties seas. The costs often fall on poor people who depend directly on nature — farmers, fisherfolk, Adivasis.'),
        f('Change in groundwater = Recharge − Extraction', 'change in groundwater equals recharge minus extraction'),
        xp({
          title: 'What if? Pumping vs. rain recharge in a village', formula: 'ΔG = R − E',
          res: ['ΔG', 'Yearly change in groundwater stored', 'ha-m', 'R - E', 0],
          vars: [['R', 'Recharge from rain and tanks', 'ha-m', 0, 400, 10, 200], ['E', 'Water pumped out (extraction)', 'ha-m', 0, 400, 10, 260]],
          notes: [
            ['R', 'More rain soaks in (for example after restoring village tanks or building check dams), so the store rises.', 'A drought or paved-over land lets less water seep in, so the store shrinks.'],
            ['E', 'More bore wells or water-hungry crops pull out more water; if extraction beats recharge the water table falls every year.', 'Drip irrigation or less thirsty crops reduce pumping, letting the store recover.'],
          ],
          mistakes: [
            ['Thinking groundwater is unlimited because it is renewable', 'It is renewable only up to the recharge rate. Pump more than that and the store runs down.'],
            ['Judging by one wet year', 'A good monsoon may refill wells, but if extraction exceeds recharge on average, the long-term trend is still down.'],
          ],
          real: 'Telangana\'s Mission Kakatiya (begun in 2015) restored thousands of old village tanks to increase recharge and store rainwater.',
        }),
        keys('All development depends on natural resources.', 'Over-use and pollution damage the base of future development.', 'Renewable resources stay renewable only if use ≤ renewal.', 'The poor who depend on nature suffer most from environmental damage.'),
        remember('If extraction > recharge, the water table falls. Restoring tanks and check dams increases recharge.'),
        tip('In answers, link a development activity → environmental cost → who is affected.'),
      ],
      examples: [
        ex('A village gets 180 hectare-metres of recharge a year but pumps out 240. What happens to its groundwater, and what could it do?', ['Change = 180 − 240 = −60 ha-m per year.', 'The store falls every year; wells go deeper and some fail.', 'Remedies: restore tanks, build check dams (more recharge); drip irrigation, less thirsty crops (less extraction).'], 'Groundwater falls by 60 ha-m a year; increase recharge and reduce pumping'),
        ex('A factory saves money by dumping untreated waste into a stream. Who pays the real cost?', ['Downstream farmers get polluted irrigation water and lower yields.', 'Fisherfolk lose fish; villagers face illness.', 'The factory\'s profit is made by shifting the cost onto others and onto nature.'], 'Farmers, fisherfolk and villagers downstream — and future generations'),
      ],
      practice: [
        tp('gw', (r) => {
          const R = r.pick([120, 150, 180, 200, 240, 300]);
          const E = R + r.pick([-60, -30, 20, 40, 60, 90, 120]);
          const d = R - E;
          return numQ(`A watershed gets ${R} ha-m of recharge a year and ${E} ha-m is pumped out. What is the yearly change in stored groundwater (ha-m)? Use a minus sign if it falls.`, d, ['Change = recharge − extraction.', `${R} − ${E}`], [`${R} − ${E} = ${d} ha-m`, d < 0 ? 'Negative: the water table is falling — unsustainable.' : 'Positive: the store is recovering.'], [{ when: String(-d), explain: 'Check the sign: change = recharge MINUS extraction.' }], 0.001);
        }),
        tapT('tap', 'Tap every example of development harming the environment.', [
          ['Pumping groundwater faster than it is recharged', true], ['Untreated sewage flowing into rivers', true], ['Clearing forests for mining without replanting', true], ['Over-fishing with fine nets', true], ['Excess use of chemical fertilisers', true],
          ['Restoring village tanks', false], ['Rainwater harvesting', false], ['Drip irrigation', false],
        ], ['Does the activity use up or pollute a resource?', 'Tank restoration and harvesting add water back.'], 'Over-pumping, pollution, deforestation, over-fishing and excess chemicals harm nature; the others conserve it.'),
        mcq('mcq', 'Is the resource being used faster than nature renews it?', [
          ['Which is a non-renewable resource?', 'Coal', ['Groundwater', 'Forests', 'Fish'], 'Formed over millions of years.', 'Coal cannot be replaced within human time.'],
          ['Groundwater remains renewable only if…', 'Extraction does not exceed recharge', ['Bore wells are made deeper', 'Rice is grown everywhere', 'Rivers are polluted'], 'Balance in and out.', 'Using more than recharge depletes the store.'],
          ['Who are usually hit hardest by environmental damage?', 'Poor people who depend directly on nature', ['Owners of big factories', 'City office workers', 'Foreign tourists'], 'Farmers, fisherfolk, Adivasis.', 'They lose their livelihoods when resources are destroyed.'],
          ['Telangana\'s Mission Kakatiya aims to…', 'Restore old village tanks', ['Build new airports', 'Export rice', 'Mine coal'], 'Named after the Kakatiya dynasty that built tanks.', 'It revives traditional tanks to store rainwater and recharge groundwater.'],
          ['Why is excessive use of chemical fertilisers harmful?', 'It damages soil health and pollutes water', ['It increases rainfall', 'It makes soil more fertile forever', 'It reduces costs permanently'], 'Think long term.', 'Over-use degrades soil and runs off into water bodies.'],
          ['Over-fishing leads to…', 'Fewer fish in future and loss of livelihoods', ['More fish next year', 'Cleaner seas', 'Higher rainfall'], 'Fish need time to breed.', 'Catching too many fish leaves too few to breed.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.sus.alternatives', title: 'Alternatives: sustainable agriculture and non-pesticide farming', prereqs: ['ts10.ss.sus.environment'],
      intro: [
        h('A village that gave up pesticides'),
        photo('🌱', 'Farmers using natural pest control: neem, chilli-garlic sprays, bird perches and trap crops instead of chemical pesticides.'),
        p('In the 1990s many cotton farmers in our region sprayed large amounts of chemical pesticides. Costs rose, pests became resistant, farmers fell ill, and many fell into debt. Some villages tried another way. Punukula, a village in Khammam district, became widely known in the early 2000s for switching to non-pesticide management with the help of local organisations: farmers learned about pest life-cycles and used neem extracts, light traps, trap crops and bird perches. Costs fell, health improved and yields held up.'),
        def('Sustainable agriculture', 'Farming that produces food and income today while protecting soil, water, biodiversity and farmers\' health for the future.'),
        def('Non-Pesticide Management (NPM)', 'Controlling pests through knowledge of their life cycle and natural methods (neem, traps, trap crops, birds) instead of chemical pesticides.'),
        def('Organic farming', 'Farming without synthetic fertilisers and pesticides, using compost, green manure, crop rotation and biological pest control.'),
        stepsB(
          'Farmers meet and study which pests attack their crop and when.',
          'They use natural sprays (neem seed extract, chilli-garlic) at the right stage.',
          'They put up light traps, pheromone traps and bird perches, and sow trap crops on field borders.',
          'They build soil health with compost and crop rotation.',
          'Savings on chemicals reduce debt; health and the local environment improve.',
        ),
        bars(['Chemical-heavy', 'NPM'], [100, 40], 'cost index', 'Illustrative comparison of plant-protection costs per acre: if chemical-heavy spraying costs 100, NPM might cost around 40. Actual savings vary from village to village.'),
        p('Other alternatives include drip and sprinkler irrigation, growing millets and pulses in dry areas, watershed development, and farmer collectives that share knowledge and market produce together.'),
        keys('Chemical-heavy farming raised costs, debt, pest resistance and health problems.', 'NPM and organic farming use natural methods and local knowledge.', 'Sustainable agriculture protects soil, water and health while giving income.', 'Community action and knowledge-sharing are key.'),
        remember('Punukula (Khammam district) is a well-known example of non-pesticide management.'),
        tip('NPM = knowledge instead of chemicals.'),
      ],
      examples: [
        ex('List two costs of heavy pesticide use and two benefits of NPM.', ['Costs: high spending and debt; pests become resistant; farmers and soil are poisoned.', 'Benefits of NPM: lower costs; better health; safer water and soil; helpful insects and birds return.'], 'Heavy pesticides: debt, resistance, poisoning. NPM: savings, health, healthier environment'),
        ex('Arrange the NPM approach as a sequence a farmer group would follow.', ['Study the pests and their life cycle.', 'Apply natural sprays at the right stage.', 'Use traps, trap crops and bird perches.', 'Improve soil with compost and rotation.', 'Share results and expand to other farmers.'], 'Learn → natural sprays → traps/trap crops → soil care → share'),
      ],
      practice: [
        orderT('order', 'Put the steps of a village switching to non-pesticide management in order.', [
          'Farmers notice rising pesticide costs and health problems', 'They learn about pest life cycles with an expert group', 'They try neem sprays, traps and trap crops on a few fields', 'Results show lower costs with good yields', 'More farmers in the village adopt NPM',
        ], ['A problem comes first, then learning.', 'Wider adoption follows proof of results.'], 'Problem → learning → trial → results → spread.'),
        tapT('tap', 'Tap every SUSTAINABLE farming practice.', [
          ['Neem-based pest control', true], ['Crop rotation with pulses', true], ['Compost and green manure', true], ['Drip irrigation', true], ['Bird perches in fields', true],
          ['Spraying pesticides every week regardless of pests', false], ['Burning crop residue', false], ['Flood-irrigating with pumped groundwater', false],
        ], ['Does it protect soil, water or health?', 'Heavy spraying and burning cause harm.'], 'Natural pest control, rotation, compost, drip irrigation and bird perches are sustainable.'),
        mcq('mcq', 'Think of costs, health and the soil.', [
          ['NPM stands for…', 'Non-Pesticide Management', ['New Pesticide Method', 'National Pest Mission', 'Natural Plant Medicine'], 'It avoids chemical pesticides.', 'NPM = Non-Pesticide Management.'],
          ['Which village in Khammam district became known for NPM?', 'Punukula', ['Rampur', 'Dubagunta', 'Kakinada'], 'It is in Telangana.', 'Punukula adopted non-pesticide management in the early 2000s.'],
          ['A major reason farmers fell into debt with chemical-heavy farming was…', 'Rising spending on pesticides and fertilisers', ['Too much rain', 'Low population', 'Free electricity'], 'Input costs.', 'High input costs pushed many farmers into debt.'],
          ['Organic farming avoids…', 'Synthetic fertilisers and pesticides', ['Compost', 'Crop rotation', 'Seeds'], 'Organic = natural.', 'Organic farming uses natural inputs only.'],
          ['Pests becoming resistant means…', 'The same chemical no longer kills them', ['They disappear forever', 'They help crops grow', 'They eat only weeds'], 'Survivors breed.', 'Over-use selects pests that survive the chemical.'],
          ['Which is an example of a trap crop strategy?', 'Sowing marigold or castor at field borders to attract pests', ['Spraying more chemicals', 'Burning the field', 'Removing all trees'], 'Lure pests away.', 'Trap crops draw pests away from the main crop.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.sus.equity', title: 'Towards sustainable development with equity', prereqs: ['ts10.ss.sus.alternatives'],
      intro: [
        h('Development for whom?'),
        photo('🌳', 'Forests give Adivasi families food, fuel, medicine and livelihood — their rights matter when forests are used for development.'),
        p('Sustainable development asks: will our children have water, soil and forests? Development with equity asks: are the benefits and costs shared fairly today? Both questions belong together. If a dam lights up cities but drowns forest villages without fair resettlement, it is not equitable. If cities enjoy cheap goods while the waste is dumped near poor neighbourhoods, it is not fair.'),
        def('Equity', 'Fairness — sharing the benefits and burdens of development justly among all people, with special attention to the weak and marginalised.'),
        def('Forest Rights Act, 2006', 'A law that recognises the rights of Scheduled Tribes and other traditional forest dwellers over forest land and resources they have long depended on.'),
        h('What a fair and sustainable path looks like'),
        stepsB(
          'People affected by a project are consulted and their consent is sought.',
          'Benefits (jobs, water, power) are shared with local communities.',
          'Fair compensation and resettlement are given to those displaced.',
          'Resources are used within nature\'s limits (renewable energy, water budgeting).',
          'Consumption by the rich is moderated — less waste, recycling, energy saving.',
        ),
        p('Renewable energy — solar and wind — can supply power without exhausting coal or polluting the air. Telangana has built large solar capacity, and many homes and farms now use solar pumps. Individuals also matter: saving water and electricity, reducing plastic, and choosing public transport are small acts that add up.'),
        keys('Sustainability = fairness to future generations; equity = fairness today.', 'Displaced and forest-dependent people must share benefits and get fair resettlement.', 'Forest Rights Act 2006 protects traditional forest dwellers.', 'Renewable energy and moderate consumption support sustainable development.'),
        remember('Sustainable development (Brundtland Report, 1987): meeting present needs without compromising future generations\' ability to meet theirs.'),
        tip('Good answers ask three questions: Who gains? Who loses? Will it last?'),
      ],
      examples: [
        ex('A mining project will bring jobs but will clear a forest used by an Adivasi village. Suggest what "development with equity" would require.', ['Consult the village and respect their forest rights under the Forest Rights Act.', 'Share benefits: local jobs, revenue for the village.', 'Fair compensation and resettlement; restore and replant mined land.', 'Consider whether the forest can be protected by changing the project.'], 'Consultation, rights, fair sharing of benefits, compensation and environmental restoration'),
        ex('Why is solar power considered both sustainable and equitable for a farming village?', ['Sustainable: the sun is renewable and solar power does not pollute.', 'Equitable: solar pumps and rooftop panels give villages their own cheap power, reducing dependence on distant grids.'], 'It is renewable and clean, and it spreads energy access to villages'),
      ],
      practice: [
        mcq('mcq', 'Ask: who gains, who loses, will it last?', [
          ['Equity in development means…', 'Fair sharing of benefits and costs among all people', ['Equal income for everyone by law', 'Only rich people develop', 'No development at all'], 'Fairness.', 'Equity is about just distribution, with attention to the weak.'],
          ['The Forest Rights Act was passed in…', '2006', ['1947', '1991', '2013'], 'Mid-2000s.', 'The Forest Rights Act became law in 2006.'],
          ['Which energy source is renewable?', 'Solar', ['Coal', 'Diesel', 'Natural gas'], 'It will not run out.', 'Solar energy is renewable and clean.'],
          ['A dam that gives cities power but displaces villagers without fair resettlement is…', 'Not equitable', ['Fully sustainable and fair', 'Good for everyone', 'Required by law'], 'Who loses?', 'The costs fall on villagers while others gain — that is unfair.'],
          ['The definition of sustainable development comes from the…', 'Brundtland Report (1987)', ['Treaty of Versailles', 'Indian Constitution', 'WTO agreement'], 'A UN commission report.', 'The 1987 Brundtland Report gave the widely used definition.'],
          ['Which personal action supports sustainable development?', 'Saving water and electricity at home', ['Leaving taps running', 'Burning plastic waste', 'Using more single-use plastic'], 'Reduce waste.', 'Saving resources reduces pressure on nature.'],
        ]),
        orderT('order', 'Put the steps of an equitable development project in order.', [
          'Consult the people who will be affected', 'Plan how benefits will be shared locally', 'Give fair compensation and resettlement', 'Carry out the project within environmental limits', 'Monitor and restore the environment afterwards',
        ], ['Consultation must come first.', 'Restoration comes last.'], 'Consult → plan benefit sharing → compensate → build within limits → monitor and restore.'),
        matchT('match', 'idea to its meaning', [
          ['Sustainability', 'Fairness to future generations'], ['Equity', 'Fairness among people today'], ['Forest Rights Act', 'Protects traditional forest dwellers\' rights'],
          ['Renewable energy', 'Power from sun and wind'], ['Resettlement', 'Rehousing displaced families fairly'],
        ], ['Sustainability looks forward in time.', 'Equity looks across people now.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — World Between the World Wars (1914-1945)
// =====================================================================================
/** [sort key, event, date] */
const c12Events: [number, string, string][] = [
  [1914.06, 'Archduke Franz Ferdinand is assassinated at Sarajevo', '28 June 1914'],
  [1914.07, 'Austria-Hungary declares war on Serbia; the First World War begins', '28 July 1914'],
  [1917.11, 'The Bolsheviks under Lenin seize power in Russia (October Revolution)', 'November 1917 (October by the old Russian calendar)'],
  [1918.11, 'Armistice ends the fighting of the First World War', '11 November 1918'],
  [1919.06, 'The Treaty of Versailles is signed', '28 June 1919'],
  [1920.01, 'The League of Nations comes into being', 'January 1920'],
  [1922.10, 'Mussolini\'s March on Rome; he becomes Prime Minister of Italy', 'October 1922'],
  [1929.10, 'The Wall Street stock market crash starts the Great Depression', 'October 1929'],
  [1933.01, 'Hitler becomes Chancellor of Germany', '30 January 1933'],
  [1939.09, 'Germany invades Poland; the Second World War begins', '1 September 1939'],
  [1941.12, 'Japan attacks Pearl Harbor; the USA enters the war', '7 December 1941'],
  [1945.08, 'Atomic bombs are dropped on Hiroshima and Nagasaki', '6 and 9 August 1945'],
  [1945.10, 'The United Nations is formally established', '24 October 1945'],
];

const ch12: USpec = {
  id: 'ts10.ss.ch12', subject: 'social', title: 'World Between the World Wars (1914-1945)', source: src(12),
  objectives: [
    {
      id: 'ts10.ss.wars.ww1', title: 'Causes and nature of the First World War', prereqs: [],
      intro: [
        h('One gunshot, four years of war'),
        photo('🗺️', 'Europe in 1914 was divided into two armed camps. A local quarrel in the Balkans pulled in all the great powers within weeks.'),
        p('On 28 June 1914 a young Bosnian Serb, Gavrilo Princip, shot Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, in Sarajevo. Within about five weeks Europe\'s great powers were at war. But a single murder cannot explain a war that killed millions. Historians point to deeper causes that had been building for decades — like dry grass waiting for a spark.'),
        h('The deeper causes'),
        def('Nationalism', 'Strong pride in and loyalty to one\'s nation, sometimes turning into hostility towards others. Slav nationalism in the Balkans clashed with Austria-Hungary; French people wanted back Alsace-Lorraine, lost to Germany in 1871.'),
        def('Imperialism', 'The race to capture colonies for raw materials, markets and prestige. Germany, a late-comer, wanted "a place in the sun" and clashed with Britain and France.'),
        def('Militarism', 'Building huge armies and navies and glorifying war. Britain and Germany competed to build battleships; every power had detailed war plans.'),
        def('Alliance system', 'Two rival blocs: the Triple Alliance (Germany, Austria-Hungary, Italy) and the Triple Entente (Britain, France, Russia). A war between two members could drag in all.'),
        stepsB(
          '28 June 1914: Franz Ferdinand is assassinated in Sarajevo.',
          '28 July 1914: Austria-Hungary, backed by Germany, declares war on Serbia.',
          'Russia mobilises to support Serbia; Germany declares war on Russia and then on France.',
          'Germany marches through neutral Belgium to attack France; Britain declares war on Germany (4 August 1914).',
          'The war spreads to colonies, the Ottoman Empire joins Germany\'s side, and in 1917 the USA joins the Allies.',
          '11 November 1918: an armistice ends the fighting.',
        ),
        h('A new kind of war'),
        p('This was the first "total war": whole nations — factories, farms, women workers, colonies — were organised for victory. Soldiers lived for months in muddy trenches; machine guns, poison gas, tanks, aeroplanes and submarines made killing industrial. An estimated 15–20 million people died. More than a million Indian soldiers served overseas for Britain, and tens of thousands of them died in France, Mesopotamia and East Africa.'),
        keys('Long-term causes: nationalism, imperialism, militarism and rival alliances.', 'Immediate cause: assassination at Sarajevo, 28 June 1914.', 'War lasted 1914–1918; ended by armistice on 11 November 1918.', 'It was a total war with new weapons and enormous casualties.'),
        remember('Triple Alliance: Germany, Austria-Hungary, Italy. Triple Entente: Britain, France, Russia. (Italy later switched to the Allies in 1915.)'),
        tip('Exam trick: the long-term causes spell M-A-I-N — Militarism, Alliances, Imperialism, Nationalism.'),
      ],
      examples: [
        ex('Explain the chain by which a murder in Sarajevo became a European war.', ['Austria-Hungary blamed Serbia and declared war on it.', 'Russia, protector of the Slavs, mobilised for Serbia.', 'Germany, Austria\'s ally, declared war on Russia and France.', 'Germany\'s invasion of Belgium brought Britain in.', 'Because of the alliance system, a local quarrel became a general war.'], 'The alliance system turned a regional crisis into a world war'),
        ex('Classify each as a long-term or immediate cause: (a) naval race between Britain and Germany, (b) the Sarajevo assassination, (c) rivalry for colonies in Africa.', ['(a) Built up over years → long-term (militarism).', '(b) The spark in June 1914 → immediate cause.', '(c) Built up over decades → long-term (imperialism).'], '(a) long-term, (b) immediate, (c) long-term'),
      ],
      practice: [
        mcq('causes', 'Separate the deep causes from the spark.', [
          ['What was the immediate cause of the First World War?', 'Assassination of Archduke Franz Ferdinand at Sarajevo', ['The Great Depression', 'The Treaty of Versailles', 'The Russian Revolution'], 'It happened on 28 June 1914.', 'The killing of the Austrian heir at Sarajevo was the spark that set off the war.'],
          ['Which countries formed the Triple Entente?', 'Britain, France and Russia', ['Germany, Austria-Hungary and Italy', 'USA, Japan and China', 'Britain, Germany and Russia'], 'Entente is a French word for "understanding".', 'Britain, France and Russia formed the Triple Entente.'],
          ['The race among European powers to capture colonies is called…', 'Imperialism', ['Militarism', 'Socialism', 'Isolationism'], 'Empire → imperialism.', 'Competition for colonies, markets and raw materials is imperialism.'],
          ['Why is the First World War called a "total war"?', 'Entire societies and economies were organised for fighting', ['Every country in the world fought', 'It ended with total victory for one side within a month', 'Only professional soldiers fought'], 'Think of factories, farms and civilians.', 'Governments mobilised industry, labour, women and colonies, not just armies.'],
          ['Which new weapon was first used on a large scale in the First World War?', 'Poison gas', ['Atomic bomb', 'Guided missile', 'Jet fighter'], 'The atomic bomb came in 1945.', 'Poison gas, machine guns, tanks and submarines were features of the 1914–18 war.'],
          ['Which country joined the Allies in 1917?', 'The USA', ['Germany', 'Austria-Hungary', 'The Ottoman Empire'], 'It had stayed neutral at first.', 'The USA entered the war in April 1917 on the Allied side.'],
        ]),
        matchT('match', 'term to its example in 1914', [
          ['Nationalism', 'French wish to regain Alsace-Lorraine'], ['Imperialism', 'German demand for "a place in the sun"'], ['Militarism', 'Anglo-German battleship race'],
          ['Alliance system', 'Triple Alliance versus Triple Entente'], ['Immediate cause', 'Shooting at Sarajevo'], ['Total war', 'Whole economies geared for fighting'],
        ], ['Match the clearest ones first: the shooting is the immediate cause.', 'Colonies → imperialism; battleships → militarism.']),
        timelineT('timeline', 'Put these events in order, earliest first.', c12Events.slice(0, 6), ['The war began in 1914 and ended in 1918.', 'The peace treaty came after the armistice.']),
      ],
    },
    {
      id: 'ts10.ss.wars.peace', title: 'The Treaty of Versailles and the League of Nations', prereqs: ['ts10.ss.wars.ww1'],
      intro: [
        h('Making peace — or planting the next war?'),
        photo('📜', 'The peace treaty with Germany was signed in the Hall of Mirrors at the Palace of Versailles near Paris on 28 June 1919 — five years to the day after the Sarajevo shooting.'),
        p('After the guns fell silent, the winners met at the Paris Peace Conference in 1919. The "Big Three" — Woodrow Wilson (USA), David Lloyd George (Britain) and Georges Clemenceau (France) — had different aims. Wilson spoke of a just peace based on his Fourteen Points, including self-determination for nations and a League of Nations. Clemenceau, whose country had been devastated, wanted Germany punished and weakened.'),
        h('What Germany had to accept'),
        stepsB(
          'Accept the "war guilt" clause: Germany and its allies were held responsible for the war.',
          'Pay huge reparations (war damages) to the Allies.',
          'Return Alsace-Lorraine to France and give up land to Poland and others; lose all its colonies.',
          'Limit the army to 100,000 soldiers, with no air force and a tiny navy.',
          'Keep the Rhineland (near France) free of troops.',
        ),
        p('Many Germans felt humiliated by this "dictated peace". Their anger, and the economic burden of reparations, were later used by Hitler to win support. Some historians argue the treaty was too harsh to be accepted and too weak to stop Germany recovering; others point out that Germany had imposed a harsher treaty on Russia in 1918. Either way, it left bitterness behind.'),
        def('League of Nations', 'An international organisation set up in January 1920 (headquarters Geneva) to settle disputes peacefully through collective security, so that another world war would not happen.'),
        def('Collective security', 'The idea that an attack on one member is a concern for all, and all members act together against the aggressor.'),
        p('The League did useful work on health, refugees and labour (the International Labour Organisation), and settled some small disputes. But it had no army of its own, the USA never joined, and big powers left when it criticised them. It failed to stop Japan in Manchuria (1931), Italy in Ethiopia (1935) and Germany\'s aggression in the late 1930s.'),
        keys('Treaty of Versailles: 28 June 1919, with Germany.', 'Germany lost land and colonies, paid reparations, accepted war guilt, and was disarmed.', 'League of Nations, 1920, aimed at collective security.', 'Weaknesses: no army, USA absent, big powers defied it.'),
        remember('League of Nations: 1920, Geneva. Its failure to stop aggression in the 1930s is one reason for the Second World War.'),
        tip('When asked "Why did the League fail?", give at least three reasons: no army, USA absent, members put self-interest first.'),
      ],
      examples: [
        ex('Read this statement by a German in 1919: "We were not defeated on the battlefield, yet we must sign away our honour." What does it show about German attitudes to the treaty?', ['The speaker believes Germany was not really beaten (a common belief, since no fighting happened on German soil).', '"Sign away our honour" refers to the war-guilt clause and losses.', 'So many Germans saw the treaty as unjust and wanted it overturned.'], 'Resentment against a "dictated peace", which later helped extremist parties'),
        ex('Give three reasons why the League of Nations failed to prevent the Second World War.', ['It had no army of its own to stop an aggressor.', 'The USA never joined, and Germany, Japan and Italy left.', 'Britain and France put their own interests first (for example during the Ethiopian crisis).'], 'No force, missing great powers, and lack of unity'),
      ],
      practice: [
        mcq('treaty', 'Think about what the winners wanted from Germany.', [
          ['The Treaty of Versailles was signed with…', 'Germany', ['Russia', 'Japan', 'Italy'], 'It was the main defeated power.', 'Versailles (1919) was the peace treaty imposed on Germany.'],
          ['Which territory did Germany return to France?', 'Alsace-Lorraine', ['Rhineland', 'Bavaria', 'Silesia'], 'France had lost it in 1871.', 'Alsace-Lorraine went back to France.'],
          ['Money a defeated country pays for war damages is called…', 'Reparations', ['Tariffs', 'Subsidies', 'Dividends'], 'It "repairs" damage.', 'Reparations are payments for war damage.'],
          ['Where were the headquarters of the League of Nations?', 'Geneva', ['New York', 'Paris', 'London'], 'A city in neutral Switzerland.', 'The League was based in Geneva.'],
          ['Which major country never joined the League of Nations?', 'The USA', ['Britain', 'France', 'Japan'], 'Its own President proposed the League.', 'The US Senate refused to join, weakening the League.'],
          ['Whose Fourteen Points called for self-determination and a League of Nations?', 'Woodrow Wilson', ['Georges Clemenceau', 'Lloyd George', 'Lenin'], 'He was the American President.', 'US President Wilson set out the Fourteen Points in January 1918.'],
        ]),
        tapT('tap', 'Tap every term that was part of the Treaty of Versailles for Germany.', [
          ['War guilt clause', true], ['Payment of reparations', true], ['Loss of all colonies', true], ['Army limited to 100,000 soldiers', true], ['Demilitarised Rhineland', true],
          ['Germany given a permanent seat on the League Council at once', false], ['Germany allowed a large air force', false], ['Germany gains Alsace-Lorraine', false],
        ], ['Every term weakened or punished Germany.', 'Anything that strengthened Germany is false.'], 'The treaty punished and disarmed Germany; it gave it nothing new.'),
        matchT('match', 'person or body to its role', [
          ['Woodrow Wilson', 'Fourteen Points and idea of the League'], ['Georges Clemenceau', 'French leader who wanted Germany punished'], ['League of Nations', 'Body for collective security, 1920'],
          ['Versailles', 'Palace where the 1919 treaty was signed'], ['Reparations', 'War damages Germany had to pay'], ['ILO', 'Labour body linked with the League'],
        ], ['Wilson was idealistic; Clemenceau was harsh.', 'The ILO dealt with workers.']),
      ],
    },
    {
      id: 'ts10.ss.wars.russia', title: 'The Russian Revolution and the Soviet Union under Stalin', prereqs: ['ts10.ss.wars.ww1'],
      intro: [
        h('"Peace, Land and Bread"'),
        photo('🚩', 'The red flag became the symbol of the Bolshevik revolution of 1917 and later of the Soviet Union.'),
        p('Imagine a country where most people are poor peasants, workers labour 12 hours a day in factories, and a single ruler — the Tsar — holds all power. Add a war in which millions of soldiers die and bread runs out in the cities. That was Russia in 1917, and it exploded in two revolutions in one year.'),
        stepsB(
          'February/March 1917: strikes and bread riots in Petrograd; soldiers join the crowds. Tsar Nicholas II gives up the throne. A Provisional Government takes over but continues the war.',
          'Workers and soldiers form councils called soviets. Lenin, leader of the Bolsheviks, returns and promises "Peace, Land and Bread".',
          'October/November 1917: the Bolsheviks seize power in Petrograd. Land is given to peasants, banks and big industries are taken over by the state.',
          'March 1918: Russia leaves the war by the Treaty of Brest-Litovsk.',
          '1918–1921: a civil war between the Bolsheviks (Reds) and their opponents (Whites) ends in Bolshevik victory.',
          '1922: the Union of Soviet Socialist Republics (USSR) is formed.',
        ),
        def('Bolsheviks', 'The radical wing of the Russian socialist party, led by Lenin, which wanted a revolution by workers and peasants; later called the Communist Party.'),
        def('Soviet', 'A council of elected workers, soldiers or peasants.'),
        h('Stalin\'s Soviet Union'),
        p('After Lenin died in 1924, Joseph Stalin became the supreme leader. From 1928 he launched Five-Year Plans to turn a farming country into an industrial power quickly — steel, coal, electricity and machines were the priority. Peasants\' farms were merged by force into large collective farms (collectivisation).'),
        p('The results were mixed and need to be seen from both sides. The USSR became a major industrial power, and education and health care spread widely; this strength helped it resist Germany in the Second World War. But the cost was enormous: millions died in famines linked to forced collectivisation in the early 1930s, and in the "purges" of the late 1930s large numbers of people were executed or sent to labour camps. Free speech and opposition were not allowed.'),
        keys('1917: two revolutions — the Tsar falls (Feb/March); Bolsheviks take power (Oct/Nov).', 'Lenin\'s slogan: "Peace, Land and Bread".', 'USSR formed in 1922.', 'Stalin: Five-Year Plans from 1928, collectivisation, rapid industrialisation, harsh repression.'),
        remember('Russia used the old (Julian) calendar in 1917, so the "October Revolution" took place in November by our calendar.'),
        tip('India later borrowed the idea of Five-Year Plans (from 1951), but within a democracy.'),
      ],
      examples: [
        ex('Why did Lenin\'s slogan "Peace, Land and Bread" win wide support in 1917?', ['Peace: soldiers and families were exhausted by the war.', 'Land: peasants wanted the landlords\' estates.', 'Bread: city workers faced hunger and high prices.', 'The slogan spoke to each major group\'s biggest need.'], 'It promised exactly what soldiers, peasants and workers wanted'),
        ex('Give one achievement and one human cost of Stalin\'s Five-Year Plans.', ['Achievement: rapid growth of heavy industry (steel, coal, electricity), making the USSR an industrial power.', 'Cost: forced collectivisation caused famine and millions of deaths; dissent was crushed.'], 'Fast industrialisation, but at a huge human cost'),
      ],
      practice: [
        mcq('russia', 'Separate the two revolutions of 1917 and the Stalin years.', [
          ['Who led the Bolsheviks in 1917?', 'Lenin', ['Stalin', 'Kerensky', 'Tsar Nicholas II'], 'He returned from exile in 1917.', 'Lenin led the Bolsheviks to power in October/November 1917.'],
          ['What was the Bolshevik slogan in 1917?', 'Peace, Land and Bread', ['Liberty, Equality, Fraternity', 'Do or Die', 'Blood and Iron'], 'It promised three things.', 'Lenin\'s "Peace, Land and Bread" spoke to soldiers, peasants and workers.'],
          ['Stalin\'s policy of merging small peasant farms into large state-controlled farms was…', 'Collectivisation', ['Privatisation', 'Liberalisation', 'Zamindari'], 'Collective = together.', 'Collectivisation forced peasants into collective farms.'],
          ['In which year was the USSR formed?', '1922', ['1917', '1905', '1945'], 'After the civil war ended.', 'The Union of Soviet Socialist Republics was formed in December 1922.'],
          ['What happened in Russia in February/March 1917?', 'The Tsar gave up the throne', ['The Bolsheviks seized power', 'Russia joined the war', 'Stalin became leader'], 'This was the first of two revolutions.', 'Strikes and mutinies forced Tsar Nicholas II to abdicate.'],
          ['Stalin\'s Five-Year Plans gave top priority to…', 'Heavy industry such as steel and coal', ['Consumer goods and luxury items', 'Tourism', 'Handicrafts'], 'He wanted to industrialise fast.', 'The plans focused on heavy industry and power.'],
        ]),
        orderT('order', 'Put these events of Russian history in the correct order.', [
          'Tsar Nicholas II abdicates', 'Bolsheviks seize power under Lenin', 'Russia leaves the war (Brest-Litovsk)', 'Civil war between Reds and Whites', 'USSR is formed', 'Stalin launches the first Five-Year Plan',
        ], ['The Tsar fell before the Bolsheviks rose.', 'Stalin\'s plans began in 1928.'], 'Tsar abdicates (1917) → Bolsheviks (1917) → Brest-Litovsk (1918) → civil war (1918–21) → USSR (1922) → Five-Year Plan (1928).'),
        tapT('tap', 'Tap every statement that is TRUE about the Soviet Union under Stalin.', [
          ['Industry grew very rapidly', true], ['Peasants were forced into collective farms', true], ['Millions died in famines and purges', true], ['Opposition parties were not allowed', true],
          ['There were free multi-party elections', false], ['Agriculture was left entirely to private landlords', false], ['Stalin led the October Revolution of 1917', false],
        ], ['Think of both achievements and costs.', 'Lenin, not Stalin, led the 1917 revolution.'], 'Stalin\'s rule brought fast industrialisation along with forced collectivisation and severe repression.'),
      ],
    },
    {
      id: 'ts10.ss.wars.depression', title: 'The Great Depression and the rise of Fascism and Nazism', prereqs: ['ts10.ss.wars.peace'],
      intro: [
        h('When the world economy crashed'),
        photo('🪙', 'During the Great Depression prices of crops collapsed — farmers everywhere, including in India, earned far less for the same harvest.'),
        p('In October 1929 share prices on Wall Street, New York\'s stock market, crashed. Banks failed, factories closed and by 1932 roughly one in four American workers had no job. Because American loans and trade held up much of the world economy, the crisis spread everywhere. This is the Great Depression.'),
        def('Economic depression', 'A long, deep fall in production, trade, prices and employment.'),
        stepsB(
          'In the 1920s US banks lent heavily and people bought shares with borrowed money.',
          'October 1929: share prices crash; investors and banks lose huge sums.',
          'Banks fail and recall loans, including loans to Germany and Austria.',
          'Factories cut production, workers lose jobs and demand falls even further.',
          'World trade shrinks; prices of farm goods collapse, hurting peasants in colonies like India.',
        ),
        p('In India, prices of wheat and rice fell by about half between 1928 and 1934, but the land revenue farmers had to pay did not fall. Many peasants fell into debt and sold their gold and silver. This rural distress fed into the Civil Disobedience Movement of 1930.'),
        h('Fascism and Nazism'),
        def('Fascism', 'A political system with one all-powerful leader and party, extreme nationalism, glorification of war and violence, and no tolerance of opposition. The word comes from Mussolini\'s Fascist party in Italy.'),
        p('In Italy, Benito Mussolini\'s Fascists marched on Rome in October 1922 and he became Prime Minister, soon ruling as a dictator. In Germany, the democratic Weimar Republic struggled with the humiliation of Versailles, the inflation of 1923 and then the mass unemployment of the Depression. Adolf Hitler\'s Nazi party promised jobs, national pride and the overturning of Versailles, and blamed Jews and communists for Germany\'s troubles.'),
        p('Hitler became Chancellor on 30 January 1933 and quickly destroyed democracy: other parties were banned, opponents were sent to concentration camps, and the press was controlled. The Nazis taught a racist ideology claiming German "Aryans" were superior. Jews were stripped of rights (Nuremberg Laws, 1935) and, during the war, about six million Jews were murdered in the Holocaust, along with Roma people, disabled people and others.'),
        keys('Wall Street crash, October 1929 → Great Depression across the world.', 'Depression hurt farmers in India: crop prices halved, revenue did not.', 'Fascism: one leader, one party, extreme nationalism, violence.', 'Hitler (Chancellor 1933) ended democracy; Nazi racism led to the Holocaust.'),
        remember('Mussolini — Italy — March on Rome 1922. Hitler — Germany — Chancellor 30 January 1933.'),
        tip('Link the chapter: Versailles (anger) + Depression (unemployment) + weak League (no check) = conditions for Nazism and war.'),
      ],
      examples: [
        ex('Explain how the Great Depression helped Hitler come to power.', ['The Depression caused mass unemployment in Germany as US loans were recalled.', 'People lost faith in the democratic Weimar government.', 'Hitler promised work, order and revenge for Versailles.', 'Nazi votes rose sharply between 1930 and 1932, and in January 1933 he was made Chancellor.'], 'Economic despair made people turn to a leader promising jobs and national pride'),
        ex('A peasant in Telangana sold his paddy for ₹4 a bag before the Depression and ₹2 after, but paid the same land revenue. What happened to his ability to pay?', ['His income from the same harvest halved.', 'His fixed revenue now took twice the share of his income.', 'He had to borrow or sell savings to pay.'], 'His burden doubled, pushing him into debt (illustrative figures)'),
      ],
      practice: [
        mcq('dep', 'Link the economic crisis to the political changes.', [
          ['The Great Depression began with…', 'The Wall Street crash of October 1929', ['The Treaty of Versailles', 'The Russian Revolution', 'The attack on Pearl Harbor'], 'It was in New York.', 'The collapse of share prices in 1929 triggered the Depression.'],
          ['Who founded Fascism in Italy?', 'Benito Mussolini', ['Adolf Hitler', 'Francisco Franco', 'Joseph Stalin'], 'He marched on Rome in 1922.', 'Mussolini\'s Fascist party gave the system its name.'],
          ['When did Hitler become Chancellor of Germany?', 'January 1933', ['November 1918', 'October 1929', 'September 1939'], 'After the worst Depression years.', 'Hitler was appointed Chancellor on 30 January 1933.'],
          ['How did the Depression affect Indian farmers?', 'Crop prices fell sharply but land revenue stayed the same', ['Crop prices doubled', 'Land revenue was abolished', 'Farmers got higher wages'], 'Income down, tax unchanged.', 'Falling prices with unchanged revenue demands pushed peasants into debt.'],
          ['Which is a feature of fascism?', 'Rule by one leader and party with no opposition', ['Free elections with many parties', 'Strong protection of minorities', 'Peaceful foreign policy'], 'Dictatorship.', 'Fascism rejects democracy and opposition.'],
          ['The killing of about six million Jews by the Nazis is called…', 'The Holocaust', ['The Depression', 'The Purges', 'The Armistice'], 'It happened mainly during the Second World War.', 'The Holocaust was the Nazi genocide of Jews and other groups.'],
        ]),
        orderT('chain', 'Put this chain of events of the Great Depression in order.', [
          'Banks lend heavily and people buy shares on credit', 'Share prices crash on Wall Street', 'Banks fail and recall loans abroad', 'Factories close and unemployment rises', 'World trade shrinks and crop prices collapse',
        ], ['Start with the borrowing boom of the 1920s.', 'Falling world trade is the final, widest effect.'], 'Credit boom → crash → bank failures → unemployment → collapse of world trade and prices.'),
        tapT('tap', 'Tap every factor that helped the Nazis win support in Germany.', [
          ['Anger at the Treaty of Versailles', true], ['Mass unemployment during the Depression', true], ['Weakness of the Weimar government', true], ['Fear of communism among the middle classes', true],
          ['A booming economy in 1932', false], ['Strong support from the League of Nations', false], ['Victory of Germany in the First World War', false],
        ], ['Think of anger, fear and hardship.', 'Germany lost the First World War.'], 'Humiliation, unemployment, a weak government and fear of communism helped the Nazis.'),
      ],
    },
    {
      id: 'ts10.ss.wars.ww2', title: 'The Second World War and its costs', prereqs: ['ts10.ss.wars.depression'],
      intro: [
        h('The deadliest war in history'),
        photo('🕊️', 'After 1945, the world set up the United Nations hoping never again to suffer such a war.'),
        p('Only twenty years after the "war to end all wars", the world was at war again — and this time it was even more destructive. It was fought in Europe, Africa, Asia and the Pacific, on land, at sea and in the air, and civilians suffered as much as soldiers.'),
        def('Axis powers', 'Germany, Italy and Japan.'),
        def('Allied powers', 'Britain (with its empire, including India), France, the USSR (from 1941), the USA (from 1941), China and others.'),
        def('Appeasement', 'The policy followed by Britain and France in the 1930s of giving in to Hitler\'s demands to avoid war, as at Munich in 1938.'),
        stepsB(
          '1 September 1939: Germany invades Poland; Britain and France declare war.',
          '1940: Germany conquers France; Britain fights on alone in the West.',
          'June 1941: Germany invades the USSR.',
          '7 December 1941: Japan attacks the US naval base at Pearl Harbor; the USA enters the war.',
          '1942–43: the Soviet victory at Stalingrad turns the tide in Europe.',
          '6 June 1944: Allied landings in Normandy (D-Day).',
          'May 1945: Germany surrenders.',
          '6 and 9 August 1945: US atomic bombs destroy Hiroshima and Nagasaki; Japan surrenders soon after (formally on 2 September 1945).',
        ),
        h('The costs'),
        p('Estimates of the dead range from about 50 to over 70 million people, most of them civilians. Cities were flattened by bombing; the Holocaust murdered about six million Jews; millions became refugees. India sent about 2.5 million soldiers, the largest volunteer army in history, and the war economy contributed to the Bengal famine of 1943, in which around three million people are estimated to have died.'),
        p('The war changed the world map of power: Britain and France were weakened, the USA and the USSR became "superpowers", colonies pressed harder for freedom, and in October 1945 the United Nations was set up to keep the peace.'),
        keys('Axis: Germany, Italy, Japan. Allies: Britain, France, USSR, USA, China and others.', 'War began 1 September 1939 with the invasion of Poland; ended 1945.', 'Atomic bombs on Hiroshima and Nagasaki in August 1945.', 'Results: huge loss of life, rise of USA and USSR, decline of empires, birth of the UN.'),
        remember('United Nations established 24 October 1945 (UN Day). Pearl Harbor: 7 December 1941.'),
        tip('In long answers, organise "costs" under human, economic and political headings.'),
      ],
      examples: [
        ex('Explain why the Second World War speeded up the end of colonial empires.', ['Britain and France were exhausted and nearly bankrupt after the war.', 'Colonial soldiers and peoples had fought for "freedom" and now demanded it for themselves.', 'The new superpowers, the USA and USSR, did not support old European empires.', 'So India (1947) and many Asian and African countries soon won independence.'], 'Weakened empires and stronger national movements made decolonisation faster'),
        ex('Was appeasement a sensible policy? Give one argument for and one against.', ['For: Britain and France were not ready for war in 1938, and people remembered the horror of 1914–18; it bought time to re-arm.', 'Against: each concession encouraged Hitler to demand more, and it let Germany grow stronger.'], 'Historians disagree: it bought time but encouraged aggression'),
      ],
      practice: [
        timelineT('timeline', 'Put these events in time order, earliest first.', c12Events, ['Use the year first, then the month.', 'The UN came after the atomic bombs.'], 5),
        mcq('ww2', 'Think of who fought on which side and when.', [
          ['The Second World War began when Germany invaded…', 'Poland', ['France', 'Russia', 'Belgium'], 'September 1939.', 'Germany\'s invasion of Poland on 1 September 1939 brought Britain and France into the war.'],
          ['Which three countries were the main Axis powers?', 'Germany, Italy and Japan', ['Britain, France and USA', 'Germany, Russia and Italy', 'Japan, China and Korea'], 'The Rome–Berlin–Tokyo axis.', 'Germany, Italy and Japan formed the Axis.'],
          ['Which event brought the USA into the Second World War?', 'Japan\'s attack on Pearl Harbor', ['The invasion of Poland', 'The fall of France', 'The Munich agreement'], 'December 1941.', 'The attack on Pearl Harbor on 7 December 1941 brought the USA in.'],
          ['On which two cities were atomic bombs dropped in 1945?', 'Hiroshima and Nagasaki', ['Tokyo and Osaka', 'Berlin and Dresden', 'Hiroshima and Tokyo'], 'Both are in Japan.', 'Hiroshima (6 August) and Nagasaki (9 August) were bombed.'],
          ['The policy of giving in to Hitler\'s demands to avoid war was called…', 'Appeasement', ['Collectivisation', 'Containment', 'Non-alignment'], 'Appease = to calm by giving.', 'Britain and France followed appeasement in the 1930s.'],
          ['Which two countries emerged as superpowers after 1945?', 'USA and USSR', ['Britain and France', 'Germany and Japan', 'China and India'], 'They led the two blocs of the Cold War.', 'The USA and USSR dominated the post-war world.'],
        ]),
        tapT('tap', 'Tap every result of the Second World War.', [
          ['The United Nations was set up', true], ['Britain and France were weakened', true], ['Colonies pressed harder for independence', true], ['The USA and USSR became superpowers', true],
          ['The League of Nations grew stronger', false], ['Germany gained new colonies', false], ['The Tsar returned to power in Russia', false],
        ], ['Think about who rose and who fell.', 'The League was replaced, not strengthened.'], 'The war created the UN, weakened old empires and raised two superpowers.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 13 — National Liberation Movements in the Colonies
// =====================================================================================
const c13China: [number, string, string][] = [
  [1911, 'Revolution overthrows the Qing (Manchu) dynasty', '1911'],
  [1912, 'China proclaimed a republic with Sun Yat-sen as provisional president', '1912'],
  [1919, 'May Fourth Movement against the Versailles decision on Shandong', '4 May 1919'],
  [1921, 'Chinese Communist Party is founded in Shanghai', '1921'],
  [1927, 'Chiang Kai-shek\'s Guomindang turns against the Communists', '1927'],
  [1934, 'The Long March begins', '1934 (ended 1935)'],
  [1937, 'Japan launches full-scale war on China', '1937'],
  [1949, 'Mao Zedong proclaims the People\'s Republic of China', '1 October 1949'],
  [1950, 'Land reform and new Marriage Law begin in the People\'s Republic', '1950'],
];
const c13Nigeria: [number, string, string][] = [
  [1861, 'Britain annexes Lagos', '1861'],
  [1914, 'Northern and Southern Protectorates are merged into one colony of Nigeria', '1914'],
  [1956, 'Oil is discovered at Oloibiri in the Niger Delta', '1956'],
  [1960, 'Nigeria becomes independent', '1 October 1960'],
  [1963, 'Nigeria becomes a republic', '1963'],
  [1967, 'Civil war (Biafran war) begins', '1967 (ended 1970)'],
  [1995, 'Ogoni leader Ken Saro-Wiwa is executed', '1995'],
  [1999, 'Civilian, elected rule returns', '1999'],
];

const ch13: USpec = {
  id: 'ts10.ss.ch13', subject: 'social', title: 'National Liberation Movements in the Colonies', source: src(13),
  objectives: [
    {
      id: 'ts10.ss.liberation.china-republic', title: 'China: from empire to republic (1911-1927)', prereqs: [],
      intro: [
        h('The end of 2,000 years of emperors'),
        photo('🗺️', 'In the 1800s and early 1900s, foreign powers carved China into "spheres of influence" — China was independent on paper but controlled in practice.'),
        p('India was ruled directly by Britain. China was never a full colony, yet foreign powers — Britain, France, Germany, Russia, Japan — forced the weak Qing (Manchu) emperors to sign unequal treaties after the Opium Wars, giving them ports, trading rights and even legal powers inside China. Educated Chinese felt their country was being humiliated and decided the old empire had to go.'),
        def('Sun Yat-sen', 'A Western-educated doctor and revolutionary, regarded as the founder of modern China. He led the movement that ended the monarchy and founded the Guomindang (Kuomintang, Nationalist Party).'),
        def('Three Principles of the People', 'Sun Yat-sen\'s programme: nationalism (end foreign domination and the Manchu dynasty), democracy (elected government), and people\'s livelihood (regulating capital and giving land to the tiller).'),
        stepsB(
          '1911: an uprising overthrows the Qing dynasty; in 1912 China becomes a republic.',
          'Power soon falls into the hands of military commanders called warlords; the country splits into regions.',
          '1919: the Versailles peace conference hands German rights in Shandong to Japan. Students protest on 4 May — the May Fourth Movement demands national dignity and modern ideas.',
          '1921: the Chinese Communist Party (CCP) is founded; the Guomindang and the CCP work together for a while to defeat the warlords.',
          '1925: Sun Yat-sen dies; Chiang Kai-shek leads the Guomindang.',
          '1927: Chiang turns against the Communists and kills many of them; China is unified under the Guomindang, but a long conflict with the CCP begins.',
        ),
        p('The Guomindang under Chiang drew support from landlords, merchants and the urban middle class. Critics say it did little for peasants, who were the vast majority. Its supporters point out that it unified China, began modernising cities and later led resistance against Japan.'),
        keys('China was dominated by foreign powers through unequal treaties.', '1911 revolution ended the monarchy; Sun Yat-sen is the father of modern China.', 'Three Principles: nationalism, democracy, livelihood.', 'May Fourth Movement 1919; CCP founded 1921; Guomindang–CCP split 1927.'),
        remember('Guomindang (Kuomintang) = Nationalist Party (Sun Yat-sen, then Chiang Kai-shek). CCP = Chinese Communist Party (later led by Mao Zedong).'),
        tip('Do not confuse the two Chinese parties: Guomindang = Nationalists; CCP = Communists.'),
      ],
      examples: [
        ex('Why did students in Beijing protest on 4 May 1919?', ['China had joined the Allies in the First World War.', 'At Versailles, the Allies gave Germany\'s rights in Shandong province to Japan instead of returning them to China.', 'Students saw this as national humiliation and blamed their weak government.'], 'Against the Versailles decision to give Shandong to Japan'),
        ex('Explain how Sun Yat-sen\'s "people\'s livelihood" principle was meant to help peasants.', ['Most Chinese were poor peasants paying high rents to landlords.', '"Livelihood" meant regulating capital and giving land to those who actually farmed it.', 'This aimed to reduce inequality and poverty in the countryside.'], 'By promising land to the tiller and limits on big capital'),
      ],
      practice: [
        mcq('china1', 'Remember the three actors: the Qing, the Guomindang and the CCP.', [
          ['Who is regarded as the founder of modern China?', 'Sun Yat-sen', ['Mao Zedong', 'Chiang Kai-shek', 'Puyi'], 'He led the 1911 revolution.', 'Sun Yat-sen led the movement that created the Republic of China.'],
          ['The 1911 revolution in China overthrew the…', 'Qing (Manchu) dynasty', ['Ming dynasty', 'Guomindang', 'Japanese occupation'], 'It was the last imperial dynasty.', 'The Qing (Manchu) emperors were overthrown in 1911.'],
          ['Which was NOT one of Sun Yat-sen\'s Three Principles?', 'Return to rule by emperors', ['Nationalism', 'Democracy', 'People\'s livelihood'], 'He ended the monarchy.', 'The Three Principles were nationalism, democracy and livelihood.'],
          ['What sparked the May Fourth Movement of 1919?', 'Shandong being given to Japan at Versailles', ['The founding of the CCP', 'The Long March', 'The Japanese attack of 1937'], 'It was a reaction to the peace conference.', 'Students protested the transfer of Shandong to Japan.'],
          ['Who led the Guomindang after Sun Yat-sen died?', 'Chiang Kai-shek', ['Mao Zedong', 'Zhou Enlai', 'Lenin'], 'He split with the Communists in 1927.', 'Chiang Kai-shek became the Nationalist leader.'],
          ['Military commanders who controlled regions of China after 1912 were called…', 'Warlords', ['Mandarins', 'Soviets', 'Emirs'], 'They ruled by force of arms.', 'Regional warlords divided China until the late 1920s.'],
        ]),
        timelineT('timeline', 'Put these events of Chinese history in order.', c13China.slice(0, 6), ['The monarchy fell before the parties were formed.', 'The CCP was founded before the 1927 split.']),
        matchT('match', 'person or term to its description', [
          ['Sun Yat-sen', 'Father of modern China'], ['Chiang Kai-shek', 'Guomindang leader after 1925'], ['Qing dynasty', 'Last imperial dynasty'], ['Warlords', 'Regional military rulers'],
          ['May Fourth Movement', 'Student protest of 1919'], ['Unequal treaties', 'Agreements forced on China by foreign powers'],
        ], ['Start with the two people.', 'The 1919 protest was led by students.']),
      ],
    },
    {
      id: 'ts10.ss.liberation.china-communist', title: 'China: the Communist Party, new democracy and land reforms', prereqs: ['ts10.ss.liberation.china-republic'],
      intro: [
        h('A revolution built on peasants'),
        photo('🧑‍🌾', 'Unlike Russia, where the revolution began in cities, the Chinese Communists won by organising peasants in the countryside.'),
        p('Marx had expected revolutions to be led by factory workers. China had few factories but hundreds of millions of poor peasants. Mao Zedong argued that in China the peasants would be the main force of revolution — an idea that shaped the Communist movement.'),
        stepsB(
          'After 1927 the Communists retreat to the countryside and set up base areas, especially in Jiangxi, where they redistribute land.',
          '1934–35: surrounded by Guomindang armies, about 100,000 Communists set out on the Long March — roughly 10,000 km across mountains and rivers — to Yan\'an in the north-west. Only a small fraction survive; Mao emerges as the leader.',
          '1937–45: Japan invades China. The Communists organise guerrilla resistance, winning wide peasant support.',
          '1946–49: civil war between the Guomindang and the CCP. The Communists win; the Guomindang government withdraws to Taiwan.',
          '1 October 1949: Mao proclaims the People\'s Republic of China in Beijing.',
        ),
        def('New Democracy', 'Mao\'s idea (1940) that after the revolution China would be run by an alliance of workers, peasants, the middle class and "national" capitalists under the leadership of the Communist Party, before moving towards socialism.'),
        def('Land reform', 'Taking land from landlords and distributing it to landless and poor peasants.'),
        h('Changes after 1949'),
        p('The Agrarian Reform Law of 1950 took land from landlords and gave it to about 300 million peasants. Peasant meetings put landlords on "trial", and the process was often violent — many landlords were killed. The Marriage Law of 1950 banned child marriage, forced marriage and polygamy, and gave women the right to divorce. Later, land was pooled into co-operatives and communes. Historians credit these changes with ending landlordism and improving women\'s status, while also pointing to the violence and to later disasters such as the famine after the "Great Leap Forward" (1958–61).'),
        keys('Chinese revolution was based on peasants, not factory workers.', 'Long March 1934–35; Mao becomes leader.', 'People\'s Republic of China: 1 October 1949.', 'New Democracy: class alliance led by the CCP; land reform and Marriage Law in 1950.'),
        remember('People\'s Republic of China proclaimed by Mao Zedong on 1 October 1949. The Guomindang government moved to Taiwan.'),
        tip('Compare Russia and China: Russia — workers in cities, 1917; China — peasants in villages, 1949.'),
      ],
      examples: [
        ex('Why did the Chinese Communists win the support of peasants?', ['They redistributed landlords\' land to poor peasants in their base areas.', 'They led guerrilla resistance against the Japanese invaders, appearing as patriots.', 'Their soldiers were told to treat villagers fairly and pay for what they took.'], 'Through land reform, resistance to Japan and good conduct towards villagers'),
        ex('A historian writes: "Land reform in China ended landlordism but at a terrible human cost." Give evidence for both parts of the statement.', ['Ended landlordism: land was taken from landlords and given to about 300 million peasants.', 'Human cost: "struggle meetings" against landlords were often violent and many were killed.'], 'Both a social transformation and violent excesses'),
      ],
      practice: [
        mcq('china2', 'Recall the role of peasants, the Long March and 1949.', [
          ['When was the People\'s Republic of China proclaimed?', '1 October 1949', ['1 October 1911', '15 August 1947', '4 May 1919'], 'After the civil war ended.', 'Mao proclaimed the PRC in Beijing on 1 October 1949.'],
          ['The main social base of the Chinese Communist revolution was…', 'The peasantry', ['Factory workers in Europe', 'Landlords', 'Foreign traders'], 'China was mostly rural.', 'Mao built the revolution on peasant support.'],
          ['The Long March (1934–35) was…', 'A retreat of the Communist army across China to Yan\'an', ['A peace march to Beijing', 'A Japanese invasion route', 'A trade route to Russia'], 'It covered about 10,000 km.', 'Escaping encirclement, the Communists marched to the north-west.'],
          ['Mao\'s idea of an alliance of classes led by the Communist Party was called…', 'New Democracy', ['Three Principles', 'Collectivisation', 'Indirect rule'], 'He described it in 1940.', 'New Democracy brought workers, peasants and national capitalists together under CCP leadership.'],
          ['What did the Chinese Marriage Law of 1950 do?', 'Banned child and forced marriage and allowed women to divorce', ['Made marriage compulsory', 'Allowed polygamy', 'Removed women\'s property rights'], 'It aimed at women\'s equality.', 'The law gave women freedom of choice in marriage and divorce.'],
          ['After losing the civil war, the Guomindang government moved to…', 'Taiwan', ['Tibet', 'Korea', 'Hong Kong'], 'An island off China\'s coast.', 'Chiang Kai-shek\'s government withdrew to Taiwan in 1949.'],
        ]),
        timelineT('timeline', 'Put these events in time order.', c13China.slice(2), ['The Japanese full-scale invasion came after the Long March.', 'Land reform followed the founding of the PRC.']),
        tapT('tap', 'Tap every change introduced in the People\'s Republic of China around 1950.', [
          ['Landlords\' land was redistributed to peasants', true], ['Child marriage was banned', true], ['Women got the right to divorce', true], ['Landlordism was ended', true],
          ['The emperor was restored', false], ['Land was handed back to landlords', false], ['Foreign powers were given new ports', false],
        ], ['Think of land and of women\'s rights.', 'The monarchy had ended in 1911.'], 'Land reform and the Marriage Law were the key early changes.'),
      ],
    },
    {
      id: 'ts10.ss.liberation.nigeria', title: 'Nigeria: colonialism, independence, oil and politics', prereqs: [],
      intro: [
        h('A country drawn by colonial rulers'),
        photo('🌍', 'Nigeria in West Africa is Africa\'s most populous country. Its borders were drawn by Britain, joining many different peoples into one colony.'),
        p('Nigeria today has more than 250 languages. Three large groups dominate: the Hausa-Fulani in the north (mostly Muslim), the Yoruba in the south-west and the Igbo in the south-east (many Christian). Before British rule these were separate kingdoms and societies. Britain annexed Lagos in 1861, gradually took over the interior and in 1914 joined the Northern and Southern Protectorates into a single colony called Nigeria.'),
        def('Indirect rule', 'The British method, associated with Frederick Lugard, of ruling through existing traditional chiefs and emirs, who collected taxes and kept order under British supervision.'),
        p('Indirect rule was cheap for Britain, but it kept north and south apart: the north had few Western-style schools, while the south got more missionary education. This uneven development later created political rivalry between regions.'),
        h('Towards independence'),
        stepsB(
          'Educated Nigerians form newspapers and parties; Herbert Macaulay and Nnamdi Azikiwe become early nationalist leaders.',
          'After the Second World War, demands for self-rule grow; parties form around the three big regions.',
          'Britain introduces constitutions giving Nigerians more power step by step.',
          '1 October 1960: Nigeria becomes independent; in 1963 it becomes a republic (Azikiwe as President).',
        ),
        h('Oil and politics'),
        p('Oil was discovered in the Niger Delta in 1956, and by the 1970s it provided most of the government\'s income and exports. Control over oil revenue intensified competition between regions. In 1966 there were military coups, and in 1967 the south-east declared itself the independent Republic of Biafra. The civil war (1967–70) and the famine that came with it killed an estimated one million or more people before Biafra surrendered.'),
        p('For much of the period from 1966 to 1999 Nigeria was ruled by the military. Oil money brought wealth to some, but people of the Niger Delta suffered oil spills and polluted farmland and fishing waters while seeing little benefit. The Ogoni movement led by writer Ken Saro-Wiwa protested peacefully; he was executed by the military government in 1995, causing worldwide outrage. Civilian rule returned in 1999.'),
        def('Resource curse', 'A situation where a country rich in a natural resource (like oil) suffers from conflict, corruption or weak development because of fights over who controls that wealth.'),
        keys('British colony; Lagos 1861; amalgamated into Nigeria in 1914.', 'Indirect rule through chiefs and emirs kept regions apart.', 'Independence 1 October 1960; republic 1963.', 'Oil (found 1956) brought wealth but also conflict, civil war (1967–70), military rule and pollution.'),
        remember('Nigeria: independent 1 October 1960. Biafran civil war 1967–70. Return to civilian rule 1999.'),
        tip('In a comparison question, note that India and Nigeria both had British rule, but India\'s national movement was a single all-India movement while Nigeria\'s politics divided along regional lines.'),
      ],
      examples: [
        ex('How did indirect rule affect Nigeria\'s unity after independence?', ['Britain ruled the north through emirs and kept missionaries and Western schools out.', 'The south got more Western education and jobs in administration.', 'The regions developed differently and distrusted each other.', 'After 1960, parties formed along regional lines, leading to conflict.'], 'It deepened regional divisions that troubled independent Nigeria'),
        ex('Explain why oil has been called both a blessing and a curse for Nigeria.', ['Blessing: oil provides most of government income and export earnings.', 'Curse: fights over oil money fed regional conflict and military rule.', 'People of the Niger Delta suffered pollution and gained little.'], 'It brought revenue but also conflict, corruption and environmental damage'),
      ],
      practice: [
        mcq('nigeria', 'Remember: British colony → independence 1960 → oil and conflict.', [
          ['When did Nigeria become independent?', '1 October 1960', ['15 August 1947', '1 October 1949', '26 January 1950'], 'Many African countries became free in 1960.', 'Nigeria became independent on 1 October 1960.'],
          ['Ruling through traditional chiefs and emirs is called…', 'Indirect rule', ['Direct rule', 'Collective security', 'Non-alignment'], 'The British used local rulers.', 'Under indirect rule Britain governed through existing chiefs.'],
          ['Which colonial power ruled Nigeria?', 'Britain', ['France', 'Portugal', 'Belgium'], 'Same as India.', 'Nigeria was a British colony.'],
          ['Where was oil discovered in Nigeria in 1956?', 'In the Niger Delta', ['In the Sahara', 'Near Lake Chad', 'In Lagos city'], 'Near the coast of the south.', 'The first commercial find was at Oloibiri in the Niger Delta.'],
          ['The Nigerian civil war (1967–70) followed the south-east declaring itself…', 'Biafra', ['Ghana', 'Ogoni', 'Hausaland'], 'It was a breakaway republic.', 'The Republic of Biafra was declared in 1967.'],
          ['Ken Saro-Wiwa is remembered for…', 'Leading a peaceful protest of the Ogoni people against oil pollution', ['Founding the Guomindang', 'Leading the 1960 independence talks', 'Discovering oil'], 'He was executed in 1995.', 'He led the Ogoni movement against environmental damage and was executed by the military regime.'],
        ]),
        timelineT('timeline', 'Put these events in Nigerian history in order.', c13Nigeria, ['British control came long before independence.', 'Oil was found four years before independence.']),
        tapT('tap', 'Tap every problem linked with oil in Nigeria.', [
          ['Pollution of farmland and fishing waters in the Niger Delta', true], ['Rivalry between regions over oil revenue', true], ['Corruption and military rule', true], ['Little benefit for local Delta communities', true],
          ['It was discovered before British rule began', false], ['It ended all conflict in Nigeria', false], ['It is found mainly in the northern desert', false],
        ], ['Think of the environment, money and power.', 'Oil was discovered in 1956.'], 'Oil wealth fed conflict, corruption and pollution while the Delta stayed poor.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 14 — National Movement in India: Partition and Independence (1939-1947)
// =====================================================================================
const c14Events: [number, string, string][] = [
  [1939.09, 'India declared a party to the war by the Viceroy without consulting Indians', 'September 1939'],
  [1939.10, 'Congress ministries in the provinces resign', 'October–November 1939'],
  [1940.03, 'Muslim League passes the Lahore (Pakistan) Resolution', '23 March 1940'],
  [1942.03, 'Cripps Mission comes to India', 'March 1942'],
  [1942.08, 'Quit India resolution passed in Bombay', '8 August 1942'],
  [1943.10, 'Subhas Chandra Bose forms the Provisional Government of Azad Hind', 'October 1943'],
  [1946.02, 'Royal Indian Navy ratings revolt in Bombay', 'February 1946'],
  [1946.03, 'Cabinet Mission arrives in India', 'March 1946'],
  [1946.08, 'Direct Action Day; violence in Calcutta', '16 August 1946'],
  [1946.09, 'Interim Government headed by Jawaharlal Nehru takes office', '2 September 1946'],
  [1947.06, 'Mountbatten Plan for Partition announced', '3 June 1947'],
  [1947.08, 'India becomes independent', '15 August 1947'],
  [1948.01, 'Mahatma Gandhi is assassinated', '30 January 1948'],
];

const ch14: USpec = {
  id: 'ts10.ss.ch14', subject: 'social', title: 'National Movement in India - Partition & Independence: 1939-1947', source: src(14),
  objectives: [
    {
      id: 'ts10.ss.freedom.quit-india', title: 'India and the Second World War; the Quit India Movement', prereqs: [],
      intro: [
        h('"Do or Die"'),
        photo('🗣️', 'On 8 August 1942 at the Gowalia Tank Maidan in Bombay, Gandhiji told Indians: "Do or Die" — free India or die in the attempt.'),
        p('In September 1939 the Viceroy, Lord Linlithgow, announced that India was at war with Germany. He did not ask a single elected Indian leader. The Congress was against fascism, but it asked: how can India fight for freedom in Europe while it is not free itself? It asked Britain to promise independence after the war. Britain refused, and Congress ministries in the provinces resigned in protest in late 1939.'),
        stepsB(
          '1939: India dragged into the war; Congress ministries resign.',
          '1940: Individual Satyagraha — chosen individuals, beginning with Vinoba Bhave, make anti-war speeches and court arrest.',
          'March 1942: with Japan advancing towards India, Britain sends Sir Stafford Cripps. He offers dominion status after the war and the right of provinces to stay out of the Indian Union, but no real power now. Congress and the League both reject it.',
          '8 August 1942: the Congress passes the Quit India resolution in Bombay. Early on 9 August Gandhi and all major leaders are arrested.',
          'Leaderless, people protest across India: strikes, attacks on railway lines, police stations and telegraph wires. "Parallel governments" are set up in places like Ballia (UP), Satara (Maharashtra) and Tamluk (Bengal).',
          'Young leaders like Aruna Asaf Ali, Jayaprakash Narayan and Ram Manohar Lohia work underground; Usha Mehta runs a secret Congress Radio.',
        ),
        p('The British crushed the movement with great force: thousands were killed, and around 90,000 or more were arrested. Even so, it showed that Indians would no longer accept British rule and that Britain could govern only by force.'),
        h('Subhas Chandra Bose and the INA'),
        def('Indian National Army (Azad Hind Fauj)', 'An army formed mainly from Indian soldiers captured by Japan in South-East Asia. Subhas Chandra Bose took charge in 1943, set up a Provisional Government of Free India in Singapore and fought alongside Japan towards India\'s north-east under the slogan "Delhi Chalo".'),
        p('The INA did not win militarily, but the courage of its soldiers inspired Indians, and the trials of INA officers in 1945 united the country in protest. The war also brought hardship: prices rose sharply, and the Bengal famine of 1943 killed an estimated three million people.'),
        keys('India was made a party to the war without consulting Indians (1939).', 'Cripps Mission (1942) failed — no real transfer of power.', 'Quit India: 8 August 1942, "Do or Die"; leaders arrested at once; people continued.', 'Subhas Bose\'s INA and the Azad Hind government (1943).'),
        remember('Quit India Movement launched 8 August 1942 (August Kranti). Slogan: "Do or Die".'),
        tip('9 August is remembered as August Kranti Day — the day the leaders were arrested and the people took over the movement.'),
      ],
      examples: [
        ex('Why did the Congress reject the Cripps proposals of 1942?', ['They offered dominion status only after the war, not freedom now.', 'Provinces could opt out of the Indian Union, which threatened India\'s unity.', 'Defence would stay in British hands during the war.'], 'The proposals gave no real power and risked dividing India'),
        ex('Explain why the Quit India Movement was a "leaderless" mass movement.', ['All top Congress leaders were arrested in the early hours of 9 August 1942.', 'Without them, students, peasants, workers and women organised protests on their own.', 'Underground leaders and parallel governments carried it forward.'], 'Ordinary people led it after the leaders were jailed'),
      ],
      practice: [
        mcq('qi', 'Keep the sequence: war → Cripps → Quit India.', [
          ['When was the Quit India resolution passed?', '8 August 1942', ['26 January 1930', '15 August 1947', '23 March 1940'], 'At the Gowalia Tank Maidan, Bombay.', 'The AICC passed the Quit India resolution on 8 August 1942.'],
          ['What was Gandhiji\'s call during the Quit India Movement?', 'Do or Die', ['Delhi Chalo', 'Jai Jawan Jai Kisan', 'Swaraj is my birthright'], 'Free India or die trying.', 'Gandhi\'s mantra was "Do or Die".'],
          ['Who was the first individual satyagrahi in 1940?', 'Vinoba Bhave', ['Jawaharlal Nehru', 'Subhas Chandra Bose', 'Sardar Patel'], 'A close follower of Gandhi.', 'Gandhi chose Vinoba Bhave as the first individual satyagrahi.'],
          ['Why did Congress ministries resign in 1939?', 'India was dragged into the war without consulting Indians', ['They lost elections', 'The British gave independence', 'They joined the INA'], 'The Viceroy acted alone.', 'They resigned in protest against the unilateral declaration of war.'],
          ['Who led the Indian National Army from 1943?', 'Subhas Chandra Bose', ['Mohan Singh', 'Bhagat Singh', 'Lala Lajpat Rai'], 'Slogan "Delhi Chalo".', 'Bose took command of the INA and formed the Azad Hind government.'],
          ['What did the Cripps Mission (1942) offer?', 'Dominion status after the war', ['Immediate full independence', 'A separate Pakistan at once', 'Nothing at all'], 'The offer was for the future.', 'Cripps offered dominion status after the war, which Congress rejected.'],
        ]),
        matchT('match', 'person to their role in 1939–45', [
          ['Lord Linlithgow', 'Viceroy who declared India at war'], ['Stafford Cripps', 'Led the 1942 mission'], ['Vinoba Bhave', 'First individual satyagrahi'], ['Usha Mehta', 'Ran the secret Congress Radio'],
          ['Subhas Chandra Bose', 'Led the INA and Azad Hind government'], ['Aruna Asaf Ali', 'Hoisted the flag at Gowalia Tank in 1942'],
        ], ['Start with the British officials.', 'Usha Mehta and radio go together.']),
        timelineT('timeline', 'Put these events in order.', c14Events.slice(0, 7), ['The war began in 1939.', 'The INA government was formed after Quit India.']),
      ],
    },
    {
      id: 'ts10.ss.freedom.league', title: 'The Muslim League and the demand for Pakistan', prereqs: ['ts10.ss.freedom.quit-india'],
      intro: [
        h('Two visions of a free nation'),
        photo('📜', 'The Lahore Resolution of March 1940 asked for independent states in the Muslim-majority areas of the north-west and east of India.'),
        p('Every Indian nationalist wanted the British to leave. But leaders disagreed about what kind of country should take their place. The Congress saw one Indian nation in which people of all religions were equal citizens. The Muslim League, led by Muhammad Ali Jinnah, came to argue that Muslims were a separate nation who needed their own state to protect their political and cultural future.'),
        def('All-India Muslim League', 'A political party founded in 1906 at Dhaka to represent Muslim interests. Under Jinnah in the late 1930s and 1940s it became the main voice demanding Pakistan.'),
        def('Two-nation theory', 'The idea that Hindus and Muslims of India formed two separate nations. It was the basis of the Pakistan demand, and was rejected by the Congress and many Muslims.'),
        stepsB(
          '1937: in the provincial elections the League does poorly, even in Muslim-majority provinces; the Congress forms governments in most provinces and refuses to share power with the League in the United Provinces.',
          'League leaders allege that Muslims were ignored under Congress ministries; when those ministries resign in 1939, the League celebrates a "Day of Deliverance".',
          '23 March 1940: the League\'s Lahore session passes the resolution for independent states in Muslim-majority areas — later called the Pakistan Resolution.',
          'During the war, with Congress leaders in jail, the League expands its organisation and support.',
          '1945–46 elections: the League wins most of the seats reserved for Muslims; the Congress wins most of the general seats.',
        ),
        h('Different perspectives'),
        p('Historians explain the rise of the Pakistan demand in several ways. Some stress Muslim fears of being a permanent minority in a Hindu-majority democracy. Some stress the failure of Congress–League negotiations and mistrust between leaders. Others point out that British policies — separate electorates from 1909 and encouraging divisions — made communal politics stronger. Many Muslims, such as Maulana Abul Kalam Azad and Khan Abdul Ghaffar Khan, opposed Partition and remained with the Congress.'),
        keys('Muslim League founded 1906; led by Jinnah in the 1940s.', 'Two-nation theory: Hindus and Muslims as separate nations.', 'Lahore (Pakistan) Resolution: 23 March 1940.', 'Several causes: minority fears, failed negotiations, British policies; many Muslims opposed Partition.'),
        remember('Lahore Resolution — 23 March 1940. Muslim League founded — 1906, Dhaka.'),
        tip('In "Why Partition?" answers, give more than one cause and mention more than one viewpoint — examiners reward balance.'),
      ],
      examples: [
        ex('How did the 1937 elections affect relations between the Congress and the League?', ['The League won few seats; the Congress formed governments in most provinces.', 'The Congress did not form coalitions with the League (e.g. in the United Provinces).', 'League leaders felt shut out and began to argue that Muslims needed separate political power.'], 'They deepened mistrust and pushed the League towards a separate-state demand'),
        ex('Give two different explanations historians offer for the demand for Pakistan.', ['Explanation 1: fear among many Muslims of being a permanent minority without enough safeguards.', 'Explanation 2: British policies such as separate electorates encouraged politics based on religion.', '(Also: failure of negotiations and personal mistrust among leaders.)'], 'Minority fears; British divide-and-rule; failed negotiations'),
      ],
      practice: [
        mcq('league', 'Remember the League, Jinnah and the 1940 resolution.', [
          ['Who led the Muslim League in its demand for Pakistan?', 'Muhammad Ali Jinnah', ['Maulana Abul Kalam Azad', 'Khan Abdul Ghaffar Khan', 'Sardar Patel'], 'He became Pakistan\'s first Governor-General.', 'Jinnah led the League in the 1940s.'],
          ['When was the Lahore (Pakistan) Resolution passed?', '23 March 1940', ['8 August 1942', '16 August 1946', '3 June 1947'], 'Early in the war years.', 'The Lahore session passed it on 23 March 1940.'],
          ['The idea that Hindus and Muslims formed two separate nations is the…', 'Two-nation theory', ['Doctrine of lapse', 'Non-alignment', 'New Democracy'], 'Its name tells you the idea.', 'This was the basis of the Pakistan demand.'],
          ['The League celebrated a "Day of Deliverance" in 1939 when…', 'Congress ministries resigned', ['India became independent', 'The war ended', 'Gandhi was arrested'], 'It welcomed the end of Congress rule in the provinces.', 'In December 1939 the League marked the resignation of Congress ministries.'],
          ['Which leader was a Muslim who strongly opposed Partition?', 'Khan Abdul Ghaffar Khan', ['Muhammad Ali Jinnah', 'Lord Mountbatten', 'Lord Linlithgow'], 'Known as "Frontier Gandhi".', 'Khan Abdul Ghaffar Khan opposed Partition throughout.'],
          ['In the 1945–46 elections the Muslim League…', 'Won most of the seats reserved for Muslims', ['Won no seats', 'Won most general seats', 'Boycotted the elections'], 'This strengthened its claim to speak for Muslims.', 'The League\'s success in Muslim seats strengthened the Pakistan demand.'],
        ]),
        tapT('tap', 'Tap every factor that historians link to the growth of the Pakistan demand.', [
          ['Muslim fears of being a permanent minority', true], ['Separate electorates introduced by the British', true], ['Failure of Congress–League negotiations', true], ['Mistrust after the 1937 provincial governments', true],
          ['A unanimous wish of all Indian Muslims', false], ['A demand made first by the Cabinet Mission', false], ['Support for Partition from Khan Abdul Ghaffar Khan', false],
        ], ['There were several causes, not one.', 'Not all Muslims supported the demand.'], 'Minority fears, British policies, failed negotiations and mistrust all played a part; many Muslims opposed it.'),
        matchT('match', 'person or term to its description', [
          ['Muhammad Ali Jinnah', 'League leader who demanded Pakistan'], ['Maulana Abul Kalam Azad', 'Congress president who opposed Partition'], ['Lahore Resolution', 'League demand of 1940'],
          ['Separate electorates', 'Seats in which only Muslims voted for Muslim candidates'], ['Day of Deliverance', 'League celebration in December 1939'], ['Two-nation theory', 'Idea of Hindus and Muslims as separate nations'],
        ], ['Start with the two leaders.', 'The 1939 event and the 1940 event are different.']),
      ],
    },
    {
      id: 'ts10.ss.freedom.upsurge', title: 'Popular upsurge and negotiations, 1945-1947', prereqs: ['ts10.ss.freedom.quit-india'],
      intro: [
        h('The last two years of British rule'),
        photo('🚢', 'In February 1946 sailors of the Royal Indian Navy in Bombay revolted, raising the flags of the Congress, the League and the Communist Party together.'),
        p('When the war ended in 1945, Britain was exhausted and in debt, and a new Labour government under Clement Attlee was more willing to leave India. At the same time, India was boiling with protest. The question was no longer whether Britain would leave, but how — and to whom it would hand over power.'),
        h('A wave of popular protest'),
        stepsB(
          'Winter 1945–46: INA officers are tried at the Red Fort; protests across India demand their release.',
          'February 1946: Royal Indian Navy ratings in Bombay revolt; strikes and support spread to other ports and cities.',
          'Peasant struggles: the Tebhaga movement in Bengal demands that sharecroppers keep two-thirds of the crop; in Telangana an armed peasant struggle (1946–51) rises against landlords (deshmukhs) and the Nizam\'s rule.',
          'Workers strike in railways, posts and factories.',
        ),
        p('Britain realised that it could no longer rely on Indian soldiers and police to hold India by force.'),
        h('Negotiations'),
        def('Cabinet Mission (1946)', 'Three British ministers sent in March 1946. Their plan proposed a united India with a weak centre and provinces grouped into three sections, two of them Muslim-majority. Both parties first accepted it but disagreed on how grouping would work, and it collapsed.'),
        def('Direct Action Day', '16 August 1946, called by the League to press for Pakistan. It was followed by terrible communal killings in Calcutta, which spread to Noakhali, Bihar and Punjab.'),
        def('Interim Government', 'Formed on 2 September 1946 with Jawaharlal Nehru as its head; the League joined later in October 1946.'),
        p('By early 1947 violence was spreading and the Interim Government was deadlocked. In February 1947 Attlee announced that Britain would leave India by June 1948. Lord Mountbatten arrived as the last Viceroy to arrange the handover.'),
        keys('After 1945 Britain was weak; India saw strikes, mutinies and peasant struggles.', 'INA trials and RIN revolt showed the armed forces could no longer be trusted by Britain.', 'Cabinet Mission (1946) tried to keep India united but failed.', 'Direct Action Day (16 August 1946) set off communal violence; Interim Government formed in September 1946.'),
        remember('Cabinet Mission: March 1946. Interim Government under Nehru: 2 September 1946. Attlee\'s announcement: February 1947.'),
        tip('The Telangana peasant struggle belongs to this period — link it to Chapter 21 on the Hyderabad State.'),
      ],
      examples: [
        ex('Why was the RIN revolt of 1946 a warning to the British?', ['Britain ruled India with the help of Indian soldiers and sailors.', 'When sailors revolted and were supported by city workers, it showed Britain could not depend on its armed forces.', 'Without loyal forces, holding India by force was impossible.'], 'It showed that the armed forces, the pillar of British rule, were no longer reliable'),
        ex('Why did the Cabinet Mission plan fail?', ['It proposed a united India with provinces grouped into sections.', 'The Congress wanted provinces free not to join a group; the League wanted compulsory grouping as a step to Pakistan.', 'Mistrust grew; the League withdrew its acceptance and called for Direct Action.'], 'The Congress and the League interpreted grouping differently and mistrust grew'),
      ],
      practice: [
        mcq('upsurge', 'Picture India in 1946: strikes, mutiny, talks and riots.', [
          ['The Royal Indian Navy revolt took place in…', 'February 1946 in Bombay', ['August 1942 in Delhi', '1857 in Meerut', 'June 1947 in Calcutta'], 'It began on the ship HMIS Talwar.', 'The RIN revolt began in Bombay in February 1946.'],
          ['The Tebhaga movement in Bengal demanded…', 'Two-thirds of the crop for sharecroppers', ['Abolition of salt tax', 'A separate state', 'Release of INA soldiers'], 'Tebhaga = "three shares".', 'Sharecroppers demanded two-thirds instead of half of the harvest.'],
          ['Who headed the Interim Government formed in September 1946?', 'Jawaharlal Nehru', ['Muhammad Ali Jinnah', 'Lord Wavell', 'Sardar Patel'], 'He later became the first Prime Minister.', 'Nehru headed the Interim Government from 2 September 1946.'],
          ['Direct Action Day was observed on…', '16 August 1946', ['8 August 1942', '15 August 1947', '26 January 1950'], 'Called by the Muslim League.', 'The League\'s Direct Action Day on 16 August 1946 led to the Calcutta killings.'],
          ['The Cabinet Mission plan proposed…', 'A united India with provinces in groups and a weak centre', ['Immediate Partition', 'Continued British rule', 'A military government'], 'It tried to satisfy both parties.', 'It suggested a loose federation with grouping of provinces.'],
          ['Which British Prime Minister announced in February 1947 that Britain would leave India?', 'Clement Attlee', ['Winston Churchill', 'Neville Chamberlain', 'Lloyd George'], 'He led the Labour government.', 'Attlee announced that Britain would quit by June 1948.'],
        ]),
        timelineT('timeline', 'Put these events in order.', c14Events.slice(5, 11), ['The navy revolt came before the Cabinet Mission.', 'The Interim Government came after Direct Action Day.']),
        tapT('tap', 'Tap every popular struggle of 1945–47.', [
          ['Protests against the INA trials', true], ['Royal Indian Navy revolt', true], ['Tebhaga movement in Bengal', true], ['Telangana peasant armed struggle', true],
          ['Champaran Satyagraha', false], ['Salt March to Dandi', false], ['Non-Cooperation Movement', false],
        ], ['Choose events after the Second World War.', 'Champaran (1917), Non-Cooperation (1920) and Dandi (1930) are older.'], 'INA protests, the RIN revolt, Tebhaga and the Telangana struggle belong to 1945–47.'),
      ],
    },
    {
      id: 'ts10.ss.freedom.partition', title: 'Partition, independence and the assassination of Gandhiji', prereqs: ['ts10.ss.freedom.league', 'ts10.ss.freedom.upsurge'],
      intro: [
        h('Freedom and sorrow together'),
        photo('🚆', 'In 1947 crowded trains carried refugees across the new borders in both directions. Partition caused one of the largest migrations in human history.'),
        p('At midnight on 14–15 August 1947 India became free. Nehru spoke of a "tryst with destiny". Yet in Punjab and Bengal, millions were leaving their homes in fear, and Gandhiji was not in Delhi celebrating — he was in Calcutta, fasting and praying for peace.'),
        stepsB(
          'March 1947: Lord Mountbatten arrives as Viceroy.',
          '3 June 1947: the Mountbatten Plan — British India will be partitioned into India and Pakistan; Punjab and Bengal will be divided; princely states may join either.',
          'July 1947: the British Parliament passes the Indian Independence Act.',
          '14 August 1947: Pakistan becomes independent. 15 August 1947: India becomes independent.',
          '17 August 1947: the Radcliffe Line (the new border) is made public — after independence.',
          '1947–48: mass migration and communal violence in Punjab, Bengal and elsewhere.',
          '30 January 1948: Gandhiji is shot dead in Delhi by Nathuram Godse.',
        ),
        def('Partition', 'The division of British India in 1947 into two independent dominions, India and Pakistan (with Pakistan in two parts, West and East).'),
        def('Radcliffe Line', 'The boundary drawn by a commission headed by Cyril Radcliffe, a British lawyer who had never been to India before, in about five weeks.'),
        h('The human cost'),
        p('Estimates vary, but somewhere between several hundred thousand and about one million people were killed, and around 10–15 million were uprooted. Women suffered abduction and violence on all sides. Families lost homes, land and relatives. Yet there were also many people who sheltered neighbours of other faiths, risking their own lives.'),
        p('Gandhiji spent his last months trying to stop the killings — walking through villages in Noakhali, and fasting in Calcutta and Delhi until leaders promised peace. Some extremists accused him of being too soft towards Muslims and Pakistan. On 30 January 1948, on his way to a prayer meeting at Birla House in Delhi, he was assassinated by Nathuram Godse. The shock of his death helped to calm communal passions, and the government banned communal organisations for a time.'),
        keys('Mountbatten Plan: 3 June 1947 — Partition, division of Punjab and Bengal.', 'Indian Independence Act, July 1947; India free on 15 August 1947.', 'Partition brought massive migration and violence; also many acts of courage.', 'Gandhiji worked for peace and was assassinated on 30 January 1948.'),
        remember('15 August 1947 — Independence. 30 January 1948 — Gandhiji\'s assassination (observed as Martyrs\' Day).'),
        tip('When writing about Partition, avoid blaming only one community or leader — the textbook and historians show many causes and suffering on all sides.'),
      ],
      examples: [
        ex('Why did the Congress leaders finally accept Partition in 1947, though they had opposed it for years?', ['Communal violence was spreading after August 1946.', 'The Interim Government with the League was deadlocked.', 'Leaders felt that a divided India was better than continued violence and a weak, paralysed centre.'], 'To end violence and deadlock and gain a strong, workable government'),
        ex('Source: a refugee recalls, "Our Muslim neighbour hid us in his grain store for three nights." What does this tell a historian about Partition?', ['Partition was not only a story of hatred between communities.', 'Ordinary people of one faith risked their lives to protect people of another.', 'Historians use such oral memories to show the complexity of the period.'], 'Alongside violence, there were humane acts across religious lines'),
      ],
      practice: [
        mcq('partition', 'Remember 3 June 1947, 15 August 1947 and 30 January 1948.', [
          ['The plan to partition India was announced on…', '3 June 1947', ['15 August 1947', '23 March 1940', '26 January 1950'], 'It is named after the last Viceroy.', 'The Mountbatten Plan of 3 June 1947 announced Partition.'],
          ['Who was the last Viceroy of British India?', 'Lord Mountbatten', ['Lord Linlithgow', 'Lord Wavell', 'Lord Curzon'], 'He came in March 1947.', 'Mountbatten was the last Viceroy and India\'s first Governor-General.'],
          ['Who drew the boundary between India and Pakistan?', 'A commission headed by Cyril Radcliffe', ['Jinnah and Nehru together', 'The League of Nations', 'Lord Cripps'], 'The line is named after him.', 'The Radcliffe Line was drawn by Cyril Radcliffe\'s commission.'],
          ['Which two provinces were divided at Partition?', 'Punjab and Bengal', ['Bombay and Madras', 'Bihar and Orissa', 'Sind and Assam'], 'Both had large Hindu and Muslim populations.', 'Punjab and Bengal were split between India and Pakistan.'],
          ['When was Mahatma Gandhi assassinated?', '30 January 1948', ['15 August 1947', '2 October 1948', '26 January 1950'], 'About five months after independence.', 'Gandhiji was killed on 30 January 1948 in Delhi.'],
          ['Where was Gandhiji on 15 August 1947?', 'In Calcutta, working for communal peace', ['In Delhi, hoisting the flag', 'In London', 'In Lahore'], 'He did not attend the celebrations.', 'He was in Calcutta trying to stop communal violence.'],
        ]),
        timelineT('timeline', 'Put these events in order.', c14Events.slice(7), ['Partition plan before independence.', 'Gandhiji was killed in 1948.']),
        tapT('tap', 'Tap every TRUE statement about Partition.', [
          ['Millions of people were uprooted', true], ['Punjab and Bengal were divided', true], ['The border was made public after independence day', true], ['Many people protected neighbours of other faiths', true],
          ['It was peaceful everywhere', false], ['Gandhiji led the celebrations in Delhi', false], ['Pakistan was created in 1950', false],
        ], ['Think of migration, violence and courage.', 'Pakistan was created on 14 August 1947.'], 'Partition uprooted millions and divided Punjab and Bengal; it also saw acts of courage.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 15 — The Making of Independent India's Constitution
// =====================================================================================
const c15Events: [number, string, string][] = [
  [1946.12, 'First meeting of the Constituent Assembly', '9 December 1946'],
  [1946.121, 'Nehru moves the Objectives Resolution', '13 December 1946'],
  [1947.01, 'Objectives Resolution adopted', '22 January 1947'],
  [1947.08, 'Drafting Committee set up with Dr B. R. Ambedkar as chairman', '29 August 1947'],
  [1948.02, 'Draft Constitution published', 'February 1948'],
  [1949.11, 'Constitution adopted by the Constituent Assembly', '26 November 1949'],
  [1950.01, 'Constitution comes into force; India becomes a republic', '26 January 1950'],
];

const ch15: USpec = {
  id: 'ts10.ss.ch15', subject: 'social', title: 'The Making of Independent India\'s Constitution', source: src(15),
  objectives: [
    {
      id: 'ts10.ss.const.assembly', title: 'The Constituent Assembly and how the Constitution was made', prereqs: [],
      intro: [
        h('Writing the rule book of a new nation'),
        photo('📖', 'The original Constitution of India was handwritten and decorated by artists from Santiniketan. It is one of the longest written constitutions in the world.'),
        p('Every game needs rules that all players accept. A country needs them even more: who makes laws, who governs, what rights citizens have, how power is shared between Delhi and the states. India\'s rules were written by Indians themselves in a Constituent Assembly — not handed down by the British.'),
        def('Constitution', 'The basic law of a country: it sets up the institutions of government, divides powers among them, and lists the rights of citizens. All other laws must follow it.'),
        def('Constituent Assembly', 'The body of elected representatives that drafted India\'s Constitution between 1946 and 1949. Its members were elected in 1946 by the provincial assemblies, with representatives of princely states added; after Partition it had about 299 members.'),
        stepsB(
          '9 December 1946: the Constituent Assembly meets for the first time in Delhi.',
          '11 December 1946: Dr Rajendra Prasad is elected its permanent President.',
          '13 December 1946: Nehru moves the Objectives Resolution — a free, sovereign republic with justice, liberty and equality for all; it is adopted on 22 January 1947.',
          'Committees study different subjects (rights, minorities, union powers, states).',
          '29 August 1947: a Drafting Committee is formed with Dr B. R. Ambedkar as chairman.',
          'The draft is debated clause by clause; thousands of amendments are discussed.',
          '26 November 1949: the Constitution is adopted (now Constitution Day).',
          '26 January 1950: it comes into force and India becomes a republic.',
        ),
        p('The Assembly included members of different regions, religions, castes and political views, including about 15 women such as Sarojini Naidu, Hansa Mehta and Durgabai Deshmukh. Many members were from the Congress, but leaders made a point of including others, such as Dr Ambedkar, who had often criticised the Congress. The whole process took almost three years (2 years, 11 months and 18 days). Its debates were published, so citizens can still read why each article was chosen.'),
        p('Why 26 January? On 26 January 1930 the Congress had declared Purna Swaraj (complete independence) as its goal; the date was chosen to honour that pledge.'),
        keys('The Constitution was made by Indians in the Constituent Assembly (1946–49).', 'President: Dr Rajendra Prasad. Drafting Committee chairman: Dr B. R. Ambedkar.', 'Adopted 26 November 1949; in force 26 January 1950.', 'Members represented many regions, communities and views; debates were open.'),
        remember('26 November = Constitution Day (adoption, 1949). 26 January = Republic Day (came into force, 1950).'),
        tip('Ambedkar is called the "chief architect" of the Constitution because he steered the draft through the Assembly.'),
      ],
      examples: [
        ex('Why was 26 January chosen as the day the Constitution came into force?', ['On 26 January 1930, the Congress had declared Purna Swaraj (complete independence) as its goal.', 'Indians had celebrated that day as Independence Day every year until 1947.', 'Choosing it in 1950 linked the new republic with the freedom struggle.'], 'To honour the Purna Swaraj pledge of 26 January 1930'),
        ex('Why is it important that the Constituent Assembly debated every clause in public?', ['It allowed different views to be heard and compromises to be reached.', 'Records of the debates explain the meaning and purpose of each article.', 'Courts and citizens can still use them to understand the Constitution.'], 'It made the Constitution open, thoughtful and easier to interpret'),
      ],
      practice: [
        timelineT('timeline', 'Put these steps in the making of the Constitution in order.', c15Events, ['The Assembly met before the Drafting Committee was formed.', 'Adoption came two months before it came into force.'], 5),
        mcq('assembly', 'Remember the people and the dates of 1946–1950.', [
          ['Who was the chairman of the Drafting Committee?', 'Dr B. R. Ambedkar', ['Dr Rajendra Prasad', 'Jawaharlal Nehru', 'Sardar Patel'], 'He is called the chief architect of the Constitution.', 'Dr Ambedkar chaired the Drafting Committee.'],
          ['Who was the President of the Constituent Assembly?', 'Dr Rajendra Prasad', ['Dr B. R. Ambedkar', 'Sarojini Naidu', 'Maulana Azad'], 'He later became the first President of India.', 'Dr Rajendra Prasad presided over the Assembly.'],
          ['When was the Constitution adopted?', '26 November 1949', ['26 January 1950', '15 August 1947', '9 December 1946'], 'Now celebrated as Constitution Day.', 'The Assembly adopted the Constitution on 26 November 1949.'],
          ['When did the Constitution come into force?', '26 January 1950', ['26 November 1949', '15 August 1947', '2 October 1950'], 'Republic Day.', 'It came into force on 26 January 1950.'],
          ['Who moved the Objectives Resolution in December 1946?', 'Jawaharlal Nehru', ['Dr Ambedkar', 'Mahatma Gandhi', 'Muhammad Ali Jinnah'], 'He became the first Prime Minister.', 'Nehru moved the Objectives Resolution on 13 December 1946.'],
          ['How were members of the Constituent Assembly chosen in 1946?', 'Elected by the provincial legislative assemblies', ['Directly by all adult citizens', 'Nominated by the British King', 'Chosen by lottery'], 'It was an indirect election.', 'Provincial assemblies elected the members (princely states sent representatives).'],
        ]),
        matchT('match', 'person to their role in the Constituent Assembly', [
          ['Dr B. R. Ambedkar', 'Chairman of the Drafting Committee'], ['Dr Rajendra Prasad', 'President of the Assembly'], ['Jawaharlal Nehru', 'Moved the Objectives Resolution'],
          ['Hansa Mehta', 'Woman member who worked for women\'s equal rights'], ['B. N. Rau', 'Constitutional Adviser who prepared an early draft'], ['Sardar Patel', 'Chaired committees on rights, minorities and provinces'],
        ], ['Start with Ambedkar and Prasad.', 'B. N. Rau was an adviser, not an elected leader.']),
      ],
    },
    {
      id: 'ts10.ss.const.rights', title: 'Debates on Fundamental Rights and Directive Principles', prereqs: ['ts10.ss.const.assembly'],
      intro: [
        h('Rights you can take to court'),
        photo('⚖', 'If a fundamental right is violated, any citizen can go straight to the Supreme Court (Article 32) or a High Court (Article 226).'),
        p('Suppose a shop refuses to serve you because of your caste, or police jail you without telling you why. What can you do? The Constitution gives every citizen Fundamental Rights that the government itself must respect, and courts can enforce them.'),
        def('Fundamental Rights', 'Basic rights in Part III of the Constitution (Articles 12–35) that are justiciable — they can be enforced by courts.'),
        def('Directive Principles of State Policy', 'Guidelines in Part IV (Articles 36–51) that the government should follow in making policies, such as equal pay for equal work and adequate livelihood. They are not justiciable — courts cannot enforce them — but they are "fundamental in the governance of the country".'),
        h('The six Fundamental Rights'),
        stepsB(
          'Right to Equality (Articles 14–18): equality before law; no discrimination; equal opportunity in public jobs; abolition of untouchability; abolition of titles.',
          'Right to Freedom (Articles 19–22): freedom of speech, assembly, association, movement, residence and profession; protection of life and personal liberty.',
          'Right against Exploitation (Articles 23–24): ban on human trafficking and forced labour; no child under 14 in factories, mines or hazardous work.',
          'Right to Freedom of Religion (Articles 25–28): freedom to profess, practise and propagate religion.',
          'Cultural and Educational Rights (Articles 29–30): minorities may conserve their culture and run their own educational institutions.',
          'Right to Constitutional Remedies (Article 32): the right to go to the Supreme Court to enforce these rights.',
        ),
        h('What did members debate?'),
        p('Members argued about many questions. Should rights be absolute, or can the state put "reasonable restrictions" on them for public order and security? The final text allowed reasonable restrictions, which some members feared might weaken freedom. Should economic rights such as the right to work be enforceable? The Assembly decided that India could not yet guarantee them, so they were placed among the Directive Principles. The right to property was a fundamental right at first, but was removed from that list by the 44th Amendment in 1978; it is now a legal right (Article 300A).'),
        p('Dr Ambedkar called Article 32 the "heart and soul" of the Constitution, because without a remedy, rights would be only words on paper.'),
        keys('Fundamental Rights (Part III) are enforceable in courts; Directive Principles (Part IV) are not.', 'Six rights: equality, freedom, against exploitation, religion, cultural & educational, constitutional remedies.', 'Rights carry reasonable restrictions.', 'Right to property moved out of Fundamental Rights in 1978.'),
        remember('Article 17 abolishes untouchability. Article 32 = right to constitutional remedies ("heart and soul" — Ambedkar). Article 21A (added 2002) = right to education for children aged 6–14.'),
        tip('Justiciable = can be taken to a court of justice. Fundamental Rights yes; Directive Principles no.'),
      ],
      examples: [
        ex('A 12-year-old is made to work in a firecracker factory. Which Fundamental Right is violated and which article?', ['Working in a factory with explosives is hazardous employment.', 'The Right against Exploitation forbids employing children under 14 in factories or hazardous work.', 'This is Article 24.'], 'Right against Exploitation — Article 24'),
        ex('Why did the Assembly put "right to adequate livelihood" among the Directive Principles and not the Fundamental Rights?', ['In 1950 India was very poor and could not guarantee work or income to everyone at once.', 'If made enforceable, courts would have orders the government could not fulfil.', 'So it was kept as a goal the government must work towards.'], 'Because the state could not yet guarantee it; it was set as a goal for policy'),
      ],
      practice: [
        matchT('match', 'article to the right it gives', [
          ['Article 14', 'Equality before law'], ['Article 17', 'Abolition of untouchability'], ['Article 19', 'Freedom of speech and expression'], ['Article 21A', 'Free education for children aged 6–14'],
          ['Article 24', 'No child labour in factories or hazardous work'], ['Article 25', 'Freedom of religion'], ['Article 32', 'Right to constitutional remedies'],
        ], ['Article 32 is the "heart and soul".', 'Article 17 is the untouchability article.']),
        mcq('rights', 'Separate justiciable rights from policy goals.', [
          ['Which right did Dr Ambedkar call the "heart and soul" of the Constitution?', 'Right to Constitutional Remedies', ['Right to Equality', 'Right to Freedom of Religion', 'Right to Property'], 'Without it, rights cannot be enforced.', 'Article 32 lets citizens go to the Supreme Court to enforce their rights.'],
          ['Directive Principles of State Policy are…', 'Guidelines for government that courts cannot enforce', ['Rights enforceable in courts', 'Rules for elections', 'Duties of the President only'], 'Not justiciable.', 'They guide policy but are not enforceable in court.'],
          ['The right to property was removed from the list of Fundamental Rights in…', '1978', ['1950', '1991', '2014'], 'By the 44th Amendment.', 'The 44th Amendment (1978) made property a legal right under Article 300A.'],
          ['Fundamental Rights are in which Part of the Constitution?', 'Part III', ['Part IV', 'Part I', 'Part XVIII'], 'Directive Principles are in the next Part.', 'Part III (Articles 12–35) contains the Fundamental Rights.'],
          ['Which is a Directive Principle, not a Fundamental Right?', 'Equal pay for equal work for men and women', ['Freedom of speech', 'Equality before law', 'Freedom of religion'], 'It is a policy goal.', 'Equal pay for equal work is listed among the Directive Principles.'],
          ['"Reasonable restrictions" on freedoms mean that…', 'The state may limit rights for reasons such as public order and security', ['Rights can never be limited', 'Only the rich have rights', 'Rights apply only during elections'], 'Freedom is not unlimited.', 'The Constitution allows reasonable limits in the interest of public order, security and others\' rights.'],
        ]),
        tapT('tap', 'Tap every FUNDAMENTAL RIGHT (not a Directive Principle).', [
          ['Equality before law', true], ['Freedom of speech and expression', true], ['Protection against forced labour', true], ['Right to move the Supreme Court to enforce rights', true],
          ['Equal pay for equal work', false], ['Organising village panchayats', false], ['Protecting the environment and forests (as a state duty)', false],
        ], ['Fundamental Rights can be taken to court.', 'Panchayats and equal pay are policy goals in Part IV.'], 'Equality, freedoms, protection from exploitation and constitutional remedies are Fundamental Rights.'),
      ],
    },
    {
      id: 'ts10.ss.const.social', title: 'The Constitution as a tool for social change', prereqs: ['ts10.ss.const.rights'],
      intro: [
        h('Changing a society through law'),
        photo('🏫', 'Reservation in education and jobs, and the right to education, have opened classrooms to children whose grandparents were denied schooling.'),
        p('In 1950 India was a society of deep inequalities — of caste, gender, religion, wealth and region. Many members of the Constituent Assembly wanted the Constitution to do more than set up a government: they wanted it to change society towards justice and equality. This is sometimes called "social engineering" through the Constitution.'),
        def('Universal adult franchise', 'Every citizen of 21 years (now 18) gets one vote, whatever their caste, gender, religion, education or wealth (Article 326). Many Western countries had taken decades to grant this; India gave it from the start.'),
        def('Reservation', 'Seats reserved for Scheduled Castes and Scheduled Tribes in legislatures (Articles 330, 332), and special provisions in education and government jobs (Articles 15(4), 16(4)), to make up for historic discrimination.'),
        def('Secularism', 'The state has no official religion, treats all religions equally and does not discriminate between citizens on the basis of religion.'),
        def('Federalism', 'Division of powers between the Union and the States through the Union List, State List and Concurrent List (Seventh Schedule).'),
        h('How the Constitution aims at social change'),
        stepsB(
          'Political equality: one person, one vote, one value — for every adult.',
          'Social equality: untouchability abolished (Art. 17); discrimination banned in public places (Art. 15).',
          'Protective discrimination: reservations for SCs and STs; later, for other backward classes in jobs and education.',
          'Directive Principles guide the state to reduce inequalities of income and protect weaker sections (e.g. Art. 46).',
          'Amendment (Art. 368) allows the Constitution to change with society, e.g. the 73rd and 74th Amendments (1992) gave panchayats and municipalities constitutional status with seats reserved for women.',
        ),
        p('Opinions differ about how far this has worked. Supporters point to many SC, ST and women leaders, officers and professionals who have risen through these provisions. Critics point out that caste discrimination, gender inequality and poverty still exist, and debate the best way to target benefits. The Constitution itself provides ways to keep revising policies through debate and law.'),
        keys('The Constitution aims not only to govern but to change society towards equality.', 'Universal adult franchise from 1950.', 'Untouchability abolished; reservations for SC/ST.', 'Secular and federal state; amendable to meet new needs.'),
        remember('Preamble keywords: Sovereign, Socialist, Secular, Democratic Republic; Justice, Liberty, Equality, Fraternity. ("Socialist" and "Secular" were added by the 42nd Amendment, 1976.)'),
        tip('When you vote for the first time at 18, remember that this right was not given everywhere — India gave it to all adults on day one.'),
      ],
      examples: [
        ex('Why did the makers of the Constitution provide reservations for Scheduled Castes and Scheduled Tribes?', ['For centuries these groups had been denied education, land and dignity.', 'Formal equality alone would not let them compete on equal terms.', 'Reservations in legislatures, education and jobs were meant to help them participate fully and close the gap.'], 'To correct historic injustice and ensure real, not only formal, equality'),
        ex('Explain how universal adult franchise was a revolutionary step in 1950.', ['Most Indians were poor and many could not read.', 'Some people argued voting should be limited to the educated or property-owners.', 'The Assembly gave every adult an equal vote, trusting ordinary citizens with power.'], 'It gave political equality to all adults at once, regardless of status'),
      ],
      practice: [
        mcq('social', 'Think about equality: political, social and economic.', [
          ['Which article abolishes untouchability?', 'Article 17', ['Article 14', 'Article 32', 'Article 370'], 'It is part of the Right to Equality.', 'Article 17 abolishes untouchability and makes its practice an offence.'],
          ['Universal adult franchise means…', 'Every adult citizen has the right to vote', ['Only educated people can vote', 'Only taxpayers can vote', 'Only men can vote'], 'Universal = everyone.', 'Article 326 gives every adult citizen one vote.'],
          ['Which words were added to the Preamble by the 42nd Amendment (1976)?', 'Socialist and Secular', ['Sovereign and Democratic', 'Justice and Liberty', 'Republic and Fraternity'], 'Two words describing the type of state.', '"Socialist" and "Secular" (and "integrity") were added in 1976.'],
          ['Division of subjects between the Union and States is given in the…', 'Seventh Schedule (Union, State and Concurrent Lists)', ['Preamble', 'Part III', 'First Schedule'], 'Three lists.', 'The Seventh Schedule contains the three lists.'],
          ['A secular state is one that…', 'Has no official religion and treats all religions equally', ['Follows the majority religion', 'Bans all religions', 'Is ruled by priests'], 'Equal distance from all religions.', 'India does not favour or discriminate against any religion.'],
          ['The 73rd Amendment (1992) is important because it…', 'Gave constitutional status to panchayats with seats reserved for women', ['Abolished the right to property', 'Lowered the voting age', 'Created new states'], 'It concerns villages.', 'It created a three-tier panchayat system with reservations for women, SCs and STs.'],
        ]),
        tapT('tap', 'Tap every provision that aims at social equality.', [
          ['Abolition of untouchability', true], ['Reservation of seats for SCs and STs', true], ['Ban on discrimination in public places', true], ['Universal adult franchise', true], ['Free and compulsory education for children 6–14', true],
          ['Titles of nobility for landlords', false], ['Votes only for property-owners', false], ['An official state religion', false],
        ], ['Equality provisions remove barriers.', 'Titles of nobility were abolished, not granted.'], 'Untouchability abolished, reservations, non-discrimination, adult franchise and education aim at equality.'),
        matchT('match', 'term to its meaning', [
          ['Universal adult franchise', 'Every adult has one vote'], ['Secularism', 'No official state religion'], ['Federalism', 'Powers divided between Union and States'], ['Reservation', 'Seats set aside for disadvantaged groups'],
          ['Amendment', 'Formal change to the Constitution'], ['Preamble', 'Introduction stating the Constitution\'s aims'],
        ], ['Start with franchise = vote.', 'Preamble = the opening statement.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 16 — Election Process in India
// =====================================================================================
const c16Steps = [
  'Election Commission announces the schedule; Model Code of Conduct begins',
  'Notification is issued and nominations are filed',
  'Scrutiny of nomination papers',
  'Last date for withdrawal of candidature',
  'Campaigning (stops 48 hours before polling ends)',
  'Polling day: voters cast votes on EVMs',
  'Counting of votes and declaration of results',
];

const ch16: USpec = {
  id: 'ts10.ss.ch16', subject: 'social', title: 'Election Process in India', source: src(16),
  objectives: [
    {
      id: 'ts10.ss.elect.commission', title: 'The Election Commission and the electoral system', prereqs: [],
      intro: [
        h('Who runs the world\'s largest election?'),
        photo('📝', 'India\'s general elections involve close to a billion registered voters, about a million polling stations and millions of polling staff — all managed by the Election Commission of India.'),
        p('You have probably seen your parents come home with a purple ink mark on their finger. Behind that small mark is a huge machine: lists of voters, lakhs of polling booths, buses carrying machines into forests and hills, and officials who make sure no one votes twice. In a democracy, the people choose their rulers — but only if elections are honestly organised. That is the job of the Election Commission.'),
        def('Election Commission of India (ECI)', 'An independent constitutional body (Article 324) that conducts elections to Parliament, State Legislatures and the offices of President and Vice-President. It was set up on 25 January 1950 — a date now marked as National Voters\' Day.'),
        def('Chief Election Commissioner', 'Head of the ECI; since 1993 the Commission has had a CEC and two Election Commissioners. To protect independence, the CEC can be removed only in the same way as a Supreme Court judge. The first CEC was Sukumar Sen.'),
        def('State Election Commission', 'A separate body in each state that conducts elections to panchayats and municipalities (Article 243K). In Telangana, the Telangana State Election Commission runs local body elections.'),
        h('How the system works'),
        p('India is divided into constituencies. Each constituency elects one representative: 543 for the Lok Sabha and, in Telangana, 119 for the Legislative Assembly (and 17 Lok Sabha seats). Some constituencies are reserved for Scheduled Castes and Scheduled Tribes — only candidates from those groups may contest there, but all voters vote. Constituency boundaries are redrawn from time to time by a Delimitation Commission so that each has roughly similar population.'),
        def('First past the post', 'The candidate who gets the most votes in a constituency wins, even without a majority of all votes.'),
        keys('ECI: independent, Article 324, set up 25 January 1950.', 'CEC + 2 Election Commissioners; CEC has strong protection from removal.', 'State Election Commissions conduct local body elections.', 'Single-member constituencies; candidate with most votes wins.'),
        remember('Article 324 — Election Commission. Article 326 — elections on the basis of adult suffrage. 25 January — National Voters\' Day.'),
        tip('Lok Sabha seats: 543 elected. Telangana: 17 Lok Sabha and 119 Assembly constituencies.'),
      ],
      examples: [
        ex('Why is it important that the Chief Election Commissioner cannot be easily removed by the government?', ['The ruling party also contests elections.', 'If it could remove the CEC at will, it could pressure the Commission to favour it.', 'Strong protection lets the CEC act fairly against any party, including the ruling one.'], 'To keep the Commission independent and elections fair'),
        ex('In a constituency, A gets 42,000 votes, B gets 38,000 and C gets 30,000. Who wins and did the winner get a majority of votes?', ['Total valid votes = 42,000 + 38,000 + 30,000 = 1,10,000.', 'A has the most votes → A wins (first past the post).', 'Majority would need more than 55,000. A has 42,000, which is about 38% — not a majority.'], 'A wins with about 38% of votes — a plurality, not a majority'),
      ],
      practice: [
        mcq('eci', 'Remember the articles and the independence of the Commission.', [
          ['Which article of the Constitution provides for the Election Commission?', 'Article 324', ['Article 17', 'Article 32', 'Article 368'], 'Part XV deals with elections.', 'Article 324 vests the superintendence of elections in the Election Commission.'],
          ['Who conducts elections to gram panchayats in Telangana?', 'The State Election Commission', ['The Election Commission of India', 'The Governor', 'The District Collector alone'], 'Local bodies have their own commission.', 'State Election Commissions conduct panchayat and municipal elections (Article 243K).'],
          ['National Voters\' Day is celebrated on…', '25 January', ['26 November', '15 August', '2 October'], 'The ECI\'s foundation day.', 'The ECI was set up on 25 January 1950.'],
          ['Who was the first Chief Election Commissioner of India?', 'Sukumar Sen', ['T. N. Seshan', 'B. R. Ambedkar', 'Rajendra Prasad'], 'He organised the 1951–52 elections.', 'Sukumar Sen conducted the first general elections.'],
          ['In the "first past the post" system, the winner is the candidate who…', 'Gets the most votes', ['Gets more than 50% of the votes', 'Is the oldest', 'Is chosen by the party'], 'A plurality is enough.', 'The candidate with the highest number of votes wins.'],
          ['How many Lok Sabha constituencies are there in Telangana?', '17', ['119', '42', '25'], '119 is the Assembly figure.', 'Telangana elects 17 members to the Lok Sabha.'],
        ]),
        tp('fptp', (r) => {
          const sets: [number, number, number][] = [[42, 38, 30], [55, 40, 25], [36, 34, 30], [48, 47, 15], [60, 30, 30], [45, 35, 40], [50, 28, 22], [33, 44, 23]];
          const [a, b, c] = r.pick(sets);
          const tot = a + b + c;
          const win = Math.max(a, b, c);
          const share = rd((win / tot) * 100, 1);
          return numQ(`In a constituency, three candidates get ${a},000, ${b},000 and ${c},000 valid votes. What percentage of the valid votes did the winner get? (number only, no % sign, 1 decimal place)`, share,
            ['First add up all the valid votes.', `The winner has ${win},000 votes. Divide by the total and multiply by 100.`],
            [`Total = ${a} + ${b} + ${c} = ${tot} thousand`, `Winner = ${win} thousand`, `Share = ${win} ÷ ${tot} × 100 ≈ ${share}%`, share > 50 ? 'This is a majority (over 50%).' : 'This is less than 50%: the winner won by plurality, not majority.'],
            [{ when: String(rd(share / 100, 3)), explain: 'Multiply by 100 to turn the fraction into a percentage.' }], 0.01);
        }, 2),
        tapT('tap', 'Tap every task of the Election Commission of India.', [
          ['Preparing and updating electoral rolls', true], ['Announcing the election schedule', true], ['Enforcing the Model Code of Conduct', true], ['Recognising political parties and allotting symbols', true], ['Conducting the election of the President', true],
          ['Conducting gram panchayat elections', false], ['Passing laws in Parliament', false], ['Deciding which party forms the government', false],
        ], ['Local body elections belong to State Election Commissions.', 'The ECI conducts elections; it does not make laws.'], 'The ECI prepares rolls, schedules polls, enforces the code, recognises parties and conducts Presidential elections.'),
      ],
    },
    {
      id: 'ts10.ss.elect.process', title: 'Steps of an election: from announcement to results', prereqs: ['ts10.ss.elect.commission'],
      intro: [
        h('From the announcement to the victory procession'),
        photo('📄', 'Every candidate must file a nomination paper and an affidavit declaring assets, education and any criminal cases — information voters can read.'),
        p('Elections in your town may look like posters, rallies and loudspeakers, but behind them is a careful legal process with fixed steps and deadlines. Every candidate, party and official must follow it.'),
        stepsB(...c16Steps),
        def('Electoral roll (voters\' list)', 'The official list of everyone eligible to vote in a constituency. A citizen aged 18 or more on the qualifying date can enrol; each voter gets an Electors Photo Identity Card (EPIC).'),
        def('Model Code of Conduct', 'Guidelines from the Election Commission for parties, candidates and governments from the announcement of elections until results — e.g. no new schemes announced by ministers, no use of government vehicles for campaigning, no appeals to caste or religion.'),
        def('Security deposit', 'Money a candidate pays when filing nomination. It is forfeited if the candidate gets less than one-sixth of the valid votes polled — this discourages non-serious candidates.'),
        p('Who can vote? Every Indian citizen aged 18 or above who is enrolled (the age was lowered from 21 to 18 by the 61st Amendment, effective 1989). Who can contest? A citizen aged at least 25 for the Lok Sabha or a State Assembly, who is a registered voter.'),
        xp({
          title: 'What if? Vote share and the deposit rule', formula: 'Vote share S = (candidate\'s votes ÷ total valid votes) × 100',
          res: ['S', 'Candidate\'s vote share', '%', 'c / v * 100', 1],
          vars: [['c', 'Votes for the candidate', 'thousand', 5, 100, 1, 30], ['v', 'Total valid votes in the constituency', 'thousand', 100, 250, 5, 150]],
          notes: [
            ['c', 'More votes for the same total means a bigger share; if it crosses about 16.7% (one-sixth), the deposit is saved.', 'Fewer votes lower the share; below one-sixth (about 16.7%) the deposit is lost.'],
            ['v', 'If turnout rises but the candidate\'s votes stay the same, their share falls — other candidates gained the new votes.', 'With fewer total valid votes, the same votes form a larger share.'],
          ],
          mistakes: [
            ['Dividing by the number of registered electors', 'Vote share and the deposit rule use VALID VOTES POLLED, not all electors on the roll.'],
            ['Thinking a winner always has more than 50%', 'Under first past the post, a winner may have far less than half the votes if many candidates split them.'],
          ],
          real: 'In a constituency with 1,50,000 valid votes, a candidate needs more than 25,000 votes (one-sixth) to get the deposit back.',
        }),
        keys('Steps: schedule → nominations → scrutiny → withdrawal → campaign → polling → counting.', 'Voting age 18 (61st Amendment); contesting age 25 for Lok Sabha/Assembly.', 'Model Code of Conduct applies from announcement to results.', 'Deposit forfeited below one-sixth of valid votes.'),
        remember('Campaigning must stop 48 hours before the close of polling. Voting age lowered from 21 to 18 by the 61st Constitutional Amendment (effective 1989).'),
        tip('To remember the order: "Announce, Nominate, Scrutinise, Withdraw, Campaign, Poll, Count" — ANS-W-CPC.'),
      ],
      examples: [
        ex('A minister announces a new road project in a constituency three days before polling. Which rule is broken and why does it matter?', ['After elections are announced, the Model Code of Conduct prevents ministers from announcing new projects or schemes.', 'Such announcements could influence voters using government power.', 'This would give the ruling party an unfair advantage.'], 'Model Code of Conduct — to prevent misuse of official power'),
        ex('In a constituency 1,80,000 valid votes are polled. A candidate gets 28,000 votes. Does she keep her deposit?', ['One-sixth of 1,80,000 = 30,000.', 'She got 28,000, which is less than 30,000.', 'So her deposit is forfeited.'], 'No — she needed at least one-sixth (30,000 votes)'),
      ],
      practice: [
        orderT('order', 'Put the stages of an election in the correct order.', c16Steps, ['The Model Code begins with the announcement.', 'Scrutiny comes after nominations but before withdrawal.'], 'Announcement → nominations → scrutiny → withdrawal → campaign → polling → counting.'),
        tp('deposit', (r) => {
          const v = r.pick([120, 150, 180, 210, 240, 270, 300]) * 1000;
          const need = v / 6;
          const c = need + r.pick([-6000, -3000, -1500, 1500, 3000, 6000]);
          const keep = c >= need;
          return {
            type: 'mcq', prompt: `${v.toLocaleString('en-IN')} valid votes are polled in a constituency. A candidate gets ${c.toLocaleString('en-IN')} votes. Does the candidate keep the security deposit?`,
            ...(() => { const ch = ['Yes, the deposit is returned', 'No, the deposit is forfeited']; const order = r.next() < 0.5 ? ch : [...ch].reverse(); const choices = order.map((label, i) => ({ id: 'ab'[i], label: { en: label } })); return { choices, answer: { kind: 'choice' as const, correct: choices[order.indexOf(keep ? ch[0] : ch[1])].id } }; })(),
            hints: ['The deposit is lost if the candidate gets less than one-sixth of the valid votes.', `Find one-sixth of ${v.toLocaleString('en-IN')}.`],
            mistakes: [{ when: 'wrong', explain: `One-sixth of ${v.toLocaleString('en-IN')} is ${need.toLocaleString('en-IN')}; compare the candidate's votes with this.` }],
            solution: [`One-sixth of ${v.toLocaleString('en-IN')} = ${need.toLocaleString('en-IN')}`, `${c.toLocaleString('en-IN')} is ${keep ? 'more than' : 'less than'} ${need.toLocaleString('en-IN')}`, keep ? 'The deposit is returned.' : 'The deposit is forfeited.'],
          };
        }, 2),
        mcq('process', 'Think of who may vote, who may contest and what the code forbids.', [
          ['What is the minimum age to vote in India?', '18 years', ['21 years', '25 years', '16 years'], 'Lowered from 21.', 'The 61st Amendment lowered the voting age to 18 (effective 1989).'],
          ['What is the minimum age to contest a Lok Sabha election?', '25 years', ['18 years', '21 years', '35 years'], '35 is for the President.', 'A Lok Sabha or Assembly candidate must be at least 25.'],
          ['Campaigning must end how long before polling closes?', '48 hours', ['24 hours', '1 week', '1 hour'], 'Two days of "silence".', 'The campaign stops 48 hours before the end of polling.'],
          ['Which of these is NOT allowed under the Model Code of Conduct?', 'Appealing for votes on the basis of caste or religion', ['Holding a public meeting with permission', 'Releasing a manifesto', 'Door-to-door campaigning'], 'Divisive appeals are banned.', 'Appeals on caste or religious lines are prohibited.'],
          ['When does the Model Code of Conduct come into force?', 'When the Election Commission announces the schedule', ['On polling day', 'After results', 'One year before elections'], 'It begins at the very start.', 'It applies from the announcement until results are declared.'],
          ['Checking whether nomination papers are valid is called…', 'Scrutiny', ['Withdrawal', 'Delimitation', 'Counting'], 'Scrutinise = examine carefully.', 'The returning officer scrutinises the nominations.'],
        ]),
      ],
    },
    {
      id: 'ts10.ss.elect.parties', title: 'Political parties in elections', prereqs: ['ts10.ss.elect.commission'],
      intro: [
        h('Why do we vote for symbols?'),
        photo('🚩', 'Each recognised party has its own flag and a reserved election symbol, so even a voter who cannot read can find the candidate of their choice.'),
        p('Before an election, walls and streets fill with party flags and symbols. In a country where many voters once could not read, symbols were a clever way to let everyone vote. But parties do much more than put up flags: they bring together people with similar ideas, choose candidates, write manifestos, form governments or act as the opposition.'),
        def('Political party', 'A group of people who come together to contest elections and hold power in government, with an agreed set of policies and programmes.'),
        def('Manifesto', 'A document in which a party announces its promises and policies before an election.'),
        def('National party / State party', 'The Election Commission recognises parties as national or state parties based on their vote share and seats in elections. Recognised parties get a reserved symbol.'),
        def('Opposition', 'Parties not in government; they question and criticise the government, and offer alternative policies.'),
        h('What parties do'),
        stepsB(
          'Choose candidates for each constituency.',
          'Prepare a manifesto with promises and policies.',
          'Campaign: rallies, door-to-door visits, media and social media.',
          'Win seats; the party or coalition with a majority forms the government.',
          'Others form the opposition, keeping the government accountable.',
        ),
        p('When no single party wins a majority, several parties may join to form a coalition government. India has seen both single-party and coalition governments at the Centre and in the states. To stop elected members switching parties for money or posts, the anti-defection law (52nd Amendment, 1985, Tenth Schedule) disqualifies members who leave their party or defy its whip in certain votes.'),
        p('Parties also face criticism: lack of internal democracy, dynastic leadership, use of money and muscle power, and nomination of candidates with criminal cases. Citizens, courts and the Election Commission have pushed reforms such as requiring candidates to declare their assets and criminal records.'),
        keys('Parties contest elections, form governments or act as opposition.', 'Recognised parties get reserved symbols from the ECI.', 'Coalitions form when no party has a majority.', 'Anti-defection law (1985) discourages switching parties.'),
        remember('Anti-defection law: 52nd Amendment, 1985 (Tenth Schedule).'),
        tip('A manifesto is a promise; when you study a party\'s record later, compare it with its manifesto.'),
      ],
      examples: [
        ex('Why did the Election Commission introduce party symbols in the first elections?', ['In 1951–52 most Indian voters could not read.', 'A picture symbol (e.g. a lamp, a pair of bullocks) let them identify the party and candidate.', 'This made universal adult franchise workable.'], 'So that voters who could not read could still choose their candidate'),
        ex('A party wins 230 seats in a 543-seat Lok Sabha. Can it form the government alone? What might happen?', ['A majority needs at least 272 seats (more than half of 543).', '230 is short of 272.', 'The party would need support from other parties — a coalition or outside support.'], 'No; it would need coalition partners to reach 272'),
      ],
      practice: [
        mcq('parties', 'Think about what parties do and the rules that govern them.', [
          ['A document listing a party\'s promises before an election is a…', 'Manifesto', ['Affidavit', 'Nomination paper', 'Ballot'], 'It "manifests" (shows) plans.', 'Parties release manifestos stating their policies and promises.'],
          ['Who recognises political parties and allots symbols?', 'The Election Commission of India', ['The Supreme Court', 'The President', 'Parliament'], 'The same body that conducts elections.', 'The ECI recognises parties and allots symbols.'],
          ['When several parties join to form a government, it is called a…', 'Coalition government', ['One-party state', 'Military rule', 'Dictatorship'], 'Coalition = alliance.', 'A coalition is formed when no single party has a majority.'],
          ['The anti-defection law was introduced by the…', '52nd Amendment (1985)', ['42nd Amendment (1976)', '61st Amendment (1988)', '73rd Amendment (1992)'], 'It added the Tenth Schedule.', 'The 52nd Amendment (1985) brought in the anti-defection law.'],
          ['How many seats are needed for a majority in a Lok Sabha of 543?', '272', ['250', '300', '543'], 'More than half.', 'Half of 543 is 271.5, so 272 seats are needed.'],
          ['What is the main role of the opposition?', 'To question the government and offer alternatives', ['To run the Election Commission', 'To appoint judges', 'To make all laws alone'], 'It keeps the government accountable.', 'The opposition criticises and checks the government.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Manifesto', 'Party\'s list of promises'], ['Coalition', 'Government of several parties'], ['Opposition', 'Parties that check the government'], ['Defection', 'An elected member switching parties'],
          ['Symbol', 'Picture that identifies a party on the EVM'], ['Recognised party', 'Party given status and a reserved symbol by the ECI'],
        ], ['Coalition = alliance; defection = switching.', 'Symbols help voters who cannot read.']),
        tapT('tap', 'Tap every function of political parties.', [
          ['Choosing candidates', true], ['Writing manifestos', true], ['Forming governments', true], ['Acting as opposition', true], ['Shaping public opinion', true],
          ['Counting votes', false], ['Preparing electoral rolls', false], ['Judging election disputes', false],
        ], ['Counting and electoral rolls are the Election Commission\'s job.', 'Election disputes go to the courts.'], 'Parties choose candidates, make manifestos, govern or oppose, and shape opinion.'),
      ],
    },
    {
      id: 'ts10.ss.elect.voting', title: 'Voting mechanism and free and fair elections', prereqs: ['ts10.ss.elect.process'],
      intro: [
        h('Inside the polling booth'),
        photo('🔒', 'Voting is secret: no one — not even the polling officer — can see whom you voted for.'),
        p('When you turn 18, you will walk into a polling booth in a nearby school. An official checks your name, marks your left forefinger with indelible ink, and you press a button on a machine behind a screen. In a few seconds, you have helped choose a government. Let us see how the system keeps that vote secret and safe.'),
        stepsB(
          'The first polling officer checks your name in the electoral roll and your identity (EPIC or other approved ID).',
          'The second polling officer marks your left forefinger with indelible ink and takes your signature/thumb impression.',
          'The third polling officer activates the ballot unit from the control unit.',
          'In the voting compartment you press the blue button next to your chosen candidate\'s name and symbol on the EVM.',
          'The VVPAT shows a slip with the candidate\'s name and symbol for about 7 seconds, then it drops into a sealed box.',
        ),
        def('EVM (Electronic Voting Machine)', 'A machine with a ballot unit and control unit used to record votes. First used in 1982 in Paravur (Kerala); used in all constituencies of the Lok Sabha election since 2004.'),
        def('VVPAT', 'Voter Verifiable Paper Audit Trail — a printer attached to the EVM that lets voters see a paper slip confirming their vote. Slips can be counted to verify EVM results.'),
        def('NOTA', '"None of the Above" — an option on the EVM since 2013 (after a Supreme Court judgment) for voters who do not wish to vote for any candidate.'),
        h('What makes an election free and fair?'),
        p('A free and fair election means every eligible person can vote, votes are secret, candidates can campaign freely, there is no bribery or intimidation, counting is honest, and the result reflects the people\'s will. Problems still occur: distributing money, liquor or gifts to voters; booth capturing; spreading false information; candidates with criminal records; and heavy spending. The Election Commission uses observers, flying squads, video surveillance, central forces and expenditure limits to fight these, and citizens can report violations.'),
        keys('Voting is secret, by EVM with VVPAT.', 'Indelible ink prevents voting twice.', 'NOTA lets voters reject all candidates (since 2013).', 'Free and fair: universal, secret, free campaign, honest count, no bribery or force.'),
        remember('EVMs used across all Lok Sabha constituencies since 2004; VVPAT first used in 2013; NOTA introduced in 2013.'),
        tip('Turnout = votes polled ÷ registered electors × 100. Higher turnout means more people took part in choosing the government.'),
      ],
      examples: [
        ex('A constituency has 2,00,000 registered electors; 1,36,000 people vote. What is the turnout?', ['Turnout = votes polled ÷ electors × 100', '= 1,36,000 ÷ 2,00,000 × 100', '= 68%'], '68%'),
        ex('Give three features that make an election free and fair, and one threat to each.', ['Secret ballot → threat: voters being watched or pressured.', 'Honest electoral roll → threat: fake or duplicate names.', 'Free campaign → threat: violence or intimidation of candidates.', '(Also: no bribery → threat: cash or gifts to voters.)'], 'Secret voting, clean rolls and free campaigning — threatened by pressure, fake names and violence'),
      ],
      practice: [
        tp('turnout', (r) => {
          const e = r.pick([150000, 180000, 200000, 240000, 250000, 300000]);
          const t = r.int(52, 86);
          const v = (e * t) / 100;
          return numQ(`A constituency has ${e.toLocaleString('en-IN')} registered electors, and ${v.toLocaleString('en-IN')} of them vote. What is the voter turnout? (number only, no % sign)`, t,
            ['Turnout compares the people who voted with all the people who could vote.', `Divide ${v.toLocaleString('en-IN')} by ${e.toLocaleString('en-IN')} and multiply by 100.`],
            [`Turnout = ${v.toLocaleString('en-IN')} ÷ ${e.toLocaleString('en-IN')} × 100`, `= ${t}%`],
            [{ when: String(t / 100), explain: 'You found the fraction; multiply by 100 to get the percentage.' }, { when: String(100 - t), explain: 'That is the percentage who did NOT vote.' }], 0.005);
        }, 2),
        orderT('booth', 'Put the steps a voter follows inside the polling station in order.', [
          'First polling officer checks your name and identity', 'Second polling officer marks your finger with indelible ink', 'Third polling officer activates the ballot unit', 'You press the button next to your candidate on the EVM', 'You check the VVPAT slip for about 7 seconds',
        ], ['Identity is checked before anything else.', 'The VVPAT slip appears only after you vote.'], 'Check identity → ink → activate EVM → vote → verify VVPAT slip.'),
        mcq('voting', 'Think about secrecy, machines and fairness.', [
          ['What does VVPAT stand for?', 'Voter Verifiable Paper Audit Trail', ['Voter Visible Party Allotment Table', 'Valid Vote Paper and Ticket', 'Voting Verification by Party Agents Team'], 'It prints a paper slip.', 'VVPAT lets the voter verify the vote on a paper slip.'],
          ['Why is indelible ink put on a voter\'s finger?', 'To prevent the same person from voting twice', ['To show which party they voted for', 'To count votes', 'To identify candidates'], 'It cannot be washed off quickly.', 'The ink mark shows the person has already voted.'],
          ['NOTA allows a voter to…', 'Reject all candidates', ['Vote twice', 'Vote by post', 'Nominate a new candidate'], '"None of the Above".', 'NOTA lets voters record that they support none of the candidates.'],
          ['Where were EVMs first used in India?', 'Paravur, Kerala (1982)', ['Hyderabad (1999)', 'Delhi (1951)', 'Mumbai (2004)'], 'A by-election in the early 1980s.', 'EVMs were first used in the Paravur constituency in Kerala in 1982.'],
          ['Which is a threat to free and fair elections?', 'Distributing cash and gifts to voters', ['Secret ballot', 'Independent Election Commission', 'Accurate electoral roll'], 'It buys votes.', 'Bribing voters distorts the people\'s free choice.'],
          ['A secret ballot means…', 'No one can find out whom you voted for', ['Votes are counted in secret', 'Candidates are kept secret', 'Results are never announced'], 'It protects voters from pressure.', 'Secrecy lets voters choose freely without fear.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 17 — Independent India (The First 30 Years: 1947-77)
// =====================================================================================
const c17Events: [number, string, string][] = [
  [1950.03, 'Planning Commission set up', 'March 1950'],
  [1951.1, 'First general elections begin', 'October 1951 (to February 1952)'],
  [1952.12, 'Potti Sriramulu dies after a fast for a Telugu state', '15 December 1952'],
  [1953.1, 'Andhra State formed with Kurnool as capital', '1 October 1953'],
  [1956.11, 'States reorganised on linguistic lines; Andhra Pradesh formed', '1 November 1956'],
  [1962.1, 'India–China war', 'October–November 1962'],
  [1964.05, 'Death of Jawaharlal Nehru', 'May 1964'],
  [1966.01, 'Indira Gandhi becomes Prime Minister', 'January 1966'],
  [1969.07, 'Fourteen major banks nationalised', 'July 1969'],
  [1971.12, 'Bangladesh war', 'December 1971'],
  [1975.06, 'National Emergency declared', '25 June 1975'],
  [1977.03, 'Emergency lifted; Janata Party wins the elections', 'March 1977'],
];

const ch17: USpec = {
  id: 'ts10.ss.ch17', subject: 'social', title: 'Independent India (The First 30 Years: 1947-77)', source: src(17),
  objectives: [
    {
      id: 'ts10.ss.indep.elections', title: 'The first general elections and one-party dominance', prereqs: [],
      intro: [
        h('The biggest experiment in democracy the world had seen'),
        photo('🚩', 'In 1951–52, millions of Indians voted for the first time — most of them could not read, yet they chose their government.'),
        p('Imagine organising an election for about 17 crore voters when most of them cannot read, there are few roads in villages, and there is no computer. That is what India did in 1951–52. Many foreign observers doubted it could work. It did — and it became the foundation of Indian democracy.'),
        def('Universal adult franchise', 'The right of every adult citizen to vote, regardless of religion, caste, gender, education or wealth. India gave it from the very first election.'),
        def('Election Commission', 'The independent body that conducts elections in India. Sukumar Sen was the first Chief Election Commissioner.'),
        stepsB(
          'Voters were listed: about 17 crore adults (21 years and above at that time) were registered.',
          'Each party was given a symbol (e.g. a pair of bullocks, a hut, a lamp) so voters who could not read could recognise it.',
          'Separate ballot boxes with party symbols were placed in polling booths.',
          'Voting took place in phases from October 1951 to February 1952.',
          'Votes were counted and the Lok Sabha and state assemblies were formed.',
        ),
        bars(['Indian National Congress', 'All other parties and independents'], [364, 125], 'Lok Sabha seats', 'First Lok Sabha (1952): Congress won 364 of 489 seats; all others together won 125.'),
        p('The Congress, which had led the freedom struggle, won a huge majority and Jawaharlal Nehru became the first elected Prime Minister. Opposition parties such as the Communist Party of India, the Socialist Party and the Bharatiya Jana Sangh won fewer seats but raised important questions in Parliament. This period, when one party won most elections, is often called the era of one-party dominance. In the Hyderabad and Telangana region, the communists (as part of the People\'s Democratic Front) did very well in 1952.'),
        keys('First general elections: October 1951 – February 1952.', 'About 17 crore voters; voting age then was 21.', 'Symbols helped voters who could not read.', 'Congress won 364 of 489 Lok Sabha seats; Nehru became PM.'),
        remember('First Chief Election Commissioner: Sukumar Sen. First general elections: 1951–52.'),
        tip('Link: universal adult franchise from day one — many Western democracies had taken decades to give all adults the vote.'),
      ],
      examples: [
        ex('Why were party symbols so important in the first general elections?', ['Most voters at that time could not read.', 'A picture symbol (bullocks, hut, lamp) could be recognised by everyone.', 'So every adult, literate or not, could vote for the party of their choice.'], 'They let voters who could not read identify and choose a party'),
        ex('"The first general elections proved the doubters wrong." Explain with two points.', ['Many said a poor, largely non-literate country could not hold free elections.', 'Yet crores of people voted peacefully and the results were accepted.', 'Power passed to an elected government, setting a democratic tradition.'], 'Crores voted peacefully, results were accepted and democracy took root'),
      ],
      practice: [
        mcq('mcq', 'Recall the year, the scale and how voting was made possible.', [
          ['When were India\'s first general elections held?', '1951–52', ['1947', '1950', '1957'], 'They began in October 1951.', 'Voting ran from October 1951 to February 1952.'],
          ['Who was the first Chief Election Commissioner of India?', 'Sukumar Sen', ['B. R. Ambedkar', 'Rajendra Prasad', 'T. N. Seshan'], 'A civil servant from Bengal.', 'Sukumar Sen conducted the first two general elections.'],
          ['Why were symbols given to parties?', 'So that voters who could not read could identify parties', ['To decorate the ballot box', 'Because names were secret', 'To reduce the number of parties'], 'Think about literacy in 1951.', 'Symbols made voting possible for non-literate voters.'],
          ['The voting age in the first general elections was…', '21 years', ['18 years', '25 years', '16 years'], 'It was lowered later.', 'It was 21; the 61st Amendment (1988) lowered it to 18.'],
          ['Which party won the first general elections?', 'Indian National Congress', ['Communist Party of India', 'Bharatiya Jana Sangh', 'Socialist Party'], 'It led the freedom movement.', 'Congress won 364 of 489 Lok Sabha seats.'],
          ['The period when one party won most elections in India is called…', 'One-party dominance', ['Coalition era', 'Emergency', 'President\'s rule'], 'One party, many wins.', 'Congress dominated national and most state elections in the early decades.'],
        ]),
        orderT('order', 'Put the steps of conducting the first general elections in order.', [
          'Prepare electoral rolls of all adults', 'Allot symbols to parties', 'Set up polling booths with ballot boxes', 'People cast their votes', 'Count votes and declare results',
        ], ['You cannot vote before the rolls are made.', 'Counting is last.'], 'Electoral rolls → symbols → booths → voting → counting.'),
        tapT('tap', 'Tap every TRUE statement about the first general elections.', [
          ['Every adult could vote regardless of caste or gender', true], ['Party symbols were used', true], ['Congress won a large majority', true], ['Voting took place over several months', true],
          ['Only literate people could vote', false], ['Electronic voting machines were used', false], ['The voting age was 18', false],
        ], ['EVMs came much later.', 'Universal adult franchise covered all adults (21+ then).'], 'Universal adult franchise, symbols, a Congress majority and phased voting were features of 1951–52.'),
      ],
    },
    {
      id: 'ts10.ss.indep.states', title: 'Linguistic states and the States Reorganisation Act, 1956', prereqs: ['ts10.ss.indep.elections'],
      intro: [
        h('Why your state speaks mostly one language'),
        photo('🗺️', 'The map of Indian states was redrawn in 1956, largely along language lines.'),
        p('At independence, the map of India was a patchwork: provinces from British times and hundreds of former princely states. Telugu speakers, for instance, were split between Madras Presidency and Hyderabad State. People felt that government, courts and schools should work in their own language, and many movements demanded states based on language.'),
        def('Linguistic state', 'A state whose boundaries are drawn so that most of its people speak one language.'),
        p('National leaders were cautious at first. They feared that dividing the country by language, so soon after Partition, might weaken unity. But the demand for a Telugu state grew strong. Potti Sriramulu, a Gandhian, went on a fast for a separate Andhra State and died on 15 December 1952 after 58 days. Widespread protests followed, and the Andhra State was formed on 1 October 1953, with Kurnool as its capital — the first state formed on a linguistic basis.'),
        stepsB(
          '1952: Potti Sriramulu\'s fast and death lead to protests across Telugu-speaking areas.',
          '1 October 1953: Andhra State formed from the Telugu-speaking districts of Madras State.',
          'December 1953: the States Reorganisation Commission (SRC) is set up under Fazl Ali, with K. M. Panikkar and H. N. Kunzru.',
          '1955: the SRC submits its report.',
          '1956: Parliament passes the States Reorganisation Act; from 1 November 1956 India has 14 states and 6 union territories. Andhra Pradesh is formed the same day.',
          'Later changes: Bombay State split into Maharashtra and Gujarat (1960); Punjab and Haryana separated (1966).',
        ),
        p('Looking back, linguistic states did not break India apart, as some had feared. They brought government closer to people in their own language and strengthened democracy. At the same time, language was not the only basis of identity — later demands, including for Telangana, raised questions of regional development and fairness too.'),
        keys('Language-based demands grew after independence.', 'Andhra State (1953) was the first linguistic state.', 'SRC (Fazl Ali) → States Reorganisation Act 1956: 14 states, 6 UTs.', 'Linguistic states strengthened democracy rather than weakening unity.'),
        remember('Andhra State: 1 October 1953 (capital Kurnool). States Reorganisation Act: 1956. Andhra Pradesh: 1 November 1956.'),
        tip('Chain to remember: Sriramulu (1952) → Andhra State (1953) → SRC (1953–55) → Act (1956).'),
      ],
      examples: [
        ex('Explain the chain of events from Potti Sriramulu\'s fast to the States Reorganisation Act.', ['Sriramulu fasted for a Telugu state and died in December 1952.', 'Protests forced the government to create Andhra State in October 1953.', 'Other language groups also demanded states, so the SRC was set up in 1953.', 'Its report led to the States Reorganisation Act of 1956.'], 'Fast and death → protests → Andhra State → SRC → 1956 Act'),
        ex('Give one fear and one benefit associated with forming states on the basis of language.', ['Fear: dividing by language soon after Partition might encourage separatism.', 'Benefit: people could deal with government, courts and schools in their own language, making democracy more participatory.'], 'Fear of division; benefit of government in the people\'s own language'),
      ],
      practice: [
        mcq('mcq', 'Keep the 1952 → 1953 → 1956 chain in mind.', [
          ['Who fasted unto death for a separate Andhra State?', 'Potti Sriramulu', ['Tanguturi Prakasam', 'N. Sanjiva Reddy', 'Burgula Ramakrishna Rao'], 'He was a Gandhian.', 'Potti Sriramulu died on 15 December 1952 after a long fast.'],
          ['Andhra State was formed on…', '1 October 1953', ['15 August 1947', '1 November 1956', '26 January 1950'], 'Before the SRC report.', 'Andhra State, the first linguistic state, was formed on 1 October 1953.'],
          ['What was the capital of Andhra State in 1953?', 'Kurnool', ['Hyderabad', 'Visakhapatnam', 'Vijayawada'], 'A town in Rayalaseema.', 'Kurnool was the capital until Andhra Pradesh was formed in 1956.'],
          ['Who chaired the States Reorganisation Commission?', 'Fazl Ali', ['K. M. Panikkar', 'Sardar Patel', 'Jawaharlal Nehru'], 'Panikkar and Kunzru were members.', 'Justice Fazl Ali headed the SRC.'],
          ['The States Reorganisation Act, 1956 created…', '14 states and 6 union territories', ['28 states and 8 union territories', '10 states only', '22 states and 2 union territories'], 'Count from 1956.', 'The Act reorganised India into 14 states and 6 UTs.'],
          ['Bombay State was divided into Maharashtra and Gujarat in…', '1960', ['1956', '1953', '1966'], 'Four years after the Act.', 'Maharashtra and Gujarat were formed on 1 May 1960.'],
        ]),
        timelineT('tl', 'Arrange these events of independent India in time order.', c17Events, ['Recall the decade first.', 'Linguistic reorganisation came in the 1950s; the Emergency in the 1970s.']),
        matchT('match', 'person or body to their role', [
          ['Potti Sriramulu', 'Fasted for a Telugu-speaking state'], ['Fazl Ali', 'Chaired the States Reorganisation Commission'], ['Sukumar Sen', 'First Chief Election Commissioner'],
          ['Jawaharlal Nehru', 'First Prime Minister of India'], ['Planning Commission', 'Prepared the Five Year Plans'], ['States Reorganisation Act', 'Redrew state boundaries in 1956'],
        ], ['Start with the most famous names.', 'Fazl Ali = SRC.']),
      ],
    },
    {
      id: 'ts10.ss.indep.plans', title: 'Planning and economic policy: Five Year Plans to bank nationalisation', prereqs: ['ts10.ss.indep.states'],
      intro: [
        h('Building a nation from poverty'),
        photo('⚙️', 'Steel plants, dams and power stations built under the Five Year Plans were called "temples of modern India" by Nehru.'),
        p('In 1947 India was poor: most people depended on farming, factories were few, and famines were a recent memory. The new government believed it had to plan carefully how to use scarce money and resources. So it set up the Planning Commission in March 1950, chaired by the Prime Minister.'),
        def('Five Year Plan', 'A plan that sets the country\'s economic goals and spending priorities for five years.'),
        def('Mixed economy', 'An economy in which both the government (public sector) and private businesses play important roles.'),
        stepsB(
          'First Plan (1951–56): focus on agriculture, irrigation and dams to increase food production.',
          'Second Plan (1956–61): focus on heavy industry — steel, machines, power — with a big role for the public sector (associated with P. C. Mahalanobis).',
          'Mid-1960s: food shortages and wars lead to the Green Revolution — high-yielding seeds, fertilisers, irrigation.',
          '1969: fourteen major private banks are nationalised so that credit reaches farmers and small businesses.',
          '1971: "Garibi Hatao" (remove poverty) becomes a central political slogan; privy purses of former princes are abolished.',
        ),
        p('Planning produced dams such as Nagarjuna Sagar on the Krishna, steel plants like Bhilai, and institutions like the IITs. But growth was slow, poverty remained widespread, and land reforms were implemented unevenly. People debated then — and still debate — how much the state should control the economy.'),
        keys('Planning Commission set up in 1950.', 'First Plan: agriculture; Second Plan: heavy industry.', 'India chose a mixed economy.', 'Green Revolution (late 1960s) and bank nationalisation (1969) changed the economy.'),
        remember('First Five Year Plan: 1951–56. Bank nationalisation: July 1969 (14 banks).'),
        tip('Plan 1 = fields (agriculture); Plan 2 = factories (industry).'),
      ],
      examples: [
        ex('Why did the First Five Year Plan give priority to agriculture?', ['India faced food shortages and depended on imports.', 'Most people earned their living from farming.', 'More irrigation and dams would raise food production and rural incomes.'], 'To overcome food shortages and support the majority who depended on farming'),
        ex('What was the purpose of nationalising banks in 1969?', ['Private banks lent mostly to big businesses and cities.', 'After nationalisation the government could direct them to open rural branches.', 'Farmers, small industries and weaker sections could get credit.'], 'To spread bank credit to farmers, villages and small businesses'),
      ],
      practice: [
        mcq('mcq', 'Match each plan or policy to its main aim.', [
          ['The Planning Commission was set up in…', '1950', ['1947', '1956', '1969'], 'The year the Constitution came into force.', 'It was set up in March 1950.'],
          ['The First Five Year Plan focused mainly on…', 'Agriculture and irrigation', ['Heavy industry', 'Information technology', 'Foreign trade'], 'Food shortages.', 'The First Plan gave priority to agriculture, irrigation and dams.'],
          ['The Second Five Year Plan focused on…', 'Heavy industries', ['Only agriculture', 'Tourism', 'Handicrafts only'], 'Steel and machines.', 'The Second Plan emphasised heavy industry and the public sector.'],
          ['An economy with both public and private sectors is called a…', 'Mixed economy', ['Market economy', 'Barter economy', 'Command economy'], 'A mix of the two.', 'India chose a mixed economy.'],
          ['How many major banks were nationalised in 1969?', '14', ['6', '20', '27'], 'More were added in 1980.', 'Fourteen major banks were nationalised in July 1969.'],
          ['"Garibi Hatao" means…', 'Remove poverty', ['Grow more food', 'Quit India', 'Save water'], 'Garibi = poverty.', 'It was a slogan of the early 1970s.'],
        ]),
        orderT('order', 'Put these economic steps in time order.', [
          'Planning Commission set up', 'First Five Year Plan (agriculture)', 'Second Five Year Plan (heavy industry)', 'Green Revolution begins', 'Bank nationalisation',
        ], ['The Commission must exist before any plan.', 'Banks were nationalised in 1969.'], '1950 Commission → 1951 First Plan → 1956 Second Plan → mid-1960s Green Revolution → 1969 banks.'),
        matchT('match', 'item to its description', [
          ['First Plan', 'Agriculture, irrigation and dams'], ['Second Plan', 'Heavy industry and public sector'], ['Green Revolution', 'High-yielding seeds and fertilisers'],
          ['Bank nationalisation', 'Credit for farmers and small businesses'], ['Mixed economy', 'Public and private sectors together'], ['Nagarjuna Sagar', 'Large dam on the Krishna'],
        ], ['Plans: fields first, factories second.', 'Nagarjuna Sagar is on the Krishna.']),
      ],
    },
    {
      id: 'ts10.ss.indep.emergency', title: 'Political change and the Emergency (1975–77)', prereqs: ['ts10.ss.indep.plans'],
      intro: [
        h('When fundamental rights were suspended'),
        photo('📜', 'Under the Emergency of 1975–77, newspapers were censored and many fundamental rights were suspended.'),
        p('After Nehru\'s death in 1964 and Lal Bahadur Shastri\'s death in 1966, Indira Gandhi became Prime Minister. In the 1967 elections the Congress lost power in several states. The party split in 1969, but Indira Gandhi won a big victory in 1971 with the slogan "Garibi Hatao", and her popularity rose after the Bangladesh war of December 1971.'),
        p('By 1973–75, rising prices, unemployment and charges of corruption led to protests. Students in Gujarat and Bihar agitated, and the veteran leader Jayaprakash Narayan (JP) called for "total revolution". On 12 June 1975, the Allahabad High Court set aside Indira Gandhi\'s election to the Lok Sabha on grounds of electoral malpractice. Opposition parties demanded her resignation.'),
        def('National Emergency', 'A situation declared under Article 352 of the Constitution in which the central government gets very wide powers and some fundamental rights can be suspended.'),
        stepsB(
          '12 June 1975: Allahabad High Court verdict against Indira Gandhi\'s election.',
          '25 June 1975: Emergency proclaimed on grounds of "internal disturbance".',
          'Opposition leaders jailed, press censored, protests banned; forced sterilisation and slum demolitions in some areas caused suffering.',
          '1976: the 42nd Amendment makes large changes, including adding "socialist" and "secular" to the Preamble.',
          'January 1977: elections announced.',
          'March 1977: Congress defeated; the Janata Party forms the government; Emergency withdrawn on 21 March 1977.',
        ),
        p('Supporters of the government argued the Emergency was needed to restore order and discipline. Critics saw it as a serious attack on democracy and civil liberties. The 1977 election, in which voters peacefully removed the government, is widely seen as proof of the strength of Indian democracy. Later, the 44th Amendment (1978) made it harder to declare an Emergency in future.'),
        keys('Indira Gandhi PM from 1966; big victory in 1971.', 'JP movement and the 1975 Allahabad verdict preceded the Emergency.', 'Emergency: 25 June 1975 – 21 March 1977, under Article 352.', 'Rights suspended, press censored; voters removed the government in 1977.'),
        remember('Emergency: 25 June 1975 to 21 March 1977 (Article 352). 44th Amendment (1978) added safeguards.'),
        tip('Write about the Emergency with facts and both views: the government\'s stated reasons and the critics\' concerns.'),
      ],
      examples: [
        ex('Trace the causes of the Emergency as a chain of events.', ['Economic problems: rising prices and unemployment in the early 1970s.', 'Protests: students in Gujarat and Bihar; JP\'s call for total revolution.', 'Legal blow: the Allahabad High Court verdict of 12 June 1975.', 'Response: the government declared an Emergency on 25 June 1975.'], 'Economic distress → mass protests → court verdict → Emergency'),
        ex('Why is the 1977 election considered important for Indian democracy?', ['After 19 months of Emergency, citizens voted freely.', 'The ruling party was defeated and power passed peacefully to the Janata Party.', 'It showed that voters could correct the course of government.'], 'It showed that people could peacefully vote out a government that had curbed their rights'),
      ],
      practice: [
        mcq('mcq', 'Remember the article, the dates and what happened to rights.', [
          ['The Emergency was declared on…', '25 June 1975', ['26 January 1975', '12 June 1975', '21 March 1977'], '12 June was the court verdict.', 'It was proclaimed on the night of 25 June 1975.'],
          ['Under which article was the National Emergency of 1975 declared?', 'Article 352', ['Article 356', 'Article 370', 'Article 32'], 'Article 356 is President\'s rule in a state.', 'National Emergency is declared under Article 352.'],
          ['Who called for "total revolution" in 1974–75?', 'Jayaprakash Narayan', ['Morarji Desai', 'Charan Singh', 'N. T. Rama Rao'], 'He was a Gandhian socialist from Bihar.', 'JP led the movement against the government.'],
          ['Which court set aside Indira Gandhi\'s election in June 1975?', 'Allahabad High Court', ['Supreme Court', 'Bombay High Court', 'Election Commission'], 'A High Court in Uttar Pradesh.', 'The Allahabad High Court gave the verdict on 12 June 1975.'],
          ['Which party formed the government after the 1977 elections?', 'Janata Party', ['Congress', 'Telugu Desam Party', 'CPI(M)'], 'A combination of opposition groups.', 'The Janata Party won and Morarji Desai became PM.'],
          ['Which amendment added safeguards against misuse of Emergency powers?', '44th Amendment (1978)', ['42nd Amendment (1976)', '61st Amendment', '73rd Amendment'], 'Passed by the Janata government.', 'The 44th Amendment replaced "internal disturbance" with "armed rebellion" as a ground.'],
        ]),
        timelineT('tl', 'Arrange these events in time order.', c17Events, ['Start with the 1950s.', 'The Emergency and its end are the latest.'], 5, 3),
        tapT('tap', 'Tap every thing that happened during the Emergency (1975–77).', [
          ['Press censorship', true], ['Opposition leaders were jailed', true], ['Some fundamental rights were suspended', true], ['The 42nd Amendment was passed', true],
          ['Andhra State was formed', false], ['The first general elections were held', false], ['Banks were nationalised for the first time', false],
        ], ['The Emergency lasted from 1975 to 1977.', 'Andhra State (1953) and the first elections (1951–52) were much earlier.'], 'Censorship, arrests, suspension of rights and the 42nd Amendment belong to 1975–77.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 18 — Emerging Political Trends 1977 to 2000
// =====================================================================================
const c18Events: [number, string, string][] = [
  [1977.03, 'Janata Party government formed', 'March 1977'],
  [1977.06, 'Left Front comes to power in West Bengal', 'June 1977'],
  [1978.5, 'Operation Barga launched in West Bengal', '1978'],
  [1979.5, 'Assam movement begins', '1979'],
  [1982.03, 'Telugu Desam Party founded', '29 March 1982'],
  [1983.01, 'TDP wins the Andhra Pradesh election', 'January 1983'],
  [1985.08, 'Assam Accord signed', '15 August 1985'],
  [1989.12, 'National Front coalition government formed', 'December 1989'],
  [1990.08, 'Mandal Commission recommendations to be implemented', 'August 1990'],
  [1991.07, 'New economic policy (liberalisation)', 'July 1991'],
  [1992.12, 'Demolition of the Babri Masjid', '6 December 1992'],
  [1996.06, 'United Front coalition government', '1996'],
];

const ch18: USpec = {
  id: 'ts10.ss.ch18', subject: 'social', title: 'Emerging Political Trends 1977 to 2000', source: src(18),
  objectives: [
    {
      id: 'ts10.ss.trends.janata', title: 'Return of democracy: the Janata experiment and after', prereqs: [],
      intro: [
        h('The first non-Congress government at the Centre'),
        photo('🕊️', 'In 1977 voters restored democracy after the Emergency by electing a new government.'),
        p('The 1977 election was a turning point. For the first time since independence, a party other than the Congress formed the government in New Delhi. The Janata Party, formed by joining several opposition groups, chose Morarji Desai as Prime Minister.'),
        def('Coalition', 'An alliance of two or more parties that come together to form a government when no single party has a majority, or to fight elections jointly.'),
        p('The Janata government restored civil liberties, ended press censorship and, through the 44th Amendment (1978), added safeguards against misuse of Emergency powers. The Shah Commission inquired into excesses during the Emergency. But the Janata Party was made of groups with very different ideas, and quarrels among leaders broke it apart. The government fell in 1979; Charan Singh was briefly Prime Minister, and in the 1980 elections Indira Gandhi returned to power.'),
        stepsB(
          'March 1977: Janata Party wins; Morarji Desai becomes Prime Minister.',
          '1978: 44th Amendment restores safeguards for rights.',
          '1979: Janata Party splits; government falls; Charan Singh becomes PM briefly.',
          'January 1980: Congress under Indira Gandhi returns to power.',
          '31 October 1984: Indira Gandhi assassinated; Rajiv Gandhi becomes PM and wins a huge majority in December 1984.',
        ),
        keys('1977: first non-Congress government at the Centre (Janata, Morarji Desai).', 'Civil liberties restored; 44th Amendment passed.', 'Internal divisions caused its fall in 1979.', 'Congress returned in 1980; Rajiv Gandhi PM after 1984.'),
        remember('Morarji Desai was the first non-Congress Prime Minister of India (1977–79).'),
        tip('Lesson often asked: the Janata experiment showed both the power of voters and the difficulty of holding together very different parties.'),
      ],
      examples: [
        ex('Why did the Janata government fall within about two years?', ['It was formed by merging parties with different ideologies.', 'Leaders competed for power and could not agree.', 'Defections in 1979 cost it its majority.'], 'Internal differences and leadership rivalries'),
        ex('Name two steps the Janata government took to strengthen democracy.', ['It ended press censorship and released political prisoners.', 'It passed the 44th Amendment (1978) to make it harder to suspend rights.', 'It set up the Shah Commission to inquire into Emergency excesses.'], 'Restored press freedom and passed the 44th Amendment'),
      ],
      practice: [
        mcq('mcq', 'Recall who, when and why.', [
          ['Who was the first non-Congress Prime Minister of India?', 'Morarji Desai', ['Charan Singh', 'V. P. Singh', 'A. B. Vajpayee'], 'He led the Janata government in 1977.', 'Morarji Desai became PM in March 1977.'],
          ['The Janata government fell mainly because of…', 'Internal divisions among its leaders', ['Defeat in a war', 'A court verdict', 'Foreign pressure'], 'Different groups in one party.', 'Rivalries and differences split the Janata Party in 1979.'],
          ['Which commission inquired into excesses during the Emergency?', 'Shah Commission', ['Mandal Commission', 'Fazl Ali Commission', 'Srikrishna Committee'], 'Named after Justice J. C. Shah.', 'The Shah Commission examined Emergency excesses.'],
          ['When did Indira Gandhi return to power?', '1980', ['1977', '1984', '1989'], 'After the Janata government fell.', 'Congress won the January 1980 elections.'],
          ['Indira Gandhi was assassinated on…', '31 October 1984', ['25 June 1975', '21 May 1991', '30 January 1948'], 'Late 1984.', 'She was assassinated on 31 October 1984; Rajiv Gandhi succeeded her.'],
          ['An alliance of parties to form a government is called a…', 'Coalition', ['Monarchy', 'Dictatorship', 'Federation'], 'Several parties together.', 'A coalition is an alliance of parties.'],
        ]),
        orderT('order', 'Put these events in order.', [
          'Janata Party wins the election', 'Morarji Desai becomes Prime Minister', 'Janata Party splits', 'Congress returns to power', 'Rajiv Gandhi becomes Prime Minister',
        ], ['The win comes before the PM is chosen.', 'Rajiv Gandhi became PM in 1984.'], '1977 win → Desai PM → 1979 split → 1980 Congress return → 1984 Rajiv Gandhi.'),
        tapT('tap', 'Tap every step taken by the Janata government (1977–79).', [
          ['Ended press censorship', true], ['Passed the 44th Amendment', true], ['Set up the Shah Commission', true], ['Released political prisoners', true],
          ['Declared the Emergency', false], ['Nationalised 14 banks', false], ['Passed the States Reorganisation Act', false],
        ], ['The Janata government undid the Emergency.', 'Bank nationalisation was 1969.'], 'Restoring freedoms, the 44th Amendment and the Shah Commission were Janata steps.'),
      ],
    },
    {
      id: 'ts10.ss.trends.regional', title: 'Rise of regional parties: Telugu Desam and the Assam movement', prereqs: ['ts10.ss.trends.janata'],
      intro: [
        h('Regional pride enters national politics'),
        photo('🗣️', 'N. T. Rama Rao, a hugely popular film actor, founded the Telugu Desam Party in 1982.'),
        p('From the late 1970s, parties rooted in one state or region became powerful. They argued that national parties ignored regional interests and that state governments were often controlled from Delhi.'),
        h('Telugu Desam Party (Andhra Pradesh)'),
        p('N. T. Rama Rao (NTR) founded the Telugu Desam Party (TDP) on 29 March 1982, appealing to "Telugu self-respect". Within nine months it won the Assembly election of January 1983, ending Congress rule in the state. NTR introduced popular welfare schemes such as rice at ₹2 a kilo. In August 1984 the Governor dismissed his government; after a wide protest across the country by opposition parties, NTR was restored in September 1984. The episode fuelled debate about Centre–state relations and the role of Governors.'),
        h('The Assam movement'),
        p('In Assam, students and local groups led by the All Assam Students\' Union (AASU) began an agitation in 1979 against illegal immigration from across the border, which they felt threatened the identity, land and jobs of local people. After years of protest and violence, the Assam Accord was signed with the central government on 15 August 1985. Leaders of the movement formed the Asom Gana Parishad (AGP), which won the state election that year.'),
        def('Regional party', 'A party whose support and main concerns are centred in one state or region.'),
        def('Centre–state relations', 'The division of powers and the relationship between the Union government and the state governments.'),
        keys('Regional parties grew strong from the late 1970s and 1980s.', 'TDP (1982) won Andhra Pradesh in 1983 on Telugu self-respect.', 'Assam movement (1979–85) → Assam Accord (1985) → AGP government.', 'These movements raised questions about Centre–state relations.'),
        remember('TDP founded 29 March 1982 by N. T. Rama Rao. Assam Accord signed 15 August 1985.'),
        tip('For each regional movement, note: the leader, the main issue, the outcome.'),
      ],
      examples: [
        ex('Why did the TDP win so quickly in 1983?', ['NTR was a hugely popular film star.', 'He appealed to Telugu self-respect, saying leaders were controlled from Delhi.', 'People wanted change after long Congress rule; he promised welfare schemes like cheap rice.'], 'Popular leader, appeal to regional pride and promise of welfare'),
        ex('What was the main issue of the Assam movement and how did it end?', ['Issue: illegal immigration, seen as a threat to local identity, land and jobs.', 'Led by AASU from 1979, with years of agitation.', 'Ended with the Assam Accord (15 August 1985); AGP formed the state government.'], 'Illegal immigration; ended by the Assam Accord in 1985'),
      ],
      practice: [
        mcq('mcq', 'Leader → issue → outcome.', [
          ['Who founded the Telugu Desam Party?', 'N. T. Rama Rao', ['N. Chandrababu Naidu', 'M. Chenna Reddy', 'P. V. Narasimha Rao'], 'A famous film actor.', 'NTR founded the TDP in 1982.'],
          ['The TDP was founded in…', '1982', ['1977', '1985', '2001'], 'It won power in 1983.', 'The TDP was founded on 29 March 1982.'],
          ['The main slogan of the TDP was…', 'Telugu self-respect', ['Garibi Hatao', 'Quit India', 'Jai Jawan Jai Kisan'], 'Regional pride.', 'NTR appealed to the self-respect of Telugu people.'],
          ['The Assam movement was mainly against…', 'Illegal immigration', ['Bank nationalisation', 'The Green Revolution', 'The use of Hindi in Parliament'], 'Concern about identity and jobs.', 'It opposed illegal immigration into Assam.'],
          ['Which organisation led the Assam movement?', 'All Assam Students\' Union (AASU)', ['Telugu Desam Party', 'Left Front', 'Shiv Sena'], 'Students led it.', 'AASU led the agitation from 1979.'],
          ['The Assam Accord was signed in…', '1985', ['1979', '1975', '1991'], 'Six years after the movement began.', 'It was signed on 15 August 1985.'],
        ]),
        matchT('match', 'item to its description', [
          ['N. T. Rama Rao', 'Founded TDP in 1982'], ['AASU', 'Led the Assam movement'], ['Assam Accord', 'Signed on 15 August 1985'],
          ['Asom Gana Parishad', 'Party formed by Assam movement leaders'], ['Telugu self-respect', 'TDP\'s central appeal'], ['August 1984 crisis', 'NTR government dismissed, then restored'],
        ], ['TDP items belong to Andhra Pradesh; AASU/AGP to Assam.', 'The Accord is a document.']),
        timelineT('tl', 'Arrange these political events of 1977–2000 in time order.', c18Events, ['Recall the decade first.', 'The TDP came before the Assam Accord.']),
      ],
    },
    {
      id: 'ts10.ss.trends.coalition', title: 'Coalition politics and the Left Front in West Bengal', prereqs: ['ts10.ss.trends.regional'],
      intro: [
        h('No single party wins a majority'),
        photo('🧩', 'From 1989 onwards, governments in New Delhi were usually formed by alliances of many parties.'),
        p('From 1989 to 2014, no single party won a majority in the Lok Sabha on its own. Governments were formed by coalitions of national and regional parties. This is called the era of coalition politics.'),
        stepsB(
          '1989: National Front government led by V. P. Singh, with outside support from the BJP and the Left.',
          '1991: Congress minority government under P. V. Narasimha Rao (from Telangana).',
          '1996–98: United Front governments under H. D. Deve Gowda and I. K. Gujral.',
          '1998–2004: National Democratic Alliance (NDA) governments under A. B. Vajpayee.',
        ),
        p('Coalitions gave regional parties a bigger voice in national decisions. Critics said they could be unstable; supporters said they reflected India\'s diversity and forced parties to bargain and compromise.'),
        h('The Left Front in West Bengal'),
        p('In West Bengal, the Left Front, led by the Communist Party of India (Marxist), came to power in 1977 and ruled for 34 years. Jyoti Basu was Chief Minister from 1977 to 2000. Its best-known reform was Operation Barga (launched in 1978), which recorded the names of sharecroppers (bargadars) so they could not be evicted easily and would get a fair share of the crop. Regular panchayat elections also gave rural people a say in local government.'),
        def('Sharecropper (bargadar)', 'A cultivator who farms someone else\'s land and gives a share of the crop to the landowner as rent.'),
        def('Operation Barga', 'A programme in West Bengal (from 1978) to register sharecroppers and protect their rights.'),
        keys('1989–2014: coalition era — no single party majority in the Lok Sabha.', 'Coalitions: National Front, United Front, NDA.', 'Regional parties gained influence at the Centre.', 'Left Front ruled West Bengal from 1977; Operation Barga protected sharecroppers.'),
        remember('Jyoti Basu: Chief Minister of West Bengal 1977–2000. Operation Barga: 1978.'),
        tip('Give both sides: coalitions = more voices and compromise, but sometimes instability.'),
      ],
      examples: [
        ex('How did Operation Barga help sharecroppers?', ['Their names were officially recorded as bargadars.', 'Once recorded, landlords could not evict them easily.', 'They were entitled to a fixed, fair share of the crop.'], 'Recording gave them security against eviction and a fair share of the crop'),
        ex('Give one advantage and one disadvantage of coalition governments.', ['Advantage: many regions and groups get a voice; decisions need consensus.', 'Disadvantage: partners may withdraw support, so the government can fall.'], 'More representation, but possible instability'),
      ],
      practice: [
        mcq('mcq', 'Coalitions at the Centre; the Left in West Bengal.', [
          ['Who led the National Front government formed in 1989?', 'V. P. Singh', ['Morarji Desai', 'Rajiv Gandhi', 'Jyoti Basu'], 'He later implemented the Mandal report.', 'V. P. Singh became PM in December 1989.'],
          ['Operation Barga was launched in…', 'West Bengal', ['Kerala', 'Andhra Pradesh', 'Assam'], 'A Left Front state.', 'It was a West Bengal programme from 1978.'],
          ['Operation Barga mainly benefited…', 'Sharecroppers', ['Industrialists', 'Exporters', 'Bank officers'], 'Bargadars.', 'It recorded and protected sharecroppers.'],
          ['Who was Chief Minister of West Bengal from 1977 to 2000?', 'Jyoti Basu', ['Mamata Banerjee', 'Buddhadeb Bhattacharjee', 'Siddhartha Shankar Ray'], 'A CPI(M) leader.', 'Jyoti Basu headed the Left Front government for 23 years.'],
          ['The coalition era at the Centre is usually said to run from…', '1989 to 2014', ['1947 to 1967', '1977 to 1980', '1952 to 1977'], 'No single-party majority.', 'From 1989 until 2014 no party won a majority alone.'],
          ['Which Prime Minister from Telangana led the government from 1991?', 'P. V. Narasimha Rao', ['N. T. Rama Rao', 'Charan Singh', 'I. K. Gujral'], 'He was from Vangara, Karimnagar district.', 'P. V. Narasimha Rao was PM from 1991 to 1996.'],
        ]),
        matchT('match', 'leader to the government or role', [
          ['V. P. Singh', 'National Front government (1989)'], ['H. D. Deve Gowda', 'United Front government (1996)'], ['A. B. Vajpayee', 'NDA government (1998–2004)'],
          ['Jyoti Basu', 'Left Front Chief Minister of West Bengal'], ['P. V. Narasimha Rao', 'Prime Minister from 1991'], ['Morarji Desai', 'Janata government (1977)'],
        ], ['Put the coalitions in time order first.', 'Jyoti Basu was a state leader.']),
        tapT('tap', 'Tap every TRUE statement about coalition politics.', [
          ['Regional parties gained influence at the Centre', true], ['Parties had to compromise on policies', true], ['Some coalition governments fell when partners withdrew', true], ['The NDA was a coalition', true],
          ['One party always had a big majority from 1989 to 2014', false], ['Coalitions were banned by the Constitution', false], ['Only two parties existed in India', false],
        ], ['Think about 1989–2014.', 'The Constitution does not ban coalitions.'], 'Coalitions brought regional voices and compromise, but sometimes instability.'),
      ],
    },
    {
      id: 'ts10.ss.trends.1990s', title: 'The 1990s: Mandal, communalism, liberalisation and local democracy', prereqs: ['ts10.ss.trends.coalition'],
      intro: [
        h('A decade of big changes'),
        photo('📖', 'The 1990s brought debates on reservations, communal violence and economic reforms — issues that still shape politics.'),
        p('The 1990s changed Indian politics in several ways at once. Four issues stand out.'),
        def('Mandal Commission', 'The Second Backward Classes Commission (set up in 1979, chaired by B. P. Mandal), which recommended 27% reservation for Other Backward Classes (OBCs) in central government jobs. Its recommendations were accepted for implementation in August 1990.'),
        p('The Mandal decision led to strong protests by some students and strong support from many backward-class groups. The Supreme Court upheld OBC reservation in 1992 but excluded the better-off "creamy layer". Parties representing backward classes grew powerful, especially in north India.'),
        def('Communalism', 'Using religious identity to divide people and to mobilise them politically against other religious communities.'),
        p('Communal tensions rose in the 1980s and 1990s. The anti-Sikh violence after Indira Gandhi\'s assassination in 1984 and the violence after the demolition of the Babri Masjid in Ayodhya on 6 December 1992 cost many lives. These events raised serious concerns about secularism and the protection of minorities.'),
        p('In July 1991, facing a severe balance-of-payments crisis, the government of P. V. Narasimha Rao, with Manmohan Singh as Finance Minister, began economic reforms: liberalisation, privatisation and globalisation. Licence controls were reduced and foreign investment welcomed.'),
        p('In 1992 the 73rd and 74th Constitutional Amendments gave constitutional status to panchayats and municipalities, with regular elections and reservation of one-third of seats for women — deepening democracy at the grassroots.'),
        keys('Mandal: 27% OBC reservation in central jobs (implementation announced 1990).', 'Communal violence in 1984 and 1992 raised concerns about secularism.', '1991: economic reforms (LPG).', '73rd and 74th Amendments (1992): constitutional panchayats and municipalities.'),
        remember('73rd Amendment = panchayats; 74th Amendment = urban local bodies (municipalities). Both 1992, in force 1993.'),
        tip('For the 1990s, remember four Ms: Mandal, Mandir–Masjid tensions, Market reforms, Municipal/panchayat amendments.'),
      ],
      examples: [
        ex('Explain the impact of the Mandal decision on Indian politics.', ['It extended reservations in central jobs to OBCs (27%).', 'It led to protests by some and celebration by others.', 'Backward-class groups became more politically organised; parties representing them grew stronger.'], 'It made OBC representation a central issue and strengthened backward-class politics'),
        ex('Why were the 73rd and 74th Amendments important for democracy?', ['Panchayats and municipalities got constitutional status.', 'Regular elections became compulsory.', 'One-third of seats were reserved for women, and seats for SCs and STs.'], 'They made local self-government regular and more inclusive'),
      ],
      practice: [
        mcq('mcq', 'Link each 1990s issue to its key fact.', [
          ['The Mandal Commission recommended reservation for…', 'Other Backward Classes', ['Only Scheduled Tribes', 'Only women', 'Ex-servicemen'], 'OBCs.', 'It recommended 27% reservation for OBCs in central jobs.'],
          ['Which Prime Minister announced implementation of the Mandal report in 1990?', 'V. P. Singh', ['Rajiv Gandhi', 'P. V. Narasimha Rao', 'A. B. Vajpayee'], 'National Front leader.', 'V. P. Singh announced it in August 1990.'],
          ['India\'s economic reforms began in…', '1991', ['1969', '1977', '2000'], 'Under P. V. Narasimha Rao.', 'The new economic policy began in July 1991.'],
          ['Who was the Finance Minister in 1991 who presented the reform budget?', 'Manmohan Singh', ['Pranab Mukherjee', 'Yashwant Sinha', 'P. Chidambaram'], 'He later became PM.', 'Manmohan Singh was Finance Minister from 1991 to 1996.'],
          ['The 73rd Amendment deals with…', 'Panchayati Raj institutions', ['Municipalities', 'Voting age', 'Emergency powers'], 'Rural local government.', 'The 73rd Amendment gave constitutional status to panchayats.'],
          ['What share of seats in local bodies is reserved for women under the 73rd and 74th Amendments?', 'At least one-third', ['One-half by the 1992 law', 'One-tenth', 'None'], 'Several states later raised it to 50%.', 'The amendments reserved at least one-third of seats for women.'],
        ]),
        timelineT('tl', 'Arrange these events in time order.', c18Events, ['Mandal (1990) came just before the 1991 reforms.', 'The coalition era began in 1989.'], 5, 3),
        matchT('match', 'item to what it is about', [
          ['Mandal Commission', 'Reservation for OBCs'], ['1991 reforms', 'Liberalisation, privatisation, globalisation'], ['73rd Amendment', 'Panchayats'], ['74th Amendment', 'Municipalities'],
          ['Communalism', 'Politics dividing people by religion'], ['Creamy layer', 'Better-off OBCs excluded from reservation'],
        ], ['73 = rural, 74 = urban.', 'Creamy layer is about OBC reservation.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 19 — Post-War World and India
// =====================================================================================
const c19Events: [number, string, string][] = [
  [1945.1, 'United Nations founded', '24 October 1945'],
  [1948.05, 'State of Israel declared', '14 May 1948'],
  [1949.04, 'NATO formed', 'April 1949'],
  [1950.06, 'Korean War begins', 'June 1950'],
  [1954.04, 'Panchsheel agreement between India and China', 'April 1954'],
  [1955.05, 'Warsaw Pact formed', 'May 1955'],
  [1961.09, 'First Non-Aligned summit at Belgrade', 'September 1961'],
  [1962.1, 'Cuban missile crisis', 'October 1962'],
  [1967.06, 'Six-Day War in West Asia', 'June 1967'],
  [1971.12, 'Bangladesh becomes independent', 'December 1971'],
  [1972.07, 'Simla Agreement between India and Pakistan', 'July 1972'],
  [1985.12, 'SAARC formed', 'December 1985'],
  [1989.11, 'Fall of the Berlin Wall', 'November 1989'],
  [1991.12, 'Soviet Union dissolved', 'December 1991'],
];

const ch19: USpec = {
  id: 'ts10.ss.ch19', subject: 'social', title: 'Post-War World and India', source: src(19),
  objectives: [
    {
      id: 'ts10.ss.postwar.coldwar', title: 'The Cold War: two camps, alliances, proxy wars and the arms race', prereqs: [],
      intro: [
        h('A war without direct battles between the two giants'),
        photo('🌍', 'After 1945 the world split into two camps led by the USA and the USSR.'),
        p('The Second World War ended in 1945 with two superpowers: the United States of America (USA), a capitalist democracy, and the Soviet Union (USSR), a communist state. They never fought each other directly, but for about 45 years they competed for power and influence all over the world. This rivalry is called the Cold War.'),
        def('Cold War', 'The rivalry (about 1945–1991) between the USA-led Western bloc and the USSR-led Eastern bloc, fought through alliances, arms races, propaganda and proxy wars rather than direct war.'),
        def('Proxy war', 'A war in which the superpowers support opposite sides in another country\'s conflict instead of fighting each other directly.'),
        def('Arms race', 'Competition between rivals to build more and deadlier weapons, especially nuclear weapons.'),
        h('Alliances and flashpoints'),
        stepsB(
          '1945: United Nations founded (24 October) to keep peace.',
          '1949: USA and Western European countries form NATO.',
          '1950–53: Korean War — North (backed by USSR and China) vs South (backed by USA and UN forces).',
          '1955: USSR and East European countries form the Warsaw Pact.',
          '1961: Berlin Wall built, dividing East and West Berlin.',
          'October 1962: Cuban missile crisis — the world comes close to nuclear war.',
          '1960s–1975: Vietnam War, a long proxy war ending with the unification of Vietnam under the North.',
          '9 November 1989: Berlin Wall falls; 1991: USSR dissolved — the Cold War ends.',
        ),
        p('The arms race built thousands of nuclear weapons. Huge sums were spent on weapons instead of on development. Smaller countries were pressured to join one camp or the other.'),
        keys('Two camps: USA (capitalist) vs USSR (communist).', 'Alliances: NATO (1949) vs Warsaw Pact (1955).', 'Proxy wars: Korea, Vietnam and others.', 'Arms race and crises like Cuba (1962); ended with the USSR\'s break-up in 1991.'),
        remember('NATO: 1949. Warsaw Pact: 1955. Cuban missile crisis: 1962. Berlin Wall fell: 1989. USSR dissolved: 1991.'),
        tip('"Cold" because the two superpowers never fought each other directly.'),
      ],
      examples: [
        ex('Why is the Korean War called a proxy war?', ['North Korea was backed by the USSR and China.', 'South Korea was backed by the USA and UN forces.', 'The superpowers fought through the two Koreas instead of directly.'], 'Because the superpowers backed opposite sides instead of fighting each other directly'),
        ex('Explain one harmful effect of the arms race on developing countries.', ['Money and attention went to weapons and military alliances.', 'Poorer countries were pulled into rivalries and sometimes into wars.', 'Resources that could fight poverty were diverted.'], 'It diverted resources from development and drew poor countries into conflicts'),
      ],
      practice: [
        mcq('mcq', 'Two camps, two alliances, many proxy wars.', [
          ['The two superpowers of the Cold War were…', 'USA and USSR', ['Britain and France', 'China and Japan', 'India and Pakistan'], 'Capitalist vs communist.', 'The USA and the USSR led the two blocs.'],
          ['NATO was formed in…', '1949', ['1945', '1955', '1961'], 'Four years after WWII.', 'NATO was formed in April 1949.'],
          ['The Warsaw Pact was led by…', 'The Soviet Union', ['The USA', 'Britain', 'India'], 'The Eastern bloc.', 'The Warsaw Pact (1955) was the Soviet-led alliance.'],
          ['The Cuban missile crisis took place in…', '1962', ['1949', '1975', '1989'], 'Same year as the India–China war.', 'It happened in October 1962.'],
          ['The Berlin Wall fell in…', '1989', ['1961', '1991', '1975'], 'Two years before the USSR ended.', 'It fell on 9 November 1989.'],
          ['A war in which superpowers support opposite sides in another country is a…', 'Proxy war', ['Civil disobedience', 'World war', 'Trade war'], 'They fight through others.', 'Korea and Vietnam were proxy wars.'],
        ]),
        timelineT('tl', 'Arrange these post-war events in time order.', c19Events, ['The UN came first, in 1945.', 'The Cold War ended around 1989–91.']),
        matchT('match', 'item to its description', [
          ['NATO', 'Western military alliance (1949)'], ['Warsaw Pact', 'Soviet-led alliance (1955)'], ['Korean War', 'Proxy war, 1950–53'], ['Cuban missile crisis', 'Nuclear stand-off, 1962'],
          ['Berlin Wall', 'Divided East and West Berlin'], ['United Nations', 'Founded in 1945 to keep peace'],
        ], ['Two alliances: West and East.', 'The UN is not an alliance.']),
      ],
    },
    {
      id: 'ts10.ss.postwar.nam', title: 'The Non-Aligned Movement and India\'s foreign policy', prereqs: ['ts10.ss.postwar.coldwar'],
      intro: [
        h('Choosing not to choose a camp'),
        photo('🕊️', 'Non-alignment meant keeping independence in foreign policy and working for peace, not joining either military bloc.'),
        p('Newly independent countries like India had just escaped colonial rule. They did not want to become junior partners of either superpower. They needed peace and help for development, and they wanted to judge each issue on its merits. This idea became non-alignment.'),
        def('Non-alignment', 'A foreign policy of not joining either Cold War military bloc, keeping freedom of decision and promoting peace and cooperation.'),
        def('Panchsheel', 'Five principles of peaceful coexistence agreed by India and China in 1954: mutual respect for territorial integrity and sovereignty, non-aggression, non-interference in internal affairs, equality and mutual benefit, and peaceful coexistence.'),
        stepsB(
          '1954: India and China agree on Panchsheel.',
          'April 1955: Asian–African Conference at Bandung (Indonesia) brings newly independent nations together.',
          'September 1961: first Non-Aligned summit in Belgrade, Yugoslavia.',
          'NAM grows to over 100 members, mostly from Asia, Africa and Latin America.',
        ),
        p('The founding leaders were Jawaharlal Nehru (India), Gamal Abdel Nasser (Egypt), Josip Broz Tito (Yugoslavia), Sukarno (Indonesia) and Kwame Nkrumah (Ghana). NAM supported decolonisation, opposed apartheid in South Africa, called for disarmament and demanded a fairer world economic order. Non-alignment did not mean neutrality or isolation — India took clear positions on issues and accepted aid from both blocs.'),
        keys('Non-alignment = not joining either bloc; independent foreign policy.', 'Panchsheel (1954): five principles of peaceful coexistence.', 'Bandung 1955 → Belgrade summit 1961.', 'Founders: Nehru, Nasser, Tito, Sukarno, Nkrumah.'),
        remember('First NAM summit: Belgrade, September 1961. Panchsheel: 1954 (India–China).'),
        tip('Non-aligned ≠ neutral: India spoke out on issues but stayed out of military alliances.'),
      ],
      examples: [
        ex('Why did newly independent countries choose non-alignment?', ['They had just won freedom and wanted to keep their independence.', 'Joining a bloc could drag them into Cold War conflicts.', 'They needed peace and aid from all sides for development.'], 'To protect their independence, stay out of conflicts and focus on development'),
        ex('Is non-alignment the same as neutrality? Explain.', ['Neutral countries avoid taking positions on international disputes.', 'Non-aligned countries took active positions — e.g. against colonialism and apartheid.', 'They only refused to join military alliances.'], 'No — non-aligned countries were active in world affairs but stayed out of military blocs'),
      ],
      practice: [
        mcq('mcq', 'Founders, places and principles.', [
          ['The first Non-Aligned summit was held at…', 'Belgrade', ['Bandung', 'New Delhi', 'Cairo'], 'Capital of Yugoslavia.', 'It met in Belgrade in September 1961.'],
          ['Which leader was NOT a founder of NAM?', 'Winston Churchill', ['Jawaharlal Nehru', 'Gamal Abdel Nasser', 'Josip Broz Tito'], 'He was British PM.', 'Churchill was a Western bloc leader, not a NAM founder.'],
          ['Panchsheel was agreed between India and…', 'China', ['Pakistan', 'USA', 'USSR'], 'Signed in 1954.', 'India and China agreed on Panchsheel in 1954.'],
          ['The Bandung Conference of 1955 brought together countries of…', 'Asia and Africa', ['Europe and North America', 'Only Latin America', 'Only the Soviet bloc'], 'Held in Indonesia.', 'It was the Asian–African Conference.'],
          ['Non-alignment means…', 'Not joining either military bloc', ['Having no foreign policy', 'Supporting only the USA', 'Being at war with both blocs'], 'Independence in foreign policy.', 'Non-aligned countries stayed out of military alliances.'],
          ['Which of these did NAM strongly oppose?', 'Apartheid in South Africa', ['Decolonisation', 'Disarmament', 'Economic cooperation'], 'Racial discrimination.', 'NAM opposed apartheid and colonialism.'],
        ]),
        matchT('match', 'NAM founder to their country', [
          ['Jawaharlal Nehru', 'India'], ['Gamal Abdel Nasser', 'Egypt'], ['Josip Broz Tito', 'Yugoslavia'], ['Sukarno', 'Indonesia'], ['Kwame Nkrumah', 'Ghana'],
        ], ['Tito\'s country hosted the first summit.', 'Sukarno\'s country hosted Bandung.']),
        tapT('tap', 'Tap every principle of Panchsheel.', [
          ['Mutual respect for territorial integrity and sovereignty', true], ['Mutual non-aggression', true], ['Non-interference in internal affairs', true], ['Equality and mutual benefit', true], ['Peaceful coexistence', true],
          ['Joining a military alliance', false], ['Supporting one superpower', false],
        ], ['There are five principles, all about peace and respect.', 'Military alliances go against non-alignment.'], 'Panchsheel: integrity and sovereignty, non-aggression, non-interference, equality and mutual benefit, peaceful coexistence.'),
      ],
    },
    {
      id: 'ts10.ss.postwar.westasia', title: 'Conflicts in West Asia', prereqs: ['ts10.ss.postwar.coldwar'],
      intro: [
        h('Land, oil and the search for peace'),
        photo('🐪', 'West Asia holds large oil reserves, which made the region important to the superpowers.'),
        p('West Asia (the Middle East) has seen some of the longest conflicts of the post-war world. Two reasons stand out: the dispute over Palestine, and the region\'s oil, which drew in outside powers.'),
        def('Palestine question', 'The conflict between Israelis and Palestinians over land, borders, refugees and statehood in the area of historic Palestine.'),
        stepsB(
          '1947: the UN proposes partition of Palestine into Jewish and Arab states.',
          '14 May 1948: Israel declares independence; war with Arab neighbours follows; many Palestinians become refugees.',
          '1956: Suez crisis after Egypt nationalises the Suez Canal.',
          '1964: Palestine Liberation Organisation (PLO) formed.',
          'June 1967: Six-Day War — Israel occupies the West Bank, Gaza, Sinai and Golan Heights.',
          '1973: Arab–Israeli war; Arab oil producers cut supplies — oil prices shoot up worldwide.',
          '1978: Camp David Accords lead to an Egypt–Israel peace treaty (1979).',
          '1993: Oslo Accords between Israel and the PLO.',
        ),
        p('Other conflicts included the Iran–Iraq war (1980–88) and the Gulf War (1991), when a US-led coalition expelled Iraq from Kuwait, which Iraq had invaded in August 1990. These wars caused great loss of life and affected oil prices — and the millions of Indians, many from Telangana and Kerala, working in the Gulf countries.'),
        p('India has long supported the rights of the Palestinian people. It recognised Israel in 1950 and established full diplomatic relations with it in 1992, and today maintains ties with both Israel and Arab countries.'),
        keys('Core issue: Israel–Palestine dispute over land and statehood.', 'Wars: 1948, 1956, 1967, 1973; peace efforts: Camp David (1978), Oslo (1993).', 'Oil made the region central to world politics.', 'India supports Palestinian rights and has ties with Israel since 1992.'),
        remember('Israel declared independence: 14 May 1948. Six-Day War: 1967. Oslo Accords: 1993.'),
        tip('West Asia answers: mention land (Palestine), oil, and outside powers.'),
      ],
      examples: [
        ex('Why did the 1973 Arab–Israeli war affect people far away, even in India?', ['Arab oil producers cut oil supplies to countries supporting Israel.', 'World oil prices rose sharply.', 'Countries like India, which import oil, faced higher prices for fuel and goods.'], 'The oil crisis raised fuel and goods prices worldwide'),
        ex('Why did the Gulf War of 1991 matter to families in Telangana?', ['Many workers from Telangana and Kerala worked in Kuwait and other Gulf countries.', 'Iraq\'s invasion of Kuwait forced lakhs of Indians to be evacuated.', 'Families lost remittances (money sent home).'], 'Workers were evacuated and families lost income sent from the Gulf'),
      ],
      practice: [
        mcq('mcq', 'Land, oil and peace accords.', [
          ['Israel declared its independence in…', '1948', ['1945', '1956', '1967'], 'Soon after WWII.', 'Israel was declared on 14 May 1948.'],
          ['Which war in 1967 lasted only six days?', 'Arab–Israeli Six-Day War', ['Korean War', 'Gulf War', 'Suez crisis'], 'June 1967.', 'In the Six-Day War Israel occupied several territories.'],
          ['The PLO was formed in…', '1964', ['1948', '1973', '1993'], 'Before the Six-Day War.', 'The Palestine Liberation Organisation was formed in 1964.'],
          ['The 1991 Gulf War followed Iraq\'s invasion of…', 'Kuwait', ['Iran', 'Israel', 'Egypt'], 'A small oil-rich neighbour.', 'Iraq invaded Kuwait in August 1990.'],
          ['The Oslo Accords (1993) were between…', 'Israel and the PLO', ['USA and USSR', 'India and Pakistan', 'Iran and Iraq'], 'A peace process for Palestine.', 'Israel and the PLO signed the Oslo Accords.'],
          ['India established full diplomatic relations with Israel in…', '1992', ['1948', '1950', '1967'], 'It recognised Israel in 1950.', 'Full diplomatic ties began in 1992.'],
        ]),
        orderT('order', 'Put these West Asian events in time order.', [
          'Israel declares independence', 'Suez crisis', 'Six-Day War', 'Arab–Israeli war and oil crisis', 'Camp David Accords', 'Oslo Accords',
        ], ['1948 comes first.', 'Oslo (1993) is the latest.'], '1948 → 1956 → 1967 → 1973 → 1978 → 1993.'),
        tapT('tap', 'Tap every reason West Asia became a centre of conflict.', [
          ['Dispute over land in Palestine', true], ['Large oil reserves', true], ['Involvement of outside powers', true], ['Refugee problems after 1948', true],
          ['The Non-Aligned summit at Belgrade', false], ['The Green Revolution', false], ['The Panchsheel agreement', false],
        ], ['Think land, oil, outsiders.', 'Belgrade and Panchsheel are about peace, not West Asian conflict.'], 'Land disputes, oil, outside powers and refugees fuelled conflict.'),
      ],
    },
    {
      id: 'ts10.ss.postwar.neighbours', title: 'India and its neighbours: China, Pakistan, Bangladesh, Sri Lanka', prereqs: ['ts10.ss.postwar.nam'],
      intro: [
        h('You can choose friends, not neighbours'),
        photo('🗺️', 'India shares land borders with Pakistan, China, Nepal, Bhutan, Bangladesh and Myanmar, and sea borders with Sri Lanka and the Maldives.'),
        p('A country\'s neighbours affect its security, trade, water and people. India\'s relations with its neighbours have had periods of friendship and periods of conflict.'),
        h('China'),
        p('India was among the first countries to recognise the People\'s Republic of China. In 1954 the two signed Panchsheel, and "Hindi–Chini bhai bhai" was a popular slogan. But a border dispute, and tensions after the Dalai Lama took refuge in India in 1959, led to war in October–November 1962. Relations improved slowly from the late 1980s, though the border issue remains.'),
        h('Pakistan'),
        p('Relations with Pakistan have been difficult since Partition. Wars were fought in 1947–48 and 1965 (followed by the Tashkent Declaration, January 1966) and 1971. The Indus Waters Treaty (1960) shares the waters of the Indus rivers and has survived the wars. The Simla Agreement (1972) committed both to settle differences bilaterally and peacefully. In 1999 there was conflict in Kargil.'),
        h('Bangladesh'),
        p('In 1971 the people of East Pakistan rose against military rule. Millions of refugees fled to India. India supported the liberation struggle, and after a short war, Pakistani forces surrendered on 16 December 1971: Bangladesh became independent. The two countries later signed the Ganga waters treaty (1996) and settled their land boundary (2015).'),
        h('Sri Lanka'),
        p('Sri Lanka faced a long ethnic conflict between the Sinhala majority government and Tamil groups, including the LTTE. Under the India–Sri Lanka Accord (1987), India sent the Indian Peace Keeping Force (IPKF), which withdrew in 1990. The civil war ended in 2009.'),
        def('SAARC', 'The South Asian Association for Regional Cooperation, formed in Dhaka in December 1985 by India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan and the Maldives (Afghanistan joined in 2007).'),
        keys('China: Panchsheel 1954, war 1962, border issue continues.', 'Pakistan: wars 1947–48, 1965, 1971; Indus Waters Treaty 1960; Simla 1972.', 'Bangladesh: liberated 16 December 1971 with India\'s support.', 'Sri Lanka: ethnic conflict; IPKF 1987–90. SAARC formed 1985.'),
        remember('Simla Agreement: 1972. Indus Waters Treaty: 1960. SAARC: 1985 (Dhaka).'),
        tip('For each neighbour: one friendly event, one conflict, one agreement.'),
      ],
      examples: [
        ex('How did the 1971 crisis in East Pakistan affect India?', ['Military repression in East Pakistan sent about a crore of refugees into India.', 'This put huge pressure on India\'s resources.', 'India supported the liberation struggle; war followed and Bangladesh became independent on 16 December 1971.'], 'A refugee influx led India to support Bangladesh\'s liberation'),
        ex('Give one example of cooperation between India and Pakistan despite conflicts.', ['The Indus Waters Treaty (1960) divides the Indus river waters.', 'It has continued through several wars.', 'The Simla Agreement (1972) also committed both to peaceful bilateral talks.'], 'The Indus Waters Treaty (1960)'),
      ],
      practice: [
        mcq('mcq', 'One neighbour at a time.', [
          ['The India–China war took place in…', '1962', ['1954', '1965', '1971'], 'Same year as the Cuban crisis.', 'The war was fought in October–November 1962.'],
          ['The Simla Agreement was signed between India and…', 'Pakistan', ['China', 'Sri Lanka', 'Bangladesh'], 'After the 1971 war.', 'India and Pakistan signed it in July 1972.'],
          ['Bangladesh became independent in…', '1971', ['1947', '1965', '1985'], 'Pakistani forces surrendered on 16 December.', 'Bangladesh was liberated in December 1971.'],
          ['The IPKF was sent to…', 'Sri Lanka', ['Bangladesh', 'Nepal', 'Pakistan'], 'Under a 1987 accord.', 'The Indian Peace Keeping Force went to Sri Lanka (1987–90).'],
          ['SAARC was formed in…', '1985', ['1961', '1972', '1991'], 'At Dhaka.', 'SAARC was set up in December 1985.'],
          ['The Indus Waters Treaty (1960) was signed between India and…', 'Pakistan', ['China', 'Nepal', 'Bangladesh'], 'The Indus flows into Pakistan.', 'India and Pakistan signed it with World Bank help.'],
        ]),
        matchT('match', 'agreement or event to the neighbour', [
          ['Panchsheel (1954)', 'China'], ['Simla Agreement (1972)', 'Pakistan'], ['Liberation war (1971)', 'Bangladesh'], ['IPKF (1987)', 'Sri Lanka'],
          ['Tashkent Declaration (1966)', 'Pakistan'], ['Ganga waters treaty (1996)', 'Bangladesh'],
        ], ['Panchsheel = China.', 'The Ganga flows into Bangladesh.']),
        timelineT('tl', 'Arrange these events in time order.', c19Events, ['Panchsheel came before the Belgrade summit.', 'SAARC (1985) came before the fall of the Berlin Wall.'], 5, 3),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 20 — Social Movements in Our Times
// =====================================================================================
const c20Events: [number, string, string][] = [
  [1955.12, 'Montgomery bus boycott begins after Rosa Parks\'s arrest', 'December 1955'],
  [1963.08, 'March on Washington ("I have a dream")', 'August 1963'],
  [1964.07, 'US Civil Rights Act', '1964'],
  [1965.08, 'US Voting Rights Act', '1965'],
  [1971.09, 'Greenpeace begins with a voyage against nuclear testing', '1971'],
  [1973.04, 'Chipko movement begins in the Himalayas', '1973'],
  [1984.12, 'Bhopal gas tragedy', '2–3 December 1984'],
  [1989.5, 'Narmada Bachao Andolan takes shape', 'late 1980s'],
  [1992.5, 'Anti-arrack movement spreads from Dubagunta, Nellore', '1992'],
  [1993.1, 'Sale of arrack banned in Andhra Pradesh', 'October 1993'],
];

const ch20: USpec = {
  id: 'ts10.ss.ch20', subject: 'social', title: 'Social Movements in Our Times', source: src(20),
  objectives: [
    {
      id: 'ts10.ss.movements.civil', title: 'Civil rights and anti-war movements', prereqs: [],
      intro: [
        h('One woman refused to give up her seat'),
        photo('🚌', 'On 1 December 1955, Rosa Parks refused to give up her bus seat to a white passenger in Montgomery, USA — sparking a year-long boycott.'),
        p('In the southern states of the USA in the 1950s, African Americans faced segregation: separate schools, separate seats in buses, separate restaurants, and many were stopped from voting. When Rosa Parks was arrested in Montgomery, Alabama, for refusing to give up her bus seat, Black residents boycotted the city buses for over a year (1955–56). A young pastor, Martin Luther King Jr., emerged as a leader.'),
        def('Civil rights', 'The rights of citizens to equal treatment and freedom — to vote, to equal education, and to use public places without discrimination.'),
        def('Segregation', 'Forced separation of people by race in schools, transport and public places.'),
        p('King was inspired by Gandhi\'s non-violent resistance. Through boycotts, sit-ins, freedom rides and marches — including the 1963 March on Washington where he gave his "I have a dream" speech — the movement won the Civil Rights Act (1964) and the Voting Rights Act (1965). King received the Nobel Peace Prize in 1964 and was assassinated in 1968.'),
        h('The anti-Vietnam War movement'),
        p('In the 1960s, the USA sent hundreds of thousands of soldiers to fight in Vietnam. As casualties rose and images of destruction reached homes through television, students, writers, musicians and veterans protested. Many young men refused the draft (compulsory military service). Public pressure contributed to the US decision to withdraw its forces in 1973.'),
        keys('Civil rights movement fought racial segregation in the USA.', 'Methods: boycotts, sit-ins, marches — non-violent, inspired by Gandhi.', 'Results: Civil Rights Act 1964, Voting Rights Act 1965.', 'Anti-war protests helped end US involvement in Vietnam (1973).'),
        remember('Montgomery bus boycott: 1955–56. "I have a dream": March on Washington, 28 August 1963.'),
        tip('Link to India: Martin Luther King Jr. visited India in 1959 to learn about Gandhi\'s methods.'),
      ],
      examples: [
        ex('Explain the cause–effect chain of the Montgomery bus boycott.', ['Cause: bus segregation; Rosa Parks arrested (December 1955).', 'Action: Black citizens boycotted buses for over a year.', 'Effect: bus companies lost money; the courts declared bus segregation unconstitutional (1956).', 'Wider effect: Martin Luther King Jr. became a national leader of the movement.'], 'Arrest → boycott → bus segregation ended → national movement grew'),
        ex('Why did many Americans oppose the Vietnam War?', ['Large numbers of young Americans were drafted and killed.', 'Television showed the suffering of Vietnamese civilians.', 'Many felt the war was unjust and wasteful.'], 'Rising casualties, visible civilian suffering and doubts about the war\'s justice'),
      ],
      practice: [
        mcq('mcq', 'Who, where, when, and how.', [
          ['Whose arrest in 1955 sparked the Montgomery bus boycott?', 'Rosa Parks', ['Martin Luther King Jr.', 'Malcolm X', 'Abraham Lincoln'], 'She refused to give up her seat.', 'Rosa Parks was arrested on 1 December 1955.'],
          ['Martin Luther King Jr. was inspired by…', 'Mahatma Gandhi\'s non-violence', ['Military coups', 'Armed revolution', 'Colonial rule'], 'He visited India in 1959.', 'King adopted Gandhian non-violent resistance.'],
          ['The "I have a dream" speech was given at…', 'The March on Washington, 1963', ['The Montgomery boycott, 1955', 'The UN in 1945', 'Belgrade in 1961'], 'A huge rally in the US capital.', 'King spoke there on 28 August 1963.'],
          ['Which law of 1965 protected African Americans\' right to vote?', 'Voting Rights Act', ['Civil Rights Act of 1964', 'Emergency Act', 'Forest Rights Act'], 'About voting.', 'The Voting Rights Act (1965) removed barriers to voting.'],
          ['The anti-war movement of the 1960s in the USA opposed the war in…', 'Vietnam', ['Korea', 'Kuwait', 'Afghanistan'], 'South-East Asia.', 'Protests grew against US involvement in Vietnam.'],
          ['Segregation means…', 'Forced separation of people by race', ['Equal treatment', 'Free elections', 'Joining an alliance'], 'Separate seats and schools.', 'Segregation kept races apart by law or custom.'],
        ]),
        timelineT('tl', 'Arrange these social-movement events in time order.', c20Events, ['The US civil rights movement came first.', 'The anti-arrack movement was in the 1990s.']),
        tapT('tap', 'Tap every method used by the US civil rights movement.', [
          ['Bus boycotts', true], ['Sit-ins at segregated restaurants', true], ['Peaceful marches', true], ['Court cases', true],
          ['Armed attacks on government offices', false], ['Military coups', false], ['Joining NATO', false],
        ], ['It was a non-violent movement.', 'Military methods were not used.'], 'Boycotts, sit-ins, marches and court cases were its non-violent methods.'),
      ],
    },
    {
      id: 'ts10.ss.movements.environment', title: 'Environmental movements: Bhopal, Narmada and Greenpeace', prereqs: ['ts10.ss.movements.civil'],
      intro: [
        h('When development poisons or drowns people\'s homes'),
        photo('🏞️', 'The Narmada valley: dams bring irrigation and power, but also displace villages and submerge forests.'),
        p('From the 1970s, people across the world began to ask who pays the price of development. Factories, mines and big dams brought growth, but also pollution, disasters and displacement. Ordinary people organised to protect their land, health and environment.'),
        h('Bhopal gas tragedy (1984)'),
        p('On the night of 2–3 December 1984, a poisonous gas, methyl isocyanate, leaked from the Union Carbide pesticide factory in Bhopal. Thousands of people died within days, and lakhs suffered long-term illness. Survivors and activists have fought for decades for fair compensation, medical care, clean-up of the site and accountability of the company. Bhopal made Indians aware of industrial safety and corporate responsibility; the Environment (Protection) Act was passed in 1986.'),
        h('Narmada Bachao Andolan'),
        p('Large dams were planned on the Narmada river, the biggest being the Sardar Sarovar dam in Gujarat. Supporters said they would bring drinking water, irrigation and electricity to dry regions. Villagers and Adivasis whose land would be submerged, led by activists like Medha Patkar and supported by Baba Amte, formed the Narmada Bachao Andolan ("Save Narmada Movement") in the late 1980s. They demanded proper rehabilitation and questioned whether giant dams were the best option. The issue reached the Supreme Court, which allowed construction with conditions on rehabilitation.'),
        h('Greenpeace'),
        p('Greenpeace began in 1971 when a small group sailed from Canada to protest against US nuclear tests in Alaska. It grew into a global organisation that campaigns, through peaceful direct action, against nuclear testing, whaling, pollution and climate change.'),
        def('Displacement', 'Being forced to leave one\'s home and land, for example because of a dam reservoir or a mine.'),
        def('Rehabilitation', 'Helping displaced people rebuild their lives with land, housing, livelihoods and services.'),
        keys('Bhopal (1984): industrial disaster; fight for justice and safety.', 'Narmada Bachao Andolan: displacement and rehabilitation by big dams.', 'Greenpeace (1971): global peaceful environmental campaigns.', 'Environmental movements ask: who pays the cost of development?'),
        remember('Bhopal gas tragedy: night of 2–3 December 1984, methyl isocyanate leak from the Union Carbide plant.'),
        tip('Give both sides for Narmada: benefits (water, power) vs costs (displacement, ecology).'),
      ],
      examples: [
        ex('Present two perspectives on the Sardar Sarovar dam.', ['Supporters: it brings drinking water and irrigation to drought-hit parts of Gujarat and Rajasthan, plus electricity.', 'Opponents: it submerges villages and forests, displacing many Adivasi and farming families who may not get fair rehabilitation.'], 'Benefits of water and power vs. costs of displacement'),
        ex('What lessons did the Bhopal disaster teach?', ['Factories handling dangerous chemicals need strict safety rules and inspections.', 'Companies must be held responsible for harm.', 'Victims need quick relief, medical care and compensation.'], 'Industrial safety, corporate accountability and justice for victims'),
      ],
      practice: [
        mcq('mcq', 'Recall the place, the issue and the people.', [
          ['The Bhopal gas tragedy happened in…', '1984', ['1971', '1992', '1975'], 'December of that year.', 'The leak occurred on the night of 2–3 December 1984.'],
          ['Which gas leaked at Bhopal?', 'Methyl isocyanate', ['Carbon dioxide', 'Oxygen', 'Chlorine from a swimming pool'], 'Used in pesticide production.', 'Methyl isocyanate leaked from the Union Carbide plant.'],
          ['Narmada Bachao Andolan is associated with…', 'Medha Patkar', ['Rosa Parks', 'N. T. Rama Rao', 'Jyoti Basu'], 'A social activist.', 'Medha Patkar was a leading figure of the movement.'],
          ['The main concern of the Narmada movement was…', 'Displacement and rehabilitation of people affected by dams', ['Racial segregation', 'Alcohol sales', 'Nuclear testing'], 'Submerged villages.', 'It focused on people displaced by dams.'],
          ['Greenpeace began in 1971 with a protest against…', 'Nuclear testing', ['Bus segregation', 'Arrack shops', 'Big dams in India'], 'A boat voyage to Alaska.', 'Its first action opposed US nuclear tests.'],
          ['Which law was passed in India in 1986 partly in response to Bhopal?', 'Environment (Protection) Act', ['Forest Rights Act', 'National Food Security Act', 'States Reorganisation Act'], 'About the environment.', 'The Environment (Protection) Act came in 1986.'],
        ]),
        matchT('match', 'movement to its issue', [
          ['Bhopal survivors\' movement', 'Justice after an industrial gas leak'], ['Narmada Bachao Andolan', 'Displacement by big dams'], ['Greenpeace', 'Global campaigns against nuclear tests and pollution'],
          ['Chipko movement', 'Saving trees from felling'], ['Civil rights movement', 'Ending racial segregation'], ['Anti-arrack movement', 'Stopping sale of liquor in villages'],
        ], ['Two are environmental in India: dams and trees.', 'Greenpeace is international.']),
        tapT('tap', 'Tap every TRUE statement about environmental movements.', [
          ['They question who bears the cost of development', true], ['They use peaceful protests, courts and media', true], ['They often involve affected local communities', true], ['Bhopal raised awareness of industrial safety', true],
          ['They always oppose all development', false], ['Greenpeace was founded in India in 1984', false], ['The Narmada movement was about segregation', false],
        ], ['They seek fair and safe development.', 'Greenpeace began in 1971 in Canada.'], 'Environmental movements raise costs of development peacefully with affected communities.'),
      ],
    },
    {
      id: 'ts10.ss.movements.women', title: 'Women\'s movements: Adavallu Ekamaite and Meira Paibi', prereqs: ['ts10.ss.movements.environment'],
      intro: [
        h('When women came together'),
        photo('👩', 'Rural women in Nellore district who learned to read in literacy classes went on to close the arrack shops in their villages.'),
        p('In the early 1990s, adult literacy classes were held in villages of Nellore district in Andhra Pradesh. One of the lessons told the story of a woman whose family suffered because her husband drank arrack (cheap country liquor). Women in the classes recognised their own lives in it: wages spent on drink, debts, violence at home.'),
        p('In 1992, women of Dubagunta village stopped the sale of arrack in their village. The idea spread from village to village: women blocked arrack vans, broke liquor pots and picketed shops, often facing threats. The movement — remembered in the phrase "Adavallu Ekamaite" (when women unite) — spread across the state. In October 1993, the government banned the sale of arrack in Andhra Pradesh.'),
        def('Arrack', 'A cheap country liquor that was sold widely in villages through government-auctioned shops.'),
        h('Meira Paibi (Manipur)'),
        p('In Manipur, women known as Meira Paibi ("women torch-bearers") began organising from the late 1970s. Carrying flaming torches, they patrolled their neighbourhoods at night to fight alcoholism and drug abuse. Later they also protested against human rights violations and demanded justice for victims of violence.'),
        stepsB(
          'Women share their problems in literacy classes or local groups.',
          'They recognise a common cause (liquor, drugs, violence).',
          'They act together: protests, picketing, night patrols.',
          'The movement spreads to other villages and gains public support.',
          'Government is pressed to change policy (e.g. arrack ban, 1993).',
        ),
        keys('Anti-arrack movement began in Dubagunta, Nellore (1992), linked to literacy classes.', 'It led to a ban on arrack sales in Andhra Pradesh (1993).', 'Meira Paibi: Manipur women\'s torch-bearer movement against alcohol, drugs and rights abuses.', 'Women\'s collective action changed policy and social attitudes.'),
        remember('Dubagunta (Nellore district) — starting point of the anti-arrack movement, 1992. Meira Paibi = "women torch-bearers" of Manipur.'),
        tip('Notice the link: education (literacy) → awareness → collective action → policy change.'),
      ],
      examples: [
        ex('How did adult literacy classes lead to the anti-arrack movement?', ['Literacy lessons discussed the harm of liquor in families.', 'Women realised their problems were shared.', 'They organised together to stop arrack sales, beginning in Dubagunta in 1992.'], 'Learning and discussion built awareness and solidarity, which became collective action'),
        ex('Compare the anti-arrack movement and Meira Paibi on one similarity and one difference.', ['Similarity: both were women-led and fought alcohol abuse that harmed families.', 'Difference: Meira Paibi used night torch patrols and later took up human rights issues; the anti-arrack movement focused on stopping liquor sales and won a state ban.'], 'Both women-led against alcohol; Meira Paibi widened to human rights'),
      ],
      practice: [
        mcq('mcq', 'Recall place, method and result.', [
          ['In which district did the anti-arrack movement begin?', 'Nellore', ['Warangal', 'Khammam', 'Adilabad'], 'Coastal Andhra.', 'It began in Dubagunta village, Nellore district.'],
          ['The anti-arrack movement grew out of…', 'Adult literacy classes', ['A film festival', 'A sports event', 'A factory strike'], 'Lessons about family life.', 'Literacy lessons sparked discussion and action.'],
          ['"Adavallu Ekamaite" means…', 'When women unite', ['Save the river', 'Quit India', 'Remove poverty'], 'A Telugu phrase.', 'It celebrates the power of women acting together.'],
          ['In which year was the sale of arrack banned in Andhra Pradesh?', '1993', ['1984', '1975', '2001'], 'A year after Dubagunta.', 'Arrack sales were banned in October 1993.'],
          ['Meira Paibi is a women\'s movement from…', 'Manipur', ['Kerala', 'Assam', 'Telangana'], 'North-east India.', 'Meira Paibi are the women torch-bearers of Manipur.'],
          ['Meira Paibi women are known for…', 'Night patrols with flaming torches', ['Bus boycotts', 'Building dams', 'Running ration shops'], 'Meira = torch.', 'They patrolled at night carrying torches.'],
        ]),
        orderT('order', 'Put the stages of the anti-arrack movement in order.', [
          'Women attend adult literacy classes', 'A lesson on liquor\'s harm sparks discussion', 'Women of Dubagunta stop arrack sales in their village', 'The movement spreads to other villages', 'Government bans arrack sales in 1993',
        ], ['Learning comes before action.', 'The ban was the result.'], 'Literacy → discussion → Dubagunta action → spread → ban.'),
        tapT('tap', 'Tap every TRUE statement about women\'s movements in this chapter.', [
          ['The anti-arrack movement began in Dubagunta', true], ['Meira Paibi used torch-lit night patrols', true], ['Both movements fought alcohol abuse', true], ['Women faced threats but continued', true],
          ['The anti-arrack movement began in Manipur', false], ['Meira Paibi was led by factory owners', false], ['The arrack ban came in 1984', false],
        ], ['Dubagunta is in Nellore.', 'The ban came in 1993.'], 'Both were women-led movements against alcohol abuse that faced opposition.'),
      ],
    },
    {
      id: 'ts10.ss.movements.features', title: 'Common features of social movements', prereqs: ['ts10.ss.movements.women'],
      intro: [
        h('What makes a social movement?'),
        photo('🗣️', 'Social movements grow when ordinary people speak up together about a shared problem.'),
        p('The civil rights movement, Narmada Bachao Andolan, the anti-arrack movement and Meira Paibi took place in different countries and decades. Yet they share a pattern. Seeing that pattern helps us understand how ordinary people change society.'),
        def('Social movement', 'Collective action by a large number of people, sustained over time, to bring about (or resist) a social or political change.'),
        stepsB(
          'A shared grievance: people face a common injustice (segregation, displacement, liquor, pollution).',
          'Awareness: they discuss, learn and realise the problem is shared, not personal.',
          'Organisation: groups form, leaders emerge, demands are framed.',
          'Action: peaceful protests, boycotts, petitions, court cases, media campaigns.',
          'Response: governments or companies change laws or policies — or the movement continues.',
        ),
        p('Most such movements work outside political parties, though they may influence them. They often draw people who are otherwise powerless — the poor, women, minorities, Adivasis. Most rely on non-violent methods and public opinion. Not all succeed fully, but even partial success can change laws and attitudes.'),
        keys('Movements arise from shared grievances.', 'They involve large numbers acting together over time.', 'They usually work outside party politics and use non-violent methods.', 'They aim to change laws, policies or social practices.'),
        remember('Key features: collective action, common issue, mass participation, non-violent methods, aim of social or political change.'),
        tip('In answers, give a feature and illustrate it with an example from any movement in the chapter.'),
      ],
      examples: [
        ex('Show how the anti-arrack movement fits the general pattern of social movements.', ['Grievance: liquor ruining families.', 'Awareness: literacy classes.', 'Organisation: village women\'s groups.', 'Action: picketing shops, stopping vans.', 'Response: arrack ban in 1993.'], 'It moved from a shared grievance to awareness, organisation, action and policy change'),
        ex('How is a social movement different from a political party?', ['A party contests elections to form a government.', 'A movement usually focuses on one issue and works through protest and pressure.', 'Movements may influence parties but do not aim to rule.'], 'Movements seek change on issues through pressure; parties seek power through elections'),
      ],
      practice: [
        orderT('order', 'Put the general stages of a social movement in order.', [
          'People face a shared grievance', 'They become aware it is a common problem', 'They organise and choose leaders', 'They take collective action', 'Authorities respond with change',
        ], ['Awareness must come before organisation.', 'Change is the result, not the start.'], 'Grievance → awareness → organisation → action → response.'),
        tapT('tap', 'Tap every common feature of social movements.', [
          ['Collective action by many people', true], ['Focus on a shared issue', true], ['Mostly non-violent methods', true], ['Aim to change laws or practices', true],
          ['Must win elections to succeed', false], ['Are always led by the government', false], ['Involve only one person', false],
        ], ['Movements are not parties.', 'They are bottom-up, not government-led.'], 'Collective action, a shared issue, non-violence and an aim of change mark social movements.'),
        mcq('mcq', 'Think about the pattern behind all the movements.', [
          ['A social movement is best described as…', 'Sustained collective action for social or political change', ['A single protest by one person', 'A government department', 'A company\'s advertising'], 'Many people, over time.', 'Movements involve many people acting together over time.'],
          ['Which method is typical of most social movements studied?', 'Non-violent protest', ['Armed rebellion', 'Military coup', 'Secret elections'], 'Inspired by Gandhi.', 'Most relied on peaceful methods.'],
          ['How do social movements usually differ from political parties?', 'They focus on issues rather than contesting elections to rule', ['They always form governments', 'They never involve ordinary people', 'They are banned in democracies'], 'Pressure vs power.', 'Movements seek change through pressure, not by ruling.'],
          ['Which group often participates in social movements?', 'People who otherwise have little power', ['Only rich industrialists', 'Only foreign governments', 'Only soldiers'], 'Women, poor, Adivasis.', 'Movements give voice to the marginalised.'],
          ['What often triggers a social movement?', 'A shared grievance or injustice', ['A holiday', 'A cricket match', 'A new film release'], 'A common problem.', 'Shared injustice is the starting point.'],
          ['Which outcome shows a movement\'s success?', 'A change in law or policy', ['More arrests of protesters', 'Silence in the media', 'People giving up'], 'Think arrack ban or Civil Rights Act.', 'Policy or legal change shows success.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 21 — The Movement for the Formation of Telangana State
// =====================================================================================
const c21Events: [number, string, string][] = [
  [1948.09, 'Operation Polo; Hyderabad State joins the Indian Union', 'September 1948'],
  [1952.09, 'Mulki agitation in Hyderabad State', '1952'],
  [1955.09, 'States Reorganisation Commission report on Hyderabad/Telangana', '1955'],
  [1956.02, 'Gentlemen\'s Agreement signed', '20 February 1956'],
  [1956.11, 'Andhra Pradesh formed with Hyderabad as capital', '1 November 1956'],
  [1969.01, 'Telangana agitation of 1969 begins', 'January 1969'],
  [1973.09, 'Six-Point Formula announced', 'September 1973'],
  [2001.04, 'Telangana Rashtra Samithi formed', '27 April 2001'],
  [2009.12, 'Centre announces process for forming Telangana', '9 December 2009'],
  [2010.12, 'Srikrishna Committee submits its report', '30 December 2010'],
  [2011.03, 'Million March at Tank Bund, Hyderabad', '10 March 2011'],
  [2011.09, 'Sakala Janula Samme (general strike) begins', 'September 2011'],
  [2014.02, 'Parliament passes the Andhra Pradesh Reorganisation Bill', 'February 2014'],
  [2014.06, 'Telangana State formed', '2 June 2014'],
];

const ch21: USpec = {
  id: 'ts10.ss.ch21', subject: 'social', title: 'The Movement for the Formation of Telangana State', source: src(21),
  objectives: [
    {
      id: 'ts10.ss.telangana.merger', title: 'Hyderabad State joins India (1948)', prereqs: [],
      intro: [
        h('A state that did not join India on 15 August 1947'),
        photo('🗺️', 'Hyderabad State under the Nizam included today\'s Telangana and parts of present-day Maharashtra and Karnataka.'),
        p('When India became independent on 15 August 1947, more than 500 princely states had to decide whether to join India or Pakistan. Hyderabad, the largest, was ruled by the Nizam, Mir Osman Ali Khan. Its territory included the Telugu-speaking Telangana region, Marathi-speaking Marathwada and Kannada-speaking districts. The Nizam wished to stay independent.'),
        def('Princely state', 'A state ruled by a hereditary ruler under British paramountcy, not directly by the British.'),
        def('Standstill Agreement', 'An agreement (November 1947) between India and the Nizam to continue existing arrangements for a year while talks went on.'),
        p('Inside the state there was turmoil. In the countryside, peasants rose against oppressive landlords (deshmukhs and jagirdars) and forced labour (vetti) in the Telangana armed peasant struggle (1946–51), led by communists through the Andhra Mahasabha. Leaders such as Chakali Ailamma, who defended her land against a deshmukh, became symbols of resistance. At the same time, the Razakars, an armed militia led by Qasim Razvi, used violence against people who supported joining India. People of all communities suffered.'),
        stepsB(
          '15 August 1947: India independent; the Nizam does not accede.',
          'November 1947: Standstill Agreement with India.',
          '1947–48: Razakar violence and the peasant struggle; talks fail.',
          '13 September 1948: the Indian Army begins "Operation Polo" (also called the Police Action).',
          '17 September 1948: the Nizam announces surrender; Hyderabad joins the Indian Union.',
          '1948–49: military administration under Major General J. N. Chaudhuri; 1950: civil administration.',
          '1952: first elected government of Hyderabad State, led by Burgula Ramakrishna Rao.',
        ),
        p('17 September is observed every year in Telangana. Different groups have called it by different names — liberation, merger or integration — reflecting different memories of that time.'),
        keys('The Nizam of Hyderabad did not join India in 1947.', 'Peasant struggle against landlords and Razakar violence marked 1946–48.', 'Operation Polo (13–17 September 1948) brought Hyderabad into India.', 'First elected government of Hyderabad State: 1952 (Burgula Ramakrishna Rao).'),
        remember('Hyderabad joined the Indian Union on 17 September 1948 after Operation Polo.'),
        tip('Keep three strands separate: the Nizam\'s government, the Razakars, and the peasant struggle.'),
      ],
      examples: [
        ex('Why did the Government of India launch Operation Polo in September 1948?', ['The Nizam refused to join India even after the Standstill Agreement.', 'Razakar violence was causing fear and loss of life.', 'Hyderabad lay in the heart of India; an independent state there was seen as a threat to unity and order.'], 'To end the deadlock with the Nizam, stop Razakar violence and integrate Hyderabad'),
        ex('What were the main demands of the Telangana peasant struggle?', ['End to forced labour (vetti).', 'Land for tillers and an end to illegal seizures by landlords.', 'Fair wages and relief from heavy rents and debts.'], 'Freedom from vetti, land to the tiller and fair treatment'),
      ],
      practice: [
        mcq('mcq', 'Recall the ruler, the militia and the dates.', [
          ['Who ruled Hyderabad State in 1947?', 'Mir Osman Ali Khan, the Nizam', ['Qasim Razvi', 'Burgula Ramakrishna Rao', 'J. N. Chaudhuri'], 'The seventh Nizam.', 'Mir Osman Ali Khan was the Nizam.'],
          ['Hyderabad joined the Indian Union on…', '17 September 1948', ['15 August 1947', '26 January 1950', '1 November 1956'], 'After Operation Polo.', 'The Nizam announced surrender on 17 September 1948.'],
          ['The armed militia led by Qasim Razvi was called the…', 'Razakars', ['Meira Paibi', 'IPKF', 'Andhra Mahasabha'], 'They opposed joining India.', 'The Razakars were led by Qasim Razvi.'],
          ['Forced unpaid labour in the Nizam\'s villages was called…', 'Vetti', ['Barga', 'Mulki', 'Jagir'], 'The peasant struggle opposed it.', 'Vetti was forced labour demanded by landlords.'],
          ['Who led the first elected government of Hyderabad State (1952)?', 'Burgula Ramakrishna Rao', ['M. Chenna Reddy', 'N. Sanjiva Reddy', 'K. Chandrashekar Rao'], 'He later signed the Gentlemen\'s Agreement.', 'Burgula Ramakrishna Rao became Chief Minister in 1952.'],
          ['Operation Polo began on…', '13 September 1948', ['15 August 1947', '17 September 1949', '2 June 2014'], 'It lasted a few days.', 'It began on 13 September and ended on 17 September 1948.'],
        ]),
        orderT('order', 'Put these events of 1947–52 in order.', [
          'India becomes independent; the Nizam does not accede', 'Standstill Agreement signed', 'Operation Polo begins', 'Hyderabad joins the Indian Union', 'First elected government of Hyderabad State',
        ], ['Independence comes first.', 'Elections came in 1952.'], 'Aug 1947 → Nov 1947 → 13 Sept 1948 → 17 Sept 1948 → 1952.'),
        matchT('match', 'person or group to their role', [
          ['Mir Osman Ali Khan', 'Nizam of Hyderabad'], ['Qasim Razvi', 'Leader of the Razakars'], ['J. N. Chaudhuri', 'Military Governor after 1948'],
          ['Burgula Ramakrishna Rao', 'First elected Chief Minister of Hyderabad State'], ['Chakali Ailamma', 'Symbol of peasant resistance'], ['Andhra Mahasabha', 'Organised the peasant struggle'],
        ], ['Start with the ruler and the militia leader.', 'Chaudhuri was an army officer.']),
      ],
    },
    {
      id: 'ts10.ss.telangana.ap1956', title: 'Formation of Andhra Pradesh and the Gentlemen\'s Agreement (1956)', prereqs: ['ts10.ss.telangana.merger'],
      intro: [
        h('Two Telugu regions come together — with conditions'),
        photo('📜', 'The Gentlemen\'s Agreement of 1956 set out safeguards for the Telangana region within the new Andhra Pradesh.'),
        p('After Andhra State was formed in 1953, there was a demand for "Vishalandhra" — one state for all Telugu speakers. Many in Telangana were hesitant. Telangana had different administrative traditions, used Urdu in government, had lower literacy and educational opportunities, and people feared that better-educated people from Andhra would take jobs and resources.'),
        def('Mulki rules', 'Rules in Hyderabad State that reserved government jobs for local residents (mulkis) — people born or long settled in the state.'),
        p('In 1952, students and others agitated in Hyderabad State against the appointment of non-mulkis to local jobs; there was police firing in Hyderabad city. The States Reorganisation Commission (1955) noted these concerns and suggested that Telangana could remain a separate state for the time being, and merge with Andhra later if its legislature agreed by a two-thirds majority after the 1961 elections. Political leaders, however, decided on an earlier merger with safeguards.'),
        def('Gentlemen\'s Agreement', 'An agreement signed on 20 February 1956 by leaders of Andhra and Telangana that set safeguards for Telangana in the proposed state of Andhra Pradesh.'),
        stepsB(
          'A Regional Council for Telangana to look after its development.',
          'Telangana\'s surplus revenue to be spent on Telangana\'s development.',
          'Jobs in Telangana reserved for people with 12 years of residence (domicile).',
          'Educational facilities in Telangana reserved for Telangana students.',
          'If the Chief Minister is from Andhra, the Deputy Chief Minister to be from Telangana (and vice versa).',
          'Urdu to continue in administration and courts for some time.',
        ),
        p('On 1 November 1956, Andhra Pradesh was formed by merging the Telangana region of Hyderabad State with Andhra State. Hyderabad became the capital. Over the following years, many in Telangana felt that the safeguards were not properly implemented — this feeling became a root of later movements.'),
        keys('Vishalandhra: demand for one state of all Telugu speakers.', 'Telangana feared loss of jobs, funds and education opportunities.', 'Gentlemen\'s Agreement (20 February 1956) promised safeguards.', 'Andhra Pradesh formed on 1 November 1956 with Hyderabad as capital.'),
        remember('Gentlemen\'s Agreement: 20 February 1956. Andhra Pradesh formed: 1 November 1956.'),
        tip('The safeguards (jobs, funds, education, regional council) explain the grievances of 1969 and later.'),
      ],
      examples: [
        ex('Why did many people in Telangana have reservations about merging with Andhra State?', ['Educational levels in Telangana were lower, so people feared losing jobs to others.', 'They worried that Telangana\'s revenue would be spent elsewhere.', 'The two regions had different administrative and cultural traditions.'], 'Fears about jobs, funds and differences in administration and education'),
        ex('Link the Gentlemen\'s Agreement to later Telangana agitations.', ['The agreement promised safeguards on jobs, funds and education.', 'Many in Telangana felt these were not honoured over time.', 'This sense of unfulfilled promises fed the 1969 agitation and later movements.'], 'Perceived violation of the safeguards became a central grievance'),
      ],
      practice: [
        mcq('mcq', 'Recall dates and safeguards.', [
          ['The Gentlemen\'s Agreement was signed in…', '1956', ['1948', '1953', '1969'], 'The same year Andhra Pradesh was formed.', 'It was signed on 20 February 1956.'],
          ['Andhra Pradesh was formed on…', '1 November 1956', ['1 October 1953', '17 September 1948', '2 June 2014'], 'With the States Reorganisation Act.', 'Andhra Pradesh was formed on 1 November 1956.'],
          ['Mulki rules were about…', 'Reserving jobs for local residents', ['Land ceilings', 'Selling liquor', 'Voting age'], 'Mulki = local.', 'Mulki rules reserved jobs for locals of Hyderabad State.'],
          ['"Vishalandhra" meant…', 'One state for all Telugu speakers', ['A separate Telangana state', 'A union territory', 'A new capital in Kurnool'], 'Vishala = large.', 'It was the demand for a greater Telugu state.'],
          ['Which was a safeguard in the Gentlemen\'s Agreement?', 'A Regional Council for Telangana', ['Abolishing Urdu immediately', 'Moving the capital to Kurnool', 'Ending all reservations'], 'A body to oversee Telangana\'s development.', 'A Telangana Regional Council was one of the safeguards.'],
          ['The capital of Andhra Pradesh formed in 1956 was…', 'Hyderabad', ['Kurnool', 'Vijayawada', 'Warangal'], 'The old capital of the Nizam.', 'Hyderabad became the capital in 1956.'],
        ]),
        tapT('tap', 'Tap every safeguard promised in the Gentlemen\'s Agreement.', [
          ['A Regional Council for Telangana', true], ['Telangana\'s surplus revenue spent on Telangana', true], ['Jobs reserved for those with 12 years\' residence', true], ['Education facilities reserved for Telangana students', true],
          ['A separate High Court in Kurnool', false], ['Abolition of the Legislative Assembly', false], ['Telangana to become a union territory', false],
        ], ['Safeguards were about funds, jobs, education and a council.', 'Nothing about union territories.'], 'The safeguards covered a regional council, funds, jobs and education.'),
        timelineT('tl', 'Arrange these events in time order.', c21Events, ['1948 comes first.', 'Telangana was formed in 2014.']),
      ],
    },
    {
      id: 'ts10.ss.telangana.1969', title: 'The 1969 agitation and the 1990s revival', prereqs: ['ts10.ss.telangana.ap1956'],
      intro: [
        h('Students take to the streets'),
        photo('🏫', 'Students of Osmania University and other colleges were at the heart of the 1969 agitation.'),
        p('By the late 1960s, many people in Telangana felt that the promises of 1956 had not been kept. They complained that jobs in Telangana went to non-locals in violation of Mulki rules, that Telangana\'s surplus funds were spent elsewhere, and that irrigation and education in the region lagged behind.'),
        stepsB(
          'January 1969: protests begin over jobs and safeguards; students lead strikes and rallies.',
          'The Telangana Praja Samithi (TPS) is formed; M. Chenna Reddy becomes its leader.',
          'The agitation spreads; there are clashes and police firings, and many people, mostly young, lose their lives.',
          'The central government announces plans and safeguards (such as an Eight-Point Plan) to address grievances.',
          '1971: the TPS wins most Lok Sabha seats in Telangana, then merges with the Congress.',
          '1972–73: after a Supreme Court ruling upheld Mulki rules, a "Jai Andhra" movement arises in the Andhra region demanding a separate Andhra.',
          'September 1973: the Six-Point Formula ends Mulki rules and introduces zonal reservation in jobs and education; Article 371D is added to the Constitution.',
        ),
        def('Six-Point Formula (1973)', 'An agreement to ensure balanced development of the regions of Andhra Pradesh, with local reservation in education and government jobs through zones, backed by Article 371D.'),
        h('The 1990s: the demand returns'),
        p('In the 1990s, the demand for a separate state was revived by intellectuals, writers, students, employees and cultural groups. Professor K. Jayashankar, often called the ideologue of the movement, wrote and spoke widely about regional inequality. Issues included the share of Godavari and Krishna waters for Telangana\'s dry lands, drought and farmer distress, jobs for local youth, and respect for Telangana\'s language, history and culture. Songs, poems and Dhoom-Dham cultural programmes spread the message to villages.'),
        keys('1969: student-led agitation over jobs, funds and safeguards; TPS led by M. Chenna Reddy.', '1973: Six-Point Formula and Article 371D (zonal reservation).', '1990s: demand revived by intellectuals, students and cultural groups.', 'Key issues: water, jobs, funds, development, cultural identity.'),
        remember('Telangana Praja Samithi (1969) — M. Chenna Reddy. Six-Point Formula — 1973; Article 371D.'),
        tip('In answers, always give the grievance (why) before the event (what happened).'),
      ],
      examples: [
        ex('List three grievances behind the 1969 agitation.', ['Jobs: appointments of non-locals despite Mulki rules.', 'Funds: Telangana\'s surplus revenue said to be spent outside the region.', 'Development: irrigation and education in Telangana lagging behind.'], 'Jobs, funds and unequal development'),
        ex('How did the movement of the 1990s spread its ideas?', ['Intellectuals like Professor K. Jayashankar wrote and spoke on regional inequality.', 'Students and employees held meetings and protests.', 'Writers, singers and Dhoom-Dham troupes took songs and stories to villages.'], 'Through writings, meetings and cultural performances'),
      ],
      practice: [
        mcq('mcq', 'Recall leaders and agreements.', [
          ['Who led the Telangana Praja Samithi in 1969?', 'M. Chenna Reddy', ['K. Chandrashekar Rao', 'N. T. Rama Rao', 'Burgula Ramakrishna Rao'], 'He later became Chief Minister of AP.', 'M. Chenna Reddy led the TPS.'],
          ['The 1969 agitation was led mainly by…', 'Students and employees', ['Foreign companies', 'The army', 'Film stars'], 'Osmania University.', 'Students and employees were at the forefront.'],
          ['The Six-Point Formula was announced in…', '1973', ['1956', '1969', '2001'], 'After the Jai Andhra movement.', 'It was announced in September 1973.'],
          ['Which Article provides for regional reservation in jobs and education in Andhra Pradesh (and now Telangana)?', 'Article 371D', ['Article 352', 'Article 324', 'Article 370'], 'Added in the 1970s.', 'Article 371D came with the Six-Point Formula.'],
          ['Who is often called the ideologue of the Telangana movement?', 'Professor K. Jayashankar', ['Medha Patkar', 'Qasim Razvi', 'Sukumar Sen'], 'An economist-teacher.', 'Prof. K. Jayashankar wrote and spoke for decades about Telangana.'],
          ['Which was a major issue of the 1990s demand?', 'Fair share of Godavari and Krishna waters for Telangana', ['Bus segregation', 'Nuclear testing', 'Bank nationalisation'], 'Irrigation for dry lands.', 'Water for irrigation was a central concern.'],
        ]),
        orderT('order', 'Put these events in time order.', [
          'Gentlemen\'s Agreement', '1969 agitation begins', 'TPS wins most Telangana Lok Sabha seats', 'Six-Point Formula', 'Demand revived in the 1990s',
        ], ['1956 comes first.', 'The 1990s are the latest.'], '1956 → 1969 → 1971 → 1973 → 1990s.'),
        tapT('tap', 'Tap every grievance raised in the 1969 agitation.', [
          ['Jobs given to non-locals despite Mulki rules', true], ['Telangana funds spent elsewhere', true], ['Lag in irrigation and education', true], ['Safeguards of 1956 not honoured', true],
          ['Bus segregation', false], ['The Bhopal gas leak', false], ['Arrack sales', false],
        ], ['Think jobs, funds, development.', 'The other options belong to other chapters.'], 'Jobs, funds, development lag and unkept safeguards were the main grievances.'),
      ],
    },
    {
      id: 'ts10.ss.telangana.formation', title: 'The movement of 2001–2014 and the formation of Telangana', prereqs: ['ts10.ss.telangana.1969'],
      intro: [
        h('2 June 2014: a new state is born'),
        photo('🎉', 'Celebrations across Telangana on 2 June 2014, when Telangana became a state — then India\'s 29th.'),
        p('The final phase of the movement began in 2001 and lasted more than a decade. It brought together political parties, students, employees, lawyers, teachers, farmers, artists and ordinary citizens through peaceful mass action.'),
        def('Telangana Rashtra Samithi (TRS)', 'A political party founded on 27 April 2001 by K. Chandrashekar Rao (KCR) with the goal of a separate Telangana state. (It was renamed Bharat Rashtra Samithi in 2022.)'),
        def('Joint Action Committee (JAC)', 'A coalition of political parties, employees, students and civil-society groups formed in 2009 to coordinate the movement; Professor M. Kodandaram was its convenor.'),
        stepsB(
          '27 April 2001: TRS formed by K. Chandrashekar Rao.',
          'November–December 2009: KCR\'s fast; widespread protests.',
          '9 December 2009: the Union government announces that the process of forming Telangana will begin; after protests in other regions, it is put on hold later that month.',
          'February 2010: Srikrishna Committee set up to study the issue; it reports on 30 December 2010 with several options.',
          '10 March 2011: Million March at Tank Bund, Hyderabad.',
          'September–October 2011: Sakala Janula Samme — a general strike by employees, workers, teachers and others lasting about 42 days.',
          'July–October 2013: the ruling coalition and the Union Cabinet decide to form Telangana.',
          'February 2014: Parliament passes the Andhra Pradesh Reorganisation Bill; it becomes an Act in March 2014.',
          '2 June 2014: Telangana State is formed; K. Chandrashekar Rao becomes its first Chief Minister.',
        ),
        p('Many young people lost their lives during the movement, which caused great grief across the region. Meanwhile, in coastal Andhra and Rayalaseema, many people held "Samaikyandhra" (united Andhra) protests, especially in 2013, because they wanted the state to remain united and worried about Hyderabad, water sharing and jobs. The Reorganisation Act tried to address such concerns: Hyderabad was made the common capital of both states for up to ten years (until 2 June 2024), and rules were laid down for dividing assets, employees and river waters.'),
        keys('TRS (2001) led the political demand; JAC (2009) united many groups.', 'Key mass actions: Million March (2011), Sakala Janula Samme (2011).', 'Srikrishna Committee (2010) studied the issue.', 'AP Reorganisation Act 2014 → Telangana formed on 2 June 2014.'),
        remember('Telangana formation day: 2 June 2014 (then the 29th state of India). Hyderabad was the common capital for up to 10 years.'),
        tip('Present the movement with facts and with the concerns of both regions — that is what a balanced answer looks like.'),
      ],
      examples: [
        ex('Arrange the main events of 2009–2014 and explain the significance of 9 December 2009.', ['9 Dec 2009: the Centre announced it would start forming Telangana — a major milestone, though put on hold soon after.', '2010: Srikrishna Committee report.', '2011: Million March and Sakala Janula Samme.', '2013: decision to form the state.', 'Feb–Mar 2014: Reorganisation Act; 2 June 2014: Telangana formed.'], '9 December 2009 was the first official announcement; the state was formed on 2 June 2014'),
        ex('Why did people in coastal Andhra and Rayalaseema hold Samaikyandhra protests?', ['They wanted Andhra Pradesh to remain one state.', 'They were concerned about losing Hyderabad, a major centre of jobs and investment.', 'They worried about sharing river waters and the position of employees.'], 'Concerns about Hyderabad, water, jobs and keeping the state united'),
      ],
      practice: [
        mcq('mcq', 'Recall dates, people and actions of 2001–2014.', [
          ['Telangana State was formed on…', '2 June 2014', ['1 November 1956', '17 September 1948', '9 December 2009'], 'Celebrated as Telangana Formation Day.', 'Telangana became a state on 2 June 2014.'],
          ['The Telangana Rashtra Samithi was founded in…', '2001', ['1969', '1982', '2009'], 'On 27 April.', 'K. Chandrashekar Rao founded the TRS on 27 April 2001.'],
          ['Who was the first Chief Minister of Telangana?', 'K. Chandrashekar Rao', ['M. Chenna Reddy', 'Prof. K. Jayashankar', 'Prof. M. Kodandaram'], 'Founder of the TRS.', 'KCR became the first Chief Minister in June 2014.'],
          ['The committee set up in 2010 to study the Telangana issue was headed by…', 'Justice B. N. Srikrishna', ['Fazl Ali', 'B. P. Mandal', 'J. C. Shah'], 'It reported on 30 December 2010.', 'The Srikrishna Committee examined the issue.'],
          ['"Sakala Janula Samme" was…', 'A general strike by all sections of people in 2011', ['A film festival', 'A peace treaty', 'An election in 1952'], 'Sakala janulu = all people.', 'It was a strike of about 42 days in 2011.'],
          ['For how many years was Hyderabad the common capital of Telangana and Andhra Pradesh?', 'Up to 10 years', ['5 years', '20 years', 'Permanently'], 'Until 2 June 2024.', 'The Act made Hyderabad the common capital for up to ten years.'],
        ]),
        timelineT('tl', 'Arrange these events of the Telangana movement in time order.', c21Events, ['Start with 1948.', 'The 2009 announcement came before the Million March.'], 5, 3),
        matchT('match', 'person or event to its description', [
          ['K. Chandrashekar Rao', 'Founded TRS in 2001; first CM of Telangana'], ['Prof. M. Kodandaram', 'Convenor of the Joint Action Committee'], ['Prof. K. Jayashankar', 'Ideologue of the movement'],
          ['Million March', 'Mass gathering at Tank Bund, March 2011'], ['Sakala Janula Samme', 'General strike of 2011'], ['Srikrishna Committee', 'Studied the issue and reported in 2010'],
        ], ['Two professors: one convenor, one ideologue.', 'The march was in Hyderabad.']),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18, ch19, ch20, ch21];
