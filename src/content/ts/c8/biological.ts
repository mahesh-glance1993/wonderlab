// Telangana SCERT Class 8 — Biological Science (11 chapters). Original teaching aligned to the official chapter
// list (src/content/ts/books.ts, syllabus.json). Explanations, examples and practice are written for WonderLab.
import {
  tp, ex, p, h, tip, def, keys, remember, photo, explore, stepsB, L, approx, choose, matching, ordering, tapAll, rd, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(8, 'biological-science', n);
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
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched. Take the left items one at a time and ask what each one actually is or does.' }],
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
// Chapter 1 — What is Science?
// =====================================================================================
const ch1: USpec = {
  id: 'ts8.bs.ch1', subject: 'biology', title: 'What is Science?', source: src(1),
  objectives: [
    {
      id: 'ts8.bs.sci.nature', title: 'What science is and why we do it', prereqs: [],
      intro: [
        h('Asking "why?" and "how?"'),
        photo('🤔', 'Why do the leaves of a touch-me-not plant fold when you touch them? Every "why" you ask about the world is the starting point of science.'),
        p('A farmer near Warangal notices that cotton grows better in black soil than in sandy soil. A grandmother knows that turmeric on a cut helps it heal. A child wonders why the moon changes shape. All of them are observing, wondering and trying to explain. Science is the organised way of doing exactly this — carefully, honestly and in a way others can check.'),
        def('Science', 'A systematic way of learning about the natural world by observing, asking questions, testing ideas with evidence and building knowledge that others can check and improve.'),
        def('Evidence', 'Observations and measurements that support or reject an idea. In science an idea is accepted only when evidence supports it.'),
        p('Science is not just a pile of facts in a textbook. It is a process that never finishes. When new evidence appears, scientists change their ideas. People once believed that the Sun moved around the Earth; careful observation showed the opposite.'),
        h('Why do we study science?'),
        keys('To understand the world around us — plants, animals, our body, the sky.', 'To solve problems — better seeds, vaccines, clean water, electricity.', 'To think clearly and question beliefs that have no evidence (superstitions).', 'To make wise choices about health and the environment.'),
        remember('A scientific idea must be testable. "Ghosts make the lamp flicker" cannot be tested; "the wind makes the lamp flicker" can be tested by closing the window.'),
        tip('When you hear a claim, ask: "What is the evidence? Can I test it?" That one question is the heart of science.'),
      ],
      examples: [
        ex('Teja says, "Eating fish and then drinking milk causes white patches on the skin." How would a scientist respond?', ['A scientist treats this as a claim to be tested, not a fact.', 'Look for evidence: do people who eat fish and milk together get more white patches than others?', 'Medical studies find no such link; white patches (vitiligo) have other causes.'], 'Ask for evidence and test the claim; the evidence does not support it.'),
        ex('Which of these is a scientific question: (a) Is red the most beautiful colour? (b) Do bean seeds sprout faster in warm water than in cold water?', ['A scientific question can be answered by observation or experiment.', '(a) depends on personal opinion.', '(b) can be tested by soaking seeds at two temperatures and counting days to sprout.'], '(b) is scientific; (a) is a matter of opinion.'),
      ],
      practice: [
        mcq('what', 'Science is a way of finding out, using evidence.', [
          ['Which best describes science?', 'A way of learning about nature by observing and testing ideas with evidence', ['A collection of facts that never change', 'Believing what elders say', 'Only the work done in big laboratories'], 'Science is a process, not just a list.', 'Science is a method of building knowledge that is checked against evidence and can change.'],
          ['Which question can be answered by science?', 'Does a plant grow taller in sunlight than in shade?', ['Which film is the best?', 'Is Sunday a lucky day?', 'Which festival is the most fun?'], 'Can it be tested by observation or experiment?', 'Plant growth in sun and shade can be measured and compared.'],
          ['A scientific idea is accepted only when…', 'Evidence from observations or experiments supports it', ['A famous person says it', 'It is very old', 'Most people like it'], 'What do scientists rely on?', 'Evidence, not authority or popularity, decides in science.'],
          ['What happens when new evidence shows an old scientific idea is wrong?', 'Scientists change or replace the idea', ['The evidence is ignored', 'The idea is kept forever', 'Science stops'], 'Science corrects itself.', 'Science improves its ideas when better evidence appears.'],
          ['Which of these is a superstition rather than a scientific explanation?', 'A black cat crossing the road brings bad luck', ['Mosquitoes spread malaria', 'Plants need sunlight to make food', 'Boiling water kills germs'], 'Which one has no evidence behind it?', 'There is no evidence that a cat crossing a road causes bad events.'],
          ['Why do we study science?', 'To understand nature and solve real problems', ['Only to pass exams', 'To memorise names', 'To avoid asking questions'], 'Think of vaccines, seeds and clean water.', 'Science helps us understand the world and improve lives.'],
        ]),
        tapT('tap-testable', 'Tap every question that can be TESTED scientifically.', [
          ['Does salt dissolve faster in hot water?', true], ['Do earthworms prefer damp soil?', true], ['Does a fan dry clothes faster?', true], ['Do more seeds sprout when soaked overnight?', true],
          ['Is mango the tastiest fruit?', false], ['Is blue a happier colour than green?', false], ['Is it unlucky to sneeze before leaving home?', false],
        ], ['A testable question can be answered by measuring or observing.', 'Opinions and beliefs about luck cannot be measured.'], 'Questions about dissolving, drying, sprouting and animal behaviour can be tested; taste preferences and luck cannot.'),
        mcq('evidence', 'Look for the answer that relies on checking.', [
          ['Kavya hears that onions kept in the room absorb germs. What is the most scientific next step?', 'Look for evidence or design a test', ['Believe it because it is common', 'Reject it without thinking', 'Ask only friends'], 'Neither blind belief nor blind rejection.', 'A scientist tests a claim before accepting or rejecting it.'],
          ['An observation is…', 'Something noticed using the senses or instruments', ['A guess about the future', 'A story', 'A rule made by elders'], 'Seeing, hearing, measuring.', 'Observations are information gathered with senses or tools.'],
          ['Which is evidence that a plant needs water?', 'A plant without water wilts while a watered one stays fresh', ['Plants are green', 'Rain feels cool', 'Farmers like rain'], 'A comparison is needed.', 'Comparing watered and unwatered plants gives evidence.'],
          ['Why must a scientific idea be testable?', 'So that others can check whether it is true', ['So it sounds clever', 'So it cannot be questioned', 'So it can be memorised'], 'Science is shared and checked.', 'Ideas that cannot be tested cannot be supported by evidence.'],
          ['People once thought the Sun goes around the Earth. This changed because…', 'Careful observations gave new evidence', ['A king ordered it', 'People got bored', 'The Sun changed its path'], 'Telescopes helped.', 'New observations showed that the Earth goes around the Sun.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.sci.method', title: 'The scientific method: how scientists work', prereqs: ['ts8.bs.sci.nature'],
      intro: [
        h('From a question to an answer'),
        photo('👩‍🔬', 'Scientists do not guess and stop. They observe, guess, test, check and share — over and over.'),
        p('Imagine Ravi notices that the curd his mother sets in summer becomes sour faster than in winter. He wonders whether temperature affects curd setting. He follows a series of steps that scientists all over the world use.'),
        stepsB('Observe: notice something interesting (curd sours faster in summer).', 'Ask a question: does warmth make curd set faster?', 'Form a hypothesis: a testable guess — "curd sets faster at higher temperature".', 'Experiment: set curd in two identical bowls, one in a warm place and one in a cool place; change only the temperature.', 'Record and analyse: note the time each bowl takes to set.', 'Conclude: decide whether the evidence supports the hypothesis.', 'Communicate: share the results so that others can repeat the test.'),
        def('Hypothesis', 'A possible, testable explanation for an observation. It is tested by experiment and may be supported or rejected.'),
        def('Variable', 'Anything that can change in an experiment. The one you change on purpose is the independent variable; the one you measure is the dependent variable; all others are kept the same (controlled variables).'),
        def('Control set-up', 'The part of an experiment kept under normal conditions for comparison, so you can see the effect of the one thing you changed.'),
        p('A fair test changes only ONE thing at a time. If Ravi used different milk in the two bowls, he could not tell whether the temperature or the milk made the difference.'),
        keys('Observe → question → hypothesis → experiment → analyse → conclude → communicate.', 'Change one variable, keep the rest the same.', 'Repeat trials and take an average to reduce errors.', 'A rejected hypothesis is still useful — it teaches us something.'),
        remember('Results must be repeatable: another person doing the same experiment should get similar results.'),
        tip('Average of trials = (sum of all readings) ÷ (number of readings).'),
      ],
      examples: [
        ex('Meena wants to test whether fertiliser makes bean plants grow taller. Name the variable she changes, the one she measures, and two she must keep the same.', ['Changed (independent): fertiliser or no fertiliser.', 'Measured (dependent): height of the plants.', 'Kept the same: type of seed, amount of water, sunlight, pot size, soil.'], 'Change fertiliser; measure height; keep water, light, soil and seed type the same.'),
        ex('In three trials, a seed took 4, 5 and 6 days to sprout. What is the average time?', ['Sum = 4 + 5 + 6 = 15 days', 'Number of trials = 3', 'Average = 15 ÷ 3 = 5 days'], '5 days'),
      ],
      practice: [
        orderT('order-method', 'Put the steps of the scientific method in order.', [
          'Make an observation', 'Ask a question', 'Form a hypothesis', 'Do an experiment', 'Analyse the results', 'Draw a conclusion',
        ], ['You must notice something before you can ask about it.', 'The conclusion comes only after looking at results.'], 'Scientists observe, ask, guess (hypothesis), test, analyse and then conclude.'),
        mcq('terms', 'Remember: change ONE thing, measure ONE thing, keep the rest the same.', [
          ['A testable guess that explains an observation is a…', 'Hypothesis', ['Conclusion', 'Result', 'Law'], 'It comes before the experiment.', 'A hypothesis is a testable explanation, checked by experiment.'],
          ['In a fair test, how many variables should you change at a time?', 'Only one', ['Two', 'All of them', 'None'], 'Otherwise you cannot tell which change mattered.', 'Changing one variable lets you link the effect to its cause.'],
          ['The part of an experiment kept under normal conditions for comparison is the…', 'Control', ['Hypothesis', 'Variable', 'Observation'], 'It is used to compare.', 'The control shows what happens without the change being tested.'],
          ['Arjun tests whether light affects seed germination. The amount of light is the…', 'Independent variable', ['Dependent variable', 'Controlled variable', 'Conclusion'], 'It is what he changes on purpose.', 'The variable changed deliberately is the independent variable.'],
          ['Why do scientists repeat an experiment several times?', 'To make sure the results are reliable', ['To waste time', 'To change the hypothesis', 'To avoid writing'], 'One result might be a mistake.', 'Repeating trials reduces the effect of chance errors.'],
          ['If the results do not support a hypothesis, the scientist should…', 'Reject or change the hypothesis and test again', ['Change the results', 'Hide the experiment', 'Stop doing science'], 'Honesty is essential.', 'Results must be reported honestly; the hypothesis is revised.'],
        ]),
        tp('average', (r) => {
          const n = r.pick([3, 4, 5]);
          const base = r.int(4, 12);
          const vals = Array.from({ length: n }, () => base + r.int(-2, 2));
          const sum = vals.reduce((a, b) => a + b, 0);
          const avg = rd(sum / n, 1);
          return numQ(`${who(r)} measured how many days bean seeds took to sprout in ${n} trials: ${vals.join(', ')} days. What is the average number of days? (Round to 1 decimal place if needed.)`, avg, undefined,
            ['Add all the readings.', `Divide the total by the number of trials (${n}).`],
            [`Sum = ${vals.join(' + ')} = ${sum}`, `Average = ${sum} ÷ ${n} = ${avg} days`],
            [{ when: String(sum), explain: 'That is the total. Divide it by the number of trials to get the average.' }], 0.02);
        }, 2),
        mcq('fair', 'Find the one that changes only one thing.', [
          ['Which is a FAIR test of whether salt water affects plant growth?', 'Two identical plants, same soil and light, one given salt water and one plain water', ['One plant in sun with salt water, one in shade with plain water', 'Two different plants both given salt water', 'One plant only, given salt water'], 'Only the type of water should differ.', 'Everything except the water must be kept the same.'],
          ['Sana sets curd in a steel bowl in the sun and a clay pot in the fridge. Why is this not a fair test of temperature?', 'She changed two things — the container and the temperature', ['She used curd', 'She used two bowls', 'Clay pots are not allowed'], 'Count the changes.', 'With two changes, she cannot tell which one caused the difference.'],
          ['In testing whether ants prefer sugar or salt, what must be the same?', 'The amount and placement of sugar and salt', ['The colour of the ants', 'The time of the year only', 'Nothing needs to be the same'], 'Only the type of food should differ.', 'Equal amounts placed equally make the comparison fair.'],
          ['What is measured in an experiment on how temperature affects curd setting?', 'Time taken for the curd to set', ['The temperature', 'The type of bowl', 'The colour of the milk'], 'The dependent variable is what you observe changing.', 'Setting time is the dependent variable.'],
          ['After an experiment, why should results be shared?', 'So others can check and repeat them', ['To become famous only', 'To keep them secret', 'So nobody else does science'], 'Science is a community effort.', 'Communication lets others verify and build on the work.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.sci.skills', title: 'Science process skills', prereqs: ['ts8.bs.sci.method'],
      intro: [
        h('The tools inside your head'),
        photo('🔬', 'A microscope is a tool in your hand. Observing, measuring and predicting are tools in your mind — and they work everywhere, not only in the laboratory.'),
        p('Scientists use a set of thinking skills called science process skills. You already use many of them: when you judge from dark clouds that it will rain, you are predicting; when you sort vegetables into leafy and root vegetables, you are classifying.'),
        def('Observing', 'Using the senses (and instruments) to gather information, e.g. noting that a leaf is rough and has parallel veins.'),
        def('Classifying', 'Grouping things by shared features, e.g. animals with backbones and without.'),
        def('Measuring', 'Finding a quantity with a standard unit, e.g. height in cm, mass in g, time in s.'),
        def('Inferring', 'Explaining an observation using what you already know, e.g. wet ground in the morning → it probably rained at night.'),
        def('Predicting', 'Saying what will happen in the future based on patterns, e.g. a plant kept in the dark will turn pale.'),
        def('Communicating', 'Sharing results through words, tables, graphs and diagrams.'),
        p('Other skills are hypothesising, controlling variables, experimenting and interpreting data (reading tables and graphs to find patterns).'),
        keys('Observation = what you see; inference = what you conclude from it.', 'Prediction is about the future; inference explains the present or past.', 'Measurements need a number AND a unit.'),
        remember('"The leaf is yellow" is an observation. "The plant did not get enough sunlight" is an inference.'),
        tip('If a statement starts with "I think…because…", it is usually an inference; if it describes what your senses tell you, it is an observation.'),
      ],
      examples: [
        ex('Imran sees footprints of a dog in wet cement. Write one observation and one inference.', ['Observation (what is seen): there are paw prints in the cement.', 'Inference (explanation): a dog walked on the cement while it was still wet.'], 'Observation: paw prints are present. Inference: a dog walked on wet cement.'),
        ex('A table shows a bean plant was 2 cm, 4 cm, 6 cm and 8 cm tall on days 1, 2, 3 and 4. Predict its height on day 5.', ['Look for a pattern: it grows 2 cm each day.', 'Day 5 = 8 + 2 = 10 cm.', 'This is a prediction based on the pattern.'], 'About 10 cm'),
      ],
      practice: [
        matchT('match', 'skill to its example', [
          ['Observing', 'Noting that a flower has five petals'], ['Classifying', 'Sorting animals into birds and mammals'], ['Measuring', 'Finding a leaf is 7 cm long'], ['Inferring', 'Wet roads mean it rained earlier'],
          ['Predicting', 'Saying the seedling will bend towards the window'], ['Communicating', 'Drawing a bar graph of results'],
        ], ['Predicting is about the future.', 'Inferring explains something already seen.']),
        mcq('obs-inf', 'Observation = senses. Inference = explanation.', [
          ['Which is an OBSERVATION?', 'The milk smells sour', ['The milk has gone bad because of bacteria', 'The milk will curdle tomorrow', 'Someone left the milk out'], 'Which one uses only the senses?', 'Smelling sourness is direct use of the senses.'],
          ['Which is an INFERENCE?', 'The plant is wilting because it has not been watered', ['The plant leaves are drooping', 'The plant is 20 cm tall', 'The leaves are green'], 'Which one explains a cause?', 'Linking wilting to lack of water is an explanation — an inference.'],
          ['Which is a PREDICTION?', 'Seeds kept in a dry box will not sprout', ['The seeds are brown', 'The seeds weigh 5 g', 'The seeds were bought yesterday'], 'Which one is about the future?', 'A statement about what will happen is a prediction.'],
          ['Grouping leaves into simple and compound leaves is…', 'Classifying', ['Measuring', 'Predicting', 'Inferring'], 'Sorting into groups.', 'Sorting by shared features is classifying.'],
          ['Which statement is a correct MEASUREMENT?', 'The leaf is 8 cm long', ['The leaf is long', 'The leaf is 8 long', 'The leaf is very big'], 'A measurement needs a number and a unit.', 'Only "8 cm" gives both a number and a unit.'],
        ]),
        tp('predict', (r) => {
          const start = r.int(2, 6), step = r.pick([2, 3, 4, 5]), day = r.pick([5, 6, 7]);
          const vals = [0, 1, 2, 3].map((i) => start + step * i);
          const ans = start + step * (day - 1);
          return numQ(`A seedling's height on days 1 to 4 was ${vals.join(' cm, ')} cm. If the pattern continues, predict its height in cm on day ${day}. (Type the number only.)`, ans, undefined,
            ['Find how much it grows each day.', `It grows ${step} cm per day; count on from day 4.`],
            [`Growth per day = ${step} cm`, `Day ${day} = ${vals[3]} + ${step} × ${day - 4} = ${ans} cm`],
            [{ when: String(vals[3] + step), explain: `That is day 5. Keep adding ${step} cm until day ${day}.` }], 0.001);
        }, 2),
        tapT('tap-obs', 'Tap every statement that is an OBSERVATION (not an inference or prediction).', [
          ['The frog is green with dark spots', true], ['The water is warm to touch', true], ['The ant is carrying a grain of rice', true], ['The leaf has a hole in it', true],
          ['A caterpillar ate the leaf', false], ['It will rain this evening', false], ['The frog is hungry', false],
        ], ['Observations describe only what the senses tell you.', 'Guessing a cause or the future goes beyond observation.'], 'Colour, warmth, what an ant carries and a hole are seen directly; who ate the leaf, rain later and hunger are inferences or predictions.'),
      ],
    },
    {
      id: 'ts8.bs.sci.safety', title: 'Reading, writing and safety in science', prereqs: ['ts8.bs.sci.method'],
      intro: [
        h('Working like a scientist — safely'),
        photo('⚠️', 'A school laboratory has burners, glassware and chemicals. Following simple rules keeps everyone safe.'),
        p('Scientists read a great deal: books, journals and the reports of other scientists. They also write carefully — a lab record notes the aim, materials, procedure, observations, result and conclusion of every experiment, so anyone can repeat it.'),
        def('Lab record', 'A written report of an experiment with its aim, materials, procedure, observations (often in a table), result and conclusion.'),
        h('Safety rules in the lab'),
        stepsB('Read the procedure fully before you begin, and follow your teacher’s instructions.', 'Never taste, smell directly or touch chemicals; waft smells towards your nose with your hand.', 'Wear an apron and tie back long hair; keep the work table clean and dry.', 'Point test tubes away from yourself and others when heating.', 'Handle glassware, blades and burners carefully; report any breakage or cut immediately.', 'Wash your hands after the experiment and dispose of waste as instructed.'),
        keys('Read before you do; record as you go.', 'Observations go in a table with units.', 'Never taste or directly smell chemicals.', 'Report every accident at once, however small.'),
        remember('Honesty is the first rule of science writing: record what you actually saw, even if it is not what you expected.'),
        tip('Write observations immediately. Memory forgets details; your notebook does not.'),
      ],
      examples: [
        ex('Diya is heating water in a test tube. Her friend is standing in front of her. What should she do?', ['A heated test tube can spurt hot liquid.', 'The mouth of the tube must point away from people.', 'She should turn the tube to point at an empty wall and use a holder.'], 'Point the tube away from everyone and hold it with a test-tube holder.'),
        ex('Arrange the parts of a lab record: conclusion, aim, observations, procedure, materials.', ['First state what you want to find (aim).', 'List what you need (materials), then how you did it (procedure).', 'Record what happened (observations), then what it means (conclusion).'], 'Aim → materials → procedure → observations → conclusion'),
      ],
      practice: [
        orderT('order-record', 'Arrange the parts of a lab record in order.', ['Aim', 'Materials required', 'Procedure', 'Observations', 'Result and conclusion'], ['Start with what you want to find out.', 'The conclusion comes last.'], 'A record moves from the aim, through what and how, to what was seen and what it means.'),
        tapT('tap-safe', 'Tap every SAFE laboratory practice.', [
          ['Wafting a smell towards your nose with your hand', true], ['Pointing a heated test tube away from people', true], ['Telling the teacher about a small cut at once', true], ['Washing hands after the experiment', true], ['Reading the procedure before starting', true],
          ['Tasting a chemical to identify it', false], ['Running in the laboratory', false], ['Putting a hot test tube on the wooden table', false],
        ], ['Think: could this hurt you or someone nearby?', 'Never taste chemicals.'], 'Safe habits protect you and others; tasting chemicals, running and placing hot glass on wood are dangerous.'),
        mcq('safety', 'Ask what keeps everyone safe and the record honest.', [
          ['How should you smell a gas or liquid in the lab?', 'Waft the vapour gently towards your nose with your hand', ['Put your nose right over it', 'Taste it first', 'Never notice smells'], 'Direct sniffing can harm your nose and lungs.', 'Wafting brings only a small amount of vapour to your nose.'],
          ['A glass beaker breaks on the floor. What should you do?', 'Tell the teacher and let it be cleared safely', ['Pick up pieces with bare hands', 'Kick it under the table', 'Ignore it'], 'Broken glass cuts.', 'The teacher will have it swept up safely; never use bare hands.'],
          ['In a lab record, observations are best written…', 'In a table, with units, as soon as they are made', ['From memory a week later', 'Only if they match the hypothesis', 'Without units'], 'Accuracy and honesty.', 'Prompt, tabulated records with units are accurate and honest.'],
          ['Why do scientists read reports by other scientists?', 'To learn what is already known and build on it', ['To copy their results', 'To find mistakes only', 'Because it is required by law'], 'No one starts from zero.', 'Reading lets scientists build on earlier work.'],
          ['What should you do with a result that does not match your hypothesis?', 'Record it honestly', ['Change the numbers', 'Leave it out', 'Repeat until you get what you want and hide the rest'], 'Science depends on honesty.', 'All results must be recorded truthfully.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Cell: The Basic Unit of Life
// =====================================================================================
const ch2: USpec = {
  id: 'ts8.bs.ch2', subject: 'biology', title: 'Cell — The Basic Unit of Life', source: src(2),
  objectives: [
    {
      id: 'ts8.bs.cell.discovery', title: 'Discovery of the cell and the microscope', prereqs: [],
      intro: [
        h('Tiny boxes in a slice of cork'),
        photo('🔬', 'A compound microscope uses two lenses — the eyepiece and the objective — to make tiny things look hundreds of times bigger.'),
        p('Most cells are too small to see with the naked eye. Their discovery had to wait for the microscope. In 1665 the English scientist Robert Hooke looked at a thin slice of cork through a microscope he built. He saw tiny box-like compartments, like the rooms of a honeycomb, and called them "cells" (from a Latin word for small room).'),
        p('Hooke was really seeing the empty walls of dead cork cells. A few years later the Dutch shopkeeper Antonie van Leeuwenhoek, using tiny lenses he ground himself, became the first person to see LIVING cells — bacteria, protozoa and sperm — swimming in a drop of water.'),
        def('Cell', 'The basic structural and functional unit of every living thing. All life activities happen inside cells.'),
        def('Magnification', 'How many times bigger an object looks through a microscope. Total magnification = eyepiece magnification × objective magnification.'),
        stepsB('1665 — Robert Hooke sees and names cells in cork.', '1674 — Leeuwenhoek sees living single-celled organisms.', '1831 — Robert Brown discovers the nucleus.', '1838–39 — Schleiden (plants) and Schwann (animals) show all living things are made of cells.', '1855 — Rudolf Virchow states that new cells come only from existing cells.'),
        keys('Cells were discovered by Robert Hooke (1665) in cork.', 'Leeuwenhoek first observed living cells.', 'Total magnification = eyepiece × objective.', 'Real size = image size ÷ magnification.'),
        remember('Cell theory: all living things are made of cells; the cell is the basic unit of life; new cells come from existing cells.'),
        tip('To prepare an onion peel slide: peel a thin layer, place it in a drop of water on a slide, add a drop of stain, cover gently with a coverslip to avoid air bubbles.'),
      ],
      examples: [
        ex('A microscope has a 10× eyepiece and a 40× objective. What is the total magnification?', ['Total magnification = eyepiece × objective', '= 10 × 40', '= 400'], '400×'),
        ex('Through a 100× microscope a cell looks 5 mm wide. How wide is it really, in micrometres (1 mm = 1000 µm)?', ['Real size = image size ÷ magnification', '5 mm ÷ 100 = 0.05 mm', '0.05 × 1000 = 50 µm'], '50 µm'),
      ],
      practice: [
        mcq('history', 'Recall who saw what, and when.', [
          ['Who first observed and named cells?', 'Robert Hooke', ['Robert Brown', 'Charles Darwin', 'Louis Pasteur'], 'He looked at cork in 1665.', 'Robert Hooke named cells after seeing cork compartments.'],
          ['Robert Hooke observed cells in a thin slice of…', 'Cork', ['Onion', 'Human cheek', 'Pond water'], 'It comes from the bark of a tree.', 'Hooke examined cork, which is made of dead cells.'],
          ['Who was the first to see LIVING cells such as bacteria?', 'Antonie van Leeuwenhoek', ['Robert Hooke', 'Theodor Schwann', 'Rudolf Virchow'], 'He ground his own lenses.', 'Leeuwenhoek saw living microbes in water drops.'],
          ['Who discovered the nucleus?', 'Robert Brown', ['Robert Hooke', 'Matthias Schleiden', 'Edward Jenner'], 'Year 1831.', 'Robert Brown described the nucleus in 1831.'],
          ['Who stated that new cells arise only from existing cells?', 'Rudolf Virchow', ['Robert Hooke', 'Leeuwenhoek', 'Alexander Fleming'], 'Year 1855.', 'Virchow added this idea to cell theory.'],
          ['Which instrument made the discovery of cells possible?', 'Microscope', ['Telescope', 'Thermometer', 'Stethoscope'], 'Cells are too small to see with the eye.', 'Only a microscope can magnify cells enough to be seen.'],
        ]),
        tp('mag', (r) => {
          const e = r.pick([5, 10, 15]), o = r.pick([4, 10, 40, 45, 100]);
          return numQ(`${who(r)} uses a microscope with a ${e}× eyepiece and a ${o}× objective lens. What is the total magnification? (Type the number only.)`, e * o, undefined,
            ['Total magnification = eyepiece × objective.', `Multiply ${e} by ${o}.`],
            [`${e} × ${o} = ${e * o}`, `The object looks ${e * o} times bigger.`],
            [{ when: String(e + o), explain: 'Magnifications multiply, they do not add.' }], 0.001);
        }, 2),
        tp('real', (r) => {
          const mag = r.pick([100, 200, 400, 1000]), real = r.pick([10, 20, 25, 50, 80, 100]);
          const img = rd(real * mag / 1000, 3);
          return numQ(`A cell seen through a ${mag}× microscope appears ${img} mm wide. What is its real width in µm? (1 mm = 1000 µm; type the number only.)`, real, undefined,
            ['Real size = image size ÷ magnification.', 'Then multiply mm by 1000 to get µm.'],
            [`${img} ÷ ${mag} = ${rd(img / mag, 6)} mm`, `${rd(img / mag, 6)} mm × 1000 = ${real} µm`],
            [{ when: String(rd(img / mag, 6)), explain: 'That is in mm. Multiply by 1000 to change to µm.' }]);
        }, 3),
        orderT('order-slide', 'Put the steps of making an onion peel slide in order.', [
          'Peel a thin transparent layer from an onion scale', 'Place it in a drop of water on a clean slide', 'Add a drop of stain such as safranin or iodine', 'Lower a coverslip gently without trapping air bubbles', 'Observe under low power, then high power',
        ], ['You need the peel before you can put it on a slide.', 'The coverslip goes on before you look.'], 'Peel, mount in water, stain, cover, then observe.'),
      ],
    },
    {
      id: 'ts8.bs.cell.parts', title: 'Parts of a cell: plant and animal cells', prereqs: ['ts8.bs.cell.discovery'],
      intro: [
        h('What is inside a cell?'),
        photo('🧅', 'Onion peel cells look like neat bricks with a dark dot in each — the dot is the nucleus and the brick outline is the cell wall.'),
        p('Almost every cell has three basic parts: a thin outer covering called the cell membrane, a jelly-like cytoplasm inside it, and a nucleus that controls the cell.'),
        def('Cell membrane (plasma membrane)', 'The thin, flexible outer boundary of a cell. It lets some substances in and out and stops others.'),
        def('Cytoplasm', 'The jelly-like substance between the membrane and the nucleus, in which the small structures (organelles) are found.'),
        def('Nucleus', 'The control centre of the cell. It contains chromosomes, which carry genes that pass characters from parents to offspring.'),
        def('Cell wall', 'A tough layer outside the cell membrane in plant cells, made of cellulose. It gives shape and protection.'),
        def('Plastids', 'Organelles found in plant cells. Green plastids (chloroplasts) contain chlorophyll and make food.'),
        def('Vacuole', 'A sac filled with cell sap. Plant cells have one large vacuole; animal cells have small ones or none.'),
        p('Labelled parts of a plant cell: cell wall · cell membrane · cytoplasm · nucleus · chloroplast · large vacuole. Labelled parts of an animal cell (cheek cell): cell membrane · cytoplasm · nucleus · small vacuoles.'),
        keys('All cells: membrane, cytoplasm, nucleus (except some bacteria).', 'Only plant cells: cell wall, chloroplasts, large central vacuole.', 'Nucleus = control centre; chromosomes = carriers of genes.'),
        remember('Bacterial cells have no well-defined nucleus; their genetic material lies in the cytoplasm without a nuclear membrane (prokaryotic cells).'),
        tip('Wall, chloroplast, big vacuole: "W-C-V" are the three plant-only extras.'),
      ],
      examples: [
        ex('A student sees cells with a thick outline, green bodies and a big clear space. Plant or animal?', ['Thick outline = cell wall (plants).', 'Green bodies = chloroplasts (plants).', 'Big clear space = large vacuole (plants).'], 'Plant cell, probably from a leaf'),
        ex('Why do cheek cells not have a regular box shape like onion cells?', ['Onion cells have a stiff cell wall that holds a fixed shape.', 'Cheek cells have only a flexible membrane.', 'So they are irregular and flat.'], 'Animal cells lack a rigid cell wall.'),
      ],
      practice: [
        mcq('parts', 'Recall what each part does and where it is found.', [
          ['Which part controls all activities of the cell?', 'Nucleus', ['Cytoplasm', 'Vacuole', 'Cell wall'], 'It is called the control centre.', 'The nucleus directs the activities of the cell.'],
          ['Which part is found in plant cells but NOT in animal cells?', 'Cell wall', ['Cell membrane', 'Nucleus', 'Cytoplasm'], 'It is made of cellulose.', 'Only plant cells have a cellulose cell wall.'],
          ['The green pigment chlorophyll is found in…', 'Chloroplasts', ['Nucleus', 'Vacuole', 'Cell membrane'], 'They are a kind of plastid.', 'Chloroplasts contain chlorophyll for making food.'],
          ['Genes are found on…', 'Chromosomes in the nucleus', ['The cell wall', 'Vacuoles', 'The cell membrane'], 'They carry characters from parents.', 'Chromosomes inside the nucleus carry genes.'],
          ['The jelly-like substance inside the cell membrane is…', 'Cytoplasm', ['Cell sap', 'Cellulose', 'Chlorophyll'], 'Organelles float in it.', 'Cytoplasm fills the cell around the nucleus.'],
          ['Which cells have no well-defined nuclear membrane?', 'Bacteria', ['Onion cells', 'Cheek cells', 'Nerve cells'], 'They are prokaryotes.', 'Bacterial genetic material is not enclosed by a nuclear membrane.'],
        ]),
        tapT('tap-plant', 'Tap every part found in a typical PLANT cell.', [
          ['Cell wall', true], ['Chloroplast', true], ['Large vacuole', true], ['Nucleus', true], ['Cell membrane', true], ['Cytoplasm', true],
          ['Bone', false], ['Blood', false],
        ], ['Plant cells have all the basic parts plus some extras.', 'Bone and blood are animal tissues, not cell parts.'], 'Plant cells have a wall, membrane, cytoplasm, nucleus, chloroplasts and a large vacuole.'),
        matchT('match', 'cell part to its job', [
          ['Cell membrane', 'Controls what enters and leaves'], ['Cell wall', 'Gives shape and protection to plant cells'], ['Nucleus', 'Controls cell activities'], ['Chloroplast', 'Makes food using sunlight'], ['Vacuole', 'Stores cell sap'], ['Cytoplasm', 'Holds the organelles'],
        ], ['Chloroplast = green = food.', 'The membrane is a gatekeeper.']),
        mcq('compare', 'Think of the W-C-V extras of plant cells.', [
          ['A cell with no cell wall and small vacuoles is most likely from…', 'An animal', ['A leaf', 'An onion', 'A cork'], 'Which cells lack walls?', 'Animal cells have no wall and small vacuoles.'],
          ['Why do onion peel cells lack chloroplasts even though onion is a plant?', 'They grow underground away from light', ['They are animal cells', 'They are dead', 'They have no nucleus'], 'Chloroplasts are needed where light falls.', 'Underground parts like onion bulbs do not make food, so they lack chloroplasts.'],
          ['A cell that is box-shaped with a rigid boundary is likely a…', 'Plant cell', ['Cheek cell', 'Blood cell', 'Nerve cell'], 'Rigidity comes from the wall.', 'The cell wall keeps plant cells in a fixed shape.'],
          ['Which part is common to both plant and animal cells?', 'Nucleus', ['Cell wall', 'Chloroplast', 'Large central vacuole'], 'It is the control centre.', 'Both plant and animal cells have a nucleus.'],
          ['Which stain is commonly used for onion peel and makes cell walls clearly visible?', 'Safranin', ['Salt', 'Sugar solution', 'Lime water'], 'It is a red stain.', 'Safranin stains plant cell walls red.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.cell.diversity', title: 'Diversity in cells: number, shape and size', prereqs: ['ts8.bs.cell.parts'],
      intro: [
        h('Cells of every shape and size'),
        photo('🥚', 'An ostrich egg (with its yolk) is the largest single cell known, about 15 cm long. Most bacteria are only 1 to 2 µm long.'),
        p('Cells vary greatly in NUMBER, SHAPE and SIZE, and each is suited to the work it does.'),
        def('Unicellular organism', 'An organism made of only one cell, which does every life activity, e.g. Amoeba, Paramecium, Chlamydomonas, bacteria.'),
        def('Multicellular organism', 'An organism made of many cells that divide up the work, e.g. a neem tree, a cow, a human being.'),
        h('Shape suits function'),
        p('Red blood cells are round and disc-shaped so they can flow easily through narrow blood vessels. Nerve cells are long and branched to carry messages over long distances. Muscle cells are long and spindle-shaped so they can contract. Amoeba has no fixed shape; it pushes out finger-like pseudopodia to move and catch food. Guard cells of a leaf are bean-shaped to open and close the pores.'),
        h('Size'),
        p('Size is measured in micrometres (1 µm = one-thousandth of a millimetre). The smallest cells (some bacteria, called mycoplasma) are about 0.1 µm; a human red blood cell is about 7 µm; the longest cells in our body are nerve cells, which can be about a metre long.'),
        keys('Number: unicellular or multicellular.', 'Shape is related to function.', 'Size: from about 0.1 µm (mycoplasma) to about 15 cm (ostrich egg).', 'Bigger organisms have MORE cells, not bigger cells.'),
        remember('In a multicellular organism, groups of similar cells form tissues, tissues form organs, organs form organ systems.'),
        tip('1 mm = 1000 µm. To compare sizes, put both in the same unit first.'),
      ],
      examples: [
        ex('An elephant is much bigger than a mouse. Are an elephant’s cells bigger?', ['Cells of similar types are roughly the same size in both.', 'The elephant simply has many more cells.', 'Size of an organism depends on cell number.'], 'No — the elephant has more cells, not bigger ones.'),
        ex('A red blood cell is about 7 µm across. How many would fit side by side in 1 mm?', ['1 mm = 1000 µm', '1000 ÷ 7 ≈ 142.9', 'About 142 whole cells fit.'], 'About 142 cells'),
      ],
      practice: [
        matchT('match', 'cell to the shape that suits its job', [
          ['Nerve cell', 'Long and branched to carry messages'], ['Red blood cell', 'Disc-shaped to flow through vessels'], ['Muscle cell', 'Spindle-shaped to contract'], ['Amoeba', 'No fixed shape; forms pseudopodia'], ['Guard cell', 'Bean-shaped to open and close stomata'],
        ], ['Ask: what job does each cell do?', 'Nerve cells reach from the spinal cord to the toes.']),
        mcq('diversity', 'Think about number, shape and size separately.', [
          ['Which of these is unicellular?', 'Paramecium', ['Earthworm', 'Mango tree', 'Frog'], 'Single-celled, slipper-shaped.', 'Paramecium is a single cell that does all life processes.'],
          ['The largest single cell known is…', 'The ostrich egg', ['A nerve cell', 'A red blood cell', 'A bacterium'], 'It includes the yolk.', 'The ostrich egg is the largest known single cell.'],
          ['The longest cell in the human body is the…', 'Nerve cell', ['Red blood cell', 'Skin cell', 'Egg cell'], 'It can be about a metre long.', 'Nerve cells run long distances to carry messages.'],
          ['Which organism changes its shape constantly?', 'Amoeba', ['Paramecium', 'Hen', 'Bacteria shaped like rods'], 'It forms "false feet".', 'Amoeba moves by pseudopodia and has no fixed shape.'],
          ['Why is a nerve cell long and branched?', 'To carry messages over long distances', ['To store food', 'To carry oxygen', 'To make food'], 'Its job is communication.', 'A long, branched shape helps carry signals between distant body parts.'],
          ['An elephant is bigger than an ant mainly because it has…', 'Many more cells', ['Bigger cells', 'Fewer cells', 'No nucleus in its cells'], 'Cell size is similar in both.', 'Larger organisms have more cells, not larger ones.'],
        ]),
        tp('fit', (r) => {
          const s = r.pick([2, 4, 5, 8, 10, 20, 25, 40, 50]);
          const mm = r.pick([1, 2, 5]);
          const ans = mm * 1000 / s;
          return numQ(`A type of cell is ${s} µm wide. How many such cells could be placed side by side along a ${mm} mm line? (1 mm = 1000 µm)`, ans, undefined,
            ['Change mm to µm first.', `${mm} mm = ${mm * 1000} µm; divide by ${s}.`],
            [`${mm} mm = ${mm * 1000} µm`, `${mm * 1000} ÷ ${s} = ${ans} cells`],
            [{ when: String(rd(mm / s, 4)), explain: 'You forgot to change mm into µm before dividing.' }], 0.001);
        }, 2),
        tapT('tap-uni', 'Tap every UNICELLULAR organism.', [
          ['Amoeba', true], ['Paramecium', true], ['Chlamydomonas', true], ['Bacteria', true], ['Yeast', true],
          ['Hydra', false], ['Spirogyra filament', false], ['Earthworm', false],
        ], ['Unicellular = whole organism is one cell.', 'Hydra and earthworm have many cells.'], 'Amoeba, Paramecium, Chlamydomonas, bacteria and yeast are single cells; Hydra, Spirogyra and earthworm are multicellular.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — The World of Microorganisms
// =====================================================================================
const ch3: USpec = {
  id: 'ts8.bs.ch3', subject: 'biology', title: 'The World of Microorganisms', source: src(3),
  objectives: [
    {
      id: 'ts8.bs.microbe.groups', title: 'Discovering microbes and their groups', prereqs: ['ts8.bs.cell.discovery'],
      intro: [
        h('A hidden world in a drop of water'),
        photo('💧', 'A single drop of pond water seen under a microscope is full of tiny swimming and drifting living things.'),
        p('Microorganisms (microbes) are living things so small that they can be seen only through a microscope. Leeuwenhoek first saw them in the 1670s and called them "animalcules". They live everywhere — in soil, water, air, inside our intestines, on our skin and even in hot springs and ice.'),
        def('Microorganism', 'A living organism too small to be seen with the naked eye. Most are single-celled; some (like many fungi and algae) form groups of cells.'),
        h('The main groups'),
        def('Bacteria', 'Single-celled microbes without a proper nucleus. Shapes: rod (bacillus), round (coccus), spiral (spirillum), comma (vibrio). Example: Lactobacillus in curd.'),
        def('Fungi', 'Microbes that cannot make their own food and often grow as threads. Examples: yeast, bread mould (Rhizopus), Penicillium. (Mushrooms are large fungi.)'),
        def('Algae', 'Simple plant-like organisms with chlorophyll that make their own food. Examples: Chlamydomonas, Spirogyra (green scum in ponds).'),
        def('Protozoa', 'Single-celled animal-like microbes, e.g. Amoeba, Paramecium, Plasmodium (causes malaria).'),
        def('Viruses', 'Extremely tiny particles that can multiply ONLY inside a living cell of a host. Outside a cell they behave like non-living particles. Examples: viruses that cause common cold, polio, measles.'),
        keys('Five groups: bacteria, fungi, algae, protozoa, viruses.', 'Viruses reproduce only inside host cells.', 'Algae make their own food; fungi do not.'),
        remember('Viruses are much smaller than bacteria and can be seen only with an electron microscope.'),
        tip('"Algae are green; fungi are not; protozoa move like animals; bacteria are tiny with no nucleus; viruses need a host."'),
      ],
      examples: [
        ex('Green slippery threads grow in a village pond in summer. Which group of microbe is this most likely?', ['They are green, so they have chlorophyll.', 'They form threads in water.', 'Spirogyra is a thread-like green alga.'], 'Algae (e.g. Spirogyra)'),
        ex('Why is a virus said to be on the border of living and non-living?', ['Outside a host cell it shows no life activity and can even form crystals.', 'Inside a host cell it multiplies.', 'So it shows features of both.'], 'It multiplies only inside living cells.'),
      ],
      practice: [
        matchT('match', 'microbe to its group', [
          ['Lactobacillus', 'Bacteria'], ['Yeast', 'Fungi'], ['Spirogyra', 'Algae'], ['Amoeba', 'Protozoa'], ['Polio virus', 'Viruses'], ['Bread mould (Rhizopus)', 'Fungi'],
        ], ['Green and food-making → algae.', 'Moving, animal-like single cell → protozoa.'], 4),
        mcq('groups', 'Recall the special feature of each group.', [
          ['Which microbes multiply ONLY inside the cells of a host?', 'Viruses', ['Bacteria', 'Algae', 'Fungi'], 'They are the smallest.', 'Viruses use the host cell’s machinery to multiply.'],
          ['Which group of microbes contains chlorophyll?', 'Algae', ['Fungi', 'Viruses', 'Protozoa'], 'They make their own food.', 'Algae are plant-like and photosynthesise.'],
          ['Plasmodium, which causes malaria, is a…', 'Protozoan', ['Virus', 'Bacterium', 'Fungus'], 'It is a single-celled animal-like microbe.', 'Plasmodium belongs to the protozoa.'],
          ['Who first observed microbes, calling them "animalcules"?', 'Antonie van Leeuwenhoek', ['Louis Pasteur', 'Edward Jenner', 'Alexander Fleming'], 'He made his own lenses.', 'Leeuwenhoek first described microbes in the 1670s.'],
          ['Rod-shaped bacteria are called…', 'Bacilli', ['Cocci', 'Spirilla', 'Vibrios'], 'Bacillus means "little rod".', 'Rod-shaped bacteria are bacilli; round ones are cocci.'],
          ['Which of these is a fungus?', 'Penicillium', ['Chlamydomonas', 'Paramecium', 'Lactobacillus'], 'Blue-green mould on oranges.', 'Penicillium is a mould (fungus).'],
        ]),
        tapT('tap-where', 'Tap every place where microorganisms can live.', [
          ['Soil', true], ['Pond water', true], ['Inside our intestines', true], ['On our skin', true], ['Hot springs', true], ['Air', true],
          ['Inside a sealed, sterilised (germ-free) can', false], ['Inside freshly boiled and sealed water', false],
        ], ['Microbes are found almost everywhere.', 'Sterilising (killing all germs) and sealing keeps them out.'], 'Microbes live in soil, water, air, inside and on our bodies and even in hot springs; sterilising and sealing removes them.'),
      ],
    },
    {
      id: 'ts8.bs.microbe.useful', title: 'Useful microbes: food, antibiotics and vaccines', prereqs: ['ts8.bs.microbe.groups'],
      intro: [
        h('Tiny helpers in the kitchen and the clinic'),
        photo('🥛', 'A spoonful of curd added to warm milk is enough to turn the whole pot into curd overnight. The worker is a bacterium, Lactobacillus.'),
        p('Many microbes are our friends. Lactobacillus bacteria turn milk into curd. Yeast makes idli and dosa batter rise and bread dough fluffy; it breaks down sugar and releases carbon dioxide (this is fermentation). Microbes are used to make vinegar, cheese and alcohol, and to clean sewage.'),
        def('Fermentation', 'The breakdown of sugar into alcohol (or acid) and carbon dioxide by microbes such as yeast, without using oxygen. Discovered by Louis Pasteur in 1857.'),
        def('Antibiotic', 'A medicine made from microbes (or copies of such chemicals) that kills or stops the growth of disease-causing BACTERIA. It does not work against viruses.'),
        p('In 1928 Alexander Fleming noticed that a blue-green mould, Penicillium, had stopped bacteria from growing on one of his culture plates. From it came penicillin, the first antibiotic. Streptomycin and tetracycline are other antibiotics.'),
        def('Vaccine', 'A preparation of dead or weakened microbes that, when given, makes the body produce antibodies so that it can fight the real microbe later.'),
        p('In 1796 Edward Jenner noticed that milkmaids who had caught mild cowpox did not get smallpox. He used material from cowpox to protect people from smallpox — the first vaccine. Worldwide vaccination wiped out smallpox; it was declared eradicated in 1980.'),
        keys('Lactobacillus → curd; yeast → bread, idli, alcohol.', 'Penicillin was discovered by Fleming (1928) from Penicillium.', 'Jenner made the smallpox vaccine (1796).', 'Antibiotics work against bacteria, not viruses.'),
        remember('Take antibiotics only when a doctor prescribes them and complete the full course. Misuse helps bacteria become resistant.'),
        tip('Anti-BIO-tic = against (some) life — against bacteria. Vaccine comes from "vacca", Latin for cow (cowpox).'),
      ],
      examples: [
        ex('Idli batter left overnight rises and smells sour. Explain.', ['Microbes (yeast and bacteria) in the batter ferment the starch and sugars.', 'They release carbon dioxide gas, which makes the batter rise.', 'Acids formed make it sour.'], 'Fermentation by microbes releases CO₂ and acids.'),
        ex('Sana has a viral cold. Should she take an antibiotic?', ['Colds are caused by viruses.', 'Antibiotics act only on bacteria.', 'They will not help and may encourage resistance.'], 'No — antibiotics do not work on viruses.'),
      ],
      practice: [
        mcq('uses', 'Name the microbe and what it does.', [
          ['Which microbe turns milk into curd?', 'Lactobacillus', ['Yeast', 'Penicillium', 'Rhizobium'], 'It is a bacterium.', 'Lactobacillus converts milk sugar into lactic acid, setting curd.'],
          ['Bread dough rises because yeast releases…', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Water vapour only'], 'Bubbles of gas form.', 'Yeast fermentation produces CO₂ gas bubbles.'],
          ['Who discovered penicillin?', 'Alexander Fleming', ['Edward Jenner', 'Louis Pasteur', 'Robert Koch'], 'In 1928.', 'Fleming noticed Penicillium stopping bacterial growth.'],
          ['The first vaccine was developed against…', 'Smallpox', ['Polio', 'Malaria', 'Cholera'], 'Edward Jenner, 1796.', 'Jenner used cowpox to protect against smallpox.'],
          ['Antibiotics are effective against…', 'Bacteria', ['Viruses', 'All diseases', 'Vitamin deficiency'], 'They do not affect viruses.', 'Antibiotics kill or stop bacteria only.'],
          ['Who discovered fermentation?', 'Louis Pasteur', ['Robert Hooke', 'Edward Jenner', 'Alexander Fleming'], 'Year 1857.', 'Pasteur showed that yeast causes fermentation.'],
          ['A vaccine works by…', 'Making the body produce antibodies against a microbe', ['Killing all bacteria directly', 'Replacing blood', 'Adding vitamins'], 'It trains the body.', 'Vaccines prepare the immune system to fight a future infection.'],
        ]),
        matchT('match', 'scientist to discovery', [
          ['Alexander Fleming', 'Penicillin'], ['Edward Jenner', 'Smallpox vaccine'], ['Louis Pasteur', 'Fermentation and pasteurisation'], ['Antonie van Leeuwenhoek', 'First to see microbes'], ['Robert Hooke', 'Named the cell'],
        ], ['Jenner and cowpox.', 'Fleming and the mould.']),
        tapT('tap-useful', 'Tap every USEFUL activity of microbes.', [
          ['Setting curd', true], ['Making bread and idli rise', true], ['Making antibiotics', true], ['Making vaccines', true], ['Cleaning sewage', true], ['Making vinegar', true],
          ['Causing cholera', false], ['Spoiling food', false],
        ], ['Most microbes are harmless or helpful.', 'Disease and spoilage are harmful.'], 'Curd, bread, antibiotics, vaccines, sewage treatment and vinegar are useful; cholera and food spoilage are harmful.'),
        mcq('reason', 'Apply what you know about antibiotics and vaccines.', [
          ['Why should you finish the full course of antibiotics?', 'So that all the bacteria are killed and resistance does not develop', ['To make the medicine taste better', 'Because they are vitamins', 'To kill viruses'], 'Surviving bacteria can become resistant.', 'Stopping early lets the toughest bacteria survive and multiply.'],
          ['Smallpox no longer occurs anywhere in the world because of…', 'Worldwide vaccination', ['Antibiotics', 'Air conditioning', 'Better roads'], 'Declared eradicated in 1980.', 'Mass vaccination eradicated smallpox.'],
          ['Why does curd set faster in summer than in winter?', 'Lactobacillus multiplies faster when it is warm', ['Milk is thicker in summer', 'Cows give different milk', 'The sun adds acid'], 'Microbes like warmth.', 'Warmth speeds up bacterial growth and fermentation.'],
          ['Why are babies given polio drops?', 'To give immunity against polio', ['To cure an existing cold', 'As food', 'To kill bacteria'], 'The Pulse Polio programme.', 'The oral polio vaccine protects children from polio.'],
          ['Jenner noticed that milkmaids who had caught cowpox…', 'Did not get smallpox', ['Got smallpox more often', 'Could not milk cows', 'Became immune to malaria'], 'This was the clue behind the first vaccine.', 'Cowpox infection protected them from smallpox.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.microbe.soil', title: 'Soil microbes and nitrogen fixation', prereqs: ['ts8.bs.microbe.groups'],
      intro: [
        h('Farmers’ invisible partners'),
        photo('🌱', 'Pull up a groundnut or red gram (kandi) plant gently and look at its roots: small pink-brown lumps called root nodules are home to nitrogen-fixing bacteria.'),
        p('Plants need nitrogen to make proteins. Air is about 78% nitrogen, but plants cannot use nitrogen gas directly. Certain bacteria can change atmospheric nitrogen into compounds plants can use. This is called nitrogen fixation.'),
        def('Nitrogen fixation', 'The conversion of nitrogen gas from the air into nitrogen compounds (like ammonia and nitrates) that plants can absorb.'),
        def('Rhizobium', 'A bacterium that lives in the root nodules of leguminous plants (pulses such as peas, beans, red gram, groundnut) and fixes nitrogen. The plant gives it food and shelter — both gain.'),
        p('Free-living bacteria in soil (such as Azotobacter) and blue-green algae (cyanobacteria, e.g. Anabaena in paddy fields) also fix nitrogen. Lightning fixes a little too.'),
        def('Decomposers', 'Bacteria and fungi that break down dead plants and animals into simple substances, returning nutrients to the soil and cleaning the environment.'),
        stepsB('Nitrogen gas in the air', 'is fixed by Rhizobium and soil bacteria into compounds', 'which plants absorb and use to make proteins', 'which animals get by eating plants', 'Dead remains and wastes are broken down by decomposers', 'and some bacteria return nitrogen gas to the air'),
        keys('Rhizobium lives in root nodules of legumes.', 'Blue-green algae fix nitrogen in paddy fields.', 'Decomposers recycle nutrients.', 'Crop rotation with pulses enriches the soil naturally.'),
        remember('Air contains about 78% nitrogen, yet plants cannot use it directly — they depend on nitrogen-fixing microbes.'),
        tip('Legume = pulse crop = nodules = Rhizobium = free nitrogen fertiliser.'),
      ],
      examples: [
        ex('A farmer near Nalgonda grows red gram after a paddy crop. Why does the next crop grow better?', ['Red gram is a legume.', 'Rhizobium in its root nodules fixes nitrogen into the soil.', 'The soil becomes richer in nitrogen for the next crop.'], 'Legumes enrich soil nitrogen through Rhizobium.'),
        ex('What would happen to fallen leaves in a forest if there were no decomposers?', ['Decomposers break leaves down into simple substances.', 'Without them leaves would pile up.', 'Nutrients would stay locked up and soil would become poor.'], 'Dead matter would pile up and nutrients would not return to the soil.'),
      ],
      practice: [
        mcq('nfix', 'Think of root nodules and pulses.', [
          ['Which bacterium lives in the root nodules of legumes?', 'Rhizobium', ['Lactobacillus', 'Penicillium', 'Plasmodium'], 'It fixes nitrogen.', 'Rhizobium forms nodules on legume roots and fixes nitrogen.'],
          ['Which plant has root nodules with nitrogen-fixing bacteria?', 'Groundnut', ['Paddy', 'Wheat', 'Maize'], 'It is a legume.', 'Groundnut is a legume with Rhizobium nodules.'],
          ['About what percentage of air is nitrogen?', '78%', ['21%', '1%', '50%'], 'It is the largest part of air.', 'Nitrogen makes up about 78% of air.'],
          ['Which microbes fix nitrogen in paddy fields?', 'Blue-green algae (cyanobacteria)', ['Yeast', 'Bread mould', 'Malaria parasites'], 'They grow in standing water.', 'Cyanobacteria such as Anabaena fix nitrogen in flooded fields.'],
          ['Microbes that break down dead plants and animals are called…', 'Decomposers', ['Producers', 'Parasites', 'Vectors'], 'They decompose.', 'Decomposers recycle nutrients from dead matter.'],
          ['Why can plants not use nitrogen from the air directly?', 'They cannot convert nitrogen gas into usable compounds', ['Air has no nitrogen', 'Nitrogen is poisonous', 'Leaves are closed'], 'They need help.', 'Only certain microbes can fix nitrogen gas.'],
        ]),
        orderT('order-n', 'Follow nitrogen through the cycle in order.', [
          'Nitrogen gas in the air', 'Fixed by bacteria into compounds in the soil', 'Absorbed by plant roots', 'Used to make plant proteins', 'Eaten by animals', 'Returned to soil by decomposers',
        ], ['Fixation must happen before plants can use nitrogen.', 'Decomposers act on dead remains at the end.'], 'Nitrogen moves from air to soil (fixation), into plants, into animals, and back to the soil through decomposers.'),
        tapT('tap-legume', 'Tap every LEGUME (pulse) crop that can host Rhizobium.', [
          ['Red gram (kandi)', true], ['Green gram (pesalu)', true], ['Groundnut', true], ['Bengal gram (senagalu)', true], ['Soybean', true],
          ['Paddy', false], ['Maize', false], ['Sugarcane', false],
        ], ['Legumes are pulses and beans.', 'Cereals like paddy and maize are grasses.'], 'Grams, groundnut and soybean are legumes; paddy, maize and sugarcane are not.'),
        mcq('decomp', 'Ask what decomposers and nitrogen fixers give back.', [
          ['Farmers grow pulses in between cereal crops mainly to…', 'Restore nitrogen in the soil', ['Remove all nitrogen', 'Attract pests', 'Make the soil salty'], 'Crop rotation.', 'Legumes add nitrogen through their root nodules.'],
          ['Compost is made by…', 'Microbes decomposing plant and animal waste', ['Burning leaves', 'Mixing plastic and soil', 'Adding salt to soil'], 'Decomposition.', 'Microbes break wastes into manure (compost).'],
          ['Rhizobium and legume plants both benefit. This relationship is called…', 'Symbiosis (mutual benefit)', ['Parasitism', 'Competition', 'Predation'], 'Both partners gain.', 'The plant gives food; the bacterium gives nitrogen.'],
          ['Which natural event also fixes a little nitrogen?', 'Lightning', ['Moonlight', 'Earthquakes', 'Wind'], 'It provides great energy.', 'Lightning joins nitrogen and oxygen into compounds.'],
          ['Without decomposers, the Earth would…', 'Be covered with dead remains and lose soil nutrients', ['Become cleaner', 'Have more oxygen', 'Have better crops'], 'Who cleans up?', 'Decomposers recycle dead matter into nutrients.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.microbe.harm', title: 'Harmful microbes, food poisoning and food preservation', prereqs: ['ts8.bs.microbe.useful'],
      intro: [
        h('When microbes cause trouble'),
        photo('🥫', 'Canning, pickling, drying and refrigeration all keep food safe by stopping microbes from growing in it.'),
        def('Pathogen', 'A microorganism that causes disease.'),
        p('Human diseases: cholera, typhoid and tuberculosis (bacteria); malaria (protozoan Plasmodium, spread by female Anopheles mosquito); common cold, polio, measles, chickenpox (viruses). Animal disease: anthrax (bacteria) and foot-and-mouth disease of cattle (virus). Plant diseases: citrus canker (bacteria), rust of wheat (fungus), yellow vein mosaic of bhindi (virus).'),
        def('Food poisoning', 'Illness caused by eating food spoiled by microbes or their poisons (toxins). Clostridium botulinum, for example, makes a very dangerous toxin in badly preserved food.'),
        h('Food preservation — stopping microbes from growing'),
        p('Microbes need moisture, warmth and food. Preservation removes one or more of these.'),
        stepsB('Drying / dehydration — removes water (dry fish, papads, raisins).', 'Salting — salt draws water out of microbes (pickles, salted fish, amla).', 'Sugar — jams and murabbas; sugar reduces available water.', 'Oil and vinegar — pickles; microbes cannot grow in them.', 'Heating and cooling — boiling milk; refrigeration slows microbial growth.', 'Chemical preservatives — sodium benzoate, sodium metabisulphite in squashes and jams.', 'Airtight packing and canning — keeps microbes out.'),
        def('Pasteurisation', 'Heating milk to about 70 °C for 15–30 seconds and then cooling it quickly. It kills most harmful microbes without spoiling the taste. Named after Louis Pasteur.'),
        xp({
          title: 'What if? Bacteria doubling in food left out', formula: 'N = N₀ × 2^(t ÷ g)',
          res: ['N', 'Number of bacteria', '', 'N0 * 2 ^ (t / g)', 0],
          vars: [['N0', 'Starting bacteria', '', 1, 100, 1, 10], ['t', 'Time left out', 'min', 0, 300, 10, 120], ['g', 'Doubling time', 'min', 10, 120, 5, 20]],
          notes: [
            ['t', 'Every extra doubling time doubles the bacteria — numbers explode after a few hours.', 'Eating or refrigerating food sooner keeps the numbers small.'],
            ['g', 'A longer doubling time (cold food) means much slower growth — this is why a fridge helps.', 'A shorter doubling time (warm, moist food) makes bacteria multiply very quickly.'],
            ['N0', 'More bacteria at the start means more at the end in the same proportion.', 'Clean hands and utensils start with fewer bacteria.'],
          ],
          mistakes: [['"Bacteria increase by the same amount every hour."', 'Each bacterium splits in two, so the number is MULTIPLIED by 2 each doubling time.']],
          real: 'Cooked rice left in a warm kitchen for hours can become unsafe; cooling it quickly and refrigerating it slows bacterial growth.',
        }),
        keys('Pathogens: bacteria, viruses, protozoa, fungi.', 'Carriers (vectors) like mosquitoes and houseflies spread pathogens.', 'Preservation removes water, warmth or air, or adds salt/sugar/oil/chemicals.', 'Pasteurisation: ~70 °C for 15–30 s, then rapid cooling.'),
        remember('Houseflies carry germs on their legs from garbage to uncovered food — always keep food covered.'),
        tip('Salt and sugar preserve food the same way: they pull water out of microbes, which then cannot grow.'),
      ],
      examples: [
        ex('Bacteria in milk double every 20 minutes. Starting from 50 bacteria, how many are there after 1 hour?', ['1 hour = 60 min = 3 doubling times.', 'N = 50 × 2³', '= 50 × 8 = 400'], '400 bacteria'),
        ex('Why does mango pickle in oil stay good for months while cut mango spoils in a day?', ['Cut mango is moist and sugary — ideal for microbes.', 'Pickle has lots of salt and oil.', 'Salt removes water from microbes and oil keeps air and moisture out.'], 'Salt and oil stop microbes from growing.'),
      ],
      practice: [
        matchT('match', 'disease to the microbe that causes it', [
          ['Cholera', 'Bacteria'], ['Malaria', 'Protozoa'], ['Polio', 'Virus'], ['Tuberculosis', 'Bacteria'], ['Common cold', 'Virus'], ['Rust of wheat', 'Fungus'], ['Citrus canker', 'Bacteria'],
        ], ['Malaria is caused by Plasmodium.', 'Colds and polio are viral.']),
        mcq('preserve', 'Ask what each method takes away from microbes.', [
          ['Pasteurised milk is heated to about…', '70 °C for 15–30 seconds and cooled quickly', ['100 °C for an hour', '0 °C for a day', '40 °C for a week'], 'Hot enough to kill germs, short enough to keep taste.', 'Pasteurisation uses about 70 °C briefly, then rapid cooling.'],
          ['Jams and murabbas are preserved using…', 'Sugar', ['Salt', 'Vinegar only', 'Ice'], 'They are sweet.', 'High sugar removes water that microbes need.'],
          ['Sodium benzoate is a…', 'Chemical preservative', ['Vitamin', 'Antibiotic', 'Fertiliser'], 'Used in squashes and jams.', 'Sodium benzoate stops microbial growth in food.'],
          ['Food kept in a refrigerator spoils slowly because…', 'Low temperature slows the growth of microbes', ['Cold kills all microbes', 'Fridges add salt', 'Light is absent'], 'Cold does not kill all microbes.', 'Low temperature slows microbial growth.'],
          ['Which method is used to preserve fish at the coast?', 'Salting and drying', ['Adding sugar', 'Pasteurisation', 'Painting'], 'Removes water.', 'Salt and sunlight drying remove moisture from fish.'],
          ['A dangerous food poisoning toxin is made by…', 'Clostridium botulinum', ['Lactobacillus', 'Rhizobium', 'Yeast'], 'It grows in badly canned food.', 'Clostridium botulinum produces botulinum toxin.'],
        ]),
        tp('double', (r) => {
          const g = r.pick([10, 15, 20, 30]), k = r.pick([2, 3, 4, 5]), n0 = r.pick([1, 5, 10, 20, 50]);
          const t = g * k, ans = n0 * 2 ** k;
          return numQ(`Bacteria on leftover food double every ${g} minutes. If there are ${n0} bacteria now, how many will there be after ${t} minutes?`, ans, undefined,
            [`Number of doublings = ${t} ÷ ${g}.`, 'Multiply by 2 once for every doubling.'],
            [`Doublings = ${t} ÷ ${g} = ${k}`, `N = ${n0} × 2^${k} = ${n0} × ${2 ** k} = ${ans}`],
            [{ when: String(n0 * 2 * k), explain: 'Doubling repeatedly means multiplying by 2 again and again, not multiplying by 2k.' }], 0.001);
        }, 2),
        tapT('tap-vector', 'Tap every CARRIER (vector) that can spread disease-causing microbes.', [
          ['Female Anopheles mosquito', true], ['Housefly', true], ['Aedes mosquito', true], ['Contaminated water', true],
          ['Clean boiled water', false], ['Pasteurised milk', false], ['Sunlight', false],
        ], ['Carriers move microbes from one place or person to another.', 'Boiling and pasteurising kill microbes.'], 'Mosquitoes, houseflies and contaminated water carry pathogens; boiled water and pasteurised milk are safe.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Reproduction in Animals
// =====================================================================================
const ch4: USpec = {
  id: 'ts8.bs.ch4', subject: 'biology', title: 'Reproduction in Animals', source: src(4),
  objectives: [
    {
      id: 'ts8.bs.repro.vivi', title: 'Viviparous and oviparous animals', prereqs: [],
      intro: [
        h('Born alive or hatched from eggs?'),
        photo('🐄', 'A calf is born alive from its mother. A chick hatches from an egg laid by a hen. Animals continue their kind in different ways.'),
        p('Every kind of living thing must produce young ones of its own kind, or it would die out. This is reproduction. Animals can be grouped by HOW their young ones begin life.'),
        def('Viviparous animals', 'Animals that give birth to live young ones, which develop inside the mother’s body. Examples: humans, cows, dogs, cats, goats, elephants, whales, bats.'),
        def('Oviparous animals', 'Animals that lay eggs, from which the young ones hatch outside the mother’s body. Examples: hens, crows, snakes, lizards, turtles, frogs, fish, butterflies, silkworms.'),
        p('Most mammals are viviparous; birds, reptiles, amphibians, fish and insects are mostly oviparous. A few mammals such as the platypus lay eggs, and some sharks and snakes keep eggs inside the body until they hatch.'),
        keys('Viviparous = live birth (vivi = alive).', 'Oviparous = lay eggs (ovum = egg).', 'Birds are all oviparous; most mammals are viviparous.'),
        remember('A hen’s egg has a hard shell; a frog’s eggs have no shell and are covered by jelly, so they are laid in water.'),
        tip('Ears outside and hair on the body usually mean a mammal — and usually a viviparous animal.'),
      ],
      examples: [
        ex('Classify: bat, crow, cow, snake.', ['Bat and cow are mammals that give birth to young ones → viviparous.', 'Crow (bird) and snake (reptile) lay eggs → oviparous.'], 'Viviparous: bat, cow. Oviparous: crow, snake.'),
        ex('A bat flies like a bird. Is it oviparous?', ['Bats are mammals; they have hair and feed young on milk.', 'They give birth to live young.'], 'No — bats are viviparous.'),
      ],
      practice: [
        tp('sort', (r) => {
          const V = ['Cow', 'Dog', 'Human', 'Goat', 'Elephant', 'Bat', 'Whale', 'Buffalo'];
          const O = ['Hen', 'Crow', 'Snake', 'Frog', 'Fish', 'Butterfly', 'Lizard', 'Turtle'];
          const isV = r.next() < 0.5;
          const a = r.pick(isV ? V : O);
          const wrong = r.shuffle(isV ? O : V).slice(0, 3);
          const kind = isV ? 'viviparous (gives birth to live young)' : 'oviparous (lays eggs)';
          return {
            type: 'mcq', prompt: `Which of these animals is ${kind}?`, ...choose(r, a, wrong),
            hints: ['Vivi = alive; ovi = egg.', 'Most mammals give birth; birds, reptiles, frogs, fish and insects lay eggs.'],
            mistakes: [{ when: 'wrong', explain: `Not quite. ${a} is ${isV ? 'a mammal that gives birth to live young' : 'an egg-laying animal'}.` }],
            solution: [`${a} is ${kind}.`],
          };
        }),
        tapT('tap-ovi', 'Tap every OVIPAROUS animal.', [
          ['Hen', true], ['Frog', true], ['Snake', true], ['Butterfly', true], ['Fish', true], ['Turtle', true],
          ['Cow', false], ['Bat', false], ['Human', false], ['Dog', false],
        ], ['Oviparous animals lay eggs.', 'Bats are mammals, even though they fly.'], 'Hen, frog, snake, butterfly, fish and turtle lay eggs; cow, bat, human and dog give birth to live young.', 6),
        mcq('terms', 'Remember the meaning of "vivi" and "ovi".', [
          ['Animals that give birth to young ones are called…', 'Viviparous', ['Oviparous', 'Unicellular', 'Herbivorous'], '"Vivi" means alive.', 'Viviparous animals give birth to live young.'],
          ['Animals that lay eggs are called…', 'Oviparous', ['Viviparous', 'Omnivorous', 'Parasitic'], '"Ovi" means egg.', 'Oviparous animals lay eggs.'],
          ['Why are frog eggs laid in water?', 'They have no hard shell and would dry out on land', ['Water is warmer than air', 'Frogs cannot walk', 'Fish protect them'], 'Compare with a hen’s egg.', 'Jelly-covered eggs need water to stay moist.'],
          ['Which mammal lays eggs?', 'Platypus', ['Cow', 'Bat', 'Whale'], 'It lives in Australia.', 'The platypus is an egg-laying mammal.'],
          ['In viviparous animals, the young one develops…', 'Inside the mother’s body', ['Inside an eggshell outside the body', 'In soil', 'On leaves'], 'Live birth.', 'The embryo grows in the mother’s uterus.'],
        ]),
      ],
    },
    {
      id: 'ts8.bs.repro.modes', title: 'Asexual and sexual reproduction', prereqs: ['ts8.bs.repro.vivi'],
      intro: [
        h('One parent or two?'),
        photo('💧', 'In a drop of pond water an Amoeba simply splits into two; a Hydra grows a small bud that breaks away as a new Hydra.'),
        def('Asexual reproduction', 'Reproduction by a single parent without the formation or fusion of gametes. The young ones are copies of the parent.'),
        def('Binary fission', 'Asexual reproduction in which one cell divides into two daughter cells, e.g. Amoeba, Paramecium, bacteria.'),
        def('Budding', 'Asexual reproduction in which a small outgrowth (bud) develops on the parent and grows into a new individual, e.g. Hydra, yeast.'),
        def('Sexual reproduction', 'Reproduction involving two parents, in which a male gamete (sperm) and a female gamete (ovum or egg) fuse. The young ones show features of both parents.'),
        def('Gametes', 'Special reproductive cells: sperm (male) and ovum or egg (female).'),
        stepsB('Amoeba: the nucleus divides into two.', 'The cytoplasm divides.', 'Two daughter Amoebae are formed, each with a nucleus.'),
        keys('Asexual: one parent, no gametes, quick, offspring identical.', 'Sexual: two parents, gametes fuse, offspring show variation.', 'Binary fission (Amoeba) and budding (Hydra) are asexual.'),
        remember('In binary fission the number doubles every division: 1 → 2 → 4 → 8 …'),
        tip('"Bi" = two: binary fission gives two cells.'),
      ],
      examples: [
        ex('An Amoeba divides by binary fission every day. How many Amoebae after 4 days, starting from one?', ['Each day the number doubles.', '1 → 2 → 4 → 8 → 16', '= 2⁴'], '16 Amoebae'),
        ex('Why do children of the same parents look different from each other and from the parents?', ['They are produced by sexual reproduction.', 'Each child gets a different mix of features from the father’s sperm and the mother’s ovum.', 'This causes variation.'], 'Sexual reproduction mixes features of two parents, causing variation.'),
      ],
      practice: [
        mcq('modes', 'Count the parents and look for gametes.', [
          ['Hydra reproduces asexually by…', 'Budding', ['Binary fission', 'Laying eggs', 'Spores only'], 'A small outgrowth appears.', 'A bud grows on Hydra and separates as a new Hydra.'],
          ['Amoeba reproduces by…', 'Binary fission', ['Budding', 'Internal fertilisation', 'Laying eggs'], 'It splits into two.', 'Amoeba divides into two daughter cells.'],
          ['Which kind of reproduction involves fusion of a sperm and an ovum?', 'Sexual reproduction', ['Budding', 'Binary fission', 'Fragmentation'], 'Two gametes join.', 'Fusion of male and female gametes is sexual reproduction.'],
          ['Offspring that are exact copies of a single parent are produced by…', 'Asexual reproduction', ['Sexual reproduction', 'Fertilisation', 'Metamorphosis'], 'No mixing of features.', 'Asexual reproduction involves one parent and gives identical offspring.'],
          ['The male gamete is the…', 'Sperm', ['Ovum', 'Zygote', 'Embryo'], 'It swims.', 'Sperm is the male gamete; ovum is the female gamete.'],
          ['Which is an advantage of sexual reproduction?', 'It produces variation among offspring', ['It needs only one parent', 'It never needs gametes', 'It is always faster'], 'Children differ from parents.', 'Mixing features of two parents creates variation.'],
        ]),
        tp('fission', (r) => {
          const n = r.pick([3, 4, 5, 6, 7, 8]), s = r.pick([1, 2, 3]);
          return numQ(`${s === 1 ? 'One Amoeba' : `${s} Amoebae`} reproduce by binary fission. Every Amoeba divides once a day. How many Amoebae will there be after ${n} days?`, s * 2 ** n, undefined,
            ['Binary fission doubles the number each time.', `Multiply by 2, ${n} times.`],
            [`Number = ${s} × 2^${n} = ${s} × ${2 ** n} = ${s * 2 ** n}`],
            [{ when: String(s * 2 * n), explain: 'Doubling repeatedly means multiplying by 2 each day, not 2 × days.' }], 0.001);
        }, 2),
        tapT('tap-asexual', 'Tap every example of ASEXUAL reproduction.', [
          ['Amoeba splitting into two', true], ['Hydra forming a bud', true], ['Yeast forming buds', true], ['Bacteria dividing into two', true],
          ['Hen laying a fertilised egg', false], ['Birth of a calf', false], ['Frog eggs fertilised in a pond', false],
        ], ['Asexual reproduction needs only one parent.', 'Eggs and births here come from two parents.'], 'Splitting and budding need one parent; hen, cow and frog reproduce sexually.'),
      ],
    },
    {
      id: 'ts8.bs.repro.organs', title: 'Male and female reproductive systems', prereqs: ['ts8.bs.repro.modes'],
      intro: [
        h('Organs that make gametes'),
        photo('📖', 'Like the digestive system for food, the reproductive system is a set of organs that makes and carries gametes.'),
        p('In humans and other animals that reproduce sexually, special organs produce gametes. Together they form the reproductive system.'),
        def('Male reproductive organs', 'A pair of testes (which produce sperms), two sperm ducts (which carry sperms) and the penis. Each sperm is a single cell with a head, a middle piece and a tail for swimming.'),
        def('Female reproductive organs', 'A pair of ovaries (which produce ova, or eggs), two oviducts (fallopian tubes) and the uterus, where the baby develops. Usually one ovum is released from an ovary each month.'),
        p('Sperms are among the smallest cells of the body and are made in very large numbers; an ovum is much larger and is released one at a time. Both are single cells.'),
        keys('Testes → sperms; ovaries → ova.', 'Sperm ducts carry sperms; oviducts carry ova.', 'The uterus is where the embryo develops.', 'A sperm has a tail and can swim; the ovum cannot move by itself.'),
        remember('A gamete is a single cell. Even a hen’s egg yolk is one ovum cell.'),
        tip('Remember in pairs: testes ↔ ovaries (make gametes); sperm ducts ↔ oviducts (carry gametes).'),
      ],
      examples: [
        ex('Name the organ that produces the female gamete and the tube that carries it to the uterus.', ['Ova are produced in the ovaries.', 'The oviduct (fallopian tube) carries the ovum towards the uterus.'], 'Ovary; oviduct (fallopian tube)'),
        ex('Why does a sperm have a long tail?', ['The sperm must move to reach the ovum.', 'The tail lashes to push it forward.'], 'It helps the sperm swim to the ovum.'),
      ],
      practice: [
        matchT('match', 'organ to its function', [
          ['Testes', 'Produce sperms'], ['Ovaries', 'Produce ova (eggs)'], ['Sperm duct', 'Carries sperms'], ['Oviduct', 'Carries ovum; site of fertilisation'], ['Uterus', 'Where the embryo develops'],
        ], ['Testes and ovaries make gametes.', 'The uterus is where the baby grows.']),
        mcq('organs', 'Pair each male organ with its female partner organ.', [
          ['Sperms are produced in the…', 'Testes', ['Ovaries', 'Uterus', 'Oviducts'], 'Male gonads.', 'Testes are the male organs that make sperms.'],
          ['Ova are produced in the…', 'Ovaries', ['Testes', 'Uterus', 'Sperm ducts'], 'Female gonads.', 'Ovaries are the female organs that make ova.'],
          ['The baby develops in the…', 'Uterus', ['Ovary', 'Oviduct', 'Stomach'], 'Also called the womb.', 'The embryo grows in the uterus.'],
          ['Which part of a sperm helps it move?', 'Tail', ['Head', 'Nucleus', 'Middle piece only'], 'It lashes from side to side.', 'The tail propels the sperm.'],
          ['How many ova are usually released by a human ovary at one time?', 'One', ['Hundreds', 'None ever', 'Thousands'], 'About once a month.', 'Usually one ovum is released each month.'],
        ]),
        tapT('tap-female', 'Tap every FEMALE reproductive organ.', [
          ['Ovary', true], ['Oviduct (fallopian tube)', true], ['Uterus', true],
          ['Testis', false], ['Sperm duct', false], ['Penis', false],
        ], ['Female organs make and carry ova and hold the embryo.', 'Testes and sperm ducts are male.'], 'Ovaries, oviducts and uterus are female organs; testes, sperm ducts and penis are male.', 5),
      ],
    },
    {
      id: 'ts8.bs.repro.fert', title: 'Fertilisation, development and the life cycle of a frog', prereqs: ['ts8.bs.repro.organs'],
      intro: [
        h('From one cell to a whole animal'),
        photo('🐸', 'In the monsoon, the ponds of Telangana fill with frog spawn — floating masses of jelly-covered eggs that will become tadpoles and then frogs.'),
        def('Fertilisation', 'The fusion of a sperm with an ovum. It forms a single cell called the zygote, the first cell of the new individual.'),
        def('Internal fertilisation', 'Fertilisation that takes place inside the female’s body, e.g. humans, cows, dogs, hens.'),
        def('External fertilisation', 'Fertilisation that takes place outside the female’s body, usually in water, e.g. frogs and most fish. They release very large numbers of eggs and sperms because many are eaten or washed away.'),
        stepsB('Zygote divides again and again (by mitosis).', 'A ball of cells forms the embryo.', 'In humans the embryo attaches to the wall of the uterus (implantation).', 'Body parts form; the embryo becomes a foetus once its body parts can be identified.', 'The baby is born after about 9 months.'),
        h('Life cycle of a frog'),
        p('The frog shows METAMORPHOSIS — a big change in body form between the young and the adult.'),
        stepsB('Eggs (spawn) laid in water and fertilised outside', 'Tadpole hatches: lives in water, breathes by gills, has a tail', 'Hind legs appear, then front legs', 'Tail shrinks; lungs develop (froglet)', 'Adult frog lives on land and in water and breathes by lungs and skin'),
        def('Metamorphosis', 'The change of a larva into an adult with striking differences in body form, e.g. tadpole → frog, caterpillar → butterfly.'),
        keys('Sperm + ovum → zygote → embryo → foetus → baby.', 'Internal: mammals, birds. External: frogs, fish.', 'Frog: egg → tadpole → froglet → adult (metamorphosis).'),
        remember('A hen’s eggs are fertilised INSIDE the hen; the hard shell forms around the fertilised egg afterwards.'),
        tip('Animals with external fertilisation lay huge numbers of eggs — many are lost to predators and water currents.'),
      ],
      examples: [
        ex('Why does a frog lay hundreds of eggs, while a cow gives birth to one calf at a time?', ['Frog eggs are fertilised outside in water and have no protection.', 'Many are eaten or washed away.', 'Cows have internal fertilisation and the young develops safely inside.'], 'External fertilisation loses many eggs, so frogs produce many.'),
        ex('A pond animal has gills and a tail but tiny hind legs. Which stage is it?', ['Gills and tail → tadpole.', 'Legs starting → it is changing towards a frog.'], 'A tadpole in metamorphosis (with hind legs)'),
      ],
      practice: [
        orderT('order-frog', 'Arrange the life cycle of a frog in order.', [
          'Fertilised eggs in water', 'Tadpole with gills and tail', 'Tadpole with hind legs', 'Froglet with four legs and a short tail', 'Adult frog',
        ], ['Legs appear before the tail disappears.', 'Hind legs come first.'], 'Egg → tadpole → tadpole with legs → froglet → adult.'),
        mcq('fert', 'Ask WHERE the sperm and ovum meet.', [
          ['The cell formed by fusion of sperm and ovum is the…', 'Zygote', ['Embryo', 'Foetus', 'Tadpole'], 'It is the first cell of the new individual.', 'Fertilisation forms a single-celled zygote.'],
          ['Which animal shows external fertilisation?', 'Frog', ['Human', 'Cow', 'Hen'], 'Eggs and sperms meet in water.', 'Frogs release eggs and sperms into water.'],
          ['The stage of an embryo when all body parts can be identified is called a…', 'Foetus', ['Zygote', 'Gamete', 'Tadpole'], 'It comes after the embryo.', 'An embryo with recognisable body parts is a foetus.'],
          ['The fixing of the embryo to the wall of the uterus is called…', 'Implantation', ['Fertilisation', 'Metamorphosis', 'Budding'], 'It is "planted" in the uterus wall.', 'Implantation attaches the embryo to the uterus.'],
          ['The change from a tadpole to an adult frog is called…', 'Metamorphosis', ['Fertilisation', 'Binary fission', 'Implantation'], '"Meta" = change, "morph" = form.', 'Metamorphosis is a big change in body form.'],
          ['Hens show…', 'Internal fertilisation', ['External fertilisation', 'Budding', 'Binary fission'], 'The shell forms after fertilisation.', 'Fertilisation in hens takes place inside the body.'],
        ]),
        tapT('tap-ext', 'Tap every animal with EXTERNAL fertilisation.', [
          ['Frog', true], ['Toad', true], ['Rohu fish', true], ['Starfish', true],
          ['Human', false], ['Cow', false], ['Hen', false], ['Dog', false],
        ], ['External fertilisation usually happens in water.', 'Mammals and birds fertilise internally.'], 'Frogs, toads, most fish and starfish fertilise in water; mammals and birds fertilise internally.'),
        matchT('match', 'stage to its description', [
          ['Zygote', 'Single cell after fertilisation'], ['Embryo', 'Developing ball of cells'], ['Foetus', 'Embryo with recognisable body parts'], ['Tadpole', 'Larva of frog with gills'], ['Froglet', 'Young frog with a short tail'],
        ], ['The zygote is only one cell.', 'Tadpoles breathe with gills.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — The Age of Adolescence
// =====================================================================================
const ch5: USpec = {
  id: 'ts8.bs.ch5', subject: 'biology', title: 'The Age of Adolescence', source: src(5),
  objectives: [
    {
      id: 'ts8.bs.adol.changes', title: 'Changes at adolescence', prereqs: [],
      intro: [
        h('Growing from child to adult'),
        photo('🧒', 'Between about 11 and 19 years of age, the body and mind change a great deal. These changes are natural and happen to everyone, at their own pace.'),
        def('Adolescence', 'The period of life, roughly between 11 and 19 years ("teenage"), when a child grows into an adult.'),
        def('Puberty', 'The stage during adolescence when the body becomes capable of reproduction.'),
        h('Changes you may notice'),
        p('Sudden increase in height (growth spurt) — bones of the arms and legs grow longer. Change in body shape — boys’ shoulders broaden; girls’ hips widen. Voice change — the voice box (larynx) grows; in boys it can be seen as the Adam’s apple and the voice may crack before becoming deep. Sweat and oil (sebaceous) glands become more active — this can cause body odour and pimples (acne). Hair grows in new places. The mind becomes more independent and emotions can change quickly.'),
        def('Secondary sexual characteristics', 'Features that distinguish males and females at puberty but are not reproductive organs themselves — e.g. facial hair and deeper voice in boys, development of breasts in girls.'),
        p('Everyone grows at a different rate. Girls usually have their growth spurt a little earlier than boys. Height also depends on genes and on a nourishing diet.'),
        keys('Adolescence: about 11–19 years. Puberty: body becomes able to reproduce.', 'Growth spurt, voice change, active sweat and oil glands, new hair growth.', 'Each person grows at their own pace — there is no need to compare.'),
        remember('Pimples are caused by oil glands becoming more active. Washing the face gently with clean water helps; squeezing pimples can cause infection.'),
        tip('Expected full height = present height × 100 ÷ (percentage of full height reached at present age).'),
      ],
      examples: [
        ex('A boy of 11 is 120 cm tall. At 11, boys have reached about 81% of their full height. Estimate his full height.', ['Full height = present height × 100 ÷ percentage', '= 120 × 100 ÷ 81', '≈ 148 cm'], 'About 148 cm'),
        ex('Why does a boy’s voice "crack" at about 13?', ['The larynx (voice box) is growing.', 'Its muscles and vocal cords are adjusting to the new size.', 'The voice settles into a deeper tone later.'], 'The growing larynx causes temporary cracking.'),
      ],
      practice: [
        tp('height', (r) => {
          const ag = r.pick<[number, number, string]>([[9, 75, 'boys'], [10, 78, 'boys'], [11, 81, 'boys'], [12, 84, 'boys'], [13, 88, 'boys'], [9, 80, 'girls'], [10, 84, 'girls'], [11, 88, 'girls'], [12, 91, 'girls']]);
          const [age, pc, g] = ag;
          const ht = r.pick([120, 125, 130, 135, 140, 145]);
          const ans = rd(ht * 100 / pc, 0);
          return numQ(`At ${age} years, ${g} have reached about ${pc}% of their full height. ${who(r)} is ${age} and ${ht} cm tall. Estimate the full adult height in cm (nearest whole number).`, ans, undefined,
            ['Full height = present height × 100 ÷ percentage reached.', `Calculate ${ht} × 100 ÷ ${pc}.`],
            [`${ht} × 100 = ${ht * 100}`, `${ht * 100} ÷ ${pc} ≈ ${ans} cm`],
            [{ when: String(rd(ht * pc / 100, 0)), explain: 'You found the percentage OF the present height. The present height is only part of the full height, so divide by the percentage.' }], 0.01);
        }, 2),
        mcq('changes', 'Think of which body part or gland is changing.', [
          ['Adolescence is roughly the age range…', '11 to 19 years', ['1 to 5 years', '25 to 35 years', '50 to 60 years'], 'It is also called the teenage years.', 'Adolescence spans the teens, about 11–19.'],
          ['The Adam’s apple seen in boys is the…', 'Growing voice box (larynx)', ['Thyroid gland', 'Food pipe', 'A bone of the jaw'], 'It changes the voice.', 'The enlarged larynx shows as the Adam’s apple.'],
          ['Pimples at adolescence are mainly due to…', 'Increased activity of oil (sebaceous) glands', ['Eating mangoes', 'Lack of sleep only', 'Cold weather'], 'Skin glands become active.', 'More oil can block skin pores and cause acne.'],
          ['The stage when the body becomes capable of reproduction is…', 'Puberty', ['Infancy', 'Old age', 'Metamorphosis'], 'It happens during adolescence.', 'Puberty is when reproductive organs mature.'],
          ['A sudden increase in height during adolescence is called a…', 'Growth spurt', ['Growth stop', 'Metamorphosis', 'Budding'], 'Bones grow quickly.', 'Rapid growth of long bones causes the growth spurt.'],
          ['Growth of facial hair in boys is an example of…', 'A secondary sexual characteristic', ['A disease', 'An infection', 'A reproductive organ'], 'It distinguishes males from females.', 'Features like facial hair are secondary sexual characteristics.'],
        ]),
        tapT('tap-change', 'Tap every NORMAL change during adolescence.', [
          ['Increase in height', true], ['Voice becoming deeper in boys', true], ['More active sweat glands', true], ['Pimples on the face', true], ['Mood changes', true], ['Broadening of shoulders in boys', true],
          ['Losing all baby teeth at 15', false], ['Height starting to decrease', false],
        ], ['These are changes of growing up.', 'Height does not shrink in adolescence.'], 'Growth spurt, voice change, active glands, pimples, mood changes and body-shape changes are normal.', 6),
      ],
    },
    {
      id: 'ts8.bs.adol.repro', title: 'The reproductive phase, menstruation and myths', prereqs: ['ts8.bs.adol.changes'],
      intro: [
        h('A natural process'),
        photo('🌙', 'Like the phases of the moon, the menstrual cycle repeats roughly every month. It is natural, and understanding it removes fear and myths.'),
        p('After puberty, humans can reproduce. In women the reproductive phase starts at puberty (about 10–12 years) and generally lasts until about 45–50 years. In men it begins at puberty and can continue much longer.'),
        def('Menarche', 'The first menstrual flow, at puberty — usually between 10 and 12 years of age.'),
        def('Menstruation', 'The monthly flow of blood and tissue from the uterus, which happens when an ovum is not fertilised. The thickened lining of the uterus breaks down and passes out. It usually lasts about 3–5 days.'),
        def('Menopause', 'The stopping of menstruation and of ova release, usually at about 45–50 years of age.'),
        stepsB('Roughly every 28–30 days an ovary releases one ovum.', 'The lining of the uterus thickens to receive a fertilised egg.', 'If the ovum is not fertilised, the lining breaks down.', 'It flows out as menstruation, and the cycle begins again.'),
        h('Myths and facts'),
        p('Many families still follow restrictions during menstruation — keeping girls out of the kitchen, not letting them bathe, or treating them as "impure". There is no scientific basis for these beliefs. Menstruation is a healthy body process. Girls can attend school, play, bathe and eat normally. What matters is hygiene: use clean sanitary pads or cloth, change them every 4–6 hours, and dispose of them properly.'),
        keys('Menarche ~10–12 years; menopause ~45–50 years.', 'Cycle ~28–30 days; flow ~3–5 days.', 'Menstruation is natural, not impure. Hygiene is what matters.'),
        remember('Telangana schools provide sanitary napkins to girl students in many government schools — use them and talk to a trusted teacher, parent or health worker about any worry.'),
        tip('If a cycle is 28 days and a period starts on day 1, the next is expected around day 29.'),
      ],
      examples: [
        ex('If a girl’s cycle is 28 days and her period begins on 3 June, when is the next one expected?', ['Add 28 days to 3 June.', '3 + 28 = 31.', 'So around 1 July (June has 30 days).'], 'Around 1 July'),
        ex('Priya’s grandmother says she must not go to school during her period. What does science say?', ['Menstruation is a normal body process, not an illness.', 'There is no evidence it makes anyone impure or unable to study.', 'With clean pads and hygiene she can attend school normally.'], 'She can go to school; the restriction is a myth.'),
      ],
      practice: [
        mcq('facts', 'Recall the stages and their ages.', [
          ['The first menstrual flow is called…', 'Menarche', ['Menopause', 'Fertilisation', 'Puberty'], 'It is the start.', 'Menarche is the first menstruation.'],
          ['Menstruation stops permanently at about 45–50 years. This is called…', 'Menopause', ['Menarche', 'Adolescence', 'Implantation'], '"Pause" = stop.', 'Menopause marks the end of the reproductive phase in women.'],
          ['Menstruation happens when…', 'The ovum is not fertilised and the uterus lining breaks down', ['A girl eats sour food', 'A girl is ill', 'The heart pumps too fast'], 'The lining was prepared for a baby.', 'Without fertilisation the thickened lining is shed.'],
          ['The menstrual cycle is usually about…', '28–30 days', ['7 days', '1 year', '2 days'], 'Roughly a month.', 'The cycle repeats about every 28–30 days.'],
          ['Sanitary pads should be changed about every…', '4–6 hours', ['2 days', 'week', 'month'], 'Hygiene prevents infection.', 'Changing every 4–6 hours keeps the body clean and prevents infection.'],
        ]),
        tapT('tap-myth', 'Tap every statement that is a MYTH (not true).', [
          ['A menstruating girl should not enter the kitchen', true], ['Girls should not bathe during menstruation', true], ['Menstruation makes a girl impure', true], ['Girls should not play sports during periods', true],
          ['Menstruation is a natural body process', false], ['Clean pads should be changed regularly', false], ['Girls can attend school during their periods', false],
        ], ['Ask: is there any scientific evidence for this?', 'Facts are about biology and hygiene.'], 'Restrictions about kitchens, bathing, impurity and sports have no scientific basis; menstruation is natural and hygiene is what matters.'),
        tp('cycle', (r) => {
          const len = r.pick([26, 28, 29, 30, 32]), d = r.int(1, 10);
          return numQ(`A woman's menstrual cycle is ${len} days long. Her period began on day ${d} of a month (counting days continuously, not resetting at month end). On which day number is her next period expected?`, d + len, undefined,
            ['The next cycle starts one cycle length later.', `Add ${len} to ${d}.`],
            [`${d} + ${len} = ${d + len}`, `Next period expected around day ${d + len}.`],
            [{ when: String(d + len - 1), explain: 'Add the full cycle length; the new cycle begins on day start + cycle length.' }], 0.001);
        }, 2),
      ],
    },
    {
      id: 'ts8.bs.adol.hormones', title: 'Hormones and their effects', prereqs: ['ts8.bs.adol.changes'],
      intro: [
        h('Chemical messengers'),
        photo('🧪', 'Hormones are chemicals made in tiny amounts by glands. They travel in the blood and tell distant organs what to do.'),
        def('Endocrine glands', 'Ductless glands that release hormones directly into the blood, e.g. pituitary, thyroid, adrenals, pancreas, testes and ovaries.'),
        def('Hormone', 'A chemical messenger made by an endocrine gland, carried by blood to a target organ, where it controls an activity.'),
        p('The changes of adolescence are controlled by sex hormones: testosterone (made by testes in boys) and oestrogen (made by ovaries in girls). Their release is controlled by hormones from the pituitary gland at the base of the brain, sometimes called the "master gland".'),
        p('Other hormones: the thyroid (in the neck) makes thyroxine, which controls growth and the rate of body activities; it needs iodine — lack of iodine causes goitre (a swollen neck). The pancreas makes insulin, which controls blood sugar; too little causes diabetes. The adrenal glands (on top of the kidneys) make adrenaline, which prepares the body for emergencies — fast heartbeat when you are frightened or angry. The pituitary also makes growth hormone; too little in childhood leads to dwarfism.'),
        keys('Testosterone (testes) and oestrogen (ovaries) bring about adolescent changes.', 'Pituitary = master gland.', 'Thyroxine needs iodine — goitre if lacking.', 'Insulin controls blood sugar — diabetes if lacking.', 'Adrenaline handles stress and emergencies.'),
        remember('Using iodised salt at home prevents goitre.'),
        tip('Endocrine = "inside" secretion: no ducts, straight into the blood.'),
      ],
      examples: [
        ex('Arjun’s heart beats fast and he breathes quickly when a dog chases him. Which hormone is acting?', ['A frightening emergency.', 'Adrenal glands release adrenaline.', 'It speeds up heartbeat and breathing to supply more oxygen to muscles.'], 'Adrenaline'),
        ex('In some hilly regions people developed swollen necks. What was missing in their diet?', ['A swollen neck is goitre — the thyroid enlarges.', 'The thyroid needs iodine to make thyroxine.', 'Hilly soils and water can be poor in iodine.'], 'Iodine (now supplied through iodised salt)'),
      ],
      practice: [
        matchT('match', 'gland to its hormone', [
          ['Testes', 'Testosterone'], ['Ovaries', 'Oestrogen'], ['Thyroid', 'Thyroxine'], ['Pancreas', 'Insulin'], ['Adrenal', 'Adrenaline'], ['Pituitary', 'Growth hormone'],
        ], ['Thyroid → thyroxine (similar names).', 'Insulin controls sugar.']),
        mcq('effects', 'Link each hormone to what it controls.', [
          ['Which hormone brings about changes like deep voice and facial hair in boys?', 'Testosterone', ['Oestrogen', 'Insulin', 'Thyroxine'], 'Made by the testes.', 'Testosterone causes male secondary sexual characteristics.'],
          ['Which hormone controls changes in girls at puberty?', 'Oestrogen', ['Testosterone', 'Adrenaline', 'Insulin'], 'Made by the ovaries.', 'Oestrogen causes female secondary sexual characteristics.'],
          ['Lack of insulin causes…', 'Diabetes', ['Goitre', 'Dwarfism', 'Night blindness'], 'Blood sugar rises.', 'Without enough insulin, blood sugar stays high — diabetes.'],
          ['Goitre is caused by lack of…', 'Iodine', ['Iron', 'Calcium', 'Vitamin C'], 'Thyroxine needs it.', 'Iodine deficiency enlarges the thyroid (goitre).'],
          ['Which gland is called the "master gland"?', 'Pituitary', ['Thyroid', 'Pancreas', 'Adrenal'], 'It is at the base of the brain.', 'The pituitary controls many other glands.'],
          ['Endocrine glands release hormones into…', 'The blood', ['The stomach', 'The air', 'The urine directly'], 'They have no ducts.', 'Ductless glands pour hormones straight into the blood.'],
        ]),
        tapT('tap-endo', 'Tap every ENDOCRINE (hormone-making) gland.', [
          ['Pituitary', true], ['Thyroid', true], ['Adrenal', true], ['Pancreas', true], ['Ovary', true], ['Testis', true],
          ['Lungs', false], ['Heart', false], ['Stomach', false],
        ], ['Endocrine glands make hormones.', 'Lungs and heart are organs with other jobs.'], 'Pituitary, thyroid, adrenals, pancreas, ovaries and testes make hormones.', 6),
      ],
    },
    {
      id: 'ts8.bs.adol.health', title: 'Child marriage and adolescent health', prereqs: ['ts8.bs.adol.repro'],
      intro: [
        h('Taking care of yourself'),
        photo('🍎', 'A growing body needs good food, sleep, exercise and clean habits — and a growing mind needs safety, respect and freedom to learn.'),
        h('Say no to child marriage'),
        p('In India the legal minimum age of marriage is 18 years for women and 21 years for men (Prohibition of Child Marriage Act, 2006). Marrying earlier is a crime. A young girl’s body is not ready for pregnancy; early marriage increases health risks for mother and baby, ends schooling, and limits her future. Anyone can report a child marriage to the Childline number 1098.'),
        def('Balanced diet', 'A diet with the right amounts of carbohydrates, proteins, fats, vitamins, minerals, fibre and water. Adolescents especially need proteins for growth, iron for blood and calcium for bones.'),
        p('Iron-rich foods (leafy vegetables, jaggery, dates, amla, eggs, meat) prevent anaemia, which is common among adolescent girls in India. Milk, ragi and green leafy vegetables give calcium.'),
        stepsB('Eat a balanced diet — avoid too much junk food.', 'Bathe daily and keep the body clean.', 'Exercise or play outdoors every day.', 'Sleep 8–9 hours.', 'Say NO to tobacco, alcohol and drugs.', 'Talk to a parent, teacher or counsellor about any worry.'),
        keys('Legal age of marriage: 18 (women), 21 (men). Childline: 1098.', 'Adolescents need protein, iron and calcium.', 'Personal hygiene, exercise and sleep keep you healthy.', 'Drugs harm the body and mind and are addictive.'),
        remember('Iron Folic Acid (IFA) tablets are given in schools to prevent anaemia.'),
        tip('A plate with cereal, dal, vegetables, curd and a fruit covers most nutrients.'),
      ],
      examples: [
        ex('A 15-year-old girl in a village is being forced to marry. What should she or her friends do?', ['Marriage below 18 for girls is illegal in India.', 'Inform a teacher, the village sarpanch or the police.', 'Call Childline 1098 for help.'], 'Report it — child marriage is illegal; call 1098.'),
        ex('Kavya feels tired and looks pale. A doctor finds her haemoglobin is low. What could help?', ['Low haemoglobin = anaemia, often due to lack of iron.', 'Eat iron-rich foods like leafy vegetables, jaggery, dates and eggs.', 'Take IFA tablets as advised by the doctor.'], 'Iron-rich diet and IFA tablets'),
      ],
      practice: [
        mcq('law', 'Recall the facts about marriage age and health.', [
          ['The legal minimum age of marriage for women in India is…', '18 years', ['14 years', '16 years', '25 years'], 'Prohibition of Child Marriage Act, 2006.', 'Women must be at least 18 to marry.'],
          ['The legal minimum age of marriage for men in India is…', '21 years', ['18 years', '16 years', '30 years'], 'Three years more than for women.', 'Men must be at least 21 to marry.'],
          ['Which helpline number can be called to stop a child marriage?', '1098', ['100', '108', '101'], 'It is Childline.', 'Childline 1098 helps children in trouble.'],
          ['Why is early marriage harmful to a girl?', 'Her body is not ready for pregnancy and her education stops', ['It makes her taller', 'It improves her health', 'It has no effects'], 'Think of health and schooling.', 'Early pregnancy is risky and schooling often ends.'],
          ['Lack of iron in the diet causes…', 'Anaemia', ['Goitre', 'Diabetes', 'Acne'], 'Haemoglobin needs iron.', 'Iron deficiency reduces haemoglobin — anaemia.'],
        ]),
        tapT('tap-healthy', 'Tap every HEALTHY habit for adolescents.', [
          ['Eating leafy vegetables and dal', true], ['Playing outdoors daily', true], ['Bathing daily', true], ['Sleeping 8–9 hours', true], ['Talking to a trusted adult about worries', true],
          ['Skipping breakfast', false], ['Trying tobacco because friends do', false], ['Living on chips and soft drinks', false],
        ], ['Healthy habits help the body grow well.', 'Peer pressure can push you towards harmful habits.'], 'Good food, exercise, hygiene, sleep and talking about worries are healthy; skipping meals, tobacco and junk food are harmful.'),
        matchT('match', 'nutrient to the food that supplies it', [
          ['Iron', 'Green leafy vegetables and jaggery'], ['Calcium', 'Milk and ragi'], ['Protein', 'Dal, eggs and fish'], ['Vitamin C', 'Amla and guava'], ['Carbohydrate', 'Rice and jowar'],
        ], ['Ragi is rich in calcium.', 'Amla is famous for vitamin C.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Biodiversity: Conservation
// =====================================================================================
const ch6: USpec = {
  id: 'ts8.bs.ch6', subject: 'biology', title: 'Biodiversity — Conservation', source: src(6),
  objectives: [
    {
      id: 'ts8.bs.biodiv.what', title: 'What biodiversity is', prereqs: [],
      intro: [
        h('Variety of life'),
        photo('🌿', 'One walk through the Nallamala forest of Amrabad shows teak and bamboo, butterflies, langurs, peacocks, spotted deer — and, hidden somewhere, a tiger.'),
        def('Biodiversity', 'The variety of all living things — plants, animals and microorganisms — in an area, including the differences within each species and the variety of ecosystems they live in.'),
        def('Species', 'A group of similar organisms that can breed among themselves and produce fertile offspring.'),
        def('Flora and fauna', 'Flora = the plants of a particular area; fauna = the animals of that area.'),
        p('Biodiversity exists at three levels: variety within a species (different varieties of rice or mango), variety of species (tigers, deer, teak, grasses) and variety of ecosystems (forest, pond, grassland, desert). India is one of the world’s "megadiverse" countries — with about 2.4% of the world’s land, it has roughly 7–8% of the recorded species.'),
        p('Case study: when villagers protect a sacred grove or a village tank, the number of birds, fish and plants rises. When a forest is cut for timber or farmland, many species disappear from that area. Comparing species counts before and after shows how human activity changes biodiversity.'),
        keys('Biodiversity = variety of life at three levels: genetic, species, ecosystem.', 'Flora = plants; fauna = animals.', 'India is a megadiverse country.'),
        remember('Tropical forests near the equator have the greatest biodiversity on Earth.'),
        tip('Percentage change = (new − old) ÷ old × 100. A negative answer means a decrease.'),
      ],
      examples: [
        ex('A survey counted 40 bird species near a tank in 2015 and 30 in 2025. What is the percentage decrease?', ['Decrease = 40 − 30 = 10', 'Percentage = 10 ÷ 40 × 100', '= 25%'], '25% decrease'),
        ex('Give one example each of genetic, species and ecosystem diversity in Telangana.', ['Genetic: many varieties of rice (Sona Masoori, Telangana Sona).', 'Species: tiger, deer, peacock, teak.', 'Ecosystem: Godavari river, deciduous forest, grassland, village tank.'], 'Rice varieties; tiger/deer/teak; river/forest/tank'),
      ],
      practice: [
        mcq('terms', 'Remember the three levels of biodiversity.', [
          ['Biodiversity means…', 'The variety of living organisms in an area', ['Only the number of trees', 'Only wild animals', 'The size of a forest'], 'It includes plants, animals and microbes.', 'Biodiversity is the variety of all life in an area.'],
          ['The plants of an area are called its…', 'Flora', ['Fauna', 'Species', 'Habitat'], 'Flora → flowers.', 'Flora refers to plant life.'],
          ['The animals of an area are called its…', 'Fauna', ['Flora', 'Biome', 'Producer'], 'The other word in the pair.', 'Fauna refers to animal life.'],
          ['Different varieties of mango (Banganapalli, Totapuri) show…', 'Genetic diversity within a species', ['Ecosystem diversity', 'No diversity', 'Species extinction'], 'All are the same species.', 'Varieties of one species show genetic diversity.'],
          ['A group of similar organisms that can interbreed and produce fertile offspring is a…', 'Species', ['Ecosystem', 'Population of many kinds', 'Food chain'], 'Tigers with tigers.', 'That is the definition of a species.'],
          ['Which regions of the world have the highest biodiversity?', 'Tropical rainforests', ['Polar ice caps', 'Hot deserts', 'High mountain peaks'], 'Warm and wet all year.', 'Tropical rainforests support the most species.'],
        ]),
        tp('pct', (r) => {
          const old = r.pick([20, 25, 40, 50, 60, 80]), pc = r.pick([10, 20, 25, 30, 40, 50]);
          const now = old - old * pc / 100;
          return numQ(`A survey of a forest patch found ${old} species of butterflies. After part of the forest was cleared, only ${now} species were found. What is the percentage decrease? (Type the number only.)`, pc, undefined,
            ['Decrease = old − new.', 'Percentage = decrease ÷ old × 100.'],
            [`Decrease = ${old} − ${now} = ${old - now}`, `${old - now} ÷ ${old} × 100 = ${pc}%`],
            [{ when: String(rd((old - now) / now * 100, 2)), explain: 'Divide by the ORIGINAL number, not the new number.' }], 0.01);
        }, 2),
        tapT('tap-levels', 'Tap every example of ECOSYSTEM diversity.', [
          ['Forest', true], ['Pond', true], ['Grassland', true], ['Desert', true], ['Mangrove', true],
          ['Different varieties of rice', false], ['A single tiger', false], ['Varieties of mango', false],
        ], ['Ecosystems are whole communities with their surroundings.', 'Varieties of one crop show genetic diversity.'], 'Forests, ponds, grasslands, deserts and mangroves are different ecosystems; crop varieties show genetic diversity.'),
      ],
    },
    {
      id: 'ts8.bs.biodiv.endangered', title: 'Endangered, endemic and extinct species', prereqs: ['ts8.bs.biodiv.what'],
      intro: [
        h('Species in danger'),
        photo('🐅', 'Only a few thousand tigers remain in the wild. Telangana protects them in the Amrabad and Kawal Tiger Reserves.'),
        def('Extinct species', 'A species of which no living member exists anywhere, e.g. the dodo, the dinosaurs, the Indian cheetah (extinct in India by the 1950s).'),
        def('Endangered species', 'A species whose numbers have fallen so low that it is in danger of becoming extinct, e.g. tiger, Great Indian Bustard, Jerdon’s courser, Asiatic lion.'),
        def('Endemic species', 'A species found naturally in only one particular region and nowhere else, e.g. Nilgiri tahr and lion-tailed macaque (Western Ghats), Jerdon’s courser (a small area of the Eastern Ghats in Andhra Pradesh), Asiatic lion (Gir forest).'),
        def('Red Data Book', 'A record kept by the IUCN (International Union for Conservation of Nature) of all endangered plants and animals.'),
        h('Why do species become endangered?'),
        p('Loss of habitat (cutting forests, filling wetlands), hunting and poaching (for skin, tusks, horns), pollution, overuse (overfishing, overgrazing) and invasive species that out-compete native ones.'),
        keys('Extinct = gone forever; endangered = at risk; endemic = found only in one region.', 'The Red Data Book lists threatened species.', 'Habitat loss is the biggest cause of extinction.'),
        remember('An endemic species is not always endangered, but because it lives in only one place it can be wiped out quickly if that place is destroyed.'),
        tip('Endemic = "only here". Endangered = "almost gone".'),
      ],
      examples: [
        ex('Why is Jerdon’s courser at greater risk than a crow?', ['Jerdon’s courser lives in one small area (endemic).', 'Its numbers are very low (endangered).', 'Crows live in many places in large numbers.'], 'It is endemic to a tiny area and has very few members.'),
        ex('Is the dodo endangered?', ['The dodo of Mauritius was hunted until none were left.', 'No dodo has been seen since the late 1600s.'], 'No — it is extinct.'),
      ],
      practice: [
        mcq('status', 'Gone forever, almost gone, or found only here?', [
          ['A species with no living members anywhere is…', 'Extinct', ['Endangered', 'Endemic', 'Vulnerable only'], 'Like the dodo.', 'Extinct species have disappeared completely.'],
          ['A species found only in one particular region is…', 'Endemic', ['Extinct', 'Exotic', 'Migratory'], '"Only here".', 'Endemic species are restricted to one area.'],
          ['The Red Data Book is maintained by…', 'IUCN', ['WHO', 'UNESCO', 'ISRO'], 'International Union for Conservation of Nature.', 'IUCN keeps the Red Data Book of threatened species.'],
          ['Which is the biggest cause of species becoming endangered?', 'Loss of habitat', ['Too much rain', 'Too many zoos', 'Moonlight'], 'Forests cut, wetlands filled.', 'Destroying habitats removes food and shelter.'],
          ['Which of these is endangered?', 'Great Indian Bustard', ['House crow', 'Common myna', 'Pigeon'], 'A large grassland bird with very few left.', 'The Great Indian Bustard is critically endangered.'],
          ['The Asiatic lion is found in the wild only in…', 'Gir forest, Gujarat', ['Amrabad, Telangana', 'Sundarbans', 'Thar desert'], 'It is endemic.', 'Wild Asiatic lions live only in and around Gir.'],
        ]),
        matchT('match', 'animal to its status or home', [
          ['Dodo', 'Extinct'], ['Tiger', 'Endangered'], ['Nilgiri tahr', 'Endemic to the Western Ghats'], ['Asiatic lion', 'Endemic to Gir'], ['Jerdon’s courser', 'Endemic to a small area of the Eastern Ghats'],
        ], ['The dodo is gone forever.', 'Tahr lives on Nilgiri hills.']),
        tapT('tap-threat', 'Tap every activity that THREATENS wildlife.', [
          ['Cutting forests for farmland', true], ['Poaching for skin and tusks', true], ['Dumping waste in lakes', true], ['Overfishing', true], ['Filling wetlands for buildings', true],
          ['Planting native trees', false], ['Declaring a sanctuary', false], ['Banning hunting', false],
        ], ['Threats reduce habitat or numbers.', 'Protection measures help.'], 'Deforestation, poaching, pollution, overfishing and filling wetlands harm wildlife; planting, sanctuaries and hunting bans protect it.'),
      ],
    },
    {
      id: 'ts8.bs.biodiv.conserve', title: 'Importance of biodiversity and conservation efforts', prereqs: ['ts8.bs.biodiv.endangered'],
      intro: [
        h('Why protect it, and how?'),
        photo('🦚', 'The peacock, our national bird, is protected by law. Protected areas keep peacocks, deer and tigers safe in their natural homes.'),
        h('Why biodiversity matters'),
        p('Every species has a role. Plants give oxygen, food, timber and medicines (neem, tulasi, turmeric, aloe vera). Bees and butterflies pollinate crops. Decomposers recycle nutrients. Forests prevent soil erosion, store water and control climate. Wild varieties of crops carry genes for disease resistance that help us breed better crops. Biodiversity also supports tourism and the livelihoods of tribal communities.'),
        def('Conservation', 'Protection, preservation and wise use of natural resources and wildlife so that they last for future generations.'),
        def('In-situ conservation', 'Protecting species in their natural habitat — national parks, wildlife sanctuaries, biosphere reserves, tiger reserves.'),
        def('Ex-situ conservation', 'Protecting species outside their natural habitat — zoos, botanical gardens, seed banks.'),
        def('National park', 'A protected area for wildlife and its habitat where human activities such as grazing, cutting trees and cultivation are not allowed. Telangana: Kasu Brahmananda Reddy (KBR) National Park, Mrugavani National Park and Mahavir Harina Vanasthali National Park (Hyderabad region).'),
        def('Wildlife sanctuary', 'A protected area for animals where some human activities, like collecting firewood or grazing, may be allowed. Telangana: Eturnagaram, Pakhal, Pocharam, Kinnerasani, Pranahita and others.'),
        p('Telangana also has the Amrabad and Kawal Tiger Reserves (under Project Tiger, launched in 1973) and Nehru Zoological Park in Hyderabad for ex-situ conservation. Schemes like Telangana Ku Haritha Haram aim to increase green cover.'),
        keys('Biodiversity gives food, medicine, oxygen, pollination, soil and climate protection.', 'In-situ = natural home; ex-situ = zoos, gardens, seed banks.', 'National park: stricter; sanctuary: some activities allowed.', 'Project Tiger: 1973.'),
        remember('Everyone can help: plant native trees, avoid plastic, do not buy products made from wild animals, save water.'),
        tip('"In-situ" = in its own place; "ex-situ" = out of its place.'),
      ],
      examples: [
        ex('Is Nehru Zoological Park in-situ or ex-situ conservation?', ['Animals in a zoo are kept outside their natural habitats.', 'That is ex-situ conservation.'], 'Ex-situ'),
        ex('How can saving a wild variety of rice help farmers?', ['Wild varieties may carry genes that resist disease or drought.', 'Scientists can breed these genes into crop varieties.', 'Farmers get hardier crops.'], 'It provides genes for better, disease-resistant crops.'),
      ],
      practice: [
        mcq('places', 'Is it a natural home or outside it? Strict or less strict?', [
          ['Which is an example of ex-situ conservation?', 'Nehru Zoological Park', ['Amrabad Tiger Reserve', 'Pakhal Wildlife Sanctuary', 'KBR National Park'], 'Outside the natural habitat.', 'Zoos protect animals outside their habitat.'],
          ['In which protected area are grazing and tree cutting NOT allowed at all?', 'National park', ['Wildlife sanctuary', 'Village common land', 'Farm'], 'It is the stricter type.', 'National parks do not allow such human activities.'],
          ['Project Tiger was launched in India in…', '1973', ['1947', '2000', '1857'], 'Early 1970s.', 'Project Tiger began in 1973.'],
          ['Which of these is a tiger reserve in Telangana?', 'Kawal', ['Gir', 'Sundarbans', 'Kaziranga'], 'It is in Adilabad–Mancherial region.', 'Kawal and Amrabad are Telangana’s tiger reserves.'],
          ['A seed bank is an example of…', 'Ex-situ conservation', ['In-situ conservation', 'Deforestation', 'Pollution'], 'Seeds are stored away from the habitat.', 'Seed banks preserve plants outside their habitat.'],
          ['Eturnagaram in Telangana is a…', 'Wildlife sanctuary', ['Desert', 'Mangrove', 'Zoo'], 'It is in Mulugu district.', 'Eturnagaram is a wildlife sanctuary.'],
        ]),
        tapT('tap-insitu', 'Tap every example of IN-SITU conservation.', [
          ['Amrabad Tiger Reserve', true], ['Pakhal Wildlife Sanctuary', true], ['KBR National Park', true], ['A biosphere reserve', true], ['A protected sacred grove', true],
          ['A zoo', false], ['A seed bank', false], ['A botanical garden', false],
        ], ['In-situ = natural habitat.', 'Zoos, seed banks and gardens are outside the habitat.'], 'Reserves, sanctuaries, parks and sacred groves protect species where they live; zoos, seed banks and gardens are ex-situ.'),
        mcq('why', 'Think of everything we get from living things.', [
          ['Which is a medicinal plant?', 'Neem', ['Plastic', 'Cement', 'Granite'], 'Its leaves and twigs are used.', 'Neem has antibacterial properties used in medicine.'],
          ['Bees and butterflies are important because they…', 'Pollinate crops', ['Cause droughts', 'Destroy soil', 'Make plastic'], 'They carry pollen.', 'Pollinators help crops form fruits and seeds.'],
          ['Forests help prevent…', 'Soil erosion and floods', ['Rainfall', 'Photosynthesis', 'Oxygen production'], 'Roots hold soil.', 'Tree roots bind soil and forests absorb rainwater.'],
          ['Why should we protect even small, unknown species?', 'Every species has a role in the ecosystem', ['Small species are useless', 'Only big animals matter', 'Small species never die out'], 'Food chains are linked.', 'Losing any species can upset the ecosystem.'],
          ['Which human action helps conserve biodiversity?', 'Planting native trees', ['Burning forests', 'Buying ivory', 'Draining lakes'], 'Which one restores habitat?', 'Native trees provide habitat for local wildlife.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Different Ecosystems
// =====================================================================================
const ch7: USpec = {
  id: 'ts8.bs.ch7', subject: 'biology', title: 'Different Ecosystems', source: src(7),
  objectives: [
    {
      id: 'ts8.bs.eco.what', title: 'What an ecosystem is; interdependence', prereqs: [],
      intro: [
        h('Living and non-living, working together'),
        photo('🐟', 'A village tank holds water, mud, sunlight, algae, fish, frogs, water birds and bacteria — each depends on the others.'),
        def('Ecosystem', 'A community of living organisms together with the non-living things around them, interacting as a unit, e.g. a pond, a forest, a grassland.'),
        def('Biotic components', 'The living parts: plants (producers), animals (consumers) and microbes (decomposers).'),
        def('Abiotic components', 'The non-living parts: sunlight, air, water, soil, temperature, minerals.'),
        def('Producers', 'Green plants and algae that make their own food by photosynthesis.'),
        def('Consumers', 'Animals that eat other organisms: herbivores eat plants (deer), carnivores eat animals (tiger), omnivores eat both (crow, human).'),
        def('Decomposers', 'Bacteria and fungi that break down dead organisms and wastes, returning nutrients to the soil.'),
        p('Organisms depend on each other: a food chain shows who eats whom (grass → grasshopper → frog → snake → eagle). Many food chains interlink to form a food web. Plants give food and oxygen; animals give carbon dioxide, pollination and seed dispersal; decomposers recycle nutrients for plants. This is interdependence.'),
        keys('Ecosystem = biotic + abiotic parts interacting.', 'Producers → consumers → decomposers.', 'Food chains link into food webs.', 'Removing one organism affects many others.'),
        remember('Every food chain starts with a producer (green plant) because only plants can capture the Sun’s energy.'),
        tip('The arrow in a food chain points from the food to the eater — it shows the direction energy flows.'),
      ],
      examples: [
        ex('In a field, frogs are caught in large numbers for sale. What happens to the insects and snakes?', ['Frogs eat insects; snakes eat frogs.', 'Fewer frogs → insects increase and damage crops.', 'Snakes have less food and decrease.'], 'Insects increase; snakes decrease.'),
        ex('Arrange into a food chain: snake, grass, eagle, grasshopper, frog.', ['Start with the producer: grass.', 'Grasshopper eats grass; frog eats grasshopper.', 'Snake eats frog; eagle eats snake.'], 'Grass → grasshopper → frog → snake → eagle'),
      ],
      practice: [
        orderT('chain', 'Arrange this food chain from producer to top consumer.', ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Eagle'], ['Start with the organism that makes its own food.', 'The eagle is not eaten by any of the others.'], 'Energy passes from grass to grasshopper to frog to snake to eagle.'),
        tp('role', (r) => {
          const pool: [string, string][] = [['Neem tree', 'Producer'], ['Algae', 'Producer'], ['Grass', 'Producer'], ['Deer', 'Herbivore'], ['Goat', 'Herbivore'], ['Grasshopper', 'Herbivore'], ['Tiger', 'Carnivore'], ['Snake', 'Carnivore'], ['Eagle', 'Carnivore'], ['Crow', 'Omnivore'], ['Bear', 'Omnivore'], ['Mushroom', 'Decomposer'], ['Soil bacteria', 'Decomposer']];
          const [org, role] = r.pick(pool);
          return {
            type: 'mcq', prompt: `In an ecosystem, what is the role of a ${org.toLowerCase()}?`, ...choose(r, role, ['Producer', 'Herbivore', 'Carnivore', 'Omnivore', 'Decomposer'].filter((x) => x !== role)),
            hints: ['Does it make food, eat plants, eat animals, eat both, or break down dead matter?', 'Mushrooms and bacteria feed on dead matter.'],
            mistakes: [{ when: 'wrong', explain: `Not quite. A ${org.toLowerCase()} is a ${role.toLowerCase()}.` }],
            solution: [`${org}: ${role}.`],
          };
        }),
        tapT('tap-abiotic', 'Tap every ABIOTIC (non-living) component of a pond ecosystem.', [
          ['Water', true], ['Sunlight', true], ['Mud and minerals', true], ['Temperature', true], ['Dissolved oxygen', true],
          ['Fish', false], ['Algae', false], ['Bacteria', false],
        ], ['Abiotic = non-living.', 'Algae and bacteria are alive.'], 'Water, light, mud, temperature and dissolved gases are abiotic; fish, algae and bacteria are biotic.'),
        mcq('inter', 'Follow the arrows of who eats whom.', [
          ['If all the snakes in a paddy field are killed, the number of rats will…', 'Increase', ['Decrease', 'Stay the same', 'Become zero'], 'Snakes eat rats.', 'With fewer predators, rats multiply.'],
          ['Many interconnected food chains form a…', 'Food web', ['Food pyramid of numbers only', 'Habitat', 'Population'], 'Like a spider’s web.', 'Interlinked food chains make a food web.'],
          ['Every food chain begins with a…', 'Producer', ['Carnivore', 'Decomposer', 'Omnivore'], 'It makes its own food.', 'Green plants trap the Sun’s energy first.'],
          ['Which organisms return nutrients from dead bodies to the soil?', 'Decomposers', ['Producers', 'Herbivores', 'Carnivores'], 'Bacteria and fungi.', 'Decomposers break down dead matter.'],
          ['How do animals help plants?', 'By pollination, seed dispersal and releasing CO₂', ['By eating all the leaves', 'By blocking sunlight', 'They never help plants'], 'Think of bees and birds.', 'Animals pollinate, spread seeds and provide CO₂.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.eco.change', title: 'Changes in ecosystems', prereqs: ['ts8.bs.eco.what'],
      intro: [
        h('Ecosystems are not fixed'),
        photo('🌧️', 'A dry tank fills with monsoon rain; within weeks frogs, fish, water plants and birds appear. Ecosystems change with seasons and over years.'),
        p('Ecosystems change naturally — seasonal changes (a pond dries in summer), floods, droughts, cyclones, forest fires caused by lightning, and slow changes like a pond gradually filling with silt and becoming a marsh and later land.'),
        p('Human activities also change ecosystems, often very fast: cutting forests, building dams, mining, expanding cities, overgrazing, using too many pesticides, and introducing new species (for example, water hyacinth covering lakes, or Parthenium "congress grass" spreading in fields).'),
        def('Invasive species', 'A species brought from another region that spreads rapidly and harms the native organisms, e.g. water hyacinth, Parthenium.'),
        def('Biomagnification', 'The increase in concentration of harmful chemicals (like DDT) at each step up a food chain, so that top consumers carry the highest amounts.'),
        keys('Natural changes: seasons, floods, droughts, fires, silting.', 'Human changes: deforestation, dams, mining, pollution, invasive species.', 'Pesticides build up along food chains (biomagnification).'),
        remember('An ecosystem left alone often recovers slowly — e.g. grass, then shrubs, then trees return after a forest fire.'),
        tip('Ask "natural or human-made?" and "sudden or slow?" to describe any ecosystem change.'),
      ],
      examples: [
        ex('A lake in Hyderabad becomes covered with water hyacinth. Why do fish die?', ['Water hyacinth spreads over the surface.', 'It blocks sunlight from water plants and algae and lowers oxygen in the water.', 'Fish suffocate.'], 'The weed blocks light and reduces oxygen.'),
        ex('Pesticide in a pond is 0.02 units in plankton but 20 units in a fish-eating bird. Explain.', ['The bird eats many fish; each fish ate many small organisms.', 'The pesticide is not broken down and builds up at each level.', 'This is biomagnification.'], 'Biomagnification along the food chain'),
      ],
      practice: [
        tapT('tap-human', 'Tap every change to an ecosystem caused by HUMANS.', [
          ['Building a dam across a river', true], ['Clearing a forest for a highway', true], ['Spraying pesticides on fields', true], ['Introducing water hyacinth into a lake', true], ['Mining for coal', true],
          ['A cyclone', false], ['Lightning-caused forest fire', false], ['A pond drying in summer', false],
        ], ['Human changes involve tools, machines or chemicals.', 'Weather and seasons are natural.'], 'Dams, roads, pesticides, invasive species and mining are human-made; cyclones, lightning fires and seasonal drying are natural.'),
        mcq('change', 'Decide whether the change is natural or human-made, and its effect.', [
          ['Parthenium (congress grass) is an example of…', 'An invasive species', ['A native crop', 'A decomposer', 'An endangered plant'], 'It spread rapidly after arriving from abroad.', 'Parthenium is an invasive weed harmful to crops and health.'],
          ['The build-up of harmful chemicals along a food chain is called…', 'Biomagnification', ['Photosynthesis', 'Decomposition', 'Pollination'], 'Bio = life; magnify = enlarge.', 'Concentrations increase at each higher level.'],
          ['Which change is natural?', 'A flood after heavy rain', ['Building a factory', 'Cutting a forest', 'Spraying DDT'], 'No human action involved.', 'Floods from heavy rain are natural events.'],
          ['Water hyacinth covering a lake leads to…', 'Less light and oxygen in the water, so fish die', ['More fish', 'Cleaner water', 'More sunlight reaching the bottom'], 'It forms a mat on the surface.', 'The thick mat cuts light and oxygen.'],
          ['After a forest fire, plants usually return in the order…', 'Grasses, then shrubs, then trees', ['Trees first, then grass', 'Only cacti', 'Nothing ever grows again'], 'Small plants grow quickly.', 'Recovery begins with grasses and ends with trees.'],
        ]),
        orderT('order-succ', 'Arrange how a pond slowly changes into land over many years.', [
          'Open pond with water plants', 'Silt and dead plants make it shallow', 'It becomes a marsh with reeds', 'Grasses and shrubs grow on drying soil', 'Trees grow on the new land',
        ], ['Silt builds up first.', 'Trees come last.'], 'Silting makes the pond shallower, then marsh, then grassland and finally woodland.', 2),
      ],
    },
    {
      id: 'ts8.bs.eco.types', title: 'Mangrove, desert and forest ecosystems', prereqs: ['ts8.bs.eco.what'],
      intro: [
        h('Three very different homes'),
        photo('🐪', 'A camel can go days without water — its body is adapted to the desert. Every ecosystem has organisms adapted to its conditions.'),
        def('Adaptation', 'A feature of an organism that helps it survive in its particular surroundings.'),
        h('Mangrove ecosystem'),
        p('Mangroves are forests of salt-tolerant trees along sea coasts and river mouths, where sea water and river water mix. The soil is wet, salty and low in oxygen. Many mangrove trees have breathing roots (pneumatophores) that grow up out of the mud to take in air, and stilt roots that hold them firm. India’s largest mangrove is the Sundarbans (West Bengal), home of the Royal Bengal tiger; Coringa near Kakinada in Andhra Pradesh is another. Mangroves protect coasts from cyclones and are nurseries for fish, prawns and crabs.'),
        h('Desert ecosystem'),
        p('Deserts get very little rain (less than 25 cm a year) and have extreme temperatures. Plants like cactus and Opuntia have spines instead of leaves (less water loss), thick fleshy stems that store water and photosynthesise, and long roots. Animals like the camel (stores fat in its hump, passes little urine, broad padded feet), desert rats and snakes that hide in burrows by day. India’s Thar desert is in Rajasthan.'),
        h('Forest ecosystem'),
        p('Forests have layers: tall trees (canopy), smaller trees, shrubs, herbs and the forest floor with decomposers. Telangana’s forests are mainly dry deciduous — teak, bamboo, rosewood and mahua shed leaves in summer to save water. They shelter tigers, leopards, sloth bears, deer, gaur and many birds.'),
        keys('Mangrove: salty, swampy coast; breathing roots; Sundarbans, Coringa.', 'Desert: little rain; spines, fleshy stems, long roots; camel.', 'Forest: layers of vegetation; Telangana has deciduous forests.'),
        remember('Pneumatophores are roots that grow UPWARD out of the mud to breathe.'),
        tip('Match the problem to the adaptation: little water → store it and lose less; salty mud with no air → breathing roots.'),
      ],
      examples: [
        ex('Why does a cactus have spines instead of broad leaves?', ['Broad leaves lose a lot of water by transpiration.', 'Spines have very little surface area, so little water is lost.', 'They also protect the plant from animals.'], 'To reduce water loss (and for protection).'),
        ex('Why do some mangrove roots grow upward out of the mud?', ['Mangrove mud is waterlogged and has little oxygen.', 'Roots need oxygen to respire.', 'Upward roots (pneumatophores) take in air.'], 'To get oxygen from the air.'),
      ],
      practice: [
        matchT('match', 'feature to its ecosystem', [
          ['Breathing roots (pneumatophores)', 'Mangrove'], ['Spines instead of leaves', 'Desert'], ['Layers of canopy and shrubs', 'Forest'], ['Camel', 'Desert'], ['Royal Bengal tiger in salty swamps', 'Mangrove'], ['Teak and bamboo', 'Forest'],
        ], ['Salty swamps = mangroves.', 'Very little rain = desert.']),
        mcq('adapt', 'Link the adaptation to the problem it solves.', [
          ['Why does a camel have broad, padded feet?', 'To walk on soft sand without sinking', ['To swim', 'To climb trees', 'To dig for water'], 'Sand is loose.', 'Broad feet spread the camel’s weight on sand.'],
          ['India’s largest mangrove forest is…', 'Sundarbans', ['Thar', 'Nallamala', 'Gir'], 'In West Bengal.', 'The Sundarbans is the largest mangrove forest.'],
          ['Why do teak trees shed their leaves in summer?', 'To reduce water loss in the dry season', ['Because they are dying', 'To attract birds', 'Because of cold'], 'Telangana summers are hot and dry.', 'Deciduous trees drop leaves to save water.'],
          ['A desert receives less than about…', '25 cm of rain a year', ['200 cm of rain a year', '100 cm of rain a month', 'Rain every day'], 'Very little.', 'Deserts are defined by very low rainfall.'],
          ['Mangroves are important because they…', 'Protect coasts from cyclones and breed fish', ['Make sand dunes', 'Stop all rain', 'Are found in deserts'], 'Think of coasts and fish.', 'Mangroves buffer storms and are fish nurseries.'],
          ['The thick fleshy stem of a cactus…', 'Stores water and makes food', ['Absorbs salt', 'Helps it swim', 'Keeps it cold'], 'It is green.', 'The green stem stores water and photosynthesises.'],
        ]),
        tapT('tap-desert', 'Tap every adaptation that helps a plant survive in a DESERT.', [
          ['Spines instead of leaves', true], ['Thick fleshy stem storing water', true], ['Very long roots', true], ['Waxy coating on the stem', true],
          ['Large thin leaves', false], ['Breathing roots growing out of mud', false], ['Floating leaves', false],
        ], ['Desert plants must save water.', 'Breathing roots belong to mangroves; floating leaves to ponds.'], 'Spines, fleshy stems, long roots and waxy coats save or find water; large thin leaves lose water.'),
      ],
    },
    {
      id: 'ts8.bs.eco.energy', title: 'Energy flow in an ecosystem', prereqs: ['ts8.bs.eco.what'],
      intro: [
        h('Following the Sun’s energy'),
        photo('☀️', 'All the energy in a food chain comes first from the Sun, captured by green plants.'),
        p('Green plants capture a small part of the sunlight falling on them and store it as chemical energy in food. When a herbivore eats a plant, only part of this energy becomes its body; most is used for living (moving, breathing, keeping warm) and is lost as heat. The same happens at every step.'),
        def('Trophic level', 'Each step of a food chain: producers (level 1), herbivores or primary consumers (level 2), carnivores or secondary consumers (level 3), and so on.'),
        def('10% law', 'On average, only about 10% of the energy at one trophic level passes on to the next level; about 90% is used up or lost as heat.'),
        def('Pyramid of energy', 'A diagram showing the energy at each trophic level. It is always widest at the bottom (producers) and narrowest at the top, because energy decreases at each level.'),
        xp({
          title: 'What if? Energy passed up a food chain', formula: 'E = E₀ × (p ÷ 100)ⁿ',
          res: ['E', 'Energy reaching level n+1', 'kJ', 'E0 * (p / 100) ^ n', 2],
          vars: [['E0', 'Energy stored in producers', 'kJ', 1000, 100000, 1000, 10000], ['p', 'Percentage passed on at each step', '%', 5, 20, 1, 10], ['n', 'Number of steps up the chain', '', 0, 5, 1, 2]],
          notes: [
            ['n', 'Each extra step leaves only a tenth (at 10%) — top carnivores get very little energy.', 'Fewer steps keep more energy available; this is why eating plants feeds more people.'],
            ['p', 'A higher transfer percentage passes more energy up the chain.', 'A lower percentage makes energy run out even faster.'],
            ['E0', 'More energy stored by producers supports more consumers at every level.', 'Less plant energy means fewer animals can be supported.'],
          ],
          mistakes: [['"Energy is recycled like nutrients."', 'Nutrients are recycled by decomposers, but energy flows ONE WAY and is lost as heat; it must keep coming from the Sun.']],
          real: 'There are far fewer tigers than deer, and far fewer deer than plants, because only a small part of the energy passes up each level.',
        }),
        keys('Energy flow is one-way: Sun → producers → consumers, lost as heat.', 'Only about 10% passes to the next level.', 'Food chains rarely have more than 4–5 levels.', 'Pyramid of energy is always upright.'),
        remember('Nutrients cycle; energy flows.'),
        tip('With the 10% law, move one decimal place left for each step: 10 000 → 1000 → 100 → 10.'),
      ],
      examples: [
        ex('Plants in a field store 20 000 kJ. Using the 10% law, how much reaches a snake in grass → rat → snake?', ['Rat (1 step): 20 000 × 10% = 2000 kJ', 'Snake (2 steps): 2000 × 10% = 200 kJ'], '200 kJ'),
        ex('Why do food chains rarely have more than five levels?', ['Only about 10% of energy passes each step.', 'After 4–5 steps very little energy remains.', 'It is not enough to support another population.'], 'Too little energy is left after a few steps.'),
      ],
      practice: [
        tp('ten', (r) => {
          const E0 = r.pick([1000, 5000, 10000, 20000, 50000, 100000]), n = r.pick([1, 2, 3]);
          const chains = [['grass', 'grasshopper', 'frog', 'snake'], ['algae', 'small fish', 'big fish', 'kingfisher'], ['paddy plants', 'rat', 'snake', 'eagle']];
          const c = r.pick(chains);
          const ans = E0 / 10 ** n;
          return numQ(`In the food chain ${c.join(' → ')}, the ${c[0]} store ${E0} kJ of energy. Using the 10% law, how much energy (in kJ) reaches the ${c[n]}?`, ans, 'kJ',
            ['Only 10% passes on at each step.', `Count the steps from ${c[0]} to ${c[n]}: ${n}.`],
            [`Steps = ${n}`, `${E0} × (1/10)^${n} = ${ans} kJ`],
            n > 1 ? [{ when: String(E0 / 10), explain: `That is only one step. The ${c[n]} is ${n} steps from the ${c[0]}.` }] : [{ when: String(E0 * 0.9), explain: 'That is the 90% that is lost. Only 10% passes on.' }], 0.001);
        }, 2),
        mcq('energy', 'Energy flows one way and shrinks at each step.', [
          ['The ultimate source of energy for almost all ecosystems is…', 'The Sun', ['The soil', 'Water', 'Decomposers'], 'Plants capture it.', 'Sunlight drives photosynthesis.'],
          ['About what percentage of energy passes from one trophic level to the next?', '10%', ['90%', '50%', '100%'], 'Most is lost as heat.', 'The 10% law.'],
          ['Most of the energy at each level is…', 'Used for life activities and lost as heat', ['Stored forever', 'Sent back to the Sun', 'Turned into soil'], 'Animals move and breathe.', 'About 90% is used up and lost as heat.'],
          ['A pyramid of energy is…', 'Always widest at the base', ['Always inverted', 'Widest at the top', 'A straight line'], 'Producers have the most energy.', 'Energy decreases upward, so the pyramid is upright.'],
          ['Herbivores are at which trophic level?', 'Second', ['First', 'Third', 'Fourth'], 'Producers are first.', 'Primary consumers (herbivores) are level 2.'],
          ['Which statement is TRUE?', 'Energy flows one way; nutrients are recycled', ['Energy is recycled by decomposers', 'Nutrients flow one way only', 'Energy increases up the chain'], 'Heat cannot be reused by plants.', 'Energy is lost as heat; nutrients return to soil.'],
        ]),
        tapT('tap-level1', 'Tap every organism at the FIRST trophic level (producers).', [
          ['Grass', true], ['Paddy plant', true], ['Algae', true], ['Neem tree', true], ['Water hyacinth', true],
          ['Rabbit', false], ['Frog', false], ['Mushroom', false],
        ], ['Producers make their own food.', 'Mushrooms are decomposers, not producers.'], 'Green plants and algae are producers; rabbits and frogs are consumers; mushrooms are decomposers.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Production of Food from Plants
// =====================================================================================
const ch8: USpec = {
  id: 'ts8.bs.ch8', subject: 'biology', title: 'Production of Food from Plants', source: src(8),
  objectives: [
    {
      id: 'ts8.bs.crop.types', title: 'Crops in India: kharif and rabi', prereqs: [],
      intro: [
        h('What grows when'),
        photo('🌾', 'In Telangana, fields turn green with paddy, cotton and maize after the monsoon rains, and with Bengal gram and groundnut in winter.'),
        def('Crop', 'Plants of the same kind grown on a large scale in a field for food, fibre or other uses.'),
        def('Kharif crops', 'Crops sown at the start of the rainy season (June–July) and harvested in September–October. They need plenty of water and warmth. Examples: paddy, maize, cotton, jowar, red gram, soybean, groundnut (kharif crop).'),
        def('Rabi crops', 'Crops sown in winter (October–November) and harvested in spring (March–April). Examples: wheat, Bengal gram, mustard, peas, linseed.'),
        p('Some crops (watermelon, cucumber, some vegetables) are grown in the short summer season between rabi and kharif; these are called zaid crops. Crops can also be grouped by use: cereals (rice, wheat, maize, jowar), pulses (red gram, green gram, Bengal gram), oilseeds (groundnut, sunflower, mustard, castor), fibre (cotton, jute), spices (chilli, turmeric) and cash crops (sugarcane, cotton).'),
        p('Telangana grows a lot of paddy, cotton, maize, red gram, chillies and turmeric. India is among the world’s largest producers of rice, wheat, pulses, sugarcane and cotton.'),
        keys('Kharif: rainy season — paddy, maize, cotton.', 'Rabi: winter — wheat, gram, mustard.', 'Crop groups: cereals, pulses, oilseeds, fibres, spices, cash crops.'),
        remember('Kharif and rabi are Arabic-origin words for "autumn" and "spring" — the harvest seasons.'),
        tip('Paddy needs standing water, so it is grown when the rains come — kharif.'),
      ],
      examples: [
        ex('Is wheat a kharif or rabi crop?', ['Wheat needs cool weather to grow.', 'It is sown in October–November and harvested in March–April.'], 'Rabi crop'),
        ex('Classify: groundnut, jowar, red gram, cotton (by use).', ['Groundnut gives oil → oilseed.', 'Jowar is a grain → cereal.', 'Red gram gives dal → pulse.', 'Cotton gives fibre → fibre crop.'], 'Oilseed, cereal, pulse, fibre'),
      ],
      practice: [
        tp('season', (r) => {
          const K = ['Paddy', 'Maize', 'Cotton', 'Jowar', 'Soybean'], R = ['Wheat', 'Bengal gram', 'Mustard', 'Peas', 'Linseed'];
          const isK = r.next() < 0.5, c = r.pick(isK ? K : R);
          const season = isK ? 'Kharif (rainy season)' : 'Rabi (winter season)';
          return {
            type: 'mcq', prompt: `${c} is mainly grown as a…`, ...choose(r, season, [isK ? 'Rabi (winter season)' : 'Kharif (rainy season)', 'Zaid (summer season)', 'It cannot be grown in India']),
            hints: ['Kharif crops need lots of water; rabi crops need cool weather.', 'Paddy, maize, cotton: rainy season. Wheat, gram, mustard: winter.'],
            mistakes: [{ when: 'wrong', explain: `Not quite. ${c} is a ${season.toLowerCase()} crop.` }],
            solution: [`${c} → ${season}.`],
          };
        }),
        matchT('match', 'crop to its group', [
          ['Rice', 'Cereal'], ['Red gram', 'Pulse'], ['Groundnut', 'Oilseed'], ['Cotton', 'Fibre crop'], ['Chilli', 'Spice'], ['Sugarcane', 'Cash crop (sugar)'],
        ], ['Pulses give dal.', 'Oilseeds give cooking oil.']),
        mcq('crops', 'Think of the season and the use.', [
          ['Kharif crops are sown in…', 'June–July, at the start of the rains', ['October–November', 'January', 'Only in April'], 'Monsoon season.', 'Kharif crops are sown with the monsoon.'],
          ['Rabi crops are harvested in…', 'March–April', ['July', 'September', 'December'], 'Spring.', 'Rabi crops are sown in winter and harvested in spring.'],
          ['Which crop is grown in the short summer season?', 'Watermelon', ['Wheat', 'Paddy', 'Mustard'], 'Zaid crops.', 'Watermelon and cucumber are zaid crops.'],
          ['Plants of the same kind grown in a field on a large scale are a…', 'Crop', ['Weed', 'Forest', 'Herb garden'], 'Paddy fields.', 'That is the definition of a crop.'],
          ['Which crop is NOT a cereal?', 'Bengal gram', ['Rice', 'Wheat', 'Maize'], 'It is a pulse.', 'Bengal gram is a pulse; the rest are cereals.'],
        ]),
      ],
    },
    {
      id: 'ts8.bs.crop.paddy', title: 'Growing paddy: agricultural practices', prereqs: ['ts8.bs.crop.types'],
      intro: [
        h('From nursery to transplanting'),
        photo('🧑‍🌾', 'Farmers transplant bunches of young paddy seedlings by hand into flooded, puddled fields — a familiar sight across Telangana in July and August.'),
        p('Paddy (rice) is the main food crop of Telangana. It needs a warm climate, plenty of water and clayey soil that holds water.'),
        stepsB('Select good seeds of a suitable variety (e.g. a fine or high-yielding variety); soak and test them — seeds that float are hollow or damaged and are removed.', 'Raise seedlings in a small, well-prepared nursery bed for about 3–4 weeks.', 'Prepare the main field: plough, flood it and puddle (churn the wet soil into mud) and level it.', 'Transplant seedlings in rows with proper spacing.', 'Keep a few centimetres of standing water; add manure and fertiliser; remove weeds; protect from pests.', 'Drain the water before harvest; harvest when the grains turn golden.'),
        def('Nursery', 'A small, well-cared-for area where seedlings are raised before being moved to the main field.'),
        def('Transplantation', 'Moving young seedlings from the nursery to the main field. It allows proper spacing and saves seed and time.'),
        def('Puddling', 'Ploughing a flooded field so that the soil becomes soft mud; this reduces water loss by seepage and helps transplanting.'),
        p('Water-saving methods are being promoted: in SRI (System of Rice Intensification) young seedlings are planted singly and widely spaced, and the field is kept moist rather than flooded. Direct seeding with a seed drill is another option.'),
        keys('Paddy needs warmth, water and clayey soil.', 'Nursery → puddled field → transplanting → water, manure, weeding → harvest.', 'Floating seeds are rejected.', 'SRI saves water and seed.'),
        remember('Seed rate = amount of seed needed per unit area. Total seed = seed rate × area.'),
        tip('Healthy, heavy seeds sink in water; damaged ones float.'),
      ],
      examples: [
        ex('A farmer needs 25 kg of paddy seed per acre for transplanting. How much seed is needed for 4 acres?', ['Total seed = seed rate × area', '= 25 × 4', '= 100 kg'], '100 kg'),
        ex('Why do farmers put seeds in water before sowing?', ['Damaged or empty seeds are lighter and float.', 'Good seeds are heavier and sink.', 'Removing floaters gives a better crop.'], 'To separate healthy (sinking) seeds from damaged (floating) ones.'),
      ],
      practice: [
        orderT('order-paddy', 'Put the steps of growing paddy in order.', [
          'Select and test good seeds', 'Raise seedlings in a nursery', 'Puddle and level the main field', 'Transplant seedlings', 'Maintain water, manure and weeding', 'Harvest the golden crop',
        ], ['Seedlings come from a nursery.', 'The field must be ready before transplanting.'], 'Seeds → nursery → field preparation → transplanting → care → harvest.'),
        tp('seed', (r) => {
          const rate = r.pick([8, 10, 12, 20, 25, 30]), area = r.pick([2, 3, 4, 5, 6]);
          return numQ(`${who(r)} needs ${rate} kg of paddy seed per acre. How much seed is needed for ${area} acres?`, rate * area, 'kg',
            ['Total seed = seed rate × area.', `Multiply ${rate} by ${area}.`],
            [`${rate} × ${area} = ${rate * area} kg`],
            [{ when: String(rate + area), explain: 'Multiply, do not add.' }], 0.001);
        }, 2),
        mcq('paddy', 'Recall each step and why it is done.', [
          ['Seeds that float in water are…', 'Damaged or empty and should be removed', ['The best seeds', 'Ready to be sown immediately', 'Heavier than others'], 'Healthy seeds sink.', 'Light, floating seeds are hollow or damaged.'],
          ['Churning a flooded field into soft mud is called…', 'Puddling', ['Threshing', 'Winnowing', 'Weeding'], 'It reduces seepage.', 'Puddling makes the soil soft and reduces water loss.'],
          ['Moving young seedlings from the nursery to the field is…', 'Transplantation', ['Harvesting', 'Germination', 'Irrigation'], 'They are "planted across".', 'Seedlings are transplanted into the main field.'],
          ['Paddy grows best in…', 'Clayey soil that holds water', ['Sandy soil that drains fast', 'Rocky ground', 'Salty desert sand'], 'It needs standing water.', 'Clayey soil holds the water paddy needs.'],
          ['SRI method of rice cultivation mainly helps to…', 'Save water and seed', ['Use more water', 'Avoid all care', 'Grow wheat'], 'Fields are kept moist, not flooded.', 'SRI uses fewer seedlings and less water.'],
        ]),
      ],
    },
    {
      id: 'ts8.bs.crop.practices', title: 'Agricultural tasks from sowing to harvesting', prereqs: ['ts8.bs.crop.paddy'],
      intro: [
        h('A year on the farm'),
        photo('🚜', 'Tractors, seed drills and harvesters now do much of the work that bullocks and hand tools once did.'),
        stepsB('Preparation of soil: ploughing (tilling) loosens and turns the soil; levelling and adding manure.', 'Sowing: placing good seeds at the right depth and spacing — by hand (broadcasting) or with a seed drill.', 'Adding manure and fertilisers: replacing nutrients taken by crops.', 'Irrigation: supplying water — wells, canals, tanks, drip and sprinkler systems.', 'Protection from weeds: removing unwanted plants by hand, tools or weedicides.', 'Crop protection: controlling pests and diseases.', 'Harvesting: cutting the mature crop by sickle or harvester.', 'Threshing and winnowing: separating grain from stalks and then from chaff.', 'Storage: keeping grain dry in clean bins, gunny bags or silos; using neem leaves against pests.'),
        def('Manure', 'Natural, organic material (cow dung, compost, green manure) made from decomposed plant and animal wastes. It adds humus and improves soil texture.'),
        def('Fertiliser', 'A factory-made chemical rich in a particular nutrient (urea for nitrogen, superphosphate for phosphorus, potash for potassium). Overuse harms soil and water.'),
        def('Weeds', 'Unwanted plants growing with the crop and competing for water, nutrients, space and light, e.g. Parthenium, Cyperus.'),
        def('Crop rotation', 'Growing different crops, often a cereal followed by a legume, one after another in the same field to keep the soil fertile.'),
        p('Drip irrigation delivers water drop by drop to the roots through narrow pipes — ideal for fruit trees, vegetables and dry areas; sprinklers spray water like rain. Mission Kakatiya restored thousands of village tanks in Telangana to store water for irrigation.'),
        keys('Soil prep → sowing → manure → irrigation → weeding → protection → harvest → threshing/winnowing → storage.', 'Manure: organic, improves soil; fertiliser: chemical, nutrient-specific.', 'Drip and sprinkler save water.'),
        remember('Winnowing uses wind to blow away light chaff while heavier grain falls straight down.'),
        tip('Drip = drop by drop at the root; sprinkler = spray like rain.'),
      ],
      examples: [
        ex('Why is a field ploughed before sowing?', ['Ploughing loosens the soil.', 'Roots can go deeper and breathe easily.', 'It brings nutrient-rich soil to the top and mixes in manure.'], 'To loosen and aerate the soil and mix in nutrients.'),
        ex('A field of 2 acres needs 50 kg of urea per acre. How many 25 kg bags must the farmer buy?', ['Total urea = 50 × 2 = 100 kg', 'Bags = 100 ÷ 25 = 4'], '4 bags'),
      ],
      practice: [
        orderT('order-tasks', 'Put these agricultural tasks in order.', ['Ploughing the soil', 'Sowing seeds', 'Irrigation and weeding', 'Harvesting', 'Threshing and winnowing', 'Storage'], ['The soil is prepared first.', 'Grain must be separated before it is stored.'], 'Prepare soil, sow, look after the crop, harvest, separate grain and store it.'),
        matchT('match', 'task to its tool or method', [
          ['Ploughing', 'Plough or tractor'], ['Sowing', 'Seed drill'], ['Harvesting', 'Sickle or combine harvester'], ['Irrigation', 'Drip or sprinkler system'], ['Winnowing', 'Using wind to remove chaff'], ['Weeding', 'Khurpi or weedicide'],
        ], ['A sickle cuts the crop.', 'A seed drill places seeds evenly.']),
        mcq('manure', 'Manure is natural; fertiliser is chemical.', [
          ['Which is an advantage of manure over fertiliser?', 'It adds humus and improves soil texture', ['It is made in factories', 'It contains only one nutrient', 'It pollutes rivers more'], 'Organic matter.', 'Manure adds humus, which improves soil.'],
          ['Urea is a fertiliser rich in…', 'Nitrogen', ['Iron', 'Calcium', 'Carbon only'], 'Leafy growth.', 'Urea supplies nitrogen.'],
          ['Unwanted plants growing among crops are called…', 'Weeds', ['Seedlings', 'Pulses', 'Manure'], 'They compete with crops.', 'Weeds compete for water, nutrients and light.'],
          ['Which irrigation method saves the most water?', 'Drip irrigation', ['Flooding the field', 'Canal flooding', 'Moat system'], 'Drop by drop at the roots.', 'Drip irrigation delivers water only where needed.'],
          ['Separating grain from chaff using wind is…', 'Winnowing', ['Threshing', 'Sowing', 'Ploughing'], 'Chaff is light.', 'Wind blows away the lighter chaff.'],
          ['Growing legumes between cereal crops is called…', 'Crop rotation', ['Mixed weeding', 'Winnowing', 'Transplanting'], 'Crops are rotated.', 'Rotating crops with legumes restores nitrogen.'],
        ]),
        tp('bags', (r) => {
          const per = r.pick([25, 50, 75, 100]), area = r.pick([2, 3, 4, 6]), bag = r.pick([25, 50]);
          const total = per * area, ans = total / bag;
          if (!Number.isInteger(ans)) return numQ(`A farmer uses ${per} kg of fertiliser per acre on ${area} acres. How many kg of fertiliser are needed in total?`, total, 'kg', ['Multiply the amount per acre by the number of acres.', `${per} × ${area}`], [`${per} × ${area} = ${total} kg`]);
          return numQ(`A farmer uses ${per} kg of fertiliser per acre on ${area} acres. Fertiliser is sold in ${bag} kg bags. How many bags are needed?`, ans, undefined,
            ['First find the total fertiliser needed.', `Then divide by the bag size (${bag} kg).`],
            [`Total = ${per} × ${area} = ${total} kg`, `Bags = ${total} ÷ ${bag} = ${ans}`],
            [{ when: String(total), explain: 'That is the total in kg. Divide by the bag size to find the number of bags.' }], 0.001);
        }, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Production of Food from Animals
// =====================================================================================
const ch9: USpec = {
  id: 'ts8.bs.ch9', subject: 'biology', title: 'Production of Food from Animals', source: src(9),
  objectives: [
    {
      id: 'ts8.bs.animal.dairy', title: 'Animal husbandry, dairy animals and their selection', prereqs: [],
      intro: [
        h('Milk from the village to the city'),
        photo('🐃', 'Murrah buffaloes give rich milk. Dairy cooperatives in Telangana collect milk from villages twice a day and supply it to towns.'),
        def('Animal husbandry', 'The scientific care, feeding, breeding and management of domestic animals for food (milk, eggs, meat, honey) and other uses.'),
        def('Milch animals', 'Animals reared for milk, e.g. cows, buffaloes, goats.'),
        def('Draught animals', 'Animals used for work such as ploughing and pulling carts, e.g. bullocks, he-buffaloes.'),
        p('Indian cow breeds: Gir, Sahiwal and Red Sindhi (good milk yield, disease resistance); Ongole (from Andhra Pradesh, a strong draught and dual-purpose breed); Punganur (a small breed). Exotic breeds: Jersey and Holstein-Friesian (high milk yield). Buffalo breeds: Murrah, Mehsana, Jaffarabadi. Cross-breeding Indian and exotic breeds combines high yield with resistance to heat and disease.'),
        def('Lactation period', 'The period after the birth of a calf during which the animal produces milk.'),
        h('Choosing a good dairy animal'),
        stepsB('Healthy, active, with shiny skin and bright eyes.', 'Long lactation period and high milk yield.', 'Well-developed udder with teats of equal size.', 'Resistant to diseases; good appetite.', 'Gives birth regularly (about once a year).'),
        p('Care: clean, airy, dry shelter; balanced feed (green fodder, dry fodder like straw, and concentrates like oil cakes and grains), clean water; regular vaccination against diseases like foot-and-mouth disease; cleaning the animal and milking with clean hands. India’s White Revolution (Operation Flood, led by Dr Verghese Kurien) made India the world’s largest milk producer.'),
        keys('Milch = milk; draught = work.', 'Indian breeds: Gir, Sahiwal, Red Sindhi, Ongole; buffalo: Murrah.', 'Exotic: Jersey, Holstein-Friesian.', 'Select healthy animals with long lactation and good yield.'),
        remember('Dr Verghese Kurien is called the "Father of the White Revolution".'),
        tip('Milk yield over a period = litres per day × number of days.'),
      ],
      examples: [
        ex('A cow gives 12 litres a day for a lactation period of 300 days. What is the total milk yield?', ['Total = litres per day × days', '= 12 × 300', '= 3600 litres'], '3600 litres'),
        ex('Why do farmers cross Indian breeds with exotic breeds?', ['Exotic breeds like Jersey give a lot of milk.', 'Indian breeds tolerate heat and resist local diseases.', 'Crossing combines both qualities.'], 'To get high milk yield along with disease and heat resistance.'),
      ],
      practice: [
        tp('milk', (r) => {
          const l = r.pick([6, 8, 10, 12, 15, 18]), d = r.pick([200, 240, 270, 300]);
          return numQ(`${who(r)}'s buffalo gives ${l} litres of milk a day for a lactation period of ${d} days. What is the total milk yield in litres? (Type the number only.)`, l * d, undefined,
            ['Total = litres per day × number of days.', `Multiply ${l} by ${d}.`],
            [`${l} × ${d} = ${l * d} litres`],
            [{ when: String(l + d), explain: 'Multiply the daily yield by the number of days.' }], 0.001);
        }, 2),
        matchT('match', 'breed to its type', [
          ['Gir', 'Indian milch cow'], ['Sahiwal', 'Indian milch cow'], ['Ongole', 'Strong draught breed from Andhra Pradesh'], ['Murrah', 'Buffalo breed'], ['Jersey', 'Exotic milch cow'], ['Holstein-Friesian', 'Exotic high-yield cow'],
        ], ['Murrah is a buffalo.', 'Jersey and Holstein come from Europe.'], 4),
        mcq('dairy', 'Think about milk, work and health of the animal.', [
          ['Animals reared for milk are called…', 'Milch animals', ['Draught animals', 'Poultry', 'Broilers'], 'Milch → milk.', 'Milch animals are kept for milk.'],
          ['Bullocks used for ploughing are…', 'Draught animals', ['Milch animals', 'Layers', 'Exotic breeds'], 'They do work.', 'Draught animals are used for labour.'],
          ['The period during which a cow gives milk after calving is the…', 'Lactation period', ['Incubation period', 'Gestation period', 'Rest period'], 'Lact = milk.', 'Lactation is milk production after giving birth.'],
          ['Who led India’s White Revolution?', 'Dr Verghese Kurien', ['Dr M. S. Swaminathan', 'Dr C. V. Raman', 'Dr A. P. J. Abdul Kalam'], 'Operation Flood.', 'Kurien led Operation Flood, boosting milk production.'],
          ['Which is a sign of a good dairy animal?', 'Long lactation period and high yield', ['Very short lactation', 'Frequent illness', 'Poor appetite'], 'Productive and healthy.', 'High yield over a long lactation is desirable.'],
          ['Oil cakes and grains given to cattle are called…', 'Concentrates', ['Roughage', 'Fertilisers', 'Vaccines'], 'Rich in nutrients.', 'Concentrates are nutrient-rich feeds.'],
        ]),
        tapT('tap-care', 'Tap every GOOD practice in caring for dairy animals.', [
          ['Clean, airy and dry shed', true], ['Regular vaccination', true], ['Green and dry fodder with concentrates', true], ['Clean drinking water', true], ['Milking with clean hands', true],
          ['Keeping animals in a damp, dark shed', false], ['Feeding plastic waste', false], ['Never cleaning the animal', false],
        ], ['Healthy animals need hygiene, food and protection from disease.', 'Plastic can choke cattle.'], 'Clean sheds, vaccination, good feed, clean water and hygienic milking keep animals healthy.'),
      ],
    },
    {
      id: 'ts8.bs.animal.poultry', title: 'Poultry farming', prereqs: ['ts8.bs.animal.dairy'],
      intro: [
        h('Eggs and chicken for millions'),
        photo('🐔', 'A poultry farm near Hyderabad may house thousands of birds. Telangana is one of India’s leading egg-producing states.'),
        def('Poultry', 'Domestic birds raised for eggs and meat — hens, ducks, turkeys, quails, geese.'),
        def('Layers', 'Hens reared for egg production. A good layer can lay about 250–300 eggs a year. Example: White Leghorn.'),
        def('Broilers', 'Chickens reared for meat. They grow fast and are ready in about 6–8 weeks.'),
        p('Indian (desi) breeds like Aseel and Kadaknath are hardy but give fewer eggs; exotic breeds like White Leghorn give many eggs. Cross-breeds aim for good yield with hardiness.'),
        stepsB('Clean, well-ventilated sheds with proper lighting and temperature.', 'Balanced feed rich in proteins and vitamins for broilers; calcium for layers (for egg shells).', 'Clean drinking water.', 'Vaccination against diseases such as Ranikhet disease and bird flu.', 'Proper disposal of droppings — they make good manure.'),
        def('Incubation', 'Keeping fertilised eggs warm (about 37–38 °C) until chicks hatch, about 21 days for hens. Hatcheries use machines called incubators.'),
        keys('Layers → eggs; broilers → meat.', 'White Leghorn = top egg layer; Aseel = Indian breed.', 'Ranikhet is a common viral poultry disease.', 'Hen eggs hatch in about 21 days.'),
        remember('Poultry droppings are rich in nitrogen and make good manure.'),
        tip('Eggs per year ≈ eggs per week × 52.'),
      ],
      examples: [
        ex('A farm has 500 layers, each laying 5 eggs a week. How many eggs per week?', ['Eggs = birds × eggs per bird', '= 500 × 5', '= 2500'], '2500 eggs per week'),
        ex('Why do layers need extra calcium in their feed?', ['Egg shells are made mainly of calcium carbonate.', 'A hen laying almost daily uses a lot of calcium.'], 'To form strong egg shells.'),
      ],
      practice: [
        mcq('poultry', 'Layers lay; broilers are for meat.', [
          ['Hens reared for eggs are called…', 'Layers', ['Broilers', 'Draught birds', 'Drones'], 'They lay eggs.', 'Layers are egg-producing hens.'],
          ['Chickens reared for meat are called…', 'Broilers', ['Layers', 'Milch birds', 'Workers'], 'Fast-growing.', 'Broilers are raised for meat.'],
          ['Which is a famous egg-laying exotic breed?', 'White Leghorn', ['Aseel', 'Murrah', 'Gir'], 'A white bird.', 'White Leghorn is a high-yield layer.'],
          ['Aseel is…', 'An Indian (desi) poultry breed', ['An exotic cow', 'A fish', 'A bee'], 'Hardy fighting breed.', 'Aseel is an Indian chicken breed.'],
          ['Ranikhet disease affects…', 'Poultry', ['Fish', 'Honey bees', 'Paddy'], 'Named after a hill town.', 'Ranikhet is a viral disease of poultry.'],
          ['A hen’s fertilised egg hatches in about…', '21 days', ['2 days', '9 months', '1 year'], 'Three weeks.', 'Incubation takes about 21 days.'],
        ]),
        tp('eggs', (r) => {
          const b = r.pick([100, 200, 250, 400, 500, 1000]), e = r.pick([4, 5, 6]), w = r.pick([1, 4, 52]);
          const ans = b * e * w;
          return numQ(`A poultry farm has ${b} layers. Each lays ${e} eggs a week. How many eggs does the farm get in ${w} week${w > 1 ? 's' : ''}?`, ans, undefined,
            ['Eggs per week = number of hens × eggs per hen.', w > 1 ? `Then multiply by ${w} weeks.` : 'Only one week is asked.'],
            [`Per week: ${b} × ${e} = ${b * e}`, `In ${w} week(s): ${b * e} × ${w} = ${ans}`],
            w > 1 ? [{ when: String(b * e), explain: `That is one week. Multiply by ${w}.` }] : [], 0.001);
        }, 2),
        tapT('tap-poultry', 'Tap every good practice in a poultry farm.', [
          ['Well-ventilated shed', true], ['Vaccination of birds', true], ['Clean drinking water', true], ['Calcium in feed for layers', true], ['Using droppings as manure', true],
          ['Crowding birds in a damp shed', false], ['Leaving dead birds in the shed', false], ['Giving dirty water', false],
        ], ['Hygiene and nutrition prevent disease.', 'Dead birds spread infection.'], 'Ventilation, vaccination, clean water, proper feed and using droppings as manure are good practices.'),
      ],
    },
    {
      id: 'ts8.bs.animal.bees', title: 'Apiculture (bee-keeping)', prereqs: ['ts8.bs.animal.dairy'],
      intro: [
        h('Honey and wax from tiny workers'),
        photo('🍯', 'Bee-keepers place wooden bee boxes near sunflower fields and mango orchards — the bees make honey and pollinate the crops at the same time.'),
        def('Apiculture', 'The rearing of honey bees for honey and bee-wax. ("Apis" is Latin for bee.)'),
        p('A honey bee colony has three kinds of members: one QUEEN (a fertile female that lays all the eggs), a few hundred DRONES (males that mate with the queen) and thousands of WORKERS (sterile females that collect nectar and pollen, build the comb, care for young, guard the hive and make honey).'),
        p('Indian bees: Apis cerana indica (Indian bee — gentle, kept in boxes), Apis dorsata (rock bee — large, aggressive, gives most wild honey), Apis florea (little bee). Apis mellifera (Italian bee) is a gentle exotic bee that gives high yields and is widely used in boxes.'),
        def('Bee-wax', 'A substance secreted by worker bees to build the honeycomb; used in cosmetics, polishes, candles and medicines.'),
        p('Bees also pollinate crops such as sunflower, mustard, mango and many vegetables, increasing yields. Pesticide overuse kills bees, so farmers and bee-keepers must work together.'),
        keys('Queen lays eggs; drones are males; workers do all the work.', 'Indian bee, rock bee, little bee, Italian bee.', 'Products: honey, wax, propolis.', 'Bees pollinate crops — more fruit and seed.'),
        remember('Honey quality and taste depend on the flowers the bees visit — e.g. sunflower honey, mustard honey, neem honey.'),
        tip('Workers are female, drones are male, and there is only ONE queen per hive.'),
      ],
      examples: [
        ex('Why do sunflower farmers welcome bee-keepers?', ['Sunflowers need pollination to form seeds.', 'Bees carry pollen while collecting nectar.', 'More pollination = more seeds and oil; bee-keepers get honey.'], 'Bees pollinate the crop, increasing yield; both gain.'),
        ex('A bee-keeper has 12 boxes, each giving 8 kg of honey a year. What is the total yield?', ['Total = boxes × yield per box', '= 12 × 8 = 96 kg'], '96 kg'),
      ],
      practice: [
        matchT('match', 'bee to its role or type', [
          ['Queen', 'Lays all the eggs'], ['Drone', 'Male bee'], ['Worker', 'Collects nectar and builds comb'], ['Apis dorsata', 'Rock bee'], ['Apis mellifera', 'Italian bee'], ['Apis florea', 'Little bee'],
        ], ['There is one queen.', 'Dorsata builds huge combs on rocks and buildings.']),
        mcq('bees', 'Remember the three castes and the bee species.', [
          ['Rearing of honey bees is called…', 'Apiculture', ['Sericulture', 'Pisciculture', 'Horticulture'], 'Apis = bee.', 'Apiculture is bee-keeping.'],
          ['Which bees collect nectar and build the honeycomb?', 'Worker bees', ['Drones', 'The queen', 'Larvae'], 'They are the most numerous.', 'Workers do the foraging and comb-building.'],
          ['How many queens are usually in one hive?', 'One', ['Hundreds', 'None', 'Thousands'], 'She lays all the eggs.', 'Each colony has a single queen.'],
          ['Bee-wax is used to make…', 'Candles, polishes and cosmetics', ['Cement', 'Fertilisers', 'Plastic bags'], 'It is the material of the comb.', 'Bee-wax has many industrial uses.'],
          ['Which exotic bee is widely kept for high honey yield?', 'Apis mellifera (Italian bee)', ['Apis dorsata', 'Apis florea', 'Housefly'], 'It is gentle.', 'The Italian bee gives high yields and is easy to manage.'],
          ['Besides honey, bees help farmers by…', 'Pollinating crops', ['Eating weeds', 'Ploughing soil', 'Killing rats'], 'Flowers to seeds.', 'Pollination increases fruit and seed yield.'],
        ]),
        tp('honey', (r) => {
          const b = r.pick([5, 8, 10, 12, 15, 20]), y = r.pick([6, 8, 10, 12]), price = r.pick([300, 400, 500]);
          const total = b * y;
          return numQ(`A bee-keeper has ${b} bee boxes. Each box gives ${y} kg of honey a year, sold at ₹${price} per kg. How many rupees does the honey earn in a year? (Type the number only.)`, total * price, undefined,
            ['First find the total honey in kg.', `Then multiply by ₹${price} per kg.`],
            [`Honey = ${b} × ${y} = ${total} kg`, `Earnings = ${total} × ${price} = ₹${total * price}`],
            [{ when: String(total), explain: 'That is the honey in kg. Multiply by the price per kg.' }], 0.001);
        }, 2),
      ],
    },
    {
      id: 'ts8.bs.animal.fish', title: 'Fisheries', prereqs: ['ts8.bs.animal.dairy'],
      intro: [
        h('Fish from tanks, rivers and the sea'),
        photo('🐟', 'Under Telangana’s free fish-seed scheme, lakhs of fingerlings are released into village tanks and reservoirs each year for local fishermen.'),
        def('Fisheries', 'The catching, rearing and selling of fish and other aquatic animals such as prawns, crabs and shellfish.'),
        def('Capture fishing', 'Catching fish from natural sources — sea (marine) or rivers, lakes and reservoirs (inland).'),
        def('Culture fishery (aquaculture)', 'Rearing fish in ponds, tanks and reservoirs under controlled conditions. Pisciculture is fish farming.'),
        p('Marine fish: pomfret, mackerel, tuna, sardine, Bombay duck; prawns and lobsters. Inland fish: rohu, catla, mrigal, common carp, murrel. Fish are rich in proteins and omega-3 fats; fish liver oil gives vitamins A and D.'),
        def('Composite fish culture', 'Growing five or six species of fish together in one pond, each feeding at a different level, so that all the food in the pond is used without competition.'),
        p('In composite culture: catla feeds at the surface, rohu in the middle layer, mrigal and common carp at the bottom, and grass carp eats water weeds. Fish seed (fingerlings) is raised in hatcheries.'),
        keys('Capture (catch from nature) vs culture (rear in ponds).', 'Marine (sea) vs inland (fresh water).', 'Composite culture: catla (surface), rohu (middle), mrigal and common carp (bottom).'),
        remember('Fishing nets with very small mesh catch baby fish and destroy future stocks; mesh-size rules protect fisheries.'),
        tip('C-R-M from top to bottom: Catla, Rohu, Mrigal.'),
      ],
      examples: [
        ex('Why do farmers keep catla, rohu and mrigal together in one tank?', ['They feed at different depths: surface, middle and bottom.', 'They do not compete for the same food.', 'All parts of the pond are used, increasing total yield.'], 'They use different food zones, so yield is higher (composite culture).'),
        ex('A tank is stocked with 2000 fingerlings; 80% survive. How many fish can be harvested?', ['Survivors = 80% of 2000', '= 0.8 × 2000', '= 1600'], '1600 fish'),
      ],
      practice: [
        matchT('match', 'fish to its feeding zone in composite culture', [
          ['Catla', 'Surface'], ['Rohu', 'Middle layer'], ['Mrigal', 'Bottom'], ['Common carp', 'Bottom'], ['Grass carp', 'Water weeds'],
        ], ['Catla has an upturned mouth for the surface.', 'Grass carp eats plants.']),
        mcq('fish', 'Capture vs culture; marine vs inland.', [
          ['Rearing fish in ponds is called…', 'Culture fishery (pisciculture)', ['Capture fishery', 'Apiculture', 'Sericulture'], 'Pisces = fish.', 'Fish farming is culture fishery.'],
          ['Which is a marine fish?', 'Pomfret', ['Rohu', 'Catla', 'Mrigal'], 'From the sea.', 'Pomfret lives in the sea; the others are freshwater.'],
          ['Growing several fish species together in one pond is…', 'Composite fish culture', ['Monoculture', 'Capture fishing', 'Crop rotation'], 'A mixture.', 'Composite culture uses all feeding zones.'],
          ['Fish liver oil is rich in vitamins…', 'A and D', ['B and C', 'K only', 'E only'], 'Cod liver oil.', 'Fish liver oil supplies vitamins A and D.'],
          ['Young fish used to stock ponds are called…', 'Fingerlings (fish seed)', ['Tadpoles', 'Larvae of bees', 'Spawn of frogs'], 'They are finger-sized.', 'Fingerlings are young fish used for stocking.'],
          ['Why are very small-mesh nets harmful?', 'They catch baby fish and reduce future stocks', ['They catch too few fish', 'They pollute water', 'They are too costly'], 'Young fish need to grow.', 'Catching young fish prevents them from breeding.'],
        ]),
        tp('survive', (r) => {
          const n = r.pick([1000, 2000, 4000, 5000, 10000]), pc = r.pick([60, 70, 75, 80, 90]);
          const ans = n * pc / 100;
          return numQ(`A village tank is stocked with ${n} fingerlings. If ${pc}% survive to harvest, how many fish are harvested?`, ans, undefined,
            ['Survivors = percentage × total ÷ 100.', `${pc} × ${n} ÷ 100`],
            [`${pc}% of ${n} = ${pc} × ${n} ÷ 100 = ${ans}`],
            [{ when: String(n - ans), explain: 'That is the number that did NOT survive.' }], 0.001);
        }, 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Not for Breathing, Not for Drinking
// =====================================================================================
const ch10: USpec = {
  id: 'ts8.bs.ch10', subject: 'biology', title: 'Not for Breathing — Not for Drinking', source: src(10),
  objectives: [
    {
      id: 'ts8.bs.poll.air', title: 'Air pollution: pollutants, causes and effects', prereqs: [],
      intro: [
        h('When the air makes us ill'),
        photo('💨', 'On busy roads in Hyderabad, exhaust from lakhs of vehicles fills the air with smoke, dust and harmful gases.'),
        def('Air pollution', 'The contamination of air by harmful substances (pollutants) that affect living things and materials.'),
        def('Pollutant', 'A substance that pollutes the environment, e.g. smoke, dust, carbon monoxide, sulphur dioxide.'),
        h('Causes'),
        p('Natural: volcanic eruptions, forest fires caused by lightning, dust storms, pollen grains. Human: burning petrol and diesel in vehicles, factories and thermal power plants (burning coal), burning garbage and crop stubble, firecrackers, construction dust, mining, and use of CFCs (in old refrigerators and sprays).'),
        h('Main pollutants and their effects'),
        p('Carbon monoxide (CO) from incomplete burning — it combines with haemoglobin and reduces oxygen supply, which can be fatal in closed rooms. Sulphur dioxide and nitrogen oxides — irritate lungs and form acid rain. Particulate matter (fine dust, smoke, PM2.5) — causes asthma, bronchitis and lung disease. CFCs — damage the ozone layer that shields us from ultraviolet rays. Carbon dioxide (in excess) — traps heat (greenhouse effect), causing global warming.'),
        def('Acid rain', 'Rain made acidic when sulphur dioxide and nitrogen oxides dissolve in rainwater. It damages crops, soil, lakes and buildings — the marble of the Taj Mahal is being corroded ("marble cancer").'),
        def('Global warming', 'The rise in the average temperature of the Earth due to excess greenhouse gases like carbon dioxide and methane trapping heat.'),
        keys('Natural causes: volcanoes, forest fires, dust storms, pollen.', 'Human causes: vehicles, factories, burning fuels and waste.', 'CO reduces oxygen in blood; SO₂ and NOₓ cause acid rain; CFCs harm ozone; CO₂ causes global warming.'),
        remember('Never run a coal stove or engine in a closed room — carbon monoxide has no smell and can kill.'),
        tip('Times above the safe limit = measured level ÷ safe limit.'),
      ],
      examples: [
        ex('The PM2.5 level on a winter day was 180 µg/m³. India’s 24-hour safe limit is 60 µg/m³. How many times the limit is this?', ['Times = measured ÷ limit', '= 180 ÷ 60', '= 3'], '3 times the safe limit'),
        ex('Why is the Taj Mahal turning yellow?', ['Nearby industries release SO₂ and nitrogen oxides.', 'These form acid rain, which corrodes marble.', 'Soot particles also discolour it.'], 'Acid rain and soot from air pollution damage the marble.'),
      ],
      practice: [
        matchT('match', 'pollutant to its effect', [
          ['Carbon monoxide', 'Reduces oxygen carried by blood'], ['Sulphur dioxide', 'Acid rain'], ['CFCs', 'Damage the ozone layer'], ['Carbon dioxide (excess)', 'Global warming'], ['Fine dust (PM2.5)', 'Asthma and lung disease'],
        ], ['CFCs are linked with ozone.', 'CO binds haemoglobin.']),
        tapT('tap-natural', 'Tap every NATURAL cause of air pollution.', [
          ['Volcanic eruption', true], ['Forest fire caused by lightning', true], ['Dust storm', true], ['Pollen grains', true],
          ['Vehicle exhaust', false], ['Burning garbage', false], ['Thermal power plant smoke', false], ['Bursting firecrackers', false],
        ], ['Natural causes happen without human action.', 'Machines and burning by people are human causes.'], 'Volcanoes, lightning fires, dust storms and pollen are natural; vehicles, burning waste, power plants and firecrackers are human-made.'),
        mcq('air', 'Link each gas to the damage it does.', [
          ['Which gas from vehicles reduces the oxygen-carrying capacity of blood?', 'Carbon monoxide', ['Oxygen', 'Nitrogen', 'Water vapour'], 'It binds haemoglobin.', 'CO combines with haemoglobin, blocking oxygen.'],
          ['Acid rain is mainly caused by…', 'Sulphur dioxide and nitrogen oxides', ['Oxygen and nitrogen', 'Water vapour', 'Pollen'], 'From burning coal and fuel.', 'These gases dissolve in rain to form acids.'],
          ['The ozone layer protects us from…', 'Ultraviolet rays', ['Rain', 'Sound', 'Cold'], 'It is high in the atmosphere.', 'Ozone absorbs harmful UV radiation.'],
          ['"Marble cancer" of the Taj Mahal is due to…', 'Acid rain', ['Earthquakes', 'Too much sunlight', 'Birds'], 'Acids corrode marble.', 'Acid rain eats away at the marble.'],
          ['The increase in Earth’s temperature due to greenhouse gases is…', 'Global warming', ['Acid rain', 'Ozone formation', 'Photosynthesis'], 'Heat is trapped.', 'Excess CO₂ and methane cause global warming.'],
          ['Which gas is mainly blamed for damaging the ozone layer?', 'CFCs (chlorofluorocarbons)', ['Oxygen', 'Nitrogen', 'Hydrogen'], 'Used in old fridges and sprays.', 'CFCs break down ozone molecules.'],
        ]),
        tp('limit', (r) => {
          const lim = r.pick<[string, number]>([['PM2.5', 60], ['PM10', 100]]);
          const k = r.pick([1.5, 2, 2.5, 3, 4]);
          const val = lim[1] * k;
          return numQ(`The 24-hour safe limit for ${lim[0]} in India is ${lim[1]} µg/m³. A city recorded ${val} µg/m³. How many times the safe limit is this?`, k, undefined,
            ['Times = measured level ÷ safe limit.', `${val} ÷ ${lim[1]}`],
            [`${val} ÷ ${lim[1]} = ${k}`, `The air has ${k} times the safe level of ${lim[0]}.`],
            [{ when: String(val - lim[1]), explain: 'That is how much it is above the limit, not how many times.' }], 0.01);
        }, 2),
      ],
    },
    {
      id: 'ts8.bs.poll.water', title: 'Water pollution: sources and effects', prereqs: ['ts8.bs.poll.air'],
      intro: [
        h('Rivers and lakes in trouble'),
        photo('💧', 'Only about 2.5% of Earth’s water is fresh, and much of it is frozen. Polluting the little we can use is a serious problem.'),
        def('Water pollution', 'Contamination of water bodies by harmful substances that make the water unfit for use and harm living organisms.'),
        h('Sources'),
        p('Untreated sewage from homes; industrial waste with chemicals and heavy metals (lead, mercury, arsenic); fertilisers and pesticides washed from farms; garbage and plastics; washing clothes, cattle and vehicles in rivers and lakes; immersion of painted idols; oil spills at sea; hot water from power plants.'),
        def('Eutrophication', 'Excess nutrients (from fertilisers and sewage) cause algae to grow rapidly (algal bloom). When they die, bacteria decompose them, using up the oxygen in the water, so fish and other animals die.'),
        h('Effects'),
        p('Water-borne diseases like cholera, typhoid, jaundice (hepatitis A) and diarrhoea; death of fish and other aquatic life; poisonous metals entering food chains; foul smell and loss of beauty of lakes. Hussain Sagar in Hyderabad has suffered from sewage, industrial waste and idol immersion; efforts are under way to clean it.'),
        def('Potable water', 'Water that is safe to drink.'),
        keys('Sources: sewage, industrial waste, agricultural chemicals, garbage, idol immersion, oil spills.', 'Eutrophication: algal bloom → oxygen loss → fish die.', 'Effects: water-borne diseases, loss of aquatic life, toxins in food.'),
        remember('Clear-looking water is not always safe — it may contain invisible germs and dissolved chemicals.'),
        tip('Follow the chain: fertiliser → algae boom → algae die → bacteria use oxygen → fish suffocate.'),
      ],
      examples: [
        ex('A lake near farmland turns bright green and then fish start dying. Explain.', ['Fertilisers washed into the lake add nutrients.', 'Algae grow rapidly (algal bloom).', 'Dead algae are decomposed by bacteria, which use up dissolved oxygen.', 'Fish die from lack of oxygen.'], 'Eutrophication'),
        ex('Why is it unsafe to drink water from a clear-looking stream near a village?', ['It may contain germs from sewage or animal waste.', 'It may contain dissolved chemicals.', 'These are invisible.'], 'Clear water may still carry germs and chemicals.'),
      ],
      practice: [
        orderT('order-eutro', 'Put the steps of eutrophication in order.', [
          'Fertilisers and sewage enter the lake', 'Algae grow rapidly (algal bloom)', 'Algae die', 'Bacteria decompose them, using up oxygen', 'Fish die from lack of oxygen',
        ], ['Nutrients come first.', 'Fish die at the end.'], 'Nutrients → algal bloom → algae die → oxygen used up → fish die.'),
        tapT('tap-source', 'Tap every SOURCE of water pollution.', [
          ['Untreated sewage', true], ['Factory chemical waste', true], ['Fertilisers washed from fields', true], ['Immersion of painted idols', true], ['Oil spills', true], ['Washing vehicles in a lake', true],
          ['Rainwater harvesting', false], ['Planting trees along the bank', false],
        ], ['Sources add harmful material to water.', 'Some actions protect water.'], 'Sewage, industrial waste, fertilisers, idol immersion, oil spills and washing vehicles pollute; harvesting rain and planting trees protect water.', 6),
        mcq('water', 'Trace where the pollution comes from and what it does.', [
          ['Which disease spreads through polluted water?', 'Cholera', ['Malaria', 'Tuberculosis', 'Diabetes'], 'It causes severe diarrhoea.', 'Cholera bacteria spread through contaminated water.'],
          ['Water that is safe to drink is called…', 'Potable water', ['Hard water', 'Sea water', 'Waste water'], 'Potable = drinkable.', 'Potable water is fit for drinking.'],
          ['Excessive growth of algae due to nutrients in water is…', 'Eutrophication (algal bloom)', ['Photosynthesis', 'Filtration', 'Chlorination'], 'It starts with fertilisers.', 'Nutrient overload causes algal blooms.'],
          ['Why do fish die in eutrophic lakes?', 'Dissolved oxygen is used up', ['The water becomes too cold', 'There is too much oxygen', 'Algae eat the fish'], 'Decomposition uses oxygen.', 'Bacteria decomposing algae use up the oxygen.'],
          ['Mercury and lead in water come mainly from…', 'Industrial waste', ['Rainfall', 'Fish', 'Sunlight'], 'Heavy metals.', 'Factories release heavy metals into water.'],
          ['Which Hyderabad lake is known for pollution from sewage and idol immersion?', 'Hussain Sagar', ['Pakhal', 'Ramappa', 'Laknavaram'], 'It has a Buddha statue in the middle.', 'Hussain Sagar has suffered heavy pollution.'],
        ]),
      ],
    },
    {
      id: 'ts8.bs.poll.prevent', title: 'Prevention and control of pollution', prereqs: ['ts8.bs.poll.water'],
      intro: [
        h('What we can do'),
        photo('🚲', 'Cycling or walking short distances keeps the air cleaner and keeps you fit.'),
        h('Controlling air pollution'),
        p('Use public transport, car-pooling, cycles and walking; switch to CNG, electric vehicles and unleaded petrol; keep vehicles serviced (Pollution Under Control — PUC — certificates); fit factory chimneys with filters and scrubbers; use LPG and solar cookers instead of firewood; do not burn garbage or crop stubble; plant trees; use energy wisely.'),
        h('Controlling water pollution'),
        p('Treat sewage in sewage treatment plants before releasing it; treat industrial waste; use organic manure and fewer chemicals in farms; do not throw garbage, plastics or idols into lakes; use clay (eco-friendly) idols; do not wash clothes and cattle in drinking-water sources.'),
        h('Making water safe to drink'),
        stepsB('Filtration — through cloth or candle filters to remove suspended particles.', 'Boiling — kills germs.', 'Chlorination — adding chlorine tablets or bleaching powder kills germs (used in town water supply).', 'Other methods: alum to settle mud, UV and RO purifiers.'),
        def('The 3 Rs', 'Reduce (use less), Reuse (use again), Recycle (make new things from waste) — habits that reduce pollution.'),
        keys('Air: public transport, CNG/electric, PUC, filters, no burning, more trees.', 'Water: treat sewage and industrial waste, less chemicals, eco-friendly idols.', 'Safe water: filter, boil, chlorinate.', 'Reduce, Reuse, Recycle.'),
        remember('Mission Bhagiratha supplies treated drinking water through pipes to households across Telangana.'),
        tip('Boiling kills germs but does not remove dissolved chemicals — that needs treatment such as RO.'),
      ],
      examples: [
        ex('A family uses a car to drive 1 km to the market every day. Suggest two changes to reduce air pollution.', ['Walk or cycle for short distances.', 'Use public transport or share rides.', 'Keep the car serviced and get a PUC certificate.'], 'Walk or cycle; use shared or public transport.'),
        ex('Why are clay Ganesh idols better than plaster-of-Paris idols for lakes?', ['Clay dissolves naturally and is harmless.', 'Plaster of Paris does not dissolve easily and paints contain toxic chemicals.', 'They pollute water and harm fish.'], 'Clay idols dissolve without releasing toxic chemicals.'),
      ],
      practice: [
        tapT('tap-reduce', 'Tap every action that REDUCES pollution.', [
          ['Using public transport', true], ['Planting trees', true], ['Using clay idols', true], ['Treating sewage before release', true], ['Using a cycle for short trips', true], ['Using solar cookers', true],
          ['Burning plastic waste', false], ['Washing cattle in drinking-water ponds', false], ['Burning crop stubble', false],
        ], ['Ask: does this add harmful material to air or water?', 'Burning adds smoke.'], 'Public transport, trees, clay idols, sewage treatment, cycling and solar cookers reduce pollution; burning and washing cattle in ponds add to it.', 6),
        matchT('match', 'method to what it does', [
          ['Boiling', 'Kills germs in water'], ['Chlorination', 'Disinfects town water supply'], ['Filtration', 'Removes suspended particles'], ['Alum', 'Makes mud settle'], ['Sewage treatment plant', 'Cleans waste water before release'], ['PUC certificate', 'Checks vehicle emissions'],
        ], ['Chlorine kills germs.', 'Alum makes particles clump and settle.']),
        mcq('control', 'Choose the action that stops pollution at its source.', [
          ['Which fuel causes less air pollution in vehicles?', 'CNG', ['Diesel in old engines', 'Coal', 'Firewood'], 'Compressed natural gas.', 'CNG burns more cleanly.'],
          ['The 3 Rs stand for…', 'Reduce, Reuse, Recycle', ['Read, Write, Recite', 'Rain, River, Reservoir', 'Run, Rest, Repeat'], 'Waste management habits.', 'Reduce, Reuse and Recycle cut waste and pollution.'],
          ['Which method is used to disinfect water supplied to towns?', 'Chlorination', ['Freezing', 'Adding sugar', 'Adding salt'], 'Bleaching powder or chlorine.', 'Chlorine kills germs in the supply.'],
          ['Which does NOT remove dissolved harmful chemicals from water?', 'Boiling', ['Reverse osmosis', 'Proper industrial treatment', 'Not dumping the chemicals in the first place'], 'Boiling kills germs only.', 'Boiling kills germs but leaves dissolved chemicals.'],
          ['Factory chimneys can be fitted with ___ to reduce smoke.', 'Filters and scrubbers', ['Fans', 'Mirrors', 'Speakers'], 'They trap particles.', 'Filters and scrubbers remove particles and gases.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Why do we fall ill?
// =====================================================================================
const ch11: USpec = {
  id: 'ts8.bs.ch11', subject: 'biology', title: 'Why do we fall ill?', source: src(11),
  objectives: [
    {
      id: 'ts8.bs.ill.health', title: 'Health and its significance', prereqs: [],
      intro: [
        h('Health is more than not being ill'),
        photo('🧘', 'Being healthy means feeling well in body and mind, and getting along well with the people around you.'),
        def('Health', 'According to the World Health Organization (WHO), health is a state of complete physical, mental and social well-being, and not merely the absence of disease.'),
        p('Personal health depends on the community. A person may eat well and stay clean, but if the colony has open drains, garbage heaps and stagnant water, mosquitoes and germs will still spread. Clean surroundings, safe drinking water, good food, a job or school, and peace in society all affect health.'),
        def('Personal hygiene', 'Habits that keep the body clean — bathing, washing hands with soap, brushing teeth, trimming nails, wearing clean clothes.'),
        def('Community health', 'Health of a whole community, maintained by clean water, proper drainage, garbage disposal, vaccination drives and hospitals.'),
        keys('Health = physical + mental + social well-being.', 'Individual health depends on community health.', 'Food, cleanliness, exercise, rest and a safe environment are needed.'),
        remember('Washing hands with soap for 20 seconds before eating and after using the toilet prevents many diseases.'),
        tip('Ask three questions about health: Body? Mind? Relationships?'),
      ],
      examples: [
        ex('Sana eats well and exercises, but she is very anxious about exams and cannot sleep. Is she fully healthy?', ['Physical health seems good.', 'Her mental well-being is disturbed.', 'Health includes mental well-being.'], 'No — her mental health also needs care.'),
        ex('Why can a clean family still fall ill if their street has open drains?', ['Open drains breed mosquitoes and flies.', 'These carry germs to every house.', 'Personal health depends on community cleanliness.'], 'Community hygiene affects everyone’s health.'),
      ],
      practice: [
        mcq('health', 'Health has physical, mental and social parts.', [
          ['According to WHO, health is…', 'Complete physical, mental and social well-being', ['Only the absence of disease', 'Only being strong', 'Having money'], 'Three parts.', 'WHO defines health as physical, mental and social well-being.'],
          ['Why does a clean neighbourhood matter for personal health?', 'Germs and carriers from dirty surroundings reach everyone', ['It does not matter', 'Only for looks', 'Only for adults'], 'Mosquitoes travel.', 'Community hygiene limits the spread of disease.'],
          ['Which is a personal hygiene habit?', 'Washing hands with soap before eating', ['Throwing garbage on the road', 'Letting water stagnate', 'Sharing toothbrushes'], 'It is about your own body.', 'Handwashing removes germs.'],
          ['Which is a community health measure?', 'A vaccination drive in the village', ['Brushing your teeth', 'Trimming your nails', 'Bathing daily'], 'Done for everyone together.', 'Vaccination drives protect the whole community.'],
          ['Feeling lonely and left out affects which part of health?', 'Social and mental well-being', ['Only physical health', 'Nothing', 'Only eyesight'], 'Relationships matter.', 'Social isolation affects social and mental health.'],
        ]),
        tapT('tap-good', 'Tap every habit that supports good HEALTH.', [
          ['Eating a balanced diet', true], ['Sleeping 8–9 hours', true], ['Playing outdoors', true], ['Washing hands with soap', true], ['Talking about worries with friends or family', true],
          ['Drinking untreated pond water', false], ['Skipping meals regularly', false], ['Leaving water in old tyres', false],
        ], ['Think of body, mind and surroundings.', 'Stagnant water breeds mosquitoes.'], 'Good food, sleep, exercise, hygiene and sharing worries support health.'),
        matchT('match', 'need to how it keeps us healthy', [
          ['Balanced diet', 'Provides all nutrients'], ['Clean drinking water', 'Prevents water-borne disease'], ['Exercise', 'Keeps muscles, heart and mind fit'], ['Rest and sleep', 'Lets the body recover'], ['Garbage disposal', 'Stops flies and germs breeding'],
        ], ['Water-borne diseases come from dirty water.', 'Flies breed in garbage.']),
      ],
    },
    {
      id: 'ts8.bs.ill.disease', title: 'Disease and its causes; acute and chronic diseases', prereqs: ['ts8.bs.ill.health'],
      intro: [
        h('What goes wrong'),
        photo('🧑‍⚕️', 'A disease shows itself through symptoms such as fever, cough or pain. A doctor uses symptoms and tests to find the cause.'),
        def('Disease', 'A condition in which the normal functioning of the body or a part of it is disturbed ("dis-ease" = lack of ease).'),
        def('Symptoms', 'Signs of a disease that the patient feels or shows, such as fever, headache, cough, loose motions.'),
        h('Causes'),
        p('Immediate causes are the direct reasons — for example a microbe (bacteria, virus, protozoa, fungi or worms) entering the body. Contributory causes make a person more likely to fall ill — poor nutrition, lack of clean water, unhygienic surroundings, poverty, genetic factors, lack of vaccination. Usually both act together: a well-fed child who has a germ may recover quickly, while an undernourished child may become seriously ill.'),
        def('Acute disease', 'A disease that lasts for a short time (days to a few weeks), e.g. common cold, typhoid, cholera, jaundice.'),
        def('Chronic disease', 'A disease that lasts a long time (months or years, often lifelong), e.g. tuberculosis, diabetes, high blood pressure, elephantiasis, asthma.'),
        p('Chronic diseases have longer-lasting effects on health — a child with a chronic illness may lose weight, fall behind in school and tire easily.'),
        keys('Disease = disturbance in normal body function.', 'Immediate causes (germs) + contributory causes (poor food, hygiene, genes).', 'Acute: short. Chronic: long.'),
        remember('Diseases can also be caused by deficiency (lack of a nutrient — scurvy, anaemia, night blindness).'),
        tip('Acute = abrupt and short; Chronic = continues for a long time (chronos = time).'),
      ],
      examples: [
        ex('Classify as acute or chronic: common cold, diabetes, typhoid, tuberculosis.', ['Cold and typhoid last days to weeks → acute.', 'Diabetes is lifelong; TB lasts months → chronic.'], 'Acute: cold, typhoid. Chronic: diabetes, TB.'),
        ex('Two children drink the same contaminated water. Only one falls seriously ill. Why?', ['The immediate cause (the germ) is the same.', 'Contributory causes differ — the ill child may be undernourished or weak.', 'A well-nourished body fights infection better.'], 'Contributory causes such as poor nutrition made the difference.'),
      ],
      practice: [
        tp('acute', (r) => {
          const A = ['Common cold', 'Typhoid', 'Cholera', 'Jaundice (hepatitis A)', 'Diarrhoea'], C = ['Diabetes', 'Tuberculosis', 'High blood pressure', 'Elephantiasis', 'Asthma'];
          const isA = r.next() < 0.5, d = r.pick(isA ? A : C);
          const kind = isA ? 'Acute (lasts a short time)' : 'Chronic (lasts a long time)';
          return {
            type: 'mcq', prompt: `Is ${d.toLowerCase()} usually an acute or a chronic disease?`, ...choose(r, kind, [isA ? 'Chronic (lasts a long time)' : 'Acute (lasts a short time)', 'It is not a disease']),
            hints: ['Acute = days to weeks; chronic = months to years.', 'Think how long a patient usually suffers from it.'],
            mistakes: [{ when: 'wrong', explain: `Not quite. ${d} is ${isA ? 'acute' : 'chronic'}.` }],
            solution: [`${d} → ${kind}.`],
          };
        }),
        mcq('causes', 'Separate the germ from the conditions that help it.', [
          ['Which is an IMMEDIATE cause of disease?', 'Bacteria entering the body', ['Poverty', 'Poor nutrition', 'Lack of clean surroundings'], 'The direct cause.', 'The microbe directly causes the disease.'],
          ['Which is a CONTRIBUTORY cause of disease?', 'Poor nutrition', ['The typhoid bacterium', 'The polio virus', 'Plasmodium'], 'It makes illness more likely.', 'Undernutrition weakens the body’s defences.'],
          ['Fever, cough and headache are examples of…', 'Symptoms', ['Vaccines', 'Antibiotics', 'Causes'], 'What the patient feels.', 'They are signs (symptoms) of disease.'],
          ['"Dis-ease" literally means…', 'Lack of ease or comfort', ['A strong body', 'A medicine', 'A microbe'], 'Look at the parts of the word.', 'Disease means being "not at ease".'],
          ['Scurvy is caused by lack of…', 'Vitamin C', ['Iron', 'Iodine', 'Vitamin D'], 'Bleeding gums.', 'Scurvy is a vitamin C deficiency disease.'],
          ['Why do chronic diseases affect health more severely?', 'They last a long time and drain the body', ['They are always infectious', 'They last a day', 'They have no symptoms'], 'Think of duration.', 'Long-lasting illness affects growth, work and learning.'],
        ]),
        tapT('tap-chronic', 'Tap every CHRONIC disease.', [
          ['Diabetes', true], ['Tuberculosis', true], ['High blood pressure', true], ['Elephantiasis', true], ['Asthma', true],
          ['Common cold', false], ['Cholera', false], ['Typhoid', false],
        ], ['Chronic diseases last months or years.', 'A cold lasts only days.'], 'Diabetes, TB, high BP, elephantiasis and asthma are chronic; cold, cholera and typhoid are acute.'),
      ],
    },
    {
      id: 'ts8.bs.ill.spread', title: 'Infectious and non-infectious diseases; how they spread', prereqs: ['ts8.bs.ill.disease'],
      intro: [
        h('Can it be caught?'),
        photo('🌀', 'A sneeze can send thousands of tiny droplets into the air. If they carry germs, people nearby may breathe them in.'),
        def('Infectious (communicable) disease', 'A disease caused by a microbe that can spread from one person to another, e.g. TB, cholera, malaria, dengue, chickenpox, COVID-19.'),
        def('Non-infectious (non-communicable) disease', 'A disease that does not spread from person to person; caused by internal factors, lifestyle or deficiency, e.g. diabetes, cancer, high blood pressure, heart disease, anaemia.'),
        h('Means of spread'),
        p('Air: droplets from coughs and sneezes — common cold, TB, flu, measles, COVID-19. Water and food: contaminated by faeces — cholera, typhoid, hepatitis A, diarrhoea. Vectors (carriers): female Anopheles mosquito → malaria; Aedes mosquito → dengue, chikungunya; Culex mosquito → filariasis (elephantiasis); houseflies carry germs to food. Contact: skin infections, scabies. Body fluids: blood transfusion, shared needles and sexual contact — HIV/AIDS, hepatitis B; from mother to baby.'),
        def('Vector', 'An organism (often an insect) that carries a pathogen from one host to another without itself suffering from the disease.'),
        xp({
          title: 'What if? How fast an infection spreads', formula: 'new cases in round n = C × Rⁿ',
          res: ['N', 'New cases in that round', '', 'C * R ^ n', 0],
          vars: [['C', 'Starting cases', '', 1, 20, 1, 1], ['R', 'People each case infects', '', 0.5, 4, 0.1, 2], ['n', 'Rounds of spread', '', 0, 10, 1, 5]],
          notes: [
            ['R', 'If each person infects more than one other, cases multiply rapidly — an outbreak grows.', 'If R falls below 1 (masks, handwashing, vaccination), each round has fewer cases and the outbreak dies out.'],
            ['n', 'Each extra round multiplies cases by R again.', 'Stopping spread early keeps numbers small.'],
            ['C', 'More starting cases mean more cases in every round.', 'Isolating early cases reduces everything that follows.'],
          ],
          mistakes: [['"Reducing R from 2 to 1.5 only makes a small difference."', 'Because R is multiplied again every round, a small change grows into a huge difference after several rounds.']],
          real: 'Vaccination, masks and handwashing work by lowering the number of people each infected person passes the germ to.',
        }),
        keys('Infectious diseases spread; non-infectious do not.', 'Spread by air, water/food, vectors, contact, body fluids.', 'Anopheles → malaria; Aedes → dengue; Culex → filariasis.'),
        remember('Only the FEMALE mosquito bites and sucks blood (she needs it for her eggs), so only females spread malaria and dengue.'),
        tip('Stagnant water = mosquito nursery. Empty coolers, pots and tyres every week.'),
      ],
      examples: [
        ex('One person with flu infects 3 others; each of them infects 3 more, and so on. How many new cases are there in the 3rd round?', ['Round 1: 3', 'Round 2: 3 × 3 = 9', 'Round 3: 9 × 3 = 27 (= 3³)'], '27 new cases'),
        ex('Why is diabetes called a non-infectious disease?', ['It is caused by the body not making or using insulin properly.', 'No microbe is involved.', 'So it cannot be caught from someone.'], 'It is not caused by a germ and does not spread.'),
      ],
      practice: [
        matchT('match', 'disease to how it spreads', [
          ['Malaria', 'Female Anopheles mosquito'], ['Dengue', 'Aedes mosquito'], ['Cholera', 'Contaminated water'], ['Tuberculosis', 'Air (coughs and sneezes)'], ['Filariasis', 'Culex mosquito'], ['Hepatitis B', 'Blood and body fluids'],
        ], ['Malaria and dengue are spread by different mosquitoes.', 'TB affects the lungs.']),
        tp('spread', (r) => {
          const R = r.pick([2, 3, 4]), n = r.pick([2, 3, 4, 5]), C = r.pick([1, 2, 5]);
          const ans = C * R ** n;
          return numQ(`${C === 1 ? 'One person has' : `${C} people have`} an infection. Each infected person passes it to ${R} new people, who then do the same. How many NEW cases are there in round ${n}?`, ans, undefined,
            ['Each round multiplies the number of new cases by ' + R + '.', `New cases = ${C} × ${R}^${n}.`],
            [`${C} × ${R}^${n} = ${C} × ${R ** n} = ${ans}`],
            [{ when: String(C * R * n), explain: 'Cases multiply each round; they do not just add.' }], 0.001);
        }, 2),
        tapT('tap-infect', 'Tap every INFECTIOUS disease.', [
          ['Tuberculosis', true], ['Cholera', true], ['Malaria', true], ['Dengue', true], ['Chickenpox', true],
          ['Diabetes', false], ['High blood pressure', false], ['Anaemia', false], ['Cancer', false],
        ], ['Infectious diseases are caused by germs that spread.', 'Lifestyle and deficiency diseases do not spread.'], 'TB, cholera, malaria, dengue and chickenpox spread; diabetes, BP, anaemia and cancer do not.'),
        mcq('vector', 'Who carries the germ, and how?', [
          ['Malaria is spread by…', 'Female Anopheles mosquito', ['Housefly', 'Male Aedes mosquito', 'Cockroach'], 'Only females bite.', 'The female Anopheles transmits Plasmodium.'],
          ['An organism that carries a pathogen from one host to another is a…', 'Vector', ['Vaccine', 'Producer', 'Symptom'], 'Like a mosquito.', 'Vectors carry pathogens between hosts.'],
          ['Which disease spreads through the air?', 'Tuberculosis', ['Cholera', 'Diabetes', 'Dengue'], 'Coughs and sneezes.', 'TB germs spread in droplets.'],
          ['Houseflies spread disease by…', 'Carrying germs from garbage to food', ['Biting people', 'Laying eggs in water tanks', 'Producing toxins in air'], 'Their legs carry dirt.', 'Flies move germs from waste to uncovered food.'],
          ['Why should coolers and pots be emptied every week?', 'To stop mosquitoes breeding in stagnant water', ['To save electricity', 'To clean the air', 'To feed fish'], 'Mosquito larvae live in water.', 'Removing stagnant water prevents mosquito breeding.'],
        ], 2),
      ],
    },
    {
      id: 'ts8.bs.ill.treat', title: 'Principles of treatment and prevention', prereqs: ['ts8.bs.ill.spread'],
      intro: [
        h('Cure, and better still, prevent'),
        photo('💊', 'Medicines can ease symptoms or kill germs — but clean water, good food and vaccines stop many diseases from starting at all.'),
        h('Principles of treatment'),
        p('Treatment has two aims: (1) reduce the effects of the disease — medicines to bring down fever, reduce pain or stop loose motions, along with rest; (2) kill the cause — antibiotics for bacteria, anti-malarial drugs for Plasmodium, anti-viral drugs for some viruses. Antibiotics do not work on viruses, which is why there are few drugs for viral diseases.'),
        h('Principles of prevention'),
        def('General prevention', 'Measures that reduce exposure to all germs: clean drinking water, proper sanitation and toilets, clean surroundings, covered food, avoiding crowded unventilated places, nutritious food for good immunity.'),
        def('Specific prevention (immunisation)', 'Giving vaccines that train the immune system to fight a particular disease. India’s immunisation programme covers BCG (TB), polio, DPT (diphtheria, whooping cough, tetanus), measles, hepatitis B and others.'),
        def('Immunity', 'The body’s ability to fight infection. After an infection or vaccination, the immune system "remembers" the germ and destroys it quickly the next time.'),
        stepsB('Wash hands with soap.', 'Drink boiled or purified water.', 'Keep food covered; eat freshly cooked food.', 'Use mosquito nets and remove stagnant water.', 'Cover your mouth when coughing or sneezing.', 'Take all vaccines on time.'),
        keys('Treatment: relieve symptoms + kill the cause.', 'Antibiotics kill bacteria, not viruses.', 'Prevention is better than cure.', 'General prevention + specific prevention (vaccines).'),
        remember('Smallpox was eradicated by vaccination; India was declared polio-free in 2014 thanks to the Pulse Polio programme.'),
        tip('Ask "Is it bacteria or a virus?" before thinking of antibiotics.'),
      ],
      examples: [
        ex('Why is prevention better than cure?', ['A disease harms the body even if it is later cured.', 'Treatment costs money and time; the patient may spread infection meanwhile.', 'Prevention avoids all of this.'], 'It avoids suffering, damage, cost and spread.'),
        ex('A doctor gives paracetamol and an antibiotic to a typhoid patient. What does each do?', ['Paracetamol reduces fever — it eases the symptom.', 'The antibiotic kills the typhoid bacteria — it removes the cause.'], 'Paracetamol relieves symptoms; the antibiotic kills the cause.'),
      ],
      practice: [
        mcq('treat', 'Separate easing symptoms from killing the cause.', [
          ['Antibiotics are effective against diseases caused by…', 'Bacteria', ['Viruses', 'Vitamin deficiency', 'Injury'], 'Not viruses.', 'Antibiotics act on bacteria.'],
          ['A medicine that lowers fever is used to…', 'Reduce the effects (symptoms) of the disease', ['Kill viruses', 'Act as a vaccine', 'Cure diabetes'], 'It does not remove the germ.', 'Fever reducers relieve symptoms.'],
          ['BCG vaccine protects against…', 'Tuberculosis', ['Polio', 'Malaria', 'Diabetes'], 'Given at birth.', 'BCG protects against TB.'],
          ['India was declared polio-free in…', '2014', ['1947', '1980', '2000'], 'After the Pulse Polio drive.', 'WHO certified India polio-free in 2014.'],
          ['The body’s ability to fight infection is called…', 'Immunity', ['Symptom', 'Allergy', 'Vector'], 'Vaccines build it.', 'Immunity defends against infection.'],
          ['Why are there fewer medicines for viral diseases?', 'Viruses live inside our cells, so drugs that kill them can harm our cells too', ['Viruses are too big', 'Viruses are not living', 'Antibiotics kill all viruses'], 'Viruses use our cells.', 'Viruses use host cells, making them hard to target.'],
        ]),
        tapT('tap-prevent', 'Tap every GENERAL prevention measure.', [
          ['Drinking boiled water', true], ['Using mosquito nets', true], ['Covering food', true], ['Washing hands with soap', true], ['Using toilets instead of open defecation', true],
          ['Taking antibiotics for every cold', false], ['Sharing needles', false], ['Keeping water in uncovered pots for weeks', false],
        ], ['General measures reduce exposure to germs.', 'Antibiotics do not prevent colds.'], 'Boiled water, nets, covered food, handwashing and toilets reduce exposure; misusing antibiotics, sharing needles and stagnant water increase risk.'),
        matchT('match', 'vaccine to the disease it prevents', [
          ['BCG', 'Tuberculosis'], ['OPV (oral polio drops)', 'Polio'], ['DPT', 'Diphtheria, whooping cough, tetanus'], ['MR vaccine', 'Measles and rubella'], ['Hep B vaccine', 'Hepatitis B'],
        ], ['BCG is given at birth for TB.', 'DPT covers three diseases.']),
        mcq('principle', 'Prevention stops a disease before it starts.', [
          ['Vaccination is an example of…', 'Specific prevention', ['General prevention', 'Treatment of symptoms', 'A contributory cause'], 'It targets one disease.', 'Each vaccine protects against a particular disease.'],
          ['Clean drinking water for a whole village is…', 'General prevention', ['Specific prevention', 'Treatment', 'A symptom'], 'Protects against many diseases.', 'Safe water prevents many water-borne diseases.'],
          ['How does a vaccine give protection?', 'It trains the immune system to recognise the germ', ['It kills all germs in the body at once', 'It replaces blood', 'It works as food'], 'Immune memory.', 'Vaccines create immune memory.'],
          ['Why is it important to complete the full vaccination schedule?', 'Some vaccines need several doses for full protection', ['One dose is always enough', 'Vaccines are vitamins', 'It is not important'], 'Boosters.', 'Multiple doses build strong, lasting immunity.'],
          ['Smallpox disappeared from the world because of…', 'Vaccination', ['Antibiotics', 'Mosquito nets', 'Air conditioners'], 'Jenner’s discovery.', 'Worldwide vaccination eradicated smallpox.'],
        ], 2),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11];
