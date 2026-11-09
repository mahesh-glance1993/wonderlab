// Class 1 — NCERT Joyful Mathematics (Class 1) + age-appropriate physical-science exploration.
// Telugu (te) provided for all learner-facing text; needs native-speaker review.
import {
  buildClass, src, tp, ex, p, tip, vis, act, L, num, choose, chooseNum, pictures, matching, ordering, tapAll,
  NAMES, THINGS, range, type USpec,
} from '../lib/kit';
import type { Localized, VisualSpec } from '../../shared/content';
import type { Rng } from '../../shared/grading';

const obj = (emoji: string, count: number, groupsOf?: number): VisualSpec => (groupsOf ? { kind: 'objects', emoji, count, groupsOf } : { kind: 'objects', emoji, count });
/** Pick a fact from a pool and ask it as a multiple-choice question (both languages). */
type Fact = { q: Localized; a: Localized; w: Localized[] };
const factQ = (r: Rng, pool: Fact[], hint: Localized, type: 'mcq' | 'spoken' = 'mcq') => {
  const f = r.pick(pool);
  return { type, prompt: f.q, ...choose(r, f.a, f.w), hints: [hint], mistakes: [{ when: 'wrong', explain: L('Look again and think about what you see around you.', 'మళ్ళీ చూడు, నీ చుట్టూ ఉన్నవాటి గురించి ఆలోచించు.') }], solution: [L(`Answer: ${f.a.en}`, `జవాబు: ${f.a.te ?? f.a.en}`)] };
};

const NO_EVS = 'NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.';

// ---------------------------------------------------------------- 1 Finding the Furry Cat!
const space: USpec = {
  id: 'c1.u.space', subject: 'math', title: L('Finding the Furry Cat!', 'బొచ్చు పిల్లిని వెతుకుదాం!'), source: src('jm1', 1, 'Finding the Furry Cat!'),
  objectives: [{
    id: 'c1.space.words', title: L('Where is it? Above, below, inside, near', 'ఎక్కడ ఉంది? పైన, కింద, లోపల, దగ్గర'),
    activities: ['game:logic', 'art:color'],
    intro: [
      p('Words like above, below, inside, outside, near and far tell us where things are.', 'పైన, కింద, లోపల, బయట, దగ్గర, దూరం అనే మాటలు వస్తువులు ఎక్కడ ఉన్నాయో చెబుతాయి.'),
      vis({ kind: 'emoji', text: '☁️\n🐦\n🌳\n🐱 📦' }, 'A bird above a tree, a cat near a box', 'చెట్టు పైన పక్షి, పెట్టె దగ్గర పిల్లి'),
      tip('Point to things at home and say where they are!', 'ఇంట్లో వస్తువులను చూపించి అవి ఎక్కడ ఉన్నాయో చెప్పు!'),
    ],
    examples: [
      ex(L('The fan is on the ceiling. The mat is on the floor. Where is the fan?', 'ఫ్యాన్ పైకప్పుకు ఉంది. చాప నేల మీద ఉంది. ఫ్యాన్ ఎక్కడ ఉంది?'), [L('The ceiling is high up.', 'పైకప్పు ఎత్తులో ఉంటుంది.'), L('So the fan is above the mat.', 'కాబట్టి ఫ్యాన్ చాప పైన ఉంది.')], L('Above the mat', 'చాప పైన')),
      ex(L('The cat is in the basket. Is it inside or outside?', 'పిల్లి బుట్టలో ఉంది. లోపలా బయటా?'), [L('"In the basket" means within it.', '"బుట్టలో" అంటే దాని లోపల.')], L('Inside', 'లోపల'), { kind: 'emoji', text: '🧺🐱' }),
    ],
    practice: [
      tp('where', (r) => factQ(r, [
        { q: L('The kite flies high in the sky. The dog sits on the ground. Where is the kite?', 'గాలిపటం ఆకాశంలో ఎగురుతోంది. కుక్క నేల మీద కూర్చుంది. గాలిపటం ఎక్కడ ఉంది?'), a: L('Above the dog', 'కుక్క పైన'), w: [L('Below the dog', 'కుక్క కింద'), L('Inside the dog', 'కుక్క లోపల')] },
        { q: L('The shoes are under the bed. Where are the shoes?', 'చెప్పులు మంచం కింద ఉన్నాయి. చెప్పులు ఎక్కడ?'), a: L('Below the bed', 'మంచం కింద'), w: [L('Above the bed', 'మంచం పైన'), L('Far from the bed', 'మంచానికి దూరంగా')] },
        { q: L('The laddoos are in the box with the lid closed. Where are they?', 'లడ్డూలు మూత వేసిన డబ్బాలో ఉన్నాయి. అవి ఎక్కడ?'), a: L('Inside the box', 'డబ్బా లోపల'), w: [L('Outside the box', 'డబ్బా బయట'), L('Above the box', 'డబ్బా పైన')] },
        { q: L('Ravi stands next to his mother. Is he near or far from her?', 'రవి అమ్మ పక్కన నిలబడ్డాడు. దగ్గరా దూరమా?'), a: L('Near', 'దగ్గర'), w: [L('Far', 'దూరం')] },
        { q: L('The moon is in the sky and you are at home. Is the moon near or far?', 'చందమామ ఆకాశంలో ఉంది, నువ్వు ఇంట్లో ఉన్నావు. చందమామ దగ్గరా దూరమా?'), a: L('Far', 'దూరం'), w: [L('Near', 'దగ్గర')] },
        { q: L('The cow is in the field, not in the shed. Where is the cow?', 'ఆవు పాకలో కాదు, పొలంలో ఉంది. ఆవు ఎక్కడ?'), a: L('Outside the shed', 'పాక బయట'), w: [L('Inside the shed', 'పాక లోపల'), L('Below the shed', 'పాక కింద')] },
        { q: L('The bird sits on top of the tree. Where is the bird?', 'పక్షి చెట్టు పైన కూర్చుంది. పక్షి ఎక్కడ?'), a: L('Above the tree', 'చెట్టు పైన'), w: [L('Below the tree', 'చెట్టు కింద'), L('Inside the tree', 'చెట్టు లోపల')] },
      ], L('Imagine the picture in your mind.', 'బొమ్మను మనసులో ఊహించుకో.'), 'spoken')),
      tp('opposites', (r) => {
        const all: [Localized, Localized][] = [[L('above', 'పైన'), L('below', 'కింద')], [L('inside', 'లోపల'), L('outside', 'బయట')], [L('near', 'దగ్గర'), L('far', 'దూరం')], [L('top', 'పైభాగం'), L('bottom', 'అడుగుభాగం')], [L('left', 'ఎడమ'), L('right', 'కుడి')], [L('front', 'ముందు'), L('back', 'వెనుక')]];
        const set = r.shuffle(all).slice(0, 3);
        const m = matching(r, set);
        const words = set.map((s) => s[0]);
        return {
          type: 'match', prompt: L(`Match each word to its opposite: ${words.map((w) => w.en).join(', ')}.`, `ప్రతి మాటను దాని వ్యతిరేక పదంతో జత చేయి: ${words.map((w) => w.te).join(', ')}.`), ...m,
          hints: [L('Opposite means the other way.', 'వ్యతిరేకం అంటే మరో వైపు.'), L('Above is opposite of below.', 'పైన కి వ్యతిరేకం కింద.')],
          mistakes: [{ when: 'wrong', explain: L('Say the two words with actions — up and down, in and out.', 'చేతులతో చూపిస్తూ చెప్పు — పైకి కిందికి, లోపలికి బయటికి.') }],
          solution: set.map(([a, b]) => L(`${a.en} ↔ ${b.en}`, `${a.te} ↔ ${b.te}`)),
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 2 What is Long? What is Round?
const LONGER: [Localized, Localized][] = [
  [L('a train', 'రైలు'), L('a bicycle', 'సైకిల్')], [L('a snake', 'పాము'), L('a worm', 'వానపాము')], [L('a pencil', 'పెన్సిల్'), L('an eraser', 'రబ్బరు')],
  [L('a saree', 'చీర'), L('a handkerchief', 'చేతిరుమాలు')], [L('a giraffe’s neck', 'జిరాఫీ మెడ'), L('a hen’s neck', 'కోడి మెడ')], [L('a broom', 'చీపురు'), L('a spoon', 'చెంచా')], [L('a bus', 'బస్సు'), L('an auto', 'ఆటో')],
];
const ROUND = [L('ball', 'బంతి'), L('coin', 'నాణెం'), L('roti', 'రొట్టె'), L('bangle', 'గాజు'), L('wheel', 'చక్రం'), L('orange', 'నారింజ'), L('plate', 'పళ్ళెం')];
const NOT_ROUND = [L('book', 'పుస్తకం'), L('box', 'పెట్టె'), L('pencil', 'పెన్సిల్'), L('door', 'తలుపు'), L('brick', 'ఇటుక'), L('kite', 'గాలిపటం')];
const longRound: USpec = {
  id: 'c1.u.long', subject: 'math', title: L('What is Long? What is Round?', 'ఏది పొడవు? ఏది గుండ్రం?'), source: src('jm1', 2, 'What is Long? What is Round?'),
  objectives: [{
    id: 'c1.long.compare', title: L('Long and short, round and not round', 'పొడవు-పొట్టి, గుండ్రం-గుండ్రం కానిది'), prereqs: ['c1.space.words'],
    activities: ['game:shapes', 'art:trace'],
    intro: [
      p('We compare things: one can be longer or shorter than another.', 'వస్తువులను పోల్చుతాం: ఒకటి మరొకదానికంటే పొడవుగా లేదా పొట్టిగా ఉండవచ్చు.'),
      p('Round things can roll, like a ball or a wheel.', 'బంతి, చక్రం లాంటి గుండ్రటి వస్తువులు దొర్లుతాయి.'),
      vis({ kind: 'shape', shape: 'circle', color: '#f59e0b' }, 'A round shape', 'గుండ్రటి ఆకారం'),
    ],
    examples: [
      ex(L('Which is longer: a train or a bicycle?', 'ఏది పొడవు: రైలా సైకిలా?'), [L('A train has many coaches.', 'రైలుకు చాలా పెట్టెలు ఉంటాయి.'), L('It is much longer than a bicycle.', 'అది సైకిల్ కంటే చాలా పొడవు.')], L('The train', 'రైలు')),
      ex(L('Is a coin round?', 'నాణెం గుండ్రంగా ఉంటుందా?'), [L('Roll a coin on its edge — it rolls!', 'నాణాన్ని అంచు మీద దొర్లించు — దొర్లుతుంది!')], L('Yes, it is round', 'అవును, గుండ్రంగా ఉంటుంది'), { kind: 'shape', shape: 'circle' }),
    ],
    practice: [
      tp('longer', (r) => {
        const [a, b] = r.pick(LONGER);
        const ask = r.pick(['longer', 'shorter'] as const);
        const ans = ask === 'longer' ? a : b;
        return {
          type: 'spoken', prompt: L(`Which is ${ask}: ${a.en} or ${b.en}?`, `ఏది ${ask === 'longer' ? 'పొడవు' : 'పొట్టి'}: ${a.te} లేదా ${b.te}?`), ...choose(r, ans, [ans === a ? b : a]),
          hints: [L('Think of both things side by side.', 'రెండింటినీ పక్కపక్కన ఊహించుకో.')],
          mistakes: [{ when: 'wrong', explain: L(`Listen again: the question asks for the ${ask} one.`, `మళ్ళీ విను: ప్రశ్న ${ask === 'longer' ? 'పొడవైనది' : 'పొట్టిది'} అడుగుతోంది.`) }],
          solution: [L(`${ans.en} is ${ask}.`, `${ans.te} ${ask === 'longer' ? 'పొడవు' : 'పొట్టి'}.`)],
        };
      }),
      tp('round', (r) => {
        const items = [...r.shuffle(ROUND).slice(0, 2).map((x) => ({ label: x, ok: true })), ...r.shuffle(NOT_ROUND).slice(0, 2).map((x) => ({ label: x, ok: false }))];
        return {
          type: 'tap', prompt: L('Tap all the things that are round.', 'గుండ్రంగా ఉన్నవన్నీ నొక్కు.'), ...tapAll(r, items),
          hints: [L('Round things can roll.', 'గుండ్రటివి దొర్లుతాయి.'), L('A ball is round; a box is not.', 'బంతి గుండ్రం; పెట్టె కాదు.')],
          mistakes: [{ when: 'wrong', explain: L('Things with corners are not round.', 'మూలలు ఉన్నవి గుండ్రం కావు.') }],
          solution: [L(`Round: ${items.filter((i) => i.ok).map((i) => i.label.en).join(', ')}`, `గుండ్రం: ${items.filter((i) => i.ok).map((i) => i.label.te).join(', ')}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 3 Mango Treat (1–9)
const mango: USpec = {
  id: 'c1.u.mango', subject: 'math', title: L('Mango Treat', 'మామిడి పండ్ల విందు'), source: src('jm1', 3, 'Mango Treat'),
  objectives: [{
    id: 'c1.num.1to9', title: L('Count and show numbers 1 to 9', '1 నుండి 9 వరకు లెక్కించు'),
    activities: ['game:counting', 'art:trace'],
    intro: [
      p('Touch each thing once and say the next number. The last number you say tells how many.', 'ప్రతి వస్తువును ఒకసారి తాకి తర్వాతి సంఖ్య చెప్పు. చివరిగా చెప్పిన సంఖ్యే మొత్తం.'),
      vis(obj('🥭', 5), 'Five mangoes', 'ఐదు మామిడి పండ్లు'),
      tip('Do not count the same mango twice!', 'ఒకే పండును రెండుసార్లు లెక్కించకు!'),
    ],
    examples: [
      ex(L('How many mangoes?', 'ఎన్ని మామిడి పండ్లు?'), [L('1, 2, 3, 4, 5', '1, 2, 3, 4, 5'), L('The last number is 5.', 'చివరి సంఖ్య 5.')], L('5 mangoes', '5 మామిడి పండ్లు'), obj('🥭', 5)),
      ex(L('Show 7 using fingers.', 'వేళ్ళతో 7 చూపించు.'), [L('One full hand is 5.', 'ఒక చేయి మొత్తం 5.'), L('5 and 2 more make 7.', '5 మరియు ఇంకా 2 కలిపితే 7.')], L('7', '7'), obj('✋', 7)),
    ],
    practice: [
      tp('count', (r) => {
        const n = r.int(1, 9), t = r.pick(THINGS);
        return {
          type: 'count', keypad: 'numeric', prompt: L(`How many ${t.en}?`, `ఎన్ని ${t.te}?`), visual: obj(t.emoji, n), answer: num(n),
          hints: [L('Touch each one as you count.', 'లెక్కపెడుతూ ఒక్కొక్కటి తాకు.'), L('The last number you say is the answer.', 'చివరిగా చెప్పిన సంఖ్యే జవాబు.')],
          mistakes: [{ when: String(n + 1), explain: L('You counted one twice. Count again slowly.', 'ఒకదాన్ని రెండుసార్లు లెక్కించావు. మెల్లగా మళ్ళీ లెక్కపెట్టు.') }, { when: String(n - 1), explain: L('You missed one. Count again slowly.', 'ఒకటి వదిలేశావు. మెల్లగా మళ్ళీ లెక్కపెట్టు.') }],
          solution: [L(`Count: ${range(1, n).join(', ')}. There are ${n}.`, `లెక్క: ${range(1, n).join(', ')}. మొత్తం ${n}.`)],
        };
      }),
      tp('show', (r) => {
        const n = r.int(1, 9), t = r.pick(THINGS);
        const others = r.shuffle(range(1, 9).filter((x) => x !== n)).slice(0, 2);
        return {
          type: 'spoken', prompt: L(`Tap the picture with ${n} ${t.en}.`, `${n} ${t.te} ఉన్న బొమ్మను నొక్కు.`),
          ...pictures(r, { label: String(n), visual: obj(t.emoji, n) }, others.map((o) => ({ label: String(o), visual: obj(t.emoji, o) }))),
          hints: [L('Count the things in each picture.', 'ప్రతి బొమ్మలో వస్తువులను లెక్కపెట్టు.')],
          mistakes: [{ when: 'wrong', explain: L('Count that picture again — does it match the number?', 'ఆ బొమ్మను మళ్ళీ లెక్కపెట్టు — సంఖ్య సరిపోతుందా?') }],
          solution: [L(`The picture with ${n} ${t.en}.`, `${n} ${t.te} ఉన్న బొమ్మ.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 4 Making 10
const make10: USpec = {
  id: 'c1.u.make10', subject: 'math', title: L('Making 10', '10 చేద్దాం'), source: src('jm1', 4, 'Making 10'),
  objectives: [{
    id: 'c1.num.make10', title: L('Pairs that make 10', '10 అయ్యే జతలు'), prereqs: ['c1.num.1to9'],
    activities: ['game:counting', 'game:balance'],
    intro: [
      p('Ten fingers, two hands! 6 and 4 make 10, 7 and 3 make 10.', 'పది వేళ్ళు, రెండు చేతులు! 6 మరియు 4 కలిపితే 10, 7 మరియు 3 కలిపితే 10.'),
      vis(obj('🟢', 10, 5), 'Ten dots in two rows of five', 'ఐదేసి చొప్పున రెండు వరుసల్లో పది చుక్కలు'),
    ],
    examples: [
      ex(L('8 and how many make 10?', '8 కి ఎన్ని కలిపితే 10?'), [L('Count on from 8: 9, 10.', '8 నుండి ముందుకు లెక్కించు: 9, 10.'), L('That is 2 more.', 'అంటే ఇంకా 2.')], L('2', '2'), obj('🟢', 8)),
      ex(L('Diya has 5 bangles. How many more to have 10?', 'దియా దగ్గర 5 గాజులు ఉన్నాయి. 10 కావాలంటే ఇంకా ఎన్ని?'), [L('5 and 5 make 10.', '5 మరియు 5 కలిపితే 10.')], L('5 more', 'ఇంకా 5')),
    ],
    practice: [
      tp('missing', (r) => {
        const a = r.int(1, 9), t = r.pick(THINGS);
        return {
          type: 'mcq', prompt: L(`There are ${a} ${t.en}. How many more make 10?`, `${a} ${t.te} ఉన్నాయి. ఇంకా ఎన్ని కలిపితే 10?`), visual: obj(t.emoji, a),
          ...chooseNum(r, 10 - a, [a, 10 - a + 1, 10 - a - 1]),
          hints: [L(`Count on from ${a} up to 10.`, `${a} నుండి 10 వరకు ముందుకు లెక్కించు.`), L('Use your fingers.', 'వేళ్ళను ఉపయోగించు.')],
          mistakes: [{ when: 'wrong', explain: L('Count on from the number you have, until you reach 10.', 'నీ దగ్గర ఉన్న సంఖ్య నుండి 10 వచ్చేదాకా లెక్కించు.') }],
          solution: [L(`${a} + ${10 - a} = 10`, `${a} + ${10 - a} = 10`)],
        };
      }),
      tp('bonds', (r) => {
        const as = r.shuffle(range(1, 9)).slice(0, 3);
        const m = matching(r, as.map((a) => [String(a), String(10 - a)] as [string, string]));
        return {
          type: 'match', prompt: L(`Match each number with its partner to make 10: ${as.join(', ')}.`, `10 అయ్యేలా జత చేయి: ${as.join(', ')}.`), ...m,
          hints: [L('1 goes with 9, 2 goes with 8…', '1 తో 9, 2 తో 8…')],
          mistakes: [{ when: 'wrong', explain: L('Add the two numbers — the total must be 10.', 'రెండు సంఖ్యలు కలుపు — మొత్తం 10 కావాలి.') }],
          solution: as.map((a) => L(`${a} + ${10 - a} = 10`, `${a} + ${10 - a} = 10`)),
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 5 How Many? (to 20, compare)
const howMany: USpec = {
  id: 'c1.u.howmany', subject: 'math', title: L('How Many?', 'ఎన్ని?'), source: src('jm1', 5, 'How Many?'),
  objectives: [{
    id: 'c1.num.to20', title: L('Numbers to 20: more, less, on the number line', '20 వరకు సంఖ్యలు: ఎక్కువ, తక్కువ'), prereqs: ['c1.num.make10'],
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('Numbers after 10 are "ten and some more": 13 is 10 and 3.', '10 తర్వాత సంఖ్యలు "పది మరియు కొన్ని": 13 అంటే 10 మరియు 3.'),
      vis({ kind: 'number-line', from: 0, to: 20, step: 1, marks: [13] }, 'Number line 0 to 20 with 13 marked', '0 నుండి 20 సంఖ్యారేఖపై 13'),
      tip('On a number line, numbers to the right are bigger.', 'సంఖ్యారేఖపై కుడి వైపు సంఖ్యలు పెద్దవి.'),
    ],
    examples: [
      ex(L('Which is more: 15 or 12?', 'ఏది ఎక్కువ: 15 లేదా 12?'), [L('Both have one ten.', 'రెండింటిలో ఒక పది ఉంది.'), L('5 ones is more than 2 ones.', '5 ఒకట్లు 2 ఒకట్ల కంటే ఎక్కువ.')], L('15', '15')),
      ex(L('What comes just after 19?', '19 తర్వాత వెంటనే ఏది?'), [L('Count on one: 20.', 'ఒకటి ముందుకు: 20.')], L('20', '20'), { kind: 'number-line', from: 10, to: 20, step: 1, marks: [19, 20] }),
    ],
    practice: [
      tp('more', (r) => {
        const a = r.int(1, 20); let b = r.int(1, 20); while (b === a) b = r.int(1, 20);
        const ask = r.pick(['more', 'less'] as const);
        const ans = ask === 'more' ? Math.max(a, b) : Math.min(a, b);
        return {
          type: 'mcq', prompt: L(`Which number is ${ask}: ${a} or ${b}?`, `ఏ సంఖ్య ${ask === 'more' ? 'ఎక్కువ' : 'తక్కువ'}: ${a} లేదా ${b}?`), ...choose(r, String(ans), [String(ans === a ? b : a)]),
          hints: [L('Which comes later when you count? That one is more.', 'లెక్కించేటప్పుడు ఏది తర్వాత వస్తుంది? అదే ఎక్కువ.')],
          mistakes: [{ when: 'wrong', explain: L(`Check the question: it asks for ${ask}.`, `ప్రశ్న చూడు: ${ask === 'more' ? 'ఎక్కువ' : 'తక్కువ'} అడుగుతోంది.`) }],
          solution: [L(`${Math.min(a, b)} < ${Math.max(a, b)}, so the ${ask} is ${ans}.`, `${Math.min(a, b)} < ${Math.max(a, b)}, కాబట్టి జవాబు ${ans}.`)],
        };
      }),
      tp('line', (r) => {
        const n = r.int(2, 20);
        return {
          type: 'number-line', line: { from: 0, to: 20, step: 1 }, prompt: L(`Show ${n} on the number line.`, `సంఖ్యారేఖపై ${n} చూపించు.`), answer: num(n),
          hints: [L('Start at 0 and count the jumps.', '0 నుండి మొదలుపెట్టి గెంతులు లెక్కించు.'), L(`${n} is ${n >= 10 ? `10 and ${n - 10}` : `${n} jumps from 0`}.`, `${n} అంటే ${n >= 10 ? `10 మరియు ${n - 10}` : `0 నుండి ${n} గెంతులు`}.`)],
          mistakes: [{ when: String(n + 1), explain: L('One too far — count the jumps, not the marks.', 'ఒకటి ఎక్కువ — గీతలు కాదు, గెంతులు లెక్కించు.') }],
          solution: [L(`${n} is ${n} steps right of 0.`, `${n} అనేది 0 కి కుడివైపు ${n} అడుగులు.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 6 Vegetable Farm (addition)
const VEG = [{ en: 'tomatoes', te: 'టమాటాలు', emoji: '🍅' }, { en: 'carrots', te: 'క్యారెట్లు', emoji: '🥕' }, { en: 'brinjals', te: 'వంకాయలు', emoji: '🍆' }, { en: 'corn cobs', te: 'మొక్కజొన్న కంకులు', emoji: '🌽' }, { en: 'chillies', te: 'మిరపకాయలు', emoji: '🌶️' }];
const veg: USpec = {
  id: 'c1.u.veg', subject: 'math', title: L('Vegetable Farm', 'కూరగాయల తోట'), source: src('jm1', 6, 'Vegetable Farm'),
  objectives: [{
    id: 'c1.add.to20', title: L('Adding numbers up to 20', '20 వరకు కూడిక'), prereqs: ['c1.num.to20'],
    activities: ['game:counting', 'game:numberline'],
    intro: [
      p('Adding means putting together. 4 tomatoes and 3 more tomatoes make 7 tomatoes.', 'కూడిక అంటే కలపడం. 4 టమాటాలు, ఇంకా 3 టమాటాలు కలిపితే 7.'),
      vis({ kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[4, 7]] }, 'Jump from 4 to 7', '4 నుండి 7 కి గెంతు'),
      tip('Start from the bigger number and count on.', 'పెద్ద సంఖ్య నుండి మొదలుపెట్టి ముందుకు లెక్కించు.'),
    ],
    examples: [
      ex(L('Kavya picks 6 carrots, then 5 more. How many?', 'కావ్య 6 క్యారెట్లు, తర్వాత ఇంకా 5 కోసింది. మొత్తం ఎన్ని?'), [L('Start at 6.', '6 నుండి మొదలుపెట్టు.'), L('Count on 5: 7, 8, 9, 10, 11.', '5 ముందుకు: 7, 8, 9, 10, 11.')], L('11 carrots', '11 క్యారెట్లు'), obj('🥕', 11, 6)),
      ex(L('9 + 3 = ?', '9 + 3 = ?'), [L('9 and 1 make 10.', '9 మరియు 1 కలిపితే 10.'), L('10 and 2 more make 12.', '10 మరియు ఇంకా 2 కలిపితే 12.')], L('12', '12')),
    ],
    practice: [
      tp('story', (r) => {
        const a = r.int(2, 12), b = r.int(1, 20 - a), v = r.pick(VEG), n = r.pick(NAMES);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${n.en} picks ${a} ${v.en} and then ${b} more. How many ${v.en} in all?`, `${n.te} ${a} ${v.te} కోసి, తర్వాత ఇంకా ${b} కోశారు. మొత్తం ఎన్ని ${v.te}?`),
          visual: { kind: 'emoji', text: `${v.emoji.repeat(a)} + ${v.emoji.repeat(b)}` }, answer: num(a + b),
          hints: [L(`Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}.`, `${Math.max(a, b)} నుండి ${Math.min(a, b)} ముందుకు లెక్కించు.`), L('Or count all the pictures.', 'లేదా అన్ని బొమ్మలు లెక్కించు.')],
          mistakes: [{ when: String(Math.abs(a - b)), explain: L('"In all" means put together — add, do not take away.', '"మొత్తం" అంటే కలపడం — కూడు, తీసివేయకు.') }, { when: String(a + b - 1), explain: L('Almost! When counting on, do not count the starting number again.', 'దాదాపు! ముందుకు లెక్కించేటప్పుడు మొదటి సంఖ్యను మళ్ళీ లెక్కించకు.') }],
          solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
        };
      }),
      tp('jump', (r) => {
        const a = r.int(1, 12), b = r.int(1, 8);
        return {
          type: 'number-line', line: { from: 0, to: 20, step: 1 }, prompt: L(`Start at ${a} and jump ${b} steps forward. Where do you land? (${a} + ${b})`, `${a} నుండి ${b} అడుగులు ముందుకు గెంతు. ఎక్కడ ఆగుతావు? (${a} + ${b})`),
          answer: num(a + b),
          hints: [L('Forward means to the right.', 'ముందుకు అంటే కుడి వైపు.'), L(`Count ${b} jumps.`, `${b} గెంతులు లెక్కించు.`)],
          mistakes: [{ when: String(a + b - 1), explain: L('Count the jumps, not the starting point.', 'మొదలు బిందువు కాదు, గెంతులు లెక్కించు.') }],
          solution: [L(`${a} + ${b} = ${a + b}`, `${a} + ${b} = ${a + b}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 7 Lina's Family (subtraction)
const sub: USpec = {
  id: 'c1.u.sub', subject: 'math', title: L("Lina's Family", 'లీనా కుటుంబం'), source: src('jm1', 7, "Lina's Family"),
  objectives: [{
    id: 'c1.sub.to20', title: L('Taking away (subtraction within 20)', 'తీసివేత (20 లోపు)'), prereqs: ['c1.add.to20'],
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('Subtracting means taking away. 8 laddoos, 3 eaten: 5 are left.', 'తీసివేత అంటే తీసేయడం. 8 లడ్డూలు, 3 తిన్నారు: 5 మిగిలాయి.'),
      vis({ kind: 'number-line', from: 0, to: 10, step: 1, jumps: [[8, 5]] }, 'Jump back from 8 to 5', '8 నుండి 5 కి వెనక్కి గెంతు'),
    ],
    examples: [
      ex(L('Lina has 9 balloons. 4 fly away. How many are left?', 'లీనా దగ్గర 9 బెలూన్లు. 4 ఎగిరిపోయాయి. ఎన్ని మిగిలాయి?'), [L('Start at 9.', '9 నుండి మొదలు.'), L('Count back 4: 8, 7, 6, 5.', '4 వెనక్కి: 8, 7, 6, 5.')], L('5 balloons', '5 బెలూన్లు'), obj('🎈', 9)),
      ex(L('15 − 5 = ?', '15 − 5 = ?'), [L('15 is 10 and 5. Take away the 5.', '15 అంటే 10 మరియు 5. 5 తీసేయి.')], L('10', '10')),
    ],
    practice: [
      tp('story', (r) => {
        const a = r.int(4, 20), b = r.int(1, a - 1), t = r.pick(THINGS), n = r.pick(NAMES);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`${n.en} has ${a} ${t.en} and gives ${b} to a friend. How many are left?`, `${n.te} దగ్గర ${a} ${t.te} ఉన్నాయి. ${b} స్నేహితుడికి ఇచ్చారు. ఎన్ని మిగిలాయి?`),
          visual: obj(t.emoji, a), answer: num(a - b),
          hints: [L(`Start at ${a} and count back ${b}.`, `${a} నుండి ${b} వెనక్కి లెక్కించు.`), L('Cover the ones given away and count the rest.', 'ఇచ్చేసినవి మూసి, మిగిలినవి లెక్కించు.')],
          mistakes: [{ when: String(a + b), explain: L('"Left" means some are taken away — subtract.', '"మిగిలాయి" అంటే కొన్ని తీసేశారు — తీసివేయి.') }],
          solution: [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`)],
        };
      }),
      tp('back', (r) => {
        const a = r.int(5, 20), b = r.int(1, Math.min(9, a));
        return {
          type: 'number-line', line: { from: 0, to: 20, step: 1 }, prompt: L(`Start at ${a} and jump ${b} steps back. Where do you land? (${a} − ${b})`, `${a} నుండి ${b} అడుగులు వెనక్కి గెంతు. ఎక్కడ ఆగుతావు? (${a} − ${b})`),
          answer: num(a - b),
          hints: [L('Back means to the left.', 'వెనక్కి అంటే ఎడమ వైపు.')],
          mistakes: [{ when: String(a + b), explain: L('You jumped forward. Subtraction jumps back.', 'నువ్వు ముందుకు గెంతావు. తీసివేతలో వెనక్కి గెంతాలి.') }],
          solution: [L(`${a} − ${b} = ${a - b}`, `${a} − ${b} = ${a - b}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 8 Fun with Numbers (to 99)
const tensOnes: USpec = {
  id: 'c1.u.to99', subject: 'math', title: L('Fun with Numbers', 'సంఖ్యలతో ఆట'), source: src('jm1', 8, 'Fun with Numbers'),
  objectives: [{
    id: 'c1.num.tens-ones', title: L('Tens and ones up to 99', '99 వరకు పదులు, ఒకట్లు'), prereqs: ['c1.num.to20'],
    activities: ['game:counting', 'game:numberline'],
    intro: [
      p('A bundle of 10 sticks is one ten. 34 is 3 tens and 4 ones.', '10 పుల్లల కట్ట ఒక పది. 34 అంటే 3 పదులు, 4 ఒకట్లు.'),
      vis(obj('🥢', 34, 10), '3 bundles of ten and 4 single sticks', 'మూడు పదుల కట్టలు, 4 విడి పుల్లలు'),
      tip('The left digit tells the tens, the right digit tells the ones.', 'ఎడమ అంకె పదులు, కుడి అంకె ఒకట్లు.'),
    ],
    examples: [
      ex(L('How many tens and ones in 52?', '52 లో ఎన్ని పదులు, ఒకట్లు?'), [L('5 is in the tens place.', '5 పదుల స్థానంలో ఉంది.'), L('2 is in the ones place.', '2 ఒకట్ల స్థానంలో ఉంది.')], L('5 tens and 2 ones', '5 పదులు, 2 ఒకట్లు')),
      ex(L('What number is 7 tens and 0 ones?', '7 పదులు, 0 ఒకట్లు ఏ సంఖ్య?'), [L('7 tens = 70.', '7 పదులు = 70.')], L('70', '70')),
    ],
    practice: [
      tp('build', (r) => {
        const t = r.int(1, 9), o = r.int(0, 9);
        const n = 10 * t + o;
        return {
          type: 'mcq', prompt: L(`What number has ${t} tens and ${o} ones?`, `${t} పదులు, ${o} ఒకట్లు ఉన్న సంఖ్య ఏది?`), visual: obj('🥢', n, 10),
          ...chooseNum(r, n, [10 * o + t, t + o, n + 10, n - 10].filter((x) => x > 0)),
          hints: [L(`${t} tens is ${10 * t}.`, `${t} పదులు = ${10 * t}.`), L(`Then add ${o} ones.`, `తర్వాత ${o} ఒకట్లు కలుపు.`)],
          mistakes: [{ when: 'wrong', explain: L('Tens go on the left, ones on the right. Do not swap them!', 'పదులు ఎడమ వైపు, ఒకట్లు కుడి వైపు. మార్చకు!') }],
          solution: [L(`${t} tens + ${o} ones = ${10 * t} + ${o} = ${n}`, `${t} పదులు + ${o} ఒకట్లు = ${10 * t} + ${o} = ${n}`)],
        };
      }),
      tp('tens', (r) => {
        const n = r.int(11, 99);
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`How many tens are there in ${n}?`, `${n} లో ఎన్ని పదులు ఉన్నాయి?`), answer: num(Math.floor(n / 10)),
          hints: [L('Look at the left digit.', 'ఎడమ అంకె చూడు.')],
          mistakes: [{ when: String(n % 10), explain: L('That is the ones digit. Tens is the left digit.', 'అది ఒకట్ల అంకె. పదులు ఎడమ అంకె.') }],
          solution: [L(`${n} = ${Math.floor(n / 10)} tens and ${n % 10} ones.`, `${n} = ${Math.floor(n / 10)} పదులు, ${n % 10} ఒకట్లు.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 9 Utsav (patterns)
const PATS = [['🪔', '🌼'], ['🔴', '🔵'], ['⭐', '🌙'], ['🪁', '🎈'], ['🥭', '🍌'], ['🟡', '🟢', '🟣']];
const utsav: USpec = {
  id: 'c1.u.utsav', subject: 'math', title: L('Utsav', 'ఉత్సవం'), source: src('jm1', 9, 'Utsav'),
  objectives: [{
    id: 'c1.pat.repeat', title: L('Repeating patterns', 'పునరావృత నమూనాలు'),
    activities: ['game:patterns', 'art:color'],
    intro: [
      p('A pattern repeats again and again, like diya, flower, diya, flower in a festival rangoli.', 'నమూనా మళ్ళీ మళ్ళీ వస్తుంది — ముగ్గులో దీపం, పువ్వు, దీపం, పువ్వు లాగా.'),
      vis({ kind: 'emoji', text: '🪔🌼🪔🌼🪔🌼' }, 'Diya, flower pattern', 'దీపం, పువ్వు నమూనా'),
      tip('Find the part that repeats, then say it aloud.', 'మళ్ళీ వచ్చే భాగాన్ని కనుక్కుని గట్టిగా చెప్పు.'),
    ],
    examples: [
      ex(L('🔴🔵🔴🔵🔴 — what comes next?', '🔴🔵🔴🔵🔴 — తర్వాత ఏమిటి?'), [L('Red, blue repeats.', 'ఎరుపు, నీలం మళ్ళీ వస్తున్నాయి.'), L('After red comes blue.', 'ఎరుపు తర్వాత నీలం.')], L('🔵', '🔵')),
      ex(L('2, 4, 6, 8, … what next?', '2, 4, 6, 8, … తర్వాత?'), [L('Each number is 2 more.', 'ప్రతి సంఖ్య 2 ఎక్కువ.')], L('10', '10')),
    ],
    practice: [
      tp('next', (r) => {
        const unit = r.pick(PATS);
        const kind = r.pick(['AB', 'ABB', 'AAB'] as const);
        const core = unit.length === 3 ? unit : kind === 'AB' ? unit : kind === 'ABB' ? [unit[0], unit[1], unit[1]] : [unit[0], unit[0], unit[1]];
        const len = r.int(core.length + 2, core.length * 3);
        const seq = range(0, len - 1).map((i) => core[i % core.length]);
        const nxt = core[len % core.length];
        return {
          type: 'mcq', prompt: L(`What comes next? ${seq.join(' ')} ?`, `తర్వాత ఏమి వస్తుంది? ${seq.join(' ')} ?`), ...choose(r, nxt, unit.filter((u) => u !== nxt)),
          hints: [L('Find the part that repeats.', 'మళ్ళీ వచ్చే భాగం కనుక్కో.'), L(`It repeats: ${core.join(' ')}`, `మళ్ళీ వచ్చేది: ${core.join(' ')}`)],
          mistakes: [{ when: 'wrong', explain: L('Say the pattern aloud from the start and keep going.', 'మొదటి నుండి గట్టిగా చెబుతూ కొనసాగించు.') }],
          solution: [L(`The repeating part is ${core.join(' ')}, so next is ${nxt}.`, `పునరావృతం ${core.join(' ')}, కాబట్టి తర్వాత ${nxt}.`)],
        };
      }),
      tp('numbers', (r) => {
        const step = r.pick([1, 2, 5, 10]), start = r.int(0, 10);
        const seq = range(0, 3).map((i) => start + i * step);
        const ans = start + 4 * step;
        return {
          type: 'typed', keypad: 'numeric', prompt: L(`What comes next? ${seq.join(', ')}, ?`, `తర్వాత ఏ సంఖ్య? ${seq.join(', ')}, ?`), answer: num(ans),
          hints: [L('How much does it grow each time?', 'ప్రతిసారి ఎంత పెరుగుతోంది?'), L(`It grows by ${step}.`, `${step} చొప్పున పెరుగుతోంది.`)],
          mistakes: [{ when: String(seq[3] + 1), explain: L(`It does not grow by 1 — it grows by ${step}.`, `1 కాదు — ${step} చొప్పున పెరుగుతోంది.`) }],
          solution: [L(`${seq[3]} + ${step} = ${ans}`, `${seq[3]} + ${step} = ${ans}`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 10 How do I Spend my Day?
const DAY: Localized[] = [L('Wake up', 'నిద్ర లేవడం'), L('Brush teeth', 'పళ్ళు తోముకోవడం'), L('Eat breakfast', 'అల్పాహారం తినడం'), L('Go to school', 'బడికి వెళ్ళడం'), L('Eat lunch', 'మధ్యాహ్న భోజనం'), L('Play outside', 'బయట ఆడుకోవడం'), L('Eat dinner', 'రాత్రి భోజనం'), L('Go to sleep', 'నిద్రపోవడం')];
const day: USpec = {
  id: 'c1.u.day', subject: 'math', title: L('How do I Spend my Day?', 'నా రోజు ఎలా గడుస్తుంది?'), source: src('jm1', 10, 'How do I Spend my Day?'),
  objectives: [{
    id: 'c1.time.day', title: L('Order of daily events and o’clock times', 'రోజువారీ పనుల క్రమం, గంటలు'),
    activities: ['game:logic'],
    intro: [
      p('Our day has an order: morning, afternoon, evening, night.', 'మన రోజుకు ఒక క్రమం ఉంది: ఉదయం, మధ్యాహ్నం, సాయంత్రం, రాత్రి.'),
      vis({ kind: 'clock', h: 7, m: 0 }, 'A clock showing 7 o’clock', '7 గంటలు చూపిస్తున్న గడియారం'),
      tip('When the long hand points to 12, it is "o’clock".', 'పెద్ద ముల్లు 12 మీద ఉంటే "గంటలు" అంటాం.'),
    ],
    examples: [
      ex(L('What do we do first: eat breakfast or go to sleep?', 'ముందు ఏది: అల్పాహారమా, నిద్రా?'), [L('Breakfast is in the morning.', 'అల్పాహారం ఉదయం.'), L('Sleep is at night.', 'నిద్ర రాత్రి.')], L('Eat breakfast', 'అల్పాహారం')),
      ex(L('The short hand is on 3, the long hand on 12. What time?', 'చిన్న ముల్లు 3 మీద, పెద్ద ముల్లు 12 మీద. సమయం?'), [L('Short hand shows the hour.', 'చిన్న ముల్లు గంట చూపిస్తుంది.')], L('3 o’clock', '3 గంటలు'), { kind: 'clock', h: 3, m: 0 }),
    ],
    practice: [
      tp('order', (r) => {
        const start = r.int(0, DAY.length - 4);
        const items = DAY.slice(start, start + 4);
        return {
          type: 'order', prompt: L(`Put in order, first to last: ${items.map((i) => i.en).join(', ')}.`, `మొదటి నుండి చివరి వరకు క్రమంలో పెట్టు: ${items.map((i) => i.te).join(', ')}.`), ...ordering(r, items),
          hints: [L('What do you do first in the day?', 'రోజులో మొదట ఏం చేస్తావు?')],
          mistakes: [{ when: 'wrong', explain: L('Think of your own day, step by step.', 'నీ రోజును ఒక్కో అడుగుగా ఆలోచించు.') }],
          solution: [L(items.map((i) => i.en).join(' → '), items.map((i) => i.te).join(' → '))],
        };
      }),
      tp('clock', (r) => {
        const h = r.int(1, 12);
        const others = r.shuffle(range(1, 12).filter((x) => x !== h)).slice(0, 2);
        return {
          type: 'spoken', prompt: L('What time does the clock show?', 'గడియారం ఎంత సమయం చూపిస్తోంది?'), visual: { kind: 'clock', h, m: 0 },
          ...choose(r, L(`${h} o’clock`, `${h} గంటలు`), others.map((o) => L(`${o} o’clock`, `${o} గంటలు`))),
          hints: [L('Look at the short hand.', 'చిన్న ముల్లు చూడు.')],
          mistakes: [{ when: 'wrong', explain: L('The short hand tells the hour; the long hand is on 12.', 'చిన్న ముల్లు గంట చెబుతుంది; పెద్ద ముల్లు 12 మీద ఉంది.') }],
          solution: [L(`Short hand on ${h}: ${h} o’clock.`, `చిన్న ముల్లు ${h} మీద: ${h} గంటలు.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 11 How Many Times?
const times: USpec = {
  id: 'c1.u.times', subject: 'math', title: L('How Many Times?', 'ఎన్ని సార్లు?'), source: src('jm1', 11, 'How Many Times?'),
  objectives: [{
    id: 'c1.mul.groups', title: L('Equal groups and repeated jumps', 'సమాన గుంపులు, మళ్ళీ మళ్ళీ గెంతులు'), prereqs: ['c1.add.to20'],
    activities: ['game:numberline', 'game:counting'],
    intro: [
      p('3 groups of 2 means 2 + 2 + 2 = 6. We add the same number again and again.', '2 చొప్పున 3 గుంపులు అంటే 2 + 2 + 2 = 6. అదే సంఖ్యను మళ్ళీ మళ్ళీ కలుపుతాం.'),
      vis(obj('🍌', 6, 2), 'Three groups of 2 bananas', '2 అరటి పండ్ల చొప్పున మూడు గుంపులు'),
    ],
    examples: [
      ex(L('A frog jumps 3 steps each time. Where is it after 4 jumps from 0?', 'కప్ప ప్రతిసారి 3 అడుగులు గెంతుతుంది. 0 నుండి 4 గెంతుల తర్వాత ఎక్కడ?'), [L('3, 6, 9, 12', '3, 6, 9, 12')], L('12', '12'), { kind: 'number-line', from: 0, to: 15, step: 1, jumps: [[0, 3], [3, 6], [6, 9], [9, 12]] }),
      ex(L('4 plates with 5 idlis each. How many idlis?', 'ఒక్కో పళ్ళెంలో 5 ఇడ్లీల చొప్పున 4 పళ్ళేలు. మొత్తం ఇడ్లీలు?'), [L('5 + 5 + 5 + 5', '5 + 5 + 5 + 5'), L('= 20', '= 20')], L('20 idlis', '20 ఇడ్లీలు')),
    ],
    practice: [
      tp('groups', (r) => {
        const g = r.int(2, 5), k = r.int(2, 5), t = r.pick(THINGS);
        return {
          type: 'mcq', prompt: L(`There are ${k} groups with ${g} ${t.en} in each. How many ${t.en} in all?`, `ఒక్కో గుంపులో ${g} ${t.te} చొప్పున ${k} గుంపులు. మొత్తం ఎన్ని?`),
          visual: obj(t.emoji, g * k, g), ...chooseNum(r, g * k, [g + k, g * k + g, g * k - 1]),
          hints: [L(`Add ${g} again and again, ${k} times.`, `${g} ని ${k} సార్లు కలుపు.`), L('Or count all the pictures.', 'లేదా అన్ని బొమ్మలు లెక్కించు.')],
          mistakes: [{ when: 'wrong', explain: L('Count every group, not just two numbers.', 'రెండు సంఖ్యలు కాదు, అన్ని గుంపులు లెక్కించు.') }],
          solution: [L(`${Array(k).fill(g).join(' + ')} = ${g * k}`, `${Array(k).fill(g).join(' + ')} = ${g * k}`)],
        };
      }),
      tp('frog', (r) => {
        const s = r.int(2, 5), k = r.int(2, 4);
        return {
          type: 'number-line', line: { from: 0, to: 20, step: 1 }, prompt: L(`A frog starts at 0 and jumps ${s} steps each time. Where is it after ${k} jumps?`, `కప్ప 0 నుండి ప్రతిసారి ${s} అడుగులు గెంతుతుంది. ${k} గెంతుల తర్వాత ఎక్కడ?`),
          answer: num(s * k),
          hints: [L(`Count by ${s}s.`, `${s} చొప్పున లెక్కించు.`)],
          mistakes: [{ when: String(s + k), explain: L('Each jump is the same size — add it again for every jump.', 'ప్రతి గెంతు ఒకే పరిమాణం — ప్రతి గెంతుకు మళ్ళీ కలుపు.') }],
          solution: [L(range(1, k).map((i) => i * s).join(', '), range(1, k).map((i) => i * s).join(', '))],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 12 How Much Can We Spend?
const money: USpec = {
  id: 'c1.u.money', subject: 'math', title: L('How Much Can We Spend?', 'ఎంత ఖర్చు చేయగలం?'), source: src('jm1', 12, 'How Much Can We Spend?'),
  objectives: [{
    id: 'c1.money.coins', title: L('Coins and notes up to ₹20', '₹20 వరకు నాణేలు, నోట్లు'), prereqs: ['c1.add.to20'],
    activities: ['game:counting'],
    intro: [
      p('We use coins of ₹1, ₹2, ₹5, ₹10 and notes of ₹10 and ₹20 to buy things.', 'వస్తువులు కొనడానికి ₹1, ₹2, ₹5, ₹10 నాణేలు, ₹10, ₹20 నోట్లు వాడతాం.'),
      vis({ kind: 'coins', rupees: [5, 2, 1] }, 'Coins of ₹5, ₹2 and ₹1 make ₹8', '₹5, ₹2, ₹1 నాణేలు కలిపి ₹8'),
    ],
    examples: [
      ex(L('How much is ₹10 + ₹5 + ₹2?', '₹10 + ₹5 + ₹2 ఎంత?'), [L('Start with the biggest: 10.', 'పెద్దది మొదలు: 10.'), L('15, then 17.', '15, తర్వాత 17.')], L('₹17', '₹17'), { kind: 'coins', rupees: [10, 5, 2] }),
      ex(L('A pencil costs ₹5. Arjun has ₹10. Can he buy 2 pencils?', 'పెన్సిల్ ₹5. అర్జున్ దగ్గర ₹10. 2 పెన్సిళ్ళు కొనగలడా?'), [L('2 pencils cost ₹5 + ₹5 = ₹10.', '2 పెన్సిళ్ళు = ₹5 + ₹5 = ₹10.')], L('Yes', 'అవును')),
    ],
    practice: [
      tp('count', (r) => {
        const n = r.int(2, 4);
        const coins = range(1, n).map(() => r.pick([1, 2, 5, 10])).sort((a, b) => b - a);
        const tot = coins.reduce((a, b) => a + b, 0);
        return {
          type: 'typed', keypad: 'numeric', unitHint: '₹', prompt: L('How much money is shown?', 'ఎంత డబ్బు ఉంది?'), visual: { kind: 'coins', rupees: coins }, answer: num(tot, '₹'),
          hints: [L('Start with the biggest coin and count on.', 'పెద్ద నాణెం నుండి మొదలుపెట్టి ముందుకు లెక్కించు.')],
          mistakes: [{ when: String(coins.length), explain: L('Do not count the coins — add their values.', 'నాణేల సంఖ్య కాదు — వాటి విలువలు కలుపు.') }],
          solution: [L(`${coins.map((c) => `₹${c}`).join(' + ')} = ₹${tot}`, `${coins.map((c) => `₹${c}`).join(' + ')} = ₹${tot}`)],
        };
      }),
      tp('afford', (r) => {
        const items = [L('a pencil', 'పెన్సిల్'), L('a balloon', 'బెలూన్'), L('a toffee packet', 'చాక్లెట్ ప్యాకెట్'), L('an eraser', 'రబ్బరు'), L('a small ball', 'చిన్న బంతి')];
        const it = r.pick(items), cost = r.int(3, 15), have = r.int(2, 20);
        const yes = have >= cost;
        return {
          type: 'spoken', prompt: L(`${it.en} costs ₹${cost}. You have ₹${have}. Can you buy it?`, `${it.te} ధర ₹${cost}. నీ దగ్గర ₹${have} ఉంది. కొనగలవా?`), ...choose(r, yes ? L('Yes', 'అవును') : L('No', 'లేదు'), [yes ? L('No', 'లేదు') : L('Yes', 'అవును')]),
          hints: [L('Is the money you have more than or equal to the price?', 'నీ దగ్గర ఉన్న డబ్బు ధర కంటే ఎక్కువ లేదా సమానమా?')],
          mistakes: [{ when: 'wrong', explain: L('Compare the two numbers: which is bigger?', 'రెండు సంఖ్యలు పోల్చు: ఏది పెద్దది?') }],
          solution: [L(yes ? `₹${have} is enough for ₹${cost}.` : `₹${have} is less than ₹${cost}.`, yes ? `₹${have} తో ₹${cost} వస్తువు కొనవచ్చు.` : `₹${have}, ₹${cost} కంటే తక్కువ.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- 13 So Many Toys (data)
const TOYS = [L('cars', 'కార్లు'), L('dolls', 'బొమ్మలు'), L('balls', 'బంతులు'), L('tops', 'బొంగరాలు'), L('kites', 'గాలిపటాలు')];
const toys: USpec = {
  id: 'c1.u.toys', subject: 'math', title: L('So Many Toys', 'ఎన్నో బొమ్మలు'), source: src('jm1', 13, 'So Many Toys'),
  objectives: [{
    id: 'c1.data.toys', title: L('Reading a picture graph', 'బొమ్మల పట్టిక చదవడం'), prereqs: ['c1.num.to20'],
    activities: ['game:counting'],
    intro: [
      p('We can sort toys into groups and show how many are in each group with bars.', 'బొమ్మలను గుంపులుగా వేరు చేసి, ప్రతి గుంపులో ఎన్ని ఉన్నాయో పట్టీలతో చూపవచ్చు.'),
      vis({ kind: 'bar-graph', labels: ['cars', 'dolls', 'balls'], values: [4, 2, 5] }, 'Bars for cars 4, dolls 2, balls 5', 'కార్లు 4, బొమ్మలు 2, బంతులు 5'),
      tip('The tallest bar has the most.', 'పొడవైన పట్టీకి ఎక్కువ.'),
    ],
    examples: [
      ex(L('Cars 4, dolls 2, balls 5. Which has the most?', 'కార్లు 4, బొమ్మలు 2, బంతులు 5. ఏవి ఎక్కువ?'), [L('5 is the biggest number.', '5 పెద్ద సంఖ్య.')], L('Balls', 'బంతులు'), { kind: 'bar-graph', labels: ['cars', 'dolls', 'balls'], values: [4, 2, 5] }),
      ex(L('How many more balls than dolls?', 'బొమ్మల కంటే బంతులు ఎన్ని ఎక్కువ?'), [L('5 − 2 = 3', '5 − 2 = 3')], L('3 more', '3 ఎక్కువ')),
    ],
    practice: [
      tp('most', (r) => {
        const labs = r.shuffle(TOYS).slice(0, 3);
        const vals = r.shuffle([2, 4, 6, 7, 3]).slice(0, 3);
        const ask = r.pick(['most', 'fewest'] as const);
        const i = vals.indexOf(ask === 'most' ? Math.max(...vals) : Math.min(...vals));
        return {
          type: 'graph', prompt: L(`Which toy is there the ${ask === 'most' ? 'most' : 'fewest'} of?`, `ఏ బొమ్మలు ${ask === 'most' ? 'ఎక్కువ' : 'తక్కువ'} ఉన్నాయి?`), visual: { kind: 'bar-graph', labels: labs.map((l) => l.en), values: vals },
          ...choose(r, labs[i], labs.filter((_, j) => j !== i)),
          hints: [L(ask === 'most' ? 'Find the tallest bar.' : 'Find the shortest bar.', ask === 'most' ? 'పొడవైన పట్టీ చూడు.' : 'పొట్టి పట్టీ చూడు.')],
          mistakes: [{ when: 'wrong', explain: L('Compare the heights of the bars.', 'పట్టీల ఎత్తులు పోల్చు.') }],
          solution: [L(`${labs[i].en}: ${vals[i]}`, `${labs[i].te}: ${vals[i]}`)],
        };
      }),
      tp('howmany', (r) => {
        const labs = r.shuffle(TOYS).slice(0, 3);
        const vals = labs.map(() => r.int(1, 9));
        const i = r.int(0, 2);
        return {
          type: 'graph', keypad: 'numeric', prompt: L(`How many ${labs[i].en} are there?`, `ఎన్ని ${labs[i].te} ఉన్నాయి?`), visual: { kind: 'bar-graph', labels: labs.map((l) => l.en), values: vals }, answer: num(vals[i]),
          hints: [L(`Find the bar for ${labs[i].en} and read its top.`, `${labs[i].te} పట్టీ పై భాగం చదువు.`)],
          mistakes: [{ when: 'wrong-value', explain: L('Check you are reading the right bar.', 'సరైన పట్టీ చదువుతున్నావో చూడు.') }],
          solution: [L(`The ${labs[i].en} bar reaches ${vals[i]}.`, `${labs[i].te} పట్టీ ${vals[i]} వరకు ఉంది.`)],
        };
      }),
    ],
  }],
};

// ---------------------------------------------------------------- Physics exploration
const shadows: USpec = {
  id: 'c1.u.shadows', subject: 'physics', title: L('Light and Shadows', 'వెలుగు, నీడలు'), source: null, note: NO_EVS,
  objectives: [{
    id: 'c1.phy.shadows', title: L('Light sources and shadows', 'వెలుగునిచ్చేవి, నీడలు'), enrichment: true,
    activities: ['lab:light', 'art:trace'],
    intro: [
      p('The Sun, a bulb, a torch and a diya give us light.', 'సూర్యుడు, బల్బు, టార్చి, దీపం మనకు వెలుగునిస్తాయి.'),
      p('When something blocks light, a dark shadow forms behind it.', 'ఏదైనా వెలుగును అడ్డుకుంటే, దాని వెనుక చీకటి నీడ ఏర్పడుతుంది.'),
      act('lab:light?angle=30', 'Play with light in the Light Lab', 'లైట్ ల్యాబ్‌లో వెలుగుతో ఆడుకో'),
    ],
    examples: [
      ex(L('Can you see your shadow on a dark night with no light?', 'వెలుగు లేని చీకటి రాత్రి నీ నీడ కనిపిస్తుందా?'), [L('A shadow needs light.', 'నీడకు వెలుగు కావాలి.'), L('No light, no shadow.', 'వెలుగు లేదు, నీడ లేదు.')], L('No', 'లేదు')),
      ex(L('The Sun is in front of you. Where is your shadow?', 'సూర్యుడు నీ ముందు ఉన్నాడు. నీ నీడ ఎక్కడ?'), [L('Your body blocks the light.', 'నీ శరీరం వెలుగును అడ్డుకుంటుంది.'), L('The shadow falls on the other side.', 'నీడ మరో వైపు పడుతుంది.')], L('Behind you', 'నీ వెనుక')),
    ],
    practice: [
      tp('sources', (r) => {
        const yes = [L('Sun', 'సూర్యుడు'), L('torch', 'టార్చి'), L('diya', 'దీపం'), L('bulb', 'బల్బు'), L('candle', 'కొవ్వొత్తి'), L('firefly', 'మిణుగురు పురుగు')];
        const no = [L('book', 'పుస్తకం'), L('chair', 'కుర్చీ'), L('spoon', 'చెంచా'), L('pillow', 'దిండు'), L('stone', 'రాయి')];
        const items = [...r.shuffle(yes).slice(0, 2).map((l) => ({ label: l, ok: true })), ...r.shuffle(no).slice(0, 2).map((l) => ({ label: l, ok: false }))];
        return {
          type: 'tap', prompt: L('Tap the things that give light.', 'వెలుగునిచ్చే వాటిని నొక్కు.'), ...tapAll(r, items),
          hints: [L('Does it shine by itself?', 'అది తనంతట తానే వెలుగుతుందా?')],
          mistakes: [{ when: 'wrong', explain: L('A book or chair cannot shine on its own.', 'పుస్తకం, కుర్చీ తమంతట తాము వెలగవు.') }],
          solution: [L(`Light givers: ${items.filter((i) => i.ok).map((i) => i.label.en).join(', ')}`, `వెలుగునిచ్చేవి: ${items.filter((i) => i.ok).map((i) => i.label.te).join(', ')}`)],
        };
      }),
      tp('facts', (r) => factQ(r, [
        { q: L('What do we need to make a shadow?', 'నీడ రావాలంటే ఏమి కావాలి?'), a: L('Light and something to block it', 'వెలుగు, దాన్ని అడ్డుకునే వస్తువు'), w: [L('Only water', 'నీళ్ళు మాత్రమే'), L('Only a mirror', 'అద్దం మాత్రమే')] },
        { q: L('Which makes a dark shadow?', 'ఏది ముదురు నీడ ఇస్తుంది?'), a: L('A wooden block', 'చెక్క ముక్క'), w: [L('Clear glass', 'పారదర్శక గాజు'), L('Air', 'గాలి')] },
        { q: L('Your shadow is on your left. Where is the light?', 'నీ నీడ ఎడమ వైపు ఉంది. వెలుగు ఎక్కడ?'), a: L('On your right', 'కుడి వైపు'), w: [L('On your left', 'ఎడమ వైపు'), L('Under your feet', 'కాళ్ళ కింద')] },
        { q: L('At noon the Sun is high. Is your shadow long or short?', 'మధ్యాహ్నం సూర్యుడు పైన ఉంటాడు. నీడ పొడవా పొట్టా?'), a: L('Short', 'పొట్టి'), w: [L('Very long', 'చాలా పొడవు')] },
        { q: L('Does a shadow show the colour of your shirt?', 'నీడలో నీ చొక్కా రంగు కనిపిస్తుందా?'), a: L('No, shadows are dark', 'లేదు, నీడ చీకటిగా ఉంటుంది'), w: [L('Yes, always', 'అవును, ఎప్పుడూ')] },
        { q: L('Move a torch closer to your hand. The shadow on the wall gets…', 'టార్చిని చేతికి దగ్గరగా తెస్తే గోడపై నీడ…'), a: L('Bigger', 'పెద్దదవుతుంది'), w: [L('Smaller', 'చిన్నదవుతుంది'), L('Coloured', 'రంగుల్లోకి మారుతుంది')] },
      ], L('A shadow forms where light cannot reach.', 'వెలుగు చేరని చోట నీడ ఏర్పడుతుంది.'), 'spoken')),
    ],
  }],
};

const sounds: USpec = {
  id: 'c1.u.sounds', subject: 'physics', title: L('Sounds Around Us', 'మన చుట్టూ శబ్దాలు'), source: null, note: NO_EVS,
  objectives: [{
    id: 'c1.phy.sounds', title: L('Loud and soft sounds; who makes which sound', 'పెద్ద, మెల్లని శబ్దాలు'), enrichment: true,
    activities: ['game:logic'],
    intro: [
      p('Sounds are made when things shake (vibrate). A drum shakes when you hit it.', 'వస్తువులు కంపిస్తే శబ్దం వస్తుంది. డప్పు కొడితే అది కంపిస్తుంది.'),
      p('Some sounds are loud, like a horn. Some are soft, like a whisper.', 'హారన్ లాంటివి పెద్ద శబ్దాలు. గుసగుస లాంటివి మెల్లని శబ్దాలు.'),
      tip('Put your hand on your throat and hum — feel it shake!', 'గొంతు మీద చేయి పెట్టి హమ్ చేయి — కంపనం తెలుస్తుంది!'),
    ],
    examples: [
      ex(L('Which is louder: a pressure-cooker whistle or a ticking clock?', 'ఏది పెద్ద శబ్దం: కుక్కర్ విజిల్ లేదా గడియారం టిక్-టిక్?'), [L('The whistle can be heard in every room.', 'విజిల్ ప్రతి గదిలో వినిపిస్తుంది.')], L('Cooker whistle', 'కుక్కర్ విజిల్')),
      ex(L('Why does a bell ring?', 'గంట ఎందుకు మోగుతుంది?'), [L('Hitting it makes it shake.', 'కొడితే అది కంపిస్తుంది.'), L('Shaking makes sound.', 'కంపనం శబ్దం చేస్తుంది.')], L('It vibrates', 'అది కంపిస్తుంది')),
    ],
    practice: [
      tp('loud', (r) => {
        const pairs: [Localized, Localized][] = [[L('a lorry horn', 'లారీ హారన్'), L('a whisper', 'గుసగుస')], [L('thunder', 'ఉరుము'), L('falling leaf', 'రాలే ఆకు')], [L('a drum', 'డప్పు'), L('a cat’s footsteps', 'పిల్లి అడుగులు')], [L('a firecracker', 'టపాసు'), L('a ticking clock', 'గడియారం టిక్-టిక్')], [L('a school bell', 'బడి గంట'), L('breathing', 'శ్వాస')], [L('a temple bell', 'గుడి గంట'), L('a butterfly', 'సీతాకోకచిలుక')]];
        const [a, b] = r.pick(pairs);
        const ask = r.pick(['louder', 'softer'] as const);
        const ans = ask === 'louder' ? a : b;
        return {
          type: 'spoken', prompt: L(`Which is ${ask}: ${a.en} or ${b.en}?`, `ఏది ${ask === 'louder' ? 'పెద్ద' : 'మెల్లని'} శబ్దం: ${a.te} లేదా ${b.te}?`), ...choose(r, ans, [ans === a ? b : a]),
          hints: [L('Imagine hearing both sounds.', 'రెండు శబ్దాలు విన్నట్టు ఊహించు.')],
          mistakes: [{ when: 'wrong', explain: L(`Listen to the question: it asks which is ${ask}.`, 'ప్రశ్నను జాగ్రత్తగా విను.') }],
          solution: [L(`${ans.en} is ${ask}.`, `${ans.te} ${ask === 'louder' ? 'పెద్ద' : 'మెల్లని'} శబ్దం.`)],
        };
      }),
      tp('animals', (r) => {
        const all: [Localized, Localized][] = [[L('cow', 'ఆవు'), L('moo', 'అంబా')], [L('dog', 'కుక్క'), L('bow-wow', 'భౌ భౌ')], [L('cat', 'పిల్లి'), L('meow', 'మ్యావ్')], [L('duck', 'బాతు'), L('quack', 'క్వాక్')], [L('rooster', 'కోడిపుంజు'), L('cock-a-doodle-doo', 'కొక్కొరొకో')], [L('crow', 'కాకి'), L('caw', 'కావ్ కావ్')]];
        const set = r.shuffle(all).slice(0, 3);
        return {
          type: 'match', prompt: L(`Match each animal to its sound: ${set.map((s) => s[0].en).join(', ')}.`, `ప్రతి జంతువును దాని శబ్దంతో జత చేయి: ${set.map((s) => s[0].te).join(', ')}.`), ...matching(r, set),
          hints: [L('Make the sound yourself!', 'నువ్వే ఆ శబ్దం చేసి చూడు!')],
          mistakes: [{ when: 'wrong', explain: L('Think of the animal near your home.', 'నీ ఇంటి దగ్గర ఉన్న జంతువును గుర్తు చేసుకో.') }],
          solution: set.map(([a, b]) => L(`${a.en}: ${b.en}`, `${a.te}: ${b.te}`)),
        };
      }),
    ],
  }],
};

const pushPull: USpec = {
  id: 'c1.u.pushpull', subject: 'physics', title: L('Push and Pull', 'తోయడం, లాగడం'), source: null, note: NO_EVS,
  objectives: [{
    id: 'c1.phy.pushpull', title: L('Is it a push or a pull?', 'తోయడమా లాగడమా?'), enrichment: true,
    activities: ['lab:forces'],
    intro: [
      p('To move something we push it away or pull it towards us.', 'ఏదైనా కదపాలంటే దాన్ని దూరంగా తోస్తాం లేదా మన వైపు లాగుతాం.'),
      p('A harder push makes things move faster.', 'గట్టిగా తోస్తే వస్తువు వేగంగా కదులుతుంది.'),
      act('lab:forces?mass=5&force=20&friction=0', 'Push a box in the Forces Lab', 'ఫోర్సెస్ ల్యాబ్‌లో పెట్టెను తోయి'),
    ],
    examples: [
      ex(L('Opening a drawer: push or pull?', 'సొరుగు తెరవడం: తోయడమా లాగడమా?'), [L('The drawer comes towards you.', 'సొరుగు నీ వైపు వస్తుంది.')], L('Pull', 'లాగడం')),
      ex(L('Kicking a ball: push or pull?', 'బంతిని తన్నడం: తోయడమా లాగడమా?'), [L('The ball goes away from you.', 'బంతి నీ నుండి దూరం వెళ్తుంది.')], L('Push', 'తోయడం')),
    ],
    practice: [
      tp('which', (r) => {
        const acts: [Localized, boolean][] = [[L('closing a door', 'తలుపు మూయడం'), true], [L('pulling a bucket from a well', 'బావి నుండి బకెట్ చేదడం'), false], [L('pushing a swing', 'ఉయ్యాల ఊపడం'), true], [L('flying a kite by its string', 'దారంతో గాలిపటం ఎగరేయడం'), false], [L('pressing a doorbell', 'కాలింగ్ బెల్ నొక్కడం'), true], [L('opening a drawer', 'సొరుగు తెరవడం'), false], [L('kicking a football', 'ఫుట్‌బాల్ తన్నడం'), true], [L('plucking a mango', 'మామిడి పండు కోయడం'), false]];
        const [a, push] = r.pick(acts);
        const P = L('Push', 'తోయడం'), Q = L('Pull', 'లాగడం');
        return {
          type: 'spoken', prompt: L(`Is ${a.en} a push or a pull?`, `${a.te} తోయడమా లాగడమా?`), ...choose(r, push ? P : Q, [push ? Q : P]),
          hints: [L('Push = away from you. Pull = towards you.', 'తోయడం = దూరంగా. లాగడం = దగ్గరగా.')],
          mistakes: [{ when: 'wrong', explain: L('Act it out — does it go away or come towards you?', 'చేసి చూడు — దూరం వెళ్తుందా దగ్గరకు వస్తుందా?') }],
          solution: [L(`${a.en} is a ${push ? 'push' : 'pull'}.`, `${a.te} — ${push ? 'తోయడం' : 'లాగడం'}.`)],
        };
      }),
      tp('harder', (r) => factQ(r, [
        { q: L('You push a toy car gently, then hard. When does it go farther?', 'బొమ్మ కారును మెల్లగా, తర్వాత గట్టిగా తోస్తే, ఎప్పుడు ఎక్కువ దూరం వెళ్తుంది?'), a: L('With a hard push', 'గట్టిగా తోసినప్పుడు'), w: [L('With a gentle push', 'మెల్లగా తోసినప్పుడు')] },
        { q: L('Which is easier to push: an empty box or a box full of books?', 'ఏది తోయడం సులభం: ఖాళీ పెట్టా, పుస్తకాల పెట్టా?'), a: L('The empty box', 'ఖాళీ పెట్టె'), w: [L('The box full of books', 'పుస్తకాల పెట్టె')] },
        { q: L('A rolling ball is stopped by your foot. What did your foot do?', 'దొర్లుతున్న బంతిని కాలితో ఆపావు. కాలు ఏం చేసింది?'), a: L('Pushed against it to stop it', 'ఎదురుగా తోసి ఆపింది'), w: [L('Nothing at all', 'ఏమీ చేయలేదు'), L('Made it lighter', 'తేలికగా చేసింది')] },
        { q: L('Where does a ball roll faster: on a smooth floor or on grass?', 'బంతి ఎక్కడ వేగంగా దొర్లుతుంది: నున్నటి నేల మీదా, గడ్డి మీదా?'), a: L('Smooth floor', 'నున్నటి నేల'), w: [L('Grass', 'గడ్డి')] },
        { q: L('To make a swing go higher, you…', 'ఉయ్యాల ఇంకా ఎత్తుకు వెళ్ళాలంటే…'), a: L('Push it harder', 'ఇంకా గట్టిగా తోయాలి'), w: [L('Stop pushing', 'తోయడం ఆపాలి'), L('Push it gently', 'మెల్లగా తోయాలి')] },
      ], L('Bigger push or pull = bigger change in motion.', 'ఎక్కువ బలం = కదలికలో ఎక్కువ మార్పు.'))),
    ],
  }],
};

export default buildClass(3, [space, longRound, mango, make10, howMany, veg, sub, tensOnes, utsav, day, times, money, toys, shadows, sounds, pushPull]);
