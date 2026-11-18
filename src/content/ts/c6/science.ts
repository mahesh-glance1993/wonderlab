// Telangana SCERT Class 6 — General Science (16 chapters). Original teaching written for WonderLab, aligned to the
// official chapter and topic list (src/content/ts/syllabus.json → classes["6"].subjects["science"], books.ts).
// The app groups physics / chemistry / biology units together as "Science" for Class 6.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, explore, stepsB, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec, type OSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(6, 'science', n);
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Take the left items one at a time and start with the pair you are surest of.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

/** Each entry: [prompt, steps in the right order, why]. */
const orderT = (key: string, seqs: [string, string[], string][], hints: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [prompt, steps, why] = r.pick(seqs);
  return {
    type: 'order', prompt, ...ordering(r, steps), hints,
    mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
    solution: [...steps.map((s, i) => `${i + 1}. ${s}`), why],
  };
}, d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option on its own. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join(', ')}.`, why],
  };
}, d);

/** Sort items into one of two groups, asked one at a time ("Is X a … or a …?"). [item, group A?] */
const sortT = (key: string, a: string, b: string, pool: [string, boolean][], hints: string[], rule: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [it, isA] = r.pick(pool);
  const right = isA ? a : b, wrong = isA ? b : a;
  return {
    type: 'mcq', prompt: `${it}: is it ${a} or ${b}?`, ...choose(r, right, [wrong]), hints,
    mistakes: [{ when: 'wrong', explain: `Not quite. ${rule}` }],
    solution: [`${it} → ${right}.`, rule],
  };
}, d);

/** Typed numeric item, optionally with a unit. */
const numQ = (prompt: string, ans: number, unit: string | undefined, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, true) : approx(ans, rel),
  hints, solution,
  mistakes: [
    ...(unit ? [{ when: 'missing-unit', explain: `Add the unit (${unit}). A number alone does not say what was measured.` }, { when: 'wrong-unit', explain: `That unit measures something else. Give the answer in ${unit}.` }] : []),
    ...mistakes,
    { when: 'wrong-value', explain: 'Check your working step by step against the hints.' },
  ],
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

// =====================================================================================
// Chapter 1 — Our Food
// =====================================================================================
const food1: OSpec = {
  id: 'ts6.sc.food.sources', title: 'Food ingredients and where they come from', prereqs: [],
  intro: [
    h('What is in your plate?'),
    photo('🍅', 'A plate of rice, pappu (dal), a vegetable curry and a glass of buttermilk — a common Telangana lunch.'),
    p('Think about your lunch today. Rice, dal, a curry, maybe some pickle and curd. Each dish is made from several things mixed together. These things are called ingredients.'),
    def('Ingredient', 'One of the things that are put together to make a dish. Dal is made from the ingredients pulses (kandi pappu), water, salt, turmeric, chilli and oil.'),
    p('If we follow each ingredient back to where it came from, we always reach either a PLANT or an ANIMAL. Rice, wheat, jowar, vegetables, fruits, pulses, oil seeds and spices come from plants. Milk, curd, ghee, eggs, meat, fish and honey come from animals.'),
    h('Which part of the plant?'),
    p('We eat different parts of different plants: roots (carrot, radish, beetroot), stems (potato, ginger, sugarcane), leaves (spinach, gongura, cabbage, curry leaves), flowers (cauliflower, banana flower), fruits (mango, tomato, brinjal, bhindi) and seeds (rice, wheat, groundnut, pulses).'),
    stepsB('Pick a dish, for example upma.', 'List its ingredients: rava, onion, green chilli, oil, mustard seeds, salt, water.', 'For each ingredient ask: plant or animal? Which part?', 'Rava comes from wheat seeds; onion is a stem bulb; chilli is a fruit; oil comes from seeds.'),
    keys('A dish is made of ingredients.', 'Every ingredient comes from plants or animals (salt and water are the only common exceptions — they come from nature, not from living things).', 'We eat roots, stems, leaves, flowers, fruits and seeds of plants.'),
    remember('Honey is made by honeybees from the nectar of flowers, so it is an animal product.'),
    tip('Potato grows under the ground but it is a STEM, not a root — it has "eyes" (buds) from which new shoots grow.'),
  ],
  examples: [
    ex('List the ingredients of a cup of tea and say where each comes from.', ['Tea leaves — leaves of the tea plant.', 'Milk — from a cow or buffalo (animal).', 'Sugar — from the stem of sugarcane (plant).', 'Water — from nature, not a living source.'], 'Tea leaves (plant leaf), milk (animal), sugar (plant stem), water (nature)'),
    ex('Meena says, "Carrot and potato are both roots because they grow in the soil." Is she right?', ['Carrot is a swollen root that stores food.', 'Potato has eyes (buds) that grow into new shoots — that is a stem feature.', 'So growing under the soil does not make something a root.'], 'No. Carrot is a root but potato is an underground stem.'),
  ],
  practice: [
    mcq('source', 'Ask: does it come from a plant, an animal or neither?', [
      ['Which of these ingredients comes from an animal?', 'Ghee', ['Groundnut oil', 'Jaggery', 'Rice flour'], 'Ghee is made from butter.', 'Ghee is made from milk butter, so it comes from animals.'],
      ['Which ingredient comes from a plant?', 'Tamarind', ['Egg', 'Curd', 'Honey'], 'It grows as a brown pod on a big tree.', 'Tamarind is the fruit of the tamarind tree.'],
      ['Which part of the plant is spinach (palakura)?', 'Leaf', ['Root', 'Seed', 'Flower'], 'You cook its green flat parts.', 'We eat the leaves of spinach.'],
      ['Which part of the sugarcane plant gives us sugar?', 'Stem', ['Root', 'Leaf', 'Flower'], 'Farmers cut and crush the tall jointed part.', 'Sugarcane juice is squeezed from its thick stem.'],
      ['Cauliflower is which part of the plant?', 'Flower', ['Leaf', 'Root', 'Stem only'], 'Its name gives a clue.', 'The white head of the cauliflower is a cluster of flower buds.'],
      ['Groundnuts, rice and pulses are all…', 'Seeds', ['Roots', 'Leaves', 'Flowers'], 'If you sow them, new plants grow.', 'These are seeds; they store food for the baby plant.'],
      ['Which of these does NOT come from a living thing?', 'Salt', ['Milk', 'Wheat', 'Honey'], 'It is obtained from sea water or rocks.', 'Salt comes from sea water or rocks, not from a plant or animal.'],
    ]),
    matchT('part', 'food to the plant part we eat', [
      ['Carrot', 'Root'], ['Ginger', 'Stem'], ['Gongura', 'Leaf'], ['Banana flower', 'Flower'], ['Tomato', 'Fruit'], ['Wheat', 'Seed'], ['Radish', 'Root'], ['Potato', 'Stem'],
    ], ['Underground does not always mean root.', 'Seeds can be sown; fruits hold seeds.'], 4),
    tapT('animal', 'Tap every food that comes from ANIMALS.', [
      ['Milk', true], ['Egg', true], ['Honey', true], ['Fish', true], ['Curd', true], ['Ghee', true],
      ['Jowar roti', false], ['Brinjal', false], ['Mango', false], ['Groundnut oil', false], ['Jaggery', false],
    ], ['Follow each food back to its source.', 'Curd and ghee are made from milk.'], 'Milk and things made from milk, eggs, honey, fish and meat come from animals; grains, vegetables, fruits, oil and jaggery come from plants.', 6),
  ],
};

const food2: OSpec = {
  id: 'ts6.sc.food.habits', title: 'Food habits — what we eat and why', prereqs: ['ts6.sc.food.sources'],
  intro: [
    h('Different places, different plates'),
    photo('🌾', 'Jowar and rice fields in Telangana. What grows nearby is what people usually eat.'),
    p('In many Telangana homes, jowar roti (jonna rotte), rice, pappu, pachadi and sambar are common. In Punjab people eat more wheat rotis; in Kerala, rice and coconut; near the coast, more fish. The food a family usually eats is called its food habit.'),
    def('Food habit', 'The kind of food a person or a community usually eats, and how and when they eat it.'),
    p('Food habits depend on: what crops grow in the area (climate and soil), the season, festivals and customs, family traditions and what people can afford. During Bathukamma and Sankranti, special dishes like sakinalu, ariselu and malidalu are made.'),
    h('Healthy habits'),
    p('Whatever we eat, a good food habit means eating different kinds of food every day (grains, pulses, vegetables, fruits, milk or eggs), eating on time, not wasting food and washing hands before eating. Too much fried food, sweets or packed snacks is a poor habit.'),
    keys('Food habits differ from place to place.', 'They depend on crops, climate, season, festivals and customs.', 'Good habits: varied food, on time, clean hands, no waste.'),
    remember('People who eat only plant food are vegetarians; people who also eat meat, fish or eggs are non-vegetarians. Both can eat healthily if the food is varied.'),
    tip('Millets like jowar, bajra and ragi grow well in dry places like much of Telangana and are very nutritious.'),
  ],
  examples: [
    ex('Why do people in coastal villages eat more fish than people in a dry inland village?', ['Fish is easily caught in the sea near coastal villages.', 'What is easily available becomes part of daily meals.', 'Inland dry villages grow millets and pulses instead.'], 'Because food habits depend on what is available nearby.'),
    ex('Kiran eats only chips and a soft drink for lunch every day. Is this a good food habit? Suggest a change.', ['Chips are fried and salty; soft drinks are mostly sugar.', 'They do not give a variety of foods.', 'A better lunch: roti or rice, dal, a vegetable and a fruit.'], 'No — he should eat varied, home-made food such as rice, dal, a vegetable and a fruit.'),
  ],
  practice: [
    mcq('habit', 'Think about what grows nearby and what keeps us healthy.', [
      ['Which millet is used to make the jonna rotte eaten in many Telangana homes?', 'Jowar', ['Wheat', 'Maize', 'Barley'], '"Jonna" is the Telugu name.', 'Jonna is jowar (sorghum), a millet that grows well in dry Telangana fields.'],
      ['Food habits of a region depend MOSTLY on…', 'The crops that grow there', ['The colour of houses', 'The number of schools', 'The language spoken only'], 'People eat what is easily available.', 'Climate and soil decide which crops grow, and those crops become everyday food.'],
      ['Which is a GOOD food habit?', 'Washing hands before eating', ['Skipping breakfast', 'Eating packed snacks daily', 'Throwing away leftover food'], 'Think of health and cleanliness.', 'Clean hands keep germs out of our food.'],
      ['Sakinalu and ariselu are special dishes usually made…', 'During festivals like Sankranti', ['Only in hospitals', 'Only in summer camps', 'Every hour'], 'Festivals bring special foods.', 'Festivals and customs are part of food habits.'],
      ['A person who eats only food from plants (and maybe milk) is called a…', 'Vegetarian', ['Non-vegetarian', 'Carnivore', 'Parasite'], 'Veg = vegetables.', 'Vegetarians do not eat meat, fish or eggs.'],
      ['Why should we eat different kinds of food each day?', 'Each food gives the body different useful things', ['So that food is wasted', 'Because one food is always poison', 'To eat only sweets'], 'Grains, pulses and vegetables each help in their own way.', 'A varied diet gives energy, body-building materials and protection.'],
    ]),
    sortT('good-poor', 'a good food habit', 'a poor food habit', [
      ['Eating fruits every day', true], ['Eating meals on time', true], ['Drinking clean water', true], ['Not wasting food', true],
      ['Eating fried snacks for every meal', false], ['Skipping breakfast daily', false], ['Eating with unwashed hands', false], ['Drinking soft drinks instead of water', false],
    ], ['Ask: will this keep my body healthy and clean?'], 'Good habits give variety, cleanliness and regular meals; poor habits harm health or waste food.'),
    tapT('depends', 'Tap every factor that affects the food habits of a place.', [
      ['Climate', true], ['Crops grown nearby', true], ['Festivals and customs', true], ['Season', true],
      ['Colour of school uniforms', false], ['Number of cricket teams', false], ['Shape of the moon', false],
    ], ['What decides which food is easily available and liked?'], 'Climate, soil, crops, seasons and customs shape what people eat.'),
  ],
};

const food3: OSpec = {
  id: 'ts6.sc.food.prepare', title: 'Preparing food and keeping it from spoiling', prereqs: ['ts6.sc.food.sources'],
  intro: [
    h('Raw or cooked?'),
    photo('🔥', 'Cooking on a flame — heat makes food soft, tasty and safe.'),
    p('Some foods are eaten raw: fruits, cucumber, carrot, sprouts. Most grains and pulses must be cooked to make them soft, tasty and easy to digest. Cooking also kills many germs.'),
    def('Ways of cooking', 'Boiling (rice, dal), steaming (idli), frying (puri, vada), roasting (corn, groundnuts) and baking (cake, bread).'),
    p('Sprouting is a way of preparing food without fire: soak green gram overnight, tie it in a wet cloth and in a day tiny shoots appear. Sprouts are very nutritious.'),
    h('Why food spoils'),
    p('Leave cooked rice out on a hot day and next morning it smells bad. Tiny living things called microbes (bacteria and fungi) grow on food when it is warm and moist, and spoil it. Spoiled food can make us sick.'),
    def('Food preservation', 'Keeping food safe to eat for a longer time by stopping microbes from growing.'),
    p('Ways to preserve food: drying in the sun (mango slices for avakaya, red chillies, fish), adding salt (pickles, salted fish), adding sugar (jams, murabba), adding oil (pickles), cooling (refrigerator), boiling and sealing in tins or bottles.'),
    keys('Some food is eaten raw, most is cooked.', 'Cooking methods: boiling, steaming, frying, roasting, baking.', 'Microbes spoil food when it is warm and moist.', 'Drying, salt, sugar, oil and cold all slow down microbes.'),
    remember('Pickles last for months because the salt and oil stop microbes from growing.'),
    tip('Steaming and boiling use little or no oil — they are healthier than deep frying.'),
  ],
  examples: [
    ex('Why does a mango pickle (avakaya) stay good for a whole year, while cut mango pieces rot in two days?', ['Cut mango is moist and sweet — microbes grow on it fast.', 'In avakaya, a lot of salt, chilli powder and oil are added.', 'Salt and oil do not let microbes grow.'], 'The salt and oil in the pickle preserve it.'),
    ex('Name the cooking method used for: idli, puri, boiled rice, roasted groundnuts.', ['Idli is cooked in steam above boiling water — steaming.', 'Puri is cooked in hot oil — frying.', 'Rice is cooked in boiling water — boiling.', 'Groundnuts are heated in a dry pan — roasting.'], 'Idli: steaming; puri: frying; rice: boiling; groundnuts: roasting'),
  ],
  practice: [
    matchT('cook', 'food to the way it is cooked', [
      ['Idli', 'Steaming'], ['Puri', 'Frying'], ['Rice', 'Boiling'], ['Corn cob on coals', 'Roasting'], ['Bread', 'Baking'], ['Mirchi bajji', 'Frying'], ['Dal', 'Boiling'],
    ], ['Steam, water, oil, dry heat or an oven?'], 4),
    mcq('preserve', 'How does this method stop microbes?', [
      ['Which method is used to preserve red chillies at home?', 'Drying in the sun', ['Adding sugar', 'Keeping them wet', 'Painting them'], 'Microbes need moisture.', 'Sun-drying removes water, so microbes cannot grow.'],
      ['Jam made from fruits keeps for a long time because of a lot of…', 'Sugar', ['Water', 'Salt only', 'Air'], 'Jam tastes very sweet.', 'Large amounts of sugar stop microbes from growing.'],
      ['Food spoils fastest when it is…', 'Warm and moist', ['Cold and dry', 'Frozen', 'Sealed in a tin'], 'Microbes like warmth and water.', 'Warmth and moisture help microbes grow quickly.'],
      ['Why does milk last longer in a refrigerator?', 'Cold slows down microbes', ['Cold adds sugar', 'Cold kills the milk', 'Light enters the milk'], 'Think of how microbes grow in summer.', 'Low temperature slows the growth of microbes.'],
      ['Which is a way of preparing food WITHOUT cooking?', 'Sprouting green gram', ['Frying vada', 'Boiling rice', 'Baking cake'], 'It needs only water and time.', 'Sprouting uses soaking and a wet cloth, no fire.'],
      ['What spoils food?', 'Microbes such as bacteria and fungi', ['Salt', 'Sunlight drying', 'Sugar'], 'They are too small to see.', 'Tiny microbes grow on food and spoil it.'],
    ]),
    orderT('sprout', [
      ['Put the steps for making sprouts in order.', ['Wash the green gram', 'Soak it in water overnight', 'Drain and tie it in a wet cloth', 'Keep it for a day', 'Small white shoots appear'], 'Seeds first need water, then a moist warm place to sprout.'],
      ['Put the steps for preparing sun-dried mango slices in order.', ['Wash and peel raw mangoes', 'Cut them into thin slices', 'Add a little salt', 'Spread them in the sun for several days', 'Store the dry slices in a clean jar'], 'Water must be removed before storing, or microbes will grow.'],
    ], ['What must happen first? What comes last?']),
  ],
};

const ch1: USpec = { id: 'ts6.sc.ch1', subject: 'biology', title: 'Our Food', source: src(1), objectives: [food1, food2, food3] };

// =====================================================================================
// Chapter 2 — Playing with Magnets
// =====================================================================================
const mag1: OSpec = {
  id: 'ts6.sc.magnet.shapes', title: 'Magnets, their shapes and magnetic materials', prereqs: [],
  intro: [
    h('The stone that pulls iron'),
    photo('🧲', 'A horseshoe magnet picking up iron pins.'),
    p('Long ago, shepherds noticed that some black stones pulled the iron nails of their shoes. These natural magnets are called lodestones (magnetite). Today we make magnets from iron and other metals.'),
    def('Magnet', 'An object that attracts (pulls) things made of iron, nickel or cobalt.'),
    def('Magnetic material', 'A material that is attracted by a magnet — iron, steel, nickel, cobalt. Materials that are not attracted (wood, plastic, glass, paper, copper, aluminium, gold) are non-magnetic.'),
    p('Magnets come in many shapes: bar magnet, horseshoe (U-shaped) magnet, ring magnet, disc or button magnet, cylindrical magnet and needle magnet. Fridge stickers, pencil-box lids and speakers use magnets.'),
    stepsB('Take a bar magnet and a tray of things: pin, eraser, key, coin, paper clip, pencil, steel spoon.', 'Bring the magnet close to each one.', 'Make two lists: attracted and not attracted.', 'You will find that only things with iron (or nickel) in them stick.'),
    keys('Magnets attract iron, nickel and cobalt.', 'Not all metals are magnetic — copper, aluminium and brass are not.', 'Magnets come in bar, horseshoe, ring, disc and needle shapes.'),
    remember('Natural magnet = lodestone (magnetite). Most magnets we use are artificial magnets.'),
    tip('Test a "metal" object before guessing — an aluminium vessel is not attracted at all.'),
  ],
  examples: [
    ex('Ravi brings a magnet near a steel spoon, a copper wire and a plastic scale. Which will stick?', ['Steel is mostly iron — magnetic.', 'Copper is a metal but not magnetic.', 'Plastic is not magnetic.'], 'Only the steel spoon'),
    ex('Sana says, "All metals are attracted by magnets." Test her idea using a 5-rupee coin, an aluminium plate and an iron nail.', ['The iron nail sticks.', 'The aluminium plate does not stick.', 'So at least one metal is not magnetic.'], 'Her idea is wrong — only some metals (iron, nickel, cobalt) are magnetic.'),
  ],
  practice: [
    sortT('magnetic', 'magnetic', 'non-magnetic', [
      ['Iron nail', true], ['Steel paper clip', true], ['Safety pin', true], ['Iron key', true], ['Nickel strip', true],
      ['Plastic scale', false], ['Wooden pencil', false], ['Copper wire', false], ['Aluminium plate', false], ['Rubber eraser', false], ['Glass marble', false], ['Paper', false],
    ], ['Does it contain iron, nickel or cobalt?'], 'Only things containing iron, nickel or cobalt are attracted by magnets.'),
    mcq('facts', 'Remember what magnets attract.', [
      ['A natural magnet is called…', 'Lodestone', ['Limestone', 'Sandstone', 'Marble'], 'It was found by shepherds long ago.', 'Lodestone (magnetite) is a natural magnet.'],
      ['Which metal is NOT attracted by a magnet?', 'Copper', ['Iron', 'Nickel', 'Cobalt'], 'Electric wires are made of it.', 'Copper is a metal but it is non-magnetic.'],
      ['A U-shaped magnet is called a…', 'Horseshoe magnet', ['Bar magnet', 'Ring magnet', 'Needle magnet'], 'It looks like what a horse wears on its hooves.', 'The U-shaped magnet is the horseshoe magnet.'],
      ['Which of these uses a magnet?', 'A fridge door seal', ['A wooden chair', 'A clay pot', 'A cotton shirt'], 'Something that "snaps" shut.', 'Refrigerator doors use magnetic strips to stay shut.'],
      ['Which material is magnetic?', 'Steel', ['Glass', 'Gold', 'Rubber'], 'Steel is mostly iron.', 'Steel contains iron, so magnets attract it.'],
    ]),
    matchT('shape', 'magnet to its shape', [
      ['Bar magnet', 'Rectangular block'], ['Horseshoe magnet', 'U-shape'], ['Ring magnet', 'Circle with a hole'], ['Disc magnet', 'Flat round coin-like'], ['Needle magnet', 'Thin pointed strip'], ['Cylindrical magnet', 'Round rod'],
    ], ['Picture each one in your mind.'], 4),
  ],
};

const mag2: OSpec = {
  id: 'ts6.sc.magnet.poles', title: 'Poles of a magnet — attraction and repulsion', prereqs: ['ts6.sc.magnet.shapes'],
  intro: [
    h('Where is a magnet strongest?'),
    photo('📎', 'Dip a bar magnet into iron filings or pins — they cling in clumps at the two ends.'),
    p('If you roll a bar magnet in iron filings, most filings stick near the two ends and very few stick in the middle. The places where the magnet is strongest are called its poles.'),
    def('Poles of a magnet', 'The two ends of a magnet where its pulling power is strongest. One is the North pole (N) and the other is the South pole (S).'),
    p('Every magnet has two poles. If you break a bar magnet into two pieces, each piece becomes a complete magnet with its own N and S poles. You can never get a magnet with only one pole.'),
    h('Push or pull?'),
    p('Bring the N pole of one magnet near the N pole of another — they push away. S near S also push away. But N near S pull together.'),
    def('Rule of magnets', 'Like poles repel (push away); unlike poles attract (pull together).'),
    keys('Magnets are strongest at their poles.', 'Every magnet has a North and a South pole.', 'Like poles repel, unlike poles attract.', 'Breaking a magnet gives smaller magnets, each with two poles.'),
    remember('Repulsion is the sure test of a magnet: an iron bar is attracted by both poles, but only a magnet can be repelled.'),
    tip('Magnets lose their magnetism if they are heated, hammered or dropped often. Store bar magnets in pairs with unlike poles side by side and keepers (soft iron pieces) at the ends.'),
  ],
  examples: [
    ex('Two ring magnets are put on a pencil. The upper one floats above the lower one. Why?', ['A floating magnet is being pushed up.', 'Pushing happens only between like poles.', 'So the facing sides are N–N or S–S.'], 'The facing poles are like poles, so they repel and the top magnet floats.'),
    ex('A bar magnet is broken into 3 pieces. How many poles are there in all?', ['Each piece becomes a full magnet.', 'Each magnet has 2 poles.', '3 × 2 = 6'], '6 poles'),
  ],
  practice: [
    mcq('rule', 'Like repel, unlike attract.', [
      ['The N pole of one magnet is brought near the N pole of another. They will…', 'Repel', ['Attract', 'Do nothing', 'Become one magnet'], 'Same poles.', 'Like poles repel each other.'],
      ['The S pole of one magnet is brought near the N pole of another. They will…', 'Attract', ['Repel', 'Do nothing', 'Lose magnetism'], 'Different poles.', 'Unlike poles attract each other.'],
      ['Where do most iron filings stick on a bar magnet?', 'Near the two ends', ['Only in the middle', 'Evenly everywhere', 'Nowhere'], 'The ends are the poles.', 'A magnet’s attraction is strongest at its poles.'],
      ['What is the only sure test to show that an iron bar is a magnet?', 'It repels a pole of another magnet', ['It attracts a magnet', 'It is shiny', 'It is heavy'], 'Plain iron is also attracted.', 'Only a magnet can repel another magnet.'],
      ['Which action can make a magnet lose its magnetism?', 'Heating it strongly', ['Keeping it with a keeper', 'Storing it in pairs', 'Wrapping it in paper'], 'Rough treatment and heat spoil magnets.', 'Heating, hammering or dropping weakens magnets.'],
      ['Can a magnet have only one pole?', 'No, every magnet has two poles', ['Yes, if it is broken', 'Yes, if it is a ring', 'Yes, if it is small'], 'Break it and see.', 'Even the smallest piece has both N and S poles.'],
    ]),
    tp('pieces', (r) => {
      const n = r.int(2, 9);
      return numQ(`A bar magnet is broken into ${n} pieces. How many magnetic poles are there now in all?`, 2 * n, undefined,
        ['Each piece becomes a complete magnet.', 'Every magnet has 2 poles.'],
        [`${n} pieces → ${n} magnets.`, `${n} × 2 = ${2 * n} poles.`],
        [{ when: String(n), explain: 'Each piece has TWO poles, not one.' }, { when: '2', explain: 'Each broken piece becomes a new magnet with its own two poles.' }]);
    }),
    sortT('pair', 'attract', 'repel', [
      ['N pole near S pole', true], ['S pole near N pole', true], ['N pole near N pole', false], ['S pole near S pole', false],
      ['Magnet pole near an iron nail', true], ['North end of a compass needle near the N pole of a bar magnet', false], ['South end of a compass needle near the N pole of a bar magnet', true],
    ], ['Same poles push; different poles pull. Plain iron is always pulled.'], 'Like poles repel, unlike poles attract, and magnetic materials are always attracted.'),
  ],
};

const mag3: OSpec = {
  id: 'ts6.sc.magnet.compass', title: 'The magnetic compass and the earth as a magnet', prereqs: ['ts6.sc.magnet.poles'],
  intro: [
    h('A magnet that shows the way'),
    photo('🧭', 'A magnetic compass — the needle always settles pointing north–south.'),
    p('Hang a bar magnet from a thread so it can turn freely. It slowly comes to rest pointing in the north–south direction, every time. The end that points north is the magnet’s North-seeking pole (N).'),
    def('Magnetic compass', 'A small box with a light magnetised needle on a pivot. The needle points north–south, so travellers, sailors and pilots can find directions.'),
    p('Why does this happen? The earth itself behaves like a giant magnet. The needle lines up with the earth’s magnetism. The earth’s magnetic pole near the geographic North Pole attracts the N end of the needle — so it must act like a magnetic SOUTH pole.'),
    stepsB('Make your own compass: stroke a sewing needle 30 times in ONE direction with one pole of a magnet.', 'Push it through a small piece of cork or thermocol.', 'Float it in a bowl of water.', 'It turns and settles north–south.'),
    keys('A freely hanging magnet points north–south.', 'A compass uses a magnetised needle.', 'The earth behaves like a huge magnet.', 'Keep magnets away from a compass — they will disturb its needle.'),
    remember('Sailors in China used floating magnets to find directions more than a thousand years ago.'),
    tip('If your classroom door faces north, the needle’s N end will point at the door — use it to label the walls of your classroom.'),
  ],
  examples: [
    ex('Teja’s compass points north, but when he keeps it next to a speaker it points somewhere else. Why?', ['Speakers contain magnets.', 'The nearby magnet pulls the compass needle more strongly than the earth.', 'So the needle turns towards the speaker magnet.'], 'A nearby magnet disturbs the compass needle.'),
    ex('A freely hanging bar magnet has its N end pointing towards the hills. In which direction are the hills?', ['The N end of a free magnet points towards geographic north.', 'So the hills lie to the north.'], 'North'),
  ],
  practice: [
    mcq('compass', 'A free magnet always lines up north–south.', [
      ['A freely suspended bar magnet always comes to rest in the…', 'North–south direction', ['East–west direction', 'Any direction', 'Up–down direction'], 'This is how a compass works.', 'A free magnet aligns with the earth’s magnetism, north–south.'],
      ['The needle of a compass is a…', 'Small magnet', ['Piece of copper', 'Piece of plastic', 'Glass rod'], 'It must turn because of magnetism.', 'A compass needle is a light magnetised needle.'],
      ['Why does a compass needle point north–south?', 'The earth behaves like a huge magnet', ['The sun pulls it', 'The wind pushes it', 'It is painted red'], 'Our planet itself is magnetic.', 'The earth’s magnetism lines up the needle.'],
      ['What happens if a bar magnet is brought near a compass?', 'The needle turns towards it', ['Nothing happens', 'The compass breaks', 'The needle melts'], 'Magnets affect other magnets.', 'The nearby magnet attracts or repels the needle’s poles.'],
      ['Who uses a compass the most?', 'Sailors and pilots', ['Bakers', 'Tailors', 'Barbers'], 'Who must find directions where there are no roads?', 'Sailors and pilots use compasses to find their way.'],
      ['To make a needle into a magnet you should stroke it with a magnet…', 'Many times in one direction', ['Back and forth quickly', 'Only once in the middle', 'Using a wooden stick'], 'The direction matters.', 'Stroking in one direction lines up its tiny magnetic parts.'],
    ]),
    orderT('make', [
      ['Put the steps for making a floating compass in order.', ['Stroke a needle with one pole of a magnet in one direction', 'Push the needle through a small cork', 'Float the cork in a bowl of water', 'Wait until it stops turning', 'Check its direction with a real compass'], 'The needle must be magnetised before it can point north.'],
      ['Put the steps for finding north with a compass in order.', ['Hold the compass flat on your palm', 'Keep it away from iron and magnets', 'Wait for the needle to stop moving', 'Turn the box until N on the dial is under the marked end', 'Read the directions'], 'The needle must settle before you read it.'],
    ], ['What must be done first?']),
    tapT('true', 'Tap every TRUE statement.', [
      ['The earth behaves like a giant magnet.', true], ['A compass needle is a magnet.', true], ['A free magnet rests north–south.', true], ['Magnets near a compass disturb it.', true],
      ['A compass works only in daylight.', false], ['A compass needle is made of plastic.', false], ['A free magnet always points east.', false],
    ], ['Think about how and why a compass works.'], 'The compass works because its magnetic needle lines up with the earth’s magnetism, day or night.'),
  ],
};

const ch2: USpec = { id: 'ts6.sc.ch2', subject: 'physics', title: 'Playing with Magnets', source: src(2), objectives: [mag1, mag2, mag3] };

// =====================================================================================
// Chapter 3 — Rain: Where Does It Come From?
// =====================================================================================
const rain1: OSpec = {
  id: 'ts6.sc.rain.forms', title: 'Water in three forms', prereqs: [],
  intro: [
    h('Ice, water and vapour'),
    photo('🧊', 'An ice cube melting in a glass — solid water turning into liquid water.'),
    p('Water is found in three forms. Ice and snow are SOLID; the water in a well or tap is LIQUID; the invisible water vapour in the air is a GAS.'),
    def('Melting', 'Solid changing to liquid when heated, like ice turning into water.'),
    def('Freezing', 'Liquid changing to solid when cooled, like water turning into ice in a freezer.'),
    def('Evaporation', 'Liquid water slowly changing into invisible water vapour.'),
    def('Condensation', 'Water vapour cooling and changing back into tiny drops of liquid water.'),
    p('The changes go both ways: ice → water → vapour when we heat, and vapour → water → ice when we cool. Water is still water in each form — only its form changes.'),
    keys('Water: solid (ice), liquid (water), gas (water vapour).', 'Heating: melting, evaporation. Cooling: condensation, freezing.', 'These changes can be reversed.'),
    remember('Steam you "see" over a hot kettle is actually tiny water droplets formed when invisible vapour cools.'),
    tip('Melting ↔ freezing are opposites; evaporation ↔ condensation are opposites.'),
  ],
  examples: [
    ex('Name the change: (a) ice cream becomes runny, (b) a wet floor dries, (c) water is kept in the freezer overnight.', ['Runny ice cream: solid → liquid = melting.', 'Wet floor drying: liquid → vapour = evaporation.', 'Freezer: liquid → solid = freezing.'], '(a) melting, (b) evaporation, (c) freezing'),
    ex('Drops of water appear on the outside of a glass of cold water. Where do they come from?', ['The glass itself is not leaking.', 'Air around the glass has water vapour.', 'The vapour touches the cold glass, cools and condenses into drops.'], 'From water vapour in the air, by condensation.'),
  ],
  practice: [
    mcq('change', 'Is it heating or cooling? Which form changes into which?', [
      ['Ice changing into water is called…', 'Melting', ['Freezing', 'Condensation', 'Evaporation'], 'Solid → liquid.', 'Melting is solid becoming liquid on heating.'],
      ['Water changing into ice is called…', 'Freezing', ['Melting', 'Evaporation', 'Boiling'], 'Liquid → solid in the cold.', 'Freezing is liquid becoming solid on cooling.'],
      ['Wet clothes dry on a line because of…', 'Evaporation', ['Condensation', 'Freezing', 'Melting'], 'The water goes into the air.', 'Water evaporates from the clothes into the air as vapour.'],
      ['Drops on a cold water bottle taken from the fridge are due to…', 'Condensation', ['Evaporation', 'Melting', 'Leaking'], 'Vapour in the air is cooled.', 'Water vapour cools on the cold surface and condenses.'],
      ['Water vapour is water in which form?', 'Gas', ['Solid', 'Liquid', 'Powder'], 'You cannot see it.', 'Water vapour is the gaseous form of water.'],
      ['Snow on the Himalayas is water in which form?', 'Solid', ['Liquid', 'Gas', 'Vapour'], 'It is frozen.', 'Snow and ice are solid water.'],
    ]),
    matchT('pairs', 'change to what happens', [
      ['Melting', 'Solid → liquid'], ['Freezing', 'Liquid → solid'], ['Evaporation', 'Liquid → gas'], ['Condensation', 'Gas → liquid'], ['Ice', 'Solid water'], ['Water vapour', 'Gaseous water'],
    ], ['Melting and freezing are opposites; evaporation and condensation are opposites.'], 4),
    sortT('hc', 'heating', 'cooling', [
      ['Ice melting', true], ['Water boiling away', true], ['Puddle drying', true], ['Water freezing in a tray', false], ['Dew forming on grass at night', false], ['Mist on a cold mirror', false], ['Butter melting in a pan', true],
    ], ['Does the substance gain heat or lose heat?'], 'Melting and evaporation need heat; freezing and condensation happen on cooling.'),
  ],
};

const rain2: OSpec = {
  id: 'ts6.sc.rain.evap', title: 'Evaporation and condensation around us', prereqs: ['ts6.sc.rain.forms'],
  intro: [
    h('Where does the puddle go?'),
    photo('☀️', 'After the rain, the sun dries up the puddles on the road.'),
    p('After rain, puddles disappear within a day. The water has not sunk away completely — much of it has evaporated into the air. Evaporation happens from ponds, rivers, the sea, wet clothes, leaves and even our skin.'),
    h('What makes water evaporate faster?'),
    p('Spread a spoon of water on a plate and keep the same amount in a narrow bottle cap. The plate dries first. Clothes dry faster on a sunny, windy day than on a cloudy, still day.'),
    keys('More heat (sunlight) → faster evaporation.', 'Bigger open surface → faster evaporation.', 'Wind → faster evaporation.', 'Humid (damp) air → slower evaporation.'),
    h('Condensation'),
    p('When water vapour is cooled, it condenses into drops. Breathe on a cold mirror and it becomes misty. In winter mornings, dew forms on grass because the night air cools. Clouds are made of countless tiny water droplets formed by condensation high in the sky.'),
    remember('Evaporation cools: our sweat evaporates and cools our body; water in a clay pot (kunda) stays cool because some of it seeps out and evaporates.'),
    tip('Salt pans on the sea coast use the sun to evaporate sea water and leave salt behind.'),
  ],
  examples: [
    ex('Priya spreads one shirt fully on the line and keeps another folded. Which dries first and why?', ['Spreading gives a larger surface open to air.', 'A larger surface means faster evaporation.'], 'The spread-out shirt dries first.'),
    ex('Why does water in a clay pot stay cooler than in a steel pot on a hot day?', ['Clay has tiny pores; a little water seeps out.', 'This water evaporates from the outer surface.', 'Evaporation takes heat from the pot and the water inside.'], 'Evaporation from the pot’s surface cools the water.'),
  ],
  practice: [
    mcq('factor', 'Think heat, surface, wind and dampness.', [
      ['Clothes dry fastest on a…', 'Sunny, windy day', ['Cloudy, still day', 'Rainy day', 'Cold, damp night'], 'Heat and wind both help.', 'Heat and wind speed up evaporation.'],
      ['Equal water is kept in a plate and in a narrow glass. Which dries first?', 'The plate', ['The glass', 'Both together', 'Neither'], 'Which has the bigger open surface?', 'A larger surface area increases evaporation.'],
      ['Why does a clay pot keep water cool?', 'Water evaporating from its surface cools it', ['Clay is cold by nature', 'Clay adds ice', 'Clay blocks sunlight completely'], 'Evaporation takes away heat.', 'Water seeping through the pores evaporates and cools the pot.'],
      ['Dew on grass in the early morning forms by…', 'Condensation', ['Evaporation', 'Melting', 'Rain only'], 'Night air cools the vapour.', 'Water vapour condenses on the cool grass.'],
      ['Clouds are made of…', 'Tiny droplets of water or ice', ['Smoke', 'Cotton', 'Dust only'], 'They form when vapour cools high up.', 'Clouds form when water vapour condenses into tiny droplets.'],
      ['Clothes take a long time to dry in the rainy season because the air is…', 'Already full of moisture', ['Too hot', 'Too windy', 'Too dry'], 'Damp air cannot take in much more vapour.', 'Humid air slows down evaporation.'],
    ]),
    sortT('ec', 'evaporation', 'condensation', [
      ['Puddles drying', true], ['Salt left in salt pans', true], ['Sweat drying', true], ['Wet floor drying', true],
      ['Mist on a cold mirror', false], ['Dew drops on leaves', false], ['Drops under a hot pot lid', false], ['Clouds forming', false],
    ], ['Is water going INTO the air, or coming OUT of the air?'], 'Evaporation takes water into the air as vapour; condensation turns vapour back into drops.'),
    tapT('faster', 'Tap every change that makes water evaporate FASTER.', [
      ['More sunlight', true], ['A breeze', true], ['Spreading the water out', true], ['Warmer weather', true],
      ['Covering the water', false], ['Very damp air', false], ['Keeping it in a narrow bottle', false],
    ], ['Heat, wind and a large surface all help.'], 'Heat, wind and a large open surface speed up evaporation; covers, narrow containers and humid air slow it.'),
  ],
};

const rain3: OSpec = {
  id: 'ts6.sc.rain.cycle', title: 'Rain, monsoons and the water cycle', prereqs: ['ts6.sc.rain.evap'],
  intro: [
    h('Round and round'),
    photo('🌧️', 'Dark monsoon clouds bringing rain to the fields.'),
    p('The sun heats seas, rivers, lakes and the soil. Water evaporates and plants give out water vapour from their leaves. The warm moist air rises. High up it is cold, so vapour condenses into tiny droplets that form clouds. Droplets join into bigger, heavier drops that fall as rain (or hail or snow). Rainwater flows into streams, rivers, tanks and the sea, or soaks into the ground — and the journey begins again.'),
    def('Water cycle', 'The continuous movement of water from the earth to the sky and back by evaporation, condensation and rain.'),
    h('The monsoon'),
    def('Monsoon', 'Seasonal winds that bring heavy rain. In India the south-west monsoon arrives in June and brings most of our rain till September.'),
    p('Telangana gets most of its yearly rain from the south-west monsoon (June–September). Farmers sow cotton, maize, paddy and pulses when the monsoon arrives. Tanks and lakes fill up and groundwater is recharged.'),
    keys('Evaporation → condensation (clouds) → rain → rivers and ground → back to the sea.', 'The sun drives the water cycle.', 'The south-west monsoon brings most rain to Telangana from June to September.'),
    remember('The water you drink today may once have been in a cloud over the Bay of Bengal — water keeps going round, it is not used up.'),
    tip('Draw the water cycle as a circle with four arrows: sun heats → vapour rises → clouds form → rain falls.'),
  ],
  examples: [
    ex('Place these in order: rain falls, water evaporates from the sea, clouds form, water flows back to the sea.', ['Water first evaporates from the sea.', 'The vapour cools and forms clouds.', 'Drops grow heavy and rain falls.', 'Rivers carry the water back to the sea.'], 'Evaporation → clouds → rain → back to the sea'),
    ex('Why do farmers in Telangana start sowing in June?', ['The south-west monsoon usually arrives in June.', 'Crops need water to grow.', 'Rain from June to September supplies this water.'], 'Because the monsoon rains begin in June.'),
  ],
  practice: [
    orderT('cycle', [
      ['Put the water cycle in order, starting at the sea.', ['Sun heats sea water', 'Water evaporates as vapour', 'Vapour rises and cools', 'Vapour condenses into clouds', 'Rain falls', 'Rivers carry water back to the sea'], 'Evaporation comes before condensation, and rain comes after clouds form.'],
      ['Put the journey of a raindrop in order, starting in a lake.', ['Lake water is warmed by the sun', 'It evaporates into the air', 'Moist air rises high', 'Droplets form a cloud', 'Droplets join and fall as rain'], 'Water must rise and cool before it can fall as rain.'],
    ], ['What does the sun do first?', 'Clouds come before rain.']),
    mcq('cycle-q', 'Follow the water around the cycle.', [
      ['What gives the energy for the water cycle?', 'The sun', ['The moon', 'The wind alone', 'Electricity'], 'It heats the sea.', 'The sun’s heat evaporates water and drives the cycle.'],
      ['Clouds form when water vapour…', 'Cools and condenses', ['Heats and boils', 'Freezes the sea', 'Turns into salt'], 'It is cold high up.', 'Rising vapour cools and condenses into droplets.'],
      ['In Telangana most rain comes during…', 'June to September', ['December to February', 'March to May', 'Only in January'], 'The south-west monsoon season.', 'The south-west monsoon brings most rain from June to September.'],
      ['Monsoons are…', 'Seasonal winds that bring heavy rain', ['Mountains', 'Rivers', 'Cold winds that bring snow every day'], 'They change with the season.', 'Monsoon winds blow in a particular season and carry moisture.'],
      ['Some rainwater soaks into the soil. This becomes…', 'Groundwater', ['Clouds', 'Sea salt', 'Ice'], 'Wells and borewells use it.', 'Water that soaks down is stored as groundwater.'],
      ['Plants add water vapour to the air through their…', 'Leaves', ['Roots only', 'Seeds', 'Flowers only'], 'Tiny pores on these flat green parts.', 'Plants lose water vapour through leaves (transpiration).'],
    ]),
    tapT('in', 'Tap every process that is part of the water cycle.', [
      ['Evaporation from the sea', true], ['Condensation into clouds', true], ['Rain falling', true], ['Rivers flowing to the sea', true], ['Water vapour from leaves', true],
      ['Melting of iron', false], ['Burning wood', false], ['Magnet attracting pins', false],
    ], ['Which ones move water between land, sea and sky?'], 'The water cycle is evaporation, condensation, rain and flow back to the sea.'),
  ],
};

const ch3: USpec = { id: 'ts6.sc.ch3', subject: 'chemistry', title: 'Rain: Where Does It Come From?', source: src(3), objectives: [rain1, rain2, rain3] };

// =====================================================================================
// Chapter 4 — What Do Animals Eat?
// =====================================================================================
const ani1: OSpec = {
  id: 'ts6.sc.animalfood.intake', title: 'How animals find and take in food', prereqs: [],
  intro: [
    h('Every animal has its own tools'),
    photo('🦋', 'A butterfly sucks nectar from a flower through a long coiled tube.'),
    p('Animals do not all eat the same way. A cow grazes and chews grass, a frog flicks out a sticky tongue to catch insects, a butterfly sucks nectar, a mosquito pierces skin and sucks blood, and an elephant uses its trunk to pluck leaves.'),
    def('Food intake', 'The way an animal takes food into its body, using special body parts such as the beak, tongue, teeth, trunk or a sucking tube.'),
    h('Searching and tracking'),
    p('Animals use their senses to find food. Dogs and ants follow smells. Eagles and kites spot small animals from high in the sky with sharp eyes. Snakes sense heat and smell with their tongue. Bats find insects in the dark by listening to echoes of their own squeaks.'),
    keys('Different animals use different body parts to eat.', 'Smell, sight, hearing and touch help animals find food.', 'The shape of a bird’s beak tells us what it eats.'),
    remember('A parrot has a strong curved beak to crack nuts and fruits; a kingfisher has a long pointed beak to catch fish; a sparrow has a short cone-shaped beak to pick grains.'),
    tip('Look at an animal’s mouth parts — they are a clue to its food.'),
  ],
  examples: [
    ex('How does a frog catch a flying insect?', ['The frog sits still and watches.', 'It flicks out a long sticky tongue.', 'The insect sticks to it and is pulled into the mouth.'], 'With its long sticky tongue.'),
    ex('A trail of ants walks straight to a fallen laddoo. How did they find it?', ['Ants have a very good sense of smell.', 'The first ant leaves a smell trail back to the nest.', 'Others follow the trail.'], 'By smell — they follow a scent trail.'),
  ],
  practice: [
    matchT('mouth', 'animal to how it takes in food', [
      ['Frog', 'Sticky tongue'], ['Butterfly', 'Long sucking tube'], ['Elephant', 'Trunk'], ['Mosquito', 'Piercing and sucking'], ['Cow', 'Grazing and chewing'], ['Parrot', 'Strong curved beak'], ['Kingfisher', 'Long pointed beak'],
    ], ['Picture the animal eating.'], 4),
    mcq('sense', 'Which sense does the animal depend on?', [
      ['A dog follows the trail of a thief mostly by…', 'Smell', ['Sight', 'Taste', 'Touch'], 'Police dogs sniff.', 'Dogs have a very strong sense of smell.'],
      ['An eagle finds a rat from high in the sky using…', 'Sharp eyesight', ['Smell', 'Echoes', 'Taste'], 'Eagles are famous for this.', 'Eagles and kites have very sharp eyes.'],
      ['Bats find insects in the dark using…', 'Echoes of their squeaks', ['Sharp eyes', 'Taste', 'Colour'], 'They listen carefully.', 'Bats send out sounds and listen to the echoes.'],
      ['A sparrow’s short cone-shaped beak is best for…', 'Picking up grains', ['Catching fish', 'Tearing meat', 'Sucking nectar'], 'Sparrows visit fields of grain.', 'Short cone-shaped beaks pick and crack seeds.'],
      ['Which animal sucks nectar from flowers?', 'Butterfly', ['Lion', 'Cow', 'Crocodile'], 'It has a long coiled tube.', 'Butterflies use a long tube (proboscis) to suck nectar.'],
      ['Snakes use their flicking tongue to…', 'Smell the air', ['Chew food', 'See in the dark', 'Drink milk'], 'They pick up tiny scent particles.', 'A snake’s tongue collects smells from the air.'],
    ]),
    tapT('suck', 'Tap every animal that SUCKS its food.', [
      ['Mosquito', true], ['Butterfly', true], ['Housefly', true], ['Leech', true], ['Bee (nectar)', true],
      ['Cow', false], ['Lion', false], ['Squirrel', false], ['Crow', false],
    ], ['Which animals have tubes or suckers instead of teeth?'], 'Mosquitoes, butterflies, houseflies, bees and leeches suck liquid food; the others bite and chew.'),
  ],
};

const ani2: OSpec = {
  id: 'ts6.sc.animalfood.types', title: 'Collecting food, plant-eaters and meat-eaters, feeding on others', prereqs: ['ts6.sc.animalfood.intake'],
  intro: [
    h('What do they eat?'),
    photo('🐿️', 'A squirrel holds a nut in its front paws and nibbles it with sharp front teeth.'),
    def('Herbivore', 'An animal that eats only plants or plant parts — cow, goat, deer, rabbit, elephant.'),
    def('Carnivore', 'An animal that eats other animals — lion, tiger, eagle, snake.'),
    def('Omnivore', 'An animal that eats both plants and animals — crow, bear, dog, humans.'),
    h('Collecting food'),
    p('Some animals collect and store food. Squirrels hide nuts, honeybees collect nectar and pollen and turn nectar into honey, ants carry grains to their nests, and some birds collect seeds.'),
    h('Feeding without hunting'),
    p('Some animals live on or inside other animals and take food from them without killing them right away. A leech sticks to the skin of cattle (or people wading in water) and sucks blood. Lice, ticks and mosquitoes also feed on blood. Such animals are called parasites. Vultures and hyenas eat animals that are already dead — they are scavengers that keep the surroundings clean.'),
    keys('Herbivores eat plants, carnivores eat animals, omnivores eat both.', 'Some animals collect and store food.', 'Parasites like leeches and lice feed on other living animals.', 'Scavengers eat dead animals.'),
    remember('A leech produces a substance that stops blood from clotting, so it can keep sucking for a long time.'),
    tip('Teeth help: herbivores have flat grinding teeth, carnivores have sharp pointed teeth (canines).'),
  ],
  examples: [
    ex('Classify: goat, tiger, crow.', ['Goat eats grass and leaves → herbivore.', 'Tiger eats deer and other animals → carnivore.', 'Crow eats grains, fruit, insects and scraps → omnivore.'], 'Goat: herbivore; tiger: carnivore; crow: omnivore'),
    ex('A buffalo comes out of a pond with a leech on its leg. Is the leech a hunter? Explain.', ['The leech does not kill the buffalo to eat it.', 'It holds on and sucks blood while the buffalo lives.', 'Animals that feed this way are parasites.'], 'No — it is a parasite that feeds without hunting.'),
  ],
  practice: [
    mcq('kind', 'Ask: plants, animals or both?', [
      ['An animal that eats only plants is a…', 'Herbivore', ['Carnivore', 'Omnivore', 'Parasite'], '"Herb" means plant.', 'Herbivores eat only plants.'],
      ['A tiger is a…', 'Carnivore', ['Herbivore', 'Omnivore', 'Scavenger only'], 'It hunts deer.', 'Tigers eat other animals, so they are carnivores.'],
      ['Humans who eat rice, vegetables and also fish are…', 'Omnivores', ['Herbivores', 'Carnivores', 'Parasites'], 'Both plants and animals.', 'Eating both plant and animal food makes us omnivores.'],
      ['A leech feeding on a buffalo’s blood is an example of a…', 'Parasite', ['Herbivore', 'Scavenger', 'Producer'], 'It feeds on a living animal without killing it.', 'Parasites live on other animals and take food from them.'],
      ['Vultures that eat dead animals are called…', 'Scavengers', ['Parasites', 'Herbivores', 'Producers'], 'They clean up the surroundings.', 'Scavengers feed on dead animals.'],
      ['Which animal collects nectar and stores it as honey?', 'Honeybee', ['Housefly', 'Mosquito', 'Spider'], 'It lives in a hive.', 'Honeybees turn collected nectar into honey and store it.'],
    ]),
    sortT('hc', 'a herbivore', 'not a herbivore', [
      ['Cow', true], ['Goat', true], ['Deer', true], ['Rabbit', true], ['Elephant', true], ['Buffalo', true],
      ['Lion', false], ['Eagle', false], ['Crow', false], ['Snake', false], ['Dog', false],
    ], ['Does it eat ONLY plants?'], 'Herbivores eat only plants; carnivores and omnivores also eat animals.'),
    matchT('who', 'animal to its group', [
      ['Leech', 'Parasite'], ['Vulture', 'Scavenger'], ['Rabbit', 'Herbivore'], ['Lion', 'Carnivore'], ['Bear', 'Omnivore'], ['Louse', 'Parasite'], ['Deer', 'Herbivore'], ['Eagle', 'Carnivore'],
    ], ['Parasites live on another living animal; scavengers eat the dead.'], 4),
  ],
};

const ani3: OSpec = {
  id: 'ts6.sc.animalfood.chain', title: 'Food chains and animal colonies', prereqs: ['ts6.sc.animalfood.types'],
  intro: [
    h('Who eats whom?'),
    photo('🐸', 'A frog waits for grasshoppers in a paddy field.'),
    p('In a paddy field, grasshoppers eat the green leaves, frogs eat the grasshoppers, snakes eat the frogs and an eagle may catch the snake. Food passes from one living thing to the next like links in a chain.'),
    def('Food chain', 'A series of living things in which each one is eaten by the next. Example: grass → grasshopper → frog → snake → eagle.'),
    p('Every food chain begins with a green plant, because only green plants can make their own food using sunlight. The arrow means "is eaten by" and shows the direction in which food (energy) moves.'),
    h('Living together in colonies'),
    p('Ants, honeybees and termites live in large groups called colonies. In a beehive, the queen lays eggs, worker bees collect nectar and pollen, build the comb and feed the young, and drones mate with the queen. Ants carry food to the nest and share it. Working together helps the whole colony get and store food.'),
    keys('A food chain starts with a green plant.', 'Arrows point from the eaten to the eater.', 'Ants, bees and termites live in colonies and share the work of finding food.'),
    remember('If one link is removed — say frogs are killed — grasshoppers increase and eat the crops, and snakes go hungry. Every link matters.'),
    tip('Read the arrow "→" as "is eaten by".'),
  ],
  examples: [
    ex('Arrange into a food chain: frog, grass, snake, grasshopper.', ['Start with the plant: grass.', 'Grass is eaten by the grasshopper.', 'The grasshopper is eaten by the frog; the frog by the snake.'], 'Grass → grasshopper → frog → snake'),
    ex('What jobs do worker bees do in a hive?', ['They collect nectar and pollen.', 'They make honey and build the wax comb.', 'They feed the young and guard the hive.'], 'Workers collect food, build the comb, feed the young and guard the hive.'),
  ],
  practice: [
    orderT('chain', [
      ['Arrange the food chain (first: the one that is eaten first).', ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Eagle'], 'A food chain starts with a green plant and ends with an animal that is not eaten by the others in it.'],
      ['Arrange the food chain.', ['Paddy plants', 'Rat', 'Snake', 'Eagle'], 'Plants are first; each animal eats the one before it.'],
      ['Arrange the food chain.', ['Leaves', 'Caterpillar', 'Sparrow', 'Cat'], 'Start from the green plant.'],
      ['Arrange the food chain in a pond.', ['Water plants', 'Small fish', 'Big fish', 'Kingfisher'], 'Water plants make food; bigger animals eat smaller ones.'],
      ['Arrange the food chain in a forest.', ['Grass', 'Deer', 'Tiger'], 'The plant comes first and the hunter last.'],
    ], ['Which one is a green plant? That comes first.', 'Ask "who eats it?" for each step.']),
    mcq('chain-q', 'Food chains always start with a green plant.', [
      ['Every food chain begins with…', 'A green plant', ['A lion', 'A snake', 'A mushroom'], 'Who can make food from sunlight?', 'Green plants make their own food, so they start every chain.'],
      ['In "grass → deer → tiger", the arrow means…', 'Is eaten by', ['Eats', 'Runs from', 'Lives with'], 'Food moves along the arrow.', 'The arrow points from the food to the eater.'],
      ['If all frogs in a paddy field are killed, grasshoppers will…', 'Increase and damage crops', ['Decrease', 'Become frogs', 'Stop eating'], 'Who was eating them?', 'Without frogs to eat them, grasshoppers multiply.'],
      ['In a beehive, who lays eggs?', 'The queen bee', ['Worker bees', 'Drones', 'All bees'], 'There is only one in a hive.', 'Only the queen lays eggs.'],
      ['Which insects live in colonies?', 'Ants, bees and termites', ['Butterflies only', 'Mosquitoes only', 'Grasshoppers'], 'They build nests, hives and mounds.', 'Ants, bees and termites live in organised colonies.'],
      ['Why do ants carry food back to the nest?', 'To share and store it for the colony', ['To throw it away', 'To build walls only', 'To feed the queen bee'], 'They work as a team.', 'Ants collect food for the whole colony.'],
    ]),
    tapT('colony', 'Tap every animal that lives in a colony.', [
      ['Honeybee', true], ['Ant', true], ['Termite', true], ['Wasp', true],
      ['Tiger', false], ['Spider', false], ['Leech', false], ['Snail', false],
    ], ['Colonies are big organised families of insects.'], 'Bees, ants, termites and some wasps live in colonies where members share the work.'),
  ],
};

const ch4: USpec = { id: 'ts6.sc.ch4', subject: 'biology', title: 'What Do Animals Eat?', source: src(4), objectives: [ani1, ani2, ani3] };

export const units: USpec[] = [ch1, ch2, ch3, ch4];
void [rd, who, xp]; // TEMP
