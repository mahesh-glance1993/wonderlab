// Telangana SCERT Class 10 — Biological Science (10 chapters). Original explanations aligned to the official
// chapter list (src/content/ts/books.ts, syllabus.json). Written for 15-year-olds: short paragraphs, a definition
// for every key term, step-by-step processes, exam traps, and "what if?" explorers only where biology has a real
// quantitative relationship. Sensitive topics (reproduction, excretion) are factual and at textbook level.
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, stepsB, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(10, 'biological-science', n);
const PLACES = ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Adilabad', 'Mahabubnagar', 'Siddipet', 'Suryapet', 'Jangaon', 'Medak'];
const who = (r: Rng) => r.pick(NAMES).en;

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, hint, why the answer is right, optional targeted feedback per wrong answer] */
type MQ = [string, string, string[], string, string, Record<string, string>?];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why, traps] = r.pick(bank);
  const c = choose(r, a, w);
  const targeted = traps ? c.choices.filter((x) => traps[x.label.en]).map((x) => ({ when: x.id, explain: traps[x.label.en] })) : [];
  return {
    type: 'mcq', prompt: q, ...c, hints: [hint0, h1],
    mistakes: [...targeted, { when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}.`, why],
  };
}, d);

const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Fix the pairs you are sure of first, then the rest fall into place.' }],
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
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join('; ')}.`, why],
  };
}, d);

/** Typed numeric answer (no unit required; the unit, if any, is shown as a hint next to the box). */
const numQ = (prompt: string, ans: number, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01, unitHint?: string): QSpec => ({
  type: 'typed', keypad: 'numeric', ...(unitHint ? { unitHint } : {}), prompt,
  answer: approx(ans, rel), hints, solution,
  mistakes: [{ when: 'unparsable', explain: 'Type only the number, for example 72 or 0.25.' }, ...mistakes],
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
// Chapter 1 — Nutrition
// =====================================================================================
const ch1: USpec = {
  id: 'ts10.bs.ch1', subject: 'biology', title: 'Nutrition', source: src(1),
  objectives: [
    {
      id: 'ts10.bs.photo.needs', title: 'Autotrophic nutrition: what photosynthesis needs and makes', prereqs: [],
      intro: [
        h('How a paddy plant makes its own meal'),
        photo('🌾', 'A paddy field near Nizamabad in August. Every green leaf here is a small food factory working on sunlight, air and water.'),
        p('You eat rice and jowar roti; the cow eats grass; the grass eats... nothing. A plant does not eat food — it makes it. Green plants take very simple things from their surroundings and build sugar out of them. This way of feeding is called autotrophic nutrition (auto = self, troph = nourishment).'),
        def('Autotroph', 'An organism that makes its own food from simple inorganic substances. Green plants, algae and some bacteria are autotrophs.'),
        def('Photosynthesis', 'The process by which green plants use light energy, trapped by chlorophyll, to make glucose from carbon dioxide and water, releasing oxygen.'),
        h('The four needs and two products'),
        p('Raw materials: carbon dioxide (from air, entering through stomata) and water (from soil, carried up by xylem). Conditions: sunlight (energy) and chlorophyll (the green pigment that traps light). Products: glucose (soon stored as starch) and oxygen (released to air).'),
        f('6CO₂ + 12H₂O  —(light, chlorophyll)→  C₆H₁₂O₆ + 6O₂ + 6H₂O', 'six carbon dioxide plus twelve water, with light and chlorophyll, gives glucose plus six oxygen plus six water'),
        p('Why 12 water on the left and 6 on the right? Experiments with labelled water showed that ALL the oxygen released comes from water, not from CO₂. Twelve water molecules are split to give the six O₂; six new water molecules are formed later. Many books write the shorter 6CO₂ + 6H₂O form — both are balanced.'),
        h('Proving each need — classic experiments'),
        p('Before testing a leaf for starch, the plant is kept in the dark for 2–3 days (destarching) so that any starch found later must be new.'),
        stepsB(
          'Starch test: boil the leaf in water (kills cells), then in alcohol on a water bath (removes chlorophyll), rinse, add dilute iodine.',
          'Blue-black colour = starch present = photosynthesis happened.',
          'Light needed: cover part of a leaf with black paper with a cut-out design. Only the uncovered design turns blue-black.',
          'CO₂ needed: put part of a leaf in a bottle with potassium hydroxide (KOH absorbs CO₂). That part shows no starch.',
          'Chlorophyll needed: test a variegated leaf (green and white, like Croton). Only the green areas turn blue-black.',
          'Oxygen released: an aquatic plant (Hydrilla) in sunlight gives off bubbles; the gas relights a glowing splinter.',
        ),
        xp({
          title: 'What if? Light and CO₂ as limiting factors (Hydrilla bubbles)', formula: 'rate = min(3 × L, 6 × C)',
          res: ['rate', 'Rate of photosynthesis (bubbles per minute)', '/min', 'min(3 * L, 6 * C)', 0],
          vars: [['L', 'Light intensity', 'units', 0, 40, 1, 8], ['C', 'Carbon dioxide level', 'units', 1, 20, 1, 5]],
          notes: [
            ['L', 'More light speeds up photosynthesis — but only until CO₂ becomes the factor in short supply. After that, extra light changes nothing.', 'Less light slows photosynthesis whenever light is the scarce factor.'],
            ['C', 'More CO₂ helps only when CO₂ is the factor in short supply; in dim light it makes no difference.', 'Less CO₂ slows the rate once CO₂ becomes the limiting factor.'],
          ],
          mistakes: [
            ['"More light always means more food."', 'The rate is set by whichever factor is in shortest supply (the limiting factor). Beyond that point extra light is wasted.'],
            ['Counting bubbles from a plant kept in the dark', 'In the dark there is no photosynthesis, so no oxygen bubbles — any gas then is not from photosynthesis.'],
          ],
          real: 'Greenhouse farmers raise CO₂ levels on sunny days because sunlight is plentiful and CO₂ becomes the limiting factor.',
        }),
        keys('Autotrophs make their own food; green plants do it by photosynthesis.', 'Needs: CO₂, water, sunlight, chlorophyll. Products: glucose (stored as starch) and O₂.', 'The O₂ released comes from water.', 'Starch test: boil → alcohol → iodine → blue-black.'),
        remember('Exam trap: in the starch test, alcohol is never heated directly on a flame — it catches fire. Heat it in a water bath.'),
        tip('Memory hook for the needs: "Cool Water Shines Green" — CO₂, Water, Sunlight, Green chlorophyll.'),
      ],
      examples: [
        ex('Meena covered part of a destarched leaf with black paper and left the plant in sunlight for 6 hours. Which part will turn blue-black with iodine, and what does it prove?', ['The covered part got no light, so it could not make starch.', 'The uncovered part made starch, which turns blue-black with iodine.', 'The only difference between the two parts was light.'], 'Only the uncovered part turns blue-black: light is needed for photosynthesis.'),
        ex('Why must a plant be kept in the dark for two days before a starch experiment?', ['In the dark, photosynthesis stops.', 'The plant uses up and moves out the starch already in its leaves.', 'Any starch found after the experiment must have been made during the experiment.'], 'To remove existing starch (destarching) so the result is fair.'),
        ex('In the KOH bottle experiment, part of a leaf inside the bottle shows no starch. Explain.', ['KOH absorbs carbon dioxide from the air in the bottle.', 'Without CO₂ the leaf cannot make glucose, so no starch forms.', 'The part outside the bottle had CO₂ and showed starch.'], 'It proves carbon dioxide is necessary for photosynthesis.'),
      ],
      practice: [
        mcq('needs', 'Think about the raw materials, the conditions and the products.', [
          ['Which gas do green plants take in for photosynthesis?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Hydrogen'], 'It enters through stomata.', 'CO₂ provides the carbon for glucose.', { Oxygen: 'Oxygen is a product of photosynthesis, not a raw material.' }],
          ['The oxygen released in photosynthesis comes from…', 'Water', ['Carbon dioxide', 'Glucose', 'Chlorophyll'], 'Which molecule is split by light?', 'Water is split (photolysis); its oxygen is released.', { 'Carbon dioxide': 'A common belief, but labelled-oxygen experiments showed the released O₂ comes from water.' }],
          ['Why is the leaf boiled in alcohol during the starch test?', 'To remove chlorophyll so the iodine colour is visible', ['To kill germs', 'To add starch', 'To make the leaf green'], 'The leaf turns pale after this step.', 'Alcohol dissolves chlorophyll; a pale leaf shows the blue-black colour clearly.'],
          ['Potassium hydroxide is kept in the bottle in Moll\'s experiment because it…', 'Absorbs carbon dioxide', ['Gives out oxygen', 'Absorbs light', 'Supplies water'], 'What must be removed to test its need?', 'KOH absorbs CO₂, so the enclosed part of the leaf has none.'],
          ['In a variegated Croton leaf, starch is found only in the…', 'Green parts', ['White parts', 'Whole leaf', 'Veins only'], 'Which parts have chlorophyll?', 'Only chlorophyll-containing parts photosynthesise.'],
          ['Glucose made in a leaf is mostly stored as…', 'Starch', ['Protein', 'Fat', 'Cellulose only'], 'Iodine tests for it.', 'Glucose is converted to starch for storage, which is why we test for starch.'],
        ]),
        tapT('tap-needs', 'Tap everything a leaf NEEDS for photosynthesis.', [
          ['Carbon dioxide', true], ['Water', true], ['Sunlight', true], ['Chlorophyll', true], ['Oxygen', false], ['Starch', false], ['Iodine', false],
        ], ['Needs = raw materials + conditions.', 'Oxygen and starch are products; iodine is only for testing.'], 'CO₂ and water are raw materials; light and chlorophyll are conditions.'),
        orderT('starch-test', 'Put the steps of the starch test on a leaf in order.', ['Keep the plant in the dark for 2 days', 'Expose the plant to sunlight for some hours', 'Boil the leaf in water', 'Boil the leaf in alcohol on a water bath', 'Rinse and add dilute iodine'],
          ['Destarching comes first.', 'Water boiling softens the leaf before alcohol removes chlorophyll.'], 'Destarch → light → boil in water → alcohol on water bath → iodine.'),
        tp('limiting', (r) => {
          const L0 = r.pick([2, 4, 5, 8, 10, 12, 15]);
          const C0 = r.pick([2, 3, 4, 5, 6, 8]);
          const rate = Math.min(3 * L0, 6 * C0);
          const lim = 3 * L0 <= 6 * C0 ? 'light' : 'carbon dioxide';
          return numQ(`In a model, a Hydrilla plant gives bubbles at rate = smaller of (3 × light) and (6 × CO₂). Light = ${L0} units, CO₂ = ${C0} units. How many bubbles per minute?`, rate,
            [`Work out both: 3 × ${L0} and 6 × ${C0}.`, 'The rate is the SMALLER of the two — the limiting factor wins.'],
            [`3 × ${L0} = ${3 * L0}; 6 × ${C0} = ${6 * C0}.`, `Smaller value = ${rate} bubbles per minute.`, `Here ${lim} is the limiting factor.`],
            [{ when: String(Math.max(3 * L0, 6 * C0)), explain: 'You took the larger value. The factor in SHORT supply limits the rate, so take the smaller.' }], 0.001, 'per min');
        }, 2),
      ],
    },
    {
      id: 'ts10.bs.photo.mechanism', title: 'Mechanism of photosynthesis: light and dark reactions', prereqs: ['ts10.bs.photo.needs'],
      intro: [
        h('Inside the food factory: the chloroplast'),
        photo('🍃', 'A single mango leaf has millions of cells, and each cell has dozens of chloroplasts — the green "kitchens" where sugar is made.'),
        p('Photosynthesis happens inside chloroplasts. A chloroplast has a double membrane. Inside are stacks of flat discs (thylakoids) piled like coins — each stack is a granum (plural grana). The fluid around the stacks is the stroma. Chlorophyll sits in the thylakoid membranes.'),
        def('Grana', 'Stacks of thylakoids in the chloroplast; they hold chlorophyll and carry out the light reaction.'),
        def('Stroma', 'The colourless fluid of the chloroplast around the grana; the dark reaction happens here.'),
        p('Photosynthesis is not one step. It runs in two linked stages: first light energy is captured, then that energy is used to build sugar.'),
        h('Stage 1: Light reaction (photochemical phase) — in the grana'),
        stepsB(
          'Chlorophyll absorbs light (photons) and becomes "excited" (energised).',
          'This energy splits water molecules: 2H₂O → 4H⁺ + 4e⁻ + O₂. Splitting water by light is called photolysis (Hill reaction, after Robert Hill).',
          'Oxygen escapes from the leaf as a by-product.',
          'The hydrogen is picked up by NADP to form NADPH (an energy-rich hydrogen carrier).',
          'Energy is also stored in ATP (adenosine triphosphate).',
        ),
        def('Photolysis', 'Splitting of water molecules using light energy during the light reaction; it releases oxygen.'),
        def('ATP', 'Adenosine triphosphate — the energy "currency" molecule of cells.'),
        h('Stage 2: Dark reaction (light-independent phase) — in the stroma'),
        stepsB(
          'Carbon dioxide from the air enters the stroma.',
          'CO₂ is joined to a 5-carbon acceptor sugar (RuBP) — this is carbon fixation.',
          'Using the ATP and NADPH from the light reaction, the fixed carbon is reduced step by step (the Calvin cycle).',
          'Glucose (C₆H₁₂O₆) is formed; the acceptor is regenerated to fix more CO₂.',
          'Glucose is converted into starch for storage.',
        ),
        p('"Dark" reaction does not mean it happens at night. It simply does not need light directly. It runs in daytime, using the ATP and NADPH made in the light. Melvin Calvin traced this path using radioactive carbon in the alga Chlorella.'),
        keys('Light reaction: grana; needs light; splits water; releases O₂; makes ATP and NADPH.', 'Dark reaction: stroma; no direct light needed; fixes CO₂; uses ATP + NADPH; makes glucose.', 'The two stages are linked: the dark reaction runs on the products of the light reaction.'),
        remember('Exam trap: O₂ is released in the LIGHT reaction (from water). CO₂ is used in the DARK reaction.'),
        tip('Memory hook: "Grana Get light, Stroma Stores sugar."'),
      ],
      examples: [
        ex('A plant is given water containing heavy oxygen (¹⁸O) and normal CO₂. Where will the ¹⁸O appear?', ['Water is split in the light reaction (photolysis).', 'The oxygen of water is released as O₂ gas.', 'So the labelled oxygen appears in the O₂ given out.'], 'In the oxygen gas released by the plant.'),
        ex('Arjun says, "The dark reaction happens only at night." Correct him.', ['The dark reaction needs ATP and NADPH.', 'These are made only in the light reaction, which needs light.', 'So the dark reaction runs during the day, right after the light reaction; it just does not use light directly.'], 'It is light-independent, not night-time; it happens in daytime using products of the light reaction.'),
      ],
      practice: [
        matchT('match', 'term to what it does or where it happens', [
          ['Grana', 'Site of the light reaction'], ['Stroma', 'Site of the dark reaction'], ['Photolysis', 'Splitting water by light'],
          ['NADPH', 'Carries hydrogen to the dark reaction'], ['ATP', 'Energy currency of the cell'], ['RuBP', 'Accepts CO₂ in carbon fixation'],
        ], ['Two of these are places in the chloroplast.', 'NADPH carries hydrogen; ATP carries energy.']),
        orderT('light-order', 'Put the events of the light reaction in order.', ['Chlorophyll absorbs light', 'Chlorophyll becomes excited', 'Water is split (photolysis)', 'Oxygen is released', 'NADPH and ATP are formed'],
          ['Light must be absorbed before anything else.', 'Splitting water gives the hydrogen that forms NADPH.'], 'Absorb light → excitation → photolysis → O₂ out → NADPH + ATP.'),
        mcq('stages', 'Ask: does this step need light directly, and does it make or use ATP?', [
          ['Where does the dark reaction take place?', 'Stroma', ['Grana', 'Mitochondria', 'Nucleus'], 'It is the fluid part of the chloroplast.', 'The Calvin cycle enzymes are in the stroma.', { Grana: 'Grana carry out the LIGHT reaction.' }],
          ['Which is a product of the light reaction?', 'NADPH', ['Glucose', 'Carbon dioxide', 'Starch'], 'Glucose comes later.', 'The light reaction produces O₂, ATP and NADPH.'],
          ['Photolysis of water was discovered by…', 'Robert Hill', ['Melvin Calvin', 'Joseph Priestley', 'Gregor Mendel'], 'The reaction is named after him.', 'It is also called the Hill reaction.'],
          ['Which substance is fixed in the dark reaction?', 'Carbon dioxide', ['Oxygen', 'Water', 'Nitrogen'], 'Carbon has to come from the air.', 'CO₂ is fixed onto RuBP and reduced to sugar.'],
          ['What would happen to the dark reaction if light reactions stopped?', 'It would soon stop for lack of ATP and NADPH', ['It would speed up', 'Nothing — it is independent', 'It would make oxygen'], 'Where does its energy come from?', 'The dark reaction depends on ATP and NADPH from the light reaction.'],
          ['In which organism did Calvin trace the path of carbon?', 'Chlorella (an alga)', ['Hydrilla', 'Mango', 'Yeast'], 'A single-celled green alga.', 'Calvin used radioactive carbon in Chlorella.'],
        ]),
        tapT('tap-light', 'Tap every statement that is TRUE about the LIGHT reaction.', [
          ['It takes place in the grana', true], ['Water is split', true], ['Oxygen is released', true], ['ATP is formed', true],
          ['CO₂ is fixed into sugar', false], ['It takes place in the stroma', false], ['Glucose is its main product', false],
        ], ['Light reaction = capture energy, split water.', 'Sugar-making is the dark reaction.'], 'Light reaction: grana, photolysis, O₂, ATP, NADPH. CO₂ fixation and glucose belong to the dark reaction.'),
      ],
    },
    {
      id: 'ts10.bs.nutrition.hetero', title: 'Heterotrophic nutrition: saprophytes, parasites and holozoic feeders', prereqs: ['ts10.bs.photo.needs'],
      intro: [
        h('Living on food made by others'),
        photo('🌳', 'A neem tree in a Warangal school yard. Sometimes a leafless yellow thread twines around such trees — that is Cuscuta, a plant that steals its food.'),
        p('Animals, fungi and many bacteria cannot make food. They are heterotrophs (hetero = other): they get ready-made food from other organisms. But they do this in very different ways.'),
        def('Heterotroph', 'An organism that cannot make its own food and depends on other organisms for it.'),
        def('Saprophyte', 'An organism that feeds on dead and decaying matter by digesting it outside its body and absorbing the products. Examples: bread mould, mushrooms, yeast.'),
        def('Parasite', 'An organism that lives on or in another living organism (the host) and takes food from it, usually harming it without killing it at once. Examples: Cuscuta, lice, leeches, tapeworms.'),
        def('Holozoic nutrition', 'Taking in whole food and breaking it down inside the body. Examples: Amoeba, Paramoecium, humans.'),
        h('Cuscuta: a plant parasite'),
        p('Cuscuta (dodder) is a leafless, twining plant with almost no chlorophyll. Its thin yellow stem coils around a host plant and pushes root-like suckers called haustoria into the host\'s stem. Through them it draws water from the host\'s xylem and food from its phloem.'),
        def('Haustoria', 'Root-like sucking structures of a parasitic plant that penetrate the host\'s tissues to absorb water and food.'),
        h('Holozoic feeding in single cells'),
        stepsB(
          'Amoeba: pushes out temporary finger-like pseudopodia around a food particle.',
          'The pseudopodia fuse, enclosing the food in a food vacuole.',
          'Enzymes digest the food inside the vacuole; simple products diffuse into the cytoplasm.',
          'Undigested remains are thrown out at the cell surface.',
        ),
        p('Paramoecium has a fixed slipper shape. Hair-like cilia sweep food to one spot, the cytostome (cell mouth). Waste leaves through a fixed anal pore (cytopyge).'),
        p('Holozoic nutrition always has five steps: ingestion → digestion → absorption → assimilation → egestion.'),
        keys('Heterotrophs depend on other organisms for food.', 'Saprophytes digest dead matter outside the body; parasites feed on living hosts; holozoic feeders swallow food and digest it inside.', 'Cuscuta uses haustoria; Amoeba uses pseudopodia; Paramoecium uses cilia and a cytostome.'),
        remember('Exam trap: a parasite usually does not kill its host quickly — it needs the host alive to keep feeding.'),
        tip('Memory hook: SAP = dead stuff (sap from a dead log); PARA = "beside" a living host; HOLO = whole food.'),
      ],
      examples: [
        ex('Bread left in a damp box in Hyderabad grows black fuzz. How is the fuzz feeding?', ['The fuzz is bread mould, a fungus.', 'It releases enzymes onto the bread and absorbs the digested food.', 'It feeds on non-living organic matter.'], 'Saprophytic nutrition.'),
        ex('Trace how Amoeba feeds on a bacterium, naming each step.', ['Ingestion: pseudopodia surround the bacterium → food vacuole.', 'Digestion: enzymes break it down in the vacuole.', 'Absorption: products diffuse into cytoplasm.', 'Assimilation: used to make new cell material and energy.', 'Egestion: undigested matter is thrown out.'], 'Ingestion → digestion → absorption → assimilation → egestion (holozoic).'),
      ],
      practice: [
        matchT('match', 'organism to its mode of nutrition', [
          ['Mushroom', 'Saprophytic'], ['Cuscuta', 'Parasitic (plant)'], ['Amoeba', 'Holozoic'], ['Tapeworm', 'Parasitic (animal)'], ['Mango tree', 'Autotrophic'], ['Bread mould', 'Saprophytic (fungus)'],
        ], ['Green trees make their own food.', 'Cuscuta has haustoria; tapeworms live in intestines.']),
        mcq('modes', 'Ask: living host, dead matter, or whole food swallowed?', [
          ['Haustoria are found in…', 'Cuscuta', ['Amoeba', 'Mushroom', 'Paramoecium'], 'A parasitic plant.', 'Cuscuta pushes haustoria into the host plant.'],
          ['Pseudopodia help Amoeba to…', 'Capture food', ['Make food', 'Absorb sunlight', 'Release oxygen'], 'Pseudo-podia = false feet.', 'Pseudopodia surround the food particle to form a food vacuole.'],
          ['In Paramoecium, food enters through the…', 'Cytostome', ['Anal pore', 'Contractile vacuole', 'Pseudopodium'], 'A fixed "cell mouth".', 'Cilia sweep food to the cytostome.'],
          ['Which organism digests food OUTSIDE its body?', 'Yeast', ['Amoeba', 'Human', 'Cow'], 'Saprophytes do this.', 'Saprophytes release enzymes outside and absorb the products.'],
          ['Which is the correct order of holozoic nutrition?', 'Ingestion, digestion, absorption, assimilation, egestion', ['Digestion, ingestion, egestion, absorption, assimilation', 'Absorption, ingestion, digestion, egestion, assimilation', 'Ingestion, egestion, digestion, absorption, assimilation'], 'Food must enter before it can be digested.', 'Take in → break down → absorb → use → remove waste.'],
          ['Cuscuta draws food from the host\'s…', 'Phloem', ['Xylem only', 'Root hairs', 'Stomata'], 'Food (sugar) travels in one tissue, water in another.', 'Water comes from xylem; food from phloem.'],
        ]),
        orderT('holozoic', 'Arrange the steps of holozoic nutrition.', ['Ingestion', 'Digestion', 'Absorption', 'Assimilation', 'Egestion'], ['Taking food in is first.', 'Removing waste is last.'], 'Ingestion → digestion → absorption → assimilation → egestion.'),
      ],
    },
    {
      id: 'ts10.bs.digestion.system', title: 'The human digestive system: organs, juices and enzymes', prereqs: ['ts10.bs.nutrition.hetero'],
      intro: [
        h('The journey of a plate of rice and dal'),
        photo('🥄', 'A spoonful of rice, dal and ghee holds starch, protein and fat — three different molecules that need three different enzymes to be broken down.'),
        p('Food we eat is made of large molecules — starch, proteins and fats. The blood cannot carry them and cells cannot use them. Digestion breaks them into small, soluble molecules that can pass through the intestine wall into the blood. This happens in the alimentary canal, a muscular tube about 8–9 m long from mouth to anus, helped by glands that pour juices into it.'),
        def('Digestion', 'The breakdown of large, insoluble food molecules into small, soluble ones that can be absorbed.'),
        def('Enzyme', 'A protein that speeds up a chemical reaction in the body without being used up. Each digestive enzyme acts on one type of food.'),
        h('Organ by organ'),
        stepsB(
          'Mouth: teeth chew food; saliva from salivary glands contains salivary amylase, which turns starch into maltose.',
          'Oesophagus (food pipe): moves the food ball (bolus) down by waves of muscle contraction (peristalsis). No digestion here.',
          'Stomach: gastric glands release hydrochloric acid (kills germs, makes the medium acidic), pepsin (starts protein digestion into peptides) and mucus (protects the stomach wall). Food is churned into a paste called chyme.',
          'Duodenum (first part of small intestine): bile from the liver (stored in the gall bladder) breaks fat into tiny droplets (emulsification). Pancreatic juice brings trypsin (proteins), amylase (starch) and lipase (fats).',
          'Rest of small intestine: intestinal juice finishes digestion — carbohydrates → glucose, proteins → amino acids, fats → fatty acids and glycerol.',
          'Absorption: millions of finger-like villi in the small intestine absorb the digested food into blood capillaries (and fats into lacteals).',
          'Large intestine: absorbs most remaining water; undigested waste is stored in the rectum and removed through the anus (egestion).',
        ),
        def('Bile', 'A greenish-yellow juice made by the liver and stored in the gall bladder. It has no enzymes; it emulsifies fats and makes the medium alkaline.'),
        def('Villi', 'Tiny finger-like projections of the inner wall of the small intestine that greatly increase the surface area for absorption.'),
        h('Labelled diagram as a list'),
        p('Mouth → pharynx → oesophagus → stomach → duodenum (with liver, gall bladder and pancreas opening into it) → jejunum and ileum (small intestine, about 6–7 m) → caecum and appendix → colon (large intestine, about 1.5 m) → rectum → anus.'),
        keys('Starch → maltose → glucose (amylase in saliva and pancreatic juice; enzymes of intestinal juice).', 'Proteins → peptides → amino acids (pepsin, trypsin, intestinal enzymes).', 'Fats → fatty acids + glycerol (bile emulsifies; lipase digests).', 'Absorption happens mainly in the villi of the small intestine; water mainly in the large intestine.'),
        remember('Exam trap: bile contains NO enzyme. It only emulsifies fats. The liver is the largest gland in the body.'),
        tip('Memory hook — what digests what: "Amylase → starch, Pepsin/Protease → protein, Lipase → lipid (fat)". The first letters match the food.'),
      ],
      examples: [
        ex('Trace a piece of paneer (mostly protein and fat) from mouth to blood.', ['Mouth: chewed and mixed with saliva (no protein digestion yet).', 'Stomach: HCl and pepsin break protein into peptides.', 'Duodenum: bile emulsifies the fat; trypsin continues protein digestion; lipase starts fat digestion.', 'Small intestine: peptides → amino acids; fats → fatty acids + glycerol.', 'Villi absorb amino acids into blood and fats into lacteals.'], 'Mouth → stomach (pepsin) → duodenum (bile, trypsin, lipase) → intestine → villi.'),
        ex('Kiran chews a piece of plain rice for two minutes and it starts tasting sweet. Why?', ['Rice is mostly starch, which is not sweet.', 'Salivary amylase breaks starch into maltose.', 'Maltose is a sugar, so it tastes sweet.'], 'Salivary amylase turns starch into sweet maltose.'),
      ],
      practice: [
        matchT('enzyme', 'enzyme or juice to its job', [
          ['Salivary amylase', 'Starch → maltose'], ['Pepsin', 'Proteins → peptides in the stomach'], ['Bile', 'Emulsifies fats'], ['Lipase', 'Fats → fatty acids + glycerol'],
          ['Hydrochloric acid', 'Kills germs and makes the stomach acidic'], ['Trypsin', 'Digests proteins in the small intestine'],
        ], ['Match the first letters: amylase–starch, lipase–lipid.', 'Bile is the one with no enzyme.']),
        orderT('path', 'Arrange the parts of the alimentary canal in the order food passes through them.', ['Mouth', 'Oesophagus', 'Stomach', 'Small intestine', 'Large intestine', 'Rectum'],
          ['The food pipe joins mouth and stomach.', 'Water is absorbed after the small intestine.'], 'Mouth → oesophagus → stomach → small intestine → large intestine → rectum → anus.'),
        mcq('digestion', 'Decide which food the juice acts on and where it is made.', [
          ['Where is most digested food absorbed?', 'Small intestine', ['Stomach', 'Large intestine', 'Oesophagus'], 'Look for villi.', 'Villi in the small intestine absorb digested food.', { 'Large intestine': 'The large intestine mainly absorbs water, not food.' }],
          ['Bile is produced by the…', 'Liver', ['Gall bladder', 'Pancreas', 'Stomach'], 'One organ makes it; another stores it.', 'The liver makes bile; the gall bladder only stores it.', { 'Gall bladder': 'The gall bladder stores bile — the liver produces it.' }],
          ['The end product of protein digestion is…', 'Amino acids', ['Glucose', 'Fatty acids', 'Maltose'], 'Proteins are built from these units.', 'Proteins are broken down to amino acids.'],
          ['Why does the stomach not digest itself?', 'Mucus lines and protects its wall', ['It has no enzymes', 'Pepsin works only on food', 'The acid is weak'], 'Something coats the wall.', 'A layer of mucus protects the stomach lining from acid and pepsin.'],
          ['Which part has no digestive enzymes of its own?', 'Oesophagus', ['Stomach', 'Mouth', 'Small intestine'], 'Its job is only to move food.', 'The oesophagus only transports food by peristalsis.'],
          ['Finger-like projections that increase absorption area are…', 'Villi', ['Cilia', 'Alveoli', 'Nephrons'], 'Found in the small intestine.', 'Villi give a very large surface area for absorption.'],
        ]),
        tapT('tap-small', 'Tap every juice that acts on food in the SMALL INTESTINE.', [
          ['Bile', true], ['Pancreatic juice', true], ['Intestinal juice', true], ['Saliva', false], ['Gastric juice', false],
        ], ['Three juices meet the food after the stomach.', 'Saliva acts in the mouth; gastric juice in the stomach.'], 'Bile, pancreatic juice and intestinal juice all act in the small intestine.', 5),
      ],
    },
    {
      id: 'ts10.bs.nutrition.malnutrition', title: 'Malnutrition and vitamin deficiency diseases', prereqs: ['ts10.bs.digestion.system'],
      intro: [
        h('Full stomach, empty nutrition?'),
        photo('🥕', 'Carrots, papaya and leafy greens are rich in vitamin A — the vitamin that protects night vision.'),
        p('A child can eat rice three times a day and still be malnourished. Malnutrition means the diet does not have the right amounts of one or more nutrients — too little, or sometimes too much. A balanced diet has carbohydrates, proteins, fats, vitamins, minerals, fibre and water in the right proportions.'),
        def('Malnutrition', 'A condition caused by a diet lacking (or having an excess of) one or more nutrients in the required amounts.'),
        def('Balanced diet', 'A diet that provides all nutrients in the right amounts for growth, energy and health.'),
        h('Protein–energy malnutrition in children'),
        def('Kwashiorkor', 'Caused mainly by lack of PROTEIN even when some calories are eaten. Signs: swollen legs and face (water collects in tissues), pot belly, poor muscles, dry skin, diarrhoea.'),
        def('Marasmus', 'Caused by lack of BOTH protein and calories (energy). Signs: very thin "skin and bones" body, wasted muscles, dry skin, diarrhoea. Often seen when babies are weaned too early or births are too close together.'),
        def('Obesity', 'Too much body fat from regularly eating more energy than the body uses. It raises the risk of heart, kidney, gall bladder and joint problems and diabetes.'),
        h('Vitamins and their deficiency diseases'),
        p('Vitamins are needed only in tiny amounts but the body cannot make most of them, so they must come from food (bacteria in our intestine make some, like B12 and K; sunlight on the skin makes vitamin D). Fat-soluble vitamins are A, D, E, K. Water-soluble vitamins are the B group and C.'),
        stepsB(
          'Vitamin A (retinol) — carrots, papaya, mango, leafy greens, milk, eggs → night blindness, xerophthalmia (dry eyes), scaly skin.',
          'Vitamin B1 (thiamine) — cereals, pulses, milk, eggs → beriberi (weakness, nerve damage, loss of appetite).',
          'Vitamin B2 (riboflavin) — milk, eggs, green leafy vegetables → glossitis: sore red tongue, cracks at the corners of the mouth.',
          'Vitamin B3 (niacin) — meat, fish, groundnuts, cereals → pellagra (dermatitis, diarrhoea, memory loss).',
          'Vitamin B12 (cyanocobalamin) — made by gut bacteria; milk, eggs, meat → pernicious anaemia.',
          'Vitamin C (ascorbic acid) — amla, guava, citrus, sprouts → scurvy (bleeding gums, slow wound healing).',
          'Vitamin D (calciferol, "sunshine vitamin") — sunlight, milk, eggs, fish-liver oil → rickets in children (soft, bent bones, knock-knees).',
          'Vitamin E (tocopherol) — vegetable oils, sprouts, nuts → linked in the textbook to fertility problems (deficiency is rare).',
          'Vitamin K — leafy vegetables; made by gut bacteria → delayed blood clotting, excess bleeding.',
        ),
        h('Body Mass Index — a quick check for adults'),
        f('BMI = mass (kg) ÷ [height (m)]²', 'B M I equals mass in kilograms divided by height in metres squared'),
        xp({
          title: 'What if? Body Mass Index', formula: 'BMI = m / h²',
          res: ['BMI', 'Body Mass Index', 'kg/m²', 'm / h^2', 1],
          vars: [['m', 'Body mass', 'kg', 25, 120, 1, 60], ['h', 'Height', 'm', 1.3, 1.95, 0.01, 1.65]],
          notes: [
            ['m', 'More mass at the same height raises BMI in direct proportion.', 'Less mass at the same height lowers BMI.'],
            ['h', 'A taller person with the same mass has a lower BMI — and because height is squared, BMI falls quickly.', 'A shorter person with the same mass has a higher BMI.'],
          ],
          mistakes: [
            ['Using height in centimetres (165 instead of 1.65)', 'Height must be in metres; using cm gives a tiny, meaningless BMI.'],
            ['Dividing by height, not height squared', 'BMI = m ÷ h²; forgetting to square gives a number about 1.6 times too large for most adults.'],
            ['Using adult cut-offs for teenagers', 'For people under 18, doctors compare BMI with age-and-sex growth charts. The adult bands (18.5–24.9 normal) are for adults.'],
          ],
          real: 'For adults, BMI below 18.5 is underweight, 18.5–24.9 is normal, 25–29.9 is overweight and 30 or more is obese. It is a screening number, not a diagnosis.',
        }),
        keys('Kwashiorkor = protein lack (swelling); marasmus = protein + calorie lack (wasting).', 'Fat-soluble: A, D, E, K. Water-soluble: B group, C.', 'A → night blindness; B1 → beriberi; B3 → pellagra; C → scurvy; D → rickets; K → poor clotting.'),
        remember('Exam trap: the swollen belly in kwashiorkor is due to water in tissues, not fat. Marasmus has no swelling.'),
        tip('Memory hook: "Anaemia, Beriberi, Scurvy, Rickets" — but match the right letter: A-Night, B1-Beri, C-Scurvy, D-Rickets (bones need the Daylight vitamin).'),
      ],
      examples: [
        ex('A 2-year-old fed mostly on rice water has swollen legs and a puffy face, though not extremely thin. Which condition is likely and why?', ['Swelling (oedema) is the key sign.', 'Rice water gives some calories but almost no protein.', 'Protein lack with some calories → kwashiorkor.'], 'Kwashiorkor (protein deficiency).'),
        ex('An adult\'s mass is 72 kg and height is 1.6 m. Find the BMI and the adult category.', ['h² = 1.6 × 1.6 = 2.56', 'BMI = 72 ÷ 2.56 = 28.1', '25–29.9 is the overweight band.'], 'BMI ≈ 28.1 — overweight.'),
        ex('Lakshmi\'s gums bleed and her small cuts heal slowly. Which vitamin is lacking, and which local fruits would help?', ['Bleeding gums and slow healing are signs of scurvy.', 'Scurvy is caused by lack of vitamin C.', 'Amla, guava, oranges and lemons are rich in vitamin C.'], 'Vitamin C; eat amla, guava, citrus fruits.'),
      ],
      practice: [
        matchT('vitamin', 'vitamin to its deficiency disease', [
          ['Vitamin A', 'Night blindness'], ['Vitamin B1', 'Beriberi'], ['Vitamin B3', 'Pellagra'], ['Vitamin C', 'Scurvy'], ['Vitamin D', 'Rickets'], ['Vitamin K', 'Delayed blood clotting'], ['Vitamin B12', 'Pernicious anaemia'],
        ], ['D is the sunshine vitamin needed for bones.', 'K helps blood clot.']),
        mcq('mal', 'Decide whether protein, energy or a vitamin is missing.', [
          ['Swollen legs and face with poor muscles in a child suggest…', 'Kwashiorkor', ['Marasmus', 'Obesity', 'Scurvy'], 'Swelling is the clue.', 'Protein lack causes water to collect in tissues: kwashiorkor.', { Marasmus: 'Marasmus shows wasting (thinness), not swelling.' }],
          ['Lack of both proteins and calories causes…', 'Marasmus', ['Kwashiorkor', 'Rickets', 'Goitre'], 'Think "wasting".', 'Marasmus is protein–energy deficiency with severe thinness.'],
          ['Which group contains only fat-soluble vitamins?', 'A, D, E, K', ['B, C', 'A, B, C', 'C, D, K'], 'Remember "ADEK".', 'A, D, E and K dissolve in fat.'],
          ['Which vitamin is made in the skin in sunlight?', 'Vitamin D', ['Vitamin A', 'Vitamin C', 'Vitamin B1'], 'It is the "sunshine vitamin".', 'Sunlight on the skin produces vitamin D.'],
          ['Bleeding gums and slow healing of wounds point to lack of…', 'Vitamin C', ['Vitamin A', 'Vitamin D', 'Vitamin K'], 'Citrus fruits prevent it.', 'Vitamin C deficiency causes scurvy.'],
          ['Which vitamin is made by bacteria in our intestine?', 'Vitamin K', ['Vitamin C', 'Vitamin A', 'Vitamin D'], 'It is also needed for clotting.', 'Gut bacteria make vitamin K (and B12).'],
        ]),
        tp('bmi', (r) => {
          const hgt = r.pick([1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8]);
          const m = r.pick([45, 50, 55, 60, 64, 70, 75, 80, 90]);
          const b = rd(m / (hgt * hgt), 1);
          const band = b < 18.5 ? 'underweight' : b < 25 ? 'normal' : b < 30 ? 'overweight' : 'obese';
          return numQ(`An adult has a mass of ${m} kg and height ${hgt} m. Calculate the BMI (1 decimal place).`, b,
            ['BMI = mass ÷ height².', `First square the height: ${hgt} × ${hgt}.`],
            [`h² = ${rd(hgt * hgt, 4)}`, `BMI = ${m} ÷ ${rd(hgt * hgt, 4)} = ${b}`, `Adult category: ${band}.`],
            [{ when: String(rd(m / hgt, 1)), explain: 'You divided by height only. BMI divides by height SQUARED.' }], 0.01, 'kg/m²');
        }, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Respiration
// =====================================================================================
const ch2: USpec = {
  id: 'ts10.bs.ch2', subject: 'biology', title: 'Respiration', source: src(2),
  objectives: [
    {
      id: 'ts10.bs.resp.gases', title: 'Discovery of the respiratory gases and the steps of respiration', prereqs: [],
      intro: [
        h('A candle, a mouse and a mint plant'),
        photo('🕯️', 'A candle under a closed glass jar soon goes out. Eighteenth-century scientists used experiments like this to work out what air contains.'),
        p('Three hundred years ago nobody knew that air is a mixture of gases, or why we must breathe. A few careful experiments changed that.'),
        stepsB(
          'Joseph Black (1750s) found that a gas given off by heating limestone turned lime water milky. He called it "fixed air" — today we call it carbon dioxide. He also found it in breathed-out air.',
          'Joseph Priestley (1770s) found that a candle in a closed jar went out and a mouse in it could not live. When he placed a mint plant in the jar, the air was "restored" and the candle could burn again. In 1774 he isolated a gas that made things burn brightly — oxygen.',
          'Antoine Lavoisier named oxygen and showed that breathing is like slow burning: oxygen is used and fixed air (CO₂) and water are given out, with heat released.',
        ),
        def('Respiration', 'The whole process of taking in oxygen, using it in cells to release energy from food, and giving out carbon dioxide.'),
        def('Lime water test', 'Clear lime water turns milky when carbon dioxide is bubbled through it.'),
        h('Respiration is five steps, not one'),
        stepsB(
          'Breathing (ventilation): air is moved into and out of the lungs.',
          'External gas exchange: in the alveoli, O₂ passes into blood and CO₂ passes out.',
          'Transport of gases: blood carries O₂ (mostly on haemoglobin in red blood cells) to tissues and brings CO₂ back.',
          'Internal gas exchange: at the tissues, O₂ enters cells and CO₂ leaves them.',
          'Cellular respiration: inside cells, glucose is broken down using O₂ to release energy (ATP).',
        ),
        p('Breathing is physical — just moving air. Cellular respiration is chemical — it is where energy is actually released. Do not mix them up.'),
        keys('Black: fixed air (CO₂). Priestley: plants restore air; isolated oxygen (1774). Lavoisier: named oxygen; respiration resembles combustion.', 'Five steps: breathing → exchange in lungs → transport → exchange in tissues → cellular respiration.', 'Breathing is a physical process; cellular respiration is a chemical process.'),
        remember('Exam trap: "breathing" and "respiration" are not the same. Breathing is only the first step of respiration.'),
        tip('Memory hook for the steps: "Breathe, Swap, Ship, Swap, Burn".'),
      ],
      examples: [
        ex('Priestley kept a mouse in a closed jar with a mint plant in sunlight. The mouse survived longer than one kept alone. Explain.', ['The mouse uses oxygen and gives out CO₂.', 'The mint plant, in light, uses CO₂ and releases O₂ (photosynthesis).', 'So the air stays breathable for longer.'], 'The plant restored oxygen through photosynthesis.'),
        ex('Ravi blows through a straw into lime water. What happens and what does it show?', ['Exhaled air contains about 4% CO₂ (inhaled air has only about 0.04%).', 'CO₂ reacts with lime water to form white calcium carbonate.'], 'Lime water turns milky — exhaled air is rich in carbon dioxide.'),
      ],
      practice: [
        orderT('steps', 'Put the steps of respiration in the correct order.', ['Breathing', 'Gas exchange in the alveoli', 'Transport of gases by blood', 'Gas exchange at the tissues', 'Cellular respiration'],
          ['Air must reach the lungs first.', 'Energy is released only at the last step, inside cells.'], 'Breathing → lungs exchange → transport → tissue exchange → cellular respiration.'),
        matchT('scientists', 'scientist to discovery', [
          ['Joseph Black', 'Fixed air (carbon dioxide)'], ['Joseph Priestley', 'Plants restore air; isolated oxygen'], ['Antoine Lavoisier', 'Named oxygen; respiration is like burning'],
          ['Robert Hill', 'Photolysis of water'], ['Melvin Calvin', 'Path of carbon in photosynthesis'],
        ], ['Black named a gas that was "fixed" in limestone.', 'Lavoisier compared breathing with combustion.']),
        mcq('basics', 'Separate the physical step (breathing) from the chemical step (cellular respiration).', [
          ['Lime water turns milky because of…', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Water vapour'], 'Black\'s "fixed air".', 'CO₂ forms white calcium carbonate with lime water.'],
          ['Energy is actually released during…', 'Cellular respiration', ['Breathing', 'Transport of gases', 'Gas exchange in lungs'], 'Where is glucose broken down?', 'Only the chemical breakdown of glucose in cells releases energy.', { Breathing: 'Breathing only moves air; it releases no energy from food.' }],
          ['Who first showed that green plants can "restore" air spoiled by a candle?', 'Joseph Priestley', ['Joseph Black', 'Lavoisier', 'Darwin'], 'Mint plant in a jar.', 'Priestley\'s mint-and-candle experiment.'],
          ['Lavoisier compared respiration with…', 'Combustion (burning)', ['Freezing', 'Evaporation', 'Photosynthesis'], 'Both use oxygen and give out CO₂ and heat.', 'Respiration is like slow, controlled burning of food.'],
          ['Which gas is carried mainly by haemoglobin?', 'Oxygen', ['Nitrogen', 'Carbon monoxide only', 'Hydrogen'], 'Red blood cells carry it to tissues.', 'Haemoglobin binds oxygen in the lungs and releases it in tissues.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.resp.airpath', title: 'Pathway of air, breathing mechanism and gas exchange', prereqs: ['ts10.bs.resp.gases'],
      intro: [
        h('From your nose to 300 million tiny balloons'),
        photo('👃', 'Hairs and sticky mucus inside the nose trap dust — which is why you sneeze when you sweep a dusty room in summer.'),
        p('Each breath travels down a branching tube system like the roots of an upside-down tree, ending in hundreds of millions of tiny air sacs.'),
        stepsB(
          'Nostrils → nasal cavity: hairs and mucus filter dust; air is warmed and moistened.',
          'Pharynx (throat): common passage for food and air.',
          'Larynx (voice box): has the vocal cords. A flap, the epiglottis, closes it when you swallow so food does not enter the windpipe.',
          'Trachea (windpipe): kept open by C-shaped rings of cartilage; lined with cilia and mucus that sweep dirt upward.',
          'Bronchi: the trachea divides into two bronchi, one to each lung.',
          'Bronchioles: finer and finer branches inside the lungs.',
          'Alveoli: tiny thin-walled air sacs covered with blood capillaries — where gases are exchanged.',
        ),
        def('Epiglottis', 'A lid-like flap that covers the larynx during swallowing, stopping food from entering the trachea.'),
        def('Alveoli', 'Microscopic air sacs at the ends of bronchioles; their thin, moist walls and rich blood supply make gas exchange fast.'),
        h('How breathing works — the diaphragm pump'),
        stepsB(
          'Inhalation: the diaphragm contracts and flattens; rib muscles pull the ribs up and out.',
          'The chest cavity gets bigger, so air pressure in the lungs falls below outside pressure.',
          'Air rushes in to fill the lungs.',
          'Exhalation: the diaphragm relaxes and domes upward; ribs move down and in.',
          'The chest cavity gets smaller, pressure rises, and air is pushed out.',
        ),
        h('Gas exchange by diffusion'),
        p('Air in the alveoli has more oxygen than the blood arriving from the body, so O₂ diffuses into the blood. Blood has more CO₂, so CO₂ diffuses into the alveoli. The total alveolar surface in an adult is around 70 m² — close to the floor of a badminton court — so exchange is quick.'),
        p('Inhaled air has about 21% O₂ and 0.04% CO₂. Exhaled air has about 16% O₂ and 4% CO₂, and is warmer and moister.'),
        xp({
          title: 'What if? Air moved per minute (minute ventilation)', formula: 'V = f × TV',
          res: ['V', 'Air breathed per minute', 'L/min', 'f * TV', 1],
          vars: [['f', 'Breathing rate', 'breaths/min', 8, 50, 1, 15], ['TV', 'Tidal volume (air per breath)', 'L', 0.3, 3, 0.1, 0.5]],
          notes: [
            ['f', 'Breathing faster (during exercise or fever) moves more air per minute.', 'Breathing slower (during sleep) moves less air.'],
            ['TV', 'Deeper breaths move more air with every breath — athletes take deep breaths.', 'Shallow breaths move little air, even if the rate is high.'],
          ],
          mistakes: [
            ['Thinking only breathing rate matters', 'Air moved depends on BOTH rate and depth: V = f × TV.'],
            ['Mixing mL and L', 'A resting tidal volume of 500 mL is 0.5 L. Keep one unit throughout.'],
          ],
          real: 'At rest an adult takes about 12–18 breaths of about 0.5 L each — roughly 6–9 L of air a minute. In a sprint this can rise more than ten times.',
        }),
        keys('Path: nostrils → nasal cavity → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.', 'Inhale: diaphragm contracts (flattens), chest enlarges, pressure falls, air enters.', 'Gases are exchanged by diffusion across thin alveolar walls.'),
        remember('Exam trap: during inhalation the diaphragm CONTRACTS and moves DOWN. Air moves in because pressure falls — the lungs do not "suck" by themselves.'),
        tip('Memory hook for the path: "Never Put Large Turtles Between Big Alligators" — Nose, Pharynx, Larynx, Trachea, Bronchi, Bronchioles, Alveoli.'),
      ],
      examples: [
        ex('Why do we sometimes cough violently when we laugh while eating?', ['When we swallow, the epiglottis closes the larynx.', 'Laughing needs air flow through the larynx, so the epiglottis opens.', 'A bit of food can slip into the windpipe and a cough reflex throws it out.'], 'Food enters the larynx because the epiglottis is open while laughing.'),
        ex('Sana breathes 16 times a minute with 0.5 L per breath. How much air does she breathe in a minute?', ['V = f × TV', 'V = 16 × 0.5', 'V = 8 L'], '8 litres per minute'),
      ],
      practice: [
        orderT('path', 'Arrange the pathway of air into the lungs.', ['Nostrils', 'Nasal cavity', 'Pharynx', 'Larynx', 'Trachea', 'Bronchi', 'Bronchioles', 'Alveoli'],
          ['Air is filtered in the nose first.', 'The voice box comes before the windpipe.'], 'Nostrils → nasal cavity → pharynx → larynx → trachea → bronchi → bronchioles → alveoli.', 2),
        tp('vent', (r) => {
          const fr = r.pick([12, 14, 15, 16, 18, 20, 24, 30, 40]);
          const tv = r.pick([0.4, 0.5, 0.6, 0.8, 1, 1.5, 2]);
          const v = rd(fr * tv, 2);
          return numQ(`${who(r)} breathes ${fr} times per minute, taking in ${tv} L of air each breath. How many litres of air are breathed in per minute?`, v,
            ['Air per minute = breaths per minute × air per breath.', `${fr} × ${tv}`],
            [`V = ${fr} × ${tv} = ${v} L per minute.`],
            [{ when: String(rd(fr + tv, 2)), explain: 'Multiply, do not add: each breath brings in the tidal volume.' }], 0.01, 'L/min');
        }),
        mcq('mech', 'Think about volume and pressure in the chest.', [
          ['During inhalation the diaphragm…', 'Contracts and flattens', ['Relaxes and domes up', 'Does not move', 'Pushes air out'], 'Contracting muscle shortens.', 'A contracting diaphragm flattens and enlarges the chest.', { 'Relaxes and domes up': 'That happens during exhalation.' }],
          ['Air enters the lungs because…', 'Pressure inside the chest falls below outside pressure', ['The lungs are muscles that pull air', 'Oxygen is attracted to blood', 'The trachea pumps air'], 'Air flows from high to low pressure.', 'A larger chest volume lowers pressure, so air flows in.'],
          ['C-shaped cartilage rings are found in the…', 'Trachea', ['Oesophagus', 'Alveoli', 'Bronchioles'], 'They keep a tube open.', 'Rings stop the trachea from collapsing.'],
          ['Gases pass between alveoli and blood by…', 'Diffusion', ['Active pumping', 'Osmosis', 'Peristalsis'], 'High concentration to low.', 'O₂ and CO₂ diffuse down their concentration differences.'],
          ['Exhaled air contains about how much carbon dioxide?', 'About 4%', ['About 0.04%', 'About 21%', 'About 78%'], 'About 100 times more than inhaled air.', 'Inhaled ~0.04% CO₂; exhaled ~4%.'],
          ['The flap that stops food entering the windpipe is the…', 'Epiglottis', ['Diaphragm', 'Uvula', 'Larynx'], 'It covers the larynx.', 'The epiglottis closes the larynx during swallowing.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.resp.cellular', title: 'Cellular respiration: aerobic, anaerobic and fermentation', prereqs: ['ts10.bs.resp.airpath'],
      intro: [
        h('Where the energy of your breakfast is released'),
        photo('🥛', 'Curd setting overnight in a Telangana kitchen: bacteria are respiring without oxygen and turning milk sugar into lactic acid.'),
        p('Your muscles, brain and heart run on ATP. Cells make ATP by breaking glucose apart in small controlled steps. This is cellular respiration. It always begins the same way, then takes one of two routes depending on oxygen.'),
        def('Cellular respiration', 'The step-by-step breakdown of glucose inside cells to release energy, stored as ATP.'),
        def('Mitochondria', 'Cell organelles where aerobic respiration is completed; called the "power houses" of the cell.'),
        h('Stage 1 — Glycolysis (in the cytoplasm, no oxygen needed)'),
        p('One glucose molecule (6 carbons) is split into two molecules of pyruvic acid (3 carbons each). A small amount of ATP is gained (net 2 ATP).'),
        h('Stage 2 — what happens to pyruvic acid?'),
        stepsB(
          'With oxygen (aerobic): pyruvic acid enters mitochondria and is broken down completely (Krebs cycle and the electron transport chain) into CO₂ and H₂O. A large amount of energy — about 36–38 ATP per glucose in total (textbook value 38).',
          'Without enough oxygen, in our muscles (anaerobic): pyruvic acid is changed to lactic acid. Only 2 ATP per glucose. Lactic acid build-up causes muscle pain and cramps after a hard race.',
          'Without oxygen, in yeast (alcoholic fermentation): pyruvic acid is changed to ethanol and CO₂. Only 2 ATP per glucose.',
        ),
        f('Aerobic: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (≈ 38 ATP)', 'glucose plus six oxygen gives six carbon dioxide plus six water plus energy'),
        def('Anaerobic respiration', 'Release of energy from glucose without oxygen; incomplete breakdown giving lactic acid (muscles, bacteria) or ethanol + CO₂ (yeast), and much less energy.'),
        def('Fermentation', 'Anaerobic breakdown of sugar by micro-organisms such as yeast and bacteria, giving products like ethanol, CO₂ or lactic acid.'),
        p('Fermentation in daily life: idli and dosa batter rises overnight because micro-organisms release CO₂; bread dough rises with yeast; curd forms when Lactobacillus turns milk sugar into lactic acid. Louis Pasteur first showed that fermentation is caused by living micro-organisms.'),
        xp({
          title: 'What if? ATP from glucose with and without oxygen', formula: 'ATP = n × (38a + 2(1 − a))',
          res: ['ATP', 'ATP made', 'molecules', 'n * (38 * a + 2 * (1 - a))', 0],
          vars: [['n', 'Glucose molecules used', '', 1, 100, 1, 10], ['a', 'Fraction broken down aerobically', '', 0, 1, 0.05, 1]],
          notes: [
            ['a', 'More of the glucose goes the aerobic way: each molecule gives 38 ATP instead of 2, so energy shoots up.', 'When oxygen runs short (a sprint), more glucose goes the anaerobic way — energy falls sharply and lactic acid builds up.'],
            ['n', 'Using more glucose gives proportionally more ATP.', 'Using less glucose gives less ATP.'],
          ],
          mistakes: [['"Anaerobic respiration gives no energy."', 'It gives some — 2 ATP per glucose — which is why sprinters can run briefly without enough oxygen.'], ['"Aerobic respiration happens fully in the cytoplasm."', 'Only glycolysis is in the cytoplasm; the rest is in mitochondria.']],
          real: 'A sprinter\'s muscles cannot get oxygen fast enough, so they rely partly on anaerobic respiration — 19 times less ATP per glucose — and tire quickly.',
        }),
        keys('Glycolysis: cytoplasm, glucose → 2 pyruvic acid, net 2 ATP, no O₂ needed.', 'Aerobic: in mitochondria → CO₂ + H₂O + about 38 ATP.', 'Anaerobic in muscles → lactic acid (cramps); in yeast → ethanol + CO₂.', 'Fermentation: idli batter, bread, curd.'),
        remember('Exam trap: muscles make LACTIC ACID, not alcohol. Yeast makes ALCOHOL (ethanol) and CO₂.'),
        tip('Memory hook: "Yeast → Yummy bread + alcohol; Muscles → Mmm-ouch, lactic acid."'),
      ],
      examples: [
        ex('Imran runs 400 m fast and his thigh muscles ache. Explain using respiration.', ['During a sprint, muscles need energy faster than oxygen can reach them.', 'Pyruvic acid is converted to lactic acid (anaerobic respiration).', 'Lactic acid accumulates and causes pain; deep breathing afterwards supplies oxygen to clear it.'], 'Anaerobic respiration produced lactic acid in the muscles.'),
        ex('Why does dosa batter kept overnight in a warm kitchen become frothy and slightly sour?', ['Yeasts and bacteria in the batter respire anaerobically (fermentation).', 'They release CO₂ gas, which forms bubbles and makes the batter rise.', 'Lactic acid bacteria also make acids, giving the sour taste.'], 'Fermentation releases CO₂ (froth) and acids (sour taste).'),
        ex('How many ATP are made when 5 glucose molecules are respired aerobically, using the textbook value?', ['Aerobic respiration: 38 ATP per glucose.', '5 × 38 = 190'], '190 ATP'),
      ],
      practice: [
        mcq('paths', 'First ask: is oxygen present? Then ask: which organism?', [
          ['Glycolysis takes place in the…', 'Cytoplasm', ['Mitochondria', 'Nucleus', 'Chloroplast'], 'It does not need oxygen or any organelle.', 'Glycolysis happens in the cytoplasm.', { Mitochondria: 'Mitochondria complete AEROBIC respiration after glycolysis.' }],
          ['In human muscles, anaerobic respiration produces…', 'Lactic acid', ['Ethanol and CO₂', 'Only water', 'Starch'], 'It causes cramps.', 'Muscles convert pyruvic acid to lactic acid.', { 'Ethanol and CO₂': 'That is fermentation by yeast, not human muscle.' }],
          ['Yeast fermentation produces…', 'Ethanol and carbon dioxide', ['Lactic acid only', 'Oxygen', 'Glucose'], 'Why does bread dough rise?', 'Yeast converts sugar to ethanol and CO₂.'],
          ['How many ATP (net) are released per glucose in anaerobic respiration?', '2', ['38', '0', '6'], 'Only glycolysis yields ATP here.', 'Anaerobic respiration gives only the 2 ATP of glycolysis.'],
          ['Mitochondria are called power houses because they…', 'Release most of the cell\'s ATP', ['Make glucose', 'Store water', 'Make proteins'], 'Where is aerobic respiration completed?', 'Most ATP is made in mitochondria.'],
          ['Who showed that fermentation is caused by living micro-organisms?', 'Louis Pasteur', ['Joseph Black', 'Robert Hill', 'Mendel'], 'He also invented pasteurisation.', 'Pasteur linked fermentation to yeast and bacteria.'],
        ]),
        matchT('match', 'process to its product', [
          ['Glycolysis', 'Two pyruvic acid molecules'], ['Aerobic respiration', 'CO₂, water and about 38 ATP'], ['Anaerobic respiration in muscle', 'Lactic acid'],
          ['Alcoholic fermentation in yeast', 'Ethanol and CO₂'], ['Curd formation', 'Lactic acid by bacteria'],
        ], ['Two processes give lactic acid — one in muscle, one by bacteria.', 'Only aerobic respiration gives water and lots of ATP.']),
        tp('atp', (r) => {
          const n = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
          const aer = r.next() < 0.5;
          const ans = aer ? n * 38 : n * 2;
          return numQ(`${n} glucose molecules are respired ${aer ? 'aerobically (with oxygen)' : 'anaerobically (without oxygen)'}. Using the textbook values, how many ATP molecules are made?`, ans,
            ['Aerobic: 38 ATP per glucose. Anaerobic: 2 ATP per glucose.', `Multiply ${n} by the ATP per glucose.`],
            [`${n} × ${aer ? 38 : 2} = ${ans} ATP`],
            [{ when: String(aer ? n * 2 : n * 38), explain: aer ? 'That is the anaerobic yield. With oxygen each glucose gives 38 ATP.' : 'That is the aerobic yield. Without oxygen each glucose gives only 2 ATP.' }], 0.001, 'ATP');
        }),
      ],
    },
    {
      id: 'ts10.bs.resp.plants', title: 'Respiration in plants; photosynthesis versus respiration', prereqs: ['ts10.bs.resp.cellular', 'ts10.bs.photo.needs'],
      intro: [
        h('Do plants breathe?'),
        photo('🌱', 'Paddy seedlings in a nursery bed. Their roots need air in the soil — waterlogged roots of most crops suffocate and rot.'),
        p('Every living plant cell respires all day and all night, just like animal cells. Plants have no lungs; each part takes in oxygen by diffusion through openings in its surface.'),
        def('Stomata', 'Tiny pores on leaves, each guarded by two guard cells, through which gases are exchanged.'),
        def('Lenticels', 'Small raised pores in the bark of woody stems that allow gas exchange.'),
        stepsB(
          'Leaves: oxygen and CO₂ diffuse through stomata.',
          'Woody stems: gases pass through lenticels in the bark.',
          'Roots: oxygen from air spaces in soil diffuses into root hairs. Waterlogging fills these spaces with water, so roots of most crops are starved of oxygen.',
          'Mangroves in salty swamps grow special breathing roots (pneumatophores) that stick up out of the mud.',
        ),
        h('Two opposite processes'),
        p('In daylight a green leaf photosynthesises faster than it respires, so overall it takes in CO₂ and gives out O₂. At night photosynthesis stops but respiration continues, so the plant gives out CO₂.'),
        stepsB(
          'Photosynthesis — only in green cells with chlorophyll; respiration — in every living cell.',
          'Photosynthesis — only in light; respiration — day and night.',
          'Photosynthesis — uses CO₂ and water, gives glucose and O₂; respiration — uses glucose and O₂, gives CO₂ and water.',
          'Photosynthesis — stores energy (light → chemical); respiration — releases energy (chemical → ATP).',
          'Photosynthesis — in chloroplasts; respiration — in cytoplasm and mitochondria.',
          'Photosynthesis — increases dry mass; respiration — decreases dry mass.',
        ),
        keys('Plants respire all the time through stomata, lenticels and root hairs.', 'Photosynthesis builds food and stores energy; respiration breaks food and releases energy.', 'At night plants release CO₂ only; in bright light the net exchange is O₂ out.'),
        remember('Exam trap: plants DO respire during the day. Photosynthesis just hides it by being faster.'),
        tip('Photosynthesis and respiration are mirror images: the products of one are the raw materials of the other.'),
      ],
      examples: [
        ex('Why does a pot plant die if it is watered too much every day?', ['Excess water fills the air spaces in soil.', 'Roots cannot get oxygen for respiration.', 'Root cells cannot release energy, die and rot.'], 'Waterlogging cuts off oxygen to the roots.'),
        ex('A leaf is kept in a sealed jar with lime water in the dark for 6 hours. Predict and explain.', ['In the dark there is no photosynthesis.', 'The leaf still respires and releases CO₂.', 'CO₂ turns lime water milky.'], 'Lime water turns milky — the leaf releases CO₂ by respiration.'),
      ],
      practice: [
        tapT('tap-photo', 'Tap every feature of PHOTOSYNTHESIS (not respiration).', [
          ['Occurs only in the presence of light', true], ['Takes place in chloroplasts', true], ['Stores energy in glucose', true], ['Releases oxygen', true],
          ['Occurs in every living cell', false], ['Releases energy as ATP from glucose', false], ['Continues all night', false],
        ], ['Photosynthesis needs light and chlorophyll.', 'Every-cell, all-night processes are respiration.'], 'Photosynthesis needs light and chloroplasts, stores energy and releases O₂; respiration happens in all cells at all times.'),
        mcq('plants', 'Remember: respiration never stops; photosynthesis needs light.', [
          ['Gas exchange in woody stems happens through…', 'Lenticels', ['Stomata', 'Root hairs', 'Xylem'], 'Pores in bark.', 'Lenticels in the bark allow gases in and out.'],
          ['At night, green plants give out…', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Nothing'], 'Only one of the two processes is running.', 'Only respiration happens at night, releasing CO₂.', { Oxygen: 'Oxygen is released by photosynthesis, which stops in the dark.' }],
          ['Roots get oxygen from…', 'Air spaces between soil particles', ['Leaves through xylem', 'Water in the soil only', 'Sunlight'], 'Why is ploughing helpful?', 'Root hairs absorb oxygen from soil air.'],
          ['Which process increases the dry mass of a plant?', 'Photosynthesis', ['Respiration', 'Transpiration', 'Both equally'], 'Which one builds food?', 'Photosynthesis makes new organic matter.'],
          ['Respiration in plants occurs in…', 'All living cells', ['Only green leaves', 'Only roots', 'Only at night'], 'Every cell needs energy.', 'Every living cell respires.'],
          ['Breathing roots that grow up from swamp mud are found in…', 'Mangroves', ['Paddy', 'Cactus', 'Mango'], 'Coastal salty swamps.', 'Mangrove pneumatophores help roots get oxygen.'],
        ]),
        matchT('compare', 'item to its correct description', [
          ['Site of photosynthesis', 'Chloroplast'], ['Site of aerobic respiration', 'Mitochondria'], ['Energy change in photosynthesis', 'Light energy → chemical energy in glucose'],
          ['Energy change in respiration', 'Chemical energy in glucose → ATP'], ['When photosynthesis happens', 'Only in light'], ['When respiration happens', 'Day and night'],
        ], ['Chloroplasts trap energy; mitochondria release it.', 'Respiration never stops while the cell is alive.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Circulation
// =====================================================================================
const ch3: USpec = {
  id: 'ts10.bs.ch3', subject: 'biology', title: 'Circulation', source: src(3),
  objectives: [
    {
      id: 'ts10.bs.circ.heart', title: 'The heart: structure, heartbeat and the cardiac cycle', prereqs: ['ts10.bs.resp.airpath'],
      intro: [
        h('A fist-sized pump that never rests'),
        photo('🧑‍⚕️', 'A doctor at a primary health centre listens with a stethoscope. The "lubb-dubb" she hears is the sound of heart valves snapping shut.'),
        p('Make a fist — your heart is about that size and weighs roughly 300 g. It sits in the chest between the two lungs, tilted slightly to the left, protected by the ribs. It beats about 72 times a minute at rest, more than 1 lakh times a day, without ever stopping for rest.'),
        def('Pericardium', 'A double membrane around the heart with fluid between the layers; it protects the heart and reduces friction as it beats.'),
        h('Four chambers and four valves (labelled parts list)'),
        stepsB(
          'Right atrium — receives deoxygenated blood from the body through the superior and inferior vena cava.',
          'Tricuspid valve (3 flaps) — between right atrium and right ventricle.',
          'Right ventricle — pumps deoxygenated blood to the lungs through the pulmonary artery (guarded by the pulmonary semilunar valve).',
          'Left atrium — receives oxygenated blood from the lungs through the pulmonary veins.',
          'Bicuspid (mitral) valve (2 flaps) — between left atrium and left ventricle.',
          'Left ventricle — the thickest, strongest wall; pumps oxygenated blood to the whole body through the aorta (guarded by the aortic semilunar valve).',
          'Septum — a wall that keeps oxygenated and deoxygenated blood separate. Coronary arteries supply the heart muscle itself.',
        ),
        def('Valve', 'A flap that lets blood flow in one direction only and stops it flowing back.'),
        h('What makes the heart beat?'),
        p('The beat starts in a small patch of special muscle in the wall of the right atrium called the SA node — the natural pacemaker. Its electrical signal spreads over both atria, reaches the AV node, and then travels down special fibres (bundle of His and Purkinje fibres) to make both ventricles contract together.'),
        def('Systole and diastole', 'Systole is contraction of a chamber (blood pushed out). Diastole is relaxation (chamber fills with blood).'),
        h('The cardiac cycle — one heartbeat in 0.8 s (at 72 beats per minute)'),
        stepsB(
          'Atrial systole (≈ 0.1 s): both atria contract and push blood into the ventricles.',
          'Ventricular systole (≈ 0.3 s): ventricles contract; the tricuspid and bicuspid valves snap shut — the first sound "LUBB". Blood is pushed into the pulmonary artery and aorta.',
          'Joint diastole (≈ 0.4 s): all chambers relax; the semilunar valves close — the second sound "DUBB". Blood flows into the atria and on into the ventricles.',
        ),
        f('Duration of one cycle = 60 ÷ heart rate (seconds)', 'cycle time equals sixty divided by beats per minute'),
        xp({
          title: 'What if? Cardiac output', formula: 'Cardiac output = heart rate × stroke volume',
          res: ['CO', 'Cardiac output', 'L/min', 'HR * SV / 1000', 2],
          vars: [['HR', 'Heart rate', 'beats/min', 40, 200, 1, 72], ['SV', 'Stroke volume (blood per beat)', 'mL', 40, 150, 1, 70]],
          notes: [
            ['HR', 'A faster heart pumps more blood each minute — that is why your pulse rises when you run.', 'A slower heart pumps less blood per minute; trained athletes have slow resting rates because each beat is stronger.'],
            ['SV', 'A stronger beat (bigger stroke volume) sends more blood per minute without a faster rate.', 'A weak heart pushes out less blood per beat, so it must beat faster to keep up.'],
          ],
          mistakes: [['Forgetting to convert mL to L', '72 × 70 = 5040 mL per minute, which is about 5 L per minute.'], ['Thinking heart rate alone decides blood flow', 'Output depends on rate AND stroke volume.']],
          real: 'At rest the heart pumps about 5 litres a minute — roughly all the blood in your body, every minute.',
        }),
        xp({
          title: 'What if? Length of one heartbeat', formula: 'T = 60 / HR',
          res: ['T', 'Time for one cardiac cycle', 's', '60 / HR', 2],
          vars: [['HR', 'Heart rate', 'beats/min', 40, 200, 1, 72]],
          notes: [['HR', 'A faster heart rate leaves less time for each beat — mainly the resting (diastole) part gets shorter.', 'A slower rate gives each cycle more time, mostly more time for filling.']],
          mistakes: [['Writing T = HR / 60', 'At 72 beats per minute, one beat takes 60 ÷ 72 = 0.83 s, not 1.2 s.']],
          real: 'At 72 beats per minute one cycle is about 0.8 s; at 120 it is only 0.5 s.',
        }),
        keys('Right side: deoxygenated blood → lungs. Left side: oxygenated blood → body.', 'Valves: tricuspid (right), bicuspid/mitral (left), semilunar at the exits.', 'SA node = pacemaker.', 'Cycle at 72/min: atrial systole 0.1 s + ventricular systole 0.3 s + joint diastole 0.4 s = 0.8 s.'),
        remember('Exam trap: the left ventricle has the thickest wall because it pumps blood to the whole body. "LUBB" = AV valves closing; "DUBB" = semilunar valves closing.'),
        tip('Memory hook: "Try before you Buy" — Tricuspid on the right comes first (Right side), Bicuspid on the left.'),
      ],
      examples: [
        ex('Trace a red blood cell from the right atrium back to the right atrium.', ['Right atrium → tricuspid valve → right ventricle.', 'Right ventricle → pulmonary artery → lungs (picks up O₂).', 'Lungs → pulmonary veins → left atrium → bicuspid valve → left ventricle.', 'Left ventricle → aorta → body tissues (gives up O₂).', 'Body → vena cava → right atrium.'], 'RA → RV → lungs → LA → LV → body → RA.'),
        ex('Teja\'s heart rate is 75 beats/min and stroke volume 80 mL. Find the cardiac output and the time of one cycle.', ['Output = 75 × 80 = 6000 mL/min = 6 L/min.', 'Cycle time = 60 ÷ 75 = 0.8 s.'], '6 L per minute; 0.8 s per beat.'),
      ],
      practice: [
        tp('output', (r) => {
          const hr = r.pick([60, 64, 70, 72, 75, 80, 90, 100, 120, 150]);
          const sv = r.pick([50, 60, 65, 70, 75, 80, 90, 100]);
          const co = rd((hr * sv) / 1000, 3);
          return numQ(`A person's heart beats ${hr} times per minute and pumps ${sv} mL per beat. What is the cardiac output in litres per minute?`, co,
            ['Cardiac output = heart rate × stroke volume.', 'Then divide mL by 1000 to get litres.'],
            [`${hr} × ${sv} = ${hr * sv} mL per minute`, `${hr * sv} ÷ 1000 = ${co} L per minute`],
            [{ when: String(hr * sv), explain: 'That is in mL per minute. Divide by 1000 to give litres.' }], 0.01, 'L/min');
        }, 2),
        tp('cycle', (r) => {
          const hr = r.pick([60, 75, 80, 100, 120, 150]);
          const t = rd(60 / hr, 3);
          return numQ(`An athlete's heart rate is ${hr} beats per minute. How long (in seconds) does one cardiac cycle take?`, t,
            ['One minute = 60 seconds.', `Time per beat = 60 ÷ ${hr}.`],
            [`T = 60 ÷ ${hr} = ${t} s`],
            [{ when: String(rd(hr / 60, 3)), explain: 'You divided the wrong way. Time per beat = 60 ÷ beats per minute.' }], 0.01, 's');
        }),
        orderT('path', 'Arrange the path of blood starting from the body veins.', ['Vena cava', 'Right atrium', 'Right ventricle', 'Pulmonary artery', 'Lungs', 'Pulmonary veins', 'Left atrium', 'Left ventricle', 'Aorta'],
          ['Deoxygenated blood enters the right side first.', 'After the lungs, blood returns to the LEFT atrium.'], 'Body → vena cava → RA → RV → pulmonary artery → lungs → pulmonary veins → LA → LV → aorta.', 3),
        mcq('heart', 'Picture the heart: right side = deoxygenated, left side = oxygenated.', [
          ['Which chamber has the thickest muscular wall?', 'Left ventricle', ['Right ventricle', 'Left atrium', 'Right atrium'], 'Which chamber pumps to the whole body?', 'The left ventricle pumps blood all over the body.'],
          ['The natural pacemaker of the heart is the…', 'SA node', ['AV node', 'Bicuspid valve', 'Aorta'], 'It is in the right atrium wall.', 'The SA node starts each heartbeat.'],
          ['The valve between the left atrium and left ventricle is the…', 'Bicuspid (mitral) valve', ['Tricuspid valve', 'Pulmonary valve', 'Aortic valve'], 'Two flaps.', 'The bicuspid valve is on the left side.', { 'Tricuspid valve': 'The tricuspid valve is on the RIGHT side.' }],
          ['The "LUBB" sound is produced when…', 'The atrioventricular valves close', ['The semilunar valves close', 'The atria contract', 'Blood enters the aorta'], 'It marks the start of ventricular systole.', 'The tricuspid and bicuspid valves close at the start of ventricular contraction.'],
          ['In a 0.8 s cardiac cycle, joint diastole lasts about…', '0.4 s', ['0.1 s', '0.3 s', '0.8 s'], 'It is the longest phase.', '0.1 + 0.3 + 0.4 = 0.8 s.'],
          ['Which vessel carries oxygenated blood from the lungs to the heart?', 'Pulmonary vein', ['Pulmonary artery', 'Vena cava', 'Aorta'], 'Veins carry blood TO the heart.', 'Pulmonary veins bring oxygenated blood to the left atrium.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.circ.vessels', title: 'Blood vessels; single and double circulation', prereqs: ['ts10.bs.circ.heart'],
      intro: [
        h('A road network 1 lakh km long'),
        photo('✋', 'The blue lines on the back of your hand are veins. Press one and slide your finger towards the knuckles — it stays empty for a moment because valves stop blood flowing back.'),
        p('Blood leaves the heart in arteries, is exchanged with cells in capillaries, and returns in veins. William Harvey (1628) first showed that blood moves in a closed circle; Marcello Malpighi later saw the capillaries that link arteries to veins.'),
        def('Artery', 'A thick-walled, elastic vessel that carries blood AWAY from the heart under high pressure. No valves (except at the heart exits). Usually carries oxygenated blood.'),
        def('Vein', 'A thin-walled vessel with a wide space inside that carries blood TOWARDS the heart under low pressure. Has valves to stop back-flow. Usually carries deoxygenated blood.'),
        def('Capillary', 'The narrowest vessel, with a wall only one cell thick, where food, oxygen and wastes are exchanged with tissues.'),
        p('The exceptions: the pulmonary artery carries deoxygenated blood (heart → lungs) and the pulmonary veins carry oxygenated blood (lungs → heart). Arteries and veins are named by direction, not by oxygen.'),
        h('Double circulation in humans'),
        stepsB(
          'Pulmonary circulation: right ventricle → pulmonary artery → lungs → pulmonary veins → left atrium.',
          'Systemic circulation: left ventricle → aorta → arteries → capillaries in body → veins → vena cava → right atrium.',
          'So in one complete round, blood passes through the heart TWICE.',
        ),
        def('Double circulation', 'Circulation in which blood passes through the heart twice in one complete circuit — once for the lungs, once for the body.'),
        def('Single circulation', 'Circulation in which blood passes through the heart only once per circuit, as in fish: heart → gills → body → heart.'),
        h('How circulation evolved'),
        stepsB(
          'Fish: 2-chambered heart (1 atrium, 1 ventricle); only deoxygenated blood passes through it; single circulation.',
          'Amphibians (frog): 3 chambers (2 atria, 1 ventricle); some mixing of oxygenated and deoxygenated blood.',
          'Most reptiles: 3 chambers with a partly divided ventricle (crocodiles have 4 chambers); less mixing.',
          'Birds and mammals: 4 chambers; complete separation — efficient supply of oxygen for warm-blooded, active bodies.',
        ),
        keys('Arteries: away, thick, elastic, high pressure. Veins: towards, thin, valves, low pressure. Capillaries: exchange.', 'Humans have double circulation: pulmonary + systemic.', 'Fish: single circulation with a 2-chambered heart.'),
        remember('Exam trap: "arteries carry oxygenated blood" is not always true — the pulmonary artery is the exception.'),
        tip('Memory hook: Arteries go Away from the heart.'),
      ],
      examples: [
        ex('Why do arteries have thick, elastic walls but veins have valves?', ['Arteries receive blood pumped at high pressure; thick elastic walls withstand and smooth the pressure.', 'Blood in veins is at low pressure and may flow backwards, especially from the legs.', 'Valves keep it moving towards the heart.'], 'High pressure in arteries → thick walls; low pressure in veins → valves.'),
        ex('How many times does blood pass through the heart in one full circuit in a fish and in a human?', ['Fish: heart → gills → body → heart: once.', 'Human: heart → lungs → heart → body → heart: twice.'], 'Fish: once (single). Human: twice (double).'),
      ],
      practice: [
        matchT('vessel', 'vessel to its feature', [
          ['Artery', 'Carries blood away from the heart under high pressure'], ['Vein', 'Has valves and carries blood to the heart'], ['Capillary', 'Wall one cell thick for exchange'],
          ['Pulmonary artery', 'Carries deoxygenated blood to the lungs'], ['Pulmonary vein', 'Carries oxygenated blood to the heart'], ['Aorta', 'Largest artery; leaves the left ventricle'],
        ], ['Name by direction: artery = away.', 'The two pulmonary vessels are the exceptions about oxygen.']),
        mcq('circ', 'Count how many times blood passes through the heart per circuit.', [
          ['Double circulation means blood passes through the heart…', 'Twice in one complete circuit', ['Once in one circuit', 'Twice per minute', 'Only through the lungs'], 'Lungs and body are separate loops.', 'Pulmonary loop + systemic loop = two passes.'],
          ['Which animal has single circulation?', 'Fish', ['Frog', 'Human', 'Pigeon'], 'It has gills.', 'In fish, blood goes heart → gills → body → heart.'],
          ['A frog\'s heart has…', '3 chambers', ['2 chambers', '4 chambers', '1 chamber'], 'Two atria, one ventricle.', 'Amphibians have two atria and one ventricle.'],
          ['Who first described the circulation of blood (1628)?', 'William Harvey', ['Malpighi', 'Laennec', 'Lavoisier'], 'An English doctor.', 'Harvey showed blood moves in a closed circuit.'],
          ['Exchange of materials with tissues takes place in…', 'Capillaries', ['Arteries', 'Veins', 'The heart'], 'The thinnest vessels.', 'Capillary walls are one cell thick.'],
          ['Which blood vessel carries deoxygenated blood?', 'Pulmonary artery', ['Pulmonary vein', 'Aorta', 'Coronary artery'], 'It goes from heart to lungs.', 'The pulmonary artery takes deoxygenated blood to the lungs.'],
        ]),
        orderT('evolve', 'Arrange these animals from the simplest heart to the most efficient (4-chambered).', ['Fish (2 chambers)', 'Frog (3 chambers)', 'Lizard (3 chambers, partly divided ventricle)', 'Pigeon (4 chambers)'],
          ['Fish have the simplest heart.', 'Birds and mammals have complete separation.'], 'Fish → amphibian → reptile → bird/mammal.'),
      ],
    },
    {
      id: 'ts10.bs.circ.lymph', title: 'Lymphatic system, blood pressure and clotting', prereqs: ['ts10.bs.circ.vessels'],
      intro: [
        h('Three systems that keep the network safe'),
        photo('💊', 'Many adults in our towns take a daily tablet for high blood pressure. Knowing what BP numbers mean helps families look after elders.'),
        h('1. Lymph — the second drainage system'),
        p('Some plasma leaks out of capillaries into the spaces between cells. This tissue fluid bathes cells. Most returns to capillaries, but the rest enters thin lymph vessels and is now called lymph.'),
        def('Lymph', 'A colourless fluid like plasma but with fewer proteins and no red blood cells; it contains white blood cells (lymphocytes).'),
        stepsB(
          'Tissue fluid enters lymph capillaries.',
          'Lymph flows through larger lymph vessels (with valves; squeezed along by body muscles — there is no pump).',
          'It passes through lymph nodes, which filter out germs; lymphocytes fight infection.',
          'Lymph empties into large veins near the neck (via the thoracic duct), returning fluid to the blood.',
        ),
        p('Lacteals (lymph vessels in the villi) absorb digested fats. Swollen, tender lymph nodes in the neck during a throat infection show they are fighting germs.'),
        h('2. Blood pressure'),
        def('Blood pressure (BP)', 'The force exerted by blood on the walls of arteries. Written systolic/diastolic in mm of mercury (mm Hg). A healthy young adult is about 120/80 mm Hg.'),
        p('Systolic pressure is the peak when the ventricles contract; diastolic pressure is the lowest value when they relax. BP is measured with a sphygmomanometer. Pressure that stays high (around 140/90 or more) is hypertension; it strains the heart, kidneys and brain. Too much salt, obesity, stress, smoking and lack of exercise raise BP.'),
        xp({
          title: 'What if? Mean arterial pressure', formula: 'MAP ≈ D + (S − D) / 3',
          res: ['MAP', 'Mean arterial pressure', 'mm Hg', 'D + (S - D) / 3', 0],
          vars: [['S', 'Systolic pressure', 'mm Hg', 90, 200, 1, 120], ['D', 'Diastolic pressure', 'mm Hg', 50, 120, 1, 80]],
          notes: [
            ['S', 'Higher systolic pressure raises the average pressure, but only by a third as much.', 'Lower systolic pressure lowers the average a little.'],
            ['D', 'Diastolic pressure counts for two-thirds of the average because the heart spends longer relaxing than contracting.', 'Lower diastolic pressure lowers the average strongly.'],
          ],
          mistakes: [['Averaging (S + D)/2', 'The heart spends more time in diastole, so the true average is closer to the diastolic value.'], ['Reading 120/80 as a fraction', 'It is two separate pressures, systolic over diastolic — not a division.']],
          real: 'For 120/80, MAP ≈ 80 + 40/3 ≈ 93 mm Hg — the steady pressure that pushes blood through your organs.',
        }),
        h('3. Clotting — sealing a leak'),
        stepsB(
          'A blood vessel is cut; platelets gather at the wound.',
          'Platelets and damaged tissue release thromboplastin (thrombokinase).',
          'With calcium ions, thromboplastin turns inactive prothrombin into thrombin.',
          'Thrombin turns soluble fibrinogen into insoluble threads of fibrin.',
          'Fibrin threads form a net that traps blood cells — a clot that seals the wound.',
        ),
        p('Vitamin K is needed by the liver to make prothrombin. A normal clot forms in about 3–6 minutes. Haemophilia is an inherited condition in which blood clots very slowly, so even small cuts bleed for a long time.'),
        keys('Lymph returns tissue fluid to blood; nodes filter germs; lacteals absorb fat.', 'BP = systolic/diastolic, about 120/80 mm Hg; measured with a sphygmomanometer.', 'Clotting: platelets → thromboplastin → prothrombin → thrombin → fibrinogen → fibrin.'),
        remember('Exam trap: thrombin acts on fibrinogen (not prothrombin). Calcium and vitamin K are both needed for clotting.'),
        tip('Memory hook for clotting: "Please Take Proper Treatment For Fast Fixing" — Platelets, Thromboplastin, Prothrombin→Thrombin, Fibrinogen→Fibrin.'),
      ],
      examples: [
        ex('Priya\'s grandmother has BP readings of 150/96 on several days. What do the two numbers mean and is it normal?', ['150 is systolic pressure (ventricles contracting).', '96 is diastolic pressure (ventricles relaxing).', 'Both are above the usual 120/80; readings that stay at 140/90 or above indicate hypertension.'], 'Systolic 150, diastolic 96 — high blood pressure; she should see a doctor.'),
        ex('Why do people with very low vitamin K bleed for a long time after a small cut?', ['The liver needs vitamin K to make prothrombin.', 'Less prothrombin → less thrombin → less fibrin.', 'Without enough fibrin, the clot forms slowly.'], 'Vitamin K deficiency reduces prothrombin, so clotting is delayed.'),
      ],
      practice: [
        orderT('clot', 'Arrange the steps of blood clotting.', ['Platelets gather at the wound', 'Thromboplastin is released', 'Prothrombin becomes thrombin', 'Fibrinogen becomes fibrin', 'Fibrin threads trap blood cells'],
          ['Platelets act first.', 'Fibrin threads form last.'], 'Platelets → thromboplastin → thrombin → fibrin → clot.', 2),
        tp('map', (r) => {
          const [s, d] = r.pick([[120, 80], [110, 70], [130, 85], [140, 90], [150, 90], [126, 84], [114, 72], [160, 100]] as [number, number][]);
          const m = rd(d + (s - d) / 3, 1);
          return numQ(`A BP reading is ${s}/${d} mm Hg. Estimate the mean arterial pressure using MAP ≈ D + (S − D)/3 (1 decimal place).`, m,
            ['S = systolic (top number), D = diastolic (bottom number).', `MAP = ${d} + (${s} − ${d}) ÷ 3`],
            [`S − D = ${s - d}`, `(S − D)/3 = ${rd((s - d) / 3, 2)}`, `MAP = ${d} + ${rd((s - d) / 3, 2)} = ${m} mm Hg`],
            [{ when: String((s + d) / 2), explain: 'That is the simple average. The heart spends longer in diastole, so use D + (S − D)/3.' }], 0.01, 'mm Hg');
        }, 2),
        mcq('lbc', 'Lymph = drainage; BP = pressure on artery walls; clotting = fibrin net.', [
          ['Lymph differs from blood because it has no…', 'Red blood cells', ['White blood cells', 'Water', 'Plasma proteins at all'], 'What makes blood red?', 'Lymph lacks RBCs; it has lymphocytes.'],
          ['Fats absorbed in the small intestine enter the…', 'Lacteals', ['Pulmonary veins', 'Capillaries of the lungs', 'Nephrons'], 'Lymph vessels inside villi.', 'Lacteals carry absorbed fats in lymph.'],
          ['The instrument used to measure blood pressure is the…', 'Sphygmomanometer', ['Stethoscope', 'Thermometer', 'Barometer'], 'It has a cuff around the arm.', 'A sphygmomanometer measures BP in mm Hg.'],
          ['Normal BP of a healthy young adult is about…', '120/80 mm Hg', ['80/120 mm Hg', '200/150 mm Hg', '60/30 mm Hg'], 'Systolic is written first and is larger.', 'About 120 systolic over 80 diastolic.'],
          ['Thrombin converts…', 'Fibrinogen into fibrin', ['Prothrombin into thrombin', 'Fibrin into fibrinogen', 'Platelets into fibrin'], 'Thrombin is the enzyme that makes threads.', 'Thrombin turns soluble fibrinogen into insoluble fibrin.', { 'Prothrombin into thrombin': 'That step is done by thromboplastin with calcium.' }],
          ['An inherited disorder in which blood clots very slowly is…', 'Haemophilia', ['Anaemia', 'Hypertension', 'Scurvy'], '"Bleeder\'s disease".', 'In haemophilia a clotting factor is missing.'],
        ]),
        tapT('tap-bp', 'Tap every factor that can RAISE blood pressure over time.', [
          ['Too much salt in food', true], ['Obesity', true], ['Long-term stress', true], ['Smoking', true], ['Regular exercise', false], ['Eating fruits and vegetables', false], ['Adequate sleep', false],
        ], ['Think of habits doctors ask us to reduce.', 'Exercise and a healthy diet help lower BP.'], 'Salt, obesity, stress and smoking raise BP; exercise, good diet and sleep help control it.'),
      ],
    },
    {
      id: 'ts10.bs.circ.plants', title: 'Transport of water and food in plants', prereqs: ['ts10.bs.photo.needs'],
      intro: [
        h('How does water climb a 30-metre neem tree?'),
        photo('🌳', 'A tall neem tree lifts hundreds of litres of water from the soil to its top leaves every hot day — without any pump.'),
        p('Plants have two transport tissues. Xylem carries water and minerals upward from the roots. Phloem carries food made in the leaves to wherever it is needed.'),
        def('Xylem', 'Tissue of dead, hollow tubes (vessels and tracheids) that carries water and dissolved minerals from roots to leaves, in one direction (upward).'),
        def('Phloem', 'Tissue of living sieve tubes with companion cells that carries food (mainly sucrose) from leaves to other parts, both up and down.'),
        h('Water: from soil to leaf'),
        stepsB(
          'Absorption: root hairs have a higher concentration of solutes than soil water, so water enters by osmosis.',
          'Root pressure: root cells push water into the xylem, creating a small upward push (seen as drops at leaf edges in the morning — guttation — and sap oozing from a cut stem).',
          'Capillarity: water rises a little on its own in very narrow xylem tubes.',
          'Transpiration pull: water evaporates from leaves through stomata. Water molecules stick together (cohesion) and to the xylem walls (adhesion), so the evaporating water pulls a continuous column up from the roots — like sucking through a straw.',
        ),
        def('Transpiration', 'Loss of water vapour from the aerial parts of a plant, mainly through stomata.'),
        def('Osmosis', 'Movement of water through a semi-permeable membrane from where water is more (dilute solution) to where it is less (concentrated solution).'),
        p('Transpiration pull is the main force in tall trees. On hot, dry, windy days transpiration is fastest, so more water is pulled up. Minerals dissolved in water travel along with it.'),
        h('Food: translocation in phloem'),
        p('Sugar made in leaves (the source) is moved to roots, fruits, seeds, growing tips and storage organs (the sinks). This is translocation. It needs energy (ATP) and can move up or down. In a girdling (ringing) experiment, a ring of bark (containing phloem) is removed from a stem: the part just above the ring swells with trapped food, and the roots below eventually starve.'),
        def('Translocation', 'Transport of food (soluble products of photosynthesis) through the phloem from source to sink.'),
        keys('Xylem: water and minerals, upward, dead cells. Phloem: food, both ways, living cells.', 'Water rises by root pressure, capillarity and mainly transpiration pull.', 'Translocation needs energy; girdling shows food travels in phloem.'),
        remember('Exam trap: transpiration is not a waste — it pulls water and minerals up and cools the leaf.'),
        tip('Memory hook: "Xylem = up only (like an eXit lift); Phloem = Food, both ways."'),
      ],
      examples: [
        ex('A ring of bark is removed from the trunk of a young mango tree. What happens over the next weeks?', ['The bark ring contains phloem; xylem (wood) is intact.', 'Water still rises, so leaves stay green for a while.', 'Food from leaves cannot pass the ring, so the bark above it swells.', 'Roots below get no food and eventually die, and then the tree dies.'], 'Swelling above the ring; roots starve — food travels in phloem.'),
        ex('Why do potted plants in a Hyderabad flat need more water in April than in December?', ['April is hot and dry; December is cool.', 'High temperature and dry air speed up transpiration.', 'Faster transpiration pulls up and loses more water.'], 'Transpiration is faster in hot, dry weather.'),
      ],
      practice: [
        mcq('transport', 'Decide: water (xylem) or food (phloem)?', [
          ['Water is carried from roots to leaves by…', 'Xylem', ['Phloem', 'Stomata', 'Lenticels'], 'Dead hollow tubes.', 'Xylem conducts water and minerals upward.'],
          ['The main force that lifts water in tall trees is…', 'Transpiration pull', ['Root pressure', 'Gravity', 'Phloem pressure'], 'It acts from the top.', 'Evaporation from leaves pulls the water column up.', { 'Root pressure': 'Root pressure is small; it cannot lift water to the top of tall trees.' }],
          ['Root hairs absorb water by…', 'Osmosis', ['Transpiration', 'Translocation', 'Photosynthesis'], 'Water moves to the more concentrated side.', 'Root hair cell sap is more concentrated than soil water.'],
          ['Movement of food in phloem is called…', 'Translocation', ['Transpiration', 'Guttation', 'Absorption'], 'Trans-location: moving from place to place.', 'Translocation carries sugars from source to sink.'],
          ['Water drops at leaf edges in the early morning show…', 'Root pressure (guttation)', ['Transpiration', 'Photosynthesis', 'Respiration'], 'Water is pushed out, not evaporated.', 'Root pressure forces liquid water out through leaf pores.'],
          ['Which tissue is made of living cells and carries food both ways?', 'Phloem', ['Xylem', 'Cork', 'Root hair'], 'Sieve tubes and companion cells.', 'Phloem is living and transports food up and down.'],
        ]),
        orderT('water', 'Arrange the path of water through a plant.', ['Soil water', 'Root hair', 'Root cortex', 'Xylem of root and stem', 'Leaf cells', 'Stomata (evaporates out)'],
          ['Water enters at root hairs.', 'It leaves as vapour through stomata.'], 'Soil → root hair → cortex → xylem → leaf → stomata.'),
        tapT('tap-trans', 'Tap every condition that INCREASES the rate of transpiration.', [
          ['High temperature', true], ['Wind', true], ['Dry air (low humidity)', true], ['Bright light (stomata open)', true], ['Very humid air', false], ['Darkness (stomata closed)', false], ['Cold, still air', false],
        ], ['Think about drying clothes on a line.', 'Stomata must be open for transpiration.'], 'Heat, wind, dry air and light speed up transpiration; humidity, darkness and cold slow it.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Excretion
// =====================================================================================
const ch4: USpec = {
  id: 'ts10.bs.ch4', subject: 'biology', title: 'Excretion', source: src(4),
  objectives: [
    {
      id: 'ts10.bs.excr.kidney', title: 'Human excretory system and how urine is formed', prereqs: ['ts10.bs.circ.vessels'],
      intro: [
        h('Your body\'s water-purification plant'),
        photo('💧', 'On a hot May afternoon in Khammam you sweat a lot and pass less, darker urine. Your kidneys are saving water automatically.'),
        p('Every cell makes wastes as it works. Breaking down proteins gives nitrogen wastes — mainly urea in humans — which are poisonous if they build up. Excretion is the removal of these metabolic wastes from the body.'),
        def('Excretion', 'The removal of harmful waste products of metabolism (such as urea, uric acid, excess salts, water and CO₂) from the body.'),
        h('Organs of the excretory system (labelled list)'),
        stepsB(
          'Kidneys (2): bean-shaped, about 10 cm long, on either side of the backbone at the back of the abdomen. They filter blood and make urine.',
          'Renal artery brings blood (with wastes) into each kidney; renal vein takes cleaned blood away.',
          'Ureters (2): tubes carrying urine from each kidney to the bladder by peristalsis.',
          'Urinary bladder: a muscular bag that stores urine.',
          'Urethra: the tube through which urine leaves the body; a ring of muscle (sphincter) controls it.',
        ),
        p('Cut a kidney lengthwise and you see an outer cortex, an inner medulla with cone-shaped pyramids, and a funnel-like pelvis that leads to the ureter. Each kidney has about 10 lakh (1 million) tiny filtering units called nephrons.'),
        def('Nephron', 'The structural and functional unit of the kidney. Parts: Bowman\'s capsule (a cup) holding a knot of capillaries called the glomerulus, then the proximal convoluted tubule, loop of Henle, distal convoluted tubule, and collecting duct.'),
        h('Urine formation in three steps'),
        stepsB(
          'Glomerular filtration: blood enters the glomerulus through a wider vessel and leaves through a narrower one, so pressure is high. Water, glucose, amino acids, salts and urea are squeezed into Bowman\'s capsule. Blood cells and large proteins stay in the blood. About 180 litres of filtrate are made every day.',
          'Tubular reabsorption: as filtrate flows through the tubules, useful substances — all the glucose and amino acids, most salts and about 99% of the water — are taken back into the surrounding capillaries.',
          'Tubular secretion: extra wastes such as potassium and hydrogen ions, creatinine and some drugs are actively pushed from the blood into the tubule.',
          'The remaining fluid (urine) passes down collecting ducts to the pelvis and ureter.',
        ),
        p('The hormone ADH (vasopressin) from the pituitary makes the tubules reabsorb more water when you are short of water, so urine becomes concentrated. Urine is about 95% water with urea, salts, uric acid and creatinine; the yellow colour comes from a pigment called urochrome. An adult passes about 1.5 litres a day. Emptying the bladder (micturition) is a reflex that we learn to control voluntarily.'),
        xp({
          title: 'What if? From 180 L of filtrate to about 1.5 L of urine', formula: 'U = F × (100 − R) / 100',
          res: ['U', 'Urine passed per day', 'L/day', 'F * (100 - R) / 100', 2],
          vars: [['F', 'Filtrate formed per day', 'L/day', 100, 200, 5, 180], ['R', 'Percentage of water reabsorbed', '%', 95, 99.9, 0.1, 99.2]],
          notes: [
            ['R', 'Reabsorbing a tiny bit more water (as on a hot day with ADH) cuts urine volume sharply — urine becomes dark and concentrated.', 'Reabsorbing even 1% less water more than doubles the urine — as after drinking lots of water.'],
            ['F', 'A higher filtration rate gives more urine if reabsorption stays the same.', 'Damaged kidneys filter less, so wastes stay in the blood.'],
          ],
          mistakes: [['"Kidneys make 180 L of urine a day."', '180 L is the FILTRATE; about 99% of it is reabsorbed, leaving about 1.5 L of urine.'], ['Thinking reabsorption is a small adjustment', 'Going from 99% to 98% reabsorbed doubles the urine — small percentages matter a lot here.']],
          real: 'Your blood plasma (about 3 L) is filtered roughly 60 times a day — the kidneys are constantly cleaning it.',
        }),
        keys('Kidney → ureter → bladder → urethra.', 'Nephron = Bowman\'s capsule + glomerulus + tubules (PCT, loop of Henle, DCT) + collecting duct.', 'Urine formation: filtration → reabsorption → secretion.', '≈180 L filtrate per day → ≈1.5 L urine.'),
        remember('Exam trap: glucose is filtered but normally completely reabsorbed. Glucose in urine is a sign of diabetes, not normal excretion.'),
        tip('Memory hook for urine formation: "Filter, Fetch back, Flush out" = filtration, reabsorption, secretion.'),
      ],
      examples: [
        ex('Trace a molecule of urea from the blood in the renal artery to outside the body.', ['Renal artery → glomerulus.', 'Filtered into Bowman\'s capsule.', 'Flows through PCT → loop of Henle → DCT → collecting duct (not reabsorbed much).', 'Pelvis → ureter → urinary bladder → urethra → out.'], 'Renal artery → glomerulus → Bowman\'s capsule → tubules → collecting duct → ureter → bladder → urethra.'),
        ex('If kidneys form 180 L of filtrate and reabsorb 99% of it, how much urine is made?', ['Water not reabsorbed = 100% − 99% = 1%.', '1% of 180 L = 180 × 1 ÷ 100 = 1.8 L.'], '1.8 L of urine per day'),
      ],
      practice: [
        orderT('urea', 'Arrange the path of urine from where it is formed to where it leaves the body.', ['Bowman\'s capsule', 'Renal tubules', 'Collecting duct', 'Ureter', 'Urinary bladder', 'Urethra'],
          ['Filtration happens in the capsule.', 'The bladder stores; the urethra releases.'], 'Capsule → tubules → collecting duct → ureter → bladder → urethra.'),
        tp('urine', (r) => {
          const F = r.pick([150, 160, 170, 180, 190, 200]);
          const R = r.pick([98, 98.5, 99, 99.2, 99.5]);
          const u = rd((F * (100 - R)) / 100, 3);
          return numQ(`The kidneys form ${F} L of filtrate in a day and reabsorb ${R}% of the water. How many litres of urine are passed (assume urine ≈ the water not reabsorbed)?`, u,
            [`Water NOT reabsorbed = 100 − ${R} = ${rd(100 - R, 2)}%.`, `Urine = ${F} × ${rd(100 - R, 2)} ÷ 100.`],
            [`${rd(100 - R, 2)}% of ${F} L = ${u} L`],
            [{ when: String(rd((F * R) / 100, 2)), explain: 'That is the water REABSORBED. Urine is the part not taken back.' }], 0.01, 'L');
        }, 2),
        mcq('kidney', 'Remember the three steps and the parts of the nephron.', [
          ['The functional unit of the kidney is the…', 'Nephron', ['Neuron', 'Alveolus', 'Ureter'], 'There are about a million in each kidney.', 'Nephrons filter blood and make urine.'],
          ['Glomerular filtration happens because of…', 'High blood pressure in the glomerulus', ['Osmosis from the bladder', 'Peristalsis in the ureter', 'Low pressure in the renal artery'], 'The outgoing vessel is narrower than the incoming one.', 'High pressure squeezes fluid into Bowman\'s capsule.'],
          ['Which is normally absent in the urine of a healthy person?', 'Glucose', ['Urea', 'Water', 'Salts'], 'It is fully reabsorbed.', 'All filtered glucose is reabsorbed in the tubules.'],
          ['ADH makes the urine…', 'More concentrated and less in volume', ['More dilute and more in volume', 'Full of glucose', 'Red'], 'ADH = anti-diuretic (against much urine).', 'ADH increases water reabsorption.'],
          ['Urine is carried from kidney to bladder by the…', 'Ureter', ['Urethra', 'Renal vein', 'Collecting duct'], 'Ureter comes before urethra in the alphabet and in the body.', 'Each ureter carries urine to the bladder.', { Urethra: 'The urethra carries urine OUT of the bladder.' }],
          ['The yellow colour of urine is due to…', 'Urochrome', ['Urea', 'Bile', 'Haemoglobin'], 'A pigment.', 'Urochrome, a breakdown product of haemoglobin, colours urine.'],
        ]),
        matchT('nephron', 'part to its job', [
          ['Glomerulus', 'Knot of capillaries where blood is filtered'], ['Bowman\'s capsule', 'Cup that collects the filtrate'], ['Tubules', 'Reabsorb useful substances'],
          ['Ureter', 'Carries urine to the bladder'], ['Urinary bladder', 'Stores urine'], ['Renal artery', 'Brings blood with wastes to the kidney'],
        ], ['The capillary knot sits inside the cup.', 'Storage and carrying are done outside the kidney.']),
      ],
    },
    {
      id: 'ts10.bs.excr.dialysis', title: 'Kidney failure: dialysis and kidney transplantation', prereqs: ['ts10.bs.excr.kidney'],
      intro: [
        h('When kidneys stop working'),
        photo('🧑‍⚕️', 'Government hospitals in Telangana run dialysis centres where patients come two or three times a week.'),
        p('If both kidneys fail — due to long-term diabetes, high blood pressure, infections or injury — urea and other wastes build up in the blood. This is dangerous and can be fatal within days. Two treatments can help: dialysis and a kidney transplant.'),
        def('Dialysis (haemodialysis)', 'Removing wastes from the blood artificially by passing it along a selectively permeable membrane bathed in dialysing fluid.'),
        h('How a dialysis machine (artificial kidney) works'),
        stepsB(
          'Blood is taken out of an artery in the patient\'s arm; an anticoagulant (heparin) is added so it does not clot in the tubes.',
          'Blood flows through long, coiled tubes made of a thin, selectively permeable membrane (like cellophane).',
          'The tubes sit in dialysing fluid that has the same composition as normal plasma but contains NO urea or other wastes.',
          'Urea and excess salts diffuse out of the blood into the fluid (high to low concentration); useful substances like glucose do not leave, because the fluid already has the same amount.',
          'Cleaned blood is returned into a vein. A session takes about 4 hours, usually 2–3 times a week.',
        ),
        p('Dutch doctor Willem Kolff built one of the first working dialysis machines in the 1940s. Dialysis does the job of filtration but cannot reabsorb or make hormones like a real kidney.'),
        h('Kidney transplantation'),
        def('Kidney transplant', 'Surgery in which a healthy kidney from a donor is placed in a patient whose kidneys have failed.'),
        p('A person can live a normal life with one healthy kidney, so a close family member can donate one. A kidney can also come from a person declared brain-dead, if the family agrees to donate organs. The donor\'s blood group and tissue type must match closely, or the patient\'s immune system will reject it; the patient takes medicines to prevent rejection. In India, buying and selling organs is illegal under the Transplantation of Human Organs Act (1994). Telangana\'s Jeevandan programme helps organise deceased organ donation.'),
        keys('Kidney failure → wastes build up in blood.', 'Dialysis: blood through a selectively permeable tube in dialysing fluid; wastes diffuse out.', 'Transplant: matched donor kidney; anti-rejection medicines; organ trade is illegal.'),
        remember('Exam point: dialysing fluid has NO urea — that keeps the concentration difference so urea keeps diffusing out of the blood.'),
        tip('Organ donation is a gift that can save several lives; pledging is a decision to discuss with your family.'),
      ],
      examples: [
        ex('Why must dialysing fluid contain glucose at the same concentration as blood?', ['Substances diffuse from higher to lower concentration.', 'If the fluid had no glucose, glucose would diffuse out of the blood and be lost.', 'Equal concentration means no net movement of glucose.'], 'So that useful glucose is not lost from the blood.'),
        ex('Why is heparin added to blood during dialysis?', ['Blood outside the body tends to clot in contact with tubes.', 'Clots would block the dialyser.', 'Heparin is an anticoagulant.'], 'To prevent blood clotting in the machine.'),
      ],
      practice: [
        orderT('steps', 'Arrange the steps of haemodialysis.', ['Blood taken from an artery', 'Anticoagulant added', 'Blood flows through tubes bathed in dialysing fluid', 'Wastes diffuse into the fluid', 'Clean blood returned to a vein'],
          ['Stop clotting before the blood enters the tubes.', 'Clean blood goes back last.'], 'Artery → heparin → dialyser tubes → wastes diffuse out → vein.'),
        mcq('dial', 'Dialysis works by diffusion across a selectively permeable membrane.', [
          ['Waste moves from blood to dialysing fluid by…', 'Diffusion', ['Active pumping by the machine', 'Filtration under pressure only', 'Peristalsis'], 'High concentration to low.', 'Urea diffuses from blood (high) to fluid (none).'],
          ['Dialysing fluid lacks…', 'Urea', ['Water', 'Glucose', 'Salts'], 'It must keep pulling waste out.', 'No urea in the fluid keeps urea moving out of the blood.'],
          ['Which substance is added to prevent blood clotting in the machine?', 'Heparin', ['Vitamin K', 'Insulin', 'Thrombin'], 'An anticoagulant.', 'Heparin prevents clotting.', { 'Vitamin K': 'Vitamin K HELPS clotting — the opposite of what we want here.' }],
          ['A person can donate a kidney while alive because…', 'One healthy kidney can do the work of two', ['Kidneys grow back', 'Kidneys are not essential', 'Dialysis is permanent'], 'We are born with a spare.', 'One kidney is enough for normal life.'],
          ['A transplanted kidney may be rejected because…', 'The patient\'s immune system attacks it as foreign', ['It is too small', 'It has no nephrons', 'Urine is too dilute'], 'Matching blood and tissue reduces this.', 'The immune system recognises foreign tissue.'],
          ['Buying and selling of human organs in India is…', 'Illegal', ['Legal with a licence', 'Allowed for kidneys only', 'Allowed between friends'], 'A 1994 law.', 'The Transplantation of Human Organs Act bans organ trade.'],
        ]),
        tapT('tap-dial', 'Tap every substance that should pass OUT of the blood during dialysis.', [
          ['Urea', true], ['Excess salts', true], ['Uric acid', true], ['Creatinine', true], ['Red blood cells', false], ['Glucose', false], ['Plasma proteins', false],
        ], ['Only wastes should leave.', 'Cells and proteins are too big; glucose is balanced by the fluid.'], 'Urea, uric acid, creatinine and excess salts leave; cells, proteins and glucose stay.'),
      ],
    },
    {
      id: 'ts10.bs.excr.accessory', title: 'Accessory excretory organs: lungs, skin, liver and intestine', prereqs: ['ts10.bs.excr.kidney'],
      intro: [
        h('The kidneys have helpers'),
        photo('💪', 'After a game of kabaddi in the sun you are soaked in sweat — your skin is removing water, salts and a little urea.'),
        p('Kidneys remove most nitrogen wastes, but other organs also remove wastes. They are called accessory excretory organs.'),
        stepsB(
          'Lungs: remove carbon dioxide and some water vapour, the wastes of cellular respiration.',
          'Skin: sweat glands remove water, salts (mainly sodium chloride) and small amounts of urea and lactic acid. Sebaceous glands release sebum (waxes, sterols, fatty acids) that also keeps skin and hair soft.',
          'Liver: converts poisonous ammonia (from breaking down extra amino acids) into less harmful urea, which blood carries to the kidneys. It breaks down old red blood cells; their haemoglobin becomes the bile pigments bilirubin and biliverdin, which leave the body with bile in faeces. It also removes cholesterol and some drugs and poisons via bile.',
          'Large intestine: removes excess salts of calcium, magnesium and iron along with faeces.',
        ),
        def('Deamination', 'Removal of the nitrogen-containing (amino) group from excess amino acids in the liver, producing ammonia, which is then turned into urea.'),
        def('Bile pigments', 'Bilirubin and biliverdin, formed in the liver from the breakdown of haemoglobin of old red blood cells; excreted with bile.'),
        p('Note the difference: faeces are mostly undigested food that never entered our cells — removing it is egestion, not excretion. But the bile pigments and salts in faeces ARE excretory products, because they were made or released by body cells.'),
        keys('Lungs → CO₂ and water vapour.', 'Skin → sweat (water, salts, some urea) and sebum.', 'Liver → makes urea; forms bile pigments from old RBCs.', 'Large intestine → excess Ca, Mg, Fe salts.'),
        remember('Exam trap: the liver MAKES urea; the kidneys REMOVE it.'),
        tip('Memory hook: "LungS, SKin, LiVer, Intestine — LSLI: Lungs blow, Skin sweats, Liver changes, Intestine dumps."'),
      ],
      examples: [
        ex('A person with jaundice has yellow eyes and skin. Link this to excretion.', ['Old red blood cells are broken down in the liver.', 'Haemoglobin becomes the yellow pigment bilirubin, normally excreted in bile.', 'If the liver is damaged or bile flow is blocked, bilirubin builds up in blood and tissues.'], 'Bile pigments are not excreted properly, so they accumulate and colour the skin yellow.'),
        ex('Why is urea found in sweat but not CO₂ in large amounts?', ['Sweat glands draw fluid from the blood, which contains dissolved urea and salts.', 'CO₂ is a gas carried to the lungs and breathed out.'], 'Urea dissolves in sweat; CO₂ is mainly removed by the lungs.'),
      ],
      practice: [
        matchT('organ', 'organ to the waste it removes', [
          ['Lungs', 'Carbon dioxide and water vapour'], ['Sweat glands', 'Water, salts and a little urea'], ['Liver', 'Bile pigments from old red blood cells'], ['Large intestine', 'Excess calcium, magnesium and iron salts'],
          ['Kidneys', 'Urea in urine'], ['Sebaceous glands', 'Sebum (waxes and fatty substances)'],
        ], ['The lungs remove a gas.', 'Bile pigments come from broken-down haemoglobin.']),
        mcq('acc', 'Who makes the waste, and who removes it?', [
          ['Urea is produced in the…', 'Liver', ['Kidneys', 'Lungs', 'Skin'], 'Deamination happens here.', 'The liver turns ammonia into urea.', { Kidneys: 'Kidneys remove urea; they do not make it.' }],
          ['Bilirubin is formed from the breakdown of…', 'Haemoglobin of old red blood cells', ['Starch', 'Fats', 'Urea'], 'It is a pigment.', 'Haemoglobin breakdown gives bile pigments.'],
          ['Which waste is removed mainly by the lungs?', 'Carbon dioxide', ['Urea', 'Uric acid', 'Bile'], 'A gas.', 'CO₂ from respiration is breathed out.'],
          ['Sebum is secreted by…', 'Sebaceous glands', ['Sweat glands', 'Salivary glands', 'Liver'], 'It keeps hair and skin soft.', 'Sebaceous glands in skin release sebum.'],
          ['Removal of nitrogen from extra amino acids is called…', 'Deamination', ['Digestion', 'Filtration', 'Fermentation'], 'De-amino.', 'Deamination produces ammonia, converted to urea.'],
        ]),
        tapT('tap-skin', 'Tap every substance present in sweat.', [
          ['Water', true], ['Sodium chloride', true], ['A little urea', true], ['A little lactic acid', true], ['Glucose in large amounts', false], ['Bile pigments', false], ['Carbon dioxide gas', false],
        ], ['Sweat is mostly water with dissolved salts.', 'Bile pigments go out with faeces.'], 'Sweat contains water, salts, a little urea and lactic acid.'),
      ],
    },
    {
      id: 'ts10.bs.excr.others', title: 'Excretion in other organisms and plants; excretion versus secretion', prereqs: ['ts10.bs.excr.accessory'],
      intro: [
        h('No kidneys? No problem'),
        photo('🌳', 'Cut a neem or babul (Acacia) bark and a sticky gum oozes out — one way plants store their wastes safely.'),
        h('Excretory organs across animals'),
        stepsB(
          'Amoeba and Paramoecium: wastes diffuse out through the body surface; a contractile vacuole pumps out excess water.',
          'Sponges and Hydra: wastes (ammonia) diffuse directly into the surrounding water.',
          'Flatworms (Planaria, tapeworm): flame cells.',
          'Earthworm: nephridia (tiny coiled tubes in each segment).',
          'Insects (cockroach): Malpighian tubules, which remove uric acid.',
          'Prawn and other crustaceans: green glands.',
          'Vertebrates (fish to humans): kidneys.',
        ),
        p('Animals living in water excrete mostly ammonia (needs lots of water to dilute). Mammals excrete urea. Birds, reptiles and insects excrete uric acid, which needs very little water — an advantage on land and inside eggs.'),
        h('How plants get rid of wastes'),
        p('Plants have no special excretory organs. They make wastes slowly, and many are stored in harmless forms or reused. Oxygen (from photosynthesis) and CO₂ (from respiration) pass out through stomata. Other wastes are stored in leaves and bark that are later shed, or in old xylem.'),
        stepsB(
          'Alkaloids — nitrogen compounds, many used as medicines: quinine (Cinchona, against malaria), nicotine (tobacco), caffeine (coffee, tea), reserpine (Rauwolfia, for high BP), morphine (poppy).',
          'Tannins — used to tan leather and in dyes (from Acacia and other barks).',
          'Resins — sticky substances in pines and other conifers; used in varnishes.',
          'Gums — ooze from neem, Acacia; used as glue and in food.',
          'Latex — milky fluid of rubber trees and Calotropis (jilledu); rubber is made from it.',
        ),
        h('Excretion versus secretion'),
        def('Secretion', 'The release of USEFUL substances made by cells — such as enzymes, hormones, saliva, milk or mucus — to do a job in the body.'),
        p('Excretion removes wastes that would harm the body if kept. Secretion releases useful products. Some plant "wastes" like gums and latex are also called secretions because people find them useful — in the plant they are simply stored by-products.'),
        keys('Contractile vacuole (Amoeba), flame cells (flatworms), nephridia (earthworm), Malpighian tubules (insects), green glands (prawn), kidneys (vertebrates).', 'Plants store wastes as alkaloids, tannins, resins, gums and latex; shed leaves and bark remove them.', 'Excretion removes wastes; secretion releases useful substances.'),
        remember('Exam trap: insects excrete through Malpighian tubules, not nephridia. Nephridia belong to earthworms.'),
        tip('Memory hook: "Earthworm Never, Insects Malpighian" — E–N, I–M.'),
      ],
      examples: [
        ex('Why do birds excrete uric acid instead of urea or ammonia?', ['Ammonia needs a lot of water to dilute it safely.', 'Uric acid is nearly insoluble and can be removed as a paste with little water.', 'This saves water and keeps the developing chick safe inside a shelled egg.'], 'Uric acid saves water — useful for flight and egg development.'),
        ex('Classify: insulin released by the pancreas, sweat, latex from a rubber tree, CO₂ breathed out.', ['Insulin is useful → secretion.', 'Sweat removes salts and urea → excretion (also cools the body).', 'Latex is a stored plant by-product → plant excretory product (used by people).', 'CO₂ is a waste of respiration → excretion.'], 'Secretion: insulin. Excretion: sweat, CO₂. Plant excretory product: latex.'),
      ],
      practice: [
        matchT('organisms', 'organism to its excretory structure', [
          ['Amoeba', 'Contractile vacuole and body surface'], ['Planaria', 'Flame cells'], ['Earthworm', 'Nephridia'], ['Cockroach', 'Malpighian tubules'], ['Prawn', 'Green glands'], ['Frog', 'Kidneys'],
        ], ['Insects have tubules named after a scientist.', 'Earthworms have nephridia in each segment.']),
        matchT('plant', 'plant product to its source or use', [
          ['Quinine', 'Cinchona bark; treats malaria'], ['Nicotine', 'Tobacco leaves'], ['Caffeine', 'Coffee and tea'], ['Reserpine', 'Rauwolfia; lowers blood pressure'], ['Latex', 'Rubber tree'], ['Gum', 'Neem and Acacia'],
        ], ['Quinine and reserpine are medicines.', 'Rubber is made from latex.']),
        mcq('exsec', 'Waste removed = excretion; useful product released = secretion.', [
          ['Which of these is a secretion, not excretion?', 'Saliva', ['Urine', 'Sweat', 'Carbon dioxide breathed out'], 'It helps digestion.', 'Saliva is a useful product released by glands.'],
          ['Malpighian tubules are the excretory organs of…', 'Insects', ['Earthworms', 'Flatworms', 'Fish'], 'Cockroach.', 'Insects excrete uric acid through Malpighian tubules.'],
          ['Plants get rid of some wastes by…', 'Shedding leaves and bark', ['Sweating', 'Using kidneys', 'Contractile vacuoles'], 'Think of autumn leaf fall.', 'Wastes stored in leaves and bark are lost when these fall.'],
          ['Which nitrogen waste needs the least water to remove?', 'Uric acid', ['Ammonia', 'Urea', 'Carbon dioxide'], 'Birds and lizards excrete it.', 'Uric acid is almost insoluble, saving water.'],
          ['An alkaloid used to treat malaria is…', 'Quinine', ['Caffeine', 'Nicotine', 'Latex'], 'From Cinchona bark.', 'Quinine is extracted from Cinchona.'],
          ['In Amoeba, excess water is removed by the…', 'Contractile vacuole', ['Food vacuole', 'Nucleus', 'Pseudopodium'], 'It swells and bursts rhythmically.', 'The contractile vacuole pumps water out.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Coordination
// =====================================================================================
const ch5: USpec = {
  id: 'ts10.bs.ch5', subject: 'biology', title: 'Coordination', source: src(5),
  objectives: [
    {
      id: 'ts10.bs.coord.neuron', title: 'Stimulus and response; the structure of a nerve cell', prereqs: [],
      intro: [
        h('Catching a cricket ball'),
        photo('👁️', 'Your eyes see the ball, your brain works out where it will land, and your arm muscles move your hands there — all in less than half a second.'),
        p('Living things constantly sense changes around them and react. A change that an organism can detect is a stimulus; what it does in reply is a response. In animals, two systems link the two: the fast nervous system (electrical messages along nerves) and the slower endocrine system (chemical messages — hormones — in the blood).'),
        def('Stimulus', 'Any change in the surroundings or inside the body that an organism can detect, e.g. light, sound, heat, touch, a smell.'),
        def('Response', 'The action taken by an organism to a stimulus, e.g. a muscle contracting or a gland secreting.'),
        def('Receptor and effector', 'A receptor detects a stimulus (sense organs such as eye, ear, skin). An effector carries out the response (a muscle or a gland).'),
        h('The neuron — a living electric wire (labelled parts list)'),
        stepsB(
          'Dendrites: short, branched threads that receive messages from other cells.',
          'Cell body (cyton): contains the nucleus and most of the cytoplasm.',
          'Axon: a single long fibre that carries the impulse AWAY from the cell body; some are about 1 m long (from the spine to the toes).',
          'Myelin sheath: a fatty insulating covering around many axons; it makes impulses travel much faster. Gaps in it are called nodes of Ranvier.',
          'Axon terminals: branched endings that pass the message on.',
          'Synapse: a tiny gap between the axon ending of one neuron and the dendrite of the next. Chemicals (neurotransmitters such as acetylcholine) carry the message across.',
        ),
        def('Nerve impulse', 'An electrical and chemical signal that travels along a neuron.'),
        p('Three kinds of neurons: sensory neurons carry impulses from receptors to the brain or spinal cord; motor neurons carry impulses from the brain or spinal cord to muscles and glands; relay (association) neurons connect the two inside the brain and spinal cord.'),
        xp({
          title: 'What if? How long a message takes to travel a nerve', formula: 't = distance ÷ speed',
          res: ['t', 'Travel time', 'ms', '1000 * d / v', 1],
          vars: [['d', 'Length of nerve path', 'm', 0.1, 2, 0.05, 1], ['v', 'Speed of impulse', 'm/s', 1, 120, 1, 100]],
          notes: [
            ['v', 'Faster (myelinated) fibres deliver the message sooner — important for pain and muscle control.', 'Thin fibres without myelin are slow (about 1–2 m/s), so some messages arrive much later.'],
            ['d', 'A longer nerve, like from toe to spinal cord, takes longer.', 'A short path (face to brain) is very quick.'],
          ],
          mistakes: [['Forgetting to convert seconds to milliseconds', '1 m at 100 m/s takes 0.01 s, which is 10 ms.'], ['"Impulses travel at the speed of electricity in wires."', 'Nerve impulses are far slower — at most about 120 m/s — because they involve ions moving across membranes.']],
          real: 'Stub your toe and you may feel a sharp pain first (fast fibres) and a dull ache a moment later (slow fibres).',
        }),
        keys('Stimulus → receptor → nerve → brain/spinal cord → nerve → effector → response.', 'Neuron: dendrites → cell body → axon → axon terminals → synapse.', 'Myelin speeds up impulses.', 'Sensory, motor and relay neurons.'),
        remember('Exam trap: impulses travel dendrite → cell body → axon, in ONE direction only, because chemicals cross the synapse from the axon side.'),
        tip('Memory hook: "Dendrites Detect, Axons Away."'),
      ],
      examples: [
        ex('Name the stimulus, receptor, effector and response when you pull your hand away from a hot vessel.', ['Stimulus: heat.', 'Receptor: heat receptors in the skin of the fingers.', 'Effector: arm muscles.', 'Response: the hand is pulled back.'], 'Heat → skin → arm muscles → hand withdrawn.'),
        ex('An impulse travels 1.2 m along a nerve at 60 m/s. How long does it take?', ['t = d ÷ v', 't = 1.2 ÷ 60 = 0.02 s', '0.02 s = 20 ms'], '20 milliseconds'),
      ],
      practice: [
        orderT('neuron', 'Arrange the parts of a neuron in the direction an impulse travels.', ['Dendrite', 'Cell body', 'Axon', 'Axon terminal', 'Synapse'],
          ['The message is received by branched threads.', 'It crosses a gap to reach the next cell.'], 'Dendrite → cell body → axon → axon terminal → synapse.'),
        matchT('parts', 'part of the neuron to its job', [
          ['Dendrite', 'Receives messages'], ['Cell body', 'Contains the nucleus'], ['Axon', 'Carries impulse away from cell body'], ['Myelin sheath', 'Insulates and speeds up impulse'], ['Synapse', 'Gap where chemicals pass the message'],
        ], ['The insulating coat is fatty.', 'The gap between two neurons is not a part of either.']),
        tp('speed', (r) => {
          const d = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2]);
          const v = r.pick([10, 20, 40, 50, 80, 100]);
          const t = rd((1000 * d) / v, 2);
          return numQ(`A nerve impulse travels ${d} m along a nerve at ${v} m/s. How many milliseconds does it take?`, t,
            ['time = distance ÷ speed (in seconds).', 'Multiply by 1000 to change seconds to milliseconds.'],
            [`t = ${d} ÷ ${v} = ${rd(d / v, 5)} s`, `= ${t} ms`],
            [{ when: String(rd(d / v, 5)), explain: 'That is in seconds. Multiply by 1000 for milliseconds.' }], 0.01, 'ms');
        }, 2),
        mcq('basics', 'Separate what detects (receptor), what acts (effector) and what connects (neurons).', [
          ['Which neuron carries impulses from a sense organ to the spinal cord?', 'Sensory neuron', ['Motor neuron', 'Relay neuron', 'Any neuron'], 'Sense → sensory.', 'Sensory neurons carry messages towards the CNS.'],
          ['An effector is a…', 'Muscle or gland', ['Sense organ', 'Neuron', 'Synapse'], 'It produces the response.', 'Muscles and glands carry out responses.'],
          ['The gap between two neurons is called the…', 'Synapse', ['Axon', 'Node of Ranvier', 'Dendrite'], 'Chemicals cross it.', 'Neurotransmitters cross the synapse.'],
          ['Nodes of Ranvier are gaps in the…', 'Myelin sheath', ['Cell body', 'Synapse', 'Dendrites'], 'The fatty covering.', 'Impulses jump from node to node, which is fast.'],
          ['Which carries chemical messages through the blood?', 'Endocrine system', ['Nervous system', 'Lymph nodes', 'Excretory system'], 'Hormones.', 'Endocrine glands release hormones into blood.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.coord.reflex', title: 'Reflex actions and the reflex arc', prereqs: ['ts10.bs.coord.neuron'],
      intro: [
        h('Faster than thinking'),
        photo('🔥', 'Touch a hot tawa by mistake and your hand jerks away before you even feel the pain.'),
        p('Some responses must happen instantly, without waiting for the brain to think. These automatic, quick, unlearned responses are reflex actions. Blinking when dust comes near the eye, sneezing, coughing, the knee-jerk when the doctor taps below your knee, and pupils narrowing in bright light are all reflexes.'),
        def('Reflex action', 'A rapid, automatic, involuntary response to a stimulus, not controlled by conscious thought.'),
        def('Reflex arc', 'The pathway taken by nerve impulses in a reflex action: receptor → sensory neuron → spinal cord (relay neuron) → motor neuron → effector.'),
        h('The reflex arc step by step (hot object)'),
        stepsB(
          'Receptor: heat and pain receptors in the fingertip detect the hot surface.',
          'Sensory neuron: carries the impulse to the spinal cord.',
          'Relay neuron in the spinal cord: passes the impulse straight to a motor neuron (and also sends a copy up to the brain).',
          'Motor neuron: carries the impulse out to the arm muscles.',
          'Effector: arm muscles contract and the hand is pulled away.',
          'Only afterwards does the message reaching the brain make you FEEL pain and say "Ouch!".',
        ),
        p('Most limb reflexes are controlled by the spinal cord (spinal reflexes). Some, like blinking, sneezing, coughing and salivating, are controlled by the brain stem. A conditioned reflex is learned by experience — the Russian scientist Ivan Pavlov showed that dogs that heard a bell every time food came began to salivate at the bell alone. Your mouth watering when you smell biryani is a conditioned reflex.'),
        h('Measure your own reaction time — the ruler drop'),
        p('A friend holds a 30 cm ruler just above your open fingers and drops it without warning; you catch it. The distance it falls tells you your reaction time (this is a voluntary reaction, slower than a true reflex).'),
        xp({
          title: 'What if? Reaction time from the ruler-drop test', formula: 't = √(2d / g)',
          res: ['t', 'Reaction time', 'ms', '1000 * sqrt(2 * (d / 100) / 9.8)', 0],
          vars: [['d', 'Distance the ruler fell before you caught it', 'cm', 2, 30, 0.5, 15]],
          notes: [['d', 'A longer fall means you were slower — but time grows only with the square root of distance, so doubling the distance does not double the time.', 'A shorter fall means a quicker reaction.']],
          mistakes: [['Assuming time is proportional to distance', 'The ruler speeds up as it falls, so t = √(2d/g), not d ÷ constant.'], ['Leaving d in cm in the formula', 'Use metres: 15 cm = 0.15 m.']],
          real: 'Most teenagers catch the ruler after 10–20 cm, a reaction time of about 0.14–0.2 s. A spinal reflex is faster still.',
        }),
        keys('Reflexes are fast, automatic and involuntary; they protect the body.', 'Arc: receptor → sensory neuron → relay neuron (spinal cord) → motor neuron → effector.', 'Conditioned reflexes are learned (Pavlov).'),
        remember('Exam trap: in a spinal reflex the response happens BEFORE the brain registers pain. The brain is informed but not needed to start the response.'),
        tip('Memory hook for the arc: "Real Smart Rabbits Move Easily" — Receptor, Sensory, Relay, Motor, Effector.'),
      ],
      examples: [
        ex('Draw (as a list) the reflex arc for the knee-jerk.', ['Receptor: stretch receptors in the thigh muscle when the tendon is tapped.', 'Sensory neuron → spinal cord.', 'In the knee-jerk the sensory neuron connects directly to the motor neuron (no relay neuron — one of the simplest arcs).', 'Motor neuron → thigh muscle.', 'Effector: thigh muscle contracts; lower leg kicks forward.'], 'Stretch receptor → sensory neuron → spinal cord → motor neuron → thigh muscle → kick.'),
        ex('Kavya\'s ruler falls 20 cm before she catches it. Find her reaction time (g = 9.8 m/s²).', ['d = 20 cm = 0.2 m', 't = √(2 × 0.2 ÷ 9.8) = √0.0408', 't ≈ 0.202 s ≈ 202 ms'], 'About 0.2 seconds'),
      ],
      practice: [
        orderT('arc', 'Arrange the parts of a reflex arc in order.', ['Receptor', 'Sensory neuron', 'Relay neuron in spinal cord', 'Motor neuron', 'Effector'],
          ['Detection comes first.', 'The muscle acts last.'], 'Receptor → sensory neuron → relay neuron → motor neuron → effector.'),
        tapT('tap-reflex', 'Tap every example of a REFLEX action.', [
          ['Blinking when dust approaches', true], ['Sneezing', true], ['Knee-jerk', true], ['Pulling hand from a hot object', true], ['Pupil narrowing in bright light', true],
          ['Writing an exam answer', false], ['Riding a bicycle on purpose', false], ['Choosing a dosa from a menu', false],
        ], ['Reflexes are automatic — you do not decide to do them.', 'Writing and choosing need thinking.'], 'Reflexes are automatic: blinking, sneezing, knee-jerk, withdrawal, pupil response.', 6),
        tp('ruler', (r) => {
          const d = r.pick([5, 8, 10, 12, 15, 18, 20, 25]);
          const t = rd(1000 * Math.sqrt((2 * d / 100) / 9.8), 0);
          return numQ(`In a ruler-drop test the ruler falls ${d} cm before it is caught. Using t = √(2d/g) with g = 9.8 m/s², find the reaction time in milliseconds (nearest whole number).`, t,
            [`Convert to metres: ${d} cm = ${d / 100} m.`, 'Work out 2d ÷ 9.8, take the square root (seconds), then × 1000.'],
            [`2d/g = ${rd((2 * d) / 100 / 9.8, 5)}`, `√ = ${rd(Math.sqrt((2 * d) / 100 / 9.8), 4)} s`, `≈ ${t} ms`],
            [], 0.02, 'ms');
        }, 3),
        mcq('reflex', 'Reflexes are automatic; conditioned reflexes are learned.', [
          ['Which part of the nervous system controls the knee-jerk reflex?', 'Spinal cord', ['Cerebrum', 'Cerebellum', 'Eye'], 'It is a spinal reflex.', 'The knee-jerk is coordinated by the spinal cord.'],
          ['Mouth watering at the smell of food you like is a…', 'Conditioned reflex', ['Voluntary action', 'Spinal reflex only', 'Hormonal response'], 'It is learned by experience.', 'Pavlov\'s experiments showed such learned reflexes.'],
          ['Who studied conditioned reflexes using dogs and a bell?', 'Ivan Pavlov', ['Charles Darwin', 'William Harvey', 'Mendel'], 'A Russian physiologist.', 'Pavlov showed dogs could learn to salivate at a bell.'],
          ['Why are reflexes useful?', 'They protect the body by responding quickly', ['They help us think', 'They make hormones', 'They store memories'], 'Think of the hot tawa.', 'Quick automatic responses prevent injury.'],
          ['In a reflex arc, the motor neuron carries impulses to the…', 'Effector (muscle or gland)', ['Receptor', 'Brain only', 'Sense organ'], 'Motor = movement.', 'Motor neurons take messages to effectors.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.coord.cns', title: 'Brain, spinal cord, peripheral and autonomic nervous system', prereqs: ['ts10.bs.coord.reflex'],
      intro: [
        h('The control room'),
        photo('📖', 'Reading this sentence uses your cerebrum; keeping your balance on the bus uses your cerebellum; your breathing carries on by itself thanks to the medulla.'),
        p('The nervous system has two main parts. The central nervous system (CNS) is the brain and spinal cord — it receives information and decides. The peripheral nervous system (PNS) is all the nerves that connect the CNS to every part of the body.'),
        h('Protection'),
        p('The brain (about 1.3–1.4 kg in an adult) is protected by the skull (cranium) and the spinal cord by the backbone (vertebral column). Both are wrapped in three membranes called meninges, with cerebrospinal fluid (CSF) between them acting as a shock absorber and supplying nutrients.'),
        def('Meninges', 'Three protective membranes around the brain and spinal cord.'),
        h('Parts of the brain and their jobs'),
        stepsB(
          'Forebrain — Cerebrum: the largest part, two hemispheres joined by the corpus callosum. Thinking, memory, intelligence, speech, voluntary movement and the senses (vision at the back, hearing at the sides).',
          'Forebrain — Thalamus: relay station for sensory messages going to the cerebrum.',
          'Forebrain — Hypothalamus: controls hunger, thirst, body temperature, sleep and the pituitary gland.',
          'Midbrain: reflexes of the eye and ear, such as turning the head towards a sudden sound.',
          'Hindbrain — Cerebellum: balance, posture and smooth coordination of muscle movements.',
          'Hindbrain — Pons: relays messages and helps regulate breathing.',
          'Hindbrain — Medulla oblongata: controls involuntary actions — heartbeat, breathing, blood pressure, swallowing, coughing, sneezing and vomiting.',
        ),
        h('Spinal cord'),
        p('The spinal cord runs from the medulla down through the backbone (about 45 cm). It carries messages between brain and body and controls spinal reflexes. Unlike the brain, its white matter (nerve fibres) is outside and its grey matter (cell bodies, butterfly-shaped in cross-section) is inside.'),
        h('Peripheral and autonomic nervous system'),
        p('The PNS has 12 pairs of cranial nerves (from the brain) and 31 pairs of spinal nerves (from the spinal cord). Part of it, the autonomic nervous system, controls organs we cannot move at will — heart, gut, glands, pupils.'),
        def('Sympathetic system', 'The part of the autonomic system that prepares the body for emergencies ("fight or flight"): faster heartbeat and breathing, dilated pupils, digestion slowed.'),
        def('Parasympathetic system', 'The part that calms the body ("rest and digest"): slower heartbeat, pupils narrow, digestion speeds up.'),
        keys('CNS = brain + spinal cord; PNS = 12 pairs cranial + 31 pairs spinal nerves.', 'Cerebrum: thinking; cerebellum: balance; medulla: heartbeat and breathing; hypothalamus: hunger, thirst, temperature.', 'Autonomic: sympathetic speeds up, parasympathetic slows down.'),
        remember('Exam trap: balance = CEREBELLUM, not cerebrum. Involuntary actions like heartbeat = MEDULLA.'),
        tip('Memory hook: "CereBELLum keeps you on BALance like a BELL on a bicycle."'),
      ],
      examples: [
        ex('After a head injury, a man can think and talk normally but walks unsteadily and cannot touch his nose with eyes closed. Which part is likely injured?', ['Thinking and speech are cerebrum functions — these are fine.', 'Balance and coordination of movement are lost.', 'These are controlled by the cerebellum.'], 'Cerebellum.'),
        ex('A dog suddenly barks at Arjun. Describe two changes the sympathetic system makes.', ['It prepares the body to respond to danger.', 'Heart rate and breathing rate increase, sending more oxygen to muscles.', 'Pupils dilate; digestion slows; adrenaline is released.'], 'Faster heartbeat and breathing; dilated pupils (also slower digestion).'),
      ],
      practice: [
        matchT('brain', 'part of the brain to its function', [
          ['Cerebrum', 'Thinking, memory and voluntary actions'], ['Cerebellum', 'Balance and coordination of movement'], ['Medulla oblongata', 'Heartbeat, breathing and swallowing'],
          ['Hypothalamus', 'Hunger, thirst and body temperature'], ['Thalamus', 'Relay of sensory messages'], ['Midbrain', 'Eye and ear reflexes'],
        ], ['Balance is the small part at the back.', 'Involuntary vital actions are in the medulla.']),
        mcq('cns', 'Decide whether the action is voluntary (cerebrum) or involuntary (medulla, autonomic).', [
          ['How many pairs of spinal nerves do humans have?', '31', ['12', '21', '43'], 'More than cranial nerves.', 'There are 31 pairs of spinal nerves and 12 pairs of cranial nerves.', { '12': 'That is the number of cranial nerve pairs.' }],
          ['Which part controls heartbeat and breathing?', 'Medulla oblongata', ['Cerebrum', 'Cerebellum', 'Thalamus'], 'It is in the hindbrain, joining the spinal cord.', 'The medulla controls involuntary vital functions.'],
          ['The membranes covering the brain are called…', 'Meninges', ['Pericardium', 'Pleura', 'Myelin'], 'Infection of them is meningitis.', 'Three meninges protect the CNS.'],
          ['Which system prepares the body for "fight or flight"?', 'Sympathetic nervous system', ['Parasympathetic nervous system', 'Central nervous system only', 'Lymphatic system'], 'It speeds things up.', 'The sympathetic system raises heart rate and dilates pupils.'],
          ['In the spinal cord, grey matter is…', 'Inside, surrounded by white matter', ['Outside, covering white matter', 'Absent', 'Only in the brain'], 'It is the opposite of the brain.', 'Grey matter is central (butterfly-shaped) in the spinal cord.'],
          ['Which part of the brain is the largest?', 'Cerebrum', ['Cerebellum', 'Medulla', 'Pons'], 'Two hemispheres.', 'The cerebrum is the largest part of the human brain.'],
        ]),
        tapT('tap-symp', 'Tap every change produced by the SYMPATHETIC system.', [
          ['Heart beats faster', true], ['Pupils dilate', true], ['Breathing becomes faster', true], ['Digestion slows down', true], ['Heart beats slower', false], ['Pupils narrow', false], ['More saliva for digestion', false],
        ], ['Sympathetic = emergency mode.', 'Rest-and-digest changes belong to the parasympathetic system.'], 'Sympathetic: faster heart and breathing, dilated pupils, slower digestion.'),
      ],
    },
    {
      id: 'ts10.bs.coord.hormones', title: 'Hormones, endocrine glands and feedback', prereqs: ['ts10.bs.coord.cns'],
      intro: [
        h('Chemical messengers'),
        photo('💊', 'Many families in India know someone who takes insulin or diabetes tablets. Diabetes is a problem of one hormone.'),
        p('Not all coordination is electrical. Endocrine glands release chemicals called hormones directly into the blood. Hormones travel everywhere but act only on certain target organs. Their effects are slower than nerve impulses but last longer — growth, puberty and blood sugar are all controlled this way.'),
        def('Hormone', 'A chemical messenger secreted in small amounts by an endocrine gland into the blood, acting on a specific target organ.'),
        def('Endocrine gland', 'A ductless gland that releases its secretion (hormone) straight into the blood. (Exocrine glands, like salivary glands, use ducts.)'),
        h('The story of insulin'),
        p('Doctors had long known that people with diabetes pass sugar in their urine. In 1921, Frederick Banting and Charles Best in Canada extracted insulin from the pancreas of dogs and showed that it lowered blood sugar in diabetic dogs. Soon insulin was saving human lives.'),
        h('Main endocrine glands'),
        stepsB(
          'Pituitary (below the brain, "master gland"): growth hormone (too little in childhood → dwarfism; too much → gigantism), TSH (controls thyroid), ADH (water balance) and hormones that control other glands.',
          'Thyroid (neck): thyroxine — controls the rate of metabolism; needs iodine. Lack of iodine → goitre (swollen neck). Iodised salt prevents it.',
          'Parathyroid (on the thyroid): parathormone — controls calcium levels in blood.',
          'Adrenal (on top of each kidney): adrenaline — emergency hormone (fast heart, more glucose in blood); the outer part also makes cortisol and aldosterone.',
          'Pancreas — islets of Langerhans: insulin (lowers blood glucose) and glucagon (raises blood glucose). Too little insulin → diabetes mellitus.',
          'Testes: testosterone — male sex characters at puberty. Ovaries: oestrogen and progesterone — female sex characters; menstrual cycle.',
          'Pineal gland (in the brain): melatonin — sleep cycles. Thymus (chest): helps immunity in children.',
        ),
        h('Feedback — the body\'s thermostat'),
        def('Negative feedback', 'A control system in which a change in a level triggers a response that brings the level back to normal.'),
        stepsB(
          'After a meal, blood glucose rises.',
          'The pancreas detects this and releases more insulin.',
          'Insulin makes the liver and muscles take up glucose and store it as glycogen.',
          'Blood glucose falls back to normal, so insulin release slows down.',
          'If glucose falls too low, glucagon is released to raise it again.',
        ),
        p('The thyroid works the same way: low thyroxine → pituitary releases more TSH → thyroid makes more thyroxine → high thyroxine switches TSH down.'),
        keys('Hormones: chemical, via blood, slower, longer-lasting.', 'Pituitary = master gland; thyroid = thyroxine (iodine); adrenal = adrenaline; pancreas = insulin + glucagon.', 'Negative feedback keeps hormone levels and blood sugar steady.'),
        remember('Exam trap: insulin LOWERS blood sugar; glucagon RAISES it. Goitre is due to lack of iodine in the diet.'),
        tip('Memory hook: "INsulin puts glucose IN to cells; glucaGON — glucose GOne? bring it back."'),
      ],
      examples: [
        ex('Explain how blood glucose returns to normal after eating sweets.', ['Glucose from the sweets enters the blood; level rises.', 'Pancreas releases more insulin.', 'Insulin makes cells take up glucose and the liver store it as glycogen.', 'Level falls; insulin release reduces — negative feedback.'], 'Insulin is released, glucose is stored, and feedback switches insulin off.'),
        ex('People in some hilly areas far from the sea once commonly had swollen necks. Why, and what was the fix?', ['Their soil and water had little iodine.', 'The thyroid needs iodine to make thyroxine and enlarges trying to make more — goitre.', 'Adding iodine to salt solved it.'], 'Iodine deficiency → goitre; iodised salt prevents it.'),
      ],
      practice: [
        matchT('glands', 'gland to its hormone', [
          ['Pituitary', 'Growth hormone'], ['Thyroid', 'Thyroxine'], ['Adrenal', 'Adrenaline'], ['Pancreas', 'Insulin'], ['Testes', 'Testosterone'], ['Ovaries', 'Oestrogen'], ['Parathyroid', 'Parathormone'],
        ], ['The thyroid needs iodine for its hormone.', 'The emergency hormone comes from glands on the kidneys.']),
        orderT('feedback', 'Arrange the negative feedback steps after a meal.', ['Blood glucose rises', 'Pancreas releases insulin', 'Cells take up glucose; liver stores glycogen', 'Blood glucose falls to normal', 'Insulin secretion decreases'],
          ['Start with the change.', 'Feedback ends by switching the hormone down.'], 'Glucose up → insulin → glucose stored → glucose normal → insulin down.', 2),
        mcq('hormones', 'Name the gland, then the hormone, then its effect.', [
          ['Which hormone lowers blood glucose?', 'Insulin', ['Glucagon', 'Adrenaline', 'Thyroxine'], 'Made by beta cells of the islets.', 'Insulin helps cells take in glucose.', { Glucagon: 'Glucagon RAISES blood glucose.' }],
          ['Which gland is called the master gland?', 'Pituitary', ['Thyroid', 'Adrenal', 'Pancreas'], 'It controls other glands.', 'The pituitary controls many other endocrine glands.'],
          ['Goitre is caused by lack of…', 'Iodine', ['Iron', 'Calcium', 'Vitamin C'], 'Thyroxine contains it.', 'Without iodine the thyroid cannot make thyroxine.'],
          ['Who extracted insulin in 1921?', 'Banting and Best', ['Mendel and Darwin', 'Harvey and Malpighi', 'Black and Priestley'], 'Canadian scientists.', 'Banting and Best first isolated insulin.'],
          ['Endocrine glands are called ductless because they…', 'Release hormones directly into blood', ['Have no blood supply', 'Make no secretions', 'Are inside bones'], 'No tube carries their secretion.', 'Hormones go straight into the bloodstream.'],
          ['The "emergency hormone" is…', 'Adrenaline', ['Insulin', 'Melatonin', 'Thyroxine'], 'From the adrenal gland.', 'Adrenaline prepares the body for fight or flight.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.coord.plants', title: 'Coordination in plants: hormones, tropic and nastic movements', prereqs: ['ts10.bs.coord.hormones'],
      intro: [
        h('Plants respond too — just slowly'),
        photo('🌱', 'A bean seedling on a window sill bends towards the light within a day or two.'),
        p('Plants have no nerves or muscles, yet they respond to light, gravity, water and touch. They use plant hormones (phytohormones) and changes in water pressure (turgor) inside cells.'),
        def('Phytohormones', 'Chemical substances made in small amounts by plants that control growth and responses.'),
        stepsB(
          'Auxins — made at shoot tips; cause cells to elongate; responsible for bending towards light.',
          'Gibberellins — stem elongation, seed germination, flowering; used to make grapes bigger.',
          'Cytokinins — promote cell division; delay ageing of leaves.',
          'Abscisic acid (ABA) — a growth inhibitor: closes stomata in drought, keeps seeds and buds dormant, causes leaf fall.',
          'Ethylene — a gas that ripens fruits. A ripe banana placed with raw mangoes speeds their ripening. (Ripening with calcium carbide is banned because it is harmful.)',
        ),
        h('Discovering auxin'),
        p('Charles Darwin and his son Francis (1880) showed that grass seedlings bend towards light only if their tip is uncovered — something made in the tip travels down. In 1926 Frits Went collected this substance in agar blocks from tips; placing a block on one side of a cut seedling made it bend. He named it auxin. Auxin collects on the shaded side of a shoot, so cells there grow longer and the shoot bends towards the light.'),
        h('Tropic movements — directional growth'),
        def('Tropism', 'A slow growth movement of a plant part in a direction set by the stimulus: towards it (positive) or away from it (negative).'),
        stepsB(
          'Phototropism (light): shoots grow towards light (+); roots away (−).',
          'Geotropism (gravity): roots grow down (+); shoots grow up (−).',
          'Hydrotropism (water): roots grow towards water (+).',
          'Chemotropism (chemicals): the pollen tube grows towards the ovule.',
          'Thigmotropism (touch): tendrils of bitter gourd, cucumber and pea coil around a support.',
        ),
        h('Nastic movements — non-directional, often quick'),
        def('Nastic movement', 'A response whose direction does not depend on the direction of the stimulus; usually caused by changes in turgor (water) in cells, not by growth.'),
        p('Touch-me-not (Mimosa pudica) folds its leaflets within seconds when touched — cells at the leaf base lose water and go limp (thigmonasty/seismonasty). Leaves of tamarind and many legumes fold at night (nyctinasty). Some flowers open in the morning and close at night in response to light (photonasty). The Venus flytrap snaps shut on an insect.'),
        keys('Auxin (elongation, phototropism), gibberellin (stem growth), cytokinin (cell division), ABA (inhibitor, stomata closing), ethylene (ripening).', 'Tropic = growth towards/away from a directional stimulus; slow.', 'Nastic = non-directional, by turgor change; e.g. Mimosa.'),
        remember('Exam trap: roots are POSITIVELY geotropic and NEGATIVELY phototropic; shoots are the opposite.'),
        tip('Memory hook: Geo = Earth (gravity); Hydro = water; Photo = light; Thigmo = touch; Chemo = chemicals.'),
      ],
      examples: [
        ex('A potted plant is laid on its side in the dark for two days. Predict what the root and shoot do.', ['No light, so only gravity acts.', 'Roots are positively geotropic → curve downward.', 'Shoot is negatively geotropic → curves upward.'], 'Root bends down; shoot bends up (geotropism).'),
        ex('Why do Mimosa leaves fold quickly while a sunflower stem bends slowly?', ['Mimosa: touch causes cells at the leaf base to lose water quickly — a turgor change (nastic).', 'Stem bending: auxin makes shaded cells grow longer — growth takes hours or days (tropic).'], 'Mimosa: fast turgor change (nastic). Stem: slow growth by auxin (tropic).'),
      ],
      practice: [
        matchT('tropism', 'movement to its example', [
          ['Phototropism', 'Shoot bending towards a window'], ['Geotropism', 'Root growing downwards'], ['Hydrotropism', 'Root growing towards water'], ['Chemotropism', 'Pollen tube growing to the ovule'],
          ['Thigmotropism', 'Tendril coiling round a stick'], ['Thigmonasty', 'Mimosa leaves folding on touch'],
        ], ['Thigmo = touch; nasty = non-directional.', 'Chemo = chemicals released by the ovule.']),
        matchT('phyto', 'plant hormone to its effect', [
          ['Auxin', 'Cell elongation; bending towards light'], ['Gibberellin', 'Stem elongation and seed germination'], ['Cytokinin', 'Cell division; delays leaf ageing'], ['Abscisic acid', 'Closes stomata; dormancy'], ['Ethylene', 'Fruit ripening'],
        ], ['One of them is a gas.', 'The inhibitor helps in drought.']),
        mcq('plants', 'Tropic = growth with direction; nastic = no direction.', [
          ['Folding of Mimosa leaves on touch is…', 'A nastic movement', ['Phototropism', 'Geotropism', 'Chemotropism'], 'It is fast and non-directional.', 'It is caused by turgor changes, not growth.', { Phototropism: 'Light is not the stimulus here.' }],
          ['Roots growing downward show…', 'Positive geotropism', ['Negative geotropism', 'Positive phototropism', 'Nastic movement'], 'Towards gravity.', 'Roots grow towards gravity.'],
          ['Which hormone is a gas?', 'Ethylene', ['Auxin', 'Gibberellin', 'Cytokinin'], 'It ripens fruits.', 'Ethylene is a gaseous plant hormone.'],
          ['Who named auxin after collecting it in agar blocks?', 'Frits Went', ['Charles Darwin', 'Mendel', 'Robert Hill'], '1926.', 'Went showed a chemical from the tip causes bending.'],
          ['Auxin makes a shoot bend towards light because it…', 'Collects on the shaded side and makes those cells grow longer', ['Is destroyed on the shaded side', 'Makes the lit side grow faster', 'Closes stomata'], 'Which side grows more?', 'Faster growth on the shaded side bends the shoot towards light.'],
          ['Which hormone closes stomata during drought?', 'Abscisic acid', ['Auxin', 'Gibberellin', 'Ethylene'], 'A stress hormone.', 'ABA closes stomata to save water.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Reproduction
// =====================================================================================
const ch6: USpec = {
  id: 'ts10.bs.ch6', subject: 'biology', title: 'Reproduction', source: src(6),
  objectives: [
    {
      id: 'ts10.bs.repro.asexual', title: 'Asexual reproduction and vegetative propagation', prereqs: [],
      intro: [
        h('One parent, many copies'),
        photo('🥔', 'A potato left in a dark corner sprouts from its "eyes". Each eye can grow into a whole new potato plant.'),
        p('Reproduction is how living things produce new individuals of their own kind. In asexual reproduction a single parent produces offspring without gametes (sex cells). The offspring are genetically identical to the parent — clones.'),
        def('Asexual reproduction', 'Reproduction by a single parent without the fusion of gametes; offspring are identical to the parent.'),
        h('Methods'),
        stepsB(
          'Fission: the parent cell divides. Binary fission — into two (Amoeba, Paramoecium, bacteria). Multiple fission — into many at once (Plasmodium, the malaria parasite).',
          'Budding: a small outgrowth (bud) grows and separates (yeast, Hydra).',
          'Fragmentation: the body breaks into pieces and each grows into a new individual (Spirogyra).',
          'Regeneration: a lost part regrows, and in some animals a piece grows into a whole new animal (Planaria).',
          'Spore formation: tiny spores in sporangia are released and grow in damp places (bread mould Rhizopus, ferns, mushrooms).',
          'Parthenogenesis: an egg develops without fertilisation (male honeybees/drones). Parthenocarpy: fruit forms without fertilisation, giving seedless fruits (seedless grapes, banana).',
        ),
        h('Vegetative propagation in plants'),
        def('Vegetative propagation', 'Growth of a new plant from a vegetative part — root, stem or leaf — of the parent, without seeds.'),
        stepsB(
          'Natural — stem: potato tuber (eyes), ginger and turmeric rhizomes, onion bulb, Colocasia corm, grass runners.',
          'Natural — root: sweet potato, dahlia. Natural — leaf: Bryophyllum makes plantlets on the notches of its leaves.',
          'Artificial — cutting: a piece of stem planted in soil roots (rose, sugarcane, hibiscus).',
          'Artificial — layering: a branch is bent into the soil, roots form, then it is cut off (jasmine, grapevine).',
          'Artificial — grafting: a shoot (scion) of a desired variety is joined onto a rooted plant (stock) — common for mango and citrus.',
          'Artificial — tissue culture: a few cells are grown in a nutrient medium to give thousands of identical plantlets (banana, orchids).',
        ),
        p('Advantages: fast; all plants are true copies of a good variety; seedless plants like banana can be grown. Disadvantage: no variation, so a disease can wipe out all the identical plants.'),
        xp({
          title: 'What if? Bacteria multiplying by binary fission', formula: 'N = N₀ × 2^(t / g)',
          res: ['N', 'Number of bacteria', '', 'N0 * 2^(t / g)', 0],
          vars: [['N0', 'Starting number', '', 1, 100, 1, 10], ['t', 'Time passed', 'min', 0, 240, 10, 120], ['g', 'Time for one division', 'min', 20, 120, 5, 30]],
          notes: [
            ['t', 'Every extra generation time DOUBLES the number — growth speeds up dramatically.', 'Going back in time halves the number for each generation.'],
            ['g', 'If bacteria divide more slowly (cold fridge), far fewer are formed — this is why we refrigerate food.', 'Faster division (warm kitchen) makes numbers explode.'],
            ['N0', 'Twice as many to start gives twice as many at every time.', 'Fewer to start gives proportionally fewer.'],
          ],
          mistakes: [['Adding 2 each generation instead of doubling', 'Each cell becomes two, so the number is MULTIPLIED by 2 every generation.'], ['Counting generations wrongly', 'Generations = time ÷ division time: 120 min ÷ 20 min = 6, so ×2⁶ = ×64.']],
          real: 'Some bacteria divide every 20 minutes in warm food: one cell could become over 2.5 lakh in 6 hours. That is why cooked rice should not be left out on a summer day.',
        }),
        keys('Asexual: one parent, no gametes, identical offspring.', 'Fission, budding, fragmentation, regeneration, spores, parthenogenesis.', 'Vegetative propagation: natural (tuber, rhizome, bulb, Bryophyllum leaf) and artificial (cutting, layering, grafting, tissue culture).'),
        remember('Exam trap: Amoeba shows binary fission; Plasmodium shows multiple fission; yeast and Hydra show budding.'),
        tip('In grafting, the Scion is the Shoot on top; the Stock is the Stump with roots.'),
      ],
      examples: [
        ex('Why do mango farmers in Jagtial prefer grafted saplings over seedlings?', ['Plants from seeds show variation — the fruit may be poorer.', 'A grafted scion from a good variety gives identical fruit quality.', 'Grafted plants also bear fruit sooner.'], 'Grafting keeps the desired variety and fruits earlier.'),
        ex('Starting with 1 bacterium dividing every 20 minutes, how many bacteria after 2 hours?', ['Generations = 120 ÷ 20 = 6.', 'N = 1 × 2⁶ = 64.'], '64 bacteria'),
      ],
      practice: [
        matchT('method', 'organism to its method of asexual reproduction', [
          ['Amoeba', 'Binary fission'], ['Plasmodium', 'Multiple fission'], ['Yeast', 'Budding'], ['Spirogyra', 'Fragmentation'], ['Planaria', 'Regeneration'], ['Rhizopus (bread mould)', 'Spore formation'],
        ], ['Malaria parasite splits into many at once.', 'Hydra and yeast form buds.']),
        matchT('veg', 'plant to the part used for propagation', [
          ['Potato', 'Stem tuber (eyes)'], ['Ginger', 'Rhizome'], ['Onion', 'Bulb'], ['Bryophyllum', 'Leaf notches'], ['Sweet potato', 'Root'], ['Rose', 'Stem cutting'],
        ], ['Potato is a stem, not a root!', 'Bryophyllum plantlets grow on leaf edges.']),
        tp('fission', (r) => {
          const n0 = r.pick([1, 2, 5, 10]);
          const g = r.pick([20, 30]);
          const gens = r.pick([2, 3, 4, 5, 6]);
          const t = g * gens;
          const n = n0 * 2 ** gens;
          return numQ(`${n0} bacteri${n0 === 1 ? 'um divides' : 'a divide'} by binary fission every ${g} minutes. How many bacteria will there be after ${t} minutes (assume none die)?`, n,
            [`Number of divisions = ${t} ÷ ${g} = ${gens}.`, `Each division doubles the number: N = ${n0} × 2^${gens}.`],
            [`Generations = ${gens}`, `2^${gens} = ${2 ** gens}`, `N = ${n0} × ${2 ** gens} = ${n}`],
            [{ when: String(n0 * 2 * gens), explain: 'You multiplied by 2 × generations. The number DOUBLES each time: multiply by 2 repeatedly.' }], 0.001);
        }, 2),
        mcq('asex', 'One parent, no gametes, identical offspring.', [
          ['Offspring of asexual reproduction are…', 'Genetically identical to the parent', ['Always different from the parent', 'Formed from two parents', 'Always seedless'], 'No mixing of genes.', 'Only one parent\'s genes, copied exactly.'],
          ['Seedless fruit formed without fertilisation is called…', 'Parthenocarpy', ['Parthenogenesis', 'Budding', 'Grafting'], 'Carpy = fruit.', 'Parthenocarpy gives seedless fruits like banana.'],
          ['In grafting, the upper part that is joined is the…', 'Scion', ['Stock', 'Tuber', 'Rhizome'], 'The stock has roots.', 'The scion is the shoot of the desired variety.'],
          ['Thousands of banana plantlets from a few cells are produced by…', 'Tissue culture', ['Layering', 'Fragmentation', 'Spore formation'], 'Grown in a nutrient medium in a lab.', 'Tissue culture (micropropagation).'],
          ['A disadvantage of vegetative propagation is…', 'No variation, so all plants may suffer from the same disease', ['It is slow', 'Plants differ from parents', 'It needs pollinators'], 'Clones are all alike.', 'Lack of variation reduces adaptability.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.repro.human', title: 'Human reproductive systems, fertilisation and the menstrual cycle', prereqs: ['ts10.bs.coord.hormones'],
      intro: [
        h('Growing up: puberty'),
        photo('👩', 'Every one of us began as a single cell — a fertilised egg — inside our mother.'),
        p('Humans reproduce sexually: a male gamete (sperm) fuses with a female gamete (ovum or egg). The organs that make gametes start working at puberty, roughly 10–14 years in girls and 12–15 in boys, under the control of hormones. The body changes — growth spurt, voice changes, body hair, and the start of menstruation in girls. These changes are natural and differ in timing from person to person.'),
        def('Gametes', 'Sex cells — sperm in males and ova (eggs) in females — each with half the normal number of chromosomes (23 in humans).'),
        def('Fertilisation', 'The fusion of a sperm and an ovum to form a zygote.'),
        h('Male reproductive system (parts list)'),
        stepsB(
          'Testes (2): make sperm and the hormone testosterone. They lie in a pouch outside the abdomen, the scrotum, because sperm form best at a temperature 2–3 °C lower than body temperature.',
          'Epididymis: a coiled tube on each testis where sperm are stored and mature.',
          'Vas deferens (sperm ducts): carry sperm towards the urethra.',
          'Seminal vesicles, prostate gland and Cowper\'s glands: add fluids that nourish sperm and help them move; sperm + fluid = semen.',
          'Urethra and penis: the urethra carries semen (and, at other times, urine) out of the body.',
        ),
        p('A sperm has a head (with the nucleus), a middle piece (full of mitochondria for energy) and a tail for swimming.'),
        h('Female reproductive system (parts list)'),
        stepsB(
          'Ovaries (2): produce ova and the hormones oestrogen and progesterone. A girl is born with all her immature eggs; from puberty, usually one egg is released about every 28 days.',
          'Oviducts (fallopian tubes): carry the egg from the ovary to the uterus. Fertilisation takes place here.',
          'Uterus (womb): a muscular, pear-shaped organ where the baby develops.',
          'Cervix: the narrow neck of the uterus.',
          'Vagina: the passage from the cervix to outside; also the birth canal.',
        ),
        h('From zygote to birth'),
        stepsB(
          'The zygote divides repeatedly as it moves down the oviduct to become an embryo.',
          'The embryo attaches to the thick wall of the uterus (implantation).',
          'A placenta forms. Through the umbilical cord the baby gets oxygen and food from the mother\'s blood and passes wastes to it — the two bloods do not mix.',
          'The developing baby (foetus) grows for about 9 months (about 280 days) — the gestation period.',
          'At birth, the muscles of the uterus contract strongly and push the baby out through the vagina.',
        ),
        h('The menstrual cycle (about 28 days; it varies)'),
        stepsB(
          'Days 1–5, menstruation: if no egg was fertilised, the thick uterine lining breaks down and leaves the body with some blood.',
          'Days 6–13, follicle phase: an egg matures inside a follicle in the ovary; oestrogen rebuilds the uterine lining.',
          'Around day 14, ovulation: the egg is released into the oviduct.',
          'Days 15–28: the empty follicle (corpus luteum) makes progesterone, which keeps the lining thick and ready. If no fertilisation happens, progesterone falls and the next menstruation begins.',
        ),
        p('Menstruation is a normal sign of health, not something to be ashamed of. Good hygiene — clean pads or cups changed regularly, washing, and a nutritious diet with iron — keeps girls healthy. Menstrual cycles stop at menopause, usually around 45–55 years.'),
        keys('Testes → sperm + testosterone; ovaries → ova + oestrogen, progesterone.', 'Fertilisation in the oviduct → zygote → implantation in uterus → placenta → birth after about 9 months.', 'Menstrual cycle ≈ 28 days: menstruation (1–5), lining rebuilt, ovulation (~14), luteal phase.'),
        remember('Exam trap: fertilisation happens in the OVIDUCT (fallopian tube), not in the uterus. The baby grows in the uterus.'),
        tip('Path of sperm: testis → epididymis → vas deferens → urethra. Path of an egg: ovary → oviduct → uterus.'),
      ],
      examples: [
        ex('Why are the testes located in the scrotum outside the abdomen?', ['Sperm are produced best at a temperature 2–3 °C below normal body temperature.', 'The scrotum keeps the testes slightly cooler than the inside of the abdomen.'], 'To keep them cooler for sperm production.'),
        ex('How does a foetus get oxygen inside the uterus when it cannot breathe?', ['The placenta lies very close to the mother\'s blood vessels in the uterine wall.', 'Oxygen and food diffuse from the mother\'s blood into the foetus\'s blood in the placenta.', 'The umbilical cord carries this blood to the foetus; wastes go back the other way.'], 'Through the placenta and umbilical cord, by diffusion.'),
      ],
      practice: [
        matchT('male', 'organ to its function', [
          ['Testis', 'Produces sperm and testosterone'], ['Scrotum', 'Keeps testes cooler than body'], ['Vas deferens', 'Carries sperm towards the urethra'], ['Seminal vesicle', 'Adds nourishing fluid to sperm'],
          ['Ovary', 'Produces ova, oestrogen and progesterone'], ['Oviduct', 'Site of fertilisation'], ['Uterus', 'Where the foetus develops'], ['Placenta', 'Exchange of food, oxygen and wastes with the foetus'],
        ], ['Fertilisation happens in a tube.', 'Exchange with the baby happens in a special organ formed in the uterus.']),
        orderT('pregnancy', 'Arrange the events from ovulation to birth.', ['Ovulation', 'Fertilisation in the oviduct', 'Zygote divides to form an embryo', 'Implantation in the uterus wall', 'Placenta forms and foetus grows', 'Birth'],
          ['The egg must be released first.', 'Implantation comes before the placenta forms.'], 'Ovulation → fertilisation → embryo → implantation → placenta & growth → birth.'),
        orderT('cycle', 'Arrange the phases of one menstrual cycle starting on day 1.', ['Menstruation (lining shed)', 'Egg matures; lining rebuilds', 'Ovulation (about day 14)', 'Corpus luteum makes progesterone', 'Progesterone falls if no fertilisation'],
          ['Day 1 is the first day of bleeding.', 'Ovulation is near the middle.'], 'Menstruation → follicle phase → ovulation → luteal phase → progesterone drop → next cycle.'),
        mcq('human', 'Track where each event happens.', [
          ['Where does fertilisation normally take place in humans?', 'Oviduct (fallopian tube)', ['Uterus', 'Ovary', 'Vagina'], 'The egg meets sperm on its way to the uterus.', 'Fertilisation occurs in the oviduct.', { Uterus: 'The uterus is where the embryo IMPLANTS and grows, not where fertilisation happens.' }],
          ['About how long is human gestation?', 'About 9 months (280 days)', ['About 3 months', 'About 28 days', 'About 2 years'], 'Counted from the last period.', 'Human pregnancy lasts about 9 months.'],
          ['Which hormone keeps the uterine lining thick after ovulation?', 'Progesterone', ['Testosterone', 'Insulin', 'Adrenaline'], 'Made by the corpus luteum.', 'Progesterone maintains the lining.'],
          ['How many chromosomes does a human sperm carry?', '23', ['46', '22', '44'], 'Half the body-cell number.', 'Gametes are haploid: 23 chromosomes.'],
          ['The structure joining the foetus to the placenta is the…', 'Umbilical cord', ['Oviduct', 'Cervix', 'Vas deferens'], 'Your navel marks where it was.', 'The umbilical cord carries blood between foetus and placenta.'],
          ['Ovulation in a 28-day cycle happens around…', 'Day 14', ['Day 1', 'Day 5', 'Day 28'], 'Near the middle.', 'An egg is usually released mid-cycle.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.repro.flower', title: 'Sexual reproduction in flowering plants', prereqs: ['ts10.bs.repro.asexual'],
      intro: [
        h('Why does a mango flower become a mango?'),
        photo('🌸', 'A flower is the reproductive shoot of a plant. Its bright colour and scent are adverts for pollinators.'),
        h('Parts of a flower (labelled list, outside to inside)'),
        stepsB(
          'Sepals (calyx): green, protect the bud.',
          'Petals (corolla): often coloured and scented to attract insects.',
          'Stamens (androecium) — the male part: each has a filament (stalk) and an anther that makes pollen grains.',
          'Pistil/carpel (gynoecium) — the female part: stigma (sticky top that receives pollen), style (tube), ovary (contains ovules).',
        ),
        def('Bisexual and unisexual flowers', 'Bisexual flowers have both stamens and pistil (hibiscus, mustard). Unisexual flowers have only one (papaya, cucumber, maize).'),
        h('Pollination'),
        def('Pollination', 'Transfer of pollen grains from an anther to a stigma.'),
        p('Self-pollination: pollen reaches the stigma of the same flower or another flower on the same plant. Cross-pollination: pollen reaches a flower on another plant of the same kind — this brings variation. Agents: insects (bright, scented flowers with nectar), wind (maize, grasses — light, abundant pollen; feathery stigmas), water (Vallisneria), birds and animals.'),
        h('Fertilisation — and the double fertilisation trick'),
        stepsB(
          'A pollen grain lands on a compatible stigma and grows a pollen tube down through the style (towards chemicals from the ovule — chemotropism).',
          'The pollen grain\'s generative cell gives two male gametes, which travel in the tube.',
          'The tube enters the ovule through a small opening (micropyle) and releases the two male gametes into the embryo sac.',
          'One male gamete fuses with the egg → zygote (diploid, 2n), which becomes the embryo.',
          'The other male gamete fuses with the two polar nuclei (secondary nucleus) → endosperm nucleus (triploid, 3n), which forms food tissue (endosperm).',
          'Because two fusions happen, this is called double fertilisation — found only in flowering plants (described by Nawaschin in 1898).',
        ),
        h('After fertilisation'),
        p('Ovules become seeds; the ovary becomes the fruit (its wall becomes the fruit wall, pericarp); sepals, petals and stamens usually wither and fall. A seed has a seed coat, one or two cotyledons (stored food) and an embryo with a plumule (future shoot) and radicle (future root). It germinates when given water, air and suitable warmth.'),
        keys('Stamen = anther + filament (male). Pistil = stigma + style + ovary (female).', 'Pollination: anther → stigma; self or cross; agents wind, insects, water.', 'Double fertilisation: gamete + egg → zygote (2n); gamete + polar nuclei → endosperm (3n).', 'Ovule → seed; ovary → fruit.'),
        remember('Exam trap: the ovary becomes the FRUIT and the ovule becomes the SEED — not the other way round.'),
        tip('Memory hook: "Stamen = Stay-men (male)"; "Pistil = female, holds the ovary like a pot."'),
      ],
      examples: [
        ex('Why do maize flowers lack bright petals and scent?', ['Maize is wind-pollinated.', 'It does not need to attract insects.', 'Instead it makes lots of light pollen and has feathery stigmas to catch it.'], 'Wind pollination does not need attractive petals.'),
        ex('A flower\'s ovary has 30 ovules. All are fertilised. How many seeds and how many male gametes are used?', ['Each ovule → one seed: 30 seeds.', 'Each ovule needs two male gametes (double fertilisation).', '30 × 2 = 60 male gametes (from 30 pollen grains).'], '30 seeds; 60 male gametes.'),
      ],
      practice: [
        matchT('parts', 'flower part to its role', [
          ['Anther', 'Produces pollen'], ['Stigma', 'Receives pollen'], ['Style', 'Pollen tube grows through it'], ['Ovary', 'Contains ovules; becomes fruit'], ['Ovule', 'Becomes the seed'], ['Sepal', 'Protects the bud'],
        ], ['The sticky top catches pollen.', 'Fruit comes from the ovary.']),
        orderT('fert', 'Arrange the events of sexual reproduction in a flowering plant.', ['Pollen forms in the anther', 'Pollination: pollen lands on stigma', 'Pollen tube grows through the style', 'Male gametes enter the ovule', 'Double fertilisation', 'Ovule becomes seed; ovary becomes fruit'],
          ['Pollen must reach the stigma before a tube grows.', 'Seeds and fruit come last.'], 'Pollen → pollination → tube → gametes enter ovule → double fertilisation → seed and fruit.', 2),
        mcq('flower', 'Track the male gametes from anther to ovule.', [
          ['In double fertilisation, the endosperm nucleus is…', 'Triploid (3n)', ['Diploid (2n)', 'Haploid (n)', 'Tetraploid (4n)'], 'One male gamete + two polar nuclei.', 'n + n + n = 3n.'],
          ['After fertilisation the ovary develops into the…', 'Fruit', ['Seed', 'Flower', 'Root'], 'A mango is a ripened ovary.', 'The ovary becomes the fruit.', { Seed: 'The OVULE becomes the seed.' }],
          ['Transfer of pollen from anther to stigma is…', 'Pollination', ['Fertilisation', 'Germination', 'Translocation'], 'It comes before fertilisation.', 'Pollination is the transfer of pollen.'],
          ['Which is a wind-pollinated plant?', 'Maize', ['Hibiscus', 'Sunflower', 'Rose'], 'No bright petals.', 'Maize has light pollen and feathery stigmas.'],
          ['The pollen tube enters the ovule through the…', 'Micropyle', ['Stigma', 'Anther', 'Petal'], 'A tiny pore in the ovule.', 'The micropyle lets the tube into the ovule.'],
          ['The future root of an embryo is the…', 'Radicle', ['Plumule', 'Cotyledon', 'Seed coat'], 'Radix = root.', 'The radicle grows into the root.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.repro.division', title: 'Cell division: cell cycle, mitosis and meiosis', prereqs: ['ts10.bs.repro.human'],
      intro: [
        h('From one cell to trillions'),
        photo('🔬', 'Under a school microscope, a stained onion root tip shows cells caught in different stages of division.'),
        p('You started as one cell and now have tens of trillions. New cells come only from existing cells by cell division. Walther Flemming (1882) first described the movements of chromosomes during division and named it mitosis; August Weismann predicted that gametes must be made by a division that halves the chromosome number.'),
        def('Chromosome', 'A thread-like structure in the nucleus made of DNA and protein that carries genes. Human body cells have 46 (23 pairs).'),
        def('Diploid and haploid', 'Diploid (2n) cells have two sets of chromosomes (46 in humans). Haploid (n) cells have one set (23) — the gametes.'),
        h('The cell cycle'),
        stepsB(
          'Interphase — G1: the cell grows and makes proteins.',
          'Interphase — S phase: DNA is copied, so each chromosome now has two identical sister chromatids.',
          'Interphase — G2: the cell prepares for division.',
          'M phase: mitosis (nucleus divides) followed by cytokinesis (cytoplasm divides).',
        ),
        h('Mitosis — for growth and repair'),
        stepsB(
          'Prophase: chromosomes coil and become visible; the nuclear membrane and nucleolus disappear; spindle fibres form.',
          'Metaphase: chromosomes line up at the equator of the cell, attached to spindle fibres.',
          'Anaphase: sister chromatids separate and are pulled to opposite poles.',
          'Telophase: a nuclear membrane forms around each group; chromosomes uncoil.',
          'Cytokinesis: animal cells pinch in (furrow); plant cells form a cell plate.',
        ),
        p('Result: 2 daughter cells, each diploid and identical to the parent.'),
        h('Meiosis — for making gametes'),
        p('Meiosis happens only in the reproductive organs (testes, ovaries, anthers, ovules). It has two divisions. In Meiosis I, matching (homologous) chromosomes pair up and swap pieces (crossing over), then separate — the number is halved. Meiosis II is like mitosis, separating chromatids. Result: 4 haploid cells, all genetically different.'),
        p('Why it matters: when two haploid gametes (23 + 23) fuse, the zygote gets 46 again, so the chromosome number stays constant from generation to generation. Crossing over and random fertilisation create variation.'),
        keys('Cell cycle: G1 → S (DNA copied) → G2 → M.', 'Mitosis: PMAT; 2 identical diploid cells; growth and repair.', 'Meiosis: 2 divisions; 4 different haploid cells; gametes; crossing over gives variation.'),
        remember('Exam trap: DNA is copied in the S phase of INTERPHASE, not during mitosis itself.'),
        tip('Memory hook for mitosis: "PMAT — Please Make Another Twin."'),
      ],
      examples: [
        ex('A dog\'s body cells have 78 chromosomes. How many are in its sperm and in a cell made by mitosis in its skin?', ['Sperm are made by meiosis → haploid → 78 ÷ 2 = 39.', 'Skin cells are made by mitosis → identical → 78.'], 'Sperm: 39; skin cell: 78.'),
        ex('Give three differences between mitosis and meiosis.', ['Mitosis: 1 division; meiosis: 2 divisions.', 'Mitosis: 2 daughter cells; meiosis: 4.', 'Mitosis: diploid and identical; meiosis: haploid and different (crossing over).'], 'Number of divisions, number of cells, chromosome number/variation.'),
      ],
      practice: [
        orderT('mitosis', 'Arrange the stages of mitosis.', ['Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'], ['PMAT.', 'The cytoplasm divides last.'], 'Prophase → metaphase → anaphase → telophase → cytokinesis.'),
        tp('chromo', (r) => {
          const [org, n2] = r.pick([['human', 46], ['onion', 16], ['pea', 14], ['dog', 78], ['rice', 24], ['cat', 38], ['potato', 48], ['maize', 20]] as [string, number][]);
          const kind = r.pick(['gamete', 'mitosis', 'meiosis4']);
          if (kind === 'mitosis') return numQ(`A ${org} body cell has ${n2} chromosomes. How many chromosomes will each daughter cell have after MITOSIS?`, n2, ['Mitosis makes identical copies.', 'The number does not change.'], [`Mitosis keeps the number: ${n2}.`], [{ when: String(n2 / 2), explain: 'Halving happens in meiosis, not mitosis.' }], 0.001);
          if (kind === 'meiosis4') return numQ(`One ${org} cell (${n2} chromosomes) undergoes meiosis. How many daughter cells are formed?`, 4, ['Meiosis has two divisions.', '1 → 2 → 4.'], ['Meiosis I gives 2 cells; Meiosis II gives 4.'], [{ when: '2', explain: 'That is mitosis. Meiosis has two divisions, giving 4 cells.' }], 0.001);
          return numQ(`A ${org} body cell has ${n2} chromosomes. How many chromosomes are in its gametes?`, n2 / 2, ['Gametes are made by meiosis.', 'Meiosis halves the number.'], [`${n2} ÷ 2 = ${n2 / 2}`], [{ when: String(n2), explain: 'Gametes are haploid — half the body-cell number.' }], 0.001);
        }),
        mcq('div', 'Mitosis copies; meiosis halves and mixes.', [
          ['DNA replication takes place in the…', 'S phase', ['G1 phase', 'Metaphase', 'Telophase'], 'S = synthesis.', 'DNA is copied during the S phase of interphase.'],
          ['Chromosomes line up at the equator during…', 'Metaphase', ['Prophase', 'Anaphase', 'Telophase'], 'Meta = middle.', 'In metaphase chromosomes align at the centre.'],
          ['Crossing over occurs during…', 'Meiosis I', ['Mitosis', 'Meiosis II only', 'Interphase'], 'Homologous chromosomes pair up.', 'Homologous chromosomes exchange segments in prophase I.'],
          ['Meiosis takes place in…', 'Reproductive organs', ['Skin cells', 'Root tip cells', 'Blood cells'], 'It makes gametes.', 'Meiosis occurs in testes, ovaries, anthers and ovules.'],
          ['Mitosis is important for…', 'Growth and repair', ['Making gametes', 'Halving chromosome number', 'Creating variation'], 'Healing a cut.', 'Mitosis gives identical cells for growth and repair.'],
          ['Sister chromatids move to opposite poles in…', 'Anaphase', ['Metaphase', 'Prophase', 'Interphase'], 'A for "apart".', 'In anaphase chromatids separate.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.repro.health', title: 'Reproductive health and birth control', prereqs: ['ts10.bs.repro.human'],
      intro: [
        h('Health is more than not being ill'),
        photo('🏫', 'Many Telangana schools run adolescent health sessions with counsellors and ANMs. Asking questions about your body is healthy and normal.'),
        p('Reproductive health means a responsible, safe and healthy life with respect to the reproductive organs and sexual behaviour — including the right information, hygiene, protection from infections, and the freedom to decide when to have children.'),
        h('Infections spread by sexual contact'),
        def('Sexually transmitted infections (STIs)', 'Infections passed from one person to another mainly through sexual contact, e.g. gonorrhoea and syphilis (bacterial) and HIV/AIDS (viral).'),
        p('HIV (Human Immunodeficiency Virus) damages the immune system, leading to AIDS, in which the body cannot fight even common infections. HIV spreads through unprotected sexual contact with an infected person, sharing needles or syringes, transfusion of untested blood, and from an infected mother to her baby. It does NOT spread by hugging, shaking hands, sharing food or toilets, or mosquito bites. People living with HIV deserve respect and care; with treatment (ART) they can live long lives.'),
        h('Birth control (contraception) methods'),
        stepsB(
          'Barrier methods: condoms stop sperm from reaching the egg and also reduce the spread of STIs including HIV.',
          'Hormonal methods: oral pills change hormone levels so that eggs are not released; used only on a doctor\'s advice.',
          'Intrauterine devices (IUDs) such as the Copper-T, placed in the uterus by a doctor, prevent pregnancy.',
          'Surgical (permanent) methods: vasectomy (vas deferens cut and tied in males) and tubectomy (oviducts cut and tied in females).',
        ),
        h('Fighting social ills'),
        p('Teenage pregnancy is risky for both mother and baby because a girl\'s body is not fully mature. In India the legal minimum age for marriage is 18 for women and 21 for men. Finding out the sex of a foetus to abort girls (female foeticide) is a crime under the PCPNDT Act, 1994; it has caused a falling sex ratio in many places. Every child, girl or boy, has an equal right to life and education.'),
        keys('Reproductive health = information, hygiene, safety, responsible choices.', 'HIV spreads through unsafe sex, shared needles, untested blood, mother to baby — not by casual contact.', 'Contraception: barrier (condom), hormonal (pills), IUD (Copper-T), surgical (vasectomy, tubectomy).', 'Sex determination of the foetus is illegal in India.'),
        remember('Exam point: of all birth control methods, only barrier methods like condoms also protect against STIs.'),
        tip('If you have questions about your body, talk to a parent, a trusted teacher, a school counsellor or a doctor — reliable sources, not rumours.'),
      ],
      examples: [
        ex('Imran says, "You can get HIV by eating from the same plate as an infected classmate." Correct him.', ['HIV spreads only through certain body fluids — blood, semen, vaginal fluid, breast milk.', 'Sharing plates, hugging, playing together or mosquito bites do not spread it.'], 'False — HIV does not spread by casual contact; the classmate should be treated with respect.'),
        ex('Which method of birth control both prevents pregnancy and reduces the risk of STIs? Explain.', ['Hormonal pills and IUDs prevent pregnancy but do not block infections.', 'A condom forms a physical barrier, stopping both sperm and infection-causing microbes.'], 'Condoms (barrier method).'),
      ],
      practice: [
        tapT('tap-hiv', 'Tap every way HIV CAN spread.', [
          ['Sharing used needles or syringes', true], ['Transfusion of untested blood', true], ['Unprotected sexual contact with an infected person', true], ['From an infected mother to her baby', true],
          ['Hugging or shaking hands', false], ['Mosquito bites', false], ['Sharing food or plates', false], ['Using the same toilet', false],
        ], ['HIV needs entry of infected blood or certain body fluids.', 'Casual daily contact is safe.'], 'HIV spreads through needles, untested blood, unprotected sex and mother to child — never through casual contact.', 6),
        matchT('methods', 'method to its type', [
          ['Condom', 'Barrier method'], ['Oral pills', 'Hormonal method'], ['Copper-T', 'Intrauterine device'], ['Vasectomy', 'Surgical method in males'], ['Tubectomy', 'Surgical method in females'],
        ], ['Surgery in males involves the sperm duct.', 'The Copper-T goes into the uterus.']),
        mcq('health', 'Think about safety, law and respect.', [
          ['AIDS is caused by…', 'A virus (HIV)', ['A bacterium', 'A fungus', 'Lack of vitamins'], 'H-I-V.', 'HIV is the Human Immunodeficiency Virus.'],
          ['Vasectomy involves cutting and tying the…', 'Vas deferens', ['Oviducts', 'Urethra', 'Ureters'], 'The sperm duct.', 'Sperm cannot reach the urethra after vasectomy.', { Oviducts: 'Cutting the oviducts is tubectomy, done in females.' }],
          ['Pre-natal sex determination for selecting the sex of a baby is…', 'Illegal in India', ['Legal everywhere', 'Allowed after 3 months', 'Recommended'], 'The PCPNDT Act.', 'It is banned to prevent female foeticide.'],
          ['Gonorrhoea and syphilis are caused by…', 'Bacteria', ['Viruses', 'Worms', 'Vitamin deficiency'], 'They can be treated with antibiotics.', 'Both are bacterial STIs.'],
          ['Why is teenage pregnancy risky?', 'The girl\'s body is not fully mature', ['Babies grow faster', 'There is no placenta', 'It is always twins'], 'Growth is still going on.', 'Teenage mothers and babies face higher health risks.'],
          ['The legal minimum age of marriage for women in India is…', '18 years', ['14 years', '16 years', '25 years'], 'The Prohibition of Child Marriage Act.', 'It is 18 for women and 21 for men.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Coordination in Life Processes
// =====================================================================================
const TEETH: [string, number[], number[]][] = [
  ['an adult human', [2, 1, 2, 3], [2, 1, 2, 3]], ['a child (milk teeth)', [2, 1, 0, 2], [2, 1, 0, 2]], ['a dog', [3, 1, 4, 2], [3, 1, 4, 3]],
  ['a cat', [3, 1, 3, 1], [3, 1, 2, 1]], ['a rabbit', [2, 0, 3, 3], [1, 0, 2, 3]], ['a cow', [0, 0, 3, 3], [3, 1, 3, 3]], ['a pig', [3, 1, 4, 3], [3, 1, 4, 3]],
];
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

const ch7: USpec = {
  id: 'ts10.bs.ch7', subject: 'biology', title: 'Coordination in Life Processes', source: src(7),
  objectives: [
    {
      id: 'ts10.bs.lifeproc.hunger', title: 'Hunger, taste and smell: how systems work together', prereqs: ['ts10.bs.coord.hormones'],
      intro: [
        h('Why do you feel hungry at 1 pm every school day?'),
        photo('🥭', 'The smell of ripe Banganapalli mangoes in May can make your mouth water before you take a bite — nose, brain and salivary glands working together.'),
        p('Eating looks simple, but it needs many systems to work as a team: hormones, nerves, sense organs, muscles and glands. This chapter follows that teamwork from feeling hungry to removing waste.'),
        h('Feeling hungry'),
        stepsB(
          'When the stomach has been empty for some time and blood glucose falls, cells in the stomach wall release the hormone ghrelin.',
          'Ghrelin signals reach the brain (the hypothalamus in the forebrain); the vagus nerve (10th cranial nerve) carries signals between stomach and brain.',
          'We feel hunger, and the empty stomach makes contractions called hunger pangs (they can last 30–45 minutes).',
          'After eating, fat tissue releases the hormone leptin, which tells the brain we are full and suppresses hunger.',
          'Eating at fixed times trains the body, so hunger comes at the usual meal time.',
        ),
        def('Ghrelin', 'A hormone secreted by the stomach wall when it is empty; it creates the feeling of hunger.'),
        def('Leptin', 'A hormone (released mainly by fat cells) that suppresses hunger and signals fullness.'),
        h('Taste and smell are partners'),
        p('The tongue has small bumps called papillae; taste buds sit in them. Taste receptors detect five basic tastes: sweet, salty, sour, bitter and umami (savoury, as in tomatoes and mushrooms). Food must dissolve in saliva before it can be tasted. Older textbooks drew a "tongue map" with zones for each taste; scientists now know every region can sense all five tastes, though sensitivity varies a little.'),
        p('Smell receptors (olfactory cells) in the roof of the nasal cavity detect odours and send messages through the olfactory nerve. What we call flavour is taste + smell together. With a bad cold, food seems tasteless because the smell part is missing. Smell also protects us — we reject stale or spoiled food by its odour.'),
        def('Chemoreceptors', 'Receptors that detect chemicals; taste buds and smell receptors are chemoreceptors.'),
        keys('Ghrelin (stomach) → hunger; leptin → fullness. Hypothalamus and vagus nerve carry the signals.', 'Five tastes: sweet, salty, sour, bitter, umami; detected by taste buds in papillae.', 'Flavour = taste + smell; food must dissolve in saliva to be tasted.'),
        remember('Exam trap: ghrelin causes HUNGER; leptin SUPPRESSES hunger. Do not swap them.'),
        tip('Memory hook: "GHRelin GRowls (stomach growls when hungry); Leptin = Lets you stop."'),
      ],
      examples: [
        ex('Why does food taste dull when you have a blocked nose?', ['Flavour depends on both taste and smell.', 'A blocked nose stops odour molecules from reaching olfactory receptors.', 'Only the five basic tastes remain, so food seems bland.'], 'Smell is missing, so flavour is reduced.'),
        ex('Name the systems involved when Diya, hungry at lunch, smells sambar and starts salivating.', ['Endocrine: ghrelin signals hunger.', 'Nervous: smell receptors, olfactory nerve, brain.', 'Digestive: salivary glands secrete saliva.'], 'Endocrine, nervous and digestive systems working together.'),
      ],
      practice: [
        mcq('hunger', 'Link each hormone or receptor to its job.', [
          ['The hormone that produces the feeling of hunger is…', 'Ghrelin', ['Leptin', 'Insulin', 'Thyroxine'], 'Secreted by the stomach wall.', 'Ghrelin from an empty stomach triggers hunger.', { Leptin: 'Leptin does the opposite — it suppresses hunger.' }],
          ['Which hormone suppresses hunger after a meal?', 'Leptin', ['Ghrelin', 'Adrenaline', 'Gastrin'], 'It says "full".', 'Leptin signals fullness.'],
          ['"Umami" means…', 'Savoury taste', ['Very sweet', 'Bitter', 'Odourless'], 'A Japanese word.', 'Umami is the savoury fifth taste.'],
          ['Taste buds are located in the…', 'Papillae of the tongue', ['Nasal cavity', 'Teeth', 'Oesophagus'], 'Small bumps on the tongue.', 'Taste buds sit in papillae.'],
          ['Which nerve helps carry hunger signals between stomach and brain?', 'Vagus nerve', ['Optic nerve', 'Olfactory nerve', 'Spinal nerve only'], 'The 10th cranial nerve.', 'The vagus nerve links brain and gut.'],
          ['Why must food dissolve in saliva before we taste it?', 'Taste receptors detect dissolved chemicals', ['Saliva is sweet', 'Teeth need it', 'It kills taste buds'], 'They are chemoreceptors.', 'Only dissolved chemicals reach taste receptors.'],
        ]),
        tapT('tap-taste', 'Tap the FIVE basic tastes.', [
          ['Sweet', true], ['Salty', true], ['Sour', true], ['Bitter', true], ['Umami', true], ['Spicy-hot', false], ['Cold', false],
        ], ['"Hot" chilli is felt as pain, not a taste.', 'There are exactly five.'], 'Sweet, salty, sour, bitter and umami. Chilli "heat" is a pain sensation.', 7),
        orderT('sequence', 'Arrange the events from an empty stomach to feeling full.', ['Stomach becomes empty', 'Ghrelin is secreted', 'Brain senses hunger; hunger pangs', 'We eat food', 'Leptin suppresses hunger'],
          ['The hormone comes after the stomach empties.', 'Fullness comes last.'], 'Empty → ghrelin → hunger → eating → leptin.'),
      ],
    },
    {
      id: 'ts10.bs.lifeproc.mouth', title: 'Mouth, teeth and saliva', prereqs: ['ts10.bs.lifeproc.hunger'],
      intro: [
        h('The munching machine'),
        photo('🦷', 'You have had two sets of teeth: 20 milk teeth that fell out, and up to 32 permanent ones that must last a lifetime.'),
        p('Digestion begins in the mouth. Teeth break food mechanically; the tongue mixes it; saliva starts chemical digestion of starch and makes the food slippery to swallow. Chewing is voluntary, but salivation is a reflex controlled by the brain stem.'),
        h('Types of teeth'),
        stepsB(
          'Incisors (8): flat, sharp front teeth for biting and cutting.',
          'Canines (4): pointed teeth for tearing.',
          'Premolars (8): broad teeth with two cusps for crushing and grinding.',
          'Molars (12, including 4 wisdom teeth): the largest grinding teeth at the back.',
        ),
        def('Dental formula', 'A short way to write the number of each type of tooth in one half of the upper and lower jaw, in the order incisors, canines, premolars, molars. Adult human: 2123/2123 → (2+1+2+3) × 2 × 2 = 32 teeth.'),
        p('Children have 20 milk teeth (formula 2102/2102 — no premolars). A tooth has a crown above the gum and a root in the jaw. The crown is covered by enamel, the hardest substance in the body; under it is dentine, and in the centre the pulp with nerves and blood vessels. Sugary food left on teeth lets bacteria make acid that dissolves enamel — tooth decay. Brushing twice a day prevents it.'),
        h('Saliva'),
        p('Three pairs of salivary glands — parotid (in front of the ears), submandibular (under the lower jaw) and sublingual (under the tongue) — release about 1–1.5 litres of saliva a day. Saliva is nearly neutral (pH about 6.8).'),
        stepsB(
          'Water and mucus (mucin) moisten food and make it slippery.',
          'Salivary amylase (ptyalin) begins breaking starch into maltose.',
          'Lysozyme and other substances kill some bacteria.',
          'The tongue rolls the chewed food into a soft ball — the bolus — ready to swallow.',
        ),
        def('Bolus', 'The rounded ball of chewed food mixed with saliva that is swallowed.'),
        keys('Incisors cut, canines tear, premolars and molars grind.', 'Adult 32 teeth (2123); milk teeth 20 (2102).', 'Saliva: amylase (starch → maltose), mucus, lysozyme; 3 pairs of glands.'),
        remember('Exam trap: milk teeth have NO premolars. Enamel — not bone — is the hardest substance in the body.'),
        tip('Count teeth quickly: add the dental formula numbers for one side, then multiply by 2 (left and right). Do this for upper and lower jaws and add.'),
      ],
      examples: [
        ex('Use the dental formula 2123/2123 to find the number of teeth in an adult.', ['Upper half-jaw: 2 + 1 + 2 + 3 = 8 → whole upper jaw 8 × 2 = 16.', 'Lower jaw is the same: 16.', 'Total = 16 + 16 = 32.'], '32 teeth'),
        ex('Test tube A has starch + saliva; tube B has starch + water. Both are kept at 37 °C for 20 minutes and tested with iodine. Predict.', ['Iodine turns blue-black with starch.', 'In A, salivary amylase has digested starch to maltose → little or no blue-black colour.', 'In B, starch is unchanged → blue-black.'], 'A: no blue-black (starch digested); B: blue-black.'),
      ],
      practice: [
        tp('dental', (r) => {
          const [who2, up, lo] = r.pick(TEETH);
          const total = 2 * (sum(up) + sum(lo));
          return numQ(`The dental formula of ${who2} is ${up.join('')}/${lo.join('')} (upper half-jaw / lower half-jaw; order incisors, canines, premolars, molars). How many teeth in total?`, total,
            ['Add the numbers for one half of the upper jaw and one half of the lower jaw.', 'Multiply that sum by 2 (left and right sides).'],
            [`Upper half: ${up.join(' + ')} = ${sum(up)}`, `Lower half: ${lo.join(' + ')} = ${sum(lo)}`, `Total = 2 × (${sum(up)} + ${sum(lo)}) = ${total}`],
            [{ when: String(sum(up) + sum(lo)), explain: 'That is only one side of the mouth. Multiply by 2 for left and right.' }], 0.001, 'teeth');
        }, 2),
        matchT('teeth', 'tooth or structure to its feature', [
          ['Incisors', 'Cut and bite food'], ['Canines', 'Tear food'], ['Premolars', 'Crush food; absent in milk teeth'], ['Molars', 'Largest grinding teeth at the back'], ['Enamel', 'Hardest substance in the body'], ['Pulp', 'Contains nerves and blood vessels'],
        ], ['Milk teeth lack one type.', 'The soft living centre of a tooth has nerves.']),
        mcq('saliva', 'Remember the jobs of saliva and the salivary glands.', [
          ['Salivary amylase converts…', 'Starch into maltose', ['Proteins into amino acids', 'Fats into fatty acids', 'Maltose into starch'], 'Amylase → amylum (starch).', 'Salivary amylase starts starch digestion.'],
          ['How many pairs of salivary glands do humans have?', '3', ['1', '2', '5'], 'Parotid, submandibular, sublingual.', 'There are three pairs.'],
          ['How many milk teeth does a child have?', '20', ['32', '28', '16'], 'No premolars.', '2102 × 2 × 2 = 20.'],
          ['The ball of chewed food is called…', 'Bolus', ['Chyme', 'Villus', 'Faeces'], 'Formed in the mouth.', 'The tongue rolls food into a bolus.', { Chyme: 'Chyme is the semi-liquid food in the stomach.' }],
          ['Lysozyme in saliva…', 'Kills some bacteria', ['Digests starch', 'Digests fat', 'Hardens enamel'], 'An anti-germ enzyme.', 'Lysozyme breaks down bacterial walls.'],
          ['Saliva is…', 'Nearly neutral (pH about 6.8)', ['Strongly acidic', 'Strongly alkaline', 'Pure water'], 'Close to 7.', 'Saliva\'s pH is about 6.8.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.lifeproc.peristalsis', title: 'Swallowing and peristalsis in the oesophagus', prereqs: ['ts10.bs.lifeproc.mouth'],
      intro: [
        h('Food goes down even when you are upside down'),
        photo('🧘', 'A yoga student in a headstand can still swallow water — proof that gravity is not what moves food to the stomach.'),
        p('Swallowing starts as a voluntary action (you decide to push the bolus back with your tongue) and then becomes an automatic reflex controlled by the medulla.'),
        stepsB(
          'The tongue pushes the bolus to the back of the mouth (voluntary).',
          'The soft palate rises to close the nasal passage.',
          'The larynx moves up and the epiglottis covers it, so food does not enter the windpipe.',
          'The bolus enters the oesophagus (about 25 cm long).',
          'Waves of muscle contraction — peristalsis — push the bolus down to the stomach in a few seconds.',
          'A ring of muscle at the lower end (cardiac sphincter) relaxes to let food into the stomach and then closes.',
        ),
        def('Peristalsis', 'Wave-like contraction and relaxation of the muscles of the alimentary canal that pushes food forward.'),
        def('Sphincter', 'A ring of muscle that opens and closes a passage, like a drawstring.'),
        h('How a peristaltic wave works'),
        p('The oesophagus wall has two muscle layers: circular muscles (rings) and longitudinal muscles (along the length). Behind the bolus, circular muscles contract and squeeze the tube narrow. In front of the bolus, circular muscles relax and the longitudinal muscles contract, widening and shortening that part. The squeeze travels down like toothpaste pushed along a tube. It is controlled by the autonomic nervous system and the gut\'s own nerve network.'),
        p('If the cardiac sphincter does not close well, acid from the stomach can splash up into the oesophagus — the burning feeling called heartburn or acidity. When we vomit, peristalsis runs in reverse.'),
        keys('Swallowing: voluntary start, then reflex (medulla). Soft palate closes nose; epiglottis closes larynx.', 'Peristalsis: circular muscles contract behind the bolus, relax in front.', 'Cardiac sphincter at the stomach entrance prevents back-flow.'),
        remember('Exam trap: peristalsis occurs along the WHOLE alimentary canal (oesophagus, stomach, intestines), not just the oesophagus.'),
        tip('Try it: squeeze a marble through a cycle tube by pinching just behind it — that is peristalsis.'),
      ],
      examples: [
        ex('Why can astronauts eat in space where there is no gravity?', ['Food is moved by muscle contractions (peristalsis), not by gravity.', 'These waves push food along whatever the body position.'], 'Peristalsis moves food independent of gravity.'),
        ex('What stops food from going into the nose and windpipe during swallowing?', ['The soft palate rises to close the nasal passage.', 'The epiglottis folds down over the larynx.'], 'Soft palate (nose) and epiglottis (windpipe).'),
      ],
      practice: [
        orderT('swallow', 'Arrange the events of swallowing.', ['Tongue pushes bolus back', 'Soft palate closes the nasal passage', 'Epiglottis covers the larynx', 'Bolus enters the oesophagus', 'Peristalsis moves the bolus down', 'Cardiac sphincter opens into the stomach'],
          ['The voluntary step is first.', 'The stomach entrance opens last.'], 'Tongue → soft palate → epiglottis → oesophagus → peristalsis → sphincter.'),
        mcq('peri', 'Picture rings of muscle squeezing behind the food.', [
          ['During peristalsis, circular muscles BEHIND the bolus…', 'Contract', ['Relax', 'Disappear', 'Secrete enzymes'], 'They squeeze.', 'Contraction behind pushes the bolus forward.'],
          ['Swallowing becomes involuntary under the control of the…', 'Medulla oblongata', ['Cerebrum', 'Cerebellum', 'Hypothalamus'], 'It controls involuntary actions.', 'The swallowing reflex centre is in the medulla.'],
          ['The ring of muscle at the lower end of the oesophagus is the…', 'Cardiac sphincter', ['Pyloric sphincter', 'Anal sphincter', 'Epiglottis'], 'Near the heart.', 'The cardiac sphincter guards the stomach entrance.', { 'Pyloric sphincter': 'The pyloric sphincter is at the stomach EXIT.' }],
          ['Heartburn (acidity) happens when…', 'Stomach acid moves up into the oesophagus', ['The heart burns food', 'Saliva is acidic', 'Bile enters the mouth'], 'Back-flow.', 'A loose cardiac sphincter lets acid escape upward.'],
          ['Approximate length of the human oesophagus is…', '25 cm', ['2.5 cm', '2.5 m', '6 m'], 'About the length of a school ruler less a bit.', 'The oesophagus is about 25 cm long.'],
        ]),
        tapT('tap-peri', 'Tap every part of the gut where peristalsis takes place.', [
          ['Oesophagus', true], ['Stomach', true], ['Small intestine', true], ['Large intestine', true], ['Teeth', false], ['Salivary glands', false], ['Liver', false],
        ], ['Peristalsis needs a muscular tube.', 'Glands and teeth do not move food along.'], 'Peristalsis happens throughout the muscular alimentary canal.'),
      ],
    },
    {
      id: 'ts10.bs.lifeproc.stomach', title: 'Stomach, intestines and expulsion of wastes', prereqs: ['ts10.bs.lifeproc.peristalsis', 'ts10.bs.digestion.system'],
      intro: [
        h('The mixer, the absorber and the store'),
        photo('🍌', 'A banana, dal and leafy greens give fibre that keeps the large intestine moving smoothly.'),
        h('Stomach — the mixer and digester'),
        p('The J-shaped stomach can hold about 1–1.5 litres. Its muscular walls churn the food for about 3–4 hours, mixing it with gastric juice. The hormone gastrin, released when food arrives, tells the gastric glands to secrete more juice. The food becomes a thick, souplike chyme.'),
        stepsB(
          'Hydrochloric acid: kills germs and makes the medium acidic for pepsin.',
          'Pepsin: begins digestion of proteins.',
          'Mucus: protects the stomach lining from its own acid.',
          'Pyloric sphincter: opens a little at a time to let small amounts of chyme into the duodenum, then closes so food does not flow back.',
        ),
        h('Small intestine — coordination by hormones'),
        p('Acidic chyme entering the duodenum causes the duodenum wall to release hormones such as secretin and cholecystokinin (CCK). These make the pancreas release pancreatic juice, the liver and gall bladder release bile, and the intestinal wall release intestinal juice (succus entericus). Digestion is completed and the villi absorb nutrients. The gut wall also has its own large network of nerves — sometimes called the "second brain" — which coordinates its movements.'),
        h('Large intestine and expulsion of wastes'),
        stepsB(
          'Undigested material (mainly fibre) enters the large intestine.',
          'Water and some salts are reabsorbed; bacteria here make some vitamins (K and some B).',
          'Peristalsis pushes the semi-solid waste (faeces/stool) into the rectum, where it is stored.',
          'A full rectum sends signals that create the urge to pass stool.',
          'Two anal sphincters control the exit: the inner one is involuntary, the outer one is voluntary — so we can choose when to go.',
          'Faeces are expelled through the anus (egestion/defecation).',
        ),
        p('A diet with enough fibre (fruits, vegetables, whole grains, pulses) and water prevents constipation. Diarrhoea causes dangerous loss of water and salts; oral rehydration solution (ORS) replaces them.'),
        keys('Stomach: HCl, pepsin, mucus; gastrin; churning makes chyme; pyloric sphincter releases it slowly.', 'Duodenum hormones (secretin, CCK) trigger pancreatic juice and bile.', 'Large intestine absorbs water; rectum stores faeces; anal sphincters (inner involuntary, outer voluntary).'),
        remember('Exam trap: the PYLORIC sphincter is at the stomach exit; the CARDIAC sphincter is at the stomach entrance.'),
        tip('Remember "G-S-C": Gastrin (stomach) → Secretin and CCK (duodenum) — hormones pass the baton along the gut.'),
      ],
      examples: [
        ex('Why does chyme enter the duodenum only in small amounts?', ['The pyloric sphincter opens briefly and closes again.', 'Small amounts can be neutralised by alkaline bile and pancreatic juice.', 'This gives enzymes time to act and protects the intestine from acid.'], 'The pyloric sphincter controls the flow so digestion and neutralisation are efficient.'),
        ex('Explain how a meal of rice and dal leads to the release of pancreatic juice — show the coordination.', ['Food reaches the stomach → gastrin → gastric juice → chyme.', 'Acidic chyme enters the duodenum.', 'Duodenum releases secretin and CCK into the blood.', 'These hormones stimulate the pancreas (pancreatic juice) and gall bladder (bile).'], 'Hormonal signals from the duodenum (secretin, CCK) trigger the pancreas.'),
      ],
      practice: [
        matchT('gut', 'structure or hormone to its role', [
          ['Gastrin', 'Stimulates gastric juice secretion'], ['Secretin', 'Stimulates pancreatic juice'], ['Pyloric sphincter', 'Releases chyme into the duodenum'], ['Large intestine', 'Absorbs water from waste'],
          ['Rectum', 'Stores faeces'], ['External anal sphincter', 'Voluntary control of defecation'],
        ], ['Two of these are hormones.', 'Only one sphincter here is under our will.']),
        orderT('waste', 'Arrange the path of undigested food to expulsion.', ['Small intestine', 'Large intestine (water absorbed)', 'Rectum (stored)', 'Anal sphincters relax', 'Expelled through anus'],
          ['Water is removed before storage.', 'The sphincters open just before expulsion.'], 'Small intestine → large intestine → rectum → sphincters → anus.'),
        mcq('stom', 'Follow the food and the signals that control each section.', [
          ['Which sphincter controls the passage of food from the stomach to the duodenum?', 'Pyloric sphincter', ['Cardiac sphincter', 'Anal sphincter', 'Epiglottis'], 'At the stomach exit.', 'The pyloric sphincter regulates chyme release.'],
          ['Chyme is…', 'Partly digested, semi-liquid food in the stomach', ['Chewed food in the mouth', 'Undigested waste', 'A digestive enzyme'], 'Formed by churning.', 'Churning with gastric juice produces chyme.'],
          ['Which hormones from the duodenum stimulate the pancreas and gall bladder?', 'Secretin and cholecystokinin', ['Ghrelin and leptin', 'Insulin and glucagon', 'Oestrogen and progesterone'], 'Released when acidic chyme arrives.', 'Secretin and CCK coordinate digestion in the small intestine.'],
          ['Which part mainly absorbs water from undigested food?', 'Large intestine', ['Stomach', 'Oesophagus', 'Mouth'], 'Before the rectum.', 'The large intestine absorbs most remaining water.'],
          ['The inner anal sphincter is…', 'Involuntary', ['Voluntary', 'Absent in adults', 'Made of bone'], 'Two sphincters, two kinds of control.', 'The inner sphincter is involuntary; the outer one is voluntary.'],
          ['ORS is given in diarrhoea to replace…', 'Water and salts', ['Proteins', 'Vitamins only', 'Enzymes'], 'Dehydration is the danger.', 'ORS restores lost water and electrolytes.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Heredity and Evolution
// =====================================================================================
const ch8: USpec = {
  id: 'ts10.bs.ch8', subject: 'biology', title: 'Heredity - Evolution', source: src(8),
  objectives: [
    {
      id: 'ts10.bs.hered.variation', title: 'Variations: inherited and acquired', prereqs: ['ts10.bs.repro.division'],
      intro: [
        h('No two people are exactly alike'),
        photo('👧', 'Look around your class: some can roll their tongue, some cannot; some have free ear lobes, some attached. These small differences are variations.'),
        p('Children resemble their parents, yet are never exact copies — even brothers and sisters differ. Differences among individuals of the same species are called variations. Heredity is the passing of characters (traits) from parents to offspring.'),
        def('Variation', 'Differences in characters among individuals of the same species.'),
        def('Heredity', 'The transmission of characters from parents to their offspring through genes.'),
        def('Trait (character)', 'A feature such as height, eye colour, blood group or the shape of the ear lobe.'),
        h('Two kinds of variation'),
        def('Inherited (genetic, germinal) variation', 'Caused by differences in genes; present in the reproductive cells and passed to the next generation. Examples: blood group, eye colour, tongue rolling, free or attached ear lobes.'),
        def('Acquired (somatic) variation', 'Develops during an individual\'s life due to the environment or use; NOT passed to offspring. Examples: strong muscles from exercise, a scar, a language learnt, a tan, a cut tail.'),
        h('Where does inherited variation come from?'),
        stepsB(
          'Crossing over during meiosis mixes genes between paired chromosomes.',
          'Independent sorting of chromosomes into gametes gives many combinations.',
          'Random fertilisation: any sperm can fuse with any egg.',
          'Mutations: occasional changes in DNA create new forms of genes.',
        ),
        p('Sexual reproduction produces much more variation than asexual reproduction. Variation is important: in a changing environment, some individuals may have traits that help them survive. Over many generations, this is the raw material of evolution.'),
        keys('Variation = differences within a species; heredity = passing on traits.', 'Inherited variations are in genes and passed on; acquired ones are not.', 'Sources: crossing over, independent assortment, random fertilisation, mutation.'),
        remember('Exam trap: a body-builder\'s big muscles are an ACQUIRED trait — his children will not inherit them.'),
        tip('Ask: "Is it in the genes (gametes)?" If yes → inherited. If it came from life experience → acquired.'),
      ],
      examples: [
        ex('Classify: (a) blood group O, (b) a scar on the knee, (c) ability to roll the tongue, (d) speaking Telugu.', ['(a) set by genes → inherited.', '(b) caused by an injury → acquired.', '(c) set by genes → inherited.', '(d) learnt from surroundings → acquired.'], 'Inherited: a, c. Acquired: b, d.'),
        ex('Why do offspring of sexual reproduction show more variation than those of asexual reproduction?', ['Asexual offspring get an exact copy of one parent\'s genes.', 'Sexual offspring get a mix from two parents.', 'Meiosis (crossing over, independent assortment) and random fertilisation create new combinations.'], 'Genes from two parents are reshuffled in each generation.'),
      ],
      practice: [
        tapT('tap-inh', 'Tap every INHERITED trait.', [
          ['Blood group', true], ['Eye colour', true], ['Free or attached ear lobes', true], ['Tongue rolling', true], ['Scar from a cut', false], ['Muscles built by exercise', false], ['Ability to ride a bicycle', false], ['Sun tan', false],
        ], ['Inherited traits are coded in genes.', 'Anything learnt or caused by injury or sunlight is acquired.'], 'Blood group, eye colour, ear lobes and tongue rolling are inherited; scars, muscles, skills and tans are acquired.', 6),
        mcq('var', 'Ask whether the trait is in the genes of the gametes.', [
          ['Which variation can be passed to the next generation?', 'A change in genes in the reproductive cells', ['A scar on the arm', 'Muscles from exercise', 'A learnt language'], 'It must reach the gametes.', 'Only germinal (genetic) variation is inherited.'],
          ['Which process produces the most variation?', 'Sexual reproduction', ['Binary fission', 'Budding', 'Vegetative propagation'], 'Two parents.', 'Sexual reproduction mixes genes from two parents.'],
          ['Crossing over takes place during…', 'Meiosis', ['Mitosis', 'Fertilisation', 'Germination'], 'It forms gametes.', 'Crossing over occurs in meiosis I.'],
          ['A sudden change in DNA is called a…', 'Mutation', ['Variation in diet', 'Tropism', 'Regeneration'], 'It creates new gene forms.', 'Mutations are changes in DNA.'],
          ['Somatic variations are…', 'Not inherited', ['Always inherited', 'Found only in plants', 'Caused only by mutation'], 'Soma = body.', 'Body-cell changes are not passed on.'],
        ]),
        matchT('classify', 'example to the type of variation', [
          ['Blood group B', 'Inherited'], ['Burn mark', 'Acquired (injury)'], ['Learning to swim', 'Acquired (skill)'], ['Curly hair from parents', 'Inherited (genes)'], ['Pierced ears', 'Acquired (by choice)'],
        ], ['Some answers are similar; read the brackets.', 'Genes decide blood group and natural hair type.']),
      ],
    },
    {
      id: 'ts10.bs.hered.monohybrid', title: 'Mendel\'s monohybrid cross and the laws of dominance and segregation', prereqs: ['ts10.bs.hered.variation'],
      intro: [
        h('A monk, a garden and 28,000 pea plants'),
        photo('🌱', 'Garden pea plants — tall and dwarf, round and wrinkled seeds — were Mendel\'s laboratory.'),
        p('Gregor Johann Mendel (1822–1884), a monk in Brno (now in the Czech Republic), grew thousands of pea plants for about eight years and counted their offspring carefully. He published his results in 1866, but they were ignored until 1900, when three scientists (de Vries, Correns and Tschermak) rediscovered them. He is called the Father of Genetics.'),
        p('Why peas? They have clear contrasting traits (tall/dwarf, round/wrinkled seeds, yellow/green seeds, etc.), are normally self-pollinating so pure lines are easy to keep, can be cross-pollinated by hand, have a short life cycle, and give many seeds. Mendel studied seven pairs of contrasting traits.'),
        h('Key words'),
        def('Gene / factor', 'A unit of heredity that controls a trait. Mendel called it a "factor".'),
        def('Alleles', 'Different forms of the same gene, e.g. T (tall) and t (dwarf).'),
        def('Dominant and recessive', 'A dominant allele shows its effect even when only one copy is present (T). A recessive allele shows only when both copies are recessive (tt).'),
        def('Genotype and phenotype', 'Genotype is the genetic make-up (TT, Tt, tt). Phenotype is the visible trait (tall, dwarf).'),
        def('Homozygous and heterozygous', 'Homozygous (pure): two identical alleles (TT or tt). Heterozygous (hybrid): two different alleles (Tt).'),
        h('The monohybrid cross — one trait at a time'),
        stepsB(
          'Parents (P): pure tall (TT) × pure dwarf (tt).',
          'Gametes: TT gives only T; tt gives only t.',
          'F₁ generation: all Tt — all tall. The dwarf trait seems to vanish.',
          'F₁ self-pollinated: Tt × Tt. Each parent gives T or t with equal chance.',
          'Punnett square: T×T = TT, T×t = Tt, t×T = Tt, t×t = tt.',
          'F₂ genotype ratio 1 TT : 2 Tt : 1 tt; phenotype ratio 3 tall : 1 dwarf. The dwarf trait reappears!',
        ),
        p('Mendel\'s real numbers for stem height in F₂: 787 tall and 277 dwarf — 2.84 : 1, very close to 3 : 1.'),
        h('Mendel\'s first two laws'),
        def('Law of dominance', 'In a hybrid, one allele (dominant) expresses itself and masks the other (recessive).'),
        def('Law of segregation (purity of gametes)', 'The two alleles of a gene separate during gamete formation, so each gamete carries only one allele.'),
        p('A test cross (crossing with the recessive parent tt) reveals an unknown genotype: Tt × tt gives 1 tall : 1 dwarf; TT × tt gives all tall.'),
        xp({
          title: 'What if? Expected offspring with a recessive trait', formula: 'Expected = N × p₁ × p₂',
          res: ['E', 'Expected number showing the recessive trait', '', 'N * a * b', 1],
          vars: [['N', 'Number of offspring', '', 4, 1000, 4, 400], ['a', 'Chance parent 1 passes the recessive allele', '', 0, 1, 0.5, 0.5], ['b', 'Chance parent 2 passes the recessive allele', '', 0, 1, 0.5, 0.5]],
          notes: [
            ['a', 'If parent 1 is tt (chance 1), more offspring can show the recessive trait.', 'If parent 1 is TT (chance 0), no offspring can show the recessive trait.'],
            ['b', 'A tt second parent makes the recessive trait twice as common as a Tt one.', 'A TT second parent hides the recessive trait completely.'],
            ['N', 'More offspring means more recessive ones, but the PROPORTION stays the same.', 'With only a few offspring, real results can stray far from the expected ratio.'],
          ],
          mistakes: [['Expecting exactly 1 dwarf in every 4 seeds', 'Ratios are probabilities. With small numbers, results vary; large samples come close to 3 : 1.'], ['Adding the chances instead of multiplying', 'Both events must happen together (recessive from parent 1 AND from parent 2), so multiply: ½ × ½ = ¼.']],
          real: 'Tt × Tt (a = 0.5, b = 0.5) gives ¼ dwarf; Tt × tt (a = 0.5, b = 1) gives ½ dwarf — the test cross ratio.',
        }),
        keys('P: TT × tt → F₁ all Tt (tall).', 'F₂: phenotype 3 : 1; genotype 1 : 2 : 1.', 'Laws: dominance; segregation (purity of gametes).', 'Test cross with tt reveals the hidden genotype.'),
        remember('Exam trap: phenotype ratio 3 : 1 but genotype ratio 1 : 2 : 1. Questions often ask for one and accept only that one.'),
        tip('Draw every Punnett square the same way: gametes of one parent across the top, the other down the side, then fill each box.'),
      ],
      examples: [
        ex('Cross a heterozygous tall plant (Tt) with a dwarf plant (tt). Give the ratios.', ['Gametes: Tt → T, t; tt → t only.', 'Punnett: T×t = Tt, t×t = tt (two of each).', 'Genotypes: 1 Tt : 1 tt. Phenotypes: 1 tall : 1 dwarf.'], '1 tall : 1 dwarf (test cross).'),
        ex('In an F₂ generation of 1200 pea plants from Tt × Tt, how many are expected to be dwarf, and how many of the tall plants are pure (TT)?', ['Dwarf = ¼ × 1200 = 300.', 'Tall = 900, of which TT is 1 part out of the 3 tall parts (1 TT : 2 Tt).', 'TT = ¼ × 1200 = 300.'], '300 dwarf; 300 pure tall (600 hybrid tall).'),
      ],
      practice: [
        tp('f2', (r) => {
          const N = r.pick([400, 600, 800, 1000, 1200, 1600, 2000]);
          const ask = r.pick(['dominant', 'recessive', 'hetero', 'homodom']);
          const [trait, dom, rec] = r.pick([['plant height', 'tall', 'dwarf'], ['seed shape', 'round', 'wrinkled'], ['seed colour', 'yellow', 'green'], ['flower colour', 'violet', 'white']] as [string, string, string][]);
          const map: Record<string, [string, number, string]> = {
            dominant: [`${dom} (phenotype)`, (3 * N) / 4, '3/4'], recessive: [rec, N / 4, '1/4'], hetero: [`heterozygous (hybrid) ${dom}`, N / 2, '2/4 = 1/2'], homodom: [`homozygous (pure) ${dom}`, N / 4, '1/4'],
          };
          const [label, ans, fr] = map[ask];
          return numQ(`Two hybrid pea plants (heterozygous for ${trait}; ${dom} is dominant over ${rec}) are crossed and give ${N} offspring. How many are expected to be ${label}?`, ans,
            ['Draw a Punnett square for Aa × Aa.', 'Genotypes 1 AA : 2 Aa : 1 aa; phenotypes 3 dominant : 1 recessive.'],
            [`Fraction = ${fr}`, `${fr.split(' = ').pop()} × ${N} = ${ans}`],
            [{ when: String(ask === 'dominant' ? N / 4 : (3 * N) / 4), explain: 'You used the wrong part of the 3 : 1 ratio. Check whether the question asks for the dominant or recessive form.' }], 0.001);
        }, 2),
        mcq('terms', 'Genotype = letters; phenotype = what you see.', [
          ['A plant with genotype Tt is…', 'Heterozygous tall', ['Homozygous tall', 'Heterozygous dwarf', 'Homozygous dwarf'], 'Two different alleles; T dominant.', 'Tt is a hybrid that looks tall.'],
          ['The F₂ phenotypic ratio of a monohybrid cross is…', '3 : 1', ['1 : 2 : 1', '9 : 3 : 3 : 1', '1 : 1'], 'Count what you SEE.', '3 dominant : 1 recessive.', { '1 : 2 : 1': 'That is the GENOTYPIC ratio.' }],
          ['The law of segregation states that…', 'The two alleles separate when gametes form', ['Both alleles go into each gamete', 'Dominant alleles are always inherited', 'Traits blend in offspring'], 'Purity of gametes.', 'Each gamete carries only one allele of a gene.'],
          ['Which cross is a test cross?', 'Hybrid tall × dwarf (Tt × tt)', ['Hybrid × hybrid (Tt × Tt)', 'Pure tall × pure tall (TT × TT)', 'Pure tall × hybrid tall (TT × Tt)'], 'Cross with the recessive parent.', 'Crossing with tt reveals the unknown genotype.'],
          ['Mendel\'s work was rediscovered in…', '1900', ['1866', '1859', '1953'], 'Three scientists independently.', 'De Vries, Correns and Tschermak rediscovered it in 1900.'],
          ['Different forms of the same gene are called…', 'Alleles', ['Chromosomes', 'Phenotypes', 'Gametes'], 'T and t.', 'Alleles are alternative forms of a gene.'],
        ]),
        orderT('mono', 'Arrange the steps of Mendel\'s monohybrid experiment.', ['Select pure tall and pure dwarf plants', 'Cross-pollinate them (P generation)', 'All F₁ plants are tall', 'Self-pollinate F₁ plants', 'F₂ shows 3 tall : 1 dwarf'],
          ['Pure lines are needed first.', 'The 3 : 1 ratio appears in the second generation.'], 'Pure parents → cross → F₁ all tall → self F₁ → F₂ 3 : 1.'),
      ],
    },
    {
      id: 'ts10.bs.hered.dihybrid', title: 'Dihybrid cross and the law of independent assortment', prereqs: ['ts10.bs.hered.monohybrid'],
      intro: [
        h('Two traits at once'),
        photo('🟡', 'Pea seeds can be round or wrinkled AND yellow or green. Does shape decide colour? Mendel tested it.'),
        p('After tracking one trait, Mendel followed two traits together: seed shape (round R dominant over wrinkled r) and seed colour (yellow Y dominant over green y).'),
        stepsB(
          'P: pure round yellow (RRYY) × pure wrinkled green (rryy).',
          'Gametes: RY only and ry only.',
          'F₁: all RrYy — round yellow.',
          'F₁ self-pollinated: each F₁ plant makes FOUR kinds of gametes in equal numbers: RY, Ry, rY, ry.',
          'A 4 × 4 Punnett square gives 16 boxes.',
          'F₂ phenotypes: 9 round yellow : 3 round green : 3 wrinkled yellow : 1 wrinkled green.',
        ),
        p('Mendel\'s actual counts: 315 round yellow, 108 round green, 101 wrinkled yellow, 32 wrinkled green — very close to 9 : 3 : 3 : 1. Notice two NEW combinations (round green and wrinkled yellow) that were in neither parent.'),
        def('Dihybrid cross', 'A cross between parents that differ in two pairs of contrasting traits.'),
        def('Law of independent assortment', 'Alleles of different genes separate into gametes independently of one another, so all combinations appear.'),
        p('Check with probability: round (¾) and yellow (¾) together = ¾ × ¾ = 9/16; round and green = ¾ × ¼ = 3/16; wrinkled and yellow = 3/16; wrinkled and green = ¼ × ¼ = 1/16. Each trait still follows 3 : 1 on its own (12 round : 4 wrinkled).'),
        keys('RrYy × RrYy → 9 : 3 : 3 : 1.', 'F₁ dihybrid makes 4 kinds of gametes: RY, Ry, rY, ry.', 'New combinations appear because genes assort independently.', 'Multiply single-trait probabilities to get dihybrid fractions.'),
        remember('Exam trap: the F₂ of a dihybrid cross has 16 combinations, 9 genotypes and 4 phenotypes.'),
        tip('Fast method: 9 : 3 : 3 : 1 out of 16. For N offspring, round yellow = 9N/16, wrinkled green = N/16.'),
      ],
      examples: [
        ex('An F₂ generation from RrYy × RrYy has 1600 seeds. How many are expected to be round green?', ['Round green fraction = 3/16.', '3/16 × 1600 = 300.'], '300 seeds'),
        ex('Show that Mendel\'s counts fit 9 : 3 : 3 : 1.', ['Total = 315 + 108 + 101 + 32 = 556.', 'Expected: 9/16 × 556 ≈ 313; 3/16 × 556 ≈ 104 (twice); 1/16 × 556 ≈ 35.', 'Observed 315, 108, 101, 32 are very close.'], 'Yes — the observed numbers closely match 9 : 3 : 3 : 1.'),
      ],
      practice: [
        tp('dih', (r) => {
          const N = r.pick([160, 320, 480, 640, 800, 1600]);
          const [label, k] = r.pick([['round and yellow', 9], ['round and green', 3], ['wrinkled and yellow', 3], ['wrinkled and green', 1]] as [string, number][]);
          const ans = (k * N) / 16;
          return numQ(`F₁ plants (RrYy; round R and yellow Y are dominant) are self-pollinated and give ${N} seeds. How many seeds are expected to be ${label}?`, ans,
            ['The F₂ ratio is 9 : 3 : 3 : 1 out of 16.', `${label} has ${k} part${k > 1 ? 's' : ''} out of 16.`],
            [`${k}/16 × ${N} = ${ans}`],
            [{ when: String(N / 4), explain: 'That is a monohybrid fraction. Two traits together use the 16-part dihybrid ratio.' }], 0.001);
        }, 2),
        mcq('concepts', 'Remember: 9 : 3 : 3 : 1 and four kinds of gametes.', [
          ['The F₂ phenotypic ratio in a dihybrid cross is…', '9 : 3 : 3 : 1', ['3 : 1', '1 : 2 : 1', '1 : 1 : 1 : 1'], 'Out of 16.', 'Two traits each 3 : 1 combine into 9 : 3 : 3 : 1.'],
          ['How many kinds of gametes does an RrYy plant produce?', '4', ['2', '1', '16'], 'RY, Ry, rY, ry.', 'Independent assortment gives four kinds.'],
          ['Which law did the dihybrid cross establish?', 'Law of independent assortment', ['Law of dominance', 'Law of segregation', 'Law of use and disuse'], 'Two genes behave independently.', 'Alleles of different genes assort independently.'],
          ['In the F₂, the fraction that is wrinkled and green is…', '1/16', ['9/16', '3/16', '1/4'], 'Both recessive.', '¼ × ¼ = 1/16.'],
          ['New combinations in the F₂ (not seen in P) are…', 'Round green and wrinkled yellow', ['Round yellow and wrinkled green', 'Only round yellow', 'None'], 'Parents were round yellow and wrinkled green.', 'Recombinants appear because genes assort independently.'],
          ['The genotype of the F₁ plants in Mendel\'s dihybrid cross was…', 'RrYy — hybrid for both traits', ['RRYY — pure round yellow', 'rryy — pure wrinkled green', 'RRyy — pure round green'], 'Heterozygous for both.', 'RRYY × rryy gives RrYy.'],
        ]),
        tapT('tap-gam', 'Tap every gamete that an RrYy plant can produce.', [
          ['RY (round + yellow alleles)', true], ['Ry (round + green alleles)', true], ['rY (wrinkled + yellow alleles)', true], ['ry (wrinkled + green alleles)', true],
          ['Rr (two alleles of the shape gene)', false], ['YY (two alleles of the colour gene)', false], ['RrYy (all four alleles)', false],
        ], ['A gamete has ONE allele of each gene.', 'Two letters of the same gene cannot be in one gamete.'], 'Gametes carry one allele of each gene: RY, Ry, rY, ry.', 6),
      ],
    },
    {
      id: 'ts10.bs.hered.sex', title: 'Sex determination in humans', prereqs: ['ts10.bs.hered.monohybrid'],
      intro: [
        h('Who decides whether a baby is a girl or a boy?'),
        photo('👶', 'A newborn\'s sex was fixed at the moment of fertilisation — by the sperm, not by the mother.'),
        p('Human body cells have 23 pairs of chromosomes. 22 pairs are autosomes, the same in males and females. The 23rd pair, the sex chromosomes, differs: females have XX and males have XY. The Y chromosome is smaller and carries the gene that starts male development.'),
        def('Autosomes', 'The 22 pairs of chromosomes that are not sex chromosomes.'),
        def('Sex chromosomes', 'The pair of chromosomes that determines sex: XX in human females and XY in males.'),
        stepsB(
          'Meiosis in the mother: every egg gets one X (22 + X).',
          'Meiosis in the father: half the sperm carry X (22 + X), half carry Y (22 + Y).',
          'Egg (X) + X-sperm → XX → girl.',
          'Egg (X) + Y-sperm → XY → boy.',
          'Chance in each pregnancy: ½ girl, ½ boy — independent of earlier children.',
        ),
        p('So it is the father\'s sperm that determines the sex of the child. Blaming a mother for having daughters is scientifically wrong and unfair. In some other animals sex is decided differently: in many turtles and crocodiles, the temperature at which eggs are incubated decides the sex; in birds, the female has the two different sex chromosomes.'),
        keys('Female XX, male XY; 22 pairs of autosomes.', 'Eggs all carry X; sperm carry X or Y.', 'Father\'s sperm determines the sex; each birth is a 50 : 50 chance.'),
        remember('Exam trap: probability does not "remember". A family with three daughters still has a ½ chance of a son next time.'),
        tip('Chance of several births ALL being girls = ½ × ½ × … (one ½ for each child).'),
      ],
      examples: [
        ex('Draw a cross (as steps) to show that the chance of a boy is 50%.', ['Mother XX → gametes X, X.', 'Father XY → gametes X, Y.', 'Combinations: XX, XX, XY, XY.', '2 girls : 2 boys = 1 : 1.'], '50% boys, 50% girls.'),
        ex('What is the probability that a couple\'s three children are all boys?', ['Each child: ½ chance of a boy.', 'Independent events: multiply.', '½ × ½ × ½ = 1/8.'], '1/8 (12.5%)'),
      ],
      practice: [
        tp('prob', (r) => {
          const k = r.pick([1, 2, 3, 4, 5]);
          const sex = r.pick(['girls', 'boys']);
          const p0 = 0.5 ** k;
          return numQ(`What is the probability that ${k === 1 ? 'a couple\'s next child is a ' + sex.slice(0, -1) : `all ${k} children of a couple are ${sex}`}? Give a fraction or decimal.`, p0,
            ['Each birth has a ½ chance of either sex.', 'For several independent births, multiply the chances.'],
            [`(1/2)^${k} = 1/${2 ** k} = ${p0}`],
            k === 1 ? [] : [{ when: String(k / 2), explain: 'Do not multiply ½ by the number of children — multiply ½ by itself once for each child.' }], 0.001);
        }, 2),
        mcq('sexdet', 'Eggs always carry X; sperm carry X or Y.', [
          ['The sex of a human child is determined by…', 'The sperm (father)', ['The egg (mother)', 'Both equally', 'The food the mother eats'], 'Which parent can give a Y?', 'Only sperm can carry a Y chromosome.', { 'The egg (mother)': 'Every egg carries an X, so the egg cannot decide.' }],
          ['Human females have the sex chromosomes…', 'XX', ['XY', 'YY', 'XO'], 'Two identical.', 'Females are XX.'],
          ['How many autosomes are in a human body cell?', '44 (22 pairs)', ['46', '23', '2'], '46 minus the sex pair.', '46 − 2 = 44 autosomes.'],
          ['A human sperm carrying a Y chromosome has which chromosome set?', '22 + Y', ['44 + XY', '22 + X', '23 + Y'], 'Gametes are haploid.', 'A sperm has 22 autosomes + one sex chromosome.'],
          ['In many turtles, the sex of the young depends on…', 'The temperature at which eggs are incubated', ['The father\'s age', 'The X chromosome only', 'The size of the egg'], 'Environment, not chromosomes.', 'Incubation temperature decides sex in many reptiles.'],
        ]),
        matchT('cross', 'gamete combination to the result', [
          ['X egg + X sperm', 'Girl (XX)'], ['X egg + Y sperm', 'Boy (XY)'], ['Mother\'s eggs', 'All carry X'], ['Father\'s sperm', 'Half X, half Y'],
        ], ['A Y chromosome makes a boy.', 'Only one parent can give a Y.'], 4),
      ],
    },
    {
      id: 'ts10.bs.evol.theories', title: 'Evolution: Lamarckism, Darwinism and speciation', prereqs: ['ts10.bs.hered.variation'],
      intro: [
        h('How did the giraffe get its long neck?'),
        photo('🦒', 'Two famous answers to the giraffe question show the difference between Lamarck\'s and Darwin\'s ideas.'),
        def('Evolution', 'The gradual change in the inherited characters of populations of organisms over many generations, giving rise to new species.'),
        h('Lamarckism (Jean-Baptiste Lamarck, 1809)'),
        stepsB(
          'Use and disuse: organs that are used a lot grow stronger; unused organs weaken and disappear.',
          'Inheritance of acquired characters: these changes are passed to the offspring.',
          'Giraffe: ancestors stretched their necks to reach high leaves; slightly longer necks were passed on; over generations necks became long.',
        ),
        p('August Weismann tested this. He cut off the tails of mice for more than 20 generations, yet every new generation was born with normal tails. Acquired changes in body cells are not inherited — only changes in reproductive cells (germplasm) are. Lamarckism was rejected.'),
        h('Darwinism — natural selection (Charles Darwin)'),
        p('Darwin sailed around the world on HMS Beagle (1831–36), studied the finches and tortoises of the Galapagos Islands, and published "On the Origin of Species" in 1859. Alfred Russel Wallace reached the same idea independently.'),
        stepsB(
          'Over-production: organisms produce far more young than can survive.',
          'Struggle for existence: individuals compete for food, space and mates.',
          'Variation: individuals differ, and many differences are inherited.',
          'Survival of the fittest (natural selection): individuals with useful variations survive and reproduce more.',
          'Inheritance: their useful traits are passed on and become more common.',
          'Over long periods, these changes accumulate and new species arise.',
        ),
        p('Giraffe, Darwin\'s way: ancestors already varied in neck length; in times of food shortage, those with longer necks reached more leaves, survived and had more young; so long necks became common.'),
        h('Speciation — how new species form'),
        def('Species', 'A group of similar organisms that can interbreed and produce fertile offspring.'),
        stepsB(
          'A population is split by a barrier — a river, mountain or sea (geographical isolation).',
          'The separated groups face different environments.',
          'Different variations are selected in each group; random changes (genetic drift) also add up in small groups.',
          'After many generations they become so different that they can no longer interbreed (reproductive isolation).',
          'Now they are separate species.',
        ),
        p('Darwin\'s finches on different Galapagos islands evolved different beak shapes for different foods — seeds, insects, cactus.'),
        keys('Lamarck: use and disuse + inheritance of acquired characters (disproved by Weismann).', 'Darwin: variation + struggle + natural selection → survival of the fittest → new species.', 'Speciation: isolation → different selection → reproductive isolation.'),
        remember('Exam trap: in Darwin\'s theory, variation exists BEFORE the environment selects. The environment does not create the useful variation.'),
        tip('Lamarck = "Learn it, pass it on" (wrong). Darwin = "Born different, best survive" (supported).'),
      ],
      examples: [
        ex('Explain the dark peppered moths that became common near sooty factories in England.', ['Moths varied: light and dark forms already existed.', 'Soot darkened tree trunks; birds easily spotted light moths.', 'Dark moths survived and reproduced more.', 'Dark moths became common — natural selection.'], 'Natural selection favoured the camouflaged dark form.'),
        ex('Why did Weismann\'s experiment disprove Lamarck?', ['Lamarck said acquired characters are inherited.', 'Weismann cut mouse tails for 20+ generations.', 'Offspring always had normal tails, so the acquired change (no tail) was not inherited.'], 'Acquired body changes are not passed on.'),
      ],
      practice: [
        orderT('darwin', 'Arrange the steps of natural selection.', ['Over-production of offspring', 'Struggle for existence', 'Variation among individuals', 'Survival of the fittest', 'Useful traits passed to offspring', 'Origin of new species over time'],
          ['More young are born than can survive.', 'New species form last, after many generations.'], 'Over-production → struggle → variation → survival of fittest → inheritance → new species.', 2),
        orderT('speciation', 'Arrange the steps of speciation.', ['A population is split by a barrier', 'Groups face different environments', 'Different variations are selected', 'Groups can no longer interbreed', 'New species are formed'],
          ['Isolation comes first.', 'Reproductive isolation marks a new species.'], 'Barrier → different conditions → different selection → reproductive isolation → new species.'),
        mcq('theories', 'Lamarck = acquired traits inherited; Darwin = natural selection of inherited variation.', [
          ['"Inheritance of acquired characters" was proposed by…', 'Lamarck', ['Darwin', 'Mendel', 'Weismann'], '1809.', 'Lamarck proposed use and disuse and inheritance of acquired traits.'],
          ['Weismann cut the tails of mice to test…', 'Lamarck\'s theory', ['Mendel\'s laws', 'Darwin\'s finches', 'Fossil dating'], 'Acquired characters.', 'He showed acquired characters are not inherited.'],
          ['Darwin\'s book "On the Origin of Species" was published in…', '1859', ['1809', '1866', '1900'], 'Mid-19th century.', 'Published in 1859.'],
          ['The main force of evolution according to Darwin is…', 'Natural selection', ['Use and disuse', 'Acquired characters', 'Special creation'], 'Survival of the fittest.', 'Nature selects individuals with favourable variations.'],
          ['Reproductive isolation means…', 'Two groups can no longer interbreed', ['Animals live alone', 'Plants reproduce asexually', 'Only males survive'], 'This marks separate species.', 'Without interbreeding, gene pools stay separate.'],
          ['Darwin studied finches on the…', 'Galapagos Islands', ['Andaman Islands', 'Himalayas', 'Sahara'], 'Pacific islands off Ecuador.', 'Galapagos finches showed varied beaks.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.evol.evidence', title: 'Evidences of evolution and human evolution', prereqs: ['ts10.bs.evol.theories'],
      intro: [
        h('Clues written in bones, embryos and rocks'),
        photo('🪨', 'A fossil is the remains or impression of an ancient organism preserved in rock — a page from Earth\'s history book.'),
        h('1. Homologous and analogous organs'),
        def('Homologous organs', 'Organs with the same basic structure and origin but different functions — e.g. the forelimbs of a human (grasping), whale (flipper), bat (wing) and cat (walking). They point to a common ancestor (divergent evolution).'),
        def('Analogous organs', 'Organs with different structure and origin but similar function — e.g. wings of a bird and a butterfly. They show that different groups adapted to similar needs (convergent evolution).'),
        h('2. Embryology'),
        p('Early embryos of fish, frog, chick, rabbit and human look remarkably similar — all have gill slits and a tail at some stage. This suggests vertebrates share common ancestry.'),
        h('3. Fossils'),
        p('Deeper rock layers are older, so fossils show which organisms lived when, and how they changed. Archaeopteryx, a fossil about 150 million years old, had feathers and wings like a bird but teeth, clawed fingers and a long bony tail like a reptile. It is a connecting link between reptiles and birds.'),
        p('Scientists date fossils using radioactive elements that decay at a steady rate. Carbon-14 is used for remains up to about 50,000 years old; its half-life is about 5730 years. Older rocks are dated with elements like uranium.'),
        xp({
          title: 'What if? Carbon-14 left in a fossil', formula: 'Remaining % = 100 × (½)^(t / 5730)',
          res: ['R', 'Carbon-14 remaining', '%', '100 * 0.5^(t / 5730)', 1],
          vars: [['t', 'Age of the remains', 'years', 0, 40000, 100, 5730]],
          notes: [['t', 'Every 5730 years, half of what is left decays — so the amount falls quickly at first, then more slowly.', 'Younger remains still hold most of their carbon-14.']],
          mistakes: [['"After two half-lives nothing is left."', 'After two half-lives a quarter (25%) remains: half of a half.'], ['Using carbon-14 for dinosaur bones', 'Dinosaurs died over 66 million years ago; almost no C-14 would remain. Other isotopes are used.']],
          real: 'A bone with 25% of its original carbon-14 is about 2 × 5730 ≈ 11,460 years old.',
        }),
        h('4. Vestigial organs — a "moving museum"'),
        p('Some organs are reduced and useless in us but functional in related animals: the vermiform appendix, wisdom teeth, the tail bone (coccyx), and muscles that move the ear. They are leftovers from our ancestors.'),
        h('Human evolution'),
        p('Humans and apes share common ancestors that lived in Africa. Fossils show a series of human-like species (approximate dates as currently accepted by scientists):'),
        stepsB(
          'Australopithecus (about 4–2 million years ago): walked upright; small brain.',
          'Homo habilis, "handy man" (about 2.4–1.4 million years ago): made simple stone tools.',
          'Homo erectus (about 1.9 million years ago onwards): fully upright, used fire, spread out of Africa into Asia.',
          'Homo neanderthalensis (about 4 lakh – 40,000 years ago): lived in Europe and West Asia, made fine tools, buried their dead.',
          'Homo sapiens — modern humans (about 3 lakh years ago in Africa): spread across the world from about 60,000–70,000 years ago.',
        ),
        p('All people living today belong to one species, Homo sapiens, with roots in Africa. There is no biological basis for dividing humans into separate "races" — differences in skin colour are small adaptations to sunlight.'),
        keys('Homologous organs → common ancestry; analogous organs → similar function, different origin.', 'Embryos of vertebrates look alike early on.', 'Fossils, e.g. Archaeopteryx (reptile–bird link); C-14 half-life ≈ 5730 years.', 'Vestigial organs: appendix, wisdom teeth, coccyx.', 'Humans: one species, African origin.'),
        remember('Exam trap: bird wing vs butterfly wing = ANALOGOUS. Human arm vs bat wing = HOMOLOGOUS.'),
        tip('Homo-logous = same ("homo") plan; Ana-logous = same job, different plan.'),
      ],
      examples: [
        ex('Are a bat\'s wing and a pigeon\'s wing homologous or analogous?', ['Both are forelimbs of vertebrates with the same bone pattern (humerus, radius, ulna, digits) — homologous as forelimbs.', 'But as WINGS they evolved separately (bat: skin between fingers; bird: feathers) — analogous as wings.'], 'Homologous as forelimbs; analogous as wings. (In exams, the usual answer for "bird wing vs insect wing" is analogous.)'),
        ex('A piece of charcoal from an ancient hearth has 12.5% of its original carbon-14. How old is it?', ['100% → 50% → 25% → 12.5%: three half-lives.', '3 × 5730 = 17,190 years.'], 'About 17,190 years old'),
      ],
      practice: [
        mcq('evid', 'Same structure → homologous; same function → analogous.', [
          ['Forelimbs of a whale, bat and human are…', 'Homologous organs', ['Analogous organs', 'Vestigial organs', 'Fossils'], 'Same bones, different jobs.', 'Same basic plan → common ancestor.'],
          ['Wings of a butterfly and a bird are…', 'Analogous organs', ['Homologous organs', 'Vestigial organs', 'Identical in structure'], 'Same job, different structure.', 'They evolved separately for flight.', { 'Homologous organs': 'Their structures and origins are completely different.' }],
          ['Archaeopteryx is a connecting link between…', 'Reptiles and birds', ['Fish and amphibians', 'Apes and humans', 'Plants and animals'], 'Feathers + teeth.', 'It had bird and reptile features.'],
          ['Which is a vestigial organ in humans?', 'Vermiform appendix', ['Heart', 'Liver', 'Kidney'], 'Useless in us, useful in some herbivores.', 'The appendix is reduced and functionless.'],
          ['The earliest modern humans (Homo sapiens) arose in…', 'Africa', ['Europe', 'Australia', 'South America'], 'Our genetic roots.', 'Homo sapiens originated in Africa.'],
          ['Which human species is called "handy man"?', 'Homo habilis', ['Homo erectus', 'Homo sapiens', 'Homo neanderthalensis'], 'Habilis = skilful.', 'Homo habilis made the earliest stone tools.'],
        ]),
        tp('c14', (r) => {
          const n = r.pick([1, 2, 3, 4]);
          const ask = r.pick(['age', 'pct']);
          const pct = 100 / 2 ** n;
          if (ask === 'age') return numQ(`A fossil bone has ${pct}% of its original carbon-14 left. The half-life of carbon-14 is 5730 years. How old is the bone (in years)?`, n * 5730,
            ['Count how many times you halve 100% to reach that value.', 'Age = number of half-lives × 5730.'],
            [`100 → ${Array.from({ length: n }, (_, i) => 100 / 2 ** (i + 1)).join(' → ')}%: ${n} half-li${n > 1 ? 'ves' : 'fe'}`, `Age = ${n} × 5730 = ${n * 5730} years`],
            [{ when: String(5730), explain: 'That is one half-life. Count how many halvings were needed.' }], 0.001, 'years');
          return numQ(`What percentage of carbon-14 remains in remains that are ${n * 5730} years old? (Half-life 5730 years.)`, pct,
            [`Number of half-lives = ${n * 5730} ÷ 5730 = ${n}.`, 'Halve 100% that many times.'],
            [`${n} half-li${n > 1 ? 'ves' : 'fe'}: 100 ÷ 2^${n} = ${pct}%`],
            n === 1 ? [] : [{ when: String(Math.max(0, 100 - 50 * n)), explain: 'Each half-life halves what is LEFT; it does not subtract 50% each time.' }], 0.001, '%');
        }, 2),
        orderT('humans', 'Arrange these in order from the oldest to the most recent.', ['Australopithecus', 'Homo habilis', 'Homo erectus', 'Homo neanderthalensis', 'Homo sapiens (modern humans)'],
          ['Upright walking came before tool-making Homo species.', 'Modern humans are last.'], 'Australopithecus → Homo habilis → Homo erectus → Neanderthals → Homo sapiens (Neanderthals and early sapiens overlapped in time).'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Our Environment
// =====================================================================================
const ch9: USpec = {
  id: 'ts10.bs.ch9', subject: 'biology', title: 'Our Environment', source: src(9),
  objectives: [
    {
      id: 'ts10.bs.env.foodchain', title: 'Food chains, food webs and the flow of energy', prereqs: ['ts10.bs.photo.needs'],
      intro: [
        h('Who eats whom in a paddy field?'),
        photo('🐸', 'Frogs in a flooded paddy field near Warangal eat grasshoppers and are eaten by snakes — links in a food chain.'),
        p('All the energy in living things comes from the Sun. Green plants trap it by photosynthesis; animals get it by eating plants or other animals. The path along which food (and energy) passes is a food chain.'),
        def('Food chain', 'A sequence of organisms in which each one is eaten by the next, showing how food energy passes from producers to consumers.'),
        def('Producer', 'An organism that makes its own food — green plants, algae.'),
        def('Consumer', 'An organism that eats others. Primary consumers (herbivores) eat plants; secondary consumers eat herbivores; tertiary consumers eat secondary consumers.'),
        def('Decomposer', 'Bacteria and fungi that break down dead organisms and wastes, returning nutrients to the soil.'),
        def('Trophic level', 'Each step or feeding level in a food chain (producer = first trophic level).'),
        h('Examples (arrows point from food to feeder)'),
        stepsB(
          'Paddy field: paddy plant → grasshopper → frog → snake → eagle.',
          'Pond (like Hussain Sagar\'s edges): algae → water flea → small fish → kingfisher.',
          'Forest: grass → deer → tiger.',
        ),
        p('The arrow means "is eaten by", so it shows the direction in which energy flows. In nature, most animals eat more than one kind of food and are eaten by more than one predator, so food chains interconnect to form a food web. A food web is more stable: if one prey becomes scarce, a predator can switch to another.'),
        def('Food web', 'A network of interconnected food chains in an ecosystem.'),
        h('The 10% law'),
        p('Energy flow is one-way: from the Sun to producers to consumers; it never cycles back. At each step most energy is used for the organism\'s own life processes or lost as heat. Only about 10% of the energy at one trophic level is passed on to the next (Lindeman\'s 10% law). That is why food chains rarely have more than 4 or 5 links.'),
        xp({
          title: 'What if? Energy reaching each trophic level', formula: 'Eₙ = E₁ × (p/100)^(n − 1)',
          res: ['E', 'Energy available at level n', 'kJ', 'E1 * (p / 100)^(n - 1)', 1],
          vars: [['E1', 'Energy fixed by producers', 'kJ', 1000, 100000, 1000, 10000], ['p', 'Percentage passed on per step', '%', 5, 20, 1, 10], ['n', 'Trophic level', '', 1, 5, 1, 3]],
          notes: [
            ['n', 'Each step up the chain keeps only about a tenth of the energy — top predators get very little.', 'Lower trophic levels have far more energy available.'],
            ['p', 'More efficient transfer gives more energy to the top — but it is never close to 100%.', 'Less efficient transfer makes long food chains impossible.'],
            ['E1', 'More energy fixed by plants supports more life at every level.', 'Less plant productivity means less energy for everyone above.'],
          ],
          mistakes: [['Subtracting 10% at each step', 'Only 10% is PASSED ON; 90% is lost. 1000 kJ at level 1 → 100 kJ at level 2, not 900.'], ['Thinking energy is recycled', 'Nutrients cycle, but energy flows one way and leaves as heat.']],
          real: 'Eating plant foods directly makes use of more of the Sun\'s energy than eating animals that ate those plants.',
        }),
        keys('Sun → producers → herbivores → carnivores; decomposers recycle nutrients.', 'Arrows point from food to feeder.', 'Food webs are more stable than single chains.', 'About 10% of energy passes to the next level; energy flow is one-way.'),
        remember('Exam trap: in "grass → deer → tiger", the arrow means "is eaten by". Do not draw it the other way.'),
        tip('Quick 10% rule: divide by 10 for every step up — 10000 → 1000 → 100 → 10.'),
      ],
      examples: [
        ex('In "grass → grasshopper → frog → snake", grass fixes 20,000 kJ. How much energy reaches the snake?', ['Grasshopper (level 2): 10% of 20,000 = 2000 kJ.', 'Frog (level 3): 10% of 2000 = 200 kJ.', 'Snake (level 4): 10% of 200 = 20 kJ.'], '20 kJ'),
        ex('In a field, snakes are killed in large numbers. What happens to frogs and grasshoppers? Explain using the food chain.', ['Snakes eat frogs; with fewer snakes, frogs increase.', 'More frogs eat more grasshoppers, so grasshoppers decrease.', 'With fewer grasshoppers, grass grows more.', 'In a food web, the effects spread to other species too.'], 'Frogs increase, grasshoppers decrease — removing one link disturbs the whole chain.'),
      ],
      practice: [
        tp('ten', (r) => {
          const E1 = r.pick([1000, 5000, 10000, 20000, 50000, 100000]);
          const n = r.pick([2, 3, 4]);
          const ans = E1 / 10 ** (n - 1);
          const names = ['producers', 'primary consumers', 'secondary consumers', 'tertiary consumers'];
          return numQ(`Producers in an ecosystem fix ${E1} kJ of energy. Using the 10% law, how much energy is available to the ${names[n - 1]} (trophic level ${n})?`, ans,
            ['Only 10% passes to the next level.', `Divide by 10 for each step: ${n - 1} step${n > 2 ? 's' : ''}.`],
            [`${E1} ÷ 10^${n - 1} = ${ans} kJ`],
            [{ when: String(E1 * 0.9 ** (n - 1)), explain: 'You subtracted 10% each step. Only 10% is PASSED ON — multiply by 0.1 each step.' }], 0.001, 'kJ');
        }, 2),
        orderT('chain', 'Arrange this food chain from producer to top consumer.', ['Paddy plant', 'Grasshopper', 'Frog', 'Snake', 'Eagle'],
          ['Start with the organism that makes food.', 'The eagle has no predator here.'], 'Paddy → grasshopper → frog → snake → eagle.'),
        matchT('roles', 'organism to its role in the ecosystem', [
          ['Algae', 'Producer'], ['Grasshopper', 'Primary consumer (herbivore)'], ['Frog', 'Secondary consumer'], ['Eagle', 'Top consumer'], ['Mushroom', 'Decomposer'], ['Deer', 'Herbivore'],
        ], ['Fungi break down dead matter.', 'Herbivores eat producers.']),
        mcq('concepts', 'Energy flows one way, from the Sun up the chain.', [
          ['The ultimate source of energy for almost all food chains is…', 'The Sun', ['Green plants', 'Soil', 'Water'], 'Plants trap it.', 'Plants capture solar energy by photosynthesis.'],
          ['Why are food chains usually short (4–5 levels)?', 'Energy decreases sharply at each level', ['Animals are too big', 'Plants grow slowly', 'Decomposers eat the top consumers'], '10% law.', 'Too little energy is left after a few steps.'],
          ['Herbivores occupy the…', 'Second trophic level', ['First trophic level', 'Third trophic level', 'Fourth trophic level'], 'Producers are first.', 'Primary consumers are at level 2.'],
          ['A food web is more stable than a single food chain because…', 'Animals have alternative food sources', ['It has fewer species', 'Energy is recycled', 'There are no decomposers'], 'If one prey is scarce…', 'Predators can switch prey, so the system stays balanced.'],
          ['The flow of energy in an ecosystem is…', 'Unidirectional (one way)', ['Cyclic', 'Two-way', 'Random'], 'It is lost as heat.', 'Energy flows from Sun to producers to consumers, never back.'],
          ['Bacteria and fungi that break down dead matter are…', 'Decomposers', ['Producers', 'Herbivores', 'Parasites'], 'They recycle nutrients.', 'Decomposers return minerals to the soil.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.env.pyramids', title: 'Ecological pyramids of number, biomass and energy', prereqs: ['ts10.bs.env.foodchain'],
      intro: [
        h('Drawing an ecosystem as a pyramid'),
        photo('🌾', 'A grassland supports millions of grass plants, thousands of grasshoppers, hundreds of frogs, a few snakes and perhaps one eagle.'),
        p('Charles Elton (1927) suggested showing each trophic level as a horizontal bar, stacked with producers at the bottom. The width of each bar shows the amount at that level. The shape is called an ecological pyramid.'),
        def('Ecological pyramid', 'A graphical representation of the number, biomass or energy at successive trophic levels of a food chain.'),
        def('Biomass', 'The total dry mass of living organisms at a trophic level per unit area.'),
        h('1. Pyramid of numbers — counts individuals'),
        stepsB(
          'Grassland: many grass plants → fewer grasshoppers → fewer frogs → few snakes → one eagle. Upright.',
          'Tree ecosystem: one big tree supports many insects, which feed fewer birds — the bottom is narrow (spindle-shaped / partly inverted).',
          'Parasite chain: one tree → many birds → very many lice on them — inverted.',
        ),
        h('2. Pyramid of biomass — mass at each level'),
        stepsB(
          'On land (forest, grassland): usually upright — plants have the most biomass.',
          'In a pond or sea: can be inverted — tiny phytoplankton have small biomass at any moment, but reproduce so fast that they support a larger mass of zooplankton and fish.',
        ),
        h('3. Pyramid of energy — energy flow at each level'),
        p('This is ALWAYS upright, because energy is lost at each step (only about 10% passes on). No level can have more energy than the level that feeds it.'),
        keys('Number: upright (grassland), spindle (tree), inverted (parasites).', 'Biomass: upright on land; can be inverted in water.', 'Energy: always upright.'),
        remember('Exam trap: only the pyramid of ENERGY can never be inverted.'),
        tip('Memory hook: "Energy is Ever upright."'),
      ],
      examples: [
        ex('Why is the pyramid of numbers inverted for "tree → birds → lice"?', ['One tree supports many birds.', 'Each bird carries many lice.', 'So numbers increase at each level.'], 'Numbers increase up the chain because one host supports many parasites.'),
        ex('Can a pyramid of energy be inverted? Explain.', ['Each level gets energy only from the level below.', 'At each step most energy is lost as heat; only about 10% passes on.', 'So each level must have less energy than the one below.'], 'No — the energy pyramid is always upright.'),
      ],
      practice: [
        mcq('pyr', 'Ask what is being counted: individuals, mass, or energy.', [
          ['Which pyramid is always upright?', 'Pyramid of energy', ['Pyramid of numbers', 'Pyramid of biomass', 'All pyramids'], '10% law.', 'Energy decreases at every level.', { 'Pyramid of biomass': 'Biomass can be inverted in water ecosystems.' }],
          ['The pyramid of numbers for a single tree with insects and birds is…', 'Spindle-shaped (narrow base)', ['Upright', 'Always inverted at every level', 'Flat'], 'One tree, many insects.', 'The base (one tree) is narrower than the insect level.'],
          ['In a pond, the pyramid of biomass is often…', 'Inverted', ['Upright', 'Spindle-shaped', 'Absent'], 'Phytoplankton reproduce fast.', 'Small standing biomass of phytoplankton supports larger zooplankton biomass.'],
          ['Who introduced ecological pyramids?', 'Charles Elton', ['Charles Darwin', 'Lindeman', 'Mendel'], '1927.', 'Elton proposed the pyramid diagrams.'],
          ['The pyramid of numbers for a grassland is…', 'Upright', ['Inverted', 'Spindle-shaped', 'Always equal at every level'], 'Many grass plants at the base.', 'Numbers fall at each level.'],
          ['Biomass means…', 'Total dry mass of organisms at a level', ['Number of animals', 'Energy from the Sun', 'Height of trees'], 'Measured in g/m².', 'Biomass is the mass of living matter.'],
        ]),
        matchT('shapes', 'ecosystem to the shape of its pyramid', [
          ['Grassland – numbers', 'Upright'], ['Tree with insects – numbers', 'Spindle-shaped'], ['Host with parasites – numbers', 'Inverted'], ['Pond – biomass', 'Often inverted'], ['Any ecosystem – energy', 'Always upright'],
        ], ['Energy is never inverted.', 'Parasites outnumber their host.']),
        tp('levels', (r) => {
          const E1 = r.pick([2000, 5000, 8000, 10000, 30000]);
          const n = r.pick([2, 3]);
          const ans = E1 / 10 ** (n - 1);
          return numQ(`A pyramid of energy has ${E1} kJ at the producer level. If 10% passes up each level, how much energy is in level ${n}?`, ans,
            ['Each level up = ÷ 10.', `Level ${n} is ${n - 1} step(s) above producers.`],
            [`${E1} ÷ ${10 ** (n - 1)} = ${ans} kJ`],
            [{ when: String(E1 * 10 ** (n - 1)), explain: 'Energy DECREASES up the pyramid — divide, do not multiply.' }], 0.001, 'kJ');
        }),
      ],
    },
    {
      id: 'ts10.bs.env.impact', title: 'Human impact on ecosystems: Kolleru lake and bioaccumulation', prereqs: ['ts10.bs.env.foodchain'],
      intro: [
        h('A lake that birds came 5000 km to visit'),
        photo('🦢', 'Pelicans, storks and thousands of migratory birds from northern Asia and Europe visit Kolleru between October and March.'),
        h('The story of Kolleru lake'),
        p('Kolleru, between the Godavari and Krishna deltas in Andhra Pradesh, is one of the largest freshwater lakes in India. Rivers and streams bring water and nutrient-rich silt into it; extra water drains to the Bay of Bengal through a winding channel, the Upputeru. It hosts nearly 200 species of birds and supports fishing communities. It was declared a sanctuary in 1999.'),
        stepsB(
          'From the 1980s, aquaculture (fish and prawn tanks) became very profitable and spread fast; by the mid-1990s most of the lake bed was enclosed by bunds.',
          'Bunds and encroachment for farming blocked the natural flow of water; the open water area shrank and its holding capacity fell, causing floods in nearby villages.',
          'Fertilisers and pesticides from farms, fish-tank discharges, industrial effluents and town sewage poured in.',
          'Excess nutrients caused explosive weed growth (water hyacinth, Pistia) — eutrophication. Dissolved oxygen fell and biological oxygen demand (BOD) rose.',
          'Native fish species became endangered, fish and prawn diseases spread, birds declined, and water-borne diseases increased among local people.',
          'The government launched "Operation Kolleru" to remove illegal tanks and restore the lake\'s ecological balance.',
        ),
        def('Eutrophication', 'Over-enrichment of a water body with nutrients, causing excessive growth of algae and weeds, which use up dissolved oxygen when they decay.'),
        h('Poisons that climb the food chain'),
        def('Bioaccumulation', 'The build-up of a harmful, non-biodegradable substance (such as a pesticide or heavy metal) inside an organism\'s body, because it is taken in faster than it is removed.'),
        def('Biomagnification', 'The increase in concentration of such a substance at each higher trophic level of a food chain.'),
        p('Chemicals like DDT and heavy metals (mercury, lead, cadmium) are not broken down and are stored in fat. A small fish eats many contaminated plankton; a big fish eats many small fish; a bird or human eats many big fish. So the top consumer gets the highest dose. In Minamata, Japan (1950s), mercury from a factory built up in fish and caused severe poisoning in people who ate them. Near Hyderabad, a study of Edulabad reservoir (Medchal district) found heavy metals from industrial effluents building up in the liver, kidney and gills of fish eaten by local people.'),
        xp({
          title: 'What if? Biomagnification up a food chain', formula: 'Cₙ = C₁ × kⁿ⁻¹',
          res: ['C', 'Pesticide concentration at level n', 'ppm', 'C1 * k^(n - 1)', 3],
          vars: [['C1', 'Concentration in water plants', 'ppm', 0.001, 0.1, 0.001, 0.01], ['k', 'Magnification factor per step', '×', 2, 20, 1, 10], ['n', 'Trophic level', '', 1, 5, 1, 4]],
          notes: [
            ['n', 'Each step up multiplies the concentration — top predators like fish-eating birds get the highest dose.', 'Lower levels carry much less of the poison.'],
            ['k', 'A substance stored more strongly in fat magnifies faster.', 'A substance that the body can break down or excrete magnifies less.'],
          ],
          mistakes: [['"Poison is diluted as it passes up the chain."', 'Non-biodegradable poisons are stored, not used up, so they become MORE concentrated at each level.'], ['Thinking only animals near the factory are affected', 'Migratory birds and people who buy the fish far away also receive the dose.']],
          real: 'DDT that was only a trace in water became concentrated enough in fish-eating birds to make their eggshells thin and break.',
        }),
        keys('Kolleru: aquaculture tanks, encroachment, chemicals and sewage → shrinking lake, eutrophication, fewer birds and fish, disease.', 'Bioaccumulation: build-up in one organism. Biomagnification: rise in concentration up the food chain.', 'Non-biodegradable pesticides and heavy metals are the main culprits.'),
        remember('Exam trap: bioaccumulation happens within ONE organism; biomagnification is the increase ACROSS trophic levels.'),
        tip('Think of it like collecting coins: each predator "collects" all the poison from every prey it eats.'),
      ],
      examples: [
        ex('DDT in water is 0.00005 ppm, in plankton 0.04 ppm, in small fish 0.5 ppm, in large fish 2 ppm and in fish-eating birds 25 ppm. What does this show?', ['Concentration rises at every level.', 'Each predator eats many prey and stores their DDT in fat.', 'Birds at the top have about 5 lakh times the concentration in water.'], 'Biomagnification of a non-biodegradable pesticide.'),
        ex('Why did migratory birds visiting Kolleru decline?', ['Fish tanks and encroachment reduced open water and natural habitat.', 'Pollution and weeds reduced oxygen and native fish (their food).', 'Toxic chemicals may have accumulated in their food.'], 'Habitat loss, food loss and pollution caused by human activities.'),
      ],
      practice: [
        orderT('kolleru', 'Arrange the chain of events in Kolleru lake.', ['Aquaculture tanks spread across the lake', 'Natural water flow is blocked', 'Fertilisers, pesticides and sewage enter the lake', 'Weeds grow explosively (eutrophication)', 'Oxygen falls; fish and birds decline'],
          ['It started with an economic activity.', 'The loss of wildlife is the final result.'], 'Tanks → blocked flow → pollutants → eutrophication → loss of fish and birds.'),
        tp('biomag', (r) => {
          const C1 = r.pick([0.01, 0.02, 0.05, 0.1]);
          const k = r.pick([5, 10]);
          const n = r.pick([3, 4]);
          const ans = rd(C1 * k ** (n - 1), 4);
          return numQ(`A pesticide is ${C1} ppm in water plants. Its concentration increases ${k} times at each step up the food chain. What is its concentration at trophic level ${n}?`, ans,
            [`Number of steps = ${n} − 1 = ${n - 1}.`, `Multiply by ${k} for each step.`],
            [`${C1} × ${k}^${n - 1} = ${ans} ppm`],
            [{ when: String(rd(C1 / k ** (n - 1), 6)), explain: 'Concentration INCREASES up the chain — multiply, do not divide.' }], 0.01, 'ppm');
        }, 2),
        mcq('impact', 'Non-biodegradable poisons concentrate; excess nutrients cause eutrophication.', [
          ['Increase in concentration of a pesticide at higher trophic levels is called…', 'Biomagnification', ['Bioaccumulation', 'Eutrophication', 'Decomposition'], 'Magnify = make bigger, across levels.', 'Biomagnification is the rise across trophic levels.', { Bioaccumulation: 'Bioaccumulation is build-up within one organism.' }],
          ['Excessive weed growth due to excess nutrients in a lake is…', 'Eutrophication', ['Biomagnification', 'Afforestation', 'Transpiration'], 'Nutrient over-enrichment.', 'Nutrient runoff causes eutrophication.'],
          ['Kolleru lake lies between the deltas of…', 'Godavari and Krishna', ['Ganga and Yamuna', 'Kaveri and Tungabhadra', 'Narmada and Tapti'], 'Andhra Pradesh.', 'It lies between the Godavari and Krishna deltas.'],
          ['Minamata disease was caused by…', 'Mercury in fish', ['DDT in rice', 'Lead in paint', 'Fluoride in water'], 'Japan, 1950s.', 'Methyl mercury biomagnified in fish.'],
          ['Which kind of substance biomagnifies?', 'Non-biodegradable, fat-soluble chemicals', ['Sugars', 'Water', 'Biodegradable kitchen waste'], 'They are stored, not broken down.', 'Only persistent chemicals accumulate.'],
          ['In a polluted lake, the dissolved oxygen is low and BOD is…', 'High', ['Low', 'Zero', 'Unchanged'], 'Decomposing matter uses oxygen.', 'Lots of organic matter raises biological oxygen demand.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.env.conservation', title: 'Steps towards prevention and conservation', prereqs: ['ts10.bs.env.impact'],
      intro: [
        h('When killing sparrows caused a famine'),
        photo('🐦', 'A house sparrow eats grain — but mostly it eats insects that damage crops.'),
        p('In 1958 China launched a campaign to kill sparrows because they ate grain. Millions were killed. Later, scientists who examined the stomachs of dead sparrows found that about three-fourths of their food was harmful insects and only one-fourth was grain. With the sparrows gone, locusts and other pests multiplied, crops failed, and the campaign contributed to a terrible famine. Removing one link in a food web can harm the whole ecosystem.'),
        h('Why not just ban all pesticides?'),
        p('Crops grown as huge single-crop fields (monocultures) are perfect for pests. Pesticides kill pests but also kill their natural enemies and other animals, and persistent ones biomagnify. No "perfect" pesticide that kills only the pest exists. The answer is to control pests using sound biological principles.'),
        stepsB(
          'Crop rotation: grow different crops on the same land in successive seasons so a pest cannot build up.',
          'Study pest life histories: sow seeds at times when the pest is least active.',
          'Biological control: use natural predators or parasites of the pest — e.g. ladybird beetles eat aphids; tiny Trichogramma wasps destroy pest eggs.',
          'Pest-resistant varieties: develop crop strains (including genetically modified ones) that resist particular pests.',
          'Prefer biodegradable pesticides, used only when needed; avoid persistent ones (e.g. endosulfan, banned in India in 2011).',
          'Environmental ethics: respect for all life — knowing what is right and wrong for nature, beyond what the law demands.',
        ),
        def('Biological control', 'Controlling pests by using their natural enemies — predators, parasites or diseases — instead of chemicals.'),
        def('Environmental ethics', 'The moral principles that guide how humans should treat the environment and other living things.'),
        p('Telangana examples: Telanganaku Haritha Haram (2015) is a large tree-planting programme to increase green cover; Mission Kakatiya (2015) restored thousands of village tanks, helping water, fish and birds. Individuals can help by avoiding plastic, saving water and energy, not disturbing nests, and planting native trees.'),
        keys('Removing a species (sparrows) can upset the whole food web.', 'Prevention: crop rotation, life-history timing, biological control, resistant strains, careful use of biodegradable pesticides.', 'Environmental ethics and community action conserve ecosystems.'),
        remember('Exam point: biological control uses LIVING organisms to control pests; it does not add persistent chemicals to food chains.'),
        tip('Think "food web first": before removing any organism, ask what eats it and what it eats.'),
      ],
      examples: [
        ex('Explain how killing sparrows led to lower crop yields.', ['Sparrows ate mainly insect pests (about ¾ of their diet).', 'With sparrows gone, pests like locusts multiplied unchecked.', 'Pests destroyed far more grain than sparrows ever ate.'], 'Removing the pests\' predator let pests explode and damage crops.'),
        ex('A farmer near Siddipet grows only cotton every year and pests keep increasing. Suggest two biological solutions.', ['Crop rotation: grow a pulse or millet next season so cotton pests lose their food.', 'Biological control: encourage or release natural enemies (e.g. Trichogramma, birds) instead of spraying persistent chemicals.'], 'Crop rotation and biological control.'),
      ],
      practice: [
        tapT('tap-bio', 'Tap every method based on BIOLOGICAL principles of pest control.', [
          ['Crop rotation', true], ['Using ladybird beetles against aphids', true], ['Growing pest-resistant varieties', true], ['Timing sowing using pest life history', true],
          ['Spraying a persistent pesticide every week', false], ['Killing all birds in the field', false], ['Burning forests for new farmland', false],
        ], ['Biological methods work with nature.', 'Killing predators makes pests worse.'], 'Crop rotation, biological control, resistant varieties and timing are biological methods.'),
        mcq('cons', 'Protect the food web rather than break it.', [
          ['Scientists found that sparrows\' stomachs mostly contained…', 'Harmful insects', ['Grain', 'Stones', 'Plastic'], 'About three-fourths.', 'Sparrows mostly ate crop pests.'],
          ['Using natural enemies to control pests is called…', 'Biological control', ['Crop rotation', 'Monoculture', 'Biomagnification'], 'Living control agents.', 'Predators and parasites control pests naturally.'],
          ['Growing different crops on the same land in successive seasons is…', 'Crop rotation', ['Monoculture', 'Mixed cropping only', 'Deforestation'], 'Rotate = change in turns.', 'Rotation breaks pest cycles.'],
          ['Telanganaku Haritha Haram is a programme for…', 'Increasing tree cover', ['Building factories', 'Mining coal', 'Killing pests'], 'Haritha = green.', 'It is a large-scale tree-planting programme.'],
          ['Mission Kakatiya aimed to…', 'Restore village tanks', ['Build highways', 'Ban sparrows', 'Export rice'], 'Named after the Kakatiya dynasty, famous for tanks.', 'It revived thousands of minor irrigation tanks.'],
          ['Why are monocultures prone to pests?', 'Abundant single food lets pests multiply rapidly', ['They have no soil', 'They need no water', 'Pests avoid them'], 'A feast for one pest.', 'Large single-crop fields provide plenty of food for specific pests.'],
        ]),
        matchT('steps', 'prevention step to its example', [
          ['Crop rotation', 'Paddy one season, groundnut the next'], ['Biological control', 'Releasing Trichogramma wasps'], ['Resistant strain', 'A pest-resistant crop variety'], ['Environmental ethics', 'Protecting birds even where no law requires it'], ['Afforestation', 'Haritha Haram tree planting'],
        ], ['Wasps are living control agents.', 'Ethics is about right and wrong, not law.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Natural Resources
// =====================================================================================
const ch10: USpec = {
  id: 'ts10.bs.ch10', subject: 'biology', title: 'Natural Resources', source: src(10),
  objectives: [
    {
      id: 'ts10.bs.res.water', title: 'Water management: Wanaparthy, Vaddicherla and Kothapally', prereqs: [],
      intro: [
        h('Two villages, one problem: groundwater'),
        photo('🧑‍🌾', 'Telangana farmers depend heavily on wells and borewells. When groundwater falls, families and crops both suffer.'),
        p('Only about 2.5% of Earth\'s water is fresh, and most of that is frozen in ice; less than 1% is groundwater and surface water we can use. Using it wisely decides whether farms survive.'),
        h('Case 1: Wanaparthy and Vaddicherla'),
        p('Two villages with similar people, crops and land were studied. Both depended on wells, and farmers in both preferred to grow paddy (a high-water crop). Wanaparthy had a percolation tank — an earthen dam that holds rainwater so it soaks into the ground and recharges wells. Vaddicherla had no other water source.'),
        stepsB(
          'At the start: Wanaparthy had about 4000 acres, 1000 acres irrigated, 155 wells. Vaddicherla had about 3000 acres, 450 acres irrigated, 175 wells.',
          'Five years later, with poor rains and about 10% more people: Wanaparthy\'s irrigated area fell to 860 acres and Vaddicherla\'s to 315 acres; many wells dried up.',
          'Open wells were replaced by deeper borewells; pumping costs rose, especially for small farmers, and highest in Vaddicherla.',
          'Lesson: the percolation tank kept Wanaparthy better off; over-pumping and paddy in a dry area made Vaddicherla suffer.',
          'Solutions introduced (by a Secunderabad-based NGO): sharing water among farmer groups, drip and sprinkler irrigation, soak pits to recharge borewells, and underground barriers (dykes) to hold groundwater; switching to crops like cotton or sesame (gingelly) that need less water.',
        ),
        def('Percolation tank', 'A small earthen dam that stores rainwater and lets it seep into the ground to recharge groundwater and wells.'),
        h('Case 2: Kothapally — a watershed success'),
        p('Kothapally village (Ranga Reddy district) once had more dry land than irrigated land, low yields and not a single water-harvesting structure. With guidance from ICRISAT (the International Crops Research Institute for the Semi-Arid Tropics, near Hyderabad), villagers and farmers acted together.'),
        stepsB(
          'Community measures: 14 water-storage structures (1 earthen and 13 masonry check dams), about 60 mini-percolation pits, and field bunding.',
          'Dry open wells were recharged by holding rainwater behind barriers in nearby channels.',
          'Farmer measures: contour bunds, broad bed and furrow fields, short crops, and Gliricidia plants on bunds to add nitrogen and hold soil.',
          'Wasteland development: trenches and plantations of custard apple, teak and other useful trees.',
          'Results: groundwater rose, more land could be cropped, and yields rose (about 250 kg more red gram and 50 kg more maize per hectare).',
        ),
        def('Watershed management', 'Conserving soil and water in the whole area that drains into a common stream, so rainwater is held and recharges groundwater.'),
        xp({
          title: 'What if? Rainwater you can harvest from a roof', formula: 'V = A × R × e / 100',
          res: ['V', 'Water harvested per year', 'L', 'A * R * e / 100', 0],
          vars: [['A', 'Roof area', 'm²', 20, 500, 10, 100], ['R', 'Annual rainfall', 'mm', 300, 1500, 10, 800], ['e', 'Collection efficiency', '%', 40, 95, 5, 80]],
          notes: [
            ['A', 'A bigger roof catches proportionally more water — school buildings are ideal.', 'A small roof still collects useful water.'],
            ['R', 'Wetter districts (Adilabad gets more rain than Mahabubnagar) can harvest more.', 'In dry years less is harvested, which is exactly when stored water matters most.'],
            ['e', 'Clean gutters and good storage waste less water.', 'Leaky gutters and overflow waste rain.'],
          ],
          mistakes: [['Forgetting that 1 mm of rain on 1 m² is 1 litre', 'That is why V in litres = area (m²) × rainfall (mm) × efficiency.'], ['Expecting 100% collection', 'Some water evaporates, splashes or overflows; 70–85% is typical.']],
          real: 'A 100 m² school roof in Hyderabad (about 800 mm rain a year) at 80% efficiency can harvest about 64,000 litres a year.',
        }),
        keys('Wanaparthy had a percolation tank and fared better than Vaddicherla.', 'Paddy + over-pumping in dry areas depletes groundwater.', 'Kothapally: ICRISAT-guided watershed work — check dams, percolation pits, bunds, recharge — raised groundwater and yields.', 'Drip irrigation, crop choice and recharge structures save water.'),
        remember('Exam point: deepening borewells does not create water — it only takes the remaining groundwater faster. Recharge is the real solution.'),
        tip('1 mm of rain on 1 m² = 1 litre. Use it to estimate any rainwater-harvesting problem.'),
      ],
      examples: [
        ex('By what percentage did the irrigated area of Wanaparthy fall when it went from 1000 to 860 acres?', ['Fall = 1000 − 860 = 140 acres.', 'Percentage = 140 ÷ 1000 × 100 = 14%.'], '14%'),
        ex('Why did Vaddicherla suffer more than Wanaparthy?', ['Both relied on wells and grew water-hungry paddy.', 'Wanaparthy\'s percolation tank recharged groundwater; Vaddicherla had no recharge source.', 'So Vaddicherla\'s wells dried faster and pumping became costlier.'], 'No percolation tank / recharge source in Vaddicherla.'),
      ],
      practice: [
        tp('harvest', (r) => {
          const A = r.pick([50, 80, 100, 120, 150, 200]);
          const R = r.pick([600, 700, 800, 900, 1000]);
          const e = r.pick([70, 75, 80, 90]);
          const V = (A * R * e) / 100;
          const place = r.pick(PLACES);
          return numQ(`A school in ${place} has a roof of ${A} m². Annual rainfall is ${R} mm and ${e}% of the rain can be collected. How many litres can be harvested in a year?`, V,
            ['1 mm of rain on 1 m² gives 1 litre.', `V = ${A} × ${R} × ${e} ÷ 100.`],
            [`${A} × ${R} = ${A * R} litres of rain fall on the roof`, `${e}% of ${A * R} = ${V} litres`],
            [{ when: String(A * R), explain: 'That is all the rain on the roof. Multiply by the efficiency to find what is collected.' }], 0.01, 'L');
        }, 2),
        tp('wells', (r) => {
          const q = r.pick(['w-area', 'v-area', 'w-wells', 'v-wells', 'w-pct']);
          if (q === 'w-area') return numQ('In Wanaparthy the irrigated area fell from 1000 acres to 860 acres in five years. By how many acres did it fall?', 140, ['Subtract new from old.'], ['1000 − 860 = 140 acres'], [], 0.001, 'acres');
          if (q === 'v-area') return numQ('In Vaddicherla the irrigated area fell from 450 acres to 315 acres. What percentage of the irrigated area was lost?', 30, ['Fall = 450 − 315.', 'Percentage = fall ÷ 450 × 100.'], ['Fall = 135 acres', '135 ÷ 450 × 100 = 30%'], [{ when: '135', explain: 'That is the fall in acres. Convert it to a percentage of 450.' }], 0.001, '%');
          if (q === 'w-wells') return numQ('Wanaparthy had 155 wells; after five years only 95 had water. How many wells dried up?', 60, ['Subtract the wells still working.'], ['155 − 95 = 60 wells'], [], 0.001, 'wells');
          if (q === 'v-wells') return numQ('Vaddicherla had 175 wells; after five years only 56 had water. How many wells dried up?', 119, ['Subtract the wells still working.'], ['175 − 56 = 119 wells'], [], 0.001, 'wells');
          return numQ('Wanaparthy irrigated 1000 acres out of a total of about 4000 acres. What percentage of its land was irrigated?', 25, ['Percentage = irrigated ÷ total × 100.'], ['1000 ÷ 4000 × 100 = 25%'], [], 0.001, '%');
        }),
        mcq('water', 'Recharge and careful use beat deeper pumping.', [
          ['Why was Wanaparthy better off than Vaddicherla?', 'It had a percolation tank that recharged groundwater', ['It had more wells', 'It grew more paddy', 'Its farmers dug deeper borewells'], 'What extra water source did it have?', 'The percolation tank recharged its wells.'],
          ['Which organisation guided the Kothapally watershed project?', 'ICRISAT', ['ISRO', 'WHO', 'UNICEF'], 'A crops research institute near Hyderabad.', 'ICRISAT provided technical support.'],
          ['Gliricidia was planted on bunds in Kothapally to…', 'Add nitrogen to soil and strengthen bunds', ['Kill pests', 'Produce fruit for sale', 'Shade wells'], 'It is a legume.', 'Legumes fix nitrogen; roots hold bunds.'],
          ['Which crop needs much more water than cotton or gingelly?', 'Paddy', ['Jowar', 'Sesame', 'Red gram'], 'Grown in flooded fields.', 'Paddy is a high-water crop.'],
          ['Drip irrigation saves water because it…', 'Delivers water directly to roots in small amounts', ['Floods the whole field', 'Uses seawater', 'Stops transpiration'], 'Drop by drop.', 'Drip irrigation reduces evaporation and runoff (can save up to about 70%).'],
          ['What fraction of Earth\'s water is fresh water?', 'About 2.5%', ['About 50%', 'About 97%', 'About 25%'], 'Most is salty sea water.', 'Only about 2.5% is fresh, and most of it is frozen.'],
        ]),
      ],
    },
    {
      id: 'ts10.bs.res.forest', title: 'Forests, soil and biodiversity', prereqs: ['ts10.bs.res.water'],
      intro: [
        h('Lungs, sponges and libraries of life'),
        photo('🐅', 'Telangana\'s Amrabad and Kawal tiger reserves protect forests where tigers sit at the top of rich food webs.'),
        h('Forests — a renewable resource if used wisely'),
        p('Forests give timber, fuel, fruits, medicines, gum and honey; they shelter wildlife, hold soil, help rain water soak in, and absorb CO₂. Yet huge areas are cleared every year for timber, farming, mining and towns. Deforestation destroys habitats, increases soil erosion and floods, and adds greenhouse gases that warm the planet.'),
        def('Deforestation', 'Large-scale cutting down of forests without replanting.'),
        def('Sustainable management', 'Using a resource to meet present needs while keeping it available for future generations.'),
        p('People have long protected forests. In 1730, Amrita Devi Bishnoi and over 300 villagers in Rajasthan gave their lives hugging trees to stop the king\'s men from cutting them; the Bishnoi community follows 29 rules to protect nature. Telangana\'s Chenchu and Gond communities take only what they need from forests. Sustainable forestry means harvesting with natural regeneration in mind, selective cutting instead of clearing, replanting, and recycling paper.'),
        h('Soil — slow to form, quick to lose'),
        p('It can take hundreds of years to form a few centimetres of fertile soil, but wind and water can wash it away in a season, especially on bare slopes. Growing the same crop every year also drains particular nutrients.'),
        stepsB(
          'Contour ploughing and contour strip cropping: plough and plant in strips across the slope so water cannot rush downhill.',
          'Terrace farming on hills.',
          'Planting trees and grass (shelter belts, cover crops) to bind soil.',
          'Crop rotation with legumes to restore nitrogen.',
          'Selective harvesting of forests so the ground is never left bare.',
        ),
        def('Soil erosion', 'The removal of the fertile top layer of soil by wind or water.'),
        h('Biodiversity'),
        def('Biodiversity', 'The variety of all living organisms — plants, animals and micro-organisms — in a region, including variety within species.'),
        p('Biodiversity gives food, medicines (thousands of plant species are used in medicines), building materials and a stable environment. Each species lost is lost forever. Hunting, pollution, habitat destruction and introduced species threaten it. National parks, wildlife sanctuaries and tiger reserves protect habitats; even a lawn of imported grass replaces many native plants.'),
        keys('Forests: renewable but over-used; deforestation → erosion, floods, global warming.', 'Bishnoi, Chenchu and Gond traditions show community conservation.', 'Soil conservation: contour strips, terraces, cover crops, crop rotation.', 'Biodiversity = variety of life; protect it in parks and sanctuaries.'),
        remember('Exam point: forests are RENEWABLE only if they are allowed to regenerate. Cutting faster than regrowth makes them effectively non-renewable.'),
        tip('Remember the Bishnoi story when someone says one person cannot make a difference.'),
      ],
      examples: [
        ex('Why do hill slopes cleared of forest suffer landslides and floods during heavy rain?', ['Tree roots bind soil and leaves break the force of rain.', 'Without trees, rain runs off quickly and carries soil away.', 'Fast runoff swells streams (floods) and loosened soil slides.'], 'Loss of tree cover increases runoff and erosion.'),
        ex('Suggest two ways a farmer on a sloping field in Adilabad can reduce soil erosion.', ['Plough and plant along the contours (contour strip cropping).', 'Plant grass or trees on bunds/terraces to bind soil.'], 'Contour farming and planting on bunds/terraces.'),
      ],
      practice: [
        tapT('tap-soil', 'Tap every practice that CONSERVES soil.', [
          ['Contour strip cropping', true], ['Terrace farming on hills', true], ['Planting trees as shelter belts', true], ['Crop rotation with legumes', true],
          ['Ploughing straight down a slope', false], ['Clearing all trees from a hillside', false], ['Overgrazing by cattle', false],
        ], ['Anything that slows water and binds soil helps.', 'Bare ground erodes.'], 'Contour strips, terraces, shelter belts and crop rotation conserve soil.'),
        mcq('forest', 'Think about what forests and soil do for us.', [
          ['Amrita Devi Bishnoi is remembered for…', 'Giving her life to protect trees', ['Building a dam', 'Discovering oxygen', 'Starting tea gardens'], 'Rajasthan, 1730.', 'She and many Bishnois hugged trees to save them.'],
          ['Biodiversity means…', 'The variety of living organisms in an area', ['The number of trees only', 'The amount of rainfall', 'Soil fertility'], 'Bio = life; diversity = variety.', 'Biodiversity covers all forms of life.'],
          ['Which is a result of deforestation?', 'Increased soil erosion', ['More rainfall absorption', 'Less carbon dioxide in air', 'More wildlife habitat'], 'Roots hold soil.', 'Without trees, soil is washed away.'],
          ['Planting crops in strips across a slope is called…', 'Contour strip cropping', ['Monoculture', 'Shifting cultivation', 'Grafting'], 'Follows the contour lines.', 'Strips across the slope slow water.'],
          ['Amrabad and Kawal in Telangana are…', 'Tiger reserves', ['Coal mines', 'Dams', 'Industrial parks'], 'They protect big cats and forests.', 'Both are tiger reserves.'],
        ]),
        matchT('res', 'term to its meaning', [
          ['Renewable resource', 'Can be replaced naturally, e.g. forests'], ['Non-renewable resource', 'Cannot be replaced, e.g. coal'], ['Soil erosion', 'Loss of topsoil by wind or water'], ['Biodiversity', 'Variety of living organisms'], ['Sustainable development', 'Meeting present needs without harming the future'],
        ], ['Coal takes millions of years to form.', 'Sustainable = can be continued.']),
      ],
    },
    {
      id: 'ts10.bs.res.fossil', title: 'Fossil fuels and minerals', prereqs: ['ts10.bs.res.forest'],
      intro: [
        h('Sunlight stored for millions of years'),
        photo('🔥', 'Coal from the Singareni mines around Kothagudem and Ramagundam runs many of Telangana\'s power stations.'),
        def('Fossil fuels', 'Fuels formed over millions of years from the buried remains of ancient plants and animals — coal, petroleum and natural gas.'),
        p('Coal formed from ancient forests buried under mud and pressed by heat and pressure. Petroleum and natural gas formed mainly from tiny sea organisms buried under sediments. Because they take millions of years to form but we burn them in decades, they are non-renewable. Coal provides the largest share of India\'s commercial energy.'),
        p('Petroleum is not only fuel — plastics, synthetic rubber and fibres like nylon, waxes, cosmetics, medicines and cleaning products are also made from it.'),
        h('Problems with burning fossil fuels'),
        stepsB(
          'They release CO₂, a greenhouse gas that causes global warming.',
          'They release sulphur and nitrogen oxides (acid rain) and fine particles (breathing problems).',
          'Reserves are limited and will run out.',
          'Mining and drilling damage land, water and habitats.',
        ),
        h('Saving fossil fuels'),
        p('Walk, cycle or use buses and the Hyderabad Metro instead of private vehicles; switch off unused lights and fans; buy energy-efficient appliances; use solar, wind and hydro power; use biofuels such as biodiesel from Jatropha seeds.'),
        h('Minerals'),
        p('Metals like iron, aluminium and copper come from mineral ores. Good ores are being used up, so extraction gets harder and prices rise. Destructive mining (such as removing whole hilltops) destroys soil, forests and habitats and pollutes water. Less wasteful mining and recycling of metals help: in some countries a large share of iron now comes from recycled cars.'),
        xp({
          title: 'What if? How long will a reserve last?', formula: 'Years left = Reserve ÷ Annual use',
          res: ['Y', 'Years the reserve will last', 'years', 'R / U', 0],
          vars: [['R', 'Known reserve', 'million tonnes', 100, 5000, 100, 1000], ['U', 'Use per year', 'million tonnes', 5, 200, 5, 20]],
          notes: [
            ['U', 'Using more each year makes the reserve run out sooner — doubling use halves the years left.', 'Saving energy and recycling stretch the reserve.'],
            ['R', 'Finding new reserves buys time, but they are still finite.', 'Smaller reserves run out faster at the same rate of use.'],
          ],
          mistakes: [['Assuming use stays constant', 'Demand usually grows every year, so real reserves run out sooner than this simple estimate.'], ['"New discoveries mean fossil fuels are renewable."', 'They are still not being formed on a human time-scale.']],
          real: 'A reserve of 1000 units used at 20 per year lasts 50 years — but at 40 per year only 25.',
        }),
        keys('Coal, petroleum, natural gas: formed over millions of years; non-renewable.', 'Burning them causes global warming, acid rain and air pollution.', 'Save fuels: public transport, efficiency, renewables, biofuels.', 'Minerals: limited; recycle metals and mine carefully.'),
        remember('Exam point: fossil fuels are non-renewable because they form far more slowly than we use them.'),
        tip('Every unit of electricity saved at home is coal not burnt at a power station.'),
      ],
      examples: [
        ex('A coal field has 600 million tonnes of reserve and 15 million tonnes are mined every year. How long will it last?', ['Years = reserve ÷ annual use.', '600 ÷ 15 = 40.'], 'About 40 years (less if use increases).'),
        ex('Give two reasons to prefer the bus or Metro over a private car in Hyderabad.', ['One bus carries many people, so fuel used per person is much less.', 'Less fuel burnt means less CO₂ and air pollution and less traffic.'], 'Saves fuel per person and reduces pollution.'),
      ],
      practice: [
        tp('years', (r) => {
          const U = r.pick([5, 10, 20, 25, 40, 50]);
          const Y = r.pick([20, 30, 40, 50, 60]);
          const R = U * Y;
          return numQ(`A mineral reserve is ${R} million tonnes and ${U} million tonnes are used every year. If use stays the same, for how many years will it last?`, Y,
            ['Years = reserve ÷ yearly use.'], [`${R} ÷ ${U} = ${Y} years`],
            [{ when: String(R * U), explain: 'Divide the reserve by the yearly use, do not multiply.' }], 0.001, 'years');
        }),
        mcq('fuel', 'Fossil fuels take millions of years to form.', [
          ['Fossil fuels are non-renewable because…', 'They take millions of years to form', ['They are found underground', 'They are liquids', 'They are cheap'], 'Compare formation time with use time.', 'We use them far faster than they form.'],
          ['Which gas from burning fossil fuels causes global warming?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Helium'], 'A greenhouse gas.', 'CO₂ traps heat in the atmosphere.'],
          ['Which of these is made from petroleum?', 'Plastics', ['Cotton', 'Wool', 'Jute'], 'Synthetic materials.', 'Plastics come from petroleum products.'],
          ['Biodiesel in India is made from seeds of…', 'Jatropha', ['Mango', 'Neem', 'Paddy'], 'A hardy shrub on wasteland.', 'Jatropha seeds yield oil for biodiesel.'],
          ['Singareni collieries in Telangana mine…', 'Coal', ['Gold', 'Petroleum', 'Diamonds'], 'Fuel for power stations.', 'Singareni is a major coal producer.'],
          ['Which helps conserve minerals?', 'Recycling metals', ['Throwing away old cars', 'Mountaintop removal mining', 'Using more aluminium foil'], 'Reuse the material.', 'Recycling reduces the need for new ore.'],
        ]),
        tapT('tap-save', 'Tap every action that SAVES fossil fuels.', [
          ['Taking the bus or Metro', true], ['Cycling to school', true], ['Switching off unused fans', true], ['Using solar water heaters', true],
          ['Leaving the car engine running while waiting', false], ['Keeping lights on in empty rooms', false], ['Using a private car for very short trips', false],
        ], ['Less burning = saving.', 'Idling engines waste fuel.'], 'Public transport, cycling, switching off and solar energy save fossil fuels.'),
      ],
    },
    {
      id: 'ts10.bs.res.3r', title: 'Conservation and the Rs: reduce, reuse, recycle, recover', prereqs: ['ts10.bs.res.fossil'],
      intro: [
        h('Small steps, big savings'),
        photo('🪣', 'Collecting the water used to wash vegetables to water plants is a simple way to reduce waste at home.'),
        p('Conservation is the wise use of natural resources so that they last and are available to all living things now and in future. Today most people live in countries that use resources faster than nature can replace them. Each of us can help with the "R" rules. Your textbook lists four.'),
        stepsB(
          'Reduce: use less. Fix leaking taps, take a bucket bath instead of a long shower, switch off lights and fans, avoid excessive decorative lighting at festivals.',
          'Reuse: use things again instead of throwing them away — glass jars, cloth bags, one-side-used paper, old clothes as dusters.',
          'Recycle: convert waste into new materials — paper, glass, metals, some plastics. Sort waste at home; plastics must be separated by type before recycling, which makes plastic recycling difficult.',
          'Recover: replace what we take — plant trees when trees are cut for roads or industries; transplant big trees where possible; recover energy or compost from waste.',
        ),
        def('Conservation', 'The careful use and protection of natural resources to prevent waste and ensure they last.'),
        def('Sustainable development', 'Development that meets the needs of the present without reducing the ability of future generations to meet their needs.'),
        p('Reduce is the best R, because it avoids using the resource at all; reuse is next; recycling still needs energy. Governments help through laws (protected areas, pollution control) and incentives; international and local conservation groups protect forests, animals and clean air.'),
        keys('Reduce (use less) > Reuse (use again) > Recycle (make new things from waste) > Recover (replace / regain).', 'Sort waste at source: wet, dry, hazardous.', 'Conservation + sustainable development keep resources for the future.'),
        remember('Exam point: "Reduce" saves the most because the resource is never used. Plastic recycling is limited because each plastic type must be sorted separately.'),
        tip('Before throwing something away ask: Can I do without it? Can I use it again? Can someone recycle it?'),
      ],
      examples: [
        ex('A tap leaks one drop per second; 20 drops make 1 mL. How much water is wasted in a day?', ['Seconds in a day = 86,400 → 86,400 drops.', '86,400 ÷ 20 = 4320 mL.', '≈ 4.3 litres a day.'], 'About 4.3 litres per day — fixing it is "reduce".'),
        ex('Classify: (a) carrying a cloth bag to the market, (b) making new paper from old newspapers, (c) planting saplings after a road is widened, (d) turning off the geyser after use.', ['(a) using a bag again and again → reuse.', '(b) new material from waste → recycle.', '(c) replacing lost trees → recover.', '(d) using less energy → reduce.'], 'a reuse, b recycle, c recover, d reduce.'),
      ],
      practice: [
        matchT('rs', 'action to the R it shows', [
          ['Fixing a leaking tap', 'Reduce'], ['Using a glass jar again for storage', 'Reuse'], ['Making new paper from old newspapers', 'Recycle'], ['Planting trees where trees were cut for a road', 'Recover'],
        ], ['Recover means replacing what was taken.', 'Recycle needs a factory process.'], 4),
        tp('leak', (r) => {
          const dps = r.pick([1, 2, 3]);
          const per = r.pick([10, 20]);
          const hours = r.pick([1, 2, 6, 12, 24]);
          const mL = (dps * 3600 * hours) / per;
          return numQ(`A tap leaks ${dps} drop${dps > 1 ? 's' : ''} per second and ${per} drops make 1 mL. How many millilitres are wasted in ${hours} hour${hours > 1 ? 's' : ''}?`, mL,
            [`Drops = ${dps} × 3600 × ${hours}.`, `Divide by ${per} to get mL.`],
            [`${dps} × 3600 × ${hours} = ${dps * 3600 * hours} drops`, `÷ ${per} = ${mL} mL`],
            [{ when: String(dps * 3600 * hours), explain: 'That is the number of drops. Divide by drops per mL.' }], 0.001, 'mL');
        }, 2),
        mcq('ideas', 'Reduce first, then reuse, then recycle; recover what is lost.', [
          ['Which R saves the most resources?', 'Reduce', ['Recycle', 'Reuse', 'Recover'], 'Not using at all.', 'Reducing avoids using the resource in the first place.'],
          ['Why is recycling plastic difficult?', 'Different types must be sorted and recycled separately', ['Plastic cannot melt', 'Plastic is too heavy', 'Plastic is biodegradable'], 'Many kinds of plastic.', 'Each type can be recycled only with its own kind.'],
          ['Planting trees to replace those cut for a new highway is…', 'Recover', ['Reduce', 'Reuse', 'Recycle'], 'Getting back what was lost.', 'Recover means restoring the resource.'],
          ['Using both sides of a sheet of paper is an example of…', 'Reduce/reuse — using less new paper', ['Recycling', 'Deforestation', 'Biomagnification'], 'No factory process involved.', 'It cuts the need for new paper.'],
          ['Sustainable development means…', 'Meeting present needs without harming future generations', ['Using all resources quickly', 'Stopping all development', 'Only planting trees'], 'Both now and later.', 'Development that can continue without exhausting resources.'],
        ]),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10];
