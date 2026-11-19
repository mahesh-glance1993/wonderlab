// Telangana SCERT Class 3 — English (English Reader, Class 3). Original teaching aligned to the official chapter list
// (src/content/ts/books.ts, syllabus.json). The Reader's stories and poems are never reproduced: each unit teaches ABOUT
// its theme with our own short stories and rhymes (plus public-domain folk tales such as The Lion and the Mouse and
// The Little Red Hen, retold in our own words), new words with pictures, phonics, and one simple grammar/sentence skill.
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
  id: `ts3.en.ch${n}`, subject: 'english', title: b(title), source: tsSrc(3, 'english', n), objectives, ...(note ? { note } : {}),
});
const obj = (id: string, title: B, intro: Block[], examples: ExSpec[], practice: TSpec[]): OSpec => ({ id, title: b(title), prereqs: [], intro, examples, practice });

// ---------------------------------------------------------------- shared word banks
const HOME: W[] = [
  ['🏠', 'house', 'ఇల్లు'], ['🚪', 'door', 'తలుపు'], ['🪟', 'window', 'కిటికీ'], ['🛏️', 'bed', 'మంచం'], ['🪑', 'chair', 'కుర్చీ'],
  ['⏰', 'clock', 'గడియారం'], ['☕', 'cup', 'కప్పు'], ['🪔', 'lamp', 'దీపం'], ['🌳', 'tree', 'చెట్టు'], ['⚽', 'ball', 'బంతి'],
];
const SOUNDS: W[] = [
  ['🍎', 'apple', 'ఆపిల్'], ['⚽', 'ball', 'బంతి'], ['🐱', 'cat', 'పిల్లి'], ['🐶', 'dog', 'కుక్క'], ['🥚', 'egg', 'గుడ్డు'],
  ['🐟', 'fish', 'చేప'], ['🐐', 'goat', 'మేక'], ['🏠', 'house', 'ఇల్లు'], ['🪁', 'kite', 'గాలిపటం'], ['🦁', 'lion', 'సింహం'],
  ['🥭', 'mango', 'మామిడి పండు'], ['🦉', 'owl', 'గుడ్లగూబ'], ['🦜', 'parrot', 'చిలుక'], ['🐇', 'rabbit', 'కుందేలు'], ['☀️', 'sun', 'సూర్యుడు'],
  ['🌳', 'tree', 'చెట్టు'], ['☂️', 'umbrella', 'గొడుగు'],
];
const VEHICLES: W[] = [
  ['🚆', 'train', 'రైలు'], ['🚌', 'bus', 'బస్సు'], ['🚗', 'car', 'కారు'], ['🚲', 'cycle', 'సైకిల్'], ['🚢', 'ship', 'ఓడ'],
  ['✈️', 'aeroplane', 'విమానం'], ['🛺', 'auto', 'ఆటో'], ['🚜', 'tractor', 'ట్రాక్టర్'], ['⛵', 'boat', 'పడవ'],
];
const VEG: W[] = [
  ['🥕', 'carrot', 'క్యారెట్'], ['🍅', 'tomato', 'టమాటా'], ['🍆', 'brinjal', 'వంకాయ'], ['🌽', 'corn', 'మొక్కజొన్న'], ['🥔', 'potato', 'బంగాళాదుంప'],
  ['🧅', 'onion', 'ఉల్లిపాయ'], ['🥒', 'cucumber', 'దోసకాయ'], ['🌶️', 'chilli', 'మిరపకాయ'],
];
const SCHOOL: W[] = [
  ['✏️', 'pencil', 'పెన్సిల్'], ['🖍️', 'crayon', 'రంగు కడ్డీ'], ['📕', 'book', 'పుస్తకం'], ['🎒', 'bag', 'బడి సంచి'], ['📏', 'ruler', 'స్కేలు'],
  ['🖊️', 'pen', 'పెన్ను'], ['🔔', 'bell', 'గంట'], ['🪑', 'chair', 'కుర్చీ'], ['🧑‍🏫', 'teacher', 'ఉపాధ్యాయులు'],
];
const ANIMALS: W[] = [
  ['🦁', 'lion', 'సింహం'], ['🐅', 'tiger', 'పులి'], ['🐘', 'elephant', 'ఏనుగు'], ['🐒', 'monkey', 'కోతి'], ['🦒', 'giraffe', 'జిరాఫీ'],
  ['🐻', 'bear', 'ఎలుగుబంటి'], ['🦌', 'deer', 'జింక'], ['🦚', 'peacock', 'నెమలి'], ['🐇', 'rabbit', 'కుందేలు'], ['🐟', 'fish', 'చేప'],
  ['🐸', 'frog', 'కప్ప'], ['🦉', 'owl', 'గుడ్లగూబ'], ['🦆', 'duck', 'బాతు'], ['🐢', 'tortoise', 'తాబేలు'], ['🐿️', 'squirrel', 'ఉడుత'],
];
const FAMS: Fam[] = [
  ['at', ['cat', 'hat', 'mat', 'bat', 'rat']], ['un', ['sun', 'fun', 'run', 'bun']], ['ake', ['cake', 'lake', 'make', 'bake']],
  ['ee', ['tree', 'bee', 'see', 'three']], ['all', ['ball', 'tall', 'wall', 'fall']], ['ain', ['rain', 'train', 'chain', 'plain']],
  ['ock', ['clock', 'rock', 'sock', 'lock']], ['ed', ['bed', 'red', 'fed', 'shed']], ['ig', ['pig', 'big', 'dig', 'wig']],
  ['en', ['hen', 'pen', 'ten', 'men']], ['og', ['dog', 'log', 'frog', 'fog']], ['oon', ['moon', 'spoon', 'soon', 'noon']],
];

// ================================================================ 0. Bridging: picture talk
const u0 = unit(0, ['Getting Ready: Picture Talk', 'సిద్ధం అవుదాం: బొమ్మలతో మాటలు'], [
  obj('ts3.en.ch0.words', ['Naming things around us', 'మన చుట్టూ ఉన్న వస్తువుల పేర్లు'], [
    p('Look around you. Everything has a name! In English we say: house, door, window, tree, ball. When you know the names, you can talk about anything you see.', 'నీ చుట్టూ చూడు. ప్రతి వస్తువుకు ఒక పేరు ఉంది! ఇంగ్లీష్‌లో: house (ఇల్లు), door (తలుపు), window (కిటికీ), tree (చెట్టు), ball (బంతి). పేర్లు తెలిస్తే నువ్వు చూసే ప్రతిదాని గురించి మాట్లాడగలవు.'),
    photo('🏠', L('A house — it has a door, windows and a roof.', 'ఇల్లు — దానికి తలుపు, కిటికీలు, పైకప్పు ఉంటాయి.')),
    keys('house · door · window · bed · chair', 'clock · cup · lamp · tree · ball'),
    tip('Play "I spy": say "I can see a door!" and point to it.', '"I spy" ఆట ఆడు: "I can see a door!" అని చెప్పి దాన్ని చూపించు.'),
  ], [
    exb(['Look at ⏰. What is it called in English?', '⏰ ను ఇంగ్లీష్‌లో ఏమంటారు?'], [['It tells the time.', 'ఇది సమయం చెబుతుంది.'], ['Its name is "clock".', 'దాని పేరు "clock".']], ['clock (గడియారం)', 'clock (గడియారం)']),
    exb(['Say a sentence about 🪑.', '🪑 గురించి ఒక వాక్యం చెప్పు.'], [['Name it: chair.', 'పేరు: chair.'], ['Use "This is a …".', '"This is a …" అని వాడు.']], ['This is a chair.', 'This is a chair. (ఇది ఒక కుర్చీ.)']),
  ], [picWord('pic', HOME), meaning('mean', HOME), missing('spell', HOME, 2)]),
  obj('ts3.en.ch0.abc', ['Letters and their sounds', 'అక్షరాలు, వాటి శబ్దాలు'], [
    p('English has 26 letters, from A to Z. Each letter makes a sound. "b" says /b/ as in ball. "m" says /m/ as in mango. Listening to the first sound of a word helps us read and spell it.', 'ఇంగ్లీష్‌లో A నుండి Z వరకు 26 అక్షరాలు ఉన్నాయి. ప్రతి అక్షరానికి ఒక శబ్దం ఉంటుంది. "b" శబ్దం /బ్/ — ball లో లాగా. "m" శబ్దం /మ్/ — mango లో లాగా. పదం మొదటి శబ్దం వింటే చదవడం, రాయడం సులువు.'),
    photo('🔤', L('A B C … the alphabet has 26 letters.', 'A B C … ఆంగ్ల వర్ణమాలలో 26 అక్షరాలు.')),
    keys('a – apple', 'b – ball', 'c – cat', 'd – dog', 'f – fish', 'm – mango', 's – sun'),
    tip('Clap and chant: "A for apple, B for ball, C for cat — we know them all!"', 'చప్పట్లు కొడుతూ పాడు: "A for apple, B for ball, C for cat — we know them all!"'),
  ], [
    exb(['What is the first sound in "fish"?', '"fish" లో మొదటి శబ్దం ఏది?'], [['Say it slowly: f-i-sh.', 'నెమ్మదిగా పలుకు: f-i-sh.'], ['The first sound is /f/.', 'మొదటి శబ్దం /ఫ్/.']], ['f', 'f']),
    exb(['Which letter comes after "c"?', '"c" తర్వాత ఏ అక్షరం వస్తుంది?'], [['Sing: a, b, c, …', 'పాడు: a, b, c, …'], ['Next is d.', 'తర్వాత d.']], ['d', 'd']),
  ], [
    firstSound('first', SOUNDS),
    orderT('abc', ['Put the letters in ABC order', 'అక్షరాలను ABC వరుసలో పెట్టు'], ['Sing the alphabet song softly to yourself.', 'అక్షరమాల పాటను మెల్లగా పాడుకో.'], [
      ['a', 'b', 'c', 'd'], ['d', 'e', 'f', 'g'], ['h', 'i', 'j', 'k'], ['l', 'm', 'n', 'o'], ['p', 'q', 'r', 's'], ['t', 'u', 'v', 'w'], ['w', 'x', 'y', 'z'],
    ], ', '),
    matchT('case', ['Match the capital letter to the small letter', 'పెద్ద అక్షరాన్ని చిన్న అక్షరంతో జత చేయి'], ['Big letter and small letter make the same sound.', 'పెద్ద అక్షరం, చిన్న అక్షరం ఒకే శబ్దం చేస్తాయి.'], [
      ['A', 'a'], ['B', 'b'], ['D', 'd'], ['E', 'e'], ['G', 'g'], ['H', 'h'], ['M', 'm'], ['N', 'n'], ['Q', 'q'], ['R', 'r'],
    ]),
  ]),
  obj('ts3.en.ch0.say', ['Talking in full sentences', 'పూర్తి వాక్యాలతో మాట్లాడటం'], [
    p('When we talk about a picture, we speak in full sentences. "This is a cat." "I can see a tree." "The ball is red." A sentence begins with a capital letter and ends with a full stop (.).', 'బొమ్మ గురించి మాట్లాడేటప్పుడు పూర్తి వాక్యాలు వాడతాం. "This is a cat." (ఇది ఒక పిల్లి.) "I can see a tree." (నాకు చెట్టు కనిపిస్తోంది.) వాక్యం పెద్ద అక్షరంతో మొదలై, ఫుల్ స్టాప్ (.) తో ముగుస్తుంది.'),
    photo('🗣️', L('Speak up! Say the whole sentence.', 'ధైర్యంగా పూర్తి వాక్యం చెప్పు!')),
    keys('This is a … .', 'I can see a … .', 'It is … (big / small / red).'),
    tip('Make three sentences about your bag: "This is my bag. It is blue. It has books."', 'నీ సంచి గురించి మూడు వాక్యాలు చెప్పు: "This is my bag. It is blue. It has books."'),
    p('Before a naming word we say "a" or "an". We say "an" when the word begins with a vowel sound (a, e, i, o, u): an apple, an egg, an owl. Otherwise we say "a": a ball, a cat, a kite.', 'పేరు పదం ముందు "a" లేదా "an" చెబుతాం. పదం అచ్చు శబ్దంతో (a, e, i, o, u) మొదలైతే "an": an apple, an egg, an owl. మిగతా పదాలకు "a": a ball, a cat, a kite.'),
  ], [
    exb(['Make a sentence: is / This / a / kite.', 'వాక్యం తయారు చేయి: is / This / a / kite.'], [['Start with the capital letter: This.', 'పెద్ద అక్షరంతో మొదలు: This.'], ['This is a kite.', 'This is a kite.']], ['This is a kite.', 'This is a kite. (ఇది ఒక గాలిపటం.)']),
    exb(['Look at 🌳. Finish: I can see a ___.', '🌳 చూడు. పూర్తి చేయి: I can see a ___.'], [['Name the picture: tree.', 'బొమ్మ పేరు: tree.']], ['I can see a tree.', 'I can see a tree. (నాకు ఒక చెట్టు కనిపిస్తోంది.)']),
  ], [
    orderT('build', ['Put the words in order to make a sentence', 'పదాలను సరైన వరుసలో పెట్టి వాక్యం తయారు చేయి'], ['The word with a capital letter comes first.', 'పెద్ద అక్షరంతో ఉన్న పదం ముందు వస్తుంది.'], [
      ['This', 'is', 'a', 'cat.'], ['I', 'can', 'see', 'a', 'tree.'], ['The', 'ball', 'is', 'red.'], ['This', 'is', 'my', 'bag.'], ['I', 'like', 'mangoes.'], ['It', 'is', 'a', 'big', 'house.'],
    ]),
    fill('fill', ['Look at the picture in the sentence.', 'వాక్యంలోని బొమ్మను చూడు.'], [
      ['🐶 This is a ___.', 'dog', ['cat', 'cow', 'cup'], 'The picture shows a dog.', 'బొమ్మలో కుక్క ఉంది.'],
      ['🪁 I can see a ___.', 'kite', ['kitten', 'car', 'cake'], 'The picture shows a kite.', 'బొమ్మలో గాలిపటం ఉంది.'],
      ['☀️ The ___ is hot.', 'sun', ['moon', 'sea', 'son'], 'The picture shows the sun.', 'బొమ్మలో సూర్యుడు ఉన్నాడు.'],
      ['🐘 The elephant is ___.', 'big', ['small', 'tiny', 'thin'], 'An elephant is a very big animal.', 'ఏనుగు చాలా పెద్ద జంతువు.'],
      ['🍎 This apple is ___.', 'red', ['blue', 'black', 'purple'], 'This apple is red.', 'ఈ ఆపిల్ ఎర్రగా ఉంది.'],
      ['📕 I ___ a book.', 'have', ['has', 'is', 'am'], 'We say "I have".', '"I" తో "have" వాడాలి.'],
    ]),
    aan('aan', [
      ['🍎', 'apple', 'ఆపిల్'], ['🥚', 'egg', 'గుడ్డు'], ['☂️', 'umbrella', 'గొడుగు'], ['🦉', 'owl', 'గుడ్లగూబ'], ['🐘', 'elephant', 'ఏనుగు'],
      ['🍊', 'orange', 'నారింజ'], ['🐜', 'ant', 'చీమ'], ['⚽', 'ball', 'బంతి'], ['🐱', 'cat', 'పిల్లి'], ['🪁', 'kite', 'గాలిపటం'],
      ['🥭', 'mango', 'మామిడి పండు'], ['🥁', 'drum', 'డప్పు'], ['🚌', 'bus', 'బస్సు'],
    ], 2),
  ]),
]);

// ================================================================ 1. Talking Train
const TRAIN_RHYME: RQ[] = [
  ['Chuk-chuk, chuk-chuk, here comes the train, / Over the bridge and down the ___.', 'lane', 'train', ['road', 'hill', 'street'], 'చుక్-చుక్ అంటూ రైలు వస్తోంది, వంతెన మీదుగా దారి వెంట.'],
  ['Toot-toot, toot-toot, it blows its horn, / Off to the city in the early ___.', 'morn', 'horn', ['night', 'day', 'noon'], 'కూ-కూ అని కూత పెడుతూ తెల్లవారే పట్నం వెళ్తుంది.'],
  ['Wheels go round, the coaches sway, / We are off on a trip ___!', 'today', 'sway', ['tomorrow', 'tonight', 'now'], 'చక్రాలు తిరుగుతాయి, పెట్టెలు ఊగుతాయి, ఈ రోజే మనం ప్రయాణం.'],
  ['Wave to the cows, wave to the trees, / Feel the cool and gentle ___.', 'breeze', 'trees', ['wind', 'rain', 'sun'], 'ఆవులకు, చెట్లకు చేయి ఊపు, చల్లని గాలిని ఆస్వాదించు.'],
  ['At the station, the bell goes ding, / The guard waves his flag and the children ___.', 'sing', 'ding', ['shout', 'dance', 'clap'], 'స్టేషన్‌లో గంట మోగుతుంది, గార్డు జెండా ఊపుతాడు, పిల్లలు పాడతారు.'],
  ['The engine is strong, the engine is long, / It pulls the coaches and hums a ___.', 'song', 'long', ['tune', 'rhyme', 'note'], 'ఇంజిన్ బలమైనది, పొడవైనది, పెట్టెలను లాగుతూ పాట పాడుతుంది.'],
];
const u1 = unit(1, ['Unit 1 · The Talking Train', 'యూనిట్ 1 · మాట్లాడే రైలు'], [
  obj('ts3.en.ch1.story', ['Listening: a train that talks', 'వినడం: మాట్లాడే రైలు'], [
    p('In this unit, a train talks to us and tells us about itself! Here is our own short train story. Listen and imagine.', 'ఈ పాఠంలో ఒక రైలు మనతో మాట్లాడి తన గురించి చెబుతుంది! ఇది మన స్వంత చిన్న రైలు కథ. విని ఊహించు.'),
    p('"Hello, children! I am Chintu, the little train. I have a strong engine and ten coaches. Every morning I carry people from the village to the city. I stop at every station. When the guard waves the green flag, I go chuk-chuk-chuk! I love my work."', '"హలో పిల్లలూ! నేను చింటు, చిన్న రైలును. నాకు బలమైన ఇంజిన్, పది పెట్టెలు ఉన్నాయి. ప్రతి ఉదయం గ్రామం నుండి పట్నానికి ప్రజలను తీసుకెళ్తాను. ప్రతి స్టేషన్‌లో ఆగుతాను. గార్డు పచ్చ జెండా ఊపగానే చుక్-చుక్-చుక్ అని బయలుదేరుతాను. నా పని నాకు చాలా ఇష్టం."'),
    photo('🚆', L('A train runs on a railway track.', 'రైలు పట్టాల మీద నడుస్తుంది.')),
    keys('engine — pulls the train', 'coach — where people sit', 'track — the rails', 'station — where the train stops', 'guard — waves the flag'),
    tip('Read the story aloud in a "train voice"! Then read your Reader\'s story about the talking train.', 'కథను "రైలు గొంతు"తో పైకి చదువు! తర్వాత నీ పాఠ్యపుస్తకంలోని మాట్లాడే రైలు కథ చదువు.'),
  ], [
    exb(['What is the little train\'s name in our story?', 'మన కథలో చిన్న రైలు పేరు ఏమిటి?'], [['It says, "I am Chintu."', 'అది "I am Chintu" అంటుంది.']], ['Chintu', 'చింటు']),
    exb(['When does Chintu start to move?', 'చింటు ఎప్పుడు బయలుదేరుతుంది?'], [['Look for the flag.', 'జెండా గురించి చూడు.'], ['The guard waves the green flag.', 'గార్డు పచ్చ జెండా ఊపుతాడు.']], ['When the guard waves the green flag.', 'గార్డు పచ్చ జెండా ఊపినప్పుడు.']),
  ], [
    mcq('read', ['Think about Chintu\'s story.', 'చింటు కథను గుర్తు చేసుకో.'], [
      ['Who is Chintu?', 'చింటు ఎవరు?', 'a little train', ['a boy', 'a bus', 'a guard'], 'Chintu says, "I am the little train."', 'చింటు "నేను చిన్న రైలును" అంటుంది.'],
      ['How many coaches does Chintu have?', 'చింటుకు ఎన్ని పెట్టెలు ఉన్నాయి?', 'ten', ['two', 'five', 'twenty'], 'Chintu has ten coaches.', 'చింటుకు పది పెట్టెలు ఉన్నాయి.'],
      ['Where does Chintu carry people?', 'చింటు ప్రజలను ఎక్కడికి తీసుకెళ్తుంది?', 'from the village to the city', ['to the moon', 'across the sea', 'up a tree'], 'Every morning it goes from the village to the city.', 'ప్రతి ఉదయం గ్రామం నుండి పట్నానికి వెళ్తుంది.'],
      ['Who waves the green flag?', 'పచ్చ జెండా ఎవరు ఊపుతారు?', 'the guard', ['the cow', 'the driver\'s son', 'a teacher'], 'The guard waves the flag at the station.', 'స్టేషన్‌లో గార్డు జెండా ఊపుతాడు.'],
      ['What sound does Chintu make?', 'చింటు ఏ శబ్దం చేస్తుంది?', 'chuk-chuk', ['moo-moo', 'quack-quack', 'tick-tock'], 'Trains go chuk-chuk.', 'రైలు చుక్-చుక్ అంటుంది.'],
      ['Where does a train stop?', 'రైలు ఎక్కడ ఆగుతుంది?', 'at a station', ['at a school', 'in a river', 'on a roof'], 'Trains stop at stations.', 'రైలు స్టేషన్‌లో ఆగుతుంది.'],
      ['How does Chintu feel about its work?', 'చింటు తన పని గురించి ఏమనుకుంటుంది?', 'It loves its work.', ['It is angry.', 'It is scared.', 'It wants to sleep.'], 'Chintu says, "I love my work."', '"నా పని నాకు ఇష్టం" అని చింటు అంటుంది.'],
    ]),
    orderT('seq', ['Put Chintu\'s journey in order', 'చింటు ప్రయాణాన్ని వరుసలో పెట్టు'], ['What happens first at the station?', 'స్టేషన్‌లో మొదట ఏమి జరుగుతుంది?'], [
      ['People get in.', 'The guard waves the flag.', 'The train goes.'],
      ['The train leaves the village.', 'It stops at stations.', 'It reaches the city.'],
      ['Buy a ticket.', 'Get into the coach.', 'Sit down.', 'Wave goodbye.'],
      ['The bell rings.', 'The guard waves the flag.', 'The engine whistles.', 'The train moves.'],
      ['The train comes.', 'It stops at the station.', 'People get out.'],
    ], ' → '),
  ]),
  obj('ts3.en.ch1.words', ['Words for travel, and a train rhyme', 'ప్రయాణ పదాలు, రైలు పాట'], [
    p('We travel in many ways: by train, bus, car, cycle, auto, boat, ship and aeroplane. Let\'s learn their names and sing our own train rhyme!', 'మనం చాలా రకాలుగా ప్రయాణిస్తాం: రైలు, బస్సు, కారు, సైకిల్, ఆటో, పడవ, ఓడ, విమానం. వాటి పేర్లు నేర్చుకుని మన రైలు పాట పాడుదాం!'),
    keys('Chuk-chuk, chuk-chuk, here comes the train,', 'Over the bridge and down the lane.', 'Toot-toot, toot-toot, it blows its horn,', 'Off to the city in the early morn.'),
    photo('🛺', L('An auto has three wheels.', 'ఆటోకు మూడు చక్రాలు ఉంటాయి.')),
    tip('Rhyming words end with the same sound: train – lane, horn – morn. Clap when you hear them!', 'ప్రాస పదాలు ఒకే శబ్దంతో ముగుస్తాయి: train – lane, horn – morn. అవి వినగానే చప్పట్లు కొట్టు!'),
  ], [
    exb(['Which word rhymes with "train": lane or road?', '"train" తో ప్రాస కలిసేది: lane లేదా road?'], [['train ends in -ain. lane ends in -ane — same sound!', 'train చివర -ain, lane చివర -ane — ఒకే శబ్దం!']], ['lane', 'lane']),
    exb(['What do we call ✈️ in English?', '✈️ ను ఇంగ్లీష్‌లో ఏమంటారు?'], [['It flies in the sky.', 'ఇది ఆకాశంలో ఎగురుతుంది.']], ['aeroplane', 'aeroplane (విమానం)']),
  ], [picWord('pic', VEHICLES), finish('rhyme', TRAIN_RHYME), rhymeQ('fam', FAMS, 2)]),
  obj('ts3.en.ch1.iam', ['Talking about yourself: I am, I have, I can', 'నీ గురించి చెప్పడం: I am, I have, I can'], [
    p('Chintu the train talks about itself: "I am a train. I have ten coaches. I can run fast." You can talk about yourself the same way!', 'చింటు రైలు తన గురించి చెబుతుంది: "I am a train. I have ten coaches. I can run fast." నువ్వు కూడా అలాగే నీ గురించి చెప్పవచ్చు!'),
    keys('I am … (who you are): I am Ravi. I am eight.', 'I have … (what you own): I have a red bag.', 'I can … (what you are able to do): I can sing.'),
    photo('🙋', L('"I am Meena. I have a kite. I can draw."', '"నేను మీనా. నా దగ్గర గాలిపటం ఉంది. నేను బొమ్మలు గీయగలను."')),
    tip('With "I" we say "am", not "is": I am happy.', '"I" తో "am" వాడాలి, "is" కాదు: I am happy.'),
  ], [
    exb(['Finish: I ___ eight years old.', 'పూర్తి చేయి: I ___ eight years old.'], [['With "I" we use "am".', '"I" తో "am" వాడతాం.']], ['I am eight years old.', 'I am eight years old. (నాకు ఎనిమిదేళ్ళు.)']),
    exb(['Finish: I ___ a blue cycle.', 'పూర్తి చేయి: I ___ a blue cycle.'], [['You own it, so use "have".', 'అది నీది, కాబట్టి "have".']], ['I have a blue cycle.', 'I have a blue cycle. (నాకు నీలం సైకిల్ ఉంది.)']),
  ], [
    fill('fill', ['am = who I am · have = what I own · can = what I am able to do', 'am = నేను ఎవరు · have = నా దగ్గర ఉన్నది · can = నేను చేయగలిగేది'], [
      ['I ___ a train.', 'am', ['is', 'are', 'has'], 'With "I" we say "am".', '"I" తో "am" వాడాలి.'],
      ['I ___ ten coaches.', 'have', ['has', 'am', 'is'], 'The coaches belong to me: "I have".', 'పెట్టెలు నావి: "I have".'],
      ['I ___ run fast.', 'can', ['am', 'is', 'has'], '"can" tells what you are able to do.', '"can" — చేయగలిగేది చెబుతుంది.'],
      ['I ___ happy today.', 'am', ['have', 'is', 'can'], 'I am happy.', 'I am happy — నేను సంతోషంగా ఉన్నాను.'],
      ['I ___ a red kite.', 'have', ['am', 'is', 'are'], 'I own a kite: "I have".', 'గాలిపటం నాది: "I have".'],
      ['I ___ swim in the pond.', 'can', ['am', 'have', 'is'], 'Swimming is something I am able to do.', 'ఈదడం నేను చేయగలిగే పని: "can".'],
      ['I ___ in Class 3.', 'am', ['have', 'can', 'is'], 'I am in Class 3.', 'I am in Class 3 — నేను మూడో తరగతిలో ఉన్నాను.'],
    ]),
    orderT('build', ['Put the words in order', 'పదాలను వరుసలో పెట్టు'], ['Start with "I".', '"I" తో మొదలుపెట్టు.'], [
      ['I', 'am', 'a', 'train.'], ['I', 'have', 'ten', 'coaches.'], ['I', 'can', 'run', 'fast.'], ['I', 'am', 'eight', 'years', 'old.'], ['I', 'can', 'sing', 'songs.'], ['I', 'have', 'a', 'red', 'bag.'],
    ]),
  ]),
]);

// ================================================================ 2. Swamy and the Magic Beans
const u2 = unit(2, ['Unit 2 · Swamy and the Magic Beans', 'యూనిట్ 2 · స్వామి, మాయా గింజలు'], [
  obj('ts3.en.ch2.grow', ['How a bean seed grows', 'చిక్కుడు గింజ ఎలా పెరుగుతుంది'], [
    p('In your Reader, Swamy has some magic beans. Before you read, let\'s learn how a real bean seed grows. Here is our own little story.', 'నీ పాఠ్యపుస్తకంలో స్వామి దగ్గర మాయా గింజలు ఉంటాయి. చదవడానికి ముందు నిజమైన చిక్కుడు గింజ ఎలా పెరుగుతుందో నేర్చుకుందాం. ఇది మన స్వంత చిన్న కథ.'),
    p('Lakshmi put a bean seed in a pot of soil. She watered it every day. After four days, a tiny green shoot came up. Soon it had leaves. The plant grew tall and climbed a stick. Then came white flowers, and at last — long green beans! Lakshmi was so proud.', 'లక్ష్మి ఒక చిక్కుడు గింజను మట్టి కుండీలో పెట్టింది. రోజూ నీళ్ళు పోసింది. నాలుగు రోజుల తర్వాత చిన్న పచ్చని మొలక వచ్చింది. తర్వాత ఆకులు వచ్చాయి. మొక్క పొడవుగా పెరిగి కర్రకు పాకింది. తెల్లని పువ్వులు, చివరికి పొడవైన పచ్చని చిక్కుడు కాయలు వచ్చాయి! లక్ష్మి చాలా గర్వపడింది.'),
    photo('🌱', L('A seed becomes a shoot (a tiny plant).', 'గింజ మొలకెత్తి చిన్న మొక్క అవుతుంది.')),
    keys('seed → shoot → leaves → flowers → beans', 'A plant needs soil, water and sunlight.'),
    tip('Plant a bean seed in a cup at home and watch it grow!', 'ఇంట్లో ఒక కప్పులో చిక్కుడు గింజ నాటి అది పెరగడం చూడు!'),
  ], [
    exb(['What did Lakshmi do every day?', 'లక్ష్మి రోజూ ఏమి చేసింది?'], [['A plant needs water.', 'మొక్కకు నీళ్ళు కావాలి.']], ['She watered the seed.', 'గింజకు నీళ్ళు పోసింది.']),
    exb(['What comes just before the beans?', 'కాయలకు ముందు ఏమి వస్తాయి?'], [['seed → shoot → leaves → flowers → beans', 'గింజ → మొలక → ఆకులు → పువ్వులు → కాయలు']], ['flowers', 'పువ్వులు']),
  ], [
    orderT('seq', ['Put the bean plant\'s growth in order', 'చిక్కుడు మొక్క పెరుగుదలను వరుసలో పెట్టు'], ['Everything starts with a seed.', 'అంతా గింజతోనే మొదలవుతుంది.'], [
      ['seed', 'shoot', 'leaves', 'flowers', 'beans'],
      ['Put the seed in soil.', 'Water it.', 'A shoot comes up.'],
      ['A shoot comes up.', 'Leaves grow.', 'Flowers come.', 'Beans grow.'],
      ['Dig a small hole.', 'Drop the seed in.', 'Cover it with soil.', 'Water it.'],
      ['seed', 'shoot', 'plant', 'beans'],
    ], ' → '),
    mcq('read', ['Think about Lakshmi\'s bean seed.', 'లక్ష్మి చిక్కుడు గింజ గురించి ఆలోచించు.'], [
      ['Where did Lakshmi put the seed?', 'లక్ష్మి గింజను ఎక్కడ పెట్టింది?', 'in a pot of soil', ['in a box', 'in the river', 'in her bag'], 'She put it in a pot of soil.', 'మట్టి కుండీలో పెట్టింది.'],
      ['What came up after four days?', 'నాలుగు రోజుల తర్వాత ఏమి వచ్చింది?', 'a tiny green shoot', ['a big tree', 'a mango', 'a bird'], 'A shoot is a tiny new plant.', 'మొలక అంటే చిన్న కొత్త మొక్క.'],
      ['What did the plant climb?', 'మొక్క దేనికి పాకింది?', 'a stick', ['a wall', 'a ladder', 'a hill'], 'The bean plant climbed a stick.', 'చిక్కుడు మొక్క కర్రకు పాకింది.'],
      ['What colour were the flowers?', 'పువ్వులు ఏ రంగులో ఉన్నాయి?', 'white', ['blue', 'black', 'orange'], 'The story says white flowers.', 'కథలో తెల్లని పువ్వులు అని ఉంది.'],
      ['What does a plant need to grow?', 'మొక్క పెరగడానికి ఏమి కావాలి?', 'soil, water and sunlight', ['sweets and toys', 'only darkness', 'milk and cake'], 'Plants need soil, water and sunlight.', 'మొక్కలకు మట్టి, నీరు, సూర్యరశ్మి కావాలి.'],
      ['How did Lakshmi feel at the end?', 'చివర్లో లక్ష్మి ఎలా భావించింది?', 'proud', ['sad', 'angry', 'scared'], 'Her plant gave beans, so she was proud.', 'మొక్క కాయలు ఇచ్చింది, అందుకే ఆమె గర్వపడింది.'],
    ]),
  ]),
  obj('ts3.en.ch2.veg', ['Vegetable words and spelling', 'కూరగాయల పేర్లు, స్పెల్లింగ్'], [
    p('Beans are vegetables. Let\'s learn more vegetable names in English: carrot, tomato, brinjal, potato, onion, cucumber, chilli and corn.', 'చిక్కుడు ఒక కూరగాయ. ఇంకా కొన్ని కూరగాయల ఇంగ్లీష్ పేర్లు నేర్చుకుందాం: carrot (క్యారెట్), tomato (టమాటా), brinjal (వంకాయ), potato (బంగాళాదుంప), onion (ఉల్లిపాయ), cucumber (దోసకాయ), chilli (మిరపకాయ), corn (మొక్కజొన్న).'),
    photo('🥕', L('A carrot is orange and grows under the soil.', 'క్యారెట్ నారింజ రంగులో ఉంటుంది, మట్టి కింద పెరుగుతుంది.')),
    keys('Under the soil: carrot, potato, onion', 'On the plant: tomato, brinjal, chilli, beans'),
    tip('Next time you go to the market, name the vegetables in English!', 'ఈసారి మార్కెట్‌కు వెళ్ళినప్పుడు కూరగాయల పేర్లు ఇంగ్లీష్‌లో చెప్పు!'),
  ], [
    exb(['What is "వంకాయ" in English?', '"వంకాయ" ను ఇంగ్లీష్‌లో ఏమంటారు?'], [['It is purple. 🍆', 'ఇది ఊదా రంగులో ఉంటుంది. 🍆']], ['brinjal', 'brinjal']),
    exb(['Spell "corn".', '"corn" స్పెల్లింగ్ చెప్పు.'], [['Say it slowly: c-o-r-n.', 'నెమ్మదిగా: c-o-r-n.']], ['c-o-r-n', 'c-o-r-n']),
  ], [picWord('pic', VEG), meaning('mean', VEG), missing('spell', VEG, 2)]),
  obj('ts3.en.ch2.nouns', ['Naming words (nouns)', 'పేరు పదాలు (నామవాచకాలు)'], [
    p('A naming word is called a noun. It names a person (Swamy, mother), an animal (cow), a place (garden, market) or a thing (bean, pot).', 'పేరు చెప్పే పదాన్ని noun (నామవాచకం) అంటారు. అది వ్యక్తి (Swamy, mother), జంతువు (cow), ప్రదేశం (garden, market) లేదా వస్తువు (bean, pot) పేరు చెబుతుంది.'),
    photo('🧑‍🌾', L('farmer, field, seed, plant — all naming words!', 'farmer, field, seed, plant — ఇవన్నీ పేరు పదాలే!')),
    keys('person: boy, mother, farmer, Swamy', 'animal: cow, goat, hen', 'place: garden, market, school', 'thing: bean, pot, bag'),
    tip('Ask: "Can I point to it or name it?" If yes, it is a noun.', '"దీన్ని చూపించగలనా, పేరు చెప్పగలనా?" అని అడుగు. అవును అయితే అది noun.'),
    p('One or many? For many, most nouns add "s": one seed → two seeds. Words ending in s, x, ch, sh, and some ending in o, add "es": box → boxes, tomato → tomatoes. A few words change: leaf → leaves, child → children, mouse → mice, tooth → teeth.', 'ఒకటా, చాలానా? చాలా ఉంటే చాలా nouns కు "s" చేరుతుంది: one seed → two seeds. s, x, ch, sh తో, కొన్ని o తో ముగిసే పదాలకు "es": box → boxes, tomato → tomatoes. కొన్ని పదాలు మారుతాయి: leaf → leaves, child → children, mouse → mice, tooth → teeth.'),
  ], [
    exb(['Find the noun: "The cow eats grass."', 'noun కనుక్కో: "The cow eats grass."'], [['Which words name things? cow, grass.', 'ఏ పదాలు పేర్లు? cow, grass.']], ['cow and grass', 'cow, grass']),
    exb(['Is "run" a noun?', '"run" noun ఆ?'], [['"run" tells an action, not a name.', '"run" పని చెబుతుంది, పేరు కాదు.']], ['No, it is an action word.', 'కాదు, అది పని పదం.']),
  ], [
    tapT('tap', ['Tap the naming words (nouns)', 'పేరు పదాలను (nouns) నొక్కు'], [
      ['garden', true], ['bean', true], ['mother', true], ['market', true], ['pot', true], ['cow', true], ['farmer', true],
      ['run', false], ['happy', false], ['jump', false], ['quickly', false], ['green', false],
    ], ['Nouns name a person, animal, place or thing.', 'noun అంటే వ్యక్తి, జంతువు, ప్రదేశం లేదా వస్తువు పేరు.']),
    mcq('find', ['Which word names a person, animal, place or thing?', 'ఏ పదం వ్యక్తి, జంతువు, ప్రదేశం లేదా వస్తువు పేరు?'], [
      ['"Swamy plants a seed." Which word is a noun?', '"Swamy plants a seed." లో noun ఏది?', 'seed', ['plants', 'a', 'quickly'], '"seed" names a thing.', '"seed" ఒక వస్తువు పేరు.'],
      ['"The hen lays an egg." Which word is a noun?', '"The hen lays an egg." లో noun ఏది?', 'hen', ['lays', 'the', 'an'], '"hen" names an animal.', '"hen" ఒక జంతువు పేరు.'],
      ['"We went to the market." Which word is a noun?', '"We went to the market." లో noun ఏది?', 'market', ['went', 'to', 'the'], '"market" names a place.', '"market" ఒక ప్రదేశం పేరు.'],
      ['"Mother cooks rice." Which word is a noun?', '"Mother cooks rice." లో noun ఏది?', 'rice', ['cooks', 'hot', 'slowly'], '"rice" names a thing.', '"rice" ఒక వస్తువు పేరు.'],
      ['"The farmer is tall." Which word is a noun?', '"The farmer is tall." లో noun ఏది?', 'farmer', ['tall', 'is', 'the'], '"farmer" names a person.', '"farmer" ఒక వ్యక్తి పేరు.'],
      ['"Birds sing in the garden." Which word is a noun?', '"Birds sing in the garden." లో noun ఏది?', 'garden', ['sing', 'in', 'the'], '"garden" names a place.', '"garden" ఒక ప్రదేశం పేరు.'],
    ]),
    plural('many', [
      ['🌱', 'seed', 'seeds', 'గింజ'], ['🥕', 'carrot', 'carrots', 'క్యారెట్'], ['🍅', 'tomato', 'tomatoes', 'టమాటా'], ['🥔', 'potato', 'potatoes', 'బంగాళాదుంప'],
      ['📦', 'box', 'boxes', 'పెట్టె'], ['🐐', 'goat', 'goats', 'మేక'], ['🍃', 'leaf', 'leaves', 'ఆకు'], ['🧺', 'basket', 'baskets', 'బుట్ట'],
      ['🧒', 'child', 'children', 'పిల్లవాడు'], ['🐭', 'mouse', 'mice', 'ఎలుక'], ['🦷', 'tooth', 'teeth', 'పన్ను'],
    ], 2),
  ]),
], 'Unit 2: our own bean-growing story is used; the Reader\'s Swamy story is not summarised — teacher should add questions on the Reader text.');

// ================================================================ 3. I Like It This Way
const u3 = unit(3, ['Unit 3 · I Like It This Way', 'యూనిట్ 3 · నాకు ఇలా ఇష్టం'], [
  obj('ts3.en.ch3.talk', ['Talking at home: a dialogue', 'ఇంట్లో మాటలు: సంభాషణ'], [
    p('This unit is a conversation (dialogue) between Sita and her mother about keeping things in their places. A dialogue is people talking to each other. Here is our own short dialogue.', 'ఈ పాఠం సీత, ఆమె అమ్మ మధ్య వస్తువులను వాటి స్థానంలో ఉంచడం గురించి జరిగే సంభాషణ. ఇద్దరు మాట్లాడుకోవడాన్నే dialogue (సంభాషణ) అంటారు. ఇది మన స్వంత చిన్న సంభాషణ.'),
    keys('Amma: Ravi, where is your school bag?', 'Ravi: I don\'t know, Amma. I can\'t find it!', 'Amma: Look under the bed.', 'Ravi: Here it is! Thank you, Amma. From today, I will keep it on the shelf.'),
    photo('🎒', L('Keep your bag in its place — then you can always find it.', 'సంచిని దాని స్థానంలో ఉంచు — అప్పుడు ఎప్పుడూ దొరుకుతుంది.')),
    tip('Act out the dialogue with a friend. One is Amma, one is Ravi.', 'స్నేహితుడితో కలిసి ఈ సంభాషణ నటించు. ఒకరు అమ్మ, ఒకరు రవి.'),
  ], [
    exb(['Where was Ravi\'s bag?', 'రవి సంచి ఎక్కడ ఉంది?'], [['Amma said, "Look under the bed."', 'అమ్మ "మంచం కింద చూడు" అంది.']], ['under the bed', 'మంచం కింద']),
    exb(['What did Ravi promise?', 'రవి ఏమని మాట ఇచ్చాడు?'], [['"From today, I will keep it on the shelf."', '"ఈ రోజు నుండి అల్మారాలో పెడతాను."']], ['To keep his bag on the shelf.', 'సంచిని అల్మారాలో ఉంచుతానని.']),
  ], [
    mcq('read', ['Think about Ravi and Amma\'s talk.', 'రవి, అమ్మల మాటలు గుర్తు చేసుకో.'], [
      ['What was Ravi looking for?', 'రవి ఏమి వెతుకుతున్నాడు?', 'his school bag', ['his shoes', 'his cat', 'his kite'], 'Amma asked, "Where is your school bag?"', '"నీ బడి సంచి ఎక్కడ?" అని అమ్మ అడిగింది.'],
      ['Where did Ravi find the bag?', 'రవికి సంచి ఎక్కడ దొరికింది?', 'under the bed', ['on the roof', 'in the kitchen', 'at school'], 'Amma told him to look under the bed.', 'మంచం కింద చూడమని అమ్మ చెప్పింది.'],
      ['What did Ravi say to Amma?', 'రవి అమ్మతో ఏమన్నాడు?', 'Thank you, Amma.', ['Go away!', 'I am sleepy.', 'Good night.'], 'Amma helped him, so he said thank you.', 'అమ్మ సహాయం చేసింది, అందుకే థాంక్యూ చెప్పాడు.'],
      ['Where will Ravi keep his bag now?', 'ఇప్పుడు రవి సంచిని ఎక్కడ ఉంచుతాడు?', 'on the shelf', ['under the bed', 'on the floor', 'in the garden'], 'He promised to keep it on the shelf.', 'అల్మారాలో పెడతానని మాట ఇచ్చాడు.'],
      ['What is a dialogue?', 'dialogue అంటే ఏమిటి?', 'people talking to each other', ['a kind of food', 'a song about trains', 'a big box'], 'A dialogue is a conversation.', 'dialogue అంటే సంభాషణ.'],
      ['Why should we keep things in their places?', 'వస్తువులను వాటి స్థానంలో ఎందుకు ఉంచాలి?', 'so we can find them easily', ['so they get lost', 'so mother gets angry', 'so we are late'], 'Things in their places are easy to find.', 'స్థానంలో ఉంటే సులభంగా దొరుకుతాయి.'],
    ]),
    mcq('polite', ['Polite words: please, thank you, sorry, excuse me.', 'మర్యాద పదాలు: please, thank you, sorry, excuse me.'], [
      ['You want your mother to pass the water. You say:', 'అమ్మను నీళ్ళు ఇవ్వమని అడగాలి. నువ్వు అంటావు:', 'Please give me some water.', ['Give water!', 'Water now.', 'No water.'], '"Please" makes a request polite.', '"Please" అడగడాన్ని మర్యాదగా చేస్తుంది.'],
      ['Your mother finds your pencil. You say:', 'అమ్మ నీ పెన్సిల్ వెతికి ఇచ్చింది. నువ్వు అంటావు:', 'Thank you, Amma.', ['Sorry, Amma.', 'Good night.', 'Go away.'], 'Someone helped you — say thank you.', 'ఎవరైనా సహాయం చేస్తే థాంక్యూ చెప్పాలి.'],
      ['You spill milk on the floor. You say:', 'నువ్వు నేలపై పాలు ఒలకబోశావు. నువ్వు అంటావు:', 'Sorry, I will clean it.', ['Thank you.', 'Hurray!', 'Good morning.'], 'You made a mistake — say sorry and fix it.', 'తప్పు చేస్తే సారీ చెప్పి సరిచేయాలి.'],
      ['You want to pass by your grandfather. You say:', 'తాతయ్య పక్కనుంచి వెళ్ళాలి. నువ్వు అంటావు:', 'Excuse me, Thatha.', ['Move!', 'Thank you.', 'Well done.'], '"Excuse me" asks politely to pass.', '"Excuse me" మర్యాదగా దారి అడుగుతుంది.'],
      ['You wake up in the morning. You say to your family:', 'ఉదయం లేవగానే కుటుంబంతో అంటావు:', 'Good morning!', ['Good night!', 'Goodbye!', 'Sorry!'], 'It is morning.', 'ఇది ఉదయం.'],
    ]),
  ]),
  obj('ts3.en.ch3.where', ['Where is it? in, on, under, near, behind', 'ఎక్కడ ఉంది? in, on, under, near, behind'], [
    p('Some small words tell us WHERE things are. in = inside (లోపల). on = on top (పైన). under = below (కింద). near = close to (దగ్గర). behind = at the back (వెనుక).', 'కొన్ని చిన్న పదాలు వస్తువులు ఎక్కడ ఉన్నాయో చెబుతాయి. in = లోపల, on = పైన, under = కింద, near = దగ్గర, behind = వెనుక.'),
    photo('📦', L('The ball is in the box. The cat is on the box.', 'బంతి పెట్టె లోపల ఉంది. పిల్లి పెట్టె పైన ఉంది.')),
    keys('The book is in the bag.', 'The cup is on the table.', 'The cat is under the chair.', 'The tree is near the house.', 'The dog is behind the door.'),
    tip('Play "Where is it?": hide a ball and give clues using in, on, under, near, behind.', '"ఎక్కడ ఉంది?" ఆట ఆడు: బంతిని దాచి in, on, under, near, behind తో సూచనలు ఇవ్వు.'),
  ], [
    exb(['The shoes are below the bed. The shoes are ___ the bed.', 'చెప్పులు మంచం కింద ఉన్నాయి. The shoes are ___ the bed.'], [['Below = under.', 'కింద = under.']], ['under', 'under']),
    exb(['The pencil is inside the box. The pencil is ___ the box.', 'పెన్సిల్ పెట్టె లోపల ఉంది. The pencil is ___ the box.'], [['Inside = in.', 'లోపల = in.']], ['in', 'in']),
  ], [
    fill('fill', ['in = inside · on = on top · under = below · near = close · behind = at the back', 'in = లోపల · on = పైన · under = కింద · near = దగ్గర · behind = వెనుక'], [
      ['The books are ___ the bag. (inside)', 'in', ['on', 'under', 'behind'], 'Inside is "in".', 'లోపల = in.'],
      ['The cup is ___ the table. (on top)', 'on', ['in', 'under', 'near'], 'On top is "on".', 'పైన = on.'],
      ['The cat is sleeping ___ the chair. (below)', 'under', ['on', 'in', 'near'], 'Below is "under".', 'కింద = under.'],
      ['The tree is ___ our house. (close to)', 'near', ['in', 'under', 'on'], 'Close to is "near".', 'దగ్గర = near.'],
      ['The dog is hiding ___ the door. (at the back)', 'behind', ['on', 'in', 'under'], 'At the back is "behind".', 'వెనుక = behind.'],
      ['The fish swim ___ the water. (inside)', 'in', ['on', 'behind', 'near'], 'Fish are inside the water.', 'చేపలు నీటి లోపల ఉంటాయి.'],
      ['The bird sits ___ the branch. (on top)', 'on', ['under', 'in', 'behind'], 'The bird is on top of the branch.', 'పక్షి కొమ్మ పైన కూర్చుంది.'],
    ]),
    matchT('match', ['Match the word to its meaning', 'పదాన్ని దాని అర్థంతో జత చేయి'], ['Think of a ball and a box.', 'ఒక బంతి, ఒక పెట్టెను ఊహించుకో.'], [
      ['in', 'inside (లోపల)'], ['on', 'on top (పైన)'], ['under', 'below (కింద)'], ['near', 'close to (దగ్గర)'], ['behind', 'at the back (వెనుక)'],
    ]),
  ]),
  obj('ts3.en.ch3.places', ['A place for everything', 'ప్రతి వస్తువుకు ఒక స్థానం'], [
    p('Sita likes her room neat. Every thing has its own place: books on the shelf, clothes in the cupboard, shoes under the bed, toys in the toy box. A neat room makes us happy!', 'సీతకు తన గది శుభ్రంగా ఉండటం ఇష్టం. ప్రతి వస్తువుకు ఒక స్థానం: పుస్తకాలు అల్మారాలో, బట్టలు బీరువాలో, చెప్పులు మంచం కింద, బొమ్మలు బొమ్మల పెట్టెలో. శుభ్రమైన గది మనకు సంతోషం ఇస్తుంది!'),
    photo('🧸', L('Toys go back in the toy box after play.', 'ఆడుకున్న తర్వాత బొమ్మలు బొమ్మల పెట్టెలోకి.')),
    keys('books → shelf', 'clothes → cupboard', 'toys → toy box', 'dishes → kitchen', 'rubbish → dustbin'),
    tip('After you play, put things back. Say: "Everything in its place!"', 'ఆడిన తర్వాత వస్తువులను తిరిగి ఉంచు. "Everything in its place!" అని చెప్పు.'),
  ], [
    exb(['Where do clothes go?', 'బట్టలు ఎక్కడ ఉంచాలి?'], [['We fold them and keep them in the cupboard.', 'మడిచి బీరువాలో పెడతాం.']], ['in the cupboard', 'బీరువాలో']),
    exb(['Where should rubbish go?', 'చెత్త ఎక్కడ వేయాలి?'], [['Never on the floor!', 'నేల మీద ఎప్పుడూ వేయకూడదు!']], ['in the dustbin', 'చెత్తబుట్టలో']),
  ], [
    matchT('match', ['Match each thing to its place', 'ప్రతి వస్తువును దాని స్థానంతో జత చేయి'], ['Where does it live in a neat house?', 'శుభ్రమైన ఇంట్లో అది ఎక్కడ ఉంటుంది?'], [
      ['books', 'shelf'], ['clothes', 'cupboard'], ['toys', 'toy box'], ['rubbish', 'dustbin'], ['milk', 'kitchen'], ['car', 'garage'],
    ]),
    tapT('tap', ['Tap the tidy habits', 'శుభ్రమైన అలవాట్లను నొక్కు'], [
      ['put toys back in the box', true], ['fold your clothes', true], ['keep books on the shelf', true], ['throw rubbish in the dustbin', true], ['keep shoes in a row', true],
      ['throw clothes on the floor', false], ['leave toys on the stairs', false], ['drop wrappers everywhere', false],
    ], ['Tidy children put things back in their places.', 'శుభ్రంగా ఉండే పిల్లలు వస్తువులను వాటి స్థానంలో ఉంచుతారు.']),
  ]),
]);

// ================================================================ 4. The Mouse and the Pencil
const u4 = unit(4, ['Unit 4 · The Mouse and the Pencil', 'యూనిట్ 4 · ఎలుక, పెన్సిల్'], [
  obj('ts3.en.ch4.lion', ['Extra reading: The Lion and the Mouse', 'అదనపు పఠనం: సింహం, ఎలుక'], [
    p('This unit has a story about a mouse, and an extra reading: "The Lion and the Mouse", an old fable (Aesop). Here it is in our own words.', 'ఈ పాఠంలో ఒక ఎలుక కథ, అదనంగా "సింహం, ఎలుక" అనే పాత నీతి కథ (ఈసప్) ఉన్నాయి. ఇక్కడ మన మాటల్లో.'),
    p('A lion was sleeping. A little mouse ran over his nose and woke him up. The lion caught the mouse. "Please let me go," said the mouse. "One day I will help you." The lion laughed and let it go. Later, the lion was caught in a hunter\'s net. The mouse heard him roar. It came and cut the net with its sharp teeth. The lion was free! "Thank you, little friend," said the lion.', 'ఒక సింహం నిద్రపోతోంది. ఒక చిన్న ఎలుక దాని ముక్కు మీద పరిగెత్తి లేపింది. సింహం ఎలుకను పట్టుకుంది. "దయచేసి నన్ను వదిలెయ్యి, ఏదో ఒక రోజు నీకు సహాయం చేస్తాను" అంది ఎలుక. సింహం నవ్వి వదిలేసింది. తర్వాత సింహం వేటగాడి వలలో చిక్కుకుంది. ఎలుక గర్జన విని వచ్చి, పదునైన పళ్ళతో వలను కొరికింది. సింహం విడుదలైంది! "ధన్యవాదాలు, చిన్న మిత్రమా" అంది సింహం.'),
    photo('🦁', L('The big lion and the little mouse became friends.', 'పెద్ద సింహం, చిన్న ఎలుక స్నేహితులయ్యారు.')),
    keys('Lesson: Even a small friend can be a big help.', 'Be kind to everyone, big or small.'),
    tip('Retell the story using your fingers: 1 sleep, 2 catch, 3 let go, 4 net, 5 free!', 'వేళ్ళతో లెక్కిస్తూ కథ చెప్పు: 1 నిద్ర, 2 పట్టుకోవడం, 3 వదలడం, 4 వల, 5 విడుదల!'),
  ], [
    exb(['How did the mouse help the lion?', 'ఎలుక సింహానికి ఎలా సహాయం చేసింది?'], [['The lion was caught in a net.', 'సింహం వలలో చిక్కుకుంది.'], ['The mouse cut the net with its teeth.', 'ఎలుక పళ్ళతో వలను కొరికింది.']], ['It cut the net with its teeth.', 'పళ్ళతో వలను కొరికి.']),
    exb(['What is the lesson of the story?', 'ఈ కథ నీతి ఏమిటి?'], [['A tiny mouse saved a big lion.', 'చిన్న ఎలుక పెద్ద సింహాన్ని కాపాడింది.']], ['Even a small friend can be a big help.', 'చిన్న స్నేహితుడు కూడా పెద్ద సహాయం చేయగలడు.']),
  ], [
    orderT('seq', ['Put the story in order', 'కథను వరుసలో పెట్టు'], ['The story starts with the lion asleep.', 'సింహం నిద్రపోవడంతో కథ మొదలవుతుంది.'], [
      ['The lion was sleeping.', 'The mouse woke him up.', 'The lion let the mouse go.', 'The lion was caught in a net.', 'The mouse cut the net.'],
      ['The lion caught the mouse.', 'The mouse said, "Please let me go."', 'The lion laughed.'],
      ['The lion was caught in a net.', 'The mouse heard him roar.', 'It cut the net.', 'The lion was free.'],
      ['The mouse ran over the lion\'s nose.', 'The lion woke up.', 'He caught the mouse.'],
      ['The lion let the mouse go.', 'A hunter set a net.', 'The mouse saved the lion.'],
    ], ' → '),
    mcq('read', ['Remember the lion and the little mouse.', 'సింహం, చిన్న ఎలుకను గుర్తు చేసుకో.'], [
      ['Who woke the lion up?', 'సింహాన్ని ఎవరు లేపారు?', 'a little mouse', ['a hunter', 'an elephant', 'a bird'], 'The mouse ran over his nose.', 'ఎలుక అతని ముక్కు మీద పరిగెత్తింది.'],
      ['What did the lion do when the mouse begged?', 'ఎలుక బతిమాలినప్పుడు సింహం ఏమి చేసింది?', 'He laughed and let it go.', ['He ate it.', 'He ran away.', 'He went to sleep.'], 'The lion laughed and let the mouse go.', 'సింహం నవ్వి ఎలుకను వదిలేసింది.'],
      ['What trapped the lion?', 'సింహం దేనిలో చిక్కుకుంది?', 'a hunter\'s net', ['a box', 'a river', 'a tree'], 'He was caught in a net.', 'అతను వలలో చిక్కుకున్నాడు.'],
      ['How did the mouse cut the net?', 'ఎలుక వలను ఎలా కొరికింది?', 'with its sharp teeth', ['with a knife', 'with its tail', 'with fire'], 'Mice have sharp teeth.', 'ఎలుకలకు పదునైన పళ్ళు ఉంటాయి.'],
      ['What did the lion say at the end?', 'చివర్లో సింహం ఏమంది?', 'Thank you, little friend.', ['Go away!', 'I am hungry.', 'Good night.'], 'He thanked the mouse.', 'అతను ఎలుకకు ధన్యవాదాలు చెప్పాడు.'],
      ['Which word describes the mouse?', 'ఎలుకను వివరించే పదం ఏది?', 'helpful', ['lazy', 'rude', 'greedy'], 'The mouse helped the lion.', 'ఎలుక సింహానికి సహాయం చేసింది.'],
    ]),
  ]),
  obj('ts3.en.ch4.punct', ['Capital letters, full stops and question marks', 'పెద్ద అక్షరాలు, ఫుల్ స్టాప్, ప్రశ్నార్థకం'], [
    p('Good writing has three rules. 1) Begin every sentence with a capital letter. 2) End a telling sentence with a full stop (.). 3) End an asking sentence with a question mark (?). Names of people and places also begin with capital letters: Sita, Hyderabad.', 'మంచి రాతకు మూడు నియమాలు. 1) ప్రతి వాక్యం పెద్ద అక్షరంతో మొదలవ్వాలి. 2) చెప్పే వాక్యం ఫుల్ స్టాప్ (.) తో ముగియాలి. 3) అడిగే వాక్యం ప్రశ్నార్థకం (?) తో ముగియాలి. వ్యక్తుల, ఊర్ల పేర్లు కూడా పెద్ద అక్షరంతో మొదలవుతాయి: Sita, Hyderabad.'),
    photo('✏️', L('The pencil writes: "The mouse is small."', 'పెన్సిల్ రాస్తుంది: "The mouse is small."')),
    keys('Telling: The mouse is small.', 'Asking: Where is the pencil?', 'Names: Ravi, Warangal, Monday'),
    tip('Questions often start with What, Where, Who, Why, How, Is, Can or Do.', 'ప్రశ్నలు తరచుగా What, Where, Who, Why, How, Is, Can, Do తో మొదలవుతాయి.'),
  ], [
    exb(['Correct this: the mouse ran away', 'సరిచేయి: the mouse ran away'], [['Capital T at the start.', 'మొదట పెద్ద T.'], ['It tells something, so add a full stop.', 'ఇది చెప్పే వాక్యం, ఫుల్ స్టాప్ పెట్టు.']], ['The mouse ran away.', 'The mouse ran away.']),
    exb(['Which mark ends: "Where is my pencil"?', '"Where is my pencil" చివర ఏ గుర్తు?'], [['It asks something.', 'ఇది ఏదో అడుగుతోంది.']], ['a question mark (?)', 'ప్రశ్నార్థకం (?)']),
  ], [
    fill('mark', ['Is the sentence telling or asking?', 'వాక్యం ఏదైనా చెబుతోందా, అడుగుతోందా?'], [
      ['Where is the mouse___', '?', ['.'], 'It asks a question.', 'ఇది ప్రశ్న అడుగుతోంది.'],
      ['The pencil is long___', '.', ['?'], 'It tells us something.', 'ఇది ఏదో చెబుతోంది.'],
      ['Can you draw a cat___', '?', ['.'], 'It asks a question.', 'ఇది ప్రశ్న అడుగుతోంది.'],
      ['I like my school___', '.', ['?'], 'It tells us something.', 'ఇది ఏదో చెబుతోంది.'],
      ['What is your name___', '?', ['.'], 'It asks a question.', 'ఇది ప్రశ్న అడుగుతోంది.'],
      ['The mouse has a tail___', '.', ['?'], 'It tells us something.', 'ఇది ఏదో చెబుతోంది.'],
      ['Who drew this picture___', '?', ['.'], 'It asks a question.', 'ఇది ప్రశ్న అడుగుతోంది.'],
    ]),
    mcq('right', ['Look at the first letter and the last mark.', 'మొదటి అక్షరం, చివరి గుర్తును చూడు.'], [
      ['What needs fixing? "the mouse is small."', 'ఏమి సరిచేయాలి? "the mouse is small."', 'The first letter should be a capital.', ['The end mark should be ?', 'A name needs a capital letter.', 'Nothing — it is correct.'], 'A sentence begins with a capital letter: The mouse is small.', 'వాక్యం పెద్ద అక్షరంతో మొదలవ్వాలి: The mouse is small.'],
      ['What needs fixing? "Where is my pencil."', 'ఏమి సరిచేయాలి? "Where is my pencil."', 'The end mark should be ?', ['The first letter should be a capital.', 'A name needs a capital letter.', 'Nothing — it is correct.'], 'It asks something, so it ends with ?: Where is my pencil?', 'ఇది అడుగుతోంది, కాబట్టి ? తో ముగియాలి: Where is my pencil?'],
      ['What needs fixing? "Sita lives in hyderabad."', 'ఏమి సరిచేయాలి? "Sita lives in hyderabad."', 'A name needs a capital letter.', ['The end mark should be ?', 'The first letter should be a capital.', 'Nothing — it is correct.'], 'Hyderabad is the name of a place: Sita lives in Hyderabad.', 'హైదరాబాద్ ఊరి పేరు, పెద్ద H కావాలి: Sita lives in Hyderabad.'],
      ['What needs fixing? "Can you help me."', 'ఏమి సరిచేయాలి? "Can you help me."', 'The end mark should be ?', ['The end mark should be !', 'The first letter should be a capital.', 'Nothing — it is correct.'], 'It asks for help, so it ends with ?: Can you help me?', 'ఇది సహాయం అడుగుతోంది, ? తో ముగియాలి: Can you help me?'],
      ['What needs fixing? "The cat is on the mat."', 'ఏమి సరిచేయాలి? "The cat is on the mat."', 'Nothing — it is correct.', ['The end mark should be ?', 'The first letter should be a capital.', 'A name needs a capital letter.'], 'Capital T at the start and a full stop at the end — well written!', 'మొదట పెద్ద T, చివర ఫుల్ స్టాప్ — సరిగ్గా ఉంది!'],
      ['What needs fixing? "my friend is ravi."', 'ఏమి సరిచేయాలి? "my friend is ravi."', 'Both: the first letter and the name need capitals.', ['Only the end mark should be ?', 'Nothing — it is correct.', 'Only "friend" needs a capital.'], 'Capital M at the start and capital R for the name: My friend is Ravi.', 'మొదట పెద్ద M, పేరుకు పెద్ద R: My friend is Ravi.'],
      ['Which word needs a capital letter?', 'ఏ పదానికి పెద్ద అక్షరం కావాలి?', 'warangal', ['pencil', 'mouse', 'table'], 'Warangal is the name of a place.', 'వరంగల్ ఒక ఊరి పేరు.'],
    ]),
  ]),
  obj('ts3.en.ch4.things', ['School things and a pencil rhyme', 'బడి వస్తువులు, పెన్సిల్ పాట'], [
    p('A pencil, a crayon, a ruler, a bag — these are school things. Let\'s learn their names and sing our own pencil rhyme.', 'పెన్సిల్, క్రేయాన్, స్కేలు, సంచి — ఇవి బడి వస్తువులు. వాటి పేర్లు నేర్చుకుని మన పెన్సిల్ పాట పాడుదాం.'),
    keys('My little pencil, sharp and neat,', 'Draws a mouse with tiny feet.', 'It writes my name, it draws the sun,', 'Then back in the box — my work is done!'),
    photo('🖍️', L('Crayons are for colouring.', 'క్రేయాన్లతో రంగులు వేస్తాం.')),
    tip('Point to each thing on your desk and say its name in English.', 'నీ బల్ల మీది ప్రతి వస్తువును చూపిస్తూ దాని ఇంగ్లీష్ పేరు చెప్పు.'),
  ], [
    exb(['What do we use to draw straight lines?', 'సరళ రేఖలు గీయడానికి ఏమి వాడతాం?'], [['It is long and flat with numbers. 📏', 'పొడవుగా, చదునుగా, అంకెలతో ఉంటుంది. 📏']], ['a ruler', 'ruler (స్కేలు)']),
    exb(['Finish the rhyme: "sharp and neat … tiny ___"', 'పాట పూర్తి చేయి: "sharp and neat … tiny ___"'], [['It must rhyme with "neat".', '"neat" తో ప్రాస కలవాలి.']], ['feet', 'feet (పాదాలు)']),
  ], [
    picWord('pic', SCHOOL),
    finish('rhyme', [
      ['My little pencil, sharp and neat, / Draws a mouse with tiny ___.', 'feet', 'neat', ['hands', 'toes', 'legs'], 'నా చిన్న పెన్సిల్ పదునుగా, చక్కగా ఉంది, చిన్న పాదాలతో ఎలుకను గీస్తుంది.'],
      ['It writes my name, it draws the sun, / Then back in the box — my work is ___!', 'done', 'sun', ['over', 'finished', 'good'], 'అది నా పేరు రాస్తుంది, సూర్యుడిని గీస్తుంది, తర్వాత పెట్టెలోకి — నా పని అయిపోయింది!'],
      ['A little mouse lived in a house, / As quiet as a tiny ___.', 'mouse', 'house', ['cat', 'dog', 'bird'], 'ఒక చిన్న ఎలుక ఇంట్లో ఉండేది, చిన్న ఎలుకంత నిశ్శబ్దంగా.'],
      ['Red crayon, blue crayon, yellow and green, / The brightest colours I have ___!', 'seen', 'green', ['found', 'got', 'liked'], 'ఎరుపు, నీలం, పసుపు, ఆకుపచ్చ క్రేయాన్లు — నేను చూసిన అందమైన రంగులు!'],
      ['The bell goes ring, ring, ring, / Let us all stand up and ___.', 'sing', 'ring', ['dance', 'read', 'talk'], 'గంట మోగుతోంది, అందరం లేచి పాడదాం.'],
      ['My ruler is long, my ruler is straight, / I draw a line and the line is ___.', 'great', 'straight', ['long', 'thin', 'nice'], 'నా స్కేలు పొడవుగా, నిటారుగా ఉంది, నేను గీసిన గీత అద్భుతం.'],
    ]),
    missing('spell', SCHOOL, 2),
  ]),
], 'Unit 4: the Reader\'s main "Mouse and the Pencil" story is not summarised; the Lion and the Mouse is retold from the public-domain Aesop fable.');

// ================================================================ 5. The Little Red Hen
const u5 = unit(5, ['Unit 5 · The Little Red Hen', 'యూనిట్ 5 · చిన్న ఎర్ర కోడి'], [
  obj('ts3.en.ch5.story', ['The Little Red Hen: who will help?', 'చిన్న ఎర్ర కోడి: ఎవరు సహాయం చేస్తారు?'], [
    p('"The Little Red Hen" is an old folk tale. Here it is in our own words. A little red hen found some wheat seeds. "Who will help me plant them?" she asked. "Not I," said the cat. "Not I," said the dog. "Not I," said the duck. So she planted them herself.', '"చిన్న ఎర్ర కోడి" ఒక పాత జానపద కథ. మన మాటల్లో: ఒక చిన్న ఎర్ర కోడికి కొన్ని గోధుమ గింజలు దొరికాయి. "వీటిని నాటడానికి ఎవరు సహాయం చేస్తారు?" అని అడిగింది. "నేను కాదు" అంది పిల్లి. "నేను కాదు" అంది కుక్క. "నేను కాదు" అంది బాతు. కాబట్టి తనే నాటింది.'),
    p('She asked for help to cut the wheat, to take it to the mill and to bake the bread. Each time they said "Not I!" At last the bread was ready. "Who will help me eat it?" "I will!" they all shouted. "No," said the hen. "I did all the work, so I will eat it with my chicks."', 'గోధుమ కోయడానికి, మిల్లుకు తీసుకెళ్ళడానికి, రొట్టె కాల్చడానికి సహాయం అడిగింది. ప్రతిసారీ "నేను కాదు!" అన్నారు. చివరికి రొట్టె తయారైంది. "తినడానికి ఎవరు సహాయం చేస్తారు?" "నేను!" అని అందరూ అరిచారు. "కాదు, పని అంతా నేనే చేశాను, నా పిల్లలతో కలిసి నేనే తింటాను" అంది కోడి.'),
    photo('🐔', L('The little red hen worked hard.', 'చిన్న ఎర్ర కోడి కష్టపడి పనిచేసింది.')),
    keys('plant → cut → take to the mill → bake → eat', 'Lesson: those who help share the reward. Be helpful!'),
    tip('Read it with friends: one is the hen, others say "Not I!" together.', 'స్నేహితులతో చదువు: ఒకరు కోడి, మిగతావాళ్ళు కలిసి "Not I!" అంటారు.'),
  ], [
    exb(['What did the hen find?', 'కోడికి ఏమి దొరికింది?'], [['At the very start of the story…', 'కథ మొదట్లో…']], ['some wheat seeds', 'కొన్ని గోధుమ గింజలు']),
    exb(['Why did the hen not share the bread?', 'కోడి రొట్టెను ఎందుకు పంచలేదు?'], [['Nobody helped her with the work.', 'పనిలో ఎవరూ సహాయం చేయలేదు.']], ['Because she did all the work alone.', 'పని అంతా ఒంటరిగా చేసింది కాబట్టి.']),
  ], [
    orderT('seq', ['Put the hen\'s work in order', 'కోడి పనులను వరుసలో పెట్టు'], ['First the seeds go into the ground.', 'ముందు గింజలు నేలలోకి వెళ్తాయి.'], [
      ['plant the seeds', 'cut the wheat', 'take it to the mill', 'bake the bread', 'eat the bread'],
      ['The hen found seeds.', 'She planted them.', 'The wheat grew tall.', 'She cut the wheat.'],
      ['She took the wheat to the mill.', 'The miller made flour.', 'She baked bread.'],
      ['The bread was ready.', 'Everyone said, "I will eat!"', 'The hen said, "No."'],
      ['The hen asked for help.', 'The cat said, "Not I."', 'The hen did it herself.'],
    ], ' → '),
    mcq('read', ['Remember the little red hen.', 'చిన్న ఎర్ర కోడిని గుర్తు చేసుకో.'], [
      ['What did the hen find?', 'కోడికి ఏమి దొరికింది?', 'wheat seeds', ['a coin', 'a toy', 'an egg'], 'She found wheat seeds.', 'గోధుమ గింజలు దొరికాయి.'],
      ['What did the cat, dog and duck always say?', 'పిల్లి, కుక్క, బాతు ఎప్పుడూ ఏమన్నాయి?', 'Not I!', ['Yes, I will!', 'Thank you!', 'Good morning!'], 'They never helped.', 'అవి ఎప్పుడూ సహాయం చేయలేదు.'],
      ['Who did all the work?', 'పని అంతా ఎవరు చేశారు?', 'the little red hen', ['the cat', 'the dog', 'the duck'], 'The hen did everything herself.', 'కోడే అన్నీ చేసింది.'],
      ['Where is wheat made into flour?', 'గోధుమ పిండిగా ఎక్కడ మారుతుంది?', 'at the mill', ['at school', 'in the river', 'in the tree'], 'A mill grinds wheat into flour.', 'మిల్లులో గోధుమను పిండి చేస్తారు.'],
      ['Who ate the bread?', 'రొట్టె ఎవరు తిన్నారు?', 'the hen and her chicks', ['the cat', 'the dog and the duck', 'nobody'], 'She shared it with her chicks.', 'తన పిల్లలతో కలిసి తింది.'],
      ['What does the story teach?', 'ఈ కథ ఏమి నేర్పుతుంది?', 'Help others with the work.', ['Never plant seeds.', 'Always sleep.', 'Eat other people\'s food.'], 'Those who help share the reward.', 'సహాయం చేసినవాళ్ళే ఫలితం పంచుకుంటారు.'],
    ]),
  ]),
  obj('ts3.en.ch5.steps', ['Writing steps: First, Next, Then, Last', 'దశలు రాయడం: First, Next, Then, Last'], [
    p('A recipe tells us how to make food, step by step. We use order words: First, Next, Then, Last. Here is a recipe for a fruit salad.', 'వంటకం (recipe) ఆహారం ఎలా తయారు చేయాలో దశలవారీగా చెబుతుంది. వరుస పదాలు వాడతాం: First (ముందు), Next (తర్వాత), Then (ఆ తర్వాత), Last (చివరగా). ఇది ఫ్రూట్ సలాడ్ వంటకం.'),
    keys('First, wash the fruits.', 'Next, cut them into small pieces.', 'Then, put them in a bowl and mix.', 'Last, eat and enjoy!'),
    photo('🍉', L('Watermelon, banana and mango make a yummy fruit salad.', 'పుచ్చకాయ, అరటి, మామిడి — రుచికరమైన ఫ్రూట్ సలాడ్.')),
    tip('Always wash your hands first! Ask an adult to help when you use a knife.', 'ముందు ఎప్పుడూ చేతులు కడుక్కో! కత్తి వాడేటప్పుడు పెద్దవాళ్ళ సహాయం తీసుకో.'),
  ], [
    exb(['Which comes first: "cut the fruits" or "wash the fruits"?', 'ముందు ఏది: "cut the fruits" లేదా "wash the fruits"?'], [['We clean before we cut.', 'కోయడానికి ముందు కడుగుతాం.']], ['Wash the fruits.', 'Wash the fruits (పండ్లు కడుగు).']),
    exb(['Which order word goes with the final step?', 'చివరి దశకు ఏ వరుస పదం?'], [['First, Next, Then, …', 'First, Next, Then, …']], ['Last', 'Last (చివరగా)']),
  ], [
    orderT('recipe', ['Put the steps in order', 'దశలను వరుసలో పెట్టు'], ['What must you do before anything else?', 'అన్నిటికంటే ముందు ఏమి చేయాలి?'], [
      ['Wash the fruits.', 'Cut them into pieces.', 'Mix them in a bowl.', 'Eat and enjoy!'],
      ['Boil the water.', 'Add tea leaves.', 'Add milk and sugar.', 'Pour the tea into cups.'],
      ['Take a glass of water.', 'Squeeze a lemon into it.', 'Add sugar and stir.', 'Drink the lemonade.'],
      ['Peel the banana.', 'Cut it into slices.', 'Put them on a plate.', 'Share with friends.'],
      ['Wash your hands.', 'Sit down.', 'Eat your food.', 'Wash your plate.'],
      ['Wash the rice.', 'Put it in the pot with water.', 'Cook it.', 'Serve it hot.'],
    ], ' → '),
    fill('word', ['First → Next → Then → Last', 'First (ముందు) → Next (తర్వాత) → Then (ఆ తర్వాత) → Last (చివరగా)'], [
      ['___, wash your hands. (step 1)', 'First', ['Last', 'Then', 'Next'], 'Step 1 begins with "First".', 'మొదటి దశ "First" తో.'],
      ['___, eat and enjoy! (final step)', 'Last', ['First', 'Next', 'Then'], 'The final step begins with "Last".', 'చివరి దశ "Last" తో.'],
      ['First, boil water. ___, add tea leaves. (step 2)', 'Next', ['Last', 'First', 'Before'], 'Step 2 uses "Next".', 'రెండో దశ "Next" తో.'],
      ['First, take a glass. Next, add lemon. ___, add sugar. (step 3)', 'Then', ['First', 'Last', 'Before'], 'Step 3 uses "Then".', 'మూడో దశ "Then" తో.'],
      ['___, peel the banana. (step 1)', 'First', ['Last', 'Then', 'Next'], 'Step 1 begins with "First".', 'మొదటి దశ "First" తో.'],
      ['First, wash. Next, cut. Then, mix. ___, serve. (final step)', 'Last', ['First', 'Next', 'Before'], 'The final step uses "Last".', 'చివరి దశ "Last" తో.'],
    ]),
  ]),
  obj('ts3.en.ch5.action', ['Action words and doing sentences', 'పని పదాలు, ఆజ్ఞా వాక్యాలు'], [
    p('Action words tell us what someone does: plant, cut, bake, eat, wash, mix, run, jump. In a recipe we start with the action word to tell someone what to do: "Wash the fruits." "Mix them well."', 'పని పదాలు (action words) ఎవరు ఏమి చేస్తున్నారో చెబుతాయి: plant (నాటు), cut (కోయి), bake (కాల్చు), eat (తిను), wash (కడుగు), mix (కలుపు), run, jump. వంటకంలో ఏమి చేయాలో చెప్పడానికి పని పదంతో మొదలుపెడతాం: "Wash the fruits." "Mix them well."'),
    photo('🥄', L('Stir with a spoon. "Stir" is an action word.', 'చెంచాతో కలుపు. "Stir" ఒక పని పదం.')),
    keys('plant · water · cut · wash · mix · stir · pour · bake · eat', 'Sit down. Open your book. Close the door.'),
    tip('Play "Teacher says": "Teacher says jump!" — do the action.', '"Teacher says" ఆట: "Teacher says jump!" — ఆ పని చేయి.'),
  ], [
    exb(['Find the action word: "The hen plants the seeds."', 'పని పదం కనుక్కో: "The hen plants the seeds."'], [['What does the hen do? She plants.', 'కోడి ఏమి చేస్తుంది? నాటుతుంది.']], ['plants', 'plants (నాటుతుంది)']),
    exb(['Make a doing sentence: (open) ___ your book.', 'ఆజ్ఞా వాక్యం: (open) ___ your book.'], [['Start with the action word, capital O.', 'పని పదంతో మొదలు, పెద్ద O.']], ['Open your book.', 'Open your book. (నీ పుస్తకం తెరువు.)']),
  ], [
    tapT('tap', ['Tap the action words', 'పని పదాలను నొక్కు'], [
      ['cut', true], ['bake', true], ['plant', true], ['eat', true], ['wash', true], ['mix', true], ['jump', true],
      ['hen', false], ['bread', false], ['red', false], ['wheat', false], ['little', false],
    ], ['Action words tell what someone does.', 'పని పదాలు ఎవరు ఏమి చేస్తారో చెబుతాయి.']),
    fill('fill', ['Which action fits the picture and the sentence?', 'బొమ్మకు, వాక్యానికి ఏ పని సరిపోతుంది?'], [
      ['🥄 ___ the milk with a spoon.', 'Stir', ['Cut', 'Plant', 'Sleep'], 'We stir with a spoon.', 'చెంచాతో కలుపుతాం (stir).'],
      ['🌱 ___ the seeds in the soil.', 'Plant', ['Bake', 'Drink', 'Read'], 'Seeds are planted in soil.', 'గింజలను మట్టిలో నాటుతాం.'],
      ['💧 ___ your hands with soap.', 'Wash', ['Eat', 'Cut', 'Throw'], 'We wash hands with soap.', 'సబ్బుతో చేతులు కడుగుతాం.'],
      ['🍉 ___ the watermelon with a knife.', 'Cut', ['Stir', 'Wash', 'Sing'], 'A knife is for cutting.', 'కత్తి కోయడానికి.'],
      ['🥛 ___ the milk into a glass.', 'Pour', ['Plant', 'Cut', 'Bake'], 'Liquids are poured.', 'పాలను గ్లాసులో పోస్తాం.'],
      ['🍎 ___ the apple. It is tasty!', 'Eat', ['Plant', 'Pour', 'Wash'], 'We eat tasty food.', 'రుచికరమైనది తింటాం.'],
    ]),
  ]),
]);

// ================================================================ 6. Mary and the Three Bears
const u6 = unit(6, ['Unit 6 · Mary and the Three Bears', 'యూనిట్ 6 · మేరీ, మూడు ఎలుగుబంట్లు'], [
  obj('ts3.en.ch6.bears', ['Big, middle-sized and small', 'పెద్దది, మధ్యది, చిన్నది'], [
    p('Stories about three bears are full of sets of three: a big Father Bear, a middle-sized Mother Bear and a small Baby Bear — with three bowls, three chairs and three beds! Here is our own little bear story.', 'మూడు ఎలుగుబంట్ల కథల్లో అన్నీ మూడేసి ఉంటాయి: పెద్ద నాన్న ఎలుగు, మధ్యస్థ అమ్మ ఎలుగు, చిన్న బుజ్జి ఎలుగు — మూడు గిన్నెలు, మూడు కుర్చీలు, మూడు మంచాలు! ఇది మన స్వంత చిన్న ఎలుగు కథ.'),
    p('Three bears lived in a little house in the forest. Father Bear had a big bowl, Mother Bear had a middle-sized bowl and Baby Bear had a small bowl. One morning the porridge was too hot, so they went for a walk. A girl came in, tasted the porridge and fell asleep in Baby Bear\'s small bed. When the bears came home, the girl woke up, said "Sorry!" and ran home.', 'మూడు ఎలుగుబంట్లు అడవిలో ఒక చిన్న ఇంట్లో ఉండేవి. నాన్నకు పెద్ద గిన్నె, అమ్మకు మధ్యస్థ గిన్నె, బుజ్జికి చిన్న గిన్నె. ఒక ఉదయం గంజి చాలా వేడిగా ఉంది, అందుకే నడకకు వెళ్ళాయి. ఒక అమ్మాయి లోపలికి వచ్చి గంజి రుచి చూసి, బుజ్జి ఎలుగు చిన్న మంచంలో నిద్రపోయింది. ఎలుగులు తిరిగి రాగానే అమ్మాయి లేచి "సారీ!" అని ఇంటికి పరిగెత్తింది.'),
    photo('🐻', L('A bear lives in the forest.', 'ఎలుగుబంటి అడవిలో ఉంటుంది.')),
    keys('Father Bear — big', 'Mother Bear — middle-sized', 'Baby Bear — small', 'Lesson: never enter someone\'s house without asking.'),
    tip('Read the Reader\'s story of Mary. Then compare: what is the same as our story?', 'పాఠ్యపుస్తకంలో మేరీ కథ చదువు. మన కథతో పోల్చు: ఏమి ఒకేలా ఉంది?'),
  ], [
    exb(['Whose bowl was small?', 'ఎవరి గిన్నె చిన్నది?'], [['The smallest bear has the smallest things.', 'అతి చిన్న ఎలుగుకు అతి చిన్న వస్తువులు.']], ['Baby Bear\'s', 'బుజ్జి ఎలుగుది']),
    exb(['Why did the bears go for a walk?', 'ఎలుగులు నడకకు ఎందుకు వెళ్ళాయి?'], [['The porridge was too hot to eat.', 'గంజి తినలేనంత వేడిగా ఉంది.']], ['To let the porridge cool.', 'గంజి చల్లారడానికి.']),
  ], [
    mcq('read', ['Remember our three bears story.', 'మన మూడు ఎలుగుల కథను గుర్తు చేసుకో.'], [
      ['Where did the three bears live?', 'మూడు ఎలుగులు ఎక్కడ ఉండేవి?', 'in a little house in the forest', ['in a big city', 'on a boat', 'in a school'], 'Their house was in the forest.', 'వాటి ఇల్లు అడవిలో ఉంది.'],
      ['Who had the big bowl?', 'పెద్ద గిన్నె ఎవరిది?', 'Father Bear', ['Baby Bear', 'Mother Bear', 'the girl'], 'Father Bear is the biggest.', 'నాన్న ఎలుగు అందరికంటే పెద్దది.'],
      ['Why did the bears go out?', 'ఎలుగులు ఎందుకు బయటకు వెళ్ళాయి?', 'The porridge was too hot.', ['It was raining.', 'They were sleepy.', 'They wanted to swim.'], 'Hot porridge needs time to cool.', 'వేడి గంజి చల్లారడానికి సమయం కావాలి.'],
      ['Where did the girl fall asleep?', 'అమ్మాయి ఎక్కడ నిద్రపోయింది?', 'in Baby Bear\'s bed', ['on the roof', 'in the garden', 'under a tree'], 'She slept in the small bed.', 'చిన్న మంచంలో నిద్రపోయింది.'],
      ['What did the girl say when she woke up?', 'లేచాక అమ్మాయి ఏమంది?', 'Sorry!', ['Hello, bears!', 'Give me more!', 'Good night!'], 'She knew she had done wrong.', 'తప్పు చేశానని తెలిసింది.'],
      ['What is the lesson?', 'నీతి ఏమిటి?', 'Do not enter a house without asking.', ['Always eat hot food.', 'Bears are scary.', 'Sleep all day.'], 'We must ask before going into someone\'s home.', 'ఎవరి ఇంట్లోకైనా అడిగి వెళ్ళాలి.'],
    ]),
    matchT('three', ['Match each bear to its size', 'ప్రతి ఎలుగును దాని పరిమాణంతో జత చేయి'], ['Father is biggest, Baby is smallest.', 'నాన్న అతి పెద్ద, బుజ్జి అతి చిన్న.'], [
      ['Father Bear', 'big'], ['Mother Bear', 'middle-sized'], ['Baby Bear', 'small'], ['an elephant', 'very big'], ['an ant', 'very small'],
    ], 3),
  ]),
  obj('ts3.en.ch6.compare', ['Comparing: big, bigger, biggest', 'పోల్చడం: big, bigger, biggest'], [
    p('When we compare two things we add -er: small → smaller, tall → taller. When we compare three or more, we add -est: small → smallest. Short words like big and hot double the last letter: big → bigger → biggest.', 'రెండింటిని పోల్చినప్పుడు -er చేరుస్తాం: small → smaller, tall → taller. మూడు లేదా ఎక్కువ పోల్చినప్పుడు -est: small → smallest. big, hot లాంటి చిన్న పదాల్లో చివరి అక్షరం రెండుసార్లు: big → bigger → biggest.'),
    photo('🐘', L('An elephant is bigger than a bear. It is the biggest animal here.', 'ఏనుగు ఎలుగు కంటే పెద్దది. ఇక్కడ అదే అతి పెద్ద జంతువు.')),
    keys('small → smaller → smallest', 'tall → taller → tallest', 'big → bigger → biggest', 'hot → hotter → hottest', 'Two things: -er than · Three or more: the -est'),
    tip('Line up three pencils. Say: "This is long. This is longer. This is the longest!"', 'మూడు పెన్సిళ్ళు వరుసలో పెట్టు. "This is long. This is longer. This is the longest!" అని చెప్పు.'),
  ], [
    exb(['Father Bear is ___ (big) than Baby Bear.', 'Father Bear is ___ (big) than Baby Bear.'], [['Two bears → -er.', 'రెండు ఎలుగులు → -er.'], ['big → bigger (double g).', 'big → bigger (g రెండుసార్లు).']], ['bigger', 'bigger']),
    exb(['Baby Bear has the ___ (small) bed of all three.', 'Baby Bear has the ___ (small) bed of all three.'], [['Three beds → -est.', 'మూడు మంచాలు → -est.']], ['smallest', 'smallest']),
  ], [
    fill('fill', ['Two things → -er. Three or more → -est.', 'రెండు → -er. మూడు లేదా ఎక్కువ → -est.'], [
      ['A giraffe is ___ than a goat.', 'taller', ['tallest', 'tall', 'more tall'], 'Comparing two animals → taller.', 'రెండు జంతువుల పోలిక → taller.'],
      ['The elephant is the ___ animal in the zoo.', 'biggest', ['bigger', 'big', 'bigest'], 'Comparing all animals → biggest.', 'అన్ని జంతువుల పోలిక → biggest.'],
      ['An ant is ___ than a cat.', 'smaller', ['smallest', 'small', 'more small'], 'Comparing two → smaller.', 'రెండింటి పోలిక → smaller.'],
      ['The sun is ___ than the moon.', 'hotter', ['hottest', 'hoter', 'hot'], 'Two things, and hot doubles its t.', 'రెండు వస్తువులు; hot లో t రెండుసార్లు.'],
      ['Baby Bear is the ___ of the three bears.', 'smallest', ['smaller', 'small', 'more small'], 'Three bears → smallest.', 'మూడు ఎలుగులు → smallest.'],
      ['My bag is ___ than your bag.', 'bigger', ['biggest', 'biger', 'big'], 'Two bags → bigger.', 'రెండు సంచులు → bigger.'],
      ['Ravi is the ___ boy in our class.', 'tallest', ['taller', 'tall', 'more tall'], 'The whole class → tallest.', 'తరగతి మొత్తం → tallest.'],
    ], 2),
    mcq('opp', ['Opposites mean the very different thing.', 'వ్యతిరేక పదాలు పూర్తిగా వేరైన అర్థం ఇస్తాయి.'], [
      ['The opposite of "big" is:', '"big" కి వ్యతిరేకం:', 'small', ['tall', 'large', 'huge'], 'big ↔ small', 'big (పెద్ద) ↔ small (చిన్న)'],
      ['The opposite of "hot" is:', '"hot" కి వ్యతిరేకం:', 'cold', ['warm', 'sunny', 'fire'], 'hot ↔ cold', 'hot (వేడి) ↔ cold (చల్లని)'],
      ['The opposite of "soft" is:', '"soft" కి వ్యతిరేకం:', 'hard', ['smooth', 'fluffy', 'small'], 'soft ↔ hard', 'soft (మెత్తని) ↔ hard (గట్టి)'],
      ['The opposite of "tall" is:', '"tall" కి వ్యతిరేకం:', 'short', ['long', 'big', 'high'], 'tall ↔ short', 'tall (పొడవు) ↔ short (పొట్టి)'],
      ['The opposite of "full" is:', '"full" కి వ్యతిరేకం:', 'empty', ['heavy', 'big', 'round'], 'full ↔ empty', 'full (నిండు) ↔ empty (ఖాళీ)'],
      ['The opposite of "happy" is:', '"happy" కి వ్యతిరేకం:', 'sad', ['glad', 'kind', 'funny'], 'happy ↔ sad', 'happy (సంతోషం) ↔ sad (బాధ)'],
    ]),
  ]),
  obj('ts3.en.ch6.village', ['Extra reading: away from the city', 'అదనపు పఠనం: పట్నానికి దూరంగా'], [
    p('Life away from the city, in a village, is different. A village has fields, a pond, cows and buffaloes, a well and a temple. A city has tall buildings, many buses and cars, shops and a lot of noise. Both are our homes!', 'పట్నానికి దూరంగా గ్రామంలో జీవితం వేరుగా ఉంటుంది. గ్రామంలో పొలాలు, చెరువు, ఆవులు, గేదెలు, బావి, గుడి ఉంటాయి. పట్నంలో ఎత్తైన భవనాలు, చాలా బస్సులు, కార్లు, దుకాణాలు, చాలా శబ్దం ఉంటాయి. రెండూ మనవే!'),
    photo('🏘️', L('A village: small houses, trees and fields.', 'గ్రామం: చిన్న ఇళ్ళు, చెట్లు, పొలాలు.')),
    keys('village: field, pond, farmer, cow, well, fresh air', 'city: tall building, traffic, shop, bus, noise'),
    tip('Talk about it: Do you live in a village or a city? What do you like about it?', 'మాట్లాడు: నువ్వు గ్రామంలో ఉంటావా, పట్నంలోనా? అక్కడ నీకు ఏమి ఇష్టం?'),
  ], [
    exb(['Where would you see a farmer ploughing a field?', 'పొలం దున్నే రైతు ఎక్కడ కనిపిస్తాడు?'], [['Fields are in villages.', 'పొలాలు గ్రామాల్లో ఉంటాయి.']], ['in a village', 'గ్రామంలో']),
    exb(['Where are there many tall buildings?', 'ఎత్తైన భవనాలు ఎక్కువగా ఎక్కడ?'], [['Think of Hyderabad.', 'హైదరాబాద్ గుర్తు చేసుకో.']], ['in a city', 'పట్నంలో']),
  ], [
    tapT('tap', ['Tap the things you often see in a village', 'గ్రామంలో తరచుగా కనిపించేవి నొక్కు'], [
      ['fields', true], ['a pond', true], ['cows', true], ['a well', true], ['a farmer', true], ['fresh air', true],
      ['a metro train', false], ['very tall buildings', false], ['heavy traffic', false],
    ], ['Villages have fields, ponds, wells, cows and farmers.', 'గ్రామాల్లో పొలాలు, చెరువులు, బావులు, ఆవులు, రైతులు ఉంటారు.']),
    picWord('pic', [
      ['🧑‍🌾', 'farmer', 'రైతు'], ['🐄', 'cow', 'ఆవు'], ['🐃', 'buffalo', 'గేదె'], ['🌾', 'paddy', 'వరి'], ['🚜', 'tractor', 'ట్రాక్టర్'],
      ['🏢', 'building', 'భవనం'], ['🛕', 'temple', 'గుడి'], ['🌴', 'palm tree', 'తాటి చెట్టు'],
    ]),
  ]),
], 'Unit 6: our own three-bears story is used; the Reader\'s "Mary" version is not summarised — teacher should add questions on the Reader text.');

// ================================================================ 7. The Animal School
const u7 = unit(7, ['Unit 7 · The Animal School', 'యూనిట్ 7 · జంతువుల బడి'], [
  obj('ts3.en.ch7.story', ['Everyone is good at something', 'ప్రతి ఒక్కరూ ఏదో ఒకదానిలో నేర్పరి'], [
    p('In this unit, animals go to school and we see what each one does best. Here is our own little story. In the forest school, the teacher Owl gave a test: run, swim, climb and fly. The deer ran the fastest. The fish swam the best. The monkey climbed the highest. The parrot flew over the trees. Nobody could do everything — but everyone was good at something!', 'ఈ పాఠంలో జంతువులు బడికి వెళ్తాయి, ఒక్కొక్కటి ఏది బాగా చేస్తుందో చూస్తాం. మన స్వంత కథ: అడవి బడిలో గుడ్లగూబ టీచర్ పరీక్ష పెట్టింది: పరుగు, ఈత, ఎక్కడం, ఎగరడం. జింక అందరికంటే వేగంగా పరిగెత్తింది. చేప బాగా ఈదింది. కోతి అందరికంటే ఎత్తుకు ఎక్కింది. చిలుక చెట్ల మీదుగా ఎగిరింది. ఎవరూ అన్నీ చేయలేకపోయారు — కానీ ప్రతి ఒక్కరూ ఏదో ఒకదానిలో నేర్పరి!'),
    photo('🦉', L('Teacher Owl is wise.', 'గుడ్లగూబ టీచర్ తెలివైనది.')),
    keys('deer — runs fast', 'fish — swims', 'monkey — climbs', 'parrot — flies', 'Lesson: we are all different, and that is good!'),
    tip('Tell a friend one thing you are good at, and one thing your friend is good at.', 'నువ్వు బాగా చేసే ఒక పని, నీ స్నేహితుడు బాగా చేసే ఒక పని చెప్పు.'),
  ], [
    exb(['Who was the teacher in our story?', 'మన కథలో టీచర్ ఎవరు?'], [['A wise bird with big eyes.', 'పెద్ద కళ్ళ తెలివైన పక్షి.']], ['Owl', 'గుడ్లగూబ']),
    exb(['What was the monkey best at?', 'కోతి దేనిలో నేర్పరి?'], [['Monkeys live in trees.', 'కోతులు చెట్లపై ఉంటాయి.']], ['climbing', 'ఎక్కడం']),
  ], [
    mcq('read', ['Remember the forest school.', 'అడవి బడిని గుర్తు చేసుకో.'], [
      ['Who ran the fastest?', 'అందరికంటే వేగంగా ఎవరు పరిగెత్తారు?', 'the deer', ['the fish', 'the owl', 'the tortoise'], 'Deer are fast runners.', 'జింకలు వేగంగా పరిగెత్తుతాయి.'],
      ['Who swam the best?', 'బాగా ఎవరు ఈదారు?', 'the fish', ['the monkey', 'the parrot', 'the deer'], 'Fish live in water.', 'చేపలు నీటిలో ఉంటాయి.'],
      ['Who flew over the trees?', 'చెట్ల మీదుగా ఎవరు ఎగిరారు?', 'the parrot', ['the fish', 'the deer', 'the monkey'], 'Birds can fly.', 'పక్షులు ఎగరగలవు.'],
      ['Could anyone do everything?', 'ఎవరైనా అన్నీ చేయగలిగారా?', 'No, nobody could.', ['Yes, the fish could.', 'Yes, everyone could.', 'Only the deer.'], 'Nobody could do everything.', 'ఎవరూ అన్నీ చేయలేకపోయారు.'],
      ['What does the story teach?', 'కథ ఏమి నేర్పుతుంది?', 'Everyone is good at something.', ['Only fish are clever.', 'Never go to school.', 'Owls are lazy.'], 'We all have different strengths.', 'అందరికీ వేర్వేరు బలాలు ఉంటాయి.'],
    ]),
    matchT('best', ['Match each animal to what it does best', 'ప్రతి జంతువును అది బాగా చేసే పనితో జత చేయి'], ['Think of where each animal lives.', 'ప్రతి జంతువు ఎక్కడ ఉంటుందో ఆలోచించు.'], [
      ['deer', 'runs'], ['fish', 'swims'], ['monkey', 'climbs'], ['parrot', 'flies'], ['frog', 'hops'], ['tortoise', 'crawls slowly'],
    ]),
  ]),
  obj('ts3.en.ch7.can', ['Can and cannot', 'Can (చేయగలదు), cannot (చేయలేదు)'], [
    p('We use "can" for things we are able to do, and "cannot" (can\'t) for things we are not able to do. "A fish can swim. A fish cannot climb." "Can a bird fly? Yes, it can." "Can a cow fly? No, it cannot."', 'చేయగలిగే పనులకు "can", చేయలేని పనులకు "cannot" (can\'t) వాడతాం. "A fish can swim. A fish cannot climb." (చేప ఈదగలదు, ఎక్కలేదు.) "Can a bird fly? Yes, it can." "Can a cow fly? No, it cannot."'),
    photo('🐟', L('A fish can swim. It cannot walk.', 'చేప ఈదగలదు. నడవలేదు.')),
    keys('A bird can fly.', 'A fish cannot climb.', 'Can a dog bark? — Yes, it can.', 'Can a cat fly? — No, it cannot.'),
    tip('Play "Can or Cannot?": say an animal and an action; friends shout "can!" or "cannot!"', '"Can or Cannot?" ఆట: ఒక జంతువు, ఒక పని చెప్పు; స్నేహితులు "can!" లేదా "cannot!" అని అరవాలి.'),
  ], [
    exb(['An elephant ___ fly.', 'An elephant ___ fly.'], [['Elephants have no wings.', 'ఏనుగులకు రెక్కలు లేవు.']], ['cannot', 'cannot (ఎగరలేదు)']),
    exb(['Can a monkey climb a tree?', 'Can a monkey climb a tree?'], [['Monkeys climb all day!', 'కోతులు రోజంతా ఎక్కుతాయి!']], ['Yes, it can.', 'Yes, it can. (అవును, ఎక్కగలదు.)']),
  ], [
    fill('fill', ['Is the animal able to do it? Yes → can. No → cannot.', 'ఆ జంతువు అది చేయగలదా? అవును → can. కాదు → cannot.'], [
      ['🐟 A fish ___ swim.', 'can', ['cannot'], 'Fish swim in water.', 'చేపలు నీటిలో ఈదుతాయి.'],
      ['🐟 A fish ___ climb a tree.', 'cannot', ['can'], 'Fish have no legs to climb.', 'చేపకు ఎక్కడానికి కాళ్ళు లేవు.'],
      ['🦜 A parrot ___ fly.', 'can', ['cannot'], 'Parrots have wings.', 'చిలుకకు రెక్కలు ఉన్నాయి.'],
      ['🐄 A cow ___ fly.', 'cannot', ['can'], 'Cows have no wings.', 'ఆవుకు రెక్కలు లేవు.'],
      ['🐒 A monkey ___ climb.', 'can', ['cannot'], 'Monkeys are great climbers.', 'కోతులు బాగా ఎక్కుతాయి.'],
      ['🐢 A tortoise ___ run fast.', 'cannot', ['can'], 'Tortoises are very slow.', 'తాబేలు చాలా నెమ్మది.'],
      ['🐸 A frog ___ jump.', 'can', ['cannot'], 'Frogs hop and jump.', 'కప్పలు దూకుతాయి.'],
      ['🐘 An elephant ___ fly.', 'cannot', ['can'], 'Elephants have no wings.', 'ఏనుగుకు రెక్కలు లేవు.'],
    ]),
    mcq('ask', ['Answer with "Yes, it can." or "No, it cannot."', '"Yes, it can." లేదా "No, it cannot." తో జవాబు చెప్పు.'], [
      ['Can a bird fly?', 'పక్షి ఎగరగలదా?', 'Yes, it can.', ['No, it cannot.'], 'Birds have wings.', 'పక్షులకు రెక్కలు ఉన్నాయి.'],
      ['Can a dog read?', 'కుక్క చదవగలదా?', 'No, it cannot.', ['Yes, it can.'], 'Dogs cannot read books.', 'కుక్కలు పుస్తకాలు చదవలేవు.'],
      ['Can a deer run fast?', 'జింక వేగంగా పరిగెత్తగలదా?', 'Yes, it can.', ['No, it cannot.'], 'Deer are very fast.', 'జింకలు చాలా వేగం.'],
      ['Can a fish walk?', 'చేప నడవగలదా?', 'No, it cannot.', ['Yes, it can.'], 'Fish have fins, not legs.', 'చేపలకు కాళ్ళు కాదు, రెక్కలు (fins) ఉంటాయి.'],
      ['Can a duck swim?', 'బాతు ఈదగలదా?', 'Yes, it can.', ['No, it cannot.'], 'Ducks swim in ponds.', 'బాతులు చెరువుల్లో ఈదుతాయి.'],
      ['Can a tortoise climb a tree?', 'తాబేలు చెట్టు ఎక్కగలదా?', 'No, it cannot.', ['Yes, it can.'], 'Tortoises cannot climb trees.', 'తాబేళ్ళు చెట్లు ఎక్కలేవు.'],
    ]),
  ]),
  obj('ts3.en.ch7.animals', ['Animal names and sounds', 'జంతువుల పేర్లు, అరుపులు'], [
    p('Let\'s learn more animal names, and the sounds they make. A lion roars. A dog barks. A cat mews. A cow moos. A duck quacks. A frog croaks. An owl hoots.', 'మరిన్ని జంతువుల పేర్లు, వాటి అరుపులు నేర్చుకుందాం. సింహం గర్జిస్తుంది (roars). కుక్క మొరుగుతుంది (barks). పిల్లి మియావ్ అంటుంది (mews). ఆవు అంబా అంటుంది (moos). బాతు క్వాక్ అంటుంది (quacks). కప్ప బెకబెక అంటుంది (croaks). గుడ్లగూబ హూ హూ అంటుంది (hoots).'),
    keys('Lion roars, dog barks,', 'Cat mews soft in the park,', 'Duck quacks, frog croaks,', 'Owl hoots — hoo, hoo! — at dark.'),
    photo('🦆', L('A duck quacks: quack, quack!', 'బాతు: క్వాక్, క్వాక్!')),
    tip('Make the animal sounds with your friends, then say the English word.', 'స్నేహితులతో జంతువుల అరుపులు చేసి, ఇంగ్లీష్ పదం చెప్పు.'),
  ], [
    exb(['What sound does a lion make?', 'సింహం ఏ శబ్దం చేస్తుంది?'], [['A loud, scary sound!', 'పెద్ద, భయపెట్టే శబ్దం!']], ['It roars.', 'It roars. (గర్జిస్తుంది.)']),
    exb(['Which animal croaks?', 'ఏ జంతువు croak చేస్తుంది?'], [['It lives near the pond and hops.', 'చెరువు దగ్గర ఉంటుంది, దూకుతుంది.']], ['a frog', 'కప్ప (frog)']),
  ], [
    picWord('pic', ANIMALS),
    matchT('sound', ['Match the animal to its sound', 'జంతువును దాని అరుపుతో జత చేయి'], ['Make the sound aloud. Which word fits?', 'శబ్దం పైకి చేసి చూడు. ఏ పదం సరిపోతుంది?'], [
      ['lion', 'roars'], ['dog', 'barks'], ['cat', 'mews'], ['cow', 'moos'], ['duck', 'quacks'], ['frog', 'croaks'], ['owl', 'hoots'],
    ]),
    meaning('mean', ANIMALS, 2),
  ]),
]);

// ================================================================ 8. Birbal Outwits the Cheat
const u8 = unit(8, ['Unit 8 · Birbal Outwits the Cheat', 'యూనిట్ 8 · మోసగాడిని ఓడించిన బీర్బల్'], [
  obj('ts3.en.ch8.story', ['Clever Birbal: a story in order', 'తెలివైన బీర్బల్: వరుసలో కథ'], [
    p('Birbal was a wise minister in Emperor Akbar\'s court. People came to him when someone cheated them. Here is our own short Birbal-style story.', 'బీర్బల్ చక్రవర్తి అక్బర్ ఆస్థానంలో తెలివైన మంత్రి. ఎవరైనా మోసం చేస్తే ప్రజలు అతని దగ్గరికి వచ్చేవారు. ఇది మన స్వంత చిన్న బీర్బల్ కథ.'),
    p('A farmer and a cheat both said, "This cow is mine!" Birbal asked each of them, "What did the cow eat this morning?" The cheat said, "Rice." The farmer said, "Green grass." Birbal looked in the cow\'s mouth: it was full of green grass! "The cow belongs to the farmer," said Birbal. The cheat was punished, and everyone praised Birbal.', 'ఒక రైతు, ఒక మోసగాడు ఇద్దరూ "ఈ ఆవు నాది!" అన్నారు. బీర్బల్ ఇద్దరినీ "ఈ ఉదయం ఆవు ఏమి తింది?" అని అడిగాడు. మోసగాడు "అన్నం" అన్నాడు. రైతు "పచ్చ గడ్డి" అన్నాడు. బీర్బల్ ఆవు నోట్లో చూశాడు: పచ్చ గడ్డి నిండి ఉంది! "ఆవు రైతుదే" అన్నాడు బీర్బల్. మోసగాడికి శిక్ష పడింది, అందరూ బీర్బల్‌ను మెచ్చుకున్నారు.'),
    photo('👑', L('Emperor Akbar and his wise minister Birbal.', 'అక్బర్ చక్రవర్తి, ఆయన తెలివైన మంత్రి బీర్బల్.')),
    keys('cheat = a person who tricks others', 'Birbal used a clever question to find the truth.', 'Lesson: the truth always comes out.'),
    tip('Read the Reader\'s Birbal story and draw its scenes in order — like a comic strip!', 'పాఠ్యపుస్తకంలోని బీర్బల్ కథ చదివి, దృశ్యాలను వరుసగా బొమ్మల కథలా గీయి!'),
  ], [
    exb(['What question did Birbal ask?', 'బీర్బల్ ఏ ప్రశ్న అడిగాడు?'], [['He wanted to know who really knew the cow.', 'ఆవు నిజంగా ఎవరికి తెలుసో తెలుసుకోవాలనుకున్నాడు.']], ['What did the cow eat this morning?', 'ఈ ఉదయం ఆవు ఏమి తింది?']),
    exb(['How did Birbal know the farmer was telling the truth?', 'రైతు నిజం చెబుతున్నాడని బీర్బల్‌కు ఎలా తెలిసింది?'], [['He looked in the cow\'s mouth.', 'ఆవు నోట్లో చూశాడు.'], ['It had green grass, as the farmer said.', 'రైతు చెప్పినట్టే పచ్చ గడ్డి ఉంది.']], ['The cow\'s mouth had green grass.', 'ఆవు నోట్లో పచ్చ గడ్డి ఉంది.']),
  ], [
    orderT('seq', ['Put the story scenes in order', 'కథ దృశ్యాలను వరుసలో పెట్టు'], ['The story begins with the quarrel.', 'కథ గొడవతో మొదలవుతుంది.'], [
      ['Two men said, "The cow is mine!"', 'Birbal asked a question.', 'Birbal looked in the cow\'s mouth.', 'The farmer got his cow.'],
      ['The cheat said, "Rice."', 'The farmer said, "Grass."', 'Birbal saw grass in the mouth.'],
      ['They came to Birbal.', 'Birbal listened to both.', 'He found the truth.', 'Everyone praised him.'],
      ['Birbal asked a question.', 'The cheat told a lie.', 'The cheat was punished.'],
      ['Two men quarrelled.', 'Birbal thought hard.', 'The truth came out.'],
    ], ' → '),
    mcq('read', ['Remember Birbal and the cow.', 'బీర్బల్, ఆవు కథ గుర్తు చేసుకో.'], [
      ['Who was Birbal?', 'బీర్బల్ ఎవరు?', 'a wise minister', ['a cheat', 'a farmer', 'a cow'], 'Birbal worked for Emperor Akbar.', 'బీర్బల్ అక్బర్ దగ్గర పనిచేసేవాడు.'],
      ['What did both men say?', 'ఇద్దరూ ఏమన్నారు?', '"This cow is mine!"', ['"Let\'s be friends!"', '"Good morning!"', '"I am hungry!"'], 'Both wanted the cow.', 'ఇద్దరూ ఆవు కావాలన్నారు.'],
      ['What did the farmer say the cow ate?', 'ఆవు ఏమి తిందని రైతు చెప్పాడు?', 'green grass', ['rice', 'sweets', 'bread'], 'The farmer knew his cow.', 'రైతుకు తన ఆవు గురించి తెలుసు.'],
      ['What is a cheat?', 'cheat అంటే ఏమిటి?', 'a person who tricks others', ['a kind king', 'a farm animal', 'a helper'], 'A cheat tells lies to get things.', 'మోసగాడు అబద్ధాలతో వస్తువులు పొందాలని చూస్తాడు.'],
      ['Which word describes Birbal?', 'బీర్బల్‌ను వివరించే పదం ఏది?', 'clever', ['foolish', 'lazy', 'rude'], 'He found the truth with one question.', 'ఒక్క ప్రశ్నతో నిజం కనుక్కున్నాడు.'],
      ['What is the lesson?', 'నీతి ఏమిటి?', 'The truth always comes out.', ['Cheating is fun.', 'Cows eat rice.', 'Never ask questions.'], 'Lies are found out in the end.', 'చివరికి అబద్ధాలు బయటపడతాయి.'],
    ]),
  ]),
  obj('ts3.en.ch8.qwords', ['Question words: who, what, where, when, why', 'ప్రశ్న పదాలు: who, what, where, when, why'], [
    p('Birbal found the truth by asking good questions. Question words help us ask: Who? (a person — ఎవరు), What? (a thing — ఏమిటి), Where? (a place — ఎక్కడ), When? (a time — ఎప్పుడు), Why? (a reason — ఎందుకు).', 'బీర్బల్ మంచి ప్రశ్నలు అడిగి నిజం కనుక్కున్నాడు. ప్రశ్న పదాలు: Who? (ఎవరు — వ్యక్తి), What? (ఏమిటి — వస్తువు), Where? (ఎక్కడ — ప్రదేశం), When? (ఎప్పుడు — సమయం), Why? (ఎందుకు — కారణం).'),
    photo('❓', L('Every question ends with a question mark.', 'ప్రతి ప్రశ్న ప్రశ్నార్థకంతో ముగుస్తుంది.')),
    keys('Who is Birbal? — a wise minister', 'What did the cow eat? — grass', 'Where does Akbar live? — in a palace', 'When do you go to school? — in the morning', 'Why are you happy? — because I won'),
    tip('Look at the answer you want. A person → Who. A place → Where. A time → When.', 'కావలసిన జవాబు చూడు. వ్యక్తి → Who. ప్రదేశం → Where. సమయం → When.'),
  ], [
    exb(['___ is your teacher? — Mrs. Rani.', '___ is your teacher? — Mrs. Rani.'], [['The answer is a person.', 'జవాబు ఒక వ్యక్తి.']], ['Who', 'Who (ఎవరు)']),
    exb(['___ do you live? — In Nizamabad.', '___ do you live? — In Nizamabad.'], [['The answer is a place.', 'జవాబు ఒక ప్రదేశం.']], ['Where', 'Where (ఎక్కడ)']),
  ], [
    fill('fill', ['Look at the answer: person → Who, thing → What, place → Where, time → When, reason → Why.', 'జవాబు చూడు: వ్యక్తి → Who, వస్తువు → What, ప్రదేశం → Where, సమయం → When, కారణం → Why.'], [
      ['___ is your best friend? — Kiran.', 'Who', ['Where', 'When', 'What'], 'Kiran is a person.', 'కిరణ్ ఒక వ్యక్తి.'],
      ['___ is in your bag? — A book.', 'What', ['Who', 'Where', 'When'], 'A book is a thing.', 'పుస్తకం ఒక వస్తువు.'],
      ['___ is the cow? — In the field.', 'Where', ['Who', 'When', 'Why'], 'In the field is a place.', 'పొలం ఒక ప్రదేశం.'],
      ['___ do you wake up? — At six o\'clock.', 'When', ['Where', 'Who', 'What'], 'Six o\'clock is a time.', 'ఆరు గంటలు ఒక సమయం.'],
      ['___ are you crying? — Because I fell down.', 'Why', ['Who', 'Where', 'What'], '"Because…" gives a reason.', '"Because…" కారణం చెబుతుంది.'],
      ['___ helped the farmer? — Birbal.', 'Who', ['What', 'When', 'Where'], 'Birbal is a person.', 'బీర్బల్ ఒక వ్యక్తి.'],
      ['___ is your birthday? — In June.', 'When', ['Who', 'Where', 'What'], 'June is a time.', 'జూన్ ఒక సమయం.'],
    ], 2),
    matchT('match', ['Match the question word to what it asks about', 'ప్రశ్న పదాన్ని అది అడిగే దానితో జత చేయి'], ['Who → person. Where → place.', 'Who → వ్యక్తి. Where → ప్రదేశం.'], [
      ['Who', 'a person (ఎవరు)'], ['What', 'a thing (ఏమిటి)'], ['Where', 'a place (ఎక్కడ)'], ['When', 'a time (ఎప్పుడు)'], ['Why', 'a reason (ఎందుకు)'],
    ]),
  ]),
  obj('ts3.en.ch8.pronouns', ['He, she, it, they', 'He, she, it, they (సర్వనామాలు)'], [
    p('Instead of saying a name again and again, we use small words called pronouns. For a boy or man: he. For a girl or woman: she. For an animal or thing: it. For more than one: they. "Birbal is wise. He is clever." "The cow is brown. It eats grass."', 'పేరును మళ్ళీ మళ్ళీ చెప్పకుండా సర్వనామాలు (pronouns) వాడతాం. అబ్బాయి/పురుషుడు: he (అతను). అమ్మాయి/స్త్రీ: she (ఆమె). జంతువు/వస్తువు: it (అది). ఒకరి కంటే ఎక్కువ: they (వాళ్ళు/అవి).'),
    photo('👦', L('Ravi is my friend. He likes cricket.', 'రవి నా స్నేహితుడు. అతనికి క్రికెట్ ఇష్టం.')),
    keys('boy, man → he', 'girl, woman → she', 'animal, thing → it', 'two or more → they'),
    tip('Ask: Is it a boy, a girl, a thing, or many?', 'అడుగు: అబ్బాయా, అమ్మాయా, వస్తువా, లేక చాలానా?'),
  ], [
    exb(['Sita is my sister. ___ is seven.', 'Sita is my sister. ___ is seven.'], [['Sita is a girl.', 'సీత ఒక అమ్మాయి.']], ['She', 'She (ఆమె)']),
    exb(['The bears are hungry. ___ want porridge.', 'The bears are hungry. ___ want porridge.'], [['More than one bear.', 'ఒకటి కంటే ఎక్కువ ఎలుగులు.']], ['They', 'They (అవి)']),
  ], [
    fill('fill', ['boy → he · girl → she · thing/animal → it · many → they', 'అబ్బాయి → he · అమ్మాయి → she · వస్తువు/జంతువు → it · చాలా → they'], [
      ['Birbal is wise. ___ helps people.', 'He', ['She', 'It', 'They'], 'Birbal is a man → he.', 'బీర్బల్ పురుషుడు → he.'],
      ['Meena is my friend. ___ sings well.', 'She', ['He', 'It', 'They'], 'Meena is a girl → she.', 'మీనా అమ్మాయి → she.'],
      ['The cow is brown. ___ eats grass.', 'It', ['He', 'She', 'They'], 'A cow is an animal → it.', 'ఆవు జంతువు → it.'],
      ['Ravi and Kiran are brothers. ___ play together.', 'They', ['He', 'She', 'It'], 'Two people → they.', 'ఇద్దరు → they.'],
      ['My bag is new. ___ is blue.', 'It', ['She', 'He', 'They'], 'A bag is a thing → it.', 'సంచి వస్తువు → it.'],
      ['Grandmother tells stories. ___ is kind.', 'She', ['He', 'It', 'They'], 'Grandmother is a woman → she.', 'అమ్మమ్మ/నానమ్మ స్త్రీ → she.'],
      ['The birds are singing. ___ are happy.', 'They', ['It', 'He', 'She'], 'Many birds → they.', 'చాలా పక్షులు → they.'],
      ['Father is a farmer. ___ works in the field.', 'He', ['She', 'It', 'They'], 'Father is a man → he.', 'నాన్న పురుషుడు → he.'],
    ]),
    tapT('tap', ['Tap the words we can say "she" for', '"she" అని పిలవగలిగే వాటిని నొక్కు'], [
      ['mother', true], ['sister', true], ['grandmother', true], ['the girl', true], ['Meena', true], ['aunt', true],
      ['father', false], ['the cow', false], ['brother', false], ['the pencil', false],
    ], ['"She" is for a girl or a woman.', '"She" అమ్మాయి లేదా స్త్రీ కోసం.']),
  ]),
], 'Unit 8: our own Birbal-style story is used; the Reader\'s cheat story is not summarised — teacher should add questions on the Reader text.');

export const units: USpec[] = [u0, u1, u2, u3, u4, u5, u6, u7, u8];
