// Telangana SCERT Class 7 — General Science (17 chapters). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json → classes["7"].subjects["science"]). Explanations, examples and practice are
// written for WonderLab. The app groups physics/chemistry/biology units under "Science" for Class 7.
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, stepsB, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(7, 'science', n);
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

const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, steps), hints,
  mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
  solution: [...steps.map((s, i) => `${i + 1}. ${s}`), why],
}), d);

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

/** Typed numeric item, optionally with a unit. */
const numQ = (prompt: string, ans: number, unit: string | undefined, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, true) : approx(ans, rel),
  hints, solution,
  mistakes: [
    ...(unit ? [{ when: 'missing-unit', explain: `Add the unit (${unit}). A number alone does not say what was measured.` }, { when: 'wrong-unit', explain: `That unit measures something else. Give the answer in ${unit}.` }] : []),
    ...mistakes,
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
// Chapter 1 — Food Components
// =====================================================================================
const ch1: USpec = {
  id: 'ts7.sc.ch1', subject: 'biology', title: 'Food Components', source: src(1),
  objectives: [
    {
      id: 'ts7.sc.food.nutrients', title: 'Why we eat: the five main food components', prereqs: [],
      intro: [
        h('Food is fuel, building material and protection'),
        photo('🍌', 'A banana gives quick energy, a glass of milk helps build the body, and fruits and vegetables keep us healthy.'),
        p('Think of a school day: you walk, play kabaddi, think hard in maths class and grow taller every year. All of this needs food. Food gives us energy to work, materials to grow and repair the body, and substances that protect us from disease.'),
        p('The useful substances in food are called nutrients (food components). The main ones are carbohydrates, proteins, fats, vitamins and minerals. Water and roughage are also needed, though they give no energy.'),
        def('Nutrient', 'A substance in food that the body uses for energy, growth, repair or protection.'),
        stepsB(
          'Carbohydrates — the main energy givers: rice, jowar roti, ragi, wheat, potato, sugar, jaggery.',
          'Proteins — body-building foods for growth and repair: dal, chana, eggs, fish, meat, milk, paneer, groundnuts.',
          'Fats — store a lot of energy in a small amount: oil, ghee, butter, groundnuts, coconut.',
          'Vitamins — protect us from disease: A (carrots, papaya, leafy greens), C (amla, guava, lemon), D (sunlight, milk, egg yolk).',
          'Minerals — small amounts for bones, blood and more: calcium (milk, ragi), iron (leafy greens, jaggery), iodine (iodised salt).',
        ),
        p('When a nutrient is missing from the diet for a long time, a deficiency disease can follow: night blindness (vitamin A), scurvy with bleeding gums (vitamin C), rickets with soft, bent bones (vitamin D), anaemia (iron) and goitre, a swollen neck gland (iodine).'),
        keys('Carbohydrates and fats → energy.', 'Proteins → growth and repair (body-building).', 'Vitamins and minerals → protection and proper working of the body.', 'Missing nutrients over a long time → deficiency diseases.'),
        remember('Fats give about twice as much energy as the same mass of carbohydrates, so a little oil goes a long way.'),
        tip('A typical Telangana meal of rice, dal, a leafy curry like thotakura pappu, curd and a little ghee already covers most nutrients.'),
      ],
      examples: [
        ex('Kiran plays cricket all afternoon and feels tired. Which food component will give him energy quickly?', ['Energy-giving foods are carbohydrates and fats.', 'Carbohydrates like rice, roti or a banana are digested quickly.'], 'Carbohydrates (e.g. a banana or jowar roti)'),
        ex('A child often has bleeding gums. Which vitamin is probably missing and which local foods supply it?', ['Bleeding gums are a sign of scurvy.', 'Scurvy is caused by lack of vitamin C.', 'Amla, guava, oranges and lemons are rich in vitamin C.'], 'Vitamin C — eat amla, guava or lemon'),
      ],
      practice: [
        mcq('role', 'Recall what each nutrient mainly does.', [
          ['Which nutrient is called a "body-building" food?', 'Proteins', ['Carbohydrates', 'Fats', 'Water'], 'It helps you grow and repairs injuries.', 'Proteins build and repair muscles, skin and other body parts.'],
          ['Rice, jowar and potatoes are rich in…', 'Carbohydrates', ['Proteins', 'Vitamins', 'Minerals'], 'These are starchy foods.', 'Starchy foods are rich in carbohydrates, the main energy givers.'],
          ['Iodised salt protects us from…', 'Goitre', ['Scurvy', 'Rickets', 'Night blindness'], 'Iodine is needed by the thyroid gland in the neck.', 'Lack of iodine makes the thyroid gland swell — goitre.'],
          ['Night blindness is caused by lack of…', 'Vitamin A', ['Vitamin C', 'Vitamin D', 'Iron'], 'Carrots and papaya are rich in this vitamin.', 'Vitamin A is needed for healthy eyes; its lack causes night blindness.'],
          ['Soft and bent bones in children (rickets) are due to lack of…', 'Vitamin D', ['Vitamin C', 'Iodine', 'Protein'], 'Our skin makes this vitamin in sunlight.', 'Vitamin D helps the body use calcium to make strong bones.'],
          ['Which food gives the MOST energy per spoonful?', 'Ghee', ['Cucumber', 'Water', 'Lemon juice'], 'Think of fats.', 'Ghee is almost pure fat, which stores the most energy for its mass.'],
          ['Leafy vegetables and jaggery help prevent anaemia because they contain…', 'Iron', ['Iodine', 'Vitamin C', 'Fat'], 'Anaemia is a lack of healthy red blood.', 'Iron is needed to make haemoglobin in red blood cells.'],
        ]),
        matchT('match-food', 'food to the nutrient it is richest in', [
          ['Ragi mudda', 'Carbohydrates'], ['Toor dal', 'Proteins'], ['Groundnut oil', 'Fats'], ['Amla', 'Vitamin C'], ['Iodised salt', 'Iodine (mineral)'], ['Boiled egg', 'Proteins'],
        ], ['Starchy → carbohydrate; pulses and eggs → protein; oils → fat.', 'Sour fruits like amla are famous for vitamin C.']),
        matchT('match-disease', 'deficiency disease to the missing nutrient', [
          ['Scurvy', 'Vitamin C'], ['Rickets', 'Vitamin D'], ['Night blindness', 'Vitamin A'], ['Goitre', 'Iodine'], ['Anaemia', 'Iron'], ['Beriberi', 'Vitamin B1'],
        ], ['Eyes → vitamin A, gums → vitamin C, bones → vitamin D.', 'Swollen neck → iodine; tiredness and pale skin → iron.']),
        tapT('tap-energy', 'Tap every food that is mainly an ENERGY-GIVING food (carbohydrate or fat).', [
          ['Jowar roti', true], ['Rice', true], ['Ghee', true], ['Sugar', true], ['Potato', true], ['Moong dal', false], ['Boiled egg', false], ['Iodised salt', false], ['Water', false],
        ], ['Starchy, sweet or oily foods give energy.', 'Dal and eggs are mainly protein; salt and water give no energy.'], 'Carbohydrates (starch, sugar) and fats are the energy foods.'),
      ],
    },
    {
      id: 'ts7.sc.food.roughage', title: 'Roughage, water and a balanced diet', prereqs: ['ts7.sc.food.nutrients'],
      intro: [
        h('The parts of food we do not digest still matter'),
        photo('🥕', 'Carrots, leafy greens, fruit with peel and whole grains are full of roughage.'),
        p('Roughage (dietary fibre) is the part of plant food that our body cannot digest. It comes from the cell walls of plants. It gives no energy, yet it is very important: it adds bulk to food and helps food and waste move smoothly through the intestines. This prevents constipation.'),
        def('Roughage', 'Undigested plant fibre in food that helps the body get rid of undigested food and prevents constipation.'),
        p('Good sources: whole grains (jowar, ragi, bajra, unpolished rice), pulses with skin, leafy vegetables, beans, carrots, fruits like guava, and fruit peels. Refined maida and polished rice have little roughage.'),
        p('Water is also essential. It helps us absorb nutrients, carries waste out as urine and sweat, and keeps body temperature steady. In Telangana summers, when the temperature crosses 40 °C, we lose a lot of water as sweat, so drinking enough water, buttermilk or ambali matters.'),
        h('A balanced diet'),
        p('A balanced diet contains all the nutrients, plus roughage and water, in the right amounts for a person\'s age and work. A farm worker needs more energy foods than someone who sits at a desk; a growing child needs plenty of protein.'),
        keys('Roughage is not digested but helps waste move out.', 'Sources: whole grains, pulses, vegetables, fruits.', 'Water helps absorption, removes wastes, controls body temperature.', 'Balanced diet = all nutrients + roughage + water in the right amounts.'),
        remember('Too much of one food is also unhealthy: eating lots of fried snacks gives too much fat and can lead to obesity.'),
      ],
      examples: [
        ex('Priya eats only white bread and biscuits and often has constipation. What should she add to her diet?', ['Constipation is often due to too little roughage.', 'White bread and biscuits are made from refined flour with little fibre.', 'Add roughage: fruits, leafy vegetables, whole grains and plenty of water.'], 'More roughage (fruit, vegetables, whole grains) and water'),
        ex('Is a plate of rice with sambar, cabbage curry, curd and a guava a balanced meal? Explain.', ['Rice → carbohydrate; dal in sambar → protein; curd → protein and calcium.', 'A little oil in cooking → fat; cabbage and guava → vitamins, minerals and roughage.', 'With water, all components are present.'], 'Yes — it has all nutrients plus roughage'),
      ],
      practice: [
        mcq('fibre', 'Roughage comes from plant fibre.', [
          ['Roughage mainly helps the body to…', 'Get rid of undigested food and prevent constipation', ['Give lots of energy', 'Build muscles', 'Make strong bones'], 'It is not digested at all.', 'Roughage adds bulk and helps waste move through the intestines.'],
          ['Which food has the MOST roughage?', 'Guava with its peel', ['Sugar', 'Ghee', 'Maida biscuits'], 'Look for whole plant parts.', 'Fruits with peel are rich in fibre; sugar, ghee and maida have almost none.'],
          ['Which of these is NOT a function of water in the body?', 'Building muscles', ['Removing wastes in urine', 'Controlling body temperature through sweat', 'Helping absorb nutrients'], 'Muscle-building is the job of a nutrient.', 'Proteins build muscles; water transports, cools and removes wastes.'],
          ['A balanced diet means…', 'All nutrients, roughage and water in the right amounts', ['Only protein foods', 'Eating as much as possible', 'Only fruits and vegetables'], 'Balance = everything in proper proportion.', 'A balanced diet contains every component in the amount the body needs.'],
          ['Eating too much fried food regularly can cause…', 'Obesity', ['Scurvy', 'Night blindness', 'Goitre'], 'Fried food has a lot of fat.', 'Too much fat and energy is stored in the body and causes obesity.'],
        ]),
        tapT('tap-rough', 'Tap every food that is a GOOD source of roughage.', [
          ['Leafy vegetables', true], ['Whole jowar', true], ['Carrots', true], ['Apple with peel', true], ['Rajma (kidney beans)', true],
          ['Sugar', false], ['Butter', false], ['Maida', false], ['Milk', false],
        ], ['Roughage is plant fibre.', 'Refined, fatty and animal foods contain very little fibre.'], 'Whole plant foods contain fibre; refined flour, sugar, fats and milk do not.'),
        mcq('who', 'Different people need different amounts.', [
          ['Who needs the most energy-giving food?', 'A farmer ploughing a field all day', ['A person sleeping all day', 'A baby sleeping', 'A clerk working at a desk'], 'More physical work burns more energy.', 'Hard physical work uses up more energy, so more carbohydrates and fats are needed.'],
          ['A growing 12-year-old especially needs plenty of…', 'Proteins and calcium', ['Only fats', 'Only sugar', 'Only water'], 'Growth means building new body parts.', 'Proteins build tissues and calcium builds bones during growth.'],
          ['On a hot May afternoon in Nizamabad, the most important thing to drink often is…', 'Water or buttermilk', ['Nothing', 'Only cold drinks with sugar', 'Hot oil'], 'You sweat a lot in heat.', 'Water lost as sweat must be replaced to avoid dehydration.'],
          ['Why is polished white rice less healthy than unpolished rice?', 'Polishing removes fibre and some vitamins', ['It has more protein', 'It has more fibre', 'It has no carbohydrate'], 'Think about the outer layer of the grain.', 'The bran layer, rich in fibre and B vitamins, is removed by polishing.'],
          ['A pregnant woman needs extra…', 'Proteins, iron and calcium', ['Only sugar', 'Only oil', 'Nothing extra'], 'She is building another body.', 'Growth of the baby needs body-building proteins and minerals like iron and calcium.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.food.tests', title: 'Testing food for starch, protein and fat', prereqs: ['ts7.sc.food.nutrients'],
      intro: [
        h('Be a food detective'),
        photo('🧪', 'Simple chemicals in test tubes can show which nutrients are present in a food.'),
        p('How do we know that potato has starch or that groundnuts have fat? We can test foods in the school laboratory with a few simple chemicals. Always do these tests with your teacher, and never taste the chemicals.'),
        h('Test for starch'),
        stepsB('Take a small piece of the food (or a few drops of its paste in water).', 'Add 2–3 drops of dilute iodine solution.', 'A blue-black colour means starch is present.'),
        h('Test for protein'),
        stepsB('Grind the food and mix with a little water in a test tube.', 'Add 2 drops of copper sulphate solution.', 'Add 10 drops of caustic soda (sodium hydroxide) solution and shake.', 'A violet (purple) colour means protein is present.'),
        h('Test for fat'),
        stepsB('Rub or crush a little food on a piece of plain paper.', 'Let it dry for a few minutes and hold it up to the light.', 'An oily, translucent (see-through) patch means fat is present.'),
        keys('Starch + iodine → blue-black.', 'Protein + copper sulphate + caustic soda → violet.', 'Fat → oily, translucent patch on paper.'),
        remember('A drop of water also makes paper translucent, but it disappears when the paper dries. A fat patch stays.'),
        tip('Many foods contain more than one nutrient. Groundnuts give a violet colour AND an oily patch: they have both protein and fat.'),
      ],
      examples: [
        ex('A drop of iodine on a slice of raw potato turns blue-black. What does this show?', ['Iodine turns blue-black only with starch.'], 'Potato contains starch'),
        ex('Sana crushes a groundnut on paper and sees a translucent patch that stays after drying. She also gets a violet colour with copper sulphate and caustic soda. Conclude.', ['A lasting translucent patch → fat.', 'Violet colour → protein.'], 'Groundnut contains both fat and protein'),
      ],
      practice: [
        mcq('result', 'Recall the colour or sign for each test.', [
          ['Iodine solution turns blue-black when it touches…', 'Starch', ['Fat', 'Protein', 'Water'], 'Think of the potato test.', 'Blue-black with iodine is the test for starch.'],
          ['In the protein test, the colour that shows protein is…', 'Violet', ['Blue-black', 'Yellow', 'Green'], 'Copper sulphate + caustic soda.', 'Proteins turn violet with copper sulphate and caustic soda.'],
          ['An oily patch on paper that does not dry away shows…', 'Fat', ['Starch', 'Protein', 'Vitamin C'], 'Oil and ghee leave such marks.', 'Fat makes paper translucent permanently.'],
          ['Which chemicals are used to test for protein?', 'Copper sulphate and caustic soda', ['Iodine only', 'Lime water', 'Vinegar and salt'], 'Two solutions are added.', 'Copper sulphate followed by caustic soda gives violet if protein is present.'],
          ['Cooked rice with iodine turns blue-black. Rice is rich in…', 'Starch (carbohydrate)', ['Fat', 'Protein', 'Iodine'], 'Which nutrient does iodine detect?', 'A blue-black colour shows starch.'],
          ['Why must you wait for the paper to dry in the fat test?', 'Water also makes paper translucent, but only for a while', ['Fat needs time to turn blue', 'Paper changes colour slowly', 'To kill germs'], 'Two liquids can make paper see-through.', 'A water patch dries and vanishes; a fat patch stays.'],
        ]),
        matchT('match-test', 'food test result to what it shows', [
          ['Blue-black with iodine', 'Starch present'], ['Violet with CuSO₄ + caustic soda', 'Protein present'], ['Lasting translucent patch on paper', 'Fat present'], ['No change with iodine', 'No starch'],
        ], ['Each colour belongs to one nutrient.', 'No colour change means the nutrient is absent.']),
        orderT('order-protein', 'Put the steps of the PROTEIN test in order.', [
          'Grind a small amount of the food', 'Mix it with a little water in a test tube', 'Add 2 drops of copper sulphate solution', 'Add about 10 drops of caustic soda and shake', 'Look for a violet colour',
        ], ['First prepare the food sample.', 'Copper sulphate goes in before caustic soda.'], 'The food must be ground and mixed with water before the two solutions are added; violet shows protein.'),
        tapT('tap-starch', 'Tap every food that would turn BLUE-BLACK with iodine.', [
          ['Potato', true], ['Rice', true], ['Wheat flour', true], ['Ragi', true], ['Bread', true],
          ['Groundnut oil', false], ['Boiled egg white', false], ['Plain water', false], ['Sugar solution', false],
        ], ['Blue-black means starch.', 'Sugar is a carbohydrate but not starch.'], 'Starchy foods turn blue-black; oil, egg white, water and sugar do not contain starch.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Acids and Bases
// =====================================================================================
const ch2: USpec = {
  id: 'ts7.sc.ch2', subject: 'chemistry', title: 'Acids and Bases', source: src(2),
  objectives: [
    {
      id: 'ts7.sc.acid.taste', title: 'Sour and bitter: acids and bases in our food', prereqs: [],
      intro: [
        h('Why is tamarind sour and karela bitter?'),
        photo('🍊', 'Citrus fruits taste sour because they contain citric acid.'),
        p('Pulihora tastes sour because of tamarind, curd tastes sour, and lemon juice makes your face scrunch up. Sour taste comes from substances called acids. The word comes from the Latin "acere", meaning sour.'),
        p('Some substances taste bitter and feel soapy or slippery when rubbed between fingers. These are called bases. Baking soda, soap, lime water and washing soda are bases. Bases that dissolve in water are called alkalis.'),
        def('Acid', 'A substance that tastes sour and turns blue litmus red.'),
        def('Base', 'A substance that tastes bitter, feels soapy and turns red litmus blue.'),
        stepsB('Lemon, orange, amla → citric acid (amla also has ascorbic acid, vitamin C)', 'Curd, buttermilk → lactic acid', 'Tamarind, grapes → tartaric acid', 'Vinegar → acetic acid', 'Ant sting, nettle sting → formic acid', 'Our stomach → hydrochloric acid (helps digestion)'),
        p('Substances that are neither acidic nor basic, like pure water and sugar solution, are called neutral.'),
        keys('Acids: sour. Bases: bitter and soapy.', 'Natural acids: citric, lactic, tartaric, acetic, formic.', 'Common bases: baking soda, soap, lime water, washing soda.', 'Neutral: pure water, sugar solution, common salt solution.'),
        remember('Never taste or touch unknown chemicals in the laboratory. Strong acids and bases burn the skin. We use indicators instead of tasting.'),
      ],
      examples: [
        ex('Which acid makes curd sour, and which makes vinegar sour?', ['Curd is formed when bacteria in milk make lactic acid.', 'Vinegar contains acetic acid.'], 'Curd → lactic acid; vinegar → acetic acid'),
        ex('A liquid feels slippery between the fingers and tastes bitter (described in a book, not tested by tasting!). Acid or base?', ['Bitter taste and soapy feel are properties of bases.'], 'It is a base'),
      ],
      practice: [
        mcq('natural', 'Link the sour food to its acid.', [
          ['Tamarind used in pulihora contains…', 'Tartaric acid', ['Lactic acid', 'Formic acid', 'Acetic acid'], 'Grapes contain the same acid.', 'Tamarind and grapes contain tartaric acid.'],
          ['The acid in curd is…', 'Lactic acid', ['Citric acid', 'Acetic acid', 'Hydrochloric acid'], 'It comes from milk.', 'Bacteria change milk sugar into lactic acid, making curd sour.'],
          ['An ant sting hurts because it injects…', 'Formic acid', ['Citric acid', 'Tartaric acid', 'Baking soda'], 'Named after ants (Latin "formica").', 'Ants inject formic acid into the skin.'],
          ['Which of these is a base?', 'Baking soda', ['Lemon juice', 'Vinegar', 'Tamarind water'], 'Bases taste bitter.', 'Baking soda (sodium hydrogen carbonate) is a base; the others are acids.'],
          ['Which acid is found in our stomach?', 'Hydrochloric acid', ['Citric acid', 'Acetic acid', 'Formic acid'], 'It helps digest food.', 'The stomach makes hydrochloric acid to help digestion and kill germs.'],
          ['Which solution is neutral?', 'Sugar solution', ['Lemon juice', 'Soap solution', 'Lime water'], 'Neither sour nor bitter.', 'Sugar solution is neither acidic nor basic.'],
        ]),
        matchT('match-acid', 'substance to the acid it contains', [
          ['Lemon', 'Citric acid'], ['Curd', 'Lactic acid'], ['Vinegar', 'Acetic acid'], ['Tamarind', 'Tartaric acid'], ['Ant sting', 'Formic acid'], ['Stomach juice', 'Hydrochloric acid'],
        ], ['Sour fruits → citric; milk products → lactic.', 'Ants → formic (from Latin for ant).']),
        tapT('tap-base', 'Tap every substance that is a BASE.', [
          ['Soap solution', true], ['Baking soda', true], ['Lime water', true], ['Washing soda', true], ['Milk of magnesia', true],
          ['Lemon juice', false], ['Vinegar', false], ['Curd', false], ['Orange juice', false],
        ], ['Bases are bitter and soapy.', 'Sour things are acids.'], 'Soap, baking soda, lime water, washing soda and milk of magnesia are bases; sour foods are acids.'),
      ],
    },
    {
      id: 'ts7.sc.acid.indicators', title: 'Indicators: colour tells acid from base', prereqs: ['ts7.sc.acid.taste'],
      intro: [
        h('Let colours do the tasting'),
        photo('🌸', 'Flowers such as the china rose (hibiscus) contain natural colours that change in acids and bases.'),
        p('An indicator is a substance that shows a different colour in an acid and in a base. Indicators let us test substances safely without tasting them.'),
        def('Indicator', 'A substance that changes colour to show whether another substance is acidic, basic or neutral.'),
        stepsB(
          'Litmus (from lichens): blue litmus turns RED in acid; red litmus turns BLUE in base. Neutral: no change.',
          'Turmeric (pasupu): yellow stays yellow in acid, turns RED-brown in base. That is why a turmeric stain on a shirt turns red when washed with soap.',
          'China rose (mandara) petals: solution turns dark pink/magenta in acid and GREEN in base.',
          'Phenolphthalein (lab indicator): colourless in acid, PINK in base.',
        ),
        keys('Acid: blue litmus → red.', 'Base: red litmus → blue; turmeric → red; china rose → green; phenolphthalein → pink.', 'Neutral: no change in litmus.'),
        remember('Litmus is natural — it is extracted from lichens.'),
        tip('Memory trick: "BRA" — Blue turns Red in Acid.'),
      ],
      examples: [
        ex('A drop of soap solution falls on a turmeric stain. What colour appears and why?', ['Soap is a base.', 'Turmeric turns red in a base.'], 'Red, because soap is basic'),
        ex('Red litmus paper dipped in a liquid stays red; blue litmus dipped in the same liquid turns red. Classify the liquid.', ['Blue → red means acid.', 'Red staying red is consistent with acid.'], 'The liquid is an acid'),
      ],
      practice: [
        mcq('colour', 'Recall each indicator\'s colour change.', [
          ['Blue litmus turns red in…', 'An acid', ['A base', 'A neutral solution', 'Sugar solution'], 'BRA: Blue → Red in Acid.', 'Acids turn blue litmus red.'],
          ['Turmeric turns red when it touches…', 'A base such as soap', ['Lemon juice', 'Vinegar', 'Pure water'], 'Remember the stain on clothes.', 'Turmeric is yellow but turns red in basic solutions.'],
          ['China rose solution turns green in…', 'A base', ['An acid', 'Neutral water', 'Sugar solution'], 'In acid it is magenta.', 'China rose indicator is magenta in acid and green in base.'],
          ['Phenolphthalein turns pink in…', 'A base', ['An acid', 'Water', 'Salt solution'], 'It is colourless in acid.', 'Phenolphthalein is colourless in acids and pink in bases.'],
          ['A solution does not change the colour of either red or blue litmus. It is…', 'Neutral', ['Acidic', 'Basic', 'Very strong acid'], 'No change means neither.', 'Neutral solutions do not affect litmus.'],
          ['Litmus is obtained from…', 'Lichens', ['Turmeric roots', 'China rose petals', 'Rocks'], 'It is a natural dye.', 'Litmus is extracted from lichens.'],
        ]),
        tp('predict', (r) => {
          const subs: [string, 'acid' | 'base' | 'neutral'][] = [['lemon juice', 'acid'], ['vinegar', 'acid'], ['tamarind water', 'acid'], ['soap solution', 'base'], ['lime water', 'base'], ['baking soda solution', 'base'], ['sugar solution', 'neutral'], ['common salt solution', 'neutral']];
          const inds: [string, Record<'acid' | 'base' | 'neutral', string>][] = [
            ['blue litmus', { acid: 'Turns red', base: 'Stays blue', neutral: 'Stays blue' }],
            ['red litmus', { acid: 'Stays red', base: 'Turns blue', neutral: 'Stays red' }],
            ['turmeric paper', { acid: 'Stays yellow', base: 'Turns red', neutral: 'Stays yellow' }],
            ['phenolphthalein', { acid: 'Stays colourless', base: 'Turns pink', neutral: 'Stays colourless' }],
          ];
          const [s, kind] = r.pick(subs);
          const [ind, map] = r.pick(inds);
          const ans = map[kind];
          const wrong = [...new Set(Object.values(map))].filter((x) => x !== ans).concat(['Turns green', 'Turns black']);
          return {
            type: 'mcq', prompt: `What happens when ${s} is tested with ${ind}?`, ...choose(r, ans, wrong),
            hints: [`First decide: is ${s} an acid, a base or neutral?`, `Then recall what ${ind} does in that kind of solution.`],
            mistakes: [{ when: 'wrong', explain: `${s[0].toUpperCase() + s.slice(1)} is ${kind === 'neutral' ? 'neutral' : `a${kind === 'acid' ? 'n' : ''} ${kind}`}, so ${ind}: ${ans.toLowerCase()}.` }],
            solution: [`${s[0].toUpperCase() + s.slice(1)} is ${kind}.`, `${ind[0].toUpperCase() + ind.slice(1)}: ${ans.toLowerCase()}.`],
          };
        }),
        matchT('match-ind', 'indicator to its colour in a BASE', [
          ['Red litmus', 'Blue'], ['Turmeric', 'Red'], ['China rose', 'Green'], ['Phenolphthalein', 'Pink'],
        ], ['Each indicator has its own colour in base.', 'Turmeric and red litmus are easy to mix up — turmeric goes red, red litmus goes blue.'], 4),
      ],
    },
    {
      id: 'ts7.sc.acid.salts', title: 'Neutralisation, salts and manures for the soil', prereqs: ['ts7.sc.acid.indicators'],
      intro: [
        h('When an acid meets a base'),
        photo('🌾', 'Farmers check whether soil is acidic or basic before adding lime or manure.'),
        p('If you add a base to an acid little by little, the acid\'s effect gets weaker and weaker. At one point the solution becomes neutral. This reaction is called neutralisation. It produces a salt and water, and heat is given out.'),
        f('Acid + Base → Salt + Water (+ heat)', 'acid plus base gives salt plus water and heat'),
        p('Example: hydrochloric acid + sodium hydroxide → sodium chloride (common salt) + water. Salts are not always table salt — copper sulphate, washing soda and baking soda are salts too. Some salts are neutral, some acidic and some basic.'),
        def('Neutralisation', 'The reaction between an acid and a base that gives a salt and water and releases heat.'),
        h('Neutralisation in daily life'),
        stepsB(
          'Acidity / indigestion: too much stomach acid is neutralised by an antacid such as milk of magnesia.',
          'Ant sting: formic acid is neutralised by rubbing on a little baking soda paste.',
          'Acidic soil: farmers add slaked lime or quicklime (bases).',
          'Basic soil: farmers add organic matter — compost and farmyard manure — which releases acids as it rots.',
          'Factory waste is often acidic and is neutralised before being released into rivers.',
        ),
        p('Manures are natural fertilisers made from decayed plant and animal waste (cow dung, leaves, kitchen waste, vermicompost made by earthworms). They add humus and nutrients and improve soil texture. Using too many chemical fertilisers year after year can make soil acidic and harm soil life.'),
        keys('Acid + base → salt + water + heat.', 'Antacids, baking soda and lime are bases used to neutralise acids.', 'Manure/compost neutralises basic soil and improves it.', 'Salts form from acids and bases; they can be neutral, acidic or basic.'),
        remember('Neutralisation always releases heat — a test tube with acid and base gets warm.'),
      ],
      examples: [
        ex('Teja was bitten by an ant. What should be applied and why?', ['An ant sting injects formic acid.', 'A weak base neutralises the acid.', 'Baking soda paste or calamine solution is a mild base.'], 'Baking soda paste — a base neutralises the formic acid'),
        ex('A soil test in a farm near Mahabubnagar shows the soil is too acidic. What should be added?', ['Acidic soil needs a base.', 'Lime (calcium oxide / calcium hydroxide) is a cheap base.'], 'Quicklime or slaked lime'),
      ],
      practice: [
        mcq('neutral', 'Acid needs base; base needs acid.', [
          ['The products of neutralisation are…', 'Salt and water', ['Acid and base', 'Only water', 'Oxygen and hydrogen'], 'Acid + base → ? + ?', 'Neutralisation gives a salt and water.'],
          ['For acidity in the stomach, a doctor suggests…', 'Milk of magnesia (an antacid)', ['Vinegar', 'Lemon juice', 'More hydrochloric acid'], 'You need a mild base.', 'Antacids are mild bases that neutralise extra stomach acid.'],
          ['Acidic soil is treated with…', 'Lime', ['Vinegar', 'Tamarind', 'Lemon juice'], 'A base is needed.', 'Lime is a base that neutralises acidic soil.'],
          ['Basic soil is improved by adding…', 'Organic manure (compost)', ['Lime', 'Baking soda', 'Washing soda'], 'Rotting organic matter releases acids.', 'Compost releases acids as it decays and neutralises basic soil.'],
          ['During neutralisation the test tube becomes…', 'Warm', ['Ice-cold', 'Magnetic', 'Blue-black'], 'Energy is released.', 'Neutralisation gives out heat.'],
          ['Common salt (sodium chloride) can be made from hydrochloric acid and…', 'Sodium hydroxide', ['Vinegar', 'Citric acid', 'Sugar'], 'You need a base containing sodium.', 'HCl + NaOH → NaCl + water.'],
        ]),
        tapT('tap-neutral', 'Tap every situation that uses NEUTRALISATION.', [
          ['Taking an antacid for acidity', true], ['Rubbing baking soda on an ant sting', true], ['Adding lime to acidic soil', true], ['Treating acidic factory waste before release', true],
          ['Melting ice', false], ['Dissolving sugar in tea', false], ['Drying clothes in the sun', false],
        ], ['Look for an acid being cancelled by a base (or the reverse).', 'Melting and dissolving are not reactions between acids and bases.'], 'Each correct case cancels an acid with a base or a base with an acid.'),
        matchT('match-manure', 'term to its meaning', [
          ['Manure', 'Natural fertiliser from decayed plant and animal waste'], ['Vermicompost', 'Compost made with the help of earthworms'], ['Antacid', 'Mild base used for stomach acidity'], ['Salt', 'Product of an acid reacting with a base'], ['Neutral', 'Neither acidic nor basic'],
        ], ['Two terms relate to soil, two to chemistry and one to medicine.', 'Vermi- means worm.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Silk - Wool
// =====================================================================================
const ch3: USpec = {
  id: 'ts7.sc.ch3', subject: 'biology', title: 'Silk - Wool', source: src(3),
  objectives: [
    {
      id: 'ts7.sc.fibre.silk', title: 'The story of silk: sericulture', prereqs: [],
      intro: [
        h('From a tiny caterpillar to a Pochampally saree'),
        photo('🦋', 'The silk moth lays eggs; its caterpillar, the silkworm, spins the silk.'),
        p('Telangana is famous for silk: Pochampally ikat, Gadwal and Narayanpet sarees are woven by skilled weavers. But silk is not made in a factory — it is spun by an insect, the silk moth. Rearing silkworms to obtain silk is called sericulture.'),
        def('Sericulture', 'The rearing of silkworms (silk moth caterpillars) to obtain silk.'),
        h('Life cycle of the silk moth'),
        stepsB('Egg — the female moth lays hundreds of eggs.', 'Larva (caterpillar or silkworm) — hatches and eats mulberry leaves day and night, growing fast.', 'Pupa — the larva spins a covering of silk thread around itself, the cocoon.', 'Adult moth — comes out of the cocoon and the cycle repeats.'),
        h('From cocoon to cloth'),
        p('Cocoons are collected before the moths come out and are boiled or steamed. This kills the pupa and loosens the silk thread. The long thread is then unwound — this is called reeling the silk. Threads are twisted into yarn and woven into cloth. A single cocoon can give several hundred metres of thread!'),
        p('There are different kinds of silk: mulberry silk (the most common), tasar silk (from moths that feed on arjun and asan trees in forests — reared in parts of northern Telangana), eri silk and muga silk.'),
        keys('Silk comes from the cocoon of the silk moth.', 'Life cycle: egg → larva → pupa (cocoon) → moth.', 'Mulberry silkworms feed on mulberry leaves.', 'Reeling = unwinding thread from boiled cocoons.'),
        remember('Silk is a protein fibre made by an animal, like wool. Cotton and jute are plant fibres.'),
      ],
      examples: [
        ex('Why are cocoons put in hot water before reeling?', ['Hot water softens the gum that sticks the thread together.', 'It lets the long thread be unwound in one piece.'], 'To loosen the silk thread so it can be unwound'),
        ex('In which stage of the life cycle is silk produced?', ['The larva spins the cocoon when it is ready to become a pupa.', 'The cocoon is made of silk.'], 'Silk is spun by the larva as it turns into a pupa (cocoon stage)'),
      ],
      practice: [
        orderT('cycle', 'Put the life cycle of the silk moth in order.', ['Egg', 'Larva (silkworm)', 'Pupa inside cocoon', 'Adult silk moth'], ['It starts with what the moth lays.', 'The cocoon is made before the moth appears.'], 'Egg → larva → pupa → adult is a complete life cycle.'),
        orderT('process', 'Put the steps from silkworm to silk cloth in order.', ['Rear silkworms on mulberry leaves', 'Collect cocoons', 'Boil or steam the cocoons', 'Reel the silk thread', 'Weave the yarn into cloth'], ['Cocoons come before thread.', 'Reeling is unwinding — it needs boiled cocoons.'], 'Rearing → collecting → boiling → reeling → weaving.'),
        mcq('silk-facts', 'Think about the silk moth and its food.', [
          ['The rearing of silkworms is called…', 'Sericulture', ['Apiculture', 'Horticulture', 'Pisciculture'], 'Seri- comes from the word for silk.', 'Sericulture is silkworm farming. Apiculture is bee-keeping.'],
          ['Mulberry silkworms feed on…', 'Mulberry leaves', ['Neem leaves', 'Grass', 'Cotton bolls'], 'The name gives it away.', 'They eat mulberry leaves continuously.'],
          ['The silk thread is unwound from cocoons by a process called…', 'Reeling', ['Shearing', 'Scouring', 'Ginning'], 'Like winding thread onto a reel.', 'Reeling is unwinding silk from cocoons.'],
          ['Which stage of the silk moth spins the cocoon?', 'Larva (caterpillar)', ['Egg', 'Adult moth', 'Female moth only'], 'The silkworm is a caterpillar.', 'The caterpillar spins a cocoon around itself.'],
          ['Pochampally in Telangana is famous for…', 'Ikat silk sarees', ['Woollen shawls', 'Cotton ginning', 'Jute bags'], 'It is called the "Silk City".', 'Pochampally weavers make tie-and-dye ikat silk sarees.'],
          ['Tasar silk comes from silkworms that feed on…', 'Forest trees like arjun and asan', ['Mulberry leaves', 'Rice plants', 'Cotton'], 'It is a wild or forest silk.', 'Tasar silkworms feed on forest trees such as arjun and asan.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.fibre.wool', title: 'The story of wool: from fleece to yarn', prereqs: [],
      intro: [
        h('Warm fibres from hairy animals'),
        photo('🐑', 'A sheep\'s thick fleece traps air and keeps it warm. We use the same fleece to make wool.'),
        p('Wool is the soft hair (fleece) of animals such as sheep, goats, yaks, camels and angora rabbits. Kashmiri goats give fine pashmina wool; the Deccani sheep of Telangana give coarse wool that the Kuruma shepherds weave into the famous black "gongadi" blanket.'),
        p('Sheep are reared on grass and fodder. Some breeds are specially chosen because they give a lot of good-quality wool — this choosing is called selective breeding.'),
        h('From fleece to yarn'),
        stepsB(
          'Shearing — the fleece is cut off with thin clippers, usually in hot months. It does not hurt the sheep, just like a haircut.',
          'Scouring — the fleece is washed in tanks to remove grease, dust and dirt.',
          'Sorting — hair of different textures is separated.',
          'Removing burrs — small fluffy fibres (burrs) are picked out.',
          'Dyeing — the naturally white, brown or black fibres can be coloured.',
          'Combing and spinning — fibres are straightened, combed and rolled into yarn.',
        ),
        def('Shearing', 'Removing the fleece of a sheep along with a thin layer of skin-hair, usually in summer.'),
        keys('Wool comes from sheep, goat, yak, camel, llama/alpaca and angora rabbit.', 'Steps: shearing → scouring → sorting → removing burrs → dyeing → combing/spinning.', 'Wool keeps us warm because it traps air, a poor conductor of heat.'),
        remember('Sorters sometimes catch anthrax, a serious disease from bacteria in fleece — so wool workers need safety and health checks.'),
      ],
      examples: [
        ex('Why is a sheep sheared in summer and not in winter?', ['The fleece keeps the sheep warm.', 'In summer the sheep does not need it, and it grows back by winter.'], 'So the sheep is not cold, and the fleece regrows before winter'),
        ex('What is scouring and why is it done?', ['Raw fleece is greasy and dirty.', 'Scouring is washing it thoroughly in tanks.'], 'Washing fleece to remove grease, dust and dirt'),
      ],
      practice: [
        orderT('steps', 'Put the steps of making woollen yarn in order.', ['Shearing', 'Scouring', 'Sorting', 'Removing burrs', 'Dyeing', 'Combing and spinning into yarn'], ['First remove the fleece from the animal.', 'Wash before sorting; spin last.'], 'Fleece is cut, washed, sorted, cleaned of burrs, dyed and finally spun.'),
        matchT('animal', 'animal to the wool it gives', [
          ['Kashmiri goat', 'Pashmina (very fine wool)'], ['Angora rabbit', 'Soft angora wool'], ['Yak', 'Wool from Ladakh and Tibet'], ['Deccani sheep', 'Coarse wool for gongadi blankets'], ['Camel', 'Camel hair (Rajasthan)'],
        ], ['Think of where each animal lives.', 'Gongadi blankets are a Telangana tradition.']),
        mcq('wool-facts', 'Recall each step\'s purpose.', [
          ['Removing the fleece from a sheep is called…', 'Shearing', ['Reeling', 'Scouring', 'Ginning'], 'Like a haircut.', 'Shearing removes the fleece.'],
          ['Washing fleece to remove grease and dirt is…', 'Scouring', ['Sorting', 'Shearing', 'Dyeing'], 'It is a cleaning step.', 'Scouring cleans the greasy fleece.'],
          ['Woollen clothes keep us warm because…', 'Air trapped between fibres does not let heat escape', ['Wool produces heat', 'Wool absorbs sunlight at night', 'Wool is a metal'], 'Air is a poor conductor of heat.', 'Trapped air is a poor conductor, so body heat stays in.'],
          ['Choosing parents with good fleece to get better wool in young ones is…', 'Selective breeding', ['Sericulture', 'Scouring', 'Reeling'], 'Breeders select the best animals.', 'Selective breeding picks parents with desired traits.'],
          ['A health risk for wool sorters is…', 'Anthrax', ['Scurvy', 'Goitre', 'Night blindness'], 'It is a bacterial disease from animal fleece.', 'Anthrax bacteria can be present in fleece.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.fibre.compare', title: 'Animal fibres compared: silk, wool and plant fibres', prereqs: ['ts7.sc.fibre.silk', 'ts7.sc.fibre.wool'],
      intro: [
        h('Animal fibres vs plant fibres'),
        photo('🧺', 'Fibres around the home come from plants (cotton, jute) and animals (silk, wool).'),
        p('Fibres are thin, thread-like strands that are twisted into yarn and woven or knitted into fabric. Natural fibres come from plants (cotton, jute, coir) or animals (silk, wool). Synthetic fibres like nylon and polyester are made in factories.'),
        p('Silk and wool are made of protein, while plant fibres are made of cellulose. A simple burning test (done only by the teacher, with tongs and over a tray) shows this: animal fibres burn with a smell like burning hair and leave a crushable black bead; cotton burns with a smell like burning paper.'),
        stepsB('Silk: smooth, shiny, strong and light; cool in summer, warm in winter.', 'Wool: thick and fluffy; traps air so it is very warm; can shrink if washed in hot water.', 'Cotton: absorbs sweat; cool and comfortable in Telangana summers.'),
        keys('Animal fibres (silk, wool) are proteins.', 'Plant fibres (cotton, jute) are cellulose.', 'Burning animal fibre smells like burnt hair; cotton smells like burnt paper.', 'Wool is warmest; cotton is best for hot weather; silk is smooth and shiny.'),
        remember('Protein fibres can be eaten by moth larvae and silverfish, so woollens are stored with neem leaves or naphthalene balls.'),
      ],
      examples: [
        ex('A thread burns with a smell of burning hair. Is it wool or cotton?', ['A burning-hair smell comes from burning protein.', 'Wool is a protein fibre.'], 'Wool (an animal fibre)'),
        ex('Which fabric would you choose for a hot May day in Khammam and why?', ['Hot weather → we sweat a lot.', 'Cotton absorbs sweat and lets heat out.'], 'Cotton — it absorbs sweat and keeps us cool'),
      ],
      practice: [
        tapT('animal', 'Tap every fibre that comes from an ANIMAL.', [
          ['Mulberry silk', true], ['Sheep wool', true], ['Pashmina', true], ['Tasar silk', true], ['Angora wool', true],
          ['Cotton', false], ['Jute', false], ['Coir', false], ['Nylon', false],
        ], ['Animal fibres are silk and wool.', 'Cotton, jute and coir are from plants; nylon is synthetic.'], 'Silk and all kinds of wool come from animals.'),
        mcq('props', 'Think about protein vs cellulose fibres.', [
          ['Silk and wool are mainly made of…', 'Protein', ['Cellulose', 'Starch', 'Plastic'], 'They come from animals.', 'Animal fibres are made of protein.'],
          ['A burning cotton thread smells like…', 'Burning paper', ['Burning hair', 'Rotten eggs', 'Nothing at all'], 'Paper and cotton are both cellulose.', 'Cotton is cellulose, like paper.'],
          ['Which fabric is best for winter in Adilabad, the coldest district of Telangana?', 'Wool', ['Thin cotton', 'Jute', 'Net cloth'], 'Which fibre traps the most air?', 'Wool traps air and keeps body heat in.'],
          ['Why are woollens stored with neem leaves?', 'To keep away insects that eat protein fibres', ['To make them shiny', 'To make them shrink', 'To add colour'], 'Moth larvae like wool.', 'Neem and naphthalene repel insects that damage woollens.'],
          ['Which fibre is shiny and smooth?', 'Silk', ['Wool', 'Jute', 'Coir'], 'It is used for festive sarees.', 'Silk fibres are smooth and reflect light.'],
        ]),
        matchT('match-fibre', 'fibre to its source', [
          ['Cotton', 'Cotton boll (seed hair)'], ['Jute', 'Stem of jute plant'], ['Silk', 'Cocoon of silk moth'], ['Wool', 'Fleece of sheep'], ['Coir', 'Husk of coconut'], ['Nylon', 'Made in factories from chemicals'],
        ], ['Two are animal, three plant, one synthetic.', 'Coir comes from coconut.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Motion - Time
// =====================================================================================
const ch4: USpec = {
  id: 'ts7.sc.ch4', subject: 'physics', title: 'Motion - Time', source: src(4),
  objectives: [
    {
      id: 'ts7.sc.motion.types', title: 'Motion, rest and the types of motion', prereqs: [],
      activities: ['lab:motion'],
      intro: [
        h('Is it moving? It depends who is watching'),
        photo('🚆', 'To a passenger, the person in the next seat is at rest; to someone on the platform, both are moving.'),
        p('An object is in motion if its position changes with time compared with a fixed object around it (a reference point). If its position does not change, it is at rest. Motion and rest are relative: a sleeping passenger on the Godavari Express is at rest relative to the train but moving relative to the trees outside.'),
        def('Motion', 'Change in position of an object with time, compared with a reference point.'),
        h('Types of motion'),
        stepsB(
          'Linear (rectilinear) motion — along a straight line: a march-past, a stone dropped from a height, a train on a straight track.',
          'Circular motion — along a circular path: a giant wheel cabin at a jatara, the tip of a clock hand, a stone whirled on a string.',
          'Rotational (spinning) motion — an object turns about its own axis: a top (bongaram), a ceiling fan blade, the Earth spinning.',
          'Oscillatory (periodic) motion — to and fro about a centre point, repeating after equal times: a swing (uyyala), a pendulum, a plucked string.',
          'Random motion — no fixed path: a fly, a football in a match, dust in sunlight.',
        ),
        keys('Rest and motion are judged against a reference point.', 'Linear, circular, rotational, oscillatory and random are the main types.', 'Many objects show more than one motion: a cycle wheel rotates while the cycle moves in a line.'),
        remember('Periodic motion repeats itself after equal intervals of time — this is why pendulums are useful for measuring time.'),
      ],
      examples: [
        ex('Name the types of motion of a rolling bicycle wheel.', ['The wheel spins about its axle — rotational.', 'The whole wheel moves forward along the road — linear.'], 'Rotational and linear (both together)'),
        ex('Arjun sits in a moving bus. Is he at rest or in motion?', ['Relative to the bus seat, his position does not change → at rest.', 'Relative to the road, his position changes → in motion.'], 'At rest relative to the bus, in motion relative to the road'),
      ],
      practice: [
        matchT('match-type', 'example to its type of motion', [
          ['Swing in a park', 'Oscillatory'], ['Spinning top', 'Rotational'], ['Giant wheel cabin', 'Circular'], ['Car on a straight highway', 'Linear'], ['A fly in a room', 'Random'], ['Pendulum of a wall clock', 'Oscillatory'],
        ], ['To-and-fro = oscillatory; spinning on its own axis = rotational.', 'Moving along a circle around a centre outside the object = circular.']),
        mcq('type', 'Ask: what path does it follow?', [
          ['A stone dropped from the top of Charminar falls in…', 'Linear motion', ['Circular motion', 'Rotational motion', 'Random motion'], 'It falls straight down.', 'A straight-line path is linear (rectilinear) motion.'],
          ['The blades of a ceiling fan show…', 'Rotational motion', ['Linear motion', 'Random motion', 'Oscillatory motion'], 'They spin about a fixed axis.', 'Spinning about an axis is rotation.'],
          ['A plucked veena string vibrates. Its motion is…', 'Oscillatory', ['Linear', 'Circular', 'Random'], 'It moves to and fro.', 'Vibration is a fast oscillatory motion.'],
          ['Motion that repeats itself after equal intervals of time is called…', 'Periodic motion', ['Random motion', 'Linear motion', 'Rest'], 'Think of a pendulum.', 'Periodic motion repeats after fixed time intervals.'],
          ['A passenger in a moving train is at rest relative to…', 'Her seat in the train', ['The trees outside', 'The railway station', 'The track'], 'Which position does not change?', 'Her position relative to the seat does not change.'],
          ['A football during a match moves in…', 'Random (irregular) motion', ['Only circular motion', 'Only oscillatory motion', 'Rest'], 'Its direction keeps changing unpredictably.', 'A ball kicked by many players has no fixed path.'],
        ]),
        tapT('periodic', 'Tap every motion that is PERIODIC (repeats after equal time).', [
          ['Pendulum of a clock', true], ['Earth going round the Sun', true], ['Hands of a clock', true], ['A child on a swing', true], ['Heartbeat at rest', true],
          ['A dog chasing a ball', false], ['A falling leaf', false], ['A car in city traffic', false],
        ], ['Periodic motion repeats after a fixed time.', 'Unpredictable movements are not periodic.'], 'The pendulum, Earth\'s orbit, clock hands, a swing and a resting heartbeat all repeat regularly.'),
      ],
    },
    {
      id: 'ts7.sc.motion.speed', title: 'Uniform and non-uniform motion; speed', prereqs: ['ts7.sc.motion.types'],
      activities: ['lab:motion'],
      intro: [
        h('Fast or slow? Measure the speed'),
        photo('🚲', 'A cyclist who covers more distance in the same time is moving faster.'),
        p('To compare how fast things move we use speed: the distance covered in one unit of time.'),
        f('speed = distance ÷ time', 'speed equals distance divided by time'),
        p('The SI unit of speed is metre per second (m/s). For vehicles we often use kilometre per hour (km/h). 1 km/h = 1000 m ÷ 3600 s, so 18 km/h = 5 m/s.'),
        def('Uniform motion', 'Motion in a straight line in which equal distances are covered in equal intervals of time (constant speed).'),
        def('Non-uniform motion', 'Motion in which unequal distances are covered in equal intervals of time — the speed keeps changing.'),
        p('A train on a long straight stretch may move uniformly for a while, but a bus in Hyderabad traffic speeds up, slows down and stops — non-uniform motion. For such motion we calculate the average speed = total distance ÷ total time.'),
        xp({
          title: 'What if? Distance, time and speed', formula: 'v = d / t',
          res: ['v', 'Speed', 'm/s', 'd / t', 2],
          vars: [['d', 'Distance covered', 'm', 10, 1000, 10, 200], ['t', 'Time taken', 's', 5, 200, 5, 40]],
          notes: [['d', 'More distance in the same time means a faster object.', 'Less distance in the same time means a slower object.'], ['t', 'Taking longer for the same distance means moving slower.', 'Covering the same distance in less time means moving faster.']],
          mistakes: [['Multiplying distance by time', 'Speed is distance DIVIDED by time — how many metres in each second.'], ['Mixing km with s or m with h', 'Use matching units: m and s give m/s; km and h give km/h.']],
          real: 'A cheetah can reach about 30 m/s; a fast cricket delivery is about 40 m/s; walking is about 1.5 m/s.',
        }),
        keys('speed = distance ÷ time.', 'Units: m/s and km/h; 18 km/h = 5 m/s.', 'Uniform: equal distances in equal times.', 'Non-uniform: speed changes; use average speed.'),
        remember('distance = speed × time and time = distance ÷ speed come from the same formula.'),
      ],
      examples: [
        ex('A bus travels 120 km on the Hyderabad–Warangal highway in 3 hours. Find its average speed.', ['speed = distance ÷ time', '= 120 km ÷ 3 h', '= 40 km/h'], '40 km/h'),
        ex('Lakshmi runs 200 m in 40 s. Find her speed in m/s.', ['speed = 200 m ÷ 40 s', '= 5 m/s'], '5 m/s'),
        ex('A car moves at 60 km/h for 2.5 h. How far does it go?', ['distance = speed × time', '= 60 × 2.5', '= 150 km'], '150 km'),
      ],
      practice: [
        tp('speed-ms', (r) => {
          const t = r.pick([10, 20, 25, 40, 50, 60]);
          const v = r.pick([2, 3, 4, 5, 6, 8]);
          const d = v * t;
          const n = who(r);
          return numQ(`${n} cycles ${d} m in ${t} s. What is the speed?`, v, 'm/s',
            ['speed = distance ÷ time', `Divide ${d} by ${t}.`],
            [`speed = ${d} m ÷ ${t} s = ${v} m/s`],
            [{ when: String(d * t), explain: 'You multiplied. Speed is distance divided by time.' }]);
        }),
        tp('speed-kmh', (r) => {
          const t = r.pick([2, 3, 4, 5]);
          const v = r.pick([30, 40, 45, 50, 60, 70]);
          const town = r.pick(['Warangal', 'Nalgonda', 'Siddipet', 'Khammam', 'Nizamabad']);
          return numQ(`A bus covers ${v * t} km on the way to ${town} in ${t} hours. What is its average speed?`, v, 'km/h',
            ['Average speed = total distance ÷ total time.', `Divide ${v * t} km by ${t} h.`],
            [`average speed = ${v * t} ÷ ${t} = ${v} km/h`]);
        }),
        tp('distance', (r) => {
          const v = r.pick([4, 5, 10, 12, 15]);
          const t = r.pick([3, 4, 6, 8, 10]);
          return numQ(`A boat on Hussain Sagar moves steadily at ${v} m/s for ${t} s. How far does it travel?`, v * t, 'm',
            ['distance = speed × time', `Multiply ${v} by ${t}.`],
            [`distance = ${v} m/s × ${t} s = ${v * t} m`],
            [{ when: String(rd(v / t, 2)), explain: 'You divided. To find distance, multiply speed by time.' }]);
        }, 2),
        tp('time', (r) => {
          const v = r.pick([20, 40, 50, 60, 80]);
          const t = r.pick([2, 3, 4, 5]);
          return numQ(`A train runs at a steady ${v} km/h. How many hours does it take to cover ${v * t} km?`, t, 'h',
            ['time = distance ÷ speed', `Divide ${v * t} by ${v}.`],
            [`time = ${v * t} km ÷ ${v} km/h = ${t} h`]);
        }, 2),
        tp('uniform', (r) => {
          const uni = r.next() < 0.5;
          const a = r.pick([5, 8, 10, 12]);
          const ds = uni ? [a, a, a, a] : [a, a + 3, a - 2, a + 6];
          const tab = ds.map((d, i) => `minute ${i + 1}: ${d} m`).join(', ');
          return {
            type: 'mcq', prompt: `An ant walks in a straight line. Distance covered — ${tab}. Is its motion uniform or non-uniform?`,
            ...choose(r, uni ? 'Uniform' : 'Non-uniform', [uni ? 'Non-uniform' : 'Uniform']),
            hints: ['Compare the distance covered in each equal time interval.', 'Equal distances in equal times means uniform.'],
            mistakes: [{ when: 'wrong', explain: uni ? 'Every minute it covers the same distance, so the motion is uniform.' : 'The distances in equal minutes are different, so the speed changes — non-uniform.' }],
            solution: [uni ? `Same distance (${a} m) every minute → uniform motion.` : 'Different distances in equal times → non-uniform motion.'],
          };
        }),
      ],
    },
    {
      id: 'ts7.sc.motion.time', title: 'Measuring time: from sundials to pendulums', prereqs: ['ts7.sc.motion.types'],
      intro: [
        h('Before watches, people watched shadows'),
        photo('⏳', 'A sand clock measures a fixed amount of time as sand trickles from the top to the bottom.'),
        p('Long ago, people used events that repeat regularly to measure time: sunrise to sunrise for a day, new moon to new moon for a month. Shorter times were measured with sundials (moving shadow of a stick), water clocks (water dripping out of a pot with a hole — the "ghati" used in old Indian temples) and sand clocks.'),
        p('The pendulum made accurate clocks possible. A simple pendulum is a small metal ball (bob) hung from a thread. When pulled aside and released, it swings to and fro.'),
        def('Time period', 'The time taken by a pendulum to complete one oscillation (from one end to the other and back).'),
        f('time period = total time ÷ number of oscillations', 'time period equals total time divided by number of oscillations'),
        p('Timing just one swing is hard, so we time 20 oscillations with a stopwatch and divide by 20. The time period of a pendulum depends on its length — a longer thread gives a longer period — but not on the mass of the bob.'),
        p('Units: the SI unit of time is the second (s). 1 minute = 60 s, 1 hour = 60 minutes = 3600 s.'),
        xp({
          title: 'What if? Timing many swings', formula: 'T = total time / n',
          res: ['T', 'Time period', 's', 'tt / n', 2],
          vars: [['tt', 'Total time measured', 's', 10, 60, 1, 32], ['n', 'Number of oscillations', '', 10, 40, 1, 20]],
          notes: [['tt', 'Same number of swings in more time means each swing is slower.', 'Same number of swings in less time means each swing is quicker.'], ['n', 'More swings in the same time means each swing takes less time.', 'Fewer swings in the same time means each swing takes longer.']],
          mistakes: [['Counting one oscillation as from one end to the other only', 'One oscillation is a full to-and-fro: end → other end → back.'], ['Multiplying total time by the number of swings', 'Share the total time equally: divide.']],
          real: 'A pendulum about 1 m long has a time period close to 2 s.',
        }),
        keys('Old clocks: sundial, water clock (ghati), sand clock.', 'Time period = total time ÷ number of oscillations.', 'Period depends on length, not on mass of bob.', '1 h = 60 min = 3600 s.'),
        remember('Equal swings in equal time made the pendulum the heart of old wall clocks.'),
      ],
      examples: [
        ex('A pendulum completes 20 oscillations in 36 s. Find its time period.', ['T = total time ÷ number of oscillations', '= 36 ÷ 20', '= 1.8 s'], '1.8 s'),
        ex('How many seconds are there in 2 hours 15 minutes?', ['2 h = 2 × 3600 = 7200 s', '15 min = 15 × 60 = 900 s', 'Total = 8100 s'], '8100 s'),
      ],
      practice: [
        tp('period', (r) => {
          const n = r.pick([10, 20, 25]);
          const T = r.pick([1.2, 1.4, 1.5, 1.6, 1.8, 2]);
          const tt = rd(n * T, 1);
          return numQ(`A simple pendulum makes ${n} oscillations in ${tt} s. What is its time period?`, T, 's',
            ['Time period = total time ÷ number of oscillations.', `Divide ${tt} by ${n}.`],
            [`T = ${tt} s ÷ ${n} = ${T} s`],
            [{ when: String(rd(tt * n, 1)), explain: 'You multiplied. Divide the total time by the number of oscillations.' }]);
        }),
        tp('convert', (r) => {
          const hh = r.pick([1, 2, 3]);
          const mm = r.pick([5, 10, 20, 30, 45]);
          return numQ(`A cricket match session lasts ${hh} h ${mm} min. How many seconds is that?`, hh * 3600 + mm * 60, 's',
            ['1 hour = 3600 s and 1 minute = 60 s.', `Convert ${hh} h and ${mm} min separately, then add.`],
            [`${hh} h = ${hh * 3600} s`, `${mm} min = ${mm * 60} s`, `Total = ${hh * 3600 + mm * 60} s`],
            [{ when: String(hh * 60 + mm), explain: 'That is the time in minutes. Multiply by 60 again to get seconds.' }]);
        }, 2),
        mcq('clock', 'Think of old and new ways to measure time.', [
          ['A sundial measures time using…', 'The shadow of a stick cast by the Sun', ['Dripping water', 'Falling sand', 'A swinging bob'], 'Sun + dial.', 'As the Sun moves across the sky, the shadow moves over the dial.'],
          ['The time period of a pendulum depends on…', 'The length of the thread', ['The mass of the bob', 'The colour of the bob', 'Who releases it'], 'Try a longer thread.', 'A longer pendulum swings more slowly; the bob\'s mass does not matter.'],
          ['The SI unit of time is…', 'Second', ['Minute', 'Hour', 'Day'], 'It is the smallest of these.', 'The second (s) is the SI unit of time.'],
          ['One oscillation of a pendulum is…', 'A complete to-and-fro swing back to the start', ['Half a swing', 'Moving to the centre once', 'Ten swings'], 'It must return to where it started.', 'End → other end → back is one full oscillation.'],
          ['Why do we time 20 oscillations instead of one?', 'To reduce the error in timing', ['Because one swing is impossible', 'To make the bob heavier', 'To change the period'], 'Reaction time errors get shared out.', 'Timing many swings and dividing makes the result more accurate.'],
          ['A "ghati" in old India was a kind of…', 'Water clock', ['Sundial', 'Pendulum', 'Thermometer'], 'It used a pot and water.', 'A small pot with a hole sank in water after a fixed time.'],
        ]),
        orderT('order-time', 'Order these time intervals from SHORTEST to LONGEST.', ['One heartbeat', 'One minute', 'One school period', 'One day', 'One month'], ['A heartbeat is under a second.', 'A day is 24 hours.'], 'Heartbeat (≈1 s) < minute < school period (≈45 min) < day < month.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Heat - Measurement
// =====================================================================================
const ch5: USpec = {
  id: 'ts7.sc.ch5', subject: 'physics', title: 'Heat - Measurement', source: src(5),
  objectives: [
    {
      id: 'ts7.sc.heat.temp', title: 'Heat is energy; temperature measures hotness', prereqs: [],
      intro: [
        h('Can your hand tell how hot something is?'),
        photo('🔥', 'A flame gives out heat energy that flows into the pot and the food.'),
        p('Try this: keep one hand in cold water and the other in warm water for a minute, then put both into lukewarm water. The "cold" hand feels the water as warm and the "warm" hand feels it as cool! Our sense of touch is not reliable, so we need a thermometer.'),
        def('Heat', 'A form of energy that flows from a hotter object to a colder object.'),
        def('Temperature', 'A measure of how hot or cold an object is (its degree of hotness). Measured with a thermometer in degrees Celsius (°C).'),
        h('Heat and temperature are different'),
        p('A cup of tea and a big vessel of tea at the same temperature are equally hot to touch, but the big vessel holds much more heat energy — it can warm many more cups and takes longer to cool. Heat depends on the amount of substance; temperature does not.'),
        p('Heat always flows from the higher temperature to the lower one, until both reach the same temperature. A hot glass of milk cools in the room; ice in a glass of water takes in heat and melts.'),
        keys('Heat is energy; temperature is the degree of hotness.', 'Heat flows from hot to cold until temperatures are equal.', 'Touch is unreliable — use a thermometer.', 'More substance at the same temperature holds more heat.'),
        remember('Units: heat in joules (J) or calories; temperature in °C (or °F, kelvin).'),
      ],
      examples: [
        ex('A bucket of water and a glass of water are both at 60 °C. Which has more heat? Which has a higher temperature?', ['Temperatures are equal: both 60 °C.', 'The bucket has more water, so it holds more heat energy.'], 'Same temperature; the bucket has more heat'),
        ex('A steel spoon is left in hot sambar. Which way does heat flow?', ['Heat flows from hotter to colder.', 'The sambar is hotter than the spoon.'], 'From the sambar into the spoon'),
      ],
      practice: [
        mcq('heat-temp', 'Heat = energy; temperature = degree of hotness.', [
          ['Heat flows from…', 'A hotter object to a colder object', ['A colder object to a hotter object', 'A bigger object to a smaller object', 'Light objects to heavy objects'], 'Think of a hot cup cooling.', 'Heat always moves from higher to lower temperature.'],
          ['Temperature is measured with a…', 'Thermometer', ['Barometer', 'Speedometer', 'Rain gauge'], 'Thermo = heat.', 'A thermometer measures temperature.'],
          ['Why can\'t we judge temperature correctly by touch?', 'Our feeling depends on what we touched before', ['Our hands are always at 0 °C', 'Skin cannot feel heat', 'Hot things feel cold'], 'Remember the three-bowl experiment.', 'The same water felt warm to one hand and cool to the other.'],
          ['A tank of water and a cup of water are both at 40 °C. Which statement is true?', 'The tank contains more heat energy', ['The cup contains more heat energy', 'The cup is hotter', 'The tank is hotter'], 'Same temperature, different amounts.', 'More water at the same temperature means more heat energy.'],
          ['Heat is a form of…', 'Energy', ['Matter', 'Force', 'Temperature'], 'It can do work like cooking food.', 'Heat is energy in transit from hot to cold.'],
          ['An ice cube placed in lemonade…', 'Takes heat from the lemonade and melts', ['Gives cold to the lemonade', 'Gives heat to the lemonade', 'Does not exchange heat'], 'Which is hotter?', 'The lemonade is warmer, so heat flows into the ice.'],
        ]),
        tapT('tap-flow', 'Tap every case where heat flows INTO the first-named object.', [
          ['Ice cube in a glass of water', true], ['Cold hands near a bonfire', true], ['A steel spoon in hot tea', true], ['A cold bottle left on a sunny window', true],
          ['Hot idli on a cold plate', false], ['A hot iron box after switching off', false], ['Boiling milk taken off the stove', false],
        ], ['Heat goes from hotter to colder.', 'The first-named object gains heat only if it is the colder one.'], 'Cold objects gain heat from warmer surroundings; hot objects lose heat.'),
        orderT('order-hot', 'Order from COLDEST to HOTTEST.', ['Ice (0 °C)', 'Tap water (about 25 °C)', 'Human body (37 °C)', 'Boiling water (100 °C)', 'Candle flame (about 1000 °C)'], ['Ice melts at 0 °C; water boils at 100 °C.', 'A flame is far hotter than boiling water.'], 'The temperatures increase in this order.'),
      ],
    },
    {
      id: 'ts7.sc.heat.thermometers', title: 'Thermometers: clinical, laboratory, Six\'s, digital and thermistor', prereqs: ['ts7.sc.heat.temp'],
      intro: [
        h('Different thermometers for different jobs'),
        photo('🧑‍⚕️', 'Doctors and nurses use a clinical or digital thermometer to check body temperature.'),
        stepsB(
          'Clinical thermometer — measures body temperature; range 35 °C to 42 °C (94 °F to 108 °F). A kink (bend) near the bulb stops the mercury from falling back on its own, so the reading can be read after taking it out of the mouth. Shake it down before use.',
          'Laboratory thermometer — range about −10 °C to 110 °C; has no kink, so it is read while the bulb is still in the liquid.',
          'Six\'s maximum–minimum thermometer — a U-shaped thermometer with alcohol and mercury and two small steel indices. It records the highest and the lowest temperature of the day; used in weather stations.',
          'Digital thermometer — shows the temperature as numbers on a screen; safe because it has no mercury.',
          'Thermistor — a tiny device whose electrical resistance changes with temperature; used inside digital thermometers, fridges, ACs and cars.',
        ),
        p('Normal human body temperature is about 37 °C (98.6 °F). A temperature above this is fever.'),
        def('Kink', 'A narrow bend in the tube of a clinical thermometer that prevents mercury from flowing back into the bulb by itself.'),
        keys('Clinical: 35–42 °C, has a kink.', 'Laboratory: −10 to 110 °C, no kink.', 'Six\'s: records daily max and min.', 'Digital/thermistor: electronic, no mercury.'),
        remember('Never use a clinical thermometer for hot water or a flame — it would break, because its highest mark is only 42 °C.'),
        tip('While reading, keep your eye level with the top of the mercury column to avoid errors.'),
      ],
      examples: [
        ex('Why can\'t a clinical thermometer be used to measure the temperature of boiling water?', ['Its range is only 35–42 °C.', 'Boiling water is 100 °C, far above the range.', 'The mercury would expand too much and the thermometer could break.'], 'Its range (35–42 °C) is too small'),
        ex('A weather station in Ramagundam wants to record the highest and lowest temperatures each day. Which thermometer should it use?', ['It must record both extremes without someone watching all day.', 'Six\'s thermometer has indices that stay at the max and min.'], 'Six\'s maximum–minimum thermometer'),
      ],
      practice: [
        matchT('match-thermo', 'thermometer to its use', [
          ['Clinical thermometer', 'Body temperature (35–42 °C)'], ['Laboratory thermometer', 'Temperature of liquids in experiments'], ['Six\'s thermometer', 'Highest and lowest temperature of a day'], ['Digital thermometer', 'Shows numbers on a screen, no mercury'], ['Thermistor', 'Resistance changes with temperature'],
        ], ['Body → clinical; weather station → Six\'s.', 'Thermistor is an electrical part.']),
        mcq('thermo', 'Recall range and design.', [
          ['The range of a clinical thermometer is…', '35 °C to 42 °C', ['−10 °C to 110 °C', '0 °C to 100 °C', '50 °C to 150 °C'], 'Human body temperatures only.', 'Body temperature never goes outside about 35–42 °C.'],
          ['Normal human body temperature is about…', '37 °C', ['42 °C', '30 °C', '100 °C'], 'It is 98.6 °F.', '98.6 °F is the same as 37 °C.'],
          ['The kink in a clinical thermometer…', 'Stops mercury from falling back on its own', ['Makes the mercury rise faster', 'Holds the bulb', 'Is for decoration'], 'It lets you read it later.', 'The narrow bend keeps the reading until the thermometer is shaken.'],
          ['Which thermometer has no kink and is read while still in the liquid?', 'Laboratory thermometer', ['Clinical thermometer', 'Six\'s thermometer', 'None'], 'Used in the school lab.', 'A lab thermometer\'s mercury falls as soon as it is removed.'],
          ['Six\'s thermometer contains…', 'Alcohol, mercury and two steel indices', ['Only water', 'Only air', 'A battery'], 'It records max and min.', 'Alcohol expands and pushes mercury, which moves the indices.'],
          ['Why are digital thermometers safer for home use?', 'They contain no mercury', ['They never need batteries', 'They measure only cold temperatures', 'They are made of glass'], 'Mercury is poisonous.', 'Broken mercury thermometers release toxic mercury.'],
        ]),
        orderT('order-use', 'Put the steps of using a clinical thermometer in order.', ['Wash it with antiseptic', 'Shake it so mercury falls below 35 °C', 'Place the bulb under the tongue for about a minute', 'Take it out and read it at eye level', 'Wash it again and store it'], ['It must be clean and shaken down first.', 'Read after taking it out — the kink holds the reading.'], 'Clean → shake → measure → read → clean.'),
      ],
    },
    {
      id: 'ts7.sc.heat.scales', title: 'Celsius and Fahrenheit scales', prereqs: ['ts7.sc.heat.thermometers'],
      intro: [
        h('Two scales, same temperature'),
        photo('☀️', 'On a hot Telangana afternoon the temperature can reach 44 °C — that is 111.2 °F.'),
        p('On the Celsius scale water freezes at 0 °C and boils at 100 °C — 100 equal divisions. On the Fahrenheit scale water freezes at 32 °F and boils at 212 °F — 180 divisions. So every 100 Celsius degrees equal 180 Fahrenheit degrees: 1 °C step = 9/5 °F steps.'),
        f('F = (9/5) × C + 32', 'F equals nine-fifths of C plus thirty-two'),
        f('C = (5/9) × (F − 32)', 'C equals five-ninths of F minus thirty-two'),
        xp({
          title: 'What if? Celsius to Fahrenheit', formula: 'F = 9C/5 + 32',
          res: ['F', 'Temperature in Fahrenheit', '°F', '9 * C / 5 + 32', 1],
          vars: [['C', 'Temperature in Celsius', '°C', -10, 110, 1, 37]],
          notes: [['C', 'Each 1 °C rise adds 1.8 °F.', 'Each 1 °C fall takes away 1.8 °F.']],
          mistakes: [['Forgetting to add 32', 'At 0 °C, F must be 32, not 0 — the scales start at different points.'], ['Adding 32 before multiplying', 'Multiply C by 9/5 first, then add 32.']],
          real: 'Body temperature 37 °C = 98.6 °F; a fever of 39 °C = 102.2 °F.',
        }),
        keys('Water: freezes 0 °C = 32 °F; boils 100 °C = 212 °F.', 'F = 9C/5 + 32.', 'C = 5(F − 32)/9.', 'Doctors in India often use °F; weather reports use °C.'),
        remember('−40 is special: −40 °C = −40 °F.'),
      ],
      examples: [
        ex('Convert 30 °C to °F.', ['F = 9 × 30 / 5 + 32', '= 54 + 32', '= 86'], '86 °F'),
        ex('A child\'s temperature is 101.3 °F. Convert to °C.', ['C = 5 × (101.3 − 32) / 9', '= 5 × 69.3 / 9', '= 38.5'], '38.5 °C'),
      ],
      practice: [
        tp('c2f', (r) => {
          const C = r.pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 60, 80]);
          const F = 9 * C / 5 + 32;
          return numQ(`Convert ${C} °C to degrees Fahrenheit. (Type the number of °F.)`, F, undefined,
            ['F = 9C/5 + 32', `First 9 × ${C} ÷ 5 = ${9 * C / 5}, then add 32.`],
            [`F = 9 × ${C} / 5 + 32 = ${9 * C / 5} + 32 = ${F} °F`],
            [{ when: String(9 * C / 5), explain: 'You forgot to add 32.' }, { when: String(rd(9 * (C + 32) / 5, 1)), explain: 'Multiply by 9/5 first, then add 32.' }]);
        }),
        tp('f2c', (r) => {
          const C = r.pick([0, 10, 20, 25, 30, 35, 40, 50, 100]);
          const F = 9 * C / 5 + 32;
          return numQ(`Convert ${F} °F to degrees Celsius. (Type the number of °C.)`, C, undefined,
            ['C = 5(F − 32)/9', `First subtract 32: ${F} − 32 = ${F - 32}.`],
            [`C = 5 × (${F} − 32) / 9 = 5 × ${F - 32} / 9 = ${C} °C`],
            [{ when: String(rd(5 * F / 9, 1)), explain: 'Subtract 32 before multiplying by 5/9.' }]);
        }, 2),
        tp('fever', (r) => {
          const C = r.pick([36, 37, 38, 39, 40]);
          const F = rd(9 * C / 5 + 32, 1);
          const ans = C > 37 ? 'Yes, it is a fever' : 'No, it is normal or below normal';
          return {
            type: 'mcq', prompt: `A digital thermometer shows ${C} °C (${F} °F). Normal body temperature is 37 °C (98.6 °F). Does the person have fever?`,
            ...choose(r, ans, [C > 37 ? 'No, it is normal or below normal' : 'Yes, it is a fever', 'Cannot be decided from a thermometer']),
            hints: ['Compare with 37 °C.', 'Above 37 °C means fever.'],
            mistakes: [{ when: 'wrong', explain: `${C} °C is ${C > 37 ? 'above' : 'not above'} 37 °C.` }],
            solution: [`${C} °C ${C > 37 ? '>' : '≤'} 37 °C → ${ans.toLowerCase()}.`],
          };
        }),
        mcq('fixed', 'Use the fixed points of each scale.', [
          ['Water freezes at…', '0 °C = 32 °F', ['0 °C = 0 °F', '32 °C = 0 °F', '100 °C = 212 °F'], 'Fahrenheit starts higher.', 'The freezing point of water is 0 °C, which is 32 °F.'],
          ['Water boils at…', '100 °C = 212 °F', ['100 °C = 100 °F', '212 °C = 100 °F', '0 °C = 32 °F'], 'Fahrenheit has 180 steps between fixed points.', '32 + 180 = 212 °F.'],
          ['At what temperature do the Celsius and Fahrenheit scales show the same number?', '−40', ['0', '32', '100'], 'Try the formula with a negative number.', '9(−40)/5 + 32 = −72 + 32 = −40.'],
          ['A change of 10 °C equals a change of…', '18 °F', ['10 °F', '42 °F', '50 °F'], 'Each °C step = 1.8 °F steps.', '10 × 9/5 = 18 °F (no +32 for a change).'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Weather - Climate
// =====================================================================================
const ch6: USpec = {
  id: 'ts7.sc.ch6', subject: 'physics', title: 'Weather - Climate', source: src(6),
  objectives: [
    {
      id: 'ts7.sc.weather.components', title: 'Weather and its components', prereqs: [],
      intro: [
        h('Will it rain today?'),
        photo('⛈️', 'Dark clouds, gusty wind and thunder — the weather can change within hours.'),
        p('Weather is the day-to-day condition of the atmosphere at a place: how hot or cold it is, how humid, whether it is raining, how strong the wind is and how cloudy the sky is. Weather changes from hour to hour and day to day.'),
        def('Weather', 'The condition of the atmosphere at a place at a given time with respect to temperature, humidity, rainfall, wind speed and direction, and cloud cover.'),
        stepsB('Temperature — how hot or cold the air is.', 'Humidity — the amount of water vapour in the air. Sticky, sweaty days are humid.', 'Rainfall (precipitation) — rain, hail or snow, measured in millimetres.', 'Wind — its speed and direction.', 'Clouds and sunshine — how much of the sky is covered.'),
        p('The Sun is the main cause of all weather: its heat warms land and water unequally, makes water evaporate and sets the winds moving. The India Meteorological Department (IMD) and the Telangana State Development Planning Society collect weather data and issue forecasts.'),
        keys('Weather changes daily.', 'Components: temperature, humidity, rainfall, wind, clouds/sunshine.', 'The Sun drives the weather.', 'IMD issues weather forecasts.'),
        remember('The maximum temperature of a day usually comes in the afternoon (around 2–3 pm), and the minimum just before sunrise.'),
      ],
      examples: [
        ex('A news reader says: "Today 38 °C, humidity 30%, light winds from the west, no rain." Name the weather components mentioned.', ['38 °C → temperature', '30% → humidity', 'light winds from the west → wind speed and direction', 'no rain → rainfall'], 'Temperature, humidity, wind and rainfall'),
        ex('Why is the minimum temperature of the day usually just before sunrise?', ['After sunset the land keeps losing heat all night.', 'It has lost the most heat just before the Sun rises again.'], 'Because the ground cools all night until the Sun returns'),
      ],
      practice: [
        mcq('comp', 'Weather = condition of the air today.', [
          ['Weather means…', 'The day-to-day condition of the atmosphere at a place', ['The average pattern over 25 years', 'The type of soil', 'The number of trees'], 'It changes daily.', 'Weather is short-term and changes from day to day.'],
          ['The amount of water vapour in the air is called…', 'Humidity', ['Rainfall', 'Temperature', 'Wind'], 'Sticky, sweaty days.', 'Humidity measures moisture in the air.'],
          ['The main cause of all weather changes is…', 'The Sun', ['The Moon', 'Trees', 'Rivers'], 'It heats land and water.', 'Solar heat drives evaporation and winds.'],
          ['The highest temperature of a day usually occurs…', 'In the early afternoon', ['At midnight', 'Just before sunrise', 'At sunrise'], 'The ground keeps heating after noon.', 'Land keeps gaining heat until about 2–3 pm.'],
          ['Which is NOT a component of weather?', 'Type of soil', ['Rainfall', 'Humidity', 'Wind speed'], 'Weather is about the air.', 'Soil type is not a condition of the atmosphere.'],
        ]),
        tapT('tap-weather', 'Tap every item that is a component of WEATHER.', [
          ['Temperature', true], ['Humidity', true], ['Rainfall', true], ['Wind speed', true], ['Wind direction', true], ['Cloud cover', true],
          ['Population of the city', false], ['Height of buildings', false], ['Number of schools', false],
        ], ['Weather is about the condition of the air.', 'Things about people or buildings are not weather.'], 'Temperature, humidity, rainfall, wind and clouds describe the atmosphere.'),
        tp('range', (r) => {
          const mx = r.pick([32, 34, 36, 38, 40, 42, 44]);
          const mn = mx - r.pick([8, 10, 11, 12, 14]);
          const town = r.pick(['Adilabad', 'Ramagundam', 'Hyderabad', 'Bhadrachalam', 'Nalgonda']);
          return numQ(`On a May day in ${town}, the maximum temperature was ${mx} °C and the minimum was ${mn} °C. What was the difference (daily range of temperature)? (Type the number of °C.)`, mx - mn, undefined,
            ['Range = maximum − minimum.', `${mx} − ${mn}`],
            [`Daily range = ${mx} − ${mn} = ${mx - mn} °C`],
            [{ when: String(mx + mn), explain: 'You added. The range is the difference: subtract.' }]);
        }),
      ],
    },
    {
      id: 'ts7.sc.weather.instruments', title: 'Measuring weather: rain gauge, wind vane, hygrometer', prereqs: ['ts7.sc.weather.components'],
      intro: [
        h('A weather station in your school'),
        photo('🌧️', 'Rain collected in a rain gauge tells us how many millimetres of rain fell.'),
        stepsB(
          'Temperature — Six\'s maximum–minimum thermometer, kept in a white wooden box with slits (Stevenson screen) away from direct sunlight.',
          'Rainfall — rain gauge: a funnel over a measuring cylinder. Rainfall is given as the depth of water in millimetres (mm).',
          'Wind direction — wind vane (weathercock): its arrow points towards the direction FROM which the wind blows.',
          'Wind speed — anemometer: cups that spin faster in stronger wind.',
          'Humidity — hygrometer (wet-and-dry bulb thermometer): the wet bulb shows a lower temperature because water evaporates from it; the bigger the difference, the drier the air.',
        ),
        p('To find the average rainfall over a week, add the daily readings and divide by the number of days. The average (mean) temperature of a day is often taken as (maximum + minimum) ÷ 2.'),
        f('average = sum of readings ÷ number of readings', 'average equals the sum of readings divided by the number of readings'),
        xp({
          title: 'What if? Daily mean temperature', formula: 'mean = (max + min) / 2',
          res: ['Tm', 'Mean temperature of the day', '°C', '(Tx + Tn) / 2', 1],
          vars: [['Tx', 'Maximum temperature', '°C', 20, 46, 1, 40], ['Tn', 'Minimum temperature', '°C', 5, 32, 1, 26]],
          notes: [['Tx', 'A hotter afternoon raises the day\'s mean.', 'A cooler afternoon lowers the mean.'], ['Tn', 'A warmer night raises the mean.', 'A colder night lowers the mean.']],
          mistakes: [['Adding max and min and stopping', 'Divide the sum by 2 to get the mean.'], ['Subtracting min from max', 'That gives the range, not the mean.']],
          real: 'Hyderabad in May: about 40 °C max and 27 °C min, a mean of about 33.5 °C.',
        }),
        keys('Rain gauge → rainfall in mm.', 'Wind vane → wind direction; anemometer → wind speed.', 'Hygrometer → humidity.', 'Six\'s thermometer → max and min temperature.'),
        remember('A wind vane points to where the wind comes FROM: a "west wind" blows from the west towards the east.'),
      ],
      examples: [
        ex('A rain gauge collected 12 mm, 0 mm, 8 mm, 20 mm, 5 mm, 0 mm and 18 mm on seven days. Find the average daily rainfall.', ['Sum = 12 + 0 + 8 + 20 + 5 + 0 + 18 = 63 mm', 'Average = 63 ÷ 7 = 9 mm'], '9 mm per day'),
        ex('The maximum temperature was 36 °C and the minimum was 24 °C. Find the mean temperature.', ['mean = (36 + 24) ÷ 2', '= 60 ÷ 2 = 30 °C'], '30 °C'),
      ],
      practice: [
        matchT('match-inst', 'instrument to what it measures', [
          ['Rain gauge', 'Rainfall'], ['Wind vane', 'Wind direction'], ['Anemometer', 'Wind speed'], ['Hygrometer', 'Humidity'], ['Six\'s thermometer', 'Maximum and minimum temperature'],
        ], ['"Anemo" means wind; "hygro" means moisture.', 'A vane turns to face the wind.']),
        tp('avg-rain', (r) => {
          const days = r.pick([4, 5]);
          const avg = r.pick([4, 6, 8, 10, 12]);
          const vals: number[] = [];
          for (let i = 0; i < days - 1; i++) vals.push(r.int(0, 2 * avg));
          const last = avg * days - vals.reduce((a, b) => a + b, 0);
          if (last < 0) { vals[0] += last; vals.push(0); } else vals.push(last);
          const sum = vals.reduce((a, b) => a + b, 0);
          return numQ(`Rainfall recorded at a school weather station on ${days} days (in mm): ${vals.join(', ')}. What was the average daily rainfall?`, sum / days, 'mm',
            ['Add all the readings.', `Divide the total by ${days}.`],
            [`Total = ${vals.join(' + ')} = ${sum} mm`, `Average = ${sum} ÷ ${days} = ${rd(sum / days, 2)} mm`],
            [{ when: String(sum), explain: 'That is the total. Divide by the number of days for the average.' }]);
        }, 2),
        tp('mean-t', (r) => {
          const mn = r.pick([18, 20, 22, 24, 26]);
          const mx = mn + r.pick([8, 10, 12, 14, 16]);
          return numQ(`The maximum temperature on a day was ${mx} °C and the minimum was ${mn} °C. Find the mean temperature of the day. (Type the number of °C.)`, (mx + mn) / 2, undefined,
            ['mean = (max + min) ÷ 2', `${mx} + ${mn} = ${mx + mn}`],
            [`mean = (${mx} + ${mn}) ÷ 2 = ${(mx + mn) / 2} °C`],
            [{ when: String(mx - mn), explain: 'That is the range (difference). The mean needs the sum divided by 2.' }]);
        }),
        mcq('inst', 'Recall how each instrument works.', [
          ['A wind vane\'s arrow points…', 'Towards the direction from which the wind is blowing', ['Away from the wind', 'Always north', 'Towards the Sun'], 'Winds are named for where they come from.', 'The arrowhead faces into the wind.'],
          ['Rainfall is measured in…', 'Millimetres (mm)', ['Kilograms', 'Degrees Celsius', 'Litres per person'], 'It is the depth of water.', 'Rain is reported as the depth of water collected, in mm.'],
          ['In a wet-and-dry bulb hygrometer, a large difference between the two readings means…', 'The air is dry (low humidity)', ['The air is very humid', 'It is raining', 'The thermometer is broken'], 'Evaporation cools the wet bulb more in dry air.', 'Dry air lets water evaporate fast, cooling the wet bulb a lot.'],
          ['Thermometers at a weather station are kept in a white box with slits so that…', 'Direct sunlight does not heat them but air can flow', ['Birds cannot see them', 'They stay wet', 'They measure rainfall'], 'We want the air temperature.', 'The Stevenson screen shades the thermometers while letting air through.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.weather.climate', title: 'Climate and how it shapes our lives', prereqs: ['ts7.sc.weather.components'],
      intro: [
        h('Weather is today; climate is the long story'),
        photo('🌴', 'Coconut palms and sloping roofs suit the hot, very rainy climate of Kerala.'),
        p('If you record the weather of a place every day for 25–30 years and find its average pattern, you get its climate. One rainy day in April does not change Telangana\'s climate.'),
        def('Climate', 'The average weather pattern of a place over a long period, usually 25 years or more.'),
        p('Telangana has a hot, semi-arid tropical climate: very hot summers (March–May, often above 40 °C), a south-west monsoon season (June–September) that brings most of the year\'s rain, and mild winters (November–February).'),
        h('Climate and lifestyle'),
        stepsB(
          'Food: rice where rainfall is high; jowar, bajra and ragi in drier areas; cooling drinks like buttermilk and ambali in Telangana summers.',
          'Clothing: thin cotton clothes in hot places; woollens in cold places like Kashmir and Ladakh.',
          'Houses: sloping roofs in heavy-rain areas (Kerala, Assam) so water runs off; thick mud walls and small windows in hot deserts (Rajasthan); houses on stilts in flood-prone areas; flat roofs in dry areas.',
          'Work and festivals: farming seasons (kharif with the monsoon, rabi in winter) follow the climate; Bathukamma is celebrated as the monsoon ends.',
        ),
        keys('Climate = long-term average of weather (25+ years).', 'Telangana: hot summers, monsoon rain June–Sept, mild winters.', 'Climate decides food, clothes, houses and farming.'),
        remember('Weather can change in a few hours; climate changes only over very long periods.'),
      ],
      examples: [
        ex('"Last Tuesday it rained heavily in Hyderabad." Is this weather or climate?', ['It describes one particular day.', 'That is the short-term condition of the air.'], 'Weather'),
        ex('Why do houses in Kerala have steep, sloping roofs?', ['Kerala\'s climate has very heavy rainfall.', 'A sloping roof lets rainwater run off quickly so it does not collect and leak.'], 'Because of heavy rainfall in its climate'),
      ],
      practice: [
        tp('w-or-c', (r) => {
          const bank: [string, boolean][] = [
            ['It is very cloudy in Warangal this morning.', true], ['Hyderabad had 36 °C as the highest temperature yesterday.', true], ['A thunderstorm is expected tonight.', true], ['There was a heavy hailstorm last week.', true],
            ['Rajasthan is hot and dry for most of the year.', false], ['Telangana gets most of its rain from June to September every year.', false], ['Kashmir has cold winters with snow.', false], ['Meghalaya receives very heavy rainfall year after year.', false],
          ];
          const [s, w] = r.pick(bank);
          return {
            type: 'mcq', prompt: `"${s}" — Is this a statement about weather or climate?`, ...choose(r, w ? 'Weather' : 'Climate', [w ? 'Climate' : 'Weather']),
            hints: ['Does it describe one day/short time or a long-term pattern?', 'Words like "usually", "every year" or "most of the year" suggest climate.'],
            mistakes: [{ when: 'wrong', explain: w ? 'It describes a short period — that is weather.' : 'It describes a pattern over many years — that is climate.' }],
            solution: [w ? 'Short-term condition → weather.' : 'Long-term average pattern → climate.'],
          };
        }),
        matchT('match-life', 'climate to a lifestyle that suits it', [
          ['Very heavy rainfall', 'Sloping roofs'], ['Hot and dry desert', 'Thick mud walls, small windows'], ['Very cold with snow', 'Woollen clothes and heated rooms'], ['Hot and humid coast', 'Light cotton clothes, airy houses'], ['Frequent floods', 'Houses on stilts'],
        ], ['Think what problem each climate creates.', 'Mud walls keep heat out; stilts keep water out.']),
        mcq('climate', 'Climate = long-term average.', [
          ['Climate of a place is found from weather records of about…', '25–30 years', ['One day', 'One week', 'One month'], 'A long time.', 'Climate is the average over many years.'],
          ['Most of Telangana\'s rainfall comes from…', 'The south-west monsoon (June–September)', ['Winter snow', 'Sea breezes every day', 'The north-east trade winds in May'], 'Think of the kharif season.', 'The south-west monsoon brings most of the rain.'],
          ['Which crop is grown more in drier parts of Telangana?', 'Jowar', ['Tea', 'Apples', 'Saffron'], 'It needs less water.', 'Jowar, bajra and ragi grow well with less rain.'],
          ['Which statement is true?', 'Weather can change within hours; climate changes over very long periods', ['Climate changes every day', 'Weather is a 30-year average', 'Weather and climate mean exactly the same'], 'Compare the time scales.', 'Weather is short-term; climate is long-term.'],
          ['Telangana\'s climate is best described as…', 'Hot and semi-arid tropical', ['Cold and snowy', 'Very wet all year', 'Polar'], 'Hot summers and moderate rain.', 'Telangana has hot summers, moderate monsoon rain and mild winters.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6];
