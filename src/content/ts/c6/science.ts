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


// =====================================================================================
// Chapter 5 — Materials - Objects
// =====================================================================================
const mat1: OSpec = {
  id: 'ts6.sc.materials.objects', title: 'Materials and objects', prereqs: [],
  intro: [
    h('What is it made of?'),
    photo('🪑', 'A chair can be made of wood, plastic, iron or cane — the object is the same, the material is different.'),
    p('Look around the classroom: a desk, a bag, a water bottle, a window, a chalk piece. Each of these is an OBJECT. The stuff it is made of — wood, cloth, plastic, glass, chalk — is its MATERIAL.'),
    def('Object', 'A thing that has a definite shape and use, such as a tumbler, a chair or a pen.'),
    def('Material', 'What an object is made of, such as wood, glass, steel, plastic, paper, cloth or clay.'),
    p('One object can be made of different materials: a tumbler can be of glass, steel, plastic, copper or clay. One material can make many objects: wood makes doors, tables, pencils, toys and boats.'),
    stepsB('Pick an object, e.g. a tumbler.', 'Ask: what is this made of?', 'Ask: could it be made of something else?', 'Ask: why is this material chosen? (glass to see the drink, steel so it does not break).'),
    keys('Objects are made of materials.', 'The same object can be made of different materials.', 'The same material can make different objects.', 'We choose a material because of its properties.'),
    remember('Material = "made of". Object = "the thing".'),
    tip('An object made of more than one material: a pencil (wood + graphite), a bicycle (steel + rubber + plastic).'),
  ],
  examples: [
    ex('Name three objects made of wood and three made of glass.', ['Wood: door, table, cricket bat.', 'Glass: window pane, tumbler, spectacles lens.'], 'Wood: door, table, bat. Glass: window, tumbler, spectacles.'),
    ex('Why is a cooking pot made of steel or aluminium and not of plastic or paper?', ['A cooking pot is heated on a flame.', 'Plastic melts and paper burns.', 'Steel and aluminium are strong and do not melt on a stove.'], 'Because metals can stand the heat of the stove.'),
  ],
  practice: [
    sortT('om', 'an object', 'a material', [
      ['Chair', true], ['Tumbler', true], ['Pen', true], ['Notebook', true], ['Football', true],
      ['Wood', false], ['Glass', false], ['Plastic', false], ['Cotton', false], ['Iron', false], ['Clay', false],
    ], ['Is it a "thing", or what things are made of?'], 'Objects are things with a shape and a use; materials are what they are made of.'),
    matchT('made', 'object to a material it is usually made of', [
      ['Window pane', 'Glass'], ['Notebook', 'Paper'], ['Shirt', 'Cotton cloth'], ['Matka (water pot)', 'Clay'], ['Nail', 'Iron'], ['Cricket bat', 'Wood'], ['Bucket', 'Plastic'],
    ], ['Think of what you see at home.'], 4),
    mcq('why', 'Why was this material chosen?', [
      ['Why is a window made of glass?', 'We can see through it', ['It is soft', 'It is magnetic', 'It floats'], 'What does a window let in?', 'Glass is transparent, so light comes in and we can see out.'],
      ['Why are electric wires covered with plastic?', 'Plastic does not let electricity pass', ['Plastic is shiny', 'Plastic is heavy', 'Plastic attracts iron'], 'Safety from shocks.', 'Plastic is an insulator, so it protects us from shocks.'],
      ['Which object can be made of glass, steel, plastic OR clay?', 'Tumbler', ['Electric wire', 'Window pane', 'Matchstick'], 'You drink from it.', 'Tumblers are made of many materials.'],
      ['Which is a MATERIAL, not an object?', 'Leather', ['Shoe', 'Belt', 'Bag'], 'Shoes, belts and bags can be made of it.', 'Leather is a material; shoes and belts are objects.'],
      ['Which material is used for making both doors and pencils?', 'Wood', ['Glass', 'Rubber', 'Cotton'], 'It comes from trees.', 'Wood is used for many objects.'],
      ['A pencil is made of…', 'Wood and graphite', ['Only glass', 'Only iron', 'Only cotton'], 'Look at its outside and its tip.', 'A pencil has a wooden case and a graphite core.'],
    ]),
  ],
};

const mat2: OSpec = {
  id: 'ts6.sc.materials.properties', title: 'Properties of materials and transparency', prereqs: ['ts6.sc.materials.objects'],
  intro: [
    h('How do materials differ?'),
    photo('🪟', 'A glass window lets light through; a wooden door does not.'),
    p('We can group materials by their properties:'),
    keys('Appearance: metals like iron, copper and gold have a shine (lustre); wood and cloth do not.', 'Hardness: iron and stone are hard (cannot be scratched easily); sponge and cotton are soft.', 'Solubility: sugar and salt dissolve in water (soluble); sand and chalk do not (insoluble).', 'Floating: wood, cork and dry leaves float on water; stones and iron nails sink.'),
    h('Can light pass through?'),
    def('Transparent', 'A material through which we can see clearly, like clear glass, clean water or clear plastic.'),
    def('Translucent', 'A material through which some light passes but we cannot see clearly, like butter paper, frosted glass or oiled paper.'),
    def('Opaque', 'A material through which no light passes, like wood, cardboard, a brick wall or metal.'),
    stepsB('Hold each sheet in front of a lit torch.', 'If you can see the torch clearly → transparent.', 'If you see only a blurred glow → translucent.', 'If you see no light at all → opaque.'),
    remember('Bathroom windows use frosted (translucent) glass so light comes in but nobody can see inside.'),
    tip('Rub a little oil on a piece of paper — it becomes translucent.'),
  ],
  examples: [
    ex('Kavya puts sugar, sand and salt in three glasses of water and stirs. What happens?', ['Sugar disappears — it dissolves.', 'Salt disappears — it dissolves.', 'Sand settles at the bottom — it does not dissolve.'], 'Sugar and salt are soluble; sand is insoluble.'),
    ex('Classify: clear glass, butter paper, notebook cover.', ['Clear glass: you can see through clearly → transparent.', 'Butter paper: light passes but things look blurred → translucent.', 'Notebook cover: no light passes → opaque.'], 'Transparent, translucent, opaque'),
  ],
  practice: [
    tp('light', (r) => {
      const pool: [string, string][] = [
        ['Clear glass', 'Transparent'], ['Clean water', 'Transparent'], ['Clear plastic sheet', 'Transparent'], ['Air', 'Transparent'],
        ['Butter paper', 'Translucent'], ['Frosted glass', 'Translucent'], ['Oiled paper', 'Translucent'], ['Thin muslin cloth', 'Translucent'],
        ['Wooden plank', 'Opaque'], ['Cardboard', 'Opaque'], ['Brick wall', 'Opaque'], ['Steel plate', 'Opaque'], ['Stone', 'Opaque'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `${m}: transparent, translucent or opaque?`, ...choose(r, a, ['Transparent', 'Translucent', 'Opaque'].filter((x) => x !== a)),
        hints: ['Imagine holding it in front of a torch.', 'Clear view → transparent; blurred glow → translucent; nothing → opaque.'],
        mistakes: [{ when: 'wrong', explain: 'Ask: can I see clearly through it, see only a glow, or see nothing?' }],
        solution: [`${m} is ${a.toLowerCase()}.`],
      };
    }),
    sortT('sol', 'soluble in water', 'insoluble in water', [
      ['Sugar', true], ['Salt', true], ['Lemon juice', true], ['Glucose', true],
      ['Sand', false], ['Chalk powder', false], ['Sawdust', false], ['Pebbles', false], ['Wax', false], ['Iron filings', false],
    ], ['Does it disappear when stirred in water?'], 'Soluble substances dissolve and disappear in water; insoluble ones stay visible or settle.'),
    mcq('prop', 'Think of how each material looks and behaves.', [
      ['Which material has lustre (shine)?', 'Copper', ['Wood', 'Cotton', 'Clay'], 'Metals shine.', 'Metals like copper have a natural shine.'],
      ['Which of these floats on water?', 'Cork', ['Stone', 'Iron nail', 'Coin'], 'Fishing nets use it.', 'Cork is light and floats.'],
      ['Which is the hardest?', 'Iron', ['Sponge', 'Cotton', 'Rubber'], 'It is very hard to scratch.', 'Iron is hard; sponge and cotton are soft.'],
      ['Why is the bathroom window often frosted glass?', 'Light enters but no one can see inside', ['It is cheaper than wood', 'It is magnetic', 'It dissolves in water'], 'Privacy plus light.', 'Translucent glass lets light pass but blurs the view.'],
      ['Which material is opaque?', 'Cardboard', ['Clear glass', 'Clean water', 'Air'], 'No light passes.', 'Cardboard does not let light through.'],
      ['Rubbing oil on paper makes it…', 'Translucent', ['Opaque', 'Magnetic', 'Shiny like metal'], 'Try it with a torch.', 'Oiled paper lets some light pass through.'],
    ]),
  ],
};

const mat3: OSpec = {
  id: 'ts6.sc.materials.states', title: 'States of materials — solid, liquid and gas', prereqs: ['ts6.sc.materials.properties'],
  intro: [
    h('Shape and space'),
    photo('🎈', 'Air fills the whole balloon and gives it its shape.'),
    p('Materials are found in three states. A stone, a pencil and ice are solids. Water, milk and oil are liquids. Air, steam and the gas in an LPG cylinder are gases.'),
    def('Solid', 'Has a fixed shape and a fixed volume. It does not flow.'),
    def('Liquid', 'Has a fixed volume but no fixed shape — it takes the shape of its container and can flow.'),
    def('Gas', 'Has no fixed shape and no fixed volume — it spreads to fill all the space it gets.'),
    stepsB('Pour 1 glass of water into a bowl, then into a bottle.', 'The shape changes each time but the amount stays the same → liquid.', 'Put a stone in each container — its shape never changes → solid.', 'Smell incense in one corner; soon the whole room smells → gas spreads everywhere.'),
    keys('Solids: fixed shape and volume.', 'Liquids: fixed volume, shape of container.', 'Gases: fill the whole container.', 'Heating or cooling can change the state (ice ↔ water ↔ vapour).'),
    remember('Sugar and salt flow when poured, but each tiny grain is a solid with its own fixed shape.'),
    tip('Ask two questions: Does it keep its shape? Does it keep its volume?'),
  ],
  examples: [
    ex('Milk is poured from a packet into a glass and then into a cup. Which state is milk in and why?', ['Its shape changed each time to match the container.', 'Its amount stayed the same.', 'Fixed volume but no fixed shape → liquid.'], 'Liquid'),
    ex('Why does the smell of frying vadas reach every room of the house?', ['The smell is carried by gases.', 'Gases have no fixed volume; they spread into all the space they get.'], 'Because gases spread to fill all the available space.'),
  ],
  practice: [
    tp('state', (r) => {
      const pool: [string, string][] = [
        ['Stone', 'Solid'], ['Ice', 'Solid'], ['Pencil', 'Solid'], ['Brick', 'Solid'], ['Wooden table', 'Solid'],
        ['Milk', 'Liquid'], ['Coconut oil', 'Liquid'], ['Water', 'Liquid'], ['Honey', 'Liquid'], ['Kerosene', 'Liquid'],
        ['Air', 'Gas'], ['Steam', 'Gas'], ['Cooking gas (LPG)', 'Gas'], ['Oxygen', 'Gas'], ['Smoke gases', 'Gas'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `${m} is a…`, ...choose(r, a, ['Solid', 'Liquid', 'Gas'].filter((x) => x !== a)),
        hints: ['Does it keep its own shape?', 'Does it spread to fill a room?'],
        mistakes: [{ when: 'wrong', explain: 'Solids keep shape; liquids flow but keep volume; gases spread everywhere.' }],
        solution: [`${m} is a ${a.toLowerCase()}.`],
      };
    }),
    matchT('rule', 'state to its property', [
      ['Solid', 'Fixed shape and fixed volume'], ['Liquid', 'Fixed volume, takes the container’s shape'], ['Gas', 'Fills the whole container'],
      ['Melting', 'Solid turns into liquid'], ['Freezing', 'Liquid turns into solid'],
    ], ['Three states, two changes.'], 4),
    mcq('states-q', 'Ask about shape and volume.', [
      ['Which state has a fixed volume but takes the shape of its container?', 'Liquid', ['Solid', 'Gas', 'None'], 'Pour water into a bottle.', 'Liquids keep their volume but not their shape.'],
      ['Which state spreads to fill the whole room?', 'Gas', ['Solid', 'Liquid', 'Ice'], 'Think of the smell of agarbatti.', 'Gases spread into all the available space.'],
      ['Sugar can be poured like water. It is still a solid because…', 'Each grain has its own fixed shape', ['It is sweet', 'It dissolves', 'It is white'], 'Look at one grain under a lens.', 'Each sugar crystal keeps its own shape.'],
      ['A balloon becomes round when blown because air…', 'Spreads to fill the balloon', ['Is a solid', 'Has a fixed shape', 'Is a liquid'], 'Gases fill their container.', 'Air, a gas, fills all the space inside the balloon.'],
      ['When ice is heated it becomes water. This is a change from…', 'Solid to liquid', ['Liquid to gas', 'Gas to solid', 'Liquid to solid'], 'Ice is solid; water is liquid.', 'Melting changes a solid into a liquid.'],
    ]),
  ],
};

const ch5: USpec = { id: 'ts6.sc.ch5', subject: 'chemistry', title: 'Materials - Objects', source: src(5), objectives: [mat1, mat2, mat3] };

// =====================================================================================
// Chapter 6 — Habitat
// =====================================================================================
const hab1: OSpec = {
  id: 'ts6.sc.habitat.homes', title: 'Habitats — pond, tree and house', prereqs: [],
  intro: [
    h('A home with food, water and shelter'),
    photo('🐟', 'Fish live only in water — a pond is their habitat.'),
    def('Habitat', 'The natural home of a plant or animal, where it gets food, water, air and shelter, and can produce its young.'),
    p('A habitat on land is a terrestrial habitat (forest, grassland, desert). A habitat in water is an aquatic habitat (pond, lake, river, sea).'),
    h('A pond'),
    p('In a village pond you find lotus and water lilies (rooted at the bottom with floating leaves), duckweed and water hyacinth floating, hydrilla under the water, fish, frogs, tadpoles, snails, water insects and visiting birds like herons and kingfishers.'),
    h('A tree'),
    p('One big neem or banyan tree is a habitat for many living things: birds nest in its branches, squirrels run on it, ants and beetles crawl on the bark, bats or owls rest in holes, and mosses and climbers grow on it.'),
    h('A house'),
    p('Our houses also give shelter to other animals: lizards, ants, cockroaches, spiders, house flies, mosquitoes, rats and house sparrows. Plants like tulasi or money plant may grow in pots.'),
    keys('A habitat gives food, water, air and shelter.', 'Terrestrial = land; aquatic = water.', 'A single pond, tree or house is home to many living things.'),
    remember('Animals and plants have special features (adaptations) that suit their habitat — fish have gills and fins, lotus leaves have a waxy top so water rolls off.'),
    tip('Make a habitat survey: sit near a tree for 10 minutes and list every living thing you see on it.'),
  ],
  examples: [
    ex('Why can a fish not live on land, and a cow not live in a pond?', ['A fish breathes with gills that work only in water.', 'A cow breathes with lungs, walks and grazes on land.', 'Each is suited (adapted) to its own habitat.'], 'Each animal is adapted to its own habitat.'),
    ex('Name four living things you may find on a neem tree.', ['Birds such as crows build nests.', 'Squirrels run on the branches.', 'Ants crawl on the bark.', 'Caterpillars may eat its leaves.'], 'Crows, squirrels, ants, caterpillars (any four similar)'),
  ],
  practice: [
    tp('where', (r) => {
      const pool: [string, string][] = [
        ['Lotus', 'Pond'], ['Tadpole', 'Pond'], ['Duckweed', 'Pond'], ['Water snail', 'Pond'], ['Fish', 'Pond'],
        ['Squirrel', 'Tree'], ['Woodpecker', 'Tree'], ['Weaver bird nest', 'Tree'], ['Tree climber (monkey)', 'Tree'],
        ['House lizard', 'House'], ['Cockroach', 'House'], ['House sparrow', 'House'], ['House fly', 'House'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `Which habitat is the usual home of: ${m}?`, ...choose(r, a, ['Pond', 'Tree', 'House'].filter((x) => x !== a)),
        hints: ['Where does it get its food and shelter?'],
        mistakes: [{ when: 'wrong', explain: 'Think where you usually see this living thing.' }],
        solution: [`${m} → ${a}.`],
      };
    }),
    sortT('aq', 'aquatic', 'terrestrial', [
      ['Fish', true], ['Lotus', true], ['Crab in the sea', true], ['Hydrilla', true], ['Water lily', true],
      ['Neem tree', false], ['Cow', false], ['Camel', false], ['Squirrel', false], ['Earthworm', false],
    ], ['Does it live in water or on land?'], 'Aquatic living things live in water; terrestrial ones live on land.'),
    mcq('def', 'A habitat provides food, water, air and shelter.', [
      ['The natural home of a living thing is its…', 'Habitat', ['Food chain', 'Fibre', 'Colony only'], 'Where it lives and gets what it needs.', 'A habitat is the natural home of a living thing.'],
      ['A forest is a…', 'Terrestrial habitat', ['Aquatic habitat', 'Food', 'Material'], 'Terra = land.', 'Forests are on land, so they are terrestrial habitats.'],
      ['Which plant floats freely on a pond?', 'Duckweed', ['Mango tree', 'Cactus', 'Wheat'], 'It is tiny and green.', 'Duckweed and water hyacinth float on ponds.'],
      ['Which animals commonly share our houses?', 'Lizards and ants', ['Tigers and deer', 'Whales', 'Camels'], 'Look on the walls and kitchen floor.', 'Lizards, ants, cockroaches and spiders live in houses.'],
      ['Lotus leaves stay dry on top because they…', 'Have a waxy coating', ['Are made of plastic', 'Are under water', 'Are magnetic'], 'Water rolls off like off a raincoat.', 'A waxy layer makes water roll off — an adaptation to water.'],
    ]),
  ],
};

const hab2: OSpec = {
  id: 'ts6.sc.habitat.garden', title: 'The garden as a habitat', prereqs: ['ts6.sc.habitat.homes'],
  intro: [
    h('A busy little world'),
    photo('🌼', 'Flowers in a school garden attract bees and butterflies.'),
    p('A school or home garden is a small habitat. It has grass, flowering plants, vegetable plants, shrubs and trees. Many animals live in it or visit it: earthworms in the soil, ants, beetles, grasshoppers, caterpillars, butterflies, bees, spiders, snails, frogs after rain, and birds like mynas and sunbirds.'),
    p('Living things in a garden depend on each other. Bees and butterflies get nectar and carry pollen between flowers. Earthworms loosen and enrich the soil for plants. Spiders and birds eat insects that would damage plants.'),
    def('Interdependence', 'Living things depending on one another for food, shelter or help.'),
    p('Non-living things are part of the habitat too: soil, water, air, sunlight and stones. Plants need sunlight and water to make food; animals need plants.'),
    keys('A garden is a small habitat on land.', 'Its plants and animals depend on each other.', 'Soil, water, air and sunlight are the non-living parts of a habitat.'),
    remember('Earthworms are called “friends of the farmer” because they loosen and fertilise the soil.'),
    tip('Count the different living things in one square metre of your school garden — you will be surprised.'),
  ],
  examples: [
    ex('How do bees and flowering plants help each other?', ['Bees get nectar (food) from flowers.', 'While feeding, pollen sticks to them and is carried to other flowers.', 'This helps the plants form fruits and seeds.'], 'Bees get food; plants get pollinated.'),
    ex('Separate the living and non-living things in a garden: soil, earthworm, sunlight, rose plant, water, butterfly.', ['Living: earthworm, rose plant, butterfly.', 'Non-living: soil, sunlight, water.'], 'Living: earthworm, rose, butterfly. Non-living: soil, sunlight, water.'),
  ],
  practice: [
    sortT('lnl', 'living', 'non-living', [
      ['Earthworm', true], ['Rose plant', true], ['Butterfly', true], ['Grass', true], ['Snail', true], ['Myna', true],
      ['Soil', false], ['Sunlight', false], ['Stone', false], ['Water', false], ['Air', false],
    ], ['Does it grow, feed, breathe and reproduce?'], 'Plants and animals are living; soil, water, air, sunlight and stones are non-living parts of the habitat.'),
    mcq('garden', 'Think how garden plants and animals help each other.', [
      ['Earthworms help garden plants by…', 'Loosening and enriching the soil', ['Eating flowers', 'Making shade', 'Making nectar'], 'They dig through the soil.', 'Earthworms make tunnels and add manure to soil.'],
      ['Butterflies visit flowers to get…', 'Nectar', ['Water only', 'Soil', 'Wood'], 'A sweet juice.', 'Butterflies feed on nectar.'],
      ['Spiders in a garden help plants by…', 'Catching insects that damage plants', ['Eating leaves', 'Making flowers', 'Watering plants'], 'They spin webs.', 'Spiders eat many insect pests.'],
      ['Which non-living thing do plants need to make food?', 'Sunlight', ['Plastic', 'Iron', 'Glass'], 'It comes from the sky.', 'Plants use sunlight, water and air to make food.'],
      ['Living things depending on one another is called…', 'Interdependence', ['Evaporation', 'Transparency', 'Magnetism'], '"Inter" means between.', 'Interdependence means depending on each other.'],
    ]),
    matchT('help', 'garden living thing to how it helps', [
      ['Bee', 'Carries pollen between flowers'], ['Earthworm', 'Loosens the soil'], ['Spider', 'Eats harmful insects'], ['Tree', 'Gives shade and nesting places'], ['Frog', 'Eats insects'], ['Grass', 'Food for grasshoppers'],
    ], ['What does each one do in the garden?'], 4),
  ],
};

const hab3: OSpec = {
  id: 'ts6.sc.habitat.telangana', title: 'Diversity of habitats in Telangana', prereqs: ['ts6.sc.habitat.homes'],
  intro: [
    h('Forests, hills, rivers and lakes'),
    photo('🦚', 'Peacocks are common in the scrub lands and forests of Telangana.'),
    p('Telangana lies on the Deccan plateau. It has many different habitats: dry deciduous forests (with teak, bamboo, mahua and tendu) in Adilabad, Komaram Bheem, Nirmal and Mulugu; the Nallamala hills in the south; grasslands and scrub; rivers such as the Godavari and Krishna; and thousands of tanks and lakes.'),
    p('Protected areas keep these habitats safe. The Amrabad Tiger Reserve lies in the Nallamala hills; the Kawal Tiger Reserve is in the Nirmal–Mancherial region; Eturnagaram and Pakhal wildlife sanctuaries are in the east; the Pocharam sanctuary in Medak has a lake that attracts many birds.'),
    h('State symbols'),
    keys('State animal: Jinka (spotted deer).', 'State bird: Palapitta (Indian roller).', 'State tree: Jammi chettu.', 'State flower: Tangedu (Tanner’s cassia).'),
    p('Each habitat supports different living things: tigers, leopards, sloth bears, deer and gaurs in forests; blackbuck in open grasslands; fish, turtles, otters and crocodiles (mugger) in rivers; and ducks, storks and pelicans in lakes.'),
    remember('Cutting forests, filling up lakes and polluting rivers destroy habitats, and the animals living there disappear.'),
    tip('Find out which habitat is nearest to your village or town and list three plants and three animals that live there.'),
  ],
  examples: [
    ex('Why do many birds gather at Pocharam lake in winter?', ['A lake gives water, fish, insects and water plants.', 'Its banks and trees give safe places to rest and nest.', 'So it is a good habitat for water birds.'], 'The lake gives food, water and shelter — a rich habitat for birds.'),
    ex('Name the state animal and the state bird of Telangana.', ['The state animal is the Jinka (spotted deer).', 'The state bird is the Palapitta (Indian roller).'], 'Jinka (spotted deer) and Palapitta (Indian roller)'),
  ],
  practice: [
    mcq('ts', 'Recall Telangana’s habitats and symbols.', [
      ['The state animal of Telangana is the…', 'Jinka (spotted deer)', ['Tiger', 'Elephant', 'Lion'], 'It has white spots.', 'The Jinka (spotted deer) is the state animal.'],
      ['The state bird of Telangana is the…', 'Palapitta (Indian roller)', ['Peacock', 'Parrot', 'Crow'], 'It shows bright blue wings in flight.', 'The Palapitta (Indian roller) is the state bird.'],
      ['The Amrabad Tiger Reserve is in the…', 'Nallamala hills', ['Himalayas', 'Thar desert', 'Sundarbans'], 'Southern Telangana.', 'Amrabad Tiger Reserve lies in the Nallamala hills.'],
      ['Which two big rivers flow through Telangana?', 'Godavari and Krishna', ['Ganga and Yamuna', 'Narmada and Tapi', 'Brahmaputra and Teesta'], 'One flows past Bhadrachalam.', 'The Godavari and Krishna are Telangana’s major rivers.'],
      ['The forests of Adilabad are mostly…', 'Dry deciduous forests', ['Snow forests', 'Mangrove forests', 'Deserts'], 'Trees shed leaves in the dry season.', 'They are dry deciduous forests with teak and bamboo.'],
      ['Which action DESTROYS a habitat?', 'Filling up a lake to build houses', ['Planting trees', 'Cleaning a pond', 'Protecting a forest'], 'What happens to the fish and birds?', 'Filling lakes removes the home of many living things.'],
    ]),
    matchT('habitat', 'living thing to a Telangana habitat where it is found', [
      ['Tiger', 'Forests of Amrabad and Kawal'], ['Blackbuck', 'Open grasslands'], ['Mugger crocodile', 'Rivers and big lakes'], ['Pelican', 'Lakes and tanks'], ['Teak tree', 'Dry deciduous forest'], ['Fish', 'Godavari river'],
    ], ['Forest, grassland, river or lake?'], 4),
    tapT('symbols', 'Tap every OFFICIAL state symbol of Telangana.', [
      ['Jinka (spotted deer)', true], ['Palapitta (Indian roller)', true], ['Jammi tree', true], ['Tangedu flower', true],
      ['Lotus', false], ['Tiger', false], ['Peacock', false], ['Mango tree', false],
    ], ['Animal, bird, tree and flower.'], 'Telangana’s state symbols are the Jinka, the Palapitta, the Jammi tree and the Tangedu flower.'),
  ],
};

const ch6: USpec = { id: 'ts6.sc.ch6', subject: 'biology', title: 'Habitat', source: src(6), objectives: [hab1, hab2, hab3] };

// =====================================================================================
// Chapter 7 — Separation of Substances
// =====================================================================================
const sep1: OSpec = {
  id: 'ts6.sc.separation.mixtures', title: 'Mixtures and why we separate them', prereqs: [],
  intro: [
    h('Stones in the rice'),
    photo('🌾', 'Freshly harvested grain still has husk, stalks and small stones mixed with it.'),
    def('Mixture', 'Two or more substances mixed together, where each keeps its own properties. Examples: rice with small stones, sand and water, salt water, mixed sprouts.'),
    p('We separate mixtures for three reasons: to remove harmful or useless things (stones from rice), to get a useful part (butter from curd, salt from sea water), or to sort things (big and small groundnuts).'),
    p('The method we choose depends on how the parts differ: in size, weight, colour, whether they dissolve in water, or whether they are attracted by a magnet.'),
    keys('A mixture has two or more parts that keep their own properties.', 'We separate to remove waste, to get something useful or to sort.', 'The method depends on how the parts differ.'),
    remember('In a mixture, the parts can be in any amount: you can add more salt or more water to salt water.'),
    tip('Before choosing a method, ask: "How are these two things different?"'),
  ],
  examples: [
    ex('Why does Lakshmi’s mother pick stones out of rice before cooking?', ['Stones are useless and could break a tooth.', 'They are bigger and differently coloured, so they can be seen.', 'So she removes them by hand.'], 'To remove harmful, unwanted stones.'),
    ex('Name the difference that helps separate iron pins from sand.', ['Iron pins are attracted by a magnet.', 'Sand is not.'], 'Magnetic property — use a magnet.'),
  ],
  practice: [
    mcq('mix', 'A mixture has parts that keep their own properties.', [
      ['Which of these is a mixture?', 'Sand and water', ['Pure water', 'A gold coin', 'Sugar crystal'], 'Two different things together.', 'Sand and water is a mixture; each keeps its properties.'],
      ['Why do we separate stones from rice?', 'To remove unwanted harmful parts', ['To make rice heavier', 'To colour the rice', 'To make it magnetic'], 'Would you like a stone in your meal?', 'We remove harmful or useless parts.'],
      ['Why is butter separated from curd?', 'To get a useful part', ['To remove poison', 'To make the curd heavier', 'To add colour'], 'Butter is used to make ghee.', 'Sometimes we separate to get a useful component.'],
      ['The method used to separate a mixture depends on…', 'How its parts differ', ['The weather', 'The colour of the container', 'The day of the week'], 'Size, weight, dissolving, magnetism…', 'We use the differences between the parts.'],
      ['Which is NOT a mixture?', 'Distilled water', ['Lemonade', 'Air', 'Soil'], 'It has only one substance.', 'Distilled water is a single pure substance.'],
    ]),
    tp('reason', (r) => {
      const pool: [string, string][] = [
        ['Removing stones from dal', 'To remove harmful or useless parts'], ['Removing husk from grain', 'To remove harmful or useless parts'], ['Taking out iron pins mixed with sand', 'To remove harmful or useless parts'],
        ['Getting salt from sea water', 'To get a useful part'], ['Getting butter from curd', 'To get a useful part'], ['Getting tea water from tea leaves', 'To get a useful part'],
        ['Sorting big and small mangoes', 'To sort things'], ['Separating red and green chillies', 'To sort things'], ['Grading groundnuts by size', 'To sort things'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `Why do we do this? ${m}`, ...choose(r, a, ['To remove harmful or useless parts', 'To get a useful part', 'To sort things'].filter((x) => x !== a)),
        hints: ['Is the separated part thrown away, kept for use, or just put in groups?'],
        mistakes: [{ when: 'wrong', explain: 'Think about what we do with the part we separate out.' }],
        solution: [`${m}: ${a.toLowerCase()}.`],
      };
    }),
    matchT('diff', 'mixture to the difference used to separate it', [
      ['Iron filings and sand', 'Magnetic attraction'], ['Salt and sand', 'Salt dissolves, sand does not'], ['Husk and grain', 'Husk is lighter'], ['Flour and bran', 'Different particle size'], ['Stones and rice', 'Size and colour (seen by eye)'],
    ], ['What property is different between the two parts?'], 4, 2),
  ],
};

const sep2: OSpec = {
  id: 'ts6.sc.separation.dry', title: 'Separating solids: handpicking, threshing, winnowing, sieving, magnet', prereqs: ['ts6.sc.separation.mixtures'],
  intro: [
    h('Methods on the farm and in the kitchen'),
    photo('🧺', 'A winnowing basket (chata) — the wind blows away light husk while heavy grain falls straight down.'),
    def('Handpicking', 'Picking out the unwanted parts by hand, when they are few and easy to see — stones from rice or dal.'),
    def('Threshing', 'Beating harvested stalks (or using animals or a machine) to separate grains from the stalks.'),
    def('Winnowing', 'Dropping a mixture from a height in the wind, so light husk blows away and heavier grain falls in a heap.'),
    def('Sieving', 'Using a sieve (jalleda) with small holes: fine particles pass through and bigger ones stay behind — flour and bran, sand and pebbles at a building site.'),
    def('Magnetic separation', 'Using a magnet to pull out iron pieces from a mixture.'),
    keys('Handpicking: few, big, easy-to-see impurities.', 'Threshing: grains from stalks.', 'Winnowing: light from heavy, using wind.', 'Sieving: small from big particles.', 'Magnet: iron from non-magnetic things.'),
    remember('Order on the farm: harvesting → threshing → winnowing → cleaning by handpicking.'),
    tip('Size difference → sieve. Weight difference → winnow. Iron → magnet.'),
  ],
  examples: [
    ex('A builder has sand mixed with pebbles. How should he separate them?', ['Pebbles are bigger than sand grains.', 'Pass the mixture through a sieve.', 'Sand falls through; pebbles stay behind.'], 'Sieving'),
    ex('After threshing paddy, the farmer stands on a raised place and drops the mixture from a basket. What is this method and how does it work?', ['This is winnowing.', 'Husk is light, so the wind carries it away.', 'Grain is heavy, so it falls straight down in a heap.'], 'Winnowing — the wind separates light husk from heavier grain.'),
  ],
  practice: [
    tp('method', (r) => {
      const pool: [string, string][] = [
        ['Stones from rice', 'Handpicking'], ['Bad grains from dal', 'Handpicking'], ['Grains from harvested paddy stalks', 'Threshing'], ['Grains of jowar from the cut plants', 'Threshing'],
        ['Husk from grain', 'Winnowing'], ['Chaff from wheat', 'Winnowing'], ['Bran from wheat flour', 'Sieving'], ['Pebbles from sand', 'Sieving'],
        ['Iron filings from sand', 'Using a magnet'], ['Iron pins from sawdust', 'Using a magnet'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `Which method is best for separating: ${m}?`, ...choose(r, a, ['Handpicking', 'Threshing', 'Winnowing', 'Sieving', 'Using a magnet'].filter((x) => x !== a)),
        hints: ['How are the two parts different — size, weight, magnetism, or easy to see?'],
        mistakes: [{ when: 'wrong', explain: 'Size → sieving; weight → winnowing; iron → magnet; stalks → threshing; few visible bits → handpicking.' }],
        solution: [`${m}: ${a.toLowerCase()}.`],
      };
    }),
    orderT('farm', [
      ['Put the farm steps in order.', ['Harvesting the crop', 'Threshing to free the grains', 'Winnowing to remove husk', 'Handpicking small stones', 'Storing the clean grain'], 'Grain must be freed from stalks before husk can be blown away.'],
    ], ['What happens right after cutting the crop?']),
    mcq('why', 'Match the method to the difference it uses.', [
      ['Winnowing works because husk is…', 'Lighter than grain', ['Heavier than grain', 'Magnetic', 'Soluble in water'], 'The wind carries it.', 'Light husk is blown away; heavy grain falls.'],
      ['Sieving works when particles differ in…', 'Size', ['Colour only', 'Smell', 'Taste'], 'Small ones pass through holes.', 'A sieve separates by particle size.'],
      ['Handpicking is useful when the unwanted parts are…', 'Few, big and easy to see', ['Very tiny and many', 'Dissolved in water', 'Invisible'], 'You use your eyes and fingers.', 'Handpicking suits a few large visible impurities.'],
      ['Which method uses a magnet?', 'Separating iron filings from sand', ['Separating salt from water', 'Separating husk from grain', 'Separating flour from bran'], 'Only one mixture has iron.', 'A magnet pulls out iron pieces.'],
      ['Threshing separates…', 'Grains from stalks', ['Salt from water', 'Butter from curd', 'Mud from water'], 'It is done right after harvesting.', 'Threshing beats grains off the stalks.'],
    ]),
  ],
};

const sep3: OSpec = {
  id: 'ts6.sc.separation.wet', title: 'Separating with water: sedimentation, decantation, filtration, evaporation', prereqs: ['ts6.sc.separation.dry'],
  intro: [
    h('Making muddy water clear'),
    photo('🪣', 'Muddy water left in a bucket — after some time the mud settles at the bottom.'),
    def('Sedimentation', 'Letting a mixture stand so that heavy, insoluble particles settle at the bottom.'),
    def('Decantation', 'Gently pouring off the clear liquid from the top without disturbing the settled layer.'),
    def('Filtration', 'Passing a liquid through a filter (filter paper, cloth, sand layers) that stops tiny solid particles. The clear liquid that comes through is the filtrate.'),
    def('Evaporation', 'Heating (or leaving in the sun) a solution so the water goes away as vapour and the dissolved solid is left behind.'),
    stepsB('To get salt from a salt–sand mixture: add water and stir — salt dissolves, sand does not.', 'Filter — sand stays on the filter paper.', 'Heat the clear salty filtrate until the water evaporates.', 'Salt crystals are left in the dish.'),
    keys('Sedimentation + decantation: insoluble heavy particles from liquids.', 'Filtration: fine insoluble particles from liquids (tea leaves, mud).', 'Evaporation: a dissolved solid from its solution (salt from sea water).'),
    remember('Tea strained through a strainer is filtration; salt from sea water in salt pans is evaporation.'),
    tip('Insoluble → sediment, decant or filter. Soluble → evaporate.'),
  ],
  examples: [
    ex('How can Imran get clean salt from a mixture of salt and sand?', ['Add water and stir: salt dissolves, sand does not.', 'Filter: sand stays on the paper.', 'Evaporate the filtrate: salt is left behind.'], 'Dissolve → filter → evaporate'),
    ex('Water from a borewell is muddy. Which two methods can clear it at home without a filter?', ['Leave it still in a vessel — mud settles (sedimentation).', 'Pour the clear water slowly into another vessel (decantation).'], 'Sedimentation followed by decantation'),
  ],
  practice: [
    tp('wet', (r) => {
      const pool: [string, string][] = [
        ['Salt from sea water', 'Evaporation'], ['Sugar from sugar solution', 'Evaporation'],
        ['Tea leaves from tea', 'Filtration'], ['Fine mud from water using filter paper', 'Filtration'], ['Chalk powder from water', 'Filtration'],
        ['Clear water from settled mud (pouring off)', 'Decantation'], ['Water from washed rice (pouring off)', 'Decantation'],
        ['Letting sand settle in a bucket of water', 'Sedimentation'], ['Letting muddy river water stand overnight', 'Sedimentation'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `Name the method: ${m}`, ...choose(r, a, ['Sedimentation', 'Decantation', 'Filtration', 'Evaporation'].filter((x) => x !== a)),
        hints: ['Is the solid dissolved or not?', 'Settling, pouring off, straining, or drying up?'],
        mistakes: [{ when: 'wrong', explain: 'Settling = sedimentation; pouring off = decantation; straining = filtration; drying off the water = evaporation.' }],
        solution: [`${m}: ${a.toLowerCase()}.`],
      };
    }),
    orderT('salt', [
      ['Put the steps for getting salt from a salt–sand mixture in order.', ['Add water and stir', 'Filter the mixture', 'Collect the clear filtrate', 'Heat the filtrate', 'Salt is left behind'], 'Salt must be dissolved and the sand removed before the water is evaporated.'],
      ['Put the steps for clearing muddy water in order.', ['Pour muddy water into a vessel', 'Leave it undisturbed', 'Mud settles at the bottom', 'Pour off the clear water gently', 'Filter it through a clean cloth'], 'Settling comes before decanting and filtering.'],
    ], ['What must you do first so the salt or mud can be separated?']),
    mcq('wet-q', 'Soluble or insoluble?', [
      ['Which method separates a dissolved solid from water?', 'Evaporation', ['Sieving', 'Winnowing', 'Handpicking'], 'The water must go away.', 'Evaporating the water leaves the dissolved solid.'],
      ['The clear liquid that passes through filter paper is called the…', 'Filtrate', ['Sediment', 'Husk', 'Residue'], 'It "comes through the filter".', 'Liquid passing through a filter is the filtrate.'],
      ['Why can salt NOT be removed from salt water by filtration?', 'Salt is dissolved and passes through the filter', ['Salt is magnetic', 'Salt is too big', 'Salt floats'], 'Dissolved particles are tiny.', 'Dissolved salt goes through the filter with the water.'],
      ['Decantation is done after…', 'Sedimentation', ['Evaporation', 'Winnowing', 'Threshing'], 'First the solid settles.', 'You pour off the liquid after the solid has settled.'],
      ['Salt pans on the sea coast use…', 'Evaporation by the sun', ['Magnets', 'Winnowing', 'Threshing'], 'The sun dries the water.', 'Sun and wind evaporate sea water and leave salt.'],
    ]),
  ],
};

const ch7: USpec = { id: 'ts6.sc.ch7', subject: 'chemistry', title: 'Separation of Substances', source: src(7), objectives: [sep1, sep2, sep3] };

// =====================================================================================
// Chapter 8 — Fibre to Fabric
// =====================================================================================
const fib1: OSpec = {
  id: 'ts6.sc.fabric.types', title: 'Types of fabrics and fibres', prereqs: [],
  intro: [
    h('What is your shirt made of?'),
    photo('🧦', 'Socks are usually knitted from cotton or wool yarn.'),
    p('Clothes, bedsheets, towels and bags are made of fabrics. Pull a thread out of an old cloth and untwist its end: you see many very thin strands. These are fibres.'),
    def('Fibre', 'A very thin, thread-like strand. Fibres are twisted into yarn, and yarn is made into fabric.'),
    def('Natural fibres', 'Fibres from plants or animals: cotton and jute (plants); silk and wool (animals).'),
    def('Synthetic fibres', 'Fibres made in factories from chemicals: nylon, polyester, acrylic, rayon.'),
    p('Different fabrics suit different uses. Cotton is soft and absorbs sweat — good for summer. Wool keeps us warm in winter. Silk is smooth and shiny — used for sarees. Jute is strong and rough — used for sacks and bags. Polyester dries quickly and does not crease easily.'),
    keys('Fibre → yarn → fabric.', 'Plant fibres: cotton, jute. Animal fibres: wool, silk.', 'Synthetic fibres: nylon, polyester, acrylic.'),
    remember('Wool comes from the hair (fleece) of sheep, goats and some other animals; silk comes from the cocoon of the silkworm.'),
    tip('Cotton clothes are best for Telangana summers because they absorb sweat and let air pass.'),
  ],
  examples: [
    ex('Classify: cotton, silk, polyester, jute, wool, nylon.', ['From plants: cotton, jute.', 'From animals: silk, wool.', 'Made in factories: polyester, nylon.'], 'Plant: cotton, jute; animal: silk, wool; synthetic: polyester, nylon'),
    ex('Why are gunny bags made of jute and not silk?', ['Gunny bags carry heavy loads of grain.', 'Jute is strong, rough and cheap.', 'Silk is smooth, delicate and costly.'], 'Jute is strong and cheap; silk is delicate and costly.'),
  ],
  practice: [
    tp('src', (r) => {
      const pool: [string, string][] = [
        ['Cotton', 'Plant'], ['Jute', 'Plant'], ['Coir (coconut fibre)', 'Plant'],
        ['Wool', 'Animal'], ['Silk', 'Animal'], ['Pashmina', 'Animal'],
        ['Nylon', 'Synthetic (made by people)'], ['Polyester', 'Synthetic (made by people)'], ['Acrylic', 'Synthetic (made by people)'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `Where does ${m} fibre come from?`, ...choose(r, a, ['Plant', 'Animal', 'Synthetic (made by people)'].filter((x) => x !== a)),
        hints: ['Cotton and jute grow; wool and silk come from animals; factory fibres are synthetic.'],
        mistakes: [{ when: 'wrong', explain: 'Recall: plant fibres — cotton, jute, coir; animal — wool, silk; synthetic — nylon, polyester, acrylic.' }],
        solution: [`${m} → ${a.toLowerCase()}.`],
      };
    }),
    mcq('use', 'Match the fabric’s property to its use.', [
      ['Which fabric is best for a hot summer day?', 'Cotton', ['Wool', 'Nylon', 'Leather'], 'It absorbs sweat.', 'Cotton absorbs sweat and lets air through.'],
      ['Gunny bags are made of…', 'Jute', ['Silk', 'Wool', 'Polyester'], 'A strong rough plant fibre.', 'Jute is strong and cheap — ideal for sacks.'],
      ['Silk is obtained from…', 'The cocoon of the silkworm', ['Sheep hair', 'Cotton bolls', 'Jute stems'], 'A caterpillar spins it.', 'Silk threads come from silkworm cocoons.'],
      ['Which is a synthetic fibre?', 'Nylon', ['Cotton', 'Wool', 'Jute'], 'Made in a factory.', 'Nylon is made from chemicals.'],
      ['Thin strands that are twisted to make yarn are called…', 'Fibres', ['Fabrics', 'Looms', 'Bolls'], 'Untwist a thread to see them.', 'Fibres are twisted together into yarn.'],
      ['Wool keeps us warm because…', 'It traps air and keeps body heat in', ['It is shiny', 'It absorbs sunlight only', 'It is thin'], 'Fluffy fibres hold air.', 'Air trapped in wool fibres is a poor conductor of heat.'],
    ]),
    matchT('fabric', 'fabric to a common use', [
      ['Jute', 'Gunny bags'], ['Wool', 'Sweaters'], ['Silk', 'Wedding sarees'], ['Cotton', 'Summer shirts and towels'], ['Nylon', 'Ropes and fishing nets'], ['Coir', 'Doormats'],
    ], ['Think of where you see each one.'], 4),
  ],
};

const fib2: OSpec = {
  id: 'ts6.sc.fabric.making', title: 'How fabrics are made — spinning, weaving and knitting', prereqs: ['ts6.sc.fabric.types'],
  intro: [
    h('From thread to cloth'),
    photo('🪢', 'Yarn is made by twisting fibres together; fabric is made from yarn.'),
    def('Spinning', 'Drawing out fibres and twisting them together to make yarn. Done by hand on a takli or charkha, or by machines in spinning mills.'),
    def('Weaving', 'Making fabric by crossing two sets of yarn at right angles — lengthwise (warp) and crosswise (weft) — on a loom.'),
    def('Knitting', 'Making fabric by forming loops in a single yarn, with needles or machines — sweaters, socks, banians.'),
    p('Telangana is famous for its handlooms. Pochampally ikat sarees (Yadadri Bhuvanagiri district) are dyed in patterns before weaving and have a GI tag. Gadwal and Narayanpet sarees are also well-known handloom weaves, and Siricilla is a big centre of power looms.'),
    stepsB('Fibres are cleaned and combed.', 'Spinning twists them into yarn.', 'Yarn may be dyed.', 'Weaving on a loom or knitting turns the yarn into fabric.'),
    keys('Fibre → (spinning) → yarn → (weaving or knitting) → fabric.', 'Weaving uses two sets of yarn; knitting uses one.', 'Handloom: operated by hand; power loom: run by electricity.'),
    remember('Mahatma Gandhi encouraged people to spin yarn on the charkha and wear khadi.'),
    tip('Pull a thread from a knitted sock — the whole thing can unravel. A woven cloth does not unravel that way.'),
  ],
  examples: [
    ex('Is a bedsheet usually woven or knitted? How do you know?', ['Look closely: threads cross each other at right angles.', 'Two sets of yarn crossing = weaving.'], 'Woven'),
    ex('Put in order: fabric, fibre, yarn. Name the process between each step.', ['Fibre is spun into yarn (spinning).', 'Yarn is woven or knitted into fabric.'], 'Fibre → spinning → yarn → weaving/knitting → fabric'),
  ],
  practice: [
    orderT('fy', [
      ['Put the steps from cotton to cloth in order.', ['Pick cotton bolls', 'Separate seeds from fibre (ginning)', 'Spin the fibre into yarn', 'Weave the yarn on a loom', 'Cotton cloth is ready'], 'Fibre must become yarn before it can become fabric.'],
      ['Put the steps in order.', ['Fibre', 'Spinning', 'Yarn', 'Weaving or knitting', 'Fabric'], 'Spinning turns fibre into yarn; weaving or knitting turns yarn into fabric.'],
    ], ['What do you need before you can weave?']),
    mcq('make', 'Spin, weave or knit?', [
      ['Making yarn from fibres is called…', 'Spinning', ['Weaving', 'Knitting', 'Ginning'], 'A charkha does this.', 'Spinning twists fibres into yarn.'],
      ['Weaving uses…', 'Two sets of yarn crossing each other', ['One single yarn', 'No yarn at all', 'Only plastic'], 'Warp and weft.', 'Two sets of yarns are interlaced on a loom.'],
      ['A sweater is usually made by…', 'Knitting', ['Weaving', 'Ginning', 'Retting'], 'Loops from one yarn.', 'Sweaters are knitted.'],
      ['Pochampally in Telangana is famous for…', 'Ikat handloom sarees', ['Steel factories', 'Tea gardens', 'Silk worms only'], 'Yarn is tie-dyed before weaving.', 'Pochampally ikat sarees have a GI tag.'],
      ['A simple hand device used for spinning is the…', 'Takli', ['Loom', 'Sieve', 'Compass'], 'Also the charkha.', 'Takli and charkha are hand-spinning devices.'],
      ['Siricilla in Telangana is a big centre of…', 'Power looms', ['Coal mines', 'Salt pans', 'Tea estates'], 'Machines run by electricity.', 'Siricilla has thousands of power looms.'],
    ]),
    sortT('wk', 'woven', 'knitted', [
      ['Bedsheet', true], ['Saree', true], ['Towel', true], ['Gunny bag', true], ['Shirt cloth', true],
      ['Sweater', false], ['Socks', false], ['Woollen cap', false], ['Banian (vest)', false],
    ], ['Two crossing yarns → woven; loops of one yarn → knitted.'], 'Sarees, sheets, towels and sacks are woven; sweaters, socks, caps and banians are usually knitted.'),
  ],
};

const fib3: OSpec = {
  id: 'ts6.sc.fabric.natural', title: 'Natural fibres — cotton and jute', prereqs: ['ts6.sc.fabric.making'],
  intro: [
    h('White gold of Telangana'),
    photo('🌿', 'Cotton plants grow well in the black soil of Telangana.'),
    p('Telangana is one of India’s leading cotton-growing states. Cotton grows best in black soil and a warm climate. Its fruits, called cotton bolls, are about the size of a lemon. When the bolls are ripe they burst open, showing fluffy white cotton fibres attached to the seeds.'),
    def('Ginning', 'Separating cotton fibres from the seeds — once by hand combing, now mostly by machines in ginning mills.'),
    p('After ginning, cotton is cleaned, spun into cotton yarn and then woven or knitted.'),
    h('Jute'),
    p('Jute fibre comes from the STEM of the jute plant. It grows in the rainy season mainly in West Bengal, Bihar and Assam. The plants are cut when they flower, and the stems are soaked in water for several days (retting). The stems rot and the fibres can then be peeled off, washed and dried.'),
    def('Retting', 'Soaking jute stems in water so that the soft parts rot and the fibres become loose.'),
    keys('Cotton fibre comes from cotton bolls (around the seeds).', 'Ginning separates fibre from seed.', 'Jute fibre comes from the stem; retting loosens it.', 'Cotton: clothes, towels. Jute: sacks, bags, ropes, mats.'),
    remember('Jute bags are eco-friendly: they rot naturally, unlike plastic bags.'),
    tip('Cotton → boll → ginning. Jute → stem → retting.'),
  ],
  examples: [
    ex('From which part of the plant do we get (a) cotton, (b) jute?', ['Cotton fibres grow around the seeds inside the boll (fruit).', 'Jute fibres are in the stem.'], '(a) fruit/seed of the cotton boll, (b) stem of the jute plant'),
    ex('Why are jute stems soaked in water for days?', ['Soaking makes the soft stem tissues rot.', 'The strong fibres then come away easily.', 'This process is called retting.'], 'Retting loosens the fibres so they can be peeled.'),
  ],
  practice: [
    sortT('cj', 'about cotton', 'about jute', [
      ['Bolls burst open when ripe', true], ['Fibres separated from seeds by ginning', true], ['Grows well in black soil of Telangana', true], ['Used for soft summer clothes', true],
      ['Fibre obtained from the stem', false], ['Stems soaked in water (retting)', false], ['Used to make gunny bags', false], ['Grown mainly in West Bengal', false],
    ], ['Boll and ginning → cotton; stem and retting → jute.'], 'Cotton fibre comes from bolls and is ginned; jute comes from stems and is retted.'),
    mcq('cotton', 'Cotton: boll and ginning. Jute: stem and retting.', [
      ['Cotton fibres are obtained from the…', 'Boll (fruit) of the cotton plant', ['Stem of the cotton plant', 'Root of the cotton plant', 'Cocoon of a worm'], 'They are fluffy and attached to seeds.', 'Cotton fibres grow from seeds inside the boll.'],
      ['Separating cotton fibre from seeds is called…', 'Ginning', ['Retting', 'Weaving', 'Knitting'], 'Done in a mill.', 'Ginning removes seeds from cotton fibre.'],
      ['Jute fibre is obtained from the…', 'Stem', ['Fruit', 'Leaf', 'Root'], 'It is long and runs along the plant.', 'Jute fibres lie in the stem.'],
      ['Soaking jute stems in water to loosen fibres is called…', 'Retting', ['Ginning', 'Spinning', 'Winnowing'], 'The stems rot a little.', 'Retting rots the soft parts and frees the fibres.'],
      ['Which soil is best for growing cotton?', 'Black soil', ['Sandy desert soil', 'Snow', 'Rocky soil'], 'Common in the Deccan.', 'Cotton grows well in moisture-holding black soil.'],
      ['Why are jute bags better for the environment than plastic bags?', 'They rot naturally', ['They never rot', 'They are made of oil', 'They are shiny'], 'What happens when they are thrown away?', 'Jute is biodegradable; plastic stays for hundreds of years.'],
    ]),
    orderT('jute', [
      ['Put the steps for getting jute fibre in order.', ['Cut the jute plants at flowering', 'Soak the stems in water for days', 'Peel the loosened fibres', 'Wash and dry the fibres', 'Make yarn and gunny bags'], 'Retting (soaking) must come before peeling.'],
      ['Put the steps for getting cotton yarn in order.', ['Grow cotton plants', 'Pick the ripe bolls', 'Gin to remove seeds', 'Clean and comb the fibre', 'Spin it into yarn'], 'Ginning comes before spinning.'],
    ], ['Which plant part, which process?']),
  ],
};

const ch8: USpec = { id: 'ts6.sc.ch8', subject: 'chemistry', title: 'Fibre to Fabric', source: src(8), objectives: [fib1, fib2, fib3] };


// =====================================================================================
// Chapter 9 — Plants: Parts and Functions
// =====================================================================================
const pl1: OSpec = {
  id: 'ts6.sc.plant.root', title: 'Parts of a plant and the root', prereqs: [],
  intro: [
    h('Shoot above, root below'),
    photo('🌱', 'A young seedling with its root going down and its shoot going up.'),
    p('A flowering plant has two main systems. The ROOT system grows below the ground. The SHOOT system grows above the ground and has the stem, branches, leaves, flowers, fruits and seeds.'),
    h('Two types of roots'),
    def('Tap root', 'One thick main root with thinner side roots branching from it — mango, neem, bean, mustard, tomato.'),
    def('Fibrous roots', 'A bunch of thin roots of about the same size growing from the base of the stem — grass, paddy, wheat, maize, onion.'),
    h('What do roots do?'),
    keys('Hold the plant firmly in the soil (anchorage).', 'Absorb water and minerals from the soil.', 'Some store food: carrot, radish, beetroot, sweet potato.', 'Some give extra support: the hanging prop roots of the banyan tree.'),
    remember('Plants with tap roots usually have leaves with net-like veins; plants with fibrous roots usually have leaves with parallel veins.'),
    tip('Gently pull out a weed and a grass plant after rain and compare their roots.'),
  ],
  examples: [
    ex('Arjun pulls out a paddy plant and a bean plant. Which has a tap root?', ['Paddy has a bunch of thin, equal roots — fibrous.', 'Bean has one main root with branches — tap root.'], 'The bean plant'),
    ex('Why does a plant wilt if its roots are badly damaged?', ['Roots absorb water from the soil.', 'Without water reaching the leaves, the plant loses its firmness.'], 'Damaged roots cannot absorb enough water.'),
  ],
  practice: [
    sortT('tf', 'a tap root', 'fibrous roots', [
      ['Mango', true], ['Neem', true], ['Bean', true], ['Mustard', true], ['Tomato', true], ['Carrot', true],
      ['Paddy', false], ['Grass', false], ['Wheat', false], ['Maize', false], ['Onion', false],
    ], ['One main root, or a bunch of equal roots?', 'Grasses and cereals have fibrous roots.'], 'Many broad-leaved plants have tap roots; grasses, cereals and onion have fibrous roots.'),
    mcq('root', 'Remember the jobs of roots.', [
      ['Which is NOT a job of roots?', 'Making food using sunlight', ['Absorbing water', 'Holding the plant in the soil', 'Storing food in some plants'], 'Roots live in darkness.', 'Food is made in green leaves using sunlight, not in roots.'],
      ['The banyan tree’s hanging roots that reach the ground give…', 'Extra support', ['Colour', 'Flowers', 'Seeds'], 'They act like pillars.', 'Prop roots support the huge branches.'],
      ['Carrot and radish are roots that…', 'Store food', ['Make seeds', 'Climb walls', 'Float on water'], 'We eat them.', 'These roots are swollen with stored food.'],
      ['The part of the plant above the ground is called the…', 'Shoot system', ['Root system', 'Soil', 'Seed coat'], 'It shoots upwards.', 'Stem, leaves, flowers and fruits make the shoot system.'],
      ['Roots absorb water and…', 'Minerals', ['Sunlight', 'Oxygen from leaves', 'Seeds'], 'Dissolved in soil water.', 'Roots take in water with dissolved minerals.'],
    ]),
    matchT('part', 'plant part to its main job', [
      ['Root', 'Absorbs water and minerals'], ['Stem', 'Holds up leaves and carries water'], ['Leaf', 'Makes food'], ['Flower', 'Forms fruits and seeds'], ['Fruit', 'Protects seeds'], ['Seed', 'Grows into a new plant'],
    ], ['Work from the bottom of the plant to the top.'], 4),
  ],
};

const pl2: OSpec = {
  id: 'ts6.sc.plant.leaf', title: 'The leaf — parts, venation and transpiration', prereqs: ['ts6.sc.plant.root'],
  intro: [
    h('The plant’s kitchen'),
    photo('🍃', 'A green leaf with a midrib down the middle and a network of veins.'),
    def('Parts of a leaf', 'Lamina (the flat green blade), petiole (the stalk joining it to the stem), midrib (the thick central vein) and veins (thin lines spreading from the midrib).'),
    def('Venation', 'The pattern of veins on a leaf.'),
    keys('Reticulate venation: veins form a net — mango, hibiscus, neem, peepal.', 'Parallel venation: veins run side by side — grass, paddy, banana, maize.'),
    p('Green leaves make food for the whole plant using sunlight, water and air. This is why leaves are flat and broad — to catch sunlight.'),
    h('Leaves give out water'),
    def('Transpiration', 'The loss of water vapour from the leaves through tiny pores called stomata.'),
    stepsB('Tie a clear polythene bag around a leafy branch of a potted plant in the morning.', 'Leave it in sunlight.', 'By evening, water droplets appear inside the bag.', 'The water came out of the leaves as vapour and condensed on the bag.'),
    remember('Transpiration helps pull water up from the roots and cools the plant — and adds water vapour to the air for the water cycle.'),
    tip('Hold a leaf up to the light to see its veins clearly, then decide: net or parallel?'),
  ],
  examples: [
    ex('A banana leaf has veins running side by side from the midrib to the edge. Is its venation net or parallel?', ['The veins do not form a network.', 'They run side by side.'], 'Parallel venation'),
    ex('Why do droplets appear inside a polythene bag tied over leaves on a sunny day?', ['Leaves lose water vapour through stomata (transpiration).', 'The vapour touches the cooler bag and condenses into drops.'], 'Because of transpiration from the leaves.'),
  ],
  practice: [
    sortT('vein', 'reticulate (net) venation', 'parallel venation', [
      ['Mango leaf', true], ['Hibiscus leaf', true], ['Neem leaf', true], ['Peepal leaf', true], ['Tulasi leaf', true],
      ['Grass', false], ['Paddy leaf', false], ['Banana leaf', false], ['Maize leaf', false], ['Sugarcane leaf', false],
    ], ['Do the veins form a net or run side by side?'], 'Broad leaves like mango and neem show net venation; grasses, paddy, maize and banana show parallel venation.'),
    matchT('lp', 'leaf part to its description', [
      ['Lamina', 'Flat green blade'], ['Petiole', 'Stalk joining leaf to stem'], ['Midrib', 'Thick central vein'], ['Veins', 'Thin lines carrying water and food'], ['Stomata', 'Tiny pores for gases and water vapour'],
    ], ['Start with the stalk and the blade.'], 4),
    mcq('trans', 'Leaves make food and give out water vapour.', [
      ['Loss of water vapour from leaves is called…', 'Transpiration', ['Germination', 'Condensation in the soil', 'Ginning'], 'It happens through stomata.', 'Transpiration is water loss from leaves.'],
      ['Water vapour leaves through tiny pores called…', 'Stomata', ['Petioles', 'Roots', 'Veins'], 'They are on the leaf surface.', 'Stomata are tiny pores on leaves.'],
      ['Which part of the plant makes food?', 'Green leaf', ['Root', 'Flower', 'Seed coat'], 'It catches sunlight.', 'Green leaves make food using sunlight, water and air.'],
      ['Plants with parallel venation usually have…', 'Fibrous roots', ['Tap roots', 'No roots', 'Prop roots only'], 'Think of grass.', 'Parallel venation usually goes with fibrous roots.'],
      ['The stalk of a leaf is called the…', 'Petiole', ['Lamina', 'Midrib', 'Stomata'], 'It joins the leaf to the stem.', 'The petiole is the leaf stalk.'],
      ['A polythene bag tied over leaves gets droplets inside because of…', 'Transpiration', ['Rain', 'A leak in the bag', 'Melting'], 'Water came from the leaves.', 'Water vapour given out by leaves condenses on the bag.'],
    ]),
  ],
};

const pl3: OSpec = {
  id: 'ts6.sc.plant.stem', title: 'The stem — support and transport', prereqs: ['ts6.sc.plant.root'],
  intro: [
    h('The plant’s pillar and pipeline'),
    photo('🌳', 'The strong trunk of a tree holds up thousands of leaves.'),
    p('The stem holds the branches, leaves, flowers and fruits up towards the light. It also works like a pipeline: water and minerals go UP from the roots to the leaves, and food made in the leaves goes to all other parts.'),
    stepsB('Put a balsam (or celery) stem in water coloured with red ink.', 'Leave it for a few hours.', 'Cut the stem across and look: red spots or lines are seen inside.', 'The coloured water has travelled up through thin tubes in the stem.'),
    def('Nodes and internodes', 'A node is the point on a stem where a leaf grows; the part between two nodes is an internode.'),
    p('Some stems are weak: creepers (pumpkin, watermelon) spread on the ground; climbers (money plant, bean, bitter gourd) climb a support using tendrils or by twining. Some stems store food: potato, ginger, sugarcane, turmeric.'),
    keys('Stem: supports the plant and carries water up and food to all parts.', 'Nodes have leaves and buds.', 'Weak stems: creepers and climbers.', 'Storage stems: potato, ginger, turmeric, sugarcane.'),
    remember('Ginger and turmeric are underground stems, not roots — they have nodes and buds.'),
    tip('A stem has nodes and buds; a root does not.'),
  ],
  examples: [
    ex('Why do petals of a white flower turn blue when its stem stands in blue ink water?', ['The stem carries water upward through thin tubes.', 'The coloured water reaches the flower.', 'The petals take up the colour.'], 'The stem transports the coloured water up to the flower.'),
    ex('Is ginger a root or a stem? Give a reason.', ['Ginger has nodes, and buds grow from them.', 'Roots do not have nodes or buds.'], 'A stem (underground stem)'),
  ],
  practice: [
    mcq('stem', 'Support + transport.', [
      ['Which part carries water from the roots to the leaves?', 'Stem', ['Flower', 'Fruit', 'Seed'], 'It is in the middle.', 'The stem carries water upward.'],
      ['A point on the stem where a leaf grows is a…', 'Node', ['Internode', 'Petiole', 'Root hair'], 'It is a "knot".', 'Leaves and buds grow at nodes.'],
      ['Which plant is a climber?', 'Money plant', ['Mango', 'Neem', 'Coconut'], 'It needs support to go up.', 'Money plant climbs a support.'],
      ['Which plant is a creeper?', 'Pumpkin', ['Banyan', 'Teak', 'Sugarcane'], 'It spreads on the ground.', 'Pumpkin has a weak stem that spreads on the ground.'],
      ['Potato is a…', 'Stem that stores food', ['Root that stores food', 'Leaf', 'Fruit'], 'It has eyes (buds).', 'Potato is an underground stem with buds.'],
      ['A celery stem in red water shows red lines inside because…', 'Water travels up through tubes in the stem', ['The stem was painted', 'The roots make red colour', 'Red light shines on it'], 'Think of a pipeline.', 'Stems carry water upward through thin tubes.'],
    ]),
    sortT('type', 'a strong, upright stem', 'a weak stem (creeper or climber)', [
      ['Mango tree', true], ['Neem tree', true], ['Teak', true], ['Coconut palm', true], ['Sugarcane', true],
      ['Pumpkin', false], ['Watermelon', false], ['Money plant', false], ['Bitter gourd', false], ['Bean climber', false],
    ], ['Can it stand up on its own?'], 'Trees and sugarcane stand upright; creepers and climbers have weak stems.'),
    tapT('storage', 'Tap every STEM (not root) that stores food.', [
      ['Potato', true], ['Ginger', true], ['Turmeric', true], ['Sugarcane', true], ['Onion bulb', true],
      ['Carrot', false], ['Radish', false], ['Beetroot', false], ['Sweet potato', false],
    ], ['Stems have nodes and buds ("eyes").', 'Carrot, radish, beetroot and sweet potato are roots.'], 'Potato, ginger, turmeric, sugarcane and the onion bulb are stems; carrot, radish, beetroot and sweet potato are roots.', 5, 2),
  ],
};

const ch9: USpec = { id: 'ts6.sc.ch9', subject: 'biology', title: 'Plants: Parts and Functions', source: src(9), objectives: [pl1, pl2, pl3] };

// =====================================================================================
// Chapter 10 — Changes Around Us
// =====================================================================================
const chg1: OSpec = {
  id: 'ts6.sc.change.types', title: 'Kinds of changes around us', prereqs: [],
  intro: [
    h('Everything changes'),
    photo('🍌', 'A green banana turns yellow and then brown as it ripens.'),
    p('Changes happen all around us: ice melts, milk becomes curd, a seed grows into a plant, paper burns, iron rusts, day changes into night.'),
    def('Reversible change', 'A change that can be undone, getting back the original substance — melting ice, folding paper, stretching a rubber band, blowing up a balloon, dissolving salt in water.'),
    def('Irreversible change', 'A change that cannot be undone — burning paper, cooking rice, milk to curd, ripening fruit, rusting, growing old.'),
    keys('Slow changes take a long time (growth of a tree, rusting); fast changes happen quickly (burning a matchstick, bursting a cracker).', 'Natural changes happen by themselves (ripening, seasons); man-made changes are caused by people (cooking, building a house).', 'Periodic changes repeat at regular times (day and night, seasons, phases of the moon).'),
    remember('Ask: "Can I get back what I started with?" Yes → reversible; No → irreversible.'),
    tip('A new substance forming (ash, curd, rust) is a sign of an irreversible change.'),
  ],
  examples: [
    ex('Is making a roti from dough a reversible change?', ['Dough is cooked on a hot tawa.', 'The roti cannot be turned back into dough.'], 'No — it is irreversible.'),
    ex('Classify the melting of candle wax as fast or slow, reversible or irreversible.', ['Wax melts within minutes near a flame — fast.', 'Melted wax hardens again on cooling — reversible.'], 'Fast and reversible'),
  ],
  practice: [
    sortT('rev', 'reversible', 'irreversible', [
      ['Melting ice', true], ['Folding a paper', true], ['Stretching a rubber band', true], ['Blowing up a balloon', true], ['Dissolving salt in water', true], ['Melting wax', true],
      ['Burning paper', false], ['Cooking rice', false], ['Milk turning to curd', false], ['Ripening of a mango', false], ['Rusting of iron', false], ['Growing taller', false],
    ], ['Can you get the original thing back?'], 'If the original can be got back, the change is reversible; if a new substance forms, it is irreversible.'),
    sortT('speed', 'a fast change', 'a slow change', [
      ['Bursting a balloon', true], ['Burning a matchstick', true], ['Lightning flash', true], ['Breaking a glass', true],
      ['Growth of a tree', false], ['Rusting of a gate', false], ['Ripening of a jackfruit', false], ['Growth of hair', false], ['Formation of soil', false],
    ], ['Seconds or days and years?'], 'Fast changes happen in moments; slow changes take days, months or years.'),
    mcq('kind', 'Is it periodic, natural or man-made?', [
      ['Day and night following each other is a…', 'Periodic change', ['Man-made change', 'Reversible change in a lab', 'Change by cooking'], 'It repeats regularly.', 'Changes that repeat at fixed times are periodic.'],
      ['Cooking food is a…', 'Man-made change', ['Natural change', 'Periodic change', 'Reversible change'], 'Who does it?', 'People cook food, so it is man-made.'],
      ['Ripening of fruits on a tree is a…', 'Natural change', ['Man-made change', 'Reversible change', 'Fast change'], 'Nobody has to do anything.', 'Ripening happens by itself in nature.'],
      ['Which is a sign of an irreversible change?', 'A new substance forms', ['The shape changes slightly', 'It is folded', 'It is stretched'], 'Ash, rust, curd…', 'New substances cannot easily be turned back.'],
      ['Phases of the moon are an example of a…', 'Periodic change', ['Man-made change', 'Irreversible change', 'Change by heating'], 'Full moon comes about every month.', 'They repeat in a regular cycle.'],
    ]),
  ],
};

const chg2: OSpec = {
  id: 'ts6.sc.change.curd', title: 'Milk changing into curd', prereqs: ['ts6.sc.change.types'],
  intro: [
    h('A change made by tiny helpers'),
    photo('🥛', 'Warm milk with a spoon of curd becomes thick curd by morning.'),
    p('At home, a spoon of old curd is added to lukewarm milk in the evening. By next morning the milk has become thick, sour curd. How?'),
    p('Curd contains tiny living things called bacteria (Lactobacillus). When curd is added to warm milk, these bacteria multiply quickly and change the milk sugar into an acid. The acid makes the milk thick and sour — curd.'),
    def('Starter (thodu)', 'The small amount of old curd added to milk. It supplies the bacteria that turn milk into curd.'),
    keys('Milk → curd is caused by bacteria.', 'Warmth helps: curd sets faster in summer than in winter.', 'Very hot or cold milk does not set well — hot milk kills the bacteria, cold milk slows them down.', 'Milk → curd is an irreversible change.'),
    remember('Curd cannot be turned back into milk — a new substance has formed.'),
    tip('In winter, keep the curd vessel in a warm place (wrapped in a cloth) so it sets well.'),
  ],
  examples: [
    ex('Sita added curd to milk straight from the refrigerator. Next morning it had not set. Why?', ['Bacteria grow slowly in the cold.', 'So they could not change the milk in time.'], 'The milk was too cold for the bacteria to work quickly.'),
    ex('Is milk turning into curd reversible? Explain.', ['Curd is a new substance — thicker and sour.', 'No method at home can turn it back into milk.'], 'No — it is an irreversible change.'),
  ],
  practice: [
    mcq('curd', 'Bacteria + warmth turn milk into curd.', [
      ['What turns milk into curd?', 'Bacteria in the added curd', ['Sunlight alone', 'Salt', 'A magnet'], 'Tiny living helpers.', 'Lactobacillus bacteria change milk into curd.'],
      ['Milk sets into curd fastest when it is…', 'Lukewarm', ['Boiling hot', 'Ice-cold', 'Frozen'], 'Bacteria like gentle warmth.', 'Lukewarm milk is best for the bacteria to multiply.'],
      ['Curd sets faster in…', 'Summer', ['Winter', 'Neither — it is the same', 'Only at night in winter'], 'Which season is warmer?', 'Warmth makes bacteria grow faster.'],
      ['Milk turning into curd is a…', 'Irreversible change', ['Reversible change', 'Periodic change', 'Change of state only'], 'Can curd become milk again?', 'A new substance forms and cannot go back.'],
      ['Why is a little old curd added to milk?', 'It supplies the bacteria needed', ['It adds colour', 'It cools the milk', 'It makes milk magnetic'], 'It is called the starter.', 'The starter curd contains the bacteria.'],
      ['Why does very hot milk not set into curd?', 'The heat kills the bacteria', ['Hot milk is too sweet', 'Hot milk is solid', 'Hot milk has no water'], 'Bacteria are living things.', 'Too much heat kills the bacteria.'],
    ]),
    orderT('make', [
      ['Put the steps for making curd at home in order.', ['Boil the milk', 'Let it cool until lukewarm', 'Add a spoon of curd and stir', 'Cover and keep it in a warm place', 'Curd is ready after some hours'], 'Milk is boiled first, but bacteria are added only after it cools to lukewarm.'],
    ], ['Can the bacteria survive in boiling milk?']),
    tapT('help', 'Tap every condition that HELPS milk set into curd.', [
      ['Adding a little old curd', true], ['Lukewarm milk', true], ['Keeping it in a warm place', true], ['Covering the vessel', true],
      ['Keeping it in the freezer', false], ['Adding curd to boiling milk', false], ['Stirring it all night', false],
    ], ['Bacteria need gentle warmth and time without disturbance.'], 'Starter curd, warmth and rest help the bacteria; cold, boiling heat and constant stirring do not.'),
  ],
};

const chg3: OSpec = {
  id: 'ts6.sc.change.seasons', title: 'Changing seasons', prereqs: ['ts6.sc.change.types'],
  intro: [
    h('Summer, rains and winter'),
    photo('⛈️', 'Thunderclouds in June announce the arrival of the monsoon.'),
    p('In Telangana we feel three main seasons: SUMMER (March to early June) is hot and dry; the RAINY season (June to September) brings the south-west monsoon; WINTER (November to February) is cool and dry. October is a short change-over time.'),
    def('Seasonal (periodic) change', 'A change that comes back at about the same time every year.'),
    keys('Plants: many trees shed leaves in summer and get new leaves before or with the rains; neem and mango flower in early summer.', 'Animals: frogs appear in the rainy season; many birds migrate to our lakes in winter.', 'People: cotton clothes in summer, woollens in winter, umbrellas in the rains.', 'Farming: kharif crops (paddy, cotton, maize) are sown with the monsoon; rabi crops (Bengal gram, groundnut, wheat in some areas) are grown in winter.'),
    p('Festivals also follow the seasons: Ugadi welcomes the new year in spring, Bonalu is celebrated in Ashadam (July–August), Bathukamma with flowers after the rains, and Sankranti marks the winter harvest.'),
    remember('Seasons are periodic changes: they repeat every year.'),
    tip('Keep a "season diary" — note the weather, the clothes you wear and the trees around you once a month.'),
  ],
  examples: [
    ex('Why do farmers in Telangana sow paddy and cotton in June–July?', ['Crops need a lot of water to start growing.', 'The monsoon brings rain from June.', 'So these kharif crops are sown with the rains.'], 'Because the monsoon rains begin then.'),
    ex('Name two changes you see in people’s lives between summer and winter.', ['Clothing: cotton in summer, woollens in winter.', 'Food and drink: buttermilk and cool drinks in summer, hot food in winter.'], 'Clothing and food habits change.'),
  ],
  practice: [
    tp('season', (r) => {
      const pool: [string, string][] = [
        ['Hot, dry days and loo-like winds', 'Summer'], ['Neem and mango trees flowering', 'Summer'], ['Wearing cotton clothes and drinking buttermilk', 'Summer'],
        ['Frogs croaking in the fields', 'Rainy season'], ['Sowing paddy and cotton', 'Rainy season'], ['Using umbrellas and raincoats', 'Rainy season'],
        ['Wearing sweaters in the early morning', 'Winter'], ['Migratory birds visiting lakes', 'Winter'], ['Sankranti harvest festival', 'Winter'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `In Telangana, in which season do you usually notice: ${m}?`, ...choose(r, a, ['Summer', 'Rainy season', 'Winter'].filter((x) => x !== a)),
        hints: ['Summer: March–early June; rainy: June–September; winter: November–February.'],
        mistakes: [{ when: 'wrong', explain: 'Think about the weather when this happens.' }],
        solution: [`${m} → ${a.toLowerCase()}.`],
      };
    }),
    orderT('year', [
      ['Starting from March, put the seasons of Telangana in order.', ['Summer', 'Rainy season', 'Winter'], 'Hot months come first, then the monsoon, then the cool months.'],
      ['Put these months in calendar order.', ['January (winter)', 'April (summer)', 'July (rainy season)', 'December (winter again)'], 'Seasons repeat every year — they are periodic.'],
    ], ['Which season comes just before the monsoon?']),
    mcq('seasons-q', 'Seasons are periodic changes.', [
      ['Why are seasons called periodic changes?', 'They repeat every year', ['They never repeat', 'People cause them', 'They are irreversible'], 'Think of next year’s summer.', 'Seasons come back regularly every year.'],
      ['Kharif crops like paddy are sown in…', 'The rainy season', ['Peak summer', 'Winter', 'Any month without water'], 'They need lots of water.', 'Kharif crops are sown with the monsoon.'],
      ['Which months are the rainy season in Telangana?', 'June to September', ['December to February', 'March to May', 'Only October'], 'The south-west monsoon.', 'The monsoon brings rain from June to September.'],
      ['Which festival is celebrated with flower stacks after the rains?', 'Bathukamma', ['Sankranti', 'Holi', 'Diwali'], 'Women sing and dance around it.', 'Bathukamma uses seasonal flowers like tangedu and gunugu.'],
      ['Many birds migrate to Telangana lakes in…', 'Winter', ['Summer', 'The rainy season', 'Never'], 'They escape colder places.', 'Migratory birds arrive in winter.'],
    ]),
  ],
};

const ch10: USpec = { id: 'ts6.sc.ch10', subject: 'chemistry', title: 'Changes Around Us', source: src(10), objectives: [chg1, chg2, chg3] };

// =====================================================================================
// Chapter 11 — Water in Our Life
// =====================================================================================
const wat1: OSpec = {
  id: 'ts6.sc.water.measure', title: 'Measuring the volume of water', prereqs: [],
  intro: [
    h('How much water?'),
    photo('🧴', 'A one-litre water bottle — a handy measure of volume.'),
    def('Volume', 'The amount of space something takes up. For liquids we measure it in litres (L) and millilitres (mL).'),
    p('1 litre = 1000 millilitres. A big water bottle holds 1 L; a small medicine cup holds 5 mL or 10 mL; a bucket holds about 15–20 L.'),
    p('In the laboratory we use a measuring cylinder: a tall glass or plastic tube marked in mL. The water surface curves slightly. Read the mark at the BOTTOM of the curve, keeping your eye level with the surface.'),
    stepsB('Keep the measuring cylinder on a flat table.', 'Pour water in slowly.', 'Bend down so your eye is level with the water surface.', 'Read the mark at the bottom of the curved surface.'),
    xp({
      title: 'What if? How much water does a family use?', formula: 'Total water = people × water per person',
      res: ['W', 'Water used by the family per day', 'L', 'n * w', 0],
      vars: [['n', 'People in the family', '', 1, 10, 1, 4], ['w', 'Water used by one person per day', 'L', 20, 150, 5, 50]],
      notes: [['n', 'More people means more water is needed each day.', 'Fewer people use less water in all.'], ['w', 'If each person wastes water, the total goes up quickly.', 'Saving even a few litres each adds up to a big saving for the family.']],
      mistakes: [['Adding people and litres', 'Each person uses w litres, so multiply: n × w.']],
      real: 'Closing the tap while brushing can save several litres per person every day — multiply that by everyone in your house.',
    }),
    keys('1 L = 1000 mL.', 'Use a measuring cylinder for accurate volume.', 'Read at the bottom of the curved surface with your eye level.'),
    remember('To change litres to millilitres, multiply by 1000. To change millilitres to litres, divide by 1000.'),
    tip('Two 500 mL bottles together hold exactly 1 litre.'),
  ],
  examples: [
    ex('How many millilitres are there in 3 L?', ['1 L = 1000 mL', '3 × 1000 = 3000'], '3000 mL'),
    ex('A family of 5 people each uses 40 L of water a day. How much water does the family use in a day?', ['Total = people × water per person', '5 × 40 = 200'], '200 L'),
  ],
  practice: [
    tp('l2ml', (r) => {
      const l = r.pick([1, 2, 3, 4, 5, 1.5, 2.5, 0.5, 0.25, 0.75]);
      return numQ(`How many millilitres are there in ${l} L?`, l * 1000, 'mL',
        ['1 L = 1000 mL.', 'Multiply the litres by 1000.'],
        [`${l} × 1000 = ${l * 1000} mL`],
        [{ when: String(l / 1000), explain: 'You divided. Going from litres to the smaller unit mL, the number gets bigger — multiply by 1000.' }]);
    }),
    tp('ml2l', (r) => {
      const ml = r.pick([2000, 3000, 500, 250, 1500, 4500, 750, 5000]);
      return numQ(`A jug holds ${ml} mL of water. How many litres is that?`, ml / 1000, 'L',
        ['1000 mL make 1 L.', 'Divide the millilitres by 1000.'],
        [`${ml} ÷ 1000 = ${ml / 1000} L`],
        [{ when: String(ml * 1000), explain: 'You multiplied. Going from mL to the bigger unit L, the number gets smaller — divide by 1000.' }]);
    }),
    tp('family', (r) => {
      const n = r.int(2, 8), w = r.pick([20, 30, 40, 45, 50, 60, 70]);
      const name = who(r);
      return numQ(`${name}’s family has ${n} people. Each person uses about ${w} L of water a day. How much water does the family use in one day?`, n * w, 'L',
        ['Each person uses the same amount.', 'Multiply people × litres per person.'],
        [`${n} × ${w} = ${n * w} L`],
        [{ when: String(n + w), explain: 'You added. Each of the people uses that many litres, so multiply.' }]);
    }, 2),
    mcq('read', 'Read at the bottom of the curve, eye level.', [
      ['Which instrument is used to measure the volume of a liquid in the laboratory?', 'Measuring cylinder', ['Thermometer', 'Ruler', 'Compass'], 'A tall marked tube.', 'A measuring cylinder is marked in mL.'],
      ['While reading a measuring cylinder, your eye should be…', 'Level with the water surface', ['Above the cylinder', 'Below the table', 'Closed'], 'Looking from above or below gives a wrong reading.', 'Keep your eye level with the surface to avoid error.'],
      ['The water surface in a cylinder is curved. Read the mark at its…', 'Bottom', ['Top edge', 'Side', 'Any point'], 'The lowest point of the curve.', 'We read at the bottom of the curved surface.'],
      ['How many 250 mL glasses can be filled from 1 L?', '4', ['2', '10', '25'], '1 L = 1000 mL.', '1000 ÷ 250 = 4 glasses.'],
      ['Which unit is best for the volume of medicine in a spoon?', 'Millilitre (mL)', ['Litre (L)', 'Kilogram (kg)', 'Metre (m)'], 'It is a small amount.', 'Small volumes are measured in mL.'],
    ]),
  ],
};

const wat2: OSpec = {
  id: 'ts6.sc.water.sources', title: 'Sources of water and water on earth', prereqs: ['ts6.sc.water.measure'],
  intro: [
    h('Where does our water come from?'),
    photo('🏞️', 'A river and its tanks supply water to towns and fields.'),
    p('Rain is the main source of all fresh water. Rainwater fills rivers, lakes, ponds and tanks (surface water) and soaks into the ground (groundwater). We take groundwater out through open wells, borewells and hand pumps.'),
    p('In Telangana, the Godavari and Krishna rivers and thousands of village tanks (cheruvulu) are important sources. Mission Kakatiya restores old tanks so they hold more rainwater, and Mission Bhagiratha brings treated drinking water through pipes to homes.'),
    h('Water on earth'),
    p('About three-quarters of the earth’s surface is covered with water, but nearly all of it (about 97 out of every 100 parts) is salty sea water. Only about 3 parts in 100 are fresh water — and most of that is frozen in ice caps and glaciers. Less than 1 part in 100 is fresh water we can easily use.'),
    keys('Rain is the main source of fresh water.', 'Surface water: rivers, lakes, tanks. Groundwater: wells, borewells.', 'About 97% of earth’s water is salty; only about 3% is fresh, and most of that is ice.'),
    remember('Even though our planet looks blue, usable fresh water is very scarce — every drop must be saved.'),
    tip('Imagine all the earth’s water in 100 buckets: 97 are salty, 2 are frozen, and only about 1 is fresh water we can use.'),
  ],
  examples: [
    ex('If all the water on earth is shown as 100 litres, about how many litres would be fresh water?', ['About 97 out of 100 parts are salty.', '100 − 97 = 3'], 'About 3 litres'),
    ex('Why does a village well become dry in summer when there was little rain?', ['Wells take water from groundwater.', 'Groundwater is filled up by rain soaking into the soil.', 'Little rain means little refilling.'], 'Because groundwater was not recharged by enough rain.'),
  ],
  practice: [
    mcq('src', 'Rain fills both surface water and groundwater.', [
      ['The main source of all fresh water is…', 'Rain', ['The sea', 'Ice factories', 'Bottles'], 'It falls from clouds.', 'Rain fills rivers, lakes and groundwater.'],
      ['Water from a borewell is…', 'Groundwater', ['Surface water', 'Sea water', 'Rainwater in clouds'], 'It is pumped up from below.', 'Borewells draw groundwater.'],
      ['About how much of the earth’s water is salty sea water?', '97%', ['3%', '50%', '10%'], 'Almost all of it.', 'About 97% is in the seas and oceans.'],
      ['Most of the earth’s fresh water is…', 'Frozen in ice and glaciers', ['In rivers', 'In village tanks', 'In bottles'], 'Think of the poles.', 'Ice caps and glaciers hold most fresh water.'],
      ['Mission Bhagiratha in Telangana provides…', 'Treated drinking water to homes through pipes', ['Electricity', 'Free bicycles', 'Seeds'], 'Named after the legend who brought the Ganga down.', 'It supplies safe drinking water by pipeline.'],
      ['Mission Kakatiya restores old…', 'Village tanks', ['Railway lines', 'Schools', 'Factories'], 'Cheruvulu built centuries ago.', 'It desilts and repairs tanks to store more rainwater.'],
    ]),
    sortT('sg', 'surface water', 'groundwater', [
      ['River', true], ['Lake', true], ['Village tank', true], ['Pond', true], ['Reservoir behind a dam', true],
      ['Borewell', false], ['Open well', false], ['Hand pump', false], ['Spring from the ground', false],
    ], ['Is the water on top of the land, or under it?'], 'Rivers, lakes, ponds and tanks are surface water; wells, borewells and hand pumps draw groundwater.'),
    tp('fresh', (r) => {
      const total = r.pick([100, 200, 500, 1000, 50, 300]);
      return numQ(`Imagine all the water on earth is ${total} buckets. About 97 out of every 100 buckets are salty. About how many buckets are fresh water?`, total * 3 / 100, undefined,
        ['Fresh water is about 3 out of every 100.', `Find 3/100 of ${total}.`],
        [`Fresh = 3 out of 100 → ${total} × 3 ÷ 100 = ${total * 3 / 100}`],
        [{ when: String(total * 97 / 100), explain: 'That is the salty part. Fresh water is the remaining 3 out of 100.' }]);
    }, 2),
  ],
};

const wat3: OSpec = {
  id: 'ts6.sc.water.safe', title: 'Safe drinking water, droughts and floods', prereqs: ['ts6.sc.water.sources'],
  intro: [
    h('From the lake to your tap'),
    photo('💧', 'Clean water from a tap reaches us after many steps of treatment.'),
    p('Water from rivers and lakes may look clean but can carry mud, germs and dirt. Drinking it can cause diseases like diarrhoea, cholera and typhoid. So water is treated before it is supplied.'),
    stepsB('Water is pumped from a river or reservoir into big tanks.', 'Sedimentation: it is left to stand (often with alum) so mud settles.', 'Filtration: it passes through layers of sand and gravel that trap fine dirt.', 'Disinfection: chlorine (or bleaching powder) is added to kill germs.', 'Storage and supply: clean water is stored in overhead tanks and sent through pipes.'),
    p('At home we can make water safer by boiling it, filtering it through a clean cloth or a water filter, and storing it in a clean covered vessel.'),
    h('Too little and too much'),
    def('Drought', 'A long period with little or no rain. Wells and tanks dry up, crops fail and animals suffer.'),
    def('Flood', 'Too much water from very heavy rain, when rivers and tanks overflow and water covers land, homes and fields.'),
    keys('Treatment: sedimentation → filtration → chlorination → supply.', 'At home: boil, filter, cover.', 'Droughts: too little rain. Floods: too much rain.', 'Save water: rainwater harvesting, fixing leaks, drip irrigation.'),
    remember('Rainwater harvesting — collecting rooftop rainwater into pits or tanks — helps groundwater and protects against drought.'),
    tip('If water looks clear, it can still contain germs — boil it when in doubt.'),
  ],
  examples: [
    ex('Why is chlorine added to water at the treatment plant?', ['Sedimentation and filtration remove dirt but not all germs.', 'Chlorine kills germs.'], 'To kill disease-causing germs.'),
    ex('Give two ways a village can prepare for drought.', ['Store rainwater in tanks and harvesting pits during the monsoon.', 'Use water carefully, e.g. drip irrigation in fields.'], 'Rainwater harvesting and careful use (drip irrigation)'),
  ],
  practice: [
    orderT('treat', [
      ['Put the stages of treating drinking water in order.', ['Pump water from the reservoir', 'Let mud settle (sedimentation)', 'Pass through sand and gravel (filtration)', 'Add chlorine (disinfection)', 'Store and supply through pipes'], 'Dirt is removed first, then germs are killed, then water is supplied.'],
      ['Put the steps for making water safe at home in order.', ['Let the water stand so mud settles', 'Pour off and filter through a clean cloth', 'Boil the water', 'Cool it in a clean covered vessel', 'Drink using a clean ladle'], 'Clear the water first, then boil, then keep it covered.'],
    ], ['What must be removed first — mud or germs?']),
    mcq('safe', 'Dirt is removed by settling and filtering; germs by chlorine or boiling.', [
      ['Which step kills germs in water?', 'Adding chlorine', ['Sedimentation', 'Pumping', 'Storing in tanks'], 'A chemical is used.', 'Chlorine disinfects water.'],
      ['Boiling water at home makes it safe because…', 'Heat kills germs', ['It adds minerals', 'It makes water cold', 'It removes the vessel'], 'Germs cannot survive high heat.', 'Boiling kills most germs.'],
      ['A long time with little or no rain is called a…', 'Drought', ['Flood', 'Cyclone', 'Monsoon'], 'Wells dry up.', 'Drought means water shortage due to lack of rain.'],
      ['When rivers overflow after very heavy rain, it is a…', 'Flood', ['Drought', 'Famine of salt', 'Eclipse'], 'Too much water.', 'Floods happen when there is too much water.'],
      ['Which disease spreads through unsafe drinking water?', 'Cholera', ['Fracture', 'Short sight', 'Sunburn'], 'It causes severe diarrhoea.', 'Cholera spreads through contaminated water.'],
      ['Collecting rooftop rainwater in a pit is called…', 'Rainwater harvesting', ['Winnowing', 'Threshing', 'Ginning'], 'Harvesting the rain.', 'Rainwater harvesting recharges groundwater.'],
    ]),
    sortT('df', 'a cause or effect of drought', 'a cause or effect of floods', [
      ['Monsoon fails for a season', true], ['Wells and borewells dry up', true], ['Cracks in the dry fields', true], ['Cattle lack drinking water', true],
      ['Rivers overflow their banks', false], ['Very heavy rain for many days', false], ['Low-lying houses under water', false], ['Roads and bridges washed away', false],
    ], ['Too little water or too much water?'], 'Droughts come from too little rain; floods from too much rain.'),
  ],
};

const ch11: USpec = { id: 'ts6.sc.ch11', subject: 'chemistry', title: 'Water in Our Life', source: src(11), objectives: [wat1, wat2, wat3] };

// =====================================================================================
// Chapter 12 — Simple Electric Circuits
// =====================================================================================
const el1: OSpec = {
  id: 'ts6.sc.electric.circuit', title: 'Cell, bulb, switch and the torch', prereqs: [],
  intro: [
    h('Making a bulb glow'),
    photo('🔦', 'A torch has cells, a switch, a bulb and a shiny reflector.'),
    def('Electric cell', 'A source of electricity. It has two terminals: the positive (+) terminal is the small metal cap on top, and the negative (−) terminal is the flat metal base.'),
    def('Bulb', 'A glass globe with a thin coiled wire called the filament inside. The filament is joined to two terminals on the base. When electricity flows through the filament, it becomes very hot and glows.'),
    def('Electric circuit', 'A complete, unbroken path from the + terminal of the cell, through wires and the bulb, back to the − terminal. Electricity flows only in a closed (complete) circuit.'),
    def('Switch', 'A device that opens (breaks) or closes (completes) a circuit. ON = closed circuit, bulb glows; OFF = open circuit, bulb does not glow.'),
    p('A torch is a simple circuit: two or more cells are placed one after another (+ of one touching − of the next), a sliding switch connects them to a small bulb, and a curved shiny reflector sends the light forward as a beam.'),
    xp({
      title: 'What if? Add more cells to a torch', formula: 'Total voltage = 1.5 V × number of cells',
      res: ['V', 'Total voltage', 'V', '1.5 * n', 1],
      vars: [['n', 'Number of cells in a row (+ to −)', '', 1, 4, 1, 2]],
      notes: [['n', 'Each extra cell adds 1.5 V, so the bulb gets a bigger push and glows brighter (too many can fuse a small bulb).', 'Fewer cells give a smaller push, so the bulb glows dimmer.']],
      mistakes: [['Joining + to + when adding cells', 'Cells must be joined + to − (one after another). Wrong way round, they cancel each other.']],
      real: 'A torch with 2 cells uses 3 V; a torch with 3 cells uses 4.5 V and needs a bulb made for that voltage.',
    }),
    keys('Electricity flows only in a closed circuit.', 'A bulb glows when current flows through its filament.', 'A switch opens or closes the circuit.', 'In a torch, cells are joined + to −.'),
    remember('If the filament breaks, the circuit is broken and the bulb is “fused” — it will not glow.'),
    tip('Never experiment with the electricity from wall sockets. It can kill. Use only cells.'),
  ],
  examples: [
    ex('Kiran joins a wire from the + terminal of a cell to one bulb terminal, but leaves the other bulb terminal unconnected. Will the bulb glow?', ['Electricity needs a complete path back to the − terminal.', 'The path is broken at the second bulb terminal.', 'This is an open circuit.'], 'No — the circuit is open.'),
    ex('A torch uses 3 cells of 1.5 V each joined correctly. What is the total voltage?', ['Cells joined + to − add up.', '3 × 1.5 = 4.5'], '4.5 V'),
  ],
  practice: [
    mcq('circ', 'A complete path is needed.', [
      ['The bulb glows only when the circuit is…', 'Closed (complete)', ['Open (broken)', 'Wet', 'Painted'], 'Electricity needs a full loop.', 'Current flows only through a complete circuit.'],
      ['The thin coiled wire inside a bulb is the…', 'Filament', ['Terminal', 'Switch', 'Reflector'], 'It glows when hot.', 'The filament glows when current flows through it.'],
      ['The metal cap on top of a cell is its…', 'Positive (+) terminal', ['Negative (−) terminal', 'Filament', 'Switch'], 'Look for the + sign.', 'The small cap is the positive terminal.'],
      ['What does a switch do?', 'Opens or closes the circuit', ['Makes electricity', 'Stores light', 'Makes the bulb hotter always'], 'ON and OFF.', 'A switch completes or breaks the circuit.'],
      ['A bulb with a broken filament is said to be…', 'Fused', ['Charged', 'Switched on', 'Magnetic'], 'It will not glow any more.', 'A broken filament breaks the circuit.'],
      ['What is the job of the shiny reflector in a torch?', 'To send the light forward as a beam', ['To make electricity', 'To hold the cells', 'To act as a switch'], 'It is like a curved mirror.', 'The reflector directs the light forward.'],
    ]),
    tp('volts', (r) => {
      const n = r.int(1, 6);
      return numQ(`${n} cells of 1.5 V each are joined + to − in a torch. What is the total voltage?`, rd(1.5 * n, 1), 'V',
        ['Cells joined + to − add their voltages.', 'Multiply 1.5 V by the number of cells.'],
        [`${n} × 1.5 V = ${rd(1.5 * n, 1)} V`],
        [{ when: '1.5', explain: 'That is one cell. Cells in a row add their voltages.' }]);
    }),
    orderT('path', [
      ['Follow the path of electricity in a torch circuit, starting at the cell.', ['+ terminal of the cell', 'Wire to the switch', 'Switch (ON)', 'Filament of the bulb', 'Back to the − terminal'], 'Electricity goes out from + and must come back to − through a closed path.'],
      ['Put the steps for making a bulb glow in order.', ['Take a cell, a bulb and two wires', 'Join one wire from + terminal to one bulb terminal', 'Join the other wire from the other bulb terminal', 'Touch it to the − terminal', 'The bulb glows'], 'The loop is complete only when the last wire touches the − terminal.'],
    ], ['Start at the + terminal.']),
  ],
};

const el2: OSpec = {
  id: 'ts6.sc.electric.conductors', title: 'Conductors and insulators', prereqs: ['ts6.sc.electric.circuit'],
  intro: [
    h('Which materials let electricity pass?'),
    photo('🔩', 'Metal objects like nails and screws let electricity pass through them.'),
    stepsB('Make a circuit with a cell, a bulb and two wires, leaving a gap between two wire ends.', 'Put different objects across the gap: a key, a coin, an eraser, a pencil, a plastic scale, a steel spoon.', 'If the bulb glows, the object lets electricity pass.', 'Make two lists.'),
    def('Conductor', 'A material that allows electricity to pass through it — metals like copper, aluminium, iron, silver; also graphite (pencil lead), and impure water.'),
    def('Insulator', 'A material that does not allow electricity to pass — plastic, rubber, wood, glass, paper, cloth, dry air.'),
    p('Electric wires have a copper or aluminium core (conductor) covered with plastic (insulator). Electricians use screwdrivers and pliers with plastic or rubber handles. Switches are covered with plastic.'),
    keys('Metals are good conductors.', 'Plastic, rubber, wood and glass are insulators.', 'Wires: conductor inside, insulator outside.', 'Our body conducts electricity — so electricity from sockets is dangerous.'),
    remember('Never touch switches with wet hands: water on the skin helps electricity pass into the body.'),
    tip('The pencil "lead" is graphite, which conducts. The wooden case does not.'),
  ],
  examples: [
    ex('Diya tests a steel spoon and a plastic spoon in her circuit. Which one makes the bulb glow?', ['Steel is a metal — a conductor.', 'Plastic is an insulator.'], 'The steel spoon'),
    ex('Why are electric wires covered with plastic?', ['The copper inside carries electricity.', 'Plastic does not conduct electricity.', 'So the covering protects us from shocks and stops wires touching each other.'], 'Plastic is an insulator that protects us.'),
  ],
  practice: [
    sortT('ci', 'a conductor', 'an insulator', [
      ['Copper wire', true], ['Iron nail', true], ['Aluminium foil', true], ['Steel spoon', true], ['Silver ring', true], ['Pencil lead (graphite)', true], ['Brass key', true],
      ['Plastic scale', false], ['Rubber eraser', false], ['Wooden stick', false], ['Glass marble', false], ['Paper', false], ['Cotton thread', false],
    ], ['Is it a metal (or graphite)?'], 'Metals and graphite conduct electricity; plastic, rubber, wood, glass, paper and cloth are insulators.'),
    mcq('safe', 'Conductors carry electricity; insulators protect us.', [
      ['Why do electricians use pliers with rubber handles?', 'Rubber is an insulator', ['Rubber is a conductor', 'Rubber is shiny', 'Rubber is magnetic'], 'It stops electricity reaching the hand.', 'Rubber does not conduct electricity.'],
      ['The metal inside electric wires is usually…', 'Copper', ['Plastic', 'Rubber', 'Glass'], 'A good conductor.', 'Copper is a very good conductor.'],
      ['Why should you not touch a switch with wet hands?', 'Water helps electricity pass into your body', ['Water makes the switch shiny', 'The switch will rust instantly', 'It is only bad manners'], 'Wet skin conducts better.', 'Impure water conducts electricity and can cause a shock.'],
      ['Which of these is a conductor even though it is not a metal?', 'Graphite (pencil lead)', ['Plastic', 'Rubber', 'Wood'], 'It is inside a pencil.', 'Graphite conducts electricity.'],
      ['Switch covers and plugs are made of plastic because plastic is…', 'An insulator', ['A conductor', 'A magnet', 'Transparent'], 'We touch them with our hands.', 'Plastic protects us from shocks.'],
    ]),
    tapT('ins', 'Tap every INSULATOR.', [
      ['Plastic', true], ['Rubber', true], ['Dry wood', true], ['Glass', true], ['Paper', true],
      ['Copper', false], ['Iron', false], ['Aluminium', false], ['Graphite', false],
    ], ['Insulators do not let electricity pass.'], 'Plastic, rubber, dry wood, glass and paper are insulators; metals and graphite are conductors.'),
  ],
};

const el3: OSpec = {
  id: 'ts6.sc.electric.bulb', title: 'The story of the electric bulb', prereqs: ['ts6.sc.electric.circuit'],
  intro: [
    h('From oil lamps to LEDs'),
    photo('💡', 'An electric bulb — one of the inventions that changed the world.'),
    p('For thousands of years people used fire, oil lamps (deepam), candles and lanterns for light. In the 1800s many scientists tried to make light from electricity. In 1879 Thomas Alva Edison made a bulb that could glow for many hours, after testing hundreds of materials for the filament. Soon homes and streets began to be lit by electricity.'),
    p('In such bulbs (incandescent bulbs) the filament — today made of tungsten — becomes white-hot and glows. But most of the electricity becomes heat, not light: an ordinary bulb gets too hot to touch.'),
    def('CFL and LED', 'Newer lamps. A CFL (compact fluorescent lamp) and an LED (light emitting diode) give the same light as an ordinary bulb while using much less electricity and staying cool.'),
    keys('Edison made a long-lasting electric bulb in 1879.', 'Filament bulbs waste much electricity as heat.', 'LED lamps use much less electricity and last longer.'),
    remember('Switching to LED bulbs and switching off lights when not needed saves electricity and money.'),
    tip('Edison said he did not fail — he found hundreds of ways that did not work. Scientists learn from every try.'),
  ],
  examples: [
    ex('Why does an ordinary filament bulb feel hot after it has been on for some time?', ['The filament glows only when it is very hot.', 'Much of the electricity turns into heat, not light.'], 'Most of the electricity is changed into heat.'),
    ex('Teja’s school replaces all old bulbs with LED lamps. Give two benefits.', ['LEDs use much less electricity for the same light.', 'They last much longer and stay cool.'], 'Less electricity used and longer life.'),
  ],
  practice: [
    mcq('story', 'Remember the story and the newer lamps.', [
      ['Who made a long-lasting electric bulb in 1879?', 'Thomas Alva Edison', ['Isaac Newton', 'C. V. Raman', 'Galileo'], 'He tested hundreds of filaments.', 'Edison made a practical electric bulb in 1879.'],
      ['The filament of an ordinary bulb is now made of…', 'Tungsten', ['Plastic', 'Copper', 'Glass'], 'A metal that can become white-hot without melting.', 'Tungsten has a very high melting point.'],
      ['Which lamp uses the LEAST electricity for the same light?', 'LED lamp', ['Filament bulb', 'Kerosene lantern', 'Candle'], 'Three letters, stays cool.', 'LED lamps are the most energy-efficient.'],
      ['Most of the electricity used by a filament bulb becomes…', 'Heat', ['Sound', 'Magnetism', 'Water'], 'Try touching it carefully — don’t!', 'Filament bulbs waste most energy as heat.'],
      ['Before electric bulbs, homes were lit by…', 'Oil lamps and candles', ['LED lamps', 'Solar panels', 'Tube lights'], 'Think of the deepam.', 'Fire-based lamps were used for thousands of years.'],
    ]),
    orderT('history', [
      ['Put these sources of light in the order they came into use.', ['Fire and oil lamps', 'Candles and lanterns', 'Edison’s filament bulb', 'Tube lights and CFLs', 'LED lamps'], 'From flames to filaments to modern energy-saving lamps.'],
    ], ['Which is the oldest? Which is the newest?']),
    tapT('save', 'Tap every action that SAVES electricity.', [
      ['Switching to LED lamps', true], ['Switching off lights when leaving a room', true], ['Using daylight to read', true], ['Switching off the fan in an empty room', true],
      ['Leaving the TV on all night', false], ['Keeping lights on in the daytime', false], ['Using many old filament bulbs', false],
    ], ['Which choices use less electricity?'], 'Efficient lamps and switching things off save electricity.'),
  ],
};

const ch12: USpec = { id: 'ts6.sc.ch12', subject: 'physics', title: 'Simple Electric Circuits', source: src(12), objectives: [el1, el2, el3] };

// =====================================================================================
// Chapter 13 — Learning How to Measure
// =====================================================================================
const ms1: OSpec = {
  id: 'ts6.sc.measure.units', title: 'Story of measurement and standard units', prereqs: [],
  intro: [
    h('How long is a hand span?'),
    photo('🖐️', 'A hand span — the distance from the tip of the thumb to the tip of the little finger, with fingers spread.'),
    p('Long ago people measured with their bodies: a hand span, a cubit (elbow to fingertip), a foot, an arm length (baara) or a pace (step). Flower sellers still measure garlands in "moors" (elbow lengths).'),
    p('But Ravi’s hand span is not the same as his father’s. If two people measure the same table in hand spans, they get different numbers. Trade and building need measurements that are the same for everybody.'),
    def('Standard unit', 'A fixed, agreed unit that gives the same result whoever measures, such as the metre.'),
    p('In the 1790s, France introduced the metric system. Today almost the whole world uses the International System of Units (SI). The SI unit of length is the metre (m).'),
    keys('1 m = 100 cm', '1 cm = 10 mm', '1 km = 1000 m', 'Body units (span, cubit, foot, pace) are not standard — they differ from person to person.'),
    remember('Measurement = a number + a unit. "5" means nothing; "5 m" tells us the length.'),
    tip('To change a big unit into a smaller one, multiply (m → cm: × 100). To change a small unit into a bigger one, divide (cm → m: ÷ 100).'),
  ],
  examples: [
    ex('Meena measures her desk as 6 hand spans and her teacher measures it as 4 hand spans. Who is wrong?', ['Both measured correctly.', 'Their hand spans have different lengths.', 'This is why we need a standard unit.'], 'Neither — hand spans are not a standard unit.'),
    ex('Change 2 m 35 cm into centimetres.', ['2 m = 2 × 100 = 200 cm', '200 cm + 35 cm = 235 cm'], '235 cm'),
  ],
  practice: [
    tp('m2cm', (r) => {
      const m = r.int(1, 9), cm = r.int(5, 95);
      return numQ(`Change ${m} m ${cm} cm into centimetres.`, m * 100 + cm, 'cm',
        ['1 m = 100 cm.', 'Change the metres into cm, then add the extra cm.'],
        [`${m} m = ${m * 100} cm`, `${m * 100} + ${cm} = ${m * 100 + cm} cm`],
        [{ when: String(m + cm), explain: 'You added metres and centimetres directly. First change metres into centimetres.' }]);
    }),
    tp('conv', (r) => {
      const kind = r.int(0, 2);
      if (kind === 0) { const cm = r.int(2, 30); return numQ(`How many millimetres are there in ${cm} cm?`, cm * 10, 'mm', ['1 cm = 10 mm.'], [`${cm} × 10 = ${cm * 10} mm`], [{ when: String(cm / 10), explain: 'mm is smaller than cm, so the number should get bigger — multiply by 10.' }]); }
      if (kind === 1) { const km = r.int(2, 9); return numQ(`How many metres are there in ${km} km?`, km * 1000, 'm', ['1 km = 1000 m.'], [`${km} × 1000 = ${km * 1000} m`], [{ when: String(km * 100), explain: '1 km is 1000 m, not 100 m.' }]); }
      const cm = r.pick([300, 500, 700, 1200, 250, 450]);
      return numQ(`Change ${cm} cm into metres.`, cm / 100, 'm', ['100 cm = 1 m.', 'Divide by 100.'], [`${cm} ÷ 100 = ${cm / 100} m`], [{ when: String(cm * 100), explain: 'Metres are bigger than centimetres, so the number gets smaller — divide by 100.' }]);
    }),
    mcq('std', 'Standard units give the same result for everyone.', [
      ['Why are hand spans not a good unit for measuring?', 'They differ from person to person', ['They are too long', 'They are made of metal', 'Nobody has hands'], 'Compare your span with an adult’s.', 'Body measures vary, so results differ.'],
      ['The SI unit of length is the…', 'Metre', ['Foot', 'Cubit', 'Hand span'], 'Used all over the world.', 'The metre is the SI unit of length.'],
      ['A cubit is the length from the…', 'Elbow to the fingertip', ['Heel to toe', 'Thumb to little finger', 'Shoulder to wrist'], 'Flower sellers use it for garlands.', 'A cubit is elbow to fingertip.'],
      ['Which country first introduced the metric system?', 'France', ['India', 'China', 'Japan'], 'In the 1790s.', 'The metric system began in France.'],
      ['How many centimetres make one metre?', '100', ['10', '1000', '12'], 'Centi means hundredth.', '1 m = 100 cm.'],
    ]),
  ],
};

const ms2: OSpec = {
  id: 'ts6.sc.measure.length', title: 'Measuring length correctly, including small lengths', prereqs: ['ts6.sc.measure.units'],
  intro: [
    h('Using a scale the right way'),
    photo('📏', 'A 30 cm scale marked in centimetres and millimetres.'),
    stepsB('Place the scale along the length of the object, touching it.', 'Line up one end of the object with the zero mark.', 'If the zero mark is broken, start at a clear mark like 1 cm and SUBTRACT it from the other reading.', 'Keep your eye exactly above the mark you read — looking from the side gives a wrong reading.'),
    h('Curved lines'),
    p('To measure a curved line (like the outline of a bangle or a map road), lay a thread carefully along it, mark the end, straighten the thread and measure it with the scale.'),
    h('Very small lengths'),
    p('One page of a book is too thin to measure with a scale. Measure the thickness of 100 pages pressed together and divide by 100. Similarly, wind a thin wire 20 times closely around a pencil, measure the width of the coil and divide by 20 to get the wire’s thickness.'),
    keys('Start at zero, or subtract the starting mark.', 'Eye directly above the mark.', 'Thread for curved lines.', 'Measure many together and divide for very small lengths.'),
    remember('Length of object = reading at end − reading at start.'),
    tip('Measuring many and dividing also reduces your error.'),
  ],
  examples: [
    ex('A pencil starts at the 2.0 cm mark and ends at the 14.5 cm mark. How long is it?', ['Length = end − start', '14.5 − 2.0 = 12.5'], '12.5 cm'),
    ex('200 pages of a book together are 1 cm thick. How thick is one page in mm?', ['1 cm = 10 mm', '10 mm ÷ 200 = 0.05 mm'], '0.05 mm'),
  ],
  practice: [
    tp('read', (r) => {
      const s = r.int(1, 5), len = rd(r.int(30, 220) / 10, 1);
      const e = rd(s + len, 1);
      return numQ(`An eraser is measured with a broken scale. One end is at the ${s} cm mark and the other end is at the ${e} cm mark. How long is the eraser?`, len, 'cm',
        ['The object did not start at zero.', 'Length = end reading − start reading.'],
        [`${e} − ${s} = ${len} cm`],
        [{ when: String(e), explain: 'That is the end reading. Subtract the starting mark because the object did not start at zero.' }]);
    }),
    tp('thin', (r) => {
      const n = r.pick([50, 100, 200, 250, 500]), t = r.pick([5, 10, 15, 20, 25]);
      return numQ(`${n} sheets of paper pressed together are ${t} mm thick. How thick is one sheet, in mm?`, rd(t / n, 3), 'mm',
        ['All sheets have the same thickness.', 'Divide the total thickness by the number of sheets.'],
        [`${t} ÷ ${n} = ${rd(t / n, 3)} mm`],
        [{ when: String(t * n), explain: 'You multiplied. One sheet is much thinner than the whole pile, so divide.' }]);
    }, 2),
    mcq('how', 'Think about the correct method.', [
      ['How should you measure the length of a curved line on a map?', 'Lay a thread along it, then measure the thread', ['Use a straight scale directly', 'Guess', 'Use a measuring cylinder'], 'Something that bends.', 'A thread follows the curve; then straighten and measure it.'],
      ['When reading a scale, your eye should be…', 'Exactly above the mark', ['To the left of it', 'To the right of it', 'Far below the table'], 'Looking from the side causes error.', 'Viewing straight from above avoids error.'],
      ['The zero mark of your scale is broken. What should you do?', 'Start from another clear mark and subtract it', ['Throw the scale away', 'Add 1 cm to every answer', 'Measure only half'], 'Use the difference of two readings.', 'Length = end reading − start reading.'],
      ['How can you find the thickness of one page of a book?', 'Measure many pages together and divide', ['Measure one page with a scale', 'Weigh it', 'Fold it'], 'One page is too thin for a scale.', 'Measuring many and dividing gives the thickness of one.'],
      ['A thin wire is wound 20 times closely around a pencil. The coil is 1 cm wide. The wire is…', '0.5 mm thick', ['20 mm thick', '1 cm thick', '2 mm thick'], '1 cm = 10 mm; divide by 20.', '10 mm ÷ 20 = 0.5 mm.'],
    ]),
  ],
};

const ms3: OSpec = {
  id: 'ts6.sc.measure.area', title: 'Measuring area and volume', prereqs: ['ts6.sc.measure.length'],
  intro: [
    h('How much surface? How much space?'),
    photo('🧱', 'A brick has length, breadth and height — it takes up space (volume).'),
    def('Area', 'The amount of surface a flat shape covers. Measured in square units like cm² or m².'),
    p('For a rectangle: Area = length × breadth. For an irregular shape like a leaf, place it on graph paper (1 cm squares), trace it and count: full squares count as 1, squares more than half covered count as 1, and squares less than half covered are left out.'),
    xp({
      title: 'What if? Change the size of a rectangle', formula: 'Area = length × breadth',
      res: ['A', 'Area', 'cm²', 'l * b', 0],
      vars: [['l', 'Length', 'cm', 1, 30, 1, 10], ['b', 'Breadth', 'cm', 1, 20, 1, 5]],
      notes: [['l', 'A longer rectangle covers more squares.', 'A shorter rectangle covers fewer squares.'], ['b', 'A wider rectangle covers more squares.', 'A narrower rectangle covers fewer squares.']],
      mistakes: [['Adding length and breadth', 'Adding gives half the perimeter, not the area. Area counts squares: multiply.'], ['Writing the unit as cm', 'Area is in square units: cm².']],
      real: 'A classroom floor of 8 m by 6 m needs 48 square metres of tiles.',
    }),
    def('Volume', 'The amount of space an object takes up. For a cuboid: Volume = length × breadth × height, in cm³ or m³.'),
    p('For an irregular solid like a stone: pour water into a measuring cylinder and note the level. Drop the stone in gently. The water rises. Volume of stone = new level − old level. (1 mL = 1 cm³.)'),
    keys('Area of rectangle = l × b (cm², m²).', 'Irregular area: count squares on graph paper.', 'Volume of cuboid = l × b × h (cm³).', 'Irregular solid: rise in water level.'),
    remember('1 mL of water takes up exactly 1 cm³ of space.'),
    tip('Area has two lengths multiplied (square units); volume has three (cube units).'),
  ],
  examples: [
    ex('A notebook cover is 20 cm long and 15 cm wide. Find its area.', ['Area = length × breadth', '20 × 15 = 300'], '300 cm²'),
    ex('Water in a measuring cylinder is at 50 mL. A stone is dropped in and the level rises to 72 mL. Find the stone’s volume.', ['Volume = new level − old level', '72 − 50 = 22 mL', '1 mL = 1 cm³'], '22 cm³'),
  ],
  practice: [
    tp('area', (r) => {
      const l = r.int(4, 30), b = r.int(2, 20);
      return numQ(`A rectangular card is ${l} cm long and ${b} cm wide. What is its area?`, l * b, 'cm²',
        ['Area of a rectangle = length × breadth.'],
        [`${l} × ${b} = ${l * b} cm²`],
        [{ when: String(l + b), explain: 'You added. Area = length × breadth (multiply).' }, { when: String(2 * (l + b)), explain: 'That is the perimeter (distance around), not the area.' }]);
    }),
    tp('vol', (r) => {
      const l = r.int(2, 12), b = r.int(2, 10), hh = r.int(2, 8);
      return numQ(`A box is ${l} cm long, ${b} cm wide and ${hh} cm high. What is its volume?`, l * b * hh, 'cm³',
        ['Volume of a cuboid = length × breadth × height.'],
        [`${l} × ${b} × ${hh} = ${l * b * hh} cm³`],
        [{ when: String(l + b + hh), explain: 'You added. Multiply all three lengths.' }, { when: String(l * b), explain: 'That is only the area of the base. Multiply by the height too.' }], 0.001);
    }, 2),
    tp('disp', (r) => {
      const a = r.pick([20, 30, 40, 50, 60]), v = r.int(5, 35);
      return numQ(`Water in a measuring cylinder is at ${a} mL. ${who(r)} drops a stone in and the water rises to ${a + v} mL. What is the volume of the stone in cm³?`, v, 'cm³',
        ['The stone pushes aside water equal to its own volume.', 'Volume = new level − old level; 1 mL = 1 cm³.'],
        [`${a + v} − ${a} = ${v} mL = ${v} cm³`],
        [{ when: String(a + v), explain: 'That is the new water level. Subtract the starting level.' }]);
    }),
  ],
};

const ch13: USpec = { id: 'ts6.sc.ch13', subject: 'physics', title: 'Learning How to Measure', source: src(13), objectives: [ms1, ms2, ms3] };

// =====================================================================================
// Chapter 14 — Movements in Animals
// =====================================================================================
const mv1: OSpec = {
  id: 'ts6.sc.movement.muscles', title: 'Muscles and how they work', prereqs: [],
  intro: [
    h('Feel your muscles'),
    photo('💪', 'When you bend your arm, the muscle on the front of the upper arm bulges.'),
    p('Hold your upper arm with your other hand and slowly bend and straighten your elbow. You feel a soft part become hard and bulge, then relax. That is a muscle working.'),
    def('Muscle', 'A soft body part that can contract (become shorter and thicker) and relax. Muscles move bones and other body parts.'),
    p('Muscles are joined to bones by strong cords called tendons. A muscle can only PULL when it contracts — it cannot push. So muscles work in pairs: one pulls a bone one way, the other pulls it back.'),
    keys('To bend the arm: the biceps (front) contracts and the triceps (back) relaxes.', 'To straighten the arm: the triceps contracts and the biceps relaxes.', 'Muscles can only pull, never push.'),
    remember('The heart is also a muscle; it contracts and relaxes all our life without rest.'),
    tip('Exercise and play make muscles stronger.'),
  ],
  examples: [
    ex('Which muscle contracts when you lift a school bag by bending your elbow?', ['Bending the elbow pulls the lower arm up.', 'The muscle on the front of the upper arm does this.'], 'The biceps'),
    ex('Why do muscles work in pairs?', ['A muscle can only pull when it contracts.', 'It cannot push the bone back.', 'A second muscle is needed to pull it the other way.'], 'Because muscles can only pull, not push.'),
  ],
  practice: [
    mcq('mus', 'Muscles pull when they contract.', [
      ['When you bend your arm, the biceps…', 'Contracts', ['Relaxes', 'Breaks', 'Disappears'], 'It bulges.', 'The biceps contracts to bend the arm.'],
      ['When you straighten your arm, which muscle contracts?', 'Triceps', ['Biceps', 'Heart', 'Tongue'], 'It is at the back of the upper arm.', 'The triceps contracts to straighten the arm.'],
      ['Muscles are joined to bones by…', 'Tendons', ['Nails', 'Hair', 'Veins'], 'Strong cords.', 'Tendons connect muscles to bones.'],
      ['A muscle can only…', 'Pull', ['Push', 'Push and pull equally', 'Neither'], 'It gets shorter.', 'A contracting muscle pulls on the bone.'],
      ['Which organ is a muscle that works all our life?', 'Heart', ['Skull', 'Hair', 'Nail'], 'It beats.', 'The heart is a muscular organ.'],
      ['When a muscle contracts it becomes…', 'Shorter and thicker', ['Longer and thinner', 'Hard as bone forever', 'Transparent'], 'Feel your biceps.', 'Contraction shortens and thickens a muscle.'],
    ]),
    sortT('bend', 'contracts', 'relaxes', [
      ['Biceps when bending the arm', true], ['Triceps when straightening the arm', true],
      ['Triceps when bending the arm', false], ['Biceps when straightening the arm', false],
      ['Calf muscle when standing on your toes', true], ['The muscle that lifts the forearm, while the arm hangs loosely straight down', false],
    ], ['The muscle that does the pulling contracts; its partner relaxes.'], 'In a pair, the muscle doing the pulling contracts while the other relaxes.'),
    orderT('lift', [
      ['Put the events of lifting a cup to your mouth in order.', ['Brain sends a message to the arm', 'Biceps contracts', 'Biceps pulls the forearm bone', 'Elbow bends', 'Cup reaches the mouth'], 'The muscle contracts first, then the bone moves at the joint.'],
      ['Put the events of straightening your arm in order.', ['Brain sends a message', 'Triceps contracts', 'Biceps relaxes', 'Forearm is pulled back', 'Arm becomes straight'], 'The partner muscle relaxes while the other one pulls.'],
    ], ['What happens in the muscle before the bone moves?']),
  ],
};

const mv2: OSpec = {
  id: 'ts6.sc.movement.bones', title: 'Bones, skull and joints', prereqs: ['ts6.sc.movement.muscles'],
  intro: [
    h('The frame of the body'),
    photo('🧘', 'Yoga poses use many bones, joints and muscles working together.'),
    def('Skeleton', 'The framework of all the bones in the body. An adult has 206 bones. It gives shape, supports the body, protects soft organs and helps in movement.'),
    keys('Skull: a box of bones joined tightly together that protects the brain. Only the lower jaw can move.', 'Backbone: made of 33 small bones (vertebrae); lets us bend and protects the spinal cord.', 'Ribcage: 12 pairs of ribs that protect the heart and lungs.'),
    h('Joints'),
    def('Joint', 'A place where two bones meet. Joints allow (or stop) movement.'),
    keys('Ball-and-socket joint: moves in all directions — shoulder, hip.', 'Hinge joint: moves in one direction only, like a door hinge — elbow, knee, fingers.', 'Pivot joint: lets the head turn left and right — joint of the neck with the skull.', 'Gliding joint: bones slide over each other — wrist, ankle.', 'Fixed joint: does not move — between the skull bones.'),
    remember('The top of your ear and tip of your nose are soft and bendable — they are cartilage, not bone.'),
    tip('Try to bend your knee backwards and forwards — it moves only one way. That is a hinge!'),
  ],
  examples: [
    ex('Which joint lets you swing your arm in a full circle?', ['Moving in all directions needs a round end in a cup.', 'The shoulder has this.'], 'Ball-and-socket joint (shoulder)'),
    ex('Why can you not move the bones of your skull?', ['They are joined tightly at fixed joints.', 'This makes a strong box to protect the brain.'], 'They are joined by fixed joints to protect the brain.'),
  ],
  practice: [
    tp('joint', (r) => {
      const pool: [string, string][] = [
        ['Shoulder', 'Ball-and-socket joint'], ['Hip', 'Ball-and-socket joint'],
        ['Elbow', 'Hinge joint'], ['Knee', 'Hinge joint'], ['Finger', 'Hinge joint'],
        ['Neck (turning the head)', 'Pivot joint'], ['Wrist', 'Gliding joint'], ['Ankle', 'Gliding joint'],
        ['Bones of the skull', 'Fixed joint'],
      ];
      const [m, a] = r.pick(pool);
      return {
        type: 'mcq', prompt: `What kind of joint is found at the ${m.toLowerCase()}?`, ...choose(r, a, ['Ball-and-socket joint', 'Hinge joint', 'Pivot joint', 'Gliding joint', 'Fixed joint'].filter((x) => x !== a)),
        hints: ['All directions → ball-and-socket; one direction → hinge; turning → pivot; sliding → gliding; no movement → fixed.'],
        mistakes: [{ when: 'wrong', explain: 'Move that part of your own body and see how it moves.' }],
        solution: [`${m} → ${a.toLowerCase()}.`],
      };
    }),
    mcq('bones', 'Skeleton: shape, support, protection, movement.', [
      ['How many bones does an adult human have?', '206', ['106', '306', '26'], 'A little over two hundred.', 'An adult skeleton has 206 bones.'],
      ['The skull protects the…', 'Brain', ['Heart', 'Stomach', 'Lungs'], 'It is in the head.', 'The skull is a bony box around the brain.'],
      ['The ribcage protects the…', 'Heart and lungs', ['Brain', 'Kidneys only', 'Eyes'], 'In the chest.', 'Ribs form a cage around the heart and lungs.'],
      ['The only bone of the skull that can move is the…', 'Lower jaw', ['Forehead bone', 'Back of the head', 'Nose bone'], 'You use it to chew.', 'The lower jaw moves; the other skull bones are fixed.'],
      ['How many pairs of ribs do we have?', '12', ['6', '24', '33'], 'Count on a chart.', 'There are 12 pairs of ribs.'],
      ['The soft, bendable part at the top of your ear is…', 'Cartilage', ['Bone', 'Muscle', 'Tendon'], 'It is not hard like bone.', 'The ear and nose tip are made of cartilage.'],
    ]),
    matchT('job', 'part of the skeleton to its job', [
      ['Skull', 'Protects the brain'], ['Ribcage', 'Protects the heart and lungs'], ['Backbone', 'Supports the body and lets it bend'], ['Hinge joint', 'Lets the knee bend one way'], ['Ball-and-socket joint', 'Lets the arm rotate fully'], ['Pivot joint', 'Lets the head turn'],
    ], ['Think about where each one is.'], 4),
  ],
};

const mv3: OSpec = {
  id: 'ts6.sc.movement.animals', title: 'How other animals move', prereqs: ['ts6.sc.movement.bones'],
  intro: [
    h('Crawl, glide, fly and swim'),
    photo('🐟', 'A fish swims by bending its body and moving its tail and fins.'),
    keys('Earthworm: has no bones. It stretches the front of its body and then pulls up the back, using muscles and tiny bristles that grip the soil.', 'Snail: moves on a large muscular foot; slime helps it glide.', 'Cockroach: has a hard outer covering, three pairs of jointed legs to walk and two pairs of wings to fly.', 'Birds: light hollow bones, strong chest muscles and wings for flying; legs for walking and perching.', 'Fish: a streamlined (boat-shaped) body, fins and a strong tail for swimming.', 'Snake: a long backbone with many bones; it curves its body and pushes against the ground.'),
    def('Streamlined body', 'A body that is pointed at the front and back and wider in the middle, so it moves easily through water or air.'),
    p('Each animal’s way of moving suits its body and its habitat.'),
    remember('An earthworm has no bones at all — it moves only with muscles and bristles.'),
    tip('Watch an ant, a lizard or a crow for two minutes and describe how it moves.'),
  ],
  examples: [
    ex('Why can a bird fly easily?', ['Its bones are hollow and light.', 'It has strong chest muscles to flap its wings.', 'Its body is streamlined.'], 'Light hollow bones, strong flight muscles, wings and a streamlined body.'),
    ex('How does a fish change direction in water?', ['It bends its body and moves its tail.', 'The fins help it balance and steer.'], 'By using its tail and fins.'),
  ],
  practice: [
    matchT('how', 'animal to how it moves', [
      ['Earthworm', 'Muscles and tiny bristles'], ['Snail', 'Muscular foot'], ['Cockroach', 'Jointed legs and wings'], ['Bird', 'Wings and light hollow bones'], ['Fish', 'Fins and tail'], ['Snake', 'Curving its body against the ground'],
    ], ['Picture each animal moving.'], 4),
    mcq('anim', 'Body shape and parts suit the way of moving.', [
      ['Which animal moves without any bones?', 'Earthworm', ['Snake', 'Fish', 'Bird'], 'It lives in soil.', 'Earthworms have no skeleton; they use muscles and bristles.'],
      ['Birds’ bones are…', 'Hollow and light', ['Solid and heavy', 'Missing', 'Made of cartilage only'], 'Light bones help in flying.', 'Hollow bones make birds light for flight.'],
      ['A fish’s body is…', 'Streamlined', ['Square', 'Flat like paper', 'Round like a ball'], 'Pointed at both ends.', 'A streamlined body moves easily through water.'],
      ['How many pairs of legs does a cockroach have?', 'Three', ['Two', 'Four', 'Ten'], 'All insects have the same number.', 'Insects like cockroaches have three pairs of legs.'],
      ['A snail moves using its…', 'Muscular foot', ['Wings', 'Fins', 'Legs'], 'It leaves a slimy trail.', 'A snail glides on its muscular foot.'],
      ['A snake moves by…', 'Curving its body and pushing against the ground', ['Walking on legs', 'Flapping wings', 'Using fins'], 'It has a long backbone.', 'A snake makes curves and pushes on the ground.'],
    ]),
    tapT('bones', 'Tap every animal that HAS a backbone.', [
      ['Snake', true], ['Fish', true], ['Bird', true], ['Frog', true], ['Cow', true],
      ['Earthworm', false], ['Snail', false], ['Cockroach', false], ['Spider', false],
    ], ['Earthworms, snails and insects have no backbone.'], 'Fish, frogs, snakes, birds and mammals have backbones; earthworms, snails and insects do not.'),
  ],
};

const ch14: USpec = { id: 'ts6.sc.ch14', subject: 'biology', title: 'Movements in Animals', source: src(14), objectives: [mv1, mv2, mv3] };

// =====================================================================================
// Chapter 15 — Light, Shadows and Images
// =====================================================================================
const lt1: OSpec = {
  id: 'ts6.sc.light.shadows', title: 'Light travels in straight lines — shadows', prereqs: [],
  intro: [
    h('Shadow play'),
    photo('🔦', 'Shine a torch on your hand in a dark room and make shadow animals on the wall.'),
    p('Look at sunlight coming through a gap in the window into a dusty room — you see straight beams. Light travels in straight lines. It cannot bend around an opaque object.'),
    def('Shadow', 'A dark area formed behind an opaque object when it blocks light.'),
    p('To get a shadow we need three things: a source of light, an opaque object and a screen (wall, ground) on which the shadow falls.'),
    keys('Opaque objects make dark shadows; translucent objects make faint shadows; transparent objects make almost no shadow.', 'A shadow is always dark — it does not show the colour of the object.', 'Moving an object closer to the light makes its shadow bigger.', 'In sunlight, shadows are long in the morning and evening and shortest at noon.'),
    remember('A shadow shows only the outline (shape) of the object, not its colour or details.'),
    tip('Measure your shadow at 8 am, 12 noon and 4 pm. Notice both its length and its direction.'),
  ],
  examples: [
    ex('A red ball and a green ball of the same size are held in torchlight. What colour are their shadows?', ['A shadow forms where light is blocked.', 'No light reaches that area, whatever the object’s colour.'], 'Both shadows are dark.'),
    ex('Why is your shadow shortest at noon?', ['At noon the sun is nearly overhead.', 'Light falls almost straight down, so only a small area is blocked.'], 'Because the sun is high overhead.'),
  ],
  practice: [
    mcq('sh', 'Light travels in straight lines and cannot pass through opaque objects.', [
      ['A shadow is formed when an opaque object…', 'Blocks light', ['Reflects light like a mirror', 'Makes light', 'Is transparent'], 'Light cannot go through it.', 'An opaque object stops light, making a dark area behind it.'],
      ['Which three things are needed to see a shadow?', 'Light source, opaque object, screen', ['Mirror, lens, water', 'Only a bulb', 'A magnet and a screen'], 'Where does the shadow fall?', 'You need light, something to block it and a surface to show it.'],
      ['What colour is the shadow of a red rose?', 'Dark', ['Red', 'Green', 'White'], 'No light reaches the shadow.', 'Shadows are always dark.'],
      ['Shadows are shortest at…', 'Noon', ['Sunrise', 'Sunset', 'Evening'], 'The sun is overhead then.', 'At noon the sun is highest, so shadows are shortest.'],
      ['Which object casts almost no shadow?', 'Clear glass', ['Wooden board', 'Your hand', 'A book'], 'Light passes through it.', 'Transparent objects let light through.'],
      ['Moving your hand closer to the torch makes its shadow…', 'Bigger', ['Smaller', 'Coloured', 'Disappear'], 'It blocks more of the light.', 'Closer to the source, an object blocks a wider cone of light.'],
    ]),
    tapT('shadow', 'Tap every object that makes a DARK shadow in sunlight.', [
      ['Brick', true], ['Wooden door', true], ['Your body', true], ['Steel plate', true], ['Book', true],
      ['Clear glass window', false], ['Clean water in a glass', false], ['Clear plastic sheet', false],
    ], ['Only opaque objects block all the light.'], 'Opaque objects make dark shadows; transparent ones let light pass.'),
    sortT('time', 'long', 'short', [
      ['Your shadow at 7 am', true], ['Your shadow at 5 pm', true], ['A tree’s shadow at sunrise', true],
      ['Your shadow at 12 noon', false], ['A pole’s shadow at midday', false], ['A tree’s shadow at noon', false],
    ], ['Is the sun low or high in the sky?'], 'When the sun is low (morning, evening) shadows are long; when it is high (noon) they are short.'),
  ],
};

const lt2: OSpec = {
  id: 'ts6.sc.light.pinhole', title: 'The pinhole camera', prereqs: ['ts6.sc.light.shadows'],
  intro: [
    h('A camera made from a box'),
    photo('📦', 'A cardboard box can become a pinhole camera.'),
    stepsB('Take a closed box. Make a tiny hole with a pin in the middle of one side.', 'Cut a square window in the opposite side and cover it with tracing (or butter) paper.', 'Cover your head and the box with a dark cloth.', 'Point the pinhole at a bright object like a tree or a lit candle.', 'An image appears on the tracing paper — upside down!'),
    p('Why upside down? Light travels in straight lines. Light from the TOP of the tree goes straight through the pinhole and reaches the BOTTOM of the screen; light from the bottom reaches the top. The rays cross at the pinhole.'),
    xp({
      title: 'What if? Move the tree or lengthen the box', formula: 'image height = object height × (box length ÷ object distance)',
      res: ['i', 'Image height', 'cm', 'H * b / d', 1],
      vars: [['H', 'Height of the object', 'cm', 50, 1000, 50, 400], ['b', 'Length of the box', 'cm', 10, 50, 5, 20], ['d', 'Distance of the object', 'cm', 200, 5000, 100, 1000]],
      notes: [['d', 'The farther the object, the smaller its image.', 'The closer the object, the bigger its image.'], ['b', 'A longer box makes a bigger image.', 'A shorter box makes a smaller image.']],
      mistakes: [['Thinking the image is upright', 'The rays cross at the pinhole, so the image is always upside down.']],
      real: 'This is how the very first cameras worked — and the human eye also forms an upside-down image that the brain turns the right way up.',
    }),
    keys('A pinhole camera forms an upside-down (inverted) image.', 'It works because light travels in straight lines.', 'The image shows colours of the object.', 'A bigger hole makes a brighter but blurred image.'),
    remember('If you make two pinholes, you get two images.'),
    tip('Use butter paper for the screen — it is translucent, so the image can be seen from behind.'),
  ],
  examples: [
    ex('In a pinhole camera, a boy standing upright appears…', ['Light from his head goes through the hole to the bottom of the screen.', 'Light from his feet reaches the top of the screen.'], 'Upside down'),
    ex('A tree 400 cm tall is 1000 cm (10 m) away from a pinhole camera 20 cm long. How tall is its image?', ['image = object height × box length ÷ distance', '400 × 20 ÷ 1000 = 8'], '8 cm'),
  ],
  practice: [
    tp('img', (r) => {
      const H = r.pick([200, 300, 400, 500, 600]), b = r.pick([10, 20, 25, 30]), d = r.pick([500, 1000, 2000]);
      const i = rd(H * b / d, 2);
      return numQ(`An object ${H} cm tall is ${d} cm from a pinhole camera that is ${b} cm long. How tall is the image on the screen?`, i, 'cm',
        ['image height = object height × box length ÷ object distance.'],
        [`${H} × ${b} ÷ ${d} = ${i} cm`, 'The image is also upside down.'],
        [{ when: String(rd(H * d / b, 2)), explain: 'You swapped the box length and the distance. Multiply by box length, divide by distance.' }], 0.02);
    }, 3),
    mcq('pin', 'Rays cross at the pinhole.', [
      ['The image in a pinhole camera is…', 'Upside down', ['Upright', 'Always dark like a shadow', 'Never seen'], 'Rays cross at the hole.', 'The image is inverted.'],
      ['A pinhole camera works because light…', 'Travels in straight lines', ['Bends around corners', 'Is a liquid', 'Is magnetic'], 'Straight rays cross at the pinhole.', 'Straight-line travel of light makes the inverted image.'],
      ['Which material is best for the screen of a pinhole camera?', 'Tracing paper', ['Cardboard', 'Steel sheet', 'Wood'], 'You must see the image from behind.', 'Translucent tracing paper shows the image.'],
      ['If the pinhole is made much bigger, the image becomes…', 'Brighter but blurred', ['Sharper', 'Upright', 'Coloured red'], 'More light, but rays overlap.', 'A large hole lets in more light but the image is not sharp.'],
      ['Moving the object farther from the pinhole camera makes its image…', 'Smaller', ['Bigger', 'Upright', 'Disappear immediately'], 'Think of the explorer.', 'A farther object gives a smaller image.'],
      ['Does the pinhole camera image show the colours of the object?', 'Yes', ['No, it is always black', 'Only red colour', 'Only at night'], 'It is an image, not a shadow.', 'Images show colours; shadows do not.'],
    ]),
    orderT('make', [
      ['Put the steps for making a pinhole camera in order.', ['Take a closed cardboard box', 'Make a pinhole in one side', 'Cut a window in the opposite side', 'Cover the window with tracing paper', 'Point the pinhole at a bright object'], 'The box must be made before you point it at an object.'],
      ['Put the path of light in a pinhole camera in order.', ['Light leaves the top of the tree', 'It travels in a straight line', 'It passes through the pinhole', 'It reaches the bottom of the screen', 'An upside-down image forms'], 'Light goes straight through the hole and crosses over.'],
    ], ['What happens first?']),
  ],
};

const lt3: OSpec = {
  id: 'ts6.sc.light.image', title: 'Images and shadows — what is the difference?', prereqs: ['ts6.sc.light.pinhole'],
  intro: [
    h('Mirror, mirror'),
    photo('👁️', 'We see an image when light from an object enters our eyes.'),
    p('When you look into a mirror or still water, you see an image of yourself. Light from your face falls on the mirror and bounces back (is reflected) into your eyes.'),
    def('Reflection', 'Light bouncing back from a shiny smooth surface like a mirror, polished steel or still water.'),
    def('Image', 'A picture of an object formed by light — by reflection in a mirror or through a pinhole. It shows the colour and details of the object.'),
    p('In a plane mirror the image is upright, the same size as you, and left and right are swapped: raise your right hand and your image raises its left. Words look reversed (that is why AMBULANCE is written backwards on the front of ambulances).'),
    keys('Shadow: dark, no colour, only outline; formed when light is BLOCKED.', 'Image: shows colours and details; formed when light is REFLECTED (or passes through a pinhole).', 'Mirror image: upright, same size, left–right swapped.'),
    remember('A shadow forms only behind an opaque object; an image needs light to reach your eye from the object.'),
    tip('Write your name on paper and hold it up to a mirror — what do you notice?'),
  ],
  examples: [
    ex('Give two differences between your shadow and your image in a mirror.', ['The shadow is dark; the image shows colours of your clothes.', 'The shadow shows only an outline; the image shows your eyes, nose and details.', 'A shadow forms when light is blocked; an image forms when light is reflected.'], 'Shadow: dark outline from blocked light. Image: coloured and detailed from reflected light.'),
    ex('Why is the word AMBULANCE written in reverse on the front of the vehicle?', ['Drivers ahead see it in their rear-view mirror.', 'A mirror swaps left and right.', 'So the reversed word appears correctly.'], 'So that it reads correctly in a mirror.'),
  ],
  practice: [
    sortT('is', 'true of a shadow', 'true of an image', [
      ['Always dark', true], ['Shows only the outline', true], ['Formed when light is blocked', true], ['Needs an opaque object', true],
      ['Shows the colours of the object', false], ['Formed by reflection in a mirror', false], ['Shows details like eyes and nose', false], ['Can be seen in still water', false],
    ], ['Blocked light → shadow; reflected light → image.'], 'Shadows are dark outlines made by blocked light; images show colour and detail made by reflected light.'),
    mcq('img-q', 'Images come from reflected light.', [
      ['Light bouncing back from a mirror is called…', 'Reflection', ['Shadow', 'Evaporation', 'Conduction'], 'Re-flect = bend back.', 'Reflection is light bouncing back from a surface.'],
      ['When you raise your right hand in front of a mirror, your image raises its…', 'Left hand', ['Right hand', 'Both hands', 'No hand'], 'Left and right swap.', 'A mirror swaps left and right.'],
      ['Which surface gives the clearest image?', 'A plane mirror', ['A brick wall', 'Rough wood', 'A cloth'], 'Smooth and shiny.', 'Smooth shiny surfaces reflect light regularly.'],
      ['The image in a plane mirror is…', 'Upright and the same size', ['Upside down and smaller', 'Always dark', 'Bigger and upside down'], 'Look at yourself.', 'A plane mirror gives an upright, same-size image.'],
      ['Which can show the colour of your shirt?', 'Your image in a mirror', ['Your shadow', 'Both', 'Neither'], 'Shadows are always dark.', 'Images show colour; shadows do not.'],
      ['Why is AMBULANCE written in reverse on the vehicle?', 'So it reads correctly in a mirror', ['It is a spelling mistake', 'To look stylish', 'So that nobody can read it'], 'Drivers ahead look in their mirrors.', 'Mirrors swap left and right, making the word read correctly.'],
    ]),
    tapT('shiny', 'Tap every surface that can form an image of your face.', [
      ['Plane mirror', true], ['Still pond water', true], ['Polished steel plate', true], ['Shiny new spoon', true],
      ['Brick wall', false], ['Cotton cloth', false], ['Rough wooden plank', false], ['Paper', false],
    ], ['Smooth and shiny surfaces reflect light well.'], 'Mirrors, still water and polished metals form images; rough surfaces do not.'),
  ],
};

const ch15: USpec = { id: 'ts6.sc.ch15', subject: 'physics', title: 'Light, Shadows and Images', source: src(15), objectives: [lt1, lt2, lt3] };

// =====================================================================================
// Chapter 16 — Living and Non-living
// =====================================================================================
const lv1: OSpec = {
  id: 'ts6.sc.living.traits', title: 'Characteristics of living things', prereqs: [],
  intro: [
    h('Alive or not?'),
    photo('🌱', 'A seed looks lifeless, but given water and warmth it sprouts — it is alive.'),
    p('A bus moves, a fire grows bigger and a clock ticks — but they are not alive. How do we decide? Living things show ALL of these features together:'),
    keys('Movement: animals move from place to place; plants move their parts (sunflower faces the sun, touch-me-not folds its leaves).', 'Need for food: for energy and growth. Plants make their own; animals eat.', 'Growth: living things grow by themselves from inside.', 'Breathing (respiration): they take in air and release energy from food.', 'Excretion: they remove wastes from their bodies.', 'Reproduction: they produce young ones of their own kind.', 'Response to changes (stimuli) around them, and a fixed life span — they are born and they die.'),
    def('Stimulus', 'A change in the surroundings that a living thing responds to — light, heat, touch, sound, smell.'),
    remember('A seed is living: it is resting (dormant) and grows when it gets water, air and warmth.'),
    tip('A thing must show all the features — not just one — to be called living. A car moves and "takes in" fuel, but it does not grow or reproduce.'),
  ],
  examples: [
    ex('A car moves and uses fuel. Is it living?', ['It moves, but only when someone drives it.', 'It does not grow, reproduce or respond by itself.', 'So it lacks most features of living things.'], 'No — it is non-living.'),
    ex('How does the touch-me-not (attapatti) plant show it is living?', ['It responds to touch by folding its leaves.', 'Responding to a stimulus is a feature of living things.'], 'It responds to touch (a stimulus).'),
  ],
  practice: [
    sortT('ln', 'living', 'non-living', [
      ['Seed', true], ['Mushroom', true], ['Earthworm', true], ['Neem tree', true], ['Bacteria', true], ['Hen’s chick', true],
      ['Car', false], ['Cloud', false], ['Fire', false], ['Clock', false], ['River water', false], ['Robot toy', false],
    ], ['Does it grow, feed, breathe, excrete and reproduce by itself?'], 'Living things show all the life features; fire, clouds and machines may move or grow in size but do not breathe, reproduce or feed by themselves.'),
    matchT('trait', 'example to the feature of living things it shows', [
      ['A hen lays eggs', 'Reproduction'], ['A puppy becomes a dog', 'Growth'], ['A sunflower turns to the sun', 'Response to light'], ['We sweat and pass urine', 'Excretion'], ['A goat eats grass', 'Need for food'], ['A fish takes in oxygen from water', 'Breathing'],
    ], ['Which life feature does each one show?'], 4),
    mcq('trait-q', 'Living things show all the life features together.', [
      ['Which feature is NOT shown by a moving bus?', 'Reproduction', ['Movement', 'Using fuel', 'Making sound'], 'Can a bus make baby buses?', 'Non-living things cannot reproduce.'],
      ['Why do we say a seed is living?', 'It can grow into a plant when conditions are right', ['It is hard', 'It is small', 'It is brown'], 'Give it water and warmth.', 'A dormant seed grows when it gets water, air and warmth.'],
      ['Removing wastes from the body is called…', 'Excretion', ['Reproduction', 'Respiration', 'Movement'], 'Sweat and urine.', 'Excretion removes waste.'],
      ['A change around us that we respond to is called a…', 'Stimulus', ['Habitat', 'Fibre', 'Joint'], 'Light, heat, touch…', 'A stimulus is a change we respond to.'],
      ['Plants show movement by…', 'Moving their parts, like leaves and flowers', ['Walking', 'Flying', 'Swimming'], 'Think of the touch-me-not.', 'Plants move parts but do not move from place to place.'],
    ]),
  ],
};

const lv2: OSpec = {
  id: 'ts6.sc.living.microscope', title: 'The microscope', prereqs: ['ts6.sc.living.traits'],
  intro: [
    h('Seeing the invisible'),
    photo('🔬', 'A compound microscope in the school laboratory.'),
    p('Some living things and the parts of our body are too small to see with our eyes. A microscope uses lenses to make them look many times bigger (magnified).'),
    p('In 1665 Robert Hooke saw tiny box-like cells in a thin slice of cork. A few years later, Antonie van Leeuwenhoek, using his own tiny lenses, became the first person to see bacteria and other microbes in a drop of water.'),
    keys('Eyepiece: the lens you look through.', 'Objective lens: the lens close to the object.', 'Stage: the flat plate where the glass slide is placed, held by clips.', 'Mirror: reflects light up through the slide.', 'Coarse and fine adjustment knobs: move the tube up or down to focus.', 'Arm and base: to hold and support the microscope.'),
    def('Magnification', 'How many times bigger the object looks. Total magnification = magnification of eyepiece × magnification of objective.'),
    xp({
      title: 'What if? Change the lenses', formula: 'Total magnification = eyepiece × objective',
      res: ['M', 'Total magnification', '×', 'e * o', 0],
      vars: [['e', 'Eyepiece magnification', '×', 5, 15, 5, 10], ['o', 'Objective magnification', '×', 4, 100, 1, 10]],
      notes: [['e', 'A stronger eyepiece multiplies the whole picture.', 'A weaker eyepiece shows less detail.'], ['o', 'A stronger objective makes everything look bigger.', 'A weaker objective shows a wider area but less detail.']],
      mistakes: [['Adding the two numbers', 'Each lens multiplies the size made by the other, so multiply: 10 × 40 = 400, not 50.']],
      real: 'With a 10× eyepiece and a 40× objective, an onion cell looks 400 times bigger.',
    }),
    remember('Always carry a microscope with one hand under the base and one on the arm.'),
    tip('Focus first with the low-power objective, then switch to the higher one.'),
  ],
  examples: [
    ex('A microscope has a 10× eyepiece and a 40× objective. What is the total magnification?', ['Total = eyepiece × objective', '10 × 40 = 400'], '400×'),
    ex('Which part of the microscope do you turn to make a blurred image sharp?', ['Focusing is done by moving the tube up or down.', 'The coarse knob moves it quickly; the fine knob makes small changes.'], 'The adjustment (focusing) knobs'),
  ],
  practice: [
    tp('mag', (r) => {
      const e = r.pick([5, 10, 15]), o = r.pick([4, 10, 40, 100]);
      return numQ(`A microscope has an eyepiece of ${e}× and an objective of ${o}×. What is the total magnification? (Type the number only.)`, e * o, undefined,
        ['Total magnification = eyepiece × objective.'],
        [`${e} × ${o} = ${e * o}`, `The object looks ${e * o} times bigger.`],
        [{ when: String(e + o), explain: 'You added. The magnifications multiply.' }]);
    }),
    matchT('parts', 'microscope part to its job', [
      ['Eyepiece', 'Lens you look through'], ['Objective lens', 'Lens nearest the slide'], ['Stage', 'Holds the glass slide'], ['Mirror', 'Sends light up through the slide'], ['Adjustment knob', 'Focuses the image'], ['Base', 'Supports the microscope'],
    ], ['Go from top to bottom of the microscope.'], 4),
    mcq('hist', 'Hooke saw cells; Leeuwenhoek saw microbes.', [
      ['Who first saw cells in a slice of cork?', 'Robert Hooke', ['Edison', 'Newton', 'Louis Pasteur'], 'In 1665.', 'Robert Hooke described cork cells in 1665.'],
      ['Who first saw bacteria using his own lenses?', 'Antonie van Leeuwenhoek', ['Robert Hooke', 'Charles Darwin', 'C. V. Raman'], 'A Dutch lens-maker.', 'Leeuwenhoek first observed microbes.'],
      ['The slide is placed on the…', 'Stage', ['Eyepiece', 'Mirror', 'Base'], 'A flat plate with clips.', 'The stage holds the slide.'],
      ['Which part reflects light onto the slide?', 'Mirror', ['Eyepiece', 'Arm', 'Clip'], 'It is at the bottom.', 'The mirror reflects light up through the slide.'],
      ['How should you carry a microscope?', 'One hand on the arm, one under the base', ['By the eyepiece', 'By the mirror', 'Upside down'], 'Support its weight safely.', 'Hold the arm and support the base.'],
    ]),
  ],
};

const lv3: OSpec = {
  id: 'ts6.sc.living.bacteria', title: 'Bacteria — tiny living things', prereqs: ['ts6.sc.living.microscope'],
  intro: [
    h('Everywhere, but invisible'),
    photo('🧪', 'Scientists grow bacteria in the laboratory to study them.'),
    def('Bacteria', 'Very tiny living things made of a single cell, seen only with a microscope. They live in soil, water, air, food and inside our bodies.'),
    p('Bacteria come in different shapes: rod-shaped, round (spherical), spiral and comma-shaped. They feed, grow, breathe and multiply very fast by dividing into two.'),
    h('Useful bacteria'),
    keys('Turn milk into curd, and help make cheese and idli/dosa batter rise.', 'Break down dead plants and animals into manure, cleaning the environment.', 'Bacteria in the root nodules of pulses (beans, peas) add nitrogen to the soil.', 'Good bacteria in our intestines help digestion.'),
    h('Harmful bacteria'),
    keys('Cause diseases such as cholera, typhoid and tuberculosis (TB).', 'Spoil food.'),
    p('We protect ourselves by washing hands with soap, drinking boiled or treated water, covering food, keeping our surroundings clean and getting vaccinated.'),
    remember('Not all bacteria are harmful — most are harmless and many are very useful.'),
    tip('Wash your hands with soap for at least 20 seconds before eating and after using the toilet.'),
  ],
  examples: [
    ex('Give one useful and one harmful effect of bacteria.', ['Useful: they turn milk into curd.', 'Harmful: some cause cholera through dirty water.'], 'Useful: curd making. Harmful: diseases like cholera.'),
    ex('Why do farmers grow pulses in a field after a crop of paddy?', ['Pulses have bacteria in their root nodules.', 'These bacteria add nitrogen to the soil.', 'This makes the soil fertile for the next crop.'], 'Bacteria in pulse roots enrich the soil with nitrogen.'),
  ],
  practice: [
    sortT('uh', 'useful', 'harmful', [
      ['Turning milk into curd', true], ['Adding nitrogen to soil in pulse roots', true], ['Making compost from waste', true], ['Helping digestion in the intestine', true], ['Making idli batter rise', true],
      ['Causing cholera', false], ['Causing typhoid', false], ['Spoiling cooked food', false], ['Causing tuberculosis', false],
    ], ['Does it help us, or harm us?'], 'Bacteria help in curd, compost, soil fertility and digestion; some cause diseases and spoil food.'),
    mcq('bac', 'Bacteria are tiny one-celled living things.', [
      ['Bacteria are made of…', 'One cell', ['Many organs', 'Bones', 'Leaves'], 'They are the tiniest living things.', 'Bacteria are single-celled.'],
      ['We can see bacteria only with a…', 'Microscope', ['Telescope', 'Magnet', 'Mirror'], 'They are invisible to the eye.', 'A microscope magnifies them.'],
      ['Which disease is caused by bacteria?', 'Typhoid', ['A broken bone', 'Short sight', 'Sunburn'], 'Spread through unclean food and water.', 'Typhoid is a bacterial disease.'],
      ['Bacteria in the root nodules of pulses…', 'Add nitrogen to the soil', ['Eat the roots', 'Make the plant blue', 'Stop rain'], 'They make soil fertile.', 'They fix nitrogen, enriching the soil.'],
      ['Which habit protects us from harmful bacteria?', 'Washing hands with soap', ['Eating uncovered food', 'Drinking unboiled pond water', 'Skipping baths'], 'Clean hands, fewer germs.', 'Soap removes germs from our hands.'],
      ['Bacteria multiply by…', 'Dividing into two', ['Laying eggs', 'Making seeds', 'Budding flowers'], 'One becomes two, two become four…', 'A bacterium splits into two new cells.'],
    ]),
    tapT('protect', 'Tap every habit that protects us from harmful bacteria.', [
      ['Washing hands before eating', true], ['Drinking boiled water', true], ['Covering cooked food', true], ['Keeping surroundings clean', true], ['Getting vaccinated', true],
      ['Eating food from open roadside stalls with flies', false], ['Drinking water straight from a pond', false], ['Leaving garbage near the house', false],
    ], ['Which habits keep germs away from our food, water and hands?'], 'Clean hands, safe water, covered food, clean surroundings and vaccines protect us.'),
  ],
};

const ch16: USpec = { id: 'ts6.sc.ch16', subject: 'biology', title: 'Living and Non-living', source: src(16), objectives: [lv1, lv2, lv3] };

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16];
