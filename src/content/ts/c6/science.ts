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

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8];
void [rd, who, xp]; // TEMP
