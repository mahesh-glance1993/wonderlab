// Telangana SCERT Class 9 — Biological Science (11 chapters). Original teaching aligned to the official chapter
// list (src/content/ts/books.ts, syllabus.json). Explanations, examples and practice are written for WonderLab.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, explore, stepsB, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(9, 'biological-science', n);
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Take the left items one at a time and ask what each one actually does.' }],
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
// Chapter 1 — Cell: Structure and Functions
// =====================================================================================
const ch1: USpec = {
  id: 'ts9.bs.ch1', subject: 'biology', title: 'Cell — Structure and Functions', source: src(1),
  objectives: [
    {
      id: 'ts9.bs.cell.typical', title: 'The cell and the typical plant and animal cell', prereqs: [],
      intro: [
        h('Bricks of life'),
        photo('🔬', 'Peel the thin skin from the inside of an onion layer, put it on a slide with a drop of iodine and look through a microscope. You will see neat little boxes — cells.'),
        p('A house in Hyderabad is built from thousands of bricks. Your body is built from about 37 trillion tiny units called cells. A bacterium is just one cell; a neem tree or an elephant is made of billions of them. Every living thing is made of one or more cells.'),
        def('Cell', 'The smallest structural and functional unit of life. It can take in food, release energy, grow and make copies of itself.'),
        def('Unicellular organism', 'A living thing made of a single cell, such as Amoeba, Paramecium or a bacterium.'),
        def('Multicellular organism', 'A living thing made of many cells that share the work, such as a mango tree or a human.'),
        h('What every typical cell has'),
        p('However different cells look, a typical cell has three main parts: a thin outer boundary called the plasma membrane, a jelly-like cytoplasm, and a control centre called the nucleus.'),
        p('Plant cells also have a stiff cell wall outside the membrane, green chloroplasts for making food and one large central vacuole. Animal cells have no cell wall and no chloroplasts, have small vacuoles (if any) and have a centrosome that helps in cell division.'),
        p('Labelled parts of a plant cell diagram: cell wall · plasma membrane · cytoplasm · nucleus (with nucleolus) · chloroplast · large central vacuole · mitochondria.'),
        p('Labelled parts of an animal cell diagram: plasma membrane · cytoplasm · nucleus (with nucleolus) · mitochondria · small vacuoles · centrosome · Golgi body · endoplasmic reticulum.'),
        h('Why are cells so small?'),
        p('Food and oxygen enter through the cell surface, but they are used by the whole volume of the cell. If a cell grew very big, its volume would grow much faster than its surface, and the surface could not supply the inside quickly enough. So cells stay small and organisms grow by making MORE cells.'),
        xp({
          title: 'What if? Change the size of a cube-shaped cell', formula: 'surface ÷ volume = 6s² ÷ s³ = 6 / s',
          res: ['R', 'Surface area to volume ratio', 'per µm', '6 / s', 2],
          vars: [['s', 'Side of the cell', 'µm', 1, 100, 1, 10]],
          notes: [['s', 'A bigger cell has LESS surface for each unit of volume, so supplying its inside becomes harder.', 'A smaller cell has MORE surface for each unit of volume, so materials reach every part quickly.']],
          mistakes: [['Thinking a bigger cell has a bigger ratio', 'Surface grows with s², volume with s³. Volume wins, so the ratio falls as the cell grows.']],
          real: 'This is why an elephant is not made of giant cells. Its cells are about the same size as yours; it simply has many more of them.',
        }),
        keys('All living things are made of cells.', 'Typical cell = plasma membrane + cytoplasm + nucleus.', 'Plant cells: cell wall, chloroplasts, large vacuole. Animal cells: no wall, centrosome present.', 'Small cells have a large surface for their volume.'),
        remember('Robert Hooke first used the word "cell" in 1665 after seeing tiny boxes in a thin slice of cork.'),
        tip('To find the real size of something seen under a microscope: real size = size in the image ÷ magnification.'),
      ],
      examples: [
        ex('Under a microscope with magnification 400×, a cheek cell appears 24 mm across. What is its real size in micrometres (1 mm = 1000 µm)?', ['Real size = image size ÷ magnification', '24 mm ÷ 400 = 0.06 mm', '0.06 mm × 1000 = 60 µm'], '60 µm'),
        ex('Diya sees cells with a thick wall, green bodies and a big clear space in the middle. Is this a plant or an animal cell?', ['A cell wall is found in plant cells.', 'Green bodies are chloroplasts — only in plant cells.', 'A big central vacuole is typical of plant cells.'], 'A plant cell (for example, a leaf cell)'),
      ],
      practice: [
        mcq('plant-animal', 'Think of the three features only plants have.', [
          ['Which part is found in a plant cell but NOT in an animal cell?', 'Cell wall', ['Nucleus', 'Plasma membrane', 'Mitochondria'], 'Animal cells are bounded only by a membrane.', 'Plant cells have a stiff cellulose cell wall outside the membrane; animal cells do not.'],
          ['Which structure is found in animal cells but usually NOT in plant cells?', 'Centrosome', ['Nucleus', 'Cytoplasm', 'Ribosome'], 'It helps in cell division in animals.', 'The centrosome (with centrioles) is present in animal cells and absent in most plant cells.'],
          ['A cell has one very large central vacuole. It is most likely a…', 'Plant cell', ['Animal cell', 'Bacterial cell', 'Nerve cell'], 'Which cells store lots of water and sap?', 'Mature plant cells have a large central vacuole filled with cell sap.'],
          ['Which organism is unicellular?', 'Amoeba', ['Earthworm', 'Neem tree', 'Frog'], 'Unicellular means one cell only.', 'Amoeba is a single cell that does all life activities.'],
          ['The three basic parts of a typical cell are…', 'Plasma membrane, cytoplasm and nucleus', ['Cell wall, chloroplast and vacuole', 'Nucleus, bone and blood', 'Tissue, organ and system'], 'Every cell, plant or animal, has these.', 'Membrane, cytoplasm and nucleus are common to typical cells.'],
          ['Who first saw and named "cells" in a slice of cork?', 'Robert Hooke', ['Robert Brown', 'Charles Darwin', 'Rudolf Virchow'], 'The year was 1665.', 'Robert Hooke described cork cells in 1665.'],
        ]),
        tapT('tap-plant', 'Tap every feature you would find in a typical PLANT cell.', [
          ['Cell wall', true], ['Chloroplasts', true], ['Large central vacuole', true], ['Nucleus', true], ['Plasma membrane', true],
          ['Centrosome', false], ['Bones', false], ['Hair', false],
        ], ['Plant cells have everything a typical cell has, plus a few extras.', 'Bones and hair belong to whole animals, not cells.'], 'Plant cells have membrane, cytoplasm and nucleus, plus cell wall, chloroplasts and a big vacuole; centrosomes are typical of animal cells.'),
        tp('real-size', (r) => {
          const mag = r.pick([100, 200, 400, 500, 1000]);
          const real = r.pick([10, 20, 25, 40, 50, 60, 80, 100]);
          const imgMm = rd(real * mag / 1000, 3);
          return numQ(`${who(r)} looks at a cell under a microscope with magnification ${mag}×. The cell appears ${imgMm} mm wide. What is its real width in µm? (1 mm = 1000 µm) (Type the number only.)`, real, undefined,
            ['Real size = image size ÷ magnification.', 'Convert mm to µm by multiplying by 1000.'],
            [`${imgMm} mm ÷ ${mag} = ${rd(imgMm / mag, 6)} mm`, `${rd(imgMm / mag, 6)} mm × 1000 = ${real} µm`],
            [{ when: String(rd(imgMm * mag, 3)), explain: 'You multiplied by the magnification. The image is bigger than the real cell, so divide.' }, { when: String(rd(imgMm / mag, 6)), explain: 'That is the answer in mm. Multiply by 1000 to get µm.' }]);
        }, 2),
        tp('sa-v', (r) => {
          const s = r.pick([1, 2, 3, 4, 5, 8, 10, 12, 20]);
          return numQ(`A cube-shaped cell has side ${s} µm. Find its surface area to volume ratio (6s² ÷ s³ = 6/s).`, rd(6 / s, 2), undefined,
            ['Surface area = 6 × s × s; volume = s × s × s.', 'The ratio simplifies to 6 ÷ s.'],
            [`Surface = 6 × ${s}² = ${6 * s * s} µm²`, `Volume = ${s}³ = ${s ** 3} µm³`, `Ratio = ${6 * s * s} ÷ ${s ** 3} = ${rd(6 / s, 2)}`, 'Smaller cells have larger ratios.'],
            [{ when: String(rd(s / 6, 2)), explain: 'You divided the wrong way round. It is surface ÷ volume = 6 ÷ s.' }]);
        }, 2),
      ],
    },
    {
      id: 'ts9.bs.cell.boundary', title: 'Cell membrane, cell wall, nucleus and cytoplasm', prereqs: ['ts9.bs.cell.typical'],
      intro: [
        h('The gate, the fence and the head office'),
        photo('🧱', 'A compound wall around a school is strong and lets almost anything through its gate; the school office decides what happens inside. A plant cell has a similar wall, gate and office.'),
        def('Plasma membrane', 'The thin, flexible outer layer of every cell, made of lipids and proteins. It is selectively permeable: it lets some substances in or out and stops others.'),
        def('Cell wall', 'A rigid layer outside the plasma membrane of plant cells, made mainly of cellulose. It gives shape and strength and lets most substances pass freely (it is freely permeable).'),
        p('Because the cell wall is strong, a plant cell can take in water and swell without bursting. This firmness (turgidity) keeps leaves and young stems upright. Fungi have walls made of chitin, and bacteria have walls of a different material.'),
        def('Cytoplasm', 'The jelly-like fluid between the plasma membrane and the nucleus. The organelles float in it and many chemical reactions of the cell take place in it.'),
        def('Nucleus', 'The control centre of the cell, discovered by Robert Brown in 1831. It is surrounded by a double nuclear membrane with pores and contains chromatin and a nucleolus.'),
        def('Chromatin and chromosomes', 'Chromatin is a thread-like network of DNA and protein. When the cell divides, it coils into rod-shaped chromosomes that carry genes from parents to offspring.'),
        def('Nucleolus', 'A dense round body inside the nucleus that helps to make ribosomes.'),
        p('Labelled parts of the nucleus: nuclear membrane · nuclear pores · nucleoplasm · chromatin · nucleolus.'),
        keys('Plasma membrane = selectively permeable; cell wall = freely permeable.', 'Plant cell wall is made of cellulose.', 'The nucleus controls cell activities and carries hereditary information (DNA).', 'Cytoplasm is the site of many cell reactions.'),
        remember('Bacteria have no proper nucleus — their DNA lies in the cytoplasm without a nuclear membrane. Such cells are called prokaryotic. Cells with a true nucleus are eukaryotic.'),
        tip('Membrane = "Mind the gate" (chooses); wall = "Wall for strength" (does not choose).'),
      ],
      examples: [
        ex('A red blood cell placed in pure water swells and bursts, but an onion peel cell in water only becomes firm. Explain.', ['Both cells take in water by osmosis through the plasma membrane.', 'The red blood cell has only a membrane, which stretches until it breaks.', 'The onion cell has a strong cellulose wall that stops it from swelling too much.'], 'The cell wall protects the plant cell from bursting.'),
        ex('Arjun says, "Bacteria have DNA, so they must have a nucleus." Is he right?', ['Bacteria do have DNA.', 'But their DNA is not enclosed by a nuclear membrane.', 'So they have a nuclear region (nucleoid), not a true nucleus.'], 'No. Bacteria are prokaryotes without a membrane-bound nucleus.'),
      ],
      practice: [
        mcq('parts', 'Think about what each layer is made of and what it lets through.', [
          ['Which layer of a cell is selectively permeable?', 'Plasma membrane', ['Cell wall', 'Nucleolus', 'Chromatin'], 'It decides what enters and leaves.', 'The plasma membrane allows only some substances to pass.'],
          ['The plant cell wall is made mainly of…', 'Cellulose', ['Chitin', 'Protein only', 'Starch'], 'Cotton fibres are almost pure of this.', 'Plant cell walls are built from cellulose fibres.'],
          ['Which part of the cell carries hereditary information?', 'Chromosomes in the nucleus', ['Cell wall', 'Vacuole', 'Plasma membrane'], 'Genes are made of DNA.', 'DNA in chromosomes carries genes from parents to offspring.'],
          ['Who discovered the nucleus in 1831?', 'Robert Brown', ['Robert Hooke', 'Leeuwenhoek', 'Schwann'], 'He also observed "Brownian motion".', 'Robert Brown described the nucleus in orchid cells in 1831.'],
          ['What is the job of the nucleolus?', 'Helps make ribosomes', ['Stores water', 'Makes the cell wall', 'Traps sunlight'], 'Ribosomes make proteins; their parts are assembled here.', 'The nucleolus produces ribosome subunits.'],
          ['A cell with no membrane-bound nucleus is called…', 'Prokaryotic', ['Eukaryotic', 'Multicellular', 'Plant cell'], '"Pro" means before; "karyon" means nucleus.', 'Prokaryotic cells such as bacteria lack a true nucleus.'],
        ]),
        matchT('match', 'part to its feature', [
          ['Plasma membrane', 'Selectively permeable boundary'], ['Cell wall', 'Rigid cellulose layer in plants'], ['Cytoplasm', 'Jelly in which organelles float'],
          ['Nucleus', 'Control centre of the cell'], ['Nucleolus', 'Makes ribosomes'], ['Chromatin', 'DNA–protein threads'], ['Nuclear pores', 'Openings in the nuclear membrane'],
        ], ['Start with the ones you are sure about.', 'The nucleus contains the nucleolus and chromatin.']),
        tapT('tap-nucleus', 'Tap every structure found INSIDE or ON the nucleus.', [
          ['Nucleolus', true], ['Chromatin', true], ['Nuclear pores', true], ['Nucleoplasm', true],
          ['Cell wall', false], ['Chloroplast', false], ['Central vacuole', false],
        ], ['The nucleus has its own membrane and its own fluid.', 'Chloroplasts and vacuoles are in the cytoplasm.'], 'Nuclear membrane with pores, nucleoplasm, chromatin and nucleolus make up the nucleus.'),
        mcq('reason', 'Ask what would happen without that part.', [
          ['Why do leaves of a well-watered plant stay stiff?', 'Water presses the cells against their cell walls (turgidity)', ['The nucleus pushes outward', 'The membrane hardens', 'Chlorophyll is stiff'], 'Swollen cells pushing on a strong wall become firm.', 'Turgid cells pressing on rigid walls keep soft parts upright.'],
          ['Why does a red blood cell burst in pure water but a leaf cell does not?', 'The leaf cell has a cell wall', ['The leaf cell has no membrane', 'Blood cells have walls', 'Leaf cells do not take in water'], 'Which layer resists swelling?', 'The rigid cell wall resists bursting; animal cells have no wall.'],
          ['If the nucleus is removed from an Amoeba, it soon dies. This shows the nucleus…', 'Controls the life activities of the cell', ['Only stores water', 'Makes the cell wall', 'Has no use'], 'What gives the cell its instructions?', 'The nucleus directs the cell’s activities; without it the cell cannot survive long.'],
          ['Fungi have cell walls made of…', 'Chitin', ['Cellulose', 'Bone', 'Lignin only'], 'Insects’ outer covering is made of the same material.', 'Fungal cell walls are made of chitin.'],
          ['Which statement about the cell wall is TRUE?', 'It is freely permeable', ['It is selectively permeable', 'It is found in all animal cells', 'It is inside the plasma membrane'], 'The wall is like a strong fence with wide gaps.', 'The cell wall lets most substances through; selection is done by the membrane.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.cell.organelles', title: 'Cell organelles and their functions', prereqs: ['ts9.bs.cell.boundary'],
      intro: [
        h('A factory in a drop'),
        photo('⚙️', 'A factory has a power station, an assembly line, a packing unit and a waste department. A cell has organelles that do each of these jobs.'),
        def('Organelle', 'A small structure inside a cell that does a particular job, as an organ does in the body.'),
        def('Mitochondria', 'The "powerhouses" of the cell. They release energy from food (glucose) during respiration and store it as ATP. They have a double membrane with inner folds called cristae.'),
        def('Plastids', 'Organelles found only in plant cells. Chloroplasts are green and make food by photosynthesis; chromoplasts give colour to flowers and fruits; leucoplasts are colourless and store starch, oil or protein.'),
        def('Endoplasmic reticulum (ER)', 'A network of membrane tubes. Rough ER has ribosomes on it and helps make proteins; smooth ER makes lipids and helps remove poisons.'),
        def('Ribosomes', 'Tiny granules, free or on rough ER, where proteins are made.'),
        def('Golgi complex', 'Stacks of flat sacs, named after Camillo Golgi, that modify, pack and send out materials made by the cell.'),
        def('Lysosomes', 'Small sacs of digestive enzymes that break down worn-out parts and germs. Because they can digest their own cell when it is damaged, they are called "suicide bags".'),
        def('Vacuoles', 'Fluid-filled sacs that store water, food and wastes. Plant cells have one large central vacuole that keeps the cell firm.'),
        keys('Mitochondria — energy; chloroplasts — food; ribosomes — protein; Golgi — packaging; lysosomes — digestion; vacuole — storage.', 'Mitochondria and chloroplasts have their own DNA and ribosomes.'),
        remember('Exam favourite: mitochondria = powerhouse; lysosomes = suicide bags; ribosomes = protein factories.'),
        tip('Remember the colour plastids: CHLORO = green, CHROMO = coloured, LEUCO = white (colourless).'),
      ],
      examples: [
        ex('Muscle cells of an athlete have many more mitochondria than skin cells. Why?', ['Mitochondria release energy from food.', 'Muscles need a lot of energy to contract repeatedly.', 'So muscle cells have many mitochondria.'], 'Muscles need more energy, so they have more mitochondria.'),
        ex('A red tomato ripens from a green tomato. Which plastids change?', ['A green tomato has chloroplasts.', 'On ripening, chlorophyll breaks down and red pigments form.', 'Chloroplasts change into chromoplasts.'], 'Chloroplasts become chromoplasts.'),
      ],
      practice: [
        matchT('match', 'organelle to its job', [
          ['Mitochondria', 'Release energy (ATP)'], ['Chloroplast', 'Photosynthesis'], ['Ribosome', 'Protein synthesis'], ['Golgi complex', 'Packaging and secretion'],
          ['Lysosome', 'Digests waste and germs'], ['Vacuole', 'Storage of water and sap'], ['Smooth ER', 'Makes lipids'], ['Leucoplast', 'Stores starch'],
        ], ['Think of a factory: power station, assembly line, packing unit, waste unit.', 'Chloro = green = food-making.']),
        mcq('organelles', 'Recall the nickname of each organelle.', [
          ['Which organelle is called the "powerhouse" of the cell?', 'Mitochondria', ['Golgi complex', 'Lysosome', 'Ribosome'], 'It releases energy from glucose.', 'Mitochondria carry out cellular respiration and make ATP.'],
          ['Which organelle is called the "suicide bag"?', 'Lysosome', ['Vacuole', 'Mitochondria', 'Plastid'], 'It is full of digestive enzymes.', 'Lysosomes can burst and digest their own damaged cell.'],
          ['Proteins are made on…', 'Ribosomes', ['Lysosomes', 'Vacuoles', 'Cell wall'], 'They are often attached to rough ER.', 'Ribosomes join amino acids to make proteins.'],
          ['The red colour of a ripe chilli is due to…', 'Chromoplasts', ['Chloroplasts', 'Leucoplasts', 'Lysosomes'], 'Coloured plastids other than green.', 'Chromoplasts carry red, orange and yellow pigments.'],
          ['Starch grains in potato cells are stored in…', 'Leucoplasts', ['Chloroplasts', 'Chromoplasts', 'Mitochondria'], 'Potato tubers grow underground — colourless plastids.', 'Leucoplasts (amyloplasts) store starch.'],
          ['Which organelle packs and dispatches materials made in the cell?', 'Golgi complex', ['Nucleolus', 'Ribosome', 'Centrosome'], 'Named after Camillo Golgi.', 'The Golgi complex modifies, packages and sends out materials.'],
          ['Which two organelles have their own DNA?', 'Mitochondria and chloroplasts', ['Golgi and lysosomes', 'Ribosomes and vacuoles', 'ER and Golgi'], 'Both are energy organelles.', 'Mitochondria and chloroplasts contain their own DNA and ribosomes.'],
        ]),
        tapT('tap-membrane', 'Tap every organelle that is bounded by a membrane.', [
          ['Mitochondria', true], ['Chloroplast', true], ['Golgi complex', true], ['Lysosome', true], ['Endoplasmic reticulum', true], ['Vacuole', true],
          ['Ribosome', false],
        ], ['Only one of these is a tiny granule with no membrane.', 'Ribosomes are found even in bacteria, which lack membrane organelles.'], 'Ribosomes have no membrane; the others are membrane-bound organelles.', 5, 2),
        mcq('apply', 'Ask what job the cell does most.', [
          ['Cells of the pancreas make and send out lots of enzyme proteins. They will have plenty of…', 'Rough ER and Golgi complex', ['Chloroplasts', 'Cell walls', 'Leucoplasts'], 'Making protein and packing it for export.', 'Rough ER makes proteins and the Golgi packs them for secretion.'],
          ['White blood cells destroy germs. Which organelle will be abundant in them?', 'Lysosomes', ['Chloroplasts', 'Large vacuoles', 'Cell wall'], 'Germs must be digested.', 'Lysosome enzymes digest swallowed germs.'],
          ['Leaf cells exposed to sunlight are rich in…', 'Chloroplasts', ['Leucoplasts', 'Lysosomes', 'Centrosomes'], 'They make food using sunlight.', 'Chloroplasts trap light for photosynthesis.'],
          ['A flight muscle of a bird works continuously. It will have many…', 'Mitochondria', ['Vacuoles', 'Plastids', 'Cell walls'], 'Continuous work needs constant energy.', 'Mitochondria supply ATP for muscle work.'],
          ['Liver cells remove poisons and make fats. They have plenty of…', 'Smooth ER', ['Chloroplasts', 'Chromoplasts', 'Cell walls'], 'Which ER makes lipids?', 'Smooth ER makes lipids and helps detoxify poisons.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.cell.origin', title: 'Where cells come from: cell theory and cell division', prereqs: ['ts9.bs.cell.typical'],
      intro: [
        h('Every cell from a cell'),
        photo('🥚', 'A hen’s egg yolk is one giant cell. After fertilisation it divides again and again to form the millions of cells of a chick.'),
        p('Early scientists thought life could arise from mud or rotting food. Careful microscope work showed otherwise. In 1838 Matthias Schleiden found that all plants are made of cells; in 1839 Theodor Schwann found the same for animals. In 1855 Rudolf Virchow added that new cells come only from existing cells.'),
        def('Cell theory', '(1) All living things are made of one or more cells. (2) The cell is the basic unit of structure and function. (3) All cells come from pre-existing cells.'),
        def('Cell division', 'The process by which one parent cell divides to form daughter cells. It is how organisms grow, repair injuries and reproduce.'),
        def('Mitosis', 'Division that gives two daughter cells with the same number of chromosomes as the parent. Used for growth and repair.'),
        def('Meiosis', 'Division in reproductive organs that gives four cells, each with half the number of chromosomes. Used to make gametes (sperm and egg).'),
        h('Mitosis in short'),
        stepsB('The chromosomes in the nucleus copy themselves.', 'The chromosomes coil and become thick and visible.', 'They line up across the middle of the cell.', 'The two copies of each chromosome are pulled to opposite ends.', 'The cytoplasm divides and two daughter cells form.'),
        keys('Schleiden (plants), Schwann (animals), Virchow ("omnis cellula e cellula").', 'Mitosis: 1 → 2 identical cells.', 'Meiosis: 1 → 4 cells with half the chromosomes.'),
        remember('After n rounds of mitosis, one cell becomes 2ⁿ cells.'),
        tip('MiTosis = Two cells (Twins); MeiOsis = fOur cells for sex cells.'),
      ],
      examples: [
        ex('A single cell divides by mitosis every 30 minutes. How many cells are there after 3 hours?', ['3 hours = 180 min, so 180 ÷ 30 = 6 divisions.', 'Cells = 2⁶', '= 64'], '64 cells'),
        ex('Human body cells have 46 chromosomes. How many does a sperm cell have?', ['Sperm is made by meiosis.', 'Meiosis halves the chromosome number.', '46 ÷ 2 = 23'], '23 chromosomes'),
      ],
      practice: [
        tp('doubling', (r) => {
          const n = r.pick([3, 4, 5, 6, 7, 8, 10]);
          const start = r.pick([1, 1, 2, 3, 5]);
          return numQ(`${start === 1 ? 'One cell' : `${start} cells`} each divide by mitosis ${n} times in a row (every cell divides each time). How many cells are there at the end?`, start * 2 ** n, undefined,
            ['Each division doubles the number of cells.', `Multiply by 2, ${n} times: ${start} × 2^${n}.`],
            [`Cells = ${start} × 2^${n}`, `= ${start} × ${2 ** n} = ${start * 2 ** n}`],
            [{ when: String(start * 2 * n), explain: 'You doubled only once per step in total. Each round doubles ALL the cells, so the number grows as powers of 2.' }]);
        }, 2),
        mcq('theory', 'Recall the three statements of cell theory.', [
          ['Who stated that all plants are made of cells?', 'Matthias Schleiden', ['Theodor Schwann', 'Robert Hooke', 'Gregor Mendel'], 'He was a German botanist (1838).', 'Schleiden proposed that all plants are made of cells.'],
          ['Who stated that all animals are made of cells?', 'Theodor Schwann', ['Matthias Schleiden', 'Robert Brown', 'Louis Pasteur'], 'He was a German zoologist (1839).', 'Schwann extended the cell idea to animals.'],
          ['"Omnis cellula e cellula" means…', 'All cells come from pre-existing cells', ['All cells have walls', 'Cells come from mud', 'All cells are green'], 'Rudolf Virchow, 1855.', 'Virchow said every cell arises from an existing cell.'],
          ['Which is NOT a part of the cell theory?', 'All cells have a cell wall', ['All living things are made of cells', 'The cell is the basic unit of life', 'New cells come from existing cells'], 'Animal cells lack one structure.', 'Animal cells have no wall, so this is not part of cell theory.'],
          ['Mitosis produces…', 'Two cells identical to the parent', ['Four cells with half the chromosomes', 'One large cell', 'Gametes only'], 'It is used for growth.', 'Mitosis gives two genetically identical daughter cells.'],
          ['Meiosis takes place in…', 'Reproductive organs, to form gametes', ['Skin cells for healing', 'Root tips for growth', 'Blood plasma'], 'It halves the chromosome number.', 'Meiosis forms sperm and eggs in the reproductive organs.'],
        ]),
        orderT('order-mitosis', 'Put the events of mitosis in order.', [
          'Chromosomes copy themselves', 'Chromosomes coil and become visible', 'Chromosomes line up in the middle', 'Copies are pulled to opposite ends', 'Cytoplasm divides into two cells',
        ], ['Copying must happen before anything is separated.', 'The cell splits last.'], 'Chromosomes are copied, made visible, lined up, separated, and then the cytoplasm divides.'),
        tapT('tap-mitosis', 'Tap every process that depends on MITOSIS.', [
          ['Growth of a baby', true], ['Healing of a cut on the knee', true], ['Growth of a root tip', true], ['Replacing worn-out skin cells', true],
          ['Formation of sperm', false], ['Formation of egg cells', false],
        ], ['Mitosis makes identical copies.', 'Gametes need half the chromosomes.'], 'Growth and repair use mitosis; gametes are formed by meiosis.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Plant Tissues
// =====================================================================================
const ch2: USpec = {
  id: 'ts9.bs.ch2', subject: 'biology', title: 'Plant Tissues', source: src(2),
  objectives: [
    {
      id: 'ts9.bs.ptis.parts', title: 'Parts of a plant and what tissues are', prereqs: [],
      intro: [
        h('Teamwork in a plant'),
        photo('🌱', 'A groundnut seedling pushes a root down and a shoot up. Within days, each part already has its own team of cells doing its own job.'),
        p('Each part of a plant has a job. Roots hold the plant in the soil and absorb water and minerals. The stem holds up leaves and flowers and carries water up and food down. Leaves make food by photosynthesis and exchange gases. Flowers form seeds and fruits for reproduction.'),
        p('These jobs are done by groups of cells working together. A group of cells that are similar in structure and work together for a common function is called a tissue.'),
        def('Tissue', 'A group of cells that are similar in structure and origin and work together to perform a particular function.'),
        def('Organ', 'A structure made of different tissues working together, e.g. a leaf or a root.'),
        stepsB('Cells', 'form tissues', 'which form organs', 'which form organ systems (root system, shoot system)', 'which form the whole organism'),
        p('Plants mostly stay in one place and keep growing all their life, so many of their tissues are dead supporting tissues, and growth happens only at special growing regions.'),
        keys('Root: anchor + absorb. Stem: support + transport. Leaf: food + gas exchange. Flower: reproduction.', 'Tissue = group of similar cells with a common function.', 'Plant tissues: meristematic (dividing) and permanent (no longer dividing).'),
        remember('Levels of organisation: cell → tissue → organ → organ system → organism.'),
        tip('Ask "what job?" first. The job tells you what kind of tissue to expect.'),
      ],
      examples: [
        ex('A potted plant is not watered for a week. Which organ fails first and why do the leaves droop?', ['Roots cannot absorb water from dry soil.', 'The stem has no water to carry up.', 'Leaf cells lose water and become soft.'], 'Roots cannot absorb water, so leaf cells lose firmness and droop.'),
        ex('Arrange: leaf, chloroplast, palisade tissue, shoot system, mesophyll cell.', ['Organelle: chloroplast', 'Cell: mesophyll cell', 'Tissue: palisade tissue', 'Organ: leaf', 'Organ system: shoot system'], 'chloroplast → mesophyll cell → palisade tissue → leaf → shoot system'),
      ],
      practice: [
        matchT('match', 'plant part to its main function', [
          ['Root', 'Absorbs water and minerals'], ['Stem', 'Supports and transports'], ['Leaf', 'Makes food'], ['Flower', 'Reproduction'], ['Fruit', 'Protects seeds and helps dispersal'], ['Seed', 'Grows into a new plant'],
        ], ['Think about where each part is and what it touches.', 'Leaves catch sunlight.']),
        orderT('order-levels', 'Arrange the levels of organisation from simplest to most complex.', ['Cell', 'Tissue', 'Organ', 'Organ system', 'Organism'], ['The smallest living unit comes first.', 'A group of organs working together is a system.'], 'Cells make tissues, tissues make organs, organs make systems, and systems make the organism.'),
        mcq('tissue', 'A tissue is a GROUP of similar cells.', [
          ['A group of similar cells performing a common function is a…', 'Tissue', ['Organ', 'Organelle', 'Organism'], 'It is one level above the cell.', 'Similar cells working together form a tissue.'],
          ['A leaf is an example of a(n)…', 'Organ', ['Tissue', 'Cell', 'Organelle'], 'It contains several kinds of tissues.', 'A leaf has epidermis, mesophyll and vascular tissues, so it is an organ.'],
          ['Which part of a plant mainly anchors it in the soil?', 'Root', ['Leaf', 'Flower', 'Bud'], 'It grows downward.', 'Roots hold the plant firmly and absorb water.'],
          ['Why do plants have many dead supporting tissues?', 'They are fixed in place and must support their weight', ['They move a lot', 'They need lots of energy', 'They have no cells'], 'Plants do not walk around.', 'Being stationary and tall, plants need strong (often dead) support tissues.'],
          ['Plant tissues are first divided into two groups:', 'Meristematic and permanent', ['Epithelial and connective', 'Muscle and nervous', 'Xylem and blood'], 'One group divides, the other has stopped dividing.', 'Meristematic tissues divide; permanent tissues have specialised and stopped dividing.'],
        ]),
        tapT('tap-organ', 'Tap every item that is an ORGAN (not a cell or tissue).', [
          ['Leaf', true], ['Root', true], ['Flower', true], ['Stem', true],
          ['Guard cell', false], ['Xylem', false], ['Chloroplast', false], ['Root hair cell', false],
        ], ['An organ is made of several tissues.', 'Xylem is a tissue; guard cells are cells.'], 'Leaf, root, stem and flower are organs; xylem is a tissue, guard and root-hair cells are cells, a chloroplast is an organelle.'),
      ],
    },
    {
      id: 'ts9.bs.ptis.meristem', title: 'Meristematic tissues: where plants grow', prereqs: ['ts9.bs.ptis.parts'],
      intro: [
        h('Growing points'),
        photo('🌾', 'If a farmer cuts grass or a paddy seedling near the top, it soon grows taller again. A growing tissue at the base of its leaves and nodes keeps adding cells.'),
        def('Meristematic tissue', 'A group of young cells that keep dividing to make new cells. Its cells are small, thin-walled, closely packed (no spaces), with dense cytoplasm, a big nucleus and few or no vacuoles.'),
        def('Apical meristem', 'Found at the tips of roots and shoots. It increases the LENGTH of the plant.'),
        def('Intercalary meristem', 'Found at the base of leaves or at nodes, e.g. in grasses. It increases the length of internodes and helps regrowth after grazing.'),
        def('Lateral meristem (cambium)', 'Found along the sides of stems and roots. It increases the THICKNESS (girth) of the plant.'),
        p('As new cells formed by meristems grow, they gradually lose the ability to divide and take on a fixed shape and job. This is called differentiation, and the result is permanent tissue.'),
        xp({
          title: 'What if? More rounds of division in a meristem', formula: 'cells = N × 2ⁿ',
          res: ['C', 'Number of cells', '', 'N * 2 ^ n', 0],
          vars: [['N', 'Starting cells', '', 1, 10, 1, 1], ['n', 'Rounds of division', '', 0, 15, 1, 5]],
          notes: [['n', 'Each extra round DOUBLES the cells — growth speeds up quickly.', 'One round fewer halves the number of cells.'], ['N', 'Twice the starting cells gives twice the final count.', 'Fewer starting cells give proportionally fewer cells.']],
          mistakes: [['Adding 2 cells per round', 'Every cell divides, so the number is multiplied by 2 each round, not increased by 2.']],
          real: 'A root tip can add thousands of cells a day because its meristem cells keep doubling.',
        }),
        keys('Apical → length; intercalary → internode length/regrowth; lateral → girth.', 'Meristem cells: small, thin walls, big nucleus, no intercellular spaces, actively dividing.'),
        remember('Cambium (lateral meristem) is what makes the yearly rings in a tree trunk.'),
        tip('Apex = tip (apical); inter = between (intercalary); lateral = side.'),
      ],
      examples: [
        ex('A gardener pinches off the tip of a tulasi shoot. What happens to its growth in height and why?', ['The shoot tip has the apical meristem.', 'Removing it stops growth in length at that tip.', 'Side buds then grow, making the plant bushy.'], 'Height growth stops at that tip; the plant becomes bushier.'),
        ex('Why can grass keep growing after cattle graze the tops?', ['Grasses have intercalary meristem at the base of leaves and nodes.', 'Grazing removes the tops, not the base.', 'The base meristem keeps adding cells.'], 'Its intercalary meristem at the base is not removed.'),
      ],
      practice: [
        mcq('types', 'Match the position of the meristem to the growth it causes.', [
          ['Which meristem increases the length of a root?', 'Apical meristem', ['Lateral meristem', 'Intercalary meristem', 'Cork'], 'It is at the tip.', 'Apical meristem at the tip adds length.'],
          ['Which meristem increases the girth of a tree trunk?', 'Lateral meristem (cambium)', ['Apical meristem', 'Intercalary meristem', 'Epidermis'], 'Girth is growth at the sides.', 'Cambium adds new layers, increasing thickness.'],
          ['Intercalary meristem is found…', 'At the base of leaves or internodes', ['At root tips only', 'Inside seeds only', 'In flowers only'], '"Inter" means in between.', 'It lies between mature tissues at nodes or leaf bases.'],
          ['Which is a feature of meristematic cells?', 'Dense cytoplasm and a large nucleus', ['Large central vacuole', 'Thick dead walls', 'Large air spaces'], 'They are busy dividing.', 'Dividing cells are packed with cytoplasm and have a big nucleus.'],
          ['The process by which new cells take a permanent shape and function is…', 'Differentiation', ['Pollination', 'Transpiration', 'Fertilisation'], 'It turns young cells into specialised cells.', 'Differentiation forms permanent tissues from meristem cells.'],
        ]),
        tapT('tap-meristem', 'Tap every feature of MERISTEMATIC cells.', [
          ['Thin cell walls', true], ['Actively dividing', true], ['No intercellular spaces', true], ['Prominent nucleus', true],
          ['Large central vacuole', false], ['Thick lignified walls', false], ['Dead at maturity', false],
        ], ['These cells are young and busy.', 'Thick walls and big vacuoles come later.'], 'Meristem cells are young, thin-walled, closely packed and dividing, with a big nucleus and few vacuoles.'),
        matchT('match', 'meristem to its location', [
          ['Apical meristem', 'Root and shoot tips'], ['Intercalary meristem', 'Base of leaves and nodes'], ['Lateral meristem', 'Sides of stems and roots'], ['Cork cambium', 'Under the bark'],
        ], ['Apex = tip.', 'Lateral = side.']),
        tp('divide', (r) => {
          const n = r.pick([3, 4, 5, 6, 8, 9, 10]);
          return numQ(`A single meristem cell divides ${n} times (every new cell also divides each time). How many cells are formed?`, 2 ** n, undefined,
            ['Each division doubles every cell.', `Work out 2 multiplied by itself ${n} times.`],
            [`Cells = 2^${n} = ${2 ** n}`], [{ when: String(2 * n), explain: 'Doubling repeatedly is multiplication, not addition: 2 × 2 × 2 …' }]);
        }, 2),
      ],
    },
    {
      id: 'ts9.bs.ptis.permanent', title: 'Permanent tissues: simple, complex and dermal', prereqs: ['ts9.bs.ptis.meristem'],
      intro: [
        h('Specialists that no longer divide'),
        photo('🥥', 'The husk of a coconut is hard and fibrous because of sclerenchyma — the same tissue that makes coir ropes so strong.'),
        h('Simple permanent tissues (one kind of cell)'),
        def('Parenchyma', 'Living, thin-walled, loosely packed cells with spaces between them. They store food. With chloroplasts it is called chlorenchyma; with large air spaces (in water plants) it is aerenchyma, which helps them float.'),
        def('Collenchyma', 'Living, elongated cells thickened at the corners. They give flexibility to leaf stalks and young stems so they bend without breaking.'),
        def('Sclerenchyma', 'Dead cells with thick walls of lignin. They make the plant hard and stiff — found in husks, seed coats, and fibres of jute and coir.'),
        h('Complex permanent tissues (several kinds of cell)'),
        def('Xylem', 'Carries water and minerals upward from roots. Made of tracheids, vessels, xylem parenchyma and xylem fibres. Mostly dead cells.'),
        def('Phloem', 'Carries food made in leaves to all parts. Made of sieve tubes, companion cells, phloem parenchyma and phloem fibres. Mostly living (phloem fibres are dead).'),
        h('Dermal (protective) tissue'),
        def('Epidermis', 'The outermost layer of cells on leaves, stems and roots. It is often covered by waxy cuticle that cuts water loss. Root epidermis forms root hairs.'),
        def('Stomata', 'Tiny pores in leaf epidermis, each surrounded by two bean-shaped guard cells that open and close it for gas exchange and transpiration.'),
        def('Cork', 'In older stems the epidermis is replaced by layers of dead cork cells with suberin, which are waterproof and protective.'),
        p('Labelled diagram of a stoma: guard cells · stomatal pore · epidermal cells · chloroplasts in guard cells.'),
        keys('Simple: parenchyma (store), collenchyma (flexible support), sclerenchyma (hard support).', 'Complex: xylem (water up), phloem (food everywhere).', 'Dermal: epidermis, stomata, cork.'),
        remember('Xylem = water; phloem = food. "Xylem goes up the stem like a lift; phloem flows both ways."'),
        tip('Collenchyma = Corners thickened; Sclerenchyma = Strong, Stiff, dead.'),
      ],
      examples: [
        ex('Water hyacinth floats on ponds in Telangana. Which tissue helps it float?', ['Its swollen leaf stalks have large air spaces.', 'Parenchyma with large air cavities is aerenchyma.', 'The trapped air makes it buoyant.'], 'Aerenchyma (parenchyma with air spaces)'),
        ex('When you put a white carnation stem in red ink, the veins turn red. Which tissue carried the ink?', ['Water moves up from the cut stem.', 'Water and dissolved substances move up in xylem.'], 'Xylem'),
      ],
      practice: [
        matchT('match', 'tissue to its role', [
          ['Parenchyma', 'Stores food'], ['Collenchyma', 'Flexible support'], ['Sclerenchyma', 'Hard, stiff support'], ['Xylem', 'Carries water upward'],
          ['Phloem', 'Carries food'], ['Epidermis', 'Protective outer layer'], ['Guard cells', 'Open and close stomata'], ['Aerenchyma', 'Helps water plants float'],
        ], ['Think of where each tissue is found.', 'Coir and jute are made of the hard one.']),
        mcq('permanent', 'Living or dead? Thin or thick walls?', [
          ['Which simple tissue is made of dead cells with lignified walls?', 'Sclerenchyma', ['Parenchyma', 'Collenchyma', 'Meristem'], 'Coconut husk.', 'Sclerenchyma cells are dead and thickened with lignin.'],
          ['Which tissue gives flexibility to leaf stalks?', 'Collenchyma', ['Sclerenchyma', 'Xylem', 'Cork'], 'Thickened only at the corners.', 'Collenchyma supports while still allowing bending.'],
          ['Sieve tubes and companion cells are parts of…', 'Phloem', ['Xylem', 'Epidermis', 'Cork'], 'They carry food.', 'Sieve tubes and companion cells form phloem.'],
          ['Tracheids and vessels are parts of…', 'Xylem', ['Phloem', 'Parenchyma', 'Collenchyma'], 'They are long dead tubes for water.', 'Tracheids and vessels conduct water in xylem.'],
          ['Which is the only DEAD element of phloem?', 'Phloem fibres', ['Sieve tubes', 'Companion cells', 'Phloem parenchyma'], 'Fibres are usually sclerenchyma.', 'Phloem fibres are dead; the rest of phloem is living.'],
          ['Parenchyma containing chloroplasts is called…', 'Chlorenchyma', ['Aerenchyma', 'Sclerenchyma', 'Collenchyma'], '"Chloro" = green.', 'Green parenchyma that photosynthesises is chlorenchyma.'],
        ], 2),
        mcq('dermal', 'Think about protection and gas exchange.', [
          ['The waxy layer on leaves that reduces water loss is the…', 'Cuticle', ['Cork', 'Xylem', 'Stoma'], 'It makes leaves shiny.', 'Cuticle is a waxy waterproof layer over the epidermis.'],
          ['Stomata are opened and closed by…', 'Guard cells', ['Root hairs', 'Companion cells', 'Cork cells'], 'They are bean-shaped.', 'Guard cells change shape to open or close the pore.'],
          ['Root hairs are outgrowths of the…', 'Root epidermis', ['Xylem', 'Cork', 'Cambium'], 'They increase surface area.', 'Root hairs grow from epidermal cells to absorb water.'],
          ['The bark of old trees contains dead cells with suberin called…', 'Cork', ['Parenchyma', 'Phloem', 'Meristem'], 'Bottle stoppers are made of it.', 'Cork cells are dead, suberised and protective.'],
          ['Desert plants have a thick cuticle mainly to…', 'Reduce water loss', ['Absorb more water', 'Make food faster', 'Attract insects'], 'Water is scarce in deserts.', 'A thick waxy cuticle cuts down evaporation.'],
        ]),
        tapT('tap-xylem', 'Tap every component of XYLEM.', [
          ['Tracheids', true], ['Vessels', true], ['Xylem parenchyma', true], ['Xylem fibres', true],
          ['Sieve tubes', false], ['Companion cells', false], ['Guard cells', false],
        ], ['Xylem has four elements.', 'Sieve tubes belong to the food-carrying tissue.'], 'Xylem = tracheids, vessels, xylem parenchyma and xylem fibres.', 5, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Animal Tissues
// =====================================================================================
const ch3: USpec = {
  id: 'ts9.bs.ch3', subject: 'biology', title: 'Animal Tissues', source: src(3),
  objectives: [
    {
      id: 'ts9.bs.atis.epithelial', title: 'Epithelial tissue: the body’s covering', prereqs: [],
      intro: [
        h('Covering and lining'),
        photo('👄', 'Gently scrape the inside of your cheek with a clean ice-cream stick and stain it — you will see flat, tile-like cells. That is squamous epithelium.'),
        p('Animals move about, find food and escape enemies, so their tissues are specialised for movement, coordination and protection. Animal tissues are of four kinds: epithelial, connective, muscular and nervous.'),
        def('Epithelial tissue', 'A covering or lining tissue. Its cells are tightly packed in a continuous sheet with almost no space between them and rest on a thin basement membrane.'),
        def('Squamous epithelium', 'Thin, flat cells like floor tiles. Lines the mouth, food pipe, blood vessels and lung air sacs (allows exchange). In skin it is stacked in layers (stratified) for protection.'),
        def('Cuboidal epithelium', 'Cube-shaped cells. Lines kidney tubules and ducts of glands; gives mechanical support and helps absorption and secretion.'),
        def('Columnar epithelium', 'Tall, pillar-like cells. Lines the stomach and intestine where absorption and secretion happen.'),
        def('Ciliated epithelium', 'Columnar cells with hair-like cilia that beat to move mucus along, as in the windpipe (trachea).'),
        def('Glandular epithelium', 'Epithelium that folds inward to form glands that secrete substances, like sweat and saliva.'),
        keys('Epithelium = tightly packed sheet; no blood vessels inside it.', 'Shape matches job: flat for exchange, tall for absorption, ciliated for moving mucus.'),
        remember('The skin’s outer layer is stratified squamous epithelium — many layers to prevent wear and tear.'),
        tip('Squamous = squashed flat; cuboidal = cube; columnar = column.'),
      ],
      examples: [
        ex('Why are the air sacs (alveoli) of the lungs lined by a single layer of thin flat cells?', ['Oxygen and carbon dioxide must pass across quickly.', 'Thin squamous cells give the shortest distance.'], 'Simple squamous epithelium allows quick gas exchange.'),
        ex('How does the windpipe keep dust out of the lungs?', ['Mucus traps dust.', 'Ciliated epithelium beats the cilia.', 'Mucus with dust is pushed up to the throat and swallowed or coughed out.'], 'Ciliated epithelium sweeps dust-laden mucus upward.'),
      ],
      practice: [
        matchT('match', 'epithelium to where it is found', [
          ['Squamous', 'Lining of mouth and blood vessels'], ['Stratified squamous', 'Outer layer of skin'], ['Cuboidal', 'Kidney tubules'], ['Columnar', 'Lining of intestine'],
          ['Ciliated', 'Lining of windpipe'], ['Glandular', 'Sweat glands'],
        ], ['Shape follows job.', 'Hair-like cilia move mucus.']),
        mcq('epi', 'Look at the cell shape and the job.', [
          ['Which tissue has tightly packed cells forming a continuous sheet?', 'Epithelial tissue', ['Connective tissue', 'Nervous tissue', 'Blood'], 'It covers surfaces.', 'Epithelium forms a tight covering sheet.'],
          ['The intestine lining, which absorbs digested food, is made of…', 'Columnar epithelium', ['Squamous epithelium', 'Cartilage', 'Adipose tissue'], 'Tall cells give more room for absorption.', 'Columnar cells line the intestine and absorb food.'],
          ['Hair-like structures on the cells of the windpipe are…', 'Cilia', ['Villi', 'Root hairs', 'Fibres'], 'They beat in waves.', 'Cilia beat to move mucus out of the airways.'],
          ['Epithelial cells rest on a thin…', 'Basement membrane', ['Bone plate', 'Cell wall', 'Cuticle'], 'It separates epithelium from tissue below.', 'Epithelium sits on a non-living basement membrane.'],
          ['Which type of animal tissue is NOT one of the four basic types?', 'Meristematic tissue', ['Epithelial tissue', 'Muscular tissue', 'Nervous tissue'], 'One of these belongs to plants.', 'Meristematic tissue is a plant tissue.'],
        ]),
        tapT('tap-epi', 'Tap every place lined or covered by EPITHELIAL tissue.', [
          ['Outer skin', true], ['Inner lining of the mouth', true], ['Lining of the windpipe', true], ['Kidney tubules', true], ['Lining of the stomach', true],
          ['Inside of a bone', false], ['Biceps muscle', false], ['Brain neurons', false],
        ], ['Epithelium covers outer surfaces and lines tubes and cavities.', 'Bone, muscle and neurons are other tissue types.'], 'Skin, mouth, windpipe, kidney tubules and stomach are covered or lined by epithelium.'),
        mcq('why', 'Match the structure to its purpose.', [
          ['Why is skin made of MANY layers of squamous cells?', 'To protect against wear and tear and germs', ['To absorb food', 'To carry messages', 'To pump blood'], 'Skin rubs against things all day.', 'Stratified epithelium protects underlying tissues.'],
          ['Why is blood-vessel lining made of thin flat cells?', 'For smooth flow and easy exchange', ['To store fat', 'To contract', 'To make bones'], 'Thin = short distance.', 'Squamous lining is smooth and thin.'],
          ['Why do gland cells fold inward?', 'To form glands that secrete substances', ['To move the body', 'To store minerals', 'To sense light'], 'Think of sweat glands.', 'Glandular epithelium forms secretory pockets.'],
          ['Smoking damages cilia in the windpipe. What will happen?', 'Mucus and dust collect, causing coughs and infections', ['Breathing becomes faster and cleaner', 'Food is digested faster', 'Skin heals faster'], 'What job do cilia do?', 'Without beating cilia, dirty mucus is not cleared.'],
          ['Kidney tubules are lined by cube-shaped cells called…', 'Cuboidal epithelium', ['Ciliated epithelium', 'Columnar epithelium', 'Squamous epithelium'], 'Cube-shaped.', 'Cuboidal epithelium lines kidney tubules.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.atis.connective', title: 'Connective tissue: blood, bone, cartilage and more', prereqs: ['ts9.bs.atis.epithelial'],
      intro: [
        h('Tissues that connect and support'),
        photo('🦷', 'Your teeth and bones are hard because their matrix is filled with calcium and phosphorus salts.'),
        def('Connective tissue', 'Tissue whose cells are loosely spaced in a matrix (ground substance). The matrix may be fluid, jelly-like, dense or rigid. It binds, supports and connects other tissues.'),
        def('Blood', 'A fluid connective tissue. Its fluid matrix, plasma, carries red blood cells (carry oxygen), white blood cells (fight germs) and platelets (help clotting), plus food, hormones and wastes.'),
        def('Bone', 'Hard, strong connective tissue with a matrix of calcium and phosphorus compounds. It forms the skeleton, supports the body and protects organs.'),
        def('Cartilage', 'Flexible connective tissue with a firm but bendable matrix. Found in the ear pinna, nose tip, windpipe rings and at the ends of bones.'),
        def('Ligament', 'Elastic connective tissue that joins bone to bone at joints.'),
        def('Tendon', 'Tough, less elastic fibrous tissue that joins muscle to bone.'),
        def('Areolar and adipose tissue', 'Areolar tissue fills spaces between organs and helps repair; adipose tissue stores fat, insulates the body and acts as a shock absorber.'),
        keys('Connective tissue = cells + matrix.', 'Blood (fluid), bone (rigid), cartilage (flexible), ligament (bone–bone), tendon (muscle–bone), adipose (fat store).'),
        remember('Ligament = bone to bone; Tendon = muscle to bone ("T for Tug": muscles tug bones through tendons).'),
        tip('If you can bend it (ear, nose tip) it is cartilage; if it cannot bend, it is bone.'),
      ],
      examples: [
        ex('A cricketer tears the band joining his calf muscle to the heel bone. Which tissue is injured?', ['It joins a muscle to a bone.', 'Muscle-to-bone connectors are tendons.'], 'A tendon (the Achilles tendon)'),
        ex('Why is blood called a connective tissue even though it is a liquid?', ['Like other connective tissues, it has cells in a matrix.', 'Its matrix, plasma, is fluid.', 'It connects all parts of the body by transporting materials.'], 'It has cells in a (fluid) matrix and links body parts.'),
      ],
      practice: [
        matchT('match', 'connective tissue to its role', [
          ['Blood', 'Transports materials'], ['Bone', 'Forms the rigid skeleton'], ['Cartilage', 'Flexible support in ear and nose'], ['Ligament', 'Joins bone to bone'],
          ['Tendon', 'Joins muscle to bone'], ['Adipose tissue', 'Stores fat and insulates'], ['Areolar tissue', 'Fills spaces between organs'],
        ], ['Ligament and tendon are easy to swap — be careful.', 'Fat storage is adipose.']),
        mcq('blood', 'Blood = plasma + cells.', [
          ['Which blood cells carry oxygen?', 'Red blood cells', ['White blood cells', 'Platelets', 'Plasma'], 'They contain haemoglobin.', 'RBCs carry oxygen bound to haemoglobin.'],
          ['Which blood component helps clotting?', 'Platelets', ['Red blood cells', 'Plasma proteins only', 'White blood cells'], 'They plug a wound.', 'Platelets help form a clot.'],
          ['The fluid matrix of blood is called…', 'Plasma', ['Lymph', 'Serum of bone', 'Cytoplasm'], 'It is straw-yellow.', 'Plasma is the liquid part of blood.'],
          ['Which cells defend the body against germs?', 'White blood cells', ['Red blood cells', 'Platelets', 'Bone cells'], 'They are the body’s soldiers.', 'WBCs fight infection.'],
          ['Bone matrix is hard because it contains…', 'Calcium and phosphorus compounds', ['Fat', 'Water only', 'Cellulose'], 'Milk is good for bones because of this.', 'Calcium phosphate makes bone hard.'],
        ]),
        mcq('joints', 'Ask what is joined to what.', [
          ['A sprained ankle usually damages…', 'Ligaments', ['Tendons', 'Cartilage only', 'Nerves'], 'Sprains overstretch bone-to-bone bands.', 'Ligaments joining ankle bones are stretched or torn.'],
          ['The flexible part of your outer ear is made of…', 'Cartilage', ['Bone', 'Muscle', 'Ligament'], 'You can fold it.', 'The ear pinna is supported by cartilage.'],
          ['Which tissue lets your fingers move when your forearm muscles contract?', 'Tendons', ['Ligaments', 'Adipose tissue', 'Blood'], 'Muscle pulls bone through it.', 'Tendons transmit muscle pull to bones.'],
          ['Whales and seals keep warm in cold seas because of thick…', 'Adipose tissue (blubber)', ['Bone', 'Cartilage', 'Tendon'], 'It is a fat layer.', 'Fat insulates and stores energy.'],
          ['Cartilage at the ends of bones in joints…', 'Smooths movement and absorbs shock', ['Produces blood', 'Joins muscle to bone', 'Carries messages'], 'It is smooth and slightly springy.', 'Cartilage reduces friction and cushions joints.'],
        ], 2),
        tapT('tap-conn', 'Tap every CONNECTIVE tissue.', [
          ['Blood', true], ['Bone', true], ['Cartilage', true], ['Tendon', true], ['Ligament', true], ['Adipose tissue', true],
          ['Skin epidermis', false], ['Neuron', false], ['Heart muscle', false],
        ], ['Connective tissues have cells in a matrix.', 'Epidermis, neurons and muscle belong to other groups.'], 'Blood, bone, cartilage, tendon, ligament and adipose tissue are connective tissues.'),
      ],
    },
    {
      id: 'ts9.bs.atis.muscle-nerve', title: 'Muscle tissue and nervous tissue', prereqs: ['ts9.bs.atis.connective'],
      intro: [
        h('Movers and messengers'),
        photo('💪', 'When you lift your school bag, the biceps muscle shortens. Before it can, a message travels from your brain along nerve cells to that muscle.'),
        def('Muscle tissue', 'Tissue of long cells called muscle fibres containing contractile proteins. The fibres contract and relax to cause movement.'),
        def('Striated (skeletal) muscle', 'Voluntary muscle attached to bones. Long cylindrical unbranched fibres with many nuclei and light and dark bands (stripes). Tires quickly.'),
        def('Smooth (unstriated) muscle', 'Involuntary muscle in the walls of the stomach, intestine, blood vessels and iris. Spindle-shaped cells, one nucleus each, no stripes.'),
        def('Cardiac muscle', 'Involuntary muscle found only in the heart. Cylindrical, branched, striated cells with one nucleus; contracts rhythmically all life without tiring.'),
        def('Nervous tissue', 'Tissue of brain, spinal cord and nerves made of neurons. It receives stimuli and carries messages (nerve impulses) very fast.'),
        def('Neuron', 'A nerve cell. It has a cell body (cyton) with a nucleus, short branched dendrites that receive messages, and one long axon that carries messages away to nerve endings.'),
        p('Labelled parts of a neuron: dendrites · cell body (cyton) · nucleus · axon · nerve endings.'),
        stepsB('Dendrites receive a message.', 'The cell body processes it.', 'The impulse travels along the axon.', 'Nerve endings pass it to the next neuron, a muscle or a gland.'),
        keys('Striated = voluntary, multi-nucleate. Smooth = involuntary, spindle. Cardiac = involuntary, branched, never tires.', 'Neuron: dendrite → cell body → axon → nerve ending.'),
        remember('A single neuron can be over a metre long — from your spinal cord to your toes.'),
        tip('S-S-V: Striated = Skeletal = Voluntary.'),
      ],
      examples: [
        ex('You cannot stop your food from moving along the intestine by "deciding" to. Which muscle is at work?', ['Movement happens without our will, so it is involuntary.', 'The intestine wall has spindle-shaped unstriated cells.'], 'Smooth (unstriated, involuntary) muscle'),
        ex('A touch on your fingertip is felt in the brain. Which part of the neuron first receives it?', ['Messages enter a neuron at the dendrites (or sensory endings).', 'They then pass to the cell body and along the axon.'], 'Dendrites'),
      ],
      practice: [
        matchT('match', 'muscle type to its feature', [
          ['Striated muscle', 'Voluntary, attached to bones'], ['Smooth muscle', 'Spindle-shaped, in the stomach wall'], ['Cardiac muscle', 'Branched, found only in the heart'],
          ['Dendrite', 'Receives the message'], ['Axon', 'Carries the impulse away'], ['Cell body', 'Contains the nucleus'],
        ], ['Branched cells that never tire = heart.', 'Messages go IN through dendrites.']),
        mcq('muscle', 'Voluntary or involuntary? Striped or not?', [
          ['Which muscle is voluntary?', 'Skeletal (striated) muscle', ['Cardiac muscle', 'Smooth muscle', 'Iris muscle'], 'You control it by will.', 'Skeletal muscles move bones when we decide.'],
          ['Which muscle never tires and works throughout life?', 'Cardiac muscle', ['Skeletal muscle', 'Biceps', 'Tongue muscle'], 'It beats about 72 times a minute.', 'Cardiac muscle contracts rhythmically all life.'],
          ['Spindle-shaped muscle cells with one nucleus and no stripes are…', 'Smooth muscle', ['Striated muscle', 'Cardiac muscle', 'Tendon'], 'Found in organ walls.', 'Smooth muscle cells are spindle-shaped and unstriated.'],
          ['Which muscle has cells with MANY nuclei?', 'Skeletal (striated) muscle', ['Smooth muscle', 'Cardiac muscle', 'None'], 'Long fibres formed by fusion of cells.', 'Skeletal muscle fibres are multinucleate.'],
          ['The muscles of the iris that change pupil size are…', 'Smooth (involuntary) muscle', ['Skeletal muscle', 'Cardiac muscle', 'Cartilage'], 'Can you change your pupil size by deciding to?', 'Iris muscles are involuntary smooth muscle.'],
        ]),
        orderT('order-neuron', 'Put the path of a nerve impulse through ONE neuron in order.', ['Dendrites', 'Cell body (cyton)', 'Axon', 'Nerve endings'], ['Messages enter through the branched short fibres.', 'They leave through the long fibre.'], 'An impulse enters at dendrites, passes the cell body, travels down the axon and leaves at the nerve endings.'),
        tapT('tap-invol', 'Tap every place with INVOLUNTARY muscle.', [
          ['Heart', true], ['Stomach wall', true], ['Intestine wall', true], ['Blood vessel walls', true], ['Iris of the eye', true],
          ['Biceps of the arm', false], ['Thigh muscles', false], ['Muscles of the fingers', false],
        ], ['Can you control it by thinking?', 'Arm, thigh and finger muscles move when you decide.'], 'Heart (cardiac) and organ walls (smooth) are involuntary; limb muscles are voluntary.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Transportation of Materials through the Plasma Membrane
// =====================================================================================
const ch4: USpec = {
  id: 'ts9.bs.ch4', subject: 'biology', title: 'Transportation of Materials through Plasma Membrane', source: src(4),
  objectives: [
    {
      id: 'ts9.bs.memb.diffusion', title: 'Diffusion: spreading from high to low concentration', prereqs: [],
      intro: [
        h('Why you smell the biryani from the street'),
        photo('🪔', 'Light an agarbatti in one corner of a room. Within minutes the fragrance reaches every corner, even with no fan running.'),
        p('Particles of gases and liquids are always moving at random. Where there are many particles, more of them move outwards than move in. So the substance spreads until it is evenly mixed. This net movement is diffusion.'),
        def('Diffusion', 'The net movement of particles from a region of HIGHER concentration to a region of LOWER concentration, until they are evenly spread. It needs no energy from the cell.'),
        def('Concentration gradient', 'The difference in concentration between two regions. Diffusion goes "down" the gradient.'),
        p('Cells use diffusion all the time. Oxygen is more concentrated in the blood than in a working cell, so it diffuses in; carbon dioxide is more concentrated inside, so it diffuses out. In leaves, carbon dioxide diffuses in through stomata.'),
        h('What makes diffusion faster?'),
        p('A steeper concentration gradient, a larger surface area, a thinner barrier (shorter distance) and a higher temperature all speed up diffusion.'),
        xp({
          title: 'What if? Change the gradient, area and distance', formula: 'rate ∝ A × ΔC ÷ d',
          res: ['R', 'Relative rate of diffusion', '', 'A * D / d', 1],
          vars: [['A', 'Surface area', 'units', 1, 20, 1, 5], ['D', 'Concentration difference', 'units', 0, 100, 5, 40], ['d', 'Thickness of barrier', 'units', 1, 10, 1, 2]],
          notes: [['A', 'More surface means more particles can cross at once.', 'Less surface means fewer routes for particles.'], ['D', 'A steeper gradient drives faster net movement.', 'When the concentrations become equal, net diffusion stops.'], ['d', 'A thicker barrier slows diffusion.', 'A thinner barrier lets particles across quickly.']],
          mistakes: [['Thinking particles stop moving when evenly spread', 'They keep moving; there is just no NET movement in any direction.'], ['Thinking diffusion needs energy from the cell', 'Diffusion is passive; it is powered by the random motion of particles.']],
          real: 'Lung air sacs are millions of tiny, thin-walled balloons — huge area, tiny distance — so oxygen diffuses into blood very fast.',
        }),
        keys('Diffusion: high → low concentration, no energy needed.', 'Faster with steeper gradient, more area, thinner barrier, higher temperature.', 'Gas exchange in lungs and leaves happens by diffusion.'),
        remember('Diffusion happens in gases, liquids and even (very slowly) in solids.'),
        tip('Think of a crowded bus emptying at a stop: people move from crowded to less crowded places on their own.'),
      ],
      examples: [
        ex('A drop of ink in still water spreads faster in warm water than in cold. Why?', ['Particles move faster at higher temperature.', 'Faster particles spread out more quickly.'], 'Higher temperature speeds up diffusion.'),
        ex('Oxygen concentration in the lung air sacs is 100 units and in the blood arriving there is 40 units. In which direction does oxygen diffuse?', ['Diffusion is from high to low concentration.', '100 (air sacs) > 40 (blood).'], 'From the air sacs into the blood.'),
      ],
      practice: [
        mcq('diff', 'Always look for where the concentration is higher.', [
          ['Diffusion is the movement of particles from…', 'Higher to lower concentration', ['Lower to higher concentration', 'Only through a membrane', 'Only in solids'], 'Particles spread out.', 'Net movement is down the concentration gradient.'],
          ['Does diffusion need energy (ATP) from the cell?', 'No, it is passive', ['Yes, always', 'Only in plants', 'Only at night'], 'It is driven by random motion of particles.', 'Diffusion is a passive process.'],
          ['Carbon dioxide enters a leaf through stomata by…', 'Diffusion', ['Active transport', 'Osmosis', 'Endocytosis'], 'It is a gas moving to lower concentration.', 'CO₂ is used up inside the leaf, so it diffuses in.'],
          ['Which change makes diffusion SLOWER?', 'A thicker barrier', ['A larger surface area', 'A higher temperature', 'A steeper gradient'], 'Longer distance to travel.', 'Diffusion slows as the distance increases.'],
          ['When does net diffusion stop?', 'When concentrations become equal', ['When particles stop moving', 'After one minute', 'When the light goes off'], 'Particles still move.', 'At equal concentration the movement balances, so there is no net flow.'],
        ]),
        tp('direction', (r) => {
          const a = r.int(20, 95), b = r.int(5, 90);
          const hi = a === b ? a + 5 : a;
          const sub = r.pick(['oxygen', 'carbon dioxide', 'glucose', 'salt']);
          const [p1, p2] = r.pick([['inside the cell', 'outside the cell'], ['in the blood', 'in the tissue fluid'], ['in the leaf air spaces', 'in the outside air']]);
          const fromFirst = hi > b;
          const right = fromFirst ? `From ${p1} to ${p2}` : `From ${p2} to ${p1}`;
          const wrong = fromFirst ? `From ${p2} to ${p1}` : `From ${p1} to ${p2}`;
          return {
            type: 'mcq', prompt: `The concentration of ${sub} is ${hi} units ${p1} and ${b} units ${p2}. Which way will ${sub} diffuse?`,
            ...choose(r, right, [wrong, 'It will not move at all', 'Equally both ways, with no net movement']),
            hints: ['Diffusion goes from higher to lower concentration.', `Compare ${hi} and ${b}.`],
            mistakes: [{ when: 'wrong', explain: 'Diffusion always goes down the gradient — from the larger number to the smaller.' }],
            solution: [`${Math.max(hi, b)} is higher than ${Math.min(hi, b)}.`, `So ${sub} moves ${right.toLowerCase()}.`],
          };
        }),
        tapT('tap-faster', 'Tap every change that would make diffusion FASTER.', [
          ['Raising the temperature', true], ['Increasing the surface area', true], ['Making the barrier thinner', true], ['Increasing the concentration difference', true],
          ['Making the barrier thicker', false], ['Cooling the liquid', false], ['Equal concentrations on both sides', false],
        ], ['Think about how far and how fast particles must travel.', 'No gradient means no net movement.'], 'Heat, area, thin barriers and steep gradients speed diffusion.'),
        tapT('tap-examples', 'Tap every example of DIFFUSION.', [
          ['Smell of jasmine spreading in a room', true], ['Oxygen entering blood in lungs', true], ['Sugar spreading in unstirred tea', true], ['CO₂ entering a leaf', true],
          ['A raisin swelling in water', false], ['Water rising through a straw when you suck', false],
        ], ['A raisin swelling is the special case of water moving through a membrane.', 'Sucking through a straw uses pressure, not diffusion.'], 'Spreading of scent, gases and dissolved sugar are diffusion; a raisin swelling is osmosis.', 5, 2),
      ],
    },
    {
      id: 'ts9.bs.memb.osmosis', title: 'Osmosis, turgor and plasmolysis', prereqs: ['ts9.bs.memb.diffusion'],
      intro: [
        h('Why salted cucumber slices become watery'),
        photo('🥒', 'Sprinkle salt on cucumber slices for a pickle. In a few minutes water collects on the plate — it has come out of the cucumber cells.'),
        def('Osmosis', 'The movement of WATER molecules through a selectively permeable membrane from a region of higher water concentration (dilute solution) to a region of lower water concentration (concentrated solution).'),
        def('Hypotonic solution', 'A solution more dilute than the cell contents. Water enters the cell; the cell swells.'),
        def('Hypertonic solution', 'A solution more concentrated than the cell contents. Water leaves the cell; the cell shrinks.'),
        def('Isotonic solution', 'A solution with the same concentration as the cell. No net movement of water.'),
        def('Turgidity', 'The firm state of a plant cell full of water, its contents pressing against the cell wall.'),
        def('Plasmolysis', 'In a hypertonic solution, a plant cell loses water and its cytoplasm and membrane shrink away from the cell wall.'),
        h('The potato osmometer experiment'),
        stepsB('Peel a large potato and cut it flat at the bottom.', 'Scoop a hollow cup in the top.', 'Pour strong sugar solution into the cup and mark the level with a pin.', 'Stand the potato in a dish of plain water.', 'After a few hours, the level in the cup rises — water has entered by osmosis through the potato cells.'),
        keys('Osmosis is diffusion of WATER across a selectively permeable membrane.', 'Water moves towards the more concentrated solution.', 'Hypotonic → swell; hypertonic → shrink; isotonic → no change.', 'Plant cells become turgid in water and plasmolysed in strong salt solution.'),
        remember('Plasmolysis is reversible at first: put the plasmolysed cell back into water and it recovers (deplasmolysis).'),
        tip('Water "follows the salt (or sugar)": it moves towards where more is dissolved.'),
      ],
      examples: [
        ex('Dry raisins are kept in water overnight. What happens and why?', ['Raisin cells have very concentrated contents.', 'The water outside is dilute (hypotonic).', 'Water enters the raisin by osmosis.'], 'The raisins swell up.'),
        ex('A potato strip weighs 20 g. After an hour in strong salt solution it weighs 17 g. Find the percentage change in mass.', ['Change = 17 − 20 = −3 g', 'Percentage change = (−3 ÷ 20) × 100', '= −15%'], '−15% (it lost water by osmosis)'),
      ],
      practice: [
        mcq('tonic', 'Compare the concentration outside with the cell contents.', [
          ['A plant cell placed in a hypertonic solution will…', 'Lose water and become plasmolysed', ['Gain water and become turgid', 'Burst', 'Not change'], 'Hypertonic = more concentrated outside.', 'Water leaves by osmosis and the cytoplasm shrinks from the wall.'],
          ['Red blood cells placed in pure water will…', 'Swell and may burst', ['Shrink', 'Stay the same', 'Become plasmolysed'], 'Animal cells have no wall.', 'Water enters by osmosis and the membrane can burst.'],
          ['In an isotonic solution a cell…', 'Shows no net gain or loss of water', ['Swells', 'Shrinks', 'Bursts'], 'Iso = equal.', 'Equal concentrations mean no net water movement.'],
          ['Why do vegetable vendors sprinkle water on wilted leafy greens?', 'Cells take in water by osmosis and become turgid again', ['Water kills germs', 'Water adds weight only', 'Water makes them sweet'], 'Firm cells = fresh-looking leaves.', 'Water enters the cells, restoring turgidity.'],
          ['Osmosis is the movement of…', 'Water across a selectively permeable membrane', ['Salt across any surface', 'Gases into blood', 'Food in phloem'], 'It is a special kind of diffusion.', 'Osmosis is specifically about water and a semi-permeable membrane.'],
          ['Too much fertiliser near the roots makes plants wilt because…', 'The soil water becomes hypertonic and roots lose water', ['Roots absorb too much water', 'Leaves get burnt by sunlight', 'Fertiliser blocks stomata'], 'Fertiliser is salts dissolved in soil water.', 'A concentrated soil solution pulls water out of root cells.'],
        ]),
        tp('mass-change', (r) => {
          const m0 = r.pick([10, 20, 25, 40, 50]);
          const pct = r.pick([-20, -15, -10, -5, 5, 8, 10, 12, 20]);
          const m1 = rd(m0 * (1 + pct / 100), 2);
          const sol = pct < 0 ? 'strong salt solution' : 'distilled water';
          return numQ(`A potato strip of mass ${m0} g is kept in ${sol} for an hour. Its new mass is ${m1} g. Find the percentage change in mass (use a minus sign for a loss).`, pct, undefined,
            ['Change = new mass − old mass.', 'Percentage change = change ÷ old mass × 100.'],
            [`Change = ${m1} − ${m0} = ${rd(m1 - m0, 2)} g`, `% change = ${rd(m1 - m0, 2)} ÷ ${m0} × 100 = ${pct}%`, pct < 0 ? 'Water left the cells: the solution was hypertonic.' : 'Water entered the cells: the water was hypotonic.'],
            [{ when: String(-pct), explain: 'Check the sign: a gain is positive and a loss is negative.' }]);
        }, 2),
        orderT('order-osmometer', 'Put the steps of the potato osmometer experiment in order.', [
          'Peel the potato and cut its base flat', 'Scoop out a hollow cup in the top', 'Fill the cup with sugar solution and mark the level', 'Stand the potato in a dish of water', 'Observe the level rise after some hours',
        ], ['You need a cup before you can fill it.', 'Observation comes last.'], 'Prepare the potato, make the cup, fill and mark, place in water, then observe.'),
        matchT('match', 'term to its meaning', [
          ['Hypotonic', 'More dilute than the cell'], ['Hypertonic', 'More concentrated than the cell'], ['Isotonic', 'Same concentration as the cell'],
          ['Turgid', 'Firm, full of water'], ['Plasmolysis', 'Cytoplasm shrinks away from the wall'], ['Deplasmolysis', 'Recovery after being put back in water'],
        ], ['Hyper = more (more solute).', 'Hypo = less (less solute).']),
      ],
    },
    {
      id: 'ts9.bs.memb.transport', title: 'The plasma membrane and ways of transport', prereqs: ['ts9.bs.memb.osmosis'],
      intro: [
        h('A smart gatekeeper'),
        photo('🚪', 'A school gate lets students in freely, checks visitors, and sometimes a guard has to push a heavy cart in. The cell membrane works in similar ways.'),
        p('The plasma membrane is made of a double layer of lipid molecules with proteins floating in it, like icebergs in the sea. This model is called the fluid mosaic model. Small uncharged molecules slip through; others need protein channels or carriers.'),
        h('Functions of the plasma membrane'),
        keys('Gives shape to animal cells and encloses the cell contents.', 'Controls what enters and leaves (selective permeability).', 'Recognises signals and other cells.', 'Lets the cell engulf food or release secretions.'),
        h('Ways substances cross'),
        def('Passive transport', 'Movement DOWN a concentration gradient without using cell energy: simple diffusion, osmosis, and facilitated diffusion (through protein channels).'),
        def('Active transport', 'Movement AGAINST a concentration gradient (low to high) using energy (ATP) and carrier proteins. Root cells take in mineral ions from dilute soil water this way.'),
        def('Endocytosis', 'The membrane folds inward to engulf a large particle or fluid in a bubble (vesicle). Amoeba eats this way (phagocytosis = "cell eating").'),
        def('Exocytosis', 'A vesicle joins the membrane and releases its contents outside, e.g. gland cells releasing enzymes.'),
        keys('Passive: no energy, high → low.', 'Active: needs ATP, low → high.', 'Endo = in (engulfing); exo = out (releasing).'),
        remember('Root hairs absorb minerals by active transport — that is why roots need oxygen for respiration. Waterlogged soil starves roots of oxygen.'),
        tip('Active = "against the crowd, so it costs energy".'),
      ],
      examples: [
        ex('Nitrate ions are 10 times more concentrated inside root hair cells than in soil water, yet roots keep absorbing them. How?', ['The ions move from low (soil) to high (root) concentration.', 'That is against the gradient.', 'Moving against the gradient needs energy and carriers.'], 'By active transport using ATP.'),
        ex('Amoeba engulfs a food particle into a food vacuole. Name the process.', ['The membrane folds around the particle.', 'A vesicle forms inside the cell.', 'Taking material IN this way is endocytosis (phagocytosis).'], 'Endocytosis (phagocytosis)'),
      ],
      practice: [
        mcq('modes', 'Ask: is it with or against the gradient? Is it a large particle?', [
          ['Which process needs energy (ATP)?', 'Active transport', ['Diffusion', 'Osmosis', 'Facilitated diffusion'], 'It moves things uphill.', 'Only active transport uses ATP to go against the gradient.'],
          ['Amoeba taking in a food particle is an example of…', 'Endocytosis', ['Exocytosis', 'Osmosis', 'Active transport of ions'], 'The membrane wraps around the food.', 'Engulfing by the membrane is endocytosis (phagocytosis).'],
          ['Release of enzymes from a gland cell by vesicles is…', 'Exocytosis', ['Endocytosis', 'Diffusion', 'Plasmolysis'], 'Exo = out.', 'Vesicles fuse with the membrane and release contents outside.'],
          ['Movement of glucose down its gradient through protein channels is…', 'Facilitated diffusion', ['Active transport', 'Exocytosis', 'Osmosis'], 'Down the gradient, but with help.', 'Protein channels help, but no ATP is used.'],
          ['The structure of the plasma membrane is described by the…', 'Fluid mosaic model', ['Lock and key model', 'Cell theory', 'Five-kingdom model'], 'Proteins float in a lipid sea.', 'Singer and Nicolson’s fluid mosaic model describes it.'],
        ]),
        matchT('match', 'process to its description', [
          ['Diffusion', 'High to low, no energy'], ['Osmosis', 'Water across a membrane'], ['Active transport', 'Low to high, uses ATP'],
          ['Endocytosis', 'Membrane engulfs material'], ['Exocytosis', 'Vesicle releases material outside'], ['Facilitated diffusion', 'Down the gradient through protein channels'],
        ], ['Two of these need the membrane to fold.', 'Only one needs ATP to go uphill.']),
        tapT('tap-functions', 'Tap every function of the PLASMA MEMBRANE.', [
          ['Controls entry and exit of substances', true], ['Encloses the cell contents', true], ['Engulfs food in Amoeba', true], ['Recognises signals from other cells', true],
          ['Makes food by photosynthesis', false], ['Stores starch grains', false], ['Makes ribosomes', false],
        ], ['Photosynthesis and starch storage are plastid jobs.', 'The nucleolus makes ribosomes.'], 'The membrane encloses, controls traffic, recognises signals and can engulf material.'),
        mcq('apply', 'Think about energy supply.', [
          ['If a root is given a poison that stops respiration, which uptake stops first?', 'Mineral ions by active transport', ['Water by osmosis', 'Oxygen by diffusion', 'Nothing stops'], 'Which process needs ATP?', 'Active transport depends on ATP from respiration.'],
          ['Why do crops suffer when fields stay waterlogged for many days?', 'Roots lack oxygen, so active uptake of minerals fails', ['Too much sunlight', 'Roots get too much air', 'Soil becomes too hot'], 'Roots need to respire.', 'No oxygen → no ATP → no active transport of minerals.'],
          ['A white blood cell swallowing a bacterium uses…', 'Phagocytosis (endocytosis)', ['Exocytosis', 'Osmosis', 'Plasmolysis'], 'Cell eating.', 'WBCs engulf germs by phagocytosis.'],
          ['Which substances cross the membrane most easily by simple diffusion?', 'Small molecules like oxygen and carbon dioxide', ['Large proteins', 'Whole bacteria', 'Starch grains'], 'Size matters.', 'Small uncharged molecules slip through the lipid layer.'],
          ['Seaweed cells hold iodine at concentrations far higher than seawater. They get it by…', 'Active transport', ['Simple diffusion', 'Osmosis', 'Exocytosis'], 'Low outside, high inside.', 'Accumulating against the gradient needs active transport.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Diversity in Living Organisms: Classification
// =====================================================================================
const ch5: USpec = {
  id: 'ts9.bs.ch5', subject: 'biology', title: 'Diversity in Living Organisms — Classification', source: src(5),
  objectives: [
    {
      id: 'ts9.bs.class.basis', title: 'Diversity, variation, classification and evolution', prereqs: [],
      intro: [
        h('Sorting the living world'),
        photo('🦋', 'Walk through Kawal or Amrabad forest and you may meet hundreds of kinds of butterflies, trees, birds and insects. No two individuals are exactly alike.'),
        p('About 1.8 million kinds of organisms have been named, and many more are still unknown. To study them, biologists group them by similarities and differences. This is classification.'),
        def('Diversity', 'The variety of different kinds of living organisms in an area or on Earth.'),
        def('Variation', 'Differences between individuals of the same kind, like the different heights and colours of mango trees or people.'),
        def('Classification', 'Arranging organisms into groups based on similarities and differences in their characters.'),
        def('Character', 'A feature of structure or function used for classifying, e.g. presence of a nucleus, backbone, or number of seed leaves.'),
        h('The hierarchy of groups'),
        stepsB('Kingdom (largest group)', 'Phylum (called Division for plants)', 'Class', 'Order', 'Family', 'Genus', 'Species (smallest group — organisms that can interbreed)'),
        h('Classification and evolution'),
        p('Charles Darwin (1859) explained that living forms change slowly over long periods, giving rise to new kinds. So organisms that share more characters probably share a more recent common ancestor. Modern classification tries to group organisms by these evolutionary relationships. Older, simpler forms are called primitive or lower; later, more complex forms are called advanced or higher.'),
        keys('Classification makes the study of diversity easy and shows relationships.', 'Hierarchy: Kingdom → Phylum → Class → Order → Family → Genus → Species.', 'Variation is the raw material of evolution.'),
        remember('Memory line: "King Philip Came Over For Good Soup" = Kingdom, Phylum, Class, Order, Family, Genus, Species.'),
        tip('The lower you go in the hierarchy, the MORE characters the members share.'),
      ],
      examples: [
        ex('A tiger and a lion belong to the same genus but a tiger and a dog only to the same order. Which pair is more closely related?', ['Genus is lower in the hierarchy than order.', 'Members of a genus share more characters.'], 'Tiger and lion'),
        ex('Two neem trees in Lakshmi’s village have different leaf sizes. Are they different species?', ['They can interbreed and have the same basic characters.', 'Small differences between individuals of one kind are variations.'], 'No — they show variation within one species (Azadirachta indica).'),
      ],
      practice: [
        orderT('order-hier', 'Arrange the classification groups from LARGEST to SMALLEST.', ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'], ['Kingdom is the broadest.', 'Use "King Philip Came Over For Good Soup".'], 'Kingdom → Phylum → Class → Order → Family → Genus → Species.', 2),
        mcq('basis', 'Lower ranks = more shared characters.', [
          ['The basic unit of classification is…', 'Species', ['Genus', 'Kingdom', 'Family'], 'Members can interbreed.', 'A species is the smallest natural group of interbreeding organisms.'],
          ['Differences among individuals of the same species are called…', 'Variations', ['Classifications', 'Kingdoms', 'Hierarchies'], 'Think of the differences between classmates.', 'Such differences are variations.'],
          ['In plants, "phylum" is replaced by…', 'Division', ['Order', 'Section', 'Tribe'], 'Botanists use a different word.', 'Plant groups at this rank are called divisions.'],
          ['Who explained that organisms gradually change over time (evolution)?', 'Charles Darwin', ['Carl Linnaeus', 'Robert Hooke', 'Gregor Mendel'], 'He wrote "The Origin of Species" (1859).', 'Darwin explained evolution by natural selection.'],
          ['Organisms in the same family share…', 'More characters than those only in the same order', ['Fewer characters than those in the same order', 'No characters', 'Exactly the same DNA'], 'Family is below order.', 'Each lower rank groups more similar organisms.'],
          ['Why do we classify organisms?', 'To study the huge diversity easily and see relationships', ['To make organisms change', 'To stop evolution', 'To give them prices'], 'Imagine studying 1.8 million species one by one.', 'Grouping makes study easier and shows how organisms are related.'],
        ]),
        tapT('tap-character', 'Tap every character that is USEFUL for classifying organisms.', [
          ['Presence of a backbone', true], ['Cell with or without nucleus', true], ['Number of seed leaves (cotyledons)', true], ['Body made of one cell or many', true],
          ['Its price in the market', false], ['Where it was bought', false], ['Its name in one language', false],
        ], ['A good character is a feature of the organism itself.', 'Prices and places change; body features do not.'], 'Body structure and cell features are classification characters; price and place are not.'),
        mcq('evol', 'Older forms are usually simpler.', [
          ['Organisms with simple body design that appeared early are called…', 'Primitive (lower) organisms', ['Advanced organisms', 'Higher organisms', 'Modern organisms'], 'They are the first to arise.', 'Early, simple forms are called primitive.'],
          ['Classification based on evolutionary relationships groups organisms by…', 'Common ancestry', ['Colour only', 'Size only', 'Usefulness to humans'], 'Who are their "ancestors"?', 'Organisms sharing a recent ancestor are grouped together.'],
          ['Which provides the raw material for evolution?', 'Variation', ['Classification', 'Naming', 'Extinction'], 'Natural selection acts on differences.', 'Without variation there would be nothing to select.'],
          ['Members of the same species can…', 'Interbreed and produce fertile offspring', ['Never mate', 'Look exactly identical', 'Belong to different kingdoms'], 'That is how a species is defined.', 'Interbreeding with fertile offspring defines a species.'],
          ['Which is the most diverse group of animals on Earth?', 'Insects (Arthropoda)', ['Mammals', 'Birds', 'Fishes'], 'Think of beetles, ants, butterflies.', 'Arthropods, mostly insects, have the most known species.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.class.kingdoms', title: 'Five kingdoms: Monera, Protista, Fungi and Plantae', prereqs: ['ts9.bs.class.basis'],
      intro: [
        h('Whittaker’s five kingdoms'),
        photo('🔬', 'Bread left in a damp box grows fuzzy mould in a few days. Under a microscope the mould is a mesh of threads — a fungus, neither a plant nor an animal.'),
        p('In 1969 R. H. Whittaker grouped organisms into five kingdoms using three main characters: cell type (prokaryotic or eukaryotic), body (unicellular or multicellular) and mode of nutrition (making food or taking it in).'),
        def('Monera', 'Unicellular prokaryotes with no true nucleus — bacteria and cyanobacteria (blue-green algae). Some make their own food, others take it.'),
        def('Protista', 'Unicellular eukaryotes such as Amoeba, Paramecium, Euglena and diatoms. Some move by cilia, flagella or pseudopodia.'),
        def('Fungi', 'Eukaryotes that cannot make food; most absorb food from dead and decaying matter (saprophytes). Cell walls of chitin. E.g. yeast, bread mould, mushrooms.'),
        def('Plantae', 'Multicellular eukaryotes with cellulose cell walls that make food by photosynthesis.'),
        def('Animalia', 'Multicellular eukaryotes with no cell walls that take in food (heterotrophs).'),
        h('Groups within Plantae'),
        p('Thallophyta (algae such as Spirogyra) — body not divided into root, stem and leaf. Bryophyta (mosses, Riccia) — the "amphibians of the plant kingdom", no true vascular tissue. Pteridophyta (ferns) — have vascular tissue but no seeds. Gymnosperms (pine, cycas) — naked seeds. Angiosperms (mango, paddy) — seeds enclosed in fruits; divided into monocots (one seed leaf, e.g. maize) and dicots (two seed leaves, e.g. bean).'),
        keys('Monera: prokaryotes. Protista: one-celled eukaryotes. Fungi: absorb food, chitin wall. Plantae: photosynthesis, cellulose. Animalia: no wall, ingest food.', 'Plants: thallophytes → bryophytes → pteridophytes → gymnosperms → angiosperms.'),
        remember('Only Monera are prokaryotic. All other four kingdoms are eukaryotic.'),
        tip('Gymno = naked (naked seeds); angio = vessel (seeds inside a fruit).'),
      ],
      examples: [
        ex('A one-celled organism has a nucleus and moves using a whip-like flagellum. Which kingdom?', ['It has a nucleus → eukaryotic, so not Monera.', 'It is unicellular → not Plantae or Animalia.'], 'Protista (e.g. Euglena)'),
        ex('A plant has roots, stem, leaves and vascular tissue but reproduces by spores and has no seeds. Which group?', ['Vascular tissue rules out algae and mosses.', 'No seeds rules out gymnosperms and angiosperms.'], 'Pteridophyta (a fern)'),
      ],
      practice: [
        matchT('match', 'organism to its kingdom', [
          ['Bacteria', 'Monera'], ['Amoeba', 'Protista'], ['Mushroom', 'Fungi'], ['Neem tree', 'Plantae'], ['Peacock', 'Animalia'],
        ], ['No nucleus → Monera.', 'One cell with a nucleus → Protista.'], 4),
        mcq('kingdoms', 'Use cell type, body organisation and nutrition.', [
          ['Who proposed the five-kingdom classification?', 'R. H. Whittaker', ['Carl Linnaeus', 'Charles Darwin', 'Aristotle'], 'It was proposed in 1969.', 'Whittaker proposed the five kingdoms in 1969.'],
          ['Which kingdom contains prokaryotes?', 'Monera', ['Protista', 'Fungi', 'Plantae'], 'No nuclear membrane.', 'Monera are the only prokaryotic kingdom.'],
          ['Most fungi get their food by…', 'Absorbing it from dead and decaying matter', ['Photosynthesis', 'Hunting other animals', 'Absorbing sunlight'], 'They have no chlorophyll.', 'Most fungi are saprophytes.'],
          ['The cell wall of fungi is made of…', 'Chitin', ['Cellulose', 'Lignin', 'Protein'], 'Same material as insect shells.', 'Fungal walls are made of chitin.'],
          ['Which kingdom has organisms with no cell wall that take in food?', 'Animalia', ['Plantae', 'Fungi', 'Monera'], 'You belong here.', 'Animals lack cell walls and are heterotrophs.'],
          ['Yeast, used to make idli batter rise, belongs to…', 'Fungi', ['Monera', 'Plantae', 'Animalia'], 'It is a one-celled organism that cannot photosynthesise and has a chitin wall.', 'Yeast is a unicellular fungus.'],
        ]),
        mcq('plants', 'Look for seeds, vascular tissue and body division.', [
          ['Plants whose body is a thallus (no root, stem, leaf) belong to…', 'Thallophyta', ['Bryophyta', 'Pteridophyta', 'Angiosperms'], 'Algae such as Spirogyra.', 'Thallophytes have an undivided body.'],
          ['Mosses are called the "amphibians of the plant kingdom" because…', 'They live on land but need water for reproduction', ['They can swim', 'They eat insects', 'They have gills'], 'Like frogs.', 'Bryophytes need water for fertilisation.'],
          ['Plants with naked seeds are…', 'Gymnosperms', ['Angiosperms', 'Pteridophytes', 'Bryophytes'], 'Gymno = naked.', 'Gymnosperm seeds are not enclosed in fruits.'],
          ['Maize and paddy have one seed leaf. They are…', 'Monocots', ['Dicots', 'Gymnosperms', 'Ferns'], 'Mono = one.', 'One cotyledon → monocotyledon.'],
          ['Ferns have vascular tissue but no…', 'Seeds', ['Leaves', 'Roots', 'Cells'], 'They reproduce by spores.', 'Pteridophytes reproduce by spores, not seeds.'],
          ['Flowering plants with seeds inside fruits are…', 'Angiosperms', ['Gymnosperms', 'Thallophytes', 'Bryophytes'], 'Mango, tomato, paddy.', 'Angiosperm seeds develop inside a fruit.'],
        ], 2),
        orderT('order-plants', 'Arrange the plant groups from SIMPLEST to MOST ADVANCED.', ['Thallophyta', 'Bryophyta', 'Pteridophyta', 'Gymnosperms', 'Angiosperms'], ['No body division comes first.', 'Seeds inside fruits are the most advanced.'], 'Algae → mosses → ferns → naked-seeded → flowering plants.', 2),
      ],
    },
    {
      id: 'ts9.bs.class.animals', title: 'Classification of animals', prereqs: ['ts9.bs.class.kingdoms'],
      intro: [
        h('From sponges to us'),
        photo('🐸', 'A frog starts life in water as a tadpole with gills and later breathes with lungs on land — a typical amphibian.'),
        p('Animals are grouped by body design: level of organisation, symmetry, body cavity, segmentation and the presence of a notochord or backbone.'),
        def('Non-chordates', 'Animals without a notochord (a rod supporting the back) at any stage.'),
        p('Porifera — sponges with pores, fixed to rocks. Coelenterata (Cnidaria) — Hydra, jellyfish; hollow body, tentacles. Platyhelminthes — flatworms such as tapeworm and liver fluke. Nematoda — roundworms such as Ascaris. Annelida — segmented worms such as earthworm and leech. Arthropoda — jointed legs and a hard outer skeleton: insects, spiders, crabs, centipedes. Mollusca — soft body, often a shell: snail, octopus. Echinodermata — spiny skin, marine: starfish, sea urchin.'),
        def('Chordates', 'Animals with a notochord at some stage. In vertebrates the notochord is replaced by a backbone.'),
        p('Vertebrate classes: Pisces (fish — gills, scales, fins), Amphibia (frog — moist skin, live in water and on land), Reptilia (lizard, snake — dry scaly skin, shelled eggs on land), Aves (birds — feathers, beak, hollow bones, warm-blooded), Mammalia (humans, cows, bats — hair, mammary glands, mostly give birth to young, warm-blooded).'),
        keys('Arthropoda = largest phylum (jointed legs).', 'Fish, amphibians and reptiles are cold-blooded; birds and mammals are warm-blooded.', 'Mammals feed young with milk from mammary glands.'),
        remember('Bat — mammal (hair, milk), not a bird. Whale — mammal, not a fish. Platypus — an egg-laying mammal.'),
        tip('To classify a vertebrate, ask in order: gills? moist skin? scales? feathers? hair?'),
      ],
      examples: [
        ex('An animal has a segmented body like rings, no legs and lives in moist soil. Which phylum?', ['A ring-like segmented body is the key feature.', 'Segmented worms belong to Annelida.'], 'Annelida (e.g. earthworm)'),
        ex('Why is a bat a mammal and not a bird, though it flies?', ['A bat has hair, not feathers.', 'It gives birth to young and feeds them milk.'], 'It has hair and mammary glands — mammal features.'),
      ],
      practice: [
        matchT('match', 'animal to its group', [
          ['Earthworm', 'Annelida'], ['Cockroach', 'Arthropoda'], ['Snail', 'Mollusca'], ['Starfish', 'Echinodermata'], ['Hydra', 'Coelenterata'],
          ['Sponge', 'Porifera'], ['Tapeworm', 'Platyhelminthes'], ['Ascaris', 'Nematoda'],
        ], ['Jointed legs → Arthropoda.', 'Spiny skin → Echinodermata.'], 4),
        matchT('match-vert', 'vertebrate to its class', [
          ['Rohu fish', 'Pisces'], ['Frog', 'Amphibia'], ['Garden lizard', 'Reptilia'], ['Peacock', 'Aves'], ['Bat', 'Mammalia'],
        ], ['Feathers → Aves.', 'Hair and milk → Mammalia.'], 4),
        mcq('animals', 'Identify the key character first.', [
          ['Animals with jointed legs and an outer skeleton belong to…', 'Arthropoda', ['Annelida', 'Mollusca', 'Porifera'], 'Arthro = joint, poda = foot.', 'Jointed appendages define arthropods.'],
          ['Which feature is found ONLY in mammals?', 'Mammary glands', ['Backbone', 'Lungs', 'Eyes'], 'They feed babies milk.', 'Only mammals have mammary glands.'],
          ['Which pair is warm-blooded?', 'Birds and mammals', ['Fish and frogs', 'Reptiles and fish', 'Frogs and lizards'], 'They keep a constant body temperature.', 'Aves and Mammalia are warm-blooded.'],
          ['A rod-like support along the back of chordates is the…', 'Notochord', ['Ligament', 'Tentacle', 'Shell'], 'Replaced by backbone in vertebrates.', 'The notochord is the defining feature of chordates.'],
          ['Animals that live on land but return to water to breed are…', 'Amphibians', ['Reptiles', 'Birds', 'Fishes'], 'Frogs and toads.', 'Amphibians lay eggs in water.'],
          ['Sea animals with spiny skin like starfish belong to…', 'Echinodermata', ['Mollusca', 'Coelenterata', 'Porifera'], 'Echino = spiny.', 'Echinoderms have spiny skin.'],
        ], 2),
        tapT('tap-mammal', 'Tap every MAMMAL.', [
          ['Bat', true], ['Whale', true], ['Dolphin', true], ['Human', true], ['Cow', true],
          ['Penguin', false], ['Shark', false], ['Crocodile', false], ['Ostrich', false],
        ], ['Look for hair and milk, not habitat.', 'Penguins and ostriches have feathers.'], 'Bats, whales, dolphins, humans and cows are mammals; penguins and ostriches are birds, sharks are fish, crocodiles are reptiles.', 5, 2),
      ],
    },
    {
      id: 'ts9.bs.class.naming', title: 'Nomenclature: scientific names', prereqs: ['ts9.bs.class.basis'],
      intro: [
        h('One name for the whole world'),
        photo('🥭', 'A mango is "maamidi" in Telugu, "aam" in Hindi and "mango" in English. Scientists everywhere call it Mangifera indica.'),
        p('Common names differ from place to place and can confuse. In 1753 the Swedish scientist Carl Linnaeus introduced binomial nomenclature: every species gets a two-part Latin name used all over the world.'),
        def('Binomial nomenclature', 'The system of naming each species with two words: the genus name followed by the species name.'),
        h('Rules for writing a scientific name'),
        stepsB('The first word is the genus — it begins with a CAPITAL letter.', 'The second word is the species — it is written in small letters.', 'When printed, the name is in italics.', 'When handwritten, each word is underlined separately.'),
        p('Examples: human — Homo sapiens; tiger — Panthera tigris; lion — Panthera leo; neem — Azadirachta indica; mango — Mangifera indica; house fly — Musca domestica; peacock — Pavo cristatus.'),
        keys('Two names: Genus (capital) + species (small).', 'Italics in print, underlined in handwriting.', 'Introduced by Carl Linnaeus, the father of taxonomy.'),
        remember('Tiger and lion share the genus Panthera, so they are closely related.'),
        tip('Never write "Homo Sapiens" — the species name never starts with a capital letter.'),
      ],
      examples: [
        ex('Write the scientific name of humans correctly by hand.', ['Genus: Homo — capital H.', 'Species: sapiens — small s.', 'Underline each word separately when handwriting.'], 'Homo sapiens (each word underlined)'),
        ex('What do Panthera tigris and Panthera leo tell you?', ['Both have the genus Panthera.', 'Different species names: tigris and leo.'], 'They are two different species of the same genus — closely related (tiger and lion).'),
      ],
      practice: [
        mcq('rules', 'Genus capital, species small.', [
          ['How should the scientific name of humans be written in print?', 'Homo sapiens — capital H, small s, in italics', ['Both words starting with capital letters', 'Both words in small letters', 'All letters in capitals'], 'Only one capital letter.', 'Genus starts with a capital; species is all small letters; printed in italics.'],
          ['Who introduced binomial nomenclature?', 'Carl Linnaeus', ['R. H. Whittaker', 'Charles Darwin', 'Robert Hooke'], 'A Swedish botanist, 1753.', 'Linnaeus introduced the two-name system.'],
          ['In Mangifera indica, "Mangifera" is the…', 'Genus', ['Species', 'Family', 'Kingdom'], 'The first word.', 'The first word is always the genus.'],
          ['When handwritten, a scientific name should be…', 'Underlined, each word separately', ['Written in capitals', 'Put in brackets', 'Written in red ink'], 'Hand-writing cannot make italics.', 'Underlining replaces italics in handwriting.'],
          ['Why are scientific names needed?', 'Common names differ between places and languages', ['They are shorter', 'They are cheaper', 'They change every year'], 'Maamidi, aam, mango…', 'One fixed name avoids confusion worldwide.'],
          ['Panthera tigris and Panthera leo belong to the same…', 'Genus', ['Species', 'Variety', 'Breed'], 'Look at the first word.', 'Both are in genus Panthera.'],
        ]),
        matchT('match', 'common name to scientific name', [
          ['Human', 'Homo sapiens'], ['Tiger', 'Panthera tigris'], ['Lion', 'Panthera leo'], ['Neem', 'Azadirachta indica'], ['Mango', 'Mangifera indica'], ['House fly', 'Musca domestica'], ['Peacock', 'Pavo cristatus'],
        ], ['Panthera is the big-cat genus.', 'Pavo is the peacock, India’s national bird.']),
        tapT('tap-correct', 'Tap every scientific name that is written CORRECTLY (as printed).', [
          ['Homo sapiens', true], ['Panthera leo', true], ['Azadirachta indica', true], ['Pavo cristatus', true],
          ['rana Tigrina', false], ['Felis Catus', false], ['MANGIFERA INDICA', false], ['musca domestica', false],
        ], ['First word capital, second word small.', 'No word is all capitals.'], 'Correct names have a capital genus and a small-letter species.'),
        mcq('related', 'Same genus = closer relatives.', [
          ['Which pair is most closely related?', 'Panthera leo and Panthera pardus', ['Panthera leo and Homo sapiens', 'Mangifera indica and Pavo cristatus', 'Azadirachta indica and Musca domestica'], 'Look for a shared first word.', 'Same genus means they share many characters.'],
          ['The second word in a scientific name is the…', 'Species name (specific epithet)', ['Genus name', 'Family name', 'Kingdom name'], 'It is written in small letters.', 'The second word identifies the species.'],
          ['Azadirachta indica and Mangifera indica share the word "indica". This tells us…', 'Both are linked to India; they are NOT necessarily related', ['They are the same species', 'They belong to the same genus', 'They are both animals'], 'Relationship comes from the genus, not the second word.', 'The genus differs, so "indica" only refers to India.'],
          ['Carl Linnaeus is called the…', 'Father of taxonomy', ['Father of genetics', 'Father of the cell', 'Father of evolution'], 'Taxonomy = science of classifying and naming.', 'Linnaeus founded modern naming and classification.'],
          ['The language used for scientific names is…', 'Latin (or Latinised words)', ['English', 'Telugu', 'Hindi'], 'It was the language of scholars.', 'Scientific names are Latin or Latinised.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Sense Organs
// =====================================================================================
const ch6: USpec = {
  id: 'ts9.bs.ch6', subject: 'biology', title: 'Sense Organs', source: src(6),
  objectives: [
    {
      id: 'ts9.bs.sense.pathway', title: 'What senses do: from stimulus to sensation', prereqs: [],
      intro: [
        h('How do you know the dosa is hot?'),
        photo('🔥', 'You touch a hot tawa and pull your hand away before you even "think". Your senses noticed the heat and your nervous system acted.'),
        p('Our senses keep us informed about the world and about our own body. Each sense organ has special cells called receptors that respond to one kind of change.'),
        def('Stimulus', 'Any change in the surroundings (or inside the body) that an organism can detect, such as light, sound, smell, heat or pressure.'),
        def('Receptor', 'A specialised cell or nerve ending that detects a particular stimulus and turns it into nerve impulses.'),
        def('Sensation', 'The awareness of a stimulus, produced when impulses reach the brain and are interpreted there.'),
        h('From stimulus to sensation'),
        stepsB('A stimulus (for example, light) reaches a sense organ.', 'Receptors detect it and produce nerve impulses.', 'Sensory nerves carry the impulses to the brain.', 'A particular region of the brain interprets them.', 'We feel the sensation (we "see", "hear", "smell") and may respond.'),
        p('So we really see and hear with our brain: the eye and ear only collect the information. If the nerve from a sense organ is damaged, the sensation is lost even if the organ is healthy.'),
        keys('Five sense organs: eye (sight), ear (hearing and balance), nose (smell), tongue (taste), skin (touch, heat, cold, pain, pressure).', 'Stimulus → receptor → sensory nerve → brain → sensation.'),
        remember('Receptors are named by the stimulus: photoreceptors (light), phonoreceptors (sound), olfactory receptors (smell), gustatory receptors (taste), thermoreceptors (heat and cold).'),
        tip('Sensation happens in the BRAIN, not in the sense organ.'),
      ],
      examples: [
        ex('When you have a bad cold, food tastes dull. Why?', ['Much of what we call "flavour" comes from smell.', 'Mucus blocks the smell receptors in the nose.', 'So the brain gets less information about the food.'], 'Smell receptors are blocked, so flavour is reduced.'),
        ex('A person’s eyes are healthy but the optic nerve is damaged. Can the person see?', ['Light still reaches the retina and receptors respond.', 'But impulses cannot travel to the brain.', 'Without reaching the brain there is no sensation.'], 'No — the brain receives no impulses, so there is no sight.'),
      ],
      practice: [
        orderT('order-path', 'Put the steps from stimulus to sensation in order.', ['Stimulus reaches the sense organ', 'Receptors produce nerve impulses', 'Sensory nerve carries impulses', 'Brain interprets the impulses', 'Sensation is felt'], ['The brain comes near the end.', 'Receptors act before nerves carry anything.'], 'Stimulus → receptor → sensory nerve → brain → sensation.'),
        matchT('match', 'receptor to its stimulus', [
          ['Photoreceptors', 'Light'], ['Phonoreceptors', 'Sound'], ['Olfactory receptors', 'Smell (chemicals in air)'], ['Gustatory receptors', 'Taste (chemicals in food)'], ['Thermoreceptors', 'Heat and cold'], ['Touch receptors', 'Pressure and touch'],
        ], ['Photo = light; phono = sound.', 'Olfactory = smell; gustatory = taste.']),
        mcq('basics', 'Where is the sensation actually produced?', [
          ['Where is a sensation actually produced?', 'In the brain', ['In the sense organ', 'In the spinal cord only', 'In the blood'], 'The organ only collects information.', 'Impulses are interpreted as sensations in the brain.'],
          ['A change in the surroundings that we can detect is a…', 'Stimulus', ['Response', 'Receptor', 'Nerve'], 'It starts the whole process.', 'A stimulus is the detectable change.'],
          ['Which organ senses both sound and balance?', 'Ear', ['Eye', 'Nose', 'Tongue'], 'Think of feeling dizzy after spinning.', 'The inner ear detects sound and body balance.'],
          ['Cells that detect a stimulus and start nerve impulses are…', 'Receptors', ['Effectors', 'Red blood cells', 'Muscle fibres'], 'They "receive" the stimulus.', 'Receptors turn stimuli into nerve impulses.'],
          ['Food tastes dull during a cold mainly because…', 'Smell receptors are blocked by mucus', ['Taste buds die', 'The tongue becomes cold', 'The brain stops working'], 'Flavour = taste + smell.', 'Blocked smell receptors reduce flavour.'],
        ]),
        tapT('tap-stimuli', 'Tap every item that is a STIMULUS.', [
          ['Bright light', true], ['A loud horn', true], ['Smell of jasmine', true], ['Heat from a stove', true], ['A pinprick', true],
          ['The optic nerve', false], ['The brain', false], ['A taste bud', false],
        ], ['A stimulus is a change outside or inside the body.', 'Nerves, brain and taste buds are parts of the body that detect or process stimuli.'], 'Light, sound, smell, heat and a pinprick are stimuli; the others are body structures.'),
      ],
    },
    {
      id: 'ts9.bs.sense.eye', title: 'The eye: how we see', prereqs: ['ts9.bs.sense.pathway'],
      intro: [
        h('A living camera'),
        photo('👁️', 'Look in a mirror and shine a torch near your eye: the black pupil becomes smaller. The iris is protecting the retina from too much light.'),
        p('The eye is a ball about 2.5 cm across, protected in a bony socket, by eyelids, eyelashes and tears.'),
        def('Cornea', 'The clear front window of the eye. It lets light in and does most of the bending of light.'),
        def('Iris and pupil', 'The iris is the coloured ring of muscle; the pupil is the hole in its centre. The iris widens the pupil in dim light and narrows it in bright light.'),
        def('Lens', 'A clear, flexible convex lens behind the pupil. Ciliary muscles change its shape to focus on near or far objects.'),
        def('Retina', 'The light-sensitive inner layer at the back of the eye. It has rods (work in dim light, black-and-white vision) and cones (work in bright light, colour vision).'),
        def('Optic nerve and blind spot', 'The optic nerve carries impulses to the brain. Where it leaves the retina there are no rods or cones, so it is the blind spot.'),
        p('Labelled parts of the eye diagram: cornea · iris · pupil · lens · ciliary muscles · aqueous humour · vitreous humour · retina · yellow spot · blind spot · optic nerve.'),
        stepsB('Light enters through the cornea.', 'It passes through the pupil.', 'The lens focuses it.', 'An inverted image forms on the retina.', 'Rods and cones send impulses along the optic nerve.', 'The brain interprets the image upright.'),
        keys('Cornea and lens focus light; iris controls light entering; retina detects light.', 'Rods = dim light; cones = colour.', 'The image on the retina is inverted; the brain corrects it.'),
        remember('Vitamin A is needed to make the pigment in rods. Its deficiency causes night blindness — eat carrots, papaya and green leafy vegetables.'),
        tip('Rods for "Rough" dim light; Cones for "Colour".'),
      ],
      examples: [
        ex('When you walk from bright sunlight into a dark cinema hall you cannot see at first. Why?', ['In bright light the pupil was small.', 'Rods need time to become sensitive in the dark.', 'Slowly the pupil widens and rods adjust.'], 'The pupil and rods need time to adjust to dim light.'),
        ex('Why can’t we see colours clearly at night by moonlight?', ['Colour vision needs cones.', 'Cones work only in bright light.', 'In dim light only rods work, and they do not detect colour.'], 'Only rods work in dim light, and rods do not detect colour.'),
      ],
      practice: [
        matchT('match', 'part of the eye to its job', [
          ['Cornea', 'Clear front window; bends light'], ['Iris', 'Controls the size of the pupil'], ['Lens', 'Focuses light on the retina'], ['Retina', 'Light-sensitive layer with rods and cones'],
          ['Optic nerve', 'Carries impulses to the brain'], ['Blind spot', 'Point with no rods or cones'], ['Ciliary muscles', 'Change the shape of the lens'],
        ], ['Light passes the front parts first.', 'The retina is like the film of a camera.']),
        mcq('eye', 'Follow the path of light through the eye.', [
          ['Which cells of the retina detect colour?', 'Cones', ['Rods', 'Ciliary cells', 'Iris cells'], 'Colour = C.', 'Cones work in bright light and detect colour.'],
          ['In dim light the pupil…', 'Becomes larger', ['Becomes smaller', 'Disappears', 'Turns red'], 'More light needs to get in.', 'The iris widens the pupil to let in more light.'],
          ['The image formed on the retina is…', 'Real and inverted', ['Virtual and upright', 'Real and upright', 'Not formed at all'], 'The eye lens is convex.', 'A convex lens forms a real, inverted image; the brain corrects it.'],
          ['The point on the retina with no receptors is the…', 'Blind spot', ['Yellow spot', 'Pupil', 'Lens'], 'Where the nerve leaves.', 'The blind spot has no rods or cones.'],
          ['Night blindness is caused by lack of…', 'Vitamin A', ['Vitamin C', 'Iron', 'Iodine'], 'Carrots are rich in it.', 'Vitamin A is needed for the light-sensitive pigment in rods.'],
          ['Which part gives the eye its colour (brown, black, blue)?', 'Iris', ['Pupil', 'Retina', 'Cornea'], 'It is a coloured ring.', 'Pigment in the iris gives eye colour.'],
        ]),
        orderT('order-light', 'Put the path of light into the eye in order.', ['Cornea', 'Pupil', 'Lens', 'Retina', 'Optic nerve'], ['The clear front window comes first.', 'The nerve carries the message last.'], 'Light passes cornea → pupil → lens → retina, then impulses go along the optic nerve.'),
        tapT('tap-care', 'Tap every GOOD habit for eye care.', [
          ['Reading in good light', true], ['Eating foods rich in vitamin A', true], ['Resting eyes after long screen use', true], ['Washing eyes with clean water', true],
          ['Rubbing eyes with dirty hands', false], ['Looking directly at the Sun', false], ['Reading in very dim light for hours', false],
        ], ['Think about strain, germs and strong light.', 'Never look straight at the Sun.'], 'Good light, vitamin A, rest and clean water protect the eyes.'),
      ],
    },
    {
      id: 'ts9.bs.sense.others', title: 'Ear, nose, tongue and skin', prereqs: ['ts9.bs.sense.pathway'],
      intro: [
        h('Four more windows to the world'),
        photo('👂', 'The outer ear (pinna) is shaped like a funnel to collect sound — that is why you cup your hand behind it to hear a soft voice.'),
        h('The ear'),
        def('Outer ear', 'The pinna and ear canal collect sound and lead it to the eardrum (tympanum), which vibrates.'),
        def('Middle ear', 'Three tiny bones — malleus (hammer), incus (anvil) and stapes (stirrup) — pass and amplify the vibrations. The Eustachian tube links the middle ear to the throat and balances air pressure.'),
        def('Inner ear', 'The snail-shaped cochlea, filled with fluid and hair cells, turns vibrations into nerve impulses for hearing. The semicircular canals help in balance.'),
        stepsB('Pinna collects sound waves.', 'Ear canal leads them to the eardrum, which vibrates.', 'Malleus, incus and stapes amplify the vibrations.', 'The cochlea’s hair cells produce impulses.', 'The auditory nerve carries them to the brain.'),
        h('Nose, tongue and skin'),
        def('Nose', 'Olfactory receptors in the roof of the nasal cavity detect chemicals dissolved in mucus. The olfactory nerve carries the message to the brain.'),
        def('Tongue', 'Taste buds, found mainly in the small bumps (papillae) on the tongue, detect sweet, sour, salty, bitter and umami. Food must dissolve in saliva to be tasted.'),
        def('Skin', 'The largest sense organ. Receptors in the dermis detect touch, pressure, heat, cold and pain. Fingertips and lips have the most touch receptors.'),
        keys('Ear ossicles: malleus → incus → stapes (stapes is the smallest bone in the body).', 'Cochlea = hearing; semicircular canals = balance.', 'Taste needs saliva; smell needs mucus.', 'Skin senses touch, pressure, heat, cold and pain.'),
        remember('Every part of the tongue with taste buds can sense all basic tastes — the old "tongue map" with fixed taste zones is a myth.'),
        tip('Ear bones in order: "My Ice-cream Stall" = Malleus, Incus, Stapes.'),
      ],
      examples: [
        ex('Why do your ears "pop" when a bus climbs the Ananthagiri hills?', ['Air pressure outside drops as you go up.', 'Air in the middle ear is at the old pressure.', 'Swallowing opens the Eustachian tube and balances the pressure — the "pop".'], 'The Eustachian tube equalises pressure in the middle ear.'),
        ex('Kavya puts dry sugar on a tongue she has wiped dry with a clean cloth. Why is the sweet taste slow to come?', ['Taste buds detect only dissolved chemicals.', 'A dry tongue has little saliva to dissolve the sugar.'], 'Sugar must dissolve in saliva before taste buds can detect it.'),
      ],
      practice: [
        orderT('order-ear', 'Put the path of sound through the ear in order.', ['Pinna', 'Ear canal', 'Eardrum', 'Malleus, incus, stapes', 'Cochlea', 'Auditory nerve'], ['Outer ear first, inner ear last.', 'The three tiny bones come right after the eardrum.'], 'Sound passes pinna → canal → eardrum → ossicles → cochlea → auditory nerve → brain.', 2),
        matchT('match', 'part to its function', [
          ['Pinna', 'Collects sound'], ['Eardrum', 'Vibrates with sound'], ['Ear ossicles', 'Amplify vibrations'], ['Cochlea', 'Turns vibrations into impulses'], ['Semicircular canals', 'Balance'],
          ['Eustachian tube', 'Balances air pressure'], ['Taste buds', 'Detect dissolved chemicals in food'], ['Olfactory receptors', 'Detect smells'],
        ], ['Two parts of the inner ear do two different jobs.', 'Taste and smell both detect chemicals.']),
        mcq('organs', 'Recall where each receptor is.', [
          ['The smallest bone in the human body is the…', 'Stapes', ['Malleus', 'Incus', 'Femur'], 'It is shaped like a stirrup.', 'The stapes in the middle ear is the smallest bone.'],
          ['Which part of the ear helps us keep our balance?', 'Semicircular canals', ['Cochlea', 'Pinna', 'Eardrum'], 'Three loops filled with fluid.', 'Fluid movement in the canals senses head position.'],
          ['Smell receptors are located in the…', 'Roof of the nasal cavity', ['Nostril hairs', 'Tongue', 'Throat'], 'Sniffing draws air up there.', 'Olfactory receptors lie high in the nasal cavity.'],
          ['To be tasted, food must first…', 'Dissolve in saliva', ['Be swallowed', 'Be cooked', 'Reach the stomach'], 'Dry tongues taste poorly.', 'Taste buds detect dissolved chemicals.'],
          ['Which is the largest sense organ?', 'Skin', ['Eye', 'Tongue', 'Ear'], 'It covers your whole body.', 'The skin is the largest organ and has many receptors.'],
          ['Which tube connects the middle ear to the throat?', 'Eustachian tube', ['Ear canal', 'Windpipe', 'Cochlea'], 'It opens when you swallow.', 'The Eustachian tube equalises air pressure.'],
        ]),
        tapT('tap-skin', 'Tap every sensation the SKIN can detect.', [
          ['Touch', true], ['Pressure', true], ['Heat', true], ['Cold', true], ['Pain', true],
          ['Colour', false], ['Sound pitch', false], ['Sweetness', false],
        ], ['Colour needs cones; pitch needs the cochlea.', 'Sweetness needs taste buds.'], 'Skin receptors sense touch, pressure, heat, cold and pain.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Animal Behaviour
// =====================================================================================
const ch7: USpec = {
  id: 'ts9.bs.ch7', subject: 'biology', title: 'Animal Behaviour', source: src(7),
  objectives: [
    {
      id: 'ts9.bs.behav.meaning', title: 'What animal behaviour means', prereqs: [],
      intro: [
        h('Why does the dog wag its tail?'),
        photo('🐶', 'A street dog wags its tail when a child who feeds it comes near, and growls at a stranger. Both are behaviours — responses to what it senses.'),
        def('Behaviour', 'The way an animal acts or responds to a stimulus (a change) in its surroundings or inside its body.'),
        p('Stimuli can be external (light, sound, smell, presence of food or an enemy) or internal (hunger, thirst, hormones). The animal senses the stimulus, its nervous system processes it, and muscles or glands produce a response.'),
        stepsB('Stimulus (e.g. smell of food)', 'Detected by sense organs', 'Processed by the nervous system', 'Response (e.g. moving towards the food)'),
        p('Behaviour helps animals find food and mates, escape enemies, protect their young and live in groups. Ethology is the study of animal behaviour in natural conditions.'),
        def('Ethology', 'The scientific study of animal behaviour, usually in the animal’s natural surroundings.'),
        keys('Behaviour = response to a stimulus.', 'Stimuli can be external or internal.', 'Behaviour helps survival and reproduction.'),
        remember('Behaviours are broadly innate (inborn, e.g. instinct) or learned (e.g. imprinting, conditioning, imitation).'),
        tip('For any behaviour, ask: What was the stimulus? What was the response? How does it help the animal survive?'),
      ],
      examples: [
        ex('Ants march in a line to a fallen piece of laddoo. What are the stimulus and response?', ['Stimulus: the smell of sugar (and the scent trail left by other ants).', 'Response: moving along the trail to the food.'], 'Stimulus: smell; response: following the trail to food.'),
        ex('A hungry calf runs to its mother. Is hunger an internal or external stimulus?', ['Hunger comes from inside the body.'], 'Internal stimulus'),
      ],
      practice: [
        mcq('meaning', 'Behaviour is a response to a stimulus.', [
          ['Animal behaviour is…', 'The way an animal responds to stimuli', ['The shape of its body', 'The food it eats only', 'Its scientific name'], 'It is about actions.', 'Behaviour is the response of an animal to stimuli.'],
          ['Which is an INTERNAL stimulus?', 'Hunger', ['Bright light', 'A loud sound', 'Smell of a predator'], 'It comes from inside the body.', 'Hunger is felt from inside the body.'],
          ['The study of animal behaviour in natural conditions is called…', 'Ethology', ['Ecology', 'Taxonomy', 'Cytology'], 'Konrad Lorenz was a pioneer.', 'Ethology is the study of behaviour.'],
          ['Why is behaviour important to an animal?', 'It helps it survive and reproduce', ['It changes its species', 'It makes it a plant', 'It has no use'], 'Finding food, escaping danger…', 'Behaviours increase chances of survival and reproduction.'],
          ['A lizard moves into the shade at noon. The stimulus is…', 'High temperature', ['Darkness', 'Rain', 'Hunger'], 'Noon sun is hot.', 'The lizard responds to heat by moving to shade.'],
        ]),
        orderT('order-chain', 'Put the steps of a behaviour in order.', ['Stimulus', 'Detection by sense organs', 'Processing by the nervous system', 'Response by muscles or glands'], ['Nothing happens until something changes.', 'Muscles act last.'], 'A stimulus is sensed, processed, and then a response is made.'),
        tapT('tap-external', 'Tap every EXTERNAL stimulus.', [
          ['Smell of food', true], ['Sound of a predator', true], ['Sunlight', true], ['Cold wind', true],
          ['Thirst', false], ['Hunger', false], ['Tiredness', false],
        ], ['External = from the surroundings.', 'Hunger and thirst arise inside the body.'], 'Smell, sound, light and wind come from outside; hunger, thirst and tiredness are internal.'),
        matchT('match', 'behaviour to its stimulus', [
          ['Moth flying to a lamp', 'Light'], ['Dog drinking water', 'Thirst'], ['Frog croaking in monsoon', 'Rain and breeding season'], ['Deer running away', 'Sight or smell of a tiger'], ['Ants following a line', 'Scent trail'],
        ], ['Ask "what did the animal sense?"', 'Thirst is internal.']),
      ],
    },
    {
      id: 'ts9.bs.behav.types', title: 'Types of behaviour: instinct, imprinting, conditioning, imitation', prereqs: ['ts9.bs.behav.meaning'],
      intro: [
        h('Born knowing, or learned?'),
        photo('🪺', 'A weaver bird builds its hanging nest perfectly the first time, without lessons. That is instinct.'),
        def('Instinct (innate behaviour)', 'Behaviour an animal is born with; it does not need learning or practice and is the same in all members of a species. E.g. a spider spinning a web, a newborn baby sucking, a weaver bird building a nest.'),
        def('Imprinting', 'A special quick learning in very young animals during a short sensitive period just after birth or hatching. Konrad Lorenz showed newly hatched goslings follow the first moving object they see — even him — as their mother.'),
        def('Conditioning', 'Learning to link a stimulus with a response. Ivan Pavlov rang a bell each time he fed a dog; later the dog salivated at the bell alone (classical conditioning). Animals also learn to repeat actions that bring rewards (operant conditioning, studied by B. F. Skinner).'),
        def('Imitation', 'Learning by watching and copying others. Young monkeys learn to crack nuts and find food by copying adults; children learn language by imitating.'),
        keys('Instinct: inborn, no learning.', 'Imprinting: very early, short sensitive period.', 'Conditioning: linking a stimulus with a response or reward.', 'Imitation: copying others.'),
        remember('Pavlov — dog and bell (conditioning). Lorenz — goslings (imprinting).'),
        tip('If the animal could do it perfectly the first time with no example, it is instinct.'),
      ],
      examples: [
        ex('Cows in a dairy start coming to the shed when they hear the sound of the feed bucket, even before they see food. Which type of behaviour?', ['A sound has become linked to food through repetition.', 'That is learning by association.'], 'Conditioning'),
        ex('A newly hatched duckling raised by a hen follows the hen everywhere. Which type of behaviour?', ['It follows the first moving object it saw after hatching.', 'This happens in a short sensitive period.'], 'Imprinting'),
      ],
      practice: [
        matchT('match', 'example to the type of behaviour', [
          ['Spider spinning a web', 'Instinct'], ['Goslings following Lorenz', 'Imprinting'], ['Dog salivating at a bell', 'Conditioning'], ['Child learning words from parents', 'Imitation'],
          ['Newborn baby sucking milk', 'Instinct'], ['Rat pressing a lever for food', 'Conditioning'],
        ], ['Inborn behaviours need no teacher.', 'Learning by copying is imitation.'], 4),
        mcq('types', 'Inborn or learned? If learned, how?', [
          ['Who demonstrated imprinting in goslings?', 'Konrad Lorenz', ['Ivan Pavlov', 'B. F. Skinner', 'Charles Darwin'], 'The goslings followed him like a mother.', 'Lorenz showed imprinting in geese.'],
          ['Pavlov’s dog experiment shows…', 'Conditioning', ['Instinct', 'Imprinting', 'Hibernation'], 'A bell became linked to food.', 'The dog learned to link bell and food.'],
          ['A weaver bird building its nest without being taught is…', 'Instinct', ['Imitation', 'Conditioning', 'Imprinting'], 'No lessons needed.', 'Nest building in weaver birds is inborn.'],
          ['Imprinting can happen only…', 'In a short sensitive period early in life', ['At any age', 'In old animals', 'In plants'], 'It happens just after hatching.', 'Imprinting needs a brief early window.'],
          ['A young parrot copying the words it hears is showing…', 'Imitation', ['Instinct', 'Imprinting', 'Reflex'], 'It copies sounds.', 'Learning by copying is imitation.'],
          ['Which behaviour is the same in all members of a species and needs no learning?', 'Instinct', ['Conditioning', 'Imitation', 'Reading'], 'It is in-born.', 'Instincts are inherited behaviours.'],
        ]),
        tapT('tap-learned', 'Tap every LEARNED behaviour.', [
          ['A dog sitting when told "sit" for a biscuit', true], ['A child learning to ride a bicycle', true], ['A calf coming when the farmer whistles', true], ['A monkey copying another to open a coconut', true],
          ['A spider spinning a web', false], ['A baby crying when hungry', false], ['A honeybee doing its dance', false],
        ], ['Learned behaviour needs experience or training.', 'Web spinning and crying are inborn.'], 'Training, practice and copying are learned; web spinning, crying and the bee dance are innate.'),
        mcq('apply', 'Look for clues: first time? reward? copying?', [
          ['Pigeons in a park fly to you when you shake a bag of grain. This is…', 'Conditioning', ['Instinct', 'Imprinting', 'Hibernation'], 'They have linked a sound with food.', 'Repeated pairing of sound and food is conditioning.'],
          ['Chicks hatched in an incubator follow the farmer’s boots. This is…', 'Imprinting', ['Imitation', 'Conditioning', 'Instinct only'], 'First moving thing they saw.', 'Imprinting on the first moving object.'],
          ['A puppy learns to avoid a hot stove after touching it once. This is a kind of…', 'Learning by experience (conditioning)', ['Instinct', 'Imprinting', 'Imitation'], 'Unpleasant result → avoid it.', 'It linked the stove with pain.'],
          ['A sea turtle hatchling crawls straight to the sea. This is…', 'Instinct', ['Imitation', 'Conditioning', 'Imprinting'], 'No one taught it.', 'Moving to the sea is inborn.'],
          ['Young elephants learn which plants to eat by watching their mothers. This is…', 'Imitation', ['Instinct', 'Imprinting', 'Reflex'], 'Watching and copying.', 'Learning by copying adults is imitation.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.behav.investigate', title: 'Human behaviour and investigating behaviour', prereqs: ['ts9.bs.behav.types'],
      intro: [
        h('Being a behaviour scientist'),
        photo('🐜', 'Put a few grains of sugar near an ant hole and wait. One ant finds it — and soon a whole line arrives. How did they know? You can find out with a simple experiment.'),
        p('Humans show instincts (a baby grasping a finger, blinking), but most human behaviour is learned — language, habits, manners and skills come from imitation, practice and teaching. Humans can also reason and plan, which lets us change our behaviour on purpose.'),
        h('How scientists investigate behaviour'),
        stepsB('Observe carefully and record what the animal does.', 'Ask a question (e.g. "How do ants find food?").', 'Make a hypothesis (e.g. "Ants follow a smell trail left by other ants").', 'Design a fair experiment, changing only ONE factor and keeping a control.', 'Record results and draw a conclusion.'),
        def('Hypothesis', 'A testable guess that explains an observation.'),
        def('Control', 'The part of an experiment where the factor being tested is NOT changed, so you can compare.'),
        p('Example: rub a finger across the ants’ path. The ants become confused and wander, then slowly find the path again. This supports the hypothesis that ants follow a chemical (pheromone) trail.'),
        keys('Most human behaviour is learned.', 'Investigate with observation → question → hypothesis → experiment → conclusion.', 'Change one factor at a time; keep a control.'),
        remember('Always treat animals gently during observations — never harm them.'),
        tip('A fair test changes only ONE thing.'),
      ],
      examples: [
        ex('Teja wants to know if earthworms prefer dark or light. Plan a fair test.', ['Use a tray, half covered (dark) and half open (light), with the same moist soil.', 'Place 10 earthworms in the middle.', 'After 10 minutes count worms on each side.', 'Repeat a few times.'], 'Most worms move to the dark side — they prefer darkness.'),
        ex('In Teja’s test, why must both halves have the same soil and moisture?', ['Only light should differ.', 'If moisture also differed, we would not know which caused the result.'], 'So that light is the only factor changed (fair test).'),
      ],
      practice: [
        orderT('order-method', 'Put the steps of investigating behaviour in order.', ['Observe the behaviour', 'Ask a question', 'Make a hypothesis', 'Do a fair experiment', 'Draw a conclusion'], ['You can only ask a question about something you have noticed.', 'The conclusion comes last.'], 'Observe → question → hypothesis → experiment → conclusion.'),
        mcq('method', 'A fair test changes one thing only.', [
          ['A testable explanation of an observation is a…', 'Hypothesis', ['Conclusion', 'Control', 'Result'], 'It comes before the experiment.', 'A hypothesis is a testable guess.'],
          ['In an experiment, the set-up in which the tested factor is NOT changed is the…', 'Control', ['Hypothesis', 'Variable', 'Stimulus'], 'It is used for comparison.', 'The control gives a baseline.'],
          ['Ants get confused when a finger is rubbed across their path. This suggests they…', 'Follow a chemical (smell) trail', ['Follow the Sun only', 'Are blind', 'Follow sounds'], 'Rubbing removes something.', 'Rubbing wipes off the pheromone trail.'],
          ['Which of these is a HUMAN instinct?', 'A baby grasping a finger', ['Reading a book', 'Riding a bicycle', 'Speaking Telugu'], 'Babies do it without learning.', 'The grasp reflex is inborn.'],
          ['Most human behaviour is…', 'Learned', ['Purely instinctive', 'Imprinting only', 'Unchanging'], 'Language, manners, skills.', 'Humans learn most of their behaviour.'],
        ]),
        tapT('tap-fair', 'Testing whether ants prefer sugar or salt — tap every condition that should be kept the SAME.', [
          ['Amount of each substance', true], ['Distance from the ant hole', true], ['Time of day', true], ['Size of the paper plates', true],
          ['Type of substance (sugar or salt)', false],
        ], ['Only the thing being tested should differ.', 'Here we are testing sugar versus salt.'], 'Everything except the substance should be kept the same.', 5, 2),
        mcq('human', 'Ask whether it was taught or present from birth.', [
          ['A child learns to say "namaste" by watching elders. This is…', 'Imitation', ['Instinct', 'Imprinting', 'Reflex'], 'Copying elders.', 'Learning by copying is imitation.'],
          ['Blinking when dust comes near the eye is…', 'An inborn reflex', ['Learned by imitation', 'Conditioning', 'Imprinting'], 'Even babies do it.', 'Blinking is an automatic inborn response.'],
          ['A student who studies regularly because she got praise for good marks shows…', 'Learning by reward (conditioning)', ['Instinct', 'Imprinting', 'A reflex'], 'Reward strengthened a habit.', 'Rewards reinforce behaviour.'],
          ['What makes humans able to change their behaviour on purpose?', 'Reasoning and planning', ['Only instincts', 'Imprinting', 'Fixed reflexes'], 'Think before acting.', 'Humans can reason and decide.'],
          ['Why should animals be handled gently during observation?', 'To avoid harming them and to see natural behaviour', ['To make them faster', 'It does not matter', 'To make them sleep'], 'Stress changes behaviour.', 'Kind handling protects animals and gives true results.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Challenges in Improving Agricultural Production
// =====================================================================================
const CROPS: [string, number][] = [['paddy', 5], ['maize', 6], ['cotton (seed cotton)', 2], ['red gram', 1], ['groundnut', 2], ['wheat', 4]];
const ch8: USpec = {
  id: 'ts9.bs.ch8', subject: 'biology', title: 'Challenges in Improving Agricultural Production', source: src(8),
  objectives: [
    {
      id: 'ts9.bs.agri.production', title: 'Crop production and high-yield crop management', prereqs: [],
      intro: [
        h('Feeding a growing country'),
        photo('🌾', 'Telangana’s paddy fields turn golden in the rabi and kharif seasons. More rice now comes from the same land than fifty years ago — how?'),
        p('India’s population keeps growing, but farmland cannot. So we must get more food from each hectare. The Green Revolution of the 1960s used high-yielding varieties (HYV), irrigation and fertilisers to raise grain production a lot. Today the challenge is to grow more without harming soil and water.'),
        def('Yield', 'The amount of crop produced from a unit area of land, usually in tonnes per hectare (t/ha).'),
        def('High-yielding variety (HYV)', 'A crop variety bred to give a much larger yield, often with disease resistance or shorter growing time.'),
        h('Managing water'),
        p('Crops need the right amount of water at the right time. Drip irrigation drips water at the roots through pipes; sprinkler irrigation sprays it like rain. Both save water compared with flooding fields. Tanks, canals, wells and check dams store water.'),
        h('Managing nutrients'),
        def('Macronutrients', 'Nutrients needed in large amounts: nitrogen (N), phosphorus (P), potassium (K), calcium, magnesium and sulphur. Carbon, hydrogen and oxygen come from air and water.'),
        def('Micronutrients', 'Nutrients needed in tiny amounts: iron, manganese, boron, zinc, copper, molybdenum and chlorine.'),
        xp({
          title: 'What if? Change the area and the yield', formula: 'production = area × yield',
          res: ['P', 'Total production', 't', 'A * Y', 1],
          vars: [['A', 'Area sown', 'ha', 1, 50, 1, 4], ['Y', 'Yield', 't/ha', 0.5, 10, 0.5, 5]],
          notes: [['Y', 'Better seeds, water and nutrients raise yield, so the same land gives more food.', 'Pests, drought or poor soil lower yield.'], ['A', 'More land gives more crop — but new farmland is scarce.', 'Less land means less food unless yield rises.']],
          mistakes: [['Adding area and yield', 'Yield is "per hectare", so multiply by the number of hectares.']],
          real: 'Doubling the yield on the same 4 ha feeds twice as many people without cutting a single tree.',
        }),
        keys('More food must come from higher yield, not more land.', 'HYV + irrigation + nutrients + protection = high yield.', 'Drip and sprinkler irrigation save water.', 'N, P, K are the main macronutrients.'),
        remember('Nitrogen deficiency makes older leaves turn yellow; nitrogen is needed for proteins and chlorophyll.'),
        tip('Production (t) = area (ha) × yield (t/ha).'),
      ],
      examples: [
        ex('A farmer near Karimnagar grows paddy on 3 ha with a yield of 5 t/ha. What is the total production?', ['Production = area × yield', '= 3 × 5', '= 15 t'], '15 tonnes'),
        ex('A field of 4 ha produced 18 t of maize. What was the yield?', ['Yield = production ÷ area', '= 18 ÷ 4', '= 4.5 t/ha'], '4.5 t/ha'),
      ],
      practice: [
        tp('production', (r) => {
          const [crop, base] = r.pick(CROPS);
          const A = r.pick([2, 3, 4, 5, 6, 8, 10]);
          const Y = rd(base * r.pick([0.8, 1, 1.25, 1.5]), 2);
          const back = r.next() < 0.4;
          const P = rd(A * Y, 2);
          if (back) return numQ(`${who(r)}’s ${A} ha ${crop} field produced ${P} t. What was the yield in t/ha? (Type the number only.)`, Y, undefined, ['Yield is production per hectare.', 'Divide production by area.'], [`Yield = ${P} ÷ ${A}`, `= ${Y} t/ha`], [{ when: String(rd(P * A, 2)), explain: 'You multiplied. Yield = production ÷ area.' }]);
          return numQ(`${who(r)} grows ${crop} on ${A} ha. The yield is ${Y} t/ha. What is the total production in tonnes? (Type the number only.)`, P, undefined, ['Production = area × yield.', `Multiply ${A} by ${Y}.`], [`Production = ${A} × ${Y}`, `= ${P} t`], rd(A + Y, 2) === P ? [] : [{ when: String(rd(A + Y, 2)), explain: 'Do not add. Yield is per hectare, so multiply by the area.' }]);
        }, 2),
        mcq('basics', 'Think about getting more from the same land.', [
          ['Why must India increase crop YIELD rather than farmland?', 'Land is limited while population grows', ['Crops grow only on new land', 'Old land cannot grow crops', 'Yield does not matter'], 'Forests and towns also need land.', 'Land is limited, so yield per hectare must rise.'],
          ['Which irrigation method supplies water drop by drop to roots?', 'Drip irrigation', ['Flood irrigation', 'Sprinkler irrigation', 'Canal irrigation'], 'It saves the most water.', 'Drip irrigation delivers water at the roots.'],
          ['Which group are ALL macronutrients?', 'Nitrogen, phosphorus, potassium', ['Iron, zinc, boron', 'Copper, molybdenum, chlorine', 'Manganese, iron, copper'], 'Needed in large amounts.', 'N, P and K are needed in large amounts.'],
          ['Which is a micronutrient?', 'Zinc', ['Nitrogen', 'Potassium', 'Calcium'], 'Needed in tiny amounts.', 'Zinc is needed only in traces.'],
          ['The Green Revolution mainly increased production of…', 'Food grains like wheat and rice', ['Milk', 'Fish', 'Eggs'], 'It used HYV seeds.', 'HYV wheat and rice raised grain output.'],
          ['Yellowing of older leaves is often a sign of shortage of…', 'Nitrogen', ['Oxygen', 'Carbon dioxide', 'Water vapour'], 'Needed for chlorophyll and proteins.', 'Nitrogen deficiency causes yellowing (chlorosis).'],
        ]),
        tapT('tap-yield', 'Tap every practice that helps raise crop YIELD.', [
          ['Using high-yielding seeds', true], ['Timely irrigation', true], ['Balanced nutrients', true], ['Controlling weeds and pests', true],
          ['Flooding fields all season', false], ['Sowing very late', false], ['Leaving weeds to grow', false],
        ], ['Think about what crops need: good seeds, water, food and protection.', 'Too much water also harms roots.'], 'Good seeds, timely water, balanced nutrients and protection raise yield.'),
        matchT('match', 'term to its meaning', [
          ['Yield', 'Crop per unit area'], ['HYV', 'Variety bred for high yield'], ['Drip irrigation', 'Water dripped at roots'], ['Sprinkler irrigation', 'Water sprayed like rain'], ['Macronutrient', 'Needed in large amounts'], ['Micronutrient', 'Needed in tiny amounts'],
        ], ['Macro = large; micro = small.', 'Yield is "per hectare".']),
      ],
    },
    {
      id: 'ts9.bs.agri.organic', title: 'Crop rotation, mixed cropping and organic manures', prereqs: ['ts9.bs.agri.production'],
      intro: [
        h('Feeding the soil, not just the crop'),
        photo('🧑‍🌾', 'Earthworms turn kitchen and farm waste into dark, crumbly vermicompost.'),
        def('Crop rotation', 'Growing different crops one after another on the same land in different seasons — for example paddy followed by a pulse like green gram. Pulses (legumes) have Rhizobium bacteria in root nodules that add nitrogen to the soil.'),
        def('Mixed cropping', 'Growing two or more crops together in the same field at the same time, e.g. groundnut with sunflower. It reduces the risk of total crop failure.'),
        def('Intercropping', 'Growing two or more crops in separate rows in a set pattern, e.g. maize with red gram (one row of red gram for every few rows of maize).'),
        def('Manure', 'Organic matter from decomposed animal dung and plant waste. It adds nutrients and humus, improves soil texture and water-holding.'),
        def('Green manure', 'Fast-growing plants such as sunhemp or dhaincha that are ploughed into the soil before sowing to enrich it.'),
        def('Vermicompost', 'Compost made by earthworms (such as Eisenia fetida) feeding on organic waste.'),
        def('Organic farming', 'Farming with manures, biofertilisers, crop rotation and natural pest control, using little or no synthetic chemicals.'),
        h('Making vermicompost'),
        stepsB('Make a pit or tank in shade with drainage.', 'Lay a bottom layer of coarse waste such as dry leaves.', 'Add layers of cow dung and chopped kitchen and farm waste.', 'Release earthworms and sprinkle water to keep it moist.', 'Cover; after about 6–8 weeks collect the dark compost from the top.'),
        keys('Legumes in rotation fix nitrogen.', 'Mixed cropping lowers risk; intercropping uses space well.', 'Manures add humus as well as nutrients.'),
        remember('Rhizobium lives in the root nodules of legumes such as red gram, green gram, groundnut and soybean.'),
        tip('Rotation = different crops at different TIMES; mixed/intercropping = different crops at the SAME time.'),
      ],
      examples: [
        ex('A farmer grows paddy in kharif and green gram in rabi on the same field. Name the practice and its benefit.', ['Different crops are grown one after another on the same land.', 'Green gram is a legume with nitrogen-fixing bacteria.'], 'Crop rotation; it restores soil nitrogen.'),
        ex('Why is manure better than chemical fertiliser for soil structure?', ['Manure adds humus (organic matter).', 'Humus makes soil crumbly, holds water and supports soil organisms.', 'Chemical fertilisers add only specific nutrients.'], 'Manure adds humus that improves texture and water-holding.'),
      ],
      practice: [
        matchT('match', 'practice to its description', [
          ['Crop rotation', 'Different crops in successive seasons'], ['Mixed cropping', 'Two crops sown together in one field'], ['Intercropping', 'Crops in separate rows in a pattern'],
          ['Green manure', 'Plants ploughed into soil'], ['Vermicompost', 'Compost made by earthworms'], ['Organic farming', 'Farming with few synthetic chemicals'],
        ], ['"Rotation" = turns over time.', '"Inter" = between rows.']),
        mcq('organic', 'Which practice adds nitrogen or humus?', [
          ['Which crop adds nitrogen to soil through root nodules?', 'Green gram', ['Paddy', 'Wheat', 'Maize'], 'It is a pulse (legume).', 'Legumes host Rhizobium that fixes nitrogen.'],
          ['The bacterium in legume root nodules is…', 'Rhizobium', ['Lactobacillus', 'Yeast', 'Penicillium'], 'Rhizo = root.', 'Rhizobium fixes atmospheric nitrogen in nodules.'],
          ['Sunhemp ploughed into the field before sowing is an example of…', 'Green manure', ['Vermicompost', 'Chemical fertiliser', 'Pesticide'], 'A green plant used as manure.', 'Green manure plants enrich soil when ploughed in.'],
          ['The main advantage of mixed cropping is…', 'It reduces the risk of total crop failure', ['It needs no water', 'It kills all pests', 'It gives one big crop only'], 'Don’t put all eggs in one basket.', 'If one crop fails, the other may still succeed.'],
          ['Manure improves soil mainly by adding…', 'Humus (organic matter) and nutrients', ['Plastic', 'Sand only', 'Salts only'], 'It is decomposed organic matter.', 'Humus improves texture, water-holding and fertility.'],
        ]),
        orderT('order-vermi', 'Put the steps of making vermicompost in order.', ['Prepare a shaded pit with drainage', 'Lay dry leaves at the bottom', 'Add layers of dung and chopped waste', 'Add earthworms and keep moist', 'Collect compost after 6–8 weeks'], ['The pit comes first.', 'Earthworms need food before they go in.'], 'Pit → base layer → waste layers → worms and water → harvest.', 2),
        tapT('tap-organic', 'Tap every practice used in ORGANIC farming.', [
          ['Vermicompost', true], ['Crop rotation with legumes', true], ['Neem-based pest control', true], ['Green manure', true],
          ['Heavy use of urea', false], ['Synthetic pesticide sprays every week', false],
        ], ['Organic farming avoids synthetic chemicals.', 'Neem is a natural product.'], 'Compost, rotation, neem and green manure are organic; heavy urea and synthetic sprays are not.'),
      ],
    },
    {
      id: 'ts9.bs.agri.fertilisers', title: 'Chemical fertilisers and their effects', prereqs: ['ts9.bs.agri.organic'],
      intro: [
        h('Quick food for crops — at a cost'),
        photo('🧪', 'Bags of urea and DAP are common in farm shops. Used correctly they boost yield; overused they damage soil and water.'),
        def('Chemical fertiliser', 'A factory-made salt that supplies specific nutrients, e.g. urea (nitrogen), DAP — diammonium phosphate (nitrogen and phosphorus), muriate of potash (potassium), and NPK mixtures.'),
        p('Fertilisers act fast and are easy to store and transport. But they do not add humus, and their overuse causes problems.'),
        h('Effects of overuse'),
        keys('Soil becomes hard and loses humus and useful organisms.', 'Soil may become acidic or salty over time.', 'Extra nitrate and phosphate wash into ponds and lakes, causing algal blooms (eutrophication) that kill fish.', 'Nitrates can seep into well water and harm health.', 'Money is wasted on fertiliser that the crop cannot use.'),
        def('Eutrophication', 'Excess nutrients in a water body make algae grow rapidly; when they die, decomposing bacteria use up the oxygen and fish die.'),
        stepsB('Fertiliser runs off fields into a lake.', 'Algae grow rapidly and cover the surface.', 'Sunlight cannot reach water plants below; algae die.', 'Bacteria decompose dead algae and use up dissolved oxygen.', 'Fish and other animals die for lack of oxygen.'),
        remember('Use fertilisers based on a soil test — Soil Health Cards tell farmers which nutrients their soil lacks.'),
        tip('Balance is the key: combine a little fertiliser with plenty of manure.'),
      ],
      examples: [
        ex('A lake near a heavily fertilised field turns bright green and many fish die. Explain.', ['Nitrates and phosphates ran off into the lake.', 'Algae grew rapidly (algal bloom).', 'Dead algae decomposed and bacteria used up oxygen.'], 'Eutrophication: oxygen fell, so fish died.'),
        ex('Urea contains 46% nitrogen. How much nitrogen is in a 50 kg bag?', ['Nitrogen = 46% of 50 kg', '= 0.46 × 50', '= 23 kg'], '23 kg of nitrogen'),
      ],
      practice: [
        mcq('fert', 'Fertilisers are quick but add no humus.', [
          ['Urea mainly supplies…', 'Nitrogen', ['Phosphorus', 'Potassium', 'Calcium'], 'It is a nitrogen fertiliser.', 'Urea is rich in nitrogen (about 46%).'],
          ['DAP supplies…', 'Nitrogen and phosphorus', ['Only potassium', 'Only iron', 'Humus'], 'Diammonium phosphate.', 'Ammonium gives N; phosphate gives P.'],
          ['Which is a disadvantage of chemical fertilisers?', 'They do not add humus and overuse harms soil', ['They act slowly', 'They are bulky to carry', 'They contain no nutrients'], 'Think of soil texture.', 'They lack organic matter; overuse degrades soil.'],
          ['Excess fertiliser in lakes causes…', 'Eutrophication (algal bloom)', ['Clearer water', 'More oxygen', 'Lower temperature'], 'Algae love nutrients.', 'Extra nutrients make algae overgrow and oxygen falls.'],
          ['How can a farmer know how much fertiliser to use?', 'By getting the soil tested', ['By guessing', 'By using as much as possible', 'By the colour of the bag'], 'Soil Health Card.', 'Soil tests show which nutrients are lacking.'],
        ]),
        orderT('order-eutro', 'Put the steps of eutrophication in order.', ['Fertiliser runs off into the lake', 'Algae grow rapidly', 'Algae die', 'Bacteria decompose them and use up oxygen', 'Fish die'], ['Nutrients must reach the water first.', 'Fish die at the end, due to low oxygen.'], 'Runoff → algal bloom → algae die → oxygen used up → fish die.', 2),
        tp('n-content', (r) => {
          const [name, pct] = r.pick([['urea', 46], ['ammonium sulphate', 21], ['calcium ammonium nitrate', 25]] as [string, number][]);
          const bag = r.pick([10, 20, 25, 45, 50]);
          const ans = rd(bag * pct / 100, 2);
          return numQ(`${name[0].toUpperCase() + name.slice(1)} contains about ${pct}% nitrogen. How many kg of nitrogen are in a ${bag} kg bag?`, ans, 'kg',
            [`Find ${pct}% of ${bag}.`, `Multiply ${bag} by ${pct} and divide by 100.`],
            [`N = ${pct}/100 × ${bag}`, `= ${ans} kg`],
            [{ when: String(rd(bag * 100 / pct, 2)), explain: 'You divided by the percentage. To find a percentage of an amount, multiply by pct/100.' }]);
        }, 2),
        tapT('tap-effects', 'Tap every harmful effect of OVERUSING chemical fertilisers.', [
          ['Soil becomes hard and loses humus', true], ['Algal blooms in ponds', true], ['Nitrates in drinking water', true], ['Soil may become acidic or salty', true],
          ['Soil becomes richer in humus', false], ['Fish population increases', false],
        ], ['Fertilisers add no organic matter.', 'Algal blooms reduce oxygen.'], 'Overuse hardens soil, changes its pH or salt level, and pollutes water.'),
      ],
    },
    {
      id: 'ts9.bs.agri.protection', title: 'Crop protection: weeds, pests and natural control', prereqs: ['ts9.bs.agri.production'],
      intro: [
        h('Guarding the harvest'),
        photo('🐞', 'A single ladybird beetle can eat dozens of aphids a day — a farmer’s free pest controller.'),
        def('Weeds', 'Unwanted plants growing with a crop. They compete for water, nutrients, light and space, e.g. Parthenium (congress grass), nut grass and Cyperus.'),
        def('Pests', 'Organisms that damage crops: insects (stem borers, bollworms, aphids), rodents, birds, and disease-causing fungi, bacteria and viruses.'),
        p('Insects damage crops by cutting roots, stems and leaves, sucking cell sap, or boring into stems and fruits. Pink bollworm is a serious pest of cotton.'),
        h('Ways of control'),
        def('Mechanical control', 'Removing weeds by hand or weeder, ploughing, and picking off insects or egg masses.'),
        def('Chemical control', 'Spraying weedicides, insecticides and fungicides. Effective, but overuse kills useful insects, pollutes soil and water and can leave residues in food.'),
        def('Biological (natural) control', 'Using living organisms or natural products: ladybird beetles eat aphids; Trichogramma wasps destroy pest eggs; birds and frogs eat insects; neem extract repels pests.'),
        def('Integrated Pest Management (IPM)', 'Combining resistant varieties, crop rotation, timely sowing, traps, natural enemies, and chemicals only when really needed.'),
        keys('Weeds compete; pests damage.', 'Natural control is safer for soil, water and people.', 'IPM uses chemicals only as a last resort.'),
        remember('Light traps and pheromone traps catch adult insects before they lay eggs.'),
        tip('Think "prevent first, spray last".'),
      ],
      examples: [
        ex('A cotton farmer places perches in the field for birds such as drongos. How does this help?', ['Birds sit on the perches and watch the crop.', 'They catch and eat caterpillars like bollworms.'], 'It encourages natural (biological) control of pests.'),
        ex('Why does removing weeds increase yield?', ['Weeds take water, nutrients, light and space.', 'Removing them leaves more for the crop.'], 'The crop gets more resources, so it grows better.'),
      ],
      practice: [
        mcq('protect', 'Is it competing, damaging or protecting?', [
          ['Weeds reduce yield mainly because they…', 'Compete with crops for water, nutrients and light', ['Add nitrogen to soil', 'Attract pollinators', 'Shade crops from too much rain'], 'They are unwanted plants.', 'Weeds take resources meant for the crop.'],
          ['Ladybird beetles help farmers by…', 'Eating aphids', ['Eating crops', 'Spreading weeds', 'Pollinating rice'], 'They are predators.', 'Ladybirds are natural enemies of aphids.'],
          ['Using natural enemies to control pests is…', 'Biological control', ['Chemical control', 'Mechanical control', 'Eutrophication'], 'Living organisms do the job.', 'Biological control uses predators, parasites or natural products.'],
          ['A natural pest repellent made from a common Indian tree is…', 'Neem extract', ['Urea', 'DDT', 'Common salt'], 'Its leaves are kept with stored grain.', 'Neem compounds repel and disrupt pests.'],
          ['IPM means…', 'Combining many methods and using chemicals only when needed', ['Spraying pesticides every day', 'Never controlling pests', 'Burning all crops'], 'Integrated = combined.', 'IPM integrates several methods to reduce chemical use.'],
          ['Which is a major insect pest of cotton?', 'Pink bollworm', ['Earthworm', 'Honeybee', 'Ladybird beetle'], 'It bores into cotton bolls.', 'The pink bollworm damages cotton bolls.'],
        ]),
        matchT('match', 'control method to its example', [
          ['Mechanical control', 'Hand weeding'], ['Chemical control', 'Spraying insecticide'], ['Biological control', 'Ladybirds eating aphids'], ['Natural product', 'Neem seed extract'], ['Traps', 'Pheromone trap for moths'],
        ], ['Mechanical = by hand or tools.', 'Biological = living helpers.']),
        tapT('tap-natural', 'Tap every NATURAL (non-chemical) way to protect crops.', [
          ['Releasing Trichogramma wasps', true], ['Bird perches in fields', true], ['Neem extract spray', true], ['Crop rotation', true], ['Hand weeding', true],
          ['Spraying synthetic insecticide', false], ['Weedicide spray', false],
        ], ['Natural methods avoid synthetic chemicals.', 'Weedicides are chemicals.'], 'Wasps, birds, neem, rotation and hand weeding are natural methods.'),
        mcq('chem', 'Think about effects beyond the target pest.', [
          ['Why is overuse of pesticides harmful?', 'It kills useful insects and pollutes soil, water and food', ['It makes crops grow too fast', 'It adds humus', 'It has no side effects'], 'Pesticides are not selective.', 'They harm non-target organisms and leave residues.'],
          ['Pests becoming resistant to a pesticide means…', 'The pesticide stops working on them', ['They die faster', 'They become helpful', 'They turn into plants'], 'Survivors pass on resistance.', 'Repeated spraying selects resistant pests.'],
          ['Pheromone traps work by…', 'Attracting insects with their own chemical signals', ['Poisoning the soil', 'Adding nitrogen', 'Watering crops'], 'Insects use scents to find mates.', 'The trap lures insects using pheromones.'],
          ['Parthenium (congress grass) is a…', 'Weed', ['Crop', 'Pest insect', 'Fertiliser'], 'An unwanted plant.', 'Parthenium is an invasive weed.'],
          ['Which should a farmer try FIRST in IPM?', 'Preventive and natural methods', ['Heavy spraying', 'Burning the field', 'Doing nothing'], 'Prevent first, spray last.', 'IPM puts prevention and natural control first.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Adaptations in Different Ecosystems
// =====================================================================================
const ch9: USpec = {
  id: 'ts9.bs.ch9', subject: 'biology', title: 'Adaptations in Different Ecosystems', source: src(9),
  objectives: [
    {
      id: 'ts9.bs.adapt.meaning', title: 'What adaptations are', prereqs: [],
      intro: [
        h('Built for where they live'),
        photo('🐪', 'A camel can walk for days in the Thar desert: broad padded feet stop it sinking in sand, and it can lose a lot of water without harm.'),
        def('Habitat', 'The natural home of an organism, which supplies its food, water, shelter and space.'),
        def('Ecosystem', 'All the living organisms of an area together with their non-living surroundings (soil, water, air, light, temperature) and the interactions between them.'),
        def('Adaptation', 'A feature of body structure, body function or behaviour that helps an organism survive and reproduce in its habitat. Adaptations develop over many generations.'),
        p('Adaptations can be structural (thick fur, spines), physiological (body working differently, like producing concentrated urine) or behavioural (being active at night in the desert).'),
        h('Some examples'),
        p('Desert: cactus has spines instead of leaves, a thick fleshy green stem that stores water and does photosynthesis, and a waxy coat; desert rats stay in burrows by day. Cold regions: polar bears have thick fur and fat. Forests: monkeys have long limbs and gripping hands for climbing. Grasslands: deer have long legs for running and eyes on the sides of the head to watch for predators.'),
        keys('Adaptation = feature that helps survival in a habitat.', 'Structural, physiological and behavioural adaptations.', 'Different habitats call for different adaptations.'),
        remember('Adaptations develop over many generations through natural selection — an individual cannot "decide" to adapt.'),
        tip('To spot an adaptation, first name the challenge in the habitat (heat? little water? cold? predators?), then find the feature that meets it.'),
      ],
      examples: [
        ex('Why does a cactus have spines instead of broad leaves?', ['Desert water is scarce.', 'Broad leaves lose a lot of water by transpiration.', 'Spines have tiny surface and also protect from animals.'], 'To reduce water loss (and for protection).'),
        ex('Many desert animals come out only at night. What type of adaptation is this?', ['It is about when the animal is active, not its body shape.', 'Nights are cool, so less water is lost.'], 'A behavioural adaptation.'),
      ],
      practice: [
        mcq('meaning', 'Name the challenge, then the feature.', [
          ['An adaptation is…', 'A feature that helps an organism survive in its habitat', ['Any change made by an individual in one day', 'The name of a habitat', 'A disease'], 'It improves survival.', 'Adaptations help organisms live and reproduce in their habitat.'],
          ['A cactus stores water in its…', 'Thick fleshy stem', ['Large leaves', 'Flowers', 'Thin roots only'], 'Its leaves are reduced to spines.', 'The stem stores water and does photosynthesis.'],
          ['Polar bears survive cold because of…', 'Thick fur and a layer of fat', ['Large ears', 'Thin skin', 'Gills'], 'Insulation.', 'Fur and fat keep the body warm.'],
          ['Being active only at night in the desert is a…', 'Behavioural adaptation', ['Structural adaptation', 'Disease', 'Nutrient'], 'It is about actions.', 'Changing activity time is behaviour.'],
          ['All living and non-living parts of an area interacting together form a(n)…', 'Ecosystem', ['Habitat', 'Organ', 'Species'], 'Eco + system.', 'An ecosystem includes living and non-living components.'],
        ]),
        matchT('match', 'organism to its adaptation', [
          ['Cactus', 'Spines and fleshy stem'], ['Camel', 'Padded feet for sand'], ['Polar bear', 'Thick fur and fat'], ['Monkey', 'Gripping hands for climbing'], ['Deer', 'Long legs for running'], ['Fish', 'Gills and streamlined body'],
        ], ['Think of each animal’s home.', 'Water animals need gills.']),
        tapT('tap-desert', 'Tap every adaptation useful in a HOT DESERT.', [
          ['Spines instead of leaves', true], ['Thick waxy coat on stem', true], ['Being active at night', true], ['Deep or widespread roots', true], ['Padded feet for sand', true],
          ['Thick fur and fat for cold', false], ['Broad thin leaves', false], ['Gills', false],
        ], ['Deserts are hot and dry.', 'Broad leaves lose water fast.'], 'Desert adaptations save water or cope with heat and sand.'),
        mcq('types', 'Structure, function, or behaviour?', [
          ['Thick fur of a yak is a…', 'Structural adaptation', ['Behavioural adaptation', 'Habitat', 'Ecosystem'], 'It is a body feature.', 'Body features are structural.'],
          ['Birds migrating south in winter show a…', 'Behavioural adaptation', ['Structural adaptation', 'Physiological disease', 'Mutation of habitat'], 'It is something they do.', 'Migration is a behaviour.'],
          ['A desert rat producing very concentrated urine shows a…', 'Physiological adaptation', ['Behavioural adaptation', 'Structural adaptation', 'Habitat'], 'It is about how the body works.', 'Body function changes are physiological.'],
          ['Adaptations arise…', 'Over many generations', ['In one day', 'Only when an animal wishes', 'Only in humans'], 'Natural selection is slow.', 'Adaptations develop through natural selection over generations.'],
          ['Eyes on the sides of a deer’s head help it to…', 'Watch all around for predators', ['See colours better', 'Find water', 'Climb trees'], 'A wide view helps prey animals.', 'Side-placed eyes give a wide field of view.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.adapt.aquatic', title: 'Aquatic adaptations: salinity, fish and water plants', prereqs: ['ts9.bs.adapt.meaning'],
      intro: [
        h('Fresh water or salt water?'),
        photo('🐟', 'Rohu and catla live in fresh-water tanks of Telangana, while tuna and sardines live in the salty sea. Most fish cannot survive if you swap them.'),
        def('Aquatic ecosystem', 'An ecosystem in water: fresh water (ponds, lakes, rivers, tanks) or marine (seas and oceans). Estuaries, where rivers meet the sea, have brackish water of in-between saltiness.'),
        def('Salinity', 'The amount of salt dissolved in water. Sea water has about 35 g of salt per litre; fresh water has very little.'),
        h('Water balance in fish'),
        p('Fresh-water fish: their body fluids are saltier than the water, so water keeps entering by osmosis. They hardly drink, pass large amounts of dilute urine, and their gills take in salts.'),
        p('Marine fish: the sea is saltier than their body fluids, so they keep losing water by osmosis. They drink sea water, pass small amounts of concentrated urine, and their gills get rid of extra salt.'),
        h('Aquatic plants'),
        def('Floating plants', 'E.g. water hyacinth and lotus leaves: swollen, spongy stalks with air spaces (aerenchyma); stomata on the upper surface; waxy coat so water rolls off.'),
        def('Submerged plants', 'E.g. Hydrilla and Vallisneria: thin, ribbon-like or finely divided leaves that do not tear in currents; little or no cuticle; weak roots and less xylem since water is all around.'),
        def('Mangroves', 'Trees of salty coastal swamps (e.g. Sundarbans) with breathing roots (pneumatophores) that grow up out of the mud to take in air.'),
        keys('Fresh-water fish: water enters → dilute urine, absorb salt. Marine fish: water leaves → drink, excrete salt.', 'Aquatic plants have air spaces for buoyancy and gas storage.', 'Floating leaves have stomata on the upper side.'),
        remember('Salinity decides which fish can live where — this is why fish must be adapted to fresh or salt water.'),
        tip('Osmosis is the key: water always moves towards the saltier side.'),
      ],
      examples: [
        ex('Why do lotus leaves have stomata only on the upper surface?', ['The lower surface touches water.', 'Gas exchange needs contact with air.'], 'Only the upper surface is exposed to air.'),
        ex('A fresh-water fish is put in sea water. What happens?', ['Sea water is saltier than its body fluids.', 'Water leaves its body by osmosis.', 'It cannot get rid of excess salt.'], 'It loses water and dies.'),
      ],
      practice: [
        mcq('fish', 'Which side is saltier? Water moves towards it.', [
          ['Fresh-water fish produce…', 'Large amounts of dilute urine', ['Small amounts of concentrated urine', 'No urine', 'Salt crystals'], 'Water keeps entering their body.', 'They pass out excess water as dilute urine.'],
          ['Marine fish drink sea water because…', 'They keep losing water by osmosis', ['They need salt', 'They are always thirsty for fun', 'Sea water is fresh'], 'The sea is saltier than their body.', 'Water leaves their body, so they must replace it.'],
          ['Gills of marine fish help them by…', 'Removing extra salt', ['Absorbing more salt', 'Storing water', 'Making food'], 'They drink salty water.', 'Special gill cells excrete excess salt.'],
          ['Water where rivers meet the sea is called…', 'Brackish water', ['Fresh water', 'Distilled water', 'Hard water'], 'In-between saltiness.', 'Estuaries have brackish water.'],
          ['Approximately how much salt does sea water contain?', 'About 35 g per litre', ['About 1 g per litre', 'About 350 g per litre', 'None'], 'About 3.5%.', 'Average ocean salinity is about 35 g/L.'],
        ]),
        mcq('plants', 'Think about buoyancy, air and currents.', [
          ['Water hyacinth floats because its leaf stalks have…', 'Spongy tissue with air spaces', ['Heavy wood', 'Thick bark', 'Stones'], 'Aerenchyma.', 'Air-filled spaces make it buoyant.'],
          ['Submerged plants like Hydrilla have thin, ribbon-like leaves to…', 'Avoid tearing in water currents', ['Store water', 'Attract insects', 'Make thorns'], 'Flowing water pulls on leaves.', 'Thin flexible leaves bend with currents.'],
          ['Mangroves take in air through…', 'Breathing roots (pneumatophores)', ['Spines', 'Flowers', 'Bark only'], 'Muddy soil has little oxygen.', 'Pneumatophores grow up out of the mud.'],
          ['Why do submerged plants have little xylem?', 'Water is available all around them', ['They never need water', 'They are dead', 'They have no cells'], 'They can absorb water through the whole surface.', 'Little need to transport water from roots.'],
          ['Lotus leaves are coated with wax so that…', 'Water rolls off and stomata stay open', ['They sink', 'Fish can eat them', 'They store salt'], 'Water drops bead up on lotus leaves.', 'The waxy coat keeps the upper surface dry.'],
        ], 2),
        matchT('match', 'organism to its adaptation', [
          ['Fresh-water fish', 'Dilute urine, absorbs salt'], ['Marine fish', 'Drinks sea water, excretes salt'], ['Water hyacinth', 'Spongy floating stalks'], ['Hydrilla', 'Thin submerged leaves'], ['Lotus', 'Stomata on upper surface'], ['Mangrove', 'Breathing roots'],
        ], ['Fresh water enters fresh-water fish.', 'Mangroves grow in salty mud.']),
        tapT('tap-float', 'Tap every feature of FLOATING water plants.', [
          ['Air spaces in tissues', true], ['Stomata on the upper leaf surface', true], ['Waxy leaf surface', true], ['Swollen spongy stalks', true],
          ['Thick bark', false], ['Spines instead of leaves', false], ['Very deep roots', false],
        ], ['Floating needs buoyancy.', 'Spines and deep roots are desert features.'], 'Air spaces, upper stomata, wax and spongy stalks help plants float and breathe.'),
      ],
    },
    {
      id: 'ts9.bs.adapt.lichens', title: 'Lichens and Darwin’s finches', prereqs: ['ts9.bs.adapt.meaning'],
      intro: [
        h('Partners on bare rock'),
        photo('🪨', 'Look closely at old rocks near Bhongir fort or on tree bark: grey-green crusty patches are lichens.'),
        def('Lichen', 'A partnership of a fungus and an alga (or cyanobacterium) living together. The alga makes food by photosynthesis; the fungus gives shelter, holds water and absorbs minerals.'),
        def('Symbiosis (mutualism)', 'A close relationship in which both partners benefit.'),
        p('Lichens can grow on bare rocks where nothing else can. They release acids that slowly break rock into soil, so they are pioneer organisms in forming new soil. They are very sensitive to sulphur dioxide, so their absence near cities and factories indicates polluted air — they are bio-indicators.'),
        h('Darwin’s finches'),
        p('On the Galapagos Islands, Charles Darwin noticed finches that looked alike but had very different beaks. Each beak suited the food on its island.'),
        p('Thick, strong beaks crack hard seeds; thin, pointed beaks pick insects; long beaks probe cactus flowers. Darwin concluded that one ancestral finch from the mainland gave rise to many species, each adapted to its own food — evidence for evolution by natural selection.'),
        stepsB('A few finches reach the islands from the mainland.', 'Each island has different food.', 'Birds with beaks better suited to the local food survive and breed more.', 'Over many generations beak shapes change.', 'Separate species with different beaks are formed.'),
        keys('Lichen = fungus + alga, both benefit.', 'Lichens are pioneers on rock and indicators of clean air.', 'Finch beak shape matches food — evidence of adaptation and evolution.'),
        remember('Darwin visited the Galapagos aboard HMS Beagle in 1835.'),
        tip('Beak = tool: nutcracker (seeds), tweezers (insects), straw (nectar).'),
      ],
      examples: [
        ex('Why are lichens rarely found in industrial areas?', ['Lichens are very sensitive to sulphur dioxide.', 'Factories release SO₂ into the air.'], 'Polluted air kills them — they indicate air quality.'),
        ex('A finch has a short, thick, strong beak. What does it probably eat?', ['A strong beak can crack hard objects.'], 'Hard seeds'),
      ],
      practice: [
        mcq('lichen', 'Two partners, both benefit.', [
          ['A lichen is a partnership between…', 'A fungus and an alga', ['A plant and an animal', 'Two bacteria', 'A virus and a fungus'], 'One makes food, the other gives shelter.', 'Lichens are fungus–alga partnerships.'],
          ['In a lichen, the alga…', 'Makes food by photosynthesis', ['Absorbs water only', 'Eats the fungus', 'Gives shelter'], 'It has chlorophyll.', 'The algal partner photosynthesises.'],
          ['A relationship where both partners benefit is…', 'Mutualism (symbiosis)', ['Parasitism', 'Predation', 'Competition'], 'Mutual = shared.', 'Both gain in mutualism.'],
          ['Lichens are called pioneers because they…', 'Are the first to grow on bare rock and start soil formation', ['Grow only in cities', 'Live in the sea', 'Eat animals'], 'Pioneer = first settler.', 'Lichen acids break rock, starting soil.'],
          ['Absence of lichens in an area suggests…', 'Air pollution (sulphur dioxide)', ['Too much rain', 'Very clean air', 'Many birds'], 'They are bio-indicators.', 'Lichens die in SO₂-polluted air.'],
        ]),
        matchT('match', 'beak type to food', [
          ['Thick, strong beak', 'Hard seeds'], ['Thin, pointed beak', 'Insects'], ['Long, slender beak', 'Nectar from cactus flowers'], ['Hooked beak', 'Tearing flesh (as in eagles)'],
          ['Broad, flat beak', 'Straining food from water (as in ducks)'],
        ], ['Think of the beak as a tool.', 'A nutcracker cracks seeds.']),
        orderT('order-finch', 'Put the steps of how Darwin’s finches formed new species in order.', ['Ancestral finches reach the islands', 'Different islands offer different food', 'Birds with suitable beaks survive and breed more', 'Beak shapes change over generations', 'New species are formed'], ['Arrival comes first.', 'New species come last, after many generations.'], 'Arrival → different food → selection → gradual change → new species.', 2),
        tapT('tap-lichen', 'Tap every TRUE statement about lichens.', [
          ['They are made of a fungus and an alga', true], ['They can grow on bare rocks', true], ['They help form soil', true], ['They are sensitive to air pollution', true],
          ['They are a single plant species', false], ['They grow best near smoky factories', false], ['They are animals', false],
        ], ['A lichen is two organisms together.', 'Pollution kills lichens.'], 'Lichens are fungus–alga partners, pioneers on rock and indicators of clean air.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Soil Pollution
// =====================================================================================
const ch10: USpec = {
  id: 'ts9.bs.ch10', subject: 'biology', title: 'Soil Pollution', source: src(10),
  objectives: [
    {
      id: 'ts9.bs.soil.fertility', title: 'What soil is and soil fertility', prereqs: [],
      intro: [
        h('Living soil'),
        photo('🌱', 'A handful of healthy farm soil holds more living organisms than there are people in Hyderabad — bacteria, fungi, earthworms and tiny insects.'),
        def('Soil', 'The thin top layer of the Earth’s crust in which plants grow. It is a mixture of mineral particles (sand, silt, clay), humus, water, air and living organisms.'),
        def('Humus', 'Dark organic matter formed from decomposed plant and animal remains. It makes soil fertile and helps it hold water.'),
        def('Soil fertility', 'The ability of soil to supply nutrients and water in the right amounts for good plant growth.'),
        p('Soil forms very slowly — it can take hundreds of years to form just a few centimetres — through weathering of rocks by sun, water, wind and living things.'),
        p('Soil profile (labelled layers from top): A-horizon — topsoil, dark, rich in humus; B-horizon — subsoil, more minerals, less humus; C-horizon — weathered rock pieces; bedrock — solid parent rock.'),
        keys('Soil = minerals + humus + water + air + organisms.', 'Humus = fertility.', 'Topsoil is the most fertile and the most easily lost.'),
        remember('Telangana has red soils (well drained, less fertile) and black cotton soils (hold water, good for cotton).'),
        tip('Healthy soil is ALIVE: protect the organisms and you protect fertility.'),
      ],
      examples: [
        ex('Why is topsoil darker than subsoil?', ['Topsoil has more humus.', 'Humus is dark-coloured organic matter.'], 'Because it is rich in humus.'),
        ex('Why is losing 2 cm of topsoil in one heavy flood a serious loss?', ['Topsoil is the most fertile layer.', 'Soil forms extremely slowly — centuries for a few cm.'], 'It cannot be replaced in a human lifetime.'),
      ],
      practice: [
        orderT('order-profile', 'Arrange the soil layers from TOP to BOTTOM.', ['Topsoil (A-horizon)', 'Subsoil (B-horizon)', 'Weathered rock (C-horizon)', 'Bedrock'], ['Humus-rich layer is on top.', 'Solid rock is at the bottom.'], 'Topsoil → subsoil → weathered rock → bedrock.'),
        mcq('soil', 'Remember what makes soil fertile.', [
          ['Dark organic matter in soil is called…', 'Humus', ['Clay', 'Sand', 'Bedrock'], 'It comes from decomposed remains.', 'Humus is decomposed organic matter.'],
          ['Which layer of soil is the most fertile?', 'Topsoil', ['Subsoil', 'Bedrock', 'Weathered rock'], 'It has the most humus.', 'Topsoil holds humus and most organisms.'],
          ['Soil fertility means…', 'The ability to supply nutrients and water for plant growth', ['The colour of soil', 'The depth of bedrock', 'The weight of soil'], 'Fertile soil grows good crops.', 'Fertility is about supplying plant needs.'],
          ['Which is NOT a component of soil?', 'Plastic', ['Humus', 'Air', 'Water'], 'One of these is a pollutant.', 'Plastic is a pollutant, not a natural soil component.'],
          ['Soil is formed by…', 'Slow weathering of rocks', ['Rain only in one day', 'Melting of plastic', 'Burning of trees'], 'It takes centuries.', 'Weathering breaks rock into soil slowly.'],
        ]),
        tapT('tap-components', 'Tap every natural COMPONENT of healthy soil.', [
          ['Sand and clay particles', true], ['Humus', true], ['Air', true], ['Water', true], ['Earthworms and microbes', true],
          ['Polythene bags', false], ['Pesticide residues', false], ['Broken glass', false],
        ], ['Some items are pollutants added by people.', 'Healthy soil is alive.'], 'Minerals, humus, air, water and organisms make up soil; plastics, residues and glass are pollutants.'),
        matchT('match', 'soil term to its meaning', [
          ['Topsoil', 'Dark, humus-rich layer'], ['Subsoil', 'Layer with more minerals, less humus'], ['Bedrock', 'Solid parent rock'], ['Humus', 'Decomposed organic matter'], ['Weathering', 'Breaking of rock into particles'],
        ], ['Top is darkest.', 'Weathering forms soil.']),
      ],
    },
    {
      id: 'ts9.bs.soil.causes', title: 'Causes of soil pollution', prereqs: ['ts9.bs.soil.fertility'],
      intro: [
        h('What spoils the soil'),
        photo('🧴', 'Plastic bottles and covers thrown on empty plots stay in the soil for hundreds of years.'),
        def('Soil (land) pollution', 'Any addition of harmful substances to soil, or removal of its useful parts, that reduces its fertility or harms living things.'),
        h('Main causes'),
        p('Chemical fertilisers: overuse changes soil acidity and salt levels and kills soil organisms. Pesticides: persistent chemicals stay in soil for years and enter food. Solid waste: plastics, glass, metals, e-waste and hospital waste from homes, markets and industries. Industrial waste: heavy metals such as lead, mercury and cadmium. Deforestation: tree roots no longer hold soil, so rain and wind wash away topsoil (erosion). Urbanisation: roads and buildings seal soil; more waste is produced.'),
        def('Biodegradable waste', 'Waste that microbes can break down naturally, e.g. vegetable peels, paper, leaves.'),
        def('Non-biodegradable waste', 'Waste that microbes cannot break down, e.g. plastics, glass, metals, many pesticides.'),
        keys('Causes: fertilisers, pesticides, solid waste, industrial waste, deforestation, urbanisation.', 'Non-biodegradable wastes last a very long time.'),
        remember('A single plastic carry bag may take hundreds of years to break down — and even then it only breaks into microplastics.'),
        tip('Ask: can microbes eat it? If not, it is non-biodegradable.'),
      ],
      examples: [
        ex('Hills near a town were cleared of trees for housing. After the next monsoon, streams turned muddy. Why?', ['Tree roots held the soil together.', 'Without them, rain washed topsoil into streams.'], 'Deforestation caused soil erosion.'),
        ex('Sort: banana peel, plastic cover, newspaper, glass bottle.', ['Microbes can decompose banana peel and newspaper.', 'They cannot decompose plastic or glass.'], 'Biodegradable: peel, newspaper. Non-biodegradable: plastic, glass.'),
      ],
      practice: [
        tapT('tap-nonbio', 'Tap every NON-BIODEGRADABLE item.', [
          ['Plastic bag', true], ['Glass bottle', true], ['Aluminium can', true], ['Thermocol plate', true],
          ['Vegetable peels', false], ['Dry leaves', false], ['Paper', false], ['Cow dung', false],
        ], ['Can microbes break it down?', 'Natural plant and animal materials decompose.'], 'Plastic, glass, metal and thermocol do not decompose; peels, leaves, paper and dung do.'),
        mcq('causes', 'Think of what each human activity adds or removes.', [
          ['Cutting down forests causes soil pollution mainly by…', 'Allowing soil erosion', ['Adding fertiliser', 'Adding plastic', 'Making soil colder'], 'Roots hold soil.', 'Without trees, topsoil is washed or blown away.'],
          ['Heavy metals like lead and mercury in soil usually come from…', 'Industrial waste', ['Cow dung', 'Leaves', 'Rainwater'], 'Factories and batteries.', 'Industries and e-waste release heavy metals.'],
          ['Why are persistent pesticides dangerous in soil?', 'They stay for years and enter food chains', ['They disappear in a day', 'They add humus', 'They feed earthworms'], 'Persistent = long-lasting.', 'They remain and accumulate in organisms.'],
          ['Urbanisation affects soil by…', 'Covering it with buildings and producing more waste', ['Adding more trees', 'Increasing humus', 'Reducing waste'], 'Concrete and garbage.', 'Cities seal soil and generate solid waste.'],
          ['Which waste can microbes decompose?', 'Kitchen waste', ['Plastic', 'Glass', 'Steel'], 'Biodegradable.', 'Food waste is biodegradable.'],
        ]),
        matchT('match', 'cause to its effect on soil', [
          ['Overuse of fertilisers', 'Soil becomes acidic or salty'], ['Persistent pesticides', 'Residues enter food'], ['Plastic waste', 'Blocks air and water in soil'], ['Deforestation', 'Soil erosion'], ['Industrial waste', 'Heavy metals in soil'], ['Urbanisation', 'Soil sealed under concrete'],
        ], ['Each cause leads to one main problem.', 'Erosion = topsoil carried away.']),
        mcq('sort', 'Sort wastes by type.', [
          ['Used batteries are dangerous in soil because they contain…', 'Heavy metals', ['Humus', 'Sugar', 'Oxygen'], 'Lead, cadmium, mercury.', 'Batteries leak toxic metals.'],
          ['Which pair are BOTH biodegradable?', 'Paper and fruit peels', ['Plastic and paper', 'Glass and peels', 'Steel and leaves'], 'Microbes can digest both.', 'Paper and peels decompose naturally.'],
          ['Plastic in soil harms plants mainly by…', 'Blocking water and air from reaching roots', ['Adding nitrogen', 'Making soil fertile', 'Feeding microbes'], 'It forms a barrier.', 'Plastic layers stop water and air movement.'],
          ['E-waste includes…', 'Old phones and computers', ['Banana peels', 'Cow dung', 'Leaves'], 'Electronic.', 'Discarded electronics are e-waste.'],
          ['Which human activity directly removes the fertile topsoil?', 'Soil erosion after deforestation', ['Composting', 'Planting trees', 'Crop rotation'], 'Unprotected soil is washed away.', 'Erosion carries away topsoil.'],
        ], 2),
      ],
    },
    {
      id: 'ts9.bs.soil.biomag', title: 'Biomagnification', prereqs: ['ts9.bs.soil.causes'],
      intro: [
        h('Poison that grows up the food chain'),
        photo('🦉', 'Owls, eagles and other birds of prey at the top of the food chain carry the highest amounts of persistent pesticides in their bodies.'),
        def('Biomagnification', 'The increase in the concentration of a non-biodegradable chemical (like DDT or mercury) at each higher level of a food chain.'),
        p('Persistent chemicals are not broken down or excreted easily, so they collect in body fat. Each animal eats many organisms from the level below, so it collects all their chemical. Concentrations multiply level after level.'),
        stepsB('Pesticide washes from soil into a lake: tiny amount in water.', 'Plankton absorb it.', 'Small fish eat lots of plankton — more in their bodies.', 'Big fish eat many small fish — even more.', 'Fish-eating birds eat many big fish — the highest concentration.'),
        p('In the 1960s, DDT made the eggshells of birds like eagles so thin that they broke, and their numbers fell. Humans at the top of food chains are also at risk.'),
        xp({
          title: 'What if? Climb the food chain', formula: 'C = C₀ × kⁿ⁻¹',
          res: ['C', 'Concentration at that level', 'ppm', 'C0 * k ^ (n - 1)', 3],
          vars: [['C0', 'Concentration in producers', 'ppm', 0.01, 1, 0.01, 0.04], ['k', 'Multiplication factor per level', '', 1, 20, 1, 10], ['n', 'Trophic level', '', 1, 5, 1, 4]],
          notes: [['n', 'One level higher multiplies the concentration by k again.', 'Lower levels hold far less of the chemical.'], ['k', 'A bigger factor means the chemical is stored and passed on more strongly.', 'A smaller factor means less build-up.'], ['C0', 'More pollution at the start means more at every level.', 'Cutting pollution at the source protects every level.']],
          mistakes: [['Adding the factor at each level', 'Each level eats MANY organisms below, so the amount is multiplied, not added.'], ['Thinking biodegradable chemicals magnify', 'Only persistent chemicals build up; biodegradable ones are broken down.']],
          real: 'This is why DDT is banned for farm use in India and why fish-eating birds and humans are most at risk.',
        }),
        keys('Only non-biodegradable, fat-soluble chemicals biomagnify.', 'Top consumers have the highest concentration.', 'Examples: DDT, mercury, lead.'),
        remember('Producer → herbivore → carnivore → top carnivore: concentration rises at every arrow.'),
        tip('Concentration at level n = start × (factor)^(n − 1).'),
      ],
      examples: [
        ex('A lake has DDT at 0.02 ppm in plankton. Each level up multiplies it by 10. Find the concentration in fish-eating birds at level 4.', ['Level 2 = 0.02 × 10 = 0.2 ppm', 'Level 3 = 0.2 × 10 = 2 ppm', 'Level 4 = 2 × 10 = 20 ppm'], '20 ppm'),
        ex('In the food chain grass → grasshopper → frog → snake, which organism will have the most pesticide?', ['Biomagnification increases concentration at each level.', 'The snake is the top consumer.'], 'The snake'),
      ],
      practice: [
        tp('calc', (r) => {
          const c0 = r.pick([0.01, 0.02, 0.03, 0.04, 0.05]);
          const k = r.pick([5, 10]);
          const n = r.pick([2, 3, 4]);
          const ans = rd(c0 * k ** (n - 1), 4);
          const names = ['producers (plankton)', 'small fish', 'big fish', 'fish-eating birds'];
          return numQ(`DDT in ${names[0]} is ${c0} ppm. At each higher level of the food chain it becomes ${k} times greater. What is the concentration in ${names[n - 1]} (level ${n}), in ppm? (Type the number only.)`, ans, undefined,
            ['Multiply by the factor once for each step up.', `From level 1 to level ${n} there are ${n - 1} steps.`],
            [`C = ${c0} × ${k}^${n - 1}`, `= ${ans} ppm`],
            [{ when: String(rd(c0 * k * n, 4)), explain: 'Multiply by the factor once per STEP: level 1 to level n is n − 1 steps.' }, { when: String(rd(c0 + k * (n - 1), 4)), explain: 'Concentrations are multiplied, not added.' }]);
        }, 2),
        mcq('biomag', 'Higher level = higher concentration.', [
          ['Biomagnification is…', 'Increase in concentration of a persistent chemical at higher levels of a food chain', ['Making organisms larger', 'Using a microscope', 'Decrease of pollution with time'], 'Bio + magnify.', 'Persistent chemicals concentrate up food chains.'],
          ['Which chemical is a classic example of biomagnification?', 'DDT', ['Glucose', 'Oxygen', 'Water'], 'A banned insecticide.', 'DDT is persistent and fat-soluble.'],
          ['In grass → grasshopper → frog → snake, the most pesticide is in the…', 'Snake', ['Grass', 'Grasshopper', 'Frog'], 'Top of the chain.', 'Top consumers collect the highest concentration.'],
          ['Why do biodegradable substances NOT biomagnify?', 'They are broken down by organisms', ['They are too heavy', 'They are not eaten', 'They are always gases'], 'Microbes can digest them.', 'Broken-down substances cannot accumulate.'],
          ['DDT harmed eagles and pelicans by…', 'Making their eggshells thin', ['Making their feathers fall', 'Making them grow larger', 'Giving them more food'], 'Eggs broke during incubation.', 'DDT caused thin eggshells and fewer chicks.'],
        ]),
        orderT('order-chain', 'Arrange the food chain from LOWEST to HIGHEST pesticide concentration.', ['Plankton', 'Small fish', 'Large fish', 'Fish-eating bird'], ['Producers have the least.', 'The top predator has the most.'], 'Concentration increases at each step up the food chain.'),
        tapT('tap-biomag', 'Tap every substance that can BIOMAGNIFY.', [
          ['DDT', true], ['Mercury', true], ['Lead', true], ['Some persistent pesticides', true],
          ['Glucose', false], ['Vegetable peels', false], ['Starch', false],
        ], ['Only persistent, non-biodegradable substances build up.', 'Food substances are digested.'], 'DDT, mercury, lead and persistent pesticides biomagnify; foods are broken down.'),
      ],
    },
    {
      id: 'ts9.bs.soil.control', title: 'Effects and control of soil pollution; waste management and conservation', prereqs: ['ts9.bs.soil.causes'],
      intro: [
        h('Healing the land'),
        photo('🌳', 'Rows of trees planted around fields (shelter belts) slow the wind and stop topsoil from blowing away.'),
        h('Effects of soil pollution'),
        keys('Lower fertility and crop yield.', 'Toxic chemicals enter food and water and harm health.', 'Soil organisms die, slowing decomposition.', 'Bad smells, mosquitoes and diseases near garbage dumps.'),
        h('Solid waste management — the 3 Rs and more'),
        stepsB('Reduce: use less — carry a cloth bag, avoid single-use plastic.', 'Reuse: use bottles, jars and paper again.', 'Recycle: send paper, glass, metal and plastic for recycling.', 'Segregate at home: green bin for wet (biodegradable) waste, blue bin for dry waste.', 'Compost the wet waste; send hazardous waste (batteries, medicines) to special collection.'),
        def('Sanitary landfill', 'A lined pit where waste that cannot be recycled is buried in layers and covered with soil so that it does not pollute groundwater.'),
        def('Bioremediation', 'Using microorganisms or plants to remove or break down pollutants in soil and water. Using plants is called phytoremediation (e.g. some plants absorb heavy metals).'),
        h('Soil conservation'),
        def('Soil conservation', 'Protecting soil from erosion and loss of fertility, e.g. afforestation, shelter belts, contour ploughing (ploughing across slopes), terrace farming on hills, strip cropping, cover crops and check dams.'),
        remember('Segregation at source is the most important step — mixed waste is very hard to recycle.'),
        tip('Wet waste → compost; dry waste → recycle; hazardous waste → special collection.'),
      ],
      examples: [
        ex('A hill farmer’s soil is washed down every monsoon. Suggest two methods to stop this.', ['Water flows fast straight down slopes.', 'Breaking the slope into steps or ploughing across it slows water.'], 'Terrace farming and contour ploughing (also planting trees).'),
        ex('Imran’s family produces 1.5 kg of waste a day, 60% of it wet waste. How much can be composted each day?', ['Wet waste = 60% of 1.5 kg', '= 0.6 × 1.5', '= 0.9 kg'], '0.9 kg per day'),
      ],
      practice: [
        orderT('order-3r', 'Arrange the 3 Rs in order of preference (best first).', ['Reduce', 'Reuse', 'Recycle'], ['Not creating waste is best of all.', 'Recycling still uses energy.'], 'Reduce first, then reuse, and recycle what remains.'),
        matchT('match', 'method to its description', [
          ['Contour ploughing', 'Ploughing across the slope'], ['Terrace farming', 'Step-like fields on hills'], ['Shelter belts', 'Rows of trees to block wind'], ['Bioremediation', 'Microbes clean pollutants'], ['Phytoremediation', 'Plants absorb pollutants'], ['Sanitary landfill', 'Lined pit for buried waste'],
        ], ['Phyto = plant.', 'Contour = following the shape of the hill.']),
        tp('wet-waste', (r) => {
          const total = r.pick([1, 1.5, 2, 2.5, 3, 4]);
          const pct = r.pick([40, 50, 60, 70]);
          const ans = rd(total * pct / 100, 2);
          return numQ(`${who(r)}’s household produces ${total} kg of waste a day, and ${pct}% of it is wet (kitchen) waste. How many kg can be composted each day?`, ans, 'kg',
            [`Find ${pct}% of ${total} kg.`, `${pct}% = ${pct / 100}.`],
            [`Wet waste = ${pct / 100} × ${total}`, `= ${ans} kg`],
            [{ when: String(rd(total - ans, 2)), explain: 'That is the DRY waste. Wet waste is the part that can be composted.' }]);
        }, 2),
        tapT('tap-conserve', 'Tap every method that CONSERVES soil.', [
          ['Planting trees (afforestation)', true], ['Terrace farming', true], ['Contour ploughing', true], ['Check dams', true], ['Cover crops', true],
          ['Overgrazing by cattle', false], ['Cutting forests', false], ['Burning crop stubble', false],
        ], ['Methods that slow water or wind or hold soil help.', 'Overgrazing exposes soil.'], 'Trees, terraces, contour ploughing, check dams and cover crops protect soil.'),
        mcq('manage', 'Think about the safest place for each waste.', [
          ['Kitchen waste should go into the…', 'Wet (green) bin for composting', ['Dry (blue) bin', 'River', 'Fire'], 'It is biodegradable.', 'Wet waste is composted.'],
          ['Using microbes to break down oil spilled on soil is…', 'Bioremediation', ['Biomagnification', 'Deforestation', 'Incineration'], 'Bio + remedy.', 'Microbes digest the pollutant.'],
          ['The MOST important first step in waste management at home is…', 'Segregating wet and dry waste', ['Burning all waste', 'Burying plastics in the garden', 'Throwing waste on empty plots'], 'Mixed waste is hard to recycle.', 'Segregation at source makes composting and recycling possible.'],
          ['Old batteries and medicines should be…', 'Given to special hazardous-waste collection', ['Put in compost', 'Thrown in a lake', 'Burnt at home'], 'They contain toxic chemicals.', 'Hazardous waste needs special handling.'],
          ['Carrying a cloth bag to the market is an example of…', 'Reduce', ['Recycle', 'Landfill', 'Incineration'], 'It avoids creating waste.', 'Avoiding a plastic bag reduces waste.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Biogeochemical Cycles
// =====================================================================================
const ch11: USpec = {
  id: 'ts9.bs.ch11', subject: 'biology', title: 'Biogeochemical Cycles', source: src(11),
  objectives: [
    {
      id: 'ts9.bs.cycle.water', title: 'Biogeochemical cycles and the water cycle', prereqs: [],
      intro: [
        h('Nothing is wasted in nature'),
        photo('🌧️', 'The rain falling on Hussain Sagar may once have been in the Bay of Bengal, a leaf in Nallamala forest, or even in a dinosaur. Water keeps moving round and round.'),
        def('Biogeochemical cycle', 'The cyclic movement of an element or substance (water, carbon, nitrogen, oxygen) between living things (bio) and the non-living environment — rocks, soil, water and air (geo).'),
        p('Earth receives energy from the Sun all the time, but it does not receive new matter. So the same atoms must be used again and again. Biogeochemical cycles recycle them.'),
        h('The water cycle'),
        stepsB('Evaporation: the Sun heats seas, lakes and rivers; water becomes vapour.', 'Transpiration: plants release water vapour through stomata.', 'Condensation: vapour cools high up and forms clouds of tiny droplets.', 'Precipitation: droplets join and fall as rain, snow or hail.', 'Run-off and infiltration: water flows into rivers and the sea or soaks into the ground to become groundwater.'),
        def('Groundwater', 'Water that soaks into soil and is stored in rocks below; we draw it from wells and borewells.'),
        keys('Bio + geo + chemical: elements cycle between living and non-living parts.', 'Water cycle: evaporation, transpiration, condensation, precipitation, run-off and infiltration.', 'About 97% of Earth’s water is salty sea water; less than 1% is easily usable fresh water.'),
        remember('Cutting forests reduces transpiration and infiltration — leading to less rain locally and lower groundwater.'),
        tip('Remember E-T-C-P: Evaporation, Transpiration, Condensation, Precipitation.'),
      ],
      examples: [
        ex('Why does a covered pot of water placed in the sun have droplets on the underside of its lid?', ['Water evaporates in the heat.', 'Vapour touches the cooler lid and condenses.'], 'Evaporation followed by condensation — a mini water cycle.'),
        ex('Of 500 litres of Earth’s water, about 97% is in the oceans. How many litres is that?', ['97% of 500 = 0.97 × 500', '= 485 L'], '485 litres'),
      ],
      practice: [
        orderT('order-water', 'Put the stages of the water cycle in order, starting from the sea.', ['Evaporation from the sea', 'Condensation into clouds', 'Precipitation as rain', 'Run-off into rivers', 'Water returns to the sea'], ['Water must rise as vapour before clouds form.', 'Rivers carry water back to the sea.'], 'Evaporation → condensation → precipitation → run-off → back to the sea.'),
        matchT('match', 'process to its description', [
          ['Evaporation', 'Water turns into vapour'], ['Transpiration', 'Plants release water vapour'], ['Condensation', 'Vapour forms droplets in clouds'], ['Precipitation', 'Rain, snow or hail falls'], ['Infiltration', 'Water soaks into the ground'], ['Run-off', 'Water flows over land into rivers'],
        ], ['Trans = across (through leaves).', 'Infiltration = into the ground.']),
        mcq('water', 'Follow a drop of water.', [
          ['Loss of water vapour from leaves is…', 'Transpiration', ['Evaporation from the sea', 'Condensation', 'Precipitation'], 'Through stomata.', 'Plants transpire water vapour.'],
          ['Clouds form by…', 'Condensation', ['Evaporation', 'Infiltration', 'Run-off'], 'Vapour cools into droplets.', 'Cooling vapour condenses into cloud droplets.'],
          ['Water stored below ground in rocks is…', 'Groundwater', ['Run-off', 'Vapour', 'Sea water'], 'Wells reach it.', 'Infiltrated water becomes groundwater.'],
          ['"Biogeochemical" refers to cycling between…', 'Living things and the non-living environment', ['Only rocks', 'Only animals', 'Only the Sun and Moon'], 'Bio = life; geo = Earth.', 'Elements cycle between organisms and their surroundings.'],
          ['Most of Earth’s water is…', 'Salty water in oceans', ['Fresh water in rivers', 'Groundwater', 'Water vapour'], 'About 97%.', 'Oceans hold about 97% of all water.'],
          ['Why must matter be recycled on Earth?', 'Earth gets energy from the Sun but no new matter', ['Matter is created daily', 'The Sun sends water', 'Plants make atoms'], 'Energy flows; matter cycles.', 'The same atoms must be reused.'],
        ]),
        tp('percent', (r) => {
          const total = r.pick([100, 200, 400, 500, 1000]);
          const [what, pct] = r.pick([['the oceans (salty)', 97], ['ice caps and glaciers', 2]] as [string, number][]);
          const ans = rd(total * pct / 100, 2);
          return numQ(`Suppose all of Earth’s water were ${total} litres. About ${pct}% is in ${what}. How many litres is that?`, ans, undefined,
            [`Find ${pct}% of ${total}.`, `Multiply ${total} by ${pct} and divide by 100.`],
            [`${pct}/100 × ${total} = ${ans} L`, 'Only a tiny fraction of Earth’s water is usable fresh water.'],
            [{ when: String(total - ans), explain: 'That is the part NOT in this store. Find the given percentage itself.' }]);
        }, 2),
      ],
    },
    {
      id: 'ts9.bs.cycle.nitrogen', title: 'The nitrogen cycle', prereqs: ['ts9.bs.cycle.water'],
      intro: [
        h('Air full of nitrogen, but plants can’t breathe it in'),
        photo('🥜', 'Pull up a groundnut plant and look at its roots: small pink nodules hold bacteria that turn air nitrogen into plant food.'),
        p('About 78% of the air is nitrogen gas (N₂). All living things need nitrogen to make proteins and DNA, but plants and animals cannot use N₂ directly. It must first be "fixed" into compounds.'),
        def('Nitrogen fixation', 'Conversion of atmospheric N₂ into compounds (ammonia, nitrates) that plants can use — by bacteria such as Rhizobium (in legume root nodules) and Azotobacter (free-living), by blue-green algae, by lightning, and in fertiliser factories.'),
        def('Nitrification', 'Soil bacteria change ammonia into nitrites (Nitrosomonas) and then into nitrates (Nitrobacter).'),
        def('Assimilation', 'Plants absorb nitrates and make proteins; animals get nitrogen by eating plants or other animals.'),
        def('Ammonification', 'Decomposers (bacteria and fungi) break down dead organisms and wastes, releasing ammonia.'),
        def('Denitrification', 'Bacteria such as Pseudomonas change nitrates back into N₂ gas, which returns to the air.'),
        stepsB('N₂ in air is fixed into ammonia/nitrates (fixation).', 'Ammonia → nitrites → nitrates (nitrification).', 'Plants absorb nitrates and make proteins (assimilation).', 'Animals eat plants; dead bodies and wastes are decomposed to ammonia (ammonification).', 'Some nitrates are changed back to N₂ (denitrification).'),
        keys('Air: 78% N₂ — unusable directly.', 'Fixation → nitrification → assimilation → ammonification → denitrification.', 'Legumes + Rhizobium enrich soil with nitrogen.'),
        remember('Lightning provides enough energy to join nitrogen and oxygen into nitrogen oxides, which rain carries into the soil as nitrates.'),
        tip('Nitrosomonas makes nitrIte (comes first, "o" before "b"); Nitrobacter makes nitrAte.'),
      ],
      examples: [
        ex('Why do farmers grow red gram or green gram between cereal crops?', ['Pulses are legumes with Rhizobium in root nodules.', 'Rhizobium fixes nitrogen into the soil.'], 'They add nitrogen to the soil naturally.'),
        ex('A room has 50 m³ of air. About how much of it is nitrogen gas?', ['Nitrogen ≈ 78% of air.', '0.78 × 50 = 39 m³'], 'About 39 m³'),
      ],
      practice: [
        orderT('order-n', 'Put the steps of the nitrogen cycle in order, starting from the air.', ['Nitrogen fixation', 'Nitrification', 'Assimilation by plants', 'Ammonification by decomposers', 'Denitrification back to air'], ['Air nitrogen must be fixed first.', 'Denitrification returns N₂ to the air at the end.'], 'Fixation → nitrification → assimilation → ammonification → denitrification.', 2),
        matchT('match', 'organism or agent to its role', [
          ['Rhizobium', 'Fixes nitrogen in root nodules'], ['Azotobacter', 'Free-living nitrogen fixer'], ['Nitrosomonas', 'Ammonia → nitrite'], ['Nitrobacter', 'Nitrite → nitrate'], ['Pseudomonas', 'Nitrate → nitrogen gas'], ['Lightning', 'Forms nitrogen oxides in air'], ['Decomposers', 'Release ammonia from dead matter'],
        ], ['Two bacteria do nitrification in two steps.', 'Denitrifiers return N₂ to air.']),
        mcq('n', 'Which step changes what into what?', [
          ['About what percentage of air is nitrogen?', '78%', ['21%', '0.04%', '50%'], 'It is the largest part of air.', 'Air is about 78% nitrogen.'],
          ['Plants absorb nitrogen mainly as…', 'Nitrates', ['N₂ gas', 'Proteins', 'Carbon dioxide'], 'A dissolved salt in soil water.', 'Roots take up nitrates (and some ammonium).'],
          ['Conversion of nitrates back to nitrogen gas is…', 'Denitrification', ['Nitrification', 'Fixation', 'Assimilation'], '"De" = remove.', 'Denitrifying bacteria release N₂.'],
          ['Animals get nitrogen by…', 'Eating plants or other animals', ['Breathing N₂', 'Absorbing nitrates through skin', 'Drinking rain'], 'Food chains.', 'Animals obtain nitrogen compounds from food.'],
          ['Why do living things need nitrogen?', 'To make proteins and DNA', ['To make glucose only', 'To breathe', 'To make bones of calcium'], 'Amino acids contain it.', 'Proteins and nucleic acids contain nitrogen.'],
        ]),
        tp('n-air', (r) => {
          const vol = r.pick([10, 20, 25, 50, 100, 200, 300]);
          const ans = rd(vol * 0.78, 2);
          return numQ(`A classroom contains ${vol} m³ of air. Air is about 78% nitrogen. About how many m³ of nitrogen gas are in the room?`, ans, undefined,
            ['Find 78% of the volume.', `0.78 × ${vol}`],
            [`N₂ = 0.78 × ${vol} = ${ans} m³`], [{ when: String(rd(vol * 0.21, 2)), explain: '21% is oxygen. Nitrogen is about 78%.' }]);
        }, 2),
      ],
    },
    {
      id: 'ts9.bs.cycle.carbon-oxygen', title: 'The carbon cycle and the oxygen cycle', prereqs: ['ts9.bs.cycle.water'],
      intro: [
        h('Breathing in, breathing out — the planet way'),
        photo('🍃', 'Every leaf is a small factory taking in carbon dioxide and giving out oxygen while the Sun shines.'),
        h('The carbon cycle'),
        p('Carbon is the backbone of all organic molecules — carbohydrates, fats, proteins and DNA. Air holds only about 0.04% carbon dioxide, but it is the source of carbon for all life.'),
        stepsB('Plants take in CO₂ and make glucose by photosynthesis.', 'Animals eat plants; carbon passes along food chains.', 'Plants, animals and decomposers release CO₂ by respiration.', 'Dead remains buried for millions of years form coal, oil and gas (fossil fuels).', 'Burning fuels and forests returns CO₂ to the air; oceans also absorb and release CO₂.'),
        def('Greenhouse effect', 'CO₂ and some other gases trap heat near Earth’s surface. Extra CO₂ from burning fossil fuels and cutting forests increases this, causing global warming.'),
        h('The oxygen cycle'),
        p('Oxygen makes up about 21% of the air. It is released by plants (and algae) during photosynthesis and used up in respiration, burning and rusting. In the upper atmosphere some oxygen forms ozone (O₃), which shields Earth from harmful ultraviolet rays.'),
        keys('Carbon enters life by photosynthesis and returns by respiration, decomposition and combustion.', 'Oxygen is released by photosynthesis and used by respiration, combustion and rusting.', 'The carbon and oxygen cycles are linked through photosynthesis and respiration.'),
        remember('Photosynthesis: CO₂ + water → glucose + O₂ (in sunlight). Respiration is roughly the reverse.'),
        tip('Plants are the only big "entry gate" of carbon into living things.'),
      ],
      examples: [
        ex('How does burning firewood affect the carbon cycle?', ['Wood is made of carbon compounds.', 'Burning (combustion) combines the carbon with oxygen.', 'CO₂ is released to the air.'], 'It returns carbon to the air as CO₂ and uses up oxygen.'),
        ex('Why do aquarium owners keep water plants with their fish?', ['Fish use oxygen and release CO₂.', 'Plants use CO₂ and release oxygen in light.'], 'Plants supply oxygen and use the fishes’ CO₂ — linking the two cycles.'),
      ],
      practice: [
        mcq('co', 'Is the process adding or removing CO₂ (or O₂) from air?', [
          ['Which process removes CO₂ from the air?', 'Photosynthesis', ['Respiration', 'Burning coal', 'Decomposition'], 'Plants use it to make food.', 'Photosynthesis fixes CO₂ into glucose.'],
          ['Fossil fuels are formed from…', 'Remains of organisms buried for millions of years', ['Rainwater', 'Sand', 'Sunlight only'], 'Coal from ancient plants.', 'Buried remains turn into coal, oil and gas.'],
          ['About what percentage of air is oxygen?', '21%', ['78%', '0.04%', '1%'], 'Second largest part.', 'Air is about 21% oxygen.'],
          ['The ozone layer protects us from…', 'Ultraviolet rays', ['Rain', 'Oxygen', 'Sound'], 'Sunburn and skin damage.', 'Ozone absorbs harmful UV radiation.'],
          ['Extra CO₂ in the air causes…', 'Global warming (enhanced greenhouse effect)', ['More ozone', 'Cooler Earth', 'Less rainfall everywhere instantly'], 'It traps heat.', 'More CO₂ traps more heat.'],
          ['Which process uses OXYGEN?', 'Respiration', ['Photosynthesis', 'Condensation', 'Nitrogen fixation'], 'All living cells do it.', 'Respiration uses O₂ and releases CO₂.'],
        ]),
        tapT('tap-add', 'Tap every process that ADDS carbon dioxide to the air.', [
          ['Respiration by animals', true], ['Burning petrol', true], ['Decomposition of dead leaves', true], ['Forest fires', true], ['Respiration by plants', true],
          ['Photosynthesis', false], ['Growing new forests', false],
        ], ['Burning and breaking down release CO₂.', 'Plants making food use it up.'], 'Respiration, burning, decomposition and fires release CO₂; photosynthesis removes it.'),
        orderT('order-c', 'Trace a carbon atom in order.', ['CO₂ in the air', 'Glucose in a leaf', 'Food eaten by a goat', 'Released as CO₂ when the goat respires'], ['Plants capture carbon first.', 'Respiration returns it.'], 'Air → plant (photosynthesis) → animal (food) → air (respiration).'),
        matchT('match', 'process to its effect', [
          ['Photosynthesis', 'Uses CO₂, releases O₂'], ['Respiration', 'Uses O₂, releases CO₂'], ['Combustion', 'Burns fuel, releases CO₂'], ['Decomposition', 'Breaks down dead matter, releases CO₂'], ['Ozone formation', 'O₂ forms a UV shield'], ['Rusting', 'Iron uses up oxygen'],
        ], ['Only one process releases oxygen.', 'Rusting is a slow reaction with oxygen.']),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11];
