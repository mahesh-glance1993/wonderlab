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

// =====================================================================================
// Chapter 7 — Electric Current - Its Effect
// =====================================================================================
const ch7: USpec = {
  id: 'ts7.sc.ch7', subject: 'physics', title: 'Electric Current - Its Effect', source: src(7),
  objectives: [
    {
      id: 'ts7.sc.elec.circuit', title: 'Cells, symbols and circuit diagrams', prereqs: [],
      activities: ['lab:circuit'],
      intro: [
        h('Drawing circuits the scientist\'s way'),
        photo('🔦', 'Inside a torch, cells, a switch and a bulb are joined in a closed loop.'),
        p('An electric cell (like the ones in a torch or TV remote) has two terminals: positive (+) and negative (−). A common dry cell gives 1.5 volts. Two or more cells joined together make a battery.'),
        p('Electric current flows only when there is a complete, unbroken path from the + terminal, through the wires and the bulb, back to the − terminal. This path is a closed circuit. If the path is broken anywhere — a loose wire or an OFF switch — it is an open circuit and no current flows.'),
        def('Electric circuit', 'A closed path through which electric current flows from one terminal of a cell back to the other.'),
        h('Symbols save time'),
        stepsB(
          'Cell: a long thin line (+) and a short thick line (−).',
          'Battery: two or more cell symbols joined end to end.',
          'Switch (key): an open gap when OFF, a closed contact when ON.',
          'Bulb: a circle with a cross or a loop inside.',
          'Connecting wire: a straight line.',
        ),
        p('A circuit diagram uses these symbols to show how the parts are connected. By convention, current is shown flowing from the positive terminal through the circuit to the negative terminal.'),
        keys('Cell: + is the long line, − the short thick line.', 'Battery = two or more cells joined.', 'Closed circuit → current flows; open circuit → no current.', 'A switch opens or closes the circuit.'),
        remember('Never experiment with the mains supply at home (230 V) — it can kill. Use only cells for experiments.'),
      ],
      examples: [
        ex('A bulb does not glow even though the switch is ON. Give two possible reasons.', ['Current needs a complete path.', 'The path may be broken: a loose wire or a fused (broken) filament.', 'Or the cell may be used up (dead).'], 'Loose connection / fused bulb / dead cell'),
        ex('How do you tell the + terminal in the symbol of a cell?', ['The symbol has two parallel lines.', 'The longer, thinner line is positive.'], 'The longer thin line is +'),
      ],
      practice: [
        mcq('sym', 'Recall the standard symbols.', [
          ['In the symbol of a cell, the longer thin line represents…', 'The positive terminal', ['The negative terminal', 'The bulb', 'The switch'], 'Long = plus.', 'The long thin line is positive; the short thick line is negative.'],
          ['A battery is…', 'A combination of two or more cells', ['A single bulb', 'A type of switch', 'A wire'], 'Think of a torch with 2–3 cells.', 'Several cells joined together make a battery.'],
          ['When the switch is OFF, the circuit is…', 'Open — no current flows', ['Closed — current flows', 'Short-circuited', 'Doubled'], 'OFF leaves a gap.', 'An OFF switch makes a gap, breaking the path.'],
          ['A dry cell usually gives a voltage of…', '1.5 V', ['230 V', '12 V', '0 V'], 'Look on a torch cell.', 'Common AA and D cells give 1.5 V.'],
          ['Current flows in a circuit only if…', 'The path is complete from + to −', ['The bulb is new', 'The wire is red', 'The switch is OFF'], 'No gaps allowed.', 'Current needs a closed circuit.'],
        ]),
        matchT('match-sym', 'component to how its symbol looks', [
          ['Cell', 'Long thin line and short thick line'], ['Battery', 'Several cell symbols in a row'], ['Open switch', 'A gap with a raised lever'], ['Connecting wire', 'A plain straight line'], ['Bulb', 'Circle with a cross or loop inside'],
        ], ['A battery is just cells in a row.', 'An open switch shows a break.']),
        tapT('tap-glow', 'Tap every situation in which the bulb WILL glow.', [
          ['Fresh cell, good bulb, switch ON, all wires tight', true], ['Two fresh cells joined + to −, switch ON', true], ['Torch with fresh cells pressed ON', true],
          ['Switch OFF', false], ['One wire disconnected from the cell', false], ['Bulb filament broken', false], ['Both wires on the same terminal of the cell', false],
        ], ['Ask: is there a complete path from + to −?', 'A broken filament or OFF switch breaks the path.'], 'The bulb glows only in a closed circuit with a working cell and bulb.'),
      ],
    },
    {
      id: 'ts7.sc.elec.series', title: 'Series and parallel circuits', prereqs: ['ts7.sc.elec.circuit'],
      activities: ['lab:circuit'],
      intro: [
        h('One path or many paths?'),
        photo('💡', 'Bulbs at home are connected so that each can be switched on or off by itself.'),
        p('In a series circuit, components are connected one after another in a single loop, so the same current passes through all of them. In a parallel circuit, components are connected across the same two points, each on its own separate branch.'),
        h('Cells in series'),
        p('When cells are joined in series — the + of one touching the − of the next, as in a torch — their voltages add up. Two 1.5 V cells give 3 V; three give 4.5 V. A bulb glows brighter with more cells in series (up to its rated value).'),
        f('Total voltage of n identical cells in series = n × voltage of one cell', 'total voltage equals number of cells times the voltage of one cell'),
        xp({
          title: 'What if? Adding cells in series', formula: 'V = n × V₁',
          res: ['V', 'Total voltage of the battery', 'V', 'n * V1', 1],
          vars: [['n', 'Number of cells in series', '', 1, 8, 1, 2], ['V1', 'Voltage of one cell', 'V', 1, 2, 0.5, 1.5]],
          notes: [['n', 'Each extra cell adds its voltage — the bulb gets brighter.', 'Fewer cells, less voltage — the bulb gets dimmer.'], ['V1', 'Higher-voltage cells give a bigger total.', 'Lower-voltage cells give a smaller total.']],
          mistakes: [['Joining + to + in series', 'In series the + of one cell must touch the − of the next, or the voltages cancel.'], ['Thinking cells in parallel add voltage', 'Only series cells add voltage; parallel cells keep the same voltage but last longer.']],
          real: 'A TV remote uses 2 × 1.5 V = 3 V; a big torch may use 3 cells = 4.5 V.',
        }),
        h('Bulbs in series vs parallel'),
        stepsB(
          'Bulbs in series: if one bulb fuses or is removed, the single path breaks and ALL bulbs go off. Adding more bulbs in series makes each one dimmer.',
          'Bulbs in parallel: each bulb has its own path. If one fuses, the others keep glowing, and each glows with full brightness.',
          'House wiring is parallel, so each fan, light and TV works independently with its own switch.',
          'Old serial decoration lights went completely dark if one tiny bulb failed — they were in series.',
        ),
        keys('Series: one path; parallel: separate branches.', 'Cells in series add voltage: n × 1.5 V.', 'One bulb fails in series → all off; in parallel → others stay on.', 'Homes are wired in parallel.'),
      ],
      examples: [
        ex('A toy needs 6 V. How many 1.5 V cells must be joined in series?', ['n = total voltage ÷ voltage of one cell', '= 6 ÷ 1.5 = 4'], '4 cells'),
        ex('In a Diwali light string, one bulb fused and the whole string went dark. How were the bulbs connected?', ['If one failure stops all bulbs, there is only one path.', 'A single path means series.'], 'In series'),
      ],
      practice: [
        tp('cells', (r) => {
          const n = r.pick([2, 3, 4, 5, 6]);
          return numQ(`${n} cells of 1.5 V each are joined in series. What is the total voltage?`, n * 1.5, 'V',
            ['Voltages of cells in series add up.', `Multiply ${n} × 1.5.`],
            [`Total = ${n} × 1.5 V = ${n * 1.5} V`],
            [{ when: '1.5', explain: 'That is the voltage of only one cell. In series, the voltages add.' }]);
        }),
        tp('how-many', (r) => {
          const n = r.pick([2, 3, 4, 6, 8]);
          const thing = r.pick(['toy car', 'radio', 'torch', 'clock']);
          return numQ(`A ${thing} needs ${n * 1.5} V. How many 1.5 V cells must be joined in series?`, n, undefined,
            ['Number of cells = total voltage ÷ voltage of one cell.', `${n * 1.5} ÷ 1.5`],
            [`n = ${n * 1.5} ÷ 1.5 = ${n} cells`]);
        }, 2),
        mcq('sp', 'One path (series) or many paths (parallel)?', [
          ['In a series circuit of 3 bulbs, one bulb fuses. The other two…', 'Go off', ['Glow brighter', 'Keep glowing normally', 'Start flashing'], 'Only one path exists.', 'The single path is broken, so no current flows anywhere.'],
          ['Electrical wiring in our homes is in…', 'Parallel', ['Series', 'Neither', 'A single loop'], 'Each fan has its own switch.', 'Parallel wiring lets each appliance work independently.'],
          ['Adding more bulbs in series with one cell makes each bulb…', 'Dimmer', ['Brighter', 'Exactly the same', 'Explode'], 'The same cell must push current through more bulbs.', 'More bulbs in series reduce the current, so each is dimmer.'],
          ['Two bulbs in parallel with a cell; one is unscrewed. The other…', 'Keeps glowing', ['Goes off', 'Becomes dimmer than zero', 'Fuses'], 'It has its own branch.', 'In parallel each bulb has a separate path.'],
          ['In a torch, cells are placed so that…', 'The + of one touches the − of the next (series)', ['+ touches +', '− touches −', 'They do not touch'], 'Their voltages should add.', 'Series connection adds the voltages.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.elec.heat', title: 'Heating effect of current; fuses, MCBs and CFLs', prereqs: ['ts7.sc.elec.circuit'],
      intro: [
        h('Why does a bulb get hot?'),
        photo('🔥', 'The red-hot coil of an electric heater shows the heating effect of current.'),
        p('When current flows through a wire, the wire gets warm. If the wire is thin and made of a special alloy, it can become red hot. This is the heating effect of electric current.'),
        def('Heating effect of current', 'The production of heat in a wire when electric current flows through it.'),
        p('Uses: electric iron, kettle, water heater (geyser), toaster, room heater and soldering iron all have a coil (element) usually of nichrome. An ordinary (incandescent) bulb has a very thin tungsten filament that becomes so hot it glows and gives light — but most of the energy is wasted as heat.'),
        h('Safety: fuses and MCBs'),
        p('Too much current — from switching on too many appliances at once (overloading) or from wires touching each other (short circuit) — can overheat wires and start a fire. A fuse is a short piece of thin wire with a low melting point placed in the circuit. When the current becomes too large, the fuse wire melts and breaks the circuit, protecting the house. Modern homes use MCBs (miniature circuit breakers), switches that trip off automatically when current is too high and can simply be switched on again.'),
        h('Saving energy'),
        p('CFLs (compact fluorescent lamps) and LED bulbs give the same light as ordinary bulbs while using much less electricity and staying cooler. Always buy appliances with the ISI mark.'),
        keys('Current heats wires: heaters, irons, kettles use nichrome; bulbs use tungsten.', 'Fuse wire melts when current is too high; MCB trips off.', 'Short circuit and overloading are dangerous.', 'CFLs and LEDs save electricity.'),
        remember('Never replace a fuse wire with an ordinary copper wire — it will not melt in time and can cause a fire.'),
      ],
      examples: [
        ex('Why does a 60 W ordinary bulb feel hot after some time?', ['Current through the thin tungsten filament heats it so much that it glows.', 'Much of the energy comes out as heat.'], 'Because of the heating effect of current in the filament'),
        ex('In a house, the AC, geyser, iron and heater are switched on together and the MCB trips. Why?', ['Many high-power appliances together draw a very large current.', 'This is overloading.', 'The MCB senses the large current and switches off.'], 'Overloading — current became too high'),
      ],
      practice: [
        mcq('heat', 'Think of the heating effect and safety devices.', [
          ['The element of an electric iron is usually made of…', 'Nichrome', ['Copper', 'Plastic', 'Glass'], 'It is an alloy that gets red hot without melting.', 'Nichrome resists current and becomes hot.'],
          ['A fuse protects a circuit by…', 'Melting and breaking the circuit when current is too high', ['Increasing the current', 'Storing electricity', 'Making the bulb brighter'], 'It is a deliberately weak link.', 'The thin fuse wire melts first, stopping the current.'],
          ['An MCB is better than a fuse because…', 'It switches off automatically and can be reset without replacing any wire', ['It never switches off', 'It makes appliances run faster', 'It works without electricity'], 'Think about what happens after it trips.', 'An MCB just needs to be switched back on.'],
          ['The filament of an ordinary bulb is made of…', 'Tungsten', ['Nichrome', 'Copper', 'Iron'], 'It has a very high melting point.', 'Tungsten can glow white-hot without melting.'],
          ['A short circuit happens when…', 'Live and neutral wires touch directly', ['A bulb is switched off', 'A cell is removed', 'A fan is cleaned'], 'Current takes a shortcut.', 'Touching wires let a huge current flow.'],
          ['Which lamp gives the same light using the least electricity?', 'LED', ['Ordinary filament bulb', 'Kerosene lamp', 'Room heater'], 'It stays cool.', 'LEDs waste very little energy as heat.'],
        ]),
        tapT('tap-heat', 'Tap every appliance that works mainly on the HEATING effect of current.', [
          ['Electric iron', true], ['Kettle', true], ['Geyser', true], ['Toaster', true], ['Room heater', true], ['Soldering iron', true],
          ['Ceiling fan', false], ['Mobile phone screen', false], ['Electric doorbell', false],
        ], ['Its main job is to produce heat.', 'Fans and bells use the magnetic effect, not heating.'], 'Irons, kettles, geysers, toasters, heaters and soldering irons are built to make heat.'),
        matchT('match-safety', 'term to its meaning', [
          ['Fuse', 'Thin wire that melts when current is too high'], ['MCB', 'Switch that trips off automatically on high current'], ['Overloading', 'Too many appliances on one circuit'], ['Short circuit', 'Live and neutral wires touching'], ['CFL', 'Energy-saving fluorescent lamp'], ['ISI mark', 'Sign of tested, safe quality'],
        ], ['Two are devices, two are problems.', 'ISI is a quality certification mark.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Air, Winds and Cyclones
// =====================================================================================
const ch8: USpec = {
  id: 'ts7.sc.ch8', subject: 'physics', title: 'Air, Winds and Cyclones', source: src(8),
  objectives: [
    {
      id: 'ts7.sc.air.pressure', title: 'Air exerts pressure; moving air and wind', prereqs: [],
      intro: [
        h('Air pushes on everything'),
        photo('🎈', 'A balloon swells because the air inside pushes on its walls in all directions.'),
        p('Air is all around us and it has weight. The air above us presses on every surface — this push is air pressure. We use it when we drink through a straw, fill a bicycle tube or use a rubber sucker on a wall.'),
        def('Air pressure', 'The force with which air pushes on a unit area of a surface.'),
        stepsB(
          'Air expands on heating: a balloon tied to a bottle in hot water swells up.',
          'Hot air is lighter (less dense) and rises; cooler air sinks — that is why smoke goes up.',
          'Increased wind speed is accompanied by reduced air pressure: blow between two hanging papers and they come TOGETHER, not apart.',
          'During storms, fast wind over a roof lowers the pressure above it, and the higher pressure inside can lift tin roofs off.',
        ),
        def('Wind', 'Moving air. Air moves from a region of high pressure to a region of low pressure.'),
        keys('Air has weight and exerts pressure in all directions.', 'Air expands when heated; warm air rises.', 'Fast-moving air has lower pressure.', 'Wind blows from high pressure to low pressure.'),
        remember('The bigger the difference in pressure, the faster the wind.'),
        tip('Experiment: blow hard over a strip of paper held below your lips — it rises, because the fast air above it has lower pressure.'),
      ],
      examples: [
        ex('Two balloons hang a little apart. Teja blows air between them. What happens and why?', ['Blowing makes the air between them move fast.', 'Fast-moving air has low pressure.', 'The higher pressure on the outer sides pushes them together.'], 'They move towards each other'),
        ex('Why does smoke from a chulha go upwards?', ['Smoke is carried by hot air from the fire.', 'Hot air expands and becomes lighter.', 'Lighter air rises.'], 'Hot air carrying smoke is lighter and rises'),
      ],
      practice: [
        mcq('press', 'Air pushes; warm air rises; fast air has low pressure.', [
          ['When air is heated, it…', 'Expands and rises', ['Contracts and sinks', 'Turns into water', 'Stays the same'], 'Think of a hot-air balloon.', 'Warm air expands, becomes lighter and rises.'],
          ['Wind blows from…', 'High pressure to low pressure', ['Low pressure to high pressure', 'Cold to colder places only', 'Nowhere in particular'], 'Like water flowing downhill.', 'Air moves from where pressure is high to where it is low.'],
          ['Blowing between two hanging sheets of paper makes them…', 'Come together', ['Fly apart', 'Fall down', 'Catch fire'], 'Fast air → low pressure.', 'Lower pressure between them lets outer air push them together.'],
          ['During a strong storm, tin roofs are sometimes lifted off because…', 'Fast wind above the roof lowers the pressure there', ['The roof becomes lighter', 'Rain pushes it up', 'The house shakes'], 'Compare pressure above and below.', 'Higher pressure under the roof pushes it up.'],
          ['We can suck juice through a straw because of…', 'Air pressure on the juice surface', ['Gravity pulling juice up', 'Magnetism', 'Heat'], 'Sucking lowers pressure in the straw.', 'The outside air pushes juice up into the low-pressure straw.'],
        ]),
        tapT('tap-press', 'Tap every observation that shows air EXERTS PRESSURE or EXPANDS on heating.', [
          ['A balloon swells when its bottle is put in hot water', true], ['A rubber sucker sticks to a wall', true], ['A bicycle tube becomes hard when pumped', true], ['Drinking through a straw', true],
          ['Ice melting in a glass', false], ['A magnet attracting iron', false], ['Sugar dissolving in water', false],
        ], ['Look for air pushing or expanding.', 'Melting, magnetism and dissolving are not about air pressure.'], 'Balloon, sucker, tube and straw all work because of air pressure or expansion.'),
        orderT('order-wind', 'Put the steps of how a breeze starts in order.', ['The Sun heats one area more than another', 'Air over the hotter area expands and rises', 'Pressure falls over the hot area', 'Cooler air from the high-pressure area moves in — wind'], ['Heating comes first.', 'Wind is the last effect.'], 'Uneven heating → rising air → low pressure → air rushes in.'),
      ],
    },
    {
      id: 'ts7.sc.air.winds', title: 'Winds caused by uneven heating: breezes and monsoons', prereqs: ['ts7.sc.air.pressure'],
      intro: [
        h('Why the sea breeze cools the coast in the afternoon'),
        photo('🌬️', 'A cool breeze blows from the sea towards the land in the afternoon.'),
        p('The Sun does not heat everything equally. Land heats up and cools down faster than water. This uneven heating creates pressure differences and therefore winds.'),
        stepsB(
          'Sea breeze (day): land becomes hotter than the sea; warm air over land rises; cooler air from the sea blows towards the land.',
          'Land breeze (night): land cools faster than the sea; warmer air over the sea rises; cooler air from the land blows towards the sea.',
          'Equator and poles: the equator gets the most direct sunlight; warm air there rises and cooler air from the poles moves in.',
          'Monsoon: in summer the Indian landmass heats up strongly; moist winds blow in from the Indian Ocean and Arabian Sea — the south-west monsoon — bringing rain to Telangana from June.',
        ),
        def('Monsoon', 'Seasonal winds that reverse direction between summer and winter; the summer monsoon brings most of India\'s rain.'),
        keys('Land heats and cools faster than water.', 'Day: sea breeze (sea → land). Night: land breeze (land → sea).', 'Uneven heating of equator and poles drives big wind systems.', 'South-west monsoon winds bring rain to Telangana in June–September.'),
        remember('Fishermen use the land breeze at dawn to sail out and the sea breeze in the afternoon to sail back.'),
      ],
      examples: [
        ex('In the afternoon on Visakhapatnam beach, which way does the breeze blow?', ['By day, land is hotter than the sea.', 'Air over land rises, lowering pressure there.', 'Cool air flows from sea to land.'], 'From the sea to the land (sea breeze)'),
        ex('Why do monsoon winds carry so much water?', ['They blow over the warm ocean for thousands of kilometres.', 'They pick up water vapour by evaporation.', 'When they rise over land, the vapour condenses and falls as rain.'], 'They pick up moisture over the ocean'),
      ],
      practice: [
        mcq('breeze', 'Land heats and cools faster than water.', [
          ['During the day, the breeze at a beach blows…', 'From sea to land', ['From land to sea', 'Straight upwards', 'Not at all'], 'Which is hotter in the day?', 'Land is hotter; air rises over it and sea air moves in.'],
          ['At night, the breeze at a beach blows…', 'From land to sea', ['From sea to land', 'Downwards only', 'In circles'], 'Land cools faster.', 'The sea stays warmer at night, so air moves from land to sea.'],
          ['Land heats up faster than water. This causes…', 'Uneven heating and winds', ['Earthquakes', 'Tides', 'Eclipses'], 'Different temperatures → different pressures.', 'Uneven heating creates pressure differences that drive winds.'],
          ['The rain-bearing monsoon winds reach Telangana from the…', 'South-west', ['North-east in summer', 'North pole', 'Himalayas'], 'They come from the Arabian Sea side.', 'The south-west monsoon arrives in June.'],
          ['Air at the equator generally…', 'Gets heated, expands and rises', ['Sinks because it is cold', 'Stays still', 'Freezes'], 'The equator gets the most direct sunlight.', 'Warm equatorial air rises and cooler air moves in from the poles.'],
        ]),
        tp('which', (r) => {
          const day = r.next() < 0.5;
          const place = r.pick(['Visakhapatnam', 'Chennai', 'Kakinada', 'Puri', 'Kochi', 'Mumbai']);
          const time = day ? r.pick(['2 pm', '3 pm', 'noon', '11 am']) : r.pick(['10 pm', 'midnight', '3 am', '4 am']);
          const ans = day ? 'Sea breeze — from sea to land' : 'Land breeze — from land to sea';
          return {
            type: 'mcq', prompt: `At ${time} on a clear day at ${place} beach, which breeze blows?`,
            ...choose(r, ans, [day ? 'Land breeze — from land to sea' : 'Sea breeze — from sea to land', 'No breeze at all']),
            hints: ['Is the land hotter or cooler than the sea at this time?', 'Air moves from the cooler (high-pressure) area to the warmer one.'],
            mistakes: [{ when: 'wrong', explain: day ? 'In daytime the land is hotter, so cool sea air flows to land.' : 'At night the land is cooler, so air flows from land to sea.' }],
            solution: [day ? 'Daytime: land hotter → air rises over land → sea breeze.' : 'Night: land cooler → air rises over the sea → land breeze.'],
          };
        }),
        matchT('match-wind', 'situation to the wind it causes', [
          ['Hot land, cooler sea (day)', 'Sea breeze'], ['Cool land, warmer sea (night)', 'Land breeze'], ['Indian land heated strongly in summer', 'South-west monsoon'], ['Hot equator, cold poles', 'Winds from poles towards equator'],
        ], ['Air flows towards the warmer region.', 'The monsoon is a giant seasonal sea breeze.'], 4),
      ],
    },
    {
      id: 'ts7.sc.air.cyclones', title: 'Cyclones: how they form and how to stay safe', prereqs: ['ts7.sc.air.winds'],
      intro: [
        h('A giant spinning storm'),
        photo('🌀', 'From a satellite, a cyclone looks like a huge spiral of clouds with a calm "eye" in the middle.'),
        p('Over warm ocean water (above about 26 °C), air takes in a lot of water vapour and rises. As it rises it cools and the vapour condenses into clouds, releasing heat. This heat warms the air further so it rises faster, the pressure at the centre drops very low, and air from all around rushes in, spinning. A cyclone is born.'),
        def('Cyclone', 'A huge, fast-spinning storm system around a centre of very low pressure, formed over warm oceans, with strong winds and heavy rain.'),
        p('The calm, clear centre is the eye (10–30 km wide). Around it the winds can reach 150–250 km/h. Cyclones from the Bay of Bengal often hit the coasts of Andhra Pradesh, Odisha and Tamil Nadu; as they move inland they bring very heavy rain to Telangana too.'),
        h('Staying safe'),
        stepsB(
          'Listen to IMD cyclone warnings on radio, TV and mobile alerts.',
          'Move to a cyclone shelter or a strong building if asked to evacuate.',
          'Keep drinking water, dry food, a torch and medicines ready.',
          'Do not touch fallen electric wires; do not go near the sea or flooded rivers.',
          'Fishermen must not go to sea after a warning.',
        ),
        keys('Cyclones form over warm oceans.', 'Rising moist air → condensation releases heat → very low pressure → winds spiral in.', 'The eye is calm; strongest winds are around it.', 'Warnings, shelters and preparedness save lives.'),
        remember('Satellites and radar now help scientists warn people days before a cyclone arrives.'),
      ],
      examples: [
        ex('Why do cyclones form over oceans and not over deserts?', ['Cyclones need huge amounts of water vapour.', 'Condensation of this vapour releases the heat that powers the storm.', 'Deserts have little water to evaporate.'], 'They need warm water and moisture from the ocean'),
        ex('People in the eye of a cyclone feel calm weather. Why should they still not go outside?', ['The eye is only the centre.', 'After it passes, the strong winds on the other side arrive suddenly from the opposite direction.'], 'Strong winds return as the other side of the cyclone passes'),
      ],
      practice: [
        orderT('form', 'Put the steps of cyclone formation in order.', [
          'Sun heats the ocean surface strongly', 'Warm, moist air rises over the ocean', 'Water vapour condenses into clouds and releases heat', 'Pressure at the centre drops very low', 'Air rushes in from all sides and spirals around the centre',
        ], ['It all starts with the Sun heating water.', 'The spiral is the final stage.'], 'Heating → rising moist air → condensation heat → very low pressure → spiralling winds.', 2),
        mcq('cyc', 'Think of warm oceans and low pressure.', [
          ['The calm centre of a cyclone is called the…', 'Eye', ['Wall', 'Tail', 'Root'], 'It is at the very middle.', 'The eye is a calm, clear region of very low pressure.'],
          ['Cyclones that affect Telangana mostly form over the…', 'Bay of Bengal', ['Thar Desert', 'Himalayas', 'Deccan plateau'], 'An ocean to the east.', 'Bay of Bengal cyclones move west over the east coast.'],
          ['Which agency in India issues cyclone warnings?', 'India Meteorological Department (IMD)', ['Railway Board', 'Election Commission', 'Reserve Bank'], 'It studies weather.', 'IMD monitors cyclones with satellites and radar.'],
          ['What gives a cyclone its energy?', 'Heat released when water vapour condenses', ['Wind from mountains', 'Electricity from lightning only', 'The Moon\'s gravity'], 'Warm oceans provide the vapour.', 'Condensation releases heat that powers the rising air.'],
          ['Which is a SAFE action during a cyclone warning?', 'Move to a cyclone shelter', ['Go to the beach to watch', 'Touch fallen wires', 'Go fishing'], 'Safety first.', 'Shelters protect people from wind and floods.'],
        ]),
        tapT('tap-safe', 'Tap every action that is SAFE when a cyclone warning is issued.', [
          ['Listen to warnings on radio and TV', true], ['Store drinking water and dry food', true], ['Move to a cyclone shelter if told to', true], ['Keep a torch and medicines ready', true],
          ['Go out to sea to fish', false], ['Stand under a tree in the wind', false], ['Touch fallen electric wires', false],
        ], ['Think: would this protect you or put you at risk?', 'Sea, trees and wires are dangerous during cyclones.'], 'Listening, storing supplies and sheltering keep you safe.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Reflection of Light
// =====================================================================================
const ch9: USpec = {
  id: 'ts7.sc.ch9', subject: 'physics', title: 'Reflection of Light', source: src(9),
  objectives: [
    {
      id: 'ts7.sc.light.rays', title: 'Rays of light, laws of reflection and the periscope', prereqs: [],
      activities: ['lab:light'],
      intro: [
        h('Light travels in straight lines'),
        photo('🔦', 'A torch beam in a dusty room shows that light travels in straight lines.'),
        p('Look at a candle flame through a straight pipe — you can see it. Bend the pipe and the flame disappears. Light travels in straight lines. A line with an arrow showing the direction of light is called a ray; a bundle of rays is a beam.'),
        p('When light falls on a smooth shiny surface like a mirror, it bounces back. This is reflection. The ray that falls on the mirror is the incident ray, the ray that bounces off is the reflected ray, and the line drawn at 90° to the mirror at that point is the normal.'),
        def('Laws of reflection', '(1) The angle of incidence equals the angle of reflection (∠i = ∠r). (2) The incident ray, the reflected ray and the normal all lie in the same plane.'),
        p('Angles are always measured from the NORMAL, not from the mirror. If a ray makes 30° with the mirror surface, its angle of incidence is 90° − 30° = 60°.'),
        h('The periscope'),
        p('A periscope has two plane mirrors fixed at 45° at the two ends of a tube, facing each other. Light from an object reflects twice and reaches the eye, so you can see over a wall or, in a submarine, above the water.'),
        keys('Light travels in straight lines.', '∠i = ∠r, measured from the normal.', 'Angle from the mirror → subtract from 90° to get ∠i.', 'Periscope: two mirrors at 45°.'),
        remember('If the ray falls along the normal (∠i = 0°), it is reflected straight back.'),
      ],
      examples: [
        ex('A ray falls on a plane mirror with an angle of incidence of 35°. Find the angle of reflection.', ['∠r = ∠i', '= 35°'], '35°'),
        ex('A ray makes an angle of 20° with the mirror surface. Find the angle of reflection.', ['Angle of incidence is measured from the normal.', '∠i = 90° − 20° = 70°', '∠r = ∠i = 70°'], '70°'),
      ],
      practice: [
        tp('ir', (r) => {
          const i = r.pick([15, 20, 25, 30, 40, 45, 50, 55, 60, 70]);
          return numQ(`A ray of light strikes a plane mirror at an angle of incidence of ${i}°. What is the angle of reflection?`, i, '°',
            ['Use the first law of reflection.', 'Angle of incidence = angle of reflection.'],
            [`∠r = ∠i = ${i}°`],
            [{ when: String(90 - i), explain: 'Both angles are measured from the normal, and they are equal. No subtraction is needed here.' }]);
        }),
        tp('surface', (r) => {
          const a = r.pick([10, 20, 25, 30, 35, 40, 50, 60]);
          return numQ(`A ray makes an angle of ${a}° with the SURFACE of a plane mirror. What is the angle of reflection?`, 90 - a, '°',
            ['Angles are measured from the normal, which is at 90° to the mirror.', `∠i = 90° − ${a}°`],
            [`∠i = 90° − ${a}° = ${90 - a}°`, `∠r = ∠i = ${90 - a}°`],
            [{ when: String(a), explain: `${a}° is measured from the mirror. Measure from the normal: 90° − ${a}°.` }]);
        }, 2),
        tp('between', (r) => {
          const i = r.pick([20, 25, 30, 35, 40, 45]);
          return numQ(`The angle of incidence is ${i}°. What is the angle between the incident ray and the reflected ray?`, 2 * i, '°',
            ['The angle between the rays = ∠i + ∠r.', `∠r is also ${i}°.`],
            [`∠i + ∠r = ${i}° + ${i}° = ${2 * i}°`]);
        }, 3),
        mcq('ref', 'Recall the laws and the periscope.', [
          ['The angle of incidence is measured between the incident ray and…', 'The normal', ['The mirror surface', 'The reflected ray', 'The floor'], 'The normal is at 90° to the mirror.', 'All reflection angles are measured from the normal.'],
          ['In a periscope the mirrors are fixed at an angle of…', '45°', ['90°', '30°', '0°'], 'They turn the light through 90° each.', 'Mirrors at 45° turn the light down the tube and then to the eye.'],
          ['A ray that falls along the normal is reflected…', 'Straight back along the same path', ['Along the mirror', 'At 45°', 'Not at all'], '∠i = 0°.', 'If ∠i = 0°, ∠r = 0°.'],
          ['Which shows that light travels in straight lines?', 'We cannot see a candle flame through a bent pipe', ['A mirror shows our face', 'The sky is blue', 'Water boils'], 'Think of the pipe experiment.', 'Light cannot follow a bend; it goes straight.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.light.plane', title: 'Images in a plane mirror; lateral inversion; multiple images', prereqs: ['ts7.sc.light.rays'],
      activities: ['lab:light'],
      intro: [
        h('What is special about your mirror image?'),
        photo('🪟', 'A smooth, shiny surface like a still window pane or a mirror forms an image.'),
        stepsB(
          'Erect — the image is upright, not upside down.',
          'Same size as the object.',
          'As far behind the mirror as the object is in front of it.',
          'Virtual — it cannot be caught on a screen.',
          'Laterally inverted — left and right are swapped.',
        ),
        def('Lateral inversion', 'The left–right reversal of an image formed by a plane mirror. Raise your right hand and your image raises its left.'),
        p('That is why "AMBULANCE" is painted as a mirror-reversed word on the front of ambulances — drivers ahead read it correctly in their rear-view mirrors.'),
        h('Multiple images'),
        p('Two plane mirrors placed at an angle form several images, because light reflects from one mirror to the other again and again. A kaleidoscope uses three mirror strips to make beautiful repeating patterns.'),
        f('n = 360° / θ − 1', 'number of images equals 360 divided by the angle, minus 1'),
        xp({
          title: 'What if? Mirrors at an angle', formula: 'n = 360/θ − 1',
          res: ['n', 'Number of images', '', '360 / th - 1', 0],
          vars: [['th', 'Angle between the mirrors (θ)', '°', 30, 120, 30, 90]],
          notes: [['th', 'Opening the mirrors wider gives fewer images.', 'Closing the mirrors gives more images.']],
          mistakes: [['Forgetting to subtract 1', '360/θ counts the object itself as one of the "copies"; the images are one fewer.'], ['Using any angle', 'The formula works neatly when θ divides 360 exactly (30°, 60°, 90°, 120°…).']],
          real: 'Mirrors at 60° give 5 images — the basis of a kaleidoscope pattern; parallel mirrors in a salon give endless images.',
        }),
        keys('Plane mirror image: erect, same size, virtual, laterally inverted.', 'Image distance behind = object distance in front.', 'Two mirrors at θ: n = 360/θ − 1 images.', 'Parallel mirrors give infinitely many images.'),
        remember('If you stand 2 m in front of a mirror, your image is 2 m behind it — 4 m away from you.'),
      ],
      examples: [
        ex('Diya stands 1.5 m in front of a plane mirror. How far is her image from her?', ['Image is 1.5 m behind the mirror.', 'Distance from Diya = 1.5 + 1.5 = 3 m'], '3 m'),
        ex('How many images are formed by two mirrors at 60°?', ['n = 360/60 − 1', '= 6 − 1 = 5'], '5 images'),
      ],
      practice: [
        tp('distance', (r) => {
          const d = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]);
          const n = who(r);
          return numQ(`${n} stands ${d} m in front of a plane mirror. What is the distance between ${n} and the image?`, 2 * d, 'm',
            ['The image is as far behind the mirror as the object is in front.', `Image is ${d} m behind; add both distances.`],
            [`${d} m + ${d} m = ${2 * d} m`],
            [{ when: String(d), explain: 'That is the distance from the mirror. The question asks for the distance from the person to the image.' }]);
        }),
        tp('images', (r) => {
          const th = r.pick([30, 36, 40, 45, 60, 72, 90, 120]);
          return numQ(`Two plane mirrors are placed at an angle of ${th}° to each other with a coin between them. How many images of the coin are formed?`, 360 / th - 1, undefined,
            ['Use n = 360/θ − 1.', `360 ÷ ${th} = ${360 / th}`],
            [`n = 360/${th} − 1 = ${360 / th} − 1 = ${360 / th - 1}`],
            [{ when: String(360 / th), explain: 'Subtract 1 — the object itself is not an image.' }]);
        }, 2),
        mcq('lateral', 'Think of standing in front of a mirror.', [
          ['You raise your RIGHT hand in front of a mirror. Your image raises its…', 'Left hand', ['Right hand', 'Both hands', 'No hand'], 'Left and right swap.', 'A plane mirror shows lateral inversion.'],
          ['Why is AMBULANCE written in reverse on the front of the vehicle?', 'So drivers ahead read it correctly in their mirrors', ['To look stylish', 'Because of a printing error', 'So it can be read at night'], 'Mirror images are laterally inverted.', 'The mirror reverses it back to normal.'],
          ['The image in a plane mirror is…', 'Virtual and erect', ['Real and inverted', 'Real and erect', 'Virtual and inverted'], 'It cannot be caught on a screen and is upright.', 'Plane mirrors form virtual, erect images.'],
          ['Compared with the object, a plane mirror image is…', 'The same size', ['Bigger', 'Smaller', 'Half the size'], 'Your image is as tall as you.', 'Plane mirror images are the same size.'],
          ['Which word looks the same in a plane mirror?', 'TOOT', ['BAG', 'CAT', 'DOG'], 'Look for letters that are symmetric left-to-right.', 'T and O are left–right symmetric, and TOOT reads the same backwards.'],
          ['Two parallel mirrors facing each other form…', 'Infinitely many images', ['One image', 'Two images', 'No image'], 'Light bounces back and forth.', 'Repeated reflections between parallel mirrors form endless images.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.light.curved', title: 'Concave and convex mirrors; real and virtual images', prereqs: ['ts7.sc.light.plane'],
      intro: [
        h('Look into a steel spoon'),
        photo('🥄', 'The inside of a spoon acts like a concave mirror; the back acts like a convex mirror.'),
        p('A spherical mirror is curved like part of a ball. If the reflecting surface is curved inwards (like a cave), it is a concave mirror. If it bulges outwards, it is a convex mirror.'),
        def('Real image', 'An image that can be obtained on a screen; it is always inverted.'),
        def('Virtual image', 'An image that cannot be obtained on a screen; it is erect (as in a plane mirror).'),
        stepsB(
          'Concave mirror, object far away: real, inverted and smaller image (you see yourself upside down in a spoon held far away).',
          'Concave mirror, object very close: virtual, erect and ENLARGED image — used as a shaving or make-up mirror and by dentists.',
          'Concave mirrors also collect light: torches, vehicle headlights and solar cookers use them.',
          'Convex mirror, always: virtual, erect and smaller image, but shows a WIDE area — used as rear-view mirrors in vehicles and at sharp turns on ghat roads.',
        ),
        keys('Concave: caves in; can form real or virtual images.', 'Convex: bulges out; always virtual, erect, diminished.', 'Real images can be caught on a screen and are inverted.', 'Uses: concave — dentist, torch, headlight; convex — rear-view mirror.'),
        remember('Only a concave mirror can form a real image; plane and convex mirrors give only virtual images.'),
      ],
      examples: [
        ex('Which mirror should a bus driver use to see the traffic behind, and why?', ['The driver needs a wide view.', 'A convex mirror gives an erect, small image of a large area.'], 'Convex mirror — wide field of view'),
        ex('A dentist uses a small mirror to see a tooth enlarged. Which mirror is it?', ['An enlarged, erect image of a close object is needed.', 'A concave mirror gives this when the object is very close.'], 'Concave mirror'),
      ],
      practice: [
        matchT('use', 'use to the mirror needed', [
          ['Rear-view mirror of a scooter', 'Convex mirror'], ['Dentist\'s mirror', 'Concave mirror'], ['Torch reflector', 'Concave mirror'], ['Dressing-table mirror', 'Plane mirror'], ['Mirror at a sharp ghat-road bend', 'Convex mirror'], ['Solar cooker reflector', 'Concave mirror'],
        ], ['Wide view → convex; enlarging or focusing light → concave.', 'An ordinary full-size image → plane.']),
        mcq('cc', 'Concave caves in; convex bulges out.', [
          ['Which mirror ALWAYS forms a virtual, erect and diminished image?', 'Convex mirror', ['Concave mirror', 'Plane mirror', 'None'], 'Think of a rear-view mirror.', 'A convex mirror always gives small, erect, virtual images.'],
          ['A real image is one that…', 'Can be caught on a screen', ['Cannot be caught on a screen', 'Is always erect', 'Only forms in plane mirrors'], 'Real light rays meet there.', 'Real images form where light actually meets, so a screen shows them.'],
          ['The inner surface of a shiny steel spoon behaves like a…', 'Concave mirror', ['Convex mirror', 'Plane mirror', 'Lens'], 'It curves inward.', 'An inward-curved surface is concave.'],
          ['Which mirror can form an enlarged image?', 'Concave mirror', ['Convex mirror', 'Plane mirror', 'All of them'], 'Shaving mirrors magnify.', 'A concave mirror magnifies a close object.'],
          ['A convex mirror is used at blind turns on hill roads because…', 'It shows a wider area', ['It makes things bigger', 'It forms real images', 'It is cheaper'], 'Drivers need to see more of the road.', 'Convex mirrors give a wide field of view.'],
          ['Only one kind of mirror can form a real image. Which?', 'Concave', ['Convex', 'Plane', 'Any mirror'], 'It converges light.', 'Concave mirrors bring light rays together to a real image.'],
        ]),
        tapT('tap-real', 'Tap every image that is VIRTUAL.', [
          ['Your image in a plane mirror', true], ['Image in a scooter rear-view (convex) mirror', true], ['Enlarged face in a shaving mirror held close', true], ['Your image on the back of a spoon', true],
          ['Upside-down image of a distant tree on a screen using a concave mirror', false], ['Image of the Sun focused on paper by a concave mirror', false],
        ], ['Virtual images cannot be caught on a screen.', 'Images formed on a screen or paper are real.'], 'Plane and convex mirror images, and close-up concave images, are virtual.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Nutrition in Plants
// =====================================================================================
const ch10: USpec = {
  id: 'ts7.sc.ch10', subject: 'biology', title: 'Nutrition in Plants', source: src(10),
  objectives: [
    {
      id: 'ts7.sc.plantnut.nutrients', title: 'What plants need: water, air and mineral nutrients', prereqs: [],
      intro: [
        h('Plants make their own food — but need raw materials'),
        photo('🌱', 'A young seedling takes water and minerals from the soil and air through its leaves.'),
        p('Animals, including us, must eat other organisms for food — we are heterotrophs. Green plants make their own food — they are autotrophs ("auto" = self, "troph" = nourishment).'),
        def('Autotroph', 'An organism that makes its own food from simple substances, like green plants.'),
        def('Heterotroph', 'An organism that depends on other organisms for food.'),
        p('To make food, plants need water and minerals from the soil and carbon dioxide from the air. Important mineral nutrients are nitrogen (N), phosphorus (P) and potassium (K). Roots absorb water and dissolved minerals, and tiny tubes carry them up the stem to the leaves.'),
        p('Growing crops again and again on the same field uses up these nutrients. Farmers add manure and fertilisers (like urea for nitrogen) to replace them. Pulse crops (redgram, greengram, groundnut) have root nodules with Rhizobium bacteria that take nitrogen from the air and add it to the soil — so farmers grow pulses between cereal crops (crop rotation).'),
        keys('Green plants are autotrophs; animals are heterotrophs.', 'Raw materials: water, minerals (N, P, K) and carbon dioxide.', 'Manures and fertilisers replace soil nutrients.', 'Rhizobium in pulse root nodules fixes nitrogen.'),
        remember('Rhizobium gives the plant nitrogen; the plant gives Rhizobium food and shelter. Both gain — this is called symbiosis.'),
      ],
      examples: [
        ex('A farmer near Jangaon grows redgram after a season of jowar. Why does this help the soil?', ['Redgram is a pulse.', 'Its root nodules contain Rhizobium bacteria.', 'They fix nitrogen from the air into the soil, replacing what jowar used.'], 'Redgram restores nitrogen to the soil'),
        ex('Is a mushroom an autotroph or a heterotroph?', ['A mushroom is not green — it has no chlorophyll.', 'It cannot make its own food; it absorbs food from dead matter.'], 'Heterotroph'),
      ],
      practice: [
        mcq('auto', 'Auto = self; hetero = other.', [
          ['Organisms that make their own food are called…', 'Autotrophs', ['Heterotrophs', 'Parasites', 'Saprotrophs'], 'Auto means self.', 'Autotrophs make food themselves.'],
          ['Which nutrient do Rhizobium bacteria add to the soil?', 'Nitrogen', ['Iron', 'Oxygen', 'Iodine'], 'It is the most common gas in air.', 'Rhizobium fixes atmospheric nitrogen.'],
          ['Rhizobium lives in the root nodules of…', 'Pulse (leguminous) plants', ['Rice', 'Mango trees', 'Cactus'], 'Think of redgram and groundnut.', 'Legumes host Rhizobium in root nodules.'],
          ['Plants absorb water and minerals mainly through their…', 'Roots', ['Flowers', 'Fruits', 'Petals'], 'They are in the soil.', 'Roots absorb water and dissolved minerals.'],
          ['Growing different crops one after another on a field to keep it fertile is called…', 'Crop rotation', ['Irrigation', 'Harvesting', 'Weeding'], 'Crops take turns.', 'Alternating cereals and pulses restores nitrogen.'],
          ['Humans are heterotrophs because…', 'We depend on other organisms for food', ['We make food in sunlight', 'We have chlorophyll', 'We absorb minerals through our skin'], 'Where does our food come from?', 'We eat plants and animals.'],
        ]),
        tapT('tap-auto', 'Tap every AUTOTROPH.', [
          ['Paddy plant', true], ['Neem tree', true], ['Grass', true], ['Green algae in a pond', true], ['Tulsi plant', true],
          ['Cow', false], ['Mushroom', false], ['Human', false], ['Cuscuta (dodder)', false],
        ], ['Autotrophs are green and make food using sunlight.', 'Mushrooms and Cuscuta are not green.'], 'Green plants and algae make their own food; animals, fungi and Cuscuta cannot.'),
        matchT('match-nut', 'term to its meaning', [
          ['Autotroph', 'Makes its own food'], ['Heterotroph', 'Depends on others for food'], ['Rhizobium', 'Bacterium that fixes nitrogen'], ['Fertiliser', 'Factory-made chemical that adds nutrients like N, P, K'], ['Manure', 'Decomposed plant and animal waste'],
        ], ['Two are kinds of organisms, one is a bacterium.', 'Manure is natural; fertiliser is factory-made.']),
      ],
    },
    {
      id: 'ts7.sc.plantnut.photo', title: 'Photosynthesis: why plants need light', prereqs: ['ts7.sc.plantnut.nutrients'],
      intro: [
        h('The food factory in every leaf'),
        photo('🍃', 'Leaves are green because of chlorophyll, which traps the energy of sunlight.'),
        p('Leaves are the food factories of a plant. Their cells contain a green pigment, chlorophyll, which captures energy from sunlight. Using this energy, the leaf combines carbon dioxide (taken in through tiny pores called stomata) with water (brought up from the roots) to make glucose, a sugar. Oxygen is released.'),
        f('carbon dioxide + water → (sunlight, chlorophyll) → glucose + oxygen', 'carbon dioxide plus water, in sunlight with chlorophyll, gives glucose and oxygen'),
        def('Photosynthesis', 'The process by which green plants make food (glucose) from carbon dioxide and water using sunlight energy captured by chlorophyll, releasing oxygen.'),
        p('Glucose is soon changed into starch and stored. So the presence of starch in a leaf is proof that photosynthesis took place.'),
        h('Showing that light is needed'),
        stepsB(
          'Keep a potted plant in the dark for 2–3 days so its leaves use up their starch (destarching).',
          'Cover part of one leaf with black paper on both sides.',
          'Keep the plant in sunlight for a few hours.',
          'Pluck the leaf, boil it in water, then in alcohol (in a water bath, with the teacher) to remove chlorophyll.',
          'Wash it and add iodine solution.',
          'Uncovered parts turn blue-black (starch made); the covered part does not — no light, no photosynthesis.',
        ),
        keys('Raw materials: carbon dioxide + water.', 'Needs: sunlight + chlorophyll.', 'Products: glucose (stored as starch) + oxygen.', 'CO₂ enters through stomata.'),
        remember('Photosynthesis provides almost all the food and oxygen on Earth. Every grain of rice began in a leaf!'),
      ],
      examples: [
        ex('Why is the leaf boiled in alcohol before the iodine test?', ['Chlorophyll\'s green colour would hide the blue-black colour.', 'Alcohol dissolves chlorophyll, making the leaf pale.'], 'To remove chlorophyll so the colour change is visible'),
        ex('In the black-paper experiment, the covered part does not turn blue-black. What does this prove?', ['No blue-black → no starch in that part.', 'That part got no light.', 'So without light, no food was made.'], 'Light is necessary for photosynthesis'),
      ],
      practice: [
        orderT('starch', 'Put the steps of the "light is needed" experiment in order.', [
          'Keep the plant in the dark for 2–3 days', 'Cover part of a leaf with black paper', 'Keep the plant in sunlight for some hours', 'Boil the leaf in alcohol to remove chlorophyll', 'Add iodine and observe',
        ], ['First remove existing starch.', 'Iodine is added last.'], 'Destarch → cover → expose to light → decolourise → test with iodine.', 2),
        mcq('ps', 'CO₂ + water + sunlight + chlorophyll → glucose + oxygen.', [
          ['The green pigment that traps sunlight is…', 'Chlorophyll', ['Haemoglobin', 'Starch', 'Iodine'], 'It makes leaves green.', 'Chlorophyll captures light energy.'],
          ['Carbon dioxide enters a leaf through…', 'Stomata', ['Roots', 'Flowers', 'Bark'], 'Tiny pores on leaves.', 'Stomata are pores that let gases in and out.'],
          ['Which gas is released during photosynthesis?', 'Oxygen', ['Carbon dioxide', 'Nitrogen', 'Hydrogen'], 'It is the gas we breathe in.', 'Photosynthesis releases oxygen.'],
          ['The food first made in photosynthesis is…', 'Glucose', ['Protein', 'Fat', 'Vitamin C'], 'A simple sugar.', 'Glucose is made and later stored as starch.'],
          ['Presence of starch in a leaf is shown by…', 'Blue-black colour with iodine', ['Violet colour with copper sulphate', 'Oily patch', 'Pink colour with phenolphthalein'], 'Recall the food tests.', 'Iodine turns starch blue-black.'],
          ['Which is NOT needed for photosynthesis?', 'Oxygen', ['Sunlight', 'Carbon dioxide', 'Water'], 'It is a product, not a raw material.', 'Oxygen is given out, not used.'],
        ]),
        tapT('tap-need', 'Tap everything a leaf NEEDS to carry out photosynthesis.', [
          ['Sunlight', true], ['Chlorophyll', true], ['Carbon dioxide', true], ['Water', true],
          ['Oxygen', false], ['Starch', false], ['Iodine', false],
        ], ['Raw materials go in; products come out.', 'Oxygen and starch are products; iodine is only a test chemical.'], 'Sunlight, chlorophyll, carbon dioxide and water are needed.'),
      ],
    },
    {
      id: 'ts7.sc.plantnut.other', title: 'Parasitic, insectivorous and saprophytic plants', prereqs: ['ts7.sc.plantnut.photo'],
      intro: [
        h('Plants that don\'t play by the rules'),
        photo('🌿', 'Most plants are green and make food — but some plants and fungi get food in other ways.'),
        stepsB(
          'Parasitic plants — Cuscuta (dodder, amarbel) is a yellow, leafless, thread-like climber. It has no chlorophyll. It winds around a host plant and sends special roots (haustoria) into it to suck food and water. The host weakens.',
          'Partial parasites — mistletoe (and Loranthus on mango trees) is green and makes some food but takes water and minerals from the host tree.',
          'Insectivorous plants — pitcher plant, Venus flytrap and sundew grow in soil poor in nitrogen. They trap and digest insects to get extra nitrogen, though they can also photosynthesise.',
          'Saprotrophs — fungi like mushrooms and bread mould absorb food from dead and decaying matter. (Fungi are not true plants, but they were once grouped with them.)',
          'Symbiosis — in a lichen, an alga makes food and a fungus gives shelter, water and minerals. Both gain.',
        ),
        def('Parasite', 'An organism that lives on or in another organism (the host) and takes food from it, harming it.'),
        keys('Cuscuta: total parasite, no chlorophyll.', 'Pitcher plant: traps insects for nitrogen.', 'Mushrooms: saprotrophs on dead matter.', 'Lichen: alga + fungus helping each other.'),
        remember('Saprotrophs and decomposers clean up dead matter and return nutrients to the soil.'),
      ],
      examples: [
        ex('Cuscuta has yellow stems and no leaves. How does it get food?', ['No chlorophyll → it cannot photosynthesise.', 'It sends haustoria into a host plant and absorbs ready-made food.'], 'By taking food from the host plant — it is a parasite'),
        ex('Why do insectivorous plants trap insects even though they are green?', ['They grow in soils poor in nitrogen.', 'Insects are a source of nitrogen.'], 'To get nitrogen missing from their soil'),
      ],
      practice: [
        matchT('match-mode', 'organism to its way of getting food', [
          ['Cuscuta (dodder)', 'Parasite — sucks food from a host'], ['Pitcher plant', 'Traps and digests insects'], ['Mushroom', 'Saprotroph — absorbs food from dead matter'], ['Lichen', 'Symbiosis of alga and fungus'], ['Mango tree', 'Autotroph — makes its own food'],
        ], ['Only one is a normal green plant.', 'Saprotrophs feed on dead matter.']),
        mcq('modes', 'How does each organism get its food?', [
          ['A plant that lives on another plant and takes food from it is a…', 'Parasite', ['Saprotroph', 'Autotroph', 'Host'], 'It harms the other plant.', 'Parasites take food from a living host.'],
          ['The plant on which Cuscuta grows is called the…', 'Host', ['Parasite', 'Saprotroph', 'Symbiont'], 'It hosts the visitor.', 'The plant giving food is the host.'],
          ['Insectivorous plants usually grow in soil lacking…', 'Nitrogen', ['Water', 'Sunlight', 'Oxygen'], 'Insects are rich in protein.', 'They get nitrogen from insect bodies.'],
          ['Bread mould and mushrooms are…', 'Saprotrophs', ['Autotrophs', 'Insectivorous plants', 'Parasites on animals'], 'They grow on dead material.', 'Saprotrophs absorb nutrients from dead, decaying matter.'],
          ['In a lichen, the alga provides…', 'Food made by photosynthesis', ['Shelter only', 'Nitrogen from insects', 'Nothing'], 'The alga is green.', 'The alga photosynthesises; the fungus gives water, minerals and shelter.'],
          ['Cuscuta is yellow because it lacks…', 'Chlorophyll', ['Water', 'Roots for sucking', 'Flowers'], 'The green pigment.', 'Without chlorophyll it cannot make food.'],
        ]),
        tapT('tap-hetero', 'Tap every organism that CANNOT make all of its own food.', [
          ['Cuscuta', true], ['Mushroom', true], ['Bread mould', true], ['Pitcher plant (needs insects for nitrogen)', true],
          ['Spinach', false], ['Paddy', false], ['Coconut palm', false],
        ], ['Green plants with normal roots make their own food.', 'Insectivorous plants need extra nitrogen from insects.'], 'Parasites, fungi and insectivorous plants depend on other sources for part or all of their food.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Respiration in Organisms
// =====================================================================================
const ch11: USpec = {
  id: 'ts7.sc.ch11', subject: 'biology', title: 'Respiration in Organisms', source: src(11),
  objectives: [
    {
      id: 'ts7.sc.resp.humans', title: 'Breathing and respiration in humans', prereqs: [],
      intro: [
        h('Why do you breathe faster after running?'),
        photo('💨', 'We breathe in air rich in oxygen and breathe out air with more carbon dioxide.'),
        p('Food gives energy only when it is broken down inside our cells. This breakdown of food to release energy is respiration. Breathing is just the taking in of air and giving out of air — it supplies oxygen for respiration and removes carbon dioxide.'),
        f('glucose + oxygen → carbon dioxide + water + energy', 'glucose plus oxygen gives carbon dioxide, water and energy'),
        def('Aerobic respiration', 'Breakdown of glucose using oxygen, releasing a lot of energy.'),
        def('Anaerobic respiration', 'Breakdown of glucose without oxygen, releasing less energy. In our muscles during hard exercise it makes lactic acid (causing cramps); in yeast it makes alcohol and carbon dioxide (used in baking and to make dough rise).'),
        h('The path of air'),
        stepsB('Nostrils → nasal cavity (hairs and mucus trap dust)', 'Windpipe (trachea)', 'Bronchi (two branches)', 'Lungs — tiny air sacs (alveoli) where oxygen passes into blood and carbon dioxide comes out'),
        p('Breathing in (inhalation): the diaphragm moves down and the ribs move up and out — the chest cavity becomes bigger and air rushes in. Breathing out (exhalation): the diaphragm moves up and the ribs move down and in — air is pushed out. An adult at rest breathes about 15–18 times a minute; after exercise the rate goes up.'),
        keys('Breathing ≠ respiration: breathing moves air; respiration releases energy in cells.', 'Aerobic: with oxygen, more energy. Anaerobic: without oxygen, less energy.', 'Inhale: diaphragm down, ribs up/out. Exhale: the reverse.', 'Lime water turns milky with the CO₂ in exhaled air.'),
        remember('Muscle cramps after a hard race are due to lactic acid from anaerobic respiration; a hot water massage helps.'),
      ],
      examples: [
        ex('Imran counts 72 breaths in 4 minutes. What is his breathing rate?', ['Breathing rate = breaths ÷ minutes', '= 72 ÷ 4 = 18'], '18 breaths per minute'),
        ex('Why does dough with yeast rise when kept in a warm place?', ['Yeast respires anaerobically, breaking down sugar.', 'This produces carbon dioxide gas.', 'Gas bubbles make the dough rise.'], 'CO₂ from anaerobic respiration by yeast makes it rise'),
      ],
      practice: [
        tp('rate', (r) => {
          const rate = r.pick([14, 15, 16, 17, 18, 20, 24, 30]);
          const m = r.pick([2, 3, 4, 5]);
          const n = who(r);
          return numQ(`${n} counts ${rate * m} breaths in ${m} minutes. What is the breathing rate per minute?`, rate, undefined,
            ['Breathing rate = number of breaths ÷ number of minutes.', `Divide ${rate * m} by ${m}.`],
            [`Rate = ${rate * m} ÷ ${m} = ${rate} breaths per minute`]);
        }),
        orderT('path', 'Put the path of air into the body in order.', ['Nostrils', 'Nasal cavity', 'Windpipe (trachea)', 'Bronchi', 'Air sacs (alveoli) in the lungs'], ['Air enters through the nose.', 'The air sacs are the very end.'], 'Air goes nose → nasal cavity → trachea → bronchi → alveoli.'),
        mcq('resp', 'Breathing moves air; respiration releases energy.', [
          ['During inhalation the diaphragm…', 'Moves down and the chest expands', ['Moves up', 'Stays still', 'Pushes air out'], 'More space pulls air in.', 'The diaphragm flattens downward, enlarging the chest.'],
          ['Exhaled air turns lime water milky because it contains more…', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Water'], 'It is the waste gas.', 'CO₂ reacts with lime water to make it milky.'],
          ['Anaerobic respiration in muscles produces…', 'Lactic acid', ['Alcohol', 'Oxygen', 'Starch'], 'It causes cramps.', 'Without enough oxygen, muscles make lactic acid.'],
          ['Yeast respiring without oxygen produces…', 'Alcohol and carbon dioxide', ['Lactic acid only', 'Oxygen and water', 'Starch'], 'Used in baking.', 'Yeast ferments sugar into alcohol and CO₂.'],
          ['Which releases MORE energy from the same glucose?', 'Aerobic respiration', ['Anaerobic respiration', 'Both equal', 'Neither releases energy'], 'Oxygen helps break glucose completely.', 'Complete breakdown with oxygen releases much more energy.'],
          ['Respiration takes place in…', 'Every living cell', ['Only the lungs', 'Only the nose', 'Only the heart'], 'Every cell needs energy.', 'Breathing happens in lungs; respiration happens in all cells.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.resp.animals', title: 'Breathing in other animals', prereqs: ['ts7.sc.resp.humans'],
      intro: [
        h('Not everyone has lungs'),
        photo('🐟', 'Fish take oxygen dissolved in water through their gills.'),
        stepsB(
          'Earthworm — breathes through its moist skin. Gases pass through the slimy skin directly. That is why it comes out when soil is waterlogged after heavy rain.',
          'Insects (cockroach, grasshopper) — small holes called spiracles on the sides of the body lead into air tubes (tracheae) that carry air to all parts.',
          'Fish — gills on the sides of the head take oxygen dissolved in water.',
          'Frog — breathes with lungs on land and through its moist skin in water.',
          'Birds, cows, cats, snakes — lungs, like us.',
          'Whales and dolphins — live in water but have lungs; they come up to breathe air through a blowhole.',
        ),
        keys('Earthworm: moist skin.', 'Insects: spiracles and tracheae.', 'Fish: gills.', 'Frog: lungs and skin.', 'Whale and dolphin: lungs (blowhole).'),
        remember('The breathing organ always has a thin, moist surface with lots of blood vessels, so gases can pass easily.'),
      ],
      examples: [
        ex('Why do earthworms come out of the soil after heavy rain?', ['Earthworms breathe through their skin using air in the soil.', 'When the soil is waterlogged, the air spaces fill with water.', 'They come up to get air.'], 'The soil air spaces fill with water, so they cannot breathe'),
        ex('A dolphin lives in the sea. Does it have gills?', ['A dolphin is a mammal.', 'It surfaces regularly to breathe through its blowhole.'], 'No — it breathes air with lungs'),
      ],
      practice: [
        matchT('match-organ', 'animal to its breathing organ', [
          ['Earthworm', 'Moist skin'], ['Cockroach', 'Spiracles and tracheae'], ['Fish', 'Gills'], ['Frog', 'Lungs and moist skin'], ['Dolphin', 'Lungs (through a blowhole)'], ['Cow', 'Lungs'],
        ], ['Insects breathe through holes along the body.', 'Not every water animal has gills.']),
        mcq('animal', 'Match the animal to the way it gets air.', [
          ['Spiracles are breathing holes found in…', 'Insects', ['Fish', 'Earthworms', 'Birds'], 'Think of a cockroach.', 'Insects have spiracles leading into tracheae.'],
          ['Fish use their gills to take in…', 'Oxygen dissolved in water', ['Air from above the water', 'Carbon dioxide', 'Food'], 'Water contains dissolved gases.', 'Gills absorb oxygen dissolved in water.'],
          ['A frog in water breathes mainly through its…', 'Moist skin', ['Gills', 'Spiracles', 'Ears'], 'Adult frogs do not have gills.', 'Gases pass through its thin, moist skin.'],
          ['A whale must come to the surface because…', 'It breathes air with lungs', ['It has gills that need air', 'It needs sunlight', 'It is too heavy'], 'Whales are mammals.', 'Whales breathe air through a blowhole.'],
          ['An earthworm\'s skin must stay moist because…', 'Gases dissolve and pass through moist skin', ['It needs to slide', 'It drinks through skin', 'It is always in water'], 'Dry skin blocks gas exchange.', 'Gas exchange needs a moist surface.'],
        ]),
        tapT('tap-lungs', 'Tap every animal that breathes with LUNGS.', [
          ['Human', true], ['Crow', true], ['Cow', true], ['Snake', true], ['Dolphin', true], ['Frog (on land)', true],
          ['Fish', false], ['Earthworm', false], ['Cockroach', false],
        ], ['Mammals, birds and reptiles have lungs.', 'Fish, earthworms and insects do not.'], 'Mammals (including dolphins), birds, reptiles and adult frogs have lungs.'),
      ],
    },
    {
      id: 'ts7.sc.resp.plants', title: 'Respiration in plants', prereqs: ['ts7.sc.resp.humans'],
      intro: [
        h('Plants respire too — day and night'),
        photo('🌳', 'Every living cell of a tree — in leaves, stem and roots — respires all the time.'),
        p('Plants also break down glucose to get energy. They take in oxygen and give out carbon dioxide, day and night. In daylight photosynthesis is much faster, so overall the plant gives out more oxygen than it uses; at night only respiration happens.'),
        stepsB(
          'Leaves exchange gases through stomata.',
          'Stems of woody plants have tiny openings called lenticels.',
          'Roots take oxygen from air in the spaces between soil particles. Over-watering fills these spaces and roots can die.',
          'Mangrove trees in swampy soil grow special breathing roots (pneumatophores) that stick up above the mud.',
          'Germinating seeds respire rapidly — they give out carbon dioxide and heat.',
        ),
        def('Respiration vs photosynthesis', 'Photosynthesis uses CO₂ and gives O₂ (only in light, only in green parts); respiration uses O₂ and gives CO₂ (always, in all living cells).'),
        keys('Plants respire 24 hours a day.', 'Gas exchange: stomata (leaves), lenticels (stems), soil air (roots).', 'Over-watering suffocates roots.', 'Germinating seeds release CO₂ and heat.'),
        remember('Photosynthesis makes food; respiration uses food to release energy.'),
      ],
      examples: [
        ex('Why should pot plants not be over-watered?', ['Roots respire using oxygen in soil air spaces.', 'Too much water fills these spaces.', 'Roots get no oxygen and may rot.'], 'Roots cannot get oxygen in waterlogged soil'),
        ex('Germinating moong seeds in a closed flask make lime water milky. What does this show?', ['Lime water turns milky with carbon dioxide.', 'The seeds are respiring.'], 'Germinating seeds respire and release CO₂'),
      ],
      practice: [
        mcq('plant', 'All living cells respire.', [
          ['Plants respire…', 'All the time, day and night', ['Only during the day', 'Only at night', 'Never'], 'Living cells always need energy.', 'Respiration is continuous in all living cells.'],
          ['Woody stems exchange gases through…', 'Lenticels', ['Stomata only', 'Gills', 'Spiracles'], 'Tiny openings in the bark.', 'Lenticels let air into woody stems.'],
          ['Roots get oxygen from…', 'Air spaces between soil particles', ['Leaves only', 'Rainwater', 'Sunlight'], 'Soil has tiny gaps.', 'Air in soil pores supplies roots.'],
          ['Mangroves growing in swamps have…', 'Breathing roots that grow upward above the mud', ['Gills', 'No roots', 'Spiracles'], 'Swampy mud has little air.', 'Pneumatophores take in air above the waterlogged mud.'],
          ['Which process happens ONLY in light?', 'Photosynthesis', ['Respiration', 'Both', 'Neither'], 'It needs sunlight energy.', 'Photosynthesis needs light; respiration does not.'],
          ['A heap of germinating seeds becomes warm because…', 'Respiration releases heat energy', ['The Sun heats them', 'They photosynthesise', 'Water is hot'], 'Energy is released in respiration.', 'Rapid respiration in seeds gives out heat.'],
        ]),
        matchT('compare', 'feature to the process', [
          ['Uses oxygen, gives carbon dioxide', 'Respiration'], ['Uses carbon dioxide, gives oxygen', 'Photosynthesis'], ['Happens only in light', 'Photosynthesis'], ['Happens in all living cells', 'Respiration'], ['Makes food (glucose)', 'Photosynthesis'], ['Releases energy from food', 'Respiration'],
        ], ['Photosynthesis builds food; respiration breaks it down.', 'Respiration never stops.'], 2),
        tapT('tap-plants', 'Tap every statement that is TRUE.', [
          ['Leaves exchange gases through stomata', true], ['Roots need oxygen from soil air', true], ['Plants respire at night', true], ['Germinating seeds give out carbon dioxide', true],
          ['Plants do not respire at all', false], ['Only animals need oxygen', false], ['Respiration happens only in leaves', false],
        ], ['All living plant cells respire.', 'Watch for "only" and "not at all".'], 'Plants respire in all cells, day and night, through stomata, lenticels and roots.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Reproduction in Plants
// =====================================================================================
const ch12: USpec = {
  id: 'ts7.sc.ch12', subject: 'biology', title: 'Reproduction in Plants', source: src(12),
  objectives: [
    {
      id: 'ts7.sc.repro.flower', title: 'Parts of a flower; unisexual and bisexual flowers', prereqs: [],
      intro: [
        h('A flower is a reproductive organ'),
        photo('🌸', 'A hibiscus (mandara) flower has both male and female parts.'),
        p('Flowers are not just for decoration — they are where seeds are made. Look at a hibiscus or datura flower from outside to inside:'),
        stepsB(
          'Sepals (green, outermost) — together called the calyx; they protect the bud.',
          'Petals (coloured) — together called the corolla; they attract insects.',
          'Stamens — the MALE parts. Each has a stalk (filament) and an anther, which makes pollen grains.',
          'Pistil (carpel) — the FEMALE part in the centre: a sticky stigma at the top, a tube-like style and a swollen ovary at the bottom containing ovules. Each ovule has an egg cell.',
        ),
        def('Bisexual flower', 'A flower with both stamens and pistil, e.g. hibiscus, mustard, rose, datura.'),
        def('Unisexual flower', 'A flower with either stamens (male flower) or pistil (female flower), e.g. bottle gourd, cucumber, maize, papaya.'),
        keys('Calyx (sepals) → protection; corolla (petals) → attraction.', 'Stamen = anther + filament (male), makes pollen.', 'Pistil = stigma + style + ovary (female), contains ovules.', 'Bisexual: both parts. Unisexual: only one.'),
        remember('In papaya, male flowers and female flowers usually grow on different plants — only plants with female flowers bear fruit.'),
      ],
      examples: [
        ex('A bottle gourd plant has some flowers with only stamens and others with only a pistil. What type are they?', ['Each flower has only one kind of sex organ.'], 'Unisexual flowers'),
        ex('Name the parts of the pistil from top to bottom.', ['The sticky top catches pollen — stigma.', 'The tube below — style.', 'The swollen base with ovules — ovary.'], 'Stigma, style, ovary'),
      ],
      practice: [
        matchT('match-part', 'flower part to its job', [
          ['Sepals', 'Protect the bud'], ['Petals', 'Attract insects'], ['Anther', 'Makes pollen grains'], ['Stigma', 'Sticky surface that receives pollen'], ['Ovary', 'Contains ovules; becomes the fruit'], ['Filament', 'Stalk that holds the anther'],
        ], ['Anther and filament make the stamen.', 'Stigma, style and ovary make the pistil.']),
        mcq('flower', 'Male = stamen; female = pistil.', [
          ['The male part of a flower is the…', 'Stamen', ['Pistil', 'Sepal', 'Petal'], 'It makes pollen.', 'The stamen (anther + filament) is male.'],
          ['Ovules are found in the…', 'Ovary', ['Anther', 'Stigma', 'Petal'], 'The swollen base of the pistil.', 'The ovary contains ovules.'],
          ['A flower with both stamens and pistil is…', 'Bisexual', ['Unisexual', 'Male only', 'Female only'], 'Bi = two.', 'Bisexual flowers have both reproductive parts.'],
          ['Which plant has unisexual flowers?', 'Bottle gourd', ['Hibiscus', 'Mustard', 'Rose'], 'Look for separate male and female flowers.', 'Gourds have separate male and female flowers.'],
          ['All the sepals together are called the…', 'Calyx', ['Corolla', 'Pistil', 'Ovary'], 'Corolla is for petals.', 'Sepals form the calyx.'],
        ]),
        orderT('order-parts', 'Order the parts of a bisexual flower from OUTSIDE to INSIDE.', ['Sepals', 'Petals', 'Stamens', 'Pistil'], ['Green parts are outermost.', 'The female part is at the very centre.'], 'Sepals → petals → stamens → pistil (centre).'),
      ],
    },
    {
      id: 'ts7.sc.repro.pollination', title: 'Pollination, fertilisation and fruit formation', prereqs: ['ts7.sc.repro.flower'],
      intro: [
        h('How a flower becomes a fruit'),
        photo('🦋', 'Butterflies and bees carry pollen from flower to flower while drinking nectar.'),
        p('For seeds to form, pollen grains must reach the stigma. The transfer of pollen from the anther to the stigma is pollination.'),
        stepsB(
          'Self-pollination: pollen lands on the stigma of the same flower or another flower of the same plant.',
          'Cross-pollination: pollen reaches a flower of a different plant of the same kind.',
          'Agents: insects (bees, butterflies — attracted by colour, scent and nectar), wind (maize, grasses, paddy — light, dry pollen), water (some water plants) and birds (sunbirds on drumstick and coral tree flowers).',
        ),
        def('Fertilisation', 'The fusion of the male cell (from pollen) with the egg cell (in the ovule) to form a zygote.'),
        p('After landing on the stigma, a pollen grain grows a tube down the style to the ovule. The male cell travels down and fuses with the egg — fertilisation. The zygote grows into an embryo. Then: the ovule becomes the seed, the ovary becomes the fruit, and the petals, sepals and stamens usually dry and fall off.'),
        keys('Pollination = pollen transfer from anther to stigma.', 'Self vs cross pollination.', 'Agents: insects, wind, water, birds.', 'Ovule → seed; ovary → fruit; zygote → embryo.'),
        remember('Bees are vital for farmers: many crops like sunflower and mango give much less fruit without insect pollinators.'),
      ],
      examples: [
        ex('Maize flowers are small, dull and without scent, but make huge amounts of light pollen. Which agent pollinates them?', ['Insects are attracted by colour and scent — maize has none.', 'Light, plentiful pollen is carried by wind.'], 'Wind'),
        ex('Which part of a mango flower becomes the mango fruit, and which becomes the seed (stone)?', ['After fertilisation the ovary grows into the fruit.', 'The ovule inside becomes the seed.'], 'Ovary → fruit; ovule → seed'),
      ],
      practice: [
        orderT('order-fruit', 'Put the steps from flower to fruit in order.', ['Pollen forms in the anther', 'Pollen reaches the stigma (pollination)', 'Pollen tube grows down the style to the ovule', 'Male cell fuses with egg (fertilisation)', 'Ovule becomes seed and ovary becomes fruit'], ['Pollination comes before fertilisation.', 'Fruit forms last.'], 'Pollen → pollination → pollen tube → fertilisation → seed and fruit.', 2),
        matchT('match-becomes', 'flower part to what it becomes after fertilisation', [
          ['Ovary', 'Fruit'], ['Ovule', 'Seed'], ['Zygote', 'Embryo'], ['Petals', 'Dry and fall off'],
        ], ['The fruit holds the seeds.', 'The embryo is the baby plant inside the seed.'], 4),
        mcq('poll', 'Pollination first, then fertilisation.', [
          ['Transfer of pollen from anther to stigma is…', 'Pollination', ['Fertilisation', 'Germination', 'Dispersal'], 'Pollen + -ation.', 'Pollination is the transfer of pollen.'],
          ['Fusion of the male cell with the egg is…', 'Fertilisation', ['Pollination', 'Respiration', 'Germination'], 'It forms a zygote.', 'Fertilisation forms the zygote.'],
          ['Pollen landing on the stigma of a flower on a DIFFERENT plant of the same kind is…', 'Cross-pollination', ['Self-pollination', 'Fertilisation', 'Vegetative propagation'], 'Pollen crossed between plants.', 'Cross-pollination involves two plants.'],
          ['Brightly coloured, scented flowers with nectar are usually pollinated by…', 'Insects', ['Wind', 'Water', 'Nobody'], 'Who is attracted by colour and smell?', 'Colour, scent and nectar attract insects.'],
          ['After fertilisation, the ovary develops into the…', 'Fruit', ['Seed', 'Petal', 'Root'], 'It surrounds the seeds.', 'The ovary wall becomes the fruit.'],
          ['Wind-pollinated flowers usually have…', 'Light, dry pollen in large amounts', ['Bright petals and nectar', 'Strong scent', 'Very few pollen grains'], 'Most of the pollen gets lost in the air.', 'Plenty of light pollen improves the chance of reaching a stigma.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.repro.asexual', title: 'Asexual reproduction: vegetative propagation, budding, spores', prereqs: ['ts7.sc.repro.flower'],
      intro: [
        h('New plants without seeds'),
        photo('🥔', 'Each "eye" on a potato can sprout into a new plant.'),
        p('Some plants can produce new plants without seeds — from roots, stems or leaves, or from single cells. This is asexual reproduction. The new plants are exact copies of the parent.'),
        stepsB(
          'Stem cuttings: rose, hibiscus, sugarcane, money plant — a piece of stem with a node grows roots.',
          'Stem tubers: potato — "eyes" (buds) sprout into new plants.',
          'Rhizomes: ginger and turmeric — underground stems with buds.',
          'Bulbs: onion and garlic.',
          'Leaf buds: Bryophyllum — tiny plants grow from buds on the leaf edges.',
          'Roots: sweet potato and dahlia.',
          'Budding: yeast — a small bud grows out and separates.',
          'Fragmentation: Spirogyra (pond alga) — breaks into pieces, each grows into a new alga.',
          'Spore formation: bread mould, mushrooms, ferns and mosses release tiny spores with tough coats that survive bad conditions and grow when they land on a moist place.',
        ),
        def('Vegetative propagation', 'Growing new plants from vegetative parts (root, stem, leaf) instead of seeds.'),
        keys('Asexual: one parent, no seeds, identical offspring.', 'Vegetative: cuttings, tubers, rhizomes, bulbs, leaf buds.', 'Budding (yeast), fragmentation (Spirogyra), spores (mould, ferns).', 'Advantages: faster, and good varieties are copied exactly.'),
        remember('Sugarcane is planted using stem pieces with nodes (setts), not seeds.'),
      ],
      examples: [
        ex('How is ginger usually grown on farms?', ['Ginger is an underground stem (rhizome) with buds.', 'Pieces of rhizome are planted.'], 'From rhizome pieces — vegetative propagation'),
        ex('Why does bread kept in a moist, warm place get mouldy?', ['Spores of bread mould are present in the air.', 'They land on bread and grow in warm, moist conditions.'], 'Air-borne spores of bread mould germinate on it'),
      ],
      practice: [
        matchT('match-veg', 'plant to how it is usually propagated', [
          ['Potato', 'Stem tuber "eyes"'], ['Ginger', 'Rhizome'], ['Onion', 'Bulb'], ['Bryophyllum', 'Buds on leaf edges'], ['Rose', 'Stem cutting'], ['Sugarcane', 'Stem pieces with nodes'],
        ], ['Potato and ginger are both underground stems, of different kinds.', 'Bryophyllum is famous for leaf buds.']),
        matchT('match-asex', 'organism to its method of asexual reproduction', [
          ['Yeast', 'Budding'], ['Spirogyra', 'Fragmentation'], ['Bread mould', 'Spore formation'], ['Potato', 'Vegetative propagation'],
        ], ['Yeast grows bumps; Spirogyra breaks.', 'Mould releases spores.'], 4),
        mcq('asex', 'Asexual = one parent, no seeds.', [
          ['In asexual reproduction, the new plants are…', 'Identical to the parent', ['Very different from the parent', 'Always weaker', 'Always seeds'], 'Only one parent is involved.', 'Offspring are exact copies.'],
          ['Spores can survive bad conditions because they…', 'Have a hard protective coat', ['Are very large', 'Contain water', 'Are made of glass'], 'Think of protection.', 'A tough coat protects spores from heat and dryness.'],
          ['Yeast reproduces mainly by…', 'Budding', ['Seeds', 'Fragmentation', 'Cuttings'], 'A small bulge grows out.', 'A bud grows from the yeast cell and separates.'],
          ['Which is an ADVANTAGE of vegetative propagation?', 'Good qualities of the parent are kept exactly', ['It needs pollinators', 'It makes plants different', 'It always needs seeds'], 'Copies are identical.', 'Vegetative propagation preserves desired traits.'],
          ['Turmeric is grown from…', 'Rhizomes', ['Spores', 'Leaf buds', 'Seeds only'], 'Same as ginger.', 'Turmeric is an underground stem (rhizome).'],
          ['Ferns and mosses reproduce by…', 'Spores', ['Seeds', 'Bulbs', 'Tubers'], 'They have no flowers.', 'Ferns and mosses release spores.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 13 — Seed Dispersal
// =====================================================================================
const ch13: USpec = {
  id: 'ts7.sc.ch13', subject: 'biology', title: 'Seed Dispersal', source: src(13),
  objectives: [
    {
      id: 'ts7.sc.seed.why', title: 'Why seeds need to be dispersed', prereqs: [],
      intro: [
        h('What if every seed fell under its parent?'),
        photo('🌳', 'A big tree shades the ground below it — seedlings there get little light.'),
        p('A single neem or mango tree produces hundreds of seeds every year. If they all fell and grew right under the parent, the seedlings would be crowded together. They would compete with each other and with the parent tree for sunlight, water, minerals and space, and most would die.'),
        def('Seed dispersal', 'The scattering of seeds away from the parent plant to new places.'),
        stepsB(
          'Avoids overcrowding under the parent plant.',
          'Reduces competition for light, water, minerals and space.',
          'Lets the plant reach and grow in new places (new habitats).',
          'Lowers the chance that one disease or pest kills all the young plants together.',
        ),
        keys('Dispersal = carrying seeds away from the parent.', 'It prevents crowding and competition.', 'It spreads the plant to new areas.'),
        remember('Plants cannot walk, so they use wind, water, animals and even explosions to send their seeds travelling.'),
      ],
      examples: [
        ex('Seedlings growing in the deep shade under a banyan tree are thin and weak. Why?', ['The parent tree blocks most sunlight.', 'The seedlings also compete with the parent\'s roots for water and minerals.'], 'Too little light, water and minerals because of crowding — dispersal avoids this'),
        ex('Give two benefits of seed dispersal.', ['Seeds land far apart, so there is less competition.', 'The plant can colonise new places.'], 'Less competition; spread to new areas'),
      ],
      practice: [
        mcq('why', 'Think of crowding under the parent plant.', [
          ['The main reason for seed dispersal is to…', 'Avoid crowding and competition near the parent', ['Make seeds heavier', 'Stop seeds from growing', 'Feed the parent plant'], 'Imagine all seeds under one tree.', 'Spreading seeds reduces competition for light, water and minerals.'],
          ['Seedlings under a parent tree mostly lack…', 'Sunlight', ['Air', 'Gravity', 'Soil'], 'The big tree shades them.', 'The parent\'s canopy blocks sunlight.'],
          ['Dispersal helps plants to…', 'Grow in new places', ['Stay only in one place', 'Lose their leaves', 'Stop flowering'], 'Seeds travel.', 'Seeds carried away can colonise new areas.'],
          ['Which is NOT a benefit of seed dispersal?', 'More competition among seedlings', ['Less overcrowding', 'Reaching new habitats', 'Less competition for water'], 'Look for the bad one.', 'Dispersal reduces competition, it does not increase it.'],
          ['Seedlings compete with each other for…', 'Light, water, minerals and space', ['Only oxygen', 'Only seeds', 'Nothing'], 'What does a plant need to grow?', 'Growing plants need light, water, minerals and space.'],
        ]),
        tapT('tap-why', 'Tap every reason why seeds are dispersed.', [
          ['To avoid overcrowding', true], ['To reduce competition for light', true], ['To reduce competition for water and minerals', true], ['To reach new places to grow', true],
          ['To make the parent tree taller', false], ['To stop the seeds from growing', false], ['To make fruits sweeter', false],
        ], ['Dispersal helps the young plants survive.', 'It does nothing for the parent\'s height or the fruit\'s taste.'], 'Dispersal reduces crowding and competition and spreads the plant.'),
        orderT('order-life', 'Put the stages of a plant\'s seed journey in order.', ['Flower is pollinated', 'Fruit and seeds form', 'Seeds are dispersed away from the parent', 'Seed germinates in a new place', 'Seedling grows into a new plant'], ['Seeds form inside the fruit after pollination.', 'Germination happens after the seed lands.'], 'Pollination → seeds → dispersal → germination → new plant.'),
      ],
    },
    {
      id: 'ts7.sc.seed.agents', title: 'Agents of seed dispersal: wind, water, animals, explosion', prereqs: ['ts7.sc.seed.why'],
      intro: [
        h('How seeds travel'),
        photo('🌬️', 'Light, hairy or winged seeds are carried far by the wind.'),
        stepsB(
          'Wind — seeds are very light, have hairs (cotton, madar/jilledu, dandelion) or wings (drumstick, maple). They float or glide on the breeze.',
          'Water — fruits have a fibrous or spongy coat and can float: coconut (carried across seas), lotus.',
          'Animals — hooks and spines stick to fur and clothes (Xanthium, puncture vine, "love thorns" grass); fleshy, tasty fruits are eaten by birds and animals and the seeds pass out unharmed in their droppings (guava, banyan, peepal, tomato).',
          'Explosion — dry fruits burst open with a jerk and shoot out seeds: castor, balsam, ladies\' finger (bhindi), pea and bean pods.',
          'Humans — we carry seeds to farms and gardens across the world.',
        ),
        def('Agent of dispersal', 'Anything that carries seeds away from the parent plant: wind, water, animals, explosion or humans.'),
        keys('Wind: light, hairy or winged seeds.', 'Water: floating, fibrous fruits (coconut).', 'Animals: hooks/spines, or fleshy fruits eaten by animals.', 'Explosion: pods burst (castor, balsam, bhindi).'),
        remember('Banyan and peepal seedlings often grow on old walls and buildings — birds dropped the seeds there!'),
      ],
      examples: [
        ex('A coconut fruit has a thick, fibrous husk. Which agent disperses it and how?', ['The fibrous husk traps air and makes the fruit float.', 'It can drift in sea water for long distances.'], 'Water — it floats'),
        ex('After a walk through fields, Ravi finds small spiny seeds stuck to his socks. What kind of dispersal is this?', ['The seeds have hooks or spines.', 'They cling to animals (or people) and are carried away.'], 'Dispersal by animals (hooks/spines)'),
      ],
      practice: [
        matchT('match-agent', 'seed or fruit to its agent of dispersal', [
          ['Cotton (hairy seeds)', 'Wind'], ['Drumstick (winged seeds)', 'Wind'], ['Coconut', 'Water'], ['Xanthium (hooked fruit)', 'Animals'], ['Guava', 'Animals (eaten)'], ['Castor', 'Explosion'], ['Lotus', 'Water'], ['Balsam', 'Explosion'],
        ], ['Hairs and wings → wind; floating → water.', 'Hooks and tasty flesh → animals; bursting pods → explosion.']),
        tp('feature', (r) => {
          const bank: [string, string][] = [
            ['very light seeds with fine hairs', 'Wind'], ['flat seeds with papery wings', 'Wind'], ['a fibrous husk that floats', 'Water'], ['a spongy fruit that floats on ponds', 'Water'],
            ['hooks that cling to fur', 'Animals'], ['a sweet, juicy pulp eaten by birds', 'Animals'], ['dry pods that burst open with a jerk', 'Explosion'], ['a capsule that splits and flings seeds', 'Explosion'],
          ];
          const [feat, agent] = r.pick(bank);
          return {
            type: 'mcq', prompt: `A plant's fruit or seed has ${feat}. Which agent most likely disperses it?`,
            ...choose(r, agent, ['Wind', 'Water', 'Animals', 'Explosion'].filter((x) => x !== agent)),
            hints: ['Each feature suits one way of travelling.', 'Light/hairy/winged → wind; floating → water; hooks/tasty → animals; bursting → explosion.'],
            mistakes: [{ when: 'wrong', explain: `A seed with ${feat} is suited to ${agent.toLowerCase()} dispersal.` }],
            solution: [`${feat[0].toUpperCase() + feat.slice(1)} → ${agent}.`],
          };
        }),
        mcq('agents', 'Look at the seed\'s special feature.', [
          ['Madar (jilledu) seeds have silky hairs. They are dispersed by…', 'Wind', ['Water', 'Explosion', 'Fish'], 'Hairs act like parachutes.', 'Silky hairs help the seeds float in air.'],
          ['Ladies\' finger (bhindi) pods dry and split, flinging seeds. This is dispersal by…', 'Explosion', ['Wind', 'Water', 'Animals'], 'The pod bursts.', 'Bursting pods shoot seeds out.'],
          ['Birds eating ripe banyan figs help disperse seeds because…', 'Seeds pass out unharmed in their droppings far away', ['Birds plant the seeds with their beaks', 'Seeds stick to feathers only', 'Birds destroy all seeds'], 'Seeds survive digestion.', 'Hard seed coats survive and are dropped in new places.'],
          ['Why can a coconut float?', 'Its fibrous husk is light and traps air', ['It is hollow and empty', 'It has wings', 'It is filled with gas'], 'Think of the coir husk.', 'The fibrous husk makes it buoyant.'],
          ['Drumstick (munaga) seeds have…', 'Papery wings', ['Hooks', 'Juicy pulp', 'A fibrous husk'], 'They glide in the wind.', 'Winged seeds are carried by wind.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.seed.fruits', title: 'Seeds in fruits: from ovary to seed', prereqs: ['ts7.sc.seed.agents'],
      intro: [
        h('Open up a fruit'),
        photo('🍉', 'A watermelon has many seeds; a mango has just one.'),
        p('A fruit is the ripened ovary of a flower, and the seeds inside are the ripened ovules. So the number of seeds in a fruit depends on the number of ovules that were fertilised. A mango has one seed; a guava, papaya, watermelon or tomato has many; a pea pod has a row of several.'),
        stepsB(
          'Fleshy fruits — soft, juicy wall: mango, guava, tomato, papaya, grapes. Often eaten by animals.',
          'Dry fruits — hard, dry wall: groundnut, pea pod, castor, cotton, mustard, paddy grain. Often dispersed by wind or explosion.',
          'Parts of a seed — a seed coat that protects; one or two cotyledons (seed leaves) that store food; and the embryo, the baby plant.',
          'Some fruits are seedless (cultivated banana, some grapes) — they are grown by vegetative propagation.',
        ),
        def('Fruit', 'The ripened ovary of a flower, which contains and protects the seeds.'),
        keys('Ovary → fruit; ovule → seed.', 'Fleshy vs dry fruits.', 'Seed = seed coat + cotyledon(s) + embryo.', 'Some cultivated fruits are seedless.'),
        remember('In botany, tomato, brinjal, ladies\' finger and cucumber are all fruits, because they develop from the ovary and contain seeds.'),
      ],
      examples: [
        ex('Why does a pea pod contain many seeds but a mango only one?', ['Each seed develops from one ovule.', 'A pea ovary has many ovules; a mango ovary has one.'], 'Number of seeds = number of fertilised ovules'),
        ex('Is a brinjal a fruit or a vegetable, scientifically?', ['It develops from the ovary of the flower.', 'It contains seeds.'], 'A fruit (botanically)'),
      ],
      practice: [
        mcq('fruit', 'Ovary → fruit; ovule → seed.', [
          ['A fruit develops from the…', 'Ovary', ['Ovule', 'Anther', 'Petal'], 'It surrounds the seeds.', 'The ripened ovary becomes the fruit.'],
          ['A seed develops from the…', 'Ovule', ['Ovary', 'Stigma', 'Sepal'], 'It was inside the ovary.', 'Each fertilised ovule becomes a seed.'],
          ['The part of a seed that stores food is the…', 'Cotyledon', ['Seed coat', 'Stigma', 'Anther'], 'Seed leaves.', 'Cotyledons store food for the growing embryo.'],
          ['Which fruit has only ONE seed?', 'Mango', ['Guava', 'Papaya', 'Watermelon'], 'Think of the big stone.', 'A mango has a single large seed.'],
          ['Botanically, which of these is a fruit?', 'Tomato', ['Potato', 'Carrot', 'Onion'], 'Does it come from a flower and contain seeds?', 'Tomato develops from the ovary and has seeds.'],
          ['The baby plant inside a seed is the…', 'Embryo', ['Cotyledon', 'Seed coat', 'Ovary'], 'It grows into the new plant.', 'The embryo becomes the seedling.'],
        ]),
        tp('fleshy', (r) => {
          const bank: [string, boolean][] = [['Mango', true], ['Guava', true], ['Tomato', true], ['Papaya', true], ['Grapes', true], ['Groundnut', false], ['Pea pod', false], ['Castor', false], ['Mustard pod', false], ['Paddy grain', false]];
          const [fr, fl] = r.pick(bank);
          return {
            type: 'mcq', prompt: `Is ${fr.toLowerCase()} a fleshy fruit or a dry fruit?`, ...choose(r, fl ? 'Fleshy fruit' : 'Dry fruit', [fl ? 'Dry fruit' : 'Fleshy fruit']),
            hints: ['Is the wall soft and juicy, or hard and dry when ripe?', 'Fleshy fruits are often eaten by animals.'],
            mistakes: [{ when: 'wrong', explain: fl ? `${fr} has a soft, juicy wall — fleshy.` : `${fr} has a hard, dry wall when ripe — dry.` }],
            solution: [`${fr}: ${fl ? 'fleshy fruit' : 'dry fruit'}.`],
          };
        }),
        matchT('match-seed', 'part to its job', [
          ['Seed coat', 'Protects the seed'], ['Cotyledon', 'Stores food'], ['Embryo', 'Grows into the new plant'], ['Fruit wall', 'Protects seeds and helps dispersal'],
        ], ['The coat is on the outside.', 'The embryo is the baby plant.'], 4),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 14 — Water - Too Little to Waste
// =====================================================================================
const ch14: USpec = {
  id: 'ts7.sc.ch14', subject: 'chemistry', title: 'Water - Too Little to Waste', source: src(14),
  objectives: [
    {
      id: 'ts7.sc.water.sources', title: 'Sources of water on Earth; groundwater', prereqs: [],
      intro: [
        h('So much water, so little to drink'),
        photo('💧', 'Every drop of fresh water is precious — very little of Earth\'s water is fit to drink.'),
        p('About 71% of the Earth\'s surface is covered with water, yet most of it cannot be drunk. About 97% of all water is salty sea water. Of the remaining ~3% fresh water, about two-thirds is frozen in ice caps and glaciers. Less than 1% of all the water on Earth is fresh water we can easily use — in rivers, lakes, ponds and underground.'),
        p('Water exists as solid (ice, snow), liquid (seas, rivers) and gas (water vapour). The water cycle — evaporation, condensation, precipitation — keeps it moving between them.'),
        def('Groundwater', 'Water stored below the ground in the spaces between soil particles and rocks.'),
        def('Water table', 'The upper level of groundwater below the surface. Wells and borewells must reach below it.'),
        p('Rainwater soaks (infiltrates) into the ground and recharges groundwater. Layers of rock that hold groundwater are aquifers. When too many borewells pump out water faster than rain can replace it, the water table falls. Telangana\'s Mission Kakatiya restored thousands of old village tanks so that more rainwater is stored and groundwater is recharged; the Godavari and Krishna are the state\'s main rivers.'),
        f('usable fresh water ≈ 1 out of every 100 parts of Earth\'s water (less than 1%)', 'less than one percent of earth\'s water is usable fresh water'),
        keys('97% of Earth\'s water is salty; about 3% fresh.', 'Most fresh water is ice; under 1% is easily usable.', 'Groundwater is recharged by infiltration of rain.', 'Over-pumping lowers the water table.'),
        remember('Telangana has few natural lakes; its traditional tanks (cheruvulu) built by the Kakatiyas store rainwater.'),
      ],
      examples: [
        ex('If all Earth\'s water were 100 litres, about how much would be fresh water? About how much would be easily usable?', ['Fresh water ≈ 3% of 100 L = 3 L.', 'Usable is less than 1% — under 1 L, about a cup or two.'], 'About 3 L fresh; under 1 L usable'),
        ex('Why does the water table fall in summer in many Telangana villages?', ['Little rain → little recharge.', 'More water is pumped for crops and homes.', 'Removal is faster than recharge.'], 'Pumping exceeds recharge'),
      ],
      practice: [
        tp('share', (r) => {
          const total = r.pick([100, 200, 500, 1000, 2000]);
          const ask = r.pick(['salty', 'fresh'] as const);
          const pct = ask === 'salty' ? 97 : 3;
          return numQ(`Imagine all Earth's water as ${total} litres in a tank. About 97% is salty and 3% is fresh. How many litres would be ${ask}?`, total * pct / 100, 'L',
            [`Find ${pct}% of ${total}.`, `${pct}% means ${pct} out of every 100.`],
            [`${pct}% of ${total} = ${pct} × ${total} ÷ 100 = ${total * pct / 100} L`]);
        }),
        mcq('src', 'Most water is salty; most fresh water is frozen.', [
          ['About what percentage of Earth\'s water is salty sea water?', '97%', ['50%', '3%', '10%'], 'Nearly all of it.', 'Oceans hold about 97% of all water.'],
          ['Most of Earth\'s fresh water is found as…', 'Ice in ice caps and glaciers', ['Rivers', 'Lakes', 'Clouds'], 'It is frozen.', 'About two-thirds of fresh water is ice.'],
          ['The upper level of groundwater is called the…', 'Water table', ['Aquifer', 'Water cycle', 'Sea level'], 'Wells must reach below it.', 'The water table is the top of the saturated layer.'],
          ['Groundwater is replenished mainly by…', 'Rainwater seeping into the ground', ['Borewells', 'Evaporation', 'Factories'], 'Infiltration.', 'Rain soaking into soil recharges groundwater.'],
          ['Mission Kakatiya in Telangana aims to…', 'Restore village tanks to store rainwater', ['Build airports', 'Plant cotton', 'Make salt'], 'It is about old irrigation tanks.', 'Restored tanks store water and recharge groundwater.'],
          ['A layer of rock that holds groundwater is an…', 'Aquifer', ['Anther', 'Ammeter', 'Antacid'], 'Aqua = water.', 'Aquifers store and transmit groundwater.'],
        ]),
        tapT('tap-fresh', 'Tap every source of FRESH water.', [
          ['Godavari river', true], ['Hussain Sagar lake (before pollution)', true], ['Village well', true], ['Rainwater', true], ['Glacier ice', true],
          ['Bay of Bengal', false], ['Arabian Sea', false], ['Sea water at Visakhapatnam beach', false],
        ], ['Seas and oceans are salty.', 'Rivers, lakes, wells, rain and glaciers hold fresh water.'], 'Rivers, lakes, wells, rain and glaciers are fresh; seas are salty.'),
      ],
    },
    {
      id: 'ts7.sc.water.impurities', title: 'Impurities, water-borne diseases, sewage and drainage', prereqs: ['ts7.sc.water.sources'],
      intro: [
        h('Clear water is not always clean water'),
        photo('🪣', 'Water from tanks and wells should be filtered and boiled or chlorinated before drinking.'),
        p('Water can carry suspended impurities (mud, sand, leaves), dissolved impurities (salts, chemicals, excess fluoride) and germs (bacteria, viruses, worm eggs). Germs in contaminated water cause water-borne diseases: cholera, typhoid, diarrhoea, dysentery and jaundice (hepatitis A). Stagnant water also breeds mosquitoes that spread malaria and dengue.'),
        p('Some places, such as parts of Nalgonda district, have groundwater with too much fluoride, which causes fluorosis — stained teeth and bent, weak bones. Telangana\'s Mission Bhagiratha supplies treated surface water through pipes to homes to solve such problems.'),
        h('Making water safe'),
        stepsB('Sedimentation and decantation — let mud settle, pour off clear water.', 'Filtration — through a cloth, candle filter or sand-gravel filter.', 'Boiling — kills germs.', 'Chlorination — chlorine tablets or bleaching powder kill germs.'),
        h('Sewage and drainage'),
        p('Sewage is the used wastewater from homes, hospitals and industries. It contains dirt, food waste, urine and faeces, soaps and germs. It must flow through covered drains (sewers) to a wastewater treatment plant: screens remove large objects, grit settles out, sludge settles in big tanks, air is bubbled through so useful bacteria eat the waste, and the clear water is disinfected before release. Open, blocked drains breed mosquitoes and spread disease.'),
        keys('Impurities: suspended, dissolved, germs.', 'Water-borne diseases: cholera, typhoid, diarrhoea, dysentery, jaundice.', 'Purify by settling, filtering, boiling, chlorinating.', 'Sewage needs covered drains and treatment plants.'),
        remember('Never throw plastic, oil or food waste into drains — they block the sewers and cause overflow.'),
      ],
      examples: [
        ex('After floods in a village, many children get diarrhoea. Why, and what should families do?', ['Flood water mixes sewage with drinking water sources.', 'Germs in the water cause diarrhoea.', 'Families should boil or chlorinate drinking water.'], 'Contaminated water; boil or chlorinate before drinking'),
        ex('Why should drains be covered?', ['Open drains let flies and mosquitoes breed.', 'They spread smell and germs.'], 'To stop mosquitoes, flies and disease'),
      ],
      practice: [
        mcq('dis', 'Germs in dirty water cause water-borne diseases.', [
          ['Which is a water-borne disease?', 'Cholera', ['Night blindness', 'Goitre', 'Rickets'], 'It spreads through contaminated water.', 'Cholera bacteria spread through dirty water.'],
          ['Boiling water makes it safe because it…', 'Kills germs', ['Removes all salts', 'Adds vitamins', 'Makes it colder'], 'High temperature.', 'Boiling kills most bacteria and viruses.'],
          ['Too much fluoride in drinking water causes…', 'Fluorosis', ['Scurvy', 'Malaria', 'Cholera'], 'Seen in parts of Nalgonda.', 'Excess fluoride damages teeth and bones.'],
          ['Used wastewater from homes and industries is called…', 'Sewage', ['Groundwater', 'Rainwater', 'Distilled water'], 'It flows into sewers.', 'Sewage is wastewater carried by sewers.'],
          ['Stagnant water in open drains breeds…', 'Mosquitoes', ['Fish for food', 'Butterflies', 'Earthworms'], 'Malaria and dengue.', 'Mosquitoes lay eggs in stagnant water.'],
          ['Chlorine tablets are added to water to…', 'Kill germs', ['Make it sweet', 'Remove mud', 'Add fluoride'], 'Disinfection.', 'Chlorine disinfects drinking water.'],
        ]),
        orderT('order-treat', 'Put the steps of a wastewater treatment plant in order.', ['Bar screens remove large objects', 'Grit and sand settle out', 'Sludge settles in a big tank', 'Air is bubbled in so bacteria break down waste', 'Clear water is disinfected and released'], ['Big objects are removed first.', 'Disinfection is last.'], 'Screening → grit removal → sedimentation → aeration → disinfection.', 2),
        matchT('match-imp', 'impurity to the way of removing it', [
          ['Mud and sand', 'Sedimentation and filtration'], ['Germs', 'Boiling or chlorination'], ['Leaves and plastic', 'Bar screens'], ['Floating oil and grease', 'Skimming off the surface'],
        ], ['Big things are screened; small particles settle or are filtered.', 'Only heat or chemicals kill germs.'], 4),
      ],
    },
    {
      id: 'ts7.sc.water.conserve', title: 'Conserving water: every drop counts', prereqs: ['ts7.sc.water.sources'],
      intro: [
        h('A leaking tap wastes a bucketful a day'),
        photo('💧', 'Drip, drip, drip — small leaks waste a lot of water over a day.'),
        p('Since usable fresh water is so limited, we must use it wisely. Water conservation means saving water and using it carefully so that there is enough for everyone, including future generations.'),
        stepsB(
          'At home: close taps while brushing, fix leaking taps, use a bucket instead of a shower, reuse water from washing vegetables for plants.',
          'In farms: drip irrigation and sprinklers give water directly to the roots and waste much less than flooding fields.',
          'Rainwater harvesting: collect rain from rooftops into tanks or lead it into pits to recharge groundwater.',
          'In villages: check dams, farm ponds and percolation tanks slow down rainwater so it soaks into the ground.',
          'Protect lakes and tanks from encroachment and pollution.',
        ),
        def('Rainwater harvesting', 'Collecting and storing rainwater, or directing it into the ground to recharge groundwater.'),
        xp({
          title: 'What if? A dripping tap', formula: 'W = drops per minute × minutes × volume per drop',
          res: ['W', 'Water wasted in a day', 'L', 'n * 1440 * v / 1000', 1],
          vars: [['n', 'Drops per minute', '', 5, 120, 5, 30], ['v', 'Volume of one drop', 'mL', 0.05, 0.1, 0.01, 0.05]],
          notes: [['n', 'A faster drip wastes more water every day.', 'A slower drip wastes less — but fixing it saves it all.'], ['v', 'Bigger drops waste more water.', 'Smaller drops waste less.']],
          mistakes: [['Forgetting there are 1440 minutes in a day', '24 hours × 60 minutes = 1440 minutes.'], ['Forgetting to change mL into L', 'Divide millilitres by 1000 to get litres.']],
          real: 'A tap dripping 60 drops a minute wastes over 4 litres a day — about 1500 litres in a year.',
        }),
        keys('Save water at home, in farms and in villages.', 'Drip irrigation saves water in farming.', 'Rainwater harvesting recharges groundwater.', 'Fix leaks — small drips add up.'),
        remember('22 March is World Water Day.'),
      ],
      examples: [
        ex('A tap drips 40 drops a minute and each drop is 0.05 mL. How much water is wasted in a day?', ['Minutes in a day = 24 × 60 = 1440.', 'Drops = 40 × 1440 = 57 600.', 'Volume = 57 600 × 0.05 = 2880 mL = 2.88 L.'], 'About 2.9 L per day'),
        ex('Why is drip irrigation better than flooding a field?', ['Drip pipes deliver water drop by drop to each plant\'s roots.', 'Very little is lost to evaporation or runoff.'], 'It uses much less water'),
      ],
      practice: [
        tp('drip', (r) => {
          const n = r.pick([20, 30, 40, 50, 60]);
          const hrs = r.pick([1, 2, 5, 10, 24]);
          const mL = n * 60 * hrs * 0.05;
          return numQ(`A tap drips ${n} drops per minute. Each drop is 0.05 mL. How many millilitres are wasted in ${hrs} hour${hrs > 1 ? 's' : ''}?`, mL, 'mL',
            ['Find the number of minutes first.', `Drops = ${n} × ${hrs * 60} minutes; then multiply by 0.05 mL.`],
            [`Minutes = ${hrs} × 60 = ${hrs * 60}`, `Drops = ${n} × ${hrs * 60} = ${n * hrs * 60}`, `Volume = ${n * hrs * 60} × 0.05 = ${rd(mL, 2)} mL`],
            [{ when: String(rd(n * hrs * 0.05, 2)), explain: 'You forgot to change hours into minutes (× 60).' }], 0.01);
        }, 2),
        tapT('tap-save', 'Tap every action that SAVES water.', [
          ['Closing the tap while brushing', true], ['Fixing a leaking tap', true], ['Watering plants with water used for washing vegetables', true], ['Rooftop rainwater harvesting', true], ['Using drip irrigation', true],
          ['Washing the car with a running hose daily', false], ['Leaving the tap open while soaping hands', false], ['Letting the overhead tank overflow', false],
        ], ['Ask: does this use less water or reuse it?', 'Running hoses and overflowing tanks waste water.'], 'Closing taps, fixing leaks, reusing water, harvesting rain and drip irrigation all save water.'),
        mcq('cons', 'Every drop counts.', [
          ['Collecting rain from rooftops and storing it is called…', 'Rainwater harvesting', ['Irrigation', 'Sewage treatment', 'Evaporation'], 'Harvesting = collecting.', 'Rainwater harvesting collects and stores rain.'],
          ['Which irrigation method saves the most water?', 'Drip irrigation', ['Flooding the field', 'Open channels', 'Leaving pumps on all night'], 'Water goes straight to the roots.', 'Drip irrigation delivers small amounts directly to roots.'],
          ['Check dams and percolation tanks help by…', 'Slowing rainwater so it soaks into the ground', ['Making water salty', 'Speeding water to the sea', 'Polluting water'], 'Recharge groundwater.', 'Held water seeps in and recharges groundwater.'],
          ['World Water Day is on…', '22 March', ['5 June', '15 August', '14 November'], 'It is in March.', 'World Water Day is observed on 22 March.'],
          ['How many minutes are there in one day?', '1440', ['240', '3600', '1000'], '24 × 60.', '24 hours × 60 minutes = 1440 minutes.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 15 — Soil - Our Life
// =====================================================================================
const ch15: USpec = {
  id: 'ts7.sc.ch15', subject: 'biology', title: 'Soil - Our Life', source: src(15),
  objectives: [
    {
      id: 'ts7.sc.soil.life', title: 'Uses of soil, soil life and soil horizons', prereqs: [],
      intro: [
        h('Soil is alive'),
        photo('🪨', 'Soil forms very slowly as rocks are broken down by sun, wind, water and living things.'),
        p('Soil is the thin top layer of the Earth\'s surface in which plants grow. It forms very slowly — it can take hundreds of years to make a centimetre — as rocks are broken down by heating and cooling, wind, water and the roots of plants. This breaking down is weathering. Rotting leaves and dead animals add humus, the dark, rich organic part of soil.'),
        stepsB('Uses: growing crops and forests, a home for many organisms, making pots and bricks, building houses, filtering and storing rainwater.', 'Soil life: earthworms, ants, termites, beetles, millipedes, fungi and countless bacteria live in soil. They break down dead matter into humus and nutrients. Earthworms loosen and mix soil — they are called "farmers\' friends".'),
        h('Soil horizons (layers)'),
        stepsB(
          'Topsoil (A horizon) — dark, soft, rich in humus and minerals; most roots and soil animals live here.',
          'Subsoil (B horizon) — harder, less humus, more minerals and small stones.',
          'Weathered rock (C horizon) — broken pieces of rock with cracks.',
          'Bedrock — hard, solid rock that cannot be dug with a spade.',
        ),
        def('Soil profile', 'A vertical section through the soil showing its different layers (horizons).'),
        keys('Soil forms from rock by weathering; humus comes from dead organisms.', 'Soil is home to earthworms, ants, fungi, bacteria.', 'Horizons: topsoil → subsoil → weathered rock → bedrock.', 'Topsoil is the most fertile layer.'),
        remember('Losing just a few centimetres of topsoil can take centuries to replace.'),
      ],
      examples: [
        ex('Why is topsoil darker than subsoil?', ['Topsoil has much more humus.', 'Humus, made from decayed plants and animals, is dark.'], 'It is rich in dark humus'),
        ex('How do earthworms help farmers?', ['They burrow, loosening the soil so air and water can enter.', 'They eat dead matter and their castings add nutrients.'], 'They aerate and fertilise the soil'),
      ],
      practice: [
        orderT('horizons', 'Order the soil layers from TOP to BOTTOM.', ['Topsoil (A horizon)', 'Subsoil (B horizon)', 'Weathered rock (C horizon)', 'Bedrock'], ['The humus-rich layer is on top.', 'Solid rock is at the bottom.'], 'Topsoil → subsoil → weathered rock → bedrock.'),
        mcq('soil', 'Soil forms from rock and dead organisms.', [
          ['The dark, rich organic matter in soil is…', 'Humus', ['Bedrock', 'Sand', 'Clay'], 'It comes from decayed organisms.', 'Humus is decomposed plant and animal matter.'],
          ['Breaking down of rocks into small particles by sun, wind and water is…', 'Weathering', ['Erosion', 'Irrigation', 'Germination'], 'The weather does it.', 'Weathering breaks rocks into soil particles.'],
          ['Earthworms are called farmers\' friends because they…', 'Loosen and enrich the soil', ['Eat the crops', 'Spread diseases', 'Make soil salty'], 'They burrow and recycle.', 'Burrowing aerates soil; castings add nutrients.'],
          ['Most plant roots and soil animals are found in the…', 'Topsoil', ['Bedrock', 'Weathered rock', 'Subsoil only'], 'The most fertile layer.', 'Topsoil has humus, air and water.'],
          ['A vertical section showing soil layers is called a…', 'Soil profile', ['Soil map', 'Water table', 'Aquifer'], 'Profile = side view.', 'A soil profile shows all horizons.'],
        ]),
        tapT('tap-life', 'Tap every organism that lives in and helps form fertile soil.', [
          ['Earthworm', true], ['Bacteria', true], ['Fungi', true], ['Termites', true], ['Millipede', true],
          ['Eagle', false], ['Fish', false], ['Cow', false],
        ], ['Think of tiny decomposers and burrowers.', 'Large animals that live above ground are not soil organisms.'], 'Earthworms, bacteria, fungi, termites and millipedes live in soil and break down dead matter.'),
      ],
    },
    {
      id: 'ts7.sc.soil.types', title: 'Types of soil, moisture content and crops', prereqs: ['ts7.sc.soil.life'],
      intro: [
        h('Sandy, clayey or loamy?'),
        photo('🌾', 'Paddy grows best in clayey soil that holds water; groundnut prefers lighter, sandy loam.'),
        stepsB(
          'Sandy soil — big particles with large air spaces; water drains away quickly; light and dry; poor in nutrients.',
          'Clayey soil — very fine particles packed closely; holds a lot of water; sticky when wet, cracks when dry; good for paddy and wheat.',
          'Loamy soil — a mixture of sand, clay and silt with humus; holds the right amount of water and air; best for most crops.',
        ),
        p('Telangana has red soils (chalka) in many districts, good for groundnut, millets and pulses, and black cotton soil (regadi) in the north and west, which holds moisture well and is ideal for cotton.'),
        h('Measuring moisture content'),
        p('Weigh a soil sample, dry it in the sun or an oven, and weigh it again. The loss in mass is the water it contained.'),
        f('moisture % = (wet mass − dry mass) ÷ wet mass × 100', 'moisture percent equals wet mass minus dry mass, divided by wet mass, times 100'),
        xp({
          title: 'What if? Moisture in a soil sample', formula: 'M = (W − D) / W × 100',
          res: ['M', 'Moisture content', '%', '(W - D) / W * 100', 1],
          vars: [['W', 'Mass of wet soil', 'g', 100, 200, 5, 100], ['D', 'Mass after drying', 'g', 50, 100, 1, 80]],
          notes: [['W', 'More mass before drying (for the same dry mass) means more water was present.', 'Less wet mass means less water was present.'], ['D', 'A heavier dry sample means less water was lost.', 'A lighter dry sample means more water was lost.']],
          mistakes: [['Dividing by the dry mass', 'Moisture content is usually given as a percentage of the wet (original) mass.'], ['Forgetting × 100', 'Multiply by 100 to turn the fraction into a percentage.']],
          real: 'Clayey soil after rain can hold 30–40% water; dry sandy soil may hold less than 5%.',
        }),
        keys('Sandy: drains fast; clayey: holds water; loamy: best balance.', 'Moisture % = loss in mass ÷ wet mass × 100.', 'Red soils → groundnut, millets; black soil → cotton; clayey → paddy.'),
        remember('Percolation (how fast water drains) is fastest in sandy soil and slowest in clayey soil.'),
      ],
      examples: [
        ex('A 50 g soil sample weighs 42 g after drying. Find its moisture content.', ['Water lost = 50 − 42 = 8 g', 'Moisture % = 8 ÷ 50 × 100 = 16%'], '16%'),
        ex('Which soil type would you choose for growing paddy, and why?', ['Paddy needs standing water.', 'Clayey soil holds water best.'], 'Clayey soil — it retains water'),
      ],
      practice: [
        tp('moist', (r) => {
          const W = r.pick([20, 25, 40, 50, 80, 100, 200]);
          const pct = r.pick([5, 10, 15, 20, 25, 30]);
          const D = W - W * pct / 100;
          return numQ(`A soil sample weighs ${W} g. After drying it weighs ${D} g. What is its moisture content as a percentage? (Type the number only.)`, pct, undefined,
            ['Water lost = wet mass − dry mass.', `Divide the water lost by ${W} and multiply by 100.`],
            [`Water lost = ${W} − ${D} = ${W - D} g`, `Moisture = ${W - D} ÷ ${W} × 100 = ${pct}%`],
            [{ when: String(rd((W - D) / D * 100, 1)), explain: 'Divide by the WET mass, not the dry mass.' }, { when: String(W - D), explain: 'That is the water lost in grams. Turn it into a percentage of the wet mass.' }]);
        }, 2),
        matchT('match-soil', 'description to the soil type or crop', [
          ['Large particles, drains fast', 'Sandy soil'], ['Fine particles, sticky, holds water', 'Clayey soil'], ['Mix of sand, clay and humus', 'Loamy soil'], ['Black soil that keeps moisture', 'Cotton'], ['Clayey soil with standing water', 'Paddy'], ['Red sandy loam', 'Groundnut'],
        ], ['Particle size decides how fast water drains.', 'Telangana\'s black soil is famous for cotton.']),
        mcq('types', 'Particle size controls water holding.', [
          ['Which soil holds the MOST water?', 'Clayey soil', ['Sandy soil', 'Gravel', 'Pebbles'], 'Finest particles.', 'Tiny clay particles hold water tightly.'],
          ['Which soil is best for most crops?', 'Loamy soil', ['Sandy soil', 'Pure clay', 'Rocky soil'], 'It is a balanced mixture.', 'Loam has good water, air and humus.'],
          ['Water drains fastest through…', 'Sandy soil', ['Clayey soil', 'Loamy soil', 'Black soil'], 'Big air spaces.', 'Large spaces let water flow quickly.'],
          ['Black cotton soil (regadi) is ideal for…', 'Cotton', ['Tea', 'Apples', 'Coconut'], 'The name tells you.', 'It holds moisture and suits cotton.'],
          ['Pots and bricks are made from…', 'Clayey soil', ['Sandy soil', 'Gravel', 'Humus'], 'It is sticky and can be moulded.', 'Clay can be shaped and baked.'],
        ]),
      ],
    },
    {
      id: 'ts7.sc.soil.conserve', title: 'Soil erosion and soil conservation', prereqs: ['ts7.sc.soil.life'],
      intro: [
        h('When soil runs away'),
        photo('⛰️', 'On hill slopes, farmers cut steps (terraces) so that rain cannot wash away the soil.'),
        p('The removal of the top layer of soil by wind or water is soil erosion. It happens most where the ground is bare: when forests are cut (deforestation), when animals overgraze the grass, or when fields are left empty. Fertile topsoil is lost, rivers fill with silt and floods increase.'),
        def('Soil erosion', 'The removal of topsoil by wind, water or other agents.'),
        def('Soil conservation', 'Methods that protect soil from erosion and keep it fertile.'),
        stepsB(
          'Plant trees and grass (afforestation) — roots bind the soil.',
          'Terrace farming — step-like fields on slopes slow down running water.',
          'Contour ploughing — ploughing across the slope, not up and down.',
          'Strip cropping and cover crops — keep the ground covered.',
          'Shelter belts — rows of trees that break the force of wind.',
          'Check dams on streams and bunds around fields.',
          'Avoid overgrazing; use manure instead of only chemical fertilisers; do not dump plastic.',
        ),
        keys('Erosion agents: wind and water.', 'Causes: deforestation, overgrazing, bare land.', 'Conservation: trees, terraces, contour ploughing, shelter belts, check dams.'),
        remember('Plastic and too many pesticides pollute soil and harm the organisms that keep it fertile.'),
      ],
      examples: [
        ex('A hill slope was cleared of trees. After the monsoon, gullies appeared and the soil was washed away. Why?', ['Tree roots used to hold the soil.', 'Without them, running rainwater carried away loose topsoil.'], 'Deforestation left soil unprotected against water erosion'),
        ex('How does terrace farming prevent erosion?', ['Flat steps on a slope slow down running water.', 'Water soaks in instead of rushing downhill carrying soil.'], 'It slows running water on slopes'),
      ],
      practice: [
        tapT('tap-cons', 'Tap every method that helps CONSERVE soil.', [
          ['Planting trees', true], ['Terrace farming on hills', true], ['Ploughing across the slope', true], ['Growing shelter belts of trees', true], ['Building check dams', true],
          ['Cutting down forests', false], ['Overgrazing by cattle', false], ['Leaving fields bare and dry', false],
        ], ['Methods that cover or hold the soil help.', 'Removing plants exposes soil to erosion.'], 'Trees, terraces, contour ploughing, shelter belts and check dams protect soil.'),
        matchT('match-cons', 'method to how it protects soil', [
          ['Afforestation', 'Roots bind soil particles'], ['Terrace farming', 'Steps slow water on slopes'], ['Shelter belts', 'Trees reduce wind speed'], ['Contour ploughing', 'Furrows across the slope hold water'], ['Check dam', 'Slows stream water and traps silt'],
        ], ['Some methods stop wind, others stop water.', 'Contour = following the level lines of the hill.']),
        mcq('ero', 'Bare soil erodes; covered soil stays.', [
          ['The main agents of soil erosion are…', 'Wind and water', ['Earthworms and ants', 'Sunlight and moonlight', 'Rocks and pebbles'], 'They carry soil away.', 'Wind blows and water washes topsoil away.'],
          ['Which human activity increases soil erosion?', 'Deforestation', ['Planting trees', 'Building terraces', 'Mulching'], 'Removing plant cover.', 'Without trees, soil is exposed.'],
          ['Too many cattle grazing the same land is called…', 'Overgrazing', ['Afforestation', 'Irrigation', 'Crop rotation'], 'Over + grazing.', 'Overgrazing removes grass cover and loosens soil.'],
          ['Which layer of soil is lost first in erosion?', 'Topsoil', ['Bedrock', 'Weathered rock', 'Subsoil'], 'The uppermost layer.', 'Erosion removes the fertile topsoil first.'],
          ['Rows of trees planted to slow down strong winds are…', 'Shelter belts', ['Check dams', 'Terraces', 'Bunds'], 'They shelter fields.', 'Shelter belts break wind force.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 16 — Forest - Our Life
// =====================================================================================
const ch16: USpec = {
  id: 'ts7.sc.ch16', subject: 'biology', title: 'Forest - Our Life', source: src(16),
  objectives: [
    {
      id: 'ts7.sc.forest.what', title: 'What a forest is; diversity in forests', prereqs: [],
      intro: [
        h('More than just trees'),
        photo('🐅', 'Telangana\'s Amrabad and Kawal Tiger Reserves protect tigers and the forests they live in.'),
        p('A forest is a large area thickly covered with trees, shrubs, herbs and climbers, together with the animals, birds, insects, fungi and microbes that live there. All of them depend on one another. Telangana\'s forests include the Nallamala hills (Amrabad Tiger Reserve), Kawal Tiger Reserve, the teak forests of Adilabad, and the Eturnagaram and Pakhal wildlife sanctuaries.'),
        stepsB(
          'Layers: emergent and canopy layer (tall trees like teak, maddi, nallamaddi), understorey (smaller trees), shrub layer, herb layer and the forest floor with dead leaves.',
          'Food chains: grass → deer → tiger; leaves → caterpillar → bird. Many food chains link into a food web.',
          'Decomposers: fungi and bacteria break down dead leaves and animals into humus, returning nutrients to the soil.',
          'Forest gifts: timber, bamboo, fruits, honey, gum, medicinal plants, tendu leaves, fodder and firewood.',
          'Forest services: give oxygen, absorb carbon dioxide, bring rain, prevent soil erosion and floods, recharge groundwater, give homes to wildlife and forest people.',
        ),
        def('Biodiversity', 'The variety of plants, animals and micro-organisms living in an area.'),
        keys('A forest = trees + all the living things depending on them.', 'Forests have layers: canopy, understorey, shrubs, herbs, floor.', 'Food chains and decomposers keep the forest working.', 'Forests give products and protect soil, water and climate.'),
        remember('A forest is a "dynamic living entity" — it grows, regenerates and keeps recycling its own nutrients.'),
      ],
      examples: [
        ex('Write a forest food chain with three links.', ['Start with a producer: grass.', 'A herbivore eats it: deer.', 'A carnivore eats the herbivore: tiger.'], 'Grass → deer → tiger'),
        ex('If all decomposers in a forest disappeared, what would happen?', ['Dead leaves and animals would pile up.', 'Nutrients would not return to the soil.', 'Plants would gradually lack nutrients.'], 'Dead matter would pile up and the soil would lose nutrients'),
      ],
      practice: [
        orderT('chain', 'Arrange this forest food chain in order (from producer).', ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Eagle'], ['Start with the plant.', 'The top predator comes last.'], 'Energy flows from producer to herbivore to carnivores.'),
        mcq('forest', 'Everything in a forest is linked.', [
          ['The top layer of a forest formed by the crowns of tall trees is the…', 'Canopy', ['Forest floor', 'Shrub layer', 'Herb layer'], 'Like a roof.', 'Tree crowns form the canopy.'],
          ['Organisms that break down dead matter into humus are…', 'Decomposers', ['Producers', 'Herbivores', 'Carnivores'], 'Fungi and bacteria.', 'Decomposers recycle nutrients.'],
          ['Forests help bring rain because…', 'Trees release water vapour through their leaves', ['Trees attract clouds magnetically', 'Animals make rain', 'Trees produce salt'], 'Transpiration.', 'Water vapour from trees helps form clouds.'],
          ['Amrabad Tiger Reserve is in the…', 'Nallamala hills', ['Himalayas', 'Thar desert', 'Western Ghats of Kerala'], 'It lies in southern Telangana.', 'Amrabad is in the Nallamala forest.'],
          ['Which is a product we get from forests?', 'Honey', ['Petrol', 'Plastic', 'Steel'], 'Bees live in forests.', 'Honey, gum, timber and fruits come from forests.'],
          ['In the food chain grass → deer → tiger, the deer is a…', 'Herbivore', ['Producer', 'Carnivore', 'Decomposer'], 'It eats plants.', 'Deer eat plants — herbivores.'],
        ]),
        tapT('tap-service', 'Tap every way forests help us and the planet.', [
          ['Give oxygen', true], ['Absorb carbon dioxide', true], ['Prevent soil erosion', true], ['Help recharge groundwater', true], ['Provide homes for wildlife', true],
          ['Cause floods', false], ['Make the air dirtier', false], ['Turn soil into desert', false],
        ], ['Think of what trees do for air, soil and water.', 'Forests reduce floods and deserts; they do not cause them.'], 'Forests give oxygen, absorb CO₂, protect soil and water and shelter wildlife.'),
      ],
    },
    {
      id: 'ts7.sc.forest.chenchus', title: 'The Chenchus and the forest', prereqs: ['ts7.sc.forest.what'],
      intro: [
        h('Living with the forest'),
        photo('🍯', 'Collecting honey from the forest is a traditional skill of the Chenchu people.'),
        p('The Chenchus are a tribal community who have lived for centuries in the Nallamala forests of Telangana (Nagarkurnool district, around the Amrabad Tiger Reserve) and Andhra Pradesh. Traditionally they were food gatherers and hunters, and they know the forest — its plants, animals, seasons and medicines — extremely well.'),
        stepsB(
          'They collect minor forest produce: honey, gum, tamarind, mahua (ippa) flowers, chironji (charoli) seeds, amla, roots and tubers.',
          'They use forest plants as medicines and for making houses, baskets and tools.',
          'They sell forest produce through the Girijan Co-operative Corporation (GCC), which pays a fair price.',
          'Traditionally they take only what they need — for example, leaving part of a honeycomb so bees can rebuild — which helps keep the forest alive.',
          'Today many Chenchus also work as forest guards and trackers that help protect tigers in Amrabad.',
        ),
        def('Minor forest produce', 'Forest products other than timber, such as honey, gum, fruits, seeds, leaves and medicinal plants.'),
        keys('Chenchus: tribal people of the Nallamala forests.', 'They depend on minor forest produce.', 'They use the forest sustainably — taking only what they need.', 'Their knowledge helps protect the forest and its wildlife.'),
        remember('Forest people and forests depend on each other: protecting forests also protects their way of life.'),
      ],
      examples: [
        ex('Why do Chenchus leave part of a honeycomb behind?', ['If the whole comb is taken, the bee colony may die or leave.', 'Leaving part lets the bees rebuild, so honey is available again.'], 'So bees survive and honey can be collected again — sustainable use'),
        ex('Give two examples of minor forest produce.', ['Products other than timber.', 'Honey and gum (also tamarind, mahua flowers, amla).'], 'Honey and gum'),
      ],
      practice: [
        mcq('chenchu', 'Think of how a forest community lives.', [
          ['The Chenchus traditionally live in the…', 'Nallamala forests', ['Thar desert', 'Sundarbans', 'Himalayan snowfields'], 'Southern Telangana hills.', 'Chenchus live in the Nallamala hills.'],
          ['Which is a minor forest produce collected by Chenchus?', 'Honey', ['Coal', 'Iron ore', 'Plastic'], 'Not timber, not minerals.', 'Honey is a classic minor forest produce.'],
          ['Taking only what is needed so the forest can renew itself is called…', 'Sustainable use', ['Deforestation', 'Overgrazing', 'Pollution'], 'It can be sustained for a long time.', 'Sustainable use protects resources for the future.'],
          ['The Girijan Co-operative Corporation (GCC) helps tribal people by…', 'Buying forest produce at fair prices', ['Cutting forests', 'Building factories in forests', 'Selling plastic'], 'It is a co-operative.', 'GCC buys minor forest produce from tribal collectors.'],
          ['Many Chenchus now help protect tigers by working as…', 'Forest guards and trackers', ['Bus drivers in cities', 'Bankers', 'Sailors'], 'They know the forest best.', 'Their forest knowledge helps wildlife protection.'],
        ]),
        tapT('tap-mfp', 'Tap every item that is MINOR FOREST PRODUCE.', [
          ['Honey', true], ['Gum', true], ['Tamarind', true], ['Mahua (ippa) flowers', true], ['Amla', true], ['Tendu leaves', true],
          ['Teak timber logs', false], ['Coal', false], ['Granite', false],
        ], ['Minor produce is everything except timber (and minerals are not forest produce).', 'Leaves, fruits, flowers and honey count.'], 'Honey, gum, tamarind, mahua, amla and tendu leaves are minor forest produce.'),
        matchT('match-use', 'forest item to how it is used', [
          ['Honey', 'Food and medicine'], ['Bamboo', 'Baskets and huts'], ['Tendu leaves', 'Rolling beedis'], ['Mahua flowers', 'Food and oil-seed'], ['Medicinal herbs', 'Treating illness'],
        ], ['Bamboo is strong and flexible.', 'Tendu leaves are a big source of income for forest people.']),
      ],
    },
    {
      id: 'ts7.sc.forest.conserve', title: 'Steps towards forest conservation', prereqs: ['ts7.sc.forest.what'],
      intro: [
        h('Saving forests for the future'),
        photo('🌳', 'Planting and caring for saplings is one way everyone can help.'),
        p('Forests are shrinking because trees are cut for timber, farming, roads, mining and housing, and because of forest fires and overgrazing. Loss of forests (deforestation) causes soil erosion, floods, less rain, higher temperatures and loss of wildlife.'),
        stepsB(
          'Protected areas: national parks, wildlife sanctuaries and tiger reserves (Kawal, Amrabad) protect forests and animals.',
          'Afforestation and reforestation: planting trees. Telangana\'s Haritha Haram programme has planted crores of saplings across the state.',
          'Van Mahotsav: a tree-planting festival held in the first week of July.',
          'Community action: the Chipko movement (people hugging trees to stop felling) and Joint Forest Management, where villagers and the forest department protect forests together.',
          'Personal action: use less paper and recycle it, avoid wasting wood, never start fires in forests, plant and look after trees.',
        ),
        def('Deforestation', 'Clearing of forests on a large scale for other uses.'),
        keys('Causes of forest loss: felling, farming, mining, roads, fires, overgrazing.', 'Effects: erosion, floods, less rain, loss of wildlife.', 'Conservation: protected areas, Haritha Haram, Van Mahotsav, Chipko, JFM.', 'Everyone can help: recycle paper, plant trees.'),
        remember('Recycling about one tonne of paper saves roughly 17 trees.'),
      ],
      examples: [
        ex('Give two effects of deforestation.', ['Without roots, soil is washed away — erosion.', 'Animals lose their homes — loss of wildlife.'], 'Soil erosion and loss of wildlife (also floods, less rain)'),
        ex('What was the Chipko movement?', ['Villagers in the Himalayas hugged trees ("chipko" = to stick).', 'This stopped contractors from cutting the trees.'], 'A people\'s movement where villagers hugged trees to save them'),
      ],
      practice: [
        mcq('cons', 'Protect, plant and use wisely.', [
          ['Telangana\'s large tree-planting programme is called…', 'Haritha Haram', ['Mission Bhagiratha', 'Mission Kakatiya', 'Rythu Bandhu'], 'Haritha = green.', 'Telangana Ku Haritha Haram aims to increase green cover.'],
          ['Van Mahotsav is celebrated in the first week of…', 'July', ['January', 'March', 'December'], 'At the start of the monsoon.', 'Van Mahotsav is a July tree-planting festival.'],
          ['In the Chipko movement, people…', 'Hugged trees to stop them from being cut', ['Planted rice', 'Built dams', 'Started forest fires'], 'Chipko means to stick.', 'Villagers embraced trees to protect them.'],
          ['Which is a CAUSE of deforestation?', 'Clearing land for mining', ['Planting saplings', 'Recycling paper', 'Creating sanctuaries'], 'Something that removes trees.', 'Mining clears large forest areas.'],
          ['Kawal in Telangana is a…', 'Tiger reserve', ['Desert', 'Sea port', 'Coal mine'], 'It protects big cats.', 'Kawal Tiger Reserve is in Nirmal/Mancherial area.'],
          ['Recycling paper helps forests because…', 'Fewer trees need to be cut for new paper', ['It makes trees taller', 'It adds plastic to forests', 'It causes rain'], 'Paper comes from wood pulp.', 'Recycled paper reduces demand for wood.'],
        ]),
        tapT('tap-help', 'Tap every action that HELPS conserve forests.', [
          ['Planting and caring for saplings', true], ['Recycling paper', true], ['Supporting wildlife sanctuaries', true], ['Reporting forest fires quickly', true], ['Using both sides of paper', true],
          ['Cutting trees for firewood carelessly', false], ['Lighting campfires in dry forests', false], ['Letting cattle overgraze young plants', false],
        ], ['Ask: does it save trees or harm them?', 'Fires, careless cutting and overgrazing damage forests.'], 'Planting, recycling, protecting and reporting fires all help.'),
        matchT('match-cons', 'term to its meaning', [
          ['Deforestation', 'Large-scale clearing of forests'], ['Afforestation', 'Planting trees on land without forest'], ['Wildlife sanctuary', 'Protected area for wild animals'], ['Chipko movement', 'Hugging trees to stop felling'], ['Haritha Haram', 'Telangana tree-planting programme'],
        ], ['De- means removing; af- means adding.', 'Two are Indian movements or programmes.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 17 — Changes Around Us
// =====================================================================================
const ch17: USpec = {
  id: 'ts7.sc.ch17', subject: 'chemistry', title: 'Changes Around Us', source: src(17),
  objectives: [
    {
      id: 'ts7.sc.change.types', title: 'Types of changes: physical and chemical', prereqs: [],
      intro: [
        h('Melting ice and burning paper — both are changes'),
        photo('🧊', 'Ice melting into water is a physical change: it can be frozen back.'),
        p('Things around us keep changing. We can group changes in many ways: slow (rusting, growth of a tree) or fast (burning a matchstick); reversible (melting wax) or irreversible (cooking rice); periodic (day and night, seasons) or non-periodic (an earthquake); desirable (ripening of fruit) or undesirable (spoiling of food).'),
        def('Physical change', 'A change in shape, size, state or appearance in which no new substance is formed. It is usually reversible: melting ice, dissolving sugar, cutting paper, stretching a rubber band, making ice cream.'),
        def('Chemical change', 'A change in which one or more new substances are formed with new properties. It is usually irreversible: burning wood, cooking food, rusting, curdling milk, digestion, ripening.'),
        stepsB('Signs of a chemical change: a new colour, a gas is given off (bubbles), heat or light is given out or taken in, a new smell, a solid (precipitate) forms.', 'Example: baking soda + vinegar fizzes — carbon dioxide gas forms, which turns lime water milky.', 'Example: a magnesium ribbon burns with a dazzling white light and leaves white ash (magnesium oxide), which turns red litmus blue in water — a new, basic substance.', 'Example: an iron nail in blue copper sulphate solution — the solution turns green and a brown layer of copper coats the nail.'),
        keys('Physical: no new substance, usually reversible.', 'Chemical: new substance, usually irreversible.', 'Signs: colour, gas, heat/light, smell, precipitate.', 'Other groupings: slow/fast, periodic/non-periodic, desirable/undesirable.'),
        remember('Burning a candle shows both: melting wax is physical; burning wax (forming CO₂ and water) is chemical.'),
      ],
      examples: [
        ex('Is dissolving salt in water a physical or chemical change?', ['No new substance forms; the salt is still salt.', 'Evaporating the water gives the salt back.'], 'Physical change'),
        ex('When milk turns into curd, which kind of change is it?', ['Curd has a new taste and texture — lactic acid is formed.', 'Curd cannot be turned back into milk.'], 'Chemical change'),
      ],
      practice: [
        tp('pc', (r) => {
          const bank: [string, boolean][] = [
            ['Melting of ice', true], ['Dissolving sugar in water', true], ['Cutting paper into pieces', true], ['Stretching a rubber band', true], ['Breaking a glass bottle', true], ['Freezing water into ice', true], ['Melting butter', true],
            ['Burning paper', false], ['Rusting of iron', false], ['Cooking rice', false], ['Milk turning into curd', false], ['Ripening of a mango', false], ['Burning a magnesium ribbon', false], ['Digestion of food', false],
          ];
          const [s, phys] = r.pick(bank);
          return {
            type: 'mcq', prompt: `${s} — is this a physical change or a chemical change?`, ...choose(r, phys ? 'Physical change' : 'Chemical change', [phys ? 'Chemical change' : 'Physical change']),
            hints: ['Is a new substance formed?', 'Physical changes alter only shape, size or state.'],
            mistakes: [{ when: 'wrong', explain: phys ? 'No new substance forms — only the form or state changes. It is physical.' : 'A new substance with new properties forms. It is chemical.' }],
            solution: [phys ? `${s}: no new substance → physical change.` : `${s}: new substance formed → chemical change.`],
          };
        }),
        matchT('match-kind', 'change to its type', [
          ['Day and night', 'Periodic change'], ['An earthquake', 'Non-periodic change'], ['Growth of a tree', 'Slow change'], ['Bursting of a cracker', 'Fast change'], ['Ripening of fruit', 'Desirable change'], ['Spoiling of food', 'Undesirable change'],
        ], ['Periodic changes repeat at fixed intervals.', 'Desirable = we want it to happen.']),
        tapT('tap-signs', 'Tap every observation that shows a CHEMICAL change has happened.', [
          ['Bubbles of gas form when vinegar is added to baking soda', true], ['Blue copper sulphate solution turns green with an iron nail', true], ['Magnesium ribbon burns with bright light', true], ['Milk turns sour and smells different', true],
          ['Ice cream melts', false], ['A sheet of paper is folded', false], ['Wax melts near a flame', false],
        ], ['Look for new colour, gas, light/heat or smell.', 'Melting and folding only change form.'], 'Gas, colour change, light and new smell show new substances formed.'),
      ],
    },
    {
      id: 'ts7.sc.change.rust', title: 'Rusting of iron and how to prevent it; galvanisation', prereqs: ['ts7.sc.change.types'],
      intro: [
        h('Why old gates turn orange-brown'),
        photo('🔩', 'An iron bolt left out in rain soon gets a flaky, reddish-brown coat of rust.'),
        p('When iron objects are left in the open, a brown, flaky layer forms on them. This is rust, mainly iron oxide. Rusting is a slow chemical change.'),
        f('iron + oxygen (from air) + water → rust (iron oxide)', 'iron plus oxygen plus water gives rust'),
        p('Both oxygen and water (or moisture) are needed. A nail in dry air (a test tube with anhydrous calcium chloride to absorb moisture) does not rust. A nail in boiled water covered with a layer of oil (no dissolved air) does not rust either. Rusting is faster near the sea because salty, humid air speeds it up.'),
        h('Preventing rust'),
        stepsB(
          'Painting — gates, grills, bridges.',
          'Oiling or greasing — cycle chains, machine parts.',
          'Galvanisation — coating iron with a thin layer of zinc (galvanised iron pipes and sheets).',
          'Chrome plating or tin plating — taps, cycle handles, food tins.',
          'Making alloys — stainless steel (iron mixed with chromium and nickel) does not rust.',
        ),
        def('Galvanisation', 'Depositing a layer of zinc on iron or steel to protect it from rusting.'),
        keys('Rust = iron oxide; needs oxygen AND water.', 'Faster in humid, salty air.', 'Prevent: paint, oil/grease, galvanise (zinc), chrome plate, stainless steel.'),
        remember('Rust flakes off and exposes fresh iron underneath, so rusting continues until the iron is eaten away.'),
      ],
      examples: [
        ex('Why does a ship\'s iron hull rust faster than an iron gate in Hyderabad?', ['The ship is always in contact with water and moist air.', 'Sea water contains salt, which speeds up rusting.'], 'Constant moisture and salt speed up rusting'),
        ex('Why are water pipes galvanised?', ['They carry water, so they are always moist.', 'A zinc coating stops air and water from reaching the iron.'], 'The zinc layer prevents rusting'),
      ],
      practice: [
        mcq('rust', 'Rust needs oxygen and water.', [
          ['Rusting of iron needs…', 'Both oxygen and water', ['Only oxygen', 'Only water', 'Neither'], 'Recall the test-tube experiment.', 'In dry air or air-free water, no rust forms.'],
          ['Galvanisation means coating iron with…', 'Zinc', ['Copper', 'Gold', 'Plastic'], 'Galvanised iron sheets.', 'A zinc layer protects iron from rust.'],
          ['Rust is mainly…', 'Iron oxide', ['Iron sulphate', 'Copper oxide', 'Common salt'], 'Iron + oxygen.', 'Rust is hydrated iron oxide.'],
          ['Iron rusts fastest…', 'Near the sea', ['In a desert', 'In a vacuum', 'In dry air'], 'Salt and moisture.', 'Salty, humid sea air speeds up rusting.'],
          ['Stainless steel does not rust because it is…', 'An alloy of iron with chromium and nickel', ['Pure iron', 'Painted', 'Made of zinc'], 'It is a mixture of metals.', 'Chromium and nickel protect the iron.'],
          ['Rusting is a…', 'Slow chemical change', ['Fast physical change', 'Reversible physical change', 'Periodic change'], 'A new substance forms slowly.', 'Rust is a new substance formed over days or months.'],
        ]),
        matchT('match-prevent', 'object to the best way of preventing rust', [
          ['Iron gate', 'Painting'], ['Cycle chain', 'Oiling or greasing'], ['Water pipe', 'Galvanisation (zinc coating)'], ['Bathroom tap', 'Chrome plating'], ['Kitchen utensils', 'Using stainless steel'],
        ], ['Moving parts need oil, not paint.', 'Pipes are galvanised; taps are chrome-plated.']),
        tapT('tap-rust', 'Tap every test tube in which an iron nail WILL rust.', [
          ['Nail in tap water, open to air', true], ['Nail in moist air', true], ['Nail in salt water, open to air', true],
          ['Nail in boiled water covered with an oil layer', false], ['Nail in dry air with calcium chloride', false], ['Nail coated with paint', false], ['Galvanised nail in air', false],
        ], ['Rust needs BOTH air and water.', 'Oil layers, drying agents and coatings cut off air or water.'], 'Only nails exposed to both air and moisture rust.'),
      ],
    },
    {
      id: 'ts7.sc.change.crystal', title: 'Crystallisation', prereqs: ['ts7.sc.change.types'],
      intro: [
        h('Growing beautiful crystals'),
        photo('✨', 'Crystals of salt, sugar and alum have flat faces and sharp edges.'),
        p('Pure substances can often form large, regular crystals from their solutions. The process of getting large crystals of a pure substance from its solution is crystallisation. It is a physical change and is used to purify substances like sugar, salt and copper sulphate.'),
        def('Crystallisation', 'Obtaining large, pure crystals of a substance by cooling or evaporating its saturated solution slowly.'),
        stepsB(
          'Take water in a beaker and heat it.',
          'Add copper sulphate powder (with a few drops of dilute sulphuric acid, added by the teacher) and stir until no more dissolves — a saturated solution.',
          'Filter the hot solution to remove undissolved impurities.',
          'Leave it to cool slowly and undisturbed.',
          'Blue crystals of copper sulphate form; separate and dry them.',
        ),
        p('Salt pans along the sea coast get common salt by evaporating sea water in the sun, but that salt is not pure. Crystallisation gives purer crystals. Alum (patika), sugar candy (kalakanda / misri) and copper sulphate crystals are made this way.'),
        keys('Crystallisation gives large, pure crystals from a solution.', 'Steps: saturated hot solution → filter → cool slowly → crystals.', 'It is a physical change (the substance stays the same).', 'Evaporation of sea water gives impure salt; crystallisation purifies it.'),
        remember('Slow cooling gives bigger crystals; fast cooling gives many tiny ones.'),
      ],
      examples: [
        ex('Why is the hot copper sulphate solution filtered before cooling?', ['Undissolved particles and impurities would be trapped in the crystals.', 'Filtering removes them.'], 'To remove impurities so the crystals are pure'),
        ex('Is crystallisation a physical or a chemical change?', ['The copper sulphate in the crystals is the same substance as before.', 'Only its form changes.'], 'Physical change'),
      ],
      practice: [
        orderT('order-crys', 'Put the steps of crystallisation of copper sulphate in order.', ['Heat water in a beaker', 'Dissolve copper sulphate until no more dissolves', 'Filter the hot solution', 'Let it cool slowly without disturbing', 'Collect and dry the crystals'], ['A saturated solution is made first.', 'Crystals form only on cooling.'], 'Heat → saturate → filter → cool slowly → collect.'),
        mcq('crys', 'Crystallisation purifies by forming crystals.', [
          ['Crystallisation is used to…', 'Get pure substances as crystals', ['Make iron rust', 'Burn magnesium', 'Make curd'], 'Pure, large crystals.', 'Crystallisation separates a pure solid from impurities.'],
          ['A solution in which no more solute can dissolve is…', 'Saturated', ['Dilute', 'Neutral', 'Acidic'], 'It is "full".', 'A saturated solution holds the maximum dissolved solute.'],
          ['Crystallisation is a…', 'Physical change', ['Chemical change', 'Periodic change', 'Nuclear change'], 'The substance stays the same.', 'No new substance forms.'],
          ['To get BIG crystals, the solution should be cooled…', 'Slowly and undisturbed', ['Quickly in ice', 'While stirring hard', 'By boiling it dry'], 'Crystals need time to grow.', 'Slow cooling lets crystals grow large.'],
          ['Salt obtained by evaporating sea water in salt pans is…', 'Impure', ['Perfectly pure', 'Copper sulphate', 'Sugar'], 'Sea water has many dissolved substances.', 'Other salts and dirt remain; crystallisation purifies it.'],
          ['Sugar candy (kalakanda) is made by…', 'Crystallisation of sugar', ['Burning sugar', 'Rusting', 'Galvanisation'], 'Large sugar crystals.', 'Slow cooling of a saturated sugar syrup gives sugar candy.'],
        ]),
        tapT('tap-crys', 'Tap every substance whose crystals can be grown by crystallisation in a school lab.', [
          ['Copper sulphate', true], ['Alum', true], ['Sugar', true], ['Common salt', true],
          ['Sand', false], ['Chalk powder', false], ['Iron filings', false],
        ], ['The substance must dissolve in water.', 'Sand, chalk and iron do not dissolve in water.'], 'Only soluble substances can be crystallised from a water solution.'),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17];
