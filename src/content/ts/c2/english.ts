// Telangana SCERT Class 2 — English (English Reader, Class 2). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). The Reader's stories and rhymes are never reproduced: each unit teaches ABOUT
// its theme with our own short stories and rhymes (plus public-domain rhymes and folk tales such as "Rain, rain, go away"
// and The Enormous Turnip, retold in our own words), picture words, phonics, and one simple sentence skill.
// English is the language being learnt; Telugu (te) explains and translates for Telugu-speaking children
// (needs native-speaker review).
import { tp, ex, p, tip, keys, photo, L, choose, pictures, matching, ordering, tapAll, type USpec, type OSpec, type TSpec, type ExSpec } from '../../lib/kit';
import type { Block, Localized, VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ---------------------------------------------------------------- compact bilingual factories
type B = [en: string, te: string];
/** [picture, English word, Telugu meaning] */
type W = [emoji: string, en: string, te: string];
/** [question en, question te, answer, wrong answers, why en, why te] */
type MQ = [string, string, string, string[], string, string];
/** [sentence with ___, answer, wrong answers, why en, why te] */
type FQ = [string, string, string[], string, string];
/** [rhyme lines with ___, answer, rhymes with, wrong answers (must not rhyme), Telugu meaning] */
type RQ = [string, string, string, string[], string];
/** [ending sound, words in that family] */
type Fam = [string, string[]];

const b = (x: B): Localized => L(x[0], x[1]);
const emo = (e: string): VisualSpec => ({ kind: 'emoji', text: e });
const LAST = L('Read each choice aloud, slowly. Which one sounds right?', 'ప్రతి జవాబును నెమ్మదిగా పైకి చదువు. ఏది సరిగ్గా వినిపిస్తుందో చూడు.');
const good = (en: string, te: string) => L(`Good try! ${en}`, `మంచి ప్రయత్నం! ${te}`);
const exb = (pr: B, steps: B[], ans: B): ExSpec => ex(b(pr), steps.map(b), b(ans));

const mcq = (key: string, hint: B, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [qe, qt, a, w, ye, yt] = r.pick(bank);
  return {
    type: 'mcq', prompt: L(qe, qt), ...choose(r, a, w), hints: [b(hint), LAST],
    mistakes: [{ when: 'wrong', explain: good(ye, yt) }], solution: [L(`Answer: ${a}`, `జవాబు: ${a}`), L(ye, yt)],
  };
}, d);

const fill = (key: string, hint: B, bank: FQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [s, a, w, ye, yt] = r.pick(bank);
  const done = s.replace('___', a);
  return {
    type: 'mcq', prompt: L(`Choose the right word: ${s}`, `ఖాళీలో సరైన పదం ఎంచుకో: ${s}`), ...choose(r, a, w), hints: [b(hint), LAST],
    mistakes: [{ when: 'wrong', explain: good(ye, yt) }], solution: [L(done, done), L(ye, yt)],
  };
}, d);

const picWord = (key: string, words: W[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [[e, en, te], ...rest] = r.shuffle(words);
  return {
    type: 'mcq', prompt: L(`Tap the picture of "${en}".`, `"${en}" బొమ్మను నొక్కు.`),
    ...pictures(r, { label: en, visual: emo(e) }, rest.slice(0, 2).map(([we, wen]) => ({ label: wen, visual: emo(we) })), 3),
    hints: [L('Read the word. Then look at each picture.', 'పదాన్ని చదువు. తర్వాత ప్రతి బొమ్మను చూడు.'), L(`"${en}" means "${te}".`, `"${en}" అంటే "${te}".`)],
    mistakes: [{ when: 'wrong', explain: good(`"${en}" means ${te}. Find that picture.`, `"${en}" అంటే ${te}. ఆ బొమ్మను వెతుకు.`) }],
    solution: [L(`${e} ${en}`, `${e} ${en} = ${te}`)],
  };
}, d);

const meaning = (key: string, words: W[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [[e, en, te], ...rest] = r.shuffle(words);
  return {
    type: 'mcq', prompt: L(`${e} Which English word means "${te}"?`, `${e} "${te}" ను ఇంగ్లీష్‌లో ఏమంటారు?`),
    ...choose(r, en, rest.slice(0, 3).map((x) => x[1])),
    hints: [L('Look at the picture and say its name.', 'బొమ్మను చూసి దాని పేరు చెప్పు.'), L(`It begins with the letter "${en[0]}".`, `అది "${en[0]}" అక్షరంతో మొదలవుతుంది.`)],
    mistakes: [{ when: 'wrong', explain: good(`"${te}" is "${en}" in English.`, `"${te}" ను ఇంగ్లీష్‌లో "${en}" అంటారు.`) }],
    solution: [L(`${te} = ${en}`, `${te} = ${en}`)],
  };
}, d);

const LETTERS = 'abcdefghilmnoprstuw'.split('');
const missing = (key: string, words: W[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [e, en, te] = r.pick(words);
  const i = r.int(0, en.length - 1);
  const ch = en[i];
  const masked = en.split('').map((x, j) => (j === i ? '_' : x)).join(' ');
  const spelt = en.split('').join('-');
  return {
    type: 'mcq', prompt: L(`${e} Which letter is missing? ${masked}`, `${e} తప్పిపోయిన అక్షరం ఏది? ${masked}`),
    ...choose(r, ch, r.shuffle(LETTERS.filter((x) => x !== ch)).slice(0, 3)),
    hints: [L('Say the word slowly, sound by sound.', 'పదాన్ని నెమ్మదిగా, ఒక్కో శబ్దం విడిగా పలుకు.'), L(`The word is "${en}" (${te}).`, `ఆ పదం "${en}" (${te}).`)],
    mistakes: [{ when: 'wrong', explain: good(`Spell it with me: ${spelt}.`, `నాతో కలిసి స్పెల్లింగ్ చెప్పు: ${spelt}.`) }],
    solution: [L(`${en} — the missing letter is "${ch}".`, `${en} — తప్పిపోయిన అక్షరం "${ch}".`)],
  };
}, d);

const firstSound = (key: string, words: W[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [[e, en, te], ...rest] = r.shuffle(words);
  const s = en[0];
  const wrong = rest.filter((w) => w[1][0] !== s).slice(0, 2);
  return {
    type: 'mcq', prompt: L(`Which word begins with the sound "${s}"?`, `"${s}" శబ్దంతో మొదలయ్యే పదం ఏది?`),
    ...pictures(r, { label: en, visual: emo(e) }, wrong.map(([we, wen]) => ({ label: wen, visual: emo(we) })), 3),
    hints: [L('Say each word aloud. Listen to the very first sound.', 'ప్రతి పదాన్ని పైకి చెప్పు. మొదటి శబ్దాన్ని జాగ్రత్తగా విను.'), L(`"${s}" as in "${en}" (${te}).`, `"${en}" (${te}) లో మొదటి శబ్దం "${s}".`)],
    mistakes: [{ when: 'wrong', explain: good(`"${en}" starts with "${s}".`, `"${en}" "${s}" తో మొదలవుతుంది.`) }],
    solution: [L(`${e} ${en} begins with "${s}".`, `${e} ${en} "${s}" తో మొదలవుతుంది.`)],
  };
}, d);

const rhymeQ = (key: string, fams: Fam[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const order = r.shuffle(fams);
  const [end, ws] = order[0];
  const [x, y] = r.shuffle(ws);
  const wrong = order.slice(1, 3).map(([, o]) => r.pick(o));
  return {
    type: 'mcq', prompt: L(`🎵 Which word rhymes with "${x}"?`, `🎵 "${x}" తో ప్రాస కలిసే పదం ఏది? (చివర అదే శబ్దం)`), ...choose(r, y, wrong, 3),
    hints: [L('Rhyming words end with the same sound, like cat – hat.', 'ప్రాస పదాలు ఒకే శబ్దంతో ముగుస్తాయి: cat – hat.'), L(`Listen to the end of "${x}": "-${end}".`, `"${x}" చివరి శబ్దం విను: "-${end}".`)],
    mistakes: [{ when: 'wrong', explain: good(`"${x}" and "${y}" both end in "-${end}".`, `"${x}", "${y}" రెండూ "-${end}" తో ముగుస్తాయి.`) }],
    solution: [L(`${x} – ${y}`, `${x} – ${y}`), L(`Both end in "-${end}".`, `రెండూ "-${end}" శబ్దంతో ముగుస్తాయి.`)],
  };
}, d);

const finish = (key: string, bank: RQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [lines, a, rw, w, te] = r.pick(bank);
  const done = lines.replace('___', a);
  return {
    type: 'mcq', prompt: L(`🎵 Finish the rhyme: ${lines}`, `🎵 పాటను పూర్తి చేయి (ప్రాస పదం ఎంచుకో): ${lines}`), ...choose(r, a, w),
    hints: [L('Say the rhyme aloud and clap the beat.', 'చప్పట్లు కొడుతూ పాటను పైకి పాడు.'), L(`The missing word rhymes with "${rw}".`, `ఖాళీ పదం "${rw}" తో ప్రాస కలుస్తుంది.`)],
    mistakes: [{ when: 'wrong', explain: good(`Listen: "${rw}" … "${a}" — they rhyme!`, `విను: "${rw}" … "${a}" — ఇవి ప్రాస పదాలు!`) }],
    solution: [L(done, done), L(`"${a}" rhymes with "${rw}".`, `అర్థం: ${te}`)],
  };
}, d);

const orderT = (key: string, prompt: B, hint: B, bank: string[][], joiner = ' ', d: 1 | 2 | 3 = 2): TSpec => {
  bank.forEach((q) => { if (new Set(q).size !== q.length) throw new Error(`${key}: repeated item in ${q.join(' ')}`); });
  return tp(key, (r) => {
    const seq = r.pick(bank);
    const s = seq.join(joiner);
    return {
      type: 'order', prompt: b(prompt), ...ordering(r, seq),
      hints: [b(hint), L(`It begins with "${seq[0]}".`, `మొదటిది: "${seq[0]}".`)],
      mistakes: [{ when: 'wrong', explain: L('Not yet! Find the first one, then ask "What comes next?"', 'ఇంకా కాదు! మొదటిది కనుక్కుని, "తర్వాత ఏమిటి?" అని అడుగు.') }],
      solution: [L(s, s)],
    };
  }, d);
};

const tapT = (key: string, prompt: B, pool: [string, boolean][], why: B, d: 1 | 2 | 3 = 2): TSpec => {
  const yes = pool.filter((x) => x[1]), no = pool.filter((x) => !x[1]);
  if (yes.length < 3 || no.length < 2) throw new Error(`${key}: tap pool too small`);
  return tp(key, (r) => {
    const pick = [...r.shuffle(yes).slice(0, r.int(2, 3)), ...r.shuffle(no).slice(0, 2)];
    const right = pick.filter((x) => x[1]).map((x) => x[0]).join(', ');
    return {
      type: 'tap', prompt: b(prompt), ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))),
      hints: [b(why), L(`There are ${pick.filter((x) => x[1]).length} right answers.`, `${pick.filter((x) => x[1]).length} సరైన జవాబులు ఉన్నాయి.`)],
      mistakes: [{ when: 'wrong', explain: good('Check each one on its own.', 'ఒక్కొక్కటిగా మళ్ళీ చూడు.') }],
      solution: [L(`Correct: ${right}.`, `సరైనవి: ${right}.`), b(why)],
    };
  }, d);
};

const matchT = (key: string, prompt: B, hint: B, pool: [string, string][], n = 4, d: 1 | 2 | 3 = 2): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  const lefts = pairs.map((x) => x[0]).join(' · ');
  return {
    type: 'match', prompt: L(`${prompt[0]}: ${lefts}`, `${prompt[1]}: ${lefts}`), left: m.left, right: m.right, answer: m.answer,
    hints: [b(hint), L('Join the pair you are surest of first.', 'బాగా తెలిసిన జంటను ముందు కలుపు.')],
    mistakes: [{ when: 'wrong', explain: L('One pair is mixed up. Check each pair again.', 'ఒక జంట తప్పుగా ఉంది. ప్రతి జంటను మళ్ళీ చూడు.') }],
    solution: pairs.map(([a, c]) => L(`${a} → ${c}`, `${a} → ${c}`)),
  };
}, d);

const aan = (key: string, words: W[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [e, en, te] = r.pick(words);
  const a = /^[aeiou]/.test(en) ? 'an' : 'a';
  return {
    type: 'mcq', prompt: L(`${e} Choose "a" or "an": ___ ${en}`, `${e} "a" లేదా "an" — ఏది సరైనది? ___ ${en} (${te})`),
    ...choose(r, a, [a === 'a' ? 'an' : 'a']),
    hints: [L('Use "an" before a vowel sound: a, e, i, o, u.', 'a, e, i, o, u అనే అచ్చు శబ్దాల ముందు "an" వాడాలి.'), L(`"${en}" begins with "${en[0]}".`, `"${en}" "${en[0]}" తో మొదలవుతుంది.`)],
    mistakes: [{ when: 'wrong', explain: a === 'an' ? good(`"${en}" begins with a vowel, so we say "an ${en}".`, `"${en}" అచ్చుతో మొదలవుతుంది, కాబట్టి "an ${en}".`) : good(`"${en}" does not begin with a vowel, so we say "a ${en}".`, `"${en}" అచ్చుతో మొదలవదు, కాబట్టి "a ${en}".`) }],
    solution: [L(`${a} ${en}`, `${a} ${en} (${te})`)],
  };
}, d);

/** [picture, one, many, Telugu] */
type PW = [string, string, string, string];
const NUMW = ['two', 'three', 'four', 'five', 'six'];
const plural = (key: string, words: PW[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [e, s, pl, te] = r.pick(words);
  const n = r.pick(NUMW);
  const cand = [s + 's', s + 'es', s, s.replace(/y$/, 'ies'), s + 'ss'].filter((x) => x !== pl);
  return {
    type: 'mcq', prompt: L(`${e} One ${s}, ${n} ___`, `${e} ఒక ${s} (${te}), ${n} ___ — ఎక్కువ ఉంటే ఏమంటాం?`), ...choose(r, pl, cand),
    hints: [L('More than one? Most words add "s".', 'ఒకటి కంటే ఎక్కువ ఉంటే చాలా పదాలకు "s" చేరుతుంది.'), L('Words ending in s, x, ch, sh add "es". Some words change.', 's, x, ch, sh తో ముగిసే పదాలకు "es" చేరుతుంది. కొన్ని పదాలు పూర్తిగా మారుతాయి.')],
    mistakes: [{ when: 'wrong', explain: good(`One ${s}, many ${pl}.`, `ఒకటి: ${s}, చాలా: ${pl}.`) }],
    solution: [L(`one ${s} → ${n} ${pl}`, `ఒక ${s} → ${n} ${pl}`)],
  };
}, d);

const unit = (n: number, title: B, objectives: OSpec[], note?: string): USpec => ({
  id: `ts2.en.ch${n}`, subject: 'english', title: b(title), source: tsSrc(2, 'english', n), objectives, ...(note ? { note } : {}),
});
const obj = (id: string, title: B, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title: b(title), prereqs: [], intro, examples, practice });


const NUMS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const NUMS_TE = ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది'];
const countWords = (key: string, pics: string[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const n = r.int(1, 10);
  const e = r.pick(pics);
  const wrong = [n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 1 && x <= 10).map((x) => NUMS[x - 1]);
  return {
    type: 'mcq', prompt: L('Count the pictures. Choose the number word.', 'బొమ్మలను లెక్కించు. సంఖ్య పదాన్ని ఎంచుకో.'),
    visual: emo(Array.from({ length: n }, () => e).join(' ')), ...choose(r, NUMS[n - 1], wrong),
    hints: [L('Touch each picture as you count: one, two, three…', 'ప్రతి బొమ్మను తాకుతూ లెక్కించు: one, two, three…'), L(`There are ${n}.`, `${n} ఉన్నాయి (${NUMS_TE[n - 1]}).`)],
    mistakes: [{ when: 'wrong', explain: good(`Count again slowly. ${n} is "${NUMS[n - 1]}".`, `మళ్ళీ నెమ్మదిగా లెక్కించు. ${n} = "${NUMS[n - 1]}".`) }],
    solution: [L(`${n} = ${NUMS[n - 1]}`, `${n} = ${NUMS[n - 1]} (${NUMS_TE[n - 1]})`)],
  };
}, d);

// ---------------------------------------------------------------- word banks
const ZOO: W[] = [
  ['🦁', 'lion', 'సింహం'], ['🐅', 'tiger', 'పులి'], ['🐘', 'elephant', 'ఏనుగు'], ['🐒', 'monkey', 'కోతి'], ['🦒', 'giraffe', 'జిరాఫీ'],
  ['🦓', 'zebra', 'జీబ్రా'], ['🐻', 'bear', 'ఎలుగుబంటి'], ['🦌', 'deer', 'జింక'], ['🦚', 'peacock', 'నెమలి'], ['🦜', 'parrot', 'చిలుక'],
  ['🐼', 'panda', 'పాండా'], ['🐢', 'tortoise', 'తాబేలు'], ['🐪', 'camel', 'ఒంటె'],
];
const ABC: W[] = [
  ['🍎', 'apple', 'ఆపిల్'], ['⚽', 'ball', 'బంతి'], ['🐱', 'cat', 'పిల్లి'], ['🐶', 'dog', 'కుక్క'], ['🐘', 'elephant', 'ఏనుగు'],
  ['🐟', 'fish', 'చేప'], ['🐐', 'goat', 'మేక'], ['🏠', 'house', 'ఇల్లు'], ['🪁', 'kite', 'గాలిపటం'], ['🦁', 'lion', 'సింహం'],
  ['🐒', 'monkey', 'కోతి'], ['🦉', 'owl', 'గుడ్లగూబ'], ['🦜', 'parrot', 'చిలుక'], ['🐇', 'rabbit', 'కుందేలు'], ['☀️', 'sun', 'సూర్యుడు'],
  ['🐅', 'tiger', 'పులి'], ['🦓', 'zebra', 'జీబ్రా'],
];
const COLOURS: W[] = [
  ['🔴', 'red', 'ఎరుపు'], ['🔵', 'blue', 'నీలం'], ['🟡', 'yellow', 'పసుపు'], ['🟢', 'green', 'ఆకుపచ్చ'], ['🟠', 'orange', 'నారింజ రంగు'],
  ['🟣', 'purple', 'ఊదా'], ['⬛', 'black', 'నలుపు'], ['⬜', 'white', 'తెలుపు'], ['🟫', 'brown', 'గోధుమ రంగు'],
];
const FAMILY: W[] = [
  ['👩', 'mother', 'అమ్మ'], ['👨', 'father', 'నాన్న'], ['👵', 'grandmother', 'నానమ్మ / అమ్మమ్మ'], ['👴', 'grandfather', 'తాతయ్య'],
  ['👶', 'baby', 'పాపాయి'], ['👦', 'brother', 'అన్న / తమ్ముడు'], ['👧', 'sister', 'అక్క / చెల్లి'],
];
const SCHOOL: W[] = [
  ['✏️', 'pencil', 'పెన్సిల్'], ['🖍️', 'crayon', 'రంగు కడ్డీ'], ['📕', 'book', 'పుస్తకం'], ['🎒', 'bag', 'బడి సంచి'], ['📏', 'ruler', 'స్కేలు'],
  ['🔔', 'bell', 'గంట'], ['🪑', 'chair', 'కుర్చీ'], ['🧑‍🏫', 'teacher', 'ఉపాధ్యాయులు'], ['🏫', 'school', 'బడి'],
];
const RAIN: W[] = [
  ['☂️', 'umbrella', 'గొడుగు'], ['🌧️', 'rain', 'వాన'], ['☁️', 'cloud', 'మేఘం'], ['🌈', 'rainbow', 'ఇంద్రధనుస్సు'], ['💧', 'drop', 'నీటి చుక్క'],
  ['🐸', 'frog', 'కప్ప'], ['⛈️', 'thunder', 'ఉరుము'], ['☀️', 'sun', 'సూర్యుడు'], ['⛵', 'boat', 'పడవ'], ['🌬️', 'wind', 'గాలి'],
];
const GARDEN: W[] = [
  ['🌼', 'flower', 'పువ్వు'], ['🌱', 'plant', 'మొక్క'], ['🍃', 'leaf', 'ఆకు'], ['🦋', 'butterfly', 'సీతాకోకచిలుక'], ['🐞', 'ladybird', 'ఆరుద్ర పురుగు'],
  ['🐜', 'ant', 'చీమ'], ['🌳', 'tree', 'చెట్టు'], ['🪺', 'nest', 'గూడు'], ['🐿️', 'squirrel', 'ఉడుత'], ['🪣', 'bucket', 'బకెట్'],
];
const FAMS: Fam[] = [
  ['at', ['cat', 'hat', 'mat', 'bat', 'rat']], ['un', ['sun', 'fun', 'run', 'bun']], ['ee', ['tree', 'bee', 'see', 'three']],
  ['all', ['ball', 'tall', 'wall', 'fall']], ['ain', ['rain', 'train', 'chain', 'pain']], ['ig', ['pig', 'big', 'dig', 'wig']],
  ['en', ['hen', 'pen', 'ten', 'men']], ['og', ['dog', 'log', 'frog', 'fog']], ['ay', ['day', 'play', 'say', 'way']],
  ['uck', ['duck', 'truck', 'luck', 'stuck']], ['ish', ['fish', 'dish', 'wish']],
];

// ================================================================ 1. At the Zoo
const u1 = unit(1, ['Unit 1 · At the Zoo', 'యూనిట్ 1 · జంతు ప్రదర్శనశాలలో'], [
  obj('ts2.en.ch1.animals', ['Animals at the zoo', 'జూలో జంతువులు'], [
    p('A zoo is a big park where we can see many animals and birds. Let\'s visit! There is a lion, a tiger, an elephant, a monkey, a giraffe, a zebra and a peacock.', 'జూ అంటే చాలా జంతువులు, పక్షులు ఉండే పెద్ద పార్కు. వెళ్దాం పద! అక్కడ సింహం, పులి, ఏనుగు, కోతి, జిరాఫీ, జీబ్రా, నెమలి ఉన్నాయి.'),
    photo('🦒', L('A giraffe has a very long neck.', 'జిరాఫీ మెడ చాలా పొడవు.')),
    keys('lion · tiger · elephant · monkey', 'giraffe · zebra · bear · peacock · parrot'),
    tip('Never tease or feed the animals at the zoo. Watch them quietly.', 'జూలో జంతువులను ఏడిపించకు, ఆహారం వేయకు. నిశ్శబ్దంగా చూడు.'),
  ], [
    exb(['Which animal has black and white stripes?', 'నలుపు-తెలుపు చారలు ఉన్న జంతువు ఏది?'], [['It looks like a horse. 🦓', 'అది గుర్రంలా ఉంటుంది. 🦓']], ['zebra', 'zebra (జీబ్రా)']),
    exb(['What is "ఏనుగు" in English?', '"ఏనుగు" ను ఇంగ్లీష్‌లో ఏమంటారు?'], [['It is very big, with a long trunk. 🐘', 'చాలా పెద్దది, పొడవైన తొండం. 🐘']], ['elephant', 'elephant']),
  ], [picWord('pic', ZOO), meaning('mean', ZOO), missing('spell', ZOO.filter((w) => w[1].length <= 6), 2)]),
  obj('ts2.en.ch1.abc', ['The ABC song and letter sounds', 'ABC పాట, అక్షర శబ్దాలు'], [
    p('Let\'s sing our own alphabet chant and dance! Each letter has a capital (big) form and a small form: A a, B b, C c.', 'మన అక్షరమాల పాట పాడుతూ డాన్స్ చేద్దాం! ప్రతి అక్షరానికి పెద్ద రూపం, చిన్న రూపం ఉంటాయి: A a, B b, C c.'),
    keys('A, B, C — clap with me!', 'D, E, F — jump to the left!', 'G, H, I — hands up high!', 'J, K, L — turn round well!', '… all the way to X, Y, Z — sing it again with me!'),
    photo('🔤', L('26 letters: A to Z.', '26 అక్షరాలు: A నుండి Z.')),
    tip('Each letter makes a sound: a for apple, b for ball, c for cat.', 'ప్రతి అక్షరానికి ఒక శబ్దం: a for apple, b for ball, c for cat.'),
  ], [
    exb(['Which letter comes after B?', 'B తర్వాత ఏ అక్షరం?'], [['Sing: A, B, …', 'పాడు: A, B, …']], ['C', 'C']),
    exb(['What is the small letter for "M"?', '"M" చిన్న అక్షరం ఏది?'], [['M says /m/ as in monkey.', 'M శబ్దం /మ్/ — monkey లో లాగా.']], ['m', 'm']),
  ], [
    orderT('abc', ['Put the letters in ABC order', 'అక్షరాలను ABC వరుసలో పెట్టు'], ['Sing the ABC song softly.', 'ABC పాటను మెల్లగా పాడు.'], [
      ['A', 'B', 'C'], ['C', 'D', 'E', 'F'], ['F', 'G', 'H'], ['H', 'I', 'J', 'K'], ['L', 'M', 'N'], ['N', 'O', 'P', 'Q'], ['R', 'S', 'T'], ['U', 'V', 'W'], ['W', 'X', 'Y', 'Z'],
    ], ', '),
    matchT('case', ['Match the capital letter to the small letter', 'పెద్ద అక్షరాన్ని చిన్న అక్షరంతో జత చేయి'], ['They make the same sound.', 'రెండూ ఒకే శబ్దం చేస్తాయి.'], [
      ['A', 'a'], ['B', 'b'], ['D', 'd'], ['E', 'e'], ['G', 'g'], ['H', 'h'], ['M', 'm'], ['N', 'n'], ['R', 'r'], ['T', 't'],
    ], 3),
    firstSound('first', ABC),
  ]),
  obj('ts2.en.ch1.action', ['Action words: jump, run, dance', 'పని పదాలు: jump, run, dance'], [
    p('Action words tell us what we do. At the zoo, the monkey jumps, the deer runs, the peacock dances, the bird flies, the fish swims and the elephant stamps!', 'పని పదాలు మనం ఏమి చేస్తామో చెబుతాయి. జూలో కోతి దూకుతుంది (jumps), జింక పరిగెత్తుతుంది (runs), నెమలి నాట్యం చేస్తుంది (dances), పక్షి ఎగురుతుంది (flies), చేప ఈదుతుంది (swims), ఏనుగు నేలను తొక్కుతుంది (stamps)!'),
    keys('Jump like a monkey!', 'Run like a deer!', 'Dance like a peacock!', 'Stamp like an elephant!', 'Clap, clap, clap — and sit down!'),
    photo('🦚', L('The peacock dances when it rains.', 'వాన పడినప్పుడు నెమలి నాట్యం చేస్తుంది.')),
    tip('Stand up and do each action as you say it!', 'లేచి నిలబడి ప్రతి పని చేస్తూ చెప్పు!'),
  ], [
    exb(['What does a fish do?', 'చేప ఏమి చేస్తుంది?'], [['It moves in water.', 'అది నీటిలో కదులుతుంది.']], ['It swims.', 'It swims. (ఈదుతుంది.)']),
    exb(['Find the action word: "The monkey jumps."', 'పని పదం కనుక్కో: "The monkey jumps."'], [['What does the monkey do?', 'కోతి ఏమి చేస్తుంది?']], ['jumps', 'jumps (దూకుతుంది)']),
  ], [
    fill('fill', ['What does this animal do best?', 'ఈ జంతువు బాగా ఏమి చేస్తుంది?'], [
      ['🐒 The monkey ___ from tree to tree.', 'jumps', ['swims', 'flies', 'sleeps'], 'Monkeys jump on trees.', 'కోతులు చెట్లపై దూకుతాయి.'],
      ['🐟 The fish ___ in the water.', 'swims', ['runs', 'flies', 'climbs'], 'Fish swim.', 'చేపలు ఈదుతాయి.'],
      ['🦜 The parrot ___ in the sky.', 'flies', ['swims', 'runs', 'digs'], 'Birds fly.', 'పక్షులు ఎగురుతాయి.'],
      ['🦚 The peacock ___ in the rain.', 'dances', ['swims', 'reads', 'cooks'], 'Peacocks dance in the rain.', 'నెమళ్ళు వానలో నాట్యం చేస్తాయి.'],
      ['🦌 The deer ___ very fast.', 'runs', ['swims', 'flies', 'sleeps'], 'Deer run fast.', 'జింకలు వేగంగా పరిగెత్తుతాయి.'],
      ['🐘 The elephant ___ its big feet.', 'stamps', ['flies', 'swims', 'sings'], 'Elephants stamp their feet.', 'ఏనుగులు కాళ్ళతో నేలను తొక్కుతాయి.'],
    ]),
    tapT('tap', ['Tap the action words', 'పని పదాలను నొక్కు'], [
      ['jump', true], ['run', true], ['dance', true], ['clap', true], ['swim', true], ['fly', true],
      ['lion', false], ['zoo', false], ['big', false], ['tiger', false],
    ], ['Action words tell what we do.', 'పని పదాలు మనం ఏమి చేస్తామో చెబుతాయి.']),
  ]),
]);

// ================================================================ 2. Where Are You, Sweety?
const u2 = unit(2, ['Unit 2 · Where Are You, Sweety?', 'యూనిట్ 2 · స్వీటీ, ఎక్కడ ఉన్నావు?'], [
  obj('ts2.en.ch2.story', ['A lost little duckling', 'తప్పిపోయిన బాతు పిల్ల'], [
    p('This unit is about a little duckling who gets lost. Here is our own short story. Mother Duck had five ducklings. One day, the smallest one, Sweety, was missing! "Sweety, where are you?" called Mother Duck. She looked near the tree. She looked behind the rock. At last she found Sweety hiding under a big green leaf by the pond. "Here I am!" said Sweety. Mother Duck hugged her.', 'ఈ పాఠం తప్పిపోయిన ఒక బాతు పిల్ల గురించి. ఇది మన స్వంత చిన్న కథ. అమ్మ బాతుకు ఐదు బాతు పిల్లలు. ఒక రోజు అందరికంటే చిన్నది స్వీటీ కనిపించలేదు! "స్వీటీ, ఎక్కడ ఉన్నావు?" అని అమ్మ బాతు పిలిచింది. చెట్టు దగ్గర చూసింది. రాయి వెనుక చూసింది. చివరికి చెరువు దగ్గర పెద్ద పచ్చని ఆకు కింద దాక్కున్న స్వీటీని కనుక్కుంది. "ఇక్కడే ఉన్నాను!" అంది స్వీటీ. అమ్మ బాతు ఆమెను హత్తుకుంది.'),
    photo('🦆', L('A duck says "quack, quack" and swims in the pond.', 'బాతు "క్వాక్, క్వాక్" అంటుంది, చెరువులో ఈదుతుంది.')),
    keys('duckling = a baby duck', 'pond = a small lake', 'Stay close to your family when you go out!'),
    tip('Say "Sweety, where are you?" in a worried voice, then "Here I am!" in a happy voice.', '"Sweety, where are you?" ని కంగారు గొంతుతో, "Here I am!" ని సంతోషంగా చెప్పు.'),
  ], [
    exb(['How many ducklings did Mother Duck have?', 'అమ్మ బాతుకు ఎన్ని పిల్లలు?'], [['The story says five.', 'కథలో ఐదు అని ఉంది.']], ['five', 'ఐదు (five)']),
    exb(['Where was Sweety hiding?', 'స్వీటీ ఎక్కడ దాక్కుంది?'], [['Near the pond, under something green.', 'చెరువు దగ్గర, పచ్చని దాని కింద.']], ['under a big green leaf', 'పెద్ద పచ్చని ఆకు కింద']),
  ], [
    mcq('read', ['Remember Sweety\'s story.', 'స్వీటీ కథను గుర్తు చేసుకో.'], [
      ['Who is Sweety?', 'స్వీటీ ఎవరు?', 'a little duckling', ['a cat', 'a girl', 'a frog'], 'Sweety is a baby duck.', 'స్వీటీ బాతు పిల్ల.'],
      ['Who looked for Sweety?', 'స్వీటీని ఎవరు వెతికారు?', 'Mother Duck', ['a lion', 'a farmer', 'a teacher'], 'Her mother looked everywhere.', 'ఆమె అమ్మ అంతా వెతికింది.'],
      ['Where did Mother Duck find Sweety?', 'అమ్మ బాతు స్వీటీని ఎక్కడ కనుక్కుంది?', 'under a leaf by the pond', ['in a car', 'on a roof', 'in school'], 'Sweety hid under a big leaf.', 'స్వీటీ పెద్ద ఆకు కింద దాక్కుంది.'],
      ['What did Sweety say?', 'స్వీటీ ఏమంది?', 'Here I am!', ['Goodbye!', 'I am hungry!', 'Go away!'], 'She said "Here I am!"', '"ఇక్కడే ఉన్నాను!" అంది.'],
      ['How many ducklings were there?', 'ఎన్ని బాతు పిల్లలు ఉన్నాయి?', 'five', ['two', 'ten', 'one'], 'Mother Duck had five ducklings.', 'అమ్మ బాతుకు ఐదు పిల్లలు.'],
      ['How did Mother Duck feel at the end?', 'చివర్లో అమ్మ బాతు ఎలా ఉంది?', 'happy', ['angry', 'sleepy', 'sad'], 'She found Sweety and hugged her.', 'స్వీటీ దొరికింది, హత్తుకుంది.'],
    ]),
    orderT('seq', ['Put the story in order', 'కథను వరుసలో పెట్టు'], ['First, someone was missing.', 'ముందు ఎవరో కనిపించలేదు.'], [
      ['Sweety was missing.', 'Mother Duck called her.', 'She found Sweety.'],
      ['She looked near the tree.', 'She looked behind the rock.', 'She looked under the leaf.'],
      ['Mother Duck called, "Where are you?"', 'Sweety said, "Here I am!"', 'Mother Duck hugged her.'],
      ['Sweety hid under a leaf.', 'Mother Duck looked for her.', 'They were happy again.'],
      ['Sweety was missing.', 'Mother Duck looked everywhere.', 'Sweety came out.', 'They went home.'],
    ], ' → '),
  ]),
  obj('ts2.en.ch2.colours', ['Colours all around', 'చుట్టూ రంగులు'], [
    p('The world is full of colours! Sweety is yellow. The leaf is green. The sky is blue. A tomato is red. Let\'s learn colour words: red, blue, yellow, green, orange, purple, black, white and brown.', 'ప్రపంచం రంగులతో నిండి ఉంది! స్వీటీ పసుపు (yellow). ఆకు ఆకుపచ్చ (green). ఆకాశం నీలం (blue). టమాటా ఎరుపు (red). రంగుల పదాలు: red, blue, yellow, green, orange, purple, black, white, brown.'),
    photo('🌈', L('A rainbow has many colours.', 'ఇంద్రధనుస్సులో చాలా రంగులు.')),
    keys('red 🍅 · yellow 🍌 · green 🍃 · blue 🦋', 'orange 🍊 · purple 🍇 · black 🐦‍⬛ · white 🥚 · brown 🐻'),
    tip('Play "I see something red!" — your friend finds something red in the room.', '"I see something red!" ఆట — నీ స్నేహితుడు గదిలో ఎరుపు వస్తువు వెతకాలి.'),
  ], [
    exb(['What colour is a banana? 🍌', 'అరటి పండు ఏ రంగు? 🍌'], [['A ripe banana is…', 'పండిన అరటి…']], ['yellow', 'yellow (పసుపు)']),
    exb(['What colour are leaves? 🍃', 'ఆకులు ఏ రంగు? 🍃'], [['Think of a tree.', 'చెట్టును గుర్తు చేసుకో.']], ['green', 'green (ఆకుపచ్చ)']),
  ], [
    picWord('pic', COLOURS),
    mcq('what', ['Picture the thing in your mind.', 'ఆ వస్తువును మనసులో ఊహించుకో.'], [
      ['🍌 What colour is a banana?', '🍌 అరటి పండు ఏ రంగు?', 'yellow', ['blue', 'black', 'purple'], 'A ripe banana is yellow.', 'పండిన అరటి పసుపు రంగు.'],
      ['🍅 What colour is a tomato?', '🍅 టమాటా ఏ రంగు?', 'red', ['blue', 'white', 'green'], 'A ripe tomato is red.', 'పండిన టమాటా ఎరుపు.'],
      ['🍃 What colour is a leaf?', '🍃 ఆకు ఏ రంగు?', 'green', ['red', 'purple', 'black'], 'Leaves are green.', 'ఆకులు ఆకుపచ్చ.'],
      ['🍇 What colour are these grapes?', '🍇 ఈ ద్రాక్షలు ఏ రంగు?', 'purple', ['yellow', 'white', 'orange'], 'These grapes are purple.', 'ఈ ద్రాక్షలు ఊదా రంగు.'],
      ['🐦‍⬛ What colour is a crow?', '🐦‍⬛ కాకి ఏ రంగు?', 'black', ['white', 'yellow', 'pink'], 'A crow is black.', 'కాకి నలుపు.'],
      ['🍊 What colour is an orange?', '🍊 నారింజ పండు ఏ రంగు?', 'orange', ['blue', 'black', 'green'], 'An orange is orange!', 'నారింజ పండు నారింజ రంగు!'],
      ['🥚 What colour is this egg?', '🥚 ఈ గుడ్డు ఏ రంగు?', 'white', ['blue', 'green', 'purple'], 'This egg is white.', 'ఈ గుడ్డు తెలుపు.'],
    ]),
    meaning('mean', COLOURS, 2),
  ]),
  obj('ts2.en.ch2.rhyme', ['Rhyme time with Sweety', 'స్వీటీతో ప్రాస పాట'], [
    p('Here is our own little rhyme about Sweety. Sing it and clap! Words that end with the same sound are called rhyming words: duck – luck, pond – beyond.', 'ఇది స్వీటీ గురించి మన స్వంత చిన్న పాట. పాడుతూ చప్పట్లు కొట్టు! ఒకే శబ్దంతో ముగిసే పదాలను ప్రాస పదాలు అంటారు: duck – luck, day – play.'),
    keys('Little Sweety, yellow and small,', 'Where are you? I call and call!', 'Under a leaf, beside the pond,', 'Quack, quack, quack — of you I\'m fond!'),
    photo('🐸', L('A frog sits beside the pond.', 'చెరువు పక్కన ఒక కప్ప కూర్చుంది.')),
    tip('Clap on each rhyming word: small – call, pond – fond.', 'ప్రతి ప్రాస పదానికి చప్పట్లు: small – call, pond – fond.'),
  ], [
    exb(['Which word rhymes with "small": call or cup?', '"small" తో ప్రాస కలిసేది: call లేదా cup?'], [['small ends in -all. call ends in -all too!', 'small చివర -all, call చివర కూడా -all!']], ['call', 'call']),
    exb(['Find a word that rhymes with "duck".', '"duck" తో ప్రాస కలిసే పదం చెప్పు.'], [['d-UCK … what else ends in -uck?', 'd-UCK … ఇంకా ఏది -uck తో ముగుస్తుంది?']], ['truck (or luck)', 'truck (లేదా luck)']),
  ], [
    finish('rhyme', [
      ['Little Sweety, yellow and small, / Where are you? I call and ___!', 'call', 'small', ['shout', 'look', 'cry'], 'చిన్న పసుపు స్వీటీ, ఎక్కడ ఉన్నావు? పిలుస్తూనే ఉన్నాను!'],
      ['Under a leaf, beside the pond, / Quack, quack, quack — of you I\'m ___!', 'fond', 'pond', ['glad', 'happy', 'sure'], 'చెరువు పక్కన ఆకు కింద — క్వాక్ క్వాక్, నువ్వంటే నాకు ఇష్టం!'],
      ['Five little ducks went out to play, / Over the hills and far ___.', 'away', 'play', ['off', 'out', 'there'], 'ఐదు బాతు పిల్లలు ఆడుకోవడానికి కొండల మీదుగా దూరం వెళ్ళాయి.'],
      ['Splash in the water, swim in the sun, / Little ducks are having ___!', 'fun', 'sun', ['food', 'lunch', 'a bath'], 'నీటిలో చిందులు, ఎండలో ఈత — బాతు పిల్లలకు సరదా!'],
      ['A yellow duck, a little duck, / Found a coin — what good ___!', 'luck', 'duck', ['day', 'news', 'time'], 'పసుపు బాతు, చిన్న బాతు, నాణెం దొరికింది — ఎంత అదృష్టం!'],
      ['Mother Duck, Mother Duck, where did you go? / I am here in the pond, swimming ___.', 'slow', 'go', ['fast', 'well', 'far'], 'అమ్మ బాతు, ఎక్కడికి వెళ్ళావు? ఇక్కడే చెరువులో నెమ్మదిగా ఈదుతున్నాను.'],
    ]),
    rhymeQ('fam', FAMS, 2),
  ]),
], 'Unit 2: our own Sweety story and rhyme are used; the Reader\'s story and rhyme "My little Sweety" are not reproduced.');

// ================================================================ 3. A Visit to Uncle's House
const u3 = unit(3, ['Unit 3 · A Visit to Uncle\'s House', 'యూనిట్ 3 · మామయ్య ఇంటికి ప్రయాణం'], [
  obj('ts2.en.ch3.story', ['A bus trip to Uncle\'s village', 'బస్సులో మామయ్య ఊరికి'], [
    p('In this unit Siddu goes on a bus trip. Here is our own short story. It is a holiday. Siddu and his mother are going to Uncle\'s house. They wait at the bus stop. The red bus comes. Siddu sits by the window. He sees fields, cows and a river. After one hour, they reach the village. Uncle is waiting with a big smile!', 'ఈ పాఠంలో సిద్దు బస్సులో ప్రయాణం చేస్తాడు. ఇది మన స్వంత కథ. సెలవు రోజు. సిద్దు, అమ్మ మామయ్య ఇంటికి వెళ్తున్నారు. బస్ స్టాప్‌లో ఎదురుచూస్తారు. ఎర్ర బస్సు వస్తుంది. సిద్దు కిటికీ దగ్గర కూర్చుంటాడు. పొలాలు, ఆవులు, ఒక నది చూస్తాడు. ఒక గంట తర్వాత ఊరు చేరుకుంటారు. మామయ్య పెద్ద నవ్వుతో ఎదురుచూస్తున్నాడు!'),
    photo('🚌', L('We wait for the bus at the bus stop.', 'బస్ స్టాప్‌లో బస్సు కోసం ఎదురుచూస్తాం.')),
    keys('bus stop — where we wait for the bus', 'window seat — a seat by the window', 'village — a small place with fields'),
    tip('Tell your own trip: "I am going to … by …"', 'నీ ప్రయాణం చెప్పు: "I am going to … by …"'),
  ], [
    exb(['Where are Siddu and his mother going?', 'సిద్దు, అమ్మ ఎక్కడికి వెళ్తున్నారు?'], [['Look at the unit title.', 'పాఠం పేరు చూడు.']], ['to Uncle\'s house', 'మామయ్య ఇంటికి']),
    exb(['What did Siddu see from the window?', 'కిటికీలోంచి సిద్దు ఏమి చూశాడు?'], [['Think of the countryside.', 'పల్లె దృశ్యం గుర్తు చేసుకో.']], ['fields, cows and a river', 'పొలాలు, ఆవులు, నది']),
  ], [
    mcq('read', ['Remember Siddu\'s trip.', 'సిద్దు ప్రయాణం గుర్తు చేసుకో.'], [
      ['How did Siddu travel?', 'సిద్దు దేనిలో ప్రయాణించాడు?', 'by bus', ['by train', 'by boat', 'by aeroplane'], 'The red bus came.', 'ఎర్ర బస్సు వచ్చింది.'],
      ['Who went with Siddu?', 'సిద్దుతో ఎవరు వెళ్ళారు?', 'his mother', ['his teacher', 'his dog', 'his friend'], 'Siddu and his mother went.', 'సిద్దు, అమ్మ వెళ్ళారు.'],
      ['Where did they wait?', 'వాళ్ళు ఎక్కడ ఎదురుచూశారు?', 'at the bus stop', ['at school', 'in the river', 'at the zoo'], 'We wait for a bus at the bus stop.', 'బస్ స్టాప్‌లో బస్సు కోసం ఎదురుచూస్తాం.'],
      ['What colour was the bus?', 'బస్సు ఏ రంగు?', 'red', ['blue', 'green', 'black'], 'The red bus came.', 'ఎర్ర బస్సు వచ్చింది.'],
      ['Where did Siddu sit?', 'సిద్దు ఎక్కడ కూర్చున్నాడు?', 'by the window', ['on the roof', 'on the floor', 'near the door'], 'He sat by the window.', 'కిటికీ దగ్గర కూర్చున్నాడు.'],
      ['Who was waiting in the village?', 'ఊరిలో ఎవరు ఎదురుచూస్తున్నారు?', 'Uncle', ['a lion', 'the bus driver', 'nobody'], 'Uncle was waiting with a smile.', 'మామయ్య నవ్వుతూ ఎదురుచూశాడు.'],
    ]),
    orderT('seq', ['Put Siddu\'s trip in order', 'సిద్దు ప్రయాణాన్ని వరుసలో పెట్టు'], ['First they go to the bus stop.', 'ముందు బస్ స్టాప్‌కు వెళ్తారు.'], [
      ['Wait at the bus stop.', 'Get on the bus.', 'Reach the village.'],
      ['The bus comes.', 'Siddu sits by the window.', 'He sees the fields.'],
      ['They get off the bus.', 'They see Uncle.', 'Uncle smiles.'],
      ['Wait at the bus stop.', 'The bus comes.', 'Get on the bus.', 'Sit down.'],
      ['Siddu sees the cows.', 'He sees the river.', 'They reach the village.'],
    ], ' → '),
  ]),
  obj('ts2.en.ch3.family', ['My family words', 'నా కుటుంబం పదాలు'], [
    p('Siddu visits his uncle. Uncle is family! Let\'s learn family words: mother, father, grandmother, grandfather, brother, sister, baby, uncle and aunt.', 'సిద్దు మామయ్యను కలవడానికి వెళ్తాడు. మామయ్య మన కుటుంబం! కుటుంబ పదాలు నేర్చుకుందాం: mother (అమ్మ), father (నాన్న), grandmother (నానమ్మ/అమ్మమ్మ), grandfather (తాతయ్య), brother (అన్న/తమ్ముడు), sister (అక్క/చెల్లి), baby (పాపాయి), uncle (మామయ్య/బాబాయి), aunt (అత్త/పిన్ని).'),
    photo('👵', L('My grandmother tells me stories.', 'మా నానమ్మ నాకు కథలు చెబుతుంది.')),
    keys('This is my mother. This is my father.', 'I love my family!'),
    tip('Draw your family and write each person\'s name under the picture.', 'నీ కుటుంబం బొమ్మ గీసి ప్రతి ఒక్కరి కింద పేరు రాయి.'),
  ], [
    exb(['Who is your father\'s father?', 'నాన్న నాన్న ఎవరు?'], [['He is old and wise.', 'ఆయన పెద్దవారు.']], ['grandfather', 'grandfather (తాతయ్య)']),
    exb(['What is "అమ్మ" in English?', '"అమ్మ" ను ఇంగ్లీష్‌లో ఏమంటారు?'], [['👩', '👩']], ['mother', 'mother']),
  ], [
    picWord('pic', FAMILY),
    meaning('mean', FAMILY),
    matchT('match', ['Match the English word to the Telugu word', 'ఇంగ్లీష్ పదాన్ని తెలుగు పదంతో జత చేయి'], ['Say each English word aloud first.', 'ముందు ప్రతి ఇంగ్లీష్ పదాన్ని పైకి చెప్పు.'], [
      ['mother', 'అమ్మ'], ['father', 'నాన్న'], ['uncle', 'మామయ్య'], ['aunt', 'అత్త'], ['baby', 'పాపాయి'], ['grandfather', 'తాతయ్య'],
    ]),
  ]),
  obj('ts2.en.ch3.going', ['Is going, are going, am going', 'ఇప్పుడు జరుగుతున్న పనులు: is / are / am + -ing'], [
    p('To tell what is happening now, we use is, are or am with an -ing word. "Siddu is going to the bus stop." "They are sitting on the bus." "I am looking out of the window."', 'ఇప్పుడు జరుగుతున్న పని చెప్పడానికి is, are, am తో -ing పదం వాడతాం. "Siddu is going to the bus stop." (సిద్దు బస్ స్టాప్‌కు వెళ్తున్నాడు.) "They are sitting on the bus." (వాళ్ళు బస్సులో కూర్చున్నారు.) "I am looking out of the window."'),
    photo('🧒', L('"I am going to Uncle\'s house!"', '"నేను మామయ్య ఇంటికి వెళ్తున్నాను!"')),
    keys('I → am: I am going.', 'one person → is: Siddu is going.', 'many → are: They are going.'),
    tip('Look at who is doing it: I, one, or many?', 'పని ఎవరు చేస్తున్నారో చూడు: I, ఒకరు, లేక చాలామంది?'),
  ], [
    exb(['Siddu ___ going to the village.', 'Siddu ___ going to the village.'], [['Siddu is one person.', 'సిద్దు ఒక్కడు.']], ['is', 'is']),
    exb(['The cows ___ eating grass.', 'The cows ___ eating grass.'], [['Many cows.', 'చాలా ఆవులు.']], ['are', 'are']),
  ], [
    fill('fill', ['I → am · one → is · many → are', 'I → am · ఒకరు → is · చాలా → are'], [
      ['I ___ going to Uncle\'s house.', 'am', ['is', 'are'], 'With "I" we say "am".', '"I" తో "am".'],
      ['Siddu ___ sitting by the window.', 'is', ['am', 'are'], 'Siddu is one person → is.', 'సిద్దు ఒక్కడు → is.'],
      ['The children ___ singing.', 'are', ['is', 'am'], 'Many children → are.', 'చాలా మంది పిల్లలు → are.'],
      ['Mother ___ buying the tickets.', 'is', ['are', 'am'], 'Mother is one person → is.', 'అమ్మ ఒక్కరు → is.'],
      ['The cows ___ eating grass.', 'are', ['is', 'am'], 'Many cows → are.', 'చాలా ఆవులు → are.'],
      ['The bus ___ going fast.', 'is', ['are', 'am'], 'One bus → is.', 'ఒక బస్సు → is.'],
      ['We ___ going to the village.', 'are', ['is', 'am'], '"We" means many → are.', '"We" అంటే చాలామంది → are.'],
    ]),
    orderT('build', ['Put the words in order', 'పదాలను వరుసలో పెట్టు'], ['Who is doing it? Start with that word.', 'పని ఎవరు చేస్తున్నారో ఆ పదంతో మొదలుపెట్టు.'], [
      ['Siddu', 'is', 'going', 'home.'], ['I', 'am', 'sitting', 'here.'], ['They', 'are', 'singing', 'songs.'],
      ['The', 'bus', 'is', 'coming.'], ['We', 'are', 'going', 'out.'], ['Mother', 'is', 'smiling.'],
    ]),
  ]),
], 'Unit 3: our own bus-trip story is used; the Reader\'s story of Siddu is not summarised.');

// ================================================================ 4. Snoopy Goes to School
const u4 = unit(4, ['Unit 4 · Snoopy Goes to School', 'యూనిట్ 4 · బడికి వెళ్ళిన స్నూపీ'], [
  obj('ts2.en.ch4.school', ['My school', 'నా బడి'], [
    p('In this unit, Snoopy goes to school! What do we have at school? A teacher, a classroom, books, pencils, a blackboard, a bell and a playground. Here is our own school rhyme.', 'ఈ పాఠంలో స్నూపీ బడికి వెళ్తుంది! బడిలో ఏమి ఉంటాయి? ఉపాధ్యాయులు, తరగతి గది, పుస్తకాలు, పెన్సిళ్ళు, నల్లబల్ల, గంట, ఆట స్థలం. ఇది మన బడి పాట.'),
    keys('Ding, dong, the school bell rings,', 'Bring your bag and all your things,', 'Read a book and draw a tree,', 'School is fun for you and me!'),
    photo('🏫', L('This is my school.', 'ఇది నా బడి.')),
    tip('Say: "This is my school. My teacher is kind. I like to read."', '"This is my school. My teacher is kind. I like to read." అని చెప్పు.'),
  ], [
    exb(['What rings at school?', 'బడిలో ఏది మోగుతుంది?'], [['Ding, dong! 🔔', 'డింగ్, డాంగ్! 🔔']], ['the bell', 'గంట (bell)']),
    exb(['Where do we play at school?', 'బడిలో ఎక్కడ ఆడుకుంటాం?'], [['A big open space outside.', 'బయట పెద్ద ఖాళీ స్థలం.']], ['in the playground', 'ఆట స్థలంలో (playground)']),
  ], [
    picWord('pic', SCHOOL),
    finish('rhyme', [
      ['Ding, dong, the school bell rings, / Bring your bag and all your ___.', 'things', 'rings', ['books', 'pens', 'food'], 'డింగ్ డాంగ్ బడి గంట మోగుతోంది, సంచి, వస్తువులు తీసుకురా.'],
      ['Read a book and draw a tree, / School is fun for you and ___!', 'me', 'tree', ['all', 'us', 'them'], 'పుస్తకం చదువు, చెట్టు గీయి, బడి నీకూ నాకూ సరదా!'],
      ['My pencil is long, my pencil is new, / I write my name and draw for ___.', 'you', 'new', ['him', 'them', 'mother'], 'నా పెన్సిల్ పొడవైనది, కొత్తది, నా పేరు రాసి నీ కోసం బొమ్మ గీస్తాను.'],
      ['Snoopy, Snoopy, come to class, / Sit with me upon the ___.', 'grass', 'class', ['mat', 'bench', 'floor'], 'స్నూపీ, తరగతికి రా, నాతో పాటు గడ్డి మీద కూర్చో.'],
      ['We sing a song, we play a game, / Our teacher calls us each by ___.', 'name', 'game', ['turn', 'hand', 'row'], 'పాట పాడతాం, ఆట ఆడతాం, టీచర్ మమ్మల్ని పేరుతో పిలుస్తారు.'],
    ]),
    missing('spell', SCHOOL.filter((w) => w[1].length <= 6), 2),
  ]),
  obj('ts2.en.ch4.can', ['I can, I cannot', 'నేను చేయగలను, చేయలేను'], [
    p('"Can" tells what we are able to do. "Cannot" tells what we are not able to do. Snoopy is a dog. Snoopy can run. Snoopy can bark. Snoopy cannot read. Snoopy cannot write!', '"can" — చేయగలిగేది. "cannot" — చేయలేనిది. స్నూపీ ఒక కుక్క. Snoopy can run (పరిగెత్తగలదు). Snoopy can bark (మొరగగలదు). Snoopy cannot read (చదవలేదు). Snoopy cannot write (రాయలేదు)!'),
    photo('🐶', L('Snoopy can run. Snoopy cannot read.', 'స్నూపీ పరిగెత్తగలదు, చదవలేదు.')),
    keys('I can read. I can write. I can draw.', 'A dog can bark. A dog cannot write.'),
    tip('Tell your friend three things you can do!', 'నువ్వు చేయగలిగే మూడు పనులు స్నేహితుడికి చెప్పు!'),
  ], [
    exb(['A dog ___ bark.', 'A dog ___ bark.'], [['Dogs say "bow-wow".', 'కుక్కలు "భౌ భౌ" అంటాయి.']], ['can', 'can']),
    exb(['A dog ___ write.', 'A dog ___ write.'], [['Dogs cannot hold a pencil.', 'కుక్క పెన్సిల్ పట్టుకోలేదు.']], ['cannot', 'cannot']),
  ], [
    fill('fill', ['Is it able to do it? Yes → can. No → cannot.', 'అది చేయగలదా? అవును → can. కాదు → cannot.'], [
      ['🐶 Snoopy ___ run.', 'can', ['cannot'], 'Dogs can run.', 'కుక్కలు పరిగెత్తగలవు.'],
      ['🐶 Snoopy ___ read a book.', 'cannot', ['can'], 'Dogs cannot read.', 'కుక్కలు చదవలేవు.'],
      ['🐦 A bird ___ fly.', 'can', ['cannot'], 'Birds have wings.', 'పక్షులకు రెక్కలు ఉన్నాయి.'],
      ['🐄 A cow ___ fly.', 'cannot', ['can'], 'Cows have no wings.', 'ఆవులకు రెక్కలు లేవు.'],
      ['🐟 A fish ___ swim.', 'can', ['cannot'], 'Fish swim.', 'చేపలు ఈదుతాయి.'],
      ['🐱 A cat ___ write.', 'cannot', ['can'], 'Cats cannot write.', 'పిల్లులు రాయలేవు.'],
      ['🧒 I ___ read and write.', 'can', ['cannot'], 'You are learning to read and write!', 'నువ్వు చదవడం, రాయడం నేర్చుకుంటున్నావు!'],
    ]),
    tapT('tap', ['Tap what a dog CAN do', 'కుక్క చేయగలిగేవి నొక్కు'], [
      ['run', true], ['bark', true], ['jump', true], ['wag its tail', true], ['eat', true],
      ['read a book', false], ['write a letter', false], ['fly', false], ['drive a bus', false],
    ], ['A dog can run, bark, jump, eat and wag its tail.', 'కుక్క పరిగెత్తగలదు, మొరగగలదు, దూకగలదు, తినగలదు, తోక ఊపగలదు.']),
  ]),
  obj('ts2.en.ch4.aan', ['A and an', 'A, an వాడకం'], [
    p('We say "a" or "an" before one thing. We say "an" before words that begin with a, e, i, o, u: an apple, an egg, an owl. We say "a" before other words: a bag, a pencil, a dog.', 'ఒక వస్తువు ముందు "a" లేదా "an" చెబుతాం. a, e, i, o, u తో మొదలయ్యే పదాల ముందు "an": an apple, an egg, an owl. మిగతా పదాల ముందు "a": a bag, a pencil, a dog.'),
    photo('🍎', L('an apple', 'an apple (ఒక ఆపిల్)')),
    keys('a, e, i, o, u → an', 'an apple · an egg · an owl · an umbrella', 'a bag · a book · a dog · a pen'),
    tip('Say both aloud: "a apple" sounds bumpy, "an apple" sounds smooth!', 'రెండూ పైకి చెప్పు: "a apple" కఠినంగా, "an apple" సాఫీగా వినిపిస్తుంది!'),
  ], [
    exb(['___ egg', '___ egg'], [['egg begins with "e".', 'egg "e" తో మొదలవుతుంది.']], ['an egg', 'an egg']),
    exb(['___ book', '___ book'], [['book begins with "b".', 'book "b" తో మొదలవుతుంది.']], ['a book', 'a book']),
  ], [
    aan('aan', [
      ['🍎', 'apple', 'ఆపిల్'], ['🥚', 'egg', 'గుడ్డు'], ['☂️', 'umbrella', 'గొడుగు'], ['🦉', 'owl', 'గుడ్లగూబ'], ['🐘', 'elephant', 'ఏనుగు'],
      ['🍊', 'orange', 'నారింజ'], ['🐜', 'ant', 'చీమ'], ['🎒', 'bag', 'సంచి'], ['📕', 'book', 'పుస్తకం'], ['✏️', 'pencil', 'పెన్సిల్'],
      ['🐶', 'dog', 'కుక్క'], ['🔔', 'bell', 'గంట'], ['🪑', 'chair', 'కుర్చీ'],
    ]),
    tapT('tap', ['Tap the words that need "an"', '"an" కావలసిన పదాలను నొక్కు'], [
      ['apple', true], ['egg', true], ['owl', true], ['umbrella', true], ['elephant', true], ['ant', true],
      ['bag', false], ['dog', false], ['pen', false], ['cat', false],
    ], ['"an" goes before words beginning with a, e, i, o, u.', 'a, e, i, o, u తో మొదలయ్యే పదాల ముందు "an".']),
  ]),
], 'Unit 4: title only partly legible in the source listing; our own school rhyme is used and the Reader\'s Snoopy story is not summarised.');

// ================================================================ 5. Rain... Rain...
const u5 = unit(5, ['Unit 5 · Rain... Rain...', 'యూనిట్ 5 · వాన... వాన...'], [
  obj('ts2.en.ch5.words', ['Rainy day words', 'వాన రోజు పదాలు'], [
    p('Look! Dark clouds in the sky. Thunder goes boom! Then the rain comes — drip, drop, drip, drop. We open our umbrellas. Frogs croak. After the rain, a rainbow comes out!', 'చూడు! ఆకాశంలో నల్లని మేఘాలు. ఉరుము ఢాం అంటుంది! తర్వాత వాన — టప్ టప్ టప్. గొడుగులు తెరుస్తాం. కప్పలు బెకబెక అంటాయి. వాన తర్వాత ఇంద్రధనుస్సు వస్తుంది!'),
    photo('🌧️', L('Rain falls from the clouds.', 'మేఘాల నుండి వాన పడుతుంది.')),
    keys('cloud · rain · drop · thunder · umbrella', 'frog · puddle · paper boat · rainbow'),
    tip('Make a paper boat and float it in a puddle after the rain!', 'కాగితపు పడవ చేసి వాన తర్వాత నీటి గుంటలో వదులు!'),
  ], [
    exb(['What do we use to stay dry in the rain?', 'వానలో తడవకుండా ఏమి వాడతాం?'], [['☂️ We hold it over our head.', '☂️ తల మీద పట్టుకుంటాం.']], ['an umbrella', 'umbrella (గొడుగు)']),
    exb(['What comes in the sky after the rain?', 'వాన తర్వాత ఆకాశంలో ఏమి వస్తుంది?'], [['It has seven colours. 🌈', 'దానిలో ఏడు రంగులు. 🌈']], ['a rainbow', 'rainbow (ఇంద్రధనుస్సు)']),
  ], [picWord('pic', RAIN), meaning('mean', RAIN), missing('spell', RAIN.filter((w) => w[1].length <= 7), 2)]),
  obj('ts2.en.ch5.rhyme', ['Rain rhymes', 'వాన పాటలు'], [
    p('"Rain, rain, go away, come again another day" is a very old English nursery rhyme. Children sing it when they want to go out and play. Here it is, with our own extra verse.', '"Rain, rain, go away, come again another day" చాలా పాత ఇంగ్లీష్ పిల్లల పాట. బయట ఆడుకోవాలనుకున్నప్పుడు పిల్లలు దీన్ని పాడతారు. ఇదిగో, మన స్వంత అదనపు చరణంతో.'),
    keys('Rain, rain, go away,', 'Come again another day.', '(our verse) Pitter, patter, on the roof,', 'Frogs say "croak" and cows say "moo"!'),
    photo('🐸', L('Frogs love the rain!', 'కప్పలకు వాన అంటే ఇష్టం!')),
    tip('Tap your fingers on the desk like raindrops while you sing.', 'పాడుతూ వేళ్ళతో బల్ల మీద వాన చుక్కల్లా తట్టు.'),
  ], [
    exb(['Finish: "Rain, rain, go away, come again another ___."', 'పూర్తి చేయి: "Rain, rain, go away, come again another ___."'], [['It rhymes with "away".', '"away" తో ప్రాస.']], ['day', 'day (రోజు)']),
    exb(['Which word rhymes with "rain": train or road?', '"rain" తో ప్రాస: train లేదా road?'], [['r-AIN, tr-AIN!', 'r-AIN, tr-AIN!']], ['train', 'train']),
  ], [
    finish('rhyme', [
      ['Rain, rain, go away, / Come again another ___.', 'day', 'away', ['time', 'week', 'night'], 'వానా వానా వెళ్ళిపో, ఇంకో రోజు మళ్ళీ రా.'],
      ['Clouds are grey, the sky is dark, / We cannot play out in the ___.', 'park', 'dark', ['field', 'garden', 'school'], 'మేఘాలు బూడిద రంగు, ఆకాశం చీకటి, పార్కులో ఆడలేం.'],
      ['Drip, drop, drip, drop, / When will this rain ever ___?', 'stop', 'drop', ['end', 'go', 'finish'], 'టప్ టప్ టప్, ఈ వాన ఎప్పుడు ఆగుతుంది?'],
      ['Little frog, sitting in the rain, / Croak, croak, croak — sing it once ___!', 'again', 'rain', ['more', 'now', 'today'], 'వానలో కూర్చున్న చిన్న కప్పా, బెక బెక — మళ్ళీ పాడు!'],
      ['The rain has gone, the sun is out, / Let\'s go and play and run ___!', 'about', 'out', ['fast', 'home', 'away'], 'వాన పోయింది, ఎండ వచ్చింది, ఆడుకుందాం, పరిగెత్తుదాం!'],
      ['My paper boat goes sailing by, / Under the big and cloudy ___.', 'sky', 'by', ['tree', 'roof', 'bridge'], 'నా కాగితపు పడవ తేలుతూ వెళ్తోంది, మేఘాల ఆకాశం కింద.'],
    ]),
    rhymeQ('fam', FAMS),
  ]),
  obj('ts2.en.ch5.weather', ['What is the weather like?', 'వాతావరణం ఎలా ఉంది?'], [
    p('We can say what the weather is like with "It is …". It is sunny ☀️. It is rainy 🌧️. It is cloudy ☁️. It is windy 🌬️. It is hot. It is cold.', '"It is …" తో వాతావరణం చెప్పవచ్చు. It is sunny ☀️ (ఎండగా ఉంది). It is rainy 🌧️ (వాన పడుతోంది). It is cloudy ☁️ (మబ్బుగా ఉంది). It is windy 🌬️ (గాలి వీస్తోంది). It is hot (వేడిగా). It is cold (చల్లగా).'),
    photo('☀️', L('It is sunny today.', 'ఈ రోజు ఎండగా ఉంది.')),
    keys('sunny ☀️ · rainy 🌧️ · cloudy ☁️ · windy 🌬️'),
    tip('Every morning, look out of the window and say: "Today it is …"', 'ప్రతి ఉదయం కిటికీలోంచి చూసి "Today it is …" అని చెప్పు.'),
  ], [
    exb(['☀️ What is the weather like?', '☀️ వాతావరణం ఎలా ఉంది?'], [['The sun is shining.', 'సూర్యుడు ప్రకాశిస్తున్నాడు.']], ['It is sunny.', 'It is sunny. (ఎండగా ఉంది.)']),
    exb(['On a rainy day, what should you take?', 'వాన రోజు ఏమి తీసుకెళ్ళాలి?'], [['It keeps you dry.', 'అది నిన్ను తడవకుండా ఉంచుతుంది.']], ['an umbrella', 'గొడుగు (umbrella)']),
  ], [
    fill('fill', ['Look at the picture in the sentence.', 'వాక్యంలోని బొమ్మను చూడు.'], [
      ['☀️ It is ___.', 'sunny', ['rainy', 'windy', 'cloudy'], 'The sun is shining → sunny.', 'సూర్యుడు ప్రకాశిస్తున్నాడు → sunny.'],
      ['🌧️ It is ___.', 'rainy', ['sunny', 'windy', 'hot'], 'Rain is falling → rainy.', 'వాన పడుతోంది → rainy.'],
      ['☁️ It is ___.', 'cloudy', ['sunny', 'rainy', 'windy'], 'Clouds cover the sky → cloudy.', 'ఆకాశం మేఘాలతో నిండింది → cloudy.'],
      ['🌬️ It is ___.', 'windy', ['sunny', 'rainy', 'cloudy'], 'The wind is blowing → windy.', 'గాలి వీస్తోంది → windy.'],
      ['🌧️ Take your ___.', 'umbrella', ['kite', 'ball', 'cap'], 'An umbrella keeps you dry in the rain.', 'గొడుగు వానలో తడవకుండా కాపాడుతుంది.'],
      ['🌬️ A good day to fly a ___.', 'kite', ['boat', 'book', 'bell'], 'Kites fly on windy days.', 'గాలి ఉన్న రోజు గాలిపటం ఎగురుతుంది.'],
    ]),
    tapT('tap', ['Tap the things we use on a rainy day', 'వాన రోజు వాడే వాటిని నొక్కు'], [
      ['umbrella', true], ['raincoat', true], ['paper boat', true], ['gumboots', true],
      ['sunglasses', false], ['kite', false], ['fan', false],
    ], ['On rainy days we use umbrellas, raincoats and gumboots.', 'వాన రోజుల్లో గొడుగు, రెయిన్‌కోట్, బూట్లు వాడతాం.']),
  ]),
]);

// ================================================================ 6. Here Is Your Coin!
const u6 = unit(6, ['Unit 6 · Here Is Your Coin!', 'యూనిట్ 6 · ఇదిగో నీ నాణెం!'], [
  obj('ts2.en.ch6.story', ['Being honest', 'నిజాయితీగా ఉండటం'], [
    p('This unit is about honesty — giving back what is not ours. Here is our own short story. Ravi and his friends were playing cricket. The ball went into the bushes. When Ravi looked for it, he found a shiny coin! An old man was looking at the ground nearby. "Did you lose something, Grandpa?" asked Ravi. "Yes, my coin," said the old man. "Here is your coin!" said Ravi. The old man smiled. "Thank you. You are an honest boy."', 'ఈ పాఠం నిజాయితీ గురించి — మనది కానిదాన్ని తిరిగి ఇవ్వడం. ఇది మన స్వంత కథ. రవి, స్నేహితులు క్రికెట్ ఆడుతున్నారు. బంతి పొదల్లో పడింది. వెతుకుతుంటే రవికి మెరిసే నాణెం దొరికింది! దగ్గర్లో ఒక తాతగారు నేల మీద వెతుకుతున్నారు. "తాతగారూ, ఏమైనా పోగొట్టుకున్నారా?" అని రవి అడిగాడు. "అవును, నా నాణెం" అన్నారు. "ఇదిగో మీ నాణెం!" అన్నాడు రవి. తాతగారు నవ్వారు. "ధన్యవాదాలు. నువ్వు నిజాయితీ గల అబ్బాయివి."'),
    photo('🪙', L('A shiny coin.', 'మెరిసే నాణెం.')),
    keys('honest = telling the truth and giving back what is not yours', 'Found something? Give it back or tell a grown-up.'),
    tip('Act it out: one friend is Ravi, one is the old man.', 'నటించు: ఒక స్నేహితుడు రవి, ఒకరు తాతగారు.'),
  ], [
    exb(['What did Ravi find?', 'రవికి ఏమి దొరికింది?'], [['It was shiny, in the bushes.', 'పొదల్లో మెరుస్తూ ఉంది.']], ['a coin', 'ఒక నాణెం (coin)']),
    exb(['Why did the old man call Ravi honest?', 'తాతగారు రవిని నిజాయితీపరుడు అని ఎందుకు అన్నారు?'], [['Ravi did not keep the coin.', 'రవి నాణెం ఉంచుకోలేదు.'], ['He gave it back.', 'తిరిగి ఇచ్చేశాడు.']], ['Because he gave the coin back.', 'నాణెం తిరిగి ఇచ్చినందుకు.']),
  ], [
    mcq('read', ['Remember Ravi and the coin.', 'రవి, నాణెం కథ గుర్తు చేసుకో.'], [
      ['What game were the children playing?', 'పిల్లలు ఏ ఆట ఆడుతున్నారు?', 'cricket', ['football', 'hide and seek', 'kabaddi'], 'They were playing cricket.', 'వాళ్ళు క్రికెట్ ఆడుతున్నారు.'],
      ['Where did the ball go?', 'బంతి ఎక్కడ పడింది?', 'into the bushes', ['into the river', 'on the roof', 'into a bag'], 'The ball went into the bushes.', 'బంతి పొదల్లో పడింది.'],
      ['Whose coin was it?', 'ఆ నాణెం ఎవరిది?', 'the old man\'s', ['Ravi\'s', 'the teacher\'s', 'a dog\'s'], 'The old man had lost it.', 'తాతగారు పోగొట్టుకున్నారు.'],
      ['What did Ravi say?', 'రవి ఏమన్నాడు?', 'Here is your coin!', ['This is mine!', 'Go away!', 'I found nothing.'], 'He gave the coin back.', 'నాణెం తిరిగి ఇచ్చాడు.'],
      ['What kind of boy is Ravi?', 'రవి ఎలాంటి అబ్బాయి?', 'honest', ['lazy', 'rude', 'greedy'], 'He gave back what was not his.', 'తనది కానిది తిరిగి ఇచ్చాడు.'],
      ['If you find a lost pencil at school, you should:', 'బడిలో పోయిన పెన్సిల్ దొరికితే నువ్వు:', 'give it to the teacher', ['keep it', 'throw it', 'hide it'], 'Give it back so the owner can get it.', 'యజమానికి చేరేలా టీచర్‌కు ఇవ్వాలి.'],
    ]),
    tapT('tap', ['Tap the honest actions', 'నిజాయితీ పనులను నొక్కు'], [
      ['giving back a lost coin', true], ['telling the truth', true], ['saying sorry for a mistake', true], ['returning a friend\'s pencil', true],
      ['keeping a lost purse', false], ['telling a lie', false], ['taking a friend\'s toy', false],
    ], ['Honest children tell the truth and give back what is not theirs.', 'నిజాయితీ గల పిల్లలు నిజం చెబుతారు, తమది కానిది తిరిగి ఇస్తారు.']),
  ]),
  obj('ts2.en.ch6.polite', ['Magic words: please, thank you, sorry', 'మ్యాజిక్ పదాలు: please, thank you, sorry'], [
    p('Some words are like magic — they make people happy! "Please" when we ask. "Thank you" when someone helps or gives. "Sorry" when we make a mistake. "Here you are" or "Here is your …" when we give something.', 'కొన్ని పదాలు మ్యాజిక్ లాంటివి — అవి అందరినీ సంతోషపెడతాయి! అడిగేటప్పుడు "Please". ఎవరైనా సహాయం చేస్తే "Thank you". తప్పు చేస్తే "Sorry". ఏదైనా ఇచ్చేటప్పుడు "Here you are" లేదా "Here is your …".'),
    photo('🙏', L('Thank you!', 'ధన్యవాదాలు!')),
    keys('Please · Thank you · Sorry · Here you are · Excuse me'),
    tip('Use one magic word at home today and see the smiles!', 'ఈ రోజు ఇంట్లో ఒక మ్యాజిక్ పదం వాడి నవ్వులు చూడు!'),
  ], [
    exb(['Your friend gives you a sweet. You say:', 'స్నేహితుడు నీకు మిఠాయి ఇచ్చాడు. నువ్వు అంటావు:'], [['Someone was kind to you.', 'ఎవరో నీ పట్ల దయ చూపారు.']], ['Thank you!', 'Thank you! (ధన్యవాదాలు!)']),
    exb(['You step on your friend\'s foot. You say:', 'స్నేహితుడి కాలు తొక్కావు. నువ్వు అంటావు:'], [['It was a mistake.', 'అది పొరపాటు.']], ['Sorry!', 'Sorry! (క్షమించు!)']),
  ], [
    mcq('say', ['please = asking · thank you = getting · sorry = a mistake', 'please = అడగడం · thank you = పొందడం · sorry = పొరపాటు'], [
      ['You want a pencil from your friend. You say:', 'స్నేహితుడి నుండి పెన్సిల్ కావాలి. నువ్వు అంటావు:', 'Please give me a pencil.', ['Give pencil!', 'Sorry.', 'Goodbye.'], '"Please" makes asking polite.', '"Please" అడగడాన్ని మర్యాదగా చేస్తుంది.'],
      ['Grandma gives you a gift. You say:', 'నానమ్మ నీకు బహుమతి ఇచ్చింది. నువ్వు అంటావు:', 'Thank you, Grandma!', ['Sorry, Grandma!', 'Go away!', 'Please!'], 'Say thank you for a gift.', 'బహుమతికి థాంక్యూ చెప్పాలి.'],
      ['You break your sister\'s crayon. You say:', 'చెల్లి క్రేయాన్ విరగ్గొట్టావు. నువ్వు అంటావు:', 'Sorry!', ['Thank you!', 'Hurray!', 'Good morning!'], 'Say sorry for a mistake.', 'పొరపాటుకు సారీ చెప్పాలి.'],
      ['You give back a lost coin. You say:', 'పోయిన నాణెం తిరిగి ఇస్తున్నావు. నువ్వు అంటావు:', 'Here is your coin.', ['Give me money.', 'Sorry.', 'Good night.'], 'We say "Here is your…" when we give something back.', 'తిరిగి ఇచ్చేటప్పుడు "Here is your…" అంటాం.'],
      ['Teacher helps you tie your shoe. You say:', 'టీచర్ నీ బూటు లేసు కట్టారు. నువ్వు అంటావు:', 'Thank you, teacher!', ['Sorry, teacher!', 'Please, teacher!', 'Bye!'], 'Someone helped you — say thank you.', 'సహాయానికి థాంక్యూ చెప్పాలి.'],
      ['You want to go past people in a line. You say:', 'వరుసలో ఉన్నవారి పక్కనుంచి వెళ్ళాలి. నువ్వు అంటావు:', 'Excuse me.', ['Thank you.', 'Move!', 'Well done.'], '"Excuse me" asks politely.', '"Excuse me" మర్యాదగా అడుగుతుంది.'],
    ]),
    matchT('match', ['Match the time to the magic word', 'సందర్భాన్ని మ్యాజిక్ పదంతో జత చేయి'], ['What would a kind child say?', 'మంచి పిల్లలు ఏమంటారు?'], [
      ['when you ask', 'Please'], ['when you get help', 'Thank you'], ['when you make a mistake', 'Sorry'], ['when you give something', 'Here you are'], ['when you want to pass', 'Excuse me'],
    ]),
  ]),
  obj('ts2.en.ch6.numbers', ['Number words: one to ten', 'సంఖ్య పదాలు: one నుండి ten'], [
    p('Let\'s count coins in English! one, two, three, four, five, six, seven, eight, nine, ten. Here is a counting chant: "One, two, find a shoe; three, four, shut the door; five, six, pick up sticks!" (an old public-domain rhyme).', 'ఇంగ్లీష్‌లో నాణేలు లెక్కిద్దాం! one (1), two (2), three (3), four (4), five (5), six (6), seven (7), eight (8), nine (9), ten (10). లెక్కింపు పాట: "One, two, find a shoe; three, four, shut the door; five, six, pick up sticks!" (పాత జానపద పాట).'),
    photo('🔢', L('1, 2, 3 … 10', '1, 2, 3 … 10')),
    keys('1 one · 2 two · 3 three · 4 four · 5 five', '6 six · 7 seven · 8 eight · 9 nine · 10 ten'),
    tip('Count things around you in English: fingers, chairs, windows.', 'నీ చుట్టూ ఉన్నవి ఇంగ్లీష్‌లో లెక్కించు: వేళ్ళు, కుర్చీలు, కిటికీలు.'),
  ], [
    exb(['How many? 🪙 🪙 🪙', 'ఎన్ని? 🪙 🪙 🪙'], [['Count: one, two, three.', 'లెక్కించు: one, two, three.']], ['three', 'three (మూడు)']),
    exb(['Which number word comes after "seven"?', '"seven" తర్వాత ఏ సంఖ్య పదం?'], [['six, seven, …', 'six, seven, …']], ['eight', 'eight (ఎనిమిది)']),
  ], [
    countWords('count', ['🪙', '⚽', '🍎', '⭐', '🎈']),
    matchT('match', ['Match the number to its word', 'అంకెను దాని పదంతో జత చేయి'], ['Count on your fingers.', 'వేళ్ళ మీద లెక్కించు.'], [
      ['1', 'one'], ['2', 'two'], ['3', 'three'], ['4', 'four'], ['5', 'five'], ['6', 'six'], ['7', 'seven'], ['8', 'eight'], ['9', 'nine'], ['10', 'ten'],
    ]),
  ]),
], 'Unit 6: our own coin story is used; the Reader\'s story is not summarised.');

// ================================================================ 7. What's My Name?
const u7 = unit(7, ['Unit 7 · What\'s My Name?', 'యూనిట్ 7 · నా పేరేమిటి?'], [
  obj('ts2.en.ch7.story', ['The fly who forgot her name', 'పేరు మరచిపోయిన ఈగ'], [
    p('In this unit, a little fly forgets her name! Here is our own short version. A little fly woke up one morning. "Oh no! What\'s my name?" she said. She asked the flower, "Do you know my name?" "No," said the flower. She asked the butterfly. "No," said the butterfly. Then she asked a little girl. The girl laughed and said, "You are a fly! Your name is Fly!" "Yes! I am Fly!" said the fly happily, and she flew away singing.', 'ఈ పాఠంలో ఒక చిన్న ఈగ తన పేరు మరచిపోతుంది! ఇది మన స్వంత చిన్న కథ. ఒక ఉదయం చిన్న ఈగ లేచింది. "అయ్యో! నా పేరేమిటి?" అంది. పువ్వును అడిగింది, "నా పేరు తెలుసా?" "తెలియదు" అంది పువ్వు. సీతాకోకచిలుకను అడిగింది. "తెలియదు" అంది. తర్వాత ఒక చిన్న అమ్మాయిని అడిగింది. అమ్మాయి నవ్వి "నువ్వు ఈగవి! నీ పేరు Fly!" అంది. "అవును! నేను Fly!" అని ఈగ సంతోషంగా పాడుతూ ఎగిరిపోయింది.'),
    photo('🌼', L('The fly asked the flower first.', 'ఈగ ముందుగా పువ్వును అడిగింది.')),
    keys('What\'s my name? = What is my name?', 'Everyone has a name. Your name is special!'),
    tip('Ask three friends: "What\'s your name?" They answer: "My name is …"', 'ముగ్గురు స్నేహితులను "What\'s your name?" అని అడుగు. వాళ్ళు "My name is …" అని చెబుతారు.'),
  ], [
    exb(['What did the fly forget?', 'ఈగ ఏమి మరచిపోయింది?'], [['Look at the unit title.', 'పాఠం పేరు చూడు.']], ['her name', 'తన పేరు']),
    exb(['Who told the fly her name?', 'ఈగకు ఆమె పేరు ఎవరు చెప్పారు?'], [['Not the flower, not the butterfly…', 'పువ్వు కాదు, సీతాకోకచిలుక కాదు…']], ['a little girl', 'ఒక చిన్న అమ్మాయి']),
  ], [
    mcq('read', ['Remember the little fly.', 'చిన్న ఈగను గుర్తు చేసుకో.'], [
      ['What did the fly forget?', 'ఈగ ఏమి మరచిపోయింది?', 'her name', ['her home', 'her food', 'her wings'], 'She asked, "What\'s my name?"', '"నా పేరేమిటి?" అని అడిగింది.'],
      ['Whom did the fly ask first?', 'ఈగ ముందు ఎవరిని అడిగింది?', 'the flower', ['the girl', 'the cow', 'the sun'], 'She asked the flower first.', 'ముందు పువ్వును అడిగింది.'],
      ['What did the butterfly say?', 'సీతాకోకచిలుక ఏమంది?', 'No.', ['Yes, you are Bee.', 'Go away.', 'Good night.'], 'The butterfly did not know.', 'సీతాకోకచిలుకకు తెలియదు.'],
      ['Who knew the fly\'s name?', 'ఈగ పేరు ఎవరికి తెలుసు?', 'a little girl', ['the flower', 'the butterfly', 'nobody'], 'The girl said, "Your name is Fly!"', '"నీ పేరు Fly!" అని అమ్మాయి చెప్పింది.'],
      ['How did the fly feel at the end?', 'చివర్లో ఈగ ఎలా ఉంది?', 'happy', ['sad', 'angry', 'sleepy'], 'She flew away singing.', 'పాడుతూ ఎగిరిపోయింది.'],
    ]),
    orderT('seq', ['Put the story in order', 'కథను వరుసలో పెట్టు'], ['First the fly woke up.', 'ముందు ఈగ లేచింది.'], [
      ['The fly woke up.', 'She forgot her name.', 'She asked the flower.'],
      ['She asked the flower.', 'She asked the butterfly.', 'She asked a girl.'],
      ['The girl laughed.', 'She said, "Your name is Fly!"', 'The fly flew away singing.'],
      ['The fly forgot her name.', 'Nobody knew it.', 'A girl told her.', 'She was happy.'],
      ['The fly woke up.', 'She asked her friends.', 'She found her name.'],
    ], ' → '),
  ]),
  obj('ts2.en.ch7.garden', ['In the garden: flowers and small creatures', 'తోటలో: పువ్వులు, చిన్న జీవులు'], [
    p('The fly lives in a garden full of life! In a garden we see flowers, plants, leaves, trees, butterflies, ants and ladybirds. Birds build nests in the trees.', 'ఈగ జీవులతో నిండిన తోటలో ఉంటుంది! తోటలో పువ్వులు, మొక్కలు, ఆకులు, చెట్లు, సీతాకోకచిలుకలు, చీమలు, ఆరుద్ర పురుగులు కనిపిస్తాయి. పక్షులు చెట్లపై గూళ్ళు కట్టుకుంటాయి.'),
    photo('🦋', L('A butterfly sits on a flower.', 'సీతాకోకచిలుక పువ్వు మీద కూర్చుంది.')),
    keys('flower · plant · leaf · tree · nest', 'butterfly · ant · ladybird · squirrel'),
    tip('Water a plant at home or school, and watch who visits it!', 'ఇంట్లో లేదా బడిలో ఒక మొక్కకు నీళ్ళు పోసి, దాని దగ్గరికి ఎవరు వస్తారో చూడు!'),
  ], [
    exb(['Which garden creature has colourful wings?', 'రంగురంగుల రెక్కలు ఉన్న తోట జీవి ఏది?'], [['It sits on flowers. 🦋', 'పువ్వుల మీద కూర్చుంటుంది. 🦋']], ['butterfly', 'butterfly (సీతాకోకచిలుక)']),
    exb(['Where does a bird live?', 'పక్షి ఎక్కడ ఉంటుంది?'], [['🪺 It is made of twigs.', '🪺 పుల్లలతో చేసినది.']], ['in a nest', 'గూడులో (nest)']),
  ], [picWord('pic', GARDEN), meaning('mean', GARDEN), missing('spell', GARDEN.filter((w) => w[1].length <= 6), 2)]),
  obj('ts2.en.ch7.myname', ['What\'s your name? My name is …', 'నీ పేరేమిటి? నా పేరు …'], [
    p('When we meet someone new we ask, "What\'s your name?" and answer, "My name is Kavya." Names always begin with a capital letter: Kavya, Ravi, Sita.', 'కొత్తవారిని కలిసినప్పుడు "What\'s your name?" అని అడిగి, "My name is Kavya." అని జవాబిస్తాం. పేర్లు ఎప్పుడూ పెద్ద అక్షరంతో మొదలవుతాయి: Kavya, Ravi, Sita.'),
    photo('👧', L('"Hello! My name is Kavya."', '"హలో! నా పేరు కావ్య."')),
    keys('What\'s your name?', 'My name is ….', 'How are you? — I am fine, thank you.', 'Names start with a CAPITAL letter.'),
    tip('Write your name in English. Did you start with a capital letter?', 'నీ పేరును ఇంగ్లీష్‌లో రాయి. పెద్ద అక్షరంతో మొదలుపెట్టావా?'),
  ], [
    exb(['Answer: "What\'s your name?" (You are Teja.)', 'జవాబు చెప్పు: "What\'s your name?" (నువ్వు తేజ.)'], [['Start with "My name is".', '"My name is" తో మొదలుపెట్టు.']], ['My name is Teja.', 'My name is Teja. (నా పేరు తేజ.)']),
    exb(['Which is right: "ravi" or "Ravi"?', 'ఏది సరైనది: "ravi" లేదా "Ravi"?'], [['Names begin with a capital letter.', 'పేర్లు పెద్ద అక్షరంతో మొదలవుతాయి.']], ['Ravi', 'Ravi']),
  ], [
    orderT('build', ['Put the words in order', 'పదాలను వరుసలో పెట్టు'], ['Start with the word that has a capital letter.', 'పెద్ద అక్షరం ఉన్న పదంతో మొదలుపెట్టు.'], [
      ['My', 'name', 'is', 'Kavya.'], ['What', 'is', 'your', 'name?'], ['My', 'name', 'is', 'Arjun.'], ['I', 'am', 'fine.'], ['How', 'are', 'you?'], ['Your', 'name', 'is', 'Fly.'],
    ]),
    mcq('cap', ['Names begin with a capital (big) letter.', 'పేర్లు పెద్ద అక్షరంతో మొదలవుతాయి.'], [
      ['Which word is a name and needs a capital letter?', 'ఏ పదం ఒక పేరు, దానికి పెద్ద అక్షరం కావాలి?', 'sita', ['pencil', 'tree', 'dog'], 'Sita is a girl\'s name, so we write Sita.', 'సీత ఒక అమ్మాయి పేరు, కాబట్టి Sita అని రాస్తాం.'],
      ['Which word is a name and needs a capital letter?', 'ఏ పదం ఒక పేరు, దానికి పెద్ద అక్షరం కావాలి?', 'kiran', ['book', 'cat', 'rain'], 'Kiran is a boy\'s name, so we write Kiran.', 'కిరణ్ ఒక అబ్బాయి పేరు, కాబట్టి Kiran అని రాస్తాం.'],
      ['Which word is a name and needs a capital letter?', 'ఏ పదం ఒక పేరు, దానికి పెద్ద అక్షరం కావాలి?', 'meena', ['flower', 'bag', 'bus'], 'Meena is a girl\'s name, so we write Meena.', 'మీనా ఒక అమ్మాయి పేరు, కాబట్టి Meena అని రాస్తాం.'],
      ['What needs fixing? "my name is Ravi."', 'ఏమి సరిచేయాలి? "my name is Ravi."', 'The first letter should be a capital.', ['The end mark should be ?', 'Nothing — it is correct.'], 'A sentence begins with a capital letter: My name is Ravi.', 'వాక్యం పెద్ద అక్షరంతో మొదలవ్వాలి: My name is Ravi.'],
      ['What needs fixing? "What is your name."', 'ఏమి సరిచేయాలి? "What is your name."', 'The end mark should be ?', ['The first letter should be a capital.', 'Nothing — it is correct.'], 'It asks a question, so it ends with ?', 'ఇది ప్రశ్న, కాబట్టి ? తో ముగియాలి.'],
      ['What needs fixing? "My name is Kavya."', 'ఏమి సరిచేయాలి? "My name is Kavya."', 'Nothing — it is correct.', ['The first letter should be a capital.', 'The end mark should be ?'], 'Capital M, capital K for the name, full stop — well done!', 'పెద్ద M, పేరుకు పెద్ద K, ఫుల్ స్టాప్ — భేష్!'],
    ]),
  ]),
], 'Unit 7: our own short version of the fly story is used; the Reader\'s text is not reproduced.');

// ================================================================ 8. Together We Pull
const u8 = unit(8, ['Unit 8 · Together We Pull', 'యూనిట్ 8 · అందరం కలిసి లాగుదాం'], [
  obj('ts2.en.ch8.story', ['The giant carrot', 'పెద్ద క్యారెట్'], [
    p('This unit is like the old folk tale "The Enormous Turnip". Here it is in our own words, with a carrot. Grandpa grew a giant carrot. He pulled and pulled, but it did not come out. Grandma came to help. They pulled and pulled. Then the girl, the dog, the cat and at last a tiny mouse came. "One, two, three — PULL!" Out came the giant carrot! Everyone shared carrot halwa.', 'ఈ పాఠం "పెద్ద టర్నిప్" అనే పాత జానపద కథ లాంటిది. మన మాటల్లో, క్యారెట్‌తో: తాతయ్య ఒక పెద్ద క్యారెట్ పెంచాడు. లాగాడు లాగాడు, కానీ రాలేదు. నానమ్మ సహాయానికి వచ్చింది. లాగారు లాగారు. తర్వాత అమ్మాయి, కుక్క, పిల్లి, చివరికి చిన్న ఎలుక వచ్చాయి. "ఒకటి, రెండు, మూడు — లాగు!" పెద్ద క్యారెట్ బయటకు వచ్చింది! అందరూ క్యారెట్ హల్వా పంచుకున్నారు.'),
    photo('🥕', L('A giant carrot!', 'పెద్ద క్యారెట్!')),
    keys('Grandpa → Grandma → girl → dog → cat → mouse', 'Lesson: together we are strong. Even the smallest helper matters!'),
    tip('Act it out in a line and shout "One, two, three — PULL!"', 'వరుసలో నిలబడి నటిస్తూ "One, two, three — PULL!" అని అరవండి.'),
  ], [
    exb(['Who came last to help?', 'చివరగా సహాయానికి ఎవరు వచ్చారు?'], [['The smallest helper.', 'అందరికంటే చిన్న సహాయకుడు.']], ['a tiny mouse', 'చిన్న ఎలుక']),
    exb(['Why did the carrot come out at last?', 'చివరికి క్యారెట్ ఎందుకు బయటకు వచ్చింది?'], [['Everyone pulled together.', 'అందరూ కలిసి లాగారు.']], ['Because they all pulled together.', 'అందరూ కలిసి లాగారు కాబట్టి.']),
  ], [
    orderT('seq', ['Who came to pull? Put them in order', 'లాగడానికి ఎవరెవరు వచ్చారు? వరుసలో పెట్టు'], ['Grandpa was first. The mouse was last.', 'తాతయ్య మొదట. ఎలుక చివర.'], [
      ['Grandpa', 'Grandma', 'the girl', 'the dog'], ['the girl', 'the dog', 'the cat', 'the mouse'], ['Grandpa', 'Grandma', 'the girl'],
      ['the dog', 'the cat', 'the mouse'], ['Grandma', 'the girl', 'the dog', 'the cat'],
    ], ' → '),
    mcq('read', ['Remember the giant carrot.', 'పెద్ద క్యారెట్ కథ గుర్తు చేసుకో.'], [
      ['Who grew the giant carrot?', 'పెద్ద క్యారెట్ ఎవరు పెంచారు?', 'Grandpa', ['the mouse', 'the dog', 'the teacher'], 'Grandpa grew it.', 'తాతయ్య పెంచాడు.'],
      ['Could Grandpa pull it out alone?', 'తాతయ్య ఒక్కడే లాగగలిగాడా?', 'No', ['Yes', 'Yes, easily', 'He did not try'], 'It did not come out.', 'అది బయటకు రాలేదు.'],
      ['Who helped Grandpa first?', 'తాతయ్యకు ముందు ఎవరు సహాయం చేశారు?', 'Grandma', ['the mouse', 'the cat', 'a lion'], 'Grandma came first.', 'నానమ్మ ముందు వచ్చింది.'],
      ['Who was the smallest helper?', 'అందరికంటే చిన్న సహాయకుడు ఎవరు?', 'the mouse', ['the dog', 'Grandpa', 'the girl'], 'The tiny mouse came last.', 'చిన్న ఎలుక చివరగా వచ్చింది.'],
      ['What did everyone do at the end?', 'చివర్లో అందరూ ఏమి చేశారు?', 'shared carrot halwa', ['went to sleep', 'ran away', 'cried'], 'They shared the food.', 'ఆహారం పంచుకున్నారు.'],
      ['What does the story teach?', 'కథ ఏమి నేర్పుతుంది?', 'Together we are strong.', ['Carrots are small.', 'Never help.', 'Mice are lazy.'], 'Working together helps.', 'కలిసి పనిచేస్తే విజయం.'],
    ]),
  ]),
  obj('ts2.en.ch8.help', ['Helping and sharing', 'సహాయం, పంచుకోవడం'], [
    p('When we help each other and share, everyone is happy. We can help at home: put toys away, water the plants, set the plates. We can share at school: share crayons, share our lunch, take turns on the swing.', 'ఒకరికొకరు సహాయం చేసుకుని పంచుకుంటే అందరూ సంతోషంగా ఉంటారు. ఇంట్లో: బొమ్మలు సర్దడం, మొక్కలకు నీళ్ళు, పళ్ళాలు పెట్టడం. బడిలో: క్రేయాన్లు పంచుకోవడం, భోజనం పంచుకోవడం, ఉయ్యాలపై వంతులవారీగా ఆడటం.'),
    photo('👐', L('Sharing is caring.', 'పంచుకోవడమే ప్రేమ.')),
    keys('Can I help you?', 'Let\'s share!', 'Your turn, then my turn.'),
    tip('Today, help someone at home and tell your class what you did.', 'ఈ రోజు ఇంట్లో ఎవరికైనా సహాయం చేసి తరగతిలో చెప్పు.'),
  ], [
    exb(['Your friend has no crayon. What can you say?', 'నీ స్నేహితుడి దగ్గర క్రేయాన్ లేదు. ఏమంటావు?'], [['You can share yours.', 'నీది పంచుకోవచ్చు.']], ['Let\'s share my crayons!', 'Let\'s share my crayons! (నా క్రేయాన్లు పంచుకుందాం!)']),
    exb(['Grandma is carrying a heavy bag. What can you say?', 'నానమ్మ బరువైన సంచి మోస్తోంది. ఏమంటావు?'], [['Offer to help.', 'సహాయం చేస్తానని అడుగు.']], ['Can I help you, Grandma?', 'Can I help you, Grandma? (సహాయం చేయనా, నానమ్మా?)']),
  ], [
    tapT('tap', ['Tap the helping and sharing actions', 'సహాయం, పంచుకోవడం పనులను నొక్కు'], [
      ['sharing crayons', true], ['watering the plants', true], ['putting toys away', true], ['taking turns', true], ['helping Grandma', true],
      ['grabbing a toy', false], ['pushing in the line', false], ['eating all the sweets alone', false],
    ], ['Helpers share, take turns and do small jobs.', 'సహాయకులు పంచుకుంటారు, వంతులు పాటిస్తారు, చిన్న పనులు చేస్తారు.']),
    mcq('say', ['What would a kind helper say?', 'దయగల సహాయకుడు ఏమంటాడు?'], [
      ['Your friend fell down. You say:', 'నీ స్నేహితుడు కింద పడ్డాడు. నువ్వు అంటావు:', 'Are you okay? Let me help.', ['Ha ha!', 'Go away.', 'Not my problem.'], 'Help a friend who is hurt.', 'దెబ్బ తగిలిన స్నేహితుడికి సహాయం చేయాలి.'],
      ['There is one swing and two children. You say:', 'ఒకే ఉయ్యాల, ఇద్దరు పిల్లలు. నువ్వు అంటావు:', 'Your turn, then my turn.', ['It is only mine!', 'Go home.', 'I will never share.'], 'Taking turns is fair.', 'వంతులవారీగా ఆడటం న్యాయం.'],
      ['Mother is cooking. You say:', 'అమ్మ వంట చేస్తోంది. నువ్వు అంటావు:', 'Can I help you, Amma?', ['Give me food now!', 'I am busy.', 'Go away.'], 'Offer to help at home.', 'ఇంట్లో సహాయం చేస్తానని అడగాలి.'],
      ['You have two bananas. Your friend has none. You say:', 'నీ దగ్గర రెండు అరటిపండ్లు, స్నేహితుడి దగ్గర లేవు. నువ్వు అంటావు:', 'Here, have one!', ['Both are mine!', 'Buy your own.', 'No.'], 'Sharing makes friends happy.', 'పంచుకుంటే స్నేహితులు సంతోషిస్తారు.'],
      ['Everyone is pulling the carrot. You say:', 'అందరూ క్యారెట్ లాగుతున్నారు. నువ్వు అంటావు:', 'I will pull too!', ['I will sleep.', 'Not I!', 'I will watch TV.'], 'Join in and help.', 'కలిసి సహాయం చేయి.'],
    ]),
  ]),
  obj('ts2.en.ch8.many', ['One and many', 'ఒకటి, చాలా'], [
    p('One carrot, two carrots! When there is more than one, we usually add "s" to the naming word: one dog → two dogs, one cat → three cats. Some words add "es": one box → two boxes.', 'ఒక క్యారెట్, రెండు క్యారెట్లు! ఒకటి కంటే ఎక్కువ ఉంటే సాధారణంగా పేరు పదానికి "s" చేరుస్తాం: one dog → two dogs, one cat → three cats. కొన్ని పదాలకు "es": one box → two boxes.'),
    photo('🍎', L('one apple → many apples', 'ఒక ఆపిల్ → చాలా ఆపిల్స్')),
    keys('one carrot → two carrots', 'one dog → three dogs', 'one box → two boxes', 'one bus → two buses'),
    tip('Listen for the "s" sound at the end: dogs, cats, carrots.', 'చివర "s" శబ్దం విను: dogs, cats, carrots.'),
  ], [
    exb(['One cat, two ___.', 'One cat, two ___.'], [['Add "s".', '"s" చేర్చు.']], ['cats', 'cats']),
    exb(['One box, two ___.', 'One box, two ___.'], [['box ends in x → add "es".', 'box చివర x → "es" చేర్చు.']], ['boxes', 'boxes']),
  ], [
    plural('many', [
      ['🥕', 'carrot', 'carrots', 'క్యారెట్'], ['🐶', 'dog', 'dogs', 'కుక్క'], ['🐱', 'cat', 'cats', 'పిల్లి'], ['🍎', 'apple', 'apples', 'ఆపిల్'],
      ['📦', 'box', 'boxes', 'పెట్టె'], ['🚌', 'bus', 'buses', 'బస్సు'], ['🎈', 'balloon', 'balloons', 'బెలూన్'], ['🐭', 'mouse', 'mice', 'ఎలుక'],
      ['⭐', 'star', 'stars', 'నక్షత్రం'], ['🪁', 'kite', 'kites', 'గాలిపటం'],
    ]),
    countWords('count', ['🥕', '🐭', '🐶', '🐱']),
  ]),
]);

export const units: USpec[] = [u1, u2, u3, u4, u5, u6, u7, u8];
